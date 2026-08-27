import { useEffect } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Radio } from "@/components";
import { HighlightedCode } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { growTransition } from "../beats";
import { Extra } from "../Extra";
import {
  controlsStyle,
  Spacing,
  vignetteStyle,
  type VignetteProps,
} from "../shared";
import { useVignetteState } from "../store";

/** Named CSS colours, kept SHORT: the tile shows the whole literal on one line
 * at 12px mono, and `"mediumseagreen"` overflows it. */
const COLORS = ["tomato", "gold", "orchid", "skyblue"];

const AUTO_MS = 1500;
const SETTLE_MS = 900;
/** The box at each end of the flight. */
const TILE_BOX = 80;
const PANEL_BOX = 130;
/** Room each extra takes at rest, including its gap above. */
const LITERAL_HEIGHT = 44;
const PILLS_HEIGHT = 120;
const CODE_HEIGHT = 110;

/** Hot reload, as a staged illustration (not a live file watcher): the literal
 * in the source and the box on screen stay locked together. The tile cycles
 * the literal; the panel swaps it for pills and shows the source. */
export function HotReloadVignette({ expanded, grown }: VignetteProps) {
  const [i, setI] = useVignetteState("hotreload.color", 0);
  const color = COLORS[i];

  useEffect(() => {
    if (expanded) return;
    const id = setInterval(() => setI((n) => (n + 1) % COLORS.length), AUTO_MS);
    return () => clearInterval(id);
  }, [expanded, setI]);

  const box = grown ? PANEL_BOX : TILE_BOX;

  return (
    <node style={vignetteStyle}>
      <node
        style={{
          width: box,
          height: box,
          borderRadius: 12,
          backgroundColor: color,
          transition: {
            size: growTransition,
            backgroundColor: { duration: SETTLE_MS, easing: "easeOut" },
          },
        }}
      />
      <Extra grown={!grown} maxHeight={LITERAL_HEIGHT}>
        <text style={literalStyle}>{`"${color}"`}</text>
      </Extra>
      <Extra grown={grown} maxHeight={PILLS_HEIGHT}>
        <node style={controlsStyle}>
          <Radio
            pinch={{ radius: 0.7 }}
            options={COLORS.map((c) => ({ value: c, label: c }))}
            value={color}
            onChange={(c) => setI(COLORS.indexOf(c))}
          />
        </node>
      </Extra>
      <Extra grown={grown} maxHeight={CODE_HEIGHT}>
        <node style={codeBlockStyle}>
          <HighlightedCode lang="tsx" code={source(color)} />
        </node>
      </Extra>
    </node>
  );
}

const source = (color: string) =>
  `<node style={{\n  backgroundColor: "${color}",\n}} />`;

/** Matches the docs highlighter's string colour. */
const literalStyle: BevyStyle = {
  fontFamily: "Noto Sans Mono",
  fontSize: FontSizes.lg,
  color: Colors.green100,
  fontWeight: "bold",
  margin: { top: Spacing.label },
};

/** The docs' `<Code>` body, without its header. */
const codeBlockStyle: BevyStyle = {
  margin: { top: Spacing.extra },
  padding: 10,
  backgroundColor: Colors.surface100,
  borderRadius: 10,
};
