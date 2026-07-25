// Unit tests for the devtools warning→row matcher (`matchWarning` in
// `js/src/devtools/warnings.ts`): Rust reports invalid values as
// `(node, kind, value, message)` with no field name, and the matcher recovers
// the inspector row(s) by matching the raw value against the mirror node's
// retained wire values, narrowed by the kind table.
//
// Same esbuild-on-the-fly rig as bridge.test.mjs (extensionless TS imports).
//
// Run: npm test -w bevy-react

import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const entry = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/devtools/warnings.ts",
);
const bundled = await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  write: false,
  logLevel: "silent",
});
const code = Buffer.from(bundled.outputFiles[0].contents).toString("base64");
const { matchWarning } = await import(`data:text/javascript;base64,${code}`);

/** A minimal MirrorNode: only `style`/`props` matter to the matcher. */
const node = (style = {}, props = {}) => ({
  id: 1,
  kind: "node",
  style,
  props,
  children: [],
  parent: null,
  devtools: false,
});

test("exact-field kind matches only its own field", () => {
  const n = node({ display: "flexx", positionType: "flexx" });
  assert.deepEqual(matchWarning(n, { kind: "display", value: "flexx" }), [
    "style:display",
  ]);
});

test("overflow fans out to both axes", () => {
  const n = node({ overflowX: "scrolll", overflowY: "scrolll", width: 10 });
  assert.deepEqual(matchWarning(n, { kind: "overflow", value: "scrolll" }), [
    "style:overflowX",
    "style:overflowY",
  ]);
});

test("broad length kind scans every style field", () => {
  const n = node({ width: "aa16", height: 20, color: "red" });
  assert.deepEqual(matchWarning(n, { kind: "length", value: "aa16" }), [
    "style:width",
  ]);
});

test("same invalid value in two candidate fields flags both", () => {
  const n = node({ width: "aa16", minWidth: "aa16" });
  assert.deepEqual(matchWarning(n, { kind: "length", value: "aa16" }), [
    "style:width",
    "style:minWidth",
  ]);
});

test("rect shorthand token matches by containment", () => {
  const n = node({ padding: "1px bogus", margin: 4, width: "bogus" });
  // `width` is not a rect candidate, so only padding flags.
  assert.deepEqual(matchWarning(n, { kind: "rect", value: "bogus" }), [
    "style:padding",
  ]);
});

test("grid template token matches inside repeat()", () => {
  const n = node({ gridTemplateColumns: "repeat(3, 1frr)" });
  assert.deepEqual(matchWarning(n, { kind: "gridTrack", value: "1frr" }), [
    "style:gridTemplateColumns",
  ]);
});

test("color deep-scans structured paint values and the tint prop", () => {
  const n = node(
    { outline: { width: 2, color: "redd" }, backgroundColor: "blue" },
    { tint: "redd" },
  );
  assert.deepEqual(matchWarning(n, { kind: "color", value: "redd" }), [
    "style:outline",
    "prop:tint",
  ]);
});

test("gradient stop colors deep-scan through arrays", () => {
  const n = node({
    backgroundGradient: { stops: [{ color: "red" }, { color: "greeen" }] },
  });
  assert.deepEqual(matchWarning(n, { kind: "color", value: "greeen" }), [
    "style:backgroundGradient",
  ]);
});

test("unknown object keys match too (rect side, scrollbar field)", () => {
  const n = node({ padding: { top: 1, middle: 2 } });
  assert.deepEqual(matchWarning(n, { kind: "rect", value: "middle" }), [
    "style:padding",
  ]);
});

test("variant style props are always scanned", () => {
  const n = node({}, { hoverStyle: { backgroundColor: "redd" } });
  assert.deepEqual(matchWarning(n, { kind: "color", value: "redd" }), [
    "prop:hoverStyle",
  ]);
});

test("styleBinding kind matches the variant carrying the ignored wrapper", () => {
  const n = node({}, { hoverStyle: { opacity: { animated: { id: 3 } } } });
  assert.deepEqual(
    matchWarning(n, { kind: "styleBinding", value: "hoverStyle" }),
    ["prop:hoverStyle"],
  );
});

test("no match drops the warning (empty result)", () => {
  const n = node({ width: 10 });
  assert.deepEqual(matchWarning(n, { kind: "color", value: "redd" }), []);
});
