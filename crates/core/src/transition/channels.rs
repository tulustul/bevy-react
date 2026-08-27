//! The transition engine's channel runtime: the shared ease machinery
//! ([`Interp`] / [`EasedChannel`]), the value-space [`Channel`] (springs
//! integrate in value space), the whole-value [`FilterChannel`], and the
//! per-entity [`TransitionState`] they roll up into.

use bevy::prelude::*;

use crate::animations::{Lerp, Runner, build_runner};
use crate::protocol::units::{Length, Rect};

use super::spec::ChannelTransition;
use super::{gradient_channel, shape_channel, transform3d};

/// The transition engine's plain scalar/length channels — one row per
/// [`TransitionState`] channel whose target rides a same-named
/// [`TransitionInput`](super::TransitionInput) field:
/// `(channel, (identity default), group)`.
/// Consumed by the mount-seed block (every row seeds `state.<channel>` from
/// `input.<channel>` at its identity default) and by the size drive block
/// (`size` rows, which also name the written `Node` field); the `radius`
/// row (`border_radius`, a whole [`Rect`] eased per corner) has its own
/// drive block. Every non-`size` row is also a shared-element seed channel
/// (`super::shared::copy_value_channels`). The
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
            (border_radius, (crate::protocol::units::Rect::default()), radius),
        }
    };
}
pub(super) use with_input_channels;

/// Per-entity transition runtime: one [`Runner`]-backed channel per animatable
/// property. Persists across re-renders (the engine owns it); created lazily by
/// [`apply_transition`](super::apply_transition). `#[require(UiTransform)]`
/// so the drive query always
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
    /// Corner radii, eased per corner (`Rect`'s [`Lerp`]).
    pub(super) border_radius: ProgressChannel<Rect>,
    pub(super) filter: FilterChannel,
    pub(super) backdrop_filter: FilterChannel,
    /// Whole-value gradient easing per surface (see
    /// [`gradient_channel::GradientChannel`]) — targets ride the
    /// [`GradientTargets`](crate::ui_map::GradientTargets) stamp.
    pub(super) background_gradient: gradient_channel::GradientChannel,
    pub(super) border_gradient: gradient_channel::GradientChannel,
    pub(super) morph: MorphChannel,
    pub(super) transform3d: transform3d::Transform3dChannels,
    /// SVG shape-attr easing (spec + targets both ride `SvgShape.attrs` —
    /// shapes have no style). Self-seeding per attr, so it doesn't
    /// participate in the `initialized` block.
    pub(super) shape: shape_channel::ShapeChannel,
    /// The laid-out-rect channel (see [`super::layout`]) — driven in
    /// `PostUpdate` by `drive_layout_transitions`, not by `drive_transitions`;
    /// self-seeding (mount rule), so it doesn't participate in `initialized`.
    pub(super) layout: super::layout::LayoutChannel,
    /// Shared-element flight bookkeeping (see [`super::shared`]).
    pub(super) shared: super::shared::SharedFlight,
    pub(super) initialized: bool,
}

impl TransitionState {
    /// Whether the node's own `size` channel is easing a `Node` dimension
    /// right now — while it is, the layout channel adopts each frame's rect
    /// silently (the one cause of a rect change the engine can attribute).
    pub(super) fn size_in_flight(&self) -> bool {
        // Generated from the channel table's `size` rows — the same rows the
        // size drive block writes — so a new size channel can't be missed.
        macro_rules! size_row {
            ($self:ident, $ch:ident, size) => {
                $self.$ch.runner.is_some()
            };
            ($self:ident, $ch:ident, $other:ident) => {
                false
            };
        }
        macro_rules! any_size_row {
            ($(($ch:ident, $d:tt, $group:ident),)*) => {
                false $(|| size_row!(self, $ch, $group))*
            };
        }
        with_input_channels!(any_size_row)
    }

    /// The size channels' current readings, as px where they are px — the
    /// yardstick the layout channel judges a rect step by while one is in
    /// flight ([`super::layout::LayoutChannel::note_own_size`]). Generated
    /// from the same `size` rows; a non-px reading (`auto`, a percentage) is
    /// `None` and the channel falls back to the measured size step.
    pub(super) fn size_currents_px(&self) -> [Option<f32>; SIZE_ROWS] {
        macro_rules! size_row {
            ($self:ident, $out:ident, $n:ident, $ch:ident, size) => {
                $out[$n] = match $self.$ch.current {
                    Length::Px(v) => Some(v),
                    _ => None,
                };
                $n += 1;
            };
            ($self:ident, $out:ident, $n:ident, $ch:ident, $other:ident) => {};
        }
        macro_rules! all_size_rows {
            ($(($ch:ident, $d:tt, $group:ident),)*) => {{
                let mut out = [None; SIZE_ROWS];
                let mut n = 0;
                $(size_row!(self, out, n, $ch, $group);)*
                debug_assert_eq!(n, SIZE_ROWS, "SIZE_ROWS must match the table's size rows");
                out
            }};
        }
        with_input_channels!(all_size_rows)
    }
}

/// How many `size` rows the channel table has (`width`, `height`,
/// `max_width`, `max_height`) — the width of [`TransitionState::size_currents_px`].
pub(super) const SIZE_ROWS: usize = 4;

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
    /// Rest at `other`'s reading (its wire chain + last-written passes),
    /// runner and plan dropped — the shared-element seed: the next drive's
    /// wire comparison then retargets from these passes.
    pub(super) fn seed_from(&mut self, other: &Self) {
        self.wire = other.wire.clone();
        self.channel.interp.plan = None;
        self.channel.init(other.channel.current.clone());
    }

    /// Advance the filter chain toward the wire target in `input`, writing the
    /// eased packed params into `resolved`. Returns `true` when it wrote —
    /// the caller pushes composite-only dirt (filter output never dirties the
    /// capture, which holds unfiltered content).
    ///
    /// Three writers touch [`crate::filters::ResolvedFilterChain`]; precedence
    /// runs resolver → transition → bindings. On the retarget frame
    /// [`crate::filters::resolve_chains`] (ordered before
    /// [`drive_transitions`](super::drive_transitions)) *snaps* the component
    /// to the new target; this
    /// method *eases* over that snap — starting from the state-owned
    /// `current`, the last value this channel wrote, never the
    /// already-snapped component; and per-param animation bindings
    /// (`filter[<i>].<param>`) *re-assert* individual params on top, winning
    /// by gating this channel out via `skip_filter` (the imperative-wins
    /// pattern of the scalar channels, coarse: any filter binding parks the
    /// whole channel).
    ///
    /// The target rides the wire-chain component (`FilterInput` /
    /// `BackdropInput` — the caller projects to the inner
    /// [`FilterChain`](crate::filters::FilterChain)),
    /// NOT [`TransitionInput`](super::TransitionInput) — a chain-only delta dirties the
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

/// The `morphFilter` progress channel: retargets on a `key` change and eases
/// an engine-owned progress 0→1. The freeze itself (stealing the layer's
/// on-screen capture as the "from" texture) happens render-side; this channel
/// only sequences it — bumping `MorphState::freeze_seq`, recording the
/// on-screen rect, and driving `MorphState::progress`, all applied by the
/// caller from the returned [`MorphAction`] (the channel stays ECS-free for
/// testability, like the other channels).
///
/// Unlike every other channel it never snaps for lack of a spec — the caller
/// passes `spec::morph_default()` when the style names none. It *does* snap
/// (adopt the key without animating) when there is nothing to blend: no
/// on-screen rect yet (first layout — the mount rule) or no resolved chain
/// (unknown/invalid morph filter — the degrade rule).
#[derive(Default)]
pub(super) struct MorphChannel {
    /// The last key seen (retarget detection), like [`FilterChannel::wire`].
    /// `None` until seeded / while the style has no morph.
    pub(super) key: Option<serde_json::Value>,
    /// The active progress runner (0→1); `None` when idle.
    pub(super) runner: Option<Runner>,
    /// Mirrors [`MorphState::freeze_seq`](crate::filters::MorphState::freeze_seq);
    /// owned here so a retarget can bump
    /// it even when the state component doesn't exist yet.
    pub(super) seq: u64,
    /// The settle frame rendered at exactly `1.0`; deactivation happens on
    /// the NEXT drive — by the morph-shader identity contract that frame is
    /// pixel-equal to no pass, so dropping the pass can never flash.
    pub(super) settling: bool,
}

/// What [`MorphChannel::drive`] asks the caller to do this frame.
pub(super) enum MorphAction {
    /// Idle — nothing to write.
    None,
    /// A retarget: write this state (insert the component if absent) and
    /// push capture dirt — the swapped content must re-capture this frame.
    Freeze(crate::filters::MorphState),
    /// Mid-flight: write the new progress onto the existing state.
    Progress(f32),
    /// The morph ended (settled, unset, or degraded): clear `active` on the
    /// existing state, if any.
    Deactivate,
}

impl MorphChannel {
    pub(super) fn drive(
        &mut self,
        input: Option<&crate::filters::MorphInput>,
        has_chain: bool,
        rect: Option<&crate::layer::LayerCaptureRect>,
        spec: &ChannelTransition,
        dt: f32,
    ) -> MorphAction {
        let key_now = input.map(|m| &m.key);
        let retargeted = match key_now {
            Some(key) => self.key.as_ref() != Some(key),
            None => self.key.is_some(),
        };
        if retargeted {
            self.key = key_now.cloned();
            self.settling = false;
            return match (key_now, rect, has_chain) {
                // A real morph: freeze what's on screen and arm the runner.
                // The rect (last frame's — `sync_layer_geometry` runs later,
                // in PostUpdate) is only a "something is on screen" gate:
                // the frozen snapshot is layout-anchored, stretched onto the
                // capture rect wherever it is each frame.
                (Some(_), Some(_), true) => {
                    self.seq = self.seq.wrapping_add(1);
                    self.runner = Some(build_runner(&spec.to_driver(1.0), 0.0));
                    MorphAction::Freeze(crate::filters::MorphState {
                        active: true,
                        progress: 0.0,
                        freeze_seq: self.seq,
                    })
                }
                // Mount (nothing on screen yet), unset, or an unresolved
                // morph filter: adopt the key without animating.
                _ => {
                    self.runner = None;
                    MorphAction::Deactivate
                }
            };
        }
        if let Some(runner) = self.runner.as_mut() {
            let (p, done) = runner.step(dt);
            // Clamp: a spring spec may overshoot, and progress is a texture
            // blend factor — out-of-range values sample garbage.
            let p = if done { 1.0 } else { p.clamp(0.0, 1.0) };
            if done {
                self.runner = None;
                self.settling = true;
            }
            return MorphAction::Progress(p);
        }
        if self.settling {
            self.settling = false;
            return MorphAction::Deactivate;
        }
        MorphAction::None
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

    /// Move a running ease's start: the interp re-arms from `start` toward
    /// the unchanged target with progress untouched — for a caller whose
    /// start is expressed in a frame that moved under it (the layout
    /// channel's shared seed, re-derived from the parent's frame each
    /// flight frame). Idle when nothing is running.
    pub(super) fn rebase(&mut self, start: T) {
        if self.runner.is_some() {
            self.interp.arm(&start, &self.target);
        }
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

/// Per-leaf [`Length`] lerp: each side/corner eases on its own, so a corner
/// changing unit snaps alone while the others keep easing.
impl Lerp for Rect {
    fn lerp(self, other: Self, t: f32) -> Self {
        Rect {
            top: self.top.lerp(other.top, t),
            right: self.right.lerp(other.right, t),
            bottom: self.bottom.lerp(other.bottom, t),
            left: self.left.lerp(other.left, t),
        }
    }
}
