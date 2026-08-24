//! The `gradientMap` built-in: recolor the layer with a linear gradient.

use std::sync::Arc;

use bevy::asset::load_embedded_asset;
use bevy::prelude::*;
use bevy::shader::Shader;
use serde::Deserialize;
use serde_json::Value;

use crate::animations::ValueKind;
use crate::filters::params::{FilterColor, ParamSlot, static_layout};
use crate::filters::registry::{ReactFilter, ResolvedFilterPass, resolve_single_pass};
use crate::protocol::units::Angle;

/// The most stops one `gradientMap` use can carry — the packing budget:
/// 6 color vec4s + 6 positions + angle + amount is exactly
/// [`MAX_FILTER_PARAM_VECS`](crate::filters::params::MAX_FILTER_PARAM_VECS).
pub const MAX_GRADIENT_STOPS: usize = 6;

fn default_amount() -> f32 {
    1.0
}

/// A builtin default color, parsed once at pack/default time (infallible for
/// the literals used here).
fn css(color: &str) -> FilterColor {
    let srgba = crate::canvas::parse_css_color(color).expect("valid builtin color literal");
    let lin = bevy::color::LinearRgba::from(srgba);
    FilterColor([lin.red, lin.green, lin.blue, lin.alpha])
}

/// Shorthand-default stops: a visible sky-blue → violet sweep (the
/// shorthand-default convention — `{ name: "gradientMap" }` shows something).
fn default_stops() -> Vec<GradientMapStop> {
    vec![
        GradientMapStop {
            color: css("#38bdf8"),
            position: None,
        },
        GradientMapStop {
            color: css("#a78bfa"),
            position: None,
        },
    ]
}

/// One gradient stop: a CSS color and an optional position as a **fraction**
/// `0..1` along the gradient line.
///
/// Deliberately not a `%`-[`Length`](crate::protocol::units::Length) like
/// `backgroundGradient` stops: filter `Length` params are px-only and get the
/// physical-px rewrite — meaningless for a position along a node-sized line
/// only the shader knows the length of. Missing positions auto-distribute
/// CSS-style at pack time.
#[derive(Debug, Clone, Copy, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct GradientMapStop {
    pub color: FilterColor,
    #[serde(default)]
    #[ts(optional, type = "number")]
    pub position: Option<f32>,
}

/// `gradientMap`: recolor the layer's pixels with a multi-stop linear
/// gradient, keeping alpha — gradient text (wrap the `<text>` in a `<node>`),
/// gradient-tinted icons. `angle` follows `backgroundGradient`'s convention
/// (bare number = degrees, `0` = to top, clockwise); the gradient line spans
/// the node's border box (aspect-correct CSS math — the outset ring of a
/// chained blur/outline does NOT stretch it, via the prelude's `content_uv`).
/// `amount` mixes the original color toward the gradient (a stop's alpha
/// scales the mix locally; source alpha is always kept); the true identity is
/// `amount: 0`. Gradient interpolation is linear-RGB (the packed space — a v1
/// divergence from `backgroundGradient`'s oklab default).
///
/// Packing (one pass, the full 8-vec4 budget — always, so N-stop → M-stop
/// transitions stay `Aligned` and lerp):
///
/// ```text
/// params[0..6) = stop colors, linear straight-alpha RGBA
/// params[6]    = positions of stops 0..4
/// params[7]    = (position of stop 4, position of stop 5,
///                 angle radians, amount)
/// ```
///
/// Missing positions resolve CSS-style at pack time (first → 0, last → 1,
/// interior runs distribute evenly; explicit values clamp monotonic); unused
/// tail slots repeat the last color at position 1.0 (visually inert, and a
/// transition that adds a stop fades it in from the previous endpoint).
///
/// Animatability: `{ animated }` bindings drive `angle` and `amount` (slot
/// names match the wire params); `stops` has no slot — neither the array nor
/// a nested `stops[i].color` is bindable (v1 limitation). Whole-chain
/// `transition: {{ filter }}` easing of stop colors/positions works.
#[derive(Debug, Clone, PartialEq, Deserialize, ts_rs::TS)]
#[serde(deny_unknown_fields)]
pub struct GradientMapParams {
    // Mirrors `#[react_filter]`'s override for an `Angle` field.
    #[serde(default)]
    #[ts(type = "number | string")]
    pub angle: Angle,
    #[serde(default = "default_stops")]
    pub stops: Vec<GradientMapStop>,
    #[serde(default = "default_amount")]
    pub amount: f32,
}

impl Default for GradientMapParams {
    fn default() -> Self {
        Self {
            angle: Angle::default(),
            stops: default_stops(),
            amount: default_amount(),
        }
    }
}

fn gradient_map_layout() -> Arc<[ParamSlot]> {
    static_layout![
        ParamSlot {
            name: "stopColorA",
            kind: ValueKind::Color,
            vec: 0,
            comp: 0,
            len: 4,
        },
        ParamSlot {
            name: "stopColorB",
            kind: ValueKind::Color,
            vec: 1,
            comp: 0,
            len: 4,
        },
        ParamSlot {
            name: "stopColorC",
            kind: ValueKind::Color,
            vec: 2,
            comp: 0,
            len: 4,
        },
        ParamSlot {
            name: "stopColorD",
            kind: ValueKind::Color,
            vec: 3,
            comp: 0,
            len: 4,
        },
        ParamSlot {
            name: "stopColorE",
            kind: ValueKind::Color,
            vec: 4,
            comp: 0,
            len: 4,
        },
        ParamSlot {
            name: "stopColorF",
            kind: ValueKind::Color,
            vec: 5,
            comp: 0,
            len: 4,
        },
        ParamSlot {
            name: "stopPositionsA",
            kind: ValueKind::Scalar,
            vec: 6,
            comp: 0,
            len: 4,
        },
        ParamSlot {
            name: "stopPositionsB",
            kind: ValueKind::Scalar,
            vec: 7,
            comp: 0,
            len: 2,
        },
        ParamSlot {
            name: "angle",
            kind: ValueKind::Angle,
            vec: 7,
            comp: 2,
            len: 1,
        },
        ParamSlot {
            name: "amount",
            kind: ValueKind::Scalar,
            vec: 7,
            comp: 3,
            len: 1,
        },
    ]
}

impl GradientMapParams {
    /// The six packed (color, position) pairs: positions resolved CSS-style
    /// (clamp to `0..=1`, explicit values clamped monotonic, missing values
    /// auto-distributed — first → 0, last → 1, interior runs evenly between
    /// their resolved neighbors), unused tail slots padded with the last
    /// color at position 1.0 (empty stops → all transparent black).
    ///
    /// Infallible like `pack` itself: over-cap stops are truncated here, but
    /// can never reach the shader — `resolve` rejects them first.
    fn resolved_stops(&self) -> [([f32; 4], f32); MAX_GRADIENT_STOPS] {
        let count = self.stops.len().min(MAX_GRADIENT_STOPS);
        let stops = &self.stops[..count];

        let mut positions: Vec<Option<f32>> = stops
            .iter()
            .map(|s| s.position.map(|p| p.clamp(0.0, 1.0)))
            .collect();
        if count > 0 {
            if positions[0].is_none() {
                positions[0] = Some(0.0);
            }
            if count > 1 && positions[count - 1].is_none() {
                positions[count - 1] = Some(1.0);
            }
            // CSS monotonicity: an explicit position below the running max
            // clamps up to it.
            let mut running_max = 0.0f32;
            for value in positions.iter_mut().flatten() {
                *value = value.max(running_max);
                running_max = *value;
            }
            // Interior runs of missing positions distribute evenly between
            // their resolved neighbors (ends are pinned above).
            let mut i = 0;
            while i < count {
                if positions[i].is_some() {
                    i += 1;
                    continue;
                }
                let run_start = i;
                let mut run_end = i;
                while positions[run_end].is_none() {
                    run_end += 1;
                }
                let lo = positions[run_start - 1].expect("left neighbor resolved");
                let hi = positions[run_end].expect("right neighbor resolved");
                let run_len = (run_end - run_start) as f32;
                for (k, idx) in (run_start..run_end).enumerate() {
                    positions[idx] = Some(lo + (hi - lo) * (k as f32 + 1.0) / (run_len + 1.0));
                }
                i = run_end;
            }
        }

        let pad_color = stops.last().map(|s| s.color.0).unwrap_or([0.0; 4]);
        std::array::from_fn(|i| {
            if i < count {
                (stops[i].color.0, positions[i].expect("resolved"))
            } else {
                (pad_color, 1.0)
            }
        })
    }
}

impl ReactFilter for GradientMapParams {
    const NAME: &'static str = "gradientMap";

    fn shader(assets: &AssetServer) -> Handle<Shader> {
        load_embedded_asset!(assets, "gradient_map.wgsl")
    }

    fn identity_params() -> Option<Value> {
        Some(serde_json::json!({ "amount": 0.0 }))
    }

    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        let resolved = self.resolved_stops();
        let mut vecs = vec![Vec4::ZERO; 8];
        for (i, (color, _)) in resolved.iter().enumerate() {
            vecs[i] = Vec4::from_array(*color);
        }
        vecs[6] = Vec4::new(resolved[0].1, resolved[1].1, resolved[2].1, resolved[3].1);
        vecs[7] = Vec4::new(
            resolved[4].1,
            resolved[5].1,
            self.angle.radians(),
            self.amount,
        );
        (vecs, gradient_map_layout())
    }

    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        if self.stops.len() > MAX_GRADIENT_STOPS {
            return Err(format!(
                "filter {:?} supports at most {MAX_GRADIENT_STOPS} stops, got {}",
                Self::NAME,
                self.stops.len()
            ));
        }
        resolve_single_pass(self, assets)
    }
}

#[cfg(test)]
mod tests {
    use std::f32::consts::PI;

    use serde_json::json;

    use super::*;
    use crate::filters::params::{MAX_FILTER_PARAM_VECS, lerp_packed_params};
    use crate::filters::registry::FilterRegistry;
    use crate::filters::test_util::{asset_app, params};

    fn packed(value: serde_json::Value) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
        params::<GradientMapParams>(value).pack()
    }

    /// Explicit stops land in the documented slots: colors in
    /// `params[0..count)`, positions split across `params[6]`/`params[7].xy`,
    /// angle radians at `[7].z`, amount at `[7].w` — always all 8 vec4s.
    #[test]
    fn packs_explicit_stops_positions_angle_amount() {
        let (vecs, layout) = packed(json!({
            "angle": 90,
            "amount": 0.5,
            "stops": [
                { "color": "#ff0000", "position": 0.1 },
                { "color": "#00ff00", "position": 0.4 },
                { "color": "#0000ff", "position": 0.9 },
            ],
        }));
        assert_eq!(vecs.len(), MAX_FILTER_PARAM_VECS);
        assert_eq!(vecs[0], Vec4::new(1.0, 0.0, 0.0, 1.0));
        assert_eq!(vecs[1], Vec4::new(0.0, 1.0, 0.0, 1.0));
        assert_eq!(vecs[2], Vec4::new(0.0, 0.0, 1.0, 1.0));
        assert_eq!(vecs[6].x, 0.1);
        assert_eq!(vecs[6].y, 0.4);
        assert_eq!(vecs[6].z, 0.9);
        assert!((vecs[7].z - PI / 2.0).abs() < 1e-5);
        assert_eq!(vecs[7].w, 0.5);
        // Layout: six color slots, two position slots, angle, amount.
        assert_eq!(layout.len(), 10);
        assert_eq!(layout[0].name, "stopColorA");
        assert_eq!(layout[0].kind, ValueKind::Color);
        assert_eq!(layout[6].name, "stopPositionsA");
        assert_eq!(layout[8].kind, ValueKind::Angle);
        assert_eq!(layout[9].name, "amount");
        assert_eq!(layout[9].vec, 7);
        assert_eq!(layout[9].comp, 3);
    }

    /// CSS auto-distribution: all-missing spreads evenly across 0..1;
    /// an interior run distributes between its pinned neighbors; an explicit
    /// position below the running max clamps up (monotonicity).
    #[test]
    fn auto_distributes_missing_positions() {
        let (vecs, _) = packed(json!({ "stops": [
            { "color": "#000000" }, { "color": "#000000" },
            { "color": "#000000" }, { "color": "#000000" },
        ]}));
        let third = 1.0 / 3.0;
        assert_eq!(vecs[6].x, 0.0);
        assert!((vecs[6].y - third).abs() < 1e-6);
        assert!((vecs[6].z - 2.0 * third).abs() < 1e-6);
        assert_eq!(vecs[6].w, 1.0);

        let (vecs, _) = packed(json!({ "stops": [
            { "color": "#000000", "position": 0.2 }, { "color": "#000000" },
            { "color": "#000000" }, { "color": "#000000", "position": 0.8 },
        ]}));
        assert_eq!(vecs[6].x, 0.2);
        assert!((vecs[6].y - 0.4).abs() < 1e-6);
        assert!((vecs[6].z - 0.6).abs() < 1e-6);
        assert_eq!(vecs[6].w, 0.8);

        let (vecs, _) = packed(json!({ "stops": [
            { "color": "#000000", "position": 0.8 },
            { "color": "#000000", "position": 0.3 },
        ]}));
        assert_eq!(vecs[6].x, 0.8);
        assert_eq!(vecs[6].y, 0.8);
    }

    /// Unused tail slots repeat the last color at position 1.0 (visually
    /// inert, transition-friendly); empty stops pack all transparent black —
    /// the well-defined identity-shape guarantee.
    #[test]
    fn pads_unused_stops_with_last_color_at_one() {
        let (vecs, _) = packed(json!({ "stops": [
            { "color": "#ff0000" }, { "color": "#0000ff" },
        ]}));
        for (i, vec) in vecs.iter().enumerate().take(MAX_GRADIENT_STOPS).skip(2) {
            assert_eq!(*vec, Vec4::new(0.0, 0.0, 1.0, 1.0), "slot {i}");
        }
        assert_eq!(vecs[6], Vec4::new(0.0, 1.0, 1.0, 1.0));
        assert_eq!(vecs[7].x, 1.0);
        assert_eq!(vecs[7].y, 1.0);

        let (vecs, _) = packed(json!({ "stops": [] }));
        for (i, vec) in vecs.iter().enumerate().take(MAX_GRADIENT_STOPS) {
            assert_eq!(*vec, Vec4::ZERO, "slot {i}");
        }
    }

    /// A single stop pins at 0 and pads at 1 with the same color — a uniform
    /// recolor.
    #[test]
    fn single_stop_is_a_uniform_recolor() {
        let (vecs, _) = packed(json!({ "stops": [{ "color": "#ff0000" }] }));
        assert_eq!(vecs[6].x, 0.0);
        for (i, vec) in vecs.iter().enumerate().take(MAX_GRADIENT_STOPS).skip(1) {
            assert_eq!(*vec, Vec4::new(1.0, 0.0, 0.0, 1.0), "slot {i}");
        }
    }

    /// Over-cap stop counts reject through the baked registry fn (naming the
    /// cap); exactly six stops stay accepted.
    #[test]
    fn seven_stops_reject_from_registry() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<GradientMapParams>();
        let entry = &registry.entries["gradientMap"];

        let stop = json!({ "color": "#ffffff" });
        let seven = json!({ "stops": vec![stop.clone(); 7] });
        let err = (entry.resolve)(&seven, assets).expect_err("seven stops must reject");
        assert!(err.contains("6"), "names the cap: {err}");
        let six = json!({ "stops": vec![stop; 6] });
        assert!((entry.resolve)(&six, assets).is_ok());
    }

    /// The true identity is `amount: 0` (shorthand default is a visible
    /// gradient); it deserializes cleanly on its own.
    #[test]
    fn identity_is_amount_zero() {
        let identity = GradientMapParams::identity_params().expect("has identity");
        let p: GradientMapParams = serde_json::from_value(identity).expect("identity decodes");
        assert_eq!(p.amount, 0.0);
    }

    /// Empty params take the shorthand defaults: a visible two-stop sweep at
    /// full amount.
    #[test]
    fn empty_params_default_to_visible_gradient() {
        let p = params::<GradientMapParams>(json!({}));
        assert_eq!(p, GradientMapParams::default());
        assert_eq!(p.stops.len(), 2);
        assert_eq!(p.amount, 1.0);
        assert_eq!(p.angle.radians(), 0.0);
    }

    /// `deny_unknown_fields` on the params AND on each stop.
    #[test]
    fn unknown_params_reject() {
        assert!(serde_json::from_value::<GradientMapParams>(json!({ "stopz": [] })).is_err());
        assert!(
            serde_json::from_value::<GradientMapParams>(
                json!({ "stops": [{ "color": "#fff", "pos": 0.5 }] })
            )
            .is_err()
        );
    }

    /// Different stop counts still meet the `FilterEase::Aligned` criteria
    /// (equal params length + one shared layout — gradientMap always packs
    /// all 8 vec4s), and the midpoint lerp blends stop colors linearly, the
    /// padded slot fading from repeated-last toward the added stop's color.
    #[test]
    fn stop_transitions_lerp_aligned() {
        let (a, layout_a) = packed(json!({ "stops": [
            { "color": "#ff0000" }, { "color": "#0000ff" },
        ]}));
        let (b, layout_b) = packed(json!({ "angle": 90, "stops": [
            { "color": "#ff0000" }, { "color": "#0000ff" }, { "color": "#00ff00" },
        ]}));
        assert_eq!(a.len(), b.len());
        assert!(
            Arc::ptr_eq(&layout_a, &layout_b),
            "one shared static layout"
        );

        let mid = lerp_packed_params(&a, &b, 0.5, &layout_a);
        // Slot 2: a padded blue (repeat-last) fading toward the added green.
        assert_eq!(mid[2], Vec4::new(0.0, 0.5, 0.5, 1.0));
        // Angle slot lerps numerically from 0 toward pi/2.
        assert!((mid[7].z - PI / 4.0).abs() < 1e-5);
    }

    /// One pass, wire index 0, embedded shader — the canonical single-pass
    /// resolve.
    #[test]
    fn resolves_to_one_pass() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes = params::<GradientMapParams>(json!({}))
            .resolve(assets)
            .expect("gradientMap resolves");
        assert_eq!(passes.len(), 1);
        assert_eq!(passes[0].wire_index, 0);
        assert_eq!(passes[0].params.len(), MAX_FILTER_PARAM_VECS);
    }
}
