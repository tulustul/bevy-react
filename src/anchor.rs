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
    pub scale: Option<AnchorScale>,
}

/// Distance-based scaling config for an anchored overlay. The applied scale is
/// `clamp(1 - distance * factor, min, max)`, so closer overlays grow and far ones
/// shrink, bounded by `min`/`max`.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnchorScale {
    /// Lower bound on the applied scale.
    pub min: f32,
    /// Upper bound on the applied scale.
    pub max: f32,
    /// Per-world-unit shrink rate (larger → shrinks faster with distance).
    pub factor: f32,
}

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
    pub scale: Option<AnchorScale>,
}

/// Reposition every [`Anchored`] node each frame: project its target's world
/// position through the UI camera and write the result into the node's
/// `left`/`top`, centered on the anchor point. Hides the overlay when the target
/// has despawned or its anchor point is behind the camera / off-screen.
///
/// Registered in `Update` ordered after the op drain so it overrides this frame's
/// static style. A no-op when no anchored nodes exist.
#[allow(clippy::type_complexity)]
pub fn position_anchored_nodes(
    default_cam: Query<(&Camera, &GlobalTransform), With<IsDefaultUiCamera>>,
    other_cam: Query<(&Camera, &GlobalTransform), Without<IsDefaultUiCamera>>,
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
    // camera (the library's own `Camera2d` has no marker).
    let Some((cam, cam_tf)) = default_cam
        .iter()
        .next()
        .or_else(|| other_cam.iter().next())
    else {
        return;
    };

    for (entity, anchor, child_of, mut node, mut visibility, mut transform) in &mut anchored {
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
        let scale = match anchor.scale {
            Some(c) => (1.0 - world.distance(cam_tf.translation()) * c.factor).clamp(c.min, c.max),
            None => 1.0,
        };
        if transform.scale != Vec2::splat(scale) {
            transform.scale = Vec2::splat(scale);
        }

        // `world_to_viewport` is in logical pixels, but `bevy_ui` positions an
        // absolute node relative to its parent's box — so subtract the parent's
        // top-left. Also center this node on the anchor using its own size.
        let parent_top_left = child_of
            .and_then(|c| ui_nodes.get(c.parent()).ok())
            .map(|(n, gt)| logical_top_left(n, gt))
            .unwrap_or(Vec2::ZERO);
        let half = ui_nodes
            .get(entity)
            .map(|(n, _)| n.size() * n.inverse_scale_factor() / 2.0)
            .unwrap_or(Vec2::ZERO);
        let local = viewport - parent_top_left - half;

        node.position_type = PositionType::Absolute;
        node.left = Val::Px(local.x);
        node.top = Val::Px(local.y);
        set_visibility(&mut visibility, Visibility::Inherited);
    }
}

/// The logical-pixel top-left corner of a laid-out UI node, from its physical
/// absolute center ([`UiGlobalTransform`]) and physical size ([`ComputedNode`]).
/// `bevy_ui`'s `Val::Px` insets are logical, so anchoring math works in logical
/// pixels throughout.
fn logical_top_left(node: &ComputedNode, transform: &UiGlobalTransform) -> Vec2 {
    let inv = node.inverse_scale_factor();
    transform.translation * inv - node.size() * inv / 2.0
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
    use crate::protocol::Props;

    #[test]
    fn props_deserialize_anchor() {
        // entity bits 2^32 + 1 = index 1, generation 1 (a realistic value).
        let props: Props = serde_json::from_value(serde_json::json!({
            "anchor": {
                "entity": 4294967297u64,
                "offset": [0.0, 1.0, 0.0],
                "scale": { "min": 0.4, "max": 2.0, "factor": 0.03 }
            }
        }))
        .unwrap();
        let anchor = props.anchor.expect("anchor present");
        assert_eq!(anchor.entity as u64, 4_294_967_297);
        assert_eq!(anchor.offset, Some([0.0, 1.0, 0.0]));
        let scale = anchor.scale.expect("scale present");
        assert_eq!((scale.min, scale.max, scale.factor), (0.4, 2.0, 0.03));
    }

    #[test]
    fn anchor_offset_defaults_to_none() {
        let props: Props = serde_json::from_value(serde_json::json!({
            "anchor": { "entity": 1u64 }
        }))
        .unwrap();
        assert_eq!(props.anchor.unwrap().offset, None);
    }
}
