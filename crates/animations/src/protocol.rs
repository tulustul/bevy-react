//! Wire types for the animation bridge — the Reanimated-style surface a React app
//! declares once and the Bevy side drives every frame.
//!
//! These are **bevy-free** and `Deserialize`-only: they travel JS → Bevy through
//! the `op_animate` op (the main crate registers it), exactly like `protocol::Op`
//! travels through `op_flush`. The JS side (`js/src/animated.ts`) hand-writes
//! matching JSON shapes — keep the two in sync, just like `bridge.ts` ↔ `Op`.

use serde::Deserialize;

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
    /// Start a driver; it animates from the value's live reading.
    Animate { id: SharedId, driver: Driver },
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

/// The per-node `animatedStyle`: which style properties are animation-driven and
/// by what. Mirrors `BevyStyle`'s shape (named optional fields) so it decodes the
/// same opaque-object way `Style` does. Transforms map to `UiTransform`; `opacity`
/// drives color alpha; `background_color` drives `BackgroundColor`.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnimatedBindings {
    pub translate_x: Option<Binding>,
    pub translate_y: Option<Binding>,
    /// Uniform scale (applied to both axes unless `scale_x`/`scale_y` override).
    pub scale: Option<Binding>,
    pub scale_x: Option<Binding>,
    pub scale_y: Option<Binding>,
    /// Clockwise rotation in radians.
    pub rotate: Option<Binding>,
    pub opacity: Option<Binding>,
    pub background_color: Option<Binding>,
}

impl AnimatedBindings {
    /// Whether any transform channel is bound (so the orchestrator only writes
    /// `UiTransform` when something actually drives it).
    pub fn has_transform(&self) -> bool {
        self.translate_x.is_some()
            || self.translate_y.is_some()
            || self.scale.is_some()
            || self.scale_x.is_some()
            || self.scale_y.is_some()
            || self.rotate.is_some()
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
