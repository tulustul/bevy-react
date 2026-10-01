//! The virtual-pointer event path: clicks, pointer/drag, hover, and
//! interaction styling for UI a feature drives with its own picking pointer
//! ([`VirtualPointers`] — a `<surface>`'s offscreen subtree). Such nodes never
//! receive a legacy `Interaction` (their offscreen camera makes
//! `ui_focus_system` skip them), so everything here rides the virtual
//! pointers' picking events instead — deliberately mirroring the main-window
//! collectors in `events.rs`/`pointer.rs`/`interaction.rs` rather than
//! sharing their code: each side's attribution quirks are documented on its
//! own systems.

use bevy::picking::events::{Click, Drag, Enter, Leave, Pointer, Press, Release};
use bevy::picking::pointer::PointerButton;
use bevy::platform::collections::HashSet;
use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};

use super::events::{climb, dom_button, send_ui_event, surface_relative};
use crate::bridge::{JsBridge, PointerHandlers, ReactNode, StyleVariants};
use crate::ext::VirtualPointers;
use crate::style::Style;
use crate::ui_map::{apply_style, overlay_style};

/// Report virtual-pointer clicks to JS — the analogue of
/// [`collect_ui_events`](crate::reconcile::collect_ui_events) for UI a
/// registered virtual pointer drives (a `<surface>`'s in-world picking path
/// moves one over the offscreen subtree, so a click there arrives as a
/// `Pointer<Click>` for that pointer; the nodes never get a legacy
/// `Interaction` press, since they don't render to a window).
/// Primary-button-only like it, and scoped to the registered
/// [`VirtualPointers`] so it never double-fires for main-window UI.
pub fn collect_virtual_clicks(
    bridge: Res<JsBridge>,
    pointers: Res<VirtualPointers>,
    mut clicks: MessageReader<Pointer<Click>>,
    // Click ownership (see [`ClickOwners`](super::events::ClickOwners)) —
    // matching `collect_ui_events`' attribution exactly (NOT `Interaction`:
    // hover/press styling must never steal a click from an ancestor with a
    // real handler).
    targets: Query<&ReactNode, super::events::ClickOwners>,
    child_of: Query<&ChildOf>,
) {
    if pointers.is_empty() {
        return;
    }
    // A pass-through node stacked over the target makes one gesture fan out to
    // every entity in the hover map. Same no-bubbling rule as
    // `collect_ui_events`: only the topmost resolving hit (smallest
    // `HitData.depth` — hover-map message order is arbitrary) owns the click.
    let mut topmost: Option<(f32, Entity)> = None;
    for ev in clicks.read() {
        // Like DOM `click` (and `collect_ui_events`), only the primary button
        // clicks; right/middle ride the `onPointer*` events.
        if !pointers.contains(ev.pointer_id) || ev.button != PointerButton::Primary {
            continue;
        }
        // Resolve the picked leaf to the nearest interactive ancestor (the button),
        // so a click on its label text still fires the button's handler.
        if let Some(target) = climb(ev.entity, &child_of, |e| targets.contains(e))
            && !topmost.is_some_and(|(depth, _)| depth <= ev.hit.depth)
        {
            topmost = Some((ev.hit.depth, target));
        }
    }
    if let Some((_, target)) = topmost
        && let Ok(rnode) = targets.get(target)
    {
        tracing::debug!("virtual-pointer click -> reconciler node {}", rnode.0);
        send_ui_event(&bridge, rnode.0, "click", None, None, None);
    }
}

/// Report `onPointer*` drag events for virtual-pointer UI, mirroring
/// [`collect_pointer_events`](crate::reconcile::collect_pointer_events) for the
/// in-world picking path. Press → `pointerDown`,
/// drag → `pointerMove`, release → `pointerUp`, each gated on the node's declared
/// [`PointerHandlers`], carrying the cursor's node-relative `0..1` position
/// (the surface-space pixel as `client_x/y`) and the mouse button (a `Drag`'s
/// button is the one doing the dragging).
#[allow(clippy::too_many_arguments)]
pub fn collect_virtual_pointer_events(
    bridge: Res<JsBridge>,
    pointers: Res<VirtualPointers>,
    mut presses: MessageReader<Pointer<Press>>,
    mut releases: MessageReader<Pointer<Release>>,
    mut drags: MessageReader<Pointer<Drag>>,
    nodes: Query<(
        &ReactNode,
        &PointerHandlers,
        &ComputedNode,
        &UiGlobalTransform,
    )>,
    child_of: Query<&ChildOf>,
) {
    if pointers.is_empty() {
        return;
    }
    // Per-kind (owner, button) dedupe: a pass-through node stacked over the
    // target fans each gesture out to every hovered entity, and climbing can
    // resolve them to the same owner. (Moves see at most one `Drag` per button
    // per frame — a virtual pointer's driver emits at most one `Move` per frame —
    // so the set never suppresses a genuine repeat.)
    let mut seen: HashSet<(Entity, PointerButton)> = HashSet::new();
    let emit = |entity: Entity,
                want: fn(&PointerHandlers) -> bool,
                kind: &str,
                at: Vec2,
                button: PointerButton,
                seen: &mut HashSet<(Entity, PointerButton)>| {
        // Resolve the picked leaf to the nearest ancestor that declared `onPointer*`.
        if let Some(target) = climb(entity, &child_of, |e| nodes.contains(e))
            && seen.insert((target, button))
            && let Ok((rnode, handlers, node, transform)) = nodes.get(target)
            && want(handlers)
            && let Some((pos, abs)) = surface_relative(node, transform, at)
        {
            send_ui_event(
                &bridge,
                rnode.0,
                kind,
                Some(pos),
                Some(abs),
                Some(dom_button(button)),
            );
        }
    };
    for ev in presses.read() {
        if pointers.contains(ev.pointer_id) {
            emit(
                ev.entity,
                |h| h.down,
                "pointerDown",
                ev.pointer_location.position,
                ev.button,
                &mut seen,
            );
        }
    }
    seen.clear();
    for ev in drags.read() {
        if pointers.contains(ev.pointer_id) {
            emit(
                ev.entity,
                |h| h.moved,
                "pointerMove",
                ev.pointer_location.position,
                ev.button,
                &mut seen,
            );
        }
    }
    seen.clear();
    for ev in releases.read() {
        if pointers.contains(ev.pointer_id) {
            emit(
                ev.entity,
                |h| h.up,
                "pointerUp",
                ev.pointer_location.position,
                ev.button,
                &mut seen,
            );
        }
    }
}

/// Report `pointerEnter` / `pointerLeave` for virtual-pointer UI, mirroring
/// [`collect_virtual_pointer_events`] for the hover boundary. Such nodes get no
/// legacy `Interaction`, so this reads the virtual pointer's `Pointer<Enter>` /
/// `Pointer<Leave>` picking events. Those already implement DOM
/// `mouseenter`/`mouseleave` semantics — they fire for the hovered entity *and*
/// its ancestors, only on true boundary crossings — so no climb (and no dedupe)
/// is needed, and crossing between a button's label and its padding never
/// re-fires the button's boundary. Hover events carry no button.
pub fn collect_virtual_hover_events(
    bridge: Res<JsBridge>,
    pointers: Res<VirtualPointers>,
    mut enters: MessageReader<Pointer<Enter>>,
    mut leaves: MessageReader<Pointer<Leave>>,
    nodes: Query<(
        &ReactNode,
        &PointerHandlers,
        &ComputedNode,
        &UiGlobalTransform,
    )>,
) {
    if pointers.is_empty() {
        return;
    }
    let emit = |entity: Entity, want: fn(&PointerHandlers) -> bool, kind: &str, at: Vec2| {
        if let Ok((rnode, handlers, node, transform)) = nodes.get(entity)
            && want(handlers)
            && let Some((pos, abs)) = surface_relative(node, transform, at)
        {
            send_ui_event(&bridge, rnode.0, kind, Some(pos), Some(abs), None);
        }
    };
    for ev in enters.read() {
        if pointers.contains(ev.pointer_id) {
            emit(
                ev.entity,
                |h| h.enter,
                "pointerEnter",
                ev.pointer_location.position,
            );
        }
    }
    for ev in leaves.read() {
        if pointers.contains(ev.pointer_id) {
            emit(
                ev.entity,
                |h| h.leave,
                "pointerLeave",
                ev.pointer_location.position,
            );
        }
    }
}

/// Apply hover/press [`StyleVariants`] to virtual-pointer UI (a `<surface>`'s
/// subtree) from its picking path — the analogue of
/// [`apply_interaction_styles`](crate::reconcile::apply_interaction_styles), which
/// can't help here because such nodes never receive a legacy `Interaction`
/// (their offscreen camera makes `ui_focus_system` skip them). Enter →
/// base+hover, press → base+hover+press, leave/release → base/hover. The hover
/// axis rides `Pointer<Enter>`/`Pointer<Leave>` (boundary-only, ancestor-aware —
/// see [`collect_virtual_hover_events`]); the press axis keeps `Press`/`Release`
/// with the climb, filtered to the primary button so a right/middle press
/// doesn't trigger `pressStyle` (DOM `:active` parity with the main window's
/// `Interaction::Pressed`).
#[allow(clippy::too_many_arguments)]
pub fn apply_virtual_interaction_styles(
    mut commands: Commands,
    pointers: Res<VirtualPointers>,
    mut enters: MessageReader<Pointer<Enter>>,
    mut leaves: MessageReader<Pointer<Leave>>,
    mut presses: MessageReader<Pointer<Press>>,
    mut releases: MessageReader<Pointer<Release>>,
    variants: Query<&StyleVariants>,
    child_of: Query<&ChildOf>,
    rnodes: Query<&ReactNode>,
    flags: Query<&crate::ext::ElementFlags>,
    assets: Res<AssetServer>,
    // `Option`: headless harnesses build partial apps without the bridge
    // (and some without the fonts resource).
    bridge: Option<Res<crate::bridge::JsBridge>>,
    fonts: Option<Res<crate::plugin::Fonts>>,
) {
    if pointers.is_empty() {
        return;
    }
    let default_fonts = crate::plugin::Fonts::default();
    let fonts = fonts.as_deref().unwrap_or(&default_fonts);
    let styles: &crate::style::StyleRegistry = match bridge.as_ref() {
        Some(b) => b.ext.styles(),
        None => crate::style::core_registry(),
    };
    let mut restyle = |entity: Entity, style: Option<Style>| {
        // Attribute re-parse warnings (e.g. a bad hoverStyle color) to the node.
        let rnode = rnodes.get(entity).ok();
        let _diag = rnode.map(|r| crate::diag::node_scope(r.0));
        let kind = match (bridge.as_ref(), rnode) {
            (Some(b), Some(r)) => b.shared_tags.kind_cow(r.0),
            _ => std::borrow::Cow::Borrowed("node"),
        };
        let registry = bridge.as_ref().map(|b| b.ext.clone());
        let fallback;
        let info = match registry.as_ref() {
            Some(r) => r.element_or_fallback(&kind),
            None => {
                fallback = crate::ext::core_element_info(&kind)
                    .or_else(|| crate::ext::core_element_info("node"))
                    .expect("the core registers <node>");
                &fallback
            }
        };
        let attrs = match (bridge.as_ref(), rnode) {
            (Some(b), Some(r)) => b.props_cache.get(&r.0).map(|p| &p.attrs),
            _ => None,
        }
        .unwrap_or(crate::element::Attrs::empty());
        // Virtual-pointer UI (offscreen interiors) is never a promoted layer.
        let wctx = crate::style::WriterCtx {
            promoted: false,
            fresh: false,
            kind: &kind,
            flags: flags.get(entity).copied().unwrap_or(info.decl.flags),
            assets: &assets,
            fonts,
            styles,
            element: info,
            attrs,
            events: crate::element::Attrs::empty(),
            id: rnode.map_or(0, |r| r.0),
        };
        apply_style(&mut commands.entity(entity), &style, &wctx);
    };
    // Resolve a picked leaf to the nearest ancestor with hover/press variants (the
    // button), so its label text highlights the button rather than nothing.
    let target = |entity: Entity| climb(entity, &child_of, |e| variants.contains(e));
    for ev in leaves.read() {
        if pointers.contains(ev.pointer_id)
            && let Ok(v) = variants.get(ev.entity)
        {
            restyle(ev.entity, v.base.as_ref().cloned());
        }
    }
    for ev in enters.read() {
        if pointers.contains(ev.pointer_id)
            && let Ok(v) = variants.get(ev.entity)
        {
            restyle(ev.entity, overlay_style(v.base.as_ref(), v.hover.as_ref()));
        }
    }
    for ev in releases.read() {
        if pointers.contains(ev.pointer_id)
            && ev.button == PointerButton::Primary
            && let Some(t) = target(ev.entity)
            && let Ok(v) = variants.get(t)
        {
            restyle(t, overlay_style(v.base.as_ref(), v.hover.as_ref()));
        }
    }
    for ev in presses.read() {
        if pointers.contains(ev.pointer_id)
            && ev.button == PointerButton::Primary
            && let Some(t) = target(ev.entity)
            && let Ok(v) = variants.get(t)
        {
            let pressed = overlay_style(
                overlay_style(v.base.as_ref(), v.hover.as_ref()).as_ref(),
                v.press.as_ref(),
            );
            restyle(t, pressed);
        }
    }
}
