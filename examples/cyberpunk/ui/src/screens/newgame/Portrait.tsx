import { C } from "../../theme";
import { rng } from "../../ui/decor";
import { EYE_COLORS, HAIR_COLORS, SKIN_TONES } from "./data";
import { CX, Marks, at, type Pt } from "./Marks";

/** `a` mixed toward `b` by `t` (hex colors). */
function mix(a: string, b: string, t: number) {
  const p = (h: string, i: number) =>
    parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** `[x0, y0, x1, y1, …]` → points. */
const pts = (a: number[]): Pt[] =>
  Array.from({ length: a.length / 2 }, (_, i) => [a[2 * i], a[2 * i + 1]]);
const flat = (p: Pt[], s = 1) => at(p.flat(), s);

/** The right half of the head, top of the skull to the chin. */
const HEAD = pts([
  0, 38, 16, 39, 29, 44, 38, 52, 43, 62, 45, 74, 45, 88, 44, 100, 42, 110, 38,
  122, 33, 132, 26, 142, 18, 150, 9, 155, 0, 157,
]);
/** The right half of the neck and shoulder line, per build. */
const SHOULDERS = [
  pts([20, 140, 22, 184, 46, 195, 78, 203, 94, 216, 99, 250]),
  pts([17, 140, 19, 188, 38, 197, 64, 204, 80, 216, 86, 250]),
];
// Per variant: jaw width and chin drop; brow raise, weight and arch; nose
// length and width; mouth width and smile; ear size.
const JAW = [1, 0.9, 1.1, 0.84, 1.16, 0.96];
const CHIN = [0, 3, -2, 5, -1, 1];
const BROWS = [0, 2, 0, 2, 1.5, 1, -2, 2.6, 0, 1, 3, 2, 3, 1.2, -1, 0, 1.8, 3];
const NOSES = [118, 5, 116, 4, 121, 6, 119, 7, 115, 5, 122, 4];
const MOUTHS = [11, 0, 9, 1, 13, 0, 10, -1, 14, 1, 12, 2];
const EARS = [1, 0.75, 1.3, 1];

/** Mirror a right half into one closed outline (flat points). */
function mirror(half: Pt[]) {
  return [...flat(half), ...flat(half.slice(1, -1).reverse(), -1)];
}

/** The half-width of an outline (sorted by y) at `y`. */
function chord(half: Pt[], y: number) {
  for (let i = 1; i < half.length; i++) {
    const [x0, y0] = half[i - 1];
    const [x1, y1] = half[i];
    if (y <= y1)
      return y1 === y0 ? x1 : x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
  }
  return half[half.length - 1][0];
}

/** The hair cap: the skull above `hairline` pushed out by `thick`, closed
 *  by a hairline that dips toward the brow. */
function crown(head: Pt[], thick: number, hairline: number) {
  const out = head
    .filter(([, y]) => y <= hairline)
    .map(([x, y]) => {
      const dy = y - 96;
      const l = Math.hypot(x, dy) || 1;
      return [x + (x / l) * thick, y + (dy / l) * thick];
    });
  const edge = chord(head, hairline);
  const brow = Array.from({ length: 9 }, (_, i) => {
    const x = edge * (1 - i / 4);
    return [x, hairline - 7 * (1 - (x / edge) ** 2)];
  });
  return flat([
    ...out
      .slice(1)
      .reverse()
      .map(([x, y]) => [-x, y]),
    ...out,
    ...brow,
  ]);
}

const circle = (cx: number, cy: number, r: number) =>
  Array.from({ length: 20 }, (_, i) => [
    CX + cx + r * Math.cos((i / 20) * Math.PI * 2),
    cy + r * Math.sin((i / 20) * Math.PI * 2),
  ]).flat();
const both = (a: number[]) => [at(a), at(a, -1)];

/** Each hairstyle: shapes drawn behind the head, and over it. */
function hair(
  style: number,
  head: Pt[],
): { back: number[][]; front: number[][] } {
  switch (style) {
    case 0: // buzz
      return { back: [], front: [crown(head, 2, 66)] };
    case 1: // swept undercut
      return {
        back: [],
        front: [
          crown(head, 3, 60),
          at([
            -34, 54, -24, 32, 6, 24, 38, 32, 54, 52, 40, 48, 16, 40, -12, 44,
          ]),
        ],
      };
    case 2: // crest
      return {
        back: [],
        front: [
          crown(head, 1, 70),
          at([-7, 64, -10, 30, -4, 6, 0, 2, 4, 6, 10, 30, 7, 64]),
        ],
      };
    case 3: // long
      return {
        back: both([
          40, 60, 54, 100, 58, 150, 62, 206, 46, 210, 44, 150, 42, 104,
        ]),
        front: [crown(head, 6, 60)],
      };
    case 4: // bob
      return {
        back: [],
        front: [
          crown(head, 7, 58),
          ...both([42, 58, 52, 92, 53, 140, 38, 146, 41, 110, 43, 80]),
        ],
      };
    case 5: // bun
      return { back: [circle(0, 26, 15)], front: [crown(head, 4, 60)] };
    case 6: // spikes
      return {
        back: [],
        front: [
          at([
            ...Array.from({ length: 15 }, (_, i) => {
              const a = Math.PI * (1.08 + (0.84 * i) / 14);
              const r = i % 2 ? 66 : 50;
              return [r * Math.cos(a), 96 + r * Math.sin(a)];
            }).flat(),
            38,
            66,
            0,
            58,
            -38,
            66,
          ]),
        ],
      };
    case 7: // slicked back
      return {
        back: [at([30, 46, 56, 58, 60, 92, 50, 100, 46, 70])],
        front: [crown(head, 8, 56)],
      };
    case 8: // shaved
      return { back: [], front: [] };
    case 9: // braids
      return {
        back: both([42, 70, 50, 120, 52, 214, 44, 216, 42, 122, 38, 76]),
        front: [crown(head, 4, 58)],
      };
    case 10: // cloud
      return { back: [circle(0, 74, 64)], front: [crown(head, 10, 64)] };
    default: // fringe
      return {
        back: [],
        front: [
          crown(head, 6, 58),
          at([
            -46, 58, -30, 46, 0, 42, 30, 48, 46, 64, 30, 80, 8, 74, -20, 82,
            -40, 74,
          ]),
        ],
      };
  }
}

const GRID = (() => {
  let d = "";
  for (let x = 20; x < 200; x += 20) d += `M${x} 0V250`;
  for (let y = 25; y < 250; y += 25) d += `M0 ${y}H200`;
  return d;
})();

/** A scanned head and shoulders in line art (200 × 250 units): the skull
 *  and shoulders tinted by the skin tone and wrapped in contour lines, the
 *  hairstyle in its color, the face's features, and whatever cyberware,
 *  scars, ink and metal the look carries. */
export function Portrait({
  look,
  body,
  width,
}: {
  look: Record<string, number>;
  body: number;
  width: number;
}) {
  const v = (id: string) => look[id] ?? 0;
  const skin = SKIN_TONES[v("skinTone")];
  const hairColor = HAIR_COLORS[v("hairColor")];
  const hairLine = mix(hairColor, "#ffffff", 0.3);
  const line = mix(skin, "#ffffff", 0.35);
  const contour = mix(skin, "#000000", 0.45);
  const jaw = v("jaw");
  const head: Pt[] = HEAD.map(([x, y]) => {
    const k = Math.min(1, Math.max(0, (y - 104) / 36));
    return [
      x * (1 + (JAW[jaw] - 1) * k),
      y + (y > 140 ? (CHIN[jaw] * (y - 140)) / 17 : 0),
    ];
  });
  const shoulders = SHOULDERS[body];
  const { back, front } = hair(v("hairstyle"), head);
  const [raise, browW, arch] = BROWS.slice(v("eyebrows") * 3);
  const [noseY, noseW] = NOSES.slice(v("nose") * 2);
  const [mouthW, smile] = MOUTHS.slice(v("mouth") * 2);
  const ear = EARS[v("ears")];
  const freckles = rng(v("skinType") + 3);
  const stroke = (color: string, w = 1) =>
    ({ fill: "none", stroke: color, strokeWidth: w }) as const;

  return (
    <svg viewBox="0 0 200 250" style={{ width, height: width * 1.25 }}>
      <path d={GRID} {...stroke(C.cyan, 0.5)} opacity={0.12} />
      {back.map((p, i) => (
        <polygon
          key={i}
          points={p}
          fill={hairColor}
          stroke={hairLine}
          strokeWidth={0.8}
        />
      ))}
      <polygon points={mirror(shoulders)} fill={skin} opacity={0.55} />
      <polyline points={flat(shoulders)} {...stroke(line, 1.4)} />
      <polyline points={flat(shoulders, -1)} {...stroke(line, 1.4)} />
      {[214, 226, 238].map((y) => (
        <line
          key={y}
          x1={CX - chord(shoulders, y) + 6}
          y1={y}
          x2={CX + chord(shoulders, y) - 6}
          y2={y}
          stroke={contour}
          strokeWidth={0.7}
          opacity={0.6}
        />
      ))}
      {[1, -1].map((s) => (
        <polyline
          key={s}
          points={at(
            [
              45,
              86,
              45 + 6 * ear,
              v("ears") === 3 ? 72 : 82,
              45 + 8 * ear,
              94,
              45 + 6 * ear,
              106,
              44,
              110,
            ],
            s,
          )}
          fill={skin}
          stroke={line}
          strokeWidth={1}
        />
      ))}
      <polygon
        points={mirror(head)}
        fill={skin}
        opacity={0.8}
        stroke={line}
        strokeWidth={1.4}
      />
      {Array.from({ length: 17 }, (_, i) => 44 + i * 6.5).map((y) => (
        <line
          key={y}
          x1={CX - chord(head, y) + 1}
          y1={y}
          x2={CX + chord(head, y) - 1}
          y2={y}
          stroke={contour}
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}
      {[-0.62, -0.3, 0.3, 0.62].map((f) => (
        <polyline
          key={f}
          points={Array.from({ length: 19 }, (_, i) => 41 + i * 6.3).flatMap(
            (y) => [CX + f * chord(head, y), y],
          )}
          {...stroke(contour, 0.5)}
          opacity={0.45}
        />
      ))}
      {Array.from({ length: v("skinType") * 5 }, (_, i) => (
        <circle
          key={i}
          cx={CX + (freckles() > 0.5 ? 1 : -1) * (16 + freckles() * 18)}
          cy={102 + freckles() * 20}
          r={0.7}
          fill={contour}
        />
      ))}
      {[1, -1].map((s) => (
        <g key={s}>
          <polyline
            points={at(
              [8, 88 - arch * 0.3, 17, 85 - arch - raise * 0.3, 27, 88 - raise],
              s,
            )}
            {...stroke(mix(hairColor, "#000000", 0.3), browW)}
          />
          <polygon
            points={at([9, 96, 14, 93, 21, 93, 26, 96, 20, 98.5, 14, 98.5], s)}
            fill="#0c0c10"
            stroke={line}
            strokeWidth={0.8}
          />
          <circle
            cx={CX + s * 17.5}
            cy={95.8}
            r={2.4}
            fill={EYE_COLORS[v("eyes")]}
          />
        </g>
      ))}
      <polyline
        points={[CX + 2, 98, CX + 4, noseY - 2, CX + noseW, noseY]}
        {...stroke(line)}
      />
      <polyline
        points={[CX - noseW, noseY + 1, CX, noseY + 2.5, CX + noseW, noseY + 1]}
        {...stroke(contour)}
      />
      <Marks
        v={v}
        head={head}
        ink={mix(skin, "#000000", 0.75)}
        noseY={noseY}
        ear={ear}
        mouth={[mouthW, smile]}
      />
      <polyline
        points={at([
          -mouthW,
          134 - smile,
          -mouthW / 3,
          132.5,
          0,
          133.5,
          mouthW / 3,
          132.5,
          mouthW,
          134 - smile,
        ])}
        {...stroke(contour, 1.2)}
      />
      <polyline
        points={at([-mouthW * 0.6, 137.5, 0, 139.5, mouthW * 0.6, 137.5])}
        {...stroke(line, 0.8)}
      />
      {front.map((p, i) => (
        <polygon
          key={i}
          points={p}
          fill={hairColor}
          stroke={hairLine}
          strokeWidth={0.8}
        />
      ))}
      <rect x={0} y={62} width={200} height={10} fill={C.cyan} opacity={0.07} />
      <rect x={0} y={168} width={200} height={4} fill={C.cyan} opacity={0.08} />
    </svg>
  );
}
