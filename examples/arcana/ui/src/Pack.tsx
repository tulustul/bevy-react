import { useEffect, useRef, useState } from "react";
import {
  interpolate,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type PointerEventData,
} from "bevy-react";
import { Sigil } from "./Sigil";
import { useDebug } from "./hooks";
import { Colors, Fonts, GILT } from "./theme";

export const PACK_W = 250;
export const PACK_H = 372;
const STRIP_H = 46;
/** How much of the strip a swipe must cover to tear it. */
const TEAR_AT = 0.72;

/** The sealed pack, floating. Swipe across its top strip to cut it — a
 *  glowing line follows your pointer — or just click it. Torn, the strip
 *  flies off and the wrapper burns away from the cut (the `burn` filter,
 *  its `progress` an animated value), revealing the cards dealt beneath.
 *
 *  `onTear` fires as the strip leaves (deal the cards now); `onGone` once
 *  the wrapper has burnt away (unmount it). */
export function Pack({
  onTear,
  onGone,
}: {
  onTear: () => void;
  onGone: () => void;
}) {
  const enter = useSharedValue(0);
  const sway = useSharedValue(0);
  const cut = useSharedValue(0);
  const strip = useSharedValue(0);
  const burn = useSharedValue(0);
  const [torn, setTorn] = useState(false);
  const swipe = useRef<{ min: number; max: number } | null>(null);

  useEffect(() => {
    enter.value = withSpring(1, { stiffness: 70, damping: 12, mass: 1 });
    sway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: "easeInOut" }),
        withTiming(-1, { duration: 2600, easing: "easeInOut" }),
      ),
    );
  }, [enter, sway]);

  const tear = () => {
    if (torn) return;
    setTorn(true);
    cut.value = withTiming(1, { duration: 160, easing: "easeOut" });
    strip.value = withDelay(
      120,
      withTiming(1, { duration: 520, easing: "easeOut" }),
    );
    burn.value = withDelay(
      260,
      withTiming(1, { duration: 1300, easing: "easeIn" }),
      (done) => done && onGone(),
    );
    setTimeout(onTear, 240);
  };

  // A click (or the scripted `tear`) runs the cut for you.
  const autoTear = () => {
    if (torn) return;
    cut.value = withTiming(1, {
      duration: 420,
      easing: "easeInOut",
      onComplete: (done) => done && tear(),
    });
  };
  useDebug("tear", autoTear);

  const swipeAt = (e: PointerEventData) => {
    const s = swipe.current;
    if (!s || torn) return;
    s.min = Math.min(s.min, e.x);
    s.max = Math.max(s.max, e.x);
    const covered = s.max - s.min;
    cut.value = covered;
    if (covered >= TEAR_AT) tear();
  };

  return (
    <node
      style={{
        width: PACK_W,
        height: PACK_H,
        borderRadius: 14,
        padding: 4,
        backgroundGradient: GILT,
        opacity: { animated: enter },
        cache: "never",
        transform3d: {
          perspective: 900,
          rotateY: { animated: interpolate(sway, [-1, 1], [-14, 14]) },
          rotateX: { animated: interpolate(sway, [-1, 1], [5, -3]) },
          translateY: { animated: interpolate(enter, [0, 1], [90, 0]) },
          scale: { animated: interpolate(enter, [0, 1], [0.82, 1]) },
        },
        filter: [
          {
            name: "holo",
            params: {
              angle: { animated: interpolate(sway, [-1, 1], [-40, 40]) },
              strength: 0.6,
              saturation: 0.9,
              glitter: 0.8,
              drift: 0.04,
            },
          },
          { name: "burn", params: { progress: { animated: burn } } },
        ],
      }}
    >
      <node
        style={{
          flexGrow: 1,
          borderRadius: 11,
          flexDirection: "column",
          overflowX: "clip",
          overflowY: "clip",
          backgroundGradient: {
            type: "linear",
            angle: 165,
            stops: [
              { color: "#3c1670" },
              { color: "#150933" },
              { color: "#0b0620" },
              { color: "#33125e" },
            ],
          },
        }}
      >
        {/* The strip: swipe across it. */}
        <node
          style={{
            height: STRIP_H,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 220, 150, 0.08)",
            opacity: { animated: interpolate(strip, [0, 0.7, 1], [1, 1, 0]) },
            transform: {
              translateY: { animated: interpolate(strip, [0, 1], [0, -70]) },
              translateX: { animated: interpolate(strip, [0, 1], [0, 46]) },
              rotate: { animated: interpolate(strip, [0, 1], [0, 14]) },
            },
          }}
          onPointerDown={(e) => {
            swipe.current = { min: e.x, max: e.x };
          }}
          onPointerMove={swipeAt}
          onPointerUp={() => {
            swipe.current = null;
            if (!torn)
              cut.value = withSpring(0, {
                stiffness: 180,
                damping: 18,
                mass: 1,
              });
          }}
        >
          <text
            style={{
              fontFamily: Fonts.display,
              fontSize: 10,
              letterSpacing: 5,
              color: Colors.goldFaint,
            }}
          >
            SWIPE TO OPEN
          </text>
        </node>
        {/* The cut: a dashed seam, and the hot line that follows the swipe. */}
        <node
          style={{
            height: 2,
            flexDirection: "row",
            justifyContent: "spaceEvenly",
          }}
        >
          {Array.from({ length: 22 }, (_, k) => (
            <node
              key={k}
              style={{ width: 5, height: 1, backgroundColor: Colors.goldFaint }}
            />
          ))}
          <node
            style={{
              positionType: "absolute",
              left: 0,
              top: -1,
              height: 3,
              width: { animated: interpolate(cut, [0, 1], [0, PACK_W]) },
              backgroundGradient: {
                type: "linear",
                angle: 90,
                stops: [{ color: "#ffb347" }, { color: "#fff6d8" }],
              },
              boxShadow: { color: "#ffb347", blurRadius: 10, spreadRadius: 1 },
            }}
          />
        </node>
        <node
          style={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
          }}
          onClick={autoTear}
        >
          <text
            style={{
              fontFamily: Fonts.display,
              fontSize: 10,
              letterSpacing: 5,
              color: Colors.gold,
            }}
          >
            MAJOR ARCANA
          </text>
          <Sigil size={138} />
          <text
            style={{
              fontFamily: Fonts.display,
              fontSize: 30,
              fontWeight: "bold",
              letterSpacing: 9,
              color: Colors.gold,
            }}
          >
            ARCANA
          </text>
          <text
            style={{
              fontFamily: Fonts.display,
              fontSize: 10,
              letterSpacing: 4,
              color: Colors.muted,
            }}
          >
            5 LIVING CARDS
          </text>
        </node>
      </node>
    </node>
  );
}
