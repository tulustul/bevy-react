//! The transition engine's channel runtime: the shared ease machinery
//! ([`Interp`] / [`EasedChannel`]), the value-space [`Channel`] (springs
//! integrate in value space), the whole-value [`FilterChannel`], and the
//! per-entity [`TransitionState`] they roll up into.

use bevy::prelude::*;

use crate::animations::{Lerp, Runner, build_runner};
use crate::protocol::Length;

use super::spec::ChannelTransition;
use super::{shape_channel, transform3d};

/// The transition engine's plain scalar/length channels — one row per
/// [`TransitionState`] channel whose target rides a same-named
/// [`TransitionInput`] field: `(channel, (identity default), group)`.
/// Consumed by the mount-seed block (every row seeds `state.<channel>` from
/// `input.<channel>` at its identity default) and by the size drive block
/// (`size` rows, which also name the written `Node` field). The
/// color/filter/backdrop/transform3d/scroll/shape channels have their own
/// target shapes and stay explicit.
macro_rules! with_input_channels {
    ($cb:ident) => {
        $cb! {
            (translate_x, (Length::Px(0.0)), transform),
            (translate_y, (Length::Px(0.0)), transform),
            (scale, (1.0), transform),
            (scale_x, (1.0), transform),
            (scale_y, (1.0), transform),
            (rotate, (0.0), transform),
            (opacity, (1.0), value),
            (width, (Length::Auto), size),
            (height, (Length::Auto), size),
            (max_width, (Length::Auto), size),
            (max_height, (Length::Auto), size),
        }
    };
}
pub(super) use with_input_channels;

/// Per-entity transition runtime: one [`Runner`]-backed channel per animatable
/// property. Persists across re-renders (the engine owns it); created lazily by
/// [`apply_transition`]. `#[require(UiTransform)]` so the drive query always
/// matches even for an opacity/color-only transition.
#[derive(Component, Default)]
#[require(UiTransform)]
pub struct TransitionState {
    pub(super) translate_x: ProgressChannel<Length>,
    pub(super) translate_y: ProgressChannel<Length>,
    pub(super) scale: Channel,
    pub(super) scale_x: Channel,
    pub(super) scale_y: Channel,
    pub(super) rotate: Channel,
    pub(super) opacity: Channel,
    pub(super) color: ProgressChannel<[f32; 4]>,
    pub(super) width: ProgressChannel<Length>,
    pub(super) height: ProgressChannel<Length>,
    pub(super) max_width: ProgressChannel<Length>,
    pub(super) max_height: ProgressChannel<Length>,
    pub(super) filter: FilterChannel,
    pub(super) backdrop_filter: FilterChannel,
    pub(super) transform3d: transform3d::Transform3dChannels,
    /// SVG shape-attr easing (spec + targets both ride `SvgShape.attrs` —
    /// shapes have no style). Self-seeding per attr, so it doesn't
    /// participate in the `initialized` block.
    pub(super) shape: shape_channel::ShapeChannel,
    pub(super) initialized: bool,
}

/// The whole-value `filter` channel: eases a promoted root's
/// [`crate::filters::ResolvedFilterChain`] packed params between wire targets
/// (see [`crate::filters::plan_filter_ease`] for the strategy). Unlike the
/// scalar channels, its current reading cannot be re-read from the component —
/// [`crate::filters::resolve_chains`] snaps the component to the new
/// target on the retarget frame, before this system runs — so the state owns
/// the last-written pass list (the `ProgressChannel` state-owned-current
/// pattern, list-shaped).
#[derive(Default)]
pub(super) struct FilterChannel {
    /// The last wire chain seen (retarget detection). Empty = no filter.
    pub(super) wire: crate::filters::FilterChain,
    /// The shared ease machinery: `channel.current` is the pass list this
    /// channel last wrote (or adopted from the resolver) — the next ease's
    /// start; the interp holds the armed plan. Both are (re)set together at
    /// retarget, so the runner and its plan can't go out of sync.
    pub(super) channel: EasedChannel<Vec<crate::filters::ResolvedFilterPass>, FilterEaseInterp>,
}

/// The filter-ease [`Interp`]: samples a planned pass-list ease
/// ([`crate::filters::FilterEase`] — strategy + endpoints planned at retarget
/// by [`crate::filters::plan_filter_ease`], delegated to verbatim, never
/// reimplemented). The wrapper injects the plan at arm time; `arm` itself is
/// a no-op because planning needs registry/assets context the trait seam
/// doesn't carry.
#[derive(Default)]
pub(super) struct FilterEaseInterp {
    plan: Option<crate::filters::FilterEase>,
}

impl Interp<Vec<crate::filters::ResolvedFilterPass>> for FilterEaseInterp {
    fn arm(
        &mut self,
        _from: &Vec<crate::filters::ResolvedFilterPass>,
        _to: &Vec<crate::filters::ResolvedFilterPass>,
    ) {
    }
    fn sample(
        &self,
        p: f32,
        _target: &Vec<crate::filters::ResolvedFilterPass>,
    ) -> Vec<crate::filters::ResolvedFilterPass> {
        self.plan.as_ref().map(|e| e.sample(p)).unwrap_or_default()
    }
    /// Completion writes the plan's own settle list — the resolver's snapped
    /// output, bit-exact, so the two writers agree and stop churning (the
    /// stage-interplay rule: bake the final value, don't approximate it).
    fn settle(
        &self,
        _target: &Vec<crate::filters::ResolvedFilterPass>,
    ) -> Vec<crate::filters::ResolvedFilterPass> {
        self.plan
            .as_ref()
            .map(|e| e.settle().to_vec())
            .unwrap_or_default()
    }
}

impl FilterChannel {
    /// Advance the filter chain toward the wire target in `input`, writing the
    /// eased packed params into `resolved`. Returns `true` when it wrote —
    /// the caller pushes composite-only dirt (filter output never dirties the
    /// capture, which holds unfiltered content).
    ///
    /// Three writers touch [`crate::filters::ResolvedFilterChain`]; precedence
    /// runs resolver → transition → bindings. On the retarget frame
    /// [`crate::filters::resolve_chains`] (ordered before
    /// [`drive_transitions`]) *snaps* the component to the new target; this
    /// method *eases* over that snap — starting from the state-owned
    /// `current`, the last value this channel wrote, never the
    /// already-snapped component; and per-param animation bindings
    /// (`filter[<i>].<param>`) *re-assert* individual params on top, winning
    /// by gating this channel out via `skip_filter` (the imperative-wins
    /// pattern of the scalar channels, coarse: any filter binding parks the
    /// whole channel).
    ///
    /// The target rides the wire-chain component (`FilterInput` /
    /// `BackdropInput` — the caller projects to the inner [`FilterChain`]),
    /// NOT [`TransitionInput`] — a chain-only delta dirties the
    /// FILTER/BACKDROP|LAYER groups, never TRANSITION, so a target stamped
    /// into the input would go stale; the chain component is re-stamped by
    /// that same delta. Both channel instances (filter, backdropFilter) run
    /// this same code over their own component pair.
    pub(super) fn drive(
        &mut self,
        input: Option<&crate::filters::FilterChain>,
        mut resolved: Option<Mut<crate::filters::ResolvedFilterChain>>,
        spec: Option<&ChannelTransition>,
        registry: Option<&crate::filters::FilterRegistry>,
        assets: Option<&AssetServer>,
        dt: f32,
    ) -> bool {
        let retargeted = match input {
            Some(fi) => *fi != self.wire,
            None => !self.wire.0.is_empty(),
        };
        if retargeted {
            let to_wire = input.cloned().unwrap_or_default();
            let from_wire = std::mem::replace(&mut self.wire, to_wire);
            match (spec, resolved.as_deref()) {
                // Ease only toward a live resolved chain. An emptied or
                // unresolvable target has no component to write into
                // (unset `filter` demotes the layer; an all-invalid chain
                // attaches none), so it snaps below.
                (Some(spec), Some(chain)) if !self.wire.0.is_empty() => {
                    self.channel.interp.plan = Some(crate::filters::plan_filter_ease(
                        &from_wire,
                        &self.wire,
                        self.channel.current.clone(),
                        chain.passes.clone(),
                        registry,
                        assets,
                        chain.scale,
                    ));
                    self.channel.arm(chain.passes.clone(), spec);
                }
                _ => {
                    // Snap: adopt whatever the resolver produced.
                    self.channel.interp.plan = None;
                    self.channel.init(
                        resolved
                            .as_deref()
                            .map(|c| c.passes.clone())
                            .unwrap_or_default(),
                    );
                }
            }
        }
        let mut wrote = false;
        if self.channel.runner.is_some() {
            match resolved.as_mut() {
                Some(resolved) => {
                    // Advance the ease: `tick` samples the plan, and on
                    // completion writes the plan's settle list (bit-exact —
                    // see `FilterEaseInterp::settle`) and drops the runner.
                    self.channel.tick(dt);
                    // Compare via `Deref` first so a no-op frame doesn't
                    // trip change detection.
                    if resolved.passes != self.channel.current {
                        let chain = &mut **resolved;
                        chain.passes = self.channel.current.clone();
                        chain.version = chain.version.wrapping_add(1);
                        wrote = true;
                    }
                }
                None => {
                    // The chain vanished mid-ease (demotion tore the
                    // layer down): drop the ease and forget the passes.
                    self.channel.interp.plan = None;
                    self.channel.init(Vec::new());
                }
            }
        }
        wrote
    }
}

/// One scalar channel: its current reading, last target, and active driver.
#[derive(Default)]
pub(super) struct Channel {
    pub(super) current: f32,
    pub(super) target: f32,
    pub(super) runner: Option<Runner>,
}

impl Channel {
    /// Snap to `value` without animating (used to seed the resting state so an
    /// element doesn't animate from zero when it first appears).
    pub(super) fn init(&mut self, value: f32) {
        self.current = value;
        self.target = value;
        self.runner = None;
    }

    /// Advance toward `target`. `spec` `Some` eases; `None` snaps. Returns the
    /// current value.
    pub(super) fn drive(&mut self, target: f32, spec: Option<&ChannelTransition>, dt: f32) -> f32 {
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

/// How an [`EasedChannel`] turns eased progress into readings of `T` — the
/// seam between the shared ease machinery (retarget detection, runner
/// lifecycle, snap-vs-ease, exact settle) and the value space it moves
/// through. [`LerpInterp`] is the plain start→target lerp; the filter
/// channel's interp samples a planned pass-list ease instead.
pub(super) trait Interp<T> {
    /// Called at retarget (with a spec): capture whatever sampling needs —
    /// for a lerp, the start value. Domain wrappers that plan their ease
    /// externally may make this a no-op and inject state directly.
    fn arm(&mut self, from: &T, to: &T);
    /// The reading at progress `p` (0→1).
    fn sample(&self, p: f32, target: &T) -> T;
    /// The exact final reading — completion writes THIS, never the last
    /// sampled approximation (bit-exact settle).
    fn settle(&self, target: &T) -> T;
}

/// A progress-eased channel: a single [`Runner`] eases progress 0→1 and an
/// [`Interp`] turns it into readings. Used for quantities that can't be
/// time-stepped directly in value space (a color's four channels move
/// together; a `Length` carries a unit; a filter pass list moves as a whole).
/// [`EasedChannel::drive`] returns the current reading every frame — a caller
/// writing a relayout-triggering target (`Node`) compares before writing,
/// like every other apply path.
#[derive(Default)]
pub(super) struct EasedChannel<T, I> {
    pub(super) current: T,
    pub(super) target: T,
    pub(super) interp: I,
    pub(super) runner: Option<Runner>,
}

impl<T: Clone + PartialEq, I: Interp<T>> EasedChannel<T, I> {
    /// Snap to `value` without animating (used to seed the resting state so an
    /// element doesn't animate from zero when it first appears).
    pub(super) fn init(&mut self, value: T) {
        self.current = value.clone();
        self.target = value;
        self.runner = None;
    }

    /// Arm an ease toward `target`: the interp captures its start state and a
    /// fresh progress runner starts at 0. (Domain wrappers with external
    /// retarget detection call this directly; [`Self::drive`] calls it on a
    /// target change.)
    pub(super) fn arm(&mut self, target: T, spec: &ChannelTransition) {
        self.interp.arm(&self.current, &target);
        self.target = target;
        self.runner = Some(build_runner(&spec.to_driver(1.0), 0.0));
    }

    /// Advance an armed ease by `dt`, updating the current reading. Returns
    /// whether this frame completed the ease; `None` when idle.
    pub(super) fn tick(&mut self, dt: f32) -> Option<bool> {
        let r = self.runner.as_mut()?;
        let (p, done) = r.step(dt);
        self.current = if done {
            self.runner = None;
            self.interp.settle(&self.target)
        } else {
            self.interp.sample(p, &self.target)
        };
        Some(done)
    }

    /// Advance toward `target`. `spec` `Some` eases; `None` snaps. Returns the
    /// current reading.
    pub(super) fn drive(&mut self, target: T, spec: Option<&ChannelTransition>, dt: f32) -> T {
        if target != self.target {
            match spec {
                Some(s) => self.arm(target, s),
                None => self.init(target),
            }
        }
        self.tick(dt);
        self.current.clone()
    }
}

/// The plain value-lerp [`Interp`]: sample = `start.lerp(target, p)`.
#[derive(Default)]
pub(super) struct LerpInterp<T> {
    start: T,
}

impl<T: Lerp> Interp<T> for LerpInterp<T> {
    fn arm(&mut self, from: &T, _to: &T) {
        self.start = *from;
    }
    fn sample(&self, p: f32, target: &T) -> T {
        self.start.lerp(*target, p)
    }
    fn settle(&self, target: &T) -> T {
        *target
    }
}

/// A progress-lerped channel (colors, [`Length`]s) — the [`EasedChannel`]
/// instantiated with the plain lerp.
pub(super) type ProgressChannel<T> = EasedChannel<T, LerpInterp<T>>;

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
