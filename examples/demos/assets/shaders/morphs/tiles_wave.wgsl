// Morph `tilesWave` (see `examples/demos/filters.rs`): a tile grid where
// each tile card-flips on a staggered diagonal wave — the first half of a
// tile's flip squashes the old image to its centerline, the second half
// unfolds the new image mirrored in.
//
// Port of gl-transitions TilesWave.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/TilesWave.glsl
//   Author: numb3r23 — License: MIT
//
// Params (declaration-order packing of `TilesWave`):
//   params[0].xy  tiles  tile count per axis (upstream ivec2 `tileCount`)
//   params[0].z   flipx  1 = fold along x (upstream bool `flipX`)
//   params[0].w   flipy  1 = fold along y (upstream bool `flipY`)
//
// PREMULTIPLY: every path returns one plain texture sample (possibly at a
// tile-locally displaced uv) — no blending math, samples stay premultiplied.
// Sampling sits behind data-dependent branches, hence the explicit-LOD morph
// helpers. The reconstructed uv never leaves the tile, so no clamping is
// needed; the fold's `0.5 - sinTime` denominator is guarded sign-preserving
// (the upstream hits 0/0 on the zero-width band at `sinTime == 0.5`).
// Endpoint guards return the exact from/to samples (identity contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from_lod,
    morph_sample_to_lod,
    uniforms,
}

const PI: f32 = 3.1415926;

// The upstream fold: squash `t` inward from both band edges toward the tile
// centerline. Denominator guarded away from 0 with its sign kept.
fn fold(t: f32, sin_time: f32) -> f32 {
    var d = 0.5 - sin_time;
    d = select(max(d, 1e-6), min(d, -1e-6), d < 0.0);
    if t < 0.5 {
        return (t - sin_time) * 0.5 / d;
    }
    return (t - 0.5) * 0.5 / d + 0.5;
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

    let tiles = max(floor(uniforms.params[0].xy), vec2<f32>(1.0, 1.0));
    let flipx = uniforms.params[0].z > 0.5;
    let flipy = uniforms.params[0].w > 0.5;

    let tile_size = 1.0 / tiles;
    let pos_in_tile = fract(in.uv * tiles);
    let tile_num = floor(in.uv * tiles);
    let count_tiles = tiles.x * tiles.y;

    // Diagonal wave: each tile's flip is staggered by its scan position.
    let offset = (tile_num.y + tile_num.x * tiles.y) / count_tiles;
    let time_offset = clamp((progress - offset) * count_tiles, 0.0, 0.5);
    let sin_time = 1.0 - abs(cos(fract(time_offset) * PI));

    var tex_c = pos_in_tile;

    if sin_time <= 0.5 {
        // First half: the old image squashes toward the tile centerline; the
        // bands already swallowed show it un-displaced (upstream behavior).
        if flipx {
            if tex_c.x < sin_time || tex_c.x > 1.0 - sin_time {
                return morph_sample_from_lod(in.uv);
            }
            tex_c.x = fold(tex_c.x, sin_time);
        }
        if flipy {
            if tex_c.y < sin_time || tex_c.y > 1.0 - sin_time {
                return morph_sample_from_lod(in.uv);
            }
            tex_c.y = fold(tex_c.y, sin_time);
        }
        return morph_sample_from_lod(tile_num * tile_size + tex_c * tile_size);
    }

    // Second half: the new image unfolds, mirrored.
    if flipx {
        if tex_c.x > sin_time || tex_c.x < 1.0 - sin_time {
            return morph_sample_to_lod(in.uv);
        }
        tex_c.x = 1.0 - fold(tex_c.x, sin_time);
    }
    if flipy {
        if tex_c.y > sin_time || tex_c.y < 1.0 - sin_time {
            return morph_sample_to_lod(in.uv);
        }
        tex_c.y = 1.0 - fold(tex_c.y, sin_time);
    }
    return morph_sample_to_lod(tile_num * tile_size + tex_c * tile_size);
}
