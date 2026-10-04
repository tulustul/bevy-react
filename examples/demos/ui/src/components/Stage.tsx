import { Colors } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/**
 * A plate on the example's stage — a container the demo's subjects sit in
 * (a scroll area, a flex box, a grid), set apart by a hairline rim.
 *
 * The base is chrome only (fill, corner, inset): layout is deliberately left
 * to the call site, because half the stages centre a single subject and half
 * are row/column/grid/scroll containers whose layout *is* the demo. Override
 * anything in place via `style`.
 */
export function Stage({ children, style }: Props) {
  return <node style={{ ...stage, ...style }}>{children}</node>;
}

export const stage: BevyStyle = {
  padding: 10,
  backgroundColor: Colors.card,
  border: 1,
  borderColor: Colors.line,
  borderRadius: 12,
};
