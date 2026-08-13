// Crossfade morph (`builtin/morph.rs::CrossfadeParams`): the plain two-input
// blend — `mix(from, to, progress)`. No user params; the engine-owned
// progress (see the MORPH CONTRACT in `filter_prelude.wgsl`) is the whole
// effect.
//
// Per the prelude's premultiplied contract both inputs are premultiplied and
// the lerp operates on them DIRECTLY — premultiplied color is the
// linear-interpolation-safe form, so coverage edges cross-dissolve without
// fringes. At progress 1.0 `mix` returns the "to" sample exactly (the
// identity contract: the settle frame must be pixel-equal to no pass).
//
// (The entry point is `fragment`, not `filter` — `filter` is a WGSL reserved
// word.)

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from,
    morph_sample_to,
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    return mix(morph_sample_from(in.uv), morph_sample_to(in.uv), morph_progress());
}
