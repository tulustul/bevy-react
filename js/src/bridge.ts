// The JS half of the Rust<->JS boundary: an op buffer flushed per commit, a
// registry of event handlers (which never cross into Rust), and the event loop
// that pulls UI events back from Bevy.

import { BevyCanvasElement, recordDrawing } from "./canvas";
import type { CanvasPainter, DrawCmd } from "./canvas";

// The whole Rust<->JS op surface. The same bundle runs under two hosts:
//   - Native: an embedded V8 isolate (deno_core) exposes these under `Deno.core.ops`.
//   - Web: the Bevy wasm module installs the identical methods on
//     `globalThis.__bevyHost` (backed by `#[wasm_bindgen]` exports) before this
//     bundle runs.
// Same names and signatures both ways, so everything below is host-agnostic.
interface BevyHost {
  op_flush(ops: Op[], devtools: boolean): void;
  op_emit(name: string, value: unknown): void;
  op_request(id: bigint, name: string, value: unknown): void;
  op_animate(cmd: AnimationCommand): void;
  op_next_event(): Promise<Outbound | null>;
  /** Drain the invalid-value warnings collected while decoding the most recent
   *  `op_flush` batch (dev builds with devtools; optional so a prod host may
   *  omit it). Called only when a bridge tap is installed. */
  op_take_decode_warnings?(): DecodeWarning[];
}

/** Mirrors `bevy_react::diag::DecodeWarning`: one invalid style/prop value the
 *  Rust serde boundary replaced with a default while decoding an op batch.
 *  `node` is the target of the op that carried it; `kind` names the value's
 *  domain (`"length"`, `"rect"`, a keyword field name like `"display"`, …) —
 *  the devtools mirror matches `value` against the node's retained wire values
 *  to resolve the concrete field. */
export interface DecodeWarning {
  node: number | null;
  kind: string;
  value: string;
  message: string;
}

// Resolved at module load. On native `Deno.core.ops` is read; on web the injected
// host short-circuits the `??`, so `Deno` (undefined in a browser) is never touched.
declare const Deno: { core: { ops: BevyHost } };
const ops: BevyHost =
  (globalThis as { __bevyHost?: BevyHost }).__bevyHost ?? Deno.core.ops;

// Mirrors `bevy_react::animations::protocol::AnimationCommand` (tag = "kind").
// `token` correlates a completion callback: Bevy reports the driver's settlement
// back with it (see `registerAnimationCallback`); omitted → nothing is reported.
export type AnimationCommand =
  | { kind: "declare"; id: number; initial: number }
  | { kind: "set"; id: number; value: number }
  | { kind: "animate"; id: number; driver: unknown; token?: number }
  | { kind: "cancel"; id: number }
  | { kind: "clear" };

// Mirrors `protocol::Outbound` on the Rust side (internally tagged with `t`).
export type Outbound =
  | { t: "uiEvent"; event: UiEvent }
  | { t: "event"; name: string; value: unknown }
  | { t: "response"; id: number; result: ResponseResult }
  | { t: "animationFinished"; id: number; token: number; finished: boolean }
  | { t: "reload" };

// Mirrors `protocol::ResponseResult` (internally tagged with `status`).
type ResponseResult =
  | { status: "ok"; value: unknown }
  | { status: "err"; message: string };

export const ROOT_ID = 0;

// Mirrors `protocol::Op` on the Rust side (tag = "op").
export type Op =
  | { op: "reset" }
  | {
      op: "create";
      id: number;
      kind: string;
      props: SerializedProps;
      // Inline text for a single-string `<text>`/`<textSpan>` (shouldSetTextContent).
      text?: string;
    }
  | { op: "createText"; id: number; text: string }
  | { op: "createTextSpan"; id: number; text: string }
  | { op: "append"; parent: number; child: number }
  | { op: "insert"; parent: number; child: number; before: number }
  | { op: "remove"; parent: number; child: number }
  | {
      op: "update";
      id: number;
      // A delta against the node's last applied props: `props` carries only
      // the changed fields (`props.style` only the changed style fields);
      // `unset`/`styleUnset` name prop / style wire fields reset to their
      // defaults; anything in neither is left unchanged on the Bevy side.
      props: SerializedProps;
      unset?: string[];
      styleUnset?: string[];
    }
  | { op: "updateText"; id: number; text: string }
  // Append draw commands to a `<canvas>`'s retained surface (an imperative
  // handle's microtask flush, or the runtime's clear+replay after a resize).
  | { op: "draw"; id: number; cmds: DrawCmd[] };

// Handler props cross as presence booleans under their own prop name; the
// flag set is derived from `HANDLER_KINDS` so it can't drift.
export interface SerializedProps extends Partial<
  Record<HandlerPropKey, boolean>
> {
  style?: Record<string, unknown>;
  hoverStyle?: Record<string, unknown>;
  pressStyle?: Record<string, unknown>;
  focusStyle?: Record<string, unknown>;
  // World-anchor binding (an `<anchor>`'s entity + offset), opaque like style;
  // decoded on the Rust side into `Anchor`.
  anchor?: Record<string, unknown>;
  // An SVG shape child's folded attributes (`packShapeProps`), opaque like
  // `anchor`; decoded on the Rust side into `ShapeAttrs`.
  shape?: Record<string, unknown>;
  // An `<svg>` element's `viewBox` (`"minX minY width height"`), parsed on
  // the Rust side.
  viewBox?: string;
  color?: string;
  fontSize?: number;
  // Controlled scroll offsets (logical px) for any node with `overflow: scroll`.
  scrollTop?: number;
  scrollLeft?: number;
  scrollStep?: number;
  // `image` element attributes
  src?: string;
  tint?: string;
  flipX?: boolean;
  flipY?: boolean;
  // `"auto"`/`"stretch"`, or an opaque 9-slice/tiled spec object, decoded on the
  // Rust side into `NodeImageMode`.
  imageMode?: string | Record<string, unknown>;
  // Source sub-rect (`{x,y,width,height}` px) and sprite-sheet grid + cell, both
  // opaque to JS and decoded on the Rust side into `ImageNode.rect`/`texture_atlas`.
  sourceRect?: Record<string, unknown>;
  atlas?: Record<string, unknown>;
  // `"content"`/`"padding"`/`"border"` → `ImageNode.visual_box`.
  visualBox?: string;
  // `canvas` element: the recorded vector display list, rasterized on the Bevy
  // side (clear + replay on the retained surface).
  draw?: DrawCmd[];
  // Any element: its Bevy `Name` (see `BevyAttributes.name`).
  name?: string;
  // `portal` element: the render-target name to display. Also carries a
  // `surface` element's `target` (the offscreen surface its subtree renders into).
  target?: string;
  // `editableText` element attributes
  value?: string;
  maxLength?: number;
  multiline?: boolean;
  autofocus?: boolean;
  // Controlled selection as UTF-8 byte offsets into `value`.
  selectionStart?: number;
  selectionEnd?: number;
  ariaLabel?: string;
}

export interface UiEvent {
  id: number;
  kind: string;
  // Cursor position within the node, normalized to 0..1 (top-left origin).
  // Present only for pointer events; absent for "click".
  x?: number;
  y?: number;
  // Absolute cursor position in window logical pixels (top-left origin).
  // Present only for pointer events; absent for "click".
  clientX?: number;
  clientY?: number;
  // Which mouse button fired, DOM numbering (0 left, 1 middle, 2 right).
  // Present for pointerDown/Move/Up; absent for "click" (primary-only, like
  // DOM click) and hover/scroll/text events.
  button?: number;
  // The new text. Present only for an `editableText`'s "change" event.
  value?: string;
  // Selection as UTF-8 byte offsets. Present only for the "select" event.
  selectionStart?: number;
  selectionEnd?: number;
  // "forward" | "backward" | "none". Present only for "select".
  selectionDirection?: string;
  // Whether an IME composition is in progress. Present on "change"/"select".
  composing?: boolean;
  // New scroll offset (logical px). Present only for the "scroll" event.
  scrollTop?: number;
  scrollLeft?: number;
  // Raw wheel delta. Present only for the "wheel" event; interpret with
  // `deltaMode` ("line" = mouse notches, "pixel" = trackpad), like DOM WheelEvent.
  deltaX?: number;
  deltaY?: number;
  deltaMode?: string;
  // New laid-out size (logical px). Present only for a `canvas`'s "resize"
  // event — fired on first layout and any size change, after the retained
  // surface was cleared.
  width?: number;
  height?: number;
}

// Ops accumulated during the current commit, flushed in resetAfterCommit.
const pending: Op[] = [];

// id -> { click: handler, ... }. Handlers stay here; only a boolean crosses.
const handlers = new Map<
  number,
  Record<string, (...args: unknown[]) => void>
>();

// id -> a `<canvas>`'s declarative `draw` prop (painter fn or prebuilt list),
// kept so the runtime can replay it after a resize cleared the surface.
// Refreshed on every (re)serialization so replay uses the newest closure.
const canvasPainters = new Map<number, CanvasPainter | DrawCmd[]>();

// id -> a `<canvas>`'s last laid-out logical size, from its "resize" events.
// Read by the element handle's `width`/`height`.
const canvasSizes = new Map<number, { width: number; height: number }>();

let nextId = 1; // 0 is reserved for the root container.

export function allocId(): number {
  return nextId++;
}

export function push(op: Op): void {
  pending.push(op);
}

// Queue a teardown of the previous tree. A fresh runtime calls this before its
// first render so a hot reload replaces (rather than duplicates) the UI. Also
// clears the Bevy-side shared-value table (which persists across reloads) so
// stale animated values don't linger — and the completion-callback registry,
// whose pending entries would otherwise never fire (Bevy drops their
// settlements on `clear`).
export function reset(): void {
  pending.push({ op: "reset" });
  ops.op_animate({ kind: "clear" });
  animationCallbacks.clear();
  canvasPainters.clear();
  canvasSizes.clear();
}

// Send an animation command to the animations plugin (declare/set/animate/
// cancel/clear). Synchronous and fire-and-forget, like `emit`. Low-level — apps
// use the `useSharedValue` / `with*` helpers from `./animated`.
export function animate(cmd: AnimationCommand): void {
  ops.op_animate(cmd);
}

// --- Animation completion callbacks ---

// One entry per in-flight `animate` command that carried a callback, keyed by
// the correlation token sent with it. Bevy reports each token's settlement
// exactly once (finished or interrupted), so entries are removed on dispatch.
// Owned here (not in `animated.ts`) so `reset()` can clear it.
let nextAnimationToken = 1;
const animationCallbacks = new Map<number, (finished: boolean) => void>();

// Register a completion callback and return the token to send with the
// `animate` command. Low-level — apps pass callbacks to the `with*` helpers.
export function registerAnimationCallback(
  cb: (finished: boolean) => void,
): number {
  const token = nextAnimationToken++;
  animationCallbacks.set(token, cb);
  return token;
}

// Wall clock for instrumentation (the embedded isolate may lack `performance`).
export const nowMs: () => number =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? () => performance.now()
    : () => Date.now();

// --- Devtools bridge tap ---

// A passive observer of every message crossing the boundary, in both directions.
// Installed only by the devtools runtime (dev builds); in production the tap is
// null and each call site pays one null check. Taps observe AFTER a successful
// send (a thrown `op_flush` means Bevy never saw the batch, so observers — the
// devtools op mirror in particular — must not see it either).
export interface BridgeTap {
  /** A JS→Bevy op batch. `devtools` marks the devtools panel's own container.
   *  `decodeWarnings` are the invalid-value fallbacks Rust collected while
   *  decoding exactly this batch (absent on hosts without the drain op). */
  flush(batch: Op[], devtools: boolean, decodeWarnings?: DecodeWarning[]): void;
  /** A JS→Bevy fire-and-forget app message. */
  emit(name: string, value: unknown): void;
  /** A JS→Bevy correlated request (its response arrives via `outbound`). */
  request(id: number, name: string, value: unknown): void;
  /** A Bevy→JS message, observed before it is routed. */
  outbound(msg: Outbound): void;
  /** The event loop is about to run a handler inside `flushSync` (the "JS"
   *  timing leg starts — handler + React render + commit). */
  wrapStart(): void;
  /** …and it finished, `ms` later. Commits scheduled outside an event wrap
   *  (timers, microtasks) are not bracketed and get no JS leg. */
  wrapEnd(ms: number): void;
}

let bridgeTap: BridgeTap | null = null;

/** Install (or with `null`, remove) the devtools bridge tap. Devtools-internal. */
export function __installBridgeTap(tap: BridgeTap | null): void {
  bridgeTap = tap;
}

// Send one op batch across the boundary, bypassing the `pending` buffer. The
// SOLE `op_flush` call site — every batch passes the tap here. `devtools` marks
// batches from the devtools panel's own React container (and its edit ops), so
// the recorder can exclude them and the op mirror can attribute node ownership.
//
// deno_core deserializes the arg (serde_v8: v8 -> Vec<Op>) synchronously as part
// of this call; a malformed op throws a TypeError HERE and the whole batch is
// lost (Bevy never sees it) — callers sending hand-built ops (devtools edits)
// must flush them in isolation inside try/catch so an invalid value can never
// eat React's own pending ops. The timing stash on `__bevyReactFlush` captures
// serde-decode + the (near-free) channel send for benchmark hosts.
export function flushRaw(batch: Op[], devtools = false): void {
  if (batch.length === 0) return;
  const t0 = nowMs();
  // The flag crosses the bridge with the ops, so Rust can attribute the apply
  // (devtools batch-stats skip the panel's own commits — no self-observation).
  ops.op_flush(batch, devtools);
  (
    globalThis as { __bevyReactFlush?: { ms: number; ops: number } }
  ).__bevyReactFlush = {
    ms: nowMs() - t0,
    ops: batch.length,
  };
  // Drain the decode warnings only when someone is listening — in production
  // the tap is null and the op is never called (and may not even exist).
  if (bridgeTap)
    bridgeTap.flush(batch, devtools, ops.op_take_decode_warnings?.());
}

// Flush the ops accumulated during the current commit. `devtools` is true when
// the committing container is the devtools panel's (see renderer.ts's
// per-container `resetAfterCommit`).
export function flush(devtools = false): void {
  if (pending.length === 0) return;
  flushRaw(pending.splice(0, pending.length), devtools);
}

// --- `<canvas>` imperative drawing + resize plumbing ---

// Send one draw batch for a canvas node, immediately. Rides the same op
// channel as tree ops, so ordering against creates/updates is preserved.
function sendDraw(id: number, cmds: DrawCmd[]): void {
  push({ op: "draw", id, cmds });
  flush();
}

// Build the public instance for a `<canvas>` (what a React ref resolves to).
// Called by the renderer's `createInstance`.
export function createCanvasElement(id: number): BevyCanvasElement {
  return new BevyCanvasElement(id, {
    send: (cmds) => sendDraw(id, cmds),
    size: () => canvasSizes.get(id),
  });
}

// Track (or drop) a node's declarative `draw` prop for resize replay. Called
// beside `registerHandlers` on every serialization, so a Fast-Refreshed
// painter replaces its stale predecessor.
function registerCanvasPainter(
  id: number,
  props: Record<string, unknown>,
): void {
  const d = props.draw;
  if (typeof d === "function") canvasPainters.set(id, d as CanvasPainter);
  else if (Array.isArray(d)) canvasPainters.set(id, d as DrawCmd[]);
  else canvasPainters.delete(id);
}

// A canvas laid out at a new size: the Rust side just cleared its surface.
// Record the size (for the handle's `width`/`height` and the user's onResize),
// and replay the declarative painter if there is one. The leading `clear`
// keeps the replay a replace even if it interleaves with imperative draws
// (right after the Rust-side clear it's a cheap no-op).
function handleCanvasResize(event: UiEvent): void {
  canvasSizes.set(event.id, {
    width: event.width ?? 0,
    height: event.height ?? 0,
  });
  const painter = canvasPainters.get(event.id);
  if (!painter) return;
  const cmds = typeof painter === "function" ? recordDrawing(painter) : painter;
  sendDraw(event.id, [{ cmd: "clear" }, ...cmds]);
}

// Send a named app message to the Bevy side. Surfaced there as a
// `ReactMessage` you read with `MessageReader<ReactMessage>`.
//
// This is the untyped, low-level form. Prefer the typed `emit`/`bevy` generated from
// your Rust `#[react_message]` structs by `App::export_react_typescript` — it checks
// the name and payload against the same structs Bevy deserializes into, and calls this.
export function emit(name: string, value: unknown): void {
  ops.op_emit(name, value);
  if (bridgeTap) bridgeTap.emit(name, value);
}

// --- React -> Bevy requests (awaitable) ---

// Pending request promises, keyed by correlation id. The id stays a JS number here
// (and as a Map key); it crosses the op boundary as a BigInt and comes back as a
// number in the response. Safe while ids stay under 2^53.
let nextRequestId = 1;
const pendingRequests = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (error: unknown) => void }
>();

// Send a correlated request and await its reply. A Bevy `#[react_request]` handler
// answers it; the response resolves (or rejects) this promise. Untyped low-level
// form — prefer the generated `bevy.*` proxy / typed `request`.
export function request(name: string, value: unknown): Promise<unknown> {
  const id = nextRequestId++;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    ops.op_request(BigInt(id), name, value);
    if (bridgeTap) bridgeTap.request(id, name, value);
  });
}

// --- Bevy -> React named events ---

const listeners = new Map<string, Set<(value: unknown) => void>>();

// Subscribe to a named Bevy event (Bevy sends it via the `ReactEvents` param).
// Returns an unsubscribe function, like the generated `bevy.on`.
// Untyped low-level form — prefer the generated `bevy.on`.
export function addEventListener(
  name: string,
  cb: (value: unknown) => void,
): () => void {
  let set = listeners.get(name);
  if (!set) listeners.set(name, (set = new Set()));
  set.add(cb);
  return () => removeEventListener(name, cb);
}

export function removeEventListener(
  name: string,
  cb: (value: unknown) => void,
): void {
  listeners.get(name)?.delete(cb);
}

// Global keyboard events (`keyDown` / `keyUp`) are built in to the core plugin
// and surface through the generated typed `bevy.on("keyDown", …)` — there are no
// separate package helpers; they route through `addEventListener` like any event.

// Split React props into a serializable payload + registered event handlers.
// `children` and functions never go across the boundary.
// React prop name -> the event kind stored in the handler map / reported by Bevy.
const HANDLER_KINDS = {
  onClick: "click",
  onPointerDown: "pointerDown",
  onPointerMove: "pointerMove",
  onPointerUp: "pointerUp",
  onPointerEnter: "pointerEnter",
  onPointerLeave: "pointerLeave",
  onChange: "change",
  onSelect: "select",
  onFocus: "focus",
  onBlur: "blur",
  onScroll: "scroll",
  onWheel: "wheel",
  onResize: "resize",
} as const satisfies Record<string, string>;

// The handler prop names as a type, so `SerializedProps` derives its `onX`
// boolean flags from this map instead of hand-listing them.
type HandlerPropKey = keyof typeof HANDLER_KINDS;

// The handler prop names, for the renderer's dirty-check: these props are
// compared by presence, not identity (closures change every render).
export const HANDLER_PROP_KEYS: ReadonlySet<string> = new Set(
  Object.keys(HANDLER_KINDS),
);

// (Re)populate the id -> handlers map from `props`, or clear it when there are no
// handlers. Handler functions stay in JS (only a boolean crosses); their closures
// change identity every render, so `commitUpdate` calls this even on a no-op update
// to refresh them without emitting a Bevy op.
export function registerHandlers(
  id: number,
  props: Record<string, unknown>,
): void {
  let hs: Record<string, (...args: unknown[]) => void> | undefined;
  for (const [key, kind] of Object.entries(HANDLER_KINDS)) {
    const value = props[key];
    if (typeof value === "function") {
      (hs ??= {})[kind] = value as (...args: unknown[]) => void;
    }
  }
  if (hs) handlers.set(id, hs);
  else handlers.delete(id);
}

// Object-valued props that ride across whole and are replaced atomically by a
// delta update (unlike `style`, which diffs field-by-field):
// - `style`/`hoverStyle`/`pressStyle`/`focusStyle` are fully opaque: every
//   CSS-like key (incl. backgroundColor, border, grid, transition timings, …)
//   rides inside the object and is decoded — units and all — on the Rust side.
//   Bevy overlays the hover/press/focus variants onto the base style from the
//   node's interaction state; `focusStyle` applies while an `editableText` is
//   focused, no React focus state needed.
// - An `<anchor>`'s `anchor` (entity + optional offset) is opaque too;
//   Bevy projects the entity's world position to the screen each frame.
// - An SVG shape child's `shape` (its folded attributes — `packShapeProps`)
//   replaces atomically as well: a shape change has a single rasterization
//   consequence, so Rust never merges shape fields.
// Animated bindings ride *inside* `style` (the `{ animated }` wrapper) and
// cross opaque like every other style value — Rust derives the node's
// bindings from the merged style, so there is no separate animation prop.
const OBJECT_PROP_KEYS = new Set([
  "style",
  "hoverStyle",
  "pressStyle",
  "focusStyle",
  "anchor",
  "shape",
]);

// Text + `image` + `editableText` + `svg` element attributes that pass through
// by name (the wire name for each is the React prop name, `viewBox` included).
// `name` is the universal identity prop (→ a Bevy `Name` on the entity);
// `target` binds a `<portal>`/`<surface>` to a named render target.
const PASSTHROUGH_PROP_KEYS = new Set([
  "name",
  "sharedTag",
  "color",
  "fontSize",
  "src",
  "tint",
  "flipX",
  "flipY",
  "imageMode",
  "sourceRect",
  "atlas",
  "visualBox",
  "target",
  "value",
  "maxLength",
  "multiline",
  "autofocus",
  "selectionStart",
  "selectionEnd",
  "ariaLabel",
  "scrollTop",
  "scrollLeft",
  "scrollStep",
  "viewBox",
]);

// Bool flag props. Rust's `Props::merge_delta` (protocol.rs `merge_bool!`)
// only honors `true` in a delta — the wire can't tell an explicit `false` from
// an absent field — so turning a flag off must ride `unset` (each has a reset
// arm in the `unset` loop). Keep in sync with protocol.rs's plain-`bool`
// passthrough fields.
const BOOL_PROP_KEYS = new Set(["flipX", "flipY", "multiline", "autofocus"]);

// "Act now" props: present = do something once (push a controlled value, draw a
// display list), absent = no action. Removing one from the props is a no-op —
// there is no retained state to reset — so a delta never lists them in `unset`
// (Rust would only warn).
const EVENT_PROP_KEYS = new Set([
  "value",
  "selectionStart",
  "selectionEnd",
  "scrollTop",
  "scrollLeft",
  "draw",
]);

// Serialize one React prop into `out` under its wire name. Returns whether the
// prop is wire-visible (a handler closure becomes a boolean; `children` and
// unrecognized keys never cross).
function serializePropInto(
  out: SerializedProps,
  key: string,
  value: unknown,
): boolean {
  if (key === "children") return false;
  const rec = out as Record<string, unknown>;
  // Event handlers: only a boolean crosses; the actual closures live in the
  // handler map (see `registerHandlers`).
  if (HANDLER_PROP_KEYS.has(key)) {
    if (typeof value !== "function") return false;
    rec[key] = true;
    return true;
  }
  if (OBJECT_PROP_KEYS.has(key)) {
    if (!value || typeof value !== "object") return false;
    rec[key] = value;
    return true;
  }
  // A `canvas`'s `draw`: a painter callback (recorded against a fresh context)
  // or an already-built `DrawCmd[]` display list. Either way it crosses as data.
  if (key === "draw") {
    out.draw =
      typeof value === "function"
        ? recordDrawing(value as CanvasPainter)
        : (value as DrawCmd[]);
    return true;
  }
  if (PASSTHROUGH_PROP_KEYS.has(key)) {
    rec[key] = value;
    return true;
  }
  return false;
}

// Package an `<anchor>` element's flat `entity`/`offset`/`scale` props into the
// single opaque `anchor` object the wire carries (the renderer calls this for
// both the create and update prop bags, so delta diffs compare packed forms).
// The entity crosses as a plain number: `op_flush`'s serde_v8 can't decode a
// struct `u64` field from either a JS number (f64) or a BigInt, so the Rust
// `Anchor.entity` is an `f64` — lossless for realistic `Entity::to_bits()`
// values (well under 2^53) — and cast back to the entity id on apply.
export function packAnchorProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const { entity, offset, scale, ...rest } = props;
  if (entity === undefined || entity === null) return rest;
  return { ...rest, anchor: { entity: Number(entity), offset, scale } };
}

// The `shape`-object analogue for SVG shape children lives in `svg.ts` (the
// JS mirror of the Rust `svg` module); re-exported here beside its anchor
// precedent so the reconciler imports both packers from one place.
export { packShapeProps, SHAPE_KINDS } from "./svg";

export function serializeProps(
  id: number,
  props: Record<string, unknown>,
): SerializedProps {
  const out: SerializedProps = {};
  for (const [key, value] of Object.entries(props)) {
    serializePropInto(out, key, value);
  }
  registerHandlers(id, props);
  registerCanvasPainter(id, props);
  return out;
}

// Structural equality with a depth cap. Style values are small plain-JSON
// trees (rects, transforms, shadow lists, gradient stops, `{ animated }`
// binding wrappers); comparing them structurally means an inline object
// literal that didn't actually change doesn't count as a change. The cap of 8
// gives headroom over the deepest style value — a filter chain
// `[{name, params: {tint: {animated: {output: [[r,g,b,a], …]}}}}]` has seven
// container levels (leaves compare via `Object.is` before the depth guard, so
// depth counts containers, not values; a reference-stable `SharedValue`
// short-circuits at its leaf). Past the cap (or for functions/class
// instances) it conservatively reports "unequal", which merely re-sends that
// one field.
export function valuesEqual(a: unknown, b: unknown, depth = 8): boolean {
  if (Object.is(a, b)) return true;
  if (depth <= 0) return false;
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }
  const aArr = Array.isArray(a);
  if (aArr !== Array.isArray(b)) return false;
  if (aArr) {
    const av = a as unknown[];
    const bv = b as unknown[];
    if (av.length !== bv.length) return false;
    for (let i = 0; i < av.length; i++) {
      if (!valuesEqual(av[i], bv[i], depth - 1)) return false;
    }
    return true;
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  for (const k in ao) {
    if (!valuesEqual(ao[k], bo[k], depth - 1)) return false;
  }
  for (const k in bo) {
    if (!(k in ao) && bo[k] !== undefined) return false;
  }
  return true;
}

// Field-level diff of two style objects. Returns the changed fields (`delta`)
// and the removed field names (`unset`), or `null` when nothing changed — so a
// style object recreated inline with identical values produces no op at all.
function diffStyle(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): { delta: Record<string, unknown> | null; unset: string[] | null } | null {
  let delta: Record<string, unknown> | null = null;
  let unset: string[] | null = null;
  for (const k in a) {
    const av = a[k];
    const bv = b[k];
    if (bv === undefined) {
      if (av !== undefined) (unset ??= []).push(k);
    } else if (!valuesEqual(av, bv)) {
      (delta ??= {})[k] = bv;
    }
  }
  for (const k in b) {
    if (k in a) continue;
    const bv = b[k];
    if (bv !== undefined) (delta ??= {})[k] = bv;
  }
  if (!delta && !unset) return null;
  return { delta, unset };
}

// Diff two prop bags into a delta `update` op, or `null` when no Bevy-visible
// prop changed. The JS-side handler closures are (re)registered either way —
// they change identity every render but that needs no backend op.
//
// Semantics (mirrored by `Props::merge_delta` on the Rust side): a field in
// `props` is set, a name in `unset` is reset to its default, anything in
// neither is unchanged. `style` diffs field-by-field (`styleUnset` names the
// removed style fields); the other object props replace atomically. Event-like
// props (`EVENT_PROP_KEYS`) only ever appear when changed — never in `unset`.
// Handlers compare by *presence*; everything else structurally (`valuesEqual`),
// so hoisted style objects skip on reference equality and inline-but-identical
// objects skip on structure.
export function buildUpdateOp(
  id: number,
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>,
): Op | null {
  // Accumulated behind one object so the `diffKey` closure's writes stay
  // visible to TypeScript's flow analysis at the read sites below.
  const acc: {
    props: SerializedProps | null;
    unset: string[] | null;
    styleUnset: string[] | null;
  } = { props: null, unset: null, styleUnset: null };

  const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

  const diffKey = (key: string, a: unknown, b: unknown) => {
    if (HANDLER_PROP_KEYS.has(key)) {
      const had = typeof a === "function";
      const has = typeof b === "function";
      if (had === has) return;
      if (has) serializePropInto((acc.props ??= {}), key, b);
      else (acc.unset ??= []).push(key);
      return;
    }
    if (Object.is(a, b)) return;
    if (key === "style") {
      const av = isObj(a) ? a : undefined;
      const bv = isObj(b) ? b : undefined;
      if (av && bv) {
        const d = diffStyle(av, bv);
        if (!d) return;
        if (d.delta) (acc.props ??= {}).style = d.delta;
        if (d.unset) acc.styleUnset = d.unset;
      } else if (bv) {
        (acc.props ??= {}).style = bv;
      } else if (av) {
        (acc.unset ??= []).push("style");
      }
      return;
    }
    if (OBJECT_PROP_KEYS.has(key)) {
      // Atomic object props: structurally equal → unchanged; present → replace
      // whole; gone → unset.
      if (isObj(b)) {
        if (isObj(a) && valuesEqual(a, b)) return;
        serializePropInto((acc.props ??= {}), key, b);
      } else if (isObj(a)) {
        (acc.unset ??= []).push(key);
      }
      return;
    }
    if (BOOL_PROP_KEYS.has(key) && b === false) {
      // A `false` in the delta would be a silent no-op on the Rust side
      // (`merge_bool!` only acts on `true`); turning a flag off rides `unset`.
      if (a === true) (acc.unset ??= []).push(key);
      return;
    }
    if (b === undefined) {
      // Dropping an event-like prop is a no-op (nothing retained to reset).
      if (EVENT_PROP_KEYS.has(key)) return;
      if (serializePropInto({}, key, a)) {
        (acc.unset ??= []).push(key);
      }
      return;
    }
    serializePropInto((acc.props ??= {}), key, b);
  };

  for (const key in oldProps) {
    if (key === "children") continue;
    diffKey(key, oldProps[key], newProps[key]);
  }
  for (const key in newProps) {
    if (key === "children" || key in oldProps) continue;
    diffKey(key, undefined, newProps[key]);
  }

  // The controlled selection is applied as a (start, end) pair on the Bevy
  // side; when either half changed, carry both current values so the delta
  // never delivers half a selection.
  const props = acc.props;
  if (
    props &&
    (props.selectionStart !== undefined) !== (props.selectionEnd !== undefined)
  ) {
    if (typeof newProps.selectionStart === "number")
      props.selectionStart = newProps.selectionStart;
    if (typeof newProps.selectionEnd === "number")
      props.selectionEnd = newProps.selectionEnd;
  }

  // Refresh the JS-side closures even for a no-op update (their identity
  // changes every render; no backend op needed for that).
  registerHandlers(id, newProps);
  registerCanvasPainter(id, newProps);

  if (!props && !acc.unset && !acc.styleUnset) return null;
  const op: Op = { op: "update", id, props: props ?? {} };
  if (acc.unset) op.unset = acc.unset;
  if (acc.styleUnset) op.styleUnset = acc.styleUnset;
  return op;
}

export function dropHandlers(id: number): void {
  handlers.delete(id);
  canvasPainters.delete(id);
  canvasSizes.delete(id);
}

// Pull messages from Bevy forever and route each by kind: UI events to their React
// handler, named events to listeners, request responses to the pending promise.
// Returns when Bevy drops the sender (op_next_event resolves null) on shutdown, or
// when the runtime is being rebuilt (a reload).
//
// `wrap` runs each callback inside the reconciler's flushSync so any resulting
// re-render commits (and flushes its ops) synchronously before we await again.
export async function runEventLoop(
  wrap: (fn: () => void) => void = (fn) => fn(),
): Promise<void> {
  // Bracket each wrapped handler for the devtools "JS" timing leg (handler +
  // synchronous React render/commit; any flush inside is subtracted by the
  // recorder). No-op without a tap installed.
  const timedWrap = (fn: () => void): void => {
    if (!bridgeTap) {
      wrap(fn);
      return;
    }
    const t0 = nowMs();
    bridgeTap.wrapStart();
    try {
      wrap(fn);
    } finally {
      bridgeTap.wrapEnd(nowMs() - t0);
    }
  };
  for (;;) {
    const msg = await ops.op_next_event();
    if (msg == null) break; // shutdown
    // The single Bevy→JS drain: every outbound message passes the tap here,
    // before routing (so the devtools log sees events even with no listener).
    if (bridgeTap) bridgeTap.outbound(msg);
    switch (msg.t) {
      case "reload":
        return; // runtime is being rebuilt
      case "uiEvent": {
        // A canvas resize needs the runtime first (size cache + declarative
        // replay — the surface was cleared), whether or not a user handler
        // is registered.
        if (msg.event.kind === "resize") handleCanvasResize(msg.event);
        const fn = handlers.get(msg.event.id)?.[msg.event.kind];
        if (fn) {
          const event = msg.event;
          timedWrap(() => {
            try {
              // Click handlers ignore the arg; pointer handlers read x/y; an
              // `editableText`'s onChange receives the new text directly.
              fn(event.kind === "change" ? event.value : event);
            } catch (e) {
              console.error("[js] handler error:", e);
            }
          });
        }
        break;
      }
      case "event": {
        const set = listeners.get(msg.name);
        if (set && set.size > 0) {
          const value = msg.value;
          timedWrap(() => {
            for (const cb of set) {
              try {
                cb(value);
              } catch (e) {
                console.error("[js] listener error:", e);
              }
            }
          });
        }
        break;
      }
      case "response": {
        const p = pendingRequests.get(msg.id);
        if (!p) break; // stale/duplicate — safe no-op
        pendingRequests.delete(msg.id);
        if (msg.result.status === "ok") p.resolve(msg.result.value);
        else p.reject(new Error(msg.result.message));
        break;
      }
      case "animationFinished": {
        const cb = animationCallbacks.get(msg.token);
        if (!cb) break; // cleared by reset — safe no-op
        animationCallbacks.delete(msg.token);
        // Inside `wrap` (flushSync): completion callbacks typically setState to
        // chain the next phase, and the resulting ops should flush this pass.
        timedWrap(() => {
          try {
            cb(msg.finished);
          } catch (e) {
            console.error("[js] animation callback error:", e);
          }
        });
        break;
      }
    }
  }
}
