//! The two built-in morph (two-input) filters: `crossfade` and `linearWipe`.
//!
//! Both blend the frozen "from" snapshot into the live "to" content via the
//! prelude's morph helpers (`morph_sample_from` / `morph_sample_to` /
//! `morph_progress` — see `layer/filter_prelude.wgsl` for the reserved-param
//! and progress-1 identity contracts). Single-pass by construction (the morph
//! resolver rejects multi-pass entries), zero outset (neither paints outside
//! the box), premultiplied-direct blending (a lerp of premultiplied colors is
//! the linear-interpolation-safe crossfade).

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;

use crate::animations::ValueKind;
use crate::filters::params::{ParamSlot, length_logical_px, static_layout};
use crate::filters::registry::{
    ReactFilter, ReactMorphFilter, ResolvedFilterPass, resolve_single_pass,
};
use crate::protocol::{units::Angle, units::Length};

/// `crossfade`: the plain morph — `mix(from, to, progress)`. No params; the
/// engine-owned progress is the whole effect.
#[derive(Debug, Clone, Copy, PartialEq, Default, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct CrossfadeParams {}

impl ReactFilter for CrossfadeParams {
    const NAME: &'static str = "crossfade";
    const IS_MORPH: bool = true;

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "crossfade.wgsl")
    }

    fn outset(&self) -> Result<f32, String> {
        Ok(0.0)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        // No params at all — an empty pack and an empty slot layout.
        (Vec::new(), Vec::new().into())
    }
}

impl ReactMorphFilter for CrossfadeParams {}

fn default_softness() -> Length {
    Length::Px(0.0)
}

/// `linearWipe`: the "to" image sweeps in along `angle` (degrees, clockwise
/// from +X in screen space, like every angle in the system; 0 wipes
/// left-to-right, 90 top-to-bottom), with a `softness`-px eased band around
/// the wipe edge. The sweep is extended by the band at both ends so progress
/// 0 is fully "from" and progress 1 exactly the live content (the identity
/// contract).
///
/// A single pass, packed as `params[0] = (angle_radians, softness_logical_px,
/// 0, 0)`; `resolve` prepends the `Length` px validation before delegating to
/// [`resolve_single_pass`] (the default would skip it).
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct LinearWipeParams {
    #[serde(default)]
    #[ts(type = "number | string")]
    pub angle: Angle,
    #[serde(default = "default_softness")]
    #[ts(type = "number | string")]
    pub softness: Length,
}

impl Default for LinearWipeParams {
    fn default() -> Self {
        Self {
            angle: Angle::default(),
            softness: default_softness(),
        }
    }
}

fn linear_wipe_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "angle",
            kind: ValueKind::Angle,
            vec: 0,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "softness",
            kind: ValueKind::Length,
            vec: 0,
            comp: 1,
            len: 1,
        },
    ]
}

impl ReactFilter for LinearWipeParams {
    const NAME: &'static str = "linearWipe";
    const IS_MORPH: bool = true;

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "linear_wipe.wgsl")
    }

    /// The wipe never paints outside the box.
    fn outset(&self) -> Result<f32, String> {
        Ok(0.0)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        (
            vec![Vec4::new(
                self.angle.radians(),
                // Infallible here; a non-px softness was rejected by
                // `resolve` before this can matter.
                length_logical_px(Self::NAME, "softness", self.softness).unwrap_or(0.0),
                0.0,
                0.0,
            )],
            linear_wipe_layout(),
        )
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        length_logical_px(Self::NAME, "softness", self.softness)?;
        resolve_single_pass(self, assets)
    }
}

impl ReactMorphFilter for LinearWipeParams {}

#[cfg(test)]
mod tests {
    use std::f32::consts::PI;

    use serde_json::json;

    use super::*;
    use crate::filters::test_util::{asset_app, builtin_registry, params};

    /// Both morph built-ins resolve to exactly ONE pass (the morph resolver's
    /// hard requirement) with the documented packing, zero outset, and user
    /// params confined to `params[0..6]` (the engine-reserved tail).
    #[test]
    fn morph_builtins_resolve_to_single_zero_outset_passes() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();

        let passes = params::<CrossfadeParams>(json!({}))
            .resolve(assets)
            .expect("crossfade resolves");
        assert_eq!(passes.len(), 1);
        assert!(passes[0].params.is_empty());
        assert_eq!(params::<CrossfadeParams>(json!({})).outset(), Ok(0.0));

        let passes = params::<LinearWipeParams>(json!({ "angle": 90, "softness": 12 }))
            .resolve(assets)
            .expect("linearWipe resolves");
        assert_eq!(passes.len(), 1);
        assert!((passes[0].params[0].x - PI / 2.0).abs() < 1e-5);
        assert_eq!(passes[0].params[0].y, 12.0);
        assert!(passes[0].params.len() <= crate::filters::MORPH_MAX_USER_PARAM_VECS);
        assert_eq!(passes[0].layout[0].kind, ValueKind::Angle);
        assert_eq!(passes[0].layout[1].kind, ValueKind::Length);
        assert_eq!(
            params::<LinearWipeParams>(json!({ "softness": 12 })).outset(),
            Ok(0.0)
        );
    }

    /// A non-px softness rejects through the registry's baked resolve (the
    /// override — the default body skips `Length` validation).
    #[test]
    fn non_px_softness_rejects_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let registry = builtin_registry();
        let err = (registry.entries["linearWipe"].resolve)(&json!({ "softness": "50%" }), assets)
            .expect_err("percent softness must reject");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );
        assert!(
            (registry.entries["crossfade"].resolve)(&json!({}), assets).is_ok(),
            "crossfade takes no params"
        );
    }

    /// `deny_unknown_fields` on both param structs.
    #[test]
    fn unknown_morph_builtin_params_reject() {
        assert!(serde_json::from_value::<CrossfadeParams>(json!({ "speed": 1 })).is_err());
        assert!(serde_json::from_value::<LinearWipeParams>(json!({ "angel": 90 })).is_err());
    }
}
