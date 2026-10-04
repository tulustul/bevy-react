import { useEffect, useState } from "react";
import { TextMono } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";

import { Colors, Fonts, FontSizes } from "@/theme";
import { MenuList, Popup, WASH } from "./menu";

type Props = {
  startOpen: boolean;
  view: "home" | "code";
  onStart: () => void;
  onSource: () => void;
  onReboot: () => void;
  onAbout: () => void;
};

/** The bottom taskbar: a Start button (opens a menu) and a live clock. */
export function Taskbar({
  startOpen,
  view,
  onStart,
  onSource,
  onReboot,
  onAbout,
}: Props) {
  return (
    <node style={bar}>
      <node style={startAnchor}>
        {startOpen ? (
          <Popup style={startPopup} from="bottom">
            <MenuList
              items={[
                {
                  label: view === "code" ? "Home" : "Source Code",
                  onClick: onSource,
                },
                { label: "About", onClick: onAbout },
                { separator: true },
                { label: "Reboot", onClick: onReboot },
              ]}
            />
          </Popup>
        ) : null}
        <button
          style={startOpen ? startButtonActive : startButton}
          hoverStyle={startOpen ? undefined : startButtonHover}
          onClick={onStart}
        >
          {/* The gallery's wordmark: Bevy's ember, React's cyan. Spans take
              element defaults for unset fields — each restates the face. */}
          <text style={wordmark}>
            <text style={{ ...wordmark, color: Colors.ember }}>bevy</text>
            <text style={{ ...wordmark, color: Colors.textDim }}>-</text>
            <text style={{ ...wordmark, color: Colors.cyan }}>react</text>
          </text>
        </button>
      </node>

      <Clock />
    </node>
  );
}

/** A ticking HH:MM AM/PM clock. */
function Clock() {
  const [now, setNow] = useState(formatTime);
  useEffect(() => {
    const id = setInterval(() => setNow(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <node style={clock}>
      <TextMono style={clockText}>{now}</TextMono>
    </node>
  );
}

function formatTime() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// The menu bar's twin at the bottom edge: graphite, opened by a hairline.
const bar: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  padding: { top: 8, right: 10, bottom: 20, left: 8 },
  backgroundColor: Colors.raised,
  borderColor: Colors.lineStrong,
  border: { top: 1, right: 0, bottom: 0, left: 0 },
  width: "100%",
};

const startAnchor: BevyStyle = {
  positionType: "relative",
  flexDirection: "column",
};

// A chip with a hairline rim; the open Start menu lights it cyan.
const startButton: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: { top: 6, bottom: 6, left: 12, right: 14 },
  borderRadius: 10,
  border: 1,
  borderColor: Colors.lineStrong,
  backgroundColor: Colors.well,
  cursor: "pointer",
};

const startButtonHover: BevyStyle = {
  backgroundColor: Colors.control,
  borderColor: Colors.controlStrong,
};

const startButtonActive: BevyStyle = {
  ...startButton,
  borderColor: Colors.cyanDeep,
  backgroundColor: WASH,
};

const wordmark: BevyStyle = {
  fontFamily: Fonts.display,
  fontSize: FontSizes.lg,
  fontWeight: "bold",
  letterSpacing: -0.3,
  color: Colors.text,
};

// Anchored just above the Start button.
const startPopup: BevyStyle = {
  positionType: "absolute",
  bottom: "100%",
  left: 0,
  margin: { bottom: 8 },
};

// A recessed readout chip.
const clock: BevyStyle = {
  padding: { horizontal: 12, vertical: 6 },
  borderRadius: 8,
  borderColor: Colors.line,
  border: 1,
  backgroundColor: Colors.stage,
};

const clockText: BevyStyle = {
  color: Colors.textBody,
  fontSize: FontSizes.sm,
};
