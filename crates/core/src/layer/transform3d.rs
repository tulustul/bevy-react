//! The composite-time 3D transform on a promoted layer (`transform3d` style).
//!
//! The style's presence promotes the subtree
//! ([`PromotionReasons::TRANSFORM3D`](super::PromotionReasons::TRANSFORM3D));
//! this module owns what happens after: the raw wire params live in
//! [`LayerTransform3d`] (written by the style applier, overwritten per-frame by
//! the transition/animation drivers), and [`sync_transform3d_matrices`] derives
//! the [`LayerTransform3dMatrix`] the render side composites the quad through.
//! The matrix reshapes the *composite quad only* — the capture, layout,
//! and every main-world system see the untransformed node — so a matrix
//! change is composite-only dirt: it never re-captures the layer itself, only
//! re-draws the enclosing chain (same cost model as translation/group alpha).
//!
//! Space conventions: the matrix is built in **physical screen px** (the
//! space of composite-quad vertices and `UiGlobalTransform`), x right,
//! y down, z toward the viewer (CSS's screen space). Wire lengths are logical
//! px and scale by the node's scale factor; angles arrive as radians from
//! [`protocol::units::Angle`]. Self-perspective divides by `w = 1 − z/d` so positive
//! `translateZ` moves toward the viewer and magnifies, with the vanishing
//! point at the resolved `origin`.

use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};

use super::{LayerContentDirt, PromotedLayer};
use crate::protocol::{self, animatable::AnimatableField, transform::Transform3d, units::Length};

/// The `transform3d` style params on a promoted layer root, exactly as merged
/// from the wire (base style + active interaction variants). Written by
/// `apply_style_masked` under the `TRANSFORM3D` group; the transition and
/// animation drivers overwrite it per-frame. Removed on demotion (see
/// `evaluate_layer_promotions`) — style apply never removes it, mirroring the
/// `UiTransform` never-remove rule.
#[derive(Component, Debug, Clone, PartialEq)]
pub struct LayerTransform3d(pub Transform3d);

/// The matrix derived from [`LayerTransform3d`] + this frame's layout, in
/// physical screen px. Separate from the params component so per-frame
/// rebuilds (layout moves, animation) aren't style-state changes — the same
/// split as `LayerGroupAlpha`. Consumed by render extraction (composite quad)
/// and by the transformed-picking driver (`layer::pick3d`).
#[derive(Component, Debug, Clone, Copy, PartialEq)]
pub struct LayerTransform3dMatrix {
    /// Maps untransformed physical-screen quad positions to their transformed
    /// homogeneous position (real `w`: consumers must perspective-divide, and
    /// the composite vertex stage passes `w` through for perspective-correct
    /// interpolation).
    pub model: Mat4,
    /// Whether the params are identity — the render and picking fast path
    /// (identity layers behave exactly like untransformed ones; promotion
    /// itself is value-blind).
    pub identity: bool,
}

/// Resolve one `origin` axis against the border-box extent (physical px).
/// `Px` is a logical-px offset from the box's min edge; `Percent` is a
/// fraction of the extent. Anything else (`auto`, viewport units) has no
/// sensible meaning for a pivot — fall back to center and report.
fn resolve_origin_axis(len: Length, extent: f32, scale_factor: f32) -> (f32, bool) {
    match len {
        Length::Px(px) => (px * scale_factor, false),
        Length::Percent(pct) => (extent * pct / 100.0, false),
        _ => (extent * 0.5, true),
    }
}

/// The resolved pivot as an offset from the border-box min, in physical px,
/// plus whether an unsupported unit fell back to center (caller reports —
/// this stays pure for tests). Percent resolves against the **border box**,
/// not the outset-inflated capture rect: a blur outset must not move the pivot.
pub fn resolve_origin(params: &Transform3d, size: Vec2, scale_factor: f32) -> (Vec2, bool) {
    let origin = params.origin.clone().unwrap_or_default();
    // An animated axis reads as its default center until the animation applier
    // overwrites the params with the evaluated static value each frame.
    let axis = |a: &crate::protocol::animatable::Animatable<Length>| {
        a.value().copied().unwrap_or(Length::Percent(50.0))
    };
    let (x, warn_x) = resolve_origin_axis(axis(&origin.x), size.x, scale_factor);
    let (y, warn_y) = resolve_origin_axis(axis(&origin.y), size.y, scale_factor);
    (Vec2::new(x, y), warn_x || warn_y)
}

/// Build the composite matrix for one layer in physical screen px.
/// `border_min`/`border_size` are the node's border box (NOT the
/// outset-inflated `LayerCaptureRect`). Canonical order around the resolved
/// origin `o`: `M = T(o) · P(d) · T(t) · Rz · Ry · Rx · S · T(−o)` — column
/// vectors, rightmost applies first, i.e. scale, then rotations, then
/// translation, then the self-perspective projection, all about the pivot.
pub fn build_transform3d_matrix(
    params: &Transform3d,
    border_min: Vec2,
    border_size: Vec2,
    scale_factor: f32,
) -> Mat4 {
    let (origin_offset, _) = resolve_origin(params, border_size, scale_factor);
    let o = (border_min + origin_offset).extend(0.0);

    // `scale` is uniform unless a per-axis override wins (same precedence as
    // the 2D `build_ui_transform`). Z never scales: the subtree is a plane.
    let uniform = params.scale.static_val().unwrap_or(1.0);
    let scale = Mat4::from_scale(Vec3::new(
        params.scale_x.static_val().unwrap_or(uniform),
        params.scale_y.static_val().unwrap_or(uniform),
        1.0,
    ));
    let rx = Mat4::from_rotation_x(params.rotate_x.static_val().unwrap_or_default().radians());
    let ry = Mat4::from_rotation_y(params.rotate_y.static_val().unwrap_or_default().radians());
    let rz = Mat4::from_rotation_z(params.rotate_z.static_val().unwrap_or_default().radians());
    let translate = Mat4::from_translation(
        Vec3::new(
            params.translate_x.static_val().unwrap_or(0.0),
            params.translate_y.static_val().unwrap_or(0.0),
            params.translate_z.static_val().unwrap_or(0.0),
        ) * scale_factor,
    );
    // Self-perspective: w' = 1 − z/d (z toward the viewer shrinks w →
    // magnifies after the divide). A non-positive focal distance is
    // meaningless — treat like unset (orthographic).
    let mut perspective = Mat4::IDENTITY;
    if let Some(d) = params.perspective.static_val().filter(|d| *d > 0.0) {
        perspective.z_axis.w = -1.0 / (d * scale_factor);
    }

    Mat4::from_translation(o)
        * perspective
        * translate
        * rz
        * ry
        * rx
        * scale
        * Mat4::from_translation(-o)
}

/// Derives [`LayerTransform3dMatrix`] from this frame's layout for every
/// promoted root carrying [`LayerTransform3d`], and pushes composite-only dirt
/// on change. Runs in `PostUpdate` after `sync_layer_geometry` (needs final
/// layout) and before `resolve_layer_repaints` (which drains the dirt).
///
/// This is the **single dirt choke point** for the transform: the style
/// applier, transitions, and animation bindings all just write the params
/// component; whatever actually changed the matrix lands here once.
#[allow(clippy::type_complexity)]
pub fn sync_transform3d_matrices(
    mut commands: Commands,
    roots: Query<
        (
            Entity,
            &ComputedNode,
            &UiGlobalTransform,
            &LayerTransform3d,
            Option<&LayerTransform3dMatrix>,
            &crate::bridge::ReactNode,
        ),
        With<PromotedLayer>,
    >,
    mut dirt: ResMut<LayerContentDirt>,
) {
    for (entity, computed, transform, params, existing, rnode) in &roots {
        let size = computed.size();
        if size.x <= 0.5 || size.y <= 0.5 {
            continue; // Not laid out yet / empty: no quad to transform.
        }
        let min = transform.translation - size * 0.5;
        let scale_factor = 1.0 / computed.inverse_scale_factor();
        let (_, origin_fallback) = resolve_origin(&params.0, size, scale_factor);
        if origin_fallback {
            let _diag = crate::diag::node_scope(rnode.0);
            crate::diag::report(
                "length",
                "origin",
                "transform3d origin supports px and % only; falling back to 50%",
            );
        }
        let next = LayerTransform3dMatrix {
            model: build_transform3d_matrix(&params.0, min, size, scale_factor),
            identity: params.0.is_identity(),
        };
        if existing != Some(&next) {
            commands.entity(entity).insert(next);
            // Composite-only: the quad reshapes; the capture is untouched.
            // Dirties the enclosing chain only (`resolve_layer_repaints`).
            dirt.composite_only.push(entity);
        }
    }
}

/// Convenience for the wire params carried by a style, if any.
pub fn style_transform3d(style: &Option<protocol::style::Style>) -> Option<Transform3d> {
    style.as_ref().and_then(|s| s.transform3d.clone())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::transform::Transform3dOrigin;

    fn deg(
        v: f32,
    ) -> Option<crate::protocol::animatable::Animatable<crate::protocol::units::Angle>> {
        serde_json::from_value(serde_json::json!(v)).ok()
    }

    /// Static-wrap a scalar channel value.
    fn st(v: f32) -> Option<crate::protocol::animatable::Animatable<f32>> {
        Some(crate::protocol::animatable::Animatable::Static(v))
    }

    /// Static-wrap an origin axis.
    fn ax(l: Length) -> crate::protocol::animatable::Animatable<Length> {
        crate::protocol::animatable::Animatable::Static(l)
    }

    /// The resolved origin is the fixed point of the transform for any
    /// rotation/scale combination (no translate/perspective).
    #[test]
    fn origin_is_the_fixed_point() {
        let params = Transform3d {
            rotate_z: deg(45.0),
            rotate_y: deg(30.0),
            scale: st(2.0),
            origin: Some(Transform3dOrigin {
                x: ax(Length::Px(10.0)),
                y: ax(Length::Px(20.0)),
            }),
            ..Default::default()
        };
        let m =
            build_transform3d_matrix(&params, Vec2::new(100.0, 200.0), Vec2::new(50.0, 50.0), 1.0);
        let o = Vec3::new(110.0, 220.0, 0.0);
        assert!(m.project_point3(o).abs_diff_eq(o, 1e-3));
    }

    /// `rotateY(90°)` turns the plane edge-on: every point's x collapses onto
    /// the origin's x (orthographic).
    #[test]
    fn rotate_y_90_collapses_x() {
        let params = Transform3d {
            rotate_y: deg(90.0),
            ..Default::default()
        };
        // Default origin = center: (150, 100).
        let m = build_transform3d_matrix(
            &params,
            Vec2::new(100.0, 50.0),
            Vec2::new(100.0, 100.0),
            1.0,
        );
        let p = m.project_point3(Vec3::new(180.0, 60.0, 0.0));
        assert!(
            (p.x - 150.0).abs() < 1e-3,
            "x collapsed to origin.x, got {}",
            p.x
        );
        assert!((p.y - 60.0).abs() < 1e-3, "y untouched, got {}", p.y);
    }

    /// Self-perspective: a point pushed to `z = d/2` lands at `w = 0.5`, so
    /// its offset from the origin doubles after the divide, and positive
    /// `translateZ` magnifies.
    #[test]
    fn perspective_divide_magnifies_toward_viewer() {
        let params = Transform3d {
            perspective: st(100.0),
            translate_z: st(50.0),
            origin: Some(Transform3dOrigin {
                x: ax(Length::Px(0.0)),
                y: ax(Length::Px(0.0)),
            }),
            ..Default::default()
        };
        let m = build_transform3d_matrix(&params, Vec2::ZERO, Vec2::new(100.0, 100.0), 1.0);
        let p = m.project_point3(Vec3::new(10.0, 6.0, 0.0));
        assert!(p.xy().abs_diff_eq(Vec2::new(20.0, 12.0), 1e-3), "got {p}");
        // And the raw homogeneous w is real (not flattened) — the composite
        // shader depends on it for perspective-correct interpolation.
        let raw = m * Vec4::new(10.0, 6.0, 0.0, 1.0);
        assert!((raw.w - 0.5).abs() < 1e-4);
    }

    /// Per-axis scale overrides the uniform channel (2D precedence rule).
    #[test]
    fn per_axis_scale_overrides_uniform() {
        let params = Transform3d {
            scale: st(2.0),
            scale_x: st(3.0),
            origin: Some(Transform3dOrigin {
                x: ax(Length::Px(0.0)),
                y: ax(Length::Px(0.0)),
            }),
            ..Default::default()
        };
        let m = build_transform3d_matrix(&params, Vec2::ZERO, Vec2::new(10.0, 10.0), 1.0);
        let p = m.project_point3(Vec3::new(1.0, 1.0, 0.0));
        assert!(p.xy().abs_diff_eq(Vec2::new(3.0, 2.0), 1e-4));
    }

    /// Wire lengths are logical px: translation and origin offsets scale by
    /// the node's scale factor; percent origins don't (already physical).
    #[test]
    fn scale_factor_converts_logical_lengths() {
        let params = Transform3d {
            translate_x: st(10.0),
            origin: Some(Transform3dOrigin {
                x: ax(Length::Px(5.0)),
                y: ax(Length::Percent(50.0)),
            }),
            ..Default::default()
        };
        let (offset, warned) = resolve_origin(&params, Vec2::new(100.0, 100.0), 2.0);
        assert!(!warned);
        assert_eq!(offset, Vec2::new(10.0, 50.0));
        let m = build_transform3d_matrix(&params, Vec2::ZERO, Vec2::new(100.0, 100.0), 2.0);
        let p = m.project_point3(Vec3::ZERO);
        assert!(p.xy().abs_diff_eq(Vec2::new(20.0, 0.0), 1e-4));
    }

    /// A params change on a promoted root rebuilds the matrix and pushes
    /// composite-only dirt (never content dirt); a settled value pushes
    /// nothing on re-run.
    #[test]
    fn sync_pushes_composite_only_dirt_on_change() {
        use bevy::ecs::system::RunSystemOnce;
        use bevy::math::Affine2;

        let mut world = World::new();
        world.init_resource::<LayerContentDirt>();
        let root = world
            .spawn((
                ComputedNode {
                    size: Vec2::new(100.0, 50.0),
                    ..Default::default()
                },
                UiGlobalTransform::from(Affine2::from_translation(Vec2::new(200.0, 100.0))),
                LayerTransform3d(Transform3d {
                    rotate_y: deg(30.0),
                    ..Default::default()
                }),
                PromotedLayer {
                    reasons: super::super::PromotionReasons(
                        super::super::PromotionReasons::TRANSFORM3D,
                    ),
                },
                crate::bridge::ReactNode(7),
            ))
            .id();

        world.run_system_once(sync_transform3d_matrices).unwrap();
        let dirt = world.resource::<LayerContentDirt>();
        assert_eq!(dirt.composite_only, vec![root], "first build dirties");
        assert!(dirt.nodes.is_empty(), "never content dirt");
        let matrix = world.get::<LayerTransform3dMatrix>(root).expect("derived");
        assert!(!matrix.identity);

        // Settled: same params + geometry → no new dirt, component untouched.
        world
            .resource_mut::<LayerContentDirt>()
            .composite_only
            .clear();
        world.run_system_once(sync_transform3d_matrices).unwrap();
        assert!(
            world
                .resource::<LayerContentDirt>()
                .composite_only
                .is_empty()
        );

        // Param change → rebuild + dirt again.
        world.get_mut::<LayerTransform3d>(root).unwrap().0.rotate_y = deg(60.0);
        world.run_system_once(sync_transform3d_matrices).unwrap();
        assert_eq!(
            world.resource::<LayerContentDirt>().composite_only,
            vec![root]
        );
    }

    /// Unsupported origin units fall back to center and flag for the diag
    /// report; a non-positive perspective is orthographic.
    #[test]
    fn origin_fallback_and_bad_perspective() {
        let params = Transform3d {
            origin: Some(Transform3dOrigin {
                x: ax(Length::Auto),
                y: ax(Length::Px(0.0)),
            }),
            perspective: st(0.0),
            translate_z: st(50.0),
            ..Default::default()
        };
        let (offset, warned) = resolve_origin(&params, Vec2::new(80.0, 60.0), 1.0);
        assert!(warned);
        assert_eq!(offset.x, 40.0);
        let m = build_transform3d_matrix(&params, Vec2::ZERO, Vec2::new(80.0, 60.0), 1.0);
        // Orthographic: translateZ has no x/y effect, w stays 1.
        let raw = m * Vec4::new(10.0, 10.0, 0.0, 1.0);
        assert_eq!(raw.w, 1.0);
    }
}
