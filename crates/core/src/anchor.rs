//! World-anchored UI overlays (the `<anchor>` element).
//!
//! An anchored element is an ordinary screen-space `bevy_ui` node, but each frame
//! its on-screen position is recomputed by projecting a target entity's world
//! position (plus an optional offset) through the UI camera. That is how floating
//! labels, nameplates, and health bars track a 3D entity while staying flat,
//! fully interactive overlays — no render-to-texture, no second camera, no
//! synthetic-pointer picking (clicks ride the normal `Interaction` path).

use bevy::prelude::*;
use bevy::ui::{IsDefaultUiCamera, UiGlobalTransform, UiTransform, Val2};
use serde::Deserialize;

/// The wire form of an `<anchor>`'s `anchor` prop: the Bevy entity to follow
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

/// Component stamped (by the main reconciler) on any `<anchor>` element. Carries the
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
/// `UiTransform.translation`, centered on the anchor point. The node's layout
/// position is a one-time seed (`position_type: Absolute`, `left`/`top` `0`) —
/// movement rides the transform, which is **not** a layout input, so a moving
/// anchor (every frame, while the camera orbits) never re-runs taffy. The
/// trade-off: anchored nodes **own** `translation` — a style/animated
/// `translate` on an `<anchor>` is overwritten each frame (`scale` composes
/// with distance scaling as before; `rotation` is untouched). Hides the overlay
/// until it has been laid out (so it never flashes uncentered on spawn), and
/// when the target has despawned or its anchor point is behind the camera /
/// off-screen.
///
/// Each anchored node is also reparented under the shared [`AnchorLayer`] so it lives
/// in its own hierarchy and never contributes to the flex layout or scrollable
/// `content_size` of whatever app container it was declared in (it sits at the
/// layer's origin; the transform translation doesn't feed `content_size`). The
/// reparent self-heals if a React reorder ever moves the node back.
///
/// Registered in `Update` ordered after the op drain so it overrides this frame's
/// static style, and after the animation/transition drivers so its `translation`
/// write deterministically wins over theirs. A no-op when no anchored nodes exist.
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
    // Anchored nodes position relative to the layer's box, so subtract its
    // actual top-left. Usually that's the window origin (absolute `left`/`top`
    // 0 under the full-window root), but devtools' reserve-space mode insets
    // the root's margin, shifting the layer with it. The layer is 0×0, so its
    // transform translation IS its top-left (physical → logical). Pre-first-
    // layout the translation is zero — identical to the old `Vec2::ZERO`
    // constant — and a margin change (dock toggle / live panel resize) lags
    // here by one frame, which is accepted.
    let parent_top_left = ui_nodes
        .get(layer_entity)
        .map(|(c, t)| t.translation * c.inverse_scale_factor())
        .unwrap_or(Vec2::ZERO);

    for (entity, anchor, child_of, mut node, mut visibility, mut transform) in &mut anchored {
        // Move the overlay into the shared anchor layer (once; self-heals on reorder) so
        // it can't affect its declared parent's flex layout or scroll range. Done before
        // the layout-readiness guards so it happens even while the node waits to be laid
        // out below.
        if child_of.map(|c| c.parent()) != Some(layer_entity) {
            commands.entity(entity).insert(ChildOf(layer_entity));
        }

        // Seed the layout position once (self-heals after a re-render's
        // wholesale `Node` re-stamp): always absolute — so a hidden overlay
        // never takes flex-flow space — anchored at the layer's origin. The
        // node MOVES via `UiTransform.translation` below, never `left`/`top`,
        // which are taffy inputs and would force a full relayout every frame
        // the camera orbits. Guarded so a settled overlay doesn't tick
        // `Changed<Node>` (a relayout) every frame.
        if node.position_type != PositionType::Absolute
            || node.left != Val::Px(0.0)
            || node.top != Val::Px(0.0)
        {
            node.position_type = PositionType::Absolute;
            node.left = Val::Px(0.0);
            node.top = Val::Px(0.0);
        }

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

        // `world_to_viewport` is in logical pixels, but the node is laid out at
        // the anchor layer's origin (`left`/`top` 0 above) — so subtract the
        // layer's top-left (computed once above). Also center this node on the
        // anchor using its own size. Applied as a transform translation
        // (logical px, resolved physical exactly like `left`/`top` would be),
        // compare-guarded so a static camera + target settles.
        let half = computed.size() * computed.inverse_scale_factor() / 2.0;
        let local = viewport - parent_top_left - half;

        let translation = Val2::px(local.x, local.y);
        if transform.translation != translation {
            transform.translation = translation;
        }
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
    use crate::protocol::props::Props;

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

    /// An anchored overlay moves via `UiTransform.translation` — never
    /// `Node.left/top`, which are taffy inputs. A moving target (the every-frame
    /// case while the camera orbits) must not tick `Changed<Node>` (a relayout)
    /// after the one-time seed, and a static frame must tick neither.
    #[test]
    fn anchored_move_never_ticks_node() {
        use super::{AnchorLayer, Anchored, position_anchored_nodes};
        use bevy::camera::{ComputedCameraValues, RenderTargetInfo};
        use bevy::ecs::schedule::Schedule;
        use bevy::prelude::*;
        use bevy::ui::{ComputedNode, IsDefaultUiCamera, UiGlobalTransform, UiTransform, Val2};

        #[derive(Resource, Default)]
        struct Probe {
            node: usize,
            transform: usize,
        }

        // A camera whose projection + target info are hand-built so
        // `world_to_viewport` works headless; the expected positions below are
        // computed with the very same method the system uses.
        let camera = Camera {
            computed: ComputedCameraValues {
                clip_from_view: Mat4::perspective_infinite_reverse_rh(
                    std::f32::consts::FRAC_PI_4,
                    1.0,
                    0.1,
                ),
                target_info: Some(RenderTargetInfo {
                    physical_size: UVec2::new(1000, 1000),
                    scale_factor: 1.0,
                }),
                ..Default::default()
            },
            ..Default::default()
        };
        let cam_tf = GlobalTransform::default(); // at origin, looking -Z
        let half = Vec2::new(10.0, 5.0); // badge is 20x10 at scale factor 1
        let expected = |world_pos: Vec3| {
            let viewport = camera
                .world_to_viewport(&cam_tf, world_pos)
                .expect("test points are in front of the camera");
            Val2::px(viewport.x - half.x, viewport.y - half.y)
        };

        let mut world = World::new();
        world.init_resource::<Probe>();
        world.spawn((camera.clone(), cam_tf, IsDefaultUiCamera));
        let layer = world
            .spawn((
                AnchorLayer,
                ComputedNode::default(),
                UiGlobalTransform::default(),
            ))
            .id();
        let pos_a = Vec3::new(0.0, 0.0, -10.0);
        let target = world.spawn(GlobalTransform::from_translation(pos_a)).id();
        let badge = world
            .spawn((
                Node::default(),
                ComputedNode {
                    size: Vec2::new(20.0, 10.0),
                    inverse_scale_factor: 1.0,
                    ..Default::default()
                },
                UiGlobalTransform::default(),
                Anchored {
                    target,
                    offset: Vec3::ZERO,
                    scale: None,
                },
                ChildOf(layer),
            ))
            .id();

        let mut apply = Schedule::default();
        apply.add_systems(position_anchored_nodes);
        // A separate detect schedule so each `Changed` filter spans exactly one
        // apply run.
        let mut detect = Schedule::default();
        detect.add_systems(
            |nodes: Query<(), (Changed<Node>, With<Anchored>)>,
             transforms: Query<(), (Changed<UiTransform>, With<Anchored>)>,
             mut probe: ResMut<Probe>| {
                probe.node += nodes.iter().count();
                probe.transform += transforms.iter().count();
            },
        );

        // Frame 1: the seed writes Node (absolute at the layer origin) and the
        // first translation. Burn the spawn's Changed ticks with it.
        apply.run(&mut world);
        detect.run(&mut world);
        assert_eq!(
            world
                .entity(badge)
                .get::<UiTransform>()
                .unwrap()
                .translation,
            expected(pos_a),
            "the projected position lands in the transform translation"
        );
        assert_eq!(
            world.entity(badge).get::<Visibility>(),
            Some(&Visibility::Inherited),
            "an on-screen anchor is visible"
        );

        // Frame 2: the target moves (simulated orbit). The overlay must follow
        // via the transform alone — no Node tick, no relayout.
        *world.resource_mut::<Probe>() = Probe::default();
        let pos_b = Vec3::new(2.0, 1.0, -10.0);
        world
            .entity_mut(target)
            .insert(GlobalTransform::from_translation(pos_b));
        apply.run(&mut world);
        detect.run(&mut world);
        let probe = world.resource::<Probe>();
        assert_eq!(
            (probe.node, probe.transform),
            (0, 1),
            "a moving anchor must ride the transform, never Node (a relayout)"
        );
        assert_eq!(
            world
                .entity(badge)
                .get::<UiTransform>()
                .unwrap()
                .translation,
            expected(pos_b),
            "the overlay follows the moved target"
        );

        // Frame 3: everything static — fully settled, neither component ticks.
        *world.resource_mut::<Probe>() = Probe::default();
        apply.run(&mut world);
        detect.run(&mut world);
        let probe = world.resource::<Probe>();
        assert_eq!(
            (probe.node, probe.transform),
            (0, 0),
            "a static anchor must tick neither Node nor UiTransform"
        );
    }
}
