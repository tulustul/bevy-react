import type { Character } from "../../store";
import { C, F, T } from "../../theme";
import { ATTRIBUTES, ATTR_MAX } from "./data";

/** Where the ID card's lower half (radar, levels, barcode) starts. */
export const RULE = 352;

/** The five attributes as a radar (rings at 2, 4 and 6) beside a list of
 *  levels drawn as pips. */
export function Radar({ attributes }: { attributes: Character["attributes"] }) {
  const R = 14;
  const at = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    return [r * Math.cos(a), r * Math.sin(a)];
  };
  const ring = (r: number) => [0, 1, 2, 3, 4].flatMap((i) => at(i, r));
  return (
    <>
      <text
        style={{
          ...T.micro,
          positionType: "absolute",
          left: 20,
          top: RULE + 10,
          fontSize: 10,
          letterSpacing: 1,
        }}
      >
        ATTRIBUTES
      </text>
      <svg
        viewBox="-100 -100 200 200"
        style={{
          positionType: "absolute",
          left: 22,
          top: RULE + 24,
          width: 176,
          height: 176,
        }}
      >
        {[2, 4, 6].map((l) => (
          <polygon
            key={l}
            points={ring(l * R)}
            fill="none"
            stroke="#5c1c1e"
            strokeWidth={1}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={at(i, 6 * R)[0]}
            y2={at(i, 6 * R)[1]}
            stroke="#5c1c1e"
            strokeWidth={1}
          />
        ))}
        <polygon
          points={ATTRIBUTES.flatMap((a, i) => at(i, attributes[a.id] * R))}
          fill={C.red}
          opacity={0.3}
        />
        <polygon
          points={ATTRIBUTES.flatMap((a, i) => at(i, attributes[a.id] * R))}
          fill="none"
          stroke={C.red}
          strokeWidth={2}
        />
        {ATTRIBUTES.map((a, i) => (
          <circle
            key={a.id}
            cx={at(i, attributes[a.id] * R)[0]}
            cy={at(i, attributes[a.id] * R)[1]}
            r={3.5}
            fill={C.cyan}
          />
        ))}
      </svg>
      {ATTRIBUTES.map((a, i) => {
        const [x, y] = at(i, 106);
        return (
          <text
            key={a.id}
            style={{
              ...T.micro,
              positionType: "absolute",
              left: 110 + x * 0.88 - 9,
              top: RULE + 112 + y * 0.88 - 6,
              color: C.cyanDim,
            }}
          >
            {a.short}
          </text>
        );
      })}
      <node
        style={{
          positionType: "absolute",
          left: 236,
          top: RULE + 36,
          flexDirection: "column",
          gap: 9,
        }}
      >
        {ATTRIBUTES.map((a) => (
          <node
            key={a.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <text style={{ ...T.micro, fontSize: 11, color: C.red, width: 30 }}>
              {a.short}
            </text>
            <node style={{ flexDirection: "row", gap: 3 }}>
              {Array.from({ length: ATTR_MAX }, (_, l) => (
                <node
                  key={l}
                  style={{
                    width: 18,
                    height: 12,
                    backgroundColor: l < attributes[a.id] ? C.red : "#2a1016",
                  }}
                />
              ))}
            </node>
            <text
              style={{
                fontSize: 20,
                fontFamily: F.bold,
                color: C.cyan,
                lineBreak: "noWrap",
              }}
            >
              {attributes[a.id].toString()}
            </text>
          </node>
        ))}
      </node>
    </>
  );
}
