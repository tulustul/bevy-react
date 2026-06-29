//! The public Bevy plugin: wires the JS thread, channels, UI root, and hot
//! reload into a consumer's `App`.

use std::path::PathBuf;

use bevy::asset::embedded_asset;
use bevy::prelude::*;
use bevy_react_animations::{AnimationCommand, AnimationSet, ReactUiAnimationsPlugin};

use crate::filter::{FilterMaterial, FilterMaterialCache, init_filter_assets};

use crate::bridge::{JsBridge, OpReceiver, OutboundResource, OutboundSender};
use crate::event::ReactEventRegistry;
use crate::host::{self, HostConfig, HostSenders};
use crate::message::{ReactMessage, ReactRegistry};
use crate::protocol::Op;
use crate::reconcile::{
    OpApplyStats, apply_interaction_styles, apply_js_ops, apply_pending_selections,
    apply_surface_interaction_styles, collect_pointer_events, collect_scroll_events,
    collect_surface_clicks, collect_surface_pointer_events, collect_ui_events, on_focus_gained,
    on_focus_lost, on_text_edit_change, sync_editable_a11y,
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
/// app when the bundle changes on disk.
pub struct ReactUiPlugin {
    bundle: PathBuf,
    hot_reload: bool,
    animations: bool,
    default_font: Option<PathBuf>,
    named_fonts: Vec<(String, PathBuf)>,
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
        }
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
}

impl Plugin for ReactUiPlugin {
    fn build(&self, app: &mut App) {
        // The `filter` style's shader, embedded so it ships with the crate (no
        // `assets/` folder needed by consumers). The `UiMaterialPlugin` registers
        // the `FilterMaterial` asset + render pipeline; `init_filter_assets`
        // creates the shared white pixel for solid-color filtered nodes. Gated on
        // a render pipeline being present (the canonical `DefaultPlugins`-first
        // setup), since `embedded_asset!`/`UiMaterialPlugin` need the asset + render
        // infrastructure — a headless `App` with neither (e.g. wiring-only tests)
        // simply skips it.
        if app.is_plugin_added::<bevy::render::RenderPlugin>() {
            embedded_asset!(app, "filter.wgsl");
            app.add_plugins(UiMaterialPlugin::<FilterMaterial>::default())
                .init_resource::<FilterMaterialCache>()
                .add_systems(Startup, init_filter_assets);
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
                emit: emit_tx,
                request: request_tx,
                anim: anim_tx,
            },
        );

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
        })
        .init_resource::<ReactRegistry>()
        .init_resource::<ReactRequestRegistry>()
        .init_resource::<ReactEventRegistry>()
        .init_resource::<PointerCapture>()
        .init_resource::<OpApplyStats>()
        .init_resource::<crate::ui_map::AtlasLayoutCache>()
        .init_resource::<Fonts>()
        // The offscreen render-target ("portal") registry and its shared blank
        // placeholder texture, created before the first portal can mount.
        .init_resource::<bevy_react_portal::RenderTargets>()
        .add_systems(Startup, bevy_react_portal::init_portal_placeholder)
        // The `<surface>` registry (UI subtrees rendered into offscreen textures)
        // and its single virtual pointer for in-world clicks.
        .init_resource::<bevy_react_surface::Surfaces>()
        .add_systems(Startup, bevy_react_surface::init_surface_pointer)
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
            bevy_react_surface::drive_surface_pointer
                .before(bevy::picking::PickingSystems::ProcessInput),
        )
        .add_systems(
            Update,
            (
                apply_js_ops,
                collect_ui_events,
                collect_pointer_events.in_set(PointerCaptureSet),
                // Wheel-scroll any `overflow: scroll` node under the cursor. In the
                // same set, after `collect_pointer_events`, so it ORs into this
                // frame's `PointerCapture::over_ui` before world systems (ordered
                // `.after(PointerCaptureSet)`) read it.
                crate::scroll::apply_scroll
                    .in_set(PointerCaptureSet)
                    .after(collect_pointer_events),
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
                // Repaint `<canvas>` textures after their surfaces/sizes update.
                bevy_react_canvas::update_canvas_surfaces.after(apply_js_ops),
                // Bind `<portal>` nodes to their render-target textures after the
                // op drain (so a freshly-spawned portal binds the same frame), then
                // drive resolution + the snapshot camera lifecycle.
                bevy_react_portal::bind_portals.after(apply_js_ops),
                bevy_react_portal::drive_render_targets.after(bevy_react_portal::bind_portals),
                // Bind `<surface>` roots to their offscreen UI cameras after the op
                // drain (so a freshly-mounted surface binds the same frame), then
                // drive the snapshot camera lifecycle.
                bevy_react_surface::bind_surfaces.after(apply_js_ops),
                bevy_react_surface::drive_surfaces.after(bevy_react_surface::bind_surfaces),
                // Surface interaction: turn the virtual pointer's picking events on
                // the offscreen subtree into `onClick`/`onPointer*` + hover/press
                // styling. The picking events are produced in `PreUpdate`, so these
                // read this frame's events.
                collect_surface_clicks,
                collect_surface_pointer_events,
                apply_surface_interaction_styles,
            ),
        );

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
                .configure_sets(Update, AnimationSet::Apply.after(apply_js_ops));
        }
    }
}

/// Marker for the UI root entity (reconciler node id 0 / `ROOT_ID`).
#[derive(Component)]
struct UiRoot;

/// Plugin configuration read by the startup system.
#[derive(Resource)]
struct ReactUiConfig {
    default_font: Option<PathBuf>,
    named_fonts: Vec<(String, PathBuf)>,
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

    // The root container: a full-window flex column the reconciler appends
    // top-level children into (it is reconciler node id 0). Children stack from
    // the top, horizontally centered.
    // TODO(review): the whole design is single-root / single-isolate / single op stream
    // (node id 0 is the one root). There's no path to multiple independent React surfaces,
    // multiple windows, or per-camera UI without protocol rework — call this out as a
    // deliberate constraint while it's still cheap to revisit.
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
