//! Auto-promotion of UI subtrees to composited **layers**.
//!
//! A node whose style makes it a *layer root* (today: `opacity` present on a
//! node with children, unless `groupAlpha: false`) has its whole subtree
//! captured into an offscreen atlas by a custom render pass and drawn back as
//! one quad — so `opacity` fades the subtree as a group (web semantics)
//! instead of folding into each node's own colors (which shows overlapping
//! children through each other).
//!
//! Promotion is a *render-side* concern: the subtree stays in the main UI tree
//! (layout, picking, refs, animations untouched); promoting inserts the
//! [`PromotedLayer`] marker on the existing entity and demoting removes it.
//! The render half lives in [`render`] and works entirely through public
//! `bevy_ui_render` seams — stock extraction/queue/prepare run untouched; a
//! post-queue system moves the subtree's already-queued phase items into a
//! per-layer synthetic view rendered to the atlas. See `render` for details.
//!
//! Extensibility contract: each future promotion rule (transform3d, filter,
//! backdrop) is one evaluator producing one [`PromotionReasons`] flag plus
//! composite parameters the render pass forwards without interpreting.
//! Promotion is `!reasons.is_empty()`; demotion is the flags emptying.

use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};

use crate::animations::AnimatableProperty;
use crate::protocol::{NodeId, Props};

pub mod render;

/// Why a node is promoted — one bit per rule, OR'd together. A node is
/// promoted iff any bit is set; it demotes when the set empties.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct PromotionReasons(pub u32);

impl PromotionReasons {
    /// `opacity` present on a node with children (group alpha).
    pub const OPACITY: u32 = 1 << 0;
    // Reserved for future rules (one evaluator + one flag each):
    // TRANSFORM3D = 1 << 1, FILTER = 1 << 2, BACKDROP = 1 << 3, FORCED = 1 << 4.

    pub fn is_empty(self) -> bool {
        self.0 == 0
    }
}

/// Marker on a promoted layer root. Insert = promote, remove = demote —
/// nothing else about the entity changes.
#[derive(Component, Debug, Clone, Copy)]
pub struct PromotedLayer {
    pub reasons: PromotionReasons,
}

/// The composite-time alpha of a promoted subtree (applied once to the whole
/// captured group). Separate from [`PromotedLayer`] so per-frame writes from
/// the animation/transition paths don't look like promotion-state changes.
#[derive(Component, Debug, Clone, Copy, PartialEq)]
pub struct LayerGroupAlpha(pub f32);

/// The layer's capture rectangle in *physical* pixels, in the same
/// screen space as `UiGlobalTransform` — the node's border box. Recomputed
/// every frame after layout by [`sync_layer_geometry`]; consumed by
/// extraction. v1 clips the capture to this box (web opacity does not clip —
/// known divergence, diag-warned).
#[derive(Component, Debug, Clone, Copy, PartialEq)]
pub struct LayerCaptureRect(pub URect);

/// Which layer root each node under a promoted subtree belongs to
/// (ancestor-or-self, nearest wins — so nested layers map their interior,
/// including the inner root's own paint, to the *inner* root). Rebuilt every
/// frame after layout; extracted to the render world to route stolen phase
/// items. A layer root's *composite quad* is the one thing that routes by
/// [`Self::enclosing`] instead (it draws inside the parent layer's capture,
/// or the screen when there is none).
#[derive(Resource, Debug, Default)]
pub struct LayerMembership {
    /// node entity → its nearest layer-root ancestor-or-self.
    pub node_to_layer: HashMap<Entity, Entity>,
    /// layer root → the nearest *strictly enclosing* layer root (`None` for
    /// top-level layers, whose quads composite straight into the screen
    /// phase). Also doubles as the per-layer nesting-depth source.
    pub enclosing: HashMap<Entity, Option<Entity>>,
}

/// Per-layer observability row in [`LayersRegistry`]. Identity fields are
/// written by [`evaluate_layer_promotions`]; geometry fields
/// (`capture_rect`/`depth`) and the live `group_alpha` are refreshed by
/// [`sync_layer_geometry`].
#[derive(Debug, Clone, Copy)]
pub struct LayerMeta {
    pub node: NodeId,
    pub entity: Entity,
    pub reasons: PromotionReasons,
    /// Live composite alpha (animations/transitions included).
    pub group_alpha: f32,
    /// Physical-pixel capture rect; `None` while the layer is inactive
    /// (zero-sized, hidden, or not laid out yet).
    pub capture_rect: Option<URect>,
    /// Nesting depth: 1 = top-level layer, 2 = layer inside a layer, …
    pub depth: u32,
}

/// Public registry of currently promoted layers — the observability surface
/// auto-promotion comes with (promotion cost is invisible in JSX; this is
/// where to see what promoted and why). Tests assert on it; a future devtools
/// "layers" tab is a pure consumer.
#[derive(Resource, Debug, Default)]
pub struct LayersRegistry {
    pub layers: HashMap<NodeId, LayerMeta>,
}

/// The promotion rule set — pure, one flag per rule (see the module doc's
/// extensibility contract). Today only [`PromotionReasons::OPACITY`]:
///
/// - `opacity` **present** — value-blind (an explicit `opacity: 1` stays
///   promoted, so fades crossing 1.0 never thrash), unioned across the base
///   style, hover/press/focus variants (interaction must never flip
///   promotion), and animated bindings;
/// - at least one child (a leaf's group alpha is visually identical to the
///   per-node fold — promoting it would be pure cost);
/// - `groupAlpha != false` (the opt-out, read from the base style only —
///   the field is `no_overlay`);
/// - the element kind is eligible (`ineligible_element = false`). v1
///   ineligible: `<text>` (its fold already cascades to spans via
///   resolved-style inheritance — group semantics without a layer) and
///   detached roots (`<surface>`/`<root>` — separate render paths).
pub fn promotion_reasons(
    props: &Props,
    child_count: usize,
    ineligible_element: bool,
) -> PromotionReasons {
    let style_opacity =
        |s: &Option<crate::protocol::Style>| s.as_ref().is_some_and(|s| s.opacity.is_some());
    let opacity_present = style_opacity(&props.style)
        || style_opacity(&props.hover_style)
        || style_opacity(&props.press_style)
        || style_opacity(&props.focus_style)
        || props
            .animated
            .as_ref()
            .is_some_and(|b| b.contains(AnimatableProperty::Opacity));
    let group_gate = props.style.as_ref().and_then(|s| s.group_alpha) != Some(false);

    let mut reasons = 0;
    if opacity_present && group_gate && child_count >= 1 && !ineligible_element {
        reasons |= PromotionReasons::OPACITY;
    }
    PromotionReasons(reasons)
}

/// The single writer of promotion state. Drains the bridge's dirty set (fed
/// by the op-apply hooks), re-evaluates [`promotion_reasons`] per node, and
/// flips the [`PromotedLayer`]/[`LayerGroupAlpha`] markers + the registry +
/// `bridge.promoted_layers`. Ordered after `apply_js_ops` and before the
/// interaction/transition/animation appliers so every later alpha writer this
/// frame sees the final promotion state.
pub fn evaluate_layer_promotions(
    mut commands: Commands,
    mut bridge: ResMut<crate::bridge::JsBridge>,
    mut registry: ResMut<LayersRegistry>,
    assets: Res<AssetServer>,
    mut ui_assets: crate::reconcile::UiAssets,
    mut style_variants: Query<&mut crate::bridge::StyleVariants>,
) {
    // Sweep rows whose node vanished (removal forgets the node's bridge data
    // — including `promoted_layers` — but can't reach this resource).
    registry
        .layers
        .retain(|id, meta| bridge.nodes.get(id) == Some(&meta.entity));

    if bridge.layer_dirty.is_empty() {
        return;
    }
    let dirty: Vec<NodeId> = bridge.layer_dirty.drain().collect();
    for id in dirty {
        let Some(&entity) = bridge.nodes.get(&id) else {
            continue; // Removed in the same batch; sweep handled the row.
        };
        let reasons = match bridge.props_cache.get(&id) {
            Some(props) => promotion_reasons(
                props,
                bridge.children_of(id).count(),
                // Text elements (fold cascades to spans already) and detached
                // roots (`<surface>`/`<root>` — own render paths) are
                // ineligible in v1.
                bridge.text_styles.contains_key(&id) || bridge.is_detached_root(id),
            ),
            None => PromotionReasons::default(),
        };
        let was_promoted = bridge.promoted_layers.contains(&id);
        if !reasons.is_empty() {
            // The static group alpha; the style/animation/transition appliers
            // own per-frame updates from here on.
            let alpha = bridge
                .props_cache
                .get(&id)
                .and_then(|p| p.style.as_ref())
                .and_then(|s| s.opacity)
                .unwrap_or(1.0);
            commands
                .entity(entity)
                .insert((PromotedLayer { reasons }, LayerGroupAlpha(alpha)));
            bridge.promoted_layers.insert(id);
            // Upsert: keep geometry fields across re-evaluations of an
            // already-promoted node.
            let row = registry.layers.entry(id).or_insert(LayerMeta {
                node: id,
                entity,
                reasons,
                group_alpha: alpha,
                capture_rect: None,
                depth: 1,
            });
            row.entity = entity;
            row.reasons = reasons;
            row.group_alpha = alpha;
            if !was_promoted && let Some(props) = bridge.props_cache.get(&id) {
                // Promote flip: colors were folded while unpromoted — bake
                // the unfolded values + group alpha now, in one shot.
                crate::reconcile::reapply_opacity_outputs(
                    &mut commands,
                    entity,
                    props,
                    true,
                    &assets,
                    &mut ui_assets,
                    &mut style_variants,
                );
            }
        } else if was_promoted {
            commands
                .entity(entity)
                .remove::<(PromotedLayer, LayerGroupAlpha, LayerCaptureRect)>();
            bridge.promoted_layers.remove(&id);
            registry.layers.remove(&id);
            if let Some(props) = bridge.props_cache.get(&id) {
                // Demote flip: resume the per-node fold with baked values.
                crate::reconcile::reapply_opacity_outputs(
                    &mut commands,
                    entity,
                    props,
                    false,
                    &assets,
                    &mut ui_assets,
                    &mut style_variants,
                );
            }
        }
    }
}

/// Recomputes each promoted layer's capture rect and the subtree membership
/// map. Runs in `PostUpdate` after `bevy_ui` layout so `ComputedNode` /
/// `UiGlobalTransform` are this frame's values.
#[allow(clippy::too_many_arguments)]
pub fn sync_layer_geometry(
    mut commands: Commands,
    roots: Query<
        (
            Entity,
            &ComputedNode,
            &UiGlobalTransform,
            &crate::bridge::RNode,
            &LayerGroupAlpha,
        ),
        With<PromotedLayer>,
    >,
    root_markers: Query<(), With<PromotedLayer>>,
    children: Query<&Children>,
    parents: Query<&ChildOf>,
    existing_rects: Query<&LayerCaptureRect>,
    mut membership: ResMut<LayerMembership>,
    mut registry: ResMut<LayersRegistry>,
) {
    membership.node_to_layer.clear();
    membership.enclosing.clear();
    for (root, computed, transform, rnode, alpha) in &roots {
        let row = registry.layers.get_mut(&rnode.0);
        if let Some(row) = &row {
            debug_assert_eq!(row.entity, root);
        }
        let size = computed.size();
        if size.x <= 0.5 || size.y <= 0.5 {
            // Zero-sized / not laid out yet: inactive this frame.
            if let Some(row) = row {
                row.capture_rect = None;
            }
            continue;
        }
        let min = transform.translation - size * 0.5;
        let rect = URect::new(
            min.x.round().max(0.0) as u32,
            min.y.round().max(0.0) as u32,
            (min.x + size.x).round().max(0.0) as u32,
            (min.y + size.y).round().max(0.0) as u32,
        );
        if rect.width() == 0 || rect.height() == 0 {
            if let Some(row) = row {
                row.capture_rect = None;
            }
            continue;
        }
        if existing_rects.get(root) != Ok(&LayerCaptureRect(rect)) {
            commands.entity(root).insert(LayerCaptureRect(rect));
        }
        // Mirror live geometry + alpha into the observability registry. Depth
        // (1 = top-level) is refreshed below once `enclosing` is known.
        if let Some(row) = row {
            row.capture_rect = Some(rect);
            row.group_alpha = alpha.0;
        }
        // Everything under `root` (itself included) belongs to its nearest
        // enclosing-or-self layer. Starting each DFS at a root and letting
        // inner roots re-claim their own subtree makes "nearest wins" hold
        // regardless of iteration order (an outer root's DFS re-visits inner
        // subtrees with the inner root as the current layer).
        mark_subtree(
            root,
            root,
            &children,
            &root_markers,
            &mut membership.node_to_layer,
        );
        // The quad target: nearest strictly-enclosing promoted ancestor. Depth
        // = number of promoted ancestors + 1.
        let mut enclosing = None;
        let mut depth = 1u32;
        let mut cursor = root;
        while let Ok(parent) = parents.get(cursor) {
            cursor = parent.parent();
            if root_markers.contains(cursor) {
                if enclosing.is_none() {
                    enclosing = Some(cursor);
                }
                depth += 1;
            }
        }
        membership.enclosing.insert(root, enclosing);
        if let Some(row) = registry.layers.get_mut(&rnode.0) {
            row.depth = depth;
        }
    }
}

fn mark_subtree(
    node: Entity,
    layer: Entity,
    children: &Query<&Children>,
    roots: &Query<(), With<PromotedLayer>>,
    map: &mut HashMap<Entity, Entity>,
) {
    // An inner promoted root claims itself and its subtree: its own paint
    // fades with the *inner* group. (Its composite quad routes by
    // `LayerMembership::enclosing`, not this map.)
    let layer = if roots.contains(node) { node } else { layer };
    map.insert(node, layer);
    if let Ok(kids) = children.get(node) {
        for &kid in kids {
            mark_subtree(kid, layer, children, roots, map);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bridge::JsBridge;
    use crate::protocol::{NodeId, Op, Outbound, Props};
    use bevy::ui::BackgroundColor;

    fn props(json: serde_json::Value) -> Props {
        serde_json::from_value(json).expect("valid props")
    }

    /// [`promotion_reasons`] truth table: presence-based (value-blind) opacity
    /// union across base/variants/animated bindings, gated by children,
    /// `groupAlpha`, and element eligibility.
    #[test]
    fn promotion_reasons_matrix() {
        let promoted = |p: &Props, kids: usize, ineligible: bool| {
            !promotion_reasons(p, kids, ineligible).is_empty()
        };
        let base = props(serde_json::json!({ "style": { "opacity": 0.5 } }));
        assert!(promoted(&base, 1, false));
        // Value-blind: an explicit `opacity: 1` still promotes (no thrash
        // when a fade settles at 1.0).
        let one = props(serde_json::json!({ "style": { "opacity": 1.0 } }));
        assert!(promoted(&one, 1, false));
        // No children → leaf fold is visually identical, never promote.
        assert!(!promoted(&base, 0, false));
        // No opacity anywhere → no reason.
        let plain = props(serde_json::json!({ "style": { "width": 10 } }));
        assert!(!promoted(&plain, 3, false));
        // The opt-out gate.
        let opted_out =
            props(serde_json::json!({ "style": { "opacity": 0.5, "groupAlpha": false } }));
        assert!(!promoted(&opted_out, 1, false));
        // Variant-carried opacity counts (hover must not flip promotion).
        let hover_only = props(serde_json::json!({
            "style": { "width": 10 },
            "hoverStyle": { "opacity": 0.8 },
        }));
        assert!(promoted(&hover_only, 1, false));
        // An animated binding counts even with no static value.
        let animated = props(serde_json::json!({
            "animated": { "opacity": { "type": "shared", "id": 1 } },
        }));
        assert!(promoted(&animated, 1, false));
        // Ineligible element kinds (text / detached roots) never promote.
        assert!(!promoted(&base, 1, true));
    }

    /// Spin up the op-apply + evaluator pipeline headless (mirrors
    /// `reconcile::tests::op_app`).
    fn layer_app() -> (bevy::app::App, crossbeam_channel::Sender<Vec<Op>>) {
        use bevy::app::App;
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_asset::<bevy::image::TextureAtlasLayout>();
        app.init_resource::<crate::plugin::Fonts>();
        app.init_resource::<crate::reconcile::OpApplyStats>();
        app.init_resource::<crate::ui_map::AtlasLayoutCache>();
        app.init_asset::<crate::filter::FilterMaterial>();
        app.init_resource::<crate::filter::FilterMaterialCache>();
        app.add_systems(Startup, crate::filter::init_filter_assets);
        app.init_resource::<LayersRegistry>();
        app.init_resource::<LayerMembership>();

        let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
        let (out_tx, out_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
        std::mem::forget(out_rx);
        let root = app.world_mut().spawn_empty().id();
        app.insert_resource(JsBridge::new(ops_rx, out_tx, root));
        app.add_systems(
            Update,
            (
                crate::reconcile::apply_js_ops,
                evaluate_layer_promotions.after(crate::reconcile::apply_js_ops),
            ),
        );
        (app, ops_tx)
    }

    fn create(id: NodeId, json: serde_json::Value) -> Op {
        Op::Create {
            id,
            kind: "node".into(),
            props: props(json),
            text: None,
        }
    }

    fn update(id: NodeId, json: serde_json::Value, style_unset: &[&str]) -> Op {
        Op::Update {
            id,
            props: props(json),
            unset: vec![],
            style_unset: style_unset.iter().map(|s| s.to_string()).collect(),
        }
    }

    fn entity_of(app: &bevy::app::App, id: NodeId) -> Entity {
        *app.world().resource::<JsBridge>().nodes.get(&id).unwrap()
    }

    /// The full lifecycle: promote on opacity+child, fold suppressed while
    /// promoted (bg keeps its own alpha; `LayerGroupAlpha` carries the
    /// value), demote on `groupAlpha: false` re-bakes the fold, and losing
    /// the last child demotes too.
    #[test]
    fn promotion_lifecycle_and_fold_handoff() {
        let (mut app, ops_tx) = layer_app();
        ops_tx
            .send(vec![
                create(
                    1,
                    serde_json::json!({
                        "style": { "opacity": 0.5, "backgroundColor": "#ff0000" }
                    }),
                ),
                create(2, serde_json::json!({})),
                Op::Append {
                    parent: 1,
                    child: 2,
                },
            ])
            .unwrap();
        app.update();

        let e = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e).is_some(), "promoted");
        assert_eq!(
            app.world().get::<LayerGroupAlpha>(e),
            Some(&LayerGroupAlpha(0.5))
        );
        let registry = app.world().resource::<LayersRegistry>();
        assert_eq!(registry.layers.len(), 1);
        assert_eq!(registry.layers[&1].reasons.0, PromotionReasons::OPACITY);
        // Fold suppressed: the background keeps its full alpha (the flip
        // re-apply un-baked the create-time fold).
        let bg = app.world().get::<BackgroundColor>(e).unwrap();
        assert_eq!(bg.0.alpha(), 1.0, "promoted bg keeps its own alpha");

        // Opt out via groupAlpha: demote + the fold is re-baked.
        ops_tx
            .send(vec![update(
                1,
                serde_json::json!({ "style": { "groupAlpha": false } }),
                &[],
            )])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(app.world().get::<LayerGroupAlpha>(e).is_none());
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
        let bg = app.world().get::<BackgroundColor>(e).unwrap();
        assert_eq!(bg.0.alpha(), 0.5, "demoted bg re-bakes the fold");

        // Back on, then losing the last child demotes.
        ops_tx
            .send(vec![update(1, serde_json::json!({}), &["groupAlpha"])])
            .unwrap();
        app.update();
        let e1 = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e1).is_some());
        ops_tx
            .send(vec![Op::Remove {
                parent: 1,
                child: 2,
            }])
            .unwrap();
        app.update();
        assert!(
            app.world().get::<PromotedLayer>(e1).is_none(),
            "no children → demoted"
        );
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
    }

    /// Removing a promoted node prunes its registry row (despawn cleans the
    /// markers; the sweep cleans the resource).
    #[test]
    fn removal_prunes_registry() {
        let (mut app, ops_tx) = layer_app();
        ops_tx
            .send(vec![
                create(1, serde_json::json!({})),
                create(2, serde_json::json!({ "style": { "opacity": 0.3 } })),
                create(3, serde_json::json!({})),
                Op::Append {
                    parent: 1,
                    child: 2,
                },
                Op::Append {
                    parent: 2,
                    child: 3,
                },
            ])
            .unwrap();
        app.update();
        assert_eq!(app.world().resource::<LayersRegistry>().layers.len(), 1);

        ops_tx
            .send(vec![Op::Remove {
                parent: 1,
                child: 2,
            }])
            .unwrap();
        app.update();
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
        assert!(
            app.world()
                .resource::<JsBridge>()
                .promoted_layers
                .is_empty()
        );
    }
}
