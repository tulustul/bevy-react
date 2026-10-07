// Filter `glitch` (see `examples/cyberpunk/filters.rs`): the signal breaking
// up — horizontal slices torn sideways, the channels split apart, the odd
// band dropped or flashing. Re-rolled 14 times a second from `uniforms.time`
// with integer hashes (exact at any uptime). With `frequency` > 0 it only
// strikes in random quarter-second bursts, so an idle wordmark stays clean
// most of the time and React never has to animate anything.
//
// Params (declaration-order packing of `Glitch`):
//   params[0]  (intensity 0..1, frequency 0..1, split px, tear px)
//   params[1].x  seed
//
// PREMULTIPLY: a UV-distortion filter resamples the premultiplied capture
// directly; the channel split recombines r/g/b from three samples and takes
// the max alpha, which keeps every channel <= alpha. The tears move content
// into the capture's outset ring (`outset` on the params struct).

#import bevy_react::filter::{FullscreenVertexOutput, sample_source_lod, uniforms}

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
    let seed = u32(uniforms.params[1].x);
    let t = uniforms.time;
    var k = p.x;
    if p.y > 0.0 {
        let window = u32(t * 4.0);
        k = select(0.0, p.x * (0.4 + 0.6 * unit(seed ^ 0x51u, window)), unit(seed, window) < p.y);
    }
    if k <= 0.0 {
        return sample_source_lod(in.uv);
    }
    let res = uniforms.resolution;
    let step = u32(t * 14.0);

    // Bands of a random height; some tear sideways.
    let band_h = 4.0 + 26.0 * unit(seed + 3u, step);
    let band = u32(in.uv.y * res.y / band_h);
    let roll = unit(band * 7919u + seed, step);
    var shift = 0.0;
    if roll < 0.45 * k {
        shift = (unit(band, step ^ 0x9e37u) - 0.5) * 2.0 * p.w * k / res.x;
    }
    let uv = in.uv + vec2<f32>(shift, 0.0);
    let split = p.z * k / res.x;
    let cr = sample_source_lod(uv - vec2<f32>(split, 0.0));
    let cg = sample_source_lod(uv);
    let cb = sample_source_lod(uv + vec2<f32>(split, 0.0));
    var out = vec4<f32>(cr.r, cg.g, cb.b, max(cr.a, max(cg.a, cb.a)));

    // A few bands drop out, a few flash brighter.
    let fx = unit(band ^ 0xabcdu, step);
    if fx < 0.06 * k {
        out = out * 0.15;
    } else if fx > 1.0 - 0.05 * k {
        out = vec4<f32>(min(out.rgb * 1.8, vec3<f32>(out.a)), out.a);
    }
    return out;
}
