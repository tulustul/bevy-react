//! The `svg-text` feature seam: SVG `<text>` support needs a font database,
//! which pulls in `fontdb` (a system-font scan + extra deps), so it is opt-in.
//! Always declared — [`super::asset::parse_svg_bytes`] calls
//! [`configure_text_options`] unconditionally — but the real body only exists
//! with the `svg-text` cargo feature (which enables `usvg/text`); otherwise it
//! is an inline no-op. Same idiom as `crate::diag`.
//!
//! Without `usvg/text`, `usvg::Options` has no font fields at all, so only the
//! feature-gated body may reference them.

/// Point the parse options at a font database with system fonts loaded, so SVG
/// `<text>` elements resolve to real glyphs. The system-font scan runs once
/// per process; every parse shares the same [`fontdb::Database`](usvg::fontdb).
#[cfg(feature = "svg-text")]
pub(crate) fn configure_text_options(opts: &mut usvg::Options<'_>) {
    use std::sync::{Arc, OnceLock};

    static SYSTEM_FONTS: OnceLock<Arc<usvg::fontdb::Database>> = OnceLock::new();
    let db = SYSTEM_FONTS.get_or_init(|| {
        let mut db = usvg::fontdb::Database::new();
        db.load_system_fonts();
        Arc::new(db)
    });
    opts.fontdb = Arc::clone(db);
}

/// No-op stub: without the `svg-text` feature, `usvg` builds without its
/// `text` feature and documents with `<text>` render without it.
#[cfg(not(feature = "svg-text"))]
#[inline(always)]
pub(crate) fn configure_text_options(_opts: &mut usvg::Options<'_>) {}
