//! The `transform3d` transition channel group: field-wise easing of the
//! composite-time 3D transform params (see [`crate::layer::transform3d`]).
//!
//! Scalars (translations, rotations in radians, scales, perspective) ride the
//! parent module's [`Channel`]; the origin lengths ride [`ProgressChannel`]
//! (same-unit lerp, else snap). `perspective` has no numeric identity for
//! "orthographic", so easing to/from an unset perspective snaps that channel
//! while every other field keeps easing.

use super::{Channel, ChannelTransition, ProgressChannel};
use crate::protocol::{Angle, Length, Transform3d, Transform3dOrigin};

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
    pub(super) fn init(&mut self, t: &Transform3d) {
        let origin = t.origin.unwrap_or_default();
        self.perspective.init(t.perspective.unwrap_or(0.0));
        self.had_perspective = t.perspective.is_some();
        self.translate_x.init(t.translate_x.unwrap_or(0.0));
        self.translate_y.init(t.translate_y.unwrap_or(0.0));
        self.translate_z.init(t.translate_z.unwrap_or(0.0));
        self.rotate_x.init(t.rotate_x.unwrap_or_default().radians());
        self.rotate_y.init(t.rotate_y.unwrap_or_default().radians());
        self.rotate_z.init(t.rotate_z.unwrap_or_default().radians());
        self.scale.init(t.scale.unwrap_or(1.0));
        self.scale_x.init(t.scale_x.unwrap_or(1.0));
        self.scale_y.init(t.scale_y.unwrap_or(1.0));
        self.origin_x.init(origin.x);
        self.origin_y.init(origin.y);
    }

    /// Advance every field toward `target` (`spec` `Some` eases, `None`
    /// snaps — the parent channels' contract) and return the current params.
    /// The output is dense (every field `Some`): identity-valued fields read
    /// as identity either way, and `Transform3d::is_identity` is value-based.
    pub(super) fn drive(
        &mut self,
        target: &Transform3d,
        spec: Option<&ChannelTransition>,
        dt: f32,
    ) -> Transform3d {
        // Perspective: numeric→numeric eases; an orthographic endpoint on
        // either side snaps (there is no focal distance meaning "none").
        let perspective = match (self.had_perspective, target.perspective) {
            (true, Some(d)) => Some(self.perspective.drive(d, spec, dt)),
            (false, Some(d)) => {
                self.perspective.init(d);
                Some(d)
            }
            (_, None) => None,
        };
        self.had_perspective = target.perspective.is_some();
        let origin = target.origin.unwrap_or_default();
        Transform3d {
            perspective,
            translate_x: Some(
                self.translate_x
                    .drive(target.translate_x.unwrap_or(0.0), spec, dt),
            ),
            translate_y: Some(
                self.translate_y
                    .drive(target.translate_y.unwrap_or(0.0), spec, dt),
            ),
            translate_z: Some(
                self.translate_z
                    .drive(target.translate_z.unwrap_or(0.0), spec, dt),
            ),
            rotate_x: Some(Angle::from_radians(self.rotate_x.drive(
                target.rotate_x.unwrap_or_default().radians(),
                spec,
                dt,
            ))),
            rotate_y: Some(Angle::from_radians(self.rotate_y.drive(
                target.rotate_y.unwrap_or_default().radians(),
                spec,
                dt,
            ))),
            rotate_z: Some(Angle::from_radians(self.rotate_z.drive(
                target.rotate_z.unwrap_or_default().radians(),
                spec,
                dt,
            ))),
            scale: Some(self.scale.drive(target.scale.unwrap_or(1.0), spec, dt)),
            scale_x: Some(self.scale_x.drive(target.scale_x.unwrap_or(1.0), spec, dt)),
            scale_y: Some(self.scale_y.drive(target.scale_y.unwrap_or(1.0), spec, dt)),
            origin: Some(Transform3dOrigin {
                x: self.origin_x.drive(origin.x, spec, dt),
                y: self.origin_y.drive(origin.y, spec, dt),
            }),
        }
    }
}
