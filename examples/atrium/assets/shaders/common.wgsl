// Shared by Atrium's world shaders (`examples/atrium/world/`): the sky
// palette uniform, hash noise, the sky's color in any direction, and the
// aerial-perspective fog that melts the land into that sky.
//
// Every world material binds one `Atmos` at binding 0; the Rust side
// (`world/palette.rs`) eases it from moment to moment, so a whole world
// re-lights by writing one small uniform.

#define_import_path atrium::common

struct Atmos {
    // Sky gradient: straight up, partway up, at the horizon, and the glow
    // the sun casts along the horizon around it (w = glow width).
    zenith: vec4<f32>,
    // Fifteen-odd degrees up: where the horizon's warmth turns to sky.
    mid: vec4<f32>,
    horizon: vec4<f32>,
    glow: vec4<f32>,
    // xyz = direction to the sun (unit), w = sun disk visibility.
    sun_dir: vec4<f32>,
    // The sun disk (HDR — it blooms), w = cloud cover 0..1.
    sun: vec4<f32>,
    // Light the sun casts on the land (rgb), w = star visibility 0..1.
    sun_light: vec4<f32>,
    // Skylight in the shadows (rgb), w = snow cover on the land 0..1.
    ambient: vec4<f32>,
    // The color distance melts into, w = fog density.
    fog: vec4<f32>,
    // Deep lake color, w = rain 0..1.
    water: vec4<f32>,
    // Cloud color on the lit side, w = aurora 0..1.
    cloud_lit: vec4<f32>,
    // Cloud color on the shaded side, w = snowfall 0..1.
    cloud_shade: vec4<f32>,
    // xyz = direction to the moon, w = moon visibility.
    moon_dir: vec4<f32>,
}

fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn hash22(p: vec2<f32>) -> vec2<f32> {
    var p3 = fract(vec3<f32>(p.xyx) * vec3<f32>(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

fn hash13(p: vec3<f32>) -> f32 {
    var p3 = fract(p * 0.1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

// Value noise, smooth, 0..1.
fn noise2(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    let a = hash12(i);
    let b = hash12(i + vec2<f32>(1.0, 0.0));
    let c = hash12(i + vec2<f32>(0.0, 1.0));
    let d = hash12(i + vec2<f32>(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm2(p: vec2<f32>) -> f32 {
    var v = 0.0;
    var a = 0.5;
    var q = p;
    for (var i = 0; i < 5; i++) {
        v += a * noise2(q);
        q = q * 2.03 + vec2<f32>(17.1, 9.2);
        a *= 0.5;
    }
    return v;
}

fn luma(c: vec3<f32>) -> f32 {
    return dot(c, vec3<f32>(0.2126, 0.7152, 0.0722));
}

// The sky's own color in direction `d` (no sun disk, stars or clouds): the
// zenith→horizon gradient plus the sun's glow hugging the horizon. The land's
// fog fades toward exactly this, so distant ridges melt into the sky behind
// them instead of into one flat fog color.
fn sky_gradient(a: Atmos, d: vec3<f32>) -> vec3<f32> {
    let h = clamp(d.y, -1.0, 1.0);
    var c = mix(a.horizon.rgb, a.mid.rgb, smoothstep(0.0, 0.2, h));
    c = mix(c, a.zenith.rgb, smoothstep(0.1, 0.75, h));
    // Below the horizon (seen only past the far ridges): the horizon, deeper.
    c = mix(c, a.horizon.rgb * 0.82, smoothstep(0.0, -0.25, h));
    let s = a.sun_dir.xyz;
    let toward = max(dot(normalize(vec3<f32>(d.x, 0.0, d.z) + vec3<f32>(0.0, 1e-4, 0.0)),
        normalize(vec3<f32>(s.x, 0.0, s.z) + vec3<f32>(0.0, 1e-4, 0.0))), 0.0);
    // The glow is widest and warmest while the sun is low.
    let low = 1.0 - smoothstep(0.0, 0.45, abs(s.y));
    let band = exp(-abs(h) * mix(16.0, 9.0, low)) * pow(toward, mix(16.0, 4.0, a.glow.w));
    c += a.glow.rgb * band * low * 0.75;
    // Around the sun itself, at any height.
    let mu = max(dot(d, s), 0.0);
    c += a.glow.rgb * (pow(mu, 28.0) * 0.22 + pow(mu, 260.0) * 0.55) * (0.3 + 0.7 * low);
    return c;
}

// Aerial perspective: land at `dist` meters in direction `d` fades into the
// sky behind it.
fn apply_fog(a: Atmos, color: vec3<f32>, d: vec3<f32>, dist: f32) -> vec3<f32> {
    let k = 1.0 - exp(-dist * a.fog.w);
    let behind = mix(a.fog.rgb, sky_gradient(a, vec3<f32>(d.x, max(d.y, 0.0) * 0.3, d.z)), 0.6);
    return mix(color, behind, clamp(k, 0.0, 1.0));
}
