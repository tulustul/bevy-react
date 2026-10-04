import { Colors, Fonts, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** The title of a card, a page or a modal: the display face, plain white —
 *  the hierarchy comes from size and weight, not effects. */
export function PanelTitle({ children, style }: Props) {
  return <text style={{ ...panelTitle, ...style }}>{children}</text>;
}

export const panelTitle: BevyStyle = {
  fontFamily: Fonts.display,
  color: Colors.text,
  fontSize: FontSizes.xl,
  fontWeight: "semibold",
};
