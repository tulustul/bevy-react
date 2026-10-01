//! The `Op::Create` path: spawn a host element of the op's kind through its
//! registered [`Element`](crate::element::Element) — the spawn hook for the
//! born-with components, then the style + element writers, the common prop
//! stamps, and the bridge's per-node bookkeeping (props cache, text styles,
//! detached nodes, controlled scroll, layer-promotion hints).

use bevy::image::Image;
use bevy::prelude::*;

use super::stamps::{
    apply_scroll_listener, apply_scroll_step, apply_wheel_listener, create_controlled_scroll,
    stamp_common,
};
use crate::bridge::{JsBridge, SpanKind};
use crate::element::SpawnCtx;
use crate::ext::TextRole;
use crate::plugin::Fonts;
use crate::protocol::{NodeId, props::Props};
use crate::style::WriterCtx;
use crate::style::props::{BACKDROP_FILTER, CACHE, FILTER, MORPH_FILTER, TRANSFORM3D};
use crate::ui_map::{apply_style_fresh, resolved_text_style};

/// Apply one `Op::Create`: spawn the element for `kind` and record it in the
/// bridge. Runs once per create op.
///
/// The spawn is **fresh-path** throughout: the always-present components ride
/// the spawn bundle ([`SpawnCtx::spawn`] — one archetype, no moves), the rest
/// of the style and the element's attributes go through the writers' fresh
/// apply, and the prop stamps are the insert-only variants — a fresh entity
/// has nothing to remove, so none of the update path's "absent → remove"
/// commands are queued.
#[allow(clippy::too_many_arguments)]
pub(super) fn apply_create(
    commands: &mut Commands,
    bridge: &mut JsBridge,
    assets: &AssetServer,
    fonts: &Fonts,
    images: &mut Assets<Image>,
    id: NodeId,
    kind: String,
    mut props: Box<Props>,
    text: Option<String>,
) {
    // Attribute apply-time parse warnings (colors, fonts, …) fired
    // while building this node to its id (see `crate::diag`).
    let _diag = crate::diag::node_scope(id);
    let registry = bridge.ext.clone();
    // An unregistered kind mounts as a plain node so its children still
    // attach; a known optional feature's kind is reported (`featureMissing`).
    if registry.element_info(&kind).is_none() {
        crate::ext::warn_feature_missing_kind(&kind);
    }
    let info = registry.element_or_fallback(&kind);
    let flags = info.decl.flags;
    // The act-now props act once, here, and are never retained.
    let events = props.split_events();
    // The retained style carries the element's defaults (see
    // `ElementInfo::fill_default_style`).
    info.fill_default_style(&mut props.style);
    let style = &props.style;
    let entity = {
        let mut ctx = SpawnCtx {
            commands,
            images,
            assets,
            fonts,
            id,
            kind: &kind,
            props: &props,
            style,
            text: text.as_deref(),
            flags,
        };
        match info.decl.spawn {
            Some(spawn) => spawn(&mut ctx),
            None => ctx.spawn(()),
        }
    };
    // What the writers see of this node: fresh (nothing to remove), never
    // promoted at create (promotion is evaluated after the drain).
    let wctx = WriterCtx {
        promoted: false,
        fresh: true,
        kind: &kind,
        flags,
        assets,
        fonts,
        styles: registry.styles(),
        element: info,
        attrs: &props.attrs,
        events: &events.attrs,
        id,
    };
    let mut ec = commands.entity(entity);
    apply_style_fresh(&mut ec, style, &wctx);
    super::stamps::warn_ignored_styles(info, registry.styles(), &props);
    if flags.text == TextRole::Span {
        super::stamps::warn_span_ignored(&props);
    }
    stamp_common(
        &mut ec,
        &mut bridge.animated,
        id,
        &props,
        style,
        info.decl.common,
        flags,
    );
    if info.decl.common.contains(crate::element::Common::SCROLL) {
        apply_scroll_listener(&mut ec, &props, true);
        apply_wheel_listener(&mut ec, &props, true);
        apply_scroll_step(&mut ec, &props, true);
        create_controlled_scroll(bridge, &mut ec, id, &props, &events);
    } else if info.decl.common.contains(crate::element::Common::WHEEL) && props.on_wheel {
        ec.insert(crate::bridge::WheelListener);
    }
    if props.handlers != 0 {
        commands
            .entity(entity)
            .insert(crate::element::EventSubscriptions(
                props.handler_events(info),
            ));
    }
    // The text service: a block's bare-string children inherit its resolved
    // style; a styled span keeps its own.
    if matches!(flags.text, TextRole::Block | TextRole::Span) {
        bridge
            .text_styles
            .insert(id, resolved_text_style(style.as_ref(), fonts, false));
    }
    if flags.text == TextRole::Span {
        // Its text lives in a `TextSpan`, so a later `Op::UpdateText` must
        // update that (not insert a stray `Text`).
        bridge.spans.insert(id, SpanKind::InlineStyled);
    }
    if flags.detached {
        bridge.detached.insert(id);
    }
    bridge.nodes.insert(id, entity);
    // `name` → Bevy `Name` + the by-name index (see `crate::names`).
    crate::names::apply_name(
        &mut commands.entity(entity),
        &mut bridge.names,
        None,
        props.name.as_deref(),
    );
    // Every node's kind + the `sharedTag` index (see `crate::shared_tags`).
    bridge.shared_tags.note_kind(id, &kind, &registry);
    bridge
        .shared_tags
        .apply(id, None, props.shared_tag.as_deref());
    // `cache: "always"`, a `filter`/`backdropFilter` chain, a `morphFilter`,
    // or a `transform3d` — base or variant-carried (the promotion union is
    // presence-based, so a hover-only filter promotes eagerly at
    // creation) — promote even a childless node, so no later child op
    // would ever queue the evaluation — do it here. (Opacity-driven
    // promotion needs a child, whose Append marks.) Over-seeding —
    // `cache: "auto"`, an empty chain — is fine: the dirty set is a
    // conservative "evaluate me" hint, the evaluator is authoritative,
    // and a spurious evaluation is cheap.
    if props.all_styles().any(|s| {
        s.get(&CACHE).is_some()
            || s.get(&FILTER).is_some()
            || s.get(&BACKDROP_FILTER).is_some()
            || s.get(&MORPH_FILTER).is_some()
            || s.get(&TRANSFORM3D).is_some()
    }) {
        bridge.layer_dirty.insert(id);
    }
    // Seed the retained props a later update's delta merges into — the
    // op's own box, in place (no re-box, no copy).
    bridge.props_cache.insert(id, props);
}

#[cfg(test)]
mod tests {
    use super::super::test_util::{children_of, create_node, ent, ordering_app, update_delta};
    use super::*;
    use crate::protocol::{ROOT_ID, op::Op};

    /// `layoutRounding` stamps bevy's `LayoutConfig` on the entity (`false`
    /// = fractional-px layout for the subtree) and unsetting it removes the
    /// component again, so the node inherits its ancestor's rounding.
    #[test]
    fn layout_rounding_stamps_and_removes_layout_config() {
        use bevy::ui::LayoutConfig;
        let (mut app, tx, _root) = ordering_app();
        tx.send(vec![
            Op::Create {
                id: 1,
                kind: "node".into(),
                props: serde_json::from_value(serde_json::json!({
                    "style": { "layoutRounding": false },
                }))
                .unwrap(),
                text: None,
            },
            Op::Append {
                parent: ROOT_ID,
                child: 1,
            },
        ])
        .unwrap();
        app.update();
        let e = ent(&app, 1);
        assert_eq!(
            app.world()
                .entity(e)
                .get::<LayoutConfig>()
                .map(|c| c.use_rounding),
            Some(false),
            "layoutRounding: false stamps LayoutConfig {{ use_rounding: false }}"
        );

        tx.send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "style": { "layoutRounding": true } }))
                .unwrap(),
            &[],
            &[],
        )])
        .unwrap();
        app.update();
        assert_eq!(
            app.world()
                .entity(e)
                .get::<LayoutConfig>()
                .map(|c| c.use_rounding),
            Some(true),
            "an explicit true is an override too (a child of an unrounded subtree)"
        );

        tx.send(vec![update_delta(
            1,
            serde_json::from_value(serde_json::json!({ "style": {} })).unwrap(),
            &[],
            &["layoutRounding"],
        )])
        .unwrap();
        app.update();
        assert!(
            app.world().entity(e).get::<LayoutConfig>().is_none(),
            "unset removes the component: back to inheriting"
        );
    }

    /// Layer-family styles on a nested `<text>` span are structural no-ops
    /// (a span has no layout box; its glyphs belong to the parent block) —
    /// they warn into the devtools diag sink instead of failing silently.
    /// Pointer handlers are outside a span's common groups: dropped at decode
    /// with a `propIgnored` warning. The runtime sink is process-global:
    /// serialize via the test lock and filter drained entries by our node id.
    #[cfg(all(feature = "devtools", debug_assertions))]
    #[test]
    fn span_layer_styles_and_handlers_warn() {
        let _lock = crate::diag::test_lock();
        crate::diag::arm_runtime();
        let _ = crate::diag::take_runtime_warnings();

        let (mut app, tx, _root) = ordering_app();
        crate::diag::decode_batch_start();
        let span_props = Props::decode_for(
            "textSpan",
            serde_json::json!({
                "style": { "filter": { "name": "blur" } },
                "onClick": true,
            }),
        );
        let decoded = crate::diag::take_decode_warnings();
        assert!(
            decoded
                .iter()
                .any(|w| w.kind == "propIgnored" && w.value == "onClick"),
            "an onClick on a span is dropped with propIgnored; got {decoded:?}"
        );
        assert!(!span_props.on_click, "the ignored handler is dropped");
        tx.send(vec![
            Op::Create {
                id: 1,
                kind: "text".into(),
                props: Box::default(),
                text: None,
            },
            Op::Create {
                id: 2,
                kind: "textSpan".into(),
                props: span_props,
                text: Some("run".into()),
            },
            Op::Append {
                parent: 1,
                child: 2,
            },
        ])
        .unwrap();
        app.update();

        let mine: Vec<_> = crate::diag::take_runtime_warnings()
            .into_iter()
            .filter(|w| w.node == Some(2))
            .collect();
        assert!(
            mine.iter()
                .any(|w| w.kind == "spanLayerStyle" && w.value == "filter"),
            "a filter on a span must warn spanLayerStyle; got {mine:?}"
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
            bridge.detached.is_empty() && !bridge.nodes.contains_key(&2),
            "the <root>'s bookkeeping must be pruned on removal"
        );
    }
}
