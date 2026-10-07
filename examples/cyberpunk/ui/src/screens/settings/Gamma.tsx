import { useKeys } from "../../hooks";
import { sfx } from "../../sound";
import { C, F, chamfer } from "../../theme";
import { EdgeRails } from "../../ui/decor";
import { FILL, Hint, Hints } from "../../ui/kit";
import {
  WORDMARK_ASPECT,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from "../../ui/wordmark-path";
import { GAMMA } from "./data";
import { Backdrop, RowFrame, STAGE, SliderBar, SubHeader } from "./rows";
import { setSetting, useSettings } from "./store";

/** GAMMA CORRECTION: the wordmark on black in three slices of rising
 *  brightness, seen through the `gamma` filter at the chosen value — the
 *  same curve the setting puts on the world (`settings.rs`). Esc returns to
 *  the settings. */
export function Gamma({ onBack }: { onBack: () => void }) {
  const gamma = Number(useSettings().gamma);
  const back = () => {
    sfx("back");
    onBack();
  };
  useKeys((e) => {
    if (e.key === "Escape") back();
  });
  return (
    <node style={FILL}>
      <Backdrop />
      <SubHeader title="GAMMA CORRECTION" />
      <EdgeRails />
      <node style={STAGE}>
        <TestImage gamma={gamma} />
        <text
          style={{
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 764,
            fontSize: 25,
            fontFamily: F.semibold,
            color: C.red,
            textAlign: "center",
          }}
        >
          Raise or lower the gamma until the mark on the left is only just
          visible.
        </text>
        <node
          style={{
            positionType: "absolute",
            left: 510,
            top: 827,
            width: 925,
            flexDirection: "column",
          }}
        >
          <RowFrame label={GAMMA.label}>
            <SliderBar
              row={GAMMA}
              value={gamma}
              onChange={(v) => setSetting(GAMMA.id, v)}
            />
          </RowFrame>
        </node>
      </node>
      <Hints>
        <Hint k="mouse" label="SELECT" />
        <Hint k="ESC" label="BACK" onClick={back} />
      </Hints>
    </node>
  );
}

/** Where each slice of the mark ends (its share of the width), and how
 *  bright it is: all but black, a dim grey, white. */
const SLICES: [number, string][] = [
  [0.36, "#0a0a0a"],
  [0.68, "#404040"],
  [1, "#ffffff"],
];

/** The black field in its red frame (a heavy bar down the right, a thinner
 *  one down the lower left), the mark in it under the filter. */
function TestImage({ gamma }: { gamma: number }) {
  const width = 950;
  return (
    <>
      <node
        style={{
          ...chamfer(C.red, 8, undefined, 1, "tl"),
          positionType: "absolute",
          left: 329,
          top: 200,
          width: 8,
          height: 536,
        }}
      />
      <node
        style={{
          positionType: "absolute",
          left: 335,
          top: 103,
          width: 1250,
          height: 633,
          border: { top: 2, left: 2, bottom: 3 },
          borderColor: C.red,
        }}
      >
        <node
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#000000",
            flexDirection: "column",
            alignItems: "center",
            padding: { top: 158, right: 30 },
            filter: { name: "gamma", params: { value: gamma } },
          }}
        >
          <node style={{ width, height: width / WORDMARK_ASPECT + 40 }}>
            {SLICES.map(([end, color], i) => {
              const start = i === 0 ? 0 : SLICES[i - 1][0];
              return (
                <node
                  key={color}
                  style={{
                    positionType: "absolute",
                    left: start * width,
                    width: (end - start) * width,
                    top: 0,
                    bottom: 0,
                    overflowX: "clip",
                    overflowY: "clip",
                  }}
                >
                  <Mark
                    width={width}
                    color={color}
                    style={{ left: -start * width }}
                  />
                </node>
              );
            })}
          </node>
          {/* The notch at the bottom of the field. */}
          <node
            style={{
              positionType: "absolute",
              left: 627,
              bottom: 0,
              width: 7,
              height: 56,
              border: { top: 1, left: 1, right: 1 },
              borderColor: C.red,
            }}
          />
        </node>
      </node>
      <node
        style={{
          ...chamfer(C.red, 22, undefined, 1, "br"),
          positionType: "absolute",
          left: 1583,
          top: 103,
          width: 22,
          height: 633,
        }}
      >
        <node
          style={{
            positionType: "absolute",
            left: 2,
            top: 132,
            height: 370,
            width: 1,
            backgroundColor: "#3a1014",
          }}
        />
      </node>
    </>
  );
}

/** The wordmark and its year line in one flat colour. */
function Mark({
  width,
  color,
  style,
}: {
  width: number;
  color: string;
  style: { left: number };
}) {
  const height = width / WORDMARK_ASPECT;
  const digit = width * 0.052;
  return (
    <node
      style={{
        positionType: "absolute",
        top: 0,
        width,
        height: height + 40,
        ...style,
      }}
    >
      <svg viewBox={WORDMARK_VIEWBOX} style={{ width, height }}>
        <path d={WORDMARK_PATH} fill={color} />
      </svg>
      <node
        style={{
          positionType: "absolute",
          left: width * 0.36,
          top: height * 0.8,
          flexDirection: "row",
          alignItems: "flexEnd",
          gap: digit * 0.5,
        }}
      >
        {["2", "0", "9", "1"].map((d, i) => (
          <node
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "flexEnd",
              gap: digit * 0.5,
            }}
          >
            <text
              style={{
                fontFamily: F.semibold,
                fontSize: digit,
                color,
                lineBreak: "noWrap",
              }}
            >
              {d}
            </text>
            {i < 3 && (
              <node
                style={{
                  width: digit * 1.6,
                  height: 2,
                  margin: { bottom: digit * 0.22 },
                  backgroundColor: color,
                }}
              />
            )}
          </node>
        ))}
      </node>
    </node>
  );
}
