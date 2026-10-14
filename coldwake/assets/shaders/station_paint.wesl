// Procedural wear over the deck's lit materials (see
// `examples/coldwake/station/kit.rs`): an `ExtendedMaterial` that edits the
// PBR input — base color, roughness — before Bevy's own lighting and fog.
// `mode` = (pattern, seed, scale m, grime 0..1); `tint` = stripe paint.
//
//   0 steel   panels `scale` m across keyed to world space (the plane is
//             picked by the surface's facing), dark seams, each panel its
//             own shade, grime pooling low and running down from the seams.
//   1 grate   floor grating: rows of dark slots between bars, panel
//             borders, the walkway scuffed bright down the middle.
//   2 hazard  diagonal warning stripes `scale` m wide in `tint`, worn
//             through to the steel where feet and hands go.
//   3 worn    scuffs and scratches over the UVs: suit plates, weapons.
//
// The seams, slots and stripes are drawn through `pulse`, filtered to the
// pixel's footprint: drawn hard-edged, anything finer than a pixel (the
// grating across the room, every seam at a distance) breaks up into moiré.

import bevy_pbr::render::{
    pbr_fragment::pbr_input_from_standard_material,
    pbr_functions::alpha_discard,
};

@if(PREPASS_PIPELINE)
import bevy_pbr::{
    prepass::io::{VertexOutput, FragmentOutput},
    deferred::functions::deferred_output,
};
@else
import bevy_pbr::render::{
    forward_io::{VertexOutput, FragmentOutput},
    pbr_functions::{apply_pbr_lighting, main_pass_post_lighting_processing},
};

@group(constants::MATERIAL_BIND_GROUP) @binding(100) var<uniform> mode: vec4<f32>;
@group(constants::MATERIAL_BIND_GROUP) @binding(101) var<uniform> tint: vec4<f32>;

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

/// The 2D coordinates of a world point on the plane the surface faces, with
/// "down" along -y where the surface is a wall.
fn plane_uv(p: vec3<f32>, n: vec3<f32>) -> vec2<f32> {
    let a = abs(n);
    if a.y > a.x && a.y > a.z {
        return p.xz;
    }
    if a.x > a.z {
        return vec2<f32>(p.z, p.y);
    }
    return vec2<f32>(p.x, p.y);
}

/// How much of a box `w` wide around `x` lies in the stretch `a..b` of each
/// unit period: a train of pulses averaged over the pixel. Seen close it has
/// edges `w` soft; once a pixel spans periods it settles on their average.
fn pulse(x: f32, a: f32, b: f32, w: f32) -> f32 {
    let lo = x - 0.5 * w;
    let hi = x + 0.5 * w;
    // (The train's integral from 0, at either end of the box.)
    let to_hi = floor(hi) * (b - a) + clamp(fract(hi), a, b) - a;
    let to_lo = floor(lo) * (b - a) + clamp(fract(lo), a, b) - a;
    return (to_hi - to_lo) / w;
}

/// 0 on a seam `width` m wide between cells, 1 off it; `fw` is how much of
/// `uv` a pixel covers.
fn seams(uv: vec2<f32>, cell: vec2<f32>, width: f32, fw: vec2<f32>) -> f32 {
    let t = uv / cell;
    let line = width / cell;
    let w = max(fw / cell, line * 0.6);
    let across = pulse(t.x + line.x * 0.5, 0.0, line.x, w.x);
    let along = pulse(t.y + line.y * 0.5, 0.0, line.y, w.y);
    return 1.0 - max(across, along);
}

@fragment
fn fragment(
    in: VertexOutput,
    @builtin(front_facing) is_front: bool,
) -> FragmentOutput {
    var pbr_input = pbr_input_from_standard_material(in, is_front);
    pbr_input.material.base_color = alpha_discard(
        pbr_input.material.flags,
        pbr_input.material.alpha_cutoff,
        pbr_input.material.base_color,
    );

    let pos = in.world_position.xyz;
    let n = pbr_input.world_normal;
    let seed = mode.y;
    let scale = max(mode.z, 0.01);
    let grime = mode.w;
    var base = pbr_input.material.base_color.rgb;
    var rough = pbr_input.material.perceptual_roughness;
    let uv2 = plane_uv(pos, n) + seed * 13.1;
    // How much of the pattern's plane this pixel covers (meters).
    let fw = fwidth(uv2);

    switch u32(mode.x + 0.5) {
        case 0u: {
            // Panels twice as tall as wide, each its own shade.
            let cell = vec2<f32>(scale, scale * 1.6);
            let id = floor(uv2 / cell);
            base *= 0.82 + 0.3 * hash12(id + seed);
            let s = seams(uv2, cell, 0.018, fw);
            base *= mix(0.25, 1.0, s);
            // Rust and soot run down from each seam and pool near the floor.
            let run = fbm(vec2<f32>(uv2.x * 9.0, uv2.y * 0.7)) * (1.0 - fract(uv2.y / cell.y));
            let low = 1.0 - smoothstep(0.0, 1.4, pos.y);
            let dirt = clamp(fbm(uv2 * 1.7) * 1.2 - 0.35 + low * 0.5 + run * 0.35, 0.0, 1.0) * grime;
            base = mix(base, base * vec3<f32>(0.42, 0.36, 0.3), dirt);
            rough = clamp(rough + dirt * 0.3 - (1.0 - s) * 0.1, 0.05, 1.0);
        }
        case 1u: {
            // Tiles `scale` m across, a dark border between them.
            let border = seams(uv2, vec2<f32>(scale), 0.03 * scale, fw);
            // Slots: 3 cm bars, 1.5 cm gaps, across the tile, stopping
            // short of its border.
            let slot = pulse(uv2.x * 22.0, 0.65, 0.95, max(fw.x * 22.0, 0.06));
            let in_tile = pulse(uv2.y / scale, 0.07, 0.93, max(fw.y / scale, 0.02));
            let hole = slot * in_tile;
            base *= mix(1.0, 0.08, hole) * mix(0.35, 1.0, border);
            // The walkway down the middle is worn bright, the edges filthy.
            let walk = 1.0 - smoothstep(1.0, 3.5, abs(pos.x));
            let dirt = clamp(fbm(uv2 * 1.3) * 1.3 - 0.4 + (1.0 - walk) * 0.25, 0.0, 1.0) * grime;
            base = mix(base, base * vec3<f32>(0.4, 0.36, 0.32), dirt);
            base *= 1.0 + walk * 0.25 * (1.0 - hole);
            rough = clamp(rough + dirt * 0.25 + hole * 0.4 - walk * 0.15, 0.05, 1.0);
        }
        case 2u: {
            // Half of every period, centered on its start.
            let d = (uv2.x + uv2.y) / scale;
            let stripe = pulse(d + 0.2375, 0.0, 0.475, max((fw.x + fw.y) / scale, 0.025));
            let wear = smoothstep(0.55, 0.75, fbm(uv2 * 6.0 + seed));
            let paint = mix(tint.rgb, base, wear);
            base = mix(base, paint, stripe);
            rough = mix(rough, 0.75, stripe * (1.0 - wear));
        }
        default: {
            var uv = vec2<f32>(0.5);
@if(VERTEX_UVS_A)
            uv = in.uv;
            let scratch = smoothstep(0.86, 0.97, vnoise(vec2<f32>(uv.x * 46.0, uv.y * 3.5) + seed));
            let scuff = fbm(uv * 5.0 + seed);
            base *= 0.9 + 0.2 * scuff;
            base = mix(base, vec3<f32>(0.5, 0.5, 0.47), scratch * 0.35 * grime);
            rough = clamp(rough - scratch * 0.25 + (scuff - 0.5) * 0.12, 0.05, 1.0);
        }
    }
    pbr_input.material.base_color = vec4<f32>(base, pbr_input.material.base_color.a);
    pbr_input.material.perceptual_roughness = rough;

    // `@if` scopes one statement: a block would scope `out` too.
@if(PREPASS_PIPELINE)
    let out = deferred_output(in, pbr_input);
@if(!PREPASS_PIPELINE)
    var out: FragmentOutput;
@if(!PREPASS_PIPELINE)
    out.color = apply_pbr_lighting(pbr_input);
@if(!PREPASS_PIPELINE)
    out.color = main_pass_post_lighting_processing(pbr_input, out.color);
    return out;
}
