//! The `Op::Update` path: merge a props delta into the retained per-node
//! props and re-run exactly the writers it touched — the global style writers
//! the node's element keeps, and the element's own writers reading a touched
//! style property or attribute — then refresh the dirty common prop stamps.
//! One path for every element kind. Also owns [`reapply_opacity_outputs`], the
//! layer evaluator's hook for re-deriving opacity-dependent outputs when a
//! node's promotion state flips.

use bevy::prelude::*;
use bevy::ui::{ComputedNode, ScrollPosition};

use super::apply::resolve;
use super::stamps::{
    apply_animated, apply_pointer_handlers, apply_scroll_listener, apply_scroll_step,
    apply_style_variants_delta, apply_wheel_listener, update_controlled_scroll,
};
use crate::bridge::{JsBridge, ReactNode, SpanKind, StyleVariants};
use crate::element::{AttrDirty, Common};
use crate::ext::TextRole;
use crate::plugin::Fonts;
use crate::protocol::{NodeId, props::Props};
use crate::style::props::OPACITY;
use crate::style::{Invalidation, NodeCtx, Style, WriterCtx};
use crate::transition::ScrollTransitionState;
use crate::ui_map::{
    apply_resolved_text_style, apply_style_masked, resolve_text_color, resolve_text_font,
};

/// Apply one `Op::Update`: merge the delta into the retained props and
/// re-apply only what it dirtied. Runs once per update op.
#[allow(clippy::too_many_arguments)]
pub(super) fn apply_update(
    commands: &mut Commands,
    bridge: &mut JsBridge,
    assets: &AssetServer,
    fonts: &Fonts,
    children: &Query<&Children>,
    rnodes: &Query<&ReactNode>,
    scroll_query: &mut Query<(
        &mut ScrollPosition,
        &ComputedNode,
        Option<&mut ScrollTransitionState>,
    )>,
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
    let registry = bridge.ext.clone();
    // The kinds are interned (`SharedTags::note_kind`), so this is a cheap
    // clone of an `Arc`-backed string — not the mutable borrow the shared-tag
    // update below needs.
    let kind: std::borrow::Cow<'static, str> = bridge.shared_tags.kind_cow(id);
    let kind: &str = &kind;
    let info = registry.element_or_fallback(kind);
    let flags = info.decl.flags;
    // Merge the delta into the retained per-node props, yielding the
    // merged full props, what the delta touched, and the event-like
    // fields to act on.
    //
    // The cache entry is taken OUT of the map for the duration of the
    // fn and re-inserted at the end — the stamps below borrow it as
    // `props` while also borrowing `bridge` mutably, and this way no
    // per-update `Props` clone is needed.
    let mut cached = bridge.props_cache.remove(&id).unwrap_or_else(|| {
        // Only reachable through a bug (create always seeds the
        // cache); merging onto defaults degrades to "delta = the
        // whole truth" rather than crashing.
        tracing::warn!("delta update for uncached node {id}; merging onto defaults");
        Box::default()
    });
    // The pre-merge name, so a `name` change can leave its old index bucket.
    let old_name = dirty_name(&props, &unset).then(|| cached.name.clone());
    let old_tag = dirty_shared_tag(&props, &unset).then(|| cached.shared_tag.clone());
    let (dirty, ev) = cached.merge_delta(props, &unset, &style_unset, info);
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
    // The retained style already carries the element's defaults.
    let style = &props.style;
    let styles = registry.styles();
    // A delta that can flip layer promotion (`opacity`/`groupAlpha`/
    // `filter`/… declare `PROMOTION` — an `{ animated }` opacity is presence
    // like any other) or a variant style swap (variants can carry them too)
    // re-evaluates this node's layer promotion (see `crate::layer`).
    let promoted = bridge.promoted_layers.contains(&id);
    let invalidation = styles
        .invalidation(
            &dirty.style,
            &dirty.style_old,
            style.as_ref().unwrap_or(Style::empty()),
            &NodeCtx { promoted, kind },
        )
        .union(info.attr_invalidation(dirty.attrs));
    if invalidation.contains(Invalidation::PROMOTION)
        || dirty.hover_style
        || dirty.press_style
        || dirty.focus_style
    {
        bridge.layer_dirty.insert(id);
    }
    // The writers this delta re-runs: the global ones reading a touched
    // property, the element's own reading a touched property or attribute
    // (an act-now attribute in the delta counts as touched).
    let global = styles.writers_for(&dirty.style);
    let own = info.writers_for(&dirty.style, dirty.attrs.union(ev.attrs.keys()));
    // A promoted text root suppresses the glyph opacity fold — the layer's
    // group alpha owns the fade (see `resolved_text_style`).
    let is_text_block = matches!(flags.text, TextRole::Block | TextRole::Span);
    let text_promoted = flags.text == TextRole::Block && promoted;
    // The text service: re-resolve the dirty halves of the cached text style
    // (a span attaching later inherits all of it) — a recolor never
    // re-resolves (or re-writes) the shaping half.
    let color_half = is_text_block && global.intersects(styles.masks.text_color);
    let font_half = is_text_block && global.intersects(styles.masks.text_font);
    let resolved = (color_half || font_half)
        .then(|| {
            let entry = bridge.text_styles.get_mut(&id)?;
            if color_half {
                entry.0 = resolve_text_color(style.as_ref(), text_promoted);
            }
            if font_half {
                let (font, line, spacing) = resolve_text_font(style.as_ref(), fonts);
                (entry.1, entry.2, entry.3) = (font, line, spacing);
            }
            Some(entry.clone())
        })
        .flatten();
    if flags.text == TextRole::Span {
        // Layer-family styles are structural no-ops on a span — warn so
        // the silence is visible in devtools.
        super::stamps::warn_span_ignored(&props);
    }
    if dirty.style.intersects(&info.ignored_styles) {
        super::stamps::warn_ignored_styles(info, styles, &props);
    }
    let wctx = WriterCtx {
        promoted: if flags.text == TextRole::Block {
            text_promoted
        } else {
            promoted
        },
        fresh: false,
        kind,
        flags,
        assets,
        fonts,
        styles,
        element: info,
        attrs: &props.attrs,
        events: &ev.attrs,
        id,
    };
    let mut ec = commands.entity(e);
    apply_style_masked(&mut ec, style, global, own, &wctx, invalidation);
    // The common prop stamps, per the element's groups.
    let common = info.decl.common;
    if common.contains(Common::VARIANTS) {
        // `StyleVariants.base` mirrors the (merged, effective) base style: a
        // base-only delta updates it in place with its dirty mask (the
        // interaction restyle re-runs just those properties' writers, or
        // nothing on an idle node); a variant swap re-stamps; a variant-less
        // node queues nothing.
        apply_style_variants_delta(&mut ec, &props, style, &dirty);
    }
    if common.contains(Common::POINTER) && dirty.pointer {
        apply_pointer_handlers(&mut ec, &props, flags);
    }
    if common.contains(Common::SCROLL) {
        if dirty.scroll_listener {
            apply_scroll_listener(&mut ec, &props);
        }
        if dirty.scroll_step {
            apply_scroll_step(&mut ec, &props);
        }
    }
    if common.contains(Common::WHEEL) && dirty.wheel {
        apply_wheel_listener(&mut ec, &props);
    }
    // Bindings are derived from the merged style and attributes, so any
    // change to either may add/remove/retarget them (bind/unbind is an
    // ordinary field delta).
    if dirty.style.any() || dirty.attrs != AttrDirty::NONE {
        apply_animated(&mut ec, &mut bridge.animated, id, &props);
    }
    if dirty.handlers {
        let events = props.handler_events(info);
        if events.is_empty() {
            ec.remove::<crate::element::EventSubscriptions>();
        } else {
            ec.insert(crate::element::EventSubscriptions(events));
        }
    }
    if common.contains(Common::SCROLL) {
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
    // Re-propagate the resolved text style to any bare-string children that
    // inherit it.
    if let Some(resolved) = resolved
        && let Ok(kids) = children.get(e)
    {
        for child in kids.iter() {
            if let Ok(rnode) = rnodes.get(child)
                && bridge.spans.get(&rnode.0) == Some(&SpanKind::RawInherited)
            {
                apply_resolved_text_style(
                    &mut commands.entity(child),
                    &resolved,
                    color_half,
                    font_half,
                );
            }
        }
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
    wctx: &WriterCtx,
    style_variants: &mut Query<&mut StyleVariants>,
) {
    // Variant-bearing nodes re-merge through `apply_interaction_styles`
    // (ordered after the evaluator): requesting a full restyle re-runs the
    // merge with the new promotion state without clobbering an active
    // hover/press overlay (`Full`, not a poke — a same-frame base delta may
    // have recorded a narrower mask, which must not win here).
    if let Ok(mut variants) = style_variants.get_mut(entity) {
        variants.restyle = crate::bridge::Restyle::Full;
        return;
    }
    let mut ec = commands.entity(entity);
    // Every writer `opacity` feeds, minus the transition writer (transition
    // *state* persists across flips; only baked outputs re-derive) and the
    // text color writer (a text root's re-derive is `crate::layer`'s
    // `reapply_text_fold`, run by the evaluator alongside this, which also
    // re-propagates to inheriting spans) — plus the element's own writers
    // reading it (an `<image>`'s tint fold).
    let styles = wctx.styles;
    let mask = styles
        .readers_of(&OPACITY)
        .without(styles.masks.transition.union(styles.masks.text_color));
    let own = wctx
        .element
        .writers_for(&styles.dirty_of(&[&OPACITY]), AttrDirty::NONE);
    // A flip always repaints: a demote resumes the folds in the node's own
    // colors (the geometry hash would miss a leaf demote).
    apply_style_masked(&mut ec, &props.style, mask, own, wctx, Invalidation::PAINT);
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
