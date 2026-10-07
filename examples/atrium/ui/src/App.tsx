import { useEffect, useState } from "react";
import { bevy, type LensInfo, type PlaceInfo } from "./bevy";
import { APPS, type AppId } from "./apps";
import { Lenses } from "./apps/Lenses";
import { Notes, STEPS, type Step } from "./apps/Notes";
import { Skies } from "./apps/Skies";
import { useDebug } from "./hooks";
import { Dock } from "./shell/Dock";
import { GlobeLabel } from "./shell/GlobeLabel";
import { Hud } from "./shell/Hud";
import { Window } from "./shell/Window";

const CLOSED: Record<AppId, boolean> = {
  skies: false,
  notes: false,
  lenses: false,
};

/** Atrium: the windows (each a `<surface>` on a pane of glass in the
 *  world), and the screen-space shell — the HUD, the dock, the globe's
 *  label. App state lives here; where the windows are is Bevy's. */
export function App() {
  const [open, setOpen] = useState(CLOSED);
  const [places, setPlaces] = useState<PlaceInfo[]>([]);
  const [lenses, setLenses] = useState<LensInfo[]>([]);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [hour, setHour] = useState(0);
  const [done, setDone] = useState<Set<Step>>(new Set());

  const place = places.find((p) => p.id === placeId);
  const tick = (step: Step) =>
    setDone((d) => (d.has(step) ? d : new Set(d).add(step)));

  const show = (app: AppId, value: boolean) => {
    setOpen((o) => ({ ...o, [app]: value }));
    bevy.panes.show({ app, open: value });
  };
  const press = (app: AppId) =>
    open[app] ? bevy.panes.summon({ app }) : show(app, true);

  const pick = (p: PlaceInfo) => {
    setPlaceId(p.id);
    setHour(p.hour);
    bevy.skies.set({ place: p.id, hour: p.hour, scrub: false });
    if (p.id !== places[0]?.id) tick("sky");
  };
  const scrub = (h: number) => {
    if (!place) return;
    setHour(h);
    bevy.skies.set({ place: place.id, hour: h, scrub: true });
  };

  // Every step done: lanterns rise off the lake (once).
  useEffect(() => {
    if (done.size === STEPS.length) bevy.atrium.celebrate(null);
  }, [done.size]);

  useEffect(() => {
    bevy.skies.places().then((all) => {
      setPlaces(all);
      setPlaceId(all[0].id);
      setHour(all[0].hour);
    });
    bevy.lenses.list().then(setLenses);
    const offs = [
      bevy.on("tour.looked", () => tick("look")),
      bevy.on("tour.moved", () => tick("move")),
      // The sky's own clock while it eases: a time-lapse sweeps the HUD,
      // the scrubber and the globe's label through the hours.
      bevy.on("skies.now", ({ hour }) => setHour(hour)),
    ];
    // The windows condense out of the air one by one.
    const timers = APPS.map((a, i) =>
      setTimeout(() => show(a.id, true), 500 + i * 280),
    );
    return () => {
      offs.forEach((off) => off());
      timers.forEach(clearTimeout);
    };
  }, []);

  // Scripted steps for `--shoot` (see `shoot.rs`).
  useDebug("pick", (id) => {
    const p = places.find((p) => p.id === id);
    if (p) pick(p);
  });
  useDebug("hour", (h) => scrub(Number(h)));
  useDebug("close", (app) => show(app as AppId, false));
  useDebug("tour", (steps) => steps.split(",").forEach((s) => tick(s as Step)));

  return (
    <>
      <Window app="skies" onClose={() => show("skies", false)}>
        <Skies
          places={places}
          place={place}
          hour={hour}
          onPick={pick}
          onScrub={scrub}
        />
      </Window>
      <Window app="notes" onClose={() => show("notes", false)}>
        <Notes done={done} onTyped={() => tick("note")} />
      </Window>
      <Window app="lenses" onClose={() => show("lenses", false)}>
        <Lenses lenses={lenses} onFound={() => tick("lens")} />
      </Window>

      <Hud place={place} hour={hour} />
      {place && open.skies && <GlobeLabel place={place} hour={hour} />}
      <Dock open={open} onPress={press} />
    </>
  );
}
