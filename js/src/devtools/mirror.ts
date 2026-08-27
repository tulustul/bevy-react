// The devtools op mirror: a JS-side shadow of the Bevy node tree, maintained by
// replaying every op batch at the bridge tap (see `installDevtools`). It powers
// the tree explorer, the inspector's read-back, app node counts, and log
// filtering — with NO extra bridge traffic and no Rust serialization: the ops
// ARE the wire format, so every value held here is exactly the raw JSON value
// the app sent, and displayed values round-trip into editable values by
// construction.
//
// Merge semantics deliberately mirror Rust's `Props::merge_delta`: an update's
// `props` shallow-merges (style field-by-field), `unset`/`styleUnset` delete,
// and act-now event fields (`value`, `selection*`, `scroll*`, `draw`) are never
// retained. Known limitation (same as the Rust props_cache): this is the
// React-authored tree — Rust-side mutations (interaction style variants,
// animation-driven values, live scroll offsets) are not reflected.
//
// Lives in vendor.js (never re-executed on hot reload), so it survives Fast
// Refresh; a cold reload's `reset` op clears it along with the Bevy tree.

import type { DecodeWarning, Op } from "../bridge";
import { clearOwners, takeOwner } from "./owners";
import { matchWarning } from "./warnings";

/** Event-like fields that act once and are never part of retained state —
 *  keep in sync with `protocol.rs`'s `Props::split_events`. */
const ACT_NOW = new Set([
  "value",
  "selectionStart",
  "selectionEnd",
  "scrollTop",
  "scrollLeft",
  "draw",
]);

export interface MirrorNode {
  id: number;
  /** Host element kind from the create op (`"node"`, `"text"`, …); `"#text"`
   *  for bare string runs; `"#root"` for the synthetic container. */
  kind: string;
  /** Inline text content (single-string `<text>`, or a bare-string run). */
  text?: string;
  /** Retained top-level props (wire values; style split out, act-now dropped). */
  props: Record<string, unknown>;
  /** Retained style fields (wire values). */
  style: Record<string, unknown>;
  children: number[];
  parent: number | null;
  /** Created by the devtools panel's own container (excluded from app views). */
  devtools: boolean;
  /** The React component whose JSX emitted this node, when the dev build could
   *  attribute it (see `owners.ts`); absent when it could not. */
  owner?: string;
  /** Invalid-value flags by inspector row key (`style:width` / `prop:tint`) →
   *  the Rust warn message. Set from Rust-reported warnings (decode-time via
   *  the flush tap, apply-time via `devtools.warning`); an entry clears when
   *  its field is next set or unset, and dies with the node. Lazily created —
   *  most nodes never warn. */
  warnings?: Map<string, string>;
}

const nodes = new Map<number, MirrorNode>();
let version = 0;
const subscribers = new Set<() => void>();
let notifyQueued = false;

function makeNode(id: number, kind: string, devtools: boolean): MirrorNode {
  const node: MirrorNode = {
    id,
    kind,
    props: {},
    style: {},
    children: [],
    parent: null,
    devtools,
  };
  // Recorded by the renderer when the node was created — this commit, since
  // every commit flushes. Taking it here ties the name's lifetime to the node.
  const owner = takeOwner(id);
  if (owner) node.owner = owner;
  return node;
}

function ensureRoot(): MirrorNode {
  let root = nodes.get(0);
  if (!root) {
    root = makeNode(0, "#root", false);
    nodes.set(0, root);
  }
  return root;
}
ensureRoot();

// Notify on a microtask: `apply` runs inside React's commit (the flush tap), and
// many flushes can land per frame — one deferred notification re-renders the
// panel once, outside the app container's commit.
function scheduleNotify(): void {
  version++;
  if (notifyQueued) return;
  notifyQueued = true;
  queueMicrotask(() => {
    notifyQueued = false;
    for (const cb of subscribers) cb();
  });
}

function detach(child: MirrorNode): void {
  if (child.parent === null) return;
  const parent = nodes.get(child.parent);
  if (parent) {
    const i = parent.children.indexOf(child.id);
    if (i >= 0) parent.children.splice(i, 1);
  }
  child.parent = null;
}

function dropSubtree(id: number): void {
  const node = nodes.get(id);
  if (!node) return;
  nodes.delete(id);
  for (const child of node.children) dropSubtree(child);
}

function mergeProps(node: MirrorNode, props: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(props)) {
    if (key === "style") {
      const style = value as Record<string, unknown> | undefined;
      if (style)
        for (const [k, v] of Object.entries(style)) {
          node.style[k] = v;
          // A fresh value supersedes the field's warning; a re-reported
          // invalid value re-flags right after (post-merge matching).
          node.warnings?.delete(`style:${k}`);
        }
    } else if (!ACT_NOW.has(key)) {
      node.props[key] = value;
      node.warnings?.delete(`prop:${key}`);
    }
  }
}

function applyOp(op: Op, devtools: boolean): void {
  switch (op.op) {
    case "reset": {
      nodes.clear();
      clearOwners();
      ensureRoot();
      break;
    }
    case "create": {
      const node = makeNode(op.id, op.kind, devtools);
      mergeProps(node, op.props as Record<string, unknown>);
      if (op.text !== undefined) node.text = op.text;
      nodes.set(op.id, node);
      break;
    }
    case "createText":
    case "createTextSpan": {
      const node = makeNode(op.id, "#text", devtools);
      node.text = op.text;
      nodes.set(op.id, node);
      break;
    }
    case "append": {
      const child = nodes.get(op.child);
      const parent = nodes.get(op.parent) ?? ensureRoot();
      if (!child) break;
      detach(child);
      child.parent = parent.id;
      parent.children.push(op.child);
      break;
    }
    case "insert": {
      const child = nodes.get(op.child);
      const parent = nodes.get(op.parent) ?? ensureRoot();
      if (!child) break;
      detach(child);
      child.parent = parent.id;
      const i = parent.children.indexOf(op.before);
      if (i >= 0) parent.children.splice(i, 0, op.child);
      else parent.children.push(op.child);
      break;
    }
    case "remove": {
      const child = nodes.get(op.child);
      if (!child) break;
      detach(child);
      dropSubtree(op.child);
      break;
    }
    case "update": {
      const node = nodes.get(op.id);
      if (!node) break;
      mergeProps(node, op.props as Record<string, unknown>);
      for (const key of op.unset ?? []) {
        delete node.props[key];
        node.warnings?.delete(`prop:${key}`);
      }
      for (const key of op.styleUnset ?? []) {
        delete node.style[key];
        // Unsetting clears the flag too — this is also the path the style
        // disable checkbox rides.
        node.warnings?.delete(`style:${key}`);
      }
      break;
    }
    case "updateText": {
      const node = nodes.get(op.id);
      if (node) node.text = op.text;
      break;
    }
    case "draw":
      break; // imperative canvas paint — no retained tree state
  }
}

/** Match one warning against its node's retained values and store the flags.
 *  Returns whether a visible (non-devtools-node) flag changed — the caller's
 *  notify signal. Idempotent: an unchanged message never reports a change, so
 *  a re-reported warning can't churn the panel. */
function setWarnings(
  id: number | null,
  warning: { kind: string; value: string; message: string },
): boolean {
  if (id === null) return false;
  const node = nodes.get(id);
  if (!node) return false;
  let changed = false;
  for (const key of matchWarning(node, warning)) {
    const warnings = (node.warnings ??= new Map());
    if (warnings.get(key) !== warning.message) {
      warnings.set(key, warning.message);
      if (!node.devtools) changed = true;
    }
  }
  return changed;
}

export const mirror = {
  /** Replay one flushed op batch (called from the bridge tap).
   *
   *  Batches from the devtools panel's own container apply SILENTLY: the panel
   *  never renders its own nodes, and notifying would loop — panel commit →
   *  version bump → store re-render → new stats values → new ops → commit…
   *  until React kills the root with "maximum update depth exceeded". The one
   *  exception is a devtools batch that touches an APP node (an inspector
   *  edit): that must notify so the inspector shows the applied value. */
  apply(
    batch: Op[],
    devtools: boolean,
    decodeWarnings?: DecodeWarning[],
  ): void {
    let visible = !devtools;
    for (const op of batch) {
      if (devtools && !visible) {
        // An inspector edit targets an APP node — the inspector must see it.
        const target =
          op.op === "update" || op.op === "updateText" ? op.id : null;
        if (target !== null && !(nodes.get(target)?.devtools ?? true)) {
          visible = true;
        }
        // A `<root>` coming or going changes the root selector — even the
        // panel's own (its create lands AFTER the selector first rendered).
        // Loop-safe: the panel creates its root once per open, not per commit.
        if (
          (op.op === "create" && op.kind === "root") ||
          (op.op === "remove" && nodes.get(op.child)?.kind === "root")
        ) {
          visible = true;
        }
      }
      applyOp(op, devtools);
    }
    // Match this batch's decode-time invalid-value warnings against the
    // now-merged wire values (matching must run post-merge so a warning for a
    // value the same batch set can resolve to its field). A flag on an APP
    // node must repaint the inspector even for a devtools-authored batch —
    // that's exactly the inline-edit feedback path; the panel's own nodes
    // stay silent (same no-self-observation rule as ops).
    for (const w of decodeWarnings ?? []) {
      if (setWarnings(w.node, w)) visible = true;
    }
    if (visible) scheduleNotify();
  },

  /** Attach an apply-time (`devtools.warning` event) invalid-value flag. */
  addRuntimeWarning(w: {
    id: number | null;
    kind: string;
    value: string;
    message: string;
  }): void {
    if (setWarnings(w.id, w)) scheduleNotify();
  },

  get(id: number): MirrorNode | undefined {
    return nodes.get(id);
  },

  root(): MirrorNode {
    return ensureRoot();
  },

  /** Whether `id` was created by the devtools panel's own container. */
  isDevtools(id: number): boolean {
    return nodes.get(id)?.devtools ?? false;
  },

  /** Every selectable tree root: the main window tree plus each detached
   *  `<root>` element (in creation order — Map iteration preserves insertion).
   *  A root's label is its `name` prop; unnamed roots are numbered from #2
   *  (main is #1). */
  roots(): { id: number; label: string }[] {
    const out = [{ id: 0, label: "main" }];
    for (const node of nodes.values()) {
      if (node.kind !== "root") continue;
      const name = node.props.name;
      out.push({
        id: node.id,
        label: typeof name === "string" ? name : `root#${out.length + 1}`,
      });
    }
    return out;
  },

  /** Live app nodes (every mirrored node except the synthetic root and the
   *  devtools panel's own). */
  appNodeCount(): number {
    let count = 0;
    for (const node of nodes.values()) {
      if (node.id !== 0 && !node.devtools) count++;
    }
    return count;
  },

  // `useSyncExternalStore` surface.
  subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  },
  getVersion(): number {
    return version;
  },
};
