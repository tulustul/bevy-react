// The deck's particles (see `examples/coldwake/station/fx.rs`): each
// emitter is one mesh of quads (one draw call), every quad animated here
// from its own random seed (the vertex color) and the time; the emitter's
// transform is where it sits and, for bursts, which way it throws (+Y).
//
//   kind 0  motes   dust drifting through a box `area.xyz`, at `wind.xyz`
//                   m/s, twinkling. Adds light.
//   kind 1  steam   puffs rising `area.y` m off a disc of radius `area.x`,
//                   drifting by `wind.xyz` over a life — but only puffs born
//                   in the first `wind.w` of every `area.w` seconds, so the
//                   vent breathes. Premultiplied.
//   kind 2  sparks  a one-shot burst at `area.w` (the start time): streaks
//                   flung in a cone of half-angle `area.x` around +Y at
//                   `params.w` m/s, `area.y` of gravity, for `wind.w` s;
//                   white-hot (`color2`) cooling to `color`. Adds light.
//   kind 3  cloud   a one-shot puff at `area.w`: soft clouds swelling out of
//                   the cone at `params.w` m/s, for `wind.w` s. Premultiplied.
//
// params = (kind, amount 0..1, size m, speed). A quad ranked above `amount`
// collapses, so an emitter thins out smoothly.

import bevy_pbr::render::{
    mesh_functions::get_world_from_local,
    mesh_view_bindings::{globals, view},
};
@if(DISTANCE_FOG)
import bevy_pbr::render::{
    mesh_view_bindings::fog,
    mesh_view_types::{FOG_MODE_LINEAR, FOG_MODE_EXPONENTIAL, FOG_MODE_EXPONENTIAL_SQUARED},
};

@group(constants::MATERIAL_BIND_GROUP) @binding(0) var<uniform> params: vec4<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(1) var<uniform> area: vec4<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(2) var<uniform> wind: vec4<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(3) var<uniform> color: vec4<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(4) var<uniform> color2: vec4<f32>;

const TAU: f32 = 6.2831853;

struct Vertex {
    @builtin(instance_index) instance_index: u32,
    @location(0) position: vec3<f32>,
    @location(1) corner: vec2<f32>,
    @location(2) seed: vec4<f32>,
}

struct VertexOutput {
    @builtin(position) clip: vec4<f32>,
    @location(0) corner: vec2<f32>,
    @location(1) tint: vec4<f32>,
    // (the quad's own random, its distance from the eye)
    @location(2) misc: vec2<f32>,
}

fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn vnoise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash12(i), hash12(i + vec2<f32>(1.0, 0.0)), u.x),
        mix(hash12(i + vec2<f32>(0.0, 1.0)), hash12(i + vec2<f32>(1.0, 1.0)), u.x),
        u.y,
    );
}

fn wrap(p: vec3<f32>, center: vec3<f32>, size: vec3<f32>) -> vec3<f32> {
    return center + (fract((p - center) / size + 0.5) - 0.5) * size;
}

@vertex
fn vertex(v: Vertex) -> VertexOutput {
    let kind = u32(params.x + 0.5);
    let s = v.seed;
    let model = get_world_from_local(v.instance_index);
    let origin = model[3].xyz;
    let eye = view.world_position;
    var axis_x = normalize(view.world_from_view[0].xyz);
    var axis_y = normalize(view.world_from_view[1].xyz);
    let rank = fract(s.x * 7.31 + s.w * 3.17);
    let r = fract(s.z * 5.13 + s.y * 2.71);
    var center = origin;
    var size = vec2<f32>(params.z);
    var tint = color;
    var visible = rank <= params.y;

    switch kind {
        case 0u: {
            let t = globals.time * params.w;
            var p = s.xyz * area.xyz + wind.xyz * t;
            p += vec3<f32>(sin(t * 0.7 + s.w * 40.0), 0.5 * sin(t * 0.5 + s.x * 20.0), cos(t * 0.6 + s.y * 30.0)) * 0.25;
            center = wrap(p, origin, area.xyz);
            size = vec2<f32>(params.z * (0.5 + r));
            let twinkle = 0.45 + 0.55 * sin(globals.time * (0.8 + 1.6 * r) + s.z * 60.0);
            tint = vec4<f32>(color.rgb * twinkle, 0.0);
        }
        case 1u: {
            let life = (0.8 + 0.4 * s.w) / max(params.w, 0.01);
            let age = fract(globals.time / life + s.x);
            let born = globals.time - age * life;
            visible = visible && fract(born / area.w) < wind.w;
            let disc = vec2<f32>(cos(s.y * TAU), sin(s.y * TAU)) * sqrt(s.z) * area.x;
            let base = vec3<f32>(disc.x, 0.0, disc.y);
            center = origin + base * (1.0 + 2.0 * age) + vec3<f32>(0.0, age * area.y, 0.0) + wind.xyz * pow(age, 1.5);
            size = vec2<f32>(params.z * (0.6 + 0.6 * r) * mix(0.25, 1.0, sqrt(age)));
            let a = smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(0.45, 1.0, age)) * color.a;
            tint = vec4<f32>(mix(color2.rgb, color.rgb, smoothstep(0.0, 0.45, age)), a);
            let spin = r * TAU + globals.time * (r - 0.5) * 0.6;
            let x = axis_x * cos(spin) + axis_y * sin(spin);
            axis_y = axis_y * cos(spin) - axis_x * sin(spin);
            axis_x = x;
        }
        default: {
            // A burst: since its start, along a cone around the emitter's +Y.
            let since = globals.time - area.w;
            let life = wind.w * (0.55 + 0.45 * r);
            let age = since / life;
            visible = visible && since >= 0.0 && age < 1.0;
            let phi = s.y * TAU;
            let theta = area.x * sqrt(s.z);
            let local = vec3<f32>(sin(theta) * cos(phi), cos(theta), sin(theta) * sin(phi));
            let dir = normalize((model * vec4<f32>(local, 0.0)).xyz);
            let speed = params.w * (0.35 + 0.65 * s.w);
            if kind == 2u {
                let g = vec3<f32>(0.0, -9.8 * area.y, 0.0);
                center = origin + dir * speed * since + 0.5 * g * since * since;
                let vel = dir * speed + g * since;
                axis_y = normalize(vel + vec3<f32>(0.0, 1e-4, 0.0));
                axis_x = normalize(cross(axis_y, eye - center));
                size = vec2<f32>(params.z * (0.5 + 0.5 * r), max(params.z, length(vel) * 0.016));
                let hot = 1.0 - smoothstep(0.0, 0.5, age);
                tint = vec4<f32>(mix(color.rgb, color2.rgb, hot * hot) * (1.0 - age), 0.0);
            } else {
                let reach = speed * (0.3 + 0.7 * r) * (1.0 - exp(-3.0 * age)) * wind.w * 0.5;
                center = origin + dir * reach + vec3<f32>(0.0, -area.y * since, 0.0);
                size = vec2<f32>(params.z * (0.4 + 0.6 * sqrt(age)) * (0.7 + 0.6 * r));
                let a = smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.35, 1.0, age)) * color.a;
                tint = vec4<f32>(mix(color2.rgb, color.rgb, age), a);
                let spin = r * TAU + since * (r - 0.5);
                let x = axis_x * cos(spin) + axis_y * sin(spin);
                axis_y = axis_y * cos(spin) - axis_x * sin(spin);
                axis_x = x;
            }
        }
    }
    if !visible {
        size = vec2<f32>(0.0);
    }

    let q = v.corner * 2.0 - 1.0;
    let world = center + axis_x * q.x * size.x + axis_y * q.y * size.y;
    var out: VertexOutput;
    out.clip = view.clip_from_world * vec4<f32>(world, 1.0);
    out.corner = v.corner;
    out.tint = tint;
    out.misc = vec2<f32>(r, distance(center, eye));
    return out;
}

/// How much of a light at distance `d` the view's fog lets through.
@if(DISTANCE_FOG)
fn fog_keep(d: f32) -> f32 {
    if fog.mode == FOG_MODE_LINEAR {
        return clamp((fog.be.y - d) / (fog.be.y - fog.be.x), 0.0, 1.0);
    } else if fog.mode == FOG_MODE_EXPONENTIAL {
        return exp(-d * fog.be.x);
    } else if fog.mode == FOG_MODE_EXPONENTIAL_SQUARED {
        let k = d * fog.be.x;
        return exp(-k * k);
    }
    return 1.0;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let q = in.corner * 2.0 - 1.0;
    var keep = 1.0;
    var haze = vec3<f32>(0.0);
@if(DISTANCE_FOG)
    keep = fog_keep(in.misc.y);
@if(DISTANCE_FOG)
    haze = fog.base_color.rgb;
    let kind = u32(params.x + 0.5);
    if kind == 1u || kind == 3u {
        // A puff, ragged at the edge.
        let n = vnoise(q * 2.3 + in.misc.x * 37.0);
        let a = (1.0 - smoothstep(0.15, 1.0, length(q))) * (0.45 + 0.55 * n) * in.tint.a;
        return vec4<f32>(mix(haze, in.tint.rgb, keep) * a, a);
    }
    // A speck or a spark: light only.
    let a = (1.0 - smoothstep(0.0, 1.0, length(q)));
    return vec4<f32>(in.tint.rgb * a * a * keep, 0.0);
}
