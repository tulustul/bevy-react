import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { PROSE_LINE, paragraphStyle } from "./Paragraph";

export function ListItem({ children }: PropsWithChildren) {
  return (
    <node style={itemStyle}>
      <text style={bulletStyle}>•</text>
      <text style={liTextStyle}>{children}</text>
    </node>
  );
}

export const itemStyle: BevyStyle = {
  flexDirection: "row",
  gap: 8,
  alignItems: "flexStart",
};

const bulletStyle: BevyStyle = {
  color: Colors.cyan,
  fontSize: FontSizes.body,
  lineHeight: PROSE_LINE,
};

const liTextStyle: BevyStyle = {
  ...paragraphStyle,
  flexShrink: 1,
};
