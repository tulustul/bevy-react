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
  frame_wait_ms: number;
  pre_apply_ms: number;
  translate_ms: number;
  command_ms: number;
  layout_ms: number;
}

/** Bevy→JS `devtools.picked`: pick mode clicked a node on screen. */
export interface DevtoolsPicked {
  id: number;
}

/** Bevy→JS `devtools.warning`: an invalid style/prop value fell back to a
 *  default at apply time (unrecognized color, unknown fontFamily/cursor, bad
 *  text metric). Sent whether or not the panel is open — the mirror stores
 *  the flag for whenever it opens. Decode-time warnings take the synchronous
 *  `op_take_decode_warnings` path through the bridge tap instead. */
export interface DevtoolsWarning {
  id: number | null;
  kind: string;
  value: string;
  message: string;
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
  /** The active tab ("nodes" | "layers" | "console" | "bridge"); validated on
   *  restore. */
  tab: string;
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

/** A layer rect in a `devtools.layers` payload: logical (CSS) px in window
 *  space — the same space as `devtools.window` — plus the physical capture
 *  dims for the texture-memory estimate (`physical_width * physical_height *
 *  4` bytes). */
export interface DevtoolsLayerRect {
  x: number;
  y: number;
  width: number;
  height: number;
  physical_width: number;
  physical_height: number;
}

/** One layer in a `devtools.layers` payload. `rect: null` = inactive (hidden,
 *  zero-sized, or not laid out yet): listed greyed, absent from the map. */
export interface DevtoolsLayerRow {
  /** The layer root's wire node id (`0` for the base layer). */
  id: number;
  /** Promotion reason labels (`["base"]` for the base layer, else e.g.
   *  `["opacity"]`) — opaque strings displayed verbatim. */
  reasons: string[];
  /** Nesting depth: 0 = base, 1 = top-level layer, 2 = nested, … */
  depth: number;
  node_count: number;
  rect: DevtoolsLayerRect | null;
  /** Frames that re-captured this layer since promotion (cache misses).
   *  Always `0` for the base layer. */
  repaints: number;
}

/** Bevy→JS `devtools.layers`: the current layer set (base + promoted), sorted
 *  by (depth, id). Streamed only while the Layers tab is active and diffed
 *  Rust-side — an idle app sends nothing. */
export interface DevtoolsLayers {
  layers: DevtoolsLayerRow[];
}

/** One row in a `devtools.console` payload: an entry from the Rust-side
 *  console ring — JS `console.*` output (source "js"), or a Rust diag
 *  message / JS-runtime failure (source "rust"). */
export interface DevtoolsConsoleEntry {
  /** Process-monotonic id (never reused, survives clears). */
  seq: number;
  /** Wall-clock epoch milliseconds. */
  time_ms: number;
  /** "js" | "rust". */
  source: string;
  /** "debug" | "info" | "warn" | "error". */
  level: string;
  message: string;
}

/** Bevy→JS `devtools.console`: console entries, oldest→newest per batch. The
 *  full ring backlog arrives right after the Console tab announces itself
 *  (`sendConsoleOpen(true)`); later batches carry only new entries. Nothing
 *  streams while the tab is hidden. */
export interface DevtoolsConsole {
  entries: DevtoolsConsoleEntry[];
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

/** Apply-time invalid-value warnings (see [`DevtoolsWarning`]). */
export function onWarning(cb: (w: DevtoolsWarning) => void): () => void {
  return addEventListener("devtools.warning", cb as (v: unknown) => void);
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

/** The current layer set (see [`DevtoolsLayers`]); streamed while the Layers
 *  tab is active. */
export function onLayers(cb: (e: DevtoolsLayers) => void): () => void {
  return addEventListener("devtools.layers", cb as (v: unknown) => void);
}

/** Console entries (see [`DevtoolsConsole`]); streamed while the Console tab
 *  is active. */
export function onConsole(cb: (e: DevtoolsConsole) => void): () => void {
  return addEventListener("devtools.console", cb as (v: unknown) => void);
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

/** The Layers tab was shown/hidden — gates the Rust-side layer stream. Sent
 *  from the Layers panel's mount/unmount, so tab switches, the close button,
 *  and the toggle key all funnel through it. */
export function sendLayersOpen(on: boolean): void {
  emit("devtools.layersOpen", { on });
}

/** The Console tab was shown/hidden — gates the Rust-side console stream
 *  (same mount/unmount contract as [`sendLayersOpen`]). */
export function sendConsoleOpen(on: boolean): void {
  emit("devtools.consoleOpen", { on });
}

/** The Console tab's clear button — empty the Rust-side console ring (the
 *  panel clears its local list itself). */
export function sendConsoleClear(): void {
  emit("devtools.consoleClear", {});
}
