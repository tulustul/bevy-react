//! The JSX `<svg>` element's surface and raster: the root's element-owned
//! texture is repainted from its Node-less [`SvgShape`] children (depth-first,
//! groups composed — see [`walk_shapes`]) through the `viewBox` fit, on the
//! same discipline as the core's canvas and svg-mode image rasters (CPU
//! raster into the [`ImageNode`] image, `contains` before `get_mut`, a
//! [`LayerContentDirt`](bevy_react_core::layer::LayerContentDirt) tap before every pixel
//! write, zero mutable derefs on a clean entity).
//!
//! Repaint dirt is **derived, not flagged**: shape-attr and child-list changes
//! tick `Changed<SvgShape>`/`Changed<Children>` (the element's writes are
//! compare-before-write, so the ticks are real changes) — plus
//! `RemovedComponents<Children>` for a container emptied of its last child —
//! and the system climbs each to its enclosing `<svg>` root. Only `viewBox`
//! changes and the mount state ride the explicit [`SvgJsxSurface::dirty`] flag.

use bevy::ecs::entity::EntityHashSet;
use bevy::prelude::*;
use bevy::ui::ComputedNode;
use bevy::ui::widget::ImageNode;

use super::walk::{ShapeQuery, climb_to_svg_root, walk_shapes};
use super::{ShapeAttrs, ViewBox};
use bevy_react_core::raster::{RasterCache, clamp_physical_size, upload_pixmap};

/// The kind of a JSX SVG shape child: which wire intrinsic (`<circle>`,
/// `<rect>`, …, `<g>`) spawned it, and therefore which [`ShapeAttrs`] fields
/// the rasterizer reads.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ShapeKind {
    Path,
    Rect,
    Circle,
    Ellipse,
    Line,
    Polyline,
    Polygon,
    Group,
}

impl ShapeKind {
    /// Map a create-op `kind` (the bare JSX intrinsic name) to its shape
    /// kind; `None` for non-shape kinds. This is the create dispatch's arm
    /// guard: any kind it recognizes mounts as a Node-less [`SvgShape`].
    pub fn from_kind(kind: &str) -> Option<ShapeKind> {
        Some(match kind {
            "path" => Self::Path,
            "rect" => Self::Rect,
            "circle" => Self::Circle,
            "ellipse" => Self::Ellipse,
            "line" => Self::Line,
            "polyline" => Self::Polyline,
            "polygon" => Self::Polygon,
            "g" => Self::Group,
            _ => return None,
        })
    }
}

/// One shape child of a JSX `<svg>` element: a **Node-less** entity (the
/// `textSpan` precedent — no layout box, no style) carrying only its kind and
/// assembled attributes ([`crate::attrs`]). The rasterizer walks the `<svg>`
/// root's `Children` to paint these, and the hit-tester reads the same data.
/// Updates rewrite `attrs` compare-before-write, so `Changed<SvgShape>` is a
/// sound dirt signal for the raster.
#[derive(Component, Debug, Clone, PartialEq)]
pub struct SvgShape {
    pub kind: ShapeKind,
    pub attrs: ShapeAttrs,
}

/// The element-owned raster surface of a JSX `<svg>` root: the node's
/// `ImageNode` texture is an element-owned pixel buffer the raster system
/// repaints at laid-out size whenever the layout, the `viewBox`, or the
/// [`SvgShape`] children change.
#[derive(Component)]
pub struct SvgJsxSurface {
    /// The element's coordinate system: the user-unit rect mapped onto the
    /// laid-out box. `None` = logical-pixel space.
    pub view_box: Option<ViewBox>,
    /// Physical-px size of the last raster; `UVec2::ZERO` before the first.
    pub last_size: UVec2,
    /// Repaint requested: set on mount and whenever `viewBox` changes; the
    /// raster system clears it after painting. Shape and child-list changes
    /// intentionally do **not** set this; the rasterizer derives that dirt
    /// itself.
    pub dirty: bool,
    /// Reused raster buffers — a cache, not state (written through
    /// `bypass_change_detection`, so a repaint alone never ticks
    /// `Changed<SvgJsxSurface>`).
    pub(crate) raster: RasterCache,
}

impl SvgJsxSurface {
    /// A fresh surface awaiting its first raster.
    pub fn new(view_box: Option<ViewBox>) -> Self {
        Self {
            view_box,
            last_size: UVec2::ZERO,
            dirty: true,
            raster: RasterCache::default(),
        }
    }
}

/// The node's physical-per-logical scale factor, guarded against the zero
/// `inverse_scale_factor` of a never-laid-out `ComputedNode` (fall back to
/// `1.0` rather than an inf/NaN recip). Shared by the pick refinement and the
/// interaction synthesis — both feed it into `paint::view_box_transform`.
pub fn node_scale_factor(node: &ComputedNode) -> f32 {
    if node.inverse_scale_factor > 0.0 {
        node.inverse_scale_factor.recip()
    } else {
        1.0
    }
}

/// Repaint every JSX `<svg>` root whose raster is stale — a repaint request
/// (`dirty`), a layout resize, or a shape/child-list change (derived below)
/// — and upload the result into the backing image. Reads the node's size
/// from [`ComputedNode`] (already physical px, so HiDPI rasters crisp); a
/// freshly-mounted node has no size yet and rasters next frame, once layout
/// ran.
#[allow(clippy::type_complexity, clippy::too_many_arguments)]
pub fn update_jsx_svg_surfaces(
    mut images: ResMut<Assets<Image>>,
    mut dirt: ResMut<bevy_react_core::layer::LayerContentDirt>,
    mut query: Query<(
        Entity,
        &ComputedNode,
        &ImageNode,
        Option<&Children>,
        &mut SvgJsxSurface,
    )>,
    shapes: ShapeQuery,
    changed_shapes: Query<Entity, Changed<SvgShape>>,
    changed_children: Query<Entity, (Changed<Children>, Or<(With<SvgShape>, With<SvgJsxSurface>)>)>,
    mut removed_children: RemovedComponents<Children>,
    parents: Query<&ChildOf>,
    roots: Query<(), With<SvgJsxSurface>>,
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
        if let Some(root) = climb_to_svg_root(entity, &parents, &roots) {
            jsx_dirty.insert(root);
        }
    }
    for entity in &changed_children {
        // The root's own child list changed (shape attach/remove/reorder), or
        // a `<g>`'s did — the latter climbs like any shape change.
        if roots.contains(entity) {
            jsx_dirty.insert(entity);
        } else if let Some(root) = climb_to_svg_root(entity, &parents, &roots) {
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
        if roots.contains(entity) {
            jsx_dirty.insert(entity);
        } else if shapes.contains(entity)
            && let Some(root) = climb_to_svg_root(entity, &parents, &roots)
        {
            jsx_dirty.insert(root);
        }
    }

    for (entity, node, image_node, children, mut surface) in &mut query {
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
    }
}

/// The per-root raster of [`update_jsx_svg_surfaces`]: paint the root's [`SvgShape`]
/// children (depth-first, groups composed — see [`walk_shapes`]) through the
/// viewBox fit into a fresh pixmap and upload it. `derived_dirty` is the
/// walked `Changed<SvgShape>`/`Changed<Children>` signal for this root;
/// `surface.dirty` covers the mount state and `viewBox` writes. Same
/// discipline as the file branch: clean roots take zero mutable derefs, and
/// derived-dirt repaints never touch `SvgJsxSurface` at all.
#[allow(clippy::too_many_arguments)] // a private per-entity slice of the system's params
fn raster_jsx_surface(
    entity: Entity,
    node: &ComputedNode,
    image_node: &ImageNode,
    children: Option<&Children>,
    surface: &mut Mut<SvgJsxSurface>,
    derived_dirty: bool,
    shapes: &ShapeQuery,
    images: &mut Assets<Image>,
    dirt: &mut bevy_react_core::layer::LayerContentDirt,
) {
    let (w, h) = clamp_physical_size(node.size);
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
    let scale_factor = if node.inverse_scale_factor > 0.0 {
        node.inverse_scale_factor.recip()
    } else {
        1.0
    };
    let transform = super::paint::view_box_transform(surface.view_box.as_ref(), w, h, scale_factor);
    // The buffers are a cache: written past change detection, so a derived-dirt
    // repaint still leaves `SvgJsxSurface` untouched (pinned by
    // `shape_delta_rerasters_same_frame`).
    let raster = &mut surface.bypass_change_detection().raster;
    let Some(mut pixmap) = raster.take_pixmap(w, h) else {
        return;
    };
    if let Some(children) = children {
        walk_shapes(children, shapes, transform, 1.0, &mut |_, shape, t, o| {
            super::paint::paint_shape(&mut pixmap, shape.kind, &shape.attrs, t, o);
        });
    }
    upload_pixmap(entity, image_node, images, dirt, w, h, &pixmap, raster);
    raster.keep_pixmap(pixmap);
    // Compare-before-write: any `deref_mut` ticks `Changed<SvgSurface>`, so
    // touch only the fields that are actually stale.
    if surface.last_size != size {
        surface.last_size = size;
    }
    if surface.dirty {
        surface.dirty = false;
    }
}
