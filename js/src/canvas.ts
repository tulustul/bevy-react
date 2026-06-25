// An HTML-`<canvas>`-style recorder for the bevy-react `<canvas>` host element.
//
// `CanvasContext` mirrors a subset of the DOM `CanvasRenderingContext2D` path
// API, but instead of painting it records a display list of `DrawCmd`s. The list
// crosses the bridge as the `draw` prop and is rasterized on the Bevy side
// (anti-aliased, via tiny-skia) into the node's `ImageNode` texture.
//
// Usage — pass a painter to `<canvas>` and draw immediately:
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
  | { cmd: "stroke" };

/** A painter that draws into a freshly-recorded `CanvasContext`. */
export type CanvasPainter = (ctx: CanvasContext) => void;

/** Records canvas drawing calls into a `DrawCmd` display list. Colors are hex
 *  strings (`"#rgb"`, `"#rrggbb"`, `"#rrggbbaa"`). */
export class CanvasContext {
  /** The recorded commands, in order. Read by `serializeProps`; you normally
   *  don't touch this — use the drawing methods instead. */
  readonly commands: DrawCmd[] = [];

  #fillStyle = "#000000";
  #strokeStyle = "#000000";
  #lineWidth = 1;

  /** Current fill color (any CSS color string: hex, named, `rgb()`/`hsl()`/…).
   *  Assigning records the change. */
  get fillStyle(): string {
    return this.#fillStyle;
  }
  set fillStyle(color: string) {
    this.#fillStyle = color;
    this.commands.push({ cmd: "fillStyle", color });
  }

  /** Current stroke color (any CSS color string: hex, named, `rgb()`/`hsl()`/…).
   *  Assigning records the change. */
  get strokeStyle(): string {
    return this.#strokeStyle;
  }
  set strokeStyle(color: string) {
    this.#strokeStyle = color;
    this.commands.push({ cmd: "strokeStyle", color });
  }

  /** Current stroke width in canvas pixels. Assigning records the change. */
  get lineWidth(): number {
    return this.#lineWidth;
  }
  set lineWidth(w: number) {
    this.#lineWidth = w;
    this.commands.push({ cmd: "lineWidth", w });
  }

  /** Start a fresh path, discarding the current one. */
  beginPath(): this {
    this.commands.push({ cmd: "beginPath" });
    return this;
  }

  /** Begin a new subpath at `(x, y)`. */
  moveTo(x: number, y: number): this {
    this.commands.push({ cmd: "moveTo", x, y });
    return this;
  }

  /** Add a straight segment to `(x, y)`. */
  lineTo(x: number, y: number): this {
    this.commands.push({ cmd: "lineTo", x, y });
    return this;
  }

  /** Add a quadratic Bézier to `(x, y)` with control point `(cx, cy)`. */
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): this {
    this.commands.push({ cmd: "quadTo", cx, cy, x, y });
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
    this.commands.push({ cmd: "bezierTo", c1x, c1y, c2x, c2y, x, y });
    return this;
  }

  /** Add a circular arc centered at `(x, y)`, from `start` to `end` radians. */
  arc(x: number, y: number, r: number, start: number, end: number): this {
    this.commands.push({ cmd: "arc", x, y, r, start, end });
    return this;
  }

  /** Add an axis-aligned rectangle subpath. */
  rect(x: number, y: number, w: number, h: number): this {
    this.commands.push({ cmd: "rect", x, y, w, h });
    return this;
  }

  /** Close the current subpath back to its start. */
  closePath(): this {
    this.commands.push({ cmd: "closePath" });
    return this;
  }

  /** Fill the current path with `fillStyle`. */
  fill(): this {
    this.commands.push({ cmd: "fill" });
    return this;
  }

  /** Stroke the current path with `strokeStyle` and `lineWidth`. */
  stroke(): this {
    this.commands.push({ cmd: "stroke" });
    return this;
  }
}

/** Run a painter against a fresh context and return its recorded display list.
 *  Used by the renderer to turn a `<canvas draw={fn}>` painter into wire data. */
export function recordDrawing(painter: CanvasPainter): DrawCmd[] {
  const ctx = new CanvasContext();
  painter(ctx);
  return ctx.commands;
}
