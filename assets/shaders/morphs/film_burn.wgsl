// Morph `filmBurn` (see `examples/demos/filters.rs`): analog film burn —
// orange/white light flares and a soft radial blur wash over the crossfade,
// peaking mid-transition.
//
// Port of gl-transitions FilmBurn.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/FilmBurn.glsl
//   Author: Anastasia Dunbar — License: MIT
//
// Params (declaration-order packing of `FilmBurn`):
//   params[0].x  seed  flare pattern seed (upstream `Seed`)
//
// FAITHFUL-PORT NOTES: the GLSL `rand` overloads split into `rand_f`/
// `rand_v`, its `texture()` helper is renamed `blend_sample` (reserved-ish),
// `pow3` → `pow_rgb`, `uv2` → `uv_blur` (no trailing-digit identifiers). The
// quirky `degrees((i/repeats)*360.)` is KEPT — it wraps the blur ring ~57
// times and the look depends on it. The 50-iteration blur loop samples both
// images each step (~100 samples/px per in-flight frame — the accepted cost,
// see the struct rustdoc). Explicit-LOD samplers since sampling happens
// inside loops.
//
// PREMULTIPLY: the crossfade and the blur average operate on premultiplied
// colors directly; the additive flare is scaled by the blurred alpha (the
// upstream adds it with alpha 0 assuming opaque content) and the result is
// clamped to rgb <= a. Endpoint guards return the exact from/to samples
// (identity contract) — the upstream converges only within f32 error.

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from_lod,
    morph_sample_to_lod,
    uniforms,
}

const PI: f32 = 3.14159265358979323;
const REPEATS: f32 = 50.0;

fn sigmoid(x: f32, a: f32) -> f32 {
    var b = pow(x * 2.0, a) / 2.0;
    if x > 0.5 {
        b = 1.0 - pow(2.0 - (x * 2.0), a) / 2.0;
    }
    return b;
}

fn rand_f(co: f32, seed: f32) -> f32 {
    return fract(sin((co * 24.9898) + seed) * 43758.5453);
}

fn rand_v(co: vec2<f32>) -> f32 {
    return fract(sin(dot(co, vec2<f32>(12.9898, 78.233))) * 43758.5453);
}

fn apow(a: f32, b: f32) -> f32 {
    return pow(abs(a), b) * sign(b);
}

fn pow_rgb(a: vec3<f32>, b: vec3<f32>) -> vec3<f32> {
    return vec3<f32>(apow(a.r, b.r), apow(a.g, b.g), apow(a.b, b.b));
}

fn smooth_mix(a: f32, b: f32, c: f32) -> f32 {
    return mix(a, b, sigmoid(c, 2.0));
}

fn random_shift(co_in: vec2<f32>, shft: f32, seed: f32) -> f32 {
    let co = co_in + 10.0;
    return smooth_mix(
        fract(sin(dot(co, vec2<f32>(12.9898 + (floor(shft) * 0.5), 78.233 + seed))) * 43758.5453),
        fract(
            sin(dot(co, vec2<f32>(12.9898 + (floor(shft + 1.0) * 0.5), 78.233 + seed))) * 43758.5453
        ),
        fract(shft),
    );
}

fn smooth_random(co: vec2<f32>, shft: f32, seed: f32) -> f32 {
    return smooth_mix(
        smooth_mix(
            random_shift(floor(co), shft, seed),
            random_shift(floor(co + vec2<f32>(1.0, 0.0)), shft, seed),
            fract(co.x),
        ),
        smooth_mix(
            random_shift(floor(co + vec2<f32>(0.0, 1.0)), shft, seed),
            random_shift(floor(co + vec2<f32>(1.0, 1.0)), shft, seed),
            fract(co.x),
        ),
        fract(co.y),
    );
}

// The upstream's `texture()` helper: the base crossfade.
fn blend_sample(p: vec2<f32>, progress: f32) -> vec4<f32> {
    let uv = clamp(p, vec2<f32>(0.0), vec2<f32>(1.0));
    return mix(morph_sample_from_lod(uv), morph_sample_to_lod(uv), sigmoid(progress, 10.0));
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from_lod(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to_lod(in.uv);
    }

    let seed = uniforms.params[0].x;

    // Flare field: sine-product interference plus moving bright spots.
    var f = vec3<f32>(0.0);
    var p = in.uv;
    for (var i = 0.0; i < 13.0; i += 1.0) {
        f += sin(((p.x * rand_f(i, seed) * 6.0) + (progress * 8.0)) + rand_f(i + 1.43, seed))
            * sin(((p.y * rand_f(i + 4.4, seed) * 6.0) + (progress * 6.0)) + rand_f(i + 2.4, seed));
        f += 1.0
            - clamp(
                length(
                    p
                        - vec2<f32>(
                            smooth_random(vec2<f32>(progress * 1.3), i + 1.0, seed),
                            smooth_random(vec2<f32>(progress * 0.5), i + 6.25, seed),
                        )
                ) * mix(20.0, 70.0, rand_f(i, seed)),
                0.0,
                1.0,
            );
    }
    f += 4.0;
    f /= 11.0;
    f = pow_rgb(
        f * vec3<f32>(1.0, 0.7, 0.6),
        vec3<f32>(1.0, 2.0 - sin(progress * PI), 1.3),
    );
    f *= sin(progress * PI);

    // Slight animated zoom.
    p -= 0.5;
    p *= 1.0 + (smooth_random(vec2<f32>(progress * 5.0), 6.3, seed) * sin(progress * PI) * 0.05);
    p += 0.5;

    // Radial ring blur: 50 iterations × both images. The `degrees()` is the
    // upstream's quirk — the ring wraps ~57 times; do not "fix" to radians.
    var blurred_image = vec4<f32>(0.0);
    let bluramount = sin(progress * PI) * 0.03;
    for (var i = 0.0; i < REPEATS; i += 1.0) {
        let ang = degrees((i / REPEATS) * 360.0);
        let q = vec2<f32>(cos(ang), sin(ang)) * (rand_v(vec2<f32>(i, p.x + p.y)) + bluramount);
        let uv_blur = p + (q * bluramount);
        blurred_image += blend_sample(uv_blur, progress);
    }
    blurred_image /= REPEATS;

    // Additive flare, scaled by the blurred alpha; rgb clamped within a.
    let rgb = clamp(
        blurred_image.rgb + f * blurred_image.a,
        vec3<f32>(0.0),
        vec3<f32>(blurred_image.a),
    );
    return vec4<f32>(rgb, blurred_image.a);
}
