//! Translation from reconciler props (the bevy-free [`crate::protocol`] wire
//! types) into `bevy_ui` components: the `Node` layout, its sibling visual
//! components (background/border/outline/shadow/z-index/global-z-index), and
//! `ImageNode`.

use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::sprite::{BorderRect, SliceScaleMode, TextureSlicer};
use bevy::text::{FontSize as BevyFontSize, LetterSpacing, LineHeight};
use bevy::ui::FocusPolicy;
use bevy::ui::widget::NodeImageMode;
use bevy_react_animations::build_ui_transform;

use crate::plugin::Fonts;
use crate::protocol::{
    Angle, AngularStop, AtlasSpec, BoxShadowList, BoxShadowSpec, ConicGradientSpec, FontSize,
    GradientList, GradientSpec, GradientStop, ImageMode, ImageModeSpec, Length, LetterSpacingSpec,
    LineHeightSpec, LinearGradientSpec, Props, RadialGradientSpec, RadialShapeSpec, Rect,
    SliceBorder, SliceScale, SliceSpec, Style,
};

/// Fallback for an enum-keyword mapper that didn't recognize its token: `warn!`s
/// (naming the field and value) and returns the type's default, so a typo'd
/// `display`/`align*`/… surfaces in the log instead of silently snapping to the
/// Bevy default. Mirrors the `parse_color` / `fontFamily` warn+fallback pattern.
fn unknown_keyword<T: Default>(kind: &str, s: &str) -> T {
    warn!("unrecognized {kind} {s:?}; using the default");
    T::default()
}

/// Parse a CSS color string into a `Color`: hex, named colors, `transparent`, or
/// `rgb()/hsl()/hwb()/oklab()/oklch()` functional notation (see
/// [`bevy_react_canvas::parse_css_color`]). On an unrecognized value it `warn!`s
/// and falls back to a loud magenta so the typo is visible rather than silent.
pub fn parse_color(input: &str) -> Color {
    match bevy_react_canvas::parse_css_color(input) {
        Some(c) => Color::from(c),
        None => {
            warn!("unrecognized color {input:?}; using magenta debug fallback");
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

/// Convert a wire [`FontSize`] into bevy's `FontSize` (the `TextFont` field type),
/// mapping each unit one-to-one (`Rem` resolves against bevy's `RemSize` resource).
fn font_size_to_bevy(size: FontSize) -> BevyFontSize {
    match size {
        FontSize::Px(v) => BevyFontSize::Px(v),
        FontSize::Vw(v) => BevyFontSize::Vw(v),
        FontSize::Vh(v) => BevyFontSize::Vh(v),
        FontSize::VMin(v) => BevyFontSize::VMin(v),
        FontSize::VMax(v) => BevyFontSize::VMax(v),
        FontSize::Rem(v) => BevyFontSize::Rem(v),
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

/// Map a wire color-space token to bevy's [`InterpolationColorSpace`]
/// (default `Oklaba`, matching bevy's own default).
fn parse_color_space(s: Option<&str>) -> InterpolationColorSpace {
    match s {
        Some("oklch") => InterpolationColorSpace::Oklcha,
        Some("oklchLong") => InterpolationColorSpace::OklchaLong,
        Some("srgb") => InterpolationColorSpace::Srgba,
        Some("linearRgb") => InterpolationColorSpace::LinearRgba,
        Some("hsl") => InterpolationColorSpace::Hsla,
        Some("hslLong") => InterpolationColorSpace::HslaLong,
        Some("hsv") => InterpolationColorSpace::Hsva,
        Some("hsvLong") => InterpolationColorSpace::HsvaLong,
        _ => InterpolationColorSpace::Oklaba,
    }
}

/// Map a named anchor (`"center"`, `"topLeft"`, …) to a [`UiPosition`]
/// (default center). Arbitrary `Val`-offset centers are not yet supported.
fn parse_position(s: Option<&str>) -> UiPosition {
    match s {
        Some("top") => UiPosition::TOP,
        Some("bottom") => UiPosition::BOTTOM,
        Some("left") => UiPosition::LEFT,
        Some("right") => UiPosition::RIGHT,
        Some("topLeft") => UiPosition::TOP_LEFT,
        Some("topRight") => UiPosition::TOP_RIGHT,
        Some("bottomLeft") => UiPosition::BOTTOM_LEFT,
        Some("bottomRight") => UiPosition::BOTTOM_RIGHT,
        _ => UiPosition::CENTER,
    }
}

/// Map a radial gradient's shape spec to bevy's [`RadialGradientShape`]
/// (default `ClosestCorner`).
fn parse_radial_shape(shape: Option<&RadialShapeSpec>) -> RadialGradientShape {
    match shape {
        Some(RadialShapeSpec::Circle { circle }) => {
            RadialGradientShape::Circle(length_to_val(*circle))
        }
        Some(RadialShapeSpec::Ellipse { ellipse }) => {
            RadialGradientShape::Ellipse(length_to_val(ellipse[0]), length_to_val(ellipse[1]))
        }
        Some(RadialShapeSpec::Keyword(k)) => match k.as_str() {
            "closestSide" => RadialGradientShape::ClosestSide,
            "farthestSide" => RadialGradientShape::FarthestSide,
            "farthestCorner" => RadialGradientShape::FarthestCorner,
            _ => RadialGradientShape::ClosestCorner,
        },
        None => RadialGradientShape::ClosestCorner,
    }
}

/// Build a positional [`ColorStop`] (linear/radial), folding `opacity` into the
/// color like the solid background path. An absent `position` is auto-spaced.
fn color_stop(stop: &GradientStop, opacity: Option<f32>) -> ColorStop {
    ColorStop {
        color: apply_opacity(parse_color(&stop.color), opacity),
        point: stop.position.map(length_to_val).unwrap_or(Val::Auto),
        hint: stop.hint.unwrap_or(0.5),
    }
}

/// Build an [`AngularColorStop`] (conic). The wire [`Angle`] is already radians.
fn angular_stop(stop: &AngularStop, opacity: Option<f32>) -> AngularColorStop {
    AngularColorStop {
        color: apply_opacity(parse_color(&stop.color), opacity),
        angle: stop.angle.map(Angle::radians),
        hint: stop.hint.unwrap_or(0.5),
    }
}

fn build_linear(spec: &LinearGradientSpec, opacity: Option<f32>) -> Gradient {
    LinearGradient::new(
        spec.angle.map(Angle::radians).unwrap_or(0.0),
        spec.stops.iter().map(|s| color_stop(s, opacity)).collect(),
    )
    .in_color_space(parse_color_space(spec.color_space.as_deref()))
    .into()
}

fn build_radial(spec: &RadialGradientSpec, opacity: Option<f32>) -> Gradient {
    RadialGradient::new(
        parse_position(spec.position.as_deref()),
        parse_radial_shape(spec.shape.as_ref()),
        spec.stops.iter().map(|s| color_stop(s, opacity)).collect(),
    )
    .in_color_space(parse_color_space(spec.color_space.as_deref()))
    .into()
}

fn build_conic(spec: &ConicGradientSpec, opacity: Option<f32>) -> Gradient {
    ConicGradient::new(
        parse_position(spec.position.as_deref()),
        spec.stops
            .iter()
            .map(|s| angular_stop(s, opacity))
            .collect(),
    )
    .with_start(spec.start.map(Angle::radians).unwrap_or(0.0))
    .in_color_space(parse_color_space(spec.color_space.as_deref()))
    .into()
}

fn build_gradient(spec: &GradientSpec, opacity: Option<f32>) -> Gradient {
    match spec {
        GradientSpec::Linear(l) => build_linear(l, opacity),
        GradientSpec::Radial(r) => build_radial(r, opacity),
        GradientSpec::Conic(c) => build_conic(c, opacity),
    }
}

/// Flatten a [`GradientList`] (one or many) into the `Vec<Gradient>` that
/// `BackgroundGradient`/`BorderGradient` wrap. `opacity` fades every stop.
pub fn build_gradients(list: &GradientList, opacity: Option<f32>) -> Vec<Gradient> {
    match list {
        GradientList::One(g) => vec![build_gradient(g, opacity)],
        GradientList::Many(gs) => gs.iter().map(|g| build_gradient(g, opacity)).collect(),
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

fn display(s: &str) -> Display {
    match s {
        "flex" => Display::Flex,
        "grid" => Display::Grid,
        "block" => Display::Block,
        "none" => Display::None,
        _ => unknown_keyword("display", s),
    }
}

fn box_sizing(s: &str) -> BoxSizing {
    match s {
        "borderBox" | "border-box" => BoxSizing::BorderBox,
        "contentBox" | "content-box" => BoxSizing::ContentBox,
        _ => unknown_keyword("boxSizing", s),
    }
}

fn position_type(s: &str) -> PositionType {
    match s {
        "absolute" => PositionType::Absolute,
        "relative" => PositionType::Relative,
        _ => unknown_keyword("positionType", s),
    }
}

fn overflow_axis(s: &str) -> OverflowAxis {
    match s {
        "visible" => OverflowAxis::Visible,
        "clip" => OverflowAxis::Clip,
        "hidden" => OverflowAxis::Hidden,
        "scroll" => OverflowAxis::Scroll,
        _ => unknown_keyword("overflow", s),
    }
}

fn align_items(s: &str) -> AlignItems {
    match s {
        "start" => AlignItems::Start,
        "end" => AlignItems::End,
        "flexStart" => AlignItems::FlexStart,
        "flexEnd" => AlignItems::FlexEnd,
        "center" => AlignItems::Center,
        "baseline" => AlignItems::Baseline,
        "stretch" => AlignItems::Stretch,
        _ => unknown_keyword("alignItems", s),
    }
}

fn align_self(s: &str) -> AlignSelf {
    match s {
        "auto" => AlignSelf::Auto,
        "start" => AlignSelf::Start,
        "end" => AlignSelf::End,
        "flexStart" => AlignSelf::FlexStart,
        "flexEnd" => AlignSelf::FlexEnd,
        "center" => AlignSelf::Center,
        "baseline" => AlignSelf::Baseline,
        "stretch" => AlignSelf::Stretch,
        _ => unknown_keyword("alignSelf", s),
    }
}

fn align_content(s: &str) -> AlignContent {
    match s {
        "start" => AlignContent::Start,
        "end" => AlignContent::End,
        "flexStart" => AlignContent::FlexStart,
        "flexEnd" => AlignContent::FlexEnd,
        "center" => AlignContent::Center,
        "stretch" => AlignContent::Stretch,
        "spaceBetween" => AlignContent::SpaceBetween,
        "spaceEvenly" => AlignContent::SpaceEvenly,
        "spaceAround" => AlignContent::SpaceAround,
        _ => unknown_keyword("alignContent", s),
    }
}

fn justify_items(s: &str) -> JustifyItems {
    match s {
        "start" => JustifyItems::Start,
        "end" => JustifyItems::End,
        "center" => JustifyItems::Center,
        "baseline" => JustifyItems::Baseline,
        "stretch" => JustifyItems::Stretch,
        _ => unknown_keyword("justifyItems", s),
    }
}

fn justify_self(s: &str) -> JustifySelf {
    match s {
        "auto" => JustifySelf::Auto,
        "start" => JustifySelf::Start,
        "end" => JustifySelf::End,
        "center" => JustifySelf::Center,
        "baseline" => JustifySelf::Baseline,
        "stretch" => JustifySelf::Stretch,
        _ => unknown_keyword("justifySelf", s),
    }
}

fn justify_content(s: &str) -> JustifyContent {
    match s {
        "start" => JustifyContent::Start,
        "end" => JustifyContent::End,
        "flexStart" => JustifyContent::FlexStart,
        "flexEnd" => JustifyContent::FlexEnd,
        "center" => JustifyContent::Center,
        "stretch" => JustifyContent::Stretch,
        "spaceBetween" => JustifyContent::SpaceBetween,
        "spaceEvenly" => JustifyContent::SpaceEvenly,
        "spaceAround" => JustifyContent::SpaceAround,
        _ => unknown_keyword("justifyContent", s),
    }
}

fn flex_direction(s: &str) -> FlexDirection {
    match s {
        "row" => FlexDirection::Row,
        "column" => FlexDirection::Column,
        "rowReverse" => FlexDirection::RowReverse,
        "columnReverse" => FlexDirection::ColumnReverse,
        _ => unknown_keyword("flexDirection", s),
    }
}

fn flex_wrap(s: &str) -> FlexWrap {
    match s {
        "nowrap" | "noWrap" => FlexWrap::NoWrap,
        "wrap" => FlexWrap::Wrap,
        "wrapReverse" => FlexWrap::WrapReverse,
        _ => unknown_keyword("flexWrap", s),
    }
}

fn grid_auto_flow(s: &str) -> GridAutoFlow {
    match s {
        "row" => GridAutoFlow::Row,
        "column" => GridAutoFlow::Column,
        "rowDense" => GridAutoFlow::RowDense,
        "columnDense" => GridAutoFlow::ColumnDense,
        _ => unknown_keyword("gridAutoFlow", s),
    }
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
                warn!("ignoring unparsable grid track {tok:?}");
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
                warn!("ignoring unparsable grid track {t:?}");
            }
            parsed
        })
        .collect()
}

/// Parse a grid line placement (`"1 / 3"`, `"span 2"`, `"2"`, `"auto"`).
fn parse_grid_placement(s: &str) -> GridPlacement {
    let span_of = |t: &str| {
        t.trim()
            .strip_prefix("span")
            .and_then(|n| n.trim().parse::<u16>().ok())
    };
    if let Some((a, b)) = s.split_once('/') {
        let (a, b) = (a.trim(), b.trim());
        let start: Option<i16> = a.parse().ok();
        if let Some(span) = span_of(b) {
            return match start {
                Some(start) => GridPlacement::start_span(start, span),
                None => GridPlacement::span(span),
            };
        }
        if let (Some(start), Some(end)) = (start, b.parse::<i16>().ok()) {
            return GridPlacement::start_end(start, end);
        }
        if let Some(start) = start {
            return GridPlacement::start(start);
        }
        return GridPlacement::auto();
    }
    let s = s.trim();
    if s == "auto" {
        GridPlacement::auto()
    } else if let Some(span) = span_of(s) {
        GridPlacement::span(span)
    } else if let Ok(line) = s.parse::<i16>() {
        GridPlacement::start(line)
    } else {
        GridPlacement::auto()
    }
}

/// Build a `bevy_ui::Node` from the style subset. Unset fields keep Bevy's
/// defaults.
pub fn node_from_style(style: &Option<Style>) -> Node {
    let mut node = Node::default();
    let Some(s) = style.as_ref() else {
        return node;
    };

    if let Some(v) = &s.display {
        node.display = display(v);
    }
    if let Some(v) = &s.box_sizing {
        node.box_sizing = box_sizing(v);
    }
    if let Some(v) = &s.position_type {
        node.position_type = position_type(v);
    }
    if let Some(v) = &s.overflow_x {
        node.overflow.x = overflow_axis(v);
    }
    if let Some(v) = &s.overflow_y {
        node.overflow.y = overflow_axis(v);
    }
    if let Some(v) = s.scrollbar_width {
        node.scrollbar_width = v;
    }

    if let Some(v) = s.left {
        node.left = length_to_val(v);
    }
    if let Some(v) = s.right {
        node.right = length_to_val(v);
    }
    if let Some(v) = s.top {
        node.top = length_to_val(v);
    }
    if let Some(v) = s.bottom {
        node.bottom = length_to_val(v);
    }

    if let Some(v) = s.width {
        node.width = length_to_val(v);
    }
    if let Some(v) = s.height {
        node.height = length_to_val(v);
    }
    if let Some(v) = s.min_width {
        node.min_width = length_to_val(v);
    }
    if let Some(v) = s.min_height {
        node.min_height = length_to_val(v);
    }
    if let Some(v) = s.max_width {
        node.max_width = length_to_val(v);
    }
    if let Some(v) = s.max_height {
        node.max_height = length_to_val(v);
    }
    if let Some(v) = s.aspect_ratio {
        node.aspect_ratio = Some(v);
    }

    if let Some(v) = &s.align_items {
        node.align_items = align_items(v);
    }
    if let Some(v) = &s.justify_items {
        node.justify_items = justify_items(v);
    }
    if let Some(v) = &s.align_self {
        node.align_self = align_self(v);
    }
    if let Some(v) = &s.justify_self {
        node.justify_self = justify_self(v);
    }
    if let Some(v) = &s.align_content {
        node.align_content = align_content(v);
    }
    if let Some(v) = &s.justify_content {
        node.justify_content = justify_content(v);
    }

    if let Some(r) = s.margin {
        node.margin = rect_to_uirect(r);
    }
    if let Some(r) = s.padding {
        node.padding = rect_to_uirect(r);
    }
    if let Some(r) = s.border {
        node.border = rect_to_uirect(r);
    }

    if let Some(v) = &s.flex_direction {
        node.flex_direction = flex_direction(v);
    }
    if let Some(v) = &s.flex_wrap {
        node.flex_wrap = flex_wrap(v);
    }
    if let Some(v) = s.flex_grow {
        node.flex_grow = v;
    }
    if let Some(v) = s.flex_shrink {
        node.flex_shrink = v;
    }
    if let Some(v) = s.flex_basis {
        node.flex_basis = length_to_val(v);
    }
    if let Some(v) = s.gap {
        node.row_gap = length_to_val(v);
        node.column_gap = length_to_val(v);
    }
    if let Some(v) = s.row_gap {
        node.row_gap = length_to_val(v);
    }
    if let Some(v) = s.column_gap {
        node.column_gap = length_to_val(v);
    }

    if let Some(v) = &s.grid_auto_flow {
        node.grid_auto_flow = grid_auto_flow(v);
    }
    if let Some(v) = &s.grid_template_rows {
        node.grid_template_rows = parse_template(v);
    }
    if let Some(v) = &s.grid_template_columns {
        node.grid_template_columns = parse_template(v);
    }
    if let Some(v) = &s.grid_auto_rows {
        node.grid_auto_rows = parse_auto_tracks(v);
    }
    if let Some(v) = &s.grid_auto_columns {
        node.grid_auto_columns = parse_auto_tracks(v);
    }
    if let Some(v) = &s.grid_row {
        node.grid_row = parse_grid_placement(v);
    }
    if let Some(v) = &s.grid_column {
        node.grid_column = parse_grid_placement(v);
    }

    if let Some(r) = s.border_radius {
        node.border_radius = rect_to_border_radius(r);
    }

    node
}

/// Apply a style to an element: insert its `Node` plus the sibling visual
/// components present in the style (and remove ones that are absent, so toggling
/// a style key off clears the component).
//
// TODO(review): every `Op::Update` re-inserts a freshly-built `Node` wholesale, marking
// it changed and forcing a layout pass for the subtree — even when only a paint-only prop
// (e.g. backgroundColor) changed. Combined with the lack of prop diffing in the reconciler
// (see renderer.prepareUpdate), frequent re-renders thrash layout. Split layout-affecting
// from paint-only props and skip the `Node` re-insert when no layout field changed.
pub fn apply_style(ec: &mut EntityCommands, style: &Option<Style>) {
    ec.insert(node_from_style(style));
    let s = style.as_ref();

    // `opacity` multiplies into the background (and text) alpha — color before
    // opacity, mirroring the animated path.
    let opacity = s.and_then(|s| s.opacity);
    match s.and_then(|s| s.background_color.as_deref()) {
        Some(hex) => {
            ec.insert(BackgroundColor(apply_opacity(parse_color(hex), opacity)));
        }
        None => {
            ec.remove::<BackgroundColor>();
        }
    }

    // A static `transform` writes `UiTransform`. When absent we *leave it
    // untouched* (never remove) so the `#[require(UiTransform)]` invariant on
    // `AnimatedNode`/transition entities is never violated, and an in-flight
    // animation/transition isn't reset by a coincident re-render.
    if let Some(t) = s.and_then(|s| s.transform) {
        ec.insert(build_ui_transform(
            t.translate_x.map(length_to_val),
            t.translate_y.map(length_to_val),
            t.scale,
            t.scale_x,
            t.scale_y,
            t.rotate.map(Angle::radians),
        ));
    }
    match s.and_then(|s| s.border_color.as_ref()) {
        Some(spec) => {
            let side = |c: &Option<String>| c.as_deref().map(parse_color).unwrap_or(Color::NONE);
            ec.insert(BorderColor {
                top: side(&spec.top),
                right: side(&spec.right),
                bottom: side(&spec.bottom),
                left: side(&spec.left),
            });
        }
        None => {
            ec.remove::<BorderColor>();
        }
    }
    match s.and_then(|s| s.outline.as_ref()) {
        Some(o) => {
            ec.insert(Outline {
                width: o.width.map(length_to_val).unwrap_or(Val::Px(1.0)),
                offset: o.offset.map(length_to_val).unwrap_or(Val::Px(0.0)),
                color: o.color.as_deref().map(parse_color).unwrap_or(Color::WHITE),
            });
        }
        None => {
            ec.remove::<Outline>();
        }
    }
    match s.and_then(|s| s.box_shadow.as_ref()) {
        Some(b) => {
            ec.insert(BoxShadow(build_box_shadows(b)));
        }
        None => {
            ec.remove::<BoxShadow>();
        }
    }
    match s.and_then(|s| s.background_gradient.as_ref()) {
        Some(g) => {
            ec.insert(BackgroundGradient(build_gradients(g, opacity)));
        }
        None => {
            ec.remove::<BackgroundGradient>();
        }
    }
    match s.and_then(|s| s.border_gradient.as_ref()) {
        Some(g) => {
            ec.insert(BorderGradient(build_gradients(g, opacity)));
        }
        None => {
            ec.remove::<BorderGradient>();
        }
    }
    // A `<text>` root's drop shadow (block-level). No-op on non-text nodes (no
    // `Text` to shadow); removed when the style drops it on a re-render/hover-out.
    match text_shadow(s) {
        Some(shadow) => {
            ec.insert(shadow);
        }
        None => {
            ec.remove::<TextShadow>();
        }
    }
    match s.and_then(|s| s.z_index) {
        Some(z) => {
            ec.insert(ZIndex(z));
        }
        None => {
            ec.remove::<ZIndex>();
        }
    }
    match s.and_then(|s| s.global_z_index) {
        Some(z) => {
            ec.insert(GlobalZIndex(z));
        }
        None => {
            ec.remove::<GlobalZIndex>();
        }
    }
    // `focusPolicy` controls pointer pass-through. The node's default is `Pass`
    // (bevy_ui `Node` requires `FocusPolicy`, whose `Default` is `Pass`), so absent
    // / "pass" stay click-through and only "block" makes the node capture pointer
    // interaction (so nodes behind it don't receive it). We always *insert* — never
    // remove — because removing the component makes `ui_focus_system` fall back to
    // `.unwrap_or(&FocusPolicy::Block)` and silently block every node (e.g. a `<text>`
    // child would then block its parent); inserting also makes toggling "block" back
    // off reliably revert to `Pass`.
    let focus_policy = match s.and_then(|s| s.focus_policy.as_deref()) {
        Some("block") => FocusPolicy::Block,
        _ => FocusPolicy::Pass, // "pass", unknown, or absent
    };
    ec.insert(focus_policy);

    // Stamp the transition engine's input from this (possibly hover/press-merged)
    // style. `drive_transitions` eases the snap values written above to their new
    // targets; see [`crate::transition`].
    crate::transition::apply_transition(ec, style);
}

/// Overlay `overlay` onto `base`, producing the style to apply: every field the
/// overlay sets wins, the rest fall through to `base`. A `None` overlay leaves
/// `base` untouched. Used to merge `hoverStyle`/`pressStyle` onto the base style
/// for the current `Interaction` state.
pub fn overlay_style(base: &Option<Style>, overlay: &Option<Style>) -> Option<Style> {
    let Some(overlay) = overlay else {
        return base.clone();
    };
    let mut merged = base.clone().unwrap_or_default();
    // One arm per `Style` field; kept in struct order so it's easy to audit that
    // every field is overlaid.
    // TODO(review): this hand-maintained field list must mirror `Style` exactly — omit a
    // field when adding it to `Style` and it's SILENTLY dropped from hover/press merging,
    // with no compile error. Add a field-coverage test (or derive the overlay) to enforce it.
    macro_rules! overlay_field {
        ($($f:ident),* $(,)?) => {
            $( if overlay.$f.is_some() { merged.$f = overlay.$f.clone(); } )*
        };
    }
    overlay_field!(
        display,
        box_sizing,
        position_type,
        overflow_x,
        overflow_y,
        scrollbar_width,
        left,
        right,
        top,
        bottom,
        width,
        height,
        min_width,
        min_height,
        max_width,
        max_height,
        aspect_ratio,
        align_items,
        justify_items,
        align_self,
        justify_self,
        align_content,
        justify_content,
        margin,
        padding,
        border,
        flex_direction,
        flex_wrap,
        flex_grow,
        flex_shrink,
        flex_basis,
        gap,
        row_gap,
        column_gap,
        grid_auto_flow,
        grid_template_rows,
        grid_template_columns,
        grid_auto_rows,
        grid_auto_columns,
        grid_row,
        grid_column,
        background_color,
        border_color,
        border_radius,
        outline,
        box_shadow,
        background_gradient,
        border_gradient,
        z_index,
        global_z_index,
        transform,
        opacity,
        transition,
        color,
        font_size,
        font_weight,
        font_family,
        text_align,
        line_height,
        letter_spacing,
        text_shadow,
        line_break,
    );
    Some(merged)
}

/// Build an `ImageNode` from an `image` element's props. `src` loads a texture
/// via the asset server; without it, a solid-color (tinted) image is used.
pub fn image_node(props: &Props, assets: &AssetServer) -> ImageNode {
    let mut image = match &props.src {
        Some(path) => ImageNode::new(assets.load(path)),
        None => ImageNode::solid_color(
            props
                .tint
                .as_deref()
                .map(parse_color)
                .unwrap_or(Color::WHITE),
        ),
    };
    if let Some(tint) = &props.tint {
        image.color = parse_color(tint);
    }
    // `opacity` multiplies into the image's tint alpha (the tint is multiplied with
    // the texture), so it fades a `src` image too — mirroring how it fades a
    // background/text color.
    image.color = apply_opacity(image.color, props.style.as_ref().and_then(|s| s.opacity));
    image.flip_x = props.flip_x;
    image.flip_y = props.flip_y;
    if let Some(mode) = &props.image_mode {
        image.image_mode = match mode {
            ImageMode::Keyword(s) if s == "stretch" => NodeImageMode::Stretch,
            ImageMode::Keyword(_) => NodeImageMode::Auto,
            ImageMode::Spec(ImageModeSpec::Sliced(s)) => NodeImageMode::Sliced(slicer(s)),
            ImageMode::Spec(ImageModeSpec::Tiled(t)) => NodeImageMode::Tiled {
                tile_x: t.tile_x,
                tile_y: t.tile_y,
                stretch_value: t.stretch_value.unwrap_or(1.0),
            },
        };
    }
    // `Rect` here is the wire top/right/bottom/left type (imported above), so the
    // source sub-rect uses bevy's math `Rect` by its full path.
    if let Some(r) = &props.source_rect {
        image.rect = Some(bevy::math::Rect::new(
            r.x,
            r.y,
            r.x + r.width,
            r.y + r.height,
        ));
    }
    if let Some(vb) = &props.visual_box {
        image.visual_box = match vb.as_str() {
            "content" => VisualBox::ContentBox,
            "border" => VisualBox::BorderBox,
            _ => VisualBox::PaddingBox,
        };
    }
    image
}

/// Caches one `TextureAtlasLayout` asset per unique grid (keyed on the grid, *not*
/// the cell `index`). `image_node` is re-inserted on every `Op::Update`, so without
/// this an index-only change (sprite animation) would add a fresh layout asset each
/// frame — an unbounded leak. Constant grid → one cache hit, one shared handle.
#[derive(Resource, Default)]
pub struct AtlasLayoutCache(HashMap<AtlasKey, Handle<TextureAtlasLayout>>);

/// The grid identity of an [`AtlasSpec`] — everything `TextureAtlasLayout::from_grid`
/// consumes, excluding the per-cell `index`.
#[derive(PartialEq, Eq, Hash)]
struct AtlasKey {
    tile_width: u32,
    tile_height: u32,
    columns: u32,
    rows: u32,
    padding: Option<[u32; 2]>,
    offset: Option<[u32; 2]>,
}

impl AtlasKey {
    fn of(a: &AtlasSpec) -> Self {
        AtlasKey {
            tile_width: a.tile_width,
            tile_height: a.tile_height,
            columns: a.columns,
            rows: a.rows,
            padding: a.padding,
            offset: a.offset,
        }
    }
}

/// Set `image.texture_atlas` from `props.atlas` (a no-op if absent), building and
/// caching the grid's `TextureAtlasLayout` so repeated commits reuse one asset.
/// Kept out of [`image_node`] because it needs the `Assets`/cache resources, which
/// only the reconcile systems hold.
pub fn apply_atlas(
    image: &mut ImageNode,
    props: &Props,
    layouts: &mut Assets<TextureAtlasLayout>,
    cache: &mut AtlasLayoutCache,
) {
    let Some(a) = &props.atlas else { return };
    let handle = cache
        .0
        .entry(AtlasKey::of(a))
        .or_insert_with(|| {
            layouts.add(TextureAtlasLayout::from_grid(
                UVec2::new(a.tile_width, a.tile_height),
                a.columns,
                a.rows,
                a.padding.map(|[x, y]| UVec2::new(x, y)),
                a.offset.map(|[x, y]| UVec2::new(x, y)),
            ))
        })
        .clone();
    image.texture_atlas = Some(TextureAtlas {
        layout: handle,
        index: a.index,
    });
}

/// Build a `bevy_sprite::TextureSlicer` (9-slice config) from the wire [`SliceSpec`].
fn slicer(spec: &SliceSpec) -> TextureSlicer {
    let border = match spec.border {
        SliceBorder::Zero => BorderRect::ZERO,
        SliceBorder::Uniform(n) => BorderRect::all(n),
        SliceBorder::Sides {
            top,
            right,
            bottom,
            left,
        } => BorderRect {
            min_inset: Vec2::new(left, top),
            max_inset: Vec2::new(right, bottom),
        },
    };
    TextureSlicer {
        border,
        center_scale_mode: slice_scale(&spec.center_scale_mode),
        sides_scale_mode: slice_scale(&spec.sides_scale_mode),
        max_corner_scale: spec.max_corner_scale.unwrap_or(1.0),
    }
}

/// Map a wire [`SliceScale`] (`None`/`"stretch"` → stretch, `{ tile }` → tile) onto
/// `bevy_sprite::SliceScaleMode`.
fn slice_scale(mode: &Option<SliceScale>) -> SliceScaleMode {
    match mode {
        Some(SliceScale::Tile { tile }) => SliceScaleMode::Tile {
            stretch_value: *tile,
        },
        _ => SliceScaleMode::Stretch,
    }
}

fn font_weight(s: &str) -> FontWeight {
    match s {
        "thin" => FontWeight::THIN,
        "light" => FontWeight(300),
        "normal" => FontWeight::NORMAL,
        "medium" => FontWeight(500),
        "semibold" => FontWeight(600),
        "bold" => FontWeight::BOLD,
        "black" => FontWeight::BLACK,
        other => other.parse::<u16>().map(FontWeight).unwrap_or_else(|_| {
            warn!("unrecognized fontWeight {other:?}; using the default");
            FontWeight::NORMAL
        }),
    }
}

fn justify(s: &str) -> Justify {
    match s {
        "left" => Justify::Left,
        "center" => Justify::Center,
        "right" => Justify::Right,
        "justify" => Justify::Justified,
        "start" => Justify::Start,
        "end" => Justify::End,
        _ => unknown_keyword("textAlign", s),
    }
}

/// Map a wire line-break token to bevy's [`LineBreak`] (default `WordBoundary`,
/// matching bevy's own default).
fn linebreak(s: &str) -> LineBreak {
    match s {
        "wordBoundary" => LineBreak::WordBoundary,
        "anyCharacter" => LineBreak::AnyCharacter,
        "wordOrCharacter" => LineBreak::WordOrCharacter,
        "noWrap" => LineBreak::NoWrap,
        _ => {
            warn!("unrecognized lineBreak {s:?}; using the default");
            LineBreak::WordBoundary
        }
    }
}

/// Map a [`LineHeightSpec`] to bevy's [`LineHeight`]: a bare number is a multiple
/// of the font size, `{ px }` is an absolute pixel height, and a string carries a
/// unit (`"20px"` absolute, else a multiple).
fn line_height(spec: &LineHeightSpec) -> LineHeight {
    match spec {
        LineHeightSpec::Relative(scale) => LineHeight::RelativeToFont(*scale),
        LineHeightSpec::Px { px } => LineHeight::Px(*px),
        LineHeightSpec::Str(s) => {
            let s = s.trim();
            if let Some(n) = s.strip_suffix("px") {
                if let Ok(v) = n.trim().parse() {
                    return LineHeight::Px(v);
                }
            } else {
                // unitless or `em`/`rem` → a multiple of the font size.
                let num = s
                    .strip_suffix("rem")
                    .or_else(|| s.strip_suffix("em"))
                    .unwrap_or(s);
                if let Ok(v) = num.trim().parse() {
                    return LineHeight::RelativeToFont(v);
                }
            }
            warn!("invalid lineHeight {s:?}; using the default");
            LineHeight::default()
        }
    }
}

/// Map a [`LetterSpacingSpec`] to bevy's [`LetterSpacing`]: a bare number is
/// logical pixels, `{ rem }` is a multiple of the font size, and a string carries a
/// unit (`"2px"`, `"0.1rem"`, or `"normal"`).
fn letter_spacing(spec: &LetterSpacingSpec) -> LetterSpacing {
    match spec {
        LetterSpacingSpec::Px(px) => LetterSpacing::Px(*px),
        LetterSpacingSpec::Rem { rem } => LetterSpacing::Rem(*rem),
        LetterSpacingSpec::Str(s) => {
            let s = s.trim();
            if s.eq_ignore_ascii_case("normal") {
                return LetterSpacing::default();
            }
            if let Some(n) = s.strip_suffix("px") {
                if let Ok(v) = n.trim().parse() {
                    return LetterSpacing::Px(v);
                }
            } else if let Some(n) = s.strip_suffix("rem").or_else(|| s.strip_suffix("em")) {
                if let Ok(v) = n.trim().parse() {
                    return LetterSpacing::Rem(v);
                }
            } else if let Ok(v) = s.parse() {
                return LetterSpacing::Px(v); // bare numeric string → logical pixels
            }
            warn!("invalid letterSpacing {s:?}; using the default");
            LetterSpacing::default()
        }
    }
}

/// Build a [`TextShadow`] from a style's `textShadow`, folding `opacity` into the
/// color. Unset offset/color fields fall back to bevy's [`TextShadow::default`].
fn text_shadow(style: Option<&Style>) -> Option<TextShadow> {
    let s = style?;
    let spec = s.text_shadow.as_ref()?;
    let mut shadow = TextShadow::default();
    if let Some(x) = spec.offset_x {
        shadow.offset.x = x;
    }
    if let Some(y) = spec.offset_y {
        shadow.offset.y = y;
    }
    if let Some(c) = &spec.color {
        shadow.color = parse_color(c);
    }
    shadow.color = apply_opacity(shadow.color, s.opacity);
    Some(shadow)
}

/// Resolve a style's text appearance into the `TextColor` + `TextFont` +
/// `LineHeight` + `LetterSpacing` a text run carries. Unset fields fall back to
/// white / Bevy's defaults. Returned as concrete components so they can be copied
/// onto inheriting child spans.
pub fn resolved_text_style(
    style: &Option<Style>,
    fonts: &Fonts,
) -> (TextColor, TextFont, LineHeight, LetterSpacing) {
    let mut color = TextColor(Color::WHITE);
    let mut font = TextFont::default();
    let mut line = LineHeight::default();
    let mut spacing = LetterSpacing::default();
    // Default font face; a `fontFamily` below overrides it. Unset on both → leave
    // `TextFont::default()`'s empty handle (Bevy's built-in font).
    if let Some(h) = &fonts.default {
        font.font = FontSource::Handle(h.clone());
    }
    if let Some(s) = style.as_ref() {
        if let Some(c) = &s.color {
            color = TextColor(parse_color(c));
        }
        if s.opacity.is_some() {
            color = TextColor(apply_opacity(color.0, s.opacity));
        }
        if let Some(size) = s.font_size {
            font.font_size = font_size_to_bevy(size);
        }
        if let Some(w) = &s.font_weight {
            font.weight = font_weight(w);
        }
        if let Some(family) = &s.font_family {
            match fonts.named.get(family) {
                Some(h) => font.font = FontSource::Handle(h.clone()),
                None => warn!("unknown fontFamily {family:?}; using the default font"),
            }
        }
        if let Some(lh) = &s.line_height {
            line = line_height(lh);
        }
        if let Some(ls) = &s.letter_spacing {
            spacing = letter_spacing(ls);
        }
    }
    (color, font, line, spacing)
}

/// Insert the resolved text components for a `<text>` element or span.
pub fn apply_text_style(ec: &mut EntityCommands, style: &Option<Style>, fonts: &Fonts) {
    ec.insert(resolved_text_style(style, fonts));
}

/// The `TextLayout` for a `<text>` root, if `textAlign` or `lineBreak` is set
/// (root only). Either field present builds the layout; the other keeps its
/// bevy default.
pub fn text_layout(style: &Option<Style>) -> Option<TextLayout> {
    let s = style.as_ref()?;
    if s.text_align.is_none() && s.line_break.is_none() {
        return None;
    }
    Some(TextLayout {
        justify: s.text_align.as_deref().map(justify).unwrap_or_default(),
        linebreak: s.line_break.as_deref().map(linebreak).unwrap_or_default(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::{Props, Style};

    /// `opacity` fades an `<image>` by multiplying into its tint alpha (so a `src`
    /// image dims too, not just colored boxes/text).
    #[test]
    fn image_opacity_fades_tint_alpha() {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        let assets = app.world().resource::<AssetServer>();

        let props: Props = serde_json::from_value(serde_json::json!({
            "tint": "#ff0000",
            "style": { "opacity": 0.5 },
        }))
        .unwrap();
        let image = image_node(&props, assets);
        let c = image.color.to_srgba();
        assert!(
            (c.alpha - 0.5).abs() < 1e-6,
            "alpha should be 0.5, got {}",
            c.alpha
        );
        assert!((c.red - 1.0).abs() < 1e-6, "tint hue preserved");
    }

    /// `start`/`end` map to the physical `Start`/`End` variants while
    /// `flexStart`/`flexEnd` map to the flow-relative `FlexStart`/`FlexEnd`.
    /// They diverge in grid and reversed-flex containers, so the keywords must
    /// not collapse together.
    #[test]
    fn align_keywords_distinguish_physical_from_flex() {
        assert_eq!(align_items("start"), AlignItems::Start);
        assert_eq!(align_items("end"), AlignItems::End);
        assert_eq!(align_items("flexStart"), AlignItems::FlexStart);
        assert_eq!(align_items("flexEnd"), AlignItems::FlexEnd);

        assert_eq!(align_self("start"), AlignSelf::Start);
        assert_eq!(align_self("flexStart"), AlignSelf::FlexStart);

        assert_eq!(align_content("start"), AlignContent::Start);
        assert_eq!(align_content("flexStart"), AlignContent::FlexStart);

        assert_eq!(justify_content("start"), JustifyContent::Start);
        assert_eq!(justify_content("flexStart"), JustifyContent::FlexStart);
    }

    /// `focusPolicy` maps to `bevy::ui::FocusPolicy`: `"block"` → `Block`,
    /// `"pass"` → `Pass`, and dropping the key falls back to the node's default
    /// `Pass` (never removes the component — removal would make `ui_focus_system`
    /// silently block the node).
    #[test]
    fn focus_policy_maps_with_pass_default() {
        use bevy::ecs::world::CommandQueue;

        let apply = |world: &mut World, entity: Entity, json: serde_json::Value| {
            let style: Style = serde_json::from_value(json).unwrap();
            let mut queue = CommandQueue::default();
            let mut commands = Commands::new(&mut queue, world);
            apply_style(&mut commands.entity(entity), &Some(style));
            queue.apply(world);
        };

        let mut world = World::new();
        let entity = world.spawn_empty().id();

        apply(
            &mut world,
            entity,
            serde_json::json!({ "focusPolicy": "block" }),
        );
        assert_eq!(world.get::<FocusPolicy>(entity), Some(&FocusPolicy::Block));

        apply(
            &mut world,
            entity,
            serde_json::json!({ "focusPolicy": "pass" }),
        );
        assert_eq!(world.get::<FocusPolicy>(entity), Some(&FocusPolicy::Pass));

        // Dropping the key reverts to the default `Pass` (not removed → not Block).
        apply(&mut world, entity, serde_json::json!({}));
        assert_eq!(world.get::<FocusPolicy>(entity), Some(&FocusPolicy::Pass));
    }

    /// A `{ type: "sliced", … }` `imageMode` maps to `NodeImageMode::Sliced` with
    /// the per-side border insets and tile scale modes carried through.
    fn assets_app() -> App {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app
    }

    #[test]
    fn image_mode_sliced_maps_to_texture_slicer() {
        let app = assets_app();
        let assets = app.world().resource::<AssetServer>();

        let props: Props = serde_json::from_value(serde_json::json!({
            "src": "modal.png",
            "imageMode": {
                "type": "sliced",
                "border": { "top": 10.0, "right": 20.0, "bottom": 30.0, "left": 40.0 },
                "sidesScaleMode": { "tile": 0.5 },
                "maxCornerScale": 2.0,
            },
        }))
        .unwrap();
        let image = image_node(&props, assets);
        match image.image_mode {
            NodeImageMode::Sliced(s) => {
                assert_eq!(s.border.min_inset, Vec2::new(40.0, 10.0));
                assert_eq!(s.border.max_inset, Vec2::new(20.0, 30.0));
                assert_eq!(s.max_corner_scale, 2.0);
                assert_eq!(s.center_scale_mode, SliceScaleMode::Stretch);
                assert_eq!(
                    s.sides_scale_mode,
                    SliceScaleMode::Tile { stretch_value: 0.5 }
                );
            }
            other => panic!("expected Sliced, got {other:?}"),
        }
    }

    /// A uniform-number border and a `"tiled"` mode both decode and map.
    #[test]
    fn image_mode_tiled_and_uniform_border() {
        let app = assets_app();
        let assets = app.world().resource::<AssetServer>();

        let sliced: Props = serde_json::from_value(serde_json::json!({
            "src": "modal.png",
            "imageMode": { "type": "sliced", "border": 16.0 },
        }))
        .unwrap();
        match image_node(&sliced, assets).image_mode {
            NodeImageMode::Sliced(s) => assert_eq!(s.border, BorderRect::all(16.0)),
            other => panic!("expected Sliced, got {other:?}"),
        }

        let tiled: Props = serde_json::from_value(serde_json::json!({
            "src": "modal.png",
            "imageMode": { "type": "tiled", "tileX": true, "stretchValue": 2.0 },
        }))
        .unwrap();
        match image_node(&tiled, assets).image_mode {
            NodeImageMode::Tiled {
                tile_x,
                tile_y,
                stretch_value,
            } => {
                assert!(tile_x);
                assert!(!tile_y);
                assert_eq!(stretch_value, 2.0);
            }
            other => panic!("expected Tiled, got {other:?}"),
        }
    }

    /// The bare-string `imageMode` keywords still decode (backward compatible).
    #[test]
    fn image_mode_keyword_backward_compatible() {
        let app = assets_app();
        let assets = app.world().resource::<AssetServer>();

        let stretch: Props =
            serde_json::from_value(serde_json::json!({ "imageMode": "stretch" })).unwrap();
        assert!(matches!(
            image_node(&stretch, assets).image_mode,
            NodeImageMode::Stretch
        ));

        let auto: Props =
            serde_json::from_value(serde_json::json!({ "imageMode": "auto" })).unwrap();
        assert!(matches!(
            image_node(&auto, assets).image_mode,
            NodeImageMode::Auto
        ));
    }

    /// `sourceRect` becomes a min/max `Rect` (x,y → top-left; +width/height →
    /// bottom-right), and `visualBox` selects the box variant.
    #[test]
    fn source_rect_and_visual_box_map() {
        let app = assets_app();
        let assets = app.world().resource::<AssetServer>();

        let props: Props = serde_json::from_value(serde_json::json!({
            "src": "logo.png",
            "sourceRect": { "x": 10.0, "y": 20.0, "width": 30.0, "height": 40.0 },
            "visualBox": "border",
        }))
        .unwrap();
        let image = image_node(&props, assets);
        assert_eq!(
            image.rect,
            Some(bevy::math::Rect::new(10.0, 20.0, 40.0, 60.0))
        );
        assert_eq!(image.visual_box, VisualBox::BorderBox);
    }

    /// Two cells of the *same* grid (only `index` differs) share one cached
    /// `TextureAtlasLayout` handle — the leak-guard that makes index-only sprite
    /// animation safe across the per-`Op::Update` rebuilds.
    #[test]
    fn atlas_layout_cache_reuses_handle_across_index() {
        let app = assets_app();
        let assets = app.world().resource::<AssetServer>();
        let mut layouts = Assets::<TextureAtlasLayout>::default();
        let mut cache = AtlasLayoutCache::default();

        let frame = |index: usize| -> Props {
            serde_json::from_value(serde_json::json!({
                "src": "sheet.png",
                "atlas": {
                    "tileWidth": 32, "tileHeight": 32,
                    "columns": 4, "rows": 4, "index": index,
                },
            }))
            .unwrap()
        };

        let p0 = frame(0);
        let mut a = image_node(&p0, assets);
        apply_atlas(&mut a, &p0, &mut layouts, &mut cache);
        let p2 = frame(2);
        let mut b = image_node(&p2, assets);
        apply_atlas(&mut b, &p2, &mut layouts, &mut cache);

        let ta = a.texture_atlas.expect("atlas on a");
        let tb = b.texture_atlas.expect("atlas on b");
        assert_eq!(ta.layout, tb.layout, "same grid reuses one layout handle");
        assert_eq!(ta.index, 0);
        assert_eq!(tb.index, 2);
        assert_eq!(layouts.len(), 1, "only one layout asset created");
    }

    fn style(json: serde_json::Value) -> Style {
        serde_json::from_value(json).unwrap()
    }

    #[test]
    fn color_named_function_and_fallback() {
        // named, hex, and rgb() all agree on pure red.
        let red = parse_color("#ff0000").to_srgba();
        assert_eq!(parse_color("red").to_srgba(), red);
        assert_eq!(parse_color("rgb(255, 0, 0)").to_srgba(), red);
        // transparent maps to a zero-alpha color.
        assert_eq!(parse_color("transparent").to_srgba().alpha, 0.0);
        // an unrecognized value falls back to the loud magenta debug color.
        assert_eq!(
            parse_color("definitely-not-a-color"),
            Color::srgb(1.0, 0.0, 1.0)
        );
    }

    #[test]
    fn length_units() {
        let s = style(serde_json::json!({
            "width": "50%", "height": "auto", "maxWidth": "100vw", "minHeight": 24
        }));
        assert_eq!(length_to_val(s.width.unwrap()), Val::Percent(50.0));
        assert_eq!(length_to_val(s.height.unwrap()), Val::Auto);
        assert_eq!(length_to_val(s.max_width.unwrap()), Val::Vw(100.0));
        assert_eq!(length_to_val(s.min_height.unwrap()), Val::Px(24.0));
    }

    #[test]
    fn rect_shorthand_and_object() {
        let s = style(serde_json::json!({
            "padding": "8px 16px",
            "margin": { "top": 1, "left": "2px" },
        }));
        let pad = rect_to_uirect(s.padding.unwrap());
        assert_eq!(pad.top, Val::Px(8.0));
        assert_eq!(pad.bottom, Val::Px(8.0));
        assert_eq!(pad.left, Val::Px(16.0));
        assert_eq!(pad.right, Val::Px(16.0));
        let margin = rect_to_uirect(s.margin.unwrap());
        assert_eq!(margin.top, Val::Px(1.0));
        assert_eq!(margin.left, Val::Px(2.0));
    }

    #[test]
    fn linear_gradient_maps_angle_and_stops() {
        let s = style(serde_json::json!({
            "backgroundGradient": {
                "type": "linear",
                "angle": 90.0,
                "stops": [
                    { "color": "#ff0000", "position": 0 },
                    { "color": "#0000ff", "position": "100%" },
                ],
            },
        }));
        let grads = build_gradients(s.background_gradient.as_ref().unwrap(), None);
        assert_eq!(grads.len(), 1);
        let Gradient::Linear(lin) = &grads[0] else {
            panic!("expected a linear gradient, got {:?}", grads[0]);
        };
        assert!((lin.angle - 90.0_f32.to_radians()).abs() < 1e-6);
        assert_eq!(lin.stops.len(), 2);
        assert_eq!(lin.stops[0].point, Val::Px(0.0));
        assert_eq!(lin.stops[1].point, Val::Percent(100.0));
        assert_eq!(lin.stops[0].color.to_srgba(), Srgba::hex("ff0000").unwrap());
    }

    #[test]
    fn gradient_accepts_single_or_array() {
        let one = style(serde_json::json!({
            "backgroundGradient": { "type": "linear", "stops": [{ "color": "#fff" }] },
        }));
        let many = style(serde_json::json!({
            "backgroundGradient": [
                { "type": "linear", "stops": [{ "color": "#fff" }] },
                { "type": "radial", "stops": [{ "color": "#000" }] },
            ],
        }));
        assert_eq!(
            build_gradients(one.background_gradient.as_ref().unwrap(), None).len(),
            1
        );
        assert_eq!(
            build_gradients(many.background_gradient.as_ref().unwrap(), None).len(),
            2
        );
    }

    #[test]
    fn box_shadow_accepts_single_or_array() {
        let one = style(serde_json::json!({
            "boxShadow": { "color": "#000", "blurRadius": 8 },
        }));
        let many = style(serde_json::json!({
            "boxShadow": [
                { "color": "#000", "blurRadius": 4 },
                { "color": "#FFFFFF33", "blurRadius": 16, "spreadRadius": 4 },
            ],
        }));
        assert_eq!(build_box_shadows(one.box_shadow.as_ref().unwrap()).len(), 1);
        assert_eq!(
            build_box_shadows(many.box_shadow.as_ref().unwrap()).len(),
            2
        );
    }

    #[test]
    fn conic_gradient_converts_degrees_to_radians() {
        let s = style(serde_json::json!({
            "backgroundGradient": {
                "type": "conic",
                "start": 45.0,
                "stops": [
                    { "color": "#ff0000", "angle": 0.0 },
                    { "color": "#00ff00", "angle": 180.0 },
                ],
            },
        }));
        let grads = build_gradients(s.background_gradient.as_ref().unwrap(), None);
        let Gradient::Conic(conic) = &grads[0] else {
            panic!("expected a conic gradient, got {:?}", grads[0]);
        };
        assert!((conic.start - 45.0_f32.to_radians()).abs() < 1e-6);
        assert_eq!(conic.stops[1].angle, Some(180.0_f32.to_radians()));
    }

    #[test]
    fn line_height_px_vs_relative() {
        let lh = |v: serde_json::Value| {
            line_height(
                style(serde_json::json!({ "lineHeight": v }))
                    .line_height
                    .as_ref()
                    .unwrap(),
            )
        };
        assert_eq!(lh(serde_json::json!(1.5)), LineHeight::RelativeToFont(1.5));
        assert_eq!(lh(serde_json::json!({ "px": 28 })), LineHeight::Px(28.0));
        // string forms: `px` is absolute, unitless/`em` is a multiple.
        assert_eq!(lh(serde_json::json!("20px")), LineHeight::Px(20.0));
        assert_eq!(
            lh(serde_json::json!("1.5em")),
            LineHeight::RelativeToFont(1.5)
        );
    }

    #[test]
    fn letter_spacing_px_vs_rem() {
        let ls = |v: serde_json::Value| {
            letter_spacing(
                style(serde_json::json!({ "letterSpacing": v }))
                    .letter_spacing
                    .as_ref()
                    .unwrap(),
            )
        };
        assert_eq!(ls(serde_json::json!(2)), LetterSpacing::Px(2.0));
        assert_eq!(
            ls(serde_json::json!({ "rem": 0.1 })),
            LetterSpacing::Rem(0.1)
        );
        // string forms: `px`, `rem`/`em`, and `normal`.
        assert_eq!(ls(serde_json::json!("2px")), LetterSpacing::Px(2.0));
        assert_eq!(ls(serde_json::json!("0.1rem")), LetterSpacing::Rem(0.1));
        assert_eq!(ls(serde_json::json!("normal")), LetterSpacing::default());
    }

    #[test]
    fn text_shadow_offset_and_color() {
        let s = style(serde_json::json!({
            "textShadow": { "color": "#ff0000", "offsetX": 2, "offsetY": 3 },
        }));
        let shadow = text_shadow(Some(&s)).unwrap();
        assert_eq!(shadow.offset, Vec2::new(2.0, 3.0));
        assert_eq!(shadow.color.to_srgba(), Srgba::hex("ff0000").unwrap());

        // Unset offset falls back to bevy's default displacement (4.0).
        let bare = style(serde_json::json!({ "textShadow": {} }));
        assert_eq!(text_shadow(Some(&bare)).unwrap().offset, Vec2::splat(4.0));
        // No textShadow → no component.
        assert!(text_shadow(Some(&style(serde_json::json!({})))).is_none());
    }

    #[test]
    fn line_break_drives_layout() {
        // `lineBreak` alone (no `textAlign`) still builds a `TextLayout`.
        let s = style(serde_json::json!({ "lineBreak": "noWrap" }));
        let layout = text_layout(&Some(s)).unwrap();
        assert_eq!(layout.linebreak, LineBreak::NoWrap);
        assert_eq!(layout.justify, Justify::default());

        // Neither set → no layout.
        assert!(text_layout(&Some(style(serde_json::json!({})))).is_none());

        // Both set are honored.
        let both = style(serde_json::json!({ "textAlign": "center", "lineBreak": "anyCharacter" }));
        let layout = text_layout(&Some(both)).unwrap();
        assert_eq!(layout.justify, Justify::Center);
        assert_eq!(layout.linebreak, LineBreak::AnyCharacter);
    }

    #[test]
    fn overlay_merges_fields() {
        let base = Some(style(serde_json::json!({
            "backgroundColor": "#111111",
            "width": 64,
            "color": "#ffffff",
        })));

        // None overlay leaves base untouched.
        let unchanged = overlay_style(&base, &None).unwrap();
        assert_eq!(unchanged.background_color.as_deref(), Some("#111111"));

        // Overlaid fields win; unset overlay fields fall through to base.
        let overlay = Some(style(serde_json::json!({ "backgroundColor": "#89b4fa" })));
        let merged = overlay_style(&base, &overlay).unwrap();
        assert_eq!(merged.background_color.as_deref(), Some("#89b4fa")); // overridden
        assert_eq!(length_to_val(merged.width.unwrap()), Val::Px(64.0)); // kept from base
        assert_eq!(merged.color.as_deref(), Some("#ffffff")); // kept from base

        // Overlay onto an absent base still yields the overlay's fields.
        let from_none = overlay_style(&None, &overlay).unwrap();
        assert_eq!(from_none.background_color.as_deref(), Some("#89b4fa"));
    }

    #[test]
    fn overlay_replaces_transform_wholesale() {
        let base = Some(style(serde_json::json!({
            "transform": { "translateX": 10, "scale": 1 },
        })));
        // Whole-object replace (CSS shorthand semantics): press's transform wins
        // entirely, dropping the base's translateX.
        let press = Some(style(serde_json::json!({ "transform": { "scale": 0.95 } })));
        let merged = overlay_style(&base, &press).unwrap();
        let t = merged.transform.unwrap();
        assert_eq!(t.scale, Some(0.95));
        assert_eq!(t.translate_x, None);
    }

    #[test]
    fn node_covers_layout() {
        let s = style(serde_json::json!({
            "display": "grid",
            "positionType": "absolute",
            "left": "10px",
            "flexGrow": 2,
            "gap": 12,
        }));
        let node = node_from_style(&Some(s));
        assert_eq!(node.display, Display::Grid);
        assert_eq!(node.position_type, PositionType::Absolute);
        assert_eq!(node.left, Val::Px(10.0));
        assert_eq!(node.flex_grow, 2.0);
        assert_eq!(node.row_gap, Val::Px(12.0));
        assert_eq!(node.column_gap, Val::Px(12.0));
    }

    #[test]
    fn grid_templates_and_placement() {
        assert_eq!(parse_template("1fr 2fr 100px").len(), 3);
        assert_eq!(parse_template("repeat(3, 1fr)").len(), 1);
        assert_eq!(
            format!("{:?}", parse_grid_placement("1 / 3")),
            format!("{:?}", GridPlacement::start_end(1, 3))
        );
        assert_eq!(
            format!("{:?}", parse_grid_placement("span 2")),
            format!("{:?}", GridPlacement::span(2))
        );
    }

    #[test]
    fn text_style_resolves() {
        let s = style(serde_json::json!({
            "color": "#7aa2f7", "fontSize": 20, "fontWeight": "bold"
        }));
        let (color, font, ..) = resolved_text_style(&Some(s), &Fonts::default());
        assert_eq!(color.0, parse_color("#7aa2f7"));
        assert_eq!(font.font_size, (20.0f32).into());
        assert_eq!(font.weight, FontWeight::BOLD);
    }

    #[test]
    fn font_size_units() {
        let fs = |v: serde_json::Value| {
            resolved_text_style(
                &Some(style(serde_json::json!({ "fontSize": v }))),
                &Fonts::default(),
            )
            .1
            .font_size
        };
        // bare number and "px" are both logical pixels.
        assert_eq!(fs(serde_json::json!(24)), BevyFontSize::Px(24.0));
        assert_eq!(fs(serde_json::json!("24px")), BevyFontSize::Px(24.0));
        // viewport + rem units map one-to-one onto bevy's `FontSize`.
        assert_eq!(fs(serde_json::json!("2vw")), BevyFontSize::Vw(2.0));
        assert_eq!(fs(serde_json::json!("1.5rem")), BevyFontSize::Rem(1.5));
    }

    #[test]
    fn text_enums() {
        assert_eq!(font_weight("bold"), FontWeight::BOLD);
        assert_eq!(font_weight("600"), FontWeight(600));
        assert_eq!(justify("center"), Justify::Center);
        let layout =
            text_layout(&Some(style(serde_json::json!({ "textAlign": "right" })))).unwrap();
        assert_eq!(layout.justify, Justify::Right);
    }

    /// An unrecognized enum keyword falls back to the type's default (and warns)
    /// rather than panicking or being silently dropped — see [`unknown_keyword`].
    #[test]
    fn unknown_enum_keywords_fall_back_to_default() {
        assert_eq!(display("flx"), Display::default());
        assert_eq!(align_items("centre"), AlignItems::default());
        assert_eq!(flex_direction("sideways"), FlexDirection::default());
        assert_eq!(justify("middle"), Justify::default());
        assert_eq!(font_weight("heavyish"), FontWeight::NORMAL);
        // A valid keyword that previously relied on the catch-all still maps.
        assert_eq!(linebreak("wordBoundary"), LineBreak::WordBoundary);
    }
}
