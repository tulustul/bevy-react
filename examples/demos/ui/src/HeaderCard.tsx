import { useRef, useState } from "react";
import { Caption } from "@/components/typography";
import { BevyStyle } from "bevy-react/jsx";
import { Colors, FontSizes } from "@/theme";
import { useExplanationStore } from "./explanationStore";
import { Card, CardHeader } from "./components";

export function HeaderCard() {
  const page = useExplanationStore((s) => s.pageDefault);
  const [collapsed, setCollapsed] = useState(page?.startCollapsed ?? false);

  // The card is mounted once for the whole gallery, so the toggle would carry
  // one page's collapse over to the next. Reset it during the render that
  // first sees a new page (React's derive-state-from-props pattern — an
  // effect would paint one frame of the previous page's state).
  const prevPage = useRef(page);
  if (prevPage.current !== page) {
    prevPage.current = page;
    setCollapsed(page?.startCollapsed ?? false);
  }

  if (page === null) return null;

  return (
    <Card style={{ width: 720, alignItems: "stretch" }}>
      <CardHeader
        title={page.title}
        titleStyle={{ fontSize: FontSizes.xxl }}
        action={
          <node
            style={toggleStyle}
            hoverStyle={toggleHoverStyle}
            onClick={() => setCollapsed((c) => !c)}
          >
            <Caption style={{ lineBreak: "noWrap" }}>
              {collapsed ? "Show docs" : "Hide"}
            </Caption>
          </node>
        }
      />
      {!collapsed && page.info}
    </Card>
  );
}

const toggleStyle: BevyStyle = {
  padding: { horizontal: 10, vertical: 3 },
  borderRadius: 6,
  cursor: "pointer",
};

const toggleHoverStyle: BevyStyle = {
  backgroundColor: Colors.surface300,
};
