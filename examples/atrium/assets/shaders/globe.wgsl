// The Skies app's globe (see `examples/atrium/globe.rs`): continents as a
// field of dots (from `land.png`, Natural Earth, public domain), lit by the
// sun of the moment you borrowed — the day/night line is where it really is
// at that hour — with city lights on the night side and a ring pulsing
// around the chosen place. The rim and the lights go above 1.0 and bloom.
//
// Uniforms:
//   to_local = world → globe-local rotation (the globe's normal → lat/lon)
//   sun      = xyz: the sun in globe-local space, w: time (s)
//   focus    = xyz: the chosen place in globe-local space, w: 0..1 just-picked pulse

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::view,
}

struct Globe {
    to_local: mat4x4<f32>,
    sun: vec4<f32>,
    focus: vec4<f32>,
}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> globe: Globe;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var land: texture_2d<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var land_sampler: sampler;

const PI: f32 = 3.14159265;
/// Dot spacing, radians of latitude.
const STEP: f32 = 0.026;

fn hash(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn is_land(lat: f32, lon: f32) -> f32 {
    let uv = vec2<f32>(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);
    return textureSampleLevel(land, land_sampler, uv, 0.0).r;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let n_world = normalize(in.world_normal);
    let n = normalize((globe.to_local * vec4<f32>(n_world, 0.0)).xyz);
    let lat = asin(clamp(n.y, -1.0, 1.0));
    let lon = atan2(n.x, n.z);

    // The dot under this fragment: rows of latitude, columns spaced so dots
    // stay evenly apart toward the poles.
    let row = round(lat / STEP);
    let row_lat = row * STEP;
    let cols = max(floor(2.0 * PI * cos(row_lat) / STEP), 1.0);
    let col = round((lon / (2.0 * PI)) * cols);
    let dot_lon = col / cols * 2.0 * PI;
    let d_lat = lat - row_lat;
    var d_lon = lon - dot_lon;
    d_lon = d_lon - 2.0 * PI * round(d_lon / (2.0 * PI));
    let dist = length(vec2<f32>(d_lat, d_lon * cos(lat))) / STEP;
    let aa = fwidth(dist) * 1.2;
    let land_here = step(0.5, is_land(row_lat, dot_lon));
    let on_dot = (1.0 - smoothstep(0.32 - aa, 0.32 + aa, dist)) * land_here;

    let v = normalize(view.world_position - in.world_position.xyz);
    let sun_l = normalize(globe.sun.xyz);
    let day = smoothstep(-0.08, 0.2, dot(n, sun_l));

    // Ocean: deep glassy blue by day, near black by night.
    var c = mix(vec3<f32>(0.004, 0.008, 0.02), vec3<f32>(0.012, 0.045, 0.11), day);
    // Land dots: bright by day, dim by night, with cities lit.
    let seed = hash(vec2<f32>(row, col));
    let city = step(0.72, seed) * (1.0 - day);
    let lit = mix(vec3<f32>(0.05, 0.07, 0.12), vec3<f32>(0.75, 0.92, 1.0) * 0.9, day);
    c = mix(c, lit + vec3<f32>(1.9, 1.25, 0.55) * city * (0.6 + 0.4 * seed), on_dot);
    // The twilight line glows faintly warm.
    let dusk = exp(-abs(dot(n, sun_l)) * 18.0);
    c += vec3<f32>(0.35, 0.16, 0.08) * dusk * 0.4;

    // The chosen place: a ring breathing outward, brighter just after a pick.
    let f = normalize(globe.focus.xyz);
    let ang = acos(clamp(dot(n, f), -1.0, 1.0));
    let t = globe.sun.w;
    let pulse = fract(t * 0.6);
    let ring_r = 0.045 + pulse * 0.07;
    let ring = smoothstep(0.006, 0.0, abs(ang - ring_r)) * (1.0 - pulse);
    let core = smoothstep(0.022, 0.012, ang);
    c += vec3<f32>(1.0, 0.8, 0.5) * (ring * (1.2 + globe.focus.w * 2.0) + core * 2.2);

    // Atmosphere: a rim of light, blue on the day side.
    let rim = pow(1.0 - clamp(dot(n_world, v), 0.0, 1.0), 3.0);
    c += mix(vec3<f32>(0.05, 0.1, 0.3), vec3<f32>(0.35, 0.75, 1.6), day) * rim;
    return vec4<f32>(c, 1.0);
}
