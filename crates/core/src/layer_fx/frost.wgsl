// Built-in "frost" effect: frosted glass over the BACKDROP (the 3D world
// behind the UI — see `layer/backdrop.rs`), with the layer's own subtree
// composited on top. USER-FRAGMENT-ONLY source: the common contract
// (bindings, `backdrop_uv`/`sample_backdrop`/`sample_backdrop_blurred`,
// `u_group_alpha`) and the generated accessors (`u_blur`, `u_tint`,
// `u_saturation`) are prepended at registration.
//
// Uniform semantics:
// - `blur` is FROSTINESS, not a pixel radius: the mix factor between the
//   sharp backdrop (0) and the chain's fixed-strength blurred backdrop (1).
// - `tint` composites a straight-alpha wash over the frosted backdrop
//   (`tint.a` = wash strength).
// - `saturation` is a cheap luminance-mix boost (1 = untouched); frosted
//   glass pops slightly at ~1.1.
//
// V1 SEMANTIC (documented): the backdrop holds the WORLD only — sibling UI
// drawn behind the panel is not frosted.

@fragment
fn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {
    let uv = backdrop_uv(in.position);
    let sharp = sample_backdrop(uv);
    let blurred = sample_backdrop_blurred(uv);

    // Frostiness: sharp <-> blurred. The backdrop is treated as OPAQUE
    // (alpha forced to 1 below), so `frosted` is premultiplied by
    // construction.
    var rgb = mix(sharp.rgb, blurred.rgb, clamp(u_blur(), 0.0, 1.0));

    // Saturation: luminance mix (Rec. 709 weights on the linear values).
    let luma = dot(rgb, vec3<f32>(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3<f32>(luma), rgb, u_saturation());

    // Tint: a straight-alpha wash over the frosted backdrop.
    let tint = u_tint();
    rgb = mix(rgb, tint.rgb, clamp(tint.a, 0.0, 1.0));
    let frosted = vec4<f32>(rgb, 1.0);

    // The layer's own subtree ON TOP — premultiplied over (the layer texture
    // is effectively premultiplied, see the contract note), then the group
    // alpha fades the WHOLE result (all channels — premultiplied semantics).
    let subtree = textureSample(layer_tex, layer_smp, in.uv);
    return (subtree + frosted * (1.0 - subtree.a)) * u_group_alpha();
}
