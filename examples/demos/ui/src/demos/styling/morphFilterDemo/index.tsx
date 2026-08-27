import { create } from "zustand";
import {
  Bold,
  InlineCode,
  ListItem,
  Paragraph,
  List,
} from "@/components/typography";
import type { BevyStyle } from "bevy-react/jsx";

import { Checkbox, DemoRow, Example } from "@/components";
import { Code, CodeTabs } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { BUILTIN_TRANSITIONS, CUSTOM_MORPHS, type FilterEntry } from "./params";
import { MorphTile } from "./tiles";

// View-transition-style morphs: when `morphFilter.key` changes, the node's
// previous rendered appearance is frozen and a two-input filter blends it
// into the live content — React swaps the content freely in the same commit.

const PAGE: ExplanationData = {
  title: "Morph filters",
  info: (
    <>
      <Paragraph>
        <InlineCode>{"morphFilter: { key, name, params }"}</InlineCode> is a
        view-transition surface: when <InlineCode>key</InlineCode> changes, the
        node's previous rendered appearance is <Bold>frozen</Bold> and blended
        into the live content with a two-input filter (crossfade, linearWipe,
        pixelize, or a custom single-pass filter), driven by an engine-owned
        progress. React swaps the content freely in the same commit as the key
        flip.
      </Paragraph>
      <Code lang="tsx">{`<node
  style={{
    morphFilter: {
      key: variant, // a key change triggers the morph
      name: "crossfade",
    },
    // optional — a built-in 300ms ease applies with no config
    transition: { morphFilter: { duration: 600 } },
  }}
>
  <Content variant={variant} />
</node>`}</Code>
      <List>
        <ListItem>
          A built-in 300ms ease applies with no transition config;{" "}
          <InlineCode>{"transition: { morphFilter }"}</InlineCode> overrides the
          timing.
        </ListItem>
        <ListItem>
          First mount never animates; a mid-flight key change freezes the
          in-flight blend and restarts, so an interruption stays smooth.
        </ListItem>
        <ListItem>
          Each tile below swaps between four content variants when clicked, or
          on its own randomized schedule with autoplay on; every tile carries
          its own duration slider and filter params.
        </ListItem>
        <ListItem>
          The enter & exit row shows the <Bold>empty-carrier idiom</Bold>:
          content morphs in and out of a carrier that paints nothing — an empty
          layer captures as valid transparent, so no placeholder background is
          needed.
        </ListItem>
      </List>
    </>
  ),
};

// The Options card's toggles are shared by every gallery on the page (and by
// the isolated card instance the example modal mounts, which renders outside
// this page's tree), so they live in a tiny module-level store rather than
// page-level state.
type MorphOptions = {
  autoplay: boolean;
  showParams: boolean;
  setAutoplay: (autoplay: boolean) => void;
  setShowParams: (showParams: boolean) => void;
};

const createOptionsStore = () =>
  create<MorphOptions>((set) => ({
    autoplay: true,
    showParams: false,
    setAutoplay: (autoplay) => set({ autoplay }),
    setShowParams: (showParams) => set({ showParams }),
  }));

// Guard on globalThis so a hot-reload re-exec of app.js keeps the options.
const g = globalThis as unknown as {
  __morphOptionsStore?: ReturnType<typeof createOptionsStore>;
};
const useMorphOptions = (g.__morphOptionsStore ??= createOptionsStore());

export function MorphFilterDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <OptionsDemo />
      </DemoRow>
      <DemoRow>
        <BuiltinMorphsDemo />
      </DemoRow>
      <DemoRow>
        <CustomMorphsDemo />
      </DemoRow>
    </>
  );
}

function OptionsDemo() {
  return (
    <Example
      title="Options"
      info={
        <>
          <Paragraph>
            <Bold>autoplay</Bold> gives each tile a self-rescheduling timer with
            a random few-second period (re-rolled each cycle) and a random
            initial delay, so only a handful of tiles morph at any moment;
            clicking a tile always works too and resets that tile's timer.{" "}
            <Bold>show params</Bold> toggles the duration and filter-param
            controls under every tile.
          </Paragraph>
          <Code lang="tsx">{`useEffect(() => {
  if (!autoplay) return;
  let id;
  const period = () => 2000 + Math.random() * 4000;
  const schedule = (delay) => {
    id = setTimeout(() => {
      swap();
      schedule(period()); // re-rolled period
    }, delay);
  };
  schedule(Math.random() * 4000); // random initial delay: desync
  return () => clearTimeout(id);
}, [autoplay]);`}</Code>
        </>
      }
      demo={OptionsCard}
    />
  );
}

function OptionsCard() {
  const { autoplay, showParams, setAutoplay, setShowParams } =
    useMorphOptions();
  return (
    <node style={{ flexDirection: "row", gap: 16 }}>
      <Checkbox label="autoplay" enabled={autoplay} onChange={setAutoplay} />
      <Checkbox
        label="show params"
        enabled={showParams}
        onChange={setShowParams}
      />
    </node>
  );
}

function BuiltinMorphsDemo() {
  return (
    <Example
      title="Built-in morphs"
      info={
        <>
          <Paragraph>
            <InlineCode>crossfade</InlineCode>,{" "}
            <InlineCode>linearWipe</InlineCode> and{" "}
            <InlineCode>pixelize</InlineCode> ship with bevy-react. Every tile
            swaps between four same-size content variants — two photo cards and
            two banners — picking a random different one on each click (or
            automatically with autoplay on); the sliders under a tile set its
            morph duration and feed the filter's params live.
          </Paragraph>
          <Code lang="tsx">{`const swap = () => setVariant((v) => pickOther(v));

<node
  style={{
    morphFilter: {
      key: variant, // a key change triggers the morph
      name: "linearWipe",
      params: { angle, softness },
    },
    transition: { morphFilter: { duration, easing } },
  }}
  onClick={swap}
>
  <TileContent variant={variant} />
</node>`}</Code>
        </>
      }
      demo={BuiltinMorphsCard}
    />
  );
}

function BuiltinMorphsCard() {
  return <TileGrid entries={BUILTIN_TRANSITIONS} />;
}

function CustomMorphsDemo() {
  return (
    <Example
      title="Custom morphs"
      info={
        <>
          <Paragraph>
            Ports of gl-transitions.com transitions as custom single-pass
            filters — any of them is a <InlineCode>morphFilter</InlineCode>{" "}
            name. Each tile exposes its filter's key params (curtain's
            checkboxes flip it into a vertical or closing curtain); color-only
            filters like circleCrop and burn ride their defaults.
          </Paragraph>
          <CodeTabs
            tsx={`<node
  style={{
    morphFilter: {
      key: variant,
      name: "doorway",
      params: { perspective: 0.4, depth: 3 },
    },
    transition: { morphFilter: { duration, easing } },
  }}
  onClick={swap}
>`}
            rust={`// A two-input morph shader; params pack in declaration order.
#[react_morph_filter(shader = "shaders/morphs/doorway.wgsl")]
struct Doorway {
    /// Floor-reflection strength.
    #[serde(default = "default_two_fifths")]
    reflection: f32,
    /// Door foreshortening.
    #[serde(default = "default_two_fifths")]
    perspective: f32,
    /// Zoom start of the incoming image.
    #[serde(default = "default_three")]
    depth: f32,
}

// In the shared register_bindings site (runtime + exporter),
// so the generated BevyMorphFilters typing matches the app:
app.add_react_morph_filter::<Doorway>();`}
          />
        </>
      }
      demo={CustomMorphsCard}
    />
  );
}

function CustomMorphsCard() {
  return <TileGrid entries={CUSTOM_MORPHS} />;
}

function TileGrid({ entries }: { entries: FilterEntry[] }) {
  const autoplay = useMorphOptions((s) => s.autoplay);
  const showParams = useMorphOptions((s) => s.showParams);
  return (
    <node style={tileGrid}>
      {entries.map((entry) => (
        <MorphTile
          key={entry.label}
          entry={entry}
          autoplay={autoplay}
          showParams={showParams}
        />
      ))}
    </node>
  );
}

const tileGrid: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 16,
  maxWidth: 950,
};
