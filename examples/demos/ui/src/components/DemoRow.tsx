import { PropsWithChildren } from "react";
import { useIsMobile } from "@/hooks";

/** The examples grid: cards keep their natural width, wrap, and centre under
 *  the docs; cards in a row match heights. */
export function DemoRow({ children }: PropsWithChildren) {
  const isMobile = useIsMobile();

  return (
    <node
      style={{
        gap: 20,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "stretch",
        width: "100%",
        ...(isMobile && {
          flexDirection: "column",
          flexWrap: "nowrap",
          gap: 12,
        }),
      }}
    >
      {children}
    </node>
  );
}
