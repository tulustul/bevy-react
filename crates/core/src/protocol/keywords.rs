//! Keyword-valued style properties: the `keyword_fields!` table decodes each
//! wire keyword straight into the `bevy_ui`/`bevy_text` enum it drives.

use std::fmt;

use bevy::text::{FontWeight, Justify, LineBreak};
use bevy::ui::{
    AlignContent, AlignItems, AlignSelf, BoxSizing, Display, FlexDirection, FlexWrap, FocusPolicy,
    GridAutoFlow, JustifyContent, JustifyItems, JustifySelf, OverflowAxis, PositionType,
};

use serde::de::{self, Deserializer, Visitor};

use super::background_image::BackgroundImageMode;
use super::decode_warn;
use crate::image_rendering::ImageRendering;
use crate::scrollbar::{HorizontalEdge, ScrollbarPosition, VerticalEdge};
use crate::style::KeywordTable;
use crate::style::props::LayerCache;

/// A keyword kind's [`KeywordTable`] (`as TABLE` in `keyword_fields!`) for
/// the property codec that decodes through it; nothing for a kind that only
/// decodes a sub-field of another property's value.
macro_rules! keyword_table {
    (; $($rest:tt)*) => {};
    ($table:ident; $fn_name:ident, $kind:literal, $ty:ty, [$($kw:literal),+]) => {
        /// The keyword table of this kind, for the style registry's codec.
        pub(crate) static $table: KeywordTable<$ty> = KeywordTable {
            kind: $kind,
            keywords: &[$($kw),+],
            decode: {
                fn decode(
                    d: &mut dyn erased_serde::Deserializer<'_>,
                ) -> Result<Option<$ty>, erased_serde::Error> {
                    $fn_name(d)
                }
                decode
            },
        };
    };
}

/// Declares one `deserialize_with` fn per keyword kind (and, with
/// `as TABLE`, the [`KeywordTable`] a keyword-valued property's codec uses),
/// decoding the wire keyword straight into the `bevy_ui`/`bevy_text` enum it
/// drives. An unrecognized keyword warns (naming the kind and value) and falls
/// back to the enum's bevy default — a typo must not abort the commit batch. A
/// JSON `null` decodes to `None`; any other non-string value keeps
/// hard-erroring, like [`Length`](super::units::Length).
macro_rules! keyword_fields {
    ( $(
        $(#[$meta:meta])*
        fn $fn_name:ident($kind:literal) -> $ty:ty $(as $table:ident)? {
            $( $($kw:literal)|+ => $variant:ident ),+ $(,)?
        }
    )+ ) => { $(
        $(#[$meta])*
        pub(crate) fn $fn_name<'de, D: Deserializer<'de>>(d: D) -> Result<Option<$ty>, D::Error> {
            struct V;
            impl<'de> Visitor<'de> for V {
                type Value = Option<$ty>;
                fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                    f.write_str(concat!("a `", $kind, "` keyword string"))
                }
                fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
                    Ok(Some(match s {
                        $( $($kw)|+ => <$ty>::$variant, )+
                        _ => {
                            decode_warn(
                                $kind,
                                s,
                                &format!("unrecognized {} {s:?}", $kind),
                            );
                            <$ty>::default()
                        }
                    }))
                }
                fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
                    Ok(None)
                }
                fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
                    Ok(None)
                }
            }
            d.deserialize_any(V)
        }

        keyword_table! { $($table)?; $fn_name, $kind, $ty, [$( $($kw),+ ),+] }
    )+ };
}

keyword_fields! {
    fn de_display("display") -> Display as DISPLAY_KEYWORDS {
        "flex" => Flex, "grid" => Grid, "block" => Block, "none" => None,
    }
    fn de_layer_cache("cache") -> LayerCache as LAYER_CACHE_KEYWORDS {
        "auto" => Auto, "always" => Always, "never" => Never,
    }
    fn de_box_sizing("boxSizing") -> BoxSizing as BOX_SIZING_KEYWORDS {
        "borderBox" | "border-box" => BorderBox,
        "contentBox" | "content-box" => ContentBox,
    }
    fn de_position_type("positionType") -> PositionType as POSITION_TYPE_KEYWORDS {
        "absolute" => Absolute, "relative" => Relative,
    }
    fn de_overflow_axis("overflow") -> OverflowAxis as OVERFLOW_KEYWORDS {
        "visible" => Visible, "clip" => Clip, "hidden" => Hidden, "scroll" => Scroll,
    }
    // `start`/`end` are the physical variants, `flexStart`/`flexEnd` the
    // flow-relative ones — they diverge in grid and reversed-flex containers,
    // so the keywords must not collapse together. The alignment enums' bevy
    // default is the keyword-less `Default` variant ("align per the layout
    // spec"), which is also the unrecognized-keyword fallback.
    fn de_align_items("alignItems") -> AlignItems as ALIGN_ITEMS_KEYWORDS {
        "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_justify_items("justifyItems") -> JustifyItems as JUSTIFY_ITEMS_KEYWORDS {
        "start" => Start, "end" => End,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_align_self("alignSelf") -> AlignSelf as ALIGN_SELF_KEYWORDS {
        "auto" => Auto, "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_justify_self("justifySelf") -> JustifySelf as JUSTIFY_SELF_KEYWORDS {
        "auto" => Auto, "start" => Start, "end" => End,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_align_content("alignContent") -> AlignContent as ALIGN_CONTENT_KEYWORDS {
        "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "stretch" => Stretch,
        "spaceBetween" => SpaceBetween, "spaceEvenly" => SpaceEvenly,
        "spaceAround" => SpaceAround,
    }
    fn de_justify_content("justifyContent") -> JustifyContent as JUSTIFY_CONTENT_KEYWORDS {
        "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "stretch" => Stretch,
        "spaceBetween" => SpaceBetween, "spaceEvenly" => SpaceEvenly,
        "spaceAround" => SpaceAround,
    }
    fn de_flex_direction("flexDirection") -> FlexDirection as FLEX_DIRECTION_KEYWORDS {
        "row" => Row, "column" => Column,
        "rowReverse" => RowReverse, "columnReverse" => ColumnReverse,
    }
    fn de_flex_wrap("flexWrap") -> FlexWrap as FLEX_WRAP_KEYWORDS {
        "nowrap" | "noWrap" => NoWrap, "wrap" => Wrap, "wrapReverse" => WrapReverse,
    }
    fn de_grid_auto_flow("gridAutoFlow") -> GridAutoFlow as GRID_AUTO_FLOW_KEYWORDS {
        "row" => Row, "column" => Column,
        "rowDense" => RowDense, "columnDense" => ColumnDense,
    }
    // Unknown values fall back to `Pass` (bevy's default) so a typo stays
    // click-through rather than silently swallowing pointer interaction.
    fn de_focus_policy("focusPolicy") -> FocusPolicy as FOCUS_POLICY_KEYWORDS {
        "block" => Block, "pass" => Pass,
    }
    fn de_text_align("textAlign") -> Justify as TEXT_ALIGN_KEYWORDS {
        "left" => Left, "center" => Center, "right" => Right,
        "justify" => Justified, "start" => Start, "end" => End,
    }
    fn de_line_break("lineBreak") -> LineBreak as LINE_BREAK_KEYWORDS {
        "wordBoundary" => WordBoundary, "anyCharacter" => AnyCharacter,
        "wordOrCharacter" => WordOrCharacter, "noWrap" => NoWrap,
    }
    // Unknown keywords (incl. `<image>`-only modes like "auto"/"sliced") fall
    // back to the layout-inert `Stretch`.
    fn de_bg_image_mode("backgroundImage") -> BackgroundImageMode {
        "stretch" => Stretch, "repeat" => Repeat,
        "repeatX" => RepeatX, "repeatY" => RepeatY,
    }
    // The sub-fields of a styled `scrollbar` object (decoded inside its own
    // visitor, hence no table).
    fn de_scrollbar_position("scrollbar") -> ScrollbarPosition {
        "gutter" => Gutter, "float" => Float,
    }
    fn de_scrollbar_vertical_side("scrollbar") -> HorizontalEdge {
        "left" => Left, "right" => Right,
    }
    fn de_scrollbar_horizontal_side("scrollbar") -> VerticalEdge {
        "top" => Top, "bottom" => Bottom,
    }
    // GPU sampling vocabulary on purpose (no CSS `smooth`/`pixelated`
    // aliases); unknown → `auto`, which never touches the asset.
    fn de_image_rendering("imageRendering") -> ImageRendering as IMAGE_RENDERING_KEYWORDS {
        "auto" => Auto, "bilinear" => Bilinear,
        "trilinear" => Trilinear, "nearest" => Nearest,
    }
}

/// `fontWeight`: a named keyword or a numeric weight string (`"600"`). Not a
/// [`keyword_fields!`] entry because of the numeric form. Unrecognized → warn +
/// `NORMAL` (400).
pub(crate) fn de_font_weight<'de, D: Deserializer<'de>>(
    d: D,
) -> Result<Option<FontWeight>, D::Error> {
    struct V;
    impl<'de> Visitor<'de> for V {
        type Value = Option<FontWeight>;
        fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
            f.write_str("a `fontWeight` keyword or numeric weight string")
        }
        fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
            Ok(Some(match s {
                "thin" => FontWeight::THIN,
                "light" => FontWeight(300),
                "normal" => FontWeight::NORMAL,
                "medium" => FontWeight(500),
                "semibold" => FontWeight(600),
                "bold" => FontWeight::BOLD,
                "black" => FontWeight::BLACK,
                other => other.parse::<u16>().map(FontWeight).unwrap_or_else(|_| {
                    decode_warn(
                        "fontWeight",
                        other,
                        &format!("unrecognized fontWeight {other:?}"),
                    );
                    FontWeight::NORMAL
                }),
            }))
        }
        fn visit_unit<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
        fn visit_none<E: de::Error>(self) -> Result<Self::Value, E> {
            Ok(None)
        }
    }
    d.deserialize_any(V)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::style::Style;
    use crate::style::props::{
        ALIGN_CONTENT, ALIGN_ITEMS, ALIGN_SELF, BOX_SIZING, DISPLAY, FLEX_DIRECTION, FLEX_WRAP,
        FOCUS_POLICY, FONT_WEIGHT, JUSTIFY_CONTENT, LINE_BREAK, TEXT_ALIGN,
    };

    /// Keyword style fields decode straight into their `bevy_ui`/`bevy_text`
    /// enums; `start`/`end` map to the physical `Start`/`End` variants while
    /// `flexStart`/`flexEnd` map to the flow-relative `FlexStart`/`FlexEnd`.
    /// They diverge in grid and reversed-flex containers, so the keywords must
    /// not collapse together.
    #[test]
    fn keyword_fields_decode_to_bevy_enums() {
        let s: Style = serde_json::from_value(serde_json::json!({
            "display": "grid",
            "alignItems": "start",
            "alignSelf": "flexStart",
            "alignContent": "spaceBetween",
            "justifyContent": "flexEnd",
            "flexWrap": "nowrap",
            "focusPolicy": "block",
            "textAlign": "justify",
            "lineBreak": "anyCharacter",
        }))
        .expect("keyword style decodes");
        assert_eq!(s.get(&DISPLAY).copied(), Some(Display::Grid));
        assert_eq!(s.get(&ALIGN_ITEMS).copied(), Some(AlignItems::Start));
        assert_eq!(s.get(&ALIGN_SELF).copied(), Some(AlignSelf::FlexStart));
        assert_eq!(
            s.get(&ALIGN_CONTENT).copied(),
            Some(AlignContent::SpaceBetween)
        );
        assert_eq!(
            s.get(&JUSTIFY_CONTENT).copied(),
            Some(JustifyContent::FlexEnd)
        );
        assert_eq!(s.get(&FLEX_WRAP).copied(), Some(FlexWrap::NoWrap));
        assert_eq!(s.get(&FOCUS_POLICY).copied(), Some(FocusPolicy::Block));
        assert_eq!(s.get(&TEXT_ALIGN).copied(), Some(Justify::Justified));
        assert_eq!(s.get(&LINE_BREAK).copied(), Some(LineBreak::AnyCharacter));

        let s: Style = serde_json::from_value(serde_json::json!({
            "alignItems": "flexStart",
            "justifyContent": "start",
            // both keyword spellings of boxSizing are accepted
            "boxSizing": "border-box",
            "flexWrap": "noWrap",
        }))
        .expect("alias keywords decode");
        assert_eq!(s.get(&ALIGN_ITEMS).copied(), Some(AlignItems::FlexStart));
        assert_eq!(
            s.get(&JUSTIFY_CONTENT).copied(),
            Some(JustifyContent::Start)
        );
        assert_eq!(s.get(&BOX_SIZING).copied(), Some(BoxSizing::BorderBox));
        assert_eq!(s.get(&FLEX_WRAP).copied(), Some(FlexWrap::NoWrap));
    }

    /// An unrecognized enum keyword falls back to the bevy default (and warns)
    /// rather than aborting the batch or being silently dropped — a valid
    /// sibling field still decodes.
    #[test]
    fn unknown_enum_keywords_fall_back_to_default() {
        let s: Style = serde_json::from_value(serde_json::json!({
            "display": "flx",
            "alignItems": "centre",
            "flexDirection": "sideways",
            "textAlign": "middle",
            "fontWeight": "heavyish",
            "focusPolicy": "weird",
            // A valid sibling proves the fallbacks didn't abort the Style.
            "lineBreak": "wordBoundary",
        }))
        .expect("bad keywords must not abort deserialization");
        assert_eq!(s.get(&DISPLAY).copied(), Some(Display::default()));
        assert_eq!(s.get(&ALIGN_ITEMS).copied(), Some(AlignItems::default()));
        assert_eq!(
            s.get(&FLEX_DIRECTION).copied(),
            Some(FlexDirection::default())
        );
        assert_eq!(s.get(&TEXT_ALIGN).copied(), Some(Justify::default()));
        assert_eq!(s.get(&FONT_WEIGHT).copied(), Some(FontWeight::NORMAL));
        assert_eq!(s.get(&FOCUS_POLICY).copied(), Some(FocusPolicy::Pass));
        assert_eq!(s.get(&LINE_BREAK).copied(), Some(LineBreak::WordBoundary));
    }

    /// `fontWeight` takes a named keyword or a numeric weight string.
    #[test]
    fn font_weight_keywords_and_numeric() {
        let fw = |v: serde_json::Value| {
            serde_json::from_value::<Style>(serde_json::json!({ "fontWeight": v }))
                .expect("fontWeight decodes")
                .get(&FONT_WEIGHT)
                .copied()
        };
        assert_eq!(fw("bold".into()), Some(FontWeight::BOLD));
        assert_eq!(fw("600".into()), Some(FontWeight(600)));
        assert_eq!(fw("thin".into()), Some(FontWeight::THIN));
    }
}
