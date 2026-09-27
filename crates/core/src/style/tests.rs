use bevy::ui::{Display, GridPlacement};

use super::props::*;
use super::*;
use crate::protocol::animatable::Animatable;
use crate::protocol::units::Length;

/// Decode `json` through `prop`'s erased codec, as the registry decoder will.
fn decode<T: PropertyValue>(prop: &StyleProperty<T>, json: &str) -> Option<T> {
    let mut de = serde_json::Deserializer::from_str(json);
    let mut erased = <dyn erased_serde::Deserializer>::erase(&mut de);
    prop.codec.decode(&mut erased).expect("decodes")
}

#[test]
fn core_property_names_are_unique() {
    let mut reg = StyleRegistry::default();
    for p in CORE_STYLES {
        reg.add(*p);
    }
    assert_eq!(reg.len(), CORE_STYLES.len());
    assert_eq!(reg.id("display"), Some(PropId(0)));
    assert_eq!(reg.get("opacity").map(|p| p.name()), Some("opacity"));
}

#[test]
#[should_panic(expected = "registered twice")]
fn duplicate_property_name_panics() {
    static SECOND_WIDTH: StyleProperty<f32> = StyleProperty::new("width");
    let mut reg = StyleRegistry::default();
    reg.add(&WIDTH);
    reg.add(&SECOND_WIDTH);
}

#[test]
fn keyword_codec_decodes_warns_and_accepts_null() {
    assert_eq!(decode(&DISPLAY, "\"grid\""), Some(Display::Grid));
    assert_eq!(decode(&DISPLAY, "null"), None);
    // Unknown keyword: the table's warn-and-default semantics survive the
    // erased path.
    assert_eq!(decode(&DISPLAY, "\"flx\""), Some(Display::default()));
}

#[test]
fn serde_codec_decodes_animatable_and_plain_values() {
    assert_eq!(
        decode(&WIDTH, "12"),
        Some(Animatable::Static(Length::Px(12.0)))
    );
    assert_eq!(decode(&Z_INDEX, "3"), Some(3));
    assert!(matches!(
        decode(&OPACITY, r#"{"animated":{"id":7}}"#),
        Some(Animatable::Animated(_))
    ));
}

#[test]
fn custom_codec_wraps_existing_decoders() {
    assert_eq!(
        decode(&GRID_ROW, "\"1 / 3\""),
        Some(GridPlacement::start_end(1, 3))
    );
    let morph = decode(&MORPH_FILTER, r#"{"key":1,"name":"crossfade"}"#).expect("morph");
    assert_eq!(morph.filter.name, "crossfade");
}

#[test]
fn ts_types_come_from_the_codec() {
    assert_eq!(Z_INDEX.codec.ts_type(), "number");
    assert_eq!(WIDTH.codec.ts_type(), "Animatable<Length>");
    assert_eq!(
        DISPLAY.codec.ts_type(),
        "\"flex\" | \"grid\" | \"block\" | \"none\""
    );
}

#[test]
fn store_reads_and_writes_small_and_large_values() {
    use crate::protocol::transform::Transform3d;
    use crate::style::Style;
    let mut style = Style::default();
    style.set(&OPACITY, Animatable::Static(0.5));
    style.set(&TRANSFORM3D, Transform3d::default());
    assert_eq!(style.get(&OPACITY), Some(&Animatable::Static(0.5)));
    assert_eq!(style.get(&TRANSFORM3D), Some(&Transform3d::default()));
    style.remove(&OPACITY);
    assert_eq!(style.get(&OPACITY), None);
}
