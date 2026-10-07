// Custom filter `burn` (see `examples/arcana/filters.rs`): the pack wrapper
// burning open from the cut along its top edge. Texels behind the front are
// gone; a charred band trails a hot ember line that eats down the wrapper on
// a noisy front. Params-only: the pass re-runs when `progress` changes.
//
// Params (declaration-order packing of `Burn`):
//   params[0].x  progress  0 = intact, 1 = burnt away
//
// PREMULTIPLY: burnt texels return transparent black; the char scales the
// premultiplied sample down (still valid); the ember adds onto rgb and is
// clamped to the texel's alpha, so it never glows outside the wrapper.

#import bevy_react::filter::{
    FullscreenVertexOutput,
    content_rect_size,
    content_uv,
    sample_source,
    uniforms,
}

fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn vnoise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash12(i), hash12(i + vec2<f32>(1.0, 0.0)), u.x),
        mix(hash12(i + vec2<f32>(0.0, 1.0)), hash12(i + vec2<f32>(1.0, 1.0)), u.x),
        u.y,
    );
}

const EDGE: f32 = 0.06;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = uniforms.params[0].x;
    let texel = sample_source(in.uv);
    if progress <= 0.0 || texel.a <= 0.0 {
        return texel;
    }
    let cu = content_uv(in.uv);
    let px = cu * content_rect_size();
    let n = 0.6 * vnoise(px / 34.0) + 0.3 * vnoise(px / 13.0) + 0.1 * vnoise(px / 5.0);
    // From the cut at the top, downward, on a ragged front.
    let field = cu.y * 0.6 + n * 0.4;
    let threshold = progress * (1.0 + 3.0 * EDGE) - EDGE;
    let ahead = field - threshold;
    if ahead < 0.0 {
        return vec4<f32>(0.0);
    }
    let front = 1.0 - smoothstep(0.0, EDGE, ahead);
    let char_band = 1.0 - smoothstep(0.0, EDGE * 3.0, ahead);
    var rgb = texel.rgb * (1.0 - 0.75 * char_band);
    let hot = mix(vec3<f32>(1.0, 0.22, 0.02), vec3<f32>(1.0, 0.86, 0.45), front * front);
    rgb += hot * front * texel.a * 1.8;
    return vec4<f32>(min(rgb, vec3<f32>(texel.a)), texel.a);
}
