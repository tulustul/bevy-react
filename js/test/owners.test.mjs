// Unit tests for component attribution (`js/src/devtools/owners.ts`): the
// name resolver's rules, and — the reason this file exists — a REAL reconciler
// render that pins React's `_debugOwner` contract. The whole feature rests on
// that undocumented dev-only fiber field, so a React upgrade that changes it
// must fail here rather than silently blanking the devtools tree.
//
// Same esbuild-on-the-fly rig as bridge.test.mjs (extensionless TS imports).
//
// Run: npm test -w bevy-react

// Node builtins are imported rather than taken as globals — the lint config
// only grants `globals.node` to the build scripts (same reason bridge.test.mjs
// imports `Buffer`).
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

process.env.NODE_ENV = "development"; // React's dev build is what carries _debugOwner

import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const entry = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/devtools/owners.ts",
);
const bundled = await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  write: false,
  logLevel: "silent",
});
const code = Buffer.from(bundled.outputFiles[0].contents).toString("base64");
const { noteOwner, takeOwner, clearOwners } = await import(
  `data:text/javascript;base64,${code}`
);

/** A fake fiber: `noteOwner` reads the handle's `_debugOwner`, so a test only
 *  has to shape the owner chain. */
const handle = (owner) => ({ _debugOwner: owner });

/** Resolve one owner chain, consuming the pending entry. Ids are per-test
 *  arbitrary — the module only uses them as map keys. */
let nextId = 1;
function resolve(owner) {
  const id = nextId++;
  noteOwner(id, handle(owner));
  return takeOwner(id);
}

test("resolves a plain function component's name", () => {
  function Card() {}
  assert.equal(resolve({ type: Card }), "Card");
});

test("displayName wins over the function name", () => {
  function Card() {}
  Card.displayName = "FancyCard";
  assert.equal(resolve({ type: Card }), "FancyCard");
});

test("unwraps memo/forwardRef wrappers silently", () => {
  function Card() {}
  // forwardRef(Card): the fiber's `type` IS the wrapper object.
  assert.equal(resolve({ type: { render: Card } }), "Card");
  // memo(fn, compare): the wrapper holds the component in `type`.
  assert.equal(resolve({ type: { type: Card } }), "Card");
  // memo(forwardRef(Card)): two levels, still just the name.
  assert.equal(resolve({ type: { type: { render: Card } } }), "Card");
  // An explicit displayName on the wrapper is honored before unwrapping.
  assert.equal(
    resolve({ type: { displayName: "Memo(Card)", type: Card } }),
    "Memo(Card)",
  );
});

test("falls back to elementType, then to a plain info object's name", () => {
  function Card() {}
  assert.equal(resolve({ elementType: Card }), "Card");
  // Server-component owners are info objects, not fibers.
  assert.equal(resolve({ name: "ServerThing" }), "ServerThing");
});

test("skips unnamed owners to the first real component", () => {
  function Card() {}
  // React sets `_debugOwner` to the return fiber in some internal paths, so
  // the immediate owner can be a host fiber — it has no name to show.
  const host = { type: "node", _debugOwner: { type: Card } };
  assert.equal(resolve(host), "Card");
});

test("no owner, no handle, and unnamed chains attribute to nothing", () => {
  assert.equal(resolve(undefined), undefined);
  assert.equal(resolve({ type: "node" }), undefined); // host all the way up
  noteOwner(nextId, null);
  assert.equal(takeOwner(nextId++), undefined);
  noteOwner(nextId, "not a fiber");
  assert.equal(takeOwner(nextId++), undefined);
});

test("a cyclic owner chain terminates instead of hanging", () => {
  const a = { type: "node" };
  const b = { type: "node", _debugOwner: a };
  a._debugOwner = b;
  assert.equal(resolve(a), undefined);
});

test("takeOwner drains, and clearOwners drops what is pending", () => {
  function Card() {}
  const id = nextId++;
  noteOwner(id, handle({ type: Card }));
  assert.equal(takeOwner(id), "Card");
  assert.equal(takeOwner(id), undefined); // consumed by the mirror's create

  const stale = nextId++;
  noteOwner(stale, handle({ type: Card }));
  clearOwners(); // a cold reload's `reset` restarts the id space
  assert.equal(takeOwner(stale), undefined);
});

// --- The contract test: React's real owner semantics --------------------------

test("real reconciler: host nodes attribute to the component that WROTE them", async () => {
  const { jsxDEV } = await import("react/jsx-dev-runtime");
  const Reconciler = (await import("react-reconciler")).default;
  const { DefaultEventPriority, NoEventPriority } =
    await import("react-reconciler/constants.js");

  let priority = NoEventPriority;
  let id = 1000;
  /** props.id (the test's label) → the resolved owner name. */
  const owners = new Map();
  const record = (label, internalHandle) => {
    const nodeId = id++;
    noteOwner(nodeId, internalHandle);
    owners.set(label, takeOwner(nodeId));
  };

  // A minimal host config: only the callbacks a mount of three nodes reaches.
  const host = {
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    isPrimaryRenderer: true,
    noTimeout: -1,
    // The reconciler only schedules timeouts for Suspense retries; this mount
    // has none, so a pair of no-ops keeps node's timer globals out of the file.
    scheduleTimeout: () => -1,
    cancelTimeout: () => {},
    getRootHostContext: () => ({}),
    getChildHostContext: (parent) => parent,
    getPublicInstance: (instance) => instance,
    prepareForCommit: () => null,
    resetAfterCommit: () => {},
    preparePortalMount: () => {},
    getCurrentUpdatePriority: () => priority,
    setCurrentUpdatePriority: (next) => {
      priority = next;
    },
    resolveUpdatePriority: () =>
      priority !== NoEventPriority ? priority : DefaultEventPriority,
    resolveEventType: () => null,
    resolveEventTimeStamp: () => -1,
    NotPendingTransition: null,
    HostTransitionContext: { _currentValue: null, _currentValue2: null },
    resetFormInstance: () => {},
    requestPostPaintCallback: () => {},
    shouldAttemptEagerTransition: () => false,
    trackSchedulerEvent: () => {},
    maySuspendCommit: () => false,
    preloadInstance: () => true,
    startSuspendingCommit: () => {},
    suspendInstance: () => {},
    waitForCommitToBeReady: () => null,
    shouldSetTextContent: () => false,
    createInstance: (_type, props, _root, _ctx, internalHandle) => {
      record(props.id, internalHandle);
      return {};
    },
    createTextInstance: (text, _root, _ctx, internalHandle) => {
      record(`#text:${text}`, internalHandle);
      return {};
    },
    appendInitialChild: () => {},
    finalizeInitialChildren: () => false,
    appendChild: () => {},
    appendChildToContainer: () => {},
    insertBefore: () => {},
    insertInContainerBefore: () => {},
    removeChild: () => {},
    removeChildFromContainer: () => {},
    commitUpdate: () => {},
    commitTextUpdate: () => {},
    resetTextContent: () => {},
    clearContainer: () => {},
    detachDeletedInstance: () => {},
  };

  const el = (type, props, key) => jsxDEV(type, props, key, false);
  function Leaf() {
    return el("node", { id: "leaf" });
  }
  function Card({ slot }) {
    return el("node", {
      id: "card",
      children: [el(Leaf, {}, "leaf"), slot],
    });
  }
  function App() {
    // `slot` is written HERE and rendered inside Card — the divergence that
    // makes owner attribution worth having over the parent chain.
    return el(Card, { slot: el("node", { id: "slot" }, "slot") });
  }

  const reconciler = Reconciler(host);
  const container = reconciler.createContainer(
    {},
    0,
    null,
    false,
    null,
    "",
    (error) => {
      throw error;
    },
    null,
    null,
    null,
  );
  reconciler.updateContainer(el(App, {}), container, null, null);
  await delay(50); // let the concurrent root render and commit

  assert.equal(owners.get("card"), "Card");
  assert.equal(owners.get("leaf"), "Leaf");
  // The one that matters: attributed to its AUTHOR (App), not to the
  // component it renders under (Card).
  assert.equal(owners.get("slot"), "App");
});
