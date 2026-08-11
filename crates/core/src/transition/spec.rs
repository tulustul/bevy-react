//! The transition **spec**: the wire-facing [`Transition`] declaration, its
//! per-channel resolution ([`transition_channels!`]), the per-channel timing
//! ([`ChannelTransition`]), and the per-render target input
//! ([`TransitionInput`]).

use bevy::prelude::*;
use serde::Deserialize;

use crate::animations::{Driver, Easing};
use crate::protocol::{
    animatable::AnimatableField, style::Style, units::Length, units::Time as WireTime,
};
use crate::ui_map::parse_color;

use super::color_to_rgba;

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
    /// Eases the layer-based `filter` chain (see [`crate::filters`]) between
    /// style states, whole-value: matching chains interpolate their packed
    /// params; a chain that grows/shrinks at the end over built-in filters
    /// fades through identity values (hover-adds-blur fades in); anything
    /// else swaps at the midpoint. Unlike the others, the *target* doesn't
    /// ride [`TransitionInput`] — it is read live from
    /// [`crate::filters::FilterInput`] (a filter-only delta re-stamps that
    /// component but not the input).
    pub filter: Option<ChannelTransition>,
    /// Eases the `backdropFilter` chain — the second, independent instance of
    /// the `filter` channel (same whole-value strategy, same target rule: the
    /// target is read live from [`crate::filters::BackdropInput`], not
    /// [`TransitionInput`]). The same ease-to-empty snap applies: unsetting
    /// `backdropFilter` demotes the layer (no resolved chain to write into),
    /// so keep an identity entry — e.g. `{ name: "blur", params: { radius:
    /// 0 } }` — in the base chain when removal should ease.
    pub backdrop_filter: Option<ChannelTransition>,
    /// Applies to every `transform3d` channel together (field-wise easing of
    /// the composite-time 3D transform on a promoted layer — see
    /// [`crate::layer::transform3d`]). `perspective` snaps whenever either
    /// endpoint is orthographic (no numeric identity for "no perspective");
    /// unsetting the whole `transform3d` style demotes the layer and snaps,
    /// like `filter`'s ease-to-empty — keep an identity `{}` in the base
    /// style when removal should ease.
    pub transform3d: Option<ChannelTransition>,
}

/// One row per spec channel of [`Transition`]: `(accessor, field, doc
/// phrase)`. Generates the `for_*` accessors — one explicit-else-`all`
/// resolution rule for every channel, instead of eight hand-kept copies.
/// (The [`Transition`] struct fields stay hand-written: their docs carry the
/// wire contract.)
macro_rules! transition_channels {
    ($cb:ident) => {
        $cb! {
            (for_transform, transform, "the transform channels"),
            (for_opacity, opacity, "opacity"),
            (for_background, background_color, "background color"),
            (for_size, size, "the size channels"),
            (for_scroll, scroll, "the scroll offset"),
            (for_filter, filter, "the filter chain"),
            (for_backdrop_filter, backdrop_filter, "the backdrop-filter chain"),
            (for_transform3d, transform3d, "the transform3d channels"),
        }
    };
}

macro_rules! spec_accessors {
    ($(($accessor:ident, $field:ident, $doc:literal),)*) => {
        impl Transition {
            $(
                #[doc = concat!("The transition for ", $doc, " (explicit, else `all`).")]
                pub fn $accessor(&self) -> Option<&ChannelTransition> {
                    self.$field.as_ref().or(self.all.as_ref())
                }
            )*
        }
    };
}
transition_channels!(spec_accessors);

impl Transition {
    /// The spec for a parkable channel, keyed by the same
    /// [`ChannelId`](crate::animations::props::ChannelId) the park predicates
    /// use — so a drive site pairs its `parked(id)` gate and its spec lookup
    /// on one key. (Size and scroll have no `ChannelId` — nothing parks them —
    /// and keep their named accessors only.)
    pub(crate) fn resolve(
        &self,
        channel: crate::animations::props::ChannelId,
    ) -> Option<&ChannelTransition> {
        use crate::animations::props::ChannelId as C;
        match channel {
            C::Transform => self.for_transform(),
            C::Opacity => self.for_opacity(),
            C::Background => self.for_background(),
            C::Filter => self.for_filter(),
            C::Backdrop => self.for_backdrop_filter(),
            C::Transform3d => self.for_transform3d(),
        }
    }
}

/// Timing for one channel. A spring (any of `stiffness`/`damping` set) or, by
/// default, a timing curve. `duration`/`delay` are [`WireTime`]s: a bare number is
/// milliseconds (the JS-facing unit), a string carries an explicit unit
/// (`"200ms"`/`"0.2s"`), and both decode to the seconds the [`Driver`] consumes.
#[derive(Debug, Clone, PartialEq, Deserialize)]
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
    pub(super) fn to_driver(&self, to: f32) -> Driver {
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
    /// Target `transform3d` params, eased field-wise onto the layer's
    /// [`LayerTransform3d`](crate::layer::transform3d::LayerTransform3d).
    pub transform3d: Option<crate::protocol::transform::Transform3d>,
}

impl TransitionInput {
    /// Build the input from a resolved style, or `None` if it has no `transition`.
    pub(super) fn from_style(style: &Style) -> Option<Self> {
        let spec = style.transition.clone()?;
        let t = style.transform.clone().unwrap_or_default();
        // `static_val` throughout: an `{ animated }` channel has no static
        // target to ease toward — it reads as unset here, and the per-channel
        // skip rules park it anyway (bindings win over transitions).
        Some(Self {
            spec,
            translate_x: t.translate_x.static_val(),
            translate_y: t.translate_y.static_val(),
            scale: t.scale.static_val(),
            scale_x: t.scale_x.static_val(),
            scale_y: t.scale_y.static_val(),
            rotate: t
                .rotate
                .static_val()
                .map(crate::protocol::units::Angle::radians),
            opacity: style.opacity.static_val(),
            background_color: style
                .background_color
                .static_ref()
                .map(|hex| color_to_rgba(parse_color(hex))),
            width: style.width.static_val(),
            height: style.height.static_val(),
            max_width: style.max_width.static_val(),
            max_height: style.max_height.static_val(),
            transform3d: style.transform3d.clone(),
        })
    }
}
