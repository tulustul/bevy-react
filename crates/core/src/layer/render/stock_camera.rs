//! The v1 single-camera rule for layer extraction: every extracted layer
//! composites into ONE stock UI camera phase, and a promoted layer whose UI
//! target camera is a different one is **skipped** — not extracted, not
//! hidden from stock extraction — so its subtree renders unpromoted, exactly
//! as an unpromoted subtree would.
//!
//! **Why skip instead of extract.** [`super::redistribute_ui_layers`] steals
//! items from, and injects composite quads into, the stock camera's phase
//! only, and each quad's pipeline is specialized on its layer's own target
//! format. A layer under another camera (a `<surface>`'s `Camera2d` rendering
//! into an `Rgba8UnormSrgb` image, under an HDR `Rgba16Float` main camera)
//! would steal nothing (its items live in the other phase) yet — once
//! [`super::ExtractedLayer::fallback_sort_key`] gives a cached layer a quad
//! position of its own — inject an `Rgba8` quad into the `Rgba16Float` pass:
//! a wgpu validation error, and Bevy quits. Before the fallback key existed
//! such a layer was silently inert; skipping it keeps that behavior and makes
//! the limit explicit (one [`KIND_LAYER_CAMERA`] warning per camera).
//!
//! **Which camera is stock.** Among the cameras that have promoted layers this
//! frame: the [`bevy::ui::IsDefaultUiCamera`] one, else one rendering to a
//! window, else the first seen ([`pick_stock_camera`]). Query order is not
//! stable across archetypes, so without the preference a `<surface>` layer
//! seen first would have made the whole main-camera page skip instead.

use bevy::prelude::*;

/// Warning kind for a layer skipped under a non-stock camera (a startup-ish,
/// once-per-camera warn — no node attribution).
pub(crate) const KIND_LAYER_CAMERA: &str = "layerCamera";

/// One camera that has at least one promoted layer this frame.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CameraCandidate {
    /// Main-world camera entity.
    pub entity: Entity,
    /// Carries `IsDefaultUiCamera`.
    pub is_default_ui: bool,
    /// Renders to a window (`RenderTarget::Window`).
    pub window_target: bool,
}

impl CameraCandidate {
    fn rank(&self) -> u8 {
        (self.is_default_ui as u8) << 1 | self.window_target as u8
    }
}

/// The camera every layer composites on this frame: the default UI camera if
/// it has a layer, else a window-target camera, else the first candidate.
/// Ties keep the first seen. `None` for no candidates.
pub fn pick_stock_camera(candidates: impl IntoIterator<Item = CameraCandidate>) -> Option<Entity> {
    // `min_by_key` keeps the FIRST of equal keys (`max_by_key` the last).
    candidates
        .into_iter()
        .min_by_key(|c| std::cmp::Reverse(c.rank()))
        .map(|c| c.entity)
}

/// Report a skipped layer's camera through the diag logger (deduped per
/// distinct camera by `log_warn`'s own key; callers additionally remember
/// warned cameras to skip the formatting per frame).
pub(crate) fn warn_skipped(camera: Entity, stock: Entity) {
    crate::diag::log_warn(
        KIND_LAYER_CAMERA,
        &format!("{camera:?}"),
        &format!(
            "promoted layers under camera {camera:?} are skipped (their subtrees render \
             unpromoted): v1 composites layers on a single UI camera, {stock:?} this session — \
             opacity/filter/transform3d/morph styles inside a <surface> or under a second UI \
             camera have no effect"
        ),
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    fn cand(index: u32, is_default_ui: bool, window_target: bool) -> CameraCandidate {
        CameraCandidate {
            entity: Entity::from_raw_u32(index).unwrap(),
            is_default_ui,
            window_target,
        }
    }

    /// The regression shape: a `<surface>` camera (image target) seen BEFORE
    /// the window/default camera must not become stock.
    #[test]
    fn default_ui_camera_wins_regardless_of_order() {
        let surface = cand(1, false, false);
        let main = cand(2, true, true);
        assert_eq!(pick_stock_camera([surface, main]), Some(main.entity));
        assert_eq!(pick_stock_camera([main, surface]), Some(main.entity));
    }

    /// No default marker: a window-target camera beats an image-target one;
    /// equal ranks keep the first seen; nothing → `None`.
    #[test]
    fn window_target_then_first_seen() {
        let image_a = cand(1, false, false);
        let window = cand(2, false, true);
        let image_b = cand(3, false, false);
        assert_eq!(
            pick_stock_camera([image_a, window, image_b]),
            Some(window.entity)
        );
        assert_eq!(
            pick_stock_camera([image_a, image_b]),
            Some(image_a.entity),
            "ties keep the first seen"
        );
        assert_eq!(pick_stock_camera([]), None);
    }
}
