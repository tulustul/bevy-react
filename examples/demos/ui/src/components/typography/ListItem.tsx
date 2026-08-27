import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { paragraphStyle } from "./Paragraph";

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
  color: Colors.primary100,
  fontSize: FontSizes.sm,
  lineHeight: 1.55,
};

const liTextStyle: BevyStyle = {
  ...paragraphStyle,
  flexShrink: 1,
};
