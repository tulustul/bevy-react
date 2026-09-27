// The devtools editor's field tables: every style wire-field name with a coarse
// value category (for pre-flight validation of inline edits), and per element
// kind the editable and act-now props.
//
// Both come from Rust at install: the style registry (core properties and the
// app's own, `app.add_react_style`) answers `devtools.styleFields`, the element
// registry (core elements and every feature/app one) `devtools.elements` — see
// `installStyleFields` / `installElements`.

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

/** One element's props as the devtools see them — the registry's answer to
 *  `devtools.elements` (see `api.ts`'s `DevtoolsElement`). */
export interface ElementInfo {
  /** Attribute name → its editor category (`null` when not a scalar the
   *  inspector edits inline). */
  editable: Map<string, FieldCategory>;
  /** Act-now props: act once, never retained (the mirror drops them). */
  actNow: Set<string>;
}

/** The element table by kind, filled from Rust at install. Until it lands
 *  (and for an unregistered kind) every prop reads as retained and
 *  read-only. */
const ELEMENTS = new Map<string, ElementInfo>();

/** The common scalar props the inspector edits on elements with the matching
 *  group (the act-now scroll offsets are editable too — an edit acts once). */
const COMMON_EDITABLE: Record<string, [string, FieldCategory][]> = {
  scroll: [
    ["scrollTop", "number"],
    ["scrollLeft", "number"],
    ["scrollStep", "number"],
  ],
};

/** The common act-now props (never retained on any element). */
const COMMON_ACT_NOW = ["scrollTop", "scrollLeft"];

/** The categories an inline edit can produce from typed text. */
const SCALAR: ReadonlySet<FieldCategory> = new Set([
  "string",
  "number",
  "boolean",
  "color",
  "keyword",
  "length",
]);

/** Fill the element table from the registry's answer. */
export function installElements(
  elements: readonly {
    name: string;
    attrs: readonly {
      name: string;
      category: FieldCategory;
      actNow: boolean;
      typed: boolean;
    }[];
    common: readonly string[];
  }[],
): void {
  for (const el of elements) {
    const editable = new Map<string, FieldCategory>();
    const actNow = new Set(COMMON_ACT_NOW);
    for (const attr of el.attrs) {
      if (attr.actNow) actNow.add(attr.name);
      // Wire-only attributes (a canvas `drawAppend`) are never authored.
      if (attr.typed && SCALAR.has(attr.category)) {
        editable.set(attr.name, attr.category);
      }
    }
    for (const group of el.common) {
      for (const [name, category] of COMMON_EDITABLE[group] ?? []) {
        editable.set(name, category);
      }
    }
    ELEMENTS.set(el.name, { editable, actNow });
  }
}

/** Whether `field` is an act-now prop on a `kind` element. */
export function isActNow(kind: string, field: string): boolean {
  const el = ELEMENTS.get(kind);
  return el ? el.actNow.has(field) : COMMON_ACT_NOW.includes(field);
}

/** The editor category of an inline-editable prop of a `kind` element, or
 *  `undefined` when the inspector shows it read-only. */
export function editableProp(
  kind: string,
  field: string,
): FieldCategory | undefined {
  return ELEMENTS.get(kind)?.editable.get(field);
}

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
