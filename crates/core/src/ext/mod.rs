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

use bevy::prelude::*;

/// What kind of element an entity is, as far as the core's shared systems
/// care. Stamped at spawn by the element's create path (every kind, built-in
/// or registered) and never changed afterwards — the facts are fixed by the
/// element kind. Replaces the bridge's `shapes` / `svg_roots` /
/// `foreign_images` membership sets: a system queries `&ElementFlags`, and
/// the op-apply path (where commands are still deferred) derives the same
/// bits from the node's recorded kind through
/// [`ExtRegistry::flags_for_kind`](crate::ext::ExtRegistry::flags_for_kind).
#[derive(Component, Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct ElementFlags {
    /// The entity carries no `Node`: no style, no layout box (a `<text>`
    /// span, an SVG shape child). The update path skips styling, background
    /// images, and every other box stamp for it.
    pub node_less: bool,
    /// The entity's `ImageNode` belongs to the element itself (`image`,
    /// `canvas`, `portal`, `svg`): the `backgroundImage` style must never
    /// touch it (ignored with a diag warning), and on removal ownership: a
    /// present `ImageNode` on any OTHER element was inserted by
    /// `backgroundImage` and is safe to remove.
    pub owns_image: bool,
    /// Never promoted to a composited layer: node-less entities (no box to
    /// capture — their pixels belong to the enclosing block/root) and
    /// detached roots (`<surface>`/`<root>` — own render paths).
    pub layer_ineligible: bool,
}

impl ElementFlags {
    /// A plain styled node: the default.
    pub const NODE: Self = Self {
        node_less: false,
        owns_image: false,
        layer_ineligible: false,
    };
    /// A styled node whose `ImageNode` is element-owned.
    pub const OWNS_IMAGE: Self = Self {
        node_less: false,
        owns_image: true,
        layer_ineligible: false,
    };
    /// A `Node`-less child (span, shape): styleless and never a layer.
    pub const NODE_LESS: Self = Self {
        node_less: true,
        owns_image: false,
        layer_ineligible: true,
    };
    /// A detached root (`<surface>`, `<root>`): styled, never a layer.
    pub const DETACHED_ROOT: Self = Self {
        node_less: false,
        owns_image: false,
        layer_ineligible: true,
    };
}

/// The flags of a built-in element kind (the create-op `kind` string), or
/// `None` for a kind the built-in dispatch does not own (a registered or
/// unknown kind — see [`ExtRegistry::flags_for_kind`]).
pub(crate) fn builtin_flags(kind: &str) -> Option<ElementFlags> {
    Some(match kind {
        "node" | "button" | "text" | "editableText" | "anchor" => ElementFlags::NODE,
        "textSpan" => ElementFlags::NODE_LESS,
        "image" | "canvas" | "portal" => ElementFlags::OWNS_IMAGE,
        "surface" | "root" => ElementFlags::DETACHED_ROOT,
        _ => return None,
    })
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

/// One evaluated `{ animated }` binding of a feature-owned value: the
/// prop key it lives under (`domain`), the field (`name`), and this frame's
/// driven scalar (in the binding's wire units).
#[derive(Debug, Clone, PartialEq)]
pub struct DrivenExt {
    pub domain: &'static str,
    pub name: String,
    pub value: f32,
}

/// The animation engine's publish slot for feature-owned bindings
/// ([`AnimatableProperty::Ext`](crate::animations::AnimatableProperty::Ext)):
/// every frame the shared values move, the engine evaluates each `Ext`
/// binding and compare-writes the results here (one entry per binding it
/// could evaluate to a scalar; a color binding publishes nothing). The
/// feature that owns the domain consumes them in its own system, ordered
/// after [`AnimationSet::Apply`](crate::animations::AnimationSet::Apply),
/// and writes them wherever they land (an SVG shape's attr seed slots).
/// Stamped alongside the entity's `AnimatedNode` exactly when it carries an
/// `Ext` binding; the feature never writes it.
#[derive(Component, Debug, Default, Clone, PartialEq)]
pub struct DrivenExtValues(pub Vec<DrivenExt>);

impl DrivenExtValues {
    /// This frame's driven value of `domain.name`, if the engine could
    /// evaluate its binding.
    pub fn get(&self, domain: &str, name: &str) -> Option<f32> {
        self.0
            .iter()
            .find(|d| d.domain == domain && d.name == name)
            .map(|d| d.value)
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
pub struct MeasureStampSet;

mod element;
mod props;

pub use element::{ElementCtx, ElementKind, ElementUpdateCtx};
pub(crate) use props::{warn_feature_missing, warn_feature_missing_kind};

/// The registry with what the core itself registers — its style properties
/// and writers ([`crate::style::props::CORE_STYLES`],
/// [`crate::style::writers::CORE_WRITERS`]); every element and prop key beyond
/// the built-ins comes from a feature crate's plugin. The harness twin of an
/// app with no feature plugins, for headless tests that decode or apply ops
/// without building the plugin.
#[doc(hidden)]
pub fn builtin_registry() -> ExtRegistry {
    let mut registry = ExtRegistry::default();
    for property in crate::style::props::CORE_STYLES {
        registry.add_style(*property);
    }
    for writer in crate::style::writers::CORE_WRITERS {
        registry.add_style_writer(writer);
    }
    registry
}

/// Install an empty decode scope on this thread when none is (idempotent).
#[cfg(test)]
pub(crate) fn install_builtin_registry() {
    with_thread_registry(|r| r.is_none()).then(|| {
        set_thread_registry(std::sync::Arc::new(builtin_registry()));
    });
}

pub use props::{
    ExtDecodeFn, ExtProp, ExtPropDecoder, ExtProps, ExtRegistry, ExtRegistrySlot, ExtValue,
    FeatureHint, KNOWN_FEATURES, feature_hint, set_thread_registry, with_thread_registry,
};
