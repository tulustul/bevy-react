import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { HeaderText } from "./HeaderText";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** The title of a page header card or a modal — the largest text on screen
 *  after the brand, in the display treatment. `TopBar` uses the bare
 *  `panelTitle` style instead: the compact bar wants no filter chain. */
export function PanelTitle({ children, style }: Props) {
  return (
    <HeaderText style={{ ...panelTitle, ...style }}>{children}</HeaderText>
  );
}

export const panelTitle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xl,
  fontWeight: "semibold",
};
