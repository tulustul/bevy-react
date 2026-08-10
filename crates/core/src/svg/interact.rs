//! `Interaction` / `RelativeCursorPosition` / user-space cursor synthesis for
//! JSX `<svg>` shape children.
//!
//! Shapes are **Node-less** entities, so `ui_focus_system` (which drives
//! `Interaction` + `RelativeCursorPosition` geometrically for layout nodes)
//! never sees them. [`sync_shape_interactions`] re-derives both from the
//! picking pipeline instead — the [`HoverMap`] (which contains a shape only
//! because [`super::pick::refine_svg_pointer_hits`] emitted a refined
//! `PointerHits` for it) plus the pointer's [`PointerPress`] — mirroring
//! [`crate::layer::pick3d::correct_transformed_interactions`]. The refined
//! hit's user-space cursor lands in [`SvgUserPos`], which the event
//! collectors ([`crate::reconcile`]'s pointer/hover systems) read to report
//! `x`/`y` in SVG **user units** instead of the node-normalized values.
//!
//! Only handler-bearing shapes participate: `reconcile::svg_ops` stamps
//! `Interaction` (+ `RelativeCursorPosition`/[`SvgUserPos`]) exactly when the
//! shape declares `onClick`/`onPointer*`, and this system queries through
//! `Interaction` — a handler-less shape is skipped entirely, so its hits fall
//! through to the `<svg>` root's own handlers via the event collectors'
//! `ChildOf` climb.

use bevy::picking::hover::HoverMap;
use bevy::picking::pointer::{PointerId, PointerPress};
use bevy::prelude::*;
use bevy::ui::{ComputedNode, RelativeCursorPosition};

use super::paint::view_box_transform;
use super::pick::{SvgPointerShapeHits, map_point};
use super::{SvgShape, SvgSurface};

/// The cursor in the enclosing `<svg>` root's **user space** while a pointer
/// hovers this shape; `None` while not hovered. Written by
/// [`sync_shape_interactions`]; stamped/removed alongside the shape's handler
/// components (see `reconcile::svg_ops`). The position lives in an interior
/// `Option` (rather than inserting/removing the component per hover flip) so
/// a hover boundary never causes archetype churn.
#[derive(Component, Debug, Default, Clone, Copy, PartialEq)]
pub struct SvgUserPos(pub Option<Vec2>);

/// Drive `Interaction`, `RelativeCursorPosition`, and [`SvgUserPos`] for
/// handler-bearing SVG shapes from this frame's [`HoverMap`] + press state +
/// refined shape hits. Runs before `apply_interaction_styles` /
/// `collect_hover_events` / `collect_pointer_events` (the
/// `correct_transformed_interactions` slot) so styling, enter/leave, and
/// drag positions all see the synthesized state.
///
/// Leave contract (the pick3d one): pointer off the shape → `Interaction::None`,
/// `cursor_over: false` + `normalized: None`, user pos `None` — nothing sticky.
#[allow(clippy::type_complexity)]
pub(crate) fn sync_shape_interactions(
    hover_map: Option<Res<HoverMap>>,
    pointers: Query<(&PointerId, &PointerPress)>,
    shape_hits: Res<SvgPointerShapeHits>,
    roots: Query<(&SvgSurface, &ComputedNode)>,
    mut shapes: Query<
        (
            Entity,
            &mut Interaction,
            Option<&mut RelativeCursorPosition>,
            Option<&mut SvgUserPos>,
        ),
        With<SvgShape>,
    >,
) {
    for (entity, mut interaction, rel, user) in &mut shapes {
        // Hovered under ANY pointer: the mouse, the surface virtual pointer,
        // and the transform3d virtual pointer all deliver shapes into the
        // hover map the same way (the D2 refinement rides each hit entry's
        // own pointer id). When several pointers hover the same shape the
        // `find` over the HashMap picks an arbitrary one — acceptable: hit
        // suppression makes simultaneous hover on one shape practically
        // unreachable (a virtual pointer only exists where the real one is
        // suppressed).
        let hovering = hover_map.as_ref().and_then(|map| {
            map.iter()
                .find(|(_, hits)| hits.contains_key(&entity))
                .map(|(id, _)| *id)
        });
        let pressed = hovering.is_some_and(|id| {
            pointers
                .iter()
                .any(|(pid, press)| *pid == id && press.is_primary_pressed())
        });
        let desired = match (hovering.is_some(), pressed) {
            (true, true) => Interaction::Pressed,
            (true, false) => Interaction::Hovered,
            (false, _) => Interaction::None,
        };
        interaction.set_if_neq(desired);
        // This frame's refined hit for the hovering pointer — when it is ours
        // (two overlapping `<svg>` roots can hand the pointer's handoff entry
        // to the OTHER root's topmost shape).
        let hit = hovering
            .and_then(|id| shape_hits.hits.get(&id))
            .filter(|h| h.shape == entity);
        // The relative cursor is normalized against the SVG ROOT's box (the
        // shape has no box of its own), centered like `ui_focus_system`'s
        // own write; `normalized_01` shifts it for the wire.
        if let Some(mut rel) = rel {
            let normalized = hit.and_then(|h| {
                roots
                    .get(h.root)
                    .ok()
                    .and_then(|(surface, node)| user_to_root_normalized(surface, node, h.user_pos))
            });
            let next = RelativeCursorPosition {
                cursor_over: hovering.is_some(),
                normalized,
            };
            if rel.cursor_over != next.cursor_over || rel.normalized != next.normalized {
                *rel = next;
            }
        }
        if let Some(mut user) = user {
            user.set_if_neq(SvgUserPos(hit.map(|h| h.user_pos)));
        }
    }
}

/// Map an SVG-user-space point into the root's centered-normalized box
/// coordinates (the `ComputedNode::normalize_point` convention: `(-0.5,-0.5)`
/// top-left … `(0.5,0.5)` bottom-right) — the exact forward of
/// [`super::pick::cursor_to_user_space`]'s inverse. `None` on a zero-sized
/// box.
fn user_to_root_normalized(
    surface: &SvgSurface,
    node: &ComputedNode,
    user_pos: Vec2,
) -> Option<Vec2> {
    let (w, h) = crate::canvas::clamp_physical_size(node.size);
    if w == 0 || h == 0 {
        return None;
    }
    let scale_factor = super::node_scale_factor(node);
    let local = map_point(
        view_box_transform(surface.view_box.as_ref(), w, h, scale_factor),
        user_pos,
    );
    Some(local / node.size - Vec2::splat(0.5))
}

#[cfg(test)]
mod tests {
    use bevy::ecs::entity::EntityHashMap;
    use bevy::ecs::system::RunSystemOnce;
    use bevy::picking::backend::HitData;
    use bevy::reflect::structs::Struct;

    use super::super::pick::SvgShapeHit;
    use super::*;
    use crate::svg::{ShapeAttrs, ShapeKind, ViewBox, st};

    /// A world with one `<svg>` root (200×200 physical box, viewBox
    /// `0 0 100 100`) and one handler-bearing circle shape carrying the full
    /// synthesis component set. Returns `(world, root, shape)`.
    fn shape_world() -> (World, Entity, Entity) {
        let mut world = World::new();
        world.init_resource::<SvgPointerShapeHits>();
        let root = world
            .spawn((
                SvgSurface::jsx(Some(ViewBox {
                    min: Vec2::ZERO,
                    size: Vec2::splat(100.0),
                })),
                ComputedNode {
                    size: Vec2::splat(200.0),
                    ..Default::default()
                },
            ))
            .id();
        let shape = world
            .spawn((
                SvgShape {
                    kind: ShapeKind::Circle,
                    attrs: ShapeAttrs {
                        cx: st(50.0),
                        cy: st(50.0),
                        r: st(40.0),
                        ..Default::default()
                    },
                },
                ChildOf(root),
                Interaction::None,
                RelativeCursorPosition::default(),
                SvgUserPos::default(),
            ))
            .id();
        (world, root, shape)
    }

    /// Put `entity` (alone) under `pointer` in the hover map.
    fn hover(world: &mut World, pointer: PointerId, entity: Entity) {
        let mut map = HoverMap::default();
        let mut entry: EntityHashMap<HitData> = EntityHashMap::default();
        entry.insert(entity, HitData::new(Entity::PLACEHOLDER, 0.0, None, None));
        map.insert(pointer, entry);
        world.insert_resource(map);
    }

    /// Record the D2 handoff entry for `pointer`.
    fn set_hit(world: &mut World, pointer: PointerId, root: Entity, shape: Entity, user_pos: Vec2) {
        world.resource_mut::<SvgPointerShapeHits>().hits.insert(
            pointer,
            SvgShapeHit {
                root,
                shape,
                user_pos,
                depth: 0.0,
            },
        );
    }

    /// A `PointerPress` with the primary button held. The real writer is
    /// bevy_picking's `PointerInput::receive` (fields are private), so the
    /// test drives the reflected field directly.
    fn primary_pressed() -> PointerPress {
        let mut press = PointerPress::default();
        *press
            .field_mut("primary")
            .expect("PointerPress has a `primary` field")
            .try_downcast_mut::<bool>()
            .expect("primary is a bool") = true;
        press
    }

    /// Hovered shape: `Interaction::Hovered`; `RelativeCursorPosition` is
    /// over and normalized against the ROOT's box (user (25,50) in a
    /// 100-unit viewBox on a 200px box → centered (-0.25, 0.0)); and
    /// `SvgUserPos(Some(user_pos))`.
    #[test]
    fn hovered_shape_synthesizes_full_state() {
        let (mut world, root, shape) = shape_world();
        world.spawn((PointerId::Mouse, PointerPress::default()));
        hover(&mut world, PointerId::Mouse, shape);
        set_hit(
            &mut world,
            PointerId::Mouse,
            root,
            shape,
            Vec2::new(25.0, 50.0),
        );
        world.run_system_once(sync_shape_interactions).unwrap();

        assert_eq!(
            *world.get::<Interaction>(shape).unwrap(),
            Interaction::Hovered
        );
        let rel = world.get::<RelativeCursorPosition>(shape).unwrap();
        assert!(rel.cursor_over, "hovered → cursor_over");
        let n = rel.normalized.expect("a refined hit yields a position");
        assert!(
            n.distance(Vec2::new(-0.25, 0.0)) < 1e-4,
            "user (25,50) normalizes against the ROOT box; got {n:?}"
        );
        assert_eq!(
            world.get::<SvgUserPos>(shape).unwrap().0,
            Some(Vec2::new(25.0, 50.0)),
            "the user-space cursor is published while hovered"
        );
    }

    /// The hovering pointer's primary button held → `Interaction::Pressed`.
    #[test]
    fn pressed_pointer_presses_shape() {
        let (mut world, root, shape) = shape_world();
        world.spawn((PointerId::Mouse, primary_pressed()));
        hover(&mut world, PointerId::Mouse, shape);
        set_hit(&mut world, PointerId::Mouse, root, shape, Vec2::splat(50.0));
        world.run_system_once(sync_shape_interactions).unwrap();
        assert_eq!(
            *world.get::<Interaction>(shape).unwrap(),
            Interaction::Pressed
        );
    }

    /// The leave contract: pointer off the shape → `Interaction::None`,
    /// `cursor_over: false` + `normalized: None`, user pos `None` — nothing
    /// sticky from the hovered frame.
    #[test]
    fn pointer_leave_clears_everything() {
        let (mut world, root, shape) = shape_world();
        world.spawn((PointerId::Mouse, PointerPress::default()));
        hover(&mut world, PointerId::Mouse, shape);
        set_hit(&mut world, PointerId::Mouse, root, shape, Vec2::splat(50.0));
        world.run_system_once(sync_shape_interactions).unwrap();
        assert_eq!(
            *world.get::<Interaction>(shape).unwrap(),
            Interaction::Hovered
        );

        // The pointer moves off: empty hover map, handoff rebuilt empty.
        world.insert_resource(HoverMap::default());
        world.resource_mut::<SvgPointerShapeHits>().hits.clear();
        world.run_system_once(sync_shape_interactions).unwrap();

        assert_eq!(*world.get::<Interaction>(shape).unwrap(), Interaction::None);
        let rel = world.get::<RelativeCursorPosition>(shape).unwrap();
        assert!(!rel.cursor_over, "leave clears cursor_over");
        assert_eq!(rel.normalized, None, "leave clears the position");
        assert_eq!(
            world.get::<SvgUserPos>(shape).unwrap().0,
            None,
            "leave clears the user-space cursor"
        );
    }

    /// Handler-less shapes (no `Interaction` component) are skipped — the
    /// system must not grow components on them; and a non-shape entity's
    /// `Interaction` is untouched even while the hover map lists it.
    #[test]
    fn handlerless_shapes_and_non_shapes_untouched() {
        let (mut world, root, _shape) = shape_world();
        world.spawn((PointerId::Mouse, PointerPress::default()));
        let bare = world
            .spawn((
                SvgShape {
                    kind: ShapeKind::Rect,
                    attrs: ShapeAttrs::default(),
                },
                ChildOf(root),
            ))
            .id();
        let node = world.spawn(Interaction::Hovered).id();
        hover(&mut world, PointerId::Mouse, bare);
        world.run_system_once(sync_shape_interactions).unwrap();

        assert!(
            world.get::<Interaction>(bare).is_none(),
            "a handler-less shape must not gain Interaction"
        );
        assert_eq!(
            *world.get::<Interaction>(node).unwrap(),
            Interaction::Hovered,
            "non-shape entities are not this system's business"
        );
    }

    /// An `onClick`-only shape carries `Interaction` but no
    /// `RelativeCursorPosition` (the generic handler-stamping rule): the
    /// optional fetches must tolerate that.
    #[test]
    fn click_only_shape_drives_interaction_alone() {
        let (mut world, root, _full) = shape_world();
        world.spawn((PointerId::Mouse, PointerPress::default()));
        let click_only = world
            .spawn((
                SvgShape {
                    kind: ShapeKind::Rect,
                    attrs: ShapeAttrs::default(),
                },
                ChildOf(root),
                Interaction::None,
            ))
            .id();
        hover(&mut world, PointerId::Mouse, click_only);
        set_hit(&mut world, PointerId::Mouse, root, click_only, Vec2::ONE);
        world.run_system_once(sync_shape_interactions).unwrap();
        assert_eq!(
            *world.get::<Interaction>(click_only).unwrap(),
            Interaction::Hovered
        );
    }
}
