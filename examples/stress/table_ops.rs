//! The table-ops scenario: a table operation set derived from the
//! js-framework-benchmark, measured as a bevy-react *library* benchmark — our own
//! per-operation timings, no cross-framework comparison.
//!
//! Every operation comes in a **surgical** (`*1`, one row) and a **mass**
//! (`*Every2nd`, half the table) variant, and the whole set runs at **two table
//! scales** (1k and 10k rows). Comparing a surgical op across scales is the
//! point: it exposes costs that are secretly O(table) rather than O(changed).
//! `insertEvery2nd` doubles as a quadratic-behavior detector (a per-insert
//! `Children` splice shows up as ~100× instead of ~10× between scales).
//!
//! Driving (capture mode) is event-driven, one op at a time: the Bevy driver sends
//! a `bench.runStep` event, React performs the op (`setState` → reconciler commit
//! → `op_flush`) and reports its JS-side timing back via `bench.stepDone`, and the
//! driver times `trigger → batch-applied` using [`OpApplyStats`], waits for frame
//! quiescence, records the sample, and moves on. See `examples/demos/screenshot.rs`
//! for the sibling "drive → settle → record → exit" pattern.
//!
//! Reference: https://github.com/krausest/js-framework-benchmark

use std::fmt::Write as _;
use std::path::PathBuf;
use std::time::{Duration, Instant};

use bevy::prelude::*;
use bevy::ui::UiSystems;
use bevy_react::{OpApplyStats, ReactAppExt, ReactEvents, react_event, react_message};
use serde::Serialize;
use ts_rs::TS;

pub struct TableOpsPlugin;

impl Plugin for TableOpsPlugin {
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

/// One table operation. A fieldless enum serializes as a plain string,
/// so the generated TS is a `"Create" | …` union the React app switches on.
/// The table scale rides in [`BenchStep::n`], not in per-scale variants.
#[derive(Serialize, TS, Clone, Copy, Debug, PartialEq, Eq)]
pub enum BenchOp {
    /// Replace the table with `n` fresh rows (`n` = the current scale).
    Create,
    /// Append 1 fresh row at the end.
    Append1,
    /// Append 1,000 fresh rows (fixed batch at both scales, jsfb-style).
    Append1k,
    /// Insert 1 fresh row at the middle (index ⌊len/2⌋).
    Insert1,
    /// Insert a fresh row after every 2nd existing row (→ ~1.5×).
    InsertEvery2nd,
    /// Update one middle row's label in place (text change → relayout).
    UpdateText1,
    /// Update the label of every 2nd row in place (text change → relayout).
    UpdateTextEvery2nd,
    /// Recolor one middle row's background (paint-only → should not relayout).
    UpdateColor1,
    /// Recolor every 2nd row's background (paint-only → should not relayout).
    UpdateColorEvery2nd,
    /// Swap two rows far apart (rows 1 and len−2, js-framework-benchmark-style).
    Swap1,
    /// Swap each adjacent pair (0↔1, 2↔3, …) — mass move ops.
    SwapEvery2nd,
    /// Remove one middle row.
    Remove1,
    /// Remove every 2nd row (→ half).
    RemoveEvery2nd,
    /// Empty the table.
    Clear,
}

impl BenchOp {
    /// Stable lower-camel key used to group samples in the JSON report.
    fn key(self) -> &'static str {
        match self {
            BenchOp::Create => "create",
            BenchOp::Append1 => "append1",
            BenchOp::Append1k => "append1k",
            BenchOp::Insert1 => "insert1",
            BenchOp::InsertEvery2nd => "insertEvery2nd",
            BenchOp::UpdateText1 => "updateText1",
            BenchOp::UpdateTextEvery2nd => "updateTextEvery2nd",
            BenchOp::UpdateColor1 => "updateColor1",
            BenchOp::UpdateColorEvery2nd => "updateColorEvery2nd",
            BenchOp::Swap1 => "swap1",
            BenchOp::SwapEvery2nd => "swapEvery2nd",
            BenchOp::Remove1 => "remove1",
            BenchOp::RemoveEvery2nd => "removeEvery2nd",
            BenchOp::Clear => "clear",
        }
    }
}

/// Every op, in a fixed order, for grouping the report deterministically.
const ALL_OPS: [BenchOp; 14] = [
    BenchOp::Create,
    BenchOp::Append1,
    BenchOp::Append1k,
    BenchOp::Insert1,
    BenchOp::InsertEvery2nd,
    BenchOp::UpdateText1,
    BenchOp::UpdateTextEvery2nd,
    BenchOp::UpdateColor1,
    BenchOp::UpdateColorEvery2nd,
    BenchOp::Swap1,
    BenchOp::SwapEvery2nd,
    BenchOp::Remove1,
    BenchOp::RemoveEvery2nd,
    BenchOp::Clear,
];

/// The table scales the whole op set runs at.
const SCALES: [u32; 2] = [1_000, 10_000];

/// Rows `Append1k` adds regardless of scale (js-framework-benchmark convention:
/// insert a fixed batch into an existing table).
const APPEND_BATCH: u32 = 1_000;

/// Human label for a scale (`1_000` → `"1k"`), used in the report.
fn scale_label(n: u32) -> String {
    if n >= 1_000 && n.is_multiple_of(1_000) {
        format!("{}k", n / 1_000)
    } else {
        n.to_string()
    }
}

// --- Bridge bindings ---

/// Bevy → React: run one benchmark operation. `n` is the table scale this step
/// belongs to (only `Create` consumes it JS-side; it rides on every step so
/// samples group by scale). `seed` lets React generate reproducible-yet-varied
/// row labels per step.
#[react_event(name = "bench.runStep")]
pub struct BenchStep {
    op: BenchOp,
    n: u32,
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

/// Parsed `--run table-ops` arguments.
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
    /// The scale (table size the op set targets) this sample belongs to.
    n: u32,
    /// Table row count when the op ran (its precondition).
    rows: u32,
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

/// One sequence entry: the op, the scale it runs at, whether its timing is
/// recorded (`false` = a precondition-reset step that still runs through the
/// full Trigger/Await/Settle machinery), and the table size it starts from.
#[derive(Clone, Copy)]
struct Step {
    op: BenchOp,
    n: u32,
    record: bool,
    rows: u32,
}

#[derive(Resource)]
struct BenchDriver {
    out: Option<PathBuf>,
    iterations: u32,
    seq: Vec<Step>,
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

/// The per-iteration op sequence: the whole op set once per scale, organized in
/// blocks so every measured op runs from a consistent precondition. The in-place
/// ops (update/swap) don't change the row count, so one measured `Create` serves
/// them all and the block's `Clear` is measured from a full table. The structural
/// ops (append/insert/remove) perturb the count, so each group gets an unmeasured
/// create/clear reset. Every block ends empty, so the next starts clean — and an
/// unmeasured `Clear` never runs on an empty table (zero ops would stall `Await`).
fn default_sequence() -> Vec<Step> {
    use BenchOp::*;
    const BLOCKS: [&[(BenchOp, bool)]; 4] = [
        &[
            (Create, true),
            (UpdateText1, true),
            (UpdateTextEvery2nd, true),
            (UpdateColor1, true),
            (UpdateColorEvery2nd, true),
            (Swap1, true),
            (SwapEvery2nd, true),
            (Clear, true),
        ],
        &[
            (Create, false),
            (Append1, true),
            (Append1k, true),
            (Clear, false),
        ],
        &[
            (Create, false),
            (Insert1, true),
            (InsertEvery2nd, true),
            (Clear, false),
        ],
        &[
            (Create, false),
            (Remove1, true),
            (RemoveEvery2nd, true),
            (Clear, false),
        ],
    ];
    let mut seq = Vec::new();
    for n in SCALES {
        for block in BLOCKS {
            let mut rows = 0u32;
            for &(op, record) in block {
                seq.push(Step {
                    op,
                    n,
                    record,
                    rows,
                });
                rows = rows_after(op, rows, n);
            }
        }
    }
    seq
}

/// Table row count after `op` runs on `rows` rows at scale `n`. Must mirror the
/// JS implementations in `ui/src/App.tsx` — it feeds the report's `rows`
/// (precondition) column and the sequence's precondition bookkeeping.
fn rows_after(op: BenchOp, rows: u32, n: u32) -> u32 {
    use BenchOp::*;
    match op {
        Create => n,
        Append1 | Insert1 => rows + 1,
        Append1k => rows + APPEND_BATCH,
        // One fresh row after every complete pair of existing rows.
        InsertEvery2nd => rows + rows / 2,
        Remove1 => rows.saturating_sub(1),
        // Keeps the even indices: ceil(rows / 2).
        RemoveEvery2nd => rows - rows / 2,
        Clear => 0,
        UpdateText1 | UpdateTextEvery2nd | UpdateColor1 | UpdateColorEvery2nd | Swap1
        | SwapEvery2nd => rows,
    }
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
                let step = driver.seq[driver.step];
                if step.record {
                    driver.samples.push(Sample {
                        op: step.op,
                        n: step.n,
                        rows: step.rows,
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
                }
                driver.phase = Phase::Settle;
                driver.settle_frames = 0;
            } else if driver.t0.is_some_and(|t| t.elapsed() > STEP_TIMEOUT) {
                warn!(
                    "bench step {:?} timed out (landed={landed}, reported={})",
                    driver.seq[driver.step].op,
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
    let step = driver.seq[driver.step];
    // Announce each new iteration and each op as it runs.
    if driver.step == 0 {
        info!("── iteration {}/{} ──", driver.iter + 1, driver.iterations);
    }
    info!(
        "  [{}/{}] {}@{}{}",
        driver.step + 1,
        driver.seq.len(),
        step.op.key(),
        scale_label(step.n),
        if step.record { "" } else { " (reset)" }
    );
    driver.t0 = Some(Instant::now());
    driver.expected_applied = stats.applied_count;
    inbox.last = None;
    let seed = driver.seed;
    driver.seed = driver.seed.wrapping_add(1);
    events.send(&BenchStep {
        op: step.op,
        n: step.n,
        seed,
    });
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
    /// Scale label the samples belong to (`"1k"` / `"10k"`).
    scale: String,
    /// Table row count when the op ran (its precondition).
    rows: u32,
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
    // Grouped by scale, then by the fixed op order, so the report (and the JSON
    // `ops` list) reads as one full op set per scale.
    let ops: Vec<OpReport> = SCALES
        .iter()
        .flat_map(|&n| ALL_OPS.iter().map(move |&op| (op, n)))
        .filter_map(|(op, n)| {
            let samples: Vec<&Sample> = driver
                .samples
                .iter()
                .filter(|s| s.op == op && s.n == n)
                .collect();
            if samples.is_empty() {
                return None;
            }
            Some(OpReport {
                op: op.key(),
                scale: scale_label(n),
                rows: samples[0].rows,
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
        scenario: "table-ops",
        iterations: driver.iterations,
        ops,
    };
    let json = serde_json::to_string_pretty(&report).expect("serialize report");
    let markdown = render_markdown(&report);
    match &driver.out {
        Some(path) => {
            std::fs::write(path, &json)
                .unwrap_or_else(|e| panic!("failed to write {}: {e}", path.display()));
            info!("wrote benchmark results to {}", path.display());

            // Write the human-readable Markdown report to a sibling `.md` file.
            let md_path = path.with_extension("md");
            std::fs::write(&md_path, &markdown)
                .unwrap_or_else(|e| panic!("failed to write {}: {e}", md_path.display()));
            info!("wrote benchmark report to {}", md_path.display());
        }
        None => println!("{json}\n\n{markdown}"),
    }
}

/// Render a `Report` as a human-readable GitHub-flavored Markdown document: a
/// single table (one row per op, `p50` per timing phase) plus a legend that
/// explains every column and how the phases nest into the end-to-end total.
fn render_markdown(report: &Report) -> String {
    // Fixed precision keeps the columns aligned and the numbers scannable.
    fn ms(v: f64) -> String {
        format!("{v:.3}")
    }

    let mut out = String::new();
    let _ = writeln!(out, "# {} benchmark", report.scenario);
    let _ = writeln!(out);
    let _ = writeln!(out, "Iterations: {}", report.iterations);
    let _ = writeln!(out);

    // One section per scale; one row per op, one column per timing phase.
    // Median (p50) only. Columns run left-to-right in execution order so the
    // table reads as a timeline; the legend below spells out each value and how
    // they nest.
    for n in SCALES {
        let label = scale_label(n);
        let _ = writeln!(out, "## Median per op — {label} table (p50, ms)");
        let _ = writeln!(out);
        let _ = writeln!(
            out,
            "| Op | Rows | Ops Emitted | Total | Pre-apply | JS | Flush | Translate | Command | Layout | Bevy |"
        );
        let _ = writeln!(
            out,
            "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"
        );
        for o in report.ops.iter().filter(|o| o.scale == label) {
            let _ = writeln!(
                out,
                "| {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | {} |",
                o.op,
                o.rows,
                o.ops_emitted,
                ms(o.total_ms.p50),
                ms(o.pre_apply_ms.p50),
                ms(o.js_ms.p50),
                ms(o.flush_ms.p50),
                ms(o.translate_ms.p50),
                ms(o.command_ms.p50),
                ms(o.layout_ms.p50),
                ms(o.bevy_ms.p50),
            );
        }
        let _ = writeln!(out);
    }

    // Legend: explain every column. All timings are median (p50) milliseconds.
    let _ = writeln!(out, "### Legend");
    let _ = writeln!(out);
    let _ = writeln!(
        out,
        "All timings are the **median (p50)** over the samples, in **milliseconds**."
    );
    let _ = writeln!(out);
    let _ = writeln!(out, "| Column | Meaning |");
    let _ = writeln!(out, "| --- | --- |");
    let _ = writeln!(
        out,
        "| **Op** | The operation under test (create, swap1, removeEvery2nd, …). |"
    );
    let _ = writeln!(
        out,
        "| **Rows** | Table row count when the op ran (its precondition). |"
    );
    let _ = writeln!(
        out,
        "| **Ops Emitted** | Size of the flushed op batch React produced for one occurrence of this op. |"
    );
    let _ = writeln!(
        out,
        "| **Total** | End-to-end wall time, event trigger → change detected. Equals `Pre-apply + Translate + Bevy`. |"
    );
    let _ = writeln!(
        out,
        "| **Pre-apply** | Trigger → Bevy starts applying the batch. Covers the JS round-trip + inter-thread scheduling. Contains **JS**. |"
    );
    let _ = writeln!(
        out,
        "| **JS** | React reconcile + build the op batch + the `op_flush` call (measured on the JS thread). Subset of **Pre-apply**; contains **Flush**. |"
    );
    let _ = writeln!(
        out,
        "| **Flush** | The `op_flush` native call alone = `serde_v8` decode of the batch. Subset of **JS**. |"
    );
    let _ = writeln!(
        out,
        "| **Translate** | `apply_js_ops` walks the op batch → queues ECS commands (Bevy side). |"
    );
    let _ = writeln!(
        out,
        "| **Command** | Execute the queued ECS commands + UI prepare/content, before layout. |"
    );
    let _ = writeln!(
        out,
        "| **Layout** | `bevy_ui` layout: taffy solve + transform/clip propagation. |"
    );
    let _ = writeln!(
        out,
        "| **Bevy** | Apply done → change detected. Full post-translate Bevy wall time; ≈ `Command + Layout`. |"
    );
    let _ = writeln!(out);
    let _ = writeln!(
        out,
        "Nesting: `Total = Pre-apply (⊇ JS ⊇ Flush) + Translate + Bevy (≈ Command + Layout)`."
    );
    let _ = writeln!(out);
    let _ = writeln!(
        out,
        "For the surgical (`*1`) ops, **JS**/**Flush** are sub-millisecond and the \
         isolate's clock may only have 1 ms resolution (`Date.now()`), so those two \
         columns can read as 0/1 ms noise — the Rust-side columns carry the signal. \
         Bump `--iterations` for stable surgical p50s."
    );
    let _ = writeln!(out);

    out
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
