// Atrium's lake (see `examples/atrium/world/water.rs`). A mirror camera
// films the world from below the surface into `reflection`; this shader
// samples it at the fragment's own screen position (flipped — the mirror
// camera is upright), bent by the ripples, and mixes it with the deep water
// by Fresnel. The sun lays a glittering path across it (HDR, so it blooms)
// and rain rings the surface.
//
// `params.x` = 1 when `reflection` belongs to this view (the main camera);
// other views (the lenses) reflect the sky gradient instead.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}
#import atrium::common::{Atmos, apply_fog, hash22, noise2, sky_gradient}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> atmos: Atmos;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var<uniform> params: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var reflection: texture_2d<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(3) var reflection_sampler: sampler;

// The surface height: long slow swells plus fine wind ripples.
fn height(p: vec2<f32>, t: f32) -> f32 {
    var h = 0.0;
    h += sin(dot(p, vec2<f32>(0.21, 0.13)) + t * 0.6) * 0.035;
    h += sin(dot(p, vec2<f32>(-0.17, 0.29)) + t * 0.8) * 0.025;
    h += (noise2(p * 0.9 + vec2<f32>(t * 0.35, t * 0.1)) - 0.5) * 0.05;
    h += (noise2(p * 2.7 - vec2<f32>(t * 0.5, -t * 0.3)) - 0.5) * 0.02;
    return h;
}

// Expanding rings where raindrops land, as a normal offset.
fn rain_rings(p: vec2<f32>, t: f32) -> vec2<f32> {
    var n = vec2<f32>(0.0);
    for (var layer = 0; layer < 2; layer++) {
        let q = p * select(1.4, 2.3, layer == 1) + f32(layer) * 13.7;
        let cell = floor(q);
        for (var j = -1; j <= 1; j++) {
            for (var i = -1; i <= 1; i++) {
                let c = cell + vec2<f32>(f32(i), f32(j));
                let rnd = hash22(c);
                let center = c + rnd;
                let phase = fract(t * 0.8 + rnd.x * 7.0);
                let r = phase * 0.9;
                let off = q - center;
                let dist = length(off);
                let ring = sin((dist - r) * 28.0) * smoothstep(0.12, 0.0, abs(dist - r)) * (1.0 - phase);
                n += off / max(dist, 1e-3) * ring;
            }
        }
    }
    return n * 0.18;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let t = globals.time;
    let p = in.world_position.xyz;
    let to_frag = p - view.world_position;
    let dist = length(to_frag);
    let v = -to_frag / dist;

    // Ripple normal by finite differences; flatter in the distance, where
    // fine ripples would only alias.
    let e = 0.05;
    let h0 = height(p.xz, t);
    let hx = height(p.xz + vec2<f32>(e, 0.0), t);
    let hz = height(p.xz + vec2<f32>(0.0, e), t);
    let calm = 1.0 / (1.0 + dist * 0.03);
    var slope = vec2<f32>(hx - h0, hz - h0) / e * calm;
    let rain = atmos.water.w;
    if rain > 0.01 && dist < 60.0 {
        slope += rain_rings(p.xz, t) * rain * smoothstep(60.0, 10.0, dist);
    }
    let n = normalize(vec3<f32>(-slope.x, 1.0, -slope.y));

    let cos_t = clamp(dot(n, v), 0.0, 1.0);
    let fresnel = 0.02 + 0.98 * pow(1.0 - cos_t, 5.0);

    var refl: vec3<f32>;
    if params.x > 0.5 {
        let screen = in.position.xy / view.viewport.zw;
        let bend = n.xz * 0.06 / (1.0 + dist * 0.015);
        let uv = clamp(vec2<f32>(screen.x, 1.0 - screen.y) + bend, vec2<f32>(0.001), vec2<f32>(0.999));
        refl = textureSampleLevel(reflection, reflection_sampler, uv, 0.0).rgb;
    } else {
        refl = sky_gradient(atmos, reflect(-v, n));
    }

    // The deep lake: its own color, a little lighter toward the viewer.
    let deep = atmos.water.rgb * (0.7 + 0.3 * cos_t);
    var c = mix(deep, refl, clamp(fresnel * 1.15, 0.0, 1.0));

    // The sun's path: sharp glints on the ripples plus a softer sheen.
    let r = reflect(-v, n);
    let s = atmos.sun_dir.xyz;
    let mu = max(dot(r, s), 0.0);
    let clear = 1.0 - atmos.sun.w * 0.9;
    let sun_up = smoothstep(-0.02, 0.05, s.y);
    // A high sun's path is short and steep; keep it from blooming into a
    // blob right under you.
    let high = 1.0 - 0.6 * smoothstep(0.2, 0.7, s.y);
    c += atmos.sun.rgb * (pow(mu, 1200.0) * 0.45 + pow(mu, 220.0) * 0.02) * clear * sun_up * high;
    // The moon's path, at night.
    let m = atmos.moon_dir;
    let mm = max(dot(r, m.xyz), 0.0);
    c += vec3<f32>(0.8, 0.85, 1.0) * pow(mm, 600.0) * 1.2 * m.w * clear;

    c = apply_fog(atmos, c, -v, dist);
    return vec4<f32>(c, 1.0);
}
