// Morph `invertedPageCurl` (see `examples/demos/filters.rs`): a page curl —
// the old image rolls off around a moving diagonal cylinder, revealing the
// new image, with a grayscale backside and cast shadows.
//
// Port of gl-transitions InvertedPageCurl.glsl
//   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/InvertedPageCurl.glsl
//   Author: Hewlett-Packard — License: BSD 3 Clause
//   Adapted by Sergey Kosarevsky from:
//   http://rectalogic.github.io/webvfx/examples_2transition-shader-pagecurl_8html-example.html
//
// Copyright (c) 2010 Hewlett-Packard Development Company, L.P. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
//      copyright notice, this list of conditions and the following disclaimer
//      in the documentation and/or other materials provided with the
//      distribution.
//    * Neither the name of Hewlett-Packard nor the names of its
//      contributors may be used to endorse or promote products derived from
//      this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// No params.
//
// PORT NOTES: the upstream's mutable globals (`amount`, `cylinderCenter`,
// `cylinderAngle` — per-fragment, progress-derived) thread through the
// helpers as a `Curl` value; GLSL `mod` becomes `glsl_mod` (WGSL `%`
// truncates, GLSL flooring semantics matter for the hit-angle wrap);
// digit-suffixed locals are renamed (naga_oil constraint). Sampling sits
// behind deep data-dependent branches, hence the explicit-LOD morph helpers;
// displaced from-samples are edge-clamped like the upstream sampler.
//
// PREMULTIPLY: the upstream assumes opaque content. Here shadows subtract
// scaled by the local alpha, the grayscale backside computes on the
// unpremultiplied sample and repremultiplies, the fold shadow
// `vec4(0, 0, 0, shado)` is already valid premultiplied black, and real
// sampled alpha rides along everywhere instead of hardcoded 1.0. Endpoint
// guards return the exact from/to samples (identity contract — the settle
// shadow does not provably vanish upstream).

#import bevy_react::filter::{
    FullscreenVertexOutput,
    morph_progress,
    morph_sample_from_lod,
    morph_sample_to_lod,
    premultiply,
    unpremultiply,
}

const MIN_AMOUNT: f32 = -0.16;
const MAX_AMOUNT: f32 = 1.5;
const PI: f32 = 3.141592653589793;
const SCALE: f32 = 512.0;
const SHARPNESS: f32 = 3.0;
const CYLINDER_RADIUS: f32 = 1.0 / PI / 2.0;

// The progress-derived cylinder state (upstream mutable globals).
struct Curl {
    amount: f32,
    center: f32,
    angle: f32,
}

fn glsl_mod(x: f32, y: f32) -> f32 {
    return x - y * floor(x / y);
}

fn safe_uv(p: vec2<f32>) -> vec2<f32> {
    return clamp(p, vec2<f32>(0.0), vec2<f32>(1.0));
}

fn hit_point(hit_angle: f32, yc: f32, point: vec3<f32>, rrotation: mat3x3<f32>) -> vec3<f32> {
    let hit = hit_angle / (2.0 * PI);
    var p = point;
    p.y = hit;
    return rrotation * p;
}

// Distance-scaled edge blend from `base` toward `edge` (upstream antiAlias).
fn anti_alias(base: vec4<f32>, edge: vec4<f32>, distanc: f32) -> vec4<f32> {
    let d = distanc * SCALE;
    if d < 0.0 {
        return edge;
    }
    if d > 2.0 {
        return base;
    }
    let dd = pow(1.0 - d / 2.0, SHARPNESS);
    return ((edge - base) * dd) + base;
}

fn distance_to_edge(point: vec3<f32>) -> f32 {
    var dx = abs(select(point.x, 1.0 - point.x, point.x > 0.5));
    var dy = abs(select(point.y, 1.0 - point.y, point.y > 0.5));
    if point.x < 0.0 {
        dx = -point.x;
    }
    if point.x > 1.0 {
        dx = point.x - 1.0;
    }
    if point.y < 0.0 {
        dy = -point.y;
    }
    if point.y > 1.0 {
        dy = point.y - 1.0;
    }
    if (point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0) {
        return sqrt(dx * dx + dy * dy);
    }
    return min(dx, dy);
}

fn see_through(
    yc: f32,
    p: vec2<f32>,
    rotation: mat3x3<f32>,
    rrotation: mat3x3<f32>,
    curl: Curl,
) -> vec4<f32> {
    let hit_angle = PI - (acos(clamp(yc / CYLINDER_RADIUS, -1.0, 1.0)) - curl.angle);
    let point = hit_point(hit_angle, yc, rotation * vec3<f32>(p, 1.0), rrotation);
    if yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0) {
        return morph_sample_to_lod(p);
    }
    if yc > 0.0 {
        return morph_sample_from_lod(p);
    }

    let color = morph_sample_from_lod(safe_uv(point.xy));
    let tcolor = vec4<f32>(0.0);
    return anti_alias(color, tcolor, distance_to_edge(point));
}

fn see_through_with_shadow(
    yc: f32,
    p: vec2<f32>,
    point: vec3<f32>,
    rotation: mat3x3<f32>,
    rrotation: mat3x3<f32>,
    curl: Curl,
) -> vec4<f32> {
    var shadow = distance_to_edge(point) * 30.0;
    shadow = (1.0 - shadow) / 3.0;
    if shadow < 0.0 {
        shadow = 0.0;
    } else {
        shadow *= curl.amount;
    }

    let shadow_color = see_through(yc, p, rotation, rrotation, curl);
    // Subtract scaled by the local alpha (premultiplied validity).
    let rgb = max(shadow_color.rgb - vec3<f32>(shadow * shadow_color.a), vec3<f32>(0.0));
    return vec4<f32>(rgb, shadow_color.a);
}

fn backside(yc: f32, point: vec3<f32>) -> vec4<f32> {
    // Grayscale is a COLOR op: compute on straight alpha, repremultiply.
    let color = unpremultiply(morph_sample_from_lod(safe_uv(point.xy)));
    var gray = (color.r + color.b + color.g) / 15.0;
    gray += (8.0 / 10.0)
        * (pow(max(0.0, 1.0 - abs(yc / CYLINDER_RADIUS)), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));
    return premultiply(vec4<f32>(vec3<f32>(gray), color.a));
}

fn behind_surface(
    p: vec2<f32>,
    yc_in: f32,
    point_in: vec3<f32>,
    rrotation: mat3x3<f32>,
    curl: Curl,
) -> vec4<f32> {
    let safe_amount = select(
        min(curl.amount, -1e-4),
        max(curl.amount, 1e-4),
        curl.amount >= 0.0,
    );
    var shado = (1.0 - ((-CYLINDER_RADIUS - yc_in) / safe_amount * 7.0)) / 6.0;
    shado *= 1.0 - abs(point_in.x - 0.5);

    let yc = -CYLINDER_RADIUS - CYLINDER_RADIUS - yc_in;

    let hit_angle = (acos(clamp(yc / CYLINDER_RADIUS, -1.0, 1.0)) + curl.angle) - PI;
    let point = hit_point(hit_angle, yc, point_in, rrotation);

    if yc < 0.0
        && point.x >= 0.0
        && point.y >= 0.0
        && point.x <= 1.0
        && point.y <= 1.0
        && (hit_angle < PI || curl.amount > 0.5)
    {
        let dx_b = point.x - 0.5;
        let dy_b = point.y - 0.5;
        shado = 1.0 - (sqrt(dx_b * dx_b + dy_b * dy_b) / (71.0 / 100.0));
        let nyc_b = -yc / CYLINDER_RADIUS;
        shado *= nyc_b * nyc_b * nyc_b;
        shado *= 0.5;
    } else {
        shado = 0.0;
    }
    let to_color = morph_sample_to_lod(p);
    let rgb = max(to_color.rgb - vec3<f32>(shado * to_color.a), vec3<f32>(0.0));
    return vec4<f32>(rgb, to_color.a);
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

    let p = in.uv;
    let amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;
    let curl = Curl(amount, amount, 2.0 * PI * amount);

    let angle = 100.0 * PI / 180.0;
    var c = cos(-angle);
    var s = sin(-angle);

    let rotation = mat3x3<f32>(
        vec3<f32>(c, s, 0.0),
        vec3<f32>(-s, c, 0.0),
        vec3<f32>(-0.801, 0.8900, 1.0),
    );
    c = cos(angle);
    s = sin(angle);

    let rrotation = mat3x3<f32>(
        vec3<f32>(c, s, 0.0),
        vec3<f32>(-s, c, 0.0),
        vec3<f32>(0.98500, 0.985, 1.0),
    );

    var point = rotation * vec3<f32>(p, 1.0);

    let yc = point.y - curl.center;

    if yc < -CYLINDER_RADIUS {
        // Behind the cylinder: the new image plus the cast shadow.
        return behind_surface(p, yc, point, rrotation, curl);
    }

    if yc > CYLINDER_RADIUS {
        // Flat, not-yet-curled part of the old image.
        return morph_sample_from_lod(p);
    }

    let hit_angle = (acos(clamp(yc / CYLINDER_RADIUS, -1.0, 1.0)) + curl.angle) - PI;

    let hit_angle_mod = glsl_mod(hit_angle, 2.0 * PI);
    if (hit_angle_mod > PI && curl.amount < 0.5) || (hit_angle_mod > PI / 2.0 && curl.amount < 0.0)
    {
        return see_through(yc, p, rotation, rrotation, curl);
    }

    point = hit_point(hit_angle, yc, point, rrotation);

    if point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0 {
        return see_through_with_shadow(yc, p, point, rotation, rrotation, curl);
    }

    var color = backside(yc, point);

    var other_color: vec4<f32>;
    if yc < 0.0 {
        let dx_b = point.x - 0.5;
        let dy_b = point.y - 0.5;
        var shado = 1.0 - (sqrt(dx_b * dx_b + dy_b * dy_b) / 0.71);
        let nyc_b = -yc / CYLINDER_RADIUS;
        shado *= nyc_b * nyc_b * nyc_b;
        shado *= 0.5;
        // Premultiplied black at `shado` coverage — valid as-is (rgb <= a).
        other_color = vec4<f32>(0.0, 0.0, 0.0, clamp(shado, 0.0, 1.0));
    } else {
        other_color = morph_sample_from_lod(p);
    }

    color = anti_alias(color, other_color, CYLINDER_RADIUS - abs(yc));

    let cl = see_through_with_shadow(yc, p, point, rotation, rrotation, curl);
    let dist = distance_to_edge(point);

    return anti_alias(color, cl, dist);
}
