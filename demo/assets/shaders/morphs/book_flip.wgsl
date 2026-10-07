// Morph `bookFlip` (see `examples/demos/filters.rs`): a page flip around the
// vertical center spine — the right half of the old image turns over,
// landing as the left half of the new image, with a shade on the moving
// page.
//
// Port of gl-transitions BookFlip.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/BookFlip.glsl
//   Author: hong — License: MIT
//
// No params.
//
// PREMULTIPLY: each side lerps two premultiplied samples; the page shade
// scales rgb only by <= 1 (valid on premultiplied color — coverage is
// untouched). The upstream implicitly returns alpha 1; here the real sampled
// alpha rides along. Sampling sits behind the p.x branch, hence the
// explicit-LOD morph helpers; skewed uvs are edge-clamped like the upstream
// sampler (the from-helper would mask them transparent instead). The skew
// denominators are singular at progress 0.5 (the page edge-on frame) —
// guarded sign-preserving; the `pr` gate masks those texels like upstream.
// Endpoint guards return the exact from/to samples (identity contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from_lod,
    morph_sample_to_lod,
}

fn guard_signed(d: f32) -> f32 {
    return select(max(d, 1e-5), min(d, -1e-5), d < 0.0);
}

fn safe_uv(p: vec2<f32>) -> vec2<f32> {
    return clamp(p, vec2<f32>(0.0), vec2<f32>(1.0));
}

// The turning page's front face, seen on the right half.
fn skew_right(p: vec2<f32>, progress: f32) -> vec2<f32> {
    let skew_x = (p.x - progress) / guard_signed(0.5 - progress) * 0.5;
    let skew_y = (p.y - 0.5) / (0.5 + progress * (p.x - 0.5) / 0.5) * 0.5 + 0.5;
    return vec2<f32>(skew_x, skew_y);
}

// The landing page's back face, seen on the left half.
fn skew_left(p: vec2<f32>, progress: f32) -> vec2<f32> {
    let skew_x = (p.x - 0.5) / guard_signed(progress - 0.5) * 0.5 + 0.5;
    let skew_y = (p.y - 0.5) / (0.5 + (1.0 - progress) * (0.5 - p.x) / 0.5) * 0.5 + 0.5;
    return vec2<f32>(skew_x, skew_y);
}

// Shade on the moving page: darkest edge-on, 1.0 at rest.
fn shade(progress: f32) -> f32 {
    return max(0.7, abs(progress - 0.5) * 2.0);
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from_lod(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to_lod(in.uv);
    }

    let p = in.uv;
    let pr = step(1.0 - progress, p.x);
    let sh = shade(progress);

    if p.x < 0.5 {
        let landing = morph_sample_to_lod(safe_uv(skew_left(p, progress)));
        return mix(
            morph_sample_from_lod(p),
            vec4<f32>(landing.rgb * sh, landing.a),
            pr,
        );
    }
    let turning = morph_sample_from_lod(safe_uv(skew_right(p, progress)));
    return mix(
        vec4<f32>(turning.rgb * sh, turning.a),
        morph_sample_to_lod(p),
        pr,
    );
}
