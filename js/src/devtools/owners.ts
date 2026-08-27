// Component attribution: which React component's JSX emitted a host node.
//
// Captured in the renderer's `createInstance`/`createTextInstance` from the
// fiber React hands every host op (`internalInstanceHandle`). Its dev-only
// `_debugOwner` chain is the OWNER — the component that WROTE the JSX — not the
// parent that rendered it: an element passed to another component as a prop is
// attributed to the component that authored it, which is the question a tree
// row should answer. Dev-only by construction: `_debugOwner` exists only in
// React's development build, and this whole module is stubbed out of production
// bundles (`devtoolsStubPlugin` in build-lib.mjs).
//
// Nothing crosses the wire — the name never reaches an op. It waits in a
// pending map between `createInstance` and the flush that applies the create,
// and the mirror TAKES it onto the node there, so the name's lifetime is the
// mirror node's and there is no second thing to evict.
//
// Rests on an undocumented React internal: `js/test/owners.test.mjs` drives the
// real reconciler and fails if a React upgrade changes `_debugOwner`.

/** Owner-walk depth cap. The chain is short in practice; the cap only bounds a
 *  pathological (or cyclic) `_debugOwner` chain. */
const MAX_DEPTH = 24;

/** Wrapper-unwrap depth cap (`memo(forwardRef(fn))` is two). */
const MAX_WRAPPERS = 4;

/** Node id → owner name, awaiting the create op that carries it into the
 *  mirror. Drained by `takeOwner`, so at rest it holds at most the current
 *  commit's freshly created nodes. */
const pending = new Map<number, string>();

/** Resolved name per owner fiber. Every host node a component renders is
 *  created off the same owner fiber, so the walk runs once per component per
 *  commit instead of once per node. */
const resolved = new WeakMap<object, string>();

/** The dev-only fiber fields this module reads. A server-component owner is a
 *  plain info object carrying `name` instead of a component `type`. */
interface OwnerFiber {
  type?: unknown;
  elementType?: unknown;
  name?: unknown;
  _debugOwner?: unknown;
}

/** The display name of a component type, unwrapping `memo`/`forwardRef`
 *  wrappers (which hold the real component in `type`/`render`). Wrappers are
 *  unwrapped SILENTLY (`<Card>`, never `<Memo(Card)>`): React rewrites a plain
 *  `memo(fn)` fiber's `type` to the inner function anyway, so showing the
 *  wrapper would mean reading `elementType` for memo and `type` for
 *  `forwardRef` — two internals to keep straight for a fact about how the
 *  component is declared, not about what emitted the node. */
function displayName(type: unknown, depth = 0): string {
  if (depth > MAX_WRAPPERS) return "";
  if (typeof type === "function") {
    const fn = type as { displayName?: unknown; name?: unknown };
    if (typeof fn.displayName === "string") return fn.displayName;
    return typeof fn.name === "string" ? fn.name : "";
  }
  if (type && typeof type === "object") {
    const wrapper = type as {
      displayName?: unknown;
      render?: unknown;
      type?: unknown;
    };
    if (typeof wrapper.displayName === "string") return wrapper.displayName;
    return displayName(wrapper.render ?? wrapper.type, depth + 1);
  }
  return "";
}

/** Walk up from an owner fiber to the first one with a usable name. React also
 *  sets `_debugOwner` to the return fiber in some internal paths, so the
 *  immediate owner can be a host (unnamed) fiber — skipping those keeps the
 *  attribution on a real component. */
function resolveOwner(start: object): string {
  const memo = resolved.get(start);
  if (memo !== undefined) return memo;
  let name = "";
  let cursor: unknown = start;
  for (let depth = 0; cursor && depth < MAX_DEPTH; depth++) {
    const fiber = cursor as OwnerFiber;
    name = displayName(fiber.type ?? fiber.elementType);
    if (!name && typeof fiber.name === "string") name = fiber.name;
    if (name) break;
    cursor = fiber._debugOwner;
  }
  resolved.set(start, name);
  return name;
}

/** Record the component that emitted node `id`. `handle` is the fiber React
 *  passes the host config; anything else — a production React build with no
 *  debug fields, an element written at module scope with no owner — is
 *  silently a no-op. Attribution is best-effort: the tree shows `<?>` where it
 *  was lost. */
export function noteOwner(id: number, handle: unknown): void {
  if (!handle || typeof handle !== "object") return;
  const owner = (handle as OwnerFiber)._debugOwner;
  if (!owner || typeof owner !== "object") return;
  const name = resolveOwner(owner);
  if (name) pending.set(id, name);
}

/** Consume node `id`'s owner name (the mirror's create path). */
export function takeOwner(id: number): string | undefined {
  const name = pending.get(id);
  if (name !== undefined) pending.delete(id);
  return name;
}

/** Drop everything pending — a cold reload's `reset` restarts the id space. */
export function clearOwners(): void {
  pending.clear();
}
