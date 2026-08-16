//! The `shadow` built-in: a blurred, offset drop shadow under the content.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;
use serde_json::Value;

use crate::animations::ValueKind;
use crate::filters::builtin::BlurParams;
use crate::filters::params::{FilterColor, ParamSlot, length_logical_px, static_layout};
use crate::filters::registry::{ReactFilter, ResolvedFilterPass};
use crate::protocol::units::Length;

/// Silhouette-prep mode marker in `params[0].w` (see `shadow.wgsl`).
const MODE_PREP: f32 = 0.0;
/// Combine mode marker in `params[0].w`.
const MODE_COMBINE: f32 = 1.0;

fn default_offset_y() -> Length {
    Length::Px(4.0)
}

fn default_spread() -> Length {
    Length::Px(6.0)
}

fn default_shadow_color() -> FilterColor {
    // Black at 60% alpha — a soft, visible shorthand default.
    FilterColor([0.0, 0.0, 0.0, 0.6])
}

/// `shadow`: a CSS-`drop-shadow`-style shadow — the content's alpha
/// silhouette, tinted `color`, shifted by `offsetX`/`offsetY` px (positive =
/// right/down), Gaussian-blurred by `spread`, composited UNDER the content.
/// `{ name: "shadow" }` with no params is a soft black shadow below
/// (shorthand-default convention); the true identity is
/// `color: "transparent"`.
///
/// Resolves to **four** passes, bloom's exact structure: silhouette-prep
/// (`shadow.wgsl` — offset + tint), blur H + V (literally `blur.wgsl`,
/// sharing the plain blur's pipeline — `spread` sits in blur's radius slot),
/// and a combine (`shadow.wgsl`) layering the original capture over the
/// blurred shadow through the prelude's always-bound `capture_texture`. Like
/// bloom, the combine reads the ORIGINAL capture — chain `shadow` first (or
/// alone) when combining with color ops. All named params ride every pass in
/// the same slots (uniform length rewriting + animation bindings — all four
/// are `{ animated }`-drivable); the mode switch is pass-internal in
/// `params[0].w`, like blur's direction.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct ShadowParams {
    #[serde(default = "default_shadow_color")]
    pub color: FilterColor,
    // Mirror `#[react_filter]`'s override for `Length` fields; offsets may be
    // negative (left/up).
    #[serde(default)]
    #[ts(type = "number | string")]
    pub offset_x: Length,
    #[serde(default = "default_offset_y")]
    #[ts(type = "number | string")]
    pub offset_y: Length,
    #[serde(default = "default_spread")]
    #[ts(type = "number | string")]
    pub spread: Length,
}

impl Default for ShadowParams {
    fn default() -> Self {
        Self {
            color: default_shadow_color(),
            offset_x: Length::Px(0.0),
            offset_y: default_offset_y(),
            spread: default_spread(),
        }
    }
}

fn shadow_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "spread",
            kind: ValueKind::Length,
            vec: 0,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "offsetX",
            kind: ValueKind::Length,
            vec: 1,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "offsetY",
            kind: ValueKind::Length,
            vec: 1,
            comp: 1,
            len: 1,
        },
        ParamSlot {
            name: "color",
            kind: ValueKind::Color,
            vec: 2,
            comp: 0,
            len: 4,
        },
    ]
}

impl ShadowParams {
    fn lengths_px(&self) -> Result<(f32, f32, f32), String> {
        Ok((
            length_logical_px(Self::NAME, "offsetX", self.offset_x)?,
            length_logical_px(Self::NAME, "offsetY", self.offset_y)?,
            length_logical_px(Self::NAME, "spread", self.spread)?,
        ))
    }
}

impl ReactFilter for ShadowParams {
    const NAME: &'static str = "shadow";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "shadow.wgsl")
    }

    fn identity_params() -> Option<Value> {
        // Deserializes through the struct, so offsets/spread take their
        // defaults; a fully transparent shadow makes the combine pass return
        // exactly the original regardless of them.
        Some(serde_json::json!({ "color": "transparent" }))
    }

    /// The shadow reaches its largest offset shift plus the blur bleed
    /// (3σ-style, like `blur`) past the silhouette.
    fn outset(&self) -> Result<f32, String> {
        let (offset_x, offset_y, spread) = self.lengths_px()?;
        Ok(offset_x.abs().max(offset_y.abs()) + 3.0 * spread)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        // The prep pass's packing; `resolve` builds all four passes. `pack`
        // is infallible, so non-px lengths fall back to 0 here — but they can
        // never reach the shader: `resolve`/`outset` reject them first.
        let (offset_x, offset_y, spread) = self.lengths_px().unwrap_or((0.0, 0.0, 0.0));
        (
            vec![
                Vec4::new(spread, 0.0, 0.0, MODE_PREP),
                Vec4::new(offset_x, offset_y, 0.0, 0.0),
                Vec4::from_array(self.color.0),
            ],
            shadow_layout(),
        )
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        let (offset_x, offset_y, spread) = self.lengths_px()?;
        let shadow_shader = Self::shader(assets);
        let blur_shader = BlurParams::shader(assets);
        let offsets = Vec4::new(offset_x, offset_y, 0.0, 0.0);
        let color = Vec4::from_array(self.color.0);
        let pass = |shader: &Handle<Shader>, internal: (f32, f32, f32)| ResolvedFilterPass {
            shader: shader.clone(),
            params: vec![
                Vec4::new(spread, internal.0, internal.1, internal.2),
                offsets,
                color,
            ],
            layout: shadow_layout(),
            wire_index: 0,
        };
        Ok(vec![
            pass(&shadow_shader, (0.0, 0.0, MODE_PREP)),
            pass(&blur_shader, (1.0, 0.0, 0.0)),
            pass(&blur_shader, (0.0, 1.0, 0.0)),
            pass(&shadow_shader, (0.0, 0.0, MODE_COMBINE)),
        ])
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::registry::FilterRegistry;
    use crate::filters::test_util::{asset_app, params};

    /// Shadow expands into prep → blur H → blur V → combine, all
    /// `wire_index: 0`, with the named params (spread/offsets/color) in the
    /// same slots of every pass — spread sits in blur's radius slot so the
    /// middle passes literally run the blur shader — and the mode/direction
    /// components pass-internal.
    #[test]
    fn shadow_resolves_to_four_passes() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<ShadowParams>(json!({
            "offsetX": 3, "offsetY": -2, "spread": 5, "color": "#ff0000",
        }))
        .resolve(assets)
        .expect("shadow resolves");
        assert_eq!(passes.len(), 4);

        let offsets = Vec4::new(3.0, -2.0, 0.0, 0.0);
        let color = Vec4::new(1.0, 0.0, 0.0, 1.0);
        assert_eq!(
            passes[0].params,
            vec![Vec4::new(5.0, 0.0, 0.0, 0.0), offsets, color]
        );
        assert_eq!(
            passes[1].params,
            vec![Vec4::new(5.0, 1.0, 0.0, 0.0), offsets, color]
        );
        assert_eq!(
            passes[2].params,
            vec![Vec4::new(5.0, 0.0, 1.0, 0.0), offsets, color]
        );
        assert_eq!(
            passes[3].params,
            vec![Vec4::new(5.0, 0.0, 0.0, 1.0), offsets, color]
        );
        assert!(passes.iter().all(|p| p.wire_index == 0));
        assert_eq!(passes[0].layout[0].name, "spread");
        assert_eq!(passes[0].layout[0].kind, ValueKind::Length);
        assert_eq!(passes[0].layout[3].kind, ValueKind::Color);

        // Prep/combine share shadow's shader; the middle passes are literally
        // the blur shader (so they share its compiled pipeline).
        assert_eq!(passes[0].shader, passes[3].shader);
        assert_eq!(passes[1].shader, passes[2].shader);
        assert_eq!(passes[1].shader, BlurParams::shader(assets));
        assert_ne!(passes[0].shader, passes[1].shader);
    }

    /// The shadow bleeds its largest |offset| plus 3x the spread; the
    /// defaults (offset 0/4, spread 6) give 22 logical px.
    #[test]
    fn shadow_outset_is_offset_plus_three_spreads() {
        assert_eq!(
            params::<ShadowParams>(json!({ "offsetX": -8, "offsetY": 2, "spread": 4 })).outset(),
            Ok(20.0)
        );
        assert_eq!(params::<ShadowParams>(json!({})).outset(), Ok(22.0));
    }

    /// Empty params take the shorthand defaults: a soft black shadow below.
    #[test]
    fn shadow_empty_params_default_to_a_soft_shadow() {
        let p = params::<ShadowParams>(json!({}));
        assert_eq!(p, ShadowParams::default());
        assert_eq!(p.offset_x, Length::Px(0.0));
        assert_eq!(p.offset_y, Length::Px(4.0));
        assert_eq!(p.spread, Length::Px(6.0));
        assert_eq!(p.color.0, [0.0, 0.0, 0.0, 0.6]);
    }

    /// The true identity is a fully transparent shadow; it deserializes
    /// cleanly and packs a zero-alpha color slot.
    #[test]
    fn identity_is_a_transparent_shadow() {
        let identity = ShadowParams::identity_params().expect("has identity");
        let p: ShadowParams = serde_json::from_value(identity).expect("identity decodes");
        assert_eq!(p.color.0, [0.0, 0.0, 0.0, 0.0]);
        assert_eq!(p.pack().0[2], Vec4::ZERO);
    }

    /// Non-px offsets/spread reject from both baked registry fns, naming the
    /// unit — same contract as blur.
    #[test]
    fn non_px_lengths_reject_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<ShadowParams>();
        let entry = &registry.entries["shadow"];

        for value in [
            json!({ "offsetX": "50%" }),
            json!({ "offsetY": "2vw" }),
            json!({ "spread": "1vh" }),
        ] {
            let err = (entry.resolve)(&value, assets).expect_err("non-px must reject resolve");
            assert!(err.contains("px"), "names the unit: {err}");
            let err = (entry.outset)(&value).expect_err("non-px must reject outset");
            assert!(err.contains("px"), "names the unit: {err}");
        }
        assert!((entry.resolve)(&json!({ "offsetX": -6, "spread": "3px" }), assets).is_ok());
        assert_eq!(
            (entry.outset)(&json!({ "offsetY": -10, "spread": 2 })),
            Ok(16.0)
        );
    }

    /// `deny_unknown_fields`: a typoed param rejects.
    #[test]
    fn unknown_shadow_param_rejects() {
        assert!(serde_json::from_value::<ShadowParams>(json!({ "offsetx": 2 })).is_err());
    }
}
