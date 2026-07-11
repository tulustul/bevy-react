//! Workaround for a `bevy_ui` 0.19 picking bug: scroll/overflow clipping is
//! not honored for hits on nodes whose **direct parent** doesn't clip.
//!
//! Upstream, `bevy_ui::clip_check_recursive` (used by both the UI picking
//! backend and the legacy focus system) only keeps climbing the ancestor chain
//! while the immediate parent has non-visible overflow — the first
//! visible-overflow parent short-circuits the walk to "unclipped". Any node
//! wrapped in a plain container (a list row inside a column wrapper, say)
//! therefore escapes every ancestor's `overflow: scroll/clip/hidden` and stays
//! hit-testable at its laid-out position — e.g. scrolled-out rows keep
//! receiving clicks *below* their scroll container, over whatever is rendered
//! there. Rendering is unaffected (it uses the correctly-inherited
//! [`CalculatedClip`]), so the hits land on invisible geometry. Fixed on
//! upstream `main` (the walk now recurses unconditionally); this filter can be
//! dropped once we're on a Bevy release containing that fix.
//!
//! The fix re-checks every backend's [`PointerHits`] against [`CalculatedClip`]
//! — the render-grade inherited clip — **between** the picking backends and the
//! hover-map update, so everything downstream (hover map, `Pointer<*>` events,
//! surface clicks, devtools pick mode, cursor and wheel targeting) sees only
//! genuinely visible hits. Non-UI hits (3D meshes) and unclipped nodes pass
//! through untouched.
//!
//! Known residue: `Interaction` is driven by `ui_focus_system`, which applies
//! the same buggy walk internally — but a wrong `Interaction` on a clipped
//! node only toggles hover/press styling on pixels that are clipped from
//! rendering anyway, so it has no visible effect.

use bevy::camera::Camera;
use bevy::ecs::message::MessageMutator;
use bevy::picking::backend::PointerHits;
use bevy::picking::pointer::{PointerId, PointerLocation};
use bevy::prelude::*;
use bevy::ui::{CalculatedClip, ComputedNode};

/// Drop picking hits whose pointer position falls outside the hit node's
/// inherited [`CalculatedClip`]. See the module docs for why bevy's own clip
/// check misses these.
pub fn filter_clipped_pointer_hits(
    mut hits: MessageMutator<PointerHits>,
    pointers: Query<(&PointerId, &PointerLocation)>,
    cameras: Query<&Camera>,
    nodes: Query<(Option<&ComputedNode>, Option<&CalculatedClip>)>,
    child_of: Query<&ChildOf>,
) {
    for hits in hits.read() {
        let Some(location) = pointers
            .iter()
            .find(|(id, _)| **id == hits.pointer)
            .and_then(|(_, loc)| loc.location().cloned())
        else {
            continue;
        };
        hits.picks.retain(|(entity, data)| {
            // The picked leaf may be a text span (not a UI node itself); the
            // clip that applies to it is the nearest ancestor node's.
            let mut cursor = *entity;
            let clip = loop {
                if let Ok((computed, clip)) = nodes.get(cursor)
                    && computed.is_some()
                {
                    break Some(clip);
                }
                match child_of.get(cursor) {
                    Ok(parent) => cursor = parent.parent(),
                    Err(_) => break None,
                }
            };
            let Some(clip) = clip else {
                return true; // no UI node in the chain — a 3D/mesh hit
            };
            let Some(clip) = clip else {
                return true; // an unclipped UI node
            };
            let Ok(camera) = cameras.get(data.camera) else {
                return true;
            };
            // Pointer position in physical viewport coordinates — the same
            // space `CalculatedClip` rects live in (mirrors the UI picking
            // backend's own cursor math).
            let mut point = location.position * camera.target_scaling_factor().unwrap_or(1.0);
            if let Some(viewport) = camera.physical_viewport_rect() {
                point -= viewport.min.as_vec2();
            }
            clip.clip.contains(point)
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bevy::camera::{ImageRenderTarget, NormalizedRenderTarget};
    use bevy::ecs::system::RunSystemOnce;
    use bevy::picking::backend::HitData;
    use bevy::picking::pointer::Location;

    const POINTER: PointerId = PointerId::Custom(uuid::Uuid::from_u128(0xC11B));

    /// A world with one pointer at `position` (scale-1 image target, so
    /// logical == physical) and one bare camera; returns the camera entity.
    fn world_with_pointer(position: Vec2) -> (World, Entity) {
        let mut world = World::new();
        world.init_resource::<Messages<PointerHits>>();
        let camera = world.spawn(Camera::default()).id();
        world.spawn((
            POINTER,
            PointerLocation::new(Location {
                target: NormalizedRenderTarget::Image(ImageRenderTarget {
                    handle: Handle::default(),
                    scale_factor: 1.0,
                }),
                position,
            }),
        ));
        (world, camera)
    }

    fn send_hits(world: &mut World, camera: Entity, entities: &[Entity]) {
        let picks = entities
            .iter()
            .map(|&e| (e, HitData::new(camera, 0.0, None, None)))
            .collect();
        world
            .resource_mut::<Messages<PointerHits>>()
            .write(PointerHits::new(POINTER, picks, 0.5));
    }

    fn surviving_picks(world: &mut World) -> Vec<Entity> {
        world
            .resource_mut::<Messages<PointerHits>>()
            .drain()
            .flat_map(|h| h.picks.into_iter().map(|(e, _)| e))
            .collect()
    }

    /// The clip that matters: a node clipped by an ancestor keeps hits inside
    /// its `CalculatedClip` and loses hits outside it — even though bevy's own
    /// backend (0.19) lets the outside hit through when the direct parent has
    /// visible overflow (the scrolled-rows-steal-clicks bug).
    #[test]
    fn clipped_node_hits_are_filtered_by_calculated_clip() {
        for (pointer, expect_kept) in [
            (Vec2::new(50.0, 50.0), true),
            (Vec2::new(50.0, 150.0), false),
        ] {
            let (mut world, camera) = world_with_pointer(pointer);
            let node = world
                .spawn((
                    ComputedNode::default(),
                    CalculatedClip {
                        clip: Rect::new(0.0, 0.0, 100.0, 100.0),
                    },
                ))
                .id();
            send_hits(&mut world, camera, &[node]);
            world.run_system_once(filter_clipped_pointer_hits).unwrap();
            let kept = surviving_picks(&mut world);
            assert_eq!(
                kept.contains(&node),
                expect_kept,
                "pointer {pointer:?} → kept {kept:?}"
            );
        }
    }

    /// A text-span leaf (no `ComputedNode` of its own) inherits the clip of
    /// the nearest ancestor node.
    #[test]
    fn span_leaf_resolves_clip_through_its_node() {
        let (mut world, camera) = world_with_pointer(Vec2::new(50.0, 150.0));
        let node = world
            .spawn((
                ComputedNode::default(),
                CalculatedClip {
                    clip: Rect::new(0.0, 0.0, 100.0, 100.0),
                },
            ))
            .id();
        let span = world.spawn(ChildOf(node)).id();
        send_hits(&mut world, camera, &[span]);
        world.run_system_once(filter_clipped_pointer_hits).unwrap();
        assert!(
            surviving_picks(&mut world).is_empty(),
            "a span hit outside its node's clip must be dropped"
        );
    }

    /// Non-UI (mesh) hits and unclipped UI nodes pass through untouched.
    #[test]
    fn mesh_and_unclipped_hits_pass_through() {
        let (mut world, camera) = world_with_pointer(Vec2::new(50.0, 150.0));
        let mesh = world.spawn_empty().id();
        let unclipped = world.spawn(ComputedNode::default()).id();
        send_hits(&mut world, camera, &[mesh, unclipped]);
        world.run_system_once(filter_clipped_pointer_hits).unwrap();
        assert_eq!(surviving_picks(&mut world), vec![mesh, unclipped]);
    }
}
