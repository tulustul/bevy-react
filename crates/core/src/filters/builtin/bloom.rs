//! The `bloom` built-in: bright areas bleed light over their surroundings.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;
use serde_json::Value;

use crate::animations::ValueKind;
use crate::filters::builtin::BlurParams;
use crate::filters::params::{ParamSlot, length_logical_px, static_layout};
use crate::filters::registry::{ReactFilter, ResolvedFilterPass};
use crate::protocol::Length;

/// Bright-pass mode marker in `params[0].w` (see `bloom.wgsl`).
const MODE_BRIGHT: f32 = 0.0;
/// Combine mode marker in `params[0].w`.
const MODE_COMBINE: f32 = 1.0;

fn default_radius() -> Length {
    Length::Px(12.0)
}

fn default_threshold() -> f32 {
    0.7
}

fn default_intensity() -> f32 {
    1.0
}

/// `bloom`: glow where bright areas bleed light — a bright-pass thresholded
/// at `threshold`, blurred by `radius`, and added back onto the original
/// scaled by `intensity`. `{ name: "bloom" }` with no params is a visible
/// glow (shorthand-default convention); the true identity is `intensity: 0`.
///
/// `threshold` is a cut on **perceptual luminance** (`0..=1`, gamma-encoded —
/// how bright the color *looks*, not its linear energy); `1` blooms nothing,
/// `0` blooms everything.
///
/// Resolves to **four** passes: bright-pass (`bloom.wgsl`), blur H + V
/// (literally `blur.wgsl`, sharing the plain blur's pipeline), and a combine
/// (`bloom.wgsl`) that reads the original capture through the prelude's
/// always-bound `capture_texture`. All three named params ride every pass in
/// the same slots, so length rewriting and per-param animation bindings
/// (which write all passes of a wire entry) stay uniform; the mode switch is
/// pass-internal in `params[0].w`, like blur's direction.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct BloomParams {
    // Mirrors `#[react_filter]`'s override for a `Length` field.
    #[serde(default = "default_radius")]
    #[ts(type = "number | string")]
    pub radius: Length,
    #[serde(default = "default_threshold")]
    pub threshold: f32,
    #[serde(default = "default_intensity")]
    pub intensity: f32,
}

impl Default for BloomParams {
    fn default() -> Self {
        Self {
            radius: default_radius(),
            threshold: default_threshold(),
            intensity: default_intensity(),
        }
    }
}

fn bloom_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "radius",
            kind: ValueKind::Length,
            vec: 0,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "threshold",
            kind: ValueKind::Scalar,
            vec: 1,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "intensity",
            kind: ValueKind::Scalar,
            vec: 1,
            comp: 1,
            len: 1,
        },
    ]
}

impl ReactFilter for BloomParams {
    const NAME: &'static str = "bloom";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "bloom.wgsl")
    }

    fn identity_params() -> Option<Value> {
        // Deserializes through the struct, so radius/threshold take their
        // defaults; intensity 0 makes the combine pass return exactly the
        // original regardless of them.
        Some(serde_json::json!({ "intensity": 0.0 }))
    }

    /// Glow reach = blur reach: 3σ-style, like `blur`.
    fn outset(&self) -> Result<f32, String> {
        Ok(3.0 * length_logical_px(Self::NAME, "radius", self.radius)?)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        // The bright-pass's packing; `resolve` builds all four passes. `pack`
        // is infallible, so a non-px radius falls back to 0 here — but it can
        // never reach the shader: `resolve`/`outset` reject it first.
        let radius = length_logical_px(Self::NAME, "radius", self.radius).unwrap_or(0.0);
        (
            vec![
                Vec4::new(radius, 0.0, 0.0, MODE_BRIGHT),
                Vec4::new(self.threshold, self.intensity, 0.0, 0.0),
            ],
            bloom_layout(),
        )
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        let radius = length_logical_px(Self::NAME, "radius", self.radius)?;
        let bloom_shader = Self::shader(assets);
        let blur_shader = BlurParams::shader(assets);
        let named = Vec4::new(self.threshold, self.intensity, 0.0, 0.0);
        let pass = |shader: &Handle<Shader>, internal: (f32, f32, f32)| ResolvedFilterPass {
            shader: shader.clone(),
            params: vec![Vec4::new(radius, internal.0, internal.1, internal.2), named],
            layout: bloom_layout(),
            wire_index: 0,
        };
        Ok(vec![
            pass(&bloom_shader, (0.0, 0.0, MODE_BRIGHT)),
            pass(&blur_shader, (1.0, 0.0, 0.0)),
            pass(&blur_shader, (0.0, 1.0, 0.0)),
            pass(&bloom_shader, (0.0, 0.0, MODE_COMBINE)),
        ])
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::registry::FilterRegistry;
    use crate::filters::test_util::{asset_app, params};

    /// Bloom expands into bright-pass → blur H → blur V → combine, all
    /// `wire_index: 0`, with the named params (radius/threshold/intensity) in
    /// the same slots of every pass and the mode/direction components
    /// pass-internal.
    #[test]
    fn bloom_resolves_to_four_passes() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<BloomParams>(json!({
            "radius": 4, "threshold": 0.5, "intensity": 2
        }))
        .resolve(assets)
        .expect("bloom resolves");
        assert_eq!(passes.len(), 4);

        let named = Vec4::new(0.5, 2.0, 0.0, 0.0);
        assert_eq!(passes[0].params, vec![Vec4::new(4.0, 0.0, 0.0, 0.0), named]);
        assert_eq!(passes[1].params, vec![Vec4::new(4.0, 1.0, 0.0, 0.0), named]);
        assert_eq!(passes[2].params, vec![Vec4::new(4.0, 0.0, 1.0, 0.0), named]);
        assert_eq!(passes[3].params, vec![Vec4::new(4.0, 0.0, 0.0, 1.0), named]);
        assert!(passes.iter().all(|p| p.wire_index == 0));
        assert_eq!(passes[0].layout[0].kind, ValueKind::Length);

        // Bright-pass/combine share bloom's shader; the middle passes are
        // literally the blur shader (so they share its compiled pipeline).
        assert_eq!(passes[0].shader, passes[3].shader);
        assert_eq!(passes[1].shader, passes[2].shader);
        assert_eq!(passes[1].shader, BlurParams::shader(assets));
        assert_ne!(passes[0].shader, passes[1].shader);
    }

    /// Bloom bleeds 3x its blur radius, like `blur`; the default radius is
    /// 12px, so the no-params outset is 36 logical px.
    #[test]
    fn bloom_outset_is_three_radii() {
        assert_eq!(
            params::<BloomParams>(json!({ "radius": 4 })).outset(),
            Ok(12.0)
        );
        assert_eq!(params::<BloomParams>(json!({})).outset(), Ok(36.0));
    }

    /// Empty params take the shorthand defaults: a visible glow.
    #[test]
    fn bloom_empty_params_default_to_a_visible_glow() {
        let p = params::<BloomParams>(json!({}));
        assert_eq!(p, BloomParams::default());
        assert_eq!(p.radius, Length::Px(12.0));
        assert_eq!(p.threshold, 0.7);
        assert_eq!(p.intensity, 1.0);
    }

    /// A non-px bloom radius rejects from both baked registry fns, naming the
    /// offending unit — same contract as blur.
    #[test]
    fn non_px_bloom_radius_rejects_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<BloomParams>();
        let bloom = &registry.entries["bloom"];

        let value = json!({ "radius": "50%" });
        let err = (bloom.resolve)(&value, assets).expect_err("percent radius must reject resolve");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );
        let err = (bloom.outset)(&value).expect_err("percent radius must reject outset");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );

        // Bare numbers and explicit px stay accepted.
        assert!((bloom.resolve)(&json!({ "radius": 4 }), assets).is_ok());
        assert_eq!((bloom.outset)(&json!({ "radius": "4px" })), Ok(12.0));
    }

    /// `deny_unknown_fields`: a typoed param rejects instead of silently
    /// falling back to the defaults.
    #[test]
    fn unknown_bloom_param_rejects() {
        assert!(serde_json::from_value::<BloomParams>(json!({ "radiu": 4 })).is_err());
    }
}
