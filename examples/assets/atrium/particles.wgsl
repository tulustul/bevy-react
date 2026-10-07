// Atrium's weather (see `examples/atrium/world/weather.rs`): every particle
// of a kind is one quad of one mesh, animated entirely here from a per-quad
// random seed (the vertex color) and the time — one draw call per kind.
//
//   kind 0  rain       streaks falling through a box that rides with you
//   kind 1  snow       drifting flakes, same box
//   kind 2  fireflies  slow wandering lights over the shore, at dusk
//   kind 3  lanterns   sky lanterns rising off the lake (the tour's reward)
//
// `params` = (kind, amount 0..1, lanterns' launch time, 0). A quad whose
// seed is above `amount` collapses to nothing, so the weather thins out
// smoothly as it eases.

#import bevy_pbr::mesh_view_bindings::{globals, view}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> params: vec4<f32>;

struct Vertex {
    @location(0) position: vec3<f32>,
    @location(1) corner: vec2<f32>,
    @location(2) seed: vec4<f32>,
}

struct VertexOutput {
    @builtin(position) clip: vec4<f32>,
    @location(0) corner: vec2<f32>,
    @location(1) tint: vec4<f32>,
}

fn wrap(p: vec3<f32>, center: vec3<f32>, size: vec3<f32>) -> vec3<f32> {
    return center + (fract((p - center) / size + 0.5) - 0.5) * size;
}

@vertex
fn vertex(v: Vertex) -> VertexOutput {
    let kind = params.x;
    let amount = params.y;
    let t = globals.time;
    let s = v.seed;
    let cam = view.world_position;
    let right = normalize(view.world_from_view[0].xyz);
    let up = normalize(view.world_from_view[1].xyz);
    var out: VertexOutput;
    out.corner = v.corner;

    var center: vec3<f32>;
    var axis_x = right;
    var axis_y = up;
    var size = vec2<f32>(0.03);
    var tint = vec4<f32>(1.0);

    if kind < 0.5 {
        // Rain: a box of falling streaks around you, each a thin quad along
        // its fall, turned to face you.
        let box_size = vec3<f32>(36.0, 22.0, 36.0);
        let fall = vec3<f32>(0.6, -9.5, 0.25);
        let p = s.xyz * box_size + fall * (t + s.w * 10.0);
        center = wrap(p, cam + vec3<f32>(0.0, 2.0, 0.0), box_size);
        axis_y = normalize(fall);
        axis_x = normalize(cross(axis_y, cam - center));
        size = vec2<f32>(0.006, 0.32);
        tint = vec4<f32>(0.78, 0.84, 0.95, 0.16);
    } else if kind < 1.5 {
        // Snow: slow flakes swaying as they fall.
        let box_size = vec3<f32>(30.0, 18.0, 30.0);
        let fall = vec3<f32>(0.25, -0.9 - s.w * 0.5, 0.1);
        var p = s.xyz * box_size + fall * t;
        p += vec3<f32>(sin(t * 0.7 + s.w * 40.0), 0.0, cos(t * 0.6 + s.x * 30.0)) * 0.35;
        center = wrap(p, cam + vec3<f32>(0.0, 2.0, 0.0), box_size);
        size = vec2<f32>(0.025 + s.w * 0.025);
        tint = vec4<f32>(1.0, 1.0, 1.0, 0.9);
    } else if kind < 2.5 {
        // Fireflies: wandering over the shore and the water by the pier,
        // blinking on and off in their own rhythm.
        let home = vec3<f32>((s.x - 0.5) * 50.0, 0.4 + s.y * 2.6, -4.0 - s.z * 30.0);
        let wander = vec3<f32>(
            sin(t * (0.21 + s.w * 0.2) + s.x * 31.0),
            sin(t * (0.37 + s.z * 0.3) + s.y * 17.0) * 0.4,
            cos(t * (0.19 + s.y * 0.2) + s.z * 23.0),
        ) * 1.6;
        center = home + wander;
        size = vec2<f32>(0.05);
        let blink = smoothstep(0.2, 0.9, sin(t * (0.8 + s.w) + s.x * 50.0));
        tint = vec4<f32>(vec3<f32>(1.0, 0.85, 0.35) * 4.0 * blink, 1.0);
    } else {
        // Lanterns: lit off the lake one after another, rising and drifting.
        let age = t - params.z - s.w * 14.0;
        let launch = vec3<f32>((s.x - 0.5) * 220.0, 0.4, -40.0 - s.y * 300.0);
        let rise = max(age, 0.0);
        center = launch + vec3<f32>(sin(rise * 0.13 + s.z * 9.0) * 3.0 * rise * 0.1, rise * 1.1, -rise * 0.4);
        let lit = smoothstep(0.0, 2.0, age) * (1.0 - smoothstep(70.0, 90.0, age));
        size = vec2<f32>(1.1, 1.3) * lit;
        let flicker = 0.85 + 0.15 * sin(t * 9.0 + s.x * 70.0);
        tint = vec4<f32>(vec3<f32>(1.0, 0.55, 0.18) * 3.2 * flicker, 1.0);
    }

    // Thin the weather out by seed as it eases away.
    if s.w > amount {
        size = vec2<f32>(0.0);
    }
    let offset = (v.corner - 0.5) * 2.0;
    let world = center + axis_x * offset.x * size.x + axis_y * -offset.y * size.y;
    out.clip = view.clip_from_world * vec4<f32>(world, 1.0);
    out.tint = tint;
    return out;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let kind = params.x;
    let q = (in.corner - 0.5) * 2.0;
    var a: f32;
    if kind < 0.5 {
        // A streak: soft across, fading at both ends.
        a = (1.0 - abs(q.x)) * (1.0 - q.y * q.y);
    } else if kind < 2.5 {
        a = smoothstep(1.0, 0.0, length(q));
        a = a * a;
    } else {
        // A paper lantern: a small bright body, brightest low where the
        // flame is, in a wide soft halo of its own light.
        let p = q * vec2<f32>(1.0, 0.85);
        let body_d = length(max(abs(p - vec2<f32>(0.0, 0.05)) - vec2<f32>(0.12, 0.17), vec2<f32>(0.0)));
        let body = smoothstep(0.06, 0.0, body_d) * (0.75 + 0.25 * smoothstep(-0.2, 0.25, p.y));
        let halo = exp(-dot(p, p) * 6.0) * 0.22;
        a = body + halo;
    }
    // Premultiplied: rain and snow cover what's behind them a little; the
    // lights (alpha 0) only add — glow.
    if kind > 1.5 {
        return vec4<f32>(in.tint.rgb * a, 0.0);
    }
    return vec4<f32>(in.tint.rgb * in.tint.a * a, in.tint.a * a);
}
