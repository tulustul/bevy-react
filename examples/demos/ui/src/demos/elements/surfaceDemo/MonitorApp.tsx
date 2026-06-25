import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Colors } from "@/theme";
import { Desktop } from "./Desktop";
import { BootScreen } from "./BootScreen";

// The reboot power-cycle: `off` = screen collapsed to black, `boot` = powering back
// on while the brand types out, `booting` = progress bar; `null` = running normally.
export type Phase = "off" | "boot" | "booting";

/** CRT power-on/off transition time (ms) and how long to hold black after collapse. */
const POWER_MS = 420;
const BLACK_HOLD_MS = 2000;
/** Beat after the screen powers back on before the brand starts typing. */
const TITLE_DELAY_MS = 1500;

/** The little OS that lives on the monitor's screen. */
export function MonitorApp() {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [crt, setCrt] = useState(true);

  // Drive the Bevy-side CRT material toggle. An effect (not just the click handler)
  // keeps the ECS in sync on first mount and on scene re-entry / hot reload.
  useEffect(() => {
    bevy.surfaceDemo.setCrt(crt);
  }, [crt]);

  // Start the reboot: collapse to black (the wrapper animates because `powered` flips).
  function startReboot() {
    setPhase("off");
  }

  // `off`: after the power-down animation + a beat of black, power back on into boot.
  useEffect(() => {
    if (phase !== "off") return;
    const t = setTimeout(() => setPhase("boot"), POWER_MS + BLACK_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // The screen is "powered" (visible) except while collapsed to black.
  const powered = phase !== "off";
  const booting = phase === "boot" || phase === "booting";

  // A single persistent wrapper carries the power-on/off animation: keeping it
  // mounted across every phase is what lets the scale/opacity transition run.
  return (
    <node
      style={{
        ...powerWrap,
        opacity: powered ? 1 : 0,
        transform: { scale: powered ? 1 : 0 },
        transition: {
          opacity: { duration: POWER_MS },
          transform: { duration: POWER_MS, easing: "easeInOut" },
        },
      }}
    >
      {booting ? (
        <BootScreen
          phase={phase}
          titleDelay={TITLE_DELAY_MS}
          onTitleDone={() => setTimeout(() => setPhase("booting"), 1000)}
          onBootDone={() => setPhase(null)}
        />
      ) : (
        <Desktop crt={crt} setCrt={setCrt} onReboot={startReboot} />
      )}
    </node>
  );
}

// The whole visible screen. Carries the screen background and scales/fades as one
// during the reboot power-cycle.
const powerWrap: BevyStyle = {
  width: "100%",
  height: "100%",
  flexDirection: "column",
  backgroundColor: Colors.surface200,
};
