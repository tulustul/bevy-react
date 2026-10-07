// Custom filter `holo` (see `examples/arcana/filters.rs`): holographic foil
// over a whole card — a React subtree's captured pixels.
//
//   * Sheen: a broad band of light lies across the card and slides with
//     `angle` (bound to the card's tilt) — inside it the foil blooms into
//     pastel rainbow, outside it only a faint iridescence remains, so the
//     card reads as one surface catching the light, not as stripes.
//   * Rainbow: hue runs along the card's diagonal, offset by tilt and by
//     `drift` over time (the prismatic shimmer of legendaries).
//   * Response: strongest on the card's mid-to-bright pixels (frame, art,
//     lettering), screened in, so colors lift rather than wash out.
//   * Glitter: sparse points, each twinkling on its own clock, brightest in
//     the sheen.
//   * Glint: a narrow specular line riding the center of the sheen.
//
// Params (declaration-order packing of `Holo`):
//   params[0].x  angle       degrees
//   params[0].y  strength    0..1
//   params[0].z  saturation  0..1
//   params[0].w  glitter     0..1
//   params[1].x  drift       bands per second
//
// PREMULTIPLY: a color op — unpremultiply, work on straight rgb, premultiply
// back with the sample's own alpha (transparent texels stay transparent, so
// the foil never paints outside the card's rounded corners).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    content_rect_size,
    content_uv,
    premultiply,
    sample_source,
    uniforms,
    unpremultiply,
}

fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn rainbow(h: f32) -> vec3<f32> {
    return clamp(abs(fract(h + vec3<f32>(0.0, 0.6667, 0.3333)) * 6.0 - 3.0) - 1.0, vec3<f32>(0.0), vec3<f32>(1.0));
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let angle = uniforms.params[0].x;
    let strength = uniforms.params[0].y;
    let saturation = uniforms.params[0].z;
    let glitter_amount = uniforms.params[0].w;
    let drift = uniforms.params[1].x;
    let t = uniforms.time;

    let texel = sample_source(in.uv);
    if texel.a <= 0.0 || strength <= 0.0 {
        return texel;
    }
    let s = unpremultiply(texel);
    let cu = content_uv(in.uv);

    // Distance along the light's diagonal, and where the sheen lies on it.
    let slide = angle / 45.0;
    let d = dot(cu - 0.5, vec2<f32>(0.8, 0.6));
    let at = slide * 0.45 + 0.08 * sin(t * 0.5);
    let off = d - at;
    let sheen = exp(-off * off * 9.0);
    let coverage = 0.18 + 0.82 * sheen;

    let pastel = mix(rainbow(d * 2.4 + slide * 0.4 + t * drift), vec3<f32>(1.0), 0.28);
    let band = mix(vec3<f32>(1.0, 0.93, 0.78), pastel, saturation);

    let lum = dot(s.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));
    let response = 0.25 + 0.75 * smoothstep(0.05, 0.6, lum);
    let foil = strength * response * coverage;
    var rgb = 1.0 - (1.0 - s.rgb) * (1.0 - band * foil * 0.6);

    // Glitter: sparse candidates on a 3 px grid.
    let px = cu * content_rect_size();
    let cell = floor(px / 3.0);
    let h = hash12(cell);
    let twinkle = pow(max(sin(t * (1.2 + 2.8 * h) + h * 40.0 + slide * 2.0), 0.0), 16.0);
    let sparkle = select(0.0, twinkle, h > 0.965) * glitter_amount * strength * (0.35 + 0.65 * sheen);
    rgb += mix(vec3<f32>(1.0), band, 0.5) * sparkle;

    // The glint riding the middle of the sheen.
    rgb += vec3<f32>(1.0, 0.97, 0.9) * exp(-off * off * 140.0) * strength * 0.18;

    return premultiply(vec4<f32>(rgb, s.a));
}
