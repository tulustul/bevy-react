import { useEffect, useState } from "react";
import { useSharedValue, withRepeat, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example } from "@/components";
import { playButton, playLabel } from "../animations/shared";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// Demos of SVG rendering through the `<image>` host element: an `.svg` src
// parses once into an SvgDocument asset and re-rasterizes at the laid-out
// size (times DPI) into an element-owned texture, so one file stays crisp at
// every size. Without an explicit width/height, the file's viewBox feeds
// layout as the intrinsic size. No 3D scene: the viewport stays empty.

const PAGE: ExplanationData = {
  title: "<svg>",
  description:
    "An <image> whose src names an .svg file renders it as a vector: the document parses once into an SvgDocument asset and re-rasterizes at the laid-out size (times DPI) into an element-owned texture, so the same file is pixel-crisp at every size — no fixed-resolution bitmap to blur. Without an explicit width/height, the file's viewBox provides the intrinsic size for layout, exactly like a bitmap image's pixel dimensions.",
};

const SIZES = [24, 64, 160];

const SIZES_TSX = `{[24, 64, 160].map((size) => (
  <image
    key={size}
    src="gear.svg"
    style={{
      width: size,
      height: size,
    }}
  />
))}`;

const INTRINSIC_TSX = `// No width/height: layout uses
// the file's viewBox size
// (here 24 by 24).
<image src="gear.svg" />`;

export function SvgDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <ScalableIconsDemo />
      <IntrinsicSizeDemo />
      <ShapesChartDemo />
      <InteractiveShapesDemo />
      <AnimatedShapesDemo />
    </DemoRow>
  );
}

function ScalableIconsDemo() {
  return (
    <Example
      title="Scalable icons"
      description="The same gear.svg laid out at three sizes. Each re-rasterizes at its own laid-out size, so all three are equally crisp — the large one is not a scaled-up small one."
      tsx={SIZES_TSX}
    >
      <node style={rowStyle}>
        {SIZES.map((size) => (
          <node key={size} style={itemStyle}>
            <image src="gear.svg" style={{ width: size, height: size }} />
            <text style={captionStyle}>{size}px</text>
          </node>
        ))}
      </node>
    </Example>
  );
}

function IntrinsicSizeDemo() {
  return (
    <Example
      title="Intrinsic size"
      description="No width/height style: the file's viewBox (24 by 24) becomes the intrinsic size, and layout measures the node from it — just like a bitmap's pixel dimensions."
      tsx={INTRINSIC_TSX}
    >
      <node style={rowStyle}>
        <image src="gear.svg" />
      </node>
    </Example>
  );
}

// --- JSX shapes card: a static bar chart drawn from shape children ---------

const BARS = [
  { v: 34, fill: Colors.primary100 },
  { v: 58, fill: Colors.sky100 },
  { v: 42, fill: Colors.teal100 },
  { v: 76, fill: Colors.purple100 },
  { v: 62, fill: Colors.green100 },
];

// Trend markers ride 8 user units above each bar top, at the bar's center.
const TREND = BARS.flatMap(({ v }, i) => [i * 36 + 12, 100 - v - 8]);

// Area fill under the trend line, closed down to the baseline (y = 100).
const AREA_D =
  TREND.reduce(
    (d, n, i) =>
      i % 2 === 0 ? `${d} ${i === 0 ? "M" : "L"} ${n}` : `${d} ${n}`,
    "",
  ).trim() + ` L ${TREND[TREND.length - 2]} 100 L ${TREND[0]} 100 Z`;

const CHART_TSX = `<svg
  viewBox="0 0 220 130"
  style={{
    width: 264,
    height: 156,
  }}
>
  <g transform="translate(28 14)">
    <path
      d="M 12 58 L 48 34 (etc.) Z"
      fill="#7aa2f71a"
    />
    {bars.map(({ v, fill }, i) => (
      <rect
        key={i}
        x={i * 36}
        y={100 - v}
        width={24}
        height={v}
        rx={4}
        fill={fill}
      />
    ))}
    <polyline
      points={trend}
      fill="none"
      stroke="#f9e2af"
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {bars.map(({ v }, i) => (
      <circle
        key={i}
        cx={i * 36 + 12}
        cy={100 - v - 8}
        r={3.5}
        fill="#f9e2af"
      />
    ))}
  </g>
</svg>`;

function ShapesChartDemo() {
  return (
    <Example
      title="JSX shapes"
      description="A bar chart drawn with SVG shape children: rounded <rect> bars inside a translated <g>, a <path> area fill, and a <polyline> trend with <circle> markers. Geometry is in viewBox user units, so the whole drawing scales with the element."
      tsx={CHART_TSX}
    >
      <node style={rowStyle}>
        <svg viewBox="0 0 220 130" style={{ width: 264, height: 156 }}>
          <g transform="translate(28 14)">
            {[0, 33, 66].map((y) => (
              <line
                key={y}
                x1={0}
                y1={y}
                x2={180}
                y2={y}
                stroke={Colors.surface400}
                strokeWidth={1}
              />
            ))}
            <line
              x1={0}
              y1={100}
              x2={180}
              y2={100}
              stroke={Colors.surface500}
              strokeWidth={1.5}
            />
            <path d={AREA_D} fill={Colors.primary100 + "1a"} />
            {BARS.map(({ v, fill }, i) => (
              <rect
                key={i}
                x={i * 36}
                y={100 - v}
                width={24}
                height={v}
                rx={4}
                fill={fill}
              />
            ))}
            <polyline
              points={TREND}
              fill="none"
              stroke={Colors.amber100}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {BARS.map(({ v }, i) => (
              <circle
                key={i}
                cx={i * 36 + 12}
                cy={100 - v - 8}
                r={3.5}
                fill={Colors.amber100}
                stroke={Colors.surface200}
                strokeWidth={1.5}
              />
            ))}
          </g>
        </svg>
      </node>
    </Example>
  );
}

// --- Interactive shapes card: per-shape pointer handlers -------------------

const INTERACTIVE_TSX = `const [n, setN] = useState(0);
const [hot, setHot] = useState(false);
const [at, setAt] = useState("");

<svg viewBox="0 0 200 120">
  <rect
    x={2}
    y={2}
    width={196}
    height={116}
    rx={10}
    fill="#2a2a3c"
    onPointerDown={(e) =>
      // e.x / e.y are user-space
      // (viewBox) coordinates
      setAt(\`\${e.x}, \${e.y}\`)
    }
  />
  <circle
    cx={100}
    cy={60}
    r={34}
    fill={hot ? amber : blue}
    onClick={() =>
      setN((n) => n + 1)
    }
    onPointerEnter={() =>
      setHot(true)
    }
    onPointerLeave={() =>
      setHot(false)
    }
  />
</svg>
<text>{\`clicks: \${n}\`}</text>`;

function InteractiveShapesDemo() {
  const [clicks, setClicks] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [downAt, setDownAt] = useState<string | null>(null);
  return (
    <Example
      title="Interactive shapes"
      description="Shape children take the same pointer handlers as nodes: onClick, onPointerEnter/Leave, onPointerDown. Hit-testing follows the painted geometry (the circle claims only its disc, not its bounding box), and pointer events report x/y in the drawing's user-space units — press the pad to read the viewBox coordinates under the cursor."
      tsx={INTERACTIVE_TSX}
    >
      <node style={interactiveStyle}>
        <svg viewBox="0 0 200 120" style={{ width: 240, height: 144 }}>
          <rect
            x={2}
            y={2}
            width={196}
            height={116}
            rx={10}
            fill={Colors.surface300}
            stroke={Colors.surface500}
            strokeWidth={1.5}
            onPointerDown={(e) =>
              setDownAt(`${Math.round(e.x)}, ${Math.round(e.y)}`)
            }
          />
          <circle
            cx={100}
            cy={60}
            r={34}
            fill={hovered ? Colors.amber100 : Colors.primary100}
            stroke={Colors.surface200}
            strokeWidth={2}
            onClick={() => setClicks((c) => c + 1)}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          />
        </svg>
        <text style={captionStyle}>{`clicks: ${clicks}`}</text>
        <text style={captionStyle}>
          {downAt === null
            ? "press the pad to read coords"
            : `pad pressed at ${downAt}`}
        </text>
      </node>
    </Example>
  );
}

// --- Animated shapes card: { animated } bindings + attr transitions -------

// Two datasets the spring bars retarget between on click.
const BARS_A = [34, 66, 46];
const BARS_B = [72, 38, 58];
const BAR_FILLS = [Colors.primary100, Colors.teal100, Colors.purple100];

// Pulse range for the circle's radius binding; the seed renders until the
// driver's first write reaches Bevy.
const PULSE_MIN = 12;
const PULSE_MAX = 26;

const ANIMATED_TSX = `// A binding drives r per frame
const pulse = useSharedValue(12);
useEffect(() => {
  pulse.value = withRepeat(
    withTiming(26, {
      duration: 700,
      easing: "easeInOut",
    }),
    { reverse: true },
  );
}, [pulse]);

<circle
  cx={172}
  cy={52}
  r={{
    animated: pulse,
    seed: 12,
  }}
/>

// Clicks retarget; springs ease.
// (Kept on separate shapes: a
// binding on a shape parks that
// shape's attr transitions.)
<rect
  y={100 - v}
  height={v}
  transition={{
    y: {
      stiffness: 160,
      damping: 13,
    },
    height: {
      stiffness: 160,
      damping: 13,
    },
  }}
/>`;

function AnimatedShapesDemo() {
  const [alt, setAlt] = useState(false);
  const pulse = useSharedValue(PULSE_MIN);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(PULSE_MAX, { duration: 700, easing: "easeInOut" }),
      { reverse: true }, // ping-pong back down
    );
  }, [pulse]);

  const values = alt ? BARS_B : BARS_A;

  return (
    <Example
      title="Animated shapes"
      description="Shape attributes animate like style fields. The circle's r carries an { animated } binding: a shared value (withRepeat + withTiming, ping-pong) drives the radius per frame in user-space units, with seed as the static value until the driver writes. The bars ease through transition: clicking retargets y/height and a spring carries each bar to its new geometry. Bindings and transitions live on separate shapes — any binding on a shape parks that shape's attr transitions."
      tsx={ANIMATED_TSX}
    >
      <node style={interactiveStyle}>
        <svg viewBox="0 0 210 120" style={{ width: 252, height: 144 }}>
          <line
            x1={8}
            y1={100}
            x2={202}
            y2={100}
            stroke={Colors.surface500}
            strokeWidth={1.5}
          />
          {values.map((v, i) => (
            <rect
              key={i}
              x={8 + i * 36}
              y={100 - v}
              width={24}
              height={v}
              rx={4}
              fill={BAR_FILLS[i]}
              transition={{
                y: { stiffness: 160, damping: 13 },
                height: { stiffness: 160, damping: 13 },
              }}
            />
          ))}
          <circle
            cx={172}
            cy={52}
            r={{ animated: pulse, seed: PULSE_MIN }}
            fill={Colors.amber100 + "cc"}
            stroke={Colors.amber100}
            strokeWidth={2}
          />
        </svg>
        <button
          style={playButton}
          pressStyle={{ transform: { scale: 0.92 } }}
          onClick={() => setAlt((v) => !v)}
        >
          <text style={playLabel}>Retarget bars</text>
        </button>
      </node>
    </Example>
  );
}

const interactiveStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 12,
};

const rowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexEnd",
  justifyContent: "center",
  gap: 24,
  padding: 12,
};

const itemStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const captionStyle: BevyStyle = {
  fontSize: 12,
  color: Colors.textColor200,
};
