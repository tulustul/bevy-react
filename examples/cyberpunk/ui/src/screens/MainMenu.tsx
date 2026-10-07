import { useEffect, useState } from "react";
import { useSharedValue, withSequence, withTiming } from "bevy-react";
import { useKeys } from "../hooks";
import { modalOpen } from "./Dialog";
import { sfx } from "../sound";
import { useSettings } from "./settings/store";
import { C, SCANLINES, T, chamfer } from "../theme";
import { DataNoise, Rule } from "../ui/decor";
import { ProtocolGlyph, WarningIcon } from "../ui/icons";
import { FILL, Hint, Hints, Keycap } from "../ui/kit";
import { Wordmark } from "../ui/Wordmark";

export type MenuEntry = { id: string; label: string };

/** The main menu — and, in game, the pause menu: the wordmark and a column
 *  of items on a translucent red band over the datascape. Hover or the
 *  arrow keys select; click or Enter picks. */
export function MainMenu({
  entries,
  onPick,
  onBack,
  version,
}: {
  entries: MenuEntry[];
  onPick: (id: string) => void;
  /** Esc (the pause menu resumes). */
  onBack?: () => void;
  version: string;
}) {
  const [selected, setSelected] = useState(0);
  const select = (i: number) => {
    if (i === selected) return;
    sfx("hover");
    setSelected(i);
  };
  useKeys((e) => {
    // A dialog over the menu takes the keys.
    if (modalOpen()) return;
    if (e.key === "ArrowDown") select((selected + 1) % entries.length);
    else if (e.key === "ArrowUp")
      select((selected + entries.length - 1) % entries.length);
    else if (e.key === "Enter") onPick(entries[selected].id);
    else if (e.key === "Escape" && onBack) {
      sfx("back");
      onBack();
    }
  }, true);

  return (
    <node style={FILL}>
      <Band />
      <DataNoise
        seed={11}
        lines={3}
        groups={3}
        style={{ positionType: "absolute", left: 152, top: 44 }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 156,
          top: 72,
          width: 112,
          height: 22,
          border: 1,
          borderColor: C.redDim,
          justifyContent: "center",
          padding: { left: 6 },
        }}
      >
        <text style={{ ...T.micro, color: C.redDim }}>4D0B95 7210 00</text>
      </node>
      <Wordmark
        width={520}
        style={{ positionType: "absolute", left: 96, top: 238 }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 178,
          top: 438,
          flexDirection: "column",
          gap: 4,
        }}
      >
        {entries.map((entry, i) => (
          <MenuItem
            key={entry.id}
            label={entry.label}
            selected={i === selected}
            onSelect={() => select(i)}
            onClick={() => onPick(entry.id)}
          />
        ))}
      </node>
      <Rule
        width={440}
        label="DRN_TCLAS_800095"
        color={C.redDim}
        style={{ positionType: "absolute", left: 150, top: 870 }}
      />
      <text
        style={{
          positionType: "absolute",
          left: 152,
          top: 896,
          fontSize: 24,
          color: C.redDim,
        }}
      >
        {version}
      </text>
      <DataNoise
        seed={5}
        lines={3}
        groups={5}
        style={{ positionType: "absolute", left: 150, top: 996 }}
      />
      <TopRight />
      {!onBack && <Messages />}
      <Hints>
        <Hint k="mouse" label="Select" />
        {onBack && <Hint k="ESC" label="Close" onClick={onBack} />}
      </Hints>
    </node>
  );
}

/** The translucent red band the menu hangs on, scanlined. */
function Band() {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 134,
        top: 0,
        bottom: 0,
        width: 466,
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            { color: "rgba(84, 24, 32, 0.4)" },
            { color: "rgba(64, 18, 26, 0.32)", position: "55%" },
            { color: "rgba(70, 20, 28, 0.4)" },
          ],
        },
        backgroundImage: SCANLINES,
        border: { left: 1, right: 2 },
        borderColor: "rgba(255, 93, 81, 0.22)",
      }}
    />
  );
}

/** One menu item. Selected, it gets the cyan cut-corner frame, the protocol
 *  mark, and a burst of glitch (a filter param animated 1 → 0 by Bevy). */
function MenuItem({
  label,
  selected,
  onSelect,
  onClick,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const glitches = !!useSettings().uiGlitch;
  const burst = useSharedValue(0);
  useEffect(() => {
    if (selected)
      burst.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: 340, easing: "easeOut" }),
      );
  }, [selected, burst]);
  return (
    <button
      onClick={onClick}
      onPointerEnter={onSelect}
      style={{
        width: 356,
        height: 52,
        padding: { left: 14, right: 12 },
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        ...(selected
          ? chamfer("rgba(6, 8, 16, 0.5)", 20, C.cyanHi, 2)
          : { border: 2, borderColor: C.clear }),
        filter:
          selected && glitches
            ? {
                name: "glitch",
                params: {
                  intensity: { animated: burst, seed: 1 },
                  split: 3,
                  tear: 12,
                  seed: 3,
                },
              }
            : undefined,
      }}
    >
      <text style={{ ...T.menu, color: selected ? C.cyan : C.red }}>
        {label}
      </text>
      {selected && <ProtocolGlyph />}
    </button>
  );
}

/** Small print across the top right: a database banner and a warning. */
function TopRight() {
  return (
    <>
      <text
        style={{
          ...T.micro,
          positionType: "absolute",
          left: 1066,
          top: 52,
        }}
      >
        {
          "SABLE CITY CORP RECORD DATABASE  //  0044729-0340  0001AF09  //  6B73\nT^7234-0091  0020434982  //  0034-2304-T042B57  #925"
        }
      </text>
      <node
        style={{
          positionType: "absolute",
          left: 1440,
          top: 36,
          width: 400,
          height: 34,
          border: 1,
          borderColor: C.redDim,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: { horizontal: 10 },
        }}
      >
        <WarningIcon size={14} color={C.redDim} />
        <text style={{ ...T.micro, fontSize: 8, color: C.redDim }}>
          {
            "Tampering with this terminal is a felony under Sable City Code 44.2.\nAll sessions are logged and may be reviewed by Gridwatch."
          }
        </text>
      </node>
    </>
  );
}

/** The box bottom right: unread messages. */
function Messages() {
  return (
    <node
      style={{
        positionType: "absolute",
        right: 80,
        bottom: 118,
        width: 516,
        height: 44,
        ...chamfer("rgba(20, 8, 12, 0.6)", 10, C.redDim, 1),
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: { horizontal: 8 },
      }}
    >
      <Keycap k="3" />
      <text style={{ fontSize: 24, color: C.red }}>Messages</text>
      <node style={{ flexGrow: 1 }} />
      <text style={{ ...T.micro, fontSize: 8 }}>{"SYSTEM INPUT 12"}</text>
      <node style={{ flexDirection: "row", gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <node
            key={i}
            style={{ width: 5, height: 18, backgroundColor: C.red }}
          />
        ))}
      </node>
    </node>
  );
}
