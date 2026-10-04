// Full-screen backdrop for every scene (see `examples/demos/scenes/ambient.rs`):
// a dark studio lit by two coloured gel lights — React's cyan from the upper
// left, Bevy's ember from the lower right — with dust drifting through the
// beams. Everything is computed here from `globals.time` + the view uniform,
// so the CPU does nothing per frame for it; the material's one uniform is the
// burst below.
//
//   * The studio is a near-black vertical gradient with a soft vignette — the
//     UI's surfaces sit one step above it.
//   * Each gel light is a wide soft pool that drifts and breathes very slowly
//     (periods of tens of seconds), its body broken up by slowly churning
//     haze so it reads as light in air, not a flat gradient.
//   * Dust motes: two depth layers of soft specks rising slowly, visible only
//     where a light falls on them and tinted by it — near specks larger,
//     blurrier and faster. The camera's forward vector slides them (fake
//     parallax), so the orbiting 3D camera gives the air a little depth.
//   * A ±1/255 animated hash dither hides banding on the dark gradients.
//   * On top sits the **burst**: a one-shot shockwave fired from React
//     (`bevy.nebula.burst({ hue })`, see the home page's "Typed messages"
//     tile). The material's single uniform carries `(hue, progress)` and the
//     CPU only writes it while a burst is playing — `progress >= 1` means "no
//     burst", and every term below folds to zero there.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}

// `(hue, progress, 0, 0)` — see `AmbientMaterial` in
// `examples/demos/scenes/ambient.rs`. `progress` runs 0→1 over the burst and
// parks at 1.0 when there is none.
@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> burst: vec4<f32>;

// Studio gradient endpoints (top → bottom of the screen), linear RGB.
const STUDIO_TOP: vec3<f32> = vec3<f32>(0.0036, 0.0040, 0.0056);
const STUDIO_BOTTOM: vec3<f32> = vec3<f32>(0.0060, 0.0064, 0.0084);
// How much the corners darken (0 = no vignette).
const VIGNETTE: f32 = 0.55;
// The two gels, linear RGB at full strength (cyan #5cd9ff, ember #ff8a4c).
const CYAN: vec3<f32> = vec3<f32>(0.105, 0.694, 1.0);
const EMBER: vec3<f32> = vec3<f32>(1.0, 0.254, 0.072);
// Peak pool brightness of each gel ("how lit is the studio" knob), and of
// its hot core — the bright leak right at the light's corner that makes the
// pool read as light, not fog.
const CYAN_GAIN: f32 = 0.050;
const EMBER_GAIN: f32 = 0.034;
const CYAN_CORE: f32 = 0.10;
const EMBER_CORE: f32 = 0.09;
const CORE_FALLOFF: f32 = 3.2;
// Pool centres, as offsets from the top-left (cyan) and bottom-right (ember)
// screen corners in aspect-corrected uv, and radii.
const CYAN_AT: vec2<f32> = vec2<f32>(0.05, -0.05);
const EMBER_AT: vec2<f32> = vec2<f32>(0.0, 0.08);
const CYAN_RADIUS: f32 = 0.95;
const EMBER_RADIUS: f32 = 0.90;
// How far the pools wander, and how fast (radians per second).
const DRIFT: f32 = 0.10;
const DRIFT_SPEED: f32 = 0.045;
// Haze: how strongly it breaks up the pools, its scale and churn speed.
const HAZE: f32 = 0.45;
const HAZE_SCALE: f32 = 2.2;
const HAZE_SPEED: f32 = 0.018;
// Dust: brightness, rise speed (uv per second) of the far layer, and how
// strongly the camera slides the layers.
const DUST_GAIN: f32 = 0.55;
const DUST_RISE: f32 = 0.008;
const PARALLAX_STRENGTH: f32 = 0.06;
// The burst's shockwave: reach (uv), ring width, ring/trail gains, decay.
const BURST_REACH: f32 = 1.5;
const BURST_RING_WIDTH: f32 = 0.20;
const BURST_RING_GAIN: f32 = 1.6;
const BURST_TRAIL_GAIN: f32 = 0.35;
const BURST_TRAIL_DECAY: f32 = 2.6;

// A saturated color for a 0..1 hue, as a cheap cosine palette (Inigo Quilez).
fn hue_color(h: f32) -> vec3<f32> {
    return 0.55 + 0.45 * cos(6.28318 * (h + vec3<f32>(0.0, 0.33, 0.67)));
}

// Cheap 2D→1D hash (Dave Hoskins' hash12) — only ever fed exact integer
// lattice coords (or a pixel position, for the dither).
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

// A soft light pool: 1 at the centre, a long gaussian tail.
fn pool(p: vec2<f32>, center: vec2<f32>, radius: f32) -> f32 {
    let d = (p - center) / radius;
    return exp(-dot(d, d) * 2.2);
}

// One layer of dust: soft specks on a jittered grid of `cells` per uv unit,
// most cells empty. Returns coverage 0..1.
fn dust(p: vec2<f32>, cells: f32, size: f32, blur: f32, seed: f32) -> f32 {
    let g = p * cells;
    let cell = floor(g);
    let rnd = hash12(cell + seed);
    if rnd < 0.82 {
        return 0.0;
    }
    let jitter = vec2<f32>(hash12(cell + seed + 3.1), hash12(cell + seed + 5.2)) * 0.7 + 0.15;
    let d = length(fract(g) - jitter);
    let twinkle = 0.6 + 0.4 * sin(globals.time * (0.4 + rnd * 0.9) + rnd * 50.0);
    return (1.0 - smoothstep(size, size + blur, d)) * twinkle;
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
    let t = globals.time;
    // Aspect-corrected screen coordinates; y runs down the screen.
    let p = vec2<f32>(uv.x * aspect, uv.y);

    // The studio: dark gradient, darker corners.
    var rgb = mix(STUDIO_TOP, STUDIO_BOTTOM, uv.y);
    let v = (uv - 0.5) * vec2<f32>(1.0, 1.15);
    rgb *= 1.0 - VIGNETTE * dot(v, v);

    // The gels: slow drift + breathing, broken up by churning haze.
    let wander = vec2<f32>(sin(t * DRIFT_SPEED), cos(t * DRIFT_SPEED * 0.73));
    let cyan_at = CYAN_AT + DRIFT * wander;
    let ember_at = vec2<f32>(aspect, 1.0) + EMBER_AT - DRIFT * wander.yx;
    let haze = mix(1.0 - HAZE, 1.0, fbm(p * HAZE_SCALE + vec2<f32>(t * HAZE_SPEED, -t * HAZE_SPEED * 0.6)));
    let breathe_c = 0.88 + 0.12 * sin(t * 0.07);
    let breathe_e = 0.88 + 0.12 * sin(t * 0.059 + 2.0);
    let cyan = pool(p, cyan_at, CYAN_RADIUS) * breathe_c * haze;
    let ember = pool(p, ember_at, EMBER_RADIUS) * breathe_e * haze;
    let cyan_core = exp(-distance(p, cyan_at) * CORE_FALLOFF) * breathe_c;
    let ember_core = exp(-distance(p, ember_at) * CORE_FALLOFF) * breathe_e;
    rgb += CYAN * (cyan * CYAN_GAIN + cyan_core * CYAN_CORE);
    rgb += EMBER * (ember * EMBER_GAIN + ember_core * EMBER_CORE);

    // Dust in the beams: lit (and tinted) by whichever gel reaches it.
    let forward = -view.world_from_view[2].xyz;
    let par = forward.xy * PARALLAX_STRENGTH;
    let rise = vec2<f32>(0.0, t * DUST_RISE);
    let far = dust(p + par * 0.5 + rise, 34.0, 0.035, 0.06, 1.7);
    let near = dust(p + par + rise * 2.2 + vec2<f32>(0.37, 0.0), 13.0, 0.03, 0.14, 9.4) * 0.8;
    let speck = far + near;
    rgb += (CYAN * cyan + EMBER * ember) * speck * DUST_GAIN * 0.12;

    // The burst: a shockwave ring racing outward from the middle of the
    // screen, trailing a broad wash of the same hue. `p01 >= 1` (the parked
    // state) makes `fade` zero, so an idle backdrop pays only this branch.
    let p01 = burst.y;
    if p01 < 1.0 {
        let tint = hue_color(burst.x);
        let eased = 1.0 - pow(1.0 - p01, 2.2);
        let radius = eased * BURST_REACH;
        let fade = (1.0 - p01) * (1.0 - p01);
        let d = length(vec2<f32>((uv.x - 0.5) * aspect, uv.y - 0.5));
        let width = BURST_RING_WIDTH * (1.0 - 0.6 * eased);
        // Squared by multiplication, not `pow`: the base is negative inside
        // the ring, and WGSL's `pow` is out of domain there.
        let front = (d - radius) / width;
        let ring = exp(-front * front);
        let inside = max(0.0, radius - d);
        let trail = select(0.0, exp(-inside * BURST_TRAIL_DECAY), d < radius);
        rgb += tint * (ring * BURST_RING_GAIN + trail * BURST_TRAIL_GAIN) * fade * 0.25;
    }

    // Animated ±1/255 dither so the dark gradients don't band.
    rgb += (hash12(in.position.xy + fract(t) * 289.0) - 0.5) * (2.0 / 255.0);

    return FragmentOutput(vec4<f32>(max(rgb, vec3<f32>(0.0)), 1.0), 0.0);
}
