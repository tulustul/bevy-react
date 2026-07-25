import { DemoRow } from "@/components";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { FadeDemo, EasingDemo, LayoutColorDemo } from "./timingDemos";
import { SpringDemo, SequenceDemo, SpinDemo } from "./driverDemos";
import { ShowcaseDemo } from "./showcaseDemo";

const TYPESCRIPT = `const x = useSharedValue(0);
x.value = withTiming(200, {
  duration: 800,
});
<Animated.node
  animatedStyle={{ translateX: x }}
/>`;

const PAGE: ExplanationData = {
  title: "Animated Values",
  description: `The imperative animation API, Reanimated-style: useSharedValue
creates a value that lives on the Bevy side, animatedStyle binds it to style
fields, and drivers — withTiming, withSpring, withSequence, withDelay,
withRepeat — describe how it moves; cancelAnimation freezes it in place and a
trailing function on a driver is its completion callback. React renders once;
every frame after that is Bevy's. Click a card for the details of each driver.`,
  tsx: TYPESCRIPT,
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
