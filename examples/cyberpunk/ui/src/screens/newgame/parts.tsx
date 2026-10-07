import type { ReactNode } from "react";
import type { BevyStyle } from "bevy-react";
import { C, F, T, chamfer } from "../../theme";
import { LegalFooter, ProtocolStamp, rng } from "../../ui/decor";
import { Keycap } from "../../ui/kit";

/** The lit red of hovered frames. */
const HOT = "#ff5f56";
/** What sits behind the cards: masks cut their content's corners with it. */
const BG = "#0a0d13";

/** The furniture of steps 2-6: the protocol stamp top left, the resident
 *  database's print bottom left, a reference tag bottom center. */
export function Chrome() {
  return (
    <>
      <ProtocolStamp />
      <LegalFooter />
      <node
        style={{
          positionType: "absolute",
          left: 815,
          bottom: 22,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <text style={{ ...T.micro, fontSize: 10 }}>
          SBL 044 CKC 151 CC10 A55
        </text>
        <svg viewBox="0 0 30 8" style={{ width: 30, height: 8 }}>
          <polygon
            points={[0, 4, 9, 0, 9, 3, 30, 3, 30, 5, 9, 5, 9, 8]}
            fill={C.red}
          />
        </svg>
      </node>
    </>
  );
}

/** A gradient that paints the `cut` px bottom-right corner of its node in
 *  `color` (and a `line` band along the cut): how a rectangular `<portal>`
 *  gets a cut corner. */
function cornerMask(cut: number, line?: string, color = BG): BevyStyle {
  const d = cut / Math.SQRT2;
  const clear = C.clear;
  return {
    backgroundGradient: {
      type: "linear",
      angle: 315,
      stops: line
        ? [
            { color, position: d - 0.3 },
            { color: line, position: d + 0.3 },
            { color: line, position: d + 2.6 },
            { color: clear, position: d + 3.2 },
          ]
        : [
            { color, position: d },
            { color: clear, position: d + 0.6 },
          ],
    },
  };
}

const abs = (s: BevyStyle): BevyStyle => ({ positionType: "absolute", ...s });

/** The lit frame of the hovered card, laid over its content box: red rules
 *  round it, a step out down the left edge, a thick bar outside the right
 *  edge with its foot cut at 45° (`cut` ≥ `bar` also cuts the content's
 *  corner), all glowing. */
export function HotFrame({
  bar = 22,
  cut = 22,
  step = 96,
}: {
  bar?: number;
  cut?: number;
  step?: number;
}) {
  // The cut runs from the overlay's outer corner (`bar` right of the
  // content, 4 px under it): what's left of it cuts the content's corner.
  const inner = Math.max(0, cut - bar - 4);
  return (
    <>
      {/* The corner goes under the glow; its edge glows with the rest. */}
      {inner > 0 && (
        <node
          style={abs({
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            ...cornerMask(inner),
          })}
        />
      )}
      <node
        style={{
          ...abs({ left: -8, top: -4, right: -bar, bottom: -4 }),
          filter: {
            name: "shadow",
            params: {
              color: "rgba(255, 60, 52, 0.75)",
              offsetX: 0,
              offsetY: 0,
              spread: 14,
            },
          },
        }}
      >
        {inner > 0 && (
          <node
            style={abs({
              left: 8,
              top: 4,
              right: bar,
              bottom: 4,
              ...cornerMask(inner, HOT, C.clear),
            })}
          />
        )}
        <node
          style={abs({
            left: 5,
            right: bar,
            top: 0,
            height: 4,
            backgroundColor: HOT,
          })}
        />
        <node
          style={abs({
            left: 5,
            top: 0,
            width: 3,
            height: step,
            backgroundColor: HOT,
          })}
        />
        <node
          style={abs({
            left: 0,
            top: step,
            width: 8,
            bottom: 0,
            ...chamfer(HOT, 8, undefined, 1, "bl"),
          })}
        />
        <node
          style={abs({
            left: 8,
            right: bar + inner,
            bottom: 0,
            height: 4,
            ...(inner > 0
              ? chamfer(HOT, 4, undefined, 1, "br")
              : { backgroundColor: HOT }),
          })}
        />
        <node
          style={abs({
            right: 0,
            top: 0,
            bottom: 0,
            width: bar,
            ...chamfer(HOT, cut, undefined, 1, "br"),
          })}
        />
      </node>
    </>
  );
}

/** A card at rest: a hairline frame, its corner cut, a tick on its foot
 *  `tick` px from its left. */
export function ColdFrame({
  cut = 30,
  tick = 186,
  line = "#a3332b",
}: {
  cut?: number;
  tick?: number;
  line?: string;
}) {
  return (
    <>
      <node
        style={abs({
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          ...cornerMask(cut),
        })}
      />
      <node
        style={abs({
          left: -1,
          top: -1,
          right: -1,
          bottom: -1,
          ...chamfer(C.clear, cut + 1, line, 1),
        })}
      />
      <node
        style={abs({
          left: tick,
          bottom: 0,
          width: 6,
          height: 54,
          border: 1,
          borderColor: line,
        })}
      />
    </>
  );
}

/** A barcode `width` × `height`, its bars rolled from `seed` (one path). */
export function Barcode({
  seed,
  width,
  height,
  color = C.red,
}: {
  seed: number;
  width: number;
  height: number;
  color?: string;
}) {
  const r = rng(seed);
  let d = "";
  for (let x = 0; x < width - 1; ) {
    const w = 1 + Math.floor(r() * 3);
    if (r() > 0.35) d += `M${x} 0h${w}v${height}h${-w}Z`;
    x += w + 1;
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height }}>
      <path d={d} fill={color} />
    </svg>
  );
}

/** "MIN LEVEL" / "MAX LEVEL": a small outlined tag. */
export function LevelBadge({ label }: { label: string }) {
  return (
    <node
      style={{
        height: 24,
        border: 2,
        borderColor: C.red,
        padding: { horizontal: 6 },
        justifyContent: "center",
        backgroundColor: "#2a0d10",
      }}
    >
      <text
        style={{
          fontSize: 15,
          fontFamily: F.semibold,
          color: C.red,
          lineBreak: "noWrap",
        }}
      >
        {label}
      </text>
    </node>
  );
}

/** BACK [ESC] / NEXT [F], bottom right: two dark red plates cut at their
 *  outer feet, joined by a short rule. */
export function NavButtons({
  onBack,
  onNext,
  next = "NEXT",
}: {
  onBack: () => void;
  onNext: () => void;
  next?: string;
}) {
  return (
    <node
      style={{
        positionType: "absolute",
        right: 165,
        top: 906,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <NavButton k="ESC" label="BACK" corner="bl" onClick={onBack} />
      <node
        style={abs({
          left: 214,
          top: 28,
          width: 46,
          height: 3,
          border: 1,
          borderColor: "rgba(255, 93, 81, 0.45)",
        })}
      />
      <NavButton k="F" label={next} corner="br" onClick={onNext} />
    </node>
  );
}

function NavButton({
  k,
  label,
  corner,
  onClick,
}: {
  k: string;
  label: string;
  corner: "bl" | "br";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...chamfer("#2a0b0e", 18, "rgba(255, 93, 81, 0.5)", 1, corner),
        width: 240,
        height: 58,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
      hoverStyle={chamfer("#4a141a", 18, C.red, 1, corner)}
    >
      <Keycap k={k} />
      <text style={{ ...T.menu, fontSize: 26 }}>{label}</text>
    </button>
  );
}

/** A hint with its own glyph (the kit's `Hint` takes keys and the mouse). */
export function IconHint({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <node style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <text style={{ fontSize: 25, color: C.red, lineBreak: "noWrap" }}>
        {label}
      </text>
    </node>
  );
}
