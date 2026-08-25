//! The wire protocol shared between the JS reconciler and the Bevy side.
//!
//! Everything here derives `serde` so deno_core's `serde_v8` can convert
//! directly between the plain JS objects the reconciler builds and these Rust
//! types — no JSON strings on the hot path. Ops only ever flow JS -> Rust, so
//! they need `Deserialize` only; `UiEvent` flows Rust -> JS and is `Serialize`.
//!
//! Wire strings are decoded **once, here at the serde boundary** — never
//! re-parsed on apply. The unit-bearing types (`Length`/`Angle`/`Time`/
//! `FontSize`) parse into their own wire types, and the enum-like style fields
//! (`display`/`align*`/`flex*`/grid tracks/…) decode directly into the
//! `bevy_ui`/`bevy_text` values they drive, via field-level `deserialize_with`
//! (which sidesteps the orphan rule), so applying a style in [`crate::ui_map`]
//! is a plain field copy. A malformed string must **not** fail the whole batch
//! (one typo would abort the entire commit and trigger a reload), so every
//! deserializer falls back to the bevy default and emits a
//! `tracing::warn!` naming the bad value (`tracing` reaches the same log sink
//! `bevy_log` drains). In dev builds with devtools those fallbacks are also
//! collected as structured `crate::diag` entries (`decode_warn` +
//! [`op::OpBatch`]'s per-op attribution) so the inspector can flag the offending
//! style/prop rows.

pub mod animatable;
pub mod background_image;
pub mod grid;
pub mod keywords;
mod merge;
pub mod op;
pub mod outbound;
pub mod props;
pub mod style;
pub mod transform;
pub mod units;
pub mod visual;

/// Stable identity for a node, assigned by the JS reconciler. `0` is reserved
/// for the root container (the Bevy UI root entity).
pub type NodeId = u32;

pub const ROOT_ID: NodeId = 0;

/// Emit a decode-fallback warning: the terminal `warn!` (deduped per distinct
/// message — [`crate::diag::log_warn`]) plus, in dev builds with devtools, a
/// structured [`crate::diag`] entry so the inspector can flag the row. `kind`
/// names the value's domain (`"length"`, `"rect"`, a keyword field's kind, …);
/// `value` is the raw offending wire string.
pub(crate) fn decode_warn(kind: &'static str, value: &str, message: &str) {
    crate::diag::decode_report(kind, value, message);
}
