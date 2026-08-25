import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { TextMono } from "@/components";
import { Colors, FontSizes } from "@/theme";
import { MenuList, Popup } from "./menu";

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
          hoverStyle={startButtonHover}
          onClick={onStart}
        >
          <text style={startText}>bevy-react</text>
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

const bar: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  padding: { top: 6, right: 10, bottom: 20, left: 8 },
  backgroundColor: Colors.surface100,
  borderColor: Colors.surface500,
  border: { top: 3, right: 0, bottom: 0, left: 0 },
  width: "100%",
};

const startAnchor: BevyStyle = {
  positionType: "relative",
  flexDirection: "column",
};

const startButton: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: { top: 8, bottom: 8, left: 12, right: 16 },
  borderRadius: 8,
  backgroundColor: Colors.surface300,
  cursor: "pointer",
};

const startButtonHover: BevyStyle = { backgroundColor: Colors.surface500 };

const startButtonActive: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  padding: { top: 8, bottom: 8, left: 12, right: 16 },
  borderRadius: 8,
  backgroundColor: Colors.primary300,
  cursor: "pointer",
};

const startText: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.base,
  fontWeight: "bold",
};

// Anchored just above the Start button.
const startPopup: BevyStyle = {
  positionType: "absolute",
  bottom: "100%",
  left: 0,
  margin: { bottom: 8 },
};

const clock: BevyStyle = {
  padding: { top: 6, bottom: 6, left: 14, right: 14 },
  borderRadius: 7,
  borderColor: Colors.surface500,
  border: 2,
  backgroundColor: Colors.surface200,
};

const clockText: BevyStyle = {
  color: Colors.textColor200,
  fontSize: FontSizes.sm,
};
