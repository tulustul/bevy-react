//! The `backgroundImage` style: an image painted as part of a node's **own**
//! background stack — over `backgroundColor` and `backgroundGradient`, under
//! the node's content (bevy_ui's fixed per-node paint order) — by inserting an
//! [`ImageNode`] on the same entity. Never `NodeImageMode::Auto`, so the image
//! contributes nothing to layout and a late-loading asset causes no reflow.
//!
//! The style writer (`crate::style::writers::BACKGROUND_IMAGE_WRITER`) builds
//! the `ImageNode`; elements that own their entity's `ImageNode` (`image`,
//! `canvas`, `portal`, `svg`) are skipped there (`ElementFlags::owns_image`)
//! and warned about by the op path (`styleIgnored`, the stamps'
//! `warn_ignored_styles`). This module keeps the markers
//! and the systems that follow a texture binding / DPI change.

use bevy::image::TRANSPARENT_IMAGE_HANDLE;
use bevy::prelude::*;
use bevy::ui::widget::NodeImageMode;

/// Marks a node whose background image samples a render target registered in
/// [`crate::render_target::RenderTargets`]. [`bind_background_textures`] keeps the
/// entity's [`ImageNode`] pointed at the registry's texture for this name
/// (transparent placeholder while unregistered — the node binds late, like a
/// `<portal>`). Unlike a portal, a background never becomes the target's
/// `binder`, so `Resolution::Auto` targets stay at their initial size unless a
/// portal also shows them — prefer `Resolution::Fixed` targets here.
#[derive(Component, Clone, Debug)]
pub struct RBackgroundTexture(pub String);

/// The logical tile scale of a repeat-mode background image (`scale`, default
/// `1.0`). [`sync_background_tile_scale`] multiplies it by the node's scale
/// factor into `NodeImageMode::Tiled.stretch_value`, so `1.0` tiles at the
/// texture's own size in *logical* px on every display (CSS semantics).
#[derive(Component, Clone, Copy, Debug)]
pub struct BackgroundTileScale(pub f32);

/// Point every background-texture node's [`ImageNode`] at the registry
/// texture for its [`RBackgroundTexture`] name (or the shared transparent
/// placeholder while unregistered) — the `backgroundImage` analogue of
/// `bind_target_views`, minus the `binder` recording (that is portal
/// `Resolution::Auto` sizing semantics; a background never sizes its target).
/// Only writes on change; a real swap marks layer content dirty so an
/// enclosing cached layer repaints the late-bound pixels.
pub fn bind_background_textures(
    mut commands: Commands,
    targets: Res<crate::render_target::RenderTargets>,
    mut nodes: Query<(Entity, &RBackgroundTexture, &mut ImageNode)>,
) {
    for (entity, marker, mut node) in &mut nodes {
        let desired = targets.get(&marker.0).unwrap_or(TRANSPARENT_IMAGE_HANDLE);
        if node.image != desired {
            node.image = desired;
            crate::layer::mark_content_dirty(&mut commands.entity(entity));
        }
    }
}

/// Keep a repeat-mode background's `stretch_value` equal to
/// `scale × scale factor`, so `scale: 1` tiles at the texture's own size in
/// *logical* px on every display (CSS semantics; bevy's tiling is in physical
/// terms). Reacts to `Changed<ImageNode>` too — every restyle (delta, hover
/// flip) re-inserts the node with the *logical* value — and settles via
/// compare-before-write (the corrected write's own `Changed` echo no-ops on
/// the next pass).
#[allow(clippy::type_complexity)]
pub fn sync_background_tile_scale(
    mut nodes: Query<
        (&ComputedNode, &BackgroundTileScale, &mut ImageNode),
        Or<(
            Changed<ComputedNode>,
            Changed<BackgroundTileScale>,
            Changed<ImageNode>,
        )>,
    >,
) {
    for (computed, tile, mut node) in &mut nodes {
        let scale_factor = computed.inverse_scale_factor().recip();
        if !scale_factor.is_finite() || scale_factor <= 0.0 {
            // Not laid out yet — the layout pass will change `ComputedNode`
            // and re-run this.
            continue;
        }
        let want = tile.0 * scale_factor;
        let current = match &node.image_mode {
            NodeImageMode::Tiled { stretch_value, .. } => *stretch_value,
            _ => continue,
        };
        if (current - want).abs() <= 1e-4 {
            continue;
        }
        if let NodeImageMode::Tiled {
            ref mut stretch_value,
            ..
        } = node.image_mode
        {
            *stretch_value = want;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::render_target::{RenderTargetSpec, RenderTargets};
    use bevy::asset::AssetPlugin;

    fn test_app() -> App {
        let mut app = App::new();
        app.add_plugins((MinimalPlugins, AssetPlugin::default()));
        app.init_asset::<Image>();
        app.init_resource::<RenderTargets>();
        app.add_systems(
            Update,
            (bind_background_textures, sync_background_tile_scale),
        );
        app
    }

    /// A background-texture node starts on the transparent placeholder, binds
    /// to the registered target, and reverts when the target is removed.
    #[test]
    fn binds_and_reverts_to_placeholder() {
        let mut app = test_app();
        let node = app
            .world_mut()
            .spawn((
                RBackgroundTexture("minimap".into()),
                ImageNode::new(TRANSPARENT_IMAGE_HANDLE),
            ))
            .id();
        app.update();
        assert_eq!(
            app.world().entity(node).get::<ImageNode>().unwrap().image,
            TRANSPARENT_IMAGE_HANDLE,
            "an unregistered name shows the transparent placeholder"
        );

        let target_handle =
            app.world_mut()
                .resource_scope(|world, mut targets: Mut<RenderTargets>| {
                    let mut images = world.resource_mut::<Assets<Image>>();
                    targets
                        .create(&mut images, "minimap", RenderTargetSpec::default())
                        .handle
                });
        app.update();
        assert_eq!(
            app.world().entity(node).get::<ImageNode>().unwrap().image,
            target_handle,
            "the background binds once the target registers"
        );
        // (Unlike `bind_target_views`, no `binder` is recorded — the system only
        // reads the registry via `get`, so it *can't* touch sizing state.)

        app.world_mut()
            .resource_mut::<RenderTargets>()
            .remove("minimap");
        app.update();
        assert_eq!(
            app.world().entity(node).get::<ImageNode>().unwrap().image,
            TRANSPARENT_IMAGE_HANDLE,
            "a removed target reverts to the placeholder"
        );
    }

    /// `stretch_value` = logical scale × the node's scale factor, kept live
    /// on DPI change, and it settles (its own write echo no-ops).
    #[test]
    fn tile_scale_tracks_dpi() {
        let mut app = test_app();
        let computed = ComputedNode {
            inverse_scale_factor: 0.5, // a 2× display
            ..Default::default()
        };
        let node = app
            .world_mut()
            .spawn((
                computed,
                BackgroundTileScale(2.0),
                ImageNode::new(TRANSPARENT_IMAGE_HANDLE).with_mode(NodeImageMode::Tiled {
                    tile_x: true,
                    tile_y: true,
                    stretch_value: 2.0,
                }),
            ))
            .id();
        app.update();
        let stretch = |app: &App| match app
            .world()
            .entity(node)
            .get::<ImageNode>()
            .unwrap()
            .image_mode
        {
            NodeImageMode::Tiled { stretch_value, .. } => stretch_value,
            _ => panic!("expected Tiled"),
        };
        assert_eq!(stretch(&app), 4.0, "scale 2 on a 2× display → stretch 4");
        app.update();
        assert_eq!(stretch(&app), 4.0, "the corrected value settles");

        app.world_mut()
            .entity_mut(node)
            .get_mut::<ComputedNode>()
            .unwrap()
            .inverse_scale_factor = 1.0;
        app.update();
        assert_eq!(stretch(&app), 2.0, "a DPI change re-derives the stretch");
    }
}
