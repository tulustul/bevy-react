// Linear wipe morph (`builtin/morph.rs::LinearWipeParams`): the "to" image
// sweeps in along a direction, with an eased softness band around the wipe
// edge. Packing:
//
//   params[0] = (angle_radians, softness_px, 0, 0)
//
// The angle is radians, clockwise from +X in screen space (y down) — 0 wipes
// left-to-right, 90deg top-to-bottom. Softness arrives in physical px (the
// resolver rewrites the logical `Length` slot). The sweep is extended by the
// softness band at both ends, so progress 0 shows only the "from" image and
// progress 1 EXACTLY the "to" sample (the identity contract in
// `filter_prelude.wgsl` — the settle frame must be pixel-equal to no pass).
//
// Per the prelude's premultiplied contract the band blend lerps the two
// premultiplied samples directly.
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let angle = uniforms.params[0].x;
    let softness = uniforms.params[0].y;
    let dir = vec2<f32>(cos(angle), sin(angle));

    // Sweep coordinate in px, normalized over the target rect's projection
    // onto the wipe direction (corner extrema: each axis contributes its
    // signed extent when the direction component is positive/negative).
    let extent = uniforms.resolution * dir;
    let sweep_min = min(0.0, extent.x) + min(0.0, extent.y);
    let sweep_max = max(0.0, extent.x) + max(0.0, extent.y);
    let sweep_len = max(sweep_max - sweep_min, 1e-6);
    let c = (dot(in.uv * uniforms.resolution, dir) - sweep_min) / sweep_len;

    // Half-band in normalized sweep units; the edge travels from -h to 1+h so
    // the band fully clears both ends at the progress extremes.
    let h = softness / sweep_len;
    let edge = mix(-h, 1.0 + h, morph_progress());
    // Manual smoothstep with a guarded denominator: softness 0 degrades to a
    // hard step instead of a 0/0 (smoothstep is UB when edge0 == edge1).
    let x = clamp((c - (edge - h)) / max(2.0 * h, 1e-6), 0.0, 1.0);
    let to_side = 1.0 - x * x * (3.0 - 2.0 * x);

    return mix(morph_sample_from(in.uv), morph_sample_to(in.uv), to_side);
}
