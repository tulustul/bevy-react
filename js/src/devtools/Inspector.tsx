// The inspector pane: the selected node's style + props, from the op mirror
// (raw wire values, so what you see is exactly what you can type back). Values
// edit inline — click, type, Enter applies / Escape cancels — with transient
// semantics (see edits.ts). Invalid input stays in the editor with
// an inline error and never crosses the bridge (or costs app ops).

import { useEffect, useState } from "react";
import { addEventListener } from "../bridge";
import {
  applyPropEdit,
  applyStyleEdit,
  disabledFor,
  disableStyle,
  enableStyle,
  orderedStyleFields,
} from "./edits";
import { EDITABLE_PROPS, SHAPE_FIELDS, STYLE_FIELDS } from "./fields";
import { mirror } from "./mirror";
import { theme } from "./theme";
import { useMirrorVersion } from "./TreeView";

export function Inspector({ id }: { id: number | null }) {
  useMirrorVersion();
  // Which row is editing, if any — exclusive: opening one editor closes
  // the previous (its draft is discarded). Keyed `style:{field}` /
  // `prop:{field}` / `"add"` so style and prop rows can't collide.
  const [activeField, setActiveField] = useState<string | null>(null);
  const node = id != null ? mirror.get(id) : undefined;
  if (id == null || !node) {
    return (
      <text style={{ color: theme.textDim, fontSize: 11, margin: 8 }}>
        Select a node to inspect it.
      </text>
    );
  }
  // An SVG shape child's folded `shape` object renders as its own section
  // (one row per present field) rather than as one JSON blob in props.
  const props = Object.entries(node.props).filter(([key]) => key !== "shape");
  const shape =
    typeof node.props.shape === "object" && node.props.shape !== null
      ? (node.props.shape as Record<string, unknown>)
      : undefined;
  // Disabled declarations: gone from the live style (and the
  // mirror), listed from the remembered-value store, dimmed + unchecked.
  // Rendered as ONE list in stable first-seen order (`orderedStyleFields`),
  // so toggling a row off and on never moves it.
  const disabled = disabledFor(id);
  const styleFields = orderedStyleFields(
    id,
    Object.keys(node.style),
    disabled.keys(),
  );
  const rowProps = (rowKey: string) => ({
    active: activeField === rowKey,
    onActivate: () => setActiveField(rowKey),
    onDone: () => setActiveField(null),
  });
  return (
    <node style={{ flexDirection: "column", padding: { bottom: 6 } }}>
      <SectionHeader
        label={`<${node.kind}> #${node.id}`}
        hint={node.devtools ? "devtools" : undefined}
      />
      <SectionHeader label="style" />
      {styleFields.map((field) => {
        const isDisabled = !(field in node.style);
        const value = isDisabled ? disabled.get(field) : node.style[field];
        // Row flags: Rust-reported invalid values (the mirror's
        // per-row warnings), plus the pure-JS rule for a style key Rust's
        // serde silently drops (it never even warns on those).
        const warning = isDisabled
          ? undefined
          : (node.warnings?.get(`style:${field}`) ??
            (field in STYLE_FIELDS
              ? undefined
              : `unknown style field "${field}" (ignored by Bevy)`));
        return (
          <EditRow
            key={field}
            field={field}
            value={value}
            editable={!isDisabled}
            warning={warning}
            apply={(raw) => applyStyleEdit(id, field, raw)}
            toggle={
              isDisabled
                ? { checked: false, onToggle: () => enableStyle(id, field) }
                : field in STYLE_FIELDS
                  ? {
                      checked: true,
                      onToggle: () => {
                        // Close the editor first if this row is being edited.
                        if (activeField === `style:${field}`) {
                          setActiveField(null);
                        }
                        disableStyle(id, field, value);
                      },
                    }
                  : undefined
            }
            {...rowProps(`style:${field}`)}
          />
        );
      })}
      <AddStyleRow id={id} {...rowProps("add")} />
      {shape && (
        <>
          <SectionHeader label="shape" />
          {/* Shape decode warnings (bad paint/path/points/…) attribute to the
              whole folded object (it replaces atomically), so the Rust-
              reported warning renders once under the header. */}
          {node.warnings?.get("prop:shape") && (
            <text
              style={{
                color: theme.warn,
                fontSize: 10,
                margin: { left: 16, bottom: 2 },
              }}
            >
              {node.warnings.get("prop:shape")}
            </text>
          )}
          {Object.entries(shape).map(([field, value]) => (
            <EditRow
              key={field}
              field={field}
              value={value}
              editable={false}
              warning={
                field in SHAPE_FIELDS
                  ? undefined
                  : `unknown shape field "${field}" (ignored by Bevy)`
              }
              apply={() => null}
              {...rowProps(`shape:${field}`)}
            />
          ))}
        </>
      )}
      {props.length > 0 && <SectionHeader label="props" />}
      {props.map(([field, value]) => (
        <EditRow
          key={field}
          field={field}
          value={value}
          editable={field in EDITABLE_PROPS}
          warning={node.warnings?.get(`prop:${field}`)}
          apply={(raw) => applyPropEdit(id, field, raw)}
          {...rowProps(`prop:${field}`)}
        />
      ))}
    </node>
  );
}

function SectionHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <node
      style={{
        flexDirection: "row",
        justifyContent: "spaceBetween",
        padding: { left: 8, right: 8, top: 5, bottom: 2 },
      }}
    >
      <text style={{ color: theme.text, fontSize: 11, fontFamily: theme.mono }}>
        {label}
      </text>
      {hint && (
        <text style={{ color: theme.textDim, fontSize: 10 }}>{hint}</text>
      )}
    </node>
  );
}

/** Display form of a wire value; strings render raw (no quotes) so the shown
 *  text round-trips through the editor's JSON-or-string coercion unchanged. */
function formatValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function EditRow({
  field,
  value,
  editable,
  apply,
  active,
  onActivate,
  onDone,
  toggle,
  warning,
}: {
  field: string;
  value: unknown;
  editable: boolean;
  apply: (raw: string) => string | null;
  /** Whether this row owns the (single) open editor — see `activeField`. */
  active: boolean;
  onActivate: () => void;
  onDone: () => void;
  /** Enable/disable checkbox (style rows only). */
  toggle?: { checked: boolean; onToggle: () => void };
  /** Invalid-value flag: tints the row and shows this message under it. */
  warning?: string;
}) {
  const [state, setState] = useState<{
    draft: string;
    error: string | null;
  }>({ draft: "", error: null });

  // Losing active status (another row opened) discards the draft.
  useEffect(() => {
    if (!active) setState({ draft: "", error: null });
  }, [active]);

  const commit = () => {
    const error = apply(state.draft);
    if (error) setState((s) => ({ ...s, error }));
    else {
      setState({ draft: "", error: null });
      onDone();
    }
  };

  useEditKeys(active, commit, () => {
    setState({ draft: "", error: null });
    onDone();
  });

  return (
    <node style={{ flexDirection: "column" }}>
      <node
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: { left: toggle ? 4 : 16, right: 8, top: 1, bottom: 1 },
          gap: 6,
        }}
      >
        {toggle && (
          // ASCII checkbox — the default font may lack real glyphs (tofu).
          <button style={{ flexShrink: 0 }} onClick={toggle.onToggle}>
            <text
              style={{
                color: theme.textDim,
                fontSize: 11,
                fontFamily: theme.mono,
              }}
            >
              {toggle.checked ? "[x]" : "[ ]"}
            </text>
          </button>
        )}
        {warning && (
          // ASCII marker — the default font may lack a real ⚠ glyph (tofu).
          <text
            style={{ color: theme.warn, fontSize: 11, fontFamily: theme.mono }}
          >
            (!)
          </text>
        )}
        <text
          style={{
            color: warning
              ? theme.warn
              : toggle?.checked === false
                ? theme.textDim
                : theme.accent,
            fontSize: 11,
            fontFamily: theme.mono,
            lineBreak: "noWrap",
          }}
        >
          {`${field}:`}
        </text>
        {active ? (
          <editableText
            autofocus
            value={state.draft}
            onChange={(draft) => setState((s) => ({ ...s, draft }))}
            style={{
              flexGrow: 1,
              color: theme.text,
              fontSize: 11,
              fontFamily: theme.mono,
              backgroundColor: theme.bgActive,
              border: 1,
              borderColor: state.error ? theme.danger : theme.accent,
              padding: { left: 3, right: 3 },
            }}
          />
        ) : (
          <button
            style={{ flexShrink: 1 }}
            onClick={() => {
              if (!editable) return;
              setState({ draft: formatValue(value), error: null });
              onActivate();
            }}
          >
            {/* `noWrap`: fat values (style objects) scroll horizontally
                instead of wrapping the row. */}
            <text
              style={{
                color: warning
                  ? theme.warn
                  : editable
                    ? theme.accentAlt
                    : theme.textDim,
                fontSize: 11,
                fontFamily: theme.mono,
                lineBreak: "noWrap",
              }}
            >
              {formatValue(value)}
            </text>
          </button>
        )}
      </node>
      {active && state.error && (
        <text
          style={{
            color: theme.danger,
            fontSize: 10,
            margin: { left: 16, bottom: 2 },
          }}
        >
          {state.error}
        </text>
      )}
      {!active && warning && (
        <text
          style={{
            color: theme.warn,
            fontSize: 10,
            margin: { left: 16, bottom: 2 },
          }}
        >
          {warning}
        </text>
      )}
    </node>
  );
}

/** Add a declaration: type `field: value` and press Enter. */
function AddStyleRow({
  id,
  active,
  onActivate,
  onDone,
}: {
  id: number;
  active: boolean;
  onActivate: () => void;
  onDone: () => void;
}) {
  const [state, setState] = useState<{
    draft: string;
    error: string | null;
  }>({ draft: "", error: null });

  useEffect(() => {
    if (!active) setState({ draft: "", error: null });
  }, [active]);

  const commit = () => {
    const colon = state.draft.indexOf(":");
    if (colon < 0) {
      setState((s) => ({ ...s, error: "type `field: value`" }));
      return;
    }
    const field = state.draft.slice(0, colon).trim();
    const raw = state.draft.slice(colon + 1);
    const error = applyStyleEdit(id, field, raw);
    if (error) setState((s) => ({ ...s, error }));
    else {
      setState({ draft: "", error: null });
      onDone();
    }
  };

  useEditKeys(active, commit, () => {
    setState({ draft: "", error: null });
    onDone();
  });

  if (!active) {
    return (
      <button
        style={{ padding: { left: 16, top: 1, bottom: 1 } }}
        onClick={onActivate}
      >
        <text style={{ color: theme.textDim, fontSize: 11 }}>+ add style</text>
      </button>
    );
  }
  return (
    <node style={{ flexDirection: "column", padding: { left: 16, right: 8 } }}>
      <editableText
        autofocus
        value={state.draft}
        onChange={(draft) => setState((s) => ({ ...s, draft }))}
        style={{
          color: theme.text,
          fontSize: 11,
          fontFamily: theme.mono,
          backgroundColor: theme.bgActive,
          border: 1,
          borderColor: state.error ? theme.danger : theme.accent,
          padding: { left: 3, right: 3 },
        }}
      />
      {state.error && (
        <text style={{ color: theme.danger, fontSize: 10 }}>{state.error}</text>
      )}
    </node>
  );
}

/** While editing: Enter commits, Escape cancels (global keyDown built-in). */
function useEditKeys(active: boolean, commit: () => void, cancel: () => void) {
  useEffect(() => {
    if (!active) return;
    return addEventListener("keyDown", (e) => {
      const key = (e as { key?: string }).key;
      if (key === "Enter") commit();
      else if (key === "Escape") cancel();
    });
  });
}
