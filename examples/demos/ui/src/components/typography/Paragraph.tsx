import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

/** A paragraph. Inline pieces (`<B>`, `<InlineCode>`) nest inside. */
export function Paragraph({ children }: PropsWithChildren) {
  return <text style={paragraphStyle}>{children}</text>;
}

/** One absolute line height for a paragraph AND every inline span in it
 *  (`Bold`, `InlineCode`): spans don't inherit it, and a span left on its own
 *  default pulls its lines tighter than the rest of the paragraph. */
export const PROSE_LINE = { px: 25 };

export const paragraphStyle: BevyStyle = {
  fontSize: FontSizes.body,
  color: Colors.textBody,
  lineHeight: PROSE_LINE,
};
