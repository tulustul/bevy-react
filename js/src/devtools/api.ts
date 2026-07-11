// The devtools panel's bridge surface: thin wrappers over the UNTYPED bridge
// functions with hand-written mirror types. Deliberately not the generated
// `bevy.ts` — devtools bindings must never appear in an app's codegen (the
// `--export-bindings` exporter never adds `DevtoolsPlugin`). The Rust twins of
// these shapes live in `crates/core/src/devtools.rs`.

import { addEventListener, emit } from "../bridge";

/** Bevy→JS `devtools.toggle`: the panel's open state changed Bevy-side. */
export interface DevtoolsToggle {
  open: boolean;
}

/** Bevy→JS `devtools.batchStats`: render timings for one applied op batch.
 *  Event-driven — sent only on frames that applied a batch, so an idle app
 *  produces zero devtools traffic. Field names match the Rust struct verbatim
 *  (no rename layer on the untyped channel). */
export interface DevtoolsBatchStats {
  applied_count: number;
  last_ops: number;
  pre_apply_ms: number;
  translate_ms: number;
  command_ms: number;
  layout_ms: number;
}

/** Bevy→JS `devtools.picked`: pick mode clicked a node on screen. */
export interface DevtoolsPicked {
  id: number;
}

/** The panel's persisted layout settings — the JS→Bevy `devtools.settings`
 *  message AND the Bevy→JS `devtools.restore` payload (Rust also serializes
 *  this exact shape to the settings file). Field names match the Rust struct
 *  verbatim (no rename layer on the untyped channel). Geometry is
 *  proportional: the `*_frac` fields are fractions (0..1) of the window's
 *  logical size, so a resized window can't strand the panel off-screen;
 *  `split` stays panel-internal pixels. `open` persists whether the panel was
 *  open, so it reopens on the next launch. */
export interface DevtoolsSettings {
  open: boolean;
  mode: string;
  width_frac: number;
  float_x_frac: number;
  float_y_frac: number;
  float_w_frac: number;
  float_h_frac: number;
  reserve: boolean;
  overlay: boolean;
  split: number;
}

/** Bevy→JS `devtools.window`: the window's logical size — once when the panel
 *  opens (and ahead of the restore payload) and on every resize while it stays
 *  open. The proportional layout resolves its fractions against this. */
export interface DevtoolsWindow {
  width: number;
  height: number;
}

export function onToggle(cb: (e: DevtoolsToggle) => void): () => void {
  return addEventListener("devtools.toggle", cb as (v: unknown) => void);
}

export function onBatchStats(cb: (e: DevtoolsBatchStats) => void): () => void {
  return addEventListener("devtools.batchStats", cb as (v: unknown) => void);
}

export function onPicked(cb: (e: DevtoolsPicked) => void): () => void {
  return addEventListener("devtools.picked", cb as (v: unknown) => void);
}

/** Settings loaded from disk (or defaults), sent exactly once after the React
 *  app mounts — the recorder's disarm signal, among other things. */
export function onRestore(cb: (s: DevtoolsSettings) => void): () => void {
  return addEventListener("devtools.restore", cb as (v: unknown) => void);
}

/** The window's logical size (on panel open + every resize while open). */
export function onWindow(cb: (w: DevtoolsWindow) => void): () => void {
  return addEventListener("devtools.window", cb as (v: unknown) => void);
}

/** Report the panel's layout settings for persistence. Emitted on every
 *  change (per frame during drags) — Bevy debounces the actual file write. */
export function sendSettings(s: DevtoolsSettings): void {
  emit("devtools.settings", s);
}

/** The panel opened/closed itself (close button); keeps Bevy's state in sync. */
export function sendOpen(open: boolean): void {
  emit("devtools.open", { open });
}

/** Toggle pick mode ("click a node on screen to select it"). */
export function sendPick(on: boolean): void {
  emit("devtools.pick", { on });
}

/** Report the panel's own `<root>` node id (`null` when the panel closes), so
 *  pick mode can reject exactly the panel — and nothing else: app `<root>`
 *  overlays stay pickable. */
export function sendPanelRoot(id: number | null): void {
  emit("devtools.panelRoot", { id });
}

/** Report the panel's effective space reservation: which window edge the app
 *  UI should be pushed off (`null` = overlay/float/closed) and the panel width
 *  in logical px. Bevy insets the app root's margin accordingly. */
export function sendDock(side: "left" | "right" | null, width: number): void {
  emit("devtools.dock", { side, width });
}

/** A tree row was selected (`null` clears the selection). */
export function sendSelect(id: number | null): void {
  emit("devtools.select", { id });
}

/** A tree row is hovered — highlight that node on screen (`null` on leave). */
export function sendHighlight(id: number | null): void {
  emit("devtools.highlight", { id });
}

/** Show/hide the persistent selected-node overlay (momentary hover highlights
 *  are unaffected). */
export function sendOverlay(on: boolean): void {
  emit("devtools.overlay", { on });
}
