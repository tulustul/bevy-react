//! [`Props`] — the content/attribute level of a host element — and its
//! dirty/event bookkeeping ([`PropsDirty`], [`UpdateEvents`]).

use std::fmt;

use serde::de::{self, DeserializeSeed, Deserializer, IgnoredAny, MapAccess, Visitor};

use crate::element::{AnyAttribute, AttrDirty, Attrs, Common, DecodeElement, ElementInfo};
use crate::style::{Style, StyleDirty};

/// Props for a host element. Event handlers never cross the boundary — the
/// reconciler replaces them with booleans (e.g. `onClick: true`) and keeps the
/// actual function in a JS-side map. Visual styling lives entirely in
/// [`Style`]; the fields here are the **common** props every element shares
/// (see [`Common`]), plus the element's own registered attributes
/// ([`Self::attrs`]) and event handlers ([`Self::handlers`]).
///
/// Decoding is element-aware (see [`crate::element`]): a key that is
/// neither a common prop nor one of the element's attributes/events warns
/// `unknownProp`, and a common prop outside the element's [`Common`] groups
/// warns `propIgnored` — both dropped.
#[derive(Debug, Clone, Default)]
pub struct Props {
    /// CSS-like layout + visual style, mapped onto `bevy_ui` components.
    /// Inline, like the variants below: a [`Style`] is a small handle (the
    /// sorted entries of the properties it sets), so a box would only add an
    /// allocation.
    pub style: Option<Style>,
    /// Style overlaid on `style` while the element is hovered. Decoded exactly
    /// like `style`; applied on the Bevy side from the node's `Interaction`.
    pub hover_style: Option<Style>,
    /// Style overlaid on `style` (and `hover_style`) while the element is pressed.
    pub press_style: Option<Style>,
    /// Style overlaid on `style` while the element is focused. Applied on the
    /// Bevy side from the node's focus state, so focus styling needs no React
    /// round-trip.
    pub focus_style: Option<Style>,
    /// Whether this element has an `onClick` handler registered in JS.
    pub on_click: bool,
    /// Whether this element has an `onPointerDown` handler registered in JS.
    pub on_pointer_down: bool,
    /// Whether this element has an `onPointerMove` handler registered in JS.
    /// Fires each frame while the pointer is held down (a drag).
    pub on_pointer_move: bool,
    /// Whether this element has an `onPointerUp` handler registered in JS.
    pub on_pointer_up: bool,
    /// Whether this element has an `onPointerEnter` handler registered in JS.
    /// Fires once when the pointer enters the element (hover begins).
    pub on_pointer_enter: bool,
    /// Whether this element has an `onPointerLeave` handler registered in JS.
    /// Fires once when the pointer leaves the element (hover ends).
    pub on_pointer_leave: bool,

    // --- controlled scroll (any node with `overflow: scroll`) ---
    /// Controlled vertical scroll offset (logical px) → `ScrollPosition.y`. On
    /// update it's pushed into the node only when it diverges from the live offset
    /// (so a re-render echoing the user's own wheel scroll is a no-op — see
    /// [`crate::reconcile`]). Each axis is independent; absent leaves it alone.
    pub scroll_top: Option<f32>,
    /// Controlled horizontal scroll offset (logical px) → `ScrollPosition.x`.
    pub scroll_left: Option<f32>,
    /// Logical pixels scrolled per mouse-wheel "line" for this container, overriding
    /// the default. Maps to [`crate::bridge::ScrollStep`]; only scales `Line`-unit
    /// wheels (trackpad `Pixel` deltas are used raw).
    pub scroll_step: Option<f32>,
    /// Whether this element has an `onScroll` handler registered in JS. Present →
    /// the reconciler stamps a [`crate::bridge::ScrollListener`] so the read-back
    /// system reports offset changes (kept cheap by scoping its `Changed` query to
    /// that marker, since `ScrollPosition` is a required component of every `Node`).
    pub on_scroll: bool,
    /// Whether this element has an `onWheel` handler registered in JS. Present →
    /// the reconciler stamps a [`crate::bridge::WheelListener`] so
    /// [`crate::scroll::collect_wheel_events`] reports raw wheel deltas over the
    /// node (any node, unlike `onScroll`, which needs `overflow: scroll`).
    pub on_wheel: bool,

    // --- identity ---
    /// The element's `name` prop: stamped on the entity as a Bevy `Name` and
    /// indexed by name (see [`crate::ReactNodes`]) so app systems can find
    /// React-created entities. Dynamic — a delta replaces the component,
    /// `unset` (or an empty string) removes it. Bridge-owned on React nodes.
    pub name: Option<String>,
    /// The element's shared-element tag (the `shared_tags` module): when a
    /// commit unmounts a tagged node and mounts another with the same tag
    /// (same element type, same UI root), the incoming node starts its
    /// `transition: { sharedElement }` flight from where the outgoing one
    /// visually was. Indexed like `name` (mount order); an empty string
    /// means untagged. Pairing is Rust-side, so the prop crosses as a plain
    /// cached string.
    pub shared_tag: Option<String>,

    // --- the element's own ---
    /// The element's registered attributes (see [`crate::element`]), decoded
    /// against the node's element. Each replaces atomically on a delta; act-now
    /// ones are split off before the props are retained.
    pub attrs: Attrs,
    /// The element events this node has a handler for (bit = the event's
    /// index in the element's `events`).
    pub handlers: u64,
}

/// Which parts of a [`Props`] a delta update touched; drives which of the
/// reconciler's stamps and writers re-run. Style granularity lives in
/// [`StyleDirty`], attribute granularity in [`AttrDirty`].
#[derive(Debug, Default)]
pub struct PropsDirty {
    /// Style properties touched via `style` / `style_unset`.
    pub style: StyleDirty,
    /// The replaced values of the touched properties whose invalidation is
    /// computed per change.
    pub style_old: crate::style::OldValues,
    /// `hoverStyle` set or unset.
    pub hover_style: bool,
    /// `pressStyle` set or unset.
    pub press_style: bool,
    /// `focusStyle` set or unset.
    pub focus_style: bool,
    /// Any of `onClick` / `onPointerDown|Move|Up|Enter|Leave` toggled.
    pub pointer: bool,
    /// `onScroll` toggled.
    pub scroll_listener: bool,
    /// `onWheel` toggled.
    pub wheel: bool,
    /// `scrollStep` changed.
    pub scroll_step: bool,
    /// `name` (the entity's Bevy `Name`) set or unset.
    pub name: bool,
    /// `sharedTag` (the shared-element identity) set or unset.
    pub shared_tag: bool,
    /// The element's attributes set, replaced, or unset.
    pub attrs: AttrDirty,
    /// An element-event handler appeared or went away.
    pub handlers: bool,
}

impl PropsDirty {
    /// Whether the delta can touch the [`crate::bridge::StyleVariants`]
    /// component at all: a variant set/unset, or — since its `base` mirrors
    /// `style` — any style-field change (the stamp helper then decides
    /// between a full re-stamp, an in-place masked base update, or nothing
    /// for a variant-less node).
    pub fn any_style_variant(&self) -> bool {
        self.style.any() || self.hover_style || self.press_style || self.focus_style
    }
}

/// The "act now" props of an update, split from the retained state: pushed
/// into the live widget once and never stored, so an unrelated later delta
/// can't replay them (re-push a controlled value, re-clone a canvas display
/// list). Absent fields mean "no event", exactly like the pre-delta protocol.
#[derive(Debug, Default)]
pub struct UpdateEvents {
    /// Controlled vertical scroll offset.
    pub scroll_top: Option<f32>,
    /// Controlled horizontal scroll offset.
    pub scroll_left: Option<f32>,
    /// The element's act-now attributes (`value`, `draw`, …).
    pub attrs: Attrs,
}

/// A props key, resolved against the decode scope's element.
enum Key {
    Style,
    HoverStyle,
    PressStyle,
    FocusStyle,
    OnClick,
    OnPointerDown,
    OnPointerMove,
    OnPointerUp,
    OnPointerEnter,
    OnPointerLeave,
    OnScroll,
    OnWheel,
    ScrollTop,
    ScrollLeft,
    ScrollStep,
    Name,
    SharedTag,
    Attr(u8, &'static dyn AnyAttribute),
    Handler(u8),
    /// Dropped (already reported when it needed to be).
    Skip,
}

/// A common prop's key and the [`Common`] group an element must declare for
/// it to apply (`None`: every element), or `None` for any other name.
fn common_key(name: &str) -> Option<(Key, Option<Common>)> {
    Some(match name {
        "style" => (Key::Style, None),
        "hoverStyle" => (Key::HoverStyle, Some(Common::VARIANTS)),
        "pressStyle" => (Key::PressStyle, Some(Common::VARIANTS)),
        "focusStyle" => (Key::FocusStyle, Some(Common::VARIANTS)),
        "onClick" => (Key::OnClick, Some(Common::POINTER)),
        "onPointerDown" => (Key::OnPointerDown, Some(Common::POINTER)),
        "onPointerMove" => (Key::OnPointerMove, Some(Common::POINTER)),
        "onPointerUp" => (Key::OnPointerUp, Some(Common::POINTER)),
        "onPointerEnter" => (Key::OnPointerEnter, Some(Common::POINTER)),
        "onPointerLeave" => (Key::OnPointerLeave, Some(Common::POINTER)),
        "onScroll" => (Key::OnScroll, Some(Common::SCROLL)),
        "scrollTop" => (Key::ScrollTop, Some(Common::SCROLL)),
        "scrollLeft" => (Key::ScrollLeft, Some(Common::SCROLL)),
        "scrollStep" => (Key::ScrollStep, Some(Common::SCROLL)),
        "onWheel" => (Key::OnWheel, Some(Common::WHEEL)),
        "name" => (Key::Name, Some(Common::IDENTITY)),
        "sharedTag" => (Key::SharedTag, Some(Common::IDENTITY)),
        _ => return None,
    })
}

/// Whether `name` is a common prop (one every element shares, grouped by
/// [`Common`]) — reserved, so no attribute may take it.
pub(crate) fn is_common_prop(name: &str) -> bool {
    common_key(name).is_some()
}

/// Resolves one props key (borrowing the key string — no allocation for a
/// known key).
struct KeySeed<'a>(Option<&'a DecodeElement>);

impl<'de> DeserializeSeed<'de> for KeySeed<'_> {
    type Value = Key;
    fn deserialize<D: Deserializer<'de>>(self, d: D) -> Result<Key, D::Error> {
        d.deserialize_str(self)
    }
}

impl<'de> Visitor<'de> for KeySeed<'_> {
    type Value = Key;
    fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str("a prop name")
    }
    fn visit_str<E: de::Error>(self, name: &str) -> Result<Key, E> {
        let Some((fixed, group)) = common_key(name) else {
            return Ok(element_key(self.0, name));
        };
        // A common prop outside the element's groups is dropped.
        if let (Some(DecodeElement::Known(info)), Some(group)) = (self.0, group)
            && !info.decl.common.contains(group)
        {
            super::decode_warn(
                "propIgnored",
                name,
                &format!("`{name}` has no effect on <{}>", info.name()),
            );
            return Ok(Key::Skip);
        }
        Ok(fixed)
    }
}

/// Resolve a non-common key against the element: an attribute, an event
/// handler, or unknown (warned — unless the kind itself is unknown, whose
/// props drop silently; the kind is reported once at apply).
fn element_key(element: Option<&DecodeElement>, name: &str) -> Key {
    match element {
        Some(DecodeElement::Known(info)) => {
            if let Some((index, attr)) = info.attr(name) {
                return Key::Attr(index, attr);
            }
            if let Some(index) = info.event_for_prop(name) {
                return Key::Handler(index);
            }
            super::decode_warn(
                "unknownProp",
                name,
                &format!("<{}> has no attribute `{name}`", info.name()),
            );
            Key::Skip
        }
        Some(DecodeElement::Unknown) => Key::Skip,
        None => {
            super::decode_warn(
                "unknownProp",
                name,
                &format!("unknown prop `{name}` (no element in scope)"),
            );
            Key::Skip
        }
    }
}

/// Decode one attribute value through its codec.
struct AttrSeed(&'static dyn AnyAttribute);

impl<'de> DeserializeSeed<'de> for AttrSeed {
    type Value = Option<crate::style::StoredValue>;
    fn deserialize<D: Deserializer<'de>>(self, d: D) -> Result<Self::Value, D::Error> {
        let mut erased = <dyn erased_serde::Deserializer>::erase(d);
        self.0.decode_value(&mut erased).map_err(de::Error::custom)
    }
}

impl<'de> serde::Deserialize<'de> for Props {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct V;
        impl<'de> Visitor<'de> for V {
            type Value = Props;
            fn expecting(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str("a props object")
            }
            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Props, A::Error> {
                let element = crate::element::decode_element();
                let mut props = Props::default();
                while let Some(key) = map.next_key_seed(KeySeed(element.as_ref()))? {
                    match key {
                        Key::Style => props.style = map.next_value()?,
                        Key::HoverStyle => props.hover_style = map.next_value()?,
                        Key::PressStyle => props.press_style = map.next_value()?,
                        Key::FocusStyle => props.focus_style = map.next_value()?,
                        Key::OnClick => props.on_click = flag(&mut map)?,
                        Key::OnPointerDown => props.on_pointer_down = flag(&mut map)?,
                        Key::OnPointerMove => props.on_pointer_move = flag(&mut map)?,
                        Key::OnPointerUp => props.on_pointer_up = flag(&mut map)?,
                        Key::OnPointerEnter => props.on_pointer_enter = flag(&mut map)?,
                        Key::OnPointerLeave => props.on_pointer_leave = flag(&mut map)?,
                        Key::OnScroll => props.on_scroll = flag(&mut map)?,
                        Key::OnWheel => props.on_wheel = flag(&mut map)?,
                        Key::ScrollTop => props.scroll_top = map.next_value()?,
                        Key::ScrollLeft => props.scroll_left = map.next_value()?,
                        Key::ScrollStep => props.scroll_step = map.next_value()?,
                        Key::Name => props.name = map.next_value()?,
                        Key::SharedTag => props.shared_tag = map.next_value()?,
                        Key::Attr(index, attr) => match map.next_value_seed(AttrSeed(attr))? {
                            Some(value) => {
                                props
                                    .attrs
                                    .insert(crate::element::Entry { index, attr, value })
                            }
                            // `null` (or a value its decoder dropped after
                            // reporting it) is absent.
                            None => {
                                props.attrs.remove_index(index);
                            }
                        },
                        Key::Handler(index) => {
                            if flag(&mut map)? {
                                props.handlers |= 1 << index;
                            }
                        }
                        Key::Skip => {
                            map.next_value::<IgnoredAny>()?;
                        }
                    }
                }
                Ok(props)
            }
        }
        d.deserialize_map(V)
    }
}

/// A handler presence flag: `true` present; `false`/`null` absent.
fn flag<'de, A: MapAccess<'de>>(map: &mut A) -> Result<bool, A::Error> {
    Ok(map.next_value::<Option<bool>>()?.unwrap_or(false))
}

impl Props {
    /// Decode `json` as the props of a `kind` element (outside an op — a
    /// harness, a test). Panics on malformed input.
    pub fn decode_for(kind: &str, json: serde_json::Value) -> Box<Props> {
        let _scope = crate::element::DecodeScope::new(kind);
        serde_json::from_value(json).expect("valid props")
    }

    /// The element event handlers present, as the element's event statics.
    pub(crate) fn handler_events(
        &self,
        info: &ElementInfo,
    ) -> Vec<&'static dyn crate::element::AnyElementEvent> {
        info.decl
            .events
            .iter()
            .enumerate()
            .filter(|(i, _)| self.handlers & (1 << i) != 0)
            .map(|(_, e)| *e)
            .collect()
    }
}

/// Test helper shared by the protocol submodules' unit tests: decode a
/// `Props` from a JSON value, panicking on malformed input.
#[cfg(test)]
pub(crate) fn props_from_json(json: serde_json::Value) -> Props {
    props_for("node", json)
}

/// [`Props::merge_delta`] against the core `<node>` element — the test form
/// for deltas that only touch common props and style.
#[cfg(test)]
impl Props {
    pub(crate) fn merge_delta_node(
        &mut self,
        delta: impl Into<Box<Props>>,
        unset: &[String],
        style_unset: &[String],
    ) -> (PropsDirty, UpdateEvents) {
        let info = crate::ext::core_registry()
            .element_info("node")
            .cloned()
            .expect("core <node>");
        self.merge_delta(delta, unset, style_unset, &info)
    }
}

/// [`props_from_json`] for a `kind` element.
#[cfg(test)]
pub(crate) fn props_for(kind: &str, json: serde_json::Value) -> Props {
    crate::ext::install_builtin_registry();
    *Props::decode_for(kind, json)
}

/// `Props` is heap-allocated, default-initialized, decoded and merged **once
/// per Create/Update op**, and `apply_js_ops` cost is linear in its size —
/// measured at ~230 ns/op per KB, flat across 0.4.0/0.5.0/0.6.0 (see
/// `docs/BENCHMARKS.md`). When the struct held four inline typed styles (base +
/// hover/press/focus, one field per property), every property added cost four
/// times here and the translate leg crept +10–18% per release; boxing the
/// variants and the rare heavy payloads took it 6056 → 1792 B. The op's box is
/// passed end to end (never dereferenced into a stack copy). The style
/// registry's sparse store (a 24 B handle — only set properties take space)
/// then took it to 624 B with all four styles inline again. This test fails
/// if a heavy field is inlined.
#[cfg(test)]
#[test]
fn props_stays_small() {
    let size = size_of::<Props>();
    assert!(
        size <= 1024,
        "Props grew to {size} B (>1024 B): every Create/Update op pays for this. \
         Box the new field instead of inlining it — see the `hover_style` docs."
    );
}
