---
name: verify
description: Drive the demos app with real input (xdotool on X11) to verify interactive behavior — pointer events, hover, drag, surface picking — and capture screenshot evidence.
---

# Verifying bevy-react interactively

For static visuals use `--shoot` (see CLAUDE.md). For **interactive** behavior
(pointer events, drags, hover, scrolling) drive a real window with xdotool:

```sh
npm run build -w demos
cargo build -p bevy-react --example demos
nohup cargo run -p bevy-react --example demos > /tmp/app.log 2>&1 &
WID=$(xdotool search --name "bevy-react · demos" | tail -1)
xdotool windowactivate $WID
eval $(xdotool getwindowgeometry --shell $WID)   # X/Y/WIDTH/HEIGHT (tiled WM; position is real)
```

## Capture

`import -window $WID` FAILS on this compositor ("missing an image filename").
Capture the root and crop to the window geometry instead:

```sh
import -window root full.png
magick full.png -crop ${WIDTH}x${HEIGHT}+${X}+${Y} +repage app.png
```

Screen is 2560x1440; the app tile is usually ~1276x684 in the bottom-left.
Screen coords = window X/Y + in-window coords.

## Driving the UI

- Nav section headers do NOT toggle on body click — click the `+`/`−` icon at
  the header's right edge (~x=207 in-window).
- The nav is a scroll container: `xdotool click --repeat 8 --delay 60 5` with
  the cursor over it scrolls down (button 4 = up).
- Drag: `xdotool mousedown 1`, a series of `xdotool mousemove X Y` with small
  sleeps, `xdotool mouseup 1`.
- The Mouse demo (Interactions → Mouse) shows a live 6-line pointer-event log —
  the observable for pointer-event timing/dedupe claims.
- The Home screen's CRT is a live `<surface>` — hovering/clicking "Switch to
  flat" exercises the virtual-pointer path end-to-end.

## Gotchas

- zsh does not word-split unquoted vars: `xdotool mousemove $p` with
  `p="660 950"` fails. Use explicit args or `${=p}`.
- `pkill -f <pattern>` kills your own wrapper shell if the pattern appears in
  the command string. Kill with `pkill -x demos`.
- Save and restore the user's context: `xdotool getactivewindow` +
  `getmouselocation` before, `windowactivate` + `mousemove` back after.
- Two `pixel-identical?` captures: `magick compare -metric AE a.png b.png null:`
  (prints differing-pixel count; it exits nonzero on identical — check output,
  not exit code).
