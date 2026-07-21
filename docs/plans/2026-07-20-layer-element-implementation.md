# `<layer>` Element Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **Project rule (overrides the skill template):** do NOT create git branches or commits — the user owns git. At each "Checkpoint" step, stop and let the user review/commit.
> **Design doc (read first):** `docs/plans/2026-07-20-layer-element-design.md` — all semantics, decisions, and rationale live there. This plan is the mechanical breakdown.

**Goal:** A `<layer>` host element that renders its subtree to an offscreen texture and displays it through a Rust-registered custom-shader `UiMaterial`, with group opacity, JS-driven uniforms, 3D transforms + input, world backdrop, and animation-module integration.

**Architecture:** Display node in-tree (`MaterialNode<LayerMaterial>`) + internal companion detached UI root rendered by a per-layer `Camera2d` into an auto-sized `Image` (surface/portal hybrid). One generic material; effects = WGSL shader handle + uniform schema in a registry that also feeds `bevy.ts` codegen. Full details: design doc §4.

**Tech stack:** Bevy 0.19 (`UiMaterial`/`MaterialNode`, `UiTargetCamera`, `RenderTarget::Image`), react-reconciler, esbuild, ts-rs (codegen surface only — wire types are hand-mirrored per repo convention).

**Verification commands used throughout:**

- `cargo test -p bevy-react --lib layer` — module unit tests
- `cargo test -p bevy-react --test roundtrip` — headless bridge E2E (needs `npm run build -w demos` first)
- `npm run lint` / `npm run typecheck` — JS + clippy
- `npm run bevy:generate -w demos && git diff --exit-code examples/demos/ui/src/bevy.ts` — codegen sync
- `cargo run -p bevy-react --example demos -- --shoot "<layer>" out.png` — visual verification (per CLAUDE.md, never OS capture)

---

## Phase 1 — Core composite: element, registry, material, codegen, demo

### Task 1.1: `layer` module — wire types + uniform schema + packing

**Files:**

- Create: `crates/core/src/layer.rs` (submodule split later if it grows)
- Modify: `crates/core/src/lib.rs` (declare `pub mod layer;`)

**Step 1: Write failing unit tests** (in `layer.rs` `#[cfg(test)]`):

```rust
#[test]
fn packs_uniforms_into_slots_std140_style() {
    // f32 takes one lane; vec2 aligns to 2; vec3/vec4/color take a full vec4.
    let effect = LayerEffect::new("fx")
        .uniform("a", UniformKind::F32, 1.0)          // slot 0 lane x
        .uniform("b", UniformKind::Vec2, [2.0, 3.0])  // slot 0 lanes z,w (aligned)
        .uniform("c", UniformKind::Color, Color::WHITE); // slot 1
    let schema = effect.schema();
    assert_eq!(schema.lookup("a").unwrap().offset, 0);
    assert_eq!(schema.lookup("b").unwrap().offset, 2);
    assert_eq!(schema.lookup("c").unwrap().offset, 4);
}

#[test]
fn defaults_fill_packed_array() { /* schema.packed_defaults() puts 1.0 at a's lane, etc. */ }

#[test]
#[should_panic] // > 64 float lanes must fail loudly at registration
fn overflowing_uniform_budget_panics() { /* 17 Vec4 uniforms */ }

#[test]
fn generates_wgsl_preamble_with_typed_accessors() {
    // Preamble declares fn u_a() -> f32 { return layer_params(0u).x; } style accessors.
    let effect = LayerEffect::new("fx").uniform("strength", UniformKind::F32, 0.5);
    let pre = effect.wgsl_preamble();
    assert!(pre.contains("fn u_strength() -> f32"));
}

#[test]
fn decodes_uniform_values_from_wire() {
    // Wire form: {"strength": 0.5, "tint": "#ff0000ff", "dir": [1, 0]}
    // Colors are hex strings (match the style color convention), vectors arrays.
    let v: LayerUniformMap = serde_json::from_str(
        r#"{"strength": 0.5, "tint": "#ff0000ff", "dir": [1, 0]}"#).unwrap();
    assert!(matches!(v.get("strength"), Some(LayerUniformValue::Scalar(_))));
}
```

**Step 2:** `cargo test -p bevy-react --lib layer` → FAIL (module doesn't exist).

**Step 3: Implement.** Contents of `layer.rs` (follow `filter.rs` + `canvas/mod.rs` doc-comment style):

- `UniformKind { F32, Vec2, Vec3, Vec4, Color }` with `lanes()` and `align()`.
- `UniformDecl { name: String, kind: UniformKind, offset: usize, default: [f32; 4] }`.
- `LayerEffectSchema { decls: Vec<UniformDecl> }` with `lookup(&str)`, `packed_defaults() -> [Vec4; MAX_LAYER_UNIFORM_VEC4S]`; `MAX_LAYER_UNIFORM_VEC4S = 16`.
- `LayerEffect` builder: `new(name)`, `.shader(impl Into<ShaderSource>)` (asset path or `Handle<Shader>`), `.uniform(name, kind, default)`, `.backdrop(bool)` (stored now, used in phase 3). Packing computed eagerly in `.uniform()`; panic with a clear message on overflow/duplicate name.
- `wgsl_preamble()` — generated accessor functions over the packed array (see design doc §2 WGSL contract). Colors decode via the existing hex parser used by styles (find it in `ui_map.rs`/`protocol.rs` — reuse, don't duplicate).
- Wire types (hand-mirrored TS later, per convention): `LayerUniformValue` (untagged serde: `Scalar(f32) | Vec(Vec<f32>) | Hex(String)`), `LayerUniformMap(BTreeMap<String, LayerUniformValue>)` — `BTreeMap` for deterministic iteration like `AnimatedBindings`.
- Unknown-name / kind-mismatch resolution happens at apply time (Task 1.5), reported via `crate::diag` — **not** at decode (schema isn't known at decode time).

**Step 4:** `cargo test -p bevy-react --lib layer` → PASS. Run `cargo clippy -p bevy-react --all-targets` (CLAUDE.md: fix lints immediately).

### Task 1.2: `LayerMaterial` + shaders + effect registry resource

**Files:**

- Modify: `crates/core/src/layer.rs`
- Create: `crates/core/src/layer.wgsl` (default fragment: sample layer texture × group alpha)
- Modify: `crates/core/src/plugin.rs` (embed shader, `UiMaterialPlugin::<LayerMaterial>`, `LayerEffects` resource init, `register_layer_effect` App extension)

**Step 1: Failing tests:**

```rust
#[test]
fn none_effect_is_registered_by_default() { /* LayerEffects::default_with_builtins() has "none" */ }

#[test]
fn effect_registration_is_deterministic_and_rejects_duplicates() { /* sorted iter; dup name panics */ }
```

**Step 2:** run → FAIL.

**Step 3: Implement.**

```rust
#[derive(Asset, AsBindGroup, Reflect, Clone)]
#[bind_group_data(LayerKey)]
pub struct LayerMaterial {
    #[uniform(0)] pub packed: LayerPacked, // { group_alpha: f32, _pad: Vec3, params: [Vec4; 16] }  (mat4 transform joins in phase 2)
    #[texture(1)] #[sampler(2)] pub layer: Handle<Image>,
    // backdrop bindings (3)/(4) added in phase 3 — bind a shared 1x1 dummy until then
}

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct LayerKey { pub shader: Handle<Shader> }
impl From<&LayerMaterial> for LayerKey { /* from a shader Handle stored on the material (skip AsBindGroup upload via #[data] — check the AsBindGroup derive docs; if a plain field can't be skipped, store the handle inside LayerKey via a non-uniform field pattern used by StandardMaterialKey) */ }

impl UiMaterial for LayerMaterial {
    fn fragment_shader() -> ShaderRef { "embedded://bevy_react/layer.wgsl".into() } // fallback; specialize overrides
    fn specialize(desc: &mut RenderPipelineDescriptor, key: UiMaterialKey<Self>) {
        desc.fragment.as_mut().unwrap().shader = key.bind_group_data.shader.clone();
    }
}
```

- `LayerPacked` derives `ShaderType` (uniform struct). Keep `group_alpha` inside it.
- `LayerEffects` resource: `BTreeMap<String, RegisteredEffect { shader: Handle<Shader>, schema: LayerEffectSchema, wants_backdrop: bool }>`.
- Effect finalization: at registration, compose `Shader::from_wgsl(preamble + common_header + user_fragment_source, virtual_path)`. For asset-path shaders this needs the source; simplest v1: effects supply WGSL source (`include_str!` for builtins, `&'static str`/`String` for apps) — **not** an asset path. Document this limitation in the builder rustdoc; asset-path support is a follow-up.
- `layer.wgsl`: the common header (bind group decls per design §2) + the `"none"` fragment: `return textureSample(layer_tex, layer_smp, in.uv) * vec4(1.0, 1.0, 1.0, u_group_alpha());`. NOTE: the layer texture is **premultiplied-ish output of a UI camera render** — verify blending visually in Task 1.7 and against `ui_material.wgsl`'s ALPHA_BLENDING expectations; correct in the shader if fringing appears.
- `plugin.rs`: `embedded_asset!(app, "layer.wgsl")`; `app.add_plugins(UiMaterialPlugin::<LayerMaterial>::default())`; init `LayerEffects` with builtin `"none"`; add `pub trait LayerAppExt { fn register_layer_effect(&mut self, effect: LayerEffect) -> &mut App; }` next to the other App extensions (grep `add_react_handler` for placement + style).

**Step 4:** tests PASS; `cargo clippy` clean.

**Checkpoint** — user review/commit.

### Task 1.3: Protocol — `Props.effect` + `Style.uniforms` row + tests

**Files:**

- Modify: `crates/core/src/protocol.rs`

**Step 1: Failing tests** (mirror existing `protocol::tests` patterns; see memory note "serde enum rename_all skips fields" — add a decode round-trip per new field):

```rust
#[test]
fn decodes_layer_props() {
    let p: Props = serde_json::from_str(
        r#"{"effect": "frost", "style": {"uniforms": {"strength": 0.5}}}"#).unwrap();
    assert_eq!(p.effect.as_deref(), Some("frost"));
    assert!(p.style.unwrap().uniforms.is_some());
}

#[test]
fn uniforms_style_field_marks_layer_dirty_group() { /* overlay_delta sets StyleDirty::LAYER */ }

#[test]
fn style_unset_uniforms_resets() { /* merge_delta with style_unset: ["uniforms"] clears it */ }
```

**Step 2:** FAIL.

**Step 3: Implement.**

- `Props`: add `#[serde(default)] pub effect: Option<String>` in a new `// --- layer element attributes ---` section (document: identity-like, mirrors `target`).
- `Style`: add `pub uniforms: Option<crate::layer::LayerUniformMap>` — one new row in `with_style_fields!` (`(uniforms, "uniforms", (LAYER), overlay)`); add `StyleDirty::LAYER` bit. The macro + the completeness test enforce the rest (the compile error guides you — CLAUDE.md documents this guard).
- `merge_delta`: nothing special — `uniforms` is an ordinary overlay style field (later declarative updates re-apply the whole map; per-name diffing is NOT needed on the wire — the map is small).

**Step 4:** `cargo test -p bevy-react --lib protocol` → PASS (including the pre-existing completeness guards).

### Task 1.4: Reconcile — `"layer"` create arm, companion root, child redirect, cleanup

This is the heart of phase 1. Read `reconcile.rs:308-631` (create/append/insert/remove) and `bridge.rs` side tables before touching anything.

**Files:**

- Modify: `crates/core/src/reconcile.rs`, `crates/core/src/bridge.rs`, `crates/core/src/layer.rs`

**Step 1: Failing test** — add a lib-level ECS test (grep existing `reconcile` tests for the harness pattern; there are `World`-driven tests around ops):

```rust
#[test]
fn layer_create_spawns_display_node_and_companion_root() {
    // apply an Op::Create{kind: "layer"} + Op::Append{parent: 0, child: layer}
    // + a child node appended to the layer id →
    // assert: display entity has MaterialNode<LayerMaterial> + RLayer;
    // companion exists, is parentless, has LayerRoot(display);
    // the child entity's ChildOf is the companion, NOT the display node.
}

#[test]
fn layer_remove_despawns_companion_and_children() { /* Op::Remove of an ancestor kills all three */ }
```

**Step 2:** FAIL.

**Step 3: Implement.**

- `layer.rs` components: `RLayer { companion: Entity, effect: String }` on the display node; `LayerRoot(pub Entity /* display */)` on the companion.
- Create arm (new `"layer"` match in `Op::Create`, modeled on `"canvas"` + `"surface"`):
  - Display node: `RNode(id)`, `apply_style`, per-entity material `MaterialNode(materials.add(LayerMaterial{...defaults, "none"-or-effect shader...}))` — **never** a dedup cache (design §4: animated uniforms mutate it). Style variants/handlers/animated/anchor appliers like `"canvas"`.
  - Companion: `commands.spawn((Node { position_type: Absolute, width/height Px(0) placeholder, flex column }, LayerRoot(display), Visibility::Hidden /* until camera binds */))`. Reuse `surface_root_base()`-style base fn (`layer_root_base()`).
  - Side tables: `bridge.layers: HashMap<NodeId, Entity /* companion */>` (new); record `effect` on the material via `LayerEffects` lookup (unknown effect → `"none"` + `diag::report` warn kind `"layerEffect"`).
- Child redirect: in `Op::Append`/`Op::Insert`/the end-of-batch reorder rebuild, resolve the **container entity** through a helper: `fn resolve_container(bridge, id) -> Option<Entity>` returning the companion for layer ids, else `nodes[id]`. Grep every `resolve(&bridge, parent)` call used as an attach target and switch those (child resolution stays as-is).
- Cleanup: extend `bridge.surfaces_under` traversal so detached roots nested under a removed layer keep working (the shadow tree already spans layer children since append/insert record parent normally). Companion + camera + image GC: do **not** put it in `Op::Remove` — add to `drive_layers` (Task 1.5): a `LayerRoot(display)` whose display entity is gone → despawn companion recursively + its camera. This also covers recursive-despawn-of-ancestor, which never emits an op for the layer node itself.
- `Reset` arm: despawn all `bridge.layers` companions; clear the table (mirror the surfaces/roots loop at `reconcile.rs:273-306`).
- Update arm: `effect` change → look up new shader handle, rewrite the material's key source field (material asset mutation re-specializes); `dirty.style.intersects(LAYER)` → re-pack declarative uniforms into `packed.params` via the schema (unknown name/kind mismatch → `diag::report` under `node_scope`, kind `"layerUniform"`).

**Step 4:** tests PASS. `cargo test -p bevy-react --lib` (full lib — regressions in append/insert/remove paths are the risk here).

**Checkpoint** — user review/commit.

### Task 1.5: `bind_layers` / `drive_layers` systems — camera, texture, auto-size

**Files:**

- Modify: `crates/core/src/layer.rs`, `crates/core/src/plugin.rs`

**Step 1: Failing test** (Bevy `App`-level, mirror `surface.rs`/`portal.rs` tests if present; else a minimal headless `App` with the plugin's system set):

```rust
#[test]
fn bind_layers_creates_camera_and_binds_companion() { /* after update: LayerCamera exists, order == -2 (root layer depth 1 → -1-1? pick -1 for depth 0 — match surface convention: top-level layer = -1, nested = -2…), companion has UiTargetCamera + Visibility::Inherited */ }

#[test]
fn layer_texture_tracks_display_size() { /* fake ComputedNode on display → image resized to the EXACT physical size (no quantization — see the amendment below) */ }

#[test]
fn orphan_companion_is_despawned() { /* despawn display entity → next update removes companion + camera */ }
```

**Step 2:** FAIL.

**Step 3: Implement** (port `portal::drive_render_targets` resize + `surface::bind_surfaces`/`drive_surfaces` lifecycle):

- `bind_layers`: for each `RLayer` without a bound camera — create `Image::new_target_texture` sized from the display's `ComputedNode` (min 1×1), spawn `Camera2d { order: -1 - depth, clear_color: NONE (transparent!), target: Image }` + `LayerCamera(display)`, insert `UiTargetCamera(camera)` on companion, set material `layer` handle, `Visibility::Inherited`. Depth = number of `RLayer` ancestors, computed via the bridge shadow tree (`bridge.parent_of` chain over NodeIds).
- `drive_layers`: resize image on display `ComputedNode` change (physical px = logical × UI scale); sync companion root `Node { width/height: Px(logical) }`; write `packed.group_alpha` from `style.opacity` (resolve: layer interprets the existing `opacity` style field as group alpha — make sure the normal per-node opacity path in `ui_map.rs` does NOT also apply it to the display node; grep how `opacity` currently applies and special-case `RLayer`); GC orphans (Task 1.4).
- **AMENDMENT (found during execution):** layer textures are sized to the display's **exact** physical size, NOT portal-quantized. The composite material samples UV 0→1 over the whole texture while the companion lays out at the exact box — SIZE_STEP quantization leaves dead margins and shrinks the content by up to 15px/axis (a portal has no such mismatch: its camera fills any target size). Also: `drive_layers` keeps `ImageRenderTarget::scale_factor` synced to the display's scale factor, or hidpi companions would lay out into a fraction of the texture. Phase-2 note: a layer inside a `<surface>` with no outer layer gets camera order -1, tying with the surface camera (one-frame-stale sample risk) — resolve when surface interop is formalized.
- Registration in `plugin.rs`: **separate `add_systems` call** — the main Update tuple is at Bevy's 20-arity cap (memory: nesting or E0277 with a misleading message):

```rust
app.add_systems(Update, (
    crate::layer::bind_layers.after(apply_js_ops),
    crate::layer::drive_layers.after(crate::layer::bind_layers),
));
```

**Step 4:** tests PASS; clippy clean.

### Task 1.6: JS side — intrinsic, prop plumbing, types

**Files:**

- Modify: `js/src/jsx-runtime.ts` (IntrinsicElements: `layer: BevyLayerProps`), `js/src/jsx.d.ts` (add `BevyLayerProps` + `BevyLayerStyle extends BevyStyle { uniforms?: Record<string, number | number[] | string> }`), `js/src/bridge.ts` (add `"effect"` to `PASSTHROUGH_PROP_KEYS`)

**Step 1:** Write a failing typecheck usage — add `<layer effect="none" style={{ width: 10, uniforms: { s: 1 } }} />` to an existing renderer test or a `tsd`-style usage in the demo (simplest: the demo in Task 1.8 IS the typecheck). For unit coverage: extend the existing `buildUpdateOp`/serialize tests (grep `js/src` or `js/test` for the test setup) with: `effect` serializes through; `style.uniforms` diffs as a style field (delta on change, `styleUnset` on removal).

**Step 2:** `npm run typecheck` / JS tests → FAIL.

**Step 3:** Implement — this is small: `effect` in `PASSTHROUGH_PROP_KEYS` (bridge.ts:515 area), the two type additions. `style` is already opaque on the wire, so `uniforms` inside it needs **zero** bridge logic; `diffStyle` handles it structurally.

**Step 4:** typecheck + JS tests PASS. `npm run lint`.

**Checkpoint** — user review/commit.

### Task 1.7: Codegen — `LayerEffectRegistry` → typed `Layer` in `bevy.ts`

**Files:**

- Modify: `crates/core/src/ts_codegen.rs`, `crates/core/src/layer.rs` (registry exposes schema for export), `crates/core/src/message.rs` (exporter entry walks the new registry), `examples/demos/main.rs` (`register_react_bindings` registers demo effects)

**Step 1: Failing test** — extend `ts_codegen::tests::exports_typescript` (path per CLAUDE.md) or add a sibling:

```rust
#[test]
fn exports_layer_effects() {
    // App with register_layer_effect("frost", uniform "strength" F32) →
    // rendered TS contains: interface FrostUniforms { strength?: number }
    // and a LayerEffects map + typed Layer component wrapper.
}
```

**Step 2:** FAIL.

**Step 3: Implement.** Emit (sorted, deterministic):

- Per effect: `export interface <Pascal>Uniforms { <name>?: number | string | number[] }` — narrow per kind: `F32 → number`, `Color → string`, `Vec* → [number, ...]` tuples.
- `export interface LayerEffects { "frost": FrostUniforms; ... }` (always includes `"none": {}`).
- A typed wrapper component (the intrinsic stays loosely typed; the wrapper is the typed surface — JSX intrinsics can't be app-generated):

```ts
export function Layer<E extends keyof LayerEffects>(
  props: { effect?: E; style?: BevyLayerStyleTyped<LayerEffects[E]> } & BevyLayerBaseProps,
): JSX.Element { ... } // thin passthrough to the intrinsic
```

(Add `BevyLayerStyleTyped<U>` generic in `jsx.d.ts`, import it in the generated header.)

- `"none"` is always present; apps that register nothing still get a working `Layer`.

**Step 4:** test PASS. Then: `npm run bevy:generate -w demos && git diff` — inspect the regenerated `bevy.ts`, commit it with the change (CI invariant per CLAUDE.md).

### Task 1.8: Built-in demo effects + gallery demo + E2E

**Files:**

- Modify: `crates/core/src/layer.rs` (builtins: `"dissolve"` — threshold + noise on subtree alpha; `"chromaticAberration"` — RGB UV offsets; both non-backdrop, both time-free with uniform-driven params; WGSL inline via `include_str!` on new files `crates/core/src/layer_fx/*.wgsl`)
- Create: `examples/demos/ui/src/demos/layer/LayerDemo.tsx` (+ register in the demos nav — grep `examples/demos/ui/src/demos/index.ts*` for the `DEMOS` registry shape; label `"<layer>"`)
- Modify: `examples/demos/main.rs` (register demo effects in `register_react_bindings` so `--export-bindings` sees them)
- Create/Modify: `crates/core/tests/roundtrip.rs` — add a layer round-trip case
- Modify: `examples/demos/ui/src/bevy.ts` (regenerated)

**Demo content:** side-by-side group-opacity comparison (a `<layer style={{opacity: 0.5}}>` card with overlapping children vs the same tree with plain nested per-node alpha — the visual argument for the element), plus a uniforms panel: sliders (existing demo slider components — grep `demos/styling` for one) driving `dissolve` threshold via declarative `style.uniforms`.

**Steps:**

1. Failing roundtrip test: render a `<layer>` with a child from the real JS runtime, assert the create ops produce the companion/camera/material and that a `style.uniforms` update mutates `packed.params` (follow `canvas_resize_replay_round_trip`'s structure; skip-if-no-bundle notice like the rest of the file).
2. Run → FAIL. Implement demo + builtins. `npm run build -w demos`.
3. `cargo test -p bevy-react --test roundtrip` → PASS.
4. Visual: `cargo run -p bevy-react --example demos -- --shoot "<layer>" /tmp/claude-1000/.../layer.png` — check group opacity renders correctly (no double-blend on the layer side, visible double-blend on the comparison side), dissolve responds. **Check alpha fringing** (Task 1.2 premultiply note) and fix the shader if present.
5. Full gates: `npm run lint && npm run typecheck && cargo test -p bevy-react`.

**Checkpoint** — end of phase 1; user review/commit. Update the design doc's status line.

---

## Phase 2 — 3D transforms + input

### Task 2.1: Transform wire type + matrix composition

**Files:** `crates/core/src/layer.rs`, `crates/core/src/protocol.rs` (style row `(transform3d, "transform3d", (LAYER), overlay)`), `js/src/jsx.d.ts`

- **AMENDMENT (found during execution):** the wire/style name is **`transform3d`**, not `transform` — `Style.transform` already exists as the 2D `UiTransform` path (with CSS-transition semantics) and is inherited by `BevyLayerStyle`. User-confirmed choice; the two fields coexist on a layer (2D transform still moves the display node). Design-doc references to `style.transform` on layers should be read as `transform3d`.

- Wire `LayerTransformSpec`: ordered named ops — decode from an object with fixed application order (document: `perspective` → `translate*` → `rotateX/Y/Z` → `scale*`, CSS-like; degrees for rotations, px for translations).
- `fn compose(spec, size: Vec2) -> Mat4` about the node center, y-down UI space.
- **Failing tests first:** identity spec → `Mat4::IDENTITY`; `rotateY: 90` maps the right edge to center-depth (assert on transformed corner points, not raw matrix cells); perspective divides w. Then protocol decode round-trip test (memory: per-field rename test).
- Store the composed matrix in `LayerPacked` (extend to `{ transform: Mat4, group_alpha, params }`) + retain a CPU copy on `RLayer` for input inversion.

### Task 2.2: Vertex shader — projective quad, perspective-correct UVs

**Files:** `crates/core/src/layer.wgsl` (add `vertex` fn), `crates/core/src/layer.rs` (`specialize` keeps vertex = the shared layer vertex shader for every effect)

- Transform the 4 corners: node-local px → matrix → back to the UI camera's clip space, emitting proper `w` so UV interpolation is perspective-correct. Study `ui_material.wgsl`'s default vertex shader first (it defines the input layout: position/uv/size/border-widths/border-radius) — keep the same `UiVertexOutput`.
- Verification is visual (--shoot with a rotated layer) + one Rust test on the CPU-side matrix (already in 2.1). Add a `--shoot` screenshot to the demo with a static `rotateY: 25` card.
- Known constraint to verify and document: ancestor `Overflow` clipping scissors the transformed quad (expected, acceptable); the quad may draw outside the layout box (expected).

- **AMENDMENT (found during execution):** the matrix rides to the shader in LOGICAL px, so two `misc` lanes were claimed: `misc.y` = the display's scale factor (physical px per logical px — the shader converts corners logical↔physical around `M`) and `misc.z` = a transform-enabled flag. Flag off ⇒ the shader takes the default UI vertex path **bit-for-bit** (untransformed layers proved pixel-identical to phase 1 by screenshot diff), dodging logical/physical round-trip float drift. The w-fold algebra (`clip = L·vec4(origin·w' + k·p.xy, z·w', w')`, depth unchanged) is documented in `layer.wgsl`. Clip note: bevy_ui clips UI-material quads **on the CPU, pre-transform** (corner positions + UVs shifted in lockstep in `prepare_uimaterial_nodes`), so ancestor clipping trims the layout-space box and the transform then maps the trimmed sub-quad — post-transform pixels are NOT re-scissored (differs from CSS, acceptable; the origin reconstruction is clip-shift-invariant so the math stays exact). Registration now also guards exactly one `@vertex` in composed sources.

### Task 2.3: `LayerPointer` — inverse-mapped input

**Files:** `crates/core/src/layer.rs` (or `layer/pointer.rs`), `crates/core/src/plugin.rs` (PreUpdate registration `.before(PickingSystems::ProcessInput)`)

- **Failing math test first:** `screen_to_layer_uv(cursor, node_rect, mat) -> Option<Vec2>` — for identity: linear map; for a known rotation: pick a screen point computed by forward-projecting a texture point, assert round-trip within epsilon; behind-the-plane / outside `[0,1]²` → `None`.
- Port `drive_surface_pointer`'s event emission (`surface.rs:372-461`): shared `PointerId::Custom` (new UUID), `PointerInput` Move/Press/Release at `Location { target: NormalizedRenderTarget::Image(layer_image), position: uv * texture_size }`, park off-bounds on exit, release owed presses. Top-hit gating: only forward when the window cursor's topmost UI hit is the layer display node — use the picking `HoverMap` (memory: "Surface UI invisible to window hit-test" — HoverMap, not UiStack walks).
- E2E: extend the roundtrip test — click through an _untransformed_ layer at a known coordinate → child's `onClick` fires (assert the ui event reaches JS). For the transformed case use the hit-test probing recipe (memory: offscreen camera + custom pointer; window-target runs lay out 0×0 under occlusion — never trust window geometry in headless).
- Interactive verification: the `verify` skill (xdotool) — hover/click a tilted card in the live demo.
- Wire `hoverStyle`/`pressStyle` on nodes inside layers: confirm the surface interaction-style path (`apply_surface_interaction_styles`) covers image-target pointers generally, or extend its query — read `collect_surface_*` first; they may only need the layer image added to their target set.

- **AMENDMENT (found during execution):** shipped as `crates/core/src/layer/pointer.rs` (a submodule of `layer.rs`; re-exported at `layer::{LayerVirtualPointer, init_layer_pointer, drive_layer_pointer}`).
  - **Inverse math:** the forward map of the z=0 box plane is the 3×3 homography H = M's x/y/w rows × (x, y, w) columns (glam cols 0/1/3, components x/y/w); `H⁻¹·(cursor,1)` recovers `(q,1)/w'`, so the recovered z's SIGN is w''s sign — `≤ 0` = behind the eye. Near-singular guard `|det H| < f32::EPSILON` catches exact edge-on (f32 `cos(90°)` ≈ 4e-8) including the collapsed-center-line cursor.
  - **Driver:** reads `HoverMap[Mouse]` (one-frame hover lag — the map updates later in `PreUpdate`); hit position comes from the UI backend's normalized `HitData.position`, no window query needed. The `Location` target is the layer CAMERA's `ImageRenderTarget` clone — `NormalizedRenderTarget::Image` equality includes `scale_factor`, so building it by hand with 1.0 would never match a hidpi camera. Positions are texture-LOGICAL px (the backend multiplies by the target scale factor); tested at 2x.
  - **Nested layers: SINGLE-HOP (v1).** Only window-camera UI lands in `HoverMap[Mouse]`, so the virtual pointer always targets the OUTERMOST layer's texture. An inner display node inside that texture receives its own events (it's an ordinary companion-tree hit) but its interior is non-interactive — chaining needs a pointer per depth, deferred. Guarded by `driver_ignores_non_window_pointer_hover`.
  - **Collectors generalized, not duplicated:** `collect_surface_*`/`apply_surface_interaction_styles` → `collect_virtual_clicks`/`collect_virtual_pointer_events`/`collect_virtual_hover_events`/`apply_virtual_interaction_styles`, keyed on `PointerId::is_custom()` (any virtual pointer — surface, layer, future); `collect_ui_events` now skips ALL custom pointers. Double-dispatch semantics: the display node's own handlers fire from the WINDOW pointer path (it's a normal node), inner-content handlers from the virtual path — different entities, no duplicate events for one click; a `<layer onClick>` with a button inside fires both on a click over the button (documented, DOM-bubbling-adjacent).
  - **Bug found by live verification:** a same-frame Press+Release (fast click) left `pressStyle` stuck — `apply_virtual_interaction_styles` processed releases before presses. Fixed (presses first, releases last) + regression test `virtual_same_frame_click_settles_on_hover_style`. Applies to surfaces too.
  - **E2E (`roundtrip.rs::layer_pointer_click_round_trip`):** FULL headless input chain with real layout + picking — `UiPlugin` + `PickingPlugin`/`InteractionPlugin` + `TransformPlugin` + `CameraPlugin` on `MinimalPlugins`. Three headless traps: `ui_layout_system` silently skips without bevy_text's `FontCx` resource (everything 0×0); `InheritedVisibility` DEFAULTS TO HIDDEN — without `CameraPlugin`'s visibility propagation the picking backend filters every node; no render app runs `camera_system`, so a test system stamps `camera.computed.target_info` from each image target's asset every frame. Window pointer = a spawned `PointerId::Mouse` entity driven by injected `PointerInput` targeting a tall offscreen image (probing-recipe). Clicks the demo's shared-counter button in the FLAT layer, then in the TILTED layer at its forward-projected position (through the live `LayerTransform`).
  - Demo: 4th Example (`InteractiveTiltDemo`) — the same `TapCard` (counter + `+1` button with hover/press styles + hoverable chips) flat and tilted, one shared counter. `layer_demo_round_trip`'s layer classifier now keys the comparison layer on `opacity: 0.5` specifically.

**Checkpoint** — end of phase 2 (demo: tilting interactive card; update demo page + screenshots). Task 2.3 DONE (verified live via xdotool: flat click → taps 1, tilted click at projected position → taps 2, chip hover ring through the transform).

---

## Phase 3 — World backdrop

Read design doc §4 "Backdrop" + review `bevy_core_pipeline` upscaling/post nodes for graph-insertion precedent before starting. This is the highest-risk phase; timebox a spike first.

### Task 3.1: Spike — copy node in the UI camera's render graph (no blur)

- New render-world module `crates/core/src/layer/backdrop.rs`: a `ViewNode` inserted between the last post-process node and `bevy_ui`'s pass on the default UI camera's graph; copies the view target into a `BackdropTexture` (render-world resource, extracted handle readable by the material as a plain `Handle<Image>` — decide: simplest viable is a `CommandEncoder::copy_texture_to_texture` into a `GpuImage` the main world owns).
- Gate: node early-outs unless some live effect `wants_backdrop` (extract a flag).
- Verification: a debug effect whose fragment just shows the backdrop texture → --shoot shows the 3D scene through the layer. Headless smoke: roundtrip app with the plugin builds & runs one frame without graph panics.

### Task 3.2: Blur chain + `"frost"` builtin + demo

- Dual-Kawase downsample chain (3–4 levels) off `BackdropTexture`; expose as one texture with mips or an array — pick the simplest that lets `frost` sample blurred backdrop by strength.
- `LayerKey` gains `backdrop: bool`; material binds backdrop texture+sampler (bindings 3/4; dummy 1×1 when unused — mirror `FilterAssets::white`).
- `"frost"` effect: blurred backdrop + tint + subtree composite; uniforms `blur: F32`, `tint: Color`.
- Demo: frosted-glass panel over the bouncing-ball scene; --shoot both with scene visible.
- Document plainly (rustdoc + demo copy): backdrop = world-behind-UI, not sibling UI (design §4).

**Checkpoint** — end of phase 3.

---

## Phase 4 — Animation integration + imperative ref

### Task 4.1: `LayerBindings` — SharedValue-driven uniforms & transform channels

**Files:** `crates/core/src/layer.rs`, `crates/core/src/protocol.rs` (`Props.layer_animated: Option<crate::layer::LayerBindings>`, wire name `layerAnimated`), `js/src/bridge.ts` (`serializeAnimatedStyle` splits `"uniforms.*"` / `"transform.*"` keys out of `animatedStyle` into the `layerAnimated` wire field), `crates/core/src/plugin.rs`

- **Failing Rust test first:** a `LayerBindings { uniforms: BTreeMap<String, Binding>, transform: BTreeMap<TransformChannel, Binding> }` component + `apply_layer_bindings` system (after `AnimationSet::Tick`, before/within the layer drive) reading the public `SharedValues` table: declare shared id → animate → tick → assert `packed.params` lane moved and the matrix recomposed. Reuse `Binding` + `eval_scalar`/`eval_color`/`piecewise`/`Lerp` — do NOT touch `AnimatableProperty` (design §5; the enum is closed `Copy`, exhaustively matched).
- Compare-before-write on the material asset (memory: settled bindings must not dirty change detection; also avoids bind-group re-prepare every idle frame).
- Precedence: animated channel wins over declarative `style.uniforms` while bound (mirror `transition.rs:440`'s skip rule for any future transition support).
- JS test: `animatedStyle={{ "uniforms.strength": sv, "transform.rotateY": sv2, translateX: sv3 }}` → wire has `layerAnimated` with two entries and `animated` with `translateX` (plain channels unaffected).
- Completion callbacks: nothing to do — tokens ride the shared-value engine (`Outbound::AnimationFinished` already fires). Add one E2E assert anyway.

### Task 4.2: `BevyLayerElement` ref handle + `Op::LayerUniforms`

**Files:** `js/src/layer.ts` (new, mirror `canvas.ts`), `js/src/renderer.ts` (`createInstance`: `type === "layer" ? createLayerElement(id) : ...`), `js/src/bridge.ts` (`sendLayerUniforms` + op), `crates/core/src/protocol.rs` (`Op::LayerUniforms { id, values: LayerUniformMap }` + decode test), `crates/core/src/reconcile.rs` (apply arm → write `packed.params` via schema, act-now, never cached)

- Handle API: `layer.uniforms.set(name, value)` / `.set(record)`; microtask-batched exactly like `RetainedCanvasContext` (one op per burst); `layer.width/height` from the resize-event size table if trivially reachable, else omit (YAGNI).
- **Failing tests first:** JS — two sync `.set`s produce one op; Rust — `Op::LayerUniforms` decode round-trip + apply mutates the material; precedence — an animated-bound channel ignores the imperative write (log a diag warn).
- E2E roundtrip: imperative set from the real runtime lands in `packed.params`.

### Task 4.3: Finish — demo polish, docs, full gates

- Demo: animated showcase (spring-tilt card on hover via shared values + drag; dissolve sweep with completion callback chaining) — this is the flagship demo, worth the polish.
- Docs: CLAUDE.md architecture section gets a short `<layer>` paragraph (element list + the module-ownership line + "extend effects via register_layer_effect"); regenerate `bevy.ts`; update design-doc status.
- Full gates: `npm run lint && npm run typecheck && cargo test -p bevy-react && npm run bevy:generate -w demos && git diff --exit-code examples/demos/ui/src/bevy.ts`; `--shoot` screenshots of every demo state; `verify` skill pass for interaction.

**Checkpoint** — done. Per superpowers:finishing-a-development-branch, stop and hand integration decisions to the user.

---

## Standing rules for the executor

- TDD every task: failing test → run → implement → run. No implementation before its test exists and fails.
- After each task: `cargo clippy -p bevy-react --all-targets` and fix lints immediately (CLAUDE.md).
- If a pre-existing test breaks and the fix isn't obviously yours, **ask the user** (CLAUDE.md rule) — don't silently adapt it.
- New warn sites: every new `diag`/`decode_warn` kind (`"layerEffect"`, `"layerUniform"`) must be added to `js/src/devtools/warnings.ts` `KIND_FIELDS` — `devtools.rs::js_warning_kind_table_covers_known_kinds` will fail otherwise.
- Never OS-screenshot; always `--shoot` (CLAUDE.md).
- The plan's line numbers date from 2026-07-20 — re-grep before editing; trust names over numbers.
