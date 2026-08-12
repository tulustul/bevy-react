//! The `Op::Create` path: spawn a host element of the op's kind with its
//! style/props, and seed the bridge's per-node bookkeeping (props cache, text
//! styles, editable/surface/root sets, controlled scroll, layer-promotion
//! hints).

use accesskit::Role;
use bevy::a11y::AccessibilityNode;
use bevy::image::Image;
use bevy::input_focus::AutoFocus;
use bevy::input_focus::tab_navigation::TabIndex;
use bevy::prelude::*;
use bevy::text::{EditableText, TextCursorStyle};
use bevy::ui::widget::NodeImageMode;

use super::stamps::{
    apply_anchor, apply_button_focus_default, apply_scroll_listener, apply_scroll_step,
    apply_style_variants, apply_wheel_listener, create_controlled_scroll, queue_pending_selection,
    register_editable_handlers, stamp_common,
};
use super::stats::UiAssets;
use crate::bridge::{CanvasSizeTracker, JsBridge, RNode, SpanKind};
use crate::canvas::{CanvasSurface, blank_canvas_image};
use crate::plugin::Fonts;
use crate::portal::{RPortal, blank_portal_image};
use crate::protocol::{NodeId, props::Props, style::Style};
use crate::surface::RSurface;
use crate::transition::apply_scroll_transition;
use crate::ui_map::{
    AtlasLayoutCache, apply_atlas, apply_style, apply_text_style, image_node, overlay_style,
    resolved_text_style, svg_image_node, text_layout,
};

/// Apply one `Op::Create`: spawn the element for `kind` and record it in the
/// bridge. Extracted from the `apply_js_ops` match; runs once per create op.
#[allow(clippy::too_many_arguments)]
pub(super) fn apply_create(
    commands: &mut Commands,
    bridge: &mut JsBridge,
    assets: &AssetServer,
    fonts: &Fonts,
    images: &mut Assets<Image>,
    ui_assets: &mut UiAssets,
    id: NodeId,
    kind: String,
    props: Props,
    text: Option<String>,
) {
    // Attribute apply-time parse warnings (colors, fonts, …) fired
    // while building this node to its id (see `crate::diag`).
    let _diag = crate::diag::node_scope(id);
    // Resolved once for the four sites that branch on "is this an SVG shape
    // child" (spawn dispatch, `bridge.shapes`, the background-image no-op).
    let shape_kind = crate::svg::ShapeKind::from_kind(&kind);
    let entity = match kind.as_str() {
        // A `<text>` root: a UI node carrying the text block + style.
        // A single-string child rides inline as `text` (no child span).
        "text" => {
            let mut ec = commands.spawn(RNode(id));
            apply_style(&mut ec, &props.style);
            ec.insert(Text::new(text.clone().unwrap_or_default()));
            apply_text_style(&mut ec, &props.style, fonts);
            if let Some(layout) = text_layout(&props.style) {
                ec.insert(layout);
            }
            apply_anchor(&mut ec, &props);
            ec.id()
        }
        // A nested `<text>`: a styled span (no layout box of its own).
        // A single-string child rides inline as `text`.
        "textSpan" => {
            let mut ec = commands.spawn((RNode(id), TextSpan(text.clone().unwrap_or_default())));
            apply_text_style(&mut ec, &props.style, fonts);
            ec.id()
        }
        // A `<canvas>`: a styled node carrying an `ImageNode` whose
        // texture the canvas system paints from the display list. The
        // image stretches to fill the node's laid-out box.
        "canvas" => {
            let handle = images.add(blank_canvas_image());
            let mut node_img = ImageNode::new(handle);
            node_img.image_mode = NodeImageMode::Stretch;
            let mut ec = commands.spawn(RNode(id));
            apply_style(&mut ec, &props.style);
            ec.insert((
                node_img,
                CanvasSurface::new(props.draw.clone().unwrap_or_default()),
                CanvasSizeTracker::default(),
            ));
            stamp_common(&mut ec, &props);
            ec.id()
        }
        // A `<portal>`: a styled node carrying an `ImageNode` whose
        // texture is an offscreen render target the [`crate::portal`]
        // registry owns. Starts on a blank placeholder; `bind_portals`
        // swaps in the real target texture for `target` once it exists.
        "portal" => {
            let handle = images.add(blank_portal_image());
            let mut node_img = ImageNode::new(handle);
            node_img.image_mode = NodeImageMode::Stretch;
            let mut ec = commands.spawn(RNode(id));
            apply_style(&mut ec, &props.style);
            ec.insert((node_img, RPortal(props.target.clone().unwrap_or_default())));
            stamp_common(&mut ec, &props);
            ec.id()
        }
        // A JSX `<svg>`: a styled node with an element-owned texture the
        // svg rasterizer paints from the Node-less `SvgShape` children.
        "svg" => super::svg_ops::create_svg_root(commands, images, id, &props),
        // A `<surface>`: a styled container whose subtree renders into
        // an offscreen image instead of the on-screen UI. It is a
        // **detached UI root** — `crate::surface::bind_surfaces`
        // points its `UiTargetCamera` at the surface's offscreen UI
        // camera, and the child-attach ops keep it out of the
        // on-screen Bevy hierarchy. The root fills the texture by
        // default (user `style` overrides). Pointer/click events on it
        // arrive via the surface picking path (`collect_surface_events`),
        // not the legacy `Interaction` focus path.
        "surface" => {
            let style = overlay_style(&surface_root_base(), &props.style);
            let mut ec = commands.spawn(RNode(id));
            apply_style(&mut ec, &style);
            ec.insert(RSurface(props.target.clone().unwrap_or_default()));
            apply_anchor(&mut ec, &props);
            ec.id()
        }
        // A `<root>`: the screen-space twin of `<surface>` — a styled
        // container that is a **detached UI root** on the default UI
        // camera (no `UiTargetCamera`), for overlays that must float
        // above and stay out of the app's own tree (the devtools
        // panel). The child-attach ops keep it out of the Bevy
        // hierarchy like a surface. It fills the window as a column
        // and sits just above the window tree by default — both from
        // `root_base()`, overlaid by the user's `style`; baking
        // `globalZIndex` into the style (instead of inserting a raw
        // `GlobalZIndex`) means masked re-applies on re-render keep
        // re-asserting it. The root itself never blocks or hovers
        // picking; its children are ordinary pickable nodes.
        "root" => {
            let style = overlay_style(&root_base(), &props.style);
            let mut ec = commands.spawn(RNode(id));
            apply_style(&mut ec, &style);
            ec.insert((crate::bridge::RRoot, Pickable::IGNORE));
            apply_anchor(&mut ec, &props);
            ec.id()
        }
        // An `<editableText>`: a focusable native text input. Bevy's
        // `EditableTextInputPlugin` (registered by `DefaultPlugins`)
        // drives keyboard/focus/cursor/selection/clipboard; we just
        // spawn the widget and observe `TextEditChange` for `onChange`.
        "editableText" => {
            let mut ec = commands.spawn(RNode(id));
            apply_style(&mut ec, &props.style);
            let mut editable = EditableText::new(props.value.as_deref().unwrap_or_default());
            editable.max_characters = props.max_length;
            editable.allow_newlines = props.multiline;
            let (text_color, font, line_height, letter_spacing) =
                resolved_text_style(&props.style, fonts);
            ec.insert((
                editable,
                text_color,
                font,
                line_height,
                letter_spacing,
                TextLayout {
                    linebreak: if props.multiline {
                        LineBreak::WordBoundary
                    } else {
                        LineBreak::NoWrap
                    },
                    ..default()
                },
                // Caret follows the text color so it stays visible on
                // any themed background (the default is a dark slate).
                TextCursorStyle {
                    color: text_color.0,
                    ..default()
                },
                // Focusable via click (the widget's picking observers)
                // and Tab navigation.
                TabIndex(0),
                // Announce as a text field to assistive tech; the live
                // value is kept in sync by `sync_editable_a11y`.
                AccessibilityNode(editable_a11y_node(&props)),
            ));
            // `AutoFocus`'s `on_add` hook focuses the entity once mounted.
            if props.autofocus {
                ec.insert(AutoFocus);
            }
            // `focusStyle` (and any hover/press) — applied Bevy-side as
            // the field's focus/interaction state changes.
            apply_style_variants(&mut ec, &props);
            apply_anchor(&mut ec, &props);
            ec.id()
        }
        // SVG shape kinds (`<circle>`/`<rect>`/…/`<g>`) mount as Node-less
        // `SvgShape` entities — dispatched here so they never fall through
        // to the plain-node `spawn_element` path.
        _ => match shape_kind {
            Some(shape) => super::svg_ops::create_shape(commands, id, shape, &props),
            None => spawn_element(
                commands,
                id,
                &kind,
                &props,
                assets,
                &mut ui_assets.layouts,
                &mut ui_assets.atlas_cache,
            ),
        },
    };
    if matches!(kind.as_str(), "text" | "textSpan") {
        bridge
            .text_styles
            .insert(id, resolved_text_style(&props.style, fonts));
    }
    // A `textSpan` carries its text in a `TextSpan` component, so a later
    // `Op::UpdateText` must update that (not insert a stray `Text`). It is
    // `InlineStyled`: nested `<text>` spans keep their own style.
    if kind == "textSpan" {
        bridge.spans.insert(id, SpanKind::InlineStyled);
    }
    if kind == "editableText" {
        bridge.editable_inputs.insert(id);
        bridge
            .editable_values
            .insert(id, props.value.clone().unwrap_or_default());
        register_editable_handlers(bridge, id, &props);
        queue_pending_selection(bridge, id, props.selection_start, props.selection_end);
    }
    if kind == "surface" {
        bridge.surfaces.insert(id);
    }
    if kind == "root" {
        bridge.roots.insert(id);
    }
    if kind == "svg" {
        bridge.svg_roots.insert(id);
    }
    if shape_kind.is_some() {
        bridge.shapes.insert(id);
    }
    // Controlled scroll + the `onScroll` listener apply to any node
    // (anything with `overflow: scroll`). A `textSpan` or an SVG shape
    // child has no `Node` and so never matches the read-back query —
    // harmless there.
    {
        let mut ec = commands.entity(entity);
        apply_scroll_listener(&mut ec, &props);
        apply_wheel_listener(&mut ec, &props);
        apply_scroll_step(&mut ec, &props);
        apply_scroll_transition(&mut ec, &props.style);
        create_controlled_scroll(bridge, &mut ec, id, &props);
    }
    // `backgroundImage`: applied on any element EXCEPT those whose
    // `ImageNode` belongs to the element itself (image/canvas/portal/svg —
    // the set also guards the update/restyle paths) and `surface` (a detached
    // root with its own branches everywhere). The build needs `assets`, so
    // it can't live in `apply_style` — see `crate::background_image`.
    match kind.as_str() {
        "image" | "canvas" | "portal" | "svg" => {
            bridge.foreign_images.insert(id);
            let element: &'static str = match kind.as_str() {
                "image" => "image",
                "canvas" => "canvas",
                "portal" => "portal",
                "svg" => "svg",
                _ => unreachable!("guarded by the outer arm"),
            };
            crate::background_image::warn_ignored(element, &props);
        }
        "surface" => crate::background_image::warn_ignored("surface", &props),
        // A `textSpan` has no `Node`/box of its own to paint into.
        "textSpan" => {}
        // Neither has an SVG shape child (Node-less, unstyled).
        _ if shape_kind.is_some() => {}
        _ => {
            let mut ec = commands.entity(entity);
            crate::background_image::apply_background_image(
                &mut ec,
                &props.style,
                crate::protocol::style::StyleDirty::ALL,
                false,
                assets,
            );
        }
    }
    bridge.nodes.insert(id, entity);
    // `cache: "always"` and a `filter`/`backdropFilter` chain — base or
    // variant-carried (the promotion union is presence-based, so a
    // hover-only filter promotes eagerly at creation) — promote
    // even a childless node, so no later child op would ever queue
    // the evaluation — do it here. (Opacity-driven promotion needs
    // a child, whose Append marks.) Over-seeding — `cache: "auto"`,
    // an empty chain — is fine: the dirty set is a conservative
    // "evaluate me" hint, the evaluator is authoritative, and a
    // spurious evaluation is cheap.
    if props.style.as_ref().is_some_and(|s| s.cache.is_some())
        || props
            .all_styles()
            .any(|s| s.filter.is_some() || s.backdrop_filter.is_some())
    {
        bridge.layer_dirty.insert(id);
    }
    // Seed the retained props a later update's delta merges into.
    // Event-like fields were consumed by the create itself and are
    // never part of the retained state.
    let (state, _) = props.split_events();
    bridge.props_cache.insert(id, Box::new(state));
}

/// Spawn a `node`, `button`, or `image` host element with its style. Also the
/// landing spot for `anchor` (via `apply_create`'s `_` arm): an `<anchor>` is a
/// plain node whose `anchor` prop `stamp_common` → `apply_anchor` binds.
fn spawn_element(
    commands: &mut Commands,
    id: NodeId,
    kind: &str,
    props: &Props,
    assets: &AssetServer,
    layouts: &mut Assets<TextureAtlasLayout>,
    atlas_cache: &mut AtlasLayoutCache,
) -> Entity {
    let mut ec = commands.spawn(RNode(id));
    apply_style(&mut ec, &props.style);
    match kind {
        // `Button` requires `Interaction`, which is added automatically.
        "button" => {
            ec.insert(Button);
            // Buttons capture the pointer by default; `apply_style` already
            // defaulted this entity to `Pass`, so override unless the prop is set.
            apply_button_focus_default(&mut ec, &props.style);
        }
        // An `.svg` src (case-insensitive) enters **svg mode**: the texture is
        // an element-owned raster target painted at laid-out size, the parsed
        // document rides an `SvgSurface`, and the path is never loaded as an
        // `Image` (see `crate::svg`). `atlas`/`sourceRect` have no source
        // texture to apply to — warned here, under the op's diag node scope.
        "image" if props.src.as_deref().is_some_and(crate::svg::is_svg_src) => {
            crate::svg::warn_ignored_attrs(props.atlas.is_some(), props.source_rect.is_some());
            let path = props.src.clone().expect("guarded by the arm");
            let img = svg_image_node(props, false);
            ec.queue(move |entity: EntityWorldMut| crate::svg::ensure_svg_image(entity, path, img));
        }
        "image" => {
            let mut img = image_node(props, assets);
            apply_atlas(&mut img, props, layouts, atlas_cache);
            ec.insert(img);
        }
        _ => {}
    }
    stamp_common(&mut ec, props);
    ec.id()
}

/// The default style a `<surface>` root gets before the user's `style` is overlaid:
/// it fills the offscreen texture (the camera's logical viewport) so the subtree
/// has a definite box to lay out in. The user can override `width`/`height` (or any
/// other field) via the element's `style` prop.
pub(super) fn surface_root_base() -> Option<Style> {
    Some(Style {
        width: Some(crate::protocol::animatable::Animatable::Static(
            crate::protocol::units::Length::Percent(100.0),
        )),
        height: Some(crate::protocol::animatable::Animatable::Static(
            crate::protocol::units::Length::Percent(100.0),
        )),
        ..Default::default()
    })
}

/// The default style a `<root>` gets before the user's `style` is overlaid: a
/// window-filling overlay just above the window tree. `globalZIndex: 1` (not a
/// magic max — see below) because bevy_ui sorts root nodes by `(GlobalZIndex,
/// ZIndex)` with NO tiebreak: equal keys fall back to query iteration order,
/// which is unspecified — a bare `<root>` at the window tree's implicit 0 could
/// land above OR below it. `1` is deterministically above, while leaving the
/// whole range open for the user's own layering (`style.globalZIndex` overrides
/// in either direction; the devtools panel claims `i32::MAX` explicitly).
/// Baked into the *style* rather than inserted as a raw `GlobalZIndex`
/// component so masked style re-applies on re-render re-assert it (a raw
/// insert would be stripped the first time the Z_INDEX dirty group executes
/// with no style value).
pub(super) fn root_base() -> Option<Style> {
    Some(Style {
        width: Some(crate::protocol::animatable::Animatable::Static(
            crate::protocol::units::Length::Percent(100.0),
        )),
        height: Some(crate::protocol::animatable::Animatable::Static(
            crate::protocol::units::Length::Percent(100.0),
        )),
        // Default to a column, like the main UI root (plugin.rs). Bevy's own
        // default is `row`, but a row container mis-measures a single
        // content-sized child that has `maxWidth` + wrapping text: the text is
        // sized at max-content (one line) during the row's main-axis pass, then
        // clamped to `maxWidth` and wrapped on render — so the child's height is
        // committed one line short while its siblings sit at the wrapped
        // positions. A `<root>` is a top-level app container like the main root,
        // so `column` is both the least-surprising default and the one that
        // sidesteps that quirk. Overridable via `style.flexDirection`.
        flex_direction: Some(FlexDirection::Column),
        global_z_index: Some(1),
        ..Default::default()
    })
}

/// Build the accesskit node for an `editableText` from its props (role + label +
/// initial value). The live value is kept current by
/// [`sync_editable_a11y`](crate::reconcile::sync_editable_a11y).
pub(super) fn editable_a11y_node(props: &Props) -> accesskit::Node {
    let role = if props.multiline {
        Role::MultilineTextInput
    } else {
        Role::TextInput
    };
    let mut node = accesskit::Node::new(role);
    if let Some(label) = &props.aria_label {
        node.set_label(label.clone());
    }
    node.set_value(props.value.clone().unwrap_or_default());
    node
}

#[cfg(test)]
mod tests {
    use super::super::test_util::{children_of, create_node, ent, ordering_app, update_delta};
    use super::*;
    use crate::protocol::{ROOT_ID, op::Op};

    /// A `<portal>` mounts to an `ImageNode` carrying an `RPortal` with its target
    /// name; an update rebinds the name.
    #[test]
    fn portal_mounts_with_target_and_rebinds() {
        use bevy::ui::widget::ImageNode;
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![Op::Create {
            id: 1,
            kind: "portal".into(),
            props: serde_json::from_value(serde_json::json!({ "target": "follow" }))
                .expect("valid portal props"),
            text: None,
        }])
        .unwrap();
        app.update();

        let e = ent(&app, 1);
        assert_eq!(
            app.world().entity(e).get::<RPortal>().map(|p| p.0.clone()),
            Some("follow".to_string()),
            "a portal carries its target name"
        );
        assert!(
            app.world().entity(e).get::<ImageNode>().is_some(),
            "a portal is backed by an ImageNode"
        );

        tx.send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "target": "minimap" }))
                .expect("valid portal props"),
            &[],
            &[],
        )])
        .unwrap();
        app.update();
        assert_eq!(
            app.world().entity(e).get::<RPortal>().map(|p| p.0.clone()),
            Some("minimap".to_string()),
            "an update rebinds the portal's target name"
        );
    }

    /// A `backgroundImage` style on a plain node mounts an `ImageNode` on the
    /// same entity: repeat mode → `Tiled` with the wire scale (the DPI sync
    /// corrects it live) + a `BackgroundTileScale` marker; a `{ texture }`
    /// source stamps `RBackgroundTexture`.
    #[test]
    fn background_image_mounts_on_plain_node() {
        use crate::background_image::{BackgroundTileScale, RBackgroundTexture};
        use bevy::ui::widget::{ImageNode, NodeImageMode};
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "backgroundImage": {
                        "src": "images/bg.png", "mode": "repeat", "scale": 2.0
                    } }
                }))
                .expect("valid props"),
                text: None,
            },
            Op::Create {
                id: 2,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "backgroundImage": { "src": { "texture": "minimap" } } }
                }))
                .expect("valid props"),
                text: None,
            },
        ])
        .unwrap();
        app.update();

        let e = ent(&app, 1);
        let img = app
            .world()
            .entity(e)
            .get::<ImageNode>()
            .expect("backgroundImage inserts an ImageNode");
        match img.image_mode {
            NodeImageMode::Tiled {
                tile_x,
                tile_y,
                stretch_value,
            } => {
                assert!(tile_x && tile_y, "repeat tiles both axes");
                assert_eq!(stretch_value, 2.0, "wire scale lands in stretch_value");
            }
            ref other => panic!("expected Tiled, got {other:?}"),
        }
        assert_eq!(
            app.world()
                .entity(e)
                .get::<BackgroundTileScale>()
                .map(|s| s.0),
            Some(2.0)
        );
        assert!(app.world().entity(e).get::<RBackgroundTexture>().is_none());

        let e2 = ent(&app, 2);
        assert_eq!(
            app.world()
                .entity(e2)
                .get::<RBackgroundTexture>()
                .map(|t| t.0.clone()),
            Some("minimap".to_string()),
            "a texture source stamps the bind marker"
        );
        assert!(
            matches!(
                app.world()
                    .entity(e2)
                    .get::<ImageNode>()
                    .unwrap()
                    .image_mode,
                NodeImageMode::Stretch
            ),
            "default mode is Stretch"
        );
    }

    /// A `backgroundImage` on a `<canvas>` is ignored (the canvas owns its
    /// `ImageNode`): no marker components appear and the canvas texture is
    /// left alone.
    #[test]
    fn background_image_ignored_on_canvas() {
        use crate::background_image::{BackgroundTileScale, RBackgroundTexture};
        use bevy::ui::widget::ImageNode;
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![Op::Create {
            id: 1,
            kind: "canvas".into(),
            props: serde_json::from_value(serde_json::json!({
                "style": { "backgroundImage": {
                    "src": { "texture": "x" }, "mode": "repeat"
                } }
            }))
            .expect("valid props"),
            text: None,
        }])
        .unwrap();
        app.update();

        let e = ent(&app, 1);
        assert!(
            app.world().entity(e).get::<ImageNode>().is_some(),
            "the canvas keeps its own ImageNode"
        );
        assert!(app.world().entity(e).get::<RBackgroundTexture>().is_none());
        assert!(app.world().entity(e).get::<BackgroundTileScale>().is_none());
    }

    /// An `<anchor>` rides the plain-node fallback path: the kind has no dedicated
    /// match arm, but its `anchor` prop stamps an [`Anchored`] binding via
    /// `stamp_common` → `apply_anchor`. Pins the fallback contract the JS bridge
    /// relies on (create, rebind on delta, and unset → component removal).
    #[test]
    fn anchor_kind_mounts_and_rebinds() {
        use crate::anchor::Anchored;
        let (mut app, tx, _root) = ordering_app();
        let target = app.world_mut().spawn_empty().id();
        let bits = target.to_bits() as f64;
        tx.send(vec![Op::Create {
            id: 1,
            kind: "anchor".into(),
            props: serde_json::from_value(serde_json::json!({
                "anchor": { "entity": bits, "offset": [0.0, 1.0, 0.0] }
            }))
            .expect("valid anchor props"),
            text: None,
        }])
        .unwrap();
        app.update();

        let e = ent(&app, 1);
        assert!(
            app.world().entity(e).get::<Node>().is_some(),
            "an anchor is a plain node host element"
        );
        let anchored = app
            .world()
            .entity(e)
            .get::<Anchored>()
            .expect("the anchor prop stamps an Anchored binding")
            .clone();
        assert_eq!(anchored.target, target, "follows the wire entity");
        assert_eq!(anchored.offset, Vec3::new(0.0, 1.0, 0.0));

        // A delta with a new offset re-stamps the binding (the JS side always
        // re-sends the full anchor object).
        tx.send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({
                "anchor": { "entity": bits, "offset": [0.0, 2.0, 0.0] }
            }))
            .expect("valid anchor props"),
            &[],
            &[],
        )])
        .unwrap();
        app.update();
        assert_eq!(
            app.world().entity(e).get::<Anchored>().map(|a| a.offset),
            Some(Vec3::new(0.0, 2.0, 0.0)),
            "a delta rebinds the anchor offset"
        );

        // Unsetting the anchor prop removes the binding entirely.
        tx.send(vec![update_delta(1, Props::default(), &["anchor"], &[])])
            .unwrap();
        app.update();
        assert!(
            app.world().entity(e).get::<Anchored>().is_none(),
            "unset removes the Anchored binding"
        );
    }

    /// A `<surface>` mounts carrying its name in an `RSurface`, and stays a detached
    /// UI root: appending it under a parent must NOT add it to that parent's Bevy
    /// `Children` (it renders to its own offscreen camera instead).
    #[test]
    fn surface_mounts_detached_with_name() {
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            create_node(1), // a normal parent under the root
            Op::Create {
                id: 2,
                kind: "surface".into(),
                props: serde_json::from_value(serde_json::json!({ "target": "monitor" }))
                    .expect("valid surface props"),
                text: None,
            },
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            // React appends the surface under node 1; the reconciler must keep it
            // detached (no Bevy parent) so it is an independent layout root.
            Op::Append {
                parent: 1,
                child: 2,
            },
        ])
        .unwrap();
        app.update();

        let surface = ent(&app, 2);
        assert_eq!(
            app.world()
                .entity(surface)
                .get::<RSurface>()
                .map(|s| s.0.clone()),
            Some("monitor".to_string()),
            "a surface carries its name in RSurface"
        );
        assert!(
            app.world().entity(surface).get::<ChildOf>().is_none(),
            "a surface is a detached root — never parented into the on-screen tree"
        );
        assert!(
            children_of(&app, ent(&app, 1)).is_empty(),
            "the surface's React parent has no Bevy children"
        );

        // An update rebinds the surface name (and never stamps an RPortal).
        tx.send(vec![update_delta(
            2,
            serde_json::from_value(serde_json::json!({ "target": "panel" }))
                .expect("valid surface props"),
            &[],
            &[],
        )])
        .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(surface)
                .get::<RSurface>()
                .map(|s| s.0.clone()),
            Some("panel".to_string()),
            "an update rebinds the surface name"
        );
        assert!(
            app.world()
                .entity(surface)
                .get::<crate::portal::RPortal>()
                .is_none(),
            "a surface update must not stamp an RPortal (shared `target` field)"
        );
    }

    /// A `<root>` mounts as a detached, screen-space top-level tree: never parented
    /// into the Bevy hierarchy, floating just above the window tree (the
    /// `globalZIndex` is baked into its style so re-renders re-assert it), ignoring
    /// picking itself — while its own children attach to it normally — and it
    /// despawns when its React ancestor unmounts (Bevy's recursive despawn can't
    /// reach a node with no `ChildOf`).
    #[test]
    fn root_mounts_detached_screen_space() {
        use crate::bridge::RRoot;
        let (mut app, tx, _ui_root) = ordering_app();
        tx.send(vec![
            create_node(1), // a normal parent under the UI root
            Op::Create {
                id: 2,
                kind: "root".into(),
                props: Box::default(),
                text: None,
            },
            create_node(3), // panel content inside the <root>
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
            // React appends the <root> under node 1; the reconciler must keep it
            // detached so it is an independent screen-space layout root.
            Op::Append {
                parent: 1,
                child: 2,
            },
            Op::Append {
                parent: 2,
                child: 3,
            },
        ])
        .unwrap();
        app.update();

        let root_e = ent(&app, 2);
        assert!(
            app.world().entity(root_e).get::<RRoot>().is_some(),
            "a <root> carries the RRoot marker"
        );
        assert!(
            app.world().entity(root_e).get::<ChildOf>().is_none(),
            "a <root> is a detached root — never parented into the on-screen tree"
        );
        assert!(
            children_of(&app, ent(&app, 1)).is_empty(),
            "the <root>'s React parent has no Bevy children"
        );
        assert_eq!(
            app.world()
                .entity(root_e)
                .get::<GlobalZIndex>()
                .map(|z| z.0),
            Some(1),
            "a <root> floats just above the window tree by default"
        );
        assert_eq!(
            app.world().entity(root_e).get::<Pickable>(),
            Some(&Pickable::IGNORE),
            "the <root> itself must not block or hover picking"
        );
        assert_eq!(
            children_of(&app, root_e),
            vec![ent(&app, 3)],
            "the <root>'s own children attach to it normally"
        );
        assert_eq!(
            app.world()
                .entity(root_e)
                .get::<Node>()
                .map(|n| n.flex_direction),
            Some(FlexDirection::Column),
            "a <root> defaults to a column, like the main UI root (not Bevy's row)"
        );

        // A style-only re-render must keep the baked default z-index.
        tx.send(vec![update_delta(
            2,
            serde_json::from_value(serde_json::json!({ "style": { "padding": 4 } }))
                .expect("valid root props"),
            &[],
            &[],
        )])
        .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(root_e)
                .get::<GlobalZIndex>()
                .map(|z| z.0),
            Some(1),
            "a re-render must re-assert the baked globalZIndex, not strip it"
        );

        // Removing the React ancestor must despawn the detached <root> (and its
        // subtree) even though no ChildOf links them.
        tx.send(vec![Op::Remove {
            parent: ROOT_ID,
            child: 1,
        }])
        .unwrap();
        app.update();
        assert!(
            !app.world().entities().contains(root_e),
            "removing a React ancestor must despawn the detached <root>"
        );
        let bridge = app.world().resource::<JsBridge>();
        assert!(
            bridge.roots.is_empty() && !bridge.nodes.contains_key(&2),
            "the <root>'s bookkeeping must be pruned on removal"
        );
    }
}
