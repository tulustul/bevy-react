// Directional chromatic aberration
// (`builtin/chromatic_aberration.rs::ChromaticAberrationParams`): a uniform
// RGB split — the R channel's image shifts `offset` px along `angle`, B the
// same distance opposite, G stays put. The whole layer splits identically
// (contrast with a radial lens model, which grows from the center). Packing:
//
//   params[0] = (offset_px, angle_radians, 0, 0)
//
// The offset arrives in physical px (the chain resolver rewrites the logical
// `Length` slot before upload); the angle is radians, measured clockwise
// from +X in screen space (y down) — 0 shifts R rightward, 90deg downward.
//
// Per the contract in `filter_prelude.wgsl` this is resampling and therefore
// operates on PREMULTIPLIED color directly — no unpremultiply around the
// samples. Each output channel stays <= its own sample's alpha, and the
// output alpha is the max of the three samples' alphas: the premultiplied
// invariant holds, and a fringe outside the silhouette (where only the
// shifted channel's sample has coverage) keeps its own alpha instead of
// vanishing.
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    source_sampler,
    source_texture,
    uniforms,
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let angle = uniforms.params[0].y;
    let dir = vec2<f32>(cos(angle), sin(angle));
    let offset = dir * uniforms.params[0].x * uniforms.texel_size;
    // Sampling at `uv - offset` translates the red image BY `+offset` (along
    // the angle); B mirrors it. All three samples are unconditional (uniform
    // control flow); at offset 0 they coincide and the pass is an identity.
    let r = textureSample(source_texture, source_sampler, in.uv - offset);
    let g = textureSample(source_texture, source_sampler, in.uv);
    let b = textureSample(source_texture, source_sampler, in.uv + offset);
    return vec4<f32>(r.r, g.g, b.b, max(r.a, max(g.a, b.a)));
}
