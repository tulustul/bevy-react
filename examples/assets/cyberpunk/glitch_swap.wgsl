// Morph `glitchSwap` (see `examples/cyberpunk/filters.rs`): every screen
// change. The old screen tears into bands that flip to the new one at
// staggered moments, the image shifting and splitting into its channels most
// at the midpoint, a few bands flashing `tint`.
//
// Params (declaration-order packing of `GlitchSwap`):
//   params[0]  (split px, -, -, -)
//   params[1]  tint (straight linear RGBA; alpha = how strong the flashes)
//
// PREMULTIPLY: both images are premultiplied captures, resampled directly
// (a shifted lookup is linear resampling); the flash raises rgb within alpha.
// Endpoint guards return the exact samples — the identity contract.

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
    uniforms,
}

fn pcg(v: u32) -> u32 {
    let state = v * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

fn unit(a: u32, b: u32) -> f32 {
    return f32(pcg(a ^ pcg(b))) / 4294967296.0;
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
    let res = uniforms.resolution;
    let split_px = uniforms.params[0].x;
    let tint = uniforms.params[1];
    // Strongest at the midpoint.
    let g = sin(progress * 3.14159265);
    // The bands re-roll a few times during the swap.
    let step = u32(progress * 9.0);
    let band_h = 6.0 + 40.0 * unit(17u, step);
    let band = u32(in.uv.y * res.y / band_h);

    // Each band flips old → new at its own moment.
    let flip = 0.15 + 0.7 * unit(band * 2654435761u, 99u);
    let to_new = progress > flip;

    var shift = 0.0;
    if unit(band, step) < 0.5 * g {
        shift = (unit(band ^ 0x3c6eu, step) - 0.5) * 0.06 * g;
    }
    let uv = in.uv + vec2<f32>(shift, 0.0);
    let split = split_px * g / res.x;
    let ofs = vec2<f32>(split, 0.0);
    var r: vec4<f32>;
    var c: vec4<f32>;
    var b: vec4<f32>;
    if to_new {
        r = morph_sample_to(uv - ofs);
        c = morph_sample_to(uv);
        b = morph_sample_to(uv + ofs);
    } else {
        r = morph_sample_from(uv - ofs);
        c = morph_sample_from(uv);
        b = morph_sample_from(uv + ofs);
    }
    var out = vec4<f32>(r.r, c.g, b.b, max(r.a, max(c.a, b.a)));
    if unit(band ^ 0x7f4au, step) < 0.04 * g {
        // A flash of the tint over whatever content the band holds, as
        // light: alpha rises to carry it.
        let glow = tint.rgb * tint.a * g * out.a;
        let a = max(out.a, max(glow.r, max(glow.g, glow.b)));
        out = vec4<f32>(min(out.rgb + glow, vec3<f32>(a)), a);
    }
    return out;
}
