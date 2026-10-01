//! The `<canvas>` element: a styled node whose element-owned `ImageNode`
//! texture the canvas rasterizer paints from its retained [`CanvasSurface`].
//! Two write paths: the declarative `draw` attribute (clear + replay) and the
//! imperative `drawAppend` (append — what a `<canvas ref>` handle's
//! `getContext()` flushes, riding an ordinary update op). A layout resize
//! clears the surface and sends `resize` — always, whether or not an
//! `onResize` is declared (the JS runtime needs it to replay a declarative
//! painter and to keep the handle's size fresh).

use bevy::prelude::*;
use bevy::ui::widget::NodeImageMode;
use serde::Serialize;

use bevy_react_core::element::{Attribute, Element, ElementEvent, ElementEvents, SpawnCtx};
use bevy_react_core::ext::{ElementFlags, LiveTexture};
use bevy_react_core::raster::clamp_physical_size;
use bevy_react_core::style::{Codec, Writer, owns};

use crate::{CanvasSurface, DrawCmd};

/// The declarative display list (the runtime records a painter function into
/// one). Act-now: present → the retained surface is **cleared and the list
/// replayed** (raster state reset first); `[]` clears the canvas.
pub static DRAW: Attribute<Vec<DrawCmd>> = Attribute {
    event: true,
    ..Attribute::with_codec("draw", Codec::serde_as("CanvasPainter | DrawCmd[]"))
};
/// Imperative commands appended to the retained surface (paint accumulates;
/// a leading `clear` makes the batch a replace). Act-now and wire-only: the
/// canvas handle sends it, JSX never does.
pub static DRAW_APPEND: Attribute<Vec<DrawCmd>> = Attribute {
    event: true,
    typed: false,
    ..Attribute::with_codec("drawAppend", Codec::serde_as("DrawCmd[]"))
};

/// The payload of `onResize`: the canvas's new laid-out size (logical px).
#[derive(Debug, Clone, Copy, Serialize, bevy_react_core::__private::ts_rs::TS)]
#[ts(crate = "bevy_react_core::__private::ts_rs")]
pub struct CanvasSize {
    pub width: f32,
    pub height: f32,
}

/// The canvas was laid out at a new size (first layout included): the
/// surface was cleared — redraw.
pub static RESIZE: ElementEvent<CanvasSize> = ElementEvent::new("resize").unconditional();

/// The `<canvas>` element.
pub static CANVAS: Element = Element {
    flags: ElementFlags::OWNS_IMAGE,
    attrs: &[&DRAW, &DRAW_APPEND],
    writers: &[&CANVAS_WRITER],
    suppress: &[&bevy_react_core::style::writers::BACKGROUND_IMAGE_WRITER],
    events: &[&RESIZE],
    spawn: Some(spawn_canvas),
    ts_ref: Some("BevyCanvasElement"),
    ..Element::new("canvas")
};

fn spawn_canvas(ctx: &mut SpawnCtx) -> Entity {
    let mut image = ImageNode::new(ctx.blank_image());
    image.image_mode = NodeImageMode::Stretch;
    ctx.spawn((
        image,
        CanvasSurface::new(Vec::new()),
        CanvasSizeTracker::default(),
        LiveTexture,
    ))
}

/// Feed the surface: a `draw` replaces the picture, a `drawAppend` appends.
/// Queued (not re-inserted) so the retained pixmap and pending imperative
/// commands survive.
pub static CANVAS_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[&DRAW, &DRAW_APPEND],
    writes: &[owns::<CanvasSurface>],
    apply: |ctx, _s, ec| {
        let draw = ctx.event(&DRAW).cloned();
        let append = ctx.event(&DRAW_APPEND).cloned();
        if draw.is_none() && append.is_none() {
            return;
        }
        ec.queue(move |mut entity: EntityWorldMut| {
            if let Some(mut surface) = entity.get_mut::<CanvasSurface>() {
                if let Some(cmds) = draw {
                    surface.set_display_list(cmds);
                }
                if let Some(cmds) = append {
                    surface.enqueue(cmds);
                }
            }
        });
    },
};

/// The last physical size reported as `resize` (see
/// [`collect_canvas_resize_events`]). `ComputedNode` is rewritten by layout
/// far more often than the size actually changes, so this compare is the
/// real filter. Starts `(0, 0)`, so the first layout fires an event.
#[derive(Component, Debug, Clone, Copy, Default)]
pub struct CanvasSizeTracker(pub (u32, u32));

/// Send `resize` (new logical size) for every canvas whose laid-out
/// **physical** size changed — including its first layout (0 → W×H) and a
/// DPR change at constant logical size, both of which cleared the retained
/// surface. Sizes clamp exactly like the rasterizer's, so the reported size
/// always matches the actual buffer.
#[allow(clippy::type_complexity)]
pub fn collect_canvas_resize_events(
    events: ElementEvents,
    mut query: Query<
        (Entity, &ComputedNode, &mut CanvasSizeTracker),
        (With<CanvasSurface>, Changed<ComputedNode>),
    >,
) {
    for (entity, node, mut tracker) in &mut query {
        let (w, h) = clamp_physical_size(node.size);
        if w == 0 || h == 0 || tracker.0 == (w, h) {
            continue;
        }
        tracker.0 = (w, h);
        let scale = if node.inverse_scale_factor > 0.0 {
            node.inverse_scale_factor
        } else {
            1.0
        };
        events.send(
            entity,
            &RESIZE,
            &CanvasSize {
                width: w as f32 * scale,
                height: h as f32 * scale,
            },
        );
    }
}
