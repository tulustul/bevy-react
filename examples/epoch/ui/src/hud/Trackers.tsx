import { civicCost, income, plural, turnsLeft, type Game } from "../game";
import { CIVICS, tech } from "../techs";
import { C, OWNS_POINTER, panel } from "../theme";
import { Icon, type IconName } from "../ui/Icon";
import { Header, Medallion } from "../ui/kit";

const WIDTH = 300;

/** The research and civic in progress, under the launch bar. */
export function Trackers({
  game,
  player,
  onResearch,
}: {
  game: Game;
  player: string;
  onResearch: () => void;
}) {
  const pay = income(game, player);
  const research = game.research ? tech(game.research) : null;
  const banked = research ? (game.progress[research.id] ?? 0) : 0;
  const civicName = CIVICS[game.civic % CIVICS.length];
  const civicNeed = civicCost(game.civic);
  return (
    <node
      style={{
        positionType: "absolute",
        left: 12,
        top: 100,
        width: WIDTH,
        flexDirection: "column",
        gap: 8,
      }}
    >
      {research ? (
        <Tracker
          title="Research"
          color={C.science}
          icon={research.icon}
          name={research.name}
          progress={banked / research.cost}
          detail={plural(turnsLeft(research.cost, banked, pay.science), "turn")}
          hint={`Boost: ${research.boost}`}
          onClick={onResearch}
        />
      ) : (
        <Tracker
          title="Research"
          color={C.science}
          icon="science"
          name="Choose a research"
          progress={0}
          detail="Your scholars are idle"
          onClick={onResearch}
        />
      )}
      <Tracker
        title="Civic"
        color={C.culture}
        icon="culture"
        name={civicName}
        progress={game.civicProgress / civicNeed}
        detail={plural(
          turnsLeft(civicNeed, game.civicProgress, pay.culture),
          "turn",
        )}
      />
    </node>
  );
}

function Tracker({
  title,
  color,
  icon,
  name,
  progress,
  detail,
  hint,
  onClick,
}: {
  title: string;
  color: string;
  icon: IconName;
  name: string;
  progress: number;
  detail: string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <node
      onClick={onClick}
      style={{
        ...panel,
        flexDirection: "column",
        padding: { horizontal: 10, top: 7, bottom: 9 },
        gap: 6,
      }}
      hoverStyle={onClick ? { borderColor: C.gold } : OWNS_POINTER}
    >
      <Header color={color}>{title}</Header>
      <node style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Medallion size={52} progress={progress} ring={color}>
          <Icon name={icon} size={22} color={color} />
        </Medallion>
        <node style={{ flexDirection: "column", gap: 2 }}>
          <text style={{ fontSize: 14, fontWeight: "semibold", color: C.text }}>
            {name}
          </text>
          <text style={{ fontSize: 12, color }}>{detail}</text>
          {hint && (
            <text style={{ width: WIDTH - 90, fontSize: 11, color: C.muted }}>
              {hint}
            </text>
          )}
        </node>
      </node>
    </node>
  );
}
