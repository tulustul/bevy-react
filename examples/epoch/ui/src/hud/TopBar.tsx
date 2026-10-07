import { useEffect, useState } from "react";
import { income, year, type Game } from "../game";
import { C, Fonts, OWNS_POINTER, caps, signed } from "../theme";
import { Amount, RoundButton } from "../ui/kit";

export type ScreenId = "tech" | "reports" | "rankings";

/** The strip across the top: the empire's yields per turn and treasuries,
 *  then the turn, the year and the time. */
export function TopBar({
  game,
  player,
  net,
}: {
  game: Game;
  player: string;
  net: number;
}) {
  const pay = income(game, player);
  return (
    <node
      style={{
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        gap: 22,
        padding: { horizontal: 16 },
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [{ color: "#15233a" }, { color: "#070d16" }],
        },
        border: { bottom: 1 },
        borderColor: C.goldLo,
        boxShadow: { color: "rgba(0, 0, 0, 0.6)", blurRadius: 10, yOffset: 2 },
      }}
      hoverStyle={OWNS_POINTER}
    >
      <Amount icon="science" color={C.science} value={signed(pay.science)} />
      <Amount icon="culture" color={C.culture} value={signed(pay.culture)} />
      <Amount
        icon="gold"
        color={C.coin}
        value={`${Math.floor(game.gold)} (${signed(net)})`}
      />
      <Amount
        icon="faith"
        color={C.faith}
        value={`${Math.floor(game.faith)} (${signed(pay.faith)})`}
      />
      <node style={{ flexGrow: 1 }} />
      <text
        style={{
          ...caps,
          fontFamily: Fonts.display,
          fontSize: 13,
          color: C.goldHi,
        }}
      >
        {`TURN ${game.turn}`}
      </text>
      <text style={{ fontSize: 13, color: C.text }}>{year(game.turn)}</text>
      <Clock />
    </node>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  return <text style={{ fontSize: 13, color: C.muted }}>{`${hh}:${mm}`}</text>;
}

/** The round buttons under the top-left corner: the empire's screens. */
export function LaunchBar({
  onOpen,
  research,
}: {
  onOpen: (s: ScreenId) => void;
  research: boolean;
}) {
  return (
    <node
      style={{
        positionType: "absolute",
        left: 12,
        top: 40,
        flexDirection: "row",
        gap: 10,
        padding: { horizontal: 10, vertical: 7 },
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            { color: "rgba(27, 45, 68, 0.95)" },
            { color: "rgba(13, 24, 38, 0.95)" },
          ],
        },
        border: 1,
        borderColor: C.goldLo,
        borderRadius: 27,
        boxShadow: { color: "rgba(0, 0, 0, 0.5)", blurRadius: 10, yOffset: 3 },
      }}
      hoverStyle={OWNS_POINTER}
    >
      <RoundButton
        icon="science"
        color={C.science}
        tip="Technology tree"
        active={!research}
        onClick={() => onOpen("tech")}
      />
      <RoundButton
        icon="chart"
        tip="Reports"
        onClick={() => onOpen("reports")}
      />
      <RoundButton
        icon="trophy"
        tip="World rankings"
        onClick={() => onOpen("rankings")}
      />
    </node>
  );
}
