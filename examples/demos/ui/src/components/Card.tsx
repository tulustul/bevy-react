import { useIsMobile } from "@/hooks";
import { Colors, Filters, Gradients } from "@/theme";
import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

export function Card({ children, style }: Props) {
  const isMobile = useIsMobile();

  return (
    <node
      style={{
        ...cardStyle,
        ...style,
        ...(isMobile && {
          padding: 10,
          width: "100%",
        }),
        ...(!isMobile && {
          backdropFilter: Filters.backdrop,
        }),
      }}
    >
      {children}
    </node>
  );
}

const cardStyle: BevyStyle = {
  alignItems: "center",
  justifyContent: "flexStart",
  flexDirection: "column",
  minWidth: 150,
  maxWidth: "100%",
  padding: 10,
  gap: 8,
  backgroundGradient: Gradients.card,
  borderRadius: 16,
  border: 2,
  borderGradient: Gradients.accentBorderDim,
  boxShadow: { blurRadius: 15, spreadRadius: 5, color: Colors.shadow100 },
};
