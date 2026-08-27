import { useEffect, useRef, useState } from "react";
import {
  type FilterUse,
  type SharedValue,
  interpolate,
  useSharedValue,
  withTiming,
} from "bevy-react";
import { BevyStyle } from "bevy-react/jsx";
import { Pinchable, Radio } from "@/components";
import { Colors } from "@/theme";
import { useIsMobile } from "@/hooks";
import { growTransition } from "../beats";
import { Extra } from "../Extra";
import { controlsStyle, vignetteStyle, type VignetteProps } from "../shared";
import { useVignetteState } from "../store";

/** The pack: each entry maps a fade amount (0 = identity, 1 = the look) onto
 * the ONE param that turns the filter on, so several can overlap mid-fade.
 * Bloom goes FIRST: its combine pass reads the raw capture, so anything ahead
 * of it in the chain is dropped (TODO, Bugs). */
const FILTERS: {
  name: string;
  label: string;
  use: (amount: SharedValue) => FilterUse;
}[] = [
  {
    name: "bloom",
    label: "bloom",
    use: (a) => ({
      name: "bloom",
      params: {
        radius: 10,
        threshold: 0.35,
        intensity: { animated: interpolate(a, [0, 1], [0, 2]) },
      },
    }),
  },
  {
    name: "sepia",
    label: "sepia",
    use: (a) => ({ name: "sepia", params: { amount: { animated: a } } }),
  },
  {
    name: "hueRotate",
    label: "hue",
    use: (a) => ({
      name: "hueRotate",
      params: { angle: { animated: interpolate(a, [0, 1], [0, 180]) } },
    }),
  },
  {
    name: "blur",
    label: "blur",
    // The seed sizes the capture's outset ring for the whole fade.
    use: (a) => ({
      name: "blur",
      params: { radius: { animated: interpolate(a, [0, 1], [0, 8]), seed: 8 } },
    }),
  },
  {
    name: "ripple",
    label: "ripple",
    use: (a) => ({
      name: "ripple",
      params: {
        amplitude: { animated: interpolate(a, [0, 1], [0, 4]) },
        frequency: 12,
        speed: 1,
      },
    }),
  },
  {
    name: "glitch",
    label: "glitch",
    use: (a) => ({ name: "glitch", params: { intensity: { animated: a } } }),
  },
];

const AUTO_MS = 1400;
const FADE_MS = 1000;
/** The photo's side at each end of the flight. */
const TILE_PHOTO = 110;
const PANEL_PHOTO = 200;
const PANEL_PHOTO_MOBILE = 170;
const CARD_PADDING = 10;
/** Room the pills take at rest, including the gap above. */
const PILLS_HEIGHT = 110;

/** Filters: a card wearing a different filter every couple of seconds.
 * Switching cross-fades PARAMS rather than swapping chains, and a filter leaves
 * the chain only once its fade-out has settled — so quick switches compose. */
export function FiltersVignette({ expanded, grown }: VignetteProps) {
  const [active, setActive] = useVignetteState(
    "filters.active",
    FILTERS[0].name,
  );
  const amounts = useAmounts(active);
  // The active filter plus any still fading out. Local: a mount starts clean.
  const [live, setLive] = useState<string[]>(() => [active]);
  const activeRef = useRef(active);
  activeRef.current = active;
  const isMobile = useIsMobile();

  const select = (name: string) => {
    setActive(name);
    setLive((l) => (l.includes(name) ? l : [...l, name]));
    FILTERS.forEach((f, i) => {
      const to = f.name === name ? 1 : 0;
      amounts[i].value = withTiming(to, {
        duration: FADE_MS,
        easing: "easeInOut",
        // A re-selection mid-fade replaces the driver (`finished: false`).
        onComplete: (finished) => {
          if (finished && to === 0) {
            setLive((l) => l.filter((n) => n !== f.name));
          }
        },
      });
    });
  };
  const selectRef = useRef(select);
  selectRef.current = select;

  useEffect(() => {
    if (expanded) return;
    const id = setInterval(() => {
      const i = FILTERS.findIndex((f) => f.name === activeRef.current);
      selectRef.current(FILTERS[(i + 1) % FILTERS.length].name);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [expanded]);

  const chain = FILTERS.flatMap((f, i) =>
    live.includes(f.name) ? [f.use(amounts[i])] : [],
  );
  const photo = grown
    ? isMobile
      ? PANEL_PHOTO_MOBILE
      : PANEL_PHOTO
    : TILE_PHOTO;

  const card = (
    <node style={{ ...cardStyle, filter: chain, cache: "never" }}>
      <image
        src="images/parrot.png"
        style={{
          width: photo,
          height: photo,
          borderRadius: 8,
          imageRendering: "trilinear",
          transition: { size: growTransition },
        }}
      />
      <text style={grown ? wordLargeStyle : wordSmallStyle}>react</text>
    </node>
  );

  return (
    <node style={vignetteStyle}>
      {expanded ? (
        <Pinchable
          focusPolicy="pass"
          params={{
            radius: 0.5,
            strength: 0.2,
            light: 0.1,
            outerSoftness: 0.6,
          }}
        >
          {card}
        </Pinchable>
      ) : (
        card
      )}
      <Extra grown={grown} maxHeight={PILLS_HEIGHT}>
        <node style={controlsStyle}>
          <Radio
            pinch={{ radius: 0.7 }}
            options={FILTERS.map((f) => ({ value: f.name, label: f.label }))}
            value={active}
            onChange={select}
          />
        </node>
      </Extra>
    </node>
  );
}

/** One fade amount per pack entry; the remembered filter starts fully applied.
 * A fixed hook sequence, as the rules require. */
function useAmounts(active: string): SharedValue[] {
  const at = (i: number) => (FILTERS[i].name === active ? 1 : 0);
  return [
    useSharedValue(at(0)),
    useSharedValue(at(1)),
    useSharedValue(at(2)),
    useSharedValue(at(3)),
    useSharedValue(at(4)),
    useSharedValue(at(5)),
  ];
}

const cardStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  padding: {
    vertical: CARD_PADDING,
    left: CARD_PADDING,
    right: CARD_PADDING + 6,
  },
  borderRadius: 12,
  backgroundColor: Colors.surface200,
  border: 1,
  borderColor: Colors.surface400,
};

const wordSmallStyle: BevyStyle = {
  fontFamily: "MetalMania",
  fontSize: 26,
  color: Colors.textColor100,
};

const wordLargeStyle: BevyStyle = {
  ...wordSmallStyle,
  fontSize: 44,
};
