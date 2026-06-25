import { useEffect, useRef, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";

export type TypewriterProps = {
  /** Full text to reveal. Changing it restarts the reveal from the start. */
  text: string;
  style?: BevyStyle;
  /** Characters revealed per tick (default 1). Raise to type long text faster. */
  charsPerTick?: number;
  /** Milliseconds between ticks (default 28). */
  tickMs?: number;
  /** Milliseconds to wait before typing begins (default 0). A blinking cursor
   *  shows during the wait if `cursor` is set. */
  startDelay?: number;
  /** Show a blinking block cursor while typing / when done (default false). */
  cursor?: boolean;
  /** Called once, when the full text has been revealed. */
  onDone?: () => void;
};

const CURSOR = "▋";

/** Reveals `text` one chunk at a time, like a terminal typing it out. */
export function Typewriter({
  text,
  style,
  charsPerTick = 1,
  tickMs = 28,
  startDelay = 0,
  cursor = false,
  onDone,
}: TypewriterProps) {
  const [count, setCount] = useState(0);
  const [blink, setBlink] = useState(true);

  // Keep `onDone` in a ref so it isn't a reset dependency of the typing effect.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Type the text out, resetting whenever the text (or speed) changes. An optional
  // `startDelay` holds at zero chars before the interval kicks in.
  useEffect(() => {
    setCount(0);
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        setCount((c) => {
          const next = Math.min(text.length, c + charsPerTick);
          if (next >= text.length) clearInterval(timer);
          return next;
        });
      }, tickMs);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [text, charsPerTick, tickMs, startDelay]);

  // Fire `onDone` once, from an effect (not the updater above) so we never set
  // parent state mid-render of this component.
  const finished = text.length === 0 || count >= text.length;
  useEffect(() => {
    if (finished) onDoneRef.current?.();
  }, [finished]);

  // Blink the cursor independently of the typing cadence.
  useEffect(() => {
    if (!cursor) return;
    const timer = setInterval(() => setBlink((b) => !b), 500);
    return () => clearInterval(timer);
  }, [cursor]);

  const glyph = cursor && blink ? CURSOR : "";

  return (
    <text style={style}>
      {text.slice(0, count)}
      {glyph}
    </text>
  );
}
