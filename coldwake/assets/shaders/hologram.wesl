// The hologram material (see `examples/coldwake/holo/material.rs`): a React
// `<surface>` drawn as projected light. The UI arrives premultiplied and
// linear and leaves the same way, its colors raised by `gain` so the bright
// parts bloom; dark translucent plates keep their alpha and dim the room
// behind them.
//
//   * Unfolding (`presence` 0 → 1): a line of light grows out from the
//     center, then the image opens up and down out of it, squeezed flat at
//     first, flickering until it settles. Folding runs it backwards.
//   * Scanlines drift down every 3 logical px; the light shimmers and now
//     and then drops out for a frame.
//   * From behind, the image shows mirrored and dimmed.
//   * A dead panel (`power` 0: nobody within reach) is the same image in
//     dim grey, under the bloom; waking eases the color and the light in.
//   * Where the suit's pointer lands (`cursor`), a small ring and a dot.
//   * From across the room a pixel covers many of the UI's texels (the
//     texture has no mips): they are averaged over the pixel's footprint,
//     and the scanlines fade out before they would beat against the pixel
//     grid.
//
// Uniforms:
//   look   = (presence 0..1, gain, seed, flicker 0..1)
//   shape  = (logical px w, logical px h, scanline strength 0..1, power 0..1)
//   cursor = (u, v, strength 0..1, -)

import bevy_pbr::render::{forward_io::VertexOutput, mesh_view_bindings::globals};

@group(constants::MATERIAL_BIND_GROUP) @binding(0) var<uniform> look: vec4<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(1) var<uniform> shape: vec4<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(2) var ui: texture_2d<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(3) var ui_sampler: sampler;
@group(constants::MATERIAL_BIND_GROUP) @binding(4) var<uniform> cursor: vec4<f32>;

fn hash(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

/// The UI at `uv`, averaged over the pixel's footprint (`dx`, `dy`: how far
/// `uv` moves across one pixel): a grid of taps, one per texel and a half
/// the pixel covers. Up close that is the one tap.
// ponytail: 6 × 6 taps hold up to a pixel ~9 texels wide; mips on the
// surface texture (in the surface crate) if a hologram is ever read from
// farther than this room is long.
fn sample_ui(uv: vec2<f32>, dx: vec2<f32>, dy: vec2<f32>) -> vec4<f32> {
    let size = vec2<f32>(textureDimensions(ui));
    let nx = clamp(ceil(length(dx * size) / 1.5), 1.0, 6.0);
    let ny = clamp(ceil(length(dy * size) / 1.5), 1.0, 6.0);
    var sum = vec4<f32>(0.0);
    for (var i = 0.0; i < nx; i += 1.0) {
        for (var j = 0.0; j < ny; j += 1.0) {
            let at = uv + dx * ((i + 0.5) / nx - 0.5) + dy * ((j + 0.5) / ny - 0.5);
            sum += textureSampleLevel(ui, ui_sampler, at, 0.0);
        }
    }
    return sum / (nx * ny);
}

@fragment
fn fragment(in: VertexOutput, @builtin(front_facing) front: bool) -> @location(0) vec4<f32> {
    let presence = look.x;
    let t = globals.time;
    var uv = in.uv;
    if !front {
        uv.x = 1.0 - uv.x;
    }

    // The line, then the opening.
    let grow = smoothstep(0.0, 0.35, presence);
    let open = smoothstep(0.3, 1.0, presence);
    let dx = abs(uv.x - 0.5);
    let dy = abs(uv.y - 0.5);
    let half_h = max(open * 0.5, 0.5 / shape.y);
    let in_x = step(dx, grow * 0.5);
    let inside = in_x * step(dy, half_h);
    // Squeezed into the opening band, the image unfolds rather than being
    // uncovered.
    let suv = vec2<f32>(uv.x, 0.5 + (uv.y - 0.5) * 0.5 / half_h);
    var c = sample_ui(suv, dpdx(suv), dpdy(suv));

    // The forming edge: a bright seam riding the opening's top and bottom
    // (2 px wide), fading out as the image settles.
    let seam = in_x * (1.0 - smoothstep(0.0, 2.0 / shape.y, abs(dy - half_h))) * (1.0 - open);

    // Scanlines, drifting down; gone (at their mean) where a pixel covers
    // half a line or more.
    let row = uv.y * shape.y - t * 9.0;
    let fine = 1.0 - smoothstep(0.75, 1.5, fwidth(uv.y * shape.y));
    let scan = 1.0 - shape.z * (0.5 + 0.5 * sin(row * 2.0944) * fine);

    // Shimmer, the odd dropped frame, and a stutter while forming.
    let frame = floor(t * 24.0);
    let n = hash(vec2<f32>(frame, look.z));
    let shimmer = 1.0 - look.w * (0.5 + 0.5 * sin(t * 7.3 + look.z * 3.1));
    let drop = select(1.0, 0.55, n < 0.02);
    let stutter = mix(select(1.0, 0.35, n < 0.45), 1.0, open);
    // A dead panel: grey, and too dim to bloom.
    let power = shape.w;
    let grey = dot(c.rgb, vec3<f32>(0.299, 0.587, 0.114));
    c = vec4<f32>(mix(vec3<f32>(grey * 0.6), c.rgb, power), c.a);
    var gain = mix(0.5, look.y, power) * scan * shimmer * drop * stutter;
    if !front {
        gain *= 0.45;
    }

    // The pointer: a ring of 9 logical px around a dot.
    let reach = length((uv - cursor.xy) * shape.xy);
    let ring = (1.0 - smoothstep(0.9, 2.2, abs(reach - 9.0))) + (1.0 - smoothstep(1.4, 2.6, reach));
    let reticle = min(ring, 1.0) * cursor.z * inside;

    c = vec4<f32>(c.rgb * gain, c.a) * inside;
    let light = vec3<f32>(0.55, 0.92, 1.0) * seam * 3.0 + vec3<f32>(0.9, 1.0, 1.0) * reticle * 2.4;
    let out = vec4<f32>(c.rgb + light, max(c.a, reticle));
    if out.a < 0.002 && max(out.r, max(out.g, out.b)) < 0.002 {
        discard;
    }
    return out;
}
