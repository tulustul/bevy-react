//! Cross-language table guards: the JS devtools panel keeps hand-maintained
//! field/kind tables (`js/src/devtools/*.ts`); these tests pin them to the
//! Rust wire surface so growth on either side can't silently diverge.

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
/// adding one. (`length`/`angle`/`time` are deliberately table-less —
/// they're the broad-scan kinds.)
#[test]
fn js_warning_kind_table_covers_known_kinds() {
    let warnings_ts = include_str!("../../../../js/src/devtools/warnings.ts");
    for kind in [
        "display",
        "boxSizing",
        "positionType",
        "overflow",
        "alignItems",
        "justifyItems",
        "alignSelf",
        "justifySelf",
        "alignContent",
        "justifyContent",
        "flexDirection",
        "flexWrap",
        "gridAutoFlow",
        "focusPolicy",
        "textAlign",
        "lineBreak",
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
        "cache",
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

/// The JS editor validates against its own field table
/// (`js/src/devtools/fields.ts`); assert it names every wire field of
/// `protocol/style.rs`'s `with_style_fields!` table, so adding a `Style` field
/// can't silently leave it un-editable in devtools. Matches the key either
/// bare (`width:`) or quoted (`"width":`) — prettier decides which.
/// camelCase wire names make the bare `name:` probe unambiguous (a missing
/// `top` is never satisfied by `scrollTop:`).
#[test]
fn js_style_field_table_covers_every_style_field() {
    let fields_ts = include_str!("../../../../js/src/devtools/fields.ts");
    macro_rules! check_fields {
        ($(($field:ident, $wire:literal, ($($group:tt)*), $overlay:ident)),* $(,)?) => {
            $(
                assert!(
                    fields_ts.contains(concat!($wire, ":"))
                        || fields_ts.contains(concat!("\"", $wire, "\":")),
                    concat!(
                        "js/src/devtools/fields.ts is missing style field \"",
                        $wire,
                        "\" — add it to STYLE_FIELDS with a category"
                    )
                );
            )*
        };
    }
    crate::protocol::style::with_style_fields!(check_fields);
}
