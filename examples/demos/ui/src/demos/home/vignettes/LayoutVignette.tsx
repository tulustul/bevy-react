import { useEffect } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Radio, type RadioOption } from "@/components";
import { Colors } from "@/theme";
import { AlignIcon, DirectionIcon } from "@/demos/layout/flexIcons";
import { growLayoutTransition, growTransition } from "../beats";
import { Extra, useExpandingOrCollapsing } from "../Extra";
import {
  controlsStyle,
  Spacing,
  vignetteStyle,
  type VignetteProps,
} from "../shared";
import { useVignetteState } from "../store";

type Direction = "row" | "column";
type Align = "flexStart" | "flexEnd" | "center" | "stretch";
type Arrangement = { direction: Direction; align: Align };

const ITEMS = [
  { id: "a", color: Colors.sky100 },
  { id: "b", color: Colors.teal100 },
  { id: "c", color: Colors.amber100 },
] as const;

const FLIP_MS = 520;
const AUTO_MS = 1300;
const GAP = 10;
/** Room the pill rows take at rest, including the gap above. */
const CONTROLS_HEIGHT = 120;

/** What the tile cycles through; the first entry is the fresh-visit look. */
const LOOP: Arrangement[] = [
  { direction: "row", align: "stretch" },
  { direction: "column", align: "flexStart" },
  { direction: "column", align: "stretch" },
  { direction: "row", align: "flexEnd" },
  { direction: "row", align: "center" },
  { direction: "column", align: "center" },
];

const DIRECTIONS: RadioOption<Direction>[] = (["row", "column"] as const).map(
  (d) => ({
    value: d,
    label: ({ selected }) => (
      <DirectionIcon selected={selected} direction={d} />
    ),
  }),
);

const ALIGNS: Align[] = ["flexStart", "flexEnd", "center", "stretch"];

/** Layout animations: three bars whose REAL flex layout changes, eased away
 * after layout by `transition: { layout }` — no transforms. */
export function LayoutVignette({ expanded, grown }: VignetteProps) {
  const phase = useExpandingOrCollapsing();
  const [arrangement, setArrangement] = useVignetteState<Arrangement>(
    "layout.arrangement",
    LOOP[0],
  );
  const { direction, align } = arrangement;

  // Steps from wherever the panel left it (an arrangement outside `LOOP` steps to the start).
  useEffect(() => {
    if (expanded) return;
    const id = setInterval(
      () => setArrangement((a) => LOOP[(LOOP.indexOf(a) + 1) % LOOP.length]),
      AUTO_MS,
    );
    return () => clearInterval(id);
  }, [expanded, setArrangement]);

  const long = grown ? 230 : 110;
  const thick = grown ? 70 : 30;
  // The bars ride `layout` alone (the FLIP scales them, and solid paint can't
  // tell); `size` on them too would rob the FLIP of the swap.
  const layout = phase
    ? growLayoutTransition
    : { duration: FLIP_MS, easing: "easeInOut" as const };
  // A fixed square box: sizing to contents would re-flow the whole panel on
  // every toggle, and a FLIP eases only the node it is on.
  const box = Math.max(long, ITEMS.length * thick + (ITEMS.length - 1) * GAP);
  const row = direction === "row";

  const aligns: RadioOption<Align>[] = ALIGNS.map((a) => ({
    value: a,
    label: ({ selected }) => (
      <AlignIcon value={a} selected={selected} direction={direction} />
    ),
  }));

  return (
    <node style={vignetteStyle}>
      <node
        style={{
          ...frameStyle,
          width: box,
          height: box,
          flexDirection: direction,
          alignItems: align,
          transition: { size: growTransition },
        }}
      >
        {ITEMS.map((item) => {
          const cross = align === "stretch" ? undefined : thick;
          return (
            <node
              key={item.id}
              style={{
                width: row ? thick : cross,
                height: row ? cross : thick,
                borderRadius: 6,
                backgroundColor: item.color,
                transition: { layout },
              }}
            />
          );
        })}
      </node>
      <Extra grown={grown} maxHeight={CONTROLS_HEIGHT}>
        <node style={pillRowsStyle}>
          <Radio
            pinch={{ radius: 0.7 }}
            options={DIRECTIONS}
            value={direction}
            onChange={(direction) =>
              setArrangement((a) => ({ ...a, direction }))
            }
          />
          <Radio
            pinch={{ radius: 0.7 }}
            options={aligns}
            value={align}
            onChange={(align) => setArrangement((a) => ({ ...a, align }))}
          />
        </node>
      </Extra>
    </node>
  );
}

const frameStyle: BevyStyle = {
  justifyContent: "center",
  gap: GAP,
};

const pillRowsStyle: BevyStyle = {
  ...controlsStyle,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: Spacing.controls + Spacing.control,
};
