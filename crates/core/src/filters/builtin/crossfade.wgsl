// Crossfade morph (`builtin/morph.rs::CrossfadeParams`): a noise-staggered
// two-input blend. A smooth fbm value-noise field gives each pixel a stagger
// offset so blob-shaped regions cross-dissolve earlier than others; at
// `spread == 0` it degenerates to the plain `mix(from, to, progress)`.
//
// Packing: params[0] = (spread, scale_physical_px, softness, seed)
// `scale` is a Length slot — it arrives rewritten to PHYSICAL px, so the
// resolution-based noise coords below are DPI-correct.
//
// Each pixel fades linearly over a window `w = max(softness, eps)` starting
// at its noise stagger `n * spread`; the sweep spans `spread + w` in total so
// progress 0 is all "from" and progress 1 all "to". At spread == 0 the
// formula reduces to clamp(progress * w / w) == progress for ANY window; an
// explicit fast path makes that identity bit-exact. `local` is deliberately
// NOT smoothstepped — the engine easing owns the curve.
//
// Per the prelude's premultiplied contract both inputs are premultiplied and
// the lerp operates on them DIRECTLY — premultiplied color is the
// linear-interpolation-safe form, so coverage edges cross-dissolve without
// fringes. Endpoint guards keep progress 0 exactly "from" and progress 1
// exactly "to" (the identity contract: the settle frame must be pixel-equal
// to no pass). Both samples are taken up front in uniform control flow, so
// the plain (implicit-grad) samplers are fine.
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

// Cheap 2D->1D hash (Dave Hoskins' hash12; digit-free name for naga_oil).
fn hash_two(p: vec2<f32>) -> f32 {
    var h = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    h += dot(h, h.yzx + 33.33);
    return fract((h.x + h.y) * h.z);
}

// Smooth value noise over an integer lattice, in [0, 1).
fn value_noise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    let a = hash_two(i);
    let b = hash_two(i + vec2<f32>(1.0, 0.0));
    let c = hash_two(i + vec2<f32>(0.0, 1.0));
    let d = hash_two(i + vec2<f32>(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Three-octave fbm normalized to [0, 1) (raw amplitude sum is 0.875).
fn fbm(p: vec2<f32>) -> f32 {
    let s = 0.5 * value_noise(p)
        + 0.25 * value_noise(p * 2.03 + vec2<f32>(17.3, 23.7))
        + 0.125 * value_noise(p * 4.01 + vec2<f32>(41.7, 9.1));
    return s / 0.875;
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let from_color = morph_sample_from(in.uv);
    let to_color = morph_sample_to(in.uv);
    let progress = morph_progress();

    if progress <= 0.0 {
        return from_color;
    }
    if progress >= 1.0 {
        return to_color;
    }

    let spread = clamp(uniforms.params[0].x, 0.0, 1.0);
    let scale = max(uniforms.params[0].y, 1.0); // physical px; guard divide
    let softness = clamp(uniforms.params[0].z, 0.0, 1.0);
    let seed = uniforms.params[0].w;

    // Bit-exact uniform crossfade at spread 0 (skips the noise work too).
    if spread == 0.0 {
        return mix(from_color, to_color, progress);
    }

    // Noise coords in physical px; seed re-rolls by SLIDING the domain
    // (lattice coords must stay floored integers — fractional hash input
    // stripes).
    let q = in.uv * uniforms.resolution / scale + seed * vec2<f32>(103.7, 59.3);
    // Mild clamped contrast stretch: raw fbm mass sits near 0.5.
    let n = clamp((fbm(q) - 0.5) * 1.6 + 0.5, 0.0, 1.0);

    let w = max(softness, 1e-3);
    let local = clamp((progress * (spread + w) - n * spread) / w, 0.0, 1.0);

    return mix(from_color, to_color, local);
}
