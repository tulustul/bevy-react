//! Headless check that a shared value lives exactly as long as the component
//! that declared it, against the real JS runtime: a hot reload — which makes
//! React re-run every effect on components that stay mounted — releases
//! nothing, and navigating away from a page releases that page's values.
//!
//! Requires the example bundle to be built first:
//!   npm install && npm run build -w demos
//! If the bundle is missing the test skips (passes) with a notice.

use std::collections::HashSet;
use std::time::{Duration, Instant};

use bevy_react::animations::AnimationCommand;

use bevy_react::JsEngine;

mod common;
use common::Harness;

/// Pump for `dur`, returning the animation commands the JS side sent.
fn commands(h: &mut Harness, dur: Duration) -> Vec<AnimationCommand> {
    let deadline = Instant::now() + dur;
    let mut out = Vec::new();
    while Instant::now() < deadline {
        h.recv(Duration::from_millis(25));
        out.extend(h.anims.try_iter());
    }
    out
}

fn ids(cmds: &[AnimationCommand], pick: fn(&AnimationCommand) -> Option<u32>) -> Vec<u32> {
    cmds.iter().filter_map(pick).collect()
}

fn released(c: &AnimationCommand) -> Option<u32> {
    match c {
        AnimationCommand::Release { id } => Some(*id),
        _ => None,
    }
}

fn declared(c: &AnimationCommand) -> Option<u32> {
    match c {
        AnimationCommand::Declare { id, .. } => Some(*id),
        _ => None,
    }
}

#[test]
fn shared_values_live_as_long_as_their_component() {
    common::each_engine(shared_values_live_as_long_as_their_component_on);
}

fn shared_values_live_as_long_as_their_component_on(engine: JsEngine) {
    let Some(mut h) = Harness::start("shared_values_live_as_long_as_their_component", engine)
    else {
        return;
    };
    let events = h
        .wait_button("Events", Duration::from_secs(20))
        .expect("no initial render");

    // Home mounted: its vignettes declare values and start drivers in effects.
    let mount = commands(&mut h, Duration::from_secs(1));
    let mut home: HashSet<u32> = ids(&mount, declared).into_iter().collect();
    assert!(!home.is_empty(), "Home declares shared values");
    let early = ids(&mount, released);
    assert!(early.is_empty(), "nothing unmounted yet: {early:?}");
    eprintln!("OK   Home declared {} shared values", home.len());

    // The reload swaps every component function, so React re-runs every
    // effect — cleanup, then setup — on a tree that stays mounted. The drivers
    // the effects start arriving again proves that happened.
    h.reload();
    let mut restarted = false;
    let mut reload = Vec::new();
    let deadline = Instant::now() + Duration::from_secs(10);
    while !restarted {
        assert!(
            Instant::now() < deadline,
            "the reload never re-ran Home's effects"
        );
        let cmds = commands(&mut h, Duration::from_millis(100));
        restarted = cmds
            .iter()
            .any(|c| matches!(c, AnimationCommand::Animate { id, .. } if home.contains(id)));
        reload.extend(cmds);
    }
    reload.extend(commands(&mut h, Duration::from_millis(300)));
    let lost = ids(&reload, released);
    assert!(lost.is_empty(), "a hot reload released {lost:?}");
    home.extend(ids(&reload, declared));
    eprintln!("OK   hot reload re-ran the effects and released nothing");

    // Leaving Home unmounts it: its values are released — and only its: the
    // shell around the page (and the page replacing it) keeps its own.
    h.click(events);
    let left = ids(&commands(&mut h, Duration::from_secs(2)), released);
    assert!(!left.is_empty(), "leaving Home released nothing");
    assert!(
        left.iter().all(|id| home.contains(id)),
        "released values Home never declared: {left:?}"
    );
    eprintln!("OK   leaving Home released {} values", left.len());
}
