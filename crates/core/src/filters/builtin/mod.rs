//! The nine built-in filters, one file per shader family: [`color_matrix`]
//! (the seven color ops sharing one pass shader and packing — six declared by
//! the `color_matrix_filters!` macro plus the hand-written `hueRotate`),
//! [`blur`] (the two-pass separable Gaussian), and [`bloom`] (bright-pass →
//! blur → combine, reusing blur's shader for its middle passes). This module
//! owns their registration; cross-family tests (the shorthand-default and
//! identity tables, WGSL validation) live here too.

mod bloom;
mod blur;
mod color_matrix;

use bevy::prelude::*;

pub use bloom::BloomParams;
pub use blur::BlurParams;
pub use color_matrix::{
    BrightnessParams, ContrastParams, GrayscaleParams, HueRotateParams, InvertParams,
    SaturateParams, SepiaParams,
};

use super::registry::FilterRegistry;

impl FilterRegistry {
    /// Register the nine built-in filters into this registry. Two callers:
    /// [`register_builtin_filters`] (the runtime path, via
    /// `ReactUiPlugin::build`) and the TypeScript exporter
    /// (`crate::ts_codegen`), which seeds a throwaway registry with them so
    /// built-ins are always exported even though the bare exporter `App`
    /// (`register_bindings` only) never adds the plugin.
    pub(crate) fn register_builtins(&mut self) {
        self.register::<BloomParams>();
        self.register::<BlurParams>();
        self.register::<BrightnessParams>();
        self.register::<ContrastParams>();
        self.register::<SaturateParams>();
        self.register::<GrayscaleParams>();
        self.register::<SepiaParams>();
        self.register::<InvertParams>();
        self.register::<HueRotateParams>();
    }
}

/// Register the nine built-in filters. Called by `ReactUiPlugin::build`.
/// Deliberately `AssetServer`-free: shader loads happen lazily inside each
/// entry's `resolve`.
pub fn register_builtin_filters(app: &mut App) {
    app.world_mut()
        .get_resource_or_init::<FilterRegistry>()
        .register_builtins();
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::filters::params::MAX_FILTER_PARAM_VECS;
    use crate::filters::registry::ReactFilter;
    use crate::filters::test_util::{asset_app, builtin_registry, params};
    use crate::protocol::Length;

    /// `{}` params take each filter's CSS-shorthand default: 1.0 for the six
    /// amount ops (identity for brightness/contrast/saturate, full effect for
    /// grayscale/sepia/invert), 0 for blur radius and hue angle.
    #[test]
    fn empty_params_default_to_css_shorthand_values() {
        assert_eq!(params::<BrightnessParams>(json!({})).amount, 1.0);
        assert_eq!(params::<ContrastParams>(json!({})).amount, 1.0);
        assert_eq!(params::<SaturateParams>(json!({})).amount, 1.0);
        assert_eq!(params::<SepiaParams>(json!({})).amount, 1.0);
        assert_eq!(params::<InvertParams>(json!({})).amount, 1.0);
        // A bare `{name:"grayscale"}` APPLIES the effect: amount 1.0, packed
        // into its slot.
        let g = params::<GrayscaleParams>(json!({}));
        assert_eq!(g.amount, 1.0);
        assert_eq!(g.pack().0[0].w, 1.0);
        assert_eq!(params::<BlurParams>(json!({})).radius, Length::Px(0.0));
        assert_eq!(params::<HueRotateParams>(json!({})).angle.radians(), 0.0);
        // A bare `{name:"bloom"}` is a visible glow.
        let b = params::<BloomParams>(json!({}));
        assert_eq!(b.radius, Length::Px(12.0));
        assert_eq!(b.threshold, 0.7);
        assert_eq!(b.intensity, 1.0);
    }

    /// Unknown param keys are rejected (deny-unknown-fields), both at the
    /// typed layer and through the registry's baked resolve fn.
    #[test]
    fn unknown_param_key_is_rejected() {
        assert!(serde_json::from_value::<BlurParams>(json!({ "radius": 4, "bogus": 1 })).is_err());
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<GrayscaleParams>();
        let err = (registry.entries["grayscale"].resolve)(&json!({ "typo": 2 }), assets)
            .expect_err("unknown key must reject");
        assert!(err.contains("grayscale"), "error names the filter: {err}");
    }

    /// Every built-in carries a TRUE identity — for grayscale/sepia/invert
    /// that is `0`, NOT their CSS shorthand default of `1` — and it resolves
    /// through the normal registry path to an identity packing.
    #[test]
    fn builtin_identity_params_are_true_identities() {
        let r = builtin_registry();
        let amount = |name: &str| (r.entries[name].identity)().unwrap()["amount"].clone();
        assert_eq!(amount("brightness"), json!(1.0));
        assert_eq!(amount("contrast"), json!(1.0));
        assert_eq!(amount("saturate"), json!(1.0));
        assert_eq!(amount("grayscale"), json!(0.0));
        assert_eq!(amount("sepia"), json!(0.0));
        assert_eq!(amount("invert"), json!(0.0));
        assert_eq!(
            (r.entries["blur"].identity)().unwrap()["radius"],
            json!(0.0)
        );
        assert_eq!(
            (r.entries["hueRotate"].identity)().unwrap()["angle"],
            json!(0.0)
        );
        assert_eq!(
            (r.entries["bloom"].identity)().unwrap()["intensity"],
            json!(0.0)
        );

        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let passes =
            (r.entries["grayscale"].resolve)(&(r.entries["grayscale"].identity)().unwrap(), assets)
                .expect("identity resolves");
        assert_eq!(passes[0].params[0].w, 0.0, "identity packing, no effect");

        // Bloom's identity resolves to the same four-pass structure (so
        // transitions stay `Aligned`) with intensity 0 packed in every pass —
        // the combine returns exactly the original regardless of
        // radius/threshold.
        let passes =
            (r.entries["bloom"].resolve)(&(r.entries["bloom"].identity)().unwrap(), assets)
                .expect("identity resolves");
        assert_eq!(passes.len(), 4);
        assert!(passes.iter().all(|p| p.params[1].y == 0.0));
    }

    /// The filter-pass WGSL parses and validates as naga modules. naga has no
    /// naga_oil composition, so the prelude is checked standalone (minus its
    /// `#define_import_path`) and each pass shader gets a poor-man's compose:
    /// its `#import` block textually replaced by the prelude body. Real
    /// composition is exercised by the live filter pipeline
    /// (`layer/render.rs`) on a real GPU.
    #[test]
    fn filter_wgsl_parses_and_validates() {
        /// Parse + validate, then assert the expected entry points exist.
        /// The entry-point check is load-bearing: if `splice` ever mangles a
        /// pass shader (e.g. an `#import` form its skip loop mis-parses), the
        /// degenerate result is usually the prelude body alone — which still
        /// validates — so without this assertion the test would go silently
        /// green while never checking the pass's fragment shader.
        fn validate(name: &str, source: &str, entry_points: &[&str]) {
            let module = naga::front::wgsl::parse_str(source)
                .unwrap_or_else(|e| panic!("{name} does not parse:\n{}", e.emit_to_string(source)));
            naga::valid::Validator::new(
                naga::valid::ValidationFlags::all(),
                naga::valid::Capabilities::all(),
            )
            .validate(&module)
            .unwrap_or_else(|e| panic!("{name} does not validate: {e:?}"));
            for entry in entry_points {
                assert!(
                    module.entry_points.iter().any(|e| e.name == *entry),
                    "{name} is missing entry point `{entry}` — splice mangled?"
                );
            }
        }

        /// Replace the (possibly multi-line) `#import ... }` block with the
        /// prelude body.
        fn splice(prelude_body: &str, src: &str) -> String {
            let mut out = String::new();
            let mut lines = src.lines();
            while let Some(line) = lines.next() {
                if line.trim_start().starts_with("#import") {
                    out.push_str(prelude_body);
                    out.push('\n');
                    if !line.contains('}') {
                        for rest in lines.by_ref() {
                            if rest.trim() == "}" {
                                break;
                            }
                        }
                    }
                } else {
                    out.push_str(line);
                    out.push('\n');
                }
            }
            out
        }

        let prelude_body: String = include_str!("../../layer/filter_prelude.wgsl")
            .lines()
            .filter(|l| !l.trim_start().starts_with("#define_import_path"))
            .collect::<Vec<_>>()
            .join("\n");
        validate("filter_prelude.wgsl", &prelude_body, &["vertex"]);
        validate(
            "color_matrix.wgsl",
            &splice(&prelude_body, include_str!("color_matrix.wgsl")),
            &["vertex", "fragment"],
        );
        validate(
            "blur.wgsl",
            &splice(&prelude_body, include_str!("blur.wgsl")),
            &["vertex", "fragment"],
        );
        validate(
            "bloom.wgsl",
            &splice(&prelude_body, include_str!("bloom.wgsl")),
            &["vertex", "fragment"],
        );

        // The prelude's params array must track `MAX_FILTER_PARAM_VECS`; a
        // mismatch would otherwise surface only at pipeline creation on a
        // live GPU (the filter-pass bind group in `layer/render.rs` vs. the
        // WGSL declaration).
        assert!(
            include_str!("../../layer/filter_prelude.wgsl")
                .contains(&format!("array<vec4<f32>, {MAX_FILTER_PARAM_VECS}>")),
            "filter_prelude.wgsl params array size must equal MAX_FILTER_PARAM_VECS"
        );
    }
}
