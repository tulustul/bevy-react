//! The svg elements' pointer stamps and per-element decode rules, through
//! the real op path.

use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;

use crate::op_tests::{create_kind, update_kind};
use bevy_react_core::ext::EventLocalPos;
use bevy_react_core::protocol::{animatable::AnimatableField, props::Props};
use bevy_react_core::test_util::{PointerHandlers, ent};

/// A shape declaring handlers mounts with the synthesis component set —
/// `PointerHandlers` + `Interaction` + `RelativeCursorPosition` +
/// [`EventLocalPos`] — and stays Node-less; a handler-less sibling gets none of
/// them (its hits fall through to the `<svg>` root).
#[test]
fn shape_handlers_stamp_pointer_components_on_create() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![
        create_kind(
            1,
            "circle",
            serde_json::json!({
                "r": 4.0,
                "onClick": true,
                "onPointerDown": true,
            }),
        ),
        create_kind(2, "rect", serde_json::json!({ "width": 3.0 })),
    ])
    .unwrap();
    app.update();

    let with = app.world().entity(ent(&app, 1));
    let handlers = with
        .get::<PointerHandlers>()
        .expect("a handler-bearing shape carries PointerHandlers");
    assert!(handlers.down, "onPointerDown is registered");
    assert!(
        with.get::<Interaction>().is_some(),
        "onClick/onPointer* need the Interaction click-ownership marker"
    );
    assert!(
        with.get::<RelativeCursorPosition>().is_some(),
        "pointer handlers need the relative cursor"
    );
    assert!(
        with.get::<EventLocalPos>().is_some(),
        "shapes additionally carry the user-space cursor slot"
    );
    assert!(with.get::<Node>().is_none(), "still Node-less");

    let without = app.world().entity(ent(&app, 2));
    assert!(
        without.get::<PointerHandlers>().is_none()
            && without.get::<Interaction>().is_none()
            && without.get::<RelativeCursorPosition>().is_none()
            && without.get::<EventLocalPos>().is_none(),
        "a handler-less shape must stay bare (root fallthrough)"
    );
}

/// Handler deltas toggle the whole component set on and off: adding handlers
/// to a bare shape stamps them; unsetting every handler removes them —
/// including `Interaction` and the [`EventLocalPos`] slot (the core's
/// node-less rule: a shape's `Interaction` serves its handlers alone, and a
/// leftover would steal clicks from the `<svg>` root's climb).
#[test]
fn shape_pointer_update_adds_and_removes_components() {
    let (mut app, tx) = crate::test_app();
    tx.send(vec![create_kind(
        1,
        "circle",
        serde_json::json!({ "r": 4.0 }),
    )])
    .unwrap();
    app.update();
    let e = ent(&app, 1);

    tx.send(vec![update_kind(
        1,
        "circle",
        serde_json::json!({ "onClick": true, "onPointerEnter": true }),
        &[],
    )])
    .unwrap();
    app.update();
    {
        let entity = app.world().entity(e);
        assert!(
            entity.get::<PointerHandlers>().is_some()
                && entity.get::<Interaction>().is_some()
                && entity.get::<EventLocalPos>().is_some(),
            "an update adding handlers stamps the synthesis set"
        );
    }

    tx.send(vec![update_kind(
        1,
        "circle",
        serde_json::json!({}),
        &["onClick", "onPointerEnter"],
    )])
    .unwrap();
    app.update();
    let entity = app.world().entity(e);
    assert!(
        entity.get::<PointerHandlers>().is_none()
            && entity.get::<Interaction>().is_none()
            && entity.get::<RelativeCursorPosition>().is_none()
            && entity.get::<EventLocalPos>().is_none(),
        "unsetting every handler strips the synthesis set"
    );
}

/// `onScroll`/`onWheel` on a shape never fire (shapes are Node-less — no
/// `ScrollPosition`, no wheel surface): shapes lack the scroll/wheel common
/// groups, so both are dropped at decode with a `propIgnored` warning — and
/// stamp nothing.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn shape_scroll_handlers_are_ignored_with_a_warning() {
    let _app = crate::test_app();
    let _ = bevy_react_core::diag::take_decode_warnings();
    let props = Props::decode_for(
        "circle",
        serde_json::json!({ "r": 4.0, "onScroll": true, "onWheel": true }),
    );
    let warns = bevy_react_core::diag::take_decode_warnings();
    for prop in ["onScroll", "onWheel"] {
        assert!(
            warns
                .iter()
                .any(|w| w.kind == "propIgnored" && w.value == prop),
            "{prop} on a shape must warn propIgnored: {warns:?}"
        );
    }
    assert!(
        !props.on_scroll && !props.on_wheel,
        "ignored handlers never reach the retained props"
    );
}

/// Attributes are per element: a `<rect>` has no `r` (an `unknownProp`
/// warning, dropped), and a `<g>` — never hit, no geometry — takes no pointer
/// handlers (`propIgnored`).
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn shape_attributes_are_per_element() {
    let _app = crate::test_app();
    let _ = bevy_react_core::diag::take_decode_warnings();
    let props = Props::decode_for("rect", serde_json::json!({ "r": 4.0, "width": 2.0 }));
    assert!(
        props.attrs.get(&crate::attrs::R).is_none(),
        "r is not a <rect> attribute"
    );
    assert_eq!(
        props
            .attrs
            .get(&crate::attrs::WIDTH)
            .and_then(|w| Some(w).static_val()),
        Some(2.0)
    );
    let props = Props::decode_for("g", serde_json::json!({ "onClick": true }));
    assert!(!props.on_click, "a <g> takes no pointer handlers");
    let warns = bevy_react_core::diag::take_decode_warnings();
    assert!(
        warns
            .iter()
            .any(|w| w.kind == "unknownProp" && w.value == "r"),
        "{warns:?}"
    );
    assert!(
        warns
            .iter()
            .any(|w| w.kind == "propIgnored" && w.value == "onClick"),
        "{warns:?}"
    );
}
