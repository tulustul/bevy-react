// Composite quad for a captured UI layer (see `layer/render.rs`).
//
// The capture texture holds PREMULTIPLIED color: straight-alpha blending onto
// a transparent-black target accumulates `rgb * a` in the color channels. The
// group alpha therefore multiplies rgb AND a, and the pipeline blends with
// (One, OneMinusSrcAlpha) — premultiplied "over".
//
// Group 2 carries the per-quad composite params (`transform3d` support): a
// screen-space model matrix and a screen-space clip rect. Untransformed quads
// ride the same path with an identity matrix and an open clip sentinel (their
// ancestor clip was already clamped CPU-side by `clip_quad`); transformed
// quads keep full geometry and clip here instead — an axis-aligned rect can't
// clamp a rotated quad's vertices.

#import bevy_render::view::View

@group(0) @binding(0) var<uniform> view: View;
@group(1) @binding(0) var atlas_texture: texture_2d<f32>;
@group(1) @binding(1) var atlas_sampler: sampler;

// Mirrored byte-for-byte by `render/transform3d.rs::CompositeUniforms` (128
// bytes, guarded by `composite_uniforms_match_the_documented_wgsl_layout`).
// Offsets: model @0, clip_min @64, clip_max @72, edge_feather @80, radius
// @96, box_center @112, box_size @120. Pad names are digit-free (naga's
// namer appends `_` to digit-suffixed identifiers).
struct CompositeParams {
    model: mat4x4<f32>,
    clip_min: vec2<f32>,
    clip_max: vec2<f32>,
    edge_feather: f32,
    pad_a: f32,
    pad_b: vec2<f32>,
    // Rounded-corner mask: per-corner radii [TL, TR, BR, BL] (physical px,
    // the node's layout-resolved values) over the UNCLIPPED border box.
    // All-zero disables the mask (the edge_feather pattern); today only
    // backdrop quads set it — frost clipped to the rounded panel.
    radius: vec4<f32>,
    box_center: vec2<f32>,
    box_size: vec2<f32>,
}

@group(2) @binding(0) var<uniform> params: CompositeParams;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) alpha: f32,
    // Homogeneous screen-space position (pre-divide) for the fragment clip
    // test: dividing the perspective-correct-interpolated pair per fragment
    // recovers the true screen position in `clip_min/max`'s space, independent
    // of the render target (screen or a nested layer's capture texture).
    @location(2) screen_pos: vec2<f32>,
    @location(3) screen_w: f32,
}

// Signed distance from `point` (measured from the box CENTER) to a rounded
// box of `size` with per-quadrant `corner_radii` [TL, TR, BR, BL]; negative
// inside. Ported verbatim from bevy_ui_render's `ui.wgsl::sd_rounded_box`
// (including the .xy/.wz quadrant-select swap) so the frost's corner math is
// bit-identical to the one bevy_ui paints the node's own background with.
fn sd_rounded_box(point: vec2<f32>, size: vec2<f32>, corner_radii: vec4<f32>) -> f32 {
    // If 0.0 < y then select bottom left (w) and bottom right corner radius (z).
    // Else select top left (x) and top right corner radius (y).
    let rs = select(corner_radii.xy, corner_radii.wz, 0.0 < point.y);
    // w and z are swapped above so that both pairs are in left-to-right order, otherwise this second
    // select statement would return the incorrect value for the bottom pair.
    let radius = select(rs.x, rs.y, 0.0 < point.x);
    // Vector from the corner closest to the point, to the point.
    let corner_to_point = abs(point) - 0.5 * size;
    // Vector from the center of the radius circle to the point.
    let q = corner_to_point + radius;
    // Length from center of the radius circle to the point, zeros a component if the point is not
    // within the quadrant of the radius circle that is part of the curved corner.
    let l = length(max(q, vec2(0.0)));
    let m = min(max(q.x, q.y), 0.0);
    return l + m - radius;
}

@vertex
fn vertex(
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) alpha: f32,
) -> VertexOutput {
    var out: VertexOutput;
    // Positions are physical screen px; the model matrix is the layer's 3D
    // transform in that same space (identity when untransformed). `w` is kept
    // REAL through the projection — that is what buys perspective-correct UV
    // interpolation — but `z` is flattened post-transform: the phase's view
    // (the stock UI view, or an outer layer's capture view) projects with a
    // near plane at the UI plane, and a rotated quad's depth excursions would
    // otherwise be depth-clipped. Flattening is exactly the CSS projective
    // flatten — the homography lives entirely in xy/w.
    let world = params.model * vec4(position, 1.0);
    out.position = view.clip_from_world * vec4(world.xy, 0.0, world.w);
    out.uv = uv;
    out.alpha = alpha;
    out.screen_pos = world.xy;
    out.screen_w = world.w;
    return out;
}

@fragment
fn fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    // Analytic edge AA for transformed quads: their diagonal silhouettes
    // rasterize without MSAA, so coverage feathers over ~edge_feather px
    // centered on the TRUE rect edge (uv 0/1 — the quad geometry is inflated
    // by the same width, providing the outside half; see
    // `inflated_transform_quad`). Derivatives convert uv distance to screen
    // px per axis BEFORE the min — correct under anisotropic compression —
    // and must be computed before the clip discard (uniform control flow).
    // `edge_feather == 0` hard-disables the term: untransformed quads are
    // CPU-clamped (uv_min/max inside [0,1] at clipped edges, where this
    // distance would feather wrongly) and must stay pixel-identical.
    let dist = min(in.uv, vec2(1.0) - in.uv);
    let dist_px = dist / max(fwidth(in.uv), vec2(1e-6));
    let edge_px = min(dist_px.x, dist_px.y);
    let feathered = clamp(0.5 + edge_px / max(params.edge_feather, 1e-6), 0.0, 1.0);
    var coverage = select(1.0, feathered, params.edge_feather > 0.0);

    // True screen position (perspective divide) — shared by the rounded mask
    // and the ancestor-clip test below.
    let screen = in.screen_pos / in.screen_w;

    // Rounded-corner mask (backdrop quads): clip coverage to the node's
    // rounded border box, antialiased with bevy_ui's own convention —
    // `saturate(0.5 - sd)` on the raw physical-px distance (ui.wgsl's
    // `antialias`; deliberately no fwidth) — so the frost edge coincides
    // with the node's painted rounded background. All-zero radii disable the
    // term exactly (content quads, square backdrops stay pixel-identical).
    let sd = sd_rounded_box(screen - params.box_center, params.box_size, params.radius);
    let rounded = saturate(0.5 - sd);
    coverage *= select(1.0, rounded, any(params.radius > vec4(0.0)));

    // Ancestor clip of a transformed quad (screen-space rect vs. the true
    // screen position) — a HARD cut, like every other overflow edge.
    // Open-sentinel bounds make this a no-op for CPU-clamped/unclipped quads.
    if any(screen < params.clip_min) || any(screen > params.clip_max) {
        discard;
    }
    // Premultiplied output: coverage multiplies rgb AND a, like the group alpha.
    return textureSample(atlas_texture, atlas_sampler, in.uv) * in.alpha * coverage;
}
