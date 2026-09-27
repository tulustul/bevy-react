//! Tests for the JSX `<svg>` raster + its animation/transition consumers —
//! same-frame derived dirt (`Changed<SvgShape>`/`Changed<Children>`),
//! pixel-proof re-rasters, the zero-mutable-deref clean frame, and the
//! writer→raster same-frame ordering contracts.

use bevy::prelude::*;
use bevy::ui::widget::ImageNode;
use bevy::ui::{ComputedNode, ContentSize};

use super::{SvgJsxSurface, SvgShape, update_jsx_svg_surfaces};
use bevy_react_core::protocol::{ROOT_ID, op::Op};
use bevy_react_core::svg::stamp_svg_measures;
use bevy_react_core::test_util::{ent, update_delta};

use serde_json::json;

/// [`op_app`] wired with the raster system + layer dirt, like the plugin.
fn jsx_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (mut app, tx) = crate::test_app();
    app.init_resource::<bevy_react_core::layer::LayerContentDirt>();
    app.add_systems(
        Update,
        update_jsx_svg_surfaces.after(bevy_react_core::test_util::apply_js_ops),
    );
    (app, tx)
}

/// `Op::Create` for an arbitrary `kind` with the given props JSON.
fn create_kind(id: u32, kind: &str, props: serde_json::Value) -> Op {
    Op::Create {
        id,
        kind: kind.into(),
        props: serde_json::from_value(props).expect("valid props"),
        text: None,
    }
}

/// A delta carrying the given props JSON.
fn delta(id: u32, props: serde_json::Value) -> Op {
    update_delta(id, serde_json::from_value(props).unwrap(), &[], &[])
}

/// Fabricate last frame's layout: `w`×`h` physical px.
fn lay_out(app: &mut App, e: Entity, w: f32, h: f32) {
    app.world_mut().entity_mut(e).insert(ComputedNode {
        size: Vec2::new(w, h),
        ..Default::default()
    });
}

/// One texel of the element-owned texture, straight-alpha RGBA.
fn texel(app: &App, e: Entity, x: u32, y: u32) -> [u8; 4] {
    let handle = app
        .world()
        .entity(e)
        .get::<ImageNode>()
        .unwrap()
        .image
        .clone();
    let image = app
        .world()
        .resource::<Assets<Image>>()
        .get(&handle)
        .unwrap();
    let w = image.size().x;
    let data = image.data.as_ref().expect("CPU pixels written");
    let i = 4 * (y * w + x) as usize;
    data[i..i + 4].try_into().unwrap()
}

fn clear_dirt(app: &mut App) {
    app.world_mut()
        .resource_mut::<bevy_react_core::layer::LayerContentDirt>()
        .nodes
        .clear();
}

fn dirt_contains(app: &App, e: Entity) -> bool {
    app.world()
        .resource::<bevy_react_core::layer::LayerContentDirt>()
        .nodes
        .contains(&e)
}

fn surface_tick(app: &App, e: Entity) -> bevy::ecs::change_detection::Tick {
    app.world()
        .entity(e)
        .get_change_ticks::<SvgJsxSurface>()
        .unwrap()
        .changed
}

/// Mount `<svg viewBox="0 0 100 100">` with a red circle (cx 30, cy 50,
/// r 20) and paint it at 100×100 physical px (identity user→px mapping);
/// returns the settled root.
fn mounted_circle(app: &mut App, tx: &crossbeam_channel::Sender<Vec<Op>>) -> Entity {
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(
            2,
            "circle",
            json!({ "shape": { "cx": 30.0, "cy": 50.0, "r": 20.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    app.update();
    let e = ent(app, 1);
    lay_out(app, e, 100.0, 100.0);
    app.update();
    e
}

/// End-to-end first paint: mount `<svg><circle/></svg>` via ops, give the
/// root a laid-out size, run one frame — the circle's pixels land in the
/// element-owned texture, the layer dirt taps, and the parked mount state
/// (`dirty: true, doc: None`) is consumed. A second clean frame takes zero
/// mutable derefs.
#[test]
fn jsx_first_paint_rasters_shapes_then_idles() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(
            2,
            "circle",
            json!({ "shape": { "cx": 50.0, "cy": 50.0, "r": 40.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    assert!(
        app.world().entity(e).get::<SvgJsxSurface>().unwrap().dirty,
        "parked until laid out"
    );

    lay_out(&mut app, e, 100.0, 100.0);
    clear_dirt(&mut app);
    app.update();

    let surface = app.world().entity(e).get::<SvgJsxSurface>().unwrap();
    assert_eq!(surface.last_size, UVec2::new(100, 100));
    assert!(!surface.dirty, "the first paint consumes the mount state");
    assert_eq!(
        texel(&app, e, 50, 50),
        [255, 0, 0, 255],
        "circle center is opaque red"
    );
    assert_eq!(texel(&app, e, 2, 2)[3], 0, "corner outside the circle");
    assert!(
        dirt_contains(&app, e),
        "a real pixel upload must dirty the owning layer"
    );

    // Idle second frame: no re-raster, not a single mutable deref.
    clear_dirt(&mut app);
    let tick = surface_tick(&app, e);
    app.update();
    assert_eq!(
        surface_tick(&app, e),
        tick,
        "a clean frame must not tick the surface"
    );
    assert!(
        app.world()
            .resource::<bevy_react_core::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "a clean frame must not re-raster or re-upload"
    );
}

/// THE queued-write visibility proof: a `shape` delta is a command queued by
/// `apply_js_ops` and flushed before the raster system — `Changed<SvgShape>`
/// must see it and repaint in the SAME `app.update()`. The re-raster rides
/// derived dirt alone: `SvgJsxSurface` is never ticked.
#[test]
fn shape_delta_rerasters_same_frame() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);
    assert_eq!(texel(&app, e, 30, 50), [255, 0, 0, 255]);
    assert_eq!(texel(&app, e, 70, 50)[3], 0);

    clear_dirt(&mut app);
    let tick = surface_tick(&app, e);
    tx.send(vec![delta(
        2,
        json!({ "shape": { "cx": 70.0, "cy": 50.0, "r": 20.0, "fill": "red" } }),
    )])
    .unwrap();
    app.update(); // ONE frame

    assert_eq!(
        texel(&app, e, 70, 50),
        [255, 0, 0, 255],
        "the moved circle must paint the same frame as the op"
    );
    assert_eq!(
        texel(&app, e, 30, 50)[3],
        0,
        "the old position repaints away"
    );
    assert!(dirt_contains(&app, e));
    assert_eq!(
        surface_tick(&app, e),
        tick,
        "derived dirt re-rasters without touching SvgJsxSurface"
    );
}

/// Child-list changes re-raster: an appended shape paints on top the same
/// frame, and a pure reorder (no shape data changed) re-rasters through the
/// `Changed<Children>` path — pixel-proven by the overlap order flipping.
#[test]
fn child_list_changes_reraster() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})),
        create_kind(
            2,
            "rect",
            json!({ "shape": { "width": 40.0, "height": 40.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 40.0, 40.0);
    app.update();
    assert_eq!(texel(&app, e, 20, 20), [255, 0, 0, 255]);

    // Append a fully-overlapping blue rect: it paints on top, same frame.
    clear_dirt(&mut app);
    tx.send(vec![
        create_kind(
            3,
            "rect",
            json!({ "shape": { "width": 40.0, "height": 40.0, "fill": "blue" } }),
        ),
        Op::Append {
            parent: 1,
            child: 3,
        },
    ])
    .unwrap();
    app.update();
    assert_eq!(
        texel(&app, e, 20, 20),
        [0, 0, 255, 255],
        "the appended shape paints on top, same frame"
    );
    assert!(dirt_contains(&app, e));

    // Pure reorder: move red to the end. No SvgShape changes — only
    // Changed<Children> can trigger this repaint.
    clear_dirt(&mut app);
    let tick = surface_tick(&app, e);
    tx.send(vec![Op::Append {
        parent: 1,
        child: 2,
    }])
    .unwrap();
    app.update();
    assert_eq!(
        texel(&app, e, 20, 20),
        [255, 0, 0, 255],
        "a pure reorder re-rasters via Changed<Children>"
    );
    assert!(dirt_contains(&app, e));
    assert_eq!(surface_tick(&app, e), tick);
}

/// A nested `<g transform="translate(20 0)" opacity="0.5">` composes into its
/// child: the circle paints offset by the group translate and faded by the
/// group opacity (straight-alpha red survives, alpha halves).
#[test]
fn group_transform_and_opacity_compose_into_children() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})), // no viewBox: logical-px space
        create_kind(
            2,
            "g",
            json!({ "shape": { "transform": "translate(20 0)", "opacity": 0.5 } }),
        ),
        create_kind(
            3,
            "circle",
            json!({ "shape": { "cx": 20.0, "cy": 20.0, "r": 10.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
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
    let e = ent(&app, 1);
    lay_out(&mut app, e, 80.0, 40.0);
    app.update();

    assert_eq!(
        texel(&app, e, 20, 20)[3],
        0,
        "the untranslated position is empty — the g transform applied"
    );
    let [r, _, _, a] = texel(&app, e, 40, 20);
    assert!(
        (120..=135).contains(&a),
        "g opacity 0.5 fades the child, got alpha {a}"
    );
    assert!(r >= 250, "straight-alpha red survives the fade, got {r}");
}

/// A `viewBox` update (C3's queued dirty write) rescales the content: the
/// same circle repaints at half scale after the user-unit space doubles.
#[test]
fn view_box_update_rescales_content() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);
    assert_eq!(texel(&app, e, 30, 50), [255, 0, 0, 255]);

    clear_dirt(&mut app);
    tx.send(vec![delta(1, json!({ "viewBox": "0 0 200 200" }))])
        .unwrap();
    app.update();

    // Meet-scale 0.5: the circle now sits at (15,25) with r 10.
    assert_eq!(
        texel(&app, e, 15, 25),
        [255, 0, 0, 255],
        "content rescales under the new viewBox"
    );
    assert_eq!(texel(&app, e, 30, 50)[3], 0, "old-scale position is empty");
    assert!(dirt_contains(&app, e));
    assert!(
        !app.world().entity(e).get::<SvgJsxSurface>().unwrap().dirty,
        "the viewBox repaint request is consumed"
    );
}

/// The hidden-node fix, JSX flavor: derived dirt (`Changed<SvgShape>`) seen
/// while the node has zero size is a one-shot signal — it must persist into
/// `surface.dirty` so a re-show at the *same* size still repaints.
#[test]
fn shape_change_while_hidden_persists_into_dirty() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);

    // Hide (zero size), then recolor the circle while hidden.
    app.world_mut()
        .entity_mut(e)
        .insert(ComputedNode::default());
    clear_dirt(&mut app);
    tx.send(vec![delta(
        2,
        json!({ "shape": { "cx": 30.0, "cy": 50.0, "r": 20.0, "fill": "blue" } }),
    )])
    .unwrap();
    app.update();
    assert!(
        app.world().entity(e).get::<SvgJsxSurface>().unwrap().dirty,
        "a shape change seen while hidden must persist into dirty"
    );
    assert!(
        app.world()
            .resource::<bevy_react_core::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "no raster while hidden"
    );

    // Re-show at the SAME size: only the persisted flag can trigger this.
    lay_out(&mut app, e, 100.0, 100.0);
    app.update();
    assert_eq!(
        texel(&app, e, 30, 50),
        [0, 0, 255, 255],
        "re-show repaints with the change made while hidden"
    );
    assert!(!app.world().entity(e).get::<SvgJsxSurface>().unwrap().dirty);
}

/// JSX surfaces size purely by style: the measure re-stamp system (an
/// svg-mode `<image>` concern) must leave a JSX root's `ContentSize` alone
/// even when its `ImageNode` trigger fires.
#[test]
fn stamp_system_ignores_jsx_surfaces() {
    let (mut app, tx) = crate::test_app();
    app.add_systems(PostUpdate, stamp_svg_measures);
    tx.send(vec![create_kind(1, "svg", json!({}))]).unwrap();
    app.update();
    let e = ent(&app, 1);
    app.update(); // settle mount-frame change flags

    let tick = app
        .world()
        .entity(e)
        .get_change_ticks::<ContentSize>()
        .unwrap()
        .changed;
    // Fire the stamp system's trigger: tick the ImageNode.
    app.world_mut()
        .entity_mut(e)
        .get_mut::<ImageNode>()
        .unwrap()
        .set_changed();
    app.update();
    assert_eq!(
        app.world()
            .entity(e)
            .get_change_ticks::<ContentSize>()
            .unwrap()
            .changed,
        tick,
        "a JSX (doc-less) surface must never stamp an intrinsic measure"
    );
}

/// Removing the LAST shape child: bevy's `ChildOf` on_remove hook REMOVES the
/// now-empty `Children` component outright, so `Changed<Children>` can never
/// see it — the removal must derive dirt through `RemovedComponents<Children>`
/// instead, and repaint (to transparent) the same frame.
#[test]
fn removing_the_last_shape_clears_the_raster() {
    let (mut app, tx) = jsx_app();
    let e = mounted_circle(&mut app, &tx);
    assert_eq!(texel(&app, e, 30, 50), [255, 0, 0, 255]);

    clear_dirt(&mut app);
    tx.send(vec![Op::Remove {
        parent: 1,
        child: 2,
    }])
    .unwrap();
    app.update(); // ONE frame

    assert_eq!(
        texel(&app, e, 30, 50)[3],
        0,
        "removing the only shape must repaint to transparent, same frame"
    );
    assert!(dirt_contains(&app, e));
}

// --- Animation-driven shape attrs (E2) ---

use bevy_react_core::animations::{AnimationCommand, AnimationSet, ReactUiAnimationsPlugin};
use bevy_react_core::protocol::animatable::AnimatableField;

/// [`jsx_app`] plus the animations engine, wired with the SAME ordering the
/// plugin declares: `AnimationSet::Apply` after `apply_js_ops`, the svg
/// consumer of the engine's publish (`apply_driven_shape_attrs`) after the
/// apply, and `update_jsx_svg_surfaces` after all of them — the driven-write→
/// raster same-frame contract under test below.
fn jsx_anim_app() -> (
    App,
    crossbeam_channel::Sender<Vec<Op>>,
    crossbeam_channel::Sender<AnimationCommand>,
) {
    let (mut app, tx) = crate::test_app();
    app.init_resource::<bevy_react_core::layer::LayerContentDirt>();
    let (anim_tx, anim_rx) = crossbeam_channel::unbounded();
    app.add_plugins(ReactUiAnimationsPlugin::new(anim_rx));
    app.configure_sets(
        Update,
        AnimationSet::Apply.after(bevy_react_core::test_util::apply_js_ops),
    );
    app.add_systems(
        Update,
        (
            crate::apply_driven_shape_attrs.after(AnimationSet::Apply),
            update_jsx_svg_surfaces
                .after(bevy_react_core::test_util::apply_js_ops)
                .after(AnimationSet::Apply)
                .after(crate::apply_driven_shape_attrs),
        ),
    );
    (app, tx, anim_tx)
}

/// THE Apply→raster ordering proof: a driven shape attr (`r` bound to a
/// shared value) must repaint in the SAME `app.update()` as the value change
/// — the animation apply stage writes the seed before the raster reads it.
/// The repaint rides `Changed<SvgShape>` alone (`SvgJsxSurface` never ticked),
/// and a settled driver is completely quiet (no shape tick, no repaint).
#[test]
fn driven_shape_attr_repaints_same_frame() {
    let (mut app, tx, anim) = jsx_anim_app();
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(
            2,
            "circle",
            json!({ "shape": {
                "cx": 50.0, "cy": 50.0, "fill": "red",
                "r": { "animated": { "id": 1 }, "seed": 20.0 },
            } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    anim.send(AnimationCommand::Declare {
        id: 1,
        initial: 20.0,
    })
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 100.0, 100.0);
    app.update();
    assert_eq!(texel(&app, e, 50, 50), [255, 0, 0, 255]);
    assert_eq!(
        texel(&app, e, 85, 50)[3],
        0,
        "radius 20: (85,50) is outside"
    );

    // Drive r to 40 and run ONE frame: the driven write must land before the
    // raster reads it, or this frame still paints the old radius.
    clear_dirt(&mut app);
    let s_tick = surface_tick(&app, e);
    anim.send(AnimationCommand::Set { id: 1, value: 40.0 })
        .unwrap();
    app.update();

    assert_eq!(
        texel(&app, e, 85, 50),
        [255, 0, 0, 255],
        "the driven radius must paint the SAME frame (Apply → raster ordering)"
    );
    let shape_entity = ent(&app, 2);
    let shape = app.world().entity(shape_entity).get::<SvgShape>().unwrap();
    assert_eq!(
        shape.attrs.r.static_or_seed(),
        Some(40.0),
        "the driven value lives in the seed slot"
    );
    assert!(
        dirt_contains(&app, e),
        "the repaint dirtied the owning layer"
    );
    assert_eq!(
        surface_tick(&app, e),
        s_tick,
        "driven repaints ride Changed<SvgShape> — SvgJsxSurface untouched"
    );

    // Settled: a clean frame ticks neither the shape nor a repaint.
    clear_dirt(&mut app);
    let shape_tick = app
        .world()
        .entity(shape_entity)
        .get_change_ticks::<SvgShape>()
        .unwrap()
        .changed;
    app.update();
    assert_eq!(
        app.world()
            .entity(shape_entity)
            .get_change_ticks::<SvgShape>()
            .unwrap()
            .changed,
        shape_tick,
        "a settled driver must not tick Changed<SvgShape>"
    );
    assert!(
        app.world()
            .resource::<bevy_react_core::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "a settled driver must not re-raster"
    );
}

/// A driven `<g>` opacity fades its children the same frame: the group's
/// seed write composes through the walk (`static_or_seed`) into the leaf's
/// painted alpha.
#[test]
fn driven_group_opacity_fades_children_same_frame() {
    let (mut app, tx, anim) = jsx_anim_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})), // no viewBox: logical-px space
        create_kind(
            2,
            "g",
            json!({ "shape": { "opacity": { "animated": { "id": 1 }, "seed": 1.0 } } }),
        ),
        create_kind(
            3,
            "circle",
            json!({ "shape": { "cx": 20.0, "cy": 20.0, "r": 10.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
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
    anim.send(AnimationCommand::Declare {
        id: 1,
        initial: 1.0,
    })
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 40.0, 40.0);
    app.update();
    assert_eq!(texel(&app, e, 20, 20), [255, 0, 0, 255]);

    anim.send(AnimationCommand::Set { id: 1, value: 0.5 })
        .unwrap();
    app.update();
    let [r, _, _, a] = texel(&app, e, 20, 20);
    assert!(
        (120..=135).contains(&a),
        "driven g opacity 0.5 must fade the child the same frame, got alpha {a}"
    );
    assert!(r >= 250, "straight-alpha red survives the fade, got {r}");
}

/// The nested variant: emptying a `<g>` (its only child removed) also loses
/// the g's `Children` component — the removal signal must climb from the
/// still-alive group to the root.
#[test]
fn removing_a_groups_last_child_clears_its_paint() {
    let (mut app, tx) = jsx_app();
    tx.send(vec![
        create_kind(1, "svg", json!({})),
        create_kind(2, "g", json!({})),
        create_kind(
            3,
            "circle",
            json!({ "shape": { "cx": 20.0, "cy": 20.0, "r": 10.0, "fill": "red" } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
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
    let e = ent(&app, 1);
    lay_out(&mut app, e, 40.0, 40.0);
    app.update();
    assert_eq!(texel(&app, e, 20, 20), [255, 0, 0, 255]);

    clear_dirt(&mut app);
    tx.send(vec![Op::Remove {
        parent: 2,
        child: 3,
    }])
    .unwrap();
    app.update();

    assert_eq!(
        texel(&app, e, 20, 20)[3],
        0,
        "emptying a nested <g> must repaint the root to transparent"
    );
    assert!(dirt_contains(&app, e));
}

// --- Transition-eased shape attrs (E3) ---

/// [`jsx_app`] with the SAME writer→raster ordering the plugin declares for
/// the shape transition drive (svg's own system, `register_ext`):
/// `drive_shape_transitions` after `apply_js_ops` and `update_jsx_svg_surfaces`
/// after BOTH. Manual `Time` so the ease can be advanced to exact points.
fn jsx_transition_app() -> (App, crossbeam_channel::Sender<Vec<Op>>) {
    let (mut app, tx) = crate::test_app_manual_time();
    app.init_resource::<bevy_react_core::layer::LayerContentDirt>();
    app.add_systems(
        Update,
        (
            crate::drive_shape_transitions.after(bevy_react_core::test_util::apply_js_ops),
            update_jsx_svg_surfaces
                .after(bevy_react_core::test_util::apply_js_ops)
                .after(crate::drive_shape_transitions),
        ),
    );
    (app, tx)
}

fn advance_time(app: &mut App, secs: f32) {
    app.world_mut()
        .resource_mut::<Time>()
        .advance_by(std::time::Duration::from_secs_f32(secs));
}

/// THE transition→raster ordering pin: an eased shape attr must repaint in
/// the SAME `app.update()` that eased it — `drive_transitions` writes
/// `SvgShape` before `update_jsx_svg_surfaces` reads it. A `cx` retarget through
/// the real op path paints the mid-ease position (not the start, not the
/// snapped target) on the mid-duration frame, and the settled frame goes
/// completely quiet.
#[test]
fn eased_shape_attr_repaints_same_frame() {
    let (mut app, tx) = jsx_transition_app();
    let shape = serde_json::json!({
        "cx": 30.0, "cy": 50.0, "r": 10.0, "fill": "red",
        "transition": { "cx": { "duration": 1000, "easing": "linear" } },
    });
    tx.send(vec![
        create_kind(1, "svg", json!({ "viewBox": "0 0 100 100" })),
        create_kind(2, "circle", json!({ "shape": shape })),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
        Op::Append {
            parent: 1,
            child: 2,
        },
    ])
    .unwrap();
    app.update();
    let e = ent(&app, 1);
    lay_out(&mut app, e, 100.0, 100.0);
    app.update();
    assert_eq!(
        texel(&app, e, 30, 50),
        [255, 0, 0, 255],
        "first sight snaps to cx=30 (no ease-in)"
    );

    // Retarget cx 30 → 70 through the real op path. Mid-duration frame:
    // the eased position (≈50) paints THIS frame.
    tx.send(vec![delta(
        2,
        json!({ "shape": {
            "cx": 70.0, "cy": 50.0, "r": 10.0, "fill": "red",
            "transition": { "cx": { "duration": 1000, "easing": "linear" } },
        } }),
    )])
    .unwrap();
    advance_time(&mut app, 0.5);
    app.update(); // ONE frame: op merge → ease → raster

    assert_eq!(
        texel(&app, e, 50, 50),
        [255, 0, 0, 255],
        "the mid-ease position must paint the SAME frame (drive → raster ordering)"
    );
    assert_eq!(
        texel(&app, e, 30, 50)[3],
        0,
        "start position repainted away"
    );
    assert_eq!(texel(&app, e, 70, 50)[3], 0, "target not snapped to");

    // Finish the ease: exactly the target.
    advance_time(&mut app, 0.5);
    app.update();
    assert_eq!(texel(&app, e, 70, 50), [255, 0, 0, 255]);
    assert_eq!(texel(&app, e, 50, 50)[3], 0);

    // Settled: a further frame ticks nothing and re-rasters nothing.
    clear_dirt(&mut app);
    let shape_entity = ent(&app, 2);
    let tick = app
        .world()
        .entity(shape_entity)
        .get_change_ticks::<SvgShape>()
        .unwrap()
        .changed;
    advance_time(&mut app, 0.5);
    app.update();
    assert_eq!(
        app.world()
            .entity(shape_entity)
            .get_change_ticks::<SvgShape>()
            .unwrap()
            .changed,
        tick,
        "a settled shape transition must not tick Changed<SvgShape>"
    );
    assert!(
        app.world()
            .resource::<bevy_react_core::layer::LayerContentDirt>()
            .nodes
            .is_empty(),
        "a settled shape transition must not re-raster"
    );
}
