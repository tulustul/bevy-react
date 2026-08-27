import { useState } from "react";
import {
  Caption,
  InlineCode,
  ListItem,
  Paragraph,
  List,
} from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { DemoRow, Example, Figure, Radio, stage } from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Colors } from "@/theme";

type Mode = "auto" | "bilinear" | "trilinear" | "nearest";
type Pic = "parrot" | "pixelArt" | "pattern";

const MODE_OPTIONS: { label: string; value: Mode }[] = [
  { label: "auto", value: "auto" },
  { label: "bilinear", value: "bilinear" },
  { label: "trilinear", value: "trilinear" },
  { label: "nearest", value: "nearest" },
];

const PIC_OPTIONS: { label: string; value: Pic }[] = [
  { label: "parrot", value: "parrot" },
  { label: "pixel art", value: "pixelArt" },
  { label: "pattern", value: "pattern" },
];

/** Each picture is shown at three sizes, one of them its native size. */
const PICS: Record<
  Pic,
  { src: string; width: number; height: number; sizes: number[] }
> = {
  parrot: {
    src: "images/parrot.png",
    width: 486,
    height: 526,
    sizes: [160, 64],
  },
  pattern: {
    src: "images/test-pattern.png",
    width: 512,
    height: 512,
    sizes: [160, 64],
  },
  pixelArt: {
    src: "images/sprite-12px.png",
    width: 12,
    height: 12,
    sizes: [120, 60, 30],
  },
};

const PAGE: ExplanationData = {
  title: "Image rendering",
  info: (
    <>
      <Paragraph>
        <InlineCode>imageRendering</InlineCode> picks how a node's raster source
        — an <InlineCode>{"<image src>"}</InlineCode> or a{" "}
        <InlineCode>backgroundImage</InlineCode> — is resampled when it is drawn
        at a size other than its own. A loaded PNG has a single mip level, so a
        large image drawn small aliases and shimmers under plain bilinear
        sampling.
      </Paragraph>
      <Code lang="tsx">{`<image
  src="images/parrot.png"
  style={{
    width: 64,
    imageRendering: "trilinear",
  }}
/>`}</Code>
      <List>
        <ListItem>
          trilinear generates a mip pyramid for the image (once, off-thread) and
          samples across levels — the fix for minification.
        </ListItem>
        <ListItem>
          bilinear is level 0 only (the engine default, what auto means today);
          nearest is nearest-neighbor for pixel art.
        </ListItem>
        <ListItem>
          Per node, not inherited. Each explicit mode is a derived copy of the
          asset per (source, mode): the source is never modified, two nodes with
          different modes on one file both render as asked, and the copy is
          shared and dropped with its last user.
        </ListItem>
        <ListItem>
          Composited layers are unaffected; on a live texture (render target,
          portal, canvas, svg) every mode is ignored with a warning.
        </ListItem>
      </List>
    </>
  ),
};

export function ImageRenderingDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <ImageElementDemo />
      </DemoRow>
      <DemoRow>
        <BackgroundImageDemo />
      </DemoRow>
    </>
  );
}

/** The card body stacks the sizes row over the controls (a native 486px
 *  column beside the radios would overrun the page). */
const body: BevyStyle = { ...stage, flexDirection: "column" };

const sizesRow: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flexEnd",
  gap: 18,
  padding: 30,
};

const controls: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

/** Hover feedback: the element scales up 20% (the texture is resampled at
 *  the larger size), eased by the `transform` transition. */
const hoverScale: BevyStyle = { transform: { scale: 1.2 } };
const hoverTransition: BevyStyle["transition"] = {
  transform: { duration: 200 },
};

function useControls() {
  const [mode, setMode] = useState<Mode>("trilinear");
  const [pic, setPic] = useState<Pic>("parrot");
  const picture = PICS[pic];
  const sizeOf = (width: number) => ({
    width,
    height: (width * picture.height) / picture.width,
  });
  const label = (width: number) =>
    width === picture.width ? `${width}px (native)` : `${width}px`;
  const panel = (
    <node style={controls}>
      <Caption>rendering</Caption>
      <Radio options={MODE_OPTIONS} value={mode} onChange={setMode} />
      <Caption>image</Caption>
      <Radio options={PIC_OPTIONS} value={pic} onChange={setPic} />
    </node>
  );
  return { mode, picture, sizeOf, label, panel };
}

function ImageElementDemo() {
  return (
    <Example
      title="<image>"
      info={
        <>
          <Paragraph>
            One picture at three sizes — one of them native — under the selected
            mode. Minified, <InlineCode>bilinear</InlineCode> aliases and{" "}
            <InlineCode>trilinear</InlineCode> stays smooth; magnified pixel art
            is crisp only under <InlineCode>nearest</InlineCode>. Hover an image
            to scale it 20% and watch the resampling follow.
          </Paragraph>
          <Code lang="tsx">{`<image
  src="images/parrot.png"
  style={{
    width: 64,
    height: 69,
    imageRendering: mode,
    transition: {
      transform: { duration: 0.2 },
    },
  }}
  hoverStyle={{
    transform: { scale: 1.2 },
  }}
/>`}</Code>
        </>
      }
      demo={ImageElementCard}
    />
  );
}

function ImageElementCard() {
  const { mode, picture, sizeOf, label, panel } = useControls();
  return (
    <node style={body}>
      <node style={sizesRow}>
        {picture.sizes.map((width) => (
          <Figure key={width} style={{ gap: 6 }} caption={label(width)}>
            <image
              src={picture.src}
              style={{
                ...sizeOf(width),
                imageRendering: mode,
                transform: { scale: 1 },
                transition: hoverTransition,
              }}
              hoverStyle={hoverScale}
            />
          </Figure>
        ))}
      </node>
      {panel}
    </node>
  );
}

function BackgroundImageDemo() {
  return (
    <Example
      title="backgroundImage"
      info={
        <>
          <Paragraph>
            The same keyword governs a node's{" "}
            <InlineCode>backgroundImage</InlineCode> — every raster source drawn
            through the node. Same picture, same three sizes, painted as a
            background; the file itself is never modified.
          </Paragraph>
          <Code lang="tsx">{`<node
  style={{
    width: 64,
    height: 69,
    backgroundImage: {
      src: "images/parrot.png",
    },
    imageRendering: mode,
    transition: {
      transform: { duration: 0.2 },
    },
  }}
  hoverStyle={{
    transform: { scale: 1.2 },
  }}
/>`}</Code>
        </>
      }
      demo={BackgroundImageCard}
    />
  );
}

function BackgroundImageCard() {
  const { mode, picture, sizeOf, label, panel } = useControls();
  return (
    <node style={body}>
      <node style={sizesRow}>
        {picture.sizes.map((width) => (
          <Figure key={width} style={{ gap: 6 }} caption={label(width)}>
            <node
              style={{
                ...sizeOf(width),
                borderRadius: 6,
                backgroundColor: Colors.surface300,
                backgroundImage: { src: picture.src },
                imageRendering: mode,
                transform: { scale: 1 },
                transition: hoverTransition,
              }}
              hoverStyle={hoverScale}
            />
          </Figure>
        ))}
      </node>
      {panel}
    </node>
  );
}
