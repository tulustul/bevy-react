//! The `blur` built-in: a two-pass separable Gaussian.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;
use serde_json::Value;

use crate::animations::ValueKind;
use crate::filters::params::{ParamSlot, length_logical_px, static_layout};
use crate::filters::registry::{ReactFilter, ResolvedFilterPass};
use crate::protocol::units::Length;

/// `blur`: separable Gaussian blur. `radius` defaults to `0` — CSS `blur()`
/// with the value omitted means `0` (identity).
///
/// Resolves to **two** passes, horizontal then vertical, each packed as
/// `params[0] = (radius_logical_px, dir.x, dir.y, 0)` with dir `(1,0)` then
/// `(0,1)`. Only the radius is a named (layout-exposed) param — the direction
/// components are pass-internal.
#[derive(Debug, Clone, Copy, PartialEq, Default, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct BlurParams {
    // Mirrors `#[react_filter]`'s override for a `Length` field.
    #[serde(default)]
    #[ts(type = "number | string")]
    pub radius: Length,
}

fn blur_layout() -> Arc<[ParamSlot]> {
    static_layout![ParamSlot {
        name: "radius",
        kind: ValueKind::Length,
        vec: 0,
        comp: 0,
        len: 1,
    }]
}

impl ReactFilter for BlurParams {
    const NAME: &'static str = "blur";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "blur.wgsl")
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "radius": 0.0 }))
    }

    /// 3σ-style reach: a Gaussian of radius `r` is visually gone past `3r`.
    fn outset(&self) -> Result<f32, String> {
        Ok(3.0 * length_logical_px(Self::NAME, "radius", self.radius)?)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        // The horizontal pass's packing; `resolve` builds both directions.
        // `pack` is infallible, so a non-px radius falls back to 0 here — but
        // it can never reach the shader: `resolve`/`outset` reject it first.
        (
            vec![Vec4::new(
                length_logical_px(Self::NAME, "radius", self.radius).unwrap_or(0.0),
                1.0,
                0.0,
                0.0,
            )],
            blur_layout(),
        )
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        let radius = length_logical_px(Self::NAME, "radius", self.radius)?;
        let shader = Self::shader(assets);
        let pass = |dir: (f32, f32)| ResolvedFilterPass {
            shader: shader.clone(),
            params: vec![Vec4::new(radius, dir.0, dir.1, 0.0)],
            layout: blur_layout(),
            wire_index: 0,
        };
        Ok(vec![pass((1.0, 0.0)), pass((0.0, 1.0))])
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::registry::FilterRegistry;
    use crate::filters::test_util::{asset_app, params};

    /// Blur expands into exactly two separable passes — horizontal `(1,0)`
    /// then vertical `(0,1)` — radius (logical px) in `params[0].x`, both
    /// tagged `wire_index: 0` for the chain resolver to rewrite.
    #[test]
    fn blur_resolves_to_two_directional_passes() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<BlurParams>(json!({ "radius": 4 }))
            .resolve(assets)
            .expect("blur resolves");
        assert_eq!(passes.len(), 2);
        assert_eq!(passes[0].params, vec![Vec4::new(4.0, 1.0, 0.0, 0.0)]);
        assert_eq!(passes[1].params, vec![Vec4::new(4.0, 0.0, 1.0, 0.0)]);
        assert!(passes.iter().all(|p| p.wire_index == 0));
        assert_eq!(passes[0].layout[0].kind, ValueKind::Length);
    }

    /// Blur bleeds 3x its radius (Gaussian reach) in logical px.
    #[test]
    fn blur_outset_is_three_radii() {
        assert_eq!(
            params::<BlurParams>(json!({ "radius": 4 })).outset(),
            Ok(12.0)
        );
        assert_eq!(params::<BlurParams>(json!({})).outset(), Ok(0.0));
    }

    /// A non-px blur radius (`"50%"`, `"1vw"`, ...) rejects from both baked
    /// registry fns — resolve and outset — naming the offending unit, instead
    /// of silently packing `0.0`.
    #[test]
    fn non_px_blur_radius_rejects_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<BlurParams>();
        let blur = &registry.entries["blur"];

        let value = json!({ "radius": "50%" });
        let err = (blur.resolve)(&value, assets).expect_err("percent radius must reject resolve");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );
        let err = (blur.outset)(&value).expect_err("percent radius must reject outset");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );

        let err = (blur.outset)(&json!({ "radius": "1vw" })).expect_err("vw radius must reject");
        assert!(err.contains("vw"), "names the unit: {err}");

        // Bare numbers and explicit px stay accepted.
        assert!((blur.resolve)(&json!({ "radius": 4 }), assets).is_ok());
        assert_eq!((blur.outset)(&json!({ "radius": "4px" })), Ok(12.0));
    }
}
