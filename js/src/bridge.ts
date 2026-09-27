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
  /** The op batch, `JSON.stringify`ed (see `flushRaw`). */
  op_flush(json: string, devtools: boolean): void;
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
  // An element's own event (`onChange`, a canvas `resize`, …): routed to the
  // node's `on<Event>` handler with `payload` as its argument (none when
  // `null`).
  | { t: "elementEvent"; id: number; event: string; payload: unknown }
  | { t: "event"; name: string; value: unknown }
  | { t: "response"; id: number; result: ResponseResult }
  | { t: "animationFinished"; id: number; token: number; finished: boolean }
  | { t: "reload" };

// Mirrors `protocol::ResponseResult` (internally tagged with `status`).
type ResponseResult =
  | { status: "ok"; value: unknown }
  | { status: "err"; message: string };

export const ROOT_ID = 0;

// Mirrors `protocol::Op` on the Rust side (tag = "op"). `create` and `update`
// carry the node's element `kind` BEFORE `props`: Rust decodes the props
// against that element's registered attributes as the key streams by.
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
      kind: string;
      // A delta against the node's last applied props: `props` carries only
      // the changed fields (`props.style` only the changed style fields);
      // `unset`/`styleUnset` name prop / style wire fields reset to their
      // defaults; anything in neither is left unchanged on the Bevy side.
      // An update carrying only act-now attributes (a canvas `drawAppend`) is
      // an imperative command.
      props: SerializedProps;
      unset?: string[];
      styleUnset?: string[];
    }
  | { op: "updateText"; id: number; text: string };

/** A node's wire props: every JSX prop except `children`/`key`/`ref`, with
 *  handler closures replaced by `true` and bigints by numbers. Opaque here —
 *  Rust decodes each key against the node's element (the common props, then
 *  its registered attributes and events; anything else warns
 *  `unknownProp`). */
export type SerializedProps = Record<string, unknown>;

/** A common UI event (click, pointer*, scroll, wheel). An element's own events
 *  arrive as `elementEvent`s with their own payloads. */
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
  // DOM click) and hover/scroll events.
  button?: number;
  // New scroll offset (logical px). Present only for the "scroll" event.
  scrollTop?: number;
  scrollLeft?: number;
  // Raw wheel delta. Present only for the "wheel" event; interpret with
  // `deltaMode` ("line" = mouse notches, "pixel" = trackpad), like DOM WheelEvent.
  deltaX?: number;
  deltaY?: number;
  deltaMode?: string;
}

/** A `<canvas>`'s `resize` payload: its new laid-out size (logical px). */
interface CanvasSize {
  width: number;
  height: number;
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
// Read by the element handle's `width`/`height`. Keyed exactly by the live
// canvas nodes (an entry is created with the handle), so an element event
// named `resize` on any other kind never reaches the canvas runtime.
const canvasSizes = new Map<number, CanvasSize>();

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
// The batch crosses as ONE JSON string: the engine's native `JSON.stringify`
// plus a single linear `serde_json` parse on the Rust side is a fraction of the
// cost of a host-side object walk (serde_v8 / serde_wasm_bindgen pay per-property
// API traffic for every key of every op). `JSON.stringify` drops `undefined`
// props and `null`s NaN/Infinity, exactly like the object walk treated them;
// nothing in an `Op` is a BigInt (a bigint prop crosses as a number — see
// `serializePropInto`). Rust decodes synchronously as part of this call; a
// structurally malformed op throws a TypeError HERE and the whole batch is lost
// (Bevy never sees it) — callers sending hand-built ops (devtools edits) must
// flush them in isolation inside try/catch so an invalid value can never eat
// React's own pending ops. The timing stash on `__bevyReactFlush` captures
// stringify + decode + the (near-free) channel send for benchmark hosts.
export function flushRaw(batch: Op[], devtools = false): void {
  if (batch.length === 0) return;
  const t0 = nowMs();
  // The flag crosses the bridge with the ops, so Rust can attribute the apply
  // (devtools batch-stats skip the panel's own commits — no self-observation).
  ops.op_flush(JSON.stringify(batch), devtools);
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

// Send one draw batch for a canvas node, immediately: an update op carrying
// only the act-now `drawAppend` attribute (an imperative command — nothing is
// retained). Rides the same op channel as tree ops, so ordering against
// creates/updates is preserved.
function sendDraw(id: number, cmds: DrawCmd[]): void {
  push({ op: "update", id, kind: "canvas", props: { drawAppend: cmds } });
  flush();
}

// Build the public instance for a `<canvas>` (what a React ref resolves to).
// Called by the renderer's `createInstance`.
export function createCanvasElement(id: number): BevyCanvasElement {
  canvasSizes.set(id, { width: 0, height: 0 });
  return new BevyCanvasElement(id, {
    send: (cmds) => sendDraw(id, cmds),
    size: () => canvasSizes.get(id),
  });
}

// Track (or drop) a `<canvas>` node's declarative `draw` prop for resize
// replay. Called on every serialization of a canvas (the callers gate on the
// element type), so a Fast-Refreshed painter replaces its stale predecessor.
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
function handleCanvasResize(id: number, size: CanvasSize): void {
  canvasSizes.set(id, { width: size.width ?? 0, height: size.height ?? 0 });
  const painter = canvasPainters.get(id);
  if (!painter) return;
  const cmds = typeof painter === "function" ? recordDrawing(painter) : painter;
  sendDraw(id, [{ cmd: "clear" }, ...cmds]);
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
// The rule is generic — no per-element or per-key table: every prop except
// `children`/`key`/`ref` crosses, and Rust decodes each against the node's
// element (unknown keys warn there).

// `onXxx` → the event name `xxx` it is registered (and reported) under,
// memoized per key (handler keys are few and repeat on every node).
const handlerEvents = new Map<string, string | null>();

/** The event a handler prop listens for (`onClick` → `click`, `onChange` →
 *  `change`), or `null` for a key outside the handler space (`on` + an
 *  uppercase letter — Rust reserves it, no attribute may take it). */
export function handlerEvent(key: string): string | null {
  let event = handlerEvents.get(key);
  if (event === undefined) {
    const c = key.charCodeAt(2);
    event =
      key.length > 2 && key[0] === "o" && key[1] === "n" && c >= 65 && c <= 90
        ? key[2].toLowerCase() + key.slice(3)
        : null;
    handlerEvents.set(key, event);
  }
  return event;
}

type HandlerFn = (...args: unknown[]) => void;

// Populate the id -> handlers map from a freshly created node's `props`, or
// leave it absent when there are none. Handler functions stay in JS (only a
// boolean crosses); their closures change identity every render, so the
// update path (`buildUpdateOp`) refreshes the record in place without
// emitting a Bevy op.
export function registerHandlers(
  id: number,
  props: Record<string, unknown>,
): void {
  let hs: Record<string, HandlerFn> | undefined;
  for (const key in props) {
    const value = props[key];
    if (typeof value !== "function") continue;
    const event = handlerEvent(key);
    if (event !== null) (hs ??= {})[event] = value as HandlerFn;
  }
  if (hs) handlers.set(id, hs);
  else handlers.delete(id);
}

// Serialize one React prop into `out` under its wire name. Returns whether the
// prop is wire-visible: a handler closure becomes `true`; a `<canvas>`'s
// `draw` painter is recorded into its display list (the one kind-aware value —
// `canvas.ts` is the documented exception to the generic wire); a bigint
// crosses as a number (the wire is JSON, which has none — lossless below
// 2^53, e.g. an `<anchor entity>`'s `Entity::to_bits()`); any other function,
// `undefined`, and `children` never cross.
function serializePropInto(
  out: SerializedProps,
  key: string,
  value: unknown,
): boolean {
  if (key === "children" || value === undefined) return false;
  if (typeof value === "function") {
    if (handlerEvent(key) !== null) {
      out[key] = true;
      return true;
    }
    if (key === "draw") {
      out.draw = recordDrawing(value as CanvasPainter);
      return true;
    }
    return false;
  }
  out[key] = typeof value === "bigint" ? Number(value) : value;
  return true;
}

// Serialize a freshly created node's prop bag for its `create` op, and
// register its handlers (+ a `<canvas>`'s declarative painter). `type` is the
// element type (`createInstance`'s, not the wire kind).
export function serializeProps(
  id: number,
  props: Record<string, unknown>,
  type?: string,
): SerializedProps {
  // (`key`/`ref` never reach host props — React strips them.)
  const out: SerializedProps = {};
  for (const key in props) serializePropInto(out, key, props[key]);
  registerHandlers(id, props);
  if (type === "canvas") registerCanvasPainter(id, props);
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

// The diff accumulator `diffKey` writes into (see `buildUpdateOp`). `handlers`
// caches the node's handler record lookup across the keys of one diff.
interface UpdateAcc {
  id: number;
  props: SerializedProps | null;
  unset: string[] | null;
  styleUnset: string[] | null;
  handlers: Record<string, HandlerFn> | undefined;
  handlersLost: boolean;
}

const UPDATE_ACC: UpdateAcc = {
  id: 0,
  props: null,
  unset: null,
  styleUnset: null,
  handlers: undefined,
  handlersLost: false,
};

// Reset the scratch accumulator for one diff. A function (not inline
// assignments) so TypeScript doesn't narrow `acc.props` to `null` at the read
// sites after the `diffKey` calls.
function resetAcc(id: number): UpdateAcc {
  const acc = UPDATE_ACC;
  acc.id = id;
  acc.props = null;
  acc.unset = null;
  acc.styleUnset = null;
  acc.handlers = undefined;
  acc.handlersLost = false;
  return acc;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isEmpty(o: Record<string, unknown>): boolean {
  for (const _ in o) return false;
  return true;
}

// Diff one prop between the old and new bag into `acc`. A handler key also
// maintains the node's handler record in place: its closure changes identity
// every render, so the newest one replaces its predecessor whether or not the
// presence flag (the only thing that crosses) changed.
function diffKey(acc: UpdateAcc, key: string, a: unknown, b: unknown): void {
  const event = handlerEvent(key);
  if (event !== null && (typeof a === "function" || typeof b === "function")) {
    const had = typeof a === "function";
    const has = typeof b === "function";
    let hs = acc.handlers ?? (acc.handlers = handlers.get(acc.id));
    if (has) {
      if (!hs) handlers.set(acc.id, (hs = acc.handlers = {}));
      hs[event] = b as HandlerFn;
    } else if (hs) {
      delete hs[event];
      acc.handlersLost = true;
    }
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
  if (b === undefined) {
    // Gone → reset to its default. (Rust ignores the unset of an act-now
    // prop — there is no retained state to reset.)
    if (serializePropInto({}, key, a)) (acc.unset ??= []).push(key);
    return;
  }
  // Everything else compares structurally (an inline object literal that
  // didn't change is not a change) and is sent whole — a `false` included
  // (Rust decodes an explicit `false` as a set).
  if (valuesEqual(a, b)) return;
  serializePropInto((acc.props ??= {}), key, b);
}

// Diff two prop bags into a delta `update` op, or `null` when no Bevy-visible
// prop changed. The JS-side handler closures are refreshed either way (in
// place, only for the handler keys present) — they change identity every
// render but that needs no backend op.
//
// Semantics (mirrored by `Props::merge_delta` on the Rust side): a field in
// `props` is set, a name in `unset` is reset to its default, anything in
// neither is unchanged. `style` diffs field-by-field (`styleUnset` names the
// removed style fields); every other prop replaces whole. Handlers compare by
// *presence*; everything else structurally (`valuesEqual`), so hoisted
// objects skip on reference equality and inline-but-identical ones skip on
// structure.
//
// `type` is the element type (it gates the `<canvas>` painter bookkeeping);
// `kind` the wire kind the op names (a nested `<text>` is `textSpan`).
export function buildUpdateOp(
  id: number,
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>,
  type = "node",
  kind: string = type,
): Op | null {
  // One scratch accumulator for the whole module: `buildUpdateOp` is
  // synchronous and never re-entered (a `draw` painter recorded on the way
  // can't reach the reconciler), so it is reset on entry rather than
  // allocated per node.
  const acc = resetAcc(id);

  for (const key in oldProps) {
    if (key === "children") continue;
    diffKey(acc, key, oldProps[key], newProps[key]);
  }
  for (const key in newProps) {
    if (key === "children" || key in oldProps) continue;
    diffKey(acc, key, undefined, newProps[key]);
  }
  // A record whose last closure just went away is dropped, so the map only
  // ever holds nodes with at least one handler (as `registerHandlers` does).
  if (acc.handlersLost && acc.handlers && isEmpty(acc.handlers)) {
    handlers.delete(id);
  }

  if (type === "canvas") registerCanvasPainter(id, newProps);

  const props = acc.props;
  if (!props && !acc.unset && !acc.styleUnset) return null;
  const op: Op = { op: "update", id, kind, props: props ?? {} };
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
        const fn = handlers.get(msg.event.id)?.[msg.event.kind];
        if (fn) {
          const event = msg.event;
          timedWrap(() => {
            try {
              // Click handlers ignore the arg; pointer handlers read x/y.
              fn(event);
            } catch (e) {
              console.error("[js] handler error:", e);
            }
          });
        }
        break;
      }
      case "elementEvent": {
        // A canvas resize needs the runtime first (size cache + declarative
        // replay — the surface was cleared), whether or not a user handler
        // is registered (Rust sends it unconditionally).
        if (msg.event === "resize" && canvasSizes.has(msg.id)) {
          handleCanvasResize(msg.id, msg.payload as CanvasSize);
        }
        const fn = handlers.get(msg.id)?.[msg.event];
        if (fn) {
          const payload = msg.payload;
          timedWrap(() => {
            try {
              // The handler receives the payload (none for a `null` one).
              if (payload === null || payload === undefined) fn();
              else fn(payload);
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
