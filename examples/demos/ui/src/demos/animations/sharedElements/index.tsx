import { DemoRow } from "@/components";
import { Bold, InlineCode, Paragraph } from "@/components/typography";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { Gallery } from "./galleryCard";
import { MoveBetweenCards } from "./ticketsBoard";

// Shared elements: a `sharedTag` on two nodes that swap in one commit (the
// grid's thumbnail unmounts, the detail's hero mounts) makes the incoming
// node start where the outgoing one was and fly to its own layout. Nothing
// imperative — the commit is the trigger.

const PAGE: ExplanationData = {
  title: "Shared elements",
  info: (
    <>
      <Paragraph>
        Give two nodes that swap in one commit the same{" "}
        <InlineCode>sharedTag</InlineCode> and the incoming one{" "}
        <Bold>starts where the outgoing one was</Bold> — rect, color, opacity,
        transforms, filters — then eases to its own layout and style. React has
        no reparenting (a "move" is an unmount plus a mount), so identity is the
        tag and the commit is the trigger: no hooks, no measuring.
      </Paragraph>
      <Code lang="tsx">{`// grid
<image sharedTag="hero-1" src={thumb} />

// detail, mounted in the same commit
<image
  sharedTag="hero-1"
  src={full}
  style={{
    width: 200,
    transition: {
      sharedElement: { duration: 450 },
    },
  }}
/>`}</Code>
      <Paragraph>
        <InlineCode>{"transition: { sharedElement }"}</InlineCode> is the one
        timing for every seeded channel (required). Pairs need the same tag,
        element type and UI root; the first mounted match wins, silently.
      </Paragraph>
    </>
  ),
};

export function SharedElementsDemo() {
  useDemoPage(PAGE);

  return (
    <DemoRow>
      <Gallery />
      <MoveBetweenCards />
    </DemoRow>
  );
}
