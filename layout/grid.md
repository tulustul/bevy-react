# Grid

`display: "grid"` lays out a node's children on rows and columns of tracks,
following the CSS grid spec. Track lists and placements are CSS-style
strings; bevy-react parses them when the style crosses to Bevy and accepts a
subset of the CSS syntax, listed on this page.

## Usage

```tsx
<node
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridAutoRows: "48px",
    gap: 8,
  }}
>
  <node style={{ gridColumn: "span 2", backgroundColor: "#7aa2f7" }} />
  <node style={{ backgroundColor: "#9ece6a" }} />
  <node style={{ backgroundColor: "#e0af68" }} />
</node>
```

## Track lists

`gridTemplateColumns` and `gridTemplateRows` define the explicit grid as a
space-separated list of tracks. Unset, there are no explicit tracks and
every item lands in implicit ones.

| Token            | Track size                                         |
| ---------------- | -------------------------------------------------- |
| `100px`          | Fixed, in logical pixels                           |
| `25%`            | A percentage of the container's content box        |
| `1fr`            | A share of the free space, never below the content |
| `1flex`          | A share of the free space that may go below it     |
| `auto`           | Fits the content, then grows into leftover space   |
| `min-content`    | The content's smallest size                        |
| `max-content`    | The content's largest size                         |
| `repeat(3, 1fr)` | The track repeated a fixed number of times         |

```tsx
const shell: BevyStyle = {
  display: "grid",
  gridTemplateColumns: "80px 1fr",
  gridTemplateRows: "auto 1fr auto",
};
```

`fr` behaves like CSS: a `1fr` track is `minmax(auto, 1fr)`, so a column
with wide content stays wider than its share. `flex` is a bevy-react unit
for `minmax(0, 1fr)`: `"repeat(3, 1flex)"` gives three strictly equal
columns whatever they hold.

Not accepted: `minmax()`, `fit-content()`, `repeat(auto-fill, …)` and
`repeat(auto-fit, …)`, a `repeat()` of several tracks, named lines, bare
numbers and viewport units. Tokens are case-sensitive. A token that doesn't
parse is dropped with a `gridTrack` devtools warning, and the rest of the
list still applies.

## Implicit tracks and auto flow

Items placed outside the explicit grid, or auto-placed past its end, get
implicit tracks:

- `gridAutoRows` and `gridAutoColumns` size them. They take the same tokens
  as a template, without `repeat()`. A list cycles: `"40px 80px"` alternates
  short and tall rows. Unset, implicit tracks are `auto`.
- `gridAutoFlow` sets the direction auto-placed items fill: `"row"` (the
  default) fills each row and adds rows, `"column"` fills each column and
  adds columns. `"rowDense"` and `"columnDense"` also backfill holes left by
  earlier spanning items, which can reorder items visually.

## Placement

`gridRow` and `gridColumn` place an item on grid lines, numbered from 1:

| Value             | Placement                            |
| ----------------- | ------------------------------------ |
| `"auto"`          | Auto-placed, one track (the default) |
| `"2"`             | Starts at line 2, spans one track    |
| `"span 2"`        | Auto-placed, spans two tracks        |
| `"1 / 3"`         | From line 1 to line 3                |
| `"2 / span 3"`    | Starts at line 2, spans three tracks |
| `"auto / 3"`      | Ends at line 3                       |
| `"auto / span 2"` | Same as `"span 2"`                   |
| `"2 / auto"`      | Same as `"2"`                        |

A negative line counts from the end of the explicit grid: `"1 / -1"` spans
every explicit column. A line or span of `0`, a span before the slash
(`"span 2 / 4"`), or anything else falls back to `"auto"` with a
`gridPlacement` devtools warning.

```tsx
<node
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(2, 48px)",
  }}
>
  <node style={{ gridRow: "span 2" }} />
  {cells}
</node>
```

## Alignment

Inside its grid area, an item aligns on both axes:

- Horizontally with `justifyItems` on the container (`"start"`, `"end"`,
  `"center"`, `"baseline"`, `"stretch"`), overridden per item by
  `justifySelf` (`"auto"`, the default, uses the container's value, plus the
  same keywords).
- Vertically with `alignItems` on the container and `alignSelf` on the item,
  the keys described on [Flexbox](flexbox.md#alignment).

Unset, an item stretches to fill its area on each axis, except on an axis
where it has its own size (or vertically, an `aspectRatio`): there it sits at
the start.

`justifyContent` (columns) and `alignContent` (rows) position the tracks
when they don't fill the container, with the keywords listed on
[Flexbox](flexbox.md). Their default in a grid is `"stretch"`, which grows
`auto` tracks into the free space.

`justifyItems` and `justifySelf` only apply in a grid; they have no effect
on flex items. An unrecognized keyword falls back to the default and reports
a devtools warning.

## Gaps

`gap`, `rowGap` and `columnGap` space the tracks, between them only. See
[Flexbox](flexbox.md#gaps) for their values.

## Limits

- The syntax subset above: no `minmax()`, `fit-content()`, auto-fill,
  named lines or areas, and no `grid-area` shorthand or subgrid.
- Track lists and placements don't animate. `transition: { layout }` on the
  items eases them to their new cells when the grid changes (see
  [Style transitions](../animations/style-transitions.md)).

See [`gridTemplateColumns`](../reference/style-properties.md#gridTemplateColumns),
[`gridTemplateRows`](../reference/style-properties.md#gridTemplateRows),
[`gridAutoColumns`](../reference/style-properties.md#gridAutoColumns),
[`gridAutoRows`](../reference/style-properties.md#gridAutoRows),
[`gridAutoFlow`](../reference/style-properties.md#gridAutoFlow),
[`gridRow`](../reference/style-properties.md#gridRow),
[`gridColumn`](../reference/style-properties.md#gridColumn),
[`justifyItems`](../reference/style-properties.md#justifyItems) and
[`justifySelf`](../reference/style-properties.md#justifySelf) in the style
reference.
