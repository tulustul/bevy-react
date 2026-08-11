//! [`Animatable<T>`] — the `{ animated }` wrapper every animatable style/attr
//! field decodes through — and the [`AnimatableField`] read helpers.

use serde::Deserialize;
use serde::de::{self, Deserializer};

use super::decode_warn;

#[derive(Debug, Clone, PartialEq)]
pub enum Animatable<T> {
    Static(T),
    Animated {
        binding: crate::animations::protocol::Binding,
        /// The wrapper's sibling `seed`, decoded as `T` (a malformed seed
        /// warns `styleBinding` and drops to `None`).
        ///
        /// While an animation driver runs, the seed carries the **last driven
        /// value**: the apply stage (`crate::animations`' shape-attr stage)
        /// writes each frame's resolved value into this slot — never
        /// replacing the variant with `Static`, which would destroy the
        /// binding — so seed-rendering read sites (`static_or_seed`) see the
        /// live value while the binding survives re-derivation.
        seed: Option<T>,
    },
}

impl<T> Animatable<T> {
    /// The static value; `None` while animated (the seed is NOT a static
    /// value — see [`Self::seed`]).
    pub fn value(&self) -> Option<&T> {
        match self {
            Animatable::Static(v) => Some(v),
            Animatable::Animated { .. } => None,
        }
    }

    /// The binding; `None` when static.
    pub fn binding(&self) -> Option<&crate::animations::protocol::Binding> {
        match self {
            Animatable::Static(_) => None,
            Animatable::Animated { binding, .. } => Some(binding),
        }
    }

    /// The animated wrapper's `seed`; `None` when static or seed-less.
    pub fn seed(&self) -> Option<&T> {
        match self {
            Animatable::Static(_) => None,
            Animatable::Animated { seed, .. } => seed.as_ref(),
        }
    }
}

/// Read helpers for the `Option<Animatable<T>>` style fields, so read sites
/// stay as terse as the plain `Option<T>` they replaced.
pub trait AnimatableField<T> {
    /// The static value by copy; `None` when absent **or** animated.
    fn static_val(&self) -> Option<T>
    where
        T: Copy;
    /// The static value by reference; `None` when absent or animated.
    fn static_ref(&self) -> Option<&T>;
    /// The static value — or, while animated, the wrapper's `seed`; `None`
    /// when absent or animated seed-less. The read helper for fields whose
    /// consumers should *render* the seed until a driver writes (SVG shape
    /// attrs); style read sites use [`Self::static_val`] instead (their
    /// animated fields read as absent by design).
    fn static_or_seed(&self) -> Option<T>
    where
        T: Copy;
    /// The binding; `None` when absent or static.
    fn binding(&self) -> Option<&crate::animations::protocol::Binding>;
}

impl<T> AnimatableField<T> for Option<Animatable<T>> {
    fn static_val(&self) -> Option<T>
    where
        T: Copy,
    {
        self.static_ref().copied()
    }
    fn static_ref(&self) -> Option<&T> {
        self.as_ref().and_then(Animatable::value)
    }
    fn static_or_seed(&self) -> Option<T>
    where
        T: Copy,
    {
        self.as_ref()
            .and_then(|a| a.value().or_else(|| a.seed()))
            .copied()
    }
    fn binding(&self) -> Option<&crate::animations::protocol::Binding> {
        self.as_ref().and_then(Animatable::binding)
    }
}

impl<'de, T: de::DeserializeOwned> Deserialize<'de> for Animatable<T> {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        let v = serde_json::Value::deserialize(d)?;
        if let Some(map) = v.as_object()
            && let Some(inner) = map.get("animated")
        {
            let seed = map.get("seed").and_then(|s| match T::deserialize(s) {
                Ok(seed) => Some(seed),
                Err(e) => {
                    decode_warn(
                        "styleBinding",
                        &s.to_string(),
                        &format!("invalid seed: {e}"),
                    );
                    None
                }
            });
            return Ok(Animatable::Animated {
                binding: binding_from_wrapper(inner),
                seed,
            });
        }
        T::deserialize(v)
            .map(Animatable::Static)
            .map_err(de::Error::custom)
    }
}

/// Decode the payload of an `{ animated: … }` wrapper: a descriptor object
/// (tagged by `type`) decodes as a [`Binding`](crate::animations::protocol::Binding);
/// a bare shared value is recognized by its numeric `id` (every other
/// enumerable field of the JS handle is ignored). Malformed → warn + inert.
pub(crate) fn binding_from_wrapper(
    inner: &serde_json::Value,
) -> crate::animations::protocol::Binding {
    use crate::animations::protocol::Binding;
    let inert = Binding::Shared { id: 0 };
    let Some(map) = inner.as_object() else {
        decode_warn(
            "styleBinding",
            &inner.to_string(),
            "animated must be a shared value or an interpolate/interpolateColor descriptor",
        );
        return inert;
    };
    if map.contains_key("type") {
        match Binding::deserialize(inner) {
            Ok(b) => b,
            Err(e) => {
                decode_warn("styleBinding", &inner.to_string(), &e.to_string());
                inert
            }
        }
    } else if let Some(id) = map.get("id").and_then(serde_json::Value::as_u64) {
        Binding::Shared { id: id as u32 }
    } else {
        decode_warn(
            "styleBinding",
            &inner.to_string(),
            "animated needs a shared value ({id}) or a descriptor ({type, id, …})",
        );
        inert
    }
}
