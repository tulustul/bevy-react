import { useState } from "react";
import type { CivInfo, WorldInfo } from "../bevy";
import { METRICS, ledger, totals, type Game, type Metric } from "../game";
import { C, YIELDS, caps, fmt, signed, type YieldKey } from "../theme";
import { Icon } from "../ui/Icon";
import { Header } from "../ui/kit";
import { Donut, LineChart, StackedArea, compact, type Series } from "./charts";

export const REPORT_TABS = ["Graphs", "Cities", "Demographics"];

/** The empire's reports: history graphs for every civilization, the
 *  player's cities by yield, and how the world compares. */
export function Reports({
  tab,
  world,
  game,
  width,
  height,
}: {
  tab: string;
  world: WorldInfo;
  game: Game;
  width: number;
  height: number;
}) {
  if (tab === "Cities")
    return <Cities world={world} game={game} width={width} />;
  if (tab === "Demographics") return <Demographics world={world} game={game} />;
  return <Graphs world={world} game={game} width={width} height={height} />;
}

function Graphs({
  world,
  game,
  width,
  height,
}: {
  world: WorldInfo;
  game: Game;
  width: number;
  height: number;
}) {
  const [metric, setMetric] = useState<Metric>("score");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const player = world.civs[0];
  const def = METRICS.find((m) => m.key === metric)!;
  const series: Series[] = world.civs
    .filter((c) => !hidden.has(c.id))
    .map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      values: game.history[c.id][metric],
      bold: c.player,
    }));
  const chartW = width - 220;
  const own = game.history[player.id];
  const yields: Series[] = STACK.map(({ key, color }) => ({
    id: key,
    name: METRICS.find((m) => m.key === key)!.name,
    color,
    values: own[key],
  }));
  const toggle = (id: string) =>
    setHidden((h) => {
      const next = new Set(h);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  return (
    <node style={{ flexDirection: "row", flexGrow: 1 }}>
      <node
        style={{
          width: 190,
          flexDirection: "column",
          gap: 4,
          padding: 14,
          border: { right: 1 },
          borderColor: C.goldLine,
        }}
      >
        <text style={{ ...caps, color: C.muted, margin: { bottom: 6 } }}>
          MEASURE
        </text>
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: { horizontal: 10, vertical: 8 },
              borderRadius: 3,
              backgroundColor:
                m.key === metric
                  ? "rgba(217, 183, 108, 0.14)"
                  : "rgba(0, 0, 0, 0)",
              border: { left: 2 },
              borderColor: m.key === metric ? C.gold : "rgba(0, 0, 0, 0)",
            }}
            hoverStyle={{ backgroundColor: "rgba(217, 183, 108, 0.1)" }}
          >
            <Icon name={m.icon} size={16} color={m.color} />
            <text
              style={{
                fontSize: 13,
                color: m.key === metric ? C.goldHi : C.text,
              }}
            >
              {m.name}
            </text>
          </button>
        ))}
      </node>
      <node
        style={{
          flexDirection: "column",
          flexGrow: 1,
          padding: { horizontal: 16, vertical: 12 },
          gap: 8,
        }}
      >
        <node style={{ flexDirection: "row", alignItems: "flexEnd", gap: 10 }}>
          <text style={{ fontSize: 17, fontWeight: "semibold", color: C.text }}>
            {def.name}
          </text>
          <text
            style={{ fontSize: 12, color: C.muted, margin: { bottom: 2 } }}
          >{`${def.unit}, every civilization, by turn`}</text>
        </node>
        <node style={{ flexDirection: "row", gap: 6 }}>
          {world.civs.map((c) => (
            <Toggle
              key={c.id}
              civ={c}
              on={!hidden.has(c.id)}
              onClick={() => toggle(c.id)}
            />
          ))}
        </node>
        <LineChart
          series={series}
          width={chartW}
          height={Math.max(200, height - 430)}
          first={1}
        />
        <Header>{`${player.name} · yields per turn`}</Header>
        <node style={{ flexDirection: "row", gap: 14 }}>
          {[...yields].reverse().map((s) => (
            <node
              key={s.id}
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <node
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: s.color,
                }}
              />
              <text style={{ fontSize: 12, color: C.muted }}>{s.name}</text>
            </node>
          ))}
        </node>
        <StackedArea series={yields} width={chartW} height={170} first={1} />
      </node>
    </node>
  );
}

/** A legend entry that shows or hides its civilization's line. */
function Toggle({
  civ,
  on,
  onClick,
}: {
  civ: CivInfo;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: { horizontal: 10, vertical: 5 },
        borderRadius: 12,
        border: 1,
        borderColor: on
          ? "rgba(255, 255, 255, 0.18)"
          : "rgba(255, 255, 255, 0.06)",
        backgroundColor: on ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0)",
      }}
      hoverStyle={{ borderColor: C.gold }}
    >
      <node
        style={{
          width: 12,
          height: civ.player ? 3 : 2,
          backgroundColor: on ? civ.color : C.faint,
        }}
      />
      <text style={{ fontSize: 12, color: on ? C.text : C.faint }}>
        {civ.player ? `${civ.name} (you)` : civ.name}
      </text>
    </button>
  );
}

/** The stacked yields, bottom to top: the game's own yield colors fail as
 *  neighbors (science and culture match under deuteranopia), so the chart
 *  uses steps checked for adjacent separation, in this order. */
const STACK = [
  { key: "culture", color: "#a05cc8" },
  { key: "gold", color: "#c08a1c" },
  { key: "science", color: "#2f8fc8" },
  { key: "faith", color: "#d3cdf2" },
] as const;

const COLS = [
  { key: "city", label: "City", width: 170 },
  { key: "population", label: "Pop.", width: 64 },
  ...YIELDS.map((y) => ({
    key: y.key,
    label: y.key === "production" ? "Prod." : y.name,
    width: 100,
  })),
];
const TABLE_W = COLS.reduce((n, c) => n + c.width, 0);

function Cities({
  world,
  game,
  width,
}: {
  world: WorldInfo;
  game: Game;
  width: number;
}) {
  const player = world.civs[0];
  const cities = world.cities.filter((c) => c.civ === player.id);
  const sum = totals(world.cities, player.id);
  const money = ledger(world, game);
  // Categorical steps validated for neighbors around the ring (the last
  // slice touches the first), on this panel's navy.
  const slots = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"];
  const sources = money.sources.map((s, i) => ({
    ...s,
    color: slots[i % slots.length],
  }));
  const food = (y: { food: number }, pop: number) => y.food - pop * 2;
  return (
    <node style={{ flexDirection: "row", flexGrow: 1, padding: 18, gap: 22 }}>
      <node style={{ flexDirection: "column", width: width - 380, gap: 6 }}>
        <node style={{ flexDirection: "column", width: TABLE_W }}>
          <Row header cells={COLS.map((c) => c.label)} />
          {cities.map((c) => (
            <Row
              key={c.id}
              star={c.capital}
              cells={[
                c.name,
                `${c.population}`,
                ...YIELDS.map((y) =>
                  fmt(
                    y.key === "food"
                      ? food(c.yields, c.population)
                      : c.yields[y.key],
                  ),
                ),
              ]}
            />
          ))}
          <Row
            total
            cells={[
              "Empire",
              `${sum.population}`,
              ...YIELDS.map((y) =>
                fmt(y.key === "food" ? food(sum, sum.population) : sum[y.key]),
              ),
            ]}
          />
          <text
            style={{
              width: TABLE_W,
              fontSize: 11,
              color: C.faint,
              margin: { top: 8 },
            }}
          >
            Food is after what the citizens eat, two each. Every yield comes
            from the tiles a city works on the map.
          </text>
        </node>
        <node style={{ margin: { top: 14 } }}>
          <Header>Where each yield comes from</Header>
        </node>
        <node
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: 26,
            rowGap: 14,
          }}
        >
          {YIELDS.map((y) => (
            <Breakdown
              key={y.key}
              icon={y.key}
              name={y.name}
              color={y.color}
              rows={cities.map((c) => ({
                name: c.name,
                value:
                  y.key === "food"
                    ? Math.max(0, food(c.yields, c.population))
                    : c.yields[y.key],
              }))}
            />
          ))}
        </node>
      </node>
      <node
        style={{
          flexDirection: "column",
          width: 320,
          gap: 12,
          alignItems: "center",
        }}
      >
        <Header>Gold per turn</Header>
        <Donut slices={sources} size={190} label="gold income" />
        <node style={{ flexDirection: "column", gap: 4, width: 270 }}>
          {sources.map((s) => (
            <Ledger
              key={s.name}
              swatch={s.color}
              name={s.name}
              value={signed(s.value)}
            />
          ))}
          <node
            style={{
              height: 1,
              backgroundColor: C.goldLine,
              margin: { vertical: 4 },
            }}
          />
          {money.upkeep.map((u) => (
            <Ledger
              key={u.name}
              name={`${u.name} upkeep`}
              value={signed(-u.value)}
            />
          ))}
          <node
            style={{
              height: 1,
              backgroundColor: C.goldLine,
              margin: { vertical: 4 },
            }}
          />
          <Ledger name="Net per turn" value={signed(money.net)} strong />
        </node>
      </node>
    </node>
  );
}

/** One yield across the cities: a small bar chart in that yield's color
 *  (one series per chart — small multiples, not six hues side by side). */
function Breakdown({
  icon,
  name,
  color,
  rows,
}: {
  icon: YieldKey;
  name: string;
  color: string;
  rows: { name: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const BAR = 150;
  return (
    <node style={{ width: 268, flexDirection: "column", gap: 5 }}>
      <node style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Icon name={icon} size={14} color={color} />
        <text style={{ ...caps, color: C.muted }}>{name.toUpperCase()}</text>
      </node>
      {rows.map((r) => (
        <node
          key={r.name}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            height: 16,
          }}
        >
          <text
            style={{
              width: 74,
              fontSize: 11,
              color: C.muted,
              lineBreak: "noWrap",
            }}
          >
            {r.name}
          </text>
          <node
            style={{
              width: Math.max(2, (r.value / max) * BAR),
              height: 10,
              borderRadius: { top: 0, right: 3, bottom: 3, left: 0 },
              backgroundColor: color,
            }}
          />
          <text style={{ fontSize: 11, color: C.text }}>{fmt(r.value)}</text>
        </node>
      ))}
    </node>
  );
}

function Row({
  cells,
  header,
  total,
  star,
}: {
  cells: string[];
  header?: boolean;
  total?: boolean;
  star?: boolean;
}) {
  return (
    <node
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: header ? 34 : 36,
        border: { bottom: 1 },
        borderColor: total ? C.goldLine : "rgba(255, 255, 255, 0.06)",
        backgroundColor: total
          ? "rgba(217, 183, 108, 0.08)"
          : "rgba(0, 0, 0, 0)",
      }}
      hoverStyle={
        header ? undefined : { backgroundColor: "rgba(95, 191, 244, 0.08)" }
      }
    >
      {cells.map((cell, i) => {
        const col = COLS[i];
        const y = YIELDS.find((y) => y.key === col.key);
        return (
          <node
            key={col.key}
            style={{
              width: col.width,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: i === 0 ? "flexStart" : "flexEnd",
              gap: 5,
              padding: { horizontal: 8 },
            }}
          >
            {header && y && <Icon name={y.key} size={14} color={y.color} />}
            {!header && i === 0 && star && (
              <Icon name="star" size={12} color={C.goldHi} />
            )}
            <text
              style={
                header
                  ? { ...caps, fontSize: 10.5, color: C.muted }
                  : {
                      fontSize: 13,
                      fontWeight: total || i === 0 ? "semibold" : "normal",
                      color: C.text,
                      lineBreak: "noWrap",
                    }
              }
            >
              {header ? cell.toUpperCase() : cell}
            </text>
          </node>
        );
      })}
    </node>
  );
}

function Ledger({
  swatch,
  name,
  value,
  strong,
}: {
  swatch?: string;
  name: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <node style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <node
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: swatch ?? "rgba(0, 0, 0, 0)",
        }}
      />
      <text
        style={{ flexGrow: 1, fontSize: 12, color: strong ? C.text : C.muted }}
      >
        {name}
      </text>
      <text
        style={{
          fontSize: 12,
          fontWeight: strong ? "bold" : "semibold",
          color: C.text,
        }}
      >
        {value}
      </text>
    </node>
  );
}

const DEMOGRAPHICS: {
  name: string;
  unit: string;
  of: (civ: string, w: WorldInfo, g: Game) => number;
}[] = [
  {
    name: "Population",
    unit: "citizens",
    of: (c, w) => totals(w.cities, c).population * 1000,
  },
  {
    name: "Crop yield",
    unit: "bushels",
    of: (c, w) => totals(w.cities, c).food * 120,
  },
  {
    name: "Manufactured goods",
    unit: "tons",
    of: (c, w) => totals(w.cities, c).production * 45,
  },
  { name: "GNP", unit: "gold", of: (c, w) => totals(w.cities, c).gold * 260 },
  {
    name: "Literacy",
    unit: "%",
    of: (c, _, g) => Math.min(96, 18 + g.history[c].science.at(-1)! * 1.6),
  },
  {
    name: "Soldiers",
    unit: "troops",
    of: (c, _, g) => g.history[c].military.at(-1)! * 520,
  },
  {
    name: "Land",
    unit: "sq. mi",
    of: (c, w) =>
      w.cities.filter((x) => x.civ === c).reduce((n, x) => n + x.tiles, 0) *
      1900,
  },
];

/** How the world compares, measure by measure: your value and rank, and a
 *  strip with every civilization placed along it. */
function Demographics({ world, game }: { world: WorldInfo; game: Game }) {
  const player = world.civs[0];
  return (
    <node style={{ flexDirection: "column", padding: 18 }}>
      <node
        style={{
          flexDirection: "row",
          height: 30,
          alignItems: "center",
          border: { bottom: 1 },
          borderColor: C.goldLine,
        }}
      >
        {["Measure", "You", "Rank", "The world", "Best", "Average"].map(
          (h, i) => (
            <text
              key={h}
              style={{
                ...caps,
                fontSize: 10.5,
                color: C.muted,
                width: [190, 110, 70, 360, 170, 110][i],
              }}
            >
              {h.toUpperCase()}
            </text>
          ),
        )}
      </node>
      {DEMOGRAPHICS.map((d) => {
        const values = world.civs.map((c) => ({
          civ: c,
          v: d.of(c.id, world, game),
        }));
        const sorted = [...values].sort((a, b) => b.v - a.v);
        const mine = values[0].v;
        const rank = sorted.findIndex((x) => x.civ.id === player.id) + 1;
        const max = sorted[0].v;
        const avg = values.reduce((n, x) => n + x.v, 0) / values.length;
        return (
          <node
            key={d.name}
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 52,
              border: { bottom: 1 },
              borderColor: "rgba(255, 255, 255, 0.06)",
            }}
            hoverStyle={{ backgroundColor: "rgba(95, 191, 244, 0.06)" }}
          >
            <text
              style={{
                width: 190,
                fontSize: 13,
                fontWeight: "semibold",
                color: C.text,
                lineBreak: "noWrap",
              }}
            >
              {d.name}
            </text>
            <text
              style={{ width: 110, fontSize: 13, color: C.text }}
            >{`${compact(mine)}${d.unit === "%" ? "%" : ""}`}</text>
            <node style={{ width: 70 }}>
              <node
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    rank === 1
                      ? "rgba(217, 183, 108, 0.25)"
                      : "rgba(255, 255, 255, 0.06)",
                  border: 1,
                  borderColor:
                    rank === 1 ? C.gold : "rgba(255, 255, 255, 0.12)",
                }}
              >
                <text
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    color: rank === 1 ? C.goldHi : C.text,
                  }}
                >{`${rank}`}</text>
              </node>
            </node>
            <node style={{ width: 360, height: 20 }}>
              <node
                style={{
                  positionType: "absolute",
                  left: 0,
                  right: 30,
                  top: 9,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
              />
              {values.map(({ civ, v }) => {
                const size = civ.player ? 16 : 12;
                return (
                  <node
                    key={civ.id}
                    style={{
                      positionType: "absolute",
                      left: (v / max) * 330 - size / 2,
                      top: 10 - size / 2,
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      border: 2,
                      borderColor: civ.player ? C.goldHi : "#101d2e",
                      backgroundColor: civ.color,
                      zIndex: civ.player ? 1 : 0,
                    }}
                  />
                );
              })}
            </node>
            <node
              style={{
                width: 170,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <node
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: sorted[0].civ.color,
                }}
              />
              <text
                style={{ fontSize: 12, color: C.text, lineBreak: "noWrap" }}
              >{`${sorted[0].civ.name} · ${compact(max)}`}</text>
            </node>
            <text style={{ width: 110, fontSize: 12, color: C.muted }}>
              {compact(avg)}
            </text>
          </node>
        );
      })}
    </node>
  );
}
