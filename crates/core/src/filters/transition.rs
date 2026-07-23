//! Whole-value `filter` transitions: how a `transition: { filter }` retarget
//! interpolates between two wire chains — strategy classification, identity
//! padding for chain extensions, and the per-frame sampling ([`FilterEase`])
//! consumed by the transition engine's filter channel
//! (`crate::transition::drive_transitions`).

use bevy::prelude::*;

use super::params::lerp_packed_params;
use super::registry::{FilterRegistry, ResolvedFilterPass, stamp_and_push};
use super::wire::{FilterChain, FilterUse};

/// How a `transition: { filter }` interpolates between two wire chains,
/// decided by [`classify_filter_transition`] when the transition engine
/// retargets:
///
/// - `Matched` — same names, same order, same length: the resolved pass lists
///   align position-wise and packed params lerp pairwise per frame.
/// - `Extended` — the chains differ in length, the shorter's names are a
///   prefix of the longer's, and every entry of both chains has identity
///   params ([`ReactFilter::identity_params`](crate::filters::ReactFilter::identity_params)):
///   the shorter side is padded at the END (CSS pads at the end) with
///   identity passes of the longer's trailing entries, then lerped pairwise —
///   so hover-adds-blur *fades in* from radius `0` instead of popping.
/// - `Discrete` — anything else (mismatched names, a custom filter without an
///   identity): the chain swaps wholesale at eased progress `0.5`, CSS's
///   discrete interpolation.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum FilterStrategy {
    Matched,
    Extended,
    Discrete,
}

/// Classify how a filter transition from wire chain `from` to `to` should
/// interpolate. `registry: None` (an asset-free test world) disables the
/// identity lookup, degrading `Extended` candidates to `Discrete`.
pub(crate) fn classify_filter_transition(
    from: &FilterChain,
    to: &FilterChain,
    registry: Option<&FilterRegistry>,
) -> FilterStrategy {
    if from.0.len() == to.0.len() && from.0.iter().zip(&to.0).all(|(a, b)| a.name == b.name) {
        return FilterStrategy::Matched;
    }
    let (short, long) = if from.0.len() <= to.0.len() {
        (from, to)
    } else {
        (to, from)
    };
    let prefix = short.0.iter().zip(&long.0).all(|(s, l)| s.name == l.name);
    let has_identity = |chain: &FilterChain| {
        chain.0.iter().all(|fu| {
            registry.is_some_and(|r| {
                r.entries
                    .get(fu.name.as_str())
                    .is_some_and(|e| (e.identity)().is_some())
            })
        })
    };
    if prefix && has_identity(from) && has_identity(to) {
        FilterStrategy::Extended
    } else {
        FilterStrategy::Discrete
    }
}

/// The prepared interpolation of one armed filter transition, built by
/// [`plan_filter_ease`] at retarget time and sampled by the transition
/// engine's filter channel each frame.
#[derive(Debug, Clone)]
pub(crate) enum FilterEase {
    /// Position-wise aligned pass lists (`Matched`, or `Extended` after
    /// identity padding): each frame lerps packed params pairwise. `settle`
    /// is the resolver's own **unpadded** target output — the completion
    /// write must equal it bit-exactly so the two writers agree and stop
    /// churning.
    Aligned {
        start: Vec<ResolvedFilterPass>,
        target: Vec<ResolvedFilterPass>,
        settle: Vec<ResolvedFilterPass>,
    },
    /// Wholesale swap at eased progress `0.5`.
    Discrete {
        start: Vec<ResolvedFilterPass>,
        target: Vec<ResolvedFilterPass>,
    },
}

impl FilterEase {
    /// The pass list at eased progress `p`.
    pub(crate) fn sample(&self, p: f32) -> Vec<ResolvedFilterPass> {
        match self {
            Self::Aligned { start, target, .. } => start
                .iter()
                .zip(target)
                .map(|(s, t)| {
                    // Target metadata (shader / layout / wire_index) with
                    // lerped params — an aligned pair shares them by
                    // construction.
                    let mut pass = t.clone();
                    pass.params = lerp_packed_params(&s.params, &t.params, p, &t.layout);
                    pass
                })
                .collect(),
            Self::Discrete { start, target } => {
                if p < 0.5 {
                    start.clone()
                } else {
                    target.clone()
                }
            }
        }
    }

    /// The completion value: the resolver's own output for the target wire
    /// chain, bit-exact — never a padded list.
    pub(crate) fn settle(&self) -> &[ResolvedFilterPass] {
        match self {
            Self::Aligned { settle, .. } => settle,
            Self::Discrete { target, .. } => target,
        }
    }
}

/// Plan the interpolation for a filter retarget: classify the wire chains,
/// pad for `Extended`, and defensively fall back to a discrete swap whenever
/// the pass lists don't align (a custom resolver may emit differing pass
/// structures even for matching names, and identity resolution can fail).
///
/// `start` is the transition state's own current pass list — the engine owns
/// its current value, since
/// [`resolve_filter_chains`](crate::filters::resolve_filter_chains) already
/// snapped the component to the target this frame — and `target` is that
/// freshly snapped resolver output. `scale` is the resolved chain's
/// physical-px factor, applied to padding passes exactly like the resolver's
/// own rewrite.
pub(crate) fn plan_filter_ease(
    from_wire: &FilterChain,
    to_wire: &FilterChain,
    start: Vec<ResolvedFilterPass>,
    target: Vec<ResolvedFilterPass>,
    registry: Option<&FilterRegistry>,
    assets: Option<&AssetServer>,
    scale: f32,
) -> FilterEase {
    match classify_filter_transition(from_wire, to_wire, registry) {
        FilterStrategy::Discrete => FilterEase::Discrete { start, target },
        FilterStrategy::Matched => aligned_or_discrete(start, target.clone(), target),
        FilterStrategy::Extended => {
            // `Extended` is only classified with a registry in hand; the
            // assets are needed to resolve the padding's shader handles.
            let (Some(registry), Some(assets)) = (registry, assets) else {
                return FilterEase::Discrete { start, target };
            };
            // The longer chain's trailing entries resolve at their identity
            // params, padding the shorter side at the END (CSS pads at the
            // end).
            let growing = from_wire.0.len() < to_wire.0.len();
            let (short, long) = if growing {
                (from_wire, to_wire)
            } else {
                (to_wire, from_wire)
            };
            let pad = identity_passes(
                &long.0[short.0.len()..],
                short.0.len(),
                registry,
                assets,
                scale,
            );
            match pad {
                Some(pad) if growing => {
                    // Growing: the START side pads — added filters fade IN.
                    let mut start = start;
                    start.extend(pad);
                    aligned_or_discrete(start, target.clone(), target)
                }
                Some(pad) => {
                    // Shrinking: the TARGET side pads — removed trailing
                    // filters fade OUT to identity; completion snaps to the
                    // unpadded resolver output.
                    let mut padded = target.clone();
                    padded.extend(pad);
                    aligned_or_discrete(start, padded, target)
                }
                None => FilterEase::Discrete { start, target },
            }
        }
    }
}

/// `Aligned` when the pass lists actually align pairwise (same length, same
/// per-index shader, layout, and param count — [`lerp_packed_params`]'s
/// contract, plus the shader so a mid-ease frame never renders lerped params
/// through the wrong pass), else a discrete swap onto the unpadded `settle`
/// value.
fn aligned_or_discrete(
    start: Vec<ResolvedFilterPass>,
    target: Vec<ResolvedFilterPass>,
    settle: Vec<ResolvedFilterPass>,
) -> FilterEase {
    let compatible = start.len() == target.len()
        && start.iter().zip(&target).all(|(s, t)| {
            s.params.len() == t.params.len() && s.layout == t.layout && s.shader == t.shader
        });
    if compatible {
        FilterEase::Aligned {
            start,
            target,
            settle,
        }
    } else {
        FilterEase::Discrete {
            start,
            target: settle,
        }
    }
}

/// Resolve the identity passes that pad a chain extension: one identity
/// invocation per entry of `entries` (the longer chain's trailing
/// [`FilterUse`]s), through the registry's normal resolve path — packing,
/// layout, and shader handles come for free — with `wire_index` continuing at
/// `offset` and `Length` slots rewritten to physical px like the resolver's
/// own passes (both via [`stamp_and_push`]). `None` when any entry lacks an
/// identity or fails to resolve (the caller falls back to a discrete swap).
fn identity_passes(
    entries: &[FilterUse],
    offset: usize,
    registry: &FilterRegistry,
    assets: &AssetServer,
    scale: f32,
) -> Option<Vec<ResolvedFilterPass>> {
    let mut out = Vec::new();
    for (i, fu) in entries.iter().enumerate() {
        let reg = registry.entries.get(fu.name.as_str())?;
        let identity = (reg.identity)()?;
        let passes = (reg.resolve)(&identity, assets).ok()?;
        stamp_and_push(passes, offset + i, scale, &mut out);
    }
    Some(out)
}

#[cfg(test)]
mod tests {
    use serde_json::{Map, json};

    use super::super::test_util::{
        asset_app, builtin_registry, create, drain_dirt, ease_app, entity_of, tick, update,
    };
    use super::*;
    use crate::filters::{BlurParams, ReactFilter, ResolvedFilterChain};
    use crate::layer::{LayerContentDirt, PromotedLayer};
    use crate::protocol::Op;

    fn wire(names: &[&str]) -> FilterChain {
        FilterChain(
            names
                .iter()
                .map(|n| FilterUse {
                    name: (*n).into(),
                    params: Map::new(),
                })
                .collect(),
        )
    }

    /// Same names, same order, same length → `Matched`, regardless of params
    /// and of whether the names are registered.
    #[test]
    fn classify_same_names_is_matched() {
        use FilterStrategy::Matched;
        let r = builtin_registry();
        assert_eq!(
            classify_filter_transition(
                &wire(&["blur", "sepia"]),
                &wire(&["blur", "sepia"]),
                Some(&r)
            ),
            Matched
        );
        // A custom (even unregistered) name still matches itself.
        assert_eq!(
            classify_filter_transition(&wire(&["glow"]), &wire(&["glow"]), Some(&r)),
            Matched
        );
    }

    /// Any mismatch involving a filter without an identity (customs, unknown
    /// names), a non-prefix pair, or a missing registry → `Discrete`.
    #[test]
    fn classify_mismatch_without_identity_is_discrete() {
        use FilterStrategy::Discrete;
        let r = builtin_registry();
        // "glow" has no identity (not registered) → no extension.
        assert_eq!(
            classify_filter_transition(&wire(&[]), &wire(&["glow"]), Some(&r)),
            Discrete
        );
        assert_eq!(
            classify_filter_transition(&wire(&["glow"]), &wire(&["glow", "blur"]), Some(&r)),
            Discrete
        );
        // Same length, different names: neither matched nor an extension.
        assert_eq!(
            classify_filter_transition(&wire(&["sepia"]), &wire(&["blur"]), Some(&r)),
            Discrete
        );
        // Built-ins but NOT a prefix: position-wise alignment is impossible.
        assert_eq!(
            classify_filter_transition(&wire(&["sepia"]), &wire(&["blur", "sepia"]), Some(&r)),
            Discrete
        );
        // No registry in hand (asset-free world): extension unavailable.
        assert_eq!(
            classify_filter_transition(&wire(&[]), &wire(&["blur"]), None),
            Discrete
        );
    }

    /// Unequal-length built-in-only prefix pairs → `Extended`, both growing
    /// and shrinking.
    #[test]
    fn classify_builtin_prefix_extension_is_extended() {
        use FilterStrategy::Extended;
        let r = builtin_registry();
        assert_eq!(
            classify_filter_transition(&wire(&[]), &wire(&["blur"]), Some(&r)),
            Extended
        );
        assert_eq!(
            classify_filter_transition(&wire(&["blur"]), &wire(&["blur", "sepia"]), Some(&r)),
            Extended
        );
        // Shrinking is symmetric.
        assert_eq!(
            classify_filter_transition(&wire(&["blur", "sepia"]), &wire(&["blur"]), Some(&r)),
            Extended
        );
    }

    /// `Extended` pads the SHORTER side at the END with identity passes of
    /// the longer chain's trailing entries — start-side when growing (fade
    /// in), target-side when shrinking (fade out) — and `settle` is always
    /// the resolver's unpadded target output.
    #[test]
    fn plan_extends_shorter_side_with_trailing_identity_passes() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let r = builtin_registry();

        let from = wire(&["blur"]);
        let to = wire(&["blur", "sepia"]);
        // Resolver-shaped pass lists: blur → two passes (wire 0), sepia → one
        // (wire 1).
        let blur = (r.entries["blur"].resolve)(&json!({ "radius": 4 }), assets).unwrap();
        let mut sepia = (r.entries["sepia"].resolve)(&json!({ "amount": 0.5 }), assets).unwrap();
        sepia[0].wire_index = 1;
        let short_passes = blur.clone();
        let mut long_passes = blur.clone();
        long_passes.extend(sepia);

        // Growing: the START side pads.
        let ease = plan_filter_ease(
            &from,
            &to,
            short_passes.clone(),
            long_passes.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        let FilterEase::Aligned {
            start,
            target,
            settle,
        } = ease
        else {
            panic!("expected aligned");
        };
        assert_eq!(target, long_passes);
        assert_eq!(settle, long_passes);
        assert_eq!(start.len(), 3, "start padded at the end");
        assert_eq!(start[..2], short_passes[..], "existing passes untouched");
        assert_eq!(
            start[2].wire_index, 1,
            "pad sits at the longer chain's position"
        );
        assert_eq!(start[2].layout, long_passes[2].layout);
        assert_eq!(start[2].shader, long_passes[2].shader);
        // Identity sepia: amount 0 — NOT the shorthand default of 1.
        assert_eq!(start[2].params[1].x, 0.0);

        // Shrinking: the TARGET side pads; completion stays unpadded.
        let ease = plan_filter_ease(
            &to,
            &from,
            long_passes.clone(),
            short_passes.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        let FilterEase::Aligned {
            start,
            target,
            settle,
        } = ease
        else {
            panic!("expected aligned");
        };
        assert_eq!(start, long_passes);
        assert_eq!(settle, short_passes, "settle is the resolver's own output");
        assert_eq!(target.len(), 3);
        assert_eq!(target[..2], short_passes[..]);
        assert_eq!(target[2].wire_index, 1);
        assert_eq!(target[2].params[1].x, 0.0, "sepia fades out to identity");
    }

    /// The defensive alignment check also requires matching shaders: a
    /// `Matched` wire pair whose pass lists carry different shaders per index
    /// (a custom resolver may swap shaders by params) falls back to the
    /// documented discrete swap instead of rendering lerped params through
    /// the wrong pass mid-ease.
    #[test]
    fn plan_mismatched_shaders_fall_back_to_discrete() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let r = builtin_registry();
        // Same single-name chain on both sides → `Matched` classification.
        let chain = wire(&["glow"]);

        let start = (r.entries["grayscale"].resolve)(&json!({}), assets).unwrap();
        let mut target = start.clone();
        target[0].shader = <BlurParams as ReactFilter>::shader(assets);
        assert_ne!(start[0].shader, target[0].shader);
        assert_eq!(start[0].layout, target[0].layout);
        assert_eq!(start[0].params.len(), target[0].params.len());

        let ease = plan_filter_ease(
            &chain,
            &chain,
            start.clone(),
            target.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        let FilterEase::Discrete {
            start: s,
            target: t,
        } = ease
        else {
            panic!("expected discrete fallback on shader mismatch");
        };
        assert_eq!(s, start);
        assert_eq!(t, target);

        // Control: identical shaders (and layouts/params) stay aligned.
        let ease = plan_filter_ease(
            &chain,
            &chain,
            start.clone(),
            start.clone(),
            Some(&r),
            Some(assets),
            1.0,
        );
        assert!(matches!(ease, FilterEase::Aligned { .. }));
    }

    // -- whole-value filter transitions (headless, schedule-driven) ----------

    /// Matched-chain ease: a grayscale amount 0→1 delta (filter-only — the
    /// TRANSITION dirty group is never touched) eases the packed param each
    /// frame with a version bump + composite-only dirt per easing frame,
    /// settles EXACTLY on the resolver's own output, and stops churning after
    /// settle (the stage-interplay scar test).
    #[test]
    fn filter_transition_eases_matched_params_and_settles_exactly() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "grayscale", "params": { "amount": 0.0 } },
                    "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update(); // apply + resolve + seed the transition state — no mount ease
        let e = entity_of(&app, 1);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w,
            0.0
        );
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 1.0 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.25);
        let (mut last_w, mut last_version) = {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            let w = chain.passes[0].params[0].w;
            assert!(w > 0.0 && w < 1.0, "strictly between endpoints: {w}");
            (w, chain.version)
        };
        // Each easing frame bumps the version, moves the value, and pushes
        // composite-only dirt — never capture dirt.
        for _ in 0..2 {
            drain_dirt(&mut app);
            tick(&mut app, 0.25);
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert!(chain.version > last_version, "easing frame bumps version");
            let w = chain.passes[0].params[0].w;
            assert!(w > last_w && w < 1.0, "monotone ease: {last_w} → {w}");
            (last_w, last_version) = (w, chain.version);
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "{dirt:?}");
        }

        // Finish: the settle write is the resolver's own output, bit-exact.
        tick(&mut app, 0.5);
        let settled_version = {
            let world = app.world();
            let chain = world.get::<ResolvedFilterChain>(e).unwrap();
            let expected = (world.resource::<FilterRegistry>().entries["grayscale"].resolve)(
                &json!({ "amount": 1.0 }),
                world.resource::<AssetServer>(),
            )
            .unwrap();
            assert_eq!(chain.passes, expected, "settles on the resolver's output");
            chain.version
        };
        // Extra frames: no version churn, no dirt — the two writers agree.
        drain_dirt(&mut app);
        tick(&mut app, 0.25);
        tick(&mut app, 0.25);
        let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
        assert_eq!(chain.version, settled_version, "settled: no more churn");
        let dirt = app.world().resource::<LayerContentDirt>();
        assert!(!dirt.composite_only.contains(&e), "{dirt:?}");
        assert!(!dirt.nodes.contains(&e), "{dirt:?}");
    }

    /// Mid-ease retarget — the state-owned-current mechanism's whole point:
    /// grayscale eases 0→1; at the midpoint we retarget to 0.25. The new
    /// ease must start FROM the channel's own last write (≈0.5) — not from
    /// the old target (1.0) and not from the resolver's freshly snapped
    /// 0.25 — then ease down to 0.25, settle bit-exact on the resolver's own
    /// output, and go version-quiet.
    #[test]
    fn filter_transition_mid_ease_retarget_starts_from_current() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "grayscale", "params": { "amount": 0.0 } },
                    "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);

        // Ease 0 → 1 and advance to the midpoint.
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 1.0 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.5);
        let mid = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w;
        assert!(
            (mid - 0.5).abs() < 1e-3,
            "midpoint expected ~0.5, got {mid}"
        );

        // Retarget to 0.25 mid-ease. The resolver snaps the component to
        // 0.25 this same frame; the channel must re-ease from its own
        // current (~0.5), overriding the snap.
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale", "params": { "amount": 0.25 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.1);
        let w = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w;
        // 10% along a linear 0.5 → 0.25 ease: 0.475. Starting from the old
        // target (1.0) would read 0.925; adopting the resolver's snap would
        // read a flat 0.25.
        assert!(
            (w - 0.475).abs() < 1e-3,
            "new ease starts from current: expected ~0.475, got {w}"
        );

        // Still easing monotonically down toward 0.25.
        tick(&mut app, 0.4);
        let w2 = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].w;
        assert!(w2 < w && w2 > 0.25, "easing down: {w} → {w2}");

        // Settle bit-exact on the resolver's own output, then go quiet.
        tick(&mut app, 0.6);
        let settled_version = {
            let world = app.world();
            let chain = world.get::<ResolvedFilterChain>(e).unwrap();
            let expected = (world.resource::<FilterRegistry>().entries["grayscale"].resolve)(
                &json!({ "amount": 0.25 }),
                world.resource::<AssetServer>(),
            )
            .unwrap();
            assert_eq!(chain.passes, expected, "settles on the resolver's output");
            chain.version
        };
        tick(&mut app, 0.25);
        tick(&mut app, 0.25);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().version,
            settled_version,
            "settled: no more churn"
        );
    }

    /// The 90% case: an (opacity-)promoted node gains a blur — chain [] →
    /// [blur r=8] via a base-style delta. Extended strategy: the radius fades
    /// IN from identity 0 instead of popping; every easing frame is
    /// composite-only dirt, the capture is NEVER dirtied.
    #[test]
    fn filter_transition_fades_in_added_blur() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![
                create(
                    1,
                    json!({ "style": {
                        "opacity": 0.5,
                        "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                    } }),
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
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "promoted via opacity"
        );
        assert!(app.world().get::<ResolvedFilterChain>(e).is_none());
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "blur", "params": { "radius": 8 } } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.5);
        let mid = {
            let chain = app
                .world()
                .get::<ResolvedFilterChain>(e)
                .expect("chain resolved");
            assert_eq!(chain.passes.len(), 2, "blur H + V");
            let r = chain.passes[0].params[0].x;
            assert!(r > 0.0 && r < 8.0, "radius eases 0→8, got {r}");
            assert_eq!(chain.passes[1].params[0].x, r, "both directions agree");
            // Direction components ride along untouched.
            assert_eq!(chain.passes[0].params[0].y, 1.0);
            assert_eq!(chain.passes[1].params[0].z, 1.0);
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "capture never dirtied: {dirt:?}");
            r
        };
        drain_dirt(&mut app);
        tick(&mut app, 0.25);
        {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            let r = chain.passes[0].params[0].x;
            assert!(r > mid && r < 8.0, "still easing: {mid} → {r}");
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "capture never dirtied: {dirt:?}");
        }

        // Settle exactly on the resolver's output for the target chain.
        tick(&mut app, 0.5);
        let world = app.world();
        let chain = world.get::<ResolvedFilterChain>(e).unwrap();
        let expected = (world.resource::<FilterRegistry>().entries["blur"].resolve)(
            &json!({ "radius": 8 }),
            world.resource::<AssetServer>(),
        )
        .unwrap();
        assert_eq!(chain.passes, expected);
        assert_eq!(chain.passes[0].params[0].x, 8.0);
    }

    /// The overlay-lift payoff — the hover-blur fade, end to end through the real
    /// interaction path: base `blur radius 0` + `hoverStyle` `radius 8` +
    /// `transition.filter`. The node promotes EAGERLY at creation (variant
    /// presence union — no first-hover hitch), an `Interaction` flip makes
    /// [`crate::reconcile::apply_interaction_styles`] re-stamp `FilterInput`
    /// with the merged chain, and the transition eases the radius 0→8
    /// (matched strategy: same single-name blur chain), then back 8→0 on
    /// hover-out from wherever the ease currently is.
    #[test]
    fn hover_filter_eases_through_interaction_restyle() {
        use bevy::ui::Interaction;

        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({
                    "style": {
                        "filter": { "name": "blur", "params": { "radius": 0.0 } },
                        "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                    },
                    "hoverStyle": { "filter": { "name": "blur", "params": { "radius": 8.0 } } },
                }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        // Promoted from creation — before any hover — and resolved at the
        // base radius. The variants also stamped an `Interaction`.
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "hover-filter node promotes eagerly"
        );
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x,
            0.0
        );
        assert_eq!(app.world().get::<Interaction>(e), Some(&Interaction::None));
        drain_dirt(&mut app);

        // Hover in: the interaction restyle merges base+hover and re-stamps
        // `FilterInput` with radius 8; the ease starts from 0.
        *app.world_mut()
            .entity_mut(e)
            .get_mut::<Interaction>()
            .unwrap() = Interaction::Hovered;
        tick(&mut app, 0.25);
        let mid = {
            let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
            assert_eq!(chain.passes.len(), 2, "matched blur chain: H + V");
            let r = chain.passes[0].params[0].x;
            assert!(r > 0.0 && r < 8.0, "radius eases 0→8, got {r}");
            assert_eq!(chain.passes[1].params[0].x, r, "both directions agree");
            // Still promoted — interaction never flips promotion. (The flip
            // frame itself MAY carry capture dirt: the interaction restyle is
            // a conservative full re-apply, since a variant can change any
            // painted style.)
            assert!(app.world().get::<PromotedLayer>(e).is_some());
            r
        };
        // Pure easing frames after the flip are composite-only — the capture
        // stays clean while the blur fades.
        drain_dirt(&mut app);
        tick(&mut app, 0.25);
        let later = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x;
        assert!(later > mid && later < 8.0, "monotone ease: {mid} → {later}");
        {
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "capture never dirtied: {dirt:?}");
        }

        // Settle bit-exact on the resolver's output for the hover chain.
        tick(&mut app, 0.6);
        {
            let world = app.world();
            let chain = world.get::<ResolvedFilterChain>(e).unwrap();
            let expected = (world.resource::<FilterRegistry>().entries["blur"].resolve)(
                &json!({ "radius": 8.0 }),
                world.resource::<AssetServer>(),
            )
            .unwrap();
            assert_eq!(chain.passes, expected, "settles on the resolver's output");
        }

        // Hover out: the merged style falls back to the base chain and the
        // radius eases back down from 8 — no snap.
        *app.world_mut()
            .entity_mut(e)
            .get_mut::<Interaction>()
            .unwrap() = Interaction::None;
        tick(&mut app, 0.25);
        let down = app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x;
        assert!(down > 0.0 && down < 8.0, "eases back down, got {down}");
        tick(&mut app, 1.0);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes[0].params[0].x,
            0.0,
            "settled back on the base radius"
        );
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "still promoted after hover-out (presence union)"
        );
    }

    /// A mismatched pair involving a custom filter (no identity) swaps
    /// discretely: the OLD chain's passes hold until eased progress 0.5, then
    /// the new chain lands bit-exact, and the version stops churning after
    /// settle.
    #[test]
    fn filter_transition_discrete_swaps_at_midpoint() {
        use crate::react_filter;

        #[react_filter(shader = "shaders/step.wgsl")]
        struct StepParams {
            amount: f32,
        }

        let (mut app, ops_tx) = ease_app();
        app.world_mut()
            .resource_mut::<FilterRegistry>()
            .register::<StepParams>();

        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "filter": { "name": "stepParams", "params": { "amount": 2.0 } },
                    "transition": { "filter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        let start_passes = app
            .world()
            .get::<ResolvedFilterChain>(e)
            .unwrap()
            .passes
            .clone();
        assert_eq!(start_passes[0].params[0].x, 2.0);

        // Swap to a different-name chain (a custom is involved → discrete).
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "filter": { "name": "grayscale" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.25);
        // Before the midpoint the OLD passes are re-written over the
        // resolver's snap.
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes,
            start_passes
        );
        tick(&mut app, 0.3); // eased progress 0.55: swapped
        let expected = {
            let world = app.world();
            (world.resource::<FilterRegistry>().entries["grayscale"].resolve)(
                &json!({}),
                world.resource::<AssetServer>(),
            )
            .unwrap()
        };
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().passes,
            expected
        );

        // Settle: same target, then quiet.
        tick(&mut app, 0.5);
        let chain = app.world().get::<ResolvedFilterChain>(e).unwrap();
        assert_eq!(chain.passes, expected);
        let v = chain.version;
        tick(&mut app, 0.25);
        assert_eq!(
            app.world().get::<ResolvedFilterChain>(e).unwrap().version,
            v,
            "settled: no more churn"
        );
    }
}
