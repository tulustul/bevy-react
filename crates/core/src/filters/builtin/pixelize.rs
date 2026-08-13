//! The `pixelize` built-in morph filter: a port of gl-transitions'
//! `pixelize.glsl` (mosaic out, mosaic in). Like the other two morph
//! built-ins it blends the frozen "from" snapshot into the live content via
//! the prelude's morph helpers — single-pass, zero outset, premultiplied-
//! direct blending.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;

use crate::animations::ValueKind;
use crate::filters::params::{ParamSlot, static_layout};
use crate::filters::registry::{ReactFilter, ReactMorphFilter};

fn default_squares_min() -> [f32; 2] {
    [20.0, 20.0]
}

fn default_steps() -> f32 {
    50.0
}

/// `pixelize`: both images sample the center of a shared mosaic cell whose
/// size peaks mid-transition, over a plain progress crossfade. Upstream
/// uniforms map 1:1 — `squaresMin` (ivec2, the cell count when the mosaic is
/// coarsest) and `steps` (int, quantizes the cell-size ramp; `<= 0` disables
/// the stepping for a continuous ramp).
///
/// Packed as `params[0] = (squaresMin.x, squaresMin.y, steps, 0)`.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct PixelizeParams {
    /// Cells across x/y at the mosaic's coarsest (upstream `squaresMin`).
    #[serde(default = "default_squares_min", rename = "squaresMin")]
    pub squares_min: [f32; 2],
    /// Discrete cell-size levels; `<= 0` for a continuous ramp.
    #[serde(default = "default_steps")]
    pub steps: f32,
}

impl Default for PixelizeParams {
    fn default() -> Self {
        Self {
            squares_min: default_squares_min(),
            steps: default_steps(),
        }
    }
}

fn pixelize_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "squaresMin",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 0,
            len: 2,
        },
        ParamSlot {
            name: "steps",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 2,
            len: 1,
        },
    ]
}

impl ReactFilter for PixelizeParams {
    const NAME: &'static str = "pixelize";
    const IS_MORPH: bool = true;

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "pixelize.wgsl")
    }

    /// The mosaic never paints outside the box.
    fn outset(&self) -> Result<f32, String> {
        Ok(0.0)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        (
            vec![Vec4::new(
                self.squares_min[0],
                self.squares_min[1],
                self.steps,
                0.0,
            )],
            pixelize_layout(),
        )
    }
}

impl ReactMorphFilter for PixelizeParams {}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::test_util::{asset_app, params};

    /// Single zero-outset pass with the documented packing, user params
    /// confined to `params[0..6]` (morph-capable).
    #[test]
    fn pixelize_resolves_to_single_zero_outset_pass() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();

        let passes = params::<PixelizeParams>(json!({}))
            .resolve(assets)
            .expect("pixelize resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].params[0], Vec4::new(20.0, 20.0, 50.0, 0.0));
        assert!(passes[0].params.len() <= crate::filters::MORPH_MAX_USER_PARAM_VECS);
        assert_eq!(params::<PixelizeParams>(json!({})).outset(), Ok(0.0));

        let p = params::<PixelizeParams>(json!({ "squaresMin": [8, 4], "steps": 0 }));
        assert_eq!(p.pack().0[0], Vec4::new(8.0, 4.0, 0.0, 0.0));
        assert_eq!(p.pack().1[0].name, "squaresMin");
        assert_eq!(p.pack().1[1].name, "steps");
    }

    /// `deny_unknown_fields`, and the wire name is the camelCase
    /// `squaresMin` (serde rename — the field ident is snake_case).
    #[test]
    fn unknown_pixelize_params_reject() {
        assert!(
            serde_json::from_value::<PixelizeParams>(json!({ "squares_min": [4, 4] })).is_err()
        );
        assert!(serde_json::from_value::<PixelizeParams>(json!({ "blocks": 3 })).is_err());
    }
}
