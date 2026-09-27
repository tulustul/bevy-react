//! The delta-merge engine: [`Props::merge_delta`] folds an update op into the
//! cached props and reports what it touched; [`Props::split_events`] strips
//! the act-now event fields.

use super::props::{Props, PropsDirty, UpdateEvents};
use crate::style::{Style, StyleDirty};

impl Props {
    /// Iterate every present style slot: the base [`Self::style`] plus the
    /// hover/press/focus variants, in that order. THE definition of "all
    /// style slots" for presence-based unions (layer promotion's
    /// opacity/filter reasons, the create-time layer-dirty seed) — a new
    /// variant slot extends this once, not each call site.
    pub fn all_styles(&self) -> impl Iterator<Item = &Style> {
        // The base is inline, the variants are boxed (see `Props`), so the two
        // halves are chained rather than listed in one array.
        self.style.as_ref().into_iter().chain(
            [
                self.hover_style.as_ref(),
                self.press_style.as_ref(),
                self.focus_style.as_ref(),
            ]
            .into_iter()
            .flatten(),
        )
    }

    /// Take the event-like fields (see [`UpdateEvents`]) out of `self`,
    /// leaving the retained state in place. Used to seed the per-node props
    /// cache from a create. In place — never moves the (multi-KB) struct.
    pub fn split_events(&mut self) -> UpdateEvents {
        UpdateEvents {
            value: self.value.take(),
            selection_start: self.selection_start.take(),
            selection_end: self.selection_end.take(),
            scroll_top: self.scroll_top.take(),
            scroll_left: self.scroll_left.take(),
            draw: self.draw.take(),
        }
    }

    /// Merge an [`super::op::Op::Update`] delta (`props` + `unset` + `style_unset`) into
    /// `self` (the retained last-applied props), returning what the delta
    /// touched and the event-like fields to act on. See the semantics on
    /// [`super::op::Op::Update`].
    ///
    /// The delta arrives boxed (the op carries it that way) and is consumed
    /// field-wise through `&mut` — the struct is several KB and is never
    /// moved or cloned on this path; `impl Into<Box<Props>>` lets tests pass
    /// a bare `Props` (`From<T> for Box<T>`) at no cost to the hot path.
    pub fn merge_delta(
        &mut self,
        delta: impl Into<Box<Props>>,
        unset: &[String],
        style_unset: &[String],
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
        // Feature-owned keys replace ATOMICALLY (the variant-style precedent
        // above), deliberately not field-wise like `style`: a feature value
        // is one object with one Rust-side consequence (an SVG shape's attrs
        // → a full re-raster of the enclosing `<svg>`), with no per-field
        // writers to save — and atomic replace handles *removal* inside
        // the value correctly by construction (JS sends the complete object
        // whenever anything changed, so a field absent from the new value is
        // a field removed, no `unset` bookkeeping needed). Compare-before-set
        // keeps an idempotent re-send silent, like the rest of the delta.
        for (key, value) in delta.ext.drain() {
            if self.ext.insert(key, value) {
                dirty.ext.push(key);
            }
        }
        // Handler/flag booleans: the delta only ever carries `true` (a handler
        // appeared / a flag turned on); turning one off rides `unset`.
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
            on_change => editable_handlers,
            on_select => editable_handlers,
            on_focus => editable_handlers,
            on_blur => editable_handlers,
            flip_x => image,
            flip_y => image,
        );
        // `multiline`/`autofocus` are create-time only; keep the cache true to
        // the props but no apply work keys off them.
        if delta.multiline {
            self.multiline = true;
        }
        if delta.autofocus {
            self.autofocus = true;
        }
        // `onResize` gates nothing Rust-side (resize events are unconditional);
        // cached only so the delta stays truthful.
        if delta.on_resize {
            self.on_resize = true;
        }
        macro_rules! merge_option {
            ($($f:ident => $($flag:ident)?),* $(,)?) => {
                $(
                    if delta.$f.is_some() {
                        self.$f = delta.$f.take();
                        $( dirty.$flag = true; )?
                    }
                )*
            };
        }
        merge_option!(
            scroll_step => scroll_step,
            anchor => anchor,
            src => image,
            tint => image,
            image_mode => image,
            source_rect => image,
            atlas => image,
            visual_box => image,
            name => name,
            shared_tag => shared_tag,
            target => target,
            aria_label => aria_label,
            max_length => , // create-time only, cached for completeness
        );

        // --- unset: wire names reset to their defaults ---
        for name in unset {
            match name.as_str() {
                "style" => {
                    self.style = None;
                    dirty.style = StyleDirty::ALL;
                }
                "hoverStyle" => {
                    self.hover_style = None;
                    dirty.hover_style = true;
                }
                "pressStyle" => {
                    self.press_style = None;
                    dirty.press_style = true;
                }
                "focusStyle" => {
                    self.focus_style = None;
                    dirty.focus_style = true;
                }
                "onClick" => {
                    self.on_click = false;
                    dirty.pointer = true;
                }
                "onPointerDown" => {
                    self.on_pointer_down = false;
                    dirty.pointer = true;
                }
                "onPointerMove" => {
                    self.on_pointer_move = false;
                    dirty.pointer = true;
                }
                "onPointerUp" => {
                    self.on_pointer_up = false;
                    dirty.pointer = true;
                }
                "onPointerEnter" => {
                    self.on_pointer_enter = false;
                    dirty.pointer = true;
                }
                "onPointerLeave" => {
                    self.on_pointer_leave = false;
                    dirty.pointer = true;
                }
                "onScroll" => {
                    self.on_scroll = false;
                    dirty.scroll_listener = true;
                }
                "onWheel" => {
                    self.on_wheel = false;
                    dirty.wheel = true;
                }
                "onChange" => {
                    self.on_change = false;
                    dirty.editable_handlers = true;
                }
                "onSelect" => {
                    self.on_select = false;
                    dirty.editable_handlers = true;
                }
                "onFocus" => {
                    self.on_focus = false;
                    dirty.editable_handlers = true;
                }
                "onBlur" => {
                    self.on_blur = false;
                    dirty.editable_handlers = true;
                }
                "flipX" => {
                    self.flip_x = false;
                    dirty.image = true;
                }
                "flipY" => {
                    self.flip_y = false;
                    dirty.image = true;
                }
                "multiline" => self.multiline = false,
                "autofocus" => self.autofocus = false,
                "onResize" => self.on_resize = false,
                "scrollStep" => {
                    self.scroll_step = None;
                    dirty.scroll_step = true;
                }
                "anchor" => {
                    self.anchor = None;
                    dirty.anchor = true;
                }
                "src" => {
                    self.src = None;
                    dirty.image = true;
                }
                "tint" => {
                    self.tint = None;
                    dirty.image = true;
                }
                "imageMode" => {
                    self.image_mode = None;
                    dirty.image = true;
                }
                "sourceRect" => {
                    self.source_rect = None;
                    dirty.image = true;
                }
                "atlas" => {
                    self.atlas = None;
                    dirty.image = true;
                }
                "visualBox" => {
                    self.visual_box = None;
                    dirty.image = true;
                }
                "name" => {
                    self.name = None;
                    dirty.name = true;
                }
                "sharedTag" => {
                    self.shared_tag = None;
                    dirty.shared_tag = true;
                }
                "target" => {
                    self.target = None;
                    dirty.target = true;
                }
                "ariaLabel" => {
                    self.aria_label = None;
                    dirty.aria_label = true;
                }
                "maxLength" => self.max_length = None,
                // Event-like props have no retained state to unset; dropping
                // the prop simply stops producing events.
                "value" | "selectionStart" | "selectionEnd" | "scrollTop" | "scrollLeft"
                | "draw" => {
                    tracing::warn!(
                        target: "bevy_react",
                        "event-like prop {name:?} in unset; nothing to reset"
                    );
                }
                // A feature-owned key (`Props::ext`) clears to absent.
                other => match self.ext.remove(other) {
                    Some(key) => dirty.ext.push(key),
                    None => tracing::warn!(
                        target: "bevy_react",
                        "unknown prop {other:?} in unset; ignoring"
                    ),
                },
            }
        }

        // --- style_unset: after the overlay, so a (never-emitted) set+unset of
        // the same field resolves to unset ---
        if !style_unset.is_empty() {
            let style = self.style.get_or_insert_default();
            for name in style_unset {
                if let Some(id) = style.unset_field(name, &mut dirty.style_old) {
                    dirty.style.insert(id);
                }
            }
        }

        (dirty, events)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::animatable::AnimatableField;
    use crate::protocol::props::{Props, props_from_json as props};
    use crate::protocol::units::Length;
    use crate::style::props::{BACKGROUND_COLOR, BACKGROUND_IMAGE, CURSOR, HEIGHT, OUTLINE, WIDTH};
    use crate::style::test_support::runs;
    use crate::style::writers::*;

    /// A delta sets exactly the supplied fields; everything else is preserved.
    #[test]
    fn merge_delta_sets_and_preserves() {
        let mut cached = props(serde_json::json!({
            "style": { "backgroundColor": "red", "outline": { "color": "white" } },
            "hoverStyle": { "backgroundColor": "blue" },
            "onClick": true,
            "src": "a.png",
        }));
        let (dirty, ev) = cached.merge_delta(
            props(serde_json::json!({ "style": { "width": 100 } })),
            &[],
            &[],
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
        assert_eq!(cached.src.as_deref(), Some("a.png"));

        assert!(runs(&dirty.style, &LAYOUT_WRITER));
        assert!(
            !(runs(&dirty.style, &BACKGROUND_COLOR_WRITER) || runs(&dirty.style, &OUTLINE_WRITER)),
            "untouched writers must not re-run"
        );
        assert!(!dirty.hover_style && !dirty.pointer && !dirty.image);
        // `width` is a transitioned channel, so the transition writer re-runs.
        assert!(runs(&dirty.style, &TRANSITION_WRITER));
        assert!(ev.value.is_none() && ev.draw.is_none());
    }

    /// The `name` prop (→ Bevy `Name`) is retained like any string prop: a
    /// delta sets it and flags `dirty.name`; `"name"` in `unset` clears it
    /// (flagging again) so the apply path removes the component.
    #[test]
    fn merge_delta_name_sets_and_unsets() {
        let mut cached = props(serde_json::json!({ "name": "hud" }));
        assert_eq!(cached.name.as_deref(), Some("hud"));

        let (dirty, _) = cached.merge_delta(props(serde_json::json!({ "name": "hud2" })), &[], &[]);
        assert_eq!(cached.name.as_deref(), Some("hud2"));
        assert!(dirty.name);

        let (dirty, _) = cached.merge_delta(props(serde_json::json!({ "src": "a.png" })), &[], &[]);
        assert_eq!(
            cached.name.as_deref(),
            Some("hud2"),
            "untouched name preserved"
        );
        assert!(!dirty.name);

        let (dirty, _) = cached.merge_delta(Props::default(), &["name".to_string()], &[]);
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

        let (dirty, _) = cached.merge_delta(
            props(serde_json::json!({ "sharedTag": "hero-2" })),
            &[],
            &[],
        );
        assert_eq!(cached.shared_tag.as_deref(), Some("hero-2"));
        assert!(dirty.shared_tag);

        let (dirty, _) = cached.merge_delta(props(serde_json::json!({ "src": "a.png" })), &[], &[]);
        assert_eq!(cached.shared_tag.as_deref(), Some("hero-2"));
        assert!(!dirty.shared_tag);

        let (dirty, _) = cached.merge_delta(Props::default(), &["sharedTag".to_string()], &[]);
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
        let (dirty, _) = cached.merge_delta(
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

    /// The bool-flag contract the JS diff relies on (bridge.ts
    /// `BOOL_PROP_KEYS`): a plain-`bool` field can't distinguish an explicit
    /// `false` from absent on the wire, so a `false` in the delta is a no-op —
    /// turning a flag off must ride `unset`, which resets it and dirties its
    /// group.
    #[test]
    fn merge_delta_bool_false_is_noop_off_rides_unset() {
        let mut cached = props(serde_json::json!({ "flipX": true, "flipY": true }));

        // `{"flipX": false}` decodes identically to an absent field: no-op.
        let (dirty, _) = cached.merge_delta(props(serde_json::json!({ "flipX": false })), &[], &[]);
        assert!(cached.flip_x, "explicit false in a delta must not clear");
        assert!(!dirty.image);

        // The off path: `unset` resets the flag and dirties the image group.
        let (dirty, _) = cached.merge_delta(Props::default(), &["flipX".into()], &[]);
        assert!(!cached.flip_x);
        assert!(cached.flip_y, "sibling flag untouched");
        assert!(dirty.image);
    }

    /// `"style"` in `unset` drops the whole style and touches every property.
    #[test]
    fn merge_delta_unsets_style_wholesale() {
        let mut cached = props(serde_json::json!({
            "style": { "backgroundColor": "red", "width": 50 },
        }));
        let (dirty, _) = cached.merge_delta(Props::default(), &["style".into()], &[]);
        assert!(cached.style.is_none());
        assert_eq!(dirty.style, StyleDirty::ALL);
    }

    /// Event-like fields ride out through `UpdateEvents` and are never retained.
    #[test]
    fn merge_delta_events_not_cached() {
        let mut cached = Props::default();
        let (dirty, ev) = cached.merge_delta(
            props(serde_json::json!({
                "value": "hi", "selectionStart": 1, "selectionEnd": 3,
                "scrollTop": 40.0, "scrollLeft": 2.0,
            })),
            &[],
            &[],
        );
        assert_eq!(ev.value.as_deref(), Some("hi"));
        assert_eq!((ev.selection_start, ev.selection_end), (Some(1), Some(3)));
        assert_eq!((ev.scroll_top, ev.scroll_left), (Some(40.0), Some(2.0)));
        assert!(cached.value.is_none() && cached.scroll_top.is_none());
        assert!(cached.selection_start.is_none());
        // Event fields alone dirty nothing.
        assert!(!dirty.style.any() && !dirty.image && !dirty.anchor);
    }

    /// Variant styles replace atomically: a delta `hoverStyle` is the whole new
    /// value, not a merge into the previous one.
    #[test]
    fn merge_delta_replaces_variants_atomically() {
        let mut cached = props(serde_json::json!({
            "hoverStyle": { "backgroundColor": "blue", "width": 10 },
        }));
        let (dirty, _) = cached.merge_delta(
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

    /// Unknown names in `unset`/`style_unset` warn and are ignored — a delta
    /// from a newer/older bundle must never panic the op drain.
    #[test]
    fn merge_delta_ignores_unknown_names() {
        let mut cached = props(serde_json::json!({ "style": { "width": 10 } }));
        let (dirty, _) = cached.merge_delta(
            Props::default(),
            &["nope".into(), "value".into()],
            &["alsoNope".into()],
        );
        assert_eq!(
            cached.style.as_ref().unwrap().get(&WIDTH).static_val(),
            Some(Length::Px(10.0))
        );
        assert!(!dirty.style.any());
    }

    /// Two sequential deltas converge to the same state as one combined delta.
    #[test]
    fn merge_delta_converges() {
        let base = serde_json::json!({
            "style": { "backgroundColor": "red", "width": 10 }, "onClick": true,
        });
        let mut two_steps = props(base.clone());
        two_steps.merge_delta(
            props(serde_json::json!({ "style": { "width": 20 } })),
            &[],
            &[],
        );
        two_steps.merge_delta(
            props(serde_json::json!({ "style": { "height": 5 } })),
            &[],
            &["backgroundColor".into()],
        );

        let mut one_step = props(base);
        one_step.merge_delta(
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

    /// `split_events` strips exactly the event-like fields, leaving state.
    #[test]
    fn split_events_strips_event_fields() {
        let mut state = props(serde_json::json!({
            "style": { "width": 10 }, "onClick": true, "value": "v",
            "selectionStart": 0, "selectionEnd": 1, "scrollTop": 5.0,
        }));
        let ev = state.split_events();
        assert!(state.style.is_some() && state.on_click);
        assert!(state.value.is_none() && state.selection_start.is_none());
        assert!(state.scroll_top.is_none());
        assert_eq!(ev.value.as_deref(), Some("v"));
        assert_eq!(ev.scroll_top, Some(5.0));
    }

    /// `onResize` decodes, merges into the cache, and unsets without warning —
    /// it gates nothing Rust-side, so it dirties nothing.
    #[test]
    fn merge_delta_on_resize_flag() {
        let mut cached = Props::default();
        let (dirty, _) =
            cached.merge_delta(props(serde_json::json!({ "onResize": true })), &[], &[]);
        assert!(cached.on_resize);
        assert!(!dirty.pointer && !dirty.scroll_listener);
        cached.merge_delta(Props::default(), &["onResize".into()], &[]);
        assert!(!cached.on_resize);
    }

    /// `onWheel` sets the `wheel` dirty flag on appearance and clears it on `unset`,
    /// independent of the scroll flags.
    #[test]
    fn merge_delta_wheel_flag() {
        let mut cached = Props::default();
        let (dirty, _) =
            cached.merge_delta(props(serde_json::json!({ "onWheel": true })), &[], &[]);
        assert!(cached.on_wheel);
        assert!(dirty.wheel);
        assert!(!dirty.pointer && !dirty.scroll_listener);

        let (dirty, _) = cached.merge_delta(Props::default(), &["onWheel".into()], &[]);
        assert!(!cached.on_wheel);
        assert!(dirty.wheel);
    }

    /// A `cursor` delta re-runs the cursor writer; a `style` unset of it clears
    /// the field and re-runs it.
    #[test]
    fn merge_delta_cursor_reruns_its_writer() {
        let mut cached = Props::default();
        let (dirty, _) = cached.merge_delta(
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

        let (dirty, _) = cached.merge_delta(Props::default(), &[], &["cursor".into()]);
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
        let (dirty, _) = cached.merge_delta(
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

        let (dirty, _) = cached.merge_delta(Props::default(), &[], &["backgroundImage".into()]);
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
