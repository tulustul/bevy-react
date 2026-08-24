//! Interior clips — the main-world half of clip-independent layer capture.
//!
//! A promoted layer's capture must not bake **ancestor** clipping (scroll
//! containers / viewport) into its cached pixels: the cache treats scroll as
//! pure translation (see [`super::fold_member_geometry`]), so pixels captured
//! under an ancestor clip would be stale the moment the layer scrolls. Web
//! semantics agree: `filter` applies to the element's full painted content,
//! and ancestor overflow clips the *result* at composite time.
//!
//! [`sync_layer_clips`] therefore re-runs `bevy_ui`'s clip cascade
//! (`update_clipping` semantics: a node's inherited clip is its ancestors'
//! overflow intersection; its **own** overflow only clips its children) —
//! but restarted at each layer root with **no inherited clip**. The result
//! is two per-frame maps in [`LayerClips`]:
//!
//! - `interior`: per subtree member, the clip its extracted items should use
//!   *inside the capture* — clips originating inside the subtree still apply
//!   (they move with the layer, so cached pixels stay valid); everything
//!   above the root is stripped. Consumed by the render world's
//!   extract-window swap (`layer::render::clip`), which substitutes these
//!   into the members' [`CalculatedClip`] for exactly the duration of
//!   `ExtractSchedule` — the main world is exclusively borrowed there, so no
//!   main-world system (picking, focus) can ever observe the swap, and every
//!   stock extractor (backgrounds, text, gradients, box shadows, texture
//!   slices) picks the interior clips up uniformly. Text self-clips
//!   (`TextScroll` content boxes) recompose automatically in the stock text
//!   extractors from the swapped value.
//! - `quads`: per layer root, the screen-space rect its **composite quad**
//!   clamps to instead — a top-level root's inherited [`CalculatedClip`], or,
//!   for a nested root, the enclosing layer's interior cascade value at the
//!   root (its quad draws inside the enclosing capture).
//!
//! Outside the extract window the real `CalculatedClip` values are always in
//! place: picking (`crate::pick_clip`) and `bevy_ui`'s own consumers keep
//! seeing true inherited clips.
//!
//! Known divergence (deliberate, rare): an `OverrideClip` escapee inside a
//! subtree is still clamped by the layer's quad clip at composite time
//! (stock lets it escape every ancestor clip).
//!
//! Offscreen layers still capture (when dirty) like any other — a fully
//! clipped-away quad simply draws nothing. The cost is invisible re-captures
//! for continuously-animated offscreen layers; the win is that scrolling
//! never re-captures and a layer scrolled into view is correct by
//! construction (the bug this module fixes: captures taken under clipping
//! were cached and served stale after scrolling).

use bevy::math::Rect;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::ui::{CalculatedClip, ComputedNode, OverrideClip, UiGlobalTransform};

use super::{LayerMembership, PromotedLayer};

/// Per-frame clip maps for promoted layers, rebuilt from scratch by
/// [`sync_layer_clips`] (like [`LayerMembership`] — nothing persists).
#[derive(Resource, Debug, Default)]
pub struct LayerClips {
    /// Subtree member → the clip its extracted items use inside the capture
    /// (`None` = unclipped there). Every member gets an entry; the swap only
    /// touches members that carry a real [`CalculatedClip`] — a member whose
    /// interior clip is `Some` always does (its interior clip sources are a
    /// subset of the real cascade's), so no component insert/remove is ever
    /// needed.
    pub interior: HashMap<Entity, Option<Rect>>,
    /// Promoted root → the screen-space rect its composite quad clamps to.
    /// Top-level roots: their inherited [`CalculatedClip`]. Nested roots: the
    /// enclosing layer's interior cascade value at the root. `None` inside
    /// the option = unclipped.
    pub quads: HashMap<Entity, Option<Rect>>,
}

/// Rebuilds [`LayerClips`] for this frame. Runs in `PostUpdate` after
/// [`super::sync_layer_geometry`] (fresh [`LayerMembership`]) and after
/// `bevy_ui`'s `UiSystems::PostLayout` (final [`CalculatedClip`] values for
/// the top-level quad clips). Must NOT feed [`super::resolve_layer_repaints`]:
/// clip changes never dirty a capture — that is the point.
#[allow(clippy::type_complexity)]
pub fn sync_layer_clips(
    roots: Query<(Entity, Option<&CalculatedClip>), With<PromotedLayer>>,
    root_markers: Query<(), With<PromotedLayer>>,
    children: Query<&Children>,
    nodes: Query<(&Node, &ComputedNode, &UiGlobalTransform, Has<OverrideClip>)>,
    membership: Res<LayerMembership>,
    mut clips: ResMut<LayerClips>,
) {
    let clips = &mut *clips;
    clips.interior.clear();
    clips.quads.clear();
    for (root, calculated_clip) in &roots {
        // Only ACTIVE roots (present in this frame's membership as their own
        // layer) ran `mark_subtree`; inactive ones (zero-sized, not laid out)
        // have no capture to clip and may carry stale components.
        if membership.node_to_layer.get(&root) != Some(&root) {
            continue;
        }
        // Interior cascade: restart with NO inherited clip at the root —
        // exactly `bevy_ui`'s `update_clipping`, minus everything above.
        cascade(root, root, None, &children, &root_markers, &nodes, clips);
        // A top-level root's quad composites into the screen phase and clamps
        // to the root's real inherited clip. (Nested roots' quad clips were
        // recorded by their enclosing root's cascade at the prune point.)
        if membership.enclosing.get(&root) == Some(&None) {
            clips.quads.insert(root, calculated_clip.map(|c| c.clip));
        }
    }
}

/// One step of the interior clip cascade — mirrors `bevy_ui`'s
/// `update_clipping` recursion (`bevy_ui-0.19.0/src/update.rs`): OverrideClip
/// resets the inherited clip, `Display::None` forces an empty one, the node
/// records its *inherited* value, and its own overflow only affects its
/// children via [`children_clip`]. A nested promoted root is pruned: the
/// cascade value at the prune point is its composite quad's clip (its quad
/// draws inside this capture), and its interior belongs to its own cascade.
#[allow(clippy::type_complexity)]
fn cascade(
    node: Entity,
    dfs_root: Entity,
    mut inherited: Option<Rect>,
    children: &Query<&Children>,
    root_markers: &Query<(), With<PromotedLayer>>,
    nodes: &Query<(&Node, &ComputedNode, &UiGlobalTransform, Has<OverrideClip>)>,
    clips: &mut LayerClips,
) {
    let Ok((ui_node, computed, transform, has_override)) = nodes.get(node) else {
        return; // Non-UI entity: nothing to clip, nothing extracted below it.
    };
    if has_override {
        inherited = None;
    }
    if ui_node.display == bevy::ui::Display::None {
        inherited = Some(Rect::default());
    }
    if node != dfs_root && root_markers.contains(node) {
        clips.quads.insert(node, inherited);
        return; // The nested root's own cascade owns its interior.
    }
    clips.interior.insert(node, inherited);
    let child_clip = children_clip(ui_node, computed, transform, inherited);
    if let Ok(kids) = children.get(node) {
        for &kid in kids {
            cascade(
                kid,
                dfs_root,
                child_clip,
                children,
                root_markers,
                nodes,
                clips,
            );
        }
    }
}

/// The clip a node passes to its children — stock semantics: `Visible`
/// overflow passes the inherited clip through; otherwise the node's
/// [`ComputedNode::resolve_clip_rect`] (object-centered, physical px) is
/// translated into screen space and intersected with the inherited clip.
fn children_clip(
    node: &Node,
    computed: &ComputedNode,
    transform: &UiGlobalTransform,
    inherited: Option<Rect>,
) -> Option<Rect> {
    if node.overflow.is_visible() {
        return inherited;
    }
    let mut clip_rect = computed.resolve_clip_rect(node.overflow, node.overflow_clip_margin);
    clip_rect.min += transform.translation;
    clip_rect.max += transform.translation;
    Some(inherited.map_or(clip_rect, |c| c.intersect(clip_rect)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::layer::{
        LayerContentDirt, LayerGroupAlpha, LayerRepaintState, LayersRegistry, PromotionReasons,
        resolve_layer_repaints, sync_layer_geometry,
    };
    use crate::protocol::NodeId;
    use bevy::math::Affine2;
    use bevy::ui::Overflow;

    /// World + schedule harness like `layer::tests::geometry_world`, extended
    /// with [`sync_layer_clips`] between geometry and repaint resolution —
    /// the production ordering.
    fn clip_world() -> (World, Schedule) {
        let mut world = World::new();
        world.init_resource::<LayerMembership>();
        world.init_resource::<LayersRegistry>();
        world.init_resource::<LayerRepaintState>();
        world.init_resource::<LayerContentDirt>();
        world.init_resource::<LayerClips>();
        let mut schedule = Schedule::default();
        schedule.add_systems(
            (
                sync_layer_geometry,
                sync_layer_clips,
                resolve_layer_repaints,
            )
                .chain(),
        );
        (world, schedule)
    }

    /// A laid-out plain UI node: `center` is the `UiGlobalTransform`
    /// translation (node center), so the border box is `center ± size/2`.
    fn spawn_node(world: &mut World, size: Vec2, center: Vec2, overflow: Overflow) -> Entity {
        world
            .spawn((
                Node {
                    overflow,
                    ..Default::default()
                },
                ComputedNode {
                    size,
                    ..Default::default()
                },
                UiGlobalTransform::from(Affine2::from_translation(center)),
            ))
            .id()
    }

    /// A promoted layer root (adds the marker components
    /// [`sync_layer_geometry`] requires on top of [`spawn_node`]).
    fn spawn_root(
        world: &mut World,
        id: NodeId,
        size: Vec2,
        center: Vec2,
        overflow: Overflow,
    ) -> Entity {
        let e = spawn_node(world, size, center, overflow);
        world.entity_mut(e).insert((
            crate::bridge::ReactNode(id),
            LayerGroupAlpha(1.0),
            PromotedLayer {
                reasons: PromotionReasons(PromotionReasons::FILTER),
            },
        ));
        e
    }

    fn interior(world: &World, e: Entity) -> Option<Rect> {
        *world
            .resource::<LayerClips>()
            .interior
            .get(&e)
            .unwrap_or_else(|| panic!("no interior clip entry for {e:?}"))
    }

    fn quad(world: &World, e: Entity) -> Option<Rect> {
        *world
            .resource::<LayerClips>()
            .quads
            .get(&e)
            .unwrap_or_else(|| panic!("no quad clip entry for {e:?}"))
    }

    /// Ancestor clipping (hand-inserted `CalculatedClip`, as real `bevy_ui`
    /// would under a scrollport) is STRIPPED from every member's interior
    /// clip — and becomes the top-level root's quad clip instead. A root
    /// without any inherited clip gets an unclipped quad.
    #[test]
    fn ancestor_clip_stripped_and_moved_to_quad() {
        let (mut world, mut schedule) = clip_world();
        let clip = Rect::new(0.0, 0.0, 30.0, 30.0);
        let root = spawn_root(
            &mut world,
            1,
            Vec2::new(100.0, 60.0),
            Vec2::new(50.0, 30.0),
            Overflow::visible(),
        );
        let child = spawn_node(
            &mut world,
            Vec2::new(40.0, 20.0),
            Vec2::new(50.0, 30.0),
            Overflow::visible(),
        );
        world.entity_mut(child).insert(ChildOf(root));
        world.entity_mut(root).insert(CalculatedClip { clip });
        world.entity_mut(child).insert(CalculatedClip { clip });
        let unclipped = spawn_root(
            &mut world,
            2,
            Vec2::new(50.0, 50.0),
            Vec2::new(300.0, 300.0),
            Overflow::visible(),
        );
        schedule.run(&mut world);

        assert_eq!(interior(&world, root), None);
        assert_eq!(interior(&world, child), None);
        assert_eq!(quad(&world, root), Some(clip));
        assert_eq!(quad(&world, unclipped), None);
    }

    /// The root's own overflow clips its CHILDREN only (stock semantics):
    /// the root's paint is unclipped in-capture, children clamp to the root's
    /// `resolve_clip_rect`, and deeper interior clippers intersect.
    #[test]
    fn root_overflow_clips_children_only() {
        let (mut world, mut schedule) = clip_world();
        let root = spawn_root(
            &mut world,
            1,
            Vec2::splat(200.0),
            Vec2::splat(100.0),
            Overflow::clip(),
        );
        // Offset so the container's clip rect escapes the root's on the right.
        let container = spawn_node(
            &mut world,
            Vec2::splat(100.0),
            Vec2::new(160.0, 100.0),
            Overflow::clip(),
        );
        world.entity_mut(container).insert(ChildOf(root));
        let grandchild = spawn_node(
            &mut world,
            Vec2::splat(40.0),
            Vec2::new(160.0, 100.0),
            Overflow::visible(),
        );
        world.entity_mut(grandchild).insert(ChildOf(container));
        schedule.run(&mut world);

        let root_rect = Rect::new(0.0, 0.0, 200.0, 200.0);
        let container_rect = Rect::new(110.0, 50.0, 210.0, 150.0);
        assert_eq!(interior(&world, root), None, "root paint unclipped");
        assert_eq!(interior(&world, container), Some(root_rect));
        assert_eq!(
            interior(&world, grandchild),
            Some(root_rect.intersect(container_rect)),
            "interior clippers intersect"
        );
    }

    /// A nested promoted root is PRUNED from the enclosing DFS: the cascade
    /// value at the prune point becomes its quad clip, and its own interior
    /// cascade restarts from nothing — outer clips must not leak in.
    #[test]
    fn nested_roots_get_quad_clips_and_restart_interior() {
        let (mut world, mut schedule) = clip_world();
        let outer = spawn_root(
            &mut world,
            1,
            Vec2::splat(300.0),
            Vec2::splat(150.0),
            Overflow::visible(),
        );
        let clipper = spawn_node(
            &mut world,
            Vec2::splat(100.0),
            Vec2::splat(100.0),
            Overflow::clip(),
        );
        world.entity_mut(clipper).insert(ChildOf(outer));
        let inner = spawn_root(
            &mut world,
            2,
            Vec2::splat(80.0),
            Vec2::splat(100.0),
            Overflow::visible(),
        );
        world.entity_mut(inner).insert(ChildOf(clipper));
        let inner_child = spawn_node(
            &mut world,
            Vec2::splat(40.0),
            Vec2::splat(100.0),
            Overflow::visible(),
        );
        world.entity_mut(inner_child).insert(ChildOf(inner));
        // Deeper: a clipper partially OUTSIDE the outer clipper's rect, then
        // a third root — its quad clip must be the inner cascade value alone
        // (restart proof: no intersection with the outer clipper's rect).
        let clipper2 = spawn_node(
            &mut world,
            Vec2::splat(60.0),
            Vec2::new(140.0, 100.0),
            Overflow::clip(),
        );
        world.entity_mut(clipper2).insert(ChildOf(inner));
        let innermost = spawn_root(
            &mut world,
            3,
            Vec2::splat(40.0),
            Vec2::new(140.0, 100.0),
            Overflow::visible(),
        );
        world.entity_mut(innermost).insert(ChildOf(clipper2));
        schedule.run(&mut world);

        let clipper_rect = Rect::new(50.0, 50.0, 150.0, 150.0);
        let clipper2_rect = Rect::new(110.0, 70.0, 170.0, 130.0);
        assert_eq!(quad(&world, inner), Some(clipper_rect));
        assert_eq!(interior(&world, inner), None, "interior restarts");
        assert_eq!(interior(&world, inner_child), None);
        assert_eq!(
            quad(&world, innermost),
            Some(clipper2_rect),
            "inner cascade only — outer clipper must not leak through the restart"
        );
        assert_eq!(interior(&world, clipper), None, "outer member");
    }

    /// `OverrideClip` resets the inherited interior clip; `Display::None`
    /// forces an empty clip down its subtree (stock `update_clipping` order).
    #[test]
    fn override_clip_and_display_none() {
        let (mut world, mut schedule) = clip_world();
        let root = spawn_root(
            &mut world,
            1,
            Vec2::splat(200.0),
            Vec2::splat(100.0),
            Overflow::clip(),
        );
        let root_rect = Rect::new(0.0, 0.0, 200.0, 200.0);

        let escapee = spawn_node(
            &mut world,
            Vec2::splat(40.0),
            Vec2::splat(100.0),
            Overflow::visible(),
        );
        world
            .entity_mut(escapee)
            .insert((ChildOf(root), OverrideClip));
        let escapee_child = spawn_node(
            &mut world,
            Vec2::splat(20.0),
            Vec2::splat(100.0),
            Overflow::visible(),
        );
        world.entity_mut(escapee_child).insert(ChildOf(escapee));

        let hidden = spawn_node(
            &mut world,
            Vec2::splat(40.0),
            Vec2::splat(100.0),
            Overflow::visible(),
        );
        world.entity_mut(hidden).insert(ChildOf(root));
        world.entity_mut(hidden).get_mut::<Node>().unwrap().display = bevy::ui::Display::None;
        let hidden_child = spawn_node(
            &mut world,
            Vec2::splat(20.0),
            Vec2::splat(100.0),
            Overflow::visible(),
        );
        world.entity_mut(hidden_child).insert(ChildOf(hidden));

        let plain = spawn_node(
            &mut world,
            Vec2::splat(40.0),
            Vec2::splat(100.0),
            Overflow::visible(),
        );
        world.entity_mut(plain).insert(ChildOf(root));
        schedule.run(&mut world);

        assert_eq!(interior(&world, escapee), None);
        assert_eq!(interior(&world, escapee_child), None);
        assert_eq!(interior(&world, hidden), Some(Rect::default()));
        assert_eq!(interior(&world, hidden_child), Some(Rect::default()));
        assert_eq!(interior(&world, plain), Some(root_rect));
    }

    /// THE regression the whole change exists for: scrolling (uniform
    /// translation of the subtree under a fixed ancestor clip) must keep the
    /// capture cache clean — clips never feed the repaint resolver — while
    /// the quad clip stays live; and a clip-rect change alone must not dirty
    /// either.
    #[test]
    fn scroll_holds_cache_and_updates_quad_clip() {
        let (mut world, mut schedule) = clip_world();
        let clip = Rect::new(0.0, 0.0, 200.0, 100.0);
        // Content sits below a 100-tall scrollport (fully clipped away).
        let root = spawn_root(
            &mut world,
            1,
            Vec2::new(100.0, 60.0),
            Vec2::new(50.0, 130.0),
            Overflow::visible(),
        );
        let child = spawn_node(
            &mut world,
            Vec2::new(40.0, 20.0),
            Vec2::new(50.0, 130.0),
            Overflow::visible(),
        );
        world.entity_mut(child).insert(ChildOf(root));
        world.entity_mut(root).insert(CalculatedClip { clip });
        world.entity_mut(child).insert(CalculatedClip { clip });
        schedule.run(&mut world);
        schedule.run(&mut world); // settle: steady state is clean
        assert!(world.resource::<LayerRepaintState>().dirty.is_empty());
        assert_eq!(quad(&world, root), Some(clip));

        // Scroll into view: the whole subtree translates; the clip stays.
        let delta = Vec2::new(0.0, -100.0);
        for e in [root, child] {
            let center = world.get::<UiGlobalTransform>(e).unwrap().translation + delta;
            *world.get_mut::<UiGlobalTransform>(e).unwrap() =
                UiGlobalTransform::from(Affine2::from_translation(center));
        }
        schedule.run(&mut world);
        assert!(
            world.resource::<LayerRepaintState>().dirty.is_empty(),
            "scrolling must not re-capture"
        );
        assert_eq!(quad(&world, root), Some(clip));

        // The scrollport itself changes: quad clip follows, still no dirt.
        let grown = Rect::new(0.0, 0.0, 200.0, 150.0);
        world.get_mut::<CalculatedClip>(root).unwrap().clip = grown;
        schedule.run(&mut world);
        assert!(
            world.resource::<LayerRepaintState>().dirty.is_empty(),
            "a clip change must not re-capture"
        );
        assert_eq!(quad(&world, root), Some(grown));
    }
}
