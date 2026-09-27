//! CPU-raster helpers shared by every element that paints its own texture
//! (`<canvas>`, the svg surfaces, a feature crate's raster element): the
//! blank placeholder image, the physical-size clamp, and the pixmap → `Image`
//! upload discipline. Part of the extension contract (see [`crate::ext`]);
//! the implementations live beside `<canvas>`, which owns the raster core.

pub use crate::canvas::{
    blank_canvas_image, clamp_physical_size, parse_css_color, replace_image_pixels,
    write_straight_alpha,
};
pub use crate::pick_clip::pointer_physical_position;

use bevy::asset::Assets;
use bevy::ecs::entity::Entity;
use bevy::image::Image;
use bevy::ui::widget::ImageNode;

/// Uniform `xMidYMid meet` fit of the content rect (`min`, `size`, user
/// units) into a `w`×`h` pixel box: scale by the tighter axis, center the
/// slack axis, translating by `-min` first. Shared by the svg-mode
/// rasterizer and the JSX `<svg>` painter's viewBox fit. `size` must be
/// positive (callers guard).
pub fn meet_transform(
    min: bevy::math::Vec2,
    size: bevy::math::Vec2,
    w: u32,
    h: u32,
) -> tiny_skia::Transform {
    let scale = (w as f32 / size.x).min(h as f32 / size.y);
    let tx = (w as f32 - size.x * scale) * 0.5 - min.x * scale;
    let ty = (h as f32 - size.y * scale) * 0.5 - min.y * scale;
    tiny_skia::Transform::from_row(scale, 0.0, 0.0, scale, tx, ty)
}

/// The buffers an element-owned raster's repaint reuses frame to frame: the
/// pixmap it paints into (cleared, not reallocated, while the size holds) and
/// the straight-alpha upload buffer the backing image handed back when it
/// took the previous one (two buffers ping-pong, so a per-frame repaint
/// allocates nothing at steady state). Keep it on the surface component and
/// write it through `bypass_change_detection` so a repaint alone never ticks
/// the component (the clean-frame / derived-dirt contract).
#[derive(Default)]
pub struct RasterCache {
    pixmap: Option<tiny_skia::Pixmap>,
    spare: Vec<u8>,
}

impl RasterCache {
    /// A transparent `w`×`h` pixmap to paint into: the retained one cleared
    /// when the size matches, else a fresh allocation. `None` only for a
    /// zero/overflowing size.
    pub fn take_pixmap(&mut self, w: u32, h: u32) -> Option<tiny_skia::Pixmap> {
        match self.pixmap.take() {
            Some(mut pixmap) if pixmap.width() == w && pixmap.height() == h => {
                pixmap.fill(tiny_skia::Color::TRANSPARENT);
                Some(pixmap)
            }
            _ => tiny_skia::Pixmap::new(w, h),
        }
    }

    /// Retain the painted pixmap for the next repaint.
    pub fn keep_pixmap(&mut self, pixmap: tiny_skia::Pixmap) {
        self.pixmap = Some(pixmap);
    }
}

/// Upload freshly-painted pixels into the node's element-owned image: the
/// [`LayerContentDirt`](crate::layer::LayerContentDirt) tap first (a real
/// pixel write stales the owning layer's capture), then the straight-alpha
/// write into the cache's spare buffer, which swaps with the image's current
/// one. Callers verify `images.contains` before painting.
#[allow(clippy::too_many_arguments)]
pub fn upload_pixmap(
    entity: Entity,
    image_node: &ImageNode,
    images: &mut Assets<Image>,
    dirt: &mut crate::layer::LayerContentDirt,
    w: u32,
    h: u32,
    pixmap: &tiny_skia::Pixmap,
    cache: &mut RasterCache,
) {
    dirt.nodes.push(entity);
    let Some(mut image) = images.get_mut(&image_node.image) else {
        return;
    };
    let mut data = std::mem::take(&mut cache.spare);
    write_straight_alpha(pixmap, &mut data);
    cache.spare = replace_image_pixels(&mut image, w, h, data);
}
