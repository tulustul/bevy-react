import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** A label painted *on* a bright subject — a swatch, a grid cell, a stacking
 *  card. Dark ink, because the box underneath it is the light one. Override
 *  `fontSize` when the box is bigger than a chip. */
export function BoxLabel({ children, style }: Props) {
  return <text style={{ ...boxLabel, ...style }}>{children}</text>;
}

export const boxLabel: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.xs,
  fontWeight: "bold",
};
