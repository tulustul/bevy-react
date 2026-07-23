// Bloom's two non-blur passes (`builtin/bloom.rs::BloomParams` resolves to
// bright-pass → blur H → blur V → combine; the middle two are literally
// `blur.wgsl`). Mode-switched on `params[0].w` — pass-internal, the same
// precedent as blur's direction components. Packing:
//
//   params[0] = (radius_px, 0, 0, mode)   mode 0 = bright-pass, 1 = combine
//   params[1] = (threshold, intensity, 0, 0)
//
// Premultiplied-alpha decisions (contract in `filter_prelude.wgsl`):
// - BRIGHT thresholds PREMULTIPLIED luminance directly — coverage-weighted,
//   so translucent texels attenuate naturally, and the output feeds a blur,
//   which requires premultiplied color anyway. Scaling rgba uniformly keeps
//   chroma and hands the glow its own alpha.
// - COMBINE is a saturating add in premultiplied space: `source_texture` is
//   the blurred bright-pass, `capture_texture` the original capture. In the
//   outset region the capture's alpha is 0 and the glow supplies its own
//   alpha, extending light past the silhouette; the clamp keeps alpha <= 1
//   for the composite's One/OneMinusSrcAlpha blend.
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
    let threshold = uniforms.params[1].x;
    let intensity = uniforms.params[1].y;
    if uniforms.params[0].w < 0.5 {
        // BRIGHT: keep only the light above the threshold. Samples arrive
        // LINEAR (the capture is an sRGB/linear render target), where
        // bright-LOOKING UI colors sit surprisingly low — so the cut is on
        // PERCEPTUAL luminance (gamma 2.2 encode): threshold 0.7 blooms what
        // reads as bright, 1 blooms nothing, 0 blooms everything.
        let c = textureSample(source_texture, source_sampler, in.uv);
        let lum_linear = dot(c.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));
        let lum = pow(max(lum_linear, 0.0), 1.0 / 2.2);
        return c * (max(lum - threshold, 0.0) / max(lum, 1e-4));
    }
    // COMBINE: original + intensity × blurred bright-pass.
    let orig = textureSample(capture_texture, source_sampler, in.uv);
    let glow = textureSample(source_texture, source_sampler, in.uv);
    return clamp(orig + glow * intensity, vec4<f32>(0.0), vec4<f32>(1.0));
}
