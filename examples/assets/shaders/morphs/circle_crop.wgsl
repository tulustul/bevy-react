// Morph `circleCrop` (see `examples/demos/filters.rs`): a screen-circular
// crop shrinks the old image to nothing, passes through a full-`color`
// frame at the midpoint, then grows revealing the new image.
//
// Port of gl-transitions CircleCrop.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/CircleCrop.glsl
//   Author: fkuteken (ported by gre) — License: MIT
//
// Params (declaration-order packing of `CircleCrop`):
//   params[0]  color  backdrop, straight linear RGBA (a `FilterColor`)
//
// PREMULTIPLY: the color param arrives straight — premultiplied before
// mixing with the (premultiplied) image samples. The default `color` is
// TRANSPARENT (deviation: the upstream letterboxes on opaque black), so the
// crop irises through nothing — the subtree simply vanishes into the page
// behind it at the midpoint. On tall layers the upstream circle can miss the
// corners even at the endpoints; the endpoint guards keep the freeze/settle
// frames exact (identity contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    premultiply,
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

    let bg = premultiply(uniforms.params[0]);

    // Aspect correction (upstream `ratio2`): the circle is round on screen.
    let ratio = uniforms.resolution.x / uniforms.resolution.y;
    let aspect = vec2<f32>(1.0, 1.0 / ratio);
    let s = pow(2.0 * abs(progress - 0.5), 3.0);

    let dist = length((in.uv - 0.5) * aspect);
    // Uniform branch (depends only on progress), like the upstream comment
    // notes.
    var image = morph_sample_from(in.uv);
    if progress >= 0.5 {
        image = morph_sample_to(in.uv);
    }
    return mix(image, bg, step(s, dist));
}
