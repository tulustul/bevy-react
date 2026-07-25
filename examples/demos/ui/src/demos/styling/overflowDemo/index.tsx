import { DemoRow } from "@/components";
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
  description: `overflowX/overflowY decide what happens to content bigger
than the node's box: visible spills out, clip and hidden cut it off (they
differ only in flex sizing — clip keeps the content width as a flex-item
minimum, hidden lets the box shrink to 0), and scroll clips it and makes the
node a wheel-scrollable container. scrollTop/scrollLeft are controlled props
synced back via onScroll; style.scrollbar adds a visible draggable bar
("default" or a styled track/thumb object with side and gutter-vs-float
placement), and transition: { scroll } eases the offset instead of snapping.`,
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
