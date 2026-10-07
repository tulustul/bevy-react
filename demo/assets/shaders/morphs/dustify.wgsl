// Morph `dustify` (see `examples/demos/filters.rs`): a ragged dissolve front
// sweeps across the content; at the front the old image shatters into
// wind-borne dust grains that fly off swirling and fading, while grains of
// the new image stream in on the same wind and condense into place.
//
// Params (declaration-order packing of `Dustify`):
//   params[0].x  direction   sweep angle in RADIANS, cw from +X (y down) —
//                            0 wipes left-to-right, 90deg top-to-bottom
//   params[0].y  softness    band width in PHYSICAL PX (a `Length`)
//   params[0].z  turbulence  0..1 turbulent swirl of the dust in flight
//   params[0].w  wind        dust flight angle in RADIANS, RELATIVE to
//                            `direction` (0 = downwind with the sweep)
//   params[1].x  drift       flight distance in PHYSICAL PX (a `Length`)
//   params[1].y  grain       dust particle size in PHYSICAL PX (a `Length`)
//   params[1].z  raggedness  fbm warp strength of the dissolve front
//                            (0 = straight sweep line; >1 exaggerates the
//                            front into deep noise islands)
//   params[1].w  evolution   how far the front noise scrolls over the morph,
//                            in fbm feature lengths (0 = static contour that
//                            just sweeps; higher = the front churns)
//
// Content quantizes into square `grain`-sized PHYSICAL-px cells (so grains
// look half-size on 2x hidpi; the default is tuned at 1x). Each cell owns
// one grain with hash-seeded timing/speed/swirl; all pixels of a grain share
// one rigid offset so it flies as a coherent patch, masked by a shrinking
// soft disk — that per-cell rigidity is what reads as particles instead of a
// noisy crossfade. Rendering gathers: a fixed-point backtrack finds the
// grain currently over the pixel (converges because the offset is constant
// per cell), then the converged cell plus its two axis-neighbors along the
// wind composite (seam fill; residual misses read as dust sparkle).
//
// PREMULTIPLY: dust applies by LERP toward the grain's premultiplied sample,
// weighted by coverage x life x the sample's own alpha — not OVER. A grain
// re-samples the very content it detaches from, so OVER would double-count
// alpha and overbrighten semi-transparent content (and break the settle
// frame); the alpha-weighted lerp is exact there (mix(to, to, w) == to) and
// makes grains of transparent content invisible instead of hole-punching.
// A lerp of valid premultiplied colors stays premultiplied. Endpoint guards
// return the exact from/to samples (identity contract); the sweep margin
// forces every grain to full rest (s = 0 / s = 1, zero offsets, terminal
// fades) just inside the endpoints, so the flight is continuous into them.
//
// The pass covers only the captured rect, so dust vanishes at its boundary;
// the default wind (downwind with the sweep) blows dust into the already-
// cleared interior, which keeps that mostly out of sight.
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    morph_sample_from_lod,
    morph_sample_to_lod,
    uniforms,
}

const TAU: f32 = 6.28318530718;

fn rand_v(st: vec2<f32>) -> f32 {
    return fract(sin(dot(st, vec2<f32>(12.9898, 78.233))) * 43758.5453123);
}

// Value noise (Morgan McGuire), smoothstep-interpolated hash lattice.
fn value_noise(st: vec2<f32>) -> f32 {
    let i = floor(st);
    let f = fract(st);
    let a = rand_v(i);
    let b = rand_v(i + vec2<f32>(1.0, 0.0));
    let c = rand_v(i + vec2<f32>(0.0, 1.0));
    let d = rand_v(i + vec2<f32>(1.0, 1.0));
    let u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 3-octave fbm — front raggedness only, so fewer octaves than burn's 4.
fn fbm(st_in: vec2<f32>) -> f32 {
    var st = st_in;
    var value = 0.0;
    var amplitude = 0.5;
    for (var i = 0; i < 3; i++) {
        value += amplitude * value_noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

struct Ctx {
    dirv: vec2<f32>,
    windv: vec2<f32>,
    perpv: vec2<f32>,
    sweep_min: f32,
    sweep_len: f32,
    band: f32,
    edge: f32,
    turb: f32,
    drift_px: f32,
    grain_px: f32,
    ragged: f32,
    evo_shift: vec2<f32>,
    rag_anchor: vec2<f32>,
}

// A grain's whole crumble-fly-fade life, 0 = intact .. 1 = gone. Evaluated
// at the CELL, so every pixel of a grain shares timing. The margin baked
// into `edge` guarantees s = 0 everywhere at progress 0 and s = 1 at 1
// (max |jit| = 0.4 * band, max |rag| = 0.175 * ragged — see `fragment`).
fn grain_phase(cell: vec2<f32>, ctx: Ctx) -> f32 {
    let center = (cell + 0.5) * ctx.grain_px;
    let c = (dot(center, ctx.dirv) - ctx.sweep_min) / ctx.sweep_len;
    // Sampled in a frame RIDING the front (`rag_anchor` translates with the
    // edge): substituting q = p - dirv * edge * sweep_len into the s = const
    // contour equation cancels every progress term, leaving a fixed implicit
    // curve in q — so at evolution 0 the ragged contour is one rigid shape
    // that only translates with the sweep. Without the anchor, the moving
    // level set cuts through ever-new noise and the silhouette churns even
    // with a static field.
    let rag = (fbm((center - ctx.rag_anchor) / 90.0 + ctx.evo_shift) - 0.5)
        * 0.35 * ctx.ragged;
    let jit = (rand_v(cell + vec2<f32>(37.7, 11.3)) - 0.5) * 0.8 * ctx.band;
    let cq = c + rag + jit;
    // softness 0 degrades to a hard granular step (guarded denominator).
    return clamp((ctx.edge - (cq - ctx.band)) / max(2.0 * ctx.band, 1e-4), 0.0, 1.0);
}

// Rigid offset of a departing grain: eased downwind travel with a turbulent
// along-wind wobble and a perpendicular sway that grows over the flight.
// Exactly zero at s = 0.
fn fly_offset(cell: vec2<f32>, s: f32, ctx: Ctx) -> vec2<f32> {
    let spd = mix(0.7, 1.3, rand_v(cell + vec2<f32>(5.1, 91.4)));
    let ph = rand_v(cell + vec2<f32>(23.9, 63.2)) * TAU;
    let fr = mix(2.5, 7.0, rand_v(cell + vec2<f32>(77.3, 9.9)));
    let travel = ctx.drift_px * spd * s * s
        * (1.0 + 0.25 * ctx.turb * sin(fr * 1.7 * s + ph * 1.3));
    let sway = ctx.drift_px * 0.45 * ctx.turb * s * sin(fr * s + ph);
    return ctx.windv * travel + ctx.perpv * sway;
}

// Rigid offset of an arriving grain: starts a drift upwind of its rest cell
// and decelerates in (same flow direction as the departing dust). Separate
// hash constants from `fly_offset` keep the two dust fields uncorrelated.
// Exactly zero at s = 1.
fn condense_offset(cell: vec2<f32>, s: f32, ctx: Ctx) -> vec2<f32> {
    let spd = mix(0.7, 1.3, rand_v(cell + vec2<f32>(41.7, 3.9)));
    let ph = rand_v(cell + vec2<f32>(8.3, 57.1)) * TAU;
    let fr = mix(2.5, 7.0, rand_v(cell + vec2<f32>(19.3, 33.7)));
    // Lands at 0.85 (before the base settle completes at 0.95), keeping the
    // near-landed "displaced blocks" phase short.
    let back = 1.0 - smoothstep(0.30, 0.85, s);
    let sway = ctx.drift_px * 0.45 * ctx.turb * back * sin(fr * back + ph);
    return -ctx.windv * (ctx.drift_px * spd * back * back) + ctx.perpv * sway;
}

struct Grain {
    color: vec4<f32>,
    weight: f32,
}

fn no_grain() -> Grain {
    return Grain(vec4<f32>(0.0), 0.0);
}

// One departing grain's contribution at pixel `p`: the old content carried
// rigidly from upwind, masked by a shrinking soft disk at the grain's
// current center. Samples use the explicit-LOD helpers — they sit behind
// per-pixel data-dependent branches (and the backtrack), where implicit
// derivatives are unavailable.
fn from_grain(cell: vec2<f32>, p: vec2<f32>, ctx: Ctx) -> Grain {
    let s = grain_phase(cell, ctx);
    if s <= 0.0 || s >= 1.0 {
        return no_grain();
    }
    let offset = fly_offset(cell, s, ctx);
    let g = (cell + 0.5) * ctx.grain_px + offset;
    let radius = ctx.grain_px * 0.62 * (1.0 - 0.65 * s);
    let cov = 1.0 - smoothstep(radius * 0.35, radius, distance(p, g));
    if cov <= 0.0 {
        return no_grain();
    }
    let life = smoothstep(0.0, 0.10, s) * (1.0 - smoothstep(0.45, 1.0, s));
    let src_uv = (p - offset) * uniforms.texel_size;
    // Displaced past the rect: fade out, never clamp-streak.
    let inside = select(0.0, 1.0,
        all(src_uv >= vec2<f32>(0.0)) && all(src_uv <= vec2<f32>(1.0)));
    let color = morph_sample_from_lod(src_uv);
    return Grain(color, cov * life * inside * color.a);
}

// One arriving grain: pops in as small dust at s = 0.30, grows and
// decelerates into its rest cell — at s = 1 it IS the new content there.
fn to_grain(cell: vec2<f32>, p: vec2<f32>, ctx: Ctx) -> Grain {
    let s = grain_phase(cell, ctx);
    let life = smoothstep(0.30, 0.42, s);
    if life <= 0.0 {
        return no_grain();
    }
    let t = smoothstep(0.30, 0.85, s);
    let offset = condense_offset(cell, s, ctx);
    let g = (cell + 0.5) * ctx.grain_px + offset;
    let radius = ctx.grain_px * 0.62 * mix(0.35, 1.0, t);
    let cov = 1.0 - smoothstep(radius * 0.35, radius, distance(p, g));
    if cov <= 0.0 {
        return no_grain();
    }
    let src_uv = (p - offset) * uniforms.texel_size;
    let inside = select(0.0, 1.0,
        all(src_uv >= vec2<f32>(0.0)) && all(src_uv <= vec2<f32>(1.0)));
    let color = morph_sample_to_lod(src_uv);
    return Grain(color, cov * life * inside * color.a);
}

// The axis-aligned cell step closest to the wind (never zero: windv is a
// unit vector, so the dominant component's sign is nonzero) — the three
// candidates below are therefore always distinct cells.
fn wind_step(ctx: Ctx) -> vec2<f32> {
    return select(
        vec2<f32>(sign(ctx.windv.x), 0.0),
        vec2<f32>(0.0, sign(ctx.windv.y)),
        abs(ctx.windv.y) > abs(ctx.windv.x),
    );
}

fn apply_from_dust(color_in: vec4<f32>, p: vec2<f32>, ctx: Ctx) -> vec4<f32> {
    // Fixed-point backtrack: which grain currently covers this pixel?
    var probe = p;
    for (var i = 0; i < 2; i++) {
        let cell = floor(probe / ctx.grain_px);
        probe = p - fly_offset(cell, grain_phase(cell, ctx), ctx);
    }
    let base_cell = floor(probe / ctx.grain_px);
    let axis = wind_step(ctx);
    // Converged cell last so it wins overlaps.
    var order = array<f32, 3>(-1.0, 1.0, 0.0);
    var color = color_in;
    for (var i = 0; i < 3; i++) {
        let gr = from_grain(base_cell + axis * order[i], p, ctx);
        color = mix(color, gr.color, gr.weight);
    }
    return color;
}

fn apply_to_dust(color_in: vec4<f32>, p: vec2<f32>, ctx: Ctx) -> vec4<f32> {
    var probe = p;
    for (var i = 0; i < 2; i++) {
        let cell = floor(probe / ctx.grain_px);
        probe = p - condense_offset(cell, grain_phase(cell, ctx), ctx);
    }
    let base_cell = floor(probe / ctx.grain_px);
    let axis = wind_step(ctx);
    var order = array<f32, 3>(-1.0, 1.0, 0.0);
    var color = color_in;
    for (var i = 0; i < 3; i++) {
        let gr = to_grain(base_cell + axis * order[i], p, ctx);
        color = mix(color, gr.color, gr.weight);
    }
    return color;
}

// The base-layer masks at pixel `p`, returned as (keep, settle). Each cell
// carves a growing circular HOLE where its grain departed and grows a fill
// disk where its grain lands; a pixel takes the union over its 3x3 cell
// neighborhood (keep = min of hole masks, settle = max of fill disks) so
// disks that outgrow their cell overlap smoothly instead of clipping at the
// straight cell edge. Mask centers are hash-nudged (+-0.1 grain per axis) so
// unions don't read as a grid; the 2px-block jitter drives each radius, so
// both rims are ragged. ENDPOINT INVARIANTS (keep = 1 / settle = 0 at s = 0,
// keep = 0 / settle = 1 at s = 1, exact regardless of jitter/nudge): the
// jitter rides the endpoint-neutral side (`s` for holes, `1 - s` for fills),
// radii are exactly 0 at rest, and the own cell's max radius covers its
// whole area — worst-case in-cell distance 0.707 + 0.1 * sqrt(2) ~ 0.85 x
// grain = hole_r max 1.1 - feather 0.25.
fn carve_masks(p: vec2<f32>, ctx: Ctx) -> vec2<f32> {
    let own_cell = floor(p / ctx.grain_px);
    let feather = 0.25 * ctx.grain_px;
    let crumble_jitter = mix(0.8, 1.2, rand_v(floor(p * 0.5)));
    var keep = 1.0;
    var settle = 0.0;
    for (var cy = -1; cy <= 1; cy++) {
        for (var cx = -1; cx <= 1; cx++) {
            let cell = own_cell + vec2<f32>(f32(cx), f32(cy));
            let s = grain_phase(cell, ctx);
            let nudge = (vec2<f32>(
                rand_v(cell + vec2<f32>(61.7, 13.1)),
                rand_v(cell + vec2<f32>(29.3, 87.9)),
            ) - 0.5) * 0.2 * ctx.grain_px;
            let d = distance(p, (cell + 0.5) * ctx.grain_px + nudge);
            let hole_r = 1.1 * ctx.grain_px
                * smoothstep(0.0, 0.35, s * crumble_jitter);
            keep = min(keep, smoothstep(hole_r - feather, hole_r, d));
            let fill_arg = 1.0 - (1.0 - s) * crumble_jitter;
            let fill_r = 1.1 * ctx.grain_px * smoothstep(0.65, 0.95, fill_arg);
            settle = max(settle, 1.0 - smoothstep(fill_r - feather, fill_r, d));
        }
    }
    return vec2<f32>(keep, settle);
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to(in.uv);
    }

    let direction = uniforms.params[0].x;
    let softness = uniforms.params[0].y;
    let turb = clamp(uniforms.params[0].z, 0.0, 1.0);
    let wind_rel = uniforms.params[0].w;
    let drift_px = uniforms.params[1].x;
    // Guarded: a sub-px grain would degenerate the cell quantization.
    let grain_px = max(uniforms.params[1].y, 1.0);
    // Unbounded above: the fbm warp amplitude and the endpoint margin both
    // scale linearly with it, so any strength keeps the endpoints exact.
    let ragged = max(uniforms.params[1].z, 0.0);
    let evolution = uniforms.params[1].w;

    var ctx: Ctx;
    ctx.dirv = vec2<f32>(cos(direction), sin(direction));
    let wind_angle = direction + wind_rel;
    ctx.windv = vec2<f32>(cos(wind_angle), sin(wind_angle));
    ctx.perpv = vec2<f32>(-ctx.windv.y, ctx.windv.x);
    ctx.turb = turb;
    ctx.drift_px = drift_px;
    ctx.grain_px = grain_px;
    ctx.ragged = ragged;
    // Scrolls the front-noise sample obliquely with progress. Only the
    // sample POSITION moves — the amplitude bound (and so the endpoint
    // margin) is progress-independent. Note a nonzero evolution makes a
    // cell's phase non-monotonic in progress: grains near the front can
    // briefly re-form as the noise shifts — that churn is the point.
    ctx.evo_shift = vec2<f32>(0.6, 0.8) * (progress * evolution);

    // Sweep coordinate normalized over the rect's projection onto the
    // direction (linearWipe's construction).
    let extent = uniforms.resolution * ctx.dirv;
    ctx.sweep_min = min(0.0, extent.x) + min(0.0, extent.y);
    let sweep_max = max(0.0, extent.x) + max(0.0, extent.y);
    ctx.sweep_len = max(sweep_max - ctx.sweep_min, 1e-6);
    ctx.band = softness / ctx.sweep_len;

    // Margin covers the max per-grain jitter + fbm raggedness, so the whole
    // field is at rest just inside both progress endpoints.
    let margin = 1.4 * ctx.band + 0.175 * ragged + 1e-3;
    ctx.edge = mix(-margin, 1.0 + margin, progress);
    // The riding-frame anchor for the front noise (see `grain_phase`) —
    // depends on `edge` and `sweep_len`, so it must be assigned after them.
    ctx.rag_anchor = ctx.dirv * (ctx.edge * ctx.sweep_len);

    let p = in.uv * uniforms.resolution;

    // Base layers as a UNION OF DISKS over the 3x3 cell neighborhood (flat
    // per-cell fades read as empty SQUARES left behind by flying grains, and
    // a single own-cell disk clips at the straight cell edge): a circular
    // hole opens where each grain departed (keep = min over the holes) and
    // the new content grows in as disks under the landing grains (settle =
    // max over the fills), so disks overlap smoothly across cell borders.
    let masks = carve_masks(p, ctx);
    let keep = masks.x;
    let settle = masks.y;
    let from_base = morph_sample_from(in.uv) * keep;
    let to_base = morph_sample_to(in.uv) * settle;

    // Premultiplied over: crumbling old content above the settling new.
    var color = from_base + to_base * (1.0 - from_base.a);
    // Dust on top — arriving grains, then departing grains above them.
    color = apply_to_dust(color, p, ctx);
    color = apply_from_dust(color, p, ctx);
    return color;
}
