// Custom filter `pinch` (see `examples/demos/filters.rs`): a cursor-anchored
// radial pinch/bulge. Positive `strength` squeezes content toward the center
// point (edges pull in transparency from the outset ring — the silhouette
// visibly contracts); negative `strength` magnifies away from it (node
// content spills into the ring — the silhouette bulges out). All params are
// normalized, so the shader converts to physical px itself and the falloff
// stays circular on non-square nodes.
//
// Params (declaration-order packing of `Pinch`):
//   params[0].x  x         center, 0..1 across the node rect
//   params[0].y  y         center, 0..1 across the node rect
//   params[0].z  strength  -1 (bulge) ..= 1 (pinch), clamped here
//   params[0].w  radius    fraction of the node's larger dimension
//
// PREMULTIPLY: a UV-distortion filter only *resamples* the source at shifted
// positions. Linear filtering of straight-alpha color would bleed the hidden
// rgb of transparent texels at coverage edges, so per the contract in
// `filter_prelude.wgsl` we sample the premultiplied capture DIRECTLY and
// output the sample as-is — no unpremultiply/premultiply round trip.

#import bevy_react::filter::{FullscreenVertexOutput, content_rect_min, content_rect_size, source_sampler, source_texture, uniforms}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let center_norm = uniforms.params[0].xy;
    let strength = clamp(uniforms.params[0].z, -1.0, 1.0);
    let radius = uniforms.params[0].w;

    // Node rect in physical px (the capture is inflated by the outset ring;
    // the center anchors to the NODE, not the target).
    let size = content_rect_size();
    let center_px = content_rect_min() + center_norm * size;
    let radius_px = max(radius * max(size.x, size.y), 1e-3);

    let pos_px = in.uv * uniforms.resolution;
    let offset = pos_px - center_px;
    let dist = length(offset);

    // Radial sample-distance factor: 1 outside the radius (identity), eased
    // toward 1 + strength at the center. smoothstep's zero derivative at
    // t = 1 keeps the boundary crease-free; > 1 samples outward (content is
    // compressed toward the point = pinch), < 1 samples inward (magnified =
    // bulge).
    let t = clamp(dist / radius_px, 0.0, 1.0);
    let factor = 1.0 + strength * smoothstep(0.0, 1.0, 1.0 - t);

    let sample_px = center_px + offset * factor;
    return textureSample(source_texture, source_sampler, sample_px * uniforms.texel_size);
}
