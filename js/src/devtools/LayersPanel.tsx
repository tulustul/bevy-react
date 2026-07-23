// The Layers tab: a flat 2D wireframe map of the current layer set (the
// implicit base layer plus every auto-promoted layer) over a list with
// promotion reasons, sizes, and estimated texture memory — a small cousin of
// Chrome devtools' Layers panel.
//
// Data arrives as `devtools.layers` events (see `api.ts`), streamed by Rust
// only while this panel is mounted: the mount effect announces
// `devtools.layersOpen`, so tab switches, the close button, and the toggle
// key all gate the stream through the same unmount cleanup. Rows come sorted
// by (depth, id) — rendering the map in array order paints nested layers atop
// their enclosing ones.

import { useEffect, useState } from "react";
import {
  onLayers,
  sendHighlight,
  sendLayersOpen,
  type DevtoolsFilterEntry,
  type DevtoolsLayerRow,
} from "./api";
import { ScrollArea } from "./DevtoolsHost";
import { mirror } from "./mirror";
import { theme } from "./theme";
import { useMirrorVersion } from "./TreeView";

/** Deterministic per-layer colors, stable across payloads (keyed by node id).
 *  The base layer stays dim — it's context, not a promoted layer. */
const LAYER_COLORS = [
  theme.accent,
  theme.ok,
  theme.warn,
  theme.danger,
  theme.accentAlt,
] as const;

function layerColor(row: DevtoolsLayerRow): string {
  return row.depth === 0
    ? theme.textDim
    : LAYER_COLORS[row.id % LAYER_COLORS.length];
}

/** Hex colors only in the theme, so a translucent fill is color + hex alpha. */
function withAlpha(hex: string): string {
  return `${hex}33`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

/** One compact line for a resolved filter chain: `blur(radius 4.25)
 *  sepia(amount 1)`. Values arrive display-ready (unit-converted + rounded)
 *  from Rust — plain number-to-string here, and ASCII-only punctuation (the
 *  default font may lack fancier separator glyphs). */
function formatChain(filters: DevtoolsFilterEntry[]): string {
  return filters
    .map(
      (f) =>
        `${f.name}(${f.params
          .map(([name, values]) => `${name} ${values.join(",")}`)
          .join(", ")})`,
    )
    .join(" ");
}

export function LayersPanel() {
  // Layer labels come from the mirror (node kinds); re-render when it moves.
  useMirrorVersion();
  const [layers, setLayers] = useState<DevtoolsLayerRow[]>([]);
  const [hover, setHover] = useState<number | null>(null);

  // Subscribe FIRST, then announce — the first payload must not race the
  // listener. The unmount cleanup is the tab-hidden signal (and clears a
  // still-showing highlight if the tab closes mid-hover).
  useEffect(() => {
    const off = onLayers((e) => setLayers(e.layers));
    sendLayersOpen(true);
    return () => {
      off();
      sendLayersOpen(false);
      sendHighlight(null);
    };
  }, []);

  const base = layers.find((l) => l.depth === 0);
  // Hovering a layer (map box or list row) highlights its region in the
  // running app — the same momentary-highlight channel as tree-row hover.
  const hoverProps = (id: number) => ({
    onPointerEnter: () => {
      setHover(id);
      sendHighlight(id);
    },
    onPointerLeave: () => {
      setHover((h) => (h === id ? null : h));
      sendHighlight(null);
    },
  });

  return (
    <>
      <node
        style={{
          padding: 8,
          flexShrink: 0,
          flexDirection: "column",
          // Blocks scrolled-out list rows stacked beneath (see Header note in
          // DevtoolsHost).
          focusPolicy: "block",
        }}
      >
        {base?.rect ? (
          // The map: the base layer's rect as an aspect-true box, promoted
          // layers as percent-positioned outlines inside it. Percent
          // positioning needs no pixel measurement — the boxes track the
          // panel width for free. No hover handlers on the map background
          // itself (parent/child enter-leave ordering would fight the layer
          // boxes); the base layer hovers via its list row.
          <node
            style={{
              width: "100%",
              aspectRatio: base.rect.width / base.rect.height,
              backgroundColor: theme.bgAlt,
              border: 1,
              borderColor: theme.border,
              overflowX: "hidden",
              overflowY: "hidden",
            }}
          >
            {layers
              .filter((l) => l.depth > 0 && l.rect)
              .map((l) => {
                const r = l.rect!;
                const W = base.rect!.width;
                const H = base.rect!.height;
                const hovered = hover === l.id;
                return (
                  <node
                    key={l.id}
                    style={{
                      positionType: "absolute",
                      left: `${(r.x / W) * 100}%`,
                      top: `${(r.y / H) * 100}%`,
                      width: `${(r.width / W) * 100}%`,
                      height: `${(r.height / H) * 100}%`,
                      border: hovered ? 2 : 1,
                      borderColor: layerColor(l),
                      backgroundColor: hovered
                        ? withAlpha(layerColor(l))
                        : "transparent",
                    }}
                    {...hoverProps(l.id)}
                  />
                );
              })}
          </node>
        ) : (
          <text style={{ color: theme.textDim, fontSize: 11 }}>
            waiting for layer data
          </text>
        )}
      </node>
      <ScrollArea>
        {layers.map((l) => (
          <LayerRow
            key={l.id}
            row={l}
            hovered={hover === l.id}
            hoverProps={hoverProps(l.id)}
          />
        ))}
      </ScrollArea>
    </>
  );
}

function LayerRow({
  row,
  hovered,
  hoverProps,
}: {
  row: DevtoolsLayerRow;
  hovered: boolean;
  hoverProps: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
}) {
  const inactive = !row.rect;
  const node = mirror.get(row.id);
  const label =
    row.depth === 0
      ? "base"
      : node
        ? `<${node.kind}> #${row.id}`
        : `#${row.id}`;
  // Nested layers indent under their enclosing depth.
  const indent = 10 + Math.max(0, row.depth - 1) * 12;
  const chain = row.filters ?? [];
  return (
    <node
      style={{
        flexDirection: "column",
        padding: { left: indent, right: 10, top: 4, bottom: 4 },
        backgroundColor: hovered ? theme.bgActive : "transparent",
      }}
      {...hoverProps}
    >
      <node style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <node
          style={{
            width: 8,
            height: 8,
            flexShrink: 0,
            borderRadius: 2,
            backgroundColor: inactive ? theme.border : layerColor(row),
          }}
        />
        <text
          style={{
            color: inactive ? theme.textDim : theme.text,
            fontSize: 11,
            fontFamily: theme.mono,
          }}
        >
          {label}
        </text>
        {row.reasons
          .filter((r) => r !== "base")
          .map((r) => (
            <ReasonPill key={r} label={r} />
          ))}
        {inactive && <ReasonPill label="inactive" />}
        <node style={{ flexGrow: 1 }} />
        {row.depth > 0 && (
          <text style={{ color: theme.textDim, fontSize: 10 }}>
            {row.repaints} repaints
          </text>
        )}
        {row.node_count > 0 && (
          <text style={{ color: theme.textDim, fontSize: 10 }}>
            {row.node_count} nodes
          </text>
        )}
        <text style={{ color: theme.textDim, fontSize: 10 }}>
          {/* ASCII "x" — the default font may lack the multiply glyph. */}
          {row.rect
            ? `${Math.round(row.rect.width)}x${Math.round(row.rect.height)}`
            : "-"}
        </text>
        <text style={{ color: theme.textDim, fontSize: 10 }}>
          {row.rect
            ? formatBytes(
                row.rect.physical_width * row.rect.physical_height * 4,
              )
            : "-"}
        </text>
      </node>
      {chain.length > 0 && (
        // The resolved chain with LIVE param values (Rust re-streams while
        // they animate) — indented under the dot + gap of the row above.
        <text
          style={{
            color: theme.textDim,
            fontSize: 10,
            fontFamily: theme.mono,
            margin: { left: 14, top: 2 },
          }}
        >
          {formatChain(chain)}
        </text>
      )}
    </node>
  );
}

/** A non-interactive label pill (promotion reasons, "inactive") — a plain
 *  node, not the clickable `Chip`, so it doesn't read as a button. */
function ReasonPill({ label }: { label: string }) {
  return (
    <node
      style={{
        padding: { left: 5, right: 5, top: 0, bottom: 0 },
        borderRadius: 7,
        border: 1,
        borderColor: theme.border,
        flexShrink: 0,
      }}
    >
      <text style={{ color: theme.textDim, fontSize: 9 }}>{label}</text>
    </node>
  );
}
