//! The `<portal>` element for `bevy_react_core`: a UI rectangle that shows an
//! **offscreen render target** — the live (or snapshot) output of a Bevy
//! camera drawing into a GPU texture — so the React UI can embed a minimap, a
//! picture-in-picture, or a per-item 3D preview.
//!
//! The element is thin, and that is the design: the named render-target
//! registry stays in the core ([`RenderTargets`], [`PortalCamera`], the
//! binding and the camera gate), because the core's own `backgroundImage:
//! { texture }` style and apps use it directly. A `<portal>` is a styled node
//! with an element-owned `ImageNode` that stamps a core [`TargetView`] from
//! its `target` attribute; the core points the `ImageNode` at the target's
//! texture (a transparent placeholder until the app registers the name), sizes
//! an `Auto`-resolution target to the portal's laid-out box, and runs a live
//! target's camera only while a view of it is showing.
//!
//! The app owns the cameras, meshes, and render layers: it creates a named
//! target in [`RenderTargets`], spawns a camera pointed at it tagged
//! [`PortalCamera`], and hands React the name over its typed event channel —
//! React echoes it back as `<portal target={name} />`.
//!
//! [`RenderTargets`]: bevy_react_core::RenderTargets
//! [`PortalCamera`]: bevy_react_core::PortalCamera

use bevy::prelude::*;
use bevy::ui::widget::{ImageNode, NodeImageMode};
use bevy_react_core::ReactAppExt;
use bevy_react_core::element::{Attribute, Element, SpawnCtx};
use bevy_react_core::ext::{ElementFlags, LiveTexture};
use bevy_react_core::render_target::TargetView;
use bevy_react_core::style::{Writer, owns};

/// The render-target name a `<portal>` displays.
pub static TARGET: Attribute<String> = Attribute::new("target");

/// The `<portal>` element. Starts on a blank placeholder; the core's binding
/// swaps in the real texture once the target exists (and back to the
/// placeholder if the app removes it).
pub static PORTAL: Element = Element {
    flags: ElementFlags::OWNS_IMAGE,
    attrs: &[&TARGET],
    required: &[&TARGET],
    writers: &[&PORTAL_WRITER],
    suppress: &[&bevy_react_core::style::writers::BACKGROUND_IMAGE_WRITER],
    spawn: Some(spawn_portal),
    ..Element::new("portal")
};

fn spawn_portal(ctx: &mut SpawnCtx) -> Entity {
    let mut image = ImageNode::new(ctx.blank_image());
    image.image_mode = NodeImageMode::Stretch;
    let target = ctx.props.attrs.get(&TARGET).cloned().unwrap_or_default();
    ctx.spawn((image, TargetView(target), LiveTexture))
}

/// Rebind a `<portal>` to a new `target` (the core's binding points its
/// `ImageNode` at the new texture next frame).
pub static PORTAL_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[&TARGET],
    writes: &[owns::<TargetView>],
    apply: |ctx, _s, ec| {
        if let Some(target) = ctx.attr(&TARGET).filter(|_| !ctx.fresh) {
            ec.insert(TargetView(target.clone()));
        }
    },
};

/// Registers the `<portal>` element. The render-target service it displays
/// is the core's (`ReactUiPlugin`), so the element has no systems of its own.
/// Requires `ReactUiPlugin` in the same app (added in any order; warned at
/// `finish` when missing).
pub struct PortalPlugin;

impl Plugin for PortalPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
    }

    fn finish(&self, app: &mut App) {
        if !app.is_plugin_added::<bevy_react_core::ReactUiPlugin>() {
            warn!(
                target: "bevy_react",
                "bevy_react_portal::PortalPlugin is added but ReactUiPlugin is not: \
                 the <portal> element has nothing to mount into"
            );
        }
    }
}

/// The element registration alone (no systems) — what the TypeScript
/// exporter and a headless op harness need.
pub fn register_bindings(app: &mut App) {
    app.add_react_element(&PORTAL);
}

#[cfg(test)]
mod tests;
