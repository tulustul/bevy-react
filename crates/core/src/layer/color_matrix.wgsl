// The shared color-op filter pass: all seven color filters (brightness,
// contrast, saturate, grayscale, sepia, invert, hueRotate) evaluate through
// this one shader in the canonical CSS order, each identity except its own
// slot. Packing (see `filters.rs`, `color_matrix_identity`):
//
//   params[0] = (brightness, contrast, saturate, grayscale)   identity (1,1,1,0)
//   params[1] = (sepia, invert, hue_radians, 0)               identity (0,0,0,0)
//
// Color math is defined on straight alpha, so per the contract in
// `filter_prelude.wgsl` the pass unpremultiplies, operates, re-premultiplies.
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    premultiply,
    source_sampler,
    source_texture,
    uniforms,
    unpremultiply,
}

const LUMA = vec3<f32>(0.2126, 0.7152, 0.0722);

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
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let color = uniforms.params[0];
    let color2 = uniforms.params[1];
    let texel = unpremultiply(textureSample(source_texture, source_sampler, in.uv));
    var rgb = texel.rgb;

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

    return premultiply(vec4<f32>(rgb, texel.a));
}
