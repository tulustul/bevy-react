//! The `transform3d` transition channel group: field-wise easing of the
//! composite-time 3D transform params (see [`crate::layer::transform3d`]).
//!
//! Scalars (translations, rotations in radians, scales, perspective) ride the
//! parent module's [`Channel`]; the origin lengths ride [`ProgressChannel`]
//! (same-unit lerp, else snap). `perspective` has no numeric identity for
//! "orthographic", so easing to/from an unset perspective snaps that channel
//! while every other field keeps easing.

use super::channels::{Channel, ProgressChannel};
use super::spec::ChannelTransition;
use crate::protocol::Animatable::Static;
use crate::protocol::{Angle, AnimatableField, Length, Transform3d, Transform3dOrigin};

/// The origin's per-axis static length; an `{ animated }` origin axis eases as
/// its default (the axis is driven per-frame by the binding anyway — any node
/// with a transform3d binding parks this whole channel via `skip_transform3d`).
fn origin_axis(axis: &crate::protocol::Animatable<Length>) -> Length {
    axis.value().copied().unwrap_or(Length::Percent(50.0))
}

#[derive(Default)]
pub(super) struct Transform3dChannels {
    perspective: Channel,
    /// Whether the last target carried a perspective — the snap edge for the
    /// orthographic↔perspective transition.
    had_perspective: bool,
    translate_x: Channel,
    translate_y: Channel,
    translate_z: Channel,
    rotate_x: Channel,
    rotate_y: Channel,
    rotate_z: Channel,
    scale: Channel,
    scale_x: Channel,
    scale_y: Channel,
    origin_x: ProgressChannel<Length>,
    origin_y: ProgressChannel<Length>,
}

impl Transform3dChannels {
    /// Seed the resting state from the mount-time params so a fresh element
    /// snaps to its initial transform instead of easing in from identity.
    /// The per-field seeds generate from the property table's t3d rows
    /// (`crate::animations::props` — the `num <default>`/`angle` unit
    /// metadata); the orthographic flag and origin stay literal exceptions.
    pub(super) fn init(&mut self, t: &Transform3d) {
        let origin = t.origin.clone().unwrap_or_default();
        macro_rules! seed {
            ($prop:tt, (t3d $f:ident num $d:tt)) => {
                self.$f.init(t.$f.static_val().unwrap_or($d));
            };
            ($prop:tt, (t3d $f:ident angle)) => {
                self.$f
                    .init(t.$f.static_val().unwrap_or_default().radians());
            };
            ($prop:tt, $other:tt) => {};
        }
        macro_rules! walk {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                $(seed!($prop, $acc);)*
            };
        }
        crate::animations::props::with_animatable_props!(walk);
        self.had_perspective = t.perspective.is_some();
        self.origin_x.init(origin_axis(&origin.x));
        self.origin_y.init(origin_axis(&origin.y));
    }

    /// Advance every field toward `target` (`spec` `Some` eases, `None`
    /// snaps — the parent channels' contract) and return the current params.
    /// The output is dense (every field `Some`): identity-valued fields read
    /// as identity either way, and `Transform3d::is_identity` is value-based.
    /// The per-field drives generate from the same table rows as [`Self::init`]
    /// (angles: wire degrees in the declarative field, radians in the
    /// channel); perspective and origin are the literal exceptions.
    pub(super) fn drive(
        &mut self,
        target: &Transform3d,
        spec: Option<&ChannelTransition>,
        dt: f32,
    ) -> Transform3d {
        // Perspective: numeric→numeric eases; an orthographic endpoint on
        // either side snaps (there is no focal distance meaning "none").
        let perspective = match (self.had_perspective, target.perspective.static_val()) {
            (true, Some(d)) => Some(Static(self.perspective.drive(d, spec, dt))),
            (false, Some(d)) => {
                self.perspective.init(d);
                Some(Static(d))
            }
            (_, None) => None,
        };
        self.had_perspective = target.perspective.is_some();
        let origin = target.origin.clone().unwrap_or_default();
        let mut out = Transform3d {
            perspective,
            origin: Some(Transform3dOrigin {
                x: Static(self.origin_x.drive(origin_axis(&origin.x), spec, dt)),
                y: Static(self.origin_y.drive(origin_axis(&origin.y), spec, dt)),
            }),
            ..Default::default()
        };
        macro_rules! drive_field {
            // Perspective is the snap exception above — skip its row.
            ($prop:tt, (t3d perspective num $d:tt)) => {};
            ($prop:tt, (t3d $f:ident num $d:tt)) => {
                out.$f = Some(Static(self.$f.drive(
                    target.$f.static_val().unwrap_or($d),
                    spec,
                    dt,
                )));
            };
            ($prop:tt, (t3d $f:ident angle)) => {
                out.$f = Some(Static(Angle::from_radians(self.$f.drive(
                    target.$f.static_val().unwrap_or_default().radians(),
                    spec,
                    dt,
                ))));
            };
            ($prop:tt, $other:tt) => {};
        }
        macro_rules! walk {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                $(drive_field!($prop, $acc);)*
            };
        }
        crate::animations::props::with_animatable_props!(walk);
        out
    }
}
