//! The static `transform` / `transform3d` wire types mirroring the animated
//! transform channels.

use serde::Deserialize;

use super::animatable::{Animatable, AnimatableField};
use super::units::{Angle, Length};

/// A static 2D transform mirroring the animated transform channels. Every field
/// is optional; unset channels stay at identity (no translation, unit scale, no
/// rotation). `scale` is uniform; `scaleX`/`scaleY` override a single axis.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transform {
    /// Translation along x — a length (number = logical pixels, or a unit string
    /// like `"50%"`, resolved against the node's own size by `bevy_ui`).
    pub translate_x: Option<Animatable<Length>>,
    /// Translation along y — a length (number = logical pixels, or a unit string
    /// like `"50%"`).
    pub translate_y: Option<Animatable<Length>>,
    /// Uniform scale (both axes), unless overridden by `scale_x`/`scale_y`.
    pub scale: Option<Animatable<f32>>,
    pub scale_x: Option<Animatable<f32>>,
    pub scale_y: Option<Animatable<f32>>,
    /// Clockwise rotation (number = degrees, or a unit string like `"1.5rad"`).
    /// An animated binding's per-frame values are read as **degrees** too.
    pub rotate: Option<Animatable<Angle>>,
}

/// The `transform3d` style: a 3D perspective transform composited onto a
/// promoted layer's quad (see [`super::style::Style::transform3d`]). Every field is optional;
/// unset channels stay at identity. Canonical application order around
/// [`origin`](Self::origin): scale → rotateX → rotateY → rotateZ → translate,
/// then the self-`perspective` projection.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Transform3d {
    /// Self-perspective focal distance in logical pixels (CSS
    /// `transform: perspective(d)`), the vanishing point at `origin`. Unset →
    /// orthographic (rotations foreshorten but nothing diverges with depth).
    pub perspective: Option<Animatable<f32>>,
    /// Translation along x in logical pixels.
    pub translate_x: Option<Animatable<f32>>,
    /// Translation along y in logical pixels.
    pub translate_y: Option<Animatable<f32>>,
    /// Translation along z in logical pixels. Positive is toward the viewer —
    /// visible only with `perspective`.
    pub translate_z: Option<Animatable<f32>>,
    /// Rotation about the x axis (number = degrees, or `"1.5rad"`).
    pub rotate_x: Option<Animatable<Angle>>,
    /// Rotation about the y axis (number = degrees, or `"1.5rad"`).
    pub rotate_y: Option<Animatable<Angle>>,
    /// Rotation about the z axis (number = degrees, or `"1.5rad"`).
    pub rotate_z: Option<Animatable<Angle>>,
    /// Uniform scale (x and y), unless overridden by `scale_x`/`scale_y`.
    pub scale: Option<Animatable<f32>>,
    pub scale_x: Option<Animatable<f32>>,
    pub scale_y: Option<Animatable<f32>>,
    /// Pivot for rotation/scale and the perspective vanishing point, relative
    /// to the node's border box. Defaults to the center (`50%`/`50%`).
    pub origin: Option<Transform3dOrigin>,
}

impl Transform3d {
    /// Whether every channel is at identity (an empty `{}` or explicit identity
    /// values). Promotion is presence-based and ignores this; the render and
    /// picking paths use it to skip transform work entirely.
    pub fn is_identity(&self) -> bool {
        let Self {
            perspective,
            translate_x,
            translate_y,
            translate_z,
            rotate_x,
            rotate_y,
            rotate_z,
            scale,
            scale_x,
            scale_y,
            origin: _, // the pivot of an identity transform is irrelevant
        } = self;
        // An animated channel is never identity: the binding drives it to
        // arbitrary values each frame (`static_val()` is `None`, so the
        // `unwrap_or(identity)` shortcut would wrongly report identity).
        let no_binding = |f: &Option<Animatable<f32>>| f.binding().is_none();
        let no_angle_binding = |f: &Option<Animatable<Angle>>| f.binding().is_none();
        perspective.is_none()
            && [
                translate_x,
                translate_y,
                translate_z,
                scale,
                scale_x,
                scale_y,
            ]
            .iter()
            .all(|f| no_binding(f))
            && [rotate_x, rotate_y, rotate_z]
                .iter()
                .all(|f| no_angle_binding(f))
            && translate_x.static_val().unwrap_or(0.0) == 0.0
            && translate_y.static_val().unwrap_or(0.0) == 0.0
            && translate_z.static_val().unwrap_or(0.0) == 0.0
            && rotate_x.static_val().unwrap_or_default().radians() == 0.0
            && rotate_y.static_val().unwrap_or_default().radians() == 0.0
            && rotate_z.static_val().unwrap_or_default().radians() == 0.0
            && scale.static_val().unwrap_or(1.0) == 1.0
            && scale_x.static_val().unwrap_or(1.0) == 1.0
            && scale_y.static_val().unwrap_or(1.0) == 1.0
    }
}

/// The `transform3d` pivot: a per-axis [`Length`] resolved against the node's
/// border box (`"50%"` = center, a number = logical pixels from the top-left).
#[derive(Debug, Clone, PartialEq, Deserialize)]
pub struct Transform3dOrigin {
    pub x: Animatable<Length>,
    pub y: Animatable<Length>,
}

impl Default for Transform3dOrigin {
    fn default() -> Self {
        Self {
            x: Animatable::Static(Length::Percent(50.0)),
            y: Animatable::Static(Length::Percent(50.0)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::props::{Props, props_from_json as props};
    use crate::protocol::style::{Style, style_groups};

    /// A style carries `transform`/`opacity`/`transition` over the wire (transform
    /// as a nested object, transition's `transform` entry resolving to a timing).
    #[test]
    fn deserializes_transform_opacity_and_transition() {
        let s: Style = serde_json::from_str(
            r#"{
                "transform": { "scale": 0.95, "translateX": 4, "translateY": "50%" },
                "opacity": 0.5,
                "transition": { "transform": { "duration": 0.15, "easing": "easeOut" } }
            }"#,
        )
        .expect("style decodes");
        let t = s.transform.expect("transform present");
        assert_eq!(t.scale.static_val(), Some(0.95));
        // A bare number is logical pixels; a unit string carries an explicit unit.
        assert_eq!(t.translate_x.static_val(), Some(Length::Px(4.0)));
        assert_eq!(t.translate_y.static_val(), Some(Length::Percent(50.0)));
        assert_eq!(t.scale_x, None);
        assert_eq!(s.opacity.static_val(), Some(0.5));
        let transition = s.transition.expect("transition present");
        assert!(transition.for_transform().is_some());
        assert!(transition.for_opacity().is_none());
    }

    /// `transform3d` decodes its full field set (degrees and rad-string angles,
    /// percent-or-px origin), a malformed angle falls back to identity, an
    /// empty object is identity, and a wire delta dirties
    /// `TRANSFORM3D | LAYER | TRANSITION`.
    #[test]
    fn deserializes_transform3d() {
        let s: Style = serde_json::from_str(
            r#"{
                "transform3d": {
                    "perspective": 800,
                    "translateZ": -20,
                    "rotateY": 45,
                    "rotateX": "1.5rad",
                    "rotateZ": "not-an-angle",
                    "scale": 1.25,
                    "origin": { "x": "50%", "y": 10 }
                }
            }"#,
        )
        .expect("style decodes");
        let t = s.transform3d.clone().expect("transform3d present");
        assert_eq!(t.perspective.static_val(), Some(800.0));
        assert_eq!(t.translate_z.static_val(), Some(-20.0));
        assert_eq!(
            t.rotate_y.static_val().unwrap().radians(),
            45f32.to_radians()
        );
        assert_eq!(t.rotate_x.static_val().unwrap().radians(), 1.5);
        // Malformed angle → warn-and-identity, never a decode failure.
        assert_eq!(t.rotate_z.static_val().unwrap().radians(), 0.0);
        assert_eq!(t.scale.static_val(), Some(1.25));
        let origin = t.origin.clone().expect("origin present");
        assert_eq!(origin.x.value(), Some(&Length::Percent(50.0)));
        assert_eq!(origin.y.value(), Some(&Length::Px(10.0)));
        assert!(!t.is_identity());

        let s: Style = serde_json::from_str(r#"{ "transform3d": {} }"#).expect("style decodes");
        assert!(s.transform3d.expect("present").is_identity());

        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "style": { "transform3d": { "rotateY": 45 } } })),
            &[],
            &[],
        );
        assert!(dirty.style.intersects(style_groups::TRANSFORM3D));
        assert!(dirty.style.intersects(style_groups::LAYER));
        assert!(dirty.style.intersects(style_groups::TRANSITION));
    }
}
