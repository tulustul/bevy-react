// Dual-Kawase blur passes for the `<layer>` backdrop chain (see
// `layer/backdrop.rs`): `down_sample` runs the three descending legs
// (full → 1/2 → 1/4 → 1/8), `up_sample` the single ascending leg
// (1/8 → 1/4, the chain's quarter-res output). Both derive their half-pixel
// offsets from the SOURCE texture's own dimensions, so the whole chain needs
// no uniforms — one bind group of texture + linear sampler per pass.
//
// The tap patterns are the classic dual-Kawase kernels (Marius Bjørge,
// "Bandwidth-efficient rendering", SIGGRAPH 2015): bilinear taps between
// texel centers make each cheap 5/8-tap pass act like a much wider Gaussian
// once the resolution ladder is folded in. The blur strength is FIXED by the
// ladder depth — effects that want "less blur" mix toward the sharp capture
// instead (frost's `blur` uniform).

#import bevy_core_pipeline::fullscreen_vertex_shader::FullscreenVertexOutput

@group(0) @binding(0) var src_tex: texture_2d<f32>;
@group(0) @binding(1) var src_smp: sampler;

// Half a source texel in UV space — the offset unit of both kernels.
fn half_texel() -> vec2<f32> {
    return 0.5 / vec2<f32>(textureDimensions(src_tex));
}

@fragment
fn down_sample(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let o = half_texel() * 2.0; // one source texel = half a DEST texel
    var sum = textureSample(src_tex, src_smp, in.uv) * 4.0;
    sum += textureSample(src_tex, src_smp, in.uv - o);
    sum += textureSample(src_tex, src_smp, in.uv + o);
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(o.x, -o.y));
    sum += textureSample(src_tex, src_smp, in.uv - vec2<f32>(o.x, -o.y));
    return sum / 8.0;
}

@fragment
fn up_sample(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let o = half_texel();
    var sum = textureSample(src_tex, src_smp, in.uv + vec2<f32>(-o.x * 2.0, 0.0));
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(-o.x, o.y)) * 2.0;
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(0.0, o.y * 2.0));
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(o.x, o.y)) * 2.0;
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(o.x * 2.0, 0.0));
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(o.x, -o.y)) * 2.0;
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(0.0, -o.y * 2.0));
    sum += textureSample(src_tex, src_smp, in.uv + vec2<f32>(-o.x, -o.y)) * 2.0;
    return sum / 12.0;
}
