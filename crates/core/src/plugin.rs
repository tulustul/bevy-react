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
use crate::protocol::{Op, Outbound};
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
}

impl PointerCapture {
    /// The UI owns the current pointer input; world systems should ignore the
    /// mouse. True while dragging a UI element or while over interactive UI.
    pub fn is_captured(&self) -> bool {
        self.dragging || self.over_ui
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
    embedded_asset!(app, "filters/builtin/color_matrix.wgsl");
    embedded_asset!(app, "filters/builtin/blur.wgsl");
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
                use bevy::ui_render::{TransparentUi, extract_ui_camera_view, ui_pass};

                render_app
                    .init_resource::<lr::ExtractedUiLayers>()
                    .init_resource::<lr::LayerAtlases>()
                    .init_resource::<lr::LayerTextureStore>()
                    .init_gpu_resource::<SpecializedRenderPipelines<lr::LayerCompositePipeline>>()
                    .init_gpu_resource::<lr::LayerCompositeMeta>()
                    .init_gpu_resource::<SpecializedRenderPipelines<lr::LayerFilterPipeline>>()
                    .init_gpu_resource::<lr::LayerFilterMeta>()
                    .add_render_command::<TransparentUi, lr::DrawLayerComposite>()
                    .add_systems(
                        RenderStartup,
                        (
                            lr::init_layer_composite_pipeline,
                            lr::init_layer_filter_pipeline,
                        ),
                    )
                    .add_systems(
                        ExtractSchedule,
                        lr::extract_ui_layers.after(extract_ui_camera_view),
                    )
                    .add_systems(
                        Render,
                        (
                            lr::redistribute_ui_layers
                                .in_set(RenderSystems::PhaseSort)
                                .before(sort_phase_system::<TransparentUi>),
                            lr::prepare_layer_textures.in_set(RenderSystems::PrepareResources),
                            // Filter staging: allocates/specializes everything
                            // a filter pass needs; `ui_layer_capture_pass`
                            // replays the staged runs after each layer's
                            // capture.
                            lr::prepare_layer_filters
                                .in_set(RenderSystems::PrepareBindGroups)
                                .after(lr::prepare_layer_textures)
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
        // The offscreen render-target ("portal") registry and its shared blank
        // placeholder texture, created before the first portal can mount.
        .init_resource::<crate::portal::RenderTargets>()
        .add_systems(Startup, crate::portal::init_portal_placeholder)
        // The `<surface>` registry (UI subtrees rendered into offscreen textures)
        // and its single virtual pointer for in-world clicks.
        .init_resource::<crate::surface::Surfaces>()
        .add_systems(Startup, crate::surface::init_surface_pointer)
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
                    // A scrollbar-thumb drag claims the pointer (so world input
                    // ignores it) and pins any eased scroll target. In the set,
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
                // override this frame's static `left`/`top`.
                crate::anchor::position_anchored_nodes.after(apply_js_ops),
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
            ),
        );
        // Resolve each promoted root's wire `filter` chain into packed render
        // passes (see `crate::filters::resolve_filter_chains`). After the
        // interaction restyle — the last `FilterInput` writer this frame (and,
        // transitively, after the promotion evaluator, so `Added<PromotedLayer>`
        // is visible) — and before the transition/animation appliers so future
        // filter-param animation writes onto an already-resolved chain. Its own
        // `add_systems` call — the Update tuple above is at the arity cap.
        app.add_systems(
            Update,
            crate::filters::resolve_filter_chains
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
                // Re-clamps deferred controlled-scroll requests (a pin to the
                // bottom in the same commit that grew the content) against
                // fresh geometry.
                crate::scroll::settle_controlled_scroll.after(bevy::ui::UiSystems::Layout),
            ),
        );
        app.add_react_request_handler(crate::window::handle_window_size_request);

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

    // The shared overlay container for world-anchored nodes (`Anchored.node`).
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
