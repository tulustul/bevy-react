import { useEffect, type ReactNode } from "react";
import type { BevyStyle } from "bevy-react";
import { useKeys } from "../hooks";
import { sfx } from "../sound";
import { C, F, chamfer } from "../theme";
import { WarningIcon } from "../ui/icons";
import { FILL, Keycap } from "../ui/kit";

/** How many plates are up. Every listener hears every key, so while one is
 *  up the screen under it leaves Enter, Esc and its own keys alone. */
let open = 0;

/** Whether a confirmation plate is up (screens check it in their key
 *  handlers). */
export const modalOpen = () => open > 0;

/** A confirmation over the current screen: the world dimmed, the red plate
 *  with the question, CONFIRM and CANCEL under it. Enter confirms, Esc
 *  cancels. */
export function Confirm({
  text,
  onConfirm,
  onCancel,
}: {
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <node
      style={{
        ...FILL,
        backgroundColor: "rgba(1, 2, 5, 0.88)",
        alignItems: "center",
        justifyContent: "center",
        focusPolicy: "block",
      }}
      hoverStyle={{}}
    >
      <Plate
        text={text}
        icon={<WarningIcon size={64} color={C.red} />}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </node>
  );
}

const PLATE = "#491c24";
const TAB = "rgba(150, 34, 30, 0.62)";

/** The plate itself: a translucent tab, the dark red panel with `icon` in a
 *  thumbnail-sized inset and the question, the two buttons under it (right
 *  aligned). Also laid inline over a save row. Owns Enter and Esc. */
export function Plate({
  text,
  icon,
  onConfirm,
  onCancel,
  style,
}: {
  text: string;
  icon: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  style?: BevyStyle;
}) {
  useEffect(() => {
    open++;
    return () => {
      open--;
    };
  }, []);
  const confirm = () => {
    sfx("confirm");
    onConfirm();
  };
  const cancel = () => {
    sfx("back");
    onCancel();
  };
  useKeys((e) => {
    if (e.key === "Enter") confirm();
    else if (e.key === "Escape") cancel();
  });
  return (
    <node style={{ width: 693, flexDirection: "column", gap: 26, ...style }}>
      <node style={{ width: 680, height: 120, flexDirection: "row" }}>
        <Tab />
        <node
          style={{
            ...chamfer(PLATE, 16, C.red, 1),
            flexGrow: 1,
            flexDirection: "row",
            gap: 26,
            padding: 13,
          }}
        >
          <Inset>{icon}</Inset>
          <text
            style={{
              fontSize: 24,
              fontFamily: F.semibold,
              color: C.red,
              lineHeight: 1.16,
              flexShrink: 1,
              margin: { top: 2 },
            }}
          >
            {text}
          </text>
          {/* The bracket riding the plate's right edge. */}
          <node
            style={{
              positionType: "absolute",
              right: -6,
              top: 20,
              bottom: 22,
              width: 5,
              border: { top: 1, right: 1, bottom: 1 },
              borderColor: C.red,
            }}
          />
        </node>
      </node>
      <node style={{ flexDirection: "row", gap: 6, alignSelf: "flexEnd" }}>
        <PlateButton k="enter" label="CONFIRM" onClick={confirm} />
        <PlateButton k="ESC" label="CANCEL" onClick={cancel} />
      </node>
    </node>
  );
}

/** The translucent tab on the plate's left, with its tick. */
function Tab() {
  return (
    <node
      style={{
        width: 42,
        border: 1,
        borderColor: C.red,
        borderRadius: { left: 6 },
        backgroundColor: TAB,
        margin: { right: 1 },
      }}
    >
      <node
        style={{
          positionType: "absolute",
          left: 0,
          top: 58,
          width: 15,
          height: 1,
          backgroundColor: C.red,
        }}
      />
    </node>
  );
}

/** The thumbnail-sized well the plate's picture glows in. */
function Inset({ children }: { children: ReactNode }) {
  return (
    <node
      style={{
        ...chamfer("#4e1d25", 12, "rgba(255, 93, 81, 0.28)", 1),
        width: 168,
        height: 94,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <node
        style={{
          positionType: "absolute",
          left: 1,
          top: 1,
          right: 1,
          bottom: 1,
          backgroundGradient: {
            type: "radial",
            stops: [
              { color: "rgba(255, 70, 60, 0.3)" },
              { color: "rgba(255, 70, 60, 0)", position: "70%" },
            ],
          },
        }}
      />
      {children}
    </node>
  );
}

/** CONFIRM / CANCEL: a keycap and a red label on a dark red plate in a teal
 *  frame. */
function PlateButton({
  k,
  label,
  onClick,
}: {
  k: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...chamfer("#441518", 12, "#328e8f", 1),
        width: 162,
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        padding: { horizontal: 8 },
      }}
      hoverStyle={chamfer("#5c1a1f", 12, C.cyan, 1)}
    >
      <Keycap k={k} />
      <text
        style={{
          fontSize: 24,
          fontFamily: F.semibold,
          color: C.red,
          lineBreak: "noWrap",
        }}
      >
        {label}
      </text>
    </button>
  );
}
