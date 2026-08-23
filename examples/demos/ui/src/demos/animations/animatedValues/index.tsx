import { DemoRow } from "@/components";
import { Code, InlineCode, Li, P, Ul } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { FadeDemo, EasingDemo, LayoutColorDemo } from "./timingDemos";
import { SpringDemo, SequenceDemo, SpinDemo } from "./driverDemos";
import { ShowcaseDemo } from "./showcaseDemo";

const PAGE: ExplanationData = {
  title: "Animated Values",
  info: (
    <>
      <P>
        The imperative animation API, Reanimated-style:{" "}
        <InlineCode>useSharedValue</InlineCode> creates a value that lives on
        the Bevy side, an {"{ animated }"} wrapper written inline in a style
        binds it to that field, and drivers —{" "}
        <InlineCode>withTiming</InlineCode>, <InlineCode>withSpring</InlineCode>
        , <InlineCode>withSequence</InlineCode>,{" "}
        <InlineCode>withDelay</InlineCode>, <InlineCode>withRepeat</InlineCode>{" "}
        — describe how it moves.
      </P>
      <Code lang="tsx">{`const x = useSharedValue(0);
x.value = withTiming(200, { duration: 800 });

<node style={{ transform: { translateX: { animated: x } } }} />`}</Code>
      <Ul>
        <Li>
          React renders once; every frame after that is Bevy's — no per-frame
          re-renders.
        </Li>
        <Li>cancelAnimation freezes the value in place.</Li>
        <Li>A trailing function on a driver is its completion callback.</Li>
        <Li>Click a card for the details of each driver.</Li>
      </Ul>
    </>
  ),
};

export function AnimatedValuesDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <FadeDemo />
        <EasingDemo />
      </DemoRow>
      <DemoRow>
        <SpringDemo />
        <SequenceDemo />
      </DemoRow>
      <DemoRow>
        <SpinDemo />
        <LayoutColorDemo />
      </DemoRow>
      <DemoRow>
        <ShowcaseDemo />
      </DemoRow>
    </>
  );
}
