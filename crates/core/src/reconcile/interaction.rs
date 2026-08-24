//! The main-window hover/press/focus restyle: re-merge and re-apply a
//! variant-bearing element's style when its interaction or focus state flips.
//! (The `<surface>` analogue lives in `surface_events.rs` — surface nodes
//! never receive a legacy `Interaction`.)

use bevy::prelude::*;

use crate::bridge::{FocusState, RNode, StyleVariants};
use crate::ui_map::overlay_style;

/// Re-apply the merged style for any element with [`StyleVariants`] whose
/// `Interaction` or `FocusState` changed (hover/press/focus in or out) — or whose
/// variants changed from a React re-render. The interaction axis: `None` → base,
/// `Hovered` → base+hover, `Pressed` → base+hover+press; then `focus` overlays last
/// (so an explicit `focusStyle` wins on conflicting fields). Both `Interaction` and
/// `FocusState` are optional — a focus-only `editableText` has no `Interaction`, and
/// a hover-only node has no `FocusState`. Runs entirely on the Bevy side: no
/// round-trip to JS, no React re-render on mouse move or focus change.
#[allow(clippy::type_complexity)]
pub fn apply_interaction_styles(
    mut commands: Commands,
    query: Query<
        (
            Entity,
            Option<&Interaction>,
            Option<&FocusState>,
            &StyleVariants,
            Option<&crate::layer::PromotedLayer>,
        ),
        Or<(
            Changed<Interaction>,
            Changed<FocusState>,
            Changed<StyleVariants>,
        )>,
    >,
    rnodes: Query<&RNode>,
    texts: Query<(), With<Text>>,
    assets: Res<AssetServer>,
    // `Option`: headless test harnesses build partial apps without the bridge
    // (and some without the fonts resource).
    bridge: Option<Res<crate::bridge::JsBridge>>,
    fonts: Option<Res<crate::plugin::Fonts>>,
) {
    let default_fonts = crate::plugin::Fonts::default();
    let fonts = fonts.as_deref().unwrap_or(&default_fonts);
    for (entity, interaction, focus, variants, promoted) in &query {
        let mut style = match interaction {
            Some(Interaction::Pressed) => overlay_style(
                &overlay_style(&variants.base, &variants.hover),
                &variants.press,
            ),
            Some(Interaction::Hovered) => overlay_style(&variants.base, &variants.hover),
            _ => variants.base.clone(),
        };
        if focus.is_some_and(|f| f.0) {
            style = overlay_style(&style, &variants.focus);
        }
        // Attribute re-parse warnings (e.g. a bad hoverStyle color) to the node.
        let rnode = rnodes.get(entity).ok();
        let _diag = rnode.map(|r| crate::diag::node_scope(r.0));
        // A promoted layer root's merged `opacity` (base or variant-carried)
        // drives the group alpha instead of folding into colors, and its
        // merged `filter` re-stamps `FilterInput` (a hover filter — with a
        // `transition` — eases). Promotion itself never flips on interaction
        // (`promotion_reasons` unions variant presence; `groupAlpha` is
        // `no_overlay`).
        let mut ec = commands.entity(entity);
        crate::ui_map::apply_style_promoted(&mut ec, &style, promoted.is_some());
        // The merged `backgroundImage` (a variant can swap it Bevy-side) —
        // built here because it needs `assets`, and guarded off elements
        // whose `ImageNode` is element-owned (canvas/portal/image DO carry
        // `StyleVariants`).
        let foreign = bridge
            .as_ref()
            .zip(rnode)
            .is_some_and(|(b, r)| b.foreign_images.contains(&r.0));
        if !foreign {
            crate::background_image::apply_background_image(
                &mut ec,
                &style,
                crate::protocol::style::StyleDirty::ALL,
                promoted.is_some(),
                &assets,
            );
        }
        // A `<text>` root's glyph appearance (`TextColor`/`TextFont`/…)
        // resolves through `resolved_text_style`, not `apply_style_masked` —
        // re-derive it from the merged style so hover/press/focus color and
        // font changes actually land, with the opacity fold suppressed on a
        // promoted root (its group alpha owns the fade). Bare-string children
        // inherit the merged result like they do on a re-render.
        if texts.contains(entity) {
            let resolved =
                crate::ui_map::resolved_text_style_promoted(&style, fonts, promoted.is_some());
            ec.insert(resolved.clone());
            if let Some(layout) = crate::ui_map::text_layout(&style) {
                ec.insert(layout);
            }
            if let (Some(bridge), Some(rnode)) = (bridge.as_ref(), rnode) {
                let kids: Vec<_> = bridge.children_of(rnode.0).collect();
                for kid in kids {
                    if bridge.spans.get(&kid) == Some(&crate::bridge::SpanKind::RawInherited)
                        && let Some(&kid_entity) = bridge.nodes.get(&kid)
                    {
                        commands.entity(kid_entity).insert(resolved.clone());
                    }
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
