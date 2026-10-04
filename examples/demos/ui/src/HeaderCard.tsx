import { useEffect, useState } from "react";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, DocsFold, Fonts, FontSizes } from "@/theme";
import { useExplanationStore, type ExplanationData } from "./explanationStore";
import { useDemosStore } from "./demosStore";
import { sectionOf } from "./demos";
import { Card, ChevronDownIcon } from "./components";
import { useContentWidth, useIsMobile } from "./hooks";

/**
 * The page header: the nav section as an ember eyebrow, the page title in
 * display type straight on the backdrop, and the page's docs on a card below
 * — collapsible, for pages whose content sits behind it (3D scenes,
 * surfaces).
 */
export function HeaderCard() {
  const page = useExplanationStore((s) => s.pageDefault);
  // Keyed per page: the header is mounted once for the whole gallery, and a
  // new page starts from its own collapse default, unanimated.
  return page && <PageHeader key={page.title} page={page} />;
}

function PageHeader({ page }: { page: ExplanationData }) {
  const section = useDemosStore((s) => sectionOf(s.selectedDemo));
  const isMobile = useIsMobile();
  const width = Math.min(useContentWidth(), PROSE_WIDTH);
  const [collapsed, setCollapsed] = useState(page.startCollapsed ?? false);
  const docs = useFold(!collapsed);

  const titleSize = isMobile ? FontSizes.xxl + 4 : FontSizes.display;

  return (
    <node style={{ ...headerStyle, width }}>
      <node style={titleRowStyle}>
        <node style={titleColumnStyle}>
          {section !== undefined && <text style={eyebrowStyle}>{section}</text>}
          <PageTitle title={page.title} size={titleSize} />
        </node>
        {page.info !== undefined && !page.docsOnly && (
          <DocsToggle
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />
        )}
      </node>
      {docs.mounted && page.info !== undefined && (
        <Card
          style={{
            ...(isMobile ? docsMobileStyle : docsStyle),
            ...(collapsed && leavingStyle),
            opacity: docs.visible ? 1 : 0,
            transition: { opacity: DocsFold },
          }}
        >
          {page.info}
        </Card>
      )}
    </node>
  );
}

/** The docs card's fold. Opening mounts it transparent and fades it in — a
 *  beat later, or the flip lands in the mount's Bevy frame and snaps. Folding
 *  takes it out of the flow at once (`leavingStyle`: the examples, which carry
 *  a `layout` transition, glide up over it) and unmounts it once faded. */
function useFold(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    else setVisible(false);
    const id = setTimeout(
      () => (open ? setVisible(true) : setMounted(false)),
      open ? 50 : DocsFold.duration,
    );
    return () => clearTimeout(id);
  }, [open]);
  return { mounted, visible };
}

/** The title in display type; an element page's tag gets lit brackets. */
function PageTitle({ title, size }: { title: string; size: number }) {
  const style = { ...titleStyle, fontSize: size };
  const tag = /^<(.+)>$/.exec(title);
  if (tag === null) return <text style={style}>{title}</text>;
  // Spans take element defaults for unset fields — restate the face.
  const bracket = {
    ...style,
    color: Colors.cyan,
    fontWeight: "normal" as const,
  };
  return (
    <text style={style}>
      <text style={bracket}>{"<"}</text>
      {tag[1]}
      <text style={bracket}>{">"}</text>
    </text>
  );
}

function DocsToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <node style={toggleStyle} hoverStyle={toggleHoverStyle} onClick={onToggle}>
      <text style={toggleLabelStyle}>
        {collapsed ? "Show docs" : "Hide docs"}
      </text>
      <node
        style={{
          transform: { rotate: collapsed ? 0 : 180 },
          transition: { transform: { duration: 200, easing: "easeOut" } },
        }}
      >
        <ChevronDownIcon size={14} color={Colors.textDim} />
      </node>
    </node>
  );
}

/** The header's cap — narrower than the column: prose reads best under ~100
 *  characters a line, while the examples below keep the column's width. */
const PROSE_WIDTH = 780;

const HEADER_GAP = 20;

const headerStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  gap: HEADER_GAP,
};

const titleRowStyle: BevyStyle = {
  flexDirection: "row",
  justifyContent: "spaceBetween",
  alignItems: "flexEnd",
  gap: 16,
};

const titleColumnStyle: BevyStyle = {
  flexDirection: "column",
  gap: 4,
  flexShrink: 1,
};

const eyebrowStyle: BevyStyle = {
  fontFamily: Fonts.mono,
  fontSize: FontSizes.xs,
  fontWeight: "medium",
  letterSpacing: 1.2,
  color: Colors.ember,
};

const titleStyle: BevyStyle = {
  fontFamily: Fonts.display,
  fontWeight: "semibold",
  letterSpacing: -0.8,
  color: Colors.text,
  textShadow: { color: "#00000099", offsetY: 1 },
};

const docsStyle: BevyStyle = {
  gap: 14,
  padding: { horizontal: 28, vertical: 24 },
};

const docsMobileStyle: BevyStyle = {
  gap: 12,
  padding: 16,
};

// A folding card, out of the flow where it stood: just under the title row.
const leavingStyle: BevyStyle = {
  positionType: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  margin: { top: HEADER_GAP },
};

const toggleStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  flexShrink: 0,
  padding: { horizontal: 10, vertical: 6 },
  margin: { bottom: 6 },
  borderRadius: 8,
  cursor: "pointer",
};

const toggleHoverStyle: BevyStyle = {
  backgroundColor: Colors.hover,
};

const toggleLabelStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  fontWeight: "medium",
  color: Colors.textDim,
  lineBreak: "noWrap",
};
