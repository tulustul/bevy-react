/** The apps: each one's window is a `<surface>` the Rust side shows on a
 *  pane (`examples/atrium/panes/mod.rs` — `WINDOWS` holds their sizes). */
export type AppId = "skies" | "notes" | "lenses";

export const APPS: { id: AppId; title: string }[] = [
  { id: "notes", title: "Notes" },
  { id: "skies", title: "Skies" },
  { id: "lenses", title: "Lenses" },
];

/** A local hour as a clock: `18.7` → `"18:42"`. */
export function clock(hour: number): string {
  const total = Math.round((((hour % 24) + 24) % 24) * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** What the light is doing at a local hour (the lake's latitude). */
export function daylight(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h < 4.3 || h >= 21.6) return "Night";
  if (h < 5.2) return "Blue hour";
  if (h < 6.4) return "Sunrise";
  if (h < 11) return "Morning";
  if (h < 15) return "Midday";
  if (h < 17.6) return "Afternoon";
  if (h < 19.2) return "Golden hour";
  if (h < 20.2) return "Sunset";
  return "Dusk";
}
