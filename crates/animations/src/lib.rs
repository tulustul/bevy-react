//! `ReactUiAnimationsPlugin` — a Reanimated-style animation engine for
//! `bevy-react`.
//!
//! The model mirrors React Native's Reanimated: a React app declares **shared
//! values** (one animatable `f32` with a stable id) and assigns **drivers**
//! (`withTiming`, `withSpring`, `withRepeat`, `withSequence`) to them; an
//! `Animated.node` binds style properties to those values. All per-frame work —
//! advancing drivers, interpolation, writing components — happens **here, on the
//! Bevy side**, never crossing back to JS.
//!
//! This crate is deliberately decoupled from the main `bevy-react` crate (which
//! depends on it): it owns the animation wire types ([`mod@protocol`]) and the
//! orchestration systems, and receives commands through an [`AnimationInbox`]
//! channel the integrator hands it.

use std::collections::HashMap;

use bevy::prelude::*;
use bevy::ui::UiTransform;
use crossbeam_channel::Receiver;

pub mod protocol;

pub use protocol::{AnimatedBindings, AnimationCommand, Binding, Driver, Easing, SharedId};

/// Adds the animation orchestration: the [`SharedValues`] table, the per-frame
/// driver/apply systems, and the [`AnimationInbox`] that feeds commands in.
///
/// Added automatically by `bevy_react::ReactUiPlugin` unless
/// `.with_animations(false)`. The integrator is responsible for ordering
/// [`AnimationSet::Apply`] after the reconciler's op-apply so per-frame animation
/// writes win over this frame's static style.
pub struct ReactUiAnimationsPlugin {
    inbox: Receiver<AnimationCommand>,
}

impl ReactUiAnimationsPlugin {
    /// Build the plugin around the receiving end of the `op_animate` channel.
    pub fn new(inbox: Receiver<AnimationCommand>) -> Self {
        Self { inbox }
    }
}

impl Plugin for ReactUiAnimationsPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<SharedValues>()
            .insert_resource(AnimationInbox(self.inbox.clone()))
            .configure_sets(
                Update,
                (AnimationSet::Drain, AnimationSet::Tick, AnimationSet::Apply).chain(),
            )
            .add_systems(
                Update,
                (
                    drain_animation_commands.in_set(AnimationSet::Drain),
                    tick_animations.in_set(AnimationSet::Tick),
                    apply_animated_nodes.in_set(AnimationSet::Apply),
                ),
            );
    }
}

/// Ordering handles for the three animation systems. The integrator orders
/// [`AnimationSet::Apply`] relative to its own reconciler systems.
#[derive(SystemSet, Debug, Clone, PartialEq, Eq, Hash)]
pub enum AnimationSet {
    /// Drain inbound commands into the [`SharedValues`] table.
    Drain,
    /// Advance every active driver by the frame delta.
    Tick,
    /// Write resolved values onto `UiTransform` / colors.
    Apply,
}

/// Component placed (by the main reconciler) on any `Animated.node`. Carries the
/// property→[`Binding`] map. Requires `UiTransform` so the apply system can always
/// drive it.
#[derive(Component, Debug, Clone)]
#[require(UiTransform)]
pub struct AnimatedNode(pub AnimatedBindings);

/// The receiving end of the `op_animate` channel, drained each frame.
#[derive(Resource)]
pub struct AnimationInbox(pub(crate) Receiver<AnimationCommand>);

/// The live table of shared values, keyed by [`SharedId`]. Each entry holds the
/// current reading plus an optional active driver.
#[derive(Resource, Default)]
pub struct SharedValues {
    values: HashMap<SharedId, SharedValueState>,
}

struct SharedValueState {
    current: f32,
    active: Option<Runner>,
}

impl SharedValues {
    /// The current reading of a shared value, if it exists.
    pub fn get(&self, id: SharedId) -> Option<f32> {
        self.values.get(&id).map(|s| s.current)
    }

    /// Number of live shared values (handy in tests).
    pub fn len(&self) -> usize {
        self.values.len()
    }

    /// Whether the table is empty.
    pub fn is_empty(&self) -> bool {
        self.values.is_empty()
    }

    fn declare(&mut self, id: SharedId, initial: f32) {
        // Idempotent: only the first declaration sets the initial reading, so a
        // value survives React re-renders (matching `useSharedValue`).
        self.values.entry(id).or_insert(SharedValueState {
            current: initial,
            active: None,
        });
    }

    fn set(&mut self, id: SharedId, value: f32) {
        let s = self.values.entry(id).or_insert(SharedValueState {
            current: value,
            active: None,
        });
        s.current = value;
        s.active = None;
    }

    fn animate(&mut self, id: SharedId, driver: &Driver) {
        let s = self.values.entry(id).or_insert(SharedValueState {
            current: 0.0,
            active: None,
        });
        let from = s.current;
        s.active = Some(build_runner(driver, from));
    }

    fn cancel(&mut self, id: SharedId) {
        if let Some(s) = self.values.get_mut(&id) {
            s.active = None;
        }
    }

    fn clear(&mut self) {
        self.values.clear();
    }

    fn tick(&mut self, dt: f32) {
        for s in self.values.values_mut() {
            if let Some(runner) = s.active.as_mut() {
                let (value, finished) = runner.step(dt);
                s.current = value;
                if finished {
                    s.active = None;
                }
            }
        }
    }
}

// --- Systems -------------------------------------------------------------------

fn drain_animation_commands(inbox: Res<AnimationInbox>, mut values: ResMut<SharedValues>) {
    while let Ok(cmd) = inbox.0.try_recv() {
        match cmd {
            AnimationCommand::Declare { id, initial } => values.declare(id, initial),
            AnimationCommand::Set { id, value } => values.set(id, value),
            AnimationCommand::Animate { id, driver } => values.animate(id, &driver),
            AnimationCommand::Cancel { id } => values.cancel(id),
            AnimationCommand::Clear => values.clear(),
        }
    }
}

fn tick_animations(time: Res<Time>, mut values: ResMut<SharedValues>) {
    values.tick(time.delta_secs());
}

#[allow(clippy::type_complexity)]
fn apply_animated_nodes(
    mut commands: Commands,
    values: Res<SharedValues>,
    mut query: Query<(
        Entity,
        &AnimatedNode,
        &mut UiTransform,
        Option<&mut BackgroundColor>,
        Option<&mut TextColor>,
        Option<&mut ImageNode>,
    )>,
) {
    for (entity, anim, mut transform, bg, text_color, image) in &mut query {
        let b = &anim.0;

        // Transform channels rebuild the whole `UiTransform` from bindings each
        // frame (unbound channels stay at identity).
        if b.has_transform() {
            *transform = build_ui_transform(
                b.translate_x
                    .as_ref()
                    .and_then(|x| eval_scalar(x, &values))
                    .map(Val::Px),
                b.translate_y
                    .as_ref()
                    .and_then(|x| eval_scalar(x, &values))
                    .map(Val::Px),
                b.scale.as_ref().and_then(|x| eval_scalar(x, &values)),
                b.scale_x.as_ref().and_then(|x| eval_scalar(x, &values)),
                b.scale_y.as_ref().and_then(|x| eval_scalar(x, &values)),
                b.rotate.as_ref().and_then(|x| eval_scalar(x, &values)),
            );
        }

        let mut bg = bg;

        // Color before opacity, so opacity gets the last word on alpha.
        if let Some(binding) = &b.background_color
            && let Some(rgba) = eval_color(binding, &values)
        {
            let color = Color::srgba(rgba[0], rgba[1], rgba[2], rgba[3]);
            match &mut bg {
                Some(c) => c.0 = color,
                None => {
                    commands.entity(entity).insert(BackgroundColor(color));
                }
            }
        }

        if let Some(binding) = &b.opacity
            && let Some(alpha) = eval_scalar(binding, &values)
        {
            if let Some(c) = &mut bg {
                let mut s = c.0.to_srgba();
                s.alpha = alpha;
                c.0 = Color::Srgba(s);
            }
            if let Some(mut tc) = text_color {
                let mut s = tc.0.to_srgba();
                s.alpha = alpha;
                tc.0 = Color::Srgba(s);
            }
            if let Some(mut img) = image {
                let mut s = img.color.to_srgba();
                s.alpha = alpha;
                img.color = Color::Srgba(s);
            }
        }
    }
}

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

fn eval_scalar(binding: &Binding, values: &SharedValues) -> Option<f32> {
    match binding {
        Binding::Shared { id } => values.get(*id),
        Binding::Interpolate { id, input, output } => {
            Some(piecewise(values.get(*id)?, input, output))
        }
        Binding::InterpolateColor { .. } => None,
    }
}

fn eval_color(binding: &Binding, values: &SharedValues) -> Option<[f32; 4]> {
    match binding {
        Binding::InterpolateColor { id, input, output } => {
            Some(piecewise_color(values.get(*id)?, input, output))
        }
        _ => None,
    }
}

/// Piecewise-linear interpolation, clamped at the ends. `input` must be ascending.
fn piecewise(x: f32, input: &[f32], output: &[f32]) -> f32 {
    let n = input.len().min(output.len());
    if n == 0 {
        return x;
    }
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
            return output[i] + (output[i + 1] - output[i]) * t;
        }
    }
    output[n - 1]
}

/// Per-channel piecewise-linear color interpolation (rgba in `0.0..=1.0`).
fn piecewise_color(x: f32, input: &[f32], output: &[[f32; 4]]) -> [f32; 4] {
    let n = input.len().min(output.len());
    if n == 0 {
        return [0.0, 0.0, 0.0, 1.0];
    }
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
            let lo = output[i];
            let hi = output[i + 1];
            return [
                lo[0] + (hi[0] - lo[0]) * t,
                lo[1] + (hi[1] - lo[1]) * t,
                lo[2] + (hi[2] - lo[2]) * t,
                lo[3] + (hi[3] - lo[3]) * t,
            ];
        }
    }
    output[n - 1]
}

fn ease(easing: Easing, t: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    match easing {
        Easing::Linear => t,
        Easing::EaseIn => t * t * t,
        Easing::EaseOut => {
            let u = 1.0 - t;
            1.0 - u * u * u
        }
        Easing::EaseInOut => {
            if t < 0.5 {
                4.0 * t * t * t
            } else {
                let u = -2.0 * t + 2.0;
                1.0 - u * u * u / 2.0
            }
        }
    }
}

// --- Driver runtime ------------------------------------------------------------

const SPRING_REST_DELTA: f32 = 0.01;
const SPRING_REST_SPEED: f32 = 0.01;
const SPRING_SUBSTEP: f32 = 0.001;
const SPRING_MAX_SUBSTEPS: u32 = 64;

/// The stateful evaluation of a [`Driver`] over time. Built from a driver + the
/// value's live reading; advanced by [`Runner::step`].
///
/// Public so `bevy-react`'s CSS-like `transition` engine can reuse the exact same
/// driver runtime (the per-entity transition state holds a `Runner` per channel),
/// rather than re-implementing easing/spring integration.
pub enum Runner {
    /// Degenerate (empty sequence / zero-count repeat): already settled.
    Done(f32),
    Timing {
        from: f32,
        to: f32,
        duration: f32,
        easing: Easing,
        elapsed: f32,
    },
    Spring {
        to: f32,
        stiffness: f32,
        damping: f32,
        mass: f32,
        pos: f32,
        vel: f32,
    },
    Repeat {
        template: Box<Driver>,
        remaining: i32,
        reverse: bool,
        iteration: u32,
        a: f32,
        b: f32,
        child: Box<Runner>,
    },
    Sequence {
        steps: Vec<Driver>,
        index: usize,
        child: Box<Runner>,
    },
    Delay {
        remaining: f32,
        animation: Box<Driver>,
        from: f32,
        child: Option<Box<Runner>>,
    },
}

/// Build a [`Runner`] for `driver` starting from the value `from`. Public for the
/// `bevy-react` transition engine (see [`Runner`]).
pub fn build_runner(driver: &Driver, from: f32) -> Runner {
    build_runner_with_target(driver, from, None)
}

/// Build a runner; `target` overrides the natural endpoint for scalar drivers
/// (used by reverse-repeat to ping-pong). Composite drivers ignore it.
fn build_runner_with_target(driver: &Driver, from: f32, target: Option<f32>) -> Runner {
    match driver {
        Driver::Timing {
            to,
            duration,
            easing,
        } => Runner::Timing {
            from,
            to: target.unwrap_or(*to),
            duration: duration.max(0.0),
            easing: *easing,
            elapsed: 0.0,
        },
        Driver::Spring {
            to,
            stiffness,
            damping,
            mass,
        } => Runner::Spring {
            to: target.unwrap_or(*to),
            stiffness: *stiffness,
            damping: *damping,
            mass: mass.max(1e-4),
            pos: from,
            vel: 0.0,
        },
        Driver::Repeat {
            animation,
            count,
            reverse,
        } => {
            if *count == 0 {
                return Runner::Done(from);
            }
            Runner::Repeat {
                template: animation.clone(),
                remaining: *count,
                reverse: *reverse,
                iteration: 0,
                a: from,
                b: terminal_value(animation, from),
                child: Box::new(build_runner(animation, from)),
            }
        }
        Driver::Sequence { steps } => {
            if steps.is_empty() {
                return Runner::Done(from);
            }
            Runner::Sequence {
                steps: steps.clone(),
                index: 0,
                child: Box::new(build_runner(&steps[0], from)),
            }
        }
        Driver::Delay { delay, animation } => Runner::Delay {
            remaining: delay.max(0.0),
            animation: animation.clone(),
            from,
            child: None,
        },
    }
}

/// The value a driver settles on if run to completion from `from` (used to derive
/// repeat endpoints).
fn terminal_value(driver: &Driver, from: f32) -> f32 {
    match driver {
        Driver::Timing { to, .. } => *to,
        Driver::Spring { to, .. } => *to,
        Driver::Sequence { steps } => steps.iter().fold(from, |acc, s| terminal_value(s, acc)),
        Driver::Delay { animation, .. } => terminal_value(animation, from),
        Driver::Repeat {
            animation,
            count,
            reverse,
        } => {
            let a = from;
            let b = terminal_value(animation, from);
            if *count <= 0 {
                b
            } else if *reverse && count % 2 == 0 {
                a
            } else {
                b
            }
        }
    }
}

impl Runner {
    /// Advance by `dt` seconds, returning `(value, finished)`.
    pub fn step(&mut self, dt: f32) -> (f32, bool) {
        match self {
            Runner::Done(v) => (*v, true),
            Runner::Timing {
                from,
                to,
                duration,
                easing,
                elapsed,
            } => {
                *elapsed += dt;
                if *duration <= 0.0 {
                    return (*to, true);
                }
                let t = (*elapsed / *duration).clamp(0.0, 1.0);
                let v = *from + (*to - *from) * ease(*easing, t);
                (v, *elapsed >= *duration)
            }
            Runner::Spring {
                to,
                stiffness,
                damping,
                mass,
                pos,
                vel,
            } => {
                let n = ((dt / SPRING_SUBSTEP).ceil() as u32).clamp(1, SPRING_MAX_SUBSTEPS);
                let h = dt / n as f32;
                for _ in 0..n {
                    let force = -*stiffness * (*pos - *to) - *damping * *vel;
                    let acc = force / *mass;
                    *vel += acc * h;
                    *pos += *vel * h;
                }
                let settled =
                    (*pos - *to).abs() < SPRING_REST_DELTA && vel.abs() < SPRING_REST_SPEED;
                if settled {
                    *pos = *to;
                    *vel = 0.0;
                }
                (*pos, settled)
            }
            Runner::Repeat {
                template,
                remaining,
                reverse,
                iteration,
                a,
                b,
                child,
            } => {
                let (v, done) = child.step(dt);
                if !done {
                    return (v, false);
                }
                if *remaining > 0 {
                    *remaining -= 1;
                    if *remaining == 0 {
                        return (v, true);
                    }
                }
                *iteration += 1;
                let (from, target) = if *reverse {
                    if *iteration % 2 == 0 {
                        (*a, *b)
                    } else {
                        (*b, *a)
                    }
                } else {
                    (*a, *b)
                };
                **child = build_runner_with_target(template, from, Some(target));
                (v, false)
            }
            Runner::Sequence {
                steps,
                index,
                child,
            } => {
                let (v, done) = child.step(dt);
                if !done {
                    return (v, false);
                }
                if *index + 1 >= steps.len() {
                    return (v, true);
                }
                *index += 1;
                **child = build_runner(&steps[*index], v);
                (v, false)
            }
            Runner::Delay {
                remaining,
                animation,
                from,
                child,
            } => {
                if let Some(child) = child {
                    return child.step(dt);
                }
                *remaining -= dt;
                if *remaining > 0.0 {
                    return (*from, false);
                }
                // Delay elapsed: build the child and run it with the leftover time
                // (`-remaining`) so no time is lost crossing the boundary.
                let leftover = -*remaining;
                let mut runner = build_runner(animation, *from);
                let result = runner.step(leftover);
                *child = Some(Box::new(runner));
                result
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn timing(to: f32, duration: f32) -> Driver {
        Driver::Timing {
            to,
            duration,
            easing: Easing::Linear,
        }
    }

    /// Drive a runner to completion in fixed `dt` ticks, returning the final value.
    fn run_to_end(driver: &Driver, from: f32, dt: f32, max_ticks: usize) -> (f32, usize) {
        let mut r = build_runner(driver, from);
        for i in 0..max_ticks {
            let (v, done) = r.step(dt);
            if done {
                return (v, i + 1);
            }
        }
        panic!("runner did not finish in {max_ticks} ticks");
    }

    #[test]
    fn easing_endpoints_and_midpoint() {
        for e in [
            Easing::Linear,
            Easing::EaseIn,
            Easing::EaseOut,
            Easing::EaseInOut,
        ] {
            assert!((ease(e, 0.0) - 0.0).abs() < 1e-6, "{e:?} at 0");
            assert!((ease(e, 1.0) - 1.0).abs() < 1e-6, "{e:?} at 1");
        }
        assert!((ease(Easing::Linear, 0.5) - 0.5).abs() < 1e-6);
        // EaseIn is below the diagonal, EaseOut above, at the midpoint.
        assert!(ease(Easing::EaseIn, 0.5) < 0.5);
        assert!(ease(Easing::EaseOut, 0.5) > 0.5);
    }

    #[test]
    fn piecewise_clamps_and_interpolates() {
        let input = [0.0, 1.0];
        let output = [10.0, 20.0];
        assert_eq!(piecewise(-5.0, &input, &output), 10.0); // clamp low
        assert_eq!(piecewise(5.0, &input, &output), 20.0); // clamp high
        assert!((piecewise(0.5, &input, &output) - 15.0).abs() < 1e-6);
        // Multi-segment.
        let input = [0.0, 0.5, 1.0];
        let output = [0.0, 100.0, 0.0];
        assert!((piecewise(0.25, &input, &output) - 50.0).abs() < 1e-6);
        assert!((piecewise(0.75, &input, &output) - 50.0).abs() < 1e-6);
    }

    #[test]
    fn piecewise_color_interpolates_each_channel() {
        let input = [0.0, 1.0];
        let output = [[0.0, 0.0, 0.0, 1.0], [1.0, 0.5, 0.0, 1.0]];
        let mid = piecewise_color(0.5, &input, &output);
        assert!((mid[0] - 0.5).abs() < 1e-6);
        assert!((mid[1] - 0.25).abs() < 1e-6);
        assert!((mid[2] - 0.0).abs() < 1e-6);
        assert!((mid[3] - 1.0).abs() < 1e-6);
    }

    #[test]
    fn timing_runs_from_current_to_target() {
        let mut r = build_runner(&timing(100.0, 1.0), 0.0);
        let (v1, done1) = r.step(0.5);
        assert!(!done1);
        assert!((v1 - 50.0).abs() < 1e-3, "halfway expected ~50, got {v1}");
        let (v2, done2) = r.step(0.5);
        assert!(done2);
        assert!((v2 - 100.0).abs() < 1e-3, "end expected 100, got {v2}");
    }

    #[test]
    fn zero_duration_timing_snaps() {
        let mut r = build_runner(&timing(42.0, 0.0), 0.0);
        let (v, done) = r.step(0.016);
        assert!(done);
        assert_eq!(v, 42.0);
    }

    #[test]
    fn spring_settles_on_target() {
        let driver = Driver::Spring {
            to: 100.0,
            stiffness: 120.0,
            damping: 14.0,
            mass: 1.0,
        };
        let (v, ticks) = run_to_end(&driver, 0.0, 1.0 / 60.0, 2000);
        assert!(
            (v - 100.0).abs() < 0.1,
            "spring should settle near 100, got {v}"
        );
        assert!(ticks > 1, "spring should take multiple ticks");
    }

    #[test]
    fn delay_holds_then_runs_child() {
        // Hold at the start value for 0.5s, then time 10 -> 30 over 1s.
        let driver = Driver::Delay {
            delay: 0.5,
            animation: Box::new(timing(30.0, 1.0)),
        };
        let mut r = build_runner(&driver, 10.0);
        let (v1, d1) = r.step(0.25);
        assert!(!d1);
        assert!(
            (v1 - 10.0).abs() < 1e-6,
            "still holding, expected 10, got {v1}"
        );
        let (v2, d2) = r.step(0.25); // delay exactly elapses, child starts (0 leftover)
        assert!(!d2);
        assert!(
            (v2 - 10.0).abs() < 1e-3,
            "child at t=0 expected 10, got {v2}"
        );
        let (v3, _d3) = r.step(0.5); // halfway through the 1s timing
        assert!((v3 - 20.0).abs() < 1e-3, "halfway expected 20, got {v3}");
        let (v4, d4) = r.step(0.5);
        assert!(d4);
        assert!((v4 - 30.0).abs() < 1e-3, "end expected 30, got {v4}");
    }

    #[test]
    fn delay_carries_leftover_time_across_the_boundary() {
        // 0.1s delay, then a 1s timing 0 -> 100. A single 0.6s tick should burn
        // the delay and advance 0.5s into the timing (≈50), losing no time.
        let driver = Driver::Delay {
            delay: 0.1,
            animation: Box::new(timing(100.0, 1.0)),
        };
        let mut r = build_runner(&driver, 0.0);
        let (v, done) = r.step(0.6);
        assert!(!done);
        assert!(
            (v - 50.0).abs() < 1e-3,
            "expected ~50 after leftover, got {v}"
        );
    }

    #[test]
    fn zero_delay_runs_child_immediately() {
        // Covers the i = 0 stagger case: no hold, behaves like the bare child.
        let driver = Driver::Delay {
            delay: 0.0,
            animation: Box::new(timing(100.0, 1.0)),
        };
        let mut r = build_runner(&driver, 0.0);
        let (v, done) = r.step(0.5);
        assert!(!done);
        assert!(
            (v - 50.0).abs() < 1e-3,
            "zero delay should not hold, got {v}"
        );
    }

    #[test]
    fn delay_inside_repeated_sequence_composes() {
        // The exact demo shape: bounce -A -> +A with a stop at each end, looped.
        let amp = 100.0;
        let bounce = Driver::Repeat {
            animation: Box::new(Driver::Sequence {
                steps: vec![
                    Driver::Delay {
                        delay: 0.2,
                        animation: Box::new(timing(amp, 0.5)),
                    },
                    Driver::Delay {
                        delay: 0.2,
                        animation: Box::new(timing(-amp, 0.5)),
                    },
                ],
            }),
            count: -1,
            reverse: false,
        };
        let mut r = build_runner(&bounce, -amp);
        // Run a couple of seconds; it must stay bounded in [-amp, amp] and never finish.
        let mut min = f32::INFINITY;
        let mut max = f32::NEG_INFINITY;
        for _ in 0..240 {
            let (v, done) = r.step(1.0 / 60.0);
            assert!(!done, "infinite bounce must never finish");
            min = min.min(v);
            max = max.max(v);
        }
        assert!(
            min <= -amp + 1.0,
            "should reach the left extreme, min={min}"
        );
        assert!(
            max >= amp - 1.0,
            "should reach the right extreme, max={max}"
        );
        assert!(min >= -amp - 1e-3 && max <= amp + 1e-3, "must stay bounded");
    }

    #[test]
    fn sequence_chains_steps_from_previous_end() {
        // 0 -> 50 -> 120, each over 1s.
        let driver = Driver::Sequence {
            steps: vec![timing(50.0, 1.0), timing(120.0, 1.0)],
        };
        let mut r = build_runner(&driver, 0.0);
        let (v1, d1) = r.step(1.0); // first step done
        assert!(!d1);
        assert!(
            (v1 - 50.0).abs() < 1e-3,
            "after step 1 expected 50, got {v1}"
        );
        let (v2, _d2) = r.step(0.5); // halfway through second step: 50 -> 120
        assert!(
            (v2 - 85.0).abs() < 1.0,
            "midway second step expected ~85, got {v2}"
        );
        let (v3, d3) = r.step(0.5);
        assert!(d3);
        assert!(
            (v3 - 120.0).abs() < 1e-3,
            "sequence end expected 120, got {v3}"
        );
    }

    #[test]
    fn finite_repeat_finishes_after_count_cycles() {
        // Repeat a 1s timing twice, no reverse: each cycle 0 -> 10.
        let driver = Driver::Repeat {
            animation: Box::new(timing(10.0, 1.0)),
            count: 2,
            reverse: false,
        };
        let (v, _ticks) = run_to_end(&driver, 0.0, 0.25, 1000);
        assert!(
            (v - 10.0).abs() < 1e-3,
            "finite repeat ends at target, got {v}"
        );
    }

    #[test]
    fn reverse_repeat_ping_pongs_endpoints() {
        // 0 -> 10 then (reverse) 10 -> 0 over two cycles: ends back at 0.
        let driver = Driver::Repeat {
            animation: Box::new(timing(10.0, 1.0)),
            count: 2,
            reverse: true,
        };
        let (v, _ticks) = run_to_end(&driver, 0.0, 0.25, 1000);
        assert!(
            (v - 0.0).abs() < 1e-3,
            "reverse repeat returns to start, got {v}"
        );
        assert_eq!(terminal_value(&driver, 0.0), 0.0);
    }

    #[test]
    fn infinite_repeat_never_finishes() {
        let driver = Driver::Repeat {
            animation: Box::new(timing(10.0, 1.0)),
            count: -1,
            reverse: true,
        };
        let mut r = build_runner(&driver, 0.0);
        for _ in 0..1000 {
            let (_v, done) = r.step(0.1);
            assert!(!done, "infinite repeat must never report finished");
        }
    }

    #[test]
    fn shared_values_animate_and_tick_to_target() {
        let mut values = SharedValues::default();
        values.declare(1, 0.0);
        values.animate(1, &timing(100.0, 1.0));
        values.tick(0.5);
        assert!((values.get(1).unwrap() - 50.0).abs() < 1e-3);
        values.tick(0.5);
        assert!((values.get(1).unwrap() - 100.0).abs() < 1e-3);
        // Driver dropped once finished; further ticks are inert.
        values.tick(1.0);
        assert!((values.get(1).unwrap() - 100.0).abs() < 1e-3);
    }

    #[test]
    fn declare_is_idempotent_but_set_overrides() {
        let mut values = SharedValues::default();
        values.declare(1, 5.0);
        values.declare(1, 999.0); // ignored — keeps 5.0
        assert_eq!(values.get(1), Some(5.0));
        values.set(1, 7.0);
        assert_eq!(values.get(1), Some(7.0));
        values.clear();
        assert!(values.is_empty());
    }

    #[test]
    fn driver_deserializes_from_js_wire_shape() {
        // The exact JSON `animated.ts` produces for a nested driver.
        let json = r#"{
            "type": "repeat",
            "animation": {
                "type": "sequence",
                "steps": [
                    { "type": "timing", "to": 50, "duration": 0.4, "easing": "easeInOut" },
                    { "type": "spring", "to": 120, "stiffness": 120, "damping": 14, "mass": 1 }
                ]
            },
            "count": -1,
            "reverse": true
        }"#;
        let driver: Driver = serde_json::from_str(json).expect("driver decodes");
        assert!(matches!(
            driver,
            Driver::Repeat {
                count: -1,
                reverse: true,
                ..
            }
        ));
    }

    #[test]
    fn command_and_binding_deserialize() {
        let cmd: AnimationCommand =
            serde_json::from_str(r#"{ "kind": "declare", "id": 3, "initial": 0 }"#).unwrap();
        assert!(matches!(cmd, AnimationCommand::Declare { id: 3, .. }));
        let cmd: AnimationCommand = serde_json::from_str(r#"{ "kind": "clear" }"#).unwrap();
        assert!(matches!(cmd, AnimationCommand::Clear));

        let bindings: AnimatedBindings = serde_json::from_str(
            r#"{ "translateX": { "type": "shared", "id": 1 },
                 "backgroundColor": { "type": "interpolateColor", "id": 1,
                     "input": [0, 1], "output": [[0,0,0,1],[1,1,1,1]] } }"#,
        )
        .unwrap();
        assert!(bindings.translate_x.is_some());
        assert!(bindings.background_color.is_some());
        assert!(bindings.has_transform());
    }
}
