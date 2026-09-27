//! The extension surface: an app registers its own style properties and
//! writers through the same calls the core uses.

use bevy::prelude::*;
use serde::Deserialize;

use super::*;
use crate::ReactAppExt;
use crate::protocol::op::Op;
use crate::protocol::props::Props;
use crate::reconcile::test_util::{ent, op_app_with, update_delta};

#[derive(Debug, Clone, PartialEq, Deserialize, ts_rs::TS)]
struct Glow {
    radius: f32,
}

static GLOW: StyleProperty<Glow> = StyleProperty::new("glow");

/// A property some app writer consumes.
static HALO: StyleProperty<f32> = StyleProperty::new("halo");

#[derive(Component, Debug, PartialEq)]
struct Halo(f32);

static HALO_WRITER: Writer = Writer {
    reads: &[&HALO],
    attrs: &[],
    writes: &[owns::<Halo>],
    apply: |_, s, ec| match s.get(&HALO) {
        Some(r) => {
            ec.insert(Halo(*r));
        }
        None => {
            ec.remove::<Halo>();
        }
    },
};

fn props(json: serde_json::Value) -> Props {
    serde_json::from_value(json).expect("valid props")
}

fn create(id: u32, json: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: "node".into(),
        props: Box::new(props(json)),
        text: None,
    }
}

fn glow_of(app: &App, id: u32) -> Option<f32> {
    app.world()
        .entity(ent(app, id))
        .get::<StyleValue<Glow>>()
        .map(|g| g.0.radius)
}

/// A property no writer reads is stamped as `StyleValue<T>`: present while
/// the style sets it, updated by a delta, removed by an unset.
#[test]
fn app_property_is_auto_stamped() {
    let (mut app, ops_tx) = op_app_with(|app| {
        app.add_react_style(&GLOW);
    });
    ops_tx
        .send(vec![create(
            1,
            serde_json::json!({ "style": { "glow": { "radius": 2.0 } } }),
        )])
        .unwrap();
    app.update();
    assert_eq!(glow_of(&app, 1), Some(2.0));

    ops_tx
        .send(vec![update_delta(
            1,
            props(serde_json::json!({ "style": { "glow": { "radius": 3.0 } } })),
            &[],
            &[],
        )])
        .unwrap();
    app.update();
    assert_eq!(glow_of(&app, 1), Some(3.0));

    ops_tx
        .send(vec![update_delta(1, Props::default(), &[], &["glow"])])
        .unwrap();
    app.update();
    assert_eq!(glow_of(&app, 1), None, "unset removes the component");
}

/// A hover variant overrides a stamped property Bevy-side, like any other.
#[test]
fn stamped_property_follows_hover_variant() {
    let (mut app, ops_tx) = op_app_with(|app| {
        app.add_react_style(&GLOW);
    });
    app.add_systems(
        Update,
        crate::reconcile::apply_interaction_styles.after(crate::reconcile::apply_js_ops),
    );
    ops_tx
        .send(vec![create(
            1,
            serde_json::json!({
                "style": { "glow": { "radius": 1.0 } },
                "hoverStyle": { "glow": { "radius": 5.0 } },
            }),
        )])
        .unwrap();
    app.update();
    let e = ent(&app, 1);
    app.world_mut().entity_mut(e).insert(Interaction::Hovered);
    app.update();
    assert_eq!(glow_of(&app, 1), Some(5.0));
    app.world_mut().entity_mut(e).insert(Interaction::None);
    app.update();
    assert_eq!(glow_of(&app, 1), Some(1.0));
}

/// An app writer turns its property into its own component — and a property
/// a writer reads is not stamped.
#[test]
fn app_writer_writes_its_component() {
    let (mut app, ops_tx) = op_app_with(|app| {
        app.add_react_style(&HALO)
            .add_react_style_writer(&HALO_WRITER);
    });
    ops_tx
        .send(vec![create(
            1,
            serde_json::json!({ "style": { "halo": 4.0 } }),
        )])
        .unwrap();
    app.update();
    let entity = app.world().entity(ent(&app, 1));
    assert_eq!(entity.get::<Halo>(), Some(&Halo(4.0)));
    assert!(entity.get::<StyleValue<f32>>().is_none(), "not stamped");
}

#[test]
#[should_panic(expected = "two style writers write")]
fn writer_claiming_a_core_component_panics() {
    static STEAL: Writer = Writer {
        reads: &[&HALO],
        attrs: &[],
        writes: &[owns::<BackgroundColor>],
        apply: |_, _, _| {},
    };
    let mut app = App::new();
    add_core_styles(&mut app);
    app.add_react_style(&HALO).add_react_style_writer(&STEAL);
}

#[test]
#[should_panic(expected = "both stamped as")]
fn two_stamped_properties_of_one_type_panic() {
    static A: StyleProperty<f32> = StyleProperty::new("a");
    static B: StyleProperty<f32> = StyleProperty::new("b");
    let mut app = App::new();
    add_core_styles(&mut app);
    app.add_react_styles(&[&A, &B]);
    crate::ext::ExtRegistry::from_app(&app).styles().validate();
}

/// An unregistered style key is reported (and ignored) — the rest of the
/// style still decodes.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn unknown_style_key_warns() {
    crate::diag::decode_batch_start();
    let style: Style = serde_json::from_str(r#"{ "nope": 1, "zIndex": 2 }"#).expect("decodes");
    assert_eq!(style.get(&props::Z_INDEX), Some(&2));
    let warnings = crate::diag::take_decode_warnings();
    assert!(
        warnings
            .iter()
            .any(|w| w.kind == "unknownStyleField" && w.value == "nope"),
        "{warnings:?}"
    );
}
