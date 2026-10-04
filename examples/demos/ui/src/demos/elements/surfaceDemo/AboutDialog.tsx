import { BevyStyle } from "bevy-react/jsx";
import { CardTitle, TextMono } from "@/components/typography";
import { Button, CircularButton, CloseIcon } from "@/components";
import { Colors, Fonts, FontSizes } from "@/theme";
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
          <CardTitle>About</CardTitle>
          <CircularButton size={28} onClick={onClose}>
            <CloseIcon size={16} />
          </CircularButton>
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

// A graphite window like the gallery's own modal: a strong hairline rim and a
// soft shadow lifting it off the desktop; the title bar is closed by a hairline.
const panel: BevyStyle = {
  width: "70%",
  flexDirection: "column",
  borderRadius: 16,
  borderColor: Colors.lineStrong,
  border: 1,
  backgroundColor: Colors.card,
  boxShadow: { yOffset: 24, blurRadius: 64, color: "#000000c0" },
};

const titleBar: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  padding: { top: 10, bottom: 10, left: 18, right: 10 },
  borderColor: Colors.line,
  border: { bottom: 1 },
};

const panelBody: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: 24,
};

const brand: BevyStyle = {
  fontFamily: Fonts.display,
  color: Colors.text,
  fontSize: FontSizes.xxl,
  fontWeight: "semibold",
};

const version: BevyStyle = {
  color: Colors.textDim,
  fontSize: FontSizes.xs,
};

const blurb: BevyStyle = {
  color: Colors.textBody,
  fontSize: FontSizes.body,
  lineHeight: 1.5,
  textAlign: "center",
};
