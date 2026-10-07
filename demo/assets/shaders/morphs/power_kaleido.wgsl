// Morph `powerKaleido` (see `examples/demos/filters.rs`): a rotating
// kaleidoscope — uv folds through repeated wedge reflections while spinning,
// unwarping to the plain images at both ends over a cosine crossfade.
//
// Port of gl-transitions powerKaleido.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/powerKaleido.glsl
//   Author: Boundless — License: MIT
//
// Params (declaration-order packing of `PowerKaleido`):
//   params[0].x  scale  wedge offset scale (upstream `dist = scale / 10`)
//   params[0].y  z      zoom into the kaleido plane
//   params[0].z  speed  rotation speed (radians of spin per unit progress)
//
// The upstream's float-counter loops (10 outer × the 3 wedge angles of the
// 120° mirror) become integer loops; its uniform-initialized global `dist`
// folds into the fragment fn. The mirror-wrap at the end keeps the final uv
// inside [0,1], and both samples happen at top-level uniform flow, so the
// plain (implicit-grad) morph helpers apply.
//
// PREMULTIPLY: both images sample at the same folded uv and blend by a
// scalar cosine factor — a direct lerp of premultiplied colors. The upstream
// converges to the plain images at the endpoints only within f32 error; the
// endpoint guards make the freeze/settle frames exact (identity contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

const PI: f32 = 3.14159265358979;
// 120° mirror (upstream `rad = 120.`).
const DEG: f32 = 120.0 / 180.0 * PI;

// Reflect `p` about the line through `o` with normal `n`.
fn refl(p: vec2<f32>, o: vec2<f32>, n: vec2<f32>) -> vec2<f32> {
    return 2.0 * o + 2.0 * n * dot(p - o, n) - p;
}

// Rotate `p` around `o` by `a`.
fn rot(p: vec2<f32>, o: vec2<f32>, a: f32) -> vec2<f32> {
    let s = sin(a);
    let c = cos(a);
    return o + mat2x2<f32>(vec2<f32>(c, -s), vec2<f32>(s, c)) * (p - o);
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

    let scale = uniforms.params[0].x;
    let z = uniforms.params[0].y;
    let speed = uniforms.params[0].z;
    let dist = scale / 10.0;
    let ratio = uniforms.resolution.x / uniforms.resolution.y;

    let uv_orig = in.uv;
    var uv = in.uv - 0.5;
    uv.x *= ratio;
    uv *= z;
    uv = rot(uv, vec2<f32>(0.0), progress * speed);

    for (var iter = 0; iter < 10; iter++) {
        for (var j = 0; j < 3; j++) {
            let i = f32(j) * DEG;
            // Upstream `ts = sign(asin(cos(i))) == 1.0` — true only for the
            // first wedge angle.
            let ts = j == 0;
            let lhs = uv.y - dist * cos(i);
            let rhs = tan(i) * (uv.x + dist * sin(i));
            if (ts && lhs > rhs) || (!ts && lhs < rhs) {
                uv = refl(
                    vec2<f32>(uv.x + sin(i) * dist * 2.0, uv.y - cos(i) * dist * 2.0),
                    vec2<f32>(0.0, 0.0),
                    vec2<f32>(cos(i), sin(i)),
                );
            }
        }
    }

    uv += 0.5;
    uv = rot(uv, vec2<f32>(0.5, 0.5), progress * -speed);
    uv -= 0.5;
    uv.x /= ratio;
    uv += 0.5;
    // Mirror-repeat wrap into [0,1].
    uv = 2.0 * abs(uv / 2.0 - floor(uv / 2.0 + 0.5));

    // Blend kaleido-uv with the original so both endpoints are undistorted.
    let uv_mix = mix(uv, uv_orig, cos(progress * PI * 2.0) / 2.0 + 0.5);
    let fade = cos((progress - 1.0) * PI) / 2.0 + 0.5;
    return mix(morph_sample_from(uv_mix), morph_sample_to(uv_mix), fade);
}
