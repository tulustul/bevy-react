import { useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { InfoBody } from "@/components/docs";
import { Colors, Filters, FontSizes, Gradients } from "@/theme";
import { ExplanationData, useExplanationStore } from "./explanationStore";
import { clampContentWidth, useLayout } from "./layoutMode";
import { HeaderText } from "./components";

/**
 * The per-page documentation card at the top of the content flow — replaces
 * the old explanation side panel. Renders whatever the page registered via
 * `useDemoPage`; pages that opted out (`null`) get nothing. The card
 * collapses to its title row via the corner toggle; pages whose content sits
 * behind it (3D scenes, surfaces) register `startCollapsed: true`.
 */
export function HeaderCard() {
  const page = useExplanationStore((s) => s.pageDefault);
  const layout = useLayout();
  if (page === null) return null;

  // The responsive width is computed in JS, NOT with `width:"100%"` +
  // `maxWidth`: that combo makes bevy_ui measure wrapped descendant text at
  // the un-clamped width, and the stale (shorter) height survives the clamp —
  // the card (or its wrapper — moving the clamp up just moves the stale
  // height up) then under-reserves and the page content overlaps it. See the
  // TODO "wrapped text under-measures" bug; an explicit pixel width sidesteps
  // the whole class. (`layout.contentWidth` already subtracts the nav column
  // — 0 in the compact shell, where the drawer overlays — and the padding.)
  const width = clampContentWidth(layout, MIN_WIDTH, MAX_WIDTH);

  // Keyed by title so the collapsed state resets to the page's own default on
  // every page switch (while surviving hot reloads, which keep the title).
  return <Card key={page.title} page={page} width={width} />;
}

function Card({ page, width }: { page: ExplanationData; width: number }) {
  const [collapsed, setCollapsed] = useState(page.startCollapsed ?? false);

  return (
    <node style={{ ...cardStyle, width }}>
      <node style={titleRowStyle}>
        <HeaderText style={titleStyle}>{page.title}</HeaderText>
        <node
          style={toggleStyle}
          hoverStyle={toggleHoverStyle}
          onClick={() => setCollapsed((c) => !c)}
        >
          <text style={toggleTextStyle}>
            {collapsed ? "Show docs" : "Hide"}
          </text>
        </node>
      </node>
      {!collapsed && <InfoBody data={page} />}
    </node>
  );
}

const MAX_WIDTH = 780;
/** Safety floor only — bites below ~330px viewports (360 is the supported min). */
const MIN_WIDTH = 280;

const cardStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  gap: 10,
  padding: 20,
  backdropFilter: Filters.backdrop,
  backgroundGradient: Gradients.card,
  borderRadius: 16,
  border: 2,
  borderGradient: Gradients.accentBorderDim,
  boxShadow: { blurRadius: 15, spreadRadius: 5, color: Colors.shadow100 },
};

const titleRowStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
};

const titleStyle: BevyStyle = {
  fontSize: FontSizes.xxl,
  fontWeight: "semibold",
  color: Colors.textColor100,
};

const toggleStyle: BevyStyle = {
  padding: { top: 3, bottom: 3, left: 10, right: 10 },
  borderRadius: 6,
  cursor: "pointer",
};

const toggleHoverStyle: BevyStyle = {
  backgroundColor: Colors.surface300,
};

const toggleTextStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  color: Colors.textColor200,
};
