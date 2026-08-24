//! The scroll transition: easing `ScrollPosition` toward a controlled
//! target. Moved verbatim from the module root.

use bevy::prelude::*;
use bevy::ui::ScrollPosition;

use super::channels::Channel;
use super::spec::ChannelTransition;
use crate::protocol::style::Style;

/// The scroll-easing **spec** input: the `transition.scroll` timing, reinserted
/// fresh on every render (like [`TransitionInput`](super::TransitionInput))
/// so a changed spec takes effect.
/// Present only while `transition.scroll` is set. The *target* it eases
/// toward is NOT here — scroll's target is a controlled `Props` value, fed into
/// [`ScrollTransitionState`] by the scroll write path / wheel handler.
#[derive(Component, Debug, Clone)]
pub struct ScrollTransitionInput(pub ChannelTransition);

/// The scroll-easing **runtime state**: the target offset plus a per-axis eased
/// [`Channel`]. Persists across re-renders (`insert_if_new`). `target` is written
/// by the feeders (`crate::reconcile`'s `update_controlled_scroll` and
/// `crate::scroll::apply_scroll`); [`drive_scroll_transition`] eases `ScrollPosition`
/// toward it. Mirrors the [`TransitionState`](super::TransitionState) half of the split.
#[derive(Component, Default)]
pub struct ScrollTransitionState {
    /// The offset to ease toward (already clamped to the scroll range by the feeder).
    pub(crate) target: Vec2,
    x: Channel,
    y: Channel,
    initialized: bool,
}

impl ScrollTransitionState {
    /// Snap the eased state to `value`: target + both channels, runners dropped.
    /// Used when the offset is manipulated directly (scrollbar thumb drag /
    /// track click) so easing neither lags nor reverts the direct write.
    pub(crate) fn snap_to(&mut self, value: Vec2) {
        self.target = value;
        self.x.init(value.x);
        self.y.init(value.y);
        self.initialized = true;
    }
}

/// Stamp (or clear) the scroll-ease components from `transition.scroll`. Called
/// from the reconciler's generic node paths (scroll containers are plain `<node>`s),
/// alongside `apply_scroll_listener`/`apply_scroll_step`. The spec input is always
/// reinserted (so a spec change lands); the state is created once and persists.
pub fn apply_scroll_transition(ec: &mut EntityCommands, style: &Option<Style>) {
    match style
        .as_ref()
        .and_then(|s| s.transition.as_ref())
        .and_then(|t| t.for_scroll())
    {
        Some(spec) => {
            ec.insert(ScrollTransitionInput(spec.clone()));
            ec.insert_if_new(ScrollTransitionState::default());
        }
        None => {
            ec.remove::<ScrollTransitionInput>();
            ec.remove::<ScrollTransitionState>();
        }
    }
}

/// Ease each `ScrollTransitionState` node's `ScrollPosition` toward its `target`
/// using the same per-channel [`Runner`](crate::animations::Runner) as
/// [`drive_transitions`](super::drive_transitions). Writes only on a
/// frame the eased value actually moved, so a settled offset doesn't spam
/// `Changed<ScrollPosition>` (and thus `onScroll`). The target is pre-clamped by the
/// feeders; Bevy clamps the *rendered* offset regardless.
///
/// A `ScrollPosition` that moved *underneath* the easing (it no longer matches the
/// channels' last-written value) was written directly by scrollbar manipulation —
/// Bevy's widget writes the offset itself on thumb drag and track-click paging —
/// and snaps: direct manipulation bypasses the animation entirely.
pub fn drive_scroll_transition(
    time: Res<Time>,
    mut query: Query<(
        &ScrollTransitionInput,
        &mut ScrollTransitionState,
        &mut ScrollPosition,
    )>,
) {
    let dt = time.delta_secs();
    for (input, mut state, mut pos) in &mut query {
        // Seed resting state to the live offset so the first target change eases from
        // where the node actually is, not from zero.
        if !state.initialized {
            state.x.init(pos.0.x);
            state.y.init(pos.0.y);
            state.target = pos.0;
            state.initialized = true;
        }
        // After a drive the offset exactly equals (x.current, y.current) — on eased
        // containers every in-crate feeder writes `state.target`, so a mismatch means
        // the scrollbar widget wrote `ScrollPosition` directly this frame (thumb
        // drag, track-click page, or the final release-frame write): snap to it.
        let current = Vec2::new(state.x.current, state.y.current);
        if pos.0 != current {
            state.snap_to(pos.0);
            continue;
        }
        let spec = &input.0;
        let target = state.target;
        let nx = state.x.drive(target.x, Some(spec), dt);
        let ny = state.y.drive(target.y, Some(spec), dt);
        // Conditional write: equal assignment would still trip change detection.
        if pos.0.x != nx || pos.0.y != ny {
            pos.0 = Vec2::new(nx, ny);
        }
    }
}
