// Morph `doorway` (see `examples/demos/filters.rs`): the old image splits
// into two door halves sliding outward with perspective while the new image
// zooms up from `depth`-scaled small to full size, over a faint floor
// reflection.
//
// Port of gl-transitions doorway.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/doorway.glsl
//   Author: gre — License: MIT
//
// Params (declaration-order packing of `Doorway`):
//   params[0].x  reflection   floor-reflection strength
//   params[0].y  perspective  door foreshortening
//   params[0].z  depth        zoom start of the incoming image
//
// PREMULTIPLY (documented deviation): the upstream letterboxes on opaque
// black and additively mixes the reflection over it; here the void is
// TRANSPARENT (correct for UI content over arbitrary backdrops) and the
// reflection is the premultiplied "to" sample scaled by the fade — a valid
// premultiplied color (rgb and a scale together). Sampling sits behind
// data-dependent bounds branches, hence the explicit-LOD morph helpers.
// Endpoint guards return the exact from/to samples (identity contract).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from_lod,
    morph_sample_to_lod,
    uniforms,
}

// Strict open-interval bounds check (upstream `inBounds`).
fn in_bounds(p: vec2<f32>) -> bool {
    return all(vec2<f32>(0.0) < p) && all(p < vec2<f32>(1.0));
}

// Mirror below the floor line (upstream `project`). Like all the upstream
// math in this shader it works in gl-transitions' Y-UP uv space (floor at
// y = 0); the samplers below flip back into the engine's y-down uvs.
fn project_floor(p: vec2<f32>) -> vec2<f32> {
    return p * vec2<f32>(1.0, -1.2) + vec2<f32>(0.0, -0.02);
}

fn sample_from_yup(p: vec2<f32>) -> vec4<f32> {
    return morph_sample_from_lod(vec2<f32>(p.x, 1.0 - p.y));
}

fn sample_to_yup(p: vec2<f32>) -> vec4<f32> {
    return morph_sample_to_lod(vec2<f32>(p.x, 1.0 - p.y));
}

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let progress = morph_progress();
    if progress <= 0.0 {
        return morph_sample_from_lod(in.uv);
    }
    if progress >= 1.0 {
        return morph_sample_to_lod(in.uv);
    }

    let reflection = uniforms.params[0].x;
    let perspective = uniforms.params[0].y;
    let depth = uniforms.params[0].z;

    // Upstream math runs in y-up space (the floor mirror depends on it).
    let p = vec2<f32>(in.uv.x, 1.0 - in.uv.y);
    var pfr = vec2<f32>(-1.0, -1.0);

    // The widening slit between the two door halves.
    let middle_slit = 2.0 * abs(p.x - 0.5) - progress;
    if middle_slit > 0.0 {
        pfr = p + select(1.0, -1.0, p.x > 0.5) * vec2<f32>(0.5 * progress, 0.0);
        let d = 1.0 / (1.0 + perspective * progress * (1.0 - middle_slit));
        pfr.y = (pfr.y - d / 2.0) * d + d / 2.0;
    }

    let size = mix(1.0, depth, 1.0 - progress);
    let pto = (p - 0.5) * size + 0.5;

    if in_bounds(pfr) {
        return sample_from_yup(pfr);
    }
    if in_bounds(pto) {
        return sample_to_yup(pto);
    }

    // The void behind everything: transparent, plus the floor reflection of
    // the incoming image fading with height.
    let mirrored = project_floor(pto);
    if in_bounds(mirrored) {
        let fade = reflection * mix(1.0, 0.0, mirrored.y);
        return sample_to_yup(mirrored) * fade;
    }
    return vec4<f32>(0.0);
}
