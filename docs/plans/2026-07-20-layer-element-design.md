# `<layer>` — subtree-to-texture compositing element

**Status: phases 1-2 implemented and reviewed — awaiting user commit. Phase 1:
core composite, effect registry, codegen, demo. Phase 2: `transform3d` (renamed
from `transform` — collision with the 2D path), projective vertex shader,
inverse-mapped pointer input (flat + tilted layers interactive, live-verified).
Phases 3-4 (backdrop, animation+ref) not started.** Execution amendments (exact
texture sizing, premultiplied-alpha compositing, stale-bind-group retouch,
transform3d naming, single-hop nested-input contract, CPU-pre-transform clipping
semantics) are recorded in the implementation plan.

A `<layer>` renders its React subtree into an offscreen texture and displays that
texture back inside the UI through a custom-shader material. This unlocks what
single-pass `bevy_ui` cannot do: correct **group opacity** over a whole subtree,
**custom shader effects** applied to composited content (not just a node's own
surface, the `style.filter` limitation), **3D/perspective transforms**, and
**backdrop effects** (frosted glass over the 3D scene).

Decisions locked with the user (2026-07-20):

- Effects are **registered in Rust** by name; JS selects an effect and drives its
  uniforms. No runtime WGSL from JS.
- One **generic `LayerMaterial`** (packed uniform slots + fixed bind-group layout);
  an effect = a WGSL shader + a named uniform schema.
- Registered effects flow into the **`bevy.ts` codegen** → typed per-effect uniforms.
- **Backdrop v1 samples the world** (everything rendered before the UI pass), not
  sibling UI.
- **Full pointer input from day one**, including inside 3D-transformed layers
  (inverse-projective mapping).
- Uniform control is **declarative + imperative ref**, integrated with the
  animations module via `SharedValue` bindings.
- Layer capabilities live in **style** (a separate `BevyLayerStyle` type extending
  the base style), so variants (`hoverStyle`…) and, later, transitions apply to them.

## 1. Feasibility

**Verdict: highly feasible.** Roughly 85% of the machinery already exists in the
repo or in Bevy 0.19; `<layer>` is a recombination of five proven patterns plus
one genuinely new render-graph piece (backdrop capture).

What already exists and is reused directly:

| Need                               | Existing precedent                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI subtree → offscreen texture     | `surface.rs`: detached root + `Camera2d { order: -1 }` + `RenderTarget::Image` + `UiTargetCamera` (`bind_surfaces`, surface.rs:272)              |
| Detached-root lifecycle (no leaks) | `bridge.rs` side tables + `surfaces_under` reachability walk; Append/Insert/Remove/Reset handling in `reconcile.rs:539-631`                      |
| Texture auto-sized to layout box   | `portal.rs::drive_render_targets` — resize to binder's `ComputedNode.size()`, quantized to `SIZE_STEP=16`                                        |
| Per-node custom-shader display     | `filter.rs`: `UiMaterial` + `MaterialNode<FilterMaterial>` (packed `Vec4` uniforms, embedded WGSL)                                               |
| Imperative JS handle, batched ops  | `canvas.ts::RetainedCanvasContext` — microtask-batched command flush riding the op channel                                                       |
| Animation engine reuse             | `animations/`: public `SharedValues` table, `Binding`/`eval_scalar`/`eval_color`/`piecewise`/`Lerp` all reusable (the `transition.rs` precedent) |
| Registry → codegen                 | message/request/event registries walked by `export_react_typescript`                                                                             |

Bevy 0.19 facts verified against `bevy_ui_render-0.19.0` / `bevy_ui-0.19.0` /
`bevy_shader-0.19.0` sources:

- `UiMaterial` supports **custom vertex and fragment shaders** (`ui_material.rs:102`);
  its view bind group already carries `ViewUniform` + `GlobalsUniform`, so shaders
  get `globals.time` for free.
- `UiMaterialKey<M>` carries `bind_group_data: M::Data`, and the pipeline's
  `specialize` hands `M::specialize(&mut descriptor, key)` the full
  `RenderPipelineDescriptor` (`ui_material_pipeline.rs:129-170`). A
  `Handle<Shader>` inside the key (`#[bind_group_data]`) lets **one material type
  swap shaders per instance** — the crux of the single-generic-material registry.
  Pipelines are cached per unique key, so N effects → N pipeline specializations,
  which is the intended use.
- `UiTransform` is **strictly 2D** (`Affine2`: translation/scale/rotation,
  ui_transform.rs:130). Real perspective transforms genuinely require the layer
  approach — there is no cheaper native path.
- `Shader::from_wgsl(source, path)` exists for composing shader source at startup
  (used for prepending a generated per-effect uniform preamble, not for JS WGSL).

Risk assessment:

- **Low:** offscreen camera + texture + auto-resize; generic material + uniform
  packing; group opacity; declarative uniforms; codegen extension; effect registry.
- **Medium:** vertex-shader projective transform with perspective-correct UVs;
  inverse mapping for input; animated-uniform plumbing (a parallel bindings
  component — the animation target enum is closed and should stay that way);
  nested-layer camera ordering.
- **Highest (still contained):** backdrop capture — a render-graph node that
  copies the view target before the UI pass and builds a blur chain. This is the
  project's first render-graph surgery, but it is additive and isolated; nothing
  else depends on it (phase 3).

Costs to accept: one texture (box-sized RGBA8) + one camera pass per layer;
each `MaterialNode` breaks UI batching (already true of `filter`); texture
memory scales with layer area. These are inherent to render-to-texture, not
implementation choices.

## 2. Proposed API

### JSX (app side)

```tsx
import { useSharedValue, withSpring, Animated } from "bevy-react";

const tilt = useSharedValue(0);

<Animated.layer
  effect="frost" // Rust-registered; typed via bevy.ts codegen
  ref={layerRef}
  style={{
    width: 320,
    height: 200, // normal bevy_ui layout — the layer's box
    opacity: 0.9, // GROUP opacity: applied once to the composite
    uniforms: { strength: 0.6, tint: "#88ccff88" }, // typed per effect
    transform: {
      // CSS-like ops, applied in a fixed documented order
      perspective: 800,
      rotateY: 12, // degrees
      translateZ: -20,
    },
  }}
  hoverStyle={{ transform: { perspective: 800, rotateY: 0 } }} // variants apply
  animatedStyle={{
    "transform.rotateY": tilt, // SharedValue-driven transform channel
    "uniforms.strength": tilt, // SharedValue-driven uniform
  }}
  onPointerEnter={() => (tilt.value = withSpring(0))}
  onPointerLeave={() => (tilt.value = withSpring(12))}
>
  {/* arbitrary subtree: nodes, text, images, canvas, even nested layers */}
</Animated.layer>;
```

- `effect` is an element prop (identity-like, mirrors `portal`'s `target`):
  changing it swaps the shader pipeline. Omitted → the built-in `"none"`
  passthrough composite (group opacity / transform still work).
- Everything _parametric_ lives in `style`, in a separate **`BevyLayerStyle`**
  (extends `BevyStyle` with `uniforms`, `transform`; `opacity` is reinterpreted
  as group opacity). Variants apply; CSS `transition` support for layer channels
  is a designed follow-up, not v1.
- `animatedStyle` gains namespaced channels on layers: `"uniforms.<name>"` and
  `"transform.<channel>"`. Plain style channels (`width`, `backgroundColor`…)
  keep working as on any node.

### Imperative ref handle

```ts
const layer = layerRef.current; // BevyLayerElement
layer.uniforms.set("strength", 0.8); // microtask-batched
layer.uniforms.set({ strength: 0.8, tint: "#ffffffff" });
layer.width;
layer.height; // current texture size (like canvas)
```

Mirrors `BevyCanvasElement`: the reconciler instance _is_ the public handle;
writes buffer and flush on a microtask as one `Op::LayerUniforms`. Act-now
semantics (never cached in `props_cache`), same as `draw`.

Precedence per uniform channel: **animated binding > imperative set > declarative
style value**. A bound `SharedValue` owns its channel while bound (the
`transition.rs:440` precedent); an imperative set overwrites until the next
declarative change of that field.

### Rust registration

```rust
app.register_layer_effect(
    LayerEffect::new("frost")
        .shader("embedded://my_app/frost.wgsl")       // or any asset path / handle
        .uniform("strength", UniformKind::F32, 0.5)   // name, kind, default
        .uniform("tint", UniformKind::Color, Color::WHITE)
        .backdrop(true),                              // requests the backdrop binding
);
```

- The crate ships `"none"` (plain composite) plus a small built-in set that
  doubles as demo material: `"frost"` (backdrop blur glass), `"dissolve"`,
  `"chromaticAberration"`.
- Registration assigns each uniform a slot in the packed array (std140-style:
  `f32` → one lane; `vec2` → aligned pair; `vec3`/`vec4`/`color` → full `vec4`;
  cap 16 `vec4`s = 64 floats, registration panics beyond with a clear message).
- At registration the final `Shader` is composed as
  `generated_preamble + user_source`, where the preamble declares a typed
  `struct FrostParams { strength: f32, tint: vec4<f32>, … }` view over the packed
  array plus accessor functions — effect authors never index raw slots.

### WGSL contract for effect authors

```wgsl
// group(0): view + globals (bevy-provided: globals.time available)
// group(1): the layer bind group (fixed layout, all effects share it)
//   @binding(0) uniform LayerUniforms { transform: mat4x4<f32>, group_alpha: f32,
//                                       params: array<vec4<f32>, 16> }
//   @binding(1) layer_tex     — the composited subtree
//   @binding(2) layer_smp
//   @binding(3) backdrop_tex  — pre-blurred world chain (1x1 dummy unless .backdrop(true))
//   @binding(4) backdrop_smp
// Default vertex shader applies `transform` (projective, perspective-correct UV);
// effects normally supply only `fragment`.
```

### Codegen (`bevy.ts`)

`register_layer_effect` feeds a `LayerEffectRegistry` resource that
`export_react_typescript` walks like the three message registries. Output: one
interface per effect (`FrostUniforms { strength?: number; tint?: string }`) and a
discriminated union for the `<layer>` intrinsic:

```ts
type BevyLayerProps =
  | { effect?: "none"; style?: BevyLayerStyle<{}> }
  | { effect: "frost"; style?: BevyLayerStyle<FrostUniforms>; ... }
  | { effect: "dissolve"; ... };
```

so a wrong uniform name or a uniform on the wrong effect is a compile error in
app code. Same regenerate-then-`git diff --exit-code` CI invariant; unknown
names at runtime still go through `decode_warn` (new kind, added to
`KIND_FIELDS` — the `js_warning_kind_table_covers_known_kinds` guard applies).

## 3. Alternatives considered

- **`style.filter` (exists).** A `UiMaterial` on one node — explicitly documented
  as not compositing children. `<layer>` is the answer to that limitation; the
  two share the material approach and coexist (filter stays the cheap leaf-node
  path).
- **`<surface>` + `<portal>` (possible today).** An app can already hand-assemble
  subtree→texture→UI: `<surface name="x">` renders offscreen, a Rust system owns
  a camera, `<portal target>` displays it, `monitor.rs`'s `ExtendedMaterial` shows
  custom shading. This is the strongest evidence of feasibility — `<layer>` is the
  productized one-element version adding auto-sizing to the layout box, in-UI
  shader display, transforms, input mapping, and automatic lifecycle. Useful today
  as a prototyping path.
- **Opacity cascade without RTT** (multiply alpha down the subtree): wrong by
  construction — overlapping children double-blend. Rejected on correctness.
- **3D transform via a real mesh + world camera:** correct perspective but breaks
  UI z-ordering/clipping and drags world-space coordination into the UI. Remains
  available via `<surface>` for genuinely in-world UI; rejected as the `<layer>`
  mechanism. The vertex-shader projective quad keeps the layer inside `bevy_ui`'s
  stack/clip system.
- **2D-only transforms via `UiTransform`:** already supported; not a substitute
  (no perspective, no subtree compositing).
- **Wait for upstream:** `bevy_ui_render` is single-pass with no announced subtree
  compositing; no near-term upstream path.

## 4. Architecture

New module `crates/core/src/layer.rs` (or `layer/`), owning its wire types;
`protocol::Props`/`Style` reference them by path (the `canvas`/`animations`/
`anchor` module-ownership convention).

### Entities: display node + companion detached root

`Op::Create { kind: "layer" }` spawns **two** entities:

1. **Display node** (the `NodeId`-mapped entity, in the main tree): `Node` from
   style (layout box), `MaterialNode<LayerMaterial>`, `RLayer` marker. This is
   what participates in layout, z-order, clipping, and window hit-testing.
2. **Companion root** (internal, not NodeId-mapped): a detached UI root
   (`LayerRoot(display_entity)`), sized in absolute px to the display node's box
   each frame, `UiTargetCamera(layer_camera)`.

The reconciler routes `append/insert/remove` of the layer's JSX children to the
companion root (a redirect in the attach path, next to the existing
`is_detached_root` branch). The bridge grows a `layer_roots: HashMap<NodeId, Entity>`
side table; Remove/Reset reuse the existing detached-root despawn + reachability
walk (`surfaces_under` generalizes to layers — nested layers/surfaces under a
removed subtree are found the same way). This is the exact leak contract surface
already honors.

### Systems (slot beside the existing binders in `plugin.rs`; mind the 20-arity tuple — nest)

- `bind_layers` (`.after(apply_js_ops)`): for each new `RLayer` — create the
  target `Image` (portal-style auto-resize to `ComputedNode.size()` × UI scale,
  `SIZE_STEP` quantized; resize propagates a companion-root `Node` width/height
  update), spawn `Camera2d { order: -1 - depth, target: Image }`, build the
  per-entity `LayerMaterial` (never the dedup cache — animated uniforms mutate it
  per frame; compare-before-write so idle layers don't re-prepare bind groups).
- `drive_layers`: resize/redirect on layout change; despawn orphan cameras
  (surface's `drive_surfaces` contract).
- `apply_layer_bindings` (after `AnimationSet::Tick`): the animated-uniform path,
  see §5.
- `drive_layer_pointer` (`PreUpdate`, before `PickingSystems::ProcessInput`): input,
  see below.

### The generic material

```rust
#[derive(Asset, AsBindGroup, Reflect, Clone)]
#[bind_group_data(LayerKey)]           // { shader: Handle<Shader>, backdrop: bool }
pub struct LayerMaterial {
    #[uniform(0)] pub packed: LayerPacked,   // mat4 transform + group_alpha + [Vec4;16]
    #[texture(1)] #[sampler(2)] pub layer: Handle<Image>,
    #[texture(3)] #[sampler(4)] pub backdrop: Handle<Image>,  // 1x1 dummy if unused
}
impl UiMaterial for LayerMaterial {
    fn specialize(desc: &mut RenderPipelineDescriptor, key: UiMaterialKey<Self>) {
        desc.fragment.as_mut().unwrap().shader = key.bind_group_data.shader.clone();
        // vertex shader: the shared layer vertex shader (projective transform)
    }
}
```

One `UiMaterialPlugin::<LayerMaterial>`; per-effect behavior comes entirely from
the shader handle in the key. `LayerEffects` resource: `name → { shader, schema, wants_backdrop }`.

### 3D transform + perspective-correct rendering

Style `transform` ops compose Rust-side into a `Mat4` about the node center
(px units, y-down; documented fixed op-application order like CSS). The shared
vertex shader transforms the quad's corners and emits clip-space positions with
proper `w`, so UV interpolation is perspective-correct. The transformed quad may
extend past the layout box — acceptable (it is still scissored by ancestor
`Overflow` clips like any UI primitive). The same `Mat4` is retained on the
display entity for input inversion. Animated transform channels rebuild the
matrix per frame in `apply_layer_bindings`.

### Backdrop (v1: world only)

A render-graph node inserted into the UI camera's graph **between the end of
post-processing and the UI pass**: copies the current view target into a
`BackdropTexture` and builds a small dual-Kawase downsample chain (shared by all
layers; skipped entirely when no live effect has `wants_backdrop`). Effects
sample it in screen space (framebuffer coords from `@builtin(position)`).
Semantics documented plainly: the backdrop is _everything the camera rendered
before UI_ — the 3D scene + post — not sibling UI painted beneath the layer.
Full CSS-style backdrop (UI-under-UI) would require splitting `bevy_ui` into
z-ordered passes; explicitly out of scope, and nothing in this design forecloses
it later.

### Input (full, day one)

One inverse-mapping path where identity is the trivial case — this is why "full
input" costs little extra once transforms exist:

- `LayerPointer` (a `PointerId::Custom`, `SurfaceVirtualPointer` sibling).
- `drive_layer_pointer`: when the window cursor's top hit is a layer display node
  (normal picking finds it — the display node lives in the window hit-test space),
  map cursor → node-local → multiply by `inverse(transform)` with projective
  divide → texture px. Inside `[0,1]²` → emit `PointerInput` Move/Press/Release at
  `Location { target: NormalizedRenderTarget::Image(layer_target) }`; Bevy's UI
  picking backend then hit-tests the companion subtree natively (hover, click,
  drag, scroll — everything). Off-quad or cursor-left → park the pointer
  off-bounds to fire `Out`, releasing owed presses (surface's contract).
- Known v1 edge, documented: a strongly-rotated quad covers less than its layout
  box; clicks inside the box but outside the visual quad hit the layer node (not
  what's behind). True pass-through needs a custom window hit-test filter
  (`pick_clip.rs` is precedent) — follow-up.

### Nesting & ordering

Camera `order = -1 - depth` (depth = layer-nesting depth): inner layers render
before the outer layer samples them; the JSX tree makes cycles impossible.
Surfaces stay at `-1`; equal orders across independent targets are fine — only
read-after-write dependencies need strict ordering, and depth provides it.

### Wire protocol summary

- New create kind `"layer"`; `Props.effect: Option<String>`.
- `Style` gains `uniforms: Option<LayerUniformMap>` and
  `transform: Option<LayerTransformSpec>` — new rows in `with_style_fields!`
  (new dirty group `LAYER`), diffed field-by-field like everything else, allowed
  in variants (`overlay`, unlike `filter`: the layer material is rebuilt from
  retained state so the interaction-restyle path can handle it).
- `Op::LayerUniforms { id, values }` — the imperative act-now path.
- `Outbound` unchanged (animation completion reuses `AnimationFinished`).
- Hand-mirrored TS wire types (the repo convention); _typed_ per-effect surfaces
  come from codegen, not ts-rs on wire types.
- New `decode_warn` kinds: unknown effect name, unknown/mistyped uniform →
  devtools flagging via the existing diag path.

## 5. Uniforms from JS — the three write paths, one storage

Single source of truth per layer entity: `LayerUniforms { values: [Vec4; 16] }`
(+ the transform channels). All three paths write it; one system uploads it into
the entity's material asset with compare-before-write:

1. **Declarative** — `style.uniforms` delta at reconcile time (slot lookup via the
   effect schema; unknown names → diag warn, never abort).
2. **Imperative** — `Op::LayerUniforms` from the ref handle (microtask-batched,
   act-now, `split_events`-style: never cached, never in `unset`).
3. **Animated** — the animations module. Deliberately **not** by extending
   `AnimatableProperty` (a closed `Copy` enum, exhaustively matched — a stringly
   variant would degrade every site). Instead the `transition.rs` reuse pattern:
   a `LayerBindings` component (`uniforms: BTreeMap<String, Binding>`,
   `transform: BTreeMap<TransformChannel, Binding>`) populated from the
   `animatedStyle` wire map (bridge.ts routes `"uniforms.*"` / `"transform.*"`
   keys into it; the existing `AnimatedBindings` deserializer keeps skipping
   unknown keys, so old runtimes degrade gracefully). A new
   `apply_layer_bindings` system (after `AnimationSet::Tick`) reads the public
   `SharedValues` table and reuses `Binding` evaluation (`eval_scalar`,
   `eval_color`, `piecewise`, `Lerp`) verbatim. Everything else — drivers
   (`withTiming`/`withSpring`/`withRepeat`/…), interruption semantics,
   completion tokens → `Outbound::AnimationFinished` → JS callbacks — is
   inherited for free because uniforms are driven by the same `SharedValue`s.
4. **Zero-JS time effects** — shaders read `globals.time`; a shimmering effect
   needs no bindings at all.

## 6. Phasing

1. **Core composite:** element + companion root + camera + auto-size + generic
   material + `"none"` effect + group opacity + declarative uniforms + effect
   registry + codegen. _(Everything here follows existing patterns.)_
2. **Transforms + input:** vertex-shader projective transform; `LayerPointer`
   inverse mapping (identity case first, then transformed).
3. **Backdrop:** capture node + blur chain + `"frost"` built-in. _(The isolated
   high-risk piece; nothing else blocks on it.)_
4. **Animation & ref:** `LayerBindings` + `apply_layer_bindings`;
   `BevyLayerElement.uniforms` handle; remaining built-in effects; demo gallery
   entry (tilting glass card is the showpiece).

Headless coverage per phase mirrors existing suites: roundtrip-style tests for
create/resize/uniform ops; the hit-test probing recipe (offscreen camera +
`PointerId::Custom`) for input; `protocol::tests` guards for the new style
fields; a `KIND_FIELDS` guard entry for new warn kinds.

## 7. Open questions (not blocking, decide during implementation)

- Texture format knob: default `Rgba8UnormSrgb`; expose `hdr`/`Rgba16Float` for
  bloom-inside-layer (portal already has a `format` field precedent)?
- Resolution scale knob (supersampling a transformed layer to fight minification
  shimmer) — likely `resolution?: number` multiplier, default 1.
- CSS `transition` on layer channels (hover-tilt without shared values) — natural
  follow-up once channels exist; needs `transition.rs` channel extension.
- Pass-through clicks outside a rotated quad's visual bounds (custom hit-test
  filter, `pick_clip.rs` precedent).
- World-anchor (`AnchorLayer`) content inside layers: anchors project via the
  world camera; inside a layer they'd need the layer's coordinate space —
  probably "unsupported inside `<layer>`" initially, with a diag warn.
