//! World-anchored UI overlays (`Anchored.node`).
//!
//! An anchored element is an ordinary screen-space `bevy_ui` node, but each frame
//! its on-screen position is recomputed by projecting a target entity's world
//! position (plus an optional offset) through the UI camera. That is how floating
//! labels, nameplates, and health bars track a 3D entity while staying flat,
//! fully interactive overlays — no render-to-texture, no second camera, no
//! synthetic-pointer picking (clicks ride the normal `Interaction` path).

use bevy::prelude::*;
use bevy::ui::{IsDefaultUiCamera, UiGlobalTransform, UiTransform};
use serde::Deserialize;

/// The wire form of an `Anchored.node`'s `anchor` prop: the Bevy entity to follow
/// (as `Entity::to_bits()`), an optional world-space offset, and optional
/// distance-based scaling. Pure-serde, like the rest of [`crate::protocol`].
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Anchor {
    /// The target entity's `Entity::to_bits()` value, sent from React. Carried as
    /// `f64` because `op_flush`'s serde_v8 can't decode a struct `u64` field from a
    /// JS number or BigInt; lossless for realistic ids (well under 2^53).
    pub entity: f64,
    /// World-space offset added to the target's translation before projecting.
    #[serde(default)]
    pub offset: Option<[f32; 3]>,
    /// When set, the overlay scales with camera distance (else stays at scale 1).
    #[serde(default)]
    pub scale: Option<AnchorScaling>,
}

/// Distance-based scaling config for an anchored overlay. The applied scale is
/// `clamp(1 + factor * (base_distance / distance - 1), min, max)`, so the overlay
/// renders at scale 1 when the camera is exactly `base_distance` away, grows as it
/// gets closer, and shrinks farther out — bounded by `min`/`max`.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnchorScaling {
    /// Lower bound on the applied scale.
    pub min: f32,
    /// Upper bound on the applied scale.
    pub max: f32,
    /// Scaling strength: `0` disables scaling (always 1), `1` is true perspective
    /// (apparent size halves at twice `base_distance`), `2` scales twice as fast.
    pub factor: f32,
    /// Camera distance at which the overlay renders at scale 1.
    pub base_distance: f32,
}

impl AnchorScaling {
    /// Validate a JS-supplied config once at apply time so the per-frame math
    /// can't panic or emit a non-finite scale: any non-finite field disables
    /// scaling (`None`) with a warning, and reversed `min`/`max` bounds are
    /// swapped (a reversed pair would panic `f32::clamp` every frame).
    pub(crate) fn sanitized(self) -> Option<Self> {
        if ![self.min, self.max, self.factor, self.base_distance]
            .iter()
            .all(|v| v.is_finite())
        {
            warn!("non-finite anchor scale config {self:?}; disabling distance scaling");
            return None;
        }
        if self.min > self.max {
            warn!(
                "anchor scale min {} > max {}; swapping the bounds",
                self.min, self.max
            );
            return Some(Self {
                min: self.max,
                max: self.min,
                ..self
            });
        }
        Some(self)
    }
}

/// Distance-based scale for a [sanitized](AnchorScaling::sanitized) config: `1`
/// when the camera is exactly `base_distance` away, growing closer / shrinking
/// farther, pinned to `min..=max`. At `dist == 0` the ratio is `inf`, which
/// `clamp` pins to `max` (closest → largest); a NaN product (`factor == 0` ×
/// `inf`) resolves to `max` for the same reason.
fn distance_scale(c: &AnchorScaling, dist: f32) -> f32 {
    let raw = 1.0 + c.factor * (c.base_distance / dist - 1.0);
    if raw.is_nan() {
        c.max
    } else {
        raw.clamp(c.min, c.max)
    }
}

/// Marker for the dedicated overlay container that every [`Anchored`] node is
/// reparented under. Spawned once at startup as a zero-size, absolutely-positioned
/// child of the UI root at the window origin, so anchored overlays live in their own
/// hierarchy and never contribute to an app container's flex layout or scrollable
/// `content_size`. See [`position_anchored_nodes`].
#[derive(Component, Debug, Clone, Copy)]
pub struct AnchorLayer;

/// Component stamped (by the main reconciler) on any `Anchored.node`. Carries the
/// followed entity, world-space offset, and optional distance scaling. Requires
/// `Visibility` so the system can hide the overlay when its anchor is behind the
/// camera, and `UiTransform` so it can apply the distance scale.
#[derive(Component, Debug, Clone)]
#[require(Visibility, UiTransform)]
pub struct Anchored {
    /// The entity whose world position this overlay follows.
    pub target: Entity,
    /// World-space offset added to the target's translation before projecting.
    pub offset: Vec3,
    /// Distance-based scaling, or `None` to keep the overlay at scale 1.
    pub scale: Option<AnchorScaling>,
}

/// Reposition every [`Anchored`] node each frame: project its target's world
/// position through the UI camera and write the result into the node's
/// `left`/`top`, centered on the anchor point. Hides the overlay until it has been
/// laid out (so it never flashes uncentered on spawn), and when the target has
/// despawned or its anchor point is behind the camera / off-screen.
///
/// Each anchored node is also reparented under the shared [`AnchorLayer`] so it lives
/// in its own hierarchy: an off-screen anchor's large `left`/`top` then never inflates
/// the scrollable `content_size` of whatever app container it was declared in. The
/// reparent self-heals if a React reorder ever moves the node back.
///
/// Registered in `Update` ordered after the op drain so it overrides this frame's
/// static style. A no-op when no anchored nodes exist.
#[allow(clippy::type_complexity)]
pub fn position_anchored_nodes(
    mut commands: Commands,
    default_cam: Query<(&Camera, &GlobalTransform), With<IsDefaultUiCamera>>,
    other_cam: Query<(&Camera, &GlobalTransform), Without<IsDefaultUiCamera>>,
    layer: Query<Entity, With<AnchorLayer>>,
    targets: Query<&GlobalTransform>,
    ui_nodes: Query<(&ComputedNode, &UiGlobalTransform)>,
    mut anchored: Query<(
        Entity,
        &Anchored,
        Option<&ChildOf>,
        &mut Node,
        &mut Visibility,
        &mut UiTransform,
    )>,
) {
    // Project through the default UI camera; if none is marked, fall back to any
    // camera (the host app's UI camera may carry no marker).
    let Some((cam, cam_tf)) = default_cam
        .iter()
        .next()
        .or_else(|| other_cam.iter().next())
    else {
        return;
    };

    // The overlay container every anchored node is reparented under.
    let Ok(layer_entity) = layer.single() else {
        return;
    };
    // The layer is spawned at the window origin (absolute, `left`/`top` 0, child of the
    // full-window root), so anchored nodes — its children — position relative to (0,0).
    // Using a constant rather than reading the layer's computed transform keeps this
    // correct on the frame a node is first reparented (the reparent command below only
    // applies at the next sync point) and avoids any layout-readiness dependency.
    let parent_top_left = Vec2::ZERO;

    for (entity, anchor, child_of, mut node, mut visibility, mut transform) in &mut anchored {
        // Move the overlay into the shared anchor layer (once; self-heals on reorder) so
        // it can't affect its declared parent's flex layout or scroll range. Done before
        // the layout-readiness guards so it happens even while the node waits to be laid
        // out below.
        if child_of.map(|c| c.parent()) != Some(layer_entity) {
            commands.entity(entity).insert(ChildOf(layer_entity));
        }

        // Always absolute, so a hidden overlay never takes flex-flow space in its
        // parent (e.g. while it waits to be positioned below).
        node.position_type = PositionType::Absolute;

        // Center the overlay on the anchor using its own laid-out size. On the frame
        // it spawns, `bevy_ui` layout hasn't produced a size yet (it runs later, in
        // `PostUpdate`) and the target's transform may not have propagated — so stay
        // hidden one frame rather than flash uncentered at a stale position. By the
        // next frame the size is real and the transforms have settled.
        let Ok((computed, _)) = ui_nodes.get(entity) else {
            set_visibility(&mut visibility, Visibility::Hidden);
            continue;
        };
        if computed.size().x <= 0.0 {
            set_visibility(&mut visibility, Visibility::Hidden);
            continue;
        }

        // The target may have despawned (or not exist yet): hide until it returns.
        let Ok(target_tf) = targets.get(anchor.target) else {
            set_visibility(&mut visibility, Visibility::Hidden);
            continue;
        };

        let world = target_tf.translation() + anchor.offset;
        let Ok(viewport) = cam.world_to_viewport(cam_tf, world) else {
            // Behind the camera / outside the viewport: hide rather than clamp.
            set_visibility(&mut visibility, Visibility::Hidden);
            continue;
        };

        // Distance-based scaling (applied via `UiTransform`, which scales about the
        // node center, so the overlay stays centered on its anchor). `None` → 1.
        let scale = match &anchor.scale {
            Some(c) => distance_scale(c, world.distance(cam_tf.translation())),
            None => 1.0,
        };
        if transform.scale != Vec2::splat(scale) {
            transform.scale = Vec2::splat(scale);
        }

        // `world_to_viewport` is in logical pixels, but `bevy_ui` positions an
        // absolute node relative to its parent's box — so subtract the anchor layer's
        // top-left (computed once above). Also center this node on the anchor using its
        // own size.
        let half = computed.size() * computed.inverse_scale_factor() / 2.0;
        let local = viewport - parent_top_left - half;

        node.left = Val::Px(local.x);
        node.top = Val::Px(local.y);
        set_visibility(&mut visibility, Visibility::Inherited);
    }
}

/// Assign `visibility` only when it actually changes, so we don't trip change
/// detection (and re-propagate visibility) every frame for a stationary overlay.
fn set_visibility(visibility: &mut Mut<Visibility>, next: Visibility) {
    if **visibility != next {
        **visibility = next;
    }
}

#[cfg(test)]
mod tests {
    use super::{AnchorScaling, distance_scale};
    use crate::protocol::Props;

    fn scaling(min: f32, max: f32, factor: f32, base_distance: f32) -> AnchorScaling {
        AnchorScaling {
            min,
            max,
            factor,
            base_distance,
        }
    }

    /// Reversed bounds would panic `f32::clamp` every frame; `sanitized` swaps
    /// them instead.
    #[test]
    fn sanitize_swaps_reversed_bounds() {
        let s = scaling(2.0, 0.4, 1.0, 24.0).sanitized().expect("kept");
        assert_eq!((s.min, s.max), (0.4, 2.0));
        // An already-valid config passes through unchanged.
        let s = scaling(0.4, 2.0, 1.0, 24.0).sanitized().expect("kept");
        assert_eq!((s.min, s.max), (0.4, 2.0));
    }

    /// Any non-finite field disables scaling entirely (NaN bounds would panic
    /// `f32::clamp`; a NaN factor/base_distance would produce a NaN scale).
    #[test]
    fn sanitize_rejects_non_finite_fields() {
        for bad in [
            scaling(f32::NAN, 2.0, 1.0, 24.0),
            scaling(0.4, f32::NAN, 1.0, 24.0),
            scaling(0.4, 2.0, f32::NAN, 24.0),
            scaling(0.4, 2.0, 1.0, f32::NAN),
            scaling(0.4, f32::INFINITY, 1.0, 24.0),
        ] {
            assert!(bad.sanitized().is_none(), "kept {bad:?}");
        }
    }

    /// `dist == 0` (camera exactly on the anchor) must stay finite: the `inf`
    /// ratio pins to `max`, including the `factor == 0` case whose `0 * inf`
    /// product is NaN.
    #[test]
    fn distance_scale_is_finite_at_zero_distance() {
        let c = scaling(0.4, 2.0, 1.0, 24.0);
        assert_eq!(distance_scale(&c, 0.0), 2.0);
        let flat = scaling(0.4, 2.0, 0.0, 24.0);
        assert_eq!(distance_scale(&flat, 0.0), 2.0);
        // Normal case: at exactly base_distance the scale is 1.
        assert_eq!(distance_scale(&c, 24.0), 1.0);
    }

    #[test]
    fn props_deserialize_anchor() {
        // entity bits 2^32 + 1 = index 1, generation 1 (a realistic value).
        let props: Props = serde_json::from_value(serde_json::json!({
            "anchor": {
                "entity": 4294967297u64,
                "offset": [0.0, 1.0, 0.0],
                "scale": { "min": 0.4, "max": 2.0, "factor": 1.0, "baseDistance": 24.0 }
            }
        }))
        .unwrap();
        let anchor = props.anchor.expect("anchor present");
        assert_eq!(anchor.entity as u64, 4_294_967_297);
        assert_eq!(anchor.offset, Some([0.0, 1.0, 0.0]));
        let scale = anchor.scale.expect("scale present");
        assert_eq!(
            (scale.min, scale.max, scale.factor, scale.base_distance),
            (0.4, 2.0, 1.0, 24.0)
        );
    }

    #[test]
    fn anchor_offset_defaults_to_none() {
        let props: Props = serde_json::from_value(serde_json::json!({
            "anchor": { "entity": 1u64 }
        }))
        .unwrap();
        assert_eq!(props.anchor.unwrap().offset, None);
    }

    #[test]
    fn anchored_node_is_reparented_under_the_layer() {
        use super::{AnchorLayer, Anchored, position_anchored_nodes};
        use bevy::ecs::system::RunSystemOnce;
        use bevy::prelude::*;
        use bevy::ui::{ComputedNode, IsDefaultUiCamera, UiGlobalTransform};

        let mut world = World::new();

        // A default UI camera so the system gets past its camera guard.
        world.spawn((
            Camera::default(),
            GlobalTransform::default(),
            IsDefaultUiCamera,
        ));

        // The shared overlay layer (carries the components the layer query reads).
        let layer = world
            .spawn((
                AnchorLayer,
                ComputedNode::default(),
                UiGlobalTransform::default(),
            ))
            .id();

        // Some unrelated container the overlay was "declared" under in the React tree.
        let other_parent = world.spawn(Node::default()).id();

        // An anchored node parented under `other_parent` (not the layer). It has no
        // `ComputedNode`, so it stays hidden — but the reparent runs first regardless.
        let target = world.spawn(GlobalTransform::default()).id();
        let badge = world
            .spawn((
                Node::default(),
                Anchored {
                    target,
                    offset: Vec3::ZERO,
                    scale: None,
                },
                ChildOf(other_parent),
            ))
            .id();

        world.run_system_once(position_anchored_nodes).unwrap();

        assert_eq!(
            world.entity(badge).get::<ChildOf>().map(|c| c.parent()),
            Some(layer),
            "an anchored node must be reparented under the anchor layer"
        );
    }
}
