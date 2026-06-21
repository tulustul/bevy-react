// The custom React renderer ("react backend"): a react-reconciler HostConfig
// whose host operations record ops into the bridge buffer instead of touching a
// DOM. Configured for synchronous (legacy) rendering so event-handler setState
// flushes immediately.

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

// Most host-config callbacks are intentionally trivial for a UI-only renderer.
const hostConfig: any = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true,
  noTimeout: -1,
  scheduleTimeout: (fn: (...a: unknown[]) => void, delay?: number) =>
    setTimeout(fn, delay),
  cancelTimeout: (handle: number) => clearTimeout(handle),

  getRootHostContext: () => ({}),
  getChildHostContext: (parent: unknown) => parent,
  getPublicInstance: (instance: Instance) => instance,
  prepareForCommit: () => null,
  resetAfterCommit: () => flush(),
  preparePortalMount: () => {},
  getCurrentEventPriority: () => DefaultEventPriority,

  // Text always becomes a separate text node, never inlined into a host node.
  shouldSetTextContent: () => false,

  createInstance(type: string, props: Record<string, unknown>): Instance {
    const id = allocId();
    push({ op: "create", id, kind: type, props: serializeProps(id, props) });
    return { id, type };
  },

  createTextInstance(text: string): TextInstance {
    const id = allocId();
    push({ op: "createText", id, text });
    return { id };
  },

  appendInitialChild(parent: Instance, child: Instance | TextInstance) {
    push({ op: "append", parent: parent.id, child: child.id });
  },
  finalizeInitialChildren: () => false,

  appendChild(parent: Instance, child: Instance | TextInstance) {
    push({ op: "append", parent: parent.id, child: child.id });
  },
  appendChildToContainer(_container: Container, child: Instance | TextInstance) {
    push({ op: "append", parent: ROOT_ID, child: child.id });
  },

  insertBefore(
    parent: Instance,
    child: Instance | TextInstance,
    before: Instance | TextInstance,
  ) {
    push({ op: "insert", parent: parent.id, child: child.id, before: before.id });
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
  removeChildFromContainer(_container: Container, child: Instance | TextInstance) {
    push({ op: "remove", parent: ROOT_ID, child: child.id });
    dropHandlers(child.id);
  },

  // We return the new props as the payload so commitUpdate always runs.
  prepareUpdate: (_i: Instance, _t: string, _old: unknown, next: unknown) => next,

  commitUpdate(
    instance: Instance,
    _payload: unknown,
    _type: string,
    _oldProps: unknown,
    newProps: Record<string, unknown>,
  ) {
    push({
      op: "update",
      id: instance.id,
      props: serializeProps(instance.id, newProps),
    });
  },

  commitTextUpdate(textInstance: TextInstance, _old: string, next: string) {
    push({ op: "updateText", id: textInstance.id, text: next });
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

/** Run `fn` and synchronously commit any state updates it triggers. */
export function flushSync(fn: () => void): void {
  reconciler.flushSync(fn);
}

const LegacyRoot = 0;

/** Mount a React element tree against the Bevy root container. */
export function render(element: React.ReactNode): void {
  const container: Container = { id: ROOT_ID };
  const root = reconciler.createContainer(
    container,
    LegacyRoot,
    null, // hydrationCallbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    "", // identifierPrefix
    (e: unknown) => console.error("[js] recoverable error:", e),
    null, // transitionCallbacks
  );
  reconciler.updateContainer(element, root, null, null);
}
