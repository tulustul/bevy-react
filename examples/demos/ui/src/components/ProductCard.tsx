import { Colors } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

/** A mock store card (image + title + price), used as a realistic subject for
 *  the filter demos. Not the gallery's own `Card` — this one is the content. */
export function ProductCard({ children, style }: Props) {
  return <node style={{ ...productCard, ...style }}>{children}</node>;
}

export const productCard: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 14,
  borderRadius: 12,
  backgroundColor: Colors.surface300,
};
