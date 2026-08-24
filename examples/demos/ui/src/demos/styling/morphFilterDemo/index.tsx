import { create } from "zustand";
import type { BevyStyle } from "bevy-react/jsx";

import { Checkbox, DemoRow, Example } from "@/components";
import { B, Code, CodeTabs, InlineCode, Li, P, Ul } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { CarrierTile } from "./carrier";
import { BUILTIN_TRANSITIONS, CUSTOM_MORPHS, type FilterEntry } from "./params";
import { MorphTile } from "./tiles";

// View-transition-style morphs: when `morphFilter.key` changes, the node's
// previous rendered appearance is frozen and a two-input filter blends it
// into the live content — React swaps the content freely in the same commit.

const PAGE: ExplanationData = {
  title: "Morph filters",
  info: (
    <>
      <P>
        <InlineCode>{"morphFilter: { key, name, params }"}</InlineCode> is a
        view-transition surface: when <InlineCode>key</InlineCode> changes, the
        node's previous rendered appearance is <B>frozen</B> and blended into
        the live content with a two-input filter (crossfade, linearWipe,
        pixelize, or a custom single-pass filter), driven by an engine-owned
        progress. React swaps the content freely in the same commit as the key
        flip.
      </P>
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
      <Ul>
        <Li>
          A built-in 300ms ease applies with no transition config;{" "}
          <InlineCode>{"transition: { morphFilter }"}</InlineCode> overrides the
          timing.
        </Li>
        <Li>
          First mount never animates; a mid-flight key change freezes the
          in-flight blend and restarts, so an interruption stays smooth.
        </Li>
        <Li>
          Each tile below swaps between four content variants when clicked, or
          on its own randomized schedule with autoplay on; every tile carries
          its own duration slider and filter params.
        </Li>
        <Li>
          The enter & exit row shows the <B>empty-carrier idiom</B>: content
          morphs in and out of a carrier that paints nothing — an empty layer
          captures as valid transparent, so no placeholder background is needed.
        </Li>
      </Ul>
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
        <CarrierDemo />
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
          <P>
            <B>autoplay</B> gives each tile a self-rescheduling timer with a
            random few-second period (re-rolled each cycle) and a random initial
            delay, so only a handful of tiles morph at any moment; clicking a
            tile always works too and resets that tile's timer.{" "}
            <B>show params</B> toggles the duration and filter-param controls
            under every tile.
          </P>
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
          <P>
            <InlineCode>crossfade</InlineCode>,{" "}
            <InlineCode>linearWipe</InlineCode> and{" "}
            <InlineCode>pixelize</InlineCode> ship with bevy-react. Every tile
            swaps between four same-size content variants — two photo cards and
            two banners — picking a random different one on each click (or
            automatically with autoplay on); the sliders under a tile set its
            morph duration and feed the filter's params live.
          </P>
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

function CarrierDemo() {
  return (
    <Example
      title="Enter and exit (empty carrier)"
      info={
        <>
          <P>
            Morphing content in and out of nothing: each tile is a permanently
            mounted carrier node that paints <B>nothing</B> — no background, no
            border — and its content mounts/unmounts in the same commit as the
            morph key flip. An empty promoted layer captures as a valid
            transparent texture, so the morph blends from/to genuinely empty
            pixels; no placeholder drawable is needed. Click a tile to toggle
            its content (autoplay toggles it on a timer). The one app-side rule:
            the carrier must have rendered at least one frame before the first
            key flip — a same-commit mount and flip adopts the key silently (the
            mount rule).
          </P>
          <Code lang="tsx">{`const [shown, setShown] = useState(false);

// The carrier stays mounted and paints NOTHING: an empty layer
// captures as transparent, so the morph blends the content in
// from nothing and back out to nothing.
<node
  style={{
    width: 220,
    height: 220,
    morphFilter: { key: shown ? "in" : "out", name: "pixelize" },
    transition: { morphFilter: { duration: 900 } },
  }}
  onClick={() => setShown((s) => !s)}
>
  {shown && <Card />}
</node>`}</Code>
        </>
      }
      demo={CarrierCard}
    />
  );
}

function CarrierCard() {
  const autoplay = useMorphOptions((s) => s.autoplay);
  return (
    <node style={tileGrid}>
      <CarrierTile
        label="crossfade"
        use={{ name: "crossfade", params: { spread: 0.6, scale: 40 } }}
        variant={0}
        autoplay={autoplay}
      />
      <CarrierTile
        label="linearWipe"
        use={{ name: "linearWipe", params: { angle: 45, softness: 60 } }}
        variant={2}
        autoplay={autoplay}
      />
      <CarrierTile
        label="pixelize"
        use={{
          name: "pixelize",
          params: { squaresMin: [20, 20], steps: 50 },
        }}
        variant={1}
        autoplay={autoplay}
      />
    </node>
  );
}

function CustomMorphsDemo() {
  return (
    <Example
      title="Custom morphs"
      info={
        <>
          <P>
            Ports of gl-transitions.com transitions as custom single-pass
            filters — any of them is a <InlineCode>morphFilter</InlineCode>{" "}
            name. Each tile exposes its filter's key params (curtain's
            checkboxes flip it into a vertical or closing curtain); color-only
            filters like circleCrop and burn ride their defaults.
          </P>
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
