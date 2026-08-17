//! The public Bevy plugin: wires the JS thread, channels, UI root, and hot
//! reload into a consumer's `App`.

use std::path::PathBuf;

use crate::animations::{
    AnimationCommand, AnimationSet, AnimationSettled, ReactUiAnimationsPlugin,
};
use bevy::asset::embedded_asset;
use bevy::prelude::*;
use bevy::window::CustomCursorImage;

use crate::bridge::{JsBridge, OpReceiver, OutboundResource, OutboundSender};
use crate::event::ReactEventRegistry;
use crate::host::{self, HostConfig, HostSenders};
use crate::message::{ReactAppExt, ReactMessage, ReactRegistry};
use crate::protocol::{op::Op, outbound::Outbound};
use crate::reconcile::{
    OpApplyStats, apply_interaction_styles, apply_js_ops, apply_pending_selections,
    apply_surface_interaction_styles, collect_canvas_resize_events, collect_hover_events,
    collect_pointer_events, collect_scroll_events, collect_surface_clicks,
    collect_surface_hover_events, collect_surface_pointer_events, collect_ui_events,
    on_focus_gained, on_focus_lost, on_text_edit_change, sync_editable_a11y,
};
use crate::request::{RawRequest, ReactRequestRegistry, RequestReceiver, dispatch_react_requests};

/// Whether the React UI currently owns the mouse pointer. Refreshed every frame
/// in [`PointerCaptureSet`]; world-input systems (a 3D camera controller, picking,
/// …) should consult it and ignore the mouse when it reports captured, so a UI
/// drag or click doesn't also drive the scene.
///
/// Order such a system after the set to read the current frame's state:
/// ```no_run
/// # use bevy::prelude::*;
/// # use bevy_react::PointerCaptureSet;
/// # fn orbit_camera() {}
/// # let mut app = App::new();
/// app.add_systems(Update, orbit_camera.after(PointerCaptureSet));
/// ```
#[derive(Resource, Default, Debug, Clone, Copy)]
pub struct PointerCapture {
    /// A bevy-react element is being dragged (an `onPointer*` press is in
    /// progress). Stays true for the whole gesture — even after the cursor leaves
    /// the element's bounds — until the button is released.
    pub dragging: bool,
    /// The pointer is over an interactive UI element (its `Interaction` is
    /// `Hovered` or `Pressed`).
    pub over_ui: bool,
    /// The UI consumed this frame's wheel input: a scroll container actually
    /// moved, an `onWheel` listener claimed the delta, or an overlay (devtools
    /// pick mode) owns the pointer. Unlike `over_ui`, merely hovering
    /// interactive UI does not set this — a world wheel-consumer (a zoom
    /// camera) can gate on it alone to keep zooming over pass-through elements.
    pub wheel_captured: bool,
}

impl PointerCapture {
    /// The UI owns the current pointer input; world systems should ignore the
    /// mouse. True while dragging a UI element, while over interactive UI, or
    /// when the UI consumed this frame's wheel. Coarse by design — consumers
    /// wanting finer behavior (e.g. a camera that zooms over pass-through UI)
    /// read the individual fields instead.
    pub fn is_captured(&self) -> bool {
        self.dragging || self.over_ui || self.wheel_captured
    }
}

/// System set in which [`PointerCapture`] is refreshed each frame. Order your
/// world-input systems `.after(PointerCaptureSet)` so they see this frame's state.
#[derive(SystemSet, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct PointerCaptureSet;

/// Adds a React-driven `bevy_ui` layer to a Bevy `App`.
///
/// Point it at a built JS bundle (see the `bevy-react` npm package). The plugin
/// spawns the dedicated JS thread, applies the reconciler's ops to the ECS,
/// reports interactions back to React, and — unless disabled — hot reloads the
/// app when the bundle changes on disk. In dev builds it also enables the
/// devtools inspector (toggled with `F12`; see [`Self::devtools`]).
///
/// Requires Bevy's `AssetPlugin` (satisfied by `DefaultPlugins`): `build`
/// registers the [`SvgDocument`](crate::svg::SvgDocument) asset + loader, so a
/// headless/minimal app must add `AssetPlugin` (plus its task-pool
/// prerequisites, e.g. via `MinimalPlugins`) before this plugin.
pub struct ReactUiPlugin {
    bundle: PathBuf,
    hot_reload: bool,
    animations: bool,
    default_font: Option<PathBuf>,
    named_fonts: Vec<(String, PathBuf)>,
    custom_cursors: Vec<(String, PathBuf, (u16, u16))>,
    #[cfg(feature = "devtools")]
    devtools: crate::devtools::DevtoolsConfig,
}

impl ReactUiPlugin {
    /// Create the plugin for the given built app bundle (`app.js`). The build
    /// emits a `vendor.js` beside it (react + the bevy-react runtime, loaded once);
    /// both must exist. Hot reload (React Fast Refresh — edits preserve component
    /// state) and the Reanimated-style animations engine are enabled by default.
    ///
    /// The plugin does **not** spawn a camera — `bevy_ui` needs one to render, so
    /// your app must provide it (a `Camera2d`, or any camera that renders UI).
    pub fn new(bundle: impl Into<PathBuf>) -> Self {
        Self {
            bundle: bundle.into(),
            hot_reload: true,
            animations: true,
            default_font: None,
            named_fonts: Vec::new(),
            custom_cursors: Vec::new(),
            #[cfg(feature = "devtools")]
            devtools: Default::default(),
        }
    }

    /// Configure the devtools inspector, on by default in dev builds (release
    /// builds never run it, even when compiled in). Every
    /// [`DevtoolsConfig`](crate::DevtoolsConfig) field has a default, so
    /// override only what you need:
    ///
    /// ```no_run
    /// # use bevy::prelude::*;
    /// # use bevy_react::{DevtoolsConfig, ReactUiPlugin};
    /// # let mut app = App::new();
    /// app.add_plugins(ReactUiPlugin::new("ui/dist/app.js").devtools(DevtoolsConfig {
    ///     toggle_key: KeyCode::F1,
    ///     settings_path: Some(".config/devtools.json".into()),
    ///     ..default()
    /// }));
    /// // or disable devtools entirely
    /// app.add_plugins(ReactUiPlugin::new("ui/dist/app.js").devtools(DevtoolsConfig {
    ///     enabled: false,
    ///     ..default()
    /// }));
    /// ```
    #[cfg(feature = "devtools")]
    pub fn devtools(mut self, config: crate::devtools::DevtoolsConfig) -> Self {
        self.devtools = config;
        self
    }

    /// Enable/disable watching the bundle and hot reloading on change.
    pub fn hot_reload(mut self, yes: bool) -> Self {
        self.hot_reload = yes;
        self
    }

    /// Enable/disable the bundled [`ReactUiAnimationsPlugin`] (the `Animated.node`
    /// / shared-value engine). On by default; disable to drop it entirely — the
    /// `op_animate` op stays registered but its commands are discarded.
    pub fn with_animations(mut self, yes: bool) -> Self {
        self.animations = yes;
        self
    }

    /// Set the app-wide default font, loaded via the `AssetServer` (path relative
    /// to your `AssetPlugin.file_path`, e.g. `"fonts/Roboto.ttf"`). Every `<text>`
    /// run uses it unless its style names another family via [`Self::font`].
    pub fn default_font(mut self, path: impl Into<PathBuf>) -> Self {
        self.default_font = Some(path.into());
        self
    }

    /// Register a named font family. React selects it per element with
    /// `style={{ fontFamily: name }}`; the path is loaded via the `AssetServer`
    /// (relative to your `AssetPlugin.file_path`).
    pub fn font(mut self, name: impl Into<String>, path: impl Into<PathBuf>) -> Self {
        self.named_fonts.push((name.into(), path.into()));
        self
    }

    /// Register a named custom **image** cursor. React selects it per element with
    /// `style={{ cursor: name }}` (any name that isn't a built-in cursor keyword);
    /// the image at `path` is loaded via the `AssetServer` (relative to your
    /// `AssetPlugin.file_path`), and `hotspot` is the click-point pixel (top-left
    /// origin) within it. The cursor analogue of [`Self::font`].
    pub fn cursor(
        mut self,
        name: impl Into<String>,
        path: impl Into<PathBuf>,
        hotspot: (u16, u16),
    ) -> Self {
        self.custom_cursors
            .push((name.into(), path.into(), hotspot));
        self
    }
}

/// Register the layer/filter shader assets: the importable filter-pass
/// prelude (`#import bevy_react::filter`, see `layer/filter_prelude.wgsl`)
/// plus the embedded pass shaders. `load_shader_library!` both embeds the
/// prelude and loads it as a `Shader`, which registers its
/// `#define_import_path` with the shader composer.
///
/// Split out of [`Plugin::build`]'s render-gated block so asset-capable tests
/// (see `filters/test_util.rs`) can register the shaders without the render
/// sub-app; callers must have `AssetPlugin` and the `Shader` asset set up.
///
/// Each shader lives next to its loading code — the built-in pass shaders
/// beside `filters/builtin`'s `ReactFilter::shader` impls, the prelude and
/// composite beside `layer/render.rs`'s pipelines — and the embedded paths
/// mirror that layout (this macro roots them at THIS file's directory).
pub(crate) fn register_layer_shader_assets(app: &mut App) {
    bevy::shader::load_shader_library!(app, "layer/filter_prelude.wgsl");
    embedded_asset!(app, "layer/composite.wgsl");
    embedded_asset!(app, "layer/render/mip_blit.wgsl");
    embedded_asset!(app, "layer/render/backdrop_blit.wgsl");
    embedded_asset!(app, "filters/builtin/color_matrix.wgsl");
    embedded_asset!(app, "filters/builtin/blur.wgsl");
    embedded_asset!(app, "filters/builtin/bloom.wgsl");
    embedded_asset!(app, "filters/builtin/chromatic_aberration.wgsl");
    embedded_asset!(app, "filters/builtin/gradient_map.wgsl");
    embedded_asset!(app, "filters/builtin/outline.wgsl");
    embedded_asset!(app, "filters/builtin/shadow.wgsl");
    embedded_asset!(app, "filters/builtin/crossfade.wgsl");
    embedded_asset!(app, "filters/builtin/linear_wipe.wgsl");
    embedded_asset!(app, "filters/builtin/pixelize.wgsl");
}

impl Plugin for ReactUiPlugin {
    fn build(&self, app: &mut App) {
        // Render-side wiring, gated on a render pipeline being present (the
        // canonical `DefaultPlugins`-first setup), since `embedded_asset!` and the
        // render sub-app need the asset + render infrastructure — a headless `App`
        // with neither (e.g. wiring-only tests) simply skips it.
        if app.is_plugin_added::<bevy::render::RenderPlugin>() {
            // Layer compositing (see `crate::layer::render`): the capture
            // pass + composite quad over stock `bevy_ui_render`, public
            // seams only. Steal window: after Queue, before the stock sort;
            // prepare after the stock prepares' PrepareBindGroups slot is
            // irrelevant (disjoint items).
            register_layer_shader_assets(app);
            if let Some(render_app) = app.get_sub_app_mut(bevy::render::RenderApp) {
                use crate::layer::render as lr;
                use bevy::core_pipeline::schedule::{Core2d, Core2dSystems, Core3d, Core3dSystems};
                use bevy::render::render_phase::{AddRenderCommand, sort_phase_system};
                use bevy::render::render_resource::SpecializedRenderPipelines;
                use bevy::render::{
                    ExtractSchedule, GpuResourceAppExt, Render, RenderStartup, RenderSystems,
                };
                use bevy::ui_render::{
                    RenderUiSystems, TransparentUi, extract_ui_camera_view, ui_pass,
                };

                render_app
                    .init_resource::<lr::ExtractedUiLayers>()
                    .init_resource::<lr::LayerAtlases>()
                    .init_resource::<lr::LayerTextureStore>()
                    .init_gpu_resource::<SpecializedRenderPipelines<lr::LayerCompositePipeline>>()
                    .init_gpu_resource::<lr::LayerCompositeMeta>()
                    .init_gpu_resource::<lr::transform3d::CompositeUniformsMeta>()
                    .init_gpu_resource::<SpecializedRenderPipelines<lr::LayerFilterPipeline>>()
                    .init_gpu_resource::<lr::LayerFilterMeta>()
                    .init_gpu_resource::<SpecializedRenderPipelines<lr::mips::LayerBlitPipeline>>()
                    .init_gpu_resource::<lr::mips::LayerMipMeta>()
                    .init_gpu_resource::<SpecializedRenderPipelines<lr::backdrop::BackdropBlitPipeline>>()
                    .init_gpu_resource::<lr::backdrop::BackdropMeta>()
                    .init_gpu_resource::<lr::morph::MorphMeta>()
                    .add_render_command::<TransparentUi, lr::DrawLayerComposite>()
                    .add_systems(
                        RenderStartup,
                        (
                            lr::init_layer_composite_pipeline,
                            lr::init_layer_filter_pipeline,
                            lr::mips::init_layer_blit_pipeline,
                            lr::backdrop::init_backdrop_blit_pipeline,
                        ),
                    )
                    .init_resource::<lr::clip::SwappedClips>()
                    .add_systems(
                        ExtractSchedule,
                        (
                            lr::extract_ui_layers.after(extract_ui_camera_view),
                            // The extract-window clip swap: members'
                            // CalculatedClip carries INTERIOR clips for
                            // exactly the span of the stock UI extraction
                            // sets (the main world is exclusively borrowed
                            // here, so nothing main-world can observe it).
                            // Explicitly bracket every RenderUiSystems set —
                            // there is no umbrella set to hang onto.
                            lr::clip::swap_interior_clips_in
                                .before(RenderUiSystems::ExtractCameraViews)
                                .before(RenderUiSystems::ExtractBoxShadows)
                                .before(RenderUiSystems::ExtractBackgrounds)
                                .before(RenderUiSystems::ExtractImages)
                                .before(RenderUiSystems::ExtractTextureSlice)
                                .before(RenderUiSystems::ExtractBorders)
                                .before(RenderUiSystems::ExtractViewportNodes)
                                .before(RenderUiSystems::ExtractTextBackgrounds)
                                .before(RenderUiSystems::ExtractTextShadows)
                                .before(RenderUiSystems::ExtractText)
                                .before(RenderUiSystems::ExtractCursor)
                                .before(RenderUiSystems::ExtractDebug)
                                .before(RenderUiSystems::ExtractGradient),
                            lr::clip::swap_interior_clips_out
                                .after(RenderUiSystems::ExtractCameraViews)
                                .after(RenderUiSystems::ExtractBoxShadows)
                                .after(RenderUiSystems::ExtractBackgrounds)
                                .after(RenderUiSystems::ExtractImages)
                                .after(RenderUiSystems::ExtractTextureSlice)
                                .after(RenderUiSystems::ExtractBorders)
                                .after(RenderUiSystems::ExtractViewportNodes)
                                .after(RenderUiSystems::ExtractTextBackgrounds)
                                .after(RenderUiSystems::ExtractTextShadows)
                                .after(RenderUiSystems::ExtractText)
                                .after(RenderUiSystems::ExtractCursor)
                                .after(RenderUiSystems::ExtractDebug)
                                .after(RenderUiSystems::ExtractGradient),
                        ),
                    )
                    .add_systems(
                        Render,
                        (
                            lr::redistribute_ui_layers
                                .in_set(RenderSystems::PhaseSort)
                                .before(sort_phase_system::<TransparentUi>),
                            lr::prepare_layer_textures.in_set(RenderSystems::PrepareResources),
                            // Morph staging: the blend pass over the frozen
                            // snapshot + live capture. Before the filter
                            // staging — a regular chain on a morphing layer
                            // sources the blend and its validity prediction
                            // reads `MorphSlot::output_valid`.
                            lr::morph::prepare_layer_morphs
                                .in_set(RenderSystems::PrepareBindGroups)
                                .after(lr::prepare_layer_textures)
                                .before(lr::prepare_layer_filters)
                                .before(lr::prepare_layer_composites),
                            // Filter staging: allocates/specializes everything
                            // a filter pass needs; `ui_layer_capture_pass`
                            // replays the staged runs after each layer's
                            // capture.
                            lr::prepare_layer_filters
                                .in_set(RenderSystems::PrepareBindGroups)
                                .after(lr::prepare_layer_textures)
                                .before(lr::prepare_layer_composites),
                            // Backdrop staging: snapshot blit + a second
                            // filter run per backdrop layer; the composite
                            // gate reads its `output_valid`.
                            lr::backdrop::prepare_layer_backdrops
                                .in_set(RenderSystems::PrepareBindGroups)
                                .after(lr::prepare_layer_textures)
                                .before(lr::prepare_layer_composites),
                            // Mip staging: after filters (`output_valid` /
                            // `output_index` decided — mips build on the
                            // filter output), before composites (its
                            // bind-group choice reads `mips_valid`).
                            lr::mips::prepare_layer_mips
                                .in_set(RenderSystems::PrepareBindGroups)
                                .after(lr::prepare_layer_filters)
                                .before(lr::prepare_layer_composites),
                            lr::prepare_layer_composites.in_set(RenderSystems::PrepareBindGroups),
                        ),
                    )
                    .add_systems(
                        Core2d,
                        lr::ui_layer_capture_pass
                            .after(Core2dSystems::PostProcess)
                            .before(ui_pass),
                    )
                    .add_systems(
                        Core3d,
                        lr::ui_layer_capture_pass
                            .after(Core3dSystems::PostProcess)
                            .before(ui_pass),
                    );
            }
        }

        // Channels: op batches, app messages, requests, and animation commands flow
        // JS -> Bevy (crossbeam, same on every target). The Bevy -> JS direction (a
        // single `Outbound` stream plus, on native, reload signals) is owned by the
        // target's host, which returns its sender below.
        // TODO(review): all of these are UNBOUNDED — there's no backpressure. A system that
        // `events.send`s every frame while the JS side consumes slowly (or not at all) grows
        // the outbound queue without bound. Consider bounded channels with an explicit
        // drop/coalesce policy before this is "production".
        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        // Side channel of per-batch send instants (see `FlushStamps`): feeds the
        // devtools "pre-apply" timing leg. Stays empty on web (no `Instant`).
        let (flush_stamps_tx, flush_stamps_rx) =
            crossbeam_channel::unbounded::<std::time::Instant>();
        // Side channel of per-batch devtools-origin flags (see `FlushFlags`):
        // lets applies be attributed to the panel vs the app on every target.
        let (flush_devtools_tx, flush_devtools_rx) = crossbeam_channel::unbounded::<bool>();
        let (emit_tx, emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
        let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
        let (anim_tx, anim_rx) = crossbeam_channel::unbounded::<AnimationCommand>();

        // Spawn/install the target's JS host: native runs an embedded V8 isolate on
        // a dedicated thread (fed from disk, with hot reload); web runs React in the
        // browser's own engine. The host owns the Bevy->JS transport and returns the
        // sender every outbound producer writes to. It starts before `setup` builds
        // the root, so the first ops simply queue until then.
        let outbound_tx = host::spawn(
            app,
            HostConfig {
                bundle: self.bundle.clone(),
                hot_reload: self.hot_reload,
            },
            HostSenders {
                ops: ops_tx,
                flush_stamps: flush_stamps_tx,
                flush_devtools: flush_devtools_tx,
                emit: emit_tx,
                request: request_tx,
                anim: anim_tx,
            },
        );
        app.insert_resource(crate::reconcile::FlushStamps(flush_stamps_rx));
        app.insert_resource(crate::reconcile::FlushFlags(flush_devtools_rx));

        app.insert_resource(BridgeChannels {
            ops_rx: Some(ops_rx),
            outbound_tx: outbound_tx.clone(),
        })
        // A standalone outbound handle for the request dispatcher and the
        // `ReactEvents` param, available before `setup` builds `JsBridge`.
        .insert_resource(OutboundResource(outbound_tx))
        .insert_resource(EmitReceiver(emit_rx))
        .insert_resource(RequestReceiver(request_rx))
        .insert_resource(ReactUiConfig {
            default_font: self.default_font.clone(),
            named_fonts: self.named_fonts.clone(),
            custom_cursors: self.custom_cursors.clone(),
        })
        .init_resource::<ReactRegistry>()
        .init_resource::<ReactRequestRegistry>()
        .init_resource::<ReactEventRegistry>()
        .init_resource::<PointerCapture>()
        .init_resource::<OpApplyStats>()
        // Unconditional so wasm compiles; it just stays `None` there.
        .init_resource::<crate::reconcile::FrameStamp>()
        .init_resource::<crate::ui_map::AtlasLayoutCache>()
        .init_resource::<crate::scrollbar::ScrollbarTracks>()
        .init_resource::<Fonts>()
        .init_resource::<crate::cursor::CustomCursors>()
        // SVG documents (`<image src="x.svg">`): parsed once per file into a
        // resolution-independent asset, rasterized per node at laid-out size.
        .init_asset::<crate::svg::SvgDocument>()
        .register_asset_loader(crate::svg::SvgAssetLoader)
        // Per-pointer refined svg shape hits — the picking refinement's
        // handoff to the Interaction/event synthesis.
        .init_resource::<crate::svg::pick::SvgPointerShapeHits>()
        // The offscreen render-target ("portal") registry and its shared blank
        // placeholder texture, created before the first portal can mount.
        .init_resource::<crate::portal::RenderTargets>()
        .add_systems(Startup, crate::portal::init_portal_placeholder)
        // The `<surface>` registry (UI subtrees rendered into offscreen textures)
        // and its single virtual pointer for in-world clicks.
        .init_resource::<crate::surface::Surfaces>()
        .add_systems(Startup, crate::surface::init_surface_pointer)
        .add_systems(Startup, crate::layer::pick3d::init_transform3d_pointer)
        .add_systems(Startup, setup)
        .add_systems(
            PreUpdate,
            (dispatch_react_messages, dispatch_react_requests),
        )
        // Drive the surface virtual pointer (cursor → mesh UV → image render
        // target) before `bevy_picking` processes inputs, so the offscreen UI is
        // hit-tested with this frame's cursor.
        .add_systems(
            PreUpdate,
            crate::surface::drive_surface_pointer
                .before(bevy::picking::PickingSystems::ProcessInput),
        )
        // Remap the window cursor into 3D-transformed layers (inverse
        // homography → virtual pointer) before input processing, like the
        // surface driver. Reads last frame's matrices — the composite quad
        // the user sees is last frame's too, so picking matches the visual.
        .add_systems(
            PreUpdate,
            crate::layer::pick3d::drive_transform3d_pointer
                .before(bevy::picking::PickingSystems::ProcessInput),
        )
        // Re-filter picking hits against the render-grade inherited clip
        // (`CalculatedClip`) — bevy_ui 0.19's own clip check misses hits on
        // scrolled/clipped-away nodes whose direct parent doesn't clip (see
        // `pick_clip` module docs). Between the backends and the hover-map
        // update, so every downstream consumer sees only visible hits.
        .add_systems(
            PreUpdate,
            crate::pick_clip::filter_clipped_pointer_hits
                .after(bevy::picking::PickingSystems::Backend)
                .before(bevy::picking::PickingSystems::Hover),
        )
        // Scope hits around the transformed-layer remap (stale layout rects
        // for the mouse, layer-membership for the virtual pointer) — after
        // the clip filter for a deterministic filter order.
        .add_systems(
            PreUpdate,
            crate::layer::pick3d::suppress_transformed_layer_hits
                .after(bevy::picking::PickingSystems::Backend)
                .after(crate::pick_clip::filter_clipped_pointer_hits)
                .before(bevy::picking::PickingSystems::Hover),
        )
        // Refine hits on JSX `<svg>` nodes into hits on the topmost painted
        // shape under the cursor (svg::pick module docs). Last of the three
        // hit rewriters — after the transform3d suppression: suppression must
        // settle first so a refinement only ever amplifies a SURVIVING svg-node
        // hit (refining a hit that suppression then strips would leave a
        // shape hit with no live node under it).
        .add_systems(
            PreUpdate,
            crate::svg::pick::refine_svg_pointer_hits
                .after(bevy::picking::PickingSystems::Backend)
                .after(crate::pick_clip::filter_clipped_pointer_hits)
                .after(crate::layer::pick3d::suppress_transformed_layer_hits)
                .before(bevy::picking::PickingSystems::Hover),
        )
        .add_systems(
            Update,
            (
                apply_js_ops,
                collect_ui_events,
                // Forward window-global keystrokes to React as built-in named
                // events (`onKeyDown`/`onKeyUp`). Node-independent: reads Bevy's
                // `KeyboardInput` messages directly, no reconciler state needed.
                crate::keyboard::collect_keyboard_events,
                // Emit `pointerEnter`/`pointerLeave` from `Interaction` transitions
                // (same signal as hover styling), for nodes with those handlers.
                collect_hover_events,
                collect_pointer_events.in_set(PointerCaptureSet),
                // Wheel-scroll any `overflow: scroll` node under the cursor, and
                // deliver raw wheel deltas to any `onWheel` node. Both in the same
                // set, after `collect_pointer_events`, so their `PointerCapture::over_ui`
                // claim survives (that system *assigns* `over_ui`) and world systems
                // (ordered `.after(PointerCaptureSet)`) see it. (A sub-tuple: the outer
                // tuple is at Bevy's arity limit.)
                (
                    crate::scroll::apply_scroll
                        .in_set(PointerCaptureSet)
                        .after(collect_pointer_events),
                    crate::scroll::collect_wheel_events
                        .in_set(PointerCaptureSet)
                        .after(collect_pointer_events),
                    // Hovering a scrollbar part claims the hover channel (the
                    // widget has `Hovered`, not `Interaction`, so a press on it
                    // would otherwise start a world grab); a thumb drag claims
                    // the pointer outright and snaps any eased scroll state. In the set,
                    // after `collect_pointer_events` so its `over_ui` claim survives.
                    crate::scrollbar::bridge_scrollbar_capture
                        .in_set(PointerCaptureSet)
                        .after(collect_pointer_events),
                ),
                // Ease `ScrollPosition` toward the target the controlled write
                // (`apply_js_ops`) and the wheel (`PointerCaptureSet`) set this frame.
                // Runs after both so it eases toward the freshest target.
                crate::transition::drive_scroll_transition
                    .after(apply_js_ops)
                    .after(PointerCaptureSet),
                // Report scroll-offset changes (wheel, controlled write, or an eased
                // frame) to JS for any node with an `onScroll` handler. After the ease
                // so it sees the moved offset; after the op drain so a controlled write
                // is already seeded into the dedup map (no echo).
                collect_scroll_events
                    .after(crate::transition::drive_scroll_transition)
                    .after(PointerCaptureSet)
                    .after(apply_js_ops),
                // After the op drain so this frame's `StyleVariants` writes are
                // visible; the ordering forces a command sync point first.
                apply_interaction_styles.after(apply_js_ops),
                // Ease `transform`/`opacity`/`backgroundColor` toward the target the
                // style appliers just wrote. After `apply_interaction_styles` (and
                // thus the op drain) so the eased value lands last and a coincident
                // re-render's snap never wins.
                crate::transition::drive_transitions.after(apply_interaction_styles),
                // World-anchored overlays reposition after the op drain so they
                // override this frame's static style, and after the animation
                // applier + transition driver: all three write `UiTransform`
                // (anchor owns `translation`), and without explicit edges the
                // winner is nondeterministic — the same ping-pong hazard as
                // `sync_shape_interactions` below. Anchor lands last so the
                // projected position deterministically wins.
                crate::anchor::position_anchored_nodes
                    .after(apply_js_ops)
                    .after(AnimationSet::Apply)
                    .after(crate::transition::drive_transitions),
                // Repaint `<canvas>` textures after their surfaces/sizes update,
                // and report layout resizes to JS (the surface just cleared — so
                // the app / the runtime's declarative replay redraws). Both read
                // last frame's `ComputedNode`. The cursor driver rides here too —
                // it also reads last frame's `ComputedNode` after the op drain
                // (freshly-stamped `NodeCursor`s visible), and this sub-tuple keeps
                // the outer tuple under Bevy's arity limit.
                (
                    crate::canvas::update_canvas_surfaces.after(apply_js_ops),
                    collect_canvas_resize_events.after(apply_js_ops),
                    // Repaint svg surfaces the same way — svg-mode `<image>`
                    // documents and JSX `<svg>` shape trees: reads last
                    // frame's `ComputedNode` after the op drain (fresh
                    // `SvgSurface`s AND the flushed queued `SvgShape`/child
                    // writes visible — the JSX dirt derivation needs them
                    // same-frame), rasters at laid-out size. Also after the
                    // animation appliers: their shape-attr stage writes driven
                    // `SvgShape` seeds, and the raster must read them the same
                    // frame or a driven animation paints one frame late
                    // (pinned by `driven_shape_attr_repaints_same_frame`).
                    // With animations disabled the set is empty and the edge
                    // is vacuous. Also after `drive_transitions`: the shape
                    // transition channel writes eased `SvgShape` attrs and the
                    // raster must paint them the SAME frame (pinned by
                    // `eased_shape_attr_repaints_same_frame`).
                    crate::svg::update_svg_surfaces
                        .after(apply_js_ops)
                        .after(AnimationSet::Apply)
                        .after(crate::transition::drive_transitions),
                    crate::cursor::drive_cursor_icon.after(apply_js_ops),
                    // Spawn/teardown the Bevy scrollbar widget over each
                    // `overflow: scroll` container that declared a `scrollbar`
                    // style, then place its track over the container's edge. Both
                    // after the op drain (fresh `ScrollbarConfig`s visible); place
                    // after sync so the tracks exist. Bevy's `ScrollbarPlugin`
                    // (in `DefaultPlugins`) drives the thumb in `PostUpdate`.
                    crate::scrollbar::sync_scrollbars.after(apply_js_ops),
                    crate::scrollbar::position_scrollbars
                        .after(apply_js_ops)
                        .after(crate::scrollbar::sync_scrollbars),
                    // Paint each bar in its hover/pressed/base state (reads Bevy's
                    // `Hovered` + `ScrollbarDragState`). After sync so the entities exist.
                    crate::scrollbar::style_scrollbar_states
                        .after(crate::scrollbar::sync_scrollbars),
                ),
                // Bind `<portal>` nodes to their render-target textures after the
                // op drain (so a freshly-spawned portal binds the same frame), then
                // drive resolution + the snapshot camera lifecycle.
                crate::portal::bind_portals.after(apply_js_ops),
                crate::portal::drive_render_targets.after(crate::portal::bind_portals),
                // Bind `<surface>` roots to their offscreen UI cameras after the op
                // drain (so a freshly-mounted surface binds the same frame), then
                // drive the snapshot camera lifecycle.
                crate::surface::bind_surfaces.after(apply_js_ops),
                crate::surface::drive_surfaces.after(crate::surface::bind_surfaces),
                // Surface interaction: turn the virtual pointer's picking events on
                // the offscreen subtree into `onClick`/`onPointer*` + hover/press
                // styling. The picking events are produced in `PreUpdate`, so these
                // read this frame's events.
                collect_surface_clicks,
                collect_surface_pointer_events,
                collect_surface_hover_events,
                apply_surface_interaction_styles,
            ),
        );

        // The built-in `filter` registry (blur + the color-matrix ops), beside
        // the other name-keyed registries above. Registration is
        // `AssetServer`-free — shaders load lazily inside each entry's resolve.
        crate::filters::register_builtin_filters(app);

        // The built-in `"resize"` event + `bevy.window.size()` request (see
        // `crate::window`). A separate `add_systems` call — the Update tuple
        // above is at Bevy's arity cap. `.after(apply_js_ops)` so the initial
        // size goes out the same frame the first batch applies.
        app.add_systems(
            Update,
            crate::window::send_resize_events.after(apply_js_ops),
        );

        // The built-in gamepad events (see `crate::gamepad`). A separate
        // `add_systems` call — the Update tuple above is at the arity cap.
        // `.after(apply_js_ops)` so the late-join announce goes out the same
        // frame the first batch applies. The `add_message` calls are idempotent
        // (`InputPlugin` registers both in real apps) and keep the collector's
        // and observers' params valid in headless `MinimalPlugins` apps.
        app.init_resource::<crate::gamepad::GamepadRegistry>();
        app.add_message::<bevy::input::gamepad::GamepadEvent>();
        app.add_message::<bevy::input::gamepad::GamepadConnectionEvent>();
        app.add_message::<bevy::input::gamepad::GamepadRumbleRequest>();
        app.add_systems(
            Update,
            crate::gamepad::collect_gamepad_events.after(apply_js_ops),
        );

        // `backgroundImage` runtime systems (see `crate::background_image`).
        // A separate `add_systems` call — the Update tuple above is at the
        // arity cap. Ordered after the op drain AND the interaction restyle
        // (both stamp `RBackgroundTexture` / insert `ImageNode`s; the explicit
        // edges also force the command syncs), so a freshly-styled node binds
        // and gets its DPI-corrected tile scale the same frame.
        app.add_systems(
            Update,
            (
                crate::background_image::bind_background_textures
                    .after(apply_js_ops)
                    .after(apply_interaction_styles),
                crate::background_image::sync_background_tile_scale
                    .after(apply_js_ops)
                    .after(apply_interaction_styles),
            ),
        );

        // Layer promotion (see `crate::layer`). Main-world state registers
        // unconditionally so headless wiring tests build; the render half is
        // gated above with the rest of the render-only setup. A separate
        // `add_systems` call — the Update tuple above is at the arity cap.
        // Ordering: after the op drain (fresh props/dirty marks; the explicit
        // constraint also forces a command sync so markers are visible), and
        // before every later alpha writer this frame — the interaction
        // restyle, transitions (ordered after it), and the animation appliers
        // — so they all see the final promotion state (no cross-stage
        // ping-pong).
        app.init_resource::<crate::layer::LayerMembership>();
        app.init_resource::<crate::layer::LayersRegistry>();
        app.init_resource::<crate::layer::LayerContentDirt>();
        app.init_resource::<crate::layer::LayerRepaintState>();
        app.init_resource::<crate::layer::clip::LayerClips>();
        app.add_systems(
            Update,
            (
                crate::layer::evaluate_layer_promotions
                    .after(apply_js_ops)
                    .before(apply_interaction_styles)
                    .before(AnimationSet::Apply),
                // Async `<image>` texture arrivals have no other write site the
                // layer cache could tap.
                crate::layer::watch_layer_image_assets,
                // Override `ui_focus_system`'s geometric (stale-rect) verdict
                // for members of visually-transformed layers with the virtual
                // pointer's, before styling/enter-leave/drag-position readers.
                crate::layer::pick3d::correct_transformed_interactions
                    .before(apply_interaction_styles)
                    .before(collect_hover_events)
                    .before(crate::reconcile::collect_pointer_events),
            ),
        );
        // Synthesize `Interaction`/`RelativeCursorPosition`/user-space cursor
        // for handler-bearing SVG shape children from the hover map + the
        // refined per-shape hits (`svg::interact` module docs) — shapes are
        // Node-less, so `ui_focus_system` never sees them. Same slot as
        // `correct_transformed_interactions` above: before styling,
        // enter/leave, and drag-position readers so they all see the
        // synthesized state — and AFTER `correct_transformed_interactions`
        // itself: for a handler-bearing shape inside a visually-transformed
        // layer both systems write the same `RelativeCursorPosition` (pick3d
        // writes `normalized: None` — shapes have no `ComputedNode`), and
        // without an explicit order the winner is nondeterministic and the
        // two writes ping-pong `Changed` every frame. The svg synthesis must
        // land last: it holds the refined user-space hit. A separate
        // `add_systems` call — the Update tuple above is at Bevy's arity cap.
        app.add_systems(
            Update,
            crate::svg::interact::sync_shape_interactions
                .after(crate::layer::pick3d::correct_transformed_interactions)
                .before(apply_interaction_styles)
                .before(collect_hover_events)
                .before(crate::reconcile::collect_pointer_events),
        );
        // Resolve each promoted root's wire `filter`, `backdropFilter`, and
        // `morphFilter` chains into packed render passes — the three
        // instances of `crate::filters::resolve_chains`. After the
        // interaction restyle — the last input writer this frame (and,
        // transitively, after the promotion evaluator, so
        // `Added<PromotedLayer>` is visible) — and before the
        // transition/animation appliers so filter-param writes land on an
        // already-resolved chain (the morph channel additionally reads its
        // resolved chain for retarget gating). Its own `add_systems` call —
        // the Update tuple above is at the arity cap.
        app.add_systems(
            Update,
            (
                crate::filters::resolve_chains::<
                    crate::filters::FilterInput,
                    crate::filters::ResolvedFilterChain,
                >,
                crate::filters::resolve_chains::<
                    crate::filters::BackdropInput,
                    crate::filters::ResolvedBackdropChain,
                >,
                crate::filters::resolve_chains::<
                    crate::filters::MorphInput,
                    crate::filters::ResolvedMorphChain,
                >,
            )
                .after(apply_interaction_styles)
                .before(crate::transition::drive_transitions)
                .before(AnimationSet::Apply),
        );
        // After bevy_ui layout so capture rects/membership are this frame's
        // geometry (extraction reads them the same frame, post-PostUpdate).
        app.add_systems(
            PostUpdate,
            (
                crate::layer::sync_layer_geometry.after(bevy::ui::UiSystems::Layout),
                // Membership + geometry hashes are this frame's, and bevy_ui's
                // text systems (PostLayout) have re-shaped — turn the frame's
                // dirt into per-layer repaint decisions for extraction.
                crate::layer::resolve_layer_repaints
                    .after(crate::layer::sync_layer_geometry)
                    .after(bevy::ui::UiSystems::PostLayout),
                // Derives each transformed layer's composite matrix from this
                // frame's layout; pushes composite-only dirt the resolver
                // drains, so it slots between geometry sync and the resolver.
                crate::layer::transform3d::sync_transform3d_matrices
                    .after(crate::layer::sync_layer_geometry)
                    .before(crate::layer::resolve_layer_repaints),
                // Interior/quad clip maps: needs this frame's membership
                // (sync_layer_geometry) and bevy_ui's final CalculatedClip
                // (PostLayout). Deliberately NOT feeding
                // resolve_layer_repaints — clip changes never dirty a
                // capture (scrolling must stay a cache hit).
                crate::layer::clip::sync_layer_clips
                    .after(crate::layer::sync_layer_geometry)
                    .after(bevy::ui::UiSystems::PostLayout),
                // Re-clamps deferred controlled-scroll requests (a pin to the
                // bottom in the same commit that grew the content) against
                // fresh geometry.
                crate::scroll::settle_controlled_scroll.after(bevy::ui::UiSystems::Layout),
            ),
        );
        // Re-stamp the svg intrinsic measure after `bevy_ui`'s
        // `update_image_content_size_system` (`UiSystems::Content`), which
        // clears the `ContentSize` of any non-`Auto` `ImageNode` that changed
        // this frame — every svg-mode prop rebuild re-inserts the `ImageNode`,
        // so without this the measure vanishes on each delta. Before `Layout`
        // so the re-stamp feeds the same frame's layout pass.
        app.add_systems(
            PostUpdate,
            crate::svg::stamp_svg_measures
                .after(bevy::ui::widget::update_image_content_size_system)
                .before(bevy::ui::UiSystems::Layout),
        );
        app.add_react_request_handler(crate::window::handle_window_size_request);

        // The built-in rumble messages (`bevy.gamepad.rumble` / `.stopRumble`,
        // see `crate::gamepad`): registers the payloads in `ReactRegistry` and
        // attaches the observers in one call each. `bevy.gamepad.getAll()` is
        // the pull companion to `gamepadConnected` for late-mounted components.
        app.add_react_handler(crate::gamepad::on_rumble);
        app.add_react_handler(crate::gamepad::on_stop_rumble);
        app.add_react_request_handler(crate::gamepad::handle_gamepad_get_all);

        // Frame-start stamp for the devtools frame-wait / pre-apply split
        // (native only — no usable `Instant::now` on wasm). `First`: before
        // any work the pre-apply leg should attribute.
        #[cfg(not(target_arch = "wasm32"))]
        app.add_systems(bevy::app::First, crate::reconcile::mark_frame_start);

        // `editableText` edits arrive as Bevy's `TextEditChange` trigger; an observer
        // turns real changes into `"change"` and selection moves into `"select"` UI
        // events. Two more observers bridge focus gain/loss to `"focus"`/`"blur"`.
        app.add_observer(on_text_edit_change);
        app.add_observer(on_focus_gained);
        app.add_observer(on_focus_lost);

        // Controlled-selection writes and the a11y value sync run after Bevy's
        // text-edit pass (`EditableTextSystems`) so they see this frame's applied
        // edits and resolve byte offsets against the current text.
        app.add_systems(
            PostUpdate,
            (apply_pending_selections, sync_editable_a11y).after(bevy::text::EditableTextSystems),
        );

        // The animations engine is a separate plugin (its crate can't depend on
        // this one). We add it and, as the only crate that sees both sides, order
        // its `Apply` set after `apply_js_ops` so per-frame animation writes win
        // over this frame's static style. Disabled → `anim_rx` drops here and
        // `op_animate` sends are discarded.
        if self.animations {
            app.add_plugins(ReactUiAnimationsPlugin::new(anim_rx))
                .configure_sets(Update, AnimationSet::Apply.after(apply_js_ops))
                // Completion callbacks: settlements the engine reports (once per
                // token-tagged driver, not per frame) go out to JS.
                .add_systems(Update, forward_animation_settled.after(AnimationSet::Tick));
        }

        // The devtools inspector rides along by default (see `Self::devtools`).
        // Registration is the only gate needed here: the plugin itself registers
        // nothing in `--release` builds.
        #[cfg(feature = "devtools")]
        if self.devtools.enabled {
            app.add_plugins(crate::devtools::DevtoolsPlugin::new(self.devtools.clone()));
        }
    }
}

/// Forward the animation engine's [`AnimationSettled`] messages to JS as
/// [`Outbound::AnimationFinished`], resolving each to its completion callback.
/// The engine crate can't depend on this one, so the bridging happens here.
fn forward_animation_settled(
    mut settled: MessageReader<AnimationSettled>,
    outbound: Res<OutboundResource>,
) {
    for s in settled.read() {
        let _ = outbound.0.send(Outbound::AnimationFinished {
            id: s.id,
            token: s.token,
            finished: s.finished,
        });
    }
}

/// Marker for the UI root entity (reconciler node id 0 / `ROOT_ID`).
/// `pub(crate)`: devtools' reserve-space mode insets this root's margins to
/// push the app UI aside while the panel is docked.
#[derive(Component)]
pub(crate) struct UiRoot;

/// Plugin configuration read by the startup system.
#[derive(Resource)]
struct ReactUiConfig {
    default_font: Option<PathBuf>,
    named_fonts: Vec<(String, PathBuf)>,
    custom_cursors: Vec<(String, PathBuf, (u16, u16))>,
}

/// Fonts loaded from the plugin config, resolved to handles at startup. The
/// default backs every `<text>` run; named entries are selected per element via
/// the `fontFamily` style prop. Empty (unconfigured) → Bevy's built-in font.
#[derive(Resource, Default)]
pub struct Fonts {
    pub default: Option<Handle<Font>>,
    pub named: std::collections::HashMap<String, Handle<Font>>,
}

/// Carries the Bevy-side channel ends from `build` into `setup`.
#[derive(Resource)]
struct BridgeChannels {
    ops_rx: Option<OpReceiver>,
    outbound_tx: OutboundSender,
}

/// Receives app messages emitted by the React app (`emit(name, value)`).
#[derive(Resource)]
struct EmitReceiver(crossbeam_channel::Receiver<ReactMessage>);

/// The single consumption point for React-emitted messages. Drains the channel
/// each frame and routes every message to its registered typed payload via
/// [`ReactRegistry`], triggering it for observers. Runs in `PreUpdate` so the
/// triggers land before consumer `Update` systems run the same frame.
fn dispatch_react_messages(
    rx: Res<EmitReceiver>,
    registry: Res<ReactRegistry>,
    mut commands: Commands,
) {
    while let Ok(msg) = rx.0.try_recv() {
        registry.dispatch(msg, &mut commands);
    }
}

fn setup(
    mut commands: Commands,
    mut channels: ResMut<BridgeChannels>,
    config: Res<ReactUiConfig>,
    assets: Res<AssetServer>,
) {
    // Load configured fonts into the `Fonts` resource before the first
    // `apply_js_ops` (Update) creates any text.
    commands.insert_resource(Fonts {
        default: config.default_font.as_ref().map(|p| assets.load(p.clone())),
        named: config
            .named_fonts
            .iter()
            .map(|(name, path)| (name.clone(), assets.load(path.clone())))
            .collect(),
    });
    // Likewise load configured custom image cursors into the registry `drive_cursor_icon`
    // resolves a `cursor` name against.
    commands.insert_resource(crate::cursor::CustomCursors(
        config
            .custom_cursors
            .iter()
            .map(|(name, path, hotspot)| {
                (
                    name.clone(),
                    CustomCursorImage {
                        handle: assets.load(path.clone()),
                        hotspot: *hotspot,
                        ..default()
                    },
                )
            })
            .collect(),
    ));

    // The root container: a full-window flex column the reconciler appends
    // top-level children into (it is reconciler node id 0). Children stack from
    // the top, horizontally centered.
    let root = commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                justify_content: JustifyContent::FlexStart,
                align_items: AlignItems::Center,
                row_gap: Val::Px(16.0),
                ..default()
            },
            // Layout scaffolding only: without an explicit `Pickable` the UI
            // picking backend treats the full-window root as a blocking hit,
            // which would make hover queries (`HoverMap`) report "over UI"
            // everywhere. Element nodes opt in per-`FocusPolicy` instead.
            bevy::picking::Pickable {
                should_block_lower: false,
                ..default()
            },
            UiRoot,
        ))
        .id();

    // The shared overlay container for world-anchored nodes (`<anchor>`).
    // `position_anchored_nodes` reparents every anchored overlay under this so it lives
    // in its own hierarchy and never inflates an app container's flex layout or
    // scrollable `content_size`. Zero-size at the window origin (absolute, left/top 0)
    // with default `Overflow::visible`, so it neither clips its children nor intercepts
    // pointer input; anchored nodes position themselves relative to its (0,0) corner.
    // Spawned as the root's first child so the app subtree (appended later via ops)
    // renders above it — add a `GlobalZIndex` here to lift overlays above app content.
    commands.spawn((
        Node {
            position_type: PositionType::Absolute,
            left: Val::Px(0.0),
            top: Val::Px(0.0),
            width: Val::Px(0.0),
            height: Val::Px(0.0),
            ..default()
        },
        crate::anchor::AnchorLayer,
        ChildOf(root),
    ));

    let ops_rx = channels.ops_rx.take().expect("setup runs once");
    commands.insert_resource(JsBridge::new(ops_rx, channels.outbound_tx.clone(), root));
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `is_captured` must cover every capture channel: a UI drag, hovering
    /// interactive UI, and a UI-consumed wheel each count as "the UI owns the
    /// pointer" for consumers that don't need finer grain.
    #[test]
    fn is_captured_covers_all_channels() {
        assert!(!PointerCapture::default().is_captured());
        assert!(
            PointerCapture {
                dragging: true,
                ..default()
            }
            .is_captured()
        );
        assert!(
            PointerCapture {
                over_ui: true,
                ..default()
            }
            .is_captured()
        );
        assert!(
            PointerCapture {
                wheel_captured: true,
                ..default()
            }
            .is_captured()
        );
    }
}
