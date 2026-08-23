import { useEffect, useState } from "react";
import {
  interpolateColor,
  useSharedValue,
  withRepeat,
  withTiming,
} from "bevy-react";
import { DemoRow, Example, Slider } from "@/components";
import { Code, CodeTabs, InlineCode, Li, P, Ul } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";
import { box, controlColumn, stage } from "./shared";

const PAGE: ExplanationData = {
  title: "Background image",
  info: (
    <>
      <P>
        <InlineCode>backgroundImage</InlineCode> paints a texture as part of a
        node's own background: over <InlineCode>backgroundColor</InlineCode> and{" "}
        <InlineCode>backgroundGradient</InlineCode>, under the content. It never
        affects layout, and the color shows through while the texture loads.
      </P>
      <Code lang="tsx">{`backgroundImage: {
  src: "images/parrot.png", // or { texture: "checker" }
  mode: "repeat",
  scale: 0.25,
  tint: "#7aa2f7",
}`}</Code>
      <Ul>
        <Li>
          src is an asset path or {"{ texture }"} naming a static texture the
          app registered host-side (for live content use a portal element).
        </Li>
        <Li>Repeat modes tile at the texture's logical size times scale.</Li>
        <Li>
          tint animates via an interpolateColor binding; a hoverStyle swap
          happens Bevy-side.
        </Li>
      </Ul>
    </>
  ),
};

export function BackgroundImageDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <StretchDemo />
        <RepeatDemo />
      </DemoRow>
      <DemoRow>
        <TintHoverDemo />
        <HostTextureDemo />
      </DemoRow>
    </>
  );
}

function StretchDemo() {
  return (
    <Example
      title="stretch (default)"
      info={
        <>
          <P>
            The texture fills the box exactly;{" "}
            <InlineCode>borderRadius</InlineCode> clips it. The{" "}
            <InlineCode>backgroundColor</InlineCode> underneath shows while the
            asset loads.
          </P>
          <Code lang="tsx">{`<node
  style={{
    width: 150,
    height: 96,
    borderRadius: 10,
    backgroundImage: { src: "images/parrot.png" },
  }}
/>`}</Code>
        </>
      }
      demo={StretchCard}
    />
  );
}

function StretchCard() {
  return (
    <node style={stage}>
      <node
        style={{
          ...box,
          backgroundColor: Colors.transparent,
          width: 150,
          height: 96,
          backgroundImage: { src: "images/parrot.png" },
        }}
      />
    </node>
  );
}

function RepeatDemo() {
  return (
    <Example
      title="repeat + scale"
      info={
        <>
          <P>
            Repeat modes tile the texture at its logical size times{" "}
            <InlineCode>scale</InlineCode>, DPI-corrected. Drag the slider to
            retile.
          </P>
          <Code lang="tsx">{`const [scale, setScale] = useState(0.25);

<node
  style={{
    backgroundImage: {
      src: "bevy-react-logo.png",
      mode: "repeat",
      scale,
    },
  }}
/>`}</Code>
        </>
      }
      demo={RepeatCard}
    />
  );
}

function RepeatCard() {
  const [scale, setScale] = useState(0.25);
  return (
    <node style={{ ...stage, ...controlColumn }}>
      <node
        style={{
          backgroundColor: Colors.transparent,
          width: 220,
          height: 110,
          borderRadius: 10,
          backgroundImage: {
            src: "bevy-react-logo.png",
            mode: "repeat",
            scale,
          },
        }}
      />
      <Slider
        value={scale}
        min={0.1}
        max={0.6}
        label={`scale ${scale.toFixed(2)}`}
        onChange={setScale}
      />
    </node>
  );
}

function TintHoverDemo() {
  return (
    <Example
      title="tint (animated) + hoverStyle"
      info={
        <>
          <P>
            <InlineCode>tint</InlineCode> multiplies the texture and animates
            via an <InlineCode>interpolateColor</InlineCode> binding (base style
            only) — the binding runs Bevy-side, so no React re-render happens
            per frame. Hovering swaps the whole{" "}
            <InlineCode>backgroundImage</InlineCode> to the untinted image; the
            swap happens Bevy-side too.
          </P>
          <Code lang="tsx">{`const t = useSharedValue(0);
useEffect(() => {
  t.value = withRepeat(
    withTiming(1, { duration: 1600, easing: "easeInOut" }),
    { reverse: true },
  );
}, [t]);

<node
  style={{
    backgroundImage: {
      src: "images/parrot.png",
      tint: {
        animated: interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]),
      },
    },
  }}
  hoverStyle={{
    backgroundImage: { src: "images/parrot.png" },
  }}
/>`}</Code>
        </>
      }
      demo={TintHoverCard}
    />
  );
}

function TintHoverCard() {
  // Drives the tint hue back and forth; the binding runs Bevy-side, so no
  // React re-render happens per frame.
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1600, easing: "easeInOut" }),
      { reverse: true },
    );
  }, [t]);
  return (
    <node style={stage}>
      <node
        style={{
          ...box,
          backgroundColor: Colors.transparent,
          width: 120,
          height: 120,
          backgroundImage: {
            src: "images/parrot.png",
            tint: {
              animated: interpolateColor(t, [0, 1], ["#7aa2f7", "#f7768e"]),
            },
          },
        }}
        // The hover swap the docs describe: hovering shows the untinted
        // image (the whole backgroundImage value is swapped Bevy-side).
        hoverStyle={{
          backgroundImage: { src: "images/parrot.png" },
        }}
      />
    </node>
  );
}

function HostTextureDemo() {
  return (
    <Example
      title="src: { texture }"
      info={
        <>
          <P>
            A static texture the host generated once and registered under a name
            (<InlineCode>RenderTargets::register</InlineCode>) — here a 64px
            plaid painted CPU-side at startup, tiled. Unknown names stay
            transparent and bind late. For live content, use a portal element
            instead.
          </P>
          <CodeTabs
            tsx={`<node
  style={{
    backgroundImage: {
      src: { texture: "checker" },
      mode: "repeat",
    },
  }}
/>`}
            rust={`fn register_host_textures(
    mut targets: ResMut<bevy_react::portal::RenderTargets>,
    mut images: ResMut<Assets<Image>>,
) {
    // Paint a 64x64 plaid CPU-side, once at startup.
    let image = Image::new(
        Extent3d { width: 64, height: 64, depth_or_array_layers: 1 },
        TextureDimension::D2,
        data,
        TextureFormat::Rgba8UnormSrgb,
        RenderAssetUsages::MAIN_WORLD | RenderAssetUsages::RENDER_WORLD,
    );
    let handle = images.add(image);
    targets.register("checker", handle);
}

app.add_systems(Startup, register_host_textures);`}
          />
        </>
      }
      demo={HostTextureCard}
    />
  );
}

function HostTextureCard() {
  return (
    <node style={stage}>
      <node
        style={{
          width: 190,
          height: 130,
          borderRadius: 12,
          backgroundColor: Colors.surface400,
          backgroundImage: {
            src: { texture: "checker" },
            mode: "repeat",
          },
          justifyContent: "flexEnd",
          alignItems: "center",
          padding: 6,
        }}
      />
    </node>
  );
}
