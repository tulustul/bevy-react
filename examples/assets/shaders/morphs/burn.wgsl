// Morph `burn0` (see `examples/demos/filters.rs`): an fbm-noise burn wipe —
// the new image eats through the old along a noise front, with a glowing
// rim of `color` at the edge.
//
// Port of gl-transitions burn0.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/burn0.glsl
//   Author: liubailin2020@gmail.com — License: MIT
//
// Params (declaration-order packing of `Burn`):
//   params[0]  color  rim glow, straight linear RGBA (a `FilterColor`)
//
// PREMULTIPLY: the base is a direct lerp of premultiplied samples. The
// upstream adds the rim as `vec4(burnColor, 0.0)` — an additive straight-RGB
// term assuming opaque content; here the rim is scaled by the blended
// sample's alpha (and the color's own alpha) so transparent regions don't
// glow, keeping rgb <= a. Endpoint guards return the exact from/to samples
// (identity contract) — the upstream has the same early returns.

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

fn rand_v(st: vec2<f32>) -> f32 {
    return fract(sin(dot(st, vec2<f32>(12.9898, 78.233))) * 43758.5453123);
}

// Value noise (Morgan McGuire), smoothstep-interpolated hash lattice.
fn value_noise(st: vec2<f32>) -> f32 {
    let i = floor(st);
    let f = fract(st);
    let a = rand_v(i);
    let b = rand_v(i + vec2<f32>(1.0, 0.0));
    let c = rand_v(i + vec2<f32>(0.0, 1.0));
    let d = rand_v(i + vec2<f32>(1.0, 1.0));
    let u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 4-octave fbm (upstream OCTAVES = 4).
fn fbm(st_in: vec2<f32>) -> f32 {
    var st = st_in;
    var value = 0.0;
    var amplitude = 0.5;
    for (var i = 0; i < 4; i++) {
        value += amplitude * value_noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }

    let burn = uniforms.params[0];

    let from_color = morph_sample_from(in.uv);
    let to_color = morph_sample_to(in.uv);
    let n = fbm(in.uv * 4.0);
    let l = smoothstep(progress, progress + 0.05, n);
    let edge = (1.0 - l) * l * 5.0;

    var color = mix(to_color, from_color, l);
    color = vec4<f32>(color.rgb + burn.rgb * burn.a * edge * color.a, color.a);
    return color;
}
