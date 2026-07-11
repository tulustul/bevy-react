// The custom React renderer ("react backend"): a react-reconciler HostConfig
// whose host operations record ops into the bridge buffer instead of touching a
// DOM. Mounted as a concurrent root; event dispatch wraps handlers in `flushSync`
// so a handler's setState commits (and flushes its ops) before the next event.
// A legacy root would re-enter the reconciler's sync-callback path on async
// `setState` (e.g. a request continuation) and throw React #327.

import { createContext, type ReactNode } from "react";
import Reconciler from "react-reconciler";
import {
  DefaultEventPriority,
  NoEventPriority,
} from "react-reconciler/constants";
import {
  allocId,
  buildUpdateOp,
  createCanvasElement,
  dropHandlers,
  flush,
  push,
  ROOT_ID,
  serializeProps,
} from "./bridge";
import { installDevtools } from "./devtools";
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
  // Marks the devtools panel's own container: its commits flush with
  // `devtools = true` so the bridge tap can attribute (and the recorder
  // exclude) the panel's own ops. See `renderDevtools`.
  devtools?: boolean;
}
interface HostContext {
  inText: boolean;
}

// react-reconciler 0.33 tracks an "update priority" via the host config; back it
// with a module var (NoEventPriority until React sets one).
let currentUpdatePriority: number = NoEventPriority;

// React 19 expects a host transition context object (used for form/transition
// features we don't use); a plain context satisfies it.
const HostTransitionContext = createContext<unknown>(null);

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
  // react-reconciler commits each root separately and passes its containerInfo
  // here, so every op batch is attributable to exactly one container — the app's
  // or the devtools panel's. That per-batch attribution is what keeps the
  // devtools recorder from logging its own panel's re-renders (a feedback loop).
  resetAfterCommit: (container: Container) => flush(!!container.devtools),
  preparePortalMount: () => {},

  // --- react-reconciler 0.33 host requirements (replaces getCurrentEventPriority) ---
  getCurrentUpdatePriority: () => currentUpdatePriority,
  setCurrentUpdatePriority: (priority: number) => {
    currentUpdatePriority = priority;
  },
  resolveUpdatePriority: () =>
    currentUpdatePriority !== NoEventPriority
      ? currentUpdatePriority
      : DefaultEventPriority,
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1,
  NotPendingTransition: null,
  HostTransitionContext,
  resetFormInstance: () => {},
  requestPostPaintCallback: () => {},
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: () => {},
  // No async/suspense loading for host instances — commits never suspend here.
  maySuspendCommit: () => false,
  preloadInstance: () => true,
  startSuspendingCommit: () => {},
  suspendInstance: () => {},
  waitForCommitToBeReady: () => null,

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
    // A `<canvas>`'s instance is its persistent element handle (what a ref
    // resolves to via `getPublicInstance`); it satisfies `Instance`.
    return type === "canvas" ? createCanvasElement(id) : { id, type };
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
  appendChildToContainer(container: Container, child: Instance | TextInstance) {
    push({ op: "append", parent: container.id, child: child.id });
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
    container: Container,
    child: Instance | TextInstance,
    before: Instance | TextInstance,
  ) {
    push({
      op: "insert",
      parent: container.id,
      child: child.id,
      before: before.id,
    });
  },

  removeChild(parent: Instance, child: Instance | TextInstance) {
    push({ op: "remove", parent: parent.id, child: child.id });
    dropHandlers(child.id);
  },
  removeChildFromContainer(
    container: Container,
    child: Instance | TextInstance,
  ) {
    push({ op: "remove", parent: container.id, child: child.id });
    dropHandlers(child.id);
  },

  // react-reconciler 0.33 removed `prepareUpdate`; `commitUpdate` now receives both
  // prop bags and owns the diff. `buildUpdateOp` diffs them into a delta `update`
  // op carrying only the changed props (and refreshes the JS-side handler closures
  // either way); when nothing Bevy-visible changed there is no backend op at all.
  // `children` is excluded — inline `<text>` content is emitted separately.
  commitUpdate(
    instance: Instance,
    type: string,
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>,
    _internalHandle: unknown,
  ) {
    const id = instance.id;
    const op = buildUpdateOp(id, oldProps, newProps);
    if (op) push(op);
    // Inline-text `<text>` (shouldSetTextContent): its string child rides as `text`,
    // so its change arrives here (not via commitTextUpdate).
    const c = newProps.children;
    if (type === "text" && (typeof c === "string" || typeof c === "number")) {
      const oc = oldProps.children;
      const newText = String(c);
      const oldText =
        typeof oc === "string" || typeof oc === "number"
          ? String(oc)
          : undefined;
      if (newText !== oldText) push({ op: "updateText", id, text: newText });
    }
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
    version: "19.2.7",
    rendererPackageName: "bevy-react",
    findFiberByHostInstance: () => null,
  });
}

/** Run `fn` and synchronously commit any state updates it triggers. */
export function flushSync(fn: () => void): void {
  // react-reconciler 0.33 renamed the instance method `flushSync` →
  // `flushSyncFromReconciler`.
  reconciler.flushSyncFromReconciler(fn);
}

const ConcurrentRoot = 1;

// The persistent React root. Created once on the first mount and reused for the
// isolate's lifetime so a hot update re-renders the existing fiber tree (hook
// state intact) instead of remounting.
let root: ReturnType<typeof reconciler.createContainer> | null = null;

// The devtools panel's own persistent React root: a SECOND container, so the
// panel's commits are separate flushes from the app's (see `resetAfterCommit`)
// and the app's fiber tree stays byte-identical to a non-devtools build. Shares
// the node-id allocator with the app container, so ids never collide.
let devtoolsRoot: ReturnType<typeof reconciler.createContainer> | null = null;

/** Mount the devtools panel tree in its own container. Devtools-internal. */
export function renderDevtools(element: ReactNode): void {
  if (devtoolsRoot === null) {
    const container: Container = { id: ROOT_ID, devtools: true };
    const onError = (e: unknown) => console.error("[js] devtools error:", e);
    devtoolsRoot = reconciler.createContainer(
      container,
      ConcurrentRoot,
      null,
      false,
      null,
      "",
      onError,
      onError,
      onError,
      () => {},
    );
  }
  reconciler.flushSyncFromReconciler(() => {
    reconciler.updateContainer(element, devtoolsRoot, null, null);
  });
}

/** Mount a React element tree against the Bevy root container (first load). */
export function render(element: ReactNode): void {
  // Install the devtools panel (dev builds only) BEFORE the app's first commit,
  // so the bridge tap sees the app's initial mount ops. The env check must stay
  // a literal — esbuild's `define` folds it, where the `DEV` const indirection
  // would defeat DCE (see build-lib.mjs). In prod bundles `./devtools` is
  // additionally stubbed out entirely by `devtoolsStubPlugin`.
  if (process.env.NODE_ENV !== "production") {
    // Drain anything already pending (mount.ts's reset op) as an app batch, so
    // the devtools container's first commit isn't blamed for it.
    flush();
    installDevtools({ mount: renderDevtools });
  }
  if (root === null) {
    // TODO(review): we mount a ConcurrentRoot but drive every event through
    // `flushSync` (see bridge.runEventLoop), so React runs effectively synchronously —
    // concurrent features (Suspense, transitions, time-slicing) are unavailable. Either
    // commit to sync (a legacy root + the documented #327 workaround) or actually use
    // concurrency; the current middle ground pays for a feature it doesn't use.
    const container: Container = { id: ROOT_ID };
    const onError = (e: unknown) => console.error("[js] react error:", e);
    root = reconciler.createContainer(
      container,
      ConcurrentRoot,
      null, // hydrationCallbacks
      false, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      "", // identifierPrefix
      onError, // onUncaughtError
      onError, // onCaughtError
      onError, // onRecoverableError
      () => {}, // onDefaultTransitionIndicator
    );
  }
  // Commit the initial mount synchronously: a concurrent root schedules the first
  // render asynchronously otherwise, delaying the initial op flush.
  reconciler.flushSyncFromReconciler(() => {
    reconciler.updateContainer(element, root, null, null);
  });
}
