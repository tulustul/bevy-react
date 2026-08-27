import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** The mono face. A face modifier rather than a role — pair it with a role's
 *  style when the text is a literal value (`50%`, `45deg`, a log line). */
export function TextMono({ children, style }: Props) {
  return <text style={{ ...style, ...textMono }}>{children}</text>;
}

export const textMono: BevyStyle = { fontFamily: "Noto Sans Mono" };
