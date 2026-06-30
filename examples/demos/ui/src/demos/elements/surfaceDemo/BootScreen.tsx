import { BevyStyle } from "bevy-react/jsx";
import { TextMono, Typewriter } from "@/components";
import { Colors, FontSizes } from "@/theme";
import type { Phase } from "./MonitorApp";
import { useEffect, useState } from "react";

type Props = {
  phase: Phase | null;
  /** Beat before the brand starts typing once the screen powers on. */
  titleDelay: number;
  onTitleDone: () => void;
  /** Fired once the progress bar has filled — boot is complete. */
  onBootDone: () => void;
};

/** The power-on boot screen: types the brand, then shows `booting...` + a progress bar. */
export function BootScreen({
  phase,
  titleDelay,
  onTitleDone,
  onBootDone,
}: Props) {
  return (
    <node style={bootScreen}>
      <Typewriter
        style={bootBrand}
        text="bevy-react OS"
        tickMs={150}
        startDelay={titleDelay}
        onDone={onTitleDone}
      />
      <node
        style={{
          height: 200,
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {phase === "booting" && (
          <>
            <TextMono style={bootStatus}>booting...</TextMono>
            <ProgressBar onDone={onBootDone} />
          </>
        )}
      </node>
    </node>
  );
}

const STRIP_COUNT = 20;
const STRIPS = Array(STRIP_COUNT).fill(0);
/** Time to light each strip, and a beat to hold the full bar before finishing. */
const STRIP_MS = 150;
const FULL_HOLD_MS = 400;

type ProgressBarProps = {
  onDone: () => void;
};

function ProgressBar({ onDone }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  // Light one more strip every tick; once full, hold a beat then signal done.
  // Keyed on `progress` so each step reads the live value (no stale closure).
  useEffect(() => {
    if (progress >= STRIP_COUNT) {
      const t = setTimeout(onDone, FULL_HOLD_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setProgress((p) => p + 1), STRIP_MS);
    return () => clearTimeout(t);
    // Deliberately keyed only on `progress` — `onDone` is a stable prop and
    // re-keying on it would restart the timer mid-progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <node
      style={{
        width: 350,
        height: 50,
        border: 2,
        borderColor: Colors.surface600,
        borderRadius: 8,
        flexDirection: "row",
        gap: 7,
        padding: 5,
      }}
    >
      {STRIPS.map((_, index) => (
        <node
          key={index}
          style={{
            width: 20,
            backgroundColor:
              progress > index ? Colors.surface600 : Colors.transparent,
          }}
        />
      ))}
    </node>
  );
}

const bootScreen: BevyStyle = {
  flexGrow: 1,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 24,
};

const bootBrand: BevyStyle = {
  color: Colors.textColor100,
  fontSize: FontSizes.xxl,
  fontWeight: "bold",
};

const bootStatus: BevyStyle = {
  color: Colors.primary100,
  fontSize: FontSizes.lg,
};
