import { useEffect, useRef, useSyncExternalStore } from "react";
import { bevy } from "../../bevy";
import { DEFAULTS, RESOLUTIONS } from "./data";

export type SettingValue = number | boolean | string;

/** The settings, by row id (`data.ts`). Kept on `globalThis` so a hot
 *  reload (which re-runs this module) keeps them. */
type Store = {
  values: Record<string, SettingValue>;
  listeners: Set<() => void>;
};

const g = globalThis as { __cyberpunkSettings?: Store };
const store: Store = (g.__cyberpunkSettings ??= {
  values: {},
  listeners: new Set(),
});
// Rows added since the last reload start at their defaults.
store.values = { ...DEFAULTS, ...store.values };

function subscribe(listener: () => void) {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

/** Every setting, re-rendering on change. */
export function useSettings() {
  return useSyncExternalStore(subscribe, () => store.values);
}

export function setSettings(values: Record<string, SettingValue>) {
  store.values = { ...store.values, ...values };
  store.listeners.forEach((l) => l());
}

export function setSetting(id: string, value: SettingValue) {
  setSettings({ [id]: value });
}

/** Push the settings Bevy applies — the volumes, the camera, the gamma — on
 *  mount and whenever they change. VIDEO only on change: on mount it would
 *  only force the window main.rs opened back to the stored defaults. */
export function useLiveSettings() {
  const v = useSettings();
  const n = (id: string) => Number(v[id]);
  usePush(
    { master: n("master") / 100, sfx: n("sfx") / 100, music: n("music") / 100 },
    bevy.sound.volume,
  );
  usePush(
    {
      fov: n("fov"),
      aberration: v.aberration === true,
      focus: v.focus === true,
      flare: v.flare === true,
      blur: n("blur"),
    },
    bevy.settings.graphics,
  );
  usePush({ value: n("gamma") }, bevy.settings.gamma);
  const [width, height] = (RESOLUTIONS[n("resolution")] ?? "0x0")
    .split("x")
    .map(Number);
  usePush(
    { mode: n("mode"), width, height, vsync: v.vsync === true },
    bevy.settings.video,
    false,
  );
}

/** Send `value` whenever it differs from what was last sent (and on mount,
 *  unless `onMount` is false). */
function usePush<T>(value: T, push: (value: T) => void, onMount = true) {
  const key = JSON.stringify(value);
  const sent = useRef(onMount ? "" : key);
  useEffect(() => {
    if (sent.current === key) return;
    sent.current = key;
    push(JSON.parse(key));
  }, [key, push]);
}
