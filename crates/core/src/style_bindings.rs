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
use crate::svg::ShapeAttrs;

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
///
/// The static-property walk is generated from the property table
/// (`crate::animations::props` — the accessor column knows where each
/// property lives in the style); only the chain walks stay hand-written
/// (dynamic domains). A property missing its accessor would be a silently
/// inert binding, so the maximal-style test below pins every row.
pub(crate) fn derive_bindings(style: Option<&Style>) -> Option<AnimatedBindings> {
    let style = style?;
    let mut out = BTreeMap::new();
    use crate::protocol::Animatable;

    // One rule per accessor shape (see the table's column contract).
    macro_rules! row {
        ($prop:tt, (base $field:ident)) => {
            if let Some(Animatable::Animated { binding: b, .. }) = &style.$field {
                out.insert($prop, b.clone());
            }
        };
        ($prop:tt, (transform $field:ident)) => {
            if let Some(t) = &style.transform
                && let Some(Animatable::Animated { binding: b, .. }) = &t.$field
            {
                out.insert($prop, b.clone());
            }
        };
        ($prop:tt, (t3d $field:ident $($unit:tt)*)) => {
            if let Some(t) = &style.transform3d
                && let Some(Animatable::Animated { binding: b, .. }) = &t.$field
            {
                out.insert($prop, b.clone());
            }
        };
        // `origin.x`/`origin.y` are `Animatable` directly (not `Option`).
        ($prop:tt, (t3d_origin $axis:ident)) => {
            if let Some(t) = &style.transform3d
                && let Some(origin) = &t.origin
                && let Animatable::Animated { binding: b, .. } = &origin.$axis
            {
                out.insert($prop, b.clone());
            }
        };
        // The one animatable field nested inside `backgroundImage` (its
        // `scale` stays static-only for now).
        ($prop:tt, (bg_tint)) => {
            if let Some(bg) = &style.background_image
                && let Some(Animatable::Animated { binding: b, .. }) = &bg.tint
            {
                out.insert($prop, b.clone());
            }
        };
    }
    macro_rules! walk {
        ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
            $(row!($prop, $acc);)*
        };
    }
    crate::animations::props::with_animatable_props!(walk);

    chain_bindings(style.filter.as_ref(), false, &mut out);
    chain_bindings(style.backdrop_filter.as_ref(), true, &mut out);

    (!out.is_empty()).then_some(AnimatedBindings(out))
}

/// Derive bindings from an SVG shape's folded attrs — the shape analog of
/// [`derive_bindings`]: each numeric attr carrying an `{ animated }` wrapper
/// ([`crate::svg::NUMERIC_ATTRS`], the one wire-name table) emits an
/// [`AnimatableProperty::ShapeAttr`](P::ShapeAttr) keyed by the attr's wire
/// name. `None` when the shape carries no wrapper (or there is no shape).
/// Shapes have no hover/press/focus variants, so the base-style-only rule is
/// trivially satisfied — no variant warn needed.
pub(crate) fn derive_shape_bindings(shape: Option<&ShapeAttrs>) -> Option<AnimatedBindings> {
    let shape = shape?;
    let mut out = BTreeMap::new();
    for (name, field, _) in &crate::svg::NUMERIC_ATTRS {
        if let Some(crate::protocol::Animatable::Animated { binding, .. }) = field(shape) {
            out.insert(
                P::ShapeAttr {
                    name: (*name).to_string(),
                },
                binding.clone(),
            );
        }
    }
    (!out.is_empty()).then_some(AnimatedBindings(out))
}

/// The complete binding map of a node's props: the merged base style's
/// wrappers ([`derive_bindings`]) plus the shape attrs' ([`derive_shape_bindings`]).
/// In practice at most one side contributes — shape entities are Node-less
/// and styleless, styled nodes carry no `shape` — but the union keeps the
/// [`AnimatedNode`](crate::animations::AnimatedNode) stamp a single decision:
/// `None` (remove the component) exactly when **both** sides are empty.
pub(crate) fn derive_props_bindings(props: &Props) -> Option<AnimatedBindings> {
    let mut out = derive_bindings(props.style.as_ref()).map_or_else(BTreeMap::new, |b| b.0);
    if let Some(shape) = derive_shape_bindings(props.shape.as_ref()) {
        out.extend(shape.0);
    }
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

    /// The nested `backgroundImage.tint` derives its binding; a static tint
    /// (or a spec-less style) derives nothing.
    #[test]
    fn derives_background_image_tint() {
        let s = style(serde_json::json!({
            "backgroundImage": {
                "src": "bg.png",
                "tint": { "animated": { "id": 9 } },
            },
        }));
        let b = derive_bindings(Some(&s)).expect("bindings derived");
        assert_eq!(b.get(P::BackgroundImageTint), Some(&shared(9)));

        let s = style(serde_json::json!({
            "backgroundImage": { "src": "bg.png", "tint": "#ff0000" },
        }));
        assert!(
            derive_bindings(Some(&s)).is_none(),
            "a static tint derives no bindings"
        );
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

    /// Shape numeric attrs derive `ShapeAttr` bindings keyed by wire name
    /// (camelCase — `strokeWidth`); static attrs and shape-less props derive
    /// nothing; the `has_shape_attrs` gate tracks the map.
    #[test]
    fn derives_shape_attr_bindings_by_wire_name() {
        let shape: crate::svg::ShapeAttrs = serde_json::from_value(serde_json::json!({
            "cx": { "animated": { "id": 3 } },
            "strokeWidth": { "animated": { "id": 4 }, "seed": 2 },
            "r": 10,
        }))
        .unwrap();
        let b = derive_shape_bindings(Some(&shape)).expect("bindings derived");
        assert_eq!(b.0.len(), 2, "exactly the animated attrs derive");
        assert_eq!(b.get(P::ShapeAttr { name: "cx".into() }), Some(&shared(3)));
        assert_eq!(
            b.get(P::ShapeAttr {
                name: "strokeWidth".into()
            }),
            Some(&shared(4)),
            "wire name is the camelCase key, not the field name"
        );
        assert_eq!(b.get(P::ShapeAttr { name: "r".into() }), None, "static");
        assert!(b.has_shape_attrs(), "the gate sees a bound attr");
        assert!(!b.has_filter_params(), "no cross-talk with other gates");

        let static_shape: crate::svg::ShapeAttrs =
            serde_json::from_value(serde_json::json!({ "cx": 1, "r": 2 })).unwrap();
        assert!(
            derive_shape_bindings(Some(&static_shape)).is_none(),
            "all-static attrs derive nothing"
        );
        assert!(derive_shape_bindings(None).is_none());

        let style_only = derive_bindings(Some(&style(
            serde_json::json!({ "opacity": { "animated": { "id": 1 } } }),
        )))
        .unwrap();
        assert!(!style_only.has_shape_attrs(), "gate is false without attrs");
    }

    /// `derive_props_bindings` unions style + shape maps (either side alone
    /// suffices), and is `None` only when both are empty — the single
    /// `AnimatedNode` stamp decision.
    #[test]
    fn props_bindings_union_style_and_shape() {
        let props =
            |v: serde_json::Value| -> crate::protocol::Props { serde_json::from_value(v).unwrap() };
        let both = props(serde_json::json!({
            "style": { "opacity": { "animated": { "id": 1 } } },
            "shape": { "cx": { "animated": { "id": 2 } } },
        }));
        let b = derive_props_bindings(&both).expect("union derived");
        assert_eq!(b.get(P::Opacity), Some(&shared(1)));
        assert_eq!(b.get(P::ShapeAttr { name: "cx".into() }), Some(&shared(2)));

        let shape_only = props(serde_json::json!({
            "shape": { "r": { "animated": { "id": 5 } } },
        }));
        let b = derive_props_bindings(&shape_only).expect("shape alone derives");
        assert_eq!(b.get(P::ShapeAttr { name: "r".into() }), Some(&shared(5)));

        let neither = props(serde_json::json!({
            "style": { "opacity": 0.5 },
            "shape": { "cx": 1 },
        }));
        assert!(
            derive_props_bindings(&neither).is_none(),
            "both-empty removes the stamp"
        );
    }

    /// A style animating EVERY static table row (plus both chains) derives a
    /// binding for every one of the 38 static properties — the permanent belt
    /// against a silently missed accessor (an inert binding, invisible to
    /// type checks). Verified old-vs-new against the hand-written walker at
    /// the table swap; this completeness pin is what remains.
    #[test]
    fn maximal_style_derives_every_static_row() {
        let maximal = serde_json::json!({
            "left": { "animated": { "id": 1 } },
            "right": { "animated": { "id": 2 } },
            "top": { "animated": { "id": 3 } },
            "bottom": { "animated": { "id": 4 } },
            "width": { "animated": { "id": 5 } },
            "height": { "animated": { "id": 6 } },
            "minWidth": { "animated": { "id": 7 } },
            "minHeight": { "animated": { "id": 8 } },
            "maxWidth": { "animated": { "id": 9 } },
            "maxHeight": { "animated": { "id": 10 } },
            "aspectRatio": { "animated": { "id": 11 } },
            "flexBasis": { "animated": { "id": 12 } },
            "gap": { "animated": { "id": 13 } },
            "rowGap": { "animated": { "id": 14 } },
            "columnGap": { "animated": { "id": 15 } },
            "opacity": { "animated": { "id": 16 } },
            "backgroundColor": { "animated": { "type": "interpolateColor", "id": 17,
                "input": [0, 1], "output": [[0, 0, 0, 1], [1, 1, 1, 1]] } },
            "borderColor": { "animated": { "type": "interpolateColor", "id": 18,
                "input": [0, 1], "output": [[0, 0, 0, 1], [1, 1, 1, 1]] } },
            "color": { "animated": { "type": "interpolateColor", "id": 19,
                "input": [0, 1], "output": [[0, 0, 0, 1], [1, 1, 1, 1]] } },
            "transform": {
                "translateX": { "animated": { "id": 20 } },
                "translateY": { "animated": { "id": 21 } },
                "scale": { "animated": { "id": 22 } },
                "scaleX": { "animated": { "id": 23 } },
                "scaleY": { "animated": { "id": 24 } },
                "rotate": { "animated": { "id": 25 } },
            },
            "transform3d": {
                "perspective": { "animated": { "id": 26 } },
                "translateX": { "animated": { "id": 27 } },
                "translateY": { "animated": { "id": 28 } },
                "translateZ": { "animated": { "id": 29 } },
                "rotateX": { "animated": { "id": 30 } },
                "rotateY": { "animated": { "id": 31 } },
                "rotateZ": { "animated": { "id": 32 } },
                "scale": { "animated": { "id": 33 } },
                "scaleX": { "animated": { "id": 34 } },
                "scaleY": { "animated": { "id": 35 } },
                "origin": {
                    "x": { "animated": { "id": 36 } },
                    "y": { "animated": { "id": 37 } },
                },
            },
            "backgroundImage": { "src": "bg.png", "tint": { "animated": { "id": 38 } } },
            "filter": { "name": "blur", "params": { "radius": { "animated": { "id": 39 } } } },
            "backdropFilter": { "name": "blur", "params": { "radius": { "animated": { "id": 40 } } } },
        });
        // Every static row derives from the maximal style — the permanent
        // completeness pin (chains covered by their own arms above).
        let b = derive_bindings(Some(&style(maximal))).expect("maximal style derives");
        macro_rules! rows {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                vec![$($prop),*]
            };
        }
        let all: Vec<P> = crate::animations::props::with_animatable_props!(rows);
        for p in all {
            assert!(b.contains(p.clone()), "static row {p:?} did not derive");
        }
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
