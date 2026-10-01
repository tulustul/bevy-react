//! The one property table behind every static-property consumer of
//! [`AnimatableProperty`] — the animation engine's own declaration of the
//! style properties it drives (engines declare their wiring; a property
//! declares only itself — see [`crate::style`]).
//!
//! Historically the static property list existed in several unsynced copies
//! (the derivation walker in `crate::style_bindings`, `write_node_value`'s
//! arms, the apply-stage skip set). Each copy is now
//! generated from [`with_animatable_props!`]; adding an animatable property is
//! one enum variant plus one row here, and the exhaustiveness guard below
//! turns a missing row into a compile error instead of a silently inert
//! binding.
//!
//! The **dynamic domains** — [`FilterParam`], [`BackdropParam`],
//! [`MorphParam`], [`BackgroundGradientParam`], [`BorderGradientParam`],
//! [`Ext`] — are runtime-keyed and walk-derived (chains in
//! `crate::style_bindings::chain_bindings`, gradient leaves in
//! `crate::style_bindings::gradient_bindings`, `Ext` bindings from an
//! element's animated attributes), so they have no
//! rows; every generated consumer handles them in explicit arms the callback
//! writes itself.
//!
//! # Row shape
//!
//! ```text
//! (property, accessor, write-rule, stage, park)
//! ```
//!
//! - **property** — the variant, parenthesized so it rides as one token tree:
//!   `(P::Width)`, `(P::Transform3d(F::RotateX))`. Valid as both a match
//!   pattern and a constructor expression. Callers must have
//!   `AnimatableProperty as P` and `Transform3dField as F` in scope (the
//!   existing import convention at every consumer); a callback using the
//!   column in match position needs `#[allow(unused_parens)]` (the parens
//!   ride into the expanded arm).
//! - **accessor** — where the property lives in the merged [`Style`], for the
//!   binding-derivation walker: `(prop <KEY>)` a top-level
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
//!   aspect ratio, `(node_radius_all)` all four `border_radius` corners
//!   uniformly, `(color <target>)` the stage-2 color routing target
//!   (`bg` / `border` / `text` / `image_tint`), `(none)` for properties the
//!   node-value writer never handles (transform, transform3d, opacity).
//! - **stage** — which apply stage owns the property: `Transform` (stage 1,
//!   the six `UiTransform` channels), `Transform3d` (stage 1b), `Opacity`
//!   (stage 3), `Node` / `Color` (stage 2). Stage 2's skip set is exactly
//!   "stage is neither `Node` nor `Color`", and `Color` rows resolve as
//!   colors, `Node` rows as scalars. Idents are variant names so
//!   consumers can splice them into an enum path directly.
//! - **park** — which transition channel a binding on this property parks
//!   (imperative bindings win over eased transitions): `Transform` /
//!   `Opacity` / `Background` / `BorderRadius` / `Transform3d`, or `None`
//!   for properties with no competing transition channel. Variant-name
//!   idents, like **stage**.
//!
//! Rows are ordered by the enum's `Ord` (declaration order) — pinned by a
//! test below, so table iteration order and `BTreeMap` iteration order agree
//! by construction.
//!
//! [`AnimatableProperty`]: super::protocol::AnimatableProperty
//! [`FilterParam`]: super::protocol::AnimatableProperty::FilterParam
//! [`BackdropParam`]: super::protocol::AnimatableProperty::BackdropParam
//! [`MorphParam`]: super::protocol::AnimatableProperty::MorphParam
//! [`BackgroundGradientParam`]: super::protocol::AnimatableProperty::BackgroundGradientParam
//! [`BorderGradientParam`]: super::protocol::AnimatableProperty::BorderGradientParam
//! [`Ext`]: super::protocol::AnimatableProperty::Ext
//! [`Style`]: crate::style::Style

/// Invoke `$cb!` with every static property row (see the module doc for the
/// column contract). The callback receives the full row list in one call:
///
/// ```text
/// macro_rules! my_consumer {
///     ($(($prop:tt, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => { … };
/// }
/// with_animatable_props!(my_consumer);
/// ```
macro_rules! with_animatable_props {
    ($cb:ident) => {
        $cb! {
            ((P::TranslateX), (transform translate_x), (none), Transform, Transform),
            ((P::TranslateY), (transform translate_y), (none), Transform, Transform),
            ((P::Scale), (transform scale), (none), Transform, Transform),
            ((P::ScaleX), (transform scale_x), (none), Transform, Transform),
            ((P::ScaleY), (transform scale_y), (none), Transform, Transform),
            ((P::Rotate), (transform rotate), (none), Transform, Transform),
            ((P::Opacity), (prop OPACITY), (none), Opacity, Opacity),
            ((P::BackgroundColor), (prop BACKGROUND_COLOR), (color bg), Color, Background),
            ((P::BorderColor), (prop BORDER_COLOR), (color border), Color, None),
            ((P::Color), (prop COLOR), (color text), Color, None),
            ((P::BackgroundImageTint), (bg_tint), (color image_tint), Color, None),
            ((P::Width), (prop WIDTH), (node width), Node, None),
            ((P::Height), (prop HEIGHT), (node height), Node, None),
            ((P::MinWidth), (prop MIN_WIDTH), (node min_width), Node, None),
            ((P::MinHeight), (prop MIN_HEIGHT), (node min_height), Node, None),
            ((P::MaxWidth), (prop MAX_WIDTH), (node max_width), Node, None),
            ((P::MaxHeight), (prop MAX_HEIGHT), (node max_height), Node, None),
            ((P::Left), (prop LEFT), (node left), Node, None),
            ((P::Right), (prop RIGHT), (node right), Node, None),
            ((P::Top), (prop TOP), (node top), Node, None),
            ((P::Bottom), (prop BOTTOM), (node bottom), Node, None),
            ((P::FlexBasis), (prop FLEX_BASIS), (node flex_basis), Node, None),
            ((P::Gap), (prop GAP), (node_gap_both), Node, None),
            ((P::RowGap), (prop ROW_GAP), (node row_gap), Node, None),
            ((P::ColumnGap), (prop COLUMN_GAP), (node column_gap), Node, None),
            ((P::AspectRatio), (prop ASPECT_RATIO), (node_aspect), Node, None),
            ((P::BorderRadius), (prop BORDER_RADIUS), (node_radius_all), Node, BorderRadius),
            ((P::Transform3d(F::Perspective)), (t3d perspective num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::TranslateX)), (t3d translate_x num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::TranslateY)), (t3d translate_y num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::TranslateZ)), (t3d translate_z num 0.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::RotateX)), (t3d rotate_x angle), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::RotateY)), (t3d rotate_y angle), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::RotateZ)), (t3d rotate_z angle), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::Scale)), (t3d scale num 1.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::ScaleX)), (t3d scale_x num 1.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::ScaleY)), (t3d scale_y num 1.0), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::OriginX)), (t3d_origin x), (none), Transform3d, Transform3d),
            ((P::Transform3d(F::OriginY)), (t3d_origin y), (none), Transform3d, Transform3d),
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
    /// Stage 4 — `morphFilter.<param>`, writes the resolved morph chain.
    Morph,
    /// Stage 5 — a feature-owned binding, published into `DrivenExtValues`
    /// for the owning feature's consumer system.
    Ext,
    /// Stage 6 — a gradient leaf, rebuilds the folded gradient component.
    Gradient,
}

/// The transition channels an imperative `{ animated }` binding can park —
/// bindings are continuous per-frame drivers, so a competing eased channel
/// must stand down while one exists ("imperative bindings win").
///
/// **The authoritative park-semantics reference.** Two granularities:
/// *fine-grained* channels ([`Opacity`](Self::Opacity),
/// [`Background`](Self::Background), [`BorderRadius`](Self::BorderRadius))
/// park only when their exact property is bound; *coarse* channels ([`Transform`](Self::Transform),
/// [`Filter`](Self::Filter), [`Backdrop`](Self::Backdrop),
/// [`Transform3d`](Self::Transform3d), the gradient pair) park on ANY
/// binding in their group,
/// because their drive rebuilds/eases a whole value with no per-member seam
/// to merge an imperative writer into. While parked, these channels
/// **RETAIN** their state (`current` keeps the last eased value; unparking
/// retargets from there like any other target change — the bound property's
/// live value re-enters through the next drive's compare). A feature's own
/// channel parks itself and is not a variant here (the svg crate's shape
/// channel parks on any of its `Ext` bindings, via
/// `AnimatedBindings::has_ext_domain`).
///
/// Identifies the nine parkable channels of `drive_transitions`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum ChannelId {
    /// The `UiTransform` channel group — parked by ANY transform binding.
    Transform,
    /// The opacity channel — parked by an `opacity` binding (fine-grained).
    Opacity,
    /// The background-color channel — parked by a `backgroundColor` binding
    /// (fine-grained).
    Background,
    /// The corner-radius channel — parked by a `borderRadius` binding
    /// (fine-grained: the binding IS the whole field).
    BorderRadius,
    /// The whole-value `filter` channel — parked by ANY `filter[<i>].<param>`
    /// binding (coarse: the channel eases a complete pass list, there is no
    /// per-param seam to merge an imperative writer into).
    Filter,
    /// The backdrop analog of [`Self::Filter`], independent of it.
    Backdrop,
    /// The `transform3d` channel group — parked by ANY field binding
    /// (coarse: the apply stage rebuilds the full params struct).
    Transform3d,
    /// The whole-value `backgroundGradient` channel — parked by ANY gradient
    /// leaf binding on that surface (coarse, like [`Self::Filter`]: the
    /// channel eases a complete gradient list, no per-leaf seam). Produced by
    /// `BackgroundGradientParam` bindings, derived in
    /// `crate::style_bindings::gradient_bindings`.
    BackgroundGradient,
    /// The `borderGradient` twin of [`Self::BackgroundGradient`],
    /// independent of it.
    BorderGradient,
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
            ($(($prop:tt, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                match self {
                    $($prop => park_of!($park),)*
                    P::FilterParam { .. } => Some(ChannelId::Filter),
                    P::BackdropParam { .. } => Some(ChannelId::Backdrop),
                    // Morph param bindings park NOTHING: the morph transition
                    // channel eases the engine-owned progress, never the
                    // params — no writer conflict to arbitrate.
                    P::MorphParam { .. } => None,
                    // Coarse per-surface parks, like `Filter`: the gradient
                    // channel eases a complete list, no per-leaf seam.
                    P::BackgroundGradientParam { .. } => Some(ChannelId::BackgroundGradient),
                    P::BorderGradientParam { .. } => Some(ChannelId::BorderGradient),
                    // A feature-owned binding parks nothing in the core: the
                    // owning feature runs its own park rule
                    // (`AnimatedBindings::has_ext_domain`).
                    P::Ext { .. } => None,
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
            ($(($prop:tt, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                match self {
                    $($prop => PropStage::$stage,)*
                    P::FilterParam { .. } => PropStage::Filter,
                    P::BackdropParam { .. } => PropStage::Backdrop,
                    P::MorphParam { .. } => PropStage::Morph,
                    P::BackgroundGradientParam { .. } | P::BorderGradientParam { .. } => {
                        PropStage::Gradient
                    }
                    P::Ext { .. } => PropStage::Ext,
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
    use super::super::protocol::{AnimatableProperty as P, Transform3dField as F};

    /// Row order IS enum `Ord` order (strictly ascending) — so consumers that
    /// iterate the table and consumers that iterate the `BTreeMap` bindings
    /// agree on sequence, by test instead of tribal knowledge. Also pins the
    /// static row count at 39 (27 fieldless + 12 `Transform3d` fields).
    #[test]
    fn table_rows_are_in_enum_order() {
        macro_rules! rows {
            ($(($prop:tt, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                vec![$($prop),*]
            };
        }
        let rows: Vec<P> = with_animatable_props!(rows);
        assert_eq!(rows.len(), 39, "static row count");
        for w in rows.windows(2) {
            assert!(
                w[0] < w[1],
                "table rows out of enum order: {:?} listed before {:?}",
                w[0],
                w[1]
            );
        }
    }
}
