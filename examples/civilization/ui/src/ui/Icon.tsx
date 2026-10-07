import type { ReactNode } from "react";

/** Line-and-fill pictograms on a 24-unit grid, drawn with `<svg>` (each
 *  one rasterized at its laid-out size, so crisp at any size). */
const ICONS = {
  science: (c: string) => (
    <>
      <path
        d="M8.5 3h7"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M10 3.5v6L5 18.2A2 2 0 0 0 6.8 21h10.4a2 2 0 0 0 1.8-2.8L14 9.5v-6"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M7.4 15h9.2l1.5 3.1c.3.6-.1.9-.7.9H6.6c-.6 0-1-.3-.7-.9z"
        fill={c}
      />
    </>
  ),
  culture: (c: string) => (
    <>
      <path
        d="M9.2 17.5V5.2l10.5-2.2v12.4"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={6.4} cy={17.6} r={3} fill={c} />
      <circle cx={16.9} cy={15.5} r={3} fill={c} />
    </>
  ),
  gold: (c: string) => (
    <>
      <circle cx={12} cy={12} r={9} fill={c} />
      <circle
        cx={12}
        cy={12}
        r={5.6}
        fill="none"
        stroke="#7a5b16"
        strokeWidth={1.5}
      />
      <rect x={10.5} y={10.5} width={3} height={3} fill="#7a5b16" />
    </>
  ),
  faith: (c: string) => <polygon points={star(12, 12, 10, 4.2, 8)} fill={c} />,
  food: (c: string) => (
    <>
      <path
        d="M12 22V7"
        fill="none"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <ellipse cx={12} cy={4.6} rx={1.8} ry={2.8} fill={c} />
      {[8, 12.5, 17].map((y) => (
        <g key={y}>
          <ellipse
            cx={9}
            cy={y}
            rx={1.9}
            ry={3.1}
            fill={c}
            transform={`rotate(-38 9 ${y})`}
          />
          <ellipse
            cx={15}
            cy={y}
            rx={1.9}
            ry={3.1}
            fill={c}
            transform={`rotate(38 15 ${y})`}
          />
        </g>
      ))}
    </>
  ),
  production: (c: string) => (
    <>
      <path
        d="M4.5 19.5l8.5-8.5"
        fill="none"
        stroke={c}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
      <path d="M10.6 6.2l3.6-3.6 7.2 7.2-3.6 3.6z" fill={c} />
    </>
  ),
  housing: (c: string) => (
    <>
      <path
        d="M3 11.5L12 4l9 7.5"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 10.5V20h5v-5h3v5h5v-9.5L12 5z" fill={c} />
    </>
  ),
  amenities: (c: string) => (
    <>
      <circle cx={12} cy={12} r={9} fill="none" stroke={c} strokeWidth={2} />
      <path
        d="M8 13.8c1.4 2.4 6.6 2.4 8 0"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={9} cy={9.5} r={1.3} fill={c} />
      <circle cx={15} cy={9.5} r={1.3} fill={c} />
    </>
  ),
  strength: (c: string) => (
    <>
      <path
        d="M5 3.5l13 13M19 3.5L6 16.5"
        fill="none"
        stroke={c}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <path
        d="M3.5 15.5l5 5M20.5 15.5l-5 5"
        fill="none"
        stroke={c}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </>
  ),
  movement: (c: string) => (
    <path
      d="M5 5l7 7-7 7M12 5l7 7-7 7"
      fill="none"
      stroke={c}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  bow: (c: string) => (
    <>
      <path
        d="M7 3c8 2.5 8 15.5 0 18"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M7 3v18" fill="none" stroke={c} strokeWidth={1} />
      <path
        d="M3 12h17M17 9l3 3-3 3"
        fill="none"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  eye: (c: string) => (
    <>
      <path
        d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={12} cy={12} r={3.2} fill={c} />
    </>
  ),
  flag: (c: string) => (
    <>
      <path
        d="M6 21V3.5"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M6 4h12l-3 4.5 3 4.5H6z" fill={c} />
    </>
  ),
  city: (c: string) => (
    <>
      <path
        d="M3 21h18"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M5 21V11l4-3 4 3v10zM14 21V5h5v16z" fill={c} />
    </>
  ),
  book: (c: string) => (
    <path
      d="M12 6.5C10 4.8 6.5 4.5 4 5.2v13.6c2.5-.7 6-.4 8 1.3 2-1.7 5.5-2 8-1.3V5.2c-2.5-.7-6-.4-8 1.3zM12 6.5v13.6"
      fill="none"
      stroke={c}
      strokeWidth={1.9}
      strokeLinejoin="round"
    />
  ),
  castle: (c: string) => (
    <path
      d="M4 21V8h3v3h2.5V8h5v3H17V8h3v13h-6v-4.5a2 2 0 0 0-4 0V21z"
      fill={c}
    />
  ),
  obelisk: (c: string) => (
    <>
      <path d="M10 20l1-14 1-3 1 3 1 14z" fill={c} />
      <path
        d="M6 20.5h12"
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  ),
  anchor: (c: string) => (
    <>
      <circle cx={12} cy={5} r={2.2} fill="none" stroke={c} strokeWidth={1.9} />
      <path
        d="M12 7.2V21M5 13c0 4.5 3.2 8 7 8s7-3.5 7-8M8.5 10.5h7"
        fill="none"
        stroke={c}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </>
  ),
  trophy: (c: string) => (
    <>
      <path d="M7 3.5h10V9a5 5 0 0 1-10 0z" fill={c} />
      <path
        d="M7 5.5H4v1.2A3.3 3.3 0 0 0 7.3 10M17 5.5h3v1.2a3.3 3.3 0 0 1-3.3 3.3M12 14v4M8 20.5h8"
        fill="none"
        stroke={c}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </>
  ),
  chart: (c: string) => (
    <>
      <path
        d="M3.5 20.5h17"
        fill="none"
        stroke={c}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <rect x={5} y={12} width={3.4} height={6.5} rx={0.8} fill={c} />
      <rect x={10.3} y={7} width={3.4} height={11.5} rx={0.8} fill={c} />
      <rect x={15.6} y={3.5} width={3.4} height={15} rx={0.8} fill={c} />
    </>
  ),
  map: (c: string) => (
    <path
      d="M3 6.5l6-3 6 3 6-3v14l-6 3-6-3-6 3zM9 3.5v14M15 6.5v14"
      fill="none"
      stroke={c}
      strokeWidth={1.9}
      strokeLinejoin="round"
    />
  ),
  person: (c: string) => (
    <>
      <circle cx={12} cy={7.5} r={4} fill={c} />
      <path d="M4 21c0-4.6 3.6-7.5 8-7.5s8 2.9 8 7.5z" fill={c} />
    </>
  ),
  shield: (c: string) => (
    <path
      d="M12 2.5l8.5 3.2v6.1c0 5.1-3.6 8.5-8.5 9.7-4.9-1.2-8.5-4.6-8.5-9.7V5.7z"
      fill={c}
    />
  ),
  moon: (c: string) => (
    <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z" fill={c} />
  ),
  skip: (c: string) => (
    <>
      <path d="M5 5l9 7-9 7z" fill={c} />
      <path
        d="M17.5 5v14"
        fill="none"
        stroke={c}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </>
  ),
  arrow: (c: string) => (
    <path
      d="M4 12h14M13 6l6 6-6 6"
      fill="none"
      stroke={c}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  trash: (c: string) => (
    <path
      d="M4 7h16M10 3.5h4M6.5 7l1 13.5h9l1-13.5"
      fill="none"
      stroke={c}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  check: (c: string) => (
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke={c}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  close: (c: string) => (
    <path
      d="M6 6l12 12M18 6L6 18"
      fill="none"
      stroke={c}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  ),
  menu: (c: string) => (
    <path
      d="M4 7h16M4 12h16M4 17h16"
      fill="none"
      stroke={c}
      strokeWidth={2}
      strokeLinecap="round"
    />
  ),
  star: (c: string) => <polygon points={star(12, 12.6, 10, 4.2, 5)} fill={c} />,
  lock: (c: string) => (
    <>
      <rect x={5} y={10.5} width={14} height={10} rx={2} fill={c} />
      <path
        d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
        fill="none"
        stroke={c}
        strokeWidth={2}
      />
    </>
  ),
} satisfies Record<string, (color: string) => ReactNode>;

export type IconName = keyof typeof ICONS;

/** The points of an `n`-pointed star, the first point straight up. */
function star(cx: number, cy: number, outer: number, inner: number, n: number) {
  const pts: number[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}

export function Icon({
  name,
  size = 16,
  color = "#f0e8d6",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {ICONS[name](color)}
    </svg>
  );
}
