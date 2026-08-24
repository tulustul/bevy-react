//! Whole-value gradient transitions: strict structural classification and
//! pairwise interpolation over the RESOLVED `Vec<bevy_ui::Gradient>` (the
//! `GradientTargets` stamp). Policy (user-decided): structures must match —
//! same kind, same stop count, equal categorical fields (`color_space`,
//! `position`, radial shape variant/keyword), equal list length — else the
//! retarget SNAPS immediately with a `gradientTransition` warning (deliberate
//! deviation from the filter channel's 0.5 discrete swap). Within a match:
//! stop colors lerp sRGB component-wise straight-alpha (the `backgroundColor`
//! space — knowingly different from the gradient's own OkLab stop rendering),
//! angles lerp numerically (CSS long-way), `Val` positions lerp same-unit and
//! per-leaf SNAP on unit/`Auto`/presence mismatch (the `Length::lerp` rule).

use bevy::ui::{ColorStop, Gradient, RadialGradientShape, Val};

use crate::animations::Lerp;

/// The whole-value gradient channel — the `FilterChannel` pattern over one
/// surface's resolved gradients. State-owned current: `apply_style` SNAPS
/// the component to the new target on the retarget frame; this channel
/// eases over that snap from its own last write. The target is the
/// [`GradientTargets`](crate::ui_map::GradientTargets) stamp (UNfolded); the
/// fold happens at write time so a simultaneous opacity ease bakes correctly
/// and settle is bit-exact against `apply_style`'s own folded build.
#[derive(Default)]
pub(super) struct GradientChannel {
    /// Last unfolded target seen (retarget detection). `None` = no gradient.
    wire: Option<Vec<Gradient>>,
    channel: super::channels::EasedChannel<Vec<Gradient>, GradientEaseInterp>,
}

/// The gradient-ease [`Interp`](super::channels::Interp): the plain
/// start→target pairwise lerp ([`lerp_gradients`]) over a captured start
/// (the channel's last write). Settle clones the target — the unfolded
/// stamp, whose write-time fold equals the resolver's build exactly.
#[derive(Default)]
pub(super) struct GradientEaseInterp {
    start: Vec<Gradient>,
}

impl super::channels::Interp<Vec<Gradient>> for GradientEaseInterp {
    fn arm(&mut self, from: &Vec<Gradient>, _to: &Vec<Gradient>) {
        self.start = from.clone();
    }
    fn sample(&self, p: f32, target: &Vec<Gradient>) -> Vec<Gradient> {
        lerp_gradients(&self.start, target, p)
    }
    fn settle(&self, target: &Vec<Gradient>) -> Vec<Gradient> {
        target.clone()
    }
}

impl GradientChannel {
    /// Adopt the current stamp without animating — the mount seed, so a
    /// freshly mounted gradient snaps instead of easing in from nothing.
    pub(super) fn seed(&mut self, input: Option<&Vec<Gradient>>) {
        self.wire = input.cloned();
        self.channel.init(input.cloned().unwrap_or_default());
    }

    /// Forget everything — wire AND reading (the component vanished
    /// mid-ease: an unset removed it while a target still stands). Clearing
    /// the wire makes the next stamp a fresh appear (silent snap), which
    /// re-syncs `current` — without it, a re-add of the SAME gradient would
    /// not retarget and the idle-current invariant below would break over an
    /// empty reading. The `FilterChannel` `resolved: None` rule, extended.
    fn reset(&mut self) {
        self.wire = None;
        self.channel.init(Vec::new());
    }

    /// The channel's last unfolded reading. While idle this IS the wire
    /// target — every mutation upholds it: [`Self::seed`] and each
    /// non-eased retarget `init` to the target, settle writes the target,
    /// and [`Self::reset`] clears the wire alongside the reading — so the
    /// caller can re-fold it under a live opacity ease without arming
    /// anything.
    fn current(&self) -> &Vec<Gradient> {
        &self.channel.current
    }

    /// Advance toward the stamped unfolded target. Returns the UNfolded
    /// current to write (caller folds + compare-writes), or `None` when idle
    /// (`apply_style` owns the component then). `surface` + `rnode`
    /// attribute the mismatch warning.
    ///
    /// Retarget policy (see the module doc): a structure-matched pair eases;
    /// a mismatch SNAPS with a `gradientTransition` warning; appear/unset
    /// snap silently. The alignable check compares the channel's own
    /// `current` against the new target — equivalent to comparing old wire
    /// vs new wire structurally, because every sample/settle/init clones the
    /// last target's structure (a mid-ease current is a lerp INTO that
    /// structure), and the arm only runs when a previous wire existed.
    fn drive(
        &mut self,
        input: Option<&Vec<Gradient>>,
        surface: &'static str,
        rnode: Option<crate::diag::NodeId>,
        spec: Option<&super::spec::ChannelTransition>,
        dt: f32,
    ) -> Option<Vec<Gradient>> {
        let retargeted = match input {
            Some(g) => self.wire.as_ref() != Some(g),
            None => self.wire.is_some(),
        };
        if retargeted {
            let had = self.wire.is_some();
            self.wire = input.cloned();
            match (spec, input) {
                (Some(spec), Some(target))
                    if had && gradients_alignable(&self.channel.current, target) =>
                {
                    self.channel.arm(target.clone(), spec);
                }
                (Some(_), Some(target)) if had => {
                    // Structural mismatch: snap + warn (the agreed policy —
                    // no 0.5 discrete swap). Appear/unset snap silently below.
                    let _scope = rnode.map(crate::diag::node_scope);
                    let msg = format!(
                        "{surface}: gradient structures don't match \
                         (kind/stop count/colorSpace/position/shape) — snapping"
                    );
                    tracing::warn!(target: "bevy_react", "{msg}");
                    crate::diag::report("gradientTransition", surface, &msg);
                    self.channel.init(target.clone());
                }
                _ => {
                    self.channel.init(input.cloned().unwrap_or_default());
                }
            }
        }
        if self.channel.runner.is_some() {
            self.channel.tick(dt);
            return Some(self.channel.current.clone());
        }
        None
    }

    /// The one per-frame entry point: [`Self::drive`] toward the stamp, then
    /// land the result on the surface's folded component. Returns whether it
    /// wrote (the caller pushes content dirt).
    ///
    /// Fold-at-write: the eased opacity wins while a target exists
    /// (`eased_alpha` — the bg-color alpha-bake rule), else the stamp's
    /// `static_fold`. A live opacity target also re-folds an IDLE gradient
    /// (idle [`Self::current`] IS the target), so gradients fade with the
    /// eased alpha like the color folds do. The per-frame fold+compare while
    /// an opacity target exists is deliberate: gating on the opacity runner
    /// instead would miss its settle frame (the runner drops in the same
    /// tick that lands the final value), freezing a stale fold. Compares via
    /// `Deref` before writing so a no-op frame never trips change detection.
    ///
    /// A vanished component under a live ease (an unset removed it this
    /// frame) drops the ease via [`Self::reset`].
    #[allow(clippy::too_many_arguments)] // one seam for two surfaces; splitting loses the pairing
    pub(super) fn drive_onto(
        &mut self,
        input: Option<&Vec<Gradient>>,
        component: Option<bevy::ecs::change_detection::Mut<Vec<Gradient>>>,
        surface: &'static str,
        rnode: Option<crate::diag::NodeId>,
        spec: Option<&super::spec::ChannelTransition>,
        eased_alpha: Option<f32>,
        static_fold: Option<f32>,
        dt: f32,
    ) -> bool {
        let driven = self.drive(input, surface, rnode, spec, dt);
        let Some(mut component) = component else {
            if driven.is_some() {
                self.reset();
            }
            return false;
        };
        let current = driven
            .as_ref()
            .or_else(|| eased_alpha.map(|_| self.current()));
        let Some(current) = current else {
            return false; // idle and no opacity target: `apply_style` owns it
        };
        let folded = crate::ui_map::fold_gradients(current, eased_alpha.or(static_fold));
        if *component != folded {
            *component = folded;
            return true;
        }
        false
    }
}

/// Whether `from` → `to` can interpolate pairwise (see module doc).
pub(super) fn gradients_alignable(from: &[Gradient], to: &[Gradient]) -> bool {
    from.len() == to.len()
        && from.iter().zip(to).all(|(a, b)| match (a, b) {
            (Gradient::Linear(a), Gradient::Linear(b)) => {
                a.stops.len() == b.stops.len() && a.color_space == b.color_space
            }
            (Gradient::Radial(a), Gradient::Radial(b)) => {
                a.stops.len() == b.stops.len()
                    && a.color_space == b.color_space
                    && a.position == b.position
                    && shapes_alignable(a.shape, b.shape)
            }
            (Gradient::Conic(a), Gradient::Conic(b)) => {
                a.stops.len() == b.stops.len()
                    && a.color_space == b.color_space
                    && a.position == b.position
            }
            _ => false,
        })
}

/// Shape variants must match to align; sized variants lerp their `Val`s
/// (per-leaf snap on unit mismatch), keyword variants must be equal.
fn shapes_alignable(a: RadialGradientShape, b: RadialGradientShape) -> bool {
    use RadialGradientShape as S;
    matches!(
        (a, b),
        (S::Circle(_), S::Circle(_)) | (S::Ellipse(..), S::Ellipse(..))
    ) || a == b
}

/// Same-unit `Val` lerp; mixed units / `Auto` snap to the target (the
/// `Length::lerp` rule lifted onto bevy's `Val`).
fn lerp_val(a: Val, b: Val, t: f32) -> Val {
    use Val::*;
    let l = |x: f32, y: f32| x + (y - x) * t;
    match (a, b) {
        (Px(x), Px(y)) => Px(l(x, y)),
        (Percent(x), Percent(y)) => Percent(l(x, y)),
        (Vw(x), Vw(y)) => Vw(l(x, y)),
        (Vh(x), Vh(y)) => Vh(l(x, y)),
        (VMin(x), VMin(y)) => VMin(l(x, y)),
        (VMax(x), VMax(y)) => VMax(l(x, y)),
        _ => b,
    }
}

/// Stop colors lerp sRGB component-wise, straight alpha — exactly the
/// `backgroundColor` channel's space (`color_to_rgba`/`rgba_to_color`).
fn lerp_color(a: bevy::color::Color, b: bevy::color::Color, t: f32) -> bevy::color::Color {
    super::rgba_to_color(Lerp::lerp(
        super::color_to_rgba(a),
        super::color_to_rgba(b),
        t,
    ))
}

/// Pairwise interpolation of two ALIGNABLE lists (caller classified).
/// `t == 0.0` / `1.0` return the endpoints bit-exactly.
/// `t` may lie outside [0,1] (spring overshoot): numeric leaves extrapolate
/// linearly, snapped leaves stay snapped.
pub(super) fn lerp_gradients(from: &[Gradient], to: &[Gradient], t: f32) -> Vec<Gradient> {
    debug_assert!(t.is_finite(), "gradient lerp t must be finite, got {t}");
    // Before the endpoint short-circuits, so misuse fires at t == 0.0/1.0 too;
    // an aligned endpoint call still returns bit-exact below. Release builds
    // keep the defensive zip-truncation.
    debug_assert!(
        gradients_alignable(from, to),
        "lerp_gradients called with non-alignable lists (caller must classify)"
    );
    if t == 0.0 {
        return from.to_vec();
    }
    if t == 1.0 {
        return to.to_vec();
    }
    from.iter()
        .zip(to)
        .map(|(a, b)| lerp_gradient(a, b, t))
        .collect()
}

fn lerp_gradient(a: &Gradient, b: &Gradient, t: f32) -> Gradient {
    let l = |x: f32, y: f32| x + (y - x) * t;
    match (a, b) {
        (Gradient::Linear(a), Gradient::Linear(b)) => {
            let mut out = b.clone();
            out.angle = l(a.angle, b.angle);
            lerp_stops(&a.stops, &mut out.stops, t);
            Gradient::Linear(out)
        }
        (Gradient::Radial(a), Gradient::Radial(b)) => {
            let mut out = b.clone();
            out.shape = lerp_shape(a.shape, b.shape, t);
            lerp_stops(&a.stops, &mut out.stops, t);
            Gradient::Radial(out)
        }
        (Gradient::Conic(a), Gradient::Conic(b)) => {
            let mut out = b.clone();
            out.start = l(a.start, b.start);
            for (sa, sb) in a.stops.iter().zip(&mut out.stops) {
                sb.color = lerp_color(sa.color, sb.color, t);
                sb.angle = match (sa.angle, sb.angle) {
                    (Some(x), Some(y)) => Some(l(x, y)),
                    (_, y) => y, // presence mismatch: per-leaf snap
                };
                sb.hint = l(sa.hint, sb.hint);
            }
            Gradient::Conic(out)
        }
        _ => unreachable!("caller classified alignable"),
    }
}

fn lerp_stops(from: &[ColorStop], to: &mut [ColorStop], t: f32) {
    for (a, b) in from.iter().zip(to) {
        b.color = lerp_color(a.color, b.color, t);
        b.point = lerp_val(a.point, b.point, t);
        b.hint = a.hint + (b.hint - a.hint) * t;
    }
}

fn lerp_shape(a: RadialGradientShape, b: RadialGradientShape, t: f32) -> RadialGradientShape {
    use RadialGradientShape as S;
    match (a, b) {
        (S::Circle(x), S::Circle(y)) => S::Circle(lerp_val(x, y, t)),
        (S::Ellipse(x1, y1), S::Ellipse(x2, y2)) => {
            S::Ellipse(lerp_val(x1, x2, t), lerp_val(y1, y2, t))
        }
        _ => b,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bevy::color::Color;
    use bevy::ui::{
        AngularColorStop, ColorStop, ConicGradient, Gradient, InterpolationColorSpace,
        LinearGradient, RadialGradient, RadialGradientShape, UiPosition, Val,
    };

    fn stop(color: Color, point: Val, hint: f32) -> ColorStop {
        ColorStop { color, point, hint }
    }

    fn linear(angle: f32, stops: Vec<ColorStop>) -> Gradient {
        Gradient::Linear(LinearGradient {
            color_space: InterpolationColorSpace::default(),
            angle,
            stops,
        })
    }

    fn radial(position: UiPosition, shape: RadialGradientShape, stops: Vec<ColorStop>) -> Gradient {
        Gradient::Radial(RadialGradient {
            color_space: InterpolationColorSpace::default(),
            position,
            shape,
            stops,
        })
    }

    fn conic(start: f32, position: UiPosition, stops: Vec<AngularColorStop>) -> Gradient {
        Gradient::Conic(ConicGradient {
            color_space: InterpolationColorSpace::default(),
            start,
            position,
            stops,
        })
    }

    fn two_stops() -> Vec<ColorStop> {
        vec![
            stop(Color::srgba(1.0, 0.0, 0.0, 1.0), Val::Px(0.0), 0.5),
            stop(Color::srgba(0.0, 0.0, 1.0, 1.0), Val::Px(100.0), 0.5),
        ]
    }

    fn assert_close(a: f32, b: f32, what: &str) {
        assert!((a - b).abs() < 1e-5, "{what}: {a} vs {b}");
    }

    // -- classification --

    #[test]
    fn matched_linear_pair_is_alignable() {
        let from = [linear(0.0, two_stops())];
        let to = [linear(1.0, two_stops())];
        assert!(gradients_alignable(&from, &to));
    }

    #[test]
    fn kind_mismatch_is_not_alignable() {
        let from = [linear(0.0, two_stops())];
        let to = [radial(
            UiPosition::CENTER,
            RadialGradientShape::ClosestSide,
            two_stops(),
        )];
        assert!(!gradients_alignable(&from, &to));
    }

    #[test]
    fn stop_count_mismatch_is_not_alignable() {
        let mut three = two_stops();
        three.push(stop(Color::WHITE, Val::Px(200.0), 0.5));
        let from = [linear(0.0, two_stops())];
        let to = [linear(0.0, three)];
        assert!(!gradients_alignable(&from, &to));
    }

    #[test]
    fn color_space_mismatch_is_not_alignable() {
        let from = [linear(0.0, two_stops())];
        let to = [Gradient::Linear(LinearGradient {
            color_space: InterpolationColorSpace::Srgba,
            angle: 0.0,
            stops: two_stops(),
        })];
        assert!(!gradients_alignable(&from, &to));
    }

    #[test]
    fn radial_position_mismatch_is_not_alignable() {
        let shape = RadialGradientShape::ClosestSide;
        let from = [radial(UiPosition::CENTER, shape, two_stops())];
        let to = [radial(UiPosition::TOP_LEFT, shape, two_stops())];
        assert!(!gradients_alignable(&from, &to));
    }

    #[test]
    fn radial_shape_variant_mismatch_is_not_alignable() {
        let from = [radial(
            UiPosition::CENTER,
            RadialGradientShape::ClosestSide,
            two_stops(),
        )];
        let to = [radial(
            UiPosition::CENTER,
            RadialGradientShape::Circle(Val::Px(10.0)),
            two_stops(),
        )];
        assert!(!gradients_alignable(&from, &to));
    }

    #[test]
    fn radial_keyword_mismatch_is_not_alignable() {
        let from = [radial(
            UiPosition::CENTER,
            RadialGradientShape::ClosestSide,
            two_stops(),
        )];
        let to = [radial(
            UiPosition::CENTER,
            RadialGradientShape::FarthestSide,
            two_stops(),
        )];
        assert!(!gradients_alignable(&from, &to));
    }

    #[test]
    fn list_length_mismatch_is_not_alignable() {
        let from = [linear(0.0, two_stops())];
        let to = [linear(0.0, two_stops()), linear(1.0, two_stops())];
        assert!(!gradients_alignable(&from, &to));
    }

    #[test]
    fn conic_start_difference_is_alignable() {
        // `start` is a lerped leaf, not a categorical field.
        let stops = vec![
            AngularColorStop {
                color: Color::WHITE,
                angle: Some(0.0),
                hint: 0.5,
            },
            AngularColorStop {
                color: Color::BLACK,
                angle: Some(1.0),
                hint: 0.5,
            },
        ];
        let from = [conic(0.0, UiPosition::CENTER, stops.clone())];
        let to = [conic(2.0, UiPosition::CENTER, stops)];
        assert!(gradients_alignable(&from, &to));
    }

    // -- interpolation --

    #[test]
    fn matched_linear_lerps_angle_colors_hints_positions() {
        let from = [linear(
            350f32.to_radians(),
            vec![
                stop(Color::srgba(1.0, 0.0, 0.0, 1.0), Val::Px(0.0), 0.0),
                stop(Color::srgba(0.0, 0.0, 1.0, 1.0), Val::Px(100.0), 0.5),
            ],
        )];
        let to = [linear(
            10f32.to_radians(),
            vec![
                stop(Color::srgba(0.0, 0.0, 1.0, 0.0), Val::Px(50.0), 1.0),
                stop(Color::srgba(1.0, 0.0, 0.0, 1.0), Val::Px(200.0), 0.5),
            ],
        )];
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Linear(g) = &out[0] else {
            panic!("expected linear, got {:?}", out[0]);
        };
        // Numeric angle lerp: 350° → 10° passes THROUGH 180° (CSS long-way),
        // it does not wrap the short way through 0°.
        assert_close(g.angle, 180f32.to_radians(), "angle");
        // Stop colors lerp component-wise in sRGB, straight alpha.
        let c = g.stops[0].color.to_srgba();
        assert_close(c.red, 0.5, "red");
        assert_close(c.green, 0.0, "green");
        assert_close(c.blue, 0.5, "blue");
        assert_close(c.alpha, 0.5, "alpha");
        // Hint lerps.
        assert_close(g.stops[0].hint, 0.5, "hint");
        // Explicit same-unit positions lerp.
        assert_eq!(g.stops[0].point, Val::Px(25.0));
        assert_eq!(g.stops[1].point, Val::Px(150.0));
    }

    #[test]
    fn position_unit_mismatch_snaps_to_target_mid_ease() {
        let from = [linear(
            0.0,
            vec![
                stop(Color::WHITE, Val::Px(10.0), 0.5),
                stop(Color::BLACK, Val::Px(0.0), 0.5),
            ],
        )];
        let to = [linear(
            0.0,
            vec![
                stop(Color::WHITE, Val::Percent(50.0), 0.5),
                stop(Color::BLACK, Val::Px(0.0), 0.5),
            ],
        )];
        let out = lerp_gradients(&from, &to, 0.25);
        let Gradient::Linear(g) = &out[0] else {
            panic!("expected linear");
        };
        assert_eq!(g.stops[0].point, Val::Percent(50.0));
    }

    #[test]
    fn position_auto_vs_px_snaps_to_target() {
        let from = [linear(0.0, vec![stop(Color::WHITE, Val::Auto, 0.5)])];
        let to = [linear(0.0, vec![stop(Color::WHITE, Val::Px(40.0), 0.5)])];
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Linear(g) = &out[0] else {
            panic!("expected linear");
        };
        assert_eq!(g.stops[0].point, Val::Px(40.0));
    }

    #[test]
    fn conic_angle_presence_mismatch_snaps_to_target() {
        let from = [conic(
            0.0,
            UiPosition::CENTER,
            vec![AngularColorStop {
                color: Color::WHITE,
                angle: Some(1.0),
                hint: 0.5,
            }],
        )];
        let to = [conic(
            0.0,
            UiPosition::CENTER,
            vec![AngularColorStop {
                color: Color::WHITE,
                angle: None,
                hint: 0.5,
            }],
        )];
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Conic(g) = &out[0] else {
            panic!("expected conic");
        };
        assert_eq!(g.stops[0].angle, None);
    }

    #[test]
    fn radial_circle_mid_ease_lerps_radius() {
        let from = [radial(
            UiPosition::CENTER,
            RadialGradientShape::Circle(Val::Px(10.0)),
            two_stops(),
        )];
        let to = [radial(
            UiPosition::CENTER,
            RadialGradientShape::Circle(Val::Px(90.0)),
            two_stops(),
        )];
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Radial(g) = &out[0] else {
            panic!("expected radial");
        };
        assert_eq!(g.shape, RadialGradientShape::Circle(Val::Px(50.0)));
    }

    #[test]
    fn radial_ellipse_mid_ease_lerps_both_axes() {
        let from = [radial(
            UiPosition::CENTER,
            RadialGradientShape::Ellipse(Val::Px(10.0), Val::Px(20.0)),
            two_stops(),
        )];
        let to = [radial(
            UiPosition::CENTER,
            RadialGradientShape::Ellipse(Val::Px(30.0), Val::Px(60.0)),
            two_stops(),
        )];
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Radial(g) = &out[0] else {
            panic!("expected radial");
        };
        assert_eq!(
            g.shape,
            RadialGradientShape::Ellipse(Val::Px(20.0), Val::Px(40.0))
        );
    }

    #[test]
    fn radial_circle_unit_mismatch_aligns_but_snaps_radius() {
        let from = [radial(
            UiPosition::CENTER,
            RadialGradientShape::Circle(Val::Px(10.0)),
            two_stops(),
        )];
        let to = [radial(
            UiPosition::CENTER,
            RadialGradientShape::Circle(Val::Percent(50.0)),
            two_stops(),
        )];
        // Same VARIANT aligns — only the radius leaf snaps (the `lerp_val` rule).
        assert!(gradients_alignable(&from, &to));
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Radial(g) = &out[0] else {
            panic!("expected radial");
        };
        assert_eq!(g.shape, RadialGradientShape::Circle(Val::Percent(50.0)));
    }

    #[test]
    fn conic_mid_ease_lerps_start_and_stop_colors() {
        let from = [conic(
            0.0,
            UiPosition::CENTER,
            vec![AngularColorStop {
                color: Color::srgba(1.0, 0.0, 0.0, 1.0),
                angle: Some(0.0),
                hint: 0.0,
            }],
        )];
        let to = [conic(
            2.0,
            UiPosition::CENTER,
            vec![AngularColorStop {
                color: Color::srgba(0.0, 0.0, 1.0, 0.0),
                angle: Some(1.0),
                hint: 1.0,
            }],
        )];
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Conic(g) = &out[0] else {
            panic!("expected conic");
        };
        assert_close(g.start, 1.0, "start");
        let c = g.stops[0].color.to_srgba();
        assert_close(c.red, 0.5, "red");
        assert_close(c.green, 0.0, "green");
        assert_close(c.blue, 0.5, "blue");
        assert_close(c.alpha, 0.5, "alpha");
        assert_eq!(g.stops[0].angle, Some(0.5));
        assert_close(g.stops[0].hint, 0.5, "hint");
    }

    #[test]
    fn conic_none_to_some_angle_snaps_to_target() {
        let from = [conic(
            0.0,
            UiPosition::CENTER,
            vec![AngularColorStop {
                color: Color::WHITE,
                angle: None,
                hint: 0.5,
            }],
        )];
        let to = [conic(
            0.0,
            UiPosition::CENTER,
            vec![AngularColorStop {
                color: Color::WHITE,
                angle: Some(2.0),
                hint: 0.5,
            }],
        )];
        let out = lerp_gradients(&from, &to, 0.5);
        let Gradient::Conic(g) = &out[0] else {
            panic!("expected conic");
        };
        assert_eq!(g.stops[0].angle, Some(2.0));
    }

    #[test]
    fn overshoot_extrapolates_numeric_leaves_and_keeps_snaps() {
        // Spring overshoot: `t` past 1.0 extrapolates numeric leaves linearly;
        // snapped leaves (unit mismatch) stay at the target, never past it.
        let from = [linear(
            0.0,
            vec![
                stop(Color::WHITE, Val::Px(0.0), 0.5),
                stop(Color::WHITE, Val::Px(10.0), 0.5),
            ],
        )];
        let to = [linear(
            1.0,
            vec![
                stop(Color::WHITE, Val::Px(100.0), 0.5),
                stop(Color::WHITE, Val::Percent(50.0), 0.5),
            ],
        )];
        let out = lerp_gradients(&from, &to, 1.25);
        let Gradient::Linear(g) = &out[0] else {
            panic!("expected linear");
        };
        assert_close(g.angle, 1.25, "angle extrapolates");
        assert_eq!(g.stops[0].point, Val::Px(125.0));
        assert_eq!(g.stops[1].point, Val::Percent(50.0));
    }

    #[test]
    fn empty_lists_align_and_lerp_to_empty() {
        assert!(gradients_alignable(&[], &[]));
        assert_eq!(lerp_gradients(&[], &[], 0.5), Vec::<Gradient>::new());
    }

    #[cfg(debug_assertions)]
    #[test]
    #[should_panic(expected = "alignable")]
    fn lerp_of_misaligned_lists_panics_in_debug() {
        let from = [linear(0.0, two_stops())];
        let to = [radial(
            UiPosition::CENTER,
            RadialGradientShape::ClosestSide,
            two_stops(),
        )];
        // Even the t == 0.0 endpoint short-circuit must not mask misuse.
        let _ = lerp_gradients(&from, &to, 0.0);
    }

    #[test]
    fn endpoints_are_bit_exact() {
        let from = vec![
            linear(350f32.to_radians(), two_stops()),
            radial(
                UiPosition::CENTER,
                RadialGradientShape::Circle(Val::Px(10.0)),
                two_stops(),
            ),
        ];
        let to = vec![
            linear(10f32.to_radians(), two_stops()),
            radial(
                UiPosition::CENTER,
                RadialGradientShape::Circle(Val::Px(90.0)),
                two_stops(),
            ),
        ];
        assert_eq!(lerp_gradients(&from, &to, 0.0), from);
        assert_eq!(lerp_gradients(&from, &to, 1.0), to);
    }
}
