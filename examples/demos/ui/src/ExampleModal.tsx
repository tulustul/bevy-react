import { useEffect, useRef, useState } from "react";
import { BevyStyle, PointerEventData } from "bevy-react/jsx";
import { bevy } from "@/bevy";
import { Button } from "@/components";
import { InfoBody } from "@/components/docs";
import { Colors, FontSizes, Gradients, Scrollbar } from "@/theme";
import { useExplanationStore } from "./explanationStore";
import { useWindowSize } from "./useWindowSize";

const MODAL_W = 560;
const MARGIN = 8;
/** Keep at least the title bar reachable when dragging toward the bottom. */
const TITLE_REACH = 48;
/** Carrier padding around the panel so its boxShadow ring lands inside the
 * morph layer's capture rect (a crossfade adds no outset of its own — an
 * unpadded carrier would clip the shadow at the layer edge). */
const SHADOW_PAD = 40;

/**
 * The floating example dialog: clicking an `<Example>` card opens it with the
 * example's docs and a second live instance of the demo. Always mounted — the
 * outer node is an empty morph carrier (nothing painted while closed), so
 * opening/closing blends from/to empty pixels and switching examples
 * crossfades in place. Drag anywhere on the panel to move it (inner controls
 * win their own pointer events — events resolve to the topmost handler);
 * close with ×, Escape, the bottom button, or a click on empty space (the
 * transparent click-catcher below the whole stack). There is no dimming
 * scrim: the page behind stays fully interactive — cards, nav and controls
 * keep owning their clicks, and clicking another card swaps the content.
 */
export function ExampleModal() {
  const selected = useExplanationStore((s) => s.selected?.data ?? null);
  const seq = useExplanationStore((s) => s.selectionSeq);
  const deselect = useExplanationStore((s) => s.deselect);
  const open = selected !== null;

  const win = useWindowSize();
  // null = "not dragged yet": follow the centered default position.
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const lastClient = useRef({ x: 0, y: 0 });

  // A fresh open (closed → open) forgets the previous drag position;
  // switching examples while open keeps the modal where it was dragged.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) setPos(null);
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    return bevy.on("keyDown", (e) => {
      if (e.key === "Escape") deselect();
    });
  }, [open, deselect]);

  const clampPos = (p: { left: number; top: number }) => {
    if (!win) return p;
    return {
      left: clamp(
        p.left,
        MARGIN,
        Math.max(MARGIN, win.width - MODAL_W - MARGIN),
      ),
      top: clamp(p.top, MARGIN, Math.max(MARGIN, win.height - TITLE_REACH)),
    };
  };

  const defaultPos = win
    ? clampPos({ left: (win.width - MODAL_W) / 2, top: win.height * 0.1 })
    : { left: 240, top: 80 };
  const p = pos ?? defaultPos;

  const onPointerDown = (e: PointerEventData) => {
    lastClient.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: PointerEventData) => {
    const dx = e.clientX - lastClient.current.x;
    const dy = e.clientY - lastClient.current.y;
    lastClient.current = { x: e.clientX, y: e.clientY };
    setPos((prev) => {
      const from = prev ?? defaultPos;
      return clampPos({ left: from.left + dx, top: from.top + dy });
    });
  };

  return (
    <>
      {/* Transparent click-catcher UNDER everything (zIndex −1): clicks on
          empty space close the modal, while cards, nav and the panel — all
          higher in the stack — keep owning their own clicks (topmost-wins). */}
      {open && <node style={backdropStyle} onClick={() => deselect()} />}
      <node
        style={{
          ...carrierStyle,
          left: p.left - SHADOW_PAD,
          top: p.top - SHADOW_PAD,
          morphFilter: { key: open ? `s${seq}` : "closed", name: "crossfade" },
        }}
      >
        {selected && (
          <node
            style={panelStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
          >
            <node style={titleBarStyle}>
              <text style={titleStyle}>{selected.title}</text>
              <Button style={closeXStyle} onClick={() => deselect()}>
                ×
              </Button>
            </node>
            <node style={bodyStyle} scrollStep={60}>
              <InfoBody data={selected} />
              {selected.demo !== undefined && (
                // The demo wrap mirrors the card's `cache` style: a live-content
                // demo (portal) must force every-frame capture dirt through the
                // modal's own morph layer or it renders frozen in here.
                <node style={{ ...demoWrapStyle, cache: selected.cache }}>
                  <text style={demoCaptionStyle}>Live example</text>
                  <selected.demo />
                </node>
              )}
              <Button
                style={{ alignSelf: "center", margin: { top: 4 } }}
                onClick={() => deselect()}
              >
                Close
              </Button>
            </node>
          </node>
        )}
      </node>
    </>
  );
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

// Fills the window invisibly BELOW the whole UI stack: it never paints and
// never out-competes a real control for clicks — it only catches the clicks
// nothing else owns (the "empty space").
const backdropStyle: BevyStyle = {
  positionType: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
};

// The always-mounted morph carrier: absolutely positioned, paints nothing of
// its own — the panel (its only child) mounts/unmounts in the same commit as
// the morph key flip, so the blend runs from/to a valid empty capture.
const carrierStyle: BevyStyle = {
  positionType: "absolute",
  zIndex: 300,
  flexDirection: "column",
  padding: SHADOW_PAD,
  transition: { morphFilter: { duration: 250 } },
};

const panelStyle: BevyStyle = {
  width: MODAL_W,
  flexDirection: "column",
  alignItems: "stretch",
  backgroundColor: Colors.surface200,
  borderRadius: 14,
  border: 2,
  borderGradient: Gradients.accentBorder,
  boxShadow: { blurRadius: 30, spreadRadius: 8, color: Colors.shadow100 },
};

const titleBarStyle: BevyStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "spaceBetween",
  padding: { top: 8, bottom: 8, left: 16, right: 8 },
  border: { bottom: 1 },
  borderColor: Colors.surface400,
};

const titleStyle: BevyStyle = {
  fontSize: FontSizes.base,
  fontWeight: "semibold",
  color: Colors.textColor100,
};

const closeXStyle: BevyStyle = {
  padding: { top: 2, right: 9, bottom: 2, left: 9 },
};

const bodyStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "stretch",
  gap: 10,
  padding: 16,
  maxHeight: "70vh",
  overflowY: "scroll",
  scrollbar: Scrollbar,
};

const demoWrapStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 12,
  borderRadius: 12,
  border: 1,
  borderColor: Colors.surface400,
  backgroundGradient: Gradients.card,
};

const demoCaptionStyle: BevyStyle = {
  fontSize: FontSizes.xs,
  color: Colors.textColor300,
  alignSelf: "flexStart",
};
