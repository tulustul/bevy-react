//! The devtools console ring: a process-global, bounded log of everything the
//! devtools "Console" tab shows — JS `console.*` output (every call funnels
//! through `js_thread::op_log`), Rust [`crate::diag`] invalid-value messages,
//! and JS-runtime failures reported from the JS thread (hot-reload rejections,
//! event-loop errors).
//!
//! Collection is always-on in dev builds; nothing crosses the bridge until the
//! panel's Console tab opens, at which point `devtools::console::emit_console`
//! sends the backlog once and then streams increments by sequence number. `clear`
//! empties the ring but never resets `seq`, so the stream watermark stays
//! monotonic across clears.
//!
//! Like [`crate::diag`], everything compiles to inline no-op stubs unless the
//! `devtools` feature is on AND `debug_assertions` hold — with one extra gate:
//! the real ring is **native-only** (`SystemTime::now` panics on
//! wasm32-unknown-unknown, and the web host has no `op_log` shim anyway — on
//! web, `console.*` goes to the browser's own console).

use std::collections::VecDeque;

/// Where a console entry originated.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Source {
    /// The JS isolate: `console.*` calls (including the runtime's own error
    /// handlers, which all route through `console.error`).
    Js,
    /// The Rust side: `diag` invalid-value reports and JS-thread failures.
    Rust,
}

impl Source {
    pub fn as_str(self) -> &'static str {
        match self {
            Source::Js => "js",
            Source::Rust => "rust",
        }
    }
}

/// Console severity. JS entries carry the `op_log` level; `diag` reports are
/// warnings; JS-runtime failures are errors.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Level {
    Debug,
    Info,
    Warn,
    Error,
}

impl Level {
    pub fn as_str(self) -> &'static str {
        match self {
            Level::Debug => "debug",
            Level::Info => "info",
            Level::Warn => "warn",
            Level::Error => "error",
        }
    }

    /// The `op_log` level strings from the prelude console shim
    /// (`log/info/dir/table → "info"`, `debug/trace → "debug"`). Unknown
    /// strings degrade to `Info`, mirroring `op_log`'s catch-all arm.
    pub fn from_js(level: &str) -> Self {
        match level {
            "error" => Level::Error,
            "warn" => Level::Warn,
            "debug" => Level::Debug,
            _ => Level::Info,
        }
    }
}

/// One console row. `seq` is process-monotonic (never reused, survives
/// `clear`); `time_ms` is wall-clock epoch milliseconds.
#[derive(Debug, Clone, PartialEq)]
pub struct ConsoleEntry {
    pub seq: u64,
    pub time_ms: u64,
    pub source: Source,
    pub level: Level,
    pub message: String,
}

/// Ring cap: the devtools panel shows at most this many rows, and the backlog
/// event is bounded by it.
const CAP: usize = 500;
/// Per-message byte cap so one giant `JSON.stringify` can't eat the ring.
const MESSAGE_CAP: usize = 4096;

/// The ring itself — plain data, no globals, so exactness tests (cap, seq,
/// truncation) can run on local instances without contending on the process
/// ring.
#[derive(Debug, Default)]
pub struct ConsoleRing {
    entries: VecDeque<ConsoleEntry>,
    /// The next seq to assign; starts at 1 so watermark `0` means "nothing".
    next_seq: u64,
}

impl ConsoleRing {
    pub fn push(&mut self, time_ms: u64, source: Source, level: Level, message: &str) {
        // Truncate on a char boundary; mark the cut so a capped stack trace
        // doesn't read as complete.
        let mut end = message.len().min(MESSAGE_CAP);
        while !message.is_char_boundary(end) {
            end -= 1;
        }
        let mut msg = message[..end].to_owned();
        if end < message.len() {
            msg.push('…');
        }
        self.next_seq += 1;
        self.entries.push_back(ConsoleEntry {
            seq: self.next_seq,
            time_ms,
            source,
            level,
            message: msg,
        });
        while self.entries.len() > CAP {
            self.entries.pop_front();
        }
    }

    /// All entries with `seq > since`, oldest → newest, plus the current
    /// watermark (the highest seq ever assigned). Non-destructive.
    pub fn since(&self, since: u64) -> (Vec<ConsoleEntry>, u64) {
        let entries = self
            .entries
            .iter()
            .filter(|e| e.seq > since)
            .cloned()
            .collect();
        (entries, self.next_seq)
    }

    /// Empty the ring; `seq` keeps counting so watermarks stay monotonic.
    pub fn clear(&mut self) {
        self.entries.clear();
    }
}

#[cfg(all(feature = "devtools", debug_assertions, not(target_arch = "wasm32")))]
mod imp {
    use super::{ConsoleEntry, ConsoleRing, Level, Source};
    use std::sync::Mutex;

    static RING: Mutex<ConsoleRing> = Mutex::new(ConsoleRing {
        entries: std::collections::VecDeque::new(),
        next_seq: 0,
    });

    fn now_ms() -> u64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64
    }

    /// Append one entry to the process ring. Callable from any thread (the JS
    /// thread's `op_log`, Bevy systems via `diag`).
    pub fn push(source: Source, level: Level, message: &str) {
        RING.lock()
            .unwrap_or_else(|e| e.into_inner())
            .push(now_ms(), source, level, message);
    }

    /// Entries newer than `since` + the current watermark.
    pub fn since(since: u64) -> (Vec<ConsoleEntry>, u64) {
        RING.lock().unwrap_or_else(|e| e.into_inner()).since(since)
    }

    /// Empty the ring (the panel's clear button); seq keeps counting.
    pub fn clear() {
        RING.lock().unwrap_or_else(|e| e.into_inner()).clear();
    }
}

#[cfg(not(all(feature = "devtools", debug_assertions, not(target_arch = "wasm32"))))]
mod imp {
    use super::{ConsoleEntry, Level, Source};

    #[inline(always)]
    pub fn push(_source: Source, _level: Level, _message: &str) {}
    #[inline(always)]
    pub fn since(_since: u64) -> (Vec<ConsoleEntry>, u64) {
        (Vec::new(), 0)
    }
    #[inline(always)]
    pub fn clear() {}
}

pub use imp::*;

#[cfg(test)]
mod tests {
    use super::*;

    fn push_n(ring: &mut ConsoleRing, n: usize) {
        for i in 0..n {
            ring.push(i as u64, Source::Js, Level::Info, &format!("msg {i}"));
        }
    }

    #[test]
    fn cap_evicts_oldest_and_seq_stays_continuous() {
        let mut ring = ConsoleRing::default();
        push_n(&mut ring, 502);
        let (entries, watermark) = ring.since(0);
        assert_eq!(entries.len(), 500);
        assert_eq!(watermark, 502);
        assert_eq!(entries.first().unwrap().seq, 3, "first two evicted");
        assert_eq!(entries.last().unwrap().seq, 502);
        let seqs: Vec<u64> = entries.iter().map(|e| e.seq).collect();
        assert!(seqs.windows(2).all(|w| w[1] == w[0] + 1), "continuous seqs");
    }

    #[test]
    fn since_returns_only_newer_entries() {
        let mut ring = ConsoleRing::default();
        push_n(&mut ring, 5);
        let (entries, watermark) = ring.since(3);
        assert_eq!(watermark, 5);
        assert_eq!(
            entries.iter().map(|e| e.seq).collect::<Vec<_>>(),
            vec![4, 5]
        );
        let (entries, watermark) = ring.since(5);
        assert!(entries.is_empty());
        assert_eq!(watermark, 5);
        // An empty ring's watermark is 0 — "nothing ever logged".
        let empty = ConsoleRing::default();
        assert_eq!(empty.since(0), (Vec::new(), 0));
    }

    #[test]
    fn clear_empties_but_seq_keeps_counting() {
        let mut ring = ConsoleRing::default();
        push_n(&mut ring, 3);
        ring.clear();
        let (entries, watermark) = ring.since(0);
        assert!(entries.is_empty());
        assert_eq!(watermark, 3, "the watermark survives a clear");
        ring.push(9, Source::Rust, Level::Error, "after clear");
        let (entries, _) = ring.since(0);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].seq, 4, "seq continues past the clear");
    }

    #[test]
    fn long_messages_truncate_on_char_boundaries() {
        let mut ring = ConsoleRing::default();
        ring.push(0, Source::Js, Level::Info, &"a".repeat(5000));
        // A multibyte char ('é' = 2 bytes) straddling the cap must not split.
        let tricky = format!("{}é{}", "a".repeat(4095), "b".repeat(100));
        ring.push(0, Source::Js, Level::Info, &tricky);
        let (entries, _) = ring.since(0);
        assert!(entries[0].message.chars().count() <= 4097); // 4096 + ellipsis
        assert!(entries[0].message.ends_with('…'), "truncation is marked");
        assert!(
            entries[1]
                .message
                .is_char_boundary(entries[1].message.len())
        );
        assert!(!entries[1].message.contains('\u{FFFD}'));
    }

    #[test]
    fn level_from_js_mirrors_op_log_map() {
        assert_eq!(Level::from_js("error"), Level::Error);
        assert_eq!(Level::from_js("warn"), Level::Warn);
        assert_eq!(Level::from_js("debug"), Level::Debug);
        assert_eq!(Level::from_js("info"), Level::Info);
        assert_eq!(Level::from_js("bogus"), Level::Info, "unknown → info");
    }
}
