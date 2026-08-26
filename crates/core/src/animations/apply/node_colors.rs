//! Stage 2 of [`apply_animated_nodes`](super::apply_animated_nodes) — the
//! `Node`-field and color writes, dispatched from the property table's
//! write-rule column.

use bevy::prelude::*;

use super::super::protocol::{AnimatableProperty, AnimatedBindings, ValueKind};
use super::super::{SharedValues, eval_color, eval_scalar, props};
use super::AnimTargetsItem;

/// Stage 2 — every `Node`- and color-staged binding. Colors land on their
/// component; lengths/scalars land on `Node`. Opacity is deferred to stage 3
/// so it owns the final alpha after any color write (the original ordering);
/// filter params to stage 4 (they write the resolved chain, not components,
/// and their value kind comes from the chain layout — not `value_kind`).
#[allow(clippy::too_many_arguments)]
pub(super) fn stage_node_and_colors(
    entity: Entity,
    commands: &mut Commands,
    b: &AnimatedBindings,
    values: &SharedValues,
    opacity_alpha: Option<f32>,
    promoted: bool,
    dirt: &mut crate::layer::LayerContentDirt,
    t: &mut AnimTargetsItem,
) {
    use AnimatableProperty as P;
    for (property, binding) in b.iter() {
        // Stage 2 owns exactly the table's `Node` and `Color` stages —
        // every other stage has its own pass (transform 1, transform3d
        // 1b, opacity 3, filter/backdrop params 4, shape attrs 5), so the
        // skip is the stage test itself, not a hand-kept variant list.
        // (`BackdropParam` is thereby explicitly skipped too — it used to
        // rely on the node-writer wildcard being inert.)
        if !matches!(
            property.stage(),
            props::PropStage::Node | props::PropStage::Color
        ) {
            continue;
        }
        match property.value_kind() {
            ValueKind::Color => {
                let Some(rgba) = eval_color(binding, values) else {
                    continue;
                };
                // Bake the final alpha in for the components stage 3 drives —
                // per-row data below: `bake` is true for every color target
                // except the border (opacity never touches it).
                let baked = |mut rgba: [f32; 4], bake: bool| {
                    if bake
                        && !promoted
                        && let Some(alpha) = opacity_alpha
                    {
                        rgba[3] = alpha;
                    }
                    Color::srgba(rgba[0], rgba[1], rgba[2], rgba[3])
                };
                // Color routing generates from the write-rule column's
                // `(color <target>)` rows; each target arm states its own
                // contract (alpha bake, insert-if-absent vs write-if-present).
                macro_rules! color_rule {
                    // Background: bakes alpha; inserts the component when
                    // absent (a node without a static background can still
                    // animate one in).
                    ($prop:tt, (color bg)) => {
                        if property == &$prop {
                            let color = baked(rgba, true);
                            match &mut t.bg {
                                Some(c) if c.0 != color => {
                                    c.0 = color;
                                    dirt.nodes.push(entity);
                                }
                                Some(_) => {}
                                None => {
                                    commands.entity(entity).insert(BackgroundColor(color));
                                    dirt.nodes.push(entity);
                                }
                            }
                        }
                    };
                    // Border: NO alpha bake (stage 3 never drives it);
                    // inserts when absent, all four sides uniformly.
                    ($prop:tt, (color border)) => {
                        if property == &$prop {
                            let color = baked(rgba, false);
                            let bc = BorderColor {
                                top: color,
                                right: color,
                                bottom: color,
                                left: color,
                            };
                            match &mut t.border {
                                Some(c) if **c != bc => {
                                    **c = bc;
                                    dirt.nodes.push(entity);
                                }
                                Some(_) => {}
                                None => {
                                    commands.entity(entity).insert(bc);
                                    dirt.nodes.push(entity);
                                }
                            }
                        }
                    };
                    // Text color: bakes alpha; write-if-present (a `<text>`
                    // node always carries `TextColor`).
                    ($prop:tt, (color text)) => {
                        if property == &$prop {
                            let color = baked(rgba, true);
                            if let Some(tc) = &mut t.text
                                && tc.0 != color
                            {
                                tc.0 = color;
                                dirt.nodes.push(entity);
                            }
                        }
                    };
                    // A `backgroundImage` tint: bakes alpha; drives the
                    // ImageNode's color, inert when the node carries no
                    // ImageNode (e.g. the spec was ignored on a foreign
                    // element or the style lost the field).
                    ($prop:tt, (color image_tint)) => {
                        if property == &$prop {
                            let color = baked(rgba, true);
                            if let Some(img) = &mut t.image
                                && img.color != color
                            {
                                img.color = color;
                                dirt.nodes.push(entity);
                            }
                        }
                    };
                    ($prop:tt, $other:tt) => {};
                }
                macro_rules! walk {
                    ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                        $(color_rule!($prop, $write);)*
                    };
                }
                props::with_animatable_props!(walk);
            }
            // Length/Scalar (and the unused Angle) all target `Node` here —
            // transform's Length/Scalar/Angle members were handled in stage 1.
            _ => {
                let Some(v) = eval_scalar(binding, values) else {
                    continue;
                };
                if let Some(node) = t.node.as_mut()
                    && write_node_value(node, property, v)
                {
                    // Belt: the geometry hash catches the resulting layout
                    // shift too, one system later.
                    dirt.nodes.push(entity);
                }
            }
        }
    }
}

/// Write a resolved scalar onto the matching `Node` layout field — but only when
/// it actually differs from the live value. Writing `Node` re-triggers Bevy's
/// layout, so the compare keeps a settled length binding from forcing a relayout
/// every frame (the read goes through `Deref`, only the assignment through
/// `DerefMut`, so an unchanged value never trips change detection). It also means a
/// re-render that resets `Node` to its static style is corrected next frame.
/// Lengths resolve to `Val::Px`: the imperative animation surface is scalar `f32`.
/// Returns whether anything was actually written (the layer-cache tap keys off it).
fn write_node_value<N: std::ops::DerefMut<Target = Node>>(
    node: &mut N,
    property: &AnimatableProperty,
    v: f32,
) -> bool {
    use AnimatableProperty as P;
    let val = Val::Px(v);
    // Each rule's guard reads the live field through `Deref` (no change mark) and
    // the body writes through `DerefMut` (marks changed) only when it differs — so
    // a settled binding never forces a relayout. The dispatch is generated from
    // the property table's write-rule column (`props`): `(node <field>)` is the
    // plain compare-write, `(node_gap_both)` writes both gap axes, `(node_aspect)`
    // the `Option<f32>` aspect ratio, `(node_radius_all)` every corner of the
    // border radius; `(color _)`/`(none)` rows never land here
    // and fall through to the `false` tail.
    macro_rules! rule {
        ($prop:tt, (node $field:ident)) => {
            if property == &$prop {
                if node.$field != val {
                    node.$field = val;
                    return true;
                }
                return false;
            }
        };
        ($prop:tt, (node_gap_both)) => {
            if property == &$prop {
                let mut wrote = false;
                if node.row_gap != val {
                    node.row_gap = val;
                    wrote = true;
                }
                if node.column_gap != val {
                    node.column_gap = val;
                    wrote = true;
                }
                return wrote;
            }
        };
        ($prop:tt, (node_aspect)) => {
            if property == &$prop {
                if node.aspect_ratio != Some(v) {
                    node.aspect_ratio = Some(v);
                    return true;
                }
                return false;
            }
        };
        ($prop:tt, (node_radius_all)) => {
            if property == &$prop {
                let r = BorderRadius::all(val);
                if node.border_radius != r {
                    node.border_radius = r;
                    return true;
                }
                return false;
            }
        };
        ($prop:tt, (color $target:ident)) => {};
        ($prop:tt, (none)) => {};
    }
    macro_rules! walk {
        ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
            $(rule!($prop, $write);)*
        };
    }
    props::with_animatable_props!(walk);
    false
}
