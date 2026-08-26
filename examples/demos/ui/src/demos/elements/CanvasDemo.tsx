import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BevyCanvasElement,
  CanvasContext,
  RetainedCanvasContext,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Button, DemoRow, Example } from "@/components";
import { B, Code, InlineCode, P } from "@/components/docs";
import { Colors } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { useWindowSize } from "@/useWindowSize";

// A pure-UI demo of the `<canvas>` host element: an anti-aliased vector line
// chart drawn entirely with HTML-canvas-style commands (axes, gridlines, a
// smooth Bézier curve, a translucent area fill, and point markers). The data
// reshuffles on its own every few seconds — and on click — animating to the new
// positions; each frame re-renders React, which repaints the texture on the Bevy
// side. No 3D scene: the viewport stays empty.

const PAGE: ExplanationData = {
  title: "<canvas>",
  info: (
    <>
      <P>
        <InlineCode>{"<canvas>"}</InlineCode> is a web-faithful retained pixel
        surface: paint <B>accumulates</B> in a persistent texture, and styles
        plus the current path survive across batches — the familiar HTML canvas
        2D command set (paths, béziers, fills, strokes).
      </P>
      <P>There are two ways to draw:</P>
      <Code lang="tsx">{`// Declarative: clears + replays whenever \`draw\` changes.
<canvas draw={(ctx) => { … }} />

// Imperative: a ref handle, off the React render path.
const ctx = canvasRef.current.getContext();
ctx.lineTo(x, y);
ctx.stroke();`}</Code>
      <P>
        Imperative commands batch on a microtask and flush outside React
        commits, so doodling costs no re-renders. A layout resize clears the
        surface (HTML width/height-set semantics), updates the handle's{" "}
        <InlineCode>width</InlineCode>/<InlineCode>height</InlineCode>, and
        fires <InlineCode>onResize</InlineCode>; a stored declarative painter
        replays automatically.
      </P>
    </>
  ),
};

const W = 460;
const H = 260;
const PAD = 28;
const POINTS = 9;
const PERIOD_MS = 1500; // auto-shuffle cadence
const DURATION_MS = 500; // tween length
const FRAME_MS = 16; // ~60fps; the runtime has no Date.now, so we accumulate this

const PALETTE = [
  Colors.primary100,
  Colors.green100,
  Colors.red100,
  Colors.yellow100,
  Colors.purple100,
];

type Pt = { x: number; y: number };

const randomData = (n: number): number[] =>
  Array.from({ length: n }, () => 0.12 + Math.random() * 0.8);

// easeInOutCubic — a natural acceleration/deceleration for the tween.
const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function CanvasDemo() {
  useDemoPage(PAGE);
  // The declarative (`draw`-prop) canvas must stay mounted before the
  // imperative one: a Rust integration test relies on the first canvas create
  // op being the declarative example's.
  return (
    <>
      <DemoRow>
        <GraphDemo />
      </DemoRow>
      <DemoRow>
        <PaintDemo />
      </DemoRow>
    </>
  );
}

function GraphDemo() {
  return (
    <Example
      title="Declarative drawing"
      info={
        <>
          <P>
            A declarative vector drawing: the <InlineCode>draw</InlineCode> prop
            clears the surface and replays the callback whenever it changes —
            here axes, gridlines, a smooth Bézier curve, an area fill and
            markers. The data reshuffles every few seconds (and on click),
            tweening to new positions through React state; each frame re-renders
            React, which repaints the texture Bevy-side.
          </P>
          <Code lang="tsx">{`<canvas
  draw={(ctx) => {
    ctx.strokeStyle = "#7aa2f7";
    ctx.bezierCurveTo(/* … */);
    ctx.stroke();
  }}
  onClick={shuffle}
/>`}</Code>
        </>
      }
      demo={GraphCard}
    />
  );
}

function GraphCard() {
  const [values, setValues] = useState<number[]>(() => randomData(POINTS));
  // Latest displayed values, so a tween always starts from where we are now
  // (a mid-flight reshuffle retargets smoothly).
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const frameRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animateRef = useRef<(target: number[]) => void>(() => {});

  const window = useWindowSize();

  // One animation loop for the component's lifetime: an auto-shuffle every
  // PERIOD_MS, each tweening to its new data over DURATION_MS.
  useEffect(() => {
    let alive = true;

    const animateTo = (target: number[]) => {
      clearTimeout(frameRef.current);
      const from = valuesRef.current;
      let elapsed = 0;
      const step = () => {
        if (!alive) return;
        elapsed += FRAME_MS;
        const e = easeInOut(Math.min(1, elapsed / DURATION_MS));
        setValues(from.map((v, i) => v + (target[i] - v) * e));
        if (elapsed < DURATION_MS)
          frameRef.current = setTimeout(step, FRAME_MS);
      };
      step();
    };
    animateRef.current = animateTo;

    let cycle: ReturnType<typeof setTimeout>;
    const tick = () => {
      animateTo(randomData(POINTS));
      cycle = setTimeout(tick, PERIOD_MS);
    };
    cycle = setTimeout(tick, PERIOD_MS);

    return () => {
      alive = false;
      clearTimeout(frameRef.current);
      clearTimeout(cycle);
    };
  }, []);

  // Reshuffle immediately (click), animating from the current positions.
  const shuffle = useCallback(() => animateRef.current(randomData(POINTS)), []);

  const draw = (ctx: CanvasContext) => {
    const w = Math.min(window.width - 40, W);

    // Background panel.
    ctx.fillStyle = Colors.surface100;
    ctx.rect(0, 0, w, H);
    ctx.fill();

    // Horizontal gridlines.
    ctx.strokeStyle = Colors.surface400;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD + ((H - 2 * PAD) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(w - PAD, y);
      ctx.stroke();
    }

    // Map data to canvas points.
    const pts: Pt[] = values.map((v, i) => ({
      x: PAD + ((w - 2 * PAD) * i) / (values.length - 1),
      y: H - PAD - v * (H - 2 * PAD),
    }));

    // Translucent area under the smooth curve.
    ctx.fillStyle = Colors.primaryOverlay;
    smoothPath(ctx, pts);
    ctx.lineTo(pts[pts.length - 1].x, H - PAD);
    ctx.lineTo(pts[0].x, H - PAD);
    ctx.closePath();
    ctx.fill();

    // The smooth curve itself.
    ctx.strokeStyle = Colors.primary100;
    ctx.lineWidth = 3;
    smoothPath(ctx, pts);
    ctx.stroke();

    // Point markers.
    ctx.fillStyle = Colors.purple100;
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  return <canvas style={canvasStyle} draw={draw} onClick={shuffle} />;
}

function PaintDemo() {
  return (
    <Example
      title="Retained surface"
      info={
        <>
          <P>
            A retained drawing surface driven imperatively through a ref handle:
            each pointer event strokes one short segment, the surface keeps
            everything already painted, and <B>no React re-render</B> happens
            while doodling. The surface clears on resize, and{" "}
            <InlineCode>onResize</InlineCode> repaints the background.
          </P>
          <Code lang="tsx">{`const ref = useRef<BevyCanvasElement>(null);

<canvas
  ref={ref}
  onResize={() => paintBackground(ref.current!)}
  onPointerDown={begin}
  onPointerMove={(e) => {
    const el = ref.current!;
    const ctx = el.getContext();
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(e.x * el.width, e.y * el.height);
    ctx.stroke(); // accumulates — nothing else is repainted
  }}
/>`}</Code>
        </>
      }
      demo={PaintCard}
    />
  );
}

function PaintCard() {
  const ref = useRef<BevyCanvasElement>(null);
  // The in-flight stroke's last point (drawing happens between pointer events,
  // entirely outside React state — no re-renders while doodling).
  const last = useRef<Pt | null>(null);
  const strokeCount = useRef(0);

  const window = useWindowSize();

  const paintBackground = useCallback((el: BevyCanvasElement) => {
    const ctx = el.getContext();
    ctx.fillStyle = Colors.surface100;
    ctx.beginPath();
    ctx.rect(0, 0, el.width, el.height);
    ctx.fill();
  }, []);

  const pointAt = (el: BevyCanvasElement, e: { x: number; y: number }): Pt => ({
    x: e.x * el.width,
    y: e.y * el.height,
  });

  const begin = useCallback((e: { x: number; y: number }) => {
    const el = ref.current;
    if (!el) return;
    const p = pointAt(el, e);
    const ctx = el.getContext();
    ctx.strokeStyle = ctx.fillStyle =
      PALETTE[strokeCount.current++ % PALETTE.length];
    ctx.lineWidth = 3;
    dot(ctx, p);
    last.current = p;
  }, []);

  const drawFromMouse = useCallback((e: { x: number; y: number }) => {
    const el = ref.current;
    const from = last.current;
    if (!el || !from) return;
    const p = pointAt(el, e);
    // The node-relative position clamps at the canvas edges, so dragging past
    // the border repeats the same clamped point — a zero-length (undrawable)
    // segment.
    if (p.x === from.x && p.y === from.y) return;
    const ctx = el.getContext();
    // One short segment per event, each its own path — the surface retains
    // everything already painted, so nothing needs re-stroking.
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    dot(ctx, p);
    last.current = p;
  }, []);

  const clear = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.getContext().clear();
    paintBackground(el);
  }, [paintBackground]);

  return (
    <node style={columnStyle}>
      <text>Use mouse to draw on the canvas</text>
      <canvas
        ref={ref}
        style={canvasStyle}
        onResize={() => ref.current && paintBackground(ref.current)}
        onPointerDown={begin}
        onPointerMove={drawFromMouse}
        onPointerUp={() => (last.current = null)}
      />
      <Button onClick={clear}>Clear</Button>
    </node>
  );
}

// Build a Catmull-Rom spline through `pts` as cubic Béziers — a smooth curve
// that passes through every point. Begins a fresh path at the first point.
function smoothPath(ctx: CanvasContext, pts: Pt[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    );
  }
}

function dot(ctx: RetainedCanvasContext, p: Pt) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

const columnStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  width: "100%",
};

const canvasStyle: BevyStyle = {
  width: W,
  height: H,
  maxWidth: "100%",
  borderRadius: 12,
  border: 1,
  borderColor: Colors.surface400,
};
