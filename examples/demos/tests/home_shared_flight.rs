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

use std::collections::HashSet;
use std::time::{Duration, Instant};

use bevy_react::protocol::op::Op;

mod common;
use common::{Harness, Tree};

/// The tile we expand and collapse. Any of the six would do.
const TILE_TAG: &str = "home-tile-filters";

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
fn tag_activity(batch: &[Op], tagged: &mut HashSet<u32>, tree: &Tree) -> TagActivity {
    let mut activity = TagActivity::default();
    for op in batch {
        match op {
            Op::Create { id, props, .. } => {
                if props.shared_tag.as_deref() == Some(TILE_TAG) {
                    tagged.insert(*id);
                    activity.created = true;
                }
            }
            Op::Remove { child, .. } => {
                let before = tagged.len();
                tagged.retain(|&id| !tree.is_under(id, *child));
                activity.removed |= tagged.len() < before;
            }
            _ => {}
        }
    }
    activity
}

/// Drain batches until one shows the tagged node moving, or `dur` elapses.
/// Returns the activity of the batch that touched the tag.
fn await_tag_move(
    h: &mut Harness,
    dur: Duration,
    tagged: &mut HashSet<u32>,
) -> Option<TagActivity> {
    let deadline = Instant::now() + dur;
    while Instant::now() < deadline {
        let Some(batch) = h.recv(Duration::from_millis(25)) else {
            continue;
        };
        let activity = tag_activity(&batch, tagged, &h.tree);
        if activity != TagActivity::default() {
            return Some(activity);
        }
    }
    None
}

/// The id of the currently-mounted node carrying `TILE_TAG`.
fn tagged_id(tagged: &HashSet<u32>) -> u32 {
    assert_eq!(
        tagged.len(),
        1,
        "exactly one node should carry {TILE_TAG} at a time — two live nodes \
         sharing a tag is the ambiguity the pairing rules warn about"
    );
    *tagged.iter().next().unwrap()
}

#[test]
fn tile_expand_and_collapse_each_pair_in_one_commit() {
    let Some(mut h) = Harness::start("tile_expand_and_collapse_each_pair_in_one_commit") else {
        return;
    };
    let mut tagged = HashSet::new();

    // Home is the default page: wait for the wall's tagged card to exist.
    let deadline = Instant::now() + Duration::from_secs(20);
    while Instant::now() < deadline && tagged.is_empty() {
        if let Some(batch) = h.recv(Duration::from_millis(500)) {
            tag_activity(&batch, &mut tagged, &h.tree);
        }
    }
    assert!(!tagged.is_empty(), "home wall never rendered a tagged tile");

    // --- Expand: the wall's card unmounts and the panel's mounts together ---
    h.click(tagged_id(&tagged));
    let expand = await_tag_move(&mut h, Duration::from_secs(5), &mut tagged)
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
    let back = h
        .tree
        .find_button("Back")
        .expect("panel rendered no Back button");
    h.click(back);
    let collapse = await_tag_move(&mut h, Duration::from_secs(5), &mut tagged)
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
