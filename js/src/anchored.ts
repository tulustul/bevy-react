// World-anchored overlays for bevy-react.
//
// `<Anchored.node entity={e} offset={[0, 1, 0]}>…</Anchored.node>` renders a normal
// screen-space element whose position the Bevy side recomputes every frame by
// projecting the target entity's world position (plus the offset) onto the screen.
// Because it stays a flat overlay, clicks/hover work exactly like any other node.
//
// The `entity` is a Bevy `Entity` (as `Entity::to_bits()`), which the app receives
// from Bevy over the typed messaging bridge (e.g. a `react_event`). The anchor
// rides across in a single `anchor` prop, decoded on the Rust side into `Anchor`.

import { createElement } from "react";
import type { BevyImageProps, BevyNodeProps, BevyTextProps } from "./jsx";

/** A world-space vector `[x, y, z]` in Bevy world units. */
export type Vec3 = [number, number, number];

/** Distance-based scaling for an anchored overlay. The Bevy side applies
 *  `clamp(1 + factor * (baseDistance / distance - 1), min, max)`, so the overlay
 *  renders at scale 1 when the camera is `baseDistance` away, grows as it gets
 *  closer, and shrinks farther out. Omit `scale` entirely to keep a constant size. */
export interface AnchorScaling {
  min: number;
  max: number;
  /** Scaling strength: `0` disables scaling, `1` is true perspective (apparent
   *  size halves at twice `baseDistance`), `2` scales twice as fast. */
  factor: number;
  /** Camera distance at which the overlay renders at scale 1. */
  baseDistance: number;
}

/** Extra props every `Anchored.*` element accepts: which Bevy entity to follow,
 *  an optional world-space offset, and optional distance scaling. */
export interface AnchorProps {
  /** The Bevy entity to follow, as `Entity::to_bits()` (received from Bevy).
   *  A `u64` arrives from typed bindings as a `bigint`; either form is accepted. */
  entity: number | bigint;
  /** World-space offset added to the entity's position before projecting. */
  offset?: Vec3;
  /** When set, the overlay scales with camera distance (see `AnchorScaling`). */
  scale?: AnchorScaling;
}

// Thin host wrappers, so apps write `<Anchored.node entity={e} offset={…}/>`. The
// `entity`/`offset` props are packaged into a single `anchor` prop the bridge
// forwards opaquely (like `style`) for the Rust side to decode.
function anchored<P>(type: string) {
  return (props: P & AnchorProps) => {
    const { entity, offset, scale, ...rest } = props as AnchorProps &
      Record<string, unknown>;
    // Send the entity as a plain number. `op_flush`'s serde_v8 can't decode a
    // struct `u64` field from either a JS number (f64) or a BigInt, so the Rust
    // `Anchor.entity` is an `f64` — lossless for realistic `Entity::to_bits()`
    // values (well under 2^53) — and cast back to the entity id on apply.
    return createElement(type as never, {
      ...rest,
      anchor: { entity: Number(entity), offset, scale },
    });
  };
}

export const Anchored = {
  node: anchored<BevyNodeProps>("node"),
  button: anchored<BevyNodeProps>("button"),
  image: anchored<BevyImageProps>("image"),
  text: anchored<BevyTextProps>("text"),
};
