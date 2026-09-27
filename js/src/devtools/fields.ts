// The devtools editor's field tables: every style wire-field name with a coarse
// value category (for pre-flight validation of inline edits), plus the safelist
// of editable top-level props.
//
// STYLE_FIELDS comes from Rust: the style registry (core properties and the
// app's own, `app.add_react_style`) answers `devtools.styleFields` once at
// install — see `installStyleFields`.

/** Coarse wire-value shapes, checked before an edit crosses the bridge. The
 *  Rust deserializers degrade malformed *strings* gracefully (warn + default),
 *  so these only need to catch structurally wrong values (which would throw a
 *  TypeError in `op_flush` and cost the whole batch). */
export type FieldCategory =
  | "keyword" // enum/string values ("flex", "absolute", a font name…)
  | "number" // plain numbers (flexGrow, zIndex, opacity…)
  | "length" // number or unit string (px number, "50%", "auto"…)
  | "color" // CSS color string
  | "rect" // number, shorthand string, per-side object, or axis pair
  | "boolean"
  | "string"
  | "json"; // structured objects (transform, gradients, transitions…)

/** Every registered style property's wire name → its category. Empty until
 *  the `devtools.styleFields` response lands (right after install). */
export const STYLE_FIELDS: Record<string, FieldCategory> = {};

let styleFieldsVersion = 0;
const styleFieldsListeners = new Set<() => void>();

/** Fill `STYLE_FIELDS` from the registry's answer and notify subscribers. */
export function installStyleFields(
  fields: readonly { name: string; category: FieldCategory }[],
): void {
  for (const { name, category } of fields) STYLE_FIELDS[name] = category;
  styleFieldsVersion++;
  for (const cb of styleFieldsListeners) cb();
}

/** `useSyncExternalStore` pair: re-render once the table lands. */
export function subscribeStyleFields(cb: () => void): () => void {
  styleFieldsListeners.add(cb);
  return () => styleFieldsListeners.delete(cb);
}
export function getStyleFieldsVersion(): number {
  return styleFieldsVersion;
}

/** Every wire field of an SVG shape child's folded `shape` object
 *  (`svg/protocol.rs`'s `ShapeAttrs`) — the inspector renders the object as
 *  its own read-only section, one row per present field, and flags keys not
 *  listed here as unknown. A Rust test
 *  (`devtools.rs::js_shape_field_table_covers_shape_attrs`) `include_str!`s
 *  this file and asserts each wire name appears, so extend BOTH that list and
 *  this table when a `ShapeAttrs` field lands. */
export const SHAPE_FIELDS: Record<string, FieldCategory> = {
  // geometry (SVG user units)
  x: "number",
  y: "number",
  width: "number",
  height: "number",
  cx: "number",
  cy: "number",
  r: "number",
  rx: "number",
  ry: "number",
  x1: "number",
  y1: "number",
  x2: "number",
  y2: "number",
  points: "json", // flat number array [x0, y0, x1, y1, …]
  d: "string", // SVG path data
  // paint — the wire carries CSS color strings (or the "none" keyword,
  // still a string, so the color category's check holds)
  fill: "color",
  stroke: "color",
  strokeWidth: "number",
  opacity: "number",
  fillRule: "keyword",
  strokeLinecap: "keyword",
  strokeLinejoin: "keyword",
  transform: "string", // SVG transform list ("translate(10 20) rotate(45)")
  transition: "json", // per-attr easing timing { cx: { duration, … }, … }
};

/** Top-level props the inspector lets you edit. Everything else (handlers,
 *  opaque objects like `anchor`, structural props) is read-only. */
export const EDITABLE_PROPS: Record<string, FieldCategory> = {
  value: "string",
  src: "string",
  tint: "color",
  maxLength: "number",
  ariaLabel: "string",
  scrollTop: "number",
  scrollLeft: "number",
  scrollStep: "number",
  flipX: "boolean",
  flipY: "boolean",
};

/** Validate a coerced value against its field's category. Returns an error
 *  message, or `null` when the value may cross the bridge. */
export function checkCategory(
  category: FieldCategory,
  value: unknown,
): string | null {
  const t = typeof value;
  switch (category) {
    case "number":
      return t === "number" ? null : "expected a number";
    case "boolean":
      return t === "boolean" ? null : "expected true or false";
    case "keyword":
    case "color":
    case "string":
      return t === "string" ? null : "expected a string";
    case "length":
      return t === "number" || t === "string"
        ? null
        : "expected a number or unit string";
    case "rect":
      return t === "number" ||
        t === "string" ||
        (t === "object" && value !== null)
        ? null
        : "expected a number, shorthand string, or side/axis object";
    case "json":
      return null;
  }
}
