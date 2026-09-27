//! Text properties (meaningful on `<text>` elements and their spans).

use bevy::text::{FontWeight, Justify, LineBreak};

use super::inv::*;
use crate::protocol::animatable::Animatable;
use crate::protocol::keywords::{LINE_BREAK_KEYWORDS, TEXT_ALIGN_KEYWORDS, de_font_weight};
use crate::protocol::units::FontSize;
use crate::protocol::visual::{LetterSpacingSpec, LineHeightSpec, TextShadowSpec};
use crate::style::{Codec, Invalidate, StyleProperty};

/// Text color (any CSS color). Animatable via `interpolateColor`.
pub static COLOR: StyleProperty<Animatable<String>> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec("color", Codec::serde_as("Animatable<Color>"))
};
/// Font size: logical px or a unit string (`"24px"`, `"2vw"`, `"1.5rem"`).
pub static FONT_SIZE: StyleProperty<FontSize> = StyleProperty {
    invalidate: Invalidate::Fixed(SHAPING),
    ..StyleProperty::with_codec("fontSize", Codec::serde_as("FontSize"))
};
/// A named weight or a numeric weight string (`"600"`).
pub static FONT_WEIGHT: StyleProperty<FontWeight> = StyleProperty {
    invalidate: Invalidate::Fixed(SHAPING),
    ..StyleProperty::with_codec(
        "fontWeight",
        Codec::custom(
            erased!(de_font_weight => FontWeight),
            "\"thin\" | \"light\" | \"normal\" | \"medium\" | \"semibold\" | \"bold\" | \"black\" \
         | (string & {})",
        ),
    )
};
/// A registered font-family name (the plugin's `default_font`/`font`
/// config); unknown or unset → the configured default.
pub static FONT_FAMILY: StyleProperty<String> = StyleProperty {
    invalidate: Invalidate::Fixed(SHAPING),
    ..StyleProperty::new("fontFamily")
};
/// Horizontal alignment of the text block (`<text>` root only).
pub static TEXT_ALIGN: StyleProperty<Justify> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("textAlign", Codec::keyword(&TEXT_ALIGN_KEYWORDS))
};
/// Line height: a bare number is a multiple of the font size; a string
/// carries a unit (`"20px"` absolute, `"1.5"`/`"1.5em"` a multiple);
/// `{ px }` is absolute. Unset → 1.2× the font size (bevy's default).
pub static LINE_HEIGHT: StyleProperty<LineHeightSpec> = StyleProperty {
    invalidate: Invalidate::Fixed(SHAPING),
    ..StyleProperty::with_codec(
        "lineHeight",
        Codec::serde_as("number | string | { px: number }"),
    )
};
/// Letter spacing: a bare number is logical px; a string carries a unit
/// (`"2px"`, `"0.1rem"`/`"0.1em"`, `"normal"`); `{ rem }` is a font-size
/// multiple.
pub static LETTER_SPACING: StyleProperty<LetterSpacingSpec> = StyleProperty {
    invalidate: Invalidate::Fixed(SHAPING),
    ..StyleProperty::with_codec(
        "letterSpacing",
        Codec::serde_as("number | string | { rem: number }"),
    )
};
/// One drop shadow behind the text (`<text>` root only): `offsetX`/`offsetY`
/// in logical px (default `4`), `color` defaulting to bevy's translucent
/// black.
pub static TEXT_SHADOW: StyleProperty<TextShadowSpec> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec(
        "textShadow",
        Codec::serde_as("{ color?: Color; offsetX?: number; offsetY?: number }"),
    )
};
/// How the text wraps when it overflows its bounds (`<text>` root only);
/// default `"wordBoundary"`.
pub static LINE_BREAK: StyleProperty<LineBreak> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("lineBreak", Codec::keyword(&LINE_BREAK_KEYWORDS))
};
