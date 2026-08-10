//! The [`SvgDocument`] asset and its [`AssetLoader`].
//!
//! Parsing is a pure function ([`parse_svg_bytes`]) so it is unit-testable
//! without an `AssetServer`; [`SvgAssetLoader`] is just the IO glue that reads
//! the file bytes and delegates. The asset wraps the parsed [`usvg::Tree`]
//! (immutable, `Send + Sync`) plus the document's intrinsic size in logical px
//! — stored now because it will feed layout when `<image src="x.svg">` lands.

use bevy::asset::{Asset, AssetLoader, LoadContext, io::Reader};
use bevy::math::Vec2;
use bevy::prelude::BevyError;
use bevy::reflect::TypePath;

/// A parsed SVG document: the resolution-independent scene graph, rasterized
/// per node at laid-out size by the consumers of this asset.
#[derive(Asset, TypePath, Debug)]
pub struct SvgDocument {
    /// The parsed, simplified scene graph.
    pub tree: usvg::Tree,
    /// Intrinsic document size in logical px (from `tree.size()`).
    pub size: Vec2,
}

/// The document failed to parse as SVG. Wraps [`usvg::Error`], which already
/// covers non-UTF-8 input, malformed gzip, and XML parse failures —
/// [`usvg::Tree::from_data`] handles all of those itself.
#[derive(Debug)]
pub struct SvgParseError(pub usvg::Error);

impl std::fmt::Display for SvgParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "invalid SVG: {}", self.0)
    }
}

impl std::error::Error for SvgParseError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        Some(&self.0)
    }
}

/// Parse raw SVG bytes (plain or gzip-compressed) into an [`SvgDocument`].
/// All parsing logic lives here; the asset loader only feeds it file bytes.
pub fn parse_svg_bytes(bytes: &[u8]) -> Result<SvgDocument, SvgParseError> {
    let mut opts = usvg::Options::default();
    super::text::configure_text_options(&mut opts);
    let tree = usvg::Tree::from_data(bytes, &opts).map_err(SvgParseError)?;
    let size = tree.size();
    Ok(SvgDocument {
        size: Vec2::new(size.width(), size.height()),
        tree,
    })
}

/// Loads `.svg` files into [`SvgDocument`] assets via [`parse_svg_bytes`].
#[derive(TypePath)]
pub struct SvgAssetLoader;

impl AssetLoader for SvgAssetLoader {
    type Asset = SvgDocument;
    type Settings = ();
    type Error = BevyError;

    async fn load(
        &self,
        reader: &mut dyn Reader,
        _settings: &Self::Settings,
        _load_context: &mut LoadContext<'_>,
    ) -> Result<Self::Asset, Self::Error> {
        let mut bytes = Vec::new();
        reader.read_to_end(&mut bytes).await?;
        Ok(parse_svg_bytes(&bytes)?)
    }

    fn extensions(&self) -> &[&str] {
        &["svg"]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svg::CIRCLE_SVG;

    #[test]
    fn parses_valid_svg_and_rejects_garbage() {
        let doc = parse_svg_bytes(CIRCLE_SVG.as_bytes()).expect("valid SVG parses");
        assert_eq!(
            doc.size,
            Vec2::new(100.0, 100.0),
            "intrinsic size must come from the viewBox"
        );

        parse_svg_bytes(b"not svg").expect_err("garbage bytes must be rejected");
        parse_svg_bytes(b"").expect_err("empty input must be rejected");
    }

    /// The loader must claim the `.svg` extension, or `asset_server.load()`
    /// cannot infer it and every load would need an explicit loader.
    #[test]
    fn loader_claims_svg_extension() {
        assert_eq!(SvgAssetLoader.extensions(), ["svg"]);
    }
}
