import { useState } from "react";
import { C, fmt, mix } from "../theme";

/** Charts drawn with `<svg>` shapes; axis labels, crosshairs and tooltips
 *  are ordinary nodes over them (so hovering never re-rasterizes the
 *  drawing). */

export type Series = {
  id: string;
  name: string;
  color: string;
  values: number[];
  bold?: boolean;
};

const PAD = { left: 46, right: 14, top: 10, bottom: 24 };
const GRID = "#223247";
/** The panel's own navy: the 2px gaps between touching marks. */
const SURFACE = "#101d2e";

/** Round axis steps covering `max`: 0, then three or four more. */
function ticks(max: number): number[] {
  const raw = Math.max(max, 1e-6) / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const out = [];
  for (let v = 0; v < max + step * 0.999; v += step) out.push(v);
  return out;
}

export const compact = (v: number) =>
  v >= 10_000
    ? `${Math.round(v / 1000)}k`
    : v >= 1000
      ? `${(v / 1000).toFixed(1)}k`
      : fmt(v);

function Axes({
  width,
  height,
  grid,
  top,
  first,
  count,
}: {
  width: number;
  height: number;
  grid: number[];
  top: number;
  first: number;
  count: number;
}) {
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const every = count > 100 ? 25 : count > 40 ? 10 : 5;
  const turns = [];
  for (let t = Math.ceil(first / every) * every; t < first + count; t += every)
    turns.push(t);
  return (
    <>
      {grid.map((v) => (
        <text
          key={v}
          style={{
            positionType: "absolute",
            left: 0,
            width: PAD.left - 8,
            top: PAD.top + plotH - (v / top) * plotH - 7,
            textAlign: "right",
            fontSize: 10,
            color: C.faint,
          }}
        >
          {compact(v)}
        </text>
      ))}
      {turns.map((t) => (
        <text
          key={t}
          style={{
            positionType: "absolute",
            left:
              PAD.left + ((t - first) / Math.max(1, count - 1)) * plotW - 10,
            top: height - PAD.bottom + 6,
            fontSize: 10,
            color: C.faint,
          }}
        >
          {`${t}`}
        </text>
      ))}
    </>
  );
}

/** Hairline gridlines at the axis steps, drawn first inside the plot's
 *  `<svg>` so fills paint over them. */
function gridLines(grid: number[], top: number, plotW: number, plotH: number) {
  return grid.map((v) => {
    const y = plotH - (v / top) * plotH;
    return (
      <line
        key={v}
        x1={0}
        y1={y}
        x2={plotW}
        y2={y}
        stroke={GRID}
        strokeWidth={1}
      />
    );
  });
}

/** One line per series over the turns, with a crosshair that snaps to the
 *  nearest turn and reads every series out at once. */
export function LineChart({
  series,
  width,
  height,
  first,
}: {
  series: Series[];
  width: number;
  height: number;
  first: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;
  const n = Math.max(2, ...series.map((s) => s.values.length));
  const grid = ticks(Math.max(0, ...series.flatMap((s) => s.values)));
  const top = grid[grid.length - 1];
  const x = (i: number) => (i / (n - 1)) * plotW;
  const y = (v: number) => plotH - (v / top) * plotH;
  const lead = series.find((s) => s.bold);
  return (
    <node style={{ width, height }} onPointerLeave={() => setHover(null)}>
      <Axes
        width={width}
        height={height}
        grid={grid}
        top={top}
        first={first}
        count={n}
      />
      <svg
        viewBox={`0 0 ${plotW} ${plotH}`}
        style={{
          positionType: "absolute",
          left: PAD.left,
          top: PAD.top,
          width: plotW,
          height: plotH,
        }}
      >
        {lead && (
          // The leader's wash, pre-mixed opaque: bevy composites the
          // drawing in linear light, where a translucent fill lands far
          // brighter than on the web.
          <polygon
            points={[
              0,
              plotH,
              ...lead.values.flatMap((v, i) => [x(i), y(v)]),
              x(lead.values.length - 1),
              plotH,
            ]}
            fill={mix(SURFACE, lead.color, 0.12)}
          />
        )}
        {gridLines(grid, top, plotW, plotH)}
        {series.map((s) => (
          <polyline
            key={s.id}
            points={s.values.flatMap((v, i) => [x(i), y(v)])}
            fill="none"
            stroke={s.color}
            strokeWidth={s.bold ? 3 : 2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
      {hover !== null && (
        <Readout
          rows={series.map((s) => ({
            s,
            value: s.values[hover],
            y: y(s.values[hover]),
          }))}
          turn={first + hover}
          left={PAD.left + x(hover)}
          width={width}
          plotH={plotH}
        />
      )}
      <Strip n={n} width={plotW} height={plotH} onHover={setHover} />
    </node>
  );
}

/** Invisible columns over the plot, one per turn: entering one moves the
 *  crosshair there. */
function Strip({
  n,
  width,
  height,
  onHover,
}: {
  n: number;
  width: number;
  height: number;
  onHover: (i: number) => void;
}) {
  const step = width / (n - 1);
  return (
    <node
      style={{
        positionType: "absolute",
        left: PAD.left - step / 2,
        top: PAD.top,
        width: width + step,
        height,
        flexDirection: "row",
      }}
    >
      {Array.from({ length: n }, (_, i) => (
        <node
          key={i}
          style={{ flexGrow: 1, flexBasis: 0 }}
          onPointerEnter={() => onHover(i)}
        />
      ))}
    </node>
  );
}

type Row = { s: Series; value: number; y?: number };

/** The crosshair at one turn: a dot where it crosses each line, and every
 *  series' value there, largest first. */
function Readout({
  rows,
  turn,
  left,
  width,
  plotH,
}: {
  rows: Row[];
  turn: number;
  left: number;
  width: number;
  plotH: number;
}) {
  const sorted = rows
    .filter((r) => r.value !== undefined)
    .sort((a, b) => b.value - a.value);
  const flip = left > width * 0.68;
  return (
    <>
      <node
        style={{
          positionType: "absolute",
          left,
          top: PAD.top,
          width: 1,
          height: plotH,
          backgroundColor: "rgba(246, 228, 168, 0.55)",
        }}
      />
      {sorted
        .filter((r) => r.y !== undefined)
        .map(({ s, y }) => (
          <node
            key={s.id}
            style={{
              positionType: "absolute",
              left: left - 5,
              top: PAD.top + y! - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              border: 2,
              borderColor: SURFACE,
              backgroundColor: s.color,
            }}
          />
        ))}
      <node
        style={{
          positionType: "absolute",
          ...(flip ? { right: width - left + 12 } : { left: left + 12 }),
          top: PAD.top + 4,
          padding: { horizontal: 10, vertical: 8 },
          flexDirection: "column",
          gap: 4,
          borderRadius: 3,
          border: 1,
          borderColor: C.goldLo,
          backgroundColor: "rgba(6, 13, 21, 0.94)",
        }}
      >
        <text style={{ fontSize: 11, color: C.muted }}>{`Turn ${turn}`}</text>
        {sorted.map(({ s, value }) => (
          <node
            key={s.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <node style={{ width: 10, height: 2, backgroundColor: s.color }} />
            <text
              style={{
                width: 44,
                fontSize: 12,
                fontWeight: "bold",
                color: C.text,
              }}
            >
              {compact(value)}
            </text>
            <text style={{ fontSize: 11, color: C.muted, lineBreak: "noWrap" }}>
              {s.name}
            </text>
          </node>
        ))}
      </node>
    </>
  );
}

/** Series stacked on each other: the whole is the top line, each band one
 *  part, split by 2px gaps of the panel's color and named at its end. */
export function StackedArea({
  series,
  width,
  height,
  first,
}: {
  series: Series[];
  width: number;
  height: number;
  first: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const LABELS = 70;
  const plotW = width - PAD.left - PAD.right - LABELS;
  const plotH = height - PAD.top - PAD.bottom;
  const n = Math.max(2, ...series.map((s) => s.values.length));
  const stacked: number[][] = [];
  series.forEach((s, k) =>
    stacked.push(s.values.map((v, i) => v + (k ? stacked[k - 1][i] : 0))),
  );
  const grid = ticks(Math.max(...stacked[stacked.length - 1]));
  const top = grid[grid.length - 1];
  const x = (i: number) => (i / (n - 1)) * plotW;
  const y = (v: number) => plotH - (v / top) * plotH;
  const tops = stacked.map((line) => line.flatMap((v, i) => [x(i), y(v)]));
  return (
    <node style={{ width, height }} onPointerLeave={() => setHover(null)}>
      <Axes
        width={width - LABELS}
        height={height}
        grid={grid}
        top={top}
        first={first}
        count={n}
      />
      <svg
        viewBox={`0 0 ${plotW} ${plotH}`}
        style={{
          positionType: "absolute",
          left: PAD.left,
          top: PAD.top,
          width: plotW,
          height: plotH,
        }}
      >
        {gridLines(grid, top, plotW, plotH)}
        {series.map((s, k) => {
          const base = k ? backwards(tops[k - 1]) : [x(n - 1), plotH, 0, plotH];
          return (
            <polygon key={s.id} points={[...tops[k], ...base]} fill={s.color} />
          );
        })}
        {tops.slice(0, -1).map((line, k) => (
          <polyline
            key={k}
            points={line}
            fill="none"
            stroke={SURFACE}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {series.map((s, k) => {
        const mid = (stacked[k][n - 1] + (k ? stacked[k - 1][n - 1] : 0)) / 2;
        return (
          <text
            key={s.id}
            style={{
              positionType: "absolute",
              left: PAD.left + plotW + 8,
              top: PAD.top + y(mid) - 7,
              fontSize: 11,
              color: C.muted,
            }}
          >
            {s.name}
          </text>
        );
      })}
      {hover !== null && (
        <Readout
          rows={series.map((s) => ({ s, value: s.values[hover] }))}
          turn={first + hover}
          left={PAD.left + x(hover)}
          width={width}
          plotH={plotH}
        />
      )}
      <Strip n={n} width={plotW} height={plotH} onHover={setHover} />
    </node>
  );
}

/** A flat `[x0, y0, x1, y1, …]` list, last point first. */
function backwards(points: number[]) {
  const out: number[] = [];
  for (let i = points.length - 2; i >= 0; i -= 2)
    out.push(points[i], points[i + 1]);
  return out;
}

type Slice = { name: string; value: number; color: string };

/** A ring of parts of a whole (keep it to six or fewer); hover a part to
 *  read it in the middle. */
export function Donut({
  slices,
  size,
  label,
}: {
  slices: Slice[];
  size: number;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = slices.reduce((n, s) => n + s.value, 0);
  const r1 = size / 2 - 2;
  const r0 = r1 * 0.62;
  let a = 0;
  const arcs = slices.map((s) => {
    const from = a;
    a += (s.value / total) * Math.PI * 2;
    return { ...s, from, to: a };
  });
  const shown = hover === null ? null : slices[hover];
  return (
    <node
      style={{
        width: size,
        height: size,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{
          positionType: "absolute",
          left: 0,
          top: 0,
          width: size,
          height: size,
        }}
      >
        {arcs.map((s, i) => (
          <path
            key={s.name}
            d={sector(
              size / 2,
              size / 2,
              hover === i ? r0 - 3 : r0,
              hover === i ? r1 + 2 : r1,
              s.from,
              s.to,
              2,
            )}
            fill={s.color}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover((h) => (h === i ? null : h))}
          />
        ))}
      </svg>
      <text style={{ fontSize: 22, fontWeight: "bold", color: C.text }}>
        {fmt(shown ? shown.value : total)}
      </text>
      <text style={{ fontSize: 11, color: C.muted }}>
        {shown ? shown.name : label}
      </text>
    </node>
  );
}

/** An annular sector from angle `a0` to `a1` (radians, clockwise from
 *  twelve o'clock), less a `gap` of px at each end. */
function sector(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
  gap: number,
) {
  const at = (r: number, a: number) =>
    `${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`;
  const g1 = gap / 2 / r1;
  const g0 = gap / 2 / r0;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${at(r1, a0 + g1)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${at(r1, a1 - g1)}`,
    `L ${at(r0, a1 - g0)}`,
    `A ${r0} ${r0} 0 ${large} 0 ${at(r0, a0 + g0)}`,
    "Z",
  ].join(" ");
}
