//! Devtools diagnostics: collects "invalid value" warnings (a bad color name, a
//! malformed length, an unknown keyword) so the devtools inspector can flag the
//! offending style/prop rows per node — and is the ONE place those sites log
//! from: [`report`]/[`decode_report`] emit the terminal `warn!` themselves (via
//! [`log_warn`], once per distinct message per process — a per-frame re-parse
//! of the same bad value must not spam the log), so a fallback site calls
//! `diag::report` and nothing else. Every devtools console entry from Rust
//! therefore has a terminal twin in EVERY build; only the devtools mirror
//! (sinks + console ring) is dev-only.
//!
//! Two sinks, matching where the two classes of fallback fire:
//!
//! - **Decode sink** (thread-local): the serde-boundary deserializers in
//!   [`crate::protocol`] fall back during `op_flush`'s argument decode, on the
//!   single-threaded JS host thread, where no node id is in scope. The
//!   [`crate::protocol::op::OpBatch`] wrapper brackets each op's decode with
//!   [`decode_watermark`]/[`decode_attribute_since`] to stamp entries with the
//!   op's target node; the host drains the batch's entries right after the
//!   flush via [`take_decode_warnings`] and hands them to the devtools mirror.
//!   Cleared at every batch start, so it stays bounded even when never drained.
//!
//! - **Runtime sink** (global, mutex): apply-time parses (colors, fontFamily,
//!   cursor, text metrics) run inside ECS systems on Bevy's multithreaded
//!   executor, so the sink itself must be shared — but the *node scope* is a
//!   thread-local [`node_scope`] guard, safe because one system body runs on
//!   one thread. Armed only by `DevtoolsPlugin` ([`arm_runtime`]); disarmed,
//!   [`report`] is a single relaxed atomic load. The devtools plugin drains it
//!   each frame ([`take_runtime_warnings`]), dedups, and ships each new entry
//!   to JS as a `devtools.warning` event.
//!
//! Everything but the terminal `warn!` compiles to inline no-op stubs unless
//! the `devtools` feature is on AND `debug_assertions` hold, so release builds
//! pay only the log line (and only when a warning actually fires).

use serde::Serialize;

/// Mirrors [`crate::protocol::NodeId`] (`u32`). Declared locally so this module
/// stays a neutral facade — like `tracing`, anything (including the decoupled
/// `animations`/`canvas` modules) may report into it without depending on the
/// bridge machinery.
pub type NodeId = u32;

/// One invalid value caught at the serde boundary during an op-batch decode.
/// `node` is the target of the op being decoded (`None` for tree ops, which
/// carry no decodable values anyway). `kind` names the value's domain (a
/// `keyword_fields!` kind like `"display"`, or `"length"`/`"rect"`/`"color"`…);
/// the JS side resolves it to concrete style/prop rows by matching `value`
/// against the mirror's retained wire values.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct DecodeWarning {
    pub node: Option<NodeId>,
    pub kind: &'static str,
    pub value: String,
    pub message: String,
}

/// One invalid value caught at apply time inside an ECS system. Same shape as
/// [`DecodeWarning`]; `node` comes from the enclosing [`node_scope`].
// The runtime sink's only consumer is the feature-gated devtools module, so
// without the feature this (and the drain/arm fns) is legitimately dead.
#[cfg_attr(not(feature = "devtools"), allow(dead_code))]
#[derive(Debug, Clone, PartialEq)]
pub struct RuntimeWarning {
    pub node: Option<NodeId>,
    pub kind: &'static str,
    pub value: String,
    pub message: String,
}

#[cfg(all(feature = "devtools", debug_assertions))]
mod imp {
    use super::NodeId;
    use super::{DecodeWarning, RuntimeWarning};
    use std::cell::{Cell, RefCell};
    use std::sync::Mutex;
    use std::sync::atomic::{AtomicBool, Ordering};

    /// Per-batch cap: a pathological batch (every node styled with garbage)
    /// must not balloon the vec; whatever exceeds it stays log-only.
    const DECODE_CAP: usize = 64;
    /// Runtime cap between drains (the devtools plugin drains every frame; a
    /// headless app without it never collects — the sink stays disarmed).
    const RUNTIME_CAP: usize = 256;

    thread_local! {
        static DECODE: RefCell<Vec<DecodeWarning>> = const { RefCell::new(Vec::new()) };
        static CURRENT_NODE: Cell<Option<NodeId>> = const { Cell::new(None) };
    }

    static ARMED: AtomicBool = AtomicBool::new(false);
    static RUNTIME: Mutex<Vec<RuntimeWarning>> = Mutex::new(Vec::new());

    pub fn decode_batch_start() {
        DECODE.with(|d| d.borrow_mut().clear());
    }

    pub fn decode_watermark() -> usize {
        DECODE.with(|d| d.borrow().len())
    }

    pub fn decode_report(kind: &'static str, value: &str, message: &str) {
        super::log_warn(kind, value, message);
        // Mirror into the devtools console ring, independent of DECODE_CAP —
        // the ring self-bounds and the console wants every occurrence (the
        // `devtools.warning` inspector-flag path keeps its own dedup).
        crate::console_log::push(
            crate::console_log::Source::Rust,
            crate::console_log::Level::Warn,
            &format!("[{kind}] {message}"),
        );
        DECODE.with(|d| {
            let mut d = d.borrow_mut();
            if d.len() < DECODE_CAP {
                d.push(DecodeWarning {
                    node: None,
                    kind,
                    value: value.to_owned(),
                    message: message.to_owned(),
                });
            }
        });
    }

    pub fn decode_attribute_since(mark: usize, node: Option<NodeId>) {
        DECODE.with(|d| {
            for w in d.borrow_mut().iter_mut().skip(mark) {
                w.node = node;
            }
        });
    }

    pub fn take_decode_warnings() -> Vec<DecodeWarning> {
        DECODE.with(|d| std::mem::take(&mut *d.borrow_mut()))
    }

    pub fn arm_runtime() {
        ARMED.store(true, Ordering::Relaxed);
    }

    pub struct NodeScope(Option<NodeId>);

    impl Drop for NodeScope {
        fn drop(&mut self) {
            CURRENT_NODE.with(|c| c.set(self.0));
        }
    }

    pub fn node_scope(id: NodeId) -> NodeScope {
        CURRENT_NODE.with(|c| NodeScope(c.replace(Some(id))))
    }

    pub fn report(kind: &'static str, value: &str, message: &str) {
        super::log_warn(kind, value, message);
        if !ARMED.load(Ordering::Relaxed) {
            return;
        }
        let node = CURRENT_NODE.with(|c| c.get());
        // Console-ring mirror (every occurrence, independent of RUNTIME_CAP —
        // the dedup lives only in the `devtools.warning` path).
        crate::console_log::push(
            crate::console_log::Source::Rust,
            crate::console_log::Level::Warn,
            &match node {
                Some(n) => format!("[{kind}] {message} (node {n})"),
                None => format!("[{kind}] {message}"),
            },
        );
        let mut sink = RUNTIME.lock().unwrap_or_else(|e| e.into_inner());
        if sink.len() < RUNTIME_CAP {
            sink.push(RuntimeWarning {
                node,
                kind,
                value: value.to_owned(),
                message: message.to_owned(),
            });
        }
    }

    pub fn take_runtime_warnings() -> Vec<RuntimeWarning> {
        std::mem::take(&mut *RUNTIME.lock().unwrap_or_else(|e| e.into_inner()))
    }
}

// Without the feature, `arm_runtime`/`take_runtime_warnings` lose their only
// caller (the feature-gated devtools module) — that's expected, not rot.
#[cfg_attr(not(feature = "devtools"), allow(dead_code))]
#[cfg(not(all(feature = "devtools", debug_assertions)))]
mod imp {
    use super::NodeId;
    use super::{DecodeWarning, RuntimeWarning};

    #[inline(always)]
    pub fn decode_batch_start() {}
    #[inline(always)]
    pub fn decode_watermark() -> usize {
        0
    }
    #[inline(always)]
    pub fn decode_report(kind: &'static str, value: &str, message: &str) {
        super::log_warn(kind, value, message);
    }
    #[inline(always)]
    pub fn decode_attribute_since(_mark: usize, _node: Option<NodeId>) {}
    #[inline(always)]
    pub fn take_decode_warnings() -> Vec<DecodeWarning> {
        Vec::new()
    }
    #[inline(always)]
    pub fn arm_runtime() {}

    pub struct NodeScope;

    #[inline(always)]
    pub fn node_scope(_id: NodeId) -> NodeScope {
        NodeScope
    }
    #[inline(always)]
    pub fn report(kind: &'static str, value: &str, message: &str) {
        super::log_warn(kind, value, message);
    }
    #[inline(always)]
    pub fn take_runtime_warnings() -> Vec<RuntimeWarning> {
        Vec::new()
    }
}

pub use imp::*;

/// The terminal twin of a devtools warning: `warn!` (target `bevy_react`) the
/// message — **once per distinct `(kind, value, message)` per process**. The
/// sinks and the console ring take every occurrence (the inspector wants the
/// current state), but several report sites fire per frame or per call (a
/// `transform3d` origin fallback re-resolves every frame; `ReactNodes::get`
/// on an ambiguous name reports per lookup; a hover restyle re-parses the
/// same bad color on every flip), and a terminal has no dedup of its own.
/// Node identity is deliberately not part of the key: the same typo on three
/// nodes is one log line (devtools flags each row). Returns whether the line
/// was emitted, for tests. Available in every build — see the module docs.
pub(crate) fn log_warn(kind: &str, value: &str, message: &str) -> bool {
    use std::collections::HashSet;
    use std::hash::{DefaultHasher, Hash, Hasher};
    use std::sync::{LazyLock, Mutex};

    /// Bound on distinct warnings remembered; a pathological app that exceeds
    /// it starts over (worst case: repeats, never silence).
    const SEEN_CAP: usize = 4096;
    static SEEN: LazyLock<Mutex<HashSet<u64>>> = LazyLock::new(Default::default);

    let mut hasher = DefaultHasher::new();
    (kind, value, message).hash(&mut hasher);
    let key = hasher.finish();
    let mut seen = SEEN.lock().unwrap_or_else(|e| e.into_inner());
    if seen.len() >= SEEN_CAP {
        seen.clear();
    }
    if !seen.insert(key) {
        return false;
    }
    drop(seen);
    tracing::warn!(target: "bevy_react", "{message}");
    true
}

/// Serializes tests that touch the process-global runtime sink — a parallel
/// test (or a devtools test app, whose `emit_runtime_warnings` drains every
/// update) would otherwise steal another test's entries. Hold it for the
/// test's whole assertion window; the devtools test harness holds it for each
/// app's lifetime. Available regardless of the feature cfg so test harnesses
/// compile in every configuration.
#[cfg(test)]
pub fn test_lock() -> std::sync::MutexGuard<'static, ()> {
    static LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());
    LOCK.lock().unwrap_or_else(|e| e.into_inner())
}

#[cfg(all(test, feature = "devtools", debug_assertions))]
mod tests {
    use super::*;

    #[test]
    fn decode_sink_stamps_and_drains() {
        decode_batch_start();
        decode_report("length", "aa16", "invalid length \"aa16\"");
        let mark = decode_watermark();
        decode_report("display", "flexx", "unrecognized display \"flexx\"");
        decode_attribute_since(mark, Some(9));
        let warns = take_decode_warnings();
        assert_eq!(warns.len(), 2);
        assert_eq!(warns[0].node, None);
        assert_eq!(warns[1].node, Some(9));
        assert!(take_decode_warnings().is_empty(), "drain empties the sink");
    }

    #[test]
    fn node_scope_nests_and_restores() {
        let _lock = test_lock();
        arm_runtime();
        // Flush anything a parallel (pre-lock) test left behind.
        let _ = take_runtime_warnings();
        {
            let _outer = node_scope(1);
            report("color", "redd", "unrecognized color");
            {
                let _inner = node_scope(2);
                report("color", "bluu", "unrecognized color");
            }
            report("color", "grean", "unrecognized color");
        }
        report("color", "unscoped", "unrecognized color");
        let nodes: Vec<_> = take_runtime_warnings()
            .into_iter()
            .map(|w| w.node)
            .collect();
        assert_eq!(nodes, vec![Some(1), Some(2), Some(1), None]);
    }
}

#[cfg(test)]
mod log_warn_tests {
    /// One terminal line per distinct warning; a different value/kind/message
    /// is a new line. Markers are unique to this test — the set is
    /// process-global.
    #[test]
    fn log_warn_dedups_per_distinct_warning() {
        assert!(super::log_warn("color", "lw-t1-redd", "unrecognized color"));
        assert!(!super::log_warn(
            "color",
            "lw-t1-redd",
            "unrecognized color"
        ));
        assert!(!super::log_warn(
            "color",
            "lw-t1-redd",
            "unrecognized color"
        ));
        assert!(super::log_warn(
            "color",
            "lw-t1-bluee",
            "unrecognized color"
        ));
        assert!(super::log_warn(
            "length",
            "lw-t1-redd",
            "unrecognized color"
        ));
        assert!(super::log_warn("color", "lw-t1-redd", "other message"));
    }
}
