// Dummy game-menu content for the gamepad demo: 4 pages with 1-3 columns of
// vertical item lists. Labels are ASCII-only (the demo font lacks arrow-like
// glyphs and renders them as tofu).

export type MenuColumn = { title: string; items: string[] };
export type MenuPage = { name: string; columns: MenuColumn[] };

export const MENU_PAGES: MenuPage[] = [
  {
    name: "Campaign",
    columns: [
      {
        title: "Story",
        items: ["New Game", "Continue", "Chapter Select", "Codex", "Credits"],
      },
    ],
  },
  {
    name: "Loadout",
    columns: [
      {
        title: "Primary",
        items: ["Pulse Rifle", "Scattergun", "Longbow", "Marksman"],
      },
      {
        title: "Secondary",
        items: ["Sidearm", "Machine Pistol", "Flare Gun"],
      },
      {
        title: "Gear",
        items: ["Frag Grenade", "Smoke", "Med Kit", "Scanner"],
      },
    ],
  },
  {
    name: "Settings",
    columns: [
      {
        title: "Video",
        items: ["Resolution", "VSync", "Field of View", "HDR"],
      },
      {
        title: "Audio",
        items: ["Master Volume", "Music", "SFX", "Subtitles"],
      },
    ],
  },
  {
    name: "Extras",
    columns: [
      {
        title: "Extras",
        items: ["Achievements", "Statistics", "Replays", "About"],
      },
    ],
  },
];
