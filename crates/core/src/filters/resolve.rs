//! The chain resolve system: turn each promoted root's wire [`FilterInput`]
//! into a packed [`ResolvedFilterChain`] against the registry, rewriting
//! `Length` slots to physical px and summing the chain outset.

use bevy::prelude::*;
use bevy::ui::ComputedNode;
use serde_json::Value;

use super::params::MAX_FILTER_OUTSET_PX;
use super::registry::{FilterRegistry, ResolvedFilterPass, stamp_and_push};
use super::wire::FilterChain;
use crate::layer::{LayerContentDirt, PromotedLayer};

/// The wire `filter` chain of a node, mirrored off the applied style by the
/// apply path (`crate::ui_map::apply_style_masked`'s FILTER arm) — present
/// iff the style carries a non-empty chain. The thin input side of the
/// [`resolve_chains`] system, mirroring the
/// `crate::transition::TransitionInput` pattern: the style apply owns writes,
/// the resolver only reads. The applied style may be a hover/press/focus-
/// merged one (the field is `overlay`), so an interaction flip re-stamps the
/// merged chain here.
#[derive(Component, Debug, Clone, Default, PartialEq)]
pub struct FilterInput(pub FilterChain);

/// Input side of one [`resolve_chains`] instance: which wire-chain component
/// feeds it, its diag kinds, and per-instance semantics. Implemented by
/// [`FilterInput`] (the content `filter` chain) and
/// [`BackdropInput`](crate::filters::BackdropInput) (`backdropFilter`).
pub trait ChainInput: Component {
    /// Diag kind reported for an unknown filter name.
    const KIND_UNKNOWN: &'static str;
    /// Diag kind reported for rejected params.
    const KIND_PARAMS: &'static str;
    /// Force `always_dirty` on every resolved chain. Backdrop chains set
    /// this: their source (the frame behind the node) is live, so the filter
    /// run must re-stage every frame regardless of `USES_TIME`.
    const FORCE_ALWAYS_DIRTY: bool;
    fn chain(&self) -> &FilterChain;
}

impl ChainInput for FilterInput {
    const KIND_UNKNOWN: &'static str = "filterUnknown";
    const KIND_PARAMS: &'static str = "filterParams";
    const FORCE_ALWAYS_DIRTY: bool = false;
    fn chain(&self) -> &FilterChain {
        &self.0
    }
}

/// Output side of one [`resolve_chains`] instance — a component wrapping (or
/// being) a [`ResolvedFilterChain`]. The newtype projection keeps every
/// downstream consumer (extract, transitions, animations, devtools) on the
/// one inner type.
pub trait ResolvedChain: Component<Mutability = bevy::ecs::component::Mutable> + Sized {
    fn from_inner(inner: ResolvedFilterChain) -> Self;
    fn inner(&self) -> &ResolvedFilterChain;
    fn inner_mut(&mut self) -> &mut ResolvedFilterChain;
}

impl ResolvedChain for ResolvedFilterChain {
    fn from_inner(inner: ResolvedFilterChain) -> Self {
        inner
    }
    fn inner(&self) -> &ResolvedFilterChain {
        self
    }
    fn inner_mut(&mut self) -> &mut ResolvedFilterChain {
        self
    }
}

/// A node's fully resolved `filter` chain, attached to promoted layer roots
/// by [`resolve_chains`]. Absent on a promoted root whose chain has no
/// valid entries (pure capture/composite — no filter machinery).
#[derive(Component, Debug, Clone, Default)]
pub struct ResolvedFilterChain {
    /// Wire-order, and contiguous per wire entry (a multi-pass filter like
    /// blur expands into ADJACENT passes sharing a `wire_index`) —
    /// `devtools`' chain display groups by adjacency, so a reordering
    /// optimization must preserve contiguity or fix that consumer.
    pub passes: Vec<ResolvedFilterPass>,
    /// Total chain outset in **physical** px — the raw per-entry
    /// `ceil(logical × scale)` sum. NOT quantized: [`quantize_outset`] is
    /// applied by the geometry sync when sizing the capture texture.
    pub outset_px: u32,
    /// True when any pass's filter `USES_TIME` — the layer must re-render
    /// every frame.
    pub always_dirty: bool,
    /// Bumped (wrapping — it is a pure change signal, only inequality
    /// matters) on every real change so downstream caches can detect it.
    /// Writer registry — exactly three systems bump this counter, and every
    /// one must use `wrapping_add(1)` so they share one overflow semantics:
    /// the resolver's snap ([`resolve_chains`]), the transition's
    /// whole-value filter-channel ease (`transition.rs`'s
    /// `drive_transitions`), and the animation stage-4 per-param re-assert
    /// (`animations`' `apply_filter_params`).
    pub version: u32,
    /// The scale factor the `Length` slots and `outset_px` were rewritten
    /// with — per-entity staleness tracking: a mismatch against the node's
    /// current scale forces a re-resolve without any `Changed` signal.
    pub scale: f32,
}

/// Quantize a physical-px outset up to the next multiple of 16 so an animated
/// radius grows a layer texture in coarse steps instead of reallocating every
/// frame.
pub fn quantize_outset(o: u32) -> u32 {
    o.div_ceil(16) * 16
}

/// Turn each promoted root's wire chain input `I` into a packed resolved
/// chain `R`. Two instances run in `Update` after the interaction restyle
/// (the last input writer this frame) and before the transition/animation
/// appliers — both write onto the resolved chain: the content instance
/// (`FilterInput` → `ResolvedFilterChain`, the `filter` style) and the
/// backdrop instance (`BackdropInput` → `ResolvedBackdropChain`, the
/// `backdropFilter` style — see `crate::filters::backdrop`).
///
/// Re-resolves when the input changed, the node was (re-)promoted, or the
/// node's scale factor no longer matches the one baked into the existing
/// chain. Per the plan's identity-fallback rule, an unknown filter name
/// ([`ChainInput::KIND_UNKNOWN`]) or rejected params
/// ([`ChainInput::KIND_PARAMS`]) warn into [`crate::diag`] under the node's
/// scope and skip that entry; a chain with no valid entries attaches no
/// resolved component at all (the node stays promoted — promotion reads the
/// wire chain).
///
/// Writes are compare-before-write: an identical re-resolve neither bumps
/// `version` nor produces dirt; a real change bumps it and pushes the root
/// into [`LayerContentDirt::composite_only`] (filter output changes never
/// dirty the capture — it holds unfiltered content, and a backdrop touches
/// only pixels behind the node).
#[allow(clippy::type_complexity)]
pub fn resolve_chains<I: ChainInput, R: ResolvedChain>(
    mut commands: Commands,
    registry: Res<FilterRegistry>,
    assets: Res<AssetServer>,
    mut dirt: ResMut<LayerContentDirt>,
    mut roots: Query<(
        Entity,
        &crate::bridge::RNode,
        Ref<I>,
        Ref<PromotedLayer>,
        Option<&mut R>,
        &ComputedNode,
    )>,
    mut unset: RemovedComponents<I>,
    stale: Query<(), With<R>>,
) {
    for (entity, rnode, input, promoted, existing, computed) in &mut roots {
        // Physical pixels per logical pixel, from this frame's layout output.
        let scale = computed.inverse_scale_factor().recip();
        let scale = if scale.is_finite() && scale > 0.0 {
            scale
        } else {
            1.0
        };
        // `Ref` flags, not query filters: the scale-mismatch arm must see
        // rows that carry NO change signal (a DPI change ticks nothing on
        // this entity), so "simplifying" this into
        // `Or<(Changed<FilterInput>, Added<PromotedLayer>)>` would kill it.
        let needs_resolve = input.is_changed()
            || promoted.is_added()
            || existing.as_ref().is_some_and(|c| c.inner().scale != scale);
        if !needs_resolve {
            continue;
        }
        // Attribute the validation warnings below to this node's inspector.
        let _diag = crate::diag::node_scope(rnode.0);

        let mut passes: Vec<ResolvedFilterPass> = Vec::new();
        let mut outset_px = 0u32;
        let mut always_dirty = I::FORCE_ALWAYS_DIRTY;
        for (index, fu) in input.chain().0.iter().enumerate() {
            let Some(reg) = registry.entries.get(fu.name.as_str()) else {
                crate::diag::report(
                    I::KIND_UNKNOWN,
                    &fu.name,
                    &format!("unknown filter {:?} — entry skipped", fu.name),
                );
                continue;
            };
            let params = Value::Object(fu.params.clone());
            // `resolve` and `outset` are separate baked fns by design (see
            // `FilterRegistration`); either rejecting skips the entry with
            // one params warning.
            let (resolved, outset) = match ((reg.resolve)(&params, &assets), (reg.outset)(&params))
            {
                (Ok(resolved), Ok(outset)) => (resolved, outset),
                (Err(msg), _) | (_, Err(msg)) => {
                    crate::diag::report(I::KIND_PARAMS, &params.to_string(), &msg);
                    continue;
                }
            };
            // The `as u32` cast saturates (NaN → 0, inf → MAX); the add +
            // clamp keep a pathological radius from overflowing the capture
            // inflation math downstream.
            outset_px = outset_px
                .saturating_add((outset.max(0.0) * scale).ceil() as u32)
                .min(MAX_FILTER_OUTSET_PX);
            always_dirty |= reg.uses_time;
            stamp_and_push(resolved, index, scale, &mut passes);
        }

        if passes.is_empty() {
            // All entries invalid (or an empty input): pure capture/composite.
            if existing.is_some() {
                commands.entity(entity).remove::<R>();
                dirt.composite_only.push(entity);
            }
            continue;
        }
        match existing {
            Some(mut resolved) => {
                let chain = resolved.inner_mut();
                if chain.passes == passes
                    && chain.outset_px == outset_px
                    && chain.always_dirty == always_dirty
                {
                    // Identical output — keep version + dirt quiet, but track
                    // the scale so a mismatch doesn't re-resolve every frame.
                    if chain.scale != scale {
                        chain.scale = scale;
                    }
                    continue;
                }
                *chain = ResolvedFilterChain {
                    passes,
                    outset_px,
                    always_dirty,
                    version: chain.version.wrapping_add(1),
                    scale,
                };
                dirt.composite_only.push(entity);
            }
            None => {
                commands
                    .entity(entity)
                    .insert(R::from_inner(ResolvedFilterChain {
                        passes,
                        outset_px,
                        always_dirty,
                        version: 1,
                        scale,
                    }));
                dirt.composite_only.push(entity);
            }
        }
    }

    // A style that dropped its chain (empty/unset filter) removes the input;
    // if the node is still promoted (another reason holds it), the resolved
    // chain would linger — clean it up here. (Demotion has its own cleanup in
    // `evaluate_layer_promotions`.) The `stale` gate is also load-bearing for
    // despawn safety: `RemovedComponents` yields despawned entities too, and
    // the contains-check keeps `commands.entity()` off them.
    for entity in unset.read() {
        if stale.contains(entity) {
            commands.entity(entity).remove::<R>();
            dirt.composite_only.push(entity);
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::super::test_util::{
        anim_app, create, create_kind, drain_dirt, entity_of, resolve_app, tick, update,
    };
    use super::*;
    use crate::protocol::Op;

    #[test]
    fn quantize_outset_rounds_up_to_16() {
        assert_eq!(quantize_outset(0), 0);
        assert_eq!(quantize_outset(1), 16);
        assert_eq!(quantize_outset(16), 16);
        assert_eq!(quantize_outset(17), 32);
    }

    /// A filtered create resolves into a [`ResolvedFilterChain`] on the
    /// promoted root: version 1, the documented packing, a real shader, no
    /// outset, not time-driven.
    #[test]
    fn filtered_create_attaches_resolved_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e).is_some(), "promoted");
        let chain = app
            .world()
            .get::<ResolvedFilterChain>(e)
            .expect("chain resolved");
        assert_eq!(chain.version, 1);
        assert_eq!(chain.passes.len(), 1);
        // Bare `{name:"grayscale"}` = full effect: amount 1.0 at params[0].w.
        assert_eq!(chain.passes[0].params[0].w, 1.0);
        assert_ne!(chain.passes[0].shader, Handle::default());
        assert_eq!(chain.passes[0].wire_index, 0);
        assert_eq!(chain.outset_px, 0);
        assert!(!chain.always_dirty);
        assert_eq!(chain.scale, 1.0);
    }

    /// A param delta re-resolves: version bump, new packed value, and the
    /// root lands in `LayerContentDirt.composite_only` — never `nodes` (the
    /// capture holds unfiltered content).
    #[test]
    fn param_update_bumps_version_and_dirties_composite_only() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 0.5 } } } }),
                &[],
            )])
            .unwrap();
        app.update();
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.version, 2);
        assert_eq!(chain.passes[0].params[0].w, 0.5);
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "{dirt:?}");
    }

    /// Re-sending the identical style is version-stable and produces no dirt
    /// (compare-before-write).
    #[test]
    fn identical_resend_is_version_stable_and_clean() {
        let (mut app, ops_tx) = resolve_app();
        let style = json!({ "style": { "filter": { "name": "grayscale" } } });
        ops_tx.send(vec![create(1, style.clone())]).unwrap();
        app.update();
        let e = entity_of(&app, 1);
        drain_dirt(&mut app);

        ops_tx.send(vec![update(1, style, &[])]).unwrap();
        app.update();
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.version, 1, "identical re-send must not bump");
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.is_empty(), "{dirt:?}");
        assert!(dirt.nodes.is_empty(), "{dirt:?}");
    }

    /// An unknown filter name in a chain warns (`filterUnknown`, attributed to
    /// the node) and is skipped — the rest of the chain still resolves.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn unknown_filter_entry_skips_and_warns() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                7,
                json!({ "style": { "filter": [{ "name": "nope" }, { "name": "sepia" }] } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 7);
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.passes.len(), 1, "only sepia's pass survives");
        // Sepia's slot is params[1].x; its chain position is 1.
        assert_eq!(chain.passes[0].params[1].x, 1.0);
        assert_eq!(chain.passes[0].wire_index, 1);

        let warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(7))
            .collect();
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].kind, "filterUnknown");
        assert_eq!(warns[0].value, "nope");
    }

    /// Bad params (a non-px blur radius) warn (`filterParams`) and skip the
    /// entry; a chain with no valid entries attaches no chain at all — but the
    /// node stays promoted.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn bad_params_entry_skips_and_warns() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                8,
                json!({ "style": { "filter": { "name": "blur", "params": { "radius": "50%" } } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 8);
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "stays promoted (promotion reads the wire chain)"
        );
        assert!(
            app.world().get::<ResolvedFilterChain>(e).is_none(),
            "all entries invalid → no filter machinery"
        );

        let warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(8))
            .collect();
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].kind, "filterParams");
        assert!(warns[0].message.contains("px"), "{}", warns[0].message);
    }

    /// A blur chain resolves to two passes sharing `wire_index` 0; a scale
    /// factor ≠ 1 (set on the node's `ComputedNode`) rewrites the packed
    /// `Length` slots and the outset to physical px and re-resolves on change.
    #[test]
    fn blur_chain_rewrites_length_slots_by_scale_factor() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": [
                        { "name": "blur", "params": { "radius": 4 } },
                        { "name": "grayscale" }
                    ]
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
            assert_eq!(chain.passes.len(), 3, "blur H + blur V + grayscale");
            let wire: Vec<u8> = chain.passes.iter().map(|p| p.wire_index).collect();
            assert_eq!(wire, [0, 0, 1]);
            assert_eq!(chain.passes[0].params[0].x, 4.0, "radius at scale 1");
            assert_eq!(chain.passes[1].params[0].x, 4.0);
            assert_eq!(chain.outset_px, 12, "3 radii, physical px");
        }

        // A scale-factor change (per-entity, via `ComputedNode`) forces a
        // re-resolve even with no style delta: Length slots and the outset
        // are physical now.
        app.world_mut()
            .get_mut::<ComputedNode>(e)
            .expect("computed node")
            .inverse_scale_factor = 0.5;
        drain_dirt(&mut app);
        app.update();
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.scale, 2.0);
        assert_eq!(chain.version, 2);
        assert_eq!(chain.passes[0].params[0].x, 8.0, "radius rewritten");
        assert_eq!(chain.passes[1].params[0].x, 8.0);
        // Direction components are not Length slots — untouched.
        assert_eq!(chain.passes[0].params[0].y, 1.0);
        assert_eq!(chain.passes[1].params[0].z, 1.0);
        // Grayscale has no Length slot — untouched.
        assert_eq!(chain.passes[2].params[0].w, 1.0);
        assert_eq!(chain.outset_px, 24, "logical 12 × scale 2");
        assert!(
            app.world()
                .resource::<LayerContentDirt>()
                .composite_only
                .contains(&e)
        );
    }

    /// A >2-pass wire entry (bloom's four) rewrites its `Length` slot in
    /// EVERY pass on a scale change, leaving the pass-internal components
    /// (mode/direction) and the scalar slots untouched.
    #[test]
    fn bloom_chain_rewrites_length_slots_in_all_four_passes() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "bloom", "params": {
                        "radius": 4, "threshold": 0.5, "intensity": 2
                    } }
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
            assert_eq!(chain.passes.len(), 4, "bright + blur H + blur V + combine");
            let wire: Vec<u8> = chain.passes.iter().map(|p| p.wire_index).collect();
            assert_eq!(wire, [0, 0, 0, 0]);
            assert_eq!(chain.outset_px, 12, "3 radii, physical px");
        }

        app.world_mut()
            .get_mut::<ComputedNode>(e)
            .expect("computed node")
            .inverse_scale_factor = 0.5;
        drain_dirt(&mut app);
        app.update();
        let chain = app.world().get::<ResolvedFilterChain>(e).expect("chain");
        assert_eq!(chain.scale, 2.0);
        for pass in &chain.passes {
            assert_eq!(pass.params[0].x, 8.0, "radius rewritten in every pass");
            // Scalar slots are not Length slots — untouched.
            assert_eq!(pass.params[1].x, 0.5);
            assert_eq!(pass.params[1].y, 2.0);
        }
        // Pass-internal components (blur direction, bloom mode) — untouched.
        assert_eq!(chain.passes[1].params[0].y, 1.0);
        assert_eq!(chain.passes[2].params[0].z, 1.0);
        assert_eq!(chain.passes[0].params[0].w, 0.0, "bright mode");
        assert_eq!(chain.passes[3].params[0].w, 1.0, "combine mode");
        assert_eq!(chain.outset_px, 24, "logical 12 × scale 2");
    }

    /// Unsetting the filter style demotes the node AND removes the resolved
    /// chain (the demote arm's cleanup).
    #[test]
    fn unset_filter_demotes_and_removes_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<ResolvedFilterChain>(e).is_some());

        ops_tx
            .send(vec![update(1, json!({}), &["filter"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(
            app.world().get::<ResolvedFilterChain>(e).is_none(),
            "chain removed on demote"
        );
        assert!(
            app.world().get::<FilterInput>(e).is_none(),
            "input mirrors the (now unset) style"
        );
    }

    /// A filter on a node that still has `opacity` keeps it promoted when the
    /// filter unsets — the stale resolved chain must still be cleaned up.
    #[test]
    fn unset_filter_on_still_promoted_node_removes_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![
                create(
                    1,
                    json!({ "style": { "filter": { "name": "grayscale" }, "opacity": 0.5 } }),
                ),
                create(2, json!({})),
                Op::Append {
                    parent: 1,
                    child: 2,
                },
            ])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<ResolvedFilterChain>(e).is_some());

        ops_tx
            .send(vec![update(1, json!({}), &["filter"])])
            .unwrap();
        app.update();
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "opacity keeps it promoted"
        );
        assert!(
            app.world().get::<ResolvedFilterChain>(e).is_none(),
            "stale chain cleaned up"
        );
    }

    /// Op-driven negative: a `<text>` element created WITH a filter style is
    /// seeded/evaluated but ineligible — never promoted, never resolved.
    #[test]
    fn filtered_text_element_stays_unpromoted_and_unresolved() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create_kind(
                1,
                "text",
                json!({ "style": { "filter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "ineligible");
        assert!(app.world().get::<ResolvedFilterChain>(e).is_none());
    }

    // -- per-param filter bindings (full pipeline) ---------------------------

    /// A `filter[0].radius` binding drives blur through the real pipeline:
    /// the shared value lands (× scale 1) in BOTH expanded blur passes, each
    /// change is one version bump + composite-only dirt (the capture is
    /// never re-dirtied), and a settled value is version-quiet.
    #[test]
    fn filter_param_binding_follows_shared_value_through_pipeline() {
        let (mut app, ops_tx, anim_tx) = anim_app();
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 4.0 })
            .unwrap();
        ops_tx
            .send(vec![create(
                1,
                json!({
                    "style": { "filter": { "name": "blur", "params": { "radius": 10 } } },
                    "animated": { "filter[0].radius": { "type": "shared", "id": 1 } },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert_eq!(chain.passes.len(), 2, "blur expands to H+V");
            assert_eq!(chain.passes[0].params[0].x, 4.0, "H radius driven");
            assert_eq!(chain.passes[1].params[0].x, 4.0, "V radius driven");
            assert_eq!(chain.version, 2, "resolve (1) + binding write (2)");
        }

        // A value change: one bump, composite-only dirt, both passes.
        drain_dirt(&mut app);
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 6.0 })
            .unwrap();
        tick(&mut app, 0.016);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert_eq!(chain.passes[0].params[0].x, 6.0);
            assert_eq!(chain.passes[1].params[0].x, 6.0);
            assert_eq!(chain.version, 3);
        }
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "never capture dirt: {dirt:?}");

        // Settled: quiet.
        drain_dirt(&mut app);
        tick(&mut app, 0.016);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().version,
            3
        );
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(!dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "{dirt:?}");
    }

    /// The scar test: a filter style delta mid-animation rebuilds the chain
    /// (the resolver snaps the params to the new static style) — the binding
    /// re-asserts the driven value the same frame (`AnimationSet::Apply` runs
    /// after [`resolve_chains`]), so the driven param never shows the
    /// static value on screen.
    #[test]
    fn filter_param_binding_reasserts_after_chain_rebuild() {
        let (mut app, ops_tx, anim_tx) = anim_app();
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 4.0 })
            .unwrap();
        ops_tx
            .send(vec![create(
                1,
                json!({
                    "style": { "filter": { "name": "blur", "params": { "radius": 10 } } },
                    "animated": { "filter[0].radius": { "type": "shared", "id": 1 } },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let v0 = app.world().get::<ResolvedFilterChain>(e).unwrap().version;

        // The delta rebuilds the chain (radius 12, and a real outset change
        // so the resolver's compare-before-write sees a difference even
        // against the driven params) …
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "blur", "params": { "radius": 12 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
        // … and the binding re-asserted on top of the resolver's snap.
        assert_eq!(chain.passes[0].params[0].x, 4.0, "H re-asserted");
        assert_eq!(chain.passes[1].params[0].x, 4.0, "V re-asserted");
        assert_eq!(
            chain.outset_px, 36,
            "the rebuild itself landed (3 × radius 12)"
        );
        assert!(chain.version > v0, "resolver + binding both bumped");
    }
}
