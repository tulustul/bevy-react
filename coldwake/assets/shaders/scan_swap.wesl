// Morph `scanSwap` (see `examples/coldwake/filters.rs`): every tab and
// page change inside a hologram. A scan line sweeps down the hologram: above
// it the new page, below it the old, the rows nearest the line smeared
// sideways and lit in the line's tint.
//
// Params (declaration-order packing of `ScanSwap`):
//   params[0].x  softness (0..1 of the height)
//   params[1]    tint (straight linear RGBA; alpha = how bright the line)
//
// PREMULTIPLY: both images are premultiplied captures, resampled directly;
// the line's light raises rgb and alpha together (light carries its own
// coverage). Endpoint guards return the exact samples — the identity
// contract.

import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
};

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }
    let soft = max(uniforms.params[0].x, 1e-3);
    let tint = uniforms.params[1];
    // The line runs from just above the top to just below the bottom.
    let line = mix(-soft, 1.0 + soft, progress);
    let d = in.uv.y - line;
    let near = 1.0 - smoothstep(0.0, soft, abs(d));
    // Rows near the line smear sideways.
    let wobble = sin(in.uv.y * uniforms.resolution.y * 0.9) * near * 3.0 / uniforms.resolution.x;
    let uv = in.uv + vec2<f32>(wobble, 0.0);
    var c = select(morph_sample_from(uv), morph_sample_to(uv), d < 0.0);
    let rgb = c.rgb + tint.rgb * tint.a * near * near;
    let a = min(max(c.a, max(rgb.r, max(rgb.g, rgb.b))), 1.0);
    return vec4<f32>(min(rgb, vec3<f32>(a)), a);
}
