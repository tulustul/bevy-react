//! Layout properties: display, box model, inset, size, alignment, spacing,
//! flex and grid — everything that lands on `bevy_ui::Node`.

use bevy::ui::{
    AlignContent, AlignItems, AlignSelf, BoxSizing, Display, FlexDirection, FlexWrap, GridAutoFlow,
    GridPlacement, GridTrack, JustifyContent, JustifyItems, JustifySelf, OverflowAxis,
    PositionType, RepeatedGridTrack,
};

use super::inv::*;
use crate::protocol::animatable::Animatable;
use crate::protocol::grid::{de_grid_auto_tracks, de_grid_placement, de_grid_template};
use crate::protocol::keywords::{
    ALIGN_CONTENT_KEYWORDS, ALIGN_ITEMS_KEYWORDS, ALIGN_SELF_KEYWORDS, BOX_SIZING_KEYWORDS,
    DISPLAY_KEYWORDS, FLEX_DIRECTION_KEYWORDS, FLEX_WRAP_KEYWORDS, GRID_AUTO_FLOW_KEYWORDS,
    JUSTIFY_CONTENT_KEYWORDS, JUSTIFY_ITEMS_KEYWORDS, JUSTIFY_SELF_KEYWORDS, OVERFLOW_KEYWORDS,
    POSITION_TYPE_KEYWORDS,
};
use crate::protocol::units::{Length, Rect};
use crate::style::{Codec, Invalidate, StyleProperty};

/// An animatable length property (a bound length animates in px).
const fn anim_length(name: &'static str) -> StyleProperty<Animatable<Length>> {
    StyleProperty::with_codec(name, Codec::serde_as("Animatable<Length>"))
}

// --- display / box model ---
pub static DISPLAY: StyleProperty<Display> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("display", Codec::keyword(&DISPLAY_KEYWORDS))
};
pub static BOX_SIZING: StyleProperty<BoxSizing> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("boxSizing", Codec::keyword(&BOX_SIZING_KEYWORDS))
};
pub static POSITION_TYPE: StyleProperty<PositionType> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("positionType", Codec::keyword(&POSITION_TYPE_KEYWORDS))
};
pub static OVERFLOW_X: StyleProperty<OverflowAxis> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("overflowX", Codec::keyword(&OVERFLOW_KEYWORDS))
};
pub static OVERFLOW_Y: StyleProperty<OverflowAxis> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("overflowY", Codec::keyword(&OVERFLOW_KEYWORDS))
};
pub static SCROLLBAR_WIDTH: StyleProperty<f32> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::new("scrollbarWidth")
};

// --- inset ---
pub static LEFT: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("left")
};
pub static RIGHT: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("right")
};
pub static TOP: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("top")
};
pub static BOTTOM: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("bottom")
};

// --- size ---
pub static WIDTH: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("width")
};
pub static HEIGHT: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("height")
};
pub static MIN_WIDTH: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("minWidth")
};
pub static MIN_HEIGHT: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("minHeight")
};
pub static MAX_WIDTH: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("maxWidth")
};
pub static MAX_HEIGHT: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("maxHeight")
};
pub static ASPECT_RATIO: StyleProperty<Animatable<f32>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("aspectRatio", Codec::serde_as("Animatable<number>"))
};

// --- alignment ---
pub static ALIGN_ITEMS: StyleProperty<AlignItems> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("alignItems", Codec::keyword(&ALIGN_ITEMS_KEYWORDS))
};
pub static JUSTIFY_ITEMS: StyleProperty<JustifyItems> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("justifyItems", Codec::keyword(&JUSTIFY_ITEMS_KEYWORDS))
};
pub static ALIGN_SELF: StyleProperty<AlignSelf> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("alignSelf", Codec::keyword(&ALIGN_SELF_KEYWORDS))
};
pub static JUSTIFY_SELF: StyleProperty<JustifySelf> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("justifySelf", Codec::keyword(&JUSTIFY_SELF_KEYWORDS))
};
pub static ALIGN_CONTENT: StyleProperty<AlignContent> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("alignContent", Codec::keyword(&ALIGN_CONTENT_KEYWORDS))
};
pub static JUSTIFY_CONTENT: StyleProperty<JustifyContent> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("justifyContent", Codec::keyword(&JUSTIFY_CONTENT_KEYWORDS))
};

// --- spacing ---
pub static MARGIN: StyleProperty<Rect> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("margin", Codec::serde_as("Rect"))
};
pub static PADDING: StyleProperty<Rect> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("padding", Codec::serde_as("Rect"))
};
pub static BORDER: StyleProperty<Rect> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("border", Codec::serde_as("Rect"))
};

// --- flex ---
pub static FLEX_DIRECTION: StyleProperty<FlexDirection> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("flexDirection", Codec::keyword(&FLEX_DIRECTION_KEYWORDS))
};
pub static FLEX_WRAP: StyleProperty<FlexWrap> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("flexWrap", Codec::keyword(&FLEX_WRAP_KEYWORDS))
};
pub static FLEX_GROW: StyleProperty<f32> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::new("flexGrow")
};
pub static FLEX_SHRINK: StyleProperty<f32> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::new("flexShrink")
};
pub static FLEX_BASIS: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("flexBasis")
};
pub static GAP: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("gap")
};
pub static ROW_GAP: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("rowGap")
};
pub static COLUMN_GAP: StyleProperty<Animatable<Length>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..anim_length("columnGap")
};

// --- grid ---
pub static GRID_AUTO_FLOW: StyleProperty<GridAutoFlow> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("gridAutoFlow", Codec::keyword(&GRID_AUTO_FLOW_KEYWORDS))
};
/// CSS grid template (`"repeat(3, 1fr)"`, `"1fr 2fr 100px"`, `"auto"`).
pub static GRID_TEMPLATE_ROWS: StyleProperty<Vec<RepeatedGridTrack>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec(
        "gridTemplateRows",
        Codec::custom(
            erased!(de_grid_template => Vec<RepeatedGridTrack>),
            "string",
        ),
    )
};
pub static GRID_TEMPLATE_COLUMNS: StyleProperty<Vec<RepeatedGridTrack>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec(
        "gridTemplateColumns",
        Codec::custom(
            erased!(de_grid_template => Vec<RepeatedGridTrack>),
            "string",
        ),
    )
};
/// Auto-track sizing (`grid-auto-rows`/`columns`); no `repeat()`.
pub static GRID_AUTO_ROWS: StyleProperty<Vec<GridTrack>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec(
        "gridAutoRows",
        Codec::custom(erased!(de_grid_auto_tracks => Vec<GridTrack>), "string"),
    )
};
pub static GRID_AUTO_COLUMNS: StyleProperty<Vec<GridTrack>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec(
        "gridAutoColumns",
        Codec::custom(erased!(de_grid_auto_tracks => Vec<GridTrack>), "string"),
    )
};
/// Grid line placement (`"1 / 3"`, `"span 2"`, `"2"`, `"auto"`).
pub static GRID_ROW: StyleProperty<GridPlacement> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec(
        "gridRow",
        Codec::custom(erased!(de_grid_placement => GridPlacement), "string"),
    )
};
pub static GRID_COLUMN: StyleProperty<GridPlacement> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec(
        "gridColumn",
        Codec::custom(erased!(de_grid_placement => GridPlacement), "string"),
    )
};
