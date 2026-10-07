import { bevy } from "./bevy";

/** The UI sounds Bevy synthesizes (`sound.rs`). */
export type Sfx =
  | "hover"
  | "click"
  | "back"
  | "tab"
  | "error"
  | "confirm"
  | "boot";

/** Play a UI sound. */
export function sfx(name: Sfx) {
  bevy.sound.play({ name });
}
