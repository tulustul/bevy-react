//! The `morphFilter` style: a view-transition-style morph between a node's
//! old and new content.
//!
//! Wire shape: `{ key, name, params }` — a [`FilterUse`] plus a `key`. The
//! morph triggers only when `key` changes: the layer's previous rendered
//! appearance is frozen as a snapshot texture and the named two-input filter
//! blends frozen → live content, driven by an engine-owned `progress`
//! uniform eased 0→1 by the `transition: { morphFilter }` channel (with a
//! built-in default duration when no spec is given — the one channel that
//! animates without being asked).
//!
//! Decoding follows the warn-don't-abort convention (see [`super::wire`]): a
//! malformed value warns into the decode sink (`morphFilterParams`) and the
//! whole field degrades to `None`, never failing the containing `Style`.

use bevy::prelude::*;
use serde::{Deserialize, Deserializer};
use serde_json::{Map, Value};

use super::FilterUse;
use super::registry::ResolvedFilterPass;
use super::resolve::{ChainInput, ResolvedChain, ResolvedFilterChain};
use super::wire::FilterChain;

/// The decoded `morphFilter` style value: the morph identity `key` (a string
/// or number — a change is what triggers the morph) plus the two-input filter
/// to blend with, as a regular registry [`FilterUse`].
#[derive(Debug, Clone, PartialEq)]
pub struct MorphFilter {
    /// Morph identity. Only meaningful relative to its previous value: a
    /// change freezes the old appearance and starts the transition.
    pub key: Value,
    /// The two-input filter (registry name + raw params) blending
    /// frozen → live.
    pub filter: FilterUse,
}

/// `Style.morph_filter`'s deserializer: `null` → `None`, a malformed value
/// warns (`morphFilterParams`) and degrades the whole field to `None`.
pub(crate) fn de_morph_filter<'de, D: Deserializer<'de>>(
    d: D,
) -> Result<Option<MorphFilter>, D::Error> {
    let v = Value::deserialize(d)?;
    if v.is_null() {
        return Ok(None);
    }
    Ok(morph_from_value(v))
}

fn morph_from_value(value: Value) -> Option<MorphFilter> {
    let mut obj = match value {
        Value::Object(obj) => obj,
        other => {
            warn_decode(
                &other,
                &format!("morphFilter must be a {{ key, name, params }} object, got {other}"),
            );
            return None;
        }
    };
    let key = match obj.remove("key") {
        Some(key @ (Value::String(_) | Value::Number(_))) => key,
        Some(other) => {
            warn_decode(
                &other,
                &format!("morphFilter key must be a string or number, got {other}"),
            );
            return None;
        }
        None => {
            let entry = Value::Object(obj);
            warn_decode(&entry, &format!("morphFilter {entry} is missing \"key\""));
            return None;
        }
    };
    let name = match obj.remove("name") {
        Some(Value::String(name)) => name,
        Some(other) => {
            warn_decode(
                &other,
                &format!("morphFilter name must be a string, got {other}"),
            );
            return None;
        }
        None => {
            let entry = Value::Object(obj);
            warn_decode(&entry, &format!("morphFilter {entry} is missing \"name\""));
            return None;
        }
    };
    let params = match obj.remove("params") {
        // Same null-leniency as the filter chain: `params: null` == absent.
        None | Some(Value::Null) => Map::new(),
        Some(Value::Object(params)) => params,
        Some(other) => {
            warn_decode(
                &other,
                &format!("morphFilter params must be an object, got {other}"),
            );
            return None;
        }
    };
    Some(MorphFilter {
        key,
        filter: FilterUse { name, params },
    })
}

fn warn_decode(value: &Value, message: &str) {
    crate::protocol::decode_warn("morphFilterParams", &value.to_string(), message);
}

/// User params of a morph filter may occupy at most this many `Vec4` slots:
/// the last two of [`MAX_FILTER_PARAM_VECS`](super::MAX_FILTER_PARAM_VECS)
/// (= 8) are engine-reserved on a morph pass — `params[7].x` carries the
/// eased progress (see the prelude's `morph_progress`; `params[6]` is
/// reserved-unused spare).
pub const MORPH_MAX_USER_PARAM_VECS: usize = 6;

/// The wire `morphFilter` of a node, mirrored off the applied style by
/// `crate::ui_map::apply_style_masked`'s MORPH arm — present iff the style
/// carries the field. Same contract as [`FilterInput`](super::FilterInput):
/// the style apply owns writes, the resolver only reads. The `key` rides
/// outside the chain: the resolver never looks at it (a key-only change
/// re-resolves to identical output, version-quiet) — retarget detection is
/// the morph transition channel's job.
#[derive(Component, Debug, Clone, Default, PartialEq)]
pub struct MorphInput {
    /// The morph's single [`FilterUse`] as a 1-entry chain, so the shared
    /// [`resolve_chains`](super::resolve_chains) machinery applies unchanged.
    pub chain: FilterChain,
    /// The morph identity (string or number); a change triggers the morph.
    pub key: Value,
}

impl ChainInput for MorphInput {
    const KIND_UNKNOWN: &'static str = "morphFilterUnknown";
    const KIND_PARAMS: &'static str = "morphFilterParams";
    const FORCE_ALWAYS_DIRTY: bool = false;
    fn chain(&self) -> &FilterChain {
        &self.chain
    }
    /// The family check first (the actionable message — a regular filter
    /// name here should say "not a morph filter", not leak a pass-count
    /// symptom), then the v1 caps for registered morphs: exactly ONE pass
    /// (multi-pass resolves have no defined snapshot-binding semantics as a
    /// morph), and user params leaving the two engine-reserved `Vec4`s free.
    fn validate_entry(
        name: &str,
        is_morph: bool,
        passes: &[ResolvedFilterPass],
    ) -> Result<(), String> {
        if !is_morph {
            return Err(format!(
                "{name:?} is not a morph filter — register it with #[react_morph_filter] / \
                 add_react_morph_filter"
            ));
        }
        if passes.len() != 1 {
            return Err(format!(
                "a morph filter must resolve to exactly one pass, got {} — \
                 multi-pass filters cannot be used as morphs",
                passes.len()
            ));
        }
        if passes[0].params.len() > MORPH_MAX_USER_PARAM_VECS {
            return Err(format!(
                "morph filter params occupy {} vec4 slots, over the cap of \
                 {MORPH_MAX_USER_PARAM_VECS} (the last two are engine-reserved)",
                passes[0].params.len()
            ));
        }
        Ok(())
    }
}

/// A node's fully resolved morph filter — a newtype over
/// [`ResolvedFilterChain`] (always exactly one pass, per
/// [`MorphInput::validate_entry`]) so extract, animations, and devtools reuse
/// the inner type via `.0`. Attached to promoted roots by the morph
/// [`resolve_chains`](super::resolve_chains) instance; absent when the entry
/// is invalid (the morph degrades to a snap). Removed on demotion by
/// `evaluate_layer_promotions`'s cleanup.
#[derive(Component, Debug, Clone, Default)]
pub struct ResolvedMorphChain(pub ResolvedFilterChain);

impl ResolvedChain for ResolvedMorphChain {
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

/// The live state of a node's morph transition, written by the morph channel
/// in `crate::transition` (retarget on key change, per-frame progress) and
/// read by render extraction (the freeze request + blend pass). Inserted on
/// first activation; removed on demotion.
///
/// The frozen snapshot is anchored to the node's LAYOUT rect: the blend
/// stretches it onto the current capture rect (0..1 UV over both textures),
/// so scrolling or moving the node mid-flight carries both images together.
/// A size change across the swap stretches the old appearance — handling
/// that gracefully is the app's responsibility.
#[derive(Component, Debug, Clone, Default, PartialEq)]
pub struct MorphState {
    /// A morph is in flight: the blend pass runs. Cleared one frame after
    /// the runner settles (the settle frame renders at exactly
    /// `progress = 1.0`, which the morph-shader identity contract makes
    /// pixel-equal to no pass — so dropping the pass next frame can never
    /// flash).
    pub active: bool,
    /// Engine-owned blend progress, `0.0..=1.0` (clamped — spring specs may
    /// overshoot).
    pub progress: f32,
    /// Bumped on every retarget; the render side freezes the snapshot when it
    /// sees a sequence it hasn't consumed yet.
    pub freeze_seq: u64,
}

#[cfg(test)]
mod resolve_tests {
    use serde_json::json;

    use super::super::test_util::{create, entity_of, resolve_app, update};
    use super::*;
    use crate::layer::PromotedLayer;

    /// A `morphFilter` create promotes (MORPH reason) and resolves into a
    /// single-pass [`ResolvedMorphChain`] on the root; the content/backdrop
    /// channels stay untouched. The `key` rides the input, invisible to the
    /// resolver.
    #[test]
    fn morph_create_attaches_resolved_chain() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "morphFilter": {
                    "key": "a", "name": "crossfade"
                } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<PromotedLayer>(e).is_some(), "promoted");
        let input = app.world().get::<MorphInput>(e).expect("input stamped");
        assert_eq!(input.key, json!("a"));
        assert_eq!(input.chain.0.len(), 1);
        let chain = app
            .world()
            .get::<ResolvedMorphChain>(e)
            .expect("morph chain resolved");
        assert_eq!(chain.0.version, 1);
        assert_eq!(chain.0.passes.len(), 1);
        assert!(!chain.0.always_dirty);
        assert!(
            app.world()
                .get::<super::super::ResolvedFilterChain>(e)
                .is_none(),
            "content channel untouched"
        );
        assert!(
            app.world()
                .get::<super::super::ResolvedBackdropChain>(e)
                .is_none(),
            "backdrop channel untouched"
        );

        // A key-only change re-stamps the input but the resolved chain is
        // identical — version-quiet (retargeting is the channel's job).
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": {
                    "key": "b", "name": "crossfade"
                } } }),
                &[],
            )])
            .unwrap();
        app.update();
        assert_eq!(app.world().get::<MorphInput>(e).unwrap().key, json!("b"));
        assert_eq!(
            app.world().get::<ResolvedMorphChain>(e).unwrap().0.version,
            1,
            "identical resolve output must not bump"
        );
    }

    /// An unknown morph filter name warns under `morphFilterUnknown` and
    /// attaches no chain — the node stays promoted (presence-based), the
    /// morph degrades to a snap.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn unknown_morph_name_warns_and_attaches_no_chain() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                7,
                json!({ "style": { "morphFilter": { "key": 1, "name": "nope" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 7);
        assert!(app.world().get::<PromotedLayer>(e).is_some(), "promoted");
        assert!(app.world().get::<ResolvedMorphChain>(e).is_none());

        let warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(7))
            .collect();
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].kind, "morphFilterUnknown");
    }

    /// The family split: a regular filter (blur) named as a `morphFilter` is
    /// rejected with a `morphFilterParams` warn and no chain attaches —
    /// while the same entry in a content `filter` chain on the same node
    /// resolves fine (per-instance validation).
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn non_morph_filter_rejected_as_morph() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                8,
                json!({ "style": {
                    "morphFilter": { "key": "a", "name": "blur" },
                    "filter": { "name": "blur" }
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 8);
        assert!(
            app.world().get::<ResolvedMorphChain>(e).is_none(),
            "regular filter rejected as morph"
        );
        let content = app
            .world()
            .get::<super::super::ResolvedFilterChain>(e)
            .expect("content chain unaffected by the morph cap");
        assert_eq!(content.passes.len(), 2, "blur H+V");

        let warns: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(8))
            .collect();
        assert_eq!(warns.len(), 1, "{warns:?}");
        assert_eq!(warns[0].kind, "morphFilterParams");
        assert!(
            warns[0].message.contains("not a morph filter"),
            "{}",
            warns[0].message
        );
    }

    /// Direct coverage of the caps the family check now sits in front of
    /// (unreachable via built-ins wire-side — a registered morph would need
    /// a multi-pass `resolve` override or >6 param vecs to hit them).
    #[test]
    fn validate_entry_orders_family_then_pass_count_then_param_cap() {
        let pass = || ResolvedFilterPass {
            shader: Handle::default(),
            params: Vec::new(),
            layout: Vec::new().into(),
            wire_index: 0,
        };
        let family = <MorphInput as ChainInput>::validate_entry("blur", false, &[pass()]);
        assert!(family.unwrap_err().contains("not a morph filter"));

        let two = <MorphInput as ChainInput>::validate_entry("x", true, &[pass(), pass()]);
        assert!(two.unwrap_err().contains("exactly one pass"));

        let mut fat = pass();
        fat.params = vec![Vec4::ZERO; MORPH_MAX_USER_PARAM_VECS + 1];
        let capped = <MorphInput as ChainInput>::validate_entry("x", true, &[fat]);
        assert!(capped.unwrap_err().contains("over the cap"));

        assert!(<MorphInput as ChainInput>::validate_entry("x", true, &[pass()]).is_ok());
    }

    /// Unsetting `morphFilter` on a node held promoted by another reason
    /// removes the input + resolved chain (the `RemovedComponents` cleanup);
    /// full demotion removes them too (the evaluator's cleanup).
    #[test]
    fn unset_removes_chain_while_promoted_and_on_demote() {
        let (mut app, ops_tx) = resolve_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "cache": "always",
                    "morphFilter": { "key": "a", "name": "crossfade" }
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<ResolvedMorphChain>(e).is_some());

        ops_tx
            .send(vec![update(1, json!({}), &["morphFilter"])])
            .unwrap();
        app.update();
        assert!(
            app.world().get::<PromotedLayer>(e).is_some(),
            "cache: always still holds the layer"
        );
        assert!(app.world().get::<MorphInput>(e).is_none(), "input gone");
        assert!(
            app.world().get::<ResolvedMorphChain>(e).is_none(),
            "chain cleaned up while still promoted"
        );

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "a", "name": "linearWipe" } } }),
                &["cache"],
            )])
            .unwrap();
        app.update();
        assert!(app.world().get::<ResolvedMorphChain>(e).is_some());
        ops_tx
            .send(vec![update(1, json!({}), &["morphFilter"])])
            .unwrap();
        app.update();
        assert!(app.world().get::<PromotedLayer>(e).is_none(), "demoted");
        assert!(
            app.world().get::<ResolvedMorphChain>(e).is_none(),
            "demote removes the resolved chain"
        );
        assert!(
            app.world().get::<MorphState>(e).is_none(),
            "demote removes the morph state"
        );
    }
}

#[cfg(test)]
mod channel_tests {
    use serde_json::json;

    use super::super::test_util::{create, drain_dirt, ease_app, entity_of, tick, update};
    use super::*;
    use crate::layer::{LayerCaptureRect, LayerContentDirt};

    /// Give the headless entity an on-screen rect (no layout/geometry systems
    /// run in `ease_app`, so `LayerCaptureRect` never appears on its own).
    fn stamp_rect(app: &mut bevy::app::App, e: Entity) {
        app.world_mut().entity_mut(e).insert(LayerCaptureRect {
            min: Vec2::new(10.0, 20.0),
            size: UVec2::new(100, 50),
            outset: 0,
        });
    }

    /// The headline contract: a key change animates with NO `transition`
    /// style at all (built-in 300ms default) — freeze frame at exactly 0.0
    /// with capture dirt, eased middle, settle frame at exactly 1.0 still
    /// active, deactivation the frame after.
    #[test]
    fn key_change_arms_with_default_duration() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "morphFilter": { "key": "a", "name": "crossfade" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(
            app.world().get::<MorphState>(e).is_none(),
            "mount inserts no state"
        );
        stamp_rect(&mut app, e);
        drain_dirt(&mut app);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "b", "name": "crossfade" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.15);
        {
            let s = app.world().get::<MorphState>(e).expect("state inserted");
            assert!(s.active);
            assert_eq!(s.freeze_seq, 1);
            assert_eq!(s.progress, 0.0, "freeze frame renders fully 'from'");
            let dirt = app.world().resource::<LayerContentDirt>();
            assert!(dirt.nodes.contains(&e), "freeze re-captures: {dirt:?}");
        }

        tick(&mut app, 0.15);
        {
            let s = app.world().get::<MorphState>(e).unwrap();
            assert!(
                s.progress > 0.0 && s.progress < 1.0,
                "mid-ease: {}",
                s.progress
            );
            assert!(s.active);
        }

        tick(&mut app, 0.3);
        {
            let s = app.world().get::<MorphState>(e).unwrap();
            assert_eq!(s.progress, 1.0, "settle writes exactly 1.0");
            assert!(s.active, "settle frame still renders the pass");
        }

        tick(&mut app, 0.016);
        let s = app.world().get::<MorphState>(e).unwrap();
        assert!(!s.active, "deactivated the frame after settle");
        assert_eq!(s.progress, 1.0);
    }

    /// An explicit `transition: { morphFilter }` spec overrides the built-in
    /// default (1s linear → exact halfway reading at 0.5s).
    #[test]
    fn explicit_morph_spec_wins() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "morphFilter": { "key": "a", "name": "crossfade" },
                    "transition": { "morphFilter": { "duration": 1000, "easing": "linear" } },
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        stamp_rect(&mut app, e);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": {
                    "morphFilter": { "key": "b", "name": "crossfade" },
                    "transition": { "morphFilter": { "duration": 1000, "easing": "linear" } },
                } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.25); // freeze frame (progress stays 0)
        tick(&mut app, 0.5);
        let s = app.world().get::<MorphState>(e).unwrap();
        assert_eq!(s.progress, 0.5, "1s linear at 0.5s");
    }

    /// The mount rule: the first key ever seen never animates — and a key
    /// change with nothing on screen yet (no capture rect) snaps too.
    #[test]
    fn mount_and_rectless_key_change_do_not_animate() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "morphFilter": { "key": "a", "name": "crossfade" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        assert!(app.world().get::<MorphState>(e).is_none());

        // Key change with NO LayerCaptureRect: nothing on screen to freeze.
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "b", "name": "crossfade" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        assert!(
            app.world().get::<MorphState>(e).is_none(),
            "rectless key change snaps"
        );
        // And the NEXT key change (rect now present) does animate — the
        // snapped key was adopted, not ignored.
        stamp_rect(&mut app, e);
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "c", "name": "crossfade" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        assert!(app.world().get::<MorphState>(e).is_some_and(|s| s.active));
    }

    /// An unresolved morph (unknown filter name) degrades key changes to
    /// snaps — no state, no animation.
    #[test]
    fn unresolved_morph_key_change_snaps() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "morphFilter": { "key": "a", "name": "nope" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        stamp_rect(&mut app, e);
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "b", "name": "nope" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        assert!(app.world().get::<MorphState>(e).is_none());
    }

    /// The interrupt contract: a key change mid-flight bumps `freeze_seq`
    /// (the render side re-freezes — the in-flight blended output) and
    /// restarts progress from 0.
    #[test]
    fn key_rebump_mid_flight_bumps_freeze_seq_and_restarts() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "morphFilter": { "key": "a", "name": "crossfade" } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        stamp_rect(&mut app, e);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "b", "name": "crossfade" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.15);
        tick(&mut app, 0.1);
        let mid = app.world().get::<MorphState>(e).unwrap().progress;
        assert!(mid > 0.0 && mid < 1.0, "mid-flight: {mid}");

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "c", "name": "crossfade" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        let s = app.world().get::<MorphState>(e).unwrap();
        assert_eq!(s.freeze_seq, 2, "re-freeze requested");
        assert_eq!(s.progress, 0.0, "restarted");
        assert!(s.active);
    }

    /// Unsetting `morphFilter` mid-flight snaps: the runtime state is
    /// removed with the input (the ui_map arm — with no `transition` style
    /// the unset also tears down `TransitionState`, so nothing else could
    /// deactivate it). The node here stays promoted via `cache`.
    #[test]
    fn unset_morph_mid_flight_snaps_and_deactivates() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": {
                    "cache": "always",
                    "morphFilter": { "key": "a", "name": "crossfade" }
                } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        stamp_rect(&mut app, e);
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": { "key": "b", "name": "crossfade" } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.1);
        assert!(app.world().get::<MorphState>(e).is_some_and(|s| s.active));

        ops_tx
            .send(vec![update(1, json!({}), &["morphFilter"])])
            .unwrap();
        tick(&mut app, 0.016);
        assert!(
            app.world().get::<crate::layer::PromotedLayer>(e).is_some(),
            "cache: always still holds the layer"
        );
        assert!(
            app.world().get::<MorphState>(e).is_none(),
            "unset removes the runtime state with the input"
        );
        assert!(app.world().get::<MorphInput>(e).is_none());
    }

    /// An inline `{ animated }` morph-param binding drives the resolved
    /// morph's packed slot through the full pipeline (Angle slot: degrees →
    /// packed radians, composite-only dirt), while the content/backdrop
    /// chains stay untouched — and the binding does NOT park the morph
    /// progress: a key change mid-binding still eases.
    #[test]
    fn morph_param_binding_drives_packed_slot_and_never_parks_progress() {
        use super::super::test_util::anim_app;
        let (mut app, ops_tx, anim_tx) = anim_app();
        anim_tx
            .send(crate::animations::AnimationCommand::Set { id: 1, value: 90.0 })
            .unwrap();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "morphFilter": {
                    "key": "a", "name": "linearWipe",
                    "params": { "angle": { "animated": { "id": 1 } } }
                } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        {
            let chain = &app.world().get::<ResolvedMorphChain>(e).unwrap().0;
            assert!(
                (chain.passes[0].params[0].x - std::f32::consts::FRAC_PI_2).abs() < 1e-5,
                "angle driven, degrees → packed radians: {}",
                chain.passes[0].params[0].x
            );
        }

        drain_dirt(&mut app);
        anim_tx
            .send(crate::animations::AnimationCommand::Set {
                id: 1,
                value: 180.0,
            })
            .unwrap();
        tick(&mut app, 0.016);
        {
            let chain = &app.world().get::<ResolvedMorphChain>(e).unwrap().0;
            assert!((chain.passes[0].params[0].x - std::f32::consts::PI).abs() < 1e-5);
            let dirt = app.world().resource::<crate::layer::LayerContentDirt>();
            assert!(dirt.composite_only.contains(&e), "{dirt:?}");
            assert!(!dirt.nodes.contains(&e), "never capture dirt: {dirt:?}");
        }

        // A key change with the binding live still eases progress (the
        // binding parks nothing).
        stamp_rect(&mut app, e);
        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": {
                    "key": "b", "name": "linearWipe",
                    "params": { "angle": { "animated": { "id": 1 } } }
                } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        tick(&mut app, 0.15);
        let s = app.world().get::<MorphState>(e).expect("morph armed");
        assert!(s.active);
        assert!(
            s.progress > 0.0 && s.progress < 1.0,
            "progress eases despite the param binding: {}",
            s.progress
        );
    }

    /// A params-only delta (key unchanged) re-resolves the chain but never
    /// restarts the progress — the morph triggers on `key` alone.
    #[test]
    fn params_change_without_key_change_does_not_restart() {
        let (mut app, ops_tx) = ease_app();
        ops_tx
            .send(vec![create(
                1,
                json!({ "style": { "morphFilter": {
                    "key": "a", "name": "linearWipe", "params": { "softness": 0.0 }
                } } }),
            )])
            .unwrap();
        app.update();
        let e = entity_of(&app, 1);
        stamp_rect(&mut app, e);

        ops_tx
            .send(vec![update(
                1,
                json!({ "style": { "morphFilter": {
                    "key": "a", "name": "linearWipe", "params": { "softness": 40.0 }
                } } }),
                &[],
            )])
            .unwrap();
        tick(&mut app, 0.016);
        assert!(
            app.world().get::<MorphState>(e).is_none(),
            "no morph started"
        );
        let chain = app.world().get::<ResolvedMorphChain>(e).unwrap();
        assert_eq!(chain.0.version, 2, "params snapped by the resolver");
        // linearWipe packs `softness` (logical px) at params[0].y.
        assert_eq!(chain.0.passes[0].params[0].y, 40.0);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn decode(json: &str) -> Option<MorphFilter> {
        #[derive(Deserialize)]
        struct Holder {
            #[serde(default, deserialize_with = "de_morph_filter")]
            morph_filter: Option<MorphFilter>,
        }
        let h: Holder = serde_json::from_str(&format!(r#"{{"morph_filter":{json}}}"#))
            .expect("morphFilter decode must not error");
        h.morph_filter
    }

    #[test]
    fn full_object_decodes() {
        let m = decode(r#"{"key":"a","name":"linearWipe","params":{"angle":45}}"#)
            .expect("decodes to Some");
        assert_eq!(m.key, Value::from("a"));
        assert_eq!(m.filter.name, "linearWipe");
        assert_eq!(m.filter.params["angle"], serde_json::json!(45));
    }

    #[test]
    fn numeric_key_and_absent_params_decode() {
        let m = decode(r#"{"key":3,"name":"crossfade"}"#).expect("decodes to Some");
        assert_eq!(m.key, Value::from(3));
        assert!(m.filter.params.is_empty());
        // Null-leniency: `params: null` == absent.
        let m = decode(r#"{"key":3,"name":"crossfade","params":null}"#).expect("decodes to Some");
        assert!(m.filter.params.is_empty());
    }

    /// Whole-value degradation: any malformed piece empties the field, so a
    /// half-decoded morph can never run.
    #[test]
    fn malformed_values_degrade_to_none() {
        assert_eq!(decode("42"), None); // not an object
        assert_eq!(decode(r#"{"name":"crossfade"}"#), None); // missing key
        assert_eq!(decode(r#"{"key":true,"name":"crossfade"}"#), None); // bad key type
        assert_eq!(decode(r#"{"key":"a"}"#), None); // missing name
        assert_eq!(decode(r#"{"key":"a","name":7}"#), None); // bad name
        assert_eq!(decode(r#"{"key":"a","name":"crossfade","params":3}"#), None); // bad params
        assert_eq!(decode("null"), None); // explicit null is a clean absent
    }

    /// Malformed values are mirrored into the devtools decode sink under the
    /// `morphFilterParams` kind (sink is thread-local; parallel-safe).
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn malformed_values_report_decode_warnings() {
        let _ = crate::diag::take_decode_warnings();
        let _ = decode(r#"{"name":"crossfade"}"#);
        let _ = decode("42");
        let warns = crate::diag::take_decode_warnings();
        assert_eq!(warns.len(), 2);
        assert!(warns.iter().all(|w| w.kind == "morphFilterParams"));
        // A clean decode (incl. explicit null) leaves the sink empty.
        let _ = decode(r#"{"key":"a","name":"crossfade"}"#);
        let _ = decode("null");
        assert!(crate::diag::take_decode_warnings().is_empty());
    }
}
