// The bounce ripple for the bouncing-ball scene (see
// `examples/demos/scenes/bouncing_ball.rs`): a soft ring painted on the glass
// wall the ball just hit. The quad is scaled up over the ripple's life by the
// Rust side, so this shader only has to shape the ring and fade it out.
//
// Uniform packing (one combined binding — both material fields share
// `#[uniform(0)]`):
//   color        the ring's tint (the ball's warm yellow)
//   params.x     progress, 0 at impact → 1 at the end of the ripple's life
//   params.y     peak emissive strength (HDR, feeds the camera's bloom)
//   params.z/w   unused
//
// BLENDING: the material is `AlphaMode::Add`, which Bevy maps to premultiplied
// blending (`src.rgb + dst.rgb * (1 - src.a)`). Returning alpha 0 therefore
// makes the ring purely additive — it only ever adds light, so overlapping
// ripples and the translucent glass box never need sorting to look right.

#import bevy_pbr::forward_io::VertexOutput

struct Ripple {
    color: vec4<f32>,
    params: vec4<f32>,
};

@group(#{MATERIAL_BIND_GROUP}) @binding(0)
var<uniform> ripple: Ripple;

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let t = ripple.params.x;

    // 0 at the quad's center, 1 on its inscribed circle (up to 1.41 in the
    // corners — the band below is already 0 out there, so they stay dark).
    let r = length(in.uv - vec2<f32>(0.5)) * 2.0;

    // The annulus is anchored to the rim and thins as the quad scales up: a fat
    // core at the moment of impact, a soft band as it dies. It never narrows to
    // a hairline — a wide, low band reads as a gentle wash rather than a rim.
    let half_width = mix(0.5, 0.2, t);
    let center = 1.0 - half_width;
    // `smoothstep` alone (no squaring) keeps the profile a broad, flat-topped
    // bell instead of a bright core with a thin skirt.
    let shape = 1.0 - smoothstep(0.0, half_width, abs(r - center));

    // Ease in over the first fifth of the life so the ripple swells into view
    // instead of popping at full brightness, then fall away cubically.
    let rise = smoothstep(0.0, 0.2, t);
    let decay = (1.0 - t) * (1.0 - t) * (1.0 - t);
    let fade = rise * decay;

    return vec4<f32>(ripple.color.rgb * ripple.params.y * shape * fade, 0.0);
}
