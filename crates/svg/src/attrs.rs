//! The svg elements' attributes: one registered [`Attribute`] per SVG
//! attribute (`cx`, `fill`, `d`, …), decoded by the crate's protocol
//! decoders, and `assemble` — the gather into the [`ShapeAttrs`] value the
//! painter, the hit-tester, the transition channel and the animation
//! consumer read.
//!
//! The numeric attributes accept the inline `{ animated, seed? }` wrapper:
//! their binding publishes under the `"shape"` domain, by attribute name
//! (`Ext { domain: "shape", name: "cx" }`), which
//! [`apply_driven_shape_attrs`](crate::apply_driven_shape_attrs) writes
//! into the attr's seed slot.

use bevy::math::Vec2;
use bevy_react_core::element::{AttrBinding, Attribute, Attrs, animatable_binding};
use bevy_react_core::protocol::animatable::Animatable;
use bevy_react_core::style::Codec;

use crate::protocol::{
    self, FillRuleKind, LinecapKind, LinejoinKind, PathData, ShapeAttrs, ShapePaint,
    ShapeTransform, ShapeTransitionSpec, ViewBox,
};

/// An erased-serde decoder around one of the generic [`crate::protocol`]
/// decoders (the codec signature).
macro_rules! erased {
    ($f:path => $t:ty) => {{
        fn decode(
            d: &mut dyn erased_serde::Deserializer<'_>,
        ) -> Result<Option<$t>, erased_serde::Error> {
            $f(d)
        }
        decode
    }};
}

/// A numeric (animatable) shape attribute.
const fn numeric(name: &'static str) -> Attribute<Animatable<f32>> {
    Attribute {
        animated: Some(AttrBinding {
            domain: "shape",
            binding: animatable_binding::<f32>,
        }),
        ..Attribute::with_codec(
            name,
            Codec::custom(
                erased!(protocol::de_number => Animatable<f32>),
                "Animatable<number>",
            ),
        )
    }
}

// --- geometry (SVG user units) ---
pub static X: Attribute<Animatable<f32>> = numeric("x");
pub static Y: Attribute<Animatable<f32>> = numeric("y");
pub static WIDTH: Attribute<Animatable<f32>> = numeric("width");
pub static HEIGHT: Attribute<Animatable<f32>> = numeric("height");
pub static CX: Attribute<Animatable<f32>> = numeric("cx");
pub static CY: Attribute<Animatable<f32>> = numeric("cy");
pub static R: Attribute<Animatable<f32>> = numeric("r");
pub static RX: Attribute<Animatable<f32>> = numeric("rx");
pub static RY: Attribute<Animatable<f32>> = numeric("ry");
pub static X1: Attribute<Animatable<f32>> = numeric("x1");
pub static Y1: Attribute<Animatable<f32>> = numeric("y1");
pub static X2: Attribute<Animatable<f32>> = numeric("x2");
pub static Y2: Attribute<Animatable<f32>> = numeric("y2");
/// `<polyline>`/`<polygon>` vertices: a flat number array `[x0, y0, …]`.
pub static POINTS: Attribute<Vec<Vec2>> = Attribute::with_codec(
    "points",
    Codec::custom(erased!(protocol::de_points => Vec<Vec2>), "number[]"),
);
/// `<path>` data.
pub static D: Attribute<PathData> = Attribute::with_codec(
    "d",
    Codec::custom(erased!(protocol::de_path => PathData), "string"),
);

// --- paint ---
/// Interior paint (a CSS color or `"none"`); absent → the SVG default
/// (black).
pub static FILL: Attribute<ShapePaint> = Attribute::with_codec(
    "fill",
    Codec::custom(erased!(protocol::de_paint => ShapePaint), "string"),
);
/// Outline paint (a CSS color or `"none"`); absent → no stroke.
pub static STROKE: Attribute<ShapePaint> = Attribute::with_codec(
    "stroke",
    Codec::custom(erased!(protocol::de_paint => ShapePaint), "string"),
);
pub static STROKE_WIDTH: Attribute<Animatable<f32>> = numeric("strokeWidth");
/// Opacity in `0..1` (a group's multiplies into its descendants).
pub static OPACITY: Attribute<Animatable<f32>> = numeric("opacity");
pub static FILL_RULE: Attribute<FillRuleKind> = Attribute::with_codec(
    "fillRule",
    Codec::custom(
        erased!(protocol::de_fill_rule => FillRuleKind),
        "\"nonzero\" | \"evenodd\"",
    ),
);
pub static STROKE_LINECAP: Attribute<LinecapKind> = Attribute::with_codec(
    "strokeLinecap",
    Codec::custom(
        erased!(protocol::de_linecap => LinecapKind),
        "\"butt\" | \"round\" | \"square\"",
    ),
);
pub static STROKE_LINEJOIN: Attribute<LinejoinKind> = Attribute::with_codec(
    "strokeLinejoin",
    Codec::custom(
        erased!(protocol::de_linejoin => LinejoinKind),
        "\"miter\" | \"round\" | \"bevel\"",
    ),
);
/// SVG transform list (`"translate(10 20) rotate(45)"`), resolved to an
/// affine at decode.
pub static TRANSFORM: Attribute<ShapeTransform> = Attribute::with_codec(
    "transform",
    Codec::custom(erased!(protocol::de_transform => ShapeTransform), "string"),
);
/// Per-attr easing of the numeric attributes (see
/// [`drive_shape_transitions`](crate::drive_shape_transitions)).
pub static TRANSITION: Attribute<Box<ShapeTransitionSpec>> = Attribute::with_codec(
    "transition",
    Codec::custom(
        erased!(protocol::de_transition => Box<ShapeTransitionSpec>),
        "BevyShapeTransition",
    ),
);

/// The `<svg>` root's user-unit rectangle (`"minX minY width height"`).
pub static VIEW_BOX: Attribute<ViewBox> = Attribute::with_codec(
    "viewBox",
    Codec::custom(erased!(protocol::de_view_box => ViewBox), "string"),
);

/// Every shape attribute — what the shared shape writer reads (an element
/// lists its own subset; the rest are never set on it).
pub(crate) static ALL: &[&dyn bevy_react_core::element::AnyAttribute] = &[
    &X,
    &Y,
    &WIDTH,
    &HEIGHT,
    &CX,
    &CY,
    &R,
    &RX,
    &RY,
    &X1,
    &Y1,
    &X2,
    &Y2,
    &POINTS,
    &D,
    &FILL,
    &STROKE,
    &STROKE_WIDTH,
    &OPACITY,
    &FILL_RULE,
    &STROKE_LINECAP,
    &STROKE_LINEJOIN,
    &TRANSFORM,
    &TRANSITION,
];

/// Gather a shape's merged attributes into its [`ShapeAttrs`].
pub(crate) fn assemble(attrs: &Attrs) -> ShapeAttrs {
    ShapeAttrs {
        x: attrs.get(&X).cloned(),
        y: attrs.get(&Y).cloned(),
        width: attrs.get(&WIDTH).cloned(),
        height: attrs.get(&HEIGHT).cloned(),
        cx: attrs.get(&CX).cloned(),
        cy: attrs.get(&CY).cloned(),
        r: attrs.get(&R).cloned(),
        rx: attrs.get(&RX).cloned(),
        ry: attrs.get(&RY).cloned(),
        x1: attrs.get(&X1).cloned(),
        y1: attrs.get(&Y1).cloned(),
        x2: attrs.get(&X2).cloned(),
        y2: attrs.get(&Y2).cloned(),
        points: attrs.get(&POINTS).cloned(),
        d: attrs.get(&D).cloned(),
        fill: attrs.get(&FILL).copied(),
        stroke: attrs.get(&STROKE).copied(),
        stroke_width: attrs.get(&STROKE_WIDTH).cloned(),
        opacity: attrs.get(&OPACITY).cloned(),
        fill_rule: attrs.get(&FILL_RULE).copied(),
        stroke_linecap: attrs.get(&STROKE_LINECAP).copied(),
        stroke_linejoin: attrs.get(&STROKE_LINEJOIN).copied(),
        transform: attrs.get(&TRANSFORM).copied(),
        transition: attrs.get(&TRANSITION).cloned(),
    }
}
