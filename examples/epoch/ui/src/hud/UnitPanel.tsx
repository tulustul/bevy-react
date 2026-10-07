import type { CivInfo, UnitInfo } from "../bevy";
import { useSlideIn } from "../hooks";
import { C, Fonts, OWNS_POINTER, panel, tone } from "../theme";
import { Icon, type IconName } from "../ui/Icon";
import { Amount, Bar, CloseButton, Medallion, RoundButton } from "../ui/kit";

type Order = { icon: IconName; name: string };

const MOVE: Order = { icon: "arrow", name: "Move" };
const FORTIFY: Order = { icon: "shield", name: "Fortify" };
const SLEEP: Order = { icon: "moon", name: "Sleep" };
const SKIP: Order = { icon: "skip", name: "Skip turn" };
const DELETE: Order = { icon: "trash", name: "Delete unit" };

export const UNITS: Record<
  string,
  {
    name: string;
    role: string;
    icon: IconName;
    strength?: number;
    ranged?: number;
    moves: number;
    orders: Order[];
  }
> = {
  warrior: {
    name: "Warrior",
    role: "Melee",
    icon: "strength",
    strength: 20,
    moves: 2,
    orders: [MOVE, FORTIFY, SLEEP, SKIP, DELETE],
  },
  archer: {
    name: "Archer",
    role: "Ranged",
    icon: "bow",
    strength: 15,
    ranged: 25,
    moves: 2,
    orders: [
      MOVE,
      { icon: "bow", name: "Ranged attack" },
      FORTIFY,
      SKIP,
      DELETE,
    ],
  },
  scout: {
    name: "Scout",
    role: "Recon",
    icon: "eye",
    strength: 10,
    moves: 3,
    orders: [MOVE, { icon: "map", name: "Explore" }, SLEEP, SKIP, DELETE],
  },
  settler: {
    name: "Settler",
    role: "Civilian",
    icon: "flag",
    moves: 2,
    orders: [MOVE, { icon: "city", name: "Found city" }, SLEEP, SKIP, DELETE],
  },
  builder: {
    name: "Builder",
    role: "Civilian · 3 charges",
    icon: "production",
    moves: 2,
    orders: [
      MOVE,
      { icon: "production", name: "Build farm" },
      SLEEP,
      SKIP,
      DELETE,
    ],
  },
};

/** Bottom left, while a unit is selected: its portrait, numbers and
 *  orders. (Orders just dismiss it: nothing is played here.) */
export function UnitPanel({
  unit,
  civ,
  onClose,
}: {
  unit: UnitInfo;
  civ: CivInfo;
  onClose: () => void;
}) {
  const def = UNITS[unit.kind];
  const enter = useSlideIn(0, 70);
  const mine = civ.player;
  return (
    <node
      style={{
        ...panel,
        ...enter,
        positionType: "absolute",
        left: 12,
        bottom: 12,
        width: 400,
        padding: 12,
        flexDirection: "column",
        gap: 12,
      }}
      hoverStyle={OWNS_POINTER}
    >
      <node style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
        <Medallion
          size={88}
          inner={tone(civ.color, 1.3)}
          outer={tone(civ.color, 0.35)}
        >
          <Icon name={def.icon} size={42} color="#ffffff" />
        </Medallion>
        <node style={{ flexDirection: "column", gap: 5, flexGrow: 1 }}>
          <node style={{ flexDirection: "row", alignItems: "center" }}>
            <text
              style={{
                flexGrow: 1,
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 20,
                letterSpacing: 1.5,
                color: C.goldHi,
              }}
            >
              {def.name.toUpperCase()}
            </text>
            <CloseButton onClick={onClose} />
          </node>
          <text
            style={{ fontSize: 12, color: C.muted }}
          >{`${def.role} · ${civ.name}`}</text>
          <node style={{ flexDirection: "row", gap: 16, margin: { top: 2 } }}>
            {def.strength && (
              <Amount
                icon="strength"
                color={C.text}
                value={`${def.strength}`}
              />
            )}
            {def.ranged && (
              <Amount icon="bow" color={C.text} value={`${def.ranged}`} />
            )}
            <Amount
              icon="movement"
              color={C.text}
              value={`${def.moves}/${def.moves}`}
            />
          </node>
          <Bar value={mine ? 1 : 0.7} width={240} height={8} color={C.good} />
        </node>
      </node>
      {mine && (
        <node
          style={{
            flexDirection: "row",
            gap: 10,
            padding: { top: 10 },
            border: { top: 1 },
            borderColor: C.goldLine,
            justifyContent: "center",
          }}
        >
          {def.orders.map((o) => (
            <RoundButton
              key={o.name}
              icon={o.icon}
              tip={o.name}
              tipSide="top"
              onClick={onClose}
            />
          ))}
        </node>
      )}
    </node>
  );
}
