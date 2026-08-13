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
//! A channel also driven by an inline `{ animated }` binding is left to the animations
//! plugin: the transition skips any channel bound by the entity's `AnimatedNode`.

use crate::animations::{AnimatedNode, build_ui_transform};
use bevy::ecs::query::QueryData;
use bevy::prelude::*;
use bevy::ui::UiTransform;

use crate::protocol::{style::Style, units::Length};
use crate::ui_map::length_to_val;

mod channels;
mod scroll;
mod shape_channel;
mod spec;
#[cfg(test)]
mod tests;
mod transform3d;

pub use scroll::{ScrollTransitionState, apply_scroll_transition, drive_scroll_transition};
// Reached as `crate::transition::ScrollTransitionInput` only from the
// scrollbar test harness — the lib target alone doesn't see that use.
#[allow(unused_imports)]
pub use scroll::ScrollTransitionInput;
pub use spec::{ChannelTransition, Transition, TransitionInput};

pub use channels::TransitionState;
use channels::with_input_channels;

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

/// Stamp (or clear) the transition components on an SVG **shape** entity from
/// its folded attrs. Shapes have no style, so the spec rides
/// `attrs.transition` (see `crate::svg::ShapeTransitionSpec`) and the stamped
/// [`TransitionInput`] is an empty default whose only job is making the
/// [`drive_transitions`] query match — the shape channel reads spec and
/// targets live from `SvgShape`. Sibling of [`apply_transition`], called
/// from the reconciler's shape create/update paths.
pub fn apply_shape_transition(ec: &mut EntityCommands, attrs: Option<&crate::svg::ShapeAttrs>) {
    match attrs.is_some_and(|a| a.transition.is_some()) {
        true => {
            // Both persist across re-sends (the input carries nothing).
            ec.insert_if_new(TransitionInput::default());
            ec.insert_if_new(TransitionState::default());
        }
        false => {
            ec.remove::<TransitionInput>();
            ec.remove::<TransitionState>();
        }
    }
}

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
    /// this component but never the input: the `filter` style field is in the
    /// FILTER|LAYER dirty groups, not TRANSITION.
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
    /// An SVG shape child's kind + folded attrs — the shape channel's target
    /// AND spec carrier (`attrs.transition`; shapes have no style, so
    /// nothing rides [`TransitionInput`]). Snapped to the target by the op
    /// merge (`apply_js_ops`), ordered before this system.
    shape: Option<&'static mut crate::svg::SvgShape>,
}

/// Advance every transitioning entity toward its [`TransitionInput`] target and
/// write the eased value onto `UiTransform` / `BackgroundColor` / alpha. Runs
/// after `apply_interaction_styles` (and thus after the op drain) so its writes
/// land last in the frame.
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
    mut query: Query<(
        Entity,
        &TransitionInput,
        &mut TransitionState,
        TransitionTargets,
    )>,
) {
    let dt = time.delta_secs();
    for (entity, input, mut state, mut targets) in &mut query {
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
            // Morph: adopt the current key so a freshly mounted morph node
            // never animates in (the first REAL key change retargets).
            state.morph.key = targets.morph_input.map(|m| m.key.clone());
            state.initialized = true;
        }

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
        let skip_filter = parked(ChannelId::Filter);
        let skip_backdrop = parked(ChannelId::Backdrop);
        let skip_transform3d = parked(ChannelId::Transform3d);

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
        }

        // transform3d: eased field-wise onto the layer's params component;
        // `sync_transform3d_matrices` (PostUpdate) derives the matrix and the
        // composite-only dirt from the change, so no dirt push here. A
        // demoted/never-promoted entity has no component — nothing to drive.
        // Mid-ease unset removes the component with the promotion (snap
        // semantics, like filter's ease-to-empty).
        if input.spec.for_transform3d().is_some()
            && !skip_transform3d
            && let Some(target) = &input.transform3d
            && let Some(t3d) = &mut targets.transform3d
        {
            let new = state
                .transform3d
                .drive(target, input.spec.for_transform3d(), dt);
            // Compare-before-write: a settled ease must not re-trigger the
            // matrix sync's change detection every frame.
            if t3d.0 != new {
                t3d.0 = new;
            }
        }

        // Opacity owns the final alpha across background/text/image. Resolved
        // before the background write so it can be baked into that color —
        // otherwise the two writes would ping-pong the alpha channel every frame
        // and the compare-before-write guards would never settle.
        let alpha = if !skip_opacity && let Some(target) = input.opacity {
            Some(state.opacity.drive(target, input.spec.for_opacity(), dt))
        } else {
            None
        };

        // On a promoted layer root the eased opacity drives the group alpha
        // (below) — colors keep their own alpha, so nothing to bake here. The
        // spring itself always eases, keeping a mid-ease promote/demote
        // continuous.
        let promoted = targets.promoted.is_some();
        if !skip_bg && let Some(target) = input.background_color {
            let mut rgba = state.color.drive(target, input.spec.for_background(), dt);
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
        if let Some(alpha) = alpha
            && promoted
        {
            if let Some(la) = &mut targets.layer_alpha
                && la.0 != alpha
            {
                la.0 = alpha;
                // Composite-only: applied to the cached texture at composite
                // time (content of the *enclosing* layer, if any).
                dirt.composite_only.push(entity);
            }
        } else if let Some(alpha) = alpha {
            let mut wrote = false;
            if let Some(c) = &mut targets.bg
                && c.0.alpha() != alpha
            {
                c.0 = c.0.with_alpha(alpha);
                wrote = true;
            }
            if let Some(tc) = &mut targets.text
                && tc.0.alpha() != alpha
            {
                tc.0 = tc.0.with_alpha(alpha);
                wrote = true;
            }
            if let Some(img) = &mut targets.image
                && img.color.alpha() != alpha
            {
                img.color = img.color.with_alpha(alpha);
                wrote = true;
            }
            if wrote {
                dirt.nodes.push(entity);
            }
        }

        // Size (layout): ease the specified `Node` dimensions. Writing `Node`
        // re-triggers Bevy's layout, so each field is compared before writing —
        // a settled transition doesn't force a relayout every frame, and a
        // re-render that reset `Node` to its static style is corrected here.
        // The animations engine never writes `Node`, so no precedence check is
        // needed.
        if input.spec.for_size().is_some()
            && let Some(node) = targets.node.as_mut()
        {
            let s = input.spec.for_size();
            // One drive per `size` row of the channel table: ease toward the
            // input target and compare-write the same-named `Node` field.
            macro_rules! size_rule {
                ($ch:ident, $d:tt, size) => {
                    if let Some(t) = input.$ch {
                        let v = length_to_val(state.$ch.drive(t, s, dt));
                        if node.$ch != v {
                            node.$ch = v;
                        }
                    }
                };
                ($ch:ident, $d:tt, $other:ident) => {};
            }
            macro_rules! size_walk {
                ($(($ch:ident, $d:tt, $group:ident),)*) => {
                    $(size_rule!($ch, $d, $group);)*
                };
            }
            with_input_channels!(size_walk);
        }

        // Filter: ease the promoted root's resolved chain between wire
        // targets (see [`FilterChannel::drive`] for the retarget/writer
        // contract). A write is composite-only dirt, like the resolver's.
        if !skip_filter
            && state.filter.drive(
                targets.filter_input.map(|f| &f.0),
                targets.resolved_filter.as_mut().map(Mut::reborrow),
                input.spec.resolve(ChannelId::Filter),
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
                input.spec.resolve(ChannelId::Backdrop),
                filter_registry.as_deref(),
                assets.as_deref(),
                dt,
            )
        {
            dirt.composite_only.push(entity);
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
                .for_morph_filter()
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

        // SVG shape attrs: ease the numeric attrs toward the values the op
        // merge snapped into `SvgShape.attrs` (spec AND targets ride the
        // component — see `shape_channel`). Coarse park like `skip_filter`:
        // ANY `ShapeAttr` binding parks the WHOLE channel (the animation
        // driver owns bound attrs via the seed slot); parked state resets so
        // unparking re-seeds at the live values. No dirt push — the
        // `Changed<SvgShape>` tick from a real write is the raster's signal.
        if let Some(shape) = &mut targets.shape {
            if targets.anim.is_some_and(|a| a.0.has_shape_attrs()) {
                state.shape.reset();
            } else {
                state.shape.drive(shape, dt);
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
