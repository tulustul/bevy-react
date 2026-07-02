#![cfg_attr(docsrs, feature(doc_auto_cfg))]
//! `ReactUiAnimationsPlugin` — a Reanimated-style animation engine for
//! `bevy-react`.
//!
//! The model mirrors React Native's Reanimated: a React app declares **shared
//! values** (one animatable `f32` with a stable id) and assigns **drivers**
//! (`withTiming`, `withSpring`, `withRepeat`, `withSequence`) to them; an
//! `Animated.node` binds style properties to those values. All per-frame work —
//! advancing drivers, interpolation, writing components — happens **here, on the
//! Bevy side**, never crossing back to JS. The one exception is completion:
//! a driver started with a correlation token reports its settlement (one
//! [`AnimationSettled`] message, forwarded by the integrator) so a JS callback
//! can fire — once per animation, not per frame.
//!
//! This crate is deliberately decoupled from the main `bevy-react` crate (which
//! depends on it): it owns the animation wire types ([`mod@protocol`]) and the
//! orchestration systems, and receives commands through an [`AnimationInbox`]
//! channel the integrator hands it.

use std::collections::HashMap;

use bevy::ecs::query::QueryData;
use bevy::prelude::*;
use bevy::ui::UiTransform;
use crossbeam_channel::Receiver;

pub mod protocol;
mod runner;

pub use protocol::{
    AnimatableProperty, AnimatedBindings, AnimationCommand, Binding, Driver, Easing, SharedId,
    ValueKind,
};
pub use runner::{Runner, build_runner};

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
            .add_message::<AnimationSettled>()
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

/// A token-tagged driver settled: `finished` is `true` when it ran to its natural
/// end, `false` when a `set`/`cancel`/new `animate` interrupted it. Written by
/// the drain/tick systems for every [`AnimationCommand::Animate`] that carried a
/// `token`; the integrator (`bevy-react`) forwards these to the JS completion
/// callbacks. The one thing this crate sends back toward JS.
#[derive(Message, Debug, Clone, Copy, PartialEq, Eq)]
pub struct AnimationSettled {
    /// The shared value the driver was animating.
    pub id: SharedId,
    /// The JS-side correlation token from the `animate` command.
    pub token: u64,
    /// Natural completion (`true`) vs interruption (`false`).
    pub finished: bool,
}

/// The receiving end of the `op_animate` channel, drained each frame.
#[derive(Resource)]
pub struct AnimationInbox(pub(crate) Receiver<AnimationCommand>);

/// The live table of shared values, keyed by [`SharedId`]. Each entry holds the
/// current reading plus an optional active driver. Settlements of token-tagged
/// drivers accumulate in `settled` until the owning system flushes them to the
/// [`AnimationSettled`] message stream.
#[derive(Resource, Default)]
pub struct SharedValues {
    values: HashMap<SharedId, SharedValueState>,
    settled: Vec<AnimationSettled>,
}

struct SharedValueState {
    current: f32,
    active: Option<Runner>,
    /// Correlation token of the active driver's JS completion callback, if any.
    token: Option<u64>,
}

impl SharedValueState {
    /// The settlement for interrupting a still-active token-tagged driver
    /// (`set`/`cancel`/a superseding `animate`), consuming the token.
    fn interrupted(&mut self, id: SharedId) -> Option<AnimationSettled> {
        self.active.as_ref()?;
        let token = self.token.take()?;
        Some(AnimationSettled {
            id,
            token,
            finished: false,
        })
    }
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
            token: None,
        });
    }

    fn set(&mut self, id: SharedId, value: f32) {
        let s = self.values.entry(id).or_insert(SharedValueState {
            current: value,
            active: None,
            token: None,
        });
        self.settled.extend(s.interrupted(id));
        s.current = value;
        s.active = None;
    }

    fn animate(&mut self, id: SharedId, driver: &Driver, token: Option<u64>) {
        let s = self.values.entry(id).or_insert(SharedValueState {
            current: 0.0,
            active: None,
            token: None,
        });
        self.settled.extend(s.interrupted(id));
        let from = s.current;
        s.active = Some(build_runner(driver, from));
        s.token = token;
    }

    fn cancel(&mut self, id: SharedId) {
        if let Some(s) = self.values.get_mut(&id) {
            self.settled.extend(s.interrupted(id));
            s.active = None;
        }
    }

    fn clear(&mut self) {
        self.values.clear();
        // Reset also wipes the JS callback registry, so pending settlements would
        // land on nobody — drop them.
        self.settled.clear();
    }

    fn tick(&mut self, dt: f32) {
        for (&id, s) in self.values.iter_mut() {
            if let Some(runner) = s.active.as_mut() {
                let (value, finished) = runner.step(dt);
                s.current = value;
                if finished {
                    s.active = None;
                    if let Some(token) = s.token.take() {
                        self.settled.push(AnimationSettled {
                            id,
                            token,
                            finished: true,
                        });
                    }
                }
            }
        }
    }

    /// Flush the settlements accumulated since the last flush.
    fn take_settled(&mut self) -> Vec<AnimationSettled> {
        std::mem::take(&mut self.settled)
    }
}

// --- Systems -------------------------------------------------------------------

fn drain_animation_commands(
    inbox: Res<AnimationInbox>,
    mut values: ResMut<SharedValues>,
    mut settled: MessageWriter<AnimationSettled>,
) {
    while let Ok(cmd) = inbox.0.try_recv() {
        match cmd {
            AnimationCommand::Declare { id, initial } => values.declare(id, initial),
            AnimationCommand::Set { id, value } => values.set(id, value),
            AnimationCommand::Animate { id, driver, token } => values.animate(id, &driver, token),
            AnimationCommand::Cancel { id } => values.cancel(id),
            AnimationCommand::Clear => values.clear(),
        }
    }
    settled.write_batch(values.take_settled());
}

fn tick_animations(
    time: Res<Time>,
    mut values: ResMut<SharedValues>,
    mut settled: MessageWriter<AnimationSettled>,
) {
    values.tick(time.delta_secs());
    settled.write_batch(values.take_settled());
}

/// The components an animated node can drive. A `QueryData` struct (rather than a
/// tuple) so a new animatable target component is one field, not a tuple-arity
/// problem. Every visual/layout target is optional except `UiTransform` (required
/// by [`AnimatedNode`]).
#[derive(QueryData)]
#[query_data(mutable)]
struct AnimTargets {
    transform: &'static mut UiTransform,
    bg: Option<&'static mut BackgroundColor>,
    border: Option<&'static mut BorderColor>,
    text: Option<&'static mut TextColor>,
    image: Option<&'static mut ImageNode>,
    node: Option<&'static mut Node>,
}

fn apply_animated_nodes(
    mut commands: Commands,
    values: Res<SharedValues>,
    mut query: Query<(Entity, &AnimatedNode, AnimTargets)>,
) {
    use AnimatableProperty as P;
    for (entity, anim, mut t) in &mut query {
        let b = &anim.0;

        // Stage 1 — transform group: rebuild the whole `UiTransform` from the six
        // channels each frame (unbound channels stay at identity). Grouped because
        // scale precedence (`scale` vs `scaleX`/`scaleY`) needs all channels at once.
        // Compare-before-write (here and in every stage below): the read goes
        // through `Deref` (no change mark), only the assignment through `DerefMut`
        // — so a settled binding doesn't dirty change detection every frame.
        if b.has_transform() {
            let new = build_ui_transform(
                b.get(P::TranslateX)
                    .and_then(|x| eval_scalar(x, &values))
                    .map(Val::Px),
                b.get(P::TranslateY)
                    .and_then(|x| eval_scalar(x, &values))
                    .map(Val::Px),
                b.get(P::Scale).and_then(|x| eval_scalar(x, &values)),
                b.get(P::ScaleX).and_then(|x| eval_scalar(x, &values)),
                b.get(P::ScaleY).and_then(|x| eval_scalar(x, &values)),
                b.get(P::Rotate).and_then(|x| eval_scalar(x, &values)),
            );
            if *t.transform != new {
                *t.transform = new;
            }
        }

        // Opacity owns the final alpha across background/text/image (stage 3).
        // Resolved once up front so stage 2 can bake it into any color it writes —
        // otherwise the two stages would ping-pong the alpha every frame and the
        // compare-before-write guards would never settle.
        let opacity_alpha = b.get(P::Opacity).and_then(|x| eval_scalar(x, &values));

        // Stage 2 — every non-transform, non-opacity binding. Colors land on their
        // component; lengths/scalars land on `Node`. Opacity is deferred to stage 3
        // so it owns the final alpha after any color write (the original ordering).
        for (&property, binding) in b.iter() {
            if property.is_transform() || property == P::Opacity {
                continue;
            }
            match property.value_kind() {
                ValueKind::Color => {
                    let Some(mut rgba) = eval_color(binding, &values) else {
                        continue;
                    };
                    // Bake the final alpha in for the components stage 3 drives
                    // (border is not one of them: opacity never touches it).
                    if matches!(property, P::BackgroundColor | P::Color)
                        && let Some(alpha) = opacity_alpha
                    {
                        rgba[3] = alpha;
                    }
                    let color = Color::srgba(rgba[0], rgba[1], rgba[2], rgba[3]);
                    match property {
                        P::BackgroundColor => match &mut t.bg {
                            Some(c) if c.0 != color => c.0 = color,
                            Some(_) => {}
                            None => {
                                commands.entity(entity).insert(BackgroundColor(color));
                            }
                        },
                        P::BorderColor => {
                            let bc = BorderColor {
                                top: color,
                                right: color,
                                bottom: color,
                                left: color,
                            };
                            match &mut t.border {
                                Some(c) if **c != bc => **c = bc,
                                Some(_) => {}
                                None => {
                                    commands.entity(entity).insert(bc);
                                }
                            }
                        }
                        P::Color => {
                            if let Some(tc) = &mut t.text
                                && tc.0 != color
                            {
                                tc.0 = color;
                            }
                        }
                        _ => {}
                    }
                }
                // Length/Scalar (and the unused Angle) all target `Node` here —
                // transform's Length/Scalar/Angle members were handled in stage 1.
                _ => {
                    let Some(v) = eval_scalar(binding, &values) else {
                        continue;
                    };
                    if let Some(node) = t.node.as_mut() {
                        write_node_value(node, property, v);
                    }
                }
            }
        }

        // Stage 3 — opacity owns the final alpha across background/text/image.
        if let Some(alpha) = opacity_alpha {
            let with_alpha = |color: Color| -> Option<Color> {
                let mut s = color.to_srgba();
                (s.alpha != alpha).then(|| {
                    s.alpha = alpha;
                    Color::Srgba(s)
                })
            };
            if let Some(c) = &mut t.bg
                && let Some(new) = with_alpha(c.0)
            {
                c.0 = new;
            }
            if let Some(tc) = &mut t.text
                && let Some(new) = with_alpha(tc.0)
            {
                tc.0 = new;
            }
            if let Some(img) = &mut t.image
                && let Some(new) = with_alpha(img.color)
            {
                img.color = new;
            }
        }
    }
}

/// Write a resolved scalar onto the matching `Node` layout field — but only when
/// it actually differs from the live value. Writing `Node` re-triggers Bevy's
/// layout, so the compare keeps a settled length binding from forcing a relayout
/// every frame (the read goes through `Deref`, only the assignment through
/// `DerefMut`, so an unchanged value never trips change detection). It also means a
/// re-render that resets `Node` to its static style is corrected next frame.
/// Lengths resolve to `Val::Px`: the imperative animation surface is scalar `f32`.
fn write_node_value<N: std::ops::DerefMut<Target = Node>>(
    node: &mut N,
    property: AnimatableProperty,
    v: f32,
) {
    use AnimatableProperty as P;
    let val = Val::Px(v);
    // Each arm's guard reads the live field through `Deref` (no change mark) and
    // the body writes through `DerefMut` (marks changed) only when it differs — so
    // a settled binding never forces a relayout. `Gap` writes both axes.
    match property {
        P::Width if node.width != val => node.width = val,
        P::Height if node.height != val => node.height = val,
        P::MinWidth if node.min_width != val => node.min_width = val,
        P::MinHeight if node.min_height != val => node.min_height = val,
        P::MaxWidth if node.max_width != val => node.max_width = val,
        P::MaxHeight if node.max_height != val => node.max_height = val,
        P::Left if node.left != val => node.left = val,
        P::Right if node.right != val => node.right = val,
        P::Top if node.top != val => node.top = val,
        P::Bottom if node.bottom != val => node.bottom = val,
        P::FlexBasis if node.flex_basis != val => node.flex_basis = val,
        P::Gap => {
            if node.row_gap != val {
                node.row_gap = val;
            }
            if node.column_gap != val {
                node.column_gap = val;
            }
        }
        P::RowGap if node.row_gap != val => node.row_gap = val,
        P::ColumnGap if node.column_gap != val => node.column_gap = val,
        P::AspectRatio if node.aspect_ratio != Some(v) => node.aspect_ratio = Some(v),
        _ => {}
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
fn piecewise(x: f32, input: &[f32], output: &[f32]) -> f32 {
    if input.is_empty() || output.is_empty() {
        return x;
    }
    piecewise_impl(x, input, output)
}

/// Per-channel piecewise-linear color interpolation (rgba in `0.0..=1.0`).
fn piecewise_color(x: f32, input: &[f32], output: &[[f32; 4]]) -> [f32; 4] {
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

// (Driver runtime — `Runner`, `build_runner`, easing — lives in `runner.rs`.)

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
    fn shared_values_animate_and_tick_to_target() {
        let mut values = SharedValues::default();
        values.declare(1, 0.0);
        values.animate(1, &timing(100.0, 1.0), None);
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

    /// A token-tagged driver reports exactly one `finished: true` settlement when
    /// it runs to its natural end — and nothing at all without a token.
    #[test]
    fn tokened_driver_settles_finished_once() {
        let mut values = SharedValues::default();
        values.declare(1, 0.0);
        values.animate(1, &timing(100.0, 1.0), Some(7));
        values.tick(0.5);
        assert!(values.take_settled().is_empty(), "not settled yet");
        values.tick(0.5);
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 7,
                finished: true
            }]
        );
        values.tick(1.0);
        assert!(values.take_settled().is_empty(), "reported exactly once");

        // Token-free drivers stay silent.
        values.animate(1, &timing(0.0, 0.1), None);
        values.tick(1.0);
        assert!(values.take_settled().is_empty());
    }

    /// Interrupting an active token-tagged driver — via `set`, `cancel`, or a
    /// superseding `animate` — reports `finished: false` for the old token.
    #[test]
    fn interrupting_a_tokened_driver_settles_unfinished() {
        let mut values = SharedValues::default();
        values.declare(1, 0.0);

        values.animate(1, &timing(100.0, 1.0), Some(1));
        values.set(1, 50.0);
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 1,
                finished: false
            }]
        );

        values.animate(1, &timing(100.0, 1.0), Some(2));
        values.cancel(1);
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 2,
                finished: false
            }]
        );

        values.animate(1, &timing(100.0, 1.0), Some(3));
        values.animate(1, &timing(0.0, 1.0), Some(4));
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 3,
                finished: false
            }]
        );

        // `clear` (reset/hot reload) drops pending settlements silently.
        values.clear();
        assert!(values.take_settled().is_empty());
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

        // `animate` decodes with and without the completion-callback token (the
        // JS side omits the key entirely when no callback was passed).
        let cmd: AnimationCommand = serde_json::from_str(
            r#"{ "kind": "animate", "id": 1,
                 "driver": { "type": "timing", "to": 1 }, "token": 9 }"#,
        )
        .unwrap();
        assert!(matches!(
            cmd,
            AnimationCommand::Animate { token: Some(9), .. }
        ));
        let cmd: AnimationCommand = serde_json::from_str(
            r#"{ "kind": "animate", "id": 1, "driver": { "type": "timing", "to": 1 } }"#,
        )
        .unwrap();
        assert!(matches!(cmd, AnimationCommand::Animate { token: None, .. }));

        let bindings: AnimatedBindings = serde_json::from_str(
            r#"{ "translateX": { "type": "shared", "id": 1 },
                 "backgroundColor": { "type": "interpolateColor", "id": 1,
                     "input": [0, 1], "output": [[0,0,0,1],[1,1,1,1]] } }"#,
        )
        .unwrap();
        assert!(bindings.contains(AnimatableProperty::TranslateX));
        assert!(bindings.contains(AnimatableProperty::BackgroundColor));
        assert!(bindings.has_transform());
    }

    #[test]
    fn animated_bindings_skips_unknown_properties() {
        // A newer JS bundle can send a property this binary doesn't know yet; the
        // unknown key is skipped and the recognised ones still decode (rather than
        // the whole `animatedStyle` failing).
        let bindings: AnimatedBindings = serde_json::from_str(
            r#"{ "scale": { "type": "shared", "id": 7 },
                 "someFutureProp": { "type": "shared", "id": 8 } }"#,
        )
        .unwrap();
        assert!(bindings.contains(AnimatableProperty::Scale));
        assert!(bindings.has_transform());
        assert_eq!(bindings.iter().count(), 1, "unknown property dropped");
    }

    /// The table-driven applier writes the transform translation, the interpolated
    /// background color, and lets opacity own the final alpha — exactly the three
    /// stages (transform → color → opacity) the per-field applier did.
    #[test]
    fn apply_writes_transform_color_then_opacity() {
        let mut world = World::new();
        let mut values = SharedValues::default();
        values.set(1, 25.0); // translateX (px)
        values.set(2, 0.5); // opacity
        values.set(3, 0.0); // color progress → output[0] = red
        world.insert_resource(values);

        let bindings: AnimatedBindings = serde_json::from_value(serde_json::json!({
            "translateX": { "type": "shared", "id": 1 },
            "opacity": { "type": "shared", "id": 2 },
            "backgroundColor": { "type": "interpolateColor", "id": 3,
                "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] },
        }))
        .unwrap();

        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                BackgroundColor(Color::WHITE),
            ))
            .id();

        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
        schedule.run(&mut world);

        let t = world.entity(e).get::<UiTransform>().unwrap();
        assert_eq!(t.translation.x, Val::Px(25.0));

        // Color resolved to red, then opacity overwrote alpha to 0.5.
        let s = world
            .entity(e)
            .get::<BackgroundColor>()
            .unwrap()
            .0
            .to_srgba();
        assert!((s.red - 1.0).abs() < 1e-4);
        assert!(s.green.abs() < 1e-4);
        assert!(s.blue.abs() < 1e-4);
        assert!((s.alpha - 0.5).abs() < 1e-4, "opacity owns final alpha");
    }

    /// A layout length lands on `Node` (as px); a `borderColor` binding inserts a
    /// `BorderColor` on all sides when absent; and a re-render that resets `Node`
    /// is corrected on the next apply (the compare-before-write re-applies because
    /// the live value differs from the still-active binding's value).
    #[test]
    fn apply_drives_node_length_and_border_color() {
        let mut world = World::new();
        let mut values = SharedValues::default();
        values.set(10, 200.0); // width (px)
        values.set(11, 0.0); // border-color progress → output[0] = green
        world.insert_resource(values);

        let bindings: AnimatedBindings = serde_json::from_value(serde_json::json!({
            "width": { "type": "shared", "id": 10 },
            "borderColor": { "type": "interpolateColor", "id": 11,
                "input": [0, 1], "output": [[0, 1, 0, 1], [1, 0, 0, 1]] },
        }))
        .unwrap();

        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                Node::default(),
            ))
            .id();

        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
        schedule.run(&mut world);

        assert_eq!(world.entity(e).get::<Node>().unwrap().width, Val::Px(200.0));
        let bc = world.entity(e).get::<BorderColor>().unwrap();
        let s = bc.top.to_srgba();
        assert!(
            s.green > 0.9 && s.red < 0.1,
            "border resolved to green, got {s:?}"
        );
        assert_eq!(bc.left, bc.top, "all four sides set uniformly");

        // A re-render resets the static width; the still-active binding re-applies.
        world.entity_mut(e).get_mut::<Node>().unwrap().width = Val::Px(100.0);
        schedule.run(&mut world);
        assert_eq!(
            world.entity(e).get::<Node>().unwrap().width,
            Val::Px(200.0),
            "binding re-applies after a re-render reset"
        );
    }

    /// Once every bound shared value has settled, the apply system must stop
    /// marking the target components changed — otherwise every `Animated.node`
    /// keeps Bevy's transform propagation / render extraction hot forever.
    #[test]
    fn settled_apply_does_not_dirty_components() {
        #[derive(Resource, Default)]
        struct Dirty(usize);

        let mut world = World::new();
        let mut values = SharedValues::default();
        values.set(1, 25.0); // translateX (px)
        values.set(2, 0.5); // opacity
        values.set(3, 0.0); // color progress
        world.insert_resource(values);
        world.init_resource::<Dirty>();

        let bindings: AnimatedBindings = serde_json::from_value(serde_json::json!({
            "translateX": { "type": "shared", "id": 1 },
            "opacity": { "type": "shared", "id": 2 },
            "backgroundColor": { "type": "interpolateColor", "id": 3,
                "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] },
            "width": { "type": "shared", "id": 1 },
        }))
        .unwrap();

        world.spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            BackgroundColor(Color::WHITE),
            Node::default(),
        ));

        type AnyTargetChanged = Or<(
            Changed<UiTransform>,
            Changed<BackgroundColor>,
            Changed<Node>,
        )>;

        let mut apply = Schedule::default();
        apply.add_systems(apply_animated_nodes);
        // A separate schedule so the detector's change ticks span exactly one
        // apply run (Changed<> is relative to the detector's own last run).
        let mut detect = Schedule::default();
        detect.add_systems(|q: Query<(), AnyTargetChanged>, mut dirty: ResMut<Dirty>| {
            dirty.0 = q.iter().count();
        });

        apply.run(&mut world);
        detect.run(&mut world);
        assert!(
            world.resource::<Dirty>().0 > 0,
            "first apply must write the bound components"
        );

        apply.run(&mut world);
        detect.run(&mut world);
        assert_eq!(
            world.resource::<Dirty>().0,
            0,
            "an apply with settled values must not dirty anything"
        );
    }
}
