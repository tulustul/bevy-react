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
) {
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
        let _diag = rnodes
            .get(entity)
            .ok()
            .map(|r| crate::diag::node_scope(r.0));
        // A promoted layer root's merged `opacity` (base or variant-carried)
        // drives the group alpha instead of folding into colors, and its
        // merged `filter` re-stamps `FilterInput` (a hover filter — with a
        // `transition` — eases). Promotion itself never flips on interaction
        // (`promotion_reasons` unions variant presence; `groupAlpha` is
        // `no_overlay`).
        crate::ui_map::apply_style_promoted(
            &mut commands.entity(entity),
            &style,
            promoted.is_some(),
        );
    }
}
