// Built-in "dissolve" effect: a procedural-noise alpha threshold over the
// composited subtree. `threshold` sweeps 0 (fully visible) → 1 (fully
// dissolved); `softness` widens the burn edge. Hash-based value noise — no
// noise texture binding needed.
//
// USER FRAGMENT ONLY: the registry prepends the common contract (bindings,
// `u_group_alpha()`) and the generated `u_threshold()` / `u_softness()`
// accessors (see `layer.rs`). The layer texture is premultiplied (the capture
// camera blends straight alpha over a transparent clear), so masking/fading
// scales ALL channels.

fn dissolve_hash(p: vec2<f32>) -> f32 {
    var q = fract(p * vec2<f32>(123.34, 456.21));
    q = q + dot(q, q + 45.32);
    return fract(q.x * q.y);
}

fn dissolve_noise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    // Smoothstep-shaped interpolation between the four corner hashes.
    let u = f * f * (3.0 - 2.0 * f);
    let a = dissolve_hash(i);
    let b = dissolve_hash(i + vec2<f32>(1.0, 0.0));
    let c = dissolve_hash(i + vec2<f32>(0.0, 1.0));
    let d = dissolve_hash(i + vec2<f32>(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

@fragment
fn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {
    let color = textureSample(layer_tex, layer_smp, in.uv);
    // Two octaves give the burn edge some texture; the fixed scale is in UV
    // space, so the pattern stretches with the layer's aspect — fine for a
    // dissolve, where the noise is transient by nature.
    let n = 0.65 * dissolve_noise(in.uv * 18.0)
        + 0.35 * dissolve_noise(in.uv * 48.6 + vec2<f32>(19.19, 7.33));
    let soft = max(u_softness(), 1e-4);
    // Remap the sweep so threshold 0 keeps every texel (even inside the soft
    // edge) and threshold 1 erases every texel.
    let edge = mix(-soft, 1.0, u_threshold());
    let keep = smoothstep(edge, edge + soft, n);
    return color * keep * u_group_alpha();
}
