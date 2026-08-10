//! `ReactUiAnimationsPlugin` — a Reanimated-style animation engine for
//! `bevy-react`.
//!
//! The model mirrors React Native's Reanimated: a React app declares **shared
//! values** (one animatable `f32` with a stable id) and assigns **drivers**
//! (`withTiming`, `withSpring`, `withRepeat`, `withSequence`) to them; an
//! `Animated.node` binds style properties to those values. All per-frame work —
//! advancing drivers, interpolation, writing components — happens **here, on the
//! Bevy side**, never crossing back to JS. The one exception is completion:
//! a driver started with a correlation token reports its settlement (one
//! [`AnimationSettled`] message, forwarded by the integrator) so a JS callback
//! can fire — once per animation, not per frame.
//!
//! This crate is deliberately decoupled from the main `bevy-react` crate (which
//! depends on it): it owns the animation wire types ([`mod@protocol`]) and the
//! orchestration systems, and receives commands through an [`AnimationInbox`]
//! channel the integrator hands it.

use std::collections::{HashMap, HashSet};

use bevy::ecs::query::QueryData;
use bevy::prelude::*;
use bevy::ui::UiTransform;
use crossbeam_channel::Receiver;

pub mod protocol;
mod runner;
mod shape_stage;

pub use protocol::{
    AnimatableProperty, AnimatedBindings, AnimationCommand, Binding, Driver, Easing, SharedId,
    ValueKind,
};
pub use runner::{Runner, build_runner};

/// Adds the animation orchestration: the [`SharedValues`] table, the per-frame
/// driver/apply systems, and the [`AnimationInbox`] that feeds commands in.
///
/// Added automatically by `bevy_react::ReactUiPlugin` unless
/// `.with_animations(false)`. The integrator is responsible for ordering
/// [`AnimationSet::Apply`] after the reconciler's op-apply so per-frame animation
/// writes win over this frame's static style.
pub struct ReactUiAnimationsPlugin {
    inbox: Receiver<AnimationCommand>,
}

impl ReactUiAnimationsPlugin {
    /// Build the plugin around the receiving end of the `op_animate` channel.
    pub fn new(inbox: Receiver<AnimationCommand>) -> Self {
        Self { inbox }
    }
}

impl Plugin for ReactUiAnimationsPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<SharedValues>()
            // The apply system reports content writes to the layer cache; the
            // integrator inits this too, but standalone use shouldn't panic.
            .init_resource::<crate::layer::LayerContentDirt>()
            .add_message::<AnimationSettled>()
            .insert_resource(AnimationInbox(self.inbox.clone()))
            .configure_sets(
                Update,
                (AnimationSet::Drain, AnimationSet::Tick, AnimationSet::Apply).chain(),
            )
            .add_systems(
                Update,
                (
                    drain_animation_commands.in_set(AnimationSet::Drain),
                    tick_animations.in_set(AnimationSet::Tick),
                    apply_animated_nodes.in_set(AnimationSet::Apply),
                ),
            );
    }
}

/// Ordering handles for the three animation systems. The integrator orders
/// [`AnimationSet::Apply`] relative to its own reconciler systems.
#[derive(SystemSet, Debug, Clone, PartialEq, Eq, Hash)]
pub enum AnimationSet {
    /// Drain inbound commands into the [`SharedValues`] table.
    Drain,
    /// Advance every active driver by the frame delta.
    Tick,
    /// Write resolved values onto `UiTransform` / colors.
    Apply,
}

/// Component placed (by the main reconciler) on any `Animated.node`. Carries the
/// property→[`Binding`] map. Requires `UiTransform` so the apply system can always
/// drive it.
#[derive(Component, Debug, Clone)]
#[require(UiTransform)]
pub struct AnimatedNode(pub AnimatedBindings);

/// A token-tagged driver settled: `finished` is `true` when it ran to its natural
/// end, `false` when a `set`/`cancel`/new `animate` interrupted it. Written by
/// the drain/tick systems for every [`AnimationCommand::Animate`] that carried a
/// `token`; the integrator (`bevy-react`) forwards these to the JS completion
/// callbacks. The one thing this crate sends back toward JS.
#[derive(Message, Debug, Clone, Copy, PartialEq, Eq)]
pub struct AnimationSettled {
    /// The shared value the driver was animating.
    pub id: SharedId,
    /// The JS-side correlation token from the `animate` command.
    pub token: u64,
    /// Natural completion (`true`) vs interruption (`false`).
    pub finished: bool,
}

/// The receiving end of the `op_animate` channel, drained each frame.
#[derive(Resource)]
pub struct AnimationInbox(pub(crate) Receiver<AnimationCommand>);

/// The live table of shared values, keyed by [`SharedId`]. Each entry holds the
/// current reading plus an optional active driver. Settlements of token-tagged
/// drivers accumulate in `settled` until the owning system flushes them to the
/// [`AnimationSettled`] message stream.
#[derive(Resource, Default)]
pub struct SharedValues {
    values: HashMap<SharedId, SharedValueState>,
    settled: Vec<AnimationSettled>,
}

struct SharedValueState {
    current: f32,
    active: Option<Runner>,
    /// Correlation token of the active driver's JS completion callback, if any.
    token: Option<u64>,
}

impl SharedValueState {
    /// The settlement for interrupting a still-active token-tagged driver
    /// (`set`/`cancel`/a superseding `animate`), consuming the token.
    fn interrupted(&mut self, id: SharedId) -> Option<AnimationSettled> {
        self.active.as_ref()?;
        let token = self.token.take()?;
        Some(AnimationSettled {
            id,
            token,
            finished: false,
        })
    }
}

impl SharedValues {
    /// The current reading of a shared value, if it exists.
    pub fn get(&self, id: SharedId) -> Option<f32> {
        self.values.get(&id).map(|s| s.current)
    }

    /// Number of live shared values (handy in tests).
    pub fn len(&self) -> usize {
        self.values.len()
    }

    /// Whether the table is empty.
    pub fn is_empty(&self) -> bool {
        self.values.is_empty()
    }

    fn declare(&mut self, id: SharedId, initial: f32) {
        // Idempotent: only the first declaration sets the initial reading, so a
        // value survives React re-renders (matching `useSharedValue`).
        self.values.entry(id).or_insert(SharedValueState {
            current: initial,
            active: None,
            token: None,
        });
    }

    fn set(&mut self, id: SharedId, value: f32) {
        let s = self.values.entry(id).or_insert(SharedValueState {
            current: value,
            active: None,
            token: None,
        });
        self.settled.extend(s.interrupted(id));
        s.current = value;
        s.active = None;
    }

    fn animate(&mut self, id: SharedId, driver: &Driver, token: Option<u64>) {
        let s = self.values.entry(id).or_insert(SharedValueState {
            current: 0.0,
            active: None,
            token: None,
        });
        self.settled.extend(s.interrupted(id));
        let from = s.current;
        s.active = Some(build_runner(driver, from));
        s.token = token;
    }

    fn cancel(&mut self, id: SharedId) {
        if let Some(s) = self.values.get_mut(&id) {
            self.settled.extend(s.interrupted(id));
            s.active = None;
        }
    }

    fn clear(&mut self) {
        self.values.clear();
        // Reset also wipes the JS callback registry, so pending settlements would
        // land on nobody — drop them.
        self.settled.clear();
    }

    fn tick(&mut self, dt: f32) {
        for (&id, s) in self.values.iter_mut() {
            if let Some(runner) = s.active.as_mut() {
                let (value, finished) = runner.step(dt);
                s.current = value;
                if finished {
                    s.active = None;
                    if let Some(token) = s.token.take() {
                        self.settled.push(AnimationSettled {
                            id,
                            token,
                            finished: true,
                        });
                    }
                }
            }
        }
    }

    /// Flush the settlements accumulated since the last flush.
    fn take_settled(&mut self) -> Vec<AnimationSettled> {
        std::mem::take(&mut self.settled)
    }
}

// --- Systems -------------------------------------------------------------------

fn drain_animation_commands(
    inbox: Res<AnimationInbox>,
    mut values: ResMut<SharedValues>,
    mut settled: MessageWriter<AnimationSettled>,
) {
    while let Ok(cmd) = inbox.0.try_recv() {
        match cmd {
            AnimationCommand::Declare { id, initial } => values.declare(id, initial),
            AnimationCommand::Set { id, value } => values.set(id, value),
            AnimationCommand::Animate { id, driver, token } => values.animate(id, &driver, token),
            AnimationCommand::Cancel { id } => values.cancel(id),
            AnimationCommand::Clear => values.clear(),
        }
    }
    settled.write_batch(values.take_settled());
}

fn tick_animations(
    time: Res<Time>,
    mut values: ResMut<SharedValues>,
    mut settled: MessageWriter<AnimationSettled>,
) {
    values.tick(time.delta_secs());
    settled.write_batch(values.take_settled());
}

/// The components an animated node can drive. A `QueryData` struct (rather than a
/// tuple) so a new animatable target component is one field, not a tuple-arity
/// problem. Every visual/layout target is optional except `UiTransform` (required
/// by [`AnimatedNode`]).
#[derive(QueryData)]
#[query_data(mutable)]
struct AnimTargets {
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
    /// Reconciler identity, for attributing `filterBinding` validation
    /// warnings to the node's devtools inspector.
    rnode: Option<&'static crate::bridge::RNode>,
    /// The composite-time 3D transform params (`transform3d.<field>` bindings
    /// overwrite single fields; `sync_transform3d_matrices` derives the
    /// matrix + composite-only dirt from the change — no dirt push here).
    transform3d: Option<&'static mut crate::layer::transform3d::LayerTransform3d>,
    /// The SVG shape entity's kind + folded attrs — stage 5 (`shape_stage`)
    /// writes driven `ShapeAttr` values into the bound attrs' seed slots.
    /// Present only on JSX `<svg>` shape children (Node-less entities);
    /// `<g>` groups qualify too (their `opacity` is bindable).
    shape: Option<&'static mut crate::svg::SvgShape>,
}

#[allow(clippy::type_complexity)]
fn apply_animated_nodes(
    mut commands: Commands,
    values: Res<SharedValues>,
    mut dirt: ResMut<crate::layer::LayerContentDirt>,
    // Bind-time validation memory for the filter-param stage: entity → the
    // chain's POST-apply version (None = no chain) as of the last frame.
    // Warnings re-fire only when the bindings restamp or the chain
    // re-resolves — never per frame: stage 4's own version bump (an actively
    // animating valid binding) is stamped back after the apply so it never
    // reads as a re-resolve.
    mut validated: Local<HashMap<Entity, (Option<u32>, Option<u32>)>>,
    // The shape-attr analog (stage 5): entities whose `ShapeAttr` bindings
    // were validated since they last restamped (`Ref` change tick) — the
    // once-per-restamp warn gate; no version pair needed (no chain here).
    mut shape_validated: Local<HashSet<Entity>>,
    mut query: Query<(Entity, Ref<AnimatedNode>, AnimTargets)>,
) {
    use AnimatableProperty as P;
    let mut filter_bound: Vec<Entity> = Vec::new();
    let mut shape_bound: Vec<Entity> = Vec::new();
    for (entity, anim, mut t) in &mut query {
        let b = &anim.0;
        let promoted = t.promoted.is_some();

        // Stage 1 — transform group: rebuild the whole `UiTransform` from the six
        // channels each frame (unbound channels stay at identity). Grouped because
        // scale precedence (`scale` vs `scaleX`/`scaleY`) needs all channels at once.
        // Compare-before-write (here and in every stage below): the read goes
        // through `Deref` (no change mark), only the assignment through `DerefMut`
        // — so a settled binding doesn't dirty change detection every frame.
        if b.has_transform() {
            let new = build_ui_transform(
                b.get(P::TranslateX)
                    .and_then(|x| eval_scalar(x, &values))
                    .map(Val::Px),
                b.get(P::TranslateY)
                    .and_then(|x| eval_scalar(x, &values))
                    .map(Val::Px),
                b.get(P::Scale).and_then(|x| eval_scalar(x, &values)),
                b.get(P::ScaleX).and_then(|x| eval_scalar(x, &values)),
                b.get(P::ScaleY).and_then(|x| eval_scalar(x, &values)),
                // Degrees on the wire (like declarative `transform.rotate` and
                // the `transform3d` rotations), radians in `UiTransform`.
                b.get(P::Rotate)
                    .and_then(|x| eval_scalar(x, &values))
                    .map(f32::to_radians),
            );
            if *t.transform != new {
                // Layer-cache classification: a promoted root's own pure
                // translation only moves its composite quad — content of the
                // *enclosing* capture, not its own. Scale/rotate change the
                // captured pixels (the rect doesn't track them) → content.
                let translate_only =
                    t.transform.scale == new.scale && t.transform.rotation == new.rotation;
                if promoted && translate_only {
                    dirt.composite_only.push(entity);
                } else {
                    dirt.nodes.push(entity);
                }
                *t.transform = new;
            }
        }

        // Stage 1b — transform3d group: bound fields overwrite the current
        // params (the static style base — the transition engine parks its
        // whole channel group while any binding exists), unbound fields keep
        // it. Values arrive in the declarative wire units: px lengths,
        // DEGREES for rotations (converted to the stored radians), raw
        // scalars. No dirt push — the matrix sync detects the change.
        if b.has_transform3d()
            && let Some(t3d) = &mut t.transform3d
        {
            use crate::animations::protocol::Transform3dField as F;
            use crate::protocol::Animatable::Static;
            use crate::protocol::{Angle, Length, Transform3dOrigin};
            let mut new = t3d.0.clone();
            for (property, binding) in b.iter() {
                let P::Transform3d(field) = property else {
                    continue;
                };
                let Some(v) = eval_scalar(binding, &values) else {
                    continue;
                };
                let deg = || Some(Static(Angle::from_radians(v.to_radians())));
                let origin =
                    |o: &crate::protocol::Transform3d| o.origin.clone().unwrap_or_default();
                match field {
                    F::Perspective => new.perspective = Some(Static(v)),
                    F::TranslateX => new.translate_x = Some(Static(v)),
                    F::TranslateY => new.translate_y = Some(Static(v)),
                    F::TranslateZ => new.translate_z = Some(Static(v)),
                    F::RotateX => new.rotate_x = deg(),
                    F::RotateY => new.rotate_y = deg(),
                    F::RotateZ => new.rotate_z = deg(),
                    F::Scale => new.scale = Some(Static(v)),
                    F::ScaleX => new.scale_x = Some(Static(v)),
                    F::ScaleY => new.scale_y = Some(Static(v)),
                    F::OriginX => {
                        new.origin = Some(Transform3dOrigin {
                            x: Static(Length::Px(v)),
                            y: origin(&new).y,
                        });
                    }
                    F::OriginY => {
                        new.origin = Some(Transform3dOrigin {
                            x: origin(&new).x,
                            y: Static(Length::Px(v)),
                        });
                    }
                }
            }
            if t3d.0 != new {
                t3d.0 = new;
            }
        }

        // Opacity owns the final alpha across background/text/image (stage 3).
        // Resolved once up front so stage 2 can bake it into any color it writes —
        // otherwise the two stages would ping-pong the alpha every frame and the
        // compare-before-write guards would never settle. On a promoted layer
        // root the alpha targets the group instead: colors keep their own
        // alpha and stage 3 writes `LayerGroupAlpha`.
        let opacity_alpha = b.get(P::Opacity).and_then(|x| eval_scalar(x, &values));

        // Stage 2 — every non-transform, non-opacity binding. Colors land on their
        // component; lengths/scalars land on `Node`. Opacity is deferred to stage 3
        // so it owns the final alpha after any color write (the original ordering);
        // filter params to stage 4 (they write the resolved chain, not components,
        // and their value kind comes from the chain layout — not `value_kind`).
        for (property, binding) in b.iter() {
            if property.is_transform()
                || matches!(
                    property,
                    // `ShapeAttr` is stage 5's: it writes `SvgShape.attrs`,
                    // not `Node` — skipped explicitly rather than relying on
                    // the scalar fallthrough being inert (shape entities are
                    // Node-less, but the intent should be in the code).
                    P::Opacity | P::FilterParam { .. } | P::Transform3d(_) | P::ShapeAttr { .. }
                )
            {
                continue;
            }
            match property.value_kind() {
                ValueKind::Color => {
                    let Some(mut rgba) = eval_color(binding, &values) else {
                        continue;
                    };
                    // Bake the final alpha in for the components stage 3 drives
                    // (border is not one of them: opacity never touches it).
                    if !promoted
                        && matches!(
                            property,
                            P::BackgroundColor | P::Color | P::BackgroundImageTint
                        )
                        && let Some(alpha) = opacity_alpha
                    {
                        rgba[3] = alpha;
                    }
                    let color = Color::srgba(rgba[0], rgba[1], rgba[2], rgba[3]);
                    match property {
                        P::BackgroundColor => match &mut t.bg {
                            Some(c) if c.0 != color => {
                                c.0 = color;
                                dirt.nodes.push(entity);
                            }
                            Some(_) => {}
                            None => {
                                commands.entity(entity).insert(BackgroundColor(color));
                                dirt.nodes.push(entity);
                            }
                        },
                        P::BorderColor => {
                            let bc = BorderColor {
                                top: color,
                                right: color,
                                bottom: color,
                                left: color,
                            };
                            match &mut t.border {
                                Some(c) if **c != bc => {
                                    **c = bc;
                                    dirt.nodes.push(entity);
                                }
                                Some(_) => {}
                                None => {
                                    commands.entity(entity).insert(bc);
                                    dirt.nodes.push(entity);
                                }
                            }
                        }
                        P::Color => {
                            if let Some(tc) = &mut t.text
                                && tc.0 != color
                            {
                                tc.0 = color;
                                dirt.nodes.push(entity);
                            }
                        }
                        // A `backgroundImage` tint: drive the ImageNode's
                        // color. Inert when the node carries no ImageNode
                        // (e.g. the spec was ignored on a foreign element or
                        // the style lost the field).
                        P::BackgroundImageTint => {
                            if let Some(img) = &mut t.image
                                && img.color != color
                            {
                                img.color = color;
                                dirt.nodes.push(entity);
                            }
                        }
                        _ => {}
                    }
                }
                // Length/Scalar (and the unused Angle) all target `Node` here —
                // transform's Length/Scalar/Angle members were handled in stage 1.
                _ => {
                    let Some(v) = eval_scalar(binding, &values) else {
                        continue;
                    };
                    if let Some(node) = t.node.as_mut()
                        && write_node_value(node, property, v)
                    {
                        // Belt: the geometry hash catches the resulting layout
                        // shift too, one system later.
                        dirt.nodes.push(entity);
                    }
                }
            }
        }

        // Stage 3 — opacity owns the final alpha: the group alpha on a
        // promoted layer root, else across background/text/image.
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

        // Stage 4 — per-param filter bindings (`filter[<i>].<param>`): write
        // the evaluated values straight into the resolved chain's packed
        // params (promoted-root-only by construction — the chain only exists
        // there). Values are applied in the param's wire unit: logical px for
        // `Length` slots (× `chain.scale`, the resolver's physical-px
        // rewrite), degrees for `Angle` slots (→ packed radians), raw
        // scalars, rgba via `interpolateColor` for `Color` slots. A binding
        // addresses a WIRE chain position, so it writes the named slot in
        // every pass with that `wire_index` (blur's H+V both carry `radius`).
        // Compare-before-write; a real change bumps `version` once and
        // pushes composite-only dirt — the capture holds unfiltered content,
        // so `dirt.nodes` is never touched. Because this runs every frame
        // after `resolve_chains`, a style delta that rebuilt the chain
        // mid-animation is re-asserted the same frame. While any such binding
        // exists the whole-value `filter` transition channel is parked
        // (`skip_filter` in `transition.rs`'s `drive_transitions`), so this
        // stage and that ease never interleave on one node.
        let has_filter = b.has_filter_params();
        let has_backdrop = b.has_backdrop_params();
        if has_filter || has_backdrop {
            filter_bound.push(entity);
            // Bind-time validation gate: warn when the bindings restamped
            // (`Ref` change tick — `apply_animated` re-inserts on prop
            // updates) or either chain re-resolved/appeared/vanished. One
            // shared gate for both channels: the version pair is the key.
            let pre = (
                t.resolved_filter.as_ref().map(|c| c.version),
                t.resolved_backdrop.as_ref().map(|c| c.0.version),
            );
            let validate = anim.is_changed() || validated.get(&entity) != Some(&pre);
            if has_filter {
                apply_filter_params(
                    entity,
                    b,
                    &values,
                    t.resolved_filter.as_mut(),
                    t.rnode,
                    validate,
                    &mut dirt,
                    false,
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
                    &values,
                    backdrop.as_mut(),
                    t.rnode,
                    validate,
                    &mut dirt,
                    true,
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
            );
            if validate || post != pre {
                validated.insert(entity, post);
            }
        }

        // Stage 5 — SVG shape-attr bindings (`shape.<attr>` wrappers): write
        // the resolved values into the bound attrs' **seed slots** (see
        // `shape_stage` for the seed-slot design and the write-ordering
        // contract). NOTHING extra is dirtied here: the `Changed<SvgShape>`
        // tick from a real write IS the raster's derived-dirt signal —
        // `svg::update_svg_surfaces` (ordered after `AnimationSet::Apply` in
        // `plugin.rs`, so the write lands the same frame) repaints and taps
        // the layer dirt itself.
        if b.has_shape_attrs() {
            shape_bound.push(entity);
            let validate = anim.is_changed() || !shape_validated.contains(&entity);
            shape_stage::apply_shape_attrs(b, &values, t.shape.as_mut(), t.rnode, validate);
            if validate {
                shape_validated.insert(entity);
            }
        }
    }
    // Drop validation memory for entities that no longer carry filter
    // bindings (despawned, or the bindings were removed), so a later
    // re-appearance re-validates and the map stays bounded.
    if validated.len() > filter_bound.len() {
        validated.retain(|e, _| filter_bound.contains(e));
    }
    // Same retention rule for the shape-attr memory.
    if shape_validated.len() > shape_bound.len() {
        shape_validated.retain(|e| shape_bound.contains(e));
    }
}

/// Stage 4's body: validate (when `validate`) and apply every
/// [`AnimatableProperty::FilterParam`] (or, with `backdrop`,
/// [`AnimatableProperty::BackdropParam`]) binding of one node against the
/// matching resolved chain. See the call site for the unit/routing/dirt
/// contract — identical for both channels; only the addressed chain, the
/// wire-key prefix, and the warn kind differ.
#[allow(clippy::too_many_arguments)]
fn apply_filter_params(
    entity: Entity,
    bindings: &AnimatedBindings,
    values: &SharedValues,
    chain: Option<&mut Mut<crate::filters::ResolvedFilterChain>>,
    rnode: Option<&crate::bridge::RNode>,
    validate: bool,
    dirt: &mut crate::layer::LayerContentDirt,
    backdrop: bool,
) {
    let (prefix, kind, style_field) = if backdrop {
        ("backdropFilter", "backdropFilterBinding", "backdropFilter")
    } else {
        ("filter", "filterBinding", "filter")
    };
    // The channel's bound params: `FilterParam` rows for the content chain,
    // `BackdropParam` rows for the backdrop one.
    fn channel_param(property: &AnimatableProperty, backdrop: bool) -> Option<(u8, &String)> {
        match (property, backdrop) {
            (AnimatableProperty::FilterParam { index, name }, false)
            | (AnimatableProperty::BackdropParam { index, name }, true) => Some((*index, name)),
            _ => None,
        }
    }
    // Attribute validation warnings to the node's devtools inspector.
    let _diag = rnode.map(|r| crate::diag::node_scope(r.0));
    // Lazy on purpose: `make` (which allocates the key + message) runs only
    // when a warning actually fires, so the per-bound-param per-frame path
    // stays allocation-free in every build.
    let warn = |validate: bool, make: &dyn Fn() -> (String, String)| {
        if validate {
            let (key, msg) = make();
            crate::diag::report(kind, &key, &msg);
        }
    };

    let Some(chain) = chain else {
        for (property, _) in bindings.iter() {
            if let Some((index, name)) = channel_param(property, backdrop) {
                warn(validate, &|| {
                    (
                        format!("{prefix}[{index}].{name}"),
                        format!(
                            "binding {prefix}[{index}].{name}: the node has no resolved \
                             {prefix} chain to drive (no valid `{style_field}` style) — \
                             binding ignored"
                        ),
                    )
                });
            }
        }
        return;
    };

    // Phase A — read-only (through `Deref`, no change mark): evaluate each
    // binding against the chain layout and collect the components that
    // actually differ.
    let mut writes: Vec<(usize, usize, usize, f32)> = Vec::new();
    {
        let chain: &crate::filters::ResolvedFilterChain = chain;
        for (property, binding) in bindings.iter() {
            let Some((index, name)) = channel_param(property, backdrop) else {
                continue;
            };
            // The slot metadata from the first matching pass — passes sharing
            // a `wire_index` come from one `pack`, so the layout agrees.
            let slot = chain
                .passes
                .iter()
                .filter(|p| p.wire_index == index)
                .find_map(|p| p.layout.iter().find(|s| s.name == name.as_str()).copied());
            let Some(slot) = slot else {
                if chain.passes.iter().any(|p| p.wire_index == index) {
                    warn(validate, &|| {
                        let key = format!("{prefix}[{index}].{name}");
                        let msg = format!(
                            "{key}: chain entry {index} has no param {name:?} — binding ignored"
                        );
                        (key, msg)
                    });
                } else {
                    warn(validate, &|| {
                        let key = format!("{prefix}[{index}].{name}");
                        let msg = format!(
                            "{key}: the resolved {prefix} chain has no entry at index {index} — \
                             binding ignored"
                        );
                        (key, msg)
                    });
                }
                continue;
            };
            // Resolve the bound value per the slot's authoritative kind.
            enum Resolved {
                Scalar(f32),
                Color([f32; 4]),
            }
            let resolved = match slot.kind {
                ValueKind::Color => match eval_color(binding, values) {
                    Some(rgba) => Resolved::Color(rgba),
                    None => {
                        // A scalar binding can never drive a color slot; a
                        // missing shared value is transient and stays silent
                        // (every stage skips it).
                        if !matches!(binding, Binding::InterpolateColor { .. }) {
                            warn(validate, &|| {
                                let key = format!("{prefix}[{index}].{name}");
                                let msg = format!(
                                    "{key}: param {name:?} is a color — bind an \
                                     interpolateColor, not a scalar value"
                                );
                                (key, msg)
                            });
                        }
                        continue;
                    }
                },
                _ if slot.len != 1 => {
                    // Multi-component non-color slots (direction vectors …)
                    // are not addressable per-param in v1 — a scalar splat
                    // would be wrong for them.
                    warn(validate, &|| {
                        let key = format!("{prefix}[{index}].{name}");
                        let msg = format!(
                            "{key}: param {name:?} spans {} components — multi-component \
                             params are not animatable per-param",
                            slot.len
                        );
                        (key, msg)
                    });
                    continue;
                }
                kind => match eval_scalar(binding, values) {
                    Some(v) => Resolved::Scalar(match kind {
                        // The param's wire unit: degrees → packed radians.
                        ValueKind::Angle => v.to_radians(),
                        // Logical px → physical, the resolver's own rewrite.
                        ValueKind::Length => v * chain.scale,
                        _ => v,
                    }),
                    None => {
                        if matches!(binding, Binding::InterpolateColor { .. }) {
                            warn(validate, &|| {
                                let key = format!("{prefix}[{index}].{name}");
                                let msg = format!(
                                    "{key}: param {name:?} is a scalar — an \
                                     interpolateColor binding cannot drive it"
                                );
                                (key, msg)
                            });
                        }
                        continue;
                    }
                },
            };
            // Route to every pass at this wire position, defending bounds
            // like the resolver's physical-px rewrite.
            for (pi, pass) in chain.passes.iter().enumerate() {
                if pass.wire_index != index {
                    continue;
                }
                let Some(slot) = pass.layout.iter().find(|s| s.name == name.as_str()) else {
                    continue;
                };
                let Some(vec) = pass.params.get(slot.vec) else {
                    continue;
                };
                match &resolved {
                    Resolved::Scalar(v) => {
                        // Same bounds defense as `rewrite_length_slots`: a
                        // hand-written filter's bad layout degrades (slot
                        // skipped), never panics.
                        if slot.comp < 4 && vec[slot.comp] != *v {
                            writes.push((pi, slot.vec, slot.comp, *v));
                        }
                    }
                    Resolved::Color(rgba) => {
                        for comp in slot.comp..(slot.comp + slot.len).min(4) {
                            let v = rgba[comp - slot.comp];
                            if vec[comp] != v {
                                writes.push((pi, slot.vec, comp, v));
                            }
                        }
                    }
                }
            }
        }
    }

    // Phase B — one write, one version bump, composite-only dirt.
    if !writes.is_empty() {
        let chain = &mut **chain;
        for (pass, vec, comp, v) in writes {
            chain.passes[pass].params[vec][comp] = v;
        }
        chain.version = chain.version.wrapping_add(1);
        dirt.composite_only.push(entity);
    }
}

/// Write a resolved scalar onto the matching `Node` layout field — but only when
/// it actually differs from the live value. Writing `Node` re-triggers Bevy's
/// layout, so the compare keeps a settled length binding from forcing a relayout
/// every frame (the read goes through `Deref`, only the assignment through
/// `DerefMut`, so an unchanged value never trips change detection). It also means a
/// re-render that resets `Node` to its static style is corrected next frame.
/// Lengths resolve to `Val::Px`: the imperative animation surface is scalar `f32`.
/// Returns whether anything was actually written (the layer-cache tap keys off it).
fn write_node_value<N: std::ops::DerefMut<Target = Node>>(
    node: &mut N,
    property: &AnimatableProperty,
    v: f32,
) -> bool {
    use AnimatableProperty as P;
    let val = Val::Px(v);
    // Each arm's guard reads the live field through `Deref` (no change mark) and
    // the body writes through `DerefMut` (marks changed) only when it differs — so
    // a settled binding never forces a relayout. `Gap` writes both axes.
    match property {
        P::Width if node.width != val => node.width = val,
        P::Height if node.height != val => node.height = val,
        P::MinWidth if node.min_width != val => node.min_width = val,
        P::MinHeight if node.min_height != val => node.min_height = val,
        P::MaxWidth if node.max_width != val => node.max_width = val,
        P::MaxHeight if node.max_height != val => node.max_height = val,
        P::Left if node.left != val => node.left = val,
        P::Right if node.right != val => node.right = val,
        P::Top if node.top != val => node.top = val,
        P::Bottom if node.bottom != val => node.bottom = val,
        P::FlexBasis if node.flex_basis != val => node.flex_basis = val,
        P::Gap => {
            let mut wrote = false;
            if node.row_gap != val {
                node.row_gap = val;
                wrote = true;
            }
            if node.column_gap != val {
                node.column_gap = val;
                wrote = true;
            }
            return wrote;
        }
        P::RowGap if node.row_gap != val => node.row_gap = val,
        P::ColumnGap if node.column_gap != val => node.column_gap = val,
        P::AspectRatio if node.aspect_ratio != Some(v) => node.aspect_ratio = Some(v),
        _ => return false,
    }
    true
}

/// Build a `UiTransform` from the six scalar transform channels (each `None`
/// stays at identity: no translation, unit scale, no rotation). `scale` is
/// uniform; `scale_x`/`scale_y` override a single axis. Shared by the animated
/// node apply and `bevy-react`'s static/transition transform path so the channel
/// semantics stay identical across both.
pub fn build_ui_transform(
    translate_x: Option<Val>,
    translate_y: Option<Val>,
    scale: Option<f32>,
    scale_x: Option<f32>,
    scale_y: Option<f32>,
    rotate: Option<f32>,
) -> UiTransform {
    let mut t = UiTransform::IDENTITY;
    if let Some(v) = translate_x {
        t.translation.x = v;
    }
    if let Some(v) = translate_y {
        t.translation.y = v;
    }
    let mut sx = 1.0;
    let mut sy = 1.0;
    if let Some(v) = scale {
        sx = v;
        sy = v;
    }
    if let Some(v) = scale_x {
        sx = v;
    }
    if let Some(v) = scale_y {
        sy = v;
    }
    t.scale = Vec2::new(sx, sy);
    if let Some(v) = rotate {
        t.rotation = Rot2::radians(v);
    }
    t
}

// --- Binding evaluation --------------------------------------------------------

fn eval_scalar(binding: &Binding, values: &SharedValues) -> Option<f32> {
    match binding {
        Binding::Shared { id } => values.get(*id),
        Binding::Interpolate { id, input, output } => {
            Some(piecewise(values.get(*id)?, input, output))
        }
        Binding::InterpolateColor { .. } => None,
    }
}

fn eval_color(binding: &Binding, values: &SharedValues) -> Option<[f32; 4]> {
    match binding {
        Binding::InterpolateColor { id, input, output } => {
            Some(piecewise_color(values.get(*id)?, input, output))
        }
        _ => None,
    }
}

/// Linear interpolation between two values of the same kind, `t` in `0.0..=1.0`.
/// The one primitive every interpolated quantity shares — implemented here for
/// the scalar and color bindings, and by `bevy-react`'s transition engine for its
/// own channel types (hence public).
pub trait Lerp: Copy {
    /// `self + (other - self) * t`, component-wise where applicable.
    fn lerp(self, other: Self, t: f32) -> Self;
}

impl Lerp for f32 {
    fn lerp(self, other: Self, t: f32) -> Self {
        self + (other - self) * t
    }
}

impl Lerp for [f32; 4] {
    fn lerp(self, other: Self, t: f32) -> Self {
        // Qualified: `bevy::math::FloatExt::lerp` is also in scope for `f32`.
        [
            Lerp::lerp(self[0], other[0], t),
            Lerp::lerp(self[1], other[1], t),
            Lerp::lerp(self[2], other[2], t),
            Lerp::lerp(self[3], other[3], t),
        ]
    }
}

/// Piecewise-linear interpolation, clamped at the ends. `input` must be ascending.
fn piecewise(x: f32, input: &[f32], output: &[f32]) -> f32 {
    if input.is_empty() || output.is_empty() {
        return x;
    }
    piecewise_impl(x, input, output)
}

/// Per-channel piecewise-linear color interpolation (rgba in `0.0..=1.0`).
fn piecewise_color(x: f32, input: &[f32], output: &[[f32; 4]]) -> [f32; 4] {
    if input.is_empty() || output.is_empty() {
        return [0.0, 0.0, 0.0, 1.0];
    }
    piecewise_impl(x, input, output)
}

/// The shared segment routine behind [`piecewise`]/[`piecewise_color`]: find the
/// segment containing `x` and lerp within it, clamping at both ends. `input` must
/// be ascending and both slices non-empty (the wrappers handle empty).
fn piecewise_impl<T: Lerp>(x: f32, input: &[f32], output: &[T]) -> T {
    let n = input.len().min(output.len());
    if n == 1 || x <= input[0] {
        return output[0];
    }
    if x >= input[n - 1] {
        return output[n - 1];
    }
    for i in 0..n - 1 {
        let (a, b) = (input[i], input[i + 1]);
        if x >= a && x <= b {
            let t = if (b - a).abs() < f32::EPSILON {
                0.0
            } else {
                (x - a) / (b - a)
            };
            return output[i].lerp(output[i + 1], t);
        }
    }
    output[n - 1]
}

// (Driver runtime — `Runner`, `build_runner`, easing — lives in `runner.rs`.)

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::AnimatableField;

    /// Build bindings the way production does: decode a style carrying inline
    /// `{ animated }` wrappers and derive (`crate::style_bindings`).
    fn style_bindings(style: serde_json::Value) -> AnimatedBindings {
        let style: crate::protocol::Style = serde_json::from_value(style).expect("style decodes");
        crate::style_bindings::derive_bindings(Some(&style)).expect("style carries bindings")
    }

    /// Direct construction for the stage-4 chain tests: they pair bindings
    /// with synthetic resolved chains at explicit wire indices — including
    /// deliberately mismatched index/name combinations a real style can't
    /// express (validation must warn and stay inert).
    fn filter_bindings(entries: &[(u8, &str, Binding)]) -> AnimatedBindings {
        AnimatedBindings(
            entries
                .iter()
                .map(|(index, name, b)| {
                    (
                        AnimatableProperty::FilterParam {
                            index: *index,
                            name: (*name).into(),
                        },
                        b.clone(),
                    )
                })
                .collect(),
        )
    }

    fn timing(to: f32, duration: f32) -> Driver {
        Driver::Timing {
            to,
            duration,
            easing: Easing::Linear,
        }
    }

    #[test]
    fn piecewise_clamps_and_interpolates() {
        let input = [0.0, 1.0];
        let output = [10.0, 20.0];
        assert_eq!(piecewise(-5.0, &input, &output), 10.0); // clamp low
        assert_eq!(piecewise(5.0, &input, &output), 20.0); // clamp high
        assert!((piecewise(0.5, &input, &output) - 15.0).abs() < 1e-6);
        // Multi-segment.
        let input = [0.0, 0.5, 1.0];
        let output = [0.0, 100.0, 0.0];
        assert!((piecewise(0.25, &input, &output) - 50.0).abs() < 1e-6);
        assert!((piecewise(0.75, &input, &output) - 50.0).abs() < 1e-6);
    }

    #[test]
    fn piecewise_color_interpolates_each_channel() {
        let input = [0.0, 1.0];
        let output = [[0.0, 0.0, 0.0, 1.0], [1.0, 0.5, 0.0, 1.0]];
        let mid = piecewise_color(0.5, &input, &output);
        assert!((mid[0] - 0.5).abs() < 1e-6);
        assert!((mid[1] - 0.25).abs() < 1e-6);
        assert!((mid[2] - 0.0).abs() < 1e-6);
        assert!((mid[3] - 1.0).abs() < 1e-6);
    }

    #[test]
    fn shared_values_animate_and_tick_to_target() {
        let mut values = SharedValues::default();
        values.declare(1, 0.0);
        values.animate(1, &timing(100.0, 1.0), None);
        values.tick(0.5);
        assert!((values.get(1).unwrap() - 50.0).abs() < 1e-3);
        values.tick(0.5);
        assert!((values.get(1).unwrap() - 100.0).abs() < 1e-3);
        // Driver dropped once finished; further ticks are inert.
        values.tick(1.0);
        assert!((values.get(1).unwrap() - 100.0).abs() < 1e-3);
    }

    #[test]
    fn declare_is_idempotent_but_set_overrides() {
        let mut values = SharedValues::default();
        values.declare(1, 5.0);
        values.declare(1, 999.0); // ignored — keeps 5.0
        assert_eq!(values.get(1), Some(5.0));
        values.set(1, 7.0);
        assert_eq!(values.get(1), Some(7.0));
        values.clear();
        assert!(values.is_empty());
    }

    /// A token-tagged driver reports exactly one `finished: true` settlement when
    /// it runs to its natural end — and nothing at all without a token.
    #[test]
    fn tokened_driver_settles_finished_once() {
        let mut values = SharedValues::default();
        values.declare(1, 0.0);
        values.animate(1, &timing(100.0, 1.0), Some(7));
        values.tick(0.5);
        assert!(values.take_settled().is_empty(), "not settled yet");
        values.tick(0.5);
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 7,
                finished: true
            }]
        );
        values.tick(1.0);
        assert!(values.take_settled().is_empty(), "reported exactly once");

        // Token-free drivers stay silent.
        values.animate(1, &timing(0.0, 0.1), None);
        values.tick(1.0);
        assert!(values.take_settled().is_empty());
    }

    /// Interrupting an active token-tagged driver — via `set`, `cancel`, or a
    /// superseding `animate` — reports `finished: false` for the old token.
    #[test]
    fn interrupting_a_tokened_driver_settles_unfinished() {
        let mut values = SharedValues::default();
        values.declare(1, 0.0);

        values.animate(1, &timing(100.0, 1.0), Some(1));
        values.set(1, 50.0);
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 1,
                finished: false
            }]
        );

        values.animate(1, &timing(100.0, 1.0), Some(2));
        values.cancel(1);
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 2,
                finished: false
            }]
        );

        values.animate(1, &timing(100.0, 1.0), Some(3));
        values.animate(1, &timing(0.0, 1.0), Some(4));
        assert_eq!(
            values.take_settled(),
            vec![AnimationSettled {
                id: 1,
                token: 3,
                finished: false
            }]
        );

        // `clear` (reset/hot reload) drops pending settlements silently.
        values.clear();
        assert!(values.take_settled().is_empty());
    }

    #[test]
    fn driver_deserializes_from_js_wire_shape() {
        // The exact JSON `animated.ts` produces for a nested driver.
        let json = r#"{
            "type": "repeat",
            "animation": {
                "type": "sequence",
                "steps": [
                    { "type": "timing", "to": 50, "duration": 0.4, "easing": "easeInOut" },
                    { "type": "spring", "to": 120, "stiffness": 120, "damping": 14, "mass": 1 }
                ]
            },
            "count": -1,
            "reverse": true
        }"#;
        let driver: Driver = serde_json::from_str(json).expect("driver decodes");
        assert!(matches!(
            driver,
            Driver::Repeat {
                count: -1,
                reverse: true,
                ..
            }
        ));
    }

    #[test]
    fn command_and_binding_deserialize() {
        let cmd: AnimationCommand =
            serde_json::from_str(r#"{ "kind": "declare", "id": 3, "initial": 0 }"#).unwrap();
        assert!(matches!(cmd, AnimationCommand::Declare { id: 3, .. }));
        let cmd: AnimationCommand = serde_json::from_str(r#"{ "kind": "clear" }"#).unwrap();
        assert!(matches!(cmd, AnimationCommand::Clear));

        // `animate` decodes with and without the completion-callback token (the
        // JS side omits the key entirely when no callback was passed).
        let cmd: AnimationCommand = serde_json::from_str(
            r#"{ "kind": "animate", "id": 1,
                 "driver": { "type": "timing", "to": 1 }, "token": 9 }"#,
        )
        .unwrap();
        assert!(matches!(
            cmd,
            AnimationCommand::Animate { token: Some(9), .. }
        ));
        let cmd: AnimationCommand = serde_json::from_str(
            r#"{ "kind": "animate", "id": 1, "driver": { "type": "timing", "to": 1 } }"#,
        )
        .unwrap();
        assert!(matches!(cmd, AnimationCommand::Animate { token: None, .. }));

        let bindings = style_bindings(serde_json::json!({
            "transform": { "translateX": { "animated": { "id": 1 } } },
            "backgroundColor": { "animated": { "type": "interpolateColor", "id": 1,
                "input": [0, 1], "output": [[0,0,0,1],[1,1,1,1]] } },
        }));
        assert!(bindings.contains(AnimatableProperty::TranslateX));
        assert!(bindings.contains(AnimatableProperty::BackgroundColor));
        assert!(bindings.has_transform());
    }

    /// The table-driven applier writes the transform translation, the interpolated
    /// background color, and lets opacity own the final alpha — exactly the three
    /// stages (transform → color → opacity) the per-field applier did.
    #[test]
    fn apply_writes_transform_color_then_opacity() {
        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(1, 25.0); // translateX (px)
        values.set(2, 0.5); // opacity
        values.set(3, 0.0); // color progress → output[0] = red
        world.insert_resource(values);

        let bindings = style_bindings(serde_json::json!({
            "transform": { "translateX": { "animated": { "id": 1 } } },
            "opacity": { "animated": { "id": 2 } },
            "backgroundColor": { "animated": { "type": "interpolateColor", "id": 3,
                "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] } },
        }));

        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                BackgroundColor(Color::WHITE),
            ))
            .id();

        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
        schedule.run(&mut world);

        let t = world.entity(e).get::<UiTransform>().unwrap();
        assert_eq!(t.translation.x, Val::Px(25.0));

        // Color resolved to red, then opacity overwrote alpha to 0.5.
        let s = world
            .entity(e)
            .get::<BackgroundColor>()
            .unwrap()
            .0
            .to_srgba();
        assert!((s.red - 1.0).abs() < 1e-4);
        assert!(s.green.abs() < 1e-4);
        assert!(s.blue.abs() < 1e-4);
        assert!((s.alpha - 0.5).abs() < 1e-4, "opacity owns final alpha");
    }

    /// An animated `backgroundImage.tint` drives the `ImageNode.color` rgb
    /// while opacity owns the final alpha (the stage-2 bake keeps the two
    /// from ping-ponging), and a settled re-run leaves the component clean.
    #[test]
    fn apply_drives_background_image_tint_with_opacity() {
        use bevy::ui::widget::ImageNode;
        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(1, 0.0); // tint progress → output[0] = red
        values.set(2, 0.5); // opacity
        world.insert_resource(values);

        let bindings = style_bindings(serde_json::json!({
            "backgroundImage": { "src": "bg.png", "tint": { "animated": {
                "type": "interpolateColor", "id": 1,
                "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] } } },
            "opacity": { "animated": { "id": 2 } },
        }));
        let e = world
            .spawn((AnimatedNode(bindings), ImageNode::default()))
            .id();

        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
        schedule.run(&mut world);

        let s = world.entity(e).get::<ImageNode>().unwrap().color.to_srgba();
        assert!((s.red - 1.0).abs() < 1e-4, "tint rgb follows the binding");
        assert!(s.green.abs() < 1e-4);
        assert!(s.blue.abs() < 1e-4);
        assert!((s.alpha - 0.5).abs() < 1e-4, "opacity owns final alpha");

        // Settled: a second run with unchanged values must not dirty the
        // component (compare-before-write on both stages).
        let tick = world
            .entity(e)
            .get_ref::<ImageNode>()
            .unwrap()
            .last_changed();
        schedule.run(&mut world);
        assert_eq!(
            world
                .entity(e)
                .get_ref::<ImageNode>()
                .unwrap()
                .last_changed(),
            tick,
            "settled re-run leaves ImageNode untouched"
        );
    }

    /// The 2D `rotate` binding takes **degrees** on the wire (matching the
    /// declarative `transform.rotate` position it lives in) and stores
    /// radians in `UiTransform` — same contract as the `transform3d`
    /// rotations.
    #[test]
    fn rotate_binding_converts_degrees_to_radians() {
        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(1, 90.0); // degrees
        world.insert_resource(values);

        let bindings = style_bindings(serde_json::json!({
            "transform": { "rotate": { "animated": { "id": 1 } } },
        }));
        let e = world
            .spawn((AnimatedNode(bindings), UiTransform::default()))
            .id();

        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
        schedule.run(&mut world);

        let t = world.entity(e).get::<UiTransform>().unwrap();
        assert!(
            (t.rotation.as_radians() - std::f32::consts::FRAC_PI_2).abs() < 1e-5,
            "90° on the wire → π/2 stored, got {}",
            t.rotation.as_radians()
        );
    }

    /// A layout length lands on `Node` (as px); a `borderColor` binding inserts a
    /// `BorderColor` on all sides when absent; and a re-render that resets `Node`
    /// is corrected on the next apply (the compare-before-write re-applies because
    /// the live value differs from the still-active binding's value).
    #[test]
    fn apply_drives_node_length_and_border_color() {
        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(10, 200.0); // width (px)
        values.set(11, 0.0); // border-color progress → output[0] = green
        world.insert_resource(values);

        let bindings = style_bindings(serde_json::json!({
            "width": { "animated": { "id": 10 } },
            "borderColor": { "animated": { "type": "interpolateColor", "id": 11,
                "input": [0, 1], "output": [[0, 1, 0, 1], [1, 0, 0, 1]] } },
        }));

        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                Node::default(),
            ))
            .id();

        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
        schedule.run(&mut world);

        assert_eq!(world.entity(e).get::<Node>().unwrap().width, Val::Px(200.0));
        let bc = world.entity(e).get::<BorderColor>().unwrap();
        let s = bc.top.to_srgba();
        assert!(
            s.green > 0.9 && s.red < 0.1,
            "border resolved to green, got {s:?}"
        );
        assert_eq!(bc.left, bc.top, "all four sides set uniformly");

        // A re-render resets the static width; the still-active binding re-applies.
        world.entity_mut(e).get_mut::<Node>().unwrap().width = Val::Px(100.0);
        schedule.run(&mut world);
        assert_eq!(
            world.entity(e).get::<Node>().unwrap().width,
            Val::Px(200.0),
            "binding re-applies after a re-render reset"
        );
    }

    /// Once every bound shared value has settled, the apply system must stop
    /// marking the target components changed — otherwise every `Animated.node`
    /// keeps Bevy's transform propagation / render extraction hot forever.
    #[test]
    fn settled_apply_does_not_dirty_components() {
        #[derive(Resource, Default)]
        struct Dirty(usize);

        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(1, 25.0); // translateX (px)
        values.set(2, 0.5); // opacity
        values.set(3, 0.0); // color progress
        world.insert_resource(values);
        world.init_resource::<Dirty>();

        let bindings = style_bindings(serde_json::json!({
            "transform": { "translateX": { "animated": { "id": 1 } } },
            "opacity": { "animated": { "id": 2 } },
            "backgroundColor": { "animated": { "type": "interpolateColor", "id": 3,
                "input": [0, 1], "output": [[1, 0, 0, 1], [0, 0, 1, 1]] } },
            "width": { "animated": { "id": 1 } },
        }));

        world.spawn((
            AnimatedNode(bindings),
            UiTransform::default(),
            BackgroundColor(Color::WHITE),
            Node::default(),
        ));

        type AnyTargetChanged = Or<(
            Changed<UiTransform>,
            Changed<BackgroundColor>,
            Changed<Node>,
        )>;

        let mut apply = Schedule::default();
        apply.add_systems(apply_animated_nodes);
        // A separate schedule so the detector's change ticks span exactly one
        // apply run (Changed<> is relative to the detector's own last run).
        let mut detect = Schedule::default();
        detect.add_systems(|q: Query<(), AnyTargetChanged>, mut dirty: ResMut<Dirty>| {
            dirty.0 = q.iter().count();
        });

        apply.run(&mut world);
        detect.run(&mut world);
        assert!(
            world.resource::<Dirty>().0 > 0,
            "first apply must write the bound components"
        );

        apply.run(&mut world);
        detect.run(&mut world);
        assert_eq!(
            world.resource::<Dirty>().0,
            0,
            "an apply with settled values must not dirty anything"
        );
    }

    // -- per-param filter bindings (stage 4) ---------------------------------

    // -- transform3d bindings (stage 1b) -------------------------------------

    /// `transform3d.<field>` bindings overwrite their field over the static
    /// params (unbound fields untouched), convert rotation degrees to stored
    /// radians, and settle without re-dirtying the component.
    #[test]
    fn transform3d_bindings_drive_layer_params() {
        use crate::layer::transform3d::LayerTransform3d;
        use crate::protocol::Transform3d;

        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(1, 90.0); // rotateY, degrees on the wire
        world.insert_resource(values);

        let bindings = style_bindings(serde_json::json!({
            "transform3d": { "rotateY": { "animated": { "id": 1 } } },
        }));
        assert!(bindings.has_transform3d());
        assert!(!bindings.has_transform(), "distinct from the 2D group");

        let static_params = Transform3d {
            perspective: Some(crate::protocol::Animatable::Static(500.0)),
            ..Default::default()
        };
        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                LayerTransform3d(static_params),
            ))
            .id();

        let mut apply = Schedule::default();
        apply.add_systems(apply_animated_nodes);
        apply.run(&mut world);
        let t = world.entity(e).get::<LayerTransform3d>().unwrap().0.clone();
        assert_eq!(
            t.rotate_y.static_val().unwrap().radians(),
            std::f32::consts::FRAC_PI_2,
            "degrees on the wire, radians stored"
        );
        assert_eq!(
            t.perspective.static_val(),
            Some(500.0),
            "unbound fields keep the base"
        );

        // Settled value → no change-detection churn on re-apply.
        let tick_before = world.entity(e).get_ref::<LayerTransform3d>().unwrap();
        let last = tick_before.last_changed();
        apply.run(&mut world);
        let tick_after = world.entity(e).get_ref::<LayerTransform3d>().unwrap();
        assert_eq!(
            tick_after.last_changed(),
            last,
            "a settled binding must not re-mark the params changed"
        );
    }

    /// Mixed bindings decode and iterate deterministically: the `BTreeMap`
    /// orders by variant declaration order, `FilterParam` last (by index,
    /// then name).
    #[test]
    fn bindings_with_filter_params_iterate_deterministically() {
        use AnimatableProperty as P;
        let bindings = style_bindings(serde_json::json!({
            "filter": [
                { "name": "blur", "params": { "radius": { "animated": { "id": 2 } } } },
                { "name": "grayscale" },
                { "name": "custom", "params": { "b": { "animated": { "id": 1 } } } },
            ],
            "opacity": { "animated": { "id": 3 } },
            "transform": { "scale": { "animated": { "id": 4 } } },
        }));
        assert!(bindings.has_filter_params());
        assert!(bindings.has_transform());
        let keys: Vec<_> = bindings.iter().map(|(p, _)| p.clone()).collect();
        assert_eq!(
            keys,
            vec![
                P::Scale,
                P::Opacity,
                P::FilterParam {
                    index: 0,
                    name: "radius".into()
                },
                P::FilterParam {
                    index: 2,
                    name: "b".into()
                },
            ]
        );
    }

    fn slot(
        name: &'static str,
        kind: ValueKind,
        vec: usize,
        comp: usize,
        len: usize,
    ) -> crate::filters::ParamSlot {
        crate::filters::ParamSlot {
            name,
            kind,
            vec,
            comp,
            len,
        }
    }

    fn pass(
        wire_index: u8,
        params: Vec<Vec4>,
        layout: Vec<crate::filters::ParamSlot>,
    ) -> crate::filters::ResolvedFilterPass {
        crate::filters::ResolvedFilterPass {
            shader: Handle::default(),
            params,
            layout: std::sync::Arc::from(layout),
            wire_index,
        }
    }

    fn chain(
        passes: Vec<crate::filters::ResolvedFilterPass>,
        scale: f32,
    ) -> crate::filters::ResolvedFilterChain {
        crate::filters::ResolvedFilterChain {
            passes,
            outset_px: 0,
            always_dirty: false,
            version: 1,
            scale,
        }
    }

    fn filter_world(value: f32) -> (World, Schedule) {
        let mut world = World::new();
        world.init_resource::<crate::layer::LayerContentDirt>();
        let mut values = SharedValues::default();
        values.set(1, value);
        world.insert_resource(values);
        let mut schedule = Schedule::default();
        schedule.add_systems(apply_animated_nodes);
        (world, schedule)
    }

    fn drain_dirt(world: &mut World) {
        let mut dirt = world.resource_mut::<crate::layer::LayerContentDirt>();
        dirt.nodes.clear();
        dirt.composite_only.clear();
    }

    /// A bound scalar param follows the shared value: the packed component
    /// updates, the version bumps once per changed frame, dirt is
    /// composite-only (never capture), and a settled value goes quiet. A
    /// mid-animation chain rebuild (the resolver snapping the params back)
    /// is re-asserted on the next apply — the scar-test mechanism.
    #[test]
    fn filter_param_binding_drives_scalar_slot_composite_only() {
        let (mut world, mut schedule) = filter_world(0.25);
        let bindings = filter_bindings(&[(0, "amount", Binding::Shared { id: 1 })]);
        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                chain(
                    vec![pass(
                        0,
                        vec![Vec4::new(1.0, 0.0, 0.0, 0.0)],
                        vec![slot("amount", ValueKind::Scalar, 0, 0, 1)],
                    )],
                    1.0,
                ),
            ))
            .id();

        schedule.run(&mut world);
        {
            let c = world
                .entity(e)
                .get::<crate::filters::ResolvedFilterChain>()
                .unwrap();
            assert_eq!(c.passes[0].params[0].x, 0.25, "param follows the value");
            assert_eq!(c.version, 2, "one bump per changed frame");
        }
        let dirt = world.resource::<crate::layer::LayerContentDirt>();
        assert_eq!(dirt.composite_only, vec![e], "composite-only dirt");
        assert!(dirt.nodes.is_empty(), "the capture is never dirtied");

        // Settled: no version churn, no dirt.
        drain_dirt(&mut world);
        schedule.run(&mut world);
        {
            let c = world
                .entity(e)
                .get::<crate::filters::ResolvedFilterChain>()
                .unwrap();
            assert_eq!(c.version, 2, "settled value is version-quiet");
        }
        let dirt = world.resource::<crate::layer::LayerContentDirt>();
        assert!(dirt.composite_only.is_empty() && dirt.nodes.is_empty());

        // A re-resolve snapped the param back to the static style: the
        // binding re-asserts on the next apply.
        {
            let mut em = world.entity_mut(e);
            let mut c = em.get_mut::<crate::filters::ResolvedFilterChain>().unwrap();
            c.passes[0].params[0].x = 1.0;
            c.version = c.version.wrapping_add(1); // 3
        }
        schedule.run(&mut world);
        let c = world
            .entity(e)
            .get::<crate::filters::ResolvedFilterChain>()
            .unwrap();
        assert_eq!(c.passes[0].params[0].x, 0.25, "binding re-asserts");
        assert_eq!(c.version, 4);
    }

    /// A binding addresses a WIRE chain position: every resolved pass with
    /// that `wire_index` gets the write (blur's H+V), other positions stay
    /// untouched; `Length` slots are applied as logical px × the chain's
    /// scale (the resolver's physical-px rewrite).
    #[test]
    fn filter_param_binding_routes_wire_index_and_scales_lengths() {
        let (mut world, mut schedule) = filter_world(5.0);
        let bindings = filter_bindings(&[(0, "radius", Binding::Shared { id: 1 })]);
        let radius_layout = || vec![slot("radius", ValueKind::Length, 0, 0, 1)];
        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                chain(
                    vec![
                        pass(0, vec![Vec4::new(20.0, 1.0, 0.0, 0.0)], radius_layout()),
                        pass(0, vec![Vec4::new(20.0, 0.0, 1.0, 0.0)], radius_layout()),
                        pass(1, vec![Vec4::new(20.0, 0.0, 0.0, 0.0)], radius_layout()),
                    ],
                    2.0,
                ),
            ))
            .id();

        schedule.run(&mut world);
        let c = world
            .entity(e)
            .get::<crate::filters::ResolvedFilterChain>()
            .unwrap();
        assert_eq!(c.passes[0].params[0].x, 10.0, "H pass: 5 logical × 2");
        assert_eq!(c.passes[1].params[0].x, 10.0, "V pass too");
        assert_eq!(c.passes[0].params[0].y, 1.0, "direction untouched");
        assert_eq!(c.passes[2].params[0].x, 20.0, "other wire entry untouched");
    }

    /// `Angle` slots take the bound value in DEGREES (the param's wire unit)
    /// and pack radians; `Color` slots take an `interpolateColor` binding and
    /// write all four components.
    #[test]
    fn filter_param_binding_converts_angle_and_writes_color() {
        let (mut world, mut schedule) = filter_world(90.0);
        world.resource_mut::<SharedValues>().set(2, 0.0);
        let bindings = filter_bindings(&[
            (0, "angle", Binding::Shared { id: 1 }),
            (
                0,
                "tint",
                Binding::InterpolateColor {
                    id: 2,
                    input: vec![0.0, 1.0],
                    output: vec![[1.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0]],
                },
            ),
        ]);
        let e = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                chain(
                    vec![pass(
                        0,
                        vec![Vec4::ZERO, Vec4::ZERO],
                        vec![
                            slot("angle", ValueKind::Angle, 0, 0, 1),
                            slot("tint", ValueKind::Color, 1, 0, 4),
                        ],
                    )],
                    1.0,
                ),
            ))
            .id();

        schedule.run(&mut world);
        let c = world
            .entity(e)
            .get::<crate::filters::ResolvedFilterChain>()
            .unwrap();
        assert!(
            (c.passes[0].params[0].x - std::f32::consts::FRAC_PI_2).abs() < 1e-6,
            "90° packs as π/2 radians, got {}",
            c.passes[0].params[0].x
        );
        assert_eq!(
            c.passes[0].params[1],
            Vec4::new(1.0, 0.0, 0.0, 1.0),
            "color slot takes all four components"
        );
    }

    /// Bind-time validation: an unknown param name, an out-of-range index, a
    /// multi-component scalar slot, and a missing chain each warn
    /// (`filterBinding`, attributed to the node) exactly once — not per frame
    /// — and the binding stays inert. A chain re-resolve re-validates.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn filter_param_validation_warns_once_and_stays_inert() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut world, mut schedule) = filter_world(1.0);
        let bindings = filter_bindings(&[
            (0, "nope", Binding::Shared { id: 1 }),
            (3, "amount", Binding::Shared { id: 1 }),
            (0, "dir", Binding::Shared { id: 1 }),
        ]);
        let e = world
            .spawn((
                AnimatedNode(bindings.clone()),
                UiTransform::default(),
                crate::bridge::RNode(9),
                chain(
                    vec![pass(
                        0,
                        vec![Vec4::new(0.5, 0.0, 0.0, 0.0)],
                        vec![
                            slot("amount", ValueKind::Scalar, 0, 0, 1),
                            slot("dir", ValueKind::Scalar, 0, 1, 2),
                        ],
                    )],
                    1.0,
                ),
            ))
            .id();

        schedule.run(&mut world);
        {
            let c = world
                .entity(e)
                .get::<crate::filters::ResolvedFilterChain>()
                .unwrap();
            assert_eq!(
                c.passes[0].params[0],
                Vec4::new(0.5, 0.0, 0.0, 0.0),
                "inert"
            );
            assert_eq!(c.version, 1, "no version churn from inert bindings");
        }
        let warns = crate::diag::take_runtime_warnings();
        let mine: Vec<_> = warns.iter().filter(|w| w.node == Some(9)).collect();
        assert_eq!(mine.len(), 3, "{warns:?}");
        assert!(mine.iter().all(|w| w.kind == "filterBinding"));
        let values: Vec<_> = mine.iter().map(|w| w.value.as_str()).collect();
        assert!(values.contains(&"filter[0].nope"), "{values:?}");
        assert!(values.contains(&"filter[3].amount"), "{values:?}");
        assert!(values.contains(&"filter[0].dir"), "{values:?}");

        // Steady state: no re-warn.
        schedule.run(&mut world);
        assert!(
            crate::diag::take_runtime_warnings()
                .iter()
                .all(|w| w.node != Some(9)),
            "validation warnings must not repeat per frame"
        );

        // A chain re-resolve (version bump) re-validates.
        world
            .entity_mut(e)
            .get_mut::<crate::filters::ResolvedFilterChain>()
            .unwrap()
            .version = 7;
        schedule.run(&mut world);
        let refires = crate::diag::take_runtime_warnings()
            .iter()
            .filter(|w| w.node == Some(9))
            .count();
        assert_eq!(refires, 3, "a re-resolved chain re-validates");

        // No chain at all: one warn per filter binding, still inert.
        let e2 = world
            .spawn((
                AnimatedNode(bindings),
                UiTransform::default(),
                crate::bridge::RNode(10),
            ))
            .id();
        schedule.run(&mut world);
        let chainless = crate::diag::take_runtime_warnings()
            .iter()
            .filter(|w| w.node == Some(10))
            .count();
        assert_eq!(chainless, 3, "chainless node warns per binding");
        assert!(
            world
                .entity(e2)
                .get::<crate::filters::ResolvedFilterChain>()
                .is_none()
        );

        // Mixed: a VALID binding actively animating (the shared value changes
        // every frame, so stage 4 itself bumps the chain `version` every
        // frame) next to an invalid binding on the same node. The validation
        // stamp stores the POST-write version, so stage 4's own bump never
        // reads as a re-resolve — the invalid binding warns exactly once, not
        // once per animated frame.
        let mixed = filter_bindings(&[
            (0, "amount", Binding::Shared { id: 1 }),
            (0, "nope", Binding::Shared { id: 1 }),
        ]);
        let e3 = world
            .spawn((
                AnimatedNode(mixed),
                UiTransform::default(),
                crate::bridge::RNode(11),
                chain(
                    vec![pass(
                        0,
                        vec![Vec4::ZERO],
                        vec![slot("amount", ValueKind::Scalar, 0, 0, 1)],
                    )],
                    1.0,
                ),
            ))
            .id();
        for (frame, v) in [0.1f32, 0.2, 0.3, 0.4].into_iter().enumerate() {
            world.resource_mut::<SharedValues>().set(1, v);
            schedule.run(&mut world);
            let version = world
                .entity(e3)
                .get::<crate::filters::ResolvedFilterChain>()
                .unwrap()
                .version;
            assert_eq!(
                version as usize,
                2 + frame,
                "the valid binding writes (bumps version) every animated frame"
            );
        }
        let warns = crate::diag::take_runtime_warnings();
        let mine: Vec<_> = warns.iter().filter(|w| w.node == Some(11)).collect();
        assert_eq!(
            mine.len(),
            1,
            "an animating valid binding must not re-warn the invalid one per frame: {warns:?}"
        );
        assert_eq!(mine[0].value, "filter[0].nope");
    }
}
