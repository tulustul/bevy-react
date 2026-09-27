//! The `Op::Update` path: merge a props delta into the retained per-node
//! props and re-run exactly the style writers it touched, branching per element
//! category (text root/span, editableText, surface, root, SVG shape,
//! general). Also owns
//! [`reapply_opacity_outputs`], the layer evaluator's hook for re-deriving
//! opacity-dependent outputs when a node's promotion state flips.

use bevy::a11y::AccessibilityNode;
use bevy::prelude::*;
use bevy::text::{EditableText, TextEdit};
use bevy::ui::{ComputedNode, ScrollPosition};

use super::apply::resolve;
use super::create::{root_base, surface_root_base};
use super::image::{is_image, rebuild_image};
use super::stamps::{
    apply_anchor, apply_animated, apply_pointer_handlers, apply_scroll_listener, apply_scroll_step,
    apply_style_variants_delta, apply_wheel_listener, queue_pending_selection,
    register_editable_handlers, update_controlled_scroll,
};
use super::stats::UiAssets;
use crate::bridge::{JsBridge, ReactNode, SpanKind, StyleVariants};
use crate::canvas::CanvasSurface;
use crate::plugin::Fonts;
use crate::portal::RPortal;
use crate::protocol::{NodeId, props::Props};
use crate::style::Style;
use crate::style::StyleDirty;
use crate::style::WriterCtx;
use crate::style::props::{CoreId, OPACITY};
use crate::style::{Invalidation, NodeCtx};
use crate::transition::ScrollTransitionState;
use crate::ui_map::{
    apply_resolved_text_style, apply_style_masked, overlay_style, resolve_text_color,
    resolve_text_font,
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
    rnodes: &Query<&ReactNode>,
    editables: &mut Query<&mut EditableText>,
    scroll_query: &mut Query<(
        &mut ScrollPosition,
        &ComputedNode,
        Option<&mut ScrollTransitionState>,
    )>,
    a11y_nodes: &mut Query<&mut AccessibilityNode>,
    text_roots: &Query<(), With<Node>>,
    id: NodeId,
    props: Box<Props>,
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
    // The element-kind facts the branches below need (is this a shape? does
    // the element own its `ImageNode`?), derived from the recorded kind —
    // the synchronous twin of the entity's `ElementFlags` (commands queued
    // this batch have not flushed, so the component can't be queried yet).
    let registry = bridge.ext.clone();
    // The kinds are interned (`SharedTags::note_kind`), so this is a cheap
    // clone of an `Arc`-backed string — not the mutable borrow the shared-tag
    // update below needs.
    let kind: std::borrow::Cow<'static, str> = bridge.shared_tags.kind_cow(id);
    let kind: &str = &kind;
    let kind_flags = registry.flags_for_kind(kind);
    let handler = registry.element(kind);
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
    // The pre-merge name, so a `name` change can leave its old index bucket.
    let old_name = dirty_name(&props, &unset).then(|| cached.name.clone());
    let old_tag = dirty_shared_tag(&props, &unset).then(|| cached.shared_tag.clone());
    let (dirty, ev) = cached.merge_delta(props, &unset, &style_unset);
    let props = cached;
    if let Some(old_name) = old_name {
        crate::names::apply_name(
            &mut commands.entity(e),
            &mut bridge.names,
            old_name.as_deref(),
            props.name.as_deref(),
        );
    }
    if let Some(old_tag) = old_tag {
        bridge
            .shared_tags
            .apply(id, old_tag.as_deref(), props.shared_tag.as_deref());
    }
    // The writers this delta re-runs (those reading a touched property).
    let styles = registry.styles();
    let writers = styles.writers_for(&dirty.style);
    let wctx = |promoted: bool, text: bool| WriterCtx {
        promoted,
        fresh: false,
        kind,
        flags: kind_flags,
        text,
        assets,
        fonts,
        styles,
    };
    // A delta that can flip layer promotion (`opacity`/`groupAlpha`/
    // `filter`/… declare `PROMOTION` — an `{ animated }` opacity is presence
    // like any other) or a variant style swap (variants can carry them too)
    // re-evaluates this node's layer promotion (see `crate::layer`).
    // What the change invalidates, per the touched properties' declarations
    // (a text span is never a promoted root: `promoted_layers` holds roots).
    let invalidation = styles.invalidation(
        &dirty.style,
        &dirty.style_old,
        props.style.as_ref().unwrap_or(Style::empty()),
        &NodeCtx {
            promoted: bridge.promoted_layers.contains(&id),
            kind,
        },
    );
    if invalidation.contains(Invalidation::PROMOTION)
        || dirty.hover_style
        || dirty.press_style
        || dirty.focus_style
    {
        bridge.layer_dirty.insert(id);
    }
    if bridge.text_styles.contains_key(&id) {
        let is_root = text_roots.contains(e);
        if !is_root {
            // A nested span: layer-family styles and pointer handlers are
            // structural no-ops (no layout box, glyphs belong to the parent
            // block) — warn so the silence is visible in devtools.
            super::stamps::warn_span_ignored(&props);
        }
        // A promoted text root suppresses the glyph opacity fold — the
        // layer's group alpha owns the fade (see `resolved_text_style`).
        let promoted = is_root && bridge.promoted_layers.contains(&id);
        // Which halves of the resolved text style the delta re-ran: the
        // cache keeps the whole tuple (a span attaching later inherits all
        // of it), so only the dirty halves are re-resolved into it — a
        // recolor never re-resolves (or re-writes) the shaping half.
        let color_half = writers.intersects(styles.masks.text_color);
        let font_half = writers.intersects(styles.masks.text_font);
        let resolved = (color_half || font_half).then(|| {
            let entry = bridge
                .text_styles
                .get_mut(&id)
                .expect("guarded by the branch");
            if color_half {
                entry.0 = resolve_text_color(props.style.as_ref(), promoted);
            }
            if font_half {
                let (font, line, spacing) = resolve_text_font(props.style.as_ref(), fonts);
                (entry.1, entry.2, entry.3) = (font, line, spacing);
            }
            entry.clone()
        });
        let mut ec = commands.entity(e);
        // A text *root* (has a `Node`) gets every writer — mirroring its
        // create path, so a `transform`/`transition` on a `<text>` applies
        // on re-render too. A span has no `Node`: only the text writers run,
        // so it never gains a layout box.
        let mask = if is_root {
            writers
        } else {
            writers.intersection(styles.masks.span)
        };
        apply_style_masked(
            &mut ec,
            &props.style,
            mask,
            &wctx(promoted, true),
            invalidation,
        );
        if dirty.anchor {
            apply_anchor(&mut ec, &mut bridge.anchors, id, &props);
        }
        // Interactivity parity with the general arm (a `<text>` root is
        // fully interactive since its create path stamps `stamp_common`):
        // variants, handlers, listeners, and animation bindings all
        // refresh on re-render, not just at mount.
        if is_root {
            apply_style_variants_delta(&mut ec, &props, &dirty);
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
            if dirty.style.any() {
                apply_animated(&mut ec, &mut bridge.animated, id, &props);
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
                    apply_resolved_text_style(
                        &mut commands.entity(child),
                        &style,
                        color_half,
                        font_half,
                    );
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
        // The text writers keep its color/font (and caret) current.
        apply_style_masked(
            &mut ec,
            &props.style,
            writers,
            &wctx(promoted, true),
            invalidation,
        );
        apply_style_variants_delta(&mut ec, &props, &dirty);
    } else if bridge.surfaces.contains(&id) {
        // A `<surface>` re-render: re-apply the (full-size-defaulted)
        // style and rebind its `target`. It shares the `target` wire field
        // with `<portal>`, so it must branch before the general path
        // below (which would wrongly stamp an `RPortal`).
        let mut ec = commands.entity(e);
        if dirty.style.any() {
            let style = overlay_style(surface_root_base().as_ref(), props.style.as_ref());
            // Detached roots are never layer-promoted.
            apply_style_masked(&mut ec, &style, writers, &wctx(false, false), invalidation);
        }
        if dirty
            .style
            .intersects(&StyleDirty::of_core(&[CoreId::BACKGROUND_IMAGE]))
        {
            crate::background_image::warn_ignored("surface", &props);
        }
        if dirty.target
            && let Some(name) = &props.target
        {
            ec.insert(crate::surface::RSurface(name.clone()));
        }
        if dirty.anchor {
            apply_anchor(&mut ec, &mut bridge.anchors, id, &props);
        }
    } else if bridge.roots.contains(&id) {
        // A `<root>` re-render: re-overlay the screen-filling,
        // top-of-stack base (see `root_base`) so a masked re-apply
        // keeps the baked `globalZIndex` instead of stripping it.
        let mut ec = commands.entity(e);
        if dirty.style.any() {
            let style = overlay_style(root_base().as_ref(), props.style.as_ref());
            // Detached roots are never layer-promoted.
            apply_style_masked(&mut ec, &style, writers, &wctx(false, false), invalidation);
        }
        if dirty.anchor {
            apply_anchor(&mut ec, &mut bridge.anchors, id, &props);
        }
    } else if let Some(handler) = handler.filter(|_| kind_flags.node_less) {
        // A registered node-less kind (an SVG shape child): no style, no
        // layout box — the handler owns the whole prop surface.
        let mut ctx = crate::ext::ElementUpdateCtx {
            animated: &mut bridge.animated,
            id,
        };
        handler.update(&mut ctx, &mut commands.entity(e), kind, &props, &dirty);
    } else {
        let promoted = bridge.promoted_layers.contains(&id);
        let mut ec = commands.entity(e);
        apply_style_masked(
            &mut ec,
            &props.style,
            writers,
            &wctx(promoted, false),
            invalidation,
        );
        // Image attributes only ever appear on `image` elements, so their
        // presence is enough to re-apply the texture/tint. The image's own
        // `ImageNode` also folds `opacity` into its tint, so an opacity
        // change rebuilds it too.
        let refold = kind == "image"
            && dirty
                .style
                .intersects(&StyleDirty::of_core(&[CoreId::OPACITY]));
        if (dirty.image && is_image(&props)) || refold {
            rebuild_image(&mut ec, &props, assets, ui_assets, promoted, dirty.image);
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
        // An `<svg>` root's `viewBox`: write the merged value into its
        // surface and request a re-raster (see `svg_ops`). Svg roots
        // otherwise flow through this general arm as normal styled nodes
        // (`foreign_images` already guards their element-owned `ImageNode`).
        // A registered styled kind (an `<svg>` root): its own keys, after the
        // generic path.
        if let Some(handler) = handler {
            let mut ctx = crate::ext::ElementUpdateCtx {
                animated: &mut bridge.animated,
                id,
            };
            handler.update(&mut ctx, &mut ec, kind, &props, &dirty);
        }
        // A `<portal>`'s new target name: rebind it (the binding system
        // points its `ImageNode` at the new target next frame).
        if dirty.target
            && let Some(target) = &props.target
        {
            ec.insert((RPortal(target.clone()), crate::ext::LiveTexture));
        }
        // `StyleVariants.base` mirrors the (merged) base style: a base-only
        // delta updates it in place with its dirty mask (the interaction
        // restyle re-runs just those properties' writers, or nothing on an
        // idle node);
        // a variant swap re-stamps; a variant-less node queues nothing.
        apply_style_variants_delta(&mut ec, &props, &dirty);
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
        // Bindings are derived from the merged style, so any style change may
        // add/remove/retarget them (bind/unbind is an ordinary field delta).
        if dirty.style.any() {
            apply_animated(&mut ec, &mut bridge.animated, id, &props);
        }
        if dirty.anchor {
            apply_anchor(&mut ec, &mut bridge.anchors, id, &props);
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
    wctx: &WriterCtx,
    ui_assets: &mut UiAssets,
    style_variants: &mut Query<&mut StyleVariants>,
) {
    // Variant-bearing nodes re-merge through `apply_interaction_styles`
    // (ordered after the evaluator): requesting a full restyle re-runs the
    // merge with the new promotion state without clobbering an active
    // hover/press overlay (`Full`, not a poke — a same-frame base delta may
    // have recorded a narrower mask, which must not win here).
    if let Ok(mut variants) = style_variants.get_mut(entity) {
        variants.restyle = crate::bridge::Restyle::Full;
    } else {
        let mut ec = commands.entity(entity);
        // Every writer `opacity` feeds, minus the transition writer
        // (transition *state* persists across flips; only baked outputs
        // re-derive) and the text color writer (a text root's re-derive is
        // `crate::layer`'s `reapply_text_fold`, run by the evaluator
        // alongside this, which also re-propagates to inheriting spans).
        let styles = wctx.styles;
        let mask = styles
            .readers_of(&OPACITY)
            .without(styles.masks.transition.union(styles.masks.text_color));
        // A flip always repaints: a demote resumes the folds in the node's
        // own colors (the geometry hash would miss a leaf demote).
        apply_style_masked(&mut ec, &props.style, mask, wctx, Invalidation::PAINT);
    }
    let mut ec = commands.entity(entity);
    if is_image(props) {
        // The promotion flip carries no new props, so the svg ignored-attr
        // warning would only repeat the create/update one — skip it.
        rebuild_image(&mut ec, props, wctx.assets, ui_assets, promoted, false);
    }
}

/// Whether an update delta touches the `name` prop (set, or listed in `unset`).
fn dirty_name(delta: &Props, unset: &[String]) -> bool {
    delta.name.is_some() || unset.iter().any(|u| u == "name")
}

fn dirty_shared_tag(delta: &Props, unset: &[String]) -> bool {
    delta.shared_tag.is_some() || unset.iter().any(|u| u == "sharedTag")
}

#[cfg(test)]
mod tests;
