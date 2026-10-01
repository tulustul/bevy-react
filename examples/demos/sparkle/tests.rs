//! `sparkle`: the core stamps it through the real op path, and the app's
//! systems turn the stamp into particles.

use std::time::Duration;

use bevy::prelude::*;
use bevy::ui::{ComputedNode, UiGlobalTransform};
use bevy_react::protocol::{ROOT_ID, op::Op};
use bevy_react::style::StyleValue;
use bevy_react_core::test_util::{create, ent, op_app_with, update};
use serde_json::json;

use super::{
    BURST_COUNT, Emitter, Particle, Sparkle, SparkleBurst, SparkleLayer, animate_sparkles,
    burst_sparkles, emit_sparkles,
};

/// With the property registered and no writer reading it, the core stamps
/// the merged value as `StyleValue<Sparkle>` — and removes it on unset.
#[test]
fn sparkle_style_is_stamped() {
    let (mut app, tx) = op_app_with(super::register_bindings);
    tx.send(vec![
        create(
            1,
            "node",
            json!({ "style": { "sparkle": { "rate": 12, "color": "red" } } }),
        ),
        Op::Append {
            parent: ROOT_ID,
            child: 1,
        },
    ])
    .unwrap();
    app.update();
    let node = ent(&app, 1);
    assert_eq!(
        app.world().entity(node).get::<StyleValue<Sparkle>>(),
        Some(&StyleValue(Sparkle {
            rate: 12.0,
            color: Some("red".into()),
            size: None,
        }))
    );

    tx.send(vec![update(1, "node", json!({}), &[], &["sparkle"])])
        .unwrap();
    app.update();
    assert!(
        !app.world().entity(node).contains::<StyleValue<Sparkle>>(),
        "unsetting the style removes the stamp"
    );
}

/// A particle-system world with a 100×40 emitter at (200, 100), advanced
/// in fixed 50 ms frames.
fn particle_world() -> (World, Schedule, Entity) {
    let mut world = World::new();
    world.insert_resource(Time::<()>::default());
    world.spawn(SparkleLayer);
    let emitter = world
        .spawn((
            StyleValue(Sparkle {
                rate: 40.0,
                color: None,
                size: None,
            }),
            ComputedNode {
                size: Vec2::new(100.0, 40.0),
                inverse_scale_factor: 1.0,
                ..default()
            },
            UiGlobalTransform::from_translation(Vec2::new(200.0, 100.0)),
            InheritedVisibility::VISIBLE,
        ))
        .id();
    let mut schedule = Schedule::default();
    schedule.add_systems((emit_sparkles, animate_sparkles).chain());
    (world, schedule, emitter)
}

fn frame(world: &mut World, schedule: &mut Schedule) {
    world
        .resource_mut::<Time>()
        .advance_by(Duration::from_millis(50));
    schedule.run(world);
}

fn particles(world: &mut World) -> Vec<(Node, Entity)> {
    world
        .query_filtered::<(&Node, &ChildOf), With<Particle>>()
        .iter(world)
        .map(|(n, c)| (n.clone(), c.parent()))
        .collect()
}

/// Particles spawn at the emitter's rate, inside its box, under the overlay
/// layer; once the style is gone emission stops and the live ones expire.
#[test]
fn sparkles_emit_and_expire() {
    let (mut world, mut schedule, emitter) = particle_world();
    for _ in 0..10 {
        frame(&mut world, &mut schedule);
    }
    let live = particles(&mut world);
    // 40/s over ~0.45 s of emitting (the first frame only attaches state).
    assert!(
        (15..=20).contains(&live.len()),
        "{} particles after half a second",
        live.len()
    );
    let layer = world
        .query_filtered::<Entity, With<SparkleLayer>>()
        .single(&world)
        .unwrap();
    for (node, parent) in &live {
        assert_eq!(*parent, layer);
        let Val::Px(left) = node.left else {
            panic!("px left")
        };
        let Val::Px(top) = node.top else {
            panic!("px top")
        };
        // Centered on a point of the 150..250 × 80..120 box.
        assert!((148.0..=252.0).contains(&(left + 2.0)), "left {left}");
        assert!((78.0..=122.0).contains(&(top + 2.0)), "top {top}");
    }

    world.entity_mut(emitter).remove::<StyleValue<Sparkle>>();
    frame(&mut world, &mut schedule);
    assert!(
        !world.entity(emitter).contains::<Emitter>(),
        "a stopped emitter drops its state"
    );
    for _ in 0..25 {
        frame(&mut world, &mut schedule);
    }
    assert!(particles(&mut world).is_empty(), "every particle expired");
}

/// A `sparkleBurst` key bursts only when it changes: the first value is
/// recorded, a new one fires a full ring, and an unchanged re-stamp (a
/// variant switch) never fires again.
#[test]
fn sparkle_burst_fires_on_key_change() {
    let mut world = World::new();
    world.insert_resource(Time::<()>::default());
    world.spawn(SparkleLayer);
    let node = world
        .spawn((
            StyleValue(SparkleBurst(0.0)),
            ComputedNode {
                size: Vec2::new(100.0, 40.0),
                inverse_scale_factor: 1.0,
                ..default()
            },
            UiGlobalTransform::from_translation(Vec2::new(200.0, 100.0)),
            InheritedVisibility::VISIBLE,
        ))
        .id();
    let mut schedule = Schedule::default();
    schedule.add_systems(burst_sparkles);

    schedule.run(&mut world);
    assert!(
        particles(&mut world).is_empty(),
        "the first key only records"
    );

    world.entity_mut(node).insert(StyleValue(SparkleBurst(1.0)));
    schedule.run(&mut world);
    let burst = particles(&mut world);
    assert_eq!(burst.len(), BURST_COUNT as usize);
    // Launched from the ellipse inscribed in the box, in every direction.
    let (mut left, mut right) = (false, false);
    for (node, _) in &burst {
        let Val::Px(x) = node.left else {
            panic!("px left")
        };
        left |= x < 200.0 - 20.0;
        right |= x > 200.0 + 20.0;
    }
    assert!(left && right, "the ring spreads both ways");

    world.entity_mut(node).insert(StyleValue(SparkleBurst(1.0)));
    schedule.run(&mut world);
    assert_eq!(
        particles(&mut world).len(),
        BURST_COUNT as usize,
        "an unchanged key never bursts again"
    );
}
