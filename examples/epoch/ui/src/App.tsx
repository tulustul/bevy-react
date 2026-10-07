import { useEffect, useReducer, useState } from "react";
import { bevy, type TileInfo, type WorldInfo } from "./bevy";
import { CityPanel } from "./city/CityPanel";
import { ledger, newGame, step, type Action, type Game } from "./game";
import { useDebug, useEvent, useWindowSize } from "./hooks";
import { ActionPanel } from "./hud/ActionPanel";
import { Banners, TileTooltip, type Selection } from "./hud/Banners";
import { Leaders } from "./hud/Leaders";
import { Notifications } from "./hud/Notifications";
import { LaunchBar, TopBar, type ScreenId } from "./hud/TopBar";
import { Trackers } from "./hud/Trackers";
import { UnitPanel } from "./hud/UnitPanel";
import { RANKING_TABS, Rankings } from "./screens/Rankings";
import { REPORT_TABS, Reports } from "./screens/Reports";
import { Screen } from "./screens/Screen";
import { TechTree } from "./screens/TechTree";

/** Epoch: the world comes from Bevy once; everything else on screen is
 *  React over it. */
export function App() {
  const win = useWindowSize();
  const [world, setWorld] = useState<WorldInfo | null>(null);
  useEffect(() => {
    bevy.map.world().then(setWorld);
  }, []);
  if (!world || win.width === 0) return null;
  return <Epoch world={world} width={win.width} height={win.height} />;
}

const TITLES: Record<ScreenId, string> = {
  tech: "Technology",
  reports: "Reports",
  rankings: "World Rankings",
};

function Epoch({
  world,
  width,
  height,
}: {
  world: WorldInfo;
  width: number;
  height: number;
}) {
  const [game, dispatch] = useReducer(
    (g: Game, a: Action) => step(world, g, a),
    world,
    newGame,
  );
  const [screen, setScreen] = useState<ScreenId | null>(null);
  const [tabs, setTabs] = useState({
    reports: REPORT_TABS[0],
    rankings: RANKING_TABS[0],
  });
  const [selection, setSelection] = useState<Selection>(null);
  const [hover, setHover] = useState<TileInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [lens, setLens] = useState(false);
  const player = world.civs[0];
  const civ = (id: string) => world.civs.find((c) => c.id === id)!;
  const city =
    selection?.kind === "city"
      ? world.cities.find((c) => c.id === selection.id)
      : undefined;
  const unit =
    selection?.kind === "unit"
      ? world.units.find((u) => u.id === selection.id)
      : undefined;

  const select = (s: Selection) => {
    setSelection(s);
    const at =
      s?.kind === "city"
        ? world.cities.find((c) => c.id === s.id)
        : world.units.find((u) => u.id === s?.id);
    const tile = at ? { col: at.col, row: at.row } : null;
    bevy.map.select(tile);
    if (tile && s?.kind === "city") bevy.map.focus({ tile, zoom: 0.2 });
  };

  const nextTurn = () => {
    if (busy) return;
    if (!game.research) return setScreen("tech");
    setBusy(true);
    setTimeout(() => {
      dispatch({ type: "turn" });
      setBusy(false);
    }, 650);
  };

  const toggleLens = () => {
    setLens(!lens);
    bevy.map.lens({ political: !lens });
  };

  useEvent("map.hover", setHover);
  useEvent("map.click", (tile) =>
    select(
      tile.settlement
        ? { kind: "city", id: tile.settlement }
        : tile.unit
          ? { kind: "unit", id: tile.unit }
          : null,
    ),
  );
  useEvent("keyDown", (e) => {
    if (e.repeat) return;
    if (e.key === "Escape") {
      if (screen) setScreen(null);
      else select(null);
    }
    if (e.key === "Enter" && !screen) nextTurn();
  });

  // Scripted steps for `--shoot` (see `shoot.rs`).
  useDebug("screen", (s) => setScreen(s === "none" ? null : (s as ScreenId)));
  useDebug("tab", (t) =>
    setTabs((tabs) =>
      REPORT_TABS.includes(t)
        ? { ...tabs, reports: t }
        : { ...tabs, rankings: t },
    ),
  );
  useDebug("city", (id) => select({ kind: "city", id }));
  useDebug("unit", (id) => select({ kind: "unit", id }));
  useDebug("turn", () => dispatch({ type: "turn" }));
  useDebug("lens", toggleLens);

  const boxW = Math.min(1280, width - 60);
  const boxH = height - 32 - 40;
  const label = busy
    ? "PLEASE WAIT"
    : game.research
      ? "NEXT TURN"
      : "CHOOSE RESEARCH";

  return (
    <node style={{ width: "100%", height: "100%" }}>
      {!screen && (
        <>
          <Banners
            world={world}
            game={game}
            selection={selection}
            onSelect={select}
          />
          {hover && (
            <TileTooltip tile={hover} cursor={world.cursor} world={world} />
          )}
          {city ? (
            <CityPanel
              key={city.id}
              city={city}
              civ={civ(city.civ)}
              game={game}
              dispatch={dispatch}
              onClose={() => select(null)}
            />
          ) : (
            <>
              <LaunchBar onOpen={setScreen} research={!!game.research} />
              <Trackers
                game={game}
                player={player.id}
                onResearch={() => setScreen("tech")}
              />
            </>
          )}
          <Leaders
            rivals={world.civs.slice(1)}
            game={game}
            onOpen={() => setScreen("rankings")}
          />
          <Notifications
            notes={game.notes}
            onDismiss={(id) => dispatch({ type: "dismiss", id })}
          />
          <ActionPanel
            label={label}
            busy={busy}
            lens={lens}
            onNext={nextTurn}
            onLens={toggleLens}
          />
          {unit && (
            <UnitPanel
              key={unit.id}
              unit={unit}
              civ={civ(unit.civ)}
              onClose={() => select(null)}
            />
          )}
        </>
      )}
      {screen && (
        <Screen
          title={TITLES[screen]}
          width={boxW}
          height={boxH}
          tabs={
            screen === "reports"
              ? REPORT_TABS
              : screen === "rankings"
                ? RANKING_TABS
                : undefined
          }
          tab={screen === "reports" ? tabs.reports : tabs.rankings}
          onTab={(t) => setTabs((tabs) => ({ ...tabs, [screen]: t }))}
          onClose={() => setScreen(null)}
        >
          {screen === "tech" ? (
            <TechTree
              game={game}
              player={player.id}
              dispatch={dispatch}
              width={boxW}
              height={boxH}
            />
          ) : screen === "reports" ? (
            <Reports
              tab={tabs.reports}
              world={world}
              game={game}
              width={boxW}
              height={boxH}
            />
          ) : (
            <Rankings tab={tabs.rankings} world={world} game={game} />
          )}
        </Screen>
      )}
      <TopBar game={game} player={player.id} net={ledger(world, game).net} />
    </node>
  );
}
