// Arcana's sky (see `examples/arcana/stage.rs`): deep space behind the card
// table. Everything is computed here from `globals.time` and the view, so the
// CPU does nothing per frame for it; the one uniform is the flare.
//
//   * A violet-to-indigo gradient with a soft vignette.
//   * Nebula: domain-warped fbm (two warp layers) colored violet / teal /
//     rose by the warp fields themselves, so the hues follow the filaments.
//     It drifts very slowly.
//   * Stars: three hashed layers in physical px (crisp at any size), each
//     twinkling on its own clock; the rarest run hot (> 1.0) so the camera's
//     bloom gives them a glint. The camera's sway slides the layers by depth.
//   * Radiance: a breathing golden pool low in the middle — the light the
//     cards are dealt into.
//   * The flare (`bevy.arcana.flare({ hue })`): a shockwave ring in the
//     card's hue racing out from the table, trailing a wash of color.
//     `progress >= 1` is parked: every flare term folds to zero.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}

// `(hue, progress, 0, 0)` — see `CosmosMaterial` in stage.rs.
@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> flare: vec4<f32>;

const SKY_TOP: vec3<f32> = vec3<f32>(0.0030, 0.0024, 0.0100);
const SKY_BOTTOM: vec3<f32> = vec3<f32>(0.0090, 0.0040, 0.0180);
const VIGNETTE: f32 = 0.7;

const VIOLET: vec3<f32> = vec3<f32>(0.30, 0.09, 0.85);
const TEAL: vec3<f32> = vec3<f32>(0.03, 0.42, 0.62);
const ROSE: vec3<f32> = vec3<f32>(0.90, 0.10, 0.36);
const NEBULA_GAIN: f32 = 0.16;
const NEBULA_SCALE: f32 = 1.6;

const GOLD: vec3<f32> = vec3<f32>(1.0, 0.55, 0.18);
const RADIANCE_AT: vec2<f32> = vec2<f32>(0.5, 0.62);
const RADIANCE_GAIN: f32 = 0.05;

const PARALLAX: f32 = 0.5;

fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn vnoise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * (3.0 - 2.0 * f);
    let a = hash12(i);
    let b = hash12(i + vec2<f32>(1.0, 0.0));
    let c = hash12(i + vec2<f32>(0.0, 1.0));
    let d = hash12(i + vec2<f32>(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm(p_in: vec2<f32>) -> f32 {
    var p = p_in;
    var v = 0.0;
    var a = 0.5;
    for (var i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p = p * 2.02 + vec2<f32>(17.1, 9.7);
        a *= 0.5;
    }
    return v;
}

// HSV hue at full saturation: 0 red, 1/6 yellow, 1/3 green, 1/2 cyan, ...
fn hue_color(h: f32) -> vec3<f32> {
    return clamp(abs(fract(h + vec3<f32>(0.0, 0.6667, 0.3333)) * 6.0 - 3.0) - 1.0, vec3<f32>(0.0), vec3<f32>(1.0));
}

// One star layer: at most one star per `cell`-px square, `chance` of cells
// lit, `size` px radius. Returns linear brightness.
fn stars(px: vec2<f32>, cell: f32, chance: f32, size: f32, seed: f32, t: f32) -> f32 {
    let g = px / cell;
    let id = floor(g);
    let h = hash12(id + seed);
    if h > chance {
        return 0.0;
    }
    let at = vec2<f32>(hash12(id + seed + 7.3), hash12(id + seed + 3.9)) * 0.7 + 0.15;
    let d = length((fract(g) - at) * cell);
    let core = exp(-d * d / (size * size));
    let rate = 0.6 + 2.2 * hash12(id + seed + 1.1);
    let twinkle = 0.55 + 0.45 * sin(t * rate + h * 91.0);
    // The rarest few run hot: bloom catches them.
    let hot = select(1.0, 3.5, h < chance * 0.08);
    return core * twinkle * hot;
}

struct FragmentOutput {
    @location(0) color: vec4<f32>,
    // Pinned to the reverse-Z far plane: the sky always loses the depth test.
    @builtin(frag_depth) depth: f32,
}

@fragment
fn fragment(in: VertexOutput) -> FragmentOutput {
    let px = in.position.xy - view.viewport.xy;
    let uv = px / view.viewport.zw;
    let aspect = view.viewport.z / view.viewport.w;
    let t = globals.time;
    let p = vec2<f32>(uv.x * aspect, uv.y);

    var rgb = mix(SKY_TOP, SKY_BOTTOM, uv.y);
    let v = (uv - 0.5) * vec2<f32>(1.0, 1.2);
    let vignette = 1.0 - VIGNETTE * dot(v, v);

    // Nebula: two layers of domain warp; the warp fields pick the hues.
    let np = p * NEBULA_SCALE + vec2<f32>(t * 0.006, -t * 0.004);
    let q = vec2<f32>(fbm(np), fbm(np + vec2<f32>(5.2, 1.3)));
    let r = vec2<f32>(
        fbm(np + 3.0 * q + vec2<f32>(1.7, 9.2) + t * 0.005),
        fbm(np + 3.0 * q + vec2<f32>(8.3, 2.8)),
    );
    let n = fbm(np + 2.6 * r);
    var cloud = mix(VIOLET, TEAL, smoothstep(0.35, 0.75, q.x));
    cloud = mix(cloud, ROSE, smoothstep(0.55, 0.9, r.y) * 0.8);
    let density = smoothstep(0.38, 0.95, n);
    rgb += cloud * density * density * NEBULA_GAIN * (0.6 + 0.8 * r.x);

    // Radiance under the table, breathing.
    let rd = (p - vec2<f32>(RADIANCE_AT.x * aspect, RADIANCE_AT.y)) * vec2<f32>(0.8, 1.6);
    let breathe = 0.85 + 0.15 * sin(t * 0.5);
    rgb += GOLD * exp(-dot(rd, rd) * 3.0) * RADIANCE_GAIN * breathe;
    rgb += VIOLET * exp(-dot(rd, rd) * 0.9) * 0.025;

    rgb *= vignette;

    // Stars, slid by the camera's sway (nearer layers slide further).
    let forward = -view.world_from_view[2].xyz;
    let slide = forward.xy * view.viewport.w * PARALLAX;
    let star_tint = mix(vec3<f32>(0.75, 0.82, 1.0), vec3<f32>(1.0, 0.9, 0.75), hash12(floor(px / 7.0)));
    let s = stars(px + slide * 0.3, 9.0, 0.05, 0.55, 1.0, t)
        + stars(px + slide * 0.6, 23.0, 0.10, 0.9, 7.0, t)
        + stars(px + slide, 61.0, 0.22, 1.4, 13.0, t) * 1.3;
    rgb += star_tint * s * (0.45 + 0.55 * vignette);

    // The flare.
    let f = flare.y;
    if f < 1.0 {
        let tint = hue_color(flare.x);
        let eased = 1.0 - pow(1.0 - f, 2.4);
        let radius = eased * 1.7;
        let fade = (1.0 - f) * (1.0 - f);
        let d = length(vec2<f32>((uv.x - RADIANCE_AT.x) * aspect, uv.y - RADIANCE_AT.y));
        let width = 0.16 * (1.0 - 0.5 * eased);
        let front = (d - radius) / width;
        let ring = exp(-front * front);
        let trail = select(0.0, exp(-(radius - d) * 2.2), d < radius);
        rgb += tint * (ring * 1.4 + trail * 0.45 + density * 0.6) * fade * 0.35;
    }

    rgb += (hash12(px + fract(t) * 289.0) - 0.5) * (2.0 / 255.0);
    return FragmentOutput(vec4<f32>(max(rgb, vec3<f32>(0.0)), 1.0), 0.0);
}
