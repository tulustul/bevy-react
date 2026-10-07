import { useState } from "react";
import { useDebug } from "../../hooks";
import { sfx } from "../../sound";
import type { Character } from "../../store";
import { EdgeRails } from "../../ui/decor";
import { FILL } from "../../ui/kit";
import { Appearance } from "./Appearance";
import { Attributes } from "./Attributes";
import { BodyType } from "./BodyType";
import { Difficulty } from "./Difficulty";
import { Lifepath } from "./Lifepath";
import { Summary } from "./Summary";

/** What every step gets: the character, and the way out either side. */
export type StepProps = {
  character: Character;
  onChange: (character: Character) => void;
  next: () => void;
  back: () => void;
};

const STEPS = [
  "difficulty",
  "lifepath",
  "body",
  "appearance",
  "attributes",
  "summary",
];

/** The six steps of a new game: difficulty, lifepath, body type,
 *  appearance, attributes, summary. Esc steps back (out of the first step:
 *  `onBack`); the summary's start calls `onStart`. Each step change glitches
 *  through the same morph as the screens. */
export function NewGame({
  character,
  onChange,
  onBack,
  onStart,
}: {
  character: Character;
  onChange: (character: Character) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const [step, setStep] = useState(0);
  const props: StepProps = {
    character,
    onChange,
    next: () => {
      sfx("click");
      setStep(Math.min(step + 1, STEPS.length - 1));
    },
    back: () => {
      sfx("back");
      if (step === 0) onBack();
      else setStep(step - 1);
    },
  };
  // `--shoot … --do "<secs> step attributes"`: jump to a step.
  useDebug("step", (s) => setStep(Math.max(0, STEPS.indexOf(s))));
  // `handle VEGA`: rename the character.
  useDebug("handle", (h) => onChange({ ...character, handle: h }));

  return (
    <node style={FILL}>
      <node
        style={{
          ...FILL,
          backgroundGradient: {
            type: "linear",
            angle: 180,
            stops: [
              { color: "rgba(54, 17, 23, 0.93)" },
              { color: "rgba(22, 13, 20, 0.92)", position: "45%" },
              { color: "rgba(5, 11, 16, 0.95)" },
            ],
          },
        }}
      />
      <EdgeRails />
      <node
        style={{
          ...FILL,
          morphFilter: { key: step, name: "glitchSwap" },
          transition: { morphFilter: { duration: 360, easing: "linear" } },
        }}
      >
        {step === 0 && <Difficulty {...props} />}
        {step === 1 && <Lifepath {...props} />}
        {step === 2 && <BodyType {...props} />}
        {step === 3 && <Appearance {...props} />}
        {step === 4 && <Attributes {...props} />}
        {step === 5 && <Summary {...props} onStart={onStart} />}
      </node>
    </node>
  );
}
