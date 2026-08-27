import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

/** Inline code run (use inside `<P>`). */
export function InlineCode({ children }: PropsWithChildren) {
  return <text style={inlineCodeStyle}>{children}</text>;
}

// Spans don't inherit the parent's fontSize (unset fields take element
// defaults), so the inline-code run pins the paragraph size explicitly.
export const inlineCodeStyle: BevyStyle = {
  fontFamily: "Noto Sans Mono",
  fontSize: FontSizes.sm,
  color: Colors.sky100,
};
