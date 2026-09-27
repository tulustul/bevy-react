//! `<node>` (the plain styled container), `<button>` (a node that captures
//! the pointer by default and carries bevy's `Button`), and `<root>` (a
//! detached, window-filling overlay root).

use bevy::prelude::*;
use bevy::ui::FocusPolicy;

use crate::element::{Common, Element};
use crate::ext::ElementFlags;
use crate::protocol::animatable::Animatable;
use crate::protocol::units::Length;
use crate::style::Style;
use crate::style::props::{FLEX_DIRECTION, FOCUS_POLICY, GLOBAL_Z_INDEX, HEIGHT, WIDTH};

/// `<node>`: a plain styled container.
pub static NODE: Element = Element::new("node");

/// `<button>`: a node carrying bevy's `Button` (which requires
/// `Interaction`) that captures the pointer by default — bevy_ui's native
/// `Button` blocks, so a button doesn't leak its click to a sibling, an
/// ancestor, or the 3D scene behind it.
pub static BUTTON: Element = Element {
    default_style: Some(button_style),
    spawn: Some(|ctx| ctx.spawn(Button)),
    ..Element::new("button")
};

fn button_style() -> Style {
    let mut style = Style::default();
    style.set(&FOCUS_POLICY, FocusPolicy::Block);
    style
}

/// `<root>`: the screen-space twin of `<surface>` — a styled container that
/// is a **detached UI root** on the default UI camera, for overlays that
/// must float above and stay out of the app's own tree (the devtools panel).
/// It never blocks or hovers picking itself; its children are ordinary
/// pickable nodes.
pub static ROOT: Element = Element {
    flags: ElementFlags {
        pick_ignore: true,
        ..ElementFlags::DETACHED_ROOT
    },
    common: Common::IDENTITY,
    default_style: Some(root_style),
    spawn: Some(|ctx| ctx.spawn(crate::bridge::RRoot)),
    ..Element::new("root")
};

/// The default style of a `<root>`: a window-filling overlay just above the
/// window tree. `globalZIndex: 1` (not a magic max) because bevy_ui sorts
/// root nodes by `(GlobalZIndex, ZIndex)` with NO tiebreak: equal keys fall
/// back to query iteration order, which is unspecified — a bare `<root>` at
/// the window tree's implicit 0 could land above OR below it. `1` is
/// deterministically above, while leaving the whole range open for the
/// user's own layering (`style.globalZIndex` overrides in either direction;
/// the devtools panel claims `i32::MAX` explicitly).
///
/// It defaults to a column, like the main UI root: bevy's own default is
/// `row`, but a row container mis-measures a single content-sized child that
/// has `maxWidth` + wrapping text (sized at max-content during the row's
/// main-axis pass, then clamped and wrapped — its height committed one line
/// short).
fn root_style() -> Style {
    let mut style = Style::default();
    style.set(&WIDTH, Animatable::Static(Length::Percent(100.0)));
    style.set(&HEIGHT, Animatable::Static(Length::Percent(100.0)));
    style.set(&FLEX_DIRECTION, FlexDirection::Column);
    style.set(&GLOBAL_Z_INDEX, 1);
    style
}
