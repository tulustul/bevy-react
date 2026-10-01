//! [`ExtRegistry`] — an app's registrations: its elements (with their
//! attributes, writers, and events) and its style properties and writers.
//!
//! Decode has no context of its own (serde carries none), so the registry
//! reaches the deserializer through a **thread-local scope**: the host that
//! decodes ops installs the app's registry on its thread
//! ([`set_thread_registry`]) — the native JS thread once, on its first
//! flush, from the [`ExtRegistrySlot`] the plugin fills at startup; the web
//! host from the resource; the headless test harness directly. No process
//! globals: two apps in one process keep separate registries.

use std::cell::RefCell;
use std::sync::{Arc, OnceLock};

use bevy::platform::collections::HashMap;
use bevy::prelude::*;

use crate::element::{Element, ElementInfo};

/// The registrations of one app: the element kinds and the style
/// properties/writers, the core's included (registered through the same
/// calls a feature crate uses). A resource during plugin build; snapshotted
/// into an [`ExtRegistrySlot`] for the decoding host at startup.
#[derive(Resource, Clone)]
pub struct ExtRegistry {
    /// Registered elements, in registration order.
    decls: Vec<&'static Element>,
    /// Resolved elements by name — rebuilt whenever an element or a style
    /// registration changes (the tables depend on the global writers).
    elements: HashMap<&'static str, Arc<ElementInfo>>,
    /// What an unregistered kind mounts as: a plain node.
    fallback: Arc<ElementInfo>,
    styles: crate::style::StyleRegistry,
}

/// The element an unregistered kind resolves to: a plain styled node with
/// every common prop group and no attributes.
static UNKNOWN_ELEMENT: Element = Element::new("node");

impl Default for ExtRegistry {
    fn default() -> Self {
        let styles = crate::style::StyleRegistry::default();
        Self {
            decls: Vec::new(),
            elements: HashMap::default(),
            fallback: Arc::new(ElementInfo::build(&UNKNOWN_ELEMENT, &styles)),
            styles,
        }
    }
}

impl ExtRegistry {
    /// The registrations an `App` accumulated so far (its `ExtRegistry`
    /// resource, or empty) — a harness that spawns the host itself snapshots
    /// the feature plugins it added this way.
    pub fn from_app(app: &bevy::app::App) -> Self {
        app.world()
            .get_resource::<Self>()
            .cloned()
            .unwrap_or_default()
    }

    /// Register an element (its attributes, writers, and events with it).
    /// Registering the same declaration again is a no-op.
    ///
    /// # Panics
    /// On a name another declaration already registered, or a malformed
    /// declaration (see [`ElementInfo`]).
    pub fn add_element(&mut self, element: &'static Element) {
        if let Some(existing) = self.decls.iter().find(|e| e.name == element.name) {
            assert!(
                std::ptr::eq(*existing, element),
                "bevy-react: element <{}> registered twice",
                element.name
            );
            return;
        }
        self.decls.push(element);
        self.rebuild_elements();
    }

    fn rebuild_elements(&mut self) {
        self.elements = self
            .decls
            .iter()
            .map(|e| (e.name, Arc::new(ElementInfo::build(e, &self.styles))))
            .collect();
        self.fallback = Arc::new(ElementInfo::build(&UNKNOWN_ELEMENT, &self.styles));
    }

    /// The resolved element registered as `kind`.
    pub fn element_info(&self, kind: &str) -> Option<&Arc<ElementInfo>> {
        self.elements.get(kind)
    }

    /// The resolved element of `kind`, or the plain-node fallback an
    /// unregistered kind mounts as.
    pub fn element_or_fallback(&self, kind: &str) -> &Arc<ElementInfo> {
        self.elements.get(kind).unwrap_or(&self.fallback)
    }

    /// Every registered element, in registration order.
    pub fn elements(&self) -> impl Iterator<Item = &'static Element> + '_ {
        self.decls.iter().copied()
    }

    /// The registry's own `&'static str` for a registered kind (its intern).
    pub fn static_kind(&self, kind: &str) -> Option<&'static str> {
        self.elements.get_key_value(kind).map(|(k, _)| *k)
    }

    /// The [`ElementFlags`](super::ElementFlags) of any kind (a plain node
    /// for an unregistered one) — the op-apply path's synchronous answer,
    /// the same bits the spawn stamps on the entity.
    pub fn flags_for_kind(&self, kind: &str) -> super::ElementFlags {
        self.element_or_fallback(kind).decl.flags
    }

    /// Register a style property (see [`crate::style`]).
    ///
    /// # Panics
    /// On a property name already registered.
    pub fn add_style(&mut self, property: &'static dyn crate::style::AnyStyleProperty) {
        self.styles.add(property);
        self.rebuild_elements();
    }

    /// Register a global style writer (see [`crate::style::Writer`]).
    ///
    /// # Panics
    /// On a writer registered twice, a component another global writer
    /// writes, or a writer that reads attributes (an element's own writers
    /// are listed on the element).
    pub fn add_style_writer(&mut self, writer: &'static crate::style::Writer) {
        self.styles.add_writer(writer);
        self.rebuild_elements();
    }

    /// The style registry.
    pub fn styles(&self) -> &crate::style::StyleRegistry {
        &self.styles
    }
}

/// The registry with what the core itself registers — its style properties
/// and writers and its elements. The harness twin of an app with no feature
/// plugins, for headless tests that decode or apply ops without building
/// the plugin.
#[doc(hidden)]
pub fn builtin_registry() -> ExtRegistry {
    let mut registry = ExtRegistry::default();
    for property in crate::style::props::CORE_STYLES {
        registry.styles.add(*property);
    }
    for writer in crate::style::writers::CORE_WRITERS {
        registry.styles.add_writer(writer);
    }
    for element in crate::elements::CORE_ELEMENTS {
        registry.decls.push(element);
    }
    registry.rebuild_elements();
    registry
}

/// The [`builtin_registry`], built once — what decoding and applying fall back
/// to where no app registry is at hand (a bare harness decode, a harness
/// without the bridge).
pub fn core_registry() -> &'static ExtRegistry {
    static CORE: OnceLock<ExtRegistry> = OnceLock::new();
    CORE.get_or_init(builtin_registry)
}

/// Install the core registry as this thread's decode scope when none is
/// installed (idempotent).
#[cfg(test)]
pub(crate) fn install_builtin_registry() {
    with_thread_registry(|r| r.is_none()).then(|| {
        set_thread_registry(Arc::new(builtin_registry()));
    });
}

/// The plugin-to-host handoff: created empty during `ReactUiPlugin::build`
/// (the decoding host may start before every feature plugin has built),
/// filled once with the final registry at startup, read by the host on its
/// first decode ([`ExtRegistrySlot::wait`] blocks the native JS thread until
/// then — a bounded wait, since `Startup` fills it before the first frame).
#[derive(Resource, Clone, Default)]
pub struct ExtRegistrySlot(Arc<OnceLock<Arc<ExtRegistry>>>);

impl ExtRegistrySlot {
    /// A slot already holding `registry` (headless harnesses that spawn the
    /// host directly).
    pub fn ready(registry: ExtRegistry) -> Self {
        let slot = Self::default();
        slot.fill(registry);
        slot
    }

    /// Fill the slot; a second fill is ignored (the first, complete snapshot
    /// wins — `finish` and `Startup` both try, whichever runs first).
    pub fn fill(&self, registry: ExtRegistry) {
        let _ = self.0.set(Arc::new(registry));
    }

    pub fn get(&self) -> Option<Arc<ExtRegistry>> {
        self.0.get().cloned()
    }

    /// Block until filled.
    pub fn wait(&self) -> Arc<ExtRegistry> {
        self.0.wait().clone()
    }
}

thread_local! {
    static THREAD_REGISTRY: RefCell<Option<Arc<ExtRegistry>>> = const { RefCell::new(None) };
}

/// Install `registry` as this thread's decode scope: every `Props` decoded
/// on this thread from now on resolves attributes against it.
pub fn set_thread_registry(registry: Arc<ExtRegistry>) {
    THREAD_REGISTRY.with(|r| *r.borrow_mut() = Some(registry));
}

/// Run `f` with this thread's decode scope (`None` when none is installed —
/// decoding then falls back to the core's own registrations).
pub fn with_thread_registry<R>(f: impl FnOnce(Option<&ExtRegistry>) -> R) -> R {
    THREAD_REGISTRY.with(|r| f(r.borrow().as_deref()))
}

/// A known optional feature: the `bevy-react` cargo feature (and the plugin
/// it compiles in) that provides a set of element kinds. Consulted only on a
/// registry miss, to name both in the `featureMissing` warning; the core
/// never depends on the feature crate. The `bevy-react` facade's tests pin
/// this table against its feature list.
pub struct FeatureHint {
    /// The `bevy-react` cargo feature (also the facade module and the crate
    /// suffix: `svg` → `bevy_react::svg`, `bevy_react_svg`).
    pub feature: &'static str,
    /// The plugin that registers the kinds (a `ReactPlugins` member).
    pub plugin: &'static str,
    pub kinds: &'static [&'static str],
}

/// The optional features the core knows to hint at.
pub const KNOWN_FEATURES: &[FeatureHint] = &[
    FeatureHint {
        feature: "svg",
        plugin: "SvgPlugin",
        kinds: &[
            "svg", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "g",
        ],
    },
    FeatureHint {
        feature: "anchor",
        plugin: "AnchorPlugin",
        kinds: &["anchor"],
    },
    FeatureHint {
        feature: "canvas",
        plugin: "CanvasPlugin",
        kinds: &["canvas"],
    },
    FeatureHint {
        feature: "portal",
        plugin: "PortalPlugin",
        kinds: &["portal"],
    },
    FeatureHint {
        feature: "surface",
        plugin: "SurfacePlugin",
        kinds: &["surface"],
    },
];

/// The feature that would provide the element `kind`, if any.
pub fn feature_hint(kind: &str) -> Option<&'static FeatureHint> {
    KNOWN_FEATURES.iter().find(|f| f.kinds.contains(&kind))
}

/// Report an unregistered element kind that a known optional feature
/// provides: one deduped `featureMissing` diag warning naming the cargo
/// feature and the plugin (under the op's node scope). The core can't tell
/// "compiled out" from "plugin not added", so the message covers both. Any
/// other unknown kind mounts as a plain node silently.
pub(crate) fn warn_feature_missing_kind(kind: &str) {
    if let Some(hint) = feature_hint(kind) {
        crate::diag::report(
            "featureMissing",
            kind,
            &format!(
                "element <{kind}> needs the `{}` feature of `bevy-react` and `{}` \
                 (included in `ReactPlugins`)",
                hint.feature, hint.plugin
            ),
        );
    }
}
