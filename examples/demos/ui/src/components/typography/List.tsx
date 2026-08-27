import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

/** Bullet list; each child of `<Ul>` should be a `<Li>`. */
export function List({ children }: PropsWithChildren) {
  return <node style={listStyle}>{children}</node>;
}

export const listStyle: BevyStyle = {
  flexDirection: "column",
  gap: 6,
};
