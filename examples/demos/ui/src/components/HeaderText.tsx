import { BevyStyle } from "bevy-react/jsx";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  style?: BevyStyle;
};

export function HeaderText({ children, style }: Props) {
  return (
    <node
      style={{
        filter: {
          name: "shadow",
          params: { color: "black", offsetY: 3, spread: 5 },
        },
      }}
    >
      <text
        style={{
          ...style,
          filter: [
            {
              name: "gradientMap",
              params: {
                stops: [{ color: "red" }, { color: "yellow" }],
                amount: 0.6,
              },
            },
            {
              name: "outline",
              params: { color: "black", width: 1.5 },
            },
          ],
        }}
      >
        {children}
      </text>
    </node>
  );
}
