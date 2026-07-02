//! Wire types for the animation bridge — the Reanimated-style surface a React app
//! declares once and the Bevy side drives every frame.
//!
//! These are **bevy-free** and `Deserialize`-only: they travel JS → Bevy through
//! the `op_animate` op (the main crate registers it), exactly like `protocol::Op`
//! travels through `op_flush`. The JS side (`js/src/animated.ts`) hand-writes
//! matching JSON shapes — keep the two in sync, just like `bridge.ts` ↔ `Op`.

use std::collections::BTreeMap;

use serde::Deserialize;
use serde::de::{self, Deserializer, MapAccess, Visitor};

/// Identity of a shared value (Reanimated's `useSharedValue`). Allocated on the
/// JS side; lives in the [`crate::SharedValues`] table on the Bevy side. Its own
/// namespace, unrelated to reconciler node ids.
pub type SharedId = u32;

/// How a shared value should evolve over time — the thing assigned to
/// `sharedValue.value` (`withTiming`, `withSpring`, `withRepeat`, `withSequence`).
/// Drivers compose: `Repeat`/`Sequence` wrap other drivers.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Driver {
    /// Ease from the value's current reading to `to` over `duration` seconds.
    Timing {
        to: f32,
        #[serde(default = "default_duration")]
        duration: f32,
        #[serde(default)]
        easing: Easing,
    },
    /// A damped spring settling on `to`, integrated each frame.
    Spring {
        to: f32,
        #[serde(default = "default_stiffness")]
        stiffness: f32,
        #[serde(default = "default_damping")]
        damping: f32,
        #[serde(default = "default_mass")]
        mass: f32,
    },
    /// Repeat `animation` `count` times (`-1` = forever); `reverse` ping-pongs the
    /// endpoints (Timing/Spring templates) instead of restarting from the top.
    Repeat {
        animation: Box<Driver>,
        #[serde(default = "default_count")]
        count: i32,
        #[serde(default)]
        reverse: bool,
    },
    /// Run each step in order, each starting from the previous step's end value.
    Sequence { steps: Vec<Driver> },
    /// Hold the value's current reading for `delay` seconds, then run `animation`.
    Delay { delay: f32, animation: Box<Driver> },
}

/// Easing curve for [`Driver::Timing`]. Cubic in/out variants.
#[derive(Debug, Clone, Copy, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Easing {
    #[default]
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
}

/// An imperative animation command, carried by `op_animate`. Drains into the
/// [`crate::SharedValues`] table each frame.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum AnimationCommand {
    /// Register a shared value with its initial reading. Idempotent: a second
    /// `Declare` for an existing id keeps the current value (survives re-renders).
    Declare { id: SharedId, initial: f32 },
    /// Set a value immediately, cancelling any active driver.
    Set { id: SharedId, value: f32 },
    /// Start a driver; it animates from the value's live reading. `token`
    /// correlates a JS completion callback: when present, the engine reports the
    /// driver's settlement (finished or interrupted) back with this token; when
    /// absent nothing is reported (callback-free animations stay zero-overhead).
    Animate {
        id: SharedId,
        driver: Driver,
        #[serde(default)]
        token: Option<u64>,
    },
    /// Stop a value's active driver, freezing it where it is.
    Cancel { id: SharedId },
    /// Drop every shared value (sent on reconciler reset / hot reload).
    Clear,
}

/// Binds one animated style property to a shared value. Lives in the reconciler
/// `Props.animated` (see [`AnimatedBindings`]); evaluated each frame by the
/// orchestration system.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Binding {
    /// Use the shared value's current reading directly (numeric props).
    Shared { id: SharedId },
    /// Map the reading through a piecewise-linear curve (clamped to the ends).
    Interpolate {
        id: SharedId,
        input: Vec<f32>,
        output: Vec<f32>,
    },
    /// Map the reading to an rgba color (each component in `0.0..=1.0`). JS
    /// pre-parses hex, so this crate never parses colors.
    InterpolateColor {
        id: SharedId,
        input: Vec<f32>,
        output: Vec<[f32; 4]>,
    },
}

/// Identity of one continuous, animation-driveable style property. This is the
/// open set the generic apply layer dispatches on — adding a new animatable
/// property is a new variant here plus a row in the apply table (`crate::lib`),
/// not a new named field on a fixed struct. The wire key is camelCase (see
/// [`AnimatableProperty::from_wire`]); the JS side mirrors this set in
/// `js/src/animated.ts`'s `AnimatableProperty` union.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum AnimatableProperty {
    /// Post-layout x translation, in px (drives `UiTransform`).
    TranslateX,
    /// Post-layout y translation, in px (drives `UiTransform`).
    TranslateY,
    /// Uniform scale (both axes unless `ScaleX`/`ScaleY` override).
    Scale,
    ScaleX,
    ScaleY,
    /// Clockwise rotation in radians.
    Rotate,
    /// Multiplies color alpha across background/text/image.
    Opacity,
    /// Drives `BackgroundColor`.
    BackgroundColor,
    /// Drives `BorderColor` (all four sides uniformly).
    BorderColor,
    /// Drives `TextColor` (a `<text>` node's color).
    Color,

    // Layout lengths (px) — write `Node`, which re-triggers Bevy layout. The
    // applier writes the field only when it actually changes (no idle relayout).
    Width,
    Height,
    MinWidth,
    MinHeight,
    MaxWidth,
    MaxHeight,
    Left,
    Right,
    Top,
    Bottom,
    FlexBasis,
    /// Sets both row and column gap.
    Gap,
    RowGap,
    ColumnGap,

    // Layout scalars — also write `Node`. (`flexGrow`/`flexShrink` are deliberately
    // not here: they're relative weights, not magnitudes — animating them has no
    // intuitive visual meaning, unlike a size or `aspectRatio`.)
    AspectRatio,
}

impl AnimatableProperty {
    /// Wire (camelCase) key → property, or `None` for an unrecognised key. The
    /// deserializer skips unknown keys rather than failing, so a JS bundle newer
    /// than this binary degrades gracefully instead of dropping the whole node's
    /// `animatedStyle`.
    pub fn from_wire(key: &str) -> Option<Self> {
        Some(match key {
            "translateX" => Self::TranslateX,
            "translateY" => Self::TranslateY,
            "scale" => Self::Scale,
            "scaleX" => Self::ScaleX,
            "scaleY" => Self::ScaleY,
            "rotate" => Self::Rotate,
            "opacity" => Self::Opacity,
            "backgroundColor" => Self::BackgroundColor,
            "borderColor" => Self::BorderColor,
            "color" => Self::Color,
            "width" => Self::Width,
            "height" => Self::Height,
            "minWidth" => Self::MinWidth,
            "minHeight" => Self::MinHeight,
            "maxWidth" => Self::MaxWidth,
            "maxHeight" => Self::MaxHeight,
            "left" => Self::Left,
            "right" => Self::Right,
            "top" => Self::Top,
            "bottom" => Self::Bottom,
            "flexBasis" => Self::FlexBasis,
            "gap" => Self::Gap,
            "rowGap" => Self::RowGap,
            "columnGap" => Self::ColumnGap,
            "aspectRatio" => Self::AspectRatio,
            _ => return None,
        })
    }

    /// The kind of value this property animates — picks scalar-vs-color resolution
    /// in the apply layer. `Rotate` is an `Angle` but, imperatively, JS already
    /// sends radians, so the applier resolves it as a scalar.
    pub fn value_kind(self) -> ValueKind {
        match self {
            Self::TranslateX
            | Self::TranslateY
            | Self::Width
            | Self::Height
            | Self::MinWidth
            | Self::MinHeight
            | Self::MaxWidth
            | Self::MaxHeight
            | Self::Left
            | Self::Right
            | Self::Top
            | Self::Bottom
            | Self::FlexBasis
            | Self::Gap
            | Self::RowGap
            | Self::ColumnGap => ValueKind::Length,
            Self::Scale | Self::ScaleX | Self::ScaleY | Self::Opacity | Self::AspectRatio => {
                ValueKind::Scalar
            }
            Self::Rotate => ValueKind::Angle,
            Self::BackgroundColor | Self::BorderColor | Self::Color => ValueKind::Color,
        }
    }

    /// Whether this property feeds the `UiTransform` (built from all transform
    /// channels together), so the apply layer can rebuild the transform once.
    pub fn is_transform(self) -> bool {
        matches!(
            self,
            Self::TranslateX
                | Self::TranslateY
                | Self::Scale
                | Self::ScaleX
                | Self::ScaleY
                | Self::Rotate
        )
    }
}

/// How an animated value resolves and where it lands. Pure metadata shared by the
/// imperative apply layer and (for identity/precedence) the CSS-`transition`
/// engine in `core`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValueKind {
    /// A bare `f32` (scale, opacity, …).
    Scalar,
    /// A length in px (translate).
    Length,
    /// An rgba color.
    Color,
    /// An angle in radians.
    Angle,
}

/// The per-node `animatedStyle`: which style properties are animation-driven and
/// by what. An open property→[`Binding`] map (mirrors the JS object shape: every
/// camelCase style key maps to a binding). Decodes the same opaque-object way
/// `Style` does — unknown keys are skipped (warn-and-continue) so a newer JS
/// bundle never breaks an older binary's whole node. A `BTreeMap` keeps iteration
/// deterministic (stable transform-group rebuild and test assertions).
#[derive(Debug, Clone, Default)]
pub struct AnimatedBindings(pub BTreeMap<AnimatableProperty, Binding>);

impl AnimatedBindings {
    /// The binding for a property, if bound.
    pub fn get(&self, property: AnimatableProperty) -> Option<&Binding> {
        self.0.get(&property)
    }

    /// Whether a property is bound.
    pub fn contains(&self, property: AnimatableProperty) -> bool {
        self.0.contains_key(&property)
    }

    /// Whether any transform channel is bound (so the orchestrator only writes
    /// `UiTransform` when something actually drives it).
    pub fn has_transform(&self) -> bool {
        self.0.keys().any(|p| p.is_transform())
    }

    /// Iterate the bound (property, binding) pairs in property order.
    pub fn iter(&self) -> impl Iterator<Item = (&AnimatableProperty, &Binding)> {
        self.0.iter()
    }

    /// Whether nothing is bound.
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

impl<'de> Deserialize<'de> for AnimatedBindings {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct BindingsVisitor;

        impl<'de> Visitor<'de> for BindingsVisitor {
            type Value = AnimatedBindings;

            fn expecting(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
                f.write_str("a map of animatable style properties to bindings")
            }

            fn visit_map<M>(self, mut map: M) -> Result<Self::Value, M::Error>
            where
                M: MapAccess<'de>,
            {
                let mut out = BTreeMap::new();
                while let Some(key) = map.next_key::<String>()? {
                    match AnimatableProperty::from_wire(&key) {
                        Some(property) => {
                            out.insert(property, map.next_value::<Binding>()?);
                        }
                        None => {
                            // Consume the value so deserialization stays in sync,
                            // then skip: forward-compat with a newer JS surface.
                            map.next_value::<de::IgnoredAny>()?;
                            tracing::warn!(
                                target: "bevy_react",
                                "animatedStyle: ignoring unknown property {key:?}"
                            );
                        }
                    }
                }
                Ok(AnimatedBindings(out))
            }
        }

        deserializer.deserialize_map(BindingsVisitor)
    }
}

fn default_duration() -> f32 {
    0.3
}
fn default_stiffness() -> f32 {
    100.0
}
fn default_damping() -> f32 {
    10.0
}
fn default_mass() -> f32 {
    1.0
}
fn default_count() -> i32 {
    1
}
