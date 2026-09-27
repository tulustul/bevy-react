//! Paint and interaction properties: colors, borders, shadows, gradients,
//! background images, stacking, pointer behavior, cursor, scrollbar.

use bevy::ui::FocusPolicy;

use super::inv::*;
use crate::image_rendering::ImageRendering;
use crate::protocol::animatable::Animatable;
use crate::protocol::background_image::{BackgroundImageSpec, de_background_image};
use crate::protocol::keywords::{FOCUS_POLICY_KEYWORDS, IMAGE_RENDERING_KEYWORDS};
use crate::protocol::units::Rect;
use crate::protocol::visual::{BorderColorSpec, BoxShadowList, GradientList, OutlineSpec};
use crate::scrollbar::ScrollbarSpec;
use crate::style::{Codec, Invalidate, StyleProperty};

/// Background color (any CSS color, e.g. `"#1e1e2e"` or `"rebeccapurple"`).
/// Animatable via an `interpolateColor` binding.
pub static BACKGROUND_COLOR: StyleProperty<Animatable<String>> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec("backgroundColor", Codec::serde_as("Animatable<Color>"))
};
/// Border color: one CSS color for all sides, or a per-side
/// `{ top, right, bottom, left }` object (omitted sides are transparent).
/// Per-side colors must use the object form — a multi-value string is not
/// supported (CSS color functions contain spaces). Needs a `border` width to
/// be visible. Only the single-color form is animatable (the binding drives
/// all four sides).
pub static BORDER_COLOR: StyleProperty<Animatable<BorderColorSpec>> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec(
        "borderColor",
        Codec::serde_as(
            "Animatable<Color> | { top?: Color; right?: Color; bottom?: Color; left?: Color }",
        ),
    )
};
/// Corner radii; same forms as the other rect properties. Animatable as a
/// whole: a bound value drives all four corners in px (no per-corner
/// wrappers); `transition: { borderRadius }` eases static changes per corner.
pub static BORDER_RADIUS: StyleProperty<Animatable<Rect>> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec("borderRadius", Codec::serde_as("Animatable<Rect>"))
};
pub static OUTLINE: StyleProperty<OutlineSpec> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec(
        "outline",
        Codec::serde_as("{ width?: Length; offset?: Length; color?: Color }"),
    )
};
/// One drop shadow, or an array stacked back-to-front (first paints on top),
/// like CSS `box-shadow: a, b, …`.
pub static BOX_SHADOW: StyleProperty<BoxShadowList> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec("boxShadow", Codec::serde_as("BoxShadow | BoxShadow[]"))
};
/// Background gradient(s): one gradient or a layered list, painted *over*
/// `backgroundColor` (like CSS `background-image`: an opaque gradient hides
/// the color, transparent stops let it show through). Transitionable via
/// `transition.backgroundGradient` (strict structural match; a mismatch,
/// appear, or unset snaps).
pub static BACKGROUND_GRADIENT: StyleProperty<GradientList> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec(
        "backgroundGradient",
        Codec::serde_as("Gradient | Gradient[]"),
    )
};
/// Border gradient(s): one gradient or a layered list, painted *over*
/// `borderColor` (needs a `border` width). Transitionable via
/// `transition.borderGradient` (strict structural match; a mismatch, appear,
/// or unset snaps).
pub static BORDER_GRADIENT: StyleProperty<GradientList> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT),
    ..StyleProperty::with_codec("borderGradient", Codec::serde_as("Gradient | Gradient[]"))
};
/// Background image (an asset path or a `{ texture }` render target),
/// painted *over* `backgroundColor` and `backgroundGradient`, under the
/// node's content (bevy's fixed paint order — the color/gradient show through
/// transparency and while the texture loads). Never affects layout. Rounded
/// corners clip it under `"stretch"`, but not under the repeat modes (bevy's
/// tiling pipeline); a swap snaps. Ignored — with a devtools warning — on
/// `<image>`/`<canvas>`/`<portal>` (their `ImageNode` belongs to the element)
/// and `<surface>`.
pub static BACKGROUND_IMAGE: StyleProperty<BackgroundImageSpec> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT_ASSET),
    ..StyleProperty::with_codec(
        "backgroundImage",
        Codec::custom(
            erased!(de_background_image => BackgroundImageSpec),
            "BackgroundImage",
        ),
    )
};
/// How this node's raster source (`<image src>` or `backgroundImage`) is
/// resampled when drawn at a size other than its own: `"auto"` (default,
/// passive — the engine default), `"bilinear"` (level 0 only), `"trilinear"`
/// (a generated mip pyramid — the fix for a large image drawn small), or
/// `"nearest"` (pixel art). Honored through a derived copy of the asset per
/// `(source, mode)` — the source is never modified. A live texture (render
/// target, `<portal>`, canvas, svg) can't be copied: every explicit mode is
/// ignored there with a warning, as is `"trilinear"` on a non-RGBA8 format.
pub static IMAGE_RENDERING: StyleProperty<ImageRendering> = StyleProperty {
    invalidate: Invalidate::Fixed(PAINT_ASSET),
    ..StyleProperty::with_codec("imageRendering", Codec::keyword(&IMAGE_RENDERING_KEYWORDS))
};
/// Whether layout rounds this subtree's rects to whole physical pixels
/// (bevy's `LayoutConfig::use_rounding`). Unset = inherit from the nearest
/// ancestor that sets it (root default `true`); restarts at every detached
/// root (`<surface>`, `<root>`), so set it on the PARENT that lays out the
/// animated node and its neighbours. `false` lays the subtree out at
/// fractional pixels — the fix for the 1px hops of a real-layout size
/// animation — at the price of soft edges and slightly blurred text at rest.
pub static LAYOUT_ROUNDING: StyleProperty<bool> = StyleProperty {
    invalidate: Invalidate::Fixed(ROUNDING),
    ..StyleProperty::new("layoutRounding")
};
/// Stacking order among siblings.
pub static Z_INDEX: StyleProperty<i32> = StyleProperty {
    invalidate: Invalidate::Fixed(STACKING_PAINT),
    ..StyleProperty::new("zIndex")
};
/// Lifts the node (and its subtree) into the UI's global stacking order,
/// escaping the parent stacking context — unlike `zIndex`, which only
/// reorders a node among its siblings.
pub static GLOBAL_Z_INDEX: StyleProperty<i32> = StyleProperty {
    invalidate: Invalidate::Fixed(STACKING_PAINT),
    ..StyleProperty::new("globalZIndex")
};
/// Pointer pass-through: `"pass"` makes the element click-through, `"block"`
/// captures interaction so siblings, the 3D scene, and portals behind it
/// don't receive it. Defaults differ by element: a `<button>` blocks, other
/// containers pass.
pub static FOCUS_POLICY: StyleProperty<FocusPolicy> = StyleProperty {
    invalidate: Invalidate::Fixed(HIT_TEST),
    ..StyleProperty::with_codec("focusPolicy", Codec::keyword(&FOCUS_POLICY_KEYWORDS))
};
/// Mouse cursor over this node (CSS `cursor`): a system keyword, or any other
/// string naming a custom image cursor registered via
/// `ReactUiPlugin::cursor` (one registered under a keyword name overrides
/// that system cursor). The topmost node under the pointer with a `cursor`
/// wins, so a child without one inherits its ancestor's.
pub static CURSOR: StyleProperty<String> = StyleProperty {
    invalidate: Invalidate::Fixed(NONE),
    ..StyleProperty::with_codec("cursor", Codec::serde_as("SystemCursor | (string & {})"))
};
/// A visible scrollbar for an `overflow: scroll` node: `"none"` (default)
/// hides it, `"default"` is a built-in neutral bar, an object configures it.
/// Draggable thumb + click-to-page are built in.
pub static SCROLLBAR: StyleProperty<ScrollbarSpec> = StyleProperty {
    invalidate: Invalidate::Fixed(LAYOUT_PAINT),
    ..StyleProperty::with_codec(
        "scrollbar",
        Codec::serde_as("\"none\" | \"default\" | ScrollbarStyle"),
    )
};
