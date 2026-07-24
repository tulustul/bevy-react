//! Filter wire types, built-in filters, and the filter registry: the
//! layer-based `filter` style chain.
//!
//! This module owns the filter wire format and registry the way
//! [`crate::canvas`]/[`crate::animations`] own theirs: `protocol`/
//! `reconcile`/`ui_map` reference these types by module path, never the
//! reverse. On the wire a filter is one `{"name", "params"}` object or an
//! ordered array of them; `params` stays an untyped JSON map at this layer —
//! typed validation happens later against the registry, not during decode.
//!
//! Decoding follows the protocol's warn-don't-abort convention (see
//! [`Length`](crate::protocol::Length)'s custom `Deserialize`): a malformed
//! value emits a `decode_warn` and the whole chain degrades to empty, never
//! failing the containing `Style`'s deserialization.
//!
//! The typed layer below the wire — [`ReactFilter`], the built-in param
//! structs, and [`FilterRegistry`] — turns a [`FilterUse`] into
//! [`ResolvedFilterPass`]es: deserialize the raw params (strict:
//! deny-unknown-fields), pack them into a `Vec4` uniform array with a
//! [`ParamSlot`] layout (no-straddle rule: a slot never crosses a `Vec4`
//! boundary), and pick the pass shader. The ten built-ins register via
//! [`register_builtin_filters`]; custom filters are `#[react_filter]` structs
//! registered with `add_react_filter`.
//!
//! The module also owns the runtime write path of a chain.
//! [`resolve_chains`] turns a promoted root's [`FilterInput`] into a
//! [`ResolvedFilterChain`] component — resolving each entry against the
//! registry (invalid entries skip with a `filterParams` warning), rewriting
//! `Length` slots to physical px, stamping [`ResolvedFilterPass::wire_index`],
//! and summing the chain outset. The interpolation primitives
//! ([`lerp_packed_params`], [`lerp_angle`]) blend packed param arrays
//! layout-aware for the easing paths. Exactly three systems write
//! [`ResolvedFilterChain`] and bump its `version` counter: the resolver's
//! snap, the transition filter channel's whole-value ease (`transition.rs`,
//! planned by [`plan_filter_ease`] with identity-padding for chain
//! extensions), and the animation per-param `filter[<i>].<param>` bindings
//! (`animations`) — see [`ResolvedFilterChain::version`] for the writer
//! registry and precedence.
//!
//! File map: `wire` (the wire format + warn-don't-abort decode), `params`
//! (packing layout, caps, param value types, interpolation), `registry` (the
//! [`ReactFilter`] trait, resolved passes, the registry), `builtin` (the
//! ten built-ins), `transition` (whole-value `filter` transition planning),
//! `resolve` (the chain resolve system). Submodules are private; everything
//! is re-exported here, so `crate::filters::X` is the one path.

mod backdrop;
mod builtin;
mod params;
mod registry;
mod resolve;
mod transition;
mod wire;

#[cfg(test)]
mod macro_tests;
#[cfg(test)]
pub(crate) mod test_util;

pub use backdrop::{BackdropInput, ResolvedBackdropChain};
pub use builtin::{
    BloomParams, BlurParams, BrightnessParams, ChromaticAberrationParams, ContrastParams,
    GrayscaleParams, HueRotateParams, InvertParams, SaturateParams, SepiaParams,
    register_builtin_filters,
};
pub use params::{
    FilterColor, MAX_FILTER_OUTSET_PX, MAX_FILTER_PARAM_VECS, ParamSlot, length_logical_px,
    lerp_angle, lerp_packed_params,
};
pub use registry::{
    FilterRegistration, FilterRegistry, ReactFilter, ResolvedFilterPass, resolve_single_pass,
};
pub use resolve::{
    ChainInput, FilterInput, ResolvedChain, ResolvedFilterChain, quantize_outset, resolve_chains,
};
pub(crate) use transition::{FilterEase, plan_filter_ease};
pub use wire::{FilterChain, FilterUse, MAX_CHAIN_LEN};
