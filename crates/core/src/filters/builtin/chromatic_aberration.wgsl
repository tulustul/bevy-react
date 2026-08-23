// Directional chromatic aberration
// (`builtin/chromatic_aberration.rs::ChromaticAberrationParams`): a uniform
// RGB split — the R channel's image shifts `offset` px along `angle`, B the
// same distance opposite, G stays put — plus an optional tangential swirl:
// `rotation` spins the R image by +rotation around the node's content-rect
// center and B by -rotation, growing toward the edges while the center stays
// clean. The directional split is uniform across the layer (contrast with a
// radial lens model, which grows from the center); the swirl composes
// additively on top. Packing:
//
//   params[0] = (offset_px, angle_radians, rotation_degrees, 0)
//
// The offset arrives in physical px (the chain resolver rewrites the logical
// `Length` slot before upload); the angle is radians, measured clockwise
// from +X in screen space (y down) — 0 shifts R rightward, 90deg downward.
// The rotation arrives in DEGREES (a Scalar slot, not Angle: animated
// bindings write Scalar slots through unchanged, and the magnitude must lerp
// linearly, never shortest-arc) — this shader converts with `radians()`.
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
    content_rect_min,
    content_rect_size,
    source_sampler,
    source_texture,
    uniforms,
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let angle = uniforms.params[0].y;
    let dir = vec2<f32>(cos(angle), sin(angle));
    let offset = dir * uniforms.params[0].x * uniforms.texel_size;
    // Tangential swirl: rotate the R/B *sample positions* by -/+rot around
    // the node's center in PHYSICAL PX (aspect-correct — a UV-space rotation
    // would shear on non-square targets). Sampling at a position rotated by
    // -rot rotates the drawn image by +rot. rot == 0 -> cs = 1, sn = 0, both
    // deltas equal `d`, and the pass is bit-exact with the directional-only
    // split.
    let rot = radians(uniforms.params[0].z);
    let cs = cos(rot);
    let sn = sin(rot);
    let center = content_rect_min() + 0.5 * content_rect_size();
    let d = in.uv * uniforms.resolution - center;
    let d_r = vec2<f32>(d.x * cs + d.y * sn, -d.x * sn + d.y * cs); // -rot
    let d_b = vec2<f32>(d.x * cs - d.y * sn, d.x * sn + d.y * cs); // +rot
    let r_uv = (center + d_r) * uniforms.texel_size;
    let b_uv = (center + d_b) * uniforms.texel_size;
    // Sampling at `uv - offset` translates the red image BY `+offset` (along
    // the angle); B mirrors it. All three samples are unconditional (uniform
    // control flow); at offset 0 + rotation 0 they coincide and the pass is
    // an identity.
    let r = textureSample(source_texture, source_sampler, r_uv - offset);
    let g = textureSample(source_texture, source_sampler, in.uv);
    let b = textureSample(source_texture, source_sampler, b_uv + offset);
    return vec4<f32>(r.r, g.g, b.b, max(r.a, max(g.a, b.a)));
}
