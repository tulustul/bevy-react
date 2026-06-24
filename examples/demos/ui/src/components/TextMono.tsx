import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

export function TextMono({ children, style }: Props) {
  return (
    <text style={{ ...style, fontFamily: "Noto Sans Mono" }}>{children}</text>
  );
}
