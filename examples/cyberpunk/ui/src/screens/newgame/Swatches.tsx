import { useEnter } from "../../hooks";
import { sfx } from "../../sound";
import { C, F, T, chamfer } from "../../theme";
import { DataNoise } from "../../ui/decor";
import { Keycap } from "../../ui/kit";
import type { LookOption } from "./data";

/** The color grid a color option opens (SKIN TONE, HAIR COLOR): two rows
 *  of swatches, the chosen one ticked, small print, and CLOSE [ESC]. A
 *  click picks a color and leaves the grid open. */
export function Swatches({
  option,
  value,
  onPick,
  onClose,
}: {
  option: LookOption;
  value: number;
  onPick: (i: number) => void;
  onClose: () => void;
}) {
  const enter = useEnter(30);
  return (
    <>
      <node
        style={{
          positionType: "absolute",
          right: 135,
          ...enter,
          top: 158,
          width: 560,
          flexDirection: "column",
          gap: 6,
        }}
      >
        <node
          style={{
            flexDirection: "row",
            alignItems: "flexEnd",
            gap: 14,
            padding: { left: 28 },
          }}
        >
          <DataNoise seed={41} lines={3} groups={2} style={{ fontSize: 6 }} />
          <text style={{ ...T.menu, fontSize: 27, fontFamily: F.semibold }}>
            {option.label}
          </text>
          <node style={{ flexGrow: 1 }} />
          <text
            style={{
              fontSize: 17,
              fontFamily: F.bold,
              color: C.red,
              lineBreak: "noWrap",
            }}
          >
            SC+
          </text>
        </node>
        <node
          style={{
            ...chamfer("#1a0a0e", 22, "rgba(255, 93, 81, 0.55)", 1),
            flexDirection: "column",
            gap: 12,
            padding: { left: 26, right: 24, top: 10, bottom: 12 },
          }}
        >
          <node
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 5,
              width: 505,
            }}
          >
            {option.swatches!.map((color, i) => (
              <button
                key={color}
                onPointerEnter={() => sfx("hover")}
                onClick={() => {
                  sfx("click");
                  onPick(i);
                }}
                style={{
                  ...chamfer(color, 12),
                  width: 80,
                  height: 80,
                  justifyContent: "flexEnd",
                  alignItems: "flexStart",
                  padding: { top: 8, right: 8 },
                }}
                hoverStyle={{ ...chamfer(color, 12, C.cyan, 2) }}
              >
                <node
                  style={{
                    width: 14,
                    height: 14,
                    border: 2,
                    borderColor: C.red,
                    padding: 2,
                  }}
                >
                  {i === value && (
                    <node
                      style={{ width: 6, height: 6, backgroundColor: C.red }}
                    />
                  )}
                </node>
              </button>
            ))}
          </node>
          <text style={{ ...T.micro, fontSize: 7.5, color: C.redDim }}>
            {`IMAGE NAME:  ${option.id.toUpperCase()}-${(value + 1).toString().padStart(3, "0")}.SWT\nIMAGE TYPE:  KERNEL ISOLATED SAMPLE\nCODEC:  UNCOMPRESSED\nLOAD ADDRESS:  0000A1244`}
          </text>
        </node>
      </node>
      <button
        onClick={onClose}
        style={{
          ...chamfer("#1a0a0e", 12, "rgba(255, 93, 81, 0.55)", 1),
          positionType: "absolute",
          right: 185,
          top: 432,
          width: 200,
          height: 46,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
        hoverStyle={chamfer("#3a1016", 12, C.red, 1)}
      >
        <Keycap k="ESC" />
        <text style={{ ...T.menu, fontSize: 25 }}>CLOSE</text>
      </button>
    </>
  );
}
