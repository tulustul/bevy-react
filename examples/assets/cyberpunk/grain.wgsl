// Filter `grain` (see `examples/cyberpunk/filters.rs`): film grain. The node
// it sits on is empty (a transparent capture); the pass ignores it and
// writes fresh noise 24 times a second — light grains as white, dark grains
// as black, each at `amount` of its strength, over whatever lies beneath.
//
// Params (declaration-order packing of `Grain`):
//   params[0].x  amount 0..1
//
// PREMULTIPLY: white (a, a, a, a) and black (0, 0, 0, a) are both valid
// premultiplied colors.

#import bevy_react::filter::{FullscreenVertexOutput, uniforms}

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
    let px = vec2<u32>(in.position.xy);
    let step = u32(uniforms.time * 24.0);
    // Two uniform hashes summed: a triangular distribution in -1..1, so most
    // grains are faint and a few are strong.
    let n = unit(px.x + px.y * 4099u, step) + unit(px.x * 13u + 7u, px.y ^ (step * 31u)) - 1.0;
    let a = abs(n) * uniforms.params[0].x;
    return select(vec4<f32>(0.0, 0.0, 0.0, a), vec4<f32>(a), n > 0.0);
}
