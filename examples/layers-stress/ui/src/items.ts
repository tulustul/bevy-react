// Deterministic item field: a fixed seed and a single PRNG stream mean the
// scatter never changes between runs or toggles, and the first 20 items of
// N=100 are exactly N=20's items (prefix-stable across the count switcher).

export type Item = {
  id: number;
  left: number; // percent, 0–85
  top: number; // percent, 0–80
  opacity: number; // static resting opacity, 0.3–0.95
  opacityTo: number; // animated ping-pong target, 0.15–0.65
  dx: number; // translateX amplitude, ±120 px
  dy: number; // translateY amplitude, ±120 px
  durMove: number; // translate half-period, 900–2400 ms
  durOpacity: number; // opacity half-period, 900–2400 ms
  delay: number; // stagger, 0–1000 ms
};

// mulberry32 — tiny deterministic PRNG.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 42;

export function buildItems(n: number): Item[] {
  const rand = mulberry32(SEED);
  return Array.from({ length: n }, (_, id) => ({
    id,
    left: rand() * 85,
    top: rand() * 80,
    opacity: 0.3 + rand() * 0.65,
    opacityTo: 0.15 + rand() * 0.5,
    dx: (rand() * 2 - 1) * 120,
    dy: (rand() * 2 - 1) * 120,
    durMove: 900 + rand() * 1500,
    durOpacity: 900 + rand() * 1500,
    delay: rand() * 1000,
  }));
}
