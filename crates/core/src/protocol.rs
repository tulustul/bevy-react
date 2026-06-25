//! The wire protocol shared between the JS reconciler and the Bevy side.
//!
//! Everything here derives `serde` so deno_core's `serde_v8` can convert
//! directly between the plain JS objects the reconciler builds and these Rust
//! types — no JSON strings on the hot path. These types are deliberately
//! **bevy-free**: the translation into `bevy_ui` components lives in
//! [`crate::ui_map`]. Ops only ever flow JS -> Rust, so they need `Deserialize`
//! only; `UiEvent` flows Rust -> JS and is `Serialize`.

use std::fmt;

use serde::de::{self, Deserializer, MapAccess, Visitor};
use serde::{Deserialize, Serialize};

/// Stable identity for a node, assigned by the JS reconciler. `0` is reserved
/// for the root container (the Bevy UI root entity).
pub type NodeId = u32;

pub const ROOT_ID: NodeId = 0;

/// A single mutation produced by the React reconciler during a commit. The
/// reconciler batches a `Vec<Op>` per commit and flushes it across the boundary
/// in one call.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "op", rename_all = "camelCase")]
pub enum Op {
    /// Tear down the entire current tree. Emitted first by every fresh runtime
    /// so a hot reload clears the previous UI before the new render is applied.
    Reset,
    /// Spawn a host element (`node`, `button`, or `image`).
    Create {
        id: NodeId,
        kind: String,
        #[serde(default)]
        props: Props,
    },
    /// Spawn a standalone text node (a bare string outside any `<text>`).
    CreateText { id: NodeId, text: String },
    /// Spawn a text run inside a `<text>` element (a Bevy `TextSpan`). Its style
    /// is inherited from the enclosing `<text>` at append time.
    CreateTextSpan { id: NodeId, text: String },
    /// Make `child` the last child of `parent` (`parent == ROOT_ID` is the root).
    Append { parent: NodeId, child: NodeId },
    /// Insert `child` before `before` under `parent`.
    Insert {
        parent: NodeId,
        child: NodeId,
        before: NodeId,
    },
    /// Detach and despawn `child` (and its descendants).
    Remove { parent: NodeId, child: NodeId },
    /// Re-apply props to an existing element.
    Update {
        id: NodeId,
        #[serde(default)]
        props: Props,
    },
    /// Replace the string of a text node.
    UpdateText { id: NodeId, text: String },
}

/// Props for a host element. Event handlers never cross the boundary — the
/// reconciler replaces them with booleans (e.g. `onClick: true`) and keeps the
/// actual function in a JS-side map. Visual styling lives entirely in [`Style`];
/// the fields here are content/attribute level.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Props {
    /// CSS-like layout + visual style, mapped onto `bevy_ui` components.
    #[serde(default)]
    pub style: Option<Style>,
    /// Style overlaid on `style` while the element is hovered. Decoded exactly
    /// like `style`; applied on the Bevy side from the node's `Interaction`.
    #[serde(default)]
    pub hover_style: Option<Style>,
    /// Style overlaid on `style` (and `hover_style`) while the element is pressed.
    #[serde(default)]
    pub press_style: Option<Style>,
    /// Whether this element has an `onClick` handler registered in JS.
    #[serde(default)]
    pub on_click: bool,
    /// Whether this element has an `onPointerDown` handler registered in JS.
    #[serde(default)]
    pub on_pointer_down: bool,
    /// Whether this element has an `onPointerMove` handler registered in JS.
    /// Fires each frame while the pointer is held down (a drag).
    #[serde(default)]
    pub on_pointer_move: bool,
    /// Whether this element has an `onPointerUp` handler registered in JS.
    #[serde(default)]
    pub on_pointer_up: bool,
    /// Per-property animation bindings for an `Animated.node` (Reanimated-style).
    /// Present → the main reconciler stamps a `bevy_react_animations::AnimatedNode`
    /// on the entity so the animations plugin drives the listed props each frame.
    /// Bevy-free, pure-serde, like the rest of the protocol.
    #[serde(default)]
    pub animated: Option<bevy_react_animations::AnimatedBindings>,
    /// World-anchor binding for an `Anchored.node`: the Bevy entity to follow and
    /// an optional offset. Present → the reconciler stamps a [`crate::anchor::Anchored`]
    /// so the per-frame positioning system tracks it. Pure-serde, Bevy-free.
    #[serde(default)]
    pub anchor: Option<crate::anchor::Anchor>,

    // --- `image` element attributes ---
    /// Asset path for an `image`, resolved by Bevy's `AssetServer` (relative to
    /// the app's `assets/` folder). Absent → a solid-color image (see `tint`).
    #[serde(default)]
    pub src: Option<String>,
    /// Tint multiplied with the image (hex); also the fill of a `src`-less image.
    #[serde(default)]
    pub tint: Option<String>,
    /// Flip the image along its x-axis.
    #[serde(default)]
    pub flip_x: bool,
    /// Flip the image along its y-axis.
    #[serde(default)]
    pub flip_y: bool,
    /// How the image fits its box: `"auto"` or `"stretch"`.
    #[serde(default)]
    pub image_mode: Option<String>,

    // --- `canvas` element attribute ---
    /// The display list for a `canvas` element: an ordered batch of vector draw
    /// commands (the recorded form of an HTML-canvas-like `ctx.moveTo/lineTo/…`
    /// session). Present → the canvas re-rasterizes into its backing texture.
    /// `Some(vec![])` clears the canvas; absent leaves the previous drawing.
    #[serde(default)]
    pub draw: Option<Vec<DrawCmd>>,

    // --- `portal` element attribute ---
    /// The render-target name a `portal` element displays. The reconciler stamps
    /// a `bevy_react_portal::RPortal` carrying it; the binding system points the
    /// node's `ImageNode` at the texture the app registered under this name (or a
    /// transparent placeholder until it appears). Pure-serde, Bevy-free.
    #[serde(default)]
    pub target: Option<String>,

    // --- `editableText` element attributes ---
    /// The controlled text value of an `editableText`. Seeds the field on create;
    /// on update it's pushed into the widget only when it diverges from the live
    /// buffer (so normal typing is never clobbered — see [`crate::reconcile`]).
    #[serde(default)]
    pub value: Option<String>,
    /// Maximum number of characters an `editableText` accepts.
    #[serde(default)]
    pub max_length: Option<usize>,
    /// Whether an `editableText` accepts newlines (multi-line input).
    #[serde(default)]
    pub multiline: bool,
    /// Whether this element has an `onChange` handler registered in JS.
    #[serde(default)]
    pub on_change: bool,
}

/// The `canvas` display-list command type. It lives in the `bevy-react-canvas`
/// crate (which owns the host element and its rasterizer), and is re-exported here
/// so it stays reachable as `protocol::DrawCmd` and so [`Props::draw`] can name it.
pub use bevy_react_canvas::DrawCmd;

/// A CSS-like style object mapped onto `bevy_ui::Node` and its sibling visual
/// components. Every field is optional; unset fields keep Bevy's defaults.
///
/// Length-valued fields accept a bare number (logical pixels) or a unit string
/// (`"50%"`, `"100vw"`, `"auto"`, `"10px"`). Rect-valued fields
/// (`margin`/`padding`/`border`/`borderRadius`) accept a number (uniform), a CSS
/// shorthand string (`"8px 16px"`), or a `{ top, right, bottom, left }` object.
// TODO(review): the enum-like fields below are `Option<String>` and re-parsed from their
// string form on every apply (see ui_map's `display`/`align_items`/… and `parse_template`,
// which re-allocates `Vec<RepeatedGridTrack>` each update). Decode them into real enums at
// this serde boundary once (as `Length`/`Rect` already do) so the hot path is a copy, not a
// string match — this compounds with the no-diffing / full-re-apply cost.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Style {
    // --- display / box model ---
    #[serde(default)]
    pub display: Option<String>,
    #[serde(default)]
    pub box_sizing: Option<String>,
    #[serde(default)]
    pub position_type: Option<String>,
    #[serde(default)]
    pub overflow_x: Option<String>,
    #[serde(default)]
    pub overflow_y: Option<String>,
    #[serde(default)]
    pub scrollbar_width: Option<f32>,

    // --- inset ---
    #[serde(default)]
    pub left: Option<Length>,
    #[serde(default)]
    pub right: Option<Length>,
    #[serde(default)]
    pub top: Option<Length>,
    #[serde(default)]
    pub bottom: Option<Length>,

    // --- size ---
    #[serde(default)]
    pub width: Option<Length>,
    #[serde(default)]
    pub height: Option<Length>,
    #[serde(default)]
    pub min_width: Option<Length>,
    #[serde(default)]
    pub min_height: Option<Length>,
    #[serde(default)]
    pub max_width: Option<Length>,
    #[serde(default)]
    pub max_height: Option<Length>,
    #[serde(default)]
    pub aspect_ratio: Option<f32>,

    // --- alignment ---
    #[serde(default)]
    pub align_items: Option<String>,
    #[serde(default)]
    pub justify_items: Option<String>,
    #[serde(default)]
    pub align_self: Option<String>,
    #[serde(default)]
    pub justify_self: Option<String>,
    #[serde(default)]
    pub align_content: Option<String>,
    #[serde(default)]
    pub justify_content: Option<String>,

    // --- spacing ---
    #[serde(default)]
    pub margin: Option<Rect>,
    #[serde(default)]
    pub padding: Option<Rect>,
    #[serde(default)]
    pub border: Option<Rect>,

    // --- flex ---
    #[serde(default)]
    pub flex_direction: Option<String>,
    #[serde(default)]
    pub flex_wrap: Option<String>,
    #[serde(default)]
    pub flex_grow: Option<f32>,
    #[serde(default)]
    pub flex_shrink: Option<f32>,
    #[serde(default)]
    pub flex_basis: Option<Length>,
    #[serde(default)]
    pub gap: Option<Length>,
    #[serde(default)]
    pub row_gap: Option<Length>,
    #[serde(default)]
    pub column_gap: Option<Length>,

    // --- grid ---
    #[serde(default)]
    pub grid_auto_flow: Option<String>,
    #[serde(default)]
    pub grid_template_rows: Option<String>,
    #[serde(default)]
    pub grid_template_columns: Option<String>,
    #[serde(default)]
    pub grid_auto_rows: Option<String>,
    #[serde(default)]
    pub grid_auto_columns: Option<String>,
    #[serde(default)]
    pub grid_row: Option<String>,
    #[serde(default)]
    pub grid_column: Option<String>,

    // --- visual (sibling components) ---
    /// Hex background color (`#rrggbb` / `#rrggbbaa`).
    #[serde(default)]
    pub background_color: Option<String>,
    /// Hex border color (applied to all sides).
    #[serde(default)]
    pub border_color: Option<String>,
    /// Corner radii; same forms as the other rect fields (corners are
    /// top-left, top-right, bottom-right, bottom-left).
    #[serde(default)]
    pub border_radius: Option<Rect>,
    #[serde(default)]
    pub outline: Option<OutlineSpec>,
    #[serde(default)]
    pub box_shadow: Option<BoxShadowSpec>,
    /// Background gradient(s); one gradient or a layered list. bevy paints it
    /// *over* `backgroundColor` (CSS `background-image` semantics): an opaque
    /// gradient hides the color (fallback); transparent stops reveal it.
    #[serde(default)]
    pub background_gradient: Option<GradientList>,
    /// Border gradient(s); one gradient or a layered list. Painted *over*
    /// `borderColor` (needs a `border` width to be visible).
    #[serde(default)]
    pub border_gradient: Option<GradientList>,
    #[serde(default)]
    pub z_index: Option<i32>,

    // --- transform / opacity (drive `UiTransform` and color alpha) ---
    /// Static transform (translate/scale/rotate). Mirrors the animated transform
    /// channels; written to `UiTransform`. With a [`transition`](Self::transition)
    /// a change eases instead of snapping.
    #[serde(default)]
    pub transform: Option<Transform>,
    /// Opacity in `0.0..=1.0`, multiplied into the alpha of the background (and
    /// text) color. With a [`transition`](Self::transition) a change eases.
    #[serde(default)]
    pub opacity: Option<f32>,
    /// CSS-like per-channel transition timing. Present → a change to `transform` /
    /// `opacity` / `backgroundColor` (via re-render or hover/press) animates over
    /// time using the same driver/easing engine as `animatedStyle`, rather than
    /// snapping. See [`crate::transition`].
    #[serde(default)]
    pub transition: Option<crate::transition::Transition>,

    // --- text (only meaningful on `<text>` elements/spans) ---
    /// Hex text color.
    #[serde(default)]
    pub color: Option<String>,
    /// Font size in logical pixels.
    #[serde(default)]
    pub font_size: Option<f32>,
    /// `"thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "black"`
    /// or a numeric weight string (e.g. `"600"`).
    #[serde(default)]
    pub font_weight: Option<String>,
    /// Registered font-family name to render this text with (see the plugin's
    /// `default_font`/`font` config). Unknown or unset → the configured default
    /// font.
    #[serde(default)]
    pub font_family: Option<String>,
    /// Horizontal alignment of the text block (`<text>` root only):
    /// `"left" | "center" | "right" | "justify" | "start" | "end"`.
    #[serde(default)]
    pub text_align: Option<String>,
    /// Line height. A bare number is a multiple of the font size; `{ "px": n }`
    /// is an absolute pixel height. Unset → bevy's default (1.2× the font size).
    #[serde(default)]
    pub line_height: Option<LineHeightSpec>,
    /// Letter spacing. A bare number is logical pixels; `{ "rem": n }` is a
    /// multiple of the font size. Unset → no extra spacing.
    #[serde(default)]
    pub letter_spacing: Option<LetterSpacingSpec>,
    /// A single drop shadow behind the text (`<text>` root only).
    #[serde(default)]
    pub text_shadow: Option<TextShadowSpec>,
    /// How the text wraps when it overflows its bounds (`<text>` root only):
    /// `"wordBoundary"` (default) | `"anyCharacter"` | `"wordOrCharacter"` |
    /// `"noWrap"`.
    #[serde(default)]
    pub line_break: Option<String>,
}

/// Outline drawn around (outside) the node's border box.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OutlineSpec {
    #[serde(default)]
    pub width: Option<Length>,
    #[serde(default)]
    pub offset: Option<Length>,
    #[serde(default)]
    pub color: Option<String>,
}

/// A single drop shadow.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BoxShadowSpec {
    #[serde(default)]
    pub color: Option<String>,
    #[serde(default)]
    pub x_offset: Option<Length>,
    #[serde(default)]
    pub y_offset: Option<Length>,
    #[serde(default)]
    pub spread_radius: Option<Length>,
    #[serde(default)]
    pub blur_radius: Option<Length>,
}

/// Line height for a `<text>`. A bare number is a multiple of the font size
/// (`RelativeToFont`); `{ "px": n }` is an absolute pixel height.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(untagged)]
pub enum LineHeightSpec {
    Relative(f32),
    Px { px: f32 },
}

/// Letter spacing for a `<text>`. A bare number is logical pixels; `{ "rem": n }`
/// is a multiple of the font size.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(untagged)]
pub enum LetterSpacingSpec {
    Px(f32),
    Rem { rem: f32 },
}

/// A single text drop shadow. `offsetX`/`offsetY` are displacement in logical
/// pixels (absent → bevy's default of `4.0`); `color` defaults to bevy's
/// translucent black when unset.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TextShadowSpec {
    #[serde(default)]
    pub color: Option<String>,
    #[serde(default)]
    pub offset_x: Option<f32>,
    #[serde(default)]
    pub offset_y: Option<f32>,
}

/// A single color stop for a linear/radial gradient. `position` is where the
/// color sits along the gradient line (a [`Length`]); absent → auto-spaced.
/// `hint` is the `0.0..=1.0` interpolation midpoint between this stop and the
/// next (default `0.5`).
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradientStop {
    pub color: String,
    #[serde(default)]
    pub position: Option<Length>,
    #[serde(default)]
    pub hint: Option<f32>,
}

/// A single color stop for a conic gradient. `angle` is the stop's angle in
/// **degrees** (absent → auto-spaced); `hint` as in [`GradientStop`].
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AngularStop {
    pub color: String,
    #[serde(default)]
    pub angle: Option<f32>,
    #[serde(default)]
    pub hint: Option<f32>,
}

/// Radial/conic gradient center, given as a named anchor (`"center"`, `"top"`,
/// `"topLeft"`, …). Arbitrary `Val`-offset centers are not yet supported.
pub type GradientPosition = String;

/// Color space the gradient interpolates in (`"oklab"` (default), `"oklch"`,
/// `"oklchLong"`, `"srgb"`, `"linearRgb"`, `"hsl"`, `"hslLong"`, `"hsv"`,
/// `"hsvLong"`).
pub type ColorSpace = String;

/// The size/shape of a radial gradient. Either a keyword
/// (`"closestSide" | "farthestSide" | "closestCorner" | "farthestCorner"`,
/// default `"closestCorner"`) or an explicit `{ circle }` / `{ ellipse }`.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum RadialShapeSpec {
    Keyword(String),
    Circle { circle: Length },
    Ellipse { ellipse: [Length; 2] },
}

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinearGradientSpec {
    /// Gradient line angle in **degrees** (`0` = to top, increasing clockwise).
    #[serde(default)]
    pub angle: Option<f32>,
    #[serde(default)]
    pub stops: Vec<GradientStop>,
    #[serde(default)]
    pub color_space: Option<ColorSpace>,
}

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RadialGradientSpec {
    #[serde(default)]
    pub position: Option<GradientPosition>,
    #[serde(default)]
    pub shape: Option<RadialShapeSpec>,
    #[serde(default)]
    pub stops: Vec<GradientStop>,
    #[serde(default)]
    pub color_space: Option<ColorSpace>,
}

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConicGradientSpec {
    /// Start angle in **degrees**.
    #[serde(default)]
    pub start: Option<f32>,
    #[serde(default)]
    pub position: Option<GradientPosition>,
    #[serde(default)]
    pub stops: Vec<AngularStop>,
    #[serde(default)]
    pub color_space: Option<ColorSpace>,
}

/// One gradient, discriminated by its `type` field on the wire.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum GradientSpec {
    Linear(LinearGradientSpec),
    Radial(RadialGradientSpec),
    Conic(ConicGradientSpec),
}

/// A `backgroundGradient`/`borderGradient` value: one gradient or a layered list.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum GradientList {
    One(GradientSpec),
    Many(Vec<GradientSpec>),
}

/// A static 2D transform mirroring the animated transform channels. Every field
/// is optional; unset channels stay at identity (no translation, unit scale, no
/// rotation). `scale` is uniform; `scaleX`/`scaleY` override a single axis.
#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transform {
    /// Translation along x, in logical pixels.
    pub translate_x: Option<f32>,
    /// Translation along y, in logical pixels.
    pub translate_y: Option<f32>,
    /// Uniform scale (both axes), unless overridden by `scale_x`/`scale_y`.
    pub scale: Option<f32>,
    pub scale_x: Option<f32>,
    pub scale_y: Option<f32>,
    /// Clockwise rotation in radians.
    pub rotate: Option<f32>,
}

/// A length value mirroring `bevy_ui::Val`, parsed from the wire form (a number
/// is logical pixels; a string carries an explicit unit).
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Length {
    Auto,
    Px(f32),
    Percent(f32),
    Vw(f32),
    Vh(f32),
    VMin(f32),
    VMax(f32),
}

impl Default for Length {
    fn default() -> Self {
        Length::Px(0.0)
    }
}

/// Parse a CSS-ish length token (`"auto"`, `"10px"`, `"50%"`, `"100vw"`, `"5"`).
fn parse_length(s: &str) -> Result<Length, String> {
    let s = s.trim();
    if s.eq_ignore_ascii_case("auto") {
        return Ok(Length::Auto);
    }
    // `vmin`/`vmax` before `vw`/`vh` is unnecessary (suffixes are distinct), but
    // `%` is checked last so numeric parsing handles the bare-number case.
    type LengthCtor = fn(f32) -> Length;
    let units: [(&str, LengthCtor); 6] = [
        ("px", Length::Px),
        ("vmin", Length::VMin),
        ("vmax", Length::VMax),
        ("vw", Length::Vw),
        ("vh", Length::Vh),
        ("%", Length::Percent),
    ];
    for (suffix, ctor) in units {
        if let Some(num) = s.strip_suffix(suffix) {
            let v: f32 = num
                .trim()
                .parse()
                .map_err(|_| format!("invalid length {s:?}"))?;
            return Ok(ctor(v));
        }
    }
    s.parse::<f32>()
        .map(Length::Px)
        .map_err(|_| format!("invalid length {s:?}"))
}

impl<'de> Deserialize<'de> for Length {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct LengthVisitor;
        impl<'de> Visitor<'de> for LengthVisitor {
            type Value = Length;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (logical pixels) or a CSS length string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Length, E> {
                Ok(Length::Px(v as f32))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Length, E> {
                Ok(Length::Px(v as f32))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Length, E> {
                Ok(Length::Px(v as f32))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Length, E> {
                parse_length(s).map_err(E::custom)
            }
        }
        d.deserialize_any(LengthVisitor)
    }
}

/// Four sides (or corners), each a [`Length`]. Accepts a number, a CSS shorthand
/// string, or a `{ top, right, bottom, left }` object on the wire.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Rect {
    pub top: Length,
    pub right: Length,
    pub bottom: Length,
    pub left: Length,
}

impl Rect {
    fn uniform(v: Length) -> Self {
        Rect {
            top: v,
            right: v,
            bottom: v,
            left: v,
        }
    }

    /// Expand 1–4 CSS values into four sides (top, right, bottom, left).
    fn from_shorthand(values: &[Length]) -> Result<Self, String> {
        Ok(match values {
            [a] => Rect::uniform(*a),
            [a, b] => Rect {
                top: *a,
                bottom: *a,
                right: *b,
                left: *b,
            },
            [a, b, c] => Rect {
                top: *a,
                right: *b,
                left: *b,
                bottom: *c,
            },
            [a, b, c, d] => Rect {
                top: *a,
                right: *b,
                bottom: *c,
                left: *d,
            },
            _ => return Err("expected 1–4 length values".into()),
        })
    }
}

impl<'de> Deserialize<'de> for Rect {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct RectVisitor;
        impl<'de> Visitor<'de> for RectVisitor {
            type Value = Rect;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number, a CSS shorthand string, or a {top,right,bottom,left} object")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Rect, E> {
                Ok(Rect::uniform(Length::Px(v as f32)))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Rect, E> {
                Ok(Rect::uniform(Length::Px(v as f32)))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Rect, E> {
                Ok(Rect::uniform(Length::Px(v as f32)))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Rect, E> {
                let values = s
                    .split_whitespace()
                    .map(parse_length)
                    .collect::<Result<Vec<_>, _>>()
                    .map_err(E::custom)?;
                Rect::from_shorthand(&values).map_err(E::custom)
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Rect, A::Error> {
                let mut rect = Rect::default();
                while let Some(key) = map.next_key::<String>()? {
                    let v = map.next_value::<Length>()?;
                    match key.as_str() {
                        "top" => rect.top = v,
                        "right" => rect.right = v,
                        "bottom" => rect.bottom = v,
                        "left" => rect.left = v,
                        _ => {
                            return Err(de::Error::unknown_field(
                                &key,
                                &["top", "right", "bottom", "left"],
                            ));
                        }
                    }
                }
                Ok(rect)
            }
        }
        d.deserialize_any(RectVisitor)
    }
}

/// An interaction event sent from Bevy back into JS, where the reconciler
/// dispatches it to the matching React handler.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiEvent {
    pub id: NodeId,
    /// `"click"`, a pointer kind (`"pointerDown"` / `"pointerMove"` /
    /// `"pointerUp"`), or `"change"` for an `editableText` value edit.
    pub kind: String,
    /// Cursor x within the node, normalized to `0..1` (left→right). Present only
    /// for pointer events; `None` for `"click"`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub x: Option<f32>,
    /// Cursor y within the node, normalized to `0..1` (top→bottom). Present only
    /// for pointer events; `None` for `"click"`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub y: Option<f32>,
    /// Absolute cursor x in window logical pixels (left→right, top-left origin).
    /// Present only for pointer events; lets a handler drag a node across the
    /// screen (the normalized `x`/`y` are clamped to the node and can't).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub client_x: Option<f32>,
    /// Absolute cursor y in window logical pixels (top→bottom). Present only for
    /// pointer events; see [`client_x`](Self::client_x).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub client_y: Option<f32>,
    /// The new text of an `editableText`. Present only for `"change"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
}

/// Everything that flows Bevy -> JS over the single outbound channel. Internally
/// tagged (`t`) so `serde_v8` produces a plain JS object the JS event loop can
/// `switch` on. Each variant serializes to a map, as internal tagging requires.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "t", rename_all = "camelCase")]
pub enum Outbound {
    /// A UI interaction on a reconciler node (the original click path).
    UiEvent { event: UiEvent },
    /// A named Bevy -> React app event (e.g. `"user.disconnected"`). `value` is
    /// the payload, pre-serialized so this channel stays a single concrete type.
    Event {
        name: String,
        value: serde_json::Value,
    },
    /// A reply to a React -> Bevy request, correlated by the request `id`.
    Response { id: u64, result: ResponseResult },
    /// Hot-reload sentinel: make the JS event loop exit so the runtime rebuilds.
    Reload,
}

/// The outcome of a React -> Bevy request. Internally tagged (`status`) so JS
/// reads `result.status === "ok"`. The error is a message, surfaced to JS as a
/// rejected promise — the typed success value is the only thing in the schema.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "status", rename_all = "camelCase")]
pub enum ResponseResult {
    Ok { value: serde_json::Value },
    Err { message: String },
}

#[cfg(test)]
mod tests {
    use super::*;

    /// An `<editableText>` create op carries its controlled value and attributes.
    #[test]
    fn deserializes_editable_text_create() {
        let json = r#"{"op":"create","id":7,"kind":"editableText","props":{
            "value":"hi","maxLength":40,"multiline":true,"onChange":true}}"#;
        match serde_json::from_str::<Op>(json).expect("valid op") {
            Op::Create { id, kind, props } => {
                assert_eq!(id, 7);
                assert_eq!(kind, "editableText");
                assert_eq!(props.value.as_deref(), Some("hi"));
                assert_eq!(props.max_length, Some(40));
                assert!(props.multiline);
                assert!(props.on_change);
            }
            other => panic!("expected create, got {other:?}"),
        }
    }

    /// A style carries `transform`/`opacity`/`transition` over the wire (transform
    /// as a nested object, transition's `transform` entry resolving to a timing).
    #[test]
    fn deserializes_transform_opacity_and_transition() {
        let s: Style = serde_json::from_str(
            r#"{
                "transform": { "scale": 0.95, "translateX": 4 },
                "opacity": 0.5,
                "transition": { "transform": { "duration": 0.15, "easing": "easeOut" } }
            }"#,
        )
        .expect("style decodes");
        let t = s.transform.expect("transform present");
        assert_eq!(t.scale, Some(0.95));
        assert_eq!(t.translate_x, Some(4.0));
        assert_eq!(t.scale_x, None);
        assert_eq!(s.opacity, Some(0.5));
        let transition = s.transition.expect("transition present");
        assert!(transition.for_transform().is_some());
        assert!(transition.for_opacity().is_none());
    }

    /// A `change` event serializes its new text as camelCase `value`, while the
    /// pointer-only fields stay omitted.
    #[test]
    fn serializes_change_event_with_value() {
        let ev = UiEvent {
            id: 7,
            kind: "change".into(),
            value: Some("hello".into()),
            ..Default::default()
        };
        let v = serde_json::to_value(&ev).expect("serializable");
        assert_eq!(v["kind"], "change");
        assert_eq!(v["value"], "hello");
        assert!(v.get("clientX").is_none(), "pointer fields omitted");
    }
}
