// Atrium's land (see `examples/atrium/world/land.rs`): terrain, trees and
// the pier, all lit by the `Atmos` palette instead of real lights — the
// sun's color on the slopes facing it, skylight in the shadows — then faded
// into the sky by distance. Faceted: the normal comes from screen-space
// derivatives, so every triangle is one flat plane of color.
//
// `kind.x`: 0 = terrain (forest, rock and snow from height and slope),
// 1 = props (the vertex color is the albedo).
//
// Anything below the lake's surface is discarded: the water is opaque from
// above, and the mirror camera below it must see the sky, not the lake bed.

#import bevy_pbr::{
    forward_io::VertexOutput,
    mesh_view_bindings::view,
}
#import atrium::common::{Atmos, apply_fog, noise2}

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> atmos: Atmos;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var<uniform> kind: vec4<f32>;

fn terrain_albedo(p: vec3<f32>, n: vec3<f32>) -> vec3<f32> {
    let slope = 1.0 - n.y;
    let jitter = noise2(p.xz * 0.05) * 0.5 + noise2(p.xz * 0.2) * 0.25;
    let forest = mix(vec3<f32>(0.035, 0.07, 0.05), vec3<f32>(0.07, 0.11, 0.06), jitter);
    let meadow = vec3<f32>(0.16, 0.2, 0.08);
    let rock = mix(vec3<f32>(0.2, 0.19, 0.2), vec3<f32>(0.3, 0.28, 0.27), jitter);
    let snow = vec3<f32>(0.86, 0.9, 0.96);
    let shore = smoothstep(4.0, 1.0, p.y);
    var c = mix(forest, meadow, shore * 0.6);
    // Bare rock on cliffs and above the tree line.
    let treeline = 150.0 + jitter * 60.0;
    c = mix(c, rock, max(smoothstep(0.35, 0.6, slope), smoothstep(treeline, treeline + 40.0, p.y)));
    // Snow on the peaks; a snowfall brings it down the mountain.
    let snowline = mix(330.0, 40.0, atmos.ambient.w) + jitter * 70.0;
    let snow_k = smoothstep(snowline, snowline + 25.0, p.y) * (1.0 - smoothstep(0.7, 0.92, slope));
    return mix(c, snow, snow_k);
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    let p = in.world_position.xyz;
    if p.y < -0.02 {
        discard;
    }
    let n = normalize(cross(dpdy(p), dpdx(p)));
#ifdef VERTEX_COLORS
    var albedo = in.color.rgb;
#else
    var albedo = vec3<f32>(0.5);
#endif
    if kind.x < 0.5 {
        albedo = terrain_albedo(p, n);
    } else {
        // A fresh snowfall dusts the tops of props too.
        albedo = mix(albedo, vec3<f32>(0.85, 0.9, 0.95), atmos.ambient.w * smoothstep(0.5, 0.9, n.y) * 0.8);
    }
    let s = atmos.sun_dir.xyz;
    let ndl = max(dot(n, s), 0.0) * smoothstep(-0.05, 0.08, s.y);
    // Skylight: brighter on slopes that face up.
    let sky = atmos.ambient.rgb * (0.55 + 0.45 * n.y);
    var c = albedo * (sky + atmos.sun_light.rgb * ndl);

    let to_frag = p - view.world_position;
    let dist = length(to_frag);
    c = apply_fog(atmos, c, to_frag / dist, dist);
    return vec4<f32>(c, 1.0);
}
