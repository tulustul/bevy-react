import type { ReactNode } from "react";
import { useEnter } from "../../hooks";
import { LIFEPATHS, playtime, type Save } from "../../store";
import { C, F, chamfer } from "../../theme";
import { Datashard, LifepathIcon } from "./icons";

export const ROW_WIDTH = 1035;
export const ROW_HEIGHT = 104;
/** Row to row, px. */
export const ROW_PITCH = ROW_HEIGHT + 4;
/** Where a row's text starts, from its left edge (the overwrite plate lands
 *  there too). */
export const TEXT_LEFT = 186;

const PLATE = "rgba(13, 18, 27, 0.74)";
const LINE = "rgba(255, 93, 81, 0.26)";

/** One slot of the list: a cut-corner plate over the world, framed bright
 *  red while selected (the one hovered last). Slides in when it mounts, so
 *  a fresh save arrives visibly. */
function Slot({
  index,
  selected,
  onSelect,
  onClick,
  children,
}: {
  index: number;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
  children: ReactNode;
}) {
  const enter = useEnter(-28, 40 * Math.min(index, 8));
  return (
    <button
      onPointerEnter={onSelect}
      onClick={onClick}
      style={{
        ...chamfer(PLATE, 16, selected ? C.red : LINE, 2),
        width: ROW_WIDTH,
        height: ROW_HEIGHT,
        flexShrink: 0,
        flexDirection: "row",
        alignItems: "center",
        padding: { left: 1 },
        ...enter,
      }}
    >
      {children}
    </button>
  );
}

/** The picture well left of a row: framed, its corner cut like the row's. */
function Thumb({
  selected,
  children,
}: {
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <node
      style={{
        ...chamfer("rgba(6, 8, 13, 0.6)", 14, selected ? C.red : LINE, 1),
        width: 170,
        height: 96,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </node>
  );
}

const line = {
  fontSize: 24,
  fontFamily: F.semibold,
  color: C.red,
  lineBreak: "noWrap",
} as const;

/** A save: its world's snapshot, the quest and the slot's name, where it
 *  was made, who, how far along, when. */
export function SaveRow({
  save,
  index,
  selected,
  onSelect,
  onClick,
}: {
  save: Save;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const { lifepath } = save.character;
  return (
    <Slot
      index={index}
      selected={selected}
      onSelect={onSelect}
      onClick={onClick}
    >
      <Thumb selected={selected}>
        <portal
          target={`shot-${lifepath}`}
          style={{ width: 168, height: 94, cache: "never" }}
        />
      </Thumb>
      <node
        style={{
          flexGrow: 1,
          height: "100%",
          flexDirection: "column",
          justifyContent: "spaceBetween",
          padding: { left: 15, right: 26, top: 14, bottom: 7 },
        }}
      >
        <node style={{ flexDirection: "row", alignItems: "center" }}>
          <text style={{ ...line, color: C.cyan }}>{save.quest}</text>
          <text style={{ ...line, margin: { horizontal: 11 } }}>-</text>
          <text style={line}>{save.name}</text>
          <node style={{ flexGrow: 1 }} />
          <text style={line}>{playtime(save.playtime)}</text>
        </node>
        <node style={{ flexDirection: "row", alignItems: "center" }}>
          <text style={{ ...line, fontSize: 23 }}>{save.location}</text>
          <node style={{ width: 27 }} />
          <LifepathIcon lifepath={lifepath} />
          <text style={{ ...line, fontSize: 23, margin: { left: 7 } }}>
            {LIFEPATHS.find((l) => l.id === lifepath)?.name}
          </text>
          <text style={{ ...line, fontSize: 23, margin: { left: 28 } }}>
            Level {save.level}
          </text>
          <node style={{ flexGrow: 1 }} />
          <text style={{ ...line, fontSize: 23 }}>{save.date}</text>
        </node>
      </node>
    </Slot>
  );
}

/** The first slot when saving: a blank datashard. */
export function NewSaveRow({
  selected,
  onSelect,
  onClick,
}: {
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  return (
    <Slot index={0} selected={selected} onSelect={onSelect} onClick={onClick}>
      <Thumb selected={selected}>
        <Datashard width={128} />
        <svg
          viewBox="0 0 14 14"
          style={{
            positionType: "absolute",
            right: 30,
            top: 12,
            width: 14,
            height: 14,
          }}
        >
          <polyline
            points={[7, 0, 7, 14]}
            stroke={C.red}
            strokeWidth={1.4}
            fill="none"
          />
          <polyline
            points={[0, 7, 14, 7]}
            stroke={C.red}
            strokeWidth={1.4}
            fill="none"
          />
        </svg>
      </Thumb>
      <text
        style={{
          ...line,
          fontSize: 29,
          alignSelf: "flexStart",
          margin: { left: 15, top: 15 },
        }}
      >
        New Save
      </text>
    </Slot>
  );
}
