import type { CityInfo, CivInfo, WorldInfo, Yields } from "./bevy";
import { CIVICS, STARTING_TECHS, tech } from "./techs";
import { C } from "./theme";
import type { IconName } from "./ui/Icon";

/** No game is played here: the empire's numbers are made up from the map
 *  (every city's yields come from the tiles around it) and a seeded
 *  random walk for the history the graphs draw. "Next turn" advances it
 *  all a step. */

const START_TURN = 128;

export type Metric =
  | "score"
  | "science"
  | "culture"
  | "gold"
  | "faith"
  | "military"
  | "population";

export const METRICS: {
  key: Metric;
  name: string;
  unit: string;
  color: string;
  icon: IconName;
}[] = [
  {
    key: "score",
    name: "Score",
    unit: "points",
    color: C.goldHi,
    icon: "trophy",
  },
  {
    key: "science",
    name: "Science",
    unit: "per turn",
    color: C.science,
    icon: "science",
  },
  {
    key: "culture",
    name: "Culture",
    unit: "per turn",
    color: C.culture,
    icon: "culture",
  },
  { key: "gold", name: "Gold", unit: "per turn", color: C.coin, icon: "gold" },
  {
    key: "faith",
    name: "Faith",
    unit: "per turn",
    color: C.faith,
    icon: "faith",
  },
  {
    key: "military",
    name: "Military",
    unit: "strength",
    color: C.bad,
    icon: "strength",
  },
  {
    key: "population",
    name: "Population",
    unit: "citizens",
    color: C.food,
    icon: "person",
  },
];

export type Note = {
  id: number;
  icon: IconName;
  color: string;
  title: string;
  body: string;
};

export type Item = {
  id: string;
  name: string;
  kind: "District" | "Building" | "Unit";
  cost: number;
  icon: IconName;
  effect: string;
};

export const ITEMS: Item[] = [
  {
    id: "campus",
    name: "Campus",
    kind: "District",
    cost: 108,
    icon: "science",
    effect: "+2 science, Great Scientist points",
  },
  {
    id: "theater",
    name: "Theater Square",
    kind: "District",
    cost: 108,
    icon: "culture",
    effect: "+2 culture, Great Writer points",
  },
  {
    id: "holysite",
    name: "Holy Site",
    kind: "District",
    cost: 108,
    icon: "faith",
    effect: "+2 faith, Great Prophet points",
  },
  {
    id: "harbor",
    name: "Harbor",
    kind: "District",
    cost: 108,
    icon: "anchor",
    effect: "+2 gold, +1 trade route",
  },
  {
    id: "monument",
    name: "Monument",
    kind: "Building",
    cost: 60,
    icon: "obelisk",
    effect: "+2 culture",
  },
  {
    id: "granary",
    name: "Granary",
    kind: "Building",
    cost: 65,
    icon: "food",
    effect: "+1 food, +2 housing",
  },
  {
    id: "library",
    name: "Library",
    kind: "Building",
    cost: 90,
    icon: "book",
    effect: "+2 science",
  },
  {
    id: "shrine",
    name: "Shrine",
    kind: "Building",
    cost: 70,
    icon: "faith",
    effect: "+2 faith",
  },
  {
    id: "market",
    name: "Market",
    kind: "Building",
    cost: 120,
    icon: "gold",
    effect: "+3 gold",
  },
  {
    id: "walls",
    name: "Ancient Walls",
    kind: "Building",
    cost: 80,
    icon: "castle",
    effect: "+100 city defense",
  },
  {
    id: "warrior",
    name: "Warrior",
    kind: "Unit",
    cost: 40,
    icon: "strength",
    effect: "Melee · 20 strength",
  },
  {
    id: "archer",
    name: "Archer",
    kind: "Unit",
    cost: 60,
    icon: "bow",
    effect: "Ranged · 25 strength",
  },
  {
    id: "builder",
    name: "Builder",
    kind: "Unit",
    cost: 50,
    icon: "production",
    effect: "3 build charges",
  },
  {
    id: "settler",
    name: "Settler",
    kind: "Unit",
    cost: 80,
    icon: "flag",
    effect: "Founds a new city",
  },
];

export const item = (id: string) => ITEMS.find((i) => i.id === id)!;

export type Production = { item: string; progress: number };

export interface Game {
  turn: number;
  gold: number;
  faith: number;
  research: string | null;
  researched: string[];
  /** Science banked toward each tech. */
  progress: Record<string, number>;
  civic: number;
  civicProgress: number;
  /** The player's cities: what each is building, and what it has built. */
  building: Record<string, Production>;
  built: Record<string, string[]>;
  /** Per civ, per metric, one value per turn so far. */
  history: Record<string, Record<Metric, number[]>>;
  notes: Note[];
  nextNote: number;
}

export type Action =
  | { type: "turn" }
  | { type: "research"; tech: string }
  | { type: "produce"; city: string; item: string }
  | { type: "dismiss"; id: number };

export const civicCost = (n: number) => 180 + n * 45;

/** A small seeded generator (mulberry32). */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedOf = (s: string) =>
  [...s].reduce(
    (h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619),
    2166136261,
  );

export function totals(
  cities: CityInfo[],
  civ: string,
): Yields & { population: number } {
  const sum = {
    food: 0,
    production: 0,
    gold: 0,
    science: 0,
    culture: 0,
    faith: 0,
    population: 0,
  };
  for (const c of cities.filter((c) => c.civ === civ)) {
    for (const k of [
      "food",
      "production",
      "gold",
      "science",
      "culture",
      "faith",
    ] as const) {
      sum[k] += c.yields[k];
    }
    sum.population += c.population;
  }
  return sum;
}

/** `final` reached by a noisy growth curve over `turns`. */
function curve(final: number, turns: number, seed: number, wobble: number) {
  const r = rng(seed);
  const raw: number[] = [];
  let drift = 1;
  for (let t = 1; t <= turns; t++) {
    drift = drift * 0.85 + (1 + (r() - 0.5) * wobble) * 0.15;
    raw.push((0.03 + 0.97 * Math.pow(t / turns, 1.7)) * drift);
  }
  const k = final / raw[raw.length - 1];
  return raw.map((v) => v * k);
}

function score(h: Record<Metric, number[]>, t: number) {
  return (
    8 +
    t * 0.55 +
    h.population[t] * 3 +
    h.science[t] * 2.2 +
    h.culture[t] * 2 +
    h.military[t] * 0.3
  );
}

function history(world: WorldInfo, civ: CivInfo): Record<Metric, number[]> {
  const sum = totals(world.cities, civ.id);
  const r = rng(seedOf(civ.id));
  const n = START_TURN - 1;
  const cities = world.cities.filter((c) => c.civ === civ.id).length;
  const h = {
    science: curve(sum.science, n, seedOf(civ.id + "s"), 0.5),
    culture: curve(sum.culture, n, seedOf(civ.id + "c"), 0.6),
    gold: curve(sum.gold, n, seedOf(civ.id + "g"), 0.8),
    faith: curve(Math.max(1, sum.faith), n, seedOf(civ.id + "f"), 0.8),
    military: curve(25 + cities * 14 + r() * 50, n, seedOf(civ.id + "m"), 2.4),
    population: curve(sum.population, n, seedOf(civ.id + "p"), 0.3),
    score: [] as number[],
  };
  h.score = h.science.map((_, t) => score(h, t));
  return h;
}

export function newGame(world: WorldInfo): Game {
  const building: Record<string, Production> = {};
  const built: Record<string, string[]> = {};
  const mine = world.cities.filter((c) => c.civ === world.civs[0].id);
  mine.forEach((c, i) => {
    const r = rng(seedOf(c.id));
    const owned = c.capital
      ? ["monument", "granary", "walls", "campus", "library"]
      : ["monument", "granary", "shrine"].slice(0, 1 + (i % 3));
    built[c.id] = owned;
    const next = ITEMS.find(
      (it) => it.kind !== "Unit" && !owned.includes(it.id),
    )!;
    building[c.id] = {
      item: next.id,
      progress: Math.floor(r() * next.cost * 0.7),
    };
  });
  return {
    turn: START_TURN,
    gold: 312,
    faith: 86,
    research: "machinery",
    researched: STARTING_TECHS,
    progress: { machinery: Math.round(tech("machinery").cost * 0.62) },
    civic: 4,
    civicProgress: 140,
    building,
    built,
    history: Object.fromEntries(
      world.civs.map((c) => [c.id, history(world, c)]),
    ),
    notes: [
      {
        id: 1,
        icon: "person",
        color: C.science,
        title: "Great Scientist",
        body: "Hypatia of Lumen awaits your call",
      },
      {
        id: 2,
        icon: "food",
        color: C.food,
        title: "City grown",
        body: "Aurelia has grown to new heights",
      },
      {
        id: 3,
        icon: "map",
        color: C.gold,
        title: "First contact",
        body: "Envoys from every corner of the world",
      },
    ],
    nextNote: 4,
  };
}

/** A civ's per-turn yields: the last step of its history. */
export function income(game: Game, civ: string) {
  const h = game.history[civ];
  const last = (m: Metric) => h[m][h[m].length - 1];
  return {
    science: last("science"),
    culture: last("culture"),
    gold: last("gold"),
    faith: last("faith"),
  };
}

/** Where the treasury's gold comes from and goes, per turn. */
export function ledger(world: WorldInfo, game: Game) {
  const player = world.civs[0].id;
  const cities = world.cities.filter((c) => c.civ === player);
  const built = cities.flatMap((c) => game.built[c.id] ?? []);
  const sources = [
    ...cities.map((c) => ({ name: c.name, value: c.yields.gold })),
    { name: "Trade routes", value: 12 },
  ];
  const upkeep = [
    {
      name: "Buildings",
      value: built.filter((b) => item(b).kind === "Building").length,
    },
    {
      name: "Districts",
      value: built.filter((b) => item(b).kind === "District").length * 2,
    },
    {
      name: "Units",
      value: world.units.filter((u) => u.civ === player).length,
    },
  ];
  const sum = (xs: { value: number }[]) => xs.reduce((n, x) => n + x.value, 0);
  return { sources, upkeep, net: sum(sources) - sum(upkeep) };
}

const RUMORS: [IconName, string, string, string][] = [
  [
    "strength",
    C.bad,
    "Barbarians",
    "A barbarian camp was spotted to the north",
  ],
  [
    "person",
    C.culture,
    "Great Writer",
    "A Great Writer was born in a rival land",
  ],
  ["map", C.gold, "Trade route", "A caravan from Sunmarch reached Aurelia"],
  ["faith", C.faith, "Religion", "A new pantheon is worshipped in Tzalan"],
  ["trophy", C.goldHi, "Wonder", "Kharjan began building the Colossus"],
];

export function step(world: WorldInfo, game: Game, action: Action): Game {
  switch (action.type) {
    case "research":
      return { ...game, research: action.tech };
    case "produce":
      return {
        ...game,
        building: {
          ...game.building,
          [action.city]: { item: action.item, progress: 0 },
        },
      };
    case "dismiss":
      return { ...game, notes: game.notes.filter((n) => n.id !== action.id) };
    case "turn":
      return nextTurn(world, game);
  }
}

function nextTurn(world: WorldInfo, game: Game): Game {
  const r = rng(game.turn * 7919);
  const player = world.civs[0].id;
  const notes: Omit<Note, "id">[] = [];
  const g = { ...game, turn: game.turn + 1 };

  // History grows a step for everyone.
  g.history = Object.fromEntries(
    Object.entries(game.history).map(([civ, h]) => {
      const next = { ...h } as Record<Metric, number[]>;
      for (const m of [
        "science",
        "culture",
        "gold",
        "faith",
        "population",
      ] as const) {
        next[m] = [...h[m], h[m][h[m].length - 1] * (1.003 + r() * 0.012)];
      }
      next.military = [
        ...h.military,
        h.military[h.military.length - 1] * (0.97 + r() * 0.07),
      ];
      next.score = [...h.score, score(next, next.science.length - 1)];
      return [civ, next];
    }),
  );

  const pay = income(g, player);
  g.gold = game.gold + ledger(world, game).net;
  g.faith = game.faith + pay.faith;

  if (game.research) {
    const banked = (game.progress[game.research] ?? 0) + pay.science;
    const done = tech(game.research);
    if (banked >= done.cost) {
      g.researched = [...game.researched, done.id];
      g.research = null;
      notes.push({
        icon: done.icon,
        color: C.science,
        title: "Research complete",
        body: done.name,
      });
    }
    g.progress = { ...game.progress, [game.research]: banked };
  }

  g.civicProgress = game.civicProgress + pay.culture;
  if (g.civicProgress >= civicCost(game.civic)) {
    notes.push({
      icon: "culture",
      color: C.culture,
      title: "Civic complete",
      body: CIVICS[game.civic % CIVICS.length],
    });
    g.civic = game.civic + 1;
    g.civicProgress = 0;
  }

  g.building = { ...game.building };
  g.built = { ...game.built };
  for (const city of world.cities.filter((c) => c.civ === player)) {
    const now = game.building[city.id];
    const progress = now.progress + city.yields.production;
    const it = item(now.item);
    if (progress < it.cost) {
      g.building[city.id] = { ...now, progress };
      continue;
    }
    notes.push({
      icon: it.icon,
      color: C.production,
      title: `${city.name} completed`,
      body: it.name,
    });
    const built =
      it.kind === "Unit"
        ? game.built[city.id]
        : [...game.built[city.id], it.id];
    g.built[city.id] = built;
    const next =
      ITEMS.find((i) => i.kind !== "Unit" && !built.includes(i.id)) ??
      item("builder");
    g.building[city.id] = { item: next.id, progress: progress - it.cost };
  }

  if (r() < 0.6) {
    const [icon, color, title, body] = RUMORS[Math.floor(r() * RUMORS.length)];
    notes.push({ icon, color, title, body });
  }
  let id = game.nextNote;
  g.notes = [...notes.map((n) => ({ ...n, id: id++ })), ...game.notes].slice(
    0,
    6,
  );
  g.nextNote = id;
  return g;
}

/** The calendar: forty years a turn at first, fewer as history speeds up. */
export function year(turn: number) {
  let y = -4000;
  let left = turn;
  for (const [turns, span] of [
    [75, 40],
    [60, 25],
    [50, 20],
    [80, 10],
    [Infinity, 5],
  ]) {
    const n = Math.min(left, turns);
    y += n * span;
    left -= n;
    if (left <= 0) break;
  }
  return y < 0 ? `${-y} BC` : `${y} AD`;
}

export const plural = (n: number, word: string) =>
  `${n} ${word}${n === 1 ? "" : "s"}`;

/** Turns until `cost` at `rate` per turn, from `banked`. */
export const turnsLeft = (cost: number, banked: number, rate: number) =>
  Math.max(1, Math.ceil((cost - banked) / Math.max(0.1, rate)));
