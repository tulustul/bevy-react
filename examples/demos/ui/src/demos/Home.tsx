import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Button } from "@/components";
import { Colors, FontSizes, Gradients } from "@/theme";

type Mode = "monitor" | "flat";

type Feature = { title: string; body: string };

const FEATURES: Feature[] = [
  {
    title: "Native Bevy UI",
    body: "No browser, no web view. Your UI is bevy_ui entities in the same world as your game.",
  },
  {
    title: "Hot reload that keeps state",
    body: "Edit a component and it re-renders live, with hook state and running animations intact.",
  },
  {
    title: "Typed two-way messaging",
    body: "React and the ECS talk over typed channels generated straight from your Rust types.",
  },
  {
    title: "React, not a DSL",
    body: "Hooks, components, lists, conditional rendering — everything you already know.",
  },
];

export function Home() {
  const [mode, setMode] = useState<Mode>("monitor");

  useEffect(() => {
    bevy.selectScene(mode === "monitor" ? "Surface" : null);
  }, [mode]);

  return (
    <node style={containerStyle}>
      {mode === "monitor" ? (
        <surface name="monitor" style={screenRoot}>
          <Landing mode={mode} onMode={setMode} />
        </surface>
      ) : (
        <Landing mode={mode} onMode={setMode} />
      )}
    </node>
  );
}

type Props = {
  mode: Mode;
  onMode: (mode: Mode) => void;
};

function Landing({ mode, onMode }: Props) {
  return (
    <node style={pageStyle}>
      <node style={heroStyle}>
        <image src="bevy-react-logo.png" style={{ width: 150 }} />
        <text style={titleStyle}>bevy-react</text>
        <text style={taglineStyle}>
          Build bevy_ui interfaces with React — no web view, no DOM.
        </text>
      </node>

      <text style={introStyle}>
        You write components in React/TSX and they render to native Bevy UI
        through a React Native-style bridge. State and interactions flow both
        ways, and edits hot-reload live while keeping component state.
      </text>

      <node style={cardsRowStyle}>
        {FEATURES.map((feature) => (
          <node key={feature.title} style={cardStyle}>
            <text style={cardTitleStyle}>{feature.title}</text>
            <text style={cardBodyStyle}>{feature.body}</text>
          </node>
        ))}
      </node>

      <text style={browseStyle}>Browse the demos in the side panel</text>

      <Button
        style={surfaceSwith}
        labelStyle={surfaceLabelSwith}
        onClick={() => onMode(mode === "flat" ? "monitor" : "flat")}
      >
        {mode === "flat" ? "Switch to CRT monitor" : "Switch to flat"}
      </Button>
    </node>
  );
}

const containerStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
};

const screenRoot: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: Colors.surface100,
  backgroundGradient: Gradients.navBackdrop,
};

const pageStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 20,
  padding: 32,
  maxWidth: 720,
};

const heroStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
};

const titleStyle: BevyStyle = {
  color: Colors.primary100,
  fontSize: FontSizes.xxl,
  fontWeight: "bold",
};

const taglineStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  maxWidth: 520,
};

const introStyle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
  maxWidth: 600,
  textAlign: "center",
};

const cardsRowStyle: BevyStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 14,
};

const cardStyle: BevyStyle = {
  flexDirection: "column",
  gap: 6,
  width: 320,
  padding: 16,
  backgroundColor: Colors.surface200,
  backgroundGradient: Gradients.card,
  borderRadius: 14,
  border: 2,
  borderColor: Colors.primary100,
  borderGradient: Gradients.accentBorder,
  boxShadow: { blurRadius: 12, spreadRadius: 4, color: Colors.shadow100 },
};

const cardTitleStyle: BevyStyle = {
  color: Colors.primary100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};

const cardBodyStyle: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.xs,
};

const browseStyle: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};

const surfaceSwith: BevyStyle = {
  padding: 20,
};

const surfaceLabelSwith: BevyStyle = {
  fontSize: FontSizes.xl,
};
