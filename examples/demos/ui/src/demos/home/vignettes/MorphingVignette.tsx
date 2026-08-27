import { useEffect, useRef } from "react";
import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { CircularButton } from "@/components";
import type { MorphUse } from "@/demos/styling/morphFilterDemo/params";
import { growTransition } from "../beats";
import { Extra } from "../Extra";
import {
  controlsStyle,
  PanelCaption,
  Spacing,
  vignetteStyle,
  type VignetteProps,
} from "../shared";
import { useVignetteState } from "../store";

/** A walk through the morph pack, picked for reading clearly at tile size. */
const TRANSITIONS: { label: string; use: MorphUse }[] = [
  {
    label: "linearWipe",
    use: { name: "linearWipe", params: { angle: 45, softness: 50 } },
  },
  { label: "crossfade", use: { name: "crossfade", params: { spread: 0.7 } } },
  {
    label: "pixelize",
    use: { name: "pixelize", params: { squaresMin: [24, 24] } },
  },
  { label: "windowslice", use: { name: "windowslice", params: { count: 18 } } },
  { label: "gridFlip", use: { name: "gridFlip", params: { size: [6, 6] } } },
  { label: "bookFlip", use: { name: "bookFlip" } },
  { label: "circleCrop", use: { name: "circleCrop" } },
  { label: "doorway", use: { name: "doorway" } },
  { label: "invertedPageCurl", use: { name: "invertedPageCurl" } },
];

const FACES = ["images/parrot.png", "images/wheat.png"];

const MORPH_MS = 1200;
const AUTO_MS = 1300;
/** Pointer travel below which a press is a tap, not a flick. */
const FLICK_PX = 24;
/** The picture's side at each end of the flight. */
const TILE_SIZE = 140;
const PANEL_SIZE = 210;
const BUTTON_SIZE = 30;
/** Room the pack and its caption take at rest, including the gap above. */
const CONTROLS_HEIGHT = 140;

/** Morphing: one node swapping its contents through a named two-input filter.
 * The tile flips faces and re-rolls the transition; the panel's numbered
 * buttons run a chosen one, and a flick over the picture walks the pack. */
export function MorphingVignette({ expanded, grown }: VignetteProps) {
  const [face, setFace] = useVignetteState("morphing.face", 0);
  const [pick, setPick] = useVignetteState("morphing.pick", 0);
  const pressX = useRef<number | null>(null);

  useEffect(() => {
    if (expanded) return;
    const id = setInterval(() => {
      setFace((f) => (f + 1) % FACES.length);
      setPick(
        (p) =>
          (p + 1 + Math.floor(Math.random() * (TRANSITIONS.length - 1))) %
          TRANSITIONS.length,
      );
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [expanded, setFace, setPick]);

  const transition = TRANSITIONS[pick];
  const size = grown ? PANEL_SIZE : TILE_SIZE;

  // Choosing a transition also flips the face, so you see it run.
  const run = (next: number) => {
    setPick(next);
    setFace((f) => (f + 1) % FACES.length);
  };

  // Raw down/up rather than `onClick`, so a drag ending on the panel is not a click.
  const flick = expanded
    ? {
        onPointerDown: (e: PointerEventData) => {
          pressX.current = e.x;
        },
        onPointerUp: (e: PointerEventData) => {
          const from = pressX.current;
          pressX.current = null;
          if (from === null) return;
          const dx = e.x - from;
          if (Math.abs(dx) < FLICK_PX) return;
          run(
            (pick + (dx > 0 ? 1 : -1) + TRANSITIONS.length) %
              TRANSITIONS.length,
          );
        },
      }
    : {};

  return (
    <node style={{ ...vignetteStyle, width: "100%" }}>
      <image
        src={FACES[face]}
        {...flick}
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          overflowX: "clip",
          overflowY: "clip",
          morphFilter: { key: `${face}:${pick}`, ...transition.use },
          imageRendering: "trilinear",
          transition: {
            size: growTransition,
            morphFilter: { duration: MORPH_MS, easing: "easeInOut" },
          },
        }}
      />
      <Extra grown={grown} maxHeight={CONTROLS_HEIGHT}>
        <node style={controlsStyle}>
          <node style={packStyle}>
            {TRANSITIONS.map((t, i) => (
              <CircularButton
                key={t.label}
                size={BUTTON_SIZE}
                pinch={{ radius: 0.7 }}
                onClick={() => run(i)}
              >
                {i + 1}
              </CircularButton>
            ))}
          </node>
          <PanelCaption>{transition.label}</PanelCaption>
        </node>
      </Extra>
    </node>
  );
}

const packStyle: BevyStyle = {
  width: "100%",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: Spacing.control,
};
