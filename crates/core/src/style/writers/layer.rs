//! Compositing writers: group alpha, transforms, filter inputs, and the
//! transition engines' inputs.

use bevy::prelude::*;

use crate::animations::build_ui_transform;
use crate::filters::{BackdropInput, FilterChain, FilterInput, MorphInput, MorphState};
use crate::layer::LayerGroupAlpha;
use crate::layer::transform3d::LayerTransform3d;
use crate::protocol::animatable::AnimatableField;
use crate::protocol::units::Angle;
use crate::style::Style;
use crate::style::props::*;
use crate::style::{Writer, WriterCtx, owns};
use crate::transition::{
    ScrollTransitionInput, ScrollTransitionState, TransitionInput, TransitionState,
};
use crate::ui_map::{length_to_val, remove_unless_fresh};

/// A promoted layer root's group alpha (the value the opacity fold would
/// have applied). Queued set-if-neq: a settled value must not trip change
/// detection.
pub static GROUP_ALPHA_WRITER: Writer = Writer {
    reads: &[&OPACITY],
    writes: &[owns::<LayerGroupAlpha>],
    apply: |ctx, s, ec| {
        if !ctx.promoted {
            return;
        }
        let alpha = s.get(&OPACITY).static_val().unwrap_or(1.0);
        ec.queue(
            move |mut entity: EntityWorldMut| match entity.get_mut::<LayerGroupAlpha>() {
                Some(mut current) => {
                    current.set_if_neq(LayerGroupAlpha(alpha));
                }
                None => {
                    entity.insert(LayerGroupAlpha(alpha));
                }
            },
        );
    },
};

/// A static `transform` writes `UiTransform`. When absent it is *left
/// untouched* (never removed) so the `#[require(UiTransform)]` invariant on
/// animated/transitioned entities holds, and an in-flight animation or
/// transition isn't reset by a coincident re-render.
pub static TRANSFORM_WRITER: Writer = Writer {
    reads: &[&TRANSFORM],
    writes: &[owns::<UiTransform>],
    apply: |_, s, ec| {
        if let Some(t) = s.get(&TRANSFORM) {
            ec.insert(build_ui_transform(
                t.translate_x.static_val().map(length_to_val),
                t.translate_y.static_val().map(length_to_val),
                t.scale.static_val(),
                t.scale_x.static_val(),
                t.scale_y.static_val(),
                t.rotate.static_val().map(Angle::radians),
            ));
        }
    },
};

/// `transform3d` params — the `UiTransform` never-remove rule (demotion owns
/// removal; an in-flight transition isn't reset by a re-render). Queued
/// set-if-neq like the group alpha.
pub static TRANSFORM3D_WRITER: Writer = Writer {
    reads: &[&TRANSFORM3D],
    writes: &[owns::<LayerTransform3d>],
    apply: |_, s, ec| {
        if let Some(t) = s.get(&TRANSFORM3D).cloned() {
            ec.queue(move |mut entity: EntityWorldMut| {
                match entity.get_mut::<LayerTransform3d>() {
                    Some(mut current) => {
                        current.set_if_neq(LayerTransform3d(t));
                    }
                    None => {
                        entity.insert(LayerTransform3d(t));
                    }
                }
            });
        }
    },
};

/// The wire `filter` chain → `FilterInput` (the chain resolver's and the
/// filter transition channel's input). An empty chain is a wire no-op.
pub static FILTER_WRITER: Writer = Writer {
    reads: &[&FILTER],
    writes: &[owns::<FilterInput>],
    apply: |ctx, s, ec| match s.get(&FILTER).filter(|c| !c.0.is_empty()) {
        Some(chain) => {
            ec.insert(FilterInput(chain.clone()));
        }
        None => remove_unless_fresh::<FilterInput>(ec, ctx.fresh),
    },
};

/// The `backdropFilter` chain → `BackdropInput` (an independent channel).
pub static BACKDROP_FILTER_WRITER: Writer = Writer {
    reads: &[&BACKDROP_FILTER],
    writes: &[owns::<BackdropInput>],
    apply: |ctx, s, ec| match s.get(&BACKDROP_FILTER).filter(|c| !c.0.is_empty()) {
        Some(chain) => {
            ec.insert(BackdropInput(chain.clone()));
        }
        None => remove_unless_fresh::<BackdropInput>(ec, ctx.fresh),
    },
};

/// `morphFilter` → `MorphInput`: the single `FilterUse` as a 1-entry chain
/// (the shared resolver applies) plus the `key` for the morph channel's
/// retarget detection. Unset removes the runtime `MorphState` too: with no
/// `transition` the unset also tears down `TransitionState` — the channel
/// that would otherwise deactivate it.
pub static MORPH_FILTER_WRITER: Writer = Writer {
    reads: &[&MORPH_FILTER],
    writes: &[owns::<MorphInput>],
    apply: |ctx, s, ec| match s.get(&MORPH_FILTER) {
        Some(morph) => {
            ec.insert(MorphInput {
                chain: FilterChain(vec![morph.filter.clone()]),
                key: morph.key.clone(),
            });
        }
        None => remove_unless_fresh::<(MorphInput, MorphState)>(ec, ctx.fresh),
    },
};

/// The transition engine's input from this (possibly hover/press-merged)
/// style; `drive_transitions` eases the snap values the other writers
/// wrote. A `morphFilter` alone stamps it (the morph channel has built-in
/// default timing).
pub static TRANSITION_WRITER: Writer = Writer {
    reads: &[
        &TRANSITION,
        &MORPH_FILTER,
        &TRANSFORM,
        &OPACITY,
        &BACKGROUND_COLOR,
        &WIDTH,
        &HEIGHT,
        &MAX_WIDTH,
        &MAX_HEIGHT,
        &BORDER_RADIUS,
        &TRANSFORM3D,
    ],
    writes: &[owns::<TransitionInput>, owns::<TransitionState>],
    apply: |ctx, s, ec| crate::transition::apply_transition(ec, Some(s), ctx.fresh),
};

/// The scroll-ease components from `transition.scroll`. The spec input is
/// always reinserted (so a spec change lands); the state is created once
/// and persists.
pub static SCROLL_TRANSITION_WRITER: Writer = Writer {
    reads: &[&TRANSITION],
    writes: &[owns::<ScrollTransitionInput>, owns::<ScrollTransitionState>],
    apply: apply_scroll_transition,
};

fn apply_scroll_transition(ctx: &WriterCtx, s: &Style, ec: &mut EntityCommands) {
    match s.get(&TRANSITION).and_then(|t| t.for_scroll()) {
        Some(spec) if ctx.fresh => {
            ec.insert((
                ScrollTransitionInput(spec.clone()),
                ScrollTransitionState::default(),
            ));
        }
        Some(spec) => {
            ec.insert(ScrollTransitionInput(spec.clone()));
            ec.insert_if_new(ScrollTransitionState::default());
        }
        None if ctx.fresh => {}
        None => {
            ec.remove::<ScrollTransitionInput>();
            ec.remove::<ScrollTransitionState>();
        }
    }
}
