import type { CityInfo, CivInfo, TileInfo, UnitInfo, WorldInfo } from "../bevy";
import { item, turnsLeft, type Game } from "../game";
import { C, Fonts, YIELDS, fmt, panel, tone } from "../theme";
import { Icon } from "../ui/Icon";
import { conic, radial } from "../ui/kit";
import { UNITS } from "./UnitPanel";

export type Selection = { kind: "city" | "unit"; id: string } | null;

/** The city banners and unit flags: screen-space React pinned to points of
 *  the 3D map with `<anchor>`, following it as the camera moves. */
export function Banners({
  world,
  game,
  selection,
  onSelect,
}: {
  world: WorldInfo;
  game: Game;
  selection: Selection;
  onSelect: (s: Selection) => void;
}) {
  const civ = (id: string) => world.civs.find((c) => c.id === id)!;
  return (
    <>
      {world.cities.map((city) => (
        <CityBanner
          key={city.id}
          city={city}
          civ={civ(city.civ)}
          game={game}
          selected={selection?.kind === "city" && selection.id === city.id}
          onClick={() => onSelect({ kind: "city", id: city.id })}
        />
      ))}
      {world.units
        .filter((u) => !u.hidden)
        .map((unit) => (
          <UnitFlag
            key={unit.id}
            unit={unit}
            civ={civ(unit.civ)}
            selected={selection?.kind === "unit" && selection.id === unit.id}
            onClick={() => onSelect({ kind: "unit", id: unit.id })}
          />
        ))}
    </>
  );
}

function CityBanner({
  city,
  civ,
  game,
  selected,
  onClick,
}: {
  city: CityInfo;
  civ: CivInfo;
  game: Game;
  selected: boolean;
  onClick: () => void;
}) {
  const producing = game.building[city.id];
  const it = producing && item(producing.item);
  // Growth is pretend: a fill that creeps on with the turns.
  const growth = ((game.turn * 7 + city.population * 13) % 20) / 20;
  return (
    <anchor
      entity={city.entity}
      style={{ flexDirection: "row", alignItems: "center", height: 28 }}
    >
      <node
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          padding: 3,
          margin: { right: -8 },
          backgroundGradient: conic(growth, C.food),
          zIndex: 1,
        }}
      >
        <node
          style={{
            flexGrow: 1,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: C.ink,
          }}
        >
          <text style={{ fontSize: 13, fontWeight: "bold", color: C.text }}>
            {`${city.population}`}
          </text>
        </node>
      </node>
      <button
        onClick={onClick}
        style={{
          height: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          padding: { left: 14, right: it ? 14 : 10 },
          borderRadius: 3,
          border: 1,
          borderColor: selected ? C.goldHi : tone(civ.color, 1.45),
          backgroundGradient: {
            type: "linear",
            angle: 180,
            stops: [
              { color: tone(civ.color, 1.05) },
              { color: tone(civ.color, 0.55) },
            ],
          },
          boxShadow: selected
            ? { color: "rgba(246, 228, 168, 0.7)", blurRadius: 10 }
            : { color: "rgba(0, 0, 0, 0.55)", blurRadius: 6, yOffset: 2 },
        }}
        hoverStyle={{ borderColor: C.goldHi }}
      >
        {city.capital && <Icon name="star" size={12} color={C.goldHi} />}
        <text
          style={{
            fontFamily: Fonts.display,
            fontWeight: "bold",
            fontSize: 12,
            letterSpacing: 1,
            color: "#ffffff",
            textShadow: { color: "rgba(0, 0, 0, 0.7)", offsetX: 0, offsetY: 1 },
          }}
        >
          {city.name.toUpperCase()}
        </text>
      </button>
      {it && (
        <node
          style={{
            flexDirection: "column",
            alignItems: "center",
            margin: { left: -8 },
          }}
        >
          <node
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              padding: 3,
              backgroundGradient: conic(
                producing.progress / it.cost,
                C.production,
              ),
            }}
          >
            <node
              style={{
                flexGrow: 1,
                borderRadius: 11,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: C.ink,
              }}
            >
              <Icon name={it.icon} size={13} color={C.production} />
            </node>
          </node>
          <node
            style={{
              positionType: "absolute",
              top: 28,
              padding: { horizontal: 4 },
              borderRadius: 3,
              backgroundColor: "rgba(6, 13, 21, 0.85)",
            }}
          >
            <text style={{ fontSize: 10, color: C.production }}>
              {`${turnsLeft(it.cost, producing.progress, city.yields.production)}`}
            </text>
          </node>
        </node>
      )}
    </anchor>
  );
}

function UnitFlag({
  unit,
  civ,
  selected,
  onClick,
}: {
  unit: UnitInfo;
  civ: CivInfo;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <anchor entity={unit.entity} offset={[0, 1.0, 0]}>
      <button
        onClick={onClick}
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          border: 2,
          borderColor: selected ? C.goldHi : "rgba(255, 255, 255, 0.75)",
          backgroundGradient: radial(
            tone(civ.color, 1.2),
            tone(civ.color, 0.45),
          ),
          boxShadow: {
            color: "rgba(0, 0, 0, 0.55)",
            blurRadius: 5,
            yOffset: 2,
          },
        }}
        hoverStyle={{ transform: { scale: 1.12 } }}
      >
        <Icon name={UNITS[unit.kind].icon} size={15} color="#ffffff" />
      </button>
    </anchor>
  );
}

const FEATURES: Record<string, string> = {
  woods: "Woods",
  rainforest: "Rainforest",
};

/** The hovered tile's terrain and yields, pinned beside it: the anchor
 *  follows the ring Bevy puts on the tile under the pointer. */
export function TileTooltip({
  tile,
  cursor,
  world,
}: {
  tile: TileInfo;
  cursor: number;
  world: WorldInfo;
}) {
  const owner = world.civs.find((c) => c.id === tile.owner);
  const city = world.cities.find((c) => c.id === tile.city);
  const unit = world.units.find((u) => u.id === tile.unit);
  const relief = tile.mountains ? "Mountains" : tile.hills ? "Hills" : null;
  const name = [tile.terrain, relief, tile.feature && FEATURES[tile.feature]]
    .filter(Boolean)
    .join(" · ");
  const yields = YIELDS.filter((y) => tile.yields[y.key] > 0);
  return (
    <anchor entity={cursor} style={{ width: 2, height: 2, globalZIndex: 1 }}>
      <node
        style={{
          ...panel,
          positionType: "absolute",
          left: 34,
          bottom: 18,
          padding: { horizontal: 12, vertical: 9 },
          flexDirection: "column",
          gap: 5,
          backgroundGradient: undefined,
          backgroundColor: C.navy,
        }}
      >
        {!tile.revealed ? (
          <text
            style={{
              fontSize: 13,
              fontWeight: "semibold",
              color: C.muted,
              lineBreak: "noWrap",
            }}
          >
            Unexplored lands
          </text>
        ) : (
          <>
            <text
              style={{
                fontSize: 13,
                fontWeight: "semibold",
                color: C.goldHi,
                lineBreak: "noWrap",
              }}
            >
              {name}
            </text>
            {tile.mountains ? (
              <text style={{ fontSize: 12, color: C.muted }}>Impassable</text>
            ) : (
              <node style={{ flexDirection: "row", gap: 10 }}>
                {yields.map((y) => (
                  <node
                    key={y.key}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Icon name={y.key} size={14} color={y.color} />
                    <text
                      style={{
                        fontSize: 12,
                        fontWeight: "semibold",
                        color: y.color,
                      }}
                    >
                      {fmt(tile.yields[y.key])}
                    </text>
                  </node>
                ))}
                {tile.farm && (
                  <text style={{ fontSize: 12, color: C.muted }}>Farm</text>
                )}
              </node>
            )}
            {owner && (
              <text
                style={{
                  fontSize: 12,
                  color: owner.color,
                  lineBreak: "noWrap",
                }}
              >
                {city ? `${owner.name} · ${city.name}` : owner.name}
              </text>
            )}
            {unit && (
              <text style={{ fontSize: 12, color: C.text }}>
                {UNITS[unit.kind].name}
              </text>
            )}
          </>
        )}
      </node>
    </anchor>
  );
}
