import { useWindowSize } from "./useWindowSize";
import { Responsiveness } from "../theme";

export function useIsMobile(): boolean {
  const window = useWindowSize();
  return window.width < Responsiveness.desktop;
}
