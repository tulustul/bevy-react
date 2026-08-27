import { useEffect, useState, type PropsWithChildren } from "react";
import { Caption, CardTitle } from "@/components/typography";
import {
  interpolate,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Typewriter } from "@/components";
import { Colors, Filters, FontSizes } from "@/theme";
import { useDemoPage } from "@/explanationStore";
import { useIsMobile } from "@/hooks";

type Feature = { title: string; body: string };

const FEATURES: Feature[] = [
  {
    title: "Native Bevy UI",
    body: "No browser, no web view. Your UI is bevy_ui entities in the same world as your game.",
  },
  {
    title: "Hot reload that keeps state",
    body: "Edit a component and it re-renders live, with hook state and running animations intact.",
  },
  {
    title: "Typed two-way messaging",
    body: "React and the ECS talk over typed channels generated straight from your Rust types.",
  },
  {
    title: "React, not a DSL",
    body: "Hooks, components, lists, conditional rendering — everything you already know.",
  },
];

// Per-card pastel accent (diverse hues, low saturation): a soft top-edge
// highlight + tinted title over the shared flat dark card body.
const CARD_ACCENTS = [
  Colors.sky100,
  Colors.red200,
  Colors.teal100,
  Colors.purple100,
];

// The hero title cycles through a few tag words, each dusting into the next
// (gradient included — the old hues blow away with the old word), and
// settles on the library name in the brand primary. Each step recolors the
// glyphs with its own top-to-bottom gradientMap sweep (light at the top,
// deep at the bottom). Swap any wording here — every entry must fit the
// fixed 460px morph rect at MetalMania 56.
const TITLE_SEQUENCE = [
  { text: "Fast", stops: ["#c8ecff", Colors.sky100, "#3a78d6"] },
  { text: "Reactive", stops: ["#ffc9d4", Colors.red200, Colors.red300] },
  {
    text: "Hot reloaded",
    stops: ["#b7ccff", Colors.primary100, Colors.purple100],
  },
  {
    text: "bevy-react",
    stops: [Colors.amber100, Colors.orange100],
  },
];
const TITLE_FIRST_HOLD_MS = 900;
const TITLE_STEP_MS = 1500;
const TITLE_MORPH_MS = 2000;
/** When the title's last morph has settled — the rest of the page (tagline
 * typewriter, intro, card entrances) starts only after this. */
const HERO_DONE_MS =
  TITLE_FIRST_HOLD_MS +
  TITLE_STEP_MS * (TITLE_SEQUENCE.length - 2) +
  TITLE_MORPH_MS;
/** When the last card's entrance has finished — the closing "browse" line
 * reveals after this (0.5s stagger from `FeatureCard`, 0.5s fade + rise). */
const CARDS_DONE_MS = HERO_DONE_MS + 400 + (FEATURES.length - 1) * 500 + 500;

export function Home() {
  // The landing page opts out of the explanation panel — the content area
  // then uses the full width (App.tsx drops the reserved panel padding).
  useDemoPage(null);

  const isMobile = useIsMobile();

  return (
    <node
      style={{
        ...pageStyle,
        ...(!isMobile && {
          backdropFilter: Filters.backdrop,
        }),
      }}
    >
      <Hero />
      <Reveal delay={HERO_DONE_MS + 200}>
        <text style={introStyle}>
          You write components in React/TSX and they render to native Bevy UI
          through a React Native-style bridge. State and interactions flow both
          ways, and edits hot-reload live while keeping component state.
        </text>
      </Reveal>
      <node style={cardsRowStyle}>
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </node>
      <Reveal delay={CARDS_DONE_MS}>
        <CardTitle>Browse the demos in the side panel</CardTitle>
      </Reveal>
    </node>
  );
}

// Fade + rise entrance on inline animated bindings, holding invisible until
// `delay` — sequences the plain-text lines into the page's opening.
function Reveal({ delay, children }: PropsWithChildren<{ delay: number }>) {
  const v = useSharedValue(0);

  useEffect(() => {
    v.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: "easeOut" }),
    );
  }, [v, delay]);

  return (
    <node
      style={{
        flexDirection: "column",
        alignItems: "center",
        opacity: { animated: v },
        transform: {
          translateY: { animated: interpolate(v, [0, 1], [16, 0]) },
        },
      }}
    >
      {children}
    </node>
  );
}

// The hero title mounts on the first tag (a morph's first mount never
// animates), then dusts through TITLE_SEQUENCE step by step until it lands
// on "bevy-react". The morph rect is FIXED-SIZE (per viewport width: it only
// changes with the window, never with a step) so every step's frozen
// snapshot and live capture share one rect — a morph snapshot is
// layout-anchored, and a size change across a swap would stretch the old
// pixels. The glyphs are recolored by a per-step gradientMap on a NESTED
// layer (not chained after shadow: shadow's combine, like bloom's, layers
// the original capture back over the blurred shadow, which would discard a
// same-chain recolor); the outer node owns the morph + drop shadow.
function Hero() {
  const [step, setStep] = useState(0);
  const bob = useSharedValue(0);
  const glow = useSharedValue(0);
  const isMobile = useIsMobile();
  const title = TITLE_SEQUENCE[step];

  useEffect(() => {
    bob.value = withRepeat(
      withTiming(1, { duration: 2400, easing: "easeInOut" }),
      { reverse: true },
    );
    glow.value = withRepeat(
      withTiming(1, { duration: 2600, easing: "easeInOut" }),
      { reverse: true },
    );
  }, [bob, glow]);

  useEffect(() => {
    if (step >= TITLE_SEQUENCE.length - 1) return;
    const id = setTimeout(
      () => setStep(step + 1),
      step === 0 ? TITLE_FIRST_HOLD_MS : TITLE_STEP_MS,
    );
    return () => clearTimeout(id);
  }, [step]);

  return (
    <node style={heroStyle}>
      <image
        src="bevy-react-logo.png"
        style={{
          width: 150,
          transform: {
            translateY: { animated: interpolate(bob, [0, 1], [-6, 6]) },
          },
        }}
      />
      <node
        style={{
          morphFilter: {
            key: title.text,
            name: "dustify",
            params: {
              direction: 0,
              softness: 100,
              turbulence: 0.5,
              wind: -180,
              drift: 60,
              grain: 6,
              raggedness: 0.6,
              evolution: 1,
            },
          },
          transition: {
            morphFilter: { duration: TITLE_MORPH_MS, easing: "linear" },
          },
          filter: {
            name: "shadow",
            params: {
              color: "rgba(0,0,0,0.5)",
              offsetX: 4,
              spread: 0,
            },
          },
        }}
      >
        <node
          style={{
            height: 72,
            alignItems: "center",
            justifyContent: "center",
            filter: {
              name: "gradientMap",
              params: {
                angle: 180,
                stops: title.stops.map((color) => ({ color })),
              },
            },
          }}
        >
          <text style={{ ...titleStyle, ...(isMobile && { fontSize: 36 }) }}>
            {title.text}
          </text>
        </node>
      </node>
      <Typewriter
        text="Build bevy_ui interfaces with React — no web view, no DOM."
        style={taglineStyle}
        startDelay={HERO_DONE_MS}
      />
    </node>
  );
}

// Frosted card over the aurora: backdropFilter blurs the live 3D frame
// behind the node. Cards wait for the hero title to finish its tag
// sequence, then enter one by one (0.5s apart) with a simple staggered
// fade + rise on inline animated bindings (base style only). Hover tilts
// via transform3d on the wrapper; gradient/shadow hover swaps snap by
// design (no transition channel).
function FeatureCard({
  feature,
  index,
  slotWidth,
}: {
  feature: Feature;
  index: number;
  /** Row slot to fill (the card takes its own wrapper padding out); default
   * `CARD_WIDTH`. */
  slotWidth?: number;
}) {
  const width =
    slotWidth === undefined ? CARD_WIDTH : slotWidth - 2 * CARD_WRAP_PADDING;
  const enter = useSharedValue(0);
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  useEffect(() => {
    enter.value = withDelay(
      HERO_DONE_MS + 400 + index * 500,
      withTiming(1, { duration: 500, easing: "easeOut" }),
    );
  }, [enter, index]);

  return (
    <node
      style={{
        opacity: { animated: enter },
        transform: {
          translateY: { animated: interpolate(enter, [0, 1], [24, 0]) },
        },
      }}
    >
      <node
        style={{
          transform3d: { perspective: 700 },
          transition: { transform3d: { duration: 500, easing: "easeInOut" } },
          padding: CARD_WRAP_PADDING,
        }}
        hoverStyle={cardHoverStyle}
      >
        <node style={{ ...cardStyle, width }}>
          <text style={{ ...cardTitleStyle, color: accent }}>
            {feature.title}
          </text>
          <Caption>{feature.body}</Caption>
        </node>
      </node>
    </node>
  );
}

const PAGE_PADDING = 32;
const CARD_WIDTH = 300;
const CARD_WRAP_PADDING = 10;

const pageStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 24,
  padding: PAGE_PADDING,
  backgroundColor: "rgba(0,0,0,0.3)",
  borderRadius: 20,
  maxWidth: 720,
};

const heroStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const titleStyle: BevyStyle = {
  color: Colors.primary100,
  fontFamily: "MetalMania",
  fontSize: 56,
};

const taglineStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};

const introStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
  textAlign: "center",
};

const cardsRowStyle: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
};

const cardStyle: BevyStyle = {
  flexDirection: "column",
  gap: 6,
  padding: 16,
  backgroundColor: "rgba(26, 27, 38, 0.85)",
  borderRadius: 14,
};

const cardHoverStyle: BevyStyle = {
  transform3d: { rotateX: 8, rotateY: 20, perspective: 700 },
};

const cardTitleStyle: BevyStyle = {
  fontSize: FontSizes.base,
  fontWeight: "bold",
};
