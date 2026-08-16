//! The `outline` built-in: an alpha-dilation outline around the content.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;
use serde_json::Value;

use crate::animations::ValueKind;
use crate::filters::params::{FilterColor, ParamSlot, length_logical_px, static_layout};
use crate::filters::registry::{ReactFilter, ResolvedFilterPass, resolve_single_pass};
use crate::protocol::units::Length;

fn default_width() -> Length {
    Length::Px(2.0)
}

fn default_outline_color() -> FilterColor {
    // Opaque black (linear == sRGB at the extremes).
    FilterColor([0.0, 0.0, 0.0, 1.0])
}

/// `outline`: paint a `color` ring of `width` px around the content's alpha
/// silhouette, UNDER the content (source-over) — text outlines (wrap the
/// `<text>` in a `<node>`), sticker-style icon rings. `softness` feathers
/// the ring's outer edge over that many extra px, doubling as a glow. The
/// outline follows whatever the chain has produced so far: `[gradientMap,
/// outline]` outlines the recolored glyphs, `[blur, outline]` the blurred
/// silhouette. `{ name: "outline" }` is a crisp 2px black outline
/// (shorthand-default convention); the true identity is `width: 0,
/// softness: 0`.
///
/// One pass, packed as:
///
/// ```text
/// params[0] = (width_logical_px, softness_logical_px, 0, 0)
/// params[1] = color, linear straight-alpha RGBA
/// ```
///
/// All three params take `{ animated }` bindings (`width`/`softness` scalar
/// Length slots, `color` via `interpolateColor`). Quality bound (see
/// `outline.wgsl`): the dilation is crisp up to a reach of ~12 physical px;
/// practical text outlines are 1–6 logical px.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct OutlineParams {
    // Mirrors `#[react_filter]`'s override for a `Length` field.
    #[serde(default = "default_width")]
    #[ts(type = "number | string")]
    pub width: Length,
    #[serde(default = "default_outline_color")]
    pub color: FilterColor,
    #[serde(default)]
    #[ts(type = "number | string")]
    pub softness: Length,
}

impl Default for OutlineParams {
    fn default() -> Self {
        Self {
            width: default_width(),
            color: default_outline_color(),
            softness: Length::Px(0.0),
        }
    }
}

fn outline_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "width",
            kind: ValueKind::Length,
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
        ParamSlot {
            name: "color",
            kind: ValueKind::Color,
            vec: 1,
            comp: 0,
            len: 4,
        },
    ]
}

impl OutlineParams {
    fn width_px(&self) -> Result<f32, String> {
        length_logical_px(Self::NAME, "width", self.width)
    }

    fn softness_px(&self) -> Result<f32, String> {
        length_logical_px(Self::NAME, "softness", self.softness)
    }
}

impl ReactFilter for OutlineParams {
    const NAME: &'static str = "outline";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "outline.wgsl")
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "width": 0.0, "softness": 0.0 }))
    }

    /// The ring reaches `width + softness` past the silhouette, plus 1
    /// logical px of antialiasing skirt (the shader's hard-edge feather).
    fn outset(&self) -> Result<f32, String> {
        Ok(self.width_px()? + self.softness_px()? + 1.0)
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        // `pack` is infallible, so non-px lengths fall back to 0 here — but
        // they can never reach the shader: `resolve`/`outset` reject first.
        (
            vec![
                Vec4::new(
                    self.width_px().unwrap_or(0.0),
                    self.softness_px().unwrap_or(0.0),
                    0.0,
                    0.0,
                ),
                Vec4::from_array(self.color.0),
            ],
            outline_layout(),
        )
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        self.width_px()?;
        self.softness_px()?;
        resolve_single_pass(self, assets)
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::registry::FilterRegistry;
    use crate::filters::test_util::{asset_app, params};

    /// One pass: width/softness logical px in `params[0].xy` (Length slots
    /// for the physical rewrite), color in `params[1]` — default opaque
    /// black.
    #[test]
    fn packs_width_softness_color() {
        let (vecs, layout) = params::<OutlineParams>(json!({
            "width": 3, "softness": 2, "color": "#ff0000",
        }))
        .pack();
        assert_eq!(vecs.len(), 2);
        assert_eq!(vecs[0], Vec4::new(3.0, 2.0, 0.0, 0.0));
        assert_eq!(vecs[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
        assert_eq!(layout[0].name, "width");
        assert_eq!(layout[0].kind, ValueKind::Length);
        assert_eq!(layout[1].name, "softness");
        assert_eq!(layout[1].kind, ValueKind::Length);
        assert_eq!(layout[1].comp, 1);
        assert_eq!(layout[2].name, "color");
        assert_eq!(layout[2].kind, ValueKind::Color);
        assert_eq!(layout[2].vec, 1);

        let (vecs, _) = params::<OutlineParams>(json!({})).pack();
        assert_eq!(vecs[1], Vec4::new(0.0, 0.0, 0.0, 1.0), "default black");
    }

    /// The ring bleeds `width + softness` past the silhouette plus the 1px
    /// AA skirt — the identity params still carry the skirt (harmless: the
    /// outset only sizes the capture).
    #[test]
    fn outset_is_width_plus_softness_plus_aa() {
        assert_eq!(
            params::<OutlineParams>(json!({ "width": 4, "softness": 2 })).outset(),
            Ok(7.0)
        );
        assert_eq!(params::<OutlineParams>(json!({})).outset(), Ok(3.0));
        let identity = OutlineParams::identity_params().expect("has identity");
        let p: OutlineParams = serde_json::from_value(identity).expect("identity decodes");
        assert_eq!(p.outset(), Ok(1.0));
        assert_eq!(p.width, Length::Px(0.0));
        assert_eq!(p.softness, Length::Px(0.0));
    }

    /// Empty params take the shorthand defaults: a crisp 2px black outline.
    #[test]
    fn empty_params_default_to_crisp_black_outline() {
        let p = params::<OutlineParams>(json!({}));
        assert_eq!(p, OutlineParams::default());
        assert_eq!(p.width, Length::Px(2.0));
        assert_eq!(p.softness, Length::Px(0.0));
    }

    /// Non-px width/softness reject from both baked registry fns, naming the
    /// unit — same contract as blur's radius.
    #[test]
    fn non_px_width_and_softness_reject_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<OutlineParams>();
        let entry = &registry.entries["outline"];

        for value in [json!({ "width": "50%" }), json!({ "softness": "2vw" })] {
            let err = (entry.resolve)(&value, assets).expect_err("non-px must reject resolve");
            assert!(err.contains("px"), "names the unit: {err}");
            let err = (entry.outset)(&value).expect_err("non-px must reject outset");
            assert!(err.contains("px"), "names the unit: {err}");
        }
        assert!((entry.resolve)(&json!({ "width": "3px" }), assets).is_ok());
        assert_eq!((entry.outset)(&json!({ "width": 3 })), Ok(4.0));
    }

    /// One pass, wire index 0.
    #[test]
    fn resolves_to_one_pass() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<OutlineParams>(json!({}))
            .resolve(assets)
            .expect("outline resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].wire_index, 0);
    }

    /// `deny_unknown_fields`: a typoed param rejects.
    #[test]
    fn unknown_outline_param_rejects() {
        assert!(serde_json::from_value::<OutlineParams>(json!({ "widht": 2 })).is_err());
    }
}
