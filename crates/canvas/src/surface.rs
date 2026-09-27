//! The retained drawing surface ([`CanvasSurface`]) and the system that
//! paints it into the element's texture.

use bevy::image::Image;
use bevy::prelude::*;
use bevy::ui::ComputedNode;
use bevy::ui::widget::ImageNode;
use bevy_react_core::raster::{clamp_physical_size, replace_image_pixels, write_straight_alpha};
use tiny_skia::{Color, Pixmap};

use crate::draw::{DrawCmd, RasterState, apply_cmds};

/// The drawing state of a `canvas` element: a retained premultiplied pixel
/// buffer, the persistent raster state, and the queue of commands recorded
/// since the last paint. Paint **accumulates** — a batch draws on top of what
/// is already there — except when `replace` is set (the declarative `draw`
/// prop: clear + replay) or the laid-out size changes (clear-on-resize).
#[derive(Component)]
pub struct CanvasSurface {
    /// Commands recorded since the last paint, not yet applied.
    pending: Vec<DrawCmd>,
    /// Clear the surface and reset raster state before draining `pending`.
    replace: bool,
    /// Fill/stroke/line-width and the current path, persisting across batches.
    state: RasterState,
    /// The retained pixels, premultiplied (tiny-skia native). `None` until the
    /// node is first laid out.
    pixmap: Option<Pixmap>,
    /// Physical size of `pixmap`; a mismatch with the laid-out size recreates
    /// it cleared (HTML width/height-set semantics).
    last_size: (u32, u32),
    /// The upload buffer the backing image gave back when it took the last
    /// one ([`recycle`](Self::recycle)); the next [`sync`](Self::sync) fills
    /// it instead of allocating. Two buffers ping-pong between the surface
    /// and the image, so a per-frame draw loop allocates nothing at steady
    /// state. Empty until the first upload.
    spare: Vec<u8>,
}

impl CanvasSurface {
    /// A fresh surface whose first paint clears and replays `cmds` (the
    /// element's initial declarative `draw` prop; empty for imperative-only
    /// canvases).
    pub fn new(cmds: Vec<DrawCmd>) -> Self {
        Self {
            pending: cmds,
            replace: true,
            state: RasterState::default(),
            pixmap: None,
            last_size: (0, 0),
            spare: Vec::new(),
        }
    }

    /// Append imperative commands (a canvas handle's `drawAppend`). Paint
    /// accumulates on the retained pixels.
    pub fn enqueue(&mut self, cmds: Vec<DrawCmd>) {
        self.pending.extend(cmds);
    }

    /// Replace the picture with `cmds` (a changed declarative `draw` prop):
    /// the next paint clears the surface, resets raster state, and replays.
    /// Anything still pending is dropped — it would be erased anyway.
    pub fn set_display_list(&mut self, cmds: Vec<DrawCmd>) {
        self.pending = cmds;
        self.replace = true;
    }

    /// Sync the surface to the laid-out physical size `(w, h)`: recreate the
    /// pixmap on a size change (clear-on-resize), honor a pending replace,
    /// drain queued commands. Returns the straight-alpha RGBA buffer when the
    /// pixels changed (painted, cleared, or resized), else `None`. `scale` is
    /// the device pixel ratio mapping logical draw coords onto the buffer.
    /// The buffer is the recycled one when the caller handed one back (see
    /// [`recycle`](Self::recycle)), else freshly allocated.
    pub(crate) fn sync(&mut self, w: u32, h: u32, scale: f32) -> Option<Vec<u8>> {
        let resized = self.pixmap.is_none() || self.last_size != (w, h);
        if resized {
            // `w`/`h` are clamped to `1..=MAX_DIM` by the caller, so `new` holds.
            self.pixmap = Some(Pixmap::new(w, h).expect("non-zero, bounded canvas size"));
            self.state = RasterState::default();
            self.last_size = (w, h);
        }
        let mut cleared = resized;
        if self.replace {
            self.replace = false;
            if !resized {
                self.pixmap.as_mut().unwrap().fill(Color::TRANSPARENT);
            }
            self.state = RasterState::default();
            cleared = true;
        }
        if self.pending.is_empty() && !cleared {
            return None;
        }
        let pixmap = self.pixmap.as_mut().unwrap();
        let cmds = std::mem::take(&mut self.pending);
        apply_cmds(pixmap, &mut self.state, &cmds, scale);
        let mut out = std::mem::take(&mut self.spare);
        write_straight_alpha(pixmap, &mut out);
        Some(out)
    }

    /// Hand back the buffer the backing image held before the last upload
    /// replaced it, for the next [`sync`](Self::sync) to fill in place.
    pub(crate) fn recycle(&mut self, buf: Vec<u8>) {
        self.spare = buf;
    }
}

/// Paint every canvas with pending work (queued commands, a replace, or a
/// layout resize — which clears, per HTML canvas semantics) and upload the
/// result into the backing image. Reads the node's size from [`ComputedNode`]
/// (already in physical pixels, so the result is crisp on HiDPI).
pub fn update_canvas_surfaces(
    mut images: ResMut<Assets<Image>>,
    mut dirt: ResMut<bevy_react_core::layer::LayerContentDirt>,
    mut query: Query<(Entity, &ComputedNode, &ImageNode, &mut CanvasSurface)>,
) {
    for (entity, node, image_node, mut surface) in &mut query {
        let (w, h) = clamp_physical_size(node.size);
        if w == 0 || h == 0 {
            continue; // not laid out yet; pending commands stay queued
        }
        // `contains` (not `get_mut`) so an idle canvas doesn't flag the asset
        // changed — and thus re-uploaded — every frame.
        if !images.contains(&image_node.image) {
            continue;
        }
        // Draw commands are in logical (CSS) pixels matching the node's layout
        // size; the texture is physical-pixel sized for HiDPI crispness, so scale
        // the drawing up by the device pixel ratio (`1 / inverse_scale_factor`).
        let scale = if node.inverse_scale_factor > 0.0 {
            node.inverse_scale_factor.recip()
        } else {
            1.0
        };
        let Some(data) = surface.sync(w, h, scale) else {
            continue;
        };
        // Real pixel upload → the owning layer's capture is stale. (An idle
        // canvas returns `None` above and touches nothing.)
        dirt.nodes.push(entity);
        let Some(mut image) = images.get_mut(&image_node.image) else {
            continue;
        };
        let previous = replace_image_pixels(&mut image, w, h, data);
        surface.recycle(previous);
    }
}
