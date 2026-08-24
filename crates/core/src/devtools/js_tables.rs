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
        "filterBleed",
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

/// `fields.ts`'s `SHAPE_FIELDS` must know every wire field of
/// [`crate::svg::ShapeAttrs`], or that field renders in the inspector's
/// shape section flagged as an unknown field. The wire names live on
/// `svg/protocol.rs`'s `ShapeAttrs` (camelCase via serde); extend BOTH
/// the wire-name list here and the TS table when adding one — the
/// exhaustive destructure below (no `..` rest pattern) turns a new
/// `ShapeAttrs` field into a compile error in this test, so growth can't
/// slip past either list.
#[test]
fn js_shape_field_table_covers_shape_attrs() {
    // Compile-time growth guard: destructure every field. Adding a field
    // to `ShapeAttrs` breaks this pattern until it's bound here AND its
    // wire name is added to the list + the TS table.
    let crate::svg::ShapeAttrs {
        x: _,
        y: _,
        width: _,
        height: _,
        cx: _,
        cy: _,
        r: _,
        rx: _,
        ry: _,
        x1: _,
        y1: _,
        x2: _,
        y2: _,
        points: _,
        d: _,
        fill: _,
        stroke: _,
        stroke_width: _,
        opacity: _,
        fill_rule: _,
        stroke_linecap: _,
        stroke_linejoin: _,
        transform: _,
        transition: _,
    } = crate::svg::ShapeAttrs::default();

    let fields_ts = include_str!("../../../../js/src/devtools/fields.ts");
    // Scope the check to the SHAPE_FIELDS table body so a shape-only
    // field can't false-pass off a same-named STYLE_FIELDS entry.
    let table = fields_ts
        .split_once("SHAPE_FIELDS")
        .and_then(|(_, rest)| rest.split_once("};"))
        .map(|(table, _)| table)
        .expect("js/src/devtools/fields.ts has no SHAPE_FIELDS table");
    for field in [
        "d",
        "x",
        "y",
        "width",
        "height",
        "cx",
        "cy",
        "r",
        "rx",
        "ry",
        "x1",
        "y1",
        "x2",
        "y2",
        "points",
        "fill",
        "stroke",
        "strokeWidth",
        "opacity",
        "fillRule",
        "strokeLinecap",
        "strokeLinejoin",
        "transform",
        "transition",
    ] {
        // Anchored to line start (prettier's 2-space indent) so a short
        // name can't false-pass off a sibling's substring (`x:` in
        // `rx:`/`cx:`, `y:` in `ry:`/`cy:`).
        assert!(
            table.contains(&format!("\n  {field}:"))
                || table.contains(&format!("\n  \"{field}\":")),
            "js/src/devtools/fields.ts SHAPE_FIELDS is missing shape field \"{field}\""
        );
    }

    // The TSX `transition` typing (`BevyShapeTransition` in jsx-svg.d.ts)
    // keys the same numeric-attr set as `NUMERIC_ATTRS` — a third copy of
    // the list, so cover it here too: every wire name must appear in the
    // type's key union or a newly-easeable attr is untypeable from TSX.
    let jsx_svg = include_str!("../../../../js/src/jsx-svg.d.ts");
    let union = jsx_svg
        .split_once("BevyShapeTransition")
        .and_then(|(_, rest)| rest.split_once("};"))
        .map(|(body, _)| body)
        .expect("js/src/jsx-svg.d.ts has no BevyShapeTransition type");
    for (name, _, _) in &crate::svg::NUMERIC_ATTRS {
        // Quoted match is exact — `"x"` cannot false-pass inside `"x1"`.
        assert!(
            union.contains(&format!("\"{name}\"")),
            "js/src/jsx-svg.d.ts BevyShapeTransition is missing numeric attr \"{name}\""
        );
    }
}
