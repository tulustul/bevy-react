//! ECS-side tree walking for JSX `<svg>` rasterization: the depth-first
//! shape walk (flattening `<g>` groups by composing transforms and opacity,
//! visiting paintable leaves in ECS child order — which IS paint order, the
//! hierarchy sync guarantees it) and the `ChildOf` climb that attributes a
//! changed shape to its enclosing `<svg>` root. Pure functions over query
//! params — no systems here; [`super::raster::update_svg_surfaces`] drives
//! both.

use bevy::prelude::*;
use tiny_skia::Transform;

use super::{ShapeKind, SvgShape, SvgSurface};
use crate::protocol::AnimatableField;

/// Defensive bound on `ChildOf` climbs and group-nesting recursion. Deep
/// nesting is app-authored input (65 nested `<g>`s), not an engine invariant,
/// so hitting it warns and stops (skip, never hang or panic).
const MAX_DEPTH: usize = 64;

/// Read-only view of the shape tree: each entity's [`SvgShape`] plus its
/// child list (`None` for leaves). The one query shape both the raster system
/// and the walker share.
pub(crate) type ShapeQuery<'w, 's> = Query<'w, 's, (&'static SvgShape, Option<&'static Children>)>;

/// Visit every paintable **leaf** under `children` depth-first, in ECS child
/// order (= paint order). A `<g>` composes: its `transform` applies before
/// the running transform (`pre_concat`) and its `opacity` multiplies into the
/// inherited opacity; the group itself is never visited (it has no geometry).
/// Entities without an [`SvgShape`] (invalid children under an svg root) are
/// skipped silently. The visitor receives each leaf's `Entity` so consumers
/// that need identity (the per-shape hit refinement) can collect it; the
/// rasterizer ignores it.
pub(crate) fn walk_shapes(
    children: &Children,
    shapes: &ShapeQuery,
    transform: Transform,
    opacity: f32,
    visit: &mut impl FnMut(Entity, &SvgShape, Transform, f32),
) {
    walk_inner(children, shapes, transform, opacity, 0, visit);
}

fn walk_inner(
    children: &Children,
    shapes: &ShapeQuery,
    transform: Transform,
    opacity: f32,
    depth: usize,
    visit: &mut impl FnMut(Entity, &SvgShape, Transform, f32),
) {
    if depth >= MAX_DEPTH {
        warn!("svg shape walk exceeded {MAX_DEPTH} nested groups; skipping deeper shapes");
        return;
    }
    for child in children.iter() {
        let Ok((shape, kids)) = shapes.get(child) else {
            continue; // not a shape (invalid child under an svg root)
        };
        if shape.kind == ShapeKind::Group {
            let t = match &shape.attrs.transform {
                Some(gt) => transform.pre_concat(gt.into()),
                None => transform,
            };
            let o = opacity
                * shape
                    .attrs
                    .opacity
                    .static_or_seed()
                    .unwrap_or(1.0)
                    .clamp(0.0, 1.0);
            if let Some(kids) = kids {
                walk_inner(kids, shapes, t, o, depth + 1, visit);
            }
        } else {
            visit(child, shape, transform, opacity);
        }
    }
}

/// The nearest ancestor carrying an [`SvgSurface`] — the `<svg>` root a
/// changed shape's re-raster must be attributed to. Shapes are Node-less, so
/// this is pure `ChildOf` hops; `None` for an orphan (mid-teardown) or a
/// shape not under any svg root.
pub(crate) fn climb_to_svg_root(
    start: Entity,
    parents: &Query<&ChildOf>,
    roots: &Query<(), With<SvgSurface>>,
) -> Option<Entity> {
    let mut entity = start;
    for _ in 0..MAX_DEPTH {
        let parent = parents.get(entity).ok()?.parent();
        if roots.contains(parent) {
            return Some(parent);
        }
        entity = parent;
    }
    warn!("svg ChildOf climb exceeded {MAX_DEPTH} hops without reaching an <svg> root; skipping");
    None
}

#[cfg(test)]
mod tests {
    use bevy::ecs::system::SystemState;

    use super::*;
    use crate::svg::{ShapeAttrs, ShapeTransform, st};

    fn shape(kind: ShapeKind, attrs: ShapeAttrs) -> SvgShape {
        SvgShape { kind, attrs }
    }

    /// Hand-built world: root → [circle, g(translate(10 0), opacity 0.5) →
    /// [rect], line, non-shape]. The flattened visit order is ECS order with
    /// the group composed into its child's transform/opacity — and the
    /// non-shape child skipped.
    #[test]
    fn walk_flattens_groups_in_ecs_order_with_composed_state() {
        let mut world = World::new();
        let root = world.spawn_empty().id();
        let circle = world
            .spawn((
                shape(ShapeKind::Circle, ShapeAttrs::default()),
                ChildOf(root),
            ))
            .id();
        let g_attrs = ShapeAttrs {
            transform: Some(ShapeTransform([1.0, 0.0, 0.0, 1.0, 10.0, 0.0])),
            opacity: st(0.5),
            ..Default::default()
        };
        let g = world
            .spawn((shape(ShapeKind::Group, g_attrs), ChildOf(root)))
            .id();
        let rect = world
            .spawn((shape(ShapeKind::Rect, ShapeAttrs::default()), ChildOf(g)))
            .id();
        let line = world
            .spawn((shape(ShapeKind::Line, ShapeAttrs::default()), ChildOf(root)))
            .id();
        world.spawn(ChildOf(root)); // no SvgShape → skipped silently

        let mut state: SystemState<(ShapeQuery, Query<&Children>)> = SystemState::new(&mut world);
        let (shapes, children) = state.get(&world).unwrap();
        let outer = Transform::from_scale(2.0, 2.0);
        let mut visited: Vec<(Entity, ShapeKind, Transform, f32)> = Vec::new();
        walk_shapes(
            children.get(root).unwrap(),
            &shapes,
            outer,
            1.0,
            &mut |e, s, t, o| visited.push((e, s.kind, t, o)),
        );

        assert_eq!(
            visited.iter().map(|v| (v.0, v.1)).collect::<Vec<_>>(),
            vec![
                (circle, ShapeKind::Circle),
                (rect, ShapeKind::Rect),
                (line, ShapeKind::Line),
            ],
            "flattened leaves (with their entities) in ECS order; the group itself never visited"
        );
        assert_eq!(visited[0].2, outer, "plain leaf keeps the outer transform");
        assert_eq!(visited[0].3, 1.0);
        assert_eq!(
            visited[1].2,
            Transform::from_row(2.0, 0.0, 0.0, 2.0, 20.0, 0.0),
            "group translate composes INSIDE the outer scale (pre_concat)"
        );
        assert_eq!(visited[1].3, 0.5, "group opacity multiplies down");
        assert_eq!(
            visited[2].2, outer,
            "the group's state never leaks to siblings"
        );
        assert_eq!(visited[2].3, 1.0);
    }

    /// The climb finds the nearest `SvgSurface` ancestor through nested
    /// groups; an orphan (no parents at all) resolves to `None`.
    #[test]
    fn climb_finds_nearest_svg_root_and_bails_on_orphans() {
        let mut world = World::new();
        let root = world.spawn(SvgSurface::jsx(None)).id();
        let g = world
            .spawn((
                shape(ShapeKind::Group, ShapeAttrs::default()),
                ChildOf(root),
            ))
            .id();
        let leaf = world
            .spawn((shape(ShapeKind::Circle, ShapeAttrs::default()), ChildOf(g)))
            .id();
        let orphan = world
            .spawn(shape(ShapeKind::Circle, ShapeAttrs::default()))
            .id();

        #[allow(clippy::type_complexity)]
        let mut state: SystemState<(Query<&ChildOf>, Query<(), With<SvgSurface>>)> =
            SystemState::new(&mut world);
        let (parents, roots) = state.get(&world).unwrap();
        assert_eq!(climb_to_svg_root(leaf, &parents, &roots), Some(root));
        assert_eq!(climb_to_svg_root(g, &parents, &roots), Some(root));
        assert_eq!(climb_to_svg_root(orphan, &parents, &roots), None);
    }
}
