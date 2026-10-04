import { Colors, Fonts, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { PROSE_LINE } from "./Paragraph";

/** Inline code run (use inside `<P>`). */
export function InlineCode({ children }: PropsWithChildren) {
  return <text style={inlineCodeStyle}>{children}</text>;
}

// Spans don't inherit the parent's fontSize (unset fields take element
// defaults), so the inline-code run pins the paragraph size explicitly.
export const inlineCodeStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.code,
  lineHeight: PROSE_LINE,
  color: Colors.cyan,
};
