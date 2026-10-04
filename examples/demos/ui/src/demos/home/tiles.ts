import { ComponentType } from "react";
import type { VignetteProps } from "./shared";
import { SharedElementsVignette } from "./vignettes/SharedElementsVignette";
import { LayoutVignette } from "./vignettes/LayoutVignette";
import { FiltersVignette } from "./vignettes/FiltersVignette";
import { MorphingVignette } from "./vignettes/MorphingVignette";
import { HotReloadVignette } from "./vignettes/HotReloadVignette";
import { TypedMessagesVignette } from "./vignettes/TypedMessagesVignette";

/** The wall slot on desktop; on a phone a tile is full width, `TILE_HEIGHT` at least. */
export const TILE_WIDTH = 256;
export const TILE_HEIGHT = 216;

export type Tile = {
  id: string;
  label: string;
  /** One sentence, shown only in the expanded panel. */
  blurb: string;
  vignette: ComponentType<VignetteProps>;
};

export const TILES: Tile[] = [
  {
    id: "shared",
    label: "Shared elements",
    blurb: "A node that changes parent flies there instead of reappearing.",
    vignette: SharedElementsVignette,
  },
  {
    id: "layout",
    label: "Layout animations",
    blurb:
      "Real flexbox re-flows, eased away after layout instead of snapping.",
    vignette: LayoutVignette,
  },
  {
    id: "filters",
    label: "Filters",
    blurb: "Chains of WGSL passes over any subtree, composed and animatable.",
    vignette: FiltersVignette,
  },
  {
    id: "morphing",
    label: "Morphing",
    blurb: "Contents swap through a named transition rather than cutting.",
    vignette: MorphingVignette,
  },
  {
    id: "hotreload",
    label: "Hot reload",
    blurb: "Edit a component and it re-renders live, hook state intact.",
    vignette: HotReloadVignette,
  },
  {
    id: "messages",
    label: "Typed messages",
    blurb:
      "React and the ECS talk over channels generated from your Rust types.",
    vignette: TypedMessagesVignette,
  },
];

/** The `sharedTag` pairing a tile's wall card with its panel. Pinned by
 * `crates/core/tests/home_shared_flight.rs`. */
export const tileTag = (id: string) => `home-tile-${id}`;
