// The devtools editor's field tables: every style wire-field name with a coarse
// value category (for pre-flight validation of inline edits), plus the safelist
// of editable top-level props.
//
// STYLE_FIELDS must list every entry of `protocol.rs`'s `with_style_fields!`
// table — a Rust test (`devtools.rs::js_style_field_table_covers_every_style_field`)
// `include_str!`s this file and asserts each wire name appears as a key, so a
// new style field can't silently go un-editable.

/** Coarse wire-value shapes, checked before an edit crosses the bridge. The
 *  Rust deserializers degrade malformed *strings* gracefully (warn + default),
 *  so these only need to catch structurally wrong values (which would throw a
 *  TypeError in `op_flush` and cost the whole batch). */
export type FieldCategory =
  | "keyword" // enum/string values ("flex", "absolute", a font name…)
  | "number" // plain numbers (flexGrow, zIndex, opacity…)
  | "length" // number or unit string (px number, "50%", "auto"…)
  | "color" // CSS color string
  | "rect" // number, shorthand string, or per-side object
  | "boolean"
  | "string"
  | "json"; // structured objects (transform, gradients, transitions…)

export const STYLE_FIELDS: Record<string, FieldCategory> = {
  // display / box model
  display: "keyword",
  boxSizing: "keyword",
  positionType: "keyword",
  overflowX: "keyword",
  overflowY: "keyword",
  scrollbarWidth: "number",
  // inset
  left: "length",
  right: "length",
  top: "length",
  bottom: "length",
  // size
  width: "length",
  height: "length",
  minWidth: "length",
  minHeight: "length",
  maxWidth: "length",
  maxHeight: "length",
  aspectRatio: "number",
  // alignment
  alignItems: "keyword",
  justifyItems: "keyword",
  alignSelf: "keyword",
  justifySelf: "keyword",
  alignContent: "keyword",
  justifyContent: "keyword",
  // spacing
  margin: "rect",
  padding: "rect",
  border: "rect",
  // flex
  flexDirection: "keyword",
  flexWrap: "keyword",
  flexGrow: "number",
  flexShrink: "number",
  flexBasis: "length",
  gap: "length",
  rowGap: "length",
  columnGap: "length",
  // grid
  gridAutoFlow: "keyword",
  gridTemplateRows: "json",
  gridTemplateColumns: "json",
  gridAutoRows: "json",
  gridAutoColumns: "json",
  gridRow: "json",
  gridColumn: "json",
  // paint
  backgroundColor: "color",
  borderColor: "json", // color string or per-side object
  borderRadius: "rect",
  outline: "json",
  boxShadow: "json",
  filter: "json",
  backdropFilter: "json",
  backgroundGradient: "json",
  borderGradient: "json",
  zIndex: "number",
  globalZIndex: "number",
  focusPolicy: "keyword",
  cursor: "keyword",
  scrollbar: "json",
  transform: "json",
  transform3d: "json",
  opacity: "number",
  groupAlpha: "boolean",
  cache: "keyword",
  transition: "json",
  // text
  color: "color",
  fontSize: "length",
  fontWeight: "length", // number or keyword ("bold")
  fontFamily: "keyword",
  textAlign: "keyword",
  lineHeight: "length",
  letterSpacing: "length",
  textShadow: "json",
  lineBreak: "keyword",
};

/** Top-level props the inspector lets you edit. Everything else (handlers,
 *  opaque objects like `animated`/`anchor`, structural props) is read-only. */
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
        : "expected a number, shorthand string, or per-side object";
    case "json":
      return null;
  }
}
