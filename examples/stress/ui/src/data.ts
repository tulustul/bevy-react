// Row data + label generation for the table-ops benchmark, matching the standard
// js-framework-benchmark word lists and the "adjective colour noun" label shape.

const ADJECTIVES = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
];

const COLOURS = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
];

const NOUNS = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
];

export interface Row {
  id: number;
  label: string;
  // Optional per-row background, toggled by the `UpdateEvery2ndBackgroundColor`
  // benchmark op. Left unset by `buildData` so a fresh row uses the default style.
  bg?: string;
}

// A monotonic id source, so ids stay unique across create/append (the benchmark
// requires stable, never-reused keys).
let nextId = 1;

// Mulberry32: a tiny seeded PRNG, so a given `seed` yields reproducible labels.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build `count` fresh rows with reproducible-yet-varied labels for `seed`. */
export function buildData(count: number, seed: number): Row[] {
  const rand = rng(seed);
  const pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)];
  const rows: Row[] = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: nextId++,
      label: `${pick(ADJECTIVES)} ${pick(COLOURS)} ${pick(NOUNS)}`,
    };
  }
  return rows;
}
