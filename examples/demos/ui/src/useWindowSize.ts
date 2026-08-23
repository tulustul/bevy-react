import { useEffect, useState } from "react";
import { bevy, type WindowSize } from "@/bevy";

/** The UI viewport's logical size: pulled once on mount, then streamed by the
 * built-in `resize` event. `null` until the first response lands. */
export function useWindowSize(): WindowSize | null {
  const [size, setSize] = useState<WindowSize | null>(null);
  useEffect(() => {
    void bevy.window.size().then(setSize);
    return bevy.on("resize", setSize);
  }, []);
  return size;
}
