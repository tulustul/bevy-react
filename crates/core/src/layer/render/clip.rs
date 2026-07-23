//! Render-world half of clip-independent layer capture: the extract-window
//! clip swap, and the composite quad's rect clamp.
//!
//! **The swap.** Stock `bevy_ui_render` extraction copies each node's
//! [`CalculatedClip`] onto its extracted items, and the prepare stage bakes
//! that clip into vertices — including inside our capture passes. To keep
//! ancestor clips out of captures without forking any extractor (several,
//! like the gradient one, live in private modules), the members' clips are
//! swapped for their interior values (`crate::layer::clip::LayerClips`) for
//! **exactly the duration of `ExtractSchedule`**: [`swap_interior_clips_in`]
//! runs before every stock UI extraction set and [`swap_interior_clips_out`]
//! restores the originals after them. The main world is exclusively borrowed
//! for the whole window (that is what `ResMut<MainWorld>` means), so no
//! main-world system — picking, focus, `bevy_ui` itself — can ever observe a
//! swapped value.
//!
//! Swap mechanics: values are overwritten in place (never inserted/removed —
//! a member whose interior clip is `Some` provably carries a real
//! `CalculatedClip`, so there is no archetype churn), "unclipped" is an
//! all-infinite rect (idiomatic — `bevy_ui` itself uses ±∞ clip axes for
//! `Visible` overflow), and both directions bypass change detection (the net
//! effect within a frame is identity; `update_clipping`'s own `!=` guard must
//! not see churn). Known gap: a `UiMaterial` extractor is generic and
//! unordered relative to the swap window — unused in this repo.
//!
//! **The quad clamp.** With captures unclipped, the composite quad applies
//! the ancestor clipping instead: [`clip_quad`] clamps the quad's corners to
//! the layer's quad clip and shifts UVs proportionally (the same
//! `positions_diff` technique stock prepare uses on item vertices). A fully
//! clipped-away layer yields `None` — its quad simply isn't batched.

use bevy::math::{Rect, UVec2, Vec2};
use bevy::prelude::*;
use bevy::render::MainWorld;
use bevy::ui::CalculatedClip;

use crate::layer::clip::LayerClips;

/// "No clip" as a value: bevy_ui expresses visible-overflow axes as ±∞, and
/// the prepare-stage clip math is a no-op against it.
pub const UNCLIPPED: Rect = Rect {
    min: Vec2::splat(f32::NEG_INFINITY),
    max: Vec2::splat(f32::INFINITY),
};

/// The originals stashed by [`swap_interior_clips_in`], restored by
/// [`swap_interior_clips_out`]. Render-world resource; drained every frame.
#[derive(Resource, Default)]
pub struct SwappedClips(pub Vec<(Entity, Rect)>);

/// `ExtractSchedule`, before all stock UI extraction sets: overwrite each
/// promoted-subtree member's [`CalculatedClip`] with its interior clip.
pub fn swap_interior_clips_in(mut main_world: ResMut<MainWorld>, mut stash: ResMut<SwappedClips>) {
    swap_in(&mut main_world, &mut stash.0);
}

/// `ExtractSchedule`, after all stock UI extraction sets: restore the
/// originals so the main world resumes with true inherited clips in place.
pub fn swap_interior_clips_out(mut main_world: ResMut<MainWorld>, mut stash: ResMut<SwappedClips>) {
    swap_out(&mut main_world, &mut stash.0);
}

/// Core of [`swap_interior_clips_in`], factored on `&mut World` for tests.
pub fn swap_in(world: &mut World, stash: &mut Vec<(Entity, Rect)>) {
    stash.clear();
    if world.get_resource::<LayerClips>().is_none() {
        return; // Main app without the plugin's resources: nothing to swap.
    }
    world.resource_scope(|world, clips: Mut<LayerClips>| {
        for (&entity, &interior) in clips.interior.iter() {
            // A member without the component needs no swap: its interior clip
            // is provably `None` too (interior clip sources are a subset of
            // the real cascade's). A despawned entity is a stale map row.
            let Ok(mut e) = world.get_entity_mut(entity) else {
                continue;
            };
            let Some(mut clip) = e.get_mut::<CalculatedClip>() else {
                continue;
            };
            let clip = clip.bypass_change_detection();
            stash.push((entity, clip.clip));
            clip.clip = interior.unwrap_or(UNCLIPPED);
        }
    });
}

/// Core of [`swap_interior_clips_out`]: restore every stashed original.
pub fn swap_out(world: &mut World, stash: &mut Vec<(Entity, Rect)>) {
    for (entity, original) in stash.drain(..) {
        if let Ok(mut e) = world.get_entity_mut(entity)
            && let Some(mut clip) = e.get_mut::<CalculatedClip>()
        {
            clip.bypass_change_detection().clip = original;
        }
    }
}

/// A composite quad clamped to its clip: screen-space corners plus the
/// matching capture-texture UV window.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ClippedQuad {
    pub pos_min: Vec2,
    pub pos_max: Vec2,
    pub uv_min: Vec2,
    pub uv_max: Vec2,
}

/// Clamp a layer's composite quad (`min`, `size` — the capture rect) to its
/// quad clip. `None` clip = the full quad; an empty or degenerate
/// intersection returns `None` (draw nothing). UVs shift proportionally on
/// clamped sides only, so the visible part of the capture stays put on
/// screen.
pub fn clip_quad(min: Vec2, size: UVec2, clip: Option<Rect>) -> Option<ClippedQuad> {
    let size = size.as_vec2();
    let max = min + size;
    let (pos_min, pos_max) = match clip {
        None => (min, max),
        Some(c) => (min.max(c.min), max.min(c.max)),
    };
    if pos_min.x >= pos_max.x || pos_min.y >= pos_max.y {
        return None;
    }
    Some(ClippedQuad {
        pos_min,
        pos_max,
        uv_min: (pos_min - min) / size,
        uv_max: (pos_max - min) / size,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `clip_quad` truth table: full quad without a clip, proportional UV
    /// shifts on clamped sides, identity for a containing clip, `None` for
    /// empty/degenerate intersections.
    #[test]
    fn clip_quad_table() {
        let min = Vec2::new(10.0, 20.0);
        let size = UVec2::new(100, 50);

        // No clip: full quad, full UV window.
        let full = clip_quad(min, size, None).expect("unclipped quad");
        assert_eq!(full.pos_min, min);
        assert_eq!(full.pos_max, Vec2::new(110.0, 70.0));
        assert_eq!(full.uv_min, Vec2::ZERO);
        assert_eq!(full.uv_max, Vec2::ONE);

        // Left half clipped away: UV window starts at 0.5 horizontally.
        let q = clip_quad(min, size, Some(Rect::new(60.0, 0.0, 300.0, 300.0)))
            .expect("partial overlap");
        assert_eq!(q.pos_min, Vec2::new(60.0, 20.0));
        assert_eq!(q.pos_max, Vec2::new(110.0, 70.0));
        assert_eq!(q.uv_min, Vec2::new(0.5, 0.0));
        assert_eq!(q.uv_max, Vec2::ONE);

        // Bottom 40% clipped away: UV max shrinks to 0.6 vertically.
        let q =
            clip_quad(min, size, Some(Rect::new(0.0, 0.0, 300.0, 50.0))).expect("partial overlap");
        assert_eq!(q.pos_min, min);
        assert_eq!(q.pos_max, Vec2::new(110.0, 50.0));
        assert_eq!(q.uv_min, Vec2::ZERO);
        assert_eq!(q.uv_max, Vec2::new(1.0, 0.6));

        // Containing clip: identity.
        let q =
            clip_quad(min, size, Some(Rect::new(0.0, 0.0, 500.0, 500.0))).expect("containing clip");
        assert_eq!(q, full);

        // Disjoint clip: nothing to draw.
        assert_eq!(
            clip_quad(min, size, Some(Rect::new(200.0, 0.0, 300.0, 300.0))),
            None
        );
        // Degenerate touch (shared edge): still nothing.
        assert_eq!(
            clip_quad(min, size, Some(Rect::new(110.0, 0.0, 300.0, 300.0))),
            None
        );
        // Empty clip rect (Display::None subtree): nothing.
        assert_eq!(clip_quad(min, size, Some(Rect::default())), None);
    }

    /// The swap overwrites members' `CalculatedClip` with interior values
    /// (infinite rect for "unclipped inside the capture"), stashes originals,
    /// skips entities without the component, and restores exactly.
    #[test]
    fn swap_roundtrip() {
        let mut world = World::new();
        let real = Rect::new(0.0, 0.0, 100.0, 100.0);
        let inner = Rect::new(10.0, 10.0, 50.0, 50.0);

        // Member with a real clip and an interior Some: swapped to interior.
        let a = world.spawn(CalculatedClip { clip: real }).id();
        // Member with a real clip but interior None: swapped to UNCLIPPED.
        let b = world.spawn(CalculatedClip { clip: real }).id();
        // Member with no CalculatedClip (interior necessarily None): skipped.
        let c = world.spawn_empty().id();
        // Non-member with a real clip: untouched.
        let outside = world.spawn(CalculatedClip { clip: real }).id();
        // A stale map entry for a despawned entity: skipped gracefully.
        let dead = world.spawn_empty().id();
        world.despawn(dead);

        let mut clips = LayerClips::default();
        clips.interior.insert(a, Some(inner));
        clips.interior.insert(b, None);
        clips.interior.insert(c, None);
        clips.interior.insert(dead, Some(inner));
        world.insert_resource(clips);

        let mut stash = Vec::new();
        swap_in(&mut world, &mut stash);
        assert_eq!(world.get::<CalculatedClip>(a).unwrap().clip, inner);
        assert_eq!(world.get::<CalculatedClip>(b).unwrap().clip, UNCLIPPED);
        assert!(world.get::<CalculatedClip>(c).is_none());
        assert_eq!(world.get::<CalculatedClip>(outside).unwrap().clip, real);
        assert_eq!(stash.len(), 2, "only really-swapped members are stashed");

        swap_out(&mut world, &mut stash);
        assert_eq!(world.get::<CalculatedClip>(a).unwrap().clip, real);
        assert_eq!(world.get::<CalculatedClip>(b).unwrap().clip, real);
        assert!(stash.is_empty(), "stash drains on restore");
    }

    /// A second frame's swap starts from a clean stash even if the previous
    /// restore was somehow skipped (defensive: swap_in clears).
    #[test]
    fn swap_in_clears_previous_stash() {
        let mut world = World::new();
        world.insert_resource(LayerClips::default());
        let mut stash = vec![(Entity::PLACEHOLDER, UNCLIPPED)];
        swap_in(&mut world, &mut stash);
        assert!(stash.is_empty());
    }
}
