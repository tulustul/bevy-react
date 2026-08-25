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
