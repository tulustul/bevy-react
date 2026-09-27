//! Compositing properties: filters, transforms, opacity, layer caching, and
//! the transition spec.

use super::inv::*;
use crate::filters::{FilterChain, MorphFilter};
use crate::protocol::animatable::Animatable;
use crate::protocol::keywords::LAYER_CACHE_KEYWORDS;
use crate::protocol::transform::{Transform, Transform3d};
use crate::style::{Codec, Invalidate, Invalidation, NodeCtx, StyleProperty};
use crate::transition::Transition;

/// The value of [`CACHE`]: `"auto"` (default) leaves promotion to the
/// other rules; `"always"` force-promotes the subtree to a cached composited
/// layer; `"never"` force-promotes it too but re-captures it **every frame** —
/// the escape hatch for content whose pixels are written outside the dirt
/// tracking's sight (a live `<portal>` render target, an app-owned texture).
/// Opting out of *opacity* promotion is `groupAlpha: false`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum LayerCache {
    #[default]
    Auto,
    Always,
    Never,
}

/// Subtree filter chain: one `{ name, params }` entry or an ordered array
/// (chain order = pass order). Omitted params take the filter's shorthand
/// default — a *visible* effect (a bare `blur` is a 20px blur, unlike CSS's
/// 0). The node promotes to a composited layer and the chain applies to its
/// whole captured subtree as one image.
pub static FILTER: StyleProperty<FilterChain> = StyleProperty {
    invalidate: Invalidate::Fixed(COMPOSITE_PROMOTION),
    ..StyleProperty::with_codec("filter", Codec::serde_as("FilterChainValue"))
};
/// Filter chain over what is rendered BEHIND the node (v1: the camera's
/// post-processed 3D frame — UI painted beneath the node is not included),
/// drawn under the node's own content like CSS `backdrop-filter`. Promotes
/// the node; the frosted region is its border box, rounded by `borderRadius`;
/// re-renders every frame (live source). Unsetting demotes and snaps — keep
/// an identity entry (e.g. `blur` radius 0) when removal should ease.
pub static BACKDROP_FILTER: StyleProperty<FilterChain> = StyleProperty {
    invalidate: Invalidate::Fixed(COMPOSITE_PROMOTION),
    ..StyleProperty::with_codec("backdropFilter", Codec::serde_as("FilterChainValue"))
};
/// View-transition morph: `{ key, name, params }`. When `key` changes the
/// node's previous rendered appearance freezes and the named morph filter
/// (its own family — `crossfade`, `linearWipe`, `pixelize`, or a
/// `#[react_morph_filter]`) blends frozen → live content over an
/// engine-owned progress (built-in 300ms ease; `transition: { morphFilter }`
/// overrides). The frozen image is anchored to the node's layout rect;
/// first mount never animates; a mid-flight key change restarts smoothly.
/// Presence promotes the node. An EMPTY carrier (mounted, painting nothing)
/// is a valid transparent capture — toggle content in the same commit as the
/// key flip to morph from/to nothing (the carrier must have rendered ≥1
/// frame before the first flip).
pub static MORPH_FILTER: StyleProperty<MorphFilter> = StyleProperty {
    invalidate: Invalidate::Fixed(COMPOSITE_PROMOTION),
    ..StyleProperty::with_codec(
        "morphFilter",
        Codec::custom(erased!(de_morph_filter => MorphFilter), "MorphFilterValue"),
    )
};
/// Static 2D transform (TS `BevyTransform`): translate (lengths, resolved
/// against the node's own size) / scale / rotate (degrees). With `transition`
/// a change eases instead of snapping.
pub static TRANSFORM: StyleProperty<Transform> = StyleProperty {
    invalidate: Invalidate::Computed(transform_invalidation),
    ..StyleProperty::with_codec("transform", Codec::serde_as("BevyTransform"))
};
/// 3D perspective transform of the subtree's rendered result, applied at
/// composite time (TS `BevyTransform3d`). Presence — even `{}` — promotes the
/// subtree; animating it never re-captures; picking follows the visual.
/// Unsetting demotes and snaps — keep an identity `{}` when removal should
/// ease.
pub static TRANSFORM3D: StyleProperty<Transform3d> = StyleProperty {
    invalidate: Invalidate::Fixed(COMPOSITE_PROMOTION),
    ..StyleProperty::with_codec("transform3d", Codec::serde_as("BevyTransform3d"))
};
/// Opacity in `0..1`, multiplied into the background (and text) alpha. On a
/// node with children (unless `groupAlpha` is `false`) the subtree instead
/// composites as a layer and the value fades the whole group (web
/// semantics); an `{ animated }` opacity promotes the same way.
pub static OPACITY: StyleProperty<Animatable<f32>> = StyleProperty {
    invalidate: Invalidate::Computed(opacity_invalidation),
    ..StyleProperty::with_codec("opacity", Codec::serde_as("Animatable<number>"))
};
/// Whether `opacity` on a node with children fades the subtree as a group
/// (a composited layer — the default, web semantics) rather than folding into
/// each node's own colors. `false` opts out of layer promotion for
/// perf-sensitive spots. Promotion unions every style state, so a
/// hover/press value can't flip it.
pub static GROUP_ALPHA: StyleProperty<bool> = StyleProperty {
    invalidate: Invalidate::Fixed(PROMOTION),
    ..StyleProperty::new("groupAlpha")
};
/// Layer-cache hint. `"always"` force-promotes the subtree so its capture is
/// cached and re-rendered only when content changes (the `will-change`
/// pattern); `"never"` also force-promotes but re-captures every frame (and
/// dirties every enclosing layer) — the escape hatch for pixels written
/// outside the dirt tracking's sight (a live `<portal>`, an app-owned
/// texture); `"auto"` (default) promotes only when another rule does.
/// Promotion unions every style state, so a hover/press value can't flip
/// it.
pub static CACHE: StyleProperty<LayerCache> = StyleProperty {
    invalidate: Invalidate::Fixed(PROMOTION),
    ..StyleProperty::with_codec("cache", Codec::keyword(&LAYER_CACHE_KEYWORDS))
};
/// Per-channel transition timing (explicit channels only): a change to a
/// listed channel — by re-render or a hover/press/focus variant — eases
/// instead of snapping.
pub static TRANSITION: StyleProperty<Transition> = StyleProperty {
    invalidate: Invalidate::Fixed(Invalidation::TRANSITION),
    ..StyleProperty::with_codec("transition", Codec::serde_as("BevyTransition"))
};

/// `opacity` folds into the node's colors — a repaint — unless the node is a
/// promoted layer root, whose group alpha applies at composite time. Either
/// way its presence can flip promotion.
fn opacity_invalidation(
    _old: Option<&Animatable<f32>>,
    _new: Option<&Animatable<f32>>,
    node: &NodeCtx<'_>,
) -> Invalidation {
    if node.promoted {
        COMPOSITE_PROMOTION
    } else {
        PAINT.union(PROMOTION)
    }
}

/// A promoted layer root's translation applies at composite time (the quad
/// moves; the root-relative capture is unchanged). Anything else — scale,
/// rotation, a non-root node, or an unknown old value — changes pixels.
fn transform_invalidation(
    old: Option<&Transform>,
    new: Option<&Transform>,
    node: &NodeCtx<'_>,
) -> Invalidation {
    match (old, new) {
        (Some(o), Some(n))
            if node.promoted
                && o.scale == n.scale
                && o.scale_x == n.scale_x
                && o.scale_y == n.scale_y
                && o.rotate == n.rotate =>
        {
            Invalidation::COMPOSITE
        }
        _ => PAINT,
    }
}

/// `de_morph_filter` decodes into a `Box` (the typed field's storage);
/// the property stores the value itself.
fn de_morph_filter<'de, D: serde::Deserializer<'de>>(
    d: D,
) -> Result<Option<MorphFilter>, D::Error> {
    crate::filters::de_morph_filter(d).map(|m| m.map(|b| *b))
}
