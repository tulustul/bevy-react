import { Responsiveness } from "@/theme";
import { useWindowSize } from "@/useWindowSize";
import { PropsWithChildren } from "react";

export function DemoRow({ children }: PropsWithChildren) {
  const window = useWindowSize();

  return (
    <node
      style={{
        gap: 30,
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        ...(window.width < Responsiveness.desktop && {
          flexDirection: "column",
          flexWrap: "nowrap",
          gap: 10,
        }),
      }}
    >
      {children}
    </node>
  );
}
