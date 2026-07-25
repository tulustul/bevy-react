//! Derive a node's [`AnimatedBindings`] from its merged style.
//!
//! Animated bindings are written **inline in `style`** behind the explicit
//! `{ animated: … }` wrapper ([`Animatable`]): `opacity: { animated: sv }`,
//! `filter: { name, params: { radius: { animated: sv } } }`. The style crosses
//! the wire opaque (like every other style value) and this module — bridge
//! machinery, reaching into `crate::animations` per the module-dependency
//! convention — walks the *merged* style after each delta and rebuilds the
//! complete binding map the animation engine consumes ([`AnimatedNode`]).
//! Because the map is re-derived from merged truth on every style change,
//! bind/unbind/chain-reorder are ordinary field deltas and the map can never
//! go stale.
//!
//! Filter/backdrop param wrappers stay raw in the chain's untyped params at
//! decode; they are recognized here (chain position = wire index) and stripped
//! before typed param resolution (`crate::filters::resolve`) — the binding
//! then drives the packed slot per frame, validated against the resolved
//! chain like any other param binding.
//!
//! [`AnimatedNode`]: crate::animations::AnimatedNode

use std::collections::BTreeMap;

use crate::animations::protocol::{
    AnimatableProperty as P, AnimatedBindings, Binding, Transform3dField as F,
};
use crate::filters::FilterChain;
use crate::protocol::{Props, Style, binding_from_wrapper};

/// Classify a raw filter-param value for the chain resolver: `None` = a plain
/// static param (decode as-is); `Some(seed)` = an `{ animated: … }` wrapper,
/// carrying the optional **`seed`** — the static value the resolver should
/// decode in the wrapper's place. The seed exists because resolve-time
/// derivations (a blur's capture outset) read only static params: an animated
/// radius with no seed resolves at the registry default (outset 0 → the blur
/// clips), so `{ animated: sv, seed: 10 }` sizes the outset for the animation's
/// range while the binding drives the on-screen value every frame.
pub(crate) fn animated_param_seed(value: &serde_json::Value) -> Option<Option<&serde_json::Value>> {
    let map = value.as_object()?;
    map.contains_key("animated").then(|| map.get("seed"))
}

/// Walk one filter/backdrop chain's raw params for `{ animated }` wrappers.
fn chain_bindings(chain: Option<&FilterChain>, backdrop: bool, out: &mut BTreeMap<P, Binding>) {
    let Some(chain) = chain else { return };
    for (index, fu) in chain.0.iter().enumerate() {
        // Chains decode-cap at 256 entries, so the index always fits the u8
        // wire-index space; guard anyway.
        let Ok(index) = u8::try_from(index) else {
            break;
        };
        for (name, value) in &fu.params {
            let Some(inner) = value.as_object().and_then(|m| m.get("animated")) else {
                continue;
            };
            let property = if backdrop {
                P::BackdropParam {
                    index,
                    name: name.clone(),
                }
            } else {
                P::FilterParam {
                    index,
                    name: name.clone(),
                }
            };
            out.insert(property, binding_from_wrapper(inner));
        }
    }
}

/// Derive the complete binding map from a merged style, or `None` when the
/// style carries no `{ animated }` wrapper anywhere (the node then has no
/// [`AnimatedNode`](crate::animations::AnimatedNode) component at all).
pub(crate) fn derive_bindings(style: Option<&Style>) -> Option<AnimatedBindings> {
    let style = style?;
    let mut out = BTreeMap::new();

    macro_rules! field {
        ($field:ident, $prop:expr) => {
            if let Some(crate::protocol::Animatable::Animated(b)) = &style.$field {
                out.insert($prop, b.clone());
            }
        };
    }
    field!(left, P::Left);
    field!(right, P::Right);
    field!(top, P::Top);
    field!(bottom, P::Bottom);
    field!(width, P::Width);
    field!(height, P::Height);
    field!(min_width, P::MinWidth);
    field!(min_height, P::MinHeight);
    field!(max_width, P::MaxWidth);
    field!(max_height, P::MaxHeight);
    field!(aspect_ratio, P::AspectRatio);
    field!(flex_basis, P::FlexBasis);
    field!(gap, P::Gap);
    field!(row_gap, P::RowGap);
    field!(column_gap, P::ColumnGap);
    field!(opacity, P::Opacity);
    field!(background_color, P::BackgroundColor);
    field!(border_color, P::BorderColor);
    field!(color, P::Color);

    if let Some(t) = &style.transform {
        macro_rules! tfield {
            ($field:ident, $prop:expr) => {
                if let Some(crate::protocol::Animatable::Animated(b)) = &t.$field {
                    out.insert($prop, b.clone());
                }
            };
        }
        tfield!(translate_x, P::TranslateX);
        tfield!(translate_y, P::TranslateY);
        tfield!(scale, P::Scale);
        tfield!(scale_x, P::ScaleX);
        tfield!(scale_y, P::ScaleY);
        tfield!(rotate, P::Rotate);
    }

    if let Some(t) = &style.transform3d {
        macro_rules! tfield {
            ($field:ident, $prop:expr) => {
                if let Some(crate::protocol::Animatable::Animated(b)) = &t.$field {
                    out.insert(P::Transform3d($prop), b.clone());
                }
            };
        }
        tfield!(perspective, F::Perspective);
        tfield!(translate_x, F::TranslateX);
        tfield!(translate_y, F::TranslateY);
        tfield!(translate_z, F::TranslateZ);
        tfield!(rotate_x, F::RotateX);
        tfield!(rotate_y, F::RotateY);
        tfield!(rotate_z, F::RotateZ);
        tfield!(scale, F::Scale);
        tfield!(scale_x, F::ScaleX);
        tfield!(scale_y, F::ScaleY);
        if let Some(origin) = &t.origin {
            if let crate::protocol::Animatable::Animated(b) = &origin.x {
                out.insert(P::Transform3d(F::OriginX), b.clone());
            }
            if let crate::protocol::Animatable::Animated(b) = &origin.y {
                out.insert(P::Transform3d(F::OriginY), b.clone());
            }
        }
    }

    chain_bindings(style.filter.as_ref(), false, &mut out);
    chain_bindings(style.backdrop_filter.as_ref(), true, &mut out);

    (!out.is_empty()).then_some(AnimatedBindings(out))
}

/// Bindings are honored in the **base style only**. A wrapper inside a
/// hover/press/focus variant would drive the property regardless of the
/// interaction state (bindings are continuous per-frame drivers, not overlay
/// values), so it is ignored — with a warning naming the variant, mirrored to
/// devtools (`styleBinding`). Call under a `diag::node_scope`.
pub(crate) fn warn_variant_bindings(props: &Props) {
    for (name, style) in [
        ("hoverStyle", props.hover_style.as_ref()),
        ("pressStyle", props.press_style.as_ref()),
        ("focusStyle", props.focus_style.as_ref()),
    ] {
        if derive_bindings(style).is_some() {
            let msg =
                format!("{name}: animated bindings are only supported in the base style; ignoring");
            tracing::warn!(target: "bevy_react", "{msg}");
            crate::diag::report("styleBinding", name, &msg);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn style(v: serde_json::Value) -> Style {
        serde_json::from_value(v).expect("style decodes")
    }

    fn shared(id: u32) -> Binding {
        Binding::Shared { id }
    }

    /// Top-level fields, transform channels (flat wire properties), and
    /// transform3d fields (namespaced) all derive; static fields don't.
    #[test]
    fn derives_fields_transform_and_transform3d() {
        let s = style(serde_json::json!({
            "opacity": { "animated": { "id": 1 } },
            "width": { "animated": { "id": 2 } },
            "height": 40,
            "transform": {
                "translateX": { "animated": { "id": 3 } },
                "rotate": { "animated": { "id": 4 } },
                "scale": 2.0,
            },
            "transform3d": {
                "perspective": 600,
                "rotateY": { "animated": { "id": 5 } },
                "origin": { "x": { "animated": { "id": 6 } }, "y": "50%" },
            },
        }));
        let b = derive_bindings(Some(&s)).expect("bindings derived");
        assert_eq!(b.get(P::Opacity), Some(&shared(1)));
        assert_eq!(b.get(P::Width), Some(&shared(2)));
        assert_eq!(b.get(P::Height), None, "static field not derived");
        assert_eq!(b.get(P::TranslateX), Some(&shared(3)));
        assert_eq!(b.get(P::Rotate), Some(&shared(4)));
        assert_eq!(b.get(P::Scale), None, "static transform channel");
        assert_eq!(b.get(P::Transform3d(F::RotateY)), Some(&shared(5)));
        assert_eq!(b.get(P::Transform3d(F::OriginX)), Some(&shared(6)));
        assert_eq!(b.get(P::Transform3d(F::OriginY)), None);
        assert_eq!(b.get(P::Transform3d(F::Perspective)), None);
        // The static halves survive the decode next to the bindings.
        assert!(s.transform3d.as_ref().unwrap().perspective.is_some());
    }

    /// Filter/backdrop chain params derive by chain position (single object =
    /// index 0), and a descriptor wrapper carries through as-is.
    #[test]
    fn derives_chain_params_by_position() {
        let s = style(serde_json::json!({
            "filter": [
                { "name": "blur", "params": { "radius": { "animated": { "id": 1 } } } },
                { "name": "grayscale" },
                { "name": "dissolve", "params": {
                    "progress": { "animated": { "type": "interpolate", "id": 2,
                                                 "input": [0, 1], "output": [0, 100] } },
                    "seed": 7,
                } },
            ],
            "backdropFilter": { "name": "blur", "params": { "radius": { "animated": { "id": 3 } } } },
        }));
        let b = derive_bindings(Some(&s)).expect("bindings derived");
        assert_eq!(
            b.get(P::FilterParam {
                index: 0,
                name: "radius".into()
            }),
            Some(&shared(1))
        );
        assert_eq!(
            b.get(P::FilterParam {
                index: 2,
                name: "progress".into()
            }),
            Some(&Binding::Interpolate {
                id: 2,
                input: vec![0.0, 1.0],
                output: vec![0.0, 100.0],
            })
        );
        assert_eq!(
            b.get(P::FilterParam {
                index: 2,
                name: "seed".into()
            }),
            None,
            "static param not derived"
        );
        assert_eq!(
            b.get(P::BackdropParam {
                index: 0,
                name: "radius".into()
            }),
            Some(&shared(3)),
            "single-object chain is index 0"
        );
    }

    /// A style with no wrappers derives nothing (no `AnimatedNode` at all).
    #[test]
    fn static_style_derives_none() {
        let s = style(serde_json::json!({
            "opacity": 0.5,
            "transform": { "rotate": 45 },
            "filter": { "name": "blur", "params": { "radius": 4 } },
        }));
        assert!(derive_bindings(Some(&s)).is_none());
        assert!(derive_bindings(None).is_none());
    }

    /// The wrapper decode is junk-tolerant (a live `SharedValue` handle
    /// serializes extra fields next to `id`) and warns-inert on garbage.
    #[test]
    fn wrapper_decode_tolerates_junk_and_degrades() {
        let s = style(serde_json::json!({
            // A serialized SharedValue: id + whatever else the handle carries.
            "opacity": { "animated": { "id": 9, "value": 0.3, "whatever": true } },
            // Garbage wrapper → inert binding (id 0 is never allocated).
            "width": { "animated": "nonsense" },
        }));
        let b = derive_bindings(Some(&s)).expect("bindings derived");
        assert_eq!(b.get(P::Opacity), Some(&shared(9)));
        assert_eq!(b.get(P::Width), Some(&shared(0)), "garbage → inert");
    }
}
