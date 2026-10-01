//! The delta-merge engine: [`Props::merge_delta`] folds an update op into the
//! cached props and reports what it touched; [`Props::split_events`] strips
//! the act-now event fields.

use super::props::{Props, PropsDirty, UpdateEvents};
use crate::element::ElementInfo;
use crate::style::{Style, StyleDirty};

impl Props {
    /// Iterate every present style slot: the base [`Self::style`] plus the
    /// hover/press/focus variants, in that order. THE definition of "all
    /// style slots" for presence-based unions (layer promotion's
    /// opacity/filter reasons, the create-time layer-dirty seed) — a new
    /// variant slot extends this once, not each call site.
    pub fn all_styles(&self) -> impl Iterator<Item = &Style> {
        [
            self.style.as_ref(),
            self.hover_style.as_ref(),
            self.press_style.as_ref(),
            self.focus_style.as_ref(),
        ]
        .into_iter()
        .flatten()
    }

    /// Take the event-like fields (see [`UpdateEvents`]) out of `self`,
    /// leaving the retained state in place. Used to seed the per-node props
    /// cache from a create. In place — never moves the struct.
    pub fn split_events(&mut self) -> UpdateEvents {
        UpdateEvents {
            scroll_top: self.scroll_top.take(),
            scroll_left: self.scroll_left.take(),
            attrs: self.attrs.take_events(),
        }
    }

    /// Merge an [`super::op::Op::Update`] delta (`props` + `unset` + `style_unset`) into
    /// `self` (the retained last-applied props of an `element` node),
    /// returning what the delta touched and the event-like fields to act on.
    /// See the semantics on [`super::op::Op::Update`].
    ///
    /// The delta arrives boxed (the op carries it that way) and is consumed
    /// field-wise through `&mut`; `impl Into<Box<Props>>` lets tests pass a
    /// bare `Props` (`From<T> for Box<T>`) at no cost to the hot path.
    pub fn merge_delta(
        &mut self,
        delta: impl Into<Box<Props>>,
        unset: &[String],
        style_unset: &[String],
        element: &ElementInfo,
    ) -> (PropsDirty, UpdateEvents) {
        let mut dirty = PropsDirty::default();
        let mut delta = delta.into();
        let delta: &mut Props = &mut delta;
        let events = delta.split_events();

        // --- set: fields present in the delta ---
        if let Some(style_delta) = &mut delta.style {
            let touched = self
                .style
                .get_or_insert_default()
                .overlay_delta(style_delta, &mut dirty.style_old);
            dirty.style = dirty.style.union(touched);
        }
        if delta.hover_style.is_some() {
            self.hover_style = delta.hover_style.take();
            dirty.hover_style = true;
        }
        if delta.press_style.is_some() {
            self.press_style = delta.press_style.take();
            dirty.press_style = true;
        }
        if delta.focus_style.is_some() {
            self.focus_style = delta.focus_style.take();
            dirty.focus_style = true;
        }
        // Attributes replace ATOMICALLY per key (the variant-style
        // precedent): compare-before-set keeps an idempotent re-send silent.
        dirty.attrs = self.attrs.overlay_delta(&mut delta.attrs);
        if delta.handlers & !self.handlers != 0 {
            self.handlers |= delta.handlers;
            dirty.handlers = true;
        }
        // Handler booleans: the delta only ever carries `true` (a handler
        // appeared); turning one off rides `unset`.
        macro_rules! merge_bool {
            ($($f:ident => $flag:ident),* $(,)?) => {
                $(
                    if delta.$f {
                        self.$f = true;
                        dirty.$flag = true;
                    }
                )*
            };
        }
        merge_bool!(
            on_click => pointer,
            on_pointer_down => pointer,
            on_pointer_move => pointer,
            on_pointer_up => pointer,
            on_pointer_enter => pointer,
            on_pointer_leave => pointer,
            on_scroll => scroll_listener,
            on_wheel => wheel,
        );
        macro_rules! merge_option {
            ($($f:ident => $flag:ident),* $(,)?) => {
                $(
                    if delta.$f.is_some() {
                        self.$f = delta.$f.take();
                        dirty.$flag = true;
                    }
                )*
            };
        }
        merge_option!(
            scroll_step => scroll_step,
            name => name,
            shared_tag => shared_tag,
        );

        // --- unset: wire names reset to their defaults ---
        // `field = value => dirty flag` rows for the plain resets; the special
        // arms follow the `;`.
        macro_rules! unset_match {
            ($name:expr; $($wire:literal => $field:ident = $value:expr => $flag:ident,)* ; $($rest:tt)*) => {
                match $name {
                    $($wire => {
                        self.$field = $value;
                        dirty.$flag = true;
                    })*
                    $($rest)*
                }
            };
        }
        for name in unset {
            unset_match!(name.as_str();
                "hoverStyle" => hover_style = None => hover_style,
                "pressStyle" => press_style = None => press_style,
                "focusStyle" => focus_style = None => focus_style,
                "onClick" => on_click = false => pointer,
                "onPointerDown" => on_pointer_down = false => pointer,
                "onPointerMove" => on_pointer_move = false => pointer,
                "onPointerUp" => on_pointer_up = false => pointer,
                "onPointerEnter" => on_pointer_enter = false => pointer,
                "onPointerLeave" => on_pointer_leave = false => pointer,
                "onScroll" => on_scroll = false => scroll_listener,
                "onWheel" => on_wheel = false => wheel,
                "scrollStep" => scroll_step = None => scroll_step,
                "name" => name = None => name,
                "sharedTag" => shared_tag = None => shared_tag,
                ;
                "style" => {
                    // Back to the element's default style (none for most).
                    self.style = element.default_style().cloned();
                    dirty.style = StyleDirty::ALL;
                }
                // Event-like props have no retained state to unset.
                "scrollTop" | "scrollLeft" => {}
                other => {
                    if let Some((index, attr)) = element.attr(other) {
                        // An act-now attribute retains nothing to reset.
                        if !attr.is_event() && self.attrs.remove_index(index) {
                            dirty.attrs.insert(index);
                        }
                    } else if let Some(index) = element.event_for_prop(other) {
                        if self.handlers & (1 << index) != 0 {
                            self.handlers &= !(1 << index);
                            dirty.handlers = true;
                        }
                    } else {
                        tracing::debug!(
                            target: "bevy_react",
                            "unknown prop {other:?} in unset; ignoring"
                        );
                    }
                }
            );
        }

        // --- style_unset: after the overlay, so a (never-emitted) set+unset of
        // the same field resolves to unset ---
        if !style_unset.is_empty() {
            let default = element.default_style();
            let style = self.style.get_or_insert_default();
            for name in style_unset {
                if let Some(id) = style.unset_field(name, &mut dirty.style_old) {
                    dirty.style.insert(id);
                    // An unset property falls back to the element's default.
                    if let Some(default) = default {
                        style.restore_default(default, id);
                    }
                }
            }
        }

        (dirty, events)
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use super::*;
    use crate::element::ElementInfo;
    use crate::elements::editable::{SELECTION_END, SELECTION_START, VALUE};
    use crate::elements::image::{FLIP_X, FLIP_Y, SRC};
    use crate::protocol::animatable::AnimatableField;
    use crate::protocol::props::{Props, props_for};
    use crate::protocol::units::Length;
    use crate::style::props::{BACKGROUND_COLOR, BACKGROUND_IMAGE, CURSOR, HEIGHT, OUTLINE, WIDTH};
    use crate::style::test_support::runs;
    use crate::style::writers::*;

    fn info(kind: &str) -> Arc<ElementInfo> {
        crate::ext::core_element_info(kind).expect("a core element")
    }

    /// Decode a `<node>`'s props.
    fn props(json: serde_json::Value) -> Props {
        props_for("node", json)
    }

    /// Merge a `<node>` delta.
    fn merge(
        cached: &mut Props,
        delta: Props,
        unset: &[String],
        style_unset: &[String],
    ) -> (PropsDirty, UpdateEvents) {
        cached.merge_delta(delta, unset, style_unset, &info("node"))
    }

    /// A delta sets exactly the supplied fields; everything else is preserved.
    #[test]
    fn merge_delta_sets_and_preserves() {
        let image = info("image");
        let mut cached = props_for(
            "image",
            serde_json::json!({
                "style": { "backgroundColor": "red", "outline": { "color": "white" } },
                "hoverStyle": { "backgroundColor": "blue" },
                "onClick": true,
                "src": "a.png",
            }),
        );
        let (dirty, ev) = cached.merge_delta(
            props_for("image", serde_json::json!({ "style": { "width": 100 } })),
            &[],
            &[],
            &image,
        );

        let style = cached.style.as_ref().unwrap();
        assert_eq!(style.get(&WIDTH).static_val(), Some(Length::Px(100.0)));
        assert_eq!(
            style
                .get(&BACKGROUND_COLOR)
                .static_ref()
                .map(String::as_str),
            Some("red")
        );
        assert!(
            style.get(&OUTLINE).is_some(),
            "untouched style fields preserved"
        );
        assert!(cached.hover_style.is_some(), "untouched props preserved");
        assert!(cached.on_click);
        assert_eq!(cached.attrs.get(&SRC).map(String::as_str), Some("a.png"));

        assert!(runs(&dirty.style, &LAYOUT_WRITER));
        assert!(
            !(runs(&dirty.style, &BACKGROUND_COLOR_WRITER) || runs(&dirty.style, &OUTLINE_WRITER)),
            "untouched writers must not re-run"
        );
        assert!(!dirty.hover_style && !dirty.pointer && !dirty.attrs.any());
        // `width` is a transitioned channel, so the transition writer re-runs.
        assert!(runs(&dirty.style, &TRANSITION_WRITER));
        assert!(ev.attrs.is_empty());
    }

    /// The `name` prop (→ Bevy `Name`) is retained like any string prop: a
    /// delta sets it and flags `dirty.name`; `"name"` in `unset` clears it
    /// (flagging again) so the apply path removes the component.
    #[test]
    fn merge_delta_name_sets_and_unsets() {
        let mut cached = props(serde_json::json!({ "name": "hud" }));
        assert_eq!(cached.name.as_deref(), Some("hud"));

        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({ "name": "hud2" })),
            &[],
            &[],
        );
        assert_eq!(cached.name.as_deref(), Some("hud2"));
        assert!(dirty.name);

        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({ "onClick": true })),
            &[],
            &[],
        );
        assert_eq!(
            cached.name.as_deref(),
            Some("hud2"),
            "untouched name preserved"
        );
        assert!(!dirty.name);

        let (dirty, _) = merge(&mut cached, Props::default(), &["name".to_string()], &[]);
        assert_eq!(cached.name, None);
        assert!(dirty.name);
    }

    /// The `sharedTag` prop (shared-element identity) is retained like `name`:
    /// a delta sets it and flags `dirty.shared_tag`; `"sharedTag"` in `unset`
    /// clears it (flagging again) so the apply path drops the index entry.
    #[test]
    fn merge_delta_shared_tag_sets_and_unsets() {
        let mut cached = props(serde_json::json!({ "sharedTag": "hero-1" }));
        assert_eq!(cached.shared_tag.as_deref(), Some("hero-1"));

        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({ "sharedTag": "hero-2" })),
            &[],
            &[],
        );
        assert_eq!(cached.shared_tag.as_deref(), Some("hero-2"));
        assert!(dirty.shared_tag);

        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({ "onClick": true })),
            &[],
            &[],
        );
        assert_eq!(cached.shared_tag.as_deref(), Some("hero-2"));
        assert!(!dirty.shared_tag);

        let (dirty, _) = merge(
            &mut cached,
            Props::default(),
            &["sharedTag".to_string()],
            &[],
        );
        assert_eq!(cached.shared_tag, None);
        assert!(dirty.shared_tag);
    }

    /// `unset` resets props (bools to false, options to None); `style_unset`
    /// clears style fields — even when the delta carries no `style` object.
    #[test]
    fn merge_delta_unsets() {
        let mut cached = props(serde_json::json!({
            "style": { "backgroundColor": "red", "width": 50 },
            "hoverStyle": { "backgroundColor": "blue" },
            "onClick": true,
        }));
        let (dirty, _) = merge(
            &mut cached,
            Props::default(),
            &["hoverStyle".into(), "onClick".into()],
            &["backgroundColor".into()],
        );

        let style = cached.style.as_ref().unwrap();
        assert_eq!(style.get(&BACKGROUND_COLOR), None);
        assert_eq!(
            style.get(&WIDTH).static_val(),
            Some(Length::Px(50.0)),
            "other style fields kept"
        );
        assert!(cached.hover_style.is_none());
        assert!(!cached.on_click);
        assert!(runs(&dirty.style, &BACKGROUND_COLOR_WRITER));
        assert!(!runs(&dirty.style, &LAYOUT_WRITER));
        assert!(dirty.hover_style && dirty.pointer);
        assert!(dirty.any_style_variant());
    }

    /// A bool attribute is a real value: an explicit `false` in a delta sets
    /// it (and dirties it), unlike the old presence-only flags; `unset`
    /// removes it.
    #[test]
    fn merge_delta_bool_attribute_false_is_a_value() {
        let image = info("image");
        let mut cached = props_for("image", serde_json::json!({ "flipX": true, "flipY": true }));

        let (dirty, _) = cached.merge_delta(
            props_for("image", serde_json::json!({ "flipX": false })),
            &[],
            &[],
            &image,
        );
        assert_eq!(cached.attrs.get(&FLIP_X), Some(&false));
        assert!(dirty.attrs.any());

        let (dirty, _) = cached.merge_delta(Props::default(), &["flipX".into()], &[], &image);
        assert!(!cached.attrs.contains(&FLIP_X));
        assert_eq!(cached.attrs.get(&FLIP_Y), Some(&true), "sibling untouched");
        assert!(dirty.attrs.any());

        // An identical re-send dirties nothing (compare-before-set).
        let (dirty, _) = cached.merge_delta(
            props_for("image", serde_json::json!({ "flipY": true })),
            &[],
            &[],
            &image,
        );
        assert!(!dirty.attrs.any());
    }

    /// `"style"` in `unset` drops the whole style and touches every property.
    #[test]
    fn merge_delta_unsets_style_wholesale() {
        let mut cached = props(serde_json::json!({
            "style": { "backgroundColor": "red", "width": 50 },
        }));
        let (dirty, _) = merge(&mut cached, Props::default(), &["style".into()], &[]);
        assert!(cached.style.is_none());
        assert_eq!(dirty.style, StyleDirty::ALL);
    }

    /// Act-now fields ride out through `UpdateEvents` and are never retained;
    /// retained attributes (the selection pair) merge like any other.
    #[test]
    fn merge_delta_events_not_cached() {
        let editable = info("editableText");
        let mut cached = Props::default();
        let (dirty, ev) = cached.merge_delta(
            props_for(
                "editableText",
                serde_json::json!({
                    "value": "hi", "selectionStart": 1, "selectionEnd": 3,
                }),
            ),
            &[],
            &[],
            &editable,
        );
        assert_eq!(ev.attrs.get(&VALUE).map(String::as_str), Some("hi"));
        assert!(!cached.attrs.contains(&VALUE));
        assert_eq!(cached.attrs.get(&SELECTION_START), Some(&1));
        assert_eq!(cached.attrs.get(&SELECTION_END), Some(&3));
        assert!(!dirty.style.any());

        // The common controlled scroll offsets are act-now too.
        let mut node = Props::default();
        let (_, ev) = merge(
            &mut node,
            props(serde_json::json!({ "scrollTop": 40.0, "scrollLeft": 2.0 })),
            &[],
            &[],
        );
        assert_eq!((ev.scroll_top, ev.scroll_left), (Some(40.0), Some(2.0)));
        assert!(node.scroll_top.is_none() && node.scroll_left.is_none());
    }

    /// Variant styles replace atomically: a delta `hoverStyle` is the whole new
    /// value, not a merge into the previous one.
    #[test]
    fn merge_delta_replaces_variants_atomically() {
        let mut cached = props(serde_json::json!({
            "hoverStyle": { "backgroundColor": "blue", "width": 10 },
        }));
        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({ "hoverStyle": { "outline": { "color": "white" } } })),
            &[],
            &[],
        );
        let hover = cached.hover_style.as_ref().unwrap();
        assert!(hover.get(&OUTLINE).is_some());
        assert_eq!(
            hover.get(&BACKGROUND_COLOR),
            None,
            "atomic replace, not a merge"
        );
        assert_eq!(hover.get(&WIDTH), None);
        assert!(dirty.hover_style);
    }

    /// Unknown names in `unset`/`style_unset` are ignored — a delta from a
    /// newer/older bundle must never panic the op drain.
    #[test]
    fn merge_delta_ignores_unknown_names() {
        let mut cached = props(serde_json::json!({ "style": { "width": 10 } }));
        let (dirty, _) = merge(
            &mut cached,
            Props::default(),
            &["nope".into(), "value".into(), "scrollTop".into()],
            &["alsoNope".into()],
        );
        assert_eq!(
            cached.style.as_ref().unwrap().get(&WIDTH).static_val(),
            Some(Length::Px(10.0))
        );
        assert!(!dirty.style.any() && !dirty.attrs.any());
    }

    /// Two sequential deltas converge to the same state as one combined delta.
    #[test]
    fn merge_delta_converges() {
        let base = serde_json::json!({
            "style": { "backgroundColor": "red", "width": 10 }, "onClick": true,
        });
        let mut two_steps = props(base.clone());
        merge(
            &mut two_steps,
            props(serde_json::json!({ "style": { "width": 20 } })),
            &[],
            &[],
        );
        merge(
            &mut two_steps,
            props(serde_json::json!({ "style": { "height": 5 } })),
            &[],
            &["backgroundColor".into()],
        );

        let mut one_step = props(base);
        merge(
            &mut one_step,
            props(serde_json::json!({ "style": { "width": 20, "height": 5 } })),
            &[],
            &["backgroundColor".into()],
        );

        let a = two_steps.style.as_ref().unwrap();
        let b = one_step.style.as_ref().unwrap();
        assert_eq!(a.get(&WIDTH), b.get(&WIDTH));
        assert_eq!(a.get(&HEIGHT), b.get(&HEIGHT));
        assert_eq!(a.get(&BACKGROUND_COLOR), b.get(&BACKGROUND_COLOR));
        assert!(two_steps.on_click && one_step.on_click);
    }

    /// `split_events` strips exactly the act-now fields, leaving state.
    #[test]
    fn split_events_strips_event_fields() {
        let mut state = props_for(
            "editableText",
            serde_json::json!({
                "style": { "width": 10 }, "value": "v",
                "selectionStart": 0, "selectionEnd": 1,
            }),
        );
        let ev = state.split_events();
        assert!(state.style.is_some());
        assert!(!state.attrs.contains(&VALUE));
        assert!(state.attrs.contains(&SELECTION_START), "retained");
        assert_eq!(ev.attrs.get(&VALUE).map(String::as_str), Some("v"));

        let mut node = props(serde_json::json!({ "onClick": true, "scrollTop": 5.0 }));
        let ev = node.split_events();
        assert!(node.on_click && node.scroll_top.is_none());
        assert_eq!(ev.scroll_top, Some(5.0));
    }

    /// An element-event handler flag (`onChange`) merges into the handler
    /// bits and `unset` clears it — each flip dirties `handlers`.
    #[test]
    fn merge_delta_element_handlers() {
        let editable = info("editableText");
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
            props_for("editableText", serde_json::json!({ "onChange": true })),
            &[],
            &[],
            &editable,
        );
        assert_ne!(cached.handlers, 0);
        assert!(dirty.handlers);
        let (dirty, _) = cached.merge_delta(
            props_for("editableText", serde_json::json!({ "onChange": true })),
            &[],
            &[],
            &editable,
        );
        assert!(!dirty.handlers, "an identical re-send is silent");
        let (dirty, _) = cached.merge_delta(Props::default(), &["onChange".into()], &[], &editable);
        assert_eq!(cached.handlers, 0);
        assert!(dirty.handlers);
    }

    /// `onWheel` sets the `wheel` dirty flag on appearance and clears it on `unset`,
    /// independent of the scroll flags.
    #[test]
    fn merge_delta_wheel_flag() {
        let mut cached = Props::default();
        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({ "onWheel": true })),
            &[],
            &[],
        );
        assert!(cached.on_wheel);
        assert!(dirty.wheel);
        assert!(!dirty.pointer && !dirty.scroll_listener);

        let (dirty, _) = merge(&mut cached, Props::default(), &["onWheel".into()], &[]);
        assert!(!cached.on_wheel);
        assert!(dirty.wheel);
    }

    /// A `cursor` delta re-runs the cursor writer; a `style` unset of it clears
    /// the field and re-runs it.
    #[test]
    fn merge_delta_cursor_reruns_its_writer() {
        let mut cached = Props::default();
        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({ "style": { "cursor": "pointer" } })),
            &[],
            &[],
        );
        assert_eq!(
            cached
                .style
                .as_ref()
                .unwrap()
                .get(&CURSOR)
                .map(String::as_str),
            Some("pointer")
        );
        assert!(runs(&dirty.style, &CURSOR_WRITER));
        assert!(!runs(&dirty.style, &LAYOUT_WRITER));

        let (dirty, _) = merge(&mut cached, Props::default(), &[], &["cursor".into()]);
        assert_eq!(
            cached
                .style
                .as_ref()
                .unwrap()
                .get(&CURSOR)
                .map(String::as_str),
            None
        );
        assert!(runs(&dirty.style, &CURSOR_WRITER));
    }

    /// A `backgroundImage` delta re-runs its writer; `styleUnset` clears the
    /// property and re-runs it again.
    #[test]
    fn merge_delta_background_image_reruns_its_writer() {
        let mut cached = Props::default();
        let (dirty, _) = merge(
            &mut cached,
            props(serde_json::json!({
                "style": { "backgroundImage": { "src": "bg.png", "mode": "repeat" } }
            })),
            &[],
            &[],
        );
        assert!(
            cached
                .style
                .as_ref()
                .unwrap()
                .get(&BACKGROUND_IMAGE)
                .is_some()
        );
        assert!(runs(&dirty.style, &BACKGROUND_IMAGE_WRITER));
        assert!(!runs(&dirty.style, &LAYOUT_WRITER));

        let (dirty, _) = merge(
            &mut cached,
            Props::default(),
            &[],
            &["backgroundImage".into()],
        );
        assert!(
            cached
                .style
                .as_ref()
                .unwrap()
                .get(&BACKGROUND_IMAGE)
                .is_none()
        );
        assert!(runs(&dirty.style, &BACKGROUND_IMAGE_WRITER));
    }
}
