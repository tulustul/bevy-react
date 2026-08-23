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

fn default_center() -> f32 {
    0.5
}

fn default_strength() -> f32 {
    0.5
}

fn default_radius() -> f32 {
    0.8
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
/// A single pass, packed as `params[0] = (x, y, strength, radius)`.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
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
}

impl Default for PinchParams {
    fn default() -> Self {
        Self {
            x: default_center(),
            y: default_center(),
            strength: default_strength(),
            radius: default_radius(),
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
            vec![Vec4::new(self.x, self.y, self.strength, self.radius)],
            pinch_layout(),
        )
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::test_util::{asset_app, params};

    /// One pass: `params[0] = (x, y, strength, radius)`, four scalar slots
    /// (per-param transitions and `{ animated }` bindings address them by
    /// name).
    #[test]
    fn pinch_resolves_to_one_pass() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<PinchParams>(
            json!({ "x": 0.25, "y": 0.75, "strength": -0.5, "radius": 1.0 }),
        )
        .resolve(assets)
        .expect("pinch resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].params[0], Vec4::new(0.25, 0.75, -0.5, 1.0));
        assert_eq!(passes[0].wire_index, 0);
        let names: Vec<_> = passes[0].layout.iter().map(|s| s.name).collect();
        assert_eq!(names, ["x", "y", "strength", "radius"]);
        assert!(
            passes[0]
                .layout
                .iter()
                .all(|s| s.kind == ValueKind::Scalar && s.len == 1)
        );
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
    /// node's center.
    #[test]
    fn pinch_empty_params_default_to_visible_squeeze() {
        let p = params::<PinchParams>(json!({}));
        assert_eq!(p, PinchParams::default());
        assert_eq!((p.x, p.y), (0.5, 0.5));
        assert_eq!(p.strength, 0.5);
        assert_eq!(p.radius, 0.8);
    }

    /// `deny_unknown_fields`: a typoed param rejects instead of silently
    /// falling back to the default.
    #[test]
    fn unknown_pinch_param_rejects() {
        assert!(serde_json::from_value::<PinchParams>(json!({ "strengt": 1 })).is_err());
    }
}
