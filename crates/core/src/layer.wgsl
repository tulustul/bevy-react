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

#import bevy_render::view::View
#import bevy_ui::ui_vertex_output::UiVertexOutput

// The UI material pipeline's view uniform (bind group 0 also carries globals
// at binding 1; this shader doesn't read it, which is fine — a shader may use
// a subset of the bind group layout).
@group(0) @binding(0) var<uniform> view: View;

// WGSL mirror of `LayerPacked` (crates/core/src/layer.rs). `transform` is the
// layer's composed 3D transform (`style.transform3d`, uploaded by
// `drive_layers` in LOGICAL px over the display box's top-left-origin space)
// — consumed by the shared vertex entry point below. `params` is the packed
// effect-uniform budget (`MAX_LAYER_UNIFORM_VEC4S` = 16 slots) that the
// generated `u_<name>()` accessors index. `misc.x` is the layer's group
// alpha, `misc.y` the display's scale factor (physical px per logical px —
// the space conversion the vertex stage needs around `transform`), `misc.z`
// a 3D-transform-enabled flag (0 = identity, take the exact default-shader
// path), `misc.w` unused. Layout: the mat4 is 64 bytes at offset 0, `params`
// follows at offset 64, `misc` at 320.
struct LayerParams {
    transform: mat4x4<f32>,
    params: array<vec4<f32>, 16>,
    misc: vec4<f32>,
}

@group(1) @binding(0) var<uniform> material: LayerParams;
// The layer's rendered subtree, as a texture.
@group(1) @binding(1) var layer_tex: texture_2d<f32>;
@group(1) @binding(2) var layer_smp: sampler;

// The shared vertex entry point of EVERY composed effect pipeline
// (`LayerMaterial::specialize` points the vertex stage at the composed shader
// alongside the fragment stage): the default UI material vertex path when the
// layer has no 3D transform, a projective application of `material.transform`
// when it does.
//
// Inputs mirror the UI material vertex buffer (bevy_ui_render's
// ui_material_pipeline.rs): `vertex_position` is the quad corner in UI world
// space = PHYSICAL screen px (y down, z = 1.0), `vertex_uv` spans 0..1 over
// the node's box, `size` is the box in physical px. Under ancestor clipping
// bevy_ui shifts corner positions and UVs in lockstep, so
// `vertex_position.xy - vertex_uv * size` is always the box's top-left corner
// in world px (this reconstruction assumes the node's own UI transform is a
// pure translation — true for a <layer> display node, which never carries a
// bevy_ui rotation/scale).
//
// ALGEBRA, derived against the default shader's
// `clip = view.clip_from_world * vec4(world, 1)`:
//
//   `material.transform` (M) is composed in LOGICAL px over the box's own
//   top-left-origin space; `misc.y` (k) converts physical -> logical. With
//   `origin` = the box's top-left corner in world (physical) px:
//
//     q      = vertex_uv * size / k        corner in the box's logical space
//     p      = M * vec4(q, 0, 1)           homogeneous transformed corner
//     world' = origin + k * p.xy / p.w     transformed corner, physical px
//
//   The true clip position is `L * vec4(world', z, 1)` with
//   L = view.clip_from_world — orthographic for a UI camera, so its w row is
//   (0, 0, 0, 1). Scaling a homogeneous clip position by p.w > 0 leaves the
//   post-divide NDC unchanged but sets clip w = p.w — exactly what
//   perspective-correct attribute interpolation needs (the hardware
//   interpolates attr/w, and UiVertexOutput's uv/border fields use the
//   default `perspective` interpolation qualifier). Because L is linear, the
//   divide by p.w folds away:
//
//     clip = L * vec4(origin * p.w + k * p.xy,  z * p.w,  p.w)
//
//   z rides along untransformed (z * p.w post-divides back to the default
//   shader's depth), so stack-order painting is unchanged — UI draws in stack
//   order and a tilt must not reorder it. A corner with p.w <= 0 (behind the
//   eye under extreme perspective) is handled by the hardware clipper, as in
//   any projective rasterization.
//
// NAME CONTRACT: this fn MUST be named `vertex` — `specialize` swaps only
// `vertex.shader`, leaving the pipeline's entry_point ("vertex") untouched.
@vertex
fn vertex(
    @location(0) vertex_position: vec3<f32>,
    @location(1) vertex_uv: vec2<f32>,
    @location(2) size: vec2<f32>,
    @location(3) border_widths: vec4<f32>,
    @location(4) border_radius: vec4<f32>,
) -> UiVertexOutput {
    var out: UiVertexOutput;
    out.uv = vertex_uv;
    out.size = size;
    out.border_widths = border_widths;
    out.border_radius = border_radius;
    if material.misc.z == 0.0 {
        // No 3D transform: reproduce the default UI vertex path EXACTLY — no
        // logical/physical round trip whose floating-point rounding could
        // nudge an untransformed layer by a subpixel.
        out.position = view.clip_from_world * vec4<f32>(vertex_position, 1.0);
        return out;
    }
    let k = max(material.misc.y, 1e-6);
    let origin = vertex_position.xy - vertex_uv * size;
    let p = material.transform * vec4<f32>(vertex_uv * size / k, 0.0, 1.0);
    out.position = view.clip_from_world
        * vec4<f32>(origin * p.w + k * p.xy, vertex_position.z * p.w, p.w);
    return out;
}

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
