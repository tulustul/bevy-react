// The JS half of the Rust<->JS boundary: an op buffer flushed per commit, a
// registry of event handlers (which never cross into Rust), and the event loop
// that pulls UI events back from Bevy.

// deno_core exposes registered ops under `Deno.core.ops`.
declare const Deno: {
  core: {
    ops: {
      op_flush(ops: Op[]): void;
      op_next_event(): Promise<UiEvent | null>;
    };
  };
};

export const ROOT_ID = 0;

// Mirrors `protocol::Op` on the Rust side (tag = "op").
export type Op =
  | { op: "create"; id: number; kind: string; props: SerializedProps }
  | { op: "createText"; id: number; text: string }
  | { op: "append"; parent: number; child: number }
  | { op: "insert"; parent: number; child: number; before: number }
  | { op: "remove"; parent: number; child: number }
  | { op: "update"; id: number; props: SerializedProps }
  | { op: "updateText"; id: number; text: string };

export interface SerializedProps {
  style?: Record<string, unknown>;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  onClick?: boolean;
}

export interface UiEvent {
  id: number;
  kind: string;
}

// Ops accumulated during the current commit, flushed in resetAfterCommit.
const pending: Op[] = [];

// id -> { click: handler, ... }. Handlers stay here; only a boolean crosses.
const handlers = new Map<number, Record<string, (...args: unknown[]) => void>>();

let nextId = 1; // 0 is reserved for the root container.

export function allocId(): number {
  return nextId++;
}

export function push(op: Op): void {
  pending.push(op);
}

export function flush(): void {
  if (pending.length === 0) return;
  Deno.core.ops.op_flush(pending.splice(0, pending.length));
}

// Split React props into a serializable payload + registered event handlers.
// `children` and functions never go across the boundary.
export function serializeProps(id: number, props: Record<string, unknown>): SerializedProps {
  const out: SerializedProps = {};
  const hs: Record<string, (...args: unknown[]) => void> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    if (key === "onClick" && typeof value === "function") {
      hs.click = value as (...args: unknown[]) => void;
      out.onClick = true;
      continue;
    }
    if (key === "style" && value && typeof value === "object") {
      out.style = value as Record<string, unknown>;
      continue;
    }
    if (key === "backgroundColor") out.backgroundColor = value as string;
    else if (key === "color") out.color = value as string;
    else if (key === "fontSize") out.fontSize = value as number;
  }

  if (Object.keys(hs).length > 0) handlers.set(id, hs);
  else handlers.delete(id);

  return out;
}

export function dropHandlers(id: number): void {
  handlers.delete(id);
}

// Pull events from Bevy forever; dispatch each to its React handler. Returns
// when Bevy drops the sender (op_next_event resolves null) on shutdown.
//
// `wrap` runs the handler inside the reconciler's flushSync so the resulting
// re-render commits (and flushes its ops) synchronously before we await again.
export async function runEventLoop(
  wrap: (fn: () => void) => void = (fn) => fn(),
): Promise<void> {
  for (;;) {
    const ev = await Deno.core.ops.op_next_event();
    if (ev == null) break;
    const h = handlers.get(ev.id);
    const fn = h?.[ev.kind];
    if (fn) {
      wrap(() => {
        try {
          fn();
        } catch (e) {
          console.error("[js] handler error:", e);
        }
      });
    }
  }
}
