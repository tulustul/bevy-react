// The JS half of the Rust<->JS boundary: an op buffer flushed per commit, a
// registry of event handlers (which never cross into Rust), and the event loop
// that pulls UI events back from Bevy.

import { recordDrawing } from "./canvas";
import type { CanvasPainter, DrawCmd } from "./canvas";

// deno_core exposes registered ops under `Deno.core.ops`.
declare const Deno: {
  core: {
    ops: {
      op_flush(ops: Op[]): void;
      op_emit(name: string, value: unknown): void;
      op_request(id: bigint, name: string, value: unknown): void;
      op_animate(cmd: AnimationCommand): void;
      op_next_event(): Promise<Outbound | null>;
    };
  };
};

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
  | { op: "create"; id: number; kind: string; props: SerializedProps }
  | { op: "createText"; id: number; text: string }
  | { op: "createTextSpan"; id: number; text: string }
  | { op: "append"; parent: number; child: number }
  | { op: "insert"; parent: number; child: number; before: number }
  | { op: "remove"; parent: number; child: number }
  | { op: "update"; id: number; props: SerializedProps }
  | { op: "updateText"; id: number; text: string };

export interface SerializedProps {
  style?: Record<string, unknown>;
  hoverStyle?: Record<string, unknown>;
  pressStyle?: Record<string, unknown>;
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
  // `image` element attributes
  src?: string;
  tint?: string;
  flipX?: boolean;
  flipY?: boolean;
  imageMode?: string;
  // `canvas` element: the recorded vector display list, rasterized on the Bevy side.
  draw?: DrawCmd[];
  // `portal` element: the render-target name to display.
  target?: string;
  // `editableText` element attributes
  value?: string;
  maxLength?: number;
  multiline?: boolean;
  onChange?: boolean;
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
  // The new text. Present only for an `editableText`'s "change" event.
  value?: string;
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
  Deno.core.ops.op_animate({ kind: "clear" });
}

// Send an animation command to the animations plugin (declare/set/animate/
// cancel/clear). Synchronous and fire-and-forget, like `emit`. Low-level — apps
// use the `useSharedValue` / `with*` helpers from `./animated`.
export function animate(cmd: AnimationCommand): void {
  Deno.core.ops.op_animate(cmd);
}

export function flush(): void {
  if (pending.length === 0) return;
  Deno.core.ops.op_flush(pending.splice(0, pending.length));
}

// Send a named app message to the Bevy side. Surfaced there as a
// `ReactMessage` you read with `MessageReader<ReactMessage>`.
//
// This is the untyped, low-level form. Prefer the typed `emit`/`bevy` generated from
// your Rust `#[react_message]` structs by `App::export_react_typescript` — it checks
// the name and payload against the same structs Bevy deserializes into, and calls this.
export function emit(name: string, value: unknown): void {
  Deno.core.ops.op_emit(name, value);
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
    Deno.core.ops.op_request(BigInt(id), name, value);
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

// Split React props into a serializable payload + registered event handlers.
// `children` and functions never go across the boundary.
export function serializeProps(
  id: number,
  props: Record<string, unknown>,
): SerializedProps {
  const out: SerializedProps = {};
  const hs: Record<string, (...args: unknown[]) => void> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    if (key === "onClick" && typeof value === "function") {
      hs.click = value as (...args: unknown[]) => void;
      out.onClick = true;
      continue;
    }
    // Pointer/drag handlers. Like onClick, the function stays in JS and only a
    // boolean crosses; Bevy reports back `pointerDown`/`pointerMove`/`pointerUp`
    // events (with a normalized cursor position) the event loop routes here.
    if (key === "onPointerDown" && typeof value === "function") {
      hs.pointerDown = value as (...args: unknown[]) => void;
      out.onPointerDown = true;
      continue;
    }
    if (key === "onPointerMove" && typeof value === "function") {
      hs.pointerMove = value as (...args: unknown[]) => void;
      out.onPointerMove = true;
      continue;
    }
    if (key === "onPointerUp" && typeof value === "function") {
      hs.pointerUp = value as (...args: unknown[]) => void;
      out.onPointerUp = true;
      continue;
    }
    // An `editableText`'s `onChange`. The function stays in JS; Bevy reports back
    // a `change` event (carrying the new text) the event loop routes here.
    if (key === "onChange" && typeof value === "function") {
      hs.change = value as (...args: unknown[]) => void;
      out.onChange = true;
      continue;
    }
    if (key === "style" && value && typeof value === "object") {
      // Style is opaque: every CSS-like key (incl. backgroundColor, border,
      // grid, …) rides across inside this object, decoded on the Rust side.
      // The one exception is `transition` timings, normalized ms→s here so the
      // Rust side stays in the animation engine's native seconds.
      out.style = withTransitionSeconds(value as Record<string, unknown>);
      continue;
    }
    // Hover/press variant styles ride across opaque, like `style`. Bevy overlays
    // them onto the base style from the node's interaction state.
    if (key === "hoverStyle" && value && typeof value === "object") {
      out.hoverStyle = withTransitionSeconds(value as Record<string, unknown>);
      continue;
    }
    if (key === "pressStyle" && value && typeof value === "object") {
      out.pressStyle = withTransitionSeconds(value as Record<string, unknown>);
      continue;
    }
    // An `Animated.node`'s `animatedStyle`: each property is bound to a shared
    // value (or an interpolation). A bare `SharedValue` becomes a `shared`
    // binding; `interpolate`/`interpolateColor` results pass through as-is.
    if (key === "animatedStyle" && value && typeof value === "object") {
      out.animated = serializeAnimatedStyle(value as Record<string, unknown>);
      continue;
    }
    // An `Anchored.node`'s `anchor` (entity + optional offset) rides across opaque;
    // Bevy projects the entity's world position to the screen each frame.
    if (key === "anchor" && value && typeof value === "object") {
      out.anchor = value as Record<string, unknown>;
      continue;
    }
    // A `canvas`'s `draw`: a painter callback (recorded against a fresh context)
    // or an already-built `DrawCmd[]` display list. Either way it crosses as data.
    if (key === "draw") {
      out.draw =
        typeof value === "function"
          ? recordDrawing(value as CanvasPainter)
          : (value as DrawCmd[]);
      continue;
    }
    // Text + `image` + `editableText` element attributes pass through by name.
    if (key === "color") out.color = value as string;
    else if (key === "fontSize") out.fontSize = value as number;
    else if (key === "src") out.src = value as string;
    else if (key === "tint") out.tint = value as string;
    else if (key === "flipX") out.flipX = value as boolean;
    else if (key === "flipY") out.flipY = value as boolean;
    else if (key === "imageMode") out.imageMode = value as string;
    else if (key === "target") out.target = value as string;
    else if (key === "value") out.value = value as string;
    else if (key === "maxLength") out.maxLength = value as number;
    else if (key === "multiline") out.multiline = value as boolean;
  }

  if (Object.keys(hs).length > 0) handlers.set(id, hs);
  else handlers.delete(id);

  return out;
}

// Normalize a style's `transition` timings from milliseconds (the JS-facing unit)
// to seconds (the Rust animation engine's unit). Returns the style unchanged when
// it has no transition; otherwise a shallow copy so the caller's object is never
// mutated. The rest of the style stays opaque.
function withTransitionSeconds(
  style: Record<string, unknown>,
): Record<string, unknown> {
  const transition = style.transition;
  if (!transition || typeof transition !== "object") return style;
  const convert = (spec: unknown): unknown => {
    if (!spec || typeof spec !== "object") return spec;
    const s = spec as Record<string, unknown>;
    const out: Record<string, unknown> = { ...s };
    if (typeof s.duration === "number") out.duration = s.duration / 1000;
    if (typeof s.delay === "number") out.delay = s.delay / 1000;
    return out;
  };
  const channels: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(transition)) {
    channels[key] = convert(spec);
  }
  return { ...style, transition: channels };
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
    const msg = await Deno.core.ops.op_next_event();
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
