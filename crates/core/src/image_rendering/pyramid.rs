//! CPU mip-pyramid generation for [`Image`] assets (`imageRendering:
//! "trilinear"`). bevy has no runtime mip generation for 2D textures and the
//! GPU blit in `layer/render/mips.rs` is for layer captures, so the pyramid is
//! built here, on the CPU, off-thread (the binder runs it on
//! `AsyncComputeTaskPool`): a 2×2 box filter per level, in **linear light**
//! (sRGB-encoded formats decode through a LUT and re-encode), **alpha
//! weighted** (premultiply before averaging, unpremultiply after — a
//! transparent texel contributes no color, so edges don't darken), odd
//! dimensions clamp the missing column/row to the edge. Only
//! `Rgba8Unorm`/`Rgba8UnormSrgb` single-layer 2D images without mips qualify;
//! anything else is [`PyramidError`] and the image is left untouched.

use std::fmt;

use bevy::color::Srgba;
use bevy::image::Image;
use bevy::render::render_resource::{TextureDimension, TextureFormat};

/// Why an image can't take a generated pyramid. `Display` is the user-facing
/// reason (`diag` warning text).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PyramidError {
    /// Not `Rgba8Unorm` / `Rgba8UnormSrgb`.
    Format(TextureFormat),
    /// Not a single-layer 2D texture.
    Shape,
    /// The asset already carries mip levels (DDS/KTX2) — nothing to build.
    AlreadyMipped,
    /// No CPU-side pixel data (`RenderAssetUsages` without `MAIN_WORLD`, or a
    /// GPU-written texture).
    NoData,
}

impl fmt::Display for PyramidError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Format(fmt) => write!(f, "unsupported texture format {fmt:?} (need Rgba8Unorm)"),
            Self::Shape => f.write_str("not a single-layer 2D texture"),
            Self::AlreadyMipped => f.write_str("the asset already carries mip levels"),
            Self::NoData => f.write_str("the image has no CPU-side pixel data"),
        }
    }
}

/// Whether [`build_pyramid`] would succeed on `image` (the binder's pre-check,
/// so a doomed build never leaves the main thread).
pub fn check(image: &Image) -> Result<(), PyramidError> {
    let desc = &image.texture_descriptor;
    if !matches!(
        desc.format,
        TextureFormat::Rgba8Unorm | TextureFormat::Rgba8UnormSrgb
    ) {
        return Err(PyramidError::Format(desc.format));
    }
    if desc.dimension != TextureDimension::D2 || desc.size.depth_or_array_layers != 1 {
        return Err(PyramidError::Shape);
    }
    if desc.mip_level_count > 1 {
        return Err(PyramidError::AlreadyMipped);
    }
    let want = desc.size.width as usize * desc.size.height as usize * 4;
    match &image.data {
        Some(data) if data.len() == want => Ok(()),
        _ => Err(PyramidError::NoData),
    }
}

/// Mip levels for a `width × height` texture — the full chain down to 1×1
/// (the same count `layer/render/mips.rs` allocates for captures).
pub fn level_count(width: u32, height: u32) -> u32 {
    width.max(height).max(1).ilog2() + 1
}

/// Append the full mip chain to `image` (levels 1.. after level 0 in
/// `data`, wgpu's default `LayerMajor` layout) and set `mip_level_count`.
/// Returns the level count. On `Err` the image is untouched.
pub fn build_pyramid(image: &mut Image) -> Result<u32, PyramidError> {
    check(image)?;
    let desc = &image.texture_descriptor;
    let srgb = desc.format == TextureFormat::Rgba8UnormSrgb;
    let (mut w, mut h) = (desc.size.width, desc.size.height);
    let levels = level_count(w, h);
    let data = image.data.as_mut().expect("checked");
    let decode = if srgb {
        &SRGB_TO_LINEAR
    } else {
        &UNORM_TO_LINEAR
    };
    let mut src_start = 0usize;
    for _ in 1..levels {
        let src_len = (w * h * 4) as usize;
        let (nw, nh) = ((w / 2).max(1), (h / 2).max(1));
        let mut level = Vec::with_capacity((nw * nh * 4) as usize);
        {
            let src = &data[src_start..src_start + src_len];
            for y in 0..nh {
                for x in 0..nw {
                    let mut acc = [0f32; 4];
                    for (dx, dy) in [(0, 0), (1, 0), (0, 1), (1, 1)] {
                        let sx = (2 * x + dx).min(w - 1);
                        let sy = (2 * y + dy).min(h - 1);
                        let i = ((sy * w + sx) * 4) as usize;
                        let a = src[i + 3] as f32 / 255.0;
                        acc[0] += decode[src[i] as usize] * a;
                        acc[1] += decode[src[i + 1] as usize] * a;
                        acc[2] += decode[src[i + 2] as usize] * a;
                        acc[3] += a;
                    }
                    let rgb = if acc[3] > 0.0 {
                        [acc[0] / acc[3], acc[1] / acc[3], acc[2] / acc[3]]
                    } else {
                        [0.0; 3]
                    };
                    for c in rgb {
                        level.push(encode(c, srgb));
                    }
                    level.push((acc[3] / 4.0 * 255.0).round() as u8);
                }
            }
        }
        data.extend_from_slice(&level);
        src_start += src_len;
        (w, h) = (nw, nh);
    }
    image.texture_descriptor.mip_level_count = levels;
    Ok(levels)
}

/// Encode LUT resolution (linear → sRGB): 4096 steps keeps the rounding
/// error below half an 8-bit step.
const ENCODE_STEPS: usize = 4096;

fn encode(linear: f32, srgb: bool) -> u8 {
    let v = linear.clamp(0.0, 1.0);
    if srgb {
        LINEAR_TO_SRGB[(v * (ENCODE_STEPS - 1) as f32).round() as usize]
    } else {
        (v * 255.0).round() as u8
    }
}

static SRGB_TO_LINEAR: std::sync::LazyLock<[f32; 256]> = std::sync::LazyLock::new(|| {
    let mut lut = [0f32; 256];
    for (i, v) in lut.iter_mut().enumerate() {
        *v = Srgba::gamma_function(i as f32 / 255.0);
    }
    lut
});

static UNORM_TO_LINEAR: std::sync::LazyLock<[f32; 256]> = std::sync::LazyLock::new(|| {
    let mut lut = [0f32; 256];
    for (i, v) in lut.iter_mut().enumerate() {
        *v = i as f32 / 255.0;
    }
    lut
});

static LINEAR_TO_SRGB: std::sync::LazyLock<[u8; ENCODE_STEPS]> = std::sync::LazyLock::new(|| {
    let mut lut = [0u8; ENCODE_STEPS];
    for (i, v) in lut.iter_mut().enumerate() {
        let linear = i as f32 / (ENCODE_STEPS - 1) as f32;
        *v = (Srgba::gamma_function_inverse(linear) * 255.0).round() as u8;
    }
    lut
});

#[cfg(test)]
mod tests {
    use super::*;
    use bevy::asset::RenderAssetUsages;
    use bevy::render::render_resource::Extent3d;

    fn image(w: u32, h: u32, format: TextureFormat, pixels: &[[u8; 4]]) -> Image {
        assert_eq!(pixels.len(), (w * h) as usize);
        Image::new(
            Extent3d {
                width: w,
                height: h,
                depth_or_array_layers: 1,
            },
            TextureDimension::D2,
            pixels.iter().flatten().copied().collect(),
            format,
            RenderAssetUsages::default(),
        )
    }

    fn level(image: &Image, start: usize, px: usize) -> [u8; 4] {
        let d = image.data.as_ref().unwrap();
        [
            d[start + px * 4],
            d[start + px * 4 + 1],
            d[start + px * 4 + 2],
            d[start + px * 4 + 3],
        ]
    }

    /// An sRGB checker of black and white averages in *linear* light: the
    /// midpoint is sRGB 188 (0.5 linear), not 128.
    #[test]
    fn srgb_average_is_in_linear_light() {
        let b = [0, 0, 0, 255];
        let w = [255, 255, 255, 255];
        let mut img = image(2, 2, TextureFormat::Rgba8UnormSrgb, &[b, w, w, b]);
        assert_eq!(build_pyramid(&mut img), Ok(2));
        assert_eq!(img.texture_descriptor.mip_level_count, 2);
        assert_eq!(img.data.as_ref().unwrap().len(), 16 + 4);
        assert_eq!(level(&img, 16, 0), [188, 188, 188, 255]);

        // The linear format averages linearly: 127.5 rounds to 128.
        let mut img = image(2, 2, TextureFormat::Rgba8Unorm, &[b, w, w, b]);
        assert_eq!(build_pyramid(&mut img), Ok(2));
        assert_eq!(level(&img, 16, 0), [128, 128, 128, 255]);
    }

    /// Transparent texels contribute no color: one opaque red over three
    /// transparent black texels stays pure red at a quarter alpha, instead of
    /// darkening toward black.
    #[test]
    fn average_is_alpha_weighted() {
        let red = [255, 0, 0, 255];
        let clear = [0, 0, 0, 0];
        let mut img = image(
            2,
            2,
            TextureFormat::Rgba8UnormSrgb,
            &[red, clear, clear, clear],
        );
        build_pyramid(&mut img).unwrap();
        assert_eq!(level(&img, 16, 0), [255, 0, 0, 64]);

        // Fully transparent block → transparent black, no NaN division.
        let mut img = image(2, 2, TextureFormat::Rgba8UnormSrgb, &[clear; 4]);
        build_pyramid(&mut img).unwrap();
        assert_eq!(level(&img, 16, 0), [0, 0, 0, 0]);
    }

    /// Non-power-of-two sizes: levels halve with floor (min 1) and the
    /// missing column clamps to the edge; the chain runs down to 1×1.
    #[test]
    fn odd_and_rectangular_sizes_clamp_to_the_edge() {
        let b = [0, 0, 0, 255];
        let w = [255, 255, 255, 255];
        // 3×1: level 1 is 1×1 from columns 0,1 (column 2 is beyond the 2×2).
        let mut img = image(3, 1, TextureFormat::Rgba8UnormSrgb, &[b, w, w]);
        assert_eq!(build_pyramid(&mut img), Ok(2));
        assert_eq!(level(&img, 12, 0), [188, 188, 188, 255]);
        // 1×3: the same along y, the missing row clamps.
        let mut img = image(1, 3, TextureFormat::Rgba8UnormSrgb, &[b, w, w]);
        assert_eq!(build_pyramid(&mut img), Ok(2));
        assert_eq!(level(&img, 12, 0), [188, 188, 188, 255]);
        // 4×2 → 2×1 → 1×1: three levels, 32 + 8 + 4 bytes.
        let mut img = image(4, 2, TextureFormat::Rgba8UnormSrgb, &[b; 8]);
        assert_eq!(build_pyramid(&mut img), Ok(3));
        assert_eq!(img.data.as_ref().unwrap().len(), 32 + 8 + 4);
        assert_eq!(level_count(486, 526), 10);
        assert_eq!(level_count(1, 1), 1);
    }

    /// Unsupported inputs are refused with a reason and leave the image
    /// untouched; a 1×1 image is a valid one-level pyramid.
    #[test]
    fn refuses_unsupported_images_untouched() {
        let px = [[1, 2, 3, 4]];
        let mut img = image(1, 1, TextureFormat::Bgra8UnormSrgb, &px);
        assert_eq!(
            build_pyramid(&mut img),
            Err(PyramidError::Format(TextureFormat::Bgra8UnormSrgb))
        );
        assert_eq!(img.texture_descriptor.mip_level_count, 1);

        let mut img = image(1, 1, TextureFormat::Rgba8UnormSrgb, &px);
        img.texture_descriptor.mip_level_count = 3;
        assert_eq!(check(&img), Err(PyramidError::AlreadyMipped));

        let mut img = image(1, 1, TextureFormat::Rgba8UnormSrgb, &px);
        img.data = None;
        assert_eq!(check(&img), Err(PyramidError::NoData));

        let mut img = image(1, 1, TextureFormat::Rgba8UnormSrgb, &px);
        assert_eq!(build_pyramid(&mut img), Ok(1));
        assert_eq!(img.data.as_ref().unwrap(), &[1, 2, 3, 4]);
    }
}
