//! The one property table behind every static-property consumer of
//! [`AnimatableProperty`] — the `with_style_fields!` precedent
//! (`crate::protocol`) applied to the animation engine.
//!
//! Historically the static property list existed in several unsynced copies
//! (the derivation walker in `crate::style_bindings`, `write_node_value`'s
//! arms, the `value_kind()` match, the apply-stage skip set). Each copy is now
//! generated from [`with_animatable_props!`]; adding an animatable property is
//! one enum variant plus one row here, and the exhaustiveness guard below
//! turns a missing row into a compile error instead of a silently inert
//! binding.
//!
//! The three **dynamic domains** — [`FilterParam`], [`BackdropParam`],
//! [`ShapeAttr`] — are runtime-string-keyed and walk-derived (chains in
//! `crate::style_bindings::chain_bindings`, shape attrs from
//! `crate::svg::NUMERIC_ATTRS`, the one wire-name table), so they have no
//! rows; every generated consumer handles them in explicit arms the callback
//! writes itself.
//!
//! # Row shape
//!
//! ```text
//! (property, kind, accessor, write-rule, stage, park)
//! ```
//!
//! - **property** — the variant, parenthesized so it rides as one token tree:
//!   `(P::Width)`, `(P::Transform3d(F::RotateX))`. Valid as both a match
//!   pattern and a constructor expression. Callers must have
//!   `AnimatableProperty as P` and `Transform3dField as F` in scope (the
//!   existing import convention at every consumer); a callback using the
//!   column in match position needs `#[allow(unused_parens)]` (the parens
//!   ride into the expanded arm).
//! - **kind** — the [`ValueKind`] variant name (`Length` / `Scalar` / `Angle`
//!   / `Color`).
//! - **accessor** — where the property lives in the merged [`Style`], for the
//!   binding-derivation walker: `(base <field>)` a top-level
//!   `Option<Animatable<_>>` field, `(transform <field>)` a field of the
//!   optional `transform` group, `(t3d <field> <unit>)` a field of the
//!   optional `transform3d` group — the extra unit metadata (`num <default>`
//!   for plain scalars with their identity default, `angle` for wire-degree
//!   fields stored as radians) feeds the transform3d channel/apply
//!   generation, — `(t3d_origin <axis>)` an axis of `transform3d.origin` (an
//!   `Animatable` directly, not an `Option`; stays a literal exception in the
//!   t3d consumers), `(bg_tint)` the one animatable field nested in
//!   `backgroundImage`.
//! - **write-rule** — how the apply engine lands a resolved value:
//!   `(node <field>)` a `Val::Px` compare-before-write on that `Node` field,
//!   `(node_gap_both)` both gap axes, `(node_aspect)` the `Option<f32>`
//!   aspect ratio, `(color <target>)` the stage-2 color routing target
//!   (`bg` / `border` / `text` / `image_tint`), `(none)` for properties the
//!   node-value writer never handles (transform, transform3d, opacity).
//! - **stage** — which apply stage owns the property: `Transform` (stage 1,
//!   the six `UiTransform` channels), `Transform3d` (stage 1b), `Opacity`
//!   (stage 3), `Node` / `Color` (stage 2). Stage 2's skip set is exactly
//!   "stage is neither `Node` nor `Color`". Idents are variant names so
//!   consumers can splice them into an enum path directly.
//! - **park** — which transition channel a binding on this property parks
//!   (imperative bindings win over eased transitions): `Transform` /
//!   `Opacity` / `Background` / `Transform3d`, or `None` for properties with
//!   no competing transition channel. Variant-name idents, like **stage**.
//!
//! Rows are ordered by the enum's `Ord` (declaration order) — pinned by a
//! test below, so table iteration order and `BTreeMap` iteration order agree
//! by construction.
//!
//! [`AnimatableProperty`]: super::protocol::AnimatableProperty
//! [`ValueKind`]: super::protocol::ValueKind
//! [`FilterParam`]: super::protocol::AnimatableProperty::FilterParam
//! [`BackdropParam`]: super::protocol::AnimatableProperty::BackdropParam
//! [`ShapeAttr`]: super::protocol::AnimatableProperty::ShapeAttr
//! [`Style`]: crate::protocol::Style

/// Invoke `$cb!` with every static property row (see the module doc for the
/// column contract). The callback receives the full row list in one call:
///
/// ```ignore
/// macro_rules! my_consumer {
///     ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => { … };
/// }
/// with_animatable_props!(my_consumer);
/// ```
macro_rules! with_animatable_props {
    ($cb:ident) => {
        $cb! {
            ((P::TranslateX), Length, (transform translate_x), (none), Transform, Transform),
            ((P::TranslateY), Length, (transform translate_y), (none), Transform, Transform),
            ((P::Scale), Scalar, (transform scale), (none), Transform, Transform),
            ((P::ScaleX), Scalar, (transform scale_x), (none), Transform, Transform),
            ((P::ScaleY), Scalar, (transform scale_y), (none), Transform, Transform),
            ((P::Rotate), Angle, (transform rotate), (none), Transform, Transform),
            ((P::Opacity), Scalar, (base opacity), (none), Opacity, Opacity),
            ((P::BackgroundColor), Color, (base background_color), (color bg), Color, Background),
            ((P::BorderColor), Color, (base border_color), (color border), Color, None),
            ((P::Color), Color, (base color), (color text), Color, None),
            ((P::BackgroundImageTint), Color, (bg_tint), (color image_tint), Color, None),
            ((P::Width), Length, (base width), (node width), Node, None),
            ((P::Height), Length, (base height), (node height), Node, None),
            ((P::MinWidth), Length, (base min_width), (node min_width), Node, None),
            ((P::MinHeight), Length, (base min_height), (node min_height), Node, None),
            ((P::MaxWidth), Length, (base max_width), (node max_width), Node, None),
            ((P::MaxHeight), Length, (base max_height), (node max_height), Node, None),
            ((P::Left), Length, (base left), (node left), Node, None),
            ((P::Right), Length, (base right), (node right), Node, None),
            ((P::Top), Length, (base top), (node top), Node, None),
            ((P::Bottom), Length, (base bottom), (node bottom), Node, None),
            ((P::FlexBasis), Length, (base flex_basis), (node flex_basis), Node, None),
            ((P::Gap), Length, (base gap), (node_gap_both), Node, None),
            ((P::RowGap), Length, (base row_gap), (node row_gap), Node, None),
            ((P::ColumnGap), Length, (base column_gap), (node column_gap), Node, None),
            ((P::AspectRatio), Scalar, (base aspect_ratio), (node_aspect), Node, None),
            ((P::Transform3d(F::Perspective)), Length, (t3d perspective num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::TranslateX)), Length, (t3d translate_x num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::TranslateY)), Length, (t3d translate_y num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::TranslateZ)), Length, (t3d translate_z num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::RotateX)), Angle, (t3d rotate_x angle), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::RotateY)), Angle, (t3d rotate_y angle), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::RotateZ)), Angle, (t3d rotate_z angle), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::Scale)), Scalar, (t3d scale num 1.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::ScaleX)), Scalar, (t3d scale_x num 1.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::ScaleY)), Scalar, (t3d scale_y num 1.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::OriginX)), Length, (t3d_origin x), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::OriginY)), Length, (t3d_origin y), (none), Transform3d, Transform3d),
        }
    };
}
pub(crate) use with_animatable_props;

/// Which apply stage owns a property — the table's **stage** column plus one
/// value per dynamic domain. The apply orchestrator's stage membership, the
/// stage-2 skip set, and the `has_*` gate predicates all read this instead of
/// re-enumerating variants.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum PropStage {
    /// Stage 1 — one of the six `UiTransform` channels (rebuilt as a group).
    Transform,
    /// Stage 1b — a `transform3d.<field>` (rebuilt as a group).
    Transform3d,
    /// Stage 3 — opacity, the final-alpha owner (pre-resolved before stage 2).
    Opacity,
    /// Stage 2, scalar/length half — lands on a `Node` layout field.
    Node,
    /// Stage 2, color half — lands on a color component.
    Color,
    /// Stage 4 — `filter[<i>].<param>`, writes the resolved chain.
    Filter,
    /// Stage 4 — `backdropFilter[<i>].<param>`, writes the backdrop chain.
    Backdrop,
    /// Stage 5 — an SVG shape attr, writes `SvgShape.attrs` seed slots.
    Shape,
}

/// The transition channels an imperative `{ animated }` binding can park —
/// bindings are continuous per-frame drivers, so a competing eased channel
/// must stand down while one exists ("imperative bindings win").
///
/// **The authoritative park-semantics reference.** Two granularities:
/// *fine-grained* channels ([`Opacity`](Self::Opacity),
/// [`Background`](Self::Background)) park only when their exact property is
/// bound; *coarse* channels ([`Transform`](Self::Transform),
/// [`Filter`](Self::Filter), [`Backdrop`](Self::Backdrop),
/// [`Transform3d`](Self::Transform3d)) park on ANY binding in their group,
/// because their drive rebuilds/eases a whole value with no per-member seam
/// to merge an imperative writer into. While parked, these six channels
/// **RETAIN** their state (`current` keeps the last eased value; unparking
/// retargets from there like any other target change — the bound property's
/// live value re-enters through the next drive's compare). The SVG **shape
/// channel is the exception**: it has its own coarse park (any `ShapeAttr`
/// binding — outside this enum, applied in `drive_transitions`' shape arm)
/// and **RESETS** while parked (`ShapeChannel::reset` in
/// `crate::transition`'s shape channel) — its state-owned-current design has
/// no other way to re-seed at the live post-binding values on unpark,
/// easing from stale ones would visibly jump. The apply engine's stages 4/5
/// are the writers these parks yield to (`crate::animations`' apply module,
/// filter-params and shape stages).
///
/// Identifies the six parkable channels of `drive_transitions`; the shape
/// park is deliberately not a variant here (it is keyed per-entity by the
/// dynamic `ShapeAttr` domain, not a static property row).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum ChannelId {
    /// The `UiTransform` channel group — parked by ANY transform binding.
    Transform,
    /// The opacity channel — parked by an `opacity` binding (fine-grained).
    Opacity,
    /// The background-color channel — parked by a `backgroundColor` binding
    /// (fine-grained).
    Background,
    /// The whole-value `filter` channel — parked by ANY `filter[<i>].<param>`
    /// binding (coarse: the channel eases a complete pass list, there is no
    /// per-param seam to merge an imperative writer into).
    Filter,
    /// The backdrop analog of [`Self::Filter`], independent of it.
    Backdrop,
    /// The `transform3d` channel group — parked by ANY field binding
    /// (coarse: the apply stage rebuilds the full params struct).
    Transform3d,
}

impl super::protocol::AnimatableProperty {
    /// The transition channel a binding on this property parks, if any —
    /// generated from the table's park column.
    #[allow(unused_parens)]
    pub(crate) fn park(&self) -> Option<ChannelId> {
        use super::protocol::{AnimatableProperty as P, Transform3dField as F};
        macro_rules! park_of {
            (None) => {
                Option::<ChannelId>::None
            };
            ($id:ident) => {
                Some(ChannelId::$id)
            };
        }
        macro_rules! park_arms {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                match self {
                    $($prop => park_of!($park),)*
                    P::FilterParam { .. } => Some(ChannelId::Filter),
                    P::BackdropParam { .. } => Some(ChannelId::Backdrop),
                    // Shape parking is the shape channel's own coarse
                    // mechanism (`crate::transition`'s shape channel), not a
                    // `ChannelId`.
                    P::ShapeAttr { .. } => None,
                }
            };
        }
        with_animatable_props!(park_arms)
    }

    /// The owning apply stage — generated from the table's stage column; the
    /// dynamic domains map to their dedicated stages in explicit arms.
    #[allow(unused_parens)]
    pub(crate) fn stage(&self) -> PropStage {
        use super::protocol::{AnimatableProperty as P, Transform3dField as F};
        macro_rules! stage_arms {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                match self {
                    $($prop => PropStage::$stage,)*
                    P::FilterParam { .. } => PropStage::Filter,
                    P::BackdropParam { .. } => PropStage::Backdrop,
                    P::ShapeAttr { .. } => PropStage::Shape,
                }
            };
        }
        with_animatable_props!(stage_arms)
    }
}

impl super::protocol::AnimatedBindings {
    /// Whether any binding parks the given transition channel — the one
    /// predicate behind `drive_transitions`' per-channel skips (imperative
    /// bindings win over eased transitions; see [`ChannelId`] for the
    /// fine-vs-coarse granularity of each channel).
    pub(crate) fn parked(&self, channel: ChannelId) -> bool {
        self.0.keys().any(|p| p.park() == Some(channel))
    }
}

#[cfg(test)]
mod tests {
    // `with_animatable_props!` is in scope textually (defined above in this
    // file) — no import needed.
    use super::super::protocol::{AnimatableProperty as P, Transform3dField as F, ValueKind::*};

    /// The E0004 guard, both directions: the match has **no wildcard**, so an
    /// `AnimatableProperty` (or `Transform3dField`) variant without a table
    /// row fails to compile here — and a row naming a removed variant fails
    /// to resolve. The dynamic domains are the explicitly-listed exception.
    #[allow(dead_code, unused_parens)]
    fn table_covers_every_variant(p: &P) {
        macro_rules! check {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                match p {
                    $($prop => {})*
                    P::FilterParam { .. } | P::BackdropParam { .. } | P::ShapeAttr { .. } => {}
                }
            };
        }
        with_animatable_props!(check);
    }

    /// Row order IS enum `Ord` order (strictly ascending) — so consumers that
    /// iterate the table and consumers that iterate the `BTreeMap` bindings
    /// agree on sequence, by test instead of tribal knowledge. Also pins the
    /// static row count at 38 (26 fieldless + 12 `Transform3d` fields).
    #[test]
    fn table_rows_are_in_enum_order() {
        macro_rules! rows {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                vec![$($prop),*]
            };
        }
        let rows: Vec<P> = with_animatable_props!(rows);
        assert_eq!(rows.len(), 38, "static row count");
        for w in rows.windows(2) {
            assert!(
                w[0] < w[1],
                "table rows out of enum order: {:?} listed before {:?}",
                w[0],
                w[1]
            );
        }
    }

    /// Belt while consumers migrate: every row's kind column agrees with the
    /// (still hand-written) `value_kind()`. Becomes a tautology once
    /// `value_kind` generates from the table — kept as the kind column's pin.
    #[test]
    fn kind_column_matches_value_kind() {
        macro_rules! check_kinds {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                $(assert_eq!(
                    ($prop).value_kind(),
                    $kind,
                    "kind column disagrees for {:?}",
                    $prop
                );)*
            };
        }
        with_animatable_props!(check_kinds);
    }
}
