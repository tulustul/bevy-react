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
//! px — taffy's `location` + `size` straight from [`UiSurface`], rounded or
//! not **exactly as bevy's walk consumed them** (the node's effective
//! `LayoutConfig`: its own, else the nearest ancestor's, else rounded — so
//! the change frame reproduces the previously displayed rect bit-exact, not
//! a rounded/unrounded neighbour of it):
//! no parent scroll, no `UiTransform` (ours or the user's). That is the only
//! definition under which nesting composes (a child inside an animating
//! parent animates only its *own* local delta) and scrolling never reads as
//! a layout change. Shared flights are the exception: their two ends are
//! root-space rects, so their delta composes against the parent's *pristine*
//! frame ([`LayoutDelta::root_anchored`]) — an ancestor's own delta is never
//! stacked on top.

use bevy::ecs::entity::{EntityHashMap, EntityHashSet};
use bevy::math::Affine2;
use bevy::prelude::*;
use bevy::ui::ui_surface::UiSurface;
use bevy::ui::{ComputedNode, LayoutConfig, UiGlobalTransform};

use super::channels::{ProgressChannel, SIZE_ROWS};
use super::shared::{SharedRect, SharedReflow};
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

/// How much rect motion a frame's size step accounts for, per px of step,
/// while the node's own `size` channel is easing: the centre of a centred
/// node moves by half its size step, an end-aligned one by all of it, and
/// every easing sibling ahead of it in the flow adds its own — so a few
/// siblings' worth. Motion beyond that in one frame is not the size
/// flight's doing (a flex-direction swap landing under it) and is eased.
/// A false "explained" call is the old adopt; a false "jump" call eases a
/// step of a few px — either way a bounded miss.
///
/// The step is the size CHANNEL's own (its px reading's change since last
/// frame — [`LayoutChannel::note_own_size`]), not the measured rect's: a
/// flex squeeze can snap the measured size straight to its final value on
/// the change frame, which would "explain" any move at all.
pub const SIZE_STEP_SLACK: f32 = 4.0;

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
    /// The writer that owned the rect LAST frame. A size writer settles by
    /// writing its final value AND clearing its runner in one `Update` call,
    /// so the settle frame's rect step arrives with no writer — this grace
    /// slot judges it by last frame's rule instead of easing the tail.
    adopt_tail: RectWriter,
    /// The size channels' px readings last frame and the step they took
    /// this frame ([`Self::note_own_size`]) — [`SIZE_STEP_SLACK`]'s yardstick.
    own_size: [Option<f32>; SIZE_ROWS],
    own_step: Option<f32>,
    shared: SharedMode,
    /// An ancestor animated last frame (set per frame by the layout drive):
    /// a settling flight parks in [`SharedMode::Landed`] instead of `Off`.
    hold: bool,
}

/// Who is writing this node's rect this frame besides layout itself — the
/// layout channel's ownership gate (see [`LayoutChannel::drive`]). These are
/// the causes of rect motion the engine CAN attribute; everything else the
/// channel measures is a move to ease.
#[derive(Default, Clone, Copy, PartialEq, Eq, Debug)]
pub enum RectWriter {
    /// Nobody: every rect change is a genuine move.
    #[default]
    None,
    /// The node's own `size` channel is easing its `Node` size. The rect
    /// then steps a little every frame as layout re-flows around the eased
    /// size — adopted, not chased — but a jump the size step cannot explain
    /// (a flex-direction swap landing while the size flies) is a real move,
    /// eased translate-only with the size left to the size channel.
    SizeChannel,
    /// A `{ animated }` binding on a `Node` field owns the rect outright —
    /// position included (`left`/`top` bindings move it every frame with no
    /// size step to judge by): adopt everything.
    Binding,
}

/// The layout channel's shared-element mode (see [`LayoutChannel::seed_shared`]).
#[derive(Default, Clone, Copy, PartialEq, Eq)]
enum SharedMode {
    #[default]
    Off,
    /// The seed frame: the full seed rect is shown (position AND size, the
    /// latter through the FLIP scale, with the resolved corner radii
    /// divided out by it — `compensate_seed_frame_radius`) — the frame
    /// before real layout can have the seed size.
    SeedFrame,
    /// In flight: position eases between two ROOT-space rects — the seed
    /// ([`LayoutChannel::rebase_shared`]) and the settled destination — each
    /// re-derived from the live parent frame every frame, so a parent moving
    /// under the flight never bends it, and both shifted by whatever moved
    /// the node's settled position besides the flight itself (a scroll — see
    /// [`super::shared::SharedReflow`]). Size is whatever layout measured:
    /// translate-only, no scale.
    TranslateOnly,
    /// Settled, but an ancestor still animates ([`LayoutChannel::hold_shared`]):
    /// keep showing the root-space destination so the node doesn't jump onto
    /// the ancestor's still-moving frame the moment its own flight ends — it
    /// sits at its final spot while the ancestor slides under it. Leaves for
    /// `Off` once no ancestor animates.
    Landed,
}

impl LayoutChannel {
    /// A shared-element first sight: instead of adopting, show `seed` (the
    /// outgoing node's rect in this node's parent space) and ease to the
    /// natural `measured` rect. The seed frame renders the seed rect
    /// outright via the FLIP scale — there is never an empty frame; from the
    /// next frame the flight is translate-only, the size being real
    /// layout's (the size flight eases it in px). A seed within
    /// [`LAYOUT_SNAP_EPSILON`] of the natural rect adopts silently (a
    /// reload re-pairs every node with its old self).
    pub fn seed_shared(
        &mut self,
        seed: LayoutRect,
        measured: LayoutRect,
        spec: &ChannelTransition,
    ) {
        self.seeded = true;
        self.adopt_tail = RectWriter::None;
        let within_epsilon = (0..4).all(|i| (seed[i] - measured[i]).abs() < LAYOUT_SNAP_EPSILON);
        // The to-zero rule of `drive`: a 0×0 natural rect (an image whose
        // texture isn't resident yet) has no pixels to fly to.
        let to_zero = measured[2] <= 0.0 || measured[3] <= 0.0;
        if within_epsilon || to_zero {
            self.channel.init(measured);
            self.shared = SharedMode::Off;
            return;
        }
        self.channel.init(seed);
        self.channel.arm(measured, spec);
        self.shared = SharedMode::SeedFrame;
    }

    /// Whether a shared flight is in progress (the size channel may own the
    /// rect meanwhile — that is NOT an adopt).
    pub fn shared_active(&self) -> bool {
        self.shared != SharedMode::Off
    }

    /// Whether the next [`Self::drive`] is the seed frame: the one frame
    /// shown through the FLIP scale (see [`SharedMode::SeedFrame`]).
    pub fn on_seed_frame(&self) -> bool {
        self.shared == SharedMode::SeedFrame
    }

    /// Re-express a running shared flight's take-off point. The seed is a
    /// ROOT-space rect, and the parent frame it was converted through moves
    /// mid-flight whenever the size flight re-flows the parent (a centered
    /// container's edge follows the hero's width), so the layout drive
    /// re-derives `seed` from THIS frame's parent frame before each step:
    /// the ease then samples seed → target in root space and the take-off
    /// point stays put on screen. Idle outside shared mode.
    pub fn rebase_shared(&mut self, seed: LayoutRect) {
        if self.shared != SharedMode::Off {
            self.channel.rebase(seed);
        }
    }

    /// Whether an ancestor of this node animated last frame. A shared flight
    /// composes root-anchored (it ignores its ancestors' shown deltas — see
    /// [`LayoutDelta::root_anchored`]), so settling while an ancestor still
    /// moves would jump the node onto that ancestor's frame: with `hold` the
    /// settled flight parks in [`SharedMode::Landed`] and keeps showing its
    /// destination until the ancestors are done. Idle outside shared mode.
    pub fn hold_shared(&mut self, hold: bool) {
        self.hold = hold;
    }

    /// The shared-flight step: hold the target at `destination` — where the
    /// node will SETTLE, re-derived from the live parent frame each frame
    /// (see [`super::shared::SharedFlight::destination`]) rather than
    /// wherever layout is putting the node mid-flight — tick, and show the
    /// eased position with the seed size on the seed frame or layout's size
    /// afterwards. Settling (or a snap) leaves shared mode.
    ///
    /// The target still moves (no restart — the lerp samples seed → target,
    /// so a target re-derived through a moving parent is followed
    /// seamlessly); what it no longer does is chase the flight's own eased
    /// size, which is what bowed the path.
    fn drive_shared(
        &mut self,
        destination: LayoutRect,
        measured: LayoutRect,
        dt: f32,
    ) -> Option<LayoutRect> {
        if destination != self.channel.target {
            self.channel.target = destination;
        }
        let seed_frame = self.shared == SharedMode::SeedFrame;
        let landed = self.shared == SharedMode::Landed;
        if landed {
            // Parked: the reading IS the (re-expressed) destination.
            self.channel.init(destination);
        }
        self.shared = SharedMode::TranslateOnly;
        let settled = landed || !matches!(self.channel.tick(dt), Some(false));
        if settled {
            if self.hold {
                // Settled under a still-animating ancestor: park at the
                // destination (re-expressed through the live parent frame
                // each frame, exactly like the flight's target), translate-
                // only, until the ancestors are done.
                self.shared = SharedMode::Landed;
                self.channel.init(destination);
                return Some([destination[0], destination[1], measured[2], measured[3]]);
            }
            // Settled. The size flight settles a frame LATER (its runners
            // tick in Update, after this frame's arm), so `measured` can
            // still carry that last size step: show the settled rect when
            // it does, or the node pops by the residual for one frame.
            // The grace flag then adopts the size settle instead of
            // re-arming a `layout` ease for it.
            self.shared = SharedMode::Off;
            self.adopt_tail = RectWriter::SizeChannel;
            let c = self.channel.current;
            return (c != measured).then_some(c);
        }
        let c = self.channel.current;
        Some(if seed_frame {
            c
        } else {
            [c[0], c[1], measured[2], measured[3]]
        })
    }

    /// Advance toward `measured` (this frame's pristine layout rect). Returns
    /// the rect to *show* this frame, or `None` when there is nothing to apply
    /// (settled, or a snap). Rules, in order:
    /// - first sight (mount) → adopt silently;
    /// - a [`RectWriter`] owns the rect this frame (or did last frame — the
    ///   grace frame for its settle step): a binding → adopt silently; the
    ///   node's own `size` channel → [`Self::follow_size_flight`] (adopt what
    ///   the size step explains, ease a jump translate-only);
    /// - to a zero-size rect → snap (there are no pixels to animate);
    /// - every axis within [`LAYOUT_SNAP_EPSILON`] → snap when idle, or
    ///   just move the target when an ease is running (never cancels it);
    /// - from a zero-size rect → grow in place: scale 0→1 about the FINAL
    ///   rect, the stale old position ignored;
    /// - else ease (a retarget mid-flight restarts from the current reading).
    ///
    /// `destination` is the shared flight's settled rect in this node's parent
    /// space (see [`Self::drive_shared`]); it is ignored outside a flight, and
    /// callers with none pass `measured`.
    pub fn drive(
        &mut self,
        measured: LayoutRect,
        destination: LayoutRect,
        spec: &ChannelTransition,
        writer: RectWriter,
        dt: f32,
    ) -> Option<LayoutRect> {
        if self.shared != SharedMode::Off {
            return self.drive_shared(destination, measured, dt);
        }
        let last = std::mem::replace(&mut self.adopt_tail, writer);
        if !self.seeded {
            self.channel.init(measured);
            self.seeded = true;
            return None;
        }
        let owner = if writer == RectWriter::None {
            last
        } else {
            writer
        };
        match owner {
            RectWriter::Binding => {
                self.channel.init(measured);
                return None;
            }
            RectWriter::SizeChannel => return self.follow_size_flight(measured, spec, dt),
            RectWriter::None => {}
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

    /// Record the size channels' current px readings (every frame, before
    /// [`Self::drive`]): the step they took since last frame is what a
    /// size-flight rect step is judged by. Rows that are not px (or were not
    /// last frame) don't count; with none counting the measured size step
    /// stands in.
    pub fn note_own_size(&mut self, now: [Option<f32>; SIZE_ROWS]) {
        self.own_step = now
            .iter()
            .zip(&self.own_size)
            .filter_map(|(a, b)| Some(((*a)? - (*b)?).abs()))
            .reduce(f32::max);
        self.own_size = now;
    }

    /// The step while the node's own `size` channel eases its `Node` size
    /// (see [`RectWriter::SizeChannel`]).
    ///
    /// Idle, the rect's motion since the last reading is judged against the
    /// size step (the channel's own, else the measured one): within
    /// [`SIZE_STEP_SLACK`] of it the re-flow is the size flight's own and
    /// adopts (the old rule — chasing it would re-arm every frame); beyond
    /// it something else moved the node and a translate-only ease arms from
    /// the last reading. Easing — this ease, or one already
    /// running when the size flight began — the target simply follows the
    /// live rect: the lerp samples start → target, so a moving target is
    /// picked up without a restart, and it stops moving when the size
    /// settles, so the ease lands exactly. The size shown is always layout's
    /// (never a FLIP scale): the size channel owns it.
    fn follow_size_flight(
        &mut self,
        measured: LayoutRect,
        spec: &ChannelTransition,
        dt: f32,
    ) -> Option<LayoutRect> {
        if self.in_flight() {
            self.channel.target = measured;
        } else {
            let old = self.channel.current;
            let size_step = self.own_step.unwrap_or_else(|| {
                (measured[2] - old[2])
                    .abs()
                    .max((measured[3] - old[3]).abs())
            });
            let explained = SIZE_STEP_SLACK * size_step + LAYOUT_SNAP_EPSILON;
            let jump = (measured[0] - old[0]).abs() > explained
                || (measured[1] - old[1]).abs() > explained;
            let any_zero = [old, measured].iter().any(|r| r[2] <= 0.0 || r[3] <= 0.0);
            if !jump || any_zero {
                self.channel.init(measured);
                return None;
            }
            self.channel.arm(measured, spec);
        }
        self.channel.tick(dt);
        let c = self.channel.current;
        (c != measured).then_some([c[0], c[1], measured[2], measured[3]])
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
    /// A shared flight: `translation` is already a root-space path expressed
    /// in the parent's PRISTINE frame (both ends re-derived through it each
    /// frame — `seed_in_parent_space`), so the composition walk must not
    /// stack the ancestors' shown deltas on top: the node composes against
    /// its parent's pristine frame, its own children still ride it.
    pub root_anchored: bool,
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
            root_anchored: false,
        }
    }
}

/// An outgoing node's root-space rect expressed in the incoming node's
/// parent layout space: the offset from the node's pristine center (`own`)
/// through the parent's inverse frame, added to the node's `measured` rect;
/// the size through the parent's scale. `None` when the parent frame is
/// singular (a `transform: { scale: 0 }` ancestor — nothing to show anyway).
fn seed_in_parent_space(
    rect: SharedRect,
    own: Affine2,
    parent: Affine2,
    measured: LayoutRect,
) -> Option<LayoutRect> {
    if parent.matrix2.determinant().abs() <= f32::EPSILON {
        return None;
    }
    let offset = parent.inverse().matrix2 * (rect.center - own.translation);
    let parent_scale = Vec2::new(
        parent.matrix2.x_axis.length(),
        parent.matrix2.y_axis.length(),
    );
    Some([
        measured[0] + offset.x,
        measured[1] + offset.y,
        rect.size.x / parent_scale.x,
        rect.size.y / parent_scale.y,
    ])
}

/// The seed frame shows the natural box through the FLIP `scale`, and the
/// corner radii bevy resolved at the natural size would shrink with it (a
/// 36px circle seed on a 72px thumb, shown as a 200px hero at 0.36, would
/// read as 13px). Divide the resolved radii out by the scale for this one
/// frame — bevy rewrites `ComputedNode.border_radius` from `Node` every
/// frame, unconditionally, so nothing lingers. Anisotropic scales use the
/// mean (a per-corner radius has one value); the clamp mirrors bevy's
/// (half the shorter side).
fn compensate_seed_frame_radius(computed: &mut Mut<ComputedNode>, scale: Vec2) {
    let s = 0.5 * (scale.x + scale.y);
    if s <= f32::EPSILON || (s - 1.0).abs() < 1e-6 {
        return;
    }
    let max = 0.5 * computed.size.min_element();
    let fix = |r: f32| (r / s).clamp(0.0, max);
    // No change mark, as in bevy's own write.
    let radius = &mut computed.bypass_change_detection().border_radius;
    radius.top_left = fix(radius.top_left);
    radius.top_right = fix(radius.top_right);
    radius.bottom_right = fix(radius.bottom_right);
    radius.bottom_left = fix(radius.bottom_left);
}

/// The per-node query of [`drive_layout_transitions`]: the transitioning
/// entity, its input + state, its animation bindings (the adopt gate), and
/// its `ComputedNode` (the scale factor a shared size flight writes logical
/// px through).
type LayoutNodeQuery = (
    Entity,
    &'static TransitionInput,
    &'static mut TransitionState,
    Option<&'static AnimatedNode>,
    Option<&'static mut ComputedNode>,
);

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
///
/// A shared flight is **root-anchored** ([`LayoutDelta::root_anchored`]): its
/// `Δ` already encodes a root-space path re-derived through `P` every frame,
/// so it composes as `P · T(Δ) · P⁻¹ · G · S(s)` — against the parent's
/// pristine frame, never `P'` — and nested shared flights each fly their own
/// straight line. A flight that settles while an ancestor still animates
/// parks at its destination ([`SharedMode::Landed`]) until the ancestor is
/// done, so it never jumps onto the still-moving frame.
#[allow(clippy::too_many_arguments)]
pub fn drive_layout_transitions(
    time: Res<Time>,
    mut ui_surface: ResMut<UiSurface>,
    mut states: Query<LayoutNodeQuery>,
    parents: Query<&ChildOf>,
    children: Query<&Children>,
    mut globals: Query<&mut UiGlobalTransform>,
    layout_configs: Query<&LayoutConfig>,
    // The nodes that composed a delta LAST frame — the hold gate for a
    // settling shared flight (`LayoutChannel::hold_shared`). One frame of lag
    // is harmless: an ancestor that settled last frame writes nothing now, so
    // releasing this frame can't pop.
    mut last_animating: Local<EntityHashSet>,
) {
    let dt = time.delta_secs();
    let mut deltas: EntityHashMap<LayoutDelta> = EntityHashMap::default();
    // Every node in a shared flight and its size step this frame (live −
    // natural, physical px): the regressors a descendant's flight attributes
    // its motion to (`SharedReflow`), read before any state moves.
    let flying: EntityHashMap<Vec2> = states
        .iter()
        .filter_map(|(e, _, state, _, computed)| {
            let r = state.shared.reflow.as_ref()?;
            Some((e, computed?.size - r.natural))
        })
        .collect();
    // A singular frame (a `transform: { scale: 0 }` ancestor) has no local
    // frame to recover; its subtree is invisible anyway.
    let inverse = |a: Affine2| (a.matrix2.determinant().abs() > f32::EPSILON).then(|| a.inverse());
    for (entity, input, mut state, anim, mut computed) in &mut states {
        // A shared flight drives the rect with the `sharedElement` spec
        // captured at the seed (a variant swap can't drop it mid-flight),
        // even without a `layout` entry; once it settles the regular rule
        // stands.
        let shared_spec = state.shared.spec.clone();
        let shared_spec = shared_spec.as_ref();
        let spec = input.spec.for_layout().or_else(|| {
            (state.shared.rect.is_some() || state.layout.shared_active())
                .then_some(shared_spec)
                .flatten()
        });
        let Some(spec) = spec else {
            // Unset (mid-flight or not): forget everything, bevy's own value
            // stands. `seeded` is the one-and-only armed flag (a runner
            // exists only after seeding).
            if state.layout.seeded {
                state.layout.reset();
            }
            state.shared.origin = None;
            state.shared.destination = None;
            state.shared.reflow = None;
            continue;
        };
        // Rounded or not exactly as bevy's walk consumed it — the node's
        // effective `LayoutConfig` (its own, else the nearest ancestor's,
        // else bevy's default of rounding): the change frame then shows the
        // previously DISPLAYED rect, not a rounded/unrounded neighbour of it
        // (a ≤1px shimmer otherwise, and a ≤0.5px composition error on a
        // `layoutRounding: false` subtree).
        // Free when no node sets `layoutRounding` (bevy's walk then rounds
        // everything): the ancestor walk only runs once a config exists.
        let use_rounding = layout_configs.is_empty()
            || std::iter::once(entity)
                .chain(parents.iter_ancestors(entity))
                .find_map(|e| layout_configs.get(e).ok())
                .is_none_or(|c| c.use_rounding);
        let Ok((layout, _unrounded)) = ui_surface.get_layout(entity, use_rounding) else {
            continue;
        };
        let size = Vec2::new(layout.size.width, layout.size.height);
        let measured = [
            layout.location.x + size.x * 0.5,
            layout.location.y + size.y * 0.5,
            size.x,
            size.y,
        ];
        // This frame's pristine frames, read once: both ends of a shared
        // flight are root-space rects that have to be re-expressed in the
        // node's parent layout space every frame.
        let own = globals
            .get(entity)
            .map(|g| **g)
            .unwrap_or(Affine2::IDENTITY);
        let parent = parents
            .get(entity)
            .ok()
            .and_then(|c| globals.get(c.parent()).ok())
            .map(|g| **g)
            .unwrap_or(Affine2::IDENTITY);
        // A root-space rect in this node's parent layout space, off THIS
        // frame's pristine globals (see `seed_in_parent_space`).
        let in_parent_space = |rect: SharedRect| seed_in_parent_space(rect, own, parent, measured);
        // In flight, the motion of the node's settled position the flight
        // did NOT cause (a scroll, a resize, a sibling insert — see
        // `SharedReflow`): both ends move by it this frame.
        let in_flight = state.layout.shared_active();
        let external = match state.shared.reflow.as_mut() {
            Some(r) if in_flight => {
                let ancestors: Vec<(Entity, Vec2)> = parents
                    .iter_ancestors(entity)
                    .filter_map(|a| flying.get(&a).map(|step| (a, *step)))
                    .collect();
                r.observe(own.translation, size, &ancestors)
            }
            _ => Vec2::ZERO,
        };
        // A shared-element seed (parked by `drive_transitions` this frame):
        // seed the channel from the converted rect, keep the root-space rects
        // for the flight, and arm the measured-px size flight from the seed's
        // size to the natural one just measured.
        if let Some(rect) = state.shared.rect.take()
            && let Some(shared) = shared_spec
            && let Some(seed) = in_parent_space(rect)
        {
            state.layout.seed_shared(seed, measured, shared);
            let flying = state.layout.shared_active();
            state.shared.origin = flying.then_some(rect);
            // The seed frame is the ONE frame the natural rect is measurable:
            // the size flight has not written px into `Node` yet, so this
            // node's pristine global IS where it will settle. Every later
            // measurement is displaced by the flight's own eased size.
            state.shared.destination = flying.then(|| SharedRect {
                center: own.translation,
                size: Vec2::new(measured[2], measured[3])
                    * Vec2::new(
                        parent.matrix2.x_axis.length(),
                        parent.matrix2.y_axis.length(),
                    ),
            });
            state.shared.reflow = flying.then(|| SharedReflow::new(own.translation, size));
            // A `{ animated }` binding on a `Node` field owns the size
            // (bindings win, as everywhere): no size flight then.
            if !anim.is_some_and(|a| a.0.has_node_props()) {
                let inverse_scale_factor = computed
                    .as_deref()
                    .map(|c| c.inverse_scale_factor)
                    .unwrap_or(1.0);
                state.arm_shared_size(
                    [seed[2], seed[3]],
                    [measured[2], measured[3]],
                    inverse_scale_factor,
                    shared,
                );
            }
        } else if let Some(rect) = state.shared.origin
            && let Some(seed) = in_parent_space(rect.shifted(external))
        {
            // In flight: the parent frame may have moved since the seed was
            // converted (the size flight re-flows a centered parent) — the
            // take-off point is root-space, re-express it before the step;
            // and it rides external motion (the content scrolled under the
            // flight) so the whole line moves, never just its end.
            state.layout.rebase_shared(seed);
        }
        // ...and so is the landing point. Falls back to the live rect when
        // there is no flight, or when the parent frame is singular.
        let destination = state
            .shared
            .destination
            .map(|rect| rect.shifted(external))
            .and_then(in_parent_space)
            .unwrap_or(measured);
        // The node's OWN layout writers are the one cause the engine can
        // attribute: a `{ animated }` binding on a `Node` field
        // (width/height/left/top/…) owns the rect outright; its `size`
        // channel owns the size, and the channel judges the rest by it
        // (`RectWriter`) — except during a shared flight, whose size ease is
        // the flight's own (the channel goes translate-only instead).
        let writer = if anim.is_some_and(|a| a.0.has_node_props()) {
            RectWriter::Binding
        } else if state.size_in_flight() && !state.layout.shared_active() {
            RectWriter::SizeChannel
        } else {
            RectWriter::None
        };
        let seed_frame = state.layout.on_seed_frame();
        // Read BEFORE the drive: the settle step flips the mode to `Off`
        // while still returning the destination — root-anchored too.
        let shared_flight = state.layout.shared_active();
        if shared_flight {
            let hold = parents
                .iter_ancestors(entity)
                .any(|a| last_animating.contains(&a));
            state.layout.hold_shared(hold);
        }
        let own_size = state.size_currents_px();
        state.layout.note_own_size(own_size);
        if let Some(shown) = state.layout.drive(measured, destination, spec, writer, dt) {
            let mut delta = LayoutDelta::between(shown, measured);
            delta.root_anchored = shared_flight;
            if seed_frame && let Some(computed) = computed.as_mut() {
                compensate_seed_frame_radius(computed, delta.scale);
            }
            deltas.insert(entity, delta);
        }
        if !state.layout.shared_active() {
            state.shared.origin = None;
            state.shared.destination = None;
            state.shared.reflow = None;
        }
    }
    last_animating.clear();
    if deltas.is_empty() {
        return;
    }
    last_animating.extend(deltas.keys().copied());

    // Root-most animating nodes; every other animating node is reached by
    // the top-down walk from its nearest animating ancestor.
    let has_animating_ancestor =
        |e: Entity| parents.iter_ancestors(e).any(|a| deltas.contains_key(&a));
    let roots: Vec<Entity> = deltas
        .keys()
        .copied()
        .filter(|&e| !has_animating_ancestor(e))
        .collect();

    // (entity, parent pristine global INVERSE, parent pristine global,
    // parent composed global)
    let mut stack: Vec<(Entity, Affine2, Affine2, Affine2)> = Vec::new();
    for root in roots {
        let parent = parents
            .get(root)
            .ok()
            .and_then(|c| globals.get(c.parent()).ok())
            .map(|g| **g)
            .unwrap_or(Affine2::IDENTITY);
        if let Some(inv) = inverse(parent) {
            stack.push((root, inv, parent, parent));
        }
    }
    while let Some((entity, parent_inverse, parent_pristine, parent_composed)) = stack.pop() {
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
                // A shared flight's translation is a root-space path in the
                // parent's PRISTINE frame: composing it under the parent's
                // shown frame would apply the ancestors' deltas twice.
                let base = if d.root_anchored {
                    parent_pristine
                } else {
                    parent_composed
                };
                let unscaled = base * Affine2::from_translation(d.translation) * local;
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
                stack.push((child, inv, pristine, for_children));
            }
        }
    }
}
