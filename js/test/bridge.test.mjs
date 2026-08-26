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
const { buildUpdateOp, packAnchorProps, packShapeProps, valuesEqual } =
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

test("bool flag props ride unset when turned off, never send false", () => {
  // Rust's merge_delta only honors `true` for plain-bool fields; an explicit
  // `false` in the delta would be a silent no-op (the flip-disable bug).
  const off = buildUpdateOp(1, { flipX: true }, { flipX: false });
  assert.deepEqual(off.unset, ["flipX"]);
  assert.deepEqual(off.props, {});

  // Appearing as `false` is the default — nothing crosses.
  assert.equal(buildUpdateOp(1, {}, { flipX: false }), null);

  // Turning on takes the normal set path.
  const on = buildUpdateOp(1, { flipX: false }, { flipX: true });
  assert.deepEqual(on.props, { flipX: true });
  assert.equal(on.unset, undefined);

  // The other bool flags share the contract.
  const multi = buildUpdateOp(1, { multiline: true }, { multiline: false });
  assert.deepEqual(multi.unset, ["multiline"]);
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

test("packAnchorProps packs entity/offset/scale into one anchor object", () => {
  const style = { width: 10 };
  const onClick = () => {};
  const packed = packAnchorProps({
    entity: 5n, // bigint from typed bindings → plain number on the wire
    offset: [0, 1, 0],
    style,
    onClick,
  });
  assert.equal(packed.anchor.entity, 5);
  assert.deepEqual(packed.anchor.offset, [0, 1, 0]);
  assert.equal(packed.anchor.scale, undefined);
  // The flat props are stripped; everything else passes through untouched.
  assert.equal(packed.entity, undefined);
  assert.equal(packed.offset, undefined);
  assert.equal(packed.style, style);
  assert.equal(packed.onClick, onClick);

  // No entity → no anchor binding at all.
  assert.equal(packAnchorProps({ style }).anchor, undefined);
});

test("anchor delta re-sends the full packed object", () => {
  // An offset-only change must carry the whole anchor object — Rust replaces
  // it atomically (OBJECT_PROP_KEYS), it can't merge a partial one.
  const op = buildUpdateOp(
    1,
    packAnchorProps({ entity: 5, offset: [0, 1, 0] }),
    packAnchorProps({ entity: 5, offset: [0, 2, 0] }),
  );
  assert.equal(op.props.anchor.entity, 5);
  assert.deepEqual(op.props.anchor.offset, [0, 2, 0]);
});

test("anchor re-render with identical values is silent", () => {
  // Fresh prop bags every render (as React produces them) — structural
  // compare, not identity.
  const bag = () => ({ entity: 7, offset: [0, 1, 0], scale: { min: 0.4 } });
  assert.equal(
    buildUpdateOp(1, packAnchorProps(bag()), packAnchorProps(bag())),
    null,
  );
});

test("dropping the anchor entity unsets the binding", () => {
  const op = buildUpdateOp(
    1,
    packAnchorProps({ entity: 5, offset: [0, 1, 0] }),
    packAnchorProps({ offset: [0, 1, 0] }),
  );
  assert.deepEqual(op.unset, ["anchor"]);
});

test("packShapeProps folds shape attrs into one shape object", () => {
  const onClick = () => {};
  const points = [0, 0, 10, 0, 5, 8];
  const packed = packShapeProps({
    cx: 5,
    cy: 6,
    r: 4,
    fill: "red",
    strokeWidth: 2,
    points,
    onClick,
    children: [],
  });
  assert.deepEqual(packed.shape, {
    cx: 5,
    cy: 6,
    r: 4,
    fill: "red",
    strokeWidth: 2,
    points,
  });
  // The flat attrs are stripped; non-attr keys pass through untouched (they
  // must all land in a diff bucket — see the invariant at packShapeProps).
  assert.equal(packed.cx, undefined);
  assert.equal(packed.fill, undefined);
  assert.equal(packed.onClick, onClick);

  // No shape attr present → no shape key at all (so removing the last attr
  // diffs as `unset: ["shape"]`, not an empty object).
  assert.equal("shape" in packShapeProps({ onClick }), false);
  assert.equal("shape" in packShapeProps({ cx: undefined }), false);

  // An `{ animated }` binding wrapper on a numeric attr passes through the
  // fold as an opaque object — Rust decodes it at its serde boundary; the JS
  // side needs no special casing.
  const wrapper = { animated: { id: 7 }, seed: 4 };
  assert.equal(packShapeProps({ r: wrapper }).shape.r, wrapper);
});

test("shape delta re-sends the full packed object", () => {
  // A one-attr change must carry the whole shape object — Rust replaces it
  // atomically (OBJECT_PROP_KEYS), it can't merge a partial one.
  const op = buildUpdateOp(
    1,
    packShapeProps({ cx: 5, cy: 6, r: 4, fill: "red" }),
    packShapeProps({ cx: 5, cy: 6, r: 9, fill: "red" }),
  );
  assert.deepEqual(op.props.shape, { cx: 5, cy: 6, r: 9, fill: "red" });
  assert.equal(op.unset, undefined);
});

test("shape re-render with identical values is silent", () => {
  // Fresh prop bags every render (as React produces them) — structural
  // compare, not identity. No leftover key may leak past the packing, or this
  // would emit an empty `{op:"update",props:{}}` every render.
  const bag = () => ({
    d: "M 0 0 L 10 10",
    fill: "none",
    stroke: "#abc",
    strokeLinejoin: "round",
    onClick: () => {},
  });
  assert.equal(
    buildUpdateOp(1, packShapeProps(bag()), packShapeProps(bag())),
    null,
  );
});

test("shape transition rides the folded shape object", () => {
  // `transition` is a shape attr key: it folds into `props.shape` (atomic
  // replace like every other attr), so the Rust side finds the spec inside
  // the decoded ShapeAttrs — shapes have no `style` to carry it.
  const transition = { cx: { duration: 200 }, r: { stiffness: 120 } };
  const packed = packShapeProps({ cx: 5, r: 4, transition });
  assert.deepEqual(packed.shape, { cx: 5, r: 4, transition });
  assert.equal(packed.transition, undefined);

  // A spec-only change re-sends the whole shape object (atomic replace).
  const op = buildUpdateOp(
    1,
    packShapeProps({ cx: 5, transition: { cx: { duration: 100 } } }),
    packShapeProps({ cx: 5, transition: { cx: { duration: 300 } } }),
  );
  assert.deepEqual(op.props.shape, {
    cx: 5,
    transition: { cx: { duration: 300 } },
  });
});

test("removing every shape attr unsets the shape object", () => {
  const op = buildUpdateOp(
    1,
    packShapeProps({ cx: 5, r: 4 }),
    packShapeProps({}),
  );
  assert.deepEqual(op.unset, ["shape"]);
  assert.deepEqual(op.props, {});
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
