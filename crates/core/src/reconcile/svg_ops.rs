//! JSX `<svg>` + shape-children op glue shared by the create/update paths
//! (the `image` module precedent): the `<svg>` root and `SvgShape` create
//! bodies, and the two queued compare-before-write updates (`shape` attrs,
//! `viewBox`). Keeps the big `create`/`update` match arms tiny; the svg
//! machinery itself lives in [`crate::svg`].

use bevy::image::Image;
use bevy::prelude::*;
use bevy::ui::widget::NodeImageMode;

use super::stamps::{apply_animated, apply_pointer_handlers, stamp_common};
use crate::bridge::ReactNode;
use crate::canvas::blank_canvas_image;
use crate::protocol::{NodeId, props::Props};
use crate::svg::{ShapeKind, SvgShape, SvgSurface, SvgUserPos};
use crate::ui_map::apply_style;

/// Spawn a JSX `<svg>` root: a styled node carrying an `ImageNode` whose
/// element-owned texture the svg rasterizer paints from the Node-less
/// [`SvgShape`] children; `viewBox` maps their user units onto the laid-out
/// box (see [`crate::svg`]).
pub(super) fn create_svg_root(
    commands: &mut Commands,
    images: &mut Assets<Image>,
    id: NodeId,
    props: &Props,
) -> Entity {
    let handle = images.add(blank_canvas_image());
    let mut node_img = ImageNode::new(handle);
    node_img.image_mode = NodeImageMode::Stretch;
    let mut ec = commands.spawn(ReactNode(id));
    apply_style(&mut ec, &props.style);
    ec.insert((node_img, SvgSurface::jsx(props.view_box)));
    stamp_common(&mut ec, props);
    ec.id()
}

/// Spawn an SVG shape child (`<circle>`/`<rect>`/…/`<g>`): a **Node-less**
/// entity (the `textSpan` precedent) carrying only its kind + folded attrs —
/// no style, no layout box, no `stamp_common` (of the common props only the
/// pointer handlers apply, stamped below); the enclosing `<svg>` root paints
/// it. A `<g>` often carries no attrs at all → default attrs. `{ animated }`
/// wrappers on the numeric attrs stamp an
/// [`AnimatedNode`](crate::animations::AnimatedNode) (via [`apply_animated`] —
/// on a styleless shape the bindings derive from the attrs alone).
pub(super) fn create_shape(
    commands: &mut Commands,
    id: NodeId,
    kind: ShapeKind,
    props: &Props,
) -> Entity {
    let attrs = props.shape.clone().unwrap_or_default();
    let mut ec = commands.spawn((ReactNode(id), SvgShape { kind, attrs }));
    apply_shape_pointer(&mut ec, props);
    apply_animated(&mut ec, props);
    // A `transition` inside the attrs stamps the transition components (the
    // spec itself rides `SvgShape.attrs` — the stamp only makes the drive
    // query match; see `apply_shape_transition`).
    crate::transition::apply_shape_transition(&mut ec, props.shape.as_ref());
    warn_shape_scroll(props);
    ec.id()
}

/// Stamp (or clear) a shape's pointer components: the generic
/// [`apply_pointer_handlers`] set plus the shape-only [`SvgUserPos`] slot
/// (the user-space cursor [`crate::svg::interact::sync_shape_interactions`]
/// publishes for the event collectors). On full removal `Interaction` is
/// dropped too — unlike layout nodes (where it may be shared with hover/
/// press styling or a `<button>`), a shape's `Interaction` serves its
/// handlers alone, and a leftover would keep stealing clicks the `<svg>`
/// root's climb should own.
pub(super) fn apply_shape_pointer(ec: &mut EntityCommands, props: &Props) {
    apply_pointer_handlers(ec, props);
    let any = props.on_click
        || props.on_pointer_down
        || props.on_pointer_move
        || props.on_pointer_up
        || props.on_pointer_enter
        || props.on_pointer_leave;
    if any {
        ec.insert_if_new(SvgUserPos::default());
    } else {
        ec.remove::<Interaction>();
        ec.remove::<SvgUserPos>();
    }
}

/// `onScroll`/`onWheel` on a shape never fire — shapes are Node-less, so
/// there is no `ScrollPosition`/wheel surface to listen to. Mirrored into
/// devtools (the [`warn_ignored_attrs`](crate::svg::warn_ignored_attrs)
/// pattern); call under the op's `diag::node_scope`. The typed TSX surface
/// already omits these props on shapes — this covers untyped/JS-side misuse.
pub(super) fn warn_shape_scroll(props: &Props) {
    for (present, name) in [(props.on_scroll, "onScroll"), (props.on_wheel, "onWheel")] {
        if present {
            crate::diag::report(
                "svgShapeScroll",
                name,
                &format!(
                    "`{name}` on an SVG shape never fires \
                     (shapes are Node-less — no scroll surface)"
                ),
            );
        }
    }
}

/// Queue the merged `shape` attrs onto a shape entity's [`SvgShape`].
/// `dirty.shape` (the caller's gate) fired only on a real change
/// (`merge_delta` compares), and this write compares again through the
/// immutable borrow so an equal write never ticks `Changed<SvgShape>` — the
/// rasterizer's dirt signal. `"shape"` in `unset` merged to `None` → default
/// (empty) attrs.
pub(super) fn update_shape_attrs(ec: &mut EntityCommands, props: &Props) {
    let attrs = props.shape.clone().unwrap_or_default();
    ec.queue(move |mut entity: EntityWorldMut| {
        if entity.get::<SvgShape>().is_some_and(|s| s.attrs != attrs)
            && let Some(mut shape) = entity.get_mut::<SvgShape>()
        {
            shape.attrs = attrs;
        }
    });
}

/// Queue the merged `viewBox` onto an `<svg>` root's [`SvgSurface`] and
/// request a re-raster. Compared before writing so an equal value never
/// ticks `Changed<SvgSurface>` (the same discipline as
/// [`crate::svg::ensure_svg_image`]).
pub(super) fn update_view_box(ec: &mut EntityCommands, props: &Props) {
    let view_box = props.view_box;
    ec.queue(move |mut entity: EntityWorldMut| {
        if entity
            .get::<SvgSurface>()
            .is_some_and(|s| s.view_box != view_box)
            && let Some(mut surface) = entity.get_mut::<SvgSurface>()
        {
            surface.view_box = view_box;
            surface.dirty = true;
        }
    });
}
