//! The devtools editor's style-field table, read off the style registry: the
//! panel requests it once at install (`devtools.styleFields`), so every
//! registered property — an app's own included — is editable, and a bad
//! keyword's warning maps back to its row.

use bevy::prelude::*;
use serde::Serialize;

use crate::ext::ExtRegistry;
use crate::react_request;
use crate::request::Request;
use crate::style::{AnyStyleProperty, StyleRegistry};

/// JS → Bevy: the registered style properties (unit payload).
#[react_request(name = "devtools.styleFields", response = Vec<DevtoolsStyleField>)]
pub(super) struct DevtoolsStyleFieldsGet;

/// One style property as the editor sees it (`api.ts` mirrors the shape).
#[derive(Debug, Serialize, ts_rs::TS)]
pub(super) struct DevtoolsStyleField {
    name: String,
    /// The coarse value shape an edit is pre-validated against (`fields.ts`
    /// `FieldCategory`).
    category: String,
    /// The diag kind a bad keyword warns under (keyword properties only).
    kind: Option<String>,
}

pub(super) fn on_style_fields_request(
    req: On<Request<DevtoolsStyleFieldsGet>>,
    ext: Option<Res<ExtRegistry>>,
) {
    let registry = ext
        .as_deref()
        .unwrap_or(crate::ext::core_registry())
        .styles();
    req.respond(style_fields(registry));
}

fn style_fields(registry: &StyleRegistry) -> Vec<DevtoolsStyleField> {
    registry
        .iter()
        .map(|(_, property)| DevtoolsStyleField {
            name: property.name().to_owned(),
            category: category_of(property).to_owned(),
            kind: property.keyword_kind().map(str::to_owned),
        })
        .collect()
}

/// The editor category of a property, read off its TS type: the checks only
/// guard against structurally wrong values (a wrong-typed value fails the
/// whole edit batch's decode), so anything not recognized is `json` —
/// accepted as-is, Rust has the last word.
fn category_of(property: &dyn AnyStyleProperty) -> &'static str {
    category(property.keyword_kind(), &property.ts_type())
}

/// The editor category of a value with keyword kind `keyword` and TS type
/// `ts` (shared by style properties and element attributes).
pub(super) fn category(keyword: Option<&'static str>, ts: &str) -> &'static str {
    if keyword.is_some() {
        return "keyword";
    }
    let ts = ts
        .strip_prefix("Animatable<")
        .and_then(|t| t.strip_suffix('>'))
        .unwrap_or(ts);
    match ts {
        "number" => "number",
        "boolean" => "boolean",
        "string" => "string",
        "Length" | "FontSize" => "length",
        "Color" => "color",
        "Rect" => "rect",
        _ if is_keyword_union(ts) => "keyword",
        _ => "json",
    }
}

/// A union of string literals, optionally open-ended (`(string & {})`).
fn is_keyword_union(ts: &str) -> bool {
    ts.split('|').map(str::trim).all(|member| {
        (member.len() >= 2 && member.starts_with('"') && member.ends_with('"'))
            || member == "(string & {})"
    })
}

#[cfg(test)]
mod tests {
    use bevy::ecs::world::CommandQueue;
    use tokio::sync::mpsc::unbounded_channel;

    use super::*;
    use crate::ReactAppExt;
    use crate::protocol::outbound::{Outbound, ResponseResult};
    use crate::request::{RawRequest, ReactRequestRegistry};
    use crate::style::props::*;

    fn category(property: &dyn AnyStyleProperty) -> &'static str {
        category_of(property)
    }

    #[test]
    fn categories_follow_the_ts_type() {
        assert_eq!(category(&DISPLAY), "keyword");
        assert_eq!(category(&FONT_WEIGHT), "keyword", "keywords + open string");
        assert_eq!(category(&Z_INDEX), "number");
        assert_eq!(category(&OPACITY), "number", "Animatable<number>");
        assert_eq!(category(&WIDTH), "length");
        assert_eq!(category(&FONT_SIZE), "length");
        assert_eq!(category(&BACKGROUND_COLOR), "color");
        assert_eq!(category(&BORDER_RADIUS), "rect");
        assert_eq!(category(&MARGIN), "rect");
        assert_eq!(category(&LAYOUT_ROUNDING), "boolean");
        assert_eq!(category(&GRID_ROW), "string");
        assert_eq!(category(&SCROLLBAR), "json", "keywords + an object type");
        assert_eq!(category(&FILTER), "json");
    }

    #[test]
    fn keyword_properties_report_their_kind() {
        let fields = style_fields(crate::ext::core_registry().styles());
        let kind = |name: &str| {
            fields
                .iter()
                .find(|f| f.name == name)
                .and_then(|f| f.kind.as_deref())
        };
        assert_eq!(kind("overflowX"), Some("overflow"));
        assert_eq!(kind("textAlign"), Some("textAlign"));
        assert_eq!(kind("width"), None);
        assert_eq!(fields.len(), CORE_STYLES.len());
    }

    /// The request answers with the app's registry — its own properties
    /// included, not just the core's.
    #[test]
    fn request_answers_with_app_properties() {
        static GLOW: crate::style::StyleProperty<f32> = crate::style::StyleProperty::new("glow");
        let mut app = App::new();
        crate::style::add_core_styles(&mut app);
        app.add_react_style(&GLOW)
            .add_react_request_handler(on_style_fields_request);
        let (tx, mut rx) = unbounded_channel();
        app.world_mut()
            .resource_scope(|world, registry: Mut<ReactRequestRegistry>| {
                let mut queue = CommandQueue::default();
                let mut commands = Commands::new(&mut queue, world);
                registry.dispatch(
                    RawRequest {
                        id: 7,
                        name: "devtools.styleFields".into(),
                        value: serde_json::Value::Null,
                    },
                    &tx,
                    &mut commands,
                );
                queue.apply(world);
            });
        let Ok(Outbound::Response {
            id: 7,
            result: ResponseResult::Ok { value },
        }) = rx.try_recv()
        else {
            panic!("expected an Ok response");
        };
        let fields = value.as_array().expect("an array");
        assert_eq!(fields.len(), CORE_STYLES.len() + 1);
        assert!(fields.contains(&serde_json::json!({
            "name": "glow", "category": "number", "kind": null
        })));
        assert!(fields.contains(&serde_json::json!({
            "name": "overflowY", "category": "keyword", "kind": "overflow"
        })));
    }
}
