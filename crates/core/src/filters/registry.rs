//! The typed filter layer: the [`ReactFilter`] trait, resolved render passes
//! ([`ResolvedFilterPass`]), and the [`FilterRegistry`] of known filters with
//! their baked, `AssetServer`-free resolve/outset fn pointers.

use std::any::TypeId;
use std::collections::HashMap;
use std::sync::Arc;

use bevy::prelude::*;
use bevy::shader::Shader;
use serde::de::DeserializeOwned;
use serde_json::Value;
use ts_rs::TS;

use super::params::{ParamSlot, check_param_cap};
use crate::animations::ValueKind;
use crate::registry::{NamedEntry, register_entry};
use crate::ts_codegen::TsCollector;

/// A typed, named filter: how its params deserialize (strict — built-ins use
/// `#[serde(deny_unknown_fields)]`), pack into shader uniforms, and resolve
/// into render passes.
pub trait ReactFilter: Send + Sync + Sized + 'static {
    /// The wire name in a [`FilterUse`](crate::filters::FilterUse)
    /// (camelCase, e.g. `"hueRotate"`).
    const NAME: &'static str;

    /// Whether the effect is time-driven (must re-render every frame even
    /// with static params). None of the built-ins are.
    const USES_TIME: bool = false;

    /// Whether this is a two-input **morph** filter (a `morphFilter` name).
    /// The two families are separate: morph filters cannot appear in
    /// `filter`/`backdropFilter` chains and regular filters cannot be
    /// `morphFilter` names — enforced at resolve time per chain surface, and
    /// mirrored in the generated TypeScript (`BevyFilters` vs
    /// `BevyMorphFilters`). Set by `#[react_morph_filter]`; regular filters
    /// keep the default.
    const IS_MORPH: bool = false;

    /// The params JSON of this filter's **identity** invocation (no visual
    /// effect), if it has one — brightness/contrast/saturate `amount: 1`,
    /// grayscale/sepia/invert `amount: 0` (their identity is `0`, NOT the
    /// shorthand default of `1`), blur `radius: 0` (its identity — NOT its
    /// 20px omitted-param default), hueRotate `angle: 0`.
    ///
    /// Consumed by the transition engine's filter channel: when a chain
    /// gains/loses trailing entries, the shorter side is padded with identity
    /// passes so the change *fades* instead of popping (see
    /// [`plan_filter_ease`](crate::filters::plan_filter_ease)). The identity
    /// value is resolved through the normal [`resolve`](Self::resolve) path,
    /// so its packing, layout, and shader handles match the real filter's for
    /// free. `None` (the default — `#[react_filter]` custom filters keep it)
    /// opts out of extension: mismatched chains involving the filter swap
    /// discretely.
    fn identity_params() -> Option<Value> {
        None
    }

    /// The pass shader. Lazy: called inside `resolve`, never at registration
    /// time, so registering filters needs no `AssetServer`.
    fn shader(assets: &AssetServer) -> Handle<Shader>;

    /// Extra *logical* px the effect bleeds outside the node's rect (blur
    /// reach). Identity for most filters. Fallible so params that cannot
    /// yield a px value (blur's non-px radius) reject instead of silently
    /// packing `0.0`.
    fn outset(&self) -> Result<f32, String> {
        Ok(0.0)
    }

    /// Pack the params into the uniform `Vec4` array plus the layout saying
    /// where each named param landed. `Length` params pack their logical-px
    /// value (see [`ParamSlot`]).
    ///
    /// **Contract:** this is the canonical *single-invocation* packing;
    /// `resolve` overrides may repack (e.g. blur's per-direction params), but
    /// must agree with the layout for named slots. Every slot obeys
    /// [`ParamSlot`]'s no-straddle rule: `comp + len <= 4`, padding to the
    /// next `Vec4` where needed. `#[react_filter]`-generated impls fill the
    /// array contiguously in field declaration order; the built-ins keep
    /// their hand-written canonical layouts.
    fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>);

    /// Resolve into render passes. The default builds one pass straight from
    /// [`pack`](Self::pack) (see [`resolve_single_pass`]); multi-pass effects
    /// (blur: H then V) override it. Passes come back with `wire_index: 0` —
    /// resolve fns don't know their chain position; the chain resolver
    /// rewrites it (see [`ResolvedFilterPass::wire_index`]).
    fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
        resolve_single_pass(self, assets)
    }
}

/// Marker for two-input morph filters (`morphFilter` names). Implemented by
/// `#[react_morph_filter]` (and the built-in morphs); the bound on
/// `add_react_morph_filter` gives compile-time guidance — registration truth
/// rides [`ReactFilter::IS_MORPH`].
pub trait ReactMorphFilter: ReactFilter {}

/// The default single-pass resolve body: [`ReactFilter::pack`] + the
/// param-vec cap check + one pass tagged `wire_index: 0`.
///
/// `pub` so `#[react_filter]`-generated `resolve` overrides (which prepend
/// `Length` px validation) can delegate to the canonical body from consumer
/// crates instead of re-implementing the cap check.
pub fn resolve_single_pass<T: ReactFilter>(
    filter: &T,
    assets: &AssetServer,
) -> Result<Vec<ResolvedFilterPass>, String> {
    let (params, layout) = filter.pack();
    check_param_cap(T::NAME, params.len())?;
    Ok(vec![ResolvedFilterPass {
        shader: T::shader(assets),
        params,
        layout,
        wire_index: 0,
    }])
}

/// One resolved render pass of a filter chain.
#[derive(Debug, Clone, PartialEq)]
pub struct ResolvedFilterPass {
    pub shader: Handle<Shader>,
    /// The packed uniform array (at most
    /// [`MAX_FILTER_PARAM_VECS`](crate::filters::MAX_FILTER_PARAM_VECS)
    /// entries).
    pub params: Vec<Vec4>,
    /// Where each named param sits in `params` (animation + physical-px
    /// rewrite metadata).
    pub layout: Arc<[ParamSlot]>,
    /// Index of the originating [`FilterUse`](crate::filters::FilterUse) in
    /// the wire chain — blur's two expanded passes share one. Resolve fns
    /// always emit `0`; the chain resolve system
    /// ([`resolve_chains`](crate::filters::resolve_chains))
    /// rewrites it per chain position.
    ///
    /// **Rewrite rule:** chains longer than `u8::MAX` saturate — the
    /// rewriter must clamp to `u8::MAX`, never wrap. Wire input can't reach
    /// saturation (decode caps chains at
    /// [`MAX_CHAIN_LEN`](crate::filters::MAX_CHAIN_LEN) entries, so every
    /// decoded index fits); the rule exists for programmatic chains.
    pub wire_index: u8,
}

/// Physical-px rewrite: `Length` slots are packed logical (the [`ParamSlot`]
/// contract) — scale them for upload. Bounds are defended so a custom
/// filter's bad layout can't panic here. Shared by
/// [`resolve_chains`](crate::filters::resolve_chains) and the
/// transition padding
/// ([`plan_filter_ease`](crate::filters::plan_filter_ease)) via
/// [`stamp_and_push`].
pub(super) fn rewrite_length_slots(pass: &mut ResolvedFilterPass, scale: f32) {
    let layout = pass.layout.clone();
    for slot in layout.iter().filter(|s| s.kind == ValueKind::Length) {
        for comp in slot.comp..(slot.comp + slot.len).min(4) {
            if let Some(vec) = pass.params.get_mut(slot.vec) {
                vec[comp] *= scale;
            }
        }
    }
}

/// Append one resolved chain entry's passes to a pass list: stamp the wire
/// index — saturating at `u8::MAX`, never wrapping (see
/// [`ResolvedFilterPass::wire_index`]; decode caps chains under the limit,
/// but programmatic chains could exceed it) — and rewrite `Length` slots to
/// physical px. The one post-processing path shared by the chain resolver
/// and the transition engine's identity padding, so the two writers can never
/// drift.
pub(super) fn stamp_and_push(
    passes: Vec<ResolvedFilterPass>,
    wire_index: usize,
    scale: f32,
    out: &mut Vec<ResolvedFilterPass>,
) {
    let wire_index = wire_index.min(u8::MAX as usize) as u8;
    for mut pass in passes {
        pass.wire_index = wire_index;
        rewrite_length_slots(&mut pass, scale);
        out.push(pass);
    }
}

/// One registered filter: everything the chain resolver needs, baked into
/// `AssetServer`-free fn pointers at registration time (shader loading stays
/// lazy — the pointers *receive* the `&AssetServer`).
///
/// `resolve` and `outset` each deserialize the params — intentionally, not an
/// oversight: the duplication keeps `outset` `AssetServer`-free, so the future
/// per-frame texture-sizing path never grows an `AssetServer` dependency. Do
/// not "optimize" them into one fn.
pub struct FilterRegistration {
    type_id: TypeId,
    /// Deserialize a raw [`FilterUse::params`](crate::filters::FilterUse)
    /// value (strict) and resolve it into render passes. Errors are messages
    /// for the devtools warning sink.
    pub(crate) resolve: fn(&Value, &AssetServer) -> Result<Vec<ResolvedFilterPass>, String>,
    /// Deserialize the raw params and report the filter's logical-px outset.
    /// Separate from `resolve` so the chain resolver can size layer textures
    /// without an `AssetServer` in hand.
    pub(crate) outset: fn(&Value) -> Result<f32, String>,
    /// Mirrors [`ReactFilter::USES_TIME`].
    pub(crate) uses_time: bool,
    /// Mirrors [`ReactFilter::IS_MORPH`] — which family the name belongs to
    /// (regular chains vs `morphFilter`).
    pub(crate) is_morph: bool,
    /// Mirrors [`ReactFilter::identity_params`] — `None` means the filter has
    /// no identity and cannot pad a chain extension (see
    /// [`plan_filter_ease`](crate::filters::plan_filter_ease)).
    pub(crate) identity: fn() -> Option<Value>,
    /// The params type's TypeScript reference name (export-only; the wire
    /// name is this entry's key in [`FilterRegistry::entries`], exactly like
    /// the event registry).
    pub(crate) ts_name: fn() -> String,
    /// Collects the params type declaration (and its dependencies).
    pub(crate) ts_collect: fn(&mut TsCollector),
}

impl NamedEntry for FilterRegistration {
    fn type_id(&self) -> TypeId {
        self.type_id
    }
}

/// Known filters, keyed by wire name. Populated by
/// [`register_builtin_filters`](crate::filters::register_builtin_filters);
/// consumed by
/// [`resolve_chains`](crate::filters::resolve_chains).
#[derive(Resource, Default)]
pub struct FilterRegistry {
    pub(crate) entries: HashMap<&'static str, FilterRegistration>,
}

impl FilterRegistry {
    /// Register filter type `T` under `T::NAME`. Idempotent per type; a
    /// different type claiming an occupied name warns and replaces (see
    /// [`register_entry`]).
    pub fn register<T: ReactFilter + DeserializeOwned + TS>(&mut self) {
        register_entry(
            &mut self.entries,
            T::NAME,
            "filter",
            FilterRegistration {
                type_id: TypeId::of::<T>(),
                resolve: |value, assets| {
                    let passes = decode_params::<T>(value)?.resolve(assets)?;
                    // Custom `resolve` overrides bypass the default's cap
                    // check, so re-check every pass here.
                    for pass in &passes {
                        check_param_cap(T::NAME, pass.params.len())?;
                    }
                    Ok(passes)
                },
                outset: |value| decode_params::<T>(value)?.outset(),
                uses_time: T::USES_TIME,
                is_morph: T::IS_MORPH,
                identity: T::identity_params,
                // `T` is concrete here, so its TS shape is baked into these
                // fns (the same split as `EventRegistration`).
                ts_name: <T as TS>::name,
                ts_collect: |c| c.add::<T>(),
            },
        );
    }
}

fn decode_params<T: ReactFilter + DeserializeOwned>(value: &Value) -> Result<T, String> {
    T::deserialize(value).map_err(|e| format!("filter {:?} params: {e}", T::NAME))
}

#[cfg(test)]
mod tests {
    use std::f32::consts::PI;

    use serde::Deserialize;
    use serde_json::json;

    use super::super::test_util::asset_app;
    use super::*;
    use crate::filters::{
        BlurParams, HueRotateParams, MAX_FILTER_PARAM_VECS, register_builtin_filters,
    };

    /// A filter packing more than `MAX_FILTER_PARAM_VECS` vec4s fails to
    /// resolve.
    #[test]
    fn over_cap_param_vecs_are_rejected() {
        struct NineVecs;
        impl ReactFilter for NineVecs {
            const NAME: &'static str = "nineVecs";
            fn shader(_assets: &AssetServer) -> Handle<Shader> {
                Handle::default()
            }
            fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
                (
                    vec![Vec4::ZERO; MAX_FILTER_PARAM_VECS + 1],
                    Arc::from(Vec::new()),
                )
            }
        }
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let err = NineVecs.resolve(assets).expect_err("over cap must reject");
        assert!(err.contains("nineVecs"), "error names the filter: {err}");
    }

    /// The registry's baked `resolve` re-checks the cap on every pass, so a
    /// custom `resolve` override can't smuggle an over-cap pass past the
    /// default-resolve check.
    #[test]
    fn registry_recheck_rejects_over_cap_custom_resolve() {
        #[derive(Deserialize, ts_rs::TS)]
        #[serde(deny_unknown_fields)]
        struct SneakyResolve {}
        impl ReactFilter for SneakyResolve {
            const NAME: &'static str = "sneakyResolve";
            fn shader(_assets: &AssetServer) -> Handle<Shader> {
                Handle::default()
            }
            fn pack(&self) -> (Vec<Vec4>, Arc<[ParamSlot]>) {
                (Vec::new(), Arc::from(Vec::new()))
            }
            fn resolve(&self, assets: &AssetServer) -> Result<Vec<ResolvedFilterPass>, String> {
                Ok(vec![ResolvedFilterPass {
                    shader: Self::shader(assets),
                    params: vec![Vec4::ZERO; MAX_FILTER_PARAM_VECS + 1],
                    layout: Arc::from(Vec::new()),
                    wire_index: 0,
                }])
            }
        }
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<SneakyResolve>();
        let err = (registry.entries["sneakyResolve"].resolve)(&json!({}), assets)
            .expect_err("over-cap custom resolve must reject");
        assert!(
            err.contains("sneakyResolve"),
            "error names the filter: {err}"
        );
    }

    /// `register_builtin_filters` registers all seventeen names; running it
    /// again (same types) is a no-op per `register_entry` semantics.
    #[test]
    fn builtin_filters_register_all_seventeen() {
        let mut app = App::new();
        register_builtin_filters(&mut app);
        let registry = app.world().resource::<FilterRegistry>();
        let mut names: Vec<_> = registry.entries.keys().copied().collect();
        names.sort_unstable();
        assert_eq!(
            names,
            [
                "bloom",
                "blur",
                "brightness",
                "chromaticAberration",
                "contrast",
                "crossfade",
                "gradientMap",
                "grayscale",
                "hueRotate",
                "invert",
                "linearWipe",
                "outline",
                "pinch",
                "pixelize",
                "saturate",
                "sepia",
                "shadow",
            ]
        );
        assert!(registry.entries.values().all(|r| !r.uses_time));
        // The morph family is exactly the three morph built-ins.
        let mut morphs: Vec<_> = registry
            .entries
            .iter()
            .filter(|(_, r)| r.is_morph)
            .map(|(name, _)| *name)
            .collect();
        morphs.sort_unstable();
        assert_eq!(morphs, ["crossfade", "linearWipe", "pixelize"]);
        register_builtin_filters(&mut app);
        assert_eq!(app.world().resource::<FilterRegistry>().entries.len(), 17);
    }

    /// Every built-in entry carries working TS-export slots — `ts_name` names
    /// the params type and `ts_collect` declares it into a collector — so the
    /// TS exporter (`message.rs::render_typescript`) walks built-ins exactly
    /// like custom filters.
    #[test]
    fn builtin_filters_have_working_ts_slots() {
        let mut app = App::new();
        register_builtin_filters(&mut app);
        let registry = app.world().resource::<FilterRegistry>();
        for (name, reg) in &registry.entries {
            let ts = (reg.ts_name)();
            let mut c = TsCollector::default();
            (reg.ts_collect)(&mut c);
            assert!(c.decls.contains_key(&ts), "{name}: no decl for {ts}");
        }

        let blur = &registry.entries["blur"];
        assert_eq!((blur.ts_name)(), "BlurParams");
        let mut c = TsCollector::default();
        (blur.ts_collect)(&mut c);
        let decl = &c.decls["BlurParams"];
        // The `Length` field mirrors `#[react_filter]`'s wire-flexible
        // `number | string` override.
        assert!(decl.contains("radius"), "{decl}");
        assert!(decl.contains("number | string"), "{decl}");

        // The six amount ops share the macro-generated shape; `Angle` gets
        // the same override as `Length`.
        assert_eq!((registry.entries["grayscale"].ts_name)(), "GrayscaleParams");
        assert_eq!((registry.entries["hueRotate"].ts_name)(), "HueRotateParams");
        let mut c = TsCollector::default();
        (registry.entries["hueRotate"].ts_collect)(&mut c);
        assert!(
            c.decls["HueRotateParams"].contains("angle: number | string"),
            "{}",
            c.decls["HueRotateParams"]
        );
    }

    /// The registry's fn pointers carry the whole pipeline: deserialize →
    /// pack → passes, and the separate outset accessor.
    #[test]
    fn registry_resolve_end_to_end() {
        let app = asset_app();
        let assets = app.world().resource::<AssetServer>();
        let mut registry = FilterRegistry::default();
        registry.register::<BlurParams>();
        registry.register::<HueRotateParams>();

        let blur = &registry.entries["blur"];
        let passes = (blur.resolve)(&json!({ "radius": 8 }), assets).expect("blur resolves");
        assert_eq!(passes.len(), 2);
        assert_eq!(passes[0].params[0].x, 8.0);
        assert_eq!(
            (blur.outset)(&json!({ "radius": 8 })).expect("outset"),
            24.0
        );

        let hue = &registry.entries["hueRotate"];
        let passes = (hue.resolve)(&json!({ "angle": "0.5turn" }), assets).expect("hue resolves");
        assert_eq!(passes.len(), 1);
        assert!((passes[0].params[1].z - PI).abs() < 1e-4);
        assert_eq!((hue.outset)(&json!({})).expect("outset"), 0.0);
    }

    /// Under the asset-capable harness every built-in resolves to real
    /// embedded shader handles: the seven color ops share
    /// `color_matrix.wgsl`, blur's two passes share `blur.wgsl`, the two
    /// shaders are distinct, and bloom's four passes mix `bloom.wgsl`
    /// (bright-pass/combine) with blur's handle (its middle passes).
    #[test]
    fn resolve_returns_embedded_shader_handles() {
        let mut app = asset_app();
        register_builtin_filters(&mut app);
        let world = app.world();
        let assets = world.resource::<AssetServer>();
        let registry = world.resource::<FilterRegistry>();

        let shader_of = |name: &str| {
            let passes =
                (registry.entries[name].resolve)(&json!({}), assets).expect("filter resolves");
            let first = passes[0].shader.clone();
            assert!(
                passes.iter().all(|p| p.shader == first),
                "all of {name}'s passes share one shader"
            );
            assert_ne!(first, Handle::default(), "{name} has a real shader");
            first
        };
        let path_of = |handle: &Handle<Shader>| handle.path().expect("embedded path").to_string();

        let color = shader_of("brightness");
        for name in [
            "contrast",
            "saturate",
            "grayscale",
            "sepia",
            "invert",
            "hueRotate",
        ] {
            assert_eq!(shader_of(name), color, "{name} shares the color shader");
        }
        assert_eq!(
            &path_of(&color),
            "embedded://bevy_react/filters/builtin/color_matrix.wgsl"
        );

        let blur = shader_of("blur");
        assert_ne!(blur, color);
        assert_eq!(
            &path_of(&blur),
            "embedded://bevy_react/filters/builtin/blur.wgsl"
        );

        assert_eq!(
            &path_of(&shader_of("chromaticAberration")),
            "embedded://bevy_react/filters/builtin/chromatic_aberration.wgsl"
        );

        assert_eq!(
            &path_of(&shader_of("gradientMap")),
            "embedded://bevy_react/filters/builtin/gradient_map.wgsl"
        );
        assert_eq!(
            &path_of(&shader_of("outline")),
            "embedded://bevy_react/filters/builtin/outline.wgsl"
        );
        assert_eq!(
            &path_of(&shader_of("pinch")),
            "embedded://bevy_react/filters/builtin/pinch.wgsl"
        );

        // Bloom deliberately mixes shaders across its passes, so it can't go
        // through `shader_of`.
        let passes =
            (registry.entries["bloom"].resolve)(&json!({}), assets).expect("bloom resolves");
        assert_eq!(passes.len(), 4);
        assert_eq!(
            &path_of(&passes[0].shader),
            "embedded://bevy_react/filters/builtin/bloom.wgsl"
        );
        assert_eq!(passes[3].shader, passes[0].shader);
        assert_eq!(passes[1].shader, blur, "middle passes reuse blur's shader");
        assert_eq!(passes[2].shader, blur);

        // Shadow mirrors bloom's structure: prep/combine on its own shader,
        // blur's shader in the middle.
        let passes =
            (registry.entries["shadow"].resolve)(&json!({}), assets).expect("shadow resolves");
        assert_eq!(passes.len(), 4);
        assert_eq!(
            &path_of(&passes[0].shader),
            "embedded://bevy_react/filters/builtin/shadow.wgsl"
        );
        assert_eq!(passes[3].shader, passes[0].shader);
        assert_eq!(passes[1].shader, blur, "middle passes reuse blur's shader");
        assert_eq!(passes[2].shader, blur);
    }
}
