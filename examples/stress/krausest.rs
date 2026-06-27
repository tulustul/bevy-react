//! The krausest js-framework-benchmark scenario: the standard table operation set
//! (create 1k/10k rows, append 1k, update every 10th, swap, select, remove, clear),
//! measured as a bevy-react *library* benchmark — our own per-operation timings,
//! no cross-framework comparison.
//!
//! Driving (capture mode) is event-driven, one op at a time: the Bevy driver sends
//! a `bench.runStep` event, React performs the op (`setState` → reconciler commit
//! → `op_flush`) and reports its JS-side timing back via `bench.stepDone`, and the
//! driver times `trigger → batch-applied` using [`OpApplyStats`], waits for frame
//! quiescence, records the sample, and moves on. See `examples/demos/screenshot.rs`
//! for the sibling "drive → settle → record → exit" pattern.
//!
//! Reference: https://github.com/krausest/js-framework-benchmark

use std::path::PathBuf;
use std::time::{Duration, Instant};

use bevy::prelude::*;
use bevy::ui::UiSystems;
use bevy_react::{OpApplyStats, ReactAppExt, ReactEvents, react_event, react_message};
use serde::Serialize;
use ts_rs::TS;

pub struct KrausestPlugin;

impl Plugin for KrausestPlugin {
    fn build(&self, app: &mut App) {
        register_bindings(app);
        app.init_resource::<BenchInbox>();
    }
}

/// Register this scenario's React bindings (shared with the `--export-bindings`
/// path so they land in the generated `bevy.ts`).
pub fn register_bindings(app: &mut App) {
    // Bevy → React: tell the app which operation to run.
    app.add_react_event::<BenchStep>();
    // React → Bevy: the app reports it committed the op + its JS-side timing.
    app.add_react_handler(on_step_done);
}

// --- The operation set ---

/// One krausest table operation. A fieldless enum serializes as a plain string,
/// so the generated TS is a `"Create1k" | …` union the React app switches on.
#[derive(Serialize, TS, Clone, Copy, Debug, PartialEq, Eq)]
pub enum BenchOp {
    /// Replace the table with 1,000 fresh rows.
    Create1k,
    /// Replace the table with 10,000 fresh rows.
    Create10k,
    /// Append 1,000 rows to the existing table.
    Append1k,
    /// Update the label of every 10th row in place.
    UpdateEvery10th,
    /// Swap two rows far apart (rows 1 and 998, krausest-style).
    Swap,
    /// Select (highlight) a row.
    Select,
    /// Remove a single row.
    Remove,
    /// Empty the table.
    Clear,
}

impl BenchOp {
    /// Stable lower-camel key used to group samples in the JSON report.
    fn key(self) -> &'static str {
        match self {
            BenchOp::Create1k => "create1k",
            BenchOp::Create10k => "create10k",
            BenchOp::Append1k => "append1k",
            BenchOp::UpdateEvery10th => "updateEvery10th",
            BenchOp::Swap => "swap",
            BenchOp::Select => "select",
            BenchOp::Remove => "remove",
            BenchOp::Clear => "clear",
        }
    }
}

/// Every op, in a fixed order, for grouping the report deterministically.
const ALL_OPS: [BenchOp; 8] = [
    BenchOp::Create1k,
    BenchOp::Create10k,
    BenchOp::Append1k,
    BenchOp::UpdateEvery10th,
    BenchOp::Swap,
    BenchOp::Select,
    BenchOp::Remove,
    BenchOp::Clear,
];

// --- Bridge bindings ---

/// Bevy → React: run one benchmark operation. `seed` lets React generate
/// reproducible-yet-varied row labels per step.
#[react_event(name = "bench.runStep")]
pub struct BenchStep {
    op: BenchOp,
    seed: u32,
}

/// React → Bevy: the app finished committing the last step. `js_ms` is the time it
/// spent in `setState` + the synchronous reconciler commit (this includes
/// `flush_ms`); `flush_ms` is just the `op_flush` native call — i.e. the `serde_v8`
/// decode of the op batch at the boundary. The op count is read Bevy-side from
/// [`OpApplyStats`] (React doesn't see the flushed batch size).
#[react_message(name = "bench.stepDone")]
pub struct StepDone {
    js_ms: f64,
    flush_ms: f64,
}

/// Latest [`StepDone`] from React, written by the observer and drained by the
/// capture driver. Present in every run (the interactive mode just ignores it).
#[derive(Resource, Default)]
struct BenchInbox {
    last: Option<StepReport>,
}

/// The React-reported half of a step's measurement.
#[derive(Clone, Copy)]
struct StepReport {
    js_ms: f64,
    flush_ms: f64,
}

fn on_step_done(on: On<StepDone>, mut inbox: ResMut<BenchInbox>) {
    let e = on.event();
    inbox.last = Some(StepReport {
        js_ms: e.js_ms,
        flush_ms: e.flush_ms,
    });
}

// --- Capture mode (automated driver) ---

/// Parsed `--run krausest` arguments.
pub struct CaptureConfig {
    /// Where to write the JSON report; `None` prints to stdout.
    pub out: Option<PathBuf>,
    /// How many times to run the whole operation sequence (for p50/p99).
    pub iterations: u32,
}

/// Install capture mode: the driver state machine + its frame system, plus the
/// phase timers that bracket command execution and `bevy_ui` layout.
pub fn add_capture_mode(app: &mut App, cfg: CaptureConfig) {
    app.insert_resource(BenchDriver::new(cfg))
        .init_resource::<BenchTimers>()
        // All in PostUpdate (where `bevy_ui` layout runs). `apply_js_ops` ran in
        // Update, so `OpApplyStats` already reflects this frame. The markers bracket
        // `UiSystems::Layout`, and the driver records last (after both markers).
        .add_systems(
            PostUpdate,
            (
                mark_pre_layout
                    .after(UiSystems::Content)
                    .before(UiSystems::Layout),
                // After PostLayout so `layoutMs` covers the whole layout pipeline
                // (taffy solve + computed transform/clip propagation over every
                // node), not just the Layout set — otherwise PostLayout's per-node
                // cost lands in the unaccounted gap.
                mark_post_layout.after(UiSystems::PostLayout),
                drive_bench.after(mark_post_layout),
            ),
        );
}

/// Per-frame instants/durations used to split the post-translate cost into
/// command execution and layout. Updated only on frames a batch was applied.
#[derive(Resource, Default)]
struct BenchTimers {
    /// Stamped each frame just before `UiSystems::Layout`.
    pre_layout: Option<Instant>,
    /// `pre_layout - apply_end`: command execution (spawn/insert/hierarchy) plus
    /// UI prepare/propagate/content, for the most recent applied batch.
    last_command: Duration,
    /// `UiSystems::Layout` + `PostLayout` (taffy solve + computed transform/clip
    /// propagation) for the most recent applied batch.
    last_layout: Duration,
    /// The `applied_count` last recorded, to detect a fresh batch this frame.
    seen_applied: u64,
}

fn mark_pre_layout(mut timers: ResMut<BenchTimers>) {
    timers.pre_layout = Some(Instant::now());
}

fn mark_post_layout(stats: Res<OpApplyStats>, mut timers: ResMut<BenchTimers>) {
    // Only meaningful on frames that applied a batch (its commands flush + lay out
    // this same frame). Other frames leave the last values intact.
    if stats.applied_count == timers.seen_applied {
        return;
    }
    timers.seen_applied = stats.applied_count;
    let now = Instant::now();
    if let (Some(end), Some(pre)) = (stats.last_apply_end, timers.pre_layout) {
        timers.last_command = pre.saturating_duration_since(end);
        timers.last_layout = now.saturating_duration_since(pre);
    }
}

/// Frames to wait after the initial mount before driving the first op (lets the
/// React app subscribe to `bench.runStep` and the isolate settle).
const WARMUP_FRAMES: u32 = 60;
/// Frames of quiescence between ops (let layout settle, avoid bleed-over).
const SETTLE_FRAMES: u32 = 8;
/// Give up on a step after this much wall time without both signals. Wall-clock,
/// not frames: with no vsync the app renders empty frames very fast while JS
/// reconciles on its own thread, so a frame budget could expire mid-op.
const STEP_TIMEOUT: Duration = Duration::from_secs(30);

#[derive(Clone, Copy, PartialEq)]
enum Phase {
    Warmup,
    Trigger,
    Await,
    Settle,
    Done,
}

/// One recorded operation timing, decomposed into legs (see `add_capture_mode`).
struct Sample {
    op: BenchOp,
    total_ms: f64,
    js_ms: f64,
    /// `op_flush` native call = `serde_v8` decode of the batch (subset of `js_ms`).
    flush_ms: f64,
    /// Diagnostic: `apply_start - t0` (event-send → `apply_js_ops` begins).
    pre_apply_ms: f64,
    translate_ms: f64,
    command_ms: f64,
    layout_ms: f64,
    /// Diagnostic: `now - apply_end` at detection (should ≈ command + layout).
    bevy_ms: f64,
    ops_emitted: usize,
}

#[derive(Resource)]
struct BenchDriver {
    out: Option<PathBuf>,
    iterations: u32,
    seq: Vec<BenchOp>,
    iter: u32,
    step: usize,
    phase: Phase,
    seed: u32,
    t0: Option<Instant>,
    expected_applied: u64,
    settle_frames: u32,
    samples: Vec<Sample>,
}

impl BenchDriver {
    fn new(cfg: CaptureConfig) -> Self {
        Self {
            out: cfg.out,
            iterations: cfg.iterations.max(1),
            seq: default_sequence(),
            iter: 0,
            step: 0,
            phase: Phase::Warmup,
            seed: 1,
            t0: None,
            expected_applied: 0,
            settle_frames: 0,
            samples: Vec::new(),
        }
    }
}

/// The per-iteration op sequence. Each measured op runs from a consistent
/// precondition (create from empty, swap/select/remove on a full 1k table, append
/// at 1k→2k), and every iteration ends empty so the next starts clean.
fn default_sequence() -> Vec<BenchOp> {
    use BenchOp::*;
    vec![
        Create1k,
        UpdateEvery10th,
        Swap,
        Select,
        Remove,
        Clear,
        Create10k,
        Clear,
        Create1k,
        Append1k,
        Clear,
    ]
}

fn drive_bench(
    mut driver: ResMut<BenchDriver>,
    stats: Res<OpApplyStats>,
    timers: Res<BenchTimers>,
    mut inbox: ResMut<BenchInbox>,
    events: ReactEvents,
    mut exit: MessageWriter<AppExit>,
) {
    match driver.phase {
        Phase::Warmup => {
            // Wait for the initial mount (first ops applied), then a short settle.
            if stats.applied_count == 0 {
                return;
            }
            driver.settle_frames += 1;
            if driver.settle_frames >= WARMUP_FRAMES {
                driver.settle_frames = 0;
                start_step(&mut driver, &stats, &mut inbox, &events);
            }
        }
        Phase::Trigger => start_step(&mut driver, &stats, &mut inbox, &events),
        Phase::Await => {
            let landed = stats.applied_count > driver.expected_applied;
            if landed && let Some(report) = inbox.last {
                let now = Instant::now();
                let t0 = driver.t0.expect("t0 set in start_step");
                let translate = stats.last_translate;
                // All three instants are on the Bevy main thread, so total splits
                // into contiguous segments: t0 → apply_start → apply_end → now.
                let (pre_apply_ms, bevy_ms) = match stats.last_apply_end {
                    Some(apply_end) => {
                        let apply_start = apply_end.checked_sub(translate).unwrap_or(apply_end);
                        (
                            apply_start.saturating_duration_since(t0).as_secs_f64() * 1000.0,
                            now.saturating_duration_since(apply_end).as_secs_f64() * 1000.0,
                        )
                    }
                    None => (f64::NAN, f64::NAN),
                };
                let total_ms = now.saturating_duration_since(t0).as_secs_f64() * 1000.0;
                let op = driver.seq[driver.step];
                driver.samples.push(Sample {
                    op,
                    total_ms,
                    js_ms: report.js_ms,
                    flush_ms: report.flush_ms,
                    pre_apply_ms,
                    translate_ms: translate.as_secs_f64() * 1000.0,
                    command_ms: timers.last_command.as_secs_f64() * 1000.0,
                    layout_ms: timers.last_layout.as_secs_f64() * 1000.0,
                    bevy_ms,
                    // The flushed batch size for this op's commit, from core's
                    // live op-flush instrumentation (React can't see it).
                    ops_emitted: stats.last_ops,
                });
                driver.phase = Phase::Settle;
                driver.settle_frames = 0;
            } else if driver.t0.is_some_and(|t| t.elapsed() > STEP_TIMEOUT) {
                warn!(
                    "bench step {:?} timed out (landed={landed}, reported={})",
                    driver.seq[driver.step],
                    inbox.last.is_some()
                );
                driver.phase = Phase::Settle;
                driver.settle_frames = 0;
            }
        }
        Phase::Settle => {
            driver.settle_frames += 1;
            if driver.settle_frames >= SETTLE_FRAMES {
                advance(&mut driver, &mut exit);
            }
        }
        Phase::Done => {}
    }
}

/// Begin timing the current step and tell React to perform it.
fn start_step(
    driver: &mut BenchDriver,
    stats: &OpApplyStats,
    inbox: &mut BenchInbox,
    events: &ReactEvents,
) {
    let op = driver.seq[driver.step];
    // Announce each new iteration and each op as it runs.
    if driver.step == 0 {
        info!("── iteration {}/{} ──", driver.iter + 1, driver.iterations);
    }
    info!("  [{}/{}] {}", driver.step + 1, driver.seq.len(), op.key());
    driver.t0 = Some(Instant::now());
    driver.expected_applied = stats.applied_count;
    inbox.last = None;
    let seed = driver.seed;
    driver.seed = driver.seed.wrapping_add(1);
    events.send(&BenchStep { op, seed });
    driver.phase = Phase::Await;
}

/// Move to the next step / iteration, finishing the run when the last completes.
fn advance(driver: &mut BenchDriver, exit: &mut MessageWriter<AppExit>) {
    driver.step += 1;
    if driver.step >= driver.seq.len() {
        driver.step = 0;
        driver.iter += 1;
        if driver.iter >= driver.iterations {
            finalize(driver);
            driver.phase = Phase::Done;
            exit.write(AppExit::Success);
            return;
        }
    }
    driver.phase = Phase::Trigger;
}

// --- Reporting ---

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Report {
    scenario: &'static str,
    iterations: u32,
    ops: Vec<OpReport>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OpReport {
    op: &'static str,
    count: usize,
    ops_emitted: usize,
    total_ms: Stat,
    js_ms: Stat,
    flush_ms: Stat,
    pre_apply_ms: Stat,
    translate_ms: Stat,
    command_ms: Stat,
    layout_ms: Stat,
    bevy_ms: Stat,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Stat {
    p50: f64,
    p99: f64,
    mean: f64,
    min: f64,
    max: f64,
}

fn finalize(driver: &BenchDriver) {
    let ops: Vec<OpReport> = ALL_OPS
        .iter()
        .filter_map(|&op| {
            let samples: Vec<&Sample> = driver.samples.iter().filter(|s| s.op == op).collect();
            if samples.is_empty() {
                return None;
            }
            Some(OpReport {
                op: op.key(),
                count: samples.len(),
                ops_emitted: samples[0].ops_emitted,
                total_ms: Stat::of(samples.iter().map(|s| s.total_ms)),
                js_ms: Stat::of(samples.iter().map(|s| s.js_ms)),
                flush_ms: Stat::of(samples.iter().map(|s| s.flush_ms)),
                pre_apply_ms: Stat::of(samples.iter().map(|s| s.pre_apply_ms)),
                translate_ms: Stat::of(samples.iter().map(|s| s.translate_ms)),
                command_ms: Stat::of(samples.iter().map(|s| s.command_ms)),
                layout_ms: Stat::of(samples.iter().map(|s| s.layout_ms)),
                bevy_ms: Stat::of(samples.iter().map(|s| s.bevy_ms)),
            })
        })
        .collect();

    let report = Report {
        scenario: "krausest",
        iterations: driver.iterations,
        ops,
    };
    let json = serde_json::to_string_pretty(&report).expect("serialize report");
    match &driver.out {
        Some(path) => {
            std::fs::write(path, &json)
                .unwrap_or_else(|e| panic!("failed to write {}: {e}", path.display()));
            info!("wrote benchmark results to {}", path.display());
        }
        None => println!("{json}"),
    }
}

impl Stat {
    fn of(values: impl Iterator<Item = f64>) -> Self {
        let mut v: Vec<f64> = values.filter(|x| x.is_finite()).collect();
        v.sort_by(|a, b| a.total_cmp(b));
        if v.is_empty() {
            return Stat {
                p50: f64::NAN,
                p99: f64::NAN,
                mean: f64::NAN,
                min: f64::NAN,
                max: f64::NAN,
            };
        }
        let mean = v.iter().sum::<f64>() / v.len() as f64;
        Stat {
            p50: percentile(&v, 50.0),
            p99: percentile(&v, 99.0),
            mean,
            min: v[0],
            max: v[v.len() - 1],
        }
    }
}

/// Nearest-rank percentile over an ascending-sorted slice.
fn percentile(sorted: &[f64], p: f64) -> f64 {
    if sorted.is_empty() {
        return f64::NAN;
    }
    let idx = ((p / 100.0) * (sorted.len() as f64 - 1.0)).round() as usize;
    sorted[idx.min(sorted.len() - 1)]
}
