//! CSS-like `transition`: declarative easing of `transform` / `opacity` /
//! `backgroundColor` between style states.
//!
//! The clunky way to "scale a button down on press" is to allocate a shared
//! value and hand-wire `onPointerDown`/`onPointerUp` to drivers. A `transition`
//! instead lets a plain style change — a re-render, or a `hoverStyle`/`pressStyle`
//! kicking in — *ease* to its new value. It reuses the animations crate's driver
//! runtime ([`Runner`]) rather than a parallel engine.
//!
//! ## How it fits the style pipeline
//!
//! Every style change funnels through [`crate::ui_map::apply_style`] — both the
//! base re-render path (`Op::Update`) and the hover/press path
//! ([`crate::reconcile::apply_interaction_styles`], which re-applies the *merged*
//! style for the current `Interaction`). So `apply_style` is the one place that
//! always knows the resolved target. It stamps a [`TransitionInput`] (the spec +
//! the resolved per-channel target) — a *stateless input* the engine reads but
//! never writes, so there's no feedback loop with the live `UiTransform`/color it
//! animates.
//!
//! [`drive_transitions`] then runs after `apply_interaction_styles`: it advances a
//! per-entity [`TransitionState`] (one [`Runner`] per channel) toward the input's
//! target and writes the interpolated value onto `UiTransform`/`BackgroundColor`/
//! alpha — *last* in the frame, so a coincident re-render's snap value never wins.
//!
//! A channel also driven by `animatedStyle` (imperative) is left to the animations
//! plugin: the transition skips any channel bound by the entity's `AnimatedNode`.

use bevy::prelude::*;
use bevy::ui::{ScrollPosition, UiTransform};
use bevy_react_animations::{
    AnimatableProperty, AnimatedNode, Driver, Easing, Lerp, Runner, build_runner,
    build_ui_transform,
};
use serde::Deserialize;

use crate::protocol::{Length, Style, Time as WireTime};
use crate::ui_map::{length_to_val, parse_color};

/// CSS-like per-channel transition timing, set on [`Style::transition`]. Each
/// field, if present, makes that channel ease on change; `all` is the fallback for
/// channels without an explicit entry. `transform` covers all six transform
/// channels together.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transition {
    /// Fallback applied to any channel without its own entry.
    pub all: Option<ChannelTransition>,
    /// Applies to every transform channel (translate/scale/rotate).
    pub transform: Option<ChannelTransition>,
    pub opacity: Option<ChannelTransition>,
    pub background_color: Option<ChannelTransition>,
    /// Applies to every size channel (width/height/maxWidth/maxHeight). These are
    /// *layout* properties — easing one re-flows the surrounding content (a real
    /// accordion), unlike the post-layout `transform`.
    pub size: Option<ChannelTransition>,
    /// Eases the scroll offset (`ScrollPosition`) of an `overflow: scroll` node
    /// toward its target on change — the target being a controlled `scrollTop`/
    /// `scrollLeft`, a `scrollTo`-style jump, or accumulated wheel input. Covers
    /// both axes. Unlike the others, scroll's target lives in `Props` (it's a
    /// controlled value), so it's fed by the scroll write path, not `from_style`.
    pub scroll: Option<ChannelTransition>,
}

impl Transition {
    /// The transition for the transform channels (explicit, else `all`).
    pub fn for_transform(&self) -> Option<&ChannelTransition> {
        self.transform.as_ref().or(self.all.as_ref())
    }
    /// The transition for opacity (explicit, else `all`).
    pub fn for_opacity(&self) -> Option<&ChannelTransition> {
        self.opacity.as_ref().or(self.all.as_ref())
    }
    /// The transition for background color (explicit, else `all`).
    pub fn for_background(&self) -> Option<&ChannelTransition> {
        self.background_color.as_ref().or(self.all.as_ref())
    }
    /// The transition for the size channels (explicit, else `all`).
    pub fn for_size(&self) -> Option<&ChannelTransition> {
        self.size.as_ref().or(self.all.as_ref())
    }
    /// The transition for the scroll offset (explicit, else `all`).
    pub fn for_scroll(&self) -> Option<&ChannelTransition> {
        self.scroll.as_ref().or(self.all.as_ref())
    }
}

/// Timing for one channel. A spring (any of `stiffness`/`damping` set) or, by
/// default, a timing curve. `duration`/`delay` are [`WireTime`]s: a bare number is
/// milliseconds (the JS-facing unit), a string carries an explicit unit
/// (`"200ms"`/`"0.2s"`), and both decode to the seconds the [`Driver`] consumes.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelTransition {
    /// Timing duration (default `0.3s`). Ignored for a spring.
    pub duration: Option<WireTime>,
    #[serde(default)]
    pub easing: Easing,
    /// Hold this long before easing (default `0`).
    #[serde(default)]
    pub delay: WireTime,
    /// Spring stiffness; presence (with/without `damping`) selects a spring.
    pub stiffness: Option<f32>,
    pub damping: Option<f32>,
    #[serde(default = "default_mass")]
    pub mass: f32,
}

fn default_mass() -> f32 {
    1.0
}

impl ChannelTransition {
    /// Build the [`Driver`] that eases the value to `to` from its live reading.
    /// A spring if `stiffness`/`damping` are present, else a (optionally delayed)
    /// timing curve.
    fn to_driver(&self, to: f32) -> Driver {
        if self.stiffness.is_some() || self.damping.is_some() {
            Driver::Spring {
                to,
                stiffness: self.stiffness.unwrap_or(100.0),
                damping: self.damping.unwrap_or(10.0),
                mass: self.mass,
            }
        } else {
            let timing = Driver::Timing {
                to,
                duration: self.duration.map(WireTime::seconds).unwrap_or(0.3),
                easing: self.easing,
            };
            let delay = self.delay.seconds();
            if delay > 0.0 {
                Driver::Delay {
                    delay,
                    animation: Box::new(timing),
                }
            } else {
                timing
            }
        }
    }
}

/// The resolved per-channel target for a transitioning entity, plus the spec.
/// Written by [`crate::ui_map::apply_style`] from the *merged* style and read each
/// frame by [`drive_transitions`]. Never written by the engine — keeping it free
/// of the live components it animates avoids a target-chases-animation feedback
/// loop. `None` on a channel means "unspecified" (its identity default is used).
#[derive(Component, Debug, Clone, Default)]
pub struct TransitionInput {
    pub spec: Transition,
    pub translate_x: Option<Length>,
    pub translate_y: Option<Length>,
    pub scale: Option<f32>,
    pub scale_x: Option<f32>,
    pub scale_y: Option<f32>,
    pub rotate: Option<f32>,
    pub opacity: Option<f32>,
    /// Target background color as straight rgba (no opacity folded in — the
    /// opacity channel owns alpha, applied after the color, like the animated path).
    pub background_color: Option<[f32; 4]>,
    // Size targets, written onto `Node` (layout). `None` → unset (`Val::Auto`).
    pub width: Option<Length>,
    pub height: Option<Length>,
    pub max_width: Option<Length>,
    pub max_height: Option<Length>,
}

impl TransitionInput {
    /// Build the input from a resolved style, or `None` if it has no `transition`.
    fn from_style(style: &Style) -> Option<Self> {
        let spec = style.transition.clone()?;
        let t = style.transform.unwrap_or_default();
        Some(Self {
            spec,
            translate_x: t.translate_x,
            translate_y: t.translate_y,
            scale: t.scale,
            scale_x: t.scale_x,
            scale_y: t.scale_y,
            rotate: t.rotate.map(crate::protocol::Angle::radians),
            opacity: style.opacity,
            background_color: style
                .background_color
                .as_deref()
                .map(|hex| color_to_rgba(parse_color(hex))),
            width: style.width,
            height: style.height,
            max_width: style.max_width,
            max_height: style.max_height,
        })
    }
}

/// Per-entity transition runtime: one [`Runner`]-backed channel per animatable
/// property. Persists across re-renders (the engine owns it); created lazily by
/// [`apply_transition`]. `#[require(UiTransform)]` so the drive query always
/// matches even for an opacity/color-only transition.
#[derive(Component, Default)]
#[require(UiTransform)]
pub struct TransitionState {
    translate_x: ProgressChannel<Length>,
    translate_y: ProgressChannel<Length>,
    scale: Channel,
    scale_x: Channel,
    scale_y: Channel,
    rotate: Channel,
    opacity: Channel,
    color: ProgressChannel<[f32; 4]>,
    width: ProgressChannel<Length>,
    height: ProgressChannel<Length>,
    max_width: ProgressChannel<Length>,
    max_height: ProgressChannel<Length>,
    initialized: bool,
}

/// One scalar channel: its current reading, last target, and active driver.
#[derive(Default)]
struct Channel {
    current: f32,
    target: f32,
    runner: Option<Runner>,
}

impl Channel {
    /// Snap to `value` without animating (used to seed the resting state so an
    /// element doesn't animate from zero when it first appears).
    fn init(&mut self, value: f32) {
        self.current = value;
        self.target = value;
        self.runner = None;
    }

    /// Advance toward `target`. `spec` `Some` eases; `None` snaps. Returns the
    /// current value.
    fn drive(&mut self, target: f32, spec: Option<&ChannelTransition>, dt: f32) -> f32 {
        if target != self.target {
            self.target = target;
            match spec {
                Some(s) => self.runner = Some(build_runner(&s.to_driver(target), self.current)),
                None => {
                    self.current = target;
                    self.runner = None;
                }
            }
        }
        if let Some(r) = self.runner.as_mut() {
            let (v, done) = r.step(dt);
            self.current = v;
            if done {
                self.runner = None;
            }
        }
        self.current
    }
}

/// A progress-lerped channel (colors, [`Length`]s): a single [`Runner`] eases a
/// progress value 0→1 and the reading lerps from `start` to `target`. Used for
/// quantities that can't be time-stepped directly in value space (a color's four
/// channels move together; a `Length` carries a unit). [`ProgressChannel::drive`]
/// returns the current reading every frame — a caller writing a relayout-
/// triggering target (`Node`) compares before writing, like every other apply
/// path.
#[derive(Default)]
struct ProgressChannel<T> {
    current: T,
    target: T,
    start: T,
    runner: Option<Runner>,
}

impl<T: Lerp + PartialEq> ProgressChannel<T> {
    /// Snap to `value` without animating (used to seed the resting state so an
    /// element doesn't animate from zero when it first appears).
    fn init(&mut self, value: T) {
        self.current = value;
        self.target = value;
        self.runner = None;
    }

    /// Advance toward `target`. `spec` `Some` eases; `None` snaps. Returns the
    /// current reading.
    fn drive(&mut self, target: T, spec: Option<&ChannelTransition>, dt: f32) -> T {
        if target != self.target {
            self.target = target;
            match spec {
                Some(s) => {
                    self.start = self.current;
                    self.runner = Some(build_runner(&s.to_driver(1.0), 0.0));
                }
                None => {
                    self.current = target;
                    self.runner = None;
                }
            }
        }
        if let Some(r) = self.runner.as_mut() {
            let (p, done) = r.step(dt);
            self.current = self.start.lerp(self.target, p);
            if done {
                self.current = self.target;
                self.runner = None;
            }
        }
        self.current
    }
}

/// Interpolate two lengths of the same unit; mixed units or `auto` can't be
/// interpolated, so it snaps to the target.
impl Lerp for Length {
    fn lerp(self, other: Self, t: f32) -> Self {
        use Length::*;
        let lerp = |x: f32, y: f32| x + (y - x) * t;
        match (self, other) {
            (Px(x), Px(y)) => Px(lerp(x, y)),
            (Percent(x), Percent(y)) => Percent(lerp(x, y)),
            (Vw(x), Vw(y)) => Vw(lerp(x, y)),
            (Vh(x), Vh(y)) => Vh(lerp(x, y)),
            (VMin(x), VMin(y)) => VMin(lerp(x, y)),
            (VMax(x), VMax(y)) => VMax(lerp(x, y)),
            _ => other,
        }
    }
}

/// The scroll-easing **spec** input: the `transition.scroll` timing, reinserted
/// fresh on every render (like [`TransitionInput`]) so a changed spec takes effect.
/// Present only while `transition.scroll` (or `all`) is set. The *target* it eases
/// toward is NOT here — scroll's target is a controlled `Props` value, fed into
/// [`ScrollTransitionState`] by the scroll write path / wheel handler.
#[derive(Component, Debug, Clone)]
pub struct ScrollTransitionInput(pub ChannelTransition);

/// The scroll-easing **runtime state**: the target offset plus a per-axis eased
/// [`Channel`]. Persists across re-renders ([`insert_if_new`]). `target` is written
/// by the feeders ([`crate::reconcile::update_controlled_scroll`] and
/// `crate::scroll::apply_scroll`); [`drive_scroll_transition`] eases `ScrollPosition`
/// toward it. Mirrors the [`TransitionState`] half of the split.
#[derive(Component, Default)]
pub struct ScrollTransitionState {
    /// The offset to ease toward (already clamped to the scroll range by the feeder).
    pub(crate) target: Vec2,
    x: Channel,
    y: Channel,
    initialized: bool,
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
/// using the same per-channel [`Runner`] as [`drive_transitions`]. Writes only on a
/// frame the eased value actually moved, so a settled offset doesn't spam
/// `Changed<ScrollPosition>` (and thus `onScroll`). The target is pre-clamped by the
/// feeders; Bevy clamps the *rendered* offset regardless.
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

/// Stamp (or clear) the transition components on a host element. Called from
/// [`crate::ui_map::apply_style`] with the resolved style, so the input always
/// reflects the current `Interaction` (base / hover / press). Sibling to
/// `apply_animated` in the reconciler's apply pattern.
pub fn apply_transition(ec: &mut EntityCommands, style: &Option<Style>) {
    match style.as_ref().and_then(TransitionInput::from_style) {
        Some(input) => {
            ec.insert(input);
            // The runtime state persists across re-renders, so only create it once.
            ec.insert_if_new(TransitionState::default());
        }
        None => {
            ec.remove::<TransitionInput>();
            ec.remove::<TransitionState>();
        }
    }
}

/// Advance every transitioning entity toward its [`TransitionInput`] target and
/// write the eased value onto `UiTransform` / `BackgroundColor` / alpha. Runs
/// after `apply_interaction_styles` (and thus after the op drain) so its writes
/// land last in the frame.
#[allow(clippy::type_complexity)]
pub fn drive_transitions(
    time: Res<Time>,
    mut commands: Commands,
    mut query: Query<(
        Entity,
        &TransitionInput,
        &mut TransitionState,
        &mut UiTransform,
        Option<&mut BackgroundColor>,
        Option<&mut TextColor>,
        Option<&mut ImageNode>,
        Option<&mut Node>,
        Option<&AnimatedNode>,
    )>,
) {
    let dt = time.delta_secs();
    for (entity, input, mut state, mut transform, bg, text_color, image, node, anim) in &mut query {
        // Seed resting values on first sight so a freshly mounted element snaps to
        // its initial style instead of animating in from zero.
        if !state.initialized {
            state
                .translate_x
                .init(input.translate_x.unwrap_or(Length::Px(0.0)));
            state
                .translate_y
                .init(input.translate_y.unwrap_or(Length::Px(0.0)));
            state.scale.init(input.scale.unwrap_or(1.0));
            state.scale_x.init(input.scale_x.unwrap_or(1.0));
            state.scale_y.init(input.scale_y.unwrap_or(1.0));
            state.rotate.init(input.rotate.unwrap_or(0.0));
            state.opacity.init(input.opacity.unwrap_or(1.0));
            if let Some(c) = input.background_color {
                state.color.init(c);
            }
            state.width.init(input.width.unwrap_or(Length::Auto));
            state.height.init(input.height.unwrap_or(Length::Auto));
            state
                .max_width
                .init(input.max_width.unwrap_or(Length::Auto));
            state
                .max_height
                .init(input.max_height.unwrap_or(Length::Auto));
            state.initialized = true;
        }

        // `animatedStyle` (imperative) wins: skip any channel it already drives.
        let skip_transform = anim.is_some_and(|a| a.0.has_transform());
        let skip_opacity = anim.is_some_and(|a| a.0.contains(AnimatableProperty::Opacity));
        let skip_bg = anim.is_some_and(|a| a.0.contains(AnimatableProperty::BackgroundColor));

        // Transform: only when a transform transition is declared; otherwise the
        // static `UiTransform` from `apply_style` stands untouched. Only specified
        // channels are written (passing `None` keeps `build_ui_transform`'s scale
        // precedence intact).
        if input.spec.for_transform().is_some() && !skip_transform {
            let s = input.spec.for_transform();
            let tx = input
                .translate_x
                .map(|t| length_to_val(state.translate_x.drive(t, s, dt)));
            let ty = input
                .translate_y
                .map(|t| length_to_val(state.translate_y.drive(t, s, dt)));
            let sc = input.scale.map(|t| state.scale.drive(t, s, dt));
            let scx = input.scale_x.map(|t| state.scale_x.drive(t, s, dt));
            let scy = input.scale_y.map(|t| state.scale_y.drive(t, s, dt));
            let rot = input.rotate.map(|t| state.rotate.drive(t, s, dt));
            // Compare-before-write so a settled transition doesn't dirty change
            // detection every frame (read via `Deref`, write via `DerefMut`).
            let new = build_ui_transform(tx, ty, sc, scx, scy, rot);
            if *transform != new {
                *transform = new;
            }
        }

        let mut bg = bg;

        // Opacity owns the final alpha across background/text/image. Resolved
        // before the background write so it can be baked into that color —
        // otherwise the two writes would ping-pong the alpha channel every frame
        // and the compare-before-write guards would never settle.
        let alpha = if !skip_opacity && let Some(target) = input.opacity {
            Some(state.opacity.drive(target, input.spec.for_opacity(), dt))
        } else {
            None
        };

        if !skip_bg && let Some(target) = input.background_color {
            let mut rgba = state.color.drive(target, input.spec.for_background(), dt);
            if let Some(a) = alpha {
                rgba[3] = a;
            }
            let color = rgba_to_color(rgba);
            match &mut bg {
                Some(c) if c.0 != color => c.0 = color,
                Some(_) => {}
                None => {
                    commands.entity(entity).insert(BackgroundColor(color));
                }
            }
        }

        // Opacity always applies when set (even with no opacity transition: it then
        // snaps), so a transitioning background color doesn't clobber the alpha.
        if let Some(alpha) = alpha {
            if let Some(c) = &mut bg
                && c.0.alpha() != alpha
            {
                c.0 = c.0.with_alpha(alpha);
            }
            if let Some(mut tc) = text_color
                && tc.0.alpha() != alpha
            {
                tc.0 = tc.0.with_alpha(alpha);
            }
            if let Some(mut img) = image
                && img.color.alpha() != alpha
            {
                img.color = img.color.with_alpha(alpha);
            }
        }

        // Size (layout): ease the specified `Node` dimensions. Writing `Node`
        // re-triggers Bevy's layout, so each field is compared before writing —
        // a settled transition doesn't force a relayout every frame, and a
        // re-render that reset `Node` to its static style is corrected here.
        // The animations engine never writes `Node`, so no precedence check is
        // needed.
        if input.spec.for_size().is_some()
            && let Some(mut node) = node
        {
            let s = input.spec.for_size();
            if let Some(t) = input.width {
                let v = length_to_val(state.width.drive(t, s, dt));
                if node.width != v {
                    node.width = v;
                }
            }
            if let Some(t) = input.height {
                let v = length_to_val(state.height.drive(t, s, dt));
                if node.height != v {
                    node.height = v;
                }
            }
            if let Some(t) = input.max_width {
                let v = length_to_val(state.max_width.drive(t, s, dt));
                if node.max_width != v {
                    node.max_width = v;
                }
            }
            if let Some(t) = input.max_height {
                let v = length_to_val(state.max_height.drive(t, s, dt));
                if node.max_height != v {
                    node.max_height = v;
                }
            }
        }
    }
}

fn color_to_rgba(color: Color) -> [f32; 4] {
    let s = color.to_srgba();
    [s.red, s.green, s.blue, s.alpha]
}

fn rgba_to_color(rgba: [f32; 4]) -> Color {
    Color::srgba(rgba[0], rgba[1], rgba[2], rgba[3])
}

#[cfg(test)]
mod tests {
    use super::*;
    use bevy_react_animations::AnimatedBindings;
    use std::time::Duration;

    fn timing(duration: f32, easing: Easing) -> ChannelTransition {
        ChannelTransition {
            duration: Some(WireTime::from_secs(duration)),
            easing,
            delay: WireTime::from_secs(0.0),
            stiffness: None,
            damping: None,
            mass: 1.0,
        }
    }

    fn parse<T: serde::de::DeserializeOwned>(json: serde_json::Value) -> T {
        serde_json::from_value(json).expect("valid json")
    }

    #[test]
    fn channel_resolution_falls_back_to_all() {
        let t: Transition = parse(serde_json::json!({
            "all": { "duration": 100 },
            "opacity": { "duration": 200 },
        }));
        // `opacity` has its own entry; `transform`/`background` fall back to `all`.
        // The wire numbers are milliseconds → seconds (200ms → 0.2s, 100ms → 0.1s).
        let secs = |c: &ChannelTransition| c.duration.map(WireTime::seconds);
        assert!(t.for_opacity().is_some());
        assert_eq!(secs(t.for_opacity().unwrap()), Some(0.2));
        assert_eq!(secs(t.for_transform().unwrap()), Some(0.1));
        assert_eq!(secs(t.for_background().unwrap()), Some(0.1));

        // No `all`: an unspecified channel has no transition.
        let t: Transition = parse(serde_json::json!({ "opacity": { "duration": 50 } }));
        assert!(t.for_transform().is_none());
        assert!(t.for_opacity().is_some());
    }

    #[test]
    fn to_driver_selects_spring_or_timing() {
        let spring = ChannelTransition {
            duration: None,
            easing: Easing::Linear,
            delay: WireTime::from_secs(0.0),
            stiffness: Some(120.0),
            damping: Some(14.0),
            mass: 1.0,
        };
        assert!(matches!(spring.to_driver(1.0), Driver::Spring { .. }));
        assert!(matches!(
            timing(0.3, Easing::Linear).to_driver(1.0),
            Driver::Timing { .. }
        ));
        // A delay wraps the timing in a Delay driver.
        let delayed = ChannelTransition {
            delay: WireTime::from_secs(0.2),
            ..timing(0.3, Easing::Linear)
        };
        assert!(matches!(delayed.to_driver(1.0), Driver::Delay { .. }));
    }

    #[test]
    fn channel_snaps_without_spec_and_eases_with_one() {
        // No spec → snap straight to target.
        let mut ch = Channel::default();
        ch.init(1.0);
        assert_eq!(ch.drive(0.5, None, 0.016), 0.5);

        // With a 1s linear timing → halfway after 0.5s.
        let mut ch = Channel::default();
        ch.init(1.0);
        let spec = timing(1.0, Easing::Linear);
        ch.drive(0.0, Some(&spec), 0.0); // arm; no time elapsed yet
        let v = ch.drive(0.0, Some(&spec), 0.5); // same target, advance 0.5s
        assert!((v - 0.5).abs() < 1e-3, "halfway expected ~0.5, got {v}");
        let v = ch.drive(0.0, Some(&spec), 0.5);
        assert!((v - 0.0).abs() < 1e-3, "end expected 0, got {v}");
        assert!(ch.runner.is_none(), "runner dropped once finished");
    }

    #[test]
    fn color_channel_lerps_to_target() {
        let mut c = ProgressChannel::<[f32; 4]>::default();
        c.init([0.0, 0.0, 0.0, 1.0]);
        let spec = timing(1.0, Easing::Linear);
        c.drive([1.0, 0.5, 0.0, 1.0], Some(&spec), 0.0); // arm
        let mid = c.drive([1.0, 0.5, 0.0, 1.0], Some(&spec), 0.5);
        assert!((mid[0] - 0.5).abs() < 1e-3);
        assert!((mid[1] - 0.25).abs() < 1e-3);
        assert!((mid[2] - 0.0).abs() < 1e-3);
    }

    /// Build a one-entity world running `drive_transitions`, advancing `Time`.
    fn drive_world() -> (World, Schedule) {
        let mut world = World::new();
        world.insert_resource(Time::<()>::default());
        let mut schedule = Schedule::default();
        schedule.add_systems(drive_transitions);
        (world, schedule)
    }

    fn advance(world: &mut World, secs: f32) {
        world
            .resource_mut::<Time>()
            .advance_by(Duration::from_secs_f32(secs));
    }

    #[test]
    fn system_eases_scale_on_press_then_release() {
        let (mut world, mut schedule) = drive_world();
        let spec = Transition {
            transform: Some(timing(1.0, Easing::Linear)),
            ..Default::default()
        };
        let e = world
            .spawn((
                TransitionInput {
                    spec: spec.clone(),
                    scale: Some(1.0),
                    ..Default::default()
                },
                TransitionState::default(),
                UiTransform::default(),
            ))
            .id();

        // First frame seeds the resting state — scale snaps to 1, no animation.
        schedule.run(&mut world);
        assert_eq!(world.entity(e).get::<UiTransform>().unwrap().scale.x, 1.0);

        // Press: target 0.95. Halfway through a 1s ease → ~0.975.
        world
            .entity_mut(e)
            .get_mut::<TransitionInput>()
            .unwrap()
            .scale = Some(0.95);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let sx = world.entity(e).get::<UiTransform>().unwrap().scale.x;
        assert!(
            (sx - 0.975).abs() < 1e-2,
            "mid-press expected ~0.975, got {sx}"
        );

        // Finish the press ease.
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let sx = world.entity(e).get::<UiTransform>().unwrap().scale.x;
        assert!((sx - 0.95).abs() < 1e-3, "pressed expected 0.95, got {sx}");

        // Release back to 1.0, eases again.
        world
            .entity_mut(e)
            .get_mut::<TransitionInput>()
            .unwrap()
            .scale = Some(1.0);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let sx = world.entity(e).get::<UiTransform>().unwrap().scale.x;
        assert!(
            (sx - 0.975).abs() < 1e-2,
            "mid-release expected ~0.975, got {sx}"
        );
    }

    #[test]
    fn system_eases_percent_translate() {
        let (mut world, mut schedule) = drive_world();
        let spec = Transition {
            transform: Some(timing(1.0, Easing::Linear)),
            ..Default::default()
        };
        let e = world
            .spawn((
                TransitionInput {
                    spec,
                    translate_x: Some(Length::Percent(0.0)),
                    ..Default::default()
                },
                TransitionState::default(),
                UiTransform::default(),
            ))
            .id();

        // First frame seeds the resting state at 0% — snaps, no animation.
        schedule.run(&mut world);
        assert_eq!(
            world.entity(e).get::<UiTransform>().unwrap().translation.x,
            Val::Percent(0.0)
        );

        // Retarget to 100%: halfway through a 1s linear ease → ~50%, still in
        // percent units (not collapsed to px).
        world
            .entity_mut(e)
            .get_mut::<TransitionInput>()
            .unwrap()
            .translate_x = Some(Length::Percent(100.0));
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let tx = world.entity(e).get::<UiTransform>().unwrap().translation.x;
        assert!(
            matches!(tx, Val::Percent(v) if (v - 50.0).abs() < 1.0),
            "mid expected ~50%, got {tx:?}"
        );

        advance(&mut world, 0.5);
        schedule.run(&mut world);
        assert_eq!(
            world.entity(e).get::<UiTransform>().unwrap().translation.x,
            Val::Percent(100.0)
        );
    }

    #[test]
    fn animated_style_channel_wins_over_transition() {
        let (mut world, mut schedule) = drive_world();
        let spec = Transition {
            transform: Some(timing(1.0, Easing::Linear)),
            ..Default::default()
        };
        // The entity also has an AnimatedNode binding for scale → transition must
        // not touch the transform (the imperative path owns it).
        let bindings: AnimatedBindings = serde_json::from_value(serde_json::json!({
            "scale": { "type": "shared", "id": 1 }
        }))
        .unwrap();
        let e = world
            .spawn((
                TransitionInput {
                    spec,
                    scale: Some(1.0),
                    ..Default::default()
                },
                TransitionState::default(),
                UiTransform::from_scale(Vec2::splat(2.0)), // a value the imperative path "set"
                AnimatedNode(bindings),
            ))
            .id();

        schedule.run(&mut world);
        world
            .entity_mut(e)
            .get_mut::<TransitionInput>()
            .unwrap()
            .scale = Some(0.95);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        // Untouched by the transition: still the imperative 2.0.
        assert_eq!(world.entity(e).get::<UiTransform>().unwrap().scale.x, 2.0);
    }

    /// Once a transition has settled, `drive_transitions` must stop marking the
    /// target components changed (compare-before-write) — a settled hover/press
    /// style shouldn't keep transform propagation / extraction hot forever.
    #[test]
    fn settled_transition_does_not_dirty_components() {
        #[derive(Resource, Default)]
        struct Dirty(usize);

        let (mut world, mut schedule) = drive_world();
        world.init_resource::<Dirty>();
        let spec = Transition {
            transform: Some(timing(0.2, Easing::Linear)),
            background_color: Some(timing(0.2, Easing::Linear)),
            opacity: Some(timing(0.2, Easing::Linear)),
            ..Default::default()
        };
        let e = world
            .spawn((
                TransitionInput {
                    spec,
                    scale: Some(1.0),
                    // Deliberately different from the bg target's alpha: opacity
                    // owns the final alpha, and the two writes must still settle.
                    opacity: Some(0.5),
                    background_color: Some([1.0, 0.0, 0.0, 1.0]),
                    ..Default::default()
                },
                TransitionState::default(),
                UiTransform::default(),
                BackgroundColor(Color::WHITE),
            ))
            .id();

        type AnyTargetChanged = Or<(Changed<UiTransform>, Changed<BackgroundColor>)>;

        let mut detect = Schedule::default();
        detect.add_systems(|q: Query<(), AnyTargetChanged>, mut dirty: ResMut<Dirty>| {
            dirty.0 = q.iter().count();
        });

        // Seed, retarget, and run the ease well past completion.
        schedule.run(&mut world);
        world
            .entity_mut(e)
            .get_mut::<TransitionInput>()
            .unwrap()
            .scale = Some(0.9);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        detect.run(&mut world); // consume all the churn so far

        advance(&mut world, 0.5);
        schedule.run(&mut world);
        detect.run(&mut world);
        assert_eq!(
            world.resource::<Dirty>().0,
            0,
            "a settled transition must not dirty anything"
        );
    }

    #[test]
    fn lerp_length_same_unit_else_snaps() {
        assert_eq!(Length::Px(0.0).lerp(Length::Px(10.0), 0.5), Length::Px(5.0));
        assert_eq!(
            Length::Percent(0.0).lerp(Length::Percent(100.0), 0.25),
            Length::Percent(25.0)
        );
        // `auto` or mixed units can't be interpolated → snap to the target.
        assert_eq!(Length::Auto.lerp(Length::Px(10.0), 0.5), Length::Px(10.0));
        assert_eq!(
            Length::Px(0.0).lerp(Length::Percent(10.0), 0.5),
            Length::Percent(10.0)
        );
    }

    fn px(l: Length) -> f32 {
        match l {
            Length::Px(v) => v,
            other => panic!("expected Px, got {other:?}"),
        }
    }

    #[test]
    fn length_channel_eases_then_idles() {
        let mut ch = ProgressChannel::<Length>::default();
        ch.init(Length::Px(0.0));
        let spec = timing(1.0, Easing::Linear);
        // Arm toward 100; the arm frame reports the (still 0) value.
        assert!((px(ch.drive(Length::Px(100.0), Some(&spec), 0.0)) - 0.0).abs() < 1e-3);
        assert!((px(ch.drive(Length::Px(100.0), Some(&spec), 0.5)) - 50.0).abs() < 1e-3);
        assert!((px(ch.drive(Length::Px(100.0), Some(&spec), 0.5)) - 100.0).abs() < 1e-3);
        // Settled and target unchanged → idle: the runner is dropped and the
        // reading holds steady (the caller's compare skips the `Node` write).
        assert!(ch.runner.is_none(), "runner dropped once settled");
        assert_eq!(
            ch.drive(Length::Px(100.0), Some(&spec), 0.5),
            Length::Px(100.0)
        );
    }

    #[test]
    fn system_eases_max_height_layout() {
        let (mut world, mut schedule) = drive_world();
        let spec = Transition {
            size: Some(timing(1.0, Easing::Linear)),
            ..Default::default()
        };
        let e = world
            .spawn((
                TransitionInput {
                    spec,
                    max_height: Some(Length::Px(120.0)),
                    ..Default::default()
                },
                TransitionState::default(),
                Node::default(),
                UiTransform::default(),
            ))
            .id();

        // First frame seeds the resting state (120) without writing Node.
        schedule.run(&mut world);

        // Collapse to 0: halfway through a 1s ease → ~60.
        world
            .entity_mut(e)
            .get_mut::<TransitionInput>()
            .unwrap()
            .max_height = Some(Length::Px(0.0));
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let mh = world.entity(e).get::<Node>().unwrap().max_height;
        assert!(
            matches!(mh, Val::Px(v) if (v - 60.0).abs() < 1.0),
            "mid expected ~60px, got {mh:?}"
        );

        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let mh = world.entity(e).get::<Node>().unwrap().max_height;
        assert!(
            matches!(mh, Val::Px(v) if v.abs() < 1e-3),
            "settled expected 0px, got {mh:?}"
        );
    }

    /// `drive_scroll_transition` eases `ScrollPosition` toward the state's target
    /// (seeded at the live offset on first sight) and settles exactly on it.
    #[test]
    fn system_eases_scroll_toward_target() {
        let mut world = World::new();
        world.insert_resource(Time::<()>::default());
        let mut schedule = Schedule::default();
        schedule.add_systems(drive_scroll_transition);

        let e = world
            .spawn((
                ScrollTransitionInput(timing(1.0, Easing::Linear)),
                ScrollTransitionState::default(),
                ScrollPosition::default(),
            ))
            .id();

        // First frame seeds resting state at the live offset (0) — no movement.
        schedule.run(&mut world);
        assert_eq!(
            world.entity(e).get::<ScrollPosition>().unwrap().0,
            Vec2::ZERO
        );

        // Target y=100; halfway through a 1s linear ease → ~50.
        world
            .entity_mut(e)
            .get_mut::<ScrollTransitionState>()
            .unwrap()
            .target = Vec2::new(0.0, 100.0);
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        let y = world.entity(e).get::<ScrollPosition>().unwrap().0.y;
        assert!((y - 50.0).abs() < 1.0, "mid-ease expected ~50, got {y}");

        // Finish the ease → exactly 100.
        advance(&mut world, 0.5);
        schedule.run(&mut world);
        assert_eq!(
            world.entity(e).get::<ScrollPosition>().unwrap().0,
            Vec2::new(0.0, 100.0)
        );
    }
}
