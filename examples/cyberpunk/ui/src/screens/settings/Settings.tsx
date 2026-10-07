import { useState } from "react";
import { useDebug, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { C, F, T, chamfer } from "../../theme";
import { EdgeRails, ProtocolStamp } from "../../ui/decor";
import { CutButton, FILL, Hint, Hints, Keycap } from "../../ui/kit";
import { ControlScheme } from "./ControlScheme";
import { CUSTOM, PRESETS, TABS, defaults, type TabId } from "./data";
import { Gamma } from "./Gamma";
import { Backdrop, SettingRow } from "./rows";
import {
  setSetting,
  setSettings,
  useSettings,
  type SettingValue,
} from "./store";

type Sub = "gamma" | "controls" | null;

/** Change a setting; GRAPHICS' Quick Preset sets the rows it governs, and
 *  tweaking one of those makes the preset Custom. */
function change(id: string, value: SettingValue) {
  if (id === "preset")
    setSettings({ preset: value, ...PRESETS[Number(value)] });
  else if (id in PRESETS[0]) setSettings({ [id]: value, preset: CUSTOM });
  else setSetting(id, value);
}

/** SETTINGS: eight tabs of rows, the gamma correction and control scheme
 *  screens. [1]/[3] (or Q/E) switch tabs, F1 restores the tab's defaults,
 *  Esc closes. */
export function Settings({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("sound");
  const [sub, setSub] = useState<Sub>(null);
  /** The key binding waiting for a key. */
  const [listening, setListening] = useState<string | null>(null);
  const values = useSettings();
  const index = TABS.findIndex((t) => t.id === tab);
  const rows = TABS[index].rows;

  const pick = (id: TabId) => {
    if (id === tab) return;
    sfx("tab");
    setListening(null);
    setTab(id);
  };
  const step = (d: number) =>
    pick(TABS[(index + d + TABS.length) % TABS.length].id);
  const restore = () => {
    sfx("confirm");
    setListening(null);
    setSettings(defaults(rows));
  };
  const open = (s: Sub) => {
    sfx("click");
    setListening(null);
    setSub(s);
  };

  useKeys((e) => {
    if (sub) return; // the sub-screen has the keys
    if (listening) {
      if (e.key !== "Escape") setSetting(listening, e.code);
      sfx(e.key === "Escape" ? "back" : "confirm");
      setListening(null);
      return;
    }
    switch (e.code) {
      case "Escape":
        sfx("back");
        return onClose();
      case "Digit1":
      case "KeyQ":
        return step(-1);
      case "Digit3":
      case "KeyE":
        return step(1);
      case "KeyZ":
        return open("gamma");
      case "KeyX":
        return open("controls");
      case "F1":
        return restore();
    }
  });

  // Scripted steps for `--shoot`: `tab <id>`, `sub gamma|controls|none`,
  // `set <id> <value>`, `listen <id>`.
  useDebug("tab", (t) => {
    if (TABS.some((x) => x.id === t)) setTab(t as TabId);
  });
  useDebug("sub", (s) => setSub(s === "none" ? null : (s as Sub)));
  useDebug("set", (arg) => {
    const [id, v] = arg.split(" ");
    change(id, v === "true" ? true : v === "false" ? false : Number(v));
  });
  useDebug("listen", setListening);

  if (sub === "gamma") return <Gamma onBack={() => setSub(null)} />;
  if (sub === "controls") return <ControlScheme onBack={() => setSub(null)} />;

  return (
    <node style={FILL}>
      <Backdrop />
      <node
        style={{
          positionType: "absolute",
          left: 36,
          right: 36,
          top: 84,
          height: 1,
          backgroundColor: "rgba(255, 93, 81, 0.2)",
        }}
      />
      <ProtocolStamp style={{ left: 36, top: 70 }} />
      <EdgeRails />
      <Tabs tab={tab} onPick={pick} onStep={step} />
      {/* The list, centred, the side buttons hanging off its right: the
          spacer on the left balances them, and gives way first on a
          narrow window. */}
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 159,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <node style={{ width: 310, flexShrink: 1 }} />
        <node
          style={{
            flexShrink: 0,
            // The glitch every tab change runs through (a crossfade with UI
            // glitch effects off).
            morphFilter: {
              key: tab,
              name: values.uiGlitch ? "glitchSwap" : "crossfade",
            },
            transition: { morphFilter: { duration: 260, easing: "linear" } },
          }}
        >
          <node
            key={tab}
            style={{
              width: 962,
              height: 700,
              flexDirection: "column",
              overflowY: "scroll",
              scrollbar: {
                track: { backgroundColor: "#2a0d12" },
                thumb: {
                  backgroundColor: "#f24d47",
                  hover: { backgroundColor: C.redHi },
                },
                thickness: 4,
                minThumbLength: 40,
              },
            }}
            scrollStep={47}
          >
            <node
              style={{ width: 925, flexDirection: "column", flexShrink: 0 }}
            >
              {rows.map((row, i) => (
                <SettingRow
                  key={i}
                  row={row}
                  values={values}
                  listening={listening}
                  onChange={change}
                  onListen={setListening}
                />
              ))}
            </node>
          </node>
        </node>
        <node
          style={{
            flexShrink: 0,
            flexDirection: "column",
            gap: 25,
            margin: { left: 43, top: 307 },
          }}
        >
          <SideButton
            label="GAMMA CORRECTION"
            k="Z"
            onClick={() => open("gamma")}
          />
          <SideButton
            label="CONTROL SCHEME"
            k="X"
            onClick={() => open("controls")}
          />
        </node>
      </node>
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 917,
          justifyContent: "center",
        }}
      >
        <CutButton label="DEFAULTS" width={200} height={53} onClick={restore} />
      </node>
      <node
        style={{
          positionType: "absolute",
          left: 0,
          right: 0,
          top: 1043,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
        }}
      >
        <text style={{ ...T.micro, fontSize: 8 }}>
          SBL 102 CKC 151 CC10 A55
        </text>
        <svg viewBox="0 0 30 8" style={{ width: 30, height: 8 }}>
          <polygon points={[0, 4, 9, 0, 9, 8]} fill={C.redDim} />
          <rect x={9} y={3} width={21} height={2} fill={C.redDim} />
        </svg>
      </node>
      <Badge />
      <Hints>
        <Hint k="ESC" label="Close" onClick={onClose} />
        <Hint k="F1" label="Restore Defaults" onClick={restore} />
        <Hint k="mouse" label="Select" />
      </Hints>
    </node>
  );
}

/** The tab bar: [1] ‹tabs› [3], the current one cyan. */
function Tabs({
  tab,
  onPick,
  onStep,
}: {
  tab: TabId;
  onPick: (id: TabId) => void;
  onStep: (d: number) => void;
}) {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 42,
      }}
    >
      <button onClick={() => onStep(-1)}>
        <Keycap k="1" />
      </button>
      <node style={{ flexDirection: "row", gap: 22, alignItems: "center" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            style={{ height: 36, justifyContent: "center" }}
            hoverStyle={{ backgroundColor: "rgba(255, 93, 81, 0.06)" }}
          >
            <text
              style={{
                fontSize: 24,
                color: t.id === tab ? C.cyan : C.red,
                lineBreak: "noWrap",
              }}
            >
              {t.label}
            </text>
          </button>
        ))}
      </node>
      <button onClick={() => onStep(1)}>
        <Keycap k="3" />
      </button>
    </node>
  );
}

const SIDE_FRAME = "#5b1a20";

/** GAMMA CORRECTION / CONTROL SCHEME: a plate with a raised tab on its top
 *  edge and a rail down its left. */
function SideButton({
  label,
  k,
  onClick,
}: {
  label: string;
  k: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{ width: 255, height: 49 }}>
      <node
        style={{
          ...chamfer(C.button, 10, SIDE_FRAME, 1),
          positionType: "absolute",
          left: 0,
          top: 4,
          right: 0,
          bottom: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flexEnd",
          gap: 14,
          padding: { right: 14 },
        }}
        hoverStyle={chamfer("#1a1a2c", 10, C.cyan, 1)}
      >
        <node
          style={{
            positionType: "absolute",
            left: 4,
            top: 5,
            bottom: 5,
            width: 2,
            backgroundColor: SIDE_FRAME,
          }}
        />
        <text style={{ fontSize: 21, color: C.cyan, letterSpacing: 0.4 }}>
          {label}
        </text>
        <Keycap k={k} />
      </node>
      <node
        style={{
          ...chamfer(C.button, 5, SIDE_FRAME, 1, "tr"),
          border: { top: 1, left: 1, right: 1 },
          positionType: "absolute",
          left: 0,
          top: 0,
          width: 72,
          height: 6,
        }}
      />
    </button>
  );
}

/** The version badge and the small print, bottom left. */
function Badge() {
  return (
    <>
      <node
        style={{
          positionType: "absolute",
          left: 50,
          top: 993,
          width: 28,
          height: 38,
          border: 2,
          borderColor: C.redDim,
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <text
          style={{
            fontFamily: F.bold,
            fontSize: 14,
            color: C.redDim,
            lineHeight: 0.95,
            textAlign: "center",
          }}
        >
          {"V\n85"}
        </text>
      </node>
      <text
        style={{
          ...T.micro,
          fontSize: 7,
          positionType: "absolute",
          left: 86,
          top: 998,
          width: 460,
        }}
      >
        {
          "The data you enter on an SCPD terminal will only be used for the purpose you entered it for. Your personal data is protected in accordance with the 2088 Privacy Act, the Sable City Charter and Tenkai Corporate Policy 7. Terminal sessions may be retained for the length of your residency."
        }
      </text>
    </>
  );
}
