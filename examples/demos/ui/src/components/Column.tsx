import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** A centered vertical stack of demo subjects. `ControlColumn` is the
 *  full-width variant that also holds the sliders/checkboxes under them. */
export function Column({ children, style }: Props) {
  return <node style={{ ...column, ...style }}>{children}</node>;
}

export const column: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};
