// SVG shape wire packing — the JS mirror of the Rust `svg` module's ownership
// (svg owns the shape wire types; the bridge references them). A shape
// element's flat JSX attributes (`cx`/`r`/`fill`/…) fold into the single
// opaque `shape` object the wire carries; `bridge.ts` re-exports these for the
// reconciler (`renderer.ts` packs via `packForWire`).

// The SVG shape intrinsics whose flat attributes fold into a single `shape`
// object on the wire (see `packShapeProps`). `<svg>` itself is not one — its
// `viewBox` passes through by name like any element attribute.
export const SHAPE_KINDS: ReadonlySet<string> = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "g",
]);

// Every SVG shape attribute, in wire order: geometry first, then paint, then
// the transform. The wire names ARE the React prop names (camelCase — Rust's
// `ShapeAttrs` deserializes `rename_all = "camelCase"`).
const SHAPE_ATTR_KEYS = [
  "d",
  "x",
  "y",
  "width",
  "height",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
  "fill",
  "stroke",
  "strokeWidth",
  "opacity",
  "fillRule",
  "strokeLinecap",
  "strokeLinejoin",
  "transform",
  // Not an SVG attribute but a bevy-react extension: per-attr easing timing.
  // Shapes have no `style` to carry a transition, so the spec folds into the
  // shape object like everything else (atomic replace — a spec-only change
  // re-sends the whole object).
  "transition",
] as const;

const SHAPE_ATTR_KEY_SET: ReadonlySet<string> = new Set(SHAPE_ATTR_KEYS);

// Package an SVG shape child's flat attributes (`cx`/`r`/`fill`/…) into the
// single opaque `shape` object the wire carries (the anchor precedent: the
// renderer calls this for both the create and update prop bags, so delta diffs
// compare packed forms and a change re-sends the whole object — Rust replaces
// it atomically). Values pass through untouched — numbers, strings, and flat
// number arrays; Rust parses `d`/`points`/`transform`/colors at its serde
// boundary. With no shape attr present the result has NO `shape` key, so the
// structural diff emits `unset: ["shape"]` when the last attr is removed.
//
// Invariant (the `buildUpdateOp` fallthrough gotcha): every key left in the
// returned bag must be consumed by a diff bucket — handlers by
// HANDLER_PROP_KEYS, `children`/`key` skipped, `shape` by OBJECT_PROP_KEYS.
// A leftover unrecognized key would make every re-render emit an empty
// `{op:"update",props:{}}` op, so a new shape attribute MUST be added to
// SHAPE_ATTR_KEYS (and a new non-attr prop to a bucket).
export function packShapeProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  let shape: Record<string, unknown> | undefined;
  for (const key of SHAPE_ATTR_KEYS) {
    const value = props[key];
    if (value !== undefined) (shape ??= {})[key] = value;
  }
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!SHAPE_ATTR_KEY_SET.has(key)) rest[key] = value;
  }
  if (shape) rest.shape = shape;
  return rest;
}
