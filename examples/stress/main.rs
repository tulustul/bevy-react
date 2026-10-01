//! Benchmark / stress-test runner for `bevy_react`.
//!
//! A minimal, pure-UI Bevy app (no 3D scene, no camera orbit) that hosts
//! benchmark scenarios. The first scenario is **table-ops** — a table operation
//! set derived from the js-framework-benchmark, where every op comes in a
//! surgical (`*1`) and a mass (`*Every2nd`) variant (create, append, insert,
//! update text/color, swap, remove, clear) and the whole set runs at two table
//! scales (1k and 10k rows). Measured as a *library* benchmark: bevy-react's
//! own per-operation timings (no react-dom comparison).
//!
//! Two entry modes:
//!
//!   * **Interactive** (no flags) — opens the table with control buttons
//!     and a live timing readout, for manual exploration / profiling.
//!     `cargo run -p stress`
//!
//!   * **Capture** — drives the operation set automatically, one op at a time,
//!     records per-op timing (p50/p99 over N iterations), writes JSON, and exits:
//!     `cargo run -p stress -- --run table-ops --out results.json [--iterations N]`
//!
//! Like `--shoot` in the demos app, capture still needs an X11 display present.
//!
//! Build the bundle first: `npm run build -w stress-app`.

#[path = "../bench_app.rs"]
mod bench_app;
mod table_ops;

use std::path::PathBuf;

use bevy::prelude::*;
use bevy::window::PresentMode;

use table_ops::TableOpsPlugin;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if bench_app::export_bindings(&args, table_ops::register_bindings) {
        return;
    }

    // `--run <scenario> [--out <path>] [--iterations N]` runs a scenario in
    // capture mode: drive → time → record → exit. Without it, run interactively.
    if args.first().map(String::as_str) == Some("--run") {
        let scenario = args.get(1).map(String::as_str).unwrap_or("table-ops");
        assert_eq!(scenario, "table-ops", "unknown scenario {scenario:?}");
        let out = flag_value(&args, "--out").map(PathBuf::from);
        let iterations = flag_value(&args, "--iterations")
            .and_then(|s| s.parse().ok())
            .unwrap_or(10);

        // Benchmark numbers are only meaningful from an optimized build: a debug
        // Rust build (and a dev JS bundle) run ~10x slower. Warn loudly rather
        // than silently emit misleading results.
        if cfg!(debug_assertions) {
            eprintln!(
                "warning: capturing benchmarks in a DEBUG build — numbers are NOT \
                 representative. Rebuild with `cargo run --release` and the JS bundle \
                 with `npm run build:prod -w stress-app` for meaningful results."
            );
        }

        // No vsync while capturing: with the default `Fifo` the trigger→apply
        // round trip crosses 1–2 vsync'd frame boundaries, quantizing `totalMs`
        // to ~16.6 ms multiples and drowning out sub-frame ops.
        let mut app = build_app(/* hot_reload */ false, PresentMode::AutoNoVsync);
        table_ops::add_capture_mode(&mut app, table_ops::CaptureConfig { out, iterations });
        app.run();
        return;
    }

    build_app(/* hot_reload */ true, PresentMode::default()).run();
}

/// Pull the value following `--flag` from the arg list, if present.
fn flag_value<'a>(args: &'a [String], flag: &str) -> Option<&'a str> {
    args.iter()
        .position(|a| a == flag)
        .and_then(|i| args.get(i + 1))
        .map(String::as_str)
}

/// The stress `App`: the bench shell plus the benchmark plugin.
fn build_app(hot_reload: bool, present_mode: PresentMode) -> App {
    let mut app = bench_app::build_app("bevy-react · stress", hot_reload, present_mode);
    app.add_plugins(TableOpsPlugin);
    app
}
