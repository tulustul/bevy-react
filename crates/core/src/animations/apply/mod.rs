//! The imperative apply engine — [`apply_animated_nodes`], stage by stage.
//!
//! Each frame, every [`AnimatedNode`]'s bindings are resolved against the
//! shared-value table and written onto the entity's components in a fixed
//! stage order (the order is semantic — see the orchestrator body). The
//! property table (`super::props`) decides which stage owns each property;
//! this module owns the write mechanics.

use std::collections::HashMap;

use bevy::ecs::query::QueryData;
use bevy::prelude::*;
use bevy::ui::UiTransform;

use super::protocol::{AnimatableProperty, AnimatedBindings};
mod filter_params;
mod gradient;
mod node_colors;
mod shape;
#[cfg(test)]
mod tests;
mod warn;

use filter_params::apply_filter_params;
use node_colors::stage_node_and_colors;

use super::{AnimatedNode, SharedValues, build_ui_transform, eval_scalar, props};

/// The components an animated node can drive. A `QueryData` struct (rather than a
/// tuple) so a new animatable target component is one field, not a tuple-arity
/// problem. Every visual/layout target is optional except `UiTransform` (required
/// by [`AnimatedNode`]).
#[derive(QueryData)]
#[query_data(mutable)]
pub(super) struct AnimTargets {
    transform: &'static mut UiTransform,
    bg: Option<&'static mut BackgroundColor>,
    border: Option<&'static mut BorderColor>,
    text: Option<&'static mut TextColor>,
    image: Option<&'static mut ImageNode>,
    node: Option<&'static mut Node>,
    // On a promoted layer root (see `crate::layer`) an animated `opacity`
    // drives the composite-time group alpha instead of the color folds.
    promoted: Option<&'static crate::layer::PromotedLayer>,
    layer_alpha: Option<&'static mut crate::layer::LayerGroupAlpha>,
    /// The packed filter passes per-param `filter[<i>].<param>` bindings write
    /// into. Promoted-root-only by construction: the chain only exists on
    /// promoted roots (`crate::filters::resolve_chains`).
    resolved_filter: Option<&'static mut crate::filters::ResolvedFilterChain>,
    /// The backdrop analog: `backdropFilter[<i>].<param>` bindings write into
    /// this chain (projected to the shared inner type at the call site).
    resolved_backdrop: Option<&'static mut crate::filters::ResolvedBackdropChain>,
    /// The morph analog: `morphFilter.<param>` bindings write into the
    /// resolved morph's single pass (projected like the backdrop).
    resolved_morph: Option<&'static mut crate::filters::ResolvedMorphChain>,
    /// Reconciler identity, for attributing `filterBinding` validation
    /// warnings to the node's devtools inspector.
    rnode: Option<&'static crate::bridge::RNode>,
    /// The composite-time 3D transform params (`transform3d.<field>` bindings
    /// overwrite single fields; `sync_transform3d_matrices` derives the
    /// matrix + composite-only dirt from the change — no dirt push here).
    transform3d: Option<&'static mut crate::layer::transform3d::LayerTransform3d>,
    /// The SVG shape entity's kind + folded attrs — stage 5 (`shape`)
    /// writes driven `ShapeAttr` values into the bound attrs' seed slots.
    /// Present only on JSX `<svg>` shape children (Node-less entities);
    /// `<g>` groups qualify too (their `opacity` is bindable).
    shape: Option<&'static mut crate::svg::SvgShape>,
    /// The gradient engines' input stamp (the resolver's UNfolded lists +
    /// the static fold opacity) — stage 6's rebuild base.
    gradient_input: Option<&'static crate::ui_map::GradientTargets>,
    /// The folded surface components stage 6 compare-writes.
    bg_gradient: Option<&'static mut bevy::ui::BackgroundGradient>,
    border_gradient: Option<&'static mut bevy::ui::BorderGradient>,
}

/// Bind-time validation memory for a warn-once stage: which entities'
/// bindings have been validated, each with a stamp of per-entity stage state
/// `S` whose drift re-triggers validation. Stage 4 stamps the chains'
/// POST-apply version pair (a re-resolve mismatches and re-validates; its own
/// bump doesn't — see the stamp call); stage 5 needs no state (`S = ()`,
/// where "stamp drifted" degenerates to "not yet stamped"). One type, one
/// prune idiom, two stages.
pub(super) struct ValidationMemory<S>(HashMap<Entity, S>);

impl<S> Default for ValidationMemory<S> {
    fn default() -> Self {
        Self(HashMap::new())
    }
}

impl<S: PartialEq> ValidationMemory<S> {
    /// Whether validation must re-run for this entity: never stamped, or the
    /// stage state drifted from the last stamp. (The caller ORs in its own
    /// binding-restamp signal.)
    pub(super) fn should_validate(&self, entity: Entity, current: &S) -> bool {
        self.0.get(&entity) != Some(current)
    }

    /// Record the post-apply state. Written when validation ran this frame
    /// (freshly validated) or when the state moved under a settled memory —
    /// so a stage's own writes never read as drift next frame.
    pub(super) fn stamp(&mut self, entity: Entity, validated_now: bool, pre: &S, post: S) {
        if validated_now || &post != pre {
            self.0.insert(entity, post);
        }
    }

    /// Drop memory for entities no longer carrying this stage's bindings
    /// (despawned, or the bindings were removed), so a later re-appearance
    /// re-validates (and re-warns) and the map stays bounded.
    pub(super) fn prune(&mut self, live: &[Entity]) {
        if self.0.len() > live.len() {
            self.0.retain(|e, _| live.contains(e));
        }
    }
}

/// Apply every animated node's bindings — the body IS the ordered stage
/// list, and the order is semantic: transform group (1), transform3d group
/// (1b), the opacity pre-resolve (stage 3's value, computed early so stage 2
/// can bake it — see the comment at the call), node fields + colors (2),
/// opacity's final alpha (3), filter/backdrop params (4), shape attrs (5),
/// gradient leaves (6 — after the opacity pre-resolve so the driven alpha
/// folds in), then the validation-memory prunes.
#[allow(clippy::type_complexity)]
pub(super) fn apply_animated_nodes(
    mut commands: Commands,
    values: Res<SharedValues>,
    mut dirt: ResMut<crate::layer::LayerContentDirt>,
    // Bind-time validation memory for the filter-param stage: entity → the
    // chain's POST-apply version (None = no chain) as of the last frame.
    // Warnings re-fire only when the bindings restamp or the chain
    // re-resolves — never per frame: stage 4's own version bump (an actively
    // animating valid binding) is stamped back after the apply so it never
    // reads as a re-resolve.
    mut validated: Local<ValidationMemory<(Option<u32>, Option<u32>, Option<u32>)>>,
    // The shape-attr analog (stage 5): entities whose `ShapeAttr` bindings
    // were validated since they last restamped (`Ref` change tick) — the
    // once-per-restamp warn gate; no version pair needed (no chain here).
    mut shape_validated: Local<ValidationMemory<()>>,
    // The gradient-leaf analog (stage 6): same degenerate `S = ()` gate —
    // the stamp is rebuilt from every gradient style change, which also
    // restamps the bindings, so no state pair is needed.
    mut gradient_validated: Local<ValidationMemory<()>>,
    mut query: Query<(Entity, Ref<AnimatedNode>, AnimTargets)>,
) {
    let mut filter_bound: Vec<Entity> = Vec::new();
    let mut shape_bound: Vec<Entity> = Vec::new();
    let mut gradient_bound: Vec<Entity> = Vec::new();
    for (entity, anim, mut t) in &mut query {
        let b = &anim.0;
        let promoted = t.promoted.is_some();

        stage_transform(entity, b, &values, promoted, &mut dirt, &mut t);
        stage_transform3d(b, &values, &mut t);

        // Opacity owns the final alpha across background/text/image (stage 3).
        // Resolved once up front so stage 2 can bake it into any color it writes —
        // otherwise the two stages would ping-pong the alpha every frame and the
        // compare-before-write guards would never settle. On a promoted layer
        // root the alpha targets the group instead: colors keep their own
        // alpha and stage 3 writes `LayerGroupAlpha`.
        let opacity_alpha = b
            .get(AnimatableProperty::Opacity)
            .and_then(|x| eval_scalar(x, &values));

        stage_node_and_colors(
            entity,
            &mut commands,
            b,
            &values,
            opacity_alpha,
            promoted,
            &mut dirt,
            &mut t,
        );
        stage_opacity(entity, opacity_alpha, promoted, &mut dirt, &mut t);
        stage_filter_params(
            entity,
            anim.is_changed(),
            b,
            &values,
            &mut validated,
            &mut filter_bound,
            &mut dirt,
            &mut t,
        );
        stage_shape_attrs(
            entity,
            anim.is_changed(),
            b,
            &values,
            &mut shape_validated,
            &mut shape_bound,
            &mut t,
        );
        stage_gradient_params(
            entity,
            anim.is_changed(),
            b,
            &values,
            opacity_alpha,
            promoted,
            &mut gradient_validated,
            &mut gradient_bound,
            &mut dirt,
            &mut t,
        );
    }
    validated.prune(&filter_bound);
    shape_validated.prune(&shape_bound);
    gradient_validated.prune(&gradient_bound);
}

/// Classify a real `UiTransform` write for the layer cache: a promoted
/// root's own pure translation only moves its composite quad — content of
/// the *enclosing* capture, not its own — while scale/rotate change the
/// captured pixels (the rect doesn't track them). Shared by stage 1 here and
/// the transition engine's transform channel (`crate::transition`): the two
/// `UiTransform` writers must classify identically.
pub(crate) fn push_transform_dirt(
    entity: Entity,
    old: &UiTransform,
    new: &UiTransform,
    promoted: bool,
    dirt: &mut crate::layer::LayerContentDirt,
) {
    let translate_only = old.scale == new.scale && old.rotation == new.rotation;
    if promoted && translate_only {
        dirt.composite_only.push(entity);
    } else {
        dirt.nodes.push(entity);
    }
}

/// Stage 1 — transform group: rebuild the whole `UiTransform` from the six
/// channels each frame (unbound channels stay at identity). Grouped because
/// scale precedence (`scale` vs `scaleX`/`scaleY`) needs all channels at once.
/// Compare-before-write (here and in every stage below): the read goes
/// through `Deref` (no change mark), only the assignment through `DerefMut`
/// — so a settled binding doesn't dirty change detection every frame.
fn stage_transform(
    entity: Entity,
    b: &AnimatedBindings,
    values: &SharedValues,
    promoted: bool,
    dirt: &mut crate::layer::LayerContentDirt,
    t: &mut AnimTargetsItem,
) {
    use AnimatableProperty as P;
    if !b.has_transform() {
        return;
    }
    let new = build_ui_transform(
        b.get(P::TranslateX)
            .and_then(|x| eval_scalar(x, values))
            .map(Val::Px),
        b.get(P::TranslateY)
            .and_then(|x| eval_scalar(x, values))
            .map(Val::Px),
        b.get(P::Scale).and_then(|x| eval_scalar(x, values)),
        b.get(P::ScaleX).and_then(|x| eval_scalar(x, values)),
        b.get(P::ScaleY).and_then(|x| eval_scalar(x, values)),
        // Degrees on the wire (like declarative `transform.rotate` and
        // the `transform3d` rotations), radians in `UiTransform`.
        b.get(P::Rotate)
            .and_then(|x| eval_scalar(x, values))
            .map(f32::to_radians),
    );
    if *t.transform != new {
        push_transform_dirt(entity, &t.transform, &new, promoted, dirt);
        *t.transform = new;
    }
}

/// Stage 1b — transform3d group: bound fields overwrite the current
/// params (the static style base — the transition engine parks its
/// whole channel group while any binding exists), unbound fields keep
/// it. Values arrive in the declarative wire units: px lengths,
/// DEGREES for rotations (converted to the stored radians), raw
/// scalars. No dirt push — the matrix sync detects the change.
fn stage_transform3d(b: &AnimatedBindings, values: &SharedValues, t: &mut AnimTargetsItem) {
    use AnimatableProperty as P;
    if !b.has_transform3d() {
        return;
    }
    let Some(t3d) = &mut t.transform3d else {
        return;
    };
    use crate::animations::protocol::Transform3dField as F;
    use crate::protocol::animatable::Animatable::Static;
    use crate::protocol::{transform::Transform3dOrigin, units::Angle, units::Length};
    let mut new = t3d.0.clone();
    for (property, binding) in b.iter() {
        if !matches!(property, P::Transform3d(_)) {
            continue;
        }
        let Some(v) = eval_scalar(binding, values) else {
            continue;
        };
        let deg = || Some(Static(Angle::from_radians(v.to_radians())));
        let origin =
            |o: &crate::protocol::transform::Transform3d| o.origin.clone().unwrap_or_default();
        // Field writes generate from the property table's t3d rows
        // (the same rows that drive the transition channel group —
        // `angle` fields arrive as wire degrees, stored as radians;
        // `num` fields write raw, perspective included: bindings are
        // imperative, the transition engine's orthographic snap
        // doesn't apply here). Origin axes stay literal: each writes
        // its axis and preserves the other.
        macro_rules! rule {
            ($prop:tt, (t3d $f:ident num $d:tt)) => {
                if property == &$prop {
                    new.$f = Some(Static(v));
                }
            };
            ($prop:tt, (t3d $f:ident angle)) => {
                if property == &$prop {
                    new.$f = deg();
                }
            };
            ($prop:tt, (t3d_origin x)) => {
                if property == &$prop {
                    new.origin = Some(Transform3dOrigin {
                        x: Static(Length::Px(v)),
                        y: origin(&new).y,
                    });
                }
            };
            ($prop:tt, (t3d_origin y)) => {
                if property == &$prop {
                    new.origin = Some(Transform3dOrigin {
                        x: origin(&new).x,
                        y: Static(Length::Px(v)),
                    });
                }
            };
            ($prop:tt, $other:tt) => {};
        }
        macro_rules! walk {
            ($(($prop:tt, $kind:ident, $acc:tt, $write:tt, $stage:ident, $park:ident),)*) => {
                $(rule!($prop, $acc);)*
            };
        }
        props::with_animatable_props!(walk);
    }
    if t3d.0 != new {
        t3d.0 = new;
    }
}

/// Stage 3 — opacity owns the final alpha: the group alpha on a
/// promoted layer root, else across background/text/image.
fn stage_opacity(
    entity: Entity,
    opacity_alpha: Option<f32>,
    promoted: bool,
    dirt: &mut crate::layer::LayerContentDirt,
    t: &mut AnimTargetsItem,
) {
    if let Some(alpha) = opacity_alpha
        && promoted
    {
        if let Some(la) = &mut t.layer_alpha
            && la.0 != alpha
        {
            la.0 = alpha;
            // Composite-only: the group alpha multiplies the cached
            // texture at composite time; the captured pixels are
            // unchanged. (It IS content of an enclosing layer, if any.)
            dirt.composite_only.push(entity);
        }
    } else if let Some(alpha) = opacity_alpha {
        let with_alpha = |color: Color| -> Option<Color> {
            let mut s = color.to_srgba();
            (s.alpha != alpha).then(|| {
                s.alpha = alpha;
                Color::Srgba(s)
            })
        };
        let mut wrote = false;
        if let Some(c) = &mut t.bg
            && let Some(new) = with_alpha(c.0)
        {
            c.0 = new;
            wrote = true;
        }
        if let Some(tc) = &mut t.text
            && let Some(new) = with_alpha(tc.0)
        {
            tc.0 = new;
            wrote = true;
        }
        if let Some(img) = &mut t.image
            && let Some(new) = with_alpha(img.color)
        {
            img.color = new;
            wrote = true;
        }
        if wrote {
            dirt.nodes.push(entity);
        }
    }
}

/// Stage 4 — per-param filter bindings (`filter[<i>].<param>`): write
/// the evaluated values straight into the resolved chain's packed
/// params (promoted-root-only by construction — the chain only exists
/// there). Values are applied in the param's wire unit: logical px for
/// `Length` slots (× `chain.scale`, the resolver's physical-px
/// rewrite), degrees for `Angle` slots (→ packed radians), raw
/// scalars, rgba via `interpolateColor` for `Color` slots. A binding
/// addresses a WIRE chain position, so it writes the named slot in
/// every pass with that `wire_index` (blur's H+V both carry `radius`).
/// Compare-before-write; a real change bumps `version` once and
/// pushes composite-only dirt — the capture holds unfiltered content,
/// so `dirt.nodes` is never touched. Because this runs every frame
/// after `resolve_chains`, a style delta that rebuilt the chain
/// mid-animation is re-asserted the same frame. While any such binding
/// exists the whole-value `filter` transition channel is parked
/// (`skip_filter` in `transition.rs`'s `drive_transitions`), so this
/// stage and that ease never interleave on one node.
#[allow(clippy::too_many_arguments)]
fn stage_filter_params(
    entity: Entity,
    anim_changed: bool,
    b: &AnimatedBindings,
    values: &SharedValues,
    validated: &mut ValidationMemory<(Option<u32>, Option<u32>, Option<u32>)>,
    filter_bound: &mut Vec<Entity>,
    dirt: &mut crate::layer::LayerContentDirt,
    t: &mut AnimTargetsItem,
) {
    let has_filter = b.has_filter_params();
    let has_backdrop = b.has_backdrop_params();
    let has_morph = b.has_morph_params();
    if !(has_filter || has_backdrop || has_morph) {
        return;
    }
    filter_bound.push(entity);
    // Bind-time validation gate: warn when the bindings restamped
    // (`Ref` change tick — `apply_animated` re-inserts on prop
    // updates) or any chain re-resolved/appeared/vanished. One
    // shared gate for the three domains: the version triple is the key.
    let pre = (
        t.resolved_filter.as_ref().map(|c| c.version),
        t.resolved_backdrop.as_ref().map(|c| c.0.version),
        t.resolved_morph.as_ref().map(|c| c.0.version),
    );
    let validate = anim_changed || validated.should_validate(entity, &pre);
    if has_filter {
        apply_filter_params(
            entity,
            b,
            values,
            t.resolved_filter.as_mut(),
            t.rnode,
            validate,
            dirt,
            filter_params::ChainDomain::Filter,
        );
    }
    if has_backdrop {
        let mut backdrop = t
            .resolved_backdrop
            .as_mut()
            .map(|m| m.reborrow().map_unchanged(|b| &mut b.0));
        apply_filter_params(
            entity,
            b,
            values,
            backdrop.as_mut(),
            t.rnode,
            validate,
            dirt,
            filter_params::ChainDomain::Backdrop,
        );
    }
    if has_morph {
        let mut morph = t
            .resolved_morph
            .as_mut()
            .map(|m| m.reborrow().map_unchanged(|b| &mut b.0));
        apply_filter_params(
            entity,
            b,
            values,
            morph.as_mut(),
            t.rnode,
            validate,
            dirt,
            filter_params::ChainDomain::Morph,
        );
    }
    // Stamp the POST-write versions: the applies above bump `version`
    // themselves on a changed frame, and stamping the pre-write value
    // would make that bump look like a re-resolve next frame —
    // re-warning invalid bindings every animated frame. A real
    // re-resolve (the resolver runs before this stage) still lands
    // between this read and the next frame's `pre`, so it mismatches
    // and re-validates.
    let post = (
        t.resolved_filter.as_ref().map(|c| c.version),
        t.resolved_backdrop.as_ref().map(|c| c.0.version),
        t.resolved_morph.as_ref().map(|c| c.0.version),
    );
    validated.stamp(entity, validate, &pre, post);
}

/// Stage 5 — SVG shape-attr bindings (`shape.<attr>` wrappers): write
/// the resolved values into the bound attrs' **seed slots** (see
/// `shape` for the seed-slot design and the write-ordering
/// contract). NOTHING extra is dirtied here: the `Changed<SvgShape>`
/// tick from a real write IS the raster's derived-dirt signal —
/// `svg::update_svg_surfaces` (ordered after `AnimationSet::Apply` in
/// `plugin.rs`, so the write lands the same frame) repaints and taps
/// the layer dirt itself.
fn stage_shape_attrs(
    entity: Entity,
    anim_changed: bool,
    b: &AnimatedBindings,
    values: &SharedValues,
    shape_validated: &mut ValidationMemory<()>,
    shape_bound: &mut Vec<Entity>,
    t: &mut AnimTargetsItem,
) {
    if !b.has_shape_attrs() {
        return;
    }
    shape_bound.push(entity);
    let validate = anim_changed || shape_validated.should_validate(entity, &());
    shape::apply_shape_attrs(b, values, t.shape.as_mut(), t.rnode, validate);
    shape_validated.stamp(entity, validate, &(), ());
}

/// Stage 6 — gradient-leaf bindings (`backgroundGradient[<i>]` /
/// `borderGradient[<i>]` leaves): rebuild each bound surface's folded
/// component from the `GradientTargets` stamp with the driven leaves
/// overwritten, fold opacity (the driven alpha when unpromoted, else the
/// stamp's static fold), and compare-write — content dirt on a real change
/// (gradients are captured pixels). See `gradient` for the unit contract
/// and the defensive validation (`gradientBinding`, warn once per
/// restamp). While any gradient binding exists that surface's whole-value
/// transition channel is parked (`ChannelId::{Background,Border}Gradient`).
#[allow(clippy::too_many_arguments)]
fn stage_gradient_params(
    entity: Entity,
    anim_changed: bool,
    b: &AnimatedBindings,
    values: &SharedValues,
    opacity_alpha: Option<f32>,
    promoted: bool,
    gradient_validated: &mut ValidationMemory<()>,
    gradient_bound: &mut Vec<Entity>,
    dirt: &mut crate::layer::LayerContentDirt,
    t: &mut AnimTargetsItem,
) {
    if !b.has_gradient_params() {
        return;
    }
    gradient_bound.push(entity);
    let validate = anim_changed || gradient_validated.should_validate(entity, &());
    gradient::apply_gradient_params(
        entity,
        b,
        values,
        t.gradient_input,
        t.bg_gradient.as_mut(),
        t.border_gradient.as_mut(),
        opacity_alpha,
        promoted,
        t.rnode,
        validate,
        dirt,
    );
    gradient_validated.stamp(entity, validate, &(), ());
}
