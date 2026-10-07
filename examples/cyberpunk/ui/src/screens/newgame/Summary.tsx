import { useEffect, useState } from "react";
import {
  interpolate,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "bevy-react";
import { useEnter, useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { C, F, T, chamfer } from "../../theme";
import { FILL, Header, Hint, Hints } from "../../ui/kit";
import { IdCard } from "./IdCard";
import { StepIcon } from "./glyphs";
import { Chrome, NavButtons } from "./parts";
import type { StepProps } from "./NewGame";

const PANEL = "#cb403b";

/** SUMMARY: the finished ID card and the BIOMONITOR PANEL syncing to 100%
 *  (a shared value Bevy runs; the digits roll on its clock). START (or F)
 *  begins the game. */
export function Summary({
  character,
  onChange,
  back,
  onStart,
}: StepProps & { onStart: () => void }) {
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState(false);
  const enter = useEnter(40, 120, 360);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      350,
      withTiming(1, { duration: 2400, easing: "easeInOut" }),
      (finished) => finished && setDone(true),
    );
  }, [progress]);
  const start = () => {
    sfx("confirm");
    onStart();
  };
  useKeys((e) => {
    if (editing) return;
    if (e.key === "Escape") back();
    else if (e.code === "KeyF" || e.key === "Enter") start();
  });

  return (
    <node style={FILL}>
      <Chrome />
      <Header
        title="SUMMARY"
        caption="THE FILE IS OPEN. SABLE CITY WILL WRITE THE REST."
        icon={<StepIcon kind="summary" />}
        step={4}
      />
      <IdCard
        character={character}
        onChange={onChange}
        onEditing={setEditing}
        style={{ positionType: "absolute", left: 420, top: 196 }}
      />
      <node
        style={{
          positionType: "absolute",
          right: 215,
          top: 360,
          ...enter,
          width: 592,
          flexDirection: "column",
          gap: 6,
        }}
      >
        <node style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <node style={{ flexDirection: "column", gap: 2 }}>
            {[22, 14, 20, 10].map((w, i) => (
              <node
                key={i}
                style={{ width: w, height: 2, backgroundColor: C.redDim }}
              />
            ))}
          </node>
          <text style={{ ...T.micro, fontSize: 5.5, color: C.redDim }}>
            {
              "BIOMONITOR 7.1\nNEURAL LINK STABLE\nCERTIFIED SCPD UNIT\nNO USER SERVICEABLE PARTS"
            }
          </text>
        </node>
        <node
          style={{
            ...chamfer("#1b1017", 30, PANEL, 2),
            height: 181,
            flexDirection: "column",
            padding: { left: 44, right: 34, top: 14, bottom: 12 },
          }}
        >
          <node
            style={{
              positionType: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 26,
              backgroundColor: PANEL,
            }}
          />
          <node
            style={{
              positionType: "absolute",
              right: -2,
              top: 24,
              bottom: 40,
              width: 4,
              backgroundColor: PANEL,
            }}
          />
          <text
            style={{
              fontSize: 29,
              fontFamily: F.semibold,
              color: C.red,
              lineBreak: "noWrap",
            }}
          >
            BIOMONITOR PANEL
          </text>
          <text
            style={{
              fontSize: 21,
              color: done ? "#d9483f" : "#b83b35",
              margin: { top: 14 },
              lineBreak: "noWrap",
            }}
          >
            {done ? "COMPLETE" : "CALIBRATING..."}
          </text>
          <node
            style={{
              height: 3,
              margin: { top: 10, right: 96 },
              backgroundColor: "#3a151a",
            }}
          >
            <node
              style={{
                height: 3,
                width: { animated: interpolate(progress, [0, 1], [0, 418]) },
                backgroundColor: C.red,
              }}
            />
          </node>
          <node style={{ flexGrow: 1 }} />
          <node
            style={{
              flexDirection: "row",
              alignItems: "flexEnd",
              justifyContent: "spaceBetween",
            }}
          >
            <text style={{ ...T.micro, fontSize: 6.5, color: C.red }}>
              {
                "ONLY SCPD-CERTIFIED BIOTECHS AND CLASS-4 OFFICERS MAY\nCALIBRATE, ACCESS OR DISABLE THIS DEVICE."
              }
            </text>
            <Percent value={progress} />
          </node>
        </node>
      </node>
      <NavButtons onBack={back} onNext={start} next="START" />
      <Hints>
        <Hint k="mouse" label="SELECT" />
      </Hints>
    </node>
  );
}

const DIGIT = 18;
const EPS = 0.0001;

/** "000%" rolling up to "100%" on `value` (0..1): each digit is a column
 *  of 0-9 in a clipped window, stepped by a piecewise-constant
 *  `interpolate` — no React render per tick. */
function Percent({ value }: { value: SharedValue }) {
  const column = (digit: (k: number) => number) => {
    const input: number[] = [];
    const output: number[] = [];
    for (let k = 0; k < 100; k++) {
      input.push(k / 100, (k + 1) / 100 - EPS);
      output.push(-digit(k) * DIGIT, -digit(k) * DIGIT);
    }
    return interpolate(value, [...input, 1], [...output, -digit(100) * DIGIT]);
  };
  const digits = [
    (k: number) => Math.floor(k / 100),
    (k: number) => Math.floor(k / 10) % 10,
    (k: number) => k % 10,
  ];
  const font = {
    fontSize: 19,
    fontFamily: F.bold,
    color: C.red,
    lineHeight: { px: DIGIT },
  } as const;
  return (
    <node
      style={{
        flexDirection: "row",
        alignItems: "center",
        margin: { bottom: 18 },
      }}
    >
      {digits.map((d, i) => (
        <node
          key={i}
          style={{
            width: 10.5,
            height: DIGIT,
            overflowY: "clip",
            justifyContent: "center",
          }}
        >
          <text
            style={{
              ...font,
              textAlign: "center",
              transform: { translateY: { animated: column(d) } },
            }}
          >
            {"0\n1\n2\n3\n4\n5\n6\n7\n8\n9"}
          </text>
        </node>
      ))}
      <text style={{ ...font, lineBreak: "noWrap" }}>%</text>
    </node>
  );
}
