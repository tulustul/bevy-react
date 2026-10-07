import { useEffect, useRef, useState } from "react";
import { bevy } from "./bevy";
import { useDebug, useKeys } from "./hooks";
import { Credits } from "./screens/Credits";
import { Confirm } from "./screens/Dialog";
import { GameHud, World } from "./screens/InGame";
import { Loading } from "./screens/Loading";
import { MainMenu, type MenuEntry } from "./screens/MainMenu";
import { NewGame } from "./screens/newgame/NewGame";
import { Saves } from "./screens/saves/Saves";
import { Settings } from "./screens/settings/Settings";
import { useLiveSettings, useSettings } from "./screens/settings/store";
import { Splash } from "./screens/Splash";
import { Title } from "./screens/Title";
import { sfx } from "./sound";
import {
  NEW_CHARACTER,
  PROLOGUE,
  SEED_SAVES,
  type Character,
  type Lifepath,
  type Save,
} from "./store";
import { SCANLINES } from "./theme";
import { FILL } from "./ui/kit";

export type Screen =
  | "splash"
  | "title"
  | "menu"
  | "newgame"
  | "load"
  | "save"
  | "settings"
  | "credits"
  | "loading"
  | "game";

const MAIN: MenuEntry[] = [
  { id: "newgame", label: "NEW GAME" },
  { id: "load", label: "LOAD GAME" },
  { id: "settings", label: "SETTINGS" },
  { id: "credits", label: "CREDITS" },
  { id: "quit", label: "QUIT GAME" },
];

const PAUSE: MenuEntry[] = [
  { id: "resume", label: "RESUME" },
  { id: "save", label: "SAVE GAME" },
  { id: "load", label: "LOAD GAME" },
  { id: "settings", label: "SETTINGS" },
  { id: "credits", label: "CREDITS" },
  { id: "exit", label: "EXIT TO MAIN MENU" },
  { id: "quit", label: "QUIT GAME" },
];

type Dialog = { text: string; onConfirm: () => void } | null;

/** How long a screen change glitches. */
const MORPH_MS = 420;

/** The front end: one screen at a time over the datascape (or, in game,
 *  over the world), every change glitching through the `glitchSwap` morph. */
export function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [character, setCharacter] = useState<Character>(NEW_CHARACTER);
  const [saves, setSaves] = useState<Save[]>(SEED_SAVES);
  /** The game being played (or being loaded into). */
  const [game, setGame] = useState<Save | null>(null);
  const [inGame, setInGame] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [debugPortal, setDebugPortal] = useState<string[] | null>(null);
  const settings = useSettings();
  // The settings that change Bevy (camera, window, color grading, volume).
  useLiveSettings();

  // Screen changes morph. The morph is armed only while a change is in
  // flight (so an idle screen isn't a full-screen layer, and its live parts
  // need no care): promote under the current screen, flip the key (and
  // apply the change) a few frames later, demote once the morph has run. A
  // change while one is in flight flips at once — the morph restarts from
  // wherever it was.
  const [morph, setMorph] = useState<Screen | null>(null);
  const timers = useRef<{
    flip?: ReturnType<typeof setTimeout>;
    end?: ReturnType<typeof setTimeout>;
  }>({});
  const go = (next: Screen, apply?: () => void) => {
    setDialog(null);
    const t = timers.current;
    clearTimeout(t.end);
    const flip = () => {
      apply?.();
      setScreen(next);
      setMorph(next);
      t.end = setTimeout(() => setMorph(null), MORPH_MS + 120);
    };
    if (morph) {
      clearTimeout(t.flip);
      flip();
    } else {
      setMorph(screen);
      t.flip = setTimeout(flip, 60);
    }
  };
  const menu = () => go("menu");

  // The world camera films the running game's lifepath.
  const lifepath: Lifepath | null =
    inGame && game ? game.character.lifepath : null;
  useEffect(() => {
    bevy.dioramas.world({ lifepath });
  }, [lifepath]);

  const play = (save: Save) =>
    go("loading", () => {
      setGame(save);
      setInGame(false);
    });

  const pick = (id: string) => {
    sfx("click");
    switch (id) {
      case "newgame":
        setCharacter(NEW_CHARACTER);
        return go("newgame");
      case "resume":
        return go("game");
      case "load":
      case "save":
      case "settings":
      case "credits":
        return go(id);
      case "exit":
        return setDialog({
          text: "Exit to the main menu? Any unsaved progress will be lost.",
          onConfirm: () =>
            go("menu", () => {
              setInGame(false);
              setGame(null);
            }),
        });
      case "quit":
        return setDialog({
          text: "Are you sure you want to quit the game?",
          // In the browser an exited app is a frozen page: start over.
          onConfirm: () =>
            typeof location === "undefined"
              ? bevy.app.quit(null)
              : location.reload(),
        });
    }
  };

  const start = () =>
    play({
      id: 0,
      ...PROLOGUE[character.lifepath],
      name: "AutoSave",
      level: 1,
      playtime: 0,
      date: stamp(),
      character,
    });

  const load = (save: Save) => {
    if (!inGame) return play(save);
    setDialog({
      text: "Load this save? Any unsaved progress will be lost.",
      onConfirm: () => play(save),
    });
  };

  const save = (overwrite: Save | null) => {
    if (!game) return;
    const id = Math.max(0, ...saves.map((s) => s.id)) + 1;
    const fresh: Save = {
      ...game,
      id,
      name: overwrite?.name ?? `ManualSave-${id}`,
      playtime: game.playtime + 23,
      date: stamp(),
    };
    setSaves([fresh, ...saves.filter((s) => s.id !== overwrite?.id)]);
  };

  // In game, Esc pauses (every other screen handles its own Esc).
  useKeys((e) => {
    if (e.key === "Escape" && screen === "game" && !dialog) {
      sfx("back");
      go("menu");
    }
  });

  // Scripted steps for `--shoot` (see `shoot.rs`): `go <screen>`,
  // `play <lifepath>` (straight into the game, paused with `go menu`),
  // `pick <entry>`, `portal <target> <width> <height>`.
  useDebug("go", (s) => go(s as Screen));
  // `portal <target> <width> <height>`: show a render target, centered.
  useDebug("portal", (arg) => setDebugPortal(arg ? arg.split(" ") : null));
  useDebug("play", (l) => {
    const lifepath = l as Lifepath;
    setGame({
      ...SEED_SAVES[0],
      ...PROLOGUE[lifepath],
      character: { ...NEW_CHARACTER, lifepath },
    });
    setInGame(true);
    go("game");
  });
  // `pick <entry>`: as if a menu entry were clicked (`quit` → the dialog).
  useDebug("pick", pick);

  const paused = inGame && screen !== "game";

  return (
    <node style={{ width: "100%", height: "100%" }}>
      {inGame && game ? (
        <World lifepath={game.character.lifepath} paused={paused} />
      ) : (
        settings.filmGrain && (
          // Film grain over the 3D world, under the menus.
          <node
            style={{
              ...FILL,
              filter: { name: "grain", params: { amount: 0.07 } },
            }}
          />
        )
      )}
      <node
        style={{
          ...FILL,
          ...(morph && {
            // Mid-change, whatever is live underneath keeps moving.
            cache: "never",
            // With UI glitches off (INTERFACE settings), screens cross-fade.
            morphFilter: settings.uiGlitch
              ? { key: morph, name: "glitchSwap" }
              : { key: morph, name: "crossfade", params: { spread: 0 } },
            transition: {
              morphFilter: { duration: MORPH_MS, easing: "linear" },
            },
          }),
        }}
      >
        {screen === "splash" && <Splash onDone={() => go("title")} />}
        {screen === "title" && <Title onContinue={menu} />}
        {screen === "menu" && (
          <MainMenu
            entries={inGame ? PAUSE : MAIN}
            onPick={pick}
            onBack={inGame ? () => go("game") : undefined}
            version="0.7.0"
          />
        )}
        {screen === "newgame" && (
          <NewGame
            character={character}
            onChange={setCharacter}
            onBack={menu}
            onStart={start}
          />
        )}
        {(screen === "load" || screen === "save") && (
          <Saves
            mode={screen}
            saves={saves}
            inGame={inGame}
            onLoad={load}
            onSave={save}
            onDelete={(s) => setSaves(saves.filter((x) => x.id !== s.id))}
            onClose={menu}
          />
        )}
        {screen === "settings" && <Settings onClose={menu} />}
        {screen === "credits" && <Credits onClose={menu} />}
        {screen === "loading" && game && (
          <Loading
            lifepath={game.character.lifepath}
            onDone={() => go("game", () => setInGame(true))}
          />
        )}
        {screen === "game" && (
          <GameHud onPause={() => go("menu")} game={game ?? undefined} />
        )}
        {dialog && (
          <Confirm
            text={dialog.text}
            onConfirm={dialog.onConfirm}
            onCancel={() => setDialog(null)}
          />
        )}
      </node>
      {debugPortal && (
        <node
          style={{ ...FILL, alignItems: "center", justifyContent: "center" }}
        >
          <portal
            target={debugPortal[0]}
            style={{
              width: Number(debugPortal[1] ?? 640),
              height: Number(debugPortal[2] ?? 360),
              cache: "never",
            }}
          />
        </node>
      )}
      {settings.scanlines && (
        <node style={{ ...FILL, backgroundImage: SCANLINES }} />
      )}
    </node>
  );
}

/** Now, as the save list shows it: "10/07/91, 9:12 PM" (the game's year). */
function stamp() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = d.getHours() < 12 ? "AM" : "PM";
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${mm}/${dd}/91, ${h}:${m} ${ampm}`;
}
