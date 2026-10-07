// The sky behind every card's diorama (see `examples/arcana/dioramas/mod.rs`):
// a radial glow in the card's color at the heart of the frame fading to its
// deep edge, slow drifting haze, and a sprinkle of twinkling stars. The quad
// rides its camera; depth is pinned to the far plane.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::{globals, view},
}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> deep: vec4<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var<uniform> glow: vec4<f32>;

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

struct FragmentOutput {
    @location(0) color: vec4<f32>,
    @builtin(frag_depth) depth: f32,
}

@fragment
fn fragment(in: VertexOutput) -> FragmentOutput {
    let px = in.position.xy - view.viewport.xy;
    let uv = px / view.viewport.zw;
    let aspect = view.viewport.z / view.viewport.w;
    let t = globals.time;
    let c = (uv - vec2<f32>(0.5, 0.46)) * vec2<f32>(aspect, 1.0);
    let r = length(c);

    var rgb = mix(glow.rgb, deep.rgb, smoothstep(0.0, 0.8, r));
    let haze = 0.6 * vnoise(c * 3.0 + vec2<f32>(t * 0.05, -t * 0.03))
        + 0.4 * vnoise(c * 7.0 - vec2<f32>(t * 0.04, 0.0));
    rgb += glow.rgb * haze * 0.18 * (1.0 - smoothstep(0.1, 0.9, r));

    // Stars: one candidate per 14 px cell, a few lit, twinkling.
    let cell = floor(px / 14.0);
    let h = hash12(cell);
    if h > 0.9 {
        let at = vec2<f32>(hash12(cell + 3.7), hash12(cell + 9.1)) * 10.0 + 2.0;
        let d = length(px - cell * 14.0 - at);
        let tw = 0.5 + 0.5 * sin(t * (1.0 + 2.0 * h) + h * 60.0);
        rgb += vec3<f32>(1.0, 0.95, 0.9) * exp(-d * d * 0.6) * tw * 0.9 * smoothstep(0.15, 0.6, r);
    }

    return FragmentOutput(vec4<f32>(rgb, 1.0), 0.0);
}
