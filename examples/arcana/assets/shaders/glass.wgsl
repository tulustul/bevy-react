// Custom filter `liquidGlass` (see `examples/arcana/filters.rs`), used as a
// `backdropFilter`: the pass source is the live 3D frame behind the node, and
// this shader looks at it through a slab of glass with a rounded rim.
//
//   * Shape: the node's rounded box as a signed distance field (corner radius
//     from `radius`), its interior corners smoothed so the rim normal turns
//     continuously — the normal comes from finite differences of the field.
//   * Refraction: inside the rim (`bezel` px deep) the view ray bends along
//     the normal, up to `refraction` px at the very edge (a quarter-circle
//     profile: flat in the middle, steep at the rim) — the world behind
//     magnifies and swims around the edge as things move behind it.
//   * Dispersion: red, green and blue bend by slightly different amounts.
//   * Frost: an optional ring of taps softens what the glass shows.
//   * Light: a crisp specular line along the rim lit from the top-left, a
//     faint counter-light bottom-right, a soft inner glow under the lit edge.
//
// Params (declaration-order packing of `LiquidGlass`; `Length` slots arrive
// as physical px):
//   params[0].x  radius      px
//   params[0].y  bezel       px
//   params[0].z  refraction  px
//   params[0].w  dispersion  0..1
//   params[1].x  frost       0..1
//   params[1].y  highlight   0..1
//   params[2]    tint        straight linear RGBA (alpha = amount)
//
// PREMULTIPLY: the backdrop snapshot is opaque (alpha 1), so resampling it
// and writing alpha 1 back satisfies the contract trivially. The composite
// clips the output to the node's rounded border box.

#import bevy_react::filter::{
    FullscreenVertexOutput,
    content_rect_min,
    content_rect_size,
    sample_source_lod,
    uniforms,
}

// Polynomial smooth max: rounds the interior corner where two edges meet.
fn smax(a: f32, b: f32, k: f32) -> f32 {
    let h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(a, b, h) + k * h * (1.0 - h);
}

fn box_sdf(p: vec2<f32>, half: vec2<f32>, r: f32) -> f32 {
    let q = abs(p) - (half - vec2<f32>(r));
    return length(max(q, vec2<f32>(0.0))) + min(smax(q.x, q.y, r + 6.0), 0.0) - r;
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let bezel = max(uniforms.params[0].y, 1.0);
    let refraction = uniforms.params[0].z;
    let dispersion = uniforms.params[0].w;
    let frost = uniforms.params[1].x;
    let highlight = uniforms.params[1].y;
    let tint = uniforms.params[2];

    let half = content_rect_size() * 0.5;
    let r = clamp(uniforms.params[0].x, 0.0, min(half.x, half.y));
    let p = in.uv * uniforms.resolution - content_rect_min() - half;

    let sd = box_sdf(p, half, r);
    let e = vec2<f32>(1.0, 0.0);
    let grad = vec2<f32>(
        box_sdf(p + e.xy, half, r) - box_sdf(p - e.xy, half, r),
        box_sdf(p + e.yx, half, r) - box_sdf(p - e.yx, half, r),
    );
    let n = grad / max(length(grad), 1e-4);
    let depth = max(-sd, 0.0);

    // Quarter-circle rim: 0 deep inside, 1 at the edge.
    let x = clamp(1.0 - depth / bezel, 0.0, 1.0);
    let bend = refraction * (1.0 - sqrt(1.0 - x * x));
    // Sample from further in: the rim magnifies the world behind it.
    let off = -n * bend / uniforms.resolution;

    let spread = 0.3 * dispersion;
    var rgb = vec3<f32>(
        sample_source_lod(in.uv + off * (1.0 + spread)).r,
        sample_source_lod(in.uv + off).g,
        sample_source_lod(in.uv + off * (1.0 - spread)).b,
    );

    if frost > 0.0 {
        let reach = frost * 9.0 / uniforms.resolution;
        var soft = vec3<f32>(0.0);
        for (var i = 0; i < 8; i++) {
            let a = f32(i) * 0.7853982;
            soft += sample_source_lod(in.uv + off + vec2<f32>(cos(a), sin(a)) * reach).rgb;
        }
        rgb = mix(rgb, (soft + rgb) / 9.0, clamp(frost * 1.5, 0.0, 1.0));
    }

    // Glass is a touch lighter than the void it sits in, then tinted.
    rgb = rgb * 1.05 + 0.01;
    rgb = mix(rgb, tint.rgb, tint.a);

    // Light from the top-left (screen y runs down).
    let light = normalize(vec2<f32>(-0.55, -0.85));
    let ndl = dot(n, light);
    let rim = exp(-depth / 1.1);
    let spec = pow(max(ndl, 0.0), 1.5) + 0.4 * pow(max(-ndl, 0.0), 2.0);
    rgb += highlight * rim * spec * 0.85;
    let inner = x * x;
    rgb += highlight * inner * max(ndl, 0.0) * 0.10;
    rgb *= 1.0 - highlight * inner * max(-ndl, 0.0) * 0.12;

    return vec4<f32>(rgb, 1.0);
}
