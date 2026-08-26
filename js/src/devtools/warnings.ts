// Resolves a Rust-reported invalid-value warning to concrete inspector rows.
//
// Rust ships `(node, kind, value, message)` only — the serde visitors that
// catch a bad value don't know which field they were decoding (`LengthVisitor`
// serves width/height/inset/…), and the apply-time parsers (colors, fonts)
// know the node but not the field either. The mirror, however, retains every
// node's raw wire values, so the field is recovered here by matching the
// offending `value` against the node's retained style/props — narrowed first
// by a kind → candidate-fields table so `"1fr"` in a grid template can't flag
// an unrelated field that happens to hold the same string.
//
// Accepted imprecision: two fields of one node holding the same invalid string
// both get flagged (they're both invalid, so this usually reads correctly);
// a warning whose value matches nothing is dropped (it stays in the Bevy log).

import type { MirrorNode } from "./mirror";

/** Candidate rows per warning kind. `style`/`props` name exact fields; a kind
 *  with no entry (or the broad `length`/`angle`/`time` kinds) falls back to
 *  scanning every style field. Kind literals come from the Rust warn sites:
 *  `protocol.rs`'s `decode_warn` calls (`keyword_fields!` kinds, `"length"`,
 *  `"rect"`, …) and the `diag::report` calls in `ui_map.rs`/`cursor.rs`. */
const KIND_FIELDS: Record<string, { style?: string[]; props?: string[] }> = {
  // keyword_fields! kinds — the kind IS the field (overflow fans out).
  display: { style: ["display"] },
  boxSizing: { style: ["boxSizing"] },
  positionType: { style: ["positionType"] },
  overflow: { style: ["overflowX", "overflowY"] },
  alignItems: { style: ["alignItems"] },
  justifyItems: { style: ["justifyItems"] },
  alignSelf: { style: ["alignSelf"] },
  justifySelf: { style: ["justifySelf"] },
  alignContent: { style: ["alignContent"] },
  justifyContent: { style: ["justifyContent"] },
  flexDirection: { style: ["flexDirection"] },
  flexWrap: { style: ["flexWrap"] },
  gridAutoFlow: { style: ["gridAutoFlow"] },
  cache: { style: ["cache"] },
  focusPolicy: { style: ["focusPolicy"] },
  textAlign: { style: ["textAlign"] },
  lineBreak: { style: ["lineBreak"] },
  // Sized/structured decode kinds.
  fontSize: { style: ["fontSize"] },
  fontWeight: { style: ["fontWeight"] },
  rect: { style: ["margin", "padding", "border", "borderRadius"] },
  gridTrack: {
    style: [
      "gridTemplateRows",
      "gridTemplateColumns",
      "gridAutoRows",
      "gridAutoColumns",
    ],
  },
  gridPlacement: { style: ["gridRow", "gridColumn"] },
  borderColor: { style: ["borderColor"] },
  filterParams: { style: ["filter"] },
  filterUnknown: { style: ["filter"] },
  // Per-param filter animation bindings: the warning value is the wire key
  // (`filter[0].radius`); the binding lives inline in the chain entry's
  // params (`{ animated }` wrapper), so the chain's own row is flagged.
  filterBinding: { style: ["filter"] },
  backdropFilterParams: { style: ["backdropFilter"] },
  backdropFilterUnknown: { style: ["backdropFilter"] },
  // Same wire-key match as filterBinding, over the backdrop namespace.
  backdropFilterBinding: { style: ["backdropFilter"] },
  // morphFilter: decode fallbacks (bad key/name/params), the v1 caps
  // (single-pass, reserved param vecs), unknown filter names, and the
  // `morphFilter.<param>` binding warnings.
  morphFilterParams: { style: ["morphFilter"] },
  morphFilterUnknown: { style: ["morphFilter"] },
  morphFilterBinding: { style: ["morphFilter"] },
  // Whole-value gradient transitions: a retarget whose gradient structures
  // can't be paired (kind/stop count/colorSpace/position/shape) snaps
  // instead of easing; the warning value names the surface.
  gradientTransition: { style: ["backgroundGradient", "borderGradient"] },
  // Gradient-leaf animation bindings: the warning value is the wire-ish
  // address (`backgroundGradient[0].stops[1].color`); the binding lives
  // inline in the gradient entry (`{ animated }` wrapper), so the surface's
  // own row is flagged.
  gradientBinding: { style: ["backgroundGradient", "borderGradient"] },
  scrollbar: { style: ["scrollbar"] },
  // backgroundImage: decode fallbacks (bad mode keyword, missing `src`,
  // ignored `scale`) and the apply-time "element owns its image" report.
  backgroundImage: { style: ["backgroundImage"] },
  // imageRendering: a refused mode (live texture / no CPU data / an
  // unsupported format for `trilinear`) — the node keeps its source.
  imageRendering: { style: ["imageRendering"] },
  // svg-mode <image>: `atlas`/`sourceRect` are ignored (the document rasters
  // whole at laid-out size — no source texture to grid or crop).
  svgImageAttrs: { props: ["atlas", "sourceRect"] },
  // SVG shape children are Node-less (no ScrollPosition, no wheel surface):
  // `onScroll`/`onWheel` on a shape never fire. The warning value names the
  // offending prop, so the field-name match flags the exact row.
  svgShapeScroll: { props: ["onScroll", "onWheel"] },
  // JSX <svg> shape protocol: retained props hold the folded `shape` object
  // (path d, points, paints, keyword enums, transform all live inside it) and
  // the <svg> root's `viewBox` string.
  viewBox: { props: ["viewBox"] },
  // `ReactNodes::get` hit 2+ nodes sharing the name (the first one is flagged).
  nameAmbiguous: { props: ["name"] },
  shapePath: { props: ["shape"] },
  shapePoints: { props: ["shape"] },
  shapePaint: { props: ["shape"] },
  shapeEnum: { props: ["shape"] },
  shapeTransform: { props: ["shape"] },
  // Nested <text> spans are Node-less runs: layer-family styles can never
  // promote them (no layout box — the enclosing <text> is the filterable
  // surface), and pointer handlers on them never fire. The warning value
  // names the offending field/prop, so the match flags the exact row.
  spanLayerStyle: {
    style: ["filter", "backdropFilter", "morphFilter", "transform3d", "cache"],
  },
  spanHandlers: {
    props: [
      "onClick",
      "onPointerDown",
      "onPointerMove",
      "onPointerUp",
      "onPointerEnter",
      "onPointerLeave",
    ],
  },
  // Shape `transition` timing (rides the folded shape object): an unknown /
  // non-numeric attr key or a malformed per-attr spec warns and drops the key.
  shapeTransition: { props: ["shape"] },
  // Shape-attr animation bindings (the apply stage's bind-time validation):
  // the warning value is the attr's wire name (`r`), and the `{ animated }`
  // wrapper lives inline in the folded `shape` object.
  shapeBinding: { props: ["shape"] },
  // Inline `{ animated }` wrapper problems: a malformed wrapper (decode
  // sink, attributed to the style row per-op) or a wrapper in a variant
  // style, where bindings are ignored (the warning value names the variant —
  // the always-scanned variant props cover the row match).
  styleBinding: {},
  // Apply-time (runtime sink) kinds.
  color: {
    style: [
      "color",
      "backgroundColor",
      "borderColor",
      "outline",
      "boxShadow",
      "textShadow",
      "backgroundGradient",
      "borderGradient",
      "backgroundImage",
    ],
    props: ["tint"],
  },
  fontFamily: { style: ["fontFamily"] },
  cursor: { style: ["cursor"] },
  lineHeight: { style: ["lineHeight"] },
  letterSpacing: { style: ["letterSpacing"] },
};

/** The style variant props are opaque style objects under `props`; a bad value
 *  inside one (e.g. a `hoverStyle` color) should flag that prop's row, so they
 *  are always scanned in addition to the kind's own candidates. */
const VARIANT_STYLE_PROPS = ["hoverStyle", "pressStyle", "focusStyle"];

/** Whether a retained wire value "contains" the offending raw string: the
 *  value itself, a whitespace/paren-delimited token of it (rect shorthands,
 *  grid templates), or — recursing into objects/arrays — any nested string
 *  value or object key (unknown rect/borderColor sides, scrollbar fields). */
function valueMatches(value: unknown, raw: string, depth = 0): boolean {
  if (typeof value === "string") {
    return value === raw || value.split(/[\s(),]+/).includes(raw);
  }
  if (depth >= 4 || value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) {
    return value.some((v) => valueMatches(v, raw, depth + 1));
  }
  for (const [k, v] of Object.entries(value)) {
    if (k === raw || valueMatches(v, raw, depth + 1)) return true;
  }
  return false;
}

/** Inspector row keys (`style:width` / `prop:tint`) of `node`'s fields whose
 *  retained value matches the warning. Empty when nothing matches. */
export function matchWarning(
  node: MirrorNode,
  warning: { kind: string; value: string },
): string[] {
  const spec = KIND_FIELDS[warning.kind];
  const out: string[] = [];
  // No table entry (broad kinds like length/angle/time, or a future kind this
  // table lags behind on) → every style field is a candidate.
  // A warning whose value *names* the field flags that field directly (e.g.
  // `styleBinding`'s "hoverStyle": bindings ignored in a variant style).
  const styleFields = spec ? (spec.style ?? []) : Object.keys(node.style);
  for (const field of styleFields) {
    if (
      field in node.style &&
      (field === warning.value ||
        valueMatches(node.style[field], warning.value))
    ) {
      out.push(`style:${field}`);
    }
  }
  const propFields = [...(spec?.props ?? []), ...VARIANT_STYLE_PROPS];
  for (const field of propFields) {
    if (
      field in node.props &&
      (field === warning.value ||
        valueMatches(node.props[field], warning.value))
    ) {
      out.push(`prop:${field}`);
    }
  }
  return out;
}
