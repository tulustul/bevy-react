import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Checkbox, DemoRow, Example } from "@/components";
import { B, Code, H2, InlineCode, Li, P, Ul } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { caption, column, controlColumn, row } from "./styling/shared";

// A concept page: how subtree promotion to composited layers works, what the
// capture cache does, and the one case where the cache serves stale pixels.
// The stale-cache card needs a live render target, hence the CrowdedCubes
// scene (its "minimap" camera renders continuously).

const PAGE: ExplanationData = {
  title: "Layers",
  info: (
    <>
      <H2>One subtree, one texture</H2>
      <P>
        Normally the whole UI paints in a single pass. Some styles instead
        promote a subtree to a <B>composited layer</B>: its content is captured
        into an offscreen texture and drawn back as one quad at its stacking
        position. Promotion is render-only — layout, picking, refs and
        animations behave exactly as before. Press <InlineCode>F12</InlineCode>{" "}
        (devtools ship in dev builds only) and open the <B>Layers</B> tab to
        watch this page: every promoted layer is listed with the reason it
        promoted and a live <InlineCode>repaints</InlineCode> counter.
      </P>

      <H2>What promotes</H2>
      <Code lang="tsx">{`// each of these promotes the subtree:
<node style={{ opacity: 0.5 }}>…</node>
<node
  style={{
    filter: { name: "blur",
      params: { radius: 4 } },
  }}
>…</node>
<node style={{ transform3d: {} }} />
<node style={{ cache: "always" }} />`}</Code>
      <P>
        Four triggers: <InlineCode>opacity</InlineCode> on a node with children
        (group fade, web semantics — opt out with{" "}
        <InlineCode>groupAlpha: false</InlineCode>), a non-empty{" "}
        <InlineCode>filter</InlineCode> chain,{" "}
        <InlineCode>transform3d</InlineCode> (its presence, even an identity{" "}
        <InlineCode>{"{}"}</InlineCode>), and{" "}
        <InlineCode>{'cache: "always"'}</InlineCode> /{" "}
        <InlineCode>{'"never"'}</InlineCode>.{" "}
        <InlineCode>backdropFilter</InlineCode> and{" "}
        <InlineCode>morphFilter</InlineCode> promote too — their pages cover
        them.
      </P>

      <H2>The capture cache</H2>
      <P>
        A layer whose content did not change is <B>clean</B>: its capture pass
        is skipped entirely and last frame's texture is composited again — in
        the devtools its <InlineCode>repaints</InlineCode> counter stops
        climbing. Content changes (text, colors, children) re-capture.
        Crucially, translation, group alpha, filter params,{" "}
        <InlineCode>transform3d</InlineCode> and morph progress are applied at{" "}
        <B>composite time</B>: animating them never re-captures the layer, so
        moving or fading a huge blurred panel costs one quad per frame.
      </P>

      <H2>Clipping and scrolling</H2>
      <P>
        Captures are clip-independent: an ancestor scrollport or the viewport
        never bakes into the captured pixels. The clip clamps the composited
        result instead (web semantics — overflow clips the filtered{" "}
        <B>result</B>), so scrolling a layer is always a cache hit, and a layer
        scrolled into view is correct by construction.
      </P>

      <H2>When the cache lies</H2>
      <P>
        Dirt tracking watches everything that crosses the bridge — but some
        pixels are written where it cannot see. A live{" "}
        <InlineCode>{"<portal>"}</InlineCode> render target or an app-owned
        texture is updated GPU-side by a camera: no dirt, so a cached layer
        above it serves stale pixels forever. A custom filter compiled with{" "}
        <InlineCode>time = true</InlineCode> is the subtler case — its own layer
        keeps animating (the passes re-run every frame), but an enclosing cached
        layer freezes its appearance. The escape hatch is{" "}
        <InlineCode>{'cache: "never"'}</InlineCode> — it force-promotes the
        subtree, re-captures it every frame, and dirties every enclosing layer
        too:
      </P>
      <Code lang="tsx">{`<node style={{ cache: "never" }}>
  <portal target="minimap" />
</node>`}</Code>
      <P>
        Engine-driven motion never needs it: transitions, morph blends and{" "}
        <InlineCode>{"{ animated }"}</InlineCode> param bindings all push their
        own per-frame dirt.
      </P>

      <H2>Costs and gotchas</H2>
      <Ul>
        <Li>
          {'cache: "never"'} pays a full capture every frame — reach for it only
          when pixels change outside the tracker's sight.
        </Li>
        <Li>
          {'cache: "always"'} force-promotes (and caches) a subtree that no
          other style would promote.
        </Li>
        <Li>
          An offscreen layer with animating content still re-captures — the quad
          draws nothing, the capture still runs.
        </Li>
        <Li>
          An empty layer is a valid transparent capture — promotion does not
          require visible content.
        </Li>
      </Ul>
    </>
  ),
};

export function LayersDemo() {
  useDemoPage(PAGE);
  return (
    <DemoRow>
      <PromotionDemo />
      <StaleCacheDemo />
    </DemoRow>
  );
}

function PromotionDemo() {
  return (
    <Example
      title="What promotes"
      info={
        <>
          <P>
            Each checkbox adds one promoting style to the wrapper around the two
            overlapping chips. Open the devtools Layers tab (
            <InlineCode>F12</InlineCode>) and watch the layer appear with the
            matching reason pill. <InlineCode>opacity</InlineCode> is the one
            whose result reveals the layer itself: the subtree fades as one
            group, uniformly — no seam or darker patch where the chips overlap,
            because what fades is a single texture.
          </P>
          <Code lang="tsx">{`<node
  style={{
    opacity: 0.6,
    filter: { name: "grayscale" },
    transform3d: { perspective: 600,
      rotateY: 24 },
    cache: "always",
  }}
>…</node>`}</Code>
        </>
      }
      demo={PromotionCard}
    />
  );
}

function PromotionCard() {
  const [opacity, setOpacity] = useState(false);
  const [filter, setFilter] = useState(false);
  const [transform3d, setTransform3d] = useState(false);
  const [cache, setCache] = useState(false);

  const promoting: BevyStyle = {
    ...(opacity ? { opacity: 0.6 } : null),
    ...(filter ? { filter: { name: "grayscale" } } : null),
    ...(transform3d
      ? { transform3d: { perspective: 600, rotateY: 24 } }
      : null),
    ...(cache ? { cache: "always" as const } : null),
  };

  return (
    <node style={controlColumn}>
      <node style={{ ...overlapStage, ...promoting }}>
        <node style={{ ...chip, backgroundColor: Colors.primary100 }} />
        <node
          style={{
            ...chip,
            backgroundColor: Colors.green100,
            margin: { left: -28 },
          }}
        />
      </node>
      <Checkbox label="opacity: 0.6" enabled={opacity} onChange={setOpacity} />
      <Checkbox
        label="filter: grayscale"
        enabled={filter}
        onChange={setFilter}
      />
      <Checkbox
        label="transform3d"
        enabled={transform3d}
        onChange={setTransform3d}
      />
      <Checkbox label='cache: "always"' enabled={cache} onChange={setCache} />
    </node>
  );
}

function StaleCacheDemo() {
  return (
    <Example
      title="The stale cache"
      style={{ cache: "never" }}
      info={
        <>
          <P>
            Both portals show the <B>same</B> live minimap feed. The left one
            sits in a subtree promoted by <InlineCode>opacity</InlineCode>:
            nothing inside it ever produces dirt (the camera writes the texture
            GPU-side), so its cached capture is served forever — the feed
            visibly freezes while the cubes keep moving in the scene behind. The
            right one opts out with <InlineCode>{'cache: "never"'}</InlineCode>{" "}
            and stays live. (The left side stays live for a beat after mount so
            the freeze catches a real frame — otherwise it would freeze on the
            first capture, before the camera has drawn anything.)
          </P>
          <Code lang="tsx">{`// frozen: promoted, cached, no dirt
<node style={{ opacity: 0.9 }}>
  <portal target="minimap" />
</node>

// live: re-captures every frame
<node style={{ opacity: 0.9,
  cache: "never" }}>
  <portal target="minimap" />
</node>`}</Code>
          <P>
            The checkbox applies the fix to the frozen side. In the devtools
            Layers tab its <InlineCode>repaints</InlineCode> counter is flat
            while frozen and ticks every frame under{" "}
            <InlineCode>{'"never"'}</InlineCode>. Un-checking re-freezes it at
            the newest frame: the style change itself is dirt, so the layer
            re-captures once more.
          </P>
        </>
      }
      demo={StaleCacheCard}
    />
  );
}

function StaleCacheCard() {
  const [never, setNever] = useState(false);
  // Stay live for a beat after mount, so the freeze catches a real minimap
  // frame instead of the first capture (taken before the portal camera has
  // drawn anything — a frozen black box reads as "broken", not "stale").
  // Dropping `cache: "never"` is itself a style delta, so the layer
  // re-captures once at that moment and freezes there.
  const [warmingUp, setWarmingUp] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setWarmingUp(false), 1200);
    return () => clearTimeout(t);
  }, []);
  const leftLive = never || warmingUp;
  return (
    <node style={controlColumn}>
      <node style={row}>
        <node style={column}>
          <node
            style={{
              opacity: 0.9,
              ...(leftLive ? { cache: "never" as const } : null),
            }}
          >
            <portal target="minimap" style={portalView} />
          </node>
          <text style={caption}>
            {never ? 'cache: "never"' : warmingUp ? "warming up…" : "cached"}
          </text>
        </node>
        <node style={column}>
          <node style={{ opacity: 0.9, cache: "never" }}>
            <portal target="minimap" style={portalView} />
          </node>
          <text style={caption}>{'cache: "never"'}</text>
        </node>
      </node>
      <Checkbox
        label='cache: "never" on the left'
        enabled={never}
        onChange={setNever}
      />
    </node>
  );
}

const overlapStage: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  padding: 14,
};

const chip: BevyStyle = {
  width: 64,
  height: 64,
  borderRadius: 12,
};

const portalView: BevyStyle = {
  width: 120,
  height: 120,
  borderRadius: 8,
  border: 2,
  borderColor: Colors.surface500,
  backgroundColor: Colors.surface100,
};
