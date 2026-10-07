// Morph `condense` (see `examples/atrium/filters.rs`): how text changes in
// Atrium's HUD — the way its windows form. The old text breaks into noise
// and drifts up; the new one condenses out of the same noise, a cool light
// burning along the front between them.
//
// Params (declaration-order packing of `Condense`):
//   params[0]  color  edge light, straight linear RGBA
//
// PREMULTIPLY: a lerp of the two premultiplied samples plus light that
// raises alpha to its own brightness. The endpoints return the exact
// samples — the identity contract.

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

const WIDTH: f32 = 0.12;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }
    // In px, so the grain is the same size on any node.
    let px = in.uv * uniforms.resolution;
    let n = 0.6 * vnoise(px / 9.0) + 0.4 * vnoise(px / 3.5 + 11.0);
    // Left to right, broken up by the noise.
    let field = in.uv.x * 0.45 + n * 0.55;
    let threshold = progress * (1.0 + 2.0 * WIDTH) - WIDTH;
    let gone = smoothstep(threshold - WIDTH * 0.4, threshold + WIDTH * 0.4, field);

    // The old text lifts away as it breaks up.
    let lift = (1.0 - gone) * 6.0 / uniforms.resolution.y;
    let before = morph_sample_from(in.uv + vec2<f32>(0.0, lift));
    let after = morph_sample_to(in.uv);
    let mixed = mix(after, before, gone);

    let color = uniforms.params[0];
    let edge = max(1.0 - abs(field - threshold) / WIDTH, 0.0);
    let ink = max(before.a, after.a);
    let glow = color.rgb * color.a * edge * edge * ink * 1.4;
    let alpha = max(mixed.a, max(glow.r, max(glow.g, glow.b)));
    return vec4<f32>(min(mixed.rgb + glow, vec3<f32>(alpha)), alpha);
}
