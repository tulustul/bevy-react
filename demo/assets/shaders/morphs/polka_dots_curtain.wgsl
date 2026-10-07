// Morph `polkaDotsCurtain` (see `examples/demos/filters.rs`): a curtain of
// growing polka dots radiating from `center` — dots nearer the center reach
// full size sooner.
//
// Port of gl-transitions PolkaDotsCurtain.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/PolkaDotsCurtain.glsl
//   Author: bobylito — License: MIT
//
// Params (declaration-order packing of `PolkaDotsCurtain`):
//   params[0].x   dots    dot-grid frequency (cells across the box)
//   params[0].yz  center  radiation origin, in uv space (0..1)
//
// PREMULTIPLY: same-uv samples selected by a hard mask — no blending math at
// all, both branches are valid premultiplied texels. The upstream's strict
// `<` can leave "from" speckles at the far corner at progress 1; the endpoint
// guards make the settle frame exact (identity contract). The division by
// the distance to `center` reaches +inf AT the center texel — benign (the
// comparison is simply true there, matching upstream).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }

    let dots = uniforms.params[0].x;
    let center = uniforms.params[0].yz;

    let next_image =
        distance(fract(in.uv * dots), vec2<f32>(0.5, 0.5)) < progress / distance(in.uv, center);
    return select(morph_sample_from(in.uv), morph_sample_to(in.uv), next_image);
}
