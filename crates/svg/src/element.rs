//! The JSX `<svg>` element and its shape children as a registered
//! [`ElementKind`]: the `<svg>` root (a styled node with an element-owned
//! raster texture the rasterizer paints from the Node-less [`SvgShape`]
//! children) and the eight shape intrinsics (`<circle>`/`<rect>`/…/`<g>`),
//! plus the two queued compare-before-write updates (`shape` attrs,
//! `viewBox`). The svg machinery itself lives in the sibling modules; this
//! is the op glue a feature crate registers.

use bevy::picking::Pickable;
use bevy::prelude::*;
use bevy::ui::FocusPolicy;
use bevy::ui::widget::NodeImageMode;

use super::{ShapeAttrs, ShapeKind, SvgJsxSurface, SvgShape, ViewBox};
use bevy_react_core::ext::{
    ElementCtx, ElementFlags, ElementKind, ElementUpdateCtx, EventLocalPos,
};
use bevy_react_core::protocol::props::{Props, PropsDirty};

/// The `<svg>` root kind plus the shape kinds.
pub struct SvgElements;

const KINDS: &[&str] = &[
    "svg", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "g",
];

impl ElementKind for SvgElements {
    fn kinds(&self) -> &'static [&'static str] {
        KINDS
    }

    fn flags(&self, kind: &str) -> ElementFlags {
        if kind == "svg" {
            ElementFlags::OWNS_IMAGE
        } else {
            ElementFlags::NODE_LESS
        }
    }

    fn spawn(
        &self,
        ctx: &mut ElementCtx<'_, '_, '_>,
        kind: &str,
        props: &Props,
        _text: Option<&str>,
    ) -> Entity {
        match ShapeKind::from_kind(kind) {
            Some(shape) => create_shape(ctx, shape, props),
            None => create_svg_root(ctx, props),
        }
    }

    fn update(
        &self,
        ctx: &mut ElementUpdateCtx<'_>,
        ec: &mut EntityCommands,
        kind: &str,
        props: &Props,
        dirty: &PropsDirty,
    ) {
        if kind == "svg" {
            if dirty.ext_dirty("viewBox") {
                update_view_box(ec, props);
            }
            return;
        }
        // An SVG shape child: a Node-less entity (no style, no layout) whose
        // prop surface is the atomically-replaced `shape` attrs plus the
        // pointer handlers — nothing else applies to a shape.
        if dirty.ext_dirty("shape") {
            update_shape_attrs(ec, props);
            // Bindings derive from the (atomically replaced) attrs — their
            // only source on a styleless shape — so any shape change may
            // add/remove/retarget them.
            ctx.stamp_animated(ec, props);
            // Same for the transition stamp: the spec rides the attrs, so an
            // atomic replace may add or remove it.
            super::transition::apply_shape_transition(ec, shape_attrs(props));
        }
        if dirty.pointer {
            apply_shape_pointer(ctx, ec, props);
        }
        if dirty.scroll_listener || dirty.wheel {
            warn_shape_scroll(props);
        }
    }
}

fn shape_attrs(props: &Props) -> Option<&ShapeAttrs> {
    props.ext.get::<ShapeAttrs>("shape")
}

/// Spawn a JSX `<svg>` root: a styled node carrying an `ImageNode` whose
/// element-owned texture the svg rasterizer paints from the Node-less
/// [`SvgShape`] children; `viewBox` maps their user units onto the laid-out
/// box (see [`crate::svg`]).
fn create_svg_root(ctx: &mut ElementCtx<'_, '_, '_>, props: &Props) -> Entity {
    let mut node_img = ImageNode::new(ctx.blank_image());
    node_img.image_mode = NodeImageMode::Stretch;
    let view_box = props.ext.get::<ViewBox>("viewBox").copied();
    let entity = ctx.spawn_styled(props, FocusPolicy::Pass);
    ctx.commands.entity(entity).insert((
        node_img,
        SvgJsxSurface::new(view_box),
        bevy_react_core::ext::LiveTexture,
        ElementFlags::OWNS_IMAGE,
    ));
    ctx.stamp_common(entity, props);
    entity
}

/// Spawn an SVG shape child (`<circle>`/`<rect>`/…/`<g>`): a **Node-less**
/// entity (the `textSpan` precedent) carrying only its kind + folded attrs —
/// no style, no layout box, no `stamp_common` (of the common props only the
/// pointer handlers apply, stamped below); the enclosing `<svg>` root paints
/// it. A `<g>` often carries no attrs at all → default attrs. `{ animated }`
/// wrappers on the numeric attrs stamp an
/// [`AnimatedNode`](bevy_react_core::animations::AnimatedNode) (on a styleless shape
/// the bindings derive from the attrs alone).
fn create_shape(ctx: &mut ElementCtx<'_, '_, '_>, kind: ShapeKind, props: &Props) -> Entity {
    let attrs = shape_attrs(props).cloned().unwrap_or_default();
    let entity = ctx.spawn_bare();
    // Pass-through for picking: the refined shape hit
    // (`crate::pick::refine_svg_pointer_hits`) puts the shape at the top
    // of the pointer's hit stack, and bevy's hover map treats an entity
    // WITHOUT a `Pickable` as blocking — which would hide the `<svg>` root and
    // every ancestor (a `<button>`, its press surface) from hover, press, and
    // `Pointer<Click>`. Shapes have no `focusPolicy`; like a pass node they
    // never block what is beneath them (the collectors' topmost-wins rule
    // still lets a handler-bearing shape own its own click).
    ctx.commands.entity(entity).insert((
        SvgShape { kind, attrs },
        ElementFlags::NODE_LESS,
        Pickable {
            should_block_lower: false,
            is_hoverable: true,
        },
    ));
    ctx.stamp_pointer_handlers(entity, props);
    ctx.stamp_animated(entity, props);
    let mut ec = ctx.commands.entity(entity);
    stamp_shape_pointer_slot(&mut ec, props);
    // A `transition` inside the attrs stamps the transition components (the
    // spec itself rides `SvgShape.attrs` — the stamp only makes the drive
    // query match; see `apply_shape_transition`).
    super::transition::apply_shape_transition(&mut ec, shape_attrs(props));
    warn_shape_scroll(props);
    entity
}

fn any_pointer_handler(props: &Props) -> bool {
    props.on_click
        || props.on_pointer_down
        || props.on_pointer_move
        || props.on_pointer_up
        || props.on_pointer_enter
        || props.on_pointer_leave
}

/// The shape-only [`EventLocalPos`] slot (the user-space cursor
/// [`crate::interact::sync_shape_interactions`] publishes for the event
/// collectors), present exactly when the shape declares a pointer handler.
fn stamp_shape_pointer_slot(ec: &mut EntityCommands, props: &Props) {
    if any_pointer_handler(props) {
        ec.insert_if_new(EventLocalPos::default());
    } else {
        ec.remove::<EventLocalPos>();
    }
}

/// Stamp (or clear) a shape's pointer components on a delta: the generic
/// pointer-handler set plus the shape-only [`EventLocalPos`] slot. On full
/// removal `Interaction` is dropped too — unlike layout nodes (where it may
/// be shared with hover/press styling or a `<button>`), a shape's
/// `Interaction` serves its handlers alone, and a leftover would keep
/// stealing clicks the `<svg>` root's climb should own.
fn apply_shape_pointer(ctx: &mut ElementUpdateCtx<'_>, ec: &mut EntityCommands, props: &Props) {
    ctx.stamp_pointer_handlers(ec, props);
    stamp_shape_pointer_slot(ec, props);
    if !any_pointer_handler(props) {
        ec.remove::<Interaction>();
    }
}

/// `onScroll`/`onWheel` on a shape never fire — shapes are Node-less, so
/// there is no `ScrollPosition`/wheel surface to listen to. Mirrored into
/// devtools (the [`warn_ignored_attrs`](crate::warn_ignored_attrs)
/// pattern); call under the op's `diag::node_scope`. The typed TSX surface
/// already omits these props on shapes — this covers untyped/JS-side misuse.
fn warn_shape_scroll(props: &Props) {
    for (present, name) in [(props.on_scroll, "onScroll"), (props.on_wheel, "onWheel")] {
        if present {
            bevy_react_core::diag::report(
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
/// `dirty.ext_dirty("shape")` (the caller's gate) fired only on a real change
/// (`merge_delta` compares), and this write compares again through the
/// immutable borrow so an equal write never ticks `Changed<SvgShape>` — the
/// rasterizer's dirt signal. `"shape"` in `unset` merged to absent → default
/// (empty) attrs.
fn update_shape_attrs(ec: &mut EntityCommands, props: &Props) {
    let attrs = shape_attrs(props).cloned().unwrap_or_default();
    ec.queue(move |mut entity: EntityWorldMut| {
        if entity.get::<SvgShape>().is_some_and(|s| s.attrs != attrs)
            && let Some(mut shape) = entity.get_mut::<SvgShape>()
        {
            shape.attrs = attrs;
        }
    });
}

/// Queue the merged `viewBox` onto an `<svg>` root's [`SvgJsxSurface`] and
/// request a re-raster. Compared before writing so an equal value never
/// ticks `Changed<SvgJsxSurface>` (the same discipline as
/// [`crate::ensure_svg_image`]).
fn update_view_box(ec: &mut EntityCommands, props: &Props) {
    let view_box = props.ext.get::<ViewBox>("viewBox").copied();
    ec.queue(move |mut entity: EntityWorldMut| {
        if entity
            .get::<SvgJsxSurface>()
            .is_some_and(|s| s.view_box != view_box)
            && let Some(mut surface) = entity.get_mut::<SvgJsxSurface>()
        {
            surface.view_box = view_box;
            surface.dirty = true;
        }
    });
}
