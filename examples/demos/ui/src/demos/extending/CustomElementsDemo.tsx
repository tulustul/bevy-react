import { useEffect, useState } from "react";
import {
  interpolate,
  interpolateColor,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "bevy-react";
import { InlineCode, Paragraph } from "@/components/typography";
import { ControlColumn, DemoRow, Example, Readout, Slider } from "@/components";
import { Code, CodeTabs } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

// `<cube>` is not part of bevy-react: the demos app registers it in
// `examples/demos/cube/mod.rs` through the same API the feature crates use,
// and `bevy.ts` (generated) types its props. Every `<cube>` is one 3D mesh
// entity in the world — the page owns them all (outside the cards), so the
// Details modal never mounts a second set.

const ELEMENT_RUST = `// An attribute: a number or an { animated } wrapper, published
// under the "cube" domain when bound.
pub static SIZE: Attribute<Animatable<f32>> = Attribute {
    animated: Some(AttrBinding { domain: "cube", binding: animatable_binding::<f32> }),
    ..Attribute::with_codec("size", Codec::serde_as("Animatable<number>"))
};

pub static CUBE: Element = Element {
    // No Node, never parented under the React parent.
    flags: ElementFlags { detached: true, ..ElementFlags::NODE_LESS },
    attrs: &[&SIZE, &X, &Y, &Z, &ROTATE_Y, &COLOR],
    common: Common::IDENTITY.with(Common::POINTER),
    writers: &[&CUBE_WRITER], // attributes → CubeAttrs
    spawn: Some(spawn_cube),  // Cube + Transform + mesh + material
    ..Element::new("cube")
};

app.add_react_element(&CUBE);`;

const ELEMENT_TSX = `// bevy.ts (generated) augments the JSX intrinsics:
<cube x={1} y={0.5} size={0.4} rotateY={45} color="hsl(30, 80%, 60%)" />`;

const CONSUMER_RUST = `// Bound attributes arrive as this frame's driven values.
fn apply_cube_attrs(
    mut cubes: Query<(&CubeAttrs, Option<&DrivenExtValues>, &mut Transform, …)>,
    …
) {
    for (attrs, driven, mut transform, …) in &mut cubes {
        let size = driven
            .and_then(|d| d.get("cube", "size"))
            .or(attrs.size.value)
            .unwrap_or(1.0);
        let color = driven.and_then(|d| d.get_color("cube", "color"));
        …
    }
}`;

const PAGE: ExplanationData = {
  title: "Custom elements",
  startCollapsed: true,
  info: (
    <>
      <Paragraph>
        An app registers its own JSX elements with{" "}
        <InlineCode>app.add_react_element</InlineCode> — the same API the{" "}
        <InlineCode>{"<svg>"}</InlineCode>,{" "}
        <InlineCode>{"<canvas>"}</InlineCode> and{" "}
        <InlineCode>{"<portal>"}</InlineCode> crates use. An element needn't be
        UI at all: every <InlineCode>{"<cube>"}</InlineCode> here is a 3D mesh
        entity, spawned, updated and despawned by React.
      </Paragraph>
      <CodeTabs tsx={ELEMENT_TSX} rust={ELEMENT_RUST} />
      <Paragraph>
        Attributes accept <InlineCode>{"{ animated }"}</InlineCode> wrappers:
        the animation engine evaluates each binding every frame and publishes
        the result — a number, or a color for{" "}
        <InlineCode>interpolateColor</InlineCode> — for the element's own system
        to apply.
      </Paragraph>
      <Code lang="rust">{CONSUMER_RUST}</Code>
    </>
  ),
};

export function CustomElementsDemo() {
  useDemoPage(PAGE);
  const [count, setCount] = useState(216);
  const [clicked, setClicked] = useState<number | null>(null);

  return (
    <>
      <DemoRow>
        <LatticeExample count={count} onCount={setCount} />
        <RingExample clicked={clicked} />
      </DemoRow>
      {LATTICE.slice(0, count).map((c, i) => (
        <cube
          key={i}
          x={c.x}
          y={c.y}
          z={c.z}
          size={CUBE_SIZE}
          color={c.color}
        />
      ))}
      {RING.map((pair, i) => (
        <RingCube key={i} index={i} colors={pair} onPick={setClicked} />
      ))}
    </>
  );
}

// --- Lattice -----------------------------------------------------------------

const EDGE = 10;
const SPACING = 0.5;
const CUBE_SIZE = 0.4;

type LatticeCube = { x: number; y: number; z: number; color: string };

/** Every point of a 10×10×10 grid centered on the origin, in build-up order:
 *  by Chebyshev distance (so the shape completes a whole cube at 8, 64, 216,
 *  512 and 1000), then by distance within a shell (each new layer grows from
 *  its face centers to its corners). Colored warm core → cool edges. */
const LATTICE: LatticeCube[] = (() => {
  const half = (EDGE - 1) / 2;
  const points: { i: number[]; shell: number; dist: number }[] = [];
  for (let x = 0; x < EDGE; x++)
    for (let y = 0; y < EDGE; y++)
      for (let z = 0; z < EDGE; z++) {
        const i = [x - half, y - half, z - half];
        points.push({
          i,
          shell: Math.max(...i.map(Math.abs)),
          dist: Math.hypot(...i),
        });
      }
  points.sort((a, b) => a.shell - b.shell || a.dist - b.dist);
  const maxDist = Math.hypot(half, half, half);
  return points.map(({ i: [x, y, z], dist }) => {
    // Orange core → pink → violet → blue edges (hue 30 down to -140 ≡ 220).
    const hue = Math.round((30 - 170 * (dist / maxDist) + 360) % 360);
    return {
      x: x * SPACING,
      y: y * SPACING,
      z: z * SPACING,
      color: `hsl(${hue}, 80%, 60%)`,
    };
  });
})();

const LATTICE_TSX = `const [count, setCount] = useState(216);

{LATTICE.slice(0, count).map((c, i) => (
  <cube key={i} x={c.x} y={c.y} z={c.z} size={0.4} color={c.color} />
))}`;

function LatticeExample({
  count,
  onCount,
}: {
  count: number;
  onCount: (n: number) => void;
}) {
  return (
    <Example
      title="Lattice"
      info={
        <>
          <Paragraph>
            Plain React state renders a list of{" "}
            <InlineCode>{"<cube>"}</InlineCode> elements; the slider grows or
            shrinks it, and each mount or unmount spawns or despawns a mesh
            entity. The positions are ordered so the lattice builds up around
            the center, completing a whole cube at 8, 64, 216, 512 and 1000.
          </Paragraph>
          <Code lang="tsx">{LATTICE_TSX}</Code>
        </>
      }
    >
      <ControlColumn style={{ width: 260 }}>
        <Slider
          value={count}
          min={1}
          max={LATTICE.length}
          name="Cubes"
          onChange={(v) => onCount(Math.round(v))}
        />
      </ControlColumn>
    </Example>
  );
}

// --- Ring --------------------------------------------------------------------

const RING_RADIUS = 6;

// Each cube breathes between two hues of the subject palette.
const RING: [string, string][] = [
  [Colors.cyan, Colors.rose],
  [Colors.mint, Colors.violet],
  [Colors.ember, Colors.sky],
  [Colors.violet, Colors.amber],
  [Colors.amber, Colors.cyan],
  [Colors.rose, Colors.mint],
];

const RING_TSX = `const t = useSharedValue(0);
const lift = useSharedValue(0);

useEffect(() => {
  t.value = withDelay(
    index * 250,
    withRepeat(withTiming(1, { duration: 1600, easing: "easeInOut" }), {
      reverse: true,
    }),
  );
}, []);

<cube
  x={x} z={z} rotateY={-angle}
  y={{ animated: lift }}
  size={{ animated: interpolate(t, [0, 1], [0.6, 1.2]) }}
  color={{ animated: interpolateColor(t, [0, 1], [from, to]) }}
  onPointerEnter={() => (lift.value = withSpring(0.8))}
  onPointerLeave={() => (lift.value = withSpring(0))}
  onClick={() => onPick(index)}
/>`;

function RingExample({ clicked }: { clicked: number | null }) {
  return (
    <Example
      title="Animated cubes"
      info={
        <>
          <Paragraph>
            One shared value per cube loops 0 → 1 → 0, started with a staggered{" "}
            <InlineCode>withDelay</InlineCode>. It drives two bindings at once:{" "}
            <InlineCode>interpolate</InlineCode> onto{" "}
            <InlineCode>size</InlineCode> and{" "}
            <InlineCode>interpolateColor</InlineCode> onto{" "}
            <InlineCode>color</InlineCode>.
          </Paragraph>
          <Paragraph>
            Hovering a cube springs its <InlineCode>y</InlineCode> up; clicking
            one reports back to React state. A custom element takes the same
            pointer handlers as any other.
          </Paragraph>
          <Code lang="tsx">{RING_TSX}</Code>
        </>
      }
    >
      <Readout
        label="Last clicked"
        value={clicked === null ? "none" : `cube #${clicked + 1}`}
        color={clicked === null ? Colors.textDim : Colors.cyan}
        size={FontSizes.xxl}
      />
    </Example>
  );
}

function RingCube({
  index,
  colors: [from, to],
  onPick,
}: {
  index: number;
  colors: [string, string];
  onPick: (index: number) => void;
}) {
  const t = useSharedValue(0);
  const lift = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      index * 250,
      withRepeat(withTiming(1, { duration: 1600, easing: "easeInOut" }), {
        reverse: true,
      }),
    );
  }, [t, index]);

  const angle = (index / RING.length) * 360;
  const rad = (angle * Math.PI) / 180;
  return (
    <cube
      x={RING_RADIUS * Math.cos(rad)}
      z={RING_RADIUS * Math.sin(rad)}
      // Face outward: a turn of -angle about Y points +X along the radius.
      rotateY={-angle}
      y={{ animated: lift }}
      size={{ animated: interpolate(t, [0, 1], [0.6, 1.2]), seed: 0.6 }}
      color={{
        animated: interpolateColor(t, [0, 1], [from, to]),
        seed: from,
      }}
      onPointerEnter={() => (lift.value = withSpring(0.8))}
      onPointerLeave={() => (lift.value = withSpring(0))}
      onClick={() => onPick(index)}
    />
  );
}
