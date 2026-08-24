//! The `pinch` built-in: cursor-anchored radial pinch/bulge.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;
use serde_json::Value;

use crate::animations::ValueKind;
use crate::filters::params::{ParamSlot, static_layout};
use crate::filters::registry::ReactFilter;
use crate::protocol::units::Angle;

fn default_center() -> f32 {
    0.5
}

fn default_strength() -> f32 {
    0.5
}

fn default_radius() -> f32 {
    0.8
}

/// Top-left, the usual UI light convention (clockwise from +X, y-down:
/// -90 is straight up, so -135 is up-and-left).
fn default_light_angle() -> Angle {
    Angle::from_radians((-135f32).to_radians())
}

/// A tight-ish button highlight (a Blinn-Phong exponent of ~32).
fn default_gloss_size() -> f32 {
    0.3
}

/// Rim/center softness 0.5 each is the classic-feeling falloff (a `u^2` onset
/// into a rounded bowl, within a hair of smoothstep).
fn default_softness() -> f32 {
    0.5
}

/// Extra logical px the bulge (or a press-spring overshoot) may poke past the
/// node's box. A constant: the params are normalized, so a px reach cannot be
/// derived from them at resolve time — a bulge displacing further than this
/// (roughly `0.26 * |strength| * radius * node_size`) clips at a straight
/// layer edge.
const PINCH_OUTSET: f32 = 16.0;

/// `pinch`: radially squeezes the content toward a point (`strength` > 0) or
/// magnifies it away (`strength` < 0). Every param is normalized — `x`/`y`
/// are 0..1 across the node rect (exactly what pointer events deliver),
/// `radius` a fraction of the node's larger dimension, `strength` -1..=1
/// (clamped in the shader) — so the effect self-scales to any node with no
/// px math in app code. `{ name: "pinch" }` with no params is a visible
/// center squeeze (shorthand-default convention); the true identity is
/// `strength: 0`.
///
/// The optional lighting treats the pinch as a lit height field: the
/// displacement curve doubles as a surface, shaded Lambert + Blinn-Phong
/// from a 2D light direction at a fixed elevation. A dimple (pinch) and a
/// dome (bulge) light oppositely by construction, and `strength: 0` is a
/// flat surface — the light params shade nothing, so the identity contract
/// holds regardless of them. `light`/`gloss` default to 0: an unlit pinch
/// renders exactly as before they existed.
///
/// A single pass, packed as `params[0] = (x, y, strength, radius)`,
/// `params[1] = (light, lightAngle_radians, gloss, glossSize)` and
/// `params[2] = (outerSoftness, innerSoftness, 0, 0)`.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct PinchParams {
    /// Pinch center, 0..1 across the node rect (0 = left edge).
    #[serde(default = "default_center")]
    pub x: f32,
    /// Pinch center, 0..1 across the node rect (0 = top edge).
    #[serde(default = "default_center")]
    pub y: f32,
    /// -1 (full bulge) ..= 1 (full pinch); 0 is identity.
    #[serde(default = "default_strength")]
    pub strength: f32,
    /// Effect radius as a fraction of the node's larger dimension.
    #[serde(default = "default_radius")]
    pub radius: f32,
    /// Diffuse shading intensity: 0 (unlit, the default), 1 nominal; larger
    /// values overdrive, like `brightness`.
    #[serde(default)]
    pub light: f32,
    /// Direction the light comes FROM: degrees clockwise from +X in screen
    /// space (bare number = degrees, `"0.25turn"` etc. accepted). Default
    /// -135 = top-left.
    // Mirrors `#[react_filter]`'s override for an `Angle` field.
    #[serde(default = "default_light_angle")]
    #[ts(type = "number | string")]
    pub light_angle: Angle,
    /// Specular (white) highlight intensity: 0 (off, the default), 1
    /// nominal; larger values overdrive.
    #[serde(default)]
    pub gloss: f32,
    /// Size of the specular highlight, 0 (a pinpoint) ..= 1 (a broad sheen);
    /// default 0.3. Mapped log-wise onto a Blinn-Phong exponent in the shader
    /// (128 at 0, ~32 at 0.3, 1 at 1).
    #[serde(default = "default_gloss_size")]
    pub gloss_size: f32,
    /// How the effect meets its rim, 0..=1: 0 is a linear onset (a visible
    /// crease, like a pressed coin edge), 0.5 (the default) the classic `u^2`
    /// smoothstep-like fade, 1 an imperceptible `u^4` fade-in.
    #[serde(default = "default_softness")]
    pub outer_softness: f32,
    /// How the effect peaks at its center, 0..=1: 0 is a cone tip (a pointed
    /// pit/peak the lighting shows as a point), 0.5 (the default) a rounded
    /// bowl, 1 a broad flat floor. Independent of `outerSoftness`: the
    /// profile is `1 - (1 - u^a)^b` with `a`/`b` from the two knobs.
    #[serde(default = "default_softness")]
    pub inner_softness: f32,
}

impl Default for PinchParams {
    fn default() -> Self {
        Self {
            x: default_center(),
            y: default_center(),
            strength: default_strength(),
            radius: default_radius(),
            light: 0.0,
            light_angle: default_light_angle(),
            gloss: 0.0,
            gloss_size: default_gloss_size(),
            outer_softness: default_softness(),
            inner_softness: default_softness(),
        }
    }
}

fn pinch_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "x",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "y",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 1,
            len: 1,
        },
        ParamSlot {
            name: "strength",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 2,
            len: 1,
        },
        ParamSlot {
            name: "radius",
            kind: ValueKind::Scalar,
            vec: 0,
            comp: 3,
            len: 1,
        },
        ParamSlot {
            name: "light",
            kind: ValueKind::Scalar,
            vec: 1,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "lightAngle",
            kind: ValueKind::Angle,
            vec: 1,
            comp: 1,
            len: 1,
        },
        ParamSlot {
            name: "gloss",
            kind: ValueKind::Scalar,
            vec: 1,
            comp: 2,
            len: 1,
        },
        ParamSlot {
            name: "glossSize",
            kind: ValueKind::Scalar,
            vec: 1,
            comp: 3,
            len: 1,
        },
        ParamSlot {
            name: "outerSoftness",
            kind: ValueKind::Scalar,
            vec: 2,
            comp: 0,
            len: 1,
        },
        ParamSlot {
            name: "innerSoftness",
            kind: ValueKind::Scalar,
            vec: 2,
            comp: 1,
            len: 1,
        },
    ]
}

impl ReactFilter for PinchParams {
    const NAME: &'static str = "pinch";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "pinch.wgsl")
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "strength": 0.0 }))
    }

    fn outset(&self) -> Result<f32, String> {
        Ok(PINCH_OUTSET)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        (
            vec![
                Vec4::new(self.x, self.y, self.strength, self.radius),
                Vec4::new(
                    self.light,
                    self.light_angle.radians(),
                    self.gloss,
                    self.gloss_size,
                ),
                Vec4::new(self.outer_softness, self.inner_softness, 0.0, 0.0),
            ],
            pinch_layout(),
        )
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::test_util::{asset_app, params};

    /// One pass: `params[0] = (x, y, strength, radius)`,
    /// `params[1] = (light, lightAngle_radians, gloss, glossSize)` and
    /// `params[2] = (outerSoftness, innerSoftness, 0, 0)` — ten slots, all
    /// scalar except `lightAngle`
    /// (an Angle slot: degrees on the wire, radians in the uniform).
    /// Per-param transitions and `{ animated }` bindings address them by name.
    #[test]
    fn pinch_resolves_to_one_pass() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<PinchParams>(json!({
            "x": 0.25, "y": 0.75, "strength": -0.5, "radius": 1.0,
            "light": 0.6, "lightAngle": 90, "gloss": 0.4, "glossSize": 0.8,
            "outerSoftness": 0.7, "innerSoftness": 0.2,
        }))
        .resolve(assets)
        .expect("pinch resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].params[0], Vec4::new(0.25, 0.75, -0.5, 1.0));
        assert_eq!(
            passes[0].params[1],
            Vec4::new(0.6, std::f32::consts::FRAC_PI_2, 0.4, 0.8)
        );
        assert_eq!(passes[0].params[2], Vec4::new(0.7, 0.2, 0.0, 0.0));
        assert_eq!(passes[0].wire_index, 0);
        let names: Vec<_> = passes[0].layout.iter().map(|s| s.name).collect();
        assert_eq!(
            names,
            [
                "x",
                "y",
                "strength",
                "radius",
                "light",
                "lightAngle",
                "gloss",
                "glossSize",
                "outerSoftness",
                "innerSoftness"
            ]
        );
        for slot in passes[0].layout.iter() {
            let expected = if slot.name == "lightAngle" {
                ValueKind::Angle
            } else {
                ValueKind::Scalar
            };
            assert_eq!(slot.kind, expected, "{}", slot.name);
            assert_eq!(slot.len, 1, "{}", slot.name);
        }
    }

    /// `lightAngle` takes the CSS angle decode like every other Angle param:
    /// `"0.25turn"` is a quarter turn, not a rejected string.
    #[test]
    fn pinch_light_angle_accepts_css_units() {
        let turn = params::<PinchParams>(json!({ "lightAngle": "0.25turn" }));
        assert!((turn.light_angle.radians() - std::f32::consts::FRAC_PI_2).abs() < 1e-6);
    }

    /// The outset is a params-independent constant (normalized params carry
    /// no px reach) sized for the bulge ring.
    #[test]
    fn pinch_outset_is_constant() {
        assert_eq!(params::<PinchParams>(json!({})).outset(), Ok(PINCH_OUTSET));
        assert_eq!(
            params::<PinchParams>(json!({ "strength": -1.0, "radius": 1.5 })).outset(),
            Ok(PINCH_OUTSET)
        );
    }

    /// Empty params take the shorthand defaults: a visible squeeze at the
    /// node's center, UNLIT — `light`/`gloss` default to 0 so a pre-lighting
    /// `{ name: "pinch" }` renders pixel-identically; the light direction
    /// defaults to top-left.
    #[test]
    fn pinch_empty_params_default_to_visible_unlit_squeeze() {
        let p = params::<PinchParams>(json!({}));
        assert_eq!(p, PinchParams::default());
        assert_eq!((p.x, p.y), (0.5, 0.5));
        assert_eq!(p.strength, 0.5);
        assert_eq!(p.radius, 0.8);
        assert_eq!(p.light, 0.0);
        assert_eq!(p.gloss, 0.0);
        assert_eq!(p.gloss_size, 0.3);
        assert!((p.light_angle.radians() - (-135f32).to_radians()).abs() < 1e-6);
        // Rim/center softness at 0.5 each: the classic-feeling falloff.
        assert_eq!((p.outer_softness, p.inner_softness), (0.5, 0.5));
        let (packed, _) = p.pack();
        assert_eq!(packed.len(), 3);
        assert_eq!(packed[1].x, 0.0);
        assert_eq!(packed[1].z, 0.0);
        assert_eq!(packed[2], Vec4::new(0.5, 0.5, 0.0, 0.0));
    }

    /// `deny_unknown_fields`: a typoed param rejects instead of silently
    /// falling back to the default.
    #[test]
    fn unknown_pinch_param_rejects() {
        assert!(serde_json::from_value::<PinchParams>(json!({ "strengt": 1 })).is_err());
    }
}
