import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

import { Colors, Fonts, FontSizes } from "@/theme";

export const TILE = 220;
export const VARIANT_COUNT = 4;

/** Random variant index guaranteed to differ from `current`, so the morph
 * key changes on every swap. */
export function nextVariant(current: number): number {
  let n = Math.floor(Math.random() * (VARIANT_COUNT - 1));
  if (n >= current) n++;
  return n;
}

/** The swappable tile content, all four variants filling the tile
 * identically: two photo "pages" (full-bleed background image with UI
 * chrome on top) and two banner cards, so the morphs have both rich pixels
 * and flat shapes to chew on. */
export function TileContent({ variant }: { variant: number }) {
  switch (variant) {
    case 1:
      return <PhotoCard page={PHOTOS[1]} />;
    case 2:
      return <Banner />;
    case 3:
      return <StatsCard />;
    default:
      return <PhotoCard page={PHOTOS[0]} />;
  }
}

const PHOTOS = [
  {
    image: "images/parrot.png",
    tag: "tropical",
    accent: Colors.mint,
    title: "Parrot",
  },
  {
    image: "images/wheat.png",
    tag: "harvest",
    accent: Colors.amber,
    title: "Wheat",
  },
] as const;

const fillStyle: BevyStyle = {
  width: "100%",
  height: "100%",
  borderRadius: 10,
};

function PhotoCard({ page }: { page: (typeof PHOTOS)[number] }) {
  return (
    <node
      style={{
        ...fillStyle,
        backgroundImage: { src: page.image },
        flexDirection: "column",
        justifyContent: "spaceBetween",
        alignItems: "stretch",
      }}
    >
      <node
        style={{
          flexDirection: "row",
          justifyContent: "spaceBetween",
          alignItems: "center",
          padding: { top: 8, right: 10, bottom: 0, left: 8 },
        }}
      >
        <node
          style={{
            backgroundColor: page.accent,
            borderRadius: 999,
            padding: { horizontal: 10, vertical: 2 },
          }}
        >
          <text
            style={{
              color: Colors.ink,
              fontSize: FontSizes.xxs,
              fontWeight: "bold",
            }}
          >
            {page.tag}
          </text>
        </node>
        <node style={{ flexDirection: "row", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <node
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: Colors.text,
              }}
            />
          ))}
        </node>
      </node>
      <node
        style={{
          flexDirection: "column",
          padding: { top: 6, right: 10, bottom: 8, left: 10 },
          backgroundColor: "rgba(0, 0, 0, 0.75)",
        }}
      >
        <text
          style={{
            textAlign: "center",
            color: Colors.text,
            fontFamily: Fonts.display,
            fontSize: FontSizes.lg,
            fontWeight: "semibold",
            textShadow: { color: "black", offsetX: 1, offsetY: 1 },
          }}
        >
          {page.title}
        </text>
        <text
          style={{
            color: Colors.textBody,
            fontSize: FontSizes.xxs,
            textAlign: "center",
          }}
        >
          Click to morph
        </text>
      </node>
    </node>
  );
}

const DOTS = [
  { color: Colors.rose, label: "red" },
  { color: Colors.mint, label: "green" },
  { color: Colors.violet, label: "purple" },
] as const;

/** Demo-local test-banner variant (the shared `components/TestBanner` stays
 * fixed-width; the tiles need content that fills 220x220 exactly). LIVE UI,
 * not pixels: the dots are clickable (clicks don't bubble, so selecting one
 * never swaps the tile) and hoverable — interact mid-morph to see the frozen
 * old state blend into the responding subtree. */
function Banner() {
  const [selected, setSelected] = useState(0);
  return (
    <node
      style={{
        ...fillStyle,
        backgroundColor: Colors.raised,
        border: 1,
        borderColor: Colors.lineStrong,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
      }}
    >
      <image src="bevy-react-logo.png" style={{ width: 90 }} />
      <text style={{ fontSize: FontSizes.sm, color: DOTS[selected].color }}>
        {DOTS[selected].label}
      </text>
      <node style={{ flexDirection: "row", gap: 12, height: 30 }}>
        {DOTS.map((dot, i) => (
          <node
            key={dot.label}
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              backgroundColor: dot.color,
              border: i === selected ? 3 : 0,
              borderColor: Colors.cyan,
              cursor: "pointer",
              transition: { size: { duration: 150, easing: "easeOut" } },
            }}
            hoverStyle={{ width: 30, height: 30 }}
            onClick={() => setSelected(i)}
          />
        ))}
      </node>
    </node>
  );
}

const BAR_COLORS = [
  Colors.cyan,
  Colors.sky,
  Colors.violet,
  Colors.mint,
  Colors.amber,
] as const;

const INITIAL_BARS = [34, 58, 26, 70, 46];

const randomBars = () =>
  BAR_COLORS.map(() => 20 + Math.round(Math.random() * 56));

/** Formatted with a thousands comma by hand — the isolate has no ICU. */
const formatMetric = (n: number) =>
  n >= 1000
    ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, "0")}`
    : `${n}`;

/** A completely different UI from the banner: a mock analytics card with a
 * header row, a big metric, a bar chart and pill buttons — all LIVE.
 * "Refresh" re-rolls the bars (heights ease, the metric recomputes);
 * "Export" toggles the status dot. Inner clicks never swap the tile (clicks
 * don't bubble past the innermost handler). */
function StatsCard() {
  const [bars, setBars] = useState<number[]>(INITIAL_BARS);
  const [live, setLive] = useState(true);
  const total = bars.reduce((a, b) => a + b, 0) * 5;
  const delta = Math.round(
    ((bars[bars.length - 1] - bars[0]) / Math.max(bars[0], 1)) * 100,
  );
  return (
    <node
      style={{
        ...fillStyle,
        backgroundColor: Colors.card,
        border: 1,
        borderColor: Colors.line,
        flexDirection: "column",
        alignItems: "stretch",
        padding: 12,
        gap: 6,
      }}
    >
      <node
        style={{
          flexDirection: "row",
          justifyContent: "spaceBetween",
          alignItems: "center",
        }}
      >
        <text style={{ fontSize: FontSizes.xs, color: Colors.textBody }}>
          Weekly stats
        </text>
        <node
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            backgroundColor: live ? Colors.mint : Colors.rose,
            transition: { backgroundColor: { duration: 200 } },
          }}
        />
      </node>
      <node style={{ flexDirection: "row", alignItems: "flexEnd", gap: 6 }}>
        <text
          style={{
            fontFamily: Fonts.display,
            fontSize: FontSizes.xxl,
            fontWeight: "semibold",
            color: Colors.text,
          }}
        >
          {formatMetric(total)}
        </text>
        <text
          style={{
            fontFamily: Fonts.mono,
            fontSize: FontSizes.xxs,
            color: delta >= 0 ? Colors.mint : Colors.rose,
            margin: { bottom: 5 },
          }}
        >
          {delta >= 0 ? `+${delta}%` : `${delta}%`}
        </text>
      </node>
      <node
        style={{
          flexGrow: 1,
          flexDirection: "row",
          alignItems: "flexEnd",
          justifyContent: "spaceBetween",
          padding: { horizontal: 4 },
        }}
      >
        {bars.map((height, i) => (
          <node
            key={i}
            style={{
              width: 28,
              height,
              borderRadius: "4px 4px 0 0",
              backgroundColor: BAR_COLORS[i],
              transition: { size: { duration: 350, easing: "easeOut" } },
            }}
          />
        ))}
      </node>
      <node style={{ flexDirection: "row", gap: 8 }}>
        <node
          style={{
            flexGrow: 1,
            backgroundColor: Colors.cyan,
            borderRadius: 999,
            padding: { vertical: 4 },
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transition: { backgroundColor: { duration: 120 } },
          }}
          hoverStyle={{ backgroundColor: Colors.cyanBright }}
          pressStyle={{ backgroundColor: Colors.cyanDeep }}
          onClick={() => setBars(randomBars())}
        >
          <text
            style={{
              fontSize: FontSizes.xxs,
              fontWeight: "semibold",
              color: Colors.ink,
            }}
          >
            Refresh
          </text>
        </node>
        <node
          style={{
            flexGrow: 1,
            backgroundColor: Colors.well,
            border: 1,
            borderColor: Colors.lineStrong,
            borderRadius: 999,
            padding: { vertical: 4 },
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transition: { backgroundColor: { duration: 120 } },
          }}
          hoverStyle={{ backgroundColor: Colors.control }}
          pressStyle={{ backgroundColor: Colors.controlHover }}
          onClick={() => setLive((v) => !v)}
        >
          <text style={{ fontSize: FontSizes.xxs, color: Colors.text }}>
            Export
          </text>
        </node>
      </node>
    </node>
  );
}
