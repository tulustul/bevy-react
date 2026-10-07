// Procedural detail over a lit `StandardMaterial`, for the dioramas (see
// `examples/cyberpunk/dioramas/materials.rs`): an `ExtendedMaterial` that
// edits the PBR input — base color, roughness, emissive — before Bevy's own
// lighting and fog. `mode` = (mode, seed, a, b); `glow` is a color (linear,
// HDR when it glows). The modes:
//
//   0 windows  a grid of windows keyed to world space, so the cells line up
//              around a block's corners: some lit (warm, a few in neon
//              tints, rooms lit from above, blinds drawn here and there,
//              whole floors dark now and then), the dark ones glossy glass.
//              spec = (cell width, cell height, window width, window
//              height) in meters; a = the lit fraction, b = strength.
//   1 sign     a neon sign over the mesh's UVs: columns × rows of made-up
//              glyphs (strokes picked from a 3×3 lattice) in a frame.
//              spec = (columns, rows, frame inset, width / height);
//              a = how often it stutters, b = strength.
//   2 wet      asphalt after rain: glossy dark puddles in rougher ground,
//              and painted lane dashes along x = 0. spec = (puddle
//              scale, wetness 0..1, lanes 0/1, -); glow = the paint.
//   3 marble   polished tiles with veins. spec = (tile size, vein scale,
//              -, -); glow = the veins' color.
//   4 emblem   the Tenkai mark — a ring open at the foot, a halo arc, a
//              pillar and a star — over its wordmark, glowing, on the UVs.
//              spec.x = width / height; b = strength.
//   5 sheen    a rim of light where the surface turns away from the eye:
//              the glossy paint of a car catching the city around it, so a
//              dark body still draws its outline. b = strength.

#import bevy_pbr::{
    mesh_view_bindings::globals,
    pbr_fragment::pbr_input_from_standard_material,
    pbr_functions::alpha_discard,
}

#ifdef PREPASS_PIPELINE
#import bevy_pbr::{
    prepass_io::{VertexOutput, FragmentOutput},
    pbr_deferred_functions::deferred_output,
}
#else
#import bevy_pbr::{
    forward_io::{VertexOutput, FragmentOutput},
    pbr_functions::{apply_pbr_lighting, main_pass_post_lighting_processing},
}
#endif

@group(#{MATERIAL_BIND_GROUP}) @binding(100) var<uniform> mode: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(101) var<uniform> spec: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(102) var<uniform> glow: vec4<f32>;

/// What a mode paints: light, roughness (< 0 keeps the material's) and a
/// color mixed over the base color by its alpha.
struct Detail {
    emit: vec3<f32>,
    rough: f32,
    base: vec4<f32>,
}

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

fn segment(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

fn windows(pos: vec3<f32>, n: vec3<f32>) -> Detail {
    var d = Detail(vec3<f32>(0.0), -1.0, vec4<f32>(0.0));
    // Walls only (no early return: `fwidth` needs uniform control flow).
    let wall = step(abs(n.y), 0.5);
    let along = normalize(vec2<f32>(-n.z, n.x) + vec2<f32>(1e-4, 0.0));
    let g = vec2<f32>(dot(pos.xz, along), pos.y) / spec.xy;
    let id = floor(g);
    let f = fract(g) - 0.5;
    // Opposite faces of a block don't share a pattern.
    let face = dot(round(n.xz), vec2<f32>(3.0, 7.0)) + mode.y * 17.3;
    let half = spec.zw / spec.xy * 0.5;
    // Antialiased pane edges, and the whole pattern melting into its
    // average where the cells shrink to a few pixels (no shimmer).
    let px = fwidth(g);
    let pane = (1.0 - smoothstep(half.x - px.x, half.x + px.x, abs(f.x)))
        * (1.0 - smoothstep(half.y - px.y, half.y + px.y, abs(f.y)));
    let far = smoothstep(0.15, 0.5, max(px.x, px.y));
    let floor_lit = step(0.15, hash12(vec2<f32>(id.y * 1.7, face)));
    let h = hash12(id * vec2<f32>(1.0, 1.31) + vec2<f32>(face, face * 0.37));
    let lit = step(h, mode.z) * floor_lit;
    // Rooms lit from above, some with a blind drawn part way down.
    let up = clamp(f.y / max(half.y, 0.01) * 0.5 + 0.5, 0.0, 1.0);
    let blind = hash12(id + vec2<f32>(5.3, face * 1.9));
    let shade = select(1.0, 0.18, blind > 0.55 && up > 1.0 - (blind - 0.55) * 1.6);
    var c = glow.rgb * (0.35 + 0.9 * hash12(id + vec2<f32>(91.7, face))) * (0.45 + 0.75 * up) * shade;
    let tint = hash12(id + vec2<f32>(13.1, face * 3.0));
    let strength = max(glow.r, max(glow.g, glow.b));
    if tint < 0.07 {
        c = vec3<f32>(0.1, 0.85, 1.0) * strength * 0.8 * shade;
    } else if tint < 0.12 {
        c = vec3<f32>(1.0, 0.12, 0.55) * strength * 0.8 * shade;
    }
    let average = glow.rgb * 0.75 * mode.z * 0.85 * (half.x * half.y * 4.0);
    d.emit = mix(c * lit * pane, average, far) * mode.w * wall;
    d.rough = mix(0.65, 0.12, pane * wall);
    d.base = vec4<f32>(0.006, 0.008, 0.012, pane * 0.9 * (1.0 - far) * wall);
    return d;
}

fn glyph(q: vec2<f32>, seed: f32) -> f32 {
    // The 3×3 lattice's twelve edges and two diagonals.
    var strokes = array<vec4<f32>, 14>(
        vec4<f32>(0.0, 0.0, 0.5, 0.0), vec4<f32>(0.5, 0.0, 1.0, 0.0),
        vec4<f32>(0.0, 0.5, 0.5, 0.5), vec4<f32>(0.5, 0.5, 1.0, 0.5),
        vec4<f32>(0.0, 1.0, 0.5, 1.0), vec4<f32>(0.5, 1.0, 1.0, 1.0),
        vec4<f32>(0.0, 0.0, 0.0, 0.5), vec4<f32>(0.0, 0.5, 0.0, 1.0),
        vec4<f32>(0.5, 0.0, 0.5, 0.5), vec4<f32>(0.5, 0.5, 0.5, 1.0),
        vec4<f32>(1.0, 0.0, 1.0, 0.5), vec4<f32>(1.0, 0.5, 1.0, 1.0),
        vec4<f32>(0.0, 1.0, 0.5, 0.5), vec4<f32>(1.0, 1.0, 0.5, 0.5),
    );
    var bits = u32(hash12(vec2<f32>(seed, seed * 0.37 + 3.1)) * 16383.0);
    // Counted by hand: `countOneBits` has no WebGL2 (GLSL ES 3.00) form.
    var strokes_on = 0u;
    for (var i = 0u; i < 14u; i++) {
        strokes_on += (bits >> i) & 1u;
    }
    if strokes_on < 4u {
        bits = bits | 0x1A5u;
    }
    var d = 10.0;
    for (var i = 0u; i < 14u; i++) {
        if (bits & (1u << i)) != 0u {
            d = min(d, segment(q, strokes[i].xy, strokes[i].zw));
        }
    }
    return d;
}

fn neon(uv: vec2<f32>) -> Detail {
    var d = Detail(vec3<f32>(0.0), 0.35, vec4<f32>(glow.rgb * 0.004, 1.0));
    let aspect = spec.w;
    let p = uv * vec2<f32>(aspect, 1.0);
    let edge = min(min(p.x, aspect - p.x), min(p.y, 1.0 - p.y));
    let lw = spec.z * 0.25;
    let frame = 1.0 - smoothstep(lw * 0.4, lw, abs(edge - spec.z));
    let inner = clamp((p - spec.z * 2.0) / (vec2<f32>(aspect, 1.0) - spec.z * 4.0), vec2<f32>(0.0), vec2<f32>(1.0));
    let g = inner * spec.xy;
    let id = floor(min(g, spec.xy - 0.5));
    let q = (fract(g) - 0.5) / 0.66 + 0.5;
    let s = glyph(q, id.x * 7.0 + id.y * 13.0 + mode.y * 31.0);
    let core = 1.0 - smoothstep(0.05, 0.1, s);
    let halo = exp(-s * 9.0) * 0.3;
    // Now and then the tube stutters; it always breathes a little.
    let stutter = select(1.0, 0.2, hash12(vec2<f32>(floor(globals.time * 11.0), mode.y)) < mode.z);
    let breathe = 0.92 + 0.08 * sin(globals.time * 3.0 + mode.y * 5.0);
    d.emit = glow.rgb * (core + halo + frame * 0.9) * stutter * breathe * mode.w;
    return d;
}

fn wet(pos: vec3<f32>) -> Detail {
    var d = Detail(vec3<f32>(0.0), -1.0, vec4<f32>(0.0));
    let n = fbm(pos.xz * spec.x + mode.y * 7.0);
    let edge = mix(0.62, 0.3, spec.y);
    let puddle = smoothstep(edge - 0.03, edge + 0.03, n);
    let grain = vnoise(pos.xz * 11.0);
    d.rough = mix(0.42 + 0.3 * grain, 0.03, puddle);
    d.base = vec4<f32>(0.0, 0.0, 0.0, puddle * 0.5);
    if spec.z > 0.5 {
        let dash = step(abs(pos.x), 0.08) * step(fract(pos.z / 4.0), 0.5);
        d.base = mix(d.base, vec4<f32>(glow.rgb, 1.0), dash * (1.0 - 0.6 * puddle));
        d.rough = mix(d.rough, 0.5, dash * (1.0 - puddle));
    }
    return d;
}

fn marble(pos: vec3<f32>) -> Detail {
    var d = Detail(vec3<f32>(0.0), -1.0, vec4<f32>(0.0));
    let tile = pos.xz / spec.x;
    let f = abs(fract(tile) - 0.5);
    let grout = smoothstep(0.488, 0.496, max(f.x, f.y));
    let w = fbm(pos.xz * spec.y + floor(tile) * 3.7);
    let v = abs(sin((pos.x * 0.8 + pos.z * 0.45) * spec.y * 2.5 + w * 7.0));
    let vein = (1.0 - smoothstep(0.0, 0.1, v)) * 0.7 + w * 0.15;
    d.base = mix(vec4<f32>(glow.rgb, vein), vec4<f32>(0.0, 0.0, 0.0, 1.0), grout * 0.8);
    d.rough = 0.13 + 0.08 * w + grout * 0.4;
    return d;
}

fn tenkai(p: vec2<f32>) -> f32 {
    // Ring, open at the foot (the arc's aperture is measured from the top).
    let ring_sc = vec2<f32>(sin(2.72), cos(2.72));
    let q = vec2<f32>(abs(p.x), p.y);
    var ring = abs(length(q) - 1.0);
    if ring_sc.y * q.x > ring_sc.x * q.y {
        ring = length(q - ring_sc * 1.0);
    }
    // The halo arc over the top half.
    var arc = abs(length(q - vec2<f32>(0.0, 0.05)) - 0.62);
    if q.y < 0.05 {
        arc = length(q - vec2<f32>(0.62, 0.05));
    }
    let pillar = segment(p, vec2<f32>(0.0, -1.3), vec2<f32>(0.0, 0.05));
    let star = (abs(p.x) + abs(p.y - 0.42)) * 0.8 - 0.06;
    return min(min(ring, arc), min(pillar, max(star, 0.0)));
}

fn wordmark(p: vec2<f32>) -> f32 {
    // T E N K A I on a 0.6 × 1 cell, 0.85 apart.
    var segs = array<vec4<f32>, 16>(
        vec4<f32>(0.0, 1.0, 0.6, 1.0), vec4<f32>(0.3, 1.0, 0.3, 0.0),
        vec4<f32>(0.85, 0.0, 0.85, 1.0), vec4<f32>(0.85, 1.0, 1.45, 1.0),
        vec4<f32>(0.85, 0.5, 1.3, 0.5), vec4<f32>(0.85, 0.0, 1.45, 0.0),
        vec4<f32>(1.7, 0.0, 1.7, 1.0), vec4<f32>(1.7, 1.0, 2.3, 0.0),
        vec4<f32>(2.3, 0.0, 2.3, 1.0), vec4<f32>(2.55, 0.0, 2.55, 1.0),
        vec4<f32>(2.55, 0.45, 3.15, 1.0), vec4<f32>(2.75, 0.62, 3.15, 0.0),
        vec4<f32>(3.4, 0.0, 3.7, 1.0), vec4<f32>(3.7, 1.0, 4.0, 0.0),
        vec4<f32>(3.52, 0.4, 3.88, 0.4), vec4<f32>(4.55, 0.0, 4.55, 1.0),
    );
    var d = 10.0;
    for (var i = 0u; i < 16u; i++) {
        d = min(d, segment(p, segs[i].xy, segs[i].zw));
    }
    return d;
}

fn emblem(uv: vec2<f32>) -> Detail {
    var d = Detail(vec3<f32>(0.0), -1.0, vec4<f32>(0.0));
    let aspect = spec.x;
    let p = (uv - 0.5) * vec2<f32>(aspect, -1.0);
    // The mark, radius 0.3 of the panel's height, over the wordmark.
    let mark = tenkai((p - vec2<f32>(0.0, 0.12)) / 0.28) * 0.28;
    let letter = 0.075;
    let word = wordmark((p - vec2<f32>(-2.3 * letter, -0.4)) / letter) * letter;
    let s = min(mark, word * 1.6);
    let core = 1.0 - smoothstep(0.009, 0.014, s);
    let halo = exp(-s * 30.0) * 0.35;
    d.emit = glow.rgb * (core + halo) * mode.w;
    d.base = vec4<f32>(glow.rgb * 0.02, core);
    return d;
}

fn sheen(n: vec3<f32>, v: vec3<f32>) -> Detail {
    var d = Detail(vec3<f32>(0.0), -1.0, vec4<f32>(0.0));
    let rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 5.0);
    d.emit = glow.rgb * rim * mode.w;
    return d;
}

@fragment
fn fragment(
    in: VertexOutput,
    @builtin(front_facing) is_front: bool,
) -> FragmentOutput {
    var pbr_input = pbr_input_from_standard_material(in, is_front);
    pbr_input.material.base_color = alpha_discard(pbr_input.material, pbr_input.material.base_color);

    let pos = in.world_position.xyz;
    var uv = vec2<f32>(0.5);
#ifdef VERTEX_UVS_A
    uv = in.uv;
#endif
    var d = Detail(vec3<f32>(0.0), -1.0, vec4<f32>(0.0));
    switch u32(mode.x + 0.5) {
        case 0u: { d = windows(pos, pbr_input.world_normal); }
        case 1u: { d = neon(uv); }
        case 2u: { d = wet(pos); }
        case 3u: { d = marble(pos); }
        case 4u: { d = emblem(uv); }
        default: { d = sheen(pbr_input.N, pbr_input.V); }
    }
    let base = pbr_input.material.base_color;
    pbr_input.material.base_color = vec4<f32>(mix(base.rgb, d.base.rgb, d.base.a), base.a);
    if d.rough >= 0.0 {
        pbr_input.material.perceptual_roughness = d.rough;
    }
    pbr_input.material.emissive = vec4<f32>(pbr_input.material.emissive.rgb + d.emit, pbr_input.material.emissive.a);

#ifdef PREPASS_PIPELINE
    let out = deferred_output(in, pbr_input);
#else
    var out: FragmentOutput;
    out.color = apply_pbr_lighting(pbr_input);
    out.color = main_pass_post_lighting_processing(pbr_input, out.color);
#endif
    return out;
}
