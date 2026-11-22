// Filter `holoNoise` (see `examples/coldwake/filters.rs`): the projector's
// imperfection over a whole hologram. Fine grain over whatever is lit, an
// interference band rolling slowly down, and now and then a row knocked a
// few px sideways. Time-driven, re-rolled 20 times a second with integer
// hashes.
//
// Params (declaration-order packing of `HoloNoise`):
//   params[0]  (amount 0..1, band 0..1, jitter px, seed)
//
// PREMULTIPLY: the row shift resamples the premultiplied capture directly;
// grain and band scale rgb within [0, alpha] (min with alpha), so every
// output stays a valid premultiplied color.

import bevy_react::filter::{FullscreenVertexOutput, sample_source_lod, uniforms};

fn pcg(v: u32) -> u32 {
    let state = v * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

fn unit(a: u32, b: u32) -> f32 {
    return f32(pcg(a ^ pcg(b))) / 4294967296.0;
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let p = uniforms.params[0];
    let seed = u32(p.w);
    let res = uniforms.resolution;
    let t = uniforms.time;
    let step = u32(t * 20.0);
    let px = vec2<u32>(in.uv * res);

    // A row (3 px tall) is knocked sideways in a few frames out of a hundred.
    let row = px.y / 3u;
    var shift = 0.0;
    if unit(row * 7919u + seed, step) < 0.004 {
        shift = (unit(row ^ 0x5bd1u, step) - 0.5) * 2.0 * p.z / res.x;
    }
    var c = sample_source_lod(in.uv + vec2<f32>(shift, 0.0));

    // Grain: brighten or darken the lit pixels a little.
    let g = unit(px.x + px.y * 4099u + seed, step) - 0.5;
    var k = 1.0 + g * p.x;

    // The band: a soft bright stripe a fifth of the height, rolling down
    // every six seconds.
    let y = fract(in.uv.y - t / 6.0 + f32(seed) * 0.37);
    k += p.y * 0.35 * (1.0 - smoothstep(0.0, 0.2, abs(y - 0.5)));

    return vec4<f32>(min(c.rgb * k, vec3<f32>(c.a)), c.a);
}
