//! The `<surface>` element: a styled container whose subtree renders into an
//! offscreen image instead of the on-screen UI — a **detached UI root** (the
//! core never attaches it under its React parent; [`bind_surfaces`] points it
//! at the surface's offscreen UI camera). It fills the texture by default.
//!
//! [`bind_surfaces`]: crate::bind_surfaces

use bevy::prelude::*;
use bevy_react_core::element::{Attribute, Common, Element, SpawnCtx};
use bevy_react_core::ext::ElementFlags;
use bevy_react_core::protocol::{animatable::Animatable, units::Length};
use bevy_react_core::style::props::{HEIGHT, WIDTH};
use bevy_react_core::style::{Style, Writer, owns};

/// Marks a reconciler node as a `<surface target=…>` detached UI root.
/// [`SURFACE_WRITER`] stamps it from the `target` attribute;
/// [`bind_surfaces`](crate::bind_surfaces) points its [`UiTargetCamera`] at
/// the surface's offscreen UI camera.
#[derive(Component, Clone, Debug)]
pub struct RSurface(pub String);

/// The offscreen surface a `<surface>`'s subtree renders into (a name the
/// app registered in [`Surfaces`](crate::Surfaces)).
pub static TARGET: Attribute<String> = Attribute::new("target");

/// The `<surface>` element. Only the identity props apply to the root
/// itself: its pointer interaction rides the in-world virtual pointer onto
/// the nodes inside it.
pub static SURFACE: Element = Element {
    flags: ElementFlags::DETACHED_ROOT,
    attrs: &[&TARGET],
    required: &[&TARGET],
    common: Common::IDENTITY,
    writers: &[&SURFACE_WRITER],
    suppress: &[&bevy_react_core::style::writers::BACKGROUND_IMAGE_WRITER],
    default_style: Some(surface_style),
    spawn: Some(spawn_surface),
    ..Element::new("surface")
};

fn spawn_surface(ctx: &mut SpawnCtx) -> Entity {
    let target = ctx.props.attrs.get(&TARGET).cloned().unwrap_or_default();
    ctx.spawn(RSurface(target))
}

/// The default style of a `<surface>`: it fills the offscreen texture (the
/// camera's logical viewport), so the subtree has a definite box to lay out
/// in. The user's `style` overlays it.
fn surface_style() -> Style {
    let mut style = Style::default();
    style.set(&WIDTH, Animatable::Static(Length::Percent(100.0)));
    style.set(&HEIGHT, Animatable::Static(Length::Percent(100.0)));
    style
}

/// Rebind a `<surface>` to a new `target`.
pub static SURFACE_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[&TARGET],
    writes: &[owns::<RSurface>],
    apply: |ctx, _s, ec| {
        if let Some(target) = ctx.attr(&TARGET).filter(|_| !ctx.fresh) {
            ec.insert(RSurface(target.clone()));
        }
    },
};

#[cfg(test)]
mod tests;
