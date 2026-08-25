//! The `layout` transition channel: FLIP-style easing of a node's laid-out
//! rect.
//!
//! `transition: { layout }` makes a node *ease* to wherever `bevy_ui`'s layout
//! puts it next, instead of snapping — cause-blind: a sibling insert/remove/
//! reorder, a parent resize, a re-wrap, a window resize all count. The real
//! layout still snaps (taffy is never touched); what eases is a post-layout
//! translate + scale from the OLD rect toward the new one, decaying to
//! identity, composed into [`UiGlobalTransform`] **after**
//! `UiSystems::Layout` and before anything reads it (`PostLayout` clipping,
//! layer geometry sync, extraction, picking). Children ride the translation
//! (the whole subtree moves together) but **not the scale**: a size change
//! scales only the node's own paint, while its content sits unscaled at its
//! final offset — the container eases, the content stays crisp.
//!
//! ## Why `UiGlobalTransform`, not `UiTransform`
//!
//! `UiTransform` is consumed *inside* bevy's layout walk, so writing it after
//! measuring would land a frame late (a visible pop on the frame of every
//! change). Composing into the derived global transform instead is exact
//! (a real affine composition — the user's `transform`, rotation included,
//! stays untouched underneath), needs no writer coordination with the
//! three existing `UiTransform` writers, and costs only the animating
//! subtrees. bevy rewrites every global transform from scratch next frame
//! (`update_uinode_geometry_recursive` compares against its own value), so
//! the pristine layout is always re-derived before this system re-applies.
//!
//! ## What "the rect" is
//!
//! The node's **local layout rect** in its parent's layout space, physical
//! px — taffy's `location` + `size` straight from [`UiSurface`], **rounded**
//! exactly as bevy's walk consumed them (so the change frame reproduces the
//! previously displayed rect bit-exact, not an unrounded neighbour of it):
//! no parent scroll, no `UiTransform` (ours or the user's). That is the only
//! definition under which nesting composes (a child inside an animating
//! parent animates only its *own* local delta) and scrolling never reads as
//! a layout change.

use bevy::ecs::entity::EntityHashMap;
use bevy::math::Affine2;
use bevy::prelude::*;
use bevy::ui::UiGlobalTransform;
use bevy::ui::ui_surface::UiSurface;

use super::channels::ProgressChannel;
use super::spec::ChannelTransition;
use super::{TransitionInput, TransitionState};
use crate::animations::AnimatedNode;

/// A laid-out rect in the parent's layout space, physical px:
/// `[center_x, center_y, width, height]`.
pub type LayoutRect = [f32; 4];

/// Rect deltas below this (physical px, every axis) never *start* an ease —
/// sub-pixel churn (an unrounded `LayoutConfig`, hinting) must not
/// micro-animate. Mid-flight the target just moves.
pub const LAYOUT_SNAP_EPSILON: f32 = 0.5;

/// The smallest size a shown rect scales down to (physical px): the from-zero
/// grow-in starts at a point, and a genuinely zero scale would compose a
/// singular global transform (unpickable subtree) for that sample.
const MIN_SHOWN_PX: f32 = 0.01;

/// The per-entity `layout` channel: one progress runner easing the whole
/// rect (`ProgressChannel<[f32; 4]>` — the color channel's shape), plus the
/// mount gate. State-owned-current like every whole-value channel: bevy
/// snaps the real layout on the change frame, so the ease starts from what
/// this channel last read, never from the component.
#[derive(Default)]
pub struct LayoutChannel {
    channel: ProgressChannel<LayoutRect>,
    seeded: bool,
    /// The previous frame adopted (the node's own size writer was live).
    /// That writer settles by writing its final value AND clearing its
    /// runner in one `Update` call, so the settle frame's rect step arrives
    /// with `adopt == false` — this grace flag adopts it too.
    adopt_tail: bool,
}

impl LayoutChannel {
    /// Advance toward `measured` (this frame's pristine layout rect). Returns
    /// the rect to *show* this frame, or `None` when there is nothing to apply
    /// (settled, or a snap). Rules, in order:
    /// - first sight (mount), `adopt` (the node's own layout writer — its
    ///   `size` channel or a `Node`-field binding — owns its rect this
    ///   frame), or the frame right after an adopt → adopt silently;
    /// - to a zero-size rect → snap (there are no pixels to animate);
    /// - every axis within [`LAYOUT_SNAP_EPSILON`] → snap when idle, or
    ///   just move the target when an ease is running (never cancels it);
    /// - from a zero-size rect → grow in place: scale 0→1 about the FINAL
    ///   rect, the stale old position ignored;
    /// - else ease (a retarget mid-flight restarts from the current reading).
    pub fn drive(
        &mut self,
        measured: LayoutRect,
        spec: &ChannelTransition,
        adopt: bool,
        dt: f32,
    ) -> Option<LayoutRect> {
        if !self.seeded || adopt || self.adopt_tail {
            self.channel.init(measured);
            self.seeded = true;
            self.adopt_tail = adopt;
            return None;
        }
        if measured != self.channel.target {
            let old = self.channel.target;
            let to_zero = measured[2] <= 0.0 || measured[3] <= 0.0;
            let from_zero = old[2] <= 0.0 || old[3] <= 0.0;
            let within_epsilon = (0..4).all(|i| (measured[i] - old[i]).abs() < LAYOUT_SNAP_EPSILON);
            if to_zero {
                self.channel.init(measured);
            } else if within_epsilon {
                if self.in_flight() {
                    // The lerp samples `start → target`, so a nudged target
                    // is picked up seamlessly by the running ease.
                    self.channel.target = measured;
                } else {
                    self.channel.init(measured);
                }
            } else {
                if from_zero {
                    self.channel.init([measured[0], measured[1], 0.0, 0.0]);
                }
                self.channel.arm(measured, spec);
            }
        }
        self.channel.tick(dt);
        (self.channel.current != self.channel.target).then_some(self.channel.current)
    }

    /// Forget everything (spec unset mid-flight): the next sight re-seeds,
    /// so nothing animates in.
    pub fn reset(&mut self) {
        *self = Self::default();
    }

    /// Whether an ease is currently running.
    pub fn in_flight(&self) -> bool {
        self.channel.runner.is_some()
    }
}

/// The post-layout delta an animating node shows this frame: a translation
/// in its parent's layout space and a scale about its own center.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct LayoutDelta {
    pub translation: Vec2,
    pub scale: Vec2,
}

impl LayoutDelta {
    /// `shown` vs `laid_out` rects → the delta. `laid_out` has a non-zero
    /// size by construction (a to-zero change snaps before reaching here);
    /// the shown size is clamped to [`MIN_SHOWN_PX`] so the scale is never
    /// exactly zero.
    pub fn between(shown: LayoutRect, laid_out: LayoutRect) -> Self {
        Self {
            translation: Vec2::new(shown[0] - laid_out[0], shown[1] - laid_out[1]),
            scale: Vec2::new(
                shown[2].max(MIN_SHOWN_PX) / laid_out[2],
                shown[3].max(MIN_SHOWN_PX) / laid_out[3],
            ),
        }
    }
}

/// Measure, ease, and compose every `transition: { layout }` node's delta
/// into its subtree's `UiGlobalTransform`s. Runs after `UiSystems::Layout`
/// (this frame's pristine rects + globals) and before `PostLayout` / the
/// layer geometry sync / anything else that reads globals.
///
/// Composition, per animating node with pristine global `G`, parent
/// pristine `P` and parent already-composed `P'`:
/// `G' = P' · T(Δ) · P⁻¹ · G · S(s)` — the translation lands in the parent's
/// frame, the scale is applied last so it affects only the node's own paint;
/// its children compose from `P' · T(Δ) · P⁻¹ · G` (translated, unscaled).
/// A plain descendant is `G' = P' · P⁻¹ · G`. A settled node writes nothing —
/// bevy's own value stands and change detection stays quiet.
pub fn drive_layout_transitions(
    time: Res<Time>,
    mut ui_surface: ResMut<UiSurface>,
    mut states: Query<(
        Entity,
        &TransitionInput,
        &mut TransitionState,
        Option<&AnimatedNode>,
    )>,
    parents: Query<&ChildOf>,
    children: Query<&Children>,
    mut globals: Query<&mut UiGlobalTransform>,
) {
    let dt = time.delta_secs();
    let mut deltas: EntityHashMap<LayoutDelta> = EntityHashMap::default();
    for (entity, input, mut state, anim) in &mut states {
        let Some(spec) = input.spec.for_layout() else {
            // Unset (mid-flight or not): forget everything, bevy's own value
            // stands. `seeded` is the one-and-only armed flag (a runner
            // exists only after seeding).
            if state.layout.seeded {
                state.layout.reset();
            }
            continue;
        };
        // Rounded, exactly as bevy's walk consumed it (`use_rounding` is on
        // by default): the change frame then shows the previously DISPLAYED
        // rect, not an unrounded neighbour of it (a ≤1px shimmer otherwise).
        let Ok((layout, _unrounded)) = ui_surface.get_layout(entity, true) else {
            continue;
        };
        let size = Vec2::new(layout.size.width, layout.size.height);
        let measured = [
            layout.location.x + size.x * 0.5,
            layout.location.y + size.y * 0.5,
            size.x,
            size.y,
        ];
        // The node's OWN layout writers are the one cause the engine can
        // attribute: its `size` channel, or a `{ animated }` binding on a
        // `Node` field (width/height/left/top/…). Either owns the rect
        // frame-by-frame, so the layout channel adopts instead of chasing.
        let adopt = state.size_in_flight() || anim.is_some_and(|a| a.0.has_node_props());
        if let Some(shown) = state.layout.drive(measured, spec, adopt, dt) {
            deltas.insert(entity, LayoutDelta::between(shown, measured));
        }
    }
    if deltas.is_empty() {
        return;
    }

    // Root-most animating nodes; every other animating node is reached by
    // the top-down walk from its nearest animating ancestor.
    let has_animating_ancestor =
        |e: Entity| parents.iter_ancestors(e).any(|a| deltas.contains_key(&a));
    let roots: Vec<Entity> = deltas
        .keys()
        .copied()
        .filter(|&e| !has_animating_ancestor(e))
        .collect();

    // A singular frame (a `transform: { scale: 0 }` ancestor) has no local
    // frame to recover; its subtree is invisible anyway.
    let inverse = |a: Affine2| (a.matrix2.determinant().abs() > f32::EPSILON).then(|| a.inverse());

    // (entity, parent pristine global INVERSE, parent composed global)
    let mut stack: Vec<(Entity, Affine2, Affine2)> = Vec::new();
    for root in roots {
        let parent = parents
            .get(root)
            .ok()
            .and_then(|c| globals.get(c.parent()).ok())
            .map(|g| **g)
            .unwrap_or(Affine2::IDENTITY);
        if let Some(inv) = inverse(parent) {
            stack.push((root, inv, parent));
        }
    }
    while let Some((entity, parent_inverse, parent_composed)) = stack.pop() {
        let Ok(mut global) = globals.get_mut(entity) else {
            continue;
        };
        // Read through `Deref` — pristine, and no change mark on a no-op.
        let pristine = **global;
        let local = parent_inverse * pristine;
        // The scale is the node's OWN (its box eases); children compose
        // from the translated-but-unscaled frame, so content stays crisp
        // and sits at its final offset while the container resizes.
        let (composed, for_children) = match deltas.get(&entity) {
            Some(d) => {
                let unscaled = parent_composed * Affine2::from_translation(d.translation) * local;
                (unscaled * Affine2::from_scale(d.scale), unscaled)
            }
            None => {
                let c = parent_composed * local;
                (c, c)
            }
        };
        if composed != pristine {
            *global = composed.into();
        }
        if let Ok(kids) = children.get(entity)
            && let Some(inv) = inverse(pristine)
        {
            for &child in kids {
                stack.push((child, inv, for_children));
            }
        }
    }
}
