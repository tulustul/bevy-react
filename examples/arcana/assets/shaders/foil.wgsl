// The inspected 3D card's surface (see `examples/arcana/inspect.rs`): an
// `ExtendedMaterial<StandardMaterial, FoilExtension>` fragment shader over an
// UNLIT base — the React surface texture, so at rest the card's pixels are
// exactly the UI's. On top of it, two view-dependent effects that only a
// real 3D card can have:
//
//   * Foil: a rainbow screened over the face, keyed to the REFLECTION
//     direction — tilt the card and the colors run across it, the way real
//     foil does. `drift` adds a slow shimmer of its own (legendaries).
//   * Glint: specular hotspots from two point lights riding with the camera
//     (up-left, and a fainter one down-right), placed so they miss the card
//     when it faces you square; turn it and they sweep across it.

#import bevy_pbr::{
    mesh_view_bindings::{globals, view},
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
    pbr_functions::main_pass_post_lighting_processing,
}
#endif

// (strength, drift, 0, 0)
@group(#{MATERIAL_BIND_GROUP}) @binding(100) var<uniform> foil: vec4<f32>;

// The lights, in view space (the card hangs at z = -6).
const LIGHT: vec3<f32> = vec3<f32>(-3.2, 2.8, -2.4);
const COUNTER: vec3<f32> = vec3<f32>(3.4, -2.4, -2.0);

fn hotspot(light_view: vec3<f32>, pos: vec3<f32>, n: vec3<f32>, v: vec3<f32>) -> f32 {
    let light = (view.world_from_view * vec4<f32>(light_view, 1.0)).xyz;
    let h = normalize(normalize(light - pos) + v);
    return max(dot(n, h), 0.0);
}

fn rainbow(h: f32) -> vec3<f32> {
    return clamp(abs(fract(h + vec3<f32>(0.0, 0.6667, 0.3333)) * 6.0 - 3.0) - 1.0, vec3<f32>(0.0), vec3<f32>(1.0));
}

@fragment
fn fragment(
    in: VertexOutput,
    @builtin(front_facing) is_front: bool,
) -> FragmentOutput {
    var pbr_input = pbr_input_from_standard_material(in, is_front);
    pbr_input.material.base_color = alpha_discard(pbr_input.material, pbr_input.material.base_color);

    let n = pbr_input.N;
    let v = pbr_input.V;
    let strength = foil.x;
    if strength > 0.0 {
        let r = reflect(-v, n);
        let phase = r.x * 1.3 + r.y * 0.9 + in.uv.x * 1.4 + in.uv.y * 0.8 + globals.time * foil.y;
        let band = mix(rainbow(phase), vec3<f32>(1.0), 0.25);
        let c = pbr_input.material.base_color.rgb;
        let lum = dot(c, vec3<f32>(0.2126, 0.7152, 0.0722));
        let response = 0.25 + 0.75 * smoothstep(0.04, 0.6, lum);
        // Stronger the further the card turns from facing you square.
        let turn = 1.0 - abs(dot(n, v));
        let k = strength * response * (0.35 + 1.3 * turn) * 0.55;
        pbr_input.material.base_color = vec4<f32>(1.0 - (1.0 - c) * (1.0 - band * k), pbr_input.material.base_color.a);
    }

#ifdef PREPASS_PIPELINE
    let out = deferred_output(in, pbr_input);
#else
    var out: FragmentOutput;
    // The face is its own light: the base color as-is (`apply_pbr_lighting`
    // would shade it by angle even with `unlit` set), plus the glint.
    out.color = pbr_input.material.base_color;
    let pos = in.world_position.xyz;
    let a = hotspot(LIGHT, pos, n, v);
    let b = hotspot(COUNTER, pos, n, v);
    let glint = pow(a, 260.0) * 0.85 + pow(a, 40.0) * 0.05 + pow(b, 180.0) * 0.3;
    out.color = vec4<f32>(out.color.rgb + vec3<f32>(1.0, 0.96, 0.9) * glint, out.color.a);
    out.color = main_pass_post_lighting_processing(pbr_input, out.color);
#endif
    return out;
}
