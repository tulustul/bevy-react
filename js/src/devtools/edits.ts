// Devtools inline editing: build a raw `Op::Update` for the target node and
// send it through the NORMAL op pipeline (`op_flush` → `merge_delta` →
// `apply_style_masked`), so merge semantics, dirty groups, and the Rust props
// cache all behave exactly as if React had sent the change. Semantics are
// deliberately TRANSIENT, Chrome-style: the edit applies now, and the next app
// commit that touches the same field stomps it (one that doesn't leaves it).
//
// Failure containment: a structurally invalid value makes `op_flush` throw a
// TypeError and lose the WHOLE batch, so an edit is (1) pre-validated against
// the field tables, (2) flushed in ISOLATION — `flush()` first drains React's
// own pending ops, then the single edit op crosses inside try/catch. An invalid
// edit can therefore never eat app ops; it surfaces as an inline error instead.

import { flush, flushRaw, type Op, type SerializedProps } from "../bridge";
import {
  checkCategory,
  EDITABLE_PROPS,
  STYLE_FIELDS,
  type FieldCategory,
} from "./fields";
import { mirror } from "./mirror";

// Chrome-style disabled style declarations: unsetting a field drops it from
// the Rust cache AND the mirror, so the remembered value must live here (a
// vendor-module map = panel lifetime, survives Fast Refresh). Keyed node id →
// field → the raw wire value to restore on re-enable.
const disabledStyles = new Map<number, Map<string, unknown>>();

// Stable display order for a node's style rows. The mirror's style object is
// insertion-ordered, so disabling (deletes the key) and re-enabling
// (re-appends it) would otherwise bounce the row to the end of the list —
// impossible to track across repeated toggles. Fields keep their first-seen
// position for as long as they exist (live or disabled).
const styleOrder = new Map<number, string[]>();

/** The node's style fields — `live` merged with the disabled set — in stable
 *  first-seen order. Fields gone entirely vacate their slot; new ones append. */
export function orderedStyleFields(
  id: number,
  live: readonly string[],
  disabled: Iterable<string>,
): string[] {
  const present = new Set([...live, ...disabled]);
  const order = (styleOrder.get(id) ?? []).filter((f) => present.has(f));
  for (const field of present) {
    if (!order.includes(field)) order.push(field);
  }
  styleOrder.set(id, order);
  return order;
}

/** The disabled declarations for a node, pruned against the mirror: entries
 *  whose node unmounted are dropped, and a field present in the node's live
 *  style again (the app re-committed it, or a re-enable landed) wins and
 *  clears its disabled memory — the same transient semantics as edits. */
export function disabledFor(id: number): ReadonlyMap<string, unknown> {
  for (const [nodeId] of disabledStyles) {
    if (!mirror.get(nodeId)) disabledStyles.delete(nodeId);
  }
  for (const [nodeId] of styleOrder) {
    if (!mirror.get(nodeId)) styleOrder.delete(nodeId);
  }
  const fields = disabledStyles.get(id);
  const node = mirror.get(id);
  if (!fields || !node) return new Map();
  for (const field of fields.keys()) {
    if (field in node.style) fields.delete(field);
  }
  if (fields.size === 0) disabledStyles.delete(id);
  return fields;
}

/** Disable a style declaration: remember its current value, then unset it.
 *  Returns an inline error, or `null` on success. */
export function disableStyle(
  id: number,
  field: string,
  value: unknown,
): string | null {
  const error = applyStyleEdit(id, field, "");
  if (error) return error;
  let fields = disabledStyles.get(id);
  if (!fields) disabledStyles.set(id, (fields = new Map()));
  fields.set(field, value);
  return null;
}

/** Re-enable a disabled declaration by re-applying the remembered value. */
export function enableStyle(id: number, field: string): string | null {
  const value = disabledStyles.get(id)?.get(field);
  if (value === undefined) return null; // nothing remembered — already live
  // Mirror values are raw wire JSON, so this round-trips through the editor's
  // JSON-or-string coercion unchanged (same rule as `formatValue`).
  const error = applyStyleEdit(
    id,
    field,
    typeof value === "string" ? value : JSON.stringify(value),
  );
  if (error) return error;
  disabledStyles.get(id)?.delete(field);
  return null;
}

/** Apply an inline style edit. Empty input unsets the field. Returns an error
 *  message to show inline, or `null` on success. */
export function applyStyleEdit(
  id: number,
  field: string,
  raw: string,
): string | null {
  const category = STYLE_FIELDS[field];
  if (!category) return `unknown style field "${field}"`;
  return applyEdit(id, field, raw, category, /* isStyle */ true);
}

/** Apply an inline prop edit (safelisted props only). */
export function applyPropEdit(
  id: number,
  field: string,
  raw: string,
): string | null {
  const category = EDITABLE_PROPS[field];
  if (!category) return `"${field}" is not editable`;
  return applyEdit(id, field, raw, category, /* isStyle */ false);
}

function applyEdit(
  id: number,
  field: string,
  raw: string,
  category: FieldCategory,
  isStyle: boolean,
): string | null {
  const trimmed = raw.trim();
  let op: Op;
  if (trimmed === "") {
    // Empty input = reset the field to its default (Chrome's delete-value).
    op = isStyle
      ? { op: "update", id, props: {}, styleUnset: [field] }
      : { op: "update", id, props: {}, unset: [field] };
  } else {
    // `12` → number, `true` → boolean, `{…}` → object; anything that isn't
    // valid JSON stays a string (`50%`, `#ff0000`, `flex`).
    let value: unknown;
    try {
      value = JSON.parse(trimmed);
    } catch {
      value = trimmed;
    }
    const error = checkCategory(category, value);
    if (error) return error;
    // A bool prop set to `false` must ride `unset`: Rust's `merge_bool!` only
    // honors `true` in a delta (same contract as the reconciler's diff).
    op = isStyle
      ? { op: "update", id, props: { style: { [field]: value } } }
      : category === "boolean" && value === false
        ? { op: "update", id, props: {}, unset: [field] }
        : { op: "update", id, props: { [field]: value } as SerializedProps };
  }
  // Isolation: drain React's own pending ops first, then cross alone. The
  // bridge tap on a successful flush updates the mirror, so the inspector
  // re-renders with the applied value for free.
  flush();
  try {
    flushRaw([op], /* devtools */ true);
  } catch (e) {
    return `rejected by Bevy: ${e instanceof Error ? e.message : String(e)}`;
  }
  return null;
}
