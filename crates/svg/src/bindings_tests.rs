//! The shape attributes' `{ animated }` bindings through the real op path:
//! each numeric attribute publishes under the `"shape"` domain by wire name,
//! and they union with the node's style bindings into one `AnimatedNode`.

use bevy_react_core::animations::AnimatedNode;
use bevy_react_core::animations::protocol::{AnimatableProperty as P, Binding};
use bevy_react_core::test_util::ent;

use crate::op_tests::create_kind;

/// A shape's bindings as the engine derives them from its attributes (each
/// numeric attribute publishes `Ext { domain: "shape", name }` — see
/// [`crate::attrs`]) — for unit tests that build `SvgShape`s directly.
pub(crate) fn derive_shape_bindings(
    shape: Option<&crate::ShapeAttrs>,
) -> Option<bevy_react_core::animations::protocol::AnimatedBindings> {
    let out: std::collections::BTreeMap<_, _> = shape?
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
    (!out.is_empty()).then_some(bevy_react_core::animations::protocol::AnimatedBindings(out))
}

fn shared(id: u32) -> Binding {
    Binding::Shared { id }
}

fn shape_attr(name: &str) -> P {
    P::Ext {
        domain: "shape",
        name: name.into(),
    }
}

/// Numeric attributes derive `Ext` bindings keyed by wire name (camelCase —
/// `strokeWidth`); static attributes derive nothing; the
/// `has_ext_domain("shape")` gate tracks the map; an all-static shape gets
/// no `AnimatedNode` at all.
#[test]
fn derives_shape_attr_bindings_by_wire_name() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![
        create_kind(
            1,
            "circle",
            serde_json::json!({
                "cx": { "animated": { "id": 3 } },
                "strokeWidth": { "animated": { "id": 4 }, "seed": 2 },
                "r": 10,
            }),
        ),
        create_kind(2, "circle", serde_json::json!({ "cx": 1, "r": 2 })),
    ])
    .unwrap();
    app.update();

    let b = &app
        .world()
        .entity(ent(&app, 1))
        .get::<AnimatedNode>()
        .expect("bindings derived")
        .0;
    assert_eq!(b.0.len(), 2, "exactly the animated attrs derive");
    assert_eq!(b.get(shape_attr("cx")), Some(&shared(3)));
    assert_eq!(
        b.get(shape_attr("strokeWidth")),
        Some(&shared(4)),
        "wire name is the camelCase key, not the field name"
    );
    assert_eq!(b.get(shape_attr("r")), None, "static");
    assert!(b.has_ext_domain("shape"), "the gate sees a bound attr");

    assert!(
        app.world()
            .entity(ent(&app, 2))
            .get::<AnimatedNode>()
            .is_none(),
        "all-static attrs derive nothing"
    );
}

/// The attribute bindings union with the style's (either side alone
/// suffices) — the single `AnimatedNode` stamp decision.
#[test]
fn bindings_union_style_and_attributes() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![
        create_kind(
            1,
            "circle",
            serde_json::json!({
                "style": { "opacity": { "animated": { "id": 1 } } },
                "cx": { "animated": { "id": 2 } },
            }),
        ),
        create_kind(
            2,
            "circle",
            serde_json::json!({ "r": { "animated": { "id": 5 } } }),
        ),
    ])
    .unwrap();
    app.update();

    let both = &app
        .world()
        .entity(ent(&app, 1))
        .get::<AnimatedNode>()
        .expect("union derived")
        .0;
    assert_eq!(both.get(P::Opacity), Some(&shared(1)));
    assert_eq!(both.get(shape_attr("cx")), Some(&shared(2)));

    let attr_only = &app
        .world()
        .entity(ent(&app, 2))
        .get::<AnimatedNode>()
        .expect("an attribute binding alone derives")
        .0;
    assert_eq!(attr_only.get(shape_attr("r")), Some(&shared(5)));
}
