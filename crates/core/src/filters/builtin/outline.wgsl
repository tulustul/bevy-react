// outline: paint a colored ring around the content's alpha silhouette,
// UNDER the content (`outline.rs`).
//
// Params map (packed by `OutlineParams::pack`; Length slots arrive rewritten
// to physical px):
//   params[0] = (width_px, softness_px, 0, 0)
//   params[1] = outline color, linear straight-alpha RGBA
//
// Alpha-max dilation over concentric rings: for each ring distance `d` the
// coverage contribution is `tap_alpha * falloff(d)`, where `falloff` is 1
// inside `width` and ramps to 0 over `max(softness, 1)` px beyond it — a
// crisp outline gets a 1px antialiasing skirt, softness > 0 reads as a glow.
// Sixteen fixed directions per ring, with a half-step angular offset on odd
// rings to break ring-to-ring aliasing. Quality bound (the blur MAX_HALF
// convention): rings are capped at 12, so a reach (width + softness) up to
// ~12 physical px keeps ring spacing <= 1px and stays crisp; beyond that the
// rings spread and the 16-direction gap starts rounding sharp corners.
//
// PREMULTIPLY: the dilation resamples ALPHA only (interpolation-safe on its
// own — no unpremultiply anywhere), and the composite is a premultiplied
// source-over: src + outline_pm * (1 - src.a).

#import bevy_react::filter::{FullscreenVertexOutput, source_sampler, source_texture, uniforms}

const DIRECTION_COUNT: i32 = 16;
const MAX_RINGS: i32 = 12;
const TAU: f32 = 6.28318530718;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let width = uniforms.params[0].x;
    let softness = uniforms.params[0].y;
    let color = uniforms.params[1];
    let src = textureSample(source_texture, source_sampler, in.uv);
    if (width <= 0.0 && softness <= 0.0) || color.a <= 0.0 {
        // Exact identity — the transition-padding contract (`width: 0`).
        return src;
    }

    let skirt = max(softness, 1.0);
    let reach = width + skirt;
    let ring_count = clamp(i32(ceil(reach)), 1, MAX_RINGS);
    let spacing = reach / f32(ring_count);

    var cov = src.a;
    for (var ring = 1; ring <= ring_count; ring = ring + 1) {
        let d = f32(ring) * spacing;
        let falloff = 1.0 - smoothstep(width, width + skirt, d);
        if falloff <= 0.0 {
            continue;
        }
        let phase = select(0.0, 0.5, (ring & 1) == 1) * TAU / f32(DIRECTION_COUNT);
        for (var i = 0; i < DIRECTION_COUNT; i = i + 1) {
            let ang = phase + TAU * f32(i) / f32(DIRECTION_COUNT);
            let offset = vec2<f32>(cos(ang), sin(ang)) * d * uniforms.texel_size;
            // Explicit LOD: `textureSample` needs uniform control flow and
            // the `continue` above breaks it; LOD 0 is exact for 1:1 passes.
            let tap = textureSampleLevel(source_texture, source_sampler, in.uv + offset, 0.0);
            cov = max(cov, tap.a * falloff);
        }
    }

    // Premultiplied source-over: the outline sits under the content.
    let outline_pm = vec4<f32>(color.rgb * color.a, color.a) * cov;
    return src + outline_pm * (1.0 - src.a);
}
