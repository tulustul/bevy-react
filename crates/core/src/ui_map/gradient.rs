//! Gradients: wire specs → `bevy_ui` gradients, and the opacity fold.

use super::*;

/// Map a wire color-space token to bevy's [`InterpolationColorSpace`]
/// (default `Oklaba`, matching bevy's own default).
fn parse_color_space(s: Option<&str>) -> InterpolationColorSpace {
    match s {
        Some("oklch") => InterpolationColorSpace::Oklcha,
        Some("oklchLong") => InterpolationColorSpace::OklchaLong,
        Some("srgb") => InterpolationColorSpace::Srgba,
        Some("linearRgb") => InterpolationColorSpace::LinearRgba,
        Some("hsl") => InterpolationColorSpace::Hsla,
        Some("hslLong") => InterpolationColorSpace::HslaLong,
        Some("hsv") => InterpolationColorSpace::Hsva,
        Some("hsvLong") => InterpolationColorSpace::HsvaLong,
        _ => InterpolationColorSpace::Oklaba,
    }
}

/// Map a named anchor (`"center"`, `"topLeft"`, …) to a [`UiPosition`]
/// (default center). Arbitrary `Val`-offset centers are not yet supported.
fn parse_position(s: Option<&str>) -> UiPosition {
    match s {
        Some("top") => UiPosition::TOP,
        Some("bottom") => UiPosition::BOTTOM,
        Some("left") => UiPosition::LEFT,
        Some("right") => UiPosition::RIGHT,
        Some("topLeft") => UiPosition::TOP_LEFT,
        Some("topRight") => UiPosition::TOP_RIGHT,
        Some("bottomLeft") => UiPosition::BOTTOM_LEFT,
        Some("bottomRight") => UiPosition::BOTTOM_RIGHT,
        _ => UiPosition::CENTER,
    }
}

/// Map a radial gradient's shape spec to bevy's [`RadialGradientShape`]
/// (default `ClosestCorner`).
fn parse_radial_shape(shape: Option<&RadialShapeSpec>) -> RadialGradientShape {
    // Static-or-seed for a bare (non-`Option`) animated radius; a seedless
    // bound radius falls back to the leaf's identity default (0px).
    fn radius(a: &Animatable<Length>) -> Val {
        length_to_val(a.value().or_else(|| a.seed()).copied().unwrap_or_default())
    }
    match shape {
        Some(RadialShapeSpec::Circle { circle }) => RadialGradientShape::Circle(radius(circle)),
        Some(RadialShapeSpec::Ellipse { ellipse }) => {
            RadialGradientShape::Ellipse(radius(&ellipse[0]), radius(&ellipse[1]))
        }
        Some(RadialShapeSpec::Keyword(k)) => match k.as_str() {
            "closestSide" => RadialGradientShape::ClosestSide,
            "farthestSide" => RadialGradientShape::FarthestSide,
            "farthestCorner" => RadialGradientShape::FarthestCorner,
            _ => RadialGradientShape::ClosestCorner,
        },
        None => RadialGradientShape::ClosestCorner,
    }
}

/// Static-or-seed read of an animated stop color (`String` isn't `Copy`, so
/// the [`AnimatableField`] copy helpers don't apply): a bound color renders
/// its seed until a driver writes; a seedless bound color is transparent.
fn stop_color(color: &Animatable<String>) -> Color {
    match color {
        Animatable::Static(s) => parse_color(s),
        a => a.seed().map(|s| parse_color(s)).unwrap_or(Color::NONE),
    }
}

/// Build a positional [`ColorStop`] (linear/radial), folding `opacity` into the
/// color like the solid background path. An absent `position` is auto-spaced.
fn color_stop(stop: &GradientStop, opacity: Option<f32>) -> ColorStop {
    ColorStop {
        color: apply_opacity(stop_color(&stop.color), opacity),
        point: stop
            .position
            .static_or_seed()
            .map(length_to_val)
            .unwrap_or(Val::Auto),
        hint: stop.hint.static_or_seed().unwrap_or(0.5),
    }
}

/// Build an [`AngularColorStop`] (conic). The wire [`Angle`] is already radians.
fn angular_stop(stop: &AngularStop, opacity: Option<f32>) -> AngularColorStop {
    AngularColorStop {
        color: apply_opacity(stop_color(&stop.color), opacity),
        angle: stop.angle.static_or_seed().map(Angle::radians),
        hint: stop.hint.static_or_seed().unwrap_or(0.5),
    }
}

fn build_linear(spec: &LinearGradientSpec, opacity: Option<f32>) -> Gradient {
    LinearGradient::new(
        spec.angle
            .static_or_seed()
            .map(Angle::radians)
            .unwrap_or(0.0),
        spec.stops.iter().map(|s| color_stop(s, opacity)).collect(),
    )
    .in_color_space(parse_color_space(spec.color_space.as_deref()))
    .into()
}

fn build_radial(spec: &RadialGradientSpec, opacity: Option<f32>) -> Gradient {
    RadialGradient::new(
        parse_position(spec.position.as_deref()),
        parse_radial_shape(spec.shape.as_ref()),
        spec.stops.iter().map(|s| color_stop(s, opacity)).collect(),
    )
    .in_color_space(parse_color_space(spec.color_space.as_deref()))
    .into()
}

fn build_conic(spec: &ConicGradientSpec, opacity: Option<f32>) -> Gradient {
    ConicGradient::new(
        parse_position(spec.position.as_deref()),
        spec.stops
            .iter()
            .map(|s| angular_stop(s, opacity))
            .collect(),
    )
    .with_start(
        spec.start
            .static_or_seed()
            .map(Angle::radians)
            .unwrap_or(0.0),
    )
    .in_color_space(parse_color_space(spec.color_space.as_deref()))
    .into()
}

fn build_gradient(spec: &GradientSpec, opacity: Option<f32>) -> Gradient {
    match spec {
        GradientSpec::Linear(l) => build_linear(l, opacity),
        GradientSpec::Radial(r) => build_radial(r, opacity),
        GradientSpec::Conic(c) => build_conic(c, opacity),
    }
}

/// Flatten a [`GradientList`] (one or many) into the `Vec<Gradient>` that
/// `BackgroundGradient`/`BorderGradient` wrap. `opacity` fades every stop.
pub fn build_gradients(list: &GradientList, opacity: Option<f32>) -> Vec<Gradient> {
    match list {
        GradientList::One(g) => vec![build_gradient(g, opacity)],
        GradientList::Many(gs) => gs.iter().map(|g| build_gradient(g, opacity)).collect(),
    }
}

/// The transition/binding engines' gradient input: the resolver's UNfolded
/// output per surface (`build_gradients(_, None)`) plus the fold opacity
/// `apply_style_masked` used (None on a promoted root — the group alpha owns
/// it there). Stamped by the gradient-targets writer; both engines fold at
/// write time so their settle equals the resolver's own folded component
/// bit-exactly.
#[derive(Component, Debug, Clone, Default, PartialEq)]
pub struct GradientTargets {
    pub background: Option<Vec<Gradient>>,
    pub border: Option<Vec<Gradient>>,
    pub opacity: Option<f32>,
}

/// Fold an opacity into every stop color of an unfolded gradient list —
/// the write-time half of the split builder (must match `build_gradients`'
/// own fold exactly: [`apply_opacity`] per stop). Consumed by the gradient
/// transition channels at write time; the split-builder contract test pins
/// it to `build_gradients`' own fold.
pub fn fold_gradients(list: &[Gradient], opacity: Option<f32>) -> Vec<Gradient> {
    let Some(o) = opacity else {
        return list.to_vec();
    };
    list.iter()
        .map(|g| {
            let mut g = g.clone();
            match &mut g {
                Gradient::Linear(l) => {
                    for s in &mut l.stops {
                        s.color = apply_opacity(s.color, Some(o));
                    }
                }
                Gradient::Radial(r) => {
                    for s in &mut r.stops {
                        s.color = apply_opacity(s.color, Some(o));
                    }
                }
                Gradient::Conic(c) => {
                    for s in &mut c.stops {
                        s.color = apply_opacity(s.color, Some(o));
                    }
                }
            }
            g
        })
        .collect()
}
