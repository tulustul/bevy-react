//! Decode + delta-merge tests for the `Style` wire type (`style_fields!` guards).
use super::*;
use crate::protocol::animatable::AnimatableField;
use crate::protocol::props::{Props, props_from_json as props};

/// `groupAlpha` decodes as a plain bool, defaults to absent, and its wire
/// delta dirties the `LAYER` group (the promotion evaluator's trigger),
/// as does `opacity`.
#[test]
fn group_alpha_decodes_and_dirties_layer() {
    let s: Style = serde_json::from_str(r#"{ "groupAlpha": false }"#).expect("style decodes");
    assert_eq!(s.group_alpha, Some(false));
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.group_alpha, None);

    // Delta-merge marks the LAYER group for both trigger fields.
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "groupAlpha": false } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::LAYER));
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "opacity": 0.5 } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::LAYER));
    let style = cached.style.as_ref().expect("style retained");
    assert_eq!(style.group_alpha, Some(false));
    assert_eq!(style.opacity.static_val(), Some(0.5));
}

/// A `borderRadius` delta marks TRANSITION (its channel target rides
/// `TransitionInput`) alongside LAYOUT, and the field takes an
/// `{ animated }` wrapper whose seed decodes as a `Rect`.
#[test]
fn border_radius_dirties_transition_and_decodes_binding() {
    let uniform8: Rect = serde_json::from_value(serde_json::json!(8)).expect("rect decodes");
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "borderRadius": 8 } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::TRANSITION));
    assert!(dirty.style.intersects(style_groups::LAYOUT));
    let style = cached.style.as_ref().expect("style retained");
    assert_eq!(style.border_radius.static_val(), Some(uniform8));

    let s: Style = serde_json::from_value(serde_json::json!({
        "borderRadius": { "animated": { "id": 3 }, "seed": 8 }
    }))
    .expect("style decodes");
    assert!(
        s.border_radius.binding().is_some(),
        "wrapper derives a binding"
    );
    assert_eq!(
        s.border_radius.static_val(),
        None,
        "animated reads as unset"
    );
    assert_eq!(
        s.border_radius.as_ref().and_then(|a| a.seed()),
        Some(&uniform8)
    );
}

/// `imageRendering` decodes its keywords (unknown → warn + `auto`) and a
/// delta touching it marks the IMAGE_RENDERING group.
#[test]
fn image_rendering_keyword_decodes_and_dirties_group() {
    use crate::image_rendering::ImageRendering;
    for (wire, want) in [
        ("auto", ImageRendering::Auto),
        ("bilinear", ImageRendering::Bilinear),
        ("trilinear", ImageRendering::Trilinear),
        ("nearest", ImageRendering::Nearest),
        // Unrecognized (incl. the CSS words we deliberately don't alias).
        ("pixelated", ImageRendering::Auto),
    ] {
        let s: Style = serde_json::from_str(&format!(r#"{{ "imageRendering": "{wire}" }}"#))
            .expect("style decodes");
        assert_eq!(s.image_rendering, Some(want), "{wire}");
    }
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.image_rendering, None);

    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "imageRendering": "trilinear" } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::IMAGE_RENDERING));
    assert!(!dirty.style.intersects(style_groups::BG_IMAGE));
    assert_eq!(
        cached.style.as_ref().and_then(|s| s.image_rendering),
        Some(ImageRendering::Trilinear)
    );
}

/// `layoutRounding` decodes as a plain boolean (absent = inherit) and a
/// delta touching it marks the LAYOUT_ROUNDING group only.
#[test]
fn layout_rounding_decodes_and_dirties_group() {
    let s: Style = serde_json::from_str(r#"{ "layoutRounding": false }"#).expect("style decodes");
    assert_eq!(s.layout_rounding, Some(false));
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.layout_rounding, None);

    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "layoutRounding": false } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::LAYOUT_ROUNDING));
    assert!(!dirty.style.intersects(style_groups::LAYOUT));
    assert_eq!(
        cached.style.as_ref().and_then(|s| s.layout_rounding),
        Some(false)
    );
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": {} })),
        &[],
        &["layoutRounding".to_string()],
    );
    assert!(dirty.style.intersects(style_groups::LAYOUT_ROUNDING));
    assert_eq!(cached.style.as_ref().and_then(|s| s.layout_rounding), None);
}

/// `cache` decodes its keywords (unknown → warn + default) and a delta
/// touching it marks the LAYER group, driving promotion re-evaluation.
#[test]
fn cache_keyword_decodes_and_dirties_layer() {
    let s: Style = serde_json::from_str(r#"{ "cache": "always" }"#).expect("style decodes");
    assert_eq!(s.cache, Some(LayerCache::Always));
    let s: Style = serde_json::from_str(r#"{ "cache": "auto" }"#).expect("style decodes");
    assert_eq!(s.cache, Some(LayerCache::Auto));
    let s: Style = serde_json::from_str(r#"{ "cache": "never" }"#).expect("style decodes");
    assert_eq!(s.cache, Some(LayerCache::Never));
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.cache, None);
    // Unrecognized keyword: warn + fall back to the default (`auto`).
    let s: Style = serde_json::from_str(r#"{ "cache": "sometimes" }"#).expect("style decodes");
    assert_eq!(s.cache, Some(LayerCache::Auto));

    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "cache": "always" } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::LAYER));
    assert_eq!(
        cached.style.as_ref().and_then(|s| s.cache),
        Some(LayerCache::Always)
    );
}

/// A `filter` decodes *through* `Style` into the layer-based chain (the
/// chain's own decode is unit-tested in `crate::filters`): a single
/// `{name, params}` object is a 1-element chain, an array preserves order,
/// and a malformed entry degrades the whole chain to empty without
/// aborting the containing `Style`.
#[test]
fn deserializes_filter_chain() {
    use crate::filters::FilterChain;

    // A single object is a 1-element chain; params stay a raw map.
    let s: Style =
        serde_json::from_str(r#"{ "filter": { "name": "blur", "params": { "radius": 4 } } }"#)
            .expect("filter decodes");
    let chain = s.filter.expect("filter present");
    assert_eq!(chain.0.len(), 1);
    assert_eq!(chain.0[0].name, "blur");
    assert_eq!(chain.0[0].params["radius"], serde_json::json!(4));

    // An array preserves declaration order (chain order = pass order).
    let s: Style =
        serde_json::from_str(r#"{ "filter": [{ "name": "blur" }, { "name": "grayscale" }] }"#)
            .expect("filter decodes");
    let names: Vec<&str> = s
        .filter
        .as_ref()
        .expect("filter present")
        .0
        .iter()
        .map(|u| u.name.as_str())
        .collect();
    assert_eq!(names, ["blur", "grayscale"]);

    // A malformed entry degrades the whole chain to empty without
    // aborting the Style — the sibling field still decodes.
    let s: Style = serde_json::from_str(r#"{ "filter": [{ "name": "blur" }, 3], "opacity": 0.5 }"#)
        .expect("a bad filter entry must not abort the style");
    assert_eq!(s.filter, Some(FilterChain::default()));
    assert_eq!(s.opacity.static_val(), Some(0.5));
}

/// A `filter` delta dirties FILTER (the `FilterInput` re-stamp) and LAYER
/// (the promotion evaluator's trigger); a variant carrying a filter rides
/// the `hover_style` flag, which the reconciler also treats as a layer
/// trigger (variant filters promote — the field is `overlay`).
#[test]
fn filter_delta_dirties_filter_and_layer() {
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "filter": { "name": "blur" } } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::FILTER));
    assert!(dirty.style.intersects(style_groups::LAYER));

    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "hoverStyle": { "filter": { "name": "blur" } } })),
        &[],
        &[],
    );
    assert!(dirty.hover_style);
    let hover = cached.hover_style.as_ref().expect("variant retained");
    assert!(hover.filter.is_some(), "variant carries the chain");
}

/// A `backdropFilter` delta dirties BACKDROP (the `BackdropInput`
/// re-stamp) and LAYER (the promotion trigger) — and never FILTER: the
/// two chains are independent channels. `styleUnset` re-fires the same
/// groups so the removal reaches the apply arm and the evaluator.
#[test]
fn backdrop_filter_delta_dirties_backdrop_and_layer() {
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({ "style": { "backdropFilter": { "name": "blur" } } })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::BACKDROP));
    assert!(dirty.style.intersects(style_groups::LAYER));
    assert!(!dirty.style.intersects(style_groups::FILTER));
    assert!(
        cached
            .style
            .as_ref()
            .is_some_and(|s| s.backdrop_filter.is_some())
    );

    let (dirty, _) = cached.merge_delta(Props::default(), &[], &["backdropFilter".into()]);
    assert!(dirty.style.intersects(style_groups::BACKDROP));
    assert!(dirty.style.intersects(style_groups::LAYER));
    assert!(
        cached
            .style
            .as_ref()
            .is_some_and(|s| s.backdrop_filter.is_none())
    );
}

/// A `morphFilter` delta dirties MORPH (the `MorphInput` re-stamp — which
/// also routes to `apply_transition`) and LAYER (the promotion trigger) —
/// never FILTER/BACKDROP/TRANSITION. `styleUnset` re-fires the same
/// groups; a malformed value degrades to `None` without aborting the
/// containing `Style`.
#[test]
fn morph_filter_delta_dirties_morph_and_layer() {
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta(
        props(serde_json::json!({
            "style": { "morphFilter": { "key": "a", "name": "crossfade" } }
        })),
        &[],
        &[],
    );
    assert!(dirty.style.intersects(style_groups::MORPH));
    assert!(dirty.style.intersects(style_groups::LAYER));
    assert!(!dirty.style.intersects(style_groups::FILTER));
    assert!(!dirty.style.intersects(style_groups::BACKDROP));
    assert!(!dirty.style.intersects(style_groups::TRANSITION));
    let morph = cached
        .style
        .as_ref()
        .and_then(|s| s.morph_filter.as_ref())
        .expect("morph retained");
    assert_eq!(morph.key, serde_json::json!("a"));
    assert_eq!(morph.filter.name, "crossfade");

    let (dirty, _) = cached.merge_delta(Props::default(), &[], &["morphFilter".into()]);
    assert!(dirty.style.intersects(style_groups::MORPH));
    assert!(dirty.style.intersects(style_groups::LAYER));
    assert!(
        cached
            .style
            .as_ref()
            .is_some_and(|s| s.morph_filter.is_none())
    );

    // Malformed (missing key) degrades to None; the sibling field lives.
    let s: Style =
        serde_json::from_str(r#"{ "morphFilter": { "name": "crossfade" }, "opacity": 0.5 }"#)
            .expect("a bad morphFilter must not abort the style");
    assert!(s.morph_filter.is_none());
    assert_eq!(s.opacity.static_val(), Some(0.5));
}

/// Compile-time completeness guard: a `Style` struct literal built from the
/// field table must name every field — adding a `Style` field without
/// extending `with_style_fields!` fails this with E0063 (missing field).
#[test]
fn style_field_table_is_complete() {
    macro_rules! build_full {
        ($(($f:ident, $name:literal, $g:tt, $ov:ident),)*) => {
            Style { $($f: None,)* }
        };
    }
    let _style: Style = with_style_fields!(build_full);
}

/// Every table wire name must equal serde's `rename_all = "camelCase"`
/// rendering of the field ident, or `unset_field`/the JS delta builder
/// would miss the field.
#[test]
fn style_wire_names_match_serde_rename() {
    fn camel(s: &str) -> String {
        let mut out = String::new();
        let mut up = false;
        for c in s.chars() {
            if c == '_' {
                up = true;
            } else if up {
                out.extend(c.to_uppercase());
                up = false;
            } else {
                out.push(c);
            }
        }
        out
    }
    macro_rules! check {
        ($(($f:ident, $name:literal, $g:tt, $ov:ident),)*) => {
            $( assert_eq!(camel(stringify!($f)), $name, "table wire name for `{}`", stringify!($f)); )*
        };
    }
    with_style_fields!(check);
}
