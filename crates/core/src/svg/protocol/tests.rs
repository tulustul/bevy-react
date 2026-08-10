//! Decode tests for the shape wire types. Warn assertions use the devtools
//! decode sink, which is thread-local — draining it per-test is
//! parallel-safe (the `filters::wire` test precedent).

use bevy::color::Srgba;
use bevy::math::Vec2;

use super::{
    FillRuleKind, LinecapKind, LinejoinKind, ShapeAttrs, ShapePaint, ShapeTransform, ViewBox,
};
use crate::protocol::AnimatableField;

fn attrs(json: serde_json::Value) -> ShapeAttrs {
    serde_json::from_value(json).expect("shape attrs decode never fails the batch")
}

#[cfg(all(feature = "devtools", debug_assertions))]
fn drain_warn_kinds() -> Vec<&'static str> {
    crate::diag::take_decode_warnings()
        .into_iter()
        .map(|w| w.kind)
        .collect()
}

/// Typical attr sets of each shape decode into the expected fields, leaving
/// the rest `None`.
#[test]
fn per_shape_round_trips() {
    let circle = attrs(serde_json::json!({ "cx": 50, "cy": 40.5, "r": 10, "fill": "#f00" }));
    assert_eq!(
        (
            circle.cx.static_val(),
            circle.cy.static_val(),
            circle.r.static_val()
        ),
        (Some(50.0), Some(40.5), Some(10.0))
    );
    assert_eq!(circle.fill, Some(ShapePaint::Color(Srgba::RED)));
    assert_eq!(circle.stroke, None, "absent attrs stay None");

    let rect = attrs(serde_json::json!({ "x": 1, "y": 2, "width": 30, "height": 40, "rx": 4 }));
    assert_eq!(
        (
            rect.x.static_val(),
            rect.y.static_val(),
            rect.width.static_val(),
            rect.height.static_val(),
            rect.rx.static_val(),
            rect.ry.static_val(),
        ),
        (
            Some(1.0),
            Some(2.0),
            Some(30.0),
            Some(40.0),
            Some(4.0),
            None
        )
    );

    let line = attrs(serde_json::json!({
        "x1": 0, "y1": 0, "x2": 10, "y2": 5,
        "stroke": "#00ff00", "strokeWidth": 2.5,
    }));
    assert_eq!(
        (
            line.x1.static_val(),
            line.y1.static_val(),
            line.x2.static_val(),
            line.y2.static_val()
        ),
        (Some(0.0), Some(0.0), Some(10.0), Some(5.0))
    );
    assert_eq!(line.stroke, Some(ShapePaint::Color(Srgba::GREEN)));
    assert_eq!(
        line.stroke_width.static_val(),
        Some(2.5),
        "camelCase wire name decodes"
    );

    let polygon = attrs(serde_json::json!({ "points": [0, 0, 10, 5, 20, 0] }));
    assert_eq!(
        polygon.points.as_deref(),
        Some(
            &[
                Vec2::new(0.0, 0.0),
                Vec2::new(10.0, 5.0),
                Vec2::new(20.0, 0.0)
            ][..]
        )
    );

    let path = attrs(serde_json::json!({ "d": "M0 0 L10 10", "fillRule": "evenodd" }));
    assert_eq!(path.d.as_ref().map(|p| p.0.len()), Some(2));
    assert_eq!(path.fill_rule, Some(FillRuleKind::EvenOdd));
}

/// An odd-length `points` array warns and drops the field; the rest of the
/// object still decodes.
#[test]
fn odd_points_warn_and_drop() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({ "points": [0, 0, 10], "cx": 5 }));
    assert_eq!(a.points, None);
    assert_eq!(
        a.cx.static_val(),
        Some(5.0),
        "sibling fields survive the drop"
    );
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["shapePoints"]);
}

/// Paints: a CSS color parses, `"none"` is the explicit don't-paint keyword
/// (distinct from absent), garbage warns and drops.
#[test]
fn paints_decode_none_keyword_and_drop_garbage() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({ "fill": "none", "stroke": "#f00" }));
    assert_eq!(a.fill, Some(ShapePaint::None));
    assert_eq!(a.stroke, Some(ShapePaint::Color(Srgba::RED)));
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(
        drain_warn_kinds(),
        Vec::<&str>::new(),
        "clean decode is silent"
    );

    let bad = attrs(serde_json::json!({ "fill": "notacolor" }));
    assert_eq!(bad.fill, None);
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["shapePaint"]);
}

/// Keyword enums decode; an unrecognized keyword warns (`shapeEnum`) and
/// drops the field.
#[test]
fn keyword_enums_decode_and_drop_garbage() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({
        "fillRule": "nonzero",
        "strokeLinecap": "square",
        "strokeLinejoin": "bevel",
    }));
    assert_eq!(a.fill_rule, Some(FillRuleKind::NonZero));
    assert_eq!(a.stroke_linecap, Some(LinecapKind::Square));
    assert_eq!(a.stroke_linejoin, Some(LinejoinKind::Bevel));

    let bad = attrs(serde_json::json!({ "strokeLinecap": "banana" }));
    assert_eq!(bad.stroke_linecap, None);
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["shapeEnum"]);
}

/// A garbage `d` warns (`shapePath`) and drops the whole path — never a
/// partial segment list.
#[test]
fn garbage_path_warns_and_drops() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({ "d": "M10 10 L nope" }));
    assert_eq!(a.d, None);
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["shapePath"]);
}

/// Arcs are unsupported in v1: the whole path drops with the `shapePath`
/// warning naming the limitation.
#[test]
fn arc_path_warns_and_drops() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({ "d": "M0 0 A5 5 0 0 1 10 10" }));
    assert_eq!(a.d, None);
    #[cfg(all(feature = "devtools", debug_assertions))]
    {
        let warns = crate::diag::take_decode_warnings();
        assert_eq!(warns.len(), 1);
        assert_eq!(warns[0].kind, "shapePath");
        assert!(
            warns[0].message.contains("arc segments unsupported"),
            "{}",
            warns[0].message
        );
    }
}

/// A numeric attr accepts the inline `{ animated: …, seed? }` wrapper (the
/// style-field wire shape, seed sibling to `animated` inside the wrapper):
/// the field decodes Animated carrying the binding, the optional seed is
/// readable as the static value in the wrapper's place (`static_or_seed`),
/// and a seed-less wrapper reads as absent until the driver writes.
#[test]
fn animated_wrapper_decodes_on_numeric_attrs() {
    use crate::animations::protocol::Binding;
    let a = attrs(serde_json::json!({
        "r": { "animated": { "id": 7 }, "seed": 4 },
        "cx": { "animated": { "id": 3 } },
        "cy": 5,
    }));
    assert_eq!(a.r.binding(), Some(&Binding::Shared { id: 7 }));
    assert_eq!(
        a.r.static_val(),
        None,
        "an animated attr has no static value"
    );
    assert_eq!(
        a.r.static_or_seed(),
        Some(4.0),
        "the seed reads in its place"
    );
    assert_eq!(a.cx.binding(), Some(&Binding::Shared { id: 3 }));
    assert_eq!(
        a.cx.static_or_seed(),
        None,
        "seed-less wrapper reads as absent (attr default applies)"
    );
    assert_eq!(a.cy.static_val(), Some(5.0));
    assert_eq!(a.cy.static_or_seed(), Some(5.0));
}

/// A malformed `seed` (non-numeric on an `f32` attr) warns (`styleBinding`)
/// and drops to `None` — the binding itself is KEPT (the driver still runs;
/// only the static stand-in is lost).
#[test]
fn malformed_seed_warns_and_keeps_binding() {
    use crate::animations::protocol::Binding;
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({
        "r": { "animated": { "id": 7 }, "seed": "garbage" },
    }));
    assert_eq!(a.r.binding(), Some(&Binding::Shared { id: 7 }));
    assert_eq!(
        a.r.static_or_seed(),
        None,
        "bad seed drops, reads as absent"
    );
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["styleBinding"]);
}

/// `viewBox` is not animatable: an object value (an `{ animated }` wrapper or
/// any other) warns (`viewBox`) and drops the field instead of hard-erroring
/// the containing struct (= aborting the op batch). Same never-fail rule as
/// the shape-field visitors.
#[test]
fn view_box_object_warns_and_drops() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    #[derive(serde::Deserialize, Default)]
    #[serde(default)]
    struct Holder {
        #[serde(deserialize_with = "super::de_view_box")]
        vb: Option<ViewBox>,
        w: f32,
    }
    let h: Holder = serde_json::from_value(serde_json::json!({
        "vb": { "animated": { "id": 7 } },
        "w": 7.0,
    }))
    .expect("an object viewBox must not abort the containing struct");
    assert_eq!(h.vb, None);
    assert_eq!(h.w, 7.0, "sibling fields survive the drop");
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["viewBox"]);
}

/// Wire compat pin: a PLAIN number decodes exactly as before the wrapper
/// support — `Animatable::Static`, visible through `static_val` — with no JS
/// change needed.
#[test]
fn plain_number_still_decodes_static() {
    let a = attrs(serde_json::json!({ "r": 4 }));
    assert_eq!(a.r, Some(crate::protocol::Animatable::Static(4.0)));
    assert_eq!(a.r.static_val(), Some(4.0));
    // PartialEq holds across the wrapper type (the compare-before-write
    // discipline in `update_shape_attrs` relies on it).
    let b = attrs(serde_json::json!({ "r": 4.0 }));
    assert_eq!(a, b);
    let c = attrs(serde_json::json!({ "r": { "animated": { "id": 7 } } }));
    assert_ne!(a, c);
}

/// A wrapper on a NON-numeric field is not animatable: it must warn (the
/// field's own kind) and drop the field — never silently accept, never fail
/// the batch.
#[test]
fn animated_wrapper_on_non_numeric_warns_and_drops() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let wrapper = serde_json::json!({ "animated": { "id": 7 } });
    let a = attrs(serde_json::json!({
        "fill": wrapper, "d": wrapper, "points": wrapper,
        "strokeLinecap": wrapper, "transform": wrapper,
    }));
    assert_eq!(a.fill, None);
    assert_eq!(a.d, None);
    assert_eq!(a.points, None);
    assert_eq!(a.stroke_linecap, None);
    assert_eq!(a.transform, None);
    #[cfg(all(feature = "devtools", debug_assertions))]
    {
        let mut kinds = drain_warn_kinds();
        kinds.sort_unstable();
        assert_eq!(
            kinds,
            vec![
                "shapeEnum",
                "shapePaint",
                "shapePath",
                "shapePoints",
                "shapeTransform"
            ]
        );
    }
}

fn assert_mat_approx(got: ShapeTransform, want: [f32; 6]) {
    for (i, (g, w)) in got.0.iter().zip(want).enumerate() {
        assert!(
            (g - w).abs() < 1e-5,
            "matrix[{i}]: got {g}, want {w} ({got:?})"
        );
    }
}

/// `translate(5 10) rotate(90)` composes in list order: T·R.
#[test]
fn transform_composes_in_list_order() {
    let a = attrs(serde_json::json!({ "transform": "translate(5 10) rotate(90)" }));
    assert_mat_approx(a.transform.unwrap(), [0.0, 1.0, -1.0, 0.0, 5.0, 10.0]);
    // rotate about a point (svgtypes splits it into T·R·T): rotating (2, 0)
    // by 90° about (1, 0) lands on (1, 1) — spot-check via the matrix.
    let a = attrs(serde_json::json!({ "transform": "rotate(90 1 0)" }));
    let m = a.transform.unwrap().0;
    let (x, y) = (2.0f32, 0.0f32);
    let px = m[0] * x + m[2] * y + m[4];
    let py = m[1] * x + m[3] * y + m[5];
    assert!(
        (px - 1.0).abs() < 1e-5 && (py - 1.0).abs() < 1e-5,
        "({px}, {py})"
    );
}

/// `scale(s)` uses the one-arg uniform form; identity decode for an empty
/// list.
#[test]
fn transform_scale_and_empty() {
    let a = attrs(serde_json::json!({ "transform": "scale(2)" }));
    assert_mat_approx(a.transform.unwrap(), [2.0, 0.0, 0.0, 2.0, 0.0, 0.0]);
    let a = attrs(serde_json::json!({ "transform": "" }));
    assert_eq!(a.transform, Some(ShapeTransform::default()));
}

/// Unsupported transform functions (`skewX`, `matrix`) warn
/// (`shapeTransform`) and drop the field whole.
#[test]
fn unsupported_transform_warns_and_drops() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({ "transform": "skewX(3)" }));
    assert_eq!(a.transform, None);
    let b = attrs(serde_json::json!({ "transform": "matrix(1 0 0 1 0 0)" }));
    assert_eq!(b.transform, None);
    let c = attrs(serde_json::json!({ "transform": "translate(nope)" }));
    assert_eq!(c.transform, None);
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(
        drain_warn_kinds(),
        vec!["shapeTransform", "shapeTransform", "shapeTransform"]
    );
}

/// `ViewBox` parses both whitespace- and comma-separated forms; a
/// non-positive size or garbage warns (`viewBox`) and drops. (Wire-name and
/// merge behavior of the `viewBox` *prop* are covered in
/// `crate::protocol::tests`.)
#[test]
fn view_box_parses_and_validates() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let expected = ViewBox {
        min: Vec2::ZERO,
        size: Vec2::new(100.0, 50.0),
    };
    assert_eq!(ViewBox::parse("0 0 100 50").unwrap(), expected);
    assert_eq!(ViewBox::parse("0,0,100,50").unwrap(), expected);
    assert!(
        ViewBox::parse("0 0 -1 5").is_err(),
        "negative size rejected"
    );
    assert!(
        ViewBox::parse("0 0 100").is_err(),
        "too few numbers rejected"
    );

    // Through the field deserializer: warn + drop, not a decode failure.
    #[derive(serde::Deserialize, Default)]
    #[serde(default)]
    struct Holder {
        #[serde(deserialize_with = "super::de_view_box")]
        vb: Option<ViewBox>,
        w: f32,
    }
    let h: Holder = serde_json::from_value(serde_json::json!({ "vb": "0 0 -1 5", "w": 7.0 }))
        .expect("bad viewBox must not abort the containing struct");
    assert_eq!(h.vb, None);
    assert_eq!(h.w, 7.0);
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["viewBox"]);
}

/// `transition` rides the shape object: a per-attr map of timing specs keyed
/// by the numeric attr wire names. Present → `Some` spec with the named
/// entries decoded (`ChannelTransition`, the style-transition timing type);
/// absent → `None`.
#[test]
fn shape_transition_decodes_per_attr_specs() {
    let a = attrs(serde_json::json!({
        "cx": 30.0,
        "transition": {
            "cx": { "duration": 200 },
            "strokeWidth": { "stiffness": 120.0 },
        },
    }));
    let spec = a.transition.as_ref().expect("transition decodes");
    let cx = spec.for_attr("cx").expect("cx entry present");
    assert_eq!(cx.duration.map(crate::protocol::Time::seconds), Some(0.2));
    assert!(
        spec.for_attr("strokeWidth")
            .is_some_and(|s| s.stiffness == Some(120.0)),
        "wire names key the map (strokeWidth, not stroke_width)"
    );
    assert!(spec.for_attr("r").is_none(), "unlisted attrs have no entry");

    // Absent → None; spec participates in PartialEq (a spec-only change is a
    // real attrs change — atomic replace + repaint).
    let b = attrs(serde_json::json!({ "cx": 30.0 }));
    assert_eq!(b.transition, None);
    assert_ne!(a, b);
}

/// Unknown or non-numeric keys (`fill` isn't easeable) and malformed spec
/// values warn (`shapeTransition`) and drop THAT KEY — the rest of the spec
/// survives (per-key drop, not whole-spec).
#[test]
fn shape_transition_unknown_key_warns_and_drops_that_key() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({
        "transition": {
            "cx": { "duration": 100 },
            "fill": { "duration": 100 },
            "r": "garbage",
        },
    }));
    let spec = a.transition.as_ref().expect("valid keys survive");
    assert!(spec.for_attr("cx").is_some());
    assert!(spec.for_attr("fill").is_none(), "non-numeric key dropped");
    assert!(spec.for_attr("r").is_none(), "malformed spec value dropped");
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(
        drain_warn_kinds(),
        vec!["shapeTransition", "shapeTransition"]
    );
}

/// A non-object `transition` value warns and drops the whole field — never
/// fails the batch (the module's never-fail rule).
#[test]
fn shape_transition_non_object_warns_and_drops() {
    #[cfg(all(feature = "devtools", debug_assertions))]
    let _ = crate::diag::take_decode_warnings();
    let a = attrs(serde_json::json!({ "cx": 5.0, "transition": "fast" }));
    assert_eq!(a.transition, None);
    assert_eq!(a.cx.static_val(), Some(5.0), "sibling attrs survive");
    #[cfg(all(feature = "devtools", debug_assertions))]
    assert_eq!(drain_warn_kinds(), vec!["shapeTransition"]);
}
