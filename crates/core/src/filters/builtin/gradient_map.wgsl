// gradientMap: recolor the layer's pixels with a multi-stop linear gradient,
// keeping alpha (`gradient_map.rs`).
//
// Params map (packed by `GradientMapParams::pack` — positions arrive resolved
// and NON-DECREASING, unused tail stops repeat the last color at 1.0):
//   params[0..6) = stop colors, linear straight-alpha RGBA
//   params[6]    = positions of stops A..D
//   params[7]    = (position of stop E, position of stop F,
//                   angle in radians, amount)
//
// The gradient line spans the NODE rect, not the inflated capture — the
// prelude's `content_uv`/`content_rect_size` divide the outset ring out, so
// chaining with an outset filter (outline, blur) never stretches the ramp.
// COLOR-op premultiply rule: unpremultiply around the math (the recolor is
// defined on straight alpha; alpha itself is untouched).

#import bevy_react::filter::{
    FullscreenVertexOutput, content_rect_size, content_uv, premultiply,
    source_sampler, source_texture, uniforms, unpremultiply,
}

fn stop_position(index: i32) -> f32 {
    if index < 4 {
        let pa = uniforms.params[6];
        if index < 2 {
            return select(pa.y, pa.x, index == 0);
        }
        return select(pa.w, pa.z, index == 2);
    }
    let pb = uniforms.params[7];
    return select(pb.y, pb.x, index == 4);
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let src = textureSample(source_texture, source_sampler, in.uv);
    let amount = uniforms.params[7].w;
    if amount <= 0.0 {
        // Exact identity — the transition-padding contract (`amount: 0`).
        return src;
    }

    // CSS linear-gradient line over the node rect: 0 = to top, clockwise,
    // aspect-correct in physical px, y down.
    let size = content_rect_size();
    let centered = (content_uv(in.uv) - vec2<f32>(0.5)) * size;
    let ang = uniforms.params[7].z;
    let dir = vec2<f32>(sin(ang), -cos(ang));
    let line_len = abs(size.x * dir.x) + abs(size.y * dir.y);
    let t = clamp(dot(centered, dir) / max(line_len, 1e-4) + 0.5, 0.0, 1.0);

    // Piecewise-linear 6-stop ramp as a running mix: for t inside segment k
    // every earlier segment has fully mixed (f = 1) and every later one not
    // at all (f = 0). Positions are non-decreasing by the packing contract;
    // coincident stops give a hard edge via the 1e-5 guard.
    var grad = uniforms.params[0];
    for (var i = 0; i < 5; i = i + 1) {
        let lo = stop_position(i);
        let hi = stop_position(i + 1);
        let f = clamp((t - lo) / max(hi - lo, 1e-5), 0.0, 1.0);
        grad = mix(grad, uniforms.params[i + 1], f);
    }

    // Straight-alpha recolor: the gradient's own alpha scales the mix
    // locally (a transparent stop reveals the original color); the source
    // alpha is always kept.
    let texel = unpremultiply(src);
    let rgb = mix(texel.rgb, grad.rgb, amount * grad.a);
    return premultiply(vec4<f32>(rgb, texel.a));
}
