//! CPU-raster helpers shared by every element that paints its own texture
//! (`<canvas>`, the svg surfaces, a feature crate's raster element): the
//! blank placeholder image, the physical-size clamp, CSS color parsing, and
//! the pixmap → `Image` upload discipline. Part of the extension contract
//! (see [`crate::ext`]).

mod color;

pub use crate::pick_clip::pointer_physical_position;
pub use color::parse_css_color;

use bevy::asset::{Assets, RenderAssetUsages};
use bevy::ecs::entity::Entity;
use bevy::image::Image;
use bevy::math::Vec2;
use bevy::render::render_resource::{Extent3d, TextureDimension, TextureFormat};
use bevy::ui::widget::ImageNode;
use tiny_skia::Pixmap;

/// Largest backing-texture dimension we allocate, in physical pixels. A guard
/// against a degenerate layout asking for an enormous buffer.
pub const MAX_DIM: u32 = 4096;

/// Round + clamp a laid-out physical size (a `ComputedNode.size`) to the
/// rasterizable range. A `0` component means "not laid out yet". Shared by
/// every raster element and the canvas resize event, so the size reported to
/// JS always matches the actual buffer.
pub fn clamp_physical_size(size: Vec2) -> (u32, u32) {
    (
        (size.x.round() as u32).min(MAX_DIM),
        (size.y.round() as u32).min(MAX_DIM),
    )
}

/// A 1×1 transparent image to back a freshly spawned element-owned raster
/// until its first paint (which happens once the node has a laid-out size).
/// Kept in both worlds so the raster system can mutate the CPU copy and have
/// it re-upload.
pub fn blank_image() -> Image {
    Image::new_fill(
        Extent3d {
            width: 1,
            height: 1,
            depth_or_array_layers: 1,
        },
        TextureDimension::D2,
        &[0, 0, 0, 0],
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::MAIN_WORLD | RenderAssetUsages::RENDER_WORLD,
    )
}

/// Make `data` — a `w`×`h` straight-alpha RGBA8 buffer — the pixels of
/// `image` (an asset write, so the texture re-uploads), and return the buffer
/// it displaces for the caller to reuse. The descriptor size is set directly
/// rather than via [`Image::resize`]: that would zero-fill the old buffer to
/// the new size only for it to be replaced here.
pub fn replace_image_pixels(image: &mut Image, w: u32, h: u32, data: Vec<u8>) -> Vec<u8> {
    let extent = Extent3d {
        width: w,
        height: h,
        depth_or_array_layers: 1,
    };
    if image.texture_descriptor.size != extent {
        image.texture_descriptor.size = extent;
    }
    image.data.replace(data).unwrap_or_default()
}

/// Copy the pixmap into `out` as an RGBA8 (straight-alpha, sRGB) pixel
/// buffer, replacing its contents (the capacity is reused). tiny-skia stores
/// premultiplied alpha; Bevy's UI shader expects straight alpha, so each pixel
/// is demultiplied on the way out — bit-identical to tiny-skia's own
/// [`PremultipliedColorU8::demultiply`](tiny_skia::PremultipliedColorU8::demultiply)
/// (pinned by `straight_alpha_matches_per_pixel_demultiply`). Pixels are
/// processed in blocks: a block that is entirely opaque is already straight
/// (tiny-skia's pixel layout is RGBA8 in memory, so it copies as-is) and an
/// all-zero block is already transparent — between them the bulk of any real
/// surface; only mixed blocks (antialiased edges, translucent paint) take the
/// per-pixel demultiply. resvg output is premultiplied the same way.
pub fn write_straight_alpha(pixmap: &Pixmap, out: &mut Vec<u8>) {
    /// Pixels per block — 128 bytes, a couple of cache lines.
    const BLOCK: usize = 32;
    /// The alpha byte of a pixel read as a native-endian word.
    const ALPHA: u32 = u32::from_ne_bytes([0, 0, 0, 0xFF]);
    let pixels = pixmap.pixels();
    let bytes = pixmap.data();
    out.clear();
    out.reserve(bytes.len());
    for (i, chunk) in bytes.chunks(BLOCK * 4).enumerate() {
        let (and, or) = chunk
            .chunks_exact(4)
            .map(|px| u32::from_ne_bytes([px[0], px[1], px[2], px[3]]))
            .fold((u32::MAX, 0u32), |(and, or), w| (and & w, or | w));
        if and & ALPHA == ALPHA {
            out.extend_from_slice(chunk); // all opaque: premultiplied == straight
        } else if or == 0 {
            out.resize(out.len() + chunk.len(), 0); // all transparent zeros
        } else {
            for px in &pixels[i * BLOCK..i * BLOCK + chunk.len() / 4] {
                let c = px.demultiply();
                out.extend_from_slice(&[c.red(), c.green(), c.blue(), c.alpha()]);
            }
        }
    }
}

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

#[cfg(test)]
mod tests {
    use super::write_straight_alpha;
    use tiny_skia::Pixmap;

    #[test]
    fn straight_alpha_matches_per_pixel_demultiply() {
        // The reference: tiny-skia's demultiply on every pixel, as the
        // pre-fast-path loop did it. Pseudo-random premultiplied pixels with
        // every edge alpha (0, 1, 254, 255), including out-of-range color
        // bytes (color > alpha, color with alpha 0) a rasterizer never emits
        // but the fast path must still not reinterpret — plus whole runs of
        // opaque and of zero pixels so the block-level shortcuts are hit.
        let (w, h) = (64u32, 33u32);
        let mut seed = 0x2545_F491_4F6C_DD1Du64;
        let mut next = || {
            seed ^= seed << 13;
            seed ^= seed >> 7;
            seed ^= seed << 17;
            seed
        };
        let mut data = Vec::with_capacity((w * h * 4) as usize);
        for i in 0..(w * h) as usize {
            let r = next();
            if (500..700).contains(&i) {
                data.extend_from_slice(&[0, 0, 0, 0]); // a transparent run
                continue;
            }
            let a = match i % 7 {
                _ if (200..400).contains(&i) => 255, // an opaque run
                0 => 255,
                1 => 0,
                2 => 1,
                3 => 254,
                _ => (r >> 8) as u8,
            };
            let ch = |shift: u32| {
                let v = (r >> shift) as u8;
                if i % 11 == 0 { v } else { v.min(a) }
            };
            data.extend_from_slice(&[ch(16), ch(24), ch(32), a]);
        }
        let pixmap =
            Pixmap::from_vec(data, tiny_skia::IntSize::from_wh(w, h).unwrap()).expect("pixmap");
        let mut expected = Vec::new();
        for px in pixmap.pixels() {
            let c = px.demultiply();
            expected.extend_from_slice(&[c.red(), c.green(), c.blue(), c.alpha()]);
        }
        // A stale, differently-sized buffer is fully replaced.
        let mut out = vec![7u8; 13];
        write_straight_alpha(&pixmap, &mut out);
        assert_eq!(out, expected);
    }
}
