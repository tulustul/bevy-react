import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** An example card's body: the subject on top, its controls underneath.
 *  Full width so the sliders stretch to the card. */
export function ControlColumn({ children, style }: Props) {
  return <node style={{ ...controlColumn, ...style }}>{children}</node>;
}

export const controlColumn: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  width: "100%",
};
