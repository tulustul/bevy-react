//! The home page's tile <-> panel flight is a `sharedTag` pair, and a pair only
//! forms when the outgoing node's removal and the incoming node's creation land
//! in the SAME op batch (one React commit). Expanding a tile and collapsing it
//! again are two different code paths in `Home`, and the collapse used to split
//! across two commits — the wall mounted its card while the panel was still
//! alive, then the panel unmounted with nothing left to pair with, so the tile
//! snapped home instead of flying.
//!
//! This drives the real JS thread over channels (no GPU/window) and asserts the
//! precondition on the wire in both directions.
//!
//! Requires the example bundle:
//!   npm run build -w demos

use std::collections::HashMap;
use std::path::PathBuf;
use std::time::{Duration, Instant};

use crossbeam_channel::{Receiver, RecvTimeoutError};

use bevy_react::js_thread::spawn_js_thread;
use bevy_react::protocol::{op::Op, outbound::Outbound, outbound::UiEvent};
use bevy_react::{RawRequest, ReactMessage};

mod common;

/// The tile we expand and collapse. Any of the six would do.
const TILE_TAG: &str = "home-tile-filters";

fn example_bundle() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../examples/demos/ui/dist/app.js")
}

/// Where a node carrying `TILE_TAG` was created or destroyed within one batch.
#[derive(Debug, Default, PartialEq)]
struct TagActivity {
    created: bool,
    removed: bool,
}

/// Scan one batch for the tagged node's lifecycle.
///
/// React emits ONE `Remove` for a detached subtree's root, so a removal counts
/// when the tagged node IS that child or sits under it — the same ancestor walk
/// the Rust pairing pre-pass does (`shared_tags::plan_pairs::under_removed`).
/// Matching the removed id alone would miss the shape the wall actually uses:
/// it swaps the whole `<Tile>` for a placeholder `<node />`, so the tagged card
/// leaves inside its slot rather than being detached itself.
fn tag_activity(
    batch: &[Op],
    tagged: &mut HashMap<u32, ()>,
    nodes: &HashMap<u32, NodeInfo>,
) -> TagActivity {
    let mut activity = TagActivity::default();
    for op in batch {
        match op {
            Op::Create { id, props, .. } => {
                if props.shared_tag.as_deref() == Some(TILE_TAG) {
                    tagged.insert(*id, ());
                    activity.created = true;
                }
            }
            Op::Remove { child, .. } => {
                let gone: Vec<u32> = tagged
                    .keys()
                    .copied()
                    .filter(|&id| is_under(id, *child, nodes))
                    .collect();
                for id in gone {
                    tagged.remove(&id);
                    activity.removed = true;
                }
            }
            _ => {}
        }
    }
    activity
}

/// Whether `id` is `root` or a descendant of it. Bounded so a malformed parent
/// map cannot loop forever.
fn is_under(mut id: u32, root: u32, nodes: &HashMap<u32, NodeInfo>) -> bool {
    for _ in 0..64 {
        if id == root {
            return true;
        }
        match nodes.get(&id).and_then(|n| n.parent) {
            Some(parent) => id = parent,
            None => return false,
        }
    }
    false
}

/// Drain batches until one shows the tagged node moving, or `dur` elapses.
/// Returns the activity of the batch that touched the tag.
fn await_tag_move(
    ops_rx: &Receiver<Vec<Op>>,
    dur: Duration,
    tagged: &mut HashMap<u32, ()>,
    nodes: &mut HashMap<u32, NodeInfo>,
) -> Option<TagActivity> {
    let deadline = Instant::now() + dur;
    while Instant::now() < deadline {
        match ops_rx.recv_timeout(Duration::from_millis(25)) {
            Ok(batch) => {
                for op in &batch {
                    record(op, nodes);
                }
                let activity = tag_activity(&batch, tagged, nodes);
                if activity != TagActivity::default() {
                    return Some(activity);
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died"),
        }
    }
    None
}

#[derive(Default, Clone)]
struct NodeInfo {
    kind: Option<String>,
    text: Option<String>,
    parent: Option<u32>,
}

fn record(op: &Op, nodes: &mut HashMap<u32, NodeInfo>) {
    match op {
        Op::Create { id, kind, text, .. } => {
            let entry = nodes.entry(*id).or_default();
            entry.kind = Some(kind.clone());
            if let Some(text) = text {
                entry.text = Some(text.clone());
            }
        }
        Op::CreateText { id, text } | Op::CreateTextSpan { id, text } => {
            nodes.entry(*id).or_default().text = Some(text.clone());
        }
        Op::Append { parent, child } => {
            nodes.entry(*child).or_default().parent = Some(*parent);
        }
        Op::Insert { parent, child, .. } => {
            nodes.entry(*child).or_default().parent = Some(*parent);
        }
        _ => {}
    }
}

/// The id of the currently-mounted node carrying `TILE_TAG`.
fn tagged_id(tagged: &HashMap<u32, ()>) -> u32 {
    assert_eq!(
        tagged.len(),
        1,
        "exactly one node should carry {TILE_TAG} at a time — two live nodes \
         sharing a tag is the ambiguity the pairing rules warn about"
    );
    *tagged.keys().next().unwrap()
}

/// Walk up from the `Back` label's text run to the enclosing `<button>` — the
/// label sits under a wrapper `<node>` or two inside `Button`.
fn find_back_button(nodes: &HashMap<u32, NodeInfo>) -> Option<u32> {
    let labels: Vec<u32> = nodes
        .iter()
        .filter(|(_, info)| info.text.as_deref().map(str::trim) == Some("Back"))
        .map(|(&id, _)| id)
        .collect();
    for label in labels {
        let mut current = label;
        // Bounded so a malformed parent map cannot loop forever.
        for _ in 0..8 {
            let Some(parent) = nodes.get(&current).and_then(|i| i.parent) else {
                break;
            };
            if nodes.get(&parent).and_then(|i| i.kind.as_deref()) == Some("button") {
                return Some(parent);
            }
            current = parent;
        }
    }
    None
}

#[test]
fn tile_expand_and_collapse_each_pair_in_one_commit() {
    let bundle = example_bundle();
    if !bundle.exists() {
        eprintln!(
            "skipping tile_expand_and_collapse_each_pair_in_one_commit: bundle not built at {}\n  run: npm run build -w demos",
            bundle.display()
        );
        return;
    }

    let (ops_tx, ops_rx) = crossbeam_channel::unbounded::<Vec<Op>>();
    let (flush_stamps_tx, _flush_stamps_rx) = crossbeam_channel::unbounded();
    let (flush_devtools_tx, _flush_devtools_rx) = crossbeam_channel::unbounded();
    let (emit_tx, _emit_rx) = crossbeam_channel::unbounded::<ReactMessage>();
    let (request_tx, request_rx) = crossbeam_channel::unbounded::<RawRequest>();
    let (anim_tx, _anim_rx) = crossbeam_channel::unbounded();
    let (outbound_tx, outbound_rx) = tokio::sync::mpsc::unbounded_channel::<Outbound>();
    common::answer_window_size(request_rx, outbound_tx.clone());
    let (_reload_tx, reload_rx) = tokio::sync::mpsc::unbounded_channel::<()>();

    let vendor = bundle.with_file_name("vendor.js");
    spawn_js_thread(
        vendor,
        bundle,
        ops_tx,
        flush_stamps_tx,
        flush_devtools_tx,
        emit_tx,
        request_tx,
        anim_tx,
        outbound_rx,
        reload_rx,
    );

    let mut nodes: HashMap<u32, NodeInfo> = HashMap::new();
    let mut tagged: HashMap<u32, ()> = HashMap::new();

    // Home is the default page: wait for the wall's tagged card to exist.
    let deadline = Instant::now() + Duration::from_secs(20);
    while Instant::now() < deadline && tagged.is_empty() {
        match ops_rx.recv_timeout(Duration::from_millis(500)) {
            Ok(batch) => {
                for op in &batch {
                    record(op, &mut nodes);
                }
                tag_activity(&batch, &mut tagged, &nodes);
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => panic!("JS thread died during first render"),
        }
    }
    assert!(!tagged.is_empty(), "home wall never rendered a tagged tile");

    let click = |id: u32| {
        outbound_tx
            .send(Outbound::UiEvent {
                event: UiEvent {
                    id,
                    kind: "click".into(),
                    ..Default::default()
                },
            })
            .expect("JS thread gone before click");
    };

    // --- Expand: the wall's card unmounts and the panel's mounts together ---
    click(tagged_id(&tagged));
    let expand = await_tag_move(&ops_rx, Duration::from_secs(5), &mut tagged, &mut nodes)
        .expect("expanding produced no op batch touching the tile's tag");
    assert_eq!(
        expand,
        TagActivity {
            created: true,
            removed: true
        },
        "expanding must remove the wall's tagged card and create the panel's in ONE batch"
    );
    tagged_id(&tagged);

    // --- Collapse: the same, in reverse. This is the direction that broke. ---
    let back = find_back_button(&nodes).expect("panel rendered no Back button");
    click(back);
    let collapse = await_tag_move(&ops_rx, Duration::from_secs(5), &mut tagged, &mut nodes)
        .expect("collapsing produced no op batch touching the tile's tag");
    assert_eq!(
        collapse,
        TagActivity {
            created: true,
            removed: true
        },
        "collapsing must remove the panel's tagged node and create the wall's in ONE batch — \
         two commits means no pair, and the tile snaps home instead of flying"
    );
    tagged_id(&tagged);
}
