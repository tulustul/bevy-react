//! Schedule tests for the whole-value gradient transition channels
//! (`transition: { backgroundGradient, borderGradient }`) — op-driven
//! through the `ease_app` harness, in the `filters/transition.rs` style.
//! Split from `tests.rs` for file size; the section is self-contained.

// -- whole-value gradient transitions (op-driven, schedule-driven) -----------

use crate::filters::test_util::{create, drain_dirt, ease_app, entity_of, tick, update};
use crate::layer::LayerContentDirt;
use bevy::ui::{BackgroundGradient, BorderGradient, Gradient};
use serde_json::json;

/// A 2-stop single-color linear gradient (wire shape).
fn gradient_json(color: &str) -> serde_json::Value {
    json!({
        "type": "linear",
        "stops": [
            { "color": color, "position": 0 },
            { "color": color, "position": "100%" },
        ],
    })
}

/// The resolver's own build of a wire gradient — what `apply_style` writes
/// (folded) and what settle must equal bit-exactly.
fn expect_gradients(json: serde_json::Value, opacity: Option<f32>) -> Vec<Gradient> {
    let list: crate::protocol::visual::GradientList =
        serde_json::from_value(json).expect("valid gradient json");
    crate::ui_map::build_gradients(&list, opacity)
}

/// The srgba components of every stop of a single-linear-gradient component.
fn linear_stop_rgba(gradients: &[Gradient]) -> Vec<[f32; 4]> {
    let Gradient::Linear(l) = &gradients[0] else {
        panic!("expected a linear gradient, got {:?}", gradients[0]);
    };
    l.stops
        .iter()
        .map(|s| {
            let c = s.color.to_srgba();
            [c.red, c.green, c.blue, c.alpha]
        })
        .collect()
}

/// Matched-structure ease: a red→blue `backgroundGradient` delta with a
/// `transition: { backgroundGradient }` eases the component's stop colors
/// (strictly between the endpoints mid-ease, content dirt per easing frame),
/// settles bit-exactly on the resolver's own folded build, and goes quiet.
#[test]
fn background_gradient_transition_eases_matched_stops() {
    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "backgroundGradient": gradient_json("#ff0000"),
                "transition": { "backgroundGradient": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update(); // apply + stamp + seed — no mount ease
    let e = entity_of(&app, 1);
    drain_dirt(&mut app);

    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": gradient_json("#0000ff") } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.5);
    for rgba in linear_stop_rgba(&app.world().get::<BackgroundGradient>(e).unwrap().0) {
        assert!(
            rgba[0] > 0.0 && rgba[0] < 1.0 && rgba[2] > 0.0 && rgba[2] < 1.0,
            "mid-ease stop strictly between red and blue: {rgba:?}"
        );
    }
    let dirt = app.world().resource::<LayerContentDirt>();
    assert!(dirt.nodes.contains(&e), "easing frame is content dirt");

    // Finish: settle is the resolver's own (unfolded here — no opacity)
    // build, bit-exact.
    tick(&mut app, 0.6);
    let expected = expect_gradients(gradient_json("#0000ff"), None);
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expected,
        "settles on the resolver's own build"
    );

    // Two idle ticks: the runner dropped, no more dirt for the entity.
    drain_dirt(&mut app);
    tick(&mut app, 0.25);
    tick(&mut app, 0.25);
    let dirt = app.world().resource::<LayerContentDirt>();
    assert!(!dirt.nodes.contains(&e), "settled: no dirt");
    assert!(!dirt.composite_only.contains(&e), "settled: no dirt");
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expected
    );
}

/// Mid-ease retarget — the state-owned-current mechanism: red→blue eased to
/// the midpoint, then retargeted to green. The next frame continues from
/// ≈the mid color (not the old target, not `apply_style`'s fresh snap),
/// settles bit-exact, and goes quiet.
#[test]
fn gradient_transition_mid_ease_retarget_starts_from_current() {
    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "backgroundGradient": gradient_json("#ff0000"),
                "transition": { "backgroundGradient": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);

    // Ease red → blue to the midpoint: (0.5, 0, 0.5).
    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": gradient_json("#0000ff") } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.5);
    let mid = linear_stop_rgba(&app.world().get::<BackgroundGradient>(e).unwrap().0)[0];
    assert!(
        (mid[0] - 0.5).abs() < 1e-3 && (mid[2] - 0.5).abs() < 1e-3,
        "midpoint expected ~(0.5, 0, 0.5), got {mid:?}"
    );

    // Retarget to green mid-ease. `apply_style` snaps the component to green
    // this same frame; the channel must re-ease from its own current (~the
    // mid color). 10% along a linear (0.5,0,0.5) → (0,1,0) ease:
    // (0.45, 0.1, 0.45). Starting from the old target (blue) would read
    // (0, 0.1, 0.9); adopting the snap would read a flat (0, 1, 0).
    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": gradient_json("#00ff00") } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.1);
    let c = linear_stop_rgba(&app.world().get::<BackgroundGradient>(e).unwrap().0)[0];
    assert!(
        (c[0] - 0.45).abs() < 1e-3 && (c[1] - 0.1).abs() < 1e-3 && (c[2] - 0.45).abs() < 1e-3,
        "new ease starts from current: expected ~(0.45, 0.1, 0.45), got {c:?}"
    );

    // Settle bit-exact on the resolver's own build, then go quiet.
    tick(&mut app, 1.0);
    let expected = expect_gradients(gradient_json("#00ff00"), None);
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expected
    );
    drain_dirt(&mut app);
    tick(&mut app, 0.25);
    tick(&mut app, 0.25);
    let dirt = app.world().resource::<LayerContentDirt>();
    assert!(!dirt.nodes.contains(&e), "settled: no dirt");
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expected
    );
}

/// The agreed mismatch policy: a retarget whose gradient structures can't be
/// paired (here 2 stops → 3 stops) SNAPS to the target the same frame — no
/// intermediate — and does so silently (no `gradientTransition` warning).
#[test]
fn gradient_transition_structural_mismatch_snaps_silently() {
    let _guard = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings(); // drain leftovers

    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "backgroundGradient": gradient_json("#ff0000"),
                "transition": { "backgroundGradient": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);

    let three_stops = json!({
        "type": "linear",
        "stops": [
            { "color": "#0000ff", "position": 0 },
            { "color": "#00ff00", "position": "50%" },
            { "color": "#ff0000", "position": "100%" },
        ],
    });
    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": three_stops } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.1);
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expect_gradients(three_stops.clone(), None),
        "structural mismatch snaps the same frame, no intermediate"
    );

    #[cfg(all(feature = "devtools", debug_assertions))]
    {
        let warnings = crate::diag::take_runtime_warnings();
        assert!(
            !warnings.iter().any(|w| w.kind == "gradientTransition"),
            "a structural mismatch must snap without warning, got {warnings:?}"
        );
    }
}

/// Appear (no gradient → gradient) and unset both snap silently: the
/// component appears at the target with no eased frames, unset removes it
/// and the channel forgets (a later re-add snaps too) — no warnings.
#[test]
fn gradient_appear_and_unset_snap_silently() {
    let _guard = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings(); // drain leftovers

    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "transition": { "backgroundGradient": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);
    assert!(app.world().get::<BackgroundGradient>(e).is_none());

    // Appear: the component shows up AT the target immediately — an eased
    // frame would read a mid color here instead.
    let red = expect_gradients(gradient_json("#ff0000"), None);
    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": gradient_json("#ff0000") } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.25);
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        red,
        "appear snaps to the target immediately"
    );
    tick(&mut app, 0.25);
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        red,
        "no ease is running after an appear"
    );

    // Unset: the component goes away; the channel forgets.
    ops_tx
        .send(vec![update(
            1,
            json!({ "style": {} }),
            &["backgroundGradient"],
        )])
        .unwrap();
    tick(&mut app, 0.25);
    assert!(
        app.world().get::<BackgroundGradient>(e).is_none(),
        "unset removes the component"
    );

    // Re-add: snaps again (the channel forgot the old gradient).
    let blue = expect_gradients(gradient_json("#0000ff"), None);
    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": gradient_json("#0000ff") } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.25);
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        blue,
        "re-add snaps to the target"
    );

    #[cfg(all(feature = "devtools", debug_assertions))]
    {
        let warnings = crate::diag::take_runtime_warnings();
        assert!(
            !warnings.iter().any(|w| w.kind == "gradientTransition"),
            "appear/unset must not warn, got {warnings:?}"
        );
    }
}

/// The two surfaces are independent channels: with only
/// `transition: { borderGradient }`, a border change eases while a
/// simultaneous background change snaps.
#[test]
fn border_gradient_channel_is_independent() {
    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "backgroundGradient": gradient_json("#ff0000"),
                "borderGradient": gradient_json("#ff0000"),
                "transition": { "borderGradient": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);

    ops_tx
        .send(vec![update(
            1,
            json!({ "style": {
                "backgroundGradient": gradient_json("#0000ff"),
                "borderGradient": gradient_json("#0000ff"),
            } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.5);

    // Border eases (mid color)…
    let border = linear_stop_rgba(&app.world().get::<BorderGradient>(e).unwrap().0)[0];
    assert!(
        border[0] > 0.0 && border[0] < 1.0 && border[2] > 0.0 && border[2] < 1.0,
        "border mid-ease strictly between: {border:?}"
    );
    // …while background snapped to the target (no backgroundGradient spec).
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expect_gradients(gradient_json("#0000ff"), None),
        "background without a spec snaps"
    );

    // The border settles bit-exact too.
    tick(&mut app, 0.6);
    assert_eq!(
        app.world().get::<BorderGradient>(e).unwrap().0,
        expect_gradients(gradient_json("#0000ff"), None)
    );
}

/// A childless (unpromoted) node with a static `opacity: 0.5`: the ease
/// folds the opacity at write time (mid-ease stop alphas ≈ lerped alpha ×
/// 0.5) and settle equals `apply_style`'s own folded build bit-exactly
/// (pinned via `fold_gradients` — the split-builder contract).
#[test]
fn gradient_transition_folds_static_opacity() {
    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "opacity": 0.5,
                "backgroundGradient": gradient_json("#ff0000"),
                "transition": { "backgroundGradient": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);
    // Seeded folded: apply_style's own build.
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expect_gradients(gradient_json("#ff0000"), Some(0.5))
    );

    ops_tx
        .send(vec![update(
            1,
            json!({ "style": { "backgroundGradient": gradient_json("#0000ff") } }),
            &[],
        )])
        .unwrap();
    tick(&mut app, 0.5);
    let mid = linear_stop_rgba(&app.world().get::<BackgroundGradient>(e).unwrap().0)[0];
    // Colors lerp on the UNfolded values; the written stop is folded:
    // alpha = lerp(1, 1, 0.5) × 0.5 = 0.5, rgb ≈ (0.5, 0, 0.5).
    assert!(
        (mid[3] - 0.5).abs() < 1e-3,
        "mid-ease alpha = lerped alpha × 0.5: {mid:?}"
    );
    assert!(
        (mid[0] - 0.5).abs() < 1e-3 && (mid[2] - 0.5).abs() < 1e-3,
        "mid-ease rgb: {mid:?}"
    );

    // Settle: bit-exact against the write-time fold of the unfolded stamp,
    // which the split-builder contract pins to apply_style's own build.
    tick(&mut app, 0.6);
    let unfolded = expect_gradients(gradient_json("#0000ff"), None);
    let settled = &app.world().get::<BackgroundGradient>(e).unwrap().0;
    assert_eq!(
        *settled,
        crate::ui_map::fold_gradients(&unfolded, Some(0.5)),
        "settle equals the write-time fold"
    );
    assert_eq!(
        *settled,
        expect_gradients(gradient_json("#0000ff"), Some(0.5)),
        "…which is apply_style's own folded build"
    );
}

/// The alpha-bake rule extends to IDLE gradients: with only
/// `transition: { opacity }` (no gradient spec, no gradient retarget), an
/// opacity ease re-folds the static gradient's stops each frame — gradients
/// fade with the eased alpha like the color folds do — then the compare
/// guard settles the writes (no churn once the ease ends).
#[test]
fn gradient_fold_tracks_eased_opacity() {
    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({ "style": {
                "opacity": 1.0,
                "backgroundGradient": gradient_json("#ff0000"),
                "transition": { "opacity": { "duration": 1000, "easing": "linear" } },
            } }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);

    // Fade to 0.2: half through a 1s linear ease the fold alpha is 0.6 —
    // apply_style's own snap on the delta frame wrote 0.2, so an eased
    // reading here proves the re-fold is live.
    ops_tx
        .send(vec![update(1, json!({ "style": { "opacity": 0.2 } }), &[])])
        .unwrap();
    tick(&mut app, 0.5);
    let mid = linear_stop_rgba(&app.world().get::<BackgroundGradient>(e).unwrap().0)[0];
    assert!(
        (mid[3] - 0.6).abs() < 1e-3,
        "mid-ease fold alpha ~0.6, got {mid:?}"
    );
    assert!(
        (mid[0] - 1.0).abs() < 1e-6,
        "colors untouched (no gradient retarget): {mid:?}"
    );

    // Finish: the fold lands on the target opacity and goes quiet.
    tick(&mut app, 0.6);
    let done = linear_stop_rgba(&app.world().get::<BackgroundGradient>(e).unwrap().0)[0];
    assert!(
        (done[3] - 0.2).abs() < 1e-3,
        "settled fold alpha ~0.2, got {done:?}"
    );
    drain_dirt(&mut app);
    tick(&mut app, 0.25);
    tick(&mut app, 0.25);
    let dirt = app.world().resource::<LayerContentDirt>();
    assert!(!dirt.nodes.contains(&e), "settled: no dirt");
}

/// The hover-restyle path (`apply_interaction_styles`, not an op) retargets
/// the gradient channel exactly like an op-driven delta: a `hoverStyle`
/// gradient with a base `transition: { backgroundGradient }` eases on
/// `Interaction::Hovered` instead of snapping.
#[test]
fn hover_restyle_eases_background_gradient() {
    use bevy::ui::Interaction;
    let (mut app, ops_tx) = ease_app();
    ops_tx
        .send(vec![create(
            1,
            json!({
                "style": {
                    "backgroundGradient": gradient_json("#ff0000"),
                    "transition": { "backgroundGradient": { "duration": 1000, "easing": "linear" } },
                },
                "hoverStyle": { "backgroundGradient": gradient_json("#0000ff") },
            }),
        )])
        .unwrap();
    app.update();
    let e = entity_of(&app, 1);
    drain_dirt(&mut app);

    app.world_mut().entity_mut(e).insert(Interaction::Hovered);
    tick(&mut app, 0.5);
    for rgba in linear_stop_rgba(&app.world().get::<BackgroundGradient>(e).unwrap().0) {
        assert!(
            rgba[0] > 0.0 && rgba[0] < 1.0 && rgba[2] > 0.0 && rgba[2] < 1.0,
            "mid-ease stop strictly between red and blue: {rgba:?}"
        );
    }
    let expected = expect_gradients(gradient_json("#0000ff"), None);
    tick(&mut app, 0.6);
    assert_eq!(
        app.world().get::<BackgroundGradient>(e).unwrap().0,
        expected,
        "settles on the hover gradient"
    );
}
