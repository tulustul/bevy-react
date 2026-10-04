import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { PROSE_LINE } from "./Paragraph";

/** Bold inline run (use inside `<P>`). */
export function Bold({ children }: PropsWithChildren) {
  return <text style={boldStyle}>{children}</text>;
}

// Spans take element defaults for unset fields, so B pins the paragraph size
// (its realistic host — inside a heading, restate the size inline).
export const boldStyle: BevyStyle = {
  fontWeight: "semibold",
  fontSize: FontSizes.body,
  lineHeight: PROSE_LINE,
  color: Colors.text,
};
