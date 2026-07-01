//! The wire protocol shared between the JS reconciler and the Bevy side.
//!
//! Everything here derives `serde` so deno_core's `serde_v8` can convert
//! directly between the plain JS objects the reconciler builds and these Rust
//! types — no JSON strings on the hot path. These types are deliberately
//! **bevy-free**: the translation into `bevy_ui` components lives in
//! [`crate::ui_map`]. Ops only ever flow JS -> Rust, so they need `Deserialize`
//! only; `UiEvent` flows Rust -> JS and is `Serialize`.
//!
//! The unit-bearing wire types (`Length`/`Angle`/`Time`/`FontSize`) parse here at
//! the serde boundary. A malformed string must **not** fail the whole batch (one
//! typo would abort the entire commit and trigger a reload), so their
//! `Deserialize` impls fall back to a default and emit a `tracing::warn!` naming
//! the bad value — using the neutral `tracing` facade (not bevy types) so the
//! module stays bevy-free while reaching the same log sink `bevy_log` drains.

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
        /// Inline text content for a single-string `<text>`/`<textSpan>` (the
        /// `shouldSetTextContent` fast path — no separate child text entity).
        #[serde(default)]
        text: Option<String>,
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
    /// Style overlaid on `style` while the element is focused (currently
    /// `editableText`). Applied on the Bevy side from the node's focus state, so
    /// focus styling needs no React round-trip.
    #[serde(default)]
    pub focus_style: Option<Style>,
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
    /// Whether this element has an `onPointerEnter` handler registered in JS.
    /// Fires once when the pointer enters the element (hover begins).
    #[serde(default)]
    pub on_pointer_enter: bool,
    /// Whether this element has an `onPointerLeave` handler registered in JS.
    /// Fires once when the pointer leaves the element (hover ends).
    #[serde(default)]
    pub on_pointer_leave: bool,

    // --- controlled scroll (any node with `overflow: scroll`) ---
    /// Controlled vertical scroll offset (logical px) → `ScrollPosition.y`. On
    /// update it's pushed into the node only when it diverges from the live offset
    /// (so a re-render echoing the user's own wheel scroll is a no-op — see
    /// [`crate::reconcile`]). Each axis is independent; absent leaves it alone.
    #[serde(default)]
    pub scroll_top: Option<f32>,
    /// Controlled horizontal scroll offset (logical px) → `ScrollPosition.x`.
    #[serde(default)]
    pub scroll_left: Option<f32>,
    /// Logical pixels scrolled per mouse-wheel "line" for this container, overriding
    /// the default. Maps to [`crate::bridge::ScrollStep`]; only scales `Line`-unit
    /// wheels (trackpad `Pixel` deltas are used raw).
    #[serde(default)]
    pub scroll_step: Option<f32>,
    /// Whether this element has an `onScroll` handler registered in JS. Present →
    /// the reconciler stamps a [`crate::bridge::ScrollListener`] so the read-back
    /// system reports offset changes (kept cheap by scoping its `Changed` query to
    /// that marker, since `ScrollPosition` is a required component of every `Node`).
    #[serde(default)]
    pub on_scroll: bool,

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
    /// How the image fits its box: the keyword `"auto"`/`"stretch"`, or a
    /// `type`-tagged object for 9-slice (`"sliced"`) / `"tiled"` scaling.
    #[serde(default)]
    pub image_mode: Option<ImageMode>,
    /// Source sub-rect of the texture to display, in source-texture pixels.
    /// Maps to `ImageNode.rect`. With `atlas`, it offsets from the atlas cell's
    /// top-left corner.
    #[serde(default)]
    pub source_rect: Option<SourceRect>,
    /// Treat `src` as a uniform sprite-sheet grid and select one cell. Maps to
    /// `ImageNode.texture_atlas` (builds/caches a `TextureAtlasLayout`).
    #[serde(default)]
    pub atlas: Option<AtlasSpec>,
    /// Which box of the node the image fills: `"content"` | `"padding"`
    /// (default) | `"border"`. Maps to `ImageNode.visual_box`.
    #[serde(default)]
    pub visual_box: Option<String>,

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
    /// Focus an `editableText` when it mounts (inserts `AutoFocus`).
    #[serde(default)]
    pub autofocus: bool,
    /// Controlled selection anchor, a UTF-8 **byte** offset into the value.
    /// When `selection_start`/`selection_end` diverge from the live selection
    /// they're pushed into the widget (see [`crate::reconcile`]).
    #[serde(default)]
    pub selection_start: Option<usize>,
    /// Controlled selection focus, a UTF-8 **byte** offset into the value.
    #[serde(default)]
    pub selection_end: Option<usize>,
    /// Accessible name announced to assistive tech (sets the a11y node's label).
    #[serde(default)]
    pub aria_label: Option<String>,
    /// Whether this element has an `onSelect` handler registered in JS.
    #[serde(default)]
    pub on_select: bool,
    /// Whether this element has an `onFocus` handler registered in JS.
    #[serde(default)]
    pub on_focus: bool,
    /// Whether this element has an `onBlur` handler registered in JS.
    #[serde(default)]
    pub on_blur: bool,
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
    /// Border color: a single CSS color (all four sides) or a
    /// `{ top, right, bottom, left }` object (omitted sides → transparent).
    #[serde(default)]
    pub border_color: Option<BorderColorSpec>,
    /// Corner radii; same forms as the other rect fields (corners are
    /// top-left, top-right, bottom-right, bottom-left).
    #[serde(default)]
    pub border_radius: Option<Rect>,
    #[serde(default)]
    pub outline: Option<OutlineSpec>,
    #[serde(default)]
    pub box_shadow: Option<BoxShadowList>,
    /// CSS-like `filter`: per-pixel visual effects (`blur`, `brightness`,
    /// `contrast`, `saturate`, `grayscale`, `sepia`, `invert`, `hueRotate`)
    /// applied to the element's **own surface** (its image or background) via a
    /// custom `UiMaterial` shader. Unlike CSS it does *not* cascade to descendants
    /// — a `MaterialNode` renders only the node itself, so children/text draw on
    /// top unfiltered. Present → the reconciler swaps the node's `ImageNode` /
    /// `BackgroundColor` draw for a `MaterialNode<FilterMaterial>` (see
    /// [`crate::filter`]).
    #[serde(default)]
    pub filter: Option<FilterSpec>,
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
    /// Global stacking order: lifts the node (and its subtree) into the UI's
    /// top-level stack, escaping the parent stacking context. Unlike [`z_index`](Self::z_index),
    /// which only reorders a node among its siblings.
    #[serde(default)]
    pub global_z_index: Option<i32>,
    /// Pointer pass-through. Maps to `bevy::ui::FocusPolicy`. `"pass"` lets pointer
    /// interaction fall through to nodes behind this one; `"block"` makes it
    /// *capture* interaction so siblings, the 3D scene, and portals behind it don't
    /// receive it. When unset the default is element-dependent (set in the
    /// reconciler): a `<button>` blocks, a `<node>`/container passes.
    #[serde(default)]
    pub focus_policy: Option<String>,

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
    /// Font size: a number (logical pixels) or a unit string (`"24px"`, `"2vw"`,
    /// `"1.5rem"`). See [`FontSize`].
    #[serde(default)]
    pub font_size: Option<FontSize>,
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

/// A `boxShadow` value: one shadow or a stacked list (CSS `box-shadow: a, b, …`).
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum BoxShadowList {
    One(BoxShadowSpec),
    Many(Vec<BoxShadowSpec>),
}

/// A CSS-like `filter`: each field is one filter function, mirroring CSS naming.
/// Every field is optional; unset means identity (no effect). Amounts follow the
/// CSS convention: `brightness`/`contrast`/`saturate` are multipliers (`1.0` =
/// identity), `grayscale`/`sepia`/`invert` are `0.0..=1.0` blends (`0` = identity),
/// `blur` is a radius (a [`Length`] in px), and `hueRotate` is an [`Angle`]. The
/// functions are applied in a fixed canonical order (blur → brightness → contrast
/// → saturate → grayscale → sepia → invert → hueRotate), not the declared order,
/// so listing the same function twice is not supported. See [`crate::filter`].
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterSpec {
    /// Gaussian blur radius (a [`Length`], px). `0`/absent → no blur.
    #[serde(default)]
    pub blur: Option<Length>,
    /// Brightness multiplier (`1.0` = identity, `0.0` = black, `>1` brighter).
    #[serde(default)]
    pub brightness: Option<f32>,
    /// Contrast multiplier about mid-grey (`1.0` = identity).
    #[serde(default)]
    pub contrast: Option<f32>,
    /// Saturation multiplier (`1.0` = identity, `0.0` = grayscale, `>1` more vivid).
    #[serde(default)]
    pub saturate: Option<f32>,
    /// Grayscale amount (`0.0` = identity, `1.0` = fully desaturated).
    #[serde(default)]
    pub grayscale: Option<f32>,
    /// Sepia amount (`0.0` = identity, `1.0` = full sepia tone).
    #[serde(default)]
    pub sepia: Option<f32>,
    /// Invert amount (`0.0` = identity, `1.0` = fully inverted colors).
    #[serde(default)]
    pub invert: Option<f32>,
    /// Hue rotation (an [`Angle`]; number = degrees). `0`/absent → no rotation.
    #[serde(default)]
    pub hue_rotate: Option<Angle>,
}

/// Line height for a `<text>`. A bare number is a multiple of the font size
/// (`RelativeToFont`); a string carries a unit (`"20px"` absolute, `"1.5"` / `"1.5em"`
/// a multiple); `{ "px": n }` is an absolute pixel height (legacy object form).
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum LineHeightSpec {
    Relative(f32),
    Px { px: f32 },
    Str(String),
}

/// Letter spacing for a `<text>`. A bare number is logical pixels; a string carries
/// a unit (`"2px"`, `"0.1rem"`/`"0.1em"` for a font-size multiple, or `"normal"`);
/// `{ "rem": n }` is a multiple of the font size (legacy object form).
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum LetterSpacingSpec {
    Px(f32),
    Rem { rem: f32 },
    Str(String),
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
    pub angle: Option<Angle>,
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
    /// Gradient line angle (number = degrees, or a unit string; `0` = to top,
    /// increasing clockwise).
    #[serde(default)]
    pub angle: Option<Angle>,
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
    /// Start angle (number = degrees, or a unit string).
    #[serde(default)]
    pub start: Option<Angle>,
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

/// How an `image` fits its node. A bare string (`"auto"`/`"stretch"`) maps to the
/// trivial `bevy_ui` modes; the `type`-tagged object forms map to bevy's 9-slice
/// (`"sliced"`) and `"tiled"` scaling. Bevy-free; converted to `NodeImageMode` in
/// `ui_map`.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum ImageMode {
    /// `"auto"` or `"stretch"` (any unknown keyword falls back to `Auto`).
    Keyword(String),
    Spec(ImageModeSpec),
}

/// The object forms of [`ImageMode`], discriminated by their `type` field.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ImageModeSpec {
    Sliced(SliceSpec),
    Tiled(TiledSpec),
}

/// 9-slice scaling parameters, mirroring `bevy_sprite::TextureSlicer`.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SliceSpec {
    /// Border insets, in *source-texture pixels*, dividing the texture into nine
    /// sections.
    #[serde(default)]
    pub border: SliceBorder,
    /// How the center section scales (default: stretch).
    #[serde(default)]
    pub center_scale_mode: Option<SliceScale>,
    /// How the four side sections scale (default: stretch).
    #[serde(default)]
    pub sides_scale_mode: Option<SliceScale>,
    /// Maximum scale of the four corner sections (bevy default `1.0`).
    #[serde(default)]
    pub max_corner_scale: Option<f32>,
}

/// 9-slice border insets: a single number (uniform) or per-side, in *source-texture
/// pixels*.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(untagged)]
pub enum SliceBorder {
    /// No border supplied → zero insets.
    #[default]
    Zero,
    /// The same inset along every edge.
    Uniform(f32),
    /// Per-edge insets.
    Sides {
        #[serde(default)]
        top: f32,
        #[serde(default)]
        right: f32,
        #[serde(default)]
        bottom: f32,
        #[serde(default)]
        left: f32,
    },
}

/// How a 9-slice section scales when resized: `"stretch"` (the keyword) or
/// `{ tile }`, where `tile` is the repeat `stretch_value`.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum SliceScale {
    Keyword(String),
    Tile { tile: f32 },
}

/// `"tiled"` scaling: the whole image repeats once stretched beyond `stretch_value`.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TiledSpec {
    #[serde(default)]
    pub tile_x: bool,
    #[serde(default)]
    pub tile_y: bool,
    /// Repeat threshold (bevy default `1.0`).
    #[serde(default)]
    pub stretch_value: Option<f32>,
}

/// A source sub-rect in texture pixels: top-left (`x`, `y`) plus `width`/`height`.
/// Converted to a `bevy_math::Rect` (min/max corners) in `ui_map`.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceRect {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

/// A uniform sprite-sheet grid plus the selected cell. Mirrors
/// `TextureAtlasLayout::from_grid` (tile size, columns, rows, optional padding /
/// offset, all in source-texture pixels) + `TextureAtlas.index`. Bevy-free;
/// turned into a cached `TextureAtlasLayout` asset in `ui_map`.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AtlasSpec {
    pub tile_width: u32,
    pub tile_height: u32,
    pub columns: u32,
    pub rows: u32,
    /// Padding between cells (`[x, y]` px), if any.
    #[serde(default)]
    pub padding: Option<[u32; 2]>,
    /// Offset of the grid's top-left from the texture origin (`[x, y]` px).
    #[serde(default)]
    pub offset: Option<[u32; 2]>,
    /// Which cell to display (row-major). Default `0`.
    #[serde(default)]
    pub index: usize,
}

/// A static 2D transform mirroring the animated transform channels. Every field
/// is optional; unset channels stay at identity (no translation, unit scale, no
/// rotation). `scale` is uniform; `scaleX`/`scaleY` override a single axis.
#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transform {
    /// Translation along x — a length (number = logical pixels, or a unit string
    /// like `"50%"`, resolved against the node's own size by `bevy_ui`).
    pub translate_x: Option<Length>,
    /// Translation along y — a length (number = logical pixels, or a unit string
    /// like `"50%"`).
    pub translate_y: Option<Length>,
    /// Uniform scale (both axes), unless overridden by `scale_x`/`scale_y`.
    pub scale: Option<f32>,
    pub scale_x: Option<f32>,
    pub scale_y: Option<f32>,
    /// Clockwise rotation (number = degrees, or a unit string like `"1.5rad"`).
    pub rotate: Option<Angle>,
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
                Ok(parse_length(s).unwrap_or_else(|e| {
                    tracing::warn!(target: "bevy_react", "{e}; using the default");
                    Length::default()
                }))
            }
        }
        d.deserialize_any(LengthVisitor)
    }
}

/// An angle, parsed from the wire as a number (read as **degrees**, the CSS
/// convention) or a unit string (`"45deg"`, `"1.5rad"`, `"0.25turn"`, `"100grad"`).
/// Stored internally as radians — the unit Bevy's gradient and transform APIs want.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Angle(f32);

impl Angle {
    /// This angle in radians.
    pub fn radians(self) -> f32 {
        self.0
    }
}

/// Parse a CSS angle token into radians. A bare number is degrees; a suffix of
/// `deg`/`grad`/`turn`/`rad` selects the unit (`grad` is matched before `rad`
/// since `"100grad"` also ends in `"rad"`).
fn parse_angle(s: &str) -> Result<f32, String> {
    use std::f32::consts::{PI, TAU};
    let s = s.trim();
    type AngleConv = fn(f32) -> f32;
    let units: [(&str, AngleConv); 4] = [
        ("deg", f32::to_radians),
        ("grad", |v| v * PI / 200.0),
        ("turn", |v| v * TAU),
        ("rad", |v| v),
    ];
    for (suffix, conv) in units {
        if let Some(num) = s.strip_suffix(suffix) {
            let v: f32 = num
                .trim()
                .parse()
                .map_err(|_| format!("invalid angle {s:?}"))?;
            return Ok(conv(v));
        }
    }
    s.parse::<f32>()
        .map(f32::to_radians)
        .map_err(|_| format!("invalid angle {s:?}"))
}

impl<'de> Deserialize<'de> for Angle {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct AngleVisitor;
        impl Visitor<'_> for AngleVisitor {
            type Value = Angle;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (degrees) or a CSS angle string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Angle, E> {
                Ok(Angle((v as f32).to_radians()))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Angle, E> {
                Ok(Angle((v as f32).to_radians()))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Angle, E> {
                Ok(Angle((v as f32).to_radians()))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Angle, E> {
                Ok(parse_angle(s).map(Angle).unwrap_or_else(|e| {
                    tracing::warn!(target: "bevy_react", "{e}; using the default");
                    Angle::default()
                }))
            }
        }
        d.deserialize_any(AngleVisitor)
    }
}

/// A time/duration, parsed from the wire as a number (read as **milliseconds**,
/// the JS-facing unit) or a unit string (`"200ms"`, `"0.2s"`). Stored as seconds —
/// the unit the animations engine and the transition driver consume.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Time(f32);

impl Time {
    /// Construct from a value already in seconds.
    pub fn from_secs(secs: f32) -> Self {
        Time(secs)
    }
    /// This duration in seconds.
    pub fn seconds(self) -> f32 {
        self.0
    }
}

/// Parse a CSS time token into seconds. A bare number is milliseconds; a suffix of
/// `ms`/`s` selects the unit (`ms` is matched before `s` since `"200ms"` also ends
/// in `"s"`).
fn parse_time(s: &str) -> Result<f32, String> {
    let s = s.trim();
    if let Some(num) = s.strip_suffix("ms") {
        return num
            .trim()
            .parse::<f32>()
            .map(|v| v / 1000.0)
            .map_err(|_| format!("invalid time {s:?}"));
    }
    if let Some(num) = s.strip_suffix('s') {
        return num
            .trim()
            .parse::<f32>()
            .map_err(|_| format!("invalid time {s:?}"));
    }
    s.parse::<f32>()
        .map(|v| v / 1000.0)
        .map_err(|_| format!("invalid time {s:?}"))
}

impl<'de> Deserialize<'de> for Time {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct TimeVisitor;
        impl Visitor<'_> for TimeVisitor {
            type Value = Time;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (milliseconds) or a CSS time string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<Time, E> {
                Ok(Time(v as f32 / 1000.0))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<Time, E> {
                Ok(Time(v as f32 / 1000.0))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<Time, E> {
                Ok(Time(v as f32 / 1000.0))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<Time, E> {
                Ok(parse_time(s).map(Time).unwrap_or_else(|e| {
                    tracing::warn!(target: "bevy_react", "{e}; using the default");
                    Time::default()
                }))
            }
        }
        d.deserialize_any(TimeVisitor)
    }
}

/// A font size mirroring `bevy_text::FontSize`, parsed from the wire as a number
/// (logical pixels) or a unit string (`"24px"`, `"100vw"`/`vh`/`vmin`/`vmax`,
/// `"1.5rem"`). `rem` is relative to bevy's `RemSize` resource (default 20px).
/// (CSS `em` has no `bevy_text` equivalent, so it is not accepted.)
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum FontSize {
    Px(f32),
    Vw(f32),
    Vh(f32),
    VMin(f32),
    VMax(f32),
    Rem(f32),
}

/// Parse a font-size token (`"24px"`, `"100vw"`, `"1.5rem"`, or a bare number read
/// as pixels). Suffixes are checked longest-first where they'd otherwise alias
/// (`vmin`/`vmax` before `vw`/`vh`).
fn parse_font_size(s: &str) -> Result<FontSize, String> {
    let s = s.trim();
    type FsCtor = fn(f32) -> FontSize;
    let units: [(&str, FsCtor); 6] = [
        ("px", FontSize::Px),
        ("rem", FontSize::Rem),
        ("vmin", FontSize::VMin),
        ("vmax", FontSize::VMax),
        ("vw", FontSize::Vw),
        ("vh", FontSize::Vh),
    ];
    for (suffix, ctor) in units {
        if let Some(num) = s.strip_suffix(suffix) {
            let v: f32 = num
                .trim()
                .parse()
                .map_err(|_| format!("invalid fontSize {s:?}"))?;
            return Ok(ctor(v));
        }
    }
    s.parse::<f32>()
        .map(FontSize::Px)
        .map_err(|_| format!("invalid fontSize {s:?}"))
}

impl<'de> Deserialize<'de> for FontSize {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct FontSizeVisitor;
        impl Visitor<'_> for FontSizeVisitor {
            type Value = FontSize;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a number (logical pixels) or a font-size unit string")
            }
            fn visit_f64<E: de::Error>(self, v: f64) -> Result<FontSize, E> {
                Ok(FontSize::Px(v as f32))
            }
            fn visit_i64<E: de::Error>(self, v: i64) -> Result<FontSize, E> {
                Ok(FontSize::Px(v as f32))
            }
            fn visit_u64<E: de::Error>(self, v: u64) -> Result<FontSize, E> {
                Ok(FontSize::Px(v as f32))
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<FontSize, E> {
                Ok(parse_font_size(s).unwrap_or_else(|e| {
                    tracing::warn!(target: "bevy_react", "{e}; using the default");
                    FontSize::Px(0.0)
                }))
            }
        }
        d.deserialize_any(FontSizeVisitor)
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
                // A bad token or value-count must not throw (that aborts the whole
                // commit batch and wedges the reconciler) — warn and fall back.
                let values: Vec<Length> = s
                    .split_whitespace()
                    .map(|tok| {
                        parse_length(tok).unwrap_or_else(|e| {
                            tracing::warn!(target: "bevy_react", "{e}; using the default");
                            Length::default()
                        })
                    })
                    .collect();
                Ok(Rect::from_shorthand(&values).unwrap_or_else(|e| {
                    tracing::warn!(target: "bevy_react", "invalid rect {s:?}: {e}; using the default");
                    Rect::default()
                }))
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
                        // An unknown side key must not throw (that aborts the whole
                        // commit batch) — `v` is already consumed, so warn and skip.
                        _ => tracing::warn!(
                            target: "bevy_react",
                            "unknown rect side {key:?}; ignoring (expected top/right/bottom/left)"
                        ),
                    }
                }
                Ok(rect)
            }
        }
        d.deserialize_any(RectVisitor)
    }
}

/// Border color: a single CSS color applied to all four sides, or a
/// `{ top, right, bottom, left }` object setting sides individually. Omitted
/// sides decode to `None` (painted transparent — bevy's `BorderColor` default).
///
/// Unlike [`Rect`], a multi-value string (`"red green blue"`) is **not** accepted:
/// CSS color functions contain spaces (`rgb(1 2 3)`), so whitespace-splitting
/// would be ambiguous. Per-side colors go through the object form only.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct BorderColorSpec {
    pub top: Option<String>,
    pub right: Option<String>,
    pub bottom: Option<String>,
    pub left: Option<String>,
}

impl BorderColorSpec {
    /// One color on every side (the back-compat scalar form).
    fn uniform(s: String) -> Self {
        BorderColorSpec {
            top: Some(s.clone()),
            right: Some(s.clone()),
            bottom: Some(s.clone()),
            left: Some(s),
        }
    }
}

impl<'de> Deserialize<'de> for BorderColorSpec {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct BorderColorVisitor;
        impl<'de> Visitor<'de> for BorderColorVisitor {
            type Value = BorderColorSpec;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a CSS color string or a {top,right,bottom,left} object of colors")
            }
            fn visit_str<E: de::Error>(self, s: &str) -> Result<BorderColorSpec, E> {
                Ok(BorderColorSpec::uniform(s.to_owned()))
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<BorderColorSpec, A::Error> {
                let mut spec = BorderColorSpec::default();
                while let Some(key) = map.next_key::<String>()? {
                    let v = map.next_value::<String>()?;
                    match key.as_str() {
                        "top" => spec.top = Some(v),
                        "right" => spec.right = Some(v),
                        "bottom" => spec.bottom = Some(v),
                        "left" => spec.left = Some(v),
                        // An unknown side key must not throw (that aborts the whole
                        // commit batch) — `v` is already consumed, so warn and skip.
                        _ => tracing::warn!(
                            target: "bevy_react",
                            "unknown borderColor side {key:?}; ignoring (expected top/right/bottom/left)"
                        ),
                    }
                }
                Ok(spec)
            }
        }
        d.deserialize_any(BorderColorVisitor)
    }
}

/// An interaction event sent from Bevy back into JS, where the reconciler
/// dispatches it to the matching React handler.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiEvent {
    pub id: NodeId,
    /// `"click"`, a pointer kind (`"pointerDown"` / `"pointerMove"` /
    /// `"pointerUp"` / `"pointerEnter"` / `"pointerLeave"`), `"scroll"`, or one of
    /// an `editableText`'s `"change"` / `"select"` / `"focus"` / `"blur"` events.
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
    /// Selection anchor, a UTF-8 **byte** offset. Present only for `"select"`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selection_start: Option<usize>,
    /// Selection focus, a UTF-8 **byte** offset. Present only for `"select"`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selection_end: Option<usize>,
    /// `"forward"` (anchor ≤ focus), `"backward"`, or `"none"` (collapsed).
    /// Present only for `"select"`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selection_direction: Option<String>,
    /// Whether an IME composition is in progress. Present on an `editableText`'s
    /// `"change"` / `"select"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub composing: Option<bool>,
    /// Vertical scroll offset (logical px) → `ScrollPosition.y`. Present only for
    /// `"scroll"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scroll_top: Option<f32>,
    /// Horizontal scroll offset (logical px) → `ScrollPosition.x`. Present only for
    /// `"scroll"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scroll_left: Option<f32>,
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
            "value":"hi","maxLength":40,"multiline":true,"onChange":true,
            "autofocus":true,"selectionStart":0,"selectionEnd":2,
            "ariaLabel":"Name","onSelect":true,"onFocus":true,"onBlur":true,
            "focusStyle":{"borderColor":"white"}}}"#;
        match serde_json::from_str::<Op>(json).expect("valid op") {
            Op::Create {
                id, kind, props, ..
            } => {
                assert_eq!(id, 7);
                assert_eq!(kind, "editableText");
                assert_eq!(props.value.as_deref(), Some("hi"));
                assert_eq!(props.max_length, Some(40));
                assert!(props.multiline);
                assert!(props.on_change);
                assert!(props.autofocus);
                assert_eq!(props.selection_start, Some(0));
                assert_eq!(props.selection_end, Some(2));
                assert_eq!(props.aria_label.as_deref(), Some("Name"));
                assert!(props.on_select);
                assert!(props.on_focus);
                assert!(props.on_blur);
                assert!(props.focus_style.is_some());
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
                "transform": { "scale": 0.95, "translateX": 4, "translateY": "50%" },
                "opacity": 0.5,
                "transition": { "transform": { "duration": 0.15, "easing": "easeOut" } }
            }"#,
        )
        .expect("style decodes");
        let t = s.transform.expect("transform present");
        assert_eq!(t.scale, Some(0.95));
        // A bare number is logical pixels; a unit string carries an explicit unit.
        assert_eq!(t.translate_x, Some(Length::Px(4.0)));
        assert_eq!(t.translate_y, Some(Length::Percent(50.0)));
        assert_eq!(t.scale_x, None);
        assert_eq!(s.opacity, Some(0.5));
        let transition = s.transition.expect("transition present");
        assert!(transition.for_transform().is_some());
        assert!(transition.for_opacity().is_none());
    }

    /// Angles parse from a bare number (degrees) or a unit string, always landing
    /// in radians.
    #[test]
    fn angle_units() {
        use std::f32::consts::{PI, TAU};
        let parse = |v: serde_json::Value| serde_json::from_value::<Angle>(v).unwrap().radians();
        assert!((parse(serde_json::json!(180)) - PI).abs() < 1e-5);
        assert!((parse(serde_json::json!("180deg")) - PI).abs() < 1e-5);
        assert!((parse(serde_json::json!("3.14159rad")) - PI).abs() < 1e-4);
        assert!((parse(serde_json::json!("0.5turn")) - PI).abs() < 1e-5);
        assert!((parse(serde_json::json!("400grad")) - TAU).abs() < 1e-5);
    }

    /// `borderColor` decodes from a scalar (uniform, back-compat) or a per-side
    /// object; omitted sides stay `None`, and an unknown side key is rejected.
    #[test]
    fn border_color_scalar_and_per_side() {
        // Scalar string → every side set (the historical form).
        let uniform: Style =
            serde_json::from_str(r#"{ "borderColor": "white" }"#).expect("scalar decodes");
        let bc = uniform.border_color.expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("white"));
        assert_eq!(bc.right.as_deref(), Some("white"));
        assert_eq!(bc.bottom.as_deref(), Some("white"));
        assert_eq!(bc.left.as_deref(), Some("white"));

        // Object form sets only the named sides; the rest stay None (transparent).
        let sided: Style =
            serde_json::from_str(r##"{ "borderColor": { "top": "#f00", "left": "blue" } }"##)
                .expect("object decodes");
        let bc = sided.border_color.expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("#f00"));
        assert_eq!(bc.left.as_deref(), Some("blue"));
        assert_eq!(bc.right, None);
        assert_eq!(bc.bottom, None);

        // An unknown side key is ignored (warned), not rejected: throwing here would
        // abort the whole commit batch and wedge the reconciler. A valid sibling key
        // still applies; the unknown one leaves all sides at their default (None).
        let bogus: Style =
            serde_json::from_str(r#"{ "borderColor": { "middle": "red", "top": "blue" } }"#)
                .expect("unknown side key must not abort deserialization");
        let bc = bogus.border_color.expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("blue"));
        assert_eq!(bc.right, None);
        assert_eq!(bc.bottom, None);
        assert_eq!(bc.left, None);
    }

    /// A malformed unit string in any unit-bearing field must **not** fail the
    /// whole `Style` (and thus the whole commit batch): it decodes to the type's
    /// default and warns. A good value alongside it still decodes correctly.
    #[test]
    fn bad_unit_values_fall_back_instead_of_aborting() {
        // Bad `width` (unknown unit) → default, sibling `height` intact.
        let s: Style = serde_json::from_str(r#"{ "width": "100pixels", "height": "40px" }"#)
            .expect("a bad length must not abort deserialization");
        assert_eq!(s.width, Some(Length::default()));
        assert_eq!(s.height, Some(Length::Px(40.0)));

        // Bad `fontSize` → default `Px(0.0)`.
        let s: Style = serde_json::from_str(r#"{ "fontSize": "16pxx" }"#)
            .expect("bad fontSize must not abort");
        assert_eq!(s.font_size, Some(FontSize::Px(0.0)));

        // Bad transform `rotate` (angle) → default `Angle(0)`, valid `translateX` intact.
        let t: Transform = serde_json::from_str(r#"{ "rotate": "45degg", "translateX": "50%" }"#)
            .expect("bad angle must not abort");
        assert_eq!(t.rotate, Some(Angle::default()));
        assert_eq!(t.translate_x, Some(Length::Percent(50.0)));

        // Rect shorthand (`padding`/`margin`/`border`/`borderRadius`): a bad token
        // defaults just that side; a good shorthand still decodes; a bad value-count
        // defaults the whole rect. None of these abort (the reported `padding: "16asd"`).
        let s: Style =
            serde_json::from_str(r#"{ "padding": "16asd" }"#).expect("bad rect must not abort");
        assert_eq!(s.padding, Some(Rect::default()));

        let s: Style = serde_json::from_str(r#"{ "padding": "8px 16asd" }"#)
            .expect("partial-bad rect must not abort");
        // top/bottom = 8px (good), right/left = default (the bad token).
        assert_eq!(
            s.padding,
            Some(Rect {
                top: Length::Px(8.0),
                bottom: Length::Px(8.0),
                right: Length::default(),
                left: Length::default(),
            })
        );

        let s: Style = serde_json::from_str(r#"{ "padding": "8px 16px" }"#)
            .expect("valid two-value shorthand decodes");
        assert_eq!(
            s.padding,
            Some(Rect {
                top: Length::Px(8.0),
                bottom: Length::Px(8.0),
                right: Length::Px(16.0),
                left: Length::Px(16.0),
            })
        );

        // Too many values (>4) → whole rect falls back to default, no abort.
        let s: Style = serde_json::from_str(r#"{ "padding": "1px 2px 3px 4px 5px" }"#)
            .expect("bad value-count must not abort");
        assert_eq!(s.padding, Some(Rect::default()));
    }

    /// A `filter` decodes its CSS-like functions: `blur`/`hueRotate` carry units
    /// (px / degrees), the rest are bare numbers; unset functions stay `None`
    /// (identity). A malformed unit value falls back to its default, not an abort.
    #[test]
    fn deserializes_filter_functions() {
        let s: Style = serde_json::from_str(
            r#"{ "filter": {
                "blur": "4px", "brightness": 1.2, "grayscale": 1,
                "saturate": 0.5, "hueRotate": 90
            } }"#,
        )
        .expect("filter decodes");
        let f = s.filter.expect("filter present");
        assert_eq!(f.blur, Some(Length::Px(4.0)));
        assert_eq!(f.brightness, Some(1.2));
        assert_eq!(f.grayscale, Some(1.0));
        assert_eq!(f.saturate, Some(0.5));
        assert!((f.hue_rotate.unwrap().radians() - std::f32::consts::FRAC_PI_2).abs() < 1e-5);
        // Unset functions stay None (identity), never a default value.
        assert_eq!(f.contrast, None);
        assert_eq!(f.sepia, None);
        assert_eq!(f.invert, None);

        // A bad unit value falls back to the type default without aborting the Style.
        let s: Style = serde_json::from_str(r#"{ "filter": { "blur": "4pxx" }, "opacity": 0.5 }"#)
            .expect("a bad filter unit must not abort the style");
        assert_eq!(s.filter.unwrap().blur, Some(Length::default()));
        assert_eq!(s.opacity, Some(0.5));
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
