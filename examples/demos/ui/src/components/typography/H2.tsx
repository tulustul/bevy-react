import { Colors, Fonts, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

/** Section heading inside a doc card. */
export function H2({ children }: PropsWithChildren) {
  return <text style={h2Style}>{children}</text>;
}

export const h2Style: BevyStyle = {
  fontFamily: Fonts.display,
  fontSize: FontSizes.lg,
  fontWeight: "semibold",
  color: Colors.text,
  margin: { top: 10 },
};
