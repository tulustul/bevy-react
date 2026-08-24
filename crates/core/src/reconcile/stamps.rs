//! Props → component stamping: the helpers that mirror a node's wire props
//! into ECS components, shared by the create path (`create.rs`) and the
//! delta-update path (`update.rs`). Each "stamps (or clears)" its component so
//! a re-render converges on exactly the declared props.

use bevy::platform::collections::HashSet;
use bevy::prelude::*;
use bevy::ui::FocusPolicy;
use bevy::ui::RelativeCursorPosition;
use bevy::ui::{ComputedNode, ScrollPosition};

use crate::anchor::{AnchorScaling, Anchored};
use crate::animations::AnimatedNode;
use crate::bridge::{
    ClickOwner, FocusState, HoverState, JsBridge, PointerHandlers, ScrollListener, ScrollStep,
    StyleVariants, WheelListener,
};
use crate::protocol::{NodeId, props::Props, style::Style};
use crate::transition::ScrollTransitionState;

/// Stamp (or clear) the [`AnimatedNode`] bindings on a host element, derived
/// from the merged base style's `{ animated }` wrappers **and** — on an SVG
/// shape child — the numeric shape attrs' (`crate::style_bindings`, one
/// merged map; removed only when both sources are empty). Present → the
/// animations plugin drives the listed props each frame (no-op if animations
/// are disabled — nothing reads the component). Also warns (once per apply,
/// devtools-mirrored) about wrappers in hover/press/focus variants, which are
/// ignored by design.
pub(super) fn apply_animated(ec: &mut EntityCommands, props: &Props) {
    crate::style_bindings::warn_variant_bindings(props);
    match crate::style_bindings::derive_props_bindings(props) {
        Some(bindings) => {
            ec.insert(AnimatedNode(bindings));
        }
        None => {
            ec.remove::<AnimatedNode>();
        }
    }
}

/// Stamp (or clear) the [`Anchored`] binding on a host element. Present → the
/// positioning system projects the target entity's world position to the screen
/// each frame and writes this node's `left`/`top`. A malformed/dead entity id is
/// ignored (the binding is simply not applied).
pub(super) fn apply_anchor(ec: &mut EntityCommands, props: &Props) {
    match &props.anchor {
        Some(anchor) => match Entity::try_from_bits(anchor.entity as u64) {
            Some(target) => {
                let offset = anchor.offset.map(Vec3::from).unwrap_or(Vec3::ZERO);
                ec.insert(Anchored {
                    target,
                    offset,
                    // Sanitized once here so the per-frame scale math can't panic
                    // on JS-supplied NaN/reversed bounds.
                    scale: anchor.scale.and_then(AnchorScaling::sanitized),
                });
            }
            None => {
                ec.remove::<Anchored>();
            }
        },
        None => {
            ec.remove::<Anchored>();
        }
    }
}

/// Stamp (or clear) the hover/press [`StyleVariants`] on a host element. When
/// either variant is present the element also gets an `Interaction` so the focus
/// system tracks hover/press for it; `insert_if_new` leaves any existing
/// `Interaction` untouched (a `button`'s, or a node already mid-hover) so we
/// never reset its state on a re-render.
pub(super) fn apply_style_variants(ec: &mut EntityCommands, props: &Props) {
    if props.hover_style.is_some() || props.press_style.is_some() || props.focus_style.is_some() {
        ec.insert(StyleVariants {
            base: props.style.clone(),
            hover: props.hover_style.clone(),
            press: props.press_style.clone(),
            focus: props.focus_style.clone(),
        });
        // Hover/press are driven by `Interaction`; focus by `FocusState` (toggled
        // by the focus observers). Add each only for the variants present.
        if props.hover_style.is_some() || props.press_style.is_some() {
            ec.insert_if_new(Interaction::default());
        }
        if props.focus_style.is_some() {
            ec.insert_if_new(FocusState::default());
        } else {
            ec.remove::<FocusState>();
        }
    } else {
        ec.remove::<StyleVariants>();
        ec.remove::<FocusState>();
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
pub(super) fn apply_pointer_handlers(ec: &mut EntityCommands, props: &Props) {
    let any_pointer = props.on_pointer_down
        || props.on_pointer_move
        || props.on_pointer_up
        || props.on_pointer_enter
        || props.on_pointer_leave;
    if any_pointer {
        ec.insert(PointerHandlers {
            down: props.on_pointer_down,
            moved: props.on_pointer_move,
            up: props.on_pointer_up,
            enter: props.on_pointer_enter,
            leave: props.on_pointer_leave,
        });
        // `RelativeCursorPosition` supplies the `x`/`y` carried by drag and hover
        // events; the drag-capture and hover systems both read it.
        ec.insert_if_new(RelativeCursorPosition::default());
    } else {
        ec.remove::<PointerHandlers>();
        ec.remove::<RelativeCursorPosition>();
    }
    // `pointerEnter`/`pointerLeave` are derived from `Interaction` transitions, so
    // the node tracks its "inside" state in `HoverState`; add/remove it in step.
    if props.on_pointer_enter || props.on_pointer_leave {
        ec.insert_if_new(HoverState::default());
    } else {
        ec.remove::<HoverState>();
    }
    if props.on_click || any_pointer {
        ec.insert_if_new(Interaction::default());
        ec.insert_if_new(ClickOwner);
    } else {
        // Safe to remove unconditionally: `<button>`/`editableText` own clicks
        // by element type in the collectors, not through this marker.
        ec.remove::<ClickOwner>();
    }
}

/// A nested `<text>` span is a Node-less text run: it has no layout box, so
/// the layer-family styles (`filter`/`backdropFilter`/`morphFilter`/
/// `transform3d`/`cache`) can never promote it — its glyphs render under the
/// enclosing `<text>` block, which is where those styles belong — and it is
/// never a pointer target of its own, so click/pointer handlers on it never
/// fire. Both are structurally silent no-ops; mirror them into devtools (the
/// [`warn_shape_scroll`](super::svg_ops::warn_shape_scroll) pattern) so the
/// surprise is at least visible. Call under the op's `diag::node_scope`.
pub(super) fn warn_span_ignored(props: &Props) {
    for (present, name) in [
        (props.all_styles().any(|s| s.filter.is_some()), "filter"),
        (
            props.all_styles().any(|s| s.backdrop_filter.is_some()),
            "backdropFilter",
        ),
        (
            props.all_styles().any(|s| s.morph_filter.is_some()),
            "morphFilter",
        ),
        (
            props.all_styles().any(|s| s.transform3d.is_some()),
            "transform3d",
        ),
        (props.all_styles().any(|s| s.cache.is_some()), "cache"),
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
    for (present, name) in [
        (props.on_click, "onClick"),
        (props.on_pointer_down, "onPointerDown"),
        (props.on_pointer_move, "onPointerMove"),
        (props.on_pointer_up, "onPointerUp"),
        (props.on_pointer_enter, "onPointerEnter"),
        (props.on_pointer_leave, "onPointerLeave"),
    ] {
        if present {
            crate::diag::report(
                "spanHandlers",
                name,
                &format!(
                    "`{name}` on a nested <text> span never fires — handlers \
                     belong on the enclosing <text>"
                ),
            );
        }
    }
}

/// Toggle the [`ScrollListener`] marker so
/// [`collect_scroll_events`](crate::reconcile::collect_scroll_events) reports
/// this node's `ScrollPosition` changes only while an `onScroll` handler is
/// declared.
pub(super) fn apply_scroll_listener(ec: &mut EntityCommands, props: &Props) {
    if props.on_scroll {
        ec.insert_if_new(ScrollListener);
    } else {
        ec.remove::<ScrollListener>();
    }
}

/// Toggle the [`WheelListener`] marker so [`crate::scroll::collect_wheel_events`]
/// reports raw wheel deltas over this node only while an `onWheel` handler is
/// declared. Independent of `overflow: scroll` — any node can receive the wheel.
pub(super) fn apply_wheel_listener(ec: &mut EntityCommands, props: &Props) {
    if props.on_wheel {
        ec.insert_if_new(WheelListener);
    } else {
        ec.remove::<WheelListener>();
    }
}

/// Stamp (or clear) the per-node [`ScrollStep`] wheel step from `scrollStep`.
pub(super) fn apply_scroll_step(ec: &mut EntityCommands, props: &Props) {
    match props.scroll_step {
        Some(step) => {
            ec.insert(ScrollStep(step));
        }
        None => {
            ec.remove::<ScrollStep>();
        }
    }
}

/// The interactive-element create tail shared by `<canvas>`, `<portal>`, and
/// the generic elements (`spawn_element`): stamp the style variants, pointer
/// handlers, animation bindings, and anchor from the props, in that order.
pub(super) fn stamp_common(ec: &mut EntityCommands, props: &Props) {
    apply_style_variants(ec, props);
    apply_pointer_handlers(ec, props);
    apply_animated(ec, props);
    apply_anchor(ec, props);
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
) {
    if props.scroll_top.is_some() || props.scroll_left.is_some() {
        let pos = Vec2::new(
            props.scroll_left.unwrap_or(0.0),
            props.scroll_top.unwrap_or(0.0),
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

/// `<button>` captures the pointer by default — bevy_ui's native `Button` sets
/// `FocusPolicy::Block`, and we mirror that so a button doesn't leak its click to a
/// sibling, an ancestor, or the 3D scene/portal behind it.
/// [`apply_style`](crate::ui_map::apply_style) defaults
/// every element to `Pass`, so for a button with no explicit `focusPolicy` we
/// re-assert `Block` here. A bare `<node>` keeps `Pass`, so containers/labels stay
/// click-through and don't swallow clicks meant for what's behind or around them.
/// An explicit `focusPolicy` prop (handled in `apply_style`) always wins.
pub(super) fn apply_button_focus_default(ec: &mut EntityCommands, style: &Option<Style>) {
    let has_explicit = style.as_ref().is_some_and(|s| s.focus_policy.is_some());
    if !has_explicit {
        ec.insert(FocusPolicy::Block);
        // Mirror into the picking backend's blocking flag, exactly as
        // `apply_style` does for the `Pass` default (see its `FOCUS_POLICY` doc).
        ec.insert(bevy::picking::Pickable {
            should_block_lower: true,
            is_hoverable: true,
        });
    }
}

/// Add or remove `id` from `set` to mirror a boolean prop.
fn set_membership(set: &mut HashSet<NodeId>, id: NodeId, present: bool) {
    if present {
        set.insert(id);
    } else {
        set.remove(&id);
    }
}

/// Record which optional `editableText` handlers are registered in JS, so the
/// high-frequency `"select"`/`"focus"`/`"blur"` events are only emitted when
/// something is listening. Called on create and on every controlled update.
pub(super) fn register_editable_handlers(bridge: &mut JsBridge, id: NodeId, props: &Props) {
    set_membership(&mut bridge.editable_select_handlers, id, props.on_select);
    set_membership(
        &mut bridge.editable_focus_handlers,
        id,
        props.on_focus || props.on_blur,
    );
}

/// Queue a controlled selection (byte offsets) for
/// [`apply_pending_selections`](crate::reconcile::apply_pending_selections),
/// when both `selectionStart` and `selectionEnd` are supplied. (The JS delta
/// builder keeps the pair coupled: when either changes, both current values are
/// sent, so a delta update never sees half a selection.)
pub(super) fn queue_pending_selection(
    bridge: &mut JsBridge,
    id: NodeId,
    start: Option<usize>,
    end: Option<usize>,
) {
    if let (Some(start), Some(end)) = (start, end) {
        bridge.editable_pending_selection.insert(id, (start, end));
    }
}

#[cfg(test)]
mod tests {
    use super::super::test_util::{op_app, update_delta};
    use super::*;
    use crate::protocol::op::Op;

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

        // A delta that dirties the FOCUS_POLICY group (unsetting the — already
        // absent — `focusPolicy` field) makes `apply_style` reset the bare
        // button to `Pass`; the button default must be re-asserted so it stays
        // `Block`. (A delta touching nothing wouldn't run the group at all.)
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
