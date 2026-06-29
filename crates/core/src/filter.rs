//! A CSS-like `filter` for UI nodes, implemented with a custom [`UiMaterial`].
//!
//! `bevy_ui` has no native filter support, but Bevy 0.19 lets a UI node render
//! through a custom shader via [`UiMaterial`] + [`MaterialNode`]. When a style
//! carries [`crate::protocol::FilterSpec`], the reconciler swaps the node's normal
//! `ImageNode` / `BackgroundColor` draw for a [`MaterialNode<FilterMaterial>`]
//! whose fragment shader (`filter.wgsl`) samples the node's source texture (an
//! `<image>`, or a shared 1x1 white pixel for a solid-colored node) and applies a
//! Gaussian blur + color matrix.
//!
//! **Scope:** a `UiMaterial` renders only the node's *own* surface — it does not
//! composite the node's children/text through the shader, so `filter` does not
//! cascade to descendants the way CSS does. It is most useful on `<image>` /
//! leaf nodes (blur/grayscale/saturate an image or icon).

use bevy::asset::RenderAssetUsages;
use bevy::image::Image;
use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use bevy::render::render_resource::{AsBindGroup, Extent3d, TextureDimension, TextureFormat};
use bevy::shader::ShaderRef;

use crate::protocol::{Angle, FilterSpec};

/// The custom UI material that applies a CSS-like `filter`. The four `Vec4`
/// uniforms pack the filter parameters (see `filter.wgsl` for the layout); the
/// texture is the node's source image, or the shared white pixel for a solid
/// color tinted by `base_color`.
#[derive(Asset, AsBindGroup, Reflect, Clone, Default)]
pub struct FilterMaterial {
    /// rgba tint multiplied with the sampled texel (image tint / solid background,
    /// with `opacity` folded into alpha).
    #[uniform(0)]
    pub base_color: Vec4,
    /// `x` = brightness, `y` = contrast, `z` = saturate, `w` = grayscale.
    #[uniform(1)]
    pub color: Vec4,
    /// `x` = sepia, `y` = invert, `z` = hue rotation (radians), `w` = unused.
    #[uniform(2)]
    pub color2: Vec4,
    /// `x` = blur radius in node pixels, `yzw` = unused.
    #[uniform(3)]
    pub blur: Vec4,
    #[texture(4)]
    #[sampler(5)]
    pub texture: Handle<Image>,
}

impl UiMaterial for FilterMaterial {
    fn fragment_shader() -> ShaderRef {
        // The shader is embedded by `embedded_asset!(app, "filter.wgsl")` in the
        // plugin; the crate (lib name `bevy_react`) prefixes the embedded path.
        "embedded://bevy_react/filter.wgsl".into()
    }
}

/// Build a [`FilterMaterial`] from a wire [`FilterSpec`], its source `texture`,
/// and the `base` color (image tint or background color, opacity already folded
/// into alpha). Unset filter functions use their identity value so a no-op filter
/// leaves the pixel untouched.
pub fn filter_material(spec: &FilterSpec, texture: Handle<Image>, base: Color) -> FilterMaterial {
    let base_color = Vec4::from_array(base.to_linear().to_f32_array());
    FilterMaterial {
        base_color,
        color: Vec4::new(
            spec.brightness.unwrap_or(1.0),
            spec.contrast.unwrap_or(1.0),
            spec.saturate.unwrap_or(1.0),
            spec.grayscale.unwrap_or(0.0),
        ),
        color2: Vec4::new(
            spec.sepia.unwrap_or(0.0),
            spec.invert.unwrap_or(0.0),
            spec.hue_rotate.map(Angle::radians).unwrap_or(0.0),
            0.0,
        ),
        blur: Vec4::new(
            spec.blur
                .map(crate::ui_map::length_to_val)
                .map(val_px)
                .unwrap_or(0.0),
            0.0,
            0.0,
            0.0,
        ),
        texture,
    }
}

/// Resolve a blur [`Val`] to a pixel radius. Only `Px` is meaningful for a blur
/// radius (percent/auto have no fixed pixel size here), so anything else is `0`.
fn val_px(v: Val) -> f32 {
    match v {
        Val::Px(px) => px,
        _ => 0.0,
    }
}

/// The shared 1x1 white texture used as the `FilterMaterial` source for nodes
/// without a source image (solid-colored `<node>`/`<button>`): the shader
/// multiplies it by `base_color`, so the node renders its (filtered) color.
#[derive(Resource)]
pub struct FilterAssets {
    pub white: Handle<Image>,
}

/// Caches one [`FilterMaterial`] asset per unique (texture, params) combination so
/// repeated `Op::Update`s of a filtered node don't leak a fresh material asset
/// every re-render — mirroring [`crate::ui_map::AtlasLayoutCache`]. A static
/// filter resolves to one cache hit and one shared handle.
#[derive(Resource, Default)]
pub struct FilterMaterialCache(HashMap<FilterKey, Handle<FilterMaterial>>);

/// The identity of a [`FilterMaterial`]: its source texture plus every packed
/// uniform value (as raw bits, so `f32`s hash/compare exactly).
#[derive(PartialEq, Eq, Hash)]
struct FilterKey {
    texture: AssetId<Image>,
    bits: [u32; 16],
}

impl FilterKey {
    fn of(mat: &FilterMaterial) -> Self {
        let mut bits = [0u32; 16];
        for (slot, v) in [mat.base_color, mat.color, mat.color2, mat.blur]
            .iter()
            .enumerate()
        {
            bits[slot * 4..slot * 4 + 4].copy_from_slice(&v.to_array().map(f32::to_bits));
        }
        FilterKey {
            texture: mat.texture.id(),
            bits,
        }
    }
}

impl FilterMaterialCache {
    /// Get (or create and cache) the shared handle for `mat`.
    pub fn handle(
        &mut self,
        materials: &mut Assets<FilterMaterial>,
        mat: FilterMaterial,
    ) -> Handle<FilterMaterial> {
        self.0
            .entry(FilterKey::of(&mat))
            .or_insert_with(|| materials.add(mat))
            .clone()
    }
}

/// Create the shared 1x1 white pixel for solid-color filtered nodes, before the
/// first `apply_js_ops` can mount one. Runs in `Startup`.
pub fn init_filter_assets(mut commands: Commands, mut images: ResMut<Assets<Image>>) {
    let white = images.add(Image::new_fill(
        Extent3d {
            width: 1,
            height: 1,
            depth_or_array_layers: 1,
        },
        TextureDimension::D2,
        &[255, 255, 255, 255],
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::RENDER_WORLD,
    ));
    commands.insert_resource(FilterAssets { white });
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::Style;

    /// An identity filter (every function unset) packs identity uniforms, so the
    /// shader leaves pixels untouched.
    #[test]
    fn empty_filter_is_identity() {
        let spec = FilterSpec::default();
        let mat = filter_material(&spec, Handle::default(), Color::WHITE);
        // brightness=1, contrast=1, saturate=1, grayscale=0
        assert_eq!(mat.color, Vec4::new(1.0, 1.0, 1.0, 0.0));
        // sepia=0, invert=0, hue=0
        assert_eq!(mat.color2, Vec4::new(0.0, 0.0, 0.0, 0.0));
        assert_eq!(mat.blur.x, 0.0);
    }

    /// The filter functions land in the documented uniform slots, and a `blur`
    /// length resolves to its pixel radius.
    #[test]
    fn packs_functions_into_uniform_slots() {
        let style: Style = serde_json::from_str(
            r#"{ "filter": {
                "blur": "4px", "brightness": 1.2, "contrast": 0.8,
                "saturate": 1.5, "grayscale": 0.25, "sepia": 0.5,
                "invert": 1, "hueRotate": 180
            } }"#,
        )
        .unwrap();
        let mat = filter_material(&style.filter.unwrap(), Handle::default(), Color::WHITE);
        assert_eq!(mat.color, Vec4::new(1.2, 0.8, 1.5, 0.25));
        assert!((mat.color2.x - 0.5).abs() < 1e-6); // sepia
        assert!((mat.color2.y - 1.0).abs() < 1e-6); // invert
        assert!((mat.color2.z - std::f32::consts::PI).abs() < 1e-5); // hueRotate 180deg
        assert_eq!(mat.blur.x, 4.0);
    }

    /// Materials with identical (texture, params) share one cached handle; a
    /// differing param mints a new one.
    #[test]
    fn cache_dedupes_by_texture_and_params() {
        let mut materials = Assets::<FilterMaterial>::default();
        let mut cache = FilterMaterialCache::default();
        let spec: FilterSpec = serde_json::from_str(r#"{ "grayscale": 1 }"#).unwrap();

        let a = cache.handle(
            &mut materials,
            filter_material(&spec, Handle::default(), Color::WHITE),
        );
        let b = cache.handle(
            &mut materials,
            filter_material(&spec, Handle::default(), Color::WHITE),
        );
        assert_eq!(a, b, "same inputs reuse one handle");
        assert_eq!(materials.len(), 1);

        let other: FilterSpec = serde_json::from_str(r#"{ "grayscale": 0.5 }"#).unwrap();
        let c = cache.handle(
            &mut materials,
            filter_material(&other, Handle::default(), Color::WHITE),
        );
        assert_ne!(a, c, "different params mint a new handle");
        assert_eq!(materials.len(), 2);
    }
}
