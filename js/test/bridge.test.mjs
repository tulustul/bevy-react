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
const { buildUpdateOp, handlerEvent, serializeProps, valuesEqual } =
  await import(`data:text/javascript;base64,${code}`);

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

test("valuesEqual: filter chains compare structurally at full depth", () => {
  // The deepest style value: chain array → use object → params object →
  // tuple param (four container levels; the numbers inside are leaves). The
  // depth cap keeps headroom over this so an unchanged inline chain never
  // reads as a change.
  const chain = () => [
    { name: "blur", params: { radius: 4 } },
    { name: "tint", params: { tint: [1, 0, 0, 0.5] } },
  ];
  assert.ok(valuesEqual(chain(), chain()));

  const changed = chain();
  changed[1].params.tint[3] = 0.75;
  assert.ok(!valuesEqual(chain(), changed));
});

test("valuesEqual: depth cap reports unequal, never wrong", () => {
  const deep = (n) => (n === 0 ? 1 : { d: deep(n - 1) });
  assert.ok(valuesEqual(deep(3), deep(3)));
  // Past the default cap (8) the comparison gives up (conservative "changed").
  assert.ok(!valuesEqual(deep(12), deep(12)));
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

test("sharedTag crosses as a plain prop and unsets", () => {
  assert.deepEqual(buildUpdateOp(1, { sharedTag: "a" }, { sharedTag: "b" }), {
    op: "update",
    id: 1,
    kind: "node",
    props: { sharedTag: "b" },
  });
  const gone = buildUpdateOp(1, { sharedTag: "a" }, {});
  assert.ok(gone.unset.includes("sharedTag"));
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
    kind: "node",
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

// A stable SharedValue handle, as `useSharedValue` returns it: reference-held
// across renders, with a live accessor next to the id.
const sharedValue = (id) => ({
  id,
  get value() {
    return 0;
  },
});

test("re-render silence: identical inline { animated } styles emit no op", () => {
  const sv = sharedValue(1);
  // Fresh wrapper/chain/interpolation objects every render (only `sv` is
  // reference-stable), including the deepest case: an interpolateColor
  // binding inside filter params — seven container levels, inside the
  // valuesEqual depth cap.
  const style = () => ({
    opacity: { animated: sv },
    transform: {
      translateX: {
        animated: {
          type: "interpolate",
          id: 1,
          input: [0, 1],
          output: [0, 40],
        },
      },
    },
    filter: [
      {
        name: "tint",
        params: {
          tint: {
            animated: {
              type: "interpolateColor",
              id: 1,
              input: [0, 1],
              output: [
                [1, 0, 0, 1],
                [0, 0, 1, 1],
              ],
            },
          },
        },
      },
    ],
  });
  assert.equal(buildUpdateOp(1, { style: style() }, { style: style() }), null);
});

test("bind and unbind are ordinary style field deltas", () => {
  const sv = sharedValue(2);
  // Static → bound: the field changes value (wrapper crosses inside style).
  const bound = buildUpdateOp(
    1,
    { style: { opacity: 0.5 } },
    { style: { opacity: { animated: sv } } },
  );
  assert.deepEqual(bound.props.style, { opacity: { animated: sv } });
  // Bound → static again: plain delta back to the number.
  const unbound = buildUpdateOp(
    1,
    { style: { opacity: { animated: sv } } },
    { style: { opacity: 0.5 } },
  );
  assert.deepEqual(unbound.props.style, { opacity: 0.5 });
});

test("act-now props are sent when changed and unset when dropped", () => {
  const changed = buildUpdateOp(1, { value: "a" }, { value: "b" });
  assert.deepEqual(changed.props, { value: "b" });
  assert.equal(changed.unset, undefined);

  // Dropping one rides `unset` like any prop — Rust ignores the reset of an
  // act-now prop (nothing retained), so JS needs no per-key table.
  assert.deepEqual(buildUpdateOp(1, { value: "a", scrollTop: 5 }, {}).unset, [
    "value",
    "scrollTop",
  ]);
});

test("selection halves travel independently (Rust applies the merged pair)", () => {
  const op = buildUpdateOp(
    1,
    { selectionStart: 0, selectionEnd: 2 },
    { selectionStart: 0, selectionEnd: 7 },
  );
  assert.deepEqual(op.props, { selectionEnd: 7 });
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

test("booleans cross as values — false included", () => {
  // Rust decodes an explicit `false` as a set (a bool attribute resets to
  // it), so turning a flag off is an ordinary value change.
  const off = buildUpdateOp(1, { flipX: true }, { flipX: false });
  assert.deepEqual(off.props, { flipX: false });
  assert.equal(off.unset, undefined);

  // Appearing as `false` crosses too (explicit is explicit).
  assert.deepEqual(buildUpdateOp(1, {}, { flipX: false }).props, {
    flipX: false,
  });

  // Dropping the prop resets it.
  assert.deepEqual(buildUpdateOp(1, { flipX: true }, {}).unset, ["flipX"]);
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

  // Dropping the painter rides `unset` (Rust ignores it — `draw` is act-now,
  // the retained pixels stay).
  assert.deepEqual(buildUpdateOp(1, { draw: (ctx) => ctx.fill() }, {}).unset, [
    "draw",
  ]);
});

test("handlerEvent maps the handler space only", () => {
  assert.equal(handlerEvent("onClick"), "click");
  assert.equal(handlerEvent("onPointerDown"), "pointerDown");
  assert.equal(handlerEvent("onChange"), "change");
  assert.equal(handlerEvent("onValueChange"), "valueChange");
  // `on` + a lowercase letter (or nothing) is an ordinary prop.
  assert.equal(handlerEvent("once"), null);
  assert.equal(handlerEvent("on"), null);
  assert.equal(handlerEvent("offset"), null);
});

test("every prop crosses generically; closures and children don't", () => {
  const props = serializeProps(99, {
    entity: 5n, // bigint from typed bindings → plain number on the wire
    offset: [0, 1, 0],
    cx: 5,
    fill: "red",
    madeUp: { any: "value" }, // Rust decides (warns unknownProp)
    onValueChange: () => {}, // a custom element's own event
    format: () => {}, // a non-handler function never crosses
    children: [],
  });
  assert.deepEqual(props, {
    entity: 5,
    offset: [0, 1, 0],
    cx: 5,
    fill: "red",
    madeUp: { any: "value" },
    onValueChange: true,
  });
});

test("flat attributes diff per key, structurally", () => {
  // An `<anchor>` offset change sends only the offset.
  const op = buildUpdateOp(
    1,
    { entity: 5, offset: [0, 1, 0] },
    { entity: 5, offset: [0, 2, 0] },
    "anchor",
  );
  assert.deepEqual(op, {
    op: "update",
    id: 1,
    kind: "anchor",
    props: { offset: [0, 2, 0] },
  });
  // Fresh prop bags with identical values are silent (structural compare).
  const bag = () => ({ entity: 7, offset: [0, 1, 0], scale: { min: 0.4 } });
  assert.equal(buildUpdateOp(1, bag(), bag(), "anchor"), null);
  // An `{ animated }` wrapper on an svg attr is an ordinary object value.
  const wrapper = { animated: { id: 7 }, seed: 4 };
  assert.deepEqual(buildUpdateOp(1, { r: 4 }, { r: wrapper }, "circle").props, {
    r: wrapper,
  });
});

test("the update op names its kind before props", () => {
  const op = buildUpdateOp(1, {}, { name: "x" }, "text", "textSpan");
  assert.deepEqual(Object.keys(op), ["op", "id", "kind", "props"]);
  assert.equal(op.kind, "textSpan");
  // Rust reads `kind` before `props` as the JSON streams by.
  assert.ok(
    JSON.stringify(op).indexOf('"kind"') <
      JSON.stringify(op).indexOf('"props"'),
  );
});

test("name: crosses under its own wire field, set/rename/unset", () => {
  // Mount-time delta from unnamed → named.
  assert.deepEqual(buildUpdateOp(1, {}, { name: "hud" }).props, {
    name: "hud",
  });
  // Rename.
  assert.deepEqual(buildUpdateOp(1, { name: "hud" }, { name: "hud2" }).props, {
    name: "hud2",
  });
  // Same name: no op.
  assert.equal(buildUpdateOp(1, { name: "hud" }, { name: "hud" }), null);
  // Dropped: rides `unset` under the same wire name (no `target` alias —
  // `<surface>` binds its texture with `target` like `<portal>` does).
  assert.deepEqual(buildUpdateOp(1, { name: "hud" }, {}).unset, ["name"]);
});

test("surface/portal target: passes through by name", () => {
  assert.deepEqual(buildUpdateOp(1, {}, { target: "monitor" }).props, {
    target: "monitor",
  });
  assert.deepEqual(buildUpdateOp(1, { target: "monitor" }, {}).unset, [
    "target",
  ]);
});
