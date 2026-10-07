import { useState } from "react";
import { CARD_H } from "./Card";
import { CARDS, openPack, packOf, type CardDef, type Pull } from "./cards";
import { Caption, GRIMOIRE_BUTTON, Hint, Prompt, TopBar } from "./Chrome";
import { Fan } from "./Fan";
import { GlassButton, Label } from "./Glass";
import { Grimoire } from "./Grimoire";
import { useDebug, useWindowSize } from "./hooks";
import { Inspect } from "./Inspect";
import { PACK_H, PACK_W, Pack } from "./Pack";

type Phase = "sealed" | "dealt" | "collecting";
type Screen = "table" | "grimoire";

const VEIL_MS = 1100;

const CAPTIONS = {
  sealed: [
    "This pack is a React component.",
    "Its foil is a WGSL shader running over its pixels.",
  ],
  dealt: [
    "Each card's art is a live 3D world,",
    "filmed into the UI by its own Bevy camera.",
  ],
  grimoire: [
    "Thirteen worlds — each one renders",
    "only while its card is on screen.",
  ],
  inspect: [
    "The same component, now the texture of a real",
    "3D card. Turn it over — it's still React.",
  ],
};

export function App() {
  const win = useWindowSize();
  if (win.width === 0) return null;
  return <Table width={win.width} height={win.height} />;
}

function Table({ width, height }: { width: number; height: number }) {
  const [pulls, setPulls] = useState<Pull[]>(openPack);
  const [packNo, setPackNo] = useState(0);
  const [phase, setPhase] = useState<Phase>("sealed");
  const [packShown, setPackShown] = useState(true);
  /** The pack's cards have landed: a fan remounted now (back from the
   *  grimoire, or from holding a card) is already on the table. */
  const [landed, setLanded] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [owned, setOwned] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [screen, setScreen] = useState<Screen>("table");
  /** The morph key while a screen change is in flight; `null` the rest of
   *  the time, so the screens aren't a full-screen layer for nothing. */
  const [veil, setVeil] = useState<Screen | null>(null);
  const [holding, setHolding] = useState<CardDef | null>(null);

  const center = { x: width / 2, y: height / 2 + 8 };
  const u = Math.max(
    0.5,
    Math.min((width - 160) / 1300, (height - 300) / CARD_H, 1.1),
  );
  const grimoire = {
    x: width - GRIMOIRE_BUTTON.right - GRIMOIRE_BUTTON.width / 2,
    y: GRIMOIRE_BUTTON.top + GRIMOIRE_BUTTON.height / 2,
  };
  const allTurned = phase === "dealt" && revealed.size === pulls.length;

  const reveal = (uid: number) => setRevealed((r) => new Set(r).add(uid));

  // The veil morph needs its carrier to have rendered under the old key
  // before the key flips (a same-commit mount + flip adopts silently), so:
  // promote under the current screen, flip a few frames later, demote after.
  const switchScreen = (next: Screen) => {
    if (veil || next === screen) return;
    // A pack left mid-burn is gone for good: it never comes back sealed.
    if (phase !== "sealed") setPackShown(false);
    setVeil(screen);
    setTimeout(() => {
      setScreen(next);
      setVeil(next);
    }, 60);
    setTimeout(() => setVeil(null), 60 + VEIL_MS + 120);
  };

  const collect = () => {
    setPhase("collecting");
    setTimeout(
      () => {
        setOwned((o) => {
          const next = { ...o };
          for (const p of pulls) next[p.card.id] = (next[p.card.id] ?? 0) + 1;
          return next;
        });
        setPulls(openPack());
        setRevealed(new Set());
        setPackNo((n) => n + 1);
        setPackShown(true);
        setLanded(false);
        setPhase("sealed");
      },
      pulls.length * 90 + 700,
    );
  };

  // Scripted steps for `--shoot` (see `shoot.rs`).
  useDebug("pack", (ids) => setPulls(packOf(ids.split(","))));
  useDebug("flip", (i) => pulls[Number(i)] && reveal(pulls[Number(i)].uid));
  useDebug("flipAll", () => setRevealed(new Set(pulls.map((p) => p.uid))));
  useDebug("collect", collect);
  useDebug("grimoire", () => switchScreen("grimoire"));
  useDebug("own", () =>
    setOwned(Object.fromEntries(CARDS.map((c, i) => [c.id, (i % 3) + 1]))),
  );
  useDebug("hold", (id) => setHolding(CARDS.find((c) => c.id === id) ?? null));

  const caption = holding
    ? CAPTIONS.inspect
    : screen === "grimoire"
      ? CAPTIONS.grimoire
      : phase === "sealed"
        ? CAPTIONS.sealed
        : CAPTIONS.dealt;

  return (
    <node style={{ width: "100%", height: "100%" }}>
      {/* The screens morph into each other through the `veil` shader. */}
      <node
        style={{
          positionType: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          ...(veil && {
            // Live worlds keep moving under the veil: re-capture every frame.
            cache: "never",
            morphFilter: { key: veil, name: "veil", params: {} },
            transition: {
              morphFilter: { duration: VEIL_MS, easing: "easeInOut" },
            },
          }),
        }}
      >
        {/* While a card is held its world shows there alone (each world's
            render target is sized to the one portal showing it). */}
        {holding ? null : screen === "table" ? (
          <>
            {phase !== "sealed" && (
              <Fan
                pulls={pulls}
                center={center}
                u={u}
                revealed={revealed}
                landed={landed}
                collecting={phase === "collecting"}
                grimoire={grimoire}
                onReveal={reveal}
                onInspect={(p) => setHolding(p.card)}
              />
            )}
            {packShown && (
              <node
                style={{
                  positionType: "absolute",
                  left: center.x - PACK_W / 2,
                  top: center.y - PACK_H / 2,
                }}
              >
                <Pack
                  key={packNo}
                  onTear={() => {
                    setPhase("dealt");
                    setTimeout(() => setLanded(true), 1400);
                  }}
                  onGone={() => setPackShown(false)}
                />
              </node>
            )}
          </>
        ) : (
          <Grimoire
            owned={owned}
            width={width}
            height={height}
            onInspect={setHolding}
          />
        )}
      </node>

      {!holding && (
        <>
          <TopBar
            found={Object.keys(owned).length}
            inGrimoire={screen === "grimoire"}
            onGrimoire={() =>
              switchScreen(screen === "table" ? "grimoire" : "table")
            }
          />
          <Prompt>
            {screen === "grimoire" ? (
              <Hint text="Tap a card you own to hold it" />
            ) : allTurned ? (
              <GlassButton onClick={collect}>
                <Label>ADD TO GRIMOIRE</Label>
              </GlassButton>
            ) : phase === "sealed" ? (
              <Hint text="Swipe across the top to tear it open" />
            ) : phase === "dealt" ? (
              <Hint
                text={`Turn the cards  ·  ${revealed.size} of ${pulls.length}`}
              />
            ) : null}
          </Prompt>
        </>
      )}
      <Caption lines={caption} />

      {holding && (
        <Inspect
          key={holding.id}
          card={holding}
          count={owned[holding.id] ?? 0}
          favorite={favorites.has(holding.id)}
          width={width}
          height={height}
          onFavorite={() =>
            setFavorites((f) => {
              const next = new Set(f);
              if (!next.delete(holding.id)) next.add(holding.id);
              return next;
            })
          }
          onClose={() => setHolding(null)}
        />
      )}
    </node>
  );
}
