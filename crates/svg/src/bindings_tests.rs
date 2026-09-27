//! The shape attrs' `{ animated }` bindings: derivation by wire name and the
//! union with a node's style bindings through the core's prop bag.

use std::collections::BTreeMap;

use bevy_react_core::animations::protocol::{AnimatableProperty as P, AnimatedBindings, Binding};
use bevy_react_core::protocol::props::Props;
use bevy_react_core::test_util::op_app_with;

use crate::ShapeAttrs;

fn shared(id: u32) -> Binding {
    Binding::Shared { id }
}

/// The reconciler's derivation for a shape (bindings keyed by wire name).
pub(crate) fn derive_shape_bindings(shape: Option<&ShapeAttrs>) -> Option<AnimatedBindings> {
    let out: BTreeMap<_, _> = shape?
        .animated_bindings()
        .into_iter()
        .map(|(name, binding)| {
            (
                P::Ext {
                    domain: "shape",
                    name,
                },
                binding,
            )
        })
        .collect();
    (!out.is_empty()).then_some(AnimatedBindings(out))
}

fn derive_props_bindings(props: &Props) -> Option<AnimatedBindings> {
    let mut out = BTreeMap::new();
    if let Some(style) = props
        .style
        .as_ref()
        .and_then(|s| s.get(&bevy_react_core::style::props::OPACITY))
        && let bevy_react_core::protocol::animatable::Animatable::Animated(a) = style
    {
        out.insert(P::Opacity, a.binding.clone());
    }
    for (domain, name, binding) in props.ext.bindings() {
        out.insert(P::Ext { domain, name }, binding);
    }
    (!out.is_empty()).then_some(AnimatedBindings(out))
}

mod tests {
    use super::*;

    /// Shape numeric attrs derive `Ext` bindings keyed by wire name
    /// (camelCase — `strokeWidth`); static attrs and shape-less props derive
    /// nothing; the `has_ext_domain("shape")` gate tracks the map.
    #[test]
    fn derives_shape_attr_bindings_by_wire_name() {
        let shape: ShapeAttrs = serde_json::from_value(serde_json::json!({
            "cx": { "animated": { "id": 3 } },
            "strokeWidth": { "animated": { "id": 4 }, "seed": 2 },
            "r": 10,
        }))
        .unwrap();
        let b = derive_shape_bindings(Some(&shape)).expect("bindings derived");
        assert_eq!(b.0.len(), 2, "exactly the animated attrs derive");
        assert_eq!(
            b.get(P::Ext {
                domain: "shape",
                name: "cx".into()
            }),
            Some(&shared(3))
        );
        assert_eq!(
            b.get(P::Ext {
                domain: "shape",
                name: "strokeWidth".into()
            }),
            Some(&shared(4)),
            "wire name is the camelCase key, not the field name"
        );
        assert_eq!(
            b.get(P::Ext {
                domain: "shape",
                name: "r".into()
            }),
            None,
            "static"
        );
        assert!(b.has_ext_domain("shape"), "the gate sees a bound attr");
        assert!(!b.has_filter_params(), "no cross-talk with other gates");

        let static_shape: ShapeAttrs =
            serde_json::from_value(serde_json::json!({ "cx": 1, "r": 2 })).unwrap();
        assert!(
            derive_shape_bindings(Some(&static_shape)).is_none(),
            "all-static attrs derive nothing"
        );
        assert!(derive_shape_bindings(None).is_none());
    }

    /// The bag's bindings union with the style's (either side alone
    /// suffices); `None` only when both are empty — the single
    /// `AnimatedNode` stamp decision.
    #[test]
    fn props_bindings_union_style_and_shape() {
        let _app = op_app_with(crate::register_bindings);
        let props = |v: serde_json::Value| -> bevy_react_core::protocol::props::Props {
            serde_json::from_value(v).unwrap()
        };
        let both = props(serde_json::json!({
            "style": { "opacity": { "animated": { "id": 1 } } },
            "shape": { "cx": { "animated": { "id": 2 } } },
        }));
        let b = derive_props_bindings(&both).expect("union derived");
        assert_eq!(b.get(P::Opacity), Some(&shared(1)));
        assert_eq!(
            b.get(P::Ext {
                domain: "shape",
                name: "cx".into()
            }),
            Some(&shared(2))
        );

        let shape_only = props(serde_json::json!({
            "shape": { "r": { "animated": { "id": 5 } } },
        }));
        let b = derive_props_bindings(&shape_only).expect("shape alone derives");
        assert_eq!(
            b.get(P::Ext {
                domain: "shape",
                name: "r".into()
            }),
            Some(&shared(5))
        );

        let neither = props(serde_json::json!({
            "style": { "opacity": 0.5 },
            "shape": { "cx": 1 },
        }));
        assert!(
            derive_props_bindings(&neither).is_none(),
            "both-empty removes the stamp"
        );
    }
}
