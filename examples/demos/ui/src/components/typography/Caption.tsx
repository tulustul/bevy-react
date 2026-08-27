import { Colors, FontSizes } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";
import { TextMono } from "./TextMono";

type Props = PropsWithChildren & {
  style?: BevyStyle;
  /** Render in the mono face — for captions that are a literal style value
   *  (`50%`, `45deg`) rather than prose. */
  mono?: boolean;
};

/** The small dim label under (or beside) a demo subject. */
export function Caption({ children, style, mono }: Props) {
  const merged = { ...caption, ...style };
  return mono ? (
    <TextMono style={merged}>{children}</TextMono>
  ) : (
    <text style={merged}>{children}</text>
  );
}

export const caption: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.xs,
};
