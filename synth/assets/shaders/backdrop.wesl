// The editor's backdrop (see `examples/synth/wires/backdrop.rs`): a quad the
// camera films under the UI. It draws the dotted grid of the graph, a soft
// light around the pointer, and every wire: a cubic bezier with a bright
// core and a halo, its signal running along it while the patch plays.
// Output is HDR — the signal pulses go well past 1.0 and bloom.

import bevy_pbr::render::{forward_io::VertexOutput, mesh_view_bindings::view};

// Mirrors `Frame` in backdrop.rs.
struct Frame {
    // Pan (xy, physical px), physical px per graph unit (z), physical px
    // per logical px (w).
    view: vec4<f32>,
    // Pointer (xy, physical px), wire count (z), play 0..1 (w).
    pointer: vec4<f32>,
    // Flow clock in seconds (x), eighth-note steps (y).
    time: vec4<f32>,
}

// Mirrors `WireUniform` in backdrop.rs.
struct Wire {
    // Output end (xy), first control point (zw), physical px.
    a: vec4<f32>,
    // Second control point (xy), input end (zw).
    b: vec4<f32>,
    // Linear rgb, opacity.
    color: vec4<f32>,
    // Half width (px), signal (0 audio, 1 cv, 2 gate), glow radius (px),
    // drawn from (curve parameter).
    style: vec4<f32>,
    // Drawn to, flash progress (negative: none), hot 0..1, growing 0/1.
    anim: vec4<f32>,
    // Bounds of what it lights: min xy, max xy.
    bbox: vec4<f32>,
}

@group(constants::MATERIAL_BIND_GROUP) @binding(0) var<uniform> frame: Frame;
@group(constants::MATERIAL_BIND_GROUP) @binding(1) var<uniform> wires: array<Wire, 64>;

// Linear colors.
const BG_CENTER: vec3<f32> = vec3<f32>(0.0068, 0.0082, 0.0150);
const BG_EDGE: vec3<f32> = vec3<f32>(0.0016, 0.0019, 0.0036);
const DOT: vec3<f32> = vec3<f32>(0.032, 0.038, 0.064);
const DOT_MAJOR: vec3<f32> = vec3<f32>(0.062, 0.072, 0.118);
const LIGHT: vec3<f32> = vec3<f32>(0.020, 0.030, 0.080);

// Grid spacing in graph units (logical px at zoom 1), majors every fourth.
const SPACING: f32 = 24.0;
// Segments the curve is measured with.
const SEGMENTS: u32 = 28u;

// Coverage of the lattice dot nearest `g` (graph units), `radius` physical
// px wide whatever the zoom.
fn dots(g: vec2<f32>, spacing: f32, unit: f32, radius: f32) -> f32 {
    let q = (fract(g / spacing + 0.5) - 0.5) * spacing * unit;
    let d = length(q);
    return 1.0 - smoothstep(radius - 0.7, radius + 0.7, d);
}

fn backdrop(p: vec2<f32>) -> vec3<f32> {
    let size = view.viewport.zw;
    let scale = frame.view.w;
    let unit = frame.view.z;
    let uv = (p - view.viewport.xy) / size;

    // A deep, faintly blue field, darker toward the corners.
    let r = length((uv - 0.5) * vec2<f32>(1.0, size.y / size.x) * 1.6);
    var col = mix(BG_CENTER, BG_EDGE, smoothstep(0.1, 1.2, r));

    // The light that follows the pointer.
    let to_pointer = (p - frame.pointer.xy) / scale;
    let light = exp(-dot(to_pointer, to_pointer) / (2.0 * 170.0 * 170.0));
    col += LIGHT * light * 0.35;

    // The grid moves with the graph; dots keep their size, minors fade out
    // when zoomed out far enough to crowd.
    let g = (p - frame.view.xy) / unit;
    let crowd = smoothstep(7.0, 15.0, SPACING * unit / scale);
    let minor = dots(g, SPACING, unit, 1.05 * scale) * crowd;
    let major = dots(g, SPACING * 4.0, unit, 1.45 * scale);
    let lit = 1.0 + 2.6 * light;
    col = mix(col, DOT * lit, minor);
    col = mix(col, DOT_MAJOR * lit, major);
    return col;
}

fn bezier(w: Wire, t: f32) -> vec2<f32> {
    let s = 1.0 - t;
    return s * s * s * w.a.xy + 3.0 * s * s * t * w.a.zw + 3.0 * s * t * t * w.b.xy
        + t * t * t * w.b.zw;
}

fn draw_wire(under: vec3<f32>, p: vec2<f32>, w: Wire) -> vec3<f32> {
    let lo = w.style.w;
    let hi = w.anim.x;
    if hi - lo < 1e-4 {
        return under;
    }

    // The nearest point of the drawn stretch, as a polyline: its distance,
    // its curve parameter and how far along the wire it is.
    var best = 1e9;
    var best_k = 0.0;
    var best_s = 0.0;
    var walked = 0.0;
    var prev = bezier(w, lo);
    for (var k = 1u; k <= SEGMENTS; k++) {
        let cur = bezier(w, mix(lo, hi, f32(k) / f32(SEGMENTS)));
        let seg = cur - prev;
        let len = length(seg);
        let h = clamp(dot(p - prev, seg) / max(len * len, 1e-6), 0.0, 1.0);
        let d = distance(p, prev + seg * h);
        if d < best {
            best = d;
            best_k = (f32(k - 1u) + h) / f32(SEGMENTS);
            best_s = walked + len * h;
        }
        walked += len;
        prev = cur;
    }
    let t = mix(lo, hi, best_k);
    let hot = w.anim.z;
    let half = w.style.x * (1.0 + 0.3 * hot);
    let glow = w.style.z;
    let unit = frame.view.z;
    let play = frame.pointer.w;
    let clock = frame.time.x;

    // The signal. Patterns are laid out in graph units, so they stay put on
    // the wire through a zoom.
    var energy = 1.0;
    let along = best_s / unit;
    let signal = u32(w.style.y + 0.5);
    if signal == 0u {
        // Audio: quick bright dashes.
        let f = fract(along / 26.0 - clock * 2.6);
        energy += play * 1.9 * (1.0 - smoothstep(0.05, 0.14, abs(f - 0.5)));
    } else if signal == 1u {
        // Control voltage: a slow swell.
        energy += play * 0.7 * pow(0.5 + 0.5 * sin((along / 90.0 - clock * 0.8) * 6.2832), 3.0);
    } else {
        // Gate: one pulse per step, running from the output to the input.
        let u = best_s / max(walked, 1.0);
        let x = u - fract(frame.time.y) * 1.3;
        let tail = select(0.0, exp(x * 10.0) * 0.45, x < 0.0);
        energy += play * 3.2 * (exp(-x * x / 0.0018) + tail);
    }
    // Plugged in: a flash runs down the wire.
    let flash = w.anim.y;
    if flash >= 0.0 {
        let x = t - flash * 1.25;
        energy += 4.5 * exp(-x * x / 0.006) * (1.0 - flash);
    }
    // A growing wire's tip sparks.
    if w.anim.w > 0.5 {
        let x = t - hi;
        energy += 3.5 * exp(-x * x / 0.0012);
    }

    let opacity = w.color.a;
    let base = w.color.rgb;
    // A tube: whiter along its middle.
    let center = saturate(1.0 - best / max(half, 1e-3));
    let tube = mix(base, vec3<f32>(1.0), 0.4 * center * center) * (0.95 + 0.45 * hot) * energy;
    let core = 1.0 - smoothstep(half - 0.8, half + 0.8, best);
    var col = mix(under, tube, core * opacity);
    let halo = exp(-best * best / (2.0 * glow * glow));
    col += base * halo * (0.09 + 0.16 * hot + 0.07 * (energy - 1.0)) * opacity;
    return col;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let p = in.position.xy;
    var col = backdrop(p);
    let count = u32(frame.pointer.z);
    for (var i = 0u; i < count; i++) {
        let w = wires[i];
        if p.x < w.bbox.x || p.y < w.bbox.y || p.x > w.bbox.z || p.y > w.bbox.w {
            continue;
        }
        col = draw_wire(col, p, w);
    }
    return vec4<f32>(col, 1.0);
}
