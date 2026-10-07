// A data panel of the datascape (see `examples/cyberpunk/datascape.rs`):
// dot-matrix "text" — blocks of lines of 5×7 glyphs, scrolling up like a log,
// a few glyphs re-rolling now and then, a bright line where the cursor is.
// Fully procedural (integer PCG hashes, no textures); far dots fade to their
// average so distance never shimmers. Unlit: glyphs are emissive above 1.0
// and bloom, the panel fades into the fog color with distance.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}

// Glyph color (linear, HDR: rgb > 1 blooms).
@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> ink: vec4<f32>;
// Panel color (linear).
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var<uniform> paper: vec4<f32>;
// x: characters across, y: lines down, z: scroll (lines per second), w: seed.
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var<uniform> grid: vec4<f32>;
// rgb: fog color (linear), a: fog distance (fully fogged).
@group(#{MATERIAL_BIND_GROUP}) @binding(3) var<uniform> fog: vec4<f32>;

// Characters per block (then a gutter), dots per character cell.
const BLOCK: u32 = 16u;
const GUTTER: u32 = 4u;
const DOTS: vec2<f32> = vec2<f32>(6.0, 9.0);

fn pcg(v: u32) -> u32 {
    let state = v * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

fn hash(a: u32, b: u32) -> u32 {
    return pcg(a ^ pcg(b));
}

fn unit(a: u32, b: u32) -> f32 {
    return f32(hash(a, b)) / 4294967296.0;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let seed = u32(grid.w);
    let t = globals.time;
    let p = vec2<f32>(in.uv.x * grid.x, in.uv.y * grid.y + t * grid.z);
    let cell = vec2<i32>(floor(p));
    let col = u32(cell.x);
    let line = u32(cell.y + 1000000);
    let block = col / (BLOCK + GUTTER);
    let at = col % (BLOCK + GUTTER);

    // Is there a glyph in this cell? Lines of random length, the odd blank
    // paragraph, gutters between blocks.
    let r = unit(seed + block * 131u, line);
    let len = u32(r * r * f32(BLOCK + 1u));
    let blank = unit(seed + 977u + block, line / 4u) < 0.45;
    // Whole blocks run brighter or dimmer.
    let block_lum = 0.15 + 0.85 * pow(unit(seed + block * 17u, 4242u), 2.0);
    let has_glyph = at < len && !blank;

    // The glyph's dots: a 5×7 bitmap inside a 6×9 cell, re-rolled every few
    // seconds for a few glyphs.
    let dot_p = fract(p) * DOTS;
    let dot = vec2<u32>(floor(dot_p));
    let in_bitmap = dot.x < 5u && dot.y >= 1u && dot.y < 8u;
    let epoch = u32(t * 0.7 + unit(col, line) * 40.0);
    let glyph = hash(hash(col + seed, line), select(0u, epoch, unit(col ^ 77u, line) < 0.08));
    let on = unit(glyph, dot.y * 8u + dot.x) < 0.45;
    let round_dot = smoothstep(0.42, 0.22, length(fract(dot_p) - 0.5));
    var lit = select(0.0, round_dot, has_glyph && in_bitmap && on);

    // Far away, a dot is smaller than a pixel: fade to the average coverage.
    let footprint = max(fwidth(dot_p.x), fwidth(dot_p.y));
    let average = select(0.0, 0.12, has_glyph);
    lit = mix(lit, average, smoothstep(0.35, 0.9, footprint));

    // A bright "cursor" line drifting down each block, and dim block frames.
    let cursor_line = u32(t * 1.3 + f32(block) * 7.0) % u32(grid.y + 12.0);
    let hot = select(1.0, 2.6, u32(cell.y) % u32(grid.y + 12.0) == cursor_line);
    let edge = select(0.0, 0.1, at == BLOCK + 1u && fract(dot_p.x) < 0.25);

    let color = paper.rgb + ink.rgb * (lit * hot * block_lum + edge);
    // Distance fog (the panels are unlit, so they fog themselves).
    let d = distance(in.world_position.xyz, view.world_position);
    let f = clamp(d / fog.a, 0.0, 1.0);
    return vec4<f32>(mix(color, fog.rgb, f * f), 1.0);
}
