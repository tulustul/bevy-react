import type { BevyStyle } from "bevy-react";
import { C, F, T } from "../theme";

/** A tiny deterministic generator, so the data noise is stable per seed. */
export function rng(seed: number) {
  let s = seed * 2654435761 + 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const HEX = "0123456789ABCDEF";

/** Lines of hex groups, like the readouts strewn around the game's frames. */
export function noiseLines(seed: number, lines: number, groups: number) {
  const r = rng(seed);
  return Array.from({ length: lines }, () =>
    Array.from({ length: groups }, () =>
      Array.from(
        { length: 4 + Math.floor(r() * 5) },
        () => HEX[Math.floor(r() * 16)],
      ).join(""),
    ).join(" "),
  );
}

/** A block of data noise in the micro mono face. */
export function DataNoise({
  seed,
  lines = 4,
  groups = 4,
  color = C.redDim,
  style,
}: {
  seed: number;
  lines?: number;
  groups?: number;
  color?: string;
  style?: BevyStyle;
}) {
  return (
    <text style={{ ...T.micro, color, ...style }}>
      {noiseLines(seed, lines, groups).join("\n")}
    </text>
  );
}

/** The stamp in the top-left corner of the full-screen menus: a mark, a
 *  protocol number, and the small print. */
export function ProtocolStamp({ style }: { style?: BevyStyle }) {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 50,
        top: 42,
        flexDirection: "column",
        gap: 4,
        ...style,
      }}
    >
      <node style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <node style={{ flexDirection: "column", gap: 2 }}>
          {[38, 26, 34, 20].map((w, i) => (
            <node
              key={i}
              style={{ width: w, height: 3, backgroundColor: C.redDim }}
            />
          ))}
        </node>
        <text style={{ ...T.micro, fontSize: 9, color: C.redDim }}>
          {
            "ONLY SCPD CLASS-4 TECHS\nMAY ACCESS, OPERATE OR\nDISABLE THIS DEVICE."
          }
        </text>
      </node>
      <text
        style={{
          fontFamily: F.bold,
          fontSize: 12,
          color: C.redDim,
          letterSpacing: 1,
        }}
      >
        {"PROTOCOL\n7741-B09"}
      </text>
      <node
        style={{
          width: 150,
          height: 11,
          backgroundColor: C.redDeep,
          justifyContent: "center",
          padding: { left: 18 },
        }}
      >
        <text style={{ ...T.micro, fontSize: 8, color: "#ffb3ad" }}>
          SBL 044 CKC 151 CC10 A55
        </text>
      </node>
    </node>
  );
}

/** A thin rule with a caption, like the ones framing the game's panels. */
export function Rule({
  width,
  label,
  color = C.redDim,
  style,
}: {
  width: number;
  label?: string;
  color?: string;
  style?: BevyStyle;
}) {
  return (
    <node style={{ flexDirection: "column", gap: 3, width, ...style }}>
      {label && <text style={{ ...T.micro, fontSize: 8, color }}>{label}</text>}
      <node style={{ height: 1, backgroundColor: color }} />
    </node>
  );
}

/** The faint dotted rails down both edges of the full-screen menus, with a
 *  rotated readout on the left. */
export function EdgeRails() {
  const rail = (side: "left" | "right"): BevyStyle => ({
    positionType: "absolute",
    [side]: 18,
    top: 0,
    bottom: 0,
    width: 3,
    border: { left: 1 },
    borderColor: "rgba(255, 93, 81, 0.18)",
  });
  return (
    <>
      <node style={rail("left")} />
      <node style={rail("right")} />
      <text
        style={{
          ...T.micro,
          positionType: "absolute",
          left: -96,
          top: 520,
          width: 240,
          color: "rgba(199, 46, 43, 0.7)",
          transform: { rotate: -90 },
        }}
      >
        DB 1244.635132 1244.635132 CP
      </text>
    </>
  );
}

/** The resident-database small print at the bottom left of the new-game
 *  screens: a mark of three peaks, the database's name, the fine print. */
export function LegalFooter() {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 50,
        bottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <svg viewBox="0 0 60 40" style={{ width: 66, height: 44 }}>
        <polygon
          points={[2, 38, 16, 8, 26, 26, 32, 14, 40, 28, 46, 6, 58, 38]}
          fill="none"
          stroke={C.redDim}
          strokeWidth={2.4}
          strokeLinejoin="miter"
        />
        <polyline
          points={[10, 38, 18, 22, 24, 38]}
          fill="none"
          stroke={C.redDim}
          strokeWidth={1.6}
        />
      </svg>
      <text
        style={{
          fontSize: 15,
          fontFamily: F.semibold,
          color: C.redDim,
          lineHeight: 1.15,
        }}
      >
        {"Sable City\nResident\nDatabase"}
      </text>
      {/* The width sits on a wrapper: a `<text>` with its own width in an
          `alignItems: "center"` row is measured one word a line (TODO). */}
      <node style={{ width: 520 }}>
        <text style={{ fontSize: 10.5, color: C.redDim, lineHeight: 1.25 }}>
          {
            "The data you enter on a CRD terminal will only be used for the purpose you entered it. Your personal data is protected under the 2088 Privacy Act and the Sable City Charter, except where it is not. In accordance with Gridwatch Memo 4410-B, terminals may retain biometric samples for the duration of your session and the rest of your life."
          }
        </text>
      </node>
    </node>
  );
}
