import { PropsWithChildren } from "react";

export function DemoRow({ children }: PropsWithChildren) {
  return (
    <node style={{ gap: 30, flexWrap: "wrap", justifyContent: "center" }}>
      {children}
    </node>
  );
}
