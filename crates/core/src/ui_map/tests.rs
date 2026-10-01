use super::text::{letter_spacing, line_height};
use super::*;
use crate::protocol::animatable::AnimatableField;
use crate::protocol::props::{Props, props_for};
use crate::style::Style;
use crate::style::props::*;

/// Decode an `<image>`'s props.
fn image_props(json: serde_json::Value) -> Props {
    props_for("image", json)
}

/// The `ImageNode` an `<image>`'s props build (its style's static opacity
/// folded, unpromoted).
fn image_of(props: &Props, assets: &AssetServer) -> ImageNode {
    let opacity = props
        .style
        .as_ref()
        .and_then(|s| s.get(&OPACITY).static_val());
    image_node(&props.attrs, opacity, assets, false)
}

/// An unrecognized color reports into the diag runtime sink under the
/// enclosing node scope, so devtools can flag the row. The sink is
/// process-global, so: serialize via the test lock, and filter drained
/// entries by our own node id rather than asserting emptiness.
#[cfg(all(feature = "devtools", debug_assertions))]
#[test]
fn bad_color_reports_runtime_warning() {
    let _lock = crate::diag::test_lock();
    crate::diag::arm_runtime();
    let _ = crate::diag::take_runtime_warnings();

    let color = {
        let _scope = crate::diag::node_scope(4242);
        parse_color("notexistingcolor")
    };
    assert_eq!(color, Color::srgb(1.0, 0.0, 1.0), "magenta debug fallback");

    let mine: Vec<_> = crate::diag::take_runtime_warnings()
        .into_iter()
        .filter(|w| w.node == Some(4242))
        .collect();
    assert_eq!(mine.len(), 1);
    assert_eq!(mine[0].kind, "color");
    assert_eq!(mine[0].value, "notexistingcolor");
    assert!(mine[0].message.contains("unrecognized color"));

    // A valid color must not report.
    {
        let _scope = crate::diag::node_scope(4242);
        parse_color("rebeccapurple");
    }
    assert!(
        !crate::diag::take_runtime_warnings()
            .iter()
            .any(|w| w.node == Some(4242)),
        "valid colors must not warn"
    );
}

/// `opacity` fades an `<image>` by multiplying into its tint alpha (so a `src`
/// image dims too, not just colored boxes/text).
#[test]
fn image_opacity_fades_tint_alpha() {
    let mut app = App::new();
    app.add_plugins((MinimalPlugins, AssetPlugin::default()));
    app.init_asset::<Image>();
    let assets = app.world().resource::<AssetServer>();

    let props = image_props(serde_json::json!({
        "tint": "#ff0000",
        "style": { "opacity": 0.5 },
    }));
    let image = image_of(&props, assets);
    let c = image.color.to_srgba();
    assert!(
        (c.alpha - 0.5).abs() < 1e-6,
        "alpha should be 0.5, got {}",
        c.alpha
    );
    assert!((c.red - 1.0).abs() < 1e-6, "tint hue preserved");
}

/// `focusPolicy` maps to `bevy::ui::FocusPolicy`: `"block"` → `Block`,
/// `"pass"` → `Pass`, and dropping the key falls back to the node's default
/// `Pass` (never removes the component — removal would make `ui_focus_system`
/// silently block the node).
#[test]
fn focus_policy_maps_with_pass_default() {
    use bevy::ecs::world::CommandQueue;

    let app = assets_app();
    let assets = app.world().resource::<AssetServer>().clone();
    let fonts = Fonts::default();
    let apply = |world: &mut World, entity: Entity, json: serde_json::Value| {
        let style: Style = serde_json::from_value(json).unwrap();
        let mut queue = CommandQueue::default();
        let mut commands = Commands::new(&mut queue, world);
        let info = crate::ext::core_registry()
            .element_info("node")
            .cloned()
            .unwrap();
        let ctx = WriterCtx {
            promoted: false,
            fresh: false,
            kind: "node",
            flags: crate::ext::ElementFlags::NODE,
            assets: &assets,
            fonts: &fonts,
            styles: crate::ext::core_registry().styles(),
            element: &info,
            attrs: crate::element::Attrs::empty(),
            events: crate::element::Attrs::empty(),
            id: 0,
        };
        apply_style(&mut commands.entity(entity), &Some(style), &ctx);
        queue.apply(world);
    };

    let mut world = World::new();
    let entity = world.spawn_empty().id();

    apply(
        &mut world,
        entity,
        serde_json::json!({ "focusPolicy": "block" }),
    );
    assert_eq!(world.get::<FocusPolicy>(entity), Some(&FocusPolicy::Block));

    apply(
        &mut world,
        entity,
        serde_json::json!({ "focusPolicy": "pass" }),
    );
    assert_eq!(world.get::<FocusPolicy>(entity), Some(&FocusPolicy::Pass));

    // Dropping the key reverts to the default `Pass` (not removed → not Block).
    apply(&mut world, entity, serde_json::json!({}));
    assert_eq!(world.get::<FocusPolicy>(entity), Some(&FocusPolicy::Pass));
}

/// A `{ type: "sliced", … }` `imageMode` maps to `NodeImageMode::Sliced` with
/// the per-side border insets and tile scale modes carried through.
fn assets_app() -> App {
    let mut app = App::new();
    app.add_plugins((MinimalPlugins, AssetPlugin::default()));
    app.init_asset::<Image>();
    app
}

#[test]
fn image_mode_sliced_maps_to_texture_slicer() {
    let app = assets_app();
    let assets = app.world().resource::<AssetServer>();

    let props = image_props(serde_json::json!({
        "src": "modal.png",
        "imageMode": {
            "type": "sliced",
            "border": { "top": 10.0, "right": 20.0, "bottom": 30.0, "left": 40.0 },
            "sidesScaleMode": { "tile": 0.5 },
            "maxCornerScale": 2.0,
        },
    }));
    let image = image_of(&props, assets);
    match image.image_mode {
        NodeImageMode::Sliced(s) => {
            assert_eq!(s.border.min_inset, Vec2::new(40.0, 10.0));
            assert_eq!(s.border.max_inset, Vec2::new(20.0, 30.0));
            assert_eq!(s.max_corner_scale, 2.0);
            assert_eq!(s.center_scale_mode, SliceScaleMode::Stretch);
            assert_eq!(
                s.sides_scale_mode,
                SliceScaleMode::Tile { stretch_value: 0.5 }
            );
        }
        other => panic!("expected Sliced, got {other:?}"),
    }
}

/// A uniform-number border and a `"tiled"` mode both decode and map.
#[test]
fn image_mode_tiled_and_uniform_border() {
    let app = assets_app();
    let assets = app.world().resource::<AssetServer>();

    let sliced = image_props(serde_json::json!({
        "src": "modal.png",
        "imageMode": { "type": "sliced", "border": 16.0 },
    }));
    match image_of(&sliced, assets).image_mode {
        NodeImageMode::Sliced(s) => assert_eq!(s.border, BorderRect::all(16.0)),
        other => panic!("expected Sliced, got {other:?}"),
    }

    let tiled = image_props(serde_json::json!({
        "src": "modal.png",
        "imageMode": { "type": "tiled", "tileX": true, "stretchValue": 2.0 },
    }));
    match image_of(&tiled, assets).image_mode {
        NodeImageMode::Tiled {
            tile_x,
            tile_y,
            stretch_value,
        } => {
            assert!(tile_x);
            assert!(!tile_y);
            assert_eq!(stretch_value, 2.0);
        }
        other => panic!("expected Tiled, got {other:?}"),
    }
}

/// The bare-string `imageMode` keywords still decode (backward compatible).
#[test]
fn image_mode_keyword_backward_compatible() {
    let app = assets_app();
    let assets = app.world().resource::<AssetServer>();

    let stretch = image_props(serde_json::json!({ "imageMode": "stretch" }));
    assert!(matches!(
        image_of(&stretch, assets).image_mode,
        NodeImageMode::Stretch
    ));

    let auto = image_props(serde_json::json!({ "imageMode": "auto" }));
    assert!(matches!(
        image_of(&auto, assets).image_mode,
        NodeImageMode::Auto
    ));
}

/// `sourceRect` becomes a min/max `Rect` (x,y → top-left; +width/height →
/// bottom-right), and `visualBox` selects the box variant.
#[test]
fn source_rect_and_visual_box_map() {
    let app = assets_app();
    let assets = app.world().resource::<AssetServer>();

    let props = image_props(serde_json::json!({
        "src": "logo.png",
        "sourceRect": { "x": 10.0, "y": 20.0, "width": 30.0, "height": 40.0 },
        "visualBox": "border",
    }));
    let image = image_of(&props, assets);
    assert_eq!(
        image.rect,
        Some(bevy::math::Rect::new(10.0, 20.0, 40.0, 60.0))
    );
    assert_eq!(image.visual_box, VisualBox::BorderBox);
}

/// Two cells of the *same* grid (only `index` differs) share one cached
/// `TextureAtlasLayout` handle — the leak-guard that makes index-only sprite
/// animation safe across the per-`Op::Update` rebuilds.
#[test]
fn atlas_layout_cache_reuses_handle_across_index() {
    let app = assets_app();
    let assets = app.world().resource::<AssetServer>();
    let mut layouts = Assets::<TextureAtlasLayout>::default();
    let mut cache = AtlasLayoutCache::default();

    let frame = |index: usize| -> Props {
        image_props(serde_json::json!({
            "src": "sheet.png",
            "atlas": {
                "tileWidth": 32, "tileHeight": 32,
                "columns": 4, "rows": 4, "index": index,
            },
        }))
    };
    use crate::elements::image::ATLAS;

    let p0 = frame(0);
    let mut a = image_of(&p0, assets);
    apply_atlas(&mut a, p0.attrs.get(&ATLAS), &mut layouts, &mut cache);
    let p2 = frame(2);
    let mut b = image_of(&p2, assets);
    apply_atlas(&mut b, p2.attrs.get(&ATLAS), &mut layouts, &mut cache);

    let ta = a.texture_atlas.expect("atlas on a");
    let tb = b.texture_atlas.expect("atlas on b");
    assert_eq!(ta.layout, tb.layout, "same grid reuses one layout handle");
    assert_eq!(ta.index, 0);
    assert_eq!(tb.index, 2);
    assert_eq!(layouts.len(), 1, "only one layout asset created");
}

fn style(json: serde_json::Value) -> Style {
    serde_json::from_value(json).unwrap()
}

#[test]
fn color_named_function_and_fallback() {
    // named, hex, and rgb() all agree on pure red.
    let red = parse_color("#ff0000").to_srgba();
    assert_eq!(parse_color("red").to_srgba(), red);
    assert_eq!(parse_color("rgb(255, 0, 0)").to_srgba(), red);
    // transparent maps to a zero-alpha color.
    assert_eq!(parse_color("transparent").to_srgba().alpha, 0.0);
    // an unrecognized value falls back to the loud magenta debug color.
    assert_eq!(
        parse_color("definitely-not-a-color"),
        Color::srgb(1.0, 0.0, 1.0)
    );
}

#[test]
fn length_units() {
    let s = style(serde_json::json!({
        "width": "50%", "height": "auto", "maxWidth": "100vw", "minHeight": 24
    }));
    assert_eq!(
        length_to_val(s.get(&WIDTH).static_val().unwrap()),
        Val::Percent(50.0)
    );
    assert_eq!(
        length_to_val(s.get(&HEIGHT).static_val().unwrap()),
        Val::Auto
    );
    assert_eq!(
        length_to_val(s.get(&MAX_WIDTH).static_val().unwrap()),
        Val::Vw(100.0)
    );
    assert_eq!(
        length_to_val(s.get(&MIN_HEIGHT).static_val().unwrap()),
        Val::Px(24.0)
    );
}

#[test]
fn rect_shorthand_and_object() {
    let s = style(serde_json::json!({
        "padding": "8px 16px",
        "margin": { "top": 1, "left": "2px" },
    }));
    let pad = rect_to_uirect(s.get(&PADDING).copied().unwrap());
    assert_eq!(pad.top, Val::Px(8.0));
    assert_eq!(pad.bottom, Val::Px(8.0));
    assert_eq!(pad.left, Val::Px(16.0));
    assert_eq!(pad.right, Val::Px(16.0));
    let margin = rect_to_uirect(s.get(&MARGIN).copied().unwrap());
    assert_eq!(margin.top, Val::Px(1.0));
    assert_eq!(margin.left, Val::Px(2.0));
}

/// The axis pair reaches `Val` like any other rect form. On `borderRadius`
/// the sides name corners, so `horizontal` is the top-right + bottom-left
/// pair (`rect_to_border_radius`'s top/right/bottom/left → TL/TR/BR/BL).
#[test]
fn rect_axis_pair_maps_to_val() {
    let s = style(serde_json::json!({
        "padding": { "horizontal": 16, "vertical": "50%" },
        "borderRadius": { "horizontal": 4 },
    }));
    let pad = rect_to_uirect(s.get(&PADDING).copied().unwrap());
    assert_eq!(pad.left, Val::Px(16.0));
    assert_eq!(pad.right, Val::Px(16.0));
    assert_eq!(pad.top, Val::Percent(50.0));
    assert_eq!(pad.bottom, Val::Percent(50.0));

    let radius = rect_to_border_radius(s.get(&BORDER_RADIUS).static_val().unwrap());
    assert_eq!(radius.top_right, Val::Px(4.0));
    assert_eq!(radius.bottom_left, Val::Px(4.0));
    assert_eq!(radius.top_left, Val::Px(0.0));
    assert_eq!(radius.bottom_right, Val::Px(0.0));
}

#[test]
fn linear_gradient_maps_angle_and_stops() {
    let s = style(serde_json::json!({
        "backgroundGradient": {
            "type": "linear",
            "angle": 90.0,
            "stops": [
                { "color": "#ff0000", "position": 0 },
                { "color": "#0000ff", "position": "100%" },
            ],
        },
    }));
    let grads = build_gradients(s.get(&BACKGROUND_GRADIENT).unwrap(), None);
    assert_eq!(grads.len(), 1);
    let Gradient::Linear(lin) = &grads[0] else {
        panic!("expected a linear gradient, got {:?}", grads[0]);
    };
    assert!((lin.angle - 90.0_f32.to_radians()).abs() < 1e-6);
    assert_eq!(lin.stops.len(), 2);
    assert_eq!(lin.stops[0].point, Val::Px(0.0));
    assert_eq!(lin.stops[1].point, Val::Percent(100.0));
    assert_eq!(lin.stops[0].color.to_srgba(), Srgba::hex("ff0000").unwrap());
}

/// A gradient style stamps [`GradientTargets`]: the UNfolded resolved
/// gradients per surface plus the fold opacity `apply_style` would use.
/// Unsetting both surfaces removes it; a promoted root stamps
/// `opacity: None` (the group alpha owns the fold there).
#[test]
fn gradient_style_stamps_unfolded_targets() {
    use crate::filters::test_util::{create, ease_app, entity_of, update};
    use crate::protocol::op::Op;

    let (mut app, ops_tx) = ease_app();
    let gradient_json = serde_json::json!({
        "type": "linear",
        "stops": [
            { "color": "#ff0000", "position": 0 },
            { "color": "#0000ff", "position": "100%" },
        ],
    });
    ops_tx
        .send(vec![
            // Node 1: gradient + opacity, childless — NOT promoted, folds.
            create(
                1,
                serde_json::json!({ "style": {
                    "opacity": 0.5,
                    "backgroundGradient": gradient_json,
                } }),
            ),
            // Node 2: same style but with a child — promoted, fold suppressed.
            create(
                2,
                serde_json::json!({ "style": {
                    "opacity": 0.5,
                    "backgroundGradient": gradient_json,
                } }),
            ),
            create(3, serde_json::json!({})),
            Op::Append {
                parent: 2,
                child: 3,
            },
        ])
        .unwrap();
    app.update();

    let e = entity_of(&app, 1);
    let targets = app
        .world()
        .get::<GradientTargets>(e)
        .expect("gradient style stamps GradientTargets");
    assert_eq!(targets.border, None);
    assert_eq!(targets.opacity, Some(0.5), "unpromoted: fold opacity kept");
    let unfolded = targets.background.as_ref().expect("background stamped");
    assert_eq!(unfolded.len(), 1);
    let Gradient::Linear(lin) = &unfolded[0] else {
        panic!("expected a linear gradient, got {:?}", unfolded[0]);
    };
    // Unfolded: full-alpha stop colors, exactly `build_gradients(_, None)`.
    assert_eq!(
        lin.stops[0].color.to_srgba(),
        Srgba::new(1.0, 0.0, 0.0, 1.0)
    );
    assert_eq!(
        lin.stops[1].color.to_srgba(),
        Srgba::new(0.0, 0.0, 1.0, 1.0)
    );
    // The applied component is still the folded snap (unchanged behavior).
    let bg = app
        .world()
        .get::<BackgroundGradient>(e)
        .expect("component still applied");
    let Gradient::Linear(folded) = &bg.0[0] else {
        panic!("expected a linear gradient, got {:?}", bg.0[0]);
    };
    assert_eq!(
        folded.stops[0].color.to_srgba(),
        Srgba::new(1.0, 0.0, 0.0, 0.5)
    );
    // The write-time fold of the stamp equals the resolver's own folded
    // component bit-exactly — the split-builder contract.
    assert_eq!(fold_gradients(unfolded, Some(0.5)), bg.0);
    assert_eq!(fold_gradients(unfolded, None), *unfolded, "None = no fold");

    // A promoted root stamps `opacity: None` — the group alpha owns it —
    // and its applied component is unfolded too.
    let promoted = entity_of(&app, 2);
    assert!(
        app.world()
            .get::<crate::layer::PromotedLayer>(promoted)
            .is_some(),
        "promoted via opacity + child"
    );
    let targets = app
        .world()
        .get::<GradientTargets>(promoted)
        .expect("promoted node stamped too");
    assert_eq!(targets.opacity, None, "promoted: group alpha owns the fold");
    assert!(targets.background.is_some());
    let bg = app
        .world()
        .get::<BackgroundGradient>(promoted)
        .expect("component applied on the promoted root");
    let Gradient::Linear(l) = &bg.0[0] else {
        panic!("expected a linear gradient, got {:?}", bg.0[0]);
    };
    assert_eq!(
        l.stops[0].color.to_srgba().alpha,
        1.0,
        "promoted: fold suppressed in the applied component too"
    );

    // The gradient-targets writer reads `opacity`, so an opacity-only
    // delta re-stamps.
    ops_tx
        .send(vec![update(
            1,
            serde_json::json!({ "style": { "opacity": 0.8 } }),
            &[],
        )])
        .unwrap();
    app.update();
    let targets = app.world().get::<GradientTargets>(e).unwrap();
    assert_eq!(targets.opacity, Some(0.8), "opacity delta re-stamps");

    // Unsetting the last gradient surface removes the stamp.
    ops_tx
        .send(vec![update(
            1,
            serde_json::json!({ "style": {} }),
            &["backgroundGradient"],
        )])
        .unwrap();
    app.update();
    assert!(
        app.world().get::<GradientTargets>(e).is_none(),
        "no gradient surface left: stamp removed"
    );
}

#[test]
fn gradient_accepts_single_or_array() {
    let one = style(serde_json::json!({
        "backgroundGradient": { "type": "linear", "stops": [{ "color": "#fff" }] },
    }));
    let many = style(serde_json::json!({
        "backgroundGradient": [
            { "type": "linear", "stops": [{ "color": "#fff" }] },
            { "type": "radial", "stops": [{ "color": "#000" }] },
        ],
    }));
    assert_eq!(
        build_gradients(one.get(&BACKGROUND_GRADIENT).unwrap(), None).len(),
        1
    );
    assert_eq!(
        build_gradients(many.get(&BACKGROUND_GRADIENT).unwrap(), None).len(),
        2
    );
}

#[test]
fn box_shadow_accepts_single_or_array() {
    let one = style(serde_json::json!({
        "boxShadow": { "color": "#000", "blurRadius": 8 },
    }));
    let many = style(serde_json::json!({
        "boxShadow": [
            { "color": "#000", "blurRadius": 4 },
            { "color": "#FFFFFF33", "blurRadius": 16, "spreadRadius": 4 },
        ],
    }));
    assert_eq!(build_box_shadows(one.get(&BOX_SHADOW).unwrap()).len(), 1);
    assert_eq!(build_box_shadows(many.get(&BOX_SHADOW).unwrap()).len(), 2);
}

#[test]
fn conic_gradient_converts_degrees_to_radians() {
    let s = style(serde_json::json!({
        "backgroundGradient": {
            "type": "conic",
            "start": 45.0,
            "stops": [
                { "color": "#ff0000", "angle": 0.0 },
                { "color": "#00ff00", "angle": 180.0 },
            ],
        },
    }));
    let grads = build_gradients(s.get(&BACKGROUND_GRADIENT).unwrap(), None);
    let Gradient::Conic(conic) = &grads[0] else {
        panic!("expected a conic gradient, got {:?}", grads[0]);
    };
    assert!((conic.start - 45.0_f32.to_radians()).abs() < 1e-6);
    assert_eq!(conic.stops[1].angle, Some(180.0_f32.to_radians()));
}

#[test]
fn line_height_px_vs_relative() {
    let lh = |v: serde_json::Value| {
        line_height(
            style(serde_json::json!({ "lineHeight": v }))
                .get(&LINE_HEIGHT)
                .as_ref()
                .unwrap(),
        )
    };
    assert_eq!(lh(serde_json::json!(1.5)), LineHeight::RelativeToFont(1.5));
    assert_eq!(lh(serde_json::json!({ "px": 28 })), LineHeight::Px(28.0));
    // string forms: `px` is absolute, unitless/`em` is a multiple.
    assert_eq!(lh(serde_json::json!("20px")), LineHeight::Px(20.0));
    assert_eq!(
        lh(serde_json::json!("1.5em")),
        LineHeight::RelativeToFont(1.5)
    );
}

#[test]
fn letter_spacing_px_vs_rem() {
    let ls = |v: serde_json::Value| {
        letter_spacing(
            style(serde_json::json!({ "letterSpacing": v }))
                .get(&LETTER_SPACING)
                .as_ref()
                .unwrap(),
        )
    };
    assert_eq!(ls(serde_json::json!(2)), LetterSpacing::Px(2.0));
    assert_eq!(
        ls(serde_json::json!({ "rem": 0.1 })),
        LetterSpacing::Rem(0.1)
    );
    // string forms: `px`, `rem`/`em`, and `normal`.
    assert_eq!(ls(serde_json::json!("2px")), LetterSpacing::Px(2.0));
    assert_eq!(ls(serde_json::json!("0.1rem")), LetterSpacing::Rem(0.1));
    assert_eq!(ls(serde_json::json!("normal")), LetterSpacing::default());
}

#[test]
fn text_shadow_offset_and_color() {
    let s = style(serde_json::json!({
        "textShadow": { "color": "#ff0000", "offsetX": 2, "offsetY": 3 },
    }));
    let shadow = text_shadow(Some(&s), s.get(&OPACITY).static_val()).unwrap();
    assert_eq!(shadow.offset, Vec2::new(2.0, 3.0));
    assert_eq!(shadow.color.to_srgba(), Srgba::hex("ff0000").unwrap());

    // Unset offset falls back to bevy's default displacement (4.0).
    let bare = style(serde_json::json!({ "textShadow": {} }));
    assert_eq!(
        text_shadow(Some(&bare), None).unwrap().offset,
        Vec2::splat(4.0)
    );
    // No textShadow → no component.
    assert!(text_shadow(Some(&style(serde_json::json!({}))), None).is_none());
}

#[test]
fn line_break_drives_layout() {
    // `lineBreak` alone (no `textAlign`) still builds a `TextLayout`.
    let s = style(serde_json::json!({ "lineBreak": "noWrap" }));
    let layout = text_layout(Some(&s)).unwrap();
    assert_eq!(layout.linebreak, LineBreak::NoWrap);
    assert_eq!(layout.justify, Justify::default());

    // Neither set → no layout.
    assert!(text_layout(Some(&style(serde_json::json!({})))).is_none());

    // Both set are honored.
    let both = style(serde_json::json!({ "textAlign": "center", "lineBreak": "anyCharacter" }));
    let layout = text_layout(Some(&both)).unwrap();
    assert_eq!(layout.justify, Justify::Center);
    assert_eq!(layout.linebreak, LineBreak::AnyCharacter);
}

#[test]
fn overlay_merges_fields() {
    let base = Some(style(serde_json::json!({
        "backgroundColor": "#111111",
        "width": 64,
        "color": "#ffffff",
    })));

    // None overlay leaves base untouched.
    let unchanged = overlay_style(base.as_ref(), None).unwrap();
    assert_eq!(
        unchanged
            .get(&BACKGROUND_COLOR)
            .static_ref()
            .map(String::as_str),
        Some("#111111")
    );

    // Overlaid fields win; unset overlay fields fall through to base.
    let overlay = Some(style(serde_json::json!({ "backgroundColor": "#89b4fa" })));
    let merged = overlay_style(base.as_ref(), overlay.as_ref()).unwrap();
    assert_eq!(
        merged
            .get(&BACKGROUND_COLOR)
            .static_ref()
            .map(String::as_str),
        Some("#89b4fa")
    ); // overridden
    assert_eq!(
        length_to_val(merged.get(&WIDTH).static_val().unwrap()),
        Val::Px(64.0)
    ); // kept from base
    assert_eq!(
        merged.get(&COLOR).static_ref().map(String::as_str),
        Some("#ffffff")
    ); // kept from base

    // Overlay onto an absent base still yields the overlay's fields.
    let from_none = overlay_style(None, overlay.as_ref()).unwrap();
    assert_eq!(
        from_none
            .get(&BACKGROUND_COLOR)
            .static_ref()
            .map(String::as_str),
        Some("#89b4fa")
    );
}

/// A variant carries every property it sets — `filter` (a hover filter
/// re-stamps `FilterInput` through the merged style; promotion never
/// flips — it unions variant presence) and `focusPolicy` alike.
#[test]
fn overlay_carries_every_property() {
    let base = Some(style(serde_json::json!({
        "filter": { "name": "blur", "params": { "radius": 4 } },
        "focusPolicy": "block",
    })));
    let overlay = Some(style(serde_json::json!({
        "filter": { "name": "blur", "params": { "radius": 9 } },
        "focusPolicy": "pass",
        "backgroundColor": "red",
    })));
    let merged = overlay_style(base.as_ref(), overlay.as_ref()).unwrap();
    // The variant's chain wins wholesale (CSS shorthand semantics, like
    // `transform`).
    assert_eq!(merged.get(&FILTER), overlay.as_ref().unwrap().get(&FILTER));
    assert_ne!(merged.get(&FILTER), base.as_ref().unwrap().get(&FILTER));
    assert_eq!(merged.get(&FOCUS_POLICY).copied(), Some(FocusPolicy::Pass));
    assert_eq!(
        merged
            .get(&BACKGROUND_COLOR)
            .static_ref()
            .map(String::as_str),
        Some("red")
    );

    // A variant with no filter falls through to the base chain.
    let no_filter = Some(style(serde_json::json!({ "backgroundColor": "red" })));
    let merged = overlay_style(base.as_ref(), no_filter.as_ref()).unwrap();
    assert_eq!(merged.get(&FILTER), base.as_ref().unwrap().get(&FILTER));
}

#[test]
fn overlay_replaces_transform_wholesale() {
    let base = Some(style(serde_json::json!({
        "transform": { "translateX": 10, "scale": 1 },
    })));
    // Whole-object replace (CSS shorthand semantics): press's transform wins
    // entirely, dropping the base's translateX.
    let press = Some(style(serde_json::json!({ "transform": { "scale": 0.95 } })));
    let merged = overlay_style(base.as_ref(), press.as_ref()).unwrap();
    let t = merged.get(&TRANSFORM).unwrap();
    assert_eq!(t.scale.static_val(), Some(0.95));
    assert_eq!(t.translate_x, None);
}

#[test]
fn node_covers_layout() {
    let s = style(serde_json::json!({
        "display": "grid",
        "positionType": "absolute",
        "left": "10px",
        "flexGrow": 2,
        "gap": 12,
    }));
    let node = node_from(Some(&s));
    assert_eq!(node.display, Display::Grid);
    assert_eq!(node.position_type, PositionType::Absolute);
    assert_eq!(node.left, Val::Px(10.0));
    assert_eq!(node.flex_grow, 2.0);
    assert_eq!(node.row_gap, Val::Px(12.0));
    assert_eq!(node.column_gap, Val::Px(12.0));
}

/// Grid fields arrive pre-parsed from the serde boundary (see
/// `protocol::tests` for the parsing itself); `node_from` copies them
/// into the `Node` verbatim.
#[test]
fn grid_templates_and_placement() {
    let s = style(serde_json::json!({
        "gridTemplateColumns": "1fr 2fr 100px",
        "gridAutoRows": "auto 40px",
        "gridRow": "2 / span 3",
    }));
    let node = node_from(Some(&s));
    assert_eq!(node.grid_template_columns.len(), 3);
    assert_eq!(node.grid_auto_rows.len(), 2);
    assert_eq!(
        format!("{:?}", node.grid_row),
        format!("{:?}", GridPlacement::start_span(2, 3))
    );
}

#[test]
fn text_style_resolves() {
    let s = style(serde_json::json!({
        "color": "#7aa2f7", "fontSize": 20, "fontWeight": "bold"
    }));
    let (color, font, ..) = resolved_text_style(Some(&s), &Fonts::default(), false);
    assert_eq!(color.0, parse_color("#7aa2f7"));
    assert_eq!(font.font_size, (20.0f32).into());
    assert_eq!(font.weight, FontWeight::BOLD);
}

#[test]
fn font_size_units() {
    let fs = |v: serde_json::Value| {
        resolved_text_style(
            Some(&style(serde_json::json!({ "fontSize": v }))),
            &Fonts::default(),
            false,
        )
        .1
        .font_size
    };
    // bare number and "px" are both logical pixels.
    assert_eq!(fs(serde_json::json!(24)), BevyFontSize::Px(24.0));
    assert_eq!(fs(serde_json::json!("24px")), BevyFontSize::Px(24.0));
    // viewport + rem units map one-to-one onto bevy's `FontSize`.
    assert_eq!(fs(serde_json::json!("2vw")), BevyFontSize::Vw(2.0));
    assert_eq!(fs(serde_json::json!("1.5rem")), BevyFontSize::Rem(1.5));
}

/// Decoded text enums flow through to the `TextLayout` (keyword parsing
/// itself is covered in `protocol::tests`).
#[test]
fn text_enums() {
    let layout = text_layout(Some(&style(serde_json::json!({ "textAlign": "right" })))).unwrap();
    assert_eq!(layout.justify, Justify::Right);
}
