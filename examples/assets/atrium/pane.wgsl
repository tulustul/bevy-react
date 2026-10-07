// An Atrium window (see `examples/atrium/panes/material.rs`): frosted glass
// with a React UI on it. The material reads the view's transmission texture
// (the opaque world, copied before this pass), so the glass shows the live
// world behind it — blurred, dimmed, and bent along a rounded bevel — and the
// UI is composited over it exactly, premultiplied, never lit or tonemapped.
//
// The quad holds the whole `<surface>` texture: the window (the top
// `glass_h` meters, a rounded glass slab) and the chrome strip under it,
// where only the UI's own pixels (the grab bar, the close button) show.
//
// Uniforms:
//   shape = (quad width m, quad height m, glass height m, corner radius m)
//   look  = (presence 0..1, hover 0..1, frost px, seed)

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view, view_transmission_texture, view_transmission_sampler},
    utils::interleaved_gradient_noise,
}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> shape: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var<uniform> look: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var ui: texture_2d<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(3) var ui_sampler: sampler;

const GOLDEN: f32 = 2.39996323;
const TAPS: i32 = 20;

fn sd_box(p: vec2<f32>, half: vec2<f32>, r: f32) -> f32 {
    let q = abs(p) - half + vec2<f32>(r);
    return length(max(q, vec2<f32>(0.0))) + min(max(q.x, q.y), 0.0) - r;
}

fn hash(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn noise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2<f32>(1.0, 0.0)), u.x),
        mix(hash(i + vec2<f32>(0.0, 1.0)), hash(i + vec2<f32>(1.0, 1.0)), u.x), u.y);
}

// The world behind, blurred over a golden-angle disk of `radius` px. The
// per-pixel rotation turns the residual banding into fine grain — frosted
// glass has grain anyway.
fn frosted(uv: vec2<f32>, radius: f32, frag: vec2<f32>) -> vec3<f32> {
    let px = 1.0 / view.viewport.zw;
    let spin = interleaved_gradient_noise(frag, 0u) * 6.2831853;
    var sum = vec3<f32>(0.0);
    for (var i = 0; i < TAPS; i++) {
        let fi = f32(i) + 0.5;
        let r = sqrt(fi / f32(TAPS)) * radius;
        let a = fi * GOLDEN + spin;
        let o = vec2<f32>(cos(a), sin(a)) * r * px;
        let s = textureSampleLevel(view_transmission_texture, view_transmission_sampler, uv + o, 0.0).rgb;
        // Tame HDR highlights (the sun) so they don't punch through as dots.
        sum += s / (1.0 + max(max(s.r, s.g), s.b) * 0.35);
    }
    return sum / f32(TAPS);
}

@fragment
fn fragment(in: VertexOutput, @builtin(front_facing) front: bool) -> @location(0) vec4<f32> {
    let uv = in.uv;
    let quad = shape.xy;
    let glass_h = shape.z;
    let radius = shape.w;
    let presence = look.x;
    let hover = look.y;

    // The glass slab's rounded box, in meters (negative inside).
    let pm = uv * quad;
    let center = vec2<f32>(quad.x * 0.5, glass_h * 0.5);
    let sd = sd_box(pm - center, vec2<f32>(quad.x * 0.5, glass_h * 0.5), radius);
    let aa = max(fwidth(sd), 1e-5);
    let grad = vec2<f32>(dpdx(sd), dpdy(sd));
    var inside = clamp(0.5 - sd / aa, 0.0, 1.0);

    // The UI: premultiplied, linear. From behind, it shows through the
    // glass mirrored and dimmed, the way a lit window reads from outside.
    // The quad's thin margin (UVs past 0..1) is glass edge only.
    let ui_uv = select(vec2<f32>(1.0 - uv.x, uv.y), uv, front);
    var ui_c = textureSampleLevel(ui, ui_sampler, ui_uv, 0.0);
    if any(uv < vec2<f32>(0.0)) || any(uv > vec2<f32>(1.0)) {
        ui_c = vec4<f32>(0.0);
    }
    if !front {
        ui_c *= 0.45;
    }

    // Opening and closing: the window condenses upward out of fine noise,
    // a thin line of light (HDR — it blooms) along the forming front.
    let rise = 1.0 - clamp(pm.y / quad.y, 0.0, 1.0);
    let n = noise(pm * 60.0 + look.w) * 0.6 + noise(pm * 150.0) * 0.4;
    let field = rise * 0.6 + n * 0.4;
    let forming = presence * 1.2 - 0.1;
    let formed = smoothstep(forming + 0.025, forming - 0.025, field);
    let shape = max(inside, ui_c.a);
    let burn = smoothstep(0.035, 0.0, abs(field - forming)) * shape
        * (1.0 - presence) * step(0.001, presence);
    inside *= formed;
    ui_c *= formed * smoothstep(0.6, 1.0, presence);

    if inside <= 0.0 && ui_c.a < 0.004 && burn < 0.01 {
        discard;
    }

    let frag = in.position.xy;
    let screen = frag / view.viewport.zw;
    let behind = textureSampleLevel(view_transmission_texture, view_transmission_sampler, screen, 0.0).rgb;

    // The bevel: within `bevel` meters of the edge the glass bends the world
    // outward, like the rounded rim of a thick slab.
    let bevel = 0.035;
    let rim_k = clamp(1.0 + sd / bevel, 0.0, 1.0);
    let bend_dir = grad / max(length(grad), 1e-6);
    let bend = -bend_dir * pow(rim_k, 3.0) * 14.0 / view.viewport.zw;

    var glass = frosted(screen + bend, look.z, frag);
    // Dim and soften what the glass shows, so the UI on it always reads:
    // bright scenes are pulled down hard, dark ones barely.
    let l = dot(glass, vec3<f32>(0.2126, 0.7152, 0.0722));
    let dim = clamp(0.11 / max(l, 1e-3), 0.22, 0.8);
    glass = mix(glass, vec3<f32>(l), 0.22) * dim + vec3<f32>(0.018, 0.022, 0.03);
    glass += vec3<f32>(0.03) * hover;

    // Light on the glass: a crisp rim brightest along the top edge, and a
    // broad sheen that slides as you move relative to the window.
    let v = normalize(view.world_position - in.world_position.xyz);
    let top = 1.0 - clamp(pm.y / glass_h, 0.0, 1.0);
    let rim = smoothstep(0.006, 0.0, -sd) * inside;
    glass += vec3<f32>(1.0) * rim * (0.12 + 0.3 * top * top);
    let sheen_axis = uv.x * 0.7 + uv.y * 0.5 + v.x * 0.6 - v.y * 0.4;
    glass += vec3<f32>(0.9, 0.95, 1.0) * smoothstep(0.35, 0.0, abs(sheen_axis - 0.45)) * 0.035;
    glass = min(glass, vec3<f32>(0.92));

    var c = mix(behind, glass, inside);
    c = c * (1.0 - ui_c.a) + ui_c.rgb;
    c += vec3<f32>(0.6, 0.85, 1.0) * burn * 1.6;
    return vec4<f32>(c, 1.0);
}
