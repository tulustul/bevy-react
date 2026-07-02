//! The stateful driver runtime: [`Runner`] evaluates a [`Driver`] over time.
//!
//! Split out of `lib.rs` so the crate root keeps only the ECS orchestration
//! (systems, `SharedValues`, binding evaluation) while the pure time-stepping
//! machinery lives here. Shared with `bevy-react`'s CSS-like `transition`
//! engine, which holds a `Runner` per channel rather than re-implementing
//! easing/spring integration.

use crate::protocol::{Driver, Easing};

const SPRING_REST_DELTA: f32 = 0.01;
const SPRING_REST_SPEED: f32 = 0.01;
const SPRING_SUBSTEP: f32 = 0.001;
const SPRING_MAX_SUBSTEPS: u32 = 64;

fn ease(easing: Easing, t: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    match easing {
        Easing::Linear => t,
        Easing::EaseIn => t * t * t,
        Easing::EaseOut => {
            let u = 1.0 - t;
            1.0 - u * u * u
        }
        Easing::EaseInOut => {
            if t < 0.5 {
                4.0 * t * t * t
            } else {
                let u = -2.0 * t + 2.0;
                1.0 - u * u * u / 2.0
            }
        }
    }
}

/// The stateful evaluation of a [`Driver`] over time. Built from a driver + the
/// value's live reading; advanced by [`Runner::step`].
///
/// Public so `bevy-react`'s CSS-like `transition` engine can reuse the exact same
/// driver runtime (the per-entity transition state holds a `Runner` per channel),
/// rather than re-implementing easing/spring integration.
pub enum Runner {
    /// Degenerate (empty sequence / zero-count repeat): already settled.
    Done(f32),
    Timing {
        from: f32,
        to: f32,
        duration: f32,
        easing: Easing,
        elapsed: f32,
    },
    Spring {
        to: f32,
        stiffness: f32,
        damping: f32,
        mass: f32,
        pos: f32,
        vel: f32,
    },
    Repeat {
        template: Box<Driver>,
        remaining: i32,
        reverse: bool,
        iteration: u32,
        a: f32,
        b: f32,
        child: Box<Runner>,
    },
    Sequence {
        steps: Vec<Driver>,
        index: usize,
        child: Box<Runner>,
    },
    Delay {
        remaining: f32,
        animation: Box<Driver>,
        from: f32,
        child: Option<Box<Runner>>,
    },
}

/// Build a [`Runner`] for `driver` starting from the value `from`. Public for the
/// `bevy-react` transition engine (see [`Runner`]).
pub fn build_runner(driver: &Driver, from: f32) -> Runner {
    build_runner_with_target(driver, from, None)
}

/// Build a runner; `target` overrides the natural endpoint for scalar drivers
/// (used by reverse-repeat to ping-pong). Composite drivers ignore it.
fn build_runner_with_target(driver: &Driver, from: f32, target: Option<f32>) -> Runner {
    match driver {
        Driver::Timing {
            to,
            duration,
            easing,
        } => Runner::Timing {
            from,
            to: target.unwrap_or(*to),
            duration: duration.max(0.0),
            easing: *easing,
            elapsed: 0.0,
        },
        Driver::Spring {
            to,
            stiffness,
            damping,
            mass,
        } => Runner::Spring {
            to: target.unwrap_or(*to),
            // Like `mass` below: clamp to a positive floor so a zero/negative/NaN
            // JS value can't make the integrator diverge to NaN (negative
            // stiffness repels, negative damping injects energy) or oscillate
            // forever without settling. `f32::max` also maps NaN to the floor.
            stiffness: stiffness.max(1e-4),
            damping: damping.max(1e-4),
            mass: mass.max(1e-4),
            pos: from,
            vel: 0.0,
        },
        Driver::Repeat {
            animation,
            count,
            reverse,
        } => {
            if *count == 0 {
                return Runner::Done(from);
            }
            Runner::Repeat {
                template: animation.clone(),
                remaining: *count,
                reverse: *reverse,
                iteration: 0,
                a: from,
                b: terminal_value(animation, from),
                child: Box::new(build_runner(animation, from)),
            }
        }
        Driver::Sequence { steps } => {
            if steps.is_empty() {
                return Runner::Done(from);
            }
            Runner::Sequence {
                steps: steps.clone(),
                index: 0,
                child: Box::new(build_runner(&steps[0], from)),
            }
        }
        Driver::Delay { delay, animation } => Runner::Delay {
            remaining: delay.max(0.0),
            animation: animation.clone(),
            from,
            child: None,
        },
    }
}

/// The value a driver settles on if run to completion from `from` (used to derive
/// repeat endpoints).
fn terminal_value(driver: &Driver, from: f32) -> f32 {
    match driver {
        Driver::Timing { to, .. } => *to,
        Driver::Spring { to, .. } => *to,
        Driver::Sequence { steps } => steps.iter().fold(from, |acc, s| terminal_value(s, acc)),
        Driver::Delay { animation, .. } => terminal_value(animation, from),
        Driver::Repeat {
            animation,
            count,
            reverse,
        } => {
            let a = from;
            let b = terminal_value(animation, from);
            if *count <= 0 {
                b
            } else if *reverse && count % 2 == 0 {
                a
            } else {
                b
            }
        }
    }
}

impl Runner {
    /// Advance by `dt` seconds, returning `(value, finished)`.
    pub fn step(&mut self, dt: f32) -> (f32, bool) {
        match self {
            Runner::Done(v) => (*v, true),
            Runner::Timing {
                from,
                to,
                duration,
                easing,
                elapsed,
            } => {
                *elapsed += dt;
                if *duration <= 0.0 {
                    return (*to, true);
                }
                let t = (*elapsed / *duration).clamp(0.0, 1.0);
                let v = *from + (*to - *from) * ease(*easing, t);
                (v, *elapsed >= *duration)
            }
            Runner::Spring {
                to,
                stiffness,
                damping,
                mass,
                pos,
                vel,
            } => {
                let n = ((dt / SPRING_SUBSTEP).ceil() as u32).clamp(1, SPRING_MAX_SUBSTEPS);
                let h = dt / n as f32;
                for _ in 0..n {
                    let force = -*stiffness * (*pos - *to) - *damping * *vel;
                    let acc = force / *mass;
                    *vel += acc * h;
                    *pos += *vel * h;
                }
                let settled =
                    (*pos - *to).abs() < SPRING_REST_DELTA && vel.abs() < SPRING_REST_SPEED;
                if settled {
                    *pos = *to;
                    *vel = 0.0;
                }
                (*pos, settled)
            }
            Runner::Repeat {
                template,
                remaining,
                reverse,
                iteration,
                a,
                b,
                child,
            } => {
                let (v, done) = child.step(dt);
                if !done {
                    return (v, false);
                }
                if *remaining > 0 {
                    *remaining -= 1;
                    if *remaining == 0 {
                        return (v, true);
                    }
                }
                *iteration += 1;
                let (from, target) = if *reverse {
                    if *iteration % 2 == 0 {
                        (*a, *b)
                    } else {
                        (*b, *a)
                    }
                } else {
                    (*a, *b)
                };
                **child = build_runner_with_target(template, from, Some(target));
                (v, false)
            }
            Runner::Sequence {
                steps,
                index,
                child,
            } => {
                let (v, done) = child.step(dt);
                if !done {
                    return (v, false);
                }
                if *index + 1 >= steps.len() {
                    return (v, true);
                }
                *index += 1;
                **child = build_runner(&steps[*index], v);
                (v, false)
            }
            Runner::Delay {
                remaining,
                animation,
                from,
                child,
            } => {
                if let Some(child) = child {
                    return child.step(dt);
                }
                *remaining -= dt;
                if *remaining > 0.0 {
                    return (*from, false);
                }
                // Delay elapsed: build the child and run it with the leftover time
                // (`-remaining`) so no time is lost crossing the boundary.
                let leftover = -*remaining;
                let mut runner = build_runner(animation, *from);
                let result = runner.step(leftover);
                *child = Some(Box::new(runner));
                result
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn timing(to: f32, duration: f32) -> Driver {
        Driver::Timing {
            to,
            duration,
            easing: Easing::Linear,
        }
    }

    /// Drive a runner to completion in fixed `dt` ticks, returning the final value.
    fn run_to_end(driver: &Driver, from: f32, dt: f32, max_ticks: usize) -> (f32, usize) {
        let mut r = build_runner(driver, from);
        for i in 0..max_ticks {
            let (v, done) = r.step(dt);
            if done {
                return (v, i + 1);
            }
        }
        panic!("runner did not finish in {max_ticks} ticks");
    }

    #[test]
    fn easing_endpoints_and_midpoint() {
        for e in [
            Easing::Linear,
            Easing::EaseIn,
            Easing::EaseOut,
            Easing::EaseInOut,
        ] {
            assert!((ease(e, 0.0) - 0.0).abs() < 1e-6, "{e:?} at 0");
            assert!((ease(e, 1.0) - 1.0).abs() < 1e-6, "{e:?} at 1");
        }
        assert!((ease(Easing::Linear, 0.5) - 0.5).abs() < 1e-6);
        // EaseIn is below the diagonal, EaseOut above, at the midpoint.
        assert!(ease(Easing::EaseIn, 0.5) < 0.5);
        assert!(ease(Easing::EaseOut, 0.5) > 0.5);
    }

    /// Hostile JS spring params (zero/negative/NaN stiffness, damping, mass) are
    /// clamped to a positive floor, so the integrator stays finite and settles
    /// instead of diverging to NaN (and being driven forever).
    #[test]
    fn spring_survives_hostile_params() {
        for (stiffness, damping, mass) in [
            (-1.0, -5.0, 0.0),
            (0.0, 0.0, -1.0),
            (f32::NAN, f32::NAN, f32::NAN),
        ] {
            let driver = Driver::Spring {
                to: 100.0,
                stiffness,
                damping,
                mass,
            };
            let mut r = build_runner(&driver, 0.0);
            let mut settled = false;
            for _ in 0..10_000 {
                let (v, done) = r.step(1.0 / 60.0);
                assert!(
                    v.is_finite(),
                    "diverged with k={stiffness} c={damping} m={mass}"
                );
                if done {
                    settled = true;
                    break;
                }
            }
            assert!(
                settled,
                "never settled with k={stiffness} c={damping} m={mass}"
            );
        }
    }

    #[test]
    fn timing_runs_from_current_to_target() {
        let mut r = build_runner(&timing(100.0, 1.0), 0.0);
        let (v1, done1) = r.step(0.5);
        assert!(!done1);
        assert!((v1 - 50.0).abs() < 1e-3, "halfway expected ~50, got {v1}");
        let (v2, done2) = r.step(0.5);
        assert!(done2);
        assert!((v2 - 100.0).abs() < 1e-3, "end expected 100, got {v2}");
    }

    #[test]
    fn zero_duration_timing_snaps() {
        let mut r = build_runner(&timing(42.0, 0.0), 0.0);
        let (v, done) = r.step(0.016);
        assert!(done);
        assert_eq!(v, 42.0);
    }

    #[test]
    fn spring_settles_on_target() {
        let driver = Driver::Spring {
            to: 100.0,
            stiffness: 120.0,
            damping: 14.0,
            mass: 1.0,
        };
        let (v, ticks) = run_to_end(&driver, 0.0, 1.0 / 60.0, 2000);
        assert!(
            (v - 100.0).abs() < 0.1,
            "spring should settle near 100, got {v}"
        );
        assert!(ticks > 1, "spring should take multiple ticks");
    }

    #[test]
    fn delay_holds_then_runs_child() {
        // Hold at the start value for 0.5s, then time 10 -> 30 over 1s.
        let driver = Driver::Delay {
            delay: 0.5,
            animation: Box::new(timing(30.0, 1.0)),
        };
        let mut r = build_runner(&driver, 10.0);
        let (v1, d1) = r.step(0.25);
        assert!(!d1);
        assert!(
            (v1 - 10.0).abs() < 1e-6,
            "still holding, expected 10, got {v1}"
        );
        let (v2, d2) = r.step(0.25); // delay exactly elapses, child starts (0 leftover)
        assert!(!d2);
        assert!(
            (v2 - 10.0).abs() < 1e-3,
            "child at t=0 expected 10, got {v2}"
        );
        let (v3, _d3) = r.step(0.5); // halfway through the 1s timing
        assert!((v3 - 20.0).abs() < 1e-3, "halfway expected 20, got {v3}");
        let (v4, d4) = r.step(0.5);
        assert!(d4);
        assert!((v4 - 30.0).abs() < 1e-3, "end expected 30, got {v4}");
    }

    #[test]
    fn delay_carries_leftover_time_across_the_boundary() {
        // 0.1s delay, then a 1s timing 0 -> 100. A single 0.6s tick should burn
        // the delay and advance 0.5s into the timing (≈50), losing no time.
        let driver = Driver::Delay {
            delay: 0.1,
            animation: Box::new(timing(100.0, 1.0)),
        };
        let mut r = build_runner(&driver, 0.0);
        let (v, done) = r.step(0.6);
        assert!(!done);
        assert!(
            (v - 50.0).abs() < 1e-3,
            "expected ~50 after leftover, got {v}"
        );
    }

    #[test]
    fn zero_delay_runs_child_immediately() {
        // Covers the i = 0 stagger case: no hold, behaves like the bare child.
        let driver = Driver::Delay {
            delay: 0.0,
            animation: Box::new(timing(100.0, 1.0)),
        };
        let mut r = build_runner(&driver, 0.0);
        let (v, done) = r.step(0.5);
        assert!(!done);
        assert!(
            (v - 50.0).abs() < 1e-3,
            "zero delay should not hold, got {v}"
        );
    }

    #[test]
    fn delay_inside_repeated_sequence_composes() {
        // The exact demo shape: bounce -A -> +A with a stop at each end, looped.
        let amp = 100.0;
        let bounce = Driver::Repeat {
            animation: Box::new(Driver::Sequence {
                steps: vec![
                    Driver::Delay {
                        delay: 0.2,
                        animation: Box::new(timing(amp, 0.5)),
                    },
                    Driver::Delay {
                        delay: 0.2,
                        animation: Box::new(timing(-amp, 0.5)),
                    },
                ],
            }),
            count: -1,
            reverse: false,
        };
        let mut r = build_runner(&bounce, -amp);
        // Run a couple of seconds; it must stay bounded in [-amp, amp] and never finish.
        let mut min = f32::INFINITY;
        let mut max = f32::NEG_INFINITY;
        for _ in 0..240 {
            let (v, done) = r.step(1.0 / 60.0);
            assert!(!done, "infinite bounce must never finish");
            min = min.min(v);
            max = max.max(v);
        }
        assert!(
            min <= -amp + 1.0,
            "should reach the left extreme, min={min}"
        );
        assert!(
            max >= amp - 1.0,
            "should reach the right extreme, max={max}"
        );
        assert!(min >= -amp - 1e-3 && max <= amp + 1e-3, "must stay bounded");
    }

    #[test]
    fn sequence_chains_steps_from_previous_end() {
        // 0 -> 50 -> 120, each over 1s.
        let driver = Driver::Sequence {
            steps: vec![timing(50.0, 1.0), timing(120.0, 1.0)],
        };
        let mut r = build_runner(&driver, 0.0);
        let (v1, d1) = r.step(1.0); // first step done
        assert!(!d1);
        assert!(
            (v1 - 50.0).abs() < 1e-3,
            "after step 1 expected 50, got {v1}"
        );
        let (v2, _d2) = r.step(0.5); // halfway through second step: 50 -> 120
        assert!(
            (v2 - 85.0).abs() < 1.0,
            "midway second step expected ~85, got {v2}"
        );
        let (v3, d3) = r.step(0.5);
        assert!(d3);
        assert!(
            (v3 - 120.0).abs() < 1e-3,
            "sequence end expected 120, got {v3}"
        );
    }

    #[test]
    fn finite_repeat_finishes_after_count_cycles() {
        // Repeat a 1s timing twice, no reverse: each cycle 0 -> 10.
        let driver = Driver::Repeat {
            animation: Box::new(timing(10.0, 1.0)),
            count: 2,
            reverse: false,
        };
        let (v, _ticks) = run_to_end(&driver, 0.0, 0.25, 1000);
        assert!(
            (v - 10.0).abs() < 1e-3,
            "finite repeat ends at target, got {v}"
        );
    }

    #[test]
    fn reverse_repeat_ping_pongs_endpoints() {
        // 0 -> 10 then (reverse) 10 -> 0 over two cycles: ends back at 0.
        let driver = Driver::Repeat {
            animation: Box::new(timing(10.0, 1.0)),
            count: 2,
            reverse: true,
        };
        let (v, _ticks) = run_to_end(&driver, 0.0, 0.25, 1000);
        assert!(
            (v - 0.0).abs() < 1e-3,
            "reverse repeat returns to start, got {v}"
        );
        assert_eq!(terminal_value(&driver, 0.0), 0.0);
    }

    #[test]
    fn infinite_repeat_never_finishes() {
        let driver = Driver::Repeat {
            animation: Box::new(timing(10.0, 1.0)),
            count: -1,
            reverse: true,
        };
        let mut r = build_runner(&driver, 0.0);
        for _ in 0..1000 {
            let (_v, done) = r.step(0.1);
            assert!(!done, "infinite repeat must never report finished");
        }
    }
}
