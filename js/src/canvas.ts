// An HTML-`<canvas>`-style recorder for the bevy-react `<canvas>` host element.
//
// `CanvasContext` mirrors a subset of the DOM `CanvasRenderingContext2D` API,
// but instead of painting it records a display list of `DrawCmd`s that is
// rasterized on the Bevy side (anti-aliased, via tiny-skia) into the node's
// `ImageNode` texture. The surface is retained, like the web: paint
// accumulates until it is cleared — by `clearRect`/`clear()`, by a changed
// declarative `draw` prop (clear + replay), or by a layout resize (which also
// fires the element's `onResize`).
//
// Two ways to draw:
//
// Declarative — pass a painter to `<canvas>`; it replays whenever the prop
// changes, and the runtime replays it automatically after a resize:
//
//   <canvas
//     style={{ width: 300, height: 150 }}
//     draw={(ctx) => {
//       ctx.strokeStyle = "#89b4fa";
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       ctx.moveTo(0, 150);
//       ctx.bezierCurveTo(100, 0, 200, 150, 300, 20);
//       ctx.stroke();
//     }}
//   />
//
// Imperative — hold a ref and draw at will, like the web; commands batch on a
// microtask and accumulate on the retained surface:
//
//   const ref = useRef<BevyCanvasElement>(null);
//   <canvas ref={ref} style={{ width: 300, height: 150 }}
//           onResize={() => redraw(ref.current!.getContext())} />
//   // anywhere, any time:
//   const ctx = ref.current!.getContext();
//   ctx.fillStyle = "#f38ba8";
//   ctx.beginPath();
//   ctx.arc(x, y, 4, 0, Math.PI * 2);
//   ctx.fill();

// Mirrors `protocol::DrawCmd` on the Rust side (tag = "cmd"). Coordinates are in
// the canvas's own pixel space, top-left origin.
export type DrawCmd =
  | { cmd: "beginPath" }
  | { cmd: "moveTo"; x: number; y: number }
  | { cmd: "lineTo"; x: number; y: number }
  | { cmd: "quadTo"; cx: number; cy: number; x: number; y: number }
  | {
      cmd: "bezierTo";
      c1x: number;
      c1y: number;
      c2x: number;
      c2y: number;
      x: number;
      y: number;
    }
  | { cmd: "arc"; x: number; y: number; r: number; start: number; end: number }
  | { cmd: "rect"; x: number; y: number; w: number; h: number }
  | { cmd: "closePath" }
  | { cmd: "fillStyle"; color: string }
  | { cmd: "strokeStyle"; color: string }
  | { cmd: "lineWidth"; w: number }
  | { cmd: "fill" }
  | { cmd: "stroke" }
  | { cmd: "clearRect"; x: number; y: number; w: number; h: number }
  | { cmd: "clear" };

/** A painter that draws into a freshly-recorded `CanvasContext`. */
export type CanvasPainter = (ctx: CanvasContext) => void;

/** Records canvas drawing calls into a `DrawCmd` display list. Colors are any
 *  CSS color string (hex, named, `rgb()`/`hsl()`/…). */
export class CanvasContext {
  /** The recorded commands, in order. Read by `serializeProps`; you normally
   *  don't touch this — use the drawing methods instead. */
  readonly commands: DrawCmd[] = [];

  #fillStyle = "#000000";
  #strokeStyle = "#000000";
  #lineWidth = 1;

  /** Where a recorded command lands. The base recorder appends to `commands`;
   *  `RetainedCanvasContext` overrides this to batch and flush to Bevy. */
  protected record(cmd: DrawCmd): void {
    this.commands.push(cmd);
  }

  /** Current fill color (any CSS color string: hex, named, `rgb()`/`hsl()`/…).
   *  Assigning records the change. */
  get fillStyle(): string {
    return this.#fillStyle;
  }
  set fillStyle(color: string) {
    this.#fillStyle = color;
    this.record({ cmd: "fillStyle", color });
  }

  /** Current stroke color (any CSS color string: hex, named, `rgb()`/`hsl()`/…).
   *  Assigning records the change. */
  get strokeStyle(): string {
    return this.#strokeStyle;
  }
  set strokeStyle(color: string) {
    this.#strokeStyle = color;
    this.record({ cmd: "strokeStyle", color });
  }

  /** Current stroke width in canvas pixels. Assigning records the change.
   *  Invalid values (0, negative, NaN, ∞) are ignored and keep the previous
   *  width, per the HTML canvas spec. */
  get lineWidth(): number {
    return this.#lineWidth;
  }
  set lineWidth(w: number) {
    if (!Number.isFinite(w) || w <= 0) return;
    this.#lineWidth = w;
    this.record({ cmd: "lineWidth", w });
  }

  /** Start a fresh path, discarding the current one. */
  beginPath(): this {
    this.record({ cmd: "beginPath" });
    return this;
  }

  /** Begin a new subpath at `(x, y)`. */
  moveTo(x: number, y: number): this {
    this.record({ cmd: "moveTo", x, y });
    return this;
  }

  /** Add a straight segment to `(x, y)`. */
  lineTo(x: number, y: number): this {
    this.record({ cmd: "lineTo", x, y });
    return this;
  }

  /** Add a quadratic Bézier to `(x, y)` with control point `(cx, cy)`. */
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): this {
    this.record({ cmd: "quadTo", cx, cy, x, y });
    return this;
  }

  /** Add a cubic Bézier to `(x, y)` with controls `(c1x, c1y)`, `(c2x, c2y)`. */
  bezierCurveTo(
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number,
  ): this {
    this.record({ cmd: "bezierTo", c1x, c1y, c2x, c2y, x, y });
    return this;
  }

  /** Add a circular arc centered at `(x, y)`, from `start` to `end` radians. */
  arc(x: number, y: number, r: number, start: number, end: number): this {
    this.record({ cmd: "arc", x, y, r, start, end });
    return this;
  }

  /** Add an axis-aligned rectangle subpath. */
  rect(x: number, y: number, w: number, h: number): this {
    this.record({ cmd: "rect", x, y, w, h });
    return this;
  }

  /** Close the current subpath back to its start. */
  closePath(): this {
    this.record({ cmd: "closePath" });
    return this;
  }

  /** Fill the current path with `fillStyle`. */
  fill(): this {
    this.record({ cmd: "fill" });
    return this;
  }

  /** Stroke the current path with `strokeStyle` and `lineWidth`. */
  stroke(): this {
    this.record({ cmd: "stroke" });
    return this;
  }

  /** Erase a rectangle back to transparent. Like the HTML `clearRect`, it
   *  touches only pixels — path and style state stay intact. */
  clearRect(x: number, y: number, w: number, h: number): this {
    this.record({ cmd: "clearRect", x, y, w, h });
    return this;
  }

  /** Erase the whole surface back to transparent. A non-standard convenience
   *  (the web idiom is `clearRect(0, 0, width, height)`); path and style
   *  state stay intact. */
  clear(): this {
    this.record({ cmd: "clear" });
    return this;
  }
}

/** The long-lived recording context behind a canvas handle's
 *  `getContext()`. Same drawing API as `CanvasContext`, but commands batch
 *  in a private buffer and flush to Bevy on a microtask — so a synchronous
 *  burst of drawing crosses the bridge as one op, at any time, with no React
 *  render involved. Paint accumulates on the retained surface.
 *
 *  Ordering is safe by construction: microtasks never interleave inside a
 *  synchronous React commit, so a commit's tree ops (flushed in
 *  `resetAfterCommit`) always precede a flush scheduled during it, and both
 *  ride the same channel to Bevy. */
export class RetainedCanvasContext extends CanvasContext {
  #buffer: DrawCmd[] = [];
  #scheduled = false;
  readonly #sink: (cmds: DrawCmd[]) => void;

  constructor(sink: (cmds: DrawCmd[]) => void) {
    super();
    this.#sink = sink;
  }

  protected override record(cmd: DrawCmd): void {
    this.#buffer.push(cmd);
    if (this.#scheduled) return;
    this.#scheduled = true;
    queueMicrotask(() => {
      this.#scheduled = false;
      const cmds = this.#buffer.splice(0, this.#buffer.length);
      if (cmds.length > 0) this.#sink(cmds);
    });
  }
}

/** What a canvas handle needs from the bridge: a way to send a draw batch for
 *  its node, and the node's last-known laid-out size. */
export interface CanvasHost {
  send(cmds: DrawCmd[]): void;
  size(): { width: number; height: number } | undefined;
}

/** The public instance behind a `<canvas ref={…}>`: a persistent, web-like
 *  handle to the element. Survives re-renders and Fast Refresh (node ids are
 *  stable); drawing through a handle whose node has unmounted is a silent
 *  no-op on the Bevy side. */
export class BevyCanvasElement {
  /** The host-element type, `"canvas"` (the renderer's `Instance` shape). */
  readonly type = "canvas";
  readonly #host: CanvasHost;
  #ctx: RetainedCanvasContext | null = null;

  constructor(
    /** The element's reconciler node id. */
    readonly id: number,
    host: CanvasHost,
  ) {
    this.#host = host;
  }

  /** The long-lived recording context bound to this element. */
  getContext(): RetainedCanvasContext {
    return (this.#ctx ??= new RetainedCanvasContext((cmds) =>
      this.#host.send(cmds),
    ));
  }

  /** Laid-out width in logical (CSS) px; `0` before the first layout. Kept
   *  fresh from the element's `"resize"` events. */
  get width(): number {
    return this.#host.size()?.width ?? 0;
  }

  /** Laid-out height in logical (CSS) px; `0` before the first layout. */
  get height(): number {
    return this.#host.size()?.height ?? 0;
  }
}

/** Run a painter against a fresh context and return its recorded display list.
 *  Used by the renderer to turn a `<canvas draw={fn}>` painter into wire data. */
export function recordDrawing(painter: CanvasPainter): DrawCmd[] {
  const ctx = new CanvasContext();
  painter(ctx);
  return ctx.commands;
}
