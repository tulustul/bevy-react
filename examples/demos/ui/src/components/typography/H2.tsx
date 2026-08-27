import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

/** Section heading inside a doc card. */
export function H2({ children }: PropsWithChildren) {
  return <text style={h2Style}>{children}</text>;
}

export const h2Style: BevyStyle = {
  fontSize: FontSizes.lg,
  fontWeight: "semibold",
  color: Colors.textColor100,
  margin: { top: 8 },
};
