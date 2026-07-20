// The shader source for `LayerMaterial` (see `crates/core/src/layer.rs`), in two
// clearly separated parts split by the marker line below (the Rust side splits
// this file on that exact line — `layer::split_layer_wgsl`):
//
//  1. COMMON CONTRACT (everything above the marker): the bind-group
//     declarations and helpers every composed effect shader shares. Effect
//     registration prepends this part to the schema's generated `u_<name>()`
//     accessor preamble and the author's fragment source.
//  2. The built-in "none" fragment (everything below the marker): re-displays
//     the layer texture untouched. Composed with the contract it is also the
//     complete shader this embedded file forms — the `fragment_shader()`
//     fallback, which never actually renders because `LayerMaterial::specialize`
//     overrides the fragment shader with the effect's composed shader whenever
//     the material carries a real handle.
//
// Bind group 0 is the view/globals (provided by the UI material pipeline); bind
// group 1 is `LayerMaterial`'s `AsBindGroup`.

#import bevy_ui::ui_vertex_output::UiVertexOutput

// WGSL mirror of `LayerPacked` (crates/core/src/layer.rs). `params` is the
// packed effect-uniform budget (`MAX_LAYER_UNIFORM_VEC4S` = 16 slots) that the
// generated `u_<name>()` accessors index; `misc.x` is the layer's group alpha,
// `misc.yzw` are unused.
struct LayerParams {
    params: array<vec4<f32>, 16>,
    misc: vec4<f32>,
}

@group(1) @binding(0) var<uniform> material: LayerParams;
// The layer's rendered subtree, as a texture.
@group(1) @binding(1) var layer_tex: texture_2d<f32>;
@group(1) @binding(2) var layer_smp: sampler;

// The layer's group alpha (`style.opacity`): a whole-subtree fade every effect
// fragment is expected to apply to its output — multiply ALL channels by it.
//
// PREMULTIPLIED CONTRACT (Task 1.8 verdict): `layer_tex` is effectively
// premultiplied — the capture camera clears to transparent and bevy_ui blends
// straight alpha into it, leaving RGB scaled by A — and the composite pipeline
// blends PREMULTIPLIED (`LayerMaterial::specialize` overrides the UI material
// pipeline's straight-alpha default; straight blending double-multiplied RGB:
// dark AA edges and a quadratically-dark opacity fade, verified visually). So
// fragments must treat texels as premultiplied: fades/masks scale all four
// channels, never alpha alone.
fn u_group_alpha() -> f32 {
    return material.misc.x;
}

// ---- built-in "none" fragment (the common contract ends here) ----

@fragment
fn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {
    // Premultiplied texel × group alpha on all channels (see the contract
    // note above) — exactly correct under the premultiplied composite blend.
    return textureSample(layer_tex, layer_smp, in.uv) * u_group_alpha();
}
