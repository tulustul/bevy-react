// CRT screen effect for the `<surface>` monitor demo (see
// `examples/demos/scenes/monitor.rs`). An `ExtendedMaterial<StandardMaterial, CrtExtension>`
// fragment shader: it builds the normal PBR input from the StandardMaterial bindings, then
// applies scanlines + an RGB phosphor (aperture-grille) mask to the EMISSIVE channel only —
// the glowing UI image — before lighting. The lit base-color layer and the model's specular
// sheen are left untouched.

import bevy_pbr::{
    render::pbr_fragment::pbr_input_from_standard_material,
    render::pbr_functions::alpha_discard,
};

@if(PREPASS_PIPELINE)
import bevy_pbr::{
    prepass::io::{VertexOutput, FragmentOutput},
    deferred::functions::deferred_output,
};
@else
import bevy_pbr::{
    render::forward_io::{VertexOutput, FragmentOutput},
    render::pbr_functions::{apply_pbr_lighting, main_pass_post_lighting_processing},
};

// CRT params packed into one vec4: x = phosphor-mask column pitch (px across the screen
// width), y = number of scanlines down the screen, z = scanline intensity (0..1),
// w = phosphor-mask intensity (0..1). Extension bindings live in the material bind group
// (whose index Bevy substitutes via `MATERIAL_BIND_GROUP`), at slot 100 (0-99 are the base
// StandardMaterial's).
@group(constants::MATERIAL_BIND_GROUP) @binding(100)
var<uniform> crt: vec4<f32>;

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

    // CRT applies to the EMISSIVE channel only. The UI is on the `Uv1` set (`uv_b`).

    // Scanlines: coarse horizontal dark troughs. `crt.y` is a fixed line count (not the full
    // texel height) so they stay visible once the screen is minified in the 3D view.
    let scan = 1.0 - crt.z * (0.5 - 0.5 * cos(in.uv_b.y * crt.y * 6.2831853));

    // RGB aperture-grille mask: each column of 3 subpixels emphasises one channel.
    let dim = 1.0 - crt.w;
    let sub = i32(floor(in.uv_b.x * crt.x)) % 3;
    var mask = vec3<f32>(dim, dim, dim);
    if (sub == 0) {
        mask.r = 1.0;
    } else if (sub == 1) {
        mask.g = 1.0;
    } else {
        mask.b = 1.0;
    }

    pbr_input.material.emissive = vec4<f32>(
        pbr_input.material.emissive.rgb * scan * mask,
        pbr_input.material.emissive.a,
    );

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
