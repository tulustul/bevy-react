// The devtools panel UI: an inspector rendered into a
// detached `<root>` overlay (so it floats above the app and stays out of the
// app's node tree / stats). Mounted once per isolate in its own React
// container (see renderer.ts `renderDevtools`); renders `null` while closed,
// so a closed panel costs zero nodes.
//
// Three layout modes: docked left / docked right (edge-resizable; a "push"
// toggle reserves the space Rust-side so the app UI reflows beside the panel)
// and floating (drag by the header, resize by the bottom-right corner).

import { useEffect, useRef, useState, type ReactNode } from "react";
import { addEventListener } from "../bridge";
import type { PointerEventData } from "../jsx";
import {
  onPicked,
  onRestore,
  onToggle,
  onWindow,
  sendDock,
  sendOpen,
  sendOverlay,
  sendPanelRoot,
  sendPick,
  sendSelect,
  sendSettings,
} from "./api";
import { ConsolePanel } from "./ConsolePanel";
import { Inspector } from "./Inspector";
import { LayersPanel } from "./LayersPanel";
import { LogPanel } from "./LogPanel";
import { mirror } from "./mirror";
import { recorder } from "./recorder";
import { StatsBar } from "./StatsBar";
import { theme } from "./theme";
import { TreeView } from "./TreeView";

type Tab = "nodes" | "layers" | "console" | "bridge";

function isTab(v: unknown): v is Tab {
  return v === "nodes" || v === "layers" || v === "console" || v === "bridge";
}

/** Panel layout: docked to a window edge, or a floating window. */
type Mode = "left" | "right" | "float";

// Pixel floors (a proportional panel on a tiny window must stay usable)…
const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const MIN_INSPECTOR = 80;
// …and fraction bounds: sizes can't collapse or exceed the window, and the
// header's top-left anchor stays reachable (≤ 0.95 leaves a grabbable sliver
// even when a resize shoves the panel toward an edge).
const MIN_SIZE_FRAC = 0.05;
const MAX_POS_FRAC = 0.95;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Pointer-drag helper: left-button `clientX/clientY` deltas, one callback per
 *  moved frame. Relies on the runtime's implicit pointer capture — the node
 *  keeps receiving `pointerMove` window-wide while the button is held (see
 *  `collect_pointer_events`), so thin handles don't lose the drag. The 0-delta
 *  early-out keeps a stationary held pointer free of re-renders. */
function useDragDelta(onDelta: (dx: number, dy: number) => void) {
  const last = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  return {
    onPointerDown: (e: PointerEventData) => {
      if (e.button !== 0) return;
      active.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    },
    onPointerMove: (e: PointerEventData) => {
      if (!active.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      if (dx !== 0 || dy !== 0) onDelta(dx, dy);
    },
    onPointerUp: () => {
      active.current = false;
    },
  };
}

export function DevtoolsHost() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("nodes");
  // Layout state — session-scoped (the host stays mounted while closed, so
  // mode/width/rect survive open/close and mode switches).
  const [mode, setMode] = useState<Mode>("right");
  // Docked only: push the app UI aside (Rust insets the app root's margin)
  // instead of overlaying it.
  const [reserve, setReserve] = useState(false);
  // Geometry is PROPORTIONAL — fractions of the window's logical size — so a
  // window resize scales the panel instead of stranding it off-screen. The
  // defaults mirror Rust's `DevtoolsSettings::default()`. Fractions resolve to
  // px against `win` at render; MIN_WIDTH/MIN_HEIGHT floor the result.
  const [widthFrac, setWidthFrac] = useState(0.3);
  const [rect, setRect] = useState({ x: 0.08, y: 0.1, w: 0.33, h: 0.7 });
  // The window's logical size, streamed by Bevy (`devtools.window` — on open
  // and on every resize while open). The fallback only matters for the first
  // open frame if the size event races the toggle.
  const [win, setWin] = useState({ w: 1280, h: 800 });
  // The inspector section's height (px); the tree/inspector separator drags it.
  const [split, setSplit] = useState(260);
  const [selected, setSelected] = useState<number | null>(null);
  const [picking, setPicking] = useState(false);
  // Whether the persistent selected-node box is drawn on screen (momentary
  // hover highlights are unaffected). Mirrored to Bevy via devtools.overlay.
  const [overlay, setOverlay] = useState(true);
  // The last picked node: TreeView expands its ancestors so it's visible.
  const [reveal, setReveal] = useState<number | null>(null);

  // Bevy owns the open state (toggle key, restored-open); the panel mirrors it.
  useEffect(() => onToggle((e) => setOpen(e.open)), []);

  // The window size feed the proportional layout resolves against.
  useEffect(() => onWindow((e) => setWin({ w: e.width, h: e.height })), []);

  // Pick mode clicked a node on screen: Bevy already selected it and exited
  // pick mode on its side; mirror both here and reveal the node in the tree.
  useEffect(
    () =>
      onPicked((e) => {
        setPicking(false);
        setSelected(e.id);
        setReveal(e.id);
        setTab("nodes");
      }),
    [],
  );

  // Tell Bevy which node id is the panel's own `<root>`, so pick mode rejects
  // exactly the panel (app `<root>` overlays stay pickable). This post-commit
  // effect runs after the open render's ops flushed — the bridge tap updates
  // the mirror synchronously during the commit, so the fresh root is visible.
  useEffect(() => {
    if (!open) return;
    const panel = mirror.roots().find((r) => mirror.isDevtools(r.id));
    sendPanelRoot(panel ? panel.id : null);
    return () => sendPanelRoot(null);
  }, [open]);

  // Escape exits pick mode, riding the built-in keyDown event.
  useEffect(() => {
    if (!picking) return;
    return addEventListener("keyDown", (e) => {
      if ((e as { key?: string }).key === "Escape") {
        setPicking(false);
        sendPick(false);
      }
    });
  }, [picking]);

  // Settings restored from disk (sent once after the app mounts — the host is
  // mounted-while-closed, so this lands even before the first open). Applied
  // with validation/clamps so an old or hand-edited file can't wedge the
  // panel. `open` is not applied here — a persisted open arrives as the
  // `devtools.toggle` Bevy sends right after this event; `overlay` only syncs
  // the button — Rust already seeded its own state from the file at build.
  useEffect(
    () =>
      onRestore((s) => {
        if (isTab(s.tab)) setTab(s.tab);
        if (s.mode === "left" || s.mode === "right" || s.mode === "float") {
          setMode(s.mode);
        }
        setWidthFrac(clamp(s.width_frac, MIN_SIZE_FRAC, 1));
        setRect({
          x: clamp(s.float_x_frac, 0, MAX_POS_FRAC),
          y: clamp(s.float_y_frac, 0, MAX_POS_FRAC),
          w: clamp(s.float_w_frac, MIN_SIZE_FRAC, 1),
          h: clamp(s.float_h_frac, MIN_SIZE_FRAC, 1),
        });
        setReserve(!!s.reserve);
        setOverlay(!!s.overlay);
        setSplit(Math.max(MIN_INSPECTOR, s.split));
      }),
    [],
  );

  // Report layout settings for persistence. The first-run skip means a mount
  // with defaults never creates the settings file; a restore's re-send of the
  // just-loaded values is de-duped Rust-side. Per-frame emits during drags are
  // deliberate — the file write is debounced in Rust. `open` rides along so
  // the panel reopens where you left it on the next launch.
  const settingsReady = useRef(false);
  useEffect(() => {
    if (!settingsReady.current) {
      settingsReady.current = true;
      return;
    }
    sendSettings({
      open,
      tab,
      mode,
      width_frac: widthFrac,
      float_x_frac: rect.x,
      float_y_frac: rect.y,
      float_w_frac: rect.w,
      float_h_frac: rect.h,
      reserve,
      overlay,
      split,
    });
  }, [open, tab, mode, widthFrac, rect, reserve, overlay, split]);

  // Fractions resolved to logical px against the live window size, with the
  // pixel floors applied (a proportional panel on a tiny window stays usable;
  // `maxWidth/maxHeight: 100%` in the style bounds the other end).
  const widthPx = Math.max(MIN_WIDTH, widthFrac * win.w);
  const rectPx = {
    x: clamp(rect.x, 0, MAX_POS_FRAC) * win.w,
    y: clamp(rect.y, 0, MAX_POS_FRAC) * win.h,
    w: Math.max(MIN_WIDTH, rect.w * win.w),
    h: Math.max(MIN_HEIGHT, rect.h * win.h),
  };

  // The effective space reservation, in px. Keyed on `widthFrac` AND `win` so
  // the app follows both an edge resize and a window resize live.
  // Rust gates the margin on the panel's open state, so no
  // cleanup is needed on close. If a huge app tree ever stutters during the
  // drag, retreat to a committed-on-pointerUp width here.
  useEffect(() => {
    if (!open) return;
    sendDock(
      mode !== "float" && reserve ? mode : null,
      Math.max(MIN_WIDTH, widthFrac * win.w),
    );
  }, [open, mode, reserve, widthFrac, win]);

  // The three drag gestures (hooks run unconditionally; spread conditionally).
  // Pixel deltas convert to fractions against the live window size.
  const edgeDrag = useDragDelta((dx) =>
    setWidthFrac((f) =>
      clamp(
        mode === "right" ? f - dx / win.w : f + dx / win.w,
        MIN_SIZE_FRAC,
        1,
      ),
    ),
  );
  const moveDrag = useDragDelta((dx, dy) =>
    setRect((r) => ({
      ...r,
      // Keep the header reachable: clamped inside the window on every side
      // (a later window shrink re-clamps at render, so no runaway is possible).
      x: clamp(r.x + dx / win.w, 0, MAX_POS_FRAC),
      y: clamp(r.y + dy / win.h, 0, MAX_POS_FRAC),
    })),
  );
  const sizeDrag = useDragDelta((dx, dy) =>
    setRect((r) => ({
      ...r,
      w: clamp(r.w + dx / win.w, MIN_SIZE_FRAC, 1),
      h: clamp(r.h + dy / win.h, MIN_SIZE_FRAC, 1),
    })),
  );

  if (!open) return null;

  const close = () => {
    if (picking) {
      setPicking(false);
      sendPick(false);
    }
    setOpen(false);
    sendOpen(false); // self-initiated: sync Bevy's DevtoolsState
    // …and disarm the recorder directly — a self-close gets no toggle echo.
    recorder.setEnabled(false);
  };
  const select = (id: number | null) => {
    setSelected(id);
    sendSelect(id); // drive the on-screen highlight
  };
  const togglePick = () => {
    const next = !picking;
    setPicking(next);
    sendPick(next);
  };
  const toggleOverlay = () => {
    const next = !overlay;
    setOverlay(next);
    sendOverlay(next);
  };

  const floating = mode === "float";
  return (
    // The panel claims the very top of the global stack explicitly (a plain
    // `<root>` defaults to a modest `globalZIndex: 1` so app overlays can
    // layer freely); tooling must float above whatever the app renders.
    <root name="devtools" style={{ globalZIndex: 2147483647 }}>
      <node
        style={{
          positionType: "absolute",
          // Docked ↔ float (and left ↔ right) swaps which inset/size fields
          // are present; the style diff sends the dropped ones through
          // `styleUnset` automatically.
          ...(floating
            ? {
                left: rectPx.x,
                top: rectPx.y,
                width: rectPx.w,
                height: rectPx.h,
                maxHeight: "100%",
                border: 1,
                boxShadow: { color: "#00000088", yOffset: 4, blurRadius: 16 },
              }
            : {
                ...(mode === "right"
                  ? { right: 0, border: { left: 1 } }
                  : { left: 0, border: { right: 1 } }),
                top: 0,
                bottom: 0,
                width: widthPx,
              }),
          // The fractions are already window-relative; the max bounds catch
          // the px floors on a window smaller than them.
          maxWidth: "100%",
          backgroundColor: theme.bg,
          borderColor: theme.border,
          flexDirection: "column",
          // The panel is a solid surface: block picking below it so clicks,
          // hovers, and wheel gestures never leak to the app underneath.
          focusPolicy: "block",
        }}
      >
        <Header
          picking={picking}
          overlay={overlay}
          mode={mode}
          reserve={reserve}
          drag={floating ? moveDrag : undefined}
          onMode={setMode}
          onReserve={() => setReserve((r) => !r)}
          onPick={togglePick}
          onOverlay={toggleOverlay}
          onClose={close}
        />
        <TabBar tab={tab} onTab={setTab} />
        <node style={{ flexGrow: 1, minHeight: 0, flexDirection: "column" }}>
          {tab === "nodes" ? (
            <NodesTab
              selected={selected}
              onSelect={select}
              reveal={reveal}
              split={split}
              onSplit={setSplit}
            />
          ) : tab === "layers" ? (
            <LayersPanel />
          ) : tab === "console" ? (
            <ConsolePanel />
          ) : (
            <LogPanel />
          )}
        </node>
        <StatsBar />
        {/* Resize handles, painted above the sections (last children).
            `focusPolicy: "block"` so a press can't also press what's under
            them. The float grip shows an always-visible L-shape (easy to miss
            otherwise); the docked edge strip stays transparent until hovered. */}
        {floating ? (
          <node
            style={{
              positionType: "absolute",
              right: 0,
              bottom: 0,
              width: 16,
              height: 16,
              border: { right: 3, bottom: 3 },
              borderColor: theme.textDim,
              focusPolicy: "block",
            }}
            hoverStyle={{
              borderColor: theme.accent,
              backgroundColor: theme.bgActive,
            }}
            {...sizeDrag}
          />
        ) : (
          <node
            style={{
              positionType: "absolute",
              top: 0,
              bottom: 0,
              width: 5,
              ...(mode === "right" ? { left: 0 } : { right: 0 }),
              focusPolicy: "block",
            }}
            hoverStyle={{ backgroundColor: theme.accent }}
            {...edgeDrag}
          />
        )}
      </node>
    </root>
  );
}

function Header({
  picking,
  overlay,
  mode,
  reserve,
  drag,
  onMode,
  onReserve,
  onPick,
  onOverlay,
  onClose,
}: {
  picking: boolean;
  overlay: boolean;
  mode: Mode;
  reserve: boolean;
  /** Float mode: drag handlers that move the window. Safe to put on the whole
   *  header — a press on a child button attributes to the button (buttons
   *  block), so button clicks never start a window drag. */
  drag?: ReturnType<typeof useDragDelta>;
  onMode: (m: Mode) => void;
  onReserve: () => void;
  onPick: () => void;
  onOverlay: () => void;
  onClose: () => void;
}) {
  return (
    <node
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        padding: { left: 10, right: 6, top: 6, bottom: 6 },
        backgroundColor: theme.bgAlt,
        border: { bottom: 1 },
        borderColor: theme.border,
        // Belt-and-braces vs the scroll-clip picking bug (see core
        // `pick_clip`): fixed sections block hits so scrolled-out tree rows
        // can never be reached through them even if the core filter regresses.
        focusPolicy: "block",
      }}
      {...(drag ?? {})}
    >
      <text style={{ color: theme.text, fontSize: 13 }}>devtools</text>
      <node style={{ flexDirection: "row", gap: 4 }}>
        {/* ASCII labels only (icon glyphs are tofu in the default font). */}
        <IconButton
          label="L"
          active={mode === "left"}
          onClick={() => onMode("left")}
        />
        <IconButton
          label="R"
          active={mode === "right"}
          onClick={() => onMode("right")}
        />
        <IconButton
          label="F"
          active={mode === "float"}
          onClick={() => onMode("float")}
        />
        {mode !== "float" && (
          <IconButton label="push" active={reserve} onClick={onReserve} />
        )}
        <IconButton label="pick" active={picking} onClick={onPick} />
        <IconButton label="overlay" active={overlay} onClick={onOverlay} />
        <IconButton label="x" onClick={onClose} />
      </node>
    </node>
  );
}

/** A small labeled action button (header actions, log controls). ASCII labels
 *  only — the app's default font may lack icon glyphs (tofu boxes). */
export function IconButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      style={{
        height: 20,
        padding: { horizontal: 6 },
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        backgroundColor: active ? theme.bgActive : "transparent",
      }}
      hoverStyle={{ backgroundColor: theme.bgActive }}
      onClick={onClick}
    >
      <text
        style={{ color: active ? theme.accent : theme.textDim, fontSize: 11 }}
      >
        {label}
      </text>
    </button>
  );
}

function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <node
      style={{
        flexDirection: "row",
        backgroundColor: theme.bgAlt,
        border: { bottom: 1 },
        borderColor: theme.border,
        focusPolicy: "block",
      }}
    >
      <TabButton
        label="Nodes"
        active={tab === "nodes"}
        onClick={() => onTab("nodes")}
      />
      <TabButton
        label="Layers"
        active={tab === "layers"}
        onClick={() => onTab("layers")}
      />
      <TabButton
        label="Console"
        active={tab === "console"}
        onClick={() => onTab("console")}
      />
      <TabButton
        label="Bridge"
        active={tab === "bridge"}
        onClick={() => onTab("bridge")}
      />
    </node>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      style={{
        padding: { horizontal: 12, vertical: 5 },
        border: { bottom: 2 },
        borderColor: active ? theme.accent : "transparent",
      }}
      hoverStyle={{ backgroundColor: theme.bgActive }}
      onClick={onClick}
    >
      <text
        style={{ color: active ? theme.text : theme.textDim, fontSize: 12 }}
      >
        {label}
      </text>
    </button>
  );
}

/** A scrolling region (tab bodies, inspector): vertical always, horizontal
 *  when content overflows (the scrollbar shell hides an axis with no range).
 *  `minHeight: 0` is load-bearing: a flex child won't shrink below its content
 *  size by default, so without it the region grows past the panel and
 *  `overflowY` never engages (the log looked unscrollable). The inner wrapper
 *  is the app page-scroller pattern (see `App.tsx` `contentInnerStyle`):
 *  `alignItems: "flexStart"` lets wide rows overflow instead of being forced
 *  to the viewport width, while `minWidth: "100%"` keeps narrow rows (and
 *  their hover/selection backgrounds) spanning the full panel. */
export function ScrollArea({
  children,
  scrollTop,
  onScroll,
}: {
  children?: ReactNode;
  /** Optional controlled scroll offset (act-now: re-applied only when the
   *  value changes). Pass a growing over-large value to pin to the bottom —
   *  the write is clamped to the content range, and the overshoot's
   *  read-back fires one `onScroll` with the real offset (the true max). */
  scrollTop?: number;
  /** Optional scroll read-back (wheel scrolls AND clamped controlled
   *  writes). */
  onScroll?: (e: { scrollTop: number; scrollLeft: number }) => void;
}) {
  return (
    <node
      scrollTop={scrollTop}
      onScroll={onScroll}
      style={{
        flexGrow: 1,
        minHeight: 0,
        flexDirection: "column",
        alignItems: "flexStart",
        overflowY: "scroll",
        overflowX: "scroll",
        scrollbar: { position: "gutter", thickness: 8 },
      }}
    >
      <node style={{ flexDirection: "column", minWidth: "100%" }}>
        {children}
      </node>
    </node>
  );
}

/** A [`ScrollArea`] for chronological logs (newest at the bottom) that
 *  auto-scrolls to the bottom when new content arrives — but only while the
 *  view is already there; scrolling up parks it until the user returns to the
 *  bottom (Chrome-console behavior).
 *
 *  JS can't see the content height, so "bottom" is learned from the scroll
 *  read-back: each pin write overshoots (`1e9 + pinKey`), Rust re-clamps it
 *  after layout (`settle_controlled_scroll`) and reports the REAL offset —
 *  the true max — through `onScroll`; wheel scrolls report through the same
 *  channel. At-bottom ⇔ the reported offset is within a hairline of the
 *  largest offset ever seen. The pin value must CHANGE to re-apply
 *  (`scrollTop` is act-now, sent only when it differs), hence riding
 *  `pinKey`. */
export function StickyScrollArea({
  pinKey,
  children,
}: {
  /** Monotonic marker of the newest content (e.g. the last entry's seq); a
   *  change re-pins while stuck. `undefined` = no content, no pinning. */
  pinKey?: number;
  children?: ReactNode;
}) {
  const [stick, setStick] = useState(true);
  const maxSeen = useRef(0);
  const onScroll = (e: { scrollTop: number; scrollLeft: number }) => {
    setStick(e.scrollTop >= maxSeen.current - 2);
    if (e.scrollTop > maxSeen.current) maxSeen.current = e.scrollTop;
  };
  const pin = stick && pinKey !== undefined ? 1e9 + pinKey : undefined;
  return (
    <ScrollArea scrollTop={pin} onScroll={onScroll}>
      {children}
    </ScrollArea>
  );
}

/** A small pill toggle (log filters, root selector). */
export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      style={{
        padding: { horizontal: 6, vertical: 1 },
        borderRadius: 8,
        backgroundColor: active ? theme.bgActive : "transparent",
        border: 1,
        borderColor: active ? theme.accent : theme.border,
      }}
      hoverStyle={{ backgroundColor: theme.bgActive }}
      onClick={onClick}
    >
      <text
        style={{
          color: active ? theme.text : theme.textDim,
          fontSize: 10,
        }}
      >
        {label}
      </text>
    </button>
  );
}

function NodesTab({
  selected,
  onSelect,
  reveal,
  split,
  onSplit,
}: {
  selected: number | null;
  onSelect: (id: number | null) => void;
  reveal: number | null;
  /** The inspector section's height (px); the separator drags it. */
  split: number;
  onSplit: (update: (s: number) => number) => void;
}) {
  // Dragging the separator down (dy > 0) grows the tree / shrinks the
  // inspector; the layer's `maxHeight` upper-bounds it (see below).
  const splitDrag = useDragDelta((_dx, dy) =>
    onSplit((s) => Math.max(MIN_INSPECTOR, s - dy)),
  );
  return (
    <>
      <ScrollArea>
        <TreeView selected={selected} onSelect={onSelect} reveal={reveal} />
      </ScrollArea>
      {/* The tree/inspector separator: a draggable strip carrying the hairline
          divider. `focusPolicy: "block"` like the other handles, so a press
          can't fall through to scrolled-out tree rows. */}
      <node
        style={{
          height: 6,
          flexShrink: 0,
          border: { top: 1 },
          borderColor: theme.border,
          focusPolicy: "block",
        }}
        hoverStyle={{ backgroundColor: theme.accent }}
        {...splitDrag}
      />
      <node
        style={{
          height: split,
          // JS can't see the panel height: the drag handler lower-bounds the
          // inspector, this upper-bounds it (the tree keeps >= 25%).
          maxHeight: "75%",
          flexDirection: "column",
          // Blocks scrolled-out tree rows stacked beneath (see Header note).
          focusPolicy: "block",
        }}
      >
        <ScrollArea>
          {/* Keyed by node: a selection change remounts the inspector, so any
              open inline editor closes instead of retargeting the new node. */}
          <Inspector key={selected} id={selected} />
        </ScrollArea>
      </node>
    </>
  );
}
