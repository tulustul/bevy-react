import { PropsWithChildren } from "react";
import { useIsMobile } from "@/hooks";

export function DemoRow({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();

  return (
    <node
      style={{
        gap: 30,
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        ...(isMobile && {
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
