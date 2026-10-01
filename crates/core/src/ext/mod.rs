//! The extension contract: the components, sets, and registries a feature
//! crate (a `bevy_react_*` element or prop provider) compiles against.
//!
//! Everything a feature needs from the bridge lives here, under one module,
//! so the supported surface is nameable: a feature crate uses `ext::*` plus
//! the public engine primitives (`transition::{Channel, ChannelTransition,
//! Easing}`, `layer::LayerContentDirt`, `animations::SharedValues`), the
//! [`raster`](crate::raster) helpers, and the style registry
//! ([`crate::style`]: `StyleProperty` statics registered with
//! `add_react_style(s)`, `Writer`s with `add_react_style_writer(s)`, and the
//! auto-stamped `StyleValue<T>` component) — never the reconciler's
//! internals.
//!
//! The contract components are the entity-keyed form of facts the bridge
//! used to keep in per-node side tables or under a feature's own type name.
//! A core system reads them without knowing which crate wrote them:
//!
//! - [`ElementFlags`] — what kind of element an entity is, as far as the
//!   core cares (styleless, owns its `ImageNode`, never layer-promoted).
//!   Stamped once at spawn for every kind, built-ins included.
//! - [`EventLocalPos`] — an element-defined coordinate for pointer events,
//!   overriding the node-relative position the collectors would report.
//! - [`LiveTexture`] — the entity's `ImageNode` texture is owned and
//!   rewritten by a feature system (a CPU raster, a render target), so the
//!   image-rendering module must never copy or mutate it.
//!
//! And one resource: [`VirtualPointers`] — the picking pointers a feature
//! drives over UI the window cursor cannot reach, whose events the core turns
//! into the common UI events.

use bevy::prelude::*;

/// The text model an element takes part in.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash)]
pub enum TextRole {
    /// Not a text element: the text writers skip it.
    #[default]
    None,
    /// A text block root (`<text>`): carries the `Text`, and its bare-string
    /// children inherit its resolved style.
    Block,
    /// A styled span inside a block (a nested `<text>`): `Node`-less, its
    /// own style (never inherited).
    Span,
    /// A text input (`<editableText>`): the text writers keep its color and
    /// font (and caret); its layout comes from its own attributes.
    Input,
}

/// What kind of element an entity is, as far as the core's shared systems
/// care. Declared on the [`Element`](crate::element::Element) and stamped at
/// spawn for every kind, never changed afterwards — the facts are fixed by
/// the element kind. A system queries `&ElementFlags`; the op-apply path
/// (where commands are still deferred) reads the same bits off the node's
/// registered element.
#[derive(Component, Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct ElementFlags {
    /// The entity carries no `Node`: no style, no layout box (a `<text>`
    /// span, an SVG shape child). The update path skips styling, background
    /// images, and every other box stamp for it.
    pub node_less: bool,
    /// The entity's `ImageNode` belongs to the element itself (`image`,
    /// `canvas`, `portal`, `svg`): the `backgroundImage` style must never
    /// touch it, and on removal ownership: a present `ImageNode` on any
    /// OTHER element was inserted by `backgroundImage` and is safe to remove.
    pub owns_image: bool,
    /// Never promoted to a composited layer: node-less entities (no box to
    /// capture — their pixels belong to the enclosing block/root) and
    /// detached nodes (their own render paths).
    pub layer_ineligible: bool,
    /// The core never attaches the entity in the Bevy hierarchy: it records
    /// the React parent (so removing an ancestor despawns it) and leaves the
    /// Bevy parent to the element — none for a detached UI root (`<surface>`,
    /// `<root>`), a feature-owned layer for an `<anchor>`.
    pub detached: bool,
    /// The text model the element takes part in.
    pub text: TextRole,
    /// Never a picking target itself (`Pickable::IGNORE`) — a window-filling
    /// overlay root whose children are the pickable nodes.
    pub pick_ignore: bool,
}

impl ElementFlags {
    /// A plain styled node: the default.
    pub const NODE: Self = Self {
        node_less: false,
        owns_image: false,
        layer_ineligible: false,
        detached: false,
        text: TextRole::None,
        pick_ignore: false,
    };
    /// A styled node whose `ImageNode` is element-owned.
    pub const OWNS_IMAGE: Self = Self {
        owns_image: true,
        ..Self::NODE
    };
    /// A `Node`-less child (span, shape): styleless and never a layer.
    pub const NODE_LESS: Self = Self {
        node_less: true,
        layer_ineligible: true,
        ..Self::NODE
    };
    /// A detached UI root (`<surface>`, `<root>`): styled, never a layer,
    /// never attached under its React parent.
    pub const DETACHED_ROOT: Self = Self {
        layer_ineligible: true,
        detached: true,
        ..Self::NODE
    };
}

/// An element-defined coordinate for pointer events on this entity: while
/// `Some`, the hover/pointer collectors report it as the event's `x`/`y`
/// instead of the node-relative position. Written per frame by the feature
/// that owns the element's coordinate space (an SVG shape reports its root's
/// user space); `None` while the pointer is not over the element.
///
/// The position lives in an interior `Option` (rather than the component
/// being inserted/removed per hover flip) so a hover boundary never causes
/// archetype churn. Stamped alongside the element's pointer-handler
/// components and removed with them.
#[derive(Component, Debug, Default, Clone, Copy, PartialEq)]
pub struct EventLocalPos(pub Option<Vec2>);

/// Marks an entity whose `ImageNode` texture is **live**: owned and rewritten
/// by a feature system (an element-owned CPU raster like `<canvas>` or an
/// `<svg>`, a `<portal>` render target, a `backgroundImage: { texture }`
/// binding). Read by the image-rendering module, which must never derive a
/// sampler variant from such a texture (a copy would freeze; an in-place
/// sampler write would re-upload the CPU buffer over the GPU target) and
/// refuses every explicit `imageRendering` mode there with a warning.
///
/// Inserted wherever a feature binds a live texture to the entity's
/// `ImageNode`, and removed in the same place the binding is dropped (Bevy
/// does not remove required components with their requirer, so removal is
/// always explicit).
#[derive(Component, Debug, Default, Clone, Copy)]
pub struct LiveTexture;

/// The picking pointers a feature drives over UI the window cursor cannot
/// reach (a `<surface>`'s texture-space subtree, driven from an in-world
/// ray-cast): their `Pointer<…>` picking events are the core's to turn into
/// the common UI events (`click`, `onPointer*`, hover styling) — the
/// main-window collectors skip them — and their hover map feeds the OS
/// cursor. A feature registers its pointer once, when it spawns it.
#[derive(Resource, Debug, Default, Clone)]
pub struct VirtualPointers(Vec<bevy::picking::pointer::PointerId>);

impl VirtualPointers {
    /// Route `id`'s picking events through the virtual-pointer collectors.
    pub fn register(&mut self, id: bevy::picking::pointer::PointerId) {
        if !self.0.contains(&id) {
            self.0.push(id);
        }
    }

    /// Whether `id` is a registered virtual pointer.
    pub fn contains(&self, id: bevy::picking::pointer::PointerId) -> bool {
        self.0.contains(&id)
    }

    /// Whether no virtual pointer is registered.
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    /// Every registered virtual pointer, in registration order.
    pub fn iter(&self) -> impl Iterator<Item = bevy::picking::pointer::PointerId> + '_ {
        self.0.iter().copied()
    }
}

/// A virtual pointer's mouse-button bookkeeping: forwards the window's
/// left/right/middle buttons — the set bevy_picking itself forwards for the
/// window pointer — as presses/releases at the pointer's location, and owes a
/// release for every press it sent, so a pointer that leaves never leaves a
/// control stuck pressed.
#[derive(Debug, Default)]
pub struct VirtualButtons {
    pressed: [bool; 3],
}

impl VirtualButtons {
    const FORWARDED: [(MouseButton, bevy::picking::pointer::PointerButton); 3] = [
        (
            MouseButton::Left,
            bevy::picking::pointer::PointerButton::Primary,
        ),
        (
            MouseButton::Right,
            bevy::picking::pointer::PointerButton::Secondary,
        ),
        (
            MouseButton::Middle,
            bevy::picking::pointer::PointerButton::Middle,
        ),
    ];

    /// Forward this frame's presses and owed releases at `location`.
    pub fn forward(
        &mut self,
        id: bevy::picking::pointer::PointerId,
        location: &bevy::picking::pointer::Location,
        buttons: &ButtonInput<MouseButton>,
        input: &mut MessageWriter<bevy::picking::pointer::PointerInput>,
    ) {
        use bevy::picking::pointer::{PointerAction, PointerInput};
        for (i, (mouse, button)) in Self::FORWARDED.into_iter().enumerate() {
            if buttons.just_pressed(mouse) {
                input.write(PointerInput::new(
                    id,
                    location.clone(),
                    PointerAction::Press(button),
                ));
                self.pressed[i] = true;
            }
            if buttons.just_released(mouse) && std::mem::take(&mut self.pressed[i]) {
                input.write(PointerInput::new(
                    id,
                    location.clone(),
                    PointerAction::Release(button),
                ));
            }
        }
    }

    /// The pointer left every target: release every owed press at
    /// `location` (off-bounds) and move there, so picking fires `Out`.
    pub fn leave(
        &mut self,
        id: bevy::picking::pointer::PointerId,
        location: bevy::picking::pointer::Location,
        input: &mut MessageWriter<bevy::picking::pointer::PointerInput>,
    ) {
        use bevy::picking::pointer::{PointerAction, PointerInput};
        for (i, (_, button)) in Self::FORWARDED.into_iter().enumerate() {
            if std::mem::take(&mut self.pressed[i]) {
                input.write(PointerInput::new(
                    id,
                    location.clone(),
                    PointerAction::Release(button),
                ));
            }
        }
        input.write(PointerInput::new(
            id,
            location,
            PointerAction::Move { delta: Vec2::ZERO },
        ));
    }
}

/// This frame's value of one evaluated binding. The binding decides the
/// kind: `interpolateColor` evaluates to a [`Color`](Self::Color), a bare
/// shared value or an `interpolate` to a [`Scalar`](Self::Scalar).
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum DrivenValue {
    /// A number, in the binding's wire units.
    Scalar(f32),
    /// An sRGB color, rgba channels in `0.0..=1.0`.
    Color([f32; 4]),
}

/// One evaluated `{ animated }` binding of a feature-owned value: the
/// prop key it lives under (`domain`), the field (`name`), and this frame's
/// driven value.
#[derive(Debug, Clone, PartialEq)]
pub struct DrivenExt {
    pub domain: &'static str,
    pub name: String,
    pub value: DrivenValue,
}

/// The animation engine's publish slot for feature-owned bindings
/// ([`AnimatableProperty::Ext`](crate::animations::AnimatableProperty::Ext)):
/// every frame the shared values move, the engine evaluates each `Ext`
/// binding and compare-writes the results here (one entry per binding it
/// could evaluate — a missing shared value publishes nothing). The feature
/// that owns the domain consumes them in its own system, ordered after
/// [`AnimationSet::Apply`](crate::animations::AnimationSet::Apply), and
/// writes them wherever they land (an SVG shape's attr seed slots, a mesh's
/// material color). Stamped alongside the entity's `AnimatedNode` exactly
/// when it carries an `Ext` binding; the feature never writes it.
#[derive(Component, Debug, Default, Clone, PartialEq)]
pub struct DrivenExtValues(pub Vec<DrivenExt>);

impl DrivenExtValues {
    /// This frame's driven value of `domain.name`, if the engine could
    /// evaluate its binding.
    pub fn value(&self, domain: &str, name: &str) -> Option<DrivenValue> {
        self.0
            .iter()
            .find(|d| d.domain == domain && d.name == name)
            .map(|d| d.value)
    }

    /// This frame's driven scalar of `domain.name` — `None` when unbound,
    /// unevaluated, or bound to a color.
    pub fn get(&self, domain: &str, name: &str) -> Option<f32> {
        match self.value(domain, name)? {
            DrivenValue::Scalar(v) => Some(v),
            DrivenValue::Color(_) => None,
        }
    }

    /// This frame's driven color of `domain.name` — `None` when unbound,
    /// unevaluated, or bound to a scalar.
    pub fn get_color(&self, domain: &str, name: &str) -> Option<Srgba> {
        match self.value(domain, name)? {
            DrivenValue::Color([r, g, b, a]) => Some(Srgba::new(r, g, b, a)),
            DrivenValue::Scalar(_) => None,
        }
    }
}

/// The ordering slots a feature's systems hang off. Every set is configured
/// by `ReactUiPlugin` against the core systems that bracket it, so a feature
/// orders `.in_set(…)` and never names a core function.
///
/// - [`PickRefineSet`] (`PreUpdate`): rewrite this frame's `PointerHits`
///   (refine a node hit into a sub-element hit). After the picking backends,
///   the clip filter, and the transformed-layer suppression; before the hover
///   map is built.
/// - [`InteractionSyncSet`] (`Update`): synthesize `Interaction` /
///   `RelativeCursorPosition` / [`EventLocalPos`] for elements
///   `ui_focus_system` cannot see. After the transformed-layer correction;
///   before interaction styling and the hover/pointer event collectors.
/// - [`ElementRasterSet`] (`Update`): repaint an element-owned texture from
///   this frame's final state. After the op drain, the animation appliers,
///   and the transition drive, so a driven or eased value paints the same
///   frame.
/// - [`ElementOverrideSet`] (`Update`): an element system that overrides
///   this frame's driven values (an `<anchor>`'s projected translation). After
///   the op drain, the animation appliers, and the transition drive.
/// - [`MeasureStampSet`] (`PostUpdate`): re-stamp an intrinsic
///   `ContentSize` measure after `bevy_ui`'s content-size pass clears it,
///   before layout.
#[derive(SystemSet, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct PickRefineSet;
/// See [`PickRefineSet`].
#[derive(SystemSet, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct InteractionSyncSet;
/// See [`PickRefineSet`].
#[derive(SystemSet, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ElementRasterSet;
/// See [`PickRefineSet`].
#[derive(SystemSet, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct ElementOverrideSet;
/// See [`PickRefineSet`].
#[derive(SystemSet, Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct MeasureStampSet;

mod registry;

#[cfg(test)]
pub(crate) use registry::install_builtin_registry;
pub(crate) use registry::warn_feature_missing_kind;
pub use registry::{
    ExtRegistry, ExtRegistrySlot, FeatureHint, KNOWN_FEATURES, builtin_registry, core_registry,
    feature_hint, set_thread_registry, with_thread_registry,
};
