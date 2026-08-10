//! Pins for the per-shape hit refinement: the pure core (topmost-wins,
//! coordinate mapping, transform inversion) and the system (message in →
//! refined message out, with the depth/camera/pointer contract and the
//! file-mode / non-svg / dedupe guards). Harness mirrors
//! [`crate::pick_clip`]'s tests: scale-1 image-target pointer, bare camera.

use bevy::camera::{Camera, ImageRenderTarget, NormalizedRenderTarget};
use bevy::ecs::system::RunSystemOnce;
use bevy::picking::backend::{HitData, PointerHits};
use bevy::picking::pointer::{Location, PointerId, PointerLocation};
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};
use tiny_skia::Transform;

use super::{
    HALF_DEPTH_STEP, SvgPointerShapeHits, cursor_to_user_space, refine_hit, refine_svg_pointer_hits,
};
use crate::svg::{ShapeAttrs, ShapeKind, SvgShape, SvgSurface, ViewBox, st};

fn circle(cx: f32, cy: f32, r: f32) -> SvgShape {
    SvgShape {
        kind: ShapeKind::Circle,
        attrs: ShapeAttrs {
            cx: st(cx),
            cy: st(cy),
            r: st(r),
            ..Default::default()
        },
    }
}

fn rect(x: f32, y: f32, w: f32, h: f32) -> SvgShape {
    SvgShape {
        kind: ShapeKind::Rect,
        attrs: ShapeAttrs {
            x: st(x),
            y: st(y),
            width: st(w),
            height: st(h),
            ..Default::default()
        },
    }
}

/// Fresh entity ids for pure-core tests (no components needed — the lookup
/// closure supplies the shape data).
fn ids(world: &mut World, n: usize) -> Vec<Entity> {
    (0..n).map(|_| world.spawn_empty().id()).collect()
}

/// Overlapping shapes: the FIRST entry of the topmost-first list wins, even
/// though both contain the point.
#[test]
fn refine_hit_topmost_wins_on_overlap() {
    let mut world = World::new();
    let e = ids(&mut world, 2);
    let (top, bottom) = (circle(50.0, 50.0, 40.0), rect(0.0, 0.0, 100.0, 100.0));
    let list = [(e[0], Transform::identity()), (e[1], Transform::identity())];
    let lookup = |id: Entity| {
        if id == e[0] {
            Some(&top)
        } else if id == e[1] {
            Some(&bottom)
        } else {
            None
        }
    };
    assert_eq!(
        refine_hit(&list, lookup, Vec2::new(50.0, 50.0)),
        Some(e[0]),
        "both shapes contain the point; the topmost (first) must win"
    );
    assert_eq!(
        refine_hit(&list, lookup, Vec2::new(2.0, 2.0)),
        Some(e[1]),
        "inside the rect but outside the circle: falls to the shape beneath"
    );
}

/// A point over painted-nothing returns `None` — the system writes no
/// message and the hit falls through to the svg node.
#[test]
fn refine_hit_miss_falls_through() {
    let mut world = World::new();
    let e = ids(&mut world, 1);
    let shape = circle(50.0, 50.0, 10.0);
    let list = [(e[0], Transform::identity())];
    assert_eq!(
        refine_hit(&list, |_| Some(&shape), Vec2::new(90.0, 90.0)),
        None
    );
}

/// A composed group transform carries the cursor into shape-local space: a
/// circle inside a `translate(10 0)` group hits at the translated position
/// and misses at the untranslated one.
#[test]
fn refine_hit_inverts_composed_group_transform() {
    let mut world = World::new();
    let e = ids(&mut world, 1);
    let shape = circle(0.0, 0.0, 5.0);
    let list = [(e[0], Transform::from_translate(10.0, 0.0))];
    assert_eq!(
        refine_hit(&list, |_| Some(&shape), Vec2::new(10.0, 0.0)),
        Some(e[0]),
        "the on-screen (translated) position must hit"
    );
    assert_eq!(
        refine_hit(&list, |_| Some(&shape), Vec2::new(0.0, 0.0)),
        None,
        "the untranslated position must miss"
    );
}

/// A non-invertible composed transform (scale 0 — zero on-screen area) skips
/// the shape without panicking, letting shapes beneath win.
#[test]
fn refine_hit_skips_non_invertible_transforms() {
    let mut world = World::new();
    let e = ids(&mut world, 2);
    let degenerate = circle(50.0, 50.0, 40.0);
    let under = rect(0.0, 0.0, 100.0, 100.0);
    let list = [
        (e[0], Transform::from_scale(0.0, 0.0)),
        (e[1], Transform::identity()),
    ];
    let lookup = |id: Entity| {
        if id == e[0] {
            Some(&degenerate)
        } else {
            Some(&under)
        }
    };
    assert_eq!(
        refine_hit(&list, lookup, Vec2::new(50.0, 50.0)),
        Some(e[1]),
        "the zero-scaled shape is skipped; the rect beneath wins"
    );
}

/// viewBox mapping honors a nonzero min: cursor at local (30,30) in a
/// 100×100 box with `viewBox="10 20 100 100"` lands at user (40,50).
#[test]
fn cursor_maps_through_view_box_min_offset() {
    let vb = ViewBox {
        min: Vec2::new(10.0, 20.0),
        size: Vec2::new(100.0, 100.0),
    };
    assert_eq!(
        cursor_to_user_space(Some(&vb), Vec2::splat(100.0), 1.0, Vec2::new(30.0, 30.0)),
        Some(Vec2::new(40.0, 50.0))
    );
}

/// No viewBox = logical-pixel user space: at DPR 2 a physical cursor (40,40)
/// in an 80×80-physical box is user (20,20).
#[test]
fn cursor_maps_to_logical_px_without_view_box_at_dpr2() {
    assert_eq!(
        cursor_to_user_space(None, Vec2::splat(80.0), 2.0, Vec2::new(40.0, 40.0)),
        Some(Vec2::new(20.0, 20.0))
    );
}

// --- system-level: the pick_clip harness pattern ---

const POINTER: PointerId = PointerId::Custom(uuid::Uuid::from_u128(0x51C5));

/// A world with one pointer at `position` (scale-1 image target, so logical
/// == physical), one bare camera, and the refinement's resources.
fn world_with_pointer(position: Vec2) -> (World, Entity) {
    let mut world = World::new();
    world.init_resource::<Messages<PointerHits>>();
    world.init_resource::<SvgPointerShapeHits>();
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

/// An svg root spanning (0,0)..(100,100) — center-translated transform, the
/// `UiGlobalTransform` convention — with a bottom rect (0,0,50,50) and a top
/// circle at (30,30) r 10. Returns (root, rect, circle).
fn spawn_svg_tree(world: &mut World, surface: SvgSurface) -> (Entity, Entity, Entity) {
    let root = world
        .spawn((
            surface,
            ComputedNode {
                size: Vec2::splat(100.0),
                ..Default::default()
            },
            UiGlobalTransform::from_translation(Vec2::splat(50.0)),
        ))
        .id();
    let bottom = world
        .spawn((rect(0.0, 0.0, 50.0, 50.0), ChildOf(root)))
        .id();
    let top = world.spawn((circle(30.0, 30.0, 10.0), ChildOf(root))).id();
    (root, bottom, top)
}

/// Two nodes deep at the UI backend's `0.00001` per-node step (topmost 0.0).
const ROOT_DEPTH: f32 = 0.00002;

fn send_root_hit(world: &mut World, camera: Entity, root: Entity) {
    send_root_hit_at(world, camera, root, ROOT_DEPTH);
}

fn send_root_hit_at(world: &mut World, camera: Entity, root: Entity, depth: f32) {
    world
        .resource_mut::<Messages<PointerHits>>()
        .write(PointerHits::new(
            POINTER,
            vec![(root, HitData::new(camera, depth, None, None))],
            0.5,
        ));
}

/// Every buffered message, drained.
fn drain_hits(world: &mut World) -> Vec<PointerHits> {
    world
        .resource_mut::<Messages<PointerHits>>()
        .drain()
        .collect()
}

/// The full refinement contract: exactly one NEW message for the topmost
/// shape, half a depth step above the root's hit, same pointer and camera —
/// and the D3 handoff resource carries the shape + user-space cursor.
#[test]
fn system_refines_root_hit_to_topmost_shape() {
    let (mut world, camera) = world_with_pointer(Vec2::new(30.0, 30.0));
    let (root, bottom, top) = spawn_svg_tree(&mut world, SvgSurface::jsx(None));
    send_root_hit(&mut world, camera, root);
    world.run_system_once(refine_svg_pointer_hits).unwrap();

    let all = drain_hits(&mut world);
    assert_eq!(
        all.len(),
        2,
        "the root's message plus exactly one refinement"
    );
    let refined: Vec<&PointerHits> = all
        .iter()
        .filter(|m| m.picks.iter().any(|(e, _)| *e != root))
        .collect();
    assert_eq!(refined.len(), 1);
    let msg = refined[0];
    assert_eq!(msg.pointer, POINTER);
    assert_eq!(msg.picks.len(), 1);
    let (entity, data) = &msg.picks[0];
    assert_eq!(
        *entity, top,
        "the circle overlaps the rect at (30,30); topmost wins (not {bottom:?})"
    );
    assert_eq!(data.camera, camera, "same camera as the root's entry");
    assert_eq!(
        data.depth,
        ROOT_DEPTH - HALF_DEPTH_STEP,
        "half a step above the svg node, below anything above it"
    );

    let hits = world.resource::<SvgPointerShapeHits>();
    let hit = hits.hits.get(&POINTER).expect("handoff entry written");
    assert_eq!(hit.shape, top);
    assert_eq!(hit.root, root);
    assert!(
        hit.user_pos.distance(Vec2::new(30.0, 30.0)) < 1e-3,
        "no viewBox at DPR 1: user space == node-local logical px (float \
         noise from the affine inverse aside); got {:?}",
        hit.user_pos
    );
}

/// A cursor over painted-nothing writes NO message (fallthrough to the svg
/// node) and no handoff entry.
#[test]
fn system_miss_writes_nothing() {
    let (mut world, camera) = world_with_pointer(Vec2::new(90.0, 90.0));
    let (root, _, _) = spawn_svg_tree(&mut world, SvgSurface::jsx(None));
    send_root_hit(&mut world, camera, root);
    world.run_system_once(refine_svg_pointer_hits).unwrap();

    let all = drain_hits(&mut world);
    assert_eq!(all.len(), 1, "only the root's original message survives");
    assert!(world.resource::<SvgPointerShapeHits>().hits.is_empty());
}

/// A file-mode svg (`doc: Some`) keeps whole-node events even if it somehow
/// has shape children; a non-svg entity's hits are ignored outright.
#[test]
fn system_ignores_file_mode_and_non_svg_entities() {
    let (mut world, camera) = world_with_pointer(Vec2::new(30.0, 30.0));
    let (file_root, _, _) = spawn_svg_tree(&mut world, SvgSurface::new(Handle::default()));
    let plain = world.spawn(ComputedNode::default()).id();
    send_root_hit(&mut world, camera, file_root);
    send_root_hit(&mut world, camera, plain);
    world.run_system_once(refine_svg_pointer_hits).unwrap();

    let all = drain_hits(&mut world);
    assert_eq!(all.len(), 2, "no refinement for either entry");
    assert!(world.resource::<SvgPointerShapeHits>().hits.is_empty());
}

/// One pointer over TWO overlapping svg roots (two messages, different
/// depths): both entries refine — one emitted message each, the per-entry
/// contract — while the D3 handoff resource keeps only the topmost
/// (smallest-depth) root's shape, regardless of message order (both
/// tie-break branches exercised).
#[test]
fn system_keeps_topmost_root_in_handoff_across_overlapping_roots() {
    for deeper_first in [true, false] {
        let (mut world, camera) = world_with_pointer(Vec2::new(30.0, 30.0));
        let (deep_root, _, deep_top) = spawn_svg_tree(&mut world, SvgSurface::jsx(None));
        let (top_root, _, top_top) = spawn_svg_tree(&mut world, SvgSurface::jsx(None));
        let order = if deeper_first {
            [(deep_root, ROOT_DEPTH), (top_root, 0.0)]
        } else {
            [(top_root, 0.0), (deep_root, ROOT_DEPTH)]
        };
        for (root, depth) in order {
            send_root_hit_at(&mut world, camera, root, depth);
        }
        world.run_system_once(refine_svg_pointer_hits).unwrap();

        let refined: Vec<PointerHits> = drain_hits(&mut world)
            .into_iter()
            .filter(|m| m.picks.iter().any(|(e, _)| *e == deep_top || *e == top_top))
            .collect();
        assert_eq!(
            refined.len(),
            2,
            "each root's entry refines to its own shape (deeper_first={deeper_first})"
        );

        let hits = world.resource::<SvgPointerShapeHits>();
        let hit = hits.hits.get(&POINTER).expect("handoff entry written");
        assert_eq!(
            hit.root, top_root,
            "the topmost (smallest-depth) root wins the handoff (deeper_first={deeper_first})"
        );
        assert_eq!(hit.shape, top_top);
    }
}

/// The same pointer can deliver the same svg node in MULTIPLE messages (one
/// per backend): the (pointer, root) pair refines exactly once.
#[test]
fn system_dedupes_repeated_entries_for_one_pointer() {
    let (mut world, camera) = world_with_pointer(Vec2::new(30.0, 30.0));
    let (root, _, top) = spawn_svg_tree(&mut world, SvgSurface::jsx(None));
    send_root_hit(&mut world, camera, root);
    send_root_hit(&mut world, camera, root);
    world.run_system_once(refine_svg_pointer_hits).unwrap();

    let refined: Vec<PointerHits> = drain_hits(&mut world)
        .into_iter()
        .filter(|m| m.picks.iter().any(|(e, _)| *e == top))
        .collect();
    assert_eq!(
        refined.len(),
        1,
        "two backend messages for one pointer must yield ONE refinement"
    );
}
