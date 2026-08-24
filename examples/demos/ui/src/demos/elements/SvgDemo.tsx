import { useEffect, useState, type ReactNode } from "react";
import { useSharedValue, withRepeat, withTiming } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example } from "@/components";
import { Code, InlineCode, Li, P, Ul } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// Demos of the `<svg>` host element: JSX shape children (the 8 intrinsics)
// painted in viewBox user units, with per-shape pointer events reported in
// user-space coordinates and shape attributes that animate like style fields
// ({ animated } bindings and attr transitions). Rendering an `.svg` *file*
// is the `<image>` element's job — see the <image> demo. No 3D scene: the
// viewport stays empty.

const PAGE: ExplanationData = {
  title: "<svg>",
  info: (
    <>
      <P>
        <InlineCode>{"<svg>"}</InlineCode> draws vector graphics from JSX shape
        children — the 8 intrinsics: <InlineCode>path</InlineCode>,{" "}
        <InlineCode>rect</InlineCode>, <InlineCode>circle</InlineCode>,{" "}
        <InlineCode>ellipse</InlineCode>, <InlineCode>line</InlineCode>,{" "}
        <InlineCode>polyline</InlineCode>, <InlineCode>polygon</InlineCode>, and{" "}
        <InlineCode>g</InlineCode>. Geometry lives in{" "}
        <InlineCode>viewBox</InlineCode> user units, so a whole drawing scales
        with the element's laid-out size while staying pixel-crisp.
      </P>
      <Code lang="tsx">{`<svg viewBox="0 0 40 40" style={{ width: 56 }}>
  <circle cx={20} cy={20} r={13} fill="#7dcfff" />
</svg>`}</Code>
      <Ul>
        <Li>
          Shapes take the same pointer handlers as nodes; hit-testing follows
          the painted geometry, and events report user-space coordinates.
        </Li>
        <Li>
          Numeric attributes animate like style fields — {"{ animated }"}{" "}
          bindings or a transition prop on the shape.
        </Li>
        <Li>
          Rendering an .svg FILE is the {"<image>"} element's job; this element
          is for building drawings in JSX.
        </Li>
      </Ul>
    </>
  ),
};

export function SvgDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <PrimitivesDemo />
        <ShapesChartDemo />
        <InteractiveShapesDemo />
      </DemoRow>

      <DemoRow>
        <SharedValueShapesDemo />
        <TransitionShapesDemo />
      </DemoRow>
    </>
  );
}

// --- Primitives card: a labeled grid of all 8 shape intrinsics -------------

// A 5-point star centered at (20, 21), outer radius 14, inner radius 6.
const STAR_POINTS = [
  20, 7, 23.5, 16.1, 33.3, 16.7, 25.7, 22.9, 28.2, 32.3, 20, 27, 11.8, 32.3,
  14.3, 22.9, 6.7, 16.7, 16.5, 16.1,
];

const HEART_D = "M 20 33 C 7 23 6 9 20 15 C 34 9 33 23 20 33 Z";

const PRIMS_TSX = `// One cell per intrinsic, each
// its own 40-by-40 viewBox.
<rect
  x={6} y={10}
  width={28} height={20}
  rx={4} fill={blue}
/>
<circle cx={20} cy={20} r={13} />
<ellipse
  cx={20} cy={20}
  rx={15} ry={9}
/>
<line
  x1={6} y1={30}
  x2={34} y2={10}
  stroke={amber} strokeWidth={3}
  strokeLinecap="round"
/>
<polyline
  points={[6,28, 16,12,
           24,22, 34,8]}
  fill="none" stroke={green}
  strokeWidth={3}
/>
<polygon points={star} />
<path
  d="M 20 33 C 7 23 6 9 20 15
     C 34 9 33 23 20 33 Z"
/>
<g
  transform="translate(20 22)
             rotate(-14)"
>
  <rect x={-13} y={-9} (etc.) />
  <rect x={1} y={-9} (etc.) />
</g>`;

function Prim({ label, children }: { label: string; children: ReactNode }) {
  return (
    <node style={itemStyle}>
      <svg viewBox="0 0 40 40" style={{ width: 56, height: 56 }}>
        {children}
      </svg>
      <text style={captionStyle}>{label}</text>
    </node>
  );
}

function PrimitivesDemo() {
  return (
    <Example
      title="Shape primitives"
      info={
        <>
          <P>
            All eight shape intrinsics, one per cell: filled{" "}
            <InlineCode>rect</InlineCode>, <InlineCode>circle</InlineCode>,{" "}
            <InlineCode>ellipse</InlineCode> and{" "}
            <InlineCode>polygon</InlineCode> (a star from a flat points list),
            stroked <InlineCode>line</InlineCode> and{" "}
            <InlineCode>polyline</InlineCode>, a <InlineCode>path</InlineCode>{" "}
            from an SVG d string (the heart), and <InlineCode>g</InlineCode> — a
            group whose translate/rotate transform moves its two rects together.
            Each cell is its own {"<svg>"} with a 40×40 viewBox.
          </P>
          <Code lang="tsx">{PRIMS_TSX}</Code>
        </>
      }
      demo={PrimitivesCard}
    />
  );
}

function PrimitivesCard() {
  return (
    <node style={gridStyle}>
      <node style={gridRowStyle}>
        <Prim label="rect">
          <rect
            x={6}
            y={10}
            width={28}
            height={20}
            rx={4}
            fill={Colors.primary100}
          />
        </Prim>
        <Prim label="circle">
          <circle cx={20} cy={20} r={13} fill={Colors.sky100} />
        </Prim>
        <Prim label="ellipse">
          <ellipse cx={20} cy={20} rx={15} ry={9} fill={Colors.teal100} />
        </Prim>
        <Prim label="line">
          <line
            x1={6}
            y1={30}
            x2={34}
            y2={10}
            stroke={Colors.amber100}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </Prim>
      </node>
      <node style={gridRowStyle}>
        <Prim label="polyline">
          <polyline
            points={[6, 28, 16, 12, 24, 22, 34, 8]}
            fill="none"
            stroke={Colors.green100}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Prim>
        <Prim label="polygon">
          <polygon points={STAR_POINTS} fill={Colors.purple100} />
        </Prim>
        <Prim label="path">
          <path d={HEART_D} fill={Colors.red100} />
        </Prim>
        <Prim label="g">
          <g transform="translate(20 22) rotate(-14)">
            <rect
              x={-13}
              y={-9}
              width={12}
              height={18}
              rx={3}
              fill={Colors.orange100}
            />
            <rect
              x={1}
              y={-9}
              width={12}
              height={18}
              rx={3}
              fill={Colors.primary100}
            />
          </g>
        </Prim>
      </node>
    </node>
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
      info={
        <>
          <P>
            A bar chart drawn with SVG shape children: rounded{" "}
            <InlineCode>{"<rect>"}</InlineCode> bars inside a translated{" "}
            <InlineCode>{"<g>"}</InlineCode>, a{" "}
            <InlineCode>{"<path>"}</InlineCode> area fill, and a{" "}
            <InlineCode>{"<polyline>"}</InlineCode> trend with{" "}
            <InlineCode>{"<circle>"}</InlineCode> markers — plain React
            <InlineCode>.map</InlineCode> over the data. Geometry is in viewBox
            user units, so the whole drawing scales with the element.
          </P>
          <Code lang="tsx">{CHART_TSX}</Code>
        </>
      }
      demo={ShapesChartCard}
    />
  );
}

function ShapesChartCard() {
  return (
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
  return (
    <Example
      title="Interactive shapes"
      info={
        <>
          <P>
            Shape children take the same pointer handlers as nodes:{" "}
            <InlineCode>onClick</InlineCode>,{" "}
            <InlineCode>onPointerEnter/Leave</InlineCode>,{" "}
            <InlineCode>onPointerDown</InlineCode>. Hit-testing follows the
            painted geometry — the circle claims only its disc, not its bounding
            box — and pointer events report x/y in the drawing's user-space
            units. Press the pad to read the viewBox coordinates under the
            cursor.
          </P>
          <Code lang="tsx">{INTERACTIVE_TSX}</Code>
        </>
      }
      demo={InteractiveShapesCard}
    />
  );
}

function InteractiveShapesCard() {
  const [clicks, setClicks] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [downAt, setDownAt] = useState<string | null>(null);
  return (
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
  );
}

// --- Shared-value shapes card: { animated } bindings -----------------------

// Pulse range for the circle's radius binding; the seed renders until the
// driver's first write reaches Bevy.
const PULSE_MIN = 12;
const PULSE_MAX = 26;

const SHARED_VALUE_TSX = `// A binding drives r per frame,
// in user-space units — React
// never re-renders.
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
  cx={60}
  cy={60}
  r={{
    animated: pulse,
    seed: 12,
  }}
/>`;

function SharedValueShapesDemo() {
  return (
    <Example
      title="Shared value animations"
      info={
        <>
          <P>
            A numeric shape attribute takes an {"{ animated }"} binding, exactly
            like a style field. A shared value (
            <InlineCode>withRepeat</InlineCode> +{" "}
            <InlineCode>withTiming</InlineCode>, ping-pong) drives the circle's{" "}
            <InlineCode>r</InlineCode> per frame in user-space units, with{" "}
            <InlineCode>seed</InlineCode> as the static value until the driver's
            first write reaches Bevy — the React tree never re-renders while the
            animation runs.
          </P>
          <Code lang="tsx">{SHARED_VALUE_TSX}</Code>
        </>
      }
      demo={SharedValueShapesCard}
    />
  );
}

function SharedValueShapesCard() {
  const pulse = useSharedValue(PULSE_MIN);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(PULSE_MAX, { duration: 700, easing: "easeInOut" }),
      { reverse: true }, // ping-pong back down
    );
  }, [pulse]);

  return (
    <node style={interactiveStyle}>
      <svg viewBox="0 0 120 120" style={{ width: 144, height: 144 }}>
        <circle
          cx={60}
          cy={60}
          r={{ animated: pulse, seed: PULSE_MIN }}
          fill={Colors.amber100 + "cc"}
          stroke={Colors.amber100}
          strokeWidth={2}
        />
      </svg>
    </node>
  );
}

// --- Transition shapes card: attr transitions on static changes ------------

// Two datasets the spring bars retarget between every second.
const BARS_A = [34, 66, 46];
const BARS_B = [72, 38, 58];
const BAR_FILLS = [Colors.primary100, Colors.teal100, Colors.purple100];

const TRANSITION_TSX = `// Every second the data
// retargets; springs ease the
// bars to the new geometry.
const [alt, setAlt] = useState(false);
useEffect(() => {
  const id = setInterval(
    () => setAlt((v) => !v),
    1000,
  );
  return () => clearInterval(id);
}, []);

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

function TransitionShapesDemo() {
  return (
    <Example
      title="Shape transitions"
      info={
        <>
          <P>
            A <InlineCode>transition</InlineCode> prop on a shape eases static
            attr changes: every second the dataset retargets{" "}
            <InlineCode>y</InlineCode>/<InlineCode>height</InlineCode> and a
            spring carries each bar to its new geometry. Transitions and{" "}
            {"{ animated }"} bindings live on separate shapes — any binding on a
            shape parks that shape's attr transitions.
          </P>
          <Code lang="tsx">{TRANSITION_TSX}</Code>
        </>
      }
      demo={TransitionShapesCard}
    />
  );
}

function TransitionShapesCard() {
  const [alt, setAlt] = useState(false);

  // Retarget the bar dataset every second; each flip re-renders new
  // static y/height attrs and the springs carry the bars over.
  useEffect(() => {
    const id = setInterval(() => setAlt((v) => !v), 1000);
    return () => clearInterval(id);
  }, []);

  const values = alt ? BARS_B : BARS_A;

  return (
    <node style={interactiveStyle}>
      <svg viewBox="0 0 130 120" style={{ width: 156, height: 144 }}>
        <line
          x1={8}
          y1={100}
          x2={122}
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
      </svg>
    </node>
  );
}

const gridStyle: BevyStyle = {
  flexDirection: "column",
  gap: 16,
  padding: 12,
};

const gridRowStyle: BevyStyle = {
  flexDirection: "row",
  gap: 20,
};

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
