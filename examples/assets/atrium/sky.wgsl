// Atrium's sky dome (see `examples/atrium/world/sky.rs`): a sphere around
// the viewer, painted entirely here from the `Atmos` palette — gradient,
// sun and moon, stars and the Milky Way, drifting clouds, and aurora
// curtains. The sun and the aurora go above 1.0 (HDR) so they bloom.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}
#import atrium::common::{Atmos, fbm2, hash13, luma, noise2, sky_gradient}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> atmos: Atmos;

// A star field: one candidate star per cell of a direction grid.
fn stars(d: vec3<f32>, t: f32) -> vec3<f32> {
    var c = vec3<f32>(0.0);
    for (var layer = 0; layer < 2; layer++) {
        let scale = select(240.0, 520.0, layer == 1);
        let p = d * scale;
        let cell = floor(p);
        let r = hash13(cell + f32(layer) * 71.0);
        // More stars along the Milky Way.
        let n = normalize(vec3<f32>(0.35, 0.55, 0.76));
        let in_band = exp(-pow(dot(d, n), 2.0) * 18.0);
        let threshold = 0.86 - in_band * 0.08;
        if r > threshold {
            let center = cell + vec3<f32>(hash13(cell + 1.3), hash13(cell + 2.7), hash13(cell + 5.1));
            let dist = length(p - center);
            let size = select(0.14, 0.1, layer == 1);
            let twinkle = 0.65 + 0.35 * sin(t * (1.5 + r * 3.0) + r * 40.0);
            let bright = pow((r - threshold) / (1.0 - threshold), 3.0) * select(9.0, 3.5, layer == 1);
            let tint = mix(vec3<f32>(0.75, 0.82, 1.0), vec3<f32>(1.0, 0.86, 0.7), hash13(cell + 9.0));
            c += tint * bright * twinkle * smoothstep(size, 0.0, dist);
        }
    }
    return c;
}

// The Milky Way: a narrow band of fine dust along a tilted great circle,
// split by dark lanes, warmer at its core.
fn milky_way(d: vec3<f32>) -> vec3<f32> {
    let n = normalize(vec3<f32>(0.35, 0.55, 0.76));
    let off = dot(d, n);
    let band = exp(-off * off * 55.0);
    let q = vec2<f32>(atan2(d.z, d.x) * 9.0, off * 30.0);
    let dust = fbm2(q * 1.6);
    let lanes = smoothstep(0.45, 0.7, fbm2(q * 2.2 + 7.0)) * smoothstep(0.12, 0.0, abs(off));
    let core = exp(-off * off * 300.0);
    let tint = mix(vec3<f32>(0.6, 0.66, 0.9), vec3<f32>(0.95, 0.85, 0.75), core);
    return tint * band * pow(dust, 3.0) * (1.0 - lanes * 0.85) * 0.5;
}

// Clouds on a flat layer overhead: fbm coverage, lit toward the sun.
fn clouds(d: vec3<f32>, t: f32) -> vec4<f32> {
    let cover = atmos.sun.w;
    if d.y <= 0.0 || cover <= 0.01 {
        return vec4<f32>(0.0);
    }
    let uv = d.xz / (d.y + 0.12) * 1.6 + vec2<f32>(t * 0.012, t * 0.004);
    let n = fbm2(uv);
    // Clear sky this far below the threshold even at full detail: skip it.
    if n * 0.8 + 0.25 < 1.0 - cover {
        return vec4<f32>(0.0);
    }
    let detail = fbm2(uv * 3.0 + 4.0);
    let density = smoothstep(1.0 - cover, 1.0 - cover + 0.35, n * 0.8 + detail * 0.25);
    // Thin out toward the horizon so the layer reads as distant.
    let fade = smoothstep(0.0, 0.18, d.y);
    let s = atmos.sun_dir.xyz;
    let lit = clamp(0.5 + 0.5 * dot(normalize(vec3<f32>(d.x, 0.0, d.z) + 1e-4), normalize(vec3<f32>(s.x, 0.0, s.z) + 1e-4)), 0.0, 1.0);
    let thick = smoothstep(0.2, 1.0, density);
    var c = mix(atmos.cloud_lit.rgb, atmos.cloud_shade.rgb, thick * 0.8 + (1.0 - lit) * 0.3);
    // Silver lining where the sun is behind thin cloud.
    let mu = max(dot(d, s), 0.0);
    c += atmos.glow.rgb * pow(mu, 8.0) * (1.0 - thick) * 0.8;
    return vec4<f32>(c, density * fade);
}

// Aurora: curtains of light hung across the northern sky (+X) and over
// you — each a wavering lower edge in (azimuth, elevation), bright green
// there, fading up through teal into violet, combed by vertical rays.
fn aurora(d: vec3<f32>, t: f32) -> vec3<f32> {
    let amount = atmos.cloud_lit.w;
    if amount <= 0.01 || d.y <= 0.0 {
        return vec3<f32>(0.0);
    }
    let az = atan2(d.z, d.x);
    let el = asin(clamp(d.y, 0.0, 1.0));
    var c = vec3<f32>(0.0);
    for (var i = 0; i < 3; i++) {
        let fi = f32(i);
        let edge = 0.16 + fi * 0.13
            + 0.06 * sin(az * (2.0 + fi) + t * 0.05 + fi * 2.1)
            + 0.03 * sin(az * (7.0 + fi * 2.0) - t * 0.09 + fi);
        let above = el - edge;
        let curtain = smoothstep(-0.012, 0.004, above) * exp(-max(above, 0.0) * (7.0 - fi * 1.5));
        let rays = 0.45 + 0.55 * noise2(vec2<f32>(az * (70.0 + fi * 20.0) + t * 0.25, fi * 7.0 + t * 0.05));
        let fold = 0.6 + 0.4 * sin(az * (11.0 + fi * 5.0) + t * 0.12 + fi * 3.0);
        let top = clamp(above * 4.0, 0.0, 1.0);
        let col = mix(vec3<f32>(0.1, 1.0, 0.45), mix(vec3<f32>(0.1, 0.75, 0.9), vec3<f32>(0.6, 0.25, 1.0), top), top);
        c += col * curtain * rays * fold * (1.0 - fi * 0.25);
    }
    // Strongest to the north, still there overhead and ahead.
    let north = 0.35 + 0.65 * smoothstep(-0.6, 0.8, normalize(vec3<f32>(d.x, 0.0, d.z) + 1e-4).x);
    return c * north * amount * 1.6;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let d = normalize(in.world_position.xyz - view.world_position);
    let t = globals.time;
    var c = sky_gradient(atmos, d);

    // Night sky, behind everything else.
    let night = atmos.sun_light.w;
    if night > 0.001 && d.y > -0.02 {
        let horizon_fade = smoothstep(-0.02, 0.15, d.y);
        c += (stars(d, t) + milky_way(d)) * night * horizon_fade * (1.0 - atmos.sun.w * 0.85);
    }
    c += aurora(d, t);

    // The moon: a soft disk with a faint halo.
    let m = atmos.moon_dir;
    if m.w > 0.001 {
        let mu = dot(d, m.xyz);
        let disk = smoothstep(0.99975, 0.99985, mu);
        let shade = 0.82 + 0.18 * noise2(d.xz * 900.0);
        c += vec3<f32>(1.0, 0.97, 0.9) * disk * shade * 2.2 * m.w;
        c += vec3<f32>(0.5, 0.55, 0.7) * pow(max(mu, 0.0), 400.0) * 0.25 * m.w;
    }

    // The sun disk, HDR so it blooms; limb-darkened.
    let s = atmos.sun_dir;
    let mu = dot(d, s.xyz);
    let disk = smoothstep(0.99955, 0.9997, mu);
    c += atmos.sun.rgb * disk * s.w;

    let cl = clouds(d, t);
    c = mix(c, cl.rgb, cl.a);

    // Overcast skies swallow the sun's glare.
    let cover = atmos.sun.w;
    c = mix(c, mix(c, vec3<f32>(luma(c)), 0.35), smoothstep(0.6, 1.0, cover));
    return vec4<f32>(c, 1.0);
}
