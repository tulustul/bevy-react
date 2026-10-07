import type { ReactNode } from "react";
import { useFadeIn } from "../hooks";
import { C, Fonts, OWNS_POINTER, caps, panel } from "../theme";
import { CloseButton } from "../ui/kit";

/** A full screen over the map (which blurs behind it, a backdrop filter
 *  over the live 3D frame): a gilt title, tabs, and the content. */
export function Screen({
  title,
  width,
  height,
  tabs,
  tab,
  onTab,
  onClose,
  children,
}: {
  title: string;
  width: number;
  height: number;
  tabs?: string[];
  tab?: string;
  onTab?: (tab: string) => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const enter = useFadeIn();
  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 32,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(3, 8, 14, 0.55)",
        backdropFilter: { name: "blur", params: { radius: 8 } },
      }}
      hoverStyle={OWNS_POINTER}
    >
      <node
        style={{
          ...panel,
          ...enter,
          width,
          height,
          flexDirection: "column",
          border: 1.5,
          borderColor: C.gold,
        }}
      >
        <node
          style={{
            height: 54,
            flexShrink: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            border: { bottom: 1 },
            borderColor: C.goldLine,
            backgroundGradient: {
              type: "linear",
              angle: 180,
              stops: [{ color: "#24405e" }, { color: "#132438" }],
            },
          }}
        >
          <text
            style={{
              fontFamily: Fonts.display,
              fontWeight: "bold",
              fontSize: 24,
              letterSpacing: 4,
              color: C.goldHi,
              textShadow: {
                color: "rgba(0, 0, 0, 0.6)",
                offsetX: 0,
                offsetY: 2,
              },
            }}
          >
            {title.toUpperCase()}
          </text>
          <node style={{ positionType: "absolute", right: 14, top: 12 }}>
            <CloseButton onClick={onClose} />
          </node>
        </node>
        {tabs && (
          <node
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 4,
              padding: { top: 8 },
              border: { bottom: 1 },
              borderColor: C.goldLine,
              flexShrink: 0,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => onTab?.(t)}
                style={{
                  padding: { horizontal: 18, vertical: 9 },
                  border: { bottom: 2 },
                  borderColor: t === tab ? C.gold : "rgba(0, 0, 0, 0)",
                  backgroundColor:
                    t === tab ? "rgba(217, 183, 108, 0.1)" : "rgba(0, 0, 0, 0)",
                }}
                hoverStyle={{ backgroundColor: "rgba(217, 183, 108, 0.16)" }}
              >
                <text
                  style={{
                    ...caps,
                    fontSize: 12,
                    color: t === tab ? C.goldHi : C.muted,
                  }}
                >
                  {t.toUpperCase()}
                </text>
              </button>
            ))}
          </node>
        )}
        <node
          style={{
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            flexDirection: "column",
          }}
        >
          {children}
        </node>
      </node>
    </node>
  );
}
