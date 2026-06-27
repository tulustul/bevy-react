// The custom React renderer ("react backend"): a react-reconciler HostConfig
// whose host operations record ops into the bridge buffer instead of touching a
// DOM. Mounted as a concurrent root; event dispatch wraps handlers in `flushSync`
// so a handler's setState commits (and flushes its ops) before the next event.
// A legacy root would re-enter the reconciler's sync-callback path on async
// `setState` (e.g. a request continuation) and throw React #327.

import type { ReactNode } from "react";
import Reconciler from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import {
  allocId,
  dropHandlers,
  flush,
  push,
  ROOT_ID,
  serializeProps,
} from "./bridge";
import { setupRefreshRuntime } from "./hmr";

// `process.env.NODE_ENV` is replaced at build time by esbuild's `define`; the
// declaration is type-only (erased) and keeps tsc happy without @types/node.
declare const process: { env: { NODE_ENV?: string } };
const DEV = process.env.NODE_ENV !== "production";

// Install the react-refresh runtime BEFORE the reconciler is created, so the
// reconciler's `injectIntoDevTools` (below) registers against a global hook the
// refresh runtime has already patched. No-op in production builds.
if (DEV) setupRefreshRuntime();

interface Instance {
  id: number;
  type: string;
}
interface TextInstance {
  id: number;
}
interface Container {
  id: number;
}
interface HostContext {
  inText: boolean;
}

// Shallow reference-compare two prop bags, ignoring `children`. Used to tell a
// text-only `<text>` update from one that also changed style/handlers; app style
// objects are stable module consts, so a text-only change compares equal.
function propsChangedExceptChildren(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  for (const k in a)
    if (k !== "children" && !Object.is(a[k], b[k])) return true;
  for (const k in b) if (k !== "children" && !(k in a)) return true;
  return false;
}

// Most host-config callbacks are intentionally trivial for a UI-only renderer.
// TODO(review): `hostConfig: any` drops type-checking on the most protocol-critical
// object. Type it as react-reconciler's `HostConfig<...>` so signature drift is caught.
const hostConfig: any = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true,
  noTimeout: -1,
  scheduleTimeout: (fn: (...a: unknown[]) => void, delay?: number) =>
    setTimeout(fn, delay),
  cancelTimeout: (handle: number) => clearTimeout(handle),

  // Track whether we're inside a `<text>`, so nested `<text>` becomes a span and
  // bare strings inside become inheriting `TextSpan` runs (Bevy's text model).
  getRootHostContext: (): HostContext => ({ inText: false }),
  getChildHostContext: (parent: HostContext, type: string): HostContext => ({
    inText: parent.inText || type === "text",
  }),
  getPublicInstance: (instance: Instance) => instance,
  prepareForCommit: () => null,
  resetAfterCommit: () => flush(),
  preparePortalMount: () => {},
  getCurrentEventPriority: () => DefaultEventPriority,

  // A `<text>` whose only child is a string/number renders that text directly
  // (no separate child text entity) — the React/DOM `shouldSetTextContent` fast
  // path. Anything else (nested elements, multiple/mixed children) keeps the span
  // model.
  shouldSetTextContent: (type: string, props: Record<string, unknown>) =>
    type === "text" &&
    (typeof props.children === "string" || typeof props.children === "number"),

  createInstance(
    type: string,
    props: Record<string, unknown>,
    _root: Container,
    hostContext: HostContext,
  ): Instance {
    const id = allocId();
    // A nested `<text>` is a styled span; a top-level one is a text block root.
    const kind = type === "text" && hostContext.inText ? "textSpan" : type;
    // A single-string `<text>` child rides inline on the create op (see
    // shouldSetTextContent) instead of spawning its own text entity.
    const child = props.children;
    const text =
      type === "text" &&
      (typeof child === "string" || typeof child === "number")
        ? String(child)
        : undefined;
    push(
      text === undefined
        ? { op: "create", id, kind, props: serializeProps(id, props) }
        : { op: "create", id, kind, props: serializeProps(id, props), text },
    );
    return { id, type };
  },

  createTextInstance(
    text: string,
    _root: Container,
    hostContext: HostContext,
  ): TextInstance {
    const id = allocId();
    // A bare string inside a `<text>` is an inheriting run; elsewhere it's a
    // standalone (default-styled) text node.
    push(
      hostContext.inText
        ? { op: "createTextSpan", id, text }
        : { op: "createText", id, text },
    );
    return { id };
  },

  appendInitialChild(parent: Instance, child: Instance | TextInstance) {
    push({ op: "append", parent: parent.id, child: child.id });
  },
  finalizeInitialChildren: () => false,

  appendChild(parent: Instance, child: Instance | TextInstance) {
    push({ op: "append", parent: parent.id, child: child.id });
  },
  appendChildToContainer(
    _container: Container,
    child: Instance | TextInstance,
  ) {
    push({ op: "append", parent: ROOT_ID, child: child.id });
  },

  insertBefore(
    parent: Instance,
    child: Instance | TextInstance,
    before: Instance | TextInstance,
  ) {
    push({
      op: "insert",
      parent: parent.id,
      child: child.id,
      before: before.id,
    });
  },
  insertInContainerBefore(
    _container: Container,
    child: Instance | TextInstance,
    before: Instance | TextInstance,
  ) {
    push({ op: "insert", parent: ROOT_ID, child: child.id, before: before.id });
  },

  removeChild(parent: Instance, child: Instance | TextInstance) {
    push({ op: "remove", parent: parent.id, child: child.id });
    dropHandlers(child.id);
  },
  removeChildFromContainer(
    _container: Container,
    child: Instance | TextInstance,
  ) {
    push({ op: "remove", parent: ROOT_ID, child: child.id });
    dropHandlers(child.id);
  },

  // We return the new props as the payload so commitUpdate always runs.
  // TODO(review): no prop diffing — `prepareUpdate` always returns `next`, so every
  // update re-serializes and re-applies the FULL prop set (and the Bevy side re-inserts
  // `Node`, forcing relayout — see ui_map::apply_style). Diff old vs next here (or carry a
  // changed-keys set) so a one-field change doesn't re-apply everything.
  prepareUpdate: (_i: Instance, _t: string, _old: unknown, next: unknown) =>
    next,

  commitUpdate(
    instance: Instance,
    _payload: unknown,
    type: string,
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>,
  ) {
    const id = instance.id;
    const newChild = newProps.children;
    // An inline-text `<text>`: its string child rides as `text`, not a child node,
    // so its change arrives here (not via commitTextUpdate). Emit a cheap
    // `updateText` for a text-only change so it doesn't trigger a full style
    // re-apply + relayout; only re-serialize props if a non-children prop changed.
    if (
      type === "text" &&
      (typeof newChild === "string" || typeof newChild === "number")
    ) {
      const oldChild = oldProps.children;
      const newText = String(newChild);
      const oldText =
        typeof oldChild === "string" || typeof oldChild === "number"
          ? String(oldChild)
          : undefined;
      if (propsChangedExceptChildren(oldProps, newProps)) {
        push({ op: "update", id, props: serializeProps(id, newProps) });
      }
      if (newText !== oldText) {
        push({ op: "updateText", id, text: newText });
      }
      return;
    }
    push({ op: "update", id, props: serializeProps(id, newProps) });
  },

  commitTextUpdate(textInstance: TextInstance, _old: string, next: string) {
    push({ op: "updateText", id: textInstance.id, text: next });
  },

  // Clear an inline-text element's content (React calls this when a `<text>`
  // switches from a string child to element children, before the spans mount).
  resetTextContent(instance: Instance) {
    push({ op: "updateText", id: instance.id, text: "" });
  },

  clearContainer: () => {},
  detachDeletedInstance: (instance: Instance) => dropHandlers(instance.id),

  // No-op scope/blur hooks the reconciler still expects.
  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,
};

const reconciler = Reconciler(hostConfig);

// Register the reconciler with the devtools global hook. This is what gives the
// react-refresh runtime a `scheduleRefresh` handler for our renderer; without
// it `performReactRefresh()` is a silent no-op. The return value is `false`
// (no real DevTools backend) — only the side effect matters. Dev only.
if (DEV) {
  reconciler.injectIntoDevTools({
    bundleType: 1,
    version: "18.3.1",
    rendererPackageName: "bevy-react",
    findFiberByHostInstance: () => null,
  });
}

/** Run `fn` and synchronously commit any state updates it triggers. */
export function flushSync(fn: () => void): void {
  reconciler.flushSync(fn);
}

const ConcurrentRoot = 1;

// The persistent React root. Created once on the first mount and reused for the
// isolate's lifetime so a hot update re-renders the existing fiber tree (hook
// state intact) instead of remounting.
let root: ReturnType<typeof reconciler.createContainer> | null = null;

/** Mount a React element tree against the Bevy root container (first load). */
export function render(element: ReactNode): void {
  if (root === null) {
    // TODO(review): we mount a ConcurrentRoot but drive every event through
    // `flushSync` (see bridge.runEventLoop), so React runs effectively synchronously —
    // concurrent features (Suspense, transitions, time-slicing) are unavailable. Either
    // commit to sync (a legacy root + the documented #327 workaround) or actually use
    // concurrency; the current middle ground pays for a feature it doesn't use.
    const container: Container = { id: ROOT_ID };
    root = reconciler.createContainer(
      container,
      ConcurrentRoot,
      null, // hydrationCallbacks
      false, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      "", // identifierPrefix
      (e: unknown) => console.error("[js] recoverable error:", e),
      null, // transitionCallbacks
    );
  }
  // Commit the initial mount synchronously: a concurrent root schedules the first
  // render asynchronously otherwise, delaying the initial op flush.
  reconciler.flushSync(() => {
    reconciler.updateContainer(element, root, null, null);
  });
}
