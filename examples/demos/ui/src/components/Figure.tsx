import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren, ReactNode } from "react";
import { Caption } from "./typography";

type Props = PropsWithChildren & {
  /** The label under the subject. */
  caption: ReactNode;
  /** Caption in the mono face — for a literal style value (`45deg`, `50%`). */
  mono?: boolean;
  style?: BevyStyle;
};

/** A demo subject with its label underneath — the gallery's figure. */
export function Figure({ children, caption, mono, style }: Props) {
  return (
    <node style={{ ...figure, ...style }}>
      {children}
      <Caption mono={mono}>{caption}</Caption>
    </node>
  );
}

export const figure: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};
