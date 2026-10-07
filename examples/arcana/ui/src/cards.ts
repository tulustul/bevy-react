/** The deck. Each `id` names a 3D diorama the Rust side films into the
 *  render target `card-<id>` (`examples/arcana/dioramas/scenes.rs`). */

export type Rarity = "common" | "rare" | "legendary";

export type CardDef = {
  id: string;
  numeral: string;
  name: string;
  flavor: string;
  rarity: Rarity;
  /** The card's light, and its depth (frame interior). */
  color: string;
  deep: string;
  /** Where on the color wheel a legendary's flare rings (0..1). */
  hue: number;
  element: string;
  keywords: [string, string, string];
};

export const CARDS: CardDef[] = [
  {
    id: "fool",
    numeral: "0",
    name: "The Fool",
    flavor: "Step lightly into the unknown.",
    rarity: "common",
    color: "#ffd9a8",
    deep: "#2a1424",
    hue: 0.1,
    element: "Air",
    keywords: ["Beginnings", "Faith", "Play"],
  },
  {
    id: "magician",
    numeral: "I",
    name: "The Magician",
    flavor: "As above, so below.",
    rarity: "rare",
    color: "#ff9a80",
    deep: "#2c0a12",
    hue: 0.02,
    element: "Fire",
    keywords: ["Will", "Craft", "Focus"],
  },
  {
    id: "priestess",
    numeral: "II",
    name: "High Priestess",
    flavor: "The veil between worlds.",
    rarity: "common",
    color: "#b9ccff",
    deep: "#0a0f2e",
    hue: 0.62,
    element: "Water",
    keywords: ["Intuition", "Mystery", "Silence"],
  },
  {
    id: "empress",
    numeral: "III",
    name: "The Empress",
    flavor: "Abundance, in bloom.",
    rarity: "common",
    color: "#ffaad2",
    deep: "#26091f",
    hue: 0.9,
    element: "Earth",
    keywords: ["Growth", "Nurture", "Beauty"],
  },
  {
    id: "emperor",
    numeral: "IV",
    name: "The Emperor",
    flavor: "Order, carved in stone.",
    rarity: "common",
    color: "#ffb47a",
    deep: "#2a0f08",
    hue: 0.06,
    element: "Fire",
    keywords: ["Structure", "Power", "Law"],
  },
  {
    id: "chariot",
    numeral: "VII",
    name: "The Chariot",
    flavor: "Will set in motion.",
    rarity: "common",
    color: "#9cd2ff",
    deep: "#08142a",
    hue: 0.57,
    element: "Water",
    keywords: ["Drive", "Victory", "Resolve"],
  },
  {
    id: "wheel",
    numeral: "X",
    name: "Wheel of Fortune",
    flavor: "What rises, turns.",
    rarity: "rare",
    color: "#d5b0ff",
    deep: "#170830",
    hue: 0.75,
    element: "Fire",
    keywords: ["Cycles", "Fate", "Change"],
  },
  {
    id: "death",
    numeral: "XIII",
    name: "Death",
    flavor: "Every ending is a door.",
    rarity: "legendary",
    color: "#ffb070",
    deep: "#0b0406",
    hue: 0.07,
    element: "Water",
    keywords: ["Endings", "Release", "Rebirth"],
  },
  {
    id: "tower",
    numeral: "XVI",
    name: "The Tower",
    flavor: "Lightning tells the truth.",
    rarity: "rare",
    color: "#ff9cb4",
    deep: "#22060c",
    hue: 0.95,
    element: "Fire",
    keywords: ["Upheaval", "Awakening", "Truth"],
  },
  {
    id: "star",
    numeral: "XVII",
    name: "The Star",
    flavor: "Hope, rekindled.",
    rarity: "rare",
    color: "#a8ecff",
    deep: "#061626",
    hue: 0.52,
    element: "Air",
    keywords: ["Hope", "Renewal", "Calm"],
  },
  {
    id: "moon",
    numeral: "XVIII",
    name: "The Moon",
    flavor: "Tides of the dreaming mind.",
    rarity: "common",
    color: "#c4d2ff",
    deep: "#080d22",
    hue: 0.64,
    element: "Water",
    keywords: ["Dreams", "Illusion", "Tides"],
  },
  {
    id: "sun",
    numeral: "XIX",
    name: "The Sun",
    flavor: "Radiance, unclouded.",
    rarity: "legendary",
    color: "#ffd27a",
    deep: "#2a1204",
    hue: 0.12,
    element: "Fire",
    keywords: ["Joy", "Vitality", "Clarity"],
  },
  {
    id: "world",
    numeral: "XXI",
    name: "The World",
    flavor: "The circle, complete.",
    rarity: "legendary",
    color: "#9ff0d8",
    deep: "#04161a",
    hue: 0.45,
    element: "Earth",
    keywords: ["Completion", "Unity", "Journeys"],
  },
];

/** One card pulled from a pack (`uid` keys it across the pack's life). */
export type Pull = { uid: number; card: CardDef };

const ODDS: [Rarity, number][] = [
  ["legendary", 0.07],
  ["rare", 0.25],
  ["common", 1],
];

let nextUid = 1;

function draw(rarity: Rarity): CardDef {
  const pool = CARDS.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function roll(): Rarity {
  const r = Math.random();
  let acc = 0;
  for (const [rarity, p] of ODDS) {
    acc += p;
    if (r < acc) return rarity;
  }
  return "common";
}

/** Five cards; the last is always rare or better. */
export function openPack(): Pull[] {
  const rarities = [roll(), roll(), roll(), roll(), roll()];
  if (rarities[4] === "common") {
    rarities[4] = Math.random() < 0.22 ? "legendary" : "rare";
  }
  return rarities.map((r) => ({ uid: nextUid++, card: draw(r) }));
}

/** A scripted pack (`--shoot … --do "0 pack sun,star,…"`): the named ids. */
export function packOf(ids: string[]): Pull[] {
  return ids.map((id) => ({
    uid: nextUid++,
    card: CARDS.find((c) => c.id === id) ?? CARDS[0],
  }));
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "",
  rare: "Holo",
  legendary: "Prismatic",
};
