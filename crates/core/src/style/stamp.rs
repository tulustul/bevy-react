//! Auto-stamping: a feature property that no writer reads lands on the
//! entity as a [`StyleValue<T>`] component, for the feature's own system to
//! react to (`Query<&StyleValue<Glow>>` + `Changed`), ordered
//! `.after(ReactApplySet)`.

use bevy::prelude::*;

use super::property::PropertyValue;
use super::{Style, Writer, WriterCtx};

/// The value of a stamped style property on its node (see the module doc).
/// Present exactly while the merged style (hover/press/focus variants
/// included) sets the property; updated compare-before-write.
///
/// A stamped property's value type must be unique among stamped properties
/// (a newtype such as `struct Tooltip(String)`); registering two with one
/// type panics at startup.
#[derive(Component, Debug, Clone, PartialEq)]
pub struct StyleValue<T: PropertyValue>(pub T);

/// The core writer behind auto-stamping: it reads every feature property no
/// other writer reads (the registry wires those reads) and stamps each.
pub static STAMP_WRITER: Writer = Writer {
    reads: &[],
    attrs: &[],
    writes: &[],
    apply: apply_stamps,
};

fn apply_stamps(ctx: &WriterCtx, s: &Style, ec: &mut EntityCommands) {
    for &id in ctx.styles.stamped() {
        if let Some(property) = ctx.styles.by_id(id) {
            property.stamp(s, ec, ctx.fresh);
        }
    }
}

/// Stamp `value` (or clear the component) — the typed half of
/// [`AnyStyleProperty::stamp`](super::AnyStyleProperty::stamp).
pub(super) fn stamp<T: PropertyValue>(value: Option<&T>, ec: &mut EntityCommands, fresh: bool) {
    match value {
        Some(value) => {
            let value = value.clone();
            ec.queue(
                move |mut entity: EntityWorldMut| match entity.get_mut::<StyleValue<T>>() {
                    Some(mut current) => {
                        if current.0 != value {
                            current.0 = value;
                        }
                    }
                    None => {
                        entity.insert(StyleValue(value));
                    }
                },
            );
        }
        None if fresh => {}
        None => {
            ec.remove::<StyleValue<T>>();
        }
    }
}
