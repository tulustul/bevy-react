import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasContext } from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Example } from "@/components";
import { Colors } from "@/theme";

// A pure-UI demo of the `<canvas>` host element: an anti-aliased vector line
// chart drawn entirely with HTML-canvas-style commands (axes, gridlines, a
// smooth Bézier curve, a translucent area fill, and point markers). The data
// reshuffles on its own every few seconds — and on click — animating to the new
// positions; each frame re-renders React, which repaints the texture on the Bevy
// side. No 3D scene: the viewport stays empty.

const W = 460;
const H = 260;
const PAD = 28;
const POINTS = 9;
const PERIOD_MS = 1500; // auto-shuffle cadence
const DURATION_MS = 500; // tween length
const FRAME_MS = 16; // ~60fps; the runtime has no Date.now, so we accumulate this

const TYPESCRIPT = `<canvas
  draw={(ctx) => {
    ctx.strokeStyle = "#7aa2f7";
    ctx.bezierCurveTo(/* ... */);
    ctx.stroke();
  }}
/>`;

type Pt = { x: number; y: number };

const randomData = (n: number): number[] =>
  Array.from({ length: n }, () => 0.12 + Math.random() * 0.8);

// easeInOutCubic — a natural acceleration/deceleration for the tween.
const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function CanvasDemo() {
  const [values, setValues] = useState<number[]>(() => randomData(POINTS));
  // Latest displayed values, so a tween always starts from where we are now
  // (a mid-flight reshuffle retargets smoothly).
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const frameRef = useRef<ReturnType<typeof setTimeout>>();
  const animateRef = useRef<(target: number[]) => void>(() => {});

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
    // Background panel.
    ctx.fillStyle = Colors.surface100;
    ctx.rect(0, 0, W, H);
    ctx.fill();

    // Horizontal gridlines.
    ctx.strokeStyle = Colors.surface400;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD + ((H - 2 * PAD) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
    }

    // Map data to canvas points.
    const pts: Pt[] = values.map((v, i) => ({
      x: PAD + ((W - 2 * PAD) * i) / (values.length - 1),
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

  return (
    <Example
      description="An immediate-mode raster surface."
      typescript={TYPESCRIPT}
    >
      <canvas style={canvasStyle} draw={draw} onClick={shuffle} />
    </Example>
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

const canvasStyle: BevyStyle = {
  width: W,
  height: H,
  borderRadius: 12,
  border: 1,
  borderColor: Colors.surface400,
};
