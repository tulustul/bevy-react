// Morph `lightSweep` (see `examples/demos/filters.rs`): the gallery's page
// switch. A soft edge travels across the box, the new image in its wake, and
// a band of light rides the edge — brightening the content it passes over,
// and drawn as a faint beam where the box is empty.
//
// Params (declaration-order packing of `LightSweep`):
//   params[0].x  angle      travel direction in RADIANS (an `Angle`: wire
//                           degrees; 0 = toward the top, clockwise)
//   params[0].y  softness   reveal-edge width, fraction of the travel
//   params[0].z  band       light-band width, fraction of the travel
//   params[0].w  intensity  peak light in the band
//   params[1]    color      the light, straight linear RGBA
//
// PREMULTIPLY: from/to blend by a scalar (a direct lerp of premultiplied
// colors). The light is added premultiplied: over content it scales with the
// content's alpha; over empty pixels it is its own faint beam composited
// under them. Endpoint guards return the exact from/to samples (identity
// contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

// The beam's opacity over empty pixels, relative to its light on content.
const BEAM: f32 = 0.22;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }

    let angle = uniforms.params[0].x;
    let soft = max(uniforms.params[0].y, 1e-4);
    let band = max(uniforms.params[0].z, 1e-4);
    let intensity = uniforms.params[0].w;
    let light = uniforms.params[1];

    // Position along the travel, 0 (where the sweep starts) ..= 1 (where it
    // leaves), measured in aspect-true space so a diagonal stays diagonal.
    let dir = vec2<f32>(sin(angle), -cos(angle));
    let aspect = uniforms.resolution.x / max(uniforms.resolution.y, 1.0);
    let q = (in.uv - 0.5) * vec2<f32>(aspect, 1.0);
    let half_extent = 0.5 * (abs(dir.x) * aspect + abs(dir.y));
    let t = dot(q, dir) / (2.0 * half_extent) + 0.5;

    // The front enters fully before the box and leaves fully past it.
    let front = mix(-soft, 1.0 + soft, progress);
    let reveal = 1.0 - smoothstep(front - soft, front + soft, t);
    var out = mix(morph_sample_from(in.uv), morph_sample_to(in.uv), reveal);

    let x = (t - front) / band;
    let glow = intensity * exp(-x * x);
    out = vec4<f32>(out.rgb + light.rgb * glow * out.a, out.a);
    let beam = glow * BEAM * light.a;
    out = out + vec4<f32>(light.rgb * beam, beam) * (1.0 - out.a);
    return vec4<f32>(min(out.rgb, vec3<f32>(out.a)), out.a);
}
