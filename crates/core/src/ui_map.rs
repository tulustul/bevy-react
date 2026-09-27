//! Translation from reconciler props (the [`crate::protocol`] wire types) into
//! `bevy_ui` components: the `Node` layout, its sibling visual components
//! (background/border/outline/shadow/z-index/global-z-index), and `ImageNode`.
//! Keyword and grid style fields already arrive as decoded `bevy_ui` values
//! (parsed once at the serde boundary — see [`crate::protocol`]), so applying
//! them here is a plain field copy.

use bevy::picking::Pickable;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::sprite::{BorderRect, SliceScaleMode, TextureSlicer};
use bevy::text::{FontSize as BevyFontSize, LetterSpacing, LineHeight};
use bevy::ui::FocusPolicy;
use bevy::ui::widget::NodeImageMode;

use crate::plugin::Fonts;
use crate::protocol::{
    animatable::Animatable, animatable::AnimatableField, background_image::AtlasSpec,
    background_image::ImageMode, background_image::ImageModeSpec, background_image::SliceBorder,
    background_image::SliceScale, background_image::SliceSpec, props::Props, units::Angle,
    units::FontSize, units::Length, units::Rect, visual::AngularStop, visual::BoxShadowList,
    visual::BoxShadowSpec, visual::ConicGradientSpec, visual::GradientList, visual::GradientSpec,
    visual::GradientStop, visual::LetterSpacingSpec, visual::LineHeightSpec,
    visual::LinearGradientSpec, visual::RadialGradientSpec, visual::RadialShapeSpec,
};
use crate::scrollbar::ScrollbarPosition;
use crate::style::Style;
use crate::style::props::{
    ALIGN_CONTENT, ALIGN_ITEMS, ALIGN_SELF, ASPECT_RATIO, BACKGROUND_COLOR, BORDER, BORDER_COLOR,
    BORDER_RADIUS, BOTTOM, BOX_SIZING, COLOR, COLUMN_GAP, DISPLAY, FLEX_BASIS, FLEX_DIRECTION,
    FLEX_GROW, FLEX_SHRINK, FLEX_WRAP, FOCUS_POLICY, FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, GAP,
    GRID_AUTO_COLUMNS, GRID_AUTO_FLOW, GRID_AUTO_ROWS, GRID_COLUMN, GRID_ROW,
    GRID_TEMPLATE_COLUMNS, GRID_TEMPLATE_ROWS, HEIGHT, JUSTIFY_CONTENT, JUSTIFY_ITEMS,
    JUSTIFY_SELF, LEFT, LETTER_SPACING, LINE_BREAK, LINE_HEIGHT, MARGIN, MAX_HEIGHT, MAX_WIDTH,
    MIN_HEIGHT, MIN_WIDTH, OPACITY, OVERFLOW_X, OVERFLOW_Y, PADDING, POSITION_TYPE, RIGHT, ROW_GAP,
    SCROLLBAR, SCROLLBAR_WIDTH, TEXT_ALIGN, TEXT_SHADOW, TOP, WIDTH, Z_INDEX,
};
use crate::style::{Invalidation, WriterCtx, WriterMask};

/// Parse a CSS color string into a `Color`: hex, named colors, `transparent`, or
/// `rgb()/hsl()/hwb()/oklab()/oklch()` functional notation (see
/// [`crate::canvas::parse_css_color`]). On an unrecognized value it warns
/// and falls back to a loud magenta so the typo is visible rather than silent.
pub fn parse_color(input: &str) -> Color {
    match crate::canvas::parse_css_color(input) {
        Some(c) => Color::from(c),
        None => {
            let msg = format!("unrecognized color {input:?}");
            crate::diag::report("color", input, &msg);
            Color::srgb(1.0, 0.0, 1.0)
        }
    }
}

/// Multiply a color's alpha by `opacity` (if any). Shared by the background and
/// text color paths so a static `opacity` fades both, like the animated path.
pub fn apply_opacity(color: Color, opacity: Option<f32>) -> Color {
    match opacity {
        Some(o) => color.with_alpha(color.alpha() * o),
        None => color,
    }
}

/// Convert a wire [`Length`] into a `bevy_ui::Val`.
pub fn length_to_val(length: Length) -> Val {
    match length {
        Length::Auto => Val::Auto,
        Length::Px(v) => Val::Px(v),
        Length::Percent(v) => Val::Percent(v),
        Length::Vw(v) => Val::Vw(v),
        Length::Vh(v) => Val::Vh(v),
        Length::VMin(v) => Val::VMin(v),
        Length::VMax(v) => Val::VMax(v),
    }
}

/// Convert a wire [`Rect`] (top/right/bottom/left) into a `UiRect`.
pub fn rect_to_uirect(rect: Rect) -> UiRect {
    UiRect {
        left: length_to_val(rect.left),
        right: length_to_val(rect.right),
        top: length_to_val(rect.top),
        bottom: length_to_val(rect.bottom),
    }
}

/// Convert a wire [`Rect`] into corner radii (top-left, top-right, bottom-right,
/// bottom-left map to the rect's top, right, bottom, left — matching the CSS
/// `border-radius` shorthand order).
pub fn rect_to_border_radius(rect: Rect) -> BorderRadius {
    BorderRadius {
        top_left: length_to_val(rect.top),
        top_right: length_to_val(rect.right),
        bottom_right: length_to_val(rect.bottom),
        bottom_left: length_to_val(rect.left),
    }
}

/// Convert one [`BoxShadowSpec`] into a `bevy_ui::ShadowStyle`.
fn shadow_style(b: &BoxShadowSpec) -> ShadowStyle {
    ShadowStyle {
        color: b.color.as_deref().map(parse_color).unwrap_or(Color::BLACK),
        x_offset: b.x_offset.map(length_to_val).unwrap_or(Val::Px(0.0)),
        y_offset: b.y_offset.map(length_to_val).unwrap_or(Val::Px(0.0)),
        spread_radius: b.spread_radius.map(length_to_val).unwrap_or(Val::Px(0.0)),
        blur_radius: b.blur_radius.map(length_to_val).unwrap_or(Val::Px(0.0)),
    }
}

/// Flatten a [`BoxShadowList`] (one or many) into the `Vec<ShadowStyle>` that
/// `bevy_ui::BoxShadow` wraps, stacked back-to-front like CSS `box-shadow`.
pub fn build_box_shadows(list: &BoxShadowList) -> Vec<ShadowStyle> {
    match list {
        BoxShadowList::One(b) => vec![shadow_style(b)],
        BoxShadowList::Many(bs) => bs.iter().map(shadow_style).collect(),
    }
}

/// Build a `bevy_ui::Node` from the layout properties. Unset properties
/// keep Bevy's defaults.
pub(crate) fn node_from(style: Option<&Style>) -> Node {
    let Some(s) = style else {
        return Node::default();
    };
    let mut node = Node::default();

    if let Some(v) = s.get(&DISPLAY).copied() {
        node.display = v;
    }
    if let Some(v) = s.get(&BOX_SIZING).copied() {
        node.box_sizing = v;
    }
    if let Some(v) = s.get(&POSITION_TYPE).copied() {
        node.position_type = v;
    }
    if let Some(v) = s.get(&OVERFLOW_X).copied() {
        node.overflow.x = v;
    }
    if let Some(v) = s.get(&OVERFLOW_Y).copied() {
        node.overflow.y = v;
    }
    if let Some(v) = s.get(&SCROLLBAR_WIDTH).copied() {
        node.scrollbar_width = v;
    } else if let Some(spec) = s.get(&SCROLLBAR) {
        // A gutter-positioned visible scrollbar reserves space for itself (content
        // shrinks) via Bevy's own `scrollbar_width` — unless the user set one
        // explicitly (handled above). A floating bar reserves nothing.
        if spec.is_visible() && spec.position() == ScrollbarPosition::Gutter {
            node.scrollbar_width = spec.thickness();
        }
    }

    if let Some(v) = s.get(&LEFT).static_val() {
        node.left = length_to_val(v);
    }
    if let Some(v) = s.get(&RIGHT).static_val() {
        node.right = length_to_val(v);
    }
    if let Some(v) = s.get(&TOP).static_val() {
        node.top = length_to_val(v);
    }
    if let Some(v) = s.get(&BOTTOM).static_val() {
        node.bottom = length_to_val(v);
    }

    if let Some(v) = s.get(&WIDTH).static_val() {
        node.width = length_to_val(v);
    }
    if let Some(v) = s.get(&HEIGHT).static_val() {
        node.height = length_to_val(v);
    }
    if let Some(v) = s.get(&MIN_WIDTH).static_val() {
        node.min_width = length_to_val(v);
    }
    if let Some(v) = s.get(&MIN_HEIGHT).static_val() {
        node.min_height = length_to_val(v);
    }
    if let Some(v) = s.get(&MAX_WIDTH).static_val() {
        node.max_width = length_to_val(v);
    }
    if let Some(v) = s.get(&MAX_HEIGHT).static_val() {
        node.max_height = length_to_val(v);
    }
    if let Some(v) = s.get(&ASPECT_RATIO).static_val() {
        node.aspect_ratio = Some(v);
    }

    if let Some(v) = s.get(&ALIGN_ITEMS).copied() {
        node.align_items = v;
    }
    if let Some(v) = s.get(&JUSTIFY_ITEMS).copied() {
        node.justify_items = v;
    }
    if let Some(v) = s.get(&ALIGN_SELF).copied() {
        node.align_self = v;
    }
    if let Some(v) = s.get(&JUSTIFY_SELF).copied() {
        node.justify_self = v;
    }
    if let Some(v) = s.get(&ALIGN_CONTENT).copied() {
        node.align_content = v;
    }
    if let Some(v) = s.get(&JUSTIFY_CONTENT).copied() {
        node.justify_content = v;
    }

    if let Some(r) = s.get(&MARGIN).copied() {
        node.margin = rect_to_uirect(r);
    }
    if let Some(r) = s.get(&PADDING).copied() {
        node.padding = rect_to_uirect(r);
    }
    if let Some(r) = s.get(&BORDER).copied() {
        node.border = rect_to_uirect(r);
    }

    if let Some(v) = s.get(&FLEX_DIRECTION).copied() {
        node.flex_direction = v;
    }
    if let Some(v) = s.get(&FLEX_WRAP).copied() {
        node.flex_wrap = v;
    }
    if let Some(v) = s.get(&FLEX_GROW).copied() {
        node.flex_grow = v;
    }
    if let Some(v) = s.get(&FLEX_SHRINK).copied() {
        node.flex_shrink = v;
    }
    if let Some(v) = s.get(&FLEX_BASIS).static_val() {
        node.flex_basis = length_to_val(v);
    }
    if let Some(v) = s.get(&GAP).static_val() {
        node.row_gap = length_to_val(v);
        node.column_gap = length_to_val(v);
    }
    if let Some(v) = s.get(&ROW_GAP).static_val() {
        node.row_gap = length_to_val(v);
    }
    if let Some(v) = s.get(&COLUMN_GAP).static_val() {
        node.column_gap = length_to_val(v);
    }

    if let Some(v) = s.get(&GRID_AUTO_FLOW).copied() {
        node.grid_auto_flow = v;
    }
    if let Some(v) = s.get(&GRID_TEMPLATE_ROWS) {
        node.grid_template_rows = v.clone();
    }
    if let Some(v) = s.get(&GRID_TEMPLATE_COLUMNS) {
        node.grid_template_columns = v.clone();
    }
    if let Some(v) = s.get(&GRID_AUTO_ROWS) {
        node.grid_auto_rows = v.clone();
    }
    if let Some(v) = s.get(&GRID_AUTO_COLUMNS) {
        node.grid_auto_columns = v.clone();
    }
    if let Some(v) = s.get(&GRID_ROW).copied() {
        node.grid_row = v;
    }
    if let Some(v) = s.get(&GRID_COLUMN).copied() {
        node.grid_column = v;
    }

    // `static_val`: an `{ animated }` radius reads as unset here (identity
    // corners) and the animation apply stage re-asserts it each frame — the
    // `width` precedent.
    if let Some(r) = s.get(&BORDER_RADIUS).static_val() {
        node.border_radius = rect_to_border_radius(r);
    }

    node
}

/// Update an entity's `Node` in place, marking it changed (→ a `bevy_ui` relayout)
/// only when the freshly built value actually differs — so a paint-only restyle
/// (e.g. `backgroundColor`) no longer forces a spurious relayout. Falls back to
/// insert when the entity has no `Node` yet (a fresh spawn whose `Node` hasn't been
/// added at command-apply time). Runs as a queued `EntityCommand`, so it needs no
/// `&mut Node` query in the caller and applies in command order (correct when a node
/// is updated more than once in one drained batch — sequential `set_if_neq`s converge).
pub(crate) fn set_node_if_changed(node: Node) -> impl EntityCommand {
    move |mut entity: EntityWorldMut| match entity.get_mut::<Node>() {
        Some(mut current) => {
            current.set_if_neq(node);
        }
        None => {
            entity.insert(node);
        }
    }
}

/// Queued compare-before-write for any `PartialEq` component (the
/// [`set_node_if_changed`] pattern generalized): `set_if_neq` when present, insert
/// when absent. Used for the components bevy's `Node` **requires**
/// (`BackgroundColor`/`BorderColor`/`ZIndex`): they are always present on a
/// node, so "absent in the style" writes the default value instead of removing
/// the component — a removal is a real table move on every create and every
/// hover/press flip, and bevy would re-add the component on the next `Node`
/// insert anyway. The defaults render exactly like absence (transparent
/// background/border; `ZIndex(0)` is bevy's documented fallback for a missing
/// `ZIndex`).
pub(crate) fn set_if_neq_or_insert<
    T: Component<Mutability = bevy::ecs::component::Mutable> + PartialEq,
>(
    value: T,
) -> impl EntityCommand {
    move |mut entity: EntityWorldMut| match entity.get_mut::<T>() {
        Some(mut current) => {
            current.set_if_neq(value);
        }
        None => {
            entity.insert(value);
        }
    }
}

/// The always-present components of a freshly spawned element, built from its
/// style so they ride the `spawn((ReactNode, …))` bundle — one archetype, no
/// moves — instead of landing as separate inserts. `focus_default` is the
/// element's `focusPolicy` when the style has none (`Block` for a `<button>`,
/// `Pass` otherwise — the focus-policy writer's default); the `Pickable`
/// mirror follows it.
///
/// Pair with [`apply_style_fresh`] for the rest of the style.
pub fn fresh_style_bundle(style: &Option<Style>, focus_default: FocusPolicy) -> impl Bundle {
    let s = style.as_ref();
    let opacity = s.and_then(|s| s.get(&OPACITY).static_val());
    let focus_policy = s
        .and_then(|s| s.get(&FOCUS_POLICY).copied())
        .unwrap_or(focus_default);
    (
        node_from(s),
        background_color(s, opacity),
        border_color(s),
        ZIndex(s.and_then(|s| s.get(&Z_INDEX).copied()).unwrap_or_default()),
        focus_policy,
        Pickable {
            should_block_lower: focus_policy == FocusPolicy::Block,
            is_hoverable: true,
        },
    )
}

/// The `BackgroundColor` a style resolves to: the folded static color, or the
/// transparent default when the style has none (or the color is `{ animated }`).
pub(crate) fn background_color(s: Option<&Style>, opacity: Option<f32>) -> BackgroundColor {
    match s.and_then(|s| s.get(&BACKGROUND_COLOR)).static_ref() {
        Some(hex) => BackgroundColor(apply_opacity(parse_color(hex), opacity)),
        None => BackgroundColor::DEFAULT,
    }
}

/// The `BorderColor` a style resolves to: per-side static colors (an unset side
/// is transparent), or the all-transparent default when the style has none.
pub(crate) fn border_color(s: Option<&Style>) -> BorderColor {
    match s.and_then(|s| s.get(&BORDER_COLOR)).static_ref() {
        Some(spec) => {
            let side = |c: &Option<String>| c.as_deref().map(parse_color).unwrap_or(Color::NONE);
            BorderColor {
                top: side(&spec.top),
                right: side(&spec.right),
                bottom: side(&spec.bottom),
                left: side(&spec.left),
            }
        }
        None => BorderColor::DEFAULT,
    }
}

/// Apply a style to an element: every registered writer runs (see
/// [`apply_style_masked`]).
pub fn apply_style(ec: &mut EntityCommands, style: &Option<Style>, ctx: &WriterCtx) {
    apply_style_masked(ec, style, WriterMask::ALL, ctx, Invalidation::ALL);
}

/// [`apply_style`] for a **freshly spawned** element whose spawn bundle carried
/// [`fresh_style_bundle`] (and, for text, the resolved text tuple): the
/// bundled writers are skipped, and `ctx.fresh` makes every "absent → remove"
/// branch a no-op (a fresh entity has nothing to remove — each of those would
/// otherwise be a queued no-op command, ~30 per node on a typical style). The
/// create path only; updates and restyles keep the full remove semantics.
pub fn apply_style_fresh(ec: &mut EntityCommands, style: &Option<Style>, ctx: &WriterCtx) {
    debug_assert!(ctx.fresh, "apply_style_fresh with a non-fresh ctx");
    let bundled = ctx.styles.masks.fresh_bundled;
    // A fresh entity has nothing to remove or reset: only the writers
    // reading a property the style sets have work (see `Writer::apply`).
    let present = style
        .as_ref()
        .map_or(WriterMask::NONE, |s| ctx.styles.writers_for(&s.keys()));
    apply_style_masked(
        ec,
        style,
        present.without(bundled),
        ctx,
        Invalidation::PAINT,
    );
}

/// `ec.remove::<B>()` unless the entity is known fresh (nothing to remove).
pub(crate) fn remove_unless_fresh<B: Bundle>(ec: &mut EntityCommands, fresh: bool) {
    if !fresh {
        ec.remove::<B>();
    }
}

/// Run the registered [writers](crate::style::Writer) in `writers` (their
/// registration order), then act on the change's `invalidation`: a
/// [`PAINT`](Invalidation::PAINT) change re-captures the node's owning layer
/// (see `crate::layer::LayerContentDirt`). Composite-side changes (a promoted
/// root's group alpha or translation, the filter chains, the 3D matrix) are
/// not paint — the chain resolvers and `sync_transform3d_matrices` push
/// precise `composite_only` dirt themselves, and promotion flips dirty
/// correctly (a promote through the first-frame geometry hash, a demote
/// through `reapply_opacity_outputs`' paint restyle).
///
/// `style` must always be the **full merged** style, never a delta — a
/// skipped writer keeps its current components, but a writer that runs
/// trusts `style` completely (absence = remove).
pub fn apply_style_masked(
    ec: &mut EntityCommands,
    style: &Option<Style>,
    writers: WriterMask,
    ctx: &WriterCtx,
    invalidation: Invalidation,
) {
    let empty = Style::empty();
    let s = style.as_ref().unwrap_or(empty);
    // Registration order = bit order: walk the set bits low to high.
    let mut bits = writers.intersection(ctx.styles.all_writers()).0;
    while bits != 0 {
        let bit = bits.trailing_zeros() as usize;
        bits &= bits - 1;
        (ctx.styles.writer_at(bit).apply)(ctx, s, ec);
    }
    if invalidation.contains(Invalidation::PAINT) {
        crate::layer::mark_content_dirty(ec);
    }
}

/// Overlay `overlay` onto `base`, producing the style to apply: every field the
/// overlay sets wins, the rest fall through to `base`. A `None` overlay leaves
/// `base` untouched. Used to merge `hoverStyle`/`pressStyle` onto the base style
/// for the current `Interaction` state.
pub fn overlay_style(base: Option<&Style>, overlay: Option<&Style>) -> Option<Style> {
    let Some(overlay) = overlay else {
        return base.cloned();
    };
    let mut merged = base.cloned().unwrap_or_default();
    merged.overlay_variant(overlay);
    Some(merged)
}

mod gradient;
mod image;
mod text;

pub use gradient::*;
pub use image::*;
pub use text::*;

#[cfg(test)]
mod tests;
