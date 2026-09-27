//! Cross-language table guards: the JS devtools panel keeps a hand-maintained
//! warning-kind table (`js/src/devtools/warnings.ts`); this test pins it to
//! the Rust warn sites so growth on either side can't silently diverge. (The
//! style-field table comes from Rust at runtime — `style_fields.rs`.)

/// `warnings.ts`'s `KIND_FIELDS` must know every warning kind Rust emits,
/// or that kind degrades to a broad all-style-fields value scan. Kind
/// literals live at the `decode_warn` call sites (the `protocol/` submodules,
/// `scrollbar.rs`, `animations/protocol.rs`, `svg/protocol.rs`) and the
/// `diag::report` sites
/// (`ui_map.rs`, `cursor.rs`, `filters.rs`, `layer.rs`,
/// `animations/apply/{filter_params,gradient,shape,warn}.rs`, `svg/image.rs`,
/// `reconcile/svg_ops.rs`, `reconcile/stamps.rs`,
/// `transition/gradient_channel.rs`); extend
/// BOTH this list and the table when
/// adding one. (`length`/`angle`/`time`/`unknownStyleField` are
/// deliberately table-less — they're the broad-scan kinds; a keyword
/// property's kind reaches the table at install from the style registry —
/// `devtools/style_fields.rs`.)
#[test]
fn js_warning_kind_table_covers_known_kinds() {
    let warnings_ts = include_str!("../../../../js/src/devtools/warnings.ts");
    for kind in [
        "fontSize",
        "fontWeight",
        "rect",
        "gridTrack",
        "gridPlacement",
        "borderColor",
        "filterParams",
        "filterUnknown",
        "filterBinding",
        "backdropFilterParams",
        "backdropFilterUnknown",
        "backdropFilterBinding",
        "morphFilterParams",
        "morphFilterUnknown",
        "morphFilterBinding",
        "gradientTransition",
        "gradientBinding",
        "scrollbar",
        "styleBinding",
        "backgroundImage",
        "imageRendering",
        "nameAmbiguous",
        "svgImageAttrs",
        "svgShapeScroll",
        "viewBox",
        "shapePath",
        "shapePoints",
        "shapePaint",
        "shapeEnum",
        "shapeTransform",
        "shapeTransition",
        "shapeBinding",
        "spanLayerStyle",
        "spanHandlers",
        "color",
        "fontFamily",
        "cursor",
        "lineHeight",
        "letterSpacing",
        "precompileFilters",
        "layerCamera",
        "featureMissing",
        "extProp",
    ] {
        assert!(
            warnings_ts.contains(&format!("{kind}:"))
                || warnings_ts.contains(&format!("\"{kind}\":")),
            "js/src/devtools/warnings.ts KIND_FIELDS is missing kind \"{kind}\""
        );
    }
}
