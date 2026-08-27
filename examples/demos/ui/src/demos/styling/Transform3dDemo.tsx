import { useEffect, useState } from "react";
import {
  Bold,
  InlineCode,
  ListItem,
  Paragraph,
  List,
} from "@/components/typography";
import {
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "bevy-react";
import {
  ControlColumn,
  DemoRow,
  Example,
  ParamControls,
  Slider,
  slider,
  useParams,
} from "@/components";
import { Code } from "@/components/docs";
import { useDemoPage, type ExplanationData } from "@/explanationStore";
import { TestBanner } from "@/components/TestBanner";

const PAGE: ExplanationData = {
  title: "3D transforms",
  info: (
    <>
      <Paragraph>
        <InlineCode>transform3d</InlineCode> applies a real 3D perspective
        transform to the subtree's rendered result at composite time: its
        presence (even an identity <InlineCode>{"{}"}</InlineCode>) promotes the
        subtree to a <Bold>composited layer</Bold>, and animating it never
        re-captures the content.
      </Paragraph>
      <Code lang="tsx">{`<node
  style={{
    transform3d: { perspective: 600, rotateX: 14, rotateY: 40 },
  }}
>
  …
</node>`}</Code>
      <List>
        <ListItem>
          Fields apply in a fixed order — scale, rotateX/Y/Z (degrees),
          translate, perspective — around <InlineCode>origin</InlineCode>.
        </ListItem>
        <ListItem>
          Picking, hover styling, and the cursor all follow the transformed
          visual, not the layout rect.
        </ListItem>
        <ListItem>
          transition: {"{ transform3d }"} eases field-wise, but unsetting the
          whole field demotes the layer and snaps — keep an identity {"{}"} in
          the base style when removal should ease.
        </ListItem>
        <ListItem>
          An {"{ animated }"} wrapper on any field drives it from the animation
          engine.
        </ListItem>
      </List>
    </>
  ),
};

export function Transform3dDemo() {
  useDemoPage(PAGE);
  return (
    <>
      <DemoRow>
        <PerspectiveDemo />
        <OrthographicDemo />
      </DemoRow>
      <DemoRow>
        <OriginDemo />
        <FlipCardDemo />
        <SpinningDemo />
      </DemoRow>
    </>
  );
}

function PerspectiveDemo() {
  return (
    <Example
      title="Perspective"
      info={
        <>
          <Paragraph>
            <InlineCode>perspective</InlineCode> sets the focal distance of the
            projection: small values put the camera close (dramatic divergence,
            near edges balloon), large values flatten toward orthographic. Match
            the tilt on the orthographic card next door to compare the
            projections.
          </Paragraph>
          <Code lang="tsx">{`transform3d: { perspective: 600, rotateX: 14, rotateY: 40 }`}</Code>
        </>
      }
      demo={PerspectiveCard}
    />
  );
}

function PerspectiveCard() {
  const [{ rotateX, rotateY, perspective }, controls] = useParams(PERSPECTIVE);
  return (
    <ControlColumn>
      <TestBanner style={{ transform3d: { perspective, rotateX, rotateY } }} />
      <ParamControls {...controls} />
    </ControlColumn>
  );
}

const PERSPECTIVE = {
  rotateX: slider(-80, 80, 14, { unit: "\u00b0" }),
  rotateY: slider(-80, 80, 40, { unit: "\u00b0" }),
  perspective: slider(200, 1000, 600),
};

function OrthographicDemo() {
  return (
    <Example
      title="Orthographic"
      info={
        <>
          <Paragraph>
            The same tilt without a <InlineCode>perspective</InlineCode> field:
            an orthographic projection foreshortens (the rotated face gets
            narrower) but parallel edges never diverge — no vanishing point, no
            near-edge magnification.
          </Paragraph>
          <Code lang="tsx">{`// no perspective field
transform3d: { rotateX: 14, rotateY: 40 }`}</Code>
        </>
      }
      demo={OrthographicCard}
    />
  );
}

function OrthographicCard() {
  const [rx, setRx] = useState(14);
  const [ry, setRy] = useState(40);
  return (
    <ControlColumn>
      <TestBanner
        style={{
          transform3d: {
            rotateX: rx,
            rotateY: ry,
          },
        }}
      />

      <Slider
        value={rx}
        min={-80}
        max={80}
        onChange={setRx}
        name="rotateX"
        unit="°"
      />
      <Slider
        value={ry}
        min={-80}
        max={80}
        onChange={setRy}
        name="rotateY"
        unit="°"
      />
    </ControlColumn>
  );
}

function OriginDemo() {
  return (
    <Example
      title="Transform origin"
      info={
        <>
          <Paragraph>
            <InlineCode>origin</InlineCode> sets the pivot (and the vanishing
            point). The door swings on an endless animated loop — pause, open,
            pause, close — while the slider drags the hinge from the left edge
            to the right: at 0% it swings like a door, at 50% it flips in place.
          </Paragraph>
          <Code lang="tsx">{`transform3d: {
  perspective: 800,
  rotateY: { animated: swing },
  origin: { x: \`\${origin}%\`, y: "0%" },
}`}</Code>
        </>
      }
      demo={OriginCard}
    />
  );
}

function OriginCard() {
  const swing = useSharedValue(0);
  const [origin, setOrigin] = useState(0);

  useEffect(() => {
    swing.value = withRepeat(
      withSequence(
        withDelay(600, withTiming(55, { duration: 700, easing: "easeInOut" })),
        withDelay(600, withTiming(0, { duration: 700, easing: "easeInOut" })),
      ),
    );
  }, [swing]);

  return (
    <ControlColumn>
      <TestBanner
        style={{
          transform3d: {
            perspective: 800,
            rotateY: { animated: swing },
            origin: { x: `${origin}%`, y: "0%" },
          },
        }}
      />

      <Slider
        value={origin}
        min={0}
        max={100}
        onChange={setOrigin}
        name="origin"
        unit="%"
      />
    </ControlColumn>
  );
}

function FlipCardDemo() {
  return (
    <Example
      title="Flip cards"
      info={
        <>
          <Paragraph>
            An endless flip loop: rest, flip to the back, rest, flip home. Past
            90° the mirrored backface still renders and picks — hover the banner
            mid-flip and the interaction follows the transformed visual, not the
            layout rect.
          </Paragraph>
          <Code lang="tsx">{`flip.value = withRepeat(
  withSequence(
    withDelay(700, withTiming(180, { duration: 600 })),
    withDelay(700, withTiming(0, { duration: 600 })),
  ),
);

transform3d: { perspective: 700, rotateY: { animated: flip } }`}</Code>
        </>
      }
      demo={FlipCardCard}
    />
  );
}

function FlipCardCard() {
  const flip = useSharedValue(0);

  useEffect(() => {
    flip.value = withRepeat(
      withSequence(
        withDelay(700, withTiming(180, { duration: 600, easing: "easeInOut" })),
        withDelay(700, withTiming(0, { duration: 600, easing: "easeInOut" })),
      ),
    );
  }, [flip]);

  return (
    <ControlColumn>
      <TestBanner
        style={{
          transform3d: {
            perspective: 700,
            rotateY: { animated: flip },
          },
        }}
      />
    </ControlColumn>
  );
}

function SpinningDemo() {
  return (
    <Example
      title="Spinning"
      info={
        <>
          <Paragraph>
            An {"{ animated }"} wrapper drives single fields (degrees for
            rotations) straight from the animation engine — one shared value
            spins both axes indefinitely, and every frame is a composite-time
            cache hit, never a re-capture.
          </Paragraph>
          <Code lang="tsx">{`spin.value = withRepeat(
  withTiming(360, { duration: 2400, easing: "linear" }),
);

transform3d: {
  perspective: 600,
  rotateX: { animated: spin },
  rotateY: { animated: spin },
}`}</Code>
        </>
      }
      demo={SpinningCard}
    />
  );
}

function SpinningCard() {
  const spin = useSharedValue(0);

  const start = () => {
    spin.value = 0;
    spin.value = withRepeat(
      withTiming(360, { duration: 2400, easing: "linear" }),
    );
  };
  useEffect(start, [spin]);

  return (
    <ControlColumn>
      <TestBanner
        style={{
          transform3d: {
            perspective: 600,
            rotateX: { animated: spin },
            rotateY: { animated: spin },
          },
        }}
      />
    </ControlColumn>
  );
}
