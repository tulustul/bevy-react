//! The JSX `<svg>` element and its shape children as registered
//! [`Element`]s: the `<svg>` root (a styled node with an element-owned
//! raster texture the rasterizer paints from the Node-less [`SvgShape`]
//! children) and the eight shape intrinsics (`<circle>`/`<rect>`/…/`<g>`),
//! each listing its own subset of [`crate::attrs`]. Two writers keep the ECS
//! in step with the attributes — compare-before-write, so an unchanged
//! re-send never ticks the raster's dirt signals.

use bevy::picking::Pickable;
use bevy::prelude::*;
use bevy::ui::widget::NodeImageMode;

use super::attrs::{self, *};
use super::{ShapeKind, SvgJsxSurface, SvgShape};
use bevy_react_core::element::{AnyAttribute, Common, Element, SpawnCtx};
use bevy_react_core::ext::ElementFlags;
use bevy_react_core::style::{Writer, owns};

/// The `<svg>` root: a styled node whose element-owned `ImageNode` the svg
/// rasterizer paints; `viewBox` maps the shapes' user units onto the
/// laid-out box (none = logical-pixel space).
pub static SVG: Element = Element {
    flags: ElementFlags::OWNS_IMAGE,
    attrs: &[&VIEW_BOX],
    writers: &[&VIEW_BOX_WRITER],
    suppress: &[&bevy_react_core::style::writers::BACKGROUND_IMAGE_WRITER],
    spawn: Some(spawn_svg),
    ..Element::new("svg")
};

/// The shapes' writer list (one writer, shared by every shape).
const SHAPE_WRITERS: &[&Writer] = &[&SHAPE_WRITER];

/// A shape element: Node-less (no style, no layout box — the enclosing
/// `<svg>` paints it), pointer handlers and identity its only common props.
const fn shape(name: &'static str, attrs: &'static [&'static dyn AnyAttribute]) -> Element {
    Element {
        flags: ElementFlags::NODE_LESS,
        attrs,
        common: Common::IDENTITY.with(Common::POINTER),
        writers: SHAPE_WRITERS,
        spawn: Some(spawn_shape),
        ..Element::new(name)
    }
}

pub static CIRCLE: Element = shape(
    "circle",
    &[
        &CX,
        &CY,
        &R,
        &FILL,
        &STROKE,
        &STROKE_WIDTH,
        &OPACITY,
        &FILL_RULE,
        &STROKE_LINECAP,
        &STROKE_LINEJOIN,
        &TRANSFORM,
        &TRANSITION,
    ],
);
pub static RECT: Element = shape(
    "rect",
    &[
        &X,
        &Y,
        &WIDTH,
        &HEIGHT,
        &RX,
        &RY,
        &FILL,
        &STROKE,
        &STROKE_WIDTH,
        &OPACITY,
        &FILL_RULE,
        &STROKE_LINECAP,
        &STROKE_LINEJOIN,
        &TRANSFORM,
        &TRANSITION,
    ],
);
pub static ELLIPSE: Element = shape(
    "ellipse",
    &[
        &CX,
        &CY,
        &RX,
        &RY,
        &FILL,
        &STROKE,
        &STROKE_WIDTH,
        &OPACITY,
        &FILL_RULE,
        &STROKE_LINECAP,
        &STROKE_LINEJOIN,
        &TRANSFORM,
        &TRANSITION,
    ],
);
pub static LINE: Element = shape(
    "line",
    &[
        &X1,
        &Y1,
        &X2,
        &Y2,
        &FILL,
        &STROKE,
        &STROKE_WIDTH,
        &OPACITY,
        &FILL_RULE,
        &STROKE_LINECAP,
        &STROKE_LINEJOIN,
        &TRANSFORM,
        &TRANSITION,
    ],
);
pub static POLYLINE: Element = shape(
    "polyline",
    &[
        &POINTS,
        &FILL,
        &STROKE,
        &STROKE_WIDTH,
        &OPACITY,
        &FILL_RULE,
        &STROKE_LINECAP,
        &STROKE_LINEJOIN,
        &TRANSFORM,
        &TRANSITION,
    ],
);
pub static POLYGON: Element = shape(
    "polygon",
    &[
        &POINTS,
        &FILL,
        &STROKE,
        &STROKE_WIDTH,
        &OPACITY,
        &FILL_RULE,
        &STROKE_LINECAP,
        &STROKE_LINEJOIN,
        &TRANSFORM,
        &TRANSITION,
    ],
);
pub static PATH: Element = shape(
    "path",
    &[
        &D,
        &FILL,
        &STROKE,
        &STROKE_WIDTH,
        &OPACITY,
        &FILL_RULE,
        &STROKE_LINECAP,
        &STROKE_LINEJOIN,
        &TRANSFORM,
        &TRANSITION,
    ],
);
/// `<g>`: a group — its `transform` and `opacity` apply to every
/// descendant shape. Groups are never hit (no geometry), so they take no
/// pointer handlers.
pub static G: Element = Element {
    common: Common::IDENTITY,
    ..shape("g", &[&TRANSFORM, &OPACITY, &TRANSITION])
};

/// Every element this crate registers.
pub static SVG_ELEMENTS: &[&Element] = &[
    &SVG, &PATH, &RECT, &CIRCLE, &ELLIPSE, &LINE, &POLYLINE, &POLYGON, &G,
];

fn spawn_svg(ctx: &mut SpawnCtx) -> Entity {
    let mut image = ImageNode::new(ctx.blank_image());
    image.image_mode = NodeImageMode::Stretch;
    let view_box = ctx.props.attrs.get(&VIEW_BOX).copied();
    ctx.spawn((
        image,
        SvgJsxSurface::new(view_box),
        bevy_react_core::ext::LiveTexture,
    ))
}

/// Spawn a shape child carrying its kind + assembled attrs. Pass-through for
/// picking: the refined shape hit (`crate::pick::refine_svg_pointer_hits`)
/// puts the shape at the top of the pointer's hit stack, and bevy's hover
/// map treats an entity WITHOUT a `Pickable` as blocking — which would hide
/// the `<svg>` root and every ancestor (a `<button>`, its press surface) from
/// hover, press, and `Pointer<Click>`. Like a pass node, a shape never blocks
/// what is beneath it (the collectors' topmost-wins rule still lets a
/// handler-bearing shape own its own click).
fn spawn_shape(ctx: &mut SpawnCtx) -> Entity {
    let kind = ShapeKind::from_kind(ctx.kind).unwrap_or(ShapeKind::Group);
    let attrs = attrs::assemble(&ctx.props.attrs);
    ctx.spawn((
        SvgShape { kind, attrs },
        Pickable {
            should_block_lower: false,
            is_hoverable: true,
        },
    ))
}

/// The shapes' writer: gather the merged attributes into `SvgShape.attrs`
/// (compare-before-write — `Changed<SvgShape>` is the rasterizer's dirt
/// signal) and keep the transition stamp in step with `transition`.
pub static SHAPE_WRITER: Writer = Writer {
    reads: &[],
    attrs: attrs::ALL,
    writes: &[owns::<SvgShape>],
    apply: |ctx, _s, ec| {
        let attrs = attrs::assemble(ctx.attrs);
        if ctx.fresh {
            // The spawn assembled the attrs; only the transition stamp is
            // left to add.
            if attrs.transition.is_some() {
                super::transition::apply_shape_transition(ec, Some(&attrs));
            }
            return;
        }
        super::transition::apply_shape_transition(ec, Some(&attrs));
        ec.queue(move |mut entity: EntityWorldMut| {
            if entity.get::<SvgShape>().is_some_and(|s| s.attrs != attrs)
                && let Some(mut shape) = entity.get_mut::<SvgShape>()
            {
                shape.attrs = attrs;
            }
        });
    },
};

/// The `<svg>` root's writer: the merged `viewBox` onto its surface, with a
/// re-raster request — compared first so an equal value never ticks
/// `Changed<SvgJsxSurface>`.
pub static VIEW_BOX_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[&VIEW_BOX],
    writes: &[owns::<SvgJsxSurface>],
    apply: |ctx, _s, ec| {
        if ctx.fresh {
            return;
        }
        let view_box = ctx.attrs.get(&VIEW_BOX).copied();
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
    },
};
