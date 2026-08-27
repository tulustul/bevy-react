import { Colors } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
  hoverStyle?: BevyStyle;
};

/** The styling demos' subject: a plain accent-filled square, centered so a
 *  label can sit inside it. Most demos hand it the one style they illustrate. */
export function Box({ children, style, hoverStyle }: Props) {
  return (
    <node style={{ ...box, ...style }} hoverStyle={hoverStyle}>
      {children}
    </node>
  );
}

export const box: BevyStyle = {
  width: 72,
  height: 72,
  borderRadius: 10,
  backgroundColor: Colors.primary100,
  justifyContent: "center",
  alignItems: "center",
};
