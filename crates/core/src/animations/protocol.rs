//! Wire types for the animation bridge — the Reanimated-style surface a React app
//! declares once and the Bevy side drives every frame.
//!
//! These are **bevy-free** and `Deserialize`-only: they travel JS → Bevy through
//! the `op_animate` op (the main crate registers it), exactly like `protocol::Op`
//! travels through `op_flush`. The JS side (`js/src/animated.ts`) hand-writes
//! matching JSON shapes — keep the two in sync, just like `bridge.ts` ↔ `Op`.

use std::collections::BTreeMap;

use serde::Deserialize;

/// Identity of a shared value (Reanimated's `useSharedValue`). Allocated on the
/// JS side; lives in the [`crate::animations::SharedValues`] table on the Bevy side. Its own
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
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Easing {
    #[default]
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut,
}

/// An imperative animation command, carried by `op_animate`. Drains into the
/// [`crate::animations::SharedValues`] table each frame.
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
#[derive(Debug, Clone, PartialEq, Deserialize)]
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
/// property is a new variant here plus a row in the apply table (`crate::animations`),
/// not a new named field on a fixed struct. Derived from the merged style's
/// inline `{ animated }` wrappers (`crate::style_bindings`), which is also
/// where each variant's style position is defined.
///
/// Not `Copy` ([`Self::FilterParam`] carries the param name); the fieldless
/// variants are still constructed freely at call sites.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum AnimatableProperty {
    /// Post-layout x translation, in px (drives `UiTransform`).
    TranslateX,
    /// Post-layout y translation, in px (drives `UiTransform`).
    TranslateY,
    /// Uniform scale (both axes unless `ScaleX`/`ScaleY` override).
    Scale,
    ScaleX,
    ScaleY,
    /// Clockwise rotation, **degrees** on the wire (matching the declarative
    /// `transform.rotate` field it lives in and the `transform3d` rotations);
    /// applied as radians.
    Rotate,
    /// Multiplies color alpha across background/text/image.
    Opacity,
    /// Drives `BackgroundColor`.
    BackgroundColor,
    /// Drives `BorderColor` (all four sides uniformly).
    BorderColor,
    /// Drives `TextColor` (a `<text>` node's color).
    Color,
    /// Drives the `ImageNode.color` of a `backgroundImage`-styled node (the
    /// spec's `tint`). Inert when no `ImageNode` is present.
    BackgroundImageTint,

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
    /// Drives `Node.border_radius` — all four corners uniformly, in px (the
    /// `borderColor` precedent: one binding on the whole field, no per-corner
    /// wrappers). A `Node` write like the lengths above (relayout on change),
    /// but it never moves the node's rect.
    BorderRadius,

    /// One named parameter of the node's resolved `filter` chain — the wire
    /// key is `filter[<index>].<param>` (e.g. `filter[0].radius`). `index`
    /// addresses the **wire** chain entry, so a binding writes the named slot
    /// in *every* resolved pass carrying that
    /// [`wire_index`](crate::filters::ResolvedFilterPass::wire_index) (blur's
    /// H+V passes both carry `radius`). `name` is a
    /// [`ParamSlot`](crate::filters::ParamSlot) name in the pass layout.
    ///
    /// The bound value is applied in the **same unit as the param's wire
    /// form**: logical px for `Length` slots (scale-rewritten to physical px
    /// like the resolver), **degrees** for `Angle` slots (converted to the
    /// packed radians), raw for single-component `Scalar` slots; `Color`
    /// slots take an `interpolateColor` binding. Index/name/kind are
    /// validated against the resolved chain at bind time (`filterBinding`
    /// devtools warnings); an unmatched binding stays inert.
    FilterParam {
        index: u8,
        name: String,
    },

    /// One named parameter of the node's resolved `backdropFilter` chain —
    /// the wire key is `backdropFilter[<index>].<param>`. Identical
    /// addressing, units, and bind-time validation as
    /// [`Self::FilterParam`] (warn kind `backdropFilterBinding`), against
    /// the backdrop chain instead of the content one.
    BackdropParam {
        index: u8,
        name: String,
    },

    /// One named parameter of the node's resolved `morphFilter` — the wire
    /// key is `morphFilter.<param>` (a morph is a single filter use, no
    /// index). Identical units and bind-time validation as
    /// [`Self::FilterParam`] (warn kind `morphFilterBinding`), against the
    /// resolved morph chain. Unlike the filter/backdrop params it parks NO
    /// transition channel: the morph channel eases the engine-owned
    /// *progress*, never the params, so the two writers cannot collide.
    MorphParam {
        name: String,
    },

    /// One animatable leaf of a `backgroundGradient` entry — the dynamic
    /// gradient domain (like [`Self::FilterParam`]: derived from `{ animated }`
    /// wrappers, no property-table row). `index` addresses the gradient in the
    /// (possibly single-entry) list. Values arrive in wire units: DEGREES for
    /// [`GradientLeaf::Angle`] (linear angle / conic start), logical px for
    /// positions and shape radii, raw `0..1` for hints, rgba via
    /// `interpolateColor` for stop colors. Any gradient binding parks that
    /// surface's whole transition channel (coarse — the channel eases a
    /// complete list).
    BackgroundGradientParam {
        index: u8,
        leaf: GradientLeaf,
    },
    /// The `borderGradient` twin of [`Self::BackgroundGradientParam`].
    BorderGradientParam {
        index: u8,
        leaf: GradientLeaf,
    },

    /// One numeric attribute of an SVG shape entity (`<circle>`/`<rect>`/…),
    /// addressed by its **wire** name — the camelCase key in the folded
    /// `shape` object (`"cx"`, `"r"`, `"strokeWidth"`, …; the full set is
    /// `crate::svg::NUMERIC_ATTRS`). Derived from `{ animated }` wrappers on
    /// the shape's numeric attrs
    /// (`crate::style_bindings::derive_shape_bindings`); the apply stage
    /// drives the entity's `SvgShape.attrs` field of that name per frame.
    /// Bound values are in **wire units**: SVG user-space units for geometry
    /// and `strokeWidth` (the viewBox maps them onto the layout box at
    /// raster), `0..1` for `opacity`.
    ShapeAttr {
        name: String,
    },

    /// One field of the node's `transform3d` style — the wire key is
    /// `transform3d.<field>` (e.g. `transform3d.rotateY`). Drives the
    /// composite-time 3D transform of a promoted layer
    /// ([`crate::layer::transform3d`]); unbound fields keep the static style
    /// value. Values arrive in the **declarative field's wire units**: logical
    /// px for translations/perspective/origin, **degrees** for rotations
    /// (like the 2D [`Rotate`](Self::Rotate) and every other rotation in the
    /// system), raw scalars for scales.
    Transform3d(Transform3dField),
}

/// The addressable fields of [`AnimatableProperty::Transform3d`]. Origin
/// animates as two px offsets (`originX`/`originY`) — a percent origin that
/// must track the node's size belongs in the static style instead.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Transform3dField {
    Perspective,
    TranslateX,
    TranslateY,
    TranslateZ,
    RotateX,
    RotateY,
    RotateZ,
    Scale,
    ScaleX,
    ScaleY,
    OriginX,
    OriginY,
}

/// The addressable leaves of one gradient entry. Stop leaves carry the stop
/// index. `Angle` is the linear `angle` OR the conic `start` (a gradient has
/// at most one); a conic stop's `angle` reuses `StopPosition` (it IS the
/// stop's position, angular); `ShapeX`/`ShapeY` are the radial `circle`
/// (X only) / `ellipse` radii.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum GradientLeaf {
    Angle,
    StopColor(u8),
    StopPosition(u8),
    StopHint(u8),
    ShapeX,
    ShapeY,
}

impl AnimatableProperty {
    /// The kind of value this property animates — picks scalar-vs-color resolution
    /// in the apply layer. `Rotate` is an `Angle`: the bound value is degrees
    /// on the wire, resolved as a scalar and converted by the applier.
    ///
    /// Static rows generate from the property table
    /// (`crate::animations::props`); the dynamic domains keep explicit arms.
    #[allow(unused_parens)]
    pub fn value_kind(&self) -> ValueKind {
        use AnimatableProperty as P;
        use Transform3dField as F;
        macro_rules! kind_arms {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                match self {
                    $($prop => ValueKind::$kind,)*
                    // Never consulted for the chain params — the applier reads the
                    // authoritative kind from the resolved chain's `ParamSlot`
                    // layout (`crate::filters`). A documented fallback, not a
                    // semantic: the slot decides scalar-vs-color, not this arm.
                    Self::FilterParam { .. }
                    | Self::BackdropParam { .. }
                    | Self::MorphParam { .. } => ValueKind::Scalar,
                    // Same documented fallback as the chain params above — the
                    // gradient applier reads each leaf's own kind (color slot,
                    // px length, degrees, raw hint) from the [`GradientLeaf`],
                    // not this arm.
                    Self::BackgroundGradientParam { .. }
                    | Self::BorderGradientParam { .. } => ValueKind::Scalar,
                    // Genuinely scalar (unlike the chain params' documented fallback
                    // above): shape attrs are raw user-space numbers — no logical→
                    // physical px rewrite applies (the viewBox scales them at
                    // raster), so `Length` semantics would be wrong here.
                    Self::ShapeAttr { .. } => ValueKind::Scalar,
                }
            };
        }
        crate::animations::props::with_animatable_props!(kind_arms)
    }

    /// Whether this property feeds the `UiTransform` (built from all transform
    /// channels together), so the apply layer can rebuild the transform once.
    /// The channel set is the table's `Transform` stage (`crate::animations::props`).
    pub fn is_transform(&self) -> bool {
        self.stage() == crate::animations::props::PropStage::Transform
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

/// A node's animation-driven style properties and what drives each: an open
/// property→[`Binding`] map. Not a wire type — it is **derived** from the
/// merged style's inline `{ animated }` wrappers by
/// `crate::style_bindings::derive_bindings` after every style change, and
/// stamped on the entity as `AnimatedNode`. A `BTreeMap` keeps iteration
/// deterministic (stable transform-group rebuild and test assertions).
#[derive(Debug, Clone, Default, PartialEq)]
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

    /// Whether any binding belongs to the given apply stage — the one
    /// predicate behind every `has_*` gate (stages come from the property
    /// table, `crate::animations::props`).
    fn has_stage(&self, stage: crate::animations::props::PropStage) -> bool {
        self.0.keys().any(|p| p.stage() == stage)
    }

    /// Whether any transform channel is bound (so the orchestrator only writes
    /// `UiTransform` when something actually drives it).
    pub fn has_transform(&self) -> bool {
        self.has_stage(crate::animations::props::PropStage::Transform)
    }

    /// Whether any `Node` layout-field binding (width/height/left/top/…) is
    /// bound — in the transition engine the layout channel treats such a
    /// node as owning its own rect and adopts each frame instead of chasing.
    pub fn has_node_props(&self) -> bool {
        // `BorderRadius` is `Node`-staged (it writes `Node`) but never moves
        // the rect — a bound radius must not make the layout channel adopt.
        self.0.keys().any(|p| {
            p.stage() == crate::animations::props::PropStage::Node
                && *p != AnimatableProperty::BorderRadius
        })
    }

    /// Whether any per-param filter binding ([`AnimatableProperty::FilterParam`])
    /// is bound — gates the applier's filter stage and, in the transition
    /// engine, `skip_filter` (any filter binding parks the *whole* whole-value
    /// filter channel).
    pub fn has_filter_params(&self) -> bool {
        self.has_stage(crate::animations::props::PropStage::Filter)
    }

    /// The backdrop analog of [`Self::has_filter_params`] — gates the
    /// applier's backdrop stage and the transition engine's `skip_backdrop`.
    pub fn has_backdrop_params(&self) -> bool {
        self.has_stage(crate::animations::props::PropStage::Backdrop)
    }

    /// The morph analog of [`Self::has_filter_params`] — gates the applier's
    /// morph stage only (morph param bindings park no transition channel:
    /// the morph channel owns progress, not params).
    pub fn has_morph_params(&self) -> bool {
        self.has_stage(crate::animations::props::PropStage::Morph)
    }

    /// Whether any gradient-leaf binding is bound — gates the applier's
    /// gradient stage (the per-surface transition parks ride `park()`).
    pub fn has_gradient_params(&self) -> bool {
        self.has_stage(crate::animations::props::PropStage::Gradient)
    }

    /// Whether any SVG shape-attr binding ([`AnimatableProperty::ShapeAttr`])
    /// is bound — gates the applier's shape stage and, in the transition
    /// engine, the shape channel's coarse skip (any attr binding parks the
    /// whole shape group).
    pub fn has_shape_attrs(&self) -> bool {
        self.has_stage(crate::animations::props::PropStage::Shape)
    }

    /// Whether any `transform3d.<field>` binding is bound — gates the
    /// applier's transform3d stage and, in the transition engine,
    /// `skip_transform3d` (any binding parks the whole channel group: the
    /// stage rebuilds the full params struct).
    pub fn has_transform3d(&self) -> bool {
        self.has_stage(crate::animations::props::PropStage::Transform3d)
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
