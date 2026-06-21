//! Translation from reconciler props into `bevy_ui` components.

use bevy::color::Srgba;
use bevy::prelude::*;

use crate::protocol::{Props, Style};

/// Parse a `#rrggbb`/`rrggbb` (or 8-digit alpha) hex string into a `Color`.
/// Falls back to opaque white on parse failure so a typo never panics.
pub fn parse_color(hex: &str) -> Color {
    let s = hex.strip_prefix('#').unwrap_or(hex);
    Srgba::hex(s).map(Color::from).unwrap_or(Color::WHITE)
}

/// Build a `bevy_ui::Node` from the style subset. Unset fields keep Bevy's
/// defaults.
pub fn node_from_style(style: &Option<Style>) -> Node {
    let mut node = Node::default();
    let Some(s) = style else { return node };

    if let Some(w) = s.width {
        node.width = Val::Px(w);
    }
    if let Some(h) = s.height {
        node.height = Val::Px(h);
    }
    if let Some(dir) = &s.flex_direction {
        node.flex_direction = match dir.as_str() {
            "row" => FlexDirection::Row,
            "column" => FlexDirection::Column,
            _ => FlexDirection::Row,
        };
    }
    if let Some(jc) = &s.justify_content {
        node.justify_content = match jc.as_str() {
            "start" => JustifyContent::FlexStart,
            "center" => JustifyContent::Center,
            "end" => JustifyContent::FlexEnd,
            "spaceBetween" => JustifyContent::SpaceBetween,
            "spaceAround" => JustifyContent::SpaceAround,
            _ => JustifyContent::FlexStart,
        };
    }
    if let Some(ai) = &s.align_items {
        node.align_items = match ai.as_str() {
            "start" => AlignItems::FlexStart,
            "center" => AlignItems::Center,
            "end" => AlignItems::FlexEnd,
            "stretch" => AlignItems::Stretch,
            _ => AlignItems::FlexStart,
        };
    }
    if let Some(p) = s.padding {
        node.padding = UiRect::all(Val::Px(p));
    }
    if let Some(m) = s.margin {
        node.margin = UiRect::all(Val::Px(m));
    }
    if let Some(g) = s.gap {
        node.row_gap = Val::Px(g);
        node.column_gap = Val::Px(g);
    }
    node
}

/// The background color from props, if any.
pub fn background(props: &Props) -> Option<BackgroundColor> {
    props
        .background_color
        .as_deref()
        .map(|hex| BackgroundColor(parse_color(hex)))
}
