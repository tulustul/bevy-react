import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

/** Sub-heading inside a doc card. */
export function H3({ children }: PropsWithChildren) {
  return <text style={h3Style}>{children}</text>;
}

export const h3Style: BevyStyle = {
  fontSize: FontSizes.base,
  fontWeight: "semibold",
  color: Colors.textColor100,
  margin: { top: 4 },
};
