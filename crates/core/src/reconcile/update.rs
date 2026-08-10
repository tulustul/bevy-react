//! The `Op::Update` path: merge a props delta into the retained per-node
//! props and re-apply exactly the dirty groups, branching per element
//! category (text root/span, editableText, surface, root, general). Also owns
//! [`reapply_opacity_outputs`], the layer evaluator's hook for re-deriving
//! opacity-dependent outputs when a node's promotion state flips.

use bevy::a11y::AccessibilityNode;
use bevy::prelude::*;
use bevy::text::{EditableText, TextEdit};
use bevy::ui::{ComputedNode, ScrollPosition};

use super::apply::resolve;
use super::create::{root_base, surface_root_base};
use super::stamps::{
    apply_anchor, apply_animated, apply_button_focus_default, apply_pointer_handlers,
    apply_scroll_listener, apply_scroll_step, apply_style_variants, apply_wheel_listener,
    queue_pending_selection, register_editable_handlers, update_controlled_scroll,
};
use super::stats::UiAssets;
use crate::bridge::{JsBridge, RNode, SpanKind, StyleVariants};
use crate::canvas::CanvasSurface;
use crate::plugin::Fonts;
use crate::portal::RPortal;
use crate::protocol::{NodeId, Props};
use crate::transition::{ScrollTransitionState, apply_scroll_transition};
use crate::ui_map::{
    apply_atlas, apply_style_masked, image_node_promoted, overlay_style, resolved_text_style,
    text_layout,
};

/// Apply one `Op::Update`: merge the delta into the retained props and
/// re-apply only what it dirtied. Extracted from the `apply_js_ops` match;
/// runs once per update op.
#[allow(clippy::too_many_arguments)]
pub(super) fn apply_update(
    commands: &mut Commands,
    bridge: &mut JsBridge,
    assets: &AssetServer,
    fonts: &Fonts,
    ui_assets: &mut UiAssets,
    children: &Query<&Children>,
    rnodes: &Query<&RNode>,
    buttons: &Query<(), With<Button>>,
    editables: &mut Query<&mut EditableText>,
    scroll_query: &mut Query<(
        &mut ScrollPosition,
        &ComputedNode,
        Option<&mut ScrollTransitionState>,
    )>,
    a11y_nodes: &mut Query<&mut AccessibilityNode>,
    text_roots: &Query<(), With<Node>>,
    id: NodeId,
    props: Props,
    unset: Vec<String>,
    style_unset: Vec<String>,
) {
    let Some(e) = resolve(bridge, id) else {
        return;
    };
    // Attribute apply-time parse warnings to this node (see
    // `crate::diag`); the guard restores the outer scope on any
    // exit from this fn.
    let _diag = crate::diag::node_scope(id);
    // Merge the delta into the retained per-node props, yielding the
    // merged full props, what the delta touched, and the event-like
    // fields to act on.
    //
    // The cache entry is taken OUT of the map for the duration of the
    // fn and re-inserted at the end — the branches below borrow it
    // as `props` while also borrowing `bridge` mutably, and this way
    // no per-update `Props` clone is needed (it measurably showed up
    // in the update benchmarks).
    let mut cached = bridge.props_cache.remove(&id).unwrap_or_else(|| {
        // Only reachable through a bug (create always seeds the
        // cache); merging onto defaults degrades to "delta = the
        // whole truth" rather than crashing.
        warn!("delta update for uncached node {id}; merging onto defaults");
        Box::default()
    });
    let (dirty, ev) = cached.merge_delta(props, &unset, &style_unset);
    let props = cached;
    use crate::protocol::style_groups as g;
    // A delta touching a promotion trigger (`opacity`/`groupAlpha`/
    // `filter`, all in the LAYER group — an `{ animated }` opacity is
    // field presence like any other) or a variant style swap (variants
    // can carry `opacity` and `filter`) re-evaluates this node's layer
    // promotion (see `crate::layer`).
    if dirty.style.intersects(g::LAYER)
        || dirty.hover_style
        || dirty.press_style
        || dirty.focus_style
    {
        bridge.layer_dirty.insert(id);
    }
    if bridge.text_styles.contains_key(&id) {
        // A `<text>` element: refresh its resolved style — but only
        // when a text-style field actually changed (resolution does
        // color parsing + a font lookup, and the raw-span
        // re-propagation below is O(children)).
        let resolved = dirty.style.intersects(g::TEXT).then(|| {
            let style = resolved_text_style(&props.style, fonts);
            bridge.text_styles.insert(id, style.clone());
            style
        });
        let mut ec = commands.entity(e);
        if let Some(style) = &resolved {
            ec.insert(style.clone());
        }
        // A text *root* (has a `Node`) also gets the layout/visual/
        // transform style + transition, mirroring its create path —
        // otherwise a `transform`/`transition` on a `<text>` would only
        // apply on mount and never animate. Spans have no `Node` and are
        // skipped so they never gain a layout box.
        if text_roots.contains(e) {
            // Text elements are never layer-promoted (see
            // `crate::layer::promotion_reasons`).
            apply_style_masked(&mut ec, &props.style, dirty.style, false);
            crate::background_image::apply_background_image(
                &mut ec,
                &props.style,
                dirty.style,
                false,
                assets,
            );
        }
        // Parity quirk preserved: a stale `TextLayout` is never removed
        // when both its fields go absent, only overwritten.
        if dirty.style.intersects(g::TEXT_LAYOUT)
            && let Some(layout) = text_layout(&props.style)
        {
            ec.insert(layout);
        }
        if dirty.anchor {
            apply_anchor(&mut ec, &props);
        }
        // Re-propagate the resolved style to any bare-string children
        // that inherit it (after the last `ec` use — the loop needs
        // `commands` back).
        if let Some(style) = resolved
            && let Ok(kids) = children.get(e)
        {
            for child in kids.iter() {
                if let Ok(rnode) = rnodes.get(child)
                    && bridge.spans.get(&rnode.0) == Some(&SpanKind::RawInherited)
                {
                    commands.entity(child).insert(style.clone());
                }
            }
        }
    } else if bridge.editable_inputs.contains(&id) {
        // Controlled `editableText`: push `value` into the live buffer
        // only when it diverges from what the widget already holds, so
        // a re-render echoing the user's own keystrokes is a no-op and
        // never resets the cursor. Re-applying baseline keeps the
        // `onChange` dedup from echoing this programmatic set back.
        if let Some(new_val) = &ev.value {
            if let Ok(mut editable) = editables.get_mut(e)
                && editable.value().to_string() != *new_val
            {
                editable.editor_mut().set_text(new_val);
                editable.queue_edit(TextEdit::TextEnd(false));
            }
            bridge.editable_values.insert(id, new_val.clone());
        }
        // Handler presence and the controlled selection can change on a
        // re-render; refresh them. The accessible label is kept live too.
        if dirty.editable_handlers {
            register_editable_handlers(bridge, id, &props);
        }
        queue_pending_selection(bridge, id, ev.selection_start, ev.selection_end);
        if dirty.aria_label
            && let Ok(mut node) = a11y_nodes.get_mut(e)
        {
            match &props.aria_label {
                Some(label) => node.set_label(label.clone()),
                None => node.clear_label(),
            }
        }
        let mut ec = commands.entity(e);
        let promoted = bridge.promoted_layers.contains(&id);
        apply_style_masked(&mut ec, &props.style, dirty.style, promoted);
        crate::background_image::apply_background_image(
            &mut ec,
            &props.style,
            dirty.style,
            promoted,
            assets,
        );
        if dirty.any_style_variant() {
            apply_style_variants(&mut ec, &props);
        }
    } else if bridge.surfaces.contains(&id) {
        // A `<surface>` re-render: re-apply the (full-size-defaulted)
        // style and rebind its name. It shares the `target` wire field
        // with `<portal>`, so it must branch before the general path
        // below (which would wrongly stamp an `RPortal`).
        let mut ec = commands.entity(e);
        if dirty.style.any() {
            let style = overlay_style(&surface_root_base(), &props.style);
            // Detached roots are never layer-promoted.
            apply_style_masked(&mut ec, &style, dirty.style, false);
        }
        if dirty.style.intersects(g::BG_IMAGE) {
            crate::background_image::warn_ignored("surface", &props);
        }
        if dirty.target
            && let Some(name) = &props.target
        {
            ec.insert(crate::surface::RSurface(name.clone()));
        }
        if dirty.anchor {
            apply_anchor(&mut ec, &props);
        }
    } else if bridge.roots.contains(&id) {
        // A `<root>` re-render: re-overlay the screen-filling,
        // top-of-stack base (see `root_base`) so a masked re-apply
        // keeps the baked `globalZIndex` instead of stripping it.
        let mut ec = commands.entity(e);
        if dirty.style.any() {
            let style = overlay_style(&root_base(), &props.style);
            // Detached roots are never layer-promoted.
            apply_style_masked(&mut ec, &style, dirty.style, false);
            crate::background_image::apply_background_image(
                &mut ec,
                &style,
                dirty.style,
                false,
                assets,
            );
        }
        if dirty.anchor {
            apply_anchor(&mut ec, &props);
        }
    } else {
        let promoted = bridge.promoted_layers.contains(&id);
        let mut ec = commands.entity(e);
        apply_style_masked(&mut ec, &props.style, dirty.style, promoted);
        // `backgroundImage` — except where the entity's `ImageNode` is
        // element-owned (image/canvas/portal; warned at create).
        if !bridge.foreign_images.contains(&id) {
            crate::background_image::apply_background_image(
                &mut ec,
                &props.style,
                dirty.style,
                promoted,
                assets,
            );
        }
        // Image attributes only ever appear on `image` elements, so
        // their presence is enough to re-apply the texture/tint.
        if dirty.image && is_image(&props) {
            let mut img = image_node_promoted(&props, assets, promoted);
            apply_atlas(
                &mut img,
                &props,
                &mut ui_assets.layouts,
                &mut ui_assets.atlas_cache,
            );
            ec.insert(img);
            // Image attrs dirty without any style dirt (e.g. a bare
            // `src` swap) bypasses the `apply_style_masked` tap.
            crate::layer::mark_content_dirty(&mut ec);
        }
        // A `<canvas>`'s new declarative display list: clear + replay
        // on the retained surface. Queued (not re-inserted) so the
        // surface's retained pixmap and pending imperative commands
        // aren't thrown away with the component.
        if let Some(cmds) = ev.draw {
            ec.queue(move |mut entity: EntityWorldMut| {
                if let Some(mut surface) = entity.get_mut::<CanvasSurface>() {
                    surface.set_display_list(cmds);
                }
            });
        }
        // A `<portal>`'s new target name: rebind it (the binding system
        // points its `ImageNode` at the new target next frame).
        if dirty.target
            && let Some(target) = &props.target
        {
            ec.insert(RPortal(target.clone()));
        }
        // When `apply_style_masked` reset this entity's `FocusPolicy` to
        // the `Pass` default, re-assert a button's `Block` (no-op /
        // `Pass` for plain nodes). Skipped when the mask skipped the
        // `FocusPolicy` insert — nothing reset it.
        if dirty.style.intersects(g::FOCUS_POLICY) && buttons.get(e).is_ok() {
            apply_button_focus_default(&mut ec, &props.style);
        }
        // `StyleVariants.base` mirrors the (merged) base style, so any
        // style change rebuilds it. Skipping when untouched also avoids
        // a spurious `Changed<StyleVariants>` → full restyle merge from
        // `apply_interaction_styles` on every unrelated update.
        if dirty.any_style_variant() {
            apply_style_variants(&mut ec, &props);
        }
        if dirty.pointer {
            apply_pointer_handlers(&mut ec, &props);
        }
        if dirty.scroll_listener {
            apply_scroll_listener(&mut ec, &props);
        }
        if dirty.wheel {
            apply_wheel_listener(&mut ec, &props);
        }
        if dirty.scroll_step {
            apply_scroll_step(&mut ec, &props);
        }
        if dirty.style.intersects(g::SCROLL_TRANSITION) {
            apply_scroll_transition(&mut ec, &props.style);
        }
        // Bindings are derived from the merged style, so any style change may
        // add/remove/retarget them (bind/unbind is an ordinary field delta).
        if dirty.style.any() {
            apply_animated(&mut ec, &props);
        }
        if dirty.anchor {
            apply_anchor(&mut ec, &props);
        }
        update_controlled_scroll(
            bridge,
            &mut ec,
            scroll_query,
            e,
            id,
            ev.scroll_left,
            ev.scroll_top,
        );
    }
    // Retain the merged props for the next delta (see above).
    bridge.props_cache.insert(id, props);
}

/// Re-derive every opacity-dependent output of a node after its layer-
/// promotion state flipped (called by
/// [`crate::layer::evaluate_layer_promotions`]). Bakes the final values in
/// one shot — promoted → folds suppressed + group alpha written; demoted →
/// folds resume — so the static path and the composite path never fight
/// across frames.
#[allow(clippy::too_many_arguments)]
pub(crate) fn reapply_opacity_outputs(
    commands: &mut Commands,
    entity: Entity,
    props: &Props,
    promoted: bool,
    foreign_image: bool,
    assets: &AssetServer,
    ui_assets: &mut UiAssets,
    style_variants: &mut Query<&mut StyleVariants>,
) {
    use crate::protocol::style_groups as g;
    // Variant-bearing nodes re-merge through `apply_interaction_styles`
    // (ordered after the evaluator): poking change detection re-runs the full
    // merge with the new promotion state without clobbering an active
    // hover/press overlay.
    if let Ok(mut variants) = style_variants.get_mut(entity) {
        variants.set_changed();
    } else {
        let mut ec = commands.entity(entity);
        // Every group `opacity` feeds, minus TRANSITION (transition *state*
        // persists across flips; only baked outputs re-derive) and TEXT
        // (text elements never promote).
        let mask = crate::protocol::StyleDirty(
            g::BACKGROUND | g::BG_GRADIENT | g::BORDER_GRADIENT | g::TEXT_SHADOW | g::LAYER,
        );
        apply_style_masked(&mut ec, &props.style, mask, promoted);
        // The background image's tint fold re-derives the same way — unless
        // the entity's `ImageNode` is element-owned (image/canvas/portal),
        // where the style is ignored and the image rebuild below owns it.
        if !foreign_image {
            crate::background_image::apply_background_image(
                &mut ec,
                &props.style,
                crate::protocol::StyleDirty(g::BG_IMAGE),
                promoted,
                assets,
            );
        }
    }
    let mut ec = commands.entity(entity);
    if is_image(props) {
        let mut img = image_node_promoted(props, assets, promoted);
        apply_atlas(
            &mut img,
            props,
            &mut ui_assets.layouts,
            &mut ui_assets.atlas_cache,
        );
        ec.insert(img);
    }
}

/// Whether these props carry any `image` element attribute.
fn is_image(props: &Props) -> bool {
    props.src.is_some()
        || props.tint.is_some()
        || props.image_mode.is_some()
        || props.flip_x
        || props.flip_y
        || props.source_rect.is_some()
        || props.atlas.is_some()
        || props.visual_box.is_some()
}

#[cfg(test)]
mod tests {
    use std::f32::consts::PI;

    use super::super::test_util::{op_app, text_props, update_delta};
    use super::*;
    use crate::bridge::PointerHandlers;
    use crate::protocol::Op;
    use crate::transition::TransitionInput;

    /// A `<text>` root's `transform`/`transition` must update on re-render — not
    /// just at mount. Regression: the text-update branch skipped `apply_style`, so
    /// a rotating chevron's target never changed and the animation never ran.
    #[test]
    fn text_update_reapplies_transform_target() {
        let (mut app, ops_tx) = op_app();

        // Mount a `<text>` with rotate 0.
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "text".into(),
                props: text_props(0.0),
                text: None,
            }])
            .unwrap();
        app.update();
        let e = app.world().resource::<JsBridge>().nodes[&1];
        assert_eq!(
            app.world()
                .entity(e)
                .get::<TransitionInput>()
                .unwrap()
                .rotate,
            Some(0.0),
            "create stamps the initial transform target"
        );

        // Re-render with rotate π — the transition target must follow.
        ops_tx
            .send(vec![update_delta(1, text_props(PI), &[], &[])])
            .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(e)
                .get::<TransitionInput>()
                .unwrap()
                .rotate,
            Some(PI),
            "a text re-render must refresh the transform target so it animates"
        );
    }

    /// A delta update touching only `width` must leave every other derived
    /// component untouched — not merely re-inserted-equal, but with its change
    /// tick intact (re-insertion would re-extract paint and re-run the
    /// interaction restyle via `Changed<StyleVariants>`).
    #[test]
    fn delta_update_skips_untouched_groups() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": {
                        "backgroundColor": "red",
                        "width": 10,
                        "outline": { "color": "white" },
                    },
                    "hoverStyle": { "backgroundColor": "blue" },
                    "onClick": true,
                }))
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();

        let e = app.world().resource::<JsBridge>().nodes[&1];
        let paint_ticks = |app: &App| {
            let entity = app.world().entity(e);
            (
                entity
                    .get_change_ticks::<BackgroundColor>()
                    .unwrap()
                    .changed,
                entity.get_change_ticks::<Outline>().unwrap().changed,
            )
        };
        let variants_tick = |app: &App| {
            app.world()
                .entity(e)
                .get_change_ticks::<StyleVariants>()
                .unwrap()
                .changed
        };
        let ticks_before = paint_ticks(&app);

        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "style": { "width": 100 } })).unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();

        {
            let entity = app.world().entity(e);
            assert_eq!(
                entity.get::<Node>().unwrap().width,
                Val::Px(100.0),
                "the delta's own field must apply"
            );
            assert_eq!(
                entity.get::<BackgroundColor>().unwrap().0,
                crate::ui_map::parse_color("red"),
                "untouched background survives a width-only delta"
            );
            assert!(
                entity.get::<StyleVariants>().is_some(),
                "variants survive (base mirrors the style, so it was rebuilt)"
            );
            assert!(
                entity.get::<Interaction>().is_some(),
                "the onClick Interaction survives"
            );
        }
        assert_eq!(
            ticks_before,
            paint_ticks(&app),
            "untouched paint groups must not even be marked changed"
        );

        // A non-style delta (a handler toggle) must not touch `StyleVariants`
        // at all — re-inserting it would trigger a full interaction restyle
        // via `Changed<StyleVariants>` on every unrelated update.
        let tick_before = variants_tick(&app);
        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "onPointerDown": true })).unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();
        assert_eq!(
            tick_before,
            variants_tick(&app),
            "a handler-only delta must not re-insert StyleVariants"
        );
    }

    /// `styleUnset` removes exactly the named field's component; the rest of
    /// the merged style (and unrelated props) stay.
    #[test]
    fn delta_style_unset_removes_component() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "backgroundColor": "red", "width": 10 },
                }))
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();
        let e = app.world().resource::<JsBridge>().nodes[&1];
        assert!(app.world().entity(e).get::<BackgroundColor>().is_some());

        ops_tx
            .send(vec![update_delta(
                1,
                Props::default(),
                &[],
                &["backgroundColor"],
            )])
            .unwrap();
        app.update();

        let entity = app.world().entity(e);
        assert!(
            entity.get::<BackgroundColor>().is_none(),
            "an unset style field removes its component"
        );
        assert_eq!(
            entity.get::<Node>().unwrap().width,
            Val::Px(10.0),
            "the retained width survives the unset"
        );
    }

    /// `styleUnset: ["backgroundImage"]` removes the `ImageNode` and both
    /// marker components; a delta swapping a `{ texture }` source for a path
    /// drops the stale `RBackgroundTexture` (or the bind system would stomp
    /// the asset handle).
    #[test]
    fn background_image_unset_and_source_swap() {
        use crate::background_image::{BackgroundTileScale, RBackgroundTexture};
        use bevy::ui::widget::ImageNode;
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "backgroundImage": {
                        "src": { "texture": "minimap" }, "mode": "repeat"
                    } }
                }))
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();
        let e = app.world().resource::<JsBridge>().nodes[&1];
        assert!(app.world().entity(e).get::<RBackgroundTexture>().is_some());
        assert!(app.world().entity(e).get::<BackgroundTileScale>().is_some());

        // texture → path source swap: marker (and tile scale, mode now
        // defaults to stretch) must go; the ImageNode stays.
        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({
                    "style": { "backgroundImage": { "src": "images/bg.png" } }
                }))
                .unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();
        let entity = app.world().entity(e);
        assert!(
            entity.get::<RBackgroundTexture>().is_none(),
            "a path source drops the stale texture marker"
        );
        assert!(entity.get::<BackgroundTileScale>().is_none());
        assert!(entity.get::<ImageNode>().is_some());

        ops_tx
            .send(vec![update_delta(
                1,
                Props::default(),
                &[],
                &["backgroundImage"],
            )])
            .unwrap();
        app.update();
        let entity = app.world().entity(e);
        assert!(
            entity.get::<ImageNode>().is_none(),
            "unsetting backgroundImage removes the ImageNode"
        );
        assert!(entity.get::<BackgroundTileScale>().is_none());
    }

    /// An opacity-only delta re-folds the background image's tint alpha (the
    /// `opacity` table row carries `BG_IMAGE`), and a delta on a `<canvas>`
    /// leaves its element-owned `ImageNode` untouched.
    #[test]
    fn background_image_opacity_refold_and_canvas_guard() {
        use bevy::ui::widget::ImageNode;
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![
                Op::Create {
                    id: 1,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({
                        "style": { "backgroundImage": {
                            "src": "images/bg.png", "tint": "#ffffff"
                        } }
                    }))
                    .unwrap(),
                    text: None,
                },
                Op::Create {
                    id: 2,
                    kind: "canvas".into(),
                    props: serde_json::from_value(serde_json::json!({})).unwrap(),
                    text: None,
                },
            ])
            .unwrap();
        app.update();
        let bridge = app.world().resource::<JsBridge>();
        let (e1, e2) = (bridge.nodes[&1], bridge.nodes[&2]);
        assert_eq!(
            app.world()
                .entity(e1)
                .get::<ImageNode>()
                .unwrap()
                .color
                .alpha(),
            1.0
        );
        let canvas_handle = app
            .world()
            .entity(e2)
            .get::<ImageNode>()
            .unwrap()
            .image
            .clone();

        ops_tx
            .send(vec![
                update_delta(
                    1,
                    serde_json::from_value(serde_json::json!({ "style": { "opacity": 0.5 } }))
                        .unwrap(),
                    &[],
                    &[],
                ),
                // A backgroundImage delta on the canvas must not retarget its
                // element-owned texture.
                update_delta(
                    2,
                    serde_json::from_value(serde_json::json!({
                        "style": { "backgroundImage": { "src": { "texture": "x" } } }
                    }))
                    .unwrap(),
                    &[],
                    &[],
                ),
            ])
            .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(e1)
                .get::<ImageNode>()
                .unwrap()
                .color
                .alpha(),
            0.5,
            "an opacity-only delta re-folds the background tint"
        );
        assert_eq!(
            app.world().entity(e2).get::<ImageNode>().unwrap().image,
            canvas_handle,
            "the canvas keeps its own texture despite the ignored style"
        );
    }

    /// Explicit unsets are the delta's "reset" mechanism: `styleUnset` drops
    /// the style field's component, `unset` drops a whole prop (here the last
    /// variant style, which must remove `StyleVariants` from the entity).
    #[test]
    fn delta_unsets_reset_absent_fields() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "backgroundColor": "red" },
                    "hoverStyle": { "backgroundColor": "blue" },
                }))
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();
        let e = app.world().resource::<JsBridge>().nodes[&1];
        assert!(app.world().entity(e).get::<StyleVariants>().is_some());

        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "style": { "width": 5 } })).unwrap(),
                &["hoverStyle"],
                &["backgroundColor"],
            )])
            .unwrap();
        app.update();

        let entity = app.world().entity(e);
        assert!(
            entity.get::<BackgroundColor>().is_none(),
            "styleUnset resets the background"
        );
        assert!(
            entity.get::<StyleVariants>().is_none(),
            "unsetting the last variant style removes StyleVariants"
        );
        assert_eq!(
            entity.get::<Node>().unwrap().width,
            Val::Px(5.0),
            "the delta's own field still applies"
        );
    }

    /// An unrelated delta on a controlled-scroll node must not touch the
    /// scroll offset (event-like props are never replayed from the cache).
    #[test]
    fn delta_update_does_not_replay_controlled_scroll() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "scrollTop": 40.0,
                    "style": { "overflowY": "scroll" },
                }))
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();
        let e = app.world().resource::<JsBridge>().nodes[&1];
        // Simulate the user scrolling away from the controlled value.
        app.world_mut()
            .entity_mut(e)
            .get_mut::<ScrollPosition>()
            .unwrap()
            .0 = Vec2::new(0.0, 7.0);

        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "style": { "width": 50 } })).unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();

        assert_eq!(
            app.world().entity(e).get::<ScrollPosition>().unwrap().0,
            Vec2::new(0.0, 7.0),
            "a width-only delta must not re-push the cached scrollTop"
        );
    }

    /// On a `<text>` with inheriting bare-string spans, a transform-only delta
    /// must skip the O(children) span re-propagation (their tick stays), while
    /// a `color` delta re-propagates.
    #[test]
    fn text_delta_gates_span_repropagation() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![
                Op::Create {
                    id: 1,
                    kind: "text".into(),
                    props: serde_json::from_value(serde_json::json!({
                        "style": { "color": "red" },
                    }))
                    .unwrap(),
                    text: None,
                },
                Op::CreateTextSpan {
                    id: 2,
                    text: "run".into(),
                },
                Op::Append {
                    parent: 1,
                    child: 2,
                },
            ])
            .unwrap();
        app.update();
        let bridge = app.world().resource::<JsBridge>();
        let (root, span) = (bridge.nodes[&1], bridge.nodes[&2]);
        let span_tick = app
            .world()
            .entity(span)
            .get_change_ticks::<TextColor>()
            .unwrap()
            .changed;

        // Transform-only delta: no text-style group dirty → span untouched.
        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(
                    serde_json::json!({ "style": { "transform": { "scale": 2.0 } } }),
                )
                .unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(span)
                .get_change_ticks::<TextColor>()
                .unwrap()
                .changed,
            span_tick,
            "a transform-only text delta must not re-propagate to spans"
        );

        // Color delta: text group dirty → span restyled.
        ops_tx
            .send(vec![update_delta(
                1,
                serde_json::from_value(serde_json::json!({ "style": { "color": "blue" } }))
                    .unwrap(),
                &[],
                &[],
            )])
            .unwrap();
        app.update();
        let world = app.world();
        assert_eq!(
            world.entity(span).get::<TextColor>().unwrap().0,
            crate::ui_map::parse_color("blue"),
            "a color delta re-propagates to inheriting spans"
        );
        assert_eq!(
            world.entity(root).get::<TextColor>().unwrap().0,
            crate::ui_map::parse_color("blue")
        );
    }

    /// A handler toggled off via `unset` clears its marker; the merged (not
    /// delta-only) props drive the rebuild, so the other handler survives.
    #[test]
    fn delta_toggles_pointer_handlers() {
        let (mut app, ops_tx) = op_app();
        ops_tx
            .send(vec![Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(
                    serde_json::json!({ "onPointerDown": true, "onPointerUp": true }),
                )
                .unwrap(),
                text: None,
            }])
            .unwrap();
        app.update();
        let e = app.world().resource::<JsBridge>().nodes[&1];

        // Unset one of the two: the marker must keep the other (merged props).
        ops_tx
            .send(vec![update_delta(
                1,
                Props::default(),
                &["onPointerUp"],
                &[],
            )])
            .unwrap();
        app.update();
        let handlers = app
            .world()
            .entity(e)
            .get::<PointerHandlers>()
            .expect("one handler remains");
        assert!(handlers.down && !handlers.up);

        ops_tx
            .send(vec![update_delta(
                1,
                Props::default(),
                &["onPointerDown"],
                &[],
            )])
            .unwrap();
        app.update();
        assert!(
            app.world().entity(e).get::<PointerHandlers>().is_none(),
            "unsetting the last handler clears the marker"
        );
    }
}
