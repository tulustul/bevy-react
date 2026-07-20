// Built-in "chromaticAberration" effect: per-channel UV offset sampling of the
// layer texture. `strength` is the offset in UV units (0 = identity);
// `direction` is the offset axis (red shifts along it, blue against it).
//
// USER FRAGMENT ONLY: the registry prepends the common contract (bindings,
// `u_group_alpha()`) and the generated `u_strength()` / `u_direction()`
// accessors (see `layer.rs`).

@fragment
fn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {
    let offset = u_direction() * u_strength();
    let r = textureSample(layer_tex, layer_smp, in.uv + offset);
    let g = textureSample(layer_tex, layer_smp, in.uv);
    let b = textureSample(layer_tex, layer_smp, in.uv - offset);
    // The three samples are premultiplied with their OWN coverage; averaging
    // the alphas keeps the split fringes translucent instead of punching the
    // green sample's silhouette through — an approximation, since exact
    // per-channel coverage isn't expressible in a single blend. Group alpha
    // scales all channels (premultiplied semantics).
    let alpha = (r.a + g.a + b.a) / 3.0;
    return vec4<f32>(r.r, g.g, b.b, alpha) * u_group_alpha();
}
