import type { ReactNode } from "react";
import { CARDS } from "./cards";
import { GlassButton, Label, glass } from "./Glass";
import { Colors, Fonts } from "./theme";

/** The grimoire button's box, so the collected cards know where to fly. */
export const GRIMOIRE_BUTTON = { right: 28, top: 24, width: 212, height: 54 };

export function TopBar({
  found,
  onGrimoire,
  inGrimoire,
}: {
  found: number;
  onGrimoire: () => void;
  inGrimoire: boolean;
}) {
  return (
    <>
      <node
        style={{
          positionType: "absolute",
          left: 34,
          top: 26,
          flexDirection: "column",
          gap: 4,
        }}
      >
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 30,
            fontWeight: "bold",
            letterSpacing: 13,
            color: Colors.gold,
            filter: {
              name: "bloom",
              params: { radius: 10, threshold: 0.45, intensity: 1.6 },
            },
          }}
        >
          ARCANA
        </text>
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: 10,
            letterSpacing: 5,
            color: Colors.faint,
          }}
        >
          LIVING TAROT · BEVY-REACT
        </text>
      </node>
      <GlassButton
        onClick={onGrimoire}
        radius={GRIMOIRE_BUTTON.height / 2}
        style={{
          positionType: "absolute",
          right: GRIMOIRE_BUTTON.right,
          top: GRIMOIRE_BUTTON.top,
          width: GRIMOIRE_BUTTON.width,
          height: GRIMOIRE_BUTTON.height,
          padding: 0,
        }}
      >
        <Book />
        <Label>{inGrimoire ? "THE TABLE" : "GRIMOIRE"}</Label>
        {!inGrimoire && (
          <Label
            style={{ color: Colors.gold, fontSize: 13 }}
          >{`${found}/${CARDS.length}`}</Label>
        )}
      </GlassButton>
    </>
  );
}

function Book() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5c-.8 0-1.5.7-1.5 1.5z"
        fill="none"
        stroke={Colors.gold}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5.7 1.5 1.5z"
        fill="none"
        stroke={Colors.gold}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <circle cx={16.5} cy={9} r={1.4} fill={Colors.gold} />
    </svg>
  );
}

/** The line under the table: what to do next, or the button to do it. */
export function Prompt({ children }: { children: ReactNode }) {
  return (
    <node
      style={{
        positionType: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </node>
  );
}

export function Hint({ text }: { text: string }) {
  return (
    <text
      style={{
        fontFamily: Fonts.display,
        fontSize: 13,
        letterSpacing: 3,
        color: Colors.muted,
      }}
    >
      {text.toUpperCase()}
    </text>
  );
}

/** How the trick is done, bottom-left. Explicit lines: each is measured on
 *  its own, no wrapping involved. */
export function Caption({ lines }: { lines: string[] }) {
  return (
    <node
      style={{
        ...glass(14, 0.5),
        positionType: "absolute",
        left: 28,
        bottom: 30,
        padding: { horizontal: 16, vertical: 11 },
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
      }}
    >
      <node
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: Colors.gold,
        }}
      />
      <node style={{ flexDirection: "column", gap: 3 }}>
        {lines.map((line) => (
          <text key={line} style={{ fontSize: 11, color: Colors.muted }}>
            {line}
          </text>
        ))}
      </node>
    </node>
  );
}
