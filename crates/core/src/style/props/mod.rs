//! The core's style properties — registered through the same
//! `add_react_styles` call a feature crate uses ([`CORE_STYLES`]).

use super::AnyStyleProperty;

/// Wrap a generic serde `deserialize_with` fn (`fn<'de, D: Deserializer<'de>>(D)
/// -> Result<Option<T>, D::Error>`) as a type-erased [`DecodeFn`](super::DecodeFn).
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

/// The invalidation sets the core declarations use.
mod inv {
    use crate::style::Invalidation as I;
    pub(super) const NONE: I = I::NONE;
    pub(super) const PAINT: I = I::PAINT;
    pub(super) const PROMOTION: I = I::PROMOTION;
    pub(super) const HIT_TEST: I = I::HIT_TEST;
    pub(super) const LAYOUT_PAINT: I = I::LAYOUT.union(I::PAINT);
    pub(super) const PAINT_ASSET: I = I::PAINT.union(I::ASSET);
    pub(super) const ROUNDING: I = I::LAYOUT.union(I::INHERIT).union(I::PAINT);
    pub(super) const STACKING_PAINT: I = I::STACKING.union(I::PAINT);
    pub(super) const COMPOSITE_PROMOTION: I = I::COMPOSITE.union(I::PROMOTION);
    pub(super) const SHAPING: I = I::RESHAPE.union(I::LAYOUT).union(I::PAINT);
}

mod layer;
mod layout;
mod text;
mod visual;

pub use layer::*;
pub use layout::*;
pub use text::*;
pub use visual::*;

/// Declares [`CORE_STYLES`] and the core properties' fixed ids
/// ([`CoreId`]) from one list, so the two can never disagree.
macro_rules! core_styles {
    ($($name:ident),* $(,)?) => {
        /// Every core property, in id order.
        pub static CORE_STYLES: &[&dyn AnyStyleProperty] = &[$(&$name),*];

        /// The fixed id of each core property (its index in
        /// [`CORE_STYLES`]), usable in `const` masks.
        #[allow(non_camel_case_types, clippy::upper_case_acronyms, dead_code)]
        #[derive(Debug, Clone, Copy, PartialEq, Eq)]
        #[repr(u16)]
        pub(crate) enum CoreId {
            $($name),*
        }
    };
}

core_styles!(
    DISPLAY,
    BOX_SIZING,
    POSITION_TYPE,
    OVERFLOW_X,
    OVERFLOW_Y,
    SCROLLBAR_WIDTH,
    LEFT,
    RIGHT,
    TOP,
    BOTTOM,
    WIDTH,
    HEIGHT,
    MIN_WIDTH,
    MIN_HEIGHT,
    MAX_WIDTH,
    MAX_HEIGHT,
    ASPECT_RATIO,
    ALIGN_ITEMS,
    JUSTIFY_ITEMS,
    ALIGN_SELF,
    JUSTIFY_SELF,
    ALIGN_CONTENT,
    JUSTIFY_CONTENT,
    MARGIN,
    PADDING,
    BORDER,
    FLEX_DIRECTION,
    FLEX_WRAP,
    FLEX_GROW,
    FLEX_SHRINK,
    FLEX_BASIS,
    GAP,
    ROW_GAP,
    COLUMN_GAP,
    GRID_AUTO_FLOW,
    GRID_TEMPLATE_ROWS,
    GRID_TEMPLATE_COLUMNS,
    GRID_AUTO_ROWS,
    GRID_AUTO_COLUMNS,
    GRID_ROW,
    GRID_COLUMN,
    BACKGROUND_COLOR,
    BORDER_COLOR,
    BORDER_RADIUS,
    OUTLINE,
    BOX_SHADOW,
    FILTER,
    BACKDROP_FILTER,
    MORPH_FILTER,
    BACKGROUND_GRADIENT,
    BORDER_GRADIENT,
    BACKGROUND_IMAGE,
    IMAGE_RENDERING,
    LAYOUT_ROUNDING,
    Z_INDEX,
    GLOBAL_Z_INDEX,
    FOCUS_POLICY,
    CURSOR,
    SCROLLBAR,
    TRANSFORM,
    TRANSFORM3D,
    OPACITY,
    GROUP_ALPHA,
    CACHE,
    TRANSITION,
    COLOR,
    FONT_SIZE,
    FONT_WEIGHT,
    FONT_FAMILY,
    TEXT_ALIGN,
    LINE_HEIGHT,
    LETTER_SPACING,
    TEXT_SHADOW,
    LINE_BREAK,
);
