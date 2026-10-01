//! The devtools element table, read off the element registry: the panel
//! requests it once at install (`devtools.elements`), so the op mirror knows
//! each element's act-now attributes (never retained), the inspector which
//! props are editable, and every element — an app's own included — is
//! covered without a hand-kept JS table.

use bevy::prelude::*;
use serde::Serialize;

use super::style_fields::category;
use crate::element::{Common, Element};
use crate::ext::ExtRegistry;
use crate::react_request;
use crate::request::Request;

/// JS → Bevy: the registered elements (unit payload).
#[react_request(name = "devtools.elements", response = Vec<DevtoolsElement>)]
pub(super) struct DevtoolsElementsGet;

/// One registered element as the panel sees it (`api.ts` mirrors the shape).
#[derive(Debug, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub(super) struct DevtoolsElement {
    /// The element kind (the JSX intrinsic / create-op `kind`).
    name: String,
    attrs: Vec<DevtoolsAttr>,
    /// The element's own event handler props (`onChange`, …).
    events: Vec<String>,
    /// The common prop groups that apply: `identity`, `variants`,
    /// `pointer`, `scroll`, `wheel`.
    common: Vec<String>,
}

/// One attribute of an element.
#[derive(Debug, Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(rename_all = "camelCase")]
pub(super) struct DevtoolsAttr {
    name: String,
    /// The coarse value shape an edit is pre-validated against (`fields.ts`
    /// `FieldCategory`).
    category: String,
    /// The diag kind a bad keyword warns under (keyword attributes only).
    kind: Option<String>,
    /// Act-now: acts once, never retained (the mirror drops it).
    act_now: bool,
    /// Named by the generated JSX typing (`false` for wire-only attributes).
    typed: bool,
}

pub(super) fn on_elements_request(
    req: On<Request<DevtoolsElementsGet>>,
    ext: Option<Res<ExtRegistry>>,
) {
    let registry = ext.as_deref().unwrap_or(crate::ext::core_registry());
    req.respond(registry.elements().map(element).collect::<Vec<_>>());
}

fn element(decl: &'static Element) -> DevtoolsElement {
    let groups = [
        (Common::IDENTITY, "identity"),
        (Common::VARIANTS, "variants"),
        (Common::POINTER, "pointer"),
        (Common::SCROLL, "scroll"),
        (Common::WHEEL, "wheel"),
    ];
    DevtoolsElement {
        name: decl.name.to_owned(),
        attrs: decl
            .attrs
            .iter()
            .map(|attr| DevtoolsAttr {
                name: attr.name().to_owned(),
                category: category(attr.keyword_kind(), &attr.ts_type()).to_owned(),
                kind: attr.keyword_kind().map(str::to_owned),
                act_now: attr.is_event(),
                typed: attr.is_typed(),
            })
            .collect(),
        events: decl
            .events
            .iter()
            .map(|e| crate::element::handler_prop(e.name()))
            .collect(),
        common: groups
            .iter()
            .filter(|(group, _)| decl.common.contains(*group))
            .map(|(_, name)| (*name).to_owned())
            .collect(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn table(name: &str) -> DevtoolsElement {
        let registry = crate::ext::builtin_registry();
        let decl = registry
            .elements()
            .find(|e| e.name == name)
            .expect("a core element");
        element(decl)
    }

    #[test]
    fn editable_text_reports_act_now_attrs_events_and_groups() {
        let el = table("editableText");
        let value = el.attrs.iter().find(|a| a.name == "value").unwrap();
        assert!(value.act_now, "value is act-now");
        assert_eq!(value.category, "string");
        let max = el.attrs.iter().find(|a| a.name == "maxLength").unwrap();
        assert!(!max.act_now);
        assert_eq!(max.category, "number");
        assert!(el.events.contains(&"onChange".to_owned()));
        assert!(el.events.contains(&"onSelect".to_owned()));
        assert_eq!(el.common, ["identity", "variants"]);
    }

    #[test]
    fn plain_node_has_every_group_and_no_attrs() {
        let el = table("node");
        assert!(el.attrs.is_empty());
        assert_eq!(
            el.common,
            ["identity", "variants", "pointer", "scroll", "wheel"]
        );
    }

    /// A feature element shaped like `<canvas>`: an untyped act-now attribute
    /// (a runtime helper's wire-only command) and one event.
    static WIRE_ONLY: crate::element::Attribute<Vec<u32>> = crate::element::Attribute {
        event: true,
        typed: false,
        ..crate::element::Attribute::new("drawAppend")
    };
    static RESIZE: crate::element::ElementEvent<f32> = crate::element::ElementEvent::new("resize");
    static PAINTER: crate::element::Element = crate::element::Element {
        attrs: &[&WIRE_ONLY],
        events: &[&RESIZE],
        ..crate::element::Element::new("painter")
    };

    #[test]
    fn serializes_camel_case() {
        let v = serde_json::to_value(element(&PAINTER)).unwrap();
        let draw_append = v["attrs"]
            .as_array()
            .unwrap()
            .iter()
            .find(|a| a["name"] == "drawAppend")
            .unwrap();
        assert_eq!(draw_append["actNow"], true);
        assert_eq!(draw_append["typed"], false);
        assert_eq!(v["events"], serde_json::json!(["onResize"]));
    }
}
