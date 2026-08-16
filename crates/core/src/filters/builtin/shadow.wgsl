// Shadow's two non-blur passes (`builtin/shadow.rs::ShadowParams` resolves to
// silhouette-prep → blur H → blur V → combine; the middle two are literally
// `blur.wgsl` — spread rides in blur's radius slot). Mode-switched on
// `params[0].w` — pass-internal, the same precedent as blur's direction and
// bloom's bright/combine. Packing (Length slots arrive physical px):
//
//   params[0] = (spread_px, 0, 0, mode)   mode 0 = prep, 1 = combine
//   params[1] = (offset_x_px, offset_y_px, 0, 0)
//   params[2] = shadow color, linear straight-alpha RGBA
//
// Premultiplied-alpha decisions (contract in `filter_prelude.wgsl`):
// - PREP samples the source's ALPHA at `uv - offset` (shifting the shadow BY
//   +offset — y down, so positive offsets read right/down like CSS) and
//   emits the tinted silhouette already premultiplied:
//   `(color.rgb * color.a, color.a) * silhouette_alpha`. That feeds the blur,
//   which requires premultiplied color anyway.
// - COMBINE is a premultiplied source-over: `capture_texture` (the original
//   content) OVER `source_texture` (the blurred shadow). In the outset region
//   the capture's alpha is 0 and the shadow supplies its own alpha; a fully
//   transparent shadow color returns the capture exactly (the identity
//   contract, `color: "transparent"`).
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    capture_texture,
    source_sampler,
    source_texture,
    uniforms,
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    if uniforms.params[0].w < 0.5 {
        // PREP: offset + tint the alpha silhouette.
        let offset = uniforms.params[1].xy * uniforms.texel_size;
        let silhouette = textureSample(source_texture, source_sampler, in.uv - offset).a;
        let color = uniforms.params[2];
        return vec4<f32>(color.rgb * color.a, color.a) * silhouette;
    }
    // COMBINE: original content over the blurred shadow.
    let content = textureSample(capture_texture, source_sampler, in.uv);
    let shadow = textureSample(source_texture, source_sampler, in.uv);
    return content + shadow * (1.0 - content.a);
}
