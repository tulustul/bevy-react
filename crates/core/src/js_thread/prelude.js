// JS globals the engines do not provide on their own, over the ops every
// engine adapter installs on `globalThis.__bevyHost` before this runs.
//
// `setTimeout`/`setInterval` honor their delay via the async `op_sleep`; a
// `0`ms timeout stays on the microtask queue so React's scheduler (which
// yields with `setTimeout(_, 0)`) stays cheap. Cancellation is observable (a
// cleared callback never runs), even though the underlying sleep still
// completes.
//
// `console` forwards to `op_log`, so every `console.*` call (the runtime's own
// error handlers in bridge.ts/renderer.ts as well as any user component)
// reaches the Bevy log tagged `target: "bevy_react_core::js"`, with the
// tracing level distinguishing `log` from `error`. Defined explicitly rather
// than relying on an engine's default so behavior is the same on every engine.
const __host = globalThis.__bevyHost;
let __nextTimer = 1;
const __cancelled = new Set();
globalThis.setTimeout = (cb, ms = 0, ...args) => {
  const id = __nextTimer++;
  const delay = Math.max(0, +ms || 0);
  const run = () => {
    if (!__cancelled.delete(id)) cb(...args);
  };
  if (delay === 0) Promise.resolve().then(run);
  else __host.op_sleep(delay).then(run);
  return id;
};
globalThis.clearTimeout = (id) => {
  if (id != null) __cancelled.add(id);
};
globalThis.setInterval = (cb, ms = 0, ...args) => {
  const id = __nextTimer++;
  const delay = Math.max(0, +ms || 0);
  (async () => {
    while (!__cancelled.has(id)) {
      await __host.op_sleep(delay);
      if (__cancelled.has(id)) break;
      cb(...args);
    }
    __cancelled.delete(id);
  })();
  return id;
};
globalThis.clearInterval = (id) => {
  if (id != null) __cancelled.add(id);
};
globalThis.queueMicrotask =
  globalThis.queueMicrotask ||
  ((cb) => {
    Promise.resolve().then(cb);
  });
if (!globalThis.performance) {
  globalThis.performance = {
    now: () => __host.op_now(),
    timeOrigin: Date.now(),
  };
}

const __fmtArg = (a) => {
  if (typeof a === "string") return a;
  if (a instanceof Error) {
    // V8's `stack` starts with the "Name: message" head, QuickJS's is frames only.
    const head = a.name + ": " + a.message;
    const stack = a.stack || "";
    return stack.startsWith(head) ? stack : stack ? head + "\n" + stack : head;
  }
  try {
    return JSON.stringify(a);
  } catch {
    return String(a);
  }
};
const __log =
  (level) =>
  (...args) =>
    __host.op_log(level, args.map(__fmtArg).join(" "));
globalThis.console = {
  log: __log("info"),
  info: __log("info"),
  debug: __log("debug"),
  trace: __log("debug"),
  warn: __log("warn"),
  error: __log("error"),
  dir: __log("info"),
  table: __log("info"),
  // No-op fallbacks so libraries that probe these never throw:
  group: () => {},
  groupCollapsed: () => {},
  groupEnd: () => {},
  assert: () => {},
};
