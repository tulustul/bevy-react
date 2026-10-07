import type { ReactNode } from "react";
import type { BevyStyle, PointerEventData } from "bevy-react";
import { sfx } from "../../sound";
import { C, F, T, chamfer } from "../../theme";
import { Arrow, MouseIcon } from "../../ui/icons";
import { Keycap } from "../../ui/kit";
import type { Row, Slider } from "./data";
import type { SettingValue } from "./store";

// The settings' building blocks: the rows and their widgets (a selector, an
// OFF/ON switch, a slider, a key binding), plus the backdrop and stage every
// settings screen sits on.

/** The widget column. */
const WIDTH = 450;
/** A plate's dim red frame, and the brighter one under the pointer. */
const FRAME = "#55161c";
const FRAME_HOT = "#a8322f";
const VALUE: BevyStyle = { fontSize: 21, color: C.cyan, lineBreak: "noWrap" };

/** The 1920 px wide canvas the screens are drawn on (the reference layout's
 *  coordinates), centred whatever the window's aspect. */
export const STAGE: BevyStyle = {
  positionType: "absolute",
  top: 0,
  bottom: 0,
  left: "50%",
  width: 1920,
  margin: { left: -960 },
};

/** The settings' own dark backdrop: wine red at the top fading into blue-
 *  black, a breath of the datascape still showing through. */
export function Backdrop() {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            { color: "rgba(56, 19, 27, 0.98)" },
            { color: "rgba(33, 13, 21, 0.98)", position: "22%" },
            { color: "rgba(13, 8, 15, 0.98)", position: "45%" },
            { color: "rgba(5, 9, 14, 0.98)", position: "65%" },
            { color: "rgba(6, 14, 19, 0.98)" },
          ],
        },
      }}
    />
  );
}

/** A sub-screen's title, centred over a long red rule. */
export function SubHeader({ title }: { title: string }) {
  return (
    <>
      <node
        style={{
          positionType: "absolute",
          left: 36,
          right: 36,
          top: 70,
          height: 2,
          backgroundColor: "rgba(255, 93, 81, 0.32)",
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 32,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg viewBox="0 0 20 20" style={{ width: 30, height: 30 }}>
          <polygon
            points={[10, 1, 19, 10, 10, 19, 1, 10]}
            fill="none"
            stroke={C.red}
            strokeWidth={1.6}
          />
          <circle cx={7.5} cy={8.5} r={1.6} fill="none" stroke={C.red} />
          <circle cx={12.5} cy={11.5} r={1.6} fill="none" stroke={C.red} />
          <line x1={9} y1={9.5} x2={11} y2={10.5} stroke={C.red} />
        </svg>
        <text style={{ ...T.micro, fontSize: 6, lineHeight: 1.1 }}>
          {"4848181\n4155681\nB00L364\n3061233"}
        </text>
        <text style={{ ...T.title, fontSize: 30 }}>{title}</text>
      </node>
    </>
  );
}

/** A section header: a teal rule over a lighter band, the name in white. */
function Section({ label }: { label: string }) {
  return (
    <node style={{ flexDirection: "column", margin: { top: 7, bottom: 8 } }}>
      <node
        style={{
          height: 2,
          backgroundGradient: {
            type: "linear",
            angle: 90,
            stops: [
              { color: "#2c1a24" },
              { color: "#34847a", position: "25%" },
              { color: "#2a3e66", position: "48%" },
              { color: "#2c1a4a" },
            ],
          },
        }}
      />
      <node
        style={{
          height: 40,
          alignItems: "center",
          padding: { left: 11 },
          backgroundColor: "rgba(40, 46, 70, 0.22)",
        }}
      >
        <text style={T.section}>{label}</text>
      </node>
    </node>
  );
}

/** One setting: the label in red, the widget in the right-hand column. */
export function SettingRow({
  row,
  values,
  listening,
  onChange,
  onListen,
}: {
  row: Row;
  values: Record<string, SettingValue>;
  /** The key binding waiting for a key, if any. */
  listening: string | null;
  onChange: (id: string, value: SettingValue) => void;
  onListen: (id: string) => void;
}) {
  if (row.kind === "section") return <Section label={row.label} />;
  let widget: ReactNode;
  switch (row.kind) {
    case "select":
      widget = (
        <Selector
          options={row.options}
          value={Number(values[row.id])}
          onChange={(v) => onChange(row.id, v)}
        />
      );
      break;
    case "toggle":
      widget = (
        <Toggle
          value={values[row.id] === true}
          onChange={(v) => onChange(row.id, v)}
        />
      );
      break;
    case "slider":
      widget = (
        <SliderBar
          row={row}
          value={Number(values[row.id])}
          onChange={(v) => onChange(row.id, v)}
        />
      );
      break;
    case "key":
      widget = (
        <KeyBind
          code={String(values[row.id])}
          listening={listening === row.id}
          onListen={() => onListen(row.id)}
        />
      );
      break;
    case "info":
      widget = <Info value={row.value} />;
  }
  return <RowFrame label={row.label}>{widget}</RowFrame>;
}

/** A row's frame: 47 px, lit faintly under the pointer. The label rides a
 *  little above the widget's centre, like the game's. */
export function RowFrame({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <node
      onPointerEnter={() => sfx("hover")}
      style={{
        height: 47,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        padding: { left: 20, right: 25 },
      }}
      hoverStyle={{ backgroundColor: "rgba(255, 93, 81, 0.05)" }}
    >
      <text style={{ ...T.label, margin: { bottom: 14 } }}>{label}</text>
      {children}
    </node>
  );
}

/** The dark plate under a selector, slider or key binding. */
function plate(line = FRAME): BevyStyle {
  return { ...chamfer(C.field, 10, line, 1), width: WIDTH, height: 40 };
}

/** `◁ value ▷`, with a pip per option under the value. */
function Selector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: number;
  onChange: (value: number) => void;
}) {
  const step = (d: number) => {
    sfx("click");
    onChange((value + d + options.length) % options.length);
  };
  const pip = Math.min(20, (280 - 4 * (options.length - 1)) / options.length);
  return (
    <node
      style={{
        ...plate(),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        padding: { horizontal: 21 },
      }}
      hoverStyle={plate(FRAME_HOT)}
    >
      <ArrowButton dir="left" onClick={() => step(-1)} />
      <text style={{ ...VALUE, margin: { bottom: 5 } }}>{options[value]}</text>
      <ArrowButton dir="right" onClick={() => step(1)} />
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          bottom: 5,
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {options.map((_, i) => (
          <node
            key={i}
            style={{
              width: pip,
              height: 2,
              backgroundColor: i === value ? "#e94a42" : "#4a1d24",
            }}
          />
        ))}
      </node>
    </node>
  );
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
      }}
      hoverStyle={{ backgroundColor: "rgba(94, 246, 255, 0.08)" }}
    >
      <Arrow dir={dir} />
    </button>
  );
}

/** OFF | ON: the chosen half lit (red OFF, cyan ON), the other all but
 *  gone. */
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const half = (on: boolean) => {
    const lit = value === on;
    const [fill, line, ink] = on
      ? lit
        ? [C.cyan, C.cyanHi, "#06141a"]
        : ["#0a1d20", "#0f2a2f", "#12353b"]
      : lit
        ? ["#932d2a", "#c73d38", "#ff6f64"]
        : ["#1a0c10", "#2a0e13", "#3d1116"];
    return (
      <button
        onClick={() => {
          sfx("click");
          onChange(on);
        }}
        style={{
          ...chamfer(fill, 10, line, 1, on ? "br" : "bl"),
          width: 222,
          height: 38,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <text
          style={{
            fontSize: 20,
            fontFamily: F.bold,
            color: ink,
            letterSpacing: 0.5,
          }}
        >
          {on ? "ON" : "OFF"}
        </text>
      </button>
    );
  };
  return (
    <node
      style={{
        width: WIDTH,
        flexDirection: "row",
        justifyContent: "spaceBetween",
      }}
    >
      {half(false)}
      {half(true)}
    </node>
  );
}

/** The value centred on a plate, a red block marking where it sits; click
 *  or drag anywhere on it. */
export function SliderBar({
  row,
  value,
  onChange,
}: {
  row: Slider;
  value: number;
  onChange: (value: number) => void;
}) {
  const { min, max, step } = row;
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const set = (e: PointerEventData) => {
    // The block's centre travels from 20 px in to 20 px from the end.
    const t = Math.min(1, Math.max(0, (e.x * WIDTH - 20) / (WIDTH - 40)));
    const next = Number(
      (Math.round((min + t * (max - min)) / step) * step).toFixed(decimals),
    );
    if (next !== value) onChange(next);
  };
  const left = ((value - min) / (max - min)) * (WIDTH - 42);
  // White where the block sits under the value.
  const under = Math.abs(left + 20 - (WIDTH - 2) / 2) < 40;
  return (
    <node
      onPointerDown={set}
      onPointerMove={set}
      style={{ ...plate(), alignItems: "center", justifyContent: "center" }}
      hoverStyle={plate(FRAME_HOT)}
    >
      <node
        style={{
          ...chamfer("#dd4643", 10),
          positionType: "absolute",
          left,
          top: 0,
          bottom: 0,
          width: 40,
        }}
      />
      <text style={{ ...VALUE, color: under ? C.white : C.cyan }}>
        {value.toFixed(decimals)}
      </text>
    </node>
  );
}

/** The key an action is bound to, as a keycap (or the mouse); click, then
 *  press a key to rebind. */
function KeyBind({
  code,
  listening,
  onListen,
}: {
  code: string;
  listening: boolean;
  onListen: () => void;
}) {
  return (
    <button
      onClick={() => {
        sfx("click");
        onListen();
      }}
      style={{
        ...plate(listening ? C.cyan : FRAME),
        alignItems: "center",
        justifyContent: "center",
      }}
      hoverStyle={plate(listening ? C.cyan : FRAME_HOT)}
    >
      {listening ? (
        <text style={{ ...VALUE, fontFamily: F.semibold, letterSpacing: 1 }}>
          PRESS A KEY
        </text>
      ) : code.startsWith("Mouse") ? (
        <node style={{ flexDirection: "row", alignItems: "flexStart", gap: 1 }}>
          <MouseIcon size={28} />
          {code.includes("Wheel") && (
            <svg viewBox="0 0 8 6" style={{ width: 8, height: 6 }}>
              <polygon
                points={
                  code.endsWith("Up") ? [0, 6, 4, 0, 8, 6] : [0, 0, 8, 0, 4, 6]
                }
                fill={C.cyan}
              />
            </svg>
          )}
        </node>
      ) : (
        <Keycap k={keyLabel(code)} />
      )}
    </button>
  );
}

/** A setting that can't change here, shown on a pale plate. */
function Info({ value }: { value: string }) {
  return (
    <node
      style={{
        ...chamfer("#120e18", 10, "#b8aeb3", 1),
        width: WIDTH,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <text style={{ ...VALUE, color: "#cdc6ca", margin: { bottom: 5 } }}>
        {value}
      </text>
      <node
        style={{
          positionType: "absolute",
          bottom: 5,
          width: 20,
          height: 2,
          backgroundColor: "#e94a42",
        }}
      />
    </node>
  );
}

/** Keys named the way a keycap fits them. */
const KEY_NAMES: Record<string, string> = {
  Space: "space",
  Enter: "enter",
  ShiftLeft: "SHIFT",
  ShiftRight: "SHIFT",
  ControlLeft: "CTRL",
  ControlRight: "CTRL",
  AltLeft: "ALT",
  AltRight: "ALT",
  Tab: "TAB",
  Backspace: "BKSP",
  CapsLock: "CAPS",
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backslash: "\\",
  Backquote: "`",
};

/** `"KeyW"` → `"W"`, `"ShiftLeft"` → `"SHIFT"` (a `KeyboardEvent.code`). */
function keyLabel(code: string) {
  return (
    KEY_NAMES[code] ??
    code
      .replace(/^(Key|Digit)/, "")
      .replace(/^Numpad/, "NUM")
      .toUpperCase()
      .slice(0, 5)
  );
}
