/** Half outlines (right side, flat `[x, y, …]`, x from the center line, y
 *  down) of the two builds in a 300 × 780 box: head, shoulder, round the
 *  hanging arm and back up into the armpit, down the flank and the outer
 *  leg, the foot, up the inner leg. Mirrored into one polygon. */
const BUILDS = [
  [
    0, 28, 13, 30, 22, 37, 27, 50, 28, 66, 26, 82, 21, 96, 14, 106, 12, 114, 13,
    126, 30, 134, 52, 141, 66, 150, 74, 166, 78, 196, 80, 236, 79, 262, 77, 300,
    73, 340, 70, 372, 73, 392, 72, 414, 66, 428, 59, 424, 57, 404, 56, 376, 55,
    344, 54, 304, 53, 270, 51, 232, 48, 200, 46, 212, 44, 250, 40, 296, 40, 320,
    45, 352, 48, 384, 47, 440, 44, 500, 40, 530, 39, 560, 40, 600, 36, 660, 31,
    712, 36, 730, 40, 748, 30, 754, 14, 754, 12, 736, 13, 712, 12, 660, 13, 600,
    11, 560, 12, 530, 10, 470, 6, 420, 0, 404,
  ],
  [
    0, 30, 12, 32, 20, 38, 25, 50, 26, 65, 24, 80, 19, 93, 12, 103, 10, 112, 11,
    124, 24, 132, 42, 139, 53, 147, 59, 162, 61, 192, 62, 230, 61, 258, 59, 296,
    56, 334, 53, 364, 56, 384, 55, 404, 50, 418, 44, 414, 42, 396, 42, 368, 42,
    336, 42, 300, 42, 268, 41, 234, 40, 200, 38, 214, 37, 244, 31, 288, 31, 304,
    40, 346, 50, 388, 49, 440, 44, 500, 38, 532, 37, 562, 38, 600, 33, 660, 28,
    712, 32, 730, 35, 748, 26, 754, 13, 754, 11, 736, 12, 712, 11, 660, 12, 600,
    10, 562, 11, 532, 9, 470, 5, 424, 0, 408,
  ],
];

/** Lines inside each build (collarbones, sternum, chest, abs, hips,
 *  knees), as half polylines, mirrored too. */
const DETAILS = [
  [
    [8, 142, 40, 136],
    [0, 150, 0, 250],
    [0, 198, 18, 202, 36, 192],
    [4, 236, 16, 234],
    [4, 262, 17, 261],
    [4, 288, 17, 288],
    [30, 330, 12, 380],
    [18, 526, 26, 534, 34, 526],
  ],
  [
    [7, 136, 32, 132],
    [0, 144, 0, 214],
    [4, 214, 16, 222, 30, 214, 34, 196],
    [22, 286, 31, 296],
    [28, 330, 10, 384],
    [16, 528, 24, 536, 32, 528],
  ],
];

/** The joints, marked with rings: shoulder, elbow, wrist, hip, knee,
 *  ankle. */
const JOINTS = [
  [66, 152, 67, 262, 63, 372, 32, 384, 26, 532, 22, 712],
  [50, 148, 52, 258, 48, 366, 30, 388, 24, 534, 20, 712],
];

const CX = 150;
/** Flat half points → flat points, mirrored when `s = -1`. */
const side = (a: number[], s: number) =>
  a.map((v, i) => (i % 2 ? v : CX + s * v));
/** A half outline and its mirror image, as one closed outline. */
function mirror(half: number[]) {
  const back: number[] = [];
  for (let i = half.length - 4; i >= 2; i -= 2) back.push(half[i], half[i + 1]);
  return [...side(half, 1), ...side(back, -1)];
}

/** A standing figure in line art (`build` 0 or 1) — what the body-type
 *  cards show in place of a 3D model. */
export function Figure({
  build,
  color,
  accent,
  height,
}: {
  build: number;
  color: string;
  accent: string;
  height: number;
}) {
  const outline = mirror(BUILDS[build]);
  const joints = JOINTS[build];
  return (
    <svg viewBox="0 0 300 780" style={{ width: (height * 300) / 780, height }}>
      <polygon points={outline} fill={color} opacity={0.12} />
      <polygon
        points={outline}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {DETAILS[build].flatMap((line, i) =>
        [1, -1].map((s) => (
          <polyline
            key={`${i}${s}`}
            points={side(line, s)}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.55}
          />
        )),
      )}
      {[1, -1].flatMap((s) =>
        Array.from({ length: joints.length / 2 }, (_, i) => (
          <circle
            key={`${i}${s}`}
            cx={CX + s * joints[2 * i]}
            cy={joints[2 * i + 1]}
            r={3.2}
            fill="none"
            stroke={accent}
            strokeWidth={1.2}
          />
        )),
      )}
      {[120, 330, 560].map((y) => (
        <line
          key={y}
          x1={20}
          y1={y}
          x2={280}
          y2={y}
          stroke={accent}
          strokeWidth={0.6}
          opacity={0.4}
        />
      ))}
    </svg>
  );
}
