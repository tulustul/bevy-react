//! The JSX typing, generated from the element registry: the core elements
//! ([`CORE_ELEMENTS`](crate::elements::CORE_ELEMENTS)) into the `bevy-react`
//! package's committed `js/src/generated/elements.ts` (by the
//! `core_element_ts_is_current` test), an app's own elements (a feature
//! crate's included) into its `bevy.ts` as a `declare module "bevy-react"`
//! augmentation of `BevyIntrinsicElements`
//! ([`render_app_element_augmentation`]).
//!
//! Each element gets one props interface (`Bevy` + PascalCase kind +
//! `Props`) composed of the hand-written group interfaces of its
//! [`Common`] groups (the package's `jsx.d.ts`), `style` for a styled
//! element, its typed attributes (the codec's TS type; required ones without
//! `?`), its events (`on<Name>` taking the payload), its `ref` handle type,
//! and `children`.

use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Write as _;

use super::{Common, Element, handler_prop};
use crate::ext::TextRole;
use crate::ts_codegen::{json_key, type_idents};

/// The props interface name of an element kind: `Bevy` + PascalCase(kind) +
/// `Props` (`editableText` → `BevyEditableTextProps`).
pub(crate) fn props_interface(kind: &str) -> String {
    let mut chars = kind.chars();
    let pascal = match chars.next() {
        Some(first) => format!("{}{}", first.to_uppercase(), chars.as_str()),
        None => String::new(),
    };
    format!("Bevy{pascal}Props")
}

/// Whether `element` is a JSX intrinsic. A text span is not: it is the
/// nested form of its block (`<text>` inside `<text>`), a wire kind the
/// reconciler picks itself.
pub(crate) fn is_intrinsic(element: &Element) -> bool {
    element.flags.text != TextRole::Span
}

/// Whether `element` takes a `style`: every element with a box, plus a text
/// span (its glyph style).
fn styled(element: &Element) -> bool {
    !element.flags.node_less || element.flags.text != TextRole::None
}

/// The hand-written group interfaces (`jsx.d.ts`) `element`'s props extend,
/// one per [`Common`] group.
fn groups(element: &Element) -> Vec<&'static str> {
    let common = element.common;
    let mut out = vec![if common.contains(Common::IDENTITY) {
        "BevyAttributes"
    } else {
        "BevyKeyProps"
    }];
    for (group, name) in [
        (Common::VARIANTS, "BevyVariantProps"),
        (Common::POINTER, "BevyPointerProps"),
        (Common::SCROLL, "BevyScrollProps"),
        (Common::WHEEL, "BevyWheelProps"),
    ] {
        if common.contains(group) {
            out.push(name);
        }
    }
    out
}

/// The named types every props interface may reference beyond its own
/// fields: `BevyStyle`, the group interfaces, and React's `ReactNode`/`Ref`.
const REACT_TYPES: &[&str] = &["ReactNode", "Ref"];

/// Render `element`'s props interface; the ts-rs declarations its attribute
/// and payload types need land in `decls`, the named types it references in
/// `refs`.
pub(crate) fn render_props(
    element: &Element,
    decls: &mut BTreeMap<String, String>,
    refs: &mut BTreeSet<String>,
) -> String {
    let groups = groups(element);
    refs.extend(groups.iter().map(|g| (*g).to_owned()));
    let mut out = format!(
        "export interface {} extends {} {{\n",
        props_interface(element.name),
        groups.join(", ")
    );
    let mut field = |out: &mut String, key: &str, optional: bool, ts: &str| {
        refs.extend(type_idents(ts));
        let q = if optional { "?" } else { "" };
        writeln!(out, "  {}{q}: {ts};", json_key(key)).unwrap();
    };
    if styled(element) {
        field(&mut out, "style", true, "BevyStyle");
    }
    for attr in element.attrs.iter().filter(|a| a.is_typed()) {
        attr.ts_decls(decls);
        let required = element
            .required
            .iter()
            .any(|r| super::attribute::same_attr(*r, *attr));
        field(&mut out, attr.name(), !required, &attr.ts_type());
    }
    for event in element.events {
        let prop = handler_prop(event.name());
        let ts = if event.is_unit() {
            "() => void".to_owned()
        } else {
            event.ts_decls(decls);
            format!("(payload: {}) => void", event.ts_payload())
        };
        field(&mut out, &prop, true, &ts);
    }
    if let Some(handle) = element.ts_ref {
        field(&mut out, "ref", true, &format!("Ref<{handle}>"));
    }
    field(&mut out, "children", true, "ReactNode");
    out.push_str("}\n");
    out
}

/// The `BevyIntrinsicElements` rows of `elements` (the JSX intrinsics among
/// them, sorted by name), one per line at `indent`.
fn intrinsic_rows(elements: &[&Element], indent: &str) -> String {
    let mut rows: Vec<(&str, String)> = elements
        .iter()
        .filter(|e| is_intrinsic(e))
        .map(|e| (e.name, props_interface(e.name)))
        .collect();
    rows.sort();
    let mut out = String::new();
    for (name, iface) in rows {
        writeln!(out, "{indent}{}: {iface};", json_key(name)).unwrap();
    }
    out
}

/// Every props interface of `elements` (sorted by kind), with the
/// declarations and references they need.
fn render_all_props(
    elements: &[&Element],
    decls: &mut BTreeMap<String, String>,
    refs: &mut BTreeSet<String>,
) -> String {
    let mut sorted: Vec<&Element> = elements
        .iter()
        .copied()
        .filter(|e| is_intrinsic(e))
        .collect();
    sorted.sort_by_key(|e| e.name);
    let mut out = String::new();
    for element in sorted {
        out.push('\n');
        out.push_str(&render_props(element, decls, refs));
    }
    out
}

/// The named types `refs` holds that `decls` does not declare, split into
/// React's own and the rest.
fn imports(
    refs: &BTreeSet<String>,
    decls: &BTreeMap<String, String>,
) -> (Vec<String>, Vec<String>) {
    let (react, rest): (Vec<String>, Vec<String>) = refs
        .iter()
        .filter(|r| !decls.contains_key(*r))
        .cloned()
        .partition(|r| REACT_TYPES.contains(&r.as_str()));
    (react, rest)
}

/// What an app's generated `bevy.ts` needs for its own elements (a feature
/// crate's included): the props interfaces and the augmentation block, plus
/// the type imports they need (React's, and the `bevy-react` package's named
/// types). Empty when the app registered no element beyond the core's.
pub(crate) struct AppElementTs {
    /// `import type { … } from "react";` / `"bevy-react"` lines.
    pub(crate) imports: String,
    /// The props interfaces and the `declare module "bevy-react"` block.
    pub(crate) body: String,
}

/// Render an app's own elements for its `bevy.ts`; value/payload types'
/// declarations land in `decls` (the exporter declares them with the rest).
pub(crate) fn render_app_element_augmentation(
    elements: &[&Element],
    decls: &mut BTreeMap<String, String>,
) -> AppElementTs {
    if !elements.iter().any(|e| is_intrinsic(e)) {
        return AppElementTs {
            imports: String::new(),
            body: String::new(),
        };
    }
    let mut refs = BTreeSet::new();
    let props = render_all_props(elements, decls, &mut refs);
    let (react, package) = imports(&refs, decls);
    let mut imports = String::new();
    if !react.is_empty() {
        writeln!(
            imports,
            "import type {{ {} }} from \"react\";",
            react.join(", ")
        )
        .unwrap();
    }
    if !package.is_empty() {
        writeln!(
            imports,
            "import type {{ {} }} from \"bevy-react\";",
            package.join(", ")
        )
        .unwrap();
    }
    let mut body = String::from("/** The app's own elements' props (`app.add_react_element`). */");
    body.push_str(&props);
    body.push_str(
        "\n/** The app's own elements (`app.add_react_element`). Augments the\n\
         \x20*  `BevyIntrinsicElements` interface in the `bevy-react` package, so JSX\n\
         \x20*  types them. */\n\
         declare module \"bevy-react\" {\n\
         \x20 interface BevyIntrinsicElements {\n",
    );
    body.push_str(&intrinsic_rows(elements, "    "));
    body.push_str("  }\n}\n\n");
    AppElementTs { imports, body }
}

/// The core generator: it runs from its test (`npm run elements:generate`
/// rewrites the committed file), never at runtime.
#[cfg(test)]
mod tests {
    use super::*;

    /// The package module (relative to `js/src/generated/`) each named type
    /// the core elements reference is imported from; every other named type
    /// lives in `jsx.d.ts`.
    const TYPE_MODULES: &[(&str, &str)] = &[
        ("Animatable", "../animated"),
        ("BevyCanvasElement", "../canvas"),
        ("CanvasPainter", "../canvas"),
        ("DrawCmd", "../canvas"),
        ("BevyStyle", "./style"),
        ("ReactNode", "react"),
        ("Ref", "react"),
    ];
    const DEFAULT_TYPE_MODULE: &str = "../jsx";

    /// The committed core element typing, relative to the workspace root.
    const CORE_ELEMENT_TS_PATH: &str = "js/src/generated/elements.ts";

    /// The `bevy-react` package's element typing: one props interface per core
    /// element and `BevyIntrinsicElements`, with the imports they need.
    fn render_core_element_ts(elements: &[&Element]) -> String {
        let mut decls = BTreeMap::new();
        let mut refs = BTreeSet::new();
        let props = render_all_props(elements, &mut decls, &mut refs);
        let mut by_module: BTreeMap<&str, BTreeSet<&str>> = BTreeMap::new();
        for name in refs.iter().filter(|r| !decls.contains_key(*r)) {
            let module = TYPE_MODULES
                .iter()
                .find(|(n, _)| n == name)
                .map_or(DEFAULT_TYPE_MODULE, |(_, m)| m);
            by_module.entry(module).or_default().insert(name);
        }
        let mut out = String::from(
            "// @generated by bevy-react from the core element registry (`CORE_ELEMENTS`) —\n\
             // do not edit by hand. Regenerate with `npm run elements:generate`.\n\n",
        );
        for (module, names) in &by_module {
            let names: Vec<&str> = names.iter().copied().collect();
            writeln!(
                out,
                "import type {{ {} }} from {module:?};",
                names.join(", ")
            )
            .unwrap();
        }
        for decl in decls.values() {
            write!(out, "\nexport {decl}\n").unwrap();
        }
        out.push_str(&props);
        out.push_str(
            "\n/** Every host element JSX knows, name → props. An app's own elements\n\
             \x20*  (`app.add_react_element`, a feature crate's included) augment this\n\
             \x20*  interface from its generated `bevy.ts`. */\n\
             export interface BevyIntrinsicElements {\n",
        );
        out.push_str(&intrinsic_rows(elements, "  "));
        out.push_str("}\n");
        out
    }

    /// The committed core element typing matches the registry. Regenerate
    /// with `UPDATE_ELEMENT_TS=1` (`npm run elements:generate`).
    #[test]
    fn core_element_ts_is_current() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../..")
            .join(CORE_ELEMENT_TS_PATH);
        let rendered = render_core_element_ts(crate::elements::CORE_ELEMENTS);
        if std::env::var_os("UPDATE_ELEMENT_TS").is_some() {
            std::fs::create_dir_all(path.parent().unwrap()).unwrap();
            std::fs::write(&path, &rendered).unwrap();
            return;
        }
        let committed = std::fs::read_to_string(&path).unwrap_or_default();
        assert!(
            committed == rendered,
            "{CORE_ELEMENT_TS_PATH} is stale — regenerate with `npm run elements:generate`"
        );
    }

    #[test]
    fn props_interface_names() {
        assert_eq!(props_interface("node"), "BevyNodeProps");
        assert_eq!(props_interface("editableText"), "BevyEditableTextProps");
        assert_eq!(props_interface("svg"), "BevySvgProps");
    }

    mod synthetic {
        use crate::element::{Attribute, Common, Element, ElementEvent};
        use crate::ext::ElementFlags;
        use crate::style::Codec;

        #[derive(Debug, Clone, serde::Serialize, ts_rs::TS)]
        pub struct DialPayload {
            pub turns: f32,
        }

        pub static LEVEL: Attribute<f32> = Attribute::new("level");
        pub static LABEL: Attribute<String> =
            Attribute::with_codec("label", Codec::serde_as("Animatable<Color>"));
        pub static WIRE: Attribute<f32> = Attribute {
            typed: false,
            ..Attribute::new("wire")
        };
        pub static TURN: ElementEvent<DialPayload> = ElementEvent::new("turn");
        pub static PING: ElementEvent<()> = ElementEvent::new("ping");

        pub static DIAL: Element = Element {
            attrs: &[&LEVEL, &LABEL, &WIRE],
            required: &[&LEVEL],
            common: Common::IDENTITY.with(Common::POINTER),
            events: &[&TURN, &PING],
            ..Element::new("dial")
        };

        pub static DOT: Element = Element {
            flags: ElementFlags::NODE_LESS,
            common: Common::POINTER,
            ..Element::new("dot")
        };
    }

    /// An app's own elements render into `bevy.ts`: props interfaces (groups,
    /// required/optional attributes, untyped ones left out, events with their
    /// payloads, no `style` on a node-less element), the
    /// `BevyIntrinsicElements` augmentation, and the imports they need.
    #[test]
    fn app_elements_augment_intrinsics() {
        let mut decls = BTreeMap::new();
        let ts = render_app_element_augmentation(&[&synthetic::DIAL, &synthetic::DOT], &mut decls);
        let body = &ts.body;
        assert!(
            body.contains(
                "export interface BevyDialProps extends BevyAttributes, BevyPointerProps {\n\
                 \x20 style?: BevyStyle;\n\
                 \x20 level: number;\n\
                 \x20 label?: Animatable<Color>;\n\
                 \x20 onTurn?: (payload: DialPayload) => void;\n\
                 \x20 onPing?: () => void;\n\
                 \x20 children?: ReactNode;\n}"
            ),
            "{body}"
        );
        assert!(!body.contains("wire"), "{body}");
        assert!(
            body.contains(
                "export interface BevyDotProps extends BevyKeyProps, BevyPointerProps {\n\
                 \x20 children?: ReactNode;\n}"
            ),
            "{body}"
        );
        assert!(
            body.contains(
                "declare module \"bevy-react\" {\n  interface BevyIntrinsicElements {\n    \
                 dial: BevyDialProps;\n    dot: BevyDotProps;\n  }\n}"
            ),
            "{body}"
        );
        assert!(decls.contains_key("DialPayload"), "{decls:?}");
        assert!(
            ts.imports
                .contains("import type { ReactNode } from \"react\";"),
            "{}",
            ts.imports
        );
        assert!(
            ts.imports.contains(
                "import type { Animatable, BevyAttributes, BevyKeyProps, BevyPointerProps, \
                 BevyStyle, Color } from \"bevy-react\";"
            ),
            "{}",
            ts.imports
        );
    }

    #[test]
    fn no_app_elements_render_nothing() {
        let mut decls = BTreeMap::new();
        let ts = render_app_element_augmentation(&[], &mut decls);
        assert!(ts.body.is_empty() && ts.imports.is_empty());
    }
}
