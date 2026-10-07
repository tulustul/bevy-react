// Custom filter `dissolve` (see `examples/demos/filters.rs`): burn-away
// dissolve — texels whose procedural value noise falls below `progress`
// become fully transparent, with a thin glowing ember edge just above the
// threshold. NOT time-driven: the pass re-runs only when `progress` changes
// (a params-only update; the capture is reused).
//
// Params (declaration-order packing of `Dissolve`):
//   params[0].x  progress  0 = intact, 1 = fully dissolved
//
// PREMULTIPLY: an alpha-threshold filter needs no color math on straight
// alpha, so it operates on the premultiplied sample directly:
//   - below the threshold it outputs vec4(0.0) — transparent black, the one
//     valid fully-transparent premultiplied texel;
//   - at the ember edge it tints toward `EMBER * texel.a`: scaling the ember
//     color by the sample's own alpha keeps rgb <= a (valid premultiplied)
//     and leaves already-transparent texels transparent;
//   - elsewhere the sample passes through untouched.

#import bevy_react::filter::{FullscreenVertexOutput, source_sampler, source_texture, uniforms}

// Glow color at the burn edge (linear-space orange).
const EMBER: vec3<f32> = vec3<f32>(1.0, 0.35, 0.05);
// Ember band width, in noise units.
const EDGE: f32 = 0.08;

fn hash2(p: vec2<f32>) -> f32 {
    return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

// Smooth value noise in [0, 1): bilinear hash lattice with a smoothstep fade.
fn value_noise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    let bottom = mix(hash2(i), hash2(i + vec2<f32>(1.0, 0.0)), u.x);
    let top = mix(hash2(i + vec2<f32>(0.0, 1.0)), hash2(i + vec2<f32>(1.0, 1.0)), u.x);
    return mix(bottom, top, u.y);
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = uniforms.params[0].x;
    let texel = textureSample(source_texture, source_sampler, in.uv);

    // Fixed-size noise cells (~26 physical px) so the burn pattern doesn't
    // stretch with the layer; two octaves to roughen the front.
    let p = in.uv * uniforms.resolution / 26.0;
    let noise = value_noise(p) * 0.75 + value_noise(p * 2.7) * 0.25;

    // Overshoot slightly so progress = 1 clears even the highest-noise texels.
    let threshold = progress * (1.0 + EDGE);
    if noise < threshold {
        return vec4<f32>(0.0);
    }

    // Ember band just above the threshold, faded in over the first bit of
    // progress so an intact image (progress = 0) shows no speckle.
    let edge = (1.0 - smoothstep(0.0, EDGE, noise - threshold)) * smoothstep(0.0, 0.05, progress);
    return vec4<f32>(mix(texel.rgb, EMBER * texel.a, edge), texel.a);
}
