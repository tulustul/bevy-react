# CONTEXT

Domain glossary for `bevy-react`. Use these terms as written; the code, the
`TODO` file and the docs are expected to match them.

## Transitions

- **Transition channel** — one entry of the `transition` style
  (`transition: { <channel>: spec }`), explicit-only (no `all`): a change on
  that surface eases with the entry's timing/spring instead of snapping.
  Channels are grouped by surface (`transform`, `size`, `filter`, …), not
  per property.
- **State-owned-current** — the channel remembers the value _it_ last wrote
  and eases from that, never from the live component (which another writer
  snapped on the change frame). Every whole-value channel works this way.
  A channel only advances while its own spec is present, so a commit that
  drops the entry re-seeds the reading from the static style instead of
  leaving it frozen — otherwise the next retarget compares against a stale
  target, finds nothing to do, and snaps.
- **Layout transition** — the `layout` channel: a FLIP-style ease of a node's
  **laid-out rect** (position + size together) whenever layout moves or
  resizes it, cause-blind. The real layout snaps; a post-layout translate +
  scale from the old rect decays to identity, composed into
  `UiGlobalTransform` (ADR-0001). Children ride the translation but not the
  scale: a size change eases the node's own box, its content stays crisp.
- **Laid-out rect** — a node's local layout rect in its parent's layout
  space (taffy `location + size`, physical px, rounded or not exactly as
  bevy displays it — the node's effective `LayoutConfig`):
  excludes parent scroll and every `UiTransform`. The layout transition's
  measurement.
- **Layout rounding** — bevy snapping every laid-out rect to whole physical
  pixels, per node and inherited (`LayoutConfig::use_rounding`), exposed as
  the `layoutRounding` style (unset inherits — downward only, restarting at
  each detached root — so it goes on the parent that lays out the animated
  node and its neighbours; root default on). Any size
  animated through real layout steps under rounding and its neighbours hop;
  an unrounded subtree glides, and pays with soft edges and blurred text
  wherever content rests on a half pixel. The layout channel measures with
  the node's effective setting.
- **Mount rule** — a channel's first sight of a value adopts it silently
  (no enter animation); only a later change animates.
- **Rect writer** — who else writes a node's rect this frame, the layout
  channel's ownership gate. A `Node`-field binding owns the rect outright
  (adopt everything). The node's own `size` channel owns the size, so the
  channel adopts only the re-flow the size channel's own per-frame step can
  explain (never the measured size step — a flex squeeze snaps that) and
  eases anything larger translate-only, its target following the live rect —
  `size` and `layout` on one node compose, instead of the size flight
  silencing the FLIP.

## Shared elements

- **Shared tag** — the `sharedTag` prop: shared-element identity across an
  unmount + mount. React has no reparenting, so a node "moving" between
  parents or screens is always a fresh node; the tag is what the two have in
  common. Not unique by contract, but meant to be (`hero-${id}`).
- **Pairing** — the op-apply pre-pass (`shared_tags::plan_pairs`) that,
  within ONE batch, matches a tagged create to the first mounted tagged node
  under a removed subtree with the same tag, element kind, and UI root. No
  warnings; unmatched tags mount normally; `Reset` never pairs.
- **Outgoing / incoming node** — the two halves of a pair: the removed node
  (unmounts instantly) and the created node (flies).
- **Seed** — what the incoming node inherits from the outgoing one: its
  on-screen rect (root space, as shown — mid-flight included) and every
  value channel's current reading. Taken while the outgoing entity is still
  alive (`transition::shared::snapshot`), stamped as a `SharedSeed`.
- **Seeded first sight** — the shared-element exception to the mount rule:
  a seeded channel's first sight starts at the seed value and eases to its
  own target with the `sharedElement` spec (one spec for every seeded
  channel, overriding per-channel specs for the flight only).
- **Shared flight** — the seeded ease in progress: position by translation
  toward the node's **settled** rect (translate-only), size in measured px
  through real layout (the `Node` fields ease from the seed's size to the
  natural one, then the authored value is restored; the flight owns the
  node's flex sizing meanwhile, or a smaller container shrinks the flown px
  straight back), styles per channel. The seed frame shows the seed rect
  through the FLIP scale (corner radii compensated on `ComputedNode` for that
  frame, so a seeded circle reads as a circle) — never an empty frame.
- **Root-space anchored** — both ends of the flight are root-space rects
  re-expressed in the parent's frame every flight frame: the take-off point,
  so a parent the size flight re-flows (a centered container) doesn't move
  it, and the destination, captured on the seed frame — the one frame the
  natural rect is measurable, before any px is written. Easing toward the
  LIVE rect instead chases a target the flight's own size is dragging along,
  which is quadratic in progress: the flight bows instead of travelling in a
  straight line. The delta is therefore **root-anchored**: it composes against
  the parent's _pristine_ frame, never its shown one, so a nested shared
  flight (a tagged node inside a tagged node) flies its own straight line and
  is never displaced by the ancestor's delta on top.
- **Re-flow attribution** — how a flight tells its own motion from the
  world's: the size flight moves the node's settled position every frame
  (a centered node slides by half its width step), so the live rect alone
  can't say whether a scroll landed. On the first flight frame — the sizes
  jump from natural to ~seed, an unmistakable step — the flight fits how far
  its settled position moves per px of its own size (and of every ancestor's
  flying size); afterwards the deviation of the live position from that
  prediction is **external** (a scroll, a resize, a sibling insert), and
  both ends move by it together — the flight scroll-locks with the content,
  still a straight line, no restart. The common case is unchanged (no
  deviation, sub-pixel rounding residue dead-zoned), and landing is exact
  whatever the fit read: once every flight settled the sizes are natural
  again, so the deviation IS the true external delta. A wrong fit (an
  external event on the fit frame, a wrap crossed mid-way, nested flights on
  different timings) only bends the path meanwhile.
- **Landed** — a shared flight that settled while an ancestor still animates:
  it keeps showing its root-space destination (translate-only, gated by the
  set of nodes that composed a delta last frame) until every ancestor is done,
  instead of jumping onto the ancestor's still-moving frame.

## Image rendering

- **Image rendering mode** — the `imageRendering` style keyword
  (`auto | bilinear | trilinear | nearest`): how a node's **raster source**
  (`<image src>`, `backgroundImage`) is resampled when drawn at a size other
  than its own. Per node, never inherited; a keyword, never animated.
- **Passive `auto`** — the default mode never touches an asset; it renders as
  the engine default (level-0 bilinear today). Only an explicit mode binds.
- **Variant asset** — the derived copy of a source asset for one
  `(source, mode)` pair (ADR-0003): sampler set per mode, a generated mip
  pyramid for `trilinear`. Shared by every node asking for that pair,
  refcounted, dropped with its last user, rebuilt in place on source reload.
  Made only when the source doesn't already **satisfy** the mode.
- **Live texture** — a raster source written on the GPU or re-rastered per
  frame, or bound by another system (a `{ texture }`/`<portal>` render
  target, a canvas, an svg): can't be copied or written (a write re-uploads
  over the GPU target), so every explicit mode is refused there with a
  warning and the node keeps its source.
