// One direction of the separable Gaussian blur (`filters.rs::BlurParams`
// resolves to two of these passes, horizontal then vertical). Packing:
//
//   params[0] = (radius_px, dir.x, dir.y, 0)   dir (1,0) then (0,1), texel units
//
// The radius arrives in physical px (the chain resolver rewrites the logical
// `Length` slot before upload). Per the contract in `filter_prelude.wgsl` a
// blur is linear resampling and therefore operates on PREMULTIPLIED color
// directly — no unpremultiply/premultiply around the taps.
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    source_sampler,
    source_texture,
    uniforms,
}

// The most taps on each side of the center (the old single-pass filter's
// half-window cap, kept per direction).
const MAX_HALF: i32 = 16;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let radius = uniforms.params[0].x;
    let dir = uniforms.params[0].yz;
    if radius <= 0.0 {
        return textureSample(source_texture, source_sampler, in.uv);
    }
    // One tap per px of radius up to the cap, so samples stay dense; past the
    // cap the taps spread (`span` px apart) and bilinear filtering smooths
    // between them — but once `span` exceeds ~2 px (radius > 32 per side) taps
    // skip texels entirely, so very large radii undersample rather than stay
    // perfectly smooth: quality is bounded by MAX_HALF, by design. Gaussian
    // sigma = radius / 2, truncated at the radius; weights are normalized by
    // their in-loop sum, so truncation never darkens.
    let half_taps = clamp(i32(ceil(radius)), 1, MAX_HALF);
    let span = radius / f32(half_taps); // px between adjacent taps
    let sigma = radius * 0.5;
    let two_sigma2 = 2.0 * sigma * sigma;
    var sum = vec4<f32>(0.0);
    var wsum = 0.0;
    for (var i = -half_taps; i <= half_taps; i = i + 1) {
        let d = f32(i) * span; // px distance from center
        let w = exp(-(d * d) / two_sigma2);
        let uv = in.uv + dir * uniforms.texel_size * d;
        sum = sum + textureSample(source_texture, source_sampler, uv) * w;
        wsum = wsum + w;
    }
    return sum / wsum;
}
