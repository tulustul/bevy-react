//! The shared-element **seed**: what the transition engine needs from an
//! outgoing node to start the incoming node's flight where the outgoing one
//! visually was (see `crate::shared_tags` for the pairing).
//!
//! A seed is taken by a command queued before the outgoing node's despawn
//! ([`snapshot_into_pending`]), parked in [`PendingSharedSeeds`], and
//! stamped on the incoming entity as a [`SharedSeed`] once the batch's
//! commands have built it ([`stamp_pending`]). `drive_transitions` consumes
//! it on the node's first drive: every channel's first sight becomes a
//! *seeded* one — the channel starts at the outgoing node's on-screen value
//! and eases to its own target with the node's `transition.sharedElement`
//! spec — instead of the silent adopt of the mount rule. The rect seeds the
//! layout channel in `PostUpdate` (see [`super::layout`]), once the incoming
//! node's own first layout has measured its natural rect.

use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform, UiTransform};

use super::spec::ChannelTransition;
use super::{TransitionInput, TransitionState, color_to_rgba};
use crate::protocol::{NodeId, units::Length};
use crate::ui_map::length_to_val;

/// Per-entity shared-flight bookkeeping on [`TransitionState`].
#[derive(Default)]
pub(super) struct SharedFlight {
    /// A seeded flight is in progress: the blocks of every seeded channel
    /// run (even without a spec of their own) until nothing the seed armed
    /// is still easing.
    pub active: bool,
    /// The `sharedElement` spec captured at the seed — the flight's timing
    /// must survive a hover/press variant swapping the `transition` object
    /// out from under it mid-flight.
    pub spec: Option<ChannelTransition>,
    /// The first drive after seeding: the one frame on which channels arm
    /// with the shared spec as their fallback. Later retargets use each
    /// channel's own spec (a spec-less hover mid-flight snaps, as usual).
    pub seed_frame: bool,
    /// Which channels the seed frame armed ([`TransitionState::running_mask`]
    /// bits) — the flight is over once none of THOSE runs, whatever
    /// unrelated retargets happen meanwhile.
    pub armed: u32,
    /// The seed rect, parked by `drive_transitions` (Update) for the layout
    /// channel to consume in `PostUpdate`, after the node's first layout has
    /// measured its natural rect.
    pub rect: Option<SharedRect>,
    /// The seed rect the layout channel is flying from, kept in ROOT space
    /// for as long as the flight runs: the layout drive re-expresses it in
    /// the parent's frame every frame (`LayoutChannel::rebase_shared`), so
    /// a parent re-flowed mid-flight — a centered container following the
    /// size flight — never drags the take-off point along.
    pub origin: Option<SharedRect>,
    /// The measured-px size flight, armed by the layout drive: which `Node`
    /// dimensions the size channels are easing in px right now.
    pub size: Option<SharedSizeFlight>,
}

#[derive(Default, Clone, Copy)]
pub(super) struct SharedSizeFlight {
    pub width: bool,
    pub height: bool,
}

/// Size deltas below this (physical px) don't arm a size flight.
const SIZE_SNAP_EPSILON: f32 = super::layout::LAYOUT_SNAP_EPSILON;

/// The outgoing node's on-screen rect, in root space, physical px: its
/// center (the global transform's translation) and its size as shown (the
/// laid-out size times the global's scale — a node mid-FLIP is seeded from
/// where the eye sees it).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SharedRect {
    pub center: Vec2,
    pub size: Vec2,
}

/// The seed stamped on an incoming shared-element node; consumed (and
/// removed) by the transition engine on the node's first drive.
#[derive(Component)]
pub struct SharedSeed {
    /// The outgoing node's channel readings (its `TransitionState` currents,
    /// overlaid with the live components a static node shows), runners
    /// dropped — the values on screen at the swap.
    pub(super) state: Box<TransitionState>,
    pub rect: SharedRect,
}

#[cfg(test)]
impl SharedSeed {
    pub(crate) fn opacity_current(&self) -> f32 {
        self.state.opacity.current
    }
    pub(crate) fn scale_current(&self) -> f32 {
        self.state.scale.current
    }
}

/// Seeds taken this batch, keyed by the incoming node id, between the
/// snapshot and stamp commands (initialized on first use).
#[derive(Resource, Default)]
pub struct PendingSharedSeeds(pub(crate) std::collections::HashMap<NodeId, SharedSeed>);

/// Read the outgoing entity's on-screen state. `None` when it carries no
/// UI geometry (a span, a shape) — nothing to seed from.
pub(crate) fn snapshot(world: &World, outgoing: Entity) -> Option<SharedSeed> {
    let entity = world.get_entity(outgoing).ok()?;
    let computed = entity.get::<ComputedNode>()?;
    let global = entity.get::<UiGlobalTransform>()?;
    let m = global.matrix2;
    // The node's own `UiTransform` scale is composed into its global; the
    // seed rect is the LAYOUT rect as shown by everything above the node
    // (the incoming node's own scale channel is seeded separately below —
    // baking it in here too would apply it twice).
    let own_scale = entity
        .get::<UiTransform>()
        .map(|t| t.scale)
        .filter(|s| s.x.abs() > f32::EPSILON && s.y.abs() > f32::EPSILON)
        .unwrap_or(Vec2::ONE);
    let rect = SharedRect {
        center: global.translation,
        size: computed.size * Vec2::new(m.x_axis.length(), m.y_axis.length()) / own_scale,
    };
    let mut state = match entity.get::<TransitionState>() {
        Some(s) => s.seeded_copy(),
        None => {
            // A static node: every channel rests at its identity (a plain
            // `default()` would read opacity/scale as 0), its transform IS
            // its `UiTransform`.
            let mut s = TransitionState::at_identity();
            if let Some(t) = entity.get::<UiTransform>() {
                let len = |v: Val| match v {
                    Val::Px(x) => Some(Length::Px(x)),
                    Val::Percent(x) => Some(Length::Percent(x)),
                    _ => None,
                };
                if let Some(x) = len(t.translation.x) {
                    s.translate_x.init(x);
                }
                if let Some(y) = len(t.translation.y) {
                    s.translate_y.init(y);
                }
                s.scale_x.init(t.scale.x);
                s.scale_y.init(t.scale.y);
                s.rotate.init(t.rotation.as_radians());
            }
            s
        }
    };
    // The live background is the truth for color whether or not the node
    // transitioned (a state whose color channel never had a target reads as
    // transparent black).
    if let Some(bg) = entity.get::<BackgroundColor>() {
        state.color.init(color_to_rgba(bg.0));
    }
    Some(SharedSeed {
        state: Box::new(state),
        rect,
    })
}

/// Snapshot command: read `outgoing` (still alive — queued before its
/// despawn) into the pending map under the incoming node's id.
pub(crate) fn snapshot_into_pending(world: &mut World, outgoing: Entity, incoming: NodeId) {
    if let Some(seed) = snapshot(world, outgoing) {
        world
            .get_resource_or_init::<PendingSharedSeeds>()
            .0
            .insert(incoming, seed);
    }
}

/// Drop a pending seed whose incoming node vanished within the same batch
/// (nothing will ever stamp it).
pub(crate) fn discard_pending(world: &mut World, incoming: NodeId) {
    if let Some(mut p) = world.get_resource_mut::<PendingSharedSeeds>() {
        p.0.remove(&incoming);
    }
}

/// Forget every pending seed (an `Op::Reset` tore the tree down).
pub(crate) fn clear_pending(world: &mut World) {
    if let Some(mut p) = world.get_resource_mut::<PendingSharedSeeds>() {
        p.0.clear();
    }
}

/// Stamp command: move the pending seed onto the built incoming entity —
/// only when its style declares a `transition: { sharedElement }` (the
/// flight's timing is explicit-only; without it the pairing is inert).
pub(crate) fn stamp_pending(world: &mut World, incoming: NodeId, entity: Entity) {
    let Some(seed) = world
        .get_resource_mut::<PendingSharedSeeds>()
        .and_then(|mut p| p.0.remove(&incoming))
    else {
        return;
    };
    let Ok(mut em) = world.get_entity_mut(entity) else {
        return;
    };
    if em
        .get::<TransitionInput>()
        .is_some_and(|i| i.spec.for_shared_element().is_some())
    {
        em.insert(seed);
    }
}

/// Copy every value channel's current reading from `from` into `to`
/// (runners dropped). The `size` rows are deliberately skipped: a shared
/// flight eases size in MEASURED px (armed by the layout drive), never in
/// the outgoing node's authored units.
fn copy_value_channels(to: &mut TransitionState, from: &TransitionState) {
    macro_rules! row {
        ($ch:ident, size) => {};
        ($ch:ident, $group:ident) => {
            to.$ch.init(from.$ch.current);
        };
    }
    macro_rules! rows {
        ($(($ch:ident, $d:tt, $group:ident),)*) => {
            $(row!($ch, $group);)*
        };
    }
    super::channels::with_input_channels!(rows);
    to.color.init(from.color.current);
    to.filter.seed_from(&from.filter);
    to.backdrop_filter.seed_from(&from.backdrop_filter);
    to.background_gradient.seed_from(&from.background_gradient);
    to.border_gradient.seed_from(&from.border_gradient);
    to.transform3d.seed_from(&from.transform3d);
}

impl TransitionState {
    /// A state resting at every channel's identity default (the mount seed
    /// of a node with no targets): opacity 1, scale 1, no translation.
    pub(super) fn at_identity() -> TransitionState {
        let mut s = TransitionState::default();
        macro_rules! rows {
            ($(($ch:ident, $d:tt, $group:ident),)*) => {
                $(s.$ch.init($d);)*
            };
        }
        super::channels::with_input_channels!(rows);
        s
    }

    /// A fresh state whose every value channel rests at this one's current
    /// reading (runners dropped, layout/morph/shape untouched) — the
    /// outgoing node's on-screen values, as a seed.
    pub(super) fn seeded_copy(&self) -> TransitionState {
        let mut s = TransitionState::default();
        copy_value_channels(&mut s, self);
        s
    }

    /// Overlay a seed onto this (just-mounted) state: every value channel
    /// now rests at the outgoing node's reading, so the drive blocks' normal
    /// retarget path eases from there with the shared spec. `initialized`
    /// stays as the caller left it (the mount block runs first, for the
    /// channels a seed never covers — the morph key, the size channels).
    pub(super) fn seed_from(&mut self, seed: &SharedSeed, spec: ChannelTransition) {
        copy_value_channels(self, &seed.state);
        self.shared = SharedFlight {
            active: true,
            spec: Some(spec),
            seed_frame: true,
            armed: 0,
            rect: Some(seed.rect),
            origin: None,
            size: None,
        };
    }

    /// One bit per value channel a seed can arm, set while its runner is
    /// live. The seed frame records this as `shared.armed`; the flight ends
    /// when none of the armed bits is still set.
    pub(super) fn running_mask(&self) -> u32 {
        let mut mask = 0u32;
        let mut bit = 0u32;
        macro_rules! push {
            ($cond:expr) => {
                if $cond {
                    mask |= 1 << bit;
                }
                bit += 1;
            };
        }
        macro_rules! row {
            ($ch:ident, size) => {};
            ($ch:ident, $group:ident) => {
                push!(self.$ch.runner.is_some());
            };
        }
        macro_rules! rows {
            ($(($ch:ident, $d:tt, $group:ident),)*) => {
                $(row!($ch, $group);)*
            };
        }
        super::channels::with_input_channels!(rows);
        push!(self.color.runner.is_some());
        push!(self.filter.channel.runner.is_some());
        push!(self.backdrop_filter.channel.runner.is_some());
        push!(self.background_gradient.in_flight());
        push!(self.border_gradient.in_flight());
        push!(self.transform3d.in_flight());
        let _ = bit;
        mask
    }

    /// Whether the flight the seed started is still going: an armed value
    /// channel still easing, the size flight, or the rect (pending or in
    /// its translate-only ease).
    pub(super) fn seeded_still_running(&self) -> bool {
        (self.shared.armed & self.running_mask()) != 0
            || self.shared.size.is_some()
            || self.shared.rect.is_some()
            || self.layout.shared_active()
    }

    /// Arm the measured-px size flight (called by the layout drive once the
    /// natural rect is known): each axis whose seed size differs from the
    /// natural one eases `Node.width`/`height` in logical px from the seed
    /// to the natural size; the others are left to layout.
    pub(super) fn arm_shared_size(
        &mut self,
        seed_px: [f32; 2],
        natural_px: [f32; 2],
        inverse_scale_factor: f32,
        spec: &ChannelTransition,
    ) {
        // A zero natural size has no pixels to fly to (a not-yet-resident
        // image measures 0×0 on its mount frame) — leave that axis to layout.
        let flying = |i: usize| {
            natural_px[i] > 0.0 && (seed_px[i] - natural_px[i]).abs() >= SIZE_SNAP_EPSILON
        };
        let flight = SharedSizeFlight {
            width: flying(0),
            height: flying(1),
        };
        macro_rules! arm {
            ($ch:ident, $i:expr) => {
                self.$ch
                    .init(Length::Px(seed_px[$i] * inverse_scale_factor));
                self.$ch
                    .arm(Length::Px(natural_px[$i] * inverse_scale_factor), spec);
            };
        }
        if flight.width {
            arm!(width, 0);
        }
        if flight.height {
            arm!(height, 1);
        }
        if flight.width || flight.height {
            self.shared.size = Some(flight);
        }
    }

    /// Advance the size flight one frame, compare-writing the flying `Node`
    /// dimensions; a completed axis writes the AUTHORED value back (and rests
    /// its channel there, so the regular size block sees no retarget).
    /// Clears the flight once no axis is flying.
    pub(super) fn drive_shared_size(&mut self, node: &mut Node, input: &TransitionInput, dt: f32) {
        let Some(mut flight) = self.shared.size else {
            return;
        };
        macro_rules! axis {
            ($flag:ident, $ch:ident) => {
                if flight.$flag {
                    let v = match self.$ch.tick(dt) {
                        Some(false) => length_to_val(self.$ch.current),
                        _ => {
                            let authored = input.$ch.unwrap_or(Length::Auto);
                            self.$ch.init(authored);
                            flight.$flag = false;
                            length_to_val(authored)
                        }
                    };
                    if node.$ch != v {
                        node.$ch = v;
                    }
                }
            };
        }
        axis!(width, width);
        axis!(height, height);
        self.shared.size = (flight.width || flight.height).then_some(flight);
    }
}
