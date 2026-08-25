import { BevyStyle } from "bevy-react/jsx";
import { Colors } from "@/theme";

// Devtools-style glyphs for the Flexbox playground's radio pills, drawn as
// `<svg>` JSX shapes in a 24×24 viewBox. The justify/align glyphs are laid
// out by the same distribution rules they depict (see `distribute`), then
// rotated with the current `flexDirection` so they always show the real axis.
// SVG fills don't inherit color, so each icon takes its tint explicitly (the
// Radio hands over `selected`).

export type FlexDirection = "row" | "rowReverse" | "column" | "columnReverse";
export type JustifyContent =
  | "center"
  | "flexStart"
  | "flexEnd"
  | "spaceBetween"
  | "spaceEvenly"
  | "spaceAround";
export type AlignItems =
  | "baseline"
  | "center"
  | "flexStart"
  | "flexEnd"
  | "stretch";

type IconProps = { selected: boolean; direction: FlexDirection };

// Selected pills are filled with the accent, so the glyph flips to the dark
// text color the text labels use there.
function tint(selected: boolean): string {
  return selected ? Colors.textColor400 : Colors.textColor100;
}

const SIZE = 22;
const iconStyle: BevyStyle = { width: SIZE, height: SIZE };

// Main-axis arrow: points right for `row`, then rotates with the direction.
const DIRECTION_ROTATION: Record<FlexDirection, number> = {
  row: 0,
  rowReverse: 180,
  column: 90,
  columnReverse: 270,
};

// The justify glyph distributes along the main axis: rotate the row drawing
// so its "start" lands where the flow starts.
const JUSTIFY_ROTATION = DIRECTION_ROTATION;

// The align glyph distributes along the cross axis: for a column that axis is
// horizontal with `flexStart` on the left (a -90° turn of the row drawing);
// reversing the main axis leaves the cross axis alone.
const ALIGN_ROTATION: Record<FlexDirection, number> = {
  row: 0,
  rowReverse: 0,
  column: -90,
  columnReverse: -90,
};

export function DirectionIcon({ selected, direction }: IconProps) {
  const color = tint(selected);
  return (
    <svg viewBox="0 0 24 24" style={iconStyle}>
      <g transform={`rotate(${DIRECTION_ROTATION[direction]} 12 12)`}>
        <path
          d="M 5 12 H 19 M 13 6 L 19 12 L 13 18"
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

// The container's inner span along the drawn axis (inside the edge bars) and
// the three item bars' sizes on that axis.
const INNER_START = 3.5;
const INNER_SIZE = 17;
const ITEM_SIZES = [3, 3, 3];

// Flex main-axis distribution of `sizes` over `[start, start + size]` —
// returns each item's start coordinate.
function distribute(
  justify: JustifyContent,
  sizes: number[],
  start: number,
  size: number,
): number[] {
  const used = sizes.reduce((a, b) => a + b, 0);
  const free = size - used;
  const n = sizes.length;
  let cursor: number;
  let gap: number;
  switch (justify) {
    case "flexStart":
      cursor = start;
      gap = 1;
      break;
    case "flexEnd":
      gap = 1;
      cursor = start + free - gap * (n - 1);
      break;
    case "center":
      gap = 1;
      cursor = start + (free - gap * (n - 1)) / 2;
      break;
    case "spaceBetween":
      cursor = start;
      gap = free / (n - 1);
      break;
    case "spaceEvenly":
      gap = free / (n + 1);
      cursor = start + gap;
      break;
    case "spaceAround":
      gap = free / n;
      cursor = start + gap / 2;
      break;
  }
  const out: number[] = [];
  for (const s of sizes) {
    out.push(cursor);
    cursor += s + gap;
  }
  return out;
}

// Container edge bars, drawn for the row axis (vertical bars left/right when
// `vertical`, horizontal bars top/bottom otherwise) at reduced opacity.
function EdgeBars({ color, vertical }: { color: string; vertical: boolean }) {
  return vertical ? (
    <g opacity={0.45}>
      <rect x={1.5} y={4} width={1.5} height={16} fill={color} />
      <rect x={21} y={4} width={1.5} height={16} fill={color} />
    </g>
  ) : (
    <g opacity={0.45}>
      <rect x={4} y={1.5} width={16} height={1.5} fill={color} />
      <rect x={4} y={21} width={16} height={1.5} fill={color} />
    </g>
  );
}

export function JustifyIcon({
  value,
  selected,
  direction,
}: IconProps & { value: JustifyContent }) {
  const color = tint(selected);
  const xs = distribute(value, ITEM_SIZES, INNER_START, INNER_SIZE);
  return (
    <svg viewBox="0 0 24 24" style={iconStyle}>
      <g transform={`rotate(${JUSTIFY_ROTATION[direction]} 12 12)`}>
        <EdgeBars color={color} vertical />
        {xs.map((x, i) => (
          <rect
            key={i}
            x={x}
            y={6}
            width={ITEM_SIZES[i]}
            height={12}
            rx={0.75}
            fill={color}
          />
        ))}
      </g>
    </svg>
  );
}

// Three items of different cross sizes, so the alignment reads at a glance.
const ALIGN_ITEM_HEIGHTS = [7, 12, 9];
const ALIGN_ITEM_XS = [5.5, 10.5, 15.5];
const BASELINE_Y = 14.5;

function alignRects(value: AlignItems): { y: number; height: number }[] {
  return ALIGN_ITEM_HEIGHTS.map((h) => {
    switch (value) {
      case "flexStart":
        return { y: INNER_START, height: h };
      case "flexEnd":
        return { y: INNER_START + INNER_SIZE - h, height: h };
      case "center":
        return { y: 12 - h / 2, height: h };
      case "stretch":
        return { y: INNER_START, height: INNER_SIZE };
      case "baseline":
        return { y: BASELINE_Y - h, height: h };
    }
  });
}

export function AlignIcon({
  value,
  selected,
  direction,
}: IconProps & { value: AlignItems }) {
  const color = tint(selected);
  const rects = alignRects(value);
  return (
    <svg viewBox="0 0 24 24" style={iconStyle}>
      <g transform={`rotate(${ALIGN_ROTATION[direction]} 12 12)`}>
        <EdgeBars color={color} vertical={false} />
        {value === "baseline" && (
          <rect
            x={3}
            y={BASELINE_Y - 0.5}
            width={18}
            height={1}
            fill={color}
            opacity={0.6}
          />
        )}
        {rects.map((r, i) => (
          <rect
            key={i}
            x={ALIGN_ITEM_XS[i]}
            y={r.y}
            width={3}
            height={r.height}
            rx={0.75}
            fill={color}
          />
        ))}
      </g>
    </svg>
  );
}
