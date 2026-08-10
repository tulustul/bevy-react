// Schematic controller painter for the <canvas> in each pad box: body
// outline, ABXY cluster, d-pad cross, stick rings with live dots, bumpers,
// analog trigger fill bars, and the select/start/mode buttons. A pure
// function of PadState — the visualizer memoizes the returned painter per pad
// object, so the surface replays exactly when that pad's state changes.
//
// Canvas constraints (js/src/canvas.ts): circular arc only (no ellipse /
// roundRect / text / transforms); circles are full arcs.

import type { CanvasContext } from "bevy-react";
import { Colors } from "@/theme";
import type { PadState } from "./usePads";

export const PAD_CANVAS_W = 280;
export const PAD_CANVAS_H = 180;

const TAU = Math.PI * 2;

const ABXY_COLORS: Record<string, string> = {
  south: Colors.green100,
  east: Colors.red100,
  west: Colors.sky100,
  north: Colors.yellow100,
};

export function makePadPainter(pad: PadState): (ctx: CanvasContext) => void {
  const pressed = (name: string) => pad.buttons[name]?.pressed ?? false;
  const value = (name: string) => pad.buttons[name]?.value ?? 0;
  const axis = (name: string) => pad.axes[name] ?? 0;

  return (ctx) => {
    const detail = (on: boolean, onColor: string = Colors.primary100) => {
      ctx.fillStyle = on ? onColor : Colors.surface400;
      ctx.fill();
      ctx.strokeStyle = Colors.surface600;
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    const circle = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
    };
    const box = (x: number, y: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
    };

    // Analog triggers (LT/RT): stroked track + fill proportional to value.
    for (const [name, x] of [
      ["leftTrigger2", 30],
      ["rightTrigger2", 206],
    ] as const) {
      box(x, 4, 44, 9);
      ctx.fillStyle = Colors.surface200;
      ctx.fill();
      ctx.strokeStyle = Colors.surface600;
      ctx.lineWidth = 1;
      ctx.stroke();
      const fill = value(name);
      if (fill > 0) {
        box(x + 1, 5, fill * 42, 7);
        ctx.fillStyle = Colors.primary100;
        ctx.fill();
      }
    }

    // Bumpers (LB/RB).
    box(30, 17, 44, 9);
    detail(pressed("leftTrigger"));
    box(206, 17, 44, 9);
    detail(pressed("rightTrigger"));

    // Body silhouette: top edge, right grip, inner valley, mirrored left.
    ctx.beginPath();
    ctx.moveTo(70, 34);
    ctx.quadraticCurveTo(140, 24, 210, 34);
    ctx.bezierCurveTo(245, 40, 262, 120, 252, 155);
    ctx.quadraticCurveTo(244, 172, 224, 162);
    ctx.quadraticCurveTo(200, 130, 168, 128);
    ctx.lineTo(112, 128);
    ctx.quadraticCurveTo(80, 130, 56, 162);
    ctx.quadraticCurveTo(36, 172, 28, 155);
    ctx.bezierCurveTo(18, 120, 35, 40, 70, 34);
    ctx.closePath();
    ctx.fillStyle = Colors.surface200;
    ctx.fill();
    ctx.strokeStyle = Colors.surface600;
    ctx.lineWidth = 2;
    ctx.stroke();

    // D-pad cross (center 78,74): four arms + always-idle center cap.
    box(71, 51, 14, 16);
    detail(pressed("dPadUp"));
    box(71, 81, 14, 16);
    detail(pressed("dPadDown"));
    box(55, 67, 16, 14);
    detail(pressed("dPadLeft"));
    box(85, 67, 16, 14);
    detail(pressed("dPadRight"));
    box(71, 67, 14, 14);
    detail(false);

    // ABXY cluster (center 202,74).
    for (const [name, x, y] of [
      ["north", 202, 57],
      ["south", 202, 91],
      ["west", 185, 74],
      ["east", 219, 74],
    ] as const) {
      circle(x, y, 8);
      detail(pressed(name), ABXY_COLORS[name]);
    }

    // Sticks: ring + dot displaced by the axes. Screen y subtracts the value
    // because Bevy sticks are up = +1.
    for (const [xName, yName, thumb, cx] of [
      ["leftStickX", "leftStickY", "leftThumb", 112],
      ["rightStickX", "rightStickY", "rightThumb", 168],
    ] as const) {
      const cy = 108;
      circle(cx, cy, 15);
      ctx.strokeStyle = Colors.surface600;
      ctx.lineWidth = 1;
      ctx.stroke();
      circle(cx + axis(xName) * 8, cy - axis(yName) * 8, 6);
      detail(pressed(thumb), Colors.primary100);
      if (!pressed(thumb)) {
        // Idle dot reads better slightly brighter than other idle details.
        circle(cx + axis(xName) * 8, cy - axis(yName) * 8, 3);
        ctx.fillStyle = Colors.textColor300;
        ctx.fill();
      }
    }

    // Select / start / mode.
    box(118, 68, 11, 6);
    detail(pressed("select"));
    box(151, 68, 11, 6);
    detail(pressed("start"));
    circle(140, 92, 6);
    detail(pressed("mode"));
  };
}
