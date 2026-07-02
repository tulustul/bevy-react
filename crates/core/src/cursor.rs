//! The `cursor` style prop: drives the window's mouse cursor from the node the
//! pointer is over.
//!
//! `bevy_ui` has no per-node cursor mechanism — `bevy_winit` only reads
//! [`CursorIcon`] from the window entity. So a node's `cursor` style is stamped
//! as a [`NodeCursor`] component (in [`crate::ui_map::apply_style_masked`]) and
//! [`drive_cursor_icon`] each frame picks the node under the pointer and writes the
//! chosen cursor onto the primary window's [`CursorIcon`].
//!
//! Two pointer worlds feed the one window cursor, folded into a single decision so
//! they never clobber each other:
//! - **Main-window UI**: a geometric hit-test over the `UiStack`, topmost first, no
//!   `Interaction` needed — so a plain `<node style={{ cursor }}>` works without
//!   opting into the pointer machinery. Mirrors [`crate::scroll::collect_wheel_events`].
//! - **`<surface>` UI**: an offscreen subtree hit-tested in the *texture's* space via
//!   the in-world virtual pointer, so the window hit-test can't see it. Instead we
//!   read the picking [`HoverMap`] for the [`SurfaceVirtualPointer`] — the same
//!   authoritative hover state surface hover styling rides — take its topmost node,
//!   and climb to the nearest cursor-bearing ancestor.
//!
//! Surface takes precedence: if the virtual pointer is over a surface cursor node,
//! that wins; otherwise the main-window hit-test decides; otherwise the default
//! arrow. Nodes without a `NodeCursor` are transparent to both scans, so a child
//! inherits its nearest cursor-bearing ancestor (CSS-like).

use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::PointerId;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform, UiStack};
use bevy::window::{CursorIcon, CustomCursor, CustomCursorImage, PrimaryWindow, SystemCursorIcon};
use bevy_react_surface::SurfaceVirtualPointer;

/// The cursor a node requests while the pointer is over it — the raw `cursor` style
/// name (a system keyword or a custom-cursor name), resolved at drive time by
/// [`resolve_cursor`]. Read by [`drive_cursor_icon`]; absent → the node contributes
/// no cursor.
#[derive(Component, Debug, Clone)]
pub struct NodeCursor(pub String);

/// Named custom image cursors, registered upfront via `ReactUiPlugin::cursor` and
/// loaded to handles in the plugin's `Startup` `setup` (mirroring the
/// [`Fonts`](crate::Fonts) registry). Keyed by the name React selects with
/// `style={{ cursor: name }}`; the app owns the asset, React references it by name.
#[derive(Resource, Default)]
pub struct CustomCursors(pub HashMap<String, CustomCursorImage>);

/// Resolve a `cursor` name to the [`CursorIcon`] to write on the window. The
/// [`CustomCursors`] registry is checked **first**, so a custom cursor registered under
/// a system-keyword name (e.g. `"pointer"`) *overrides* that built-in; otherwise the
/// name is matched against the system keywords, and finally an unknown name warns and
/// falls back to the default arrow (mirroring an unknown `fontFamily`).
fn resolve_cursor(name: &str, custom: &CustomCursors) -> CursorIcon {
    if let Some(image) = custom.0.get(name) {
        CursorIcon::Custom(CustomCursor::Image(image.clone()))
    } else if let Some(icon) = system_cursor_keyword(name) {
        CursorIcon::from(icon)
    } else {
        warn!(target: "bevy_react", "unknown cursor {name:?}; using the default");
        CursorIcon::from(SystemCursorIcon::Default)
    }
}

/// Map a CSS `cursor` keyword (camelCase or CSS kebab-case) to a built-in
/// [`SystemCursorIcon`], or `None` if the string is not a reserved keyword (→ an
/// unregistered custom name). The full winit set.
fn system_cursor_keyword(s: &str) -> Option<SystemCursorIcon> {
    use SystemCursorIcon::*;
    Some(match s {
        "default" | "auto" => Default,
        "contextMenu" | "context-menu" => ContextMenu,
        "help" => Help,
        "pointer" => Pointer,
        "progress" => Progress,
        "wait" => Wait,
        "cell" => Cell,
        "crosshair" => Crosshair,
        "text" => Text,
        "verticalText" | "vertical-text" => VerticalText,
        "alias" => Alias,
        "copy" => Copy,
        "move" => Move,
        "noDrop" | "no-drop" => NoDrop,
        "notAllowed" | "not-allowed" => NotAllowed,
        "grab" => Grab,
        "grabbing" => Grabbing,
        "eResize" | "e-resize" => EResize,
        "nResize" | "n-resize" => NResize,
        "neResize" | "ne-resize" => NeResize,
        "nwResize" | "nw-resize" => NwResize,
        "sResize" | "s-resize" => SResize,
        "seResize" | "se-resize" => SeResize,
        "swResize" | "sw-resize" => SwResize,
        "wResize" | "w-resize" => WResize,
        "ewResize" | "ew-resize" => EwResize,
        "nsResize" | "ns-resize" => NsResize,
        "neswResize" | "nesw-resize" => NeswResize,
        "nwseResize" | "nwse-resize" => NwseResize,
        "colResize" | "col-resize" => ColResize,
        "rowResize" | "row-resize" => RowResize,
        "allScroll" | "all-scroll" => AllScroll,
        "zoomIn" | "zoom-in" => ZoomIn,
        "zoomOut" | "zoom-out" => ZoomOut,
        _ => return None,
    })
}

/// Set the primary window's [`CursorIcon`] to the cursor of the node under the
/// pointer (main-window or `<surface>` UI). When the pointer is over no cursor-bearing
/// node, it falls back to the `"default"` cursor — which resolves like any other name,
/// so a custom cursor registered under `"default"` becomes the app-wide base cursor
/// (and with none registered, the system default arrow).
///
/// Writes only on change, so a steady hover doesn't re-trigger `bevy_winit`'s
/// `update_cursors` every frame. Runs after `apply_js_ops` so a freshly-stamped
/// `NodeCursor` and this frame's `ComputedNode` are visible.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn drive_cursor_icon(
    mut commands: Commands,
    windows: Query<(Entity, &Window, Option<&CursorIcon>), With<PrimaryWindow>>,
    ui_stack: Res<UiStack>,
    windowed: Query<(&ComputedNode, &UiGlobalTransform, &NodeCursor)>,
    hover_map: Option<Res<HoverMap>>,
    surface_pointer: Option<Res<SurfaceVirtualPointer>>,
    custom_cursors: Res<CustomCursors>,
    node_cursors: Query<&NodeCursor>,
    child_of: Query<&ChildOf>,
) {
    let Ok((window_entity, window, current)) = windows.single() else {
        return;
    };

    // Surface UI wins: the in-world virtual pointer is the only thing that knows the
    // pointer is over an offscreen subtree (the window hit-test can't — its geometry
    // is in texture space). Fall through to the main-window hit-test otherwise.
    let name = surface_pointer
        .as_deref()
        .zip(hover_map.as_deref())
        .and_then(|(pointer, hover_map)| {
            surface_cursor_for(pointer.id, hover_map, &node_cursors, &child_of)
        })
        .or_else(|| window_cursor(window, &ui_stack, &windowed));

    // No cursor-bearing node under the pointer → the app default. Routing it through
    // `resolve_cursor("default", …)` (rather than a hardcoded arrow) lets a custom
    // cursor registered as `"default"` become the app-wide base cursor.
    let desired = resolve_cursor(name.as_deref().unwrap_or("default"), &custom_cursors);
    if current != Some(&desired) {
        commands.entity(window_entity).insert(desired);
    }
}

/// The cursor of the topmost main-window `NodeCursor` node under the window pointer,
/// or `None` if the pointer is over none (or its position is unknown).
fn window_cursor(
    window: &Window,
    ui_stack: &UiStack,
    windowed: &Query<(&ComputedNode, &UiGlobalTransform, &NodeCursor)>,
) -> Option<String> {
    // `ComputedNode`/`UiGlobalTransform` are physical; the window cursor is logical
    // (see the note in `crate::scroll::apply_scroll`). Match them for the hit-test.
    let cursor = window.cursor_position()? * window.scale_factor();
    // `uinodes` is back-to-front, so reversed is topmost-first: the first
    // cursor-bearing node whose rect contains the pointer wins.
    ui_stack.uinodes.iter().rev().find_map(|&entity| {
        let (computed, transform, node_cursor) = windowed.get(entity).ok()?;
        computed
            .contains_point(*transform, cursor)
            .then(|| node_cursor.0.clone())
    })
}

/// The cursor of the topmost `<surface>` node under the virtual pointer, climbing to
/// the nearest cursor-bearing ancestor. `None` when the pointer is over no surface
/// node, or that node (and its ancestors) declare no cursor. Split from the system so
/// it can be unit-tested without constructing a [`SurfaceVirtualPointer`] (its fields
/// are crate-private to the surface crate).
fn surface_cursor_for(
    pointer_id: PointerId,
    hover_map: &HoverMap,
    node_cursors: &Query<&NodeCursor>,
    child_of: &Query<&ChildOf>,
) -> Option<String> {
    // Topmost hovered node = smallest picking depth (the UI backend assigns depth 0 to
    // the front-most node, increasing downward through the stack).
    let (&top, _) = hover_map
        .get(&pointer_id)?
        .iter()
        .min_by(|a, b| a.1.depth.total_cmp(&b.1.depth))?;
    let owner = crate::reconcile::climb(top, child_of, |e| node_cursors.contains(e))?;
    node_cursors.get(owner).ok().map(|c| c.0.clone())
}

#[cfg(test)]
mod tests {
    use super::*;
    use bevy::ecs::entity::EntityHashMap;
    use bevy::ecs::system::RunSystemOnce;
    use bevy::picking::backend::HitData;

    /// Spawn `n` overlapping 200×100 cursor nodes centered at (300, 200), stacked
    /// in the given order (last = topmost), run `drive_cursor_icon` for a pointer at
    /// `cursor`, and return the window's resulting `CursorIcon` (if any was written).
    fn run(cursor: Option<Vec2>, stack: &[&str]) -> Option<CursorIcon> {
        let mut world = World::new();

        let mut window = Window::default();
        window.set_physical_cursor_position(cursor.map(|c| c.as_dvec2()));
        let window_entity = world.spawn((window, PrimaryWindow)).id();

        let nodes: Vec<Entity> = stack
            .iter()
            .map(|&name| {
                world
                    .spawn((
                        ComputedNode {
                            size: Vec2::new(200.0, 100.0),
                            inverse_scale_factor: 1.0,
                            ..default()
                        },
                        UiGlobalTransform::from_translation(Vec2::new(300.0, 200.0)),
                        NodeCursor(name.to_string()),
                    ))
                    .id()
            })
            .collect();
        world.insert_resource(UiStack {
            uinodes: nodes,
            partition: Vec::new(),
        });
        world.init_resource::<CustomCursors>();

        world.run_system_once(drive_cursor_icon).unwrap();
        world.entity(window_entity).get::<CursorIcon>().cloned()
    }

    #[test]
    fn topmost_node_under_pointer_wins() {
        // Two overlapping nodes; the second (topmost) is `pointer` and claims the cursor.
        let icon = run(Some(Vec2::new(300.0, 200.0)), &["grab", "pointer"]);
        assert_eq!(icon, Some(CursorIcon::from(SystemCursorIcon::Pointer)));
    }

    #[test]
    fn single_node_sets_its_cursor() {
        let icon = run(Some(Vec2::new(300.0, 200.0)), &["text"]);
        assert_eq!(icon, Some(CursorIcon::from(SystemCursorIcon::Text)));
    }

    #[test]
    fn pointer_off_all_nodes_resets_to_default() {
        // In-window but outside the node's rect (x:200..400, y:150..250) → default arrow.
        let icon = run(Some(Vec2::new(50.0, 50.0)), &["pointer"]);
        assert_eq!(icon, Some(CursorIcon::from(SystemCursorIcon::Default)));
    }

    #[test]
    fn no_cursor_position_resets_to_default() {
        let icon = run(None, &["pointer"]);
        assert_eq!(icon, Some(CursorIcon::from(SystemCursorIcon::Default)));
    }

    /// A custom cursor registered under `"default"` becomes the app-wide base cursor:
    /// with no cursor-bearing node under the pointer, the window shows it (not the
    /// hardcoded system arrow).
    #[test]
    fn registered_default_becomes_app_cursor() {
        let mut world = World::new();
        let mut window = Window::default();
        window.set_physical_cursor_position(Some(Vec2::new(10.0, 10.0).as_dvec2()));
        let window_entity = world.spawn((window, PrimaryWindow)).id();
        // No nodes → nothing supplies a cursor, so the app default is used.
        world.insert_resource(UiStack {
            uinodes: Vec::new(),
            partition: Vec::new(),
        });

        let arrow = CustomCursorImage {
            handle: Handle::default(),
            hotspot: (0, 0),
            ..default()
        };
        let mut registry = CustomCursors::default();
        registry.0.insert("default".into(), arrow.clone());
        world.insert_resource(registry);

        world.run_system_once(drive_cursor_icon).unwrap();
        assert_eq!(
            world.entity(window_entity).get::<CursorIcon>().cloned(),
            Some(CursorIcon::Custom(CustomCursor::Image(arrow))),
        );
    }

    /// A surface leaf hovered by the virtual pointer inherits its ancestor's cursor
    /// (climb), and the topmost (smallest-depth) hovered node wins.
    #[test]
    fn surface_pointer_uses_hovered_node_cursor() {
        let mut world = World::new();
        // A `<button>`-like parent with a cursor; a childless leaf (e.g. its `<text>`)
        // with none. The virtual pointer hovers the leaf.
        let parent = world.spawn(NodeCursor("pointer".to_string())).id();
        let leaf = world.spawn(ChildOf(parent)).id();
        // A second, deeper node with a different cursor that must lose on depth.
        let behind = world.spawn(NodeCursor("grab".to_string())).id();

        let pointer_id = PointerId::Mouse;
        let mut hovered = EntityHashMap::default();
        hovered.insert(leaf, HitData::new(Entity::PLACEHOLDER, 0.0, None, None));
        hovered.insert(behind, HitData::new(Entity::PLACEHOLDER, 1.0, None, None));
        let mut hover_map = HoverMap::default();
        hover_map.insert(pointer_id, hovered);
        world.insert_resource(hover_map);

        let icon = world
            .run_system_once(
                move |hm: Res<HoverMap>, ncs: Query<&NodeCursor>, co: Query<&ChildOf>| {
                    surface_cursor_for(pointer_id, &hm, &ncs, &co)
                },
            )
            .unwrap();
        assert_eq!(icon.as_deref(), Some("pointer"));
    }

    /// A hovered surface node with no cursor on itself or any ancestor contributes
    /// nothing (so the main-window hit-test / default takes over).
    #[test]
    fn surface_pointer_without_cursor_yields_none() {
        let mut world = World::new();
        let bare = world.spawn_empty().id();
        let pointer_id = PointerId::Mouse;
        let mut hovered = EntityHashMap::default();
        hovered.insert(bare, HitData::new(Entity::PLACEHOLDER, 0.0, None, None));
        let mut hover_map = HoverMap::default();
        hover_map.insert(pointer_id, hovered);
        world.insert_resource(hover_map);

        let icon = world
            .run_system_once(
                move |hm: Res<HoverMap>, ncs: Query<&NodeCursor>, co: Query<&ChildOf>| {
                    surface_cursor_for(pointer_id, &hm, &ncs, &co)
                },
            )
            .unwrap();
        assert_eq!(icon, None);
    }

    /// Resolution order: the registry wins first (so a custom cursor named after a
    /// system keyword *overrides* it), then system keywords, then a warn + default.
    #[test]
    fn custom_cursor_overrides_and_resolves() {
        let mut registry = CustomCursors::default();
        let hand = CustomCursorImage {
            handle: Handle::default(),
            hotspot: (4, 2),
            ..default()
        };
        registry.0.insert("hand".into(), hand.clone());
        // Register a custom cursor under a SYSTEM keyword name to prove override.
        registry.0.insert("pointer".into(), hand.clone());

        // Registered custom name → custom.
        assert_eq!(
            resolve_cursor("hand", &registry),
            CursorIcon::Custom(CustomCursor::Image(hand.clone())),
        );
        // "pointer" is registered → the custom image overrides the system pointer.
        assert_eq!(
            resolve_cursor("pointer", &registry),
            CursorIcon::Custom(CustomCursor::Image(hand)),
        );
        // A system keyword that isn't registered → the built-in cursor.
        assert_eq!(
            resolve_cursor("text", &registry),
            CursorIcon::from(SystemCursorIcon::Text),
        );
        // Neither registered nor a keyword → warn + default arrow.
        assert_eq!(
            resolve_cursor("missing", &registry),
            CursorIcon::from(SystemCursorIcon::Default),
        );
    }
}
