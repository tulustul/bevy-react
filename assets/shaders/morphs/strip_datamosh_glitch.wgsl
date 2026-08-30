// Morph `stripDatamoshGlitch` (see `examples/demos/filters.rs`): VHS /
// datamosh glitch — hash-driven horizontal bars and vertical slits tear both
// images with RGB channel splits, scanlines, cell noise, and strobe flashes,
// peaking mid-transition (the glitch pattern re-rolls 30 times over the
// morph via a frame-quantized progress; no wall-clock time involved).
//
// Port of gl-transitions StripDatamoshGlitch.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/StripDatamoshGlitch.glsl
//   Author: bread — License: MIT
//
// Params (declaration-order packing of `StripDatamoshGlitch`):
//   params[0].x  strength  overall glitch intensity
//   params[0].y  bars      horizontal bar density (upstream `horizontalBars`)
//   params[0].z  slits     vertical slit density (upstream `verticalSlits`)
//   params[0].w  tear      per-row x-tear amplitude, fraction of width
//   params[1].x  chroma    RGB split offset in PHYSICAL PX (a `Length`;
//                          upstream: a uv fraction — normalized units)
//   params[1].y  residue   smear-layer strength
//   params[1].z  noise     cell-noise amount (upstream `noiseAmount`)
//   params[1].w  scan      scanline dimming (upstream `scanAmount`)
//   params[2].x  flash     strobe strength (upstream `flashAmount`)
//
// The GLSL `hash` overloads split into `hash_f`/`hash_v` (WGSL has no
// overloading). Control flow is fully uniform (the upstream's endpoint early
// returns are the identity-contract guards), so the plain morph samplers
// apply; every displaced uv passes through `safe_uv` like the upstream.
//
// PREMULTIPLY: the chroma helpers hardcode alpha 1 upstream; here they carry
// the CENTER sample's alpha, all additive terms (hairlines, noise, strobe)
// scale by the running alpha, and the final clamp keeps rgb <= a.

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

const PI: f32 = 3.141592653589793;

fn hash_f(n: f32) -> f32 {
    return fract(sin(n) * 43758.5453123);
}

fn hash_v(p: vec2<f32>) -> f32 {
    return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453123);
}

fn sat(v: f32) -> f32 {
    return clamp(v, 0.0, 1.0);
}

fn safe_uv(uv: vec2<f32>) -> vec2<f32> {
    return clamp(uv, vec2<f32>(0.0), vec2<f32>(1.0));
}

fn burst(progress: f32, strength: f32) -> f32 {
    return pow(max(0.0, sin(progress * PI)), 0.42) * strength;
}

fn stripe_y(uv: vec2<f32>, density: f32, seed: f32, min_width: f32, max_width: f32) -> f32 {
    let y = uv.y * density + seed * 0.137;
    let id = floor(y);
    let f = fract(y);
    let c = hash_v(vec2<f32>(id, seed));
    let w = mix(min_width, max_width, hash_v(vec2<f32>(id + 9.17, seed + 2.31)));
    return 1.0 - smoothstep(w, w + 0.018, abs(f - c));
}

fn stripe_x(uv: vec2<f32>, density: f32, seed: f32, min_width: f32, max_width: f32) -> f32 {
    let x = uv.x * density + seed * 0.091;
    let id = floor(x);
    let f = fract(x);
    let c = hash_v(vec2<f32>(id, seed + 41.0));
    let w = mix(min_width, max_width, hash_v(vec2<f32>(id + 4.7, seed + 8.9)));
    return 1.0 - smoothstep(w, w + 0.012, abs(f - c));
}

fn broken_gate(uv: vec2<f32>, row: f32, rnd: f32, frame: f32) -> f32 {
    let segs = mix(1.0, 9.0, hash_v(vec2<f32>(row, frame + 44.0)));
    let seg = floor(uv.x * segs);
    return step(0.16, hash_v(vec2<f32>(seg, row + frame * 3.0 + rnd)));
}

fn horizontal_mask(uv: vec2<f32>, frame: f32, bars: f32) -> f32 {
    let ra = floor((uv.y + hash_f(frame) * 0.031) * bars * 0.38);
    let rb = floor((uv.y + hash_f(frame + 2.0) * 0.013) * bars);
    let rc = floor((uv.y + hash_f(frame + 7.0) * 0.006) * bars * 3.4);

    var thick = stripe_y(uv, bars * 0.38, frame + 1.0, 0.035, 0.22);
    var mid = stripe_y(uv, bars, frame + 4.0, 0.014, 0.11);
    var hair = stripe_y(uv, bars * 3.4, frame + 9.0, 0.004, 0.035);

    thick *= step(0.42, hash_v(vec2<f32>(ra, frame + 10.0)));
    mid *= step(0.48, hash_v(vec2<f32>(rb, frame + 20.0)));
    hair *= step(0.62, hash_v(vec2<f32>(rc, frame + 30.0)));

    thick *= broken_gate(uv, ra, hash_v(vec2<f32>(ra, frame)), frame);
    mid *= broken_gate(uv, rb, hash_v(vec2<f32>(rb, frame)), frame + 3.0);

    return sat(max(thick, max(mid, hair)));
}

fn vertical_mask(uv: vec2<f32>, frame: f32, slits: f32) -> f32 {
    let col = floor((uv.x + hash_f(frame + 12.0) * 0.017) * slits);
    var slit = stripe_x(uv, slits, frame + 13.0, 0.01, 0.075);
    slit *= step(0.66, hash_v(vec2<f32>(col, frame + 19.0)));
    return sat(slit);
}

// RGB split of the frozen image; alpha rides from the center sample.
fn chroma_from(uv_in: vec2<f32>, s: vec2<f32>) -> vec4<f32> {
    let uv = safe_uv(uv_in);
    let center = morph_sample_from(uv);
    return vec4<f32>(
        morph_sample_from(safe_uv(uv + s)).r,
        center.g,
        morph_sample_from(safe_uv(uv - s)).b,
        center.a,
    );
}

// RGB split of the live image, mirrored offsets.
fn chroma_to(uv_in: vec2<f32>, s: vec2<f32>) -> vec4<f32> {
    let uv = safe_uv(uv_in);
    let center = morph_sample_to(uv);
    return vec4<f32>(
        morph_sample_to(safe_uv(uv - s)).r,
        center.g,
        morph_sample_to(safe_uv(uv + s)).b,
        center.a,
    );
}

fn distort_uv(
    uv: vec2<f32>,
    dir: f32,
    b: f32,
    h: f32,
    v: f32,
    frame: f32,
    progress: f32,
    bars: f32,
    slits: f32,
    tear: f32,
) -> vec2<f32> {
    let row = floor(uv.y * bars);
    let col = floor(uv.x * slits);

    let row_rnd = hash_v(vec2<f32>(row, frame));
    let col_rnd = hash_v(vec2<f32>(col, frame + 27.0));

    var x_tear = (row_rnd - 0.5) * 2.0 * tear * b * h;
    x_tear += sin(uv.y * 120.0 + progress * 95.0) * 0.006 * b;

    let y_drag = (col_rnd - 0.5) * 0.13 * b * v;
    let micro = (hash_v(vec2<f32>(row, col + frame)) - 0.5) * 0.018 * b * max(h, v);

    return uv + vec2<f32>(x_tear * dir + micro, y_drag);
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

    let strength = uniforms.params[0].x;
    let bars = uniforms.params[0].y;
    let slits = uniforms.params[0].z;
    let tear = uniforms.params[0].w;
    // Length param: physical px → uv fraction of the width (the upstream
    // `chroma` is a uv fraction).
    let chroma = uniforms.params[1].x * uniforms.texel_size.x;
    let residue = uniforms.params[1].y;
    let noise_amount = uniforms.params[1].z;
    let scan_amount = uniforms.params[1].w;
    let flash_amount = uniforms.params[2].x;

    let uv = in.uv;
    let b = burst(progress, strength);
    let frame = floor(progress * 30.0);

    let h = horizontal_mask(uv, frame, bars);
    let v = vertical_mask(uv, frame, slits);
    let glitch = sat(max(h, v * 0.75));

    let row = floor(uv.y * bars);
    let row_rnd = hash_v(vec2<f32>(row, frame + 5.0));

    let band_delay = (row_rnd - 0.5) * 0.30 * h;
    let reveal = smoothstep(0.18, 0.84, progress + band_delay);

    let split = vec2<f32>(chroma * b * (1.0 + 1.7 * glitch), chroma * 0.22 * b * v);

    let from_uv = distort_uv(uv, 1.0, b, h, v, frame, progress, bars, slits, tear);
    let to_uv = distort_uv(uv, -1.0, b, h, v, frame, progress, bars, slits, tear);

    var color = mix(chroma_from(from_uv, split), chroma_to(to_uv, split), reveal);

    // Horizontal time-slice residue: old/new frames dragged through uneven
    // scan bands.
    var smear_uv = uv;
    smear_uv.x += (row_rnd - 0.5) * 0.46 * b * h;
    smear_uv.y += (hash_v(vec2<f32>(row, frame + 31.0)) - 0.5) * 0.045 * b * h;

    let slice_reveal = smoothstep(0.28, 0.78, progress + (row_rnd - 0.5) * 0.22);
    let slice_color = mix(
        chroma_from(smear_uv, split * 1.65),
        chroma_to(smear_uv - vec2<f32>((row_rnd - 0.5) * 0.18 * b, 0.0), split * 1.65),
        slice_reveal,
    );

    color = mix(color, slice_color, h * b * residue);

    // Thin scan sparks and broken white lines — scaled by the running alpha
    // so transparent regions stay dark.
    var hair_line = stripe_y(uv, 190.0, frame + 55.0, 0.002, 0.012);
    hair_line *= step(0.70, hash_v(vec2<f32>(floor(uv.y * 190.0), frame + 56.0)));
    var rgb = color.rgb + vec3<f32>(0.72, 0.90, 1.0) * hair_line * b * 0.28 * color.a;

    let scan = 0.5 + 0.5 * sin(uv.y * 980.0 + progress * 130.0);
    rgb *= 1.0 - scan_amount * b * scan;

    // Cell noise on the upstream's ratio-scaled grid.
    let ratio = uniforms.resolution.x / uniforms.resolution.y;
    let n_cell = floor(uv * vec2<f32>(360.0 * ratio, 210.0));
    let n = hash_v(n_cell + vec2<f32>(frame * 7.0, frame * 13.0));
    rgb += (n - 0.5) * noise_amount * b * (0.55 + glitch) * color.a;

    // Slight desaturation during the damage peak.
    let luma = dot(rgb, vec3<f32>(0.299, 0.587, 0.114));
    rgb = mix(rgb, vec3<f32>(luma), 0.18 * b * glitch);

    let strobe = step(0.78, hash_v(vec2<f32>(frame, 3.14))) * pow(b, 1.65);
    rgb += vec3<f32>(strobe * flash_amount) * color.a;

    // Premultiplied validity: rgb stays within [0, a].
    return vec4<f32>(clamp(rgb, vec3<f32>(0.0), vec3<f32>(color.a)), color.a);
}
