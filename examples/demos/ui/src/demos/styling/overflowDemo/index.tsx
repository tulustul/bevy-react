import { DemoRow } from "@/components";
import { Code, InlineCode, Li, P, Ul } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { ClipVsHiddenDemo, OverflowModesDemo } from "./clipDemos";
import {
  ControlledScrollDemo,
  HorizontalScrollbarDemo,
  ScrollbarDefaultDemo,
  ScrollbarFloatDemo,
  ScrollbarLeftDemo,
  ScrollbarStatesDemo,
  ScrollbarStyledDemo,
  SmoothScrollDemo,
  WheelScrollDemo,
} from "./scrollDemos";

const PAGE: ExplanationData = {
  title: "Overflow",
  info: (
    <>
      <P>
        <InlineCode>overflowX</InlineCode>/<InlineCode>overflowY</InlineCode>{" "}
        decide what happens to content bigger than the node's box:{" "}
        <InlineCode>visible</InlineCode> spills out,{" "}
        <InlineCode>clip</InlineCode> and <InlineCode>hidden</InlineCode> cut it
        off, and <InlineCode>scroll</InlineCode> clips it and makes the node a
        wheel-scrollable container.
      </P>
      <Code lang="tsx">{`<node
  style={{
    overflowY: "scroll",
    scrollbar: "default",
    transition: { scroll: { duration: 200 } },
  }}
  scrollTop={scrollTop}
  onScroll={(e) => setScrollTop(e.scrollTop)}
>`}</Code>
      <Ul>
        <Li>
          clip and hidden differ only in flex sizing: clip keeps the content
          width as a flex-item minimum, hidden lets the box shrink to 0.
        </Li>
        <Li>
          scrollTop/scrollLeft are controlled props, synced back via onScroll.
        </Li>
        <Li>
          style.scrollbar adds a visible draggable bar — "default" or a styled
          track/thumb object with side and gutter-vs-float placement.
        </Li>
        <Li>
          transition: {"{ scroll }"} eases the offset instead of snapping.
        </Li>
      </Ul>
    </>
  ),
};

export function OverflowDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <OverflowModesDemo />
        <ClipVsHiddenDemo />
      </DemoRow>
      <DemoRow>
        <WheelScrollDemo />
        <ControlledScrollDemo />
        <SmoothScrollDemo />
      </DemoRow>
      <DemoRow>
        <ScrollbarDefaultDemo />
        <ScrollbarStyledDemo />
        <ScrollbarFloatDemo />
      </DemoRow>
      <DemoRow>
        <ScrollbarLeftDemo />
        <ScrollbarStatesDemo />
        <HorizontalScrollbarDemo />
      </DemoRow>
    </>
  );
}
