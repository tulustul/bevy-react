//! The `backgroundImage` style wire types and their totalizing decoder.

use serde::Deserialize;
use serde::de::Deserializer;

use super::animatable::Animatable;
use super::decode_warn;
use super::keywords::de_bg_image_mode;

/// How an `image` fits its node. A bare string (`"auto"`/`"stretch"`) maps to the
/// trivial `bevy_ui` modes; the `type`-tagged object forms map to bevy's 9-slice
/// (`"sliced"`) and `"tiled"` scaling. Bevy-free; converted to `NodeImageMode` in
/// `ui_map`.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum ImageMode {
    /// `"auto"` or `"stretch"` (any unknown keyword falls back to `Auto`).
    Keyword(String),
    Spec(ImageModeSpec),
}

/// The object forms of [`ImageMode`], discriminated by their `type` field.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ImageModeSpec {
    Sliced(SliceSpec),
    Tiled(TiledSpec),
}

/// 9-slice scaling parameters, mirroring `bevy_sprite::TextureSlicer`.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SliceSpec {
    /// Border insets, in *source-texture pixels*, dividing the texture into nine
    /// sections.
    #[serde(default)]
    pub border: SliceBorder,
    /// How the center section scales (default: stretch).
    #[serde(default)]
    pub center_scale_mode: Option<SliceScale>,
    /// How the four side sections scale (default: stretch).
    #[serde(default)]
    pub sides_scale_mode: Option<SliceScale>,
    /// Maximum scale of the four corner sections (bevy default `1.0`).
    #[serde(default)]
    pub max_corner_scale: Option<f32>,
}

/// 9-slice border insets: a single number (uniform) or per-side, in *source-texture
/// pixels*.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(untagged)]
pub enum SliceBorder {
    /// No border supplied → zero insets.
    #[default]
    Zero,
    /// The same inset along every edge.
    Uniform(f32),
    /// Per-edge insets.
    Sides {
        #[serde(default)]
        top: f32,
        #[serde(default)]
        right: f32,
        #[serde(default)]
        bottom: f32,
        #[serde(default)]
        left: f32,
    },
}

/// How a 9-slice section scales when resized: `"stretch"` (the keyword) or
/// `{ tile }`, where `tile` is the repeat `stretch_value`.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum SliceScale {
    Keyword(String),
    Tile { tile: f32 },
}

/// `"tiled"` scaling: the whole image repeats once stretched beyond `stretch_value`.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TiledSpec {
    #[serde(default)]
    pub tile_x: bool,
    #[serde(default)]
    pub tile_y: bool,
    /// Repeat threshold (bevy default `1.0`).
    #[serde(default)]
    pub stretch_value: Option<f32>,
}

/// A source sub-rect in texture pixels: top-left (`x`, `y`) plus `width`/`height`.
/// Converted to a `bevy_math::Rect` (min/max corners) in `ui_map`.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceRect {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

/// A uniform sprite-sheet grid plus the selected cell. Mirrors
/// `TextureAtlasLayout::from_grid` (tile size, columns, rows, optional padding /
/// offset, all in source-texture pixels) + `TextureAtlas.index`. Bevy-free;
/// turned into a cached `TextureAtlasLayout` asset in `ui_map`.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AtlasSpec {
    pub tile_width: u32,
    pub tile_height: u32,
    pub columns: u32,
    pub rows: u32,
    /// Padding between cells (`[x, y]` px), if any.
    #[serde(default)]
    pub padding: Option<[u32; 2]>,
    /// Offset of the grid's top-left from the texture origin (`[x, y]` px).
    #[serde(default)]
    pub offset: Option<[u32; 2]>,
    /// Which cell to display (row-major). Default `0`.
    #[serde(default)]
    pub index: usize,
}

/// Where a [`super::style::Style::background_image`] samples from: a bare string is an
/// asset path (`AssetServer`-loaded, like an `image` element's `src`); the
/// `{ texture }` object names an **app-registered texture** in
/// `crate::portal::RenderTargets` (typically `RenderTargets::register` —
/// bound late: an unknown name shows the transparent placeholder until the
/// app registers it). Texture backgrounds are for **static** content — they
/// don't participate in live-repaint tracking; continuously-updating render
/// targets belong in a `<portal>` element.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum BackgroundImageSource {
    Path(String),
    Texture { texture: String },
}

/// The decoded `backgroundImage` style object. Deliberately NOT
/// [`ImageMode`]: that type admits `"auto"` (whose intrinsic-size measure
/// drives layout — a background must never do that) and `"sliced"`, and its
/// unknown-keyword fallback is `Auto`. This spec's modes all map to
/// layout-inert `NodeImageMode`s.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackgroundImageSpec {
    /// Required — a spec with nothing to paint is dropped at decode
    /// (tint-only fills are `backgroundColor`'s job).
    pub src: BackgroundImageSource,
    /// Tint multiplied with the texture (hex); also where `opacity` folds.
    /// Animatable via an inline `{ animated: interpolateColor(...) }` binding
    /// (`AnimatableProperty::BackgroundImageTint` drives `ImageNode.color`
    /// per frame; the static build then leaves the color at white).
    #[serde(default)]
    pub tint: Option<Animatable<String>>,
    /// Fit: `"stretch"` (default — fill the box exactly) or the repeat
    /// modes `"repeat"`/`"repeatX"`/`"repeatY"` (tile at the texture's
    /// logical size × [`scale`](Self::scale)).
    #[serde(default, deserialize_with = "de_bg_image_mode")]
    pub mode: Option<BackgroundImageMode>,
    /// Tile scale for the repeat modes, in logical-px terms (`1.0` = the
    /// texture's own size at 1× DPI; DPI correction is applied by
    /// `crate::background_image::sync_background_tile_scale`). Ignored — with
    /// a warning — under `"stretch"`. Decodes an `{ animated }` wrapper but
    /// the binding is inert in v1 (read via `static_val`).
    #[serde(default)]
    pub scale: Option<Animatable<f32>>,
}

/// [`BackgroundImageSpec::mode`] keywords. Every variant maps to a
/// layout-inert `NodeImageMode` (`Stretch` or `Tiled`) — never `Auto`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum BackgroundImageMode {
    #[default]
    Stretch,
    Repeat,
    RepeatX,
    RepeatY,
}

impl BackgroundImageMode {
    /// Whether this mode tiles at all (any repeat variant).
    pub fn tiles(self) -> bool {
        self != Self::Stretch
    }

    /// The per-axis tile flags (`tile_x`, `tile_y`) for `NodeImageMode::Tiled`.
    pub fn tile_axes(self) -> (bool, bool) {
        match self {
            Self::Stretch => (false, false),
            Self::Repeat => (true, true),
            Self::RepeatX => (true, false),
            Self::RepeatY => (false, true),
        }
    }
}

/// A style field that is either a static `T` or an inline animation binding —
/// the `{ animated: <shared value | interpolate descriptor>, seed? }` wire
/// form. The animated variant carries **no static value**: style read sites
/// see the field as absent (the animation applier drives the target every
/// frame), and `crate::animations` derives the node's `AnimatedBindings` from
/// the merged style. `{ animated: sv }` reaches the wire with the shared
/// value's `id` (its other enumerable props are ignored); a descriptor object
/// is told apart by its `type` tag. A malformed wrapper warns (`styleBinding`)
/// and decodes to an inert binding (shared id `0` is never allocated by JS),
/// so one typo can't abort the batch.
///
/// The wrapper's optional **`seed`** (`{ animated: sv, seed: 10 }`) is the
/// static value a consumer may decode in the wrapper's place. Style read
/// sites ([`AnimatableField::static_val`]/[`static_ref`](AnimatableField::static_ref))
/// deliberately ignore it — the driver owns the on-screen value — but SVG
/// shape attrs render it ([`AnimatableField::static_or_seed`]) until a driver
/// writes, mirroring the filter-param resolver's seed semantics
/// (`crate::style_bindings::animated_param_seed`; filter/backdrop chain
/// params never decode through this type — their param maps stay raw).
//
// `PartialEq` includes `seed` DELIBERATELY: shape-attr dirt depends on it —
// the seed renders (`static_or_seed`), and the animation apply stage writes
// driven values *into* the seed slot, so seed equality is what makes
// compare-before-write + `Changed<SvgShape>` sound. For style fields (whose
// read sites ignore the seed) a seed-only delta re-applies redundantly, but
// the appliers' `set_if_neq` discipline absorbs it.
/// Totalizing decode for [`super::style::Style::background_image`]: any malformed value —
/// a bare string (there is no shorthand form), a spec missing `src`, a
/// non-object — warns and decodes to `None` rather than aborting the whole
/// batch (the repo-wide decode invariant). Also warns on a `scale` that a
/// non-repeat `mode` would silently ignore.
pub(crate) fn de_background_image<'de, D: Deserializer<'de>>(
    d: D,
) -> Result<Option<BackgroundImageSpec>, D::Error> {
    let v = serde_json::Value::deserialize(d)?;
    if v.is_null() {
        return Ok(None);
    }
    match BackgroundImageSpec::deserialize(&v) {
        Ok(spec) => {
            if spec.scale.is_some() && !spec.mode.unwrap_or_default().tiles() {
                decode_warn(
                    "backgroundImage",
                    &v.to_string(),
                    "backgroundImage `scale` only applies to the repeat modes; ignored under \"stretch\"",
                );
            }
            Ok(Some(spec))
        }
        Err(err) => {
            decode_warn(
                "backgroundImage",
                &v.to_string(),
                &format!("invalid backgroundImage (object with `src` required): {err}"),
            );
            Ok(None)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::animatable::AnimatableField;
    use crate::protocol::style::Style;

    /// `backgroundImage` decode: both `src` forms, mode keywords, and the
    /// totalizing fallbacks (unknown mode → `Stretch`, invalid value → `None`
    /// without aborting the style).
    #[test]
    fn background_image_decodes() {
        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": {
                "src": "images/bg.png",
                "mode": "repeatX",
                "scale": 2.0,
                "tint": "#ff0000",
            }
        }))
        .unwrap();
        let spec = s.background_image.expect("spec decodes");
        assert!(matches!(&spec.src, BackgroundImageSource::Path(p) if p == "images/bg.png"));
        assert_eq!(spec.mode, Some(BackgroundImageMode::RepeatX));
        assert_eq!(spec.scale.static_val(), Some(2.0));
        assert_eq!(spec.tint.static_ref().map(String::as_str), Some("#ff0000"));

        // An `{ animated }` tint decodes as a binding: the static read sees
        // the field as absent (the animation applier drives it per frame).
        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": {
                "src": "bg.png",
                "tint": { "animated": { "id": 7 } },
            }
        }))
        .unwrap();
        let spec = s.background_image.expect("animated tint decodes");
        assert!(spec.tint.static_ref().is_none());
        assert!(spec.tint.binding().is_some());

        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": { "src": { "texture": "minimap" } }
        }))
        .unwrap();
        let spec = s.background_image.expect("texture source decodes");
        assert!(
            matches!(&spec.src, BackgroundImageSource::Texture { texture } if texture == "minimap")
        );
        assert_eq!(spec.mode, None);

        // `<image>`-only keywords fall back to the layout-inert Stretch.
        let s: Style = serde_json::from_value(serde_json::json!({
            "backgroundImage": { "src": "bg.png", "mode": "auto" }
        }))
        .unwrap();
        assert_eq!(
            s.background_image.unwrap().mode,
            Some(BackgroundImageMode::Stretch)
        );

        // A bare string (no shorthand form) or a spec without `src` drops the
        // field, keeping sibling fields of the same style.
        for bad in [
            serde_json::json!("bg.png"),
            serde_json::json!({ "tint": "red" }),
        ] {
            let s: Style = serde_json::from_value(serde_json::json!({
                "backgroundImage": bad, "width": 10,
            }))
            .unwrap();
            assert!(s.background_image.is_none());
            assert!(s.width.is_some(), "sibling fields survive the bad value");
        }
    }

    /// Repeat-axis mapping for `NodeImageMode::Tiled`.
    #[test]
    fn background_image_mode_axes() {
        use BackgroundImageMode::*;
        assert_eq!(Stretch.tile_axes(), (false, false));
        assert_eq!(Repeat.tile_axes(), (true, true));
        assert_eq!(RepeatX.tile_axes(), (true, false));
        assert_eq!(RepeatY.tile_axes(), (false, true));
        assert!(!Stretch.tiles() && Repeat.tiles());
    }
}
