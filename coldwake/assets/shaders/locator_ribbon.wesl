// The locator's ribbon (see `examples/coldwake/locator.rs`): additive
// light on the floor. UV x is meters along the route, y runs across it.
// `trace` = (head m, length m, strength 0..1, -): the ribbon shows up to
// its racing head, brightest there; chevrons flow toward the goal; the
// whole fades with `strength`.

import bevy_pbr::render::{forward_io::VertexOutput, mesh_view_bindings::globals};

@group(constants::MATERIAL_BIND_GROUP) @binding(0) var<uniform> trace: vec4<f32>;

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let d = in.uv.x;
    let head = trace.x;
    if d > head {
        discard;
    }
    let across = abs(in.uv.y - 0.5) * 2.0;
    // A bright core with soft shoulders.
    let core = 1.0 - smoothstep(0.15, 1.0, across);
    // Chevrons, pointing along the route, flowing toward the goal.
    let c = fract((d - globals.time * 1.6) / 0.42 - across * 0.18);
    let chevron = smoothstep(0.0, 0.12, c) * (1.0 - smoothstep(0.22, 0.4, c));
    // The head blazes, the tail at his feet fades in.
    let lead = exp(-max(head - d, 0.0) * 5.0);
    let tail = smoothstep(0.0, 0.5, d);
    let near_goal = smoothstep(trace.y - 0.6, trace.y, d);
    let cyan = vec3<f32>(0.35, 1.9, 2.8);
    var rgb = cyan * core * (0.45 + 1.1 * chevron) * tail;
    rgb += vec3<f32>(2.4, 4.2, 5.0) * lead * core * 1.6;
    rgb += cyan * near_goal * core * 0.8;
    return vec4<f32>(rgb * trace.z, 1.0);
}
