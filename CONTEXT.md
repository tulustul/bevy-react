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
- **Layout transition** — the `layout` channel: a FLIP-style ease of a node's
  **laid-out rect** (position + size together) whenever layout moves or
  resizes it, cause-blind. The real layout snaps; a post-layout translate +
  scale from the old rect decays to identity, composed into
  `UiGlobalTransform` (ADR-0001). Children ride the translation but not the
  scale: a size change eases the node's own box, its content stays crisp.
- **Laid-out rect** — a node's local layout rect in its parent's layout
  space (taffy `location + size`, physical px, rounded as bevy displays it):
  excludes parent scroll and every `UiTransform`. The layout transition's
  measurement.
- **Mount rule** — a channel's first sight of a value adopts it silently
  (no enter animation); only a later change animates.

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
  against the live layout (translate-only), size in measured px through real
  layout (the `Node` fields ease from the seed's size to the natural one,
  then the authored value is restored), styles per channel. The seed frame
  shows the seed rect through the FLIP scale — never an empty frame.
