import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Example, Radio, Slider } from "@/components";
import { Layer } from "@/bevy";
import { Colors, FontSizes, Gradients } from "@/theme";

// `<layer>` renders its subtree to a texture and re-displays it through an
// effect shader. Two demos: the group-opacity argument (fade a subtree as ONE
// image, not node-by-node) and the built-in effects driven by declarative
// `style.uniforms`.
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
      <node style={fxDots}>
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

const fxDots: BevyStyle = {
  flexDirection: "row",
  gap: 6,
  margin: { top: 6 },
};

const fxDot: BevyStyle = {
  width: 10,
  height: 10,
  borderRadius: 5,
};
