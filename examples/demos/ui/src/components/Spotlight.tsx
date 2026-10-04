import { memo } from "react";
import type { BevyStyle } from "bevy-react/jsx";
import type { Spotlight as SpotlightStyle } from "@/bevy";

type SpotlightProps = SpotlightStyle & {
  /** The parent's corner radii, so the light's edge and clip follow them. */
  radius?: BevyStyle["borderRadius"];
  /** How far the light extends past the parent's padding box on every side —
   *  the parent's border width, for an edge that lands on the border. */
  outset?: number;
};

/**
 * The cursor light on its parent, drawn on the GPU by the app's `spotlight`
 * style (`examples/demos/spotlight.rs`): an edge that catches the light and a
 * soft wash on the surface. It follows the pointer every
 * frame with no React render. Drop it in as the parent's FIRST child: it
 * paints over the parent's background and under its other children.
 */
export const Spotlight = memo(function Spotlight({
  radius = 0,
  outset = 0,
  ...spotlight
}: SpotlightProps) {
  return (
    <node
      style={{
        positionType: "absolute",
        left: -outset,
        top: -outset,
        right: -outset,
        bottom: -outset,
        borderRadius: radius,
        spotlight,
      }}
    />
  );
});
