import { BevyStyle } from "bevy-react/jsx";
import { Button, TextMono } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { useEffect, useState } from "react";

/** A centered "About" dialog over a dimming scrim; closes on OK or scrim click. */
export function AboutDialog({ onClose }: { onClose: () => void }) {
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFirstRender(false);
    }, 100);
  }, []);

  return (
    <node style={{ ...scrim, transform: { scale: firstRender ? 0 : 1 } }}>
      <node style={panel}>
        <node style={titleBar}>
          <text style={titleText}>About</text>
          <Button hoverStyle={closeButtonHover} onClick={onClose}>
            ×
          </Button>
        </node>
        <node style={panelBody}>
          <text style={brand}>bevy-react OS</text>
          <TextMono style={version}>version 0.1 · surface://monitor</TextMono>
          <text style={blurb}>
            A React UI rendered into an offscreen texture and draped over a 3D
            monitor — clickable in-world.
          </text>
          <Button onClick={onClose}>OK</Button>
        </node>
      </node>
    </node>
  );
}

const scrim: BevyStyle = {
  positionType: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 200,
  transition: { transform: { duration: 200 } },
};

const panel: BevyStyle = {
  width: "70%",
  flexDirection: "column",
  borderRadius: 12,
  borderColor: Colors.primary100,
  border: 2,
  backgroundColor: Colors.surface200,
};

const titleBar: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  padding: { top: 10, bottom: 10, left: 16, right: 10 },
  backgroundColor: Colors.primary300,
  borderRadius: { top: 10, right: 10, bottom: 0, left: 0 },
};

const titleText: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};

const closeButtonHover: BevyStyle = { backgroundColor: Colors.red300 };

const panelBody: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: { top: 24, bottom: 24, left: 24, right: 24 },
};

const brand: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xxl,
  fontWeight: "bold",
};

const version: BevyStyle = {
  color: Colors.textColor300,
  fontSize: FontSizes.sm,
};

const blurb: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.base,
  textAlign: "center",
};
