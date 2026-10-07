// The dioramas' particles (see `examples/cyberpunk/dioramas/materials.rs`):
// each emitter is one mesh of quads (one draw call), every quad animated
// here from its own random seed (the vertex color) and the time; the
// emitter's transform is where it burns, steams or rains.
//
//   kind 0  flame   tongues licking up off a disc, white-hot to red
//   kind 1  plume   puffs rising and spreading: smoke, steam, dust
//   kind 2  embers  sparks swirling up out of a fire
//   kind 3  rain    streaks falling through a box
//   kind 4  motes   specks drifting through a box
//
// params = (kind, amount 0..1, size, speed). `area` is the base's radii and
// the rise (x, z, y) — or the box for rain and motes — and `wind` the drift
// over a life (or per second, for rain and motes). A quad ranked above
// `amount` collapses, so an emitter thins out smoothly. Flames, embers and
// motes only add light; puffs and rain are premultiplied.

#import bevy_pbr::{
    mesh_functions::get_world_from_local,
    mesh_view_bindings::{globals, view},
}
#ifdef DISTANCE_FOG
#import bevy_pbr::{
    mesh_view_bindings::fog,
    mesh_view_types::{FOG_MODE_LINEAR, FOG_MODE_EXPONENTIAL, FOG_MODE_EXPONENTIAL_SQUARED},
}
#endif

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> params: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var<uniform> area: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var<uniform> wind: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(3) var<uniform> color: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(4) var<uniform> color2: vec4<f32>;

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
    let t = globals.time * params.w;
    let origin = get_world_from_local(v.instance_index)[3].xyz;
    let eye = view.world_position;
    var axis_x = normalize(view.world_from_view[0].xyz);
    var axis_y = normalize(view.world_from_view[1].xyz);
    // A point on the emitter's base, and two more randoms per quad.
    let disc = vec2<f32>(cos(s.y * TAU), sin(s.y * TAU)) * sqrt(s.z);
    let base = vec3<f32>(disc.x * area.x, 0.0, disc.y * area.z);
    let rank = fract(s.x * 7.31 + s.w * 3.17);
    let r = fract(s.z * 5.13 + s.y * 2.71);
    var center = origin;
    var size = vec2<f32>(params.z);
    var tint = color;

    switch kind {
        case 0u: {
            let age = fract(t / (0.55 + 0.5 * s.w) + s.x);
            let lick = vec3<f32>(sin(t * 7.0 + s.x * 40.0), 0.0, cos(t * 6.1 + s.y * 30.0)) * 0.06 * age;
            center = origin + base * (1.0 - 0.75 * age) + vec3<f32>(0.0, age * area.y * (0.6 + 0.6 * r), 0.0)
                + wind.xyz * age * age + lick;
            size = params.z * (0.5 + 0.6 * r) * (1.0 - 0.7 * age) * vec2<f32>(1.0, 1.45);
            // Stand on the base, not half sunk into it.
            center.y += size.y * 0.75;
            let hot = 1.0 - smoothstep(0.0, 0.6, age);
            tint = vec4<f32>(mix(color.rgb, color2.rgb, hot * hot) * smoothstep(0.0, 0.1, age) * (1.0 - age), 0.0);
        }
        case 1u: {
            let age = fract(t / (0.8 + 0.4 * s.w) + s.x);
            center = origin + base * (1.0 + 1.5 * age) + vec3<f32>(0.0, age * area.y, 0.0) + wind.xyz * pow(age, 1.5);
            size = vec2<f32>(params.z * (0.6 + 0.6 * r) * mix(0.3, 1.0, sqrt(age)));
            let a = smoothstep(0.0, 0.2, age) * (1.0 - smoothstep(0.5, 1.0, age)) * color.a;
            tint = vec4<f32>(mix(color2.rgb, color.rgb, smoothstep(0.0, 0.45, age)), a);
            let spin = r * TAU + t * (r - 0.5) * 0.5;
            let x = axis_x * cos(spin) + axis_y * sin(spin);
            axis_y = axis_y * cos(spin) - axis_x * sin(spin);
            axis_x = x;
        }
        case 2u: {
            let age = fract(t / (1.6 + 1.2 * s.w) + s.x);
            let swirl = vec3<f32>(sin(t * 2.1 + s.z * 23.0), 0.0, cos(t * 1.7 + s.y * 19.0)) * age * area.x * 0.8;
            center = origin + base * 0.6 + vec3<f32>(0.0, age * area.y * (0.5 + r), 0.0) + wind.xyz * age + swirl;
            size = vec2<f32>(params.z * (0.4 + 0.9 * r));
            let blink = 0.55 + 0.45 * sin(t * 25.0 + s.w * 70.0);
            tint = vec4<f32>(mix(color2.rgb, color.rgb, age) * blink * (1.0 - age) * smoothstep(0.0, 0.08, age), 0.0);
        }
        case 3u: {
            let p = s.xyz * area.xyz + wind.xyz * (globals.time * params.w + s.w * 10.0);
            center = wrap(p, origin, area.xyz);
            axis_y = normalize(wind.xyz);
            axis_x = normalize(cross(axis_y, eye - center));
            size = vec2<f32>(params.z * 0.025, params.z);
        }
        default: {
            var p = s.xyz * area.xyz + wind.xyz * t;
            p += vec3<f32>(sin(t * 0.7 + s.w * 40.0), 0.5 * sin(t * 0.5 + s.x * 20.0), cos(t * 0.6 + s.y * 30.0)) * 0.3;
            center = wrap(p, origin, area.xyz);
            size = vec2<f32>(params.z * (0.5 + r));
            let twinkle = 0.55 + 0.45 * sin(t * (1.0 + 2.0 * r) + s.z * 60.0);
            tint = vec4<f32>(color.rgb * twinkle, 0.0);
        }
    }
    if rank > params.y {
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

#ifdef DISTANCE_FOG
/// How much of a light at distance `d` the view's fog lets through.
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
#endif

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let q = in.corner * 2.0 - 1.0;
    var keep = 1.0;
    var haze = vec3<f32>(0.0);
#ifdef DISTANCE_FOG
    keep = fog_keep(in.misc.y);
    haze = fog.base_color.rgb;
#endif
    var out = vec4<f32>(0.0);
    switch u32(params.x + 0.5) {
        case 0u: {
            // A soft teardrop, narrowing upward.
            let p = vec2<f32>(q.x * (1.0 + 0.7 * max(q.y, 0.0)), q.y);
            let a = smoothstep(1.0, 0.0, length(p));
            out = vec4<f32>(in.tint.rgb * a * a * keep, 0.0);
        }
        case 1u: {
            // A puff, ragged at the edge.
            let n = vnoise(q * 2.3 + in.misc.x * 37.0);
            let a = smoothstep(1.0, 0.2, length(q)) * (0.45 + 0.55 * n) * in.tint.a;
            out = vec4<f32>(mix(haze, in.tint.rgb, keep) * a, a);
        }
        case 3u: {
            // A streak: soft across, fading at both ends.
            let a = (1.0 - abs(q.x)) * (1.0 - q.y * q.y) * in.tint.a * keep;
            out = vec4<f32>(in.tint.rgb * a, a * 0.5);
        }
        default: {
            // A spark or a speck.
            let a = smoothstep(1.0, 0.0, length(q));
            out = vec4<f32>(in.tint.rgb * a * a * keep, 0.0);
        }
    }
    return out;
}
