//! Translation from reconciler props (the bevy-free [`crate::protocol`] wire
//! types) into `bevy_ui` components: the `Node` layout, its sibling visual
//! components (background/border/outline/shadow/z-index), and `ImageNode`.

use bevy::prelude::*;
use bevy::ui::widget::NodeImageMode;
use bevy_react_animations::build_ui_transform;

use crate::plugin::Fonts;
use crate::protocol::{Length, Props, Rect, Style};

/// Parse a `#rrggbb`/`rrggbb` (or 8-digit alpha) hex string into a `Color`.
/// Falls back to opaque white on parse failure so a typo never panics.
pub fn parse_color(hex: &str) -> Color {
    let s = hex.strip_prefix('#').unwrap_or(hex);
    bevy::color::Srgba::hex(s)
        .map(Color::from)
        .unwrap_or(Color::WHITE)
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

fn display(s: &str) -> Display {
    match s {
        "flex" => Display::Flex,
        "grid" => Display::Grid,
        "block" => Display::Block,
        "none" => Display::None,
        _ => Display::default(),
    }
}

fn box_sizing(s: &str) -> BoxSizing {
    match s {
        "borderBox" | "border-box" => BoxSizing::BorderBox,
        "contentBox" | "content-box" => BoxSizing::ContentBox,
        _ => BoxSizing::default(),
    }
}

fn position_type(s: &str) -> PositionType {
    match s {
        "absolute" => PositionType::Absolute,
        "relative" => PositionType::Relative,
        _ => PositionType::default(),
    }
}

fn overflow_axis(s: &str) -> OverflowAxis {
    match s {
        "visible" => OverflowAxis::Visible,
        "clip" => OverflowAxis::Clip,
        "hidden" => OverflowAxis::Hidden,
        "scroll" => OverflowAxis::Scroll,
        _ => OverflowAxis::default(),
    }
}

fn align_items(s: &str) -> AlignItems {
    match s {
        "start" | "flexStart" => AlignItems::FlexStart,
        "end" | "flexEnd" => AlignItems::FlexEnd,
        "center" => AlignItems::Center,
        "baseline" => AlignItems::Baseline,
        "stretch" => AlignItems::Stretch,
        _ => AlignItems::default(),
    }
}

fn align_self(s: &str) -> AlignSelf {
    match s {
        "auto" => AlignSelf::Auto,
        "start" | "flexStart" => AlignSelf::FlexStart,
        "end" | "flexEnd" => AlignSelf::FlexEnd,
        "center" => AlignSelf::Center,
        "baseline" => AlignSelf::Baseline,
        "stretch" => AlignSelf::Stretch,
        _ => AlignSelf::default(),
    }
}

fn align_content(s: &str) -> AlignContent {
    match s {
        "start" | "flexStart" => AlignContent::FlexStart,
        "end" | "flexEnd" => AlignContent::FlexEnd,
        "center" => AlignContent::Center,
        "stretch" => AlignContent::Stretch,
        "spaceBetween" => AlignContent::SpaceBetween,
        "spaceEvenly" => AlignContent::SpaceEvenly,
        "spaceAround" => AlignContent::SpaceAround,
        _ => AlignContent::default(),
    }
}

fn justify_items(s: &str) -> JustifyItems {
    match s {
        "start" => JustifyItems::Start,
        "end" => JustifyItems::End,
        "center" => JustifyItems::Center,
        "baseline" => JustifyItems::Baseline,
        "stretch" => JustifyItems::Stretch,
        _ => JustifyItems::default(),
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
        _ => JustifySelf::default(),
    }
}

fn justify_content(s: &str) -> JustifyContent {
    match s {
        "start" | "flexStart" => JustifyContent::FlexStart,
        "end" | "flexEnd" => JustifyContent::FlexEnd,
        "center" => JustifyContent::Center,
        "stretch" => JustifyContent::Stretch,
        "spaceBetween" => JustifyContent::SpaceBetween,
        "spaceEvenly" => JustifyContent::SpaceEvenly,
        "spaceAround" => JustifyContent::SpaceAround,
        _ => JustifyContent::default(),
    }
}

fn flex_direction(s: &str) -> FlexDirection {
    match s {
        "row" => FlexDirection::Row,
        "column" => FlexDirection::Column,
        "rowReverse" => FlexDirection::RowReverse,
        "columnReverse" => FlexDirection::ColumnReverse,
        _ => FlexDirection::default(),
    }
}

fn flex_wrap(s: &str) -> FlexWrap {
    match s {
        "nowrap" | "noWrap" => FlexWrap::NoWrap,
        "wrap" => FlexWrap::Wrap,
        "wrapReverse" => FlexWrap::WrapReverse,
        _ => FlexWrap::default(),
    }
}

fn grid_auto_flow(s: &str) -> GridAutoFlow {
    match s {
        "row" => GridAutoFlow::Row,
        "column" => GridAutoFlow::Column,
        "rowDense" => GridAutoFlow::RowDense,
        "columnDense" => GridAutoFlow::ColumnDense,
        _ => GridAutoFlow::default(),
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
    } else if let Some(v) = t.strip_suffix('%').and_then(parse) {
        Some(GridTrack::percent(v))
    } else {
        None
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
    } else if let Some(v) = t.strip_suffix('%').and_then(parse) {
        Some(RepeatedGridTrack::percent(count as usize, v))
    } else {
        None
    }
}

/// Parse a CSS grid template (`"repeat(3, 1fr)"`, `"1fr 2fr 100px"`, `"auto"`).
fn parse_template(s: &str) -> Vec<RepeatedGridTrack> {
    split_tracks(s)
        .into_iter()
        .filter_map(|tok| {
            if let Some(inner) = tok
                .strip_prefix("repeat(")
                .and_then(|t| t.strip_suffix(')'))
            {
                let (count, track) = inner.split_once(',')?;
                repeated_track(count.trim().parse().ok()?, track)
            } else {
                single_track(&tok).map(Into::into)
            }
        })
        .collect()
}

/// Parse an auto-track list (`grid-auto-rows`/`columns`); no `repeat()`.
fn parse_auto_tracks(s: &str) -> Vec<GridTrack> {
    split_tracks(s)
        .iter()
        .filter_map(|t| single_track(t))
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
            t.translate_x,
            t.translate_y,
            t.scale,
            t.scale_x,
            t.scale_y,
            t.rotate,
        ));
    }
    match s.and_then(|s| s.border_color.as_deref()) {
        Some(hex) => {
            ec.insert(BorderColor::all(parse_color(hex)));
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
            ec.insert(BoxShadow(vec![ShadowStyle {
                color: b.color.as_deref().map(parse_color).unwrap_or(Color::BLACK),
                x_offset: b.x_offset.map(length_to_val).unwrap_or(Val::Px(0.0)),
                y_offset: b.y_offset.map(length_to_val).unwrap_or(Val::Px(0.0)),
                spread_radius: b.spread_radius.map(length_to_val).unwrap_or(Val::Px(0.0)),
                blur_radius: b.blur_radius.map(length_to_val).unwrap_or(Val::Px(0.0)),
            }]));
        }
        None => {
            ec.remove::<BoxShadow>();
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
        z_index,
        transform,
        opacity,
        transition,
        color,
        font_size,
        font_weight,
        text_align,
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
        image.image_mode = match mode.as_str() {
            "stretch" => NodeImageMode::Stretch,
            _ => NodeImageMode::Auto,
        };
    }
    image
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
        other => other
            .parse::<u16>()
            .map(FontWeight)
            .unwrap_or(FontWeight::NORMAL),
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
        _ => Justify::default(),
    }
}

/// Resolve a style's text appearance into the `TextColor` + `TextFont` a text
/// run carries. Unset fields fall back to white / Bevy's default font. Returned
/// as concrete components so they can be copied onto inheriting child spans.
pub fn resolved_text_style(style: &Option<Style>, fonts: &Fonts) -> (TextColor, TextFont) {
    let mut color = TextColor(Color::WHITE);
    let mut font = TextFont::default();
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
            font.font_size = size.into();
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
    }
    (color, font)
}

/// Insert the `TextColor` + `TextFont` for a `<text>` element or span.
pub fn apply_text_style(ec: &mut EntityCommands, style: &Option<Style>, fonts: &Fonts) {
    ec.insert(resolved_text_style(style, fonts));
}

/// The `TextLayout` for a `<text>` root, if `textAlign` is set (root only).
pub fn text_layout(style: &Option<Style>) -> Option<TextLayout> {
    let align = style.as_ref()?.text_align.as_deref()?;
    Some(TextLayout {
        justify: justify(align),
        ..default()
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

    fn style(json: serde_json::Value) -> Style {
        serde_json::from_value(json).unwrap()
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
        let (color, font) = resolved_text_style(&Some(s), &Fonts::default());
        assert_eq!(color.0, parse_color("#7aa2f7"));
        assert_eq!(font.font_size, (20.0f32).into());
        assert_eq!(font.weight, FontWeight::BOLD);
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
}
