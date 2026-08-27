import type { BevyTransition, BevyTransitionSpec } from "bevy-react/jsx";

/** The opening choreography, in ms from page mount. Every entrance reads its
 * delay from here, so retiming the page is editing this table. */
export const Beats = {
  /** Both logos fade in, apart, spinning. */
  logosIn: 0,
  /** Tiles fade in and rise into their slots, staggered by `TILE_STAGGER_MS`. */
  tilesIn: 750,
  /** The logos converge into the composite pose. */
  logosJoin: 900,
  /** The dustify tag-word loop starts (and never stops). */
  titleLoop: 1400,
  tagline: 2200,
  hint: 2600,
} as const;

export const TILE_STAGGER_MS = 120;
export const TILE_ENTER_MS = 420;

/** The tile <-> panel flight, both directions. `Home` waits on it too. */
export const FLIGHT_MS = 400;

export const flightTransition = {
  sharedElement: { duration: FLIGHT_MS, easing: "easeOut" },
} satisfies BevyTransition;

/** How long a card's CONTENTS take to change shape under the flight. */
export const GROW_MS = FLIGHT_MS;

/** Delay before the grow starts: the first frame must show the previous look,
 * and a retarget in the same Bevy frame as the mount snaps (no "from" yet). */
export const GROW_DELAY_MS = 50;

/** Every size flight and extra fade inside a card reads this one spec. */
export const growTransition = {
  duration: GROW_MS,
  easing: "easeOut",
} satisfies BevyTransitionSpec;

/** `layout` spec for a vignette node re-arranging under the grow. Shorter than
 * the grow: the FLIP re-arms every frame the box is still easing, so a fast
 * ease-out reads as a tight follow rather than a lag. */
export const growLayoutTransition = {
  duration: FLIGHT_MS / 2,
  easing: "easeOut",
} satisfies BevyTransitionSpec;
