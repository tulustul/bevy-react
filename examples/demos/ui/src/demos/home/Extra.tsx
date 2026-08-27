import { createContext, useContext, type PropsWithChildren } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { hmrSingleton } from "@/hmr";
import { growTransition } from "./beats";

/** Which way the card around a vignette is moving: growing into the panel,
 * shrinking back into its tile, or at rest. */
export type ExpandPhase = "expanding" | "collapsing" | null;

const ExpandPhaseContext = hmrSingleton("__expandPhaseContext", () =>
  createContext<ExpandPhase>(null),
);

/** Provided by `Card` for the length of a grow (mount → `GROW_DELAY_MS + GROW_MS`). */
export const ExpandPhaseProvider = ExpandPhaseContext.Provider;

/** The card's phase, for a vignette that wants the grow's own timing while the
 * card changes shape. Read it in the render that changes the layout. */
export function useExpandingOrCollapsing(): ExpandPhase {
  return useContext(ExpandPhaseContext);
}

/** Something the panel shows and the tile does not. Opens its room as real
 * layout (`maxHeight` 0 → cap) while an inner node fades in.
 *
 * `maxHeight` is a CAP, not a height: the visible height is `min(contents, cap)`,
 * so the further the cap is above the contents the earlier the reveal completes
 * — keep it close to the real height where known.
 *
 * Contents unmount at rest: a clipped `<button>` is still hit-tested (bevy 0.19
 * clip walk) and, being a blocking node, shadows the card's hover. */
export function Extra({
  grown,
  maxHeight,
  children,
}: PropsWithChildren<{ grown: boolean; maxHeight: number }>) {
  const phase = useExpandingOrCollapsing();
  const live = grown || phase !== null;
  return (
    <node
      style={{
        ...reserveStyle,
        maxHeight: grown ? maxHeight : 0,
        transition: { size: growTransition },
      }}
    >
      <node
        style={{
          ...contentStyle,
          opacity: grown ? 1 : 0,
          transition: { opacity: growTransition },
        }}
      >
        {live && children}
      </node>
    </node>
  );
}

const reserveStyle: BevyStyle = {
  width: "100%",
  flexDirection: "column",
  alignItems: "center",
  // Overflow at the top while the room opens: contents emerge from under the vignette.
  justifyContent: "flexEnd",
  overflowY: "clip",
};

const contentStyle: BevyStyle = {
  width: "100%",
  flexDirection: "column",
  alignItems: "center",
};
