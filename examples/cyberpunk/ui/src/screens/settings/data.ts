// The settings, tab by tab. Every row with an `id` keeps its value in the
// store under that id (a selector stores the chosen option's index). Rows
// marked live in the comments reach Bevy (`useLiveSettings`); the rest are
// kept and shown, like a menu of a game that isn't running.

import type { SettingValue } from "./store";

export type Row =
  | { kind: "section"; label: string }
  | {
      kind: "select";
      id: string;
      label: string;
      options: string[];
      def: number;
    }
  | { kind: "toggle"; id: string; label: string; def: boolean }
  | {
      kind: "slider";
      id: string;
      label: string;
      min: number;
      max: number;
      step: number;
      def: number;
    }
  | { kind: "key"; id: string; label: string; def: string }
  | { kind: "info"; label: string; value: string };

export type Slider = Extract<Row, { kind: "slider" }>;

export type TabId =
  | "sound"
  | "controls"
  | "gameplay"
  | "graphics"
  | "video"
  | "language"
  | "interface"
  | "keys";

const section = (label: string): Row => ({ kind: "section", label });
const select = (
  id: string,
  label: string,
  options: string[],
  def = 0,
): Row => ({ kind: "select", id, label, options, def });
const toggle = (id: string, label: string, def = false): Row => ({
  kind: "toggle",
  id,
  label,
  def,
});
const slider = (
  id: string,
  label: string,
  min: number,
  max: number,
  def: number,
  step = 1,
): Slider => ({ kind: "slider", id, label, min, max, step, def });
const key = (id: string, label: string, def: string): Row => ({
  kind: "key",
  id,
  label,
  def,
});

/** The windowed sizes VIDEO offers (16:9). */
export const RESOLUTIONS = [
  "1280x720",
  "1366x768",
  "1600x900",
  "1920x1080",
  "2560x1440",
  "3200x1800",
  "3840x2160",
];

const LANGUAGES = [
  "English",
  "Deutsch",
  "Español",
  "Français",
  "Italiano",
  "Polski",
  "Português",
  "Čeština",
  "Magyar",
  "Türkçe",
];

/** GRAPHICS' Quick Preset options; the last one is what tweaking any row
 *  the presets set turns it into. */
const PRESET_NAMES = ["Low", "Medium", "High", "Ultra", "Custom"];
export const CUSTOM = PRESET_NAMES.length - 1;

/** What each preset sets (selectors by index). */
export const PRESETS: Record<string, SettingValue>[] = [
  { textures: 0, aberration: false, focus: false, flare: false, blur: 0 },
  { textures: 1, aberration: true, focus: false, flare: true, blur: 0 },
  { textures: 2, aberration: true, focus: true, flare: true, blur: 0 },
  { textures: 2, aberration: true, focus: true, flare: true, blur: 2 },
];

/** The gamma screen's one row (live). */
export const GAMMA = slider("gamma", "Gamma", 0.5, 2, 1, 0.05);

export const TABS: { id: TabId; label: string; rows: Row[] }[] = [
  {
    id: "sound",
    label: "SOUND",
    rows: [
      section("Dynamic Range"),
      select("dynamicRange", "Presets", [
        "Reference",
        "Hi-Fi Stereo",
        "Home Theater",
        "Late Night",
        "Headphones",
        "Compressed",
      ]),
      section("Volume"),
      // Live: master, sfx and music.
      slider("master", "Master Volume", 0, 100, 100),
      slider("sfx", "SFX Volume", 0, 100, 100),
      slider("dialogue", "Dialogue Volume", 0, 100, 100),
      slider("music", "Music Volume", 0, 100, 100),
      slider("radio", "Vehicle Radio Volume", 0, 100, 100),
      section("Misc"),
      toggle("alertPings", "Mute Alert Pings"),
      toggle("streamSafe", "Stream-Safe Music"),
      section("Subtitles"),
      toggle("subsCinematic", "Cinematic", true),
      toggle("subsOverhead", "Overhead", true),
    ],
  },
  {
    id: "controls",
    label: "CONTROLS",
    rows: [
      slider("vibration", "Controller Vibration", 0, 100, 100),
      slider("innerDeadZone", "Inner Dead Zone", 0, 0.5, 0.05, 0.01),
      slider("outerDeadZone", "Outer Dead Zone", 0.5, 1, 0.9, 0.01),
      section("First-Person Camera (Mouse)"),
      slider("zoomSensitivity", "Zoom Sensitivity", 0, 2, 1, 0.1),
      slider("fpVertical", "Vertical Sensitivity", 1, 30, 5),
      slider("fpHorizontal", "Horizontal Sensitivity", 1, 30, 5),
      toggle("fpInvertY", "Invert Vertical Axis"),
      toggle("fpInvertX", "Invert Horizontal Axis"),
      section("Third-Person Camera (Mouse)"),
      slider("tpVertical", "Vertical Sensitivity", 1, 30, 3),
      slider("tpHorizontal", "Horizontal Sensitivity", 1, 30, 3),
      toggle("tpInvertY", "Invert Vertical Axis"),
    ],
  },
  {
    id: "gameplay",
    label: "GAMEPLAY",
    rows: [
      section("Accessibility"),
      select(
        "aimAssist",
        "Aim Assist",
        ["Off", "Light", "Standard", "Strong"],
        2,
      ),
      toggle("snapToTarget", "Snap to Target", true),
      select(
        "meleeAssist",
        "Aim Assist - Melee",
        ["Off", "Light", "Standard"],
        2,
      ),
      select("cameraSway", "Camera Sway", ["Off", "Reduced", "Full"], 2),
      section("Performance"),
      select("crowdDensity", "Crowd Density", ["Low", "Medium", "High"], 2),
      toggle("slowStorage", "Slow Storage Mode"),
      section("Miscellaneous"),
      toggle("tutorials", "Tutorials", true),
      select(
        "skipDialogue",
        "Skipping Dialogue",
        ["Off", "Skip By Line", "Skip All"],
        1,
      ),
    ],
  },
  {
    id: "graphics",
    label: "GRAPHICS",
    rows: [
      // Live: everything from Field of View to Motion Blur (Film Grain in
      // the UI itself), and the preset that sets them.
      select("preset", "Quick Preset", PRESET_NAMES, 2),
      select("textures", "Texture Quality", ["Low", "Medium", "High"], 2),
      section("Basic"),
      slider("fov", "Field of View", 50, 100, 60),
      toggle("filmGrain", "Film Grain", true),
      toggle("aberration", "Chromatic Aberration", true),
      toggle("focus", "Depth of Field", true),
      toggle("flare", "Lens Flare", true),
      select("blur", "Motion Blur", ["Off", "Low", "High"]),
      section("Advanced"),
      toggle("contactShadows", "Contact Shadows"),
      select("anisotropy", "Anisotropy", ["1", "2", "4", "8", "16"], 2),
    ],
  },
  {
    id: "video",
    label: "VIDEO",
    rows: [
      // Live: VSync, Windowed Mode, Resolution.
      section("Display"),
      select("monitor", "Monitor", ["0", "1"]),
      toggle("vsync", "VSync", true),
      toggle("fpsCap", "Maximum FPS"),
      select("mode", "Windowed Mode", ["Windowed", "Borderless", "Fullscreen"]),
      // The window main.rs opens.
      select("resolution", "Resolution", RESOLUTIONS, 2),
      { kind: "info", label: "HDR Mode", value: "None" },
    ],
  },
  {
    id: "language",
    label: "LANGUAGE",
    rows: [
      select("voiceLanguage", "Audio", LANGUAGES),
      select("subtitleLanguage", "Subtitles", LANGUAGES),
      select("textLanguage", "Interface", LANGUAGES),
    ],
  },
  {
    id: "interface",
    label: "INTERFACE",
    rows: [
      // Live: the App reads both.
      toggle("uiGlitch", "UI Glitch Effects", true),
      toggle("scanlines", "Scanlines", true),
      select("colorblind", "Colorblind Modes", [
        "Off",
        "Protanopia",
        "Deuteranopia",
        "Tritanopia",
      ]),
      select(
        "damageNumbers",
        "Damage Numbers",
        ["Off", "Critical Only", "Both"],
        2,
      ),
      toggle("hitMarker", "Hit Marker", true),
      section("HUD Visibility"),
      toggle("hudMinimap", "Minimap", true),
      toggle("hudHealth", "Health Bar", true),
      toggle("hudAmmo", "Ammo Counter", true),
      toggle("hudQuest", "Quest Tracker", true),
      toggle("hudHints", "Hints", true),
    ],
  },
  {
    id: "keys",
    label: "KEY BINDINGS",
    rows: [
      section("Memory Replay"),
      key("key.replayPause", "Pause Replay (Toggle)", "Space"),
      key("key.replayForward", "Fast-Forward Replay", "KeyE"),
      key("key.replayRewind", "Rewind Replay", "KeyQ"),
      key("key.replayLayer", "Switch Replay Layer", "ShiftLeft"),
      key("key.replayExit", "Exit Replay", "KeyX"),
      section("General"),
      key("key.zoomIn", "Zoom In", "MouseWheelUp"),
      key("key.zoomOut", "Zoom Out", "MouseWheelDown"),
      key("key.tag", "Tag", "MouseMiddle"),
      section("Exploration and Combat"),
      key("key.forward", "Move Forward", "KeyW"),
      key("key.back", "Move Backward", "KeyS"),
      key("key.left", "Move Left", "KeyA"),
      key("key.right", "Move Right", "KeyD"),
      key("key.crouch", "Crouch", "KeyC"),
      key("key.interact", "Interact", "KeyF"),
    ],
  },
];

/** Each row's default, by id. */
export function defaults(rows: Row[]): Record<string, SettingValue> {
  const out: Record<string, SettingValue> = {};
  for (const row of rows) if ("id" in row) out[row.id] = row.def;
  return out;
}

/** Every setting's default. */
export const DEFAULTS = defaults([...TABS.flatMap((t) => t.rows), GAMMA]);
