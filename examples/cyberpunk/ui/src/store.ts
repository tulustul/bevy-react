// The front end's own state shapes, shared by every screen. Everything is
// made up and lives in React: the character being created, the save slots.

export type Lifepath = "nomad" | "streetkid" | "corpo";
export type Difficulty = "easy" | "normal" | "hard" | "veryhard";
export type AttributeId =
  | "body"
  | "intelligence"
  | "reflexes"
  | "tech"
  | "cool";

export const LIFEPATHS: { id: Lifepath; name: string }[] = [
  { id: "nomad", name: "Nomad" },
  { id: "streetkid", name: "Streetkid" },
  { id: "corpo", name: "Corpo" },
];

export const DIFFICULTIES: { id: Difficulty; name: string }[] = [
  { id: "easy", name: "EASY" },
  { id: "normal", name: "NORMAL" },
  { id: "hard", name: "HARD" },
  { id: "veryhard", name: "VERY HARD" },
];

/** The character being made (and the one a save holds). */
export type Character = {
  /** The street name on the ID card. */
  handle: string;
  difficulty: Difficulty;
  lifepath: Lifepath;
  /** 0 or 1: the two body types. */
  body: number;
  /** 0 = masculine, 1 = feminine voice tone. */
  voice: number;
  /** Appearance option id → chosen index (the options live with the new
   *  game screens). */
  look: Record<string, number>;
  attributes: Record<AttributeId, number>;
};

export const NEW_CHARACTER: Character = {
  handle: "NYX",
  difficulty: "normal",
  lifepath: "streetkid",
  body: 0,
  voice: 0,
  look: {},
  attributes: { body: 3, intelligence: 3, reflexes: 3, tech: 3, cool: 3 },
};

/** One save slot. */
export type Save = {
  id: number;
  /** The quest it was saved in ("Gutter Saints"). */
  quest: string;
  /** "ManualSave-3", "AutoSave-0", "QuickSave". */
  name: string;
  location: string;
  level: number;
  /** Minutes played. */
  playtime: number;
  /** When it was saved, as shown ("10/06/91, 11:42 PM"). */
  date: string;
  character: Character;
};

/** Each lifepath's opening quest and where it starts. */
export const PROLOGUE: Record<Lifepath, { quest: string; location: string }> = {
  nomad: { quest: "Dust Run", location: "Badlands: Red Mesa Pass" },
  streetkid: { quest: "Gutter Saints", location: "Kessler: Lantern Alley" },
  corpo: { quest: "Glass Ceiling", location: "Tenkai Tower: Lobby 3" },
};

/** The saves that ship with the front end, newest first. */
export const SEED_SAVES: Save[] = [
  {
    id: 3,
    quest: "Gutter Saints",
    name: "QuickSave",
    location: "Kessler: Night Market",
    level: 14,
    playtime: 1312,
    date: "10/06/91, 11:42 PM",
    character: { ...NEW_CHARACTER, lifepath: "streetkid" },
  },
  {
    id: 2,
    quest: "Glass Ceiling",
    name: "ManualSave-2",
    location: "Tenkai Tower: Counterintel",
    level: 6,
    playtime: 384,
    date: "10/04/91, 9:12 AM",
    character: { ...NEW_CHARACTER, handle: "VEGA", lifepath: "corpo", body: 1 },
  },
  {
    id: 1,
    quest: "Dust Run",
    name: "AutoSave-1",
    location: "Badlands: Red Mesa Pass",
    level: 2,
    playtime: 41,
    date: "09/29/91, 6:03 PM",
    character: { ...NEW_CHARACTER, handle: "RUST", lifepath: "nomad" },
  },
];

/** "21:52" from minutes. */
export function playtime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}
