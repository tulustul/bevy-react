//! Element registry tests: registration rules, per-element attribute
//! namespaces, decode diagnostics, ownership masking, default styles.

use std::sync::Arc;

use bevy::ui::FocusPolicy;

use super::*;
use crate::ext::{ExtRegistry, builtin_registry, set_thread_registry};
use crate::protocol::props::Props;
use crate::style::props::{BACKGROUND_IMAGE, FOCUS_POLICY};
use crate::style::writers::BACKGROUND_IMAGE_WRITER;

static SIZE_TEXT: Attribute<String> = Attribute::new("size");
static SIZE_NUMBER: Attribute<f32> = Attribute::new("size");
static EXTRA: Attribute<bool> = Attribute::new("extra");

static ALPHA: Element = Element {
    attrs: &[&SIZE_TEXT],
    ..Element::new("alpha")
};
static BETA: Element = Element {
    attrs: &[&SIZE_NUMBER, &EXTRA],
    ..Element::new("beta")
};
static ALPHA_AGAIN: Element = Element::new("alpha");

/// A registry with the core plus the two test elements, installed as this
/// thread's decode scope.
fn install_test_registry() {
    let mut registry = builtin_registry();
    registry.add_element(&ALPHA);
    registry.add_element(&BETA);
    set_thread_registry(Arc::new(registry));
}

#[test]
#[should_panic(expected = "registered twice")]
fn duplicate_element_name_panics() {
    let mut registry = ExtRegistry::default();
    registry.add_element(&ALPHA);
    registry.add_element(&ALPHA_AGAIN);
}

#[test]
#[should_panic(expected = "registered twice")]
fn core_element_name_cannot_be_reregistered() {
    static NODE_AGAIN: Element = Element::new("node");
    builtin_registry().add_element(&NODE_AGAIN);
}

#[test]
#[should_panic(expected = "reserved prop name")]
fn reserved_attribute_name_panics() {
    static STYLE_ATTR: Attribute<String> = Attribute::new("style");
    static BAD: Element = Element {
        attrs: &[&STYLE_ATTR],
        ..Element::new("bad")
    };
    ExtRegistry::default().add_element(&BAD);
}

#[test]
#[should_panic(expected = "reserved prop name")]
fn handler_shaped_attribute_name_panics() {
    static ON_THING: Attribute<bool> = Attribute::new("onThing");
    static BAD: Element = Element {
        attrs: &[&ON_THING],
        ..Element::new("bad")
    };
    ExtRegistry::default().add_element(&BAD);
}

#[test]
#[should_panic(expected = "declares attribute \"size\" twice")]
fn duplicate_attribute_in_one_element_panics() {
    static BAD: Element = Element {
        attrs: &[&SIZE_TEXT, &SIZE_NUMBER],
        ..Element::new("bad")
    };
    ExtRegistry::default().add_element(&BAD);
}

#[test]
#[should_panic(expected = "requires attribute")]
fn required_attribute_must_be_listed() {
    static BAD: Element = Element {
        attrs: &[&SIZE_TEXT],
        required: &[&EXTRA],
        ..Element::new("bad")
    };
    ExtRegistry::default().add_element(&BAD);
}

#[test]
#[should_panic(expected = "collides with the common prop")]
fn event_colliding_with_a_common_handler_panics() {
    static CLICK: ElementEvent<()> = ElementEvent::new("click");
    static BAD: Element = Element {
        events: &[&CLICK],
        ..Element::new("bad")
    };
    ExtRegistry::default().add_element(&BAD);
}

#[test]
fn handler_prop_capitalizes_the_event_name() {
    assert_eq!(handler_prop("change"), "onChange");
    assert_eq!(handler_prop("valueChange"), "onValueChange");
}

/// The namespace is per element: two elements may declare the same wire
/// name with different types, and a prop decodes against the element its
/// op names.
#[test]
fn same_attribute_name_decodes_per_element() {
    install_test_registry();
    let alpha = Props::decode_for("alpha", serde_json::json!({ "size": "large" }));
    assert_eq!(
        alpha.attrs.get(&SIZE_TEXT).map(String::as_str),
        Some("large")
    );
    assert!(alpha.attrs.get(&SIZE_NUMBER).is_none());

    let beta = Props::decode_for("beta", serde_json::json!({ "size": 3.5, "extra": true }));
    assert_eq!(beta.attrs.get(&SIZE_NUMBER), Some(&3.5));
    assert_eq!(beta.attrs.get(&EXTRA), Some(&true));
    assert!(beta.attrs.get(&SIZE_TEXT).is_none());
}

/// A key the element doesn't declare is dropped with `unknownProp`; a common
/// prop outside the element's groups is dropped with `propIgnored`; an
/// attribute of another element is unknown here (per-element namespace).
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn decode_reports_unknown_and_ignored_props() {
    install_test_registry();
    crate::diag::decode_batch_start();
    let node = Props::decode_for("node", serde_json::json!({ "src": "a.png", "nope": 1 }));
    assert!(node.attrs.is_empty());
    let root = Props::decode_for(
        "root",
        serde_json::json!({ "hoverStyle": { "width": 1 }, "onClick": true, "name": "n" }),
    );
    assert!(root.hover_style.is_none() && !root.on_click);
    assert_eq!(
        root.name.as_deref(),
        Some("n"),
        "identity is always accepted"
    );
    let alpha = Props::decode_for("alpha", serde_json::json!({ "extra": true }));
    assert!(
        alpha.attrs.is_empty(),
        "beta's attribute is unknown on alpha"
    );

    let warnings = crate::diag::take_decode_warnings();
    let brief: Vec<_> = warnings
        .iter()
        .map(|w| (w.kind, w.value.as_str()))
        .collect();
    assert_eq!(
        brief,
        vec![
            ("unknownProp", "src"),
            ("unknownProp", "nope"),
            ("propIgnored", "hoverStyle"),
            ("propIgnored", "onClick"),
            ("unknownProp", "extra"),
        ]
    );
}

/// An unregistered kind's props drop their unknown keys silently (the kind
/// itself is reported once at apply); common props still decode.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn unknown_kind_drops_attributes_silently() {
    install_test_registry();
    crate::diag::decode_batch_start();
    let props = Props::decode_for(
        "notAnElement",
        serde_json::json!({ "cx": 3, "onClick": true }),
    );
    assert!(props.attrs.is_empty());
    assert!(props.on_click, "common props still decode");
    assert!(crate::diag::take_decode_warnings().is_empty());
}

/// An element writer writing `ImageNode` masks off the global writer
/// writing it (`backgroundImage`) on that element — and the property only
/// that writer reads is then ignored there (`styleIgnored`). An element may
/// also opt out explicitly (`suppress` — a feature's raster element whose
/// `ImageNode` is born at spawn, like `<canvas>`). Plain nodes keep it.
#[test]
fn element_writers_mask_global_owners() {
    static SUPPRESSING: Element = Element {
        suppress: &[&BACKGROUND_IMAGE_WRITER],
        ..Element::new("suppressing")
    };
    let mut registry = builtin_registry();
    registry.add_element(&SUPPRESSING);
    let styles = registry.styles();
    let bg = styles.writer_bit(&BACKGROUND_IMAGE_WRITER);
    let id = styles.id_of(&BACKGROUND_IMAGE).unwrap();

    let node = registry.element_info("node").unwrap();
    assert!(node.global_mask.intersects(bg));
    assert!(!node.ignored_styles.contains(id));

    for kind in ["image", "suppressing"] {
        let info = registry.element_info(kind).unwrap();
        assert!(
            !info.global_mask.intersects(bg),
            "<{kind}> masks off the backgroundImage writer"
        );
        assert!(
            info.ignored_styles.contains(id),
            "backgroundImage is ignored on <{kind}>"
        );
    }
}

/// A writer is re-run by the attributes it reads (and only those), and a
/// `PAINT` attribute's change invalidates paint.
#[test]
fn element_writers_follow_their_attributes() {
    let registry = builtin_registry();
    let image = registry.element_info("image").unwrap();
    let (src, _) = image.attr("src").unwrap();
    let mut dirty = AttrDirty::NONE;
    dirty.insert(src);
    assert_ne!(image.writers_for(&crate::style::StyleDirty::NONE, dirty), 0);
    assert_eq!(
        image.writers_for(&crate::style::StyleDirty::NONE, AttrDirty::NONE),
        0
    );
    assert!(
        image
            .attr_invalidation(dirty)
            .contains(crate::style::Invalidation::PAINT)
    );
}

/// A `<button>`'s default style blocks the pointer: filled under the user's
/// style (which wins), and restored when the user unsets the property.
#[test]
fn default_style_fills_under_the_user_style() {
    let registry = builtin_registry();
    let button = registry.element_info("button").unwrap();
    let mut style = None;
    button.fill_default_style(&mut style);
    assert_eq!(
        style.as_ref().and_then(|s| s.get(&FOCUS_POLICY)),
        Some(&FocusPolicy::Block)
    );
    let mut user = crate::style::Style::default();
    user.set(&FOCUS_POLICY, FocusPolicy::Pass);
    let mut user = Some(user);
    button.fill_default_style(&mut user);
    assert_eq!(
        user.as_ref().and_then(|s| s.get(&FOCUS_POLICY)),
        Some(&FocusPolicy::Pass)
    );
    // An element without a default style leaves the user's untouched.
    let node = registry.element_info("node").unwrap();
    let mut none = None;
    node.fill_default_style(&mut none);
    assert!(none.is_none());
}
