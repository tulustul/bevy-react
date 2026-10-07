import type { CityInfo, CivInfo } from "../bevy";
import {
  ITEMS,
  item,
  plural,
  turnsLeft,
  type Action,
  type Game,
  type Item,
} from "../game";
import { useSlideIn } from "../hooks";
import {
  C,
  Fonts,
  OWNS_POINTER,
  YIELDS,
  caps,
  fmt,
  panel,
  signed,
  tone,
} from "../theme";
import { Icon, type IconName } from "../ui/Icon";
import { Bar, CloseButton, Header, Medallion } from "../ui/kit";

const WIDTH = 360;

/** The city screen, down the left side: its yields from the tiles it
 *  works, its growth, what it is building and what it could build next. */
export function CityPanel({
  city,
  civ,
  game,
  dispatch,
  onClose,
}: {
  city: CityInfo;
  civ: CivInfo;
  game: Game;
  dispatch: (a: Action) => void;
  onClose: () => void;
}) {
  const enter = useSlideIn(-80, 0);
  const mine = civ.player;
  const surplus = city.yields.food - city.population * 2;
  const built = game.built[city.id] ?? [];
  const housing = city.population + 2 + (built.includes("granary") ? 2 : 0);
  const amenities = 2 + (city.capital ? 2 : 0);
  const unhappy = Math.ceil(city.population / 2);
  const growth = ((game.turn * 7 + city.population * 13) % 20) / 20;
  return (
    <node
      style={{
        ...panel,
        ...enter,
        positionType: "absolute",
        left: 12,
        top: 44,
        bottom: 12,
        width: WIDTH,
        flexDirection: "column",
      }}
      hoverStyle={OWNS_POINTER}
    >
      <node
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          padding: { horizontal: 12, vertical: 10 },
          borderRadius: { top: 3, right: 3 },
          backgroundGradient: {
            type: "linear",
            angle: 180,
            stops: [
              { color: tone(civ.color, 0.9) },
              { color: tone(civ.color, 0.35) },
            ],
          },
          border: { bottom: 1 },
          borderColor: C.gold,
        }}
      >
        <Medallion
          size={48}
          inner={C.slate}
          outer={C.ink}
          progress={growth}
          ring={C.food}
        >
          <text style={{ fontSize: 17, fontWeight: "bold", color: C.text }}>
            {`${city.population}`}
          </text>
        </Medallion>
        <node style={{ flexDirection: "column", flexGrow: 1, gap: 1 }}>
          <node style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {city.capital && <Icon name="star" size={15} color={C.goldHi} />}
            <text
              style={{
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 21,
                letterSpacing: 1.5,
                color: "#ffffff",
                textShadow: {
                  color: "rgba(0, 0, 0, 0.6)",
                  offsetX: 0,
                  offsetY: 1,
                },
              }}
            >
              {city.name.toUpperCase()}
            </text>
          </node>
          <text style={{ fontSize: 12, color: tone(civ.color, 1.6) }}>
            {city.capital ? `Capital of ${civ.name}` : civ.name}
          </text>
        </node>
        <CloseButton onClick={onClose} />
      </node>

      <node
        style={{
          flexDirection: "row",
          justifyContent: "spaceBetween",
          padding: { horizontal: 16, vertical: 12 },
          backgroundColor: "rgba(0, 0, 0, 0.25)",
        }}
      >
        {YIELDS.map((y) => (
          <node
            key={y.key}
            style={{ flexDirection: "column", alignItems: "center", gap: 3 }}
          >
            <Icon name={y.key} size={20} color={y.color} />
            <text style={{ fontSize: 14, fontWeight: "bold", color: y.color }}>
              {signed(y.key === "food" ? surplus : city.yields[y.key])}
            </text>
          </node>
        ))}
      </node>

      <node style={{ flexDirection: "column", gap: 9, padding: 14 }}>
        <Stat
          icon="food"
          color={C.food}
          label="Growth"
          value={plural(Math.max(1, Math.ceil((1 - growth) * 12)), "turn")}
          fill={growth}
        />
        <Stat
          icon="housing"
          color="#7ec8c0"
          label="Housing"
          value={`${city.population} / ${housing}`}
          fill={city.population / housing}
        />
        <Stat
          icon="amenities"
          color={amenities >= unhappy ? C.good : C.bad}
          label="Amenities"
          value={`${amenities} / ${unhappy}`}
          fill={Math.min(1, amenities / unhappy)}
        />
        <Stat
          icon="map"
          color={C.muted}
          label="Territory"
          value={`${city.tiles} tiles`}
        />
      </node>

      {mine ? (
        <Production city={city} game={game} dispatch={dispatch} />
      ) : (
        <node style={{ padding: 14 }}>
          <text style={{ fontSize: 12, color: C.muted }}>
            {`A city of ${civ.name}. Its works are hidden from you.`}
          </text>
        </node>
      )}
    </node>
  );
}

function Stat({
  icon,
  color,
  label,
  value,
  fill,
}: {
  icon: IconName;
  color: string;
  label: string;
  value: string;
  fill?: number;
}) {
  return (
    <node style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon name={icon} size={16} color={color} />
      <text style={{ width: 82, fontSize: 12, color: C.text }}>{label}</text>
      <node style={{ flexGrow: 1 }}>
        {fill !== undefined && <Bar value={fill} width={150} color={color} />}
      </node>
      <text style={{ fontSize: 12, fontWeight: "semibold", color: C.text }}>
        {value}
      </text>
    </node>
  );
}

function Production({
  city,
  game,
  dispatch,
}: {
  city: CityInfo;
  game: Game;
  dispatch: (a: Action) => void;
}) {
  const now = game.building[city.id];
  const current = item(now.item);
  const built = game.built[city.id] ?? [];
  const rate = city.yields.production;
  const groups = (["District", "Building", "Unit"] as const).map((kind) => ({
    kind,
    items: ITEMS.filter((i) => i.kind === kind && !built.includes(i.id)),
  }));
  return (
    <node
      style={{
        flexDirection: "column",
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
      }}
    >
      <node
        style={{ padding: { horizontal: 14 }, flexDirection: "column", gap: 8 }}
      >
        <Header color={C.production}>Producing</Header>
        <node style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Medallion
            size={46}
            progress={now.progress / current.cost}
            ring={C.production}
          >
            <Icon name={current.icon} size={20} color={C.production} />
          </Medallion>
          <node style={{ flexDirection: "column", gap: 2, flexGrow: 1 }}>
            <text
              style={{ fontSize: 14, fontWeight: "semibold", color: C.text }}
            >
              {current.name}
            </text>
            <text style={{ fontSize: 12, color: C.production }}>
              {`${plural(turnsLeft(current.cost, now.progress, rate), "turn")} · ${fmt(now.progress)}/${current.cost}`}
            </text>
          </node>
        </node>
        {built.length > 0 && (
          <node style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
            {built.map((id) => (
              <node
                key={id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  padding: { horizontal: 7, vertical: 3 },
                  borderRadius: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                }}
              >
                <Icon name={item(id).icon} size={11} color={C.muted} />
                <text style={{ fontSize: 11, color: C.muted }}>
                  {item(id).name}
                </text>
              </node>
            ))}
          </node>
        )}
        <Header>Choose production</Header>
      </node>
      <node
        style={{
          flexGrow: 1,
          flexShrink: 1,
          minHeight: 0,
          overflowY: "scroll",
          flexDirection: "column",
          padding: { horizontal: 10, bottom: 10 },
          scrollbar: {
            thickness: 6,
            position: "float",
            thumb: { backgroundColor: C.goldLo, borderRadius: 3 },
          },
        }}
      >
        {groups.map((g) => (
          <node
            key={g.kind}
            style={{ flexDirection: "column", gap: 4, margin: { top: 8 } }}
          >
            <text
              style={{ ...caps, color: C.muted, margin: { left: 4 } }}
            >{`${g.kind}s`}</text>
            {g.items.map((it) => (
              <Choice
                key={it.id}
                it={it}
                turns={turnsLeft(it.cost, 0, rate)}
                active={it.id === current.id}
                onClick={() =>
                  dispatch({ type: "produce", city: city.id, item: it.id })
                }
              />
            ))}
          </node>
        ))}
      </node>
    </node>
  );
}

function Choice({
  it,
  turns,
  active,
  onClick,
}: {
  it: Item;
  turns: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: { horizontal: 8, vertical: 6 },
        borderRadius: 3,
        border: 1,
        borderColor: active ? C.production : "rgba(255, 255, 255, 0.06)",
        backgroundColor: active
          ? "rgba(240, 155, 61, 0.16)"
          : "rgba(255, 255, 255, 0.03)",
      }}
      hoverStyle={{
        backgroundColor: "rgba(95, 191, 244, 0.14)",
        borderColor: C.slateHi,
      }}
    >
      <node
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: C.ink,
          border: 1,
          borderColor: C.goldLo,
        }}
      >
        <Icon name={it.icon} size={16} color={C.goldHi} />
      </node>
      <node style={{ flexDirection: "column", flexGrow: 1, gap: 1 }}>
        <text style={{ fontSize: 13, fontWeight: "semibold", color: C.text }}>
          {it.name}
        </text>
        <text style={{ fontSize: 11, color: C.muted }}>{it.effect}</text>
      </node>
      <node style={{ flexDirection: "column", alignItems: "flexEnd", gap: 1 }}>
        <node style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Icon name="production" size={11} color={C.production} />
          <text
            style={{ fontSize: 12, color: C.production }}
          >{`${it.cost}`}</text>
        </node>
        <text style={{ fontSize: 11, color: C.muted }}>
          {plural(turns, "turn")}
        </text>
      </node>
    </button>
  );
}
