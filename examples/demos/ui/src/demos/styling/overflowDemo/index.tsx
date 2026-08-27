import { DemoRow } from "@/components";
import { InlineCode, ListItem, Paragraph, List } from "@/components/typography";
import { Code } from "@/components/docs";
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
      <Paragraph>
        <InlineCode>overflowX</InlineCode>/<InlineCode>overflowY</InlineCode>{" "}
        decide what happens to content bigger than the node's box:{" "}
        <InlineCode>visible</InlineCode> spills out,{" "}
        <InlineCode>clip</InlineCode> and <InlineCode>hidden</InlineCode> cut it
        off, and <InlineCode>scroll</InlineCode> clips it and makes the node a
        wheel-scrollable container.
      </Paragraph>
      <Code lang="tsx">{`<node
  style={{
    overflowY: "scroll",
    scrollbar: "default",
    transition: { scroll: { duration: 200 } },
  }}
  scrollTop={scrollTop}
  onScroll={(e) => setScrollTop(e.scrollTop)}
>`}</Code>
      <List>
        <ListItem>
          clip and hidden differ only in flex sizing: clip keeps the content
          width as a flex-item minimum, hidden lets the box shrink to 0.
        </ListItem>
        <ListItem>
          scrollTop/scrollLeft are controlled props, synced back via onScroll.
        </ListItem>
        <ListItem>
          style.scrollbar adds a visible draggable bar — "default" or a styled
          track/thumb object with side and gutter-vs-float placement.
        </ListItem>
        <ListItem>
          transition: {"{ scroll }"} eases the offset instead of snapping.
        </ListItem>
      </List>
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
