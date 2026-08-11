//! Binding evaluation and interpolation primitives — the value math shared
//! by the apply engine (`super::apply`) and `bevy-react`'s transition engine:
//! [`Lerp`], the piecewise curves behind `interpolate`/`interpolateColor`
//! bindings, and [`build_ui_transform`] (both `UiTransform` writers must
//! agree on channel semantics).

use bevy::prelude::*;
use bevy::ui::UiTransform;

use super::SharedValues;
use super::protocol::Binding;

/// Build a `UiTransform` from the six scalar transform channels (each `None`
/// stays at identity: no translation, unit scale, no rotation). `scale` is
/// uniform; `scale_x`/`scale_y` override a single axis. Shared by the animated
/// node apply and `bevy-react`'s static/transition transform path so the channel
/// semantics stay identical across both.
pub fn build_ui_transform(
    translate_x: Option<Val>,
    translate_y: Option<Val>,
    scale: Option<f32>,
    scale_x: Option<f32>,
    scale_y: Option<f32>,
    rotate: Option<f32>,
) -> UiTransform {
    let mut t = UiTransform::IDENTITY;
    if let Some(v) = translate_x {
        t.translation.x = v;
    }
    if let Some(v) = translate_y {
        t.translation.y = v;
    }
    let mut sx = 1.0;
    let mut sy = 1.0;
    if let Some(v) = scale {
        sx = v;
        sy = v;
    }
    if let Some(v) = scale_x {
        sx = v;
    }
    if let Some(v) = scale_y {
        sy = v;
    }
    t.scale = Vec2::new(sx, sy);
    if let Some(v) = rotate {
        t.rotation = Rot2::radians(v);
    }
    t
}

// --- Binding evaluation --------------------------------------------------------

pub(super) fn eval_scalar(binding: &Binding, values: &SharedValues) -> Option<f32> {
    match binding {
        Binding::Shared { id } => values.get(*id),
        Binding::Interpolate { id, input, output } => {
            Some(piecewise(values.get(*id)?, input, output))
        }
        Binding::InterpolateColor { .. } => None,
    }
}

pub(super) fn eval_color(binding: &Binding, values: &SharedValues) -> Option<[f32; 4]> {
    match binding {
        Binding::InterpolateColor { id, input, output } => {
            Some(piecewise_color(values.get(*id)?, input, output))
        }
        _ => None,
    }
}

/// Linear interpolation between two values of the same kind, `t` in `0.0..=1.0`.
/// The one primitive every interpolated quantity shares — implemented here for
/// the scalar and color bindings, and by `bevy-react`'s transition engine for its
/// own channel types (hence public).
pub trait Lerp: Copy {
    /// `self + (other - self) * t`, component-wise where applicable.
    fn lerp(self, other: Self, t: f32) -> Self;
}

impl Lerp for f32 {
    fn lerp(self, other: Self, t: f32) -> Self {
        self + (other - self) * t
    }
}

impl Lerp for [f32; 4] {
    fn lerp(self, other: Self, t: f32) -> Self {
        // Qualified: `bevy::math::FloatExt::lerp` is also in scope for `f32`.
        [
            Lerp::lerp(self[0], other[0], t),
            Lerp::lerp(self[1], other[1], t),
            Lerp::lerp(self[2], other[2], t),
            Lerp::lerp(self[3], other[3], t),
        ]
    }
}

/// Piecewise-linear interpolation, clamped at the ends. `input` must be ascending.
pub(super) fn piecewise(x: f32, input: &[f32], output: &[f32]) -> f32 {
    if input.is_empty() || output.is_empty() {
        return x;
    }
    piecewise_impl(x, input, output)
}

/// Per-channel piecewise-linear color interpolation (rgba in `0.0..=1.0`).
pub(super) fn piecewise_color(x: f32, input: &[f32], output: &[[f32; 4]]) -> [f32; 4] {
    if input.is_empty() || output.is_empty() {
        return [0.0, 0.0, 0.0, 1.0];
    }
    piecewise_impl(x, input, output)
}

/// The shared segment routine behind [`piecewise`]/[`piecewise_color`]: find the
/// segment containing `x` and lerp within it, clamping at both ends. `input` must
/// be ascending and both slices non-empty (the wrappers handle empty).
fn piecewise_impl<T: Lerp>(x: f32, input: &[f32], output: &[T]) -> T {
    let n = input.len().min(output.len());
    if n == 1 || x <= input[0] {
        return output[0];
    }
    if x >= input[n - 1] {
        return output[n - 1];
    }
    for i in 0..n - 1 {
        let (a, b) = (input[i], input[i + 1]);
        if x >= a && x <= b {
            let t = if (b - a).abs() < f32::EPSILON {
                0.0
            } else {
                (x - a) / (b - a)
            };
            return output[i].lerp(output[i + 1], t);
        }
    }
    output[n - 1]
}
