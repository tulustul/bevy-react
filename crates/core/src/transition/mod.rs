//! CSS-like `transition`: declarative easing of `transform` / `opacity` /
//! `backgroundColor` between style states.
//!
//! The clunky way to "scale a button down on press" is to allocate a shared
//! value and hand-wire `onPointerDown`/`onPointerUp` to drivers. A `transition`
//! instead lets a plain style change — a re-render, or a `hoverStyle`/`pressStyle`
//! kicking in — *ease* to its new value. It reuses the animations crate's driver
//! runtime ([`Runner`](crate::animations::Runner)) rather than a parallel engine.
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
//! per-entity [`TransitionState`] (one [`Runner`](crate::animations::Runner)
//! per channel) toward the input's
//! target and writes the interpolated value onto `UiTransform`/`BackgroundColor`/
//! alpha — *last* in the frame, so a coincident re-render's snap value never wins.
//!
//! A channel also driven by an inline `{ animated }` binding is left to the animations
//! plugin: the transition skips any channel bound by the entity's `AnimatedNode`.

use crate::animations::{AnimatedNode, build_ui_transform};
use bevy::ecs::query::QueryData;
use bevy::prelude::*;
use bevy::ui::{BackgroundGradient, BorderGradient, UiTransform};

use crate::protocol::units::Length;
use crate::style::Style;
use crate::ui_map::{length_to_val, rect_to_border_radius};

mod channels;
mod gradient_channel;
#[cfg(test)]
mod gradient_tests;
pub mod layout;
#[cfg(test)]
mod layout_shared_tests;
#[cfg(test)]
mod layout_tests;
mod scroll;
pub mod shared;
mod spec;
#[cfg(test)]
mod tests;
mod transform3d;

pub use scroll::{
    ScrollTransitionState, apply_scroll_transition, apply_scroll_transition_fresh,
    drive_scroll_transition,
};
// Reached as `crate::transition::ScrollTransitionInput` only from the
// scrollbar test harness — the lib target alone doesn't see that use.
#[allow(unused_imports)]
pub use scroll::ScrollTransitionInput;
pub use spec::{ChannelTransition, Transition, TransitionInput};

use channels::with_input_channels;
pub use channels::{Channel, TransitionState};

/// Stamp (or clear) the transition components on a host element. Called from
/// [`crate::ui_map::apply_style`] with the resolved style, so the input always
/// reflects the current `Interaction` (base / hover / press). Sibling to
/// `apply_animated` in the reconciler's apply pattern.
///
/// `fresh` marks a just-spawned entity: the input + state land as one insert
/// (one archetype move) and the absent case queues nothing — there is nothing
/// to remove.
pub fn apply_transition(ec: &mut EntityCommands, style: Option<&Style>, fresh: bool) {
    match (style.and_then(TransitionInput::from_style), fresh) {
        (Some(input), true) => {
            ec.insert((input, TransitionState::default()));
        }
        (Some(input), false) => {
            ec.insert(input);
            // The runtime state persists across re-renders, so only create it once.
            ec.insert_if_new(TransitionState::default());
        }
        (None, true) => {}
        (None, false) => {
            ec.remove::<TransitionInput>();
            ec.remove::<TransitionState>();
        }
    }
}

/// Stamp (or clear) the transition components on an SVG **shape** entity from
/// The components a transition can drive, plus the read-only inputs that gate how
/// it drives them. A `QueryData` struct (rather than a tuple) so a new transition
/// target component is one field, not a tuple-arity problem — the filter
/// channel's fields (`filter_input`/`resolved_filter`) live here already.
/// The per-param filter bindings (`filter[<i>].<param>`) write through the
/// *animation side* instead: `AnimTargets` (the animations applier's mirror
/// of this struct) carries its own resolved-chain field. Every target is
/// optional except `UiTransform` (required by [`TransitionState`]).
#[derive(QueryData)]
#[query_data(mutable)]
pub struct TransitionTargets {
    transform: &'static mut UiTransform,
    bg: Option<&'static mut BackgroundColor>,
    text: Option<&'static mut TextColor>,
    image: Option<&'static mut ImageNode>,
    node: Option<&'static mut Node>,
    /// The node's derived animation bindings; any channel they drive is skipped.
    anim: Option<&'static AnimatedNode>,
    // On a promoted layer root (see `crate::layer`) a transitioned `opacity`
    // drives the composite-time group alpha instead of the color folds.
    promoted: Option<&'static crate::layer::PromotedLayer>,
    layer_alpha: Option<&'static mut crate::layer::LayerGroupAlpha>,
    /// The wire `filter` chain — the filter channel's *target*. Read here
    /// (not from [`TransitionInput`]) because a filter-only delta re-stamps
    /// this component but never the input: the transition writer doesn't
    /// read the `filter` property.
    filter_input: Option<&'static crate::filters::FilterInput>,
    /// The resolved chain the filter channel writes eased packed params into
    /// (promoted roots only; snapped to the target by
    /// `resolve_chains`, ordered before this system).
    resolved_filter: Option<&'static mut crate::filters::ResolvedFilterChain>,
    /// The `backdropFilter` channel's target — same live-read rule as
    /// [`Self::filter_input`].
    backdrop_input: Option<&'static crate::filters::BackdropInput>,
    /// The resolved backdrop chain the second filter-channel instance writes
    /// into (projected to the inner chain via `Mut::map_unchanged`).
    resolved_backdrop: Option<&'static mut crate::filters::ResolvedBackdropChain>,
    /// The morph channel's target (the `key` + filter use) — same live-read
    /// rule as [`Self::filter_input`]: a morph-only delta re-stamps this
    /// component, never [`TransitionInput`].
    morph_input: Option<&'static crate::filters::MorphInput>,
    /// The resolved morph chain — read-only presence gate: a retarget with
    /// no resolved single-pass chain degrades to a snap (the channel never
    /// writes it; progress lives on [`Self::morph_state`]).
    resolved_morph: Option<&'static crate::filters::ResolvedMorphChain>,
    /// The morph runtime the channel writes (freeze sequencing + progress),
    /// read by render extraction. Inserted by this system on first
    /// activation.
    morph_state: Option<&'static mut crate::filters::MorphState>,
    /// The layer's on-screen capture rect (last frame's — geometry sync runs
    /// later in PostUpdate): what the morph freezes, and the mount gate (no
    /// rect = nothing on screen = snap).
    capture_rect: Option<&'static crate::layer::LayerCaptureRect>,
    /// The composite-time 3D transform params on a promoted root; the eased
    /// value lands here and `sync_transform3d_matrices` (PostUpdate) turns
    /// the change into the matrix + composite-only dirt — no dirt push here.
    transform3d: Option<&'static mut crate::layer::transform3d::LayerTransform3d>,
    /// The gradient channels' target: the resolver's UNfolded stamp
    /// (live-read like [`Self::filter_input`] — a gradient-only delta
    /// re-stamps this, never [`TransitionInput`]).
    gradient_input: Option<&'static crate::ui_map::GradientTargets>,
    /// The folded per-surface components the gradient channels ease
    /// (snapped to the target by `apply_style`, which runs before this
    /// system).
    bg_gradient: Option<&'static mut BackgroundGradient>,
    border_gradient: Option<&'static mut BorderGradient>,
    /// The shared-element seed a paired mount carries (see [`shared`]):
    /// consumed on the first drive — every value channel starts at the
    /// outgoing node's reading — and removed.
    shared_seed: Option<&'static shared::SharedSeed>,
}

/// The drive's wake filter: a change tick on the input or on any component
/// [`TransitionTargets`] reads or writes — one entry per target field (add
/// the field's component here AND to [`RemovedTargets`] when adding a
/// field). `TransitionState` itself is deliberately absent:
/// `drive_layout_transitions` steps every state through `DerefMut` each
/// frame, and the one cross-system state write this drive must see — a
/// shared flight arming — holds `TransitionState::settled` false for the
/// whole flight.
type AnyTargetChanged = Or<(
    Changed<TransitionInput>,
    Changed<UiTransform>,
    Changed<BackgroundColor>,
    Changed<TextColor>,
    Changed<ImageNode>,
    Changed<Node>,
    Changed<AnimatedNode>,
    Changed<crate::layer::PromotedLayer>,
    Changed<crate::layer::LayerGroupAlpha>,
    Changed<crate::filters::FilterInput>,
    Changed<crate::filters::ResolvedFilterChain>,
    Changed<crate::filters::BackdropInput>,
    Changed<crate::filters::ResolvedBackdropChain>,
    Changed<crate::filters::MorphInput>,
    Or<(
        Changed<crate::filters::ResolvedMorphChain>,
        Changed<crate::filters::MorphState>,
        Changed<crate::layer::LayerCaptureRect>,
        Changed<crate::layer::transform3d::LayerTransform3d>,
        Changed<crate::ui_map::GradientTargets>,
        Changed<BackgroundGradient>,
        Changed<BorderGradient>,
        Changed<shared::SharedSeed>,
    )>,
)>;

/// The removal half of the wake set: a target component vanishing leaves no
/// change tick, so any removal since the last run wakes EVERY node (a full
/// walk — the pre-gate behavior — rather than per-node bookkeeping; removals
/// are rare next to idle frames). Same field list as [`AnyTargetChanged`]
/// minus the input (its removal takes the state with it) and the seed (only
/// this drive removes it, after consuming it).
#[derive(bevy::ecs::system::SystemParam)]
pub struct RemovedTargets<'w, 's> {
    bg: RemovedComponents<'w, 's, BackgroundColor>,
    text: RemovedComponents<'w, 's, TextColor>,
    image: RemovedComponents<'w, 's, ImageNode>,
    node: RemovedComponents<'w, 's, Node>,
    anim: RemovedComponents<'w, 's, AnimatedNode>,
    promoted: RemovedComponents<'w, 's, crate::layer::PromotedLayer>,
    layer_alpha: RemovedComponents<'w, 's, crate::layer::LayerGroupAlpha>,
    filter_input: RemovedComponents<'w, 's, crate::filters::FilterInput>,
    resolved_filter: RemovedComponents<'w, 's, crate::filters::ResolvedFilterChain>,
    backdrop_input: RemovedComponents<'w, 's, crate::filters::BackdropInput>,
    resolved_backdrop: RemovedComponents<'w, 's, crate::filters::ResolvedBackdropChain>,
    morph_input: RemovedComponents<'w, 's, crate::filters::MorphInput>,
    resolved_morph: RemovedComponents<'w, 's, crate::filters::ResolvedMorphChain>,
    morph_state: RemovedComponents<'w, 's, crate::filters::MorphState>,
    capture_rect: RemovedComponents<'w, 's, crate::layer::LayerCaptureRect>,
    transform3d: RemovedComponents<'w, 's, crate::layer::transform3d::LayerTransform3d>,
    gradient_input: RemovedComponents<'w, 's, crate::ui_map::GradientTargets>,
    bg_gradient: RemovedComponents<'w, 's, BackgroundGradient>,
    border_gradient: RemovedComponents<'w, 's, BorderGradient>,
}

impl RemovedTargets<'_, '_> {
    /// Whether any tracked component was removed since the last run. Reads
    /// (and thereby consumes) every stream, so a removal is seen once.
    fn any(&mut self) -> bool {
        let mut any = false;
        macro_rules! drain {
            ($($f:ident),*) => {
                $(any |= self.$f.read().next().is_some(); self.$f.clear();)*
            };
        }
        drain!(
            bg,
            text,
            image,
            node,
            anim,
            promoted,
            layer_alpha,
            filter_input,
            resolved_filter,
            backdrop_input,
            resolved_backdrop,
            morph_input,
            resolved_morph,
            morph_state,
            capture_rect,
            transform3d,
            gradient_input,
            bg_gradient,
            border_gradient
        );
        any
    }
}

/// Advance every transitioning entity toward its [`TransitionInput`] target and
/// write the eased value onto `UiTransform` / `BackgroundColor` / alpha. Runs
/// after `apply_interaction_styles` (and thus after the op drain) so its writes
/// land last in the frame.
///
/// Idle gate: a node whose channels are all settled
/// ([`TransitionState::settled`], stamped at the end of its last drive) and
/// whose input, targets and component set are exactly as this system last
/// saw them has nothing to do — every block of the body is a retarget check
/// followed by a compare-before-write, and both would find nothing. So the
/// body runs only for the wake set: nodes still in flight, plus nodes with
/// a change tick on ANY component the drive reads or writes (a re-render's
/// static snap, a promotion flip, a resolver re-resolve, an op-merge shape
/// write — [`AnyTargetChanged`], evaluated as a filter query so an idle node
/// costs a per-archetype tick scan and never the full target fetch), plus
/// every node when a target component vanished anywhere
/// ([`RemovedTargets`]). Every re-assert path thus stays same-frame; the
/// system's own writes carry its own tick and never wake it.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn drive_transitions(
    time: Res<Time>,
    mut commands: Commands,
    mut dirt: ResMut<crate::layer::LayerContentDirt>,
    // The filter channel resolves identity padding at retarget time. Both are
    // optional so schedule-only test worlds without asset machinery still
    // drive the scalar channels; a missing pair degrades a chain extension to
    // a discrete swap (see `crate::filters::plan_filter_ease`).
    filter_registry: Option<Res<crate::filters::FilterRegistry>>,
    assets: Option<Res<AssetServer>>,
    // `p0`: the change half of the wake set; `p1`: every node's settled
    // flag; `p2`: the drive itself. A `ParamSet` because the first two read
    // what the third writes.
    mut queries: ParamSet<(
        Query<Entity, (With<TransitionState>, AnyTargetChanged)>,
        Query<(Entity, &TransitionState)>,
        Query<(
            Entity,
            &TransitionInput,
            &mut TransitionState,
            TransitionTargets,
        )>,
    )>,
    mut removed: RemovedTargets,
    // The wake set, kept across frames so an idle frame allocates nothing.
    mut woken: Local<Vec<Entity>>,
) {
    let dt = time.delta_secs();
    woken.clear();
    let all = removed.any();
    for (entity, state) in &queries.p1() {
        if all || !state.settled {
            woken.push(entity);
        }
    }
    if !all {
        woken.extend(&queries.p0());
        woken.sort_unstable();
        woken.dedup();
    }
    let mut query = queries.p2();
    for entity in woken.drain(..) {
        let Ok((entity, input, mut state, mut targets)) = query.get_mut(entity) else {
            continue;
        };
        // Seed resting values on first sight so a freshly mounted element snaps to
        // its initial style instead of animating in from zero.
        if !state.initialized {
            // Every plain channel seeds from its input field at its identity
            // default (the channel table above); color seeds only from an
            // actual target (there is no identity color).
            macro_rules! seed {
                ($(($ch:ident, $d:tt, $group:ident),)*) => {
                    $(state.$ch.init(input.$ch.unwrap_or($d));)*
                };
            }
            with_input_channels!(seed);
            if let Some(c) = input.background_color {
                state.color.init(c);
            }
            // Filter: adopt the current wire chain and whatever the resolver
            // produced, so a freshly mounted filtered element snaps instead
            // of fading in from identity.
            state.filter.wire = targets
                .filter_input
                .map(|f| f.0.clone())
                .unwrap_or_default();
            state.filter.channel.init(
                targets
                    .resolved_filter
                    .as_deref()
                    .map(|c| c.passes.clone())
                    .unwrap_or_default(),
            );
            state.backdrop_filter.wire = targets
                .backdrop_input
                .map(|f| f.0.clone())
                .unwrap_or_default();
            state.backdrop_filter.channel.init(
                targets
                    .resolved_backdrop
                    .as_deref()
                    .map(|c| c.0.passes.clone())
                    .unwrap_or_default(),
            );
            state
                .transform3d
                .init(&input.transform3d.clone().unwrap_or_default());
            // Gradients: adopt the resolver's unfolded stamp so a freshly
            // mounted gradient snaps instead of easing in from nothing.
            state
                .background_gradient
                .seed(targets.gradient_input.and_then(|g| g.background.as_ref()));
            state
                .border_gradient
                .seed(targets.gradient_input.and_then(|g| g.border.as_ref()));
            // Morph: adopt the current key so a freshly mounted morph node
            // never animates in (the first REAL key change retargets).
            state.morph.key = targets.morph_input.map(|m| m.key.clone());
            state.initialized = true;
            // A shared-element mount: overlay the outgoing node's readings
            // on the value channels (the blocks below then retarget from
            // there with the `sharedElement` spec), park the rect for the
            // layout drive, and drop the seed.
            if let Some(seed) = targets.shared_seed {
                if let Some(spec) = input.spec.shared_element.as_ref() {
                    state.seed_from(seed, spec.clone());
                }
                commands.entity(entity).remove::<shared::SharedSeed>();
            }
        }
        // A shared flight in progress (see [`shared`]): the seeded channels'
        // blocks run even without a spec of their own (`shared_spec` gates
        // them), and on the seed frame they ARM with the `sharedElement`
        // spec as fallback (`arm_spec`) — one timing for the whole flight.
        // Later retargets arm with each channel's own spec only, so an
        // unrelated hover mid-flight behaves as it always does.
        let shared_spec = state
            .shared
            .active
            .then(|| state.shared.spec.clone())
            .flatten();
        let shared_spec = shared_spec.as_ref();
        let seed_frame = state.shared.seed_frame;

        // Imperative bindings win: skip any channel an `{ animated }` wrapper
        // drives. Which bindings park which channel is the property table's
        // park column (`crate::animations::props::ChannelId` — fine-grained
        // for opacity/background, coarse for the group channels).
        // Coarse by design for `filter`: ANY `filter[<i>].<param>` binding
        // parks the WHOLE whole-value filter channel — the channel eases a
        // complete pass list, so there is no per-param seam to merge an
        // imperative writer into. The bindings then re-assert their params on
        // top of the resolver's snap every frame (`AnimationSet::Apply`).
        // Same coarse rule for the independent backdrop channel (a
        // `backdropFilter[…]` binding parks only backdrop), and for
        // `transform3d` (the bindings rebuild the full params struct).
        use crate::animations::props::ChannelId;
        let parked = |c: ChannelId| targets.anim.is_some_and(|a| a.0.parked(c));
        let skip_transform = parked(ChannelId::Transform);
        let skip_opacity = parked(ChannelId::Opacity);
        let skip_bg = parked(ChannelId::Background);
        let skip_radius = parked(ChannelId::BorderRadius);
        let skip_filter = parked(ChannelId::Filter);
        let skip_backdrop = parked(ChannelId::Backdrop);
        let skip_transform3d = parked(ChannelId::Transform3d);
        let skip_bg_gradient = parked(ChannelId::BackgroundGradient);
        let skip_border_gradient = parked(ChannelId::BorderGradient);

        // Re-seed an *undriven* channel group from the static style. A channel
        // only advances while its own spec is present, so a style state that
        // drops the entry leaves `current`/`target` frozen at the reading from
        // before — and the next retarget, comparing against that stale target,
        // finds nothing to do and silently snaps. (The demos shell hits this:
        // crossing the responsive breakpoint commits `transition: {}` to snap
        // the nav across the swap, and the drawer's first open after it never
        // eased.) Nothing is written here — `apply_style` already put the
        // static value on the component; only the readings catch up. The
        // channels that always drive (opacity, background color) pass their
        // `Option<spec>` straight to `drive`, which snaps on `None`, so they
        // stay in sync on their own.
        macro_rules! sync_row {
            (transform, $ch:ident, $d:tt, transform) => {
                state.$ch.init(input.$ch.unwrap_or($d));
            };
            (size, $ch:ident, $d:tt, size) => {
                state.$ch.init(input.$ch.unwrap_or($d));
            };
            (radius, $ch:ident, $d:tt, radius) => {
                state.$ch.init(input.$ch.unwrap_or($d));
            };
            ($want:ident, $ch:ident, $d:tt, $group:ident) => {};
        }
        macro_rules! sync_transform_rows {
            ($(($ch:ident, $d:tt, $group:ident),)*) => { $(sync_row!(transform, $ch, $d, $group);)* };
        }
        macro_rules! sync_size_rows {
            ($(($ch:ident, $d:tt, $group:ident),)*) => { $(sync_row!(size, $ch, $d, $group);)* };
        }
        macro_rules! sync_radius_rows {
            ($(($ch:ident, $d:tt, $group:ident),)*) => { $(sync_row!(radius, $ch, $d, $group);)* };
        }

        // Transform: only when a transform transition is declared; otherwise the
        // static `UiTransform` from `apply_style` stands untouched (the `else`
        // branch still re-seeds the channels — see `sync_row`). Only
        // specified channels are written (passing `None` keeps
        // `build_ui_transform`'s scale precedence intact).
        if input.spec.transform.as_ref().or(shared_spec).is_some() && !skip_transform {
            let s = arm_spec(seed_frame, input.spec.transform.as_ref(), shared_spec);
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
            if *targets.transform != new {
                // Layer-cache classification — the one fn shared with the
                // animation applier: both `UiTransform` writers must
                // classify identically.
                crate::animations::push_transform_dirt(
                    entity,
                    &targets.transform,
                    &new,
                    targets.promoted.is_some(),
                    &mut dirt,
                );
                *targets.transform = new;
            }
        } else if !skip_transform {
            with_input_channels!(sync_transform_rows);
        }

        // transform3d: eased field-wise onto the layer's params component;
        // `sync_transform3d_matrices` (PostUpdate) derives the matrix and the
        // composite-only dirt from the change, so no dirt push here. A
        // demoted/never-promoted entity has no component — nothing to drive.
        // Mid-ease unset removes the component with the promotion (snap
        // semantics, like filter's ease-to-empty).
        if input.spec.transform3d.as_ref().or(shared_spec).is_some()
            && !skip_transform3d
            && let Some(target) = &input.transform3d
            && let Some(t3d) = &mut targets.transform3d
        {
            let new = state.transform3d.drive(
                target,
                arm_spec(seed_frame, input.spec.transform3d.as_ref(), shared_spec),
                dt,
            );
            // Compare-before-write: a settled ease must not re-trigger the
            // matrix sync's change detection every frame.
            if t3d.0 != new {
                t3d.0 = new;
            }
        } else if !skip_transform3d {
            state
                .transform3d
                .init(&input.transform3d.clone().unwrap_or_default());
        }

        // Opacity owns the final alpha across background/text/image. Resolved
        // before the background write so it can be baked into that color —
        // otherwise the two writes would ping-pong the alpha channel every frame
        // and the compare-before-write guards would never settle.
        let alpha = if !skip_opacity && let Some(target) = input.opacity {
            Some(state.opacity.drive(
                target,
                arm_spec(seed_frame, input.spec.opacity.as_ref(), shared_spec),
                dt,
            ))
        } else {
            None
        };

        // On a promoted layer root the eased opacity drives the group alpha
        // (below) — colors keep their own alpha, so nothing to bake here. The
        // spring itself always eases, keeping a mid-ease promote/demote
        // continuous.
        let promoted = targets.promoted.is_some();
        if !skip_bg && let Some(target) = input.background_color {
            // A seeded flight from a node with no background: fade in from
            // the target's own hue, not from transparent black.
            if state.shared.active && state.color.runner.is_none() && state.color.current[3] == 0.0
            {
                state.color.init([target[0], target[1], target[2], 0.0]);
            }
            let mut rgba = state.color.drive(
                target,
                arm_spec(
                    seed_frame,
                    input.spec.background_color.as_ref(),
                    shared_spec,
                ),
                dt,
            );
            if let Some(a) = alpha
                && !promoted
            {
                rgba[3] = a;
            }
            let color = rgba_to_color(rgba);
            match &mut targets.bg {
                Some(c) if c.0 != color => {
                    c.0 = color;
                    dirt.nodes.push(entity);
                }
                Some(_) => {}
                None => {
                    commands.entity(entity).insert(BackgroundColor(color));
                    dirt.nodes.push(entity);
                }
            }
        }

        // Opacity always applies when set (even with no opacity transition: it then
        // snaps), so a transitioning background color doesn't clobber the alpha.
        // Promoted → the group alpha is the single target instead.
        if let Some(alpha) = alpha {
            crate::animations::write_final_alpha(
                entity,
                alpha,
                promoted,
                targets.layer_alpha.as_mut(),
                targets.bg.as_mut(),
                targets.text.as_mut(),
                targets.image.as_mut(),
                &mut dirt,
            );
        }

        // Size (layout): ease the specified `Node` dimensions. Writing `Node`
        // re-triggers Bevy's layout, so each field is compared before writing —
        // a settled transition doesn't force a relayout every frame, and a
        // re-render that reset `Node` to its static style is corrected here.
        // The animations engine never writes `Node`, so no precedence check is
        // needed.
        if state.shared.size.is_some()
            && let Some(node) = targets.node.as_mut()
        {
            // The shared flight's measured-px size ease (armed by the layout
            // drive) owns the flying dimensions until it settles them back
            // on their authored values; the regular walk below keeps the
            // other size channels on their targets meanwhile.
            state.drive_shared_size(node, input, dt);
        }
        let flying = state.shared.size.unwrap_or_default();
        if input.spec.size.is_some()
            && let Some(node) = targets.node.as_mut()
        {
            let s = input.spec.size.as_ref();
            // One drive per `size` row of the channel table: ease toward the
            // input target and compare-write the same-named `Node` field —
            // except an axis the shared size flight is flying right now.
            macro_rules! size_drive {
                ($ch:ident) => {
                    if let Some(t) = input.$ch {
                        let v = length_to_val(state.$ch.drive(t, s, dt));
                        if node.$ch != v {
                            node.$ch = v;
                        }
                    }
                };
            }
            macro_rules! size_rule {
                (width, $d:tt, size) => {
                    if !flying.width {
                        size_drive!(width);
                    }
                };
                (height, $d:tt, size) => {
                    if !flying.height {
                        size_drive!(height);
                    }
                };
                ($ch:ident, $d:tt, size) => {
                    size_drive!($ch);
                };
                ($ch:ident, $d:tt, $other:ident) => {};
            }
            macro_rules! size_walk {
                ($(($ch:ident, $d:tt, $group:ident),)*) => {
                    $(size_rule!($ch, $d, $group);)*
                };
            }
            with_input_channels!(size_walk);
        } else if state.shared.size.is_none() {
            // Not while a shared-element flight owns width/height: it drives
            // the very same channels (`drive_shared_size`).
            with_input_channels!(sync_size_rows);
        }

        // Corner radii (layout, like size: the radius lives on `Node`, so an
        // eased frame is a relayout — compare-before-write keeps a settled
        // radius silent). Eased per corner; an unset target is square corners,
        // what `node_from` wrote. Content dirt is required: the radius
        // is not in the layer geometry hash (`fold_member_geometry` folds
        // translation/matrix/size only), so a cached enclosing layer would
        // otherwise never re-capture the changing corners.
        if input.spec.border_radius.as_ref().or(shared_spec).is_some()
            && !skip_radius
            && let Some(node) = targets.node.as_mut()
        {
            let target = input.border_radius.unwrap_or_default();
            let r = rect_to_border_radius(state.border_radius.drive(
                target,
                arm_spec(seed_frame, input.spec.border_radius.as_ref(), shared_spec),
                dt,
            ));
            if node.border_radius != r {
                node.border_radius = r;
                dirt.nodes.push(entity);
            }
        } else if !skip_radius {
            with_input_channels!(sync_radius_rows);
        }

        // Filter: ease the promoted root's resolved chain between wire
        // targets (see [`FilterChannel::drive`] for the retarget/writer
        // contract). A write is composite-only dirt, like the resolver's.
        if !skip_filter
            && state.filter.drive(
                targets.filter_input.map(|f| &f.0),
                targets.resolved_filter.as_mut().map(Mut::reborrow),
                arm_spec(
                    seed_frame,
                    input.spec.resolve(ChannelId::Filter),
                    shared_spec,
                ),
                filter_registry.as_deref(),
                assets.as_deref(),
                dt,
            )
        {
            dirt.composite_only.push(entity);
        }

        // Backdrop filter: the second instance of the same channel, over the
        // backdrop component pair (targets projected to the shared inner
        // types). A write is composite-only dirt like the content one.
        if !skip_backdrop
            && state.backdrop_filter.drive(
                targets.backdrop_input.map(|f| &f.0),
                targets
                    .resolved_backdrop
                    .as_mut()
                    .map(|m| m.reborrow().map_unchanged(|b| &mut b.0)),
                arm_spec(
                    seed_frame,
                    input.spec.resolve(ChannelId::Backdrop),
                    shared_spec,
                ),
                filter_registry.as_deref(),
                assets.as_deref(),
                dt,
            )
        {
            dirt.composite_only.push(entity);
        }

        // Gradients: ease each surface's folded component toward the
        // resolver's UNfolded stamp — one `drive_onto` per surface (see it
        // for the retarget/snap policy and the fold-at-write rules).
        // Retarget detection runs on the unfolded stamp (it only changes on
        // style deltas); the eased opacity is baked only off a promoted
        // root (the group alpha owns the fold there), else the stamp's
        // static fold applies — so settle equals `apply_style`'s own folded
        // build bit-exactly. A write is content dirt: gradient pixels live
        // in the capture.
        {
            let eased_alpha = alpha.filter(|_| !promoted);
            let static_fold = targets.gradient_input.and_then(|g| g.opacity);
            if !skip_bg_gradient
                && state.background_gradient.drive_onto(
                    targets.gradient_input.and_then(|g| g.background.as_ref()),
                    targets
                        .bg_gradient
                        .as_mut()
                        .map(|m| m.reborrow().map_unchanged(|b| &mut b.0)),
                    arm_spec(
                        seed_frame,
                        input.spec.resolve(ChannelId::BackgroundGradient),
                        shared_spec,
                    ),
                    eased_alpha,
                    static_fold,
                    dt,
                )
            {
                dirt.nodes.push(entity);
            }
            if !skip_border_gradient
                && state.border_gradient.drive_onto(
                    targets.gradient_input.and_then(|g| g.border.as_ref()),
                    targets
                        .border_gradient
                        .as_mut()
                        .map(|m| m.reborrow().map_unchanged(|b| &mut b.0)),
                    arm_spec(
                        seed_frame,
                        input.spec.resolve(ChannelId::BorderGradient),
                        shared_spec,
                    ),
                    eased_alpha,
                    static_fold,
                    dt,
                )
            {
                dirt.nodes.push(entity);
            }
        }

        // Morph: retarget on a key change (freeze what's on screen, restart
        // progress), then ease the engine-owned progress 0→1 onto
        // `MorphState`. The spec falls back to the built-in default — the
        // one channel that animates without being asked. Never parked:
        // progress is engine-owned (morph *param* bindings ride the
        // animation side and touch the resolved chain, not this state). The
        // freeze pushes capture dirt: the swapped content must re-capture
        // this frame, with the old pixels stolen render-side first.
        {
            use channels::MorphAction;
            let morph_spec = input
                .spec
                .morph_filter
                .as_ref()
                .unwrap_or_else(|| spec::morph_default());
            match state.morph.drive(
                targets.morph_input,
                targets.resolved_morph.is_some(),
                targets.capture_rect,
                morph_spec,
                dt,
            ) {
                MorphAction::Freeze(new) => {
                    match &mut targets.morph_state {
                        Some(s) if **s != new => **s = new,
                        Some(_) => {}
                        None => {
                            commands.entity(entity).insert(new);
                        }
                    }
                    dirt.nodes.push(entity);
                }
                MorphAction::Progress(p) => {
                    if let Some(s) = &mut targets.morph_state
                        && s.progress != p
                    {
                        s.progress = p;
                        // Composite-only: the blend re-runs render-side, but
                        // an ENCLOSING cached layer bakes this layer's quad —
                        // it must re-capture while the blend animates (the
                        // same per-frame dirt a filter-param ease pushes).
                        dirt.composite_only.push(entity);
                    }
                }
                MorphAction::Deactivate => {
                    if let Some(s) = &mut targets.morph_state
                        && s.active
                    {
                        s.active = false;
                    }
                }
                MorphAction::None => {}
            }
        }

        // Shared flight bookkeeping: the seed frame records which channels
        // it armed; afterwards the flight ends once none of them (nor the
        // rect/size flights) is still easing.
        if state.shared.seed_frame {
            state.shared.armed = state.running_mask();
            state.shared.seed_frame = false;
        } else if state.shared.active && !state.seeded_still_running() {
            state.shared.active = false;
        }

        // Stamp the idle gate's flag (see the system doc): a node with
        // nothing in flight is skipped next frame unless something changes
        // under it.
        let settled = !state.in_flight();
        if state.settled != settled {
            state.settled = settled;
        }
    }
}

pub(super) fn color_to_rgba(color: Color) -> [f32; 4] {
    let s = color.to_srgba();
    [s.red, s.green, s.blue, s.alpha]
}

/// The spec a channel ARMS with: on the seed frame of a shared flight (see
/// [`shared`]) the `sharedElement` spec stands in for a missing own spec;
/// afterwards only the channel's own spec counts (a spec-less retarget
/// snaps, as always).
fn arm_spec<'a>(
    seed_frame: bool,
    own: Option<&'a ChannelTransition>,
    shared: Option<&'a ChannelTransition>,
) -> Option<&'a ChannelTransition> {
    if seed_frame { own.or(shared) } else { own }
}

fn rgba_to_color(rgba: [f32; 4]) -> Color {
    Color::srgba(rgba[0], rgba[1], rgba[2], rgba[3])
}
