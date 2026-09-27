//! `ImageNode`s: `<image>` sources, tint, flips, image modes and atlases.

use super::*;

/// Build an `ImageNode` from an `<image>`'s attributes. `src` loads a texture
/// via the asset server; without it, a solid-color (tinted) image is used.
/// `opacity` folds into the tint unless the node is a `promoted` layer root
/// (group alpha applies at composite).
pub fn image_node(
    attrs: &Attrs,
    opacity: Option<f32>,
    assets: &AssetServer,
    promoted: bool,
) -> ImageNode {
    use crate::elements::image::{SRC, TINT};
    let base = match attrs.get(&SRC) {
        Some(path) => ImageNode::new(assets.load(path.clone())),
        None => ImageNode::solid_color(
            attrs
                .get(&TINT)
                .map(|t| parse_color(t))
                .unwrap_or(Color::WHITE),
        ),
    };
    finish_image_node(base, attrs, opacity, promoted)
}

/// The svg-mode `<image>` node: the same attribute styling as
/// [`image_node`] (tint / opacity fold / flips / `visualBox`) around
/// a texture the caller patches in afterwards (the element-owned raster
/// target — `src` is never loaded as an `Image`; see `crate::svg`).
/// `imageMode` is forced to `Stretch` (the raster is repainted at laid-out
/// size, so any other mode is meaningless) and `sourceRect` is dropped
/// (warned svg-side, like `atlas`).
pub fn svg_image_node(attrs: &Attrs, opacity: Option<f32>, promoted: bool) -> ImageNode {
    let mut image = finish_image_node(ImageNode::default(), attrs, opacity, promoted);
    image.image_mode = NodeImageMode::Stretch;
    image.rect = None;
    image
}

/// An `<image>`'s `ImageNode` color: its `tint` (else `base`) with `opacity`
/// multiplied into the alpha (the tint is multiplied with the texture, so it
/// fades a `src` image too — mirroring how it fades a background/text
/// color). Suppressed on a promoted layer root (group alpha applies once at
/// composite — see `crate::layer`).
pub(crate) fn image_tint(
    base: Color,
    tint: Option<&str>,
    opacity: Option<f32>,
    promoted: bool,
) -> Color {
    let color = tint.map(parse_color).unwrap_or(base);
    if promoted {
        color
    } else {
        apply_opacity(color, opacity)
    }
}

/// Shared tail of the image builders: fold the `<image>` attributes into
/// `image` (everything except the texture choice).
fn finish_image_node(
    mut image: ImageNode,
    attrs: &Attrs,
    opacity: Option<f32>,
    promoted: bool,
) -> ImageNode {
    use crate::elements::image::{FLIP_X, FLIP_Y, IMAGE_MODE, SOURCE_RECT, TINT, VISUAL_BOX};
    image.color = image_tint(
        image.color,
        attrs.get(&TINT).map(String::as_str),
        opacity,
        promoted,
    );
    image.flip_x = attrs.get(&FLIP_X).copied().unwrap_or(false);
    image.flip_y = attrs.get(&FLIP_Y).copied().unwrap_or(false);
    if let Some(mode) = attrs.get(&IMAGE_MODE) {
        image.image_mode = match mode {
            ImageMode::Keyword(s) if s == "stretch" => NodeImageMode::Stretch,
            ImageMode::Keyword(_) => NodeImageMode::Auto,
            ImageMode::Spec(ImageModeSpec::Sliced(s)) => NodeImageMode::Sliced(slicer(s)),
            ImageMode::Spec(ImageModeSpec::Tiled(t)) => NodeImageMode::Tiled {
                tile_x: t.tile_x,
                tile_y: t.tile_y,
                stretch_value: t.stretch_value.unwrap_or(1.0),
            },
        };
    }
    // `Rect` here is the wire top/right/bottom/left type (imported above), so the
    // source sub-rect uses bevy's math `Rect` by its full path.
    if let Some(r) = attrs.get(&SOURCE_RECT) {
        image.rect = Some(bevy::math::Rect::new(
            r.x,
            r.y,
            r.x + r.width,
            r.y + r.height,
        ));
    }
    if let Some(vb) = attrs.get(&VISUAL_BOX) {
        image.visual_box = match vb.as_str() {
            "content" => VisualBox::ContentBox,
            "border" => VisualBox::BorderBox,
            _ => VisualBox::PaddingBox,
        };
    }
    image
}

/// Caches one `TextureAtlasLayout` asset per unique grid (keyed on the grid, *not*
/// the cell `index`). `image_node` is re-inserted on every `Op::Update`, so without
/// this an index-only change (sprite animation) would add a fresh layout asset each
/// frame — an unbounded leak. Constant grid → one cache hit, one shared handle.
#[derive(Resource, Default)]
pub struct AtlasLayoutCache(HashMap<AtlasKey, Handle<TextureAtlasLayout>>);

/// The grid identity of an [`AtlasSpec`] — everything `TextureAtlasLayout::from_grid`
/// consumes, excluding the per-cell `index`.
#[derive(PartialEq, Eq, Hash)]
struct AtlasKey {
    tile_width: u32,
    tile_height: u32,
    columns: u32,
    rows: u32,
    padding: Option<[u32; 2]>,
    offset: Option<[u32; 2]>,
}

impl AtlasKey {
    fn of(a: &AtlasSpec) -> Self {
        AtlasKey {
            tile_width: a.tile_width,
            tile_height: a.tile_height,
            columns: a.columns,
            rows: a.rows,
            padding: a.padding,
            offset: a.offset,
        }
    }
}

/// Set `image.texture_atlas` from an `atlas` attribute (a no-op if absent),
/// building and caching the grid's `TextureAtlasLayout` so repeated commits
/// reuse one asset. Kept out of [`image_node`] because it needs the
/// `Assets`/cache resources.
pub fn apply_atlas(
    image: &mut ImageNode,
    atlas: Option<&AtlasSpec>,
    layouts: &mut Assets<TextureAtlasLayout>,
    cache: &mut AtlasLayoutCache,
) {
    let Some(a) = atlas else { return };
    let handle = cache
        .0
        .entry(AtlasKey::of(a))
        .or_insert_with(|| {
            layouts.add(TextureAtlasLayout::from_grid(
                UVec2::new(a.tile_width, a.tile_height),
                a.columns,
                a.rows,
                a.padding.map(|[x, y]| UVec2::new(x, y)),
                a.offset.map(|[x, y]| UVec2::new(x, y)),
            ))
        })
        .clone();
    image.texture_atlas = Some(TextureAtlas {
        layout: handle,
        index: a.index,
    });
}

/// Build a `bevy_sprite::TextureSlicer` (9-slice config) from the wire [`SliceSpec`].
fn slicer(spec: &SliceSpec) -> TextureSlicer {
    let border = match spec.border {
        SliceBorder::Zero => BorderRect::ZERO,
        SliceBorder::Uniform(n) => BorderRect::all(n),
        SliceBorder::Sides {
            top,
            right,
            bottom,
            left,
        } => BorderRect {
            min_inset: Vec2::new(left, top),
            max_inset: Vec2::new(right, bottom),
        },
    };
    TextureSlicer {
        border,
        center_scale_mode: slice_scale(&spec.center_scale_mode),
        sides_scale_mode: slice_scale(&spec.sides_scale_mode),
        max_corner_scale: spec.max_corner_scale.unwrap_or(1.0),
    }
}

/// Map a wire [`SliceScale`] (`None`/`"stretch"` → stretch, `{ tile }` → tile) onto
/// `bevy_sprite::SliceScaleMode`.
fn slice_scale(mode: &Option<SliceScale>) -> SliceScaleMode {
    match mode {
        Some(SliceScale::Tile { tile }) => SliceScaleMode::Tile {
            stretch_value: *tile,
        },
        _ => SliceScaleMode::Stretch,
    }
}
