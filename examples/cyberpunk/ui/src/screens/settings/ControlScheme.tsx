import type { ReactNode } from "react";
import { useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { C, F, T } from "../../theme";
import { EdgeRails } from "../../ui/decor";
import { FILL, Hint, Hints } from "../../ui/kit";
import { Backdrop, STAGE, SubHeader } from "./rows";

/** CONTROL SCHEME: a gamepad in red outline, what each control does called
 *  out in the margins along cyan wires. Esc returns to the settings. */
export function ControlScheme({ onBack }: { onBack: () => void }) {
  const back = () => {
    sfx("back");
    onBack();
  };
  useKeys((e) => {
    if (e.key === "Escape") back();
  });
  return (
    <node style={FILL}>
      <Backdrop />
      <SubHeader title="CONTROL SCHEME" />
      <EdgeRails />
      <node style={STAGE}>
        <Gamepad />
        {CALLOUTS.map(([side, x, y, icon, lines]) => (
          <Label key={`${x} ${y}`} side={side} x={x} y={y} icon={icon}>
            {lines}
          </Label>
        ))}
      </node>
      <Hints>
        <Hint k="ESC" label="Close" onClick={back} />
      </Hints>
    </node>
  );
}

/** What each control does: (side, x of the icon's outer edge, y of the
 *  first line, icon, lines). */
const CALLOUTS: ["left" | "right", number, number, ReactNode, string[]][] = [
  ["left", 730, 180, <Small glyph="view" />, ["Holo Map"]],
  ["right", 1186, 180, <Small glyph="menu" />, ["Pause Menu"]],
  ["left", 500, 248, <Tag k="LB" />, ["Ping Scan", "Scanner Mode (Hold)"]],
  ["left", 500, 338, <Tag k="LT" />, ["(Melee) Guard", "(Ranged) Aim"]],
  ["left", 500, 448, <Tag k="LS" />, ["Sprint"]],
  ["left", 500, 490, <Tag k="LS+RS" />, ["Photo Mode"]],
  ["left", 500, 534, <Small glyph="stick" />, ["Move"]],
  [
    "left",
    500,
    600,
    <Small glyph="dpad" />,
    ["(Dialogue) Up", "Use Consumable", "(Aiming) Zoom In"],
  ],
  [
    "left",
    500,
    708,
    <Small glyph="dpad" />,
    ["(Dialogue) Down", "(Aiming) Zoom Out", "Cycle Objective"],
  ],
  ["left", 500, 820, <Small glyph="dpad" />, ["Messages"]],
  ["left", 500, 868, <Small glyph="dpad" />, ["Summon Vehicle"]],
  [
    "right",
    1414,
    236,
    <Tag k="RB" />,
    ["Use Combat Implant", "Aim Combat Implant (Hold)"],
  ],
  [
    "right",
    1414,
    315,
    <Tag k="RT" />,
    ["(Ranged) Fire", "(Melee) Light Strike", "(Melee) Heavy Strike (Hold)"],
  ],
  ["right", 1414, 447, <Small glyph="west" />, ["Interact", "Reload"]],
  [
    "right",
    1414,
    517,
    <Small glyph="north" />,
    ["Draw Weapon", "Holster Weapon (Double-Tap)"],
  ],
  ["right", 1414, 590, <Small glyph="north" />, ["Quick Access Menu (Hold)"]],
  ["right", 1414, 632, <Small glyph="south" />, ["Jump"]],
  [
    "right",
    1414,
    675,
    <Small glyph="east" />,
    ["Crouch", "Dodge (Double-Tap)"],
  ],
  [
    "right",
    1314,
    751,
    <Tag k="RS" />,
    ["Quick Melee Attack", "(Scanning) Mark Target"],
  ],
  ["right", 1314, 820, <Small glyph="stick" />, ["Look Around"]],
];

/** A callout: lines of red text by a cyan icon, hanging off `x` (the
 *  icon's outer edge) on the given side. */
function Label({
  x,
  y,
  side,
  icon,
  children,
}: {
  x: number;
  y: number;
  side: "left" | "right";
  icon: ReactNode;
  children: string[];
}) {
  const left = side === "left";
  return (
    <node
      style={{
        positionType: "absolute",
        top: y - 16,
        ...(left ? { right: 1920 - x } : { left: x }),
        flexDirection: left ? "row" : "rowReverse",
        alignItems: "flexStart",
        gap: 10,
      }}
    >
      <node
        style={{
          flexDirection: "column",
          alignItems: left ? "flexEnd" : "flexStart",
        }}
      >
        {children.map((line) => (
          <text key={line} style={{ ...T.label, lineHeight: 1.4 }}>
            {line}
          </text>
        ))}
      </node>
      <node style={{ height: 31, alignItems: "center" }}>{icon}</node>
    </node>
  );
}

/** A bumper, trigger or stick-click badge. */
function Tag({ k }: { k: string }) {
  return (
    <node
      style={{
        height: 18,
        minWidth: 26,
        padding: { horizontal: 3 },
        borderRadius: 3,
        backgroundColor: C.cyan,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <text
        style={{
          fontSize: 11,
          fontFamily: F.bold,
          color: "#06141a",
          lineBreak: "noWrap",
        }}
      >
        {k}
      </text>
    </node>
  );
}

type Glyph =
  | "view"
  | "menu"
  | "stick"
  | "dpad"
  | "north"
  | "east"
  | "south"
  | "west";

/** A cyan disc with a control's glyph, as the margins show it. */
function Small({ glyph }: { glyph: Glyph }) {
  const ink = "#06141a";
  return (
    <svg viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
      {glyph === "dpad" ? (
        <polygon
          points={PLUS(12, 12, 4, 10)}
          fill="none"
          stroke={C.cyan}
          strokeWidth={1.8}
        />
      ) : glyph === "stick" ? (
        <>
          <circle
            cx={12}
            cy={12}
            r={10.5}
            fill="none"
            stroke={C.cyan}
            strokeWidth={1.6}
          />
          <circle cx={12} cy={12} r={6} fill={C.cyan} />
        </>
      ) : (
        <>
          <circle cx={12} cy={12} r={10.5} fill={C.cyan} />
          <FaceGlyph glyph={glyph} cx={12} cy={12} size={5} color={ink} />
        </>
      )}
    </svg>
  );
}

/** The marks on the face buttons (and the two small buttons). */
function FaceGlyph({
  glyph,
  cx,
  cy,
  size: s,
  color,
}: {
  glyph: Glyph;
  cx: number;
  cy: number;
  size: number;
  color: string;
}) {
  const stroke = { stroke: color, strokeWidth: s * 0.4, fill: "none" };
  switch (glyph) {
    case "north":
      return <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} {...stroke} />;
    case "east":
      return <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} {...stroke} />;
    case "south":
      return (
        <polyline
          points={[
            cx - s,
            cy - s * 0.5,
            cx,
            cy + s * 0.6,
            cx + s,
            cy - s * 0.5,
          ]}
          {...stroke}
        />
      );
    case "west":
      return (
        <rect
          x={cx - s * 0.7}
          y={cy - s * 0.7}
          width={s * 1.4}
          height={s * 1.4}
          {...stroke}
        />
      );
    case "view":
      return (
        <rect
          x={cx - s}
          y={cy - s * 0.6}
          width={s * 2}
          height={s * 1.2}
          rx={s * 0.3}
          {...stroke}
        />
      );
    case "menu":
      return (
        <>
          {[-0.5, 0, 0.5].map((d) => (
            <line
              key={d}
              x1={cx - s * 0.8}
              y1={cy + d * s}
              x2={cx + s * 0.8}
              y2={cy + d * s}
              {...stroke}
            />
          ))}
        </>
      );
    default:
      return null;
  }
}

/** A plus outline (the d-pad) centred on (cx, cy): arms `w` half-wide,
 *  reaching `l` out. */
function PLUS(cx: number, cy: number, w: number, l: number) {
  return [
    [-w, -l],
    [w, -l],
    [w, -w],
    [l, -w],
    [l, w],
    [w, w],
    [w, l],
    [-w, l],
    [-w, w],
    [-l, w],
    [-l, -w],
    [-w, -w],
  ].flatMap(([x, y]) => [cx + x, cy + y]);
}

/** The pad's outline, right half then left (mirrored about x = 960). */
const BODY =
  "M960 352 L1098 352 C1140 350 1172 362 1188 392 C1222 458 1248 570 1256 650 " +
  "C1262 712 1240 738 1208 730 C1182 724 1162 700 1140 664 C1116 626 1090 612 1052 612 " +
  "L868 612 C830 612 804 626 780 664 C758 700 738 724 712 730 C680 738 658 712 664 650 " +
  "C672 570 698 458 732 392 C748 362 780 350 822 352 Z";

/** The face buttons: (glyph, cx, cy). */
const FACE: [Glyph, number, number][] = [
  ["north", 1104, 412],
  ["west", 1070, 446],
  ["east", 1138, 446],
  ["south", 1104, 480],
];

/** The wires from the margins to the controls (stage px). */
const WIRES = [
  [548, 248, 712, 248, 806, 344],
  [522, 448, 796, 448],
  [530, 600, 810, 600, 866, 550],
  [742, 180, 874, 180, 874, 412, 912, 440],
  [1384, 236, 1232, 236, 1118, 344],
  [1386, 472, 1150, 472, 1122, 478],
  [1290, 748, 1240, 748, 1060, 560],
  [1176, 180, 1046, 180, 1046, 412, 1008, 440],
];

/** An original pad, drawn in the game's red line work: the body and its
 *  inner contour, bumpers and triggers, two sticks, a d-pad, four face
 *  buttons, the small buttons and a crest. */
function Gamepad() {
  const red = C.red;
  const dim = "rgba(255, 93, 81, 0.45)";
  const stick = (cx: number, cy: number) => (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={40}
        fill="none"
        stroke={dim}
        strokeWidth={1.5}
      />
      <circle
        cx={cx}
        cy={cy}
        r={31}
        fill="none"
        stroke={red}
        strokeWidth={2.2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={22}
        fill="none"
        stroke={red}
        strokeWidth={1.5}
      />
    </>
  );
  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{
        positionType: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
      }}
    >
      {WIRES.map((points, i) => (
        <polyline
          key={i}
          points={points}
          fill="none"
          stroke={C.cyanDim}
          strokeWidth={1.4}
        />
      ))}
      <path
        d={BODY}
        fill="none"
        stroke={red}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <g transform="translate(960 500) scale(0.955 0.94) translate(-960 -500)">
        <path d={BODY} fill="none" stroke={dim} strokeWidth={1.4} />
      </g>
      {/* Bumpers and triggers. */}
      {[1, -1].map((side) => (
        <g
          key={side}
          transform={side < 0 ? "translate(1920 0) scale(-1 1)" : undefined}
        >
          <path
            d="M1098 346 C1112 332 1150 326 1176 338 C1186 343 1191 351 1190 360"
            fill="none"
            stroke={red}
            strokeWidth={2.2}
          />
          <path
            d="M1112 330 C1118 312 1146 306 1162 314 L1170 334"
            fill="none"
            stroke={dim}
            strokeWidth={1.6}
          />
        </g>
      ))}
      {stick(838, 448)}
      {stick(1030, 532)}
      <circle
        cx={893}
        cy={532}
        r={40}
        fill="none"
        stroke={dim}
        strokeWidth={1.5}
      />
      <polygon
        points={PLUS(893, 532, 11, 30)}
        fill="none"
        stroke={red}
        strokeWidth={2.2}
      />
      {FACE.map(([glyph, cx, cy]) => (
        <g key={glyph}>
          <circle
            cx={cx}
            cy={cy}
            r={16}
            fill="none"
            stroke={red}
            strokeWidth={2.2}
          />
          <FaceGlyph glyph={glyph} cx={cx} cy={cy} size={6} color={red} />
        </g>
      ))}
      <circle
        cx={922}
        cy={446}
        r={11}
        fill="none"
        stroke={red}
        strokeWidth={1.6}
      />
      <FaceGlyph glyph="view" cx={922} cy={446} size={5} color={red} />
      <circle
        cx={998}
        cy={446}
        r={11}
        fill="none"
        stroke={red}
        strokeWidth={1.6}
      />
      <FaceGlyph glyph="menu" cx={998} cy={446} size={5} color={red} />
      <rect
        x={950}
        y={474}
        width={20}
        height={11}
        rx={3}
        fill="none"
        stroke={red}
        strokeWidth={1.6}
      />
      {/* The crest: a cut diamond, nobody's logo. */}
      <polygon points={[960, 372, 982, 394, 960, 416, 938, 394]} fill={red} />
      <polyline
        points={[948, 404, 972, 384]}
        fill="none"
        stroke="#120708"
        strokeWidth={3}
      />
    </svg>
  );
}
