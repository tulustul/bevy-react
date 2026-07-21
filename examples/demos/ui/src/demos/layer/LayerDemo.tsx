import { useState } from "react";
import { BevyStyle, LayerTransform3D } from "bevy-react/jsx";
import { Example, Radio, Slider } from "@/components";
import { Layer } from "@/bevy";
import { Colors, FontSizes, Gradients } from "@/theme";

// `<layer>` renders its subtree to a texture and re-displays it through an
// effect shader. Four demos: the group-opacity argument (fade a subtree as
// ONE image, not node-by-node), the built-in effects driven by declarative
// `style.uniforms`, static 3D tilts via `style.transform3d`, and pointer
// input mapped through the inverse transform (the tilted card's button
// clicks at its projected on-screen position).
//
// TEST CONTRACT: `roundtrip.rs::layer_demo_round_trip` classifies this page's
// layer CREATE ops structurally — `effect="dissolve"` marks the effects
// panel, effect-less + `transform3d` marks a tilt card, the effect-less one
// PINNED at `opacity: 0.5` is the comparison layer, and any other effect-less
// untransformed layer is an interactive (tap) layer.
// `roundtrip.rs::layer_pointer_click_round_trip` additionally clicks the two
// TapCard `+1` buttons (flat + tilted, shared counter shown as `taps N`).
// Those props/labels are test keys: changing them (or the initial dissolve
// threshold 0.35) breaks those tests.
export function LayerDemo() {
  return (
    <>
      <Example
        description={
          "opacity on a <layer> fades the whole subtree as one image: where " +
          "children overlap, nothing shows through. The same tree with " +
          "per-node opacity double-blends every overlap."
        }
        tsx={`<layer style={{ opacity: 0.5 }}>
  {/* overlapping children */}
</layer>`}
      >
        <GroupOpacityCompare />
      </Example>

      <Example
        description={
          "The typed Layer wrapper compile-checks style.uniforms against the " +
          "effect's Rust-declared schema. Sliders drive the shader " +
          "declaratively — every change is just a style delta."
        }
        tsx={`<Layer
  effect="dissolve"
  style={{ uniforms: { threshold, softness } }}
>
  <Card />
</Layer>`}
      >
        <EffectsPanel />
      </Example>

      <Example
        description={
          "style.transform3d tilts the captured subtree in 3D — CSS " +
          "conventions, applied projectively in the layer's vertex shader. " +
          "With perspective, the near edge renders larger; the quad may " +
          "extend past the layer's layout box."
        }
        tsx={`<layer style={{
  transform3d: { perspective: 800, rotateY: 25 }
}}>
  <Card />
</layer>`}
      >
        <Transform3dShowcase />
      </Example>

      <Example
        description={
          "Pointer input maps through the INVERSE transform: the window " +
          "cursor is projected back into the layer's texture, so the same " +
          "buttons work flat and tilted — hover, press, click."
        }
        tsx={`<layer style={{
  transform3d: { perspective: 600, rotateY: 30 }
}}>
  <button onClick={() => setTaps((t) => t + 1)} />
</layer>`}
      >
        <InteractiveTiltDemo />
      </Example>
    </>
  );
}

// ---- group opacity vs per-node opacity -------------------------------------

// Three overlapping rounded chips. `alpha` fades each chip INDIVIDUALLY (the
// per-node comparison side); the layer side leaves them opaque and fades the
// captured composite instead.
function OverlapArt({ alpha }: { alpha?: number }) {
  const chip = (left: number, top: number, color: string): BevyStyle => ({
    positionType: "absolute",
    left,
    top,
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: color,
    opacity: alpha,
  });
  return (
    <>
      <node style={chip(14, 8, Colors.primary100)} />
      <node style={chip(56, 26, Colors.purple100)} />
      <node style={chip(32, 44, Colors.green100)} />
    </>
  );
}

function GroupOpacityCompare() {
  const [opacity, setOpacity] = useState(0.5);
  return (
    <node style={compareColumn}>
      <node style={compareRow}>
        <node style={compareCell}>
          <layer style={{ ...compareStage, opacity }}>
            <OverlapArt />
          </layer>
          <text style={caption}>{"<layer> opacity"}</text>
        </node>
        <node style={compareCell}>
          <node style={compareStage}>
            <OverlapArt alpha={opacity} />
          </node>
          <text style={caption}>per-node opacity</text>
        </node>
      </node>
      <Slider
        value={opacity}
        onChange={setOpacity}
        label={`opacity ${opacity.toFixed(2)}`}
      />
    </node>
  );
}

// ---- built-in effects, driven by declarative uniforms -----------------------

type EffectId = "none" | "dissolve" | "chromaticAberration";

// Something worth post-processing: a gradient card with text.
function FxCard() {
  return (
    <node style={fxCard}>
      <text style={fxTitle}>bevy-react</text>
      <text style={fxSubtitle}>subtree on a texture</text>
      <node style={dotRow}>
        {[Colors.green100, Colors.yellow100, Colors.red100].map((color) => (
          <node key={color} style={{ ...fxDot, backgroundColor: color }} />
        ))}
      </node>
    </node>
  );
}

function EffectsPanel() {
  const [effect, setEffect] = useState<EffectId>("dissolve");
  const [threshold, setThreshold] = useState(0.35);
  const [softness, setSoftness] = useState(0.12);
  const [strength, setStrength] = useState(0.012);

  const card = <FxCard />;
  return (
    <node style={compareColumn}>
      {effect === "dissolve" ? (
        <Layer
          effect="dissolve"
          style={{ ...fxStage, uniforms: { threshold, softness } }}
        >
          {card}
        </Layer>
      ) : effect === "chromaticAberration" ? (
        <Layer
          effect="chromaticAberration"
          style={{ ...fxStage, uniforms: { strength } }}
        >
          {card}
        </Layer>
      ) : (
        <Layer style={fxStage}>{card}</Layer>
      )}

      <Radio<EffectId>
        value={effect}
        options={[
          { label: "none", value: "none" },
          { label: "dissolve", value: "dissolve" },
          { label: "chromatic", value: "chromaticAberration" },
        ]}
        onChange={setEffect}
      />

      {effect === "dissolve" && (
        <>
          <Slider
            value={threshold}
            onChange={setThreshold}
            label={`threshold ${threshold.toFixed(2)}`}
          />
          <Slider
            value={softness}
            min={0.01}
            max={0.5}
            onChange={setSoftness}
            label={`softness ${softness.toFixed(2)}`}
          />
        </>
      )}
      {effect === "chromaticAberration" && (
        <Slider
          value={strength}
          max={0.05}
          onChange={setStrength}
          label={`strength ${strength.toFixed(3)}`}
        />
      )}
    </node>
  );
}

// ---- 3D transform (static tilts — the projective vertex shader) ------------

// One small tilted layer + a caption naming its transform3d spec.
function TiltCell({
  label,
  transform3d,
}: {
  label: string;
  transform3d: LayerTransform3D;
}) {
  return (
    <node style={compareCell}>
      <layer style={{ ...tiltMiniStage, transform3d }}>
        <TiltChip />
      </layer>
      <text style={caption}>{label}</text>
    </node>
  );
}

// Something with straight edges and text, so shear/UV distortion would show.
function TiltChip() {
  return (
    <node style={tiltChip}>
      <text style={tiltChipText}>tilt</text>
    </node>
  );
}

function Transform3dShowcase() {
  return (
    <node style={compareColumn}>
      <node style={compareCell}>
        <layer
          style={{
            ...fxStage,
            transform3d: { perspective: 800, rotateY: 25 },
          }}
        >
          <FxCard />
        </layer>
        <text style={caption}>perspective 800 · rotateY 25</text>
      </node>
      <node style={compareRow}>
        <TiltCell
          label="rotateX 35"
          transform3d={{ perspective: 500, rotateX: 35 }}
        />
        <TiltCell label="rotateZ 12" transform3d={{ rotateZ: 12 }} />
        <TiltCell
          label="rotateY -30"
          transform3d={{ perspective: 500, rotateY: -30 }}
        />
      </node>
    </node>
  );
}

// ---- interactive card: pointer input through the inverse transform ---------

// A tappable card: a shared counter readout, a `+1` button (hover/press
// styles), and hoverable chips — all rendered INSIDE a layer, so every
// interaction rides the layer virtual pointer. Explicit sizes throughout:
// the headless E2E clicks these by geometry.
function TapCard({ taps, onTap }: { taps: number; onTap: () => void }) {
  return (
    <node style={tapCard}>
      <text style={tapCount}>{`taps ${taps}`}</text>
      <button
        style={tapButton}
        hoverStyle={tapButtonHover}
        pressStyle={tapButtonPress}
        onClick={onTap}
      >
        <text style={tapButtonText}>+1</text>
      </button>
      <node style={dotRow}>
        {[Colors.green100, Colors.yellow100, Colors.red100].map((color) => (
          <node
            key={color}
            style={{ ...tapChip, backgroundColor: color }}
            hoverStyle={tapChipHover}
          />
        ))}
      </node>
    </node>
  );
}

// The same interactive card twice — flat and 3D-tilted — sharing one counter,
// so a click on EITHER button visibly increments both readouts.
function InteractiveTiltDemo() {
  const [taps, setTaps] = useState(0);
  const onTap = () => setTaps((t) => t + 1);
  return (
    <node style={compareRow}>
      <node style={compareCell}>
        <layer style={tapStage}>
          <TapCard taps={taps} onTap={onTap} />
        </layer>
        <text style={caption}>flat</text>
      </node>
      <node style={compareCell}>
        <layer
          style={{
            ...tapStage,
            transform3d: { perspective: 600, rotateY: 30 },
          }}
        >
          <TapCard taps={taps} onTap={onTap} />
        </layer>
        <text style={caption}>tilted · same buttons</text>
      </node>
    </node>
  );
}

// ---- styles -----------------------------------------------------------------

const compareColumn: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};

const compareRow: BevyStyle = {
  flexDirection: "row",
  alignItems: "flexStart",
  gap: 24,
};

const compareCell: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

// A `<layer>`'s children lay out on its detached companion root, so the layer
// (and its comparison twin) needs an explicit size — it can't grow to content.
const compareStage: BevyStyle = {
  width: 142,
  height: 128,
};

const caption: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.xs,
};

// Shared by the FxCard and TapCard chip rows.
const dotRow: BevyStyle = {
  flexDirection: "row",
  gap: 6,
  margin: { top: 6 },
};

const fxStage: BevyStyle = {
  width: 240,
  height: 150,
  alignItems: "center",
  justifyContent: "center",
};

const fxCard: BevyStyle = {
  width: 220,
  height: 130,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderRadius: 16,
  backgroundGradient: Gradients.primary,
  boxShadow: { blurRadius: 12, spreadRadius: 2, color: Colors.shadow100 },
};

const fxTitle: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.lg,
  fontWeight: "bold",
};

const fxSubtitle: BevyStyle = {
  color: Colors.surface200,
  fontSize: FontSizes.xs,
};

const fxDot: BevyStyle = {
  width: 10,
  height: 10,
  borderRadius: 5,
};

const tapStage: BevyStyle = {
  width: 190,
  height: 132,
  alignItems: "center",
  justifyContent: "center",
};

const tapCard: BevyStyle = {
  width: 170,
  height: 116,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 14,
  backgroundGradient: Gradients.card,
  border: 1,
  borderColor: Colors.surface500,
};

const tapCount: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.sm,
};

const tapButton: BevyStyle = {
  width: 72,
  height: 30,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  backgroundGradient: Gradients.primary,
};

const tapButtonHover: BevyStyle = {
  backgroundGradient: Gradients.primaryHover,
};

const tapButtonPress: BevyStyle = {
  backgroundGradient: Gradients.surface,
};

const tapButtonText: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};

const tapChip: BevyStyle = {
  width: 14,
  height: 14,
  borderRadius: 7,
};

const tapChipHover: BevyStyle = {
  border: 2,
  borderColor: Colors.textColor100,
};

const tiltMiniStage: BevyStyle = {
  width: 96,
  height: 72,
  alignItems: "center",
  justifyContent: "center",
};

const tiltChip: BevyStyle = {
  width: 84,
  height: 60,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  border: 2,
  borderColor: Colors.textColor200,
  backgroundColor: Colors.purple100,
};

const tiltChipText: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
};
