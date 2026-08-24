//! [`Props`] — the content/attribute level of a host element — and its
//! dirty/event bookkeeping ([`PropsDirty`], [`UpdateEvents`]).

use serde::Deserialize;

use crate::canvas::DrawCmd;

use super::background_image::{AtlasSpec, ImageMode, SourceRect};
use super::style::{Style, StyleDirty};

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
    /// Whether this element has an `onWheel` handler registered in JS. Present →
    /// the reconciler stamps a [`crate::bridge::WheelListener`] so
    /// [`crate::scroll::collect_wheel_events`] reports raw wheel deltas over the
    /// node (any node, unlike `onScroll`, which needs `overflow: scroll`).
    #[serde(default)]
    pub on_wheel: bool,

    /// World-anchor binding for an `<anchor>` element: the Bevy entity to follow and
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

    // --- `canvas` element attributes ---
    /// The declarative display list for a `canvas` element: an ordered batch of
    /// vector draw commands (the recorded form of an HTML-canvas-like
    /// `ctx.moveTo/lineTo/…` session). Present → the retained surface is
    /// **cleared and the list replayed** (raster state reset first).
    /// `Some(vec![])` clears the canvas; absent leaves the retained pixels.
    /// Imperative (accumulating) drawing rides [`super::op::Op::Draw`] instead.
    #[serde(default)]
    pub draw: Option<Vec<DrawCmd>>,
    /// Whether this element has an `onResize` handler registered in JS. Cached
    /// only so the delta stays truthful — `"resize"` events are **not** gated
    /// on it (the JS runtime consumes them unconditionally, to replay a
    /// declarative painter and keep the canvas handle's size fresh).
    #[serde(default)]
    pub on_resize: bool,

    // --- identity ---
    /// The element's `name` prop: stamped on the entity as a Bevy `Name` and
    /// indexed by name (see [`crate::ReactNodes`]) so app systems can find
    /// React-created entities. Dynamic — a delta replaces the component,
    /// `unset` (or an empty string) removes it. Bridge-owned on React nodes.
    #[serde(default)]
    pub name: Option<String>,

    // --- `portal` element attribute ---
    /// The render-target name a `portal` element displays. The reconciler stamps
    /// a `crate::portal::RPortal` carrying it; the binding system points the
    /// node's `ImageNode` at the texture the app registered under this name (or a
    /// transparent placeholder until it appears). Pure-serde, Bevy-free.
    #[serde(default)]
    pub target: Option<String>,

    // --- `svg` element + shape-child attributes ---
    /// The folded SVG attributes of a shape child (`<circle>`/`<rect>`/…)
    /// inside an `<svg>` element. The JS side folds the flat JSX attrs into
    /// this one object; on update it **replaces atomically** (see
    /// [`Props::merge_delta`]).
    #[serde(default)]
    pub shape: Option<crate::svg::ShapeAttrs>,
    /// The `<svg>` element's `viewBox` (`"minX minY width height"`), parsed
    /// at the serde boundary. (`rename_all = "camelCase"` yields exactly the
    /// `viewBox` wire name — pinned by a test.)
    #[serde(default, deserialize_with = "crate::svg::de_view_box")]
    pub view_box: Option<crate::svg::ViewBox>,

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

/// Which parts of a [`Props`] a delta update touched; drives which of the
/// reconciler's `apply_*` helpers run. Style granularity lives in
/// [`StyleDirty`]; the other flags are per prop group.
#[derive(Debug, Clone, Copy, Default)]
pub struct PropsDirty {
    /// Style groups touched via `style` / `style_unset`.
    pub style: StyleDirty,
    /// `hoverStyle` set or unset.
    pub hover_style: bool,
    /// `pressStyle` set or unset.
    pub press_style: bool,
    /// `focusStyle` set or unset.
    pub focus_style: bool,
    /// Any of `onClick` / `onPointerDown|Move|Up|Enter|Leave` toggled.
    pub pointer: bool,
    /// `onScroll` toggled.
    pub scroll_listener: bool,
    /// `onWheel` toggled.
    pub wheel: bool,
    /// `scrollStep` changed.
    pub scroll_step: bool,
    /// `anchor` changed.
    pub anchor: bool,
    /// Any `image` attribute (`src`/`tint`/`flipX`/`flipY`/`imageMode`/
    /// `sourceRect`/`atlas`/`visualBox`) changed.
    pub image: bool,
    /// `name` (the entity's Bevy `Name`) set or unset.
    pub name: bool,
    /// `target` (portal/surface binding) changed.
    pub target: bool,
    /// `shape` (an SVG shape child's folded attrs) changed.
    pub shape: bool,
    /// `viewBox` (an `<svg>` element's user-unit rect) changed.
    pub view_box: bool,
    /// Any `editableText` handler flag (`onChange`/`onSelect`/`onFocus`/
    /// `onBlur`) toggled.
    pub editable_handlers: bool,
    /// `ariaLabel` changed.
    pub aria_label: bool,
}

impl PropsDirty {
    /// Whether the [`crate::bridge::StyleVariants`] component needs rebuilding:
    /// its `base` mirrors `style`, so any style-field change counts too.
    pub fn any_style_variant(&self) -> bool {
        self.style.any() || self.hover_style || self.press_style || self.focus_style
    }
}

/// The "act now" props of an update, split from the retained state: pushed
/// into the live widget once and never stored, so an unrelated later delta
/// can't replay them (re-push a controlled value, re-clone a canvas display
/// list). Absent fields mean "no event", exactly like the pre-delta protocol.
#[derive(Debug, Default)]
pub struct UpdateEvents {
    /// Controlled `editableText` value to push (when diverging).
    pub value: Option<String>,
    /// Controlled selection anchor (UTF-8 byte offset).
    pub selection_start: Option<usize>,
    /// Controlled selection focus (UTF-8 byte offset).
    pub selection_end: Option<usize>,
    /// Controlled vertical scroll offset.
    pub scroll_top: Option<f32>,
    /// Controlled horizontal scroll offset.
    pub scroll_left: Option<f32>,
    /// A `<canvas>` display list to clear + replay.
    pub draw: Option<Vec<DrawCmd>>,
}

/// Test helper shared by the protocol submodules' unit tests: decode a
/// `Props` from a JSON value, panicking on malformed input.
#[cfg(test)]
pub(crate) fn props_from_json(json: serde_json::Value) -> Props {
    serde_json::from_value(json).expect("valid props")
}
