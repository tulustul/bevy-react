//! The style-property registry. Every style property — the core's and a
//! feature crate's alike — is a `static` [`StyleProperty`] registered with
//! `ReactAppExt::add_react_style(s)`: its wire name, how its value decodes
//! ([`Codec`]), and what a change to it invalidates ([`Invalidate`]). The
//! static doubles as the typed key the merged style is read with
//! (`style.get(&OPACITY)`). The core's own properties are in [`props`].

mod codec;
mod dirty;
mod invalidation;
mod property;
pub mod props;
mod registry;
mod stamp;
mod store;
pub(crate) mod ts;
mod writer;
pub mod writers;

pub use codec::{Codec, DecodeFn, KeywordTable};
pub use dirty::StyleDirty;
pub use invalidation::{Invalidate, Invalidation, NodeCtx};
pub use property::{AnyStyleProperty, PropertyValue, StyleProperty};
pub(crate) use registry::core_id;
pub use registry::{PropId, StyleRegistry};
pub use stamp::{STAMP_WRITER, StyleValue};
pub(crate) use store::stored as stored_value;
pub use store::{OldValues, StoredValue, Style, StyleValueDyn};
pub use writer::{ComponentKey, Writer, WriterCtx, WriterMask, owns};

/// Register the core's style properties and writers on `app` — through the
/// same calls a feature crate uses. `ReactUiPlugin` does this; a headless
/// harness that builds its own bridge calls it before snapshotting the
/// app's registry.
pub fn add_core_styles(app: &mut bevy::app::App) {
    use crate::ReactAppExt;
    app.add_react_styles(props::CORE_STYLES)
        .add_react_style_writers(writers::CORE_WRITERS);
}

/// The core's properties and writers alone — the registry the apply path
/// falls back to where no app registry is at hand (headless harnesses
/// without the bridge).
pub(crate) fn core_registry() -> &'static StyleRegistry {
    static CORE: std::sync::OnceLock<StyleRegistry> = std::sync::OnceLock::new();
    CORE.get_or_init(|| {
        let mut registry = StyleRegistry::default();
        for property in props::CORE_STYLES {
            registry.add(*property);
        }
        for writer in writers::CORE_WRITERS {
            registry.add_writer(writer);
        }
        registry
    })
}

#[cfg(test)]
mod decode_tests;
#[cfg(test)]
mod ext_tests;
#[cfg(test)]
mod invalidation_tests;
#[cfg(test)]
mod tests;

/// Test helpers over the core registry.
#[cfg(test)]
pub(crate) mod test_support {
    use super::{StyleDirty, Writer, core_registry};

    /// Whether a change to `dirty` re-runs `writer`.
    pub(crate) fn runs(dirty: &StyleDirty, writer: &Writer) -> bool {
        let styles = core_registry();
        styles
            .writers_for(dirty)
            .intersects(styles.writer_bit(writer))
    }

    /// Whether a change to `dirty` re-evaluates layer promotion.
    pub(crate) fn promotes(dirty: &StyleDirty) -> bool {
        core_registry()
            .invalidation(
                dirty,
                &super::OldValues::default(),
                super::Style::empty(),
                &super::NodeCtx {
                    promoted: false,
                    kind: "node",
                },
            )
            .contains(super::Invalidation::PROMOTION)
    }
}
