// Full-screen backdrop for the ambient scene (see
// `examples/demos/scenes/ambient.rs`): a gentle aurora — three soft light
// curtains waving across a starry night sky. Everything is computed here from
// `globals.time` + the view uniform; the material has no bindings and the CPU
// does nothing per frame.
//
//   * Curtain ribbons are fbm-warped curves across the screen; each has a
//     bright core with haze that bleeds mostly upward (real curtains glow at
//     the bottom edge and fade up) plus slow vertical shimmer streaks.
//   * The whole field sweeps continuously in one direction (leftward): every
//     x-dependent noise sample reads from `p.x + t·speed`, with higher layers
//     sweeping slightly faster for depth; the shape morphing on top is much
//     slower than the sweep, so the translation always dominates.
//   * The palette is a classic aurora ramp (teal-green low, cyan mid, violet
//     high) with a very slow hue breathing, deliberately muted — this is a
//     backdrop, not the star of the show.
//   * The camera's forward vector slides the sky (fake parallax): dragging or
//     auto-orbiting the otherwise unused 3D camera moves the field, stars
//     less than curtains.
//   * A ±1/255 animated hash dither hides banding on the dark sky gradients.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}

// Overall brightness of the curtains ("gentle" knob).
const INTENSITY: f32 = 0.55;
// How fast the field sweeps across the sky (pattern units per second — the
// visible screen is ~1.5 units wide) and how fast shapes morph while sweeping.
const SWEEP_SPEED: f32 = 0.045;
const MORPH_SPEED: f32 = 0.012;
// How far the camera forward vector slides the sky, in pattern units.
const PARALLAX_STRENGTH: f32 = 0.18;
// Night-sky gradient endpoints (top → bottom of the screen).
const SKY_TOP: vec3<f32> = vec3<f32>(0.008, 0.010, 0.030);
const SKY_BOTTOM: vec3<f32> = vec3<f32>(0.030, 0.022, 0.060);
// Curtain colors, low → high layer (teal-green, cyan, violet).
const CURTAIN_COLORS: array<vec3<f32>, 3> = array<vec3<f32>, 3>(
    vec3<f32>(0.10, 0.85, 0.45),
    vec3<f32>(0.15, 0.55, 0.85),
    vec3<f32>(0.55, 0.25, 0.85),
);

// Cheap 2D→1D hash (Dave Hoskins' hash12) — noise lattice, stars, dither.
fn hash12(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Smooth value noise over an integer lattice.
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

// Three-octave fbm, output roughly 0..1.
fn fbm(p: vec2<f32>) -> f32 {
    return 0.533 * vnoise(p) + 0.267 * vnoise(p * 2.03 + 17.3) + 0.133 * vnoise(p * 4.01 + 41.7);
}

struct FragmentOutput {
    @location(0) color: vec4<f32>,
    // Pinned to the reverse-Z far plane: the backdrop always loses the depth
    // test to real scene geometry, so it can never clip anything regardless of
    // camera zoom or scene extents. The quad's world placement only provides
    // pixel coverage.
    @builtin(frag_depth) depth: f32,
}

@fragment
fn fragment(in: VertexOutput) -> FragmentOutput {
    let uv = (in.position.xy - view.viewport.xy) / view.viewport.zw;
    let aspect = view.viewport.z / view.viewport.w;
    let sweep = globals.time * SWEEP_SPEED;
    let morph = globals.time * MORPH_SPEED;

    // Camera forward in world space; its x/y sway with orbit yaw/pitch and
    // feed the fake parallax (continuous — no wrap jump, unlike raw angles).
    let forward = -view.world_from_view[2].xyz;
    let par = forward.xy * PARALLAX_STRENGTH;

    // Aspect-corrected sky coordinates; y runs down the screen.
    let p = vec2<f32>(uv.x * aspect, uv.y) + par;

    // Night-sky gradient, darkest at the top where the curtains live.
    var rgb = mix(SKY_TOP, SKY_BOTTOM, uv.y);

    // Stars: sparse jittered points on a coarse grid, slow twinkle. They get
    // the full parallax offset, sitting "behind" the curtains.
    let sgrid = (p + par * 0.5) * 28.0;
    let scell = floor(sgrid);
    let srnd = hash12(scell + 7.7);
    if srnd > 0.93 {
        let jitter = vec2<f32>(hash12(scell + 3.1), hash12(scell + 5.2)) * 0.6 + 0.2;
        let sd = length(fract(sgrid) - jitter);
        let twinkle = 0.55 + 0.45 * sin(globals.time * (0.6 + srnd * 1.8) + srnd * 40.0);
        rgb += vec3<f32>(0.85, 0.9, 1.0) * exp(-sd * sd * 220.0) * 0.5 * twinkle;
    }

    // Three curtain layers, low/bright to high/faint.
    var curtains = CURTAIN_COLORS;
    for (var i = 0u; i < 3u; i++) {
        let fi = f32(i);
        // The layer's continuously-swept x coordinate: one direction, always;
        // higher layers sweep a touch faster for depth parallax.
        let xs = p.x + sweep * (1.0 + 0.35 * fi);
        // The ribbon's height across the screen: an fbm-warped curve that
        // translates with the sweep and only slowly changes shape.
        let warp = fbm(vec2<f32>(xs * 1.3 + fi * 9.0, morph + fi * 23.0));
        let yc = 0.20 + 0.16 * fi + (warp - 0.5) * 0.55;
        let d = p.y - yc;
        // Bright core at the ribbon; haze bleeding mostly upward (d < 0).
        var glow = exp(-d * d * 160.0) * 0.9;
        glow += exp(-abs(d) * 5.0) * select(0.18, 0.42, d < 0.0);
        // Vertical shimmer columns riding along with the same sweep.
        let streak = 0.55 + 0.45 * fbm(vec2<f32>(xs * 5.0 + fi * 31.0 + warp * 1.5, morph * 3.0));
        // Faint slow color breathing so the curtain never looks frozen.
        let breathe = 0.85 + 0.15 * sin(globals.time * 0.11 + fi * 2.1);
        rgb += curtains[i] * glow * streak * breathe * INTENSITY * (1.0 - 0.22 * fi);
    }

    // Animated ±1/255 dither so the dark sky doesn't band.
    rgb += (hash12(in.position.xy + fract(globals.time) * 289.0) - 0.5) * (2.0 / 255.0);

    return FragmentOutput(vec4<f32>(rgb, 1.0), 0.0);
}
