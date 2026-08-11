//! The seven color ops — brightness, contrast, saturate, grayscale, sepia,
//! invert, and hueRotate — sharing one color-matrix pass shader and packing.

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

/// The shared shader for the seven color ops — one color-matrix pass with the
/// canonical packing `params[0] = (brightness, contrast, saturate, grayscale)`,
/// `params[1] = (sepia, invert, hue_radians, 0)`. Each op fills its own slot
/// and identity elsewhere, so any color op can be evaluated by the same
/// shader.
fn color_matrix_shader(assets: &AssetServer) -> Handle<Shader> {
    load_embedded_asset!(assets, "color_matrix.wgsl")
}

/// The identity color-matrix packing (each op overwrites its own slot).
fn color_matrix_identity() -> Vec<Vec4> {
    vec![Vec4::new(1.0, 1.0, 1.0, 0.0), Vec4::ZERO]
}

/// Serde default for the amount ops (see each op's doc for the CSS rationale).
fn one() -> f32 {
    1.0
}

/// Define an `amount: f32`-shaped color op: wire name plus its slot in the
/// canonical color-matrix packing, and the amount that is the op's *identity*
/// (`1` for the multiplicative ops, `0` for the mix-in ops — deliberately not
/// always the CSS shorthand default).
macro_rules! color_matrix_filters {
    ($($(#[$doc:meta])* $ty:ident = $name:literal @ ($vec:literal, $comp:literal) identity $id:literal;)+) => {$(
        $(#[$doc])*
        #[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
        #[serde(deny_unknown_fields)]
        pub struct $ty {
            #[serde(default = "one")]
            pub amount: f32,
        }

        impl ReactFilter for $ty {
            const NAME: &'static str = $name;

            fn shader(assets: &AssetServer) -> Handle<Shader> {
                color_matrix_shader(assets)
            }

            fn identity_params() -> Option<Value> {
                Some(serde_json::json!({ "amount": $id }))
            }

            fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
                let layout = static_layout![ParamSlot {
                    name: "amount",
                    kind: ValueKind::Scalar,
                    vec: $vec,
                    comp: $comp,
                    len: 1,
                }];
                let mut params = color_matrix_identity();
                params[$vec][$comp] = self.amount;
                (params, layout)
            }
        }
    )+};
}

color_matrix_filters! {
    /// `brightness`: `amount` defaults to `1.0` — CSS `brightness()` with the
    /// value omitted means `1` (identity).
    BrightnessParams = "brightness" @ (0, 0) identity 1.0;
    /// `contrast`: `amount` defaults to `1.0` — CSS `contrast()` with the
    /// value omitted means `1` (identity).
    ContrastParams = "contrast" @ (0, 1) identity 1.0;
    /// `saturate`: `amount` defaults to `1.0` — CSS `saturate()` with the
    /// value omitted means `1` (identity).
    SaturateParams = "saturate" @ (0, 2) identity 1.0;
    /// `grayscale`: `amount` defaults to `1.0` — CSS `grayscale()` with the
    /// value omitted means `1` (**full** effect; identity is `0`), so a
    /// bare `{name:"grayscale"}` applies the effect.
    GrayscaleParams = "grayscale" @ (0, 3) identity 0.0;
    /// `sepia`: `amount` defaults to `1.0` — CSS `sepia()` with the value
    /// omitted means `1` (**full** effect; identity is `0`).
    SepiaParams = "sepia" @ (1, 0) identity 0.0;
    /// `invert`: `amount` defaults to `1.0` — CSS `invert()` with the value
    /// omitted means `1` (**full** effect; identity is `0`).
    InvertParams = "invert" @ (1, 1) identity 0.0;
}

/// `hueRotate`: `angle` defaults to `0deg` — CSS `hue-rotate()` with the
/// value omitted means `0deg` (identity). Packs radians at `params[1].z` of
/// the shared color-matrix packing.
#[derive(Debug, Clone, Copy, PartialEq, Default, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct HueRotateParams {
    // The `#[ts(type)]` override mirrors what `#[react_filter]` emits for an
    // `Angle` field (no `TS` impl on the wire-flexible type itself).
    #[serde(default)]
    #[ts(type = "number | string")]
    pub angle: Angle,
}

impl ReactFilter for HueRotateParams {
    const NAME: &'static str = "hueRotate";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        color_matrix_shader(assets)
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "angle": 0.0 }))
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        let layout = static_layout![ParamSlot {
            name: "angle",
            kind: ValueKind::Angle,
            vec: 1,
            comp: 2,
            len: 1,
        }];
        let mut params = color_matrix_identity();
        params[1][2] = self.angle.radians();
        (params, layout)
    }
}

#[cfg(test)]
mod tests {
    use std::f32::consts::PI;

    use serde_json::json;

    use super::*;
    use crate::filters::test_util::params;

    /// Each color op writes its value into its documented slot of the shared
    /// color-matrix packing and identity everywhere else, and its layout
    /// exposes only its own `amount` at that slot.
    #[test]
    fn color_ops_pack_into_documented_slots() {
        let identity0 = Vec4::new(1.0, 1.0, 1.0, 0.0);

        let (p, layout) = params::<BrightnessParams>(json!({ "amount": 1.2 })).pack();
        assert_eq!(p, vec![Vec4::new(1.2, 1.0, 1.0, 0.0), Vec4::ZERO]);
        assert_eq!(
            &*layout,
            &[ParamSlot {
                name: "amount",
                kind: ValueKind::Scalar,
                vec: 0,
                comp: 0,
                len: 1,
            }]
        );

        let (p, layout) = params::<ContrastParams>(json!({ "amount": 0.8 })).pack();
        assert_eq!(p, vec![Vec4::new(1.0, 0.8, 1.0, 0.0), Vec4::ZERO]);
        assert_eq!((layout[0].vec, layout[0].comp), (0, 1));

        let (p, layout) = params::<SaturateParams>(json!({ "amount": 1.5 })).pack();
        assert_eq!(p, vec![Vec4::new(1.0, 1.0, 1.5, 0.0), Vec4::ZERO]);
        assert_eq!((layout[0].vec, layout[0].comp), (0, 2));

        let (p, layout) = params::<GrayscaleParams>(json!({ "amount": 0.25 })).pack();
        assert_eq!(p, vec![Vec4::new(1.0, 1.0, 1.0, 0.25), Vec4::ZERO]);
        assert_eq!((layout[0].vec, layout[0].comp), (0, 3));

        let (p, layout) = params::<SepiaParams>(json!({ "amount": 0.5 })).pack();
        assert_eq!(p, vec![identity0, Vec4::new(0.5, 0.0, 0.0, 0.0)]);
        assert_eq!((layout[0].vec, layout[0].comp), (1, 0));

        let (p, layout) = params::<InvertParams>(json!({ "amount": 0.75 })).pack();
        assert_eq!(p, vec![identity0, Vec4::new(0.0, 0.75, 0.0, 0.0)]);
        assert_eq!((layout[0].vec, layout[0].comp), (1, 1));
    }

    /// `hueRotate` decodes CSS angles (bare number = degrees) and packs
    /// radians at `params[1].z`.
    #[test]
    fn hue_rotate_packs_radians_at_documented_slot() {
        let (p, layout) = params::<HueRotateParams>(json!({ "angle": 180 })).pack();
        assert!((p[1].z - PI).abs() < 1e-5);
        assert_eq!(p[0], Vec4::new(1.0, 1.0, 1.0, 0.0));
        assert_eq!(
            &*layout,
            &[ParamSlot {
                name: "angle",
                kind: ValueKind::Angle,
                vec: 1,
                comp: 2,
                len: 1,
            }]
        );
    }
}
