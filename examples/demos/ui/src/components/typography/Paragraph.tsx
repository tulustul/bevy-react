import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

/** A paragraph. Inline pieces (`<B>`, `<InlineCode>`) nest inside. */
export function Paragraph({ children }: PropsWithChildren) {
  return <text style={paragraphStyle}>{children}</text>;
}

export const paragraphStyle: BevyStyle = {
  fontSize: FontSizes.sm,
  color: Colors.textColor200,
  lineHeight: 1.55,
};
