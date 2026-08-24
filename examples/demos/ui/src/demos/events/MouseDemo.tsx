import { useRef, useState } from "react";
import { BevyStyle, PointerEventData, WheelEventData } from "bevy-react/jsx";
import { DemoRow, Example } from "@/components";
import { Code, InlineCode, P, Ul, Li } from "@/components/docs";
import { Colors, FontSizes } from "@/theme";
import { useDemoPage, type ExplanationData } from "@/explanationStore";

const STAGE_W = 380;
const STAGE_H = 240;
const BOX = 100;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

type LogLine = { id: number; text: string };

const PAGE: ExplanationData = {
  title: "Mouse",
  info: (
    <>
      <P>
        The raw pointer events the bridge reports:{" "}
        <InlineCode>onClick</InlineCode> (left-button only, fired on release
        over the pressed node), <InlineCode>onPointerDown</InlineCode> /{" "}
        <InlineCode>onPointerMove</InlineCode> /{" "}
        <InlineCode>onPointerUp</InlineCode> (any mouse button — the event's{" "}
        <InlineCode>button</InlineCode> is its DOM number), the hover boundary{" "}
        <InlineCode>onPointerEnter</InlineCode> /{" "}
        <InlineCode>onPointerLeave</InlineCode>, and{" "}
        <InlineCode>onWheel</InlineCode> for raw wheel deltas.
      </P>
      <Code lang="tsx">{`<node
  onClick={(e) => select(e)}
  onPointerDown={(e) => startDrag(e.clientX, e.clientY)}
  onPointerMove={(e) => drag(e.clientX, e.clientY)}
  onPointerUp={() => endDrag()}
  onPointerEnter={() => setHovered(true)}
  onPointerLeave={() => setHovered(false)}
  onWheel={(e) => zoomBy(e.deltaY)}
/>`}</Code>
      <Ul>
        <Li>
          Pointer events carry both normalized x / y (clamped to the node) and
          absolute clientX / clientY window coordinates.
        </Li>
        <Li>No Bevy scene on this page: the 3D viewport stays empty.</Li>
      </Ul>
    </>
  ),
};

export function MouseDemo() {
  useDemoPage(PAGE);

  return (
    <>
      <DemoRow>
        <DragDemo />
      </DemoRow>
      <DemoRow>
        <HoverDemo />
        <WheelDemo />
      </DemoRow>
    </>
  );
}

const DRAG_TSX = `const onPointerDown = (e: PointerEventData) => {
  lastClient.current = { x: e.clientX, y: e.clientY };
  setPressed(true);
};

const onPointerMove = (e: PointerEventData) => {
  const dx = e.clientX - lastClient.current.x;
  const dy = e.clientY - lastClient.current.y;
  lastClient.current = { x: e.clientX, y: e.clientY };
  setPos((p) => ({ left: p.left + dx, top: p.top + dy }));
};

<node
  onClick={() => record("click")}
  onPointerDown={onPointerDown}
  onPointerMove={onPointerMove}
  onPointerUp={() => setPressed(false)}
/>;`;

function DragDemo() {
  return (
    <Example
      title="Dragging"
      info={
        <>
          <P>
            Raw pointer events the bridge reports. Grab the box and drag it
            around the stage — dragging uses the absolute{" "}
            <InlineCode>clientX</InlineCode> / <InlineCode>clientY</InlineCode>{" "}
            deltas (the normalized <InlineCode>x</InlineCode> /{" "}
            <InlineCode>y</InlineCode> are clamped to the box and can't drive
            free movement); the log shows each event with its DOM button number.
          </P>
          <Code lang="tsx">{DRAG_TSX}</Code>
        </>
      }
      demo={DragCard}
    />
  );
}

function DragCard() {
  const [pos, setPos] = useState({
    left: (STAGE_W - BOX) / 2,
    top: (STAGE_H - BOX) / 2,
  });
  const [pressed, setPressed] = useState(false);
  const [last, setLast] = useState("-");
  const [log, setLog] = useState<LogLine[]>([]);

  // Cursor position at the previous drag frame, so we move the box by the delta.
  const lastClient = useRef({ x: 0, y: 0 });
  const lineId = useRef(0);

  const record = (text: string) => {
    setLast(text);
    setLog((prev) => {
      const next = [{ id: lineId.current++, text }, ...prev];
      return next.slice(0, 6);
    });
  };

  const fmt = (e: PointerEventData) =>
    `x=${e.x.toFixed(2)} y=${e.y.toFixed(2)} | client=(${Math.round(
      e.clientX,
    )}, ${Math.round(e.clientY)}) | btn=${e.button}`;

  const onPointerDown = (e: PointerEventData) => {
    lastClient.current = { x: e.clientX, y: e.clientY };
    setPressed(true);
    record(`pointerDown  ${fmt(e)}`);
  };

  const onPointerMove = (e: PointerEventData) => {
    const dx = e.clientX - lastClient.current.x;
    const dy = e.clientY - lastClient.current.y;
    lastClient.current = { x: e.clientX, y: e.clientY };
    setPos((p) => ({
      left: clamp(p.left + dx, 0, STAGE_W - BOX),
      top: clamp(p.top + dy, 0, STAGE_H - BOX),
    }));
    record(`pointerMove  ${fmt(e)}`);
  };

  const onPointerUp = (e: PointerEventData) => {
    setPressed(false);
    record(`pointerUp  ${fmt(e)}`);
  };

  return (
    <>
      <node style={stageStyle}>
        <node
          style={{
            ...boxStyle,
            positionType: "absolute",
            left: pos.left,
            top: pos.top,
            backgroundColor: pressed ? Colors.purple100 : Colors.primary100,
            border: 2,
          }}
          onClick={() => record("click")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <text style={boxLabelStyle}>drag</text>
        </node>
      </node>

      <text
        style={{
          color: Colors.primary100,
          fontSize: FontSizes.sm,
          fontWeight: "bold",
        }}
      >
        {last}
      </text>

      <node style={logStyle}>
        {log.map((l) => (
          <text key={l.id} style={logLineStyle}>
            {l.text}
          </text>
        ))}
      </node>
    </>
  );
}

function HoverDemo() {
  return (
    <Example
      title="Hovering"
      info={
        <>
          <P>
            Hover boundary events: <InlineCode>onPointerEnter</InlineCode> /{" "}
            <InlineCode>onPointerLeave</InlineCode> fire once per crossing. Move
            the cursor on and off the left box to drive the right one's
            transition.
          </P>
          <Code lang="tsx">{`<node
  onPointerEnter={() => setHovering(true)}
  onPointerLeave={() => setHovering(false)}
/>`}</Code>
        </>
      }
      demo={HoverCard}
    />
  );
}

function HoverCard() {
  const [hovering, setHovering] = useState(false);

  return (
    <node style={{ flexDirection: "row", gap: 20 }}>
      <node
        style={boxStyle}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        <text style={boxLabelStyle}>Hover me</text>
      </node>
      <node
        style={{
          ...boxStyle,
          transform: {
            rotate: hovering ? "-20deg" : 0,
            translateY: hovering ? -20 : 0,
          },
          transition: { transform: { duration: 300, easing: "easeInOut" } },
        }}
      >
        <text style={boxLabelStyle}>
          {hovering ? "hovered" : "not hovered"}
        </text>
      </node>
    </node>
  );
}

const WHEEL_TSX = `const onWheel = (e: WheelEventData) => {
  // Line-unit notches (a mouse wheel) get a bigger step
  // than pixel-unit trackpad deltas.
  const step =
    e.deltaMode === "line" ? e.deltaY * 0.1 : e.deltaY * 0.005;
  // Wheel up (deltaY < 0) zooms in.
  setZoom((z) => clamp(z - step, 0.5, 3));
};

<node onWheel={onWheel} />;`;

function WheelDemo() {
  return (
    <Example
      title="Wheel scrolling"
      info={
        <>
          <P>
            <InlineCode>onWheel</InlineCode> hands any node the raw wheel deltas
            — no <InlineCode>overflow: scroll</InlineCode> needed. Line-unit
            notches (a mouse wheel) and pixel-unit trackpad deltas are scaled
            differently. Scroll the wheel over the box to zoom it; handling the
            wheel also traps it from world systems, so a zoomable surface can
            coexist with an orbit camera behind the UI.
          </P>
          <Code lang="tsx">{WHEEL_TSX}</Code>
        </>
      }
      demo={WheelCard}
    />
  );
}

function WheelCard() {
  const [zoom, setZoom] = useState(1);

  const onWheel = (e: WheelEventData) => {
    const step = e.deltaMode === "line" ? e.deltaY * 0.1 : e.deltaY * 0.005;
    // Wheel up (deltaY < 0) zooms in.
    setZoom((z) => clamp(z - step, 0.5, 3));
  };

  const side = Math.round(BOX * zoom);

  return (
    <node
      style={{
        ...stageStyle,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <node
        style={{
          width: side,
          height: side,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.primary100,
          flexDirection: "column",
          padding: 10,
        }}
        onWheel={onWheel}
      >
        <text style={boxLabelStyle}>Scroll me</text>
        <text style={boxLabelStyle}>{`${zoom.toFixed(2)}×`}</text>
      </node>
    </node>
  );
}

const stageStyle: BevyStyle = {
  width: STAGE_W,
  height: STAGE_H,
  positionType: "relative",
  backgroundColor: Colors.surface100,
  borderRadius: 12,
  border: 1,
  borderColor: Colors.surface400,
  overflowX: "hidden",
  overflowY: "hidden",
};

const boxStyle: BevyStyle = {
  width: BOX,
  height: BOX,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: Colors.amber100,
};

const boxLabelStyle: BevyStyle = {
  color: Colors.textColor400,
  fontSize: FontSizes.sm,
  fontWeight: "bold",
  textAlign: "center",
};

const logStyle: BevyStyle = {
  flexDirection: "column",
  alignItems: "start",
  gap: 2,
  width: STAGE_W,
  height: 110,
};

const logLineStyle: BevyStyle = {
  color: Colors.textColor300,
  fontSize: FontSizes.xs,
};
