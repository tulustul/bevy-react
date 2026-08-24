// The `pinch` built-in (see `pinch.rs`): a cursor-anchored radial
// pinch/bulge. Positive `strength` squeezes content toward the center
// point (edges pull in transparency from the outset ring — the silhouette
// visibly contracts); negative `strength` magnifies away from it (node
// content spills into the ring — the silhouette bulges out). All params are
// normalized, so the shader converts to physical px itself and the falloff
// stays circular on non-square nodes.
//
// Optional lighting treats the pinch as a HEIGHT FIELD: the displacement
// curve doubles as the surface's depth profile (a pinch is a dimple, a bulge
// a dome), its analytic slope gives a normal, and the normal is shaded
// Lambert + Blinn-Phong from a 2D light direction at a fixed elevation. At
// `strength = 0` the surface is flat and every lighting term cancels, so the
// identity contract holds whatever the light params say.
//
// Params (declaration-order packing of `PinchParams`):
//   params[0].x  x          center, 0..1 across the node rect
//   params[0].y  y          center, 0..1 across the node rect
//   params[0].z  strength   -1 (bulge) ..= 1 (pinch), clamped here
//   params[0].w  radius     fraction of the node's larger dimension
//   params[1].x  light      diffuse intensity, 0 (unlit), 1 nominal, > 1
//                           overdrives (not clamped)
//   params[1].y  lightAngle radians, clockwise from +X (y-down); where the
//                           light comes FROM
//   params[1].z  gloss      specular intensity, 0 (off), 1 nominal, > 1
//                           overdrives (not clamped)
//   params[1].w  glossSize  highlight size 0 (pinpoint) ..= 1 (broad sheen),
//                           mapped onto the Blinn-Phong exponent here
//   params[2].x  outerSoftness  0..1: how the effect meets its rim (0 linear
//                               crease, 0.5 u^2 fade, 1 u^4 fade)
//   params[2].y  innerSoftness  0..1: how it peaks at the center (0 cone tip,
//                               0.5 rounded bowl, 1 flat floor)
//
// PREMULTIPLY: a UV-distortion filter only *resamples* the source at shifted
// positions. Linear filtering of straight-alpha color would bleed the hidden
// rgb of transparent texels at coverage edges, so per the contract in
// `filter_prelude.wgsl` we sample the premultiplied capture DIRECTLY. The
// shading then operates on that premultiplied sample without a round trip:
// darkening is a plain rgb multiply (alpha-safe), lightening/specular add
// `alpha * k` (a white light scaled by coverage — transparent texels stay
// transparent), and the result is clamped to `rgb <= alpha`.

#import bevy_react::filter::{FullscreenVertexOutput, content_rect_min, content_rect_size, source_sampler, source_texture, uniforms}

// Light elevation above the surface plane; 45° reads as a soft key light.
// (`sin`/`cos` of it, precomputed — WGSL consts can't call builtins.)
const LIGHT_ELEVATION_SIN: f32 = 0.70710678;
const LIGHT_ELEVATION_COS: f32 = 0.70710678;
// Surface depth at full strength, as a fraction of the radius. The slope of
// the height field (and so how strongly it shades) scales with this.
const DEPTH: f32 = 1.0;
// Gain on the diffuse term so `light: 1` on a moderate pinch is clearly lit.
const DIFFUSE_GAIN: f32 = 1.5;
// The capture is linear light, where a multiply reads much weaker than the
// same additive step (×0.5 looks ~27% darker; +0.5 white is a leap). Raising
// the shadow factor to this power makes "half dark" mean half dark to the
// eye, so darkening and lightening feel balanced.
const DARKEN_GAMMA: f32 = 2.2;
// `glossSize` 0..1 maps onto a Blinn-Phong exponent of 2^GLOSS_OCTAVES
// (pinpoint) down to 1 (broad sheen), log-wise so the slider feels even.
const GLOSS_OCTAVES: f32 = 7.0;
// Each softness knob maps 0 / 0.5 / 1 to a contact order of 1 / 2 / 4
// (`exp2(SOFTNESS_OCTAVES * knob)`): linear, quadratic, quartic.
const SOFTNESS_OCTAVES: f32 = 2.0;

@fragment
fn fragment(in: FullscreenVertexOutput) -> @location(0) vec4<f32> {
    let center_norm = uniforms.params[0].xy;
    let strength = clamp(uniforms.params[0].z, -1.0, 1.0);
    let radius = uniforms.params[0].w;
    let light = uniforms.params[1].x;
    let light_angle = uniforms.params[1].y;
    let gloss = uniforms.params[1].z;
    let gloss_size = clamp(uniforms.params[1].w, 0.0, 1.0);
    let shininess = exp2(GLOSS_OCTAVES * (1.0 - gloss_size));
    let outer_softness = clamp(uniforms.params[2].x, 0.0, 1.0);
    let inner_softness = clamp(uniforms.params[2].y, 0.0, 1.0);

    // Node rect in physical px (the capture is inflated by the outset ring;
    // the center anchors to the NODE, not the target).
    let size = content_rect_size();
    let center_px = content_rect_min() + center_norm * size;
    let radius_px = max(radius * max(size.x, size.y), 1e-3);

    let pos_px = in.uv * uniforms.resolution;
    let offset = pos_px - center_px;
    let dist = length(offset);

    // Radial sample-distance factor: 1 outside the radius (identity), eased
    // toward 1 + strength at the center; > 1 samples outward (content is
    // compressed toward the point = pinch), < 1 samples inward (magnified =
    // bulge). The falloff profile is 1 - (1 - u^a)^b: near the rim it goes
    // like u^a and near the center like 1 - (1-u)^b, so `a` (outerSoftness)
    // sets how the effect meets the rim and `b` (innerSoftness) how it peaks
    // at the center, independently and with no seam in between. `a = b = 1`
    // is a straight cone, `2`/`2` is within a hair of smoothstep.
    let t = clamp(dist / radius_px, 0.0, 1.0);
    let u = 1.0 - t;
    let a = exp2(SOFTNESS_OCTAVES * outer_softness);
    let b = exp2(SOFTNESS_OCTAVES * inner_softness);
    let ua = pow(u, a);
    let rest = 1.0 - ua;
    let profile = 1.0 - pow(rest, b);
    // d(profile)/du = a b u^(a-1) (1 - u^a)^(b-1). The bases are floored so a
    // zero base with a zero exponent (a or b exactly 1 at the rim/center)
    // yields 1, not NaN — which is also why the slope must be masked to 0
    // OUTSIDE the radius, where t clamps to 1 (u = 0) and the profile is
    // flat: for a near 1, pow(1e-6, a - 1) is nowhere near 0, and without the
    // mask a sharp rim shades the whole image.
    let dprofile = select(
        0.0,
        a * b * pow(max(u, 1e-6), a - 1.0) * pow(max(rest, 1e-6), b - 1.0),
        dist < radius_px,
    );
    let factor = 1.0 + strength * profile;

    let sample_px = center_px + offset * factor;
    let color = textureSample(source_texture, source_sampler, sample_px * uniforms.texel_size);

    // --- Lighting -----------------------------------------------------------
    // Height field z(dist) = -strength * DEPTH * radius_px * profile(u)
    // (z toward the viewer: a pinch dents inward, a bulge domes outward).
    // dz/ddist = strength * DEPTH * profile'(u): dimensionless because the
    // depth scales with the radius, so the shading is the same on any node
    // size. Zero at the center and at the rim, so the surface is flat where
    // the displacement curve is flat.
    let slope = strength * DEPTH * dprofile;
    // Evaluated at the OUTPUT pixel: the dent's slope shades where it appears.
    let radial = select(vec2<f32>(0.0), offset / dist, dist > 1e-3);
    let normal = normalize(vec3<f32>(-slope * radial, 1.0));

    // Light direction: FROM the angle on screen (x right, y down — the same
    // frame as `normal`), lifted by the fixed elevation.
    let light_dir = vec3<f32>(
        cos(light_angle) * LIGHT_ELEVATION_COS,
        sin(light_angle) * LIGHT_ELEVATION_COS,
        LIGHT_ELEVATION_SIN,
    );
    // Flat-surface references: subtracting them makes a flat normal shade
    // exactly 0, so `strength: 0` (and everything outside the radius) is
    // untouched whatever `light`/`gloss` are.
    let flat_normal = vec3<f32>(0.0, 0.0, 1.0);
    let diffuse = light * DIFFUSE_GAIN
        * (dot(normal, light_dir) - dot(flat_normal, light_dir));
    let half_dir = normalize(light_dir + vec3<f32>(0.0, 0.0, 1.0));
    let specular = gloss
        * max(
            pow(max(dot(normal, half_dir), 0.0), shininess)
                - pow(dot(flat_normal, half_dir), shininess),
            0.0,
        );

    // Lighten/darken math (a starting point, kept in one place to swap):
    // shadow side multiplies the color down (perceptually, see DARKEN_GAMMA),
    // lit side and the specular add white scaled by coverage — dark content
    // visibly catches the light.
    let darken = min(diffuse, 0.0);
    let lighten = max(diffuse, 0.0) + specular;
    let shadow = pow(max(1.0 + darken, 0.0), DARKEN_GAMMA);
    var rgb = color.rgb * shadow + color.a * lighten;
    rgb = min(rgb, vec3<f32>(color.a));
    return vec4<f32>(rgb, color.a);
}
