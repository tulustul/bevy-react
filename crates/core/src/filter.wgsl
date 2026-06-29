// The fragment shader for `FilterMaterial` (see `crates/core/src/filter.rs`),
// implementing a CSS-like `filter` on a UI node's own surface. The node is drawn
// by the `UiMaterial` pipeline, so this samples the node's source texture (an
// `<image>`, or a 1x1 white pixel for a solid-colored node tinted by `base_color`)
// and applies an optional Gaussian blur followed by a fixed-order color matrix.
//
// Bind group 0 is the view/globals (provided by the UI material pipeline); bind
// group 1 is this material's `AsBindGroup`. The four uniforms pack the filter
// params so a no-op filter leaves the pixel untouched (identity defaults).
#import bevy_ui::ui_vertex_output::UiVertexOutput

// rgba tint the sampled texel is multiplied by (image tint / solid background +
// opacity folded into alpha).
@group(1) @binding(0) var<uniform> base_color: vec4<f32>;
// x = brightness, y = contrast, z = saturate, w = grayscale.
@group(1) @binding(1) var<uniform> color: vec4<f32>;
// x = sepia, y = invert, z = hue rotation (radians), w = unused.
@group(1) @binding(2) var<uniform> color2: vec4<f32>;
// x = blur radius in pixels (of the node's rendered size), yzw = unused.
@group(1) @binding(3) var<uniform> blur: vec4<f32>;
@group(1) @binding(4) var tex: texture_2d<f32>;
@group(1) @binding(5) var tex_sampler: sampler;

const LUMA = vec3<f32>(0.2126, 0.7152, 0.0722);

// The most taps the blur kernel uses on each side of the center. The kernel is
// `(2*MAX_HALF+1)^2` taps at its widest, so this caps the per-fragment cost.
const MAX_HALF: i32 = 16;

// Sample the source with an optional Gaussian blur. The radius is given in node
// pixels and converted to a UV offset via `size` (the node's rendered size, in
// px), so the blur is independent of the source texture's resolution.
//
// The tap count scales with the radius (one tap per ~px, capped at `MAX_HALF`) so
// samples stay dense — a fixed small kernel would spread its taps wide at large
// radii and show discrete shifted copies of the image (blocky banding) instead of
// a smooth blur. Bilinear filtering (the image sampler) smooths between taps. This
// is a single-pass 2D Gaussian, not a two-pass separable one (a `UiMaterial` has
// no intermediate target), so very large radii are bounded by `MAX_HALF` rather
// than perfectly smooth. A `UiMaterial` node is also clipped to its own quad, so
// the blur does not bleed past the element's box the way CSS `blur()` does.
fn sample_filtered(uv: vec2<f32>, size: vec2<f32>) -> vec4<f32> {
    let radius = blur.x;
    if radius <= 0.0 || size.x <= 0.0 || size.y <= 0.0 {
        return textureSample(tex, tex_sampler, uv);
    }
    // One tap per pixel of radius (so spacing ~1px up to the cap), and a Gaussian
    // with sigma = radius/2 truncated at the radius.
    let half = clamp(i32(ceil(radius)), 1, MAX_HALF);
    let span = radius / f32(half); // px between adjacent taps
    let step = span / size; // same, in UV
    let two_sigma2 = 2.0 * (radius * 0.5) * (radius * 0.5);
    var sum = vec4<f32>(0.0);
    var wsum = 0.0;
    for (var i = -half; i <= half; i = i + 1) {
        for (var j = -half; j <= half; j = j + 1) {
            let d2 = f32(i * i + j * j) * span * span; // squared px distance
            let w = exp(-d2 / two_sigma2);
            let off = vec2<f32>(f32(i), f32(j)) * step;
            sum = sum + textureSample(tex, tex_sampler, uv + off) * w;
            wsum = wsum + w;
        }
    }
    return sum / wsum;
}

// Rotate an RGB color around the hue axis by `angle` radians (CSS `hue-rotate`).
fn hue_rotate(rgb: vec3<f32>, angle: f32) -> vec3<f32> {
    let c = cos(angle);
    let s = sin(angle);
    // The standard CSS hue-rotation matrix.
    let m = mat3x3<f32>(
        vec3<f32>(0.213 + c * 0.787 - s * 0.213, 0.213 - c * 0.213 + s * 0.143, 0.213 - c * 0.213 - s * 0.787),
        vec3<f32>(0.715 - c * 0.715 - s * 0.715, 0.715 + c * 0.285 + s * 0.140, 0.715 - c * 0.715 + s * 0.715),
        vec3<f32>(0.072 - c * 0.072 + s * 0.928, 0.072 - c * 0.072 - s * 0.283, 0.072 + c * 0.928 + s * 0.072),
    );
    return m * rgb;
}

@fragment
fn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {
    let texel = sample_filtered(in.uv, in.size) * base_color;
    var rgb = texel.rgb;
    let a = texel.a;

    // Fixed canonical order: brightness → contrast → saturate → grayscale →
    // sepia → invert → hue-rotate. Defaults (1,1,1,0,0,0,0) are identity.
    rgb = rgb * color.x;                                         // brightness
    rgb = (rgb - vec3<f32>(0.5)) * color.y + vec3<f32>(0.5);     // contrast
    rgb = mix(vec3<f32>(dot(rgb, LUMA)), rgb, color.z);          // saturate
    rgb = mix(rgb, vec3<f32>(dot(rgb, LUMA)), color.w);          // grayscale

    let sepia = vec3<f32>(
        dot(rgb, vec3<f32>(0.393, 0.769, 0.189)),
        dot(rgb, vec3<f32>(0.349, 0.686, 0.168)),
        dot(rgb, vec3<f32>(0.272, 0.534, 0.131)),
    );
    rgb = mix(rgb, sepia, color2.x);                             // sepia
    rgb = mix(rgb, vec3<f32>(1.0) - rgb, color2.y);              // invert
    rgb = hue_rotate(rgb, color2.z);                             // hue-rotate

    return vec4<f32>(rgb, a);
}
