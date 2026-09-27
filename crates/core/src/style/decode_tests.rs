//! Decode + delta-merge tests for the style store: each property decodes
//! from the wire, and a delta re-runs exactly the writers reading it.
use super::*;
use crate::protocol::animatable::AnimatableField;
use crate::protocol::props::{Props, props_from_json as props};
use crate::protocol::units::Rect;
use crate::style::props::{
    BACKDROP_FILTER, BORDER_RADIUS, CACHE, FILTER, GROUP_ALPHA, IMAGE_RENDERING, LAYOUT_ROUNDING,
    LayerCache, MORPH_FILTER, OPACITY,
};
use crate::style::test_support::{promotes, runs};
use crate::style::writers::*;

/// `groupAlpha` decodes as a plain bool, defaults to absent, and a delta
/// touching it re-evaluates promotion, as one touching `opacity` does.
#[test]
fn group_alpha_decodes_and_promotes() {
    let s: Style = serde_json::from_str(r#"{ "groupAlpha": false }"#).expect("style decodes");
    assert_eq!(s.get(&GROUP_ALPHA).copied(), Some(false));
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.get(&GROUP_ALPHA).copied(), None);

    // Delta-merge re-evaluates promotion for both trigger fields.
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "groupAlpha": false } })),
        &[],
        &[],
    );
    assert!(promotes(&dirty.style));
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "opacity": 0.5 } })),
        &[],
        &[],
    );
    assert!(promotes(&dirty.style));
    let style = cached.style.as_ref().expect("style retained");
    assert_eq!(style.get(&GROUP_ALPHA).copied(), Some(false));
    assert_eq!(style.get(&OPACITY).static_val(), Some(0.5));
}

/// A `borderRadius` delta re-runs the transition writer (its channel target
/// rides `TransitionInput`) alongside the layout writer, and the property
/// takes an `{ animated }` wrapper whose seed decodes as a `Rect`.
#[test]
fn border_radius_reruns_transition_and_decodes_binding() {
    let uniform8: Rect = serde_json::from_value(serde_json::json!(8)).expect("rect decodes");
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "borderRadius": 8 } })),
        &[],
        &[],
    );
    assert!(runs(&dirty.style, &TRANSITION_WRITER));
    assert!(runs(&dirty.style, &LAYOUT_WRITER));
    let style = cached.style.as_ref().expect("style retained");
    assert_eq!(style.get(&BORDER_RADIUS).static_val(), Some(uniform8));

    let s: Style = serde_json::from_value(serde_json::json!({
        "borderRadius": { "animated": { "id": 3 }, "seed": 8 }
    }))
    .expect("style decodes");
    assert!(
        s.get(&BORDER_RADIUS).binding().is_some(),
        "wrapper derives a binding"
    );
    assert_eq!(
        s.get(&BORDER_RADIUS).static_val(),
        None,
        "animated reads as unset"
    );
    assert_eq!(
        s.get(&BORDER_RADIUS).and_then(|a| a.seed()),
        Some(&uniform8)
    );
}

/// `imageRendering` decodes its keywords (unknown → warn + `auto`) and a
/// delta touching it re-runs its own writer only.
#[test]
fn image_rendering_keyword_decodes_and_reruns_its_writer() {
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
        assert_eq!(s.get(&IMAGE_RENDERING).copied(), Some(want), "{wire}");
    }
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.get(&IMAGE_RENDERING).copied(), None);

    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "imageRendering": "trilinear" } })),
        &[],
        &[],
    );
    assert!(runs(&dirty.style, &IMAGE_RENDERING_WRITER));
    assert!(!runs(&dirty.style, &BACKGROUND_IMAGE_WRITER));
    assert_eq!(
        cached
            .style
            .as_ref()
            .and_then(|s| s.get(&IMAGE_RENDERING).copied()),
        Some(ImageRendering::Trilinear)
    );
}

/// `layoutRounding` decodes as a plain boolean (absent = inherit) and a
/// delta touching it re-runs its own writer only — never the layout writer.
#[test]
fn layout_rounding_decodes_and_reruns_its_writer() {
    let s: Style = serde_json::from_str(r#"{ "layoutRounding": false }"#).expect("style decodes");
    assert_eq!(s.get(&LAYOUT_ROUNDING).copied(), Some(false));
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.get(&LAYOUT_ROUNDING).copied(), None);

    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "layoutRounding": false } })),
        &[],
        &[],
    );
    assert!(runs(&dirty.style, &LAYOUT_ROUNDING_WRITER));
    assert!(!runs(&dirty.style, &LAYOUT_WRITER));
    assert_eq!(
        cached
            .style
            .as_ref()
            .and_then(|s| s.get(&LAYOUT_ROUNDING).copied()),
        Some(false)
    );
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": {} })),
        &[],
        &["layoutRounding".to_string()],
    );
    assert!(runs(&dirty.style, &LAYOUT_ROUNDING_WRITER));
    assert_eq!(
        cached
            .style
            .as_ref()
            .and_then(|s| s.get(&LAYOUT_ROUNDING).copied()),
        None
    );
}

/// `cache` decodes its keywords (unknown → warn + default) and a delta
/// touching it drives promotion re-evaluation.
#[test]
fn cache_keyword_decodes_and_promotes() {
    let s: Style = serde_json::from_str(r#"{ "cache": "always" }"#).expect("style decodes");
    assert_eq!(s.get(&CACHE).copied(), Some(LayerCache::Always));
    let s: Style = serde_json::from_str(r#"{ "cache": "auto" }"#).expect("style decodes");
    assert_eq!(s.get(&CACHE).copied(), Some(LayerCache::Auto));
    let s: Style = serde_json::from_str(r#"{ "cache": "never" }"#).expect("style decodes");
    assert_eq!(s.get(&CACHE).copied(), Some(LayerCache::Never));
    let s: Style = serde_json::from_str("{}").expect("style decodes");
    assert_eq!(s.get(&CACHE).copied(), None);
    // Unrecognized keyword: warn + fall back to the default (`auto`).
    let s: Style = serde_json::from_str(r#"{ "cache": "sometimes" }"#).expect("style decodes");
    assert_eq!(s.get(&CACHE).copied(), Some(LayerCache::Auto));

    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "cache": "always" } })),
        &[],
        &[],
    );
    assert!(promotes(&dirty.style));
    assert_eq!(
        cached.style.as_ref().and_then(|s| s.get(&CACHE).copied()),
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
    let chain = s.get(&FILTER).expect("filter present");
    assert_eq!(chain.0.len(), 1);
    assert_eq!(chain.0[0].name, "blur");
    assert_eq!(chain.0[0].params["radius"], serde_json::json!(4));

    // An array preserves declaration order (chain order = pass order).
    let s: Style =
        serde_json::from_str(r#"{ "filter": [{ "name": "blur" }, { "name": "grayscale" }] }"#)
            .expect("filter decodes");
    let names: Vec<&str> = s
        .get(&FILTER)
        .as_ref()
        .expect("filter present")
        .0
        .iter()
        .map(|u| u.name.as_str())
        .collect();
    assert_eq!(names, ["blur", "grayscale"]);

    // A malformed entry degrades the whole chain to empty without
    // aborting the Style — the sibling property still decodes.
    let s: Style = serde_json::from_str(r#"{ "filter": [{ "name": "blur" }, 3], "opacity": 0.5 }"#)
        .expect("a bad filter entry must not abort the style");
    assert_eq!(s.get(&FILTER), Some(&FilterChain::default()));
    assert_eq!(s.get(&OPACITY).static_val(), Some(0.5));
}

/// A `filter` delta re-runs the filter writer (the `FilterInput` re-stamp)
/// and re-evaluates promotion; a variant carrying a filter rides the
/// `hover_style` flag, which the reconciler also treats as a promotion
/// trigger (promotion unions every style state).
#[test]
fn filter_delta_reruns_its_writer_and_promotes() {
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "filter": { "name": "blur" } } })),
        &[],
        &[],
    );
    assert!(runs(&dirty.style, &FILTER_WRITER));
    assert!(promotes(&dirty.style));

    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "hoverStyle": { "filter": { "name": "blur" } } })),
        &[],
        &[],
    );
    assert!(dirty.hover_style);
    let hover = cached.hover_style.as_ref().expect("variant retained");
    assert!(hover.get(&FILTER).is_some(), "variant carries the chain");
}

/// A `backdropFilter` delta re-runs its writer (the `BackdropInput`
/// re-stamp) and re-evaluates promotion — and never runs the filter writer:
/// the two chains are independent channels. `styleUnset` does the same, so
/// the removal reaches both the writer and the evaluator.
#[test]
fn backdrop_filter_delta_reruns_its_writer_and_promotes() {
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({ "style": { "backdropFilter": { "name": "blur" } } })),
        &[],
        &[],
    );
    assert!(runs(&dirty.style, &BACKDROP_FILTER_WRITER));
    assert!(promotes(&dirty.style));
    assert!(!runs(&dirty.style, &FILTER_WRITER));
    assert!(
        cached
            .style
            .as_ref()
            .is_some_and(|s| s.get(&BACKDROP_FILTER).is_some())
    );

    let (dirty, _) = cached.merge_delta_node(Props::default(), &[], &["backdropFilter".into()]);
    assert!(runs(&dirty.style, &BACKDROP_FILTER_WRITER));
    assert!(promotes(&dirty.style));
    assert!(
        cached
            .style
            .as_ref()
            .is_some_and(|s| s.get(&BACKDROP_FILTER).is_none())
    );
}

/// A `morphFilter` delta re-runs its writer (the `MorphInput` re-stamp) and
/// the transition writer (the morph channel's input), and re-evaluates
/// promotion — never the filter/backdrop writers. `styleUnset` does the
/// same; a malformed value degrades to `None` without aborting the
/// containing `Style`.
#[test]
fn morph_filter_delta_reruns_its_writers_and_promotes() {
    let mut cached = Props::default();
    let (dirty, _) = cached.merge_delta_node(
        props(serde_json::json!({
            "style": { "morphFilter": { "key": "a", "name": "crossfade" } }
        })),
        &[],
        &[],
    );
    assert!(runs(&dirty.style, &MORPH_FILTER_WRITER));
    assert!(promotes(&dirty.style));
    assert!(!runs(&dirty.style, &FILTER_WRITER));
    assert!(!runs(&dirty.style, &BACKDROP_FILTER_WRITER));
    // The morph channel lives on the transition engine (built-in default
    // timing), so a morph delta re-stamps the transition input.
    assert!(runs(&dirty.style, &TRANSITION_WRITER));
    let morph = cached
        .style
        .as_ref()
        .and_then(|s| s.get(&MORPH_FILTER))
        .expect("morph retained");
    assert_eq!(morph.key, serde_json::json!("a"));
    assert_eq!(morph.filter.name, "crossfade");

    let (dirty, _) = cached.merge_delta_node(Props::default(), &[], &["morphFilter".into()]);
    assert!(runs(&dirty.style, &MORPH_FILTER_WRITER));
    assert!(promotes(&dirty.style));
    assert!(
        cached
            .style
            .as_ref()
            .is_some_and(|s| s.get(&MORPH_FILTER).is_none())
    );

    // Malformed (missing key) degrades to None; the sibling property lives.
    let s: Style =
        serde_json::from_str(r#"{ "morphFilter": { "name": "crossfade" }, "opacity": 0.5 }"#)
            .expect("a bad morphFilter must not abort the style");
    assert!(s.get(&MORPH_FILTER).is_none());
    assert_eq!(s.get(&OPACITY).static_val(), Some(0.5));
}
