import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** A centered horizontal run of demo subjects. */
export function Row({ children, style }: Props) {
  return <node style={{ ...row, ...style }}>{children}</node>;
}

export const row: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
};
