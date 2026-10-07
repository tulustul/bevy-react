import type { ReactNode } from "react";
import { bevy } from "../bevy";
import { CHROME, Colors, SNAP } from "../theme";

/** An app window: a `<surface>` the Rust side shows on a pane of frosted
 *  glass (`panes/`). The glass, its rim and its shadowless glow are the
 *  pane's shader — the React side draws only content, transparent where
 *  the glass should show. Under the window, the chrome: a close button and
 *  the grab bar that hands the pane to the mouse. */
export function Window({
  app,
  onClose,
  children,
}: {
  app: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <surface target={`pane-${app}`} style={{ flexDirection: "column" }}>
      <node style={{ flexGrow: 1, flexDirection: "column" }}>{children}</node>
      <node
        style={{
          height: CHROME,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.16)",
            transition: { backgroundColor: SNAP },
          }}
          hoverStyle={{ backgroundColor: "rgba(255, 255, 255, 0.34)" }}
          pressStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
        >
          <text
            style={{ fontSize: 15, color: Colors.text, fontWeight: "bold" }}
          >
            ×
          </text>
        </button>
        <node
          onPointerDown={() => bevy.panes.grab({ app })}
          style={{
            width: 150,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
          }}
        >
          <node
            style={{
              width: 128,
              height: 9,
              borderRadius: 5,
              backgroundColor: "rgba(255, 255, 255, 0.42)",
              transition: { backgroundColor: SNAP, size: SNAP },
            }}
            hoverStyle={{
              width: 140,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          />
        </node>
      </node>
    </surface>
  );
}
