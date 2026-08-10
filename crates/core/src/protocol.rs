//! The wire protocol shared between the JS reconciler and the Bevy side.
//!
//! Everything here derives `serde` so deno_core's `serde_v8` can convert
//! directly between the plain JS objects the reconciler builds and these Rust
//! types — no JSON strings on the hot path. Ops only ever flow JS -> Rust, so
//! they need `Deserialize` only; `UiEvent` flows Rust -> JS and is `Serialize`.
//!
//! Wire strings are decoded **once, here at the serde boundary** — never
//! re-parsed on apply. The unit-bearing types (`Length`/`Angle`/`Time`/
//! `FontSize`) parse into their own wire types, and the enum-like style fields
//! (`display`/`align*`/`flex*`/grid tracks/…) decode directly into the
//! `bevy_ui`/`bevy_text` values they drive, via field-level `deserialize_with`
//! (which sidesteps the orphan rule), so applying a style in [`crate::ui_map`]
//! is a plain field copy. A malformed string must **not** fail the whole batch
//! (one typo would abort the entire commit and trigger a reload), so every
//! deserializer falls back to the bevy default and emits a
//! `tracing::warn!` naming the bad value (`tracing` reaches the same log sink
//! `bevy_log` drains). In dev builds with devtools those fallbacks are also
//! collected as structured `crate::diag` entries (`decode_warn` +
//! [`OpBatch`]'s per-op attribution) so the inspector can flag the offending
//! style/prop rows.

use std::fmt;

use bevy::text::{FontWeight, Justify, LineBreak};
use bevy::ui::{
    AlignContent, AlignItems, AlignSelf, BoxSizing, Display, FlexDirection, FlexWrap, FocusPolicy,
    GridAutoFlow, GridPlacement, GridTrack, JustifyContent, JustifyItems, JustifySelf,
    OverflowAxis, PositionType, RepeatedGridTrack,
};
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
    /// Apply a prop **delta** to an existing element, against its last applied
    /// props (retained per node in `JsBridge::props_cache`).
    ///
    /// A field present in `props` is set; a wire name listed in `unset` is
    /// reset to its default (for booleans: set `false`); a field in neither is
    /// left unchanged. `props.style` is itself a field-level delta: its `Some`
    /// fields overwrite the corresponding fields of the last applied style,
    /// and style wire names listed in `style_unset` are cleared (`style_unset`
    /// applies even when `props.style` is absent). The variant styles
    /// (`hoverStyle`/`pressStyle`/`focusStyle`) and other object-valued props
    /// are atomic: present replaces the whole value, `unset` clears it.
    ///
    /// The event-like props (`value`, `selectionStart`/`selectionEnd`,
    /// `scrollTop`/`scrollLeft`, `draw`) keep their "present = act now" meaning
    /// and are never part of the retained state (see [`Props::merge_delta`]).
    Update {
        id: NodeId,
        #[serde(default)]
        props: Props,
        /// Top-level prop wire names (camelCase) reset to their defaults.
        #[serde(default)]
        unset: Vec<String>,
        /// Style field wire names (camelCase) cleared from the merged style.
        /// (The enum's `rename_all` covers variant names, not their fields, so
        /// the wire name is spelled out.)
        #[serde(default, rename = "styleUnset")]
        style_unset: Vec<String>,
    },
    /// Replace the string of a text node.
    UpdateText { id: NodeId, text: String },
    /// Append draw commands to a `canvas` element's retained surface — the
    /// imperative `getContext()` handle's microtask flush, or the JS
    /// runtime's clear+replay of a declarative painter after a resize. Paint
    /// accumulates on the retained pixels; a leading [`DrawCmd::Clear`] makes
    /// the batch a replace. Bypasses the props cache entirely (nothing is
    /// retained protocol-side). A missing or non-canvas node is skipped
    /// silently, like every other op.
    Draw { id: NodeId, cmds: Vec<DrawCmd> },
}

/// Emit a decode-fallback warning: the log line every malformed wire value
/// already produced, plus (in dev builds with devtools) a structured
/// [`crate::diag`] entry so the inspector can flag the offending row. `kind`
/// names the value's domain (`"length"`, `"rect"`, a keyword field's kind, …);
/// `value` is the raw offending wire string.
pub(crate) fn decode_warn(kind: &'static str, value: &str, message: &str) {
    tracing::warn!(target: "bevy_react", "{message}");
    crate::diag::decode_report(kind, value, message);
}

/// A `Vec<Op>` whose `Deserialize` brackets each element's decode with the
/// [`crate::diag`] decode sink's watermarks, stamping every warning a field
/// deserializer pushed with the op's target node id — the id is structurally
/// out of scope down in the field visitors, but trivially known per op here.
/// The wire format is exactly a plain op array; in release builds the
/// bracketing calls are inline no-ops and this decodes like a bare `Vec<Op>`.
pub struct OpBatch(pub Vec<Op>);

/// The node an op targets, for decode-warning attribution. Tree ops carry no
/// decodable values, so they have no meaningful target.
fn op_target_id(op: &Op) -> Option<NodeId> {
    match op {
        Op::Create { id, .. }
        | Op::CreateText { id, .. }
        | Op::CreateTextSpan { id, .. }
        | Op::Update { id, .. }
        | Op::UpdateText { id, .. }
        | Op::Draw { id, .. } => Some(*id),
        Op::Reset | Op::Append { .. } | Op::Insert { .. } | Op::Remove { .. } => None,
    }
}

impl<'de> Deserialize<'de> for OpBatch {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct BatchVisitor;
        impl<'de> Visitor<'de> for BatchVisitor {
            type Value = Vec<Op>;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("an array of reconciler ops")
            }
            fn visit_seq<A: de::SeqAccess<'de>>(self, mut seq: A) -> Result<Vec<Op>, A::Error> {
                // Clearing at batch start (not on drain) bounds the sink even
                // when nothing ever drains it, and drops entries from a batch
                // whose decode threw mid-way (Bevy never saw those ops).
                crate::diag::decode_batch_start();
                let mut ops = Vec::with_capacity(seq.size_hint().unwrap_or(0));
                loop {
                    let mark = crate::diag::decode_watermark();
                    let Some(op) = seq.next_element::<Op>()? else {
                        break;
                    };
                    crate::diag::decode_attribute_since(mark, op_target_id(&op));
                    ops.push(op);
                }
                Ok(ops)
            }
        }
        d.deserialize_seq(BatchVisitor).map(OpBatch)
    }
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
    /// Imperative (accumulating) drawing rides [`Op::Draw`] instead.
    #[serde(default)]
    pub draw: Option<Vec<DrawCmd>>,
    /// Whether this element has an `onResize` handler registered in JS. Cached
    /// only so the delta stays truthful — `"resize"` events are **not** gated
    /// on it (the JS runtime consumes them unconditionally, to replay a
    /// declarative painter and keep the canvas handle's size fresh).
    #[serde(default)]
    pub on_resize: bool,

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

/// The `canvas` display-list command type. It lives in the [`crate::canvas`]
/// module (which owns the host element and its rasterizer), and is re-exported here
/// so it stays reachable as `protocol::DrawCmd` and so [`Props::draw`] can name it.
pub use crate::canvas::DrawCmd;

/// The JSX `<svg>` shape wire types, owned by [`crate::svg`] (same ownership
/// pattern as `DrawCmd`), re-exported so they stay reachable as
/// `protocol::ShapeAttrs` etc. alongside the `Props` fields naming them.
pub use crate::svg::{
    FillRuleKind, LinecapKind, LinejoinKind, PathData, PathSeg, ShapeAttrs, ShapePaint,
    ShapeTransform, ViewBox,
};

/// The [`Style::cache`] keyword: `"auto"` (default) leaves promotion to the
/// other rules; `"always"` force-promotes the subtree to a cached composited
/// layer; `"never"` force-promotes it too but re-captures it **every frame** —
/// the escape hatch for content whose pixels are written outside the dirt
/// tracking's sight (a live `<portal>` render target, an app-owned texture).
/// Opting out of *opacity* promotion is `groupAlpha: false`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum LayerCache {
    #[default]
    Auto,
    Always,
    Never,
}

/// A CSS-like style object mapped onto `bevy_ui::Node` and its sibling visual
/// components. Every field is optional; unset fields keep Bevy's defaults.
///
/// Length-valued fields accept a bare number (logical pixels) or a unit string
/// (`"50%"`, `"100vw"`, `"auto"`, `"10px"`). Rect-valued fields
/// (`margin`/`padding`/`border`/`borderRadius`) accept a number (uniform), a CSS
/// shorthand string (`"8px 16px"`), or a `{ top, right, bottom, left }` object.
/// Keyword-valued fields (`display`, `align*`, `flex*`, …) decode straight into
/// the `bevy_ui`/`bevy_text` enum they drive (see the `keyword_fields!`
/// deserializers below); an unrecognized keyword warns and falls back to the
/// bevy default. Grid tracks/placements likewise parse once at decode.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Style {
    // --- display / box model ---
    #[serde(default, deserialize_with = "de_display")]
    pub display: Option<Display>,
    #[serde(default, deserialize_with = "de_box_sizing")]
    pub box_sizing: Option<BoxSizing>,
    #[serde(default, deserialize_with = "de_position_type")]
    pub position_type: Option<PositionType>,
    #[serde(default, deserialize_with = "de_overflow_axis")]
    pub overflow_x: Option<OverflowAxis>,
    #[serde(default, deserialize_with = "de_overflow_axis")]
    pub overflow_y: Option<OverflowAxis>,
    #[serde(default)]
    pub scrollbar_width: Option<f32>,

    // --- inset ---
    #[serde(default)]
    pub left: Option<Animatable<Length>>,
    #[serde(default)]
    pub right: Option<Animatable<Length>>,
    #[serde(default)]
    pub top: Option<Animatable<Length>>,
    #[serde(default)]
    pub bottom: Option<Animatable<Length>>,

    // --- size ---
    #[serde(default)]
    pub width: Option<Animatable<Length>>,
    #[serde(default)]
    pub height: Option<Animatable<Length>>,
    #[serde(default)]
    pub min_width: Option<Animatable<Length>>,
    #[serde(default)]
    pub min_height: Option<Animatable<Length>>,
    #[serde(default)]
    pub max_width: Option<Animatable<Length>>,
    #[serde(default)]
    pub max_height: Option<Animatable<Length>>,
    #[serde(default)]
    pub aspect_ratio: Option<Animatable<f32>>,

    // --- alignment ---
    #[serde(default, deserialize_with = "de_align_items")]
    pub align_items: Option<AlignItems>,
    #[serde(default, deserialize_with = "de_justify_items")]
    pub justify_items: Option<JustifyItems>,
    #[serde(default, deserialize_with = "de_align_self")]
    pub align_self: Option<AlignSelf>,
    #[serde(default, deserialize_with = "de_justify_self")]
    pub justify_self: Option<JustifySelf>,
    #[serde(default, deserialize_with = "de_align_content")]
    pub align_content: Option<AlignContent>,
    #[serde(default, deserialize_with = "de_justify_content")]
    pub justify_content: Option<JustifyContent>,

    // --- spacing ---
    #[serde(default)]
    pub margin: Option<Rect>,
    #[serde(default)]
    pub padding: Option<Rect>,
    #[serde(default)]
    pub border: Option<Rect>,

    // --- flex ---
    #[serde(default, deserialize_with = "de_flex_direction")]
    pub flex_direction: Option<FlexDirection>,
    #[serde(default, deserialize_with = "de_flex_wrap")]
    pub flex_wrap: Option<FlexWrap>,
    #[serde(default)]
    pub flex_grow: Option<f32>,
    #[serde(default)]
    pub flex_shrink: Option<f32>,
    #[serde(default)]
    pub flex_basis: Option<Animatable<Length>>,
    #[serde(default)]
    pub gap: Option<Animatable<Length>>,
    #[serde(default)]
    pub row_gap: Option<Animatable<Length>>,
    #[serde(default)]
    pub column_gap: Option<Animatable<Length>>,

    // --- grid ---
    #[serde(default, deserialize_with = "de_grid_auto_flow")]
    pub grid_auto_flow: Option<GridAutoFlow>,
    /// CSS grid template (`"repeat(3, 1fr)"`, `"1fr 2fr 100px"`, `"auto"`).
    #[serde(default, deserialize_with = "de_grid_template")]
    pub grid_template_rows: Option<Vec<RepeatedGridTrack>>,
    #[serde(default, deserialize_with = "de_grid_template")]
    pub grid_template_columns: Option<Vec<RepeatedGridTrack>>,
    /// Auto-track sizing (`grid-auto-rows`/`columns`); no `repeat()`.
    #[serde(default, deserialize_with = "de_grid_auto_tracks")]
    pub grid_auto_rows: Option<Vec<GridTrack>>,
    #[serde(default, deserialize_with = "de_grid_auto_tracks")]
    pub grid_auto_columns: Option<Vec<GridTrack>>,
    /// Grid line placement (`"1 / 3"`, `"span 2"`, `"2"`, `"auto"`).
    #[serde(default, deserialize_with = "de_grid_placement")]
    pub grid_row: Option<GridPlacement>,
    #[serde(default, deserialize_with = "de_grid_placement")]
    pub grid_column: Option<GridPlacement>,

    // --- visual (sibling components) ---
    /// Hex background color (`#rrggbb` / `#rrggbbaa`). Animated via an
    /// `interpolateColor` binding (`{ animated: … }`).
    #[serde(default)]
    pub background_color: Option<Animatable<String>>,
    /// Border color: a single CSS color (all four sides) or a
    /// `{ top, right, bottom, left }` object (omitted sides → transparent).
    /// Only the single-color form is animatable (the binding drives all four
    /// sides); per-side `{ animated }` wrappers warn and are ignored.
    #[serde(default)]
    pub border_color: Option<Animatable<BorderColorSpec>>,
    /// Corner radii; same forms as the other rect fields (corners are
    /// top-left, top-right, bottom-right, bottom-left).
    #[serde(default)]
    pub border_radius: Option<Rect>,
    #[serde(default)]
    pub outline: Option<OutlineSpec>,
    #[serde(default)]
    pub box_shadow: Option<BoxShadowList>,
    /// Layer-based, subtree-wide `filter` chain (see [`crate::filters`]): one
    /// `{ name, params }` object (a 1-element chain) or an ordered array of
    /// them (chain order = pass order). Omitted params take the filter's
    /// CSS-shorthand default (a bare `grayscale` is *full* grayscale, while
    /// `brightness`/`contrast`/`saturate` default to identity). `params`
    /// stays an untyped map at decode; it is validated later against the
    /// registered filters
    /// ([`FilterRegistry`](crate::filters::FilterRegistry)). A non-empty
    /// chain promotes the node to a composited layer (see [`crate::layer`]);
    /// hover/press/focus variants carry the field too (with a
    /// [`transition`](Self::transition) the swap eases — see
    /// `crate::filters`). A chain carried *only* by a variant still promotes
    /// eagerly at mount — promotion is presence-based across the base style
    /// and every variant, so the layer exists before the first hover.
    #[serde(default)]
    pub filter: Option<crate::filters::FilterChain>,
    /// Layer-based `backdropFilter` chain — same wire shape as
    /// [`filter`](Self::filter) (one `{ name, params }` or an ordered array,
    /// validated against the same registry), but it filters what is rendered
    /// *behind* the node (v1: the camera's post-processed 3D frame — no UI)
    /// and draws the result as an opaque quad under the node's own content.
    /// A non-empty chain promotes (presence union across base + variants,
    /// like `filter`). Unsetting it demotes, so an eased removal needs an
    /// identity entry left in the base chain (same snap rule as `filter`).
    #[serde(default)]
    pub backdrop_filter: Option<crate::filters::FilterChain>,
    /// Background gradient(s); one gradient or a layered list. bevy paints it
    /// *over* `backgroundColor` (CSS `background-image` semantics): an opaque
    /// gradient hides the color (fallback); transparent stops reveal it.
    #[serde(default)]
    pub background_gradient: Option<GradientList>,
    /// Border gradient(s); one gradient or a layered list. Painted *over*
    /// `borderColor` (needs a `border` width to be visible).
    #[serde(default)]
    pub border_gradient: Option<GradientList>,
    /// Background image: painted *over* `backgroundColor` **and**
    /// `backgroundGradient`, under the node's content (bevy's fixed per-node
    /// paint order). `src` is an asset path, or `{ texture }` naming a render
    /// target registered in `crate::portal::RenderTargets`. Never affects
    /// layout (the layout-driving `Auto` image mode is never emitted).
    /// Ignored — with a devtools warning — on `image`/`canvas`/`portal`
    /// (their `ImageNode` belongs to the element) and `surface`.
    #[serde(default, deserialize_with = "de_background_image")]
    pub background_image: Option<BackgroundImageSpec>,
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
    #[serde(default, deserialize_with = "de_focus_policy")]
    pub focus_policy: Option<FocusPolicy>,
    /// Mouse cursor shown while the pointer is over this node (CSS `cursor`).
    /// A system keyword (winit's `SystemCursorIcon`) or a custom-cursor name
    /// registered via `ReactUiPlugin::cursor`; the name is resolved (registry first,
    /// so a custom cursor can override a system keyword) onto the window's
    /// `CursorIcon` by `crate::cursor::drive_cursor_icon`. Like `font_family`, a raw
    /// name resolved at drive time. Absent → the node contributes no cursor (its
    /// ancestor's or the default arrow shows).
    #[serde(default)]
    pub cursor: Option<String>,

    // --- transform / opacity (drive `UiTransform` and color alpha) ---
    /// Static transform (translate/scale/rotate). Mirrors the animated transform
    /// channels; written to `UiTransform`. With a [`transition`](Self::transition)
    /// a change eases instead of snapping.
    #[serde(default)]
    pub transform: Option<Transform>,
    /// 3D perspective transform, applied to the subtree's *rendered result* at
    /// composite time (group semantics, like `opacity`/`filter`). Presence —
    /// even an identity `{}` — promotes the subtree to a composited layer (see
    /// [`crate::layer`]); the captured texture is drawn as one quad through the
    /// matrix, so animating it never re-captures. Unlike `transform` (which
    /// stays main-world and bakes into the capture), this never touches layout,
    /// and ancestor clips clamp the transformed result. With a
    /// [`transition`](Self::transition) a change eases field-wise.
    #[serde(default)]
    pub transform3d: Option<Transform3d>,
    /// Opacity in `0.0..=1.0`, multiplied into the alpha of the background (and
    /// text) color. With a [`transition`](Self::transition) a change eases.
    /// On a node with children (unless [`group_alpha`](Self::group_alpha) is
    /// `false`) the subtree is instead promoted to a composited layer and the
    /// value applies once to the whole group — see [`crate::layer`].
    #[serde(default)]
    pub opacity: Option<Animatable<f32>>,
    /// Whether `opacity` on a node with children fades the subtree as a group
    /// (composited layer) rather than folding into each node's own colors.
    /// Default `true` (web semantics); `false` opts out of layer promotion for
    /// perf-sensitive spots, keeping the per-node fold. `no_overlay`: a hover/
    /// press variant must not be able to flip promotion.
    #[serde(default)]
    pub group_alpha: Option<bool>,
    /// Layer-cache hint. `"always"` force-promotes the subtree to a composited
    /// layer (see [`crate::layer`]) so its capture is cached and re-rendered
    /// only when its content changes — the `will-change` pattern for static
    /// or transform/opacity-animated subtrees. `"never"` also force-promotes,
    /// but the capture re-runs **every frame** — for content written outside
    /// the dirt tracking's sight (live `<portal>` targets, app-owned textures).
    /// `"auto"` (or absent, the default) promotes only when another rule does
    /// (today: `opacity`). `no_overlay`: a variant must not flip promotion.
    #[serde(default, deserialize_with = "de_layer_cache")]
    pub cache: Option<LayerCache>,
    /// CSS-like per-channel transition timing. Present → a change to `transform` /
    /// `opacity` / `backgroundColor` (via re-render or hover/press) animates over
    /// time using the same driver/easing engine as `{ animated }` bindings, rather than
    /// snapping. See [`crate::transition`].
    #[serde(default)]
    pub transition: Option<crate::transition::Transition>,

    /// Visible scrollbar for an `overflow: scroll` node: `"none"` (default) /
    /// `"default"` / a styled object. Present → the reconciler stamps a
    /// [`crate::scrollbar::ScrollbarConfig`] and the shell spawns Bevy's headless
    /// scrollbar widget over the container. Pure-serde, module-owned.
    #[serde(default)]
    pub scrollbar: Option<crate::scrollbar::ScrollbarSpec>,

    // --- text (only meaningful on `<text>` elements/spans) ---
    /// Hex text color. Animated via an `interpolateColor` binding.
    #[serde(default)]
    pub color: Option<Animatable<String>>,
    /// Font size: a number (logical pixels) or a unit string (`"24px"`, `"2vw"`,
    /// `"1.5rem"`). See [`FontSize`].
    #[serde(default)]
    pub font_size: Option<FontSize>,
    /// `"thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "black"`
    /// or a numeric weight string (e.g. `"600"`).
    #[serde(default, deserialize_with = "de_font_weight")]
    pub font_weight: Option<FontWeight>,
    /// Registered font-family name to render this text with (see the plugin's
    /// `default_font`/`font` config). Unknown or unset → the configured default
    /// font.
    #[serde(default)]
    pub font_family: Option<String>,
    /// Horizontal alignment of the text block (`<text>` root only):
    /// `"left" | "center" | "right" | "justify" | "start" | "end"`.
    #[serde(default, deserialize_with = "de_text_align")]
    pub text_align: Option<Justify>,
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
    #[serde(default, deserialize_with = "de_line_break")]
    pub line_break: Option<LineBreak>,
}

/// Bit flags naming the groups of work [`crate::ui_map::apply_style`] (and the
/// update reconciler) derive from a [`Style`]. Each [`Style`] field belongs to
/// the group(s) whose output reads it (see [`with_style_fields`]); a delta
/// update ORs the groups of its touched fields into a [`StyleDirty`] mask so
/// the apply path can skip every group the delta provably didn't affect.
pub mod style_groups {
    /// `bevy_ui::Node` (`node_from_style`): every layout field.
    pub const LAYOUT: u32 = 1 << 0;
    /// `BackgroundColor` (reads `background_color`, `opacity`).
    pub const BACKGROUND: u32 = 1 << 1;
    /// `UiTransform` (reads `transform`).
    pub const TRANSFORM: u32 = 1 << 2;
    /// `BorderColor`.
    pub const BORDER_COLOR: u32 = 1 << 3;
    /// `Outline`.
    pub const OUTLINE: u32 = 1 << 4;
    /// `BoxShadow`.
    pub const BOX_SHADOW: u32 = 1 << 5;
    /// `BackgroundGradient` (reads `background_gradient`, `opacity`).
    pub const BG_GRADIENT: u32 = 1 << 6;
    /// `BorderGradient` (reads `border_gradient`, `opacity`).
    pub const BORDER_GRADIENT: u32 = 1 << 7;
    /// `TextShadow` (reads `text_shadow`, `opacity`).
    pub const TEXT_SHADOW: u32 = 1 << 8;
    /// `ZIndex`.
    pub const Z_INDEX: u32 = 1 << 9;
    /// `GlobalZIndex`.
    pub const GLOBAL_Z_INDEX: u32 = 1 << 10;
    /// `FocusPolicy` (also `apply_button_focus_default` in the reconciler).
    pub const FOCUS_POLICY: u32 = 1 << 11;
    /// The wire `filter` chain → `FilterInput` (the chain resolver's *and*
    /// the transition filter channel's target; see `crate::filters`).
    pub const FILTER: u32 = 1 << 12;
    /// `TransitionInput` (`TransitionInput::from_style` reads `transition` plus
    /// every transitioned channel: `transform`, `opacity`, `background_color`,
    /// `width`, `height`, `max_width`, `max_height`). The filter channel's
    /// timing rides the spec here; its *target* is `FilterInput` (FILTER).
    pub const TRANSITION: u32 = 1 << 13;
    /// `ScrollTransitionInput` (reads `transition`).
    pub const SCROLL_TRANSITION: u32 = 1 << 14;
    /// The resolved text style (`resolved_text_style`: `color`, `font_size`,
    /// `font_weight`, `font_family`, `line_height`, `letter_spacing`,
    /// `opacity`) — includes the `<text>` re-propagation to inheriting spans.
    pub const TEXT: u32 = 1 << 15;
    /// `TextLayout` (`text_layout`: `text_align`, `line_break`).
    pub const TEXT_LAYOUT: u32 = 1 << 16;
    /// `NodeCursor` (reads `cursor`) — the per-node cursor `drive_cursor_icon`
    /// writes onto the window's `CursorIcon` on hover.
    pub const CURSOR: u32 = 1 << 17;
    /// `ScrollbarConfig` (reads `scrollbar`) — the visible scrollbar shell
    /// (`crate::scrollbar`) spawns/updates Bevy's scrollbar widget from it. The
    /// field is *also* in `LAYOUT` because a gutter-positioned bar drives
    /// `Node.scrollbar_width` (see `node_from_style`).
    pub const SCROLLBAR: u32 = 1 << 18;
    /// Layer-promotion inputs (`crate::layer`): fields that change whether a
    /// subtree composites as a layer (`opacity`, `group_alpha`, `cache`,
    /// `filter`, `transform3d`). No `apply_style` output reads this group — it
    /// exists so a delta touching a promotion trigger is visible to the
    /// promotion evaluator.
    pub const LAYER: u32 = 1 << 19;
    /// `LayerTransform3d` (reads `transform3d`) — the composite-time 3D
    /// transform on a promoted layer (`crate::layer::transform3d`). Never
    /// content dirt: matrix changes reshape the composite quad only.
    pub const TRANSFORM3D: u32 = 1 << 20;
    /// The wire `backdropFilter` chain → `BackdropInput` (the backdrop chain
    /// resolver's *and* the backdrop transition channel's target; see
    /// `crate::filters::backdrop`). Composite-side only, like
    /// [`Self::TRANSFORM3D`]: a backdrop delta re-stages the snapshot filter
    /// run and reshapes nothing in the subtree — never content dirt.
    pub const BACKDROP: u32 = 1 << 21;
    /// `ImageNode` from `background_image` (plus the `opacity` fold into its
    /// tint). Built at the reconcile call sites — the build needs
    /// `AssetServer`, which `apply_style_masked` doesn't hold — via
    /// `crate::background_image::apply_background_image`; there is no arm for
    /// it inside `apply_style_masked` (the end-of-apply layer content-dirty
    /// tap still fires from this bit).
    pub const BG_IMAGE: u32 = 1 << 22;
}

/// The single source of truth for [`Style`]'s field list. Invokes the callback
/// macro `$cb` once with one `(ident, "wireName", (group bits), overlay-flag)`
/// entry per field:
///
/// - `ident` / `"wireName"`: the Rust field and its camelCase wire name.
/// - `(group bits)`: the [`style_groups`] whose derived output reads the field.
/// - `overlay` / `no_overlay`: whether `overlay_style` (hover/press/focus
///   merging) carries the field. `focus_policy` is `no_overlay` so a variant
///   can't silently toggle pointer capture; `group_alpha`/`cache` are
///   `no_overlay` so interaction can never flip layer promotion. `filter` IS
///   overlaid: the merged style simply re-stamps `FilterInput`, and promotion
///   unions variant presence (see `crate::layer::promotion_reasons`), so a
///   hover filter composites — and, with a `transition`, eases — without ever
///   flipping the layer.
///
/// Consumers: `overlay_style` (ui_map), [`Style::overlay_delta`],
/// [`Style::unset_field`], and the field-coverage test. Adding a `Style` field
/// without extending this table is caught by `style_field_table_is_complete`.
macro_rules! with_style_fields {
    ($cb:ident) => {
        $cb! {
            (display, "display", (LAYOUT), overlay),
            (box_sizing, "boxSizing", (LAYOUT), overlay),
            (position_type, "positionType", (LAYOUT), overlay),
            (overflow_x, "overflowX", (LAYOUT), overlay),
            (overflow_y, "overflowY", (LAYOUT), overlay),
            (scrollbar_width, "scrollbarWidth", (LAYOUT), overlay),
            (left, "left", (LAYOUT), overlay),
            (right, "right", (LAYOUT), overlay),
            (top, "top", (LAYOUT), overlay),
            (bottom, "bottom", (LAYOUT), overlay),
            (width, "width", (LAYOUT | TRANSITION), overlay),
            (height, "height", (LAYOUT | TRANSITION), overlay),
            (min_width, "minWidth", (LAYOUT), overlay),
            (min_height, "minHeight", (LAYOUT), overlay),
            (max_width, "maxWidth", (LAYOUT | TRANSITION), overlay),
            (max_height, "maxHeight", (LAYOUT | TRANSITION), overlay),
            (aspect_ratio, "aspectRatio", (LAYOUT), overlay),
            (align_items, "alignItems", (LAYOUT), overlay),
            (justify_items, "justifyItems", (LAYOUT), overlay),
            (align_self, "alignSelf", (LAYOUT), overlay),
            (justify_self, "justifySelf", (LAYOUT), overlay),
            (align_content, "alignContent", (LAYOUT), overlay),
            (justify_content, "justifyContent", (LAYOUT), overlay),
            (margin, "margin", (LAYOUT), overlay),
            (padding, "padding", (LAYOUT), overlay),
            (border, "border", (LAYOUT), overlay),
            (flex_direction, "flexDirection", (LAYOUT), overlay),
            (flex_wrap, "flexWrap", (LAYOUT), overlay),
            (flex_grow, "flexGrow", (LAYOUT), overlay),
            (flex_shrink, "flexShrink", (LAYOUT), overlay),
            (flex_basis, "flexBasis", (LAYOUT), overlay),
            (gap, "gap", (LAYOUT), overlay),
            (row_gap, "rowGap", (LAYOUT), overlay),
            (column_gap, "columnGap", (LAYOUT), overlay),
            (grid_auto_flow, "gridAutoFlow", (LAYOUT), overlay),
            (grid_template_rows, "gridTemplateRows", (LAYOUT), overlay),
            (grid_template_columns, "gridTemplateColumns", (LAYOUT), overlay),
            (grid_auto_rows, "gridAutoRows", (LAYOUT), overlay),
            (grid_auto_columns, "gridAutoColumns", (LAYOUT), overlay),
            (grid_row, "gridRow", (LAYOUT), overlay),
            (grid_column, "gridColumn", (LAYOUT), overlay),
            (background_color, "backgroundColor", (BACKGROUND | TRANSITION), overlay),
            (border_color, "borderColor", (BORDER_COLOR), overlay),
            (border_radius, "borderRadius", (LAYOUT), overlay),
            (outline, "outline", (OUTLINE), overlay),
            (box_shadow, "boxShadow", (BOX_SHADOW), overlay),
            (filter, "filter", (FILTER | LAYER), overlay),
            (backdrop_filter, "backdropFilter", (BACKDROP | LAYER), overlay),
            (background_gradient, "backgroundGradient", (BG_GRADIENT), overlay),
            (border_gradient, "borderGradient", (BORDER_GRADIENT), overlay),
            (background_image, "backgroundImage", (BG_IMAGE), overlay),
            (z_index, "zIndex", (Z_INDEX), overlay),
            (global_z_index, "globalZIndex", (GLOBAL_Z_INDEX), overlay),
            (focus_policy, "focusPolicy", (FOCUS_POLICY), no_overlay),
            (cursor, "cursor", (CURSOR), overlay),
            (scrollbar, "scrollbar", (SCROLLBAR | LAYOUT), overlay),
            (
                transform,
                "transform",
                (TRANSFORM | TRANSITION),
                overlay
            ),
            (
                transform3d,
                "transform3d",
                (TRANSFORM3D | LAYER | TRANSITION),
                overlay
            ),
            (
                opacity,
                "opacity",
                (BACKGROUND | BG_GRADIENT | BORDER_GRADIENT | BG_IMAGE | TEXT_SHADOW
                    | TRANSITION | TEXT | LAYER),
                overlay
            ),
            (group_alpha, "groupAlpha", (LAYER), no_overlay),
            (cache, "cache", (LAYER), no_overlay),
            (
                transition,
                "transition",
                (TRANSITION | SCROLL_TRANSITION),
                overlay
            ),
            (color, "color", (TEXT), overlay),
            (font_size, "fontSize", (TEXT), overlay),
            (font_weight, "fontWeight", (TEXT), overlay),
            (font_family, "fontFamily", (TEXT), overlay),
            (text_align, "textAlign", (TEXT_LAYOUT), overlay),
            (line_height, "lineHeight", (TEXT), overlay),
            (letter_spacing, "letterSpacing", (TEXT), overlay),
            (text_shadow, "textShadow", (TEXT_SHADOW), overlay),
            (line_break, "lineBreak", (TEXT_LAYOUT), overlay),
        }
    };
}
pub(crate) use with_style_fields;

/// Which [`style_groups`] a delta update touched. `ALL` (every bit set) is the
/// full-reapply mask used by non-delta paths.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct StyleDirty(pub u32);

impl StyleDirty {
    /// Nothing dirty — every style group can be skipped.
    pub const NONE: Self = Self(0);
    /// Everything dirty — full re-apply (create, hover/press restyle).
    pub const ALL: Self = Self(u32::MAX);

    /// Whether any of `groups`' bits is dirty.
    pub fn intersects(self, groups: u32) -> bool {
        self.0 & groups != 0
    }

    /// Whether any style field at all was touched.
    pub fn any(self) -> bool {
        self.0 != 0
    }
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

impl Style {
    /// Overlay every `Some` field of `delta` onto `self` and return the OR of
    /// the touched fields' [`style_groups`] bits. Unlike `overlay_style` this
    /// carries **all** fields (including the `no_overlay`-tagged ones like
    /// `focus_policy`): the delta is the app's own base style, not a hover
    /// variant.
    pub(crate) fn overlay_delta(&mut self, delta: &Style) -> u32 {
        let mut groups = 0u32;
        macro_rules! merge_field {
            ($(($f:ident, $name:literal, $g:tt, $ov:ident),)*) => {
                $(
                    if delta.$f.is_some() {
                        self.$f = delta.$f.clone();
                        groups |= {
                            use style_groups::*;
                            $g
                        };
                    }
                )*
            };
        }
        with_style_fields!(merge_field);
        groups
    }

    /// Clear the field named by `wire_name` (camelCase) and return its
    /// [`style_groups`] bits, or `None` (after a `warn!`) for an unknown name.
    pub(crate) fn unset_field(&mut self, wire_name: &str) -> Option<u32> {
        macro_rules! unset_match {
            ($(($f:ident, $name:literal, $g:tt, $ov:ident),)*) => {
                match wire_name {
                    $(
                        $name => {
                            self.$f = None;
                            Some({
                                use style_groups::*;
                                $g
                            })
                        }
                    )*
                    _ => {
                        tracing::warn!(
                            target: "bevy_react",
                            "unknown style field {wire_name:?} in styleUnset; ignoring"
                        );
                        None
                    }
                }
            };
        }
        with_style_fields!(unset_match)
    }
}

impl Props {
    /// Iterate every present style slot: the base [`Self::style`] plus the
    /// hover/press/focus variants, in that order. THE definition of "all
    /// style slots" for presence-based unions (layer promotion's
    /// opacity/filter reasons, the create-time layer-dirty seed) — a new
    /// variant slot extends this once, not each call site.
    pub fn all_styles(&self) -> impl Iterator<Item = &Style> {
        [
            &self.style,
            &self.hover_style,
            &self.press_style,
            &self.focus_style,
        ]
        .into_iter()
        .flatten()
    }

    /// Split the event-like fields (see [`UpdateEvents`]) out of `self`,
    /// leaving the retained state. Used to seed the per-node props cache from
    /// a create.
    pub fn split_events(mut self) -> (Props, UpdateEvents) {
        let events = UpdateEvents {
            value: self.value.take(),
            selection_start: self.selection_start.take(),
            selection_end: self.selection_end.take(),
            scroll_top: self.scroll_top.take(),
            scroll_left: self.scroll_left.take(),
            draw: self.draw.take(),
        };
        (self, events)
    }

    /// Merge an [`Op::Update`] delta (`props` + `unset` + `style_unset`) into
    /// `self` (the retained last-applied props), returning what the delta
    /// touched and the event-like fields to act on. See the semantics on
    /// [`Op::Update`].
    pub fn merge_delta(
        &mut self,
        delta: Props,
        unset: &[String],
        style_unset: &[String],
    ) -> (PropsDirty, UpdateEvents) {
        let mut dirty = PropsDirty::default();
        let (delta, events) = delta.split_events();

        // --- set: fields present in the delta ---
        if let Some(style_delta) = &delta.style {
            let groups = self
                .style
                .get_or_insert_default()
                .overlay_delta(style_delta);
            dirty.style.0 |= groups;
        }
        if delta.hover_style.is_some() {
            self.hover_style = delta.hover_style;
            dirty.hover_style = true;
        }
        if delta.press_style.is_some() {
            self.press_style = delta.press_style;
            dirty.press_style = true;
        }
        if delta.focus_style.is_some() {
            self.focus_style = delta.focus_style;
            dirty.focus_style = true;
        }
        // `shape` replaces ATOMICALLY (the variant-style precedent above),
        // deliberately not field-wise like `style`: a shape change has a
        // single Rust-side consequence — a full re-raster of the enclosing
        // `<svg>` surface, with no per-field dirty groups to save — the
        // object is small, and atomic replace handles JSX attr *removal*
        // correctly by construction (JS sends the complete folded object
        // whenever anything changed, so an attr absent from the new value is
        // an attr removed, no `unset` bookkeeping needed). Compare-before-set
        // keeps an idempotent re-send silent, like the rest of the delta.
        if let Some(shape) = delta.shape
            && self.shape.as_ref() != Some(&shape)
        {
            self.shape = Some(shape);
            dirty.shape = true;
        }
        if let Some(view_box) = delta.view_box
            && self.view_box != Some(view_box)
        {
            self.view_box = Some(view_box);
            dirty.view_box = true;
        }
        // Handler/flag booleans: the delta only ever carries `true` (a handler
        // appeared / a flag turned on); turning one off rides `unset`.
        macro_rules! merge_bool {
            ($($f:ident => $flag:ident),* $(,)?) => {
                $(
                    if delta.$f {
                        self.$f = true;
                        dirty.$flag = true;
                    }
                )*
            };
        }
        merge_bool!(
            on_click => pointer,
            on_pointer_down => pointer,
            on_pointer_move => pointer,
            on_pointer_up => pointer,
            on_pointer_enter => pointer,
            on_pointer_leave => pointer,
            on_scroll => scroll_listener,
            on_wheel => wheel,
            on_change => editable_handlers,
            on_select => editable_handlers,
            on_focus => editable_handlers,
            on_blur => editable_handlers,
            flip_x => image,
            flip_y => image,
        );
        // `multiline`/`autofocus` are create-time only; keep the cache true to
        // the props but no apply work keys off them.
        if delta.multiline {
            self.multiline = true;
        }
        if delta.autofocus {
            self.autofocus = true;
        }
        // `onResize` gates nothing Rust-side (resize events are unconditional);
        // cached only so the delta stays truthful.
        if delta.on_resize {
            self.on_resize = true;
        }
        macro_rules! merge_option {
            ($($f:ident => $($flag:ident)?),* $(,)?) => {
                $(
                    if delta.$f.is_some() {
                        self.$f = delta.$f;
                        $( dirty.$flag = true; )?
                    }
                )*
            };
        }
        merge_option!(
            scroll_step => scroll_step,
            anchor => anchor,
            src => image,
            tint => image,
            image_mode => image,
            source_rect => image,
            atlas => image,
            visual_box => image,
            target => target,
            aria_label => aria_label,
            max_length => , // create-time only, cached for completeness
        );

        // --- unset: wire names reset to their defaults ---
        for name in unset {
            match name.as_str() {
                "style" => {
                    self.style = None;
                    dirty.style = StyleDirty::ALL;
                }
                "hoverStyle" => {
                    self.hover_style = None;
                    dirty.hover_style = true;
                }
                "pressStyle" => {
                    self.press_style = None;
                    dirty.press_style = true;
                }
                "focusStyle" => {
                    self.focus_style = None;
                    dirty.focus_style = true;
                }
                "onClick" => {
                    self.on_click = false;
                    dirty.pointer = true;
                }
                "onPointerDown" => {
                    self.on_pointer_down = false;
                    dirty.pointer = true;
                }
                "onPointerMove" => {
                    self.on_pointer_move = false;
                    dirty.pointer = true;
                }
                "onPointerUp" => {
                    self.on_pointer_up = false;
                    dirty.pointer = true;
                }
                "onPointerEnter" => {
                    self.on_pointer_enter = false;
                    dirty.pointer = true;
                }
                "onPointerLeave" => {
                    self.on_pointer_leave = false;
                    dirty.pointer = true;
                }
                "onScroll" => {
                    self.on_scroll = false;
                    dirty.scroll_listener = true;
                }
                "onWheel" => {
                    self.on_wheel = false;
                    dirty.wheel = true;
                }
                "onChange" => {
                    self.on_change = false;
                    dirty.editable_handlers = true;
                }
                "onSelect" => {
                    self.on_select = false;
                    dirty.editable_handlers = true;
                }
                "onFocus" => {
                    self.on_focus = false;
                    dirty.editable_handlers = true;
                }
                "onBlur" => {
                    self.on_blur = false;
                    dirty.editable_handlers = true;
                }
                "flipX" => {
                    self.flip_x = false;
                    dirty.image = true;
                }
                "flipY" => {
                    self.flip_y = false;
                    dirty.image = true;
                }
                "multiline" => self.multiline = false,
                "autofocus" => self.autofocus = false,
                "onResize" => self.on_resize = false,
                "scrollStep" => {
                    self.scroll_step = None;
                    dirty.scroll_step = true;
                }
                "anchor" => {
                    self.anchor = None;
                    dirty.anchor = true;
                }
                "src" => {
                    self.src = None;
                    dirty.image = true;
                }
                "tint" => {
                    self.tint = None;
                    dirty.image = true;
                }
                "imageMode" => {
                    self.image_mode = None;
                    dirty.image = true;
                }
                "sourceRect" => {
                    self.source_rect = None;
                    dirty.image = true;
                }
                "atlas" => {
                    self.atlas = None;
                    dirty.image = true;
                }
                "visualBox" => {
                    self.visual_box = None;
                    dirty.image = true;
                }
                "target" => {
                    self.target = None;
                    dirty.target = true;
                }
                "shape" => {
                    self.shape = None;
                    dirty.shape = true;
                }
                "viewBox" => {
                    self.view_box = None;
                    dirty.view_box = true;
                }
                "ariaLabel" => {
                    self.aria_label = None;
                    dirty.aria_label = true;
                }
                "maxLength" => self.max_length = None,
                // Event-like props have no retained state to unset; dropping
                // the prop simply stops producing events.
                "value" | "selectionStart" | "selectionEnd" | "scrollTop" | "scrollLeft"
                | "draw" => {
                    tracing::warn!(
                        target: "bevy_react",
                        "event-like prop {name:?} in unset; nothing to reset"
                    );
                }
                other => {
                    tracing::warn!(
                        target: "bevy_react",
                        "unknown prop {other:?} in unset; ignoring"
                    );
                }
            }
        }

        // --- style_unset: after the overlay, so a (never-emitted) set+unset of
        // the same field resolves to unset ---
        if !style_unset.is_empty() {
            let style = self.style.get_or_insert_default();
            for name in style_unset {
                if let Some(groups) = style.unset_field(name) {
                    dirty.style.0 |= groups;
                }
            }
        }

        (dirty, events)
    }
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

/// Where a [`Style::background_image`] samples from: a bare string is an
/// asset path (`AssetServer`-loaded, like an `image` element's `src`); the
/// `{ texture }` object names an **app-registered texture** in
/// `crate::portal::RenderTargets` (typically `RenderTargets::register` —
/// bound late: an unknown name shows the transparent placeholder until the
/// app registers it). Texture backgrounds are for **static** content — they
/// don't participate in live-repaint tracking; continuously-updating render
/// targets belong in a `<portal>` element.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum BackgroundImageSource {
    Path(String),
    Texture { texture: String },
}

/// The decoded `backgroundImage` style object. Deliberately NOT
/// [`ImageMode`]: that type admits `"auto"` (whose intrinsic-size measure
/// drives layout — a background must never do that) and `"sliced"`, and its
/// unknown-keyword fallback is `Auto`. This spec's modes all map to
/// layout-inert `NodeImageMode`s.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackgroundImageSpec {
    /// Required — a spec with nothing to paint is dropped at decode
    /// (tint-only fills are `backgroundColor`'s job).
    pub src: BackgroundImageSource,
    /// Tint multiplied with the texture (hex); also where `opacity` folds.
    /// Animatable via an inline `{ animated: interpolateColor(...) }` binding
    /// (`AnimatableProperty::BackgroundImageTint` drives `ImageNode.color`
    /// per frame; the static build then leaves the color at white).
    #[serde(default)]
    pub tint: Option<Animatable<String>>,
    /// Fit: `"stretch"` (default — fill the box exactly) or the repeat
    /// modes `"repeat"`/`"repeatX"`/`"repeatY"` (tile at the texture's
    /// logical size × [`scale`](Self::scale)).
    #[serde(default, deserialize_with = "de_bg_image_mode")]
    pub mode: Option<BackgroundImageMode>,
    /// Tile scale for the repeat modes, in logical-px terms (`1.0` = the
    /// texture's own size at 1× DPI; DPI correction is applied by
    /// `crate::background_image::sync_background_tile_scale`). Ignored — with
    /// a warning — under `"stretch"`. Decodes an `{ animated }` wrapper but
    /// the binding is inert in v1 (read via `static_val`).
    #[serde(default)]
    pub scale: Option<Animatable<f32>>,
}

/// [`BackgroundImageSpec::mode`] keywords. Every variant maps to a
/// layout-inert `NodeImageMode` (`Stretch` or `Tiled`) — never `Auto`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum BackgroundImageMode {
    #[default]
    Stretch,
    Repeat,
    RepeatX,
    RepeatY,
}

impl BackgroundImageMode {
    /// Whether this mode tiles at all (any repeat variant).
    pub fn tiles(self) -> bool {
        self != Self::Stretch
    }

    /// The per-axis tile flags (`tile_x`, `tile_y`) for `NodeImageMode::Tiled`.
    pub fn tile_axes(self) -> (bool, bool) {
        match self {
            Self::Stretch => (false, false),
            Self::Repeat => (true, true),
            Self::RepeatX => (true, false),
            Self::RepeatY => (false, true),
        }
    }
}

/// A style field that is either a static `T` or an inline animation binding —
/// the `{ animated: <shared value | interpolate descriptor>, seed? }` wire
/// form. The animated variant carries **no static value**: style read sites
/// see the field as absent (the animation applier drives the target every
/// frame), and `crate::animations` derives the node's `AnimatedBindings` from
/// the merged style. `{ animated: sv }` reaches the wire with the shared
/// value's `id` (its other enumerable props are ignored); a descriptor object
/// is told apart by its `type` tag. A malformed wrapper warns (`styleBinding`)
/// and decodes to an inert binding (shared id `0` is never allocated by JS),
/// so one typo can't abort the batch.
///
/// The wrapper's optional **`seed`** (`{ animated: sv, seed: 10 }`) is the
/// static value a consumer may decode in the wrapper's place. Style read
/// sites ([`AnimatableField::static_val`]/[`static_ref`](AnimatableField::static_ref))
/// deliberately ignore it — the driver owns the on-screen value — but SVG
/// shape attrs render it ([`AnimatableField::static_or_seed`]) until a driver
/// writes, mirroring the filter-param resolver's seed semantics
/// (`crate::style_bindings::animated_param_seed`; filter/backdrop chain
/// params never decode through this type — their param maps stay raw).
//
// `PartialEq` includes `seed` DELIBERATELY: shape-attr dirt depends on it —
// the seed renders (`static_or_seed`), and the animation apply stage writes
// driven values *into* the seed slot, so seed equality is what makes
// compare-before-write + `Changed<SvgShape>` sound. For style fields (whose
// read sites ignore the seed) a seed-only delta re-applies redundantly, but
// the appliers' `set_if_neq` discipline absorbs it.
#[derive(Debug, Clone, PartialEq)]
pub enum Animatable<T> {
    Static(T),
    Animated {
        binding: crate::animations::protocol::Binding,
        /// The wrapper's sibling `seed`, decoded as `T` (a malformed seed
        /// warns `styleBinding` and drops to `None`).
        ///
        /// While an animation driver runs, the seed carries the **last driven
        /// value**: the apply stage (`crate::animations`' shape-attr stage)
        /// writes each frame's resolved value into this slot — never
        /// replacing the variant with `Static`, which would destroy the
        /// binding — so seed-rendering read sites (`static_or_seed`) see the
        /// live value while the binding survives re-derivation.
        seed: Option<T>,
    },
}

impl<T> Animatable<T> {
    /// The static value; `None` while animated (the seed is NOT a static
    /// value — see [`Self::seed`]).
    pub fn value(&self) -> Option<&T> {
        match self {
            Animatable::Static(v) => Some(v),
            Animatable::Animated { .. } => None,
        }
    }

    /// The binding; `None` when static.
    pub fn binding(&self) -> Option<&crate::animations::protocol::Binding> {
        match self {
            Animatable::Static(_) => None,
            Animatable::Animated { binding, .. } => Some(binding),
        }
    }

    /// The animated wrapper's `seed`; `None` when static or seed-less.
    pub fn seed(&self) -> Option<&T> {
        match self {
            Animatable::Static(_) => None,
            Animatable::Animated { seed, .. } => seed.as_ref(),
        }
    }
}

/// Read helpers for the `Option<Animatable<T>>` style fields, so read sites
/// stay as terse as the plain `Option<T>` they replaced.
pub trait AnimatableField<T> {
    /// The static value by copy; `None` when absent **or** animated.
    fn static_val(&self) -> Option<T>
    where
        T: Copy;
    /// The static value by reference; `None` when absent or animated.
    fn static_ref(&self) -> Option<&T>;
    /// The static value — or, while animated, the wrapper's `seed`; `None`
    /// when absent or animated seed-less. The read helper for fields whose
    /// consumers should *render* the seed until a driver writes (SVG shape
    /// attrs); style read sites use [`Self::static_val`] instead (their
    /// animated fields read as absent by design).
    fn static_or_seed(&self) -> Option<T>
    where
        T: Copy;
    /// The binding; `None` when absent or static.
    fn binding(&self) -> Option<&crate::animations::protocol::Binding>;
}

impl<T> AnimatableField<T> for Option<Animatable<T>> {
    fn static_val(&self) -> Option<T>
    where
        T: Copy,
    {
        self.static_ref().copied()
    }
    fn static_ref(&self) -> Option<&T> {
        self.as_ref().and_then(Animatable::value)
    }
    fn static_or_seed(&self) -> Option<T>
    where
        T: Copy,
    {
        self.as_ref()
            .and_then(|a| a.value().or_else(|| a.seed()))
            .copied()
    }
    fn binding(&self) -> Option<&crate::animations::protocol::Binding> {
        self.as_ref().and_then(Animatable::binding)
    }
}

impl<'de, T: de::DeserializeOwned> Deserialize<'de> for Animatable<T> {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        let v = serde_json::Value::deserialize(d)?;
        if let Some(map) = v.as_object()
            && let Some(inner) = map.get("animated")
        {
            let seed = map.get("seed").and_then(|s| match T::deserialize(s) {
                Ok(seed) => Some(seed),
                Err(e) => {
                    decode_warn(
                        "styleBinding",
                        &s.to_string(),
                        &format!("invalid seed: {e}"),
                    );
                    None
                }
            });
            return Ok(Animatable::Animated {
                binding: binding_from_wrapper(inner),
                seed,
            });
        }
        T::deserialize(v)
            .map(Animatable::Static)
            .map_err(de::Error::custom)
    }
}

/// Decode the payload of an `{ animated: … }` wrapper: a descriptor object
/// (tagged by `type`) decodes as a [`Binding`](crate::animations::protocol::Binding);
/// a bare shared value is recognized by its numeric `id` (every other
/// enumerable field of the JS handle is ignored). Malformed → warn + inert.
pub(crate) fn binding_from_wrapper(
    inner: &serde_json::Value,
) -> crate::animations::protocol::Binding {
    use crate::animations::protocol::Binding;
    let inert = Binding::Shared { id: 0 };
    let Some(map) = inner.as_object() else {
        decode_warn(
            "styleBinding",
            &inner.to_string(),
            "animated must be a shared value or an interpolate/interpolateColor descriptor",
        );
        return inert;
    };
    if map.contains_key("type") {
        match Binding::deserialize(inner) {
            Ok(b) => b,
            Err(e) => {
                decode_warn("styleBinding", &inner.to_string(), &e.to_string());
                inert
            }
        }
    } else if let Some(id) = map.get("id").and_then(serde_json::Value::as_u64) {
        Binding::Shared { id: id as u32 }
    } else {
        decode_warn(
            "styleBinding",
            &inner.to_string(),
            "animated needs a shared value ({id}) or a descriptor ({type, id, …})",
        );
        inert
    }
}

/// A static 2D transform mirroring the animated transform channels. Every field
/// is optional; unset channels stay at identity (no translation, unit scale, no
/// rotation). `scale` is uniform; `scaleX`/`scaleY` override a single axis.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transform {
    /// Translation along x — a length (number = logical pixels, or a unit string
    /// like `"50%"`, resolved against the node's own size by `bevy_ui`).
    pub translate_x: Option<Animatable<Length>>,
    /// Translation along y — a length (number = logical pixels, or a unit string
    /// like `"50%"`).
    pub translate_y: Option<Animatable<Length>>,
    /// Uniform scale (both axes), unless overridden by `scale_x`/`scale_y`.
    pub scale: Option<Animatable<f32>>,
    pub scale_x: Option<Animatable<f32>>,
    pub scale_y: Option<Animatable<f32>>,
    /// Clockwise rotation (number = degrees, or a unit string like `"1.5rad"`).
    /// An animated binding's per-frame values are read as **degrees** too.
    pub rotate: Option<Animatable<Angle>>,
}

/// The `transform3d` style: a 3D perspective transform composited onto a
/// promoted layer's quad (see [`Style::transform3d`]). Every field is optional;
/// unset channels stay at identity. Canonical application order around
/// [`origin`](Self::origin): scale → rotateX → rotateY → rotateZ → translate,
/// then the self-`perspective` projection.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transform3d {
    /// Self-perspective focal distance in logical pixels (CSS
    /// `transform: perspective(d)`), the vanishing point at `origin`. Unset →
    /// orthographic (rotations foreshorten but nothing diverges with depth).
    pub perspective: Option<Animatable<f32>>,
    /// Translation along x in logical pixels.
    pub translate_x: Option<Animatable<f32>>,
    /// Translation along y in logical pixels.
    pub translate_y: Option<Animatable<f32>>,
    /// Translation along z in logical pixels. Positive is toward the viewer —
    /// visible only with `perspective`.
    pub translate_z: Option<Animatable<f32>>,
    /// Rotation about the x axis (number = degrees, or `"1.5rad"`).
    pub rotate_x: Option<Animatable<Angle>>,
    /// Rotation about the y axis (number = degrees, or `"1.5rad"`).
    pub rotate_y: Option<Animatable<Angle>>,
    /// Rotation about the z axis (number = degrees, or `"1.5rad"`).
    pub rotate_z: Option<Animatable<Angle>>,
    /// Uniform scale (x and y), unless overridden by `scale_x`/`scale_y`.
    pub scale: Option<Animatable<f32>>,
    pub scale_x: Option<Animatable<f32>>,
    pub scale_y: Option<Animatable<f32>>,
    /// Pivot for rotation/scale and the perspective vanishing point, relative
    /// to the node's border box. Defaults to the center (`50%`/`50%`).
    pub origin: Option<Transform3dOrigin>,
}

impl Transform3d {
    /// Whether every channel is at identity (an empty `{}` or explicit identity
    /// values). Promotion is presence-based and ignores this; the render and
    /// picking paths use it to skip transform work entirely.
    pub fn is_identity(&self) -> bool {
        let Self {
            perspective,
            translate_x,
            translate_y,
            translate_z,
            rotate_x,
            rotate_y,
            rotate_z,
            scale,
            scale_x,
            scale_y,
            origin: _, // the pivot of an identity transform is irrelevant
        } = self;
        // An animated channel is never identity: the binding drives it to
        // arbitrary values each frame (`static_val()` is `None`, so the
        // `unwrap_or(identity)` shortcut would wrongly report identity).
        let no_binding = |f: &Option<Animatable<f32>>| f.binding().is_none();
        let no_angle_binding = |f: &Option<Animatable<Angle>>| f.binding().is_none();
        perspective.is_none()
            && [
                translate_x,
                translate_y,
                translate_z,
                scale,
                scale_x,
                scale_y,
            ]
            .iter()
            .all(|f| no_binding(f))
            && [rotate_x, rotate_y, rotate_z]
                .iter()
                .all(|f| no_angle_binding(f))
            && translate_x.static_val().unwrap_or(0.0) == 0.0
            && translate_y.static_val().unwrap_or(0.0) == 0.0
            && translate_z.static_val().unwrap_or(0.0) == 0.0
            && rotate_x.static_val().unwrap_or_default().radians() == 0.0
            && rotate_y.static_val().unwrap_or_default().radians() == 0.0
            && rotate_z.static_val().unwrap_or_default().radians() == 0.0
            && scale.static_val().unwrap_or(1.0) == 1.0
            && scale_x.static_val().unwrap_or(1.0) == 1.0
            && scale_y.static_val().unwrap_or(1.0) == 1.0
    }
}

/// The `transform3d` pivot: a per-axis [`Length`] resolved against the node's
/// border box (`"50%"` = center, a number = logical pixels from the top-left).
#[derive(Debug, Clone, PartialEq, Deserialize)]
pub struct Transform3dOrigin {
    pub x: Animatable<Length>,
    pub y: Animatable<Length>,
}

impl Default for Transform3dOrigin {
    fn default() -> Self {
        Self {
            x: Animatable::Static(Length::Percent(50.0)),
            y: Animatable::Static(Length::Percent(50.0)),
        }
    }
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
                    decode_warn("length", s, &e);
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

    /// An angle from radians (the internal unit) — the write half of
    /// [`Self::radians`], for engine code re-emitting eased values.
    pub fn from_radians(radians: f32) -> Self {
        Angle(radians)
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
                    decode_warn("angle", s, &e);
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
                    decode_warn("time", s, &e);
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
                    decode_warn("fontSize", s, &e);
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
                            decode_warn("rect", tok, &e);
                            Length::default()
                        })
                    })
                    .collect();
                Ok(Rect::from_shorthand(&values).unwrap_or_else(|e| {
                    decode_warn("rect", s, &format!("invalid rect {s:?}: {e}"));
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
                        _ => decode_warn(
                            "rect",
                            &key,
                            &format!(
                                "unknown rect side {key:?}; ignoring (expected top/right/bottom/left)"
                            ),
                        ),
                    }
                }
                Ok(rect)
            }
        }
        d.deserialize_any(RectVisitor)
    }
}

/// Declares one `deserialize_with` fn per keyword-valued [`Style`] field,
/// decoding the wire keyword straight into the `bevy_ui`/`bevy_text` enum it
/// drives. An unrecognized keyword warns (naming the field and value) and falls
/// back to the enum's bevy default — a typo must not abort the commit batch. A
/// JSON `null` decodes to `None` (matching the former `Option<String>` fields);
/// any other non-string value keeps hard-erroring, like [`Length`].
macro_rules! keyword_fields {
    ( $(
        $(#[$meta:meta])*
        fn $fn_name:ident($kind:literal) -> $ty:ty {
            $( $($kw:literal)|+ => $variant:ident ),+ $(,)?
        }
    )+ ) => { $(
        $(#[$meta])*
        fn $fn_name<'de, D: Deserializer<'de>>(d: D) -> Result<Option<$ty>, D::Error> {
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
    )+ };
}

keyword_fields! {
    fn de_display("display") -> Display {
        "flex" => Flex, "grid" => Grid, "block" => Block, "none" => None,
    }
    fn de_layer_cache("cache") -> LayerCache {
        "auto" => Auto, "always" => Always, "never" => Never,
    }
    fn de_box_sizing("boxSizing") -> BoxSizing {
        "borderBox" | "border-box" => BorderBox,
        "contentBox" | "content-box" => ContentBox,
    }
    fn de_position_type("positionType") -> PositionType {
        "absolute" => Absolute, "relative" => Relative,
    }
    fn de_overflow_axis("overflow") -> OverflowAxis {
        "visible" => Visible, "clip" => Clip, "hidden" => Hidden, "scroll" => Scroll,
    }
    // `start`/`end` are the physical variants, `flexStart`/`flexEnd` the
    // flow-relative ones — they diverge in grid and reversed-flex containers,
    // so the keywords must not collapse together. The alignment enums' bevy
    // default is the keyword-less `Default` variant ("align per the layout
    // spec"), which is also the unrecognized-keyword fallback.
    fn de_align_items("alignItems") -> AlignItems {
        "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_justify_items("justifyItems") -> JustifyItems {
        "start" => Start, "end" => End,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_align_self("alignSelf") -> AlignSelf {
        "auto" => Auto, "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_justify_self("justifySelf") -> JustifySelf {
        "auto" => Auto, "start" => Start, "end" => End,
        "center" => Center, "baseline" => Baseline, "stretch" => Stretch,
    }
    fn de_align_content("alignContent") -> AlignContent {
        "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "stretch" => Stretch,
        "spaceBetween" => SpaceBetween, "spaceEvenly" => SpaceEvenly,
        "spaceAround" => SpaceAround,
    }
    fn de_justify_content("justifyContent") -> JustifyContent {
        "start" => Start, "end" => End,
        "flexStart" => FlexStart, "flexEnd" => FlexEnd,
        "center" => Center, "stretch" => Stretch,
        "spaceBetween" => SpaceBetween, "spaceEvenly" => SpaceEvenly,
        "spaceAround" => SpaceAround,
    }
    fn de_flex_direction("flexDirection") -> FlexDirection {
        "row" => Row, "column" => Column,
        "rowReverse" => RowReverse, "columnReverse" => ColumnReverse,
    }
    fn de_flex_wrap("flexWrap") -> FlexWrap {
        "nowrap" | "noWrap" => NoWrap, "wrap" => Wrap, "wrapReverse" => WrapReverse,
    }
    fn de_grid_auto_flow("gridAutoFlow") -> GridAutoFlow {
        "row" => Row, "column" => Column,
        "rowDense" => RowDense, "columnDense" => ColumnDense,
    }
    // Unknown values fall back to `Pass` (bevy's default) so a typo stays
    // click-through rather than silently swallowing pointer interaction.
    fn de_focus_policy("focusPolicy") -> FocusPolicy {
        "block" => Block, "pass" => Pass,
    }
    fn de_text_align("textAlign") -> Justify {
        "left" => Left, "center" => Center, "right" => Right,
        "justify" => Justified, "start" => Start, "end" => End,
    }
    fn de_line_break("lineBreak") -> LineBreak {
        "wordBoundary" => WordBoundary, "anyCharacter" => AnyCharacter,
        "wordOrCharacter" => WordOrCharacter, "noWrap" => NoWrap,
    }
    // Unknown keywords (incl. `<image>`-only modes like "auto"/"sliced") fall
    // back to the layout-inert `Stretch`.
    fn de_bg_image_mode("backgroundImage") -> BackgroundImageMode {
        "stretch" => Stretch, "repeat" => Repeat,
        "repeatX" => RepeatX, "repeatY" => RepeatY,
    }
}

/// Totalizing decode for [`Style::background_image`]: any malformed value —
/// a bare string (there is no shorthand form), a spec missing `src`, a
/// non-object — warns and decodes to `None` rather than aborting the whole
/// batch (the repo-wide decode invariant). Also warns on a `scale` that a
/// non-repeat `mode` would silently ignore.
fn de_background_image<'de, D: Deserializer<'de>>(
    d: D,
) -> Result<Option<BackgroundImageSpec>, D::Error> {
    let v = serde_json::Value::deserialize(d)?;
    if v.is_null() {
        return Ok(None);
    }
    match BackgroundImageSpec::deserialize(&v) {
        Ok(spec) => {
            if spec.scale.is_some() && !spec.mode.unwrap_or_default().tiles() {
                decode_warn(
                    "backgroundImage",
                    &v.to_string(),
                    "backgroundImage `scale` only applies to the repeat modes; ignored under \"stretch\"",
                );
            }
            Ok(Some(spec))
        }
        Err(err) => {
            decode_warn(
                "backgroundImage",
                &v.to_string(),
                &format!("invalid backgroundImage (object with `src` required): {err}"),
            );
            Ok(None)
        }
    }
}

/// `fontWeight`: a named keyword or a numeric weight string (`"600"`). Not a
/// [`keyword_fields!`] entry because of the numeric form. Unrecognized → warn +
/// `NORMAL` (400).
fn de_font_weight<'de, D: Deserializer<'de>>(d: D) -> Result<Option<FontWeight>, D::Error> {
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

/// Split a grid track list on whitespace while keeping `repeat(...)` groups
/// (which contain spaces) intact.
fn split_tracks(s: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut depth = 0usize;
    let mut cur = String::new();
    for ch in s.chars() {
        match ch {
            '(' => {
                depth += 1;
                cur.push(ch);
            }
            ')' => {
                depth = depth.saturating_sub(1);
                cur.push(ch);
            }
            c if c.is_whitespace() && depth == 0 => {
                if !cur.is_empty() {
                    out.push(std::mem::take(&mut cur));
                }
            }
            c => cur.push(c),
        }
    }
    if !cur.is_empty() {
        out.push(cur);
    }
    out
}

/// Parse one sizing token (`"1fr"`, `"100px"`, `"50%"`, `"auto"`,
/// `"min-content"`, `"max-content"`, `"2flex"`) into a `GridTrack`.
fn single_track(token: &str) -> Option<GridTrack> {
    let t = token.trim();
    match t {
        "auto" => return Some(GridTrack::auto()),
        "min-content" => return Some(GridTrack::min_content()),
        "max-content" => return Some(GridTrack::max_content()),
        _ => {}
    }
    let parse = |num: &str| num.trim().parse::<f32>().ok();
    if let Some(v) = t.strip_suffix("fr").and_then(parse) {
        Some(GridTrack::fr(v))
    } else if let Some(v) = t.strip_suffix("flex").and_then(parse) {
        Some(GridTrack::flex(v))
    } else if let Some(v) = t.strip_suffix("px").and_then(parse) {
        Some(GridTrack::px(v))
    } else {
        t.strip_suffix('%').and_then(parse).map(GridTrack::percent)
    }
}

/// Build a repeated track (`repeat(count, token)`), dispatching on the unit.
fn repeated_track(count: u16, token: &str) -> Option<RepeatedGridTrack> {
    let t = token.trim();
    match t {
        "auto" => return Some(RepeatedGridTrack::auto(count)),
        "min-content" => return Some(RepeatedGridTrack::min_content(count)),
        "max-content" => return Some(RepeatedGridTrack::max_content(count)),
        _ => {}
    }
    let parse = |num: &str| num.trim().parse::<f32>().ok();
    if let Some(v) = t.strip_suffix("fr").and_then(parse) {
        Some(RepeatedGridTrack::fr(count, v))
    } else if let Some(v) = t.strip_suffix("flex").and_then(parse) {
        Some(RepeatedGridTrack::flex(count, v))
    } else if let Some(v) = t.strip_suffix("px").and_then(parse) {
        Some(RepeatedGridTrack::px(count as usize, v))
    } else {
        t.strip_suffix('%')
            .and_then(parse)
            .map(|v| RepeatedGridTrack::percent(count as usize, v))
    }
}

/// Parse a CSS grid template (`"repeat(3, 1fr)"`, `"1fr 2fr 100px"`, `"auto"`).
/// An unparsable token warns and is skipped; the rest of the template survives.
fn parse_template(s: &str) -> Vec<RepeatedGridTrack> {
    split_tracks(s)
        .into_iter()
        .filter_map(|tok| {
            let parse_one = || {
                if let Some(inner) = tok
                    .strip_prefix("repeat(")
                    .and_then(|t| t.strip_suffix(')'))
                {
                    let (count, track) = inner.split_once(',')?;
                    repeated_track(count.trim().parse().ok()?, track)
                } else {
                    single_track(&tok).map(Into::into)
                }
            };
            let parsed = parse_one();
            if parsed.is_none() {
                decode_warn(
                    "gridTrack",
                    &tok,
                    &format!("ignoring unparsable grid track {tok:?}"),
                );
            }
            parsed
        })
        .collect()
}

/// Parse an auto-track list (`grid-auto-rows`/`columns`); no `repeat()`.
fn parse_auto_tracks(s: &str) -> Vec<GridTrack> {
    split_tracks(s)
        .iter()
        .filter_map(|t| {
            let parsed = single_track(t);
            if parsed.is_none() {
                decode_warn(
                    "gridTrack",
                    t,
                    &format!("ignoring unparsable grid track {t:?}"),
                );
            }
            parsed
        })
        .collect()
}

/// Fallible half of [`de_grid_placement`]: `None` on anything that must not
/// reach `GridPlacement`'s panicking constructors. A zero anywhere in the value
/// (invalid in CSS) aborts the whole placement (rather than degrading to a
/// partial one, which would silently mis-place the item).
fn try_grid_placement(s: &str) -> Option<GridPlacement> {
    enum Token {
        Num(i16),  // a nonzero line number
        Span(u16), // a nonzero `span N`
        Auto,
        Invalid, // a zero line/span, or an unrecognized token
    }
    fn token(t: &str) -> Token {
        let t = t.trim();
        if t == "auto" {
            return Token::Auto;
        }
        if let Some(n) = t.strip_prefix("span") {
            return match n.trim().parse::<u16>() {
                Ok(0) | Err(_) => Token::Invalid,
                Ok(n) => Token::Span(n),
            };
        }
        match t.parse::<i16>() {
            Ok(0) | Err(_) => Token::Invalid,
            Ok(n) => Token::Num(n),
        }
    }
    use Token::*;
    if let Some((a, b)) = s.split_once('/') {
        return Some(match (token(a), token(b)) {
            (Num(start), Span(span)) => GridPlacement::start_span(start, span),
            (Auto, Span(span)) => GridPlacement::span(span),
            (Num(start), Num(end)) => GridPlacement::start_end(start, end),
            (Num(start), Auto) => GridPlacement::start(start),
            (Auto, Num(end)) => GridPlacement::end(end),
            (Auto, Auto) => GridPlacement::auto(),
            _ => return None,
        });
    }
    match token(s) {
        Auto => Some(GridPlacement::auto()),
        Span(span) => Some(GridPlacement::span(span)),
        Num(line) => Some(GridPlacement::start(line)),
        Invalid => None,
    }
}

/// Shared shape of the three grid deserializers: string in, parsed value out,
/// `null` → `None`, non-string → hard error (like the keyword fields).
macro_rules! grid_fields {
    ( $(
        $(#[$meta:meta])*
        fn $fn_name:ident($expect:literal) -> $ty:ty { $parse:expr }
    )+ ) => { $(
        $(#[$meta])*
        fn $fn_name<'de, D: Deserializer<'de>>(d: D) -> Result<Option<$ty>, D::Error> {
            struct V;
            impl<'de> Visitor<'de> for V {
                type Value = Option<$ty>;
                fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                    f.write_str($expect)
                }
                fn visit_str<E: de::Error>(self, s: &str) -> Result<Self::Value, E> {
                    let parse: fn(&str) -> $ty = $parse;
                    Ok(Some(parse(s)))
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
    )+ };
}

grid_fields! {
    fn de_grid_template("a CSS grid template string") -> Vec<RepeatedGridTrack> {
        parse_template
    }
    fn de_grid_auto_tracks("a grid auto-track list string") -> Vec<GridTrack> {
        parse_auto_tracks
    }
    /// A zero grid line/span (invalid in CSS — and `GridPlacement`'s
    /// constructors panic on it) or an unrecognized token warns and falls back
    /// to `auto`.
    fn de_grid_placement("a grid line placement string") -> GridPlacement {
        |s| {
            try_grid_placement(s).unwrap_or_else(|| {
                decode_warn(
                    "gridPlacement",
                    s,
                    &format!("unrecognized grid placement {s:?}"),
                );
                GridPlacement::default()
            })
        }
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
                        _ => decode_warn(
                            "borderColor",
                            &key,
                            &format!(
                                "unknown borderColor side {key:?}; ignoring (expected top/right/bottom/left)"
                            ),
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
    /// `"pointerUp"` / `"pointerEnter"` / `"pointerLeave"`), `"scroll"`,
    /// `"wheel"`, a `canvas`'s `"resize"`, or one of an `editableText`'s
    /// `"change"` / `"select"` / `"focus"` / `"blur"` events.
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
    /// Which mouse button fired, in DOM `MouseEvent.button` numbering:
    /// `0` left/primary, `1` middle/auxiliary, `2` right/secondary. Present for
    /// `"pointerDown"`/`"pointerMove"`/`"pointerUp"`; absent for `"click"`
    /// (primary-only, like DOM `click`) and hover/scroll/text events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub button: Option<u8>,
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
    /// Raw horizontal wheel delta (the frame's accumulated scroll). Present only
    /// for `"wheel"` events; interpret with [`delta_mode`](Self::delta_mode).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta_x: Option<f32>,
    /// Raw vertical wheel delta. Present only for `"wheel"` events; positive is a
    /// wheel-down / scroll-forward gesture, matching DOM `WheelEvent.deltaY`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta_y: Option<f32>,
    /// How to read the wheel deltas: `"line"` (mouse notches — scale by your own
    /// per-line distance) or `"pixel"` (trackpad — already in pixels). Mirrors
    /// DOM `WheelEvent.deltaMode`. Present only for `"wheel"` events.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delta_mode: Option<String>,
    /// New logical (CSS px) width of a `canvas`'s laid-out box. Present only for
    /// `"resize"` events, which fire on first layout (0 → W×H) and whenever the
    /// physical pixel size changes (including a DPR change at constant logical
    /// size). The surface was cleared — redraw.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub width: Option<f32>,
    /// New logical height of a `canvas`'s laid-out box. Present only for
    /// `"resize"` events; see [`width`](Self::width).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub height: Option<f32>,
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
    /// A token-tagged animation driver settled: `finished` is `true` on natural
    /// completion, `false` on interruption. `token` correlates the JS completion
    /// callback registered when the driver was assigned.
    AnimationFinished {
        id: crate::animations::SharedId,
        token: u64,
        finished: bool,
    },
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

    /// `OpBatch` stamps decode-fallback warnings with the op that carried
    /// them, so devtools can attribute "invalid length" to a node id even
    /// though the field visitors can't see one. The decode sink is
    /// thread-local (and cleared at batch start), so this is parallel-safe.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn op_batch_attributes_decode_warnings() {
        // A leftover from an earlier decode on this thread must not leak in.
        crate::diag::decode_report("length", "stale", "stale entry");
        let json = r#"[
            {"op":"update","id":7,"props":{"style":{"width":"aa16"}}},
            {"op":"append","parent":0,"child":7},
            {"op":"update","id":9,"props":{"style":{"display":"flexx","padding":"1px bogus"}}}
        ]"#;
        let batch: OpBatch = serde_json::from_str(json).expect("batch decodes");
        assert_eq!(batch.0.len(), 3, "fallbacks must not drop ops");
        let warns = crate::diag::take_decode_warnings();
        let brief: Vec<_> = warns
            .iter()
            .map(|w| (w.node, w.kind, w.value.as_str()))
            .collect();
        assert_eq!(
            brief,
            vec![
                (Some(7), "length", "aa16"),
                (Some(9), "display", "flexx"),
                (Some(9), "rect", "bogus"),
            ],
        );
        assert!(warns.iter().all(|w| !w.message.is_empty()));
        assert!(
            crate::diag::take_decode_warnings().is_empty(),
            "drain empties the sink"
        );
    }

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
        assert_eq!(t.scale.static_val(), Some(0.95));
        // A bare number is logical pixels; a unit string carries an explicit unit.
        assert_eq!(t.translate_x.static_val(), Some(Length::Px(4.0)));
        assert_eq!(t.translate_y.static_val(), Some(Length::Percent(50.0)));
        assert_eq!(t.scale_x, None);
        assert_eq!(s.opacity.static_val(), Some(0.5));
        let transition = s.transition.expect("transition present");
        assert!(transition.for_transform().is_some());
        assert!(transition.for_opacity().is_none());
    }

    /// `transform3d` decodes its full field set (degrees and rad-string angles,
    /// percent-or-px origin), a malformed angle falls back to identity, an
    /// empty object is identity, and a wire delta dirties
    /// `TRANSFORM3D | LAYER | TRANSITION`.
    #[test]
    fn deserializes_transform3d() {
        let s: Style = serde_json::from_str(
            r#"{
                "transform3d": {
                    "perspective": 800,
                    "translateZ": -20,
                    "rotateY": 45,
                    "rotateX": "1.5rad",
                    "rotateZ": "not-an-angle",
                    "scale": 1.25,
                    "origin": { "x": "50%", "y": 10 }
                }
            }"#,
        )
        .expect("style decodes");
        let t = s.transform3d.clone().expect("transform3d present");
        assert_eq!(t.perspective.static_val(), Some(800.0));
        assert_eq!(t.translate_z.static_val(), Some(-20.0));
        assert_eq!(
            t.rotate_y.static_val().unwrap().radians(),
            45f32.to_radians()
        );
        assert_eq!(t.rotate_x.static_val().unwrap().radians(), 1.5);
        // Malformed angle → warn-and-identity, never a decode failure.
        assert_eq!(t.rotate_z.static_val().unwrap().radians(), 0.0);
        assert_eq!(t.scale.static_val(), Some(1.25));
        let origin = t.origin.clone().expect("origin present");
        assert_eq!(origin.x.value(), Some(&Length::Percent(50.0)));
        assert_eq!(origin.y.value(), Some(&Length::Px(10.0)));
        assert!(!t.is_identity());

        let s: Style = serde_json::from_str(r#"{ "transform3d": {} }"#).expect("style decodes");
        assert!(s.transform3d.expect("present").is_identity());

        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "transform3d": { "rotateY": 45 } } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::TRANSFORM3D));
        assert!(dirty.style.intersects(style_groups::LAYER));
        assert!(dirty.style.intersects(style_groups::TRANSITION));
    }

    /// `groupAlpha` decodes as a plain bool, defaults to absent, and its wire
    /// delta dirties the `LAYER` group (the promotion evaluator's trigger),
    /// as does `opacity`.
    #[test]
    fn group_alpha_decodes_and_dirties_layer() {
        let s: Style = serde_json::from_str(r#"{ "groupAlpha": false }"#).expect("style decodes");
        assert_eq!(s.group_alpha, Some(false));
        let s: Style = serde_json::from_str("{}").expect("style decodes");
        assert_eq!(s.group_alpha, None);

        // Delta-merge marks the LAYER group for both trigger fields.
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "groupAlpha": false } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::LAYER));
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "opacity": 0.5 } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::LAYER));
        let style = cached.style.as_ref().expect("style retained");
        assert_eq!(style.group_alpha, Some(false));
        assert_eq!(style.opacity.static_val(), Some(0.5));
    }

    /// `cache` decodes its keywords (unknown → warn + default) and a delta
    /// touching it marks the LAYER group, driving promotion re-evaluation.
    #[test]
    fn cache_keyword_decodes_and_dirties_layer() {
        let s: Style = serde_json::from_str(r#"{ "cache": "always" }"#).expect("style decodes");
        assert_eq!(s.cache, Some(LayerCache::Always));
        let s: Style = serde_json::from_str(r#"{ "cache": "auto" }"#).expect("style decodes");
        assert_eq!(s.cache, Some(LayerCache::Auto));
        let s: Style = serde_json::from_str(r#"{ "cache": "never" }"#).expect("style decodes");
        assert_eq!(s.cache, Some(LayerCache::Never));
        let s: Style = serde_json::from_str("{}").expect("style decodes");
        assert_eq!(s.cache, None);
        // Unrecognized keyword: warn + fall back to the default (`auto`).
        let s: Style = serde_json::from_str(r#"{ "cache": "sometimes" }"#).expect("style decodes");
        assert_eq!(s.cache, Some(LayerCache::Auto));

        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "cache": "always" } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::LAYER));
        assert_eq!(
            cached.style.as_ref().and_then(|s| s.cache),
            Some(LayerCache::Always)
        );
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
        let bc = uniform
            .border_color
            .static_ref()
            .expect("border_color present");
        assert_eq!(bc.top.as_deref(), Some("white"));
        assert_eq!(bc.right.as_deref(), Some("white"));
        assert_eq!(bc.bottom.as_deref(), Some("white"));
        assert_eq!(bc.left.as_deref(), Some("white"));

        // Object form sets only the named sides; the rest stay None (transparent).
        let sided: Style =
            serde_json::from_str(r##"{ "borderColor": { "top": "#f00", "left": "blue" } }"##)
                .expect("object decodes");
        let bc = sided
            .border_color
            .static_ref()
            .expect("border_color present");
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
        let bc = bogus
            .border_color
            .static_ref()
            .expect("border_color present");
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
        assert_eq!(s.width.static_val(), Some(Length::default()));
        assert_eq!(s.height.static_val(), Some(Length::Px(40.0)));

        // Bad `fontSize` → default `Px(0.0)`.
        let s: Style = serde_json::from_str(r#"{ "fontSize": "16pxx" }"#)
            .expect("bad fontSize must not abort");
        assert_eq!(s.font_size, Some(FontSize::Px(0.0)));

        // Bad transform `rotate` (angle) → default `Angle(0)`, valid `translateX` intact.
        let t: Transform = serde_json::from_str(r#"{ "rotate": "45degg", "translateX": "50%" }"#)
            .expect("bad angle must not abort");
        assert_eq!(t.rotate.static_val(), Some(Angle::default()));
        assert_eq!(t.translate_x.static_val(), Some(Length::Percent(50.0)));

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
        assert_eq!(s.display, Some(Display::Grid));
        assert_eq!(s.align_items, Some(AlignItems::Start));
        assert_eq!(s.align_self, Some(AlignSelf::FlexStart));
        assert_eq!(s.align_content, Some(AlignContent::SpaceBetween));
        assert_eq!(s.justify_content, Some(JustifyContent::FlexEnd));
        assert_eq!(s.flex_wrap, Some(FlexWrap::NoWrap));
        assert_eq!(s.focus_policy, Some(FocusPolicy::Block));
        assert_eq!(s.text_align, Some(Justify::Justified));
        assert_eq!(s.line_break, Some(LineBreak::AnyCharacter));

        let s: Style = serde_json::from_value(serde_json::json!({
            "alignItems": "flexStart",
            "justifyContent": "start",
            // both keyword spellings of boxSizing are accepted
            "boxSizing": "border-box",
            "flexWrap": "noWrap",
        }))
        .expect("alias keywords decode");
        assert_eq!(s.align_items, Some(AlignItems::FlexStart));
        assert_eq!(s.justify_content, Some(JustifyContent::Start));
        assert_eq!(s.box_sizing, Some(BoxSizing::BorderBox));
        assert_eq!(s.flex_wrap, Some(FlexWrap::NoWrap));
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
        assert_eq!(s.display, Some(Display::default()));
        assert_eq!(s.align_items, Some(AlignItems::default()));
        assert_eq!(s.flex_direction, Some(FlexDirection::default()));
        assert_eq!(s.text_align, Some(Justify::default()));
        assert_eq!(s.font_weight, Some(FontWeight::NORMAL));
        assert_eq!(s.focus_policy, Some(FocusPolicy::Pass));
        assert_eq!(s.line_break, Some(LineBreak::WordBoundary));
    }

    /// `fontWeight` takes a named keyword or a numeric weight string.
    #[test]
    fn font_weight_keywords_and_numeric() {
        let fw = |v: serde_json::Value| {
            serde_json::from_value::<Style>(serde_json::json!({ "fontWeight": v }))
                .expect("fontWeight decodes")
                .font_weight
        };
        assert_eq!(fw("bold".into()), Some(FontWeight::BOLD));
        assert_eq!(fw("600".into()), Some(FontWeight(600)));
        assert_eq!(fw("thin".into()), Some(FontWeight::THIN));
    }

    /// Grid templates/placements parse once at decode into the bevy types.
    #[test]
    fn grid_templates_and_placement_decode() {
        let s: Style = serde_json::from_value(serde_json::json!({
            "gridTemplateColumns": "1fr 2fr 100px",
            "gridTemplateRows": "repeat(3, 1fr)",
            "gridAutoRows": "auto 40px",
        }))
        .expect("grid template decodes");
        assert_eq!(s.grid_template_columns.map(|t| t.len()), Some(3));
        assert_eq!(s.grid_template_rows.map(|t| t.len()), Some(1));
        assert_eq!(s.grid_auto_rows.map(|t| t.len()), Some(2));

        // An unparsable track is skipped (warned); the rest survive.
        let s: Style =
            serde_json::from_value(serde_json::json!({ "gridTemplateRows": "1fr bogus 2fr" }))
                .expect("bad track must not abort");
        assert_eq!(s.grid_template_rows.map(|t| t.len()), Some(2));

        let placed = |v: &str| {
            let s: Style = serde_json::from_value(serde_json::json!({ "gridRow": v }))
                .expect("grid placement decodes");
            format!("{:?}", s.grid_row.unwrap())
        };
        let expect = |p: GridPlacement| format!("{p:?}");
        assert_eq!(placed("1 / 3"), expect(GridPlacement::start_end(1, 3)));
        assert_eq!(placed("span 2"), expect(GridPlacement::span(2)));
        assert_eq!(
            placed("2 / span 3"),
            expect(GridPlacement::start_span(2, 3))
        );
        assert_eq!(placed("2 / 2"), expect(GridPlacement::start_end(2, 2)));
        assert_eq!(placed("-1"), expect(GridPlacement::start(-1)));
        assert_eq!(placed("2 / auto"), expect(GridPlacement::start(2)));
        assert_eq!(placed("auto / 3"), expect(GridPlacement::end(3)));
    }

    /// A zero grid line/span is invalid CSS and panics `GridPlacement`'s
    /// constructors — every zero-bearing form must warn and fall back to `auto`
    /// at decode, never reach the constructor or degrade to a partial placement.
    #[test]
    fn grid_placement_zero_falls_back_to_auto() {
        let placed = |v: &str| {
            let s: Style = serde_json::from_value(serde_json::json!({ "gridRow": v }))
                .expect("zero placement must not abort");
            format!("{:?}", s.grid_row.unwrap())
        };
        let auto = format!("{:?}", GridPlacement::auto());
        for s in ["0", "span 0", "0 / 2", "2 / 0", "0 / span 2", "2 / span 0"] {
            assert_eq!(placed(s), auto, "input {s:?}");
        }
        // Unrecognized garbage also falls back rather than panicking.
        assert_eq!(placed("garbage"), auto);
    }

    /// A `filter` decodes *through* `Style` into the layer-based chain (the
    /// chain's own decode is unit-tested in `crate::filters`): a single
    /// `{name, params}` object is a 1-element chain, an array preserves order,
    /// and a malformed entry degrades the whole chain to empty without
    /// aborting the containing `Style`.
    #[test]
    fn deserializes_filter_chain() {
        use crate::filters::FilterChain;

        // A single object is a 1-element chain; params stay a raw map.
        let s: Style =
            serde_json::from_str(r#"{ "filter": { "name": "blur", "params": { "radius": 4 } } }"#)
                .expect("filter decodes");
        let chain = s.filter.expect("filter present");
        assert_eq!(chain.0.len(), 1);
        assert_eq!(chain.0[0].name, "blur");
        assert_eq!(chain.0[0].params["radius"], serde_json::json!(4));

        // An array preserves declaration order (chain order = pass order).
        let s: Style =
            serde_json::from_str(r#"{ "filter": [{ "name": "blur" }, { "name": "grayscale" }] }"#)
                .expect("filter decodes");
        let names: Vec<&str> = s
            .filter
            .as_ref()
            .expect("filter present")
            .0
            .iter()
            .map(|u| u.name.as_str())
            .collect();
        assert_eq!(names, ["blur", "grayscale"]);

        // A malformed entry degrades the whole chain to empty without
        // aborting the Style — the sibling field still decodes.
        let s: Style =
            serde_json::from_str(r#"{ "filter": [{ "name": "blur" }, 3], "opacity": 0.5 }"#)
                .expect("a bad filter entry must not abort the style");
        assert_eq!(s.filter, Some(FilterChain::default()));
        assert_eq!(s.opacity.static_val(), Some(0.5));
    }

    /// A `filter` delta dirties FILTER (the `FilterInput` re-stamp) and LAYER
    /// (the promotion evaluator's trigger); a variant carrying a filter rides
    /// the `hover_style` flag, which the reconciler also treats as a layer
    /// trigger (variant filters promote — the field is `overlay`).
    #[test]
    fn filter_delta_dirties_filter_and_layer() {
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "filter": { "name": "blur" } } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::FILTER));
        assert!(dirty.style.intersects(style_groups::LAYER));

        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "hoverStyle": { "filter": { "name": "blur" } } })),
            &[],
            &[],
        );
        assert!(dirty.hover_style);
        let hover = cached.hover_style.as_ref().expect("variant retained");
        assert!(hover.filter.is_some(), "variant carries the chain");
    }

    /// A `backdropFilter` delta dirties BACKDROP (the `BackdropInput`
    /// re-stamp) and LAYER (the promotion trigger) — and never FILTER: the
    /// two chains are independent channels. `styleUnset` re-fires the same
    /// groups so the removal reaches the apply arm and the evaluator.
    #[test]
    fn backdrop_filter_delta_dirties_backdrop_and_layer() {
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "backdropFilter": { "name": "blur" } } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::BACKDROP));
        assert!(dirty.style.intersects(style_groups::LAYER));
        assert!(!dirty.style.intersects(style_groups::FILTER));
        assert!(
            cached
                .style
                .as_ref()
                .is_some_and(|s| s.backdrop_filter.is_some())
        );

        let (dirty, _) = cached.merge_delta(Props::default(), &[], &["backdropFilter".into()]);
        assert!(dirty.style.intersects(style_groups::BACKDROP));
        assert!(dirty.style.intersects(style_groups::LAYER));
        assert!(
            cached
                .style
                .as_ref()
                .is_some_and(|s| s.backdrop_filter.is_none())
        );
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
        assert!(v.get("button").is_none(), "button omitted on text events");
    }

    /// A pointer event carries the DOM button number; button-less events omit it
    /// entirely (see the `serializes_change_event_with_value` assertion above).
    #[test]
    fn serializes_pointer_event_with_button() {
        let ev = UiEvent {
            id: 3,
            kind: "pointerDown".into(),
            button: Some(2),
            ..Default::default()
        };
        let v = serde_json::to_value(&ev).expect("serializable");
        assert_eq!(v["kind"], "pointerDown");
        assert_eq!(v["button"], 2);
    }

    /// Compile-time completeness guard: a `Style` struct literal built from the
    /// field table must name every field — adding a `Style` field without
    /// extending `with_style_fields!` fails this with E0063 (missing field).
    #[test]
    fn style_field_table_is_complete() {
        macro_rules! build_full {
            ($(($f:ident, $name:literal, $g:tt, $ov:ident),)*) => {
                Style { $($f: None,)* }
            };
        }
        let _style: Style = with_style_fields!(build_full);
    }

    /// Every table wire name must equal serde's `rename_all = "camelCase"`
    /// rendering of the field ident, or `unset_field`/the JS delta builder
    /// would miss the field.
    #[test]
    fn style_wire_names_match_serde_rename() {
        fn camel(s: &str) -> String {
            let mut out = String::new();
            let mut up = false;
            for c in s.chars() {
                if c == '_' {
                    up = true;
                } else if up {
                    out.extend(c.to_uppercase());
                    up = false;
                } else {
                    out.push(c);
                }
            }
            out
        }
        macro_rules! check {
            ($(($f:ident, $name:literal, $g:tt, $ov:ident),)*) => {
                $( assert_eq!(camel(stringify!($f)), $name, "table wire name for `{}`", stringify!($f)); )*
            };
        }
        with_style_fields!(check);
    }

    fn props(json: serde_json::Value) -> Props {
        serde_json::from_value(json).expect("valid props")
    }

    /// A delta sets exactly the supplied fields; everything else is preserved.
    #[test]
    fn merge_delta_sets_and_preserves() {
        let mut cached = props(serde_json::json!({
            "style": { "backgroundColor": "red", "outline": { "color": "white" } },
            "hoverStyle": { "backgroundColor": "blue" },
            "onClick": true,
            "src": "a.png",
        }));
        let (dirty, ev) = cached.merge_delta(
            props(serde_json::json!({ "style": { "width": 100 } })),
            &[],
            &[],
        );

        let style = cached.style.as_ref().unwrap();
        assert_eq!(style.width.static_val(), Some(Length::Px(100.0)));
        assert_eq!(
            style.background_color.static_ref().map(String::as_str),
            Some("red")
        );
        assert!(style.outline.is_some(), "untouched style fields preserved");
        assert!(cached.hover_style.is_some(), "untouched props preserved");
        assert!(cached.on_click);
        assert_eq!(cached.src.as_deref(), Some("a.png"));

        assert!(dirty.style.intersects(style_groups::LAYOUT));
        assert!(
            !dirty
                .style
                .intersects(style_groups::BACKGROUND | style_groups::OUTLINE),
            "untouched groups must stay clean"
        );
        assert!(!dirty.hover_style && !dirty.pointer && !dirty.image);
        // `width` is a transitioned channel, so the transition group re-arms.
        assert!(dirty.style.intersects(style_groups::TRANSITION));
        assert!(ev.value.is_none() && ev.draw.is_none());
    }

    /// `unset` resets props (bools to false, options to None); `style_unset`
    /// clears style fields — even when the delta carries no `style` object.
    #[test]
    fn merge_delta_unsets() {
        let mut cached = props(serde_json::json!({
            "style": { "backgroundColor": "red", "width": 50 },
            "hoverStyle": { "backgroundColor": "blue" },
            "onClick": true,
        }));
        let (dirty, _) = cached.merge_delta(
            Props::default(),
            &["hoverStyle".into(), "onClick".into()],
            &["backgroundColor".into()],
        );

        let style = cached.style.as_ref().unwrap();
        assert_eq!(style.background_color, None);
        assert_eq!(
            style.width.static_val(),
            Some(Length::Px(50.0)),
            "other style fields kept"
        );
        assert!(cached.hover_style.is_none());
        assert!(!cached.on_click);
        assert!(dirty.style.intersects(style_groups::BACKGROUND));
        assert!(!dirty.style.intersects(style_groups::LAYOUT));
        assert!(dirty.hover_style && dirty.pointer);
        assert!(dirty.any_style_variant());
    }

    /// The bool-flag contract the JS diff relies on (bridge.ts
    /// `BOOL_PROP_KEYS`): a plain-`bool` field can't distinguish an explicit
    /// `false` from absent on the wire, so a `false` in the delta is a no-op —
    /// turning a flag off must ride `unset`, which resets it and dirties its
    /// group.
    #[test]
    fn merge_delta_bool_false_is_noop_off_rides_unset() {
        let mut cached = props(serde_json::json!({ "flipX": true, "flipY": true }));

        // `{"flipX": false}` decodes identically to an absent field: no-op.
        let (dirty, _) = cached.merge_delta(props(serde_json::json!({ "flipX": false })), &[], &[]);
        assert!(cached.flip_x, "explicit false in a delta must not clear");
        assert!(!dirty.image);

        // The off path: `unset` resets the flag and dirties the image group.
        let (dirty, _) = cached.merge_delta(Props::default(), &["flipX".into()], &[]);
        assert!(!cached.flip_x);
        assert!(cached.flip_y, "sibling flag untouched");
        assert!(dirty.image);
    }

    /// `"style"` in `unset` drops the whole style and dirties every group.
    #[test]
    fn merge_delta_unsets_style_wholesale() {
        let mut cached = props(serde_json::json!({
            "style": { "backgroundColor": "red", "width": 50 },
        }));
        let (dirty, _) = cached.merge_delta(Props::default(), &["style".into()], &[]);
        assert!(cached.style.is_none());
        assert_eq!(dirty.style, StyleDirty::ALL);
    }

    /// Event-like fields ride out through `UpdateEvents` and are never retained.
    #[test]
    fn merge_delta_events_not_cached() {
        let mut cached = Props::default();
        let (dirty, ev) = cached.merge_delta(
            props(serde_json::json!({
                "value": "hi", "selectionStart": 1, "selectionEnd": 3,
                "scrollTop": 40.0, "scrollLeft": 2.0,
            })),
            &[],
            &[],
        );
        assert_eq!(ev.value.as_deref(), Some("hi"));
        assert_eq!((ev.selection_start, ev.selection_end), (Some(1), Some(3)));
        assert_eq!((ev.scroll_top, ev.scroll_left), (Some(40.0), Some(2.0)));
        assert!(cached.value.is_none() && cached.scroll_top.is_none());
        assert!(cached.selection_start.is_none());
        // Event fields alone dirty nothing.
        assert!(!dirty.style.any() && !dirty.image && !dirty.anchor);
    }

    /// Variant styles replace atomically: a delta `hoverStyle` is the whole new
    /// value, not a merge into the previous one.
    #[test]
    fn merge_delta_replaces_variants_atomically() {
        let mut cached = props(serde_json::json!({
            "hoverStyle": { "backgroundColor": "blue", "width": 10 },
        }));
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "hoverStyle": { "outline": { "color": "white" } } })),
            &[],
            &[],
        );
        let hover = cached.hover_style.as_ref().unwrap();
        assert!(hover.outline.is_some());
        assert_eq!(hover.background_color, None, "atomic replace, not a merge");
        assert_eq!(hover.width, None);
        assert!(dirty.hover_style);
    }

    /// `shape` replaces atomically — the delta value is the whole new object,
    /// so an attr absent from it is an attr removed (the amended-C1 semantics:
    /// NOT a field-wise merge like `style`) — while an identical re-send stays
    /// silent, and `"shape"` in `unset` clears it.
    #[test]
    fn merge_delta_replaces_shape_atomically() {
        let mut cached = props(serde_json::json!({ "shape": { "cx": 5, "r": 2 } }));
        let (dirty, _) =
            cached.merge_delta(props(serde_json::json!({ "shape": { "cx": 9 } })), &[], &[]);
        let shape = cached.shape.as_ref().unwrap();
        assert_eq!(shape.cx.static_val(), Some(9.0));
        assert_eq!(shape.r, None, "atomic replace: the absent attr is removed");
        assert!(dirty.shape);

        // Idempotent re-send: compare-before-set keeps the delta silent.
        let (dirty, _) =
            cached.merge_delta(props(serde_json::json!({ "shape": { "cx": 9 } })), &[], &[]);
        assert!(!dirty.shape, "an identical shape re-send must not dirty");

        let (dirty, _) = cached.merge_delta(Props::default(), &["shape".into()], &[]);
        assert!(cached.shape.is_none());
        assert!(dirty.shape);
    }

    /// The `viewBox` wire name (camelCase of `view_box`, pinned here) decodes
    /// into `Props::view_box`; merge dirties on change only, and `"viewBox"`
    /// in `unset` clears it.
    #[test]
    fn merge_delta_view_box_wire_name_set_and_unset() {
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "viewBox": "0 0 100 50" })),
            &[],
            &[],
        );
        assert_eq!(
            cached.view_box,
            Some(ViewBox {
                min: bevy::math::Vec2::ZERO,
                size: bevy::math::Vec2::new(100.0, 50.0),
            }),
            "the camelCase `viewBox` wire name must land in `view_box`"
        );
        assert!(dirty.view_box);

        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "viewBox": "0 0 100 50" })),
            &[],
            &[],
        );
        assert!(
            !dirty.view_box,
            "an identical viewBox re-send must not dirty"
        );

        let (dirty, _) = cached.merge_delta(Props::default(), &["viewBox".into()], &[]);
        assert!(cached.view_box.is_none());
        assert!(dirty.view_box);
    }

    /// `shape`/`viewBox` are retained state, not act-now events: they survive
    /// `split_events` untouched.
    #[test]
    fn shape_and_view_box_are_retained_not_events() {
        let p = props(serde_json::json!({
            "shape": { "cx": 1 },
            "viewBox": "0 0 10 10",
        }));
        let (retained, ev) = p.split_events();
        assert!(retained.shape.is_some() && retained.view_box.is_some());
        assert!(ev.value.is_none() && ev.draw.is_none());
    }

    /// Unknown names in `unset`/`style_unset` warn and are ignored — a delta
    /// from a newer/older bundle must never panic the op drain.
    #[test]
    fn merge_delta_ignores_unknown_names() {
        let mut cached = props(serde_json::json!({ "style": { "width": 10 } }));
        let (dirty, _) = cached.merge_delta(
            Props::default(),
            &["nope".into(), "value".into()],
            &["alsoNope".into()],
        );
        assert_eq!(
            cached.style.as_ref().unwrap().width.static_val(),
            Some(Length::Px(10.0))
        );
        assert!(!dirty.style.any());
    }

    /// Two sequential deltas converge to the same state as one combined delta.
    #[test]
    fn merge_delta_converges() {
        let base = serde_json::json!({
            "style": { "backgroundColor": "red", "width": 10 }, "onClick": true,
        });
        let mut two_steps = props(base.clone());
        two_steps.merge_delta(
            props(serde_json::json!({ "style": { "width": 20 } })),
            &[],
            &[],
        );
        two_steps.merge_delta(
            props(serde_json::json!({ "style": { "height": 5 } })),
            &[],
            &["backgroundColor".into()],
        );

        let mut one_step = props(base);
        one_step.merge_delta(
            props(serde_json::json!({ "style": { "width": 20, "height": 5 } })),
            &[],
            &["backgroundColor".into()],
        );

        let a = two_steps.style.as_ref().unwrap();
        let b = one_step.style.as_ref().unwrap();
        assert_eq!(a.width, b.width);
        assert_eq!(a.height, b.height);
        assert_eq!(a.background_color, b.background_color);
        assert!(two_steps.on_click && one_step.on_click);
    }

    /// `split_events` strips exactly the event-like fields, leaving state.
    #[test]
    fn split_events_strips_event_fields() {
        let full = props(serde_json::json!({
            "style": { "width": 10 }, "onClick": true, "value": "v",
            "selectionStart": 0, "selectionEnd": 1, "scrollTop": 5.0,
        }));
        let (state, ev) = full.split_events();
        assert!(state.style.is_some() && state.on_click);
        assert!(state.value.is_none() && state.selection_start.is_none());
        assert!(state.scroll_top.is_none());
        assert_eq!(ev.value.as_deref(), Some("v"));
        assert_eq!(ev.scroll_top, Some(5.0));
    }

    /// An `update` op decodes with and without the unset lists — `styleUnset`
    /// in particular must land in `style_unset` (the enum's `rename_all`
    /// doesn't cover variant fields).
    #[test]
    fn deserializes_update_delta_form() {
        let minimal: Op = serde_json::from_str(r#"{"op":"update","id":3,"props":{}}"#).unwrap();
        match minimal {
            Op::Update {
                unset, style_unset, ..
            } => {
                assert!(unset.is_empty() && style_unset.is_empty());
            }
            other => panic!("expected update, got {other:?}"),
        }
        let full: Op = serde_json::from_str(
            r#"{"op":"update","id":3,"props":{"style":{"width":1}},
                "unset":["onClick"],"styleUnset":["backgroundColor"]}"#,
        )
        .unwrap();
        match full {
            Op::Update {
                unset, style_unset, ..
            } => {
                assert_eq!(unset, vec!["onClick"]);
                assert_eq!(style_unset, vec!["backgroundColor"]);
            }
            other => panic!("expected update, got {other:?}"),
        }
    }

    /// A `draw` op decodes, including the clear commands (the imperative
    /// canvas path). Struct-variant fields aren't renamed by the enum's
    /// `rename_all`, so the wire form is pinned here.
    #[test]
    fn deserializes_draw_op() {
        let op: Op = serde_json::from_str(
            r##"{"op":"draw","id":7,"cmds":[
                {"cmd":"clear"},
                {"cmd":"clearRect","x":1.0,"y":2.0,"w":3.0,"h":4.0},
                {"cmd":"fillStyle","color":"#f00"}
            ]}"##,
        )
        .unwrap();
        match op {
            Op::Draw { id, cmds } => {
                assert_eq!(id, 7);
                assert_eq!(cmds.len(), 3);
                assert_eq!(cmds[0], DrawCmd::Clear);
                assert_eq!(
                    cmds[1],
                    DrawCmd::ClearRect {
                        x: 1.0,
                        y: 2.0,
                        w: 3.0,
                        h: 4.0
                    }
                );
                assert_eq!(
                    cmds[2],
                    DrawCmd::FillStyle {
                        color: "#f00".into()
                    }
                );
            }
            other => panic!("expected draw, got {other:?}"),
        }
    }

    /// A `"resize"` UI event serializes its logical size and omits every other
    /// optional field.
    #[test]
    fn serializes_resize_ui_event() {
        let v = serde_json::to_value(Outbound::UiEvent {
            event: UiEvent {
                id: 5,
                kind: "resize".into(),
                width: Some(300.0),
                height: Some(150.0),
                ..Default::default()
            },
        })
        .unwrap();
        assert_eq!(v["t"], "uiEvent");
        let ev = &v["event"];
        assert_eq!(ev["id"], 5);
        assert_eq!(ev["kind"], "resize");
        assert_eq!(ev["width"], 300.0);
        assert_eq!(ev["height"], 150.0);
        assert!(ev.get("x").is_none() && ev.get("scrollTop").is_none());
    }

    /// `onResize` decodes, merges into the cache, and unsets without warning —
    /// it gates nothing Rust-side, so it dirties nothing.
    #[test]
    fn merge_delta_on_resize_flag() {
        let mut cached = Props::default();
        let (dirty, _) =
            cached.merge_delta(props(serde_json::json!({ "onResize": true })), &[], &[]);
        assert!(cached.on_resize);
        assert!(!dirty.pointer && !dirty.scroll_listener);
        cached.merge_delta(Props::default(), &["onResize".into()], &[]);
        assert!(!cached.on_resize);
    }

    /// `onWheel` sets the `wheel` dirty flag on appearance and clears it on `unset`,
    /// independent of the scroll flags.
    #[test]
    fn merge_delta_wheel_flag() {
        let mut cached = Props::default();
        let (dirty, _) =
            cached.merge_delta(props(serde_json::json!({ "onWheel": true })), &[], &[]);
        assert!(cached.on_wheel);
        assert!(dirty.wheel);
        assert!(!dirty.pointer && !dirty.scroll_listener);

        let (dirty, _) = cached.merge_delta(Props::default(), &["onWheel".into()], &[]);
        assert!(!cached.on_wheel);
        assert!(dirty.wheel);
    }

    /// `cursor` decodes to the raw name (keyword or custom); resolution (registry
    /// first, then system keyword) is deferred to `drive_cursor_icon`, like `fontFamily`.
    #[test]
    fn deserializes_cursor_name() {
        let s: Style = serde_json::from_str(r#"{ "cursor": "pointer" }"#).expect("cursor decodes");
        assert_eq!(s.cursor.as_deref(), Some("pointer"));

        let s: Style =
            serde_json::from_str(r#"{ "cursor": "hand" }"#).expect("custom name decodes");
        assert_eq!(s.cursor.as_deref(), Some("hand"));
    }

    /// A `cursor` delta sets the `CURSOR` dirty group; a `style` unset of it clears
    /// the field and re-arms the group.
    #[test]
    fn merge_delta_cursor_group() {
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "cursor": "pointer" } })),
            &[],
            &[],
        );
        assert_eq!(
            cached.style.as_ref().unwrap().cursor.as_deref(),
            Some("pointer")
        );
        assert!(dirty.style.intersects(style_groups::CURSOR));
        assert!(!dirty.style.intersects(style_groups::LAYOUT));

        let (dirty, _) = cached.merge_delta(Props::default(), &[], &["cursor".into()]);
        assert_eq!(cached.style.as_ref().unwrap().cursor, None);
        assert!(dirty.style.intersects(style_groups::CURSOR));
    }

    /// `backgroundImage` decode: both `src` forms, mode keywords, and the
    /// totalizing fallbacks (unknown mode → `Stretch`, invalid value → `None`
    /// without aborting the style).
    #[test]
    fn background_image_decodes() {
        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": {
                "src": "images/bg.png",
                "mode": "repeatX",
                "scale": 2.0,
                "tint": "#ff0000",
            }
        }))
        .unwrap();
        let spec = s.background_image.expect("spec decodes");
        assert!(matches!(&spec.src, BackgroundImageSource::Path(p) if p == "images/bg.png"));
        assert_eq!(spec.mode, Some(BackgroundImageMode::RepeatX));
        assert_eq!(spec.scale.static_val(), Some(2.0));
        assert_eq!(spec.tint.static_ref().map(String::as_str), Some("#ff0000"));

        // An `{ animated }` tint decodes as a binding: the static read sees
        // the field as absent (the animation applier drives it per frame).
        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": {
                "src": "bg.png",
                "tint": { "animated": { "id": 7 } },
            }
        }))
        .unwrap();
        let spec = s.background_image.expect("animated tint decodes");
        assert!(spec.tint.static_ref().is_none());
        assert!(spec.tint.binding().is_some());

        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": { "src": { "texture": "minimap" } }
        }))
        .unwrap();
        let spec = s.background_image.expect("texture source decodes");
        assert!(
            matches!(&spec.src, BackgroundImageSource::Texture { texture } if texture == "minimap")
        );
        assert_eq!(spec.mode, None);

        // `<image>`-only keywords fall back to the layout-inert Stretch.
        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": { "src": "bg.png", "mode": "auto" }
        }))
        .unwrap();
        assert_eq!(
            s.background_image.unwrap().mode,
            Some(BackgroundImageMode::Stretch)
        );

        // A bare string (no shorthand form) or a spec without `src` drops the
        // field, keeping sibling fields of the same style.
        for bad in [
            serde_json::json!("bg.png"),
            serde_json::json!({ "tint": "red" }),
        ] {
            let s: Style = serde_json::from_value(serde_json::json!({
                "backgroundImage": bad, "width": 10,
            }))
            .unwrap();
            assert!(s.background_image.is_none());
            assert!(s.width.is_some(), "sibling fields survive the bad value");
        }
    }

    /// Repeat-axis mapping for `NodeImageMode::Tiled`.
    #[test]
    fn background_image_mode_axes() {
        use BackgroundImageMode::*;
        assert_eq!(Stretch.tile_axes(), (false, false));
        assert_eq!(Repeat.tile_axes(), (true, true));
        assert_eq!(RepeatX.tile_axes(), (true, false));
        assert_eq!(RepeatY.tile_axes(), (false, true));
        assert!(!Stretch.tiles() && Repeat.tiles());
    }

    /// The delta merge marks the `BG_IMAGE` group; `styleUnset` clears the
    /// field and returns the same bit.
    #[test]
    fn merge_delta_background_image_group() {
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({
                "style": { "backgroundImage": { "src": "bg.png", "mode": "repeat" } }
            })),
            &[],
            &[],
        );
        assert!(cached.style.as_ref().unwrap().background_image.is_some());
        assert!(dirty.style.intersects(style_groups::BG_IMAGE));
        assert!(!dirty.style.intersects(style_groups::LAYOUT));

        let (dirty, _) = cached.merge_delta(Props::default(), &[], &["backgroundImage".into()]);
        assert!(cached.style.as_ref().unwrap().background_image.is_none());
        assert!(dirty.style.intersects(style_groups::BG_IMAGE));
    }
}
