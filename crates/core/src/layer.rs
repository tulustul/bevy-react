//! Auto-promotion of UI subtrees to composited **layers**.
//!
//! A node whose style makes it a *layer root* (`opacity` present on a node
//! with children unless `groupAlpha: false`, a non-empty `filter` chain, or
//! `cache: "always"`) has its
//! whole subtree captured into an offscreen atlas by a custom render pass and
//! drawn back as one quad — so `opacity` fades the subtree as a group (web
//! semantics) instead of folding into each node's own colors (which shows
//! overlapping children through each other).
//!
//! Captures are **cached**: a clean layer (no content dirt this frame — see
//! [`LayerContentDirt`], [`resolve_layer_repaints`]) skips its capture pass
//! entirely and composites last frame's texture. The layer root's own
//! translation and group alpha are *composite-time* parameters, so
//! translate/opacity animation of a promoted subtree costs no re-capture —
//! promotion is the `will-change` pattern, an optimization rather than a tax.
//!
//! Captures are also **clip-independent**: ancestor clipping (a scroll
//! container or the viewport) never reaches the captured pixels — members
//! are captured under *interior* clips only (the cascade restarted at the
//! layer root, [`clip`]) and the ancestor clip clamps the **composite quad**
//! at draw time instead (web semantics: `overflow` clips the filtered
//! *result*). This is what makes the translation-invariance above actually
//! hold under scroll: without it, a capture taken while clipped would be
//! served stale after scrolling into view. An offscreen layer still captures
//! when dirty (its quad just draws nothing) — the accepted cost is invisible
//! re-captures for continuously-animated offscreen subtrees.
//!
//! Promotion is a *render-side* concern: the subtree stays in the main UI tree
//! (layout, picking, refs, animations untouched); promoting inserts the
//! [`PromotedLayer`] marker on the existing entity and demoting removes it.
//! The render half lives in [`render`] and works entirely through public
//! `bevy_ui_render` seams — stock extraction/queue/prepare run untouched; a
//! post-queue system moves the subtree's already-queued phase items into a
//! per-layer synthetic view rendered to the atlas. See `render` for details.
//!
//! Extensibility contract: each future promotion rule (transform3d,
//! backdrop) is one evaluator producing one [`PromotionReasons`] flag plus
//! composite parameters the render pass forwards without interpreting.
//! Promotion is `!reasons.is_empty()`; demotion is the flags emptying.

use bevy::platform::collections::{HashMap, HashSet};
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};

use crate::protocol::{AnimatableField, NodeId, Props};

pub mod clip;
pub mod pick3d;
pub mod render;
pub mod transform3d;

/// Why a node is promoted — one bit per rule, OR'd together. A node is
/// promoted iff any bit is set; it demotes when the set empties.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct PromotionReasons(pub u32);

impl PromotionReasons {
    /// `opacity` present on a node with children (group alpha).
    pub const OPACITY: u32 = 1 << 0;
    /// Non-empty `filter` chain in the base style or any hover/press/focus
    /// variant (presence union, like [`Self::OPACITY`] — interaction never
    /// flips promotion). Like [`Self::FORCED`] it skips the child-count and
    /// `groupAlpha` gates: the effect is subtree-wide by definition, and a
    /// filtered leaf (e.g. a grayscale `<image>`) is valid.
    pub const FILTER: u32 = 1 << 2;
    /// `cache: "always"` — user-forced promotion for capture caching. Unlike
    /// [`Self::OPACITY`] it has no visual effect of its own (no opacity → the
    /// group alpha stays `1.0`), so it skips the child-count and `groupAlpha`
    /// gates: a leaf with an expensive paint is a valid cache unit.
    pub const FORCED: u32 = 1 << 4;
    /// `transform3d` present in the base style or any hover/press/focus
    /// variant (presence union, value-blind — an identity `{}` promotes, so
    /// the layer exists before the matrix animates and interaction never
    /// flips promotion). Like [`Self::FILTER`]/[`Self::FORCED`] it skips the
    /// child-count and `groupAlpha` gates: the transform applies to the
    /// captured result, so a leaf is a valid layer.
    pub const TRANSFORM3D: u32 = 1 << 1;
    /// Non-empty `backdropFilter` chain in the base style or any variant —
    /// same presence-union, value-blind rules as [`Self::FILTER`], same
    /// skipped gates (a leaf frosted region is valid). The chain filters the
    /// frame *behind* the node; the layer exists so the composite pass has a
    /// stacking position to draw the filtered backdrop quad at.
    pub const BACKDROP: u32 = 1 << 3;

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
/// screen space as `UiGlobalTransform` — the node's border box, inflated on
/// every side by the node's **quantized filter outset** (blur reads/writes
/// beyond the border box; see [`crate::filters::quantize_outset`]). Recomputed
/// every frame after layout by [`sync_layer_geometry`]; consumed by
/// extraction. v1 clips the capture to this box (web opacity does not clip —
/// known divergence, diag-warned).
///
/// The anchor (`min`) is **fractional** and follows the node exactly, so a
/// translation — even subpixel — shifts the capture window and the composite
/// quad by the same amount and never changes the captured pixels (the layer
/// cache holds; the quad is sampled bilinearly at its fractional position).
/// Ancestor clipping cannot break this invariance: captures are
/// clip-independent (see [`clip`]) and the ancestor clip clamps the quad at
/// composite time instead. Only `size` (whole texels, ceil of the border box
/// plus outset) keys texture allocation.
#[derive(Component, Debug, Clone, Copy, PartialEq)]
pub struct LayerCaptureRect {
    /// Top-left of the capture window (border box minus the outset margin),
    /// fractional physical px (may be negative for a partially-offscreen
    /// layer — capture is layer-local).
    pub min: Vec2,
    /// Capture texture size in whole texels.
    pub size: UVec2,
    /// The applied quantized outset margin (physical px, per side) — the
    /// max of the content and backdrop chains' outsets. Carried so the
    /// render side can recover the un-inflated border box
    /// (`min + outset .. min + size − outset`): the backdrop composite quad
    /// must cover only the border box (frost never paints in the outset
    /// ring), while its UVs map into the inflated snapshot.
    pub outset: u32,
}

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
/// [`sync_layer_geometry`]; cache stats by [`resolve_layer_repaints`].
#[derive(Debug, Clone, Copy)]
pub struct LayerMeta {
    pub node: NodeId,
    pub entity: Entity,
    pub reasons: PromotionReasons,
    /// Live composite alpha (animations/transitions included).
    pub group_alpha: f32,
    /// Physical-pixel capture rect; `None` while the layer is inactive
    /// (zero-sized, hidden, or not laid out yet). Includes the quantized
    /// filter-outset margin — the *actual* capture (bleed included), not just
    /// the border box. **Signed** on purpose: outset inflation routinely
    /// pushes the min past the viewport origin (a filtered layer near the
    /// window edge), and the observability rect must report that truthfully
    /// instead of clamping to 0 and overstating the far edge.
    pub capture_rect: Option<IRect>,
    /// Nesting depth: 1 = top-level layer, 2 = layer inside a layer, …
    pub depth: u32,
    /// How many frames re-captured this layer since promotion (cache misses).
    pub repaints: u64,
    /// Whether the last resolved frame served the cached capture (no repaint).
    pub cached: bool,
    /// The node's `cache` style keyword. `Never` makes
    /// [`resolve_layer_repaints`] dirty this layer every frame (its pixels
    /// are written outside the dirt tracking's sight — live portals,
    /// app-owned render targets).
    pub cache_policy: crate::protocol::LayerCache,
}

/// Public registry of currently promoted layers — the observability surface
/// auto-promotion comes with (promotion cost is invisible in JSX; this is
/// where to see what promoted and why). Tests assert on it; a future devtools
/// "layers" tab is a pure consumer.
#[derive(Resource, Debug, Default)]
pub struct LayersRegistry {
    pub layers: HashMap<NodeId, LayerMeta>,
}

/// Frame-scoped content-dirt inbox for the layer capture cache. Every site
/// that mutates a node's *rendered appearance* pushes the entity here (see
/// [`mark_content_dirty`]); [`resolve_layer_repaints`] drains it in
/// `PostUpdate`, once [`LayerMembership`] is this frame's — the taps
/// themselves can't resolve node → layer, membership isn't valid yet.
#[derive(Resource, Debug, Default)]
pub struct LayerContentDirt {
    /// Entities whose painted content changed → their owning layer (and every
    /// enclosing layer) must re-capture.
    pub nodes: Vec<Entity>,
    /// Promoted roots whose *composite-only* params changed — their own
    /// translate or group alpha. Those are applied at composite time (the
    /// quad moves / the alpha multiplies), so they dirty only the **enclosing**
    /// layer chain (the quad is content of the outer capture), never the
    /// root's own layer.
    pub composite_only: Vec<Entity>,
}

/// Per-layer repaint decisions, rebuilt from scratch every frame by
/// [`resolve_layer_repaints`] — nothing persists to be cleared, so render
/// extraction (which runs at the sync point after the whole main frame)
/// always reads the same frame's state.
#[derive(Resource, Debug, Default)]
pub struct LayerRepaintState {
    /// Layer roots whose capture must re-render this frame.
    pub dirty: HashSet<Entity>,
    /// This frame's per-root subtree geometry hash, staged by
    /// [`sync_layer_geometry`] and compared/swapped by the resolver.
    pub geo_hashes: HashMap<Entity, u64>,
    prev_hashes: HashMap<Entity, u64>,
}

/// Tap helper for `EntityCommands` call sites (style apply, op arms): queue a
/// push of this entity into [`LayerContentDirt`]. Queued (not immediate)
/// because the op-apply sites only hold `EntityCommands`; the push lands at
/// the next command flush, well before the `PostUpdate` resolver. A missing
/// resource (external app without the plugin) degrades to a no-op.
pub fn mark_content_dirty(ec: &mut EntityCommands) {
    ec.queue(|mut e: bevy::ecs::world::EntityWorldMut| {
        let id = e.id();
        e.world_scope(|w| {
            if let Some(mut dirt) = w.get_resource_mut::<LayerContentDirt>() {
                dirt.nodes.push(id);
            }
        });
    });
}

/// The promotion rule set — pure, one flag per rule (see the module doc's
/// extensibility contract). [`PromotionReasons::FORCED`] is `cache: "always"`
/// in the base style, gated only on element eligibility (no visual semantics
/// of its own — no child or `groupAlpha` gate). [`PromotionReasons::FILTER`]
/// is a non-empty `filter` chain in the base style OR any hover/press/focus
/// variant, gated the same way (the effect is subtree-wide by definition, and
/// a filtered leaf is valid). Like opacity the union is presence-based:
/// interaction must never flip promotion, so a hover-only filter promotes
/// eagerly — the layer (and its capture) exists before the first hover.
/// [`PromotionReasons::OPACITY`]:
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
    // Presence-based, value-blind — and an `{ animated }` opacity is presence
    // too (the field is `Some(Animatable::Animated)`), so an animated-only
    // opacity promotes exactly like a static one.
    let opacity_present = props.all_styles().any(|s| s.opacity.is_some());
    let group_gate = props.style.as_ref().and_then(|s| s.group_alpha) != Some(false);

    let mut reasons = 0;
    if opacity_present && group_gate && child_count >= 1 && !ineligible_element {
        reasons |= PromotionReasons::OPACITY;
    }
    // `cache: "always"`/`"never"` — forced promotion (for capture caching /
    // for an always-recaptured live layer). Base style only (`no_overlay`),
    // and deliberately NOT gated on children or `groupAlpha`: it has no
    // visual semantics of its own, so the only gates are the element-kind
    // ones.
    let forced = matches!(
        props.style.as_ref().and_then(|s| s.cache),
        Some(crate::protocol::LayerCache::Always | crate::protocol::LayerCache::Never)
    );
    if forced && !ineligible_element {
        reasons |= PromotionReasons::FORCED;
    }
    // A non-empty `filter` chain (a `Some` empty chain is a no-op), unioned
    // across the base style and the hover/press/focus variants like OPACITY
    // (interaction must never flip promotion — a hover filter promotes
    // eagerly, so the capture exists before the first hover). Animated
    // bindings deliberately do NOT join the union: a `FilterParam` binding
    // without a `filter` style has no chain to drive (the binding's bind-time
    // validation warns `filterBinding` and stays inert instead).
    // No child or `groupAlpha` gate: the effect is subtree-wide by
    // definition, so even a leaf is a valid layer (same reasoning as FORCED).
    let filtered = props
        .all_styles()
        .any(|s| s.filter.as_ref().is_some_and(|chain| !chain.0.is_empty()));
    if filtered && !ineligible_element {
        reasons |= PromotionReasons::FILTER;
    }
    // `transform3d` presence — value-blind like FILTER (identity promotes, so
    // animating from identity never flips promotion), no child/`groupAlpha`
    // gate (the transform reshapes the captured result; a leaf is valid).
    let transformed3d = props.all_styles().any(|s| s.transform3d.is_some());
    if transformed3d && !ineligible_element {
        reasons |= PromotionReasons::TRANSFORM3D;
    }
    // A non-empty `backdropFilter` chain — same rules as FILTER (presence
    // union across variants, value-blind, no child/`groupAlpha` gate: a leaf
    // "frosted glass" region is valid; animated `backdropFilter[i].param`
    // bindings do not join the union).
    let backdrop = props
        .all_styles()
        .any(|s| s.backdrop_filter.as_ref().is_some_and(|c| !c.0.is_empty()));
    if backdrop && !ineligible_element {
        reasons |= PromotionReasons::BACKDROP;
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
                .and_then(|s| s.opacity.static_val())
                .unwrap_or(1.0);
            let cache_policy = bridge
                .props_cache
                .get(&id)
                .and_then(|p| p.style.as_ref())
                .and_then(|s| s.cache)
                .unwrap_or_default();
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
                repaints: 0,
                cached: false,
                cache_policy,
            });
            row.entity = entity;
            row.reasons = reasons;
            row.group_alpha = alpha;
            row.cache_policy = cache_policy;
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
            // The resolved chains are promotion-scoped state; `FilterInput`/
            // `BackdropInput` are NOT removed here (they mirror the style,
            // not the promotion).
            commands.entity(entity).remove::<(
                PromotedLayer,
                LayerGroupAlpha,
                LayerCaptureRect,
                crate::filters::ResolvedFilterChain,
                crate::filters::ResolvedBackdropChain,
                transform3d::LayerTransform3d,
                transform3d::LayerTransform3dMatrix,
            )>();
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

/// Recomputes each promoted layer's capture rect (inflated by the node's
/// quantized filter outset — blur reads/writes beyond the border box, and the
/// composite quad, texture allocation, and synthetic-view ortho all derive
/// from this rect), the subtree membership map, and each layer's
/// content-geometry hash (see [`fold_member_geometry`]). Also warns
/// (`filterBleed`) when a nested filtered layer's inflated rect escapes its
/// enclosing layer's capture — v1 clips there, losing part of the bleed.
/// Runs in `PostUpdate` after `bevy_ui` layout so `ComputedNode` /
/// `UiGlobalTransform` are this frame's values.
#[allow(clippy::too_many_arguments, clippy::type_complexity)]
pub fn sync_layer_geometry(
    mut commands: Commands,
    roots: Query<
        (
            Entity,
            &ComputedNode,
            &UiGlobalTransform,
            &crate::bridge::RNode,
            &LayerGroupAlpha,
            Option<&crate::filters::ResolvedFilterChain>,
            Option<&crate::filters::FilterInput>,
            Option<&crate::filters::ResolvedBackdropChain>,
        ),
        With<PromotedLayer>,
    >,
    root_markers: Query<(), With<PromotedLayer>>,
    children: Query<&Children>,
    parents: Query<&ChildOf>,
    existing_rects: Query<&LayerCaptureRect>,
    geometry: Query<(&ComputedNode, &UiGlobalTransform)>,
    mut membership: ResMut<LayerMembership>,
    mut registry: ResMut<LayersRegistry>,
    mut repaints: ResMut<LayerRepaintState>,
    // Bleed-warn dedup: inner root → the (inner, outer) rect pair last warned
    // about. `diag::report` mirrors every call into the console ring, so a
    // per-frame re-report would spam it (the devtools `warning` event path
    // dedups on its own; the console does not).
    mut warned_bleeds: Local<HashMap<Entity, (LayerCaptureRect, LayerCaptureRect)>>,
) {
    membership.node_to_layer.clear();
    membership.enclosing.clear();
    // Post-swap leftovers from last frame's resolver; this frame's hashes are
    // staged fresh below.
    repaints.geo_hashes.clear();
    // This frame's rects by root, for the bleed pass below (`enclosing` roots
    // may be visited in any order, so containment is checked in a second pass
    // once every rect is known).
    let mut frame_rects: HashMap<Entity, LayerCaptureRect> = HashMap::default();
    // Filtered roots with a non-zero outset: (root, node id, quantized outset,
    // first wire filter name — the warning `value` the devtools inspector
    // matches against the retained `filter` style row).
    let mut bleed_candidates: Vec<(Entity, NodeId, u32, String)> = Vec::new();
    for (root, computed, transform, rnode, alpha, chain, filter_input, backdrop_chain) in &roots {
        let row = registry.layers.get_mut(&rnode.0);
        if let Some(row) = &row {
            debug_assert_eq!(row.entity, root);
        }
        let size = computed.size();
        if size.x <= 0.5 || size.y <= 0.5 {
            // Zero-sized / not laid out yet: inactive this frame. The gate
            // reads the CONTENT size (pre-inflation) on purpose — a filter
            // outset alone must not activate an empty node.
            if let Some(row) = row {
                row.capture_rect = None;
            }
            continue;
        }
        // Fractional anchor + whole-texel size (see `LayerCaptureRect`): the
        // anchor tracks the node exactly so translation never re-captures;
        // only a size change reallocs.
        let min = transform.translation - size * 0.5;
        let mut rect = LayerCaptureRect {
            min,
            size: UVec2::new(size.x.ceil() as u32, size.y.ceil() as u32),
            outset: 0,
        };
        if rect.size.x == 0 || rect.size.y == 0 {
            if let Some(row) = row {
                row.capture_rect = None;
            }
            continue;
        }
        // A filter chain reads/writes beyond the border box (blur bleed):
        // grow the capture window by the chain's outset on every side.
        // Quantized to 16px steps because an animated blur radius changes
        // `outset_px` every frame — coarse steps keep the capture size, and
        // with it the geometry hash (size is folded below) and the texture
        // allocation, stable within a step; crossing a step re-captures
        // automatically. The backdrop chain contributes too (its blur needs
        // source pixels beyond the border box in the snapshot): one shared
        // window, inflated by the max of both chains' outsets.
        let content_outset = chain.map_or(0, |c| crate::filters::quantize_outset(c.outset_px));
        let backdrop_outset =
            backdrop_chain.map_or(0, |c| crate::filters::quantize_outset(c.0.outset_px));
        let outset = content_outset.max(backdrop_outset);
        if outset > 0 {
            rect.min -= Vec2::splat(outset as f32);
            rect.size += UVec2::splat(2 * outset);
            rect.outset = outset;
        }
        // Bleed candidacy stays keyed to the CONTENT chain only: a backdrop
        // never bleeds into an enclosing capture (its snapshot is sampled
        // from the frame, edge-clamped; the quad is clamped to the border
        // box), so a backdrop-only outset must not warn.
        if content_outset > 0 {
            let value = filter_input
                .and_then(|i| i.0.0.first())
                .map_or_else(|| "filter".to_owned(), |u| u.name.clone());
            bleed_candidates.push((root, rnode.0, content_outset, value));
        }
        frame_rects.insert(root, rect);
        if existing_rects.get(root) != Ok(&rect) {
            commands.entity(root).insert(rect);
        }
        // Mirror live geometry + alpha into the observability registry (the
        // registry keeps integer px for display — round the anchor; the rect
        // includes the filter-outset margin, i.e. the real capture, and the
        // min is signed so a partially-offscreen or outset-inflated layer
        // displays truthfully). Depth (1 = top-level) is refreshed below once
        // `enclosing` is known.
        if let Some(row) = row {
            let display_min = IVec2::new(rect.min.x.round() as i32, rect.min.y.round() as i32);
            row.capture_rect = Some(IRect::from_corners(
                display_min,
                display_min + rect.size.as_ivec2(),
            ));
            row.group_alpha = alpha.0;
        }
        // Everything under `root` (itself included) belongs to its nearest
        // enclosing-or-self layer. Starting each DFS at a root and letting
        // inner roots re-claim their own subtree makes "nearest wins" hold
        // regardless of iteration order (an outer root's DFS re-visits inner
        // subtrees with the inner root as the current layer). The same walk
        // folds this layer's content-geometry hash: every directly-owned
        // member (and each *directly nested* layer root, whose composite quad
        // is this layer's content) contributes its root-relative geometry.
        let mut hash = GEO_HASH_SEED;
        // The capture size is content too: a resize re-captures even when the
        // interior is otherwise static (texture realloc + web width/height
        // semantics).
        fold_geo_i32(&mut hash, rect.size.x as i32);
        fold_geo_i32(&mut hash, rect.size.y as i32);
        mark_subtree(
            root,
            root,
            root,
            transform.translation,
            &children,
            &root_markers,
            &geometry,
            &mut hash,
            &mut membership.node_to_layer,
        );
        repaints.geo_hashes.insert(root, hash);
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
    // Bleed check: v1 composites a nested layer's quad inside the ENCLOSING
    // layer's capture, which clips at its rect — a filtered layer whose
    // inflated rect escapes it loses part of its bleed (web filters don't
    // clip; known divergence, hence the warn). Top-level layers composite to
    // the screen and are exempt. (Distinct from ancestor *overflow* clipping,
    // which is composite-time — see [`clip`] — and clips bleed correctly:
    // this is the capture TEXTURE's own bounds, the ortho window.) Deduped per root on the (inner, outer) rect
    // pair so a steady bleed reports once and any geometry change re-reports.
    // Bound the dedup map to this frame's candidates — not all active roots:
    // a root that stays promoted (e.g. via opacity) while its filter is
    // unset must drop its entry, or re-adding the identical filter with
    // unchanged geometry would be wrongly suppressed.
    let candidate_roots: HashSet<Entity> = bleed_candidates.iter().map(|(r, ..)| *r).collect();
    warned_bleeds.retain(|e, _| candidate_roots.contains(e));
    for (root, node, outset, value) in bleed_candidates {
        let outer = match membership.enclosing.get(&root) {
            Some(&Some(outer)) => outer,
            _ => {
                warned_bleeds.remove(&root);
                continue;
            }
        };
        let (Some(&inner_rect), Some(&outer_rect)) =
            (frame_rects.get(&root), frame_rects.get(&outer))
        else {
            warned_bleeds.remove(&root);
            continue;
        };
        let inner_max = inner_rect.min + inner_rect.size.as_vec2();
        let outer_max = outer_rect.min + outer_rect.size.as_vec2();
        let mut sides: Vec<&str> = Vec::new();
        if inner_rect.min.x < outer_rect.min.x {
            sides.push("left");
        }
        if inner_rect.min.y < outer_rect.min.y {
            sides.push("top");
        }
        if inner_max.x > outer_max.x {
            sides.push("right");
        }
        if inner_max.y > outer_max.y {
            sides.push("bottom");
        }
        if sides.is_empty() {
            warned_bleeds.remove(&root);
            continue;
        }
        let pair = (inner_rect, outer_rect);
        if warned_bleeds.get(&root) == Some(&pair) {
            continue;
        }
        warned_bleeds.insert(root, pair);
        let _scope = crate::diag::node_scope(node);
        crate::diag::report(
            "filterBleed",
            &value,
            &format!(
                "filter outset ({outset}px) bleeds past the enclosing promoted layer's capture on the {} side and is clipped there — leave ≥{outset}px between this node and that ancestor's edge, or avoid nesting it under a promoted layer",
                sides.join("/")
            ),
        );
    }
}

#[allow(clippy::too_many_arguments)]
fn mark_subtree(
    node: Entity,
    layer: Entity,
    dfs_root: Entity,
    root_translation: Vec2,
    children: &Query<&Children>,
    roots: &Query<(), With<PromotedLayer>>,
    geometry: &Query<(&ComputedNode, &UiGlobalTransform)>,
    hash: &mut u64,
    map: &mut HashMap<Entity, Entity>,
) {
    // Geometry-hash contribution: a node is `dfs_root`'s *content* while the
    // incoming claim context is still `dfs_root` itself — that covers its
    // directly-owned members plus each directly nested layer root (whose
    // composite quad draws inside this capture; the nested root's *interior*
    // belongs to the inner hash, and inner dirt propagates outward anyway).
    if layer == dfs_root
        && let Ok((computed, transform)) = geometry.get(node)
    {
        fold_member_geometry(hash, root_translation, transform, computed);
    }
    // An inner promoted root claims itself and its subtree: its own paint
    // fades with the *inner* group. (Its composite quad routes by
    // `LayerMembership::enclosing`, not this map.)
    let layer = if roots.contains(node) { node } else { layer };
    map.insert(node, layer);
    if let Ok(kids) = children.get(node) {
        for &kid in kids {
            mark_subtree(
                kid,
                layer,
                dfs_root,
                root_translation,
                children,
                roots,
                geometry,
                hash,
                map,
            );
        }
    }
}

/// FNV-1a offset basis — the seed of every per-layer geometry hash.
const GEO_HASH_SEED: u64 = 0xcbf29ce484222325;

fn fold_geo_i32(hash: &mut u64, v: i32) {
    for b in v.to_le_bytes() {
        *hash = (*hash ^ b as u64).wrapping_mul(0x100000001b3);
    }
}

/// Fold one member's **root-relative** geometry into a layer's content hash:
/// translation relative to the layer root (so moving the whole layer cancels
/// exactly and never re-captures), the affine's linear part (member scale /
/// rotation), and the laid-out size. Quantized (1/64 px positions, 1/1024
/// matrix entries) so float ulp noise — `(a+d)-(b+d)` isn't bit-exact — can't
/// flap the hash. Visit order is encoded implicitly by the fold sequence, so
/// reorders change the hash too.
pub fn fold_member_geometry(
    hash: &mut u64,
    root_translation: Vec2,
    transform: &UiGlobalTransform,
    computed: &ComputedNode,
) {
    let rel = transform.translation - root_translation;
    fold_geo_i32(hash, (rel.x * 64.0).round() as i32);
    fold_geo_i32(hash, (rel.y * 64.0).round() as i32);
    let m = transform.matrix2;
    fold_geo_i32(hash, (m.x_axis.x * 1024.0).round() as i32);
    fold_geo_i32(hash, (m.x_axis.y * 1024.0).round() as i32);
    fold_geo_i32(hash, (m.y_axis.x * 1024.0).round() as i32);
    fold_geo_i32(hash, (m.y_axis.y * 1024.0).round() as i32);
    let size = computed.size();
    fold_geo_i32(hash, (size.x * 64.0).round() as i32);
    fold_geo_i32(hash, (size.y * 64.0).round() as i32);
}

/// `<image>` textures arrive asynchronously — no op, no bevy-react write site
/// — so watch the asset events and dirty the owning layer of any node using a
/// touched image. (One frame late for loads, which are async anyway; canvas
/// uploads are also `Modified` here, double-covering their direct tap.)
pub fn watch_layer_image_assets(
    mut events: MessageReader<AssetEvent<Image>>,
    images: Query<(Entity, &bevy::ui::widget::ImageNode)>,
    registry: Res<LayersRegistry>,
    mut dirt: ResMut<LayerContentDirt>,
) {
    if registry.layers.is_empty() {
        events.clear();
        return;
    }
    let mut touched: Vec<AssetId<Image>> = Vec::new();
    for event in events.read() {
        match event {
            AssetEvent::LoadedWithDependencies { id } | AssetEvent::Modified { id } => {
                touched.push(*id);
            }
            _ => {}
        }
    }
    if touched.is_empty() {
        return;
    }
    for (entity, image) in &images {
        if touched.contains(&image.image.id()) {
            dirt.nodes.push(entity);
        }
    }
}

/// Turn this frame's dirt into per-layer repaint decisions. Runs in
/// `PostUpdate` after [`sync_layer_geometry`] (membership + geometry hashes
/// are this frame's) and after `bevy_ui`'s text systems (`Changed<TextLayoutInfo>`
/// must see this frame's reshapes). Render extraction reads the result at the
/// sync point; the state is rebuilt from scratch next frame, so nothing needs
/// clearing across frames.
pub fn resolve_layer_repaints(
    mut dirt: ResMut<LayerContentDirt>,
    mut state: ResMut<LayerRepaintState>,
    membership: Res<LayerMembership>,
    mut registry: ResMut<LayersRegistry>,
    bridge: Option<Res<crate::bridge::JsBridge>>,
    reshaped: Query<Entity, Changed<bevy::text::TextLayoutInfo>>,
    focus: Query<&crate::bridge::FocusState>,
) {
    let state = &mut *state;
    state.dirty.clear();

    // 1. Content dirt → owning layer.
    for e in dirt.nodes.drain(..) {
        if let Some(&layer) = membership.node_to_layer.get(&e) {
            state.dirty.insert(layer);
        }
    }
    // 2. Composite-only dirt (a promoted root's own translate / group alpha)
    //    → the ENCLOSING layer only: the root's quad is content of the outer
    //    capture, while its own capture is unaffected.
    for e in dirt.composite_only.drain(..) {
        let layer = membership.node_to_layer.get(&e).copied().unwrap_or(e);
        if let Some(&Some(outer)) = membership.enclosing.get(&layer) {
            state.dirty.insert(outer);
        }
    }
    // 3. Text reshape (font load, re-wrap, edits): Bevy's own text systems
    //    write `TextLayoutInfo` — there is no bevy-react write site to tap.
    for e in &reshaped {
        if let Some(&layer) = membership.node_to_layer.get(&e) {
            state.dirty.insert(layer);
        }
    }
    // 4. A focused editable inside a layer repaints every frame: the caret
    //    blink is rendered by Bevy's text systems with no signal we can see.
    if let Some(bridge) = bridge {
        for id in &bridge.editable_inputs {
            if let Some(&e) = bridge.nodes.get(id)
                && focus.get(e).is_ok_and(|f| f.0)
                && let Some(&layer) = membership.node_to_layer.get(&e)
            {
                state.dirty.insert(layer);
            }
        }
    }
    // 5. Geometry: any change in a layer's root-relative content geometry —
    //    including the first frame after promotion (no previous hash).
    for (&root, hash) in &state.geo_hashes {
        if state.prev_hashes.get(&root) != Some(hash) {
            state.dirty.insert(root);
        }
    }
    std::mem::swap(&mut state.prev_hashes, &mut state.geo_hashes);
    // 6. `cache: "never"` — the layer's pixels are written outside the dirt
    //    tracking's sight (live portal targets, app-owned textures), so it
    //    re-captures unconditionally. Seeded before the outward propagation:
    //    live pixels defeat ancestor caching (same rationale as backdrop).
    for meta in registry.layers.values() {
        if meta.cache_policy == crate::protocol::LayerCache::Never {
            state.dirty.insert(meta.entity);
        }
    }
    // 7. Propagate outward: a dirty inner layer's composite quad re-draws
    //    inside its enclosing captures, so every outer layer re-captures too.
    let seeds: Vec<Entity> = state.dirty.iter().copied().collect();
    for mut layer in seeds {
        while let Some(&Some(outer)) = membership.enclosing.get(&layer) {
            if !state.dirty.insert(outer) {
                break; // already dirty ⇒ its own chain is already walked
            }
            layer = outer;
        }
    }
    // 8. Observability: per-layer cache stats for devtools.
    for meta in registry.layers.values_mut() {
        let dirty = state.dirty.contains(&meta.entity);
        meta.cached = !dirty;
        if dirty {
            meta.repaints += 1;
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
        // An `{ animated }` opacity is field presence like a static one.
        let animated = props(serde_json::json!({
            "style": { "opacity": { "animated": { "id": 1 } } },
        }));
        assert!(promoted(&animated, 1, false));
        // Ineligible element kinds (text / detached roots) never promote.
        assert!(!promoted(&base, 1, true));

        // `cache: "always"` forces promotion — no opacity, no children, and
        // even `groupAlpha: false` (which only gates the OPACITY rule) needed.
        let forced = props(serde_json::json!({ "style": { "cache": "always" } }));
        assert_eq!(
            promotion_reasons(&forced, 0, false).0,
            PromotionReasons::FORCED
        );
        let forced_opted_out = props(serde_json::json!({
            "style": { "cache": "always", "opacity": 0.5, "groupAlpha": false }
        }));
        assert_eq!(
            promotion_reasons(&forced_opted_out, 1, false).0,
            PromotionReasons::FORCED
        );
        // Forced + opacity on an eligible node sets both bits.
        let both = props(serde_json::json!({
            "style": { "cache": "always", "opacity": 0.5 }
        }));
        assert_eq!(
            promotion_reasons(&both, 1, false).0,
            PromotionReasons::FORCED | PromotionReasons::OPACITY
        );
        // `cache: "auto"` is the default: no forced bit.
        let auto = props(serde_json::json!({ "style": { "cache": "auto" } }));
        assert!(!promoted(&auto, 1, false));
        // Element eligibility still applies to forced promotion.
        assert!(!promoted(&forced, 1, true));

        // A non-empty `filter` chain promotes — even a leaf (the effect is
        // subtree-wide by definition; no child or `groupAlpha` gate, same
        // reasoning as FORCED).
        let filtered = props(serde_json::json!({ "style": { "filter": { "name": "blur" } } }));
        assert_eq!(
            promotion_reasons(&filtered, 0, false).0,
            PromotionReasons::FILTER
        );
        // A present-but-empty chain (`filter: []`) is a no-op — no promotion.
        let empty_chain = props(serde_json::json!({ "style": { "filter": [] } }));
        assert!(!promoted(&empty_chain, 1, false));
        // Filter + opacity on an eligible node sets both bits.
        let filter_and_opacity = props(serde_json::json!({
            "style": { "filter": { "name": "blur" }, "opacity": 0.5 }
        }));
        assert_eq!(
            promotion_reasons(&filter_and_opacity, 1, false).0,
            PromotionReasons::FILTER | PromotionReasons::OPACITY
        );
        // Element eligibility still applies to filter promotion.
        assert!(!promoted(&filtered, 0, true));
        // Variant-carried filters count — presence union, like opacity
        // (interaction must never flip promotion): a hover/press/focus-only
        // filter promotes EAGERLY, even while not hovered, so the capture
        // exists before the first hover.
        for variant in ["hoverStyle", "pressStyle", "focusStyle"] {
            let variant_filter = props(serde_json::json!({
                "style": { "width": 10 },
                (variant): { "filter": { "name": "blur" } },
            }));
            assert_eq!(
                promotion_reasons(&variant_filter, 0, false).0,
                PromotionReasons::FILTER,
                "{variant}-only filter promotes eagerly"
            );
        }
        // A variant carrying only an EMPTY chain is still a no-op.
        let empty_variant = props(serde_json::json!({
            "style": { "width": 10 },
            "hoverStyle": { "filter": [] },
        }));
        assert!(!promoted(&empty_variant, 1, false));

        // `transform3d` presence promotes — value-blind (an identity `{}`
        // still promotes, so animating from identity never flips promotion),
        // even on a leaf (no child/`groupAlpha` gate).
        let transformed = props(serde_json::json!({
            "style": { "transform3d": { "rotateY": 45 } }
        }));
        assert_eq!(
            promotion_reasons(&transformed, 0, false).0,
            PromotionReasons::TRANSFORM3D
        );
        let identity_3d = props(serde_json::json!({ "style": { "transform3d": {} } }));
        assert_eq!(
            promotion_reasons(&identity_3d, 0, false).0,
            PromotionReasons::TRANSFORM3D
        );
        // `groupAlpha: false` does NOT gate it (that knob is opacity-only).
        let opted_out = props(serde_json::json!({
            "style": { "transform3d": {}, "groupAlpha": false }
        }));
        assert!(promoted(&opted_out, 0, false));
        // Variant-only presence promotes eagerly (interaction never flips
        // promotion), and element eligibility still applies.
        for variant in ["hoverStyle", "pressStyle", "focusStyle"] {
            let variant_3d = props(serde_json::json!({
                "style": { "width": 10 },
                (variant): { "transform3d": { "rotateX": 10 } },
            }));
            assert_eq!(
                promotion_reasons(&variant_3d, 0, false).0,
                PromotionReasons::TRANSFORM3D,
                "{variant}-only transform3d promotes eagerly"
            );
        }
        assert!(!promoted(&transformed, 0, true));

        // A non-empty `backdropFilter` chain promotes — same rules as FILTER:
        // even a leaf, value-blind, empty chain is a no-op, variant presence
        // unions, and element eligibility still applies.
        let backdrop =
            props(serde_json::json!({ "style": { "backdropFilter": { "name": "blur" } } }));
        assert_eq!(
            promotion_reasons(&backdrop, 0, false).0,
            PromotionReasons::BACKDROP
        );
        let empty_backdrop = props(serde_json::json!({ "style": { "backdropFilter": [] } }));
        assert!(!promoted(&empty_backdrop, 1, false));
        // Backdrop + content filter are independent bits.
        let both_chains = props(serde_json::json!({
            "style": { "backdropFilter": { "name": "blur" }, "filter": { "name": "sepia" } }
        }));
        assert_eq!(
            promotion_reasons(&both_chains, 0, false).0,
            PromotionReasons::BACKDROP | PromotionReasons::FILTER
        );
        for variant in ["hoverStyle", "pressStyle", "focusStyle"] {
            let variant_backdrop = props(serde_json::json!({
                "style": { "width": 10 },
                (variant): { "backdropFilter": { "name": "blur" } },
            }));
            assert_eq!(
                promotion_reasons(&variant_backdrop, 0, false).0,
                PromotionReasons::BACKDROP,
                "{variant}-only backdropFilter promotes eagerly"
            );
        }
        assert!(!promoted(&backdrop, 0, true));

        // Absent → no bit; unset (style without the field) demotes.
        let plain = props(serde_json::json!({ "style": { "width": 10 } }));
        assert!(!promoted(&plain, 1, false));
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

    /// `cache: "always"` promotes a childless node with the FORCED reason and
    /// a neutral group alpha; unsetting it demotes.
    #[test]
    fn forced_cache_lifecycle() {
        let (mut app, ops_tx) = layer_app();
        ops_tx
            .send(vec![create(
                1,
                serde_json::json!({ "style": { "cache": "always" } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let promoted = app.world().get::<PromotedLayer>(e).expect("promoted");
        assert_eq!(promoted.reasons.0, PromotionReasons::FORCED);
        // No opacity → the composite alpha is neutral.
        assert_eq!(
            app.world().get::<LayerGroupAlpha>(e),
            Some(&LayerGroupAlpha(1.0))
        );

        ops_tx
            .send(vec![update(1, serde_json::json!({}), &["cache"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
    }

    /// `cache: "never"` force-promotes like `"always"` (same FORCED reason)
    /// but records the `Never` policy on the registry row; flipping between
    /// the two updates the policy without a demote/promote cycle, and
    /// unsetting demotes.
    #[test]
    fn never_cache_lifecycle_and_policy() {
        use crate::protocol::LayerCache;
        let (mut app, ops_tx) = layer_app();
        ops_tx
            .send(vec![create(
                1,
                serde_json::json!({ "style": { "cache": "never" } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let promoted = app.world().get::<PromotedLayer>(e).expect("promoted");
        assert_eq!(promoted.reasons.0, PromotionReasons::FORCED);
        let row = app.world().resource::<LayersRegistry>().layers[&1];
        assert_eq!(row.cache_policy, LayerCache::Never);

        // Flip to "always": still promoted (same entity), policy updates.
        ops_tx
            .send(vec![update(
                1,
                serde_json::json!({ "style": { "cache": "always" } }),
                &[],
            )])
            .unwrap();
        app.update();
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "stays promoted"
        );
        let row = app.world().resource::<LayersRegistry>().layers[&1];
        assert_eq!(row.cache_policy, LayerCache::Always);

        ops_tx
            .send(vec![update(1, serde_json::json!({}), &["cache"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
    }

    /// A `filter` chain promotes a childless node with the FILTER reason and
    /// a registry row; unsetting the filter demotes.
    #[test]
    fn filter_promotion_lifecycle() {
        let (mut app, ops_tx) = layer_app();
        ops_tx
            .send(vec![create(
                1,
                serde_json::json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let promoted = app.world().get::<PromotedLayer>(e).expect("promoted");
        assert_eq!(promoted.reasons.0, PromotionReasons::FILTER);
        // No opacity → the composite alpha is neutral.
        assert_eq!(
            app.world().get::<LayerGroupAlpha>(e),
            Some(&LayerGroupAlpha(1.0))
        );
        let registry = app.world().resource::<LayersRegistry>();
        assert_eq!(registry.layers.len(), 1);
        assert_eq!(registry.layers[&1].reasons.0, PromotionReasons::FILTER);

        ops_tx
            .send(vec![update(1, serde_json::json!({}), &["filter"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
    }

    /// The BACKDROP lifecycle mirrors FILTER: a `backdropFilter` create
    /// promotes with the BACKDROP reason (neutral group alpha, registry
    /// entry), and `styleUnset` demotes and empties the registry.
    #[test]
    fn backdrop_promotion_lifecycle() {
        let (mut app, ops_tx) = layer_app();
        ops_tx
            .send(vec![create(
                1,
                serde_json::json!({ "style": { "backdropFilter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let promoted = app.world().get::<PromotedLayer>(e).expect("promoted");
        assert_eq!(promoted.reasons.0, PromotionReasons::BACKDROP);
        assert_eq!(
            app.world().get::<LayerGroupAlpha>(e),
            Some(&LayerGroupAlpha(1.0))
        );
        let registry = app.world().resource::<LayersRegistry>();
        assert_eq!(registry.layers.len(), 1);
        assert_eq!(registry.layers[&1].reasons.0, PromotionReasons::BACKDROP);

        ops_tx
            .send(vec![update(1, serde_json::json!({}), &["backdropFilter"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
    }

    /// A `hoverStyle`-only filter promotes EAGERLY — from creation, while the
    /// node is not (and never has been) hovered — exactly like variant-carried
    /// opacity: the union is presence-based, so interaction never flips
    /// promotion and the capture exists before the first hover (no
    /// first-hover hitch). Unsetting the variant demotes.
    #[test]
    fn hover_filter_promotes_eagerly_from_creation() {
        let (mut app, ops_tx) = layer_app();
        ops_tx
            .send(vec![create(
                1,
                serde_json::json!({
                    "style": { "width": 10 },
                    "hoverStyle": { "filter": { "name": "blur", "params": { "radius": 8 } } },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let promoted = app
            .world()
            .get::<PromotedLayer>(e)
            .expect("promoted before any hover");
        assert_eq!(promoted.reasons.0, PromotionReasons::FILTER);
        assert_eq!(
            app.world().resource::<LayersRegistry>().layers[&1]
                .reasons
                .0,
            PromotionReasons::FILTER
        );

        // Dropping the hover variant (React removed `hoverStyle`) demotes.
        ops_tx
            .send(vec![Op::Update {
                id: 1,
                props: props(serde_json::json!({})),
                unset: vec!["hoverStyle".into()],
                style_unset: vec![],
            }])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(app.world().resource::<LayersRegistry>().layers.is_empty());
    }

    /// [`resolve_layer_repaints`] unit-tested over a hand-built membership:
    /// content dirt resolves to the owning layer, composite-only dirt to the
    /// enclosing layer only, geometry-hash changes (and first frames) dirty,
    /// and dirt propagates out through nested layers.
    #[test]
    fn repaint_resolution_and_propagation() {
        let mut world = World::new();
        world.init_resource::<LayerContentDirt>();
        world.init_resource::<LayerRepaintState>();
        world.init_resource::<LayersRegistry>();

        let outer = world.spawn_empty().id();
        let inner = world.spawn_empty().id();
        let member = world.spawn_empty().id(); // owned by `inner`
        let outer_member = world.spawn_empty().id(); // owned by `outer`
        let mut membership = LayerMembership::default();
        membership.node_to_layer.insert(outer, outer);
        membership.node_to_layer.insert(inner, inner);
        membership.node_to_layer.insert(member, inner);
        membership.node_to_layer.insert(outer_member, outer);
        membership.enclosing.insert(outer, None);
        membership.enclosing.insert(inner, Some(outer));
        world.insert_resource(membership);

        let mut schedule = Schedule::default();
        schedule.add_systems(resolve_layer_repaints);
        let mut run = |world: &mut World| {
            schedule.run(world);
            world.resource::<LayerRepaintState>().dirty.clone()
        };

        // Seed both layers' hashes (first sight = dirty).
        {
            let mut state = world.resource_mut::<LayerRepaintState>();
            state.geo_hashes.insert(outer, 1);
            state.geo_hashes.insert(inner, 2);
        }
        let dirty = run(&mut world);
        assert!(
            dirty.contains(&outer) && dirty.contains(&inner),
            "{dirty:?}"
        );

        // Steady state: same hashes, no dirt → clean.
        {
            let mut state = world.resource_mut::<LayerRepaintState>();
            state.geo_hashes.insert(outer, 1);
            state.geo_hashes.insert(inner, 2);
        }
        assert!(run(&mut world).is_empty());

        // Content dirt on an inner member → inner dirty AND propagates to outer.
        {
            let mut state = world.resource_mut::<LayerRepaintState>();
            state.geo_hashes.insert(outer, 1);
            state.geo_hashes.insert(inner, 2);
            world.resource_mut::<LayerContentDirt>().nodes.push(member);
        }
        let dirty = run(&mut world);
        assert!(dirty.contains(&inner) && dirty.contains(&outer));

        // Composite-only dirt on the inner ROOT → outer only (its own capture
        // is untouched; its quad is the outer's content).
        {
            let mut state = world.resource_mut::<LayerRepaintState>();
            state.geo_hashes.insert(outer, 1);
            state.geo_hashes.insert(inner, 2);
            world
                .resource_mut::<LayerContentDirt>()
                .composite_only
                .push(inner);
        }
        let dirty = run(&mut world);
        assert!(
            dirty.contains(&outer) && !dirty.contains(&inner),
            "{dirty:?}"
        );

        // Composite-only dirt on a TOP-LEVEL root → nothing to re-capture.
        {
            let mut state = world.resource_mut::<LayerRepaintState>();
            state.geo_hashes.insert(outer, 1);
            state.geo_hashes.insert(inner, 2);
            world
                .resource_mut::<LayerContentDirt>()
                .composite_only
                .push(outer);
        }
        assert!(run(&mut world).is_empty());

        // A geometry-hash change dirties that layer (and propagates outward).
        {
            let mut state = world.resource_mut::<LayerRepaintState>();
            state.geo_hashes.insert(outer, 1);
            state.geo_hashes.insert(inner, 3);
        }
        let dirty = run(&mut world);
        assert!(dirty.contains(&inner) && dirty.contains(&outer));

        // Content dirt on an outer-owned member → outer only.
        {
            let mut state = world.resource_mut::<LayerRepaintState>();
            state.geo_hashes.insert(outer, 1);
            state.geo_hashes.insert(inner, 3);
            world
                .resource_mut::<LayerContentDirt>()
                .nodes
                .push(outer_member);
        }
        let dirty = run(&mut world);
        assert!(dirty.contains(&outer) && !dirty.contains(&inner));
    }

    /// A `cache: "never"` layer is dirty every frame with no other dirt —
    /// and, being ordinary dirt, propagates out through its enclosing layers
    /// (live pixels defeat ancestor caching). Unrelated layers stay cached.
    #[test]
    fn never_policy_repaints_every_frame() {
        use crate::protocol::LayerCache;
        let mut world = World::new();
        world.init_resource::<LayerContentDirt>();
        world.init_resource::<LayerRepaintState>();
        world.init_resource::<LayersRegistry>();

        let outer = world.spawn_empty().id();
        let inner = world.spawn_empty().id(); // cache: "never", nested in outer
        let other = world.spawn_empty().id(); // unrelated top-level layer
        let mut membership = LayerMembership::default();
        membership.node_to_layer.insert(outer, outer);
        membership.node_to_layer.insert(inner, inner);
        membership.node_to_layer.insert(other, other);
        membership.enclosing.insert(outer, None);
        membership.enclosing.insert(inner, Some(outer));
        membership.enclosing.insert(other, None);
        world.insert_resource(membership);

        let meta = |node: NodeId, entity: Entity, policy: LayerCache| LayerMeta {
            node,
            entity,
            reasons: PromotionReasons(PromotionReasons::FORCED),
            group_alpha: 1.0,
            capture_rect: None,
            depth: 1,
            repaints: 0,
            cached: false,
            cache_policy: policy,
        };
        {
            let mut registry = world.resource_mut::<LayersRegistry>();
            registry.layers.insert(1, meta(1, outer, LayerCache::Auto));
            registry.layers.insert(2, meta(2, inner, LayerCache::Never));
            registry
                .layers
                .insert(3, meta(3, other, LayerCache::Always));
        }

        let mut schedule = Schedule::default();
        schedule.add_systems(resolve_layer_repaints);
        for frame in 0..2 {
            schedule.run(&mut world);
            let state = world.resource::<LayerRepaintState>();
            assert!(
                state.dirty.contains(&inner) && state.dirty.contains(&outer),
                "frame {frame}: {:?}",
                state.dirty
            );
            assert!(!state.dirty.contains(&other), "frame {frame}");
        }
        let registry = world.resource::<LayersRegistry>();
        assert_eq!(registry.layers[&2].repaints, 2);
        assert!(!registry.layers[&2].cached);
        assert!(registry.layers[&3].cached);
    }

    /// The geometry fold cancels a uniform translation of root + members
    /// (moving a whole layer never re-captures) but reacts to relative moves,
    /// resizes, and member scale/rotation.
    #[test]
    fn geometry_fold_translation_invariance() {
        use bevy::math::Affine2;

        let node = |size: Vec2, pos: Vec2| {
            let computed = ComputedNode {
                size,
                ..Default::default()
            };
            (
                computed,
                UiGlobalTransform::from(Affine2::from_translation(pos)),
            )
        };
        let fold = |members: &[(ComputedNode, UiGlobalTransform)], root: Vec2| {
            let mut hash = GEO_HASH_SEED;
            for (computed, transform) in members {
                fold_member_geometry(&mut hash, root, transform, computed);
            }
            hash
        };

        let members = [
            node(Vec2::new(100.0, 50.0), Vec2::new(10.0, 20.0)),
            node(Vec2::new(30.0, 30.0), Vec2::new(40.0, 25.0)),
        ];
        let base = fold(&members, Vec2::new(10.0, 20.0));

        // Shift everything (root + members) by the same delta — even a
        // fractional one — and the hash is unchanged.
        let delta = Vec2::new(123.4, -56.78);
        let shifted = [
            node(Vec2::new(100.0, 50.0), Vec2::new(10.0, 20.0) + delta),
            node(Vec2::new(30.0, 30.0), Vec2::new(40.0, 25.0) + delta),
        ];
        assert_eq!(base, fold(&shifted, Vec2::new(10.0, 20.0) + delta));

        // One member moves relative to the root → different hash.
        let moved = [
            node(Vec2::new(100.0, 50.0), Vec2::new(10.0, 20.0)),
            node(Vec2::new(30.0, 30.0), Vec2::new(41.0, 25.0)),
        ];
        assert_ne!(base, fold(&moved, Vec2::new(10.0, 20.0)));

        // A member resizes → different hash.
        let resized = [
            node(Vec2::new(100.0, 50.0), Vec2::new(10.0, 20.0)),
            node(Vec2::new(31.0, 30.0), Vec2::new(40.0, 25.0)),
        ];
        assert_ne!(base, fold(&resized, Vec2::new(10.0, 20.0)));

        // A member's scale (affine linear part) changes → different hash.
        let mut scaled = [
            node(Vec2::new(100.0, 50.0), Vec2::new(10.0, 20.0)),
            node(Vec2::new(30.0, 30.0), Vec2::new(40.0, 25.0)),
        ];
        scaled[1].1 = UiGlobalTransform::from(Affine2::from_scale_angle_translation(
            Vec2::splat(1.5),
            0.0,
            Vec2::new(40.0, 25.0),
        ));
        assert_ne!(base, fold(&scaled, Vec2::new(10.0, 20.0)));

        // Sub-quantum float noise (≪ 1/64 px) does NOT change the hash.
        let noisy = [
            node(Vec2::new(100.0, 50.0), Vec2::new(10.0 + 1e-4, 20.0)),
            node(Vec2::new(30.0, 30.0), Vec2::new(40.0, 25.0 - 1e-4)),
        ];
        assert_eq!(base, fold(&noisy, Vec2::new(10.0, 20.0)));
    }

    /// World + schedule harness for [`sync_layer_geometry`] +
    /// [`resolve_layer_repaints`]: promoted roots are hand-spawned with
    /// laid-out geometry (`ComputedNode` / `UiGlobalTransform`), and filter
    /// state is inserted directly ([`crate::filters::ResolvedFilterChain`]) —
    /// the resolver system does not run here.
    fn geometry_world() -> (World, Schedule) {
        let mut world = World::new();
        world.init_resource::<LayerMembership>();
        world.init_resource::<LayersRegistry>();
        world.init_resource::<LayerRepaintState>();
        world.init_resource::<LayerContentDirt>();
        let mut schedule = Schedule::default();
        schedule.add_systems((sync_layer_geometry, resolve_layer_repaints).chain());
        (world, schedule)
    }

    /// `center` is the node's `UiGlobalTransform` translation (its center, as
    /// in the real UI transform), so the un-inflated rect min is
    /// `center - size/2`.
    fn spawn_layer_root(world: &mut World, id: NodeId, size: Vec2, center: Vec2) -> Entity {
        world
            .spawn((
                ComputedNode {
                    size,
                    ..Default::default()
                },
                UiGlobalTransform::from(bevy::math::Affine2::from_translation(center)),
                crate::bridge::RNode(id),
                LayerGroupAlpha(1.0),
                PromotedLayer {
                    reasons: PromotionReasons(PromotionReasons::FILTER),
                },
            ))
            .id()
    }

    fn filter_outset(world: &mut World, e: Entity, outset_px: u32) {
        world
            .entity_mut(e)
            .insert(crate::filters::ResolvedFilterChain {
                outset_px,
                ..Default::default()
            });
    }

    fn backdrop_outset(world: &mut World, e: Entity, outset_px: u32) {
        world
            .entity_mut(e)
            .insert(crate::filters::ResolvedBackdropChain(
                crate::filters::ResolvedFilterChain {
                    outset_px,
                    ..Default::default()
                },
            ));
    }

    /// A filtered root's capture rect grows by the QUANTIZED outset on every
    /// side: min shifts by `-q`, size by `+2q` per axis (blur reads/writes
    /// beyond the border box, so capture and composite quad must both cover
    /// the bleed).
    #[test]
    fn outset_inflates_rect_by_quantized_margin() {
        let (mut world, mut schedule) = geometry_world();
        let size = Vec2::new(100.0, 60.0);
        let center = Vec2::new(50.0, 30.0);
        let plain = spawn_layer_root(&mut world, 1, size, center);
        let blurred = spawn_layer_root(&mut world, 2, size, center);
        filter_outset(&mut world, blurred, 12); // blur radius 4 → 3×4 = 12
        let big = spawn_layer_root(&mut world, 3, size, center);
        filter_outset(&mut world, big, 60); // blur radius 20 → 60
        schedule.run(&mut world);

        let base = *world.get::<LayerCaptureRect>(plain).expect("baseline rect");
        assert_eq!(base.min, Vec2::ZERO);
        assert_eq!(base.size, UVec2::new(100, 60));
        // quantize_outset(12) = 16.
        let rect = *world.get::<LayerCaptureRect>(blurred).expect("rect");
        assert_eq!(rect.min, base.min - Vec2::splat(16.0));
        assert_eq!(rect.size, base.size + UVec2::splat(32));
        // quantize_outset(60) = 64.
        let rect = *world.get::<LayerCaptureRect>(big).expect("rect");
        assert_eq!(rect.min, base.min - Vec2::splat(64.0));
        assert_eq!(rect.size, base.size + UVec2::splat(128));
    }

    /// The backdrop chain's outset inflates the shared capture window too,
    /// and when both chains carry one, the MAX wins (one window serves both);
    /// the applied margin is recorded on `rect.outset` so the render side can
    /// recover the un-inflated border box for the backdrop quad.
    #[test]
    fn backdrop_outset_inflates_rect_and_maxes_with_content() {
        let (mut world, mut schedule) = geometry_world();
        let size = Vec2::new(100.0, 60.0);
        let center = Vec2::new(50.0, 30.0);
        let plain = spawn_layer_root(&mut world, 1, size, center);
        let frosted = spawn_layer_root(&mut world, 2, size, center);
        backdrop_outset(&mut world, frosted, 12); // quantize → 16
        let both = spawn_layer_root(&mut world, 3, size, center);
        filter_outset(&mut world, both, 4); // quantize → 16
        backdrop_outset(&mut world, both, 40); // quantize → 48, wins
        schedule.run(&mut world);

        let base = *world.get::<LayerCaptureRect>(plain).expect("baseline");
        assert_eq!(base.outset, 0);
        let rect = *world.get::<LayerCaptureRect>(frosted).expect("rect");
        assert_eq!(rect.min, base.min - Vec2::splat(16.0));
        assert_eq!(rect.size, base.size + UVec2::splat(32));
        assert_eq!(rect.outset, 16);
        let rect = *world.get::<LayerCaptureRect>(both).expect("rect");
        assert_eq!(rect.min, base.min - Vec2::splat(48.0));
        assert_eq!(rect.size, base.size + UVec2::splat(96));
        assert_eq!(rect.outset, 48);
    }

    /// An outset change WITHIN one 16px quantize step keeps the rect — and
    /// therefore the geometry hash and the capture cache — untouched (the
    /// point of quantizing: an animated radius must not realloc every frame).
    #[test]
    fn outset_within_quantize_step_holds_rect_and_cache() {
        let (mut world, mut schedule) = geometry_world();
        let e = spawn_layer_root(&mut world, 1, Vec2::new(100.0, 60.0), Vec2::new(50.0, 30.0));
        filter_outset(&mut world, e, 12);
        schedule.run(&mut world);
        assert!(
            world.resource::<LayerRepaintState>().dirty.contains(&e),
            "first frame repaints"
        );
        let before = *world.get::<LayerCaptureRect>(e).expect("rect");

        filter_outset(&mut world, e, 14); // same step: quantize(14) == quantize(12) == 16
        schedule.run(&mut world);
        assert_eq!(*world.get::<LayerCaptureRect>(e).expect("rect"), before);
        assert!(
            world.resource::<LayerRepaintState>().dirty.is_empty(),
            "no repaint within a quantize step"
        );
    }

    /// Crossing a quantize step changes the rect size, which is folded into
    /// the geometry hash — so the layer re-captures automatically at the new
    /// size.
    #[test]
    fn outset_crossing_quantize_step_recaptures() {
        let (mut world, mut schedule) = geometry_world();
        let e = spawn_layer_root(&mut world, 1, Vec2::new(100.0, 60.0), Vec2::new(50.0, 30.0));
        filter_outset(&mut world, e, 14); // quantize → 16
        schedule.run(&mut world);
        schedule.run(&mut world); // settle: steady state is clean
        assert!(world.resource::<LayerRepaintState>().dirty.is_empty());
        let before = *world.get::<LayerCaptureRect>(e).expect("rect");

        filter_outset(&mut world, e, 18); // quantize → 32: next step
        schedule.run(&mut world);
        let after = *world.get::<LayerCaptureRect>(e).expect("rect");
        assert_eq!(after.min, before.min - Vec2::splat(16.0));
        assert_eq!(after.size, before.size + UVec2::splat(32));
        assert!(
            world.resource::<LayerRepaintState>().dirty.contains(&e),
            "step crossing re-captures"
        );
    }

    /// The inactive gate reads the CONTENT size: a zero-sized filtered node
    /// must not become an active layer just because its outset is non-zero.
    #[test]
    fn zero_content_size_stays_inactive_despite_outset() {
        let (mut world, mut schedule) = geometry_world();
        let e = spawn_layer_root(&mut world, 1, Vec2::ZERO, Vec2::ZERO);
        filter_outset(&mut world, e, 60);
        schedule.run(&mut world);
        assert!(
            world.get::<LayerCaptureRect>(e).is_none(),
            "zero content size stays inactive"
        );
    }

    /// A nested filtered layer whose INFLATED rect escapes the enclosing
    /// layer's rect warns (`filterBleed`, attributed to the node, naming the
    /// clipped sides); a fully-contained bleed does not, and a steady bleed
    /// re-reports only when the rect pair changes.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn nested_filter_bleed_warns_when_clipped() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut world, mut schedule) = geometry_world();
        // Outer layer: 200×200 at (0,0)-(200,200).
        let outer = spawn_layer_root(&mut world, 1, Vec2::splat(200.0), Vec2::splat(100.0));
        // Inner filtered layer: 100×100 centered → un-inflated (50,50)-(150,150).
        let inner = spawn_layer_root(&mut world, 2, Vec2::splat(100.0), Vec2::splat(100.0));
        world.entity_mut(inner).insert((
            ChildOf(outer),
            crate::filters::FilterInput(crate::filters::FilterChain(vec![
                crate::filters::FilterUse {
                    name: "blur".into(),
                    params: Default::default(),
                },
            ])),
        ));
        // Contained: quantize(12)=16 → (34,34)-(166,166) fits inside.
        filter_outset(&mut world, inner, 12);
        schedule.run(&mut world);
        let bleeds = |warns: Vec<crate::diag::RuntimeWarning>| -> Vec<_> {
            warns
                .into_iter()
                .filter(|w| w.kind == "filterBleed")
                .collect()
        };
        assert!(
            bleeds(crate::diag::take_runtime_warnings()).is_empty(),
            "contained bleed does not warn"
        );

        // Escaped: quantize(60)=64 → (-14,-14)-(214,214), clipped on all sides.
        filter_outset(&mut world, inner, 60);
        schedule.run(&mut world);
        let warns = bleeds(crate::diag::take_runtime_warnings());
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].node, Some(2));
        assert_eq!(warns[0].value, "blur");
        for side in ["left", "top", "right", "bottom"] {
            assert!(warns[0].message.contains(side), "{}", warns[0].message);
        }

        // Steady state (same rect pair): no re-report.
        schedule.run(&mut world);
        assert!(
            bleeds(crate::diag::take_runtime_warnings()).is_empty(),
            "unchanged bleed is not re-reported"
        );
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
