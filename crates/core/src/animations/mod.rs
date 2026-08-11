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

use bevy::prelude::*;
use bevy::ui::UiTransform;
use crossbeam_channel::Receiver;

mod apply;
mod eval;
pub(crate) mod props;
pub mod protocol;
mod runner;

use apply::apply_animated_nodes;
pub(crate) use apply::push_transform_dirt;
pub use eval::{Lerp, build_ui_transform};
use eval::{eval_color, eval_scalar};

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
            // The apply system reports content writes to the layer cache; the
            // integrator inits this too, but standalone use shouldn't panic.
            .init_resource::<crate::layer::LayerContentDirt>()
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

// (Driver runtime — `Runner`, `build_runner`, easing — lives in `runner.rs`.)

#[cfg(test)]
mod tests;
