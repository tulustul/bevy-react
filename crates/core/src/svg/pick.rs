//! Per-shape pointer picking for JSX `<svg>` elements: refine a pointer's
//! hit on the `<svg>` node into a hit on the **topmost painted shape** under
//! the cursor.
//!
//! NOT a new virtual pointer. [`refine_svg_pointer_hits`] runs between the
//! picking backends and the hover-map update and reads this frame's
//! [`PointerHits`]: for each entry whose entity is a JSX `<svg>` root
//! (`SvgSurface` with `doc: None`) with shape children, it resolves **that
//! entry's** pointer location into the node's local box, inverts the viewBox
//! fit into SVG user space, walks the shapes topmost-first (reverse paint
//! order) inverse-transforming the cursor into each shape's local space, and
//! asks [`super::hit::hit_shape`]. The first hit wins and is emitted as one
//! new `PointerHits` message for the shape entity, half a depth step above
//! the svg node's own hit — above its node, below anything already above the
//! node. No shape under the cursor → no message: the hit falls through to
//! the svg node itself (web `visiblePainted` empty-region semantics).
//!
//! Because the refinement keys off the hit entry's own pointer id and
//! resolves its [`PointerLocation`] (via the same physical-viewport math as
//! [`crate::pick_clip`]), shapes inside `<surface>` texture UI and inside
//! 3D-transformed layers work unchanged: those virtual pointers already
//! carry corrected locations. File-mode svgs (`<image src="x.svg">`, `doc:
//! Some`) are untouched — whole-node events, like any `<image>`.

use bevy::camera::Camera;
use bevy::ecs::message::MessageCursor;
use bevy::picking::backend::{HitData, PointerHits};
use bevy::picking::pointer::{PointerId, PointerLocation};
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};
use tiny_skia::Transform;

use super::hit::hit_shape;
use super::paint::view_box_transform;
use super::walk::{ShapeQuery, walk_shapes};
use super::{SvgShape, SvgSurface, ViewBox};

#[cfg(test)]
mod tests;

/// Half the bevy_ui picking backend's per-node depth step (topmost `0.0`,
/// `+0.00001` per node beneath — see `reconcile/pointer.rs`'s depth-order
/// tests). Subtracting it puts a refined shape hit **above its own svg node**
/// but **below** every node the backend already placed above that node.
/// Private: consumers read refined hits from the message stream or
/// [`SvgPointerShapeHits`], never re-derive depths.
const HALF_DEPTH_STEP: f32 = 0.000_005;

/// The frame's winning shape hit per pointer — the handoff to the
/// Interaction/event synthesis ([`super::interact`]), which needs "which
/// shape, at which user-space position" without re-deriving the transform
/// chain.
/// [`HitData::position`] is deliberately **not** used for this: picking
/// backends put *world-space* positions there, and user-space coordinates
/// would violate that contract for any generic consumer.
///
/// Rebuilt from scratch every run; when one pointer hits two overlapping
/// `<svg>` roots the topmost (smallest-depth) root's refinement is kept.
#[derive(Resource, Default, Debug)]
pub(crate) struct SvgPointerShapeHits {
    pub hits: HashMap<PointerId, SvgShapeHit>,
}

/// One pointer's refined shape hit. See [`SvgPointerShapeHits`]; consumed by
/// [`super::interact::sync_shape_interactions`].
#[derive(Debug, Clone, Copy)]
pub(crate) struct SvgShapeHit {
    /// The `<svg>` root whose refinement won.
    pub root: Entity,
    /// The topmost painted shape under the pointer.
    pub shape: Entity,
    /// The cursor in the root's SVG user space.
    pub user_pos: Vec2,
    /// The emitted refined depth — the tie-breaker between overlapping roots
    /// only; consumers never re-derive or compare depths (`pub(crate)` so
    /// sibling tests can fabricate hits).
    pub(crate) depth: f32,
}

/// Refine this frame's svg-node [`PointerHits`] into per-shape hits. See the
/// module doc for the full mechanism. Reads and writes the same message
/// buffer (`ResMut` + a local cursor — the standard read-then-write shape);
/// its own emissions never re-refine, because shape entities are not svg
/// roots.
pub(crate) fn refine_svg_pointer_hits(
    mut messages: ResMut<Messages<PointerHits>>,
    mut cursor: Local<MessageCursor<PointerHits>>,
    mut shape_hits: ResMut<SvgPointerShapeHits>,
    pointers: Query<(&PointerId, &PointerLocation)>,
    cameras: Query<&Camera>,
    roots: Query<(&SvgSurface, &ComputedNode, &UiGlobalTransform, &Children)>,
    shapes: ShapeQuery,
) {
    shape_hits.hits.clear();
    // (pointer, root) pairs already refined this run: the same pointer can
    // deliver the same svg node in multiple messages (one per backend).
    let mut seen: Vec<(PointerId, Entity)> = Vec::new();
    let mut refined: Vec<PointerHits> = Vec::new();
    for msg in cursor.read(&messages) {
        for (entity, data) in &msg.picks {
            let Ok((surface, node, transform, children)) = roots.get(*entity) else {
                continue; // not an svg root (incl. our own shape emissions)
            };
            if surface.doc.is_some() {
                continue; // file mode (`<image src="x.svg">`): whole-node events
            }
            if seen.contains(&(msg.pointer, *entity)) {
                continue;
            }
            // Pushed BEFORE resolution: the first entry per (pointer, root)
            // wins, so an entry that bails or misses below also suppresses
            // later duplicates. Accepted: duplicates carry the same pointer
            // and root, so in the non-degenerate cases they would resolve
            // identically anyway.
            seen.push((msg.pointer, *entity));
            // THIS entry's pointer location — surface/transform3d virtual
            // pointers already carry corrected locations, so their shapes
            // take the exact same path as the window mouse.
            let Some(location) = pointers
                .iter()
                .find(|(id, _)| **id == msg.pointer)
                .and_then(|(_, loc)| loc.location().cloned())
            else {
                continue;
            };
            let Ok(camera) = cameras.get(data.camera) else {
                continue;
            };
            // Physical viewport px (per-target scale — pick_clip's math) →
            // the node's local box, top-left origin.
            let physical = crate::pick_clip::pointer_physical_position(&location, camera);
            let Some(normalized) = node.normalize_point(*transform, physical) else {
                continue;
            };
            let local = (normalized + Vec2::splat(0.5)) * node.size;
            let scale_factor = super::node_scale_factor(node);
            let Some(user_pos) =
                cursor_to_user_space(surface.view_box.as_ref(), node.size, scale_factor, local)
            else {
                continue;
            };
            // Topmost-first = reverse paint order. Collect + reverse rather
            // than teaching the walker to run backwards: shape counts are
            // small (a handful per svg), and the walker stays single-purpose.
            // Identity root transform: composed transforms stay in user space
            // (the viewBox fit is already folded into `user_pos`). The
            // yielded opacity is deliberately dropped — web `visiblePainted`
            // ignores opacity for hittability (the hit module's rule).
            let mut ordered: Vec<(Entity, Transform)> = Vec::new();
            walk_shapes(
                children,
                &shapes,
                Transform::identity(),
                1.0,
                &mut |shape_entity, _, t, _| ordered.push((shape_entity, t)),
            );
            ordered.reverse();
            let Some(shape) =
                refine_hit(&ordered, |e| shapes.get(e).ok().map(|(s, _)| s), user_pos)
            else {
                continue; // painted-nothing: fall through to the svg node
            };
            let depth = data.depth - HALF_DEPTH_STEP;
            let candidate = SvgShapeHit {
                root: *entity,
                shape,
                user_pos,
                depth,
            };
            shape_hits
                .hits
                .entry(msg.pointer)
                .and_modify(|current| {
                    // Two overlapping svg roots under one pointer: keep the
                    // topmost (smallest-depth) root's refinement.
                    if depth < current.depth {
                        *current = candidate;
                    }
                })
                .or_insert(candidate);
            refined.push(PointerHits::new(
                msg.pointer,
                vec![(shape, HitData::new(data.camera, depth, None, None))],
                msg.order,
            ));
        }
    }
    for msg in refined {
        messages.write(msg);
    }
}

/// Map the cursor from the svg node's local box (physical px, top-left
/// origin) into SVG **user space** by inverting the viewBox fit. `None` on a
/// zero-sized box or a non-invertible fit (degenerate — never produced by
/// [`view_box_transform`] for a positive box, kept as a guard).
pub(crate) fn cursor_to_user_space(
    view_box: Option<&ViewBox>,
    node_size: Vec2,
    scale_factor: f32,
    local_physical: Vec2,
) -> Option<Vec2> {
    let (w, h) = crate::canvas::clamp_physical_size(node_size);
    if w == 0 || h == 0 {
        return None;
    }
    view_box_transform(view_box, w, h, scale_factor)
        .invert()
        .map(|inverse| map_point(inverse, local_physical))
}

/// The pure core: first shape in `shapes_topmost_first` whose painted
/// geometry contains `user_pos`. Each candidate's composed transform (groups
/// folded in, viewBox excluded — `user_pos` is already user space) is
/// inverted to carry the cursor into shape-local space for
/// [`hit_shape`]; a non-invertible transform (zero-area on screen) skips the
/// shape.
pub(crate) fn refine_hit<'a>(
    shapes_topmost_first: &[(Entity, Transform)],
    lookup: impl Fn(Entity) -> Option<&'a SvgShape>,
    user_pos: Vec2,
) -> Option<Entity> {
    shapes_topmost_first
        .iter()
        .find_map(|&(entity, transform)| {
            let shape = lookup(entity)?;
            let inverse = transform.invert()?; // zero on-screen area: skip
            hit_shape(shape.kind, &shape.attrs, map_point(inverse, user_pos)).then_some(entity)
        })
}

/// Apply a tiny-skia affine to a point.
pub(super) fn map_point(t: Transform, p: Vec2) -> Vec2 {
    let mut pt = tiny_skia::Point::from_xy(p.x, p.y);
    t.map_point(&mut pt);
    Vec2::new(pt.x, pt.y)
}
