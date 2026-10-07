// The new game's copy and option tables: the difficulty and lifepath blurbs,
// the appearance options (values live in `character.look`), the presets and
// the attribute rules.

import type { AttributeId, Character, Difficulty, Lifepath } from "../../store";

export const DIFFICULTY_TEXT: Record<Difficulty, string> = {
  easy: "For those here for the story. Enemies go down quickly, hit softly, and the streets forgive most bad decisions. Sit back and take in the sights.",
  normal:
    "The intended experience. Firefights take some thought, and decent gear and well-chosen cyberware will keep you breathing on most nights.",
  hard: "Enemies are deadlier and they think before they shoot. Staying alive will depend on how well you use your perks, implants, gadgets and stims.",
  veryhard:
    "No mercy. Any firefight could be your last: plan every move, read every room and spend every resource as if nothing comes after it.",
};

export const LIFEPATH_TEXT: Record<Lifepath, string> = {
  nomad:
    "Raised on the open road past the Sable City walls, you learned to fix a dead engine, read a dust storm and trust nobody outside the clan. The city sees an outsider. You see a cage with neon on the bars.",
  streetkid:
    "Kessler's alleys raised you. You know which fixer pays, which gang owns which corner and which cop looks away for a price. Out here a favor is currency and a name is armor, and you have spent your life earning both.",
  corpo:
    "Twelve years in Tenkai's glass tower taught you that truth is a resource and loyalty has a price tag. You have buried rivals in audits and sold secrets between floors, smiling the whole way. Up there, nobody has friends. Only leverage.",
};

/** One row of the appearance list. `swatches` makes it a color option (the
 *  grid button opens them); otherwise it has `count` numbered variants. */
export type LookOption = {
  id: string;
  label: string;
  count: number;
  swatches?: string[];
};

export const SKIN_TONES = [
  "#f3d7c0",
  "#ebc5a6",
  "#dfb08b",
  "#d09c76",
  "#c08664",
  "#ad7553",
  "#986244",
  "#825138",
  "#6c412d",
  "#573324",
  "#43281d",
  "#8fa7a2",
];

export const HAIR_COLORS = [
  "#1b1716",
  "#3b2619",
  "#6b4226",
  "#8a3b1e",
  "#b5562a",
  "#d9b56c",
  "#e8e2d0",
  "#8c8c8c",
  "#ff4fa3",
  "#3fe0ff",
  "#7cff4f",
  "#8f5bff",
];

export const EYE_COLORS = [
  "#6fb7ff",
  "#8a6038",
  "#5aa05a",
  "#a5adb5",
  "#e8b847",
  "#ff5050",
  "#5ef6ff",
  "#c77dff",
];

/** The voice-tone row is the character's `voice`, not a `look` value. */
export const VOICE = {
  label: "VOICE TONE",
  names: ["MASCULINE", "FEMININE"],
};

export const LOOK_OPTIONS: LookOption[] = [
  {
    id: "skinTone",
    label: "SKIN TONE",
    count: SKIN_TONES.length,
    swatches: SKIN_TONES,
  },
  { id: "skinType", label: "SKIN TYPE", count: 8 },
  { id: "hairstyle", label: "HAIRSTYLE", count: 12 },
  {
    id: "hairColor",
    label: "HAIR COLOR",
    count: HAIR_COLORS.length,
    swatches: HAIR_COLORS,
  },
  { id: "eyes", label: "EYES", count: EYE_COLORS.length },
  { id: "eyebrows", label: "EYEBROWS", count: 6 },
  { id: "nose", label: "NOSE", count: 6 },
  { id: "mouth", label: "MOUTH", count: 6 },
  { id: "jaw", label: "JAW", count: 6 },
  { id: "ears", label: "EARS", count: 4 },
  { id: "cyberware", label: "CYBERWARE", count: 8 },
  { id: "scars", label: "SCARS", count: 6 },
  { id: "tattoos", label: "TATTOOS", count: 8 },
  { id: "piercings", label: "PIERCINGS", count: 6 },
  { id: "makeup", label: "MAKEUP", count: 6 },
  { id: "nails", label: "NAILS", count: 5 },
];

/** A look value (every option starts at its first variant). */
export function look(c: Character, id: string) {
  return c.look[id] ?? 0;
}

/** The four ready-made faces left of the ID card. */
export const PRESETS: Record<string, number>[] = [
  {
    skinTone: 8,
    skinType: 2,
    hairstyle: 1,
    hairColor: 4,
    eyes: 1,
    eyebrows: 2,
    jaw: 2,
    cyberware: 0,
    scars: 1,
    tattoos: 0,
    piercings: 1,
    makeup: 0,
  },
  {
    skinTone: 4,
    skinType: 1,
    hairstyle: 7,
    hairColor: 0,
    eyes: 0,
    eyebrows: 4,
    jaw: 4,
    cyberware: 1,
    scars: 0,
    tattoos: 5,
    piercings: 0,
    makeup: 0,
  },
  {
    skinTone: 1,
    skinType: 0,
    hairstyle: 4,
    hairColor: 9,
    eyes: 6,
    eyebrows: 1,
    jaw: 1,
    cyberware: 3,
    scars: 0,
    tattoos: 2,
    piercings: 3,
    makeup: 2,
  },
  {
    skinTone: 10,
    skinType: 4,
    hairstyle: 2,
    hairColor: 8,
    eyes: 5,
    eyebrows: 5,
    jaw: 3,
    cyberware: 7,
    scars: 4,
    tattoos: 7,
    piercings: 5,
    makeup: 3,
  },
];

export const ATTR_MIN = 3;
export const ATTR_MAX = 6;
/** Points to spend on top of the starting 3 in each attribute. */
export const ATTR_POINTS = 7;

export const ATTRIBUTES: {
  id: AttributeId;
  name: string;
  short: string;
  text: string;
  effects: string[];
}[] = [
  {
    id: "body",
    name: "Body",
    short: "BOD",
    text: "Body is raw strength and the punishment you can take. Every level in Body will:",
    effects: [
      "Raise your maximum Health by 5",
      "Raise melee and unarmed damage by 2%",
      "Shorten the time you stay stunned",
    ],
  },
  {
    id: "intelligence",
    name: "Intelligence",
    short: "INT",
    text: "Intelligence is how fast your mind moves through the Net. Every level in Intelligence will:",
    effects: [
      "Add 1 unit of cyberdeck RAM",
      "Raise quickhack damage by 2%",
      "Cut breach protocol time by 0.5 sec",
    ],
  },
  {
    id: "reflexes",
    name: "Reflexes",
    short: "REF",
    text: "Reflexes decide how quickly you move and react. On top of your movement speed, every level in Reflexes will:",
    effects: [
      "Raise your chance to evade attacks by 1%",
      "Raise critical hit chance by 1%",
      "Raise damage from blade implants by 3%",
    ],
  },
  {
    id: "tech",
    name: "Technical Ability",
    short: "TEC",
    text: "Technical Ability is your feel for machines, weapons and implants. Every level in Technical Ability will:",
    effects: [
      "Raise your armor by 4%",
      "Unlock better crafting specs",
      "Raise damage from gadgets by 3%",
    ],
  },
  {
    id: "cool",
    name: "Cool",
    short: "COL",
    text: "Cool is how steady you stay when everything goes loud. Every level in Cool will:",
    effects: [
      "Raise critical damage by 2%",
      "Make you 0.5% harder to detect",
      "Raise resistance to fear and panic by 1%",
    ],
  },
];

/** FNV-1a: the ID number and barcode are derived from the handle. */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** "SC91-4471-0293-NY". */
export function residentId(handle: string) {
  const d = hash(handle).toString().padStart(10, "0");
  const tag = handle.replace(/[^A-Z0-9]/g, "").slice(0, 2) || "XX";
  return `SC91-${d.slice(0, 4)}-${d.slice(4, 8)}-${tag}`;
}

/** "04" from a 0-based variant. */
export function two(i: number) {
  return (i + 1).toString().padStart(2, "0");
}

/** The handle as the copy uses it (never empty). */
export function handleOf(c: Character) {
  return c.handle.trim() || "NYX";
}
