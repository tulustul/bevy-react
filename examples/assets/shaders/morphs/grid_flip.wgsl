// Morph `gridFlip` (see `examples/demos/filters.rs`): a grid of cells where
// each cell card-flips from the old to the new image at a randomized moment,
// behind fading grid dividers.
//
// Port of gl-transitions GridFlip.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/GridFlip.glsl
//   Author: TimDonselaar (ported by gre) — License: MIT
//
// Params (declaration-order packing of `GridFlip`):
//   params[0].xy  size        cells per axis (upstream ivec2)
//   params[0].z   pause       divider fade-in/out fraction of the timeline
//   params[0].w   divider     divider half-width in PHYSICAL PX (a `Length`;
//                             the upstream uses a fraction of the cell size —
//                             normalized-units deviation, documented)
//   params[1]     color       divider/backdrop, straight linear RGBA
//   params[2].x   randomness  per-cell flip-time jitter
//
// PREMULTIPLY: the color param arrives straight — premultiplied before any
// mixing; the flip lerps premultiplied samples directly. Sampling sits
// behind the three phase branches (uniform) AND the divider branch
// (data-dependent), hence the explicit-LOD morph helpers; the flip's
// horizontally displaced uv is edge-clamped like the upstream sampler. The
// `abs(cp - 0.5)` flip denominator is guarded (upstream hits a 0-division on
// the edge-on frame, masked by `s`). Endpoint guards return the exact
// from/to samples (identity contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from_lod,
    morph_sample_to_lod,
    premultiply,
    uniforms,
}

fn rand_v(co: vec2<f32>) -> f32 {
    return fract(sin(dot(co, vec2<f32>(12.9898, 78.233))) * 43758.5453);
}

// Distance (in PHYSICAL PX) from `p` to the nearest cell edge.
fn delta_px(p: vec2<f32>, size: vec2<f32>) -> f32 {
    let cell_pos = floor(size * p);
    let cell_size = 1.0 / size;
    let top = cell_size.y * (cell_pos.y + 1.0);
    let bottom = cell_size.y * cell_pos.y;
    let left = cell_size.x * cell_pos.x;
    let right = cell_size.x * (cell_pos.x + 1.0);
    let min_x = min(abs(p.x - left), abs(p.x - right)) * uniforms.resolution.x;
    let min_y = min(abs(p.y - top), abs(p.y - bottom)) * uniforms.resolution.y;
    return min(min_x, min_y);
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

    let size = max(floor(uniforms.params[0].xy), vec2<f32>(1.0, 1.0));
    let pause = uniforms.params[0].z;
    let divider = uniforms.params[0].w;
    let bg = premultiply(uniforms.params[1]);
    let randomness = uniforms.params[2].x;

    let q = in.uv;
    let on_divider = delta_px(q, size) < divider;

    if progress < pause {
        // Phase 1: dividers fade in over the old image.
        let current = progress / max(pause, 1e-6);
        let a = select(1.0, 1.0 - current, on_divider);
        return mix(bg, morph_sample_from_lod(q), a);
    }
    if progress < 1.0 - pause {
        // Phase 2: per-cell flip.
        if on_divider {
            return bg;
        }
        let current = (progress - pause) / max(1.0 - pause * 2.0, 1e-6);
        let cell_pos = floor(size * q);

        let r = rand_v(cell_pos) - randomness;
        let cp = smoothstep(0.0, max(1.0 - r, 1e-4), current);

        // Horizontal squash about the column center — the card-flip illusion.
        let cell_w = 1.0 / size.x;
        let delta = cell_pos.x * cell_w;
        let offset = cell_w / 2.0 + delta;

        var d = abs(cp - 0.5);
        d = max(d, 1e-5);
        let p = vec2<f32>((q.x - offset) / d * 0.5 + offset, q.y);
        let sp = clamp(p, vec2<f32>(0.0), vec2<f32>(1.0));
        let a = morph_sample_from_lod(sp);
        let b = morph_sample_to_lod(sp);

        // Edge-on sliver (masked on the UNDISPLACED uv) shows the backdrop.
        let s = step(abs(size.x * (q.x - delta) - 0.5), abs(cp - 0.5));
        return mix(bg, mix(b, a, step(cp, 0.5)), s);
    }
    // Phase 3: dividers fade out over the new image.
    let current = (progress - 1.0 + pause) / max(pause, 1e-6);
    let a = select(1.0, current, on_divider);
    return mix(bg, morph_sample_to_lod(q), a);
}
