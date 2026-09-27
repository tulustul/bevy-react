//! The main-window hover/press/focus restyle: re-merge and re-apply a
//! variant-bearing element's style when its interaction or focus state flips.
//! (The `<surface>` analogue lives in `virtual_events.rs` — surface nodes
//! never receive a legacy `Interaction`.)

use bevy::prelude::*;

use crate::bridge::{FocusState, ReactNode, Restyle, StyleVariants};
use crate::ui_map::overlay_style;

/// Re-apply the merged style for any element with [`StyleVariants`] whose
/// `Interaction` or `FocusState` changed (hover/press/focus in or out) — or whose
/// variants changed from a React re-render. The interaction axis: `None` → base,
/// `Hovered` → base+hover, `Pressed` → base+hover+press; then `focus` overlays last
/// (so an explicit `focusStyle` wins on conflicting fields). Both `Interaction` and
/// `FocusState` are optional — a focus-only `editableText` has no `Interaction`, and
/// a hover-only node has no `FocusState`. Runs entirely on the Bevy side: no
/// round-trip to JS, no React re-render on mouse move or focus change.
///
/// Which writers re-run follows [`StyleVariants::restyle`]: a state flip
/// re-runs the writers of the properties any variant sets; a variant swap or
/// a promotion poke re-runs every writer; a base-only delta re-runs just the
/// writers of the properties it touched — and on an idle node (no
/// hover/press/focus overlay) is skipped entirely, since the merged style is
/// the base the op path already applied.
#[allow(clippy::type_complexity)]
pub fn apply_interaction_styles(
    mut commands: Commands,
    mut query: Query<
        (
            Entity,
            Option<Ref<Interaction>>,
            Option<Ref<FocusState>>,
            &mut StyleVariants,
            Option<&crate::layer::PromotedLayer>,
            Option<&crate::ext::ElementFlags>,
        ),
        Or<(
            Changed<Interaction>,
            Changed<FocusState>,
            Changed<StyleVariants>,
        )>,
    >,
    rnodes: Query<&ReactNode>,
    texts: Query<(), With<Text>>,
    assets: Res<AssetServer>,
    // `Option`: headless test harnesses build partial apps without the bridge
    // (and some without the fonts resource).
    bridge: Option<Res<crate::bridge::JsBridge>>,
    fonts: Option<Res<crate::plugin::Fonts>>,
) {
    use crate::style::{StyleDirty, WriterMask};
    let default_fonts = crate::plugin::Fonts::default();
    let fonts = fonts.as_deref().unwrap_or(&default_fonts);
    // The app's writers — or the core's alone in a harness without the bridge.
    let styles: &crate::style::StyleRegistry = match bridge.as_ref() {
        Some(b) => b.ext.styles(),
        None => crate::style::core_registry(),
    };
    for (entity, interaction, focus, mut variants, promoted, flags) in &mut query {
        // Consume the recorded reason without re-marking the component (a
        // detected write here would re-trigger this system next frame).
        let pending = std::mem::replace(
            &mut variants.bypass_change_detection().restyle,
            Restyle::Idle,
        );
        let state_changed = interaction.as_ref().is_some_and(|i| i.is_changed())
            || focus.as_ref().is_some_and(|f| f.is_changed());
        let interaction = interaction.as_deref().copied();
        let focused = focus.as_deref().is_some_and(|f| f.0);
        // What changed: a base-only delta's properties; on a state edge the
        // properties any variant sets (hover-in/out swaps exactly those);
        // after a variant swap or a promotion poke, everything.
        let changed = match pending {
            Restyle::Base(dirty) if !state_changed => dirty,
            Restyle::Base(dirty) => dirty.union(variants.keys),
            Restyle::Idle if state_changed => variants.keys,
            _ => StyleDirty::ALL,
        };
        let writers = if changed.is_all() {
            WriterMask::ALL
        } else {
            styles.writers_for(&changed)
        };
        // Idle node + base-only delta: merged == base, already applied.
        if matches!(pending, Restyle::Base(_))
            && !state_changed
            && !focused
            && matches!(interaction, None | Some(Interaction::None))
        {
            continue;
        }
        let mut style = match interaction {
            Some(Interaction::Pressed) => overlay_style(
                overlay_style(variants.base.as_ref(), variants.hover.as_ref()).as_ref(),
                variants.press.as_ref(),
            ),
            Some(Interaction::Hovered) => {
                overlay_style(variants.base.as_ref(), variants.hover.as_ref())
            }
            _ => variants.base.as_ref().cloned(),
        };
        if focused {
            style = overlay_style(style.as_ref(), variants.focus.as_ref());
        }
        // Attribute re-parse warnings (e.g. a bad hoverStyle color) to the node.
        let rnode = rnodes.get(entity).ok();
        let _diag = rnode.map(|r| crate::diag::node_scope(r.0));
        let kind = match (bridge.as_ref(), rnode) {
            (Some(b), Some(r)) => b.shared_tags.kind_cow(r.0),
            _ => std::borrow::Cow::Borrowed("node"),
        };
        let registry = bridge.as_ref().map(|b| b.ext.clone());
        let fallback;
        let info = match registry.as_ref() {
            Some(r) => r.element_or_fallback(&kind),
            None => {
                fallback = crate::ext::core_element_info(&kind)
                    .or_else(|| crate::ext::core_element_info("node"))
                    .expect("the core registers <node>");
                &fallback
            }
        };
        let is_text = texts.contains(entity);
        let attrs = match (bridge.as_ref(), rnode) {
            (Some(b), Some(r)) => b.props_cache.get(&r.0).map(|p| &p.attrs),
            _ => None,
        }
        .unwrap_or(crate::element::Attrs::empty());
        // A promoted layer root's merged `opacity` (base or variant-carried)
        // drives the group alpha instead of folding into colors, and its
        // merged `filter` re-stamps `FilterInput` (a hover filter — with a
        // `transition` — eases). Promotion itself never flips on interaction
        // (`promotion_reasons` unions every state, `groupAlpha`/`cache`
        // included). A `<text>` root's (and an `editableText`'s) glyph
        // appearance rides the text writers, so hover/press/focus color and
        // font changes land — with the opacity fold suppressed on a
        // promoted root. The element's own writers reading a changed
        // property re-run too (an `<image>`'s tint fold).
        let wctx = crate::style::WriterCtx {
            promoted: promoted.is_some(),
            fresh: false,
            kind: &kind,
            flags: flags.copied().unwrap_or(info.decl.flags),
            assets: &assets,
            fonts,
            styles,
            element: info,
            attrs,
            events: crate::element::Attrs::empty(),
            id: rnode.map_or(0, |r| r.0),
        };
        // The replaced values are unknown here (a computed invalidation
        // answers conservatively).
        let invalidation = styles.invalidation(
            &changed,
            &crate::style::OldValues::default(),
            style.as_ref().unwrap_or(crate::style::Style::empty()),
            &crate::style::NodeCtx {
                promoted: promoted.is_some(),
                kind: &kind,
            },
        );
        let own = info.writers_for(&changed, crate::element::AttrDirty::NONE);
        let mut ec = commands.entity(entity);
        crate::ui_map::apply_style_masked(&mut ec, &style, writers, own, &wctx, invalidation);
        // Bare-string children inherit the merged result like they do on a
        // re-render (the halves the restyle re-ran).
        let color_half = writers.intersects(styles.masks.text_color);
        let font_half = writers.intersects(styles.masks.text_font);
        if is_text
            && (color_half || font_half)
            && let (Some(bridge), Some(rnode)) = (bridge.as_ref(), rnode)
        {
            let resolved =
                crate::ui_map::resolved_text_style(style.as_ref(), fonts, promoted.is_some());
            let kids: Vec<_> = bridge.children_of(rnode.0).collect();
            for kid in kids {
                if bridge.spans.get(&kid) == Some(&crate::bridge::SpanKind::RawInherited)
                    && let Some(&kid_entity) = bridge.nodes.get(&kid)
                {
                    crate::ui_map::apply_resolved_text_style(
                        &mut commands.entity(kid_entity),
                        &resolved,
                        color_half,
                        font_half,
                    );
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::test_util::op_app;
    use super::*;
    use crate::bridge::JsBridge;
    use crate::protocol::op::Op;
    use bevy::ui::widget::ImageNode;

    /// A `<text>` hover variant recolors the glyphs Bevy-side: hover-in
    /// applies the merged `color`, hover-out restores the base — on the root
    /// AND its inheriting bare-string span (which carries its own copy of
    /// the resolved components).
    #[test]
    fn text_hover_variant_recolors_glyphs() {
        use crate::protocol::op::Op;
        let (mut app, ops_tx) = op_app();
        app.add_systems(
            Update,
            apply_interaction_styles.after(crate::reconcile::apply_js_ops),
        );
        ops_tx
            .send(vec![
                Op::Create {
                    id: 1,
                    kind: "text".into(),
                    props: serde_json::from_value(serde_json::json!({
                        "style": { "color": "red" },
                        "hoverStyle": { "color": "blue" },
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
        let color = |app: &App, e: Entity| {
            app.world()
                .entity(e)
                .get::<bevy::text::TextColor>()
                .unwrap()
                .0
        };
        assert_eq!(color(&app, root), crate::ui_map::parse_color("red"));

        app.world_mut()
            .entity_mut(root)
            .insert(Interaction::Hovered);
        app.update();
        assert_eq!(
            color(&app, root),
            crate::ui_map::parse_color("blue"),
            "hover-in recolors the glyphs"
        );
        assert_eq!(
            color(&app, span),
            crate::ui_map::parse_color("blue"),
            "…and the inheriting bare-string span"
        );

        app.world_mut().entity_mut(root).insert(Interaction::None);
        app.update();
        assert_eq!(
            color(&app, root),
            crate::ui_map::parse_color("red"),
            "hover-out restores the base color"
        );
    }

    /// A hover variant swaps the whole `backgroundImage` Bevy-side (new
    /// texture handle on hover-in); hover-out with a spec-less base removes
    /// the `ImageNode` again (variant present → absent).
    #[test]
    fn hover_variant_swaps_background_image() {
        let (mut app, ops_tx) = op_app();
        app.add_systems(
            Update,
            apply_interaction_styles.after(crate::reconcile::apply_js_ops),
        );
        ops_tx
            .send(vec![
                Op::Create {
                    id: 1,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({
                        "style": { "backgroundImage": { "src": "a.png" } },
                        "hoverStyle": { "backgroundImage": { "src": "b.png" } },
                    }))
                    .unwrap(),
                    text: None,
                },
                Op::Create {
                    id: 2,
                    kind: "node".into(),
                    props: serde_json::from_value(serde_json::json!({
                        "hoverStyle": { "backgroundImage": { "src": "b.png" } },
                    }))
                    .unwrap(),
                    text: None,
                },
            ])
            .unwrap();
        app.update();
        let bridge = app.world().resource::<JsBridge>();
        let (e1, e2) = (bridge.nodes[&1], bridge.nodes[&2]);
        let base_handle = app
            .world()
            .entity(e1)
            .get::<ImageNode>()
            .unwrap()
            .image
            .clone();

        app.world_mut().entity_mut(e1).insert(Interaction::Hovered);
        app.world_mut().entity_mut(e2).insert(Interaction::Hovered);
        app.update();
        let hover_handle = app
            .world()
            .entity(e1)
            .get::<ImageNode>()
            .unwrap()
            .image
            .clone();
        assert_ne!(
            base_handle, hover_handle,
            "hover swaps the background image handle"
        );
        assert!(
            app.world().entity(e2).get::<ImageNode>().is_some(),
            "a hover-only spec mounts the image on hover-in"
        );

        app.world_mut().entity_mut(e1).insert(Interaction::None);
        app.world_mut().entity_mut(e2).insert(Interaction::None);
        app.update();
        assert_eq!(
            app.world().entity(e1).get::<ImageNode>().unwrap().image,
            base_handle,
            "hover-out restores the base image"
        );
        assert!(
            app.world().entity(e2).get::<ImageNode>().is_none(),
            "hover-out removes the image when the base has no spec"
        );
    }
}
