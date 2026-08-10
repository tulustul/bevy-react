//! Rasterize svg surfaces into element-owned textures at laid-out size —
//! [`SvgDocument`]s for file mode, the ECS [`SvgShape`] tree for JSX mode —
//! and keep the file-mode intrinsic-size measure stamped across `bevy_ui`'s
//! clears.
//!
//! [`update_svg_surfaces`] mirrors the `<canvas>` update discipline
//! ([`crate::canvas::update_canvas_surfaces`]): CPU-side raster into the
//! node's [`ImageNode`] image, `contains` before `get_mut` so an idle surface
//! never re-uploads, a [`LayerContentDirt`](crate::layer::LayerContentDirt)
//! tap before every pixel write, and zero mutable derefs on a clean entity.
//! JSX repaint dirt is **derived, not flagged**: shape-attr and child-list
//! changes tick `Changed<SvgShape>`/`Changed<Children>` (the reconcile writes
//! are compare-before-write, so the ticks are real changes) — plus
//! `RemovedComponents<Children>` for a container emptied of its last child —
//! and this system climbs each to its enclosing `<svg>` root. Only `viewBox`
//! changes and the mount state ride the explicit `SvgSurface::dirty` flag.

use bevy::asset::{AssetEvent, AssetId, Assets};
use bevy::ecs::change_detection::Ref;
use bevy::ecs::entity::EntityHashSet;
use bevy::prelude::*;
use bevy::render::render_resource::Extent3d;
use bevy::ui::widget::ImageNode;
use bevy::ui::{ComputedNode, ComputedUiRenderTargetInfo, ContentSize};

use super::walk::{ShapeQuery, climb_to_svg_root, walk_shapes};
use super::{SvgDocument, SvgShape, SvgSurface, stamp_intrinsic_measure};

/// Rasterize `doc` into a `w`×`h` pixmap with the web's `<img>` behavior for
/// SVG sources: uniform scale, `xMidYMid meet` centering — the document's
/// intrinsic aspect is letterboxed into the target box, never stretched.
/// `None` on a zero-sized target.
pub fn rasterize_document(doc: &SvgDocument, w: u32, h: u32) -> Option<tiny_skia::Pixmap> {
    let mut pixmap = tiny_skia::Pixmap::new(w, h)?;
    if doc.size.x <= 0.0 || doc.size.y <= 0.0 {
        return Some(pixmap); // nothing to draw (usvg guarantees non-zero)
    }
    // Same `xMidYMid meet` math as the JSX painter's viewBox fit — one shared
    // helper, two callers (see `paint::view_box_transform`).
    let transform = super::paint::meet_transform(Vec2::ZERO, doc.size, w, h);
    resvg::render(&doc.tree, transform, &mut pixmap.as_mut());
    Some(pixmap)
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

/// Repaint every svg surface whose raster is stale — a repaint request
/// (`dirty`), a layout resize, a document load/hot-reload (file mode), or a
/// shape/child-list change (JSX mode, derived below) — and upload the result
/// into the backing image. Reads the node's size from [`ComputedNode`]
/// (already physical px, so HiDPI rasters crisp); a freshly-mounted node has
/// no size yet and rasters next frame, once layout ran.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn update_svg_surfaces(
    mut images: ResMut<Assets<Image>>,
    docs: Res<Assets<SvgDocument>>,
    mut doc_events: MessageReader<AssetEvent<SvgDocument>>,
    mut dirt: ResMut<crate::layer::LayerContentDirt>,
    mut query: Query<(
        Entity,
        &ComputedNode,
        &ImageNode,
        Option<&Children>,
        &mut SvgSurface,
        &mut ContentSize,
    )>,
    shapes: ShapeQuery,
    changed_shapes: Query<Entity, Changed<SvgShape>>,
    changed_children: Query<Entity, (Changed<Children>, Or<(With<SvgShape>, With<SvgSurface>)>)>,
    mut removed_children: RemovedComponents<Children>,
    parents: Query<&ChildOf>,
    svg_roots: Query<(), With<SvgSurface>>,
) {
    // JSX dirt derivation, inline rather than a separate system: the signals
    // are `Changed<…>` filters relative to THIS system's last run, which is
    // exactly the "what changed since I last rastered" question — a prelude
    // system would need a handoff resource and its own tick bookkeeping for
    // zero ordering benefit. The reconcile writes are queued commands flushed
    // in `apply_js_ops`'s sync point, so they are visible here same-frame
    // (pinned by `shape_delta_rerasters_same_frame`).
    let mut jsx_dirty = EntityHashSet::default();
    for entity in &changed_shapes {
        if let Some(root) = climb_to_svg_root(entity, &parents, &svg_roots) {
            jsx_dirty.insert(root);
        }
    }
    for entity in &changed_children {
        // The root's own child list changed (shape attach/remove/reorder), or
        // a `<g>`'s did — the latter climbs like any shape change.
        if svg_roots.contains(entity) {
            jsx_dirty.insert(entity);
        } else if let Some(root) = climb_to_svg_root(entity, &parents, &svg_roots) {
            jsx_dirty.insert(root);
        }
    }
    // Removing the LAST child is invisible to `Changed<Children>`: bevy's
    // `ChildOf` on_remove hook removes the now-empty `Children` component
    // outright (bevy_ecs relationship/mod.rs), and a filter can't match a
    // component that is gone. Catch it via removal events — only for a
    // still-alive svg root or shape group (a despawned entity's own removal
    // is covered by its parent's `Changed`/removed signal).
    for entity in removed_children.read() {
        if svg_roots.contains(entity) {
            jsx_dirty.insert(entity);
        } else if shapes.contains(entity)
            && let Some(root) = climb_to_svg_root(entity, &parents, &svg_roots)
        {
            jsx_dirty.insert(root);
        }
    }

    let touched = touched_docs(&mut doc_events);
    for (entity, node, image_node, children, mut surface, mut content_size) in &mut query {
        // `None` is a JSX `<svg>` root — its picture is the `SvgShape`
        // children, not an asset.
        let Some(doc_handle) = surface.doc.as_ref() else {
            raster_jsx_surface(
                entity,
                node,
                image_node,
                children,
                &mut surface,
                jsx_dirty.contains(&entity),
                &shapes,
                &mut images,
                &mut dirt,
            );
            continue;
        };
        let Some(doc) = docs.get(doc_handle) else {
            continue; // not loaded yet; `dirty` stays set, rasters on load
        };
        let doc_touched = touched.contains(&doc_handle.id());
        let (w, h) = crate::canvas::clamp_physical_size(node.size);
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
        // `contains` (not `get_mut`) so a skipped raster below never flags the
        // asset changed — and thus re-uploaded — for nothing.
        if !images.contains(&image_node.image) {
            continue;
        }
        let Some(pixmap) = rasterize_document(doc, w, h) else {
            continue;
        };
        upload_pixmap(entity, image_node, &mut images, &mut dirt, w, h, &pixmap);
        // First successful raster for this node: stamp the intrinsic measure.
        // This covers docs that arrive without a load event (e.g. parked
        // directly into `Assets` — only `Added` fires); an event-carrying
        // load/hot-reload is `stamp_svg_measures`'s job — it reads the same
        // event this same frame, in PostUpdate — so `doc_touched` deliberately
        // does not re-stamp here (no double stamp).
        if surface.last_size == UVec2::ZERO {
            let scale_factor = if node.inverse_scale_factor > 0.0 {
                node.inverse_scale_factor.recip()
            } else {
                1.0
            };
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

/// The JSX branch of [`update_svg_surfaces`]: paint the root's [`SvgShape`]
/// children (depth-first, groups composed — see [`walk_shapes`]) through the
/// viewBox fit into a fresh pixmap and upload it. `derived_dirty` is the
/// walked `Changed<SvgShape>`/`Changed<Children>` signal for this root;
/// `surface.dirty` covers the mount state and `viewBox` writes. Same
/// discipline as the file branch: clean roots take zero mutable derefs, and
/// derived-dirt repaints never touch `SvgSurface` at all.
#[allow(clippy::too_many_arguments)] // a private per-entity slice of the system's params
fn raster_jsx_surface(
    entity: Entity,
    node: &ComputedNode,
    image_node: &ImageNode,
    children: Option<&Children>,
    surface: &mut Mut<SvgSurface>,
    derived_dirty: bool,
    shapes: &ShapeQuery,
    images: &mut Assets<Image>,
    dirt: &mut crate::layer::LayerContentDirt,
) {
    let (w, h) = crate::canvas::clamp_physical_size(node.size);
    if w == 0 || h == 0 {
        // Not laid out (fresh node) or hidden (`display: none`). Derived dirt
        // is a one-shot `Changed<…>` signal — persist it into `dirty` so a
        // re-show at the *same* size still repaints. Compare-before-write
        // keeps the plain zero-size skip deref-free.
        if derived_dirty && !surface.dirty {
            surface.dirty = true;
        }
        return;
    }
    let size = UVec2::new(w, h);
    if !surface.dirty && surface.last_size == size && !derived_dirty {
        return; // clean: not a single mutable deref taken
    }
    // `contains` (not `get_mut`) so a skipped raster below never flags the
    // asset changed — and thus re-uploaded — for nothing.
    if !images.contains(&image_node.image) {
        return;
    }
    let Some(mut pixmap) = tiny_skia::Pixmap::new(w, h) else {
        return;
    };
    let scale_factor = if node.inverse_scale_factor > 0.0 {
        node.inverse_scale_factor.recip()
    } else {
        1.0
    };
    let transform = super::paint::view_box_transform(surface.view_box.as_ref(), w, h, scale_factor);
    if let Some(children) = children {
        walk_shapes(children, shapes, transform, 1.0, &mut |_, shape, t, o| {
            super::paint::paint_shape(&mut pixmap, shape.kind, &shape.attrs, t, o);
        });
    }
    upload_pixmap(entity, image_node, images, dirt, w, h, &pixmap);
    // Compare-before-write: any `deref_mut` ticks `Changed<SvgSurface>`, so
    // touch only the fields that are actually stale.
    if surface.last_size != size {
        surface.last_size = size;
    }
    if surface.dirty {
        surface.dirty = false;
    }
}

/// Upload freshly-painted pixels into the node's element-owned image: the
/// [`LayerContentDirt`](crate::layer::LayerContentDirt) tap first (a real
/// pixel write stales the owning layer's capture), then resize-if-needed and
/// the straight-alpha write. Shared by the file and JSX branches — callers
/// verified `images.contains` before painting.
fn upload_pixmap(
    entity: Entity,
    image_node: &ImageNode,
    images: &mut Assets<Image>,
    dirt: &mut crate::layer::LayerContentDirt,
    w: u32,
    h: u32,
    pixmap: &tiny_skia::Pixmap,
) {
    dirt.nodes.push(entity);
    let Some(mut image) = images.get_mut(&image_node.image) else {
        return;
    };
    let extent = Extent3d {
        width: w,
        height: h,
        depth_or_array_layers: 1,
    };
    if image.texture_descriptor.size != extent {
        image.resize(extent);
    }
    image.data = Some(crate::canvas::to_straight_alpha(pixmap));
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
        let Some(doc_handle) = surface.doc.as_ref() else {
            continue; // future JSX mode: no asset-backed intrinsic size
        };
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
