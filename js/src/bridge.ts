// The JS half of the Rust<->JS boundary: an op buffer flushed per commit, a
// registry of event handlers (which never cross into Rust), and the event loop
// that pulls UI events back from Bevy.

import { recordDrawing } from "./canvas";
import type { CanvasPainter, DrawCmd } from "./canvas";

// The whole Rust<->JS op surface. The same bundle runs under two hosts:
//   - Native: an embedded V8 isolate (deno_core) exposes these under `Deno.core.ops`.
//   - Web: the Bevy wasm module installs the identical methods on
//     `globalThis.__bevyHost` (backed by `#[wasm_bindgen]` exports) before this
//     bundle runs.
// Same names and signatures both ways, so everything below is host-agnostic.
interface BevyHost {
  op_flush(ops: Op[]): void;
  op_emit(name: string, value: unknown): void;
  op_request(id: bigint, name: string, value: unknown): void;
  op_animate(cmd: AnimationCommand): void;
  op_next_event(): Promise<Outbound | null>;
}

// Resolved at module load. On native `Deno.core.ops` is read; on web the injected
// host short-circuits the `??`, so `Deno` (undefined in a browser) is never touched.
declare const Deno: { core: { ops: BevyHost } };
const ops: BevyHost =
  (globalThis as { __bevyHost?: BevyHost }).__bevyHost ?? Deno.core.ops;

// Mirrors `bevy_react_animations::protocol::AnimationCommand` (tag = "kind").
export type AnimationCommand =
  | { kind: "declare"; id: number; initial: number }
  | { kind: "set"; id: number; value: number }
  | { kind: "animate"; id: number; driver: unknown }
  | { kind: "cancel"; id: number }
  | { kind: "clear" };

// Mirrors `protocol::Outbound` on the Rust side (internally tagged with `t`).
type Outbound =
  | { t: "uiEvent"; event: UiEvent }
  | { t: "event"; name: string; value: unknown }
  | { t: "response"; id: number; result: ResponseResult }
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
  | { op: "updateText"; id: number; text: string };

export interface SerializedProps {
  style?: Record<string, unknown>;
  hoverStyle?: Record<string, unknown>;
  pressStyle?: Record<string, unknown>;
  focusStyle?: Record<string, unknown>;
  // Animation bindings (an `Animated.node`'s `animatedStyle`), opaque like style;
  // decoded on the Rust side into `AnimatedBindings`.
  animated?: Record<string, unknown>;
  // World-anchor binding (an `Anchored.node`'s entity + offset), opaque like style;
  // decoded on the Rust side into `Anchor`.
  anchor?: Record<string, unknown>;
  color?: string;
  fontSize?: number;
  onClick?: boolean;
  onPointerDown?: boolean;
  onPointerMove?: boolean;
  onPointerUp?: boolean;
  onPointerEnter?: boolean;
  onPointerLeave?: boolean;
  // Controlled scroll offsets (logical px) for any node with `overflow: scroll`.
  scrollTop?: number;
  scrollLeft?: number;
  scrollStep?: number;
  onScroll?: boolean;
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
  // `canvas` element: the recorded vector display list, rasterized on the Bevy side.
  draw?: DrawCmd[];
  // `portal` element: the render-target name to display. Also carries a
  // `surface` element's `name` (the offscreen surface its subtree renders into).
  target?: string;
  // `editableText` element attributes
  value?: string;
  maxLength?: number;
  multiline?: boolean;
  onChange?: boolean;
  autofocus?: boolean;
  // Controlled selection as UTF-8 byte offsets into `value`.
  selectionStart?: number;
  selectionEnd?: number;
  ariaLabel?: string;
  onSelect?: boolean;
  onFocus?: boolean;
  onBlur?: boolean;
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
}

// Ops accumulated during the current commit, flushed in resetAfterCommit.
const pending: Op[] = [];

// id -> { click: handler, ... }. Handlers stay here; only a boolean crosses.
const handlers = new Map<
  number,
  Record<string, (...args: unknown[]) => void>
>();

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
// stale animated values don't linger.
export function reset(): void {
  pending.push({ op: "reset" });
  ops.op_animate({ kind: "clear" });
}

// Send an animation command to the animations plugin (declare/set/animate/
// cancel/clear). Synchronous and fire-and-forget, like `emit`. Low-level — apps
// use the `useSharedValue` / `with*` helpers from `./animated`.
export function animate(cmd: AnimationCommand): void {
  ops.op_animate(cmd);
}

// Wall clock for instrumentation (the embedded isolate may lack `performance`).
const nowMs: () => number =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? () => performance.now()
    : () => Date.now();

export function flush(): void {
  if (pending.length === 0) return;
  const batch = pending.splice(0, pending.length);
  // Instrumentation: time the native op_flush call. deno_core deserializes the
  // arg (serde_v8: v8 -> Vec<Op>) synchronously as part of this call, so this
  // captures serde-decode + the (near-free) channel send. Stashed on a global so
  // a benchmark host can read the last commit's boundary cost.
  const t0 = nowMs();
  // console.log(JSON.stringify(batch, undefined, 2));
  // console.log(batch.length);
  ops.op_flush(batch);
  (
    globalThis as { __bevyReactFlush?: { ms: number; ops: number } }
  ).__bevyReactFlush = {
    ms: nowMs() - t0,
    ops: batch.length,
  };
}

// Send a named app message to the Bevy side. Surfaced there as a
// `ReactMessage` you read with `MessageReader<ReactMessage>`.
//
// This is the untyped, low-level form. Prefer the typed `emit`/`bevy` generated from
// your Rust `#[react_message]` structs by `App::export_react_typescript` — it checks
// the name and payload against the same structs Bevy deserializes into, and calls this.
export function emit(name: string, value: unknown): void {
  ops.op_emit(name, value);
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
  });
}

// --- Bevy -> React named events ---

const listeners = new Map<string, Set<(value: unknown) => void>>();

// Subscribe to a named Bevy event (Bevy sends it via the `ReactEvents` param).
// Untyped low-level form — prefer the generated `bevy.on`.
export function addEventListener(
  name: string,
  cb: (value: unknown) => void,
): void {
  let set = listeners.get(name);
  if (!set) listeners.set(name, (set = new Set()));
  set.add(cb);
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
const HANDLER_KINDS: Record<string, string> = {
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
};

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
  for (const key in HANDLER_KINDS) {
    const value = props[key];
    if (typeof value === "function") {
      (hs ??= {})[HANDLER_KINDS[key]] = value as (...args: unknown[]) => void;
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
// - An `Anchored.node`'s `anchor` (entity + optional offset) is opaque too;
//   Bevy projects the entity's world position to the screen each frame.
// - `animatedStyle` is converted by `serializeAnimatedStyle` (wire: `animated`).
const OBJECT_PROP_KEYS = new Set([
  "style",
  "hoverStyle",
  "pressStyle",
  "focusStyle",
  "anchor",
  "animatedStyle",
]);

// Text + `image` + `editableText` element attributes that pass through by name.
const PASSTHROUGH_PROP_KEYS = new Set([
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
]);

// Props whose wire name differs from the React prop name. A `<surface>`'s
// `name` rides the same wire field as a `<portal>`'s `target` (both bind the
// element to a named render target); they never coexist.
const WIRE_NAME: Record<string, string> = {
  name: "target",
  animatedStyle: "animated",
};

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
    if (key === "animatedStyle") {
      // An `Animated.node`'s `animatedStyle`: each property is bound to a shared
      // value (or an interpolation). A bare `SharedValue` becomes a `shared`
      // binding; `interpolate`/`interpolateColor` results pass through as-is.
      out.animated = serializeAnimatedStyle(value as Record<string, unknown>);
    } else {
      rec[key] = value;
    }
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
  if (key === "name") {
    out.target = value as string;
    return true;
  }
  return false;
}

export function serializeProps(
  id: number,
  props: Record<string, unknown>,
): SerializedProps {
  const out: SerializedProps = {};
  for (const [key, value] of Object.entries(props)) {
    serializePropInto(out, key, value);
  }
  registerHandlers(id, props);
  return out;
}

// Structural equality with a depth cap. Style values are small plain-JSON
// trees (rects, transforms, shadow lists, gradient stops); comparing them
// structurally means an inline object literal that didn't actually change
// doesn't count as a change. Past the cap (or for functions/class instances)
// it conservatively reports "unequal", which merely re-sends that one field.
export function valuesEqual(a: unknown, b: unknown, depth = 4): boolean {
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
        (acc.unset ??= []).push(WIRE_NAME[key] ?? key);
      }
      return;
    }
    if (b === undefined) {
      // Dropping an event-like prop is a no-op (nothing retained to reset).
      if (EVENT_PROP_KEYS.has(key)) return;
      if (serializePropInto({}, key, a)) {
        (acc.unset ??= []).push(WIRE_NAME[key] ?? key);
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

  if (!props && !acc.unset && !acc.styleUnset) return null;
  const op: Op = { op: "update", id, props: props ?? {} };
  if (acc.unset) op.unset = acc.unset;
  if (acc.styleUnset) op.styleUnset = acc.styleUnset;
  return op;
}

// Convert an `animatedStyle` object into its wire form. Each property value is
// either a `SharedValue` (carries an `id`) → a `shared` binding, or an already-
// built binding descriptor (carries a `type`) → passed through unchanged.
function serializeAnimatedStyle(
  style: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    if (!value || typeof value !== "object") continue;
    if ("type" in value) {
      out[key] = value; // an interpolate / interpolateColor binding
    } else if ("id" in value) {
      out[key] = { type: "shared", id: (value as { id: number }).id };
    }
  }
  return out;
}

export function dropHandlers(id: number): void {
  handlers.delete(id);
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
  for (;;) {
    const msg = await ops.op_next_event();
    if (msg == null) break; // shutdown
    switch (msg.t) {
      case "reload":
        return; // runtime is being rebuilt
      case "uiEvent": {
        const fn = handlers.get(msg.event.id)?.[msg.event.kind];
        if (fn) {
          const event = msg.event;
          wrap(() => {
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
          wrap(() => {
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
    }
  }
}
