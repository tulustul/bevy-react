import type { CivInfo, WorldInfo } from "../bevy";
import { rng, totals, type Game } from "../game";
import { TECHS } from "../techs";
import { C, Fonts, caps } from "../theme";
import { Icon, type IconName } from "../ui/Icon";
import { Bar, Crest, Medallion } from "../ui/kit";

export const RANKING_TABS = [
  "Overall",
  "Science",
  "Culture",
  "Domination",
  "Religion",
  "Diplomatic",
];

type Standing = { civ: CivInfo; progress: number; note: string };

const VICTORIES: {
  tab: string;
  icon: IconName;
  color: string;
  goal: string;
}[] = [
  {
    tab: "Science",
    icon: "science",
    color: C.science,
    goal: "Lead the world in learning and launch the first colony ship.",
  },
  {
    tab: "Culture",
    icon: "culture",
    color: C.culture,
    goal: "Draw more visiting tourists than any rival has at home.",
  },
  {
    tab: "Domination",
    icon: "strength",
    color: C.bad,
    goal: "Hold the original capital of every other civilization.",
  },
  {
    tab: "Religion",
    icon: "faith",
    color: C.faith,
    goal: "See your religion followed by most cities of every civilization.",
  },
  {
    tab: "Diplomatic",
    icon: "trophy",
    color: C.coin,
    goal: "Earn 20 diplomatic victory points in the world congress.",
  },
];

/** How close every civilization is to each way of winning — numbers
 *  derived from its cities and its history. */
function standings(tab: string, world: WorldInfo, game: Game): Standing[] {
  const sci = (c: CivInfo) => game.history[c.id].science.at(-1)!;
  const mine = world.civs[0];
  return world.civs.map((civ, i) => {
    const r = rng(i * 97 + 13);
    const sum = totals(world.cities, civ.id);
    switch (tab) {
      case "Science": {
        const known = civ.player
          ? game.researched.length
          : Math.min(
              TECHS.length - 1,
              Math.round(
                game.researched.length * (sci(civ) / sci(mine)) ** 0.5,
              ),
            );
        return {
          civ,
          progress: known / TECHS.length,
          note: `${known} of ${TECHS.length} technologies`,
        };
      }
      case "Culture": {
        const visiting = Math.round(sum.culture * 1.4 + r() * 6);
        const need = Math.round(30 + r() * 25);
        return {
          civ,
          progress: visiting / need,
          note: `${visiting} of ${need} tourists needed`,
        };
      }
      case "Domination":
        return {
          civ,
          progress: 1 / world.civs.length,
          note: "Holds its own capital",
        };
      case "Religion": {
        const cities = 1 + Math.floor(sum.faith / 3 + r() * 3);
        return {
          civ,
          progress: cities / world.cities.length,
          note: `Followed in ${cities} of ${world.cities.length} cities`,
        };
      }
      default: {
        const points = 2 + Math.floor(r() * 9);
        return {
          civ,
          progress: points / 20,
          note: `${points} of 20 victory points`,
        };
      }
    }
  });
}

export function Rankings({
  tab,
  world,
  game,
}: {
  tab: string;
  world: WorldInfo;
  game: Game;
}) {
  if (tab !== "Overall") {
    const v = VICTORIES.find((v) => v.tab === tab)!;
    const rows = standings(tab, world, game).sort(
      (a, b) => b.progress - a.progress,
    );
    return (
      <node
        style={{
          flexDirection: "column",
          padding: { horizontal: 40, vertical: 22 },
          gap: 14,
        }}
      >
        <node style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Medallion size={58} ring={v.color}>
            <Icon name={v.icon} size={26} color={v.color} />
          </Medallion>
          <node style={{ flexDirection: "column", gap: 3 }}>
            <text
              style={{
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 20,
                color: C.goldHi,
              }}
            >
              {`${tab.toUpperCase()} VICTORY`}
            </text>
            <text style={{ fontSize: 13, color: C.muted }}>{v.goal}</text>
          </node>
        </node>
        {rows.map((s, i) => (
          <node
            key={s.civ.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: { horizontal: 14, vertical: 10 },
              borderRadius: 3,
              backgroundColor: s.civ.player
                ? "rgba(217, 183, 108, 0.08)"
                : "rgba(255, 255, 255, 0.025)",
              border: 1,
              borderColor: s.civ.player
                ? C.goldLine
                : "rgba(255, 255, 255, 0.05)",
            }}
          >
            <text
              style={{
                width: 24,
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 18,
                color: C.gold,
              }}
            >
              {`${i + 1}`}
            </text>
            <Crest civ={s.civ} size={42} />
            <node style={{ width: 200, flexDirection: "column", gap: 2 }}>
              <text
                style={{ fontSize: 14, fontWeight: "semibold", color: C.text }}
              >
                {s.civ.player ? `${s.civ.name} (you)` : s.civ.name}
              </text>
              <text style={{ fontSize: 12, color: C.muted }}>
                {s.civ.leader}
              </text>
            </node>
            <Bar
              value={s.progress}
              width={380}
              height={12}
              color={s.civ.color}
            />
            <text style={{ fontSize: 12, color: C.text }}>{s.note}</text>
          </node>
        ))}
      </node>
    );
  }

  const all = VICTORIES.map((v) => ({
    v,
    rows: standings(v.tab, world, game),
  }));
  const civs = [...world.civs].sort(
    (a, b) =>
      game.history[b.id].score.at(-1)! - game.history[a.id].score.at(-1)!,
  );
  return (
    <node
      style={{
        flexDirection: "column",
        padding: { horizontal: 40, vertical: 22 },
        gap: 10,
      }}
    >
      <node
        style={{ flexDirection: "row", padding: { horizontal: 14 }, gap: 16 }}
      >
        <text style={{ ...caps, width: 300, color: C.muted }}>
          CIVILIZATION
        </text>
        <text style={{ ...caps, width: 90, color: C.muted }}>SCORE</text>
        {VICTORIES.map((v) => (
          <node
            key={v.tab}
            style={{
              width: 92,
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
            }}
          >
            <Icon name={v.icon} size={13} color={v.color} />
            <text style={{ ...caps, fontSize: 10, color: C.muted }}>
              {v.tab.toUpperCase()}
            </text>
          </node>
        ))}
      </node>
      {civs.map((civ, i) => (
        <node
          key={civ.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            padding: { horizontal: 14, vertical: 10 },
            borderRadius: 3,
            backgroundColor: civ.player
              ? "rgba(217, 183, 108, 0.08)"
              : "rgba(255, 255, 255, 0.025)",
            border: 1,
            borderColor: civ.player ? C.goldLine : "rgba(255, 255, 255, 0.05)",
          }}
        >
          <node
            style={{
              width: 300,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <text
              style={{
                width: 22,
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 18,
                color: C.gold,
              }}
            >
              {`${i + 1}`}
            </text>
            <Crest civ={civ} size={46} />
            <node style={{ flexDirection: "column", gap: 2 }}>
              <text
                style={{ fontSize: 15, fontWeight: "semibold", color: C.text }}
              >
                {civ.player ? `${civ.name} (you)` : civ.name}
              </text>
              <text style={{ fontSize: 12, color: C.muted }}>{civ.leader}</text>
            </node>
          </node>
          <text
            style={{
              width: 90,
              fontFamily: Fonts.display,
              fontWeight: "bold",
              fontSize: 22,
              color: C.goldHi,
            }}
          >
            {`${Math.round(game.history[civ.id].score.at(-1)!)}`}
          </text>
          {all.map(({ v, rows }) => {
            const s = rows.find((r) => r.civ.id === civ.id)!;
            return (
              <node
                key={v.tab}
                style={{ width: 92, flexDirection: "column", gap: 4 }}
              >
                <Bar value={s.progress} width={80} height={6} color={v.color} />
                <text
                  style={{ fontSize: 11, color: C.muted }}
                >{`${Math.round(Math.min(1, s.progress) * 100)}%`}</text>
              </node>
            );
          })}
        </node>
      ))}
    </node>
  );
}
