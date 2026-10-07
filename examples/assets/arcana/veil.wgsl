// Morph `veil` (see `examples/arcana/filters.rs`): the screen change between
// the card table and the grimoire. The new screen opens out of the middle on
// a smoky front with a glowing edge of `color`; the old one recedes under it.
//
// Params (declaration-order packing of `Veil`):
//   params[0]  color  edge glow, straight linear RGBA
//
// PREMULTIPLY: a lerp of the two premultiplied samples. The glow is light in
// its own right — over transparent screen areas (the 3D world shows through
// the UI there) it raises alpha to its own brightness, so the smoky front
// sweeps across the whole screen. Endpoint guards return the exact samples —
// the identity contract.

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn vnoise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash12(i), hash12(i + vec2<f32>(1.0, 0.0)), u.x),
        mix(hash12(i + vec2<f32>(0.0, 1.0)), hash12(i + vec2<f32>(1.0, 1.0)), u.x),
        u.y,
    );
}

const WIDTH: f32 = 0.08;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }
    let before = morph_sample_from(in.uv);
    let after = morph_sample_to(in.uv);
    let color = uniforms.params[0];

    let aspect = uniforms.resolution.x / uniforms.resolution.y;
    let c = (in.uv - 0.5) * vec2<f32>(aspect, 1.0);
    let d = length(c) / length(vec2<f32>(aspect, 1.0) * 0.5);
    let q = in.uv * vec2<f32>(aspect, 1.0) * 5.0;
    let n = 0.65 * vnoise(q) + 0.35 * vnoise(q * 2.3 + 7.0);
    let field = d * 0.7 + n * 0.3;
    let threshold = progress * (1.0 + 2.0 * WIDTH) - WIDTH;

    let keep_old = smoothstep(threshold - WIDTH * 0.5, threshold + WIDTH * 0.5, field);
    let mixed = mix(after, before, keep_old);
    let edge = max(1.0 - abs(field - threshold) / WIDTH, 0.0);
    let glow = color.rgb * color.a * edge * edge * 0.9;
    let alpha = max(mixed.a, max(glow.r, max(glow.g, glow.b)));
    return vec4<f32>(min(mixed.rgb + glow, vec3<f32>(alpha)), alpha);
}
