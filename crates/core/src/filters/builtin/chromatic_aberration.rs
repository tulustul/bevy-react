//! The `chromaticAberration` built-in: directional RGB split.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;
use serde_json::Value;

use crate::animations::ValueKind;
use crate::filters::params::{ParamSlot, length_logical_px, static_layout};
use crate::filters::registry::{ReactFilter, ResolvedFilterPass, resolve_single_pass};
use crate::protocol::{Angle, Length};

fn default_offset() -> Length {
    Length::Px(4.0)
}

/// `chromaticAberration`: directional color fringing — the R channel's image
/// shifts `offset` px along `angle` (degrees, clockwise from +X in screen
/// space; bare number = degrees, `"0.25turn"` etc. accepted), B the same
/// distance opposite, G stays put. The split is uniform across the layer.
/// `{ name: "chromaticAberration" }` with no params is visible fringing
/// (shorthand-default convention); the true identity is `offset: 0`.
///
/// A single pass, packed as `params[0] = (offset_logical_px, angle_radians,
/// 0, 0)`; `resolve` only prepends the `Length` px validation before
/// delegating to the canonical [`resolve_single_pass`] body.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct ChromaticAberrationParams {
    // Mirrors `#[react_filter]`'s override for a `Length` field.
    #[serde(default = "default_offset")]
    #[ts(type = "number | string")]
    pub offset: Length,
    // Mirrors `#[react_filter]`'s override for an `Angle` field.
    #[serde(default)]
    #[ts(type = "number | string")]
    pub angle: Angle,
}

impl Default for ChromaticAberrationParams {
    fn default() -> Self {
        Self {
            offset: default_offset(),
            angle: Angle::default(),
        }
    }
}

fn chromatic_aberration_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "offset",
            kind: ValueKind::Length,
            vec: 0,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "angle",
            kind: ValueKind::Angle,
            vec: 0,
            comp: 1,
            len: 1,
        },
    ]
}

impl ReactFilter for ChromaticAberrationParams {
    const NAME: &'static str = "chromaticAberration";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "chromatic_aberration.wgsl")
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "offset": 0.0 }))
    }

    /// Fringes reach at most `offset` px past the silhouette (the shifted
    /// channels' translation distance).
    fn outset(&self) -> Result<f32, String> {
        length_logical_px(Self::NAME, "offset", self.offset)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        // `pack` is infallible, so a non-px offset falls back to 0 here —
        // but it can never reach the shader: `resolve`/`outset` reject it
        // first.
        (
            vec![Vec4::new(
                length_logical_px(Self::NAME, "offset", self.offset).unwrap_or(0.0),
                self.angle.radians(),
                0.0,
                0.0,
            )],
            chromatic_aberration_layout(),
        )
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        length_logical_px(Self::NAME, "offset", self.offset)?;
        resolve_single_pass(self, assets)
    }
}

#[cfg(test)]
mod tests {
    use std::f32::consts::PI;

    use serde_json::json;

    use super::*;
    use crate::filters::registry::FilterRegistry;
    use crate::filters::test_util::{asset_app, params};

    /// One pass: offset (logical px) at `params[0].x`, angle packed as
    /// radians at `params[0].y` (CSS angle decode: bare number = degrees),
    /// with Length + Angle slots for the physical rewrite and shortest-arc
    /// lerp.
    #[test]
    fn chromatic_aberration_resolves_to_one_pass() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<ChromaticAberrationParams>(json!({ "offset": 6, "angle": 90 }))
            .resolve(assets)
            .expect("chromaticAberration resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].params[0].x, 6.0);
        assert!((passes[0].params[0].y - PI / 2.0).abs() < 1e-5);
        assert_eq!(passes[0].wire_index, 0);
        assert_eq!(passes[0].layout[0].kind, ValueKind::Length);
        assert_eq!(passes[0].layout[0].name, "offset");
        assert_eq!(passes[0].layout[1].kind, ValueKind::Angle);
        assert_eq!(passes[0].layout[1].name, "angle");
    }

    /// Fringes bleed exactly 1x the offset; the default offset is 4px.
    #[test]
    fn chromatic_aberration_outset_is_the_offset() {
        assert_eq!(
            params::<ChromaticAberrationParams>(json!({ "offset": 6 })).outset(),
            Ok(6.0)
        );
        assert_eq!(
            params::<ChromaticAberrationParams>(json!({})).outset(),
            Ok(4.0)
        );
    }

    /// Empty params take the shorthand defaults: visible fringing along +X.
    #[test]
    fn chromatic_aberration_empty_params_default_to_visible_fringing() {
        let p = params::<ChromaticAberrationParams>(json!({}));
        assert_eq!(p, ChromaticAberrationParams::default());
        assert_eq!(p.offset, Length::Px(4.0));
        assert_eq!(p.angle.radians(), 0.0);
    }

    /// A non-px offset rejects from both baked registry fns, naming the
    /// offending unit — same contract as blur.
    #[test]
    fn non_px_offset_rejects_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<ChromaticAberrationParams>();
        let ca = &registry.entries["chromaticAberration"];

        let value = json!({ "offset": "50%" });
        let err = (ca.resolve)(&value, assets).expect_err("percent offset must reject resolve");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );
        let err = (ca.outset)(&value).expect_err("percent offset must reject outset");
        assert!(
            err.contains("px") && err.contains("%"),
            "names the unit: {err}"
        );

        // Bare numbers, explicit px, and turn-style angles stay accepted.
        assert!((ca.resolve)(&json!({ "offset": 6, "angle": "0.5turn" }), assets).is_ok());
        assert_eq!((ca.outset)(&json!({ "offset": "6px" })), Ok(6.0));
    }

    /// `deny_unknown_fields`: a typoed param rejects instead of silently
    /// falling back to the default.
    #[test]
    fn unknown_chromatic_aberration_param_rejects() {
        assert!(
            serde_json::from_value::<ChromaticAberrationParams>(json!({ "offse": 6 })).is_err()
        );
    }
}
