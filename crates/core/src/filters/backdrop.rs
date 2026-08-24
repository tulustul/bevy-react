//! The `backdropFilter` chain components — the backdrop instance of
//! [`resolve_chains`](super::resolve_chains).
//!
//! `backdropFilter` shares everything with the content `filter` style except
//! its source: the chain filters what is rendered *behind* the node (v1: the
//! camera's post-processed 3D frame), and the result composites as an opaque
//! quad under the node's own content. Wire format, registry validation,
//! param packing, and interpolation are all the shared `filters` machinery;
//! this module only names the second channel's component pair and its
//! resolver instance parameters.
//!
//! One deliberate semantic difference: resolved backdrop chains are ALWAYS
//! `always_dirty` ([`ChainInput::FORCE_ALWAYS_DIRTY`]). The backdrop source
//! is the live frame — the snapshot re-blits and the chain re-runs every
//! frame, so caching a backdrop filter output is never valid.

use bevy::prelude::*;

use super::resolve::{ChainInput, ResolvedChain, ResolvedFilterChain};
use super::wire::FilterChain;

/// The wire `backdropFilter` chain of a node, mirrored off the applied style
/// by `crate::ui_map::apply_style_masked`'s BACKDROP arm — present iff the
/// style carries a non-empty chain. Same contract as
/// [`FilterInput`](super::FilterInput): the style apply owns writes (the
/// applied style may be hover/press/focus-merged), the resolver only reads.
#[derive(Component, Debug, Clone, Default, PartialEq)]
pub struct BackdropInput(pub FilterChain);

impl ChainInput for BackdropInput {
    const KIND_UNKNOWN: &'static str = "backdropFilterUnknown";
    const KIND_PARAMS: &'static str = "backdropFilterParams";
    const FORCE_ALWAYS_DIRTY: bool = true;
    fn chain(&self) -> &FilterChain {
        &self.0
    }
    fn validate_entry(
        name: &str,
        is_morph: bool,
        _passes: &[super::ResolvedFilterPass],
    ) -> Result<(), String> {
        if is_morph {
            return Err(format!(
                "morph filter {name:?} cannot be used in a `backdropFilter` chain — it is a \
                 `morphFilter` name"
            ));
        }
        Ok(())
    }
}

/// A node's fully resolved `backdropFilter` chain — a newtype over
/// [`ResolvedFilterChain`] so extract, transitions, animations, and devtools
/// reuse the inner type via `.0`. Attached to promoted roots by the backdrop
/// [`resolve_chains`](super::resolve_chains) instance; absent when the chain
/// has no valid entries. Removed on demotion by
/// `evaluate_layer_promotions`'s cleanup (like the content chain).
#[derive(Component, Debug, Clone, Default)]
pub struct ResolvedBackdropChain(pub ResolvedFilterChain);

impl ResolvedChain for ResolvedBackdropChain {
    fn from_inner(inner: ResolvedFilterChain) -> Self {
        Self(inner)
    }
    fn inner(&self) -> &ResolvedFilterChain {
        &self.0
    }
    fn inner_mut(&mut self) -> &mut ResolvedFilterChain {
        &mut self.0
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::super::test_util::{
        anim_app, create, drain_dirt, ease_app, entity_of, resolve_app, tick, update,
    };
    use super::*;
    use crate::layer::{LayerContentDirt, PromotedLayer};

    /// The family split: a MORPH filter named in a `backdropFilter` chain
    /// warns (`backdropFilterParams`) and is skipped — with no other entry,
    /// no chain attaches (the node stays promoted).
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn morph_filter_in_backdrop_chain_warns_and_skips() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                11,
                json!({ "style": { "backdropFilter": { "name": "crossfade" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 11);
        assert!(app.world().get::<PromotedLayer>(e).is_some(), "promoted");
        assert!(
            app.world().get::<ResolvedBackdropChain>(e).is_none(),
            "morph entry skipped, no chain"
        );

        let warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(11))
            .collect();
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].kind, "backdropFilterParams");
        assert!(
            warns[0].message.contains("`morphFilter` name"),
            "{}",
            warns[0].message
        );
    }

    /// A `backdropFilter` create resolves into a [`ResolvedBackdropChain`] on
    /// the promoted root — and the chain is `always_dirty` even for a filter
    /// with no `USES_TIME` (the forced backdrop semantics: the source frame
    /// is live). The content-chain component stays absent — independent
    /// channels.
    #[test]
    fn backdrop_create_attaches_forced_always_dirty_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "backdropFilter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e).is_some(), "promoted");
        assert!(
            app.world().get::<BackdropInput>(e).is_some(),
            "input stamped"
        );
        let chain = app
            .world()
            .get::<ResolvedBackdropChain>(e)
            .expect("backdrop chain resolved");
        assert_eq!(chain.0.version, 1);
        assert_eq!(chain.0.passes.len(), 1);
        assert_eq!(chain.0.passes[0].params[0].w, 1.0, "full grayscale");
        assert!(chain.0.always_dirty, "backdrop chains are forced live");
        assert!(
            app.world()
                .get::<super::super::ResolvedFilterChain>(e)
                .is_none(),
            "content channel untouched"
        );
    }

    /// A backdrop param delta bumps the version and lands in
    /// `composite_only` — never `nodes`: a backdrop delta must not dirty the
    /// subtree capture (it only touches pixels behind the node).
    #[test]
    fn backdrop_param_update_is_composite_only() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "backdropFilter": { "name": "grayscale" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "backdropFilter": {
                    "name": "grayscale", "params": { "amount": 0.5 }
                } } }),
                &[],
            )])
            .unwrap();
        app.update();
        let chain = app.world().get::<ResolvedBackdropChain>(e).expect("chain");
        assert_eq!(chain.0.version, 2);
        assert_eq!(chain.0.passes[0].params[0].w, 0.5);
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "{dirt:?}");
    }

    /// Backdrop validation failures warn under the backdrop-specific kinds
    /// (`backdropFilterUnknown`/`backdropFilterParams`), attributed to the
    /// node — devtools routes them at the `backdropFilter` style row.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn backdrop_validation_warns_with_backdrop_kinds() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                7,
                json!({ "style": { "backdropFilter": [
                    { "name": "nope" },
                    { "name": "blur", "params": { "radius": "50%" } },
                    { "name": "sepia" }
                ] } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 7);
        let chain = app.world().get::<ResolvedBackdropChain>(e).expect("chain");
        assert_eq!(chain.0.passes.len(), 1, "only sepia survives");

        let mut kinds: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(7))
            .map(|w| w.kind)
            .collect();
        kinds.sort();
        assert_eq!(kinds, ["backdropFilterParams", "backdropFilterUnknown"]);
    }

    /// Unsetting `backdropFilter` on a node held promoted by another reason
    /// removes the resolved chain (the `RemovedComponents` cleanup path);
    /// full demotion removes it too (the evaluator's cleanup).
    #[test]
    fn unset_removes_chain_while_promoted_and_on_demote() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "cache": "always",
                    "backdropFilter": { "name": "grayscale" }
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<ResolvedBackdropChain>(e).is_some());

        ops_tx
            .send(vec![update(1, json!({}), &["backdropFilter"])])
            .unwrap();
        app.update();
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "cache: always still holds the layer"
        );
        assert!(app.world().get::<BackdropInput>(e).is_none(), "input gone");
        assert!(
            app.world().get::<ResolvedBackdropChain>(e).is_none(),
            "chain cleaned up while still promoted"
        );

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "backdropFilter": { "name": "sepia" } } }),
                &["cache"],
            )])
            .unwrap();
        app.update();
        assert!(app.world().get::<ResolvedBackdropChain>(e).is_some());
        ops_tx
            .send(vec![update(1, json!({}), &["backdropFilter"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(
            app.world().get::<ResolvedBackdropChain>(e).is_none(),
            "demote removes the resolved chain"
        );
    }

    /// `transition: { backdropFilter }` eases the backdrop chain's packed
    /// params (composite-only dirt each easing frame) and settles bit-exact
    /// on the resolver's own output — the second channel runs the same
    /// whole-value machinery as `filter`.
    #[test]
    fn backdrop_transition_eases_and_settles_exactly() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "backdropFilter": { "name": "grayscale", "params": { "amount": 0.0 } },
                    "transition": { "backdropFilter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert_eq!(
            app.world()
                .get::<ResolvedBackdropChain>(e)
                .unwrap()
                .0
                .passes[0]
                .params[0]
                .w,
            0.0,
            "mount snaps, no fade-in"
        );
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "backdropFilter": {
                    "name": "grayscale", "params": { "amount": 1.0 }
                } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.5);
        {
            let chain = &app.world().get::<ResolvedBackdropChain>(e).unwrap().0;
            let w = chain.passes[0].params[0].w;
            assert!(w > 0.0 && w < 1.0, "mid-ease: {w}");
            assert!(chain.always_dirty, "forced-live survives the ease write");
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "{dirt:?}");
        }

        tick(&mut app, 0.6);
        let settled_version = {
            let world = app.world();
            let chain = &world.get::<ResolvedBackdropChain>(e).unwrap().0;
            let expected =
                (world.resource::<crate::filters::FilterRegistry>().entries["grayscale"].resolve)(
                    &json!({ "amount": 1.0 }),
                    world.resource::<bevy::asset::AssetServer>(),
                )
                .unwrap();
            assert_eq!(chain.passes, expected, "settles on the resolver's output");
            chain.version
        };
        drain_dirt(&mut app);
        tick(&mut app, 0.25);
        assert_eq!(
            app.world()
                .get::<ResolvedBackdropChain>(e)
                .unwrap()
                .0
                .version,
            settled_version,
            "settled: no more churn"
        );
    }

    /// The two chains are independent transition channels: easing one leaves
    /// the other's params and version untouched.
    #[test]
    fn filter_and_backdrop_channels_ease_independently() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "grayscale", "params": { "amount": 0.0 } },
                    "backdropFilter": { "name": "sepia", "params": { "amount": 0.0 } },
                    "transition": {
                        "filter": { "duration": 1000, "easing": "linear" },
                        "backdropFilter": { "duration": 1000, "easing": "linear" },
                    },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        drain_dirt(&mut app);

        // Retarget ONLY the backdrop chain.
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "backdropFilter": {
                    "name": "sepia", "params": { "amount": 1.0 }
                } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.5);
        let backdrop = &app.world().get::<ResolvedBackdropChain>(e).unwrap().0;
        let w = backdrop.passes[0].params[1].x;
        assert!(w > 0.0 && w < 1.0, "backdrop mid-ease: {w}");
        let content = app
            .world()
            .get::<crate::filters::ResolvedFilterChain>(e)
            .unwrap();
        assert_eq!(content.passes[0].params[0].w, 0.0, "content untouched");
        assert_eq!(content.version, 1, "content version quiet");
    }

    /// Easing TOWARD an unset `backdropFilter` snaps (the documented
    /// empty-chain rule): unsetting demotes and removes the resolved chain
    /// the same frame — no lingering eased writes on later frames.
    #[test]
    fn backdrop_transition_to_unset_snaps() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "backdropFilter": { "name": "grayscale" },
                    "transition": { "backdropFilter": { "duration": 1000 } },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        ops_tx
            .send(vec![update(1, json!({}), &["backdropFilter"])])
            .unwrap();
        tick(&mut app, 0.1);
        assert!(
            app.world().get::<ResolvedBackdropChain>(e).is_none(),
            "unset demotes + removes — snap, no ease"
        );
        tick(&mut app, 0.1);
        assert!(app.world().get::<ResolvedBackdropChain>(e).is_none());
    }

    /// Inline `{ animated }` backdrop-param bindings drive the
    /// backdrop chain through the whole ops → resolve → apply pipeline
    /// (blur's H+V passes both driven, physical-px rewrite, composite-only
    /// dirt), while the CONTENT chain — same node, same param name — stays
    /// untouched: the two binding namespaces are independent.
    #[test]
    fn backdrop_param_binding_follows_shared_value_through_pipeline() {
        let (mut app, ops_tx, anim_tx) = anim_app();
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 4.0 })
            .unwrap();
        ops_tx
            .send(vec![create(
                1,
                json!({
                    "style": {
                        "filter": { "name": "blur", "params": { "radius": 10 } },
                        "backdropFilter": { "name": "blur",
                            "params": { "radius": { "animated": { "id": 1 } } } },
                    },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        {
            let chain = &app.world().get::<ResolvedBackdropChain>(e).unwrap().0;
            assert_eq!(chain.passes.len(), 2, "blur expands to H+V");
            assert_eq!(chain.passes[0].params[0].x, 4.0, "H radius driven");
            assert_eq!(chain.passes[1].params[0].x, 4.0, "V radius driven");
            let content = app
                .world()
                .get::<crate::filters::ResolvedFilterChain>(e)
                .unwrap();
            assert_eq!(
                content.passes[0].params[0].x, 10.0,
                "content chain keeps its static radius"
            );
        }

        drain_dirt(&mut app);
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 6.0 })
            .unwrap();
        tick(&mut app, 0.016);
        {
            let chain = &app.world().get::<ResolvedBackdropChain>(e).unwrap().0;
            assert_eq!(chain.passes[0].params[0].x, 6.0);
            assert_eq!(chain.passes[1].params[0].x, 6.0);
        }
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "never capture dirt: {dirt:?}");
    }
}
