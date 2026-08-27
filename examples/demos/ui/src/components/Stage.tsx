import { Colors } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/**
 * The recessed panel a demo subject sits on — a dark inset that separates the
 * thing being demonstrated from the card around it.
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
  backgroundColor: Colors.surface100,
  borderRadius: 12,
};
