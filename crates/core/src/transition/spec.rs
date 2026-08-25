//! The transition **spec**: the wire-facing [`Transition`] declaration, its
//! per-channel resolution (`transition_channels!`), the per-channel timing
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
/// field, if present, makes that channel ease on change; a channel without an
/// entry snaps (there is no fallback key). `transform` covers all six
/// transform channels together.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transition {
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
    /// Times the `morphFilter` progress (the engine-owned 0→1 blend from the
    /// frozen old appearance to the live content on a `key` change — see
    /// `crate::filters` morph). Unlike every other channel it has a built-in
    /// default ([`morph_default`]: 300ms ease-in-out), so a key change
    /// animates even with no `transition` style at all; this entry overrides
    /// the timing.
    pub morph_filter: Option<ChannelTransition>,
    /// Eases the resolved `backgroundGradient` between style states,
    /// whole-value: gradients whose structures strictly match (same kind,
    /// stop count, `colorSpace`, position, radial shape variant) interpolate
    /// stop-wise; a structural mismatch SNAPS to the target silently, as do
    /// appear (no gradient → gradient) and
    /// unset — to fade a gradient in or out, keep the surface
    /// mounted and ease its stops through transparent colors instead.
    pub background_gradient: Option<ChannelTransition>,
    /// The `borderGradient` twin of [`Self::background_gradient`] — an
    /// independent channel with the same strict-match-else-snap rules.
    pub border_gradient: Option<ChannelTransition>,
    /// Eases the node's *laid-out rect* (position + size together) whenever
    /// `bevy_ui`'s layout moves or resizes it — cause-blind: a sibling
    /// insert/remove/reorder, a parent resize, a re-wrap, a window resize
    /// all count. FLIP-style: the real layout snaps, and a post-layout
    /// translate + scale (composed into `UiGlobalTransform` after
    /// `UiSystems::Layout`, children riding along) decays to identity — no
    /// relayout, no layer, picking follows. See [`crate::transition::layout`].
    pub layout: Option<ChannelTransition>,
}

/// One row per spec channel of [`Transition`]: `(accessor, field, doc
/// phrase)`. Generates the `for_*` accessors — one explicit-only lookup for
/// every channel, instead of a hand-kept copy per channel.
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
            (for_morph_filter, morph_filter, "the morph progress"),
            (for_background_gradient, background_gradient, "the background gradient"),
            (for_border_gradient, border_gradient, "the border gradient"),
            (for_layout, layout, "the laid-out rect"),
        }
    };
}

macro_rules! spec_accessors {
    ($(($accessor:ident, $field:ident, $doc:literal),)*) => {
        impl Transition {
            $(
                #[doc = concat!("The transition for ", $doc, " (explicit only).")]
                pub fn $accessor(&self) -> Option<&ChannelTransition> {
                    self.$field.as_ref()
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
            C::BackgroundGradient => self.for_background_gradient(),
            C::BorderGradient => self.for_border_gradient(),
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

/// The built-in `morphFilter` timing used when `transition.morphFilter`
/// names none: 300ms ease-in-out. The morph is the one channel that animates
/// without being asked — a key change with no spec at all still eases
/// (snapping would make the feature a no-op, since the blend is only ever
/// visible mid-progress).
pub(super) fn morph_default() -> &'static ChannelTransition {
    static DEFAULT: std::sync::LazyLock<ChannelTransition> =
        std::sync::LazyLock::new(|| ChannelTransition {
            duration: None, // `to_driver` defaults to 0.3s
            easing: Easing::EaseInOut,
            delay: WireTime::default(),
            stiffness: None,
            damping: None,
            mass: 1.0,
        });
    &DEFAULT
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
/// frame by [`drive_transitions`](super::drive_transitions). Never written by
/// the engine — keeping it free
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
    /// Build the input from a resolved style, or `None` if it has no
    /// `transition` — except that a `morphFilter` alone also produces an
    /// input (with an empty spec): the morph channel has built-in default
    /// timing ([`morph_default`]) and must be driven even when the style
    /// never mentions `transition`.
    pub(super) fn from_style(style: &Style) -> Option<Self> {
        let spec = match style.transition.clone() {
            Some(spec) => spec,
            None if style.morph_filter.is_some() => Transition::default(),
            None => return None,
        };
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
