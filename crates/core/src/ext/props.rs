//! The prop slot: feature-owned wire keys on [`Props`](crate::protocol::props::Props).
//!
//! A registered key is decoded **once, at the serde boundary**, by the
//! feature that owns it — never re-parsed on apply, like every built-in
//! field. The value lives in the [`ExtProps`] bag (a flattened field of
//! `Props`), replaces atomically on a delta, and is removed by `unset`.
//!
//! Decode has no context of its own (serde carries none), so the registry
//! reaches the deserializer through a **thread-local scope**: the host that
//! decodes ops installs the app's registry on its thread
//! ([`set_thread_registry`]) — the native JS thread once, on its first
//! flush, from the [`ExtRegistrySlot`] the plugin fills at startup; the web
//! host from the resource; the headless test harness directly. No process
//! globals: two apps in one process keep separate registries.

use std::any::Any;
use std::cell::RefCell;
use std::fmt;
use std::sync::{Arc, OnceLock};

use bevy::platform::collections::HashMap;
use bevy::prelude::*;
use serde::de::{DeserializeOwned, Deserializer, MapAccess, Visitor};

use crate::animations::protocol::Binding;

/// A feature-owned prop value: what a registered key decodes into. Implement
/// this on the value type (the type-level half of [`ExtProp`], whose
/// object-safe methods come for free through the blanket impl) and register
/// it with `add_react_prop::<T>(key)`.
pub trait ExtValue: Any + Send + Sync + fmt::Debug + Clone + PartialEq {
    /// The `{ animated }` bindings inside this value, by field name — the
    /// animation engine drives each as an `Ext { domain: <key>, name }`
    /// property and publishes the evaluated scalar for the feature to apply.
    /// Empty for values with no animatable field.
    fn bindings(&self) -> Vec<(String, Binding)> {
        Vec::new()
    }
}

/// The object-safe view of a registered prop value, as [`ExtProps`] stores
/// it. Implemented for every [`ExtValue`] by the blanket impl below.
pub trait ExtProp: Any + Send + Sync + fmt::Debug {
    /// Equality across the type boundary (a different concrete type is never
    /// equal) — the merge's compare-before-set.
    fn dyn_eq(&self, other: &dyn ExtProp) -> bool;
    fn clone_box(&self) -> Box<dyn ExtProp>;
    /// See [`ExtValue::bindings`].
    fn bindings(&self) -> Vec<(String, Binding)>;
    fn as_any(&self) -> &dyn Any;
}

impl<T: ExtValue> ExtProp for T {
    fn dyn_eq(&self, other: &dyn ExtProp) -> bool {
        other
            .as_any()
            .downcast_ref::<T>()
            .is_some_and(|o| o == self)
    }
    fn clone_box(&self) -> Box<dyn ExtProp> {
        Box::new(self.clone())
    }
    fn bindings(&self) -> Vec<(String, Binding)> {
        ExtValue::bindings(self)
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}

impl Clone for Box<dyn ExtProp> {
    fn clone(&self) -> Self {
        self.clone_box()
    }
}

impl PartialEq for Box<dyn ExtProp> {
    fn eq(&self, other: &Self) -> bool {
        self.dyn_eq(other.as_ref())
    }
}

/// The feature-owned keys of one node's props: `(wire key, decoded value)`
/// pairs. Tiny by construction (a node carries at most a couple), so a plain
/// vector beats a map. Keys are the registry's `&'static str`s.
#[derive(Default, Clone, PartialEq)]
pub struct ExtProps {
    entries: Vec<(&'static str, Box<dyn ExtProp>)>,
}

impl fmt::Debug for ExtProps {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_map()
            .entries(self.entries.iter().map(|(k, v)| (k, v)))
            .finish()
    }
}

impl ExtProps {
    /// The value under `key`, downcast to its registered type.
    pub fn get<T: 'static>(&self, key: &str) -> Option<&T> {
        self.get_dyn(key)
            .and_then(|v| v.as_any().downcast_ref::<T>())
    }

    /// The value under `key` as the trait object.
    pub fn get_dyn(&self, key: &str) -> Option<&dyn ExtProp> {
        self.entries
            .iter()
            .find(|(k, _)| *k == key)
            .map(|(_, v)| v.as_ref())
    }

    /// Whether `key` is present.
    pub fn contains(&self, key: &str) -> bool {
        self.entries.iter().any(|(k, _)| *k == key)
    }

    /// Set `key` to `value` (replacing atomically). Returns whether the
    /// stored value changed — a compare-before-set, so an identical re-send
    /// reports `false`.
    pub fn insert(&mut self, key: &'static str, value: Box<dyn ExtProp>) -> bool {
        match self.entries.iter_mut().find(|(k, _)| *k == key) {
            Some((_, slot)) => {
                if slot.dyn_eq(value.as_ref()) {
                    false
                } else {
                    *slot = value;
                    true
                }
            }
            None => {
                self.entries.push((key, value));
                true
            }
        }
    }

    /// Remove `key`; the registry's static key on success.
    pub fn remove(&mut self, key: &str) -> Option<&'static str> {
        let i = self.entries.iter().position(|(k, _)| *k == key)?;
        Some(self.entries.remove(i).0)
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Every entry, in insertion order.
    pub fn iter(&self) -> impl Iterator<Item = (&'static str, &dyn ExtProp)> + '_ {
        self.entries.iter().map(|(k, v)| (*k, v.as_ref()))
    }

    /// Move every entry out (the delta side of a merge).
    pub fn drain(&mut self) -> impl Iterator<Item = (&'static str, Box<dyn ExtProp>)> + '_ {
        self.entries.drain(..)
    }

    /// The `{ animated }` bindings of every value: `(key, field, binding)`.
    pub fn bindings(&self) -> Vec<(&'static str, String, Binding)> {
        self.entries
            .iter()
            .flat_map(|(k, v)| v.bindings().into_iter().map(move |(n, b)| (*k, n, b)))
            .collect()
    }
}

/// A registered key's decoder: the raw JSON value of the prop → the boxed
/// value; `Ok(None)` when the decoder dropped the value and reported it
/// itself (its own diag kind); `Err` with the message to warn with (the
/// `extProp` diag kind, attributed to the op's node like every decode
/// fallback).
pub type ExtDecodeFn = fn(serde_json::Value) -> Result<Option<Box<dyn ExtProp>>, String>;

/// One registered prop key.
#[derive(Clone)]
pub struct ExtPropDecoder {
    pub key: &'static str,
    pub decode: ExtDecodeFn,
}

/// The feature registrations of one app: the prop keys (and, later, the
/// element kinds) feature crates added through `ReactAppExt`. A resource
/// during plugin build; snapshotted into an [`ExtRegistrySlot`] for the
/// decoding host at startup.
#[derive(Resource, Default, Clone)]
pub struct ExtRegistry {
    props: HashMap<&'static str, ExtPropDecoder>,
    elements: HashMap<&'static str, Arc<dyn super::ElementKind>>,
    styles: crate::style::StyleRegistry,
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

    /// Register an element handler for every kind it names.
    ///
    /// # Panics
    /// On a kind already owned — by a built-in (the built-in dispatch runs
    /// first, so a shadowing handler would silently never run) or by
    /// another handler.
    pub fn add_element(&mut self, handler: impl super::ElementKind) {
        let handler: Arc<dyn super::ElementKind> = Arc::new(handler);
        for &kind in handler.kinds() {
            assert!(
                super::builtin_flags(kind).is_none(),
                "bevy-react: element kind {kind:?} is a built-in and cannot be registered"
            );
            assert!(
                !self.elements.contains_key(kind),
                "bevy-react: element kind {kind:?} registered twice"
            );
            self.elements.insert(kind, handler.clone());
        }
    }

    /// The handler registered for `kind`.
    pub fn element(&self, kind: &str) -> Option<&Arc<dyn super::ElementKind>> {
        self.elements.get(kind)
    }

    /// The registry's own `&'static str` for a registered kind (its intern).
    pub fn static_kind(&self, kind: &str) -> Option<&'static str> {
        self.elements.get_key_value(kind).map(|(k, _)| *k)
    }

    /// The [`ElementFlags`](super::ElementFlags) of any kind: built-ins by
    /// name, registered kinds through their handler, unknown kinds as plain
    /// nodes (what an unregistered kind mounts as). The op-apply path's
    /// synchronous answer — the same bits the spawn stamps on the entity.
    pub fn flags_for_kind(&self, kind: &str) -> super::ElementFlags {
        super::builtin_flags(kind)
            .or_else(|| self.elements.get(kind).map(|h| h.flags(kind)))
            .unwrap_or(super::ElementFlags::NODE)
    }

    /// Register `key` decoding into `T` through its `Deserialize` impl.
    ///
    /// # Panics
    /// On a duplicate key: registering the same wire key twice (from two
    /// features, or a feature shadowing a built-in) is a programmer error
    /// caught at startup, never a silent last-writer-wins.
    pub fn add_prop<T: ExtValue + DeserializeOwned>(&mut self, key: &'static str) {
        self.add_prop_with(key, |value| {
            serde_json::from_value::<T>(value)
                .map(|v| Some(Box::new(v) as Box<dyn ExtProp>))
                .map_err(|e| e.to_string())
        });
    }

    /// Register `key` with a custom decoder (a value whose wire form is not
    /// its `Deserialize` impl).
    pub fn add_prop_with(&mut self, key: &'static str, decode: ExtDecodeFn) {
        assert!(
            !self.props.contains_key(key),
            "bevy-react: prop key {key:?} registered twice (a feature registering a \
             built-in name, or two features claiming one key)"
        );
        self.props.insert(key, ExtPropDecoder { key, decode });
    }

    /// The decoder registered for `key`.
    pub fn prop(&self, key: &str) -> Option<&ExtPropDecoder> {
        self.props.get(key)
    }

    /// Every registered prop key, sorted.
    pub fn prop_keys(&self) -> Vec<&'static str> {
        let mut keys: Vec<_> = self.props.keys().copied().collect();
        keys.sort_unstable();
        keys
    }

    /// Register a style property (see [`crate::style`]).
    ///
    /// # Panics
    /// On a property name already registered.
    pub fn add_style(&mut self, property: &'static dyn crate::style::AnyStyleProperty) {
        self.styles.add(property);
    }

    /// Register a style writer (see [`crate::style::Writer`]).
    ///
    /// # Panics
    /// On a writer registered twice or a component another writer writes.
    pub fn add_style_writer(&mut self, writer: &'static crate::style::Writer) {
        self.styles.add_writer(writer);
    }

    /// Every registered style property.
    pub fn styles(&self) -> &crate::style::StyleRegistry {
        &self.styles
    }
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
/// on this thread from now on resolves feature keys against it.
pub fn set_thread_registry(registry: Arc<ExtRegistry>) {
    THREAD_REGISTRY.with(|r| *r.borrow_mut() = Some(registry));
}

/// Run `f` with this thread's decode scope (`None` when none is installed —
/// every feature key then decodes as unregistered).
pub fn with_thread_registry<R>(f: impl FnOnce(Option<&ExtRegistry>) -> R) -> R {
    THREAD_REGISTRY.with(|r| f(r.borrow().as_deref()))
}

/// A known optional feature: the crate that provides a set of wire keys and
/// element kinds. Consulted only on a registry miss, to name the crate in
/// the `featureMissing` warning; the core never depends on the crate.
pub struct FeatureHint {
    pub crate_name: &'static str,
    pub props: &'static [&'static str],
    pub kinds: &'static [&'static str],
}

/// The optional features the core knows to hint at.
pub const KNOWN_FEATURES: &[FeatureHint] = &[FeatureHint {
    crate_name: "bevy_react_svg",
    props: &["shape", "viewBox"],
    kinds: &[
        "svg", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "g",
    ],
}];

/// The feature that would provide `key` as a prop (`kind == false`) or an
/// element kind (`kind == true`), if any.
pub fn feature_hint(name: &str, kind: bool) -> Option<&'static FeatureHint> {
    KNOWN_FEATURES.iter().find(|f| {
        let list = if kind { f.kinds } else { f.props };
        list.contains(&name)
    })
}

/// The `featureMissing` message for a known optional key/kind, `None` for a
/// name with no hint (unknown props were always ignored silently).
fn feature_missing_message(name: &str, kind: bool) -> Option<String> {
    let hint = feature_hint(name, kind)?;
    let what = if kind { "element" } else { "prop" };
    Some(format!(
        "{what} {name:?} needs the `{}` crate: add its plugin to the app",
        hint.crate_name
    ))
}

/// Report a registry miss on a known optional prop key at decode time: one
/// deduped `featureMissing` diag warning naming the crate to add.
pub(crate) fn warn_feature_missing(name: &str, kind: bool) {
    if let Some(msg) = feature_missing_message(name, kind) {
        crate::diag::decode_report("featureMissing", name, &msg);
    }
}

/// The apply-time twin of [`warn_feature_missing`] for an element kind
/// (reported under the op's node scope).
pub(crate) fn warn_feature_missing_kind(kind: &str) {
    if let Some(msg) = feature_missing_message(kind, true) {
        crate::diag::report("featureMissing", kind, &msg);
    }
}

impl<'de> serde::Deserialize<'de> for ExtProps {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct V;
        impl<'de> Visitor<'de> for V {
            type Value = ExtProps;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a map of feature-owned props")
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Self::Value, A::Error> {
                let mut out = ExtProps::default();
                while let Some(key) = map.next_key::<String>()? {
                    let value: serde_json::Value = map.next_value()?;
                    with_thread_registry(|reg| match reg.and_then(|r| r.prop(&key)) {
                        Some(dec) => match (dec.decode)(value) {
                            Ok(Some(v)) => {
                                out.insert(dec.key, v);
                            }
                            Ok(None) => {}
                            Err(msg) => crate::protocol::decode_warn("extProp", dec.key, &msg),
                        },
                        None => warn_feature_missing(&key, false),
                    });
                }
                Ok(out)
            }
        }
        d.deserialize_map(V)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::props::Props;

    #[derive(Debug, Clone, PartialEq, serde::Deserialize)]
    struct Marker {
        n: u32,
    }
    impl ExtValue for Marker {}

    fn registry() -> ExtRegistry {
        let mut reg = ExtRegistry::default();
        reg.add_prop::<Marker>("marker");
        reg
    }

    fn decode(json: serde_json::Value) -> Props {
        serde_json::from_value(json).unwrap()
    }

    #[test]
    fn registered_key_decodes_into_the_bag() {
        let _lock = crate::diag::test_lock();
        set_thread_registry(Arc::new(registry()));
        let props = decode(serde_json::json!({ "marker": { "n": 3 }, "onClick": true }));
        assert_eq!(props.ext.get::<Marker>("marker"), Some(&Marker { n: 3 }));
        assert!(props.on_click, "built-in fields decode as before");
    }

    #[test]
    fn unregistered_known_key_warns_feature_missing() {
        let _lock = crate::diag::test_lock();
        set_thread_registry(Arc::new(ExtRegistry::default()));
        crate::diag::decode_batch_start();
        let props = decode(serde_json::json!({ "shape": { "cx": 1 } }));
        assert!(props.ext.is_empty());
        let warnings = crate::diag::take_decode_warnings();
        assert!(
            warnings
                .iter()
                .any(|w| w.kind == "featureMissing" && w.value == "shape"),
            "{warnings:?}"
        );
    }

    #[test]
    fn unknown_key_is_ignored_silently() {
        let _lock = crate::diag::test_lock();
        set_thread_registry(Arc::new(registry()));
        crate::diag::decode_batch_start();
        let props = decode(serde_json::json!({ "notAProp": 1 }));
        assert!(props.ext.is_empty());
        assert!(crate::diag::take_decode_warnings().is_empty());
    }

    #[test]
    fn malformed_registered_value_warns_and_drops() {
        let _lock = crate::diag::test_lock();
        set_thread_registry(Arc::new(registry()));
        crate::diag::decode_batch_start();
        let props = decode(serde_json::json!({ "marker": "nope" }));
        assert!(props.ext.is_empty());
        let warnings = crate::diag::take_decode_warnings();
        assert!(
            warnings
                .iter()
                .any(|w| w.kind == "extProp" && w.value == "marker"),
            "{warnings:?}"
        );
    }

    #[test]
    fn merge_replaces_atomically_and_unset_removes() {
        let _lock = crate::diag::test_lock();
        set_thread_registry(Arc::new(registry()));
        let mut cached = decode(serde_json::json!({ "marker": { "n": 1 } }));
        let (dirty, _) = cached.merge_delta(
            decode(serde_json::json!({ "marker": { "n": 2 } })),
            &[],
            &[],
        );
        assert_eq!(cached.ext.get::<Marker>("marker"), Some(&Marker { n: 2 }));
        assert!(dirty.ext_dirty("marker"));
        let (dirty, _) = cached.merge_delta(
            decode(serde_json::json!({ "marker": { "n": 2 } })),
            &[],
            &[],
        );
        assert!(
            !dirty.ext_dirty("marker"),
            "an identical re-send stays silent"
        );
        let (dirty, _) = cached.merge_delta(Props::default(), &["marker".into()], &[]);
        assert!(cached.ext.get::<Marker>("marker").is_none());
        assert!(dirty.ext_dirty("marker"));
    }

    #[test]
    #[should_panic(expected = "registered twice")]
    fn duplicate_key_panics() {
        let mut reg = registry();
        reg.add_prop::<Marker>("marker");
    }
}
