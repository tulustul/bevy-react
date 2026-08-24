//! Stage 6 of [`apply_animated_nodes`](super::apply_animated_nodes) —
//! gradient-leaf bindings: rebuild each bound surface's FOLDED gradient
//! component from the [`GradientTargets`](crate::ui_map::GradientTargets)
//! stamp (the unfolded resolver output, seeds already rendered into bound
//! leaves) with every bound leaf overwritten by its driven value, then fold
//! opacity (the driven alpha if one runs, else the stamp's static fold) and
//! compare-write. Runs every frame after the style appliers, so a delta's
//! snap is re-asserted the same frame (the filter-param rule). While any
//! gradient binding exists the surface's transition channel is parked
//! ([`ChannelId`](super::super::props::ChannelId)).
//!
//! Values arrive in **wire units** (the [`GradientLeaf`] contract):
//! DEGREES for [`GradientLeaf::Angle`] (the linear `angle` / conic `start`,
//! stored radians), logical px for stop positions and shape radii (written
//! as `Val::Px`), raw `0..=1` for hints (clamped), rgba via
//! `interpolateColor` for stop colors. **A conic stop's angle rides
//! [`GradientLeaf::StopPosition`]**: for a CONIC gradient, `StopPosition(i)`
//! drives the stop's `angle: Option<f32>` and the bound value is DEGREES
//! (converted to radians here) — it IS the stop's position, angular.
//!
//! Bindings and stamp both derive from the same merged style, so an
//! index/kind miss can't be produced through the op path — the validation
//! branches below are defensive (stale stamps, future drift), warn once per
//! bindings restamp (`gradientBinding`, devtools), and never panic.

use bevy::prelude::*;
use bevy::ui::{Gradient, RadialGradientShape};

use super::super::protocol::{AnimatableProperty, AnimatedBindings, Binding, GradientLeaf};
use super::super::{SharedValues, eval_color, eval_scalar};
use super::warn::warn_if;

/// One surface's identity: the wire style key and whether the walk is on the
/// border twin ([`AnimatableProperty::BorderGradientParam`]).
const SURFACES: [(&str, bool); 2] = [("backgroundGradient", false), ("borderGradient", true)];

/// The lazy warn sink threaded into the leaf writer — the `warn_if`
/// signature with the kind pre-bound (see `warn::warn_if`).
type WarnSink<'a> = &'a dyn Fn(bool, &dyn Fn() -> (String, String));

/// The binding's wire-ish address, e.g. `backgroundGradient[3].stops[0].color`.
fn leaf_key(surface: &str, index: u8, leaf: GradientLeaf) -> String {
    let suffix = match leaf {
        GradientLeaf::Angle => "angle".to_string(),
        GradientLeaf::StopColor(i) => format!("stops[{i}].color"),
        GradientLeaf::StopPosition(i) => format!("stops[{i}].position"),
        GradientLeaf::StopHint(i) => format!("stops[{i}].hint"),
        GradientLeaf::ShapeX => "shape.x".to_string(),
        GradientLeaf::ShapeY => "shape.y".to_string(),
    };
    format!("{surface}[{index}].{suffix}")
}

/// Stage 6's body: validate (when `validate`) and apply every gradient-leaf
/// binding of one node against its stamped unfolded lists, folding onto the
/// surface components. See the module doc for the unit/fold/dirt contract.
#[allow(clippy::too_many_arguments)] // the orchestrator's one seam for both surfaces
pub(super) fn apply_gradient_params(
    entity: Entity,
    bindings: &AnimatedBindings,
    values: &SharedValues,
    input: Option<&crate::ui_map::GradientTargets>,
    bg: Option<&mut Mut<bevy::ui::BackgroundGradient>>,
    border: Option<&mut Mut<bevy::ui::BorderGradient>>,
    opacity_alpha: Option<f32>,
    promoted: bool,
    rnode: Option<&crate::bridge::RNode>,
    validate: bool,
    dirt: &mut crate::layer::LayerContentDirt,
) {
    // Attribute validation warnings to the node's devtools inspector.
    let _diag = rnode.map(|r| crate::diag::node_scope(r.0));
    // The fold alpha — the same gate the transition drive uses: a driven
    // opacity wins on an UNpromoted node (never on a promoted root, where
    // the group alpha owns opacity — the stamp's fold is already None there
    // and a driven opacity must not double-fade), else the stamp's static
    // fold.
    let fold = opacity_alpha
        .filter(|_| !promoted)
        .or(input.and_then(|i| i.opacity));
    // Project both components to the shared inner `Vec<Gradient>` (the
    // stage-4 backdrop/morph reborrow idiom).
    let bg = bg.map(|m| m.reborrow().map_unchanged(|g| &mut g.0));
    let border = border.map(|m| m.reborrow().map_unchanged(|g| &mut g.0));
    for ((surface, is_border), component) in SURFACES.into_iter().zip([bg, border]) {
        let stamp = input.and_then(|i| {
            if is_border {
                i.border.as_ref()
            } else {
                i.background.as_ref()
            }
        });
        apply_surface(
            entity, surface, is_border, bindings, values, stamp, component, fold, validate, dirt,
        );
    }
}

/// The per-binding match for one surface.
fn surface_leaf(property: &AnimatableProperty, is_border: bool) -> Option<(u8, GradientLeaf)> {
    match (property, is_border) {
        (AnimatableProperty::BackgroundGradientParam { index, leaf }, false)
        | (AnimatableProperty::BorderGradientParam { index, leaf }, true) => Some((*index, *leaf)),
        _ => None,
    }
}

/// Rebuild one surface: clone the unfolded stamp, overwrite every bound
/// leaf, fold, compare-write. Missing stamp / index miss / kind miss →
/// defensive warn when `validate` (see the module doc), leaf skipped.
#[allow(clippy::too_many_arguments)] // the surface pair shares every argument
fn apply_surface(
    entity: Entity,
    surface: &'static str,
    is_border: bool,
    bindings: &AnimatedBindings,
    values: &SharedValues,
    stamp: Option<&Vec<Gradient>>,
    component: Option<Mut<Vec<Gradient>>>,
    fold: Option<f32>,
    validate: bool,
    dirt: &mut crate::layer::LayerContentDirt,
) {
    // Lazy like stages 4/5 — see `warn::warn_if`.
    let warn = |validate: bool, make: &dyn Fn() -> (String, String)| {
        warn_if(validate, "gradientBinding", make)
    };
    let mut bound = bindings
        .iter()
        .filter_map(|(p, b)| surface_leaf(p, is_border).map(|a| (a, b)))
        .peekable();
    if bound.peek().is_none() {
        return; // no bindings on this surface
    }
    let Some(stamp) = stamp else {
        // Bindings without a stamped surface — a stale stamp (both derive
        // from the same merged style).
        for ((index, leaf), _) in bound {
            warn(validate, &|| {
                let key = leaf_key(surface, index, leaf);
                let msg = format!(
                    "binding {key}: the node has no resolved {surface} to drive \
                     (no `{surface}` style) — binding ignored"
                );
                (key, msg)
            });
        }
        return;
    };

    let mut rebuilt = stamp.clone();
    for ((index, leaf), binding) in bound {
        let Some(gradient) = rebuilt.get_mut(index as usize) else {
            warn(validate, &|| {
                let key = leaf_key(surface, index, leaf);
                let msg = format!(
                    "{key}: the {surface} list has no entry at index {index} — binding ignored"
                );
                (key, msg)
            });
            continue;
        };
        apply_leaf(
            gradient, surface, index, leaf, binding, values, validate, &warn,
        );
    }

    let folded = crate::ui_map::fold_gradients(&rebuilt, fold);
    // Compare through `Deref` (no change mark), write through `DerefMut`
    // only on a real difference — a settled frame stays tick-silent.
    if let Some(mut component) = component
        && *component != folded
    {
        *component = folded;
        dirt.nodes.push(entity);
    }
}

/// Evaluate one binding and write it into its addressed leaf (wire units —
/// see the module doc). Stop-index and leaf-kind misses warn defensively.
#[allow(clippy::too_many_arguments)] // private leaf writer, one call site
fn apply_leaf(
    gradient: &mut Gradient,
    surface: &'static str,
    index: u8,
    leaf: GradientLeaf,
    binding: &Binding,
    values: &SharedValues,
    validate: bool,
    warn: WarnSink,
) {
    let kind_miss = |what: &str| {
        let key = leaf_key(surface, index, leaf);
        let msg = format!("{key}: {what} — binding ignored");
        (key, msg)
    };
    // A color leaf resolves through `eval_color` (`interpolateColor` only);
    // everything else through `eval_scalar`. A missing shared value is
    // transient and stays silent (every stage skips it); a binding of the
    // wrong family warns.
    if let GradientLeaf::StopColor(si) = leaf {
        let Some(rgba) = eval_color(binding, values) else {
            if !matches!(binding, Binding::InterpolateColor { .. }) {
                warn(validate, &|| {
                    kind_miss("stop colors are colors — bind an interpolateColor, not a scalar")
                });
            }
            return;
        };
        let color = Color::srgba(rgba[0], rgba[1], rgba[2], rgba[3]);
        let written = match gradient {
            Gradient::Linear(l) => l.stops.get_mut(si as usize).map(|s| s.color = color),
            Gradient::Radial(r) => r.stops.get_mut(si as usize).map(|s| s.color = color),
            Gradient::Conic(c) => c.stops.get_mut(si as usize).map(|s| s.color = color),
        };
        if written.is_none() {
            warn(validate, &|| {
                kind_miss(&format!("the gradient has no stop at index {si}"))
            });
        }
        return;
    }
    let Some(v) = eval_scalar(binding, values) else {
        if matches!(binding, Binding::InterpolateColor { .. }) {
            warn(validate, &|| {
                kind_miss("this leaf is a scalar — an interpolateColor binding cannot drive it")
            });
        }
        return;
    };
    match leaf {
        GradientLeaf::StopColor(_) => unreachable!("handled above"),
        // DEGREES on the wire (every rotation in the system), radians stored:
        // the linear `angle` / the conic `start`.
        GradientLeaf::Angle => match gradient {
            Gradient::Linear(l) => l.angle = v.to_radians(),
            Gradient::Conic(c) => c.start = v.to_radians(),
            Gradient::Radial(_) => {
                warn(validate, &|| {
                    kind_miss("a radial gradient has no angle leaf")
                });
            }
        },
        // Logical px → `Val::Px` on linear/radial stops; on a CONIC stop
        // this IS the stop's angular position: DEGREES → `angle` radians.
        GradientLeaf::StopPosition(si) => {
            let written = match gradient {
                Gradient::Linear(l) => l.stops.get_mut(si as usize).map(|s| s.point = Val::Px(v)),
                Gradient::Radial(r) => r.stops.get_mut(si as usize).map(|s| s.point = Val::Px(v)),
                Gradient::Conic(c) => c
                    .stops
                    .get_mut(si as usize)
                    .map(|s| s.angle = Some(v.to_radians())),
            };
            if written.is_none() {
                warn(validate, &|| {
                    kind_miss(&format!("the gradient has no stop at index {si}"))
                });
            }
        }
        // Raw hints, clamped to the valid midpoint range.
        GradientLeaf::StopHint(si) => {
            let h = v.clamp(0.0, 1.0);
            let written = match gradient {
                Gradient::Linear(l) => l.stops.get_mut(si as usize).map(|s| s.hint = h),
                Gradient::Radial(r) => r.stops.get_mut(si as usize).map(|s| s.hint = h),
                Gradient::Conic(c) => c.stops.get_mut(si as usize).map(|s| s.hint = h),
            };
            if written.is_none() {
                warn(validate, &|| {
                    kind_miss(&format!("the gradient has no stop at index {si}"))
                });
            }
        }
        // Logical px shape radii: the circle radius / ellipse X on `ShapeX`,
        // the ellipse Y on `ShapeY`. Keyword shapes and non-radials have no
        // radius leaf to drive.
        GradientLeaf::ShapeX => match gradient {
            Gradient::Radial(r) => match &mut r.shape {
                RadialGradientShape::Circle(radius) => *radius = Val::Px(v),
                RadialGradientShape::Ellipse(x, _) => *x = Val::Px(v),
                _ => warn(validate, &|| {
                    kind_miss("the radial shape is a keyword — no radius to drive")
                }),
            },
            _ => warn(validate, &|| {
                kind_miss("only a radial gradient has shape radii")
            }),
        },
        GradientLeaf::ShapeY => match gradient {
            Gradient::Radial(r) => match &mut r.shape {
                RadialGradientShape::Ellipse(_, y) => *y = Val::Px(v),
                _ => warn(validate, &|| {
                    kind_miss("only an ellipse has a Y radius to drive")
                }),
            },
            _ => warn(validate, &|| {
                kind_miss("only a radial gradient has shape radii")
            }),
        },
    }
}
