// The sky over a diorama (see `examples/cyberpunk/dioramas/materials.rs`): a
// dome around the world, shaded by the view ray, so every camera on the
// layer sees the same sky and a panning camera pans across it. A gradient
// from the horizon (matched to the fog, so the distance melts into it) up to
// the zenith, a sun — or a fire's glow — with its halo, a band of cloud lit
// from below, and stars.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}

// rgb, a = how many stars
@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> zenith: vec4<f32>;
// rgb, a = how much cloud
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var<uniform> horizon: vec4<f32>;
// rgb (HDR), a = the disc's radius in radians (0: a glow without a disc)
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var<uniform> sun: vec4<f32>;
// toward the sun, w = the halo's width in radians
@group(#{MATERIAL_BIND_GROUP}) @binding(3) var<uniform> sun_dir: vec4<f32>;

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

fn fbm(p: vec2<f32>) -> f32 {
    return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.03 + 17.0) + 0.125 * vnoise(p * 4.01 + 31.0);
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let dir = normalize(in.world_position.xyz - view.world_position.xyz);
    let h = dir.y;
    let t = globals.time;

    var rgb = mix(horizon.rgb, zenith.rgb, smoothstep(0.0, 0.5, sqrt(max(h, 0.0))));
    rgb *= 1.0 + min(h, 0.0) * 2.0;

    // The sun: a disc in a halo, and a wide faint glow around both.
    let s = normalize(sun_dir.xyz);
    let ang = acos(clamp(dot(dir, s), -1.0, 1.0));
    let halo = exp(-ang / max(sun_dir.w, 0.001));
    rgb += sun.rgb * (0.14 * halo + 0.012 * exp(-ang / max(sun_dir.w * 5.0, 0.001)));
    if sun.a > 0.0 {
        rgb += sun.rgb * (1.0 - smoothstep(sun.a * 0.88, sun.a, ang));
    }

    // Cloud: long bands low over the horizon, lit from below.
    if horizon.a > 0.0 {
        let az = atan2(dir.x, -dir.z);
        let n = fbm(vec2<f32>(az * 2.5 + t * 0.004, h * 12.0));
        let band = smoothstep(0.0, 0.05, h) * (1.0 - smoothstep(0.2, 0.55, h));
        let c = smoothstep(0.38, 0.72, n) * band * horizon.a;
        let lit = mix(horizon.rgb * 1.5 + sun.rgb * halo * 0.3, zenith.rgb * 0.6, smoothstep(0.0, 0.3, h));
        rgb = mix(rgb, lit, c);
    }

    // Stars, twinkling, fading out toward the horizon's glow.
    if zenith.a > 0.0 {
        let sp = dir.xz / (1.0 + max(h, 0.0)) * 140.0;
        let cell = floor(sp);
        let hs = hash12(cell);
        if hs > 0.97 {
            let at = vec2<f32>(hash12(cell + 3.7), hash12(cell + 9.1)) * 0.6 + 0.2;
            let d = length(fract(sp) - at);
            let tw = 0.6 + 0.4 * sin(t * (1.0 + 3.0 * hs) + hs * 80.0);
            rgb += vec3<f32>(0.9, 0.95, 1.0) * exp(-d * d * 40.0) * tw * zenith.a * smoothstep(0.08, 0.45, h);
        }
    }

    return vec4<f32>(rgb, 1.0);
}
