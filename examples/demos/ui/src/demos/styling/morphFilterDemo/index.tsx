import { useState } from "react";

import { Checkbox, DemoRow, Example } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { CarrierTile } from "./carrier";
import { BUILTIN_TRANSITIONS, CUSTOM_MORPHS, type FilterEntry } from "./params";
import { MorphTile } from "./tiles";

// View-transition-style morphs: when `morphFilter.key` changes, the node's
// previous rendered appearance is frozen and a two-input filter blends it
// into the live content — React swaps the content freely in the same commit.

const PAGE: ExplanationData = {
  title: "Morph Filter",
  description:
    "View-transition-style morphs. morphFilter: { key, name, params } freezes the node's previous rendered appearance when key changes and blends it into the live content with a two-input filter (crossfade, linearWipe, or a custom single-pass filter), driven by an engine-owned progress. A built-in 300ms ease applies with no transition config; transition: { morphFilter } overrides the timing. First mount never animates; a mid-flight key change freezes the in-flight blend and restarts. Each tile below swaps between four content variants when clicked, or on its own randomized schedule with autoplay on; every tile carries its own duration slider and filter params. The enter & exit row shows the empty-carrier idiom: content morphs in and out of a carrier that paints nothing — an empty layer captures as valid transparent, so no placeholder background is needed.",
};

export function MorphFilterDemo() {
  useDemoPage(PAGE);
  const [autoplay, setAutoplay] = useState(true);
  const [showParams, setShowParams] = useState(false);

  return (
    <>
      <DemoRow>
        <Example
          title="Options"
          description="autoplay gives each tile a self-rescheduling timer with a random 4-10s period and a random initial delay, so only a handful of tiles morph at any moment; clicking a tile always works too and resets that tile's timer. show params toggles the duration and filter-param controls under every tile."
          tsx={AUTOPLAY_TSX}
        >
          <node style={{ flexDirection: "row", gap: 16 }}>
            <Checkbox
              label="autoplay"
              enabled={autoplay}
              onChange={setAutoplay}
            />
            <Checkbox
              label="show params"
              enabled={showParams}
              onChange={setShowParams}
            />
          </node>
        </Example>
      </DemoRow>
      <DemoRow>
        <Gallery
          title="Built-in morphs"
          description="crossfade, linearWipe and pixelize ship with bevy-react. Every tile swaps between four same-size content variants — two photo cards and two banners — picking a random different one on each click (or automatically with autoplay on); the sliders under a tile set its morph duration and feed the filter's params live."
          tsx={BUILTIN_TSX}
          entries={BUILTIN_TRANSITIONS}
          autoplay={autoplay}
          showParams={showParams}
        />
      </DemoRow>
      <DemoRow>
        <Example
          title="Enter & exit (empty carrier)"
          description="Morphing content in and out of nothing: each tile is a permanently mounted carrier node that paints NOTHING — no background, no border — and its content mounts/unmounts in the same commit as the morph key flip. An empty promoted layer captures as a valid transparent texture, so the morph blends from/to genuinely empty pixels; no placeholder drawable is needed. Click a tile to toggle its content (autoplay toggles it on a timer). The one app-side rule: the carrier must have rendered at least one frame before the first key flip — a same-commit mount and flip adopts the key silently (the mount rule)."
          tsx={CARRIER_TSX}
        >
          <node
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 16,
              maxWidth: 950,
            }}
          >
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
        </Example>
      </DemoRow>
      <DemoRow>
        <Gallery
          title="Custom morphs"
          description="Ports of gl-transitions.com transitions as custom single-pass filters — any of them is a morphFilter name. Each tile exposes its filter's key params (curtain's checkboxes flip it into a vertical or closing curtain); color-only filters like circleCrop and burn ride their defaults."
          tsx={GL_TSX}
          rust={GL_RUST}
          entries={CUSTOM_MORPHS}
          autoplay={autoplay}
          showParams={showParams}
        />
      </DemoRow>
    </>
  );
}

function Gallery({
  title,
  description,
  tsx,
  rust,
  entries,
  autoplay,
  showParams,
}: {
  title: string;
  description: string;
  tsx: string;
  rust?: string;
  entries: FilterEntry[];
  autoplay: boolean;
  showParams: boolean;
}) {
  return (
    <Example title={title} description={description} tsx={tsx} rust={rust}>
      <node
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
          maxWidth: 950,
        }}
      >
        {entries.map((entry) => (
          <MorphTile
            key={entry.label}
            entry={entry}
            autoplay={autoplay}
            showParams={showParams}
          />
        ))}
      </node>
    </Example>
  );
}

const AUTOPLAY_TSX = `useEffect(() => {
  if (!autoplay) return;
  let id;
  const schedule = (delay) => {
    id = setTimeout(() => {
      swap();
      // re-rolled 4-10s period
      schedule(
        4000 + Math.random() * 6000,
      );
    }, delay);
  };
  // random initial delay: desync
  schedule(Math.random() * 6000);
  return () => clearTimeout(id);
}, [autoplay]);`;

const BUILTIN_TSX = `const swap = () =>
  setVariant((v) => pickOther(v));

<node
  style={{
    morphFilter: {
      key: variant, // change = morph
      name: "linearWipe",
      params: { angle, softness },
    },
    transition: {
      morphFilter: {
        duration,
        easing,
      },
    },
  }}
  onClick={swap}
>
  <TileContent variant={variant} />
</node>`;

const CARRIER_TSX = `const [shown, setShown] =
  useState(false);

// The carrier stays mounted and
// paints NOTHING: an empty layer
// captures as transparent, so the
// morph blends the content in from
// nothing and out to nothing.
<node
  style={{
    width: 220,
    height: 220,
    morphFilter: {
      key: shown ? "in" : "out",
      name: "pixelize",
    },
    transition: {
      morphFilter: {
        duration: 900,
      },
    },
  }}
  onClick={() =>
    setShown((s) => !s)
  }
>
  {shown && <Card />}
</node>`;

const GL_TSX = `<node
  style={{
    morphFilter: {
      key: variant,
      name: "doorway",
      params: {
        perspective: 0.4,
        depth: 3,
      },
    },
    transition: {
      morphFilter: {
        duration,
        easing,
      },
    },
  }}
  onClick={swap}
>`;

const GL_RUST = `// a two-input morph shader;
// params pack in field order
#[react_morph_filter(
  shader =
    "shaders/morphs/doorway.wgsl"
)]
struct Doorway {
  #[serde(default = "two_fifths")]
  reflection: f32,
  #[serde(default = "two_fifths")]
  perspective: f32,
  #[serde(default = "three")]
  depth: f32,
}

// in the shared register_bindings
// site (runtime + exporter), so the
// generated BevyMorphFilters typing
// matches the running app:
app.add_react_morph_filter
  ::<Doorway>();`;
