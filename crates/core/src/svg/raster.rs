//! Rasterize svg-mode `<image>` surfaces ([`SvgDocument`]s) into element-owned
//! textures at laid-out size, and keep the intrinsic-size measure stamped
//! across `bevy_ui`'s clears. (The JSX `<svg>` element's raster is the
//! `bevy_react_svg` feature's own system, built on the same
//! [`crate::raster`] helpers.)
//!
//! [`update_svg_surfaces`] mirrors the `<canvas>` update discipline
//! (`bevy_react_canvas::update_canvas_surfaces`): CPU-side raster into the
//! node's [`ImageNode`] image, `contains` before `get_mut` so an idle surface
//! never re-uploads, a [`LayerContentDirt`](crate::layer::LayerContentDirt)
//! tap before every pixel write, and zero mutable derefs on a clean entity.

use bevy::asset::{AssetEvent, AssetId, Assets};
use bevy::ecs::change_detection::Ref;
use bevy::prelude::*;
use bevy::ui::widget::ImageNode;
use bevy::ui::{ComputedNode, ComputedUiRenderTargetInfo, ContentSize};

use super::{SvgDocument, SvgSurface, stamp_intrinsic_measure};
use crate::animations::AnimatedNode;
use crate::raster::upload_pixmap;
use crate::transition::TransitionState;

/// While a file-mode node's size is being eased, its raster re-runs only once
/// an axis has moved this fraction from the last raster (the `Stretch` image
/// mode carries the old pixels in between) — see [`resize_deferred`].
const EASE_RERASTER_RATIO: f32 = 0.12;

/// Whether a file-mode layout resize from `last` (the last rastered size) to
/// `size` is deferred: the node's size is in motion — its own `size` channel
/// (a `transition: { size }` ease or a shared-element flight) or a `Node`
/// layout binding — and no axis has drifted [`EASE_RERASTER_RATIO`] yet.
/// A resize the engine is not driving (a plain style change, a window
/// resize) re-rasters immediately, as does the frame the ease settles.
fn resize_deferred(
    state: Option<&TransitionState>,
    animated: Option<&AnimatedNode>,
    last: UVec2,
    size: UVec2,
) -> bool {
    let moving = state.is_some_and(TransitionState::size_in_flight)
        || animated.is_some_and(|a| a.0.has_node_props());
    if !moving {
        return false;
    }
    let ratio = |a: u32, b: u32| (a as f32 - b as f32).abs() / (b.max(1) as f32);
    ratio(size.x, last.x).max(ratio(size.y, last.y)) < EASE_RERASTER_RATIO
}

/// Rasterize `doc` into a `w`×`h` pixmap with the web's `<img>` behavior for
/// SVG sources: uniform scale, `xMidYMid meet` centering — the document's
/// intrinsic aspect is letterboxed into the target box, never stretched.
/// `None` on a zero-sized target.
pub fn rasterize_document(doc: &SvgDocument, w: u32, h: u32) -> Option<tiny_skia::Pixmap> {
    let mut pixmap = tiny_skia::Pixmap::new(w, h)?;
    render_document(doc, &mut pixmap);
    Some(pixmap)
}

/// [`rasterize_document`] onto a caller-owned transparent pixmap (the raster
/// system's reused one) — resvg composites over whatever is there, so a
/// cleared pixmap paints identically to a fresh one.
fn render_document(doc: &SvgDocument, pixmap: &mut tiny_skia::Pixmap) {
    if doc.size.x <= 0.0 || doc.size.y <= 0.0 {
        return; // nothing to draw (usvg guarantees non-zero)
    }
    // Same `xMidYMid meet` math as the JSX painter's viewBox fit — one shared
    // helper (`crate::raster::meet_transform`), two callers.
    let transform =
        crate::raster::meet_transform(Vec2::ZERO, doc.size, pixmap.width(), pixmap.height());
    resvg::render(&doc.tree, transform, &mut pixmap.as_mut());
}

/// Drain the frame's [`SvgDocument`] asset events into the set of documents
/// that finished loading or hot-reloaded — each forces a re-raster (and a
/// measure re-stamp) of every node displaying it.
fn touched_docs(events: &mut MessageReader<AssetEvent<SvgDocument>>) -> Vec<AssetId<SvgDocument>> {
    let mut touched = Vec::new();
    for event in events.read() {
        if let AssetEvent::LoadedWithDependencies { id } | AssetEvent::Modified { id } = event {
            touched.push(*id);
        }
    }
    touched
}

/// Repaint every svg-mode surface whose raster is stale — a repaint request
/// (`dirty`), a layout resize (deferred while the engine eases the size, see
/// [`resize_deferred`]), or a document load/hot-reload — and upload the
/// result into the backing image. Reads the node's size from [`ComputedNode`]
/// (already physical px, so HiDPI rasters crisp); a freshly-mounted node has
/// no size yet and rasters next frame, once layout ran.
#[allow(clippy::type_complexity)]
pub fn update_svg_surfaces(
    mut images: ResMut<Assets<Image>>,
    docs: Res<Assets<SvgDocument>>,
    mut doc_events: MessageReader<AssetEvent<SvgDocument>>,
    mut dirt: ResMut<crate::layer::LayerContentDirt>,
    mut query: Query<(
        Entity,
        &ComputedNode,
        &ImageNode,
        &mut SvgSurface,
        &mut ContentSize,
        Option<&TransitionState>,
        Option<&AnimatedNode>,
    )>,
) {
    let touched = touched_docs(&mut doc_events);
    for (entity, node, image_node, mut surface, mut content_size, state, animated) in &mut query {
        let doc_handle = &surface.doc;
        let Some(doc) = docs.get(doc_handle) else {
            continue; // not loaded yet; `dirty` stays set, rasters on load
        };
        let doc_touched = touched.contains(&doc_handle.id());
        let (w, h) = crate::raster::clamp_physical_size(node.size);
        if w == 0 || h == 0 {
            // Not laid out (fresh node) or hidden (`display: none`). A doc
            // hot-reload seen now would otherwise be lost with the drained
            // event — persist it into `dirty` so a re-show at the *same* size
            // still re-rasters. Compare-before-write keeps the plain
            // zero-size skip deref-free.
            if doc_touched && !surface.dirty {
                surface.dirty = true;
            }
            continue;
        }
        let size = UVec2::new(w, h);
        if !surface.dirty && surface.last_size == size && !doc_touched {
            continue; // clean: not a single mutable deref taken
        }
        // A resize the engine is easing keeps stretching the previous raster
        // until it settles or drifts far enough (deref-free, like the clean
        // path) — a `resvg::render` + upload per eased frame is the cost.
        if !surface.dirty
            && !doc_touched
            && surface.last_size != UVec2::ZERO
            && resize_deferred(state, animated, surface.last_size, size)
        {
            continue;
        }
        // `contains` (not `get_mut`) so a skipped raster below never flags the
        // asset changed — and thus re-uploaded — for nothing.
        if !images.contains(&image_node.image) {
            continue;
        }
        // The buffers are a cache: written past change detection so this
        // repaint ticks `SvgSurface` only through the state writes below.
        let raster = &mut surface.bypass_change_detection().raster;
        let Some(mut pixmap) = raster.take_pixmap(w, h) else {
            continue;
        };
        render_document(doc, &mut pixmap);
        upload_pixmap(
            entity,
            image_node,
            &mut images,
            &mut dirt,
            w,
            h,
            &pixmap,
            raster,
        );
        raster.keep_pixmap(pixmap);
        // First successful raster for this node: stamp the intrinsic measure.
        // This covers docs that arrive without a load event (e.g. parked
        // directly into `Assets` — only `Added` fires); an event-carrying
        // load/hot-reload is `stamp_svg_measures`'s job — it reads the same
        // event this same frame, in PostUpdate — so `doc_touched` deliberately
        // does not re-stamp here (no double stamp).
        if surface.last_size == UVec2::ZERO {
            let scale_factor = crate::raster::node_scale_factor(node);
            stamp_intrinsic_measure(
                &mut content_size,
                doc.size,
                scale_factor,
                image_node.visual_box,
            );
        }
        // Compare-before-write: any `deref_mut` ticks `Changed<SvgSurface>`,
        // so touch only the fields that are actually stale.
        if surface.last_size != size {
            surface.last_size = size;
        }
        if surface.dirty {
            surface.dirty = false;
        }
    }
}

/// Re-stamp the svg intrinsic measure after `bevy_ui` may have cleared it.
///
/// `bevy_ui`'s `update_image_content_size_system` (`PostUpdate`,
/// `UiSystems::Content`) **clears** the `ContentSize` measure of any
/// non-`Auto`-mode `ImageNode` that changed this frame — and every svg-mode
/// prop rebuild re-inserts the `ImageNode` (svg mode is `Stretch`), so the
/// measure would vanish on each delta. Registered after that system / before
/// `UiSystems::Layout`, this re-stamps only when a trigger fired: the
/// `ImageNode` changed (exactly the clear condition), the render-target scale
/// factor changed (`bevy_ui`'s own re-measure trigger), or the document
/// finished loading / hot-reloaded. No trigger → no `ContentSize` deref → no
/// spurious relayout.
pub fn stamp_svg_measures(
    docs: Res<Assets<SvgDocument>>,
    mut doc_events: MessageReader<AssetEvent<SvgDocument>>,
    mut query: Query<(
        Ref<ImageNode>,
        &SvgSurface,
        &mut ContentSize,
        Ref<ComputedUiRenderTargetInfo>,
    )>,
) {
    let touched = touched_docs(&mut doc_events);
    for (image, surface, mut content_size, target) in &mut query {
        let doc_handle = &surface.doc;
        if !image.is_changed() && !target.is_changed() && !touched.contains(&doc_handle.id()) {
            continue;
        }
        let Some(doc) = docs.get(doc_handle) else {
            continue; // not loaded; the load event re-triggers this later
        };
        let sf = target.scale_factor();
        let scale_factor = if sf > 0.0 { sf } else { 1.0 };
        stamp_intrinsic_measure(&mut content_size, doc.size, scale_factor, image.visual_box);
    }
}

#[cfg(test)]
mod tests;
