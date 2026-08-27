import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** The name of a thing inside a demo — a product card, a pinned card, a
 *  desktop window. Reads as the strongest text in its own little box. */
export function CardTitle({ children, style }: Props) {
  return <text style={{ ...cardTitle, ...style }}>{children}</text>;
}

export const cardTitle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
