//! Tests for the `#[react_filter]` attribute macro (custom filters). Like the
//! other `react_*` attributes, the macro is exercised through `core` — its
//! expansion resolves `::bevy_react::` via `extern crate self`.

use std::f32::consts::PI;

use bevy::math::Vec2;
use bevy::prelude::*;
use serde_json::json;

use super::test_util::asset_app;
use super::{FilterColor, FilterRegistry, ParamSlot, ReactFilter, register_builtin_filters};
use crate::animations::ValueKind;
use crate::protocol::{Angle, Length};
use crate::react_filter;
use crate::ts_codegen::TsCollector;

/// The full custom-filter surface in one struct: every override argument
/// plus a param of each straddle-relevant type.
#[react_filter(
    name = "testGlow",
    shader = "shaders/glow.wgsl",
    outset = 4.0,
    time = true
)]
struct GlowParams {
    intensity: f32,
    direction: Vec2,
    tint: FilterColor,
    angle: Angle,
}

fn glow_json() -> serde_json::Value {
    json!({ "intensity": 1.5, "direction": [2, 3], "tint": "#ff0000", "angle": 180 })
}

fn from<T: serde::de::DeserializeOwned>(value: serde_json::Value) -> T {
    serde_json::from_value(value).expect("params decode")
}

#[test]
fn macro_filter_exposes_name_time_and_outset() {
    assert_eq!(GlowParams::NAME, "testGlow");
    const { assert!(GlowParams::USES_TIME) };
    assert_eq!(from::<GlowParams>(glow_json()).outset(), Ok(4.0));
}

/// The macro never emits an identity — custom filters keep the trait
/// default (`None`), so mismatched chains involving them swap discretely
/// instead of identity-extending.
#[test]
fn macro_filter_has_no_identity() {
    assert!(GlowParams::identity_params().is_none());
    let mut registry = FilterRegistry::default();
    registry.register::<GlowParams>();
    assert!((registry.entries["testGlow"].identity)().is_none());
}

/// The generated `pack` fills vec4s contiguously in field declaration
/// order, and a multi-component param that would straddle a vec4 boundary
/// (tint: 4 components starting at comp 3) pads to the next vec4, leaving
/// the gap zero — a slot never crosses a vec4 (`ParamSlot`'s rule).
#[test]
fn macro_pack_fills_declaration_order_and_pads_straddling_params() {
    let (params, layout) = from::<GlowParams>(glow_json()).pack();
    let slot = |name, kind, vec, comp, len| ParamSlot {
        name,
        kind,
        vec,
        comp,
        len,
    };
    assert_eq!(
        &*layout,
        &[
            slot("intensity", ValueKind::Scalar, 0, 0, 1),
            slot("direction", ValueKind::Scalar, 0, 1, 2),
            slot("tint", ValueKind::Color, 1, 0, 4),
            slot("angle", ValueKind::Angle, 2, 0, 1),
        ]
    );
    assert_eq!(params.len(), 3);
    // The straddle padding at params[0].w stays zero.
    assert_eq!(params[0], Vec4::new(1.5, 2.0, 3.0, 0.0));
    // Linear red, shader-ready.
    assert_eq!(params[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
    // 180deg packs as radians.
    assert!((params[2].x - PI).abs() < 1e-5);
    assert_eq!((params[2].y, params[2].z, params[2].w), (0.0, 0.0, 0.0));
}

/// A layout with no straddle packs back-to-back with no padding:
/// `[f32; 3]` + `f32` exactly fill vec0, `Vec4` fills vec1.
#[test]
fn macro_pack_exact_fit_does_not_pad() {
    #[react_filter(shader = "shaders/fill.wgsl")]
    struct FillParams {
        a: [f32; 3],
        b: f32,
        c: Vec4,
    }
    let (params, layout) =
        from::<FillParams>(json!({ "a": [1, 2, 3], "b": 4, "c": [5, 6, 7, 8] })).pack();
    let placed: Vec<_> = layout
        .iter()
        .map(|s| (s.name, s.vec, s.comp, s.len))
        .collect();
    assert_eq!(placed, vec![("a", 0, 0, 3), ("b", 0, 3, 1), ("c", 1, 0, 4)]);
    assert_eq!(
        params,
        vec![Vec4::new(1.0, 2.0, 3.0, 4.0), Vec4::new(5.0, 6.0, 7.0, 8.0)]
    );
}

/// Defaults: wire name = first-letter-lowercased ident, not time-driven,
/// zero outset.
#[test]
fn macro_default_name_lowercases_first_letter() {
    #[react_filter(shader = "x.wgsl")]
    struct MyEffect {
        amount: f32,
    }
    assert_eq!(MyEffect::NAME, "myEffect");
    const { assert!(!MyEffect::USES_TIME) };
    assert_eq!(from::<MyEffect>(json!({ "amount": 1.0 })).outset(), Ok(0.0));
}

/// The macro adds `deny_unknown_fields`: an unknown param key rejects
/// through the registry's resolve path, naming the filter.
#[test]
fn macro_unknown_param_key_rejects_through_registry() {
    let app = asset_app();
    let assets = app.world().resource::<AssetServer>();
    let mut registry = FilterRegistry::default();
    registry.register::<GlowParams>();
    let mut bad = glow_json();
    bad["bogus"] = json!(1);
    let err =
        (registry.entries["testGlow"].resolve)(&bad, assets).expect_err("unknown key must reject");
    assert!(err.contains("testGlow"), "names the filter: {err}");
    assert!(err.contains("bogus"), "names the key: {err}");
}

/// End-to-end registration: `register::<GlowParams>()` bakes resolve/
/// outset/uses_time; resolve yields one pass with the packed values and
/// the plain-asset-path shader.
#[test]
fn macro_filter_registers_and_resolves_end_to_end() {
    let app = asset_app();
    let assets = app.world().resource::<AssetServer>();
    let mut registry = FilterRegistry::default();
    registry.register::<GlowParams>();
    let reg = &registry.entries["testGlow"];
    assert!(reg.uses_time);

    let passes = (reg.resolve)(&glow_json(), assets).expect("glow resolves");
    assert_eq!(passes.len(), 1);
    assert_eq!(passes[0].wire_index, 0);
    assert_eq!(passes[0].params.len(), 3);
    assert_eq!(passes[0].params[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
    assert_eq!(
        passes[0]
            .shader
            .path()
            .expect("plain asset path")
            .to_string(),
        "shaders/glow.wgsl"
    );
    assert_eq!((reg.outset)(&glow_json()), Ok(4.0));
}

/// A `Length` param packs its logical-px value (the chain resolver
/// rewrites it to physical px); a non-px unit rejects from BOTH generated
/// entry points the chain resolver checks — `outset` and `resolve` —
/// naming the filter and unit, mirroring blur.
#[test]
fn macro_length_param_packs_logical_px_and_rejects_non_px() {
    #[react_filter(shader = "shaders/wobble.wgsl")]
    struct WobbleParams {
        offset: Length,
        strength: f32,
    }
    let w = from::<WobbleParams>(json!({ "offset": 4, "strength": 2.0 }));
    let (params, layout) = w.pack();
    assert_eq!(layout[0].kind, ValueKind::Length);
    assert_eq!(params[0].x, 4.0, "logical px");
    assert_eq!(params[0].y, 2.0);
    assert_eq!(w.outset(), Ok(0.0));

    let app = asset_app();
    let assets = app.world().resource::<AssetServer>();
    let bad = from::<WobbleParams>(json!({ "offset": "50%", "strength": 1.0 }));
    let err = bad.outset().expect_err("non-px must reject outset");
    assert!(
        err.contains("wobbleParams") && err.contains("offset") && err.contains("%"),
        "names filter, param, and unit: {err}"
    );
    bad.resolve(assets).expect_err("non-px must reject resolve");
}

/// A param-less filter is legal: `pack()` yields zero vec4s and an empty
/// layout, and it registers + resolves through the registry like any
/// other filter.
#[test]
fn macro_zero_field_struct_packs_empty_and_resolves() {
    #[react_filter(shader = "z.wgsl")]
    struct NoParams {}
    let (params, layout) = from::<NoParams>(json!({})).pack();
    assert!(params.is_empty());
    assert!(layout.is_empty());

    let app = asset_app();
    let assets = app.world().resource::<AssetServer>();
    let mut registry = FilterRegistry::default();
    registry.register::<NoParams>();
    let passes = (registry.entries["noParams"].resolve)(&json!({}), assets)
        .expect("param-less filter resolves");
    assert_eq!(passes.len(), 1);
    assert!(passes[0].params.is_empty());
}

/// Field names that mirror the generated code's own locals/arguments
/// (`params`, `assets`) compile and pack normally — `self.`-qualified
/// field access keeps user names from colliding with generated bindings.
#[test]
fn macro_field_names_do_not_shadow_generated_locals() {
    #[react_filter(shader = "s.wgsl")]
    struct Shadowy {
        params: f32,
        assets: f32,
    }
    let (params, layout) = from::<Shadowy>(json!({ "params": 1.0, "assets": 2.0 })).pack();
    let placed: Vec<_> = layout.iter().map(|s| (s.name, s.vec, s.comp)).collect();
    assert_eq!(placed, vec![("params", 0, 0), ("assets", 0, 1)]);
    assert_eq!(params, vec![Vec4::new(1.0, 2.0, 0.0, 0.0)]);
}

/// `add_react_filter` (the `ReactAppExt` extension) registers into the
/// same `FilterRegistry` the chain resolver reads: the entry is baked and
/// resolves end-to-end.
#[test]
fn add_react_filter_registers_and_resolves() {
    use crate::ReactAppExt;
    let mut app = asset_app();
    app.add_react_filter::<GlowParams>();
    let world = app.world();
    let assets = world.resource::<AssetServer>();
    let registry = world.resource::<FilterRegistry>();
    let reg = &registry.entries["testGlow"];
    assert!(reg.uses_time);
    let passes = (reg.resolve)(&glow_json(), assets).expect("glow resolves");
    assert_eq!(passes.len(), 1);
    assert_eq!(passes[0].params[1], Vec4::new(1.0, 0.0, 0.0, 1.0));
}

/// `register_entry` semantics through the App extension: the same type
/// twice is a single entry (no-op), while a DIFFERENT type claiming the
/// occupied name warns and replaces the previous entry.
#[test]
fn add_react_filter_dedups_same_type_and_replaces_different_type() {
    use crate::ReactAppExt;

    #[react_filter(name = "testGlow", shader = "other.wgsl")]
    struct ImposterGlow {
        amount: f32,
    }

    let mut app = App::new();
    app.add_react_filter::<GlowParams>();
    app.add_react_filter::<GlowParams>();
    {
        let registry = app.world().resource::<FilterRegistry>();
        assert_eq!(registry.entries.len(), 1);
        assert!(registry.entries["testGlow"].uses_time, "GlowParams' entry");
    }

    app.add_react_filter::<ImposterGlow>();
    let registry = app.world().resource::<FilterRegistry>();
    assert_eq!(registry.entries.len(), 1, "replaced, not appended");
    let reg = &registry.entries["testGlow"];
    assert!(!reg.uses_time, "ImposterGlow's entry (time defaults false)");
    assert_eq!((reg.ts_name)(), "ImposterGlow");
}

/// Registering a built-in type again through the App extension is a
/// same-TypeId no-op, so a user's `register_bindings` can safely list
/// built-ins alongside the plugin's own registration.
#[test]
fn add_react_filter_on_builtin_is_a_noop() {
    use crate::ReactAppExt;
    use crate::filters::BlurParams;
    let mut app = App::new();
    register_builtin_filters(&mut app);
    app.add_react_filter::<BlurParams>();
    assert_eq!(app.world().resource::<FilterRegistry>().entries.len(), 9);
}

/// Registration bakes the TS-export slots with the event registry's exact
/// split: the wire name is the entries key, `ts_name` names the params
/// type, and `ts_collect` feeds the collector its declaration (with the
/// macro's `#[ts(type)]` overrides applied).
#[test]
fn macro_filter_ts_slots_expose_params_type() {
    let mut registry = FilterRegistry::default();
    registry.register::<GlowParams>();
    let reg = &registry.entries["testGlow"];
    assert_eq!((reg.ts_name)(), "GlowParams");
    let mut c = TsCollector::default();
    (reg.ts_collect)(&mut c);
    let decl = &c.decls["GlowParams"];
    assert!(decl.contains("intensity: number"), "{decl}");
    assert!(decl.contains("direction: [number, number]"), "{decl}");
    // `FilterColor` inlines as its wire form (a CSS color string).
    assert!(decl.contains("tint: string"), "{decl}");
    assert!(decl.contains("angle: number | string"), "{decl}");
}
