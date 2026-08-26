//! The [`Style`] object, its dirty-group partition ([`style_groups`],
//! [`StyleDirty`]), and the `with_style_fields!` table every style field is
//! registered in.

use serde::Deserialize;

use bevy::text::{FontWeight, Justify, LineBreak};
use bevy::ui::{
    AlignContent, AlignItems, AlignSelf, BoxSizing, Display, FlexDirection, FlexWrap, FocusPolicy,
    GridAutoFlow, GridPlacement, GridTrack, JustifyContent, JustifyItems, JustifySelf,
    OverflowAxis, PositionType, RepeatedGridTrack,
};

use super::animatable::Animatable;
use super::background_image::{BackgroundImageSpec, de_background_image};
use super::grid::{de_grid_auto_tracks, de_grid_placement, de_grid_template};
use super::keywords::*;
use super::transform::{Transform, Transform3d};
use super::units::{FontSize, Length, Rect};
use super::visual::{
    BorderColorSpec, BoxShadowList, GradientList, LetterSpacingSpec, LineHeightSpec, OutlineSpec,
    TextShadowSpec,
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
    /// top-left, top-right, bottom-right, bottom-left). Animatable as a
    /// whole: an `{ animated }` wrapper on the field drives all four corners
    /// with one px value (the `borderColor` precedent — no per-corner
    /// wrappers); `transition: { borderRadius }` eases static changes
    /// per corner.
    #[serde(default)]
    pub border_radius: Option<Animatable<Rect>>,
    #[serde(default)]
    pub outline: Option<OutlineSpec>,
    #[serde(default)]
    pub box_shadow: Option<BoxShadowList>,
    /// Layer-based, subtree-wide `filter` chain (see [`crate::filters`]): one
    /// `{ name, params }` object (a 1-element chain) or an ordered array of
    /// them (chain order = pass order). Omitted params take the filter's
    /// shorthand default — a *visible* effect, not necessarily the identity
    /// (a bare `grayscale` is *full* grayscale, a bare `blur` is a visible
    /// 20px blur unlike CSS's 0, while `brightness`/`contrast`/`saturate`
    /// default to identity). `params`
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
    /// View-transition-style morph: `{ key, name, params }`. When `key`
    /// changes, the node's previous rendered appearance is frozen as a
    /// snapshot and the named two-input filter (same registry as
    /// [`filter`](Self::filter)) blends frozen → live content, driven by an
    /// engine-owned `progress` eased by `transition: { morphFilter }` (a
    /// built-in default duration applies when no spec is given — the one
    /// channel that animates without being asked). Presence force-promotes
    /// the node to a composited layer (a cached capture must exist to
    /// freeze); unsetting demotes and snaps. See [`crate::filters`] (morph).
    #[serde(default, deserialize_with = "crate::filters::de_morph_filter")]
    pub morph_filter: Option<crate::filters::MorphFilter>,
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
    /// `width`, `height`, `max_width`, `max_height`, `border_radius`). The
    /// filter channel's
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
    /// [`TRANSFORM3D`]: a backdrop delta re-stages the snapshot filter
    /// run and reshapes nothing in the subtree — never content dirt.
    pub const BACKDROP: u32 = 1 << 21;
    /// `ImageNode` from `background_image` (plus the `opacity` fold into its
    /// tint). Built at the reconcile call sites — the build needs
    /// `AssetServer`, which `apply_style_masked` doesn't hold — via
    /// `crate::background_image::apply_background_image`; there is no arm for
    /// it inside `apply_style_masked` (the end-of-apply layer content-dirty
    /// tap still fires from this bit).
    pub const BG_IMAGE: u32 = 1 << 22;
    /// The wire `morphFilter` value → `MorphInput` (the morph resolver's and
    /// the morph transition channel's target; see `crate::filters` morph).
    /// Composite-side only, like [`BACKDROP`]: a morph delta re-stages
    /// the blend pass and never dirties the capture itself — the key-change
    /// re-capture is pushed precisely by the transition channel. The
    /// `apply_transition` stamp site fires on `TRANSITION | MORPH` so a
    /// morph-only delta still reaches the transition engine.
    pub const MORPH: u32 = 1 << 23;
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
            (border_radius, "borderRadius", (LAYOUT | TRANSITION), overlay),
            (outline, "outline", (OUTLINE), overlay),
            (box_shadow, "boxShadow", (BOX_SHADOW), overlay),
            (filter, "filter", (FILTER | LAYER), overlay),
            (backdrop_filter, "backdropFilter", (BACKDROP | LAYER), overlay),
            (morph_filter, "morphFilter", (MORPH | LAYER), overlay),
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::animatable::AnimatableField;
    use crate::protocol::props::{Props, props_from_json as props};

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

    /// A `borderRadius` delta marks TRANSITION (its channel target rides
    /// `TransitionInput`) alongside LAYOUT, and the field takes an
    /// `{ animated }` wrapper whose seed decodes as a `Rect`.
    #[test]
    fn border_radius_dirties_transition_and_decodes_binding() {
        let uniform8: Rect = serde_json::from_value(serde_json::json!(8)).expect("rect decodes");
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "borderRadius": 8 } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::TRANSITION));
        assert!(dirty.style.intersects(style_groups::LAYOUT));
        let style = cached.style.as_ref().expect("style retained");
        assert_eq!(style.border_radius.static_val(), Some(uniform8));

        let s: Style = serde_json::from_value(serde_json::json!({
            "borderRadius": { "animated": { "id": 3 }, "seed": 8 }
        }))
        .expect("style decodes");
        assert!(
            s.border_radius.binding().is_some(),
            "wrapper derives a binding"
        );
        assert_eq!(
            s.border_radius.static_val(),
            None,
            "animated reads as unset"
        );
        assert_eq!(
            s.border_radius.as_ref().and_then(|a| a.seed()),
            Some(&uniform8)
        );
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

    /// A `morphFilter` delta dirties MORPH (the `MorphInput` re-stamp — which
    /// also routes to `apply_transition`) and LAYER (the promotion trigger) —
    /// never FILTER/BACKDROP/TRANSITION. `styleUnset` re-fires the same
    /// groups; a malformed value degrades to `None` without aborting the
    /// containing `Style`.
    #[test]
    fn morph_filter_delta_dirties_morph_and_layer() {
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({
                "style": { "morphFilter": { "key": "a", "name": "crossfade" } }
            })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::MORPH));
        assert!(dirty.style.intersects(style_groups::LAYER));
        assert!(!dirty.style.intersects(style_groups::FILTER));
        assert!(!dirty.style.intersects(style_groups::BACKDROP));
        assert!(!dirty.style.intersects(style_groups::TRANSITION));
        let morph = cached
            .style
            .as_ref()
            .and_then(|s| s.morph_filter.as_ref())
            .expect("morph retained");
        assert_eq!(morph.key, serde_json::json!("a"));
        assert_eq!(morph.filter.name, "crossfade");

        let (dirty, _) = cached.merge_delta(Props::default(), &[], &["morphFilter".into()]);
        assert!(dirty.style.intersects(style_groups::MORPH));
        assert!(dirty.style.intersects(style_groups::LAYER));
        assert!(
            cached
                .style
                .as_ref()
                .is_some_and(|s| s.morph_filter.is_none())
        );

        // Malformed (missing key) degrades to None; the sibling field lives.
        let s: Style =
            serde_json::from_str(r#"{ "morphFilter": { "name": "crossfade" }, "opacity": 0.5 }"#)
                .expect("a bad morphFilter must not abort the style");
        assert!(s.morph_filter.is_none());
        assert_eq!(s.opacity.static_val(), Some(0.5));
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
}
