//! The element slot: feature-owned element kinds (the create-op `kind`
//! strings a feature crate's JSX intrinsics mount as).
//!
//! The bridge's create/update paths dispatch on `kind`: the built-in kinds
//! first (`node`, `text`, `image`, …), then the registry. A registered
//! handler spawns the entity through an [`ElementCtx`] — a curated view of
//! the reconciler's stamps (the style bundle, the common prop stamps, the
//! blank raster placeholder) — and gets its own [`ElementKind::update`] call
//! on every delta. Its [`ElementFlags`] tell the shared systems what the
//! entity is; a `node_less` kind skips the generic styled-node update path
//! entirely (the handler owns every prop), any other kind gets the generic
//! path first and the handler's update after it.

use bevy::asset::{Assets, Handle};
use bevy::ecs::entity::Entity;
use bevy::ecs::system::{Commands, EntityCommands};
use bevy::image::Image;
use bevy::platform::collections::HashSet;
use bevy::ui::FocusPolicy;

use super::ElementFlags;
use crate::protocol::{NodeId, props::Props, props::PropsDirty};

/// A feature-owned element kind (or family of kinds). Register with
/// `add_react_element`; every name in [`kinds`](Self::kinds) then dispatches
/// to this handler.
pub trait ElementKind: Send + Sync + 'static {
    /// The create-op `kind` strings this handler owns. A name already taken
    /// (a built-in, or another handler's) panics at registration.
    fn kinds(&self) -> &'static [&'static str];

    /// The [`ElementFlags`] of `kind`.
    fn flags(&self, kind: &str) -> ElementFlags;

    /// Spawn the entity for a create op of `kind`. `text` is the inline
    /// single-string child, when the element takes one.
    fn spawn(
        &self,
        ctx: &mut ElementCtx<'_, '_, '_>,
        kind: &str,
        props: &Props,
        text: Option<&str>,
    ) -> bevy::ecs::entity::Entity;

    /// Apply a delta to an existing element of `kind`: `props` is the merged
    /// full props, `dirty` what the delta touched. For a `node_less` kind
    /// this is the whole update; otherwise the generic styled-node path has
    /// already run and this handles the feature's own keys.
    fn update(
        &self,
        ctx: &mut ElementUpdateCtx<'_>,
        ec: &mut EntityCommands,
        kind: &str,
        props: &Props,
        dirty: &PropsDirty,
    );
}

/// What a handler's [`ElementKind::spawn`] works with: the commands, the
/// image assets (for an element-owned texture), and the reconciler's stamps
/// exposed as methods. Every stamp is the fresh-path variant (a fresh entity
/// has nothing to remove) and addresses the entity by id, so a handler
/// interleaves its own `ctx.commands.entity(e).insert(…)` freely.
pub struct ElementCtx<'a, 'w, 's> {
    pub commands: &'a mut Commands<'w, 's>,
    pub images: &'a mut Assets<Image>,
    pub(crate) animated: &'a mut HashSet<NodeId>,
    pub(crate) anchors: &'a mut crate::anchor::AnchorIndex,
    /// The node id being created.
    pub id: NodeId,
}

impl<'w, 's> ElementCtx<'_, 'w, 's> {
    /// Spawn a styled node: the bridge identity, the always-present style
    /// components, and the rest of `props.style` applied. `focus_default` is
    /// the `focusPolicy` an unset style falls back to.
    pub fn spawn_styled(&mut self, props: &Props, focus_default: FocusPolicy) -> Entity {
        let mut ec = self.commands.spawn((
            crate::bridge::ReactNode(self.id),
            crate::ui_map::fresh_style_bundle(&props.style, focus_default),
        ));
        crate::ui_map::apply_style_fresh(&mut ec, &props.style);
        ec.id()
    }

    /// Spawn a `Node`-less entity carrying only the bridge identity (a shape,
    /// a span): no style, no layout box.
    pub fn spawn_bare(&mut self) -> Entity {
        self.commands.spawn(crate::bridge::ReactNode(self.id)).id()
    }

    /// The common prop stamps of a styled element: hover/press/focus
    /// variants, pointer handlers, `{ animated }` bindings, `anchor`, and
    /// the scroll listeners.
    pub fn stamp_common(&mut self, entity: Entity, props: &Props) {
        let mut ec = self.commands.entity(entity);
        crate::reconcile::stamps::stamp_common(
            &mut ec,
            self.animated,
            self.anchors,
            self.id,
            props,
        );
    }

    /// The pointer-handler stamps alone (`onClick`/`onPointer*` →
    /// `Interaction` + `RelativeCursorPosition` + the handler record).
    pub fn stamp_pointer_handlers(&mut self, entity: Entity, props: &Props) {
        let mut ec = self.commands.entity(entity);
        crate::reconcile::stamps::apply_pointer_handlers(&mut ec, props);
    }

    /// The `{ animated }` binding stamp alone (an `AnimatedNode` when any
    /// style field or feature value carries a binding).
    pub fn stamp_animated(&mut self, entity: Entity, props: &Props) {
        let mut ec = self.commands.entity(entity);
        crate::reconcile::stamps::apply_animated_fresh(&mut ec, self.animated, self.id, props);
    }

    /// A fresh 1×1 transparent placeholder texture for an element-owned
    /// raster (the `<canvas>` convention: repainted in place at laid-out size).
    pub fn blank_image(&mut self) -> Handle<Image> {
        self.images.add(crate::raster::blank_canvas_image())
    }
}

/// What a handler's [`ElementKind::update`] works with beyond the entity's
/// commands: the delta-path stamps.
pub struct ElementUpdateCtx<'a> {
    pub(crate) animated: &'a mut HashSet<NodeId>,
    /// The node id being updated.
    pub id: NodeId,
}

impl ElementUpdateCtx<'_> {
    /// Re-derive the `{ animated }` bindings from the merged props: stamps,
    /// retargets, or removes the `AnimatedNode`.
    pub fn stamp_animated(&mut self, ec: &mut EntityCommands, props: &Props) {
        crate::reconcile::stamps::apply_animated(ec, self.animated, self.id, props);
    }

    /// The pointer-handler stamps (delta variant: absent handlers remove
    /// their components).
    pub fn stamp_pointer_handlers(&mut self, ec: &mut EntityCommands, props: &Props) {
        crate::reconcile::stamps::apply_pointer_handlers(ec, props);
    }
}
