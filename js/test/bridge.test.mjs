// Unit tests for the delta `update` op builder (`buildUpdateOp`) and its
// structural comparator (`valuesEqual`) — the pure-JS half of the partial
// update protocol (the Rust half is covered by `protocol::tests`).
//
// `bridge.ts` resolves its host at module load, so a stub host is installed
// before the module is imported; the module itself is bundled on the fly with
// esbuild (its imports are extensionless, which Node's native type stripping
// doesn't resolve).
//
// Run: npm test -w bevy-react

import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

globalThis.__bevyHost = {
  op_flush() {},
  op_emit() {},
  op_request() {},
  op_animate() {},
  op_next_event: () => new Promise(() => {}),
};

const entry = join(dirname(fileURLToPath(import.meta.url)), "../src/bridge.ts");
const bundled = await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  write: false,
  logLevel: "silent",
});
const code = Buffer.from(bundled.outputFiles[0].contents).toString("base64");
const { buildUpdateOp, valuesEqual } = await import(
  `data:text/javascript;base64,${code}`
);

test("valuesEqual: primitives and reference identity", () => {
  assert.ok(valuesEqual(1, 1));
  assert.ok(valuesEqual("a", "a"));
  assert.ok(valuesEqual(undefined, undefined));
  assert.ok(!valuesEqual(1, "1"));
  assert.ok(!valuesEqual(0, -0)); // Object.is semantics
  assert.ok(valuesEqual(NaN, NaN));
});

test("valuesEqual: structural objects and arrays", () => {
  assert.ok(valuesEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }));
  assert.ok(!valuesEqual({ a: 1 }, { a: 2 }));
  assert.ok(!valuesEqual({ a: 1 }, { a: 1, b: 1 }));
  assert.ok(!valuesEqual([1, 2], [1, 2, 3]));
  assert.ok(!valuesEqual([1, 2], { 0: 1, 1: 2 }));
  // A key explicitly set to undefined equals a missing key.
  assert.ok(valuesEqual({ a: 1, b: undefined }, { a: 1 }));
});

test("valuesEqual: depth cap reports unequal, never wrong", () => {
  const deep = (n) => (n === 0 ? 1 : { d: deep(n - 1) });
  assert.ok(valuesEqual(deep(3), deep(3)));
  // Past the default cap the comparison gives up (conservative "changed").
  assert.ok(!valuesEqual(deep(9), deep(9)));
});

test("no Bevy-visible change returns null", () => {
  const style = { width: 100 };
  const onClick = () => {};
  // Same style ref, new handler closure — nothing wire-visible changed.
  assert.equal(
    buildUpdateOp(1, { style, onClick }, { style, onClick: () => {} }),
    null,
  );
  // Inline style object with identical values: also no op (structural diff).
  assert.equal(
    buildUpdateOp(1, { style: { width: 100 } }, { style: { width: 100 } }),
    null,
  );
});

test("style diffs field-by-field", () => {
  const op = buildUpdateOp(
    1,
    { style: { width: 100, backgroundColor: "red", flexGrow: 1 } },
    { style: { width: 250, backgroundColor: "red" } },
  );
  assert.deepEqual(op, {
    op: "update",
    id: 1,
    props: { style: { width: 250 } },
    styleUnset: ["flexGrow"],
  });
});

test("style added / removed wholesale", () => {
  const added = buildUpdateOp(1, {}, { style: { width: 1 } });
  assert.deepEqual(added.props.style, { width: 1 });
  const removed = buildUpdateOp(1, { style: { width: 1 } }, {});
  assert.deepEqual(removed.unset, ["style"]);
});

test("handlers diff by presence, not identity", () => {
  const gained = buildUpdateOp(1, {}, { onClick: () => {} });
  assert.deepEqual(gained.props, { onClick: true });

  const lost = buildUpdateOp(1, { onClick: () => {} }, {});
  assert.deepEqual(lost.unset, ["onClick"]);
  assert.deepEqual(lost.props, {});
});

test("wire-name mapping for unset (name → target, animatedStyle → animated)", () => {
  const op = buildUpdateOp(
    1,
    { name: "panel", animatedStyle: { opacity: { id: 3 } } },
    {},
  );
  assert.deepEqual(new Set(op.unset), new Set(["target", "animated"]));
});

test("event-like props are sent when changed but never unset", () => {
  const changed = buildUpdateOp(1, { value: "a" }, { value: "b" });
  assert.deepEqual(changed.props, { value: "b" });
  assert.equal(changed.unset, undefined);

  // Dropping a controlled/event prop is a no-op, not an unset.
  assert.equal(buildUpdateOp(1, { value: "a", scrollTop: 5 }, {}), null);
});

test("selection halves always travel as a pair", () => {
  const op = buildUpdateOp(
    1,
    { selectionStart: 0, selectionEnd: 2 },
    { selectionStart: 0, selectionEnd: 7 },
  );
  assert.equal(op.props.selectionStart, 0);
  assert.equal(op.props.selectionEnd, 7);
});

test("variant styles replace atomically and skip when structurally equal", () => {
  const op = buildUpdateOp(
    1,
    { hoverStyle: { backgroundColor: "blue", width: 1 } },
    { hoverStyle: { backgroundColor: "green" } },
  );
  // The whole new object rides, not a field diff.
  assert.deepEqual(op.props.hoverStyle, { backgroundColor: "green" });

  assert.equal(
    buildUpdateOp(
      1,
      { hoverStyle: { backgroundColor: "blue" } },
      { hoverStyle: { backgroundColor: "blue" } },
    ),
    null,
  );
});

test("scalar prop removed lands in unset under its wire name", () => {
  const op = buildUpdateOp(1, { src: "a.png", tint: "red" }, { src: "a.png" });
  assert.deepEqual(op.unset, ["tint"]);
});

test("children changes never cross", () => {
  assert.equal(buildUpdateOp(1, { children: "a" }, { children: "b" }), null);
});

test("onResize diffs by presence like any handler", () => {
  const gained = buildUpdateOp(1, {}, { onResize: () => {} });
  assert.deepEqual(gained.props, { onResize: true });

  const lost = buildUpdateOp(1, { onResize: () => {} }, {});
  assert.deepEqual(lost.unset, ["onResize"]);
});

test("a changed draw painter re-sends the recorded display list", () => {
  // Painter closures differ by identity every render; the recorded commands
  // ride the update (clear + replay semantics on the Rust side).
  const op = buildUpdateOp(
    1,
    { draw: (ctx) => ctx.beginPath() },
    { draw: (ctx) => ctx.rect(0, 0, 4, 4) },
  );
  assert.deepEqual(op.props.draw, [{ cmd: "rect", x: 0, y: 0, w: 4, h: 4 }]);

  // Dropping the painter is a no-op (retained pixels stay), not an unset.
  assert.equal(buildUpdateOp(1, { draw: (ctx) => ctx.fill() }, {}), null);
});
