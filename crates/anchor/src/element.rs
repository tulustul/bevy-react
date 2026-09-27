//! The `<anchor>` element declaration: its attributes, the writer that turns
//! them into an [`Anchored`] binding, and the spawn hook.

use bevy::prelude::*;
use bevy_react_core::element::{Attribute, Attrs, Element, SpawnCtx};
use bevy_react_core::ext::ElementFlags;
use bevy_react_core::style::{Codec, Writer, owns};

use crate::position::{AnchorScaling, Anchored};

/// The Bevy entity to follow, as `Entity::to_bits()`. Carried as `f64`
/// because it crosses as a plain JS number (the op wire is JSON — the
/// runtime converts a `bigint` to a number); lossless for realistic ids
/// (well under 2^53).
pub static ENTITY: Attribute<f64> =
    Attribute::with_codec("entity", Codec::serde_as("number | bigint"));
/// World-space offset added to the target's translation before projecting.
pub static OFFSET: Attribute<[f32; 3]> = Attribute::with_codec("offset", Codec::serde_as("Vec3"));
/// Distance-based scaling (else the overlay stays at scale 1).
pub static SCALE: Attribute<AnchorScaling> =
    Attribute::with_codec("scale", Codec::serde_as("AnchorScaling"));

/// The `<anchor>` element: a styled node positioned each frame over a 3D
/// entity's projected position. **Detached**: the core never attaches it
/// under its React parent (removing that parent still despawns it) — it
/// lives under the [`AnchorLayer`](crate::AnchorLayer), so it never takes part in its declared
/// parent's flex layout or scroll range.
pub static ANCHOR: Element = Element {
    flags: ElementFlags {
        detached: true,
        ..ElementFlags::NODE
    },
    attrs: &[&ENTITY, &OFFSET, &SCALE],
    required: &[&ENTITY],
    writers: &[&ANCHOR_WRITER],
    spawn: Some(spawn_anchor),
    ..Element::new("anchor")
};

/// The anchor binding: [`Anchored`] from `entity`/`offset`/`scale`. A
/// missing or malformed entity binds nothing followable — the overlay stays
/// hidden, exactly like one whose target despawned.
pub static ANCHOR_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[&ENTITY, &OFFSET, &SCALE],
    writes: &[owns::<Anchored>],
    apply: |ctx, _s, ec| {
        if !ctx.fresh {
            ec.insert(anchored(ctx.attrs));
        }
    },
};

pub(crate) fn anchored(attrs: &Attrs) -> Anchored {
    Anchored {
        target: attrs
            .get(&ENTITY)
            .and_then(|bits| Entity::try_from_bits(*bits as u64))
            .unwrap_or(Entity::PLACEHOLDER),
        offset: attrs
            .get(&OFFSET)
            .map(|o| Vec3::from(*o))
            .unwrap_or(Vec3::ZERO),
        // Sanitized once here so the per-frame scale math can't panic on
        // JS-supplied NaN/reversed bounds.
        scale: attrs
            .get(&SCALE)
            .copied()
            .and_then(AnchorScaling::sanitized),
    }
}

fn spawn_anchor(ctx: &mut SpawnCtx) -> Entity {
    let binding = anchored(&ctx.props.attrs);
    ctx.spawn(binding)
}
