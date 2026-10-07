// The `spotlight` style (see `examples/demos/spotlight.rs`): the gallery's
// cursor light as a UI material. Bevy hands us the node's laid-out size and
// corner radii; the pointer arrives as a uniform in the node's own space, so
// the light is a pure function of (pixel, pointer) — no texture, no CPU
// raster, no React render per pointer move.
//
// Two optional parts, bottom to top:
//   * wash — a soft pool of light on the surface under the pointer;
//   * edge — a ring along the node's rounded border that catches the light.
// Everything is clipped to the node's rounded box.
//
// Output is straight alpha (the UI material pipeline blends ALPHA_BLENDING);
// the parts compose premultiplied and divide once at the end.

#import bevy_ui::ui_vertex_output::UiVertexOutput

// Mirrors `SpotlightUniform` in `spotlight.rs`.
struct Spotlight {
    // Linear RGBA.
    color: vec4<f32>,
    // xy: pointer, physical px from the node's top-left; z: physical px per
    // logical px.
    pointer: vec4<f32>,
    // reach, edge width (logical px), wash strength, unused.
    shape: vec4<f32>,
}
@group(1) @binding(0) var<uniform> light: Spotlight;

// Peak opacity of the lit edge, and how far it whitens at the hot spot.
const EDGE_ALPHA: f32 = 0.95;
const EDGE_WHITEN: f32 = 0.7;
// Peak opacity of a full-strength wash.
const WASH_ALPHA: f32 = 0.09;

// bevy_ui's own rounded-box SDF (`ui.wgsl`): `point` from the box centre,
// `size` the full box, radii top-left, top-right, bottom-right, bottom-left.
fn sd_rounded_box(point: vec2<f32>, size: vec2<f32>, corner_radii: vec4<f32>) -> f32 {
    let rs = select(corner_radii.xy, corner_radii.wz, 0.0 < point.y);
    let radius = select(rs.x, rs.y, 0.0 < point.x);
    let corner_to_point = abs(point) - 0.5 * size;
    let q = corner_to_point + radius;
    let l = length(max(q, vec2<f32>(0.0)));
    let m = min(max(q.x, q.y), 0.0);
    return l + m - radius;
}

// Premultiplied `top` over premultiplied `bottom`.
fn over(top: vec4<f32>, bottom: vec4<f32>) -> vec4<f32> {
    return top + bottom * (1.0 - top.a);
}

@fragment
fn fragment(in: UiVertexOutput) -> @location(0) vec4<f32> {
    let size = in.size;
    let p = in.uv * size;
    let scale = light.pointer.z;
    let reach = light.shape.x * scale;
    let edge = light.shape.y * scale;
    let wash = light.shape.z;

    // Smooth quadratic falloff: 1 under the pointer, 0 at `reach`.
    let falloff = 1.0 - smoothstep(0.0, reach, distance(p, light.pointer.xy));
    let lit = falloff * falloff;

    let sd = sd_rounded_box(p - 0.5 * size, size, in.border_radius);
    let coverage = saturate(0.5 - sd);

    var acc = vec4<f32>(0.0);

    if wash > 0.0 {
        let a = WASH_ALPHA * wash * lit;
        acc = over(vec4<f32>(light.color.rgb * a, a), acc);
    }

    if edge > 0.0 {
        // A band `edge` wide just inside the border, antialiased both sides.
        let ring = saturate(0.5 * edge + 0.5 - abs(sd + 0.5 * edge));
        let a = ring * EDGE_ALPHA * light.color.a * sqrt(lit);
        let rgb = mix(light.color.rgb, vec3<f32>(1.0), EDGE_WHITEN * lit);
        acc = over(vec4<f32>(rgb * a, a), acc);
    }

    let alpha = acc.a * coverage;
    if alpha <= 0.0 {
        return vec4<f32>(0.0);
    }
    return vec4<f32>(acc.rgb / acc.a, alpha);
}
