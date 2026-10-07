// Custom filter `glitch` (see `examples/demos/filters.rs`): broken-signal
// horizontal slice offsets + RGB channel split, re-seeded a few times per
// second from `uniforms.time`. Fully procedural (an integer PCG hash of slice
// row x time step) — no noise textures. `time = true`, so it animates with
// zero re-captures.
//
// Params (declaration-order packing of `Glitch`):
//   params[0].x  intensity  0 (clean) ..= 1 (heavily corrupted)
//
// PREMULTIPLY: like every UV-distortion filter this resamples the source at
// shifted positions, so it samples the premultiplied capture DIRECTLY (see
// `filter_prelude.wgsl` — premultiplied color is the linear-resampling-safe
// form). The channel split recombines r/g/b from three premultiplied samples;
// taking alpha as the max of the three keeps the result valid premultiplied
// color: each channel satisfies c <= its own sample's alpha <= the max.

#import bevy_react::filter::{FullscreenVertexOutput, source_sampler, source_texture, uniforms}

// Cheap stateless integer hash (PCG, Jarzynski & Olano): seed -> [0, 1).
// Deliberately NOT `fract(sin(x) * 43758.5453)`: the seed grows with
// `uniforms.time` without bound, and drivers range-reduce `sin` as
// `hw_sin(fract(x / 2pi))` in f32 — once `x / 2pi` passes 2^21 (~2.5 min of
// runtime here) that fract quantizes to quarters, sin collapses to {0, +-1},
// and every hash lands below the gate threshold: the glitch freezes forever.
// Integer ops are exact at any uptime.
fn hash(seed: u32) -> f32 {
    let state = seed * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return f32((word >> 22u) ^ word) / 4294967296.0;
}

// How often the corruption pattern re-rolls, in Hz.
const RESEED_HZ: f32 = 12.0;
// How many horizontal slices the image is cut into.
const SLICES: f32 = 24.0;
// At full intensity, at most this fraction of slices glitches at once.
const MAX_GATED: f32 = 0.4;
// A fully glitched slice shifts up to this fraction of the width.
const MAX_SHIFT: f32 = 0.08;
// RGB split in texels: a base split everywhere, widened this much on
// glitched slices.
const SPLIT_TEXELS: f32 = 2.0;
const SPLIT_GATED_BOOST: f32 = 5.0;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let intensity = uniforms.params[0].x;

    // Quantize time so each corruption pattern holds for a moment. `* 97u`
    // keeps (slice, reseed) pairs collision-free (97 > SLICES); the large odd
    // offset picks an unrelated hash stream for the shift amount.
    let reseed = u32(floor(uniforms.time * RESEED_HZ));
    let slice = u32(floor(in.uv.y * SLICES));

    // Per-slice, per-reseed: does this slice glitch, and by how much? More
    // intensity gates more slices in and shifts them further.
    let gate = step(1.0 - MAX_GATED * intensity, hash(slice + reseed * 97u));
    let shift = (hash(slice + reseed * 97u + 1469598103u) * 2.0 - 1.0) * gate * intensity * MAX_SHIFT;
    let uv = vec2<f32>(in.uv.x + shift, in.uv.y);

    let split = vec2<f32>(
        (1.0 + SPLIT_GATED_BOOST * gate) * intensity * SPLIT_TEXELS * uniforms.texel_size.x,
        0.0,
    );
    let r = textureSample(source_texture, source_sampler, uv + split);
    let g = textureSample(source_texture, source_sampler, uv);
    let b = textureSample(source_texture, source_sampler, uv - split);

    return vec4<f32>(r.r, g.g, b.b, max(r.a, max(g.a, b.a)));
}
