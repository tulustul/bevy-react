// Filter `gamma` (see `examples/cyberpunk/settings.rs`): the gamma screen's
// test image through the setting's curve, `rgb^(1/value)` — the curve the
// camera's `ColorGrading` puts on the world. Above 1 the darks lift (the
// faint slice of the mark shows), below 1 they sink.
//
// Params (declaration-order packing of `Gamma`):
//   params[0].x  value (1 = unchanged)
//
// PREMULTIPLY: a color op — unpremultiply, curve, premultiply.

#import bevy_react::filter::{FullscreenVertexOutput, premultiply, sample_source, uniforms, unpremultiply}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let c = unpremultiply(sample_source(in.uv));
    let value = max(uniforms.params[0].x, 0.01);
    return premultiply(vec4<f32>(pow(c.rgb, vec3<f32>(1.0 / value)), c.a));
}
