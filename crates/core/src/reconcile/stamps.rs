//! Props → component stamping: the helpers that mirror a node's wire props
//! into ECS components, shared by the create path (`create.rs`) and the
//! delta-update path (`update.rs`). Each "stamps (or clears)" its component so
//! a re-render converges on exactly the declared props; `fresh` (the create
//! path) skips the clears — a freshly spawned entity has nothing to remove.

use bevy::platform::collections::HashSet;
use bevy::prelude::*;
use bevy::ui::RelativeCursorPosition;
use bevy::ui::{ComputedNode, ScrollPosition};

use crate::animations::AnimatedNode;
use crate::bridge::{
    ClickOwner, FocusState, HoverState, JsBridge, PointerHandlers, Restyle, ScrollListener,
    ScrollStep, StyleVariants, WheelListener,
};
use crate::protocol::{
    NodeId,
    props::{Props, PropsDirty, UpdateEvents},
};
use crate::style::Style;
use crate::style::props::{BACKDROP_FILTER, CACHE, FILTER, MORPH_FILTER, TRANSFORM3D};
use crate::transition::ScrollTransitionState;

/// Stamp (or clear) the [`AnimatedNode`] bindings on a host element, derived
/// from the merged base style's `{ animated }` wrappers **and** — on an SVG
/// shape child — the numeric shape attrs' (`crate::style_bindings`, one
/// merged map; removed only when both sources are empty). Present → the
/// animations plugin drives the listed props each frame (no-op if animations
/// are disabled — nothing reads the component). Also warns (once per apply,
/// devtools-mirrored) about wrappers in hover/press/focus variants, which are
/// ignored by design, and about a gradient `transition` spec made inert by
/// gradient bindings on the same surface (bindings park the channel).
///
/// `animated` is the bridge's mirror of which nodes carry the component
/// ([`JsBridge::animated`]): the remove is queued only for a node that had
/// bindings — a style delta on a binding-less node (nearly every node)
/// queues nothing.
pub(crate) fn apply_animated(
    ec: &mut EntityCommands,
    animated: &mut HashSet<NodeId>,
    id: NodeId,
    props: &Props,
    fresh: bool,
) {
    crate::style_bindings::warn_variant_bindings(props);
    let bindings = crate::style_bindings::derive_props_bindings(props);
    crate::style_bindings::warn_gradient_transition_mix(props, bindings.as_ref());
    match bindings {
        Some(bindings) => {
            // The engine's publish slot for feature-owned bindings rides
            // the stamp (see `crate::ext::DrivenExtValues`).
            if bindings.has_ext() {
                ec.insert_if_new(crate::ext::DrivenExtValues::default());
            } else if !fresh {
                ec.remove::<crate::ext::DrivenExtValues>();
            }
            ec.insert(AnimatedNode(bindings));
            animated.insert(id);
        }
        None => {
            if !fresh && !animated.is_empty() && animated.remove(&id) {
                ec.remove::<(AnimatedNode, crate::ext::DrivenExtValues)>();
            }
        }
    }
}

/// Stamp (or clear) the hover/press [`StyleVariants`] on a host element. When
/// either variant is present the element also gets an `Interaction` so the focus
/// system tracks hover/press for it; `insert_if_new` leaves any existing
/// `Interaction` untouched (a `button`'s, or a node already mid-hover) so we
/// never reset its state on a re-render. `base` is the node's effective
/// style (its element's default style overlaid by the user's).
pub(super) fn apply_style_variants(
    ec: &mut EntityCommands,
    props: &Props,
    base: &Option<Style>,
    fresh: bool,
) {
    if props.hover_style.is_some() || props.press_style.is_some() || props.focus_style.is_some() {
        ec.insert(StyleVariants {
            base: base.clone(),
            hover: props.hover_style.clone(),
            press: props.press_style.clone(),
            focus: props.focus_style.clone(),
            keys: variant_keys(props),
            restyle: Restyle::Full,
        });
        // Hover/press are driven by `Interaction`; focus by `FocusState` (toggled
        // by the focus observers). Add each only for the variants present.
        if props.hover_style.is_some() || props.press_style.is_some() {
            ec.insert_if_new(Interaction::default());
        }
        if props.focus_style.is_some() {
            ec.insert_if_new(FocusState::default());
        } else if !fresh {
            ec.remove::<FocusState>();
        }
    } else if !fresh {
        ec.remove::<(StyleVariants, FocusState)>();
    }
}

/// The delta-update form of [`apply_style_variants`]: a variant field in the
/// delta (set or unset) re-stamps/clears the component wholesale; a
/// base-style-only delta on a node that HAS variants updates
/// `StyleVariants.base` in place and records the delta's touched properties
/// ([`Restyle::note_base_delta`]) so the interaction restyle re-runs only
/// their writers — or nothing at all on an idle node; a delta on a node with no
/// variants (and none in the delta) queues nothing.
pub(super) fn apply_style_variants_delta(
    ec: &mut EntityCommands,
    props: &Props,
    base: &Option<Style>,
    dirty: &PropsDirty,
) {
    if !dirty.any_style_variant() {
        return;
    }
    if dirty.hover_style || dirty.press_style || dirty.focus_style {
        apply_style_variants(ec, props, base, false);
        return;
    }
    // Only base properties changed. The component exists exactly when a variant
    // is present (create and the arm above keep that invariant).
    if props.hover_style.is_some() || props.press_style.is_some() || props.focus_style.is_some() {
        let base = base.clone();
        let mask = dirty.style;
        ec.queue(move |mut entity: EntityWorldMut| {
            if let Some(mut variants) = entity.get_mut::<StyleVariants>() {
                variants.base = base;
                variants.restyle.note_base_delta(mask);
            }
        });
    }
}

/// Stamp (or clear) the [`PointerHandlers`] marker plus the components the
/// drag-capture system needs. When any `onPointer*` handler is declared the
/// element also gets a [`RelativeCursorPosition`] (so we can read the cursor's
/// normalized position within it).
///
/// Both `onClick` and the `onPointer*` handlers need an `Interaction` (the
/// drag begin/over test in
/// [`collect_pointer_events`](crate::reconcile::collect_pointer_events), the
/// hover/press-style + [`crate::PointerCapture`] source) **and** a
/// [`ClickOwner`] — the click-*ownership* marker
/// ([`collect_ui_events`](crate::reconcile::collect_ui_events) climbs a picked
/// leaf to the nearest owner). The two are separate on purpose: hover/press
/// styling also inserts an `Interaction`, and a style-only interactive element
/// must never steal a click from an ancestor with a real handler. Without the
/// pair a plain `<node onClick>` — no hover/press style, not a `<button>` —
/// would never be reported as clicked. `insert_if_new` leaves an existing
/// `Interaction` (a `button`'s, or a hover/press variant's) untouched.
pub(crate) fn apply_pointer_handlers(
    ec: &mut EntityCommands,
    props: &Props,
    flags: crate::ext::ElementFlags,
    fresh: bool,
) {
    let any_pointer = props.on_pointer_down
        || props.on_pointer_move
        || props.on_pointer_up
        || props.on_pointer_enter
        || props.on_pointer_leave;
    if any_pointer {
        let handlers = PointerHandlers {
            down: props.on_pointer_down,
            moved: props.on_pointer_move,
            up: props.on_pointer_up,
            enter: props.on_pointer_enter,
            leave: props.on_pointer_leave,
        };
        // `RelativeCursorPosition` supplies the `x`/`y` carried by drag and
        // hover events; the drag-capture and hover systems both read it. An
        // update keeps a live one; a fresh entity takes both in one insert.
        if fresh {
            ec.insert((handlers, RelativeCursorPosition::default()));
        } else {
            ec.insert(handlers)
                .insert_if_new(RelativeCursorPosition::default());
        }
    } else if !fresh {
        ec.remove::<(PointerHandlers, RelativeCursorPosition)>();
    }
    // `pointerEnter`/`pointerLeave` are derived from `Interaction` transitions, so
    // the node tracks its "inside" state in `HoverState`; add/remove it in step.
    if props.on_pointer_enter || props.on_pointer_leave {
        ec.insert_if_new(HoverState::default());
    } else if !fresh {
        ec.remove::<HoverState>();
    }
    if props.on_click || any_pointer {
        ec.insert_if_new((Interaction::default(), ClickOwner));
    } else if !fresh {
        // Safe to remove unconditionally: `<button>`/`editableText` own clicks
        // by element type in the collectors, not through this marker.
        ec.remove::<ClickOwner>();
    }
    if flags.node_less {
        node_less_pointer_slot(ec, props.on_click || any_pointer, fresh);
    }
}

/// A node-less element (an SVG shape) has no box for the collectors to
/// measure: with a pointer handler it carries an [`EventLocalPos`] slot the
/// feature owning its coordinate space fills (the event's `x`/`y`). On full
/// handler removal its `Interaction` goes too — unlike a layout node (where it
/// may serve hover/press styling or a `<button>`), a node-less element's
/// `Interaction` serves its handlers alone, and a leftover would keep
/// stealing clicks an ancestor should own.
///
/// [`EventLocalPos`]: crate::ext::EventLocalPos
fn node_less_pointer_slot(ec: &mut EntityCommands, any: bool, fresh: bool) {
    if any {
        ec.insert_if_new(crate::ext::EventLocalPos::default());
    } else if !fresh {
        ec.remove::<(crate::ext::EventLocalPos, Interaction)>();
    }
}

/// A nested `<text>` span is a Node-less text run: it has no layout box, so
/// the layer-family styles (`filter`/`backdropFilter`/`morphFilter`/
/// `transform3d`/`cache`) can never promote it — its glyphs render under the
/// enclosing `<text>` block, which is where those styles belong. A
/// structurally silent no-op; mirror it into devtools so the surprise is at
/// least visible. Call under the op's `diag::node_scope`.
pub(super) fn warn_span_ignored(props: &Props) {
    for (present, name) in [
        (
            props.all_styles().any(|s| s.get(&FILTER).is_some()),
            "filter",
        ),
        (
            props
                .all_styles()
                .any(|s| s.get(&BACKDROP_FILTER).is_some()),
            "backdropFilter",
        ),
        (
            props.all_styles().any(|s| s.get(&MORPH_FILTER).is_some()),
            "morphFilter",
        ),
        (
            props.all_styles().any(|s| s.get(&TRANSFORM3D).is_some()),
            "transform3d",
        ),
        (props.all_styles().any(|s| s.get(&CACHE).is_some()), "cache"),
    ] {
        if present {
            crate::diag::report(
                "spanLayerStyle",
                name,
                &format!(
                    "`{name}` on a nested <text> span is ignored — a span has no \
                     layout box to capture; put it on the enclosing <text> (or a \
                     wrapping <node>)"
                ),
            );
        }
    }
}

/// A style property the element ignores (only global writers its own writers
/// masked off — or it opted out of — read it: `backgroundImage` on an
/// `<image>`/`<canvas>`/`<portal>`/`<surface>`) warns `styleIgnored`, once per
/// distinct value. Call under the op's `diag::node_scope`.
pub(super) fn warn_ignored_styles(
    info: &crate::element::ElementInfo,
    styles: &crate::style::StyleRegistry,
    props: &Props,
) {
    if !info.ignored_styles.any() {
        return;
    }
    for style in props.all_styles() {
        if !style.keys().intersects(&info.ignored_styles) {
            continue;
        }
        for (property, _) in style.iter() {
            if styles
                .id_of(property)
                .is_some_and(|id| info.ignored_styles.contains(id))
            {
                let name = property.name();
                crate::diag::report(
                    "styleIgnored",
                    name,
                    &format!("`{name}` has no effect on <{}>", info.name()),
                );
            }
        }
    }
}

/// Toggle the [`ScrollListener`] marker so
/// [`collect_scroll_events`](crate::reconcile::collect_scroll_events) reports
/// this node's `ScrollPosition` changes only while an `onScroll` handler is
/// declared.
pub(super) fn apply_scroll_listener(ec: &mut EntityCommands, props: &Props, fresh: bool) {
    if props.on_scroll {
        ec.insert_if_new(ScrollListener);
    } else if !fresh {
        ec.remove::<ScrollListener>();
    }
}

/// Toggle the [`WheelListener`] marker so [`crate::scroll::collect_wheel_events`]
/// reports raw wheel deltas over this node only while an `onWheel` handler is
/// declared. Independent of `overflow: scroll` — any node can receive the wheel.
pub(super) fn apply_wheel_listener(ec: &mut EntityCommands, props: &Props, fresh: bool) {
    if props.on_wheel {
        ec.insert_if_new(WheelListener);
    } else if !fresh {
        ec.remove::<WheelListener>();
    }
}

/// Stamp (or clear) the per-node [`ScrollStep`] wheel step from `scrollStep`.
pub(super) fn apply_scroll_step(ec: &mut EntityCommands, props: &Props, fresh: bool) {
    match props.scroll_step {
        Some(step) => {
            ec.insert(ScrollStep(step));
        }
        None if !fresh => {
            ec.remove::<ScrollStep>();
        }
        None => {}
    }
}

/// The common prop stamps of a freshly spawned element, per the groups its
/// element declares: the style variants (over the effective style `base`),
/// the pointer handlers, and the `{ animated }` bindings (always — style and
/// attribute bindings alike).
///
/// **Create only** — the stamp/clear helpers above with `fresh` set: the entity
/// is freshly spawned, so every "absent → remove" arm is skipped.
pub(crate) fn stamp_common(
    ec: &mut EntityCommands,
    animated: &mut HashSet<NodeId>,
    id: NodeId,
    props: &Props,
    base: &Option<Style>,
    common: crate::element::Common,
    flags: crate::ext::ElementFlags,
) {
    use crate::element::Common;
    if common.contains(Common::VARIANTS) {
        apply_style_variants(ec, props, base, true);
    }
    if common.contains(Common::POINTER) {
        apply_pointer_handlers(ec, props, flags, true);
    }
    apply_animated(ec, animated, id, props, true);
}

/// The properties a node's hover/press/focus variants set.
fn variant_keys(props: &Props) -> crate::style::StyleDirty {
    [&props.hover_style, &props.press_style, &props.focus_style]
        .into_iter()
        .flatten()
        .fold(crate::style::StyleDirty::NONE, |keys, s| {
            keys.union(s.keys())
        })
}

/// Apply a controlled `scrollTop`/`scrollLeft` on **create**: insert the offset
/// (defaulting the uncontrolled axis to 0) and seed [`JsBridge::scroll_positions`]
/// so neither the programmatic write nor the node's mount-frame
/// `Changed<ScrollPosition>` echoes back as an `onScroll`. A listener with no
/// controlled offset is seeded at the default `ZERO` for the same reason.
pub(super) fn create_controlled_scroll(
    bridge: &mut JsBridge,
    ec: &mut EntityCommands,
    id: NodeId,
    props: &Props,
    events: &UpdateEvents,
) {
    if events.scroll_top.is_some() || events.scroll_left.is_some() {
        let pos = Vec2::new(
            events.scroll_left.unwrap_or(0.0),
            events.scroll_top.unwrap_or(0.0),
        );
        // Overrides the `ZERO` that `Node`'s required `ScrollPosition` defaults to.
        // No geometry exists yet to clamp against, so the raw request also gets
        // a post-layout settle (see `PendingControlledScroll`): in-range values
        // settle silently; an overshoot lands on the real max and echoes it.
        ec.insert((
            ScrollPosition(pos),
            crate::scroll::PendingControlledScroll(pos),
        ));
        bridge.scroll_positions.insert(id, pos);
    } else if props.on_scroll {
        bridge.scroll_positions.insert(id, Vec2::ZERO);
    }
}

/// Push a controlled `scrollTop`/`scrollLeft` into a live node on **update**:
/// write only the axis React controls, clamped to the scrollable range, and only
/// when it diverges from the live offset (so a re-render echoing the user's own
/// wheel scroll is a no-op and never snaps the view). Mirrors the controlled
/// `value` diff for `editableText`.
///
/// Records the **requested** (pre-clamp) value in [`JsBridge::scroll_positions`].
/// When the request was in range this equals the written offset, so the read-back
/// dedups it (no echo). When the request overshot, the clamped component value
/// diverges from the recorded request, so the read-back fires one `"scroll"` with
/// the real offset — letting a controlled `scrollTop={BIG}` settle to the true max.
///
/// The clamp here uses **pre-layout** geometry: when the same commit also
/// changed the content (a log appending rows + pinning to the bottom), the
/// stale range lands the write short — or skips it entirely (stale clamp ==
/// live offset). An out-of-range request therefore also parks a
/// [`crate::scroll::PendingControlledScroll`] marker, and
/// [`crate::scroll::settle_controlled_scroll`] redoes the clamp after layout.
///
/// With a scroll transition ([`ScrollTransitionState`] present) the clamped value
/// becomes the eased **target** instead of being written to `ScrollPosition` — the
/// `drive_scroll_transition` system moves the offset toward it. The uncontrolled
/// axis keeps the current target (not the mid-ease position) so it doesn't snap.
pub(super) fn update_controlled_scroll(
    bridge: &mut JsBridge,
    ec: &mut EntityCommands,
    scroll_query: &mut Query<(
        &mut ScrollPosition,
        &ComputedNode,
        Option<&mut ScrollTransitionState>,
    )>,
    e: Entity,
    id: NodeId,
    scroll_left: Option<f32>,
    scroll_top: Option<f32>,
) {
    if scroll_top.is_none() && scroll_left.is_none() {
        return;
    }
    if let Ok((mut pos, computed, scroll_state)) = scroll_query.get_mut(e) {
        // Base on the eased target if a transition owns the offset, else the live one.
        let mut requested = crate::scroll::scroll_base(&pos, scroll_state.as_deref());
        if let Some(x) = scroll_left {
            requested.x = x;
        }
        if let Some(y) = scroll_top {
            requested.y = y;
        }
        let clamped = requested.clamp(Vec2::ZERO, crate::scroll::scroll_range(computed));
        crate::scroll::write_scroll(&mut pos, scroll_state, clamped);
        if requested != clamped {
            // Out of the STALE range — the same commit may have grown the
            // content; redo the clamp after layout (see the doc above).
            ec.insert(crate::scroll::PendingControlledScroll(requested));
        }
        bridge.scroll_positions.insert(id, requested);
    }
}

#[cfg(test)]
mod tests {
    use super::super::test_util::{ent, op_app, update_delta};
    use super::*;
    use crate::protocol::op::Op;
    use bevy::ui::FocusPolicy;

    /// A plain `<node onClick>` — no hover/press style, not a `<button>` — must get
    /// an `Interaction` so `collect_ui_events` can report its clicks. Regression:
    /// `onClick` crossed the wire as a bool but nothing attached an `Interaction`,
    /// so such a node was silently unclickable (only a `<button>`, or a node that
    /// also had a hover/press style or an `onPointer*` handler, worked).
    #[test]
    fn node_onclick_attaches_interaction() {
        let (mut app, ops_tx) = op_app();

        ops_tx
            .send(vec![
                // 1: a bare onClick node — the case that was broken.
                Op::Create {
                    id: 1,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({ "onClick": true })).unwrap(),
                    text: None,
                },
                // 2: a node with no interaction props at all — must stay inert.
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: Box::default(),
                    text: None,
                },
            ])
            .unwrap();
        app.update();

        let nodes = &app.world().resource::<JsBridge>().nodes;
        let (clickable, inert) = (nodes[&1], nodes[&2]);
        assert!(
            app.world().entity(clickable).get::<Interaction>().is_some(),
            "`onClick` alone must make a <node> clickable"
        );
        assert!(
            app.world().entity(inert).get::<Interaction>().is_none(),
            "a node with no handlers/hover/press must not gain an Interaction"
        );
    }

    /// `ClickOwner` tracks handler presence, independent of `Interaction`: a
    /// hover-styled node without handlers is interactive for styling but not
    /// a click owner; toggling `onClick` off drops ownership while the
    /// hover `Interaction` survives.
    #[test]
    fn click_owner_tracks_handlers_not_styling() {
        use crate::bridge::ClickOwner;
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![
                // 1: hover-styled only — interactive, but NOT a click owner.
                Op::Create {
                    id: 1,
                    kind: "node".into(),
                    props: serde_json::from_value(
                        serde_json::json!({ "hoverStyle": { "opacity": 0.5 } }),
                    )
                    .unwrap(),
                    text: None,
                },
                // 2: onClick + hover style — both.
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: serde_json::from_value(
                        serde_json::json!({ "onClick": true, "hoverStyle": { "opacity": 0.5 } }),
                    )
                    .unwrap(),
                    text: None,
                },
            ])
            .unwrap();
        app.update();

        let nodes = app.world().resource::<JsBridge>().nodes.clone();
        let (styled, clickable) = (nodes[&1], nodes[&2]);
        assert!(
            app.world().entity(styled).get::<Interaction>().is_some(),
            "hover styling makes the node interactive"
        );
        assert!(
            app.world().entity(styled).get::<ClickOwner>().is_none(),
            "…but never a click owner"
        );
        assert!(app.world().entity(clickable).get::<ClickOwner>().is_some());

        // Toggling the handler off drops ownership but keeps the hover
        // `Interaction` (the style variant still needs it).
        ops_tx
            .send(vec![update_delta(2, Props::default(), &["onClick"], &[])])
            .unwrap();
        app.update();
        let entity = app.world().entity(clickable);
        assert!(
            entity.get::<ClickOwner>().is_none(),
            "unsetting the last handler drops click ownership"
        );
        assert!(
            entity.get::<Interaction>().is_some(),
            "the hover-style Interaction survives"
        );
    }

    /// A `<text>` root is fully interactive: create stamps the hover/press
    /// variants + handler markers (`stamp_common`), and a delta refreshes
    /// them — same contract as a `<node>`.
    #[test]
    fn text_root_stamps_interactivity() {
        use crate::bridge::ClickOwner;
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "text".into(),
                props: serde_json::from_value(serde_json::json!({
                    "onClick": true,
                    "hoverStyle": { "color": "blue" },
                }))
                .unwrap(),
                text: Some("label".into()),
            }])
            .unwrap();
        app.update();

        let e = app.world().resource::<JsBridge>().nodes[&1];
        let entity = app.world().entity(e);
        assert!(
            entity.get::<StyleVariants>().is_some(),
            "a <text> hoverStyle stamps StyleVariants"
        );
        assert!(entity.get::<Interaction>().is_some());
        assert!(
            entity.get::<ClickOwner>().is_some(),
            "onClick makes the <text> a click owner"
        );

        // A delta adding a pointer handler lands too (the text update branch
        // mirrors the general arm).
        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "onPointerDown": true })).unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();
        assert!(
            app.world()
                .entity(e)
                .get::<PointerHandlers>()
                .is_some_and(|h| h.down),
            "a handler delta must reach a <text> root"
        );
    }

    /// A node with `onPointerEnter`/`onPointerLeave` gets an `Interaction` + a
    /// [`HoverState`], and the reconciler stamps the handler flags.
    #[test]
    fn pointer_enter_leave_stamps_hover_state() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(
                    serde_json::json!({ "onPointerEnter": true, "onPointerLeave": true }),
                )
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();

        let e = app.world().resource::<JsBridge>().nodes[&1];
        let entity = app.world().entity(e);
        assert!(
            entity.get::<Interaction>().is_some(),
            "hover handlers must make the node interactive"
        );
        assert!(
            entity.get::<HoverState>().is_some(),
            "hover handlers must stamp a HoverState"
        );
        let handlers = entity.get::<PointerHandlers>().expect("PointerHandlers");
        assert!(handlers.enter && handlers.leave);
    }

    /// `imageRendering` stamps `ImageRenderingMode` for an explicit mode only:
    /// `"auto"` is passive (no component, like absent), a delta flips it, and
    /// `styleUnset` removes it.
    #[test]
    fn image_rendering_mode_is_stamped_for_explicit_modes_only() {
        use crate::image_rendering::{ImageRendering, ImageRenderingMode};
        let (mut app, ops_tx) = op_app();
        let styled = |mode: &str| -> Box<Props> {
            Box::new(
                serde_json::from_value(serde_json::json!({ "style": { "imageRendering": mode } }))
                    .unwrap(),
            )
        };
        let create = |id: NodeId, props: Box<Props>| Op::Create {
            id,
            kind: "image".into(),
            props,
            text: None,
        };
        ops_tx
            .send(vec![
                create(1, styled("trilinear")),
                create(2, styled("auto")),
                create(3, Box::default()),
            ])
            .unwrap();
        app.update();
        let mode = |app: &App, id: NodeId| -> Option<ImageRendering> {
            app.world()
                .entity(ent(app, id))
                .get::<ImageRenderingMode>()
                .map(|m| m.0)
        };
        assert_eq!(mode(&app, 1), Some(ImageRendering::Trilinear));
        assert_eq!(mode(&app, 2), None, "auto is passive");
        assert_eq!(mode(&app, 3), None);

        ops_tx
            .send(vec![
                update_delta(1, Props::default(), &[], &["imageRendering"]),
                update_delta(3, *styled("nearest"), &[], &[]),
            ])
            .unwrap();
        app.update();
        assert_eq!(mode(&app, 1), None, "styleUnset removes the mode");
        assert_eq!(mode(&app, 3), Some(ImageRendering::Nearest));
    }

    /// `FocusPolicy` defaults differ by element kind: a `<button>` captures the
    /// pointer (`Block`, mirroring bevy_ui's native `Button`), while a `<node>`
    /// passes it through (`Pass`), so a container/label never swallows clicks meant
    /// for what's behind it. An explicit `focusPolicy` prop overrides either, and
    /// re-rendering a button keeps its `Block` (the per-commit `apply_style` resets
    /// it to `Pass` first).
    #[test]
    fn focus_policy_defaults_block_button_pass_node() {
        let (mut app, ops_tx) = op_app();

        let node_props =
            |json: serde_json::Value| -> Props { serde_json::from_value(json).unwrap() };
        ops_tx
            .send(vec![
                // 1: bare button → Block default.
                Op::Create {
                    id: 1,
                    kind: "button".into(),
                    props: Box::default(),
                    text: None,
                },
                // 2: bare node → Pass default.
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: Box::default(),
                    text: None,
                },
                // 3: button with explicit focusPolicy "pass" → overrides the default.
                Op::Create {
                    id: 3,
                    kind: "button".into(),
                    props: Box::new(node_props(
                        serde_json::json!({ "style": { "focusPolicy": "pass" } }),
                    )),
                    text: None,
                },
            ])
            .unwrap();
        app.update();

        let fp = |app: &App, id: u32| -> Option<FocusPolicy> {
            let e = app.world().resource::<JsBridge>().nodes[&id];
            app.world().entity(e).get::<FocusPolicy>().copied()
        };
        // The picking mirror: `Pickable.should_block_lower` must track the policy,
        // because the picking backend (which clicks and all `<surface>` interaction
        // ride) ignores `FocusPolicy` and blocks when `Pickable` is absent.
        let blocks = |app: &App, id: u32| -> Option<bool> {
            let e = app.world().resource::<JsBridge>().nodes[&id];
            app.world()
                .entity(e)
                .get::<bevy::picking::Pickable>()
                .map(|p| p.should_block_lower)
        };
        assert_eq!(
            fp(&app, 1),
            Some(FocusPolicy::Block),
            "button defaults to Block"
        );
        assert_eq!(blocks(&app, 1), Some(true), "button blocks picking too");
        assert_eq!(
            fp(&app, 2),
            Some(FocusPolicy::Pass),
            "node defaults to Pass"
        );
        assert_eq!(blocks(&app, 2), Some(false), "node passes picking too");
        assert_eq!(
            fp(&app, 3),
            Some(FocusPolicy::Pass),
            "explicit focusPolicy overrides the button default"
        );
        assert_eq!(
            blocks(&app, 3),
            Some(false),
            "explicit pass unblocks picking on a button"
        );

        // A delta that re-runs the focus-policy writer (unsetting the —
        // already absent — `focusPolicy` property) must keep the bare button
        // at its kind default, `Block`. (A delta touching nothing wouldn't run
        // the writer at all.)
        ops_tx
            .send(vec![update_delta(
                1,
                Props::default(),
                &[],
                &["focusPolicy"],
            )])
            .unwrap();
        app.update();
        assert_eq!(
            fp(&app, 1),
            Some(FocusPolicy::Block),
            "a re-rendered button keeps its Block default"
        );
        assert_eq!(
            blocks(&app, 1),
            Some(true),
            "a re-rendered button keeps blocking picking"
        );
    }

    /// A node created with a controlled `scrollTop` gets that `ScrollPosition`; an
    /// `onScroll` node gets a `ScrollListener` and is seeded in the dedup map (at
    /// `ZERO` when uncontrolled) so its mount-frame change doesn't echo back.
    #[test]
    fn controlled_scroll_create_sets_position_and_listener() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![
                // controlled offset + an onScroll handler.
                Op::Create {
                    id: 1,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({
                        "scrollTop": 50.0, "onScroll": true,
                        "style": { "overflowY": "scroll" }
                    }))
                    .unwrap(),
                    text: None,
                },
                // listener only (read-only scroll): seeded at ZERO.
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({ "onScroll": true })).unwrap(),
                    text: None,
                },
                // controlled only, no handler → no marker.
                Op::Create {
                    id: 3,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({ "scrollTop": 30.0 }))
                        .unwrap(),
                    text: None,
                },
            ])
            .unwrap();
        app.update();

        let nodes = app.world().resource::<JsBridge>().nodes.clone();
        let (e1, e2, e3) = (nodes[&1], nodes[&2], nodes[&3]);

        assert_eq!(
            app.world().entity(e1).get::<ScrollPosition>().unwrap().0,
            Vec2::new(0.0, 50.0)
        );
        assert!(app.world().entity(e1).get::<ScrollListener>().is_some());
        assert!(app.world().entity(e2).get::<ScrollListener>().is_some());
        assert!(
            app.world().entity(e3).get::<ScrollListener>().is_none(),
            "a controlled node with no onScroll must not be marked"
        );

        let bridge = app.world().resource::<JsBridge>();
        assert_eq!(bridge.scroll_positions.get(&1), Some(&Vec2::new(0.0, 50.0)));
        assert_eq!(bridge.scroll_positions.get(&2), Some(&Vec2::ZERO));
        assert_eq!(bridge.scroll_positions.get(&3), Some(&Vec2::new(0.0, 30.0)));
    }

    /// A controlled `scrollTop` past the scrollable range clamps the written
    /// `ScrollPosition` to the max, while recording the *requested* value so the
    /// read-back can correct React's controlled state down to the real max.
    #[test]
    fn controlled_scroll_update_clamps_to_range() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "onScroll": true, "style": { "overflowY": "scroll" }
                }))
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();

        let e1 = app.world().resource::<JsBridge>().nodes[&1];
        // A laid-out size with real range: content 300, view 100 → max scroll 200.
        app.world_mut().entity_mut(e1).insert(ComputedNode {
            size: Vec2::new(200.0, 100.0),
            content_size: Vec2::new(200.0, 300.0),
            inverse_scale_factor: 1.0,
            ..default()
        });

        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({
                    "onScroll": true, "scrollTop": 10000.0,
                    "style": { "overflowY": "scroll" }
                }))
                .unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();

        assert_eq!(
            app.world().entity(e1).get::<ScrollPosition>().unwrap().0,
            Vec2::new(0.0, 200.0),
            "the written offset is clamped to the scrollable range"
        );
        assert_eq!(
            app.world().resource::<JsBridge>().scroll_positions.get(&1),
            Some(&Vec2::new(0.0, 10000.0)),
            "the requested (pre-clamp) value is recorded so the read-back can correct React"
        );
    }

    /// With a `transition: { scroll }`, a controlled `scrollTop` change sets the eased
    /// `ScrollTransitionState` target instead of snapping `ScrollPosition` — the drive
    /// system (not exercised here) moves the offset toward it.
    #[test]
    fn controlled_scroll_with_transition_sets_target_not_position() {
        let (mut app, ops_tx) = op_app();
        let style = serde_json::json!({
            "overflowY": "scroll", "transition": { "scroll": { "duration": 300 } }
        });
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({ "style": style })).unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();

        let e1 = app.world().resource::<JsBridge>().nodes[&1];
        // A real scroll range so the target isn't clamped away (content 300, view 100).
        app.world_mut().entity_mut(e1).insert(ComputedNode {
            size: Vec2::new(200.0, 100.0),
            content_size: Vec2::new(200.0, 300.0),
            inverse_scale_factor: 1.0,
            ..default()
        });

        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "scrollTop": 80.0, "style": style }))
                    .unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();

        assert_eq!(
            app.world().entity(e1).get::<ScrollPosition>().unwrap().0,
            Vec2::ZERO,
            "a controlled change with a scroll transition must not snap the offset"
        );
        assert_eq!(
            app.world()
                .entity(e1)
                .get::<ScrollTransitionState>()
                .unwrap()
                .target,
            Vec2::new(0.0, 80.0),
            "it sets the eased target instead"
        );
    }
}
