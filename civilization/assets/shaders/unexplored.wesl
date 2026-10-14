// The floor under the map (see `examples/civilization/map/mod.rs`), seen
// wherever no tile is explored and beyond the map's edge: black, with stars.
// The stars are pinned to the ground — they pan and zoom with the map — but
// drawn in pixels, round and the same size at any zoom and tilt; each blinks
// on its own clock.

import bevy_pbr::{
    render::forward_io::VertexOutput,
    render::mesh_view_bindings::globals,
};

const COOL: vec3<f32> = vec3<f32>(0.72, 0.82, 1.0);
const WARM: vec3<f32> = vec3<f32>(1.0, 0.9, 0.74);

fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// One layer of stars: at most one per `cell`-wide square of ground, `chance`
// of the squares lit, `size` px in radius. `to_px` turns a step on the ground
// into pixels. Returns the star's color.
fn stars(p: vec2<f32>, to_px: mat2x2<f32>, cell: f32, chance: f32, size: f32, seed: f32) -> vec3<f32> {
    let g = p / cell;
    let id = floor(g) + seed;
    let h = hash12(id);
    if h > chance {
        return vec3<f32>(0.0);
    }
    let at = vec2<f32>(hash12(id + 7.3), hash12(id + 3.9)) * 0.6 + 0.2;
    let d = length(to_px * ((fract(g) - at) * cell)) / size;
    let rate = 0.7 + 2.6 * hash12(id + 1.1);
    let blink = 0.5 + 0.5 * sin(globals.time * rate + h * 91.0);
    let glow = exp(-d * d) * blink * blink * (0.55 + 0.45 * hash12(id + 5.7));
    return mix(COOL, WARM, hash12(id + 9.1)) * glow;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let p = in.world_position.xz;
    // The ground a pixel spans, across and down the screen; its inverse.
    let across = dpdx(p);
    let down = dpdy(p);
    let det = across.x * down.y - down.x * across.y;
    let to_px = mat2x2<f32>(vec2<f32>(down.y, -across.y), vec2<f32>(-down.x, across.x)) * (1.0 / det);
    let rgb = stars(p, to_px, 0.35, 0.3, 0.8, 1.0) + stars(p, to_px, 0.9, 0.3, 1.5, 7.0);
    return vec4<f32>(rgb, 1.0);
}
