"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key2 of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key2) && key2 !== except)
          __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // vendor-global:bevy-react/jsx-runtime
  var require_jsx_runtime = __commonJS({
    "vendor-global:bevy-react/jsx-runtime"(exports, module) {
      module.exports = globalThis.__bevyVendor["bevy-react/jsx-runtime"];
    }
  });

  // vendor-global:bevy-react
  var require_bevy_react = __commonJS({
    "vendor-global:bevy-react"(exports, module) {
      module.exports = globalThis.__bevyVendor["bevy-react"];
    }
  });

  // vendor-global:react
  var require_react = __commonJS({
    "vendor-global:react"(exports, module) {
      module.exports = globalThis.__bevyVendor["react"];
    }
  });

  // src/index.tsx
  var import_jsx_runtime35 = __toESM(require_jsx_runtime(), 1);
  var import_bevy_react11 = __toESM(require_bevy_react(), 1);

  // src/App.tsx
  var import_jsx_runtime34 = __toESM(require_jsx_runtime(), 1);
  var import_react20 = __toESM(require_react(), 1);

  // src/bevy.ts
  var import_bevy_react = __toESM(require_bevy_react(), 1);
  function emit(name2, value) {
    (0, import_bevy_react.emit)(name2, value);
  }
  function request(name2, value) {
    return (0, import_bevy_react.request)(name2, value);
  }
  function on(name2, cb) {
    (0, import_bevy_react.addEventListener)(name2, cb);
    return () => (0, import_bevy_react.removeEventListener)(name2, cb);
  }
  function removeEventListener(name2, cb) {
    (0, import_bevy_react.removeEventListener)(name2, cb);
  }
  var bevy = {
    emit,
    request,
    on,
    addEventListener: on,
    removeEventListener,
    app: {
      quit(value) {
        emit("app.quit", value);
      }
    },
    dioramas: {
      difficulty(value) {
        emit("dioramas.difficulty", value);
      },
      world(value) {
        emit("dioramas.world", value);
      }
    },
    gamepad: {
      getAll() {
        return request("gamepad.getAll", null);
      },
      rumble(value) {
        emit("gamepad.rumble", value);
      },
      stopRumble(value) {
        emit("gamepad.stopRumble", value);
      }
    },
    settings: {
      gamma(value) {
        emit("settings.gamma", value);
      },
      graphics(value) {
        emit("settings.graphics", value);
      },
      video(value) {
        emit("settings.video", value);
      }
    },
    sound: {
      play(value) {
        emit("sound.play", value);
      },
      volume(value) {
        emit("sound.volume", value);
      }
    },
    window: {
      size() {
        return request("window.size", null);
      }
    }
  };

  // src/hooks.ts
  var import_react = __toESM(require_react(), 1);
  var import_bevy_react2 = __toESM(require_bevy_react(), 1);
  function useEvent(name2, run) {
    const latest = (0, import_react.useRef)(run);
    latest.current = run;
    (0, import_react.useEffect)(() => on(name2, (value) => latest.current(value)), [
      name2
    ]);
  }
  function useKeys(run, repeat = false) {
    useEvent("keyDown", (e) => {
      if (e.repeat && !repeat) return;
      run(e);
    });
  }
  function useDebug(verb, run) {
    useEvent("debug.act", ({ action }) => {
      const [head, ...rest] = action.split(" ");
      if (head === verb) run(rest.join(" "));
    });
  }
  function useEnter(x = -24, delay = 0, duration = 280) {
    const t = (0, import_bevy_react2.useSharedValue)(0);
    (0, import_react.useEffect)(() => {
      t.value = (0, import_bevy_react2.withDelay)(delay, (0, import_bevy_react2.withTiming)(1, {
        duration,
        easing: "easeOut"
      }));
    }, [
      t,
      delay,
      duration
    ]);
    return {
      opacity: {
        animated: t
      },
      transform: {
        translateX: {
          animated: (0, import_bevy_react2.interpolate)(t, [
            0,
            1
          ], [
            x,
            0
          ])
        }
      }
    };
  }

  // src/screens/Credits.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
  var import_react3 = __toESM(require_react(), 1);
  var import_bevy_react3 = __toESM(require_bevy_react(), 1);

  // src/sound.ts
  function sfx(name2) {
    bevy.sound.play({
      name: name2
    });
  }

  // src/theme.ts
  var C = {
    red: "#ff5d51",
    redHi: "#ff8a7f",
    redDim: "#c72e2b",
    redDeep: "#912d2a",
    redLine: "rgba(255, 93, 81, 0.5)",
    redFaint: "rgba(255, 93, 81, 0.16)",
    cyan: "#5ef6ff",
    cyanHi: "#23f9ff",
    cyanDim: "#52bcd4",
    cyanDeep: "#0f3a44",
    cyanFaint: "rgba(94, 246, 255, 0.12)",
    yellow: "#fff002",
    white: "#e6fdf3",
    ink: "#050b10",
    // Panel fills.
    band: "rgba(58, 18, 24, 0.5)",
    section: "#22111c",
    row: "#1f0e15",
    field: "#16121f",
    button: "#11111e",
    shade: "rgba(5, 7, 12, 0.72)",
    clear: "rgba(0, 0, 0, 0)"
  };
  var F = {
    semibold: "Rajdhani SemiBold",
    bold: "Rajdhani Bold",
    mono: "Mono"
  };
  var T = {
    /** Menu items, buttons: big uppercase. */
    menu: {
      fontSize: 30,
      color: C.red,
      lineBreak: "noWrap"
    },
    /** Screen titles ("SELECT DIFFICULTY LEVEL"). */
    title: {
      fontSize: 36,
      color: C.cyan,
      letterSpacing: 0.5,
      lineBreak: "noWrap"
    },
    /** Uppercase subtitles under a title. */
    caption: {
      fontSize: 19,
      color: C.red,
      letterSpacing: 0.4
    },
    /** Settings labels, list text. */
    label: {
      fontSize: 22,
      fontFamily: F.semibold,
      color: C.red,
      lineBreak: "noWrap"
    },
    /** Section headers inside lists. */
    section: {
      fontSize: 22,
      fontFamily: F.semibold,
      color: C.white,
      lineBreak: "noWrap"
    },
    /** Body copy. */
    body: {
      fontSize: 22,
      color: C.cyan,
      lineHeight: 1.35
    },
    /** The tiny data noise sprinkled around the frames. */
    micro: {
      fontSize: 9,
      fontFamily: F.mono,
      color: C.redDim,
      lineHeight: 1.3
    }
  };
  var FROM = {
    br: 315,
    tl: 135,
    tr: 225,
    bl: 45
  };
  var transparent = "rgba(0, 0, 0, 0)";
  function chamfer(fill, cut, line2, width = 1, corner = "br") {
    const d = cut / Math.SQRT2;
    const angle = FROM[corner];
    if (!line2) {
      return {
        backgroundGradient: {
          type: "linear",
          angle,
          stops: [
            {
              color: transparent,
              position: d - 0.6
            },
            {
              color: fill,
              position: d + 0.6
            }
          ]
        }
      };
    }
    const inner = d - Math.SQRT2 * width;
    return {
      border: width,
      backgroundGradient: {
        type: "linear",
        angle,
        stops: [
          {
            color: transparent,
            position: inner - 0.6
          },
          {
            color: line2,
            position: inner + 0.6
          },
          {
            color: line2,
            position: inner + width - 0.4
          },
          {
            color: fill,
            position: inner + width + 0.6
          }
        ]
      },
      borderGradient: {
        type: "linear",
        angle,
        stops: [
          {
            color: transparent,
            position: d - 0.6
          },
          {
            color: line2,
            position: d + 0.6
          }
        ]
      }
    };
  }
  var SCANLINES = {
    src: "images/scanlines.png",
    mode: "repeat",
    scale: 1
  };

  // src/ui/kit.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);

  // src/ui/icons.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
  function MouseIcon({ color = C.cyan, size = 26 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      viewBox: "0 0 16 24",
      style: {
        width: size * 16 / 24,
        height: size
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M8 1.5 C4 1.5 1.8 4 1.8 8 L1.8 16 C1.8 20 4.4 22.5 8 22.5 C11.6 22.5 14.2 20 14.2 16 L14.2 8 C14.2 4 12 1.5 8 1.5 Z",
          fill: "none",
          stroke: color,
          strokeWidth: 1.6
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M8 2.5 L8 9.5 L2.8 9.5 L2.8 8 C2.8 4.6 4.6 2.6 8 2.5 Z",
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
          x1: 1.8,
          y1: 10,
          x2: 14.2,
          y2: 10,
          stroke: color,
          strokeWidth: 1.2
        })
      ]
    });
  }
  function ProtocolGlyph({ color = C.cyan, width = 30 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      viewBox: "0 0 30 22",
      style: {
        width,
        height: width * 22 / 30
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 0,
          y: 0,
          width: 12,
          height: 2.2,
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 14,
          y: 0,
          width: 16,
          height: 2.2,
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 0,
          y: 4,
          width: 20,
          height: 2.2,
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 22,
          y: 4,
          width: 8,
          height: 2.2,
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 0,
          y: 8,
          width: 8,
          height: 2.2,
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 10,
          y: 8,
          width: 20,
          height: 2.2,
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
          points: [
            0,
            14,
            10,
            14,
            13,
            11,
            17,
            17,
            20,
            14,
            30,
            14
          ],
          fill: "none",
          stroke: color,
          strokeWidth: 1.4
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 0,
          y: 19,
          width: 30,
          height: 1.2,
          fill: color,
          opacity: 0.6
        })
      ]
    });
  }
  function WarningIcon({ color = C.red, size = 18 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      viewBox: "0 0 20 18",
      style: {
        width: size,
        height: size * 18 / 20
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
          points: [
            10,
            1,
            19,
            17,
            1,
            17
          ],
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 9,
          y: 6,
          width: 2,
          height: 6,
          fill: "#120a0c"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 9,
          y: 13.5,
          width: 2,
          height: 2,
          fill: "#120a0c"
        })
      ]
    });
  }
  function Arrow({ dir, color = C.cyan, size = 20 }) {
    const points = dir === "left" ? [
      17,
      2,
      3,
      10,
      17,
      18
    ] : [
      3,
      2,
      17,
      10,
      3,
      18
    ];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
      viewBox: "0 0 20 20",
      style: {
        width: size,
        height: size
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
        points,
        fill: "none",
        stroke: color,
        strokeWidth: 2
      })
    });
  }

  // src/ui/kit.tsx
  var GLYPHS = {
    space: [
      1.5,
      1,
      1.5,
      8,
      16.5,
      8,
      16.5,
      1
    ],
    enter: [
      16,
      1,
      16,
      7,
      3,
      7,
      7,
      3.5,
      3,
      7,
      7,
      10
    ]
  };
  function Keycap({ k, color = C.cyan }) {
    const glyph = GLYPHS[k];
    if (glyph) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
        style: {
          width: 27,
          height: 27,
          border: 2,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", {
          viewBox: "0 0 18 10",
          style: {
            width: 16,
            height: 9
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", {
            points: glyph,
            fill: "none",
            stroke: color,
            strokeWidth: 2
          })
        })
      });
    }
    const word = k.length > 1;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
      style: {
        minWidth: 27,
        height: 27,
        padding: {
          horizontal: word ? 3 : 0
        },
        border: 2,
        borderColor: color,
        alignItems: "center",
        justifyContent: "center"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
        style: {
          fontSize: word ? 11 : 20,
          fontFamily: F.bold,
          color,
          lineBreak: "noWrap"
        },
        children: k
      })
    });
  }
  function Hint({ k, label, onClick, color = C.red }) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", {
      onClick,
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: C.clear
      },
      hoverStyle: {
        opacity: 0.8
      },
      children: [
        k === "mouse" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MouseIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Keycap, {
          k
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
          style: {
            fontSize: 25,
            color,
            lineBreak: "noWrap"
          },
          children: label
        })
      ]
    });
  }
  function Hints({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
      style: {
        positionType: "absolute",
        right: 52,
        bottom: 46,
        flexDirection: "row",
        alignItems: "center",
        gap: 30
      },
      children
    });
  }
  function CutButton({ label, onClick, width, height: height2 = 52, k, hot = false, disabled = false, style }) {
    const frame = hot ? C.cyan : "rgba(255, 93, 81, 0.45)";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", {
      onClick: disabled ? void 0 : onClick,
      style: {
        ...chamfer(C.button, 12, frame, 1),
        width,
        height: height2,
        padding: {
          horizontal: 24
        },
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        opacity: disabled ? 0.4 : 1,
        ...style
      },
      hoverStyle: disabled ? void 0 : chamfer("#1a1a2c", 12, C.cyan, 1),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
          style: {
            ...T.menu,
            fontSize: 25,
            color: C.cyan,
            letterSpacing: 0.6
          },
          children: label
        }),
        k && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Keycap, {
          k
        })
      ]
    });
  }
  function Header({ title: title2, caption, icon, step = 0, steps = 5, left = 606 }) {
    const segment = 138;
    const gap = 6;
    const width = steps * segment + (steps - 1) * gap;
    const rule = "rgba(255, 93, 81, 0.75)";
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 120
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            width: left - 8,
            top: 44,
            height: 2,
            backgroundGradient: {
              type: "linear",
              angle: 90,
              stops: [
                {
                  color: "rgba(255, 93, 81, 0.35)"
                },
                {
                  color: rule
                }
              ]
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: {
            positionType: "absolute",
            left: left + width + 8,
            right: 0,
            top: 44,
            height: 2,
            backgroundGradient: {
              type: "linear",
              angle: 90,
              stops: [
                {
                  color: rule
                },
                {
                  color: "rgba(255, 93, 81, 0.35)"
                }
              ]
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("node", {
          style: {
            positionType: "absolute",
            left,
            top: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8
          },
          children: [
            icon,
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 7,
                color: C.cyan,
                lineHeight: 1.1
              },
              children: "01100011\n01101000\n01100001\n01110010"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
              style: T.title,
              children: title2
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: {
            positionType: "absolute",
            left,
            top: 50,
            flexDirection: "row",
            gap
          },
          children: Array.from({
            length: steps
          }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
            style: {
              width: segment,
              height: i === step ? 3 : 2,
              backgroundColor: i === step ? C.cyan : "rgba(255, 93, 81, 0.45)"
            }
          }, i))
        }),
        caption && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
          style: {
            ...T.caption,
            positionType: "absolute",
            left,
            top: 64,
            width: 760
          },
          children: caption
        })
      ]
    });
  }
  var FILL = {
    positionType: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  // src/screens/Dialog.tsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
  var import_react2 = __toESM(require_react(), 1);
  var open = 0;
  var modalOpen = () => open > 0;
  function Confirm({ text, onConfirm, onCancel }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
      style: {
        ...FILL,
        backgroundColor: "rgba(1, 2, 5, 0.88)",
        alignItems: "center",
        justifyContent: "center",
        focusPolicy: "block"
      },
      hoverStyle: {},
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Plate, {
        text,
        icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(WarningIcon, {
          size: 64,
          color: C.red
        }),
        onConfirm,
        onCancel
      })
    });
  }
  var PLATE = "#491c24";
  var TAB = "rgba(150, 34, 30, 0.62)";
  function Plate({ text, icon, onConfirm, onCancel, style }) {
    (0, import_react2.useEffect)(() => {
      open++;
      return () => {
        open--;
      };
    }, []);
    const confirm = () => {
      sfx("confirm");
      onConfirm();
    };
    const cancel = () => {
      sfx("back");
      onCancel();
    };
    useKeys((e) => {
      if (e.key === "Enter") confirm();
      else if (e.key === "Escape") cancel();
    });
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
      style: {
        width: 693,
        flexDirection: "column",
        gap: 26,
        ...style
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            width: 680,
            height: 120,
            flexDirection: "row"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Tab, {}),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
              style: {
                ...chamfer(PLATE, 16, C.red, 1),
                flexGrow: 1,
                flexDirection: "row",
                gap: 26,
                padding: 13
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Inset, {
                  children: icon
                }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                  style: {
                    fontSize: 24,
                    fontFamily: F.semibold,
                    color: C.red,
                    lineHeight: 1.16,
                    flexShrink: 1,
                    margin: {
                      top: 2
                    }
                  },
                  children: text
                }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
                  style: {
                    positionType: "absolute",
                    right: -6,
                    top: 20,
                    bottom: 22,
                    width: 5,
                    border: {
                      top: 1,
                      right: 1,
                      bottom: 1
                    },
                    borderColor: C.red
                  }
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 6,
            alignSelf: "flexEnd"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PlateButton, {
              k: "enter",
              label: "CONFIRM",
              onClick: confirm
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PlateButton, {
              k: "ESC",
              label: "CANCEL",
              onClick: cancel
            })
          ]
        })
      ]
    });
  }
  function Tab() {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
      style: {
        width: 42,
        border: 1,
        borderColor: C.red,
        borderRadius: {
          left: 6
        },
        backgroundColor: TAB,
        margin: {
          right: 1
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
        style: {
          positionType: "absolute",
          left: 0,
          top: 58,
          width: 15,
          height: 1,
          backgroundColor: C.red
        }
      })
    });
  }
  function Inset({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
      style: {
        ...chamfer("#4e1d25", 12, "rgba(255, 93, 81, 0.28)", 1),
        width: 168,
        height: 94,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 1,
            top: 1,
            right: 1,
            bottom: 1,
            backgroundGradient: {
              type: "radial",
              stops: [
                {
                  color: "rgba(255, 70, 60, 0.3)"
                },
                {
                  color: "rgba(255, 70, 60, 0)",
                  position: "70%"
                }
              ]
            }
          }
        }),
        children
      ]
    });
  }
  function PlateButton({ k, label, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", {
      onClick,
      style: {
        ...chamfer("#441518", 12, "#328e8f", 1),
        width: 162,
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        padding: {
          horizontal: 8
        }
      },
      hoverStyle: chamfer("#5c1a1f", 12, C.cyan, 1),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Keycap, {
          k
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
          style: {
            fontSize: 24,
            fontFamily: F.semibold,
            color: C.red,
            lineBreak: "noWrap"
          },
          children: label
        })
      ]
    });
  }

  // src/screens/Credits.tsx
  var CREDITS = [
    {
      title: "A FRONT END BUILT WITH BEVY-REACT"
    },
    {
      space: 60
    },
    {
      title: "SET IN SABLE CITY, WHERE NOBODY LOGS OFF"
    },
    {
      role: "BEVY-REACT",
      names: [
        "MATEUSZ TOMCZYK"
      ]
    },
    {
      role: "GAME ENGINE: BEVY",
      names: [
        "CARTER ANDERSON",
        "AND THE BEVY CONTRIBUTORS"
      ]
    },
    {
      role: "UI LIBRARY: REACT",
      names: [
        "META OPEN SOURCE",
        "AND THE REACT CONTRIBUTORS"
      ]
    },
    {
      role: "JAVASCRIPT ENGINE: V8",
      names: [
        "THE V8 PROJECT AUTHORS"
      ]
    },
    {
      role: "EMBEDDING: DENO_CORE",
      names: [
        "THE DENO AUTHORS"
      ]
    },
    {
      role: "LAYOUT: TAFFY",
      names: [
        "DIOXUSLABS",
        "AND THE TAFFY CONTRIBUTORS"
      ]
    },
    {
      role: "TEXT SHAPING: COSMIC-TEXT",
      names: [
        "SYSTEM76"
      ]
    },
    {
      role: "GRAPHICS: WGPU",
      names: [
        "THE WGPU CONTRIBUTORS"
      ]
    },
    {
      role: "TYPEFACE: RAJDHANI\nSIL OPEN FONT LICENSE",
      names: [
        "INDIAN TYPE FOUNDRY"
      ]
    },
    {
      role: "MONOSPACE: JETBRAINS MONO\nSIL OPEN FONT LICENSE",
      names: [
        "JETBRAINS"
      ]
    },
    {
      space: 110
    },
    {
      title: "ON THE STREETS OF SABLE CITY"
    },
    {
      role: "FIXER, KESSLER DISTRICT",
      names: [
        "MAMA ODUYA"
      ]
    },
    {
      role: "RIPPERDOC, LANTERN ALLEY",
      names: [
        "DR. IVO KALNINS"
      ]
    },
    {
      role: "NETRUNNERS",
      names: [
        "SPARROW-9",
        "GHOSTWIRE",
        "LITTLE MERCY"
      ]
    },
    {
      role: "BLACK ICE CONSULTANT",
      names: [
        "NOBODY YOU HAVE MET"
      ]
    },
    {
      role: "NOMAD CONVOY LEAD,\nRED MESA PASS",
      names: [
        "JUNO VASQUEZ-HALE"
      ]
    },
    {
      role: "STREET MEDIC ON CALL",
      names: [
        "SAINT MAGS"
      ]
    },
    {
      role: "MEMORY REPLAY EDITOR",
      names: [
        "OKSANA RIVE"
      ]
    },
    {
      role: "RADIO, 91.4 STATIC FM",
      names: [
        "DJ LOW BATTERY"
      ]
    },
    {
      role: "CHROME FITTINGS",
      names: [
        "TWIN BLADES CLINIC"
      ]
    },
    {
      role: "CATERING",
      names: [
        "THE NOODLE CART ON 5TH AND DORSET"
      ]
    },
    {
      space: 110
    },
    {
      title: "TENKAI CORPORATION"
    },
    {
      role: "COUNTERINTELLIGENCE",
      names: [
        "[REDACTED]",
        "[REDACTED]"
      ]
    },
    {
      role: "LEGAL REVIEW OF\nTHESE CREDITS",
      names: [
        "TENKAI LEGAL, FLOOR 88"
      ]
    },
    {
      role: "SCPD INCIDENT REPORTS",
      names: [
        "SGT. DALE PRUITT (RET.)"
      ]
    },
    {
      space: 110
    },
    {
      title: "SPECIAL THANKS"
    },
    {
      role: "FOR EVERY LINE OF CODE\nUNDER THESE MENUS",
      names: [
        "THE OPEN-SOURCE CONTRIBUTORS"
      ]
    },
    {
      role: "FOR READING THIS FAR",
      names: [
        "YOU"
      ]
    },
    {
      space: 110
    },
    {
      title: "INSPIRED BY THE MENUS OF CYBERPUNK 2077 BY CD PROJEKT RED"
    },
    {
      space: 60
    },
    {
      title: "NO SAVE FILES WERE HARMED IN THE MAKING OF THESE MENUS"
    }
  ];
  var TITLE = 84;
  var ROW = 64;
  var LINE = 26;
  var height = (b) => "title" in b ? TITLE : "space" in b ? b.space : Math.max(b.names.length * ROW, ROW + (b.role.split("\n").length - 1) * LINE);
  var H = CREDITS.reduce((h, b) => h + height(b), 0);
  var SPLIT = 682;
  var NORMAL = 48;
  var FAST = 520;
  var START = 150;
  var ENTER = 1090;
  var role = {
    fontSize: 22,
    fontFamily: F.semibold,
    color: "#48c3bd",
    letterSpacing: 1,
    lineHeight: {
      px: LINE
    },
    textAlign: "right"
  };
  var name = {
    fontSize: 25,
    fontFamily: F.bold,
    color: "#b2f4f3",
    letterSpacing: 1,
    lineHeight: {
      px: ROW
    },
    lineBreak: "noWrap"
  };
  var title = {
    fontSize: 36,
    color: "#b2f4f3",
    letterSpacing: 1.6,
    lineHeight: {
      px: TITLE
    },
    textAlign: "center"
  };
  function Credits({ onClose }) {
    const y = (0, import_bevy_react3.useSharedValue)(START);
    const [fast, setFast] = (0, import_react3.useState)(false);
    const clock = (0, import_react3.useRef)({
      from: START,
      at: 0,
      speed: NORMAL
    });
    const run = (from, speed2) => {
      clock.current = {
        from,
        at: Date.now(),
        speed: speed2
      };
      const ms = (px) => px / speed2 * 1e3;
      y.value = (0, import_bevy_react3.withSequence)((0, import_bevy_react3.withTiming)(-H, {
        duration: ms(from + H)
      }), (0, import_bevy_react3.withTiming)(ENTER, {
        duration: 0
      }), (0, import_bevy_react3.withRepeat)((0, import_bevy_react3.withTiming)(-H, {
        duration: ms(ENTER + H)
      })));
    };
    const offset = () => {
      const { from, at: at3, speed: speed2 } = clock.current;
      const px = (Date.now() - at3) / 1e3 * speed2;
      return px <= from + H ? from - px : ENTER - (px - from - H) % (ENTER + H);
    };
    const speed = (on2) => {
      if (on2 === fast) return;
      setFast(on2);
      run(offset(), on2 ? FAST : NORMAL);
    };
    (0, import_react3.useEffect)(() => {
      run(START, NORMAL);
      return () => (0, import_bevy_react3.cancelAnimation)(y);
    }, []);
    const close = () => {
      sfx("back");
      onClose();
    };
    const forward = (key2) => key2 === "f" || key2 === "F" || key2 === "Enter";
    useKeys((e) => {
      if (modalOpen()) return;
      if (e.key === "Escape") close();
      else if (forward(e.key)) speed(true);
    });
    useEvent("keyUp", (e) => {
      if (forward(e.key)) speed(false);
    });
    useDebug("ff", (arg) => speed(arg !== "off"));
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
      style: {
        ...FILL,
        // A shade over the datascape's brightest streaks, not a panel.
        backgroundGradient: {
          type: "linear",
          angle: 90,
          stops: [
            {
              color: "rgba(2, 4, 8, 0.62)"
            },
            {
              color: "rgba(2, 4, 8, 0.5)",
              position: "50%"
            },
            {
              color: "rgba(2, 4, 8, 0)",
              position: "85%"
            }
          ]
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            top: 0,
            width: 2 * SPLIT,
            flexDirection: "column",
            transform: {
              translateY: {
                animated: y
              }
            }
          },
          children: CREDITS.map((b, i) => "title" in b ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
            style: title,
            children: b.title
          }, i) : "space" in b ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
            style: {
              height: b.space
            }
          }, i) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
            style: {
              height: height(b),
              flexDirection: "row",
              gap: 2 * (SPLIT - 672)
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
                style: {
                  ...role,
                  width: 672,
                  margin: {
                    top: (ROW - LINE) / 2
                  }
                },
                children: b.role
              }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
                style: name,
                children: b.names.join("\n")
              })
            ]
          }, i))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
          style: {
            positionType: "absolute",
            right: 76,
            bottom: 60,
            flexDirection: "column",
            alignItems: "flexEnd",
            gap: 20
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", {
              onClick: () => speed(!fast),
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 8
              },
              hoverStyle: {
                opacity: 0.8
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Keycap, {
                  k: "F",
                  color: C.red
                }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Keycap, {
                  k: "enter",
                  color: C.red
                }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
                  style: {
                    fontSize: 25,
                    color: fast ? C.cyan : C.red,
                    lineBreak: "noWrap"
                  },
                  children: "Fast-Forward Credits"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", {
              onClick: close,
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 8
              },
              hoverStyle: {
                opacity: 0.8
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Keycap, {
                  k: "ESC",
                  color: C.red
                }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
                  style: {
                    fontSize: 25,
                    color: C.red,
                    lineBreak: "noWrap"
                  },
                  children: "CLOSE"
                })
              ]
            })
          ]
        })
      ]
    });
  }

  // src/screens/InGame.tsx
  var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
  var import_react4 = __toESM(require_react(), 1);
  var import_bevy_react4 = __toESM(require_bevy_react(), 1);

  // src/store.ts
  var LIFEPATHS = [
    {
      id: "nomad",
      name: "Nomad"
    },
    {
      id: "streetkid",
      name: "Streetkid"
    },
    {
      id: "corpo",
      name: "Corpo"
    }
  ];
  var DIFFICULTIES = [
    {
      id: "easy",
      name: "EASY"
    },
    {
      id: "normal",
      name: "NORMAL"
    },
    {
      id: "hard",
      name: "HARD"
    },
    {
      id: "veryhard",
      name: "VERY HARD"
    }
  ];
  var NEW_CHARACTER = {
    handle: "NYX",
    difficulty: "normal",
    lifepath: "streetkid",
    body: 0,
    voice: 0,
    look: {},
    attributes: {
      body: 3,
      intelligence: 3,
      reflexes: 3,
      tech: 3,
      cool: 3
    }
  };
  var PROLOGUE = {
    nomad: {
      quest: "Dust Run",
      location: "Badlands: Red Mesa Pass"
    },
    streetkid: {
      quest: "Gutter Saints",
      location: "Kessler: Lantern Alley"
    },
    corpo: {
      quest: "Glass Ceiling",
      location: "Tenkai Tower: Lobby 3"
    }
  };
  var SEED_SAVES = [
    {
      id: 3,
      quest: "Gutter Saints",
      name: "QuickSave",
      location: "Kessler: Night Market",
      level: 14,
      playtime: 1312,
      date: "10/06/91, 11:42 PM",
      character: {
        ...NEW_CHARACTER,
        lifepath: "streetkid"
      }
    },
    {
      id: 2,
      quest: "Glass Ceiling",
      name: "ManualSave-2",
      location: "Tenkai Tower: Counterintel",
      level: 6,
      playtime: 384,
      date: "10/04/91, 9:12 AM",
      character: {
        ...NEW_CHARACTER,
        handle: "VEGA",
        lifepath: "corpo",
        body: 1
      }
    },
    {
      id: 1,
      quest: "Dust Run",
      name: "AutoSave-1",
      location: "Badlands: Red Mesa Pass",
      level: 2,
      playtime: 41,
      date: "09/29/91, 6:03 PM",
      character: {
        ...NEW_CHARACTER,
        handle: "RUST",
        lifepath: "nomad"
      }
    }
  ];
  function playtime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  }

  // src/screens/InGame.tsx
  function World({ paused }) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("portal", {
      target: "world",
      style: {
        ...FILL,
        cache: "never",
        filter: {
          name: "blur",
          params: {
            radius: paused ? 14 : 0
          }
        },
        transition: {
          filter: {
            duration: 300
          }
        }
      }
    });
  }
  var arriving = true;
  var announceArrival = () => {
    arriving = true;
  };
  function GameHud({ onPause, game }) {
    const [announce] = (0, import_react4.useState)(arriving);
    (0, import_react4.useEffect)(() => {
      arriving = false;
    }, []);
    const where = game ?? PROLOGUE.streetkid;
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
      style: FILL,
      children: [
        announce && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Toast, {
          location: where.location,
          quest: where.quest
        }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Hints, {
          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Hint, {
            k: "ESC",
            label: "Pause",
            onClick: () => {
              sfx("back");
              onPause();
            }
          })
        })
      ]
    });
  }
  function Toast({ location: location2, quest }) {
    const t = (0, import_bevy_react4.useSharedValue)(0);
    (0, import_react4.useEffect)(() => {
      t.value = (0, import_bevy_react4.withDelay)(600, (0, import_bevy_react4.withSequence)((0, import_bevy_react4.withTiming)(1, {
        duration: 360,
        easing: "easeOut"
      }), (0, import_bevy_react4.withDelay)(4200, (0, import_bevy_react4.withTiming)(0, {
        duration: 420,
        easing: "easeIn"
      }))));
    }, [
      t
    ]);
    const [district, place = ""] = location2.split(": ");
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 64,
        top: 150,
        flexDirection: "column",
        gap: 8,
        opacity: {
          animated: t
        },
        transform: {
          translateX: {
            animated: (0, import_bevy_react4.interpolate)(t, [
              0,
              1
            ], [
              -60,
              0
            ])
          }
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
          style: {
            ...chamfer("rgba(10, 8, 14, 0.72)", 16, "rgba(255, 93, 81, 0.6)", 1),
            width: 460,
            flexDirection: "row",
            gap: 16,
            padding: {
              left: 0,
              right: 20,
              vertical: 12
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
              style: {
                width: 4,
                backgroundColor: C.cyan
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
              style: {
                flexDirection: "column",
                gap: 2
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
                  style: {
                    ...T.micro,
                    fontSize: 10,
                    color: C.cyanDim
                  },
                  children: "ENTERING DISTRICT"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
                  style: {
                    fontSize: 40,
                    fontFamily: F.bold,
                    color: C.cyan,
                    letterSpacing: 1.5,
                    lineBreak: "noWrap"
                  },
                  children: district.toUpperCase()
                }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
                  style: {
                    ...T.label,
                    fontSize: 22,
                    letterSpacing: 1
                  },
                  children: place.toUpperCase()
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
              style: {
                width: 8,
                height: 8,
                backgroundColor: C.yellow
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
              style: {
                ...T.label,
                fontSize: 20,
                color: C.yellow,
                letterSpacing: 1
              },
              children: `JOB  \xB7  ${quest.toUpperCase()}`
            })
          ]
        })
      ]
    });
  }

  // src/screens/Loading.tsx
  var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
  var import_react6 = __toESM(require_react(), 1);
  var import_bevy_react5 = __toESM(require_bevy_react(), 1);

  // src/ui/decor.tsx
  var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
  function rng(seed) {
    let s = seed * 2654435761 + 1;
    return () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  }
  var HEX = "0123456789ABCDEF";
  function noiseLines(seed, lines, groups) {
    const r = rng(seed);
    return Array.from({
      length: lines
    }, () => Array.from({
      length: groups
    }, () => Array.from({
      length: 4 + Math.floor(r() * 5)
    }, () => HEX[Math.floor(r() * 16)]).join("")).join(" "));
  }
  function DataNoise({ seed, lines = 4, groups = 4, color = C.redDim, style }) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
      style: {
        ...T.micro,
        color,
        ...style
      },
      children: noiseLines(seed, lines, groups).join("\n")
    });
  }
  function ProtocolStamp({ style }) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 50,
        top: 42,
        flexDirection: "column",
        gap: 4,
        ...style
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 10,
            alignItems: "center"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
              style: {
                flexDirection: "column",
                gap: 2
              },
              children: [
                38,
                26,
                34,
                20
              ].map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
                style: {
                  width: w,
                  height: 3,
                  backgroundColor: C.redDim
                }
              }, i))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 9,
                color: C.redDim
              },
              children: "ONLY SCPD CLASS-4 TECHS\nMAY ACCESS, OPERATE OR\nDISABLE THIS DEVICE."
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            fontFamily: F.bold,
            fontSize: 12,
            color: C.redDim,
            letterSpacing: 1
          },
          children: "PROTOCOL\n7741-B09"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: {
            width: 150,
            height: 11,
            backgroundColor: C.redDeep,
            justifyContent: "center",
            padding: {
              left: 18
            }
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
            style: {
              ...T.micro,
              fontSize: 8,
              color: "#ffb3ad"
            },
            children: "SBL 044 CKC 151 CC10 A55"
          })
        })
      ]
    });
  }
  function Rule({ width, label, color = C.redDim, style }) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 3,
        width,
        ...style
      },
      children: [
        label && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            ...T.micro,
            fontSize: 8,
            color
          },
          children: label
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: {
            height: 1,
            backgroundColor: color
          }
        })
      ]
    });
  }
  function EdgeRails() {
    const rail = (side3) => ({
      positionType: "absolute",
      [side3]: 18,
      top: 0,
      bottom: 0,
      width: 3,
      border: {
        left: 1
      },
      borderColor: "rgba(255, 93, 81, 0.18)"
    });
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: rail("left")
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: rail("right")
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            ...T.micro,
            positionType: "absolute",
            left: -96,
            top: 520,
            width: 240,
            color: "rgba(199, 46, 43, 0.7)",
            transform: {
              rotate: -90
            }
          },
          children: "DB 1244.635132 1244.635132 CP"
        })
      ]
    });
  }
  function LegalFooter() {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 50,
        bottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", {
          viewBox: "0 0 60 40",
          style: {
            width: 66,
            height: 44
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("polygon", {
              points: [
                2,
                38,
                16,
                8,
                26,
                26,
                32,
                14,
                40,
                28,
                46,
                6,
                58,
                38
              ],
              fill: "none",
              stroke: C.redDim,
              strokeWidth: 2.4,
              strokeLinejoin: "miter"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("polyline", {
              points: [
                10,
                38,
                18,
                22,
                24,
                38
              ],
              fill: "none",
              stroke: C.redDim,
              strokeWidth: 1.6
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            fontSize: 15,
            fontFamily: F.semibold,
            color: C.redDim,
            lineHeight: 1.15
          },
          children: "Sable City\nResident\nDatabase"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            width: 520,
            fontSize: 10.5,
            color: C.redDim,
            lineHeight: 1.25
          },
          children: "The data you enter on a CRD terminal will only be used for the purpose you entered it. Your personal data is protected under the 2088 Privacy Act and the Sable City Charter, except where it is not. In accordance with Gridwatch Memo 4410-B, terminals may retain biometric samples for the duration of your session and the rest of your life."
        })
      ]
    });
  }

  // src/ui/Wordmark.tsx
  var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);

  // src/screens/settings/store.ts
  var import_react5 = __toESM(require_react(), 1);

  // src/screens/settings/data.ts
  var section = (label) => ({
    kind: "section",
    label
  });
  var select = (id, label, options, def = 0) => ({
    kind: "select",
    id,
    label,
    options,
    def
  });
  var toggle = (id, label, def = false) => ({
    kind: "toggle",
    id,
    label,
    def
  });
  var slider = (id, label, min, max, def, step = 1) => ({
    kind: "slider",
    id,
    label,
    min,
    max,
    step,
    def
  });
  var key = (id, label, def) => ({
    kind: "key",
    id,
    label,
    def
  });
  var RESOLUTIONS = [
    "1280x720",
    "1366x768",
    "1600x900",
    "1920x1080",
    "2560x1440",
    "3200x1800",
    "3840x2160"
  ];
  var LANGUAGES = [
    "English",
    "Deutsch",
    "Espa\xF1ol",
    "Fran\xE7ais",
    "Italiano",
    "Polski",
    "Portugu\xEAs",
    "\u010Ce\u0161tina",
    "Magyar",
    "T\xFCrk\xE7e"
  ];
  var PRESET_NAMES = [
    "Low",
    "Medium",
    "High",
    "Ultra",
    "Custom"
  ];
  var CUSTOM = PRESET_NAMES.length - 1;
  var PRESETS = [
    {
      textures: 0,
      aberration: false,
      focus: false,
      flare: false,
      blur: 0
    },
    {
      textures: 1,
      aberration: true,
      focus: false,
      flare: true,
      blur: 0
    },
    {
      textures: 2,
      aberration: true,
      focus: true,
      flare: true,
      blur: 0
    },
    {
      textures: 2,
      aberration: true,
      focus: true,
      flare: true,
      blur: 2
    }
  ];
  var GAMMA = slider("gamma", "Gamma", 0.5, 2, 1, 0.05);
  var TABS = [
    {
      id: "sound",
      label: "SOUND",
      rows: [
        section("Dynamic Range"),
        select("dynamicRange", "Presets", [
          "Reference",
          "Hi-Fi Stereo",
          "Home Theater",
          "Late Night",
          "Headphones",
          "Compressed"
        ]),
        section("Volume"),
        // Live: master, sfx and music.
        slider("master", "Master Volume", 0, 100, 100),
        slider("sfx", "SFX Volume", 0, 100, 100),
        slider("dialogue", "Dialogue Volume", 0, 100, 100),
        slider("music", "Music Volume", 0, 100, 100),
        slider("radio", "Vehicle Radio Volume", 0, 100, 100),
        section("Misc"),
        toggle("alertPings", "Mute Alert Pings"),
        toggle("streamSafe", "Stream-Safe Music"),
        section("Subtitles"),
        toggle("subsCinematic", "Cinematic", true),
        toggle("subsOverhead", "Overhead", true)
      ]
    },
    {
      id: "controls",
      label: "CONTROLS",
      rows: [
        slider("vibration", "Controller Vibration", 0, 100, 100),
        slider("innerDeadZone", "Inner Dead Zone", 0, 0.5, 0.05, 0.01),
        slider("outerDeadZone", "Outer Dead Zone", 0.5, 1, 0.9, 0.01),
        section("First-Person Camera (Mouse)"),
        slider("zoomSensitivity", "Zoom Sensitivity", 0, 2, 1, 0.1),
        slider("fpVertical", "Vertical Sensitivity", 1, 30, 5),
        slider("fpHorizontal", "Horizontal Sensitivity", 1, 30, 5),
        toggle("fpInvertY", "Invert Vertical Axis"),
        toggle("fpInvertX", "Invert Horizontal Axis"),
        section("Third-Person Camera (Mouse)"),
        slider("tpVertical", "Vertical Sensitivity", 1, 30, 3),
        slider("tpHorizontal", "Horizontal Sensitivity", 1, 30, 3),
        toggle("tpInvertY", "Invert Vertical Axis")
      ]
    },
    {
      id: "gameplay",
      label: "GAMEPLAY",
      rows: [
        section("Accessibility"),
        select("aimAssist", "Aim Assist", [
          "Off",
          "Light",
          "Standard",
          "Strong"
        ], 2),
        toggle("snapToTarget", "Snap to Target", true),
        select("meleeAssist", "Aim Assist - Melee", [
          "Off",
          "Light",
          "Standard"
        ], 2),
        select("cameraSway", "Camera Sway", [
          "Off",
          "Reduced",
          "Full"
        ], 2),
        section("Performance"),
        select("crowdDensity", "Crowd Density", [
          "Low",
          "Medium",
          "High"
        ], 2),
        toggle("slowStorage", "Slow Storage Mode"),
        section("Miscellaneous"),
        toggle("tutorials", "Tutorials", true),
        select("skipDialogue", "Skipping Dialogue", [
          "Off",
          "Skip By Line",
          "Skip All"
        ], 1)
      ]
    },
    {
      id: "graphics",
      label: "GRAPHICS",
      rows: [
        // Live: everything from Field of View to Motion Blur (Film Grain in
        // the UI itself), and the preset that sets them.
        select("preset", "Quick Preset", PRESET_NAMES, 2),
        select("textures", "Texture Quality", [
          "Low",
          "Medium",
          "High"
        ], 2),
        section("Basic"),
        slider("fov", "Field of View", 50, 100, 60),
        toggle("filmGrain", "Film Grain", true),
        toggle("aberration", "Chromatic Aberration", true),
        toggle("focus", "Depth of Field", true),
        toggle("flare", "Lens Flare", true),
        select("blur", "Motion Blur", [
          "Off",
          "Low",
          "High"
        ]),
        section("Advanced"),
        toggle("contactShadows", "Contact Shadows"),
        select("anisotropy", "Anisotropy", [
          "1",
          "2",
          "4",
          "8",
          "16"
        ], 2)
      ]
    },
    {
      id: "video",
      label: "VIDEO",
      rows: [
        // Live: VSync, Windowed Mode, Resolution.
        section("Display"),
        select("monitor", "Monitor", [
          "0",
          "1"
        ]),
        toggle("vsync", "VSync", true),
        toggle("fpsCap", "Maximum FPS"),
        select("mode", "Windowed Mode", [
          "Windowed",
          "Borderless",
          "Fullscreen"
        ]),
        // The window main.rs opens.
        select("resolution", "Resolution", RESOLUTIONS, 2),
        {
          kind: "info",
          label: "HDR Mode",
          value: "None"
        }
      ]
    },
    {
      id: "language",
      label: "LANGUAGE",
      rows: [
        select("voiceLanguage", "Audio", LANGUAGES),
        select("subtitleLanguage", "Subtitles", LANGUAGES),
        select("textLanguage", "Interface", LANGUAGES)
      ]
    },
    {
      id: "interface",
      label: "INTERFACE",
      rows: [
        // Live: the App reads both.
        toggle("uiGlitch", "UI Glitch Effects", true),
        toggle("scanlines", "Scanlines", true),
        select("colorblind", "Colorblind Modes", [
          "Off",
          "Protanopia",
          "Deuteranopia",
          "Tritanopia"
        ]),
        select("damageNumbers", "Damage Numbers", [
          "Off",
          "Critical Only",
          "Both"
        ], 2),
        toggle("hitMarker", "Hit Marker", true),
        section("HUD Visibility"),
        toggle("hudMinimap", "Minimap", true),
        toggle("hudHealth", "Health Bar", true),
        toggle("hudAmmo", "Ammo Counter", true),
        toggle("hudQuest", "Quest Tracker", true),
        toggle("hudHints", "Hints", true)
      ]
    },
    {
      id: "keys",
      label: "KEY BINDINGS",
      rows: [
        section("Memory Replay"),
        key("key.replayPause", "Pause Replay (Toggle)", "Space"),
        key("key.replayForward", "Fast-Forward Replay", "KeyE"),
        key("key.replayRewind", "Rewind Replay", "KeyQ"),
        key("key.replayLayer", "Switch Replay Layer", "ShiftLeft"),
        key("key.replayExit", "Exit Replay", "KeyX"),
        section("General"),
        key("key.zoomIn", "Zoom In", "MouseWheelUp"),
        key("key.zoomOut", "Zoom Out", "MouseWheelDown"),
        key("key.tag", "Tag", "MouseMiddle"),
        section("Exploration and Combat"),
        key("key.forward", "Move Forward", "KeyW"),
        key("key.back", "Move Backward", "KeyS"),
        key("key.left", "Move Left", "KeyA"),
        key("key.right", "Move Right", "KeyD"),
        key("key.crouch", "Crouch", "KeyC"),
        key("key.interact", "Interact", "KeyF")
      ]
    }
  ];
  function defaults(rows) {
    const out = {};
    for (const row of rows) if ("id" in row) out[row.id] = row.def;
    return out;
  }
  var DEFAULTS = defaults([
    ...TABS.flatMap((t) => t.rows),
    GAMMA
  ]);

  // src/screens/settings/store.ts
  var g = globalThis;
  var store = g.__cyberpunkSettings ??= {
    values: {},
    listeners: /* @__PURE__ */ new Set()
  };
  store.values = {
    ...DEFAULTS,
    ...store.values
  };
  function subscribe(listener) {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  }
  function useSettings() {
    return (0, import_react5.useSyncExternalStore)(subscribe, () => store.values);
  }
  function setSettings(values) {
    store.values = {
      ...store.values,
      ...values
    };
    store.listeners.forEach((l) => l());
  }
  function setSetting(id, value) {
    setSettings({
      [id]: value
    });
  }
  function useLiveSettings() {
    const v = useSettings();
    const n = (id) => Number(v[id]);
    usePush({
      master: n("master") / 100,
      sfx: n("sfx") / 100,
      music: n("music") / 100
    }, bevy.sound.volume);
    usePush({
      fov: n("fov"),
      aberration: v.aberration === true,
      focus: v.focus === true,
      flare: v.flare === true,
      blur: n("blur")
    }, bevy.settings.graphics);
    usePush({
      value: n("gamma")
    }, bevy.settings.gamma);
    const [width, height2] = (RESOLUTIONS[n("resolution")] ?? "0x0").split("x").map(Number);
    usePush({
      mode: n("mode"),
      width,
      height: height2,
      vsync: v.vsync === true
    }, bevy.settings.video, false);
  }
  function usePush(value, push, onMount = true) {
    const key2 = JSON.stringify(value);
    const sent = (0, import_react5.useRef)(onMount ? "" : key2);
    (0, import_react5.useEffect)(() => {
      if (sent.current === key2) return;
      sent.current = key2;
      push(JSON.parse(key2));
    }, [
      key2,
      push
    ]);
  }

  // src/ui/wordmark-path.ts
  var WORDMARK_VIEWBOX = "-18 -24 668 170";
  var WORDMARK_ASPECT = 668 / 170;
  var WORDMARK_PATH = "M50.3 -2.5 L92.3 -2.5 L88.4 9.5 L50.4 9.5 L26.1 85.5 L64.1 85.5 L60.3 97.5 L18.3 97.5 L10.1 85.5 L34.4 9.5Z M101.9 -4.5 L117.9 -4.5 L123.3 25.5 L147.9 -4.5 L163.9 -4.5 L126.2 41.5 L108.9 95.5 L92.9 95.5 L110.2 41.5Z M171.9 -1.5 L217.9 -1.5 L224.7 8.5 L215.8 36.5 L207.2 44.5 L212.7 52.5 L201.1 88.5 L187.9 98.5 L139.9 98.5Z M175.1 38.5 L197.1 38.5 L202.4 34.5 L209.5 12.5 L208.1 10.5 L184.1 10.5Z M159.8 86.5 L183.8 86.5 L188.4 84.5 L197.4 56.5 L196.0 54.5 L170.0 54.5Z M254.9 94.0 L253.3 99.0 L242.4 99.0Z M239.6 -3.5 L291.6 -3.5 L287.7 8.5 L251.7 8.5 L241.5 40.5 L269.5 40.5 L265.7 52.5 L237.7 52.5 L227.4 84.5 L263.4 84.5 L262.0 88.9 L242.9 96.5 L207.6 96.5Z M323.5 66.5 L321.4 102.0 L305.4 102.0 L307.4 73.0 L283.6 82.5 L277.4 102.0 L261.4 102.0 L265.2 89.9Z M299.6 -0.5 L345.6 -0.5 L352.4 9.5 L340.9 45.5 L330.3 53.5 L329.8 61.7 L313.8 68.1 L314.7 55.5 L297.7 55.5 L290.7 77.4 L272.3 84.7Z M301.5 43.5 L323.5 43.5 L328.8 39.5 L337.1 13.5 L335.8 11.5 L311.8 11.5Z M408.6 32.4 L404.3 46.0 L391.1 56.0 L361.1 56.0 L347.6 98.0 L331.6 98.0 L344.4 58.2Z M369.9 -4.5 L415.9 -4.5 L422.7 5.5 L415.7 27.3 L351.5 53.0Z M379.7 44.0 L386.9 44.0 L391.6 42.0 L392.6 38.9Z M371.2 41.5 L380.2 41.5 L399.7 33.7 L407.4 9.5 L406.1 7.5 L382.1 7.5Z M437.3 20.9 L415.5 89.0 L441.5 89.0 L467.1 9.0 L485.5 1.6 L456.9 91.0 L443.7 101.0 L405.7 101.0 L398.9 91.0 L418.9 28.3Z M433.9 -1.5 L449.9 -1.5 L444.4 15.8 L474.2 3.9 L475.9 -1.5 L487.6 -1.5 L426.0 23.1Z M495.3 -1.0 L511.3 -1.0 L519.5 61.0 L539.3 -1.0 L555.3 -1.0 L523.3 99.0 L507.3 99.0 L499.2 37.0 L479.3 99.0 L463.3 99.0Z M563.4 2.0 L579.4 2.0 L566.6 42.0 L605.4 2.0 L623.4 2.0 L578.6 48.0 L593.4 102.0 L575.4 102.0 L564.2 62.0 L558.2 68.0 L547.4 102.0 L531.4 102.0Z M39.9 9.3 L-13.5 15.5 L-13.5 15.5 L40.8 -2.3Z M109.5 93.1 L76.2 141.5 L76.2 141.5 L94.8 89.9Z M610.9 -0.3 L646.4 -20.0 L646.4 -20.0 L616.5 8.3Z M591.1 93.7 L631.8 138.0 L631.8 138.0 L578.9 106.3Z M206.3 113.5 L607.4 108.0 L607.4 108.0 L198.6 116.6Z M151.6 111.8 L206.6 111.0 L198.8 114.2 L150.6 115.2Z M322.9 122.1 L534.2 118.0 L534.2 118.0 L322.4 123.9Z";

  // src/ui/Wordmark.tsx
  function Wordmark({ width, glitch: chance = 0.1, style }) {
    const glitch = useSettings().uiGlitch ? chance : 0;
    const height2 = width / WORDMARK_ASPECT;
    const digit = width * 0.052;
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("node", {
      style: {
        width,
        height: height2 + digit * 0.6,
        filter: glitch > 0 ? {
          name: "glitch",
          params: {
            intensity: 0.9,
            frequency: glitch,
            seed: 7
          }
        } : void 0,
        ...style
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("svg", {
          viewBox: WORDMARK_VIEWBOX,
          style: {
            width,
            height: height2
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("path", {
            d: WORDMARK_PATH,
            fill: C.yellow
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Year, {
          size: digit,
          style: {
            positionType: "absolute",
            left: width * 0.47,
            top: height2 * 0.78
          }
        })
      ]
    });
  }
  function Year({ size, style }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("node", {
      style: {
        flexDirection: "row",
        alignItems: "flexEnd",
        gap: size * 0.35,
        ...style
      },
      children: [
        "2",
        "0",
        "9",
        "1"
      ].map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("node", {
        style: {
          flexDirection: "row",
          alignItems: "flexEnd",
          gap: size * 0.35
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("text", {
            style: {
              fontFamily: F.semibold,
              fontSize: size,
              color: C.cyanDim,
              lineBreak: "noWrap"
            },
            children: d
          }),
          i < 3 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("node", {
            style: {
              width: size * 1.1,
              height: 1.5,
              margin: {
                bottom: size * 0.22
              },
              backgroundColor: C.cyanDim
            }
          })
        ]
      }, d + i))
    });
  }

  // src/screens/saves/icons.tsx
  var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
  var L = 92;
  var W = 34;
  var T2 = 7;
  var at = (u, v, z = 0) => [
    8 + 0.866 * (u * L + v * W),
    31 + 0.5 * (u * L - v * W) + z
  ];
  var patch = (u0, u1, v0, v1) => [
    ...at(u0, v0),
    ...at(u1, v0),
    ...at(u1, v1),
    ...at(u0, v1)
  ];
  var side = (u0, v0, u1, v1) => [
    ...at(u0, v0),
    ...at(u1, v1),
    ...at(u1, v1, T2),
    ...at(u0, v0, T2)
  ];
  var INK = "#4a0f12";
  function Datashard({ width = 118 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", {
      viewBox: "0 0 126 90",
      style: {
        width,
        height: width * 90 / 126
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: side(0, 0, 1, 0),
          fill: "#a8302b"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: side(1, 0, 1, 1),
          fill: "#d3463c"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0, 1, 0, 1),
          fill: "#ff6457"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0.03, 0.12, 0.12, 0.42),
          fill: INK
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0.05, 0.1, 0.55, 0.88),
          fill: INK,
          opacity: 0.7
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0.36, 0.96, 0.1, 0.36),
          fill: INK
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0.17, 0.66, 0.8, 0.85),
          fill: INK,
          opacity: 0.8
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0.17, 0.52, 0.68, 0.72),
          fill: INK,
          opacity: 0.6
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0.17, 0.3, 0.48, 0.58),
          fill: INK,
          opacity: 0.55
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
          points: patch(0.88, 0.9, 0, 1),
          fill: "#b8362f"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polyline", {
          points: [
            ...at(0, 1),
            ...at(1, 1),
            ...at(1, 0)
          ],
          fill: "none",
          stroke: "#ff9a8f",
          strokeWidth: 0.8
        })
      ]
    });
  }
  function LifepathIcon({ lifepath, size = 20 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", {
      viewBox: "0 0 20 20",
      style: {
        width: size,
        height: size
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", {
          cx: 10,
          cy: 10,
          r: 9.5,
          fill: C.red
        }),
        lifepath === "nomad" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polygon", {
              points: [
                8.6,
                4.5,
                11.4,
                4.5,
                16,
                15.5,
                4,
                15.5
              ],
              fill: INK
            }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polyline", {
              points: [
                10,
                6.5,
                10,
                8.5
              ],
              stroke: C.red,
              strokeWidth: 1.2,
              fill: "none"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polyline", {
              points: [
                10,
                10.5,
                10,
                13.5
              ],
              stroke: C.red,
              strokeWidth: 1.4,
              fill: "none"
            })
          ]
        }),
        lifepath === "streetkid" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polyline", {
          points: [
            4.5,
            13,
            8,
            6,
            10,
            11,
            12.5,
            5.5,
            15.5,
            12.5
          ],
          stroke: INK,
          strokeWidth: 2.2,
          strokeLinejoin: "miter",
          fill: "none"
        }),
        lifepath === "corpo" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", {
              cx: 10,
              cy: 10,
              r: 5.6,
              stroke: INK,
              strokeWidth: 1.5,
              fill: "none"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("ellipse", {
              cx: 10,
              cy: 10,
              rx: 2.3,
              ry: 5.6,
              stroke: INK,
              strokeWidth: 1.2,
              fill: "none"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("polyline", {
              points: [
                4.4,
                10,
                15.6,
                10
              ],
              stroke: INK,
              strokeWidth: 1.2,
              fill: "none"
            })
          ]
        })
      ]
    });
  }

  // src/screens/Loading.tsx
  var DURATION = 2400;
  var SEGMENTS = 24;
  var TIPS = {
    nomad: "Out in the Badlands the clan is your armor. In Sable City, keep your car close and your exits closer.",
    streetkid: "Kessler runs on favors. Owe the wrong fixer and the whole block knows by sundown.",
    corpo: "At Tenkai every elevator has ears. Speak like the board is listening, because it is."
  };
  function Loading({ lifepath, onDone }) {
    const progress = (0, import_bevy_react5.useSharedValue)(0);
    const done = (0, import_react6.useRef)(onDone);
    done.current = onDone;
    (0, import_react6.useEffect)(() => {
      sfx("boot");
      announceArrival();
      progress.value = (0, import_bevy_react5.withTiming)(1, {
        duration: DURATION - 200,
        easing: "easeIn"
      });
      const t = setTimeout(() => done.current(), DURATION);
      return () => clearTimeout(t);
    }, [
      progress
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Wordmark, {
          width: 1240,
          glitch: 0.3,
          style: {
            positionType: "absolute",
            left: 300,
            top: 300,
            transform3d: {
              perspective: 1500,
              rotateX: 24,
              rotateY: -18,
              rotateZ: -7
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 826,
            flexDirection: "column",
            alignItems: "center",
            gap: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
              style: {
                width: 186,
                flexDirection: "column",
                gap: 3
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
                  style: {
                    ...T.micro,
                    color: C.redDim
                  },
                  children: "MODEL LINE       1.2001A"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
                  style: {
                    height: 46,
                    border: 2,
                    borderColor: C.red,
                    backgroundColor: "rgba(20, 6, 10, 0.6)",
                    alignItems: "center",
                    justifyContent: "center"
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
                    style: {
                      fontSize: 30,
                      fontFamily: F.semibold,
                      color: C.cyan,
                      letterSpacing: 1,
                      lineBreak: "noWrap",
                      cache: "never",
                      filter: {
                        name: "glitch",
                        params: {
                          intensity: 0.5,
                          frequency: 0.6,
                          tear: 10
                        }
                      }
                    },
                    children: "BREACHING..."
                  })
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
              style: {
                flexDirection: "row",
                gap: 2
              },
              children: Array.from({
                length: SEGMENTS
              }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
                style: {
                  width: 8,
                  height: 4,
                  backgroundColor: C.cyan,
                  opacity: {
                    animated: (0, import_bevy_react5.interpolate)(progress, [
                      i / SEGMENTS,
                      (i + 1) / SEGMENTS
                    ], [
                      0.12,
                      1
                    ])
                  }
                }
              }, i))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
              style: {
                width: 640,
                border: 1,
                borderColor: C.redDim,
                backgroundColor: "rgba(20, 6, 10, 0.5)",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: {
                  horizontal: 12,
                  vertical: 7
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(LifepathIcon, {
                  lifepath,
                  size: 22
                }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
                  style: {
                    fontSize: 17,
                    color: C.red,
                    lineHeight: 1.2,
                    flexShrink: 1
                  },
                  children: TIPS[lifepath]
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
              style: {
                ...T.micro,
                color: C.redDim
              },
              children: "\u2588 SC_DB_943503.4308839456"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Rule, {
              width: 1100,
              color: C.redDim
            })
          ]
        })
      ]
    });
  }

  // src/screens/MainMenu.tsx
  var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
  var import_react7 = __toESM(require_react(), 1);
  var import_bevy_react6 = __toESM(require_bevy_react(), 1);
  function MainMenu({ entries, onPick, onBack, version }) {
    const [selected, setSelected] = (0, import_react7.useState)(0);
    const select2 = (i) => {
      if (i === selected) return;
      sfx("hover");
      setSelected(i);
    };
    useKeys((e) => {
      if (modalOpen()) return;
      if (e.key === "ArrowDown") select2((selected + 1) % entries.length);
      else if (e.key === "ArrowUp") select2((selected + entries.length - 1) % entries.length);
      else if (e.key === "Enter") onPick(entries[selected].id);
      else if (e.key === "Escape" && onBack) {
        sfx("back");
        onBack();
      }
    }, true);
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Band, {}),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(DataNoise, {
          seed: 11,
          lines: 3,
          groups: 3,
          style: {
            positionType: "absolute",
            left: 152,
            top: 44
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 156,
            top: 72,
            width: 112,
            height: 22,
            border: 1,
            borderColor: C.redDim,
            justifyContent: "center",
            padding: {
              left: 6
            }
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
            style: {
              ...T.micro,
              color: C.redDim
            },
            children: "4D0B95 7210 00"
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Wordmark, {
          width: 520,
          style: {
            positionType: "absolute",
            left: 96,
            top: 238
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 178,
            top: 438,
            flexDirection: "column",
            gap: 4
          },
          children: entries.map((entry, i) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(MenuItem, {
            label: entry.label,
            selected: i === selected,
            onSelect: () => select2(i),
            onClick: () => onPick(entry.id)
          }, entry.id))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Rule, {
          width: 440,
          label: "DRN_TCLAS_800095",
          color: C.redDim,
          style: {
            positionType: "absolute",
            left: 150,
            top: 870
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
          style: {
            positionType: "absolute",
            left: 152,
            top: 896,
            fontSize: 24,
            color: C.redDim
          },
          children: version
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(DataNoise, {
          seed: 5,
          lines: 3,
          groups: 5,
          style: {
            positionType: "absolute",
            left: 150,
            top: 996
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(TopRight, {}),
        !onBack && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Messages, {}),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Hint, {
              k: "mouse",
              label: "Select"
            }),
            onBack && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Hint, {
              k: "ESC",
              label: "Close",
              onClick: onBack
            })
          ]
        })
      ]
    });
  }
  function Band() {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("node", {
      style: {
        positionType: "absolute",
        left: 134,
        top: 0,
        bottom: 0,
        width: 466,
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            {
              color: "rgba(84, 24, 32, 0.4)"
            },
            {
              color: "rgba(64, 18, 26, 0.32)",
              position: "55%"
            },
            {
              color: "rgba(70, 20, 28, 0.4)"
            }
          ]
        },
        backgroundImage: SCANLINES,
        border: {
          left: 1,
          right: 2
        },
        borderColor: "rgba(255, 93, 81, 0.22)"
      }
    });
  }
  function MenuItem({ label, selected, onSelect, onClick }) {
    const glitches = !!useSettings().uiGlitch;
    const burst = (0, import_bevy_react6.useSharedValue)(0);
    (0, import_react7.useEffect)(() => {
      if (selected) burst.value = (0, import_bevy_react6.withSequence)((0, import_bevy_react6.withTiming)(1, {
        duration: 0
      }), (0, import_bevy_react6.withTiming)(0, {
        duration: 340,
        easing: "easeOut"
      }));
    }, [
      selected,
      burst
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("button", {
      onClick,
      onPointerEnter: onSelect,
      style: {
        width: 356,
        height: 52,
        padding: {
          left: 14,
          right: 12
        },
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        ...selected ? chamfer("rgba(6, 8, 16, 0.5)", 20, C.cyanHi, 2) : {
          border: 2,
          borderColor: C.clear
        },
        filter: selected && glitches ? {
          name: "glitch",
          params: {
            intensity: {
              animated: burst,
              seed: 1
            },
            split: 3,
            tear: 12,
            seed: 3
          }
        } : void 0
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
          style: {
            ...T.menu,
            color: selected ? C.cyan : C.red
          },
          children: label
        }),
        selected && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ProtocolGlyph, {})
      ]
    });
  }
  function TopRight() {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
          style: {
            ...T.micro,
            positionType: "absolute",
            left: 1066,
            top: 52
          },
          children: "SABLE CITY CORP RECORD DATABASE  //  0044729-0340  0001AF09  //  6B73\nT^7234-0091  0020434982  //  0034-2304-T042B57  #925"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 1440,
            top: 36,
            width: 400,
            height: 34,
            border: 1,
            borderColor: C.redDim,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: {
              horizontal: 10
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(WarningIcon, {
              size: 14,
              color: C.redDim
            }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 8,
                color: C.redDim
              },
              children: "Tampering with this terminal is a felony under Sable City Code 44.2.\nAll sessions are logged and may be reviewed by Gridwatch."
            })
          ]
        })
      ]
    });
  }
  function Messages() {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
      style: {
        positionType: "absolute",
        right: 80,
        bottom: 118,
        width: 516,
        height: 44,
        ...chamfer("rgba(20, 8, 12, 0.6)", 10, C.redDim, 1),
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: {
          horizontal: 8
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Keycap, {
          k: "3"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
          style: {
            fontSize: 24,
            color: C.red
          },
          children: "Messages"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("node", {
          style: {
            flexGrow: 1
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
          style: {
            ...T.micro,
            fontSize: 8
          },
          children: "SYSTEM INPUT 12"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("node", {
          style: {
            flexDirection: "row",
            gap: 3
          },
          children: [
            0,
            1,
            2
          ].map((i) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("node", {
            style: {
              width: 5,
              height: 18,
              backgroundColor: C.red
            }
          }, i))
        })
      ]
    });
  }

  // src/screens/newgame/NewGame.tsx
  var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
  var import_react15 = __toESM(require_react(), 1);

  // src/screens/newgame/Appearance.tsx
  var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
  var import_react9 = __toESM(require_react(), 1);

  // src/screens/newgame/data.ts
  var DIFFICULTY_TEXT = {
    easy: "For those here for the story. Enemies go down quickly, hit softly, and the streets forgive most bad decisions. Sit back and take in the sights.",
    normal: "The intended experience. Firefights take some thought, and decent gear and well-chosen cyberware will keep you breathing on most nights.",
    hard: "Enemies are deadlier and they think before they shoot. Staying alive will depend on how well you use your perks, implants, gadgets and stims.",
    veryhard: "No mercy. Any firefight could be your last: plan every move, read every room and spend every resource as if nothing comes after it."
  };
  var LIFEPATH_TEXT = {
    nomad: "Raised on the open road past the Sable City walls, you learned to fix a dead engine, read a dust storm and trust nobody outside the clan. The city sees an outsider. You see a cage with neon on the bars.",
    streetkid: "Kessler's alleys raised you. You know which fixer pays, which gang owns which corner and which cop looks away for a price. Out here a favor is currency and a name is armor, and you have spent your life earning both.",
    corpo: "Twelve years in Tenkai's glass tower taught you that truth is a resource and loyalty has a price tag. You have buried rivals in audits and sold secrets between floors, smiling the whole way. Up there, nobody has friends. Only leverage."
  };
  var SKIN_TONES = [
    "#f3d7c0",
    "#ebc5a6",
    "#dfb08b",
    "#d09c76",
    "#c08664",
    "#ad7553",
    "#986244",
    "#825138",
    "#6c412d",
    "#573324",
    "#43281d",
    "#8fa7a2"
  ];
  var HAIR_COLORS = [
    "#1b1716",
    "#3b2619",
    "#6b4226",
    "#8a3b1e",
    "#b5562a",
    "#d9b56c",
    "#e8e2d0",
    "#8c8c8c",
    "#ff4fa3",
    "#3fe0ff",
    "#7cff4f",
    "#8f5bff"
  ];
  var EYE_COLORS = [
    "#6fb7ff",
    "#8a6038",
    "#5aa05a",
    "#a5adb5",
    "#e8b847",
    "#ff5050",
    "#5ef6ff",
    "#c77dff"
  ];
  var VOICE = {
    label: "VOICE TONE",
    names: [
      "MASCULINE",
      "FEMININE"
    ]
  };
  var LOOK_OPTIONS = [
    {
      id: "skinTone",
      label: "SKIN TONE",
      count: SKIN_TONES.length,
      swatches: SKIN_TONES
    },
    {
      id: "skinType",
      label: "SKIN TYPE",
      count: 8
    },
    {
      id: "hairstyle",
      label: "HAIRSTYLE",
      count: 12
    },
    {
      id: "hairColor",
      label: "HAIR COLOR",
      count: HAIR_COLORS.length,
      swatches: HAIR_COLORS
    },
    {
      id: "eyes",
      label: "EYES",
      count: EYE_COLORS.length
    },
    {
      id: "eyebrows",
      label: "EYEBROWS",
      count: 6
    },
    {
      id: "nose",
      label: "NOSE",
      count: 6
    },
    {
      id: "mouth",
      label: "MOUTH",
      count: 6
    },
    {
      id: "jaw",
      label: "JAW",
      count: 6
    },
    {
      id: "ears",
      label: "EARS",
      count: 4
    },
    {
      id: "cyberware",
      label: "CYBERWARE",
      count: 8
    },
    {
      id: "scars",
      label: "SCARS",
      count: 6
    },
    {
      id: "tattoos",
      label: "TATTOOS",
      count: 8
    },
    {
      id: "piercings",
      label: "PIERCINGS",
      count: 6
    },
    {
      id: "makeup",
      label: "MAKEUP",
      count: 6
    },
    {
      id: "nails",
      label: "NAILS",
      count: 5
    }
  ];
  function look(c, id) {
    return c.look[id] ?? 0;
  }
  var PRESETS2 = [
    {
      skinTone: 8,
      skinType: 2,
      hairstyle: 1,
      hairColor: 4,
      eyes: 1,
      eyebrows: 2,
      jaw: 2,
      cyberware: 0,
      scars: 1,
      tattoos: 0,
      piercings: 1,
      makeup: 0
    },
    {
      skinTone: 4,
      skinType: 1,
      hairstyle: 7,
      hairColor: 0,
      eyes: 0,
      eyebrows: 4,
      jaw: 4,
      cyberware: 1,
      scars: 0,
      tattoos: 5,
      piercings: 0,
      makeup: 0
    },
    {
      skinTone: 1,
      skinType: 0,
      hairstyle: 4,
      hairColor: 9,
      eyes: 6,
      eyebrows: 1,
      jaw: 1,
      cyberware: 3,
      scars: 0,
      tattoos: 2,
      piercings: 3,
      makeup: 2
    },
    {
      skinTone: 10,
      skinType: 4,
      hairstyle: 2,
      hairColor: 8,
      eyes: 5,
      eyebrows: 5,
      jaw: 3,
      cyberware: 7,
      scars: 4,
      tattoos: 7,
      piercings: 5,
      makeup: 3
    }
  ];
  var ATTR_MIN = 3;
  var ATTR_MAX = 6;
  var ATTR_POINTS = 7;
  var ATTRIBUTES = [
    {
      id: "body",
      name: "Body",
      short: "BOD",
      text: "Body is raw strength and the punishment you can take. Every level in Body will:",
      effects: [
        "Raise your maximum Health by 5",
        "Raise melee and unarmed damage by 2%",
        "Shorten the time you stay stunned"
      ]
    },
    {
      id: "intelligence",
      name: "Intelligence",
      short: "INT",
      text: "Intelligence is how fast your mind moves through the Net. Every level in Intelligence will:",
      effects: [
        "Add 1 unit of cyberdeck RAM",
        "Raise quickhack damage by 2%",
        "Cut breach protocol time by 0.5 sec"
      ]
    },
    {
      id: "reflexes",
      name: "Reflexes",
      short: "REF",
      text: "Reflexes decide how quickly you move and react. On top of your movement speed, every level in Reflexes will:",
      effects: [
        "Raise your chance to evade attacks by 1%",
        "Raise critical hit chance by 1%",
        "Raise damage from blade implants by 3%"
      ]
    },
    {
      id: "tech",
      name: "Technical Ability",
      short: "TEC",
      text: "Technical Ability is your feel for machines, weapons and implants. Every level in Technical Ability will:",
      effects: [
        "Raise your armor by 4%",
        "Unlock better crafting specs",
        "Raise damage from gadgets by 3%"
      ]
    },
    {
      id: "cool",
      name: "Cool",
      short: "COL",
      text: "Cool is how steady you stay when everything goes loud. Every level in Cool will:",
      effects: [
        "Raise critical damage by 2%",
        "Make you 0.5% harder to detect",
        "Raise resistance to fear and panic by 1%"
      ]
    }
  ];
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function residentId(handle) {
    const d = hash(handle).toString().padStart(10, "0");
    const tag = handle.replace(/[^A-Z0-9]/g, "").slice(0, 2) || "XX";
    return `SC91-${d.slice(0, 4)}-${d.slice(4, 8)}-${tag}`;
  }
  function two(i) {
    return (i + 1).toString().padStart(2, "0");
  }
  function handleOf(c) {
    return c.handle.trim() || "NYX";
  }

  // src/screens/newgame/IdCard.tsx
  var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
  var import_react8 = __toESM(require_react(), 1);
  var import_bevy_react7 = __toESM(require_bevy_react(), 1);

  // src/screens/newgame/glyphs.tsx
  var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
  function WheelIcon({ color = C.cyan }) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", {
      viewBox: "0 0 22 24",
      style: {
        width: 24,
        height: 26
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", {
          d: "M8 1.5 C4 1.5 1.8 4 1.8 8 L1.8 16 C1.8 20 4.4 22.5 8 22.5 C11.6 22.5 14.2 20 14.2 16 L14.2 8 C14.2 4 12 1.5 8 1.5 Z",
          fill: "none",
          stroke: color,
          strokeWidth: 1.6
        }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
          x: 6.6,
          y: 4.5,
          width: 2.8,
          height: 5.5,
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
          points: [
            18,
            1,
            21,
            5,
            15,
            5
          ],
          fill: color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
          points: [
            18,
            11,
            21,
            7,
            15,
            7
          ],
          fill: color
        })
      ]
    });
  }
  function StepIcon({ kind }) {
    const s = {
      fill: "none",
      stroke: C.cyan,
      strokeWidth: 2
    };
    const thin = {
      fill: "none",
      stroke: C.cyan,
      strokeWidth: 1.4
    };
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", {
      viewBox: "0 0 36 36",
      style: {
        width: 36,
        height: 36
      },
      children: [
        kind === "difficulty" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                2,
                5,
                34,
                5,
                18,
                33
              ],
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                11,
                13,
                25,
                13,
                18,
                25
              ],
              ...thin
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 10,
              y: 7.5,
              width: 16,
              height: 2,
              fill: C.cyan
            })
          ]
        }),
        kind === "lifepath" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                18,
                1,
                33,
                9.5,
                33,
                26.5,
                18,
                35,
                3,
                26.5,
                3,
                9.5
              ],
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polyline", {
              points: [
                18,
                27,
                18,
                19,
                11,
                12
              ],
              ...thin
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("line", {
              x1: 18,
              y1: 19,
              x2: 25,
              y2: 12,
              ...thin
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 18,
              cy: 27,
              r: 2.4,
              fill: C.cyan
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 11,
              cy: 11.5,
              r: 2.4,
              fill: C.cyan
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 25,
              cy: 11.5,
              r: 2.4,
              fill: C.cyan
            })
          ]
        }),
        kind === "body" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 2,
              y: 2,
              width: 32,
              height: 32,
              rx: 3,
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 18,
              cy: 9,
              r: 3,
              fill: C.cyan
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polyline", {
              points: [
                11,
                18,
                14,
                14,
                22,
                14,
                25,
                18
              ],
              ...thin
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polyline", {
              points: [
                15,
                14,
                15,
                22,
                13,
                30
              ],
              ...thin
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polyline", {
              points: [
                21,
                14,
                21,
                22,
                23,
                30
              ],
              ...thin
            })
          ]
        }),
        kind === "appearance" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 2,
              y: 2,
              width: 32,
              height: 32,
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", {
              d: "M18 7 C12 7 10 11 10 16 C10 22 13 28 18 29 C23 28 26 22 26 16 C26 11 24 7 18 7 Z",
              ...thin
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("line", {
              x1: 6,
              y1: 15,
              x2: 30,
              y2: 15,
              stroke: C.cyan,
              strokeWidth: 1
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("line", {
              x1: 6,
              y1: 21,
              x2: 30,
              y2: 21,
              stroke: C.cyan,
              strokeWidth: 1
            })
          ]
        }),
        kind === "attributes" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                18,
                2,
                34,
                13.6,
                27.9,
                32.4,
                8.1,
                32.4,
                2,
                13.6
              ],
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                18,
                9,
                26,
                15,
                23,
                26,
                12,
                25,
                11,
                15
              ],
              fill: C.cyan,
              opacity: 0.55
            })
          ]
        }),
        kind === "summary" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                18,
                1,
                35,
                18,
                18,
                35,
                1,
                18
              ],
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 18,
              cy: 18,
              r: 8,
              ...thin
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polyline", {
              points: [
                14,
                18,
                17,
                21,
                23,
                14
              ],
              ...s
            })
          ]
        })
      ]
    });
  }
  function AttributeIcon({ id, color = C.red }) {
    const s = {
      fill: "none",
      stroke: color,
      strokeWidth: 2
    };
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", {
      viewBox: "0 0 40 42",
      style: {
        width: 40,
        height: 42
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
          points: [
            20,
            2,
            37,
            11.5,
            37,
            30.5,
            20,
            40,
            3,
            30.5,
            3,
            11.5
          ],
          ...s
        }),
        id === "body" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 11,
              y: 19.5,
              width: 18,
              height: 3,
              fill: color
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 9,
              y: 14,
              width: 4,
              height: 14,
              fill: color
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 27,
              y: 14,
              width: 4,
              height: 14,
              fill: color
            })
          ]
        }),
        id === "intelligence" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 13,
              y: 14,
              width: 14,
              height: 14,
              ...s,
              strokeWidth: 1.6
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
              x: 17.5,
              y: 18.5,
              width: 5,
              height: 5,
              fill: color
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", {
              d: "M16 11V14M20 11V14M24 11V14M16 28V31M20 28V31M24 28V31M10 17H13M10 21H13M10 25H13M27 17H30M27 21H30M27 25H30",
              ...s,
              strokeWidth: 1.2
            })
          ]
        }),
        id === "reflexes" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
          points: [
            22,
            9,
            13,
            23,
            19,
            23,
            17,
            33,
            27,
            18,
            21,
            18
          ],
          fill: color
        }),
        id === "tech" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                17,
                10,
                23,
                10,
                24,
                14,
                28,
                12,
                31,
                17,
                27,
                20,
                31,
                25,
                28,
                30,
                24,
                28,
                23,
                32,
                17,
                32,
                16,
                28,
                12,
                30,
                9,
                25,
                13,
                21,
                9,
                17,
                12,
                12,
                16,
                14
              ],
              ...s,
              strokeWidth: 1.4
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 20,
              cy: 21,
              r: 4,
              fill: color
            })
          ]
        }),
        id === "cool" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 20,
              cy: 21,
              r: 8,
              ...s,
              strokeWidth: 1.6
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", {
              d: "M20 9V16M20 26V33M8 21H15M25 21H32",
              ...s,
              strokeWidth: 1.6
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 20,
              cy: 21,
              r: 1.8,
              fill: color
            })
          ]
        })
      ]
    });
  }
  function LifepathIcon2({ id, color = C.cyan }) {
    const s = {
      fill: "none",
      stroke: color,
      strokeWidth: 1.6
    };
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", {
      viewBox: "0 0 24 24",
      style: {
        width: 22,
        height: 22
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
          x: 1,
          y: 1,
          width: 22,
          height: 22,
          ...s,
          strokeWidth: 1
        }),
        id === "nomad" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polyline", {
              points: [
                3,
                19,
                9,
                10,
                13,
                15,
                16,
                11,
                21,
                19
              ],
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", {
              cx: 16,
              cy: 6,
              r: 2.2,
              fill: color
            })
          ]
        }),
        id === "streetkid" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", {
          d: "M3 21V12H7V8H11V14H14V5H18V11H21V21",
          ...s
        }),
        id === "corpo" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("polygon", {
              points: [
                9,
                21,
                10,
                7,
                12,
                3,
                14,
                7,
                15,
                21
              ],
              ...s
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("line", {
              x1: 4,
              y1: 21,
              x2: 20,
              y2: 21,
              ...s
            })
          ]
        })
      ]
    });
  }
  function GridIcon() {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("svg", {
      viewBox: "0 0 26 20",
      style: {
        width: 26,
        height: 20
      },
      children: [
        0,
        1
      ].flatMap((r) => [
        0,
        1,
        2
      ].map((c) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("rect", {
        x: 1 + c * 9,
        y: 1 + r * 10,
        width: 6,
        height: 8,
        rx: 1,
        fill: "none",
        stroke: C.cyan,
        strokeWidth: 1.4
      }, `${r}${c}`)))
    });
  }

  // src/screens/newgame/parts.tsx
  var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
  var HOT = "#ff5f56";
  var BG = "#0a0d13";
  function Chrome() {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ProtocolStamp, {}),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(LegalFooter, {}),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 815,
            bottom: 22,
            flexDirection: "row",
            alignItems: "center",
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 10
              },
              children: "SBL 044 CKC 151 CC10 A55"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", {
              viewBox: "0 0 30 8",
              style: {
                width: 30,
                height: 8
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("polygon", {
                points: [
                  0,
                  4,
                  9,
                  0,
                  9,
                  3,
                  30,
                  3,
                  30,
                  5,
                  9,
                  5,
                  9,
                  8
                ],
                fill: C.red
              })
            })
          ]
        })
      ]
    });
  }
  function cornerMask(cut, line2, color = BG) {
    const d = cut / Math.SQRT2;
    const clear = C.clear;
    return {
      backgroundGradient: {
        type: "linear",
        angle: 315,
        stops: line2 ? [
          {
            color,
            position: d - 0.3
          },
          {
            color: line2,
            position: d + 0.3
          },
          {
            color: line2,
            position: d + 2.6
          },
          {
            color: clear,
            position: d + 3.2
          }
        ] : [
          {
            color,
            position: d
          },
          {
            color: clear,
            position: d + 0.6
          }
        ]
      }
    };
  }
  var abs = (s) => ({
    positionType: "absolute",
    ...s
  });
  function HotFrame({ bar = 22, cut = 22, step = 96 }) {
    const inner = Math.max(0, cut - bar - 4);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, {
      children: [
        inner > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: abs({
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            ...cornerMask(inner)
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
          style: {
            ...abs({
              left: -8,
              top: -4,
              right: -bar,
              bottom: -4
            }),
            filter: {
              name: "shadow",
              params: {
                color: "rgba(255, 60, 52, 0.75)",
                offsetX: 0,
                offsetY: 0,
                spread: 14
              }
            }
          },
          children: [
            inner > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
              style: abs({
                left: 8,
                top: 4,
                right: bar,
                bottom: 4,
                ...cornerMask(inner, HOT, C.clear)
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
              style: abs({
                left: 5,
                right: bar,
                top: 0,
                height: 4,
                backgroundColor: HOT
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
              style: abs({
                left: 5,
                top: 0,
                width: 3,
                height: step,
                backgroundColor: HOT
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
              style: abs({
                left: 0,
                top: step,
                width: 8,
                bottom: 0,
                ...chamfer(HOT, 8, void 0, 1, "bl")
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
              style: abs({
                left: 8,
                right: bar + inner,
                bottom: 0,
                height: 4,
                ...inner > 0 ? chamfer(HOT, 4, void 0, 1, "br") : {
                  backgroundColor: HOT
                }
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
              style: abs({
                right: 0,
                top: 0,
                bottom: 0,
                width: bar,
                ...chamfer(HOT, cut, void 0, 1, "br")
              })
            })
          ]
        })
      ]
    });
  }
  function ColdFrame({ cut = 30, tick = 186, line: line2 = "#a3332b" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: abs({
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            ...cornerMask(cut)
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: abs({
            left: -1,
            top: -1,
            right: -1,
            bottom: -1,
            ...chamfer(C.clear, cut + 1, line2, 1)
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: abs({
            left: tick,
            bottom: 0,
            width: 6,
            height: 54,
            border: 1,
            borderColor: line2
          })
        })
      ]
    });
  }
  function Barcode({ seed, width, height: height2, color = C.red }) {
    const r = rng(seed);
    let d = "";
    for (let x = 0; x < width - 1; ) {
      const w = 1 + Math.floor(r() * 3);
      if (r() > 0.35) d += `M${x} 0h${w}v${height2}h${-w}Z`;
      x += w + 1;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", {
      viewBox: `0 0 ${width} ${height2}`,
      style: {
        width,
        height: height2
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", {
        d,
        fill: color
      })
    });
  }
  function LevelBadge({ label }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
      style: {
        height: 24,
        border: 2,
        borderColor: C.red,
        padding: {
          horizontal: 6
        },
        justifyContent: "center",
        backgroundColor: "#2a0d10"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
        style: {
          fontSize: 15,
          fontFamily: F.semibold,
          color: C.red,
          lineBreak: "noWrap"
        },
        children: label
      })
    });
  }
  function NavButtons({ onBack, onNext, next = "NEXT" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
      style: {
        positionType: "absolute",
        right: 165,
        top: 906,
        flexDirection: "row",
        alignItems: "center",
        gap: 6
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(NavButton, {
          k: "ESC",
          label: "BACK",
          corner: "bl",
          onClick: onBack
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: abs({
            left: 214,
            top: 28,
            width: 46,
            height: 3,
            border: 1,
            borderColor: "rgba(255, 93, 81, 0.45)"
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(NavButton, {
          k: "F",
          label: next,
          corner: "br",
          onClick: onNext
        })
      ]
    });
  }
  function NavButton({ k, label, corner, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", {
      onClick,
      style: {
        ...chamfer("#2a0b0e", 18, "rgba(255, 93, 81, 0.5)", 1, corner),
        width: 240,
        height: 58,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10
      },
      hoverStyle: chamfer("#4a141a", 18, C.red, 1, corner),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Keycap, {
          k
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
          style: {
            ...T.menu,
            fontSize: 26
          },
          children: label
        })
      ]
    });
  }
  function IconHint({ icon, label }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
      },
      children: [
        icon,
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
          style: {
            fontSize: 25,
            color: C.red,
            lineBreak: "noWrap"
          },
          children: label
        })
      ]
    });
  }

  // src/screens/newgame/Portrait.tsx
  var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);

  // src/screens/newgame/Marks.tsx
  var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
  var CX = 100;
  var at2 = (a, s = 1) => a.map((v, i) => i % 2 ? v : CX + s * v);
  var SCAR = "#f0a39a";
  var METAL = "#d8dee4";
  function Marks({ v, head, ink, noseY, ear, mouth: [mouthW, smile] }) {
    const line2 = (color, w = 1.2) => ({
      fill: "none",
      stroke: color,
      strokeWidth: w
    });
    const makeup = v("makeup");
    const tattoo = v("tattoos");
    const scars = v("scars");
    const cyber = v("cyberware");
    const metal = v("piercings");
    const lips = makeup === 1 ? "#3a0d18" : makeup === 2 || makeup === 5 ? "#ff3d8b" : null;
    const chrome = (n) => cyber === n || cyber === 7;
    const pierced = (n) => metal === n || metal === 5;
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, {
      children: [
        lips && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polygon", {
          points: at2([
            -mouthW,
            134 - smile,
            0,
            131.5,
            mouthW,
            134 - smile,
            mouthW * 0.6,
            138.5,
            -mouthW * 0.6,
            138.5
          ]),
          fill: lips
        }),
        (makeup === 3 || makeup === 5) && [
          1,
          -1
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            26,
            96,
            32,
            92
          ], s),
          ...line2("#120608", 1.4)
        }, s)),
        makeup === 4 && [
          1,
          -1
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            14,
            106,
            28,
            106
          ], s),
          ...line2(C.cyan, 1.6)
        }, s)),
        tattoo === 1 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polygon", {
          points: at2([
            -14,
            166,
            -11,
            174,
            -18,
            169,
            -10,
            169,
            -17,
            174
          ]),
          fill: ink
        }),
        tattoo === 2 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            24,
            104,
            32,
            110,
            26,
            116,
            34,
            122,
            28,
            128
          ]),
          ...line2(ink, 1.4)
        }),
        tattoo === 3 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polygon", {
          points: at2([
            0,
            62,
            5,
            71,
            -5,
            71
          ]),
          ...line2(ink)
        }),
        tattoo === 4 && [
          0,
          1,
          2
        ].map((i) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: CX - 13 - i * 4,
          cy: 104,
          r: 1,
          fill: ink
        }, i)),
        tattoo === 5 && [
          0,
          1,
          2,
          3,
          4
        ].map((i) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            6 + i * 2.2,
            164,
            6 + i * 2.2,
            178
          ]),
          ...line2(ink, i % 2 ? 0.7 : 1.3)
        }, i)),
        tattoo === 6 && [
          -3,
          3
        ].map((x) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            x,
            143,
            x,
            153
          ]),
          ...line2(ink)
        }, x)),
        tattoo === 7 && [
          1,
          -1
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            36,
            66,
            42,
            74,
            38,
            84
          ], s),
          ...line2(ink, 1.3)
        }, s)),
        (scars === 1 || scars === 5) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            9,
            80,
            25,
            99
          ]),
          ...line2(SCAR)
        }),
        scars === 2 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            -36,
            106,
            -28,
            114,
            -22,
            124
          ]),
          ...line2(SCAR)
        }),
        scars === 3 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            4,
            127,
            8,
            141
          ]),
          ...line2(SCAR)
        }),
        scars === 4 && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
              points: at2([
                -16,
                64,
                -6,
                74
              ]),
              ...line2(SCAR)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
              points: at2([
                -6,
                64,
                -16,
                74
              ]),
              ...line2(SCAR)
            })
          ]
        }),
        chrome(1) && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
              points: at2([
                30,
                64,
                36,
                78,
                30,
                92,
                30,
                100
              ]),
              ...line2(C.cyan)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
              cx: CX + 30,
              cy: 102,
              r: 1.8,
              fill: C.cyan
            })
          ]
        }),
        chrome(2) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: head.filter(([, y]) => y > 106).flatMap(([x, y]) => [
            CX - x * 0.86,
            y - 3
          ]),
          ...line2(C.cyan, 1.1)
        }),
        chrome(3) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: CX + 17.5,
          cy: 96,
          r: 9,
          ...line2(C.cyan)
        }),
        cyber === 4 && [
          -12,
          -2,
          8
        ].map((x) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("rect", {
          x: CX + x,
          y: 63,
          width: 5,
          height: 3,
          fill: C.cyan
        }, x)),
        cyber === 5 && [
          0,
          5,
          10
        ].map((d) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
          points: at2([
            -38 + d,
            104,
            -30 + d,
            118
          ]),
          ...line2(C.cyan, 1)
        }, d)),
        chrome(6) && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
              cx: CX - 9,
              cy: 172,
              r: 2.6,
              ...line2(C.cyan, 1)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
              cx: CX + 9,
              cy: 172,
              r: 2.6,
              ...line2(C.cyan, 1)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("polyline", {
              points: at2([
                -6,
                172,
                6,
                172
              ]),
              ...line2(C.cyan, 1)
            })
          ]
        }),
        pierced(1) && [
          1,
          -1
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: CX + s * (46 + 6 * ear),
          cy: 106,
          r: 1.6,
          fill: METAL
        }, s)),
        pierced(2) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: CX + 25,
          cy: 86,
          r: 2.4,
          ...line2(METAL, 0.9)
        }),
        pierced(3) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: CX + 4,
          cy: noseY + 3,
          r: 2.4,
          ...line2(METAL, 0.9)
        }),
        pierced(4) && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: CX + 6,
          cy: 140,
          r: 2.4,
          ...line2(METAL, 0.9)
        })
      ]
    });
  }

  // src/screens/newgame/Portrait.tsx
  function mix(a, b, t) {
    const p = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
    const c = [
      0,
      1,
      2
    ].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t));
    return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }
  var pts = (a) => Array.from({
    length: a.length / 2
  }, (_, i) => [
    a[2 * i],
    a[2 * i + 1]
  ]);
  var flat = (p, s = 1) => at2(p.flat(), s);
  var HEAD = pts([
    0,
    38,
    16,
    39,
    29,
    44,
    38,
    52,
    43,
    62,
    45,
    74,
    45,
    88,
    44,
    100,
    42,
    110,
    38,
    122,
    33,
    132,
    26,
    142,
    18,
    150,
    9,
    155,
    0,
    157
  ]);
  var SHOULDERS = [
    pts([
      20,
      140,
      22,
      184,
      46,
      195,
      78,
      203,
      94,
      216,
      99,
      250
    ]),
    pts([
      17,
      140,
      19,
      188,
      38,
      197,
      64,
      204,
      80,
      216,
      86,
      250
    ])
  ];
  var JAW = [
    1,
    0.9,
    1.1,
    0.84,
    1.16,
    0.96
  ];
  var CHIN = [
    0,
    3,
    -2,
    5,
    -1,
    1
  ];
  var BROWS = [
    0,
    2,
    0,
    2,
    1.5,
    1,
    -2,
    2.6,
    0,
    1,
    3,
    2,
    3,
    1.2,
    -1,
    0,
    1.8,
    3
  ];
  var NOSES = [
    118,
    5,
    116,
    4,
    121,
    6,
    119,
    7,
    115,
    5,
    122,
    4
  ];
  var MOUTHS = [
    11,
    0,
    9,
    1,
    13,
    0,
    10,
    -1,
    14,
    1,
    12,
    2
  ];
  var EARS = [
    1,
    0.75,
    1.3,
    1
  ];
  function mirror(half) {
    return [
      ...flat(half),
      ...flat(half.slice(1, -1).reverse(), -1)
    ];
  }
  function chord(half, y) {
    for (let i = 1; i < half.length; i++) {
      const [x0, y0] = half[i - 1];
      const [x1, y1] = half[i];
      if (y <= y1) return y1 === y0 ? x1 : x0 + (x1 - x0) * (y - y0) / (y1 - y0);
    }
    return half[half.length - 1][0];
  }
  function crown(head, thick, hairline) {
    const out = head.filter(([, y]) => y <= hairline).map(([x, y]) => {
      const dy = y - 96;
      const l = Math.hypot(x, dy) || 1;
      return [
        x + x / l * thick,
        y + dy / l * thick
      ];
    });
    const edge = chord(head, hairline);
    const brow = Array.from({
      length: 9
    }, (_, i) => {
      const x = edge * (1 - i / 4);
      return [
        x,
        hairline - 7 * (1 - (x / edge) ** 2)
      ];
    });
    return flat([
      ...out.slice(1).reverse().map(([x, y]) => [
        -x,
        y
      ]),
      ...out,
      ...brow
    ]);
  }
  var circle = (cx, cy, r) => Array.from({
    length: 20
  }, (_, i) => [
    CX + cx + r * Math.cos(i / 20 * Math.PI * 2),
    cy + r * Math.sin(i / 20 * Math.PI * 2)
  ]).flat();
  var both = (a) => [
    at2(a),
    at2(a, -1)
  ];
  function hair(style, head) {
    switch (style) {
      case 0:
        return {
          back: [],
          front: [
            crown(head, 2, 66)
          ]
        };
      case 1:
        return {
          back: [],
          front: [
            crown(head, 3, 60),
            at2([
              -34,
              54,
              -24,
              32,
              6,
              24,
              38,
              32,
              54,
              52,
              40,
              48,
              16,
              40,
              -12,
              44
            ])
          ]
        };
      case 2:
        return {
          back: [],
          front: [
            crown(head, 1, 70),
            at2([
              -7,
              64,
              -10,
              30,
              -4,
              6,
              0,
              2,
              4,
              6,
              10,
              30,
              7,
              64
            ])
          ]
        };
      case 3:
        return {
          back: both([
            40,
            60,
            54,
            100,
            58,
            150,
            62,
            206,
            46,
            210,
            44,
            150,
            42,
            104
          ]),
          front: [
            crown(head, 6, 60)
          ]
        };
      case 4:
        return {
          back: [],
          front: [
            crown(head, 7, 58),
            ...both([
              42,
              58,
              52,
              92,
              53,
              140,
              38,
              146,
              41,
              110,
              43,
              80
            ])
          ]
        };
      case 5:
        return {
          back: [
            circle(0, 26, 15)
          ],
          front: [
            crown(head, 4, 60)
          ]
        };
      case 6:
        return {
          back: [],
          front: [
            at2([
              ...Array.from({
                length: 15
              }, (_, i) => {
                const a = Math.PI * (1.08 + 0.84 * i / 14);
                const r = i % 2 ? 66 : 50;
                return [
                  r * Math.cos(a),
                  96 + r * Math.sin(a)
                ];
              }).flat(),
              38,
              66,
              0,
              58,
              -38,
              66
            ])
          ]
        };
      case 7:
        return {
          back: [
            at2([
              30,
              46,
              56,
              58,
              60,
              92,
              50,
              100,
              46,
              70
            ])
          ],
          front: [
            crown(head, 8, 56)
          ]
        };
      case 8:
        return {
          back: [],
          front: []
        };
      case 9:
        return {
          back: both([
            42,
            70,
            50,
            120,
            52,
            214,
            44,
            216,
            42,
            122,
            38,
            76
          ]),
          front: [
            crown(head, 4, 58)
          ]
        };
      case 10:
        return {
          back: [
            circle(0, 74, 64)
          ],
          front: [
            crown(head, 10, 64)
          ]
        };
      default:
        return {
          back: [],
          front: [
            crown(head, 6, 58),
            at2([
              -46,
              58,
              -30,
              46,
              0,
              42,
              30,
              48,
              46,
              64,
              30,
              80,
              8,
              74,
              -20,
              82,
              -40,
              74
            ])
          ]
        };
    }
  }
  var GRID = (() => {
    let d = "";
    for (let x = 20; x < 200; x += 20) d += `M${x} 0V250`;
    for (let y = 25; y < 250; y += 25) d += `M0 ${y}H200`;
    return d;
  })();
  function Portrait({ look: look2, body, width }) {
    const v = (id) => look2[id] ?? 0;
    const skin = SKIN_TONES[v("skinTone")];
    const hairColor = HAIR_COLORS[v("hairColor")];
    const hairLine = mix(hairColor, "#ffffff", 0.3);
    const line2 = mix(skin, "#ffffff", 0.35);
    const contour = mix(skin, "#000000", 0.45);
    const jaw = v("jaw");
    const head = HEAD.map(([x, y]) => {
      const k = Math.min(1, Math.max(0, (y - 104) / 36));
      return [
        x * (1 + (JAW[jaw] - 1) * k),
        y + (y > 140 ? CHIN[jaw] * (y - 140) / 17 : 0)
      ];
    });
    const shoulders = SHOULDERS[body];
    const { back, front } = hair(v("hairstyle"), head);
    const [raise, browW, arch] = BROWS.slice(v("eyebrows") * 3);
    const [noseY, noseW] = NOSES.slice(v("nose") * 2);
    const [mouthW, smile] = MOUTHS.slice(v("mouth") * 2);
    const ear = EARS[v("ears")];
    const freckles = rng(v("skinType") + 3);
    const stroke = (color, w = 1) => ({
      fill: "none",
      stroke: color,
      strokeWidth: w
    });
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("svg", {
      viewBox: "0 0 200 250",
      style: {
        width,
        height: width * 1.25
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("path", {
          d: GRID,
          ...stroke(C.cyan, 0.5),
          opacity: 0.12
        }),
        back.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polygon", {
          points: p,
          fill: hairColor,
          stroke: hairLine,
          strokeWidth: 0.8
        }, i)),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polygon", {
          points: mirror(shoulders),
          fill: skin,
          opacity: 0.55
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: flat(shoulders),
          ...stroke(line2, 1.4)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: flat(shoulders, -1),
          ...stroke(line2, 1.4)
        }),
        [
          214,
          226,
          238
        ].map((y) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("line", {
          x1: CX - chord(shoulders, y) + 6,
          y1: y,
          x2: CX + chord(shoulders, y) - 6,
          y2: y,
          stroke: contour,
          strokeWidth: 0.7,
          opacity: 0.6
        }, y)),
        [
          1,
          -1
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: at2([
            45,
            86,
            45 + 6 * ear,
            v("ears") === 3 ? 72 : 82,
            45 + 8 * ear,
            94,
            45 + 6 * ear,
            106,
            44,
            110
          ], s),
          fill: skin,
          stroke: line2,
          strokeWidth: 1
        }, s)),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polygon", {
          points: mirror(head),
          fill: skin,
          opacity: 0.8,
          stroke: line2,
          strokeWidth: 1.4
        }),
        Array.from({
          length: 17
        }, (_, i) => 44 + i * 6.5).map((y) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("line", {
          x1: CX - chord(head, y) + 1,
          y1: y,
          x2: CX + chord(head, y) - 1,
          y2: y,
          stroke: contour,
          strokeWidth: 0.5,
          opacity: 0.5
        }, y)),
        [
          -0.62,
          -0.3,
          0.3,
          0.62
        ].map((f) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: Array.from({
            length: 19
          }, (_, i) => 41 + i * 6.3).flatMap((y) => [
            CX + f * chord(head, y),
            y
          ]),
          ...stroke(contour, 0.5),
          opacity: 0.45
        }, f)),
        Array.from({
          length: v("skinType") * 5
        }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("circle", {
          cx: CX + (freckles() > 0.5 ? 1 : -1) * (16 + freckles() * 18),
          cy: 102 + freckles() * 20,
          r: 0.7,
          fill: contour
        }, i)),
        [
          1,
          -1
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("g", {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
              points: at2([
                8,
                88 - arch * 0.3,
                17,
                85 - arch - raise * 0.3,
                27,
                88 - raise
              ], s),
              ...stroke(mix(hairColor, "#000000", 0.3), browW)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polygon", {
              points: at2([
                9,
                96,
                14,
                93,
                21,
                93,
                26,
                96,
                20,
                98.5,
                14,
                98.5
              ], s),
              fill: "#0c0c10",
              stroke: line2,
              strokeWidth: 0.8
            }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("circle", {
              cx: CX + s * 17.5,
              cy: 95.8,
              r: 2.4,
              fill: EYE_COLORS[v("eyes")]
            })
          ]
        }, s)),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: [
            CX + 2,
            98,
            CX + 4,
            noseY - 2,
            CX + noseW,
            noseY
          ],
          ...stroke(line2)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: [
            CX - noseW,
            noseY + 1,
            CX,
            noseY + 2.5,
            CX + noseW,
            noseY + 1
          ],
          ...stroke(contour)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Marks, {
          v,
          head,
          ink: mix(skin, "#000000", 0.75),
          noseY,
          ear,
          mouth: [
            mouthW,
            smile
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: at2([
            -mouthW,
            134 - smile,
            -mouthW / 3,
            132.5,
            0,
            133.5,
            mouthW / 3,
            132.5,
            mouthW,
            134 - smile
          ]),
          ...stroke(contour, 1.2)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polyline", {
          points: at2([
            -mouthW * 0.6,
            137.5,
            0,
            139.5,
            mouthW * 0.6,
            137.5
          ]),
          ...stroke(line2, 0.8)
        }),
        front.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("polygon", {
          points: p,
          fill: hairColor,
          stroke: hairLine,
          strokeWidth: 0.8
        }, i)),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("rect", {
          x: 0,
          y: 62,
          width: 200,
          height: 10,
          fill: C.cyan,
          opacity: 0.07
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("rect", {
          x: 0,
          y: 168,
          width: 200,
          height: 4,
          fill: C.cyan,
          opacity: 0.08
        })
      ]
    });
  }

  // src/screens/newgame/Radar.tsx
  var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
  var RULE = 352;
  function Radar({ attributes }) {
    const R = 14;
    const at3 = (i, r) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      return [
        r * Math.cos(a),
        r * Math.sin(a)
      ];
    };
    const ring = (r) => [
      0,
      1,
      2,
      3,
      4
    ].flatMap((i) => at3(i, r));
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
          style: {
            ...T.micro,
            positionType: "absolute",
            left: 20,
            top: RULE + 10,
            fontSize: 10,
            letterSpacing: 1
          },
          children: "ATTRIBUTES"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("svg", {
          viewBox: "-100 -100 200 200",
          style: {
            positionType: "absolute",
            left: 22,
            top: RULE + 24,
            width: 176,
            height: 176
          },
          children: [
            [
              2,
              4,
              6
            ].map((l) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("polygon", {
              points: ring(l * R),
              fill: "none",
              stroke: "#5c1c1e",
              strokeWidth: 1
            }, l)),
            [
              0,
              1,
              2,
              3,
              4
            ].map((i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("line", {
              x1: 0,
              y1: 0,
              x2: at3(i, 6 * R)[0],
              y2: at3(i, 6 * R)[1],
              stroke: "#5c1c1e",
              strokeWidth: 1
            }, i)),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("polygon", {
              points: ATTRIBUTES.flatMap((a, i) => at3(i, attributes[a.id] * R)),
              fill: C.red,
              opacity: 0.3
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("polygon", {
              points: ATTRIBUTES.flatMap((a, i) => at3(i, attributes[a.id] * R)),
              fill: "none",
              stroke: C.red,
              strokeWidth: 2
            }),
            ATTRIBUTES.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("circle", {
              cx: at3(i, attributes[a.id] * R)[0],
              cy: at3(i, attributes[a.id] * R)[1],
              r: 3.5,
              fill: C.cyan
            }, a.id))
          ]
        }),
        ATTRIBUTES.map((a, i) => {
          const [x, y] = at3(i, 106);
          return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
            style: {
              ...T.micro,
              positionType: "absolute",
              left: 110 + x * 0.88 - 9,
              top: RULE + 112 + y * 0.88 - 6,
              color: C.cyanDim
            },
            children: a.short
          }, a.id);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 236,
            top: RULE + 36,
            flexDirection: "column",
            gap: 9
          },
          children: ATTRIBUTES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("node", {
            style: {
              flexDirection: "row",
              alignItems: "center",
              gap: 8
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
                style: {
                  ...T.micro,
                  fontSize: 11,
                  color: C.red,
                  width: 30
                },
                children: a.short
              }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
                style: {
                  flexDirection: "row",
                  gap: 3
                },
                children: Array.from({
                  length: ATTR_MAX
                }, (_, l) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
                  style: {
                    width: 18,
                    height: 12,
                    backgroundColor: l < attributes[a.id] ? C.red : "#2a1016"
                  }
                }, l))
              }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
                style: {
                  fontSize: 20,
                  fontFamily: F.bold,
                  color: C.cyan,
                  lineBreak: "noWrap"
                },
                children: attributes[a.id].toString()
              })
            ]
          }, a.id))
        })
      ]
    });
  }

  // src/screens/newgame/IdCard.tsx
  var W2 = 480;
  var H2 = 640;
  function IdCard({ character, onChange, onEditing, style }) {
    const [field, setField] = (0, import_react8.useState)(0);
    const [editing, setEditing] = (0, import_react8.useState)(false);
    const edit = (on2) => {
      setEditing(on2);
      onEditing(on2);
    };
    useKeys((e) => {
      if (editing && e.key === "Enter") {
        setField(field + 1);
        edit(false);
      }
    });
    const scan = (0, import_bevy_react7.useSharedValue)(1);
    const lookKey = JSON.stringify(character.look) + character.body;
    (0, import_react8.useEffect)(() => {
      scan.value = (0, import_bevy_react7.withSequence)((0, import_bevy_react7.withTiming)(0, {
        duration: 0
      }), (0, import_bevy_react7.withTiming)(1, {
        duration: 650,
        easing: "easeInOut"
      }));
    }, [
      lookKey,
      scan
    ]);
    const lifepath = LIFEPATHS.find((l) => l.id === character.lifepath);
    const difficulty = DIFFICULTIES.find((d) => d.id === character.difficulty);
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
      style: {
        ...chamfer("#0d0a10", 34, "rgba(255, 93, 81, 0.6)", 1),
        width: W2,
        height: H2,
        ...style
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Head, {}),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 20,
            top: 78,
            width: 190,
            height: 238,
            border: 1,
            borderColor: "rgba(94, 246, 255, 0.28)",
            backgroundColor: "#07090e",
            overflowX: "clip",
            overflowY: "clip"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Portrait, {
              look: character.look,
              body: character.body,
              width: 188
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("node", {
              style: {
                positionType: "absolute",
                left: 0,
                right: 0,
                top: -3,
                height: 3,
                backgroundColor: C.cyan,
                opacity: {
                  animated: (0, import_bevy_react7.interpolate)(scan, [
                    0,
                    0.04,
                    0.9,
                    1
                  ], [
                    0,
                    0.9,
                    0.9,
                    0
                  ])
                },
                transform: {
                  translateY: {
                    animated: (0, import_bevy_react7.interpolate)(scan, [
                      0,
                      1
                    ], [
                      0,
                      240
                    ])
                  }
                }
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
          style: {
            ...T.micro,
            positionType: "absolute",
            left: 20,
            top: 320,
            color: C.cyanDim
          },
          children: "BIOMETRIC SCAN 01 // LIVE"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 228,
            top: 72,
            width: 232,
            flexDirection: "column",
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
              style: {
                flexDirection: "column",
                gap: 2
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    justifyContent: "spaceBetween"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Label, {
                      children: "HANDLE"
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Label, {
                      color: editing ? C.cyan : C.redDim,
                      children: editing ? "ENTER TO CONFIRM" : "CLICK TO EDIT"
                    })
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("editableText", {
                  value: character.handle,
                  maxLength: 12,
                  onChange: (v) => onChange({
                    ...character,
                    handle: v.toUpperCase()
                  }),
                  onFocus: () => edit(true),
                  onBlur: () => edit(false),
                  style: {
                    width: 232,
                    height: 44,
                    padding: {
                      horizontal: 4
                    },
                    border: {
                      bottom: 2
                    },
                    borderColor: "rgba(255, 93, 81, 0.6)",
                    fontSize: 36,
                    fontFamily: F.bold,
                    color: C.cyan,
                    letterSpacing: 1,
                    cursor: "text"
                  },
                  focusStyle: {
                    borderColor: C.cyan,
                    backgroundColor: "#0f1d24"
                  }
                }, field)
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Field, {
              label: "RESIDENT NO.",
              children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
                style: {
                  fontSize: 15,
                  fontFamily: F.mono,
                  color: C.white,
                  lineBreak: "noWrap"
                },
                children: residentId(character.handle)
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Field, {
              label: "LIFEPATH",
              children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
                style: {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(LifepathIcon2, {
                    id: lifepath.id
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Value, {
                    children: lifepath.name.toUpperCase()
                  })
                ]
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Field, {
              label: "BODY TYPE",
              children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Value, {
                children: character.body === 0 ? "FRAME A // BROAD" : "FRAME B // SLIGHT"
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Field, {
              label: "VOICE TONE",
              children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Value, {
                children: VOICE.names[character.voice]
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Field, {
              label: "DIFFICULTY",
              children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Value, {
                children: difficulty.name
              })
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 20,
            right: 20,
            top: RULE,
            height: 1,
            backgroundColor: "rgba(255, 93, 81, 0.45)"
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Radar, {
          attributes: character.attributes
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 20,
            top: RULE + 210,
            flexDirection: "column",
            gap: 2
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Barcode, {
              seed: hash(character.handle),
              width: 300,
              height: 30
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
              style: {
                ...T.micro,
                color: C.red,
                lineBreak: "noWrap"
              },
              children: `${residentId(character.handle).replace(/-/g, " ")}  ${hash(character.handle + "#").toString(16).toUpperCase()}`
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
          style: {
            ...T.micro,
            positionType: "absolute",
            left: 340,
            top: RULE + 213,
            width: 110,
            fontSize: 7.5,
            color: C.redDim
          },
          children: "PROPERTY OF THE CITY\nOF SABLE. VOID IF\nTAMPERED WITH. CARRY\nAT ALL TIMES."
        })
      ]
    });
  }
  function Head() {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 60,
            backgroundGradient: {
              type: "linear",
              angle: 90,
              stops: [
                {
                  color: "#3c1218"
                },
                {
                  color: "#1a0c12"
                }
              ]
            },
            border: {
              bottom: 1
            },
            borderColor: "rgba(255, 93, 81, 0.6)"
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", {
          viewBox: "0 0 60 40",
          style: {
            positionType: "absolute",
            left: 16,
            top: 12,
            width: 48,
            height: 32
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("polygon", {
            points: [
              2,
              38,
              16,
              8,
              26,
              26,
              32,
              14,
              40,
              28,
              46,
              6,
              58,
              38
            ],
            fill: "none",
            stroke: C.red,
            strokeWidth: 3
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
          style: {
            positionType: "absolute",
            left: 74,
            top: 8,
            fontSize: 24,
            fontFamily: F.bold,
            color: C.red,
            letterSpacing: 1,
            lineBreak: "noWrap"
          },
          children: "SABLE CITY RESIDENT ID"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
          style: {
            ...T.micro,
            positionType: "absolute",
            left: 75,
            top: 38,
            fontSize: 8
          },
          children: "CITIZEN REGISTRY // DISTRICT 04 // ISSUED 10.07.91\nGRIDWATCH CLEARED // CLASS C // VALID UNTIL REVOKED"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("svg", {
          viewBox: "0 0 34 26",
          style: {
            positionType: "absolute",
            right: 16,
            top: 16,
            width: 34,
            height: 26
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("rect", {
              x: 1,
              y: 1,
              width: 32,
              height: 24,
              rx: 4,
              fill: "#1e2a2e",
              stroke: C.cyanDim,
              strokeWidth: 1.2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("path", {
              d: "M1 9H11V17H1M33 9H23V17H33M11 1V25M23 1V25M11 13H23",
              fill: "none",
              stroke: C.cyanDim,
              strokeWidth: 1
            })
          ]
        })
      ]
    });
  }
  function Label({ children, color = C.redDim }) {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
      style: {
        ...T.micro,
        fontSize: 10,
        color,
        letterSpacing: 1,
        lineBreak: "noWrap"
      },
      children
    });
  }
  function Value({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
      style: {
        fontSize: 21,
        fontFamily: F.semibold,
        color: C.cyan,
        lineBreak: "noWrap"
      },
      children
    });
  }
  function Field({ label, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Label, {
          children: label
        }),
        children
      ]
    });
  }

  // src/screens/newgame/Swatches.tsx
  var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
  function Swatches({ option, value, onPick, onClose }) {
    const enter = useEnter(30);
    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
          style: {
            positionType: "absolute",
            right: 135,
            ...enter,
            top: 158,
            width: 560,
            flexDirection: "column",
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "flexEnd",
                gap: 14,
                padding: {
                  left: 28
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(DataNoise, {
                  seed: 41,
                  lines: 3,
                  groups: 2,
                  style: {
                    fontSize: 6
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
                  style: {
                    ...T.menu,
                    fontSize: 27,
                    fontFamily: F.semibold
                  },
                  children: option.label
                }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
                  style: {
                    flexGrow: 1
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
                  style: {
                    fontSize: 17,
                    fontFamily: F.bold,
                    color: C.red,
                    lineBreak: "noWrap"
                  },
                  children: "SC+"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
              style: {
                ...chamfer("#1a0a0e", 22, "rgba(255, 93, 81, 0.55)", 1),
                flexDirection: "column",
                gap: 12,
                padding: {
                  left: 26,
                  right: 24,
                  top: 10,
                  bottom: 12
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
                  style: {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 5,
                    width: 505
                  },
                  children: option.swatches.map((color, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("button", {
                    onPointerEnter: () => sfx("hover"),
                    onClick: () => {
                      sfx("click");
                      onPick(i);
                    },
                    style: {
                      ...chamfer(color, 12),
                      width: 80,
                      height: 80,
                      justifyContent: "flexEnd",
                      alignItems: "flexStart",
                      padding: {
                        top: 8,
                        right: 8
                      }
                    },
                    hoverStyle: {
                      ...chamfer(color, 12, C.cyan, 2)
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
                      style: {
                        width: 14,
                        height: 14,
                        border: 2,
                        borderColor: C.red,
                        padding: 2
                      },
                      children: i === value && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
                        style: {
                          width: 6,
                          height: 6,
                          backgroundColor: C.red
                        }
                      })
                    })
                  }, color))
                }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
                  style: {
                    ...T.micro,
                    fontSize: 7.5,
                    color: C.redDim
                  },
                  children: `IMAGE NAME:  ${option.id.toUpperCase()}-${(value + 1).toString().padStart(3, "0")}.SWT
IMAGE TYPE:  KERNEL ISOLATED SAMPLE
CODEC:  UNCOMPRESSED
LOAD ADDRESS:  0000A1244`
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", {
          onClick: onClose,
          style: {
            ...chamfer("#1a0a0e", 12, "rgba(255, 93, 81, 0.55)", 1),
            positionType: "absolute",
            right: 185,
            top: 432,
            width: 200,
            height: 46,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10
          },
          hoverStyle: chamfer("#3a1016", 12, C.red, 1),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Keycap, {
              k: "ESC"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
              style: {
                ...T.menu,
                fontSize: 25
              },
              children: "CLOSE"
            })
          ]
        })
      ]
    });
  }

  // src/screens/newgame/Appearance.tsx
  var PLATE2 = "#1c0a0e";
  var STEP = "#2a090c";
  var EDGE = "#5a1c1f";
  function Appearance({ character, onChange, next, back }) {
    const [grid, setGrid] = (0, import_react9.useState)(null);
    const [editing, setEditing] = (0, import_react9.useState)(false);
    const [scroll, setScroll] = (0, import_react9.useState)(0);
    const setLook = (id, value) => onChange({
      ...character,
      look: {
        ...character.look,
        [id]: value
      }
    });
    const step = (id, count, by) => {
      sfx("tab");
      setLook(id, (look(character, id) + by + count) % count);
    };
    const option = LOOK_OPTIONS.find((o) => o.id === grid);
    useKeys((e) => {
      if (editing) return;
      if (e.key === "Escape") {
        if (grid) {
          sfx("back");
          setGrid(null);
        } else back();
      } else if (e.code === "KeyF" && !grid) next();
    });
    useDebug("swatch", (id) => setGrid(id || null));
    useDebug("look", (arg) => {
      const [id, n] = arg.split(" ");
      setLook(id, Number(n));
    });
    useDebug("scroll", (px) => setScroll(Number(px)));
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Chrome, {}),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Header, {
          title: "APPEARANCE",
          caption: "IN SABLE CITY, EVERY CAMERA KNOWS YOUR FACE. MAKE IT ONE WORTH FILING.",
          icon: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(StepIcon, {
            kind: "appearance"
          }),
          step: 2
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Presets, {
          character,
          onChange
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(IdCard, {
          character,
          onChange,
          onEditing: setEditing,
          style: {
            positionType: "absolute",
            left: 560,
            top: 196
          }
        }),
        option && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Swatches, {
          option,
          value: look(character, option.id),
          onPick: (i) => setLook(option.id, i),
          onClose: () => {
            sfx("back");
            setGrid(null);
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
          scrollTop: scroll,
          style: {
            display: option ? "none" : "flex",
            positionType: "absolute",
            right: 146,
            top: 214,
            width: 491,
            height: 660,
            flexDirection: "column",
            gap: 10,
            overflowY: "scroll",
            scrollbar: {
              track: {
                backgroundColor: "#4e1717"
              },
              thumb: {
                backgroundColor: "#ff5e52",
                hover: {
                  backgroundColor: C.redHi
                }
              },
              thickness: 8,
              minThumbLength: 60
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Pronouns, {
              name: handleOf(character),
              voice: character.voice
            }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Row, {
              label: VOICE.label,
              value: VOICE.names[character.voice],
              onStep: () => {
                sfx("tab");
                onChange({
                  ...character,
                  voice: 1 - character.voice
                });
              }
            }),
            LOOK_OPTIONS.map((o) => {
              const value = look(character, o.id);
              return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Row, {
                label: o.label,
                value: two(value),
                swatch: o.swatches?.[value],
                onStep: (by) => step(o.id, o.count, by),
                onGrid: o.swatches ? () => {
                  sfx("click");
                  setGrid(o.id);
                } : void 0
              }, o.id);
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(NavButtons, {
          onBack: back,
          onNext: next
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Hint, {
              k: "mouse",
              label: "SELECT"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(IconHint, {
              icon: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(WheelIcon, {}),
              label: "SCROLL"
            })
          ]
        })
      ]
    });
  }
  function Pronouns({ name: name2, voice }) {
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        width: 455,
        height: 44
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(WarningIcon, {
          size: 18
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
          style: {
            ...T.micro,
            fontSize: 5.5,
            color: C.red,
            lineBreak: "noWrap"
          },
          children: "VOX MOD\nREG 2091\nSC 44-A"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("node", {
          style: {
            width: 390
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
            style: {
              fontSize: 19,
              color: C.red,
              lineHeight: 1.05
            },
            children: `OTHER CHARACTERS WILL REFER TO
${name2} AS ${voice === 0 ? "HE/HIM" : "SHE/HER"}.`
          })
        })
      ]
    });
  }
  function Row({ label, value, swatch, onStep, onGrid }) {
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 4,
        width: 455
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
          style: {
            ...chamfer(PLATE2, 14, EDGE, 1, "bl"),
            height: 62,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "spaceBetween",
            padding: {
              left: 10,
              right: 8
            }
          },
          hoverStyle: chamfer("#2a0d13", 14, "rgba(255, 93, 81, 0.75)", 1, "bl"),
          onPointerEnter: () => sfx("hover"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                fontSize: 25,
                color: C.red,
                lineBreak: "noWrap"
              },
              children: label
            }),
            swatch ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("node", {
              style: {
                ...chamfer(swatch, 8, EDGE, 1),
                width: 50,
                height: 50
              }
            }) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                fontSize: 25,
                color: C.red,
                lineBreak: "noWrap"
              },
              children: value
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 4,
            height: 38
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(StepButton, {
              side: "left",
              onClick: () => onStep(-1),
              children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Arrow, {
                dir: "left",
                size: 22
              })
            }),
            onGrid && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(StepButton, {
              onClick: onGrid,
              children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(GridIcon, {})
            }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(StepButton, {
              side: "right",
              onClick: () => onStep(1),
              children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Arrow, {
                dir: "right",
                size: 22
              })
            })
          ]
        })
      ]
    });
  }
  function StepButton({ side: side3, onClick, children }) {
    const corner = side3 === "left" ? "bl" : "br";
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", {
      onPointerEnter: () => sfx("hover"),
      onClick,
      style: {
        ...side3 ? chamfer(STEP, 12, EDGE, 1, corner) : {
          backgroundColor: STEP,
          border: 1,
          borderColor: EDGE
        },
        flexGrow: 1,
        flexBasis: 0,
        alignItems: "center",
        justifyContent: side3 === "left" ? "flexStart" : side3 ? "flexEnd" : "center",
        padding: {
          left: side3 === "left" ? 60 : 0,
          right: side3 === "right" ? 70 : 0
        }
      },
      hoverStyle: side3 ? chamfer("#48121a", 12, C.red, 1, corner) : {
        backgroundColor: "#48121a",
        borderColor: C.red
      },
      children
    });
  }
  function Presets({ character, onChange }) {
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 76,
        top: 194,
        flexDirection: "column",
        gap: 5
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
          style: {
            ...T.menu,
            fontSize: 31,
            fontFamily: F.semibold,
            margin: {
              bottom: 4
            }
          },
          children: "PRESETS"
        }),
        PRESETS2.map((p, i) => {
          const on2 = Object.entries(p).every(([id, v]) => look(character, id) === v);
          return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("button", {
            onPointerEnter: () => sfx("hover"),
            onClick: () => {
              sfx("click");
              onChange({
                ...character,
                look: {
                  ...character.look,
                  ...p
                }
              });
            },
            style: {
              ...chamfer("#240a0e", 16, on2 ? C.red : EDGE, 1),
              width: 110,
              height: 160,
              flexDirection: "column",
              alignItems: "center",
              padding: {
                top: 4
              }
            },
            hoverStyle: chamfer("#3a1016", 16, C.red, 1),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Portrait, {
                look: {
                  ...character.look,
                  ...p
                },
                body: character.body,
                width: 100
              }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("node", {
                style: {
                  width: 100,
                  height: 1,
                  margin: {
                    top: 3,
                    bottom: 4
                  },
                  backgroundColor: EDGE
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
                style: {
                  width: 96,
                  flexDirection: "column"
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
                    style: {
                      fontSize: 15,
                      fontFamily: F.bold,
                      color: C.red,
                      lineBreak: "noWrap"
                    },
                    children: `SC+ ${two(i)}`
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
                    style: {
                      ...T.micro,
                      fontSize: 5.5
                    },
                    children: "TEMPLATE // RESIDENT"
                  })
                ]
              })
            ]
          }, i);
        })
      ]
    });
  }

  // src/screens/newgame/Attributes.tsx
  var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
  var import_react10 = __toESM(require_react(), 1);
  var DARK = "#0d0f16";
  var EDGE2 = "rgba(255, 93, 81, 0.42)";
  var LIT = "#5a1a1e";
  function Attributes({ character, onChange, next, back }) {
    const [hot, setHot] = (0, import_react10.useState)(0);
    const [editing, setEditing] = (0, import_react10.useState)(false);
    const values = character.attributes;
    const spent = ATTRIBUTES.reduce((n, a2) => n + values[a2.id] - ATTR_MIN, 0);
    const points = ATTR_POINTS - spent;
    const change2 = (id, by) => {
      const v = values[id] + by;
      if (v < ATTR_MIN || v > ATTR_MAX || by > 0 && points === 0) return sfx("error");
      sfx("tab");
      onChange({
        ...character,
        attributes: {
          ...values,
          [id]: v
        }
      });
    };
    const hover = (i) => {
      if (i === hot) return;
      sfx("hover");
      setHot(i);
    };
    useKeys((e) => {
      if (editing || e.repeat && (e.key === "Escape" || e.code === "KeyF")) return;
      if (e.key === "Escape") back();
      else if (e.code === "KeyF") next();
      else if (e.code === "KeyA") change2(ATTRIBUTES[hot].id, -1);
      else if (e.code === "KeyD") change2(ATTRIBUTES[hot].id, 1);
      else if (e.key === "ArrowUp") hover(Math.max(0, hot - 1));
      else if (e.key === "ArrowDown") hover(Math.min(ATTRIBUTES.length - 1, hot + 1));
    }, true);
    useDebug("hover", (n) => setHot(Number(n)));
    useDebug("attrs", (arg) => {
      const n = arg.split(" ").map(Number);
      onChange({
        ...character,
        attributes: Object.fromEntries(ATTRIBUTES.map((a2, i) => [
          a2.id,
          n[i]
        ]))
      });
    });
    const a = ATTRIBUTES[hot];
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Chrome, {}),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Header, {
          title: "ATTRIBUTES",
          caption: "SPEND YOUR POINTS. WHAT YOU START WITH DECIDES HOW YOU SURVIVE YOUR FIRST NIGHT.",
          icon: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(StepIcon, {
            kind: "attributes"
          }),
          step: 3
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Explainer, {
          name: a.name,
          text: a.text,
          effects: a.effects,
          value: values[a.id]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(IdCard, {
          character,
          onChange,
          onEditing: setEditing,
          style: {
            positionType: "absolute",
            left: 560,
            top: 196
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
          style: {
            ...T.menu,
            positionType: "absolute",
            right: 200,
            top: 178,
            fontSize: 27,
            fontFamily: F.semibold
          },
          children: "POINTS AVAILABLE"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("button", {
          onClick: () => {
            sfx("click");
            onChange({
              ...character,
              attributes: NEW_CHARACTER.attributes
            });
          },
          style: {
            ...chamfer(DARK, 14, EDGE2, 1, "bl"),
            positionType: "absolute",
            right: 408,
            top: 213,
            width: 249,
            height: 50,
            alignItems: "center",
            justifyContent: "center"
          },
          hoverStyle: chamfer("#2a0d12", 14, C.red, 1, "bl"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
              style: {
                fontSize: 22,
                fontFamily: F.semibold,
                color: C.red,
                lineBreak: "noWrap"
              },
              children: "RESET TO DEFAULT"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                positionType: "absolute",
                right: -2,
                top: 23,
                width: 24,
                height: 3,
                border: 1,
                borderColor: EDGE2
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
          style: {
            ...chamfer(DARK, 12, EDGE2, 1, "bl"),
            positionType: "absolute",
            right: 200,
            top: 210,
            width: 110,
            height: 53,
            alignItems: "center",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
            style: {
              fontSize: 42,
              fontFamily: F.semibold,
              color: C.red,
              lineBreak: "noWrap"
            },
            children: points.toString()
          })
        }),
        ATTRIBUTES.map((attr, i) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(AttributeRow, {
          id: attr.id,
          name: attr.name,
          value: values[attr.id],
          lit: i === hot,
          canAdd: values[attr.id] < ATTR_MAX && points > 0,
          top: 278 + i * 121,
          onEnter: () => hover(i),
          onChange: (by) => change2(attr.id, by)
        }, attr.id)),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(NavButtons, {
          onBack: back,
          onNext: next
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 8
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Keycap, {
                  k: "A"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                  style: {
                    fontSize: 25,
                    color: C.red,
                    lineBreak: "noWrap"
                  },
                  children: "- / +"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Keycap, {
                  k: "D"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Hint, {
              k: "mouse",
              label: "SELECT"
            })
          ]
        })
      ]
    });
  }
  function AttributeRow({ id, name: name2, value, lit, canAdd, top, onEnter, onChange }) {
    const fill = lit ? LIT : DARK;
    const edge = lit ? "rgba(255, 93, 81, 0.75)" : EDGE2;
    const box = (corner) => corner ? chamfer(fill, 12, edge, 1, corner) : {
      backgroundColor: fill,
      border: 1,
      borderColor: edge
    };
    const badge = value === ATTR_MAX ? "MAX LEVEL" : value === ATTR_MIN ? "MIN LEVEL" : null;
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("button", {
      onPointerEnter: onEnter,
      style: {
        positionType: "absolute",
        right: 200,
        top,
        width: 457,
        flexDirection: "column",
        gap: 6
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
          style: {
            ...chamfer(fill, 16, edge, 1, "bl"),
            height: 62,
            alignItems: "center",
            justifyContent: "center"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                positionType: "absolute",
                left: 32,
                top: 10
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(AttributeIcon, {
                id
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
              style: {
                fontSize: 25,
                fontFamily: F.semibold,
                color: C.red,
                lineBreak: "noWrap"
              },
              children: name2
            }),
            badge && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                positionType: "absolute",
                right: 10,
                top: 18
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(LevelBadge, {
                label: badge
              })
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 4,
            height: 46
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", {
              onPointerEnter: onEnter,
              onClick: () => onChange(-1),
              style: {
                ...box("bl"),
                width: 110,
                alignItems: "center",
                justifyContent: "center"
              },
              hoverStyle: chamfer("#6e2228", 12, C.red, 1, "bl"),
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Sign, {
                plus: false,
                off: value <= ATTR_MIN
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                ...box(),
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                style: {
                  fontSize: 27,
                  fontFamily: F.semibold,
                  color: C.cyan,
                  lineBreak: "noWrap"
                },
                children: value.toString()
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", {
              onPointerEnter: onEnter,
              onClick: () => onChange(1),
              style: {
                ...box("br"),
                width: 111,
                alignItems: "center",
                justifyContent: "center"
              },
              hoverStyle: chamfer("#6e2228", 12, C.red, 1, "br"),
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Sign, {
                plus: true,
                off: !canAdd
              })
            })
          ]
        })
      ]
    });
  }
  function Sign({ plus, off }) {
    const color = off ? "#a3332b" : C.red;
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("svg", {
      viewBox: "0 0 58 16",
      style: {
        width: 58,
        height: 16
      },
      children: [
        off && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("rect", {
              x: 1,
              y: 3,
              width: 56,
              height: 10,
              fill: "none",
              stroke: color,
              strokeWidth: 1
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("line", {
              x1: 1,
              y1: 3,
              x2: 57,
              y2: 13,
              stroke: color,
              strokeWidth: 1
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("rect", {
          x: 23,
          y: 7,
          width: 12,
          height: 2.4,
          fill: color
        }),
        plus && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("rect", {
          x: 27.8,
          y: 2,
          width: 2.4,
          height: 12,
          fill: color
        })
      ]
    });
  }
  function Explainer({ name: name2, text, effects, value }) {
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 75,
        top: 178,
        width: 397,
        minHeight: 368,
        flexDirection: "row"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
          style: {
            ...chamfer("#160a0f", 12, EDGE2, 1, "bl"),
            width: 40,
            margin: {
              right: 3
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                positionType: "absolute",
                left: 26,
                top: 16,
                bottom: 16,
                width: 1,
                backgroundColor: EDGE2
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                positionType: "absolute",
                left: 4,
                top: 175,
                width: 22,
                height: 4,
                border: 1,
                borderColor: EDGE2
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
          style: {
            ...chamfer(DARK, 18, EDGE2, 1),
            flexGrow: 1,
            flexDirection: "column",
            padding: {
              left: 16,
              right: 12,
              top: 10,
              bottom: 10
            },
            gap: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "spaceBetween",
                height: 32
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                  style: {
                    fontSize: 26,
                    fontFamily: F.semibold,
                    color: C.red,
                    lineBreak: "noWrap"
                  },
                  children: name2
                }),
                value === ATTR_MAX && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(LevelBadge, {
                  label: "MAX LEVEL"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                height: 1,
                backgroundColor: EDGE2
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                width: 322
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                style: {
                  fontSize: 22,
                  color: C.cyan,
                  lineHeight: 1.12
                },
                children: `${text}

${effects.map((e) => `- ${e}`).join("\n")}`
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                flexGrow: 1
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
              style: {
                height: 1,
                backgroundColor: EDGE2
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                height: 48
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                  style: {
                    fontSize: 40,
                    color: C.red,
                    lineBreak: "noWrap"
                  },
                  children: value.toString()
                }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                  style: {
                    fontSize: 17,
                    fontFamily: F.bold,
                    color: C.red,
                    lineBreak: "noWrap"
                  },
                  children: "ATTRIBUTE LEVEL"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
                  style: {
                    width: 1,
                    height: 48,
                    margin: {
                      left: 10
                    },
                    backgroundColor: EDGE2
                  }
                })
              ]
            })
          ]
        })
      ]
    });
  }

  // src/screens/newgame/BodyType.tsx
  var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
  var import_react11 = __toESM(require_react(), 1);

  // src/screens/newgame/Figure.tsx
  var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
  var BUILDS = [
    [
      0,
      28,
      13,
      30,
      22,
      37,
      27,
      50,
      28,
      66,
      26,
      82,
      21,
      96,
      14,
      106,
      12,
      114,
      13,
      126,
      30,
      134,
      52,
      141,
      66,
      150,
      74,
      166,
      78,
      196,
      80,
      236,
      79,
      262,
      77,
      300,
      73,
      340,
      70,
      372,
      73,
      392,
      72,
      414,
      66,
      428,
      59,
      424,
      57,
      404,
      56,
      376,
      55,
      344,
      54,
      304,
      53,
      270,
      51,
      232,
      48,
      200,
      46,
      212,
      44,
      250,
      40,
      296,
      40,
      320,
      45,
      352,
      48,
      384,
      47,
      440,
      44,
      500,
      40,
      530,
      39,
      560,
      40,
      600,
      36,
      660,
      31,
      712,
      36,
      730,
      40,
      748,
      30,
      754,
      14,
      754,
      12,
      736,
      13,
      712,
      12,
      660,
      13,
      600,
      11,
      560,
      12,
      530,
      10,
      470,
      6,
      420,
      0,
      404
    ],
    [
      0,
      30,
      12,
      32,
      20,
      38,
      25,
      50,
      26,
      65,
      24,
      80,
      19,
      93,
      12,
      103,
      10,
      112,
      11,
      124,
      24,
      132,
      42,
      139,
      53,
      147,
      59,
      162,
      61,
      192,
      62,
      230,
      61,
      258,
      59,
      296,
      56,
      334,
      53,
      364,
      56,
      384,
      55,
      404,
      50,
      418,
      44,
      414,
      42,
      396,
      42,
      368,
      42,
      336,
      42,
      300,
      42,
      268,
      41,
      234,
      40,
      200,
      38,
      214,
      37,
      244,
      31,
      288,
      31,
      304,
      40,
      346,
      50,
      388,
      49,
      440,
      44,
      500,
      38,
      532,
      37,
      562,
      38,
      600,
      33,
      660,
      28,
      712,
      32,
      730,
      35,
      748,
      26,
      754,
      13,
      754,
      11,
      736,
      12,
      712,
      11,
      660,
      12,
      600,
      10,
      562,
      11,
      532,
      9,
      470,
      5,
      424,
      0,
      408
    ]
  ];
  var DETAILS = [
    [
      [
        8,
        142,
        40,
        136
      ],
      [
        0,
        150,
        0,
        250
      ],
      [
        0,
        198,
        18,
        202,
        36,
        192
      ],
      [
        4,
        236,
        16,
        234
      ],
      [
        4,
        262,
        17,
        261
      ],
      [
        4,
        288,
        17,
        288
      ],
      [
        30,
        330,
        12,
        380
      ],
      [
        18,
        526,
        26,
        534,
        34,
        526
      ]
    ],
    [
      [
        7,
        136,
        32,
        132
      ],
      [
        0,
        144,
        0,
        214
      ],
      [
        4,
        214,
        16,
        222,
        30,
        214,
        34,
        196
      ],
      [
        22,
        286,
        31,
        296
      ],
      [
        28,
        330,
        10,
        384
      ],
      [
        16,
        528,
        24,
        536,
        32,
        528
      ]
    ]
  ];
  var JOINTS = [
    [
      66,
      152,
      67,
      262,
      63,
      372,
      32,
      384,
      26,
      532,
      22,
      712
    ],
    [
      50,
      148,
      52,
      258,
      48,
      366,
      30,
      388,
      24,
      534,
      20,
      712
    ]
  ];
  var CX2 = 150;
  var side2 = (a, s) => a.map((v, i) => i % 2 ? v : CX2 + s * v);
  function mirror2(half) {
    const back = [];
    for (let i = half.length - 4; i >= 2; i -= 2) back.push(half[i], half[i + 1]);
    return [
      ...side2(half, 1),
      ...side2(back, -1)
    ];
  }
  function Figure({ build, color, accent, height: height2 }) {
    const outline = mirror2(BUILDS[build]);
    const joints = JOINTS[build];
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("svg", {
      viewBox: "0 0 300 780",
      style: {
        width: height2 * 300 / 780,
        height: height2
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("polygon", {
          points: outline,
          fill: color,
          opacity: 0.12
        }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("polygon", {
          points: outline,
          fill: "none",
          stroke: color,
          strokeWidth: 1.6,
          strokeLinejoin: "round"
        }),
        DETAILS[build].flatMap((line2, i) => [
          1,
          -1
        ].map((s) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("polyline", {
          points: side2(line2, s),
          fill: "none",
          stroke: color,
          strokeWidth: 1,
          opacity: 0.55
        }, `${i}${s}`))),
        [
          1,
          -1
        ].flatMap((s) => Array.from({
          length: joints.length / 2
        }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("circle", {
          cx: CX2 + s * joints[2 * i],
          cy: joints[2 * i + 1],
          r: 3.2,
          fill: "none",
          stroke: accent,
          strokeWidth: 1.2
        }, `${i}${s}`))),
        [
          120,
          330,
          560
        ].map((y) => /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("line", {
          x1: 20,
          y1: y,
          x2: 280,
          y2: y,
          stroke: accent,
          strokeWidth: 0.6,
          opacity: 0.4
        }, y))
      ]
    });
  }

  // src/screens/newgame/BodyType.tsx
  var CARD = {
    width: 372,
    height: 872,
    top: 125,
    lefts: [
      537,
      1015
    ]
  };
  function genome(seed) {
    const r = rng(seed);
    const base = () => "ACGT"[Math.floor(r() * 4)];
    return Array.from({
      length: 79
    }, () => Array.from({
      length: 12
    }, () => base() + base() + base()).join(" ")).join("\n");
  }
  var GENOME = [
    genome(21),
    genome(34)
  ];
  function BodyType({ character, onChange, next, back }) {
    const [hot, setHot] = (0, import_react11.useState)(character.body);
    const hover = (i) => {
      if (i === hot) return;
      sfx("hover");
      setHot(i);
    };
    const pick = (i) => {
      onChange({
        ...character,
        body: i
      });
      next();
    };
    useKeys((e) => {
      if (e.key === "Escape") back();
      else if (e.key === "ArrowLeft") hover(0);
      else if (e.key === "ArrowRight") hover(1);
      else if (e.key === "Enter" || e.code === "KeyF") pick(hot);
    });
    useDebug("hover", (n) => setHot(Number(n)));
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Chrome, {}),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Header, {
          title: "BODY TYPE",
          caption: `PICK A FRAME FOR ${handleOf(character)}. THE WAY YOU LOOK CAN CHANGE HOW SOME PEOPLE IN SABLE CITY TREAT YOU.`,
          icon: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(StepIcon, {
            kind: "body"
          }),
          step: 1
        }),
        CARD.lefts.map((left, i) => {
          const lit = i === hot;
          return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("button", {
            onPointerEnter: () => hover(i),
            onClick: () => pick(i),
            style: {
              positionType: "absolute",
              left,
              top: CARD.top,
              width: CARD.width,
              height: CARD.height,
              backgroundGradient: lit ? {
                type: "linear",
                angle: 180,
                stops: [
                  {
                    color: "#5a1d20"
                  },
                  {
                    color: "#2e1418"
                  }
                ]
              } : void 0
            },
            children: [
              lit && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                style: {
                  positionType: "absolute",
                  left: 6,
                  top: 30,
                  fontSize: 10.5,
                  fontFamily: F.mono,
                  color: "#76282b",
                  lineHeight: 1,
                  letterSpacing: 1.5,
                  lineBreak: "noWrap"
                },
                children: GENOME[i]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                style: {
                  ...T.micro,
                  positionType: "absolute",
                  left: 8,
                  top: 8,
                  fontSize: 11,
                  color: lit ? "#d7a29b" : "#6b3a3a"
                },
                children: i === 0 ? "SC2091100704511836900420" : "SC2091100704517290361185"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                style: {
                  ...T.micro,
                  positionType: "absolute",
                  left: 262,
                  top: 8,
                  fontSize: 11,
                  color: lit ? "#d7a29b" : "#6b3a3a"
                },
                children: "07.10.2091"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("node", {
                style: {
                  ...FILL,
                  alignItems: "center",
                  padding: {
                    top: 56
                  }
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Figure, {
                  build: i,
                  height: 780,
                  color: lit ? C.cyan : "#3a7680",
                  accent: lit ? "#ffe4dc" : "#5a3236"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Mark, {
                lit
              }),
              lit ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(HotFrame, {
                bar: 22,
                cut: 50,
                step: 160
              }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(ColdFrame, {
                cut: 50,
                line: "#4a1c1f"
              })
            ]
          }, i);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Hint, {
              k: "mouse",
              label: "SELECT"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Hint, {
              k: "ESC",
              label: "BACK",
              onClick: back
            })
          ]
        })
      ]
    });
  }
  function Mark({ lit }) {
    const color = lit ? C.red : "#7a2b2b";
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 14,
        bottom: 14,
        flexDirection: "column",
        gap: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("svg", {
              viewBox: "0 0 20 20",
              style: {
                width: 20,
                height: 20
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("polygon", {
                points: [
                  10,
                  0,
                  12.5,
                  7.5,
                  20,
                  10,
                  12.5,
                  12.5,
                  10,
                  20,
                  7.5,
                  12.5,
                  0,
                  10,
                  7.5,
                  7.5
                ],
                fill: color
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
              style: {
                fontSize: 28,
                fontFamily: F.bold,
                color,
                lineBreak: "noWrap"
              },
              children: "SC91"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
          style: {
            ...T.micro,
            fontSize: 7,
            color
          },
          children: "BIOMETRIC TEMPLATE\nSTANDARD 91-A"
        })
      ]
    });
  }

  // src/screens/newgame/Difficulty.tsx
  var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
  var import_react12 = __toESM(require_react(), 1);
  function Difficulty({ character, onChange, next, back }) {
    const [hot, setHot] = (0, import_react12.useState)(Math.max(0, DIFFICULTIES.findIndex((d) => d.id === character.difficulty)));
    (0, import_react12.useEffect)(() => {
      bevy.dioramas.difficulty({
        level: hot
      });
    }, [
      hot
    ]);
    const hover = (i) => {
      if (i === hot) return;
      sfx("hover");
      setHot(i);
    };
    const pick = (i) => {
      onChange({
        ...character,
        difficulty: DIFFICULTIES[i].id
      });
      next();
    };
    useKeys((e) => {
      if (e.key === "Escape") back();
      else if (e.key === "ArrowLeft") hover(Math.max(0, hot - 1));
      else if (e.key === "ArrowRight") hover(Math.min(DIFFICULTIES.length - 1, hot + 1));
      else if (e.key === "Enter" || e.code === "KeyF") pick(hot);
    });
    useDebug("hover", (n) => setHot(Number(n)));
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(CenteredHeader, {
          title: "SELECT DIFFICULTY LEVEL"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 381,
            top: 107,
            width: 1159,
            height: 577
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
              style: {
                ...FILL,
                backgroundColor: "#0c0b12"
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("portal", {
              target: "card-difficulty",
              style: {
                ...FILL,
                cache: "never"
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(HotFrame, {
              bar: 22,
              cut: 22,
              step: 98
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
          style: {
            ...T.body,
            positionType: "absolute",
            left: 378,
            top: 706,
            width: 1180,
            fontSize: 27,
            lineHeight: 1.22
          },
          children: DIFFICULTY_TEXT[DIFFICULTIES[hot].id]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 366,
            top: 847,
            flexDirection: "row",
            gap: 10
          },
          children: DIFFICULTIES.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(LevelButton, {
            label: d.name,
            hot: i === hot,
            seed: i + 4,
            onEnter: () => hover(i),
            onClick: () => pick(i)
          }, d.id))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Hint, {
              k: "mouse",
              label: "SELECT"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Hint, {
              k: "ESC",
              label: "BACK",
              onClick: back
            })
          ]
        })
      ]
    });
  }
  var PLATE3 = [
    1,
    5,
    22,
    5,
    27,
    10,
    172,
    10,
    178,
    1,
    291,
    1,
    291,
    71,
    15,
    71,
    1,
    57
  ];
  function LevelButton({ label, hot, seed, onEnter, onClick }) {
    const line2 = hot ? "#f0524a" : "#5c1c1e";
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("button", {
      onPointerEnter: onEnter,
      onClick,
      style: {
        width: 292,
        height: 72,
        alignItems: "center",
        justifyContent: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("svg", {
          viewBox: "0 0 292 72",
          style: {
            positionType: "absolute",
            left: 0,
            top: 0,
            width: 292,
            height: 72,
            filter: hot ? {
              name: "shadow",
              params: {
                color: "rgba(255, 60, 52, 0.55)",
                offsetX: 0,
                offsetY: 0,
                spread: 10
              }
            } : void 0
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("polygon", {
              points: PLATE3,
              fill: hot ? "#6d2221" : "#0d0f16",
              stroke: line2,
              strokeWidth: hot ? 2 : 1.2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("rect", {
              x: 1,
              y: 34,
              width: 24,
              height: 4,
              fill: "none",
              stroke: line2,
              strokeWidth: 1
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
          style: {
            fontSize: 25,
            color: C.cyan,
            letterSpacing: 0.5,
            lineBreak: "noWrap"
          },
          children: label
        }),
        hot && /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            top: 78,
            width: 292,
            flexDirection: "column",
            gap: 2
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
              style: {
                flexDirection: "row",
                gap: 5
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Barcode, {
                  seed: 1,
                  width: 14,
                  height: 18
                }),
                /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Barcode, {
                  seed,
                  width: 254,
                  height: 18
                }),
                /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Barcode, {
                  seed: 2,
                  width: 14,
                  height: 18
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
              style: {
                flexDirection: "row",
                justifyContent: "spaceBetween"
              },
              children: [
                "REF",
                "5415210 1056845 51",
                "850541030 540454",
                "485151 59078709",
                "20JG8W4",
                "NC"
              ].map((t) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
                style: {
                  ...T.micro,
                  fontSize: 7,
                  color: C.red,
                  lineBreak: "noWrap"
                },
                children: t
              }, t))
            })
          ]
        })
      ]
    });
  }
  function CenteredHeader({ title: title2 }) {
    const left = 606;
    const width = 5 * 138 + 4 * 6;
    const rule = "rgba(255, 93, 81, 0.75)";
    const faint = "rgba(255, 93, 81, 0.35)";
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 60
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            width: left - 8,
            top: 44,
            height: 2,
            backgroundGradient: {
              type: "linear",
              angle: 90,
              stops: [
                {
                  color: faint
                },
                {
                  color: rule
                }
              ]
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
          style: {
            positionType: "absolute",
            left: left + width + 8,
            right: 0,
            top: 44,
            height: 2,
            backgroundGradient: {
              type: "linear",
              angle: 90,
              stops: [
                {
                  color: rule
                },
                {
                  color: faint
                }
              ]
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
          style: {
            positionType: "absolute",
            left,
            top: 50,
            flexDirection: "row",
            gap: 6
          },
          children: [
            0,
            1,
            2,
            3,
            4
          ].map((i) => /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
            style: {
              width: 138,
              height: 2,
              backgroundColor: C.redLine
            }
          }, i))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
          style: {
            positionType: "absolute",
            left,
            width,
            top: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(StepIcon, {
              kind: "difficulty"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 7,
                color: C.cyan,
                lineHeight: 1.1
              },
              children: "00100000\n01000111\n01001111"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
              style: T.title,
              children: title2
            })
          ]
        })
      ]
    });
  }

  // src/screens/newgame/Lifepath.tsx
  var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
  var import_react13 = __toESM(require_react(), 1);
  var CARD2 = {
    width: 374,
    height: 551,
    pitch: 448,
    left: 313,
    top: 169
  };
  function Lifepath({ character, onChange, next, back }) {
    const [hot, setHot] = (0, import_react13.useState)(Math.max(0, LIFEPATHS.findIndex((l) => l.id === character.lifepath)));
    const hover = (i) => {
      if (i === hot) return;
      sfx("hover");
      setHot(i);
    };
    const pick = (i) => {
      onChange({
        ...character,
        lifepath: LIFEPATHS[i].id
      });
      next();
    };
    useKeys((e) => {
      if (e.key === "Escape") back();
      else if (e.key === "ArrowLeft") hover(Math.max(0, hot - 1));
      else if (e.key === "ArrowRight") hover(Math.min(LIFEPATHS.length - 1, hot + 1));
      else if (e.key === "Enter" || e.code === "KeyF") pick(hot);
    });
    useDebug("hover", (n) => setHot(Number(n)));
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Chrome, {}),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Header, {
          title: "LIFEPATH",
          caption: "WHERE YOU COME FROM DECIDES WHO OPENS THE DOOR FOR YOU. SOME JOBS AND CONVERSATIONS IN SABLE CITY WILL CHANGE WITH THIS CHOICE.",
          icon: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(StepIcon, {
            kind: "lifepath"
          }),
          step: 0
        }),
        LIFEPATHS.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("button", {
          onPointerEnter: () => hover(i),
          onClick: () => pick(i),
          style: {
            positionType: "absolute",
            left: CARD2.left + i * CARD2.pitch,
            top: CARD2.top,
            width: CARD2.width,
            height: CARD2.height
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("text", {
              style: {
                positionType: "absolute",
                left: 9,
                top: -46,
                fontSize: 33,
                color: C.red,
                lineBreak: "noWrap"
              },
              children: l.name
            }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("node", {
              style: {
                ...FILL,
                backgroundColor: "#0c0b12"
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("portal", {
              target: `card-${l.id}`,
              style: {
                ...FILL,
                cache: "never"
              }
            }),
            i === hot ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(HotFrame, {
              bar: 20,
              cut: 46,
              step: 96
            }) : /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(ColdFrame, {}),
            i === hot && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("text", {
              style: {
                positionType: "absolute",
                left: -2,
                top: CARD2.height + 14,
                width: CARD2.width + 24,
                fontSize: 24,
                color: C.red,
                lineHeight: 1.18
              },
              children: LIFEPATH_TEXT[l.id]
            })
          ]
        }, l.id)),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Hint, {
              k: "mouse",
              label: "SELECT"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Hint, {
              k: "ESC",
              label: "BACK",
              onClick: back
            })
          ]
        })
      ]
    });
  }

  // src/screens/newgame/Summary.tsx
  var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
  var import_react14 = __toESM(require_react(), 1);
  var import_bevy_react8 = __toESM(require_bevy_react(), 1);
  var PANEL = "#cb403b";
  function Summary({ character, onChange, back, onStart }) {
    const [editing, setEditing] = (0, import_react14.useState)(false);
    const [done, setDone] = (0, import_react14.useState)(false);
    const enter = useEnter(40, 120, 360);
    const progress = (0, import_bevy_react8.useSharedValue)(0);
    (0, import_react14.useEffect)(() => {
      progress.value = (0, import_bevy_react8.withDelay)(350, (0, import_bevy_react8.withTiming)(1, {
        duration: 2400,
        easing: "easeInOut"
      }), (finished) => finished && setDone(true));
    }, [
      progress
    ]);
    const start = () => {
      sfx("confirm");
      onStart();
    };
    useKeys((e) => {
      if (editing) return;
      if (e.key === "Escape") back();
      else if (e.code === "KeyF" || e.key === "Enter") start();
    });
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Chrome, {}),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Header, {
          title: "SUMMARY",
          caption: "THE FILE IS OPEN. SABLE CITY WILL WRITE THE REST.",
          icon: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(StepIcon, {
            kind: "summary"
          }),
          step: 4
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(IdCard, {
          character,
          onChange,
          onEditing: setEditing,
          style: {
            positionType: "absolute",
            left: 420,
            top: 196
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
          style: {
            positionType: "absolute",
            right: 215,
            top: 360,
            ...enter,
            width: 592,
            flexDirection: "column",
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 6
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
                  style: {
                    flexDirection: "column",
                    gap: 2
                  },
                  children: [
                    22,
                    14,
                    20,
                    10
                  ].map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
                    style: {
                      width: w,
                      height: 2,
                      backgroundColor: C.redDim
                    }
                  }, i))
                }),
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
                  style: {
                    ...T.micro,
                    fontSize: 5.5,
                    color: C.redDim
                  },
                  children: "BIOMONITOR 7.1\nNEURAL LINK STABLE\nCERTIFIED SCPD UNIT\nNO USER SERVICEABLE PARTS"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
              style: {
                ...chamfer("#1b1017", 30, PANEL, 2),
                height: 181,
                flexDirection: "column",
                padding: {
                  left: 44,
                  right: 34,
                  top: 14,
                  bottom: 12
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
                  style: {
                    positionType: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 26,
                    backgroundColor: PANEL
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
                  style: {
                    positionType: "absolute",
                    right: -2,
                    top: 24,
                    bottom: 40,
                    width: 4,
                    backgroundColor: PANEL
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
                  style: {
                    fontSize: 29,
                    fontFamily: F.semibold,
                    color: C.red,
                    lineBreak: "noWrap"
                  },
                  children: "BIOMONITOR PANEL"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
                  style: {
                    fontSize: 21,
                    color: done ? "#d9483f" : "#b83b35",
                    margin: {
                      top: 14
                    },
                    lineBreak: "noWrap"
                  },
                  children: done ? "COMPLETE" : "CALIBRATING..."
                }),
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
                  style: {
                    height: 3,
                    margin: {
                      top: 10,
                      right: 96
                    },
                    backgroundColor: "#3a151a"
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
                    style: {
                      height: 3,
                      width: {
                        animated: (0, import_bevy_react8.interpolate)(progress, [
                          0,
                          1
                        ], [
                          0,
                          418
                        ])
                      },
                      backgroundColor: C.red
                    }
                  })
                }),
                /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
                  style: {
                    flexGrow: 1
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    alignItems: "flexEnd",
                    justifyContent: "spaceBetween"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
                      style: {
                        ...T.micro,
                        fontSize: 6.5,
                        color: C.red
                      },
                      children: "ONLY SCPD-CERTIFIED BIOTECHS AND CLASS-4 OFFICERS MAY\nCALIBRATE, ACCESS OR DISABLE THIS DEVICE."
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Percent, {
                      value: progress
                    })
                  ]
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(NavButtons, {
          onBack: back,
          onNext: start,
          next: "START"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Hints, {
          children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Hint, {
            k: "mouse",
            label: "SELECT"
          })
        })
      ]
    });
  }
  var DIGIT = 18;
  var EPS = 1e-4;
  function Percent({ value }) {
    const column = (digit) => {
      const input = [];
      const output = [];
      for (let k = 0; k < 100; k++) {
        input.push(k / 100, (k + 1) / 100 - EPS);
        output.push(-digit(k) * DIGIT, -digit(k) * DIGIT);
      }
      return (0, import_bevy_react8.interpolate)(value, [
        ...input,
        1
      ], [
        ...output,
        -digit(100) * DIGIT
      ]);
    };
    const digits = [
      (k) => Math.floor(k / 100),
      (k) => Math.floor(k / 10) % 10,
      (k) => k % 10
    ];
    const font = {
      fontSize: 19,
      fontFamily: F.bold,
      color: C.red,
      lineHeight: {
        px: DIGIT
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        margin: {
          bottom: 18
        }
      },
      children: [
        digits.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
          style: {
            width: 10.5,
            height: DIGIT,
            overflowY: "clip",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
            style: {
              ...font,
              textAlign: "center",
              transform: {
                translateY: {
                  animated: column(d)
                }
              }
            },
            children: "0\n1\n2\n3\n4\n5\n6\n7\n8\n9"
          })
        }, i)),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
          style: {
            ...font,
            lineBreak: "noWrap"
          },
          children: "%"
        })
      ]
    });
  }

  // src/screens/newgame/NewGame.tsx
  var STEPS = [
    "difficulty",
    "lifepath",
    "body",
    "appearance",
    "attributes",
    "summary"
  ];
  function NewGame({ character, onChange, onBack, onStart }) {
    const [step, setStep] = (0, import_react15.useState)(0);
    const props = {
      character,
      onChange,
      next: () => {
        sfx("click");
        setStep(Math.min(step + 1, STEPS.length - 1));
      },
      back: () => {
        sfx("back");
        if (step === 0) onBack();
        else setStep(step - 1);
      }
    };
    useDebug("step", (s) => setStep(Math.max(0, STEPS.indexOf(s))));
    useDebug("handle", (h) => onChange({
      ...character,
      handle: h
    }));
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("node", {
          style: {
            ...FILL,
            backgroundGradient: {
              type: "linear",
              angle: 180,
              stops: [
                {
                  color: "rgba(54, 17, 23, 0.93)"
                },
                {
                  color: "rgba(22, 13, 20, 0.92)",
                  position: "45%"
                },
                {
                  color: "rgba(5, 11, 16, 0.95)"
                }
              ]
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(EdgeRails, {}),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
          style: {
            ...FILL,
            morphFilter: {
              key: step,
              name: "glitchSwap"
            },
            transition: {
              morphFilter: {
                duration: 360,
                easing: "linear"
              }
            }
          },
          children: [
            step === 0 && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Difficulty, {
              ...props
            }),
            step === 1 && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Lifepath, {
              ...props
            }),
            step === 2 && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(BodyType, {
              ...props
            }),
            step === 3 && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Appearance, {
              ...props
            }),
            step === 4 && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Attributes, {
              ...props
            }),
            step === 5 && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Summary, {
              ...props,
              onStart
            })
          ]
        })
      ]
    });
  }

  // src/screens/saves/Saves.tsx
  var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
  var import_react16 = __toESM(require_react(), 1);

  // src/screens/saves/Row.tsx
  var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
  var ROW_WIDTH = 1035;
  var ROW_HEIGHT = 104;
  var ROW_PITCH = ROW_HEIGHT + 4;
  var TEXT_LEFT = 186;
  var PLATE4 = "rgba(13, 18, 27, 0.74)";
  var LINE2 = "rgba(255, 93, 81, 0.26)";
  function Slot({ index, selected, onSelect, onClick, children }) {
    const enter = useEnter(-28, 40 * Math.min(index, 8));
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("button", {
      onPointerEnter: onSelect,
      onClick,
      style: {
        ...chamfer(PLATE4, 16, selected ? C.red : LINE2, 2),
        width: ROW_WIDTH,
        height: ROW_HEIGHT,
        flexShrink: 0,
        flexDirection: "row",
        alignItems: "center",
        padding: {
          left: 1
        },
        ...enter
      },
      children
    });
  }
  function Thumb({ selected, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("node", {
      style: {
        ...chamfer("rgba(6, 8, 13, 0.6)", 14, selected ? C.red : LINE2, 1),
        width: 170,
        height: 96,
        alignItems: "center",
        justifyContent: "center"
      },
      children
    });
  }
  var line = {
    fontSize: 24,
    fontFamily: F.semibold,
    color: C.red,
    lineBreak: "noWrap"
  };
  function SaveRow({ save, index, selected, onSelect, onClick }) {
    const { lifepath } = save.character;
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(Slot, {
      index,
      selected,
      onSelect,
      onClick,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Thumb, {
          selected,
          children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("portal", {
            target: `shot-${lifepath}`,
            style: {
              width: 168,
              height: 94,
              cache: "never"
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("node", {
          style: {
            flexGrow: 1,
            height: "100%",
            flexDirection: "column",
            justifyContent: "spaceBetween",
            padding: {
              left: 15,
              right: 26,
              top: 14,
              bottom: 7
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
                  style: {
                    ...line,
                    color: C.cyan
                  },
                  children: save.quest
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
                  style: {
                    ...line,
                    margin: {
                      horizontal: 11
                    }
                  },
                  children: "-"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
                  style: line,
                  children: save.name
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("node", {
                  style: {
                    flexGrow: 1
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
                  style: line,
                  children: playtime(save.playtime)
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
                  style: {
                    ...line,
                    fontSize: 23
                  },
                  children: save.location
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("node", {
                  style: {
                    width: 27
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(LifepathIcon, {
                  lifepath
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
                  style: {
                    ...line,
                    fontSize: 23,
                    margin: {
                      left: 7
                    }
                  },
                  children: LIFEPATHS.find((l) => l.id === lifepath)?.name
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("text", {
                  style: {
                    ...line,
                    fontSize: 23,
                    margin: {
                      left: 28
                    }
                  },
                  children: [
                    "Level ",
                    save.level
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("node", {
                  style: {
                    flexGrow: 1
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
                  style: {
                    ...line,
                    fontSize: 23
                  },
                  children: save.date
                })
              ]
            })
          ]
        })
      ]
    });
  }
  function NewSaveRow({ selected, onSelect, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(Slot, {
      index: 0,
      selected,
      onSelect,
      onClick,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(Thumb, {
          selected,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Datashard, {
              width: 128
            }),
            /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("svg", {
              viewBox: "0 0 14 14",
              style: {
                positionType: "absolute",
                right: 30,
                top: 12,
                width: 14,
                height: 14
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("polyline", {
                  points: [
                    7,
                    0,
                    7,
                    14
                  ],
                  stroke: C.red,
                  strokeWidth: 1.4,
                  fill: "none"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("polyline", {
                  points: [
                    0,
                    7,
                    14,
                    7
                  ],
                  stroke: C.red,
                  strokeWidth: 1.4,
                  fill: "none"
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("text", {
          style: {
            ...line,
            fontSize: 29,
            alignSelf: "flexStart",
            margin: {
              left: 15,
              top: 15
            }
          },
          children: "New Save"
        })
      ]
    });
  }

  // src/screens/saves/Saves.tsx
  var LIST_TOP = 190;
  var LIST_HEIGHT = 7 * ROW_PITCH - 4;
  var GUTTER = 24;
  var QUESTIONS = {
    overwrite: "Write over this save?\nWhatever was on this shard gets flatlined.",
    delete: "Delete this save for good?\nThere is no backup. Nobody keeps one."
  };
  function Saves({ mode, saves, onLoad, onSave, onDelete, onClose }) {
    const saving = mode === "save";
    const slots = saving ? [
      null,
      ...saves
    ] : saves;
    const [selected, setSelected] = (0, import_react16.useState)(0);
    const [ask, setAsk] = (0, import_react16.useState)(null);
    const [scroll, setScroll] = (0, import_react16.useState)(0);
    const select2 = (i) => {
      if (i === selected) return;
      sfx("hover");
      setSelected(i);
    };
    const pick = (i) => {
      const save = slots[i];
      sfx("click");
      setSelected(i);
      if (!saving) {
        if (save) onLoad(save);
      } else if (save) {
        setAsk({
          kind: "overwrite",
          index: i
        });
      } else {
        onSave(null);
        setSelected(1);
      }
    };
    const askDelete = () => {
      if (!slots[selected]) return sfx("error");
      sfx("click");
      setAsk({
        kind: "delete",
        index: selected
      });
    };
    const answer = () => {
      const save = ask && slots[ask.index];
      if (!save) return;
      if (ask.kind === "overwrite") {
        onSave(save);
        setSelected(1);
      } else {
        onDelete(save);
        setSelected(Math.min(selected, slots.length - 2));
      }
      setAsk(null);
    };
    const close = () => {
      sfx("back");
      onClose();
    };
    useKeys((e) => {
      if (modalOpen()) return;
      if (e.key === "Escape") close();
      else if (e.code === "KeyX") askDelete();
    });
    useDebug("hover", (i) => setSelected(Number(i)));
    useDebug("pick", (i) => pick(Number(i)));
    useDebug("delete", askDelete);
    return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("node", {
      style: {
        ...FILL,
        backgroundColor: "rgba(3, 5, 9, 0.42)"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Decor, {}),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: LIST_TOP,
            flexDirection: "column",
            alignItems: "center"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("node", {
            onScroll: (e) => setScroll(e.scrollTop),
            style: {
              width: ROW_WIDTH + 2 * GUTTER,
              height: LIST_HEIGHT,
              padding: {
                left: GUTTER
              },
              flexDirection: "column",
              gap: ROW_PITCH - ROW_HEIGHT,
              overflowY: "scroll",
              scrollbarWidth: GUTTER,
              scrollbar: {
                track: {
                  backgroundColor: "rgba(255, 93, 81, 0.14)"
                },
                thumb: {
                  backgroundColor: C.red,
                  hover: {
                    backgroundColor: C.redHi
                  }
                },
                thickness: 3
              }
            },
            children: [
              slots.map((save, i) => save ? /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(SaveRow, {
                save,
                index: i,
                selected: i === selected,
                onSelect: () => select2(i),
                onClick: () => pick(i)
              }, save.id) : /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(NewSaveRow, {
                selected: i === selected,
                onSelect: () => select2(i),
                onClick: () => pick(i)
              }, "new")),
              slots.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
                style: {
                  fontSize: 24,
                  color: C.redDim,
                  margin: {
                    top: 40
                  }
                },
                children: "No save data on this deck."
              })
            ]
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Hint, {
              k: "mouse",
              label: "Select"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Hint, {
              k: "X",
              label: "Delete Save",
              onClick: askDelete
            }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Hint, {
              k: "ESC",
              label: "Close",
              onClick: close
            })
          ]
        }),
        ask && /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
          style: {
            ...FILL,
            backgroundColor: "rgba(1, 2, 5, 0.88)",
            flexDirection: "column",
            alignItems: "center",
            focusPolicy: "block"
          },
          hoverStyle: {},
          children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
            style: {
              width: ROW_WIDTH,
              margin: {
                top: LIST_TOP + ask.index * ROW_PITCH - scroll + 1
              }
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Plate, {
              text: QUESTIONS[ask.kind],
              icon: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Datashard, {
                width: 118
              }),
              onConfirm: answer,
              onCancel: () => setAsk(null),
              style: {
                margin: {
                  left: TEXT_LEFT - 8
                }
              }
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Header2, {
          title: saving ? "SAVE GAME" : "LOAD GAME"
        })
      ]
    });
  }
  function Header2({ title: title2 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(import_jsx_runtime27.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("svg", {
          viewBox: "0 0 1920 100",
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 100
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("path", {
            d: "M 200 61.7 Q 1041.7 115.3 1878 47",
            stroke: C.red,
            strokeWidth: 1.6,
            fill: "none"
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(ProtocolStamp, {
          style: {
            left: 36,
            top: 4
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 36,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 4
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("svg", {
              viewBox: "0 0 26 26",
              style: {
                width: 26,
                height: 26
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("polygon", {
                  points: [
                    13,
                    1.5,
                    24.5,
                    13,
                    13,
                    24.5,
                    1.5,
                    13
                  ],
                  stroke: C.red,
                  strokeWidth: 2,
                  fill: "none"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("rect", {
                  x: 6,
                  y: 10.5,
                  width: 14,
                  height: 5,
                  rx: 1,
                  fill: C.red
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 5,
                color: C.red,
                lineHeight: 1.15
              },
              children: "0110 101\n1001 110\n0111 001\n1010 011"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
              style: {
                fontSize: 34,
                fontFamily: F.semibold,
                color: C.red,
                lineBreak: "noWrap",
                margin: {
                  left: 4,
                  top: 6
                }
              },
              children: title2
            })
          ]
        })
      ]
    });
  }
  var DASHES = Array.from({
    length: 135
  }, (_, i) => `M0 ${i * 8}h2v4h-2z`).join("");
  function Decor() {
    const micro = {
      ...T.micro,
      fontSize: 11,
      color: C.redDim
    };
    const rail = (side3) => /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("svg", {
      style: {
        positionType: "absolute",
        [side3]: 18,
        top: 0,
        width: 2,
        height: 1080
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("path", {
        d: DASHES,
        fill: "rgba(255, 93, 81, 0.2)"
      })
    });
    return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)(import_jsx_runtime27.Fragment, {
      children: [
        rail("left"),
        rail("right"),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 13,
            top: 425,
            width: 6,
            height: 6,
            backgroundColor: C.redDim
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 27,
            top: 423,
            width: 16,
            height: 17,
            backgroundColor: C.redDeep,
            alignItems: "center",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
            style: {
              ...micro,
              fontFamily: F.bold,
              fontSize: 12,
              color: "#ffb3ad"
            },
            children: "1"
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
          style: {
            ...micro,
            fontSize: 13,
            lineBreak: "noWrap",
            positionType: "absolute",
            left: 16 - 150,
            top: 574,
            width: 300,
            textAlign: "center",
            transform: {
              rotate: -90
            }
          },
          children: "00032 05 54 08 CP 00032 05 54 08 CP"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
          style: {
            ...micro,
            positionType: "absolute",
            left: 52,
            bottom: 26,
            transform: {
              rotate: -2
            }
          },
          children: "00032 05 54 08 CP  00032 05 54 08 CP\n00032 05 54 08"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            bottom: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 12
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
              style: {
                width: 6,
                height: 6,
                backgroundColor: C.redDim
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
              style: {
                width: 16,
                height: 16,
                border: 1,
                borderColor: C.redDim,
                alignItems: "center",
                justifyContent: "center"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
                style: {
                  ...micro,
                  fontFamily: F.bold,
                  fontSize: 10
                },
                children: "B"
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
              style: {
                ...micro,
                margin: {
                  left: 36
                }
              },
              children: "SBL 102 TNK 151 CC10 A55"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
              style: micro,
              children: "10 A55 \u2190"
            })
          ]
        })
      ]
    });
  }

  // src/screens/settings/Settings.tsx
  var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
  var import_react17 = __toESM(require_react(), 1);

  // src/screens/settings/ControlScheme.tsx
  var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);

  // src/screens/settings/rows.tsx
  var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
  var WIDTH = 450;
  var FRAME = "#55161c";
  var FRAME_HOT = "#a8322f";
  var VALUE = {
    fontSize: 21,
    color: C.cyan,
    lineBreak: "noWrap"
  };
  var STAGE = {
    positionType: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1920,
    margin: {
      left: -960
    }
  };
  function Backdrop() {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
      style: {
        positionType: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            {
              color: "rgba(56, 19, 27, 0.98)"
            },
            {
              color: "rgba(33, 13, 21, 0.98)",
              position: "22%"
            },
            {
              color: "rgba(13, 8, 15, 0.98)",
              position: "45%"
            },
            {
              color: "rgba(5, 9, 14, 0.98)",
              position: "65%"
            },
            {
              color: "rgba(6, 14, 19, 0.98)"
            }
          ]
        }
      }
    });
  }
  function SubHeader({ title: title2 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(import_jsx_runtime28.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 36,
            right: 36,
            top: 70,
            height: 2,
            backgroundColor: "rgba(255, 93, 81, 0.32)"
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 32,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("svg", {
              viewBox: "0 0 20 20",
              style: {
                width: 30,
                height: 30
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("polygon", {
                  points: [
                    10,
                    1,
                    19,
                    10,
                    10,
                    19,
                    1,
                    10
                  ],
                  fill: "none",
                  stroke: C.red,
                  strokeWidth: 1.6
                }),
                /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("circle", {
                  cx: 7.5,
                  cy: 8.5,
                  r: 1.6,
                  fill: "none",
                  stroke: C.red
                }),
                /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("circle", {
                  cx: 12.5,
                  cy: 11.5,
                  r: 1.6,
                  fill: "none",
                  stroke: C.red
                }),
                /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("line", {
                  x1: 9,
                  y1: 9.5,
                  x2: 11,
                  y2: 10.5,
                  stroke: C.red
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 6,
                lineHeight: 1.1
              },
              children: "4848181\n4155681\nB00L364\n3061233"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
              style: {
                ...T.title,
                fontSize: 30
              },
              children: title2
            })
          ]
        })
      ]
    });
  }
  function Section({ label }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
      style: {
        flexDirection: "column",
        margin: {
          top: 7,
          bottom: 8
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
          style: {
            height: 2,
            backgroundGradient: {
              type: "linear",
              angle: 90,
              stops: [
                {
                  color: "#2c1a24"
                },
                {
                  color: "#34847a",
                  position: "25%"
                },
                {
                  color: "#2a3e66",
                  position: "48%"
                },
                {
                  color: "#2c1a4a"
                }
              ]
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
          style: {
            height: 40,
            alignItems: "center",
            padding: {
              left: 11
            },
            backgroundColor: "rgba(40, 46, 70, 0.22)"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
            style: T.section,
            children: label
          })
        })
      ]
    });
  }
  function SettingRow({ row, values, listening, onChange, onListen }) {
    if (row.kind === "section") return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Section, {
      label: row.label
    });
    let widget;
    switch (row.kind) {
      case "select":
        widget = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Selector, {
          options: row.options,
          value: Number(values[row.id]),
          onChange: (v) => onChange(row.id, v)
        });
        break;
      case "toggle":
        widget = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Toggle, {
          value: values[row.id] === true,
          onChange: (v) => onChange(row.id, v)
        });
        break;
      case "slider":
        widget = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(SliderBar, {
          row,
          value: Number(values[row.id]),
          onChange: (v) => onChange(row.id, v)
        });
        break;
      case "key":
        widget = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(KeyBind, {
          code: String(values[row.id]),
          listening: listening === row.id,
          onListen: () => onListen(row.id)
        });
        break;
      case "info":
        widget = /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Info, {
          value: row.value
        });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(RowFrame, {
      label: row.label,
      children: widget
    });
  }
  function RowFrame({ label, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
      onPointerEnter: () => sfx("hover"),
      style: {
        height: 47,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        padding: {
          left: 20,
          right: 25
        }
      },
      hoverStyle: {
        backgroundColor: "rgba(255, 93, 81, 0.05)"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
          style: {
            ...T.label,
            margin: {
              bottom: 14
            }
          },
          children: label
        }),
        children
      ]
    });
  }
  function plate(line2 = FRAME) {
    return {
      ...chamfer(C.field, 10, line2, 1),
      width: WIDTH,
      height: 40
    };
  }
  function Selector({ options, value, onChange }) {
    const step = (d) => {
      sfx("click");
      onChange((value + d + options.length) % options.length);
    };
    const pip = Math.min(20, (280 - 4 * (options.length - 1)) / options.length);
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
      style: {
        ...plate(),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "spaceBetween",
        padding: {
          horizontal: 21
        }
      },
      hoverStyle: plate(FRAME_HOT),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(ArrowButton, {
          dir: "left",
          onClick: () => step(-1)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
          style: {
            ...VALUE,
            margin: {
              bottom: 5
            }
          },
          children: options[value]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(ArrowButton, {
          dir: "right",
          onClick: () => step(1)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            bottom: 5,
            flexDirection: "row",
            justifyContent: "center",
            gap: 4
          },
          children: options.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
            style: {
              width: pip,
              height: 2,
              backgroundColor: i === value ? "#e94a42" : "#4a1d24"
            }
          }, i))
        })
      ]
    });
  }
  function ArrowButton({ dir, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", {
      onClick,
      style: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center"
      },
      hoverStyle: {
        backgroundColor: "rgba(94, 246, 255, 0.08)"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Arrow, {
        dir
      })
    });
  }
  function Toggle({ value, onChange }) {
    const half = (on2) => {
      const lit = value === on2;
      const [fill, line2, ink] = on2 ? lit ? [
        C.cyan,
        C.cyanHi,
        "#06141a"
      ] : [
        "#0a1d20",
        "#0f2a2f",
        "#12353b"
      ] : lit ? [
        "#932d2a",
        "#c73d38",
        "#ff6f64"
      ] : [
        "#1a0c10",
        "#2a0e13",
        "#3d1116"
      ];
      return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", {
        onClick: () => {
          sfx("click");
          onChange(on2);
        },
        style: {
          ...chamfer(fill, 10, line2, 1, on2 ? "br" : "bl"),
          width: 222,
          height: 38,
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
          style: {
            fontSize: 20,
            fontFamily: F.bold,
            color: ink,
            letterSpacing: 0.5
          },
          children: on2 ? "ON" : "OFF"
        })
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
      style: {
        width: WIDTH,
        flexDirection: "row",
        justifyContent: "spaceBetween"
      },
      children: [
        half(false),
        half(true)
      ]
    });
  }
  function SliderBar({ row, value, onChange }) {
    const { min, max, step } = row;
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
    const set = (e) => {
      const t = Math.min(1, Math.max(0, (e.x * WIDTH - 20) / (WIDTH - 40)));
      const next = Number((Math.round((min + t * (max - min)) / step) * step).toFixed(decimals));
      if (next !== value) onChange(next);
    };
    const left = (value - min) / (max - min) * (WIDTH - 42);
    const under = Math.abs(left + 20 - (WIDTH - 2) / 2) < 40;
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
      onPointerDown: set,
      onPointerMove: set,
      style: {
        ...plate(),
        alignItems: "center",
        justifyContent: "center"
      },
      hoverStyle: plate(FRAME_HOT),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
          style: {
            ...chamfer("#dd4643", 10),
            positionType: "absolute",
            left,
            top: 0,
            bottom: 0,
            width: 40
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
          style: {
            ...VALUE,
            color: under ? C.white : C.cyan
          },
          children: value.toFixed(decimals)
        })
      ]
    });
  }
  function KeyBind({ code, listening, onListen }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("button", {
      onClick: () => {
        sfx("click");
        onListen();
      },
      style: {
        ...plate(listening ? C.cyan : FRAME),
        alignItems: "center",
        justifyContent: "center"
      },
      hoverStyle: plate(listening ? C.cyan : FRAME_HOT),
      children: listening ? /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
        style: {
          ...VALUE,
          fontFamily: F.semibold,
          letterSpacing: 1
        },
        children: "PRESS A KEY"
      }) : code.startsWith("Mouse") ? /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
        style: {
          flexDirection: "row",
          alignItems: "flexStart",
          gap: 1
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(MouseIcon, {
            size: 28
          }),
          code.includes("Wheel") && /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("svg", {
            viewBox: "0 0 8 6",
            style: {
              width: 8,
              height: 6
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("polygon", {
              points: code.endsWith("Up") ? [
                0,
                6,
                4,
                0,
                8,
                6
              ] : [
                0,
                0,
                8,
                0,
                4,
                6
              ],
              fill: C.cyan
            })
          })
        ]
      }) : /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(Keycap, {
        k: keyLabel(code)
      })
    });
  }
  function Info({ value }) {
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("node", {
      style: {
        ...chamfer("#120e18", 10, "#b8aeb3", 1),
        width: WIDTH,
        height: 40,
        alignItems: "center",
        justifyContent: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
          style: {
            ...VALUE,
            color: "#cdc6ca",
            margin: {
              bottom: 5
            }
          },
          children: value
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("node", {
          style: {
            positionType: "absolute",
            bottom: 5,
            width: 20,
            height: 2,
            backgroundColor: "#e94a42"
          }
        })
      ]
    });
  }
  var KEY_NAMES = {
    Space: "space",
    Enter: "enter",
    ShiftLeft: "SHIFT",
    ShiftRight: "SHIFT",
    ControlLeft: "CTRL",
    ControlRight: "CTRL",
    AltLeft: "ALT",
    AltRight: "ALT",
    Tab: "TAB",
    Backspace: "BKSP",
    CapsLock: "CAPS",
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Backslash: "\\",
    Backquote: "`"
  };
  function keyLabel(code) {
    return KEY_NAMES[code] ?? code.replace(/^(Key|Digit)/, "").replace(/^Numpad/, "NUM").toUpperCase().slice(0, 5);
  }

  // src/screens/settings/ControlScheme.tsx
  function ControlScheme({ onBack }) {
    const back = () => {
      sfx("back");
      onBack();
    };
    useKeys((e) => {
      if (e.key === "Escape") back();
    });
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Backdrop, {}),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(SubHeader, {
          title: "CONTROL SCHEME"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(EdgeRails, {}),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("node", {
          style: STAGE,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Gamepad, {}),
            CALLOUTS.map(([side3, x, y, icon, lines]) => /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Label2, {
              side: side3,
              x,
              y,
              icon,
              children: lines
            }, `${x} ${y}`))
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Hints, {
          children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Hint, {
            k: "ESC",
            label: "Close",
            onClick: back
          })
        })
      ]
    });
  }
  var CALLOUTS = [
    [
      "left",
      730,
      180,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "view"
      }),
      [
        "Holo Map"
      ]
    ],
    [
      "right",
      1186,
      180,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "menu"
      }),
      [
        "Pause Menu"
      ]
    ],
    [
      "left",
      500,
      248,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Tag, {
        k: "LB"
      }),
      [
        "Ping Scan",
        "Scanner Mode (Hold)"
      ]
    ],
    [
      "left",
      500,
      338,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Tag, {
        k: "LT"
      }),
      [
        "(Melee) Guard",
        "(Ranged) Aim"
      ]
    ],
    [
      "left",
      500,
      448,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Tag, {
        k: "LS"
      }),
      [
        "Sprint"
      ]
    ],
    [
      "left",
      500,
      490,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Tag, {
        k: "LS+RS"
      }),
      [
        "Photo Mode"
      ]
    ],
    [
      "left",
      500,
      534,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "stick"
      }),
      [
        "Move"
      ]
    ],
    [
      "left",
      500,
      600,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "dpad"
      }),
      [
        "(Dialogue) Up",
        "Use Consumable",
        "(Aiming) Zoom In"
      ]
    ],
    [
      "left",
      500,
      708,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "dpad"
      }),
      [
        "(Dialogue) Down",
        "(Aiming) Zoom Out",
        "Cycle Objective"
      ]
    ],
    [
      "left",
      500,
      820,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "dpad"
      }),
      [
        "Messages"
      ]
    ],
    [
      "left",
      500,
      868,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "dpad"
      }),
      [
        "Summon Vehicle"
      ]
    ],
    [
      "right",
      1414,
      236,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Tag, {
        k: "RB"
      }),
      [
        "Use Combat Implant",
        "Aim Combat Implant (Hold)"
      ]
    ],
    [
      "right",
      1414,
      315,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Tag, {
        k: "RT"
      }),
      [
        "(Ranged) Fire",
        "(Melee) Light Strike",
        "(Melee) Heavy Strike (Hold)"
      ]
    ],
    [
      "right",
      1414,
      447,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "west"
      }),
      [
        "Interact",
        "Reload"
      ]
    ],
    [
      "right",
      1414,
      517,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "north"
      }),
      [
        "Draw Weapon",
        "Holster Weapon (Double-Tap)"
      ]
    ],
    [
      "right",
      1414,
      590,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "north"
      }),
      [
        "Quick Access Menu (Hold)"
      ]
    ],
    [
      "right",
      1414,
      632,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "south"
      }),
      [
        "Jump"
      ]
    ],
    [
      "right",
      1414,
      675,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "east"
      }),
      [
        "Crouch",
        "Dodge (Double-Tap)"
      ]
    ],
    [
      "right",
      1314,
      751,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Tag, {
        k: "RS"
      }),
      [
        "Quick Melee Attack",
        "(Scanning) Mark Target"
      ]
    ],
    [
      "right",
      1314,
      820,
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Small, {
        glyph: "stick"
      }),
      [
        "Look Around"
      ]
    ]
  ];
  function Label2({ x, y, side: side3, icon, children }) {
    const left = side3 === "left";
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("node", {
      style: {
        positionType: "absolute",
        top: y - 16,
        ...left ? {
          right: 1920 - x
        } : {
          left: x
        },
        flexDirection: left ? "row" : "rowReverse",
        alignItems: "flexStart",
        gap: 10
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("node", {
          style: {
            flexDirection: "column",
            alignItems: left ? "flexEnd" : "flexStart"
          },
          children: children.map((line2) => /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("text", {
            style: {
              ...T.label,
              lineHeight: 1.4
            },
            children: line2
          }, line2))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("node", {
          style: {
            height: 31,
            alignItems: "center"
          },
          children: icon
        })
      ]
    });
  }
  function Tag({ k }) {
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("node", {
      style: {
        height: 18,
        minWidth: 26,
        padding: {
          horizontal: 3
        },
        borderRadius: 3,
        backgroundColor: C.cyan,
        alignItems: "center",
        justifyContent: "center"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("text", {
        style: {
          fontSize: 11,
          fontFamily: F.bold,
          color: "#06141a",
          lineBreak: "noWrap"
        },
        children: k
      })
    });
  }
  function Small({ glyph }) {
    const ink = "#06141a";
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("svg", {
      viewBox: "0 0 24 24",
      style: {
        width: 24,
        height: 24
      },
      children: glyph === "dpad" ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("polygon", {
        points: PLUS(12, 12, 4, 10),
        fill: "none",
        stroke: C.cyan,
        strokeWidth: 1.8
      }) : glyph === "stick" ? /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(import_jsx_runtime29.Fragment, {
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
            cx: 12,
            cy: 12,
            r: 10.5,
            fill: "none",
            stroke: C.cyan,
            strokeWidth: 1.6
          }),
          /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
            cx: 12,
            cy: 12,
            r: 6,
            fill: C.cyan
          })
        ]
      }) : /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(import_jsx_runtime29.Fragment, {
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
            cx: 12,
            cy: 12,
            r: 10.5,
            fill: C.cyan
          }),
          /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FaceGlyph, {
            glyph,
            cx: 12,
            cy: 12,
            size: 5,
            color: ink
          })
        ]
      })
    });
  }
  function FaceGlyph({ glyph, cx, cy, size: s, color }) {
    const stroke = {
      stroke: color,
      strokeWidth: s * 0.4,
      fill: "none"
    };
    switch (glyph) {
      case "north":
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("line", {
          x1: cx,
          y1: cy - s,
          x2: cx,
          y2: cy + s,
          ...stroke
        });
      case "east":
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("line", {
          x1: cx - s,
          y1: cy,
          x2: cx + s,
          y2: cy,
          ...stroke
        });
      case "south":
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("polyline", {
          points: [
            cx - s,
            cy - s * 0.5,
            cx,
            cy + s * 0.6,
            cx + s,
            cy - s * 0.5
          ],
          ...stroke
        });
      case "west":
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("rect", {
          x: cx - s * 0.7,
          y: cy - s * 0.7,
          width: s * 1.4,
          height: s * 1.4,
          ...stroke
        });
      case "view":
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("rect", {
          x: cx - s,
          y: cy - s * 0.6,
          width: s * 2,
          height: s * 1.2,
          rx: s * 0.3,
          ...stroke
        });
      case "menu":
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(import_jsx_runtime29.Fragment, {
          children: [
            -0.5,
            0,
            0.5
          ].map((d) => /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("line", {
            x1: cx - s * 0.8,
            y1: cy + d * s,
            x2: cx + s * 0.8,
            y2: cy + d * s,
            ...stroke
          }, d))
        });
      default:
        return null;
    }
  }
  function PLUS(cx, cy, w, l) {
    return [
      [
        -w,
        -l
      ],
      [
        w,
        -l
      ],
      [
        w,
        -w
      ],
      [
        l,
        -w
      ],
      [
        l,
        w
      ],
      [
        w,
        w
      ],
      [
        w,
        l
      ],
      [
        -w,
        l
      ],
      [
        -w,
        w
      ],
      [
        -l,
        w
      ],
      [
        -l,
        -w
      ],
      [
        -w,
        -w
      ]
    ].flatMap(([x, y]) => [
      cx + x,
      cy + y
    ]);
  }
  var BODY = "M960 352 L1098 352 C1140 350 1172 362 1188 392 C1222 458 1248 570 1256 650 C1262 712 1240 738 1208 730 C1182 724 1162 700 1140 664 C1116 626 1090 612 1052 612 L868 612 C830 612 804 626 780 664 C758 700 738 724 712 730 C680 738 658 712 664 650 C672 570 698 458 732 392 C748 362 780 350 822 352 Z";
  var FACE = [
    [
      "north",
      1104,
      412
    ],
    [
      "west",
      1070,
      446
    ],
    [
      "east",
      1138,
      446
    ],
    [
      "south",
      1104,
      480
    ]
  ];
  var WIRES = [
    [
      548,
      248,
      712,
      248,
      806,
      344
    ],
    [
      522,
      448,
      796,
      448
    ],
    [
      530,
      600,
      810,
      600,
      866,
      550
    ],
    [
      742,
      180,
      874,
      180,
      874,
      412,
      912,
      440
    ],
    [
      1384,
      236,
      1232,
      236,
      1118,
      344
    ],
    [
      1386,
      472,
      1150,
      472,
      1122,
      478
    ],
    [
      1290,
      748,
      1240,
      748,
      1060,
      560
    ],
    [
      1176,
      180,
      1046,
      180,
      1046,
      412,
      1008,
      440
    ]
  ];
  function Gamepad() {
    const red = C.red;
    const dim = "rgba(255, 93, 81, 0.45)";
    const stick = (cx, cy) => /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(import_jsx_runtime29.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
          cx,
          cy,
          r: 40,
          fill: "none",
          stroke: dim,
          strokeWidth: 1.5
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
          cx,
          cy,
          r: 31,
          fill: "none",
          stroke: red,
          strokeWidth: 2.2
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
          cx,
          cy,
          r: 22,
          fill: "none",
          stroke: red,
          strokeWidth: 1.5
        })
      ]
    });
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("svg", {
      viewBox: "0 0 1920 1080",
      style: {
        positionType: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080
      },
      children: [
        WIRES.map((points, i) => /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("polyline", {
          points,
          fill: "none",
          stroke: C.cyanDim,
          strokeWidth: 1.4
        }, i)),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("path", {
          d: BODY,
          fill: "none",
          stroke: red,
          strokeWidth: 2.4,
          strokeLinejoin: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("g", {
          transform: "translate(960 500) scale(0.955 0.94) translate(-960 -500)",
          children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("path", {
            d: BODY,
            fill: "none",
            stroke: dim,
            strokeWidth: 1.4
          })
        }),
        [
          1,
          -1
        ].map((side3) => /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("g", {
          transform: side3 < 0 ? "translate(1920 0) scale(-1 1)" : void 0,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("path", {
              d: "M1098 346 C1112 332 1150 326 1176 338 C1186 343 1191 351 1190 360",
              fill: "none",
              stroke: red,
              strokeWidth: 2.2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("path", {
              d: "M1112 330 C1118 312 1146 306 1162 314 L1170 334",
              fill: "none",
              stroke: dim,
              strokeWidth: 1.6
            })
          ]
        }, side3)),
        stick(838, 448),
        stick(1030, 532),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
          cx: 893,
          cy: 532,
          r: 40,
          fill: "none",
          stroke: dim,
          strokeWidth: 1.5
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("polygon", {
          points: PLUS(893, 532, 11, 30),
          fill: "none",
          stroke: red,
          strokeWidth: 2.2
        }),
        FACE.map(([glyph, cx, cy]) => /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("g", {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
              cx,
              cy,
              r: 16,
              fill: "none",
              stroke: red,
              strokeWidth: 2.2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FaceGlyph, {
              glyph,
              cx,
              cy,
              size: 6,
              color: red
            })
          ]
        }, glyph)),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
          cx: 922,
          cy: 446,
          r: 11,
          fill: "none",
          stroke: red,
          strokeWidth: 1.6
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FaceGlyph, {
          glyph: "view",
          cx: 922,
          cy: 446,
          size: 5,
          color: red
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("circle", {
          cx: 998,
          cy: 446,
          r: 11,
          fill: "none",
          stroke: red,
          strokeWidth: 1.6
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(FaceGlyph, {
          glyph: "menu",
          cx: 998,
          cy: 446,
          size: 5,
          color: red
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("rect", {
          x: 950,
          y: 474,
          width: 20,
          height: 11,
          rx: 3,
          fill: "none",
          stroke: red,
          strokeWidth: 1.6
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("polygon", {
          points: [
            960,
            372,
            982,
            394,
            960,
            416,
            938,
            394
          ],
          fill: red
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("polyline", {
          points: [
            948,
            404,
            972,
            384
          ],
          fill: "none",
          stroke: "#120708",
          strokeWidth: 3
        })
      ]
    });
  }

  // src/screens/settings/Gamma.tsx
  var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
  function Gamma({ onBack }) {
    const gamma = Number(useSettings().gamma);
    const back = () => {
      sfx("back");
      onBack();
    };
    useKeys((e) => {
      if (e.key === "Escape") back();
    });
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Backdrop, {}),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(SubHeader, {
          title: "GAMMA CORRECTION"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(EdgeRails, {}),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("node", {
          style: STAGE,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(TestImage, {
              gamma
            }),
            /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("text", {
              style: {
                positionType: "absolute",
                left: 0,
                right: 0,
                top: 764,
                fontSize: 25,
                fontFamily: F.semibold,
                color: C.red,
                textAlign: "center"
              },
              children: "Raise or lower the gamma until the mark on the left is only just visible."
            }),
            /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
              style: {
                positionType: "absolute",
                left: 510,
                top: 827,
                width: 925,
                flexDirection: "column"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(RowFrame, {
                label: GAMMA.label,
                children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(SliderBar, {
                  row: GAMMA,
                  value: gamma,
                  onChange: (v) => setSetting(GAMMA.id, v)
                })
              })
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Hint, {
              k: "mouse",
              label: "SELECT"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Hint, {
              k: "ESC",
              label: "BACK",
              onClick: back
            })
          ]
        })
      ]
    });
  }
  var SLICES = [
    [
      0.36,
      "#0a0a0a"
    ],
    [
      0.68,
      "#404040"
    ],
    [
      1,
      "#ffffff"
    ]
  ];
  function TestImage({ gamma }) {
    const width = 950;
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(import_jsx_runtime30.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
          style: {
            ...chamfer(C.red, 8, void 0, 1, "tl"),
            positionType: "absolute",
            left: 329,
            top: 200,
            width: 8,
            height: 536
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 335,
            top: 103,
            width: 1250,
            height: 633,
            border: {
              top: 2,
              left: 2,
              bottom: 3
            },
            borderColor: C.red
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("node", {
            style: {
              width: "100%",
              height: "100%",
              backgroundColor: "#000000",
              flexDirection: "column",
              alignItems: "center",
              padding: {
                top: 158,
                right: 30
              },
              filter: {
                name: "gamma",
                params: {
                  value: gamma
                }
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
                style: {
                  width,
                  height: width / WORDMARK_ASPECT + 40
                },
                children: SLICES.map(([end, color], i) => {
                  const start = i === 0 ? 0 : SLICES[i - 1][0];
                  return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
                    style: {
                      positionType: "absolute",
                      left: start * width,
                      width: (end - start) * width,
                      top: 0,
                      bottom: 0,
                      overflowX: "clip",
                      overflowY: "clip"
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Mark2, {
                      width,
                      color,
                      style: {
                        left: -start * width
                      }
                    })
                  }, color);
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
                style: {
                  positionType: "absolute",
                  left: 627,
                  bottom: 0,
                  width: 7,
                  height: 56,
                  border: {
                    top: 1,
                    left: 1,
                    right: 1
                  },
                  borderColor: C.red
                }
              })
            ]
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
          style: {
            ...chamfer(C.red, 22, void 0, 1, "br"),
            positionType: "absolute",
            left: 1583,
            top: 103,
            width: 22,
            height: 633
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
            style: {
              positionType: "absolute",
              left: 2,
              top: 132,
              height: 370,
              width: 1,
              backgroundColor: "#3a1014"
            }
          })
        })
      ]
    });
  }
  function Mark2({ width, color, style }) {
    const height2 = width / WORDMARK_ASPECT;
    const digit = width * 0.052;
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("node", {
      style: {
        positionType: "absolute",
        top: 0,
        width,
        height: height2 + 40,
        ...style
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("svg", {
          viewBox: WORDMARK_VIEWBOX,
          style: {
            width,
            height: height2
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("path", {
            d: WORDMARK_PATH,
            fill: color
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
          style: {
            positionType: "absolute",
            left: width * 0.36,
            top: height2 * 0.8,
            flexDirection: "row",
            alignItems: "flexEnd",
            gap: digit * 0.5
          },
          children: [
            "2",
            "0",
            "9",
            "1"
          ].map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("node", {
            style: {
              flexDirection: "row",
              alignItems: "flexEnd",
              gap: digit * 0.5
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("text", {
                style: {
                  fontFamily: F.semibold,
                  fontSize: digit,
                  color,
                  lineBreak: "noWrap"
                },
                children: d
              }),
              i < 3 && /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
                style: {
                  width: digit * 1.6,
                  height: 2,
                  margin: {
                    bottom: digit * 0.22
                  },
                  backgroundColor: color
                }
              })
            ]
          }, i))
        })
      ]
    });
  }

  // src/screens/settings/Settings.tsx
  function change(id, value) {
    if (id === "preset") setSettings({
      preset: value,
      ...PRESETS[Number(value)]
    });
    else if (id in PRESETS[0]) setSettings({
      [id]: value,
      preset: CUSTOM
    });
    else setSetting(id, value);
  }
  function Settings({ onClose }) {
    const [tab, setTab] = (0, import_react17.useState)("sound");
    const [sub, setSub] = (0, import_react17.useState)(null);
    const [listening, setListening] = (0, import_react17.useState)(null);
    const values = useSettings();
    const index = TABS.findIndex((t) => t.id === tab);
    const rows = TABS[index].rows;
    const pick = (id) => {
      if (id === tab) return;
      sfx("tab");
      setListening(null);
      setTab(id);
    };
    const step = (d) => pick(TABS[(index + d + TABS.length) % TABS.length].id);
    const restore = () => {
      sfx("confirm");
      setListening(null);
      setSettings(defaults(rows));
    };
    const open2 = (s) => {
      sfx("click");
      setListening(null);
      setSub(s);
    };
    useKeys((e) => {
      if (sub) return;
      if (listening) {
        if (e.key !== "Escape") setSetting(listening, e.code);
        sfx(e.key === "Escape" ? "back" : "confirm");
        setListening(null);
        return;
      }
      switch (e.code) {
        case "Escape":
          sfx("back");
          return onClose();
        case "Digit1":
        case "KeyQ":
          return step(-1);
        case "Digit3":
        case "KeyE":
          return step(1);
        case "KeyZ":
          return open2("gamma");
        case "KeyX":
          return open2("controls");
        case "F1":
          return restore();
      }
    });
    useDebug("tab", (t) => {
      if (TABS.some((x) => x.id === t)) setTab(t);
    });
    useDebug("sub", (s) => setSub(s === "none" ? null : s));
    useDebug("set", (arg) => {
      const [id, v] = arg.split(" ");
      change(id, v === "true" ? true : v === "false" ? false : Number(v));
    });
    useDebug("listen", setListening);
    if (sub === "gamma") return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Gamma, {
      onBack: () => setSub(null)
    });
    if (sub === "controls") return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ControlScheme, {
      onBack: () => setSub(null)
    });
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
      style: FILL,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Backdrop, {}),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 36,
            right: 36,
            top: 84,
            height: 1,
            backgroundColor: "rgba(255, 93, 81, 0.2)"
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ProtocolStamp, {
          style: {
            left: 36,
            top: 70
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(EdgeRails, {}),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Tabs, {
          tab,
          onPick: pick,
          onStep: step
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 159,
            flexDirection: "row",
            justifyContent: "center"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
              style: {
                width: 310,
                flexShrink: 1
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
              style: {
                flexShrink: 0,
                // The glitch every tab change runs through (a crossfade with UI
                // glitch effects off).
                morphFilter: {
                  key: tab,
                  name: values.uiGlitch ? "glitchSwap" : "crossfade"
                },
                transition: {
                  morphFilter: {
                    duration: 260,
                    easing: "linear"
                  }
                }
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
                style: {
                  width: 962,
                  height: 700,
                  flexDirection: "column",
                  overflowY: "scroll",
                  scrollbar: {
                    track: {
                      backgroundColor: "#2a0d12"
                    },
                    thumb: {
                      backgroundColor: "#f24d47",
                      hover: {
                        backgroundColor: C.redHi
                      }
                    },
                    thickness: 4,
                    minThumbLength: 40
                  }
                },
                scrollStep: 47,
                children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
                  style: {
                    width: 925,
                    flexDirection: "column",
                    flexShrink: 0
                  },
                  children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(SettingRow, {
                    row,
                    values,
                    listening,
                    onChange: change,
                    onListen: setListening
                  }, i))
                })
              }, tab)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
              style: {
                flexShrink: 0,
                flexDirection: "column",
                gap: 25,
                margin: {
                  left: 43,
                  top: 307
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(SideButton, {
                  label: "GAMMA CORRECTION",
                  k: "Z",
                  onClick: () => open2("gamma")
                }),
                /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(SideButton, {
                  label: "CONTROL SCHEME",
                  k: "X",
                  onClick: () => open2("controls")
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 917,
            justifyContent: "center"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(CutButton, {
            label: "DEFAULTS",
            width: 200,
            height: 53,
            onClick: restore
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 1043,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
              style: {
                ...T.micro,
                fontSize: 8
              },
              children: "SBL 102 CKC 151 CC10 A55"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("svg", {
              viewBox: "0 0 30 8",
              style: {
                width: 30,
                height: 8
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("polygon", {
                  points: [
                    0,
                    4,
                    9,
                    0,
                    9,
                    8
                  ],
                  fill: C.redDim
                }),
                /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("rect", {
                  x: 9,
                  y: 3,
                  width: 21,
                  height: 2,
                  fill: C.redDim
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Badge, {}),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)(Hints, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Hint, {
              k: "ESC",
              label: "Close",
              onClick: onClose
            }),
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Hint, {
              k: "F1",
              label: "Restore Defaults",
              onClick: restore
            }),
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Hint, {
              k: "mouse",
              label: "Select"
            })
          ]
        })
      ]
    });
  }
  function Tabs({ tab, onPick, onStep }) {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 42
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", {
          onClick: () => onStep(-1),
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Keycap, {
            k: "1"
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
          style: {
            flexDirection: "row",
            gap: 22,
            alignItems: "center"
          },
          children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", {
            onClick: () => onPick(t.id),
            style: {
              height: 36,
              justifyContent: "center"
            },
            hoverStyle: {
              backgroundColor: "rgba(255, 93, 81, 0.06)"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
              style: {
                fontSize: 24,
                color: t.id === tab ? C.cyan : C.red,
                lineBreak: "noWrap"
              },
              children: t.label
            })
          }, t.id))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", {
          onClick: () => onStep(1),
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Keycap, {
            k: "3"
          })
        })
      ]
    });
  }
  var SIDE_FRAME = "#5b1a20";
  function SideButton({ label, k, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("button", {
      onClick,
      style: {
        width: 255,
        height: 49
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
          style: {
            ...chamfer(C.button, 10, SIDE_FRAME, 1),
            positionType: "absolute",
            left: 0,
            top: 4,
            right: 0,
            bottom: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flexEnd",
            gap: 14,
            padding: {
              right: 14
            }
          },
          hoverStyle: chamfer("#1a1a2c", 10, C.cyan, 1),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
              style: {
                positionType: "absolute",
                left: 4,
                top: 5,
                bottom: 5,
                width: 2,
                backgroundColor: SIDE_FRAME
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
              style: {
                fontSize: 21,
                color: C.cyan,
                letterSpacing: 0.4
              },
              children: label
            }),
            /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Keycap, {
              k
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
          style: {
            ...chamfer(C.button, 5, SIDE_FRAME, 1, "tr"),
            border: {
              top: 1,
              left: 1,
              right: 1
            },
            positionType: "absolute",
            left: 0,
            top: 0,
            width: 72,
            height: 6
          }
        })
      ]
    });
  }
  function Badge() {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)(import_jsx_runtime31.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 50,
            top: 993,
            width: 28,
            height: 38,
            border: 2,
            borderColor: C.redDim,
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
            style: {
              fontFamily: F.bold,
              fontSize: 14,
              color: C.redDim,
              lineHeight: 0.95,
              textAlign: "center"
            },
            children: "V\n85"
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
          style: {
            ...T.micro,
            fontSize: 7,
            positionType: "absolute",
            left: 86,
            top: 998,
            width: 460
          },
          children: "The data you enter on an SCPD terminal will only be used for the purpose you entered it for. Your personal data is protected in accordance with the 2088 Privacy Act, the Sable City Charter and Tenkai Corporate Policy 7. Terminal sessions may be retained for the length of your residency."
        })
      ]
    });
  }

  // src/screens/Splash.tsx
  var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
  var import_react18 = __toESM(require_react(), 1);
  var import_bevy_react9 = __toESM(require_bevy_react(), 1);
  var INK2 = "#db4f49";
  var card = (delay, hold) => (0, import_bevy_react9.withDelay)(delay, (0, import_bevy_react9.withSequence)((0, import_bevy_react9.withTiming)(1, {
    duration: 320,
    easing: "easeOut"
  }), (0, import_bevy_react9.withDelay)(hold, (0, import_bevy_react9.withTiming)(0, {
    duration: 280,
    easing: "easeIn"
  }))));
  function Splash({ onDone }) {
    const marks = (0, import_bevy_react9.useSharedValue)(0);
    const notice = (0, import_bevy_react9.useSharedValue)(0);
    const done = (0, import_react18.useRef)(onDone);
    done.current = onDone;
    (0, import_react18.useEffect)(() => {
      marks.value = card(250, 800);
      notice.value = card(1700, 900);
      const t = setTimeout(() => done.current(), 3300);
      return () => clearTimeout(t);
    }, [
      marks,
      notice
    ]);
    useKeys(() => done.current());
    const center = {
      ...FILL,
      alignItems: "center",
      justifyContent: "center"
    };
    return /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("button", {
      style: {
        ...FILL,
        backgroundColor: "#000000"
      },
      onClick: () => done.current(),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("node", {
          style: {
            ...center,
            opacity: {
              animated: marks
            }
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("node", {
            style: {
              width: 1240,
              flexDirection: "row",
              flexWrap: "wrap",
              rowGap: 80
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(Mark3, {
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Logo, {
                    src: "images/bevy-logo.png"
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                    size: 60,
                    children: "bevy"
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(Mark3, {
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Logo, {
                    src: "images/react-logo.png"
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                    size: 56,
                    children: "React"
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Mark3, {
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                  size: 76,
                  children: "wgpu"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Mark3, {
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("node", {
                  style: {
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("node", {
                      style: {
                        width: 92,
                        height: 92,
                        borderRadius: 8,
                        backgroundColor: INK2,
                        alignItems: "center",
                        justifyContent: "center"
                      },
                      children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                        size: 58,
                        color: "#000000",
                        children: "V8"
                      })
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                      size: 19,
                      font: F.semibold,
                      children: "JAVASCRIPT ENGINE"
                    })
                  ]
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Mark3, {
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                  size: 72,
                  children: "taffy"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Mark3, {
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                  size: 46,
                  font: F.mono,
                  children: "deno_core"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Mark3, {
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                  size: 54,
                  font: F.semibold,
                  children: "cosmic-text"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Mark3, {
                children: /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("node", {
                  style: {
                    flexDirection: "column",
                    alignItems: "center"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                      size: 20,
                      font: F.semibold,
                      children: "powered by"
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(Word, {
                      size: 54,
                      children: "bevy-react"
                    })
                  ]
                })
              })
            ]
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("node", {
          style: {
            ...center,
            opacity: {
              animated: notice
            }
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("text", {
            style: {
              width: 1280,
              fontSize: 25,
              color: "#c9463f",
              lineHeight: 1.45,
              textAlign: "center"
            },
            children: "CYBERPUNK 2091 is a fan homage to the menus of Cyberpunk 2077, built with bevy-react. It is not affiliated with or endorsed by CD PROJEKT RED. Sable City, Tenkai and everyone in them are made up. Bevy, React, wgpu, V8, taffy, deno_core and cosmic-text are the work of their authors, used under their open-source licenses."
          })
        })
      ]
    });
  }
  function Mark3({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("node", {
      style: {
        width: "25%",
        height: 120,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 14
      },
      children
    });
  }
  function Logo({ src }) {
    return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("image", {
      src,
      tint: INK2,
      style: {
        width: 84,
        height: 84
      }
    });
  }
  function Word({ size, font = F.bold, color = INK2, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("text", {
      style: {
        fontSize: size,
        fontFamily: font,
        color,
        lineHeight: 1,
        lineBreak: "noWrap"
      },
      children
    });
  }

  // src/screens/Title.tsx
  var import_jsx_runtime33 = __toESM(require_jsx_runtime(), 1);
  var import_react19 = __toESM(require_react(), 1);
  var import_bevy_react10 = __toESM(require_bevy_react(), 1);
  function Title({ onContinue }) {
    const [breaching, setBreaching] = (0, import_react19.useState)(false);
    const go = () => {
      if (breaching) return;
      sfx("confirm");
      setBreaching(true);
      setTimeout(onContinue, 1500);
    };
    useKeys((e) => {
      if (e.key === "Space" || e.key === "Enter") go();
    });
    const sway = (0, import_bevy_react10.useSharedValue)(0);
    (0, import_react19.useEffect)(() => {
      sway.value = (0, import_bevy_react10.withRepeat)((0, import_bevy_react10.withTiming)(1, {
        duration: 7e3,
        easing: "easeInOut"
      }), {
        reverse: true
      });
    }, [
      sway
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("button", {
      style: {
        ...FILL,
        backgroundColor: C.clear
      },
      onClick: go,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Wordmark, {
          width: 1240,
          glitch: 0.22,
          style: {
            positionType: "absolute",
            left: 300,
            top: 300,
            transform3d: {
              perspective: 1500,
              rotateX: {
                animated: (0, import_bevy_react10.interpolate)(sway, [
                  0,
                  1
                ], [
                  22,
                  26
                ])
              },
              rotateY: {
                animated: (0, import_bevy_react10.interpolate)(sway, [
                  0,
                  1
                ], [
                  -20,
                  -15
                ])
              },
              rotateZ: -7
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 842,
            flexDirection: "column",
            alignItems: "center",
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("node", {
              style: {
                width: 320,
                flexDirection: "column",
                gap: 3
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
                  style: {
                    ...T.micro,
                    color: C.redDim
                  },
                  children: "MODEL LINE        1.2001A"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("node", {
                  style: {
                    height: 50,
                    border: 2,
                    borderColor: C.red,
                    backgroundColor: "rgba(20, 6, 10, 0.55)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  },
                  children: breaching ? /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
                    style: {
                      fontSize: 30,
                      fontFamily: F.semibold,
                      color: C.cyan,
                      letterSpacing: 1,
                      filter: {
                        name: "glitch",
                        params: {
                          intensity: 0.5,
                          frequency: 0.6,
                          tear: 10
                        }
                      }
                    },
                    children: "BREACHING..."
                  }) : /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(import_jsx_runtime33.Fragment, {
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
                        style: {
                          ...T.menu,
                          fontFamily: F.semibold
                        },
                        children: "PRESS"
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Keycap, {
                        k: "space"
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
                        style: {
                          ...T.menu,
                          fontFamily: F.semibold
                        },
                        children: "TO CONTINUE."
                      })
                    ]
                  })
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("node", {
              style: {
                width: 230,
                height: 20,
                border: 1,
                borderColor: C.redDim,
                padding: {
                  horizontal: 6
                },
                justifyContent: "center"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(DataNoise, {
                seed: 3,
                lines: 2,
                groups: 6,
                style: {
                  fontSize: 6
                }
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Rule, {
              width: 1100,
              color: C.redDim,
              style: {
                margin: {
                  top: 10
                }
              }
            })
          ]
        })
      ]
    });
  }

  // src/App.tsx
  var MAIN = [
    {
      id: "newgame",
      label: "NEW GAME"
    },
    {
      id: "load",
      label: "LOAD GAME"
    },
    {
      id: "settings",
      label: "SETTINGS"
    },
    {
      id: "credits",
      label: "CREDITS"
    },
    {
      id: "quit",
      label: "QUIT GAME"
    }
  ];
  var PAUSE = [
    {
      id: "resume",
      label: "RESUME"
    },
    {
      id: "save",
      label: "SAVE GAME"
    },
    {
      id: "load",
      label: "LOAD GAME"
    },
    {
      id: "settings",
      label: "SETTINGS"
    },
    {
      id: "credits",
      label: "CREDITS"
    },
    {
      id: "exit",
      label: "EXIT TO MAIN MENU"
    },
    {
      id: "quit",
      label: "QUIT GAME"
    }
  ];
  var MORPH_MS = 420;
  function App() {
    const [screen, setScreen] = (0, import_react20.useState)("splash");
    const [character, setCharacter] = (0, import_react20.useState)(NEW_CHARACTER);
    const [saves, setSaves] = (0, import_react20.useState)(SEED_SAVES);
    const [game, setGame] = (0, import_react20.useState)(null);
    const [inGame, setInGame] = (0, import_react20.useState)(false);
    const [dialog, setDialog] = (0, import_react20.useState)(null);
    const [debugPortal, setDebugPortal] = (0, import_react20.useState)(null);
    const settings = useSettings();
    useLiveSettings();
    const [morph, setMorph] = (0, import_react20.useState)(null);
    const timers = (0, import_react20.useRef)({});
    const go = (next, apply) => {
      setDialog(null);
      const t = timers.current;
      clearTimeout(t.end);
      const flip = () => {
        apply?.();
        setScreen(next);
        setMorph(next);
        t.end = setTimeout(() => setMorph(null), MORPH_MS + 120);
      };
      if (morph) {
        clearTimeout(t.flip);
        flip();
      } else {
        setMorph(screen);
        t.flip = setTimeout(flip, 60);
      }
    };
    const menu = () => go("menu");
    const lifepath = inGame && game ? game.character.lifepath : null;
    (0, import_react20.useEffect)(() => {
      bevy.dioramas.world({
        lifepath
      });
    }, [
      lifepath
    ]);
    const play = (save2) => go("loading", () => {
      setGame(save2);
      setInGame(false);
    });
    const pick = (id) => {
      sfx("click");
      switch (id) {
        case "newgame":
          setCharacter(NEW_CHARACTER);
          return go("newgame");
        case "resume":
          return go("game");
        case "load":
        case "save":
        case "settings":
        case "credits":
          return go(id);
        case "exit":
          return setDialog({
            text: "Exit to the main menu? Any unsaved progress will be lost.",
            onConfirm: () => go("menu", () => {
              setInGame(false);
              setGame(null);
            })
          });
        case "quit":
          return setDialog({
            text: "Are you sure you want to quit the game?",
            // In the browser an exited app is a frozen page: start over.
            onConfirm: () => typeof location === "undefined" ? bevy.app.quit(null) : location.reload()
          });
      }
    };
    const start = () => play({
      id: 0,
      ...PROLOGUE[character.lifepath],
      name: "AutoSave",
      level: 1,
      playtime: 0,
      date: stamp(),
      character
    });
    const load = (save2) => {
      if (!inGame) return play(save2);
      setDialog({
        text: "Load this save? Any unsaved progress will be lost.",
        onConfirm: () => play(save2)
      });
    };
    const save = (overwrite) => {
      if (!game) return;
      const id = Math.max(0, ...saves.map((s) => s.id)) + 1;
      const fresh = {
        ...game,
        id,
        name: overwrite?.name ?? `ManualSave-${id}`,
        playtime: game.playtime + 23,
        date: stamp()
      };
      setSaves([
        fresh,
        ...saves.filter((s) => s.id !== overwrite?.id)
      ]);
    };
    useKeys((e) => {
      if (e.key === "Escape" && screen === "game" && !dialog) {
        sfx("back");
        go("menu");
      }
    });
    useDebug("go", (s) => go(s));
    useDebug("portal", (arg) => setDebugPortal(arg ? arg.split(" ") : null));
    useDebug("play", (l) => {
      const lifepath2 = l;
      setGame({
        ...SEED_SAVES[0],
        ...PROLOGUE[lifepath2],
        character: {
          ...NEW_CHARACTER,
          lifepath: lifepath2
        }
      });
      setInGame(true);
      go("game");
    });
    useDebug("pick", pick);
    const paused = inGame && screen !== "game";
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("node", {
      style: {
        width: "100%",
        height: "100%"
      },
      children: [
        inGame && game ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(World, {
          lifepath: game.character.lifepath,
          paused
        }) : settings.filmGrain && // Film grain over the 3D world, under the menus.
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("node", {
          style: {
            ...FILL,
            filter: {
              name: "grain",
              params: {
                amount: 0.07
              }
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("node", {
          style: {
            ...FILL,
            ...morph && {
              // Mid-change, whatever is live underneath keeps moving.
              cache: "never",
              // With UI glitches off (INTERFACE settings), screens cross-fade.
              morphFilter: settings.uiGlitch ? {
                key: morph,
                name: "glitchSwap"
              } : {
                key: morph,
                name: "crossfade",
                params: {
                  spread: 0
                }
              },
              transition: {
                morphFilter: {
                  duration: MORPH_MS,
                  easing: "linear"
                }
              }
            }
          },
          children: [
            screen === "splash" && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Splash, {
              onDone: () => go("title")
            }),
            screen === "title" && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Title, {
              onContinue: menu
            }),
            screen === "menu" && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(MainMenu, {
              entries: inGame ? PAUSE : MAIN,
              onPick: pick,
              onBack: inGame ? () => go("game") : void 0,
              version: "0.7.0"
            }),
            screen === "newgame" && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(NewGame, {
              character,
              onChange: setCharacter,
              onBack: menu,
              onStart: start
            }),
            (screen === "load" || screen === "save") && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Saves, {
              mode: screen,
              saves,
              inGame,
              onLoad: load,
              onSave: save,
              onDelete: (s) => setSaves(saves.filter((x) => x.id !== s.id)),
              onClose: menu
            }),
            screen === "settings" && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Settings, {
              onClose: menu
            }),
            screen === "credits" && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Credits, {
              onClose: menu
            }),
            screen === "loading" && game && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Loading, {
              lifepath: game.character.lifepath,
              onDone: () => go("game", () => setInGame(true))
            }),
            screen === "game" && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(GameHud, {
              onPause: () => go("menu"),
              game: game ?? void 0
            }),
            dialog && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Confirm, {
              text: dialog.text,
              onConfirm: dialog.onConfirm,
              onCancel: () => setDialog(null)
            })
          ]
        }),
        debugPortal && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("node", {
          style: {
            ...FILL,
            alignItems: "center",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("portal", {
            target: debugPortal[0],
            style: {
              width: Number(debugPortal[1] ?? 640),
              height: Number(debugPortal[2] ?? 360),
              cache: "never"
            }
          })
        }),
        settings.scanlines && /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("node", {
          style: {
            ...FILL,
            backgroundImage: SCANLINES
          }
        })
      ]
    });
  }
  function stamp() {
    const d = /* @__PURE__ */ new Date();
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = d.getHours() < 12 ? "AM" : "PM";
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${mm}/${dd}/91, ${h}:${m} ${ampm}`;
  }

  // src/index.tsx
  (0, import_bevy_react11.mount)(/* @__PURE__ */ (0, import_jsx_runtime35.jsx)(App, {}));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidmVuZG9yLWdsb2JhbDpiZXZ5LXJlYWN0L2pzeC1ydW50aW1lIiwgInZlbmRvci1nbG9iYWw6YmV2eS1yZWFjdCIsICJ2ZW5kb3ItZ2xvYmFsOnJlYWN0IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvaW5kZXgudHN4IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvQXBwLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL2JldnkudHMiLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9ob29rcy50cyIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9DcmVkaXRzLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NvdW5kLnRzIiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvdGhlbWUudHMiLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy91aS9pY29ucy50c3giLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy91aS9raXQudHN4IiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL0RpYWxvZy50c3giLCAiLi4vc3JjL3NjcmVlbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvSW5HYW1lLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3N0b3JlLnRzIiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL0xvYWRpbmcudHN4IiwgIi4uL3NyYy91aS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvdWkvZGVjb3IudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NldHRpbmdzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NldHRpbmdzL3N0b3JlLnRzIiwgIi4uL3NyYy9zY3JlZW5zL3NldHRpbmdzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NldHRpbmdzL2RhdGEudHMiLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy91aS93b3JkbWFyay1wYXRoLnRzIiwgIi4uL3NyYy91aS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvdWkvV29yZG1hcmsudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NhdmVzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NhdmVzL2ljb25zLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9NYWluTWVudS50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL05ld0dhbWUudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9BcHBlYXJhbmNlLnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvZGF0YS50cyIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvSWRDYXJkLnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvZ2x5cGhzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvcGFydHMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9NYXJrcy50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL1BvcnRyYWl0LnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvUmFkYXIudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9Td2F0Y2hlcy50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL0F0dHJpYnV0ZXMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9Cb2R5VHlwZS50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL0ZpZ3VyZS50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL0RpZmZpY3VsdHkudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9MaWZlcGF0aC50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL1N1bW1hcnkudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NhdmVzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NhdmVzL1NhdmVzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zYXZlcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zYXZlcy9Sb3cudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NldHRpbmdzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NldHRpbmdzL1NldHRpbmdzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zZXR0aW5ncy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zZXR0aW5ncy9yb3dzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zZXR0aW5ncy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zZXR0aW5ncy9Db250cm9sU2NoZW1lLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zZXR0aW5ncy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zZXR0aW5ncy9HYW1tYS50c3giLCAiLi4vc3JjL3NjcmVlbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvU3BsYXNoLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9UaXRsZS50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5fX2JldnlWZW5kb3JbXCJiZXZ5LXJlYWN0L2pzeC1ydW50aW1lXCJdOyIsICJtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuX19iZXZ5VmVuZG9yW1wiYmV2eS1yZWFjdFwiXTsiLCAibW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLl9fYmV2eVZlbmRvcltcInJlYWN0XCJdOyIsICJpbXBvcnQgeyBtb3VudCB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBBcHAgfSBmcm9tIFwiLi9BcHBcIjtcblxuLy8gYG1vdW50YCBwYXJrcyBvbiB0aGUgUnVzdC1kcml2ZW4gZXZlbnQgbG9vcCBhbmQgbmV2ZXIgcmVzb2x2ZXMuIE9uIGEgaG90XG4vLyByZWxvYWQgdGhpcyBmaWxlIHJlLWV4ZWN1dGVzIGFuZCBgbW91bnRgIHRyaWdnZXJzIGEgUmVhY3QgRmFzdCBSZWZyZXNoLlxubW91bnQoPEFwcCAvPik7XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4vYmV2eVwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi9ob29rc1wiO1xuaW1wb3J0IHsgQ3JlZGl0cyB9IGZyb20gXCIuL3NjcmVlbnMvQ3JlZGl0c1wiO1xuaW1wb3J0IHsgQ29uZmlybSB9IGZyb20gXCIuL3NjcmVlbnMvRGlhbG9nXCI7XG5pbXBvcnQgeyBHYW1lSHVkLCBXb3JsZCB9IGZyb20gXCIuL3NjcmVlbnMvSW5HYW1lXCI7XG5pbXBvcnQgeyBMb2FkaW5nIH0gZnJvbSBcIi4vc2NyZWVucy9Mb2FkaW5nXCI7XG5pbXBvcnQgeyBNYWluTWVudSwgdHlwZSBNZW51RW50cnkgfSBmcm9tIFwiLi9zY3JlZW5zL01haW5NZW51XCI7XG5pbXBvcnQgeyBOZXdHYW1lIH0gZnJvbSBcIi4vc2NyZWVucy9uZXdnYW1lL05ld0dhbWVcIjtcbmltcG9ydCB7IFNhdmVzIH0gZnJvbSBcIi4vc2NyZWVucy9zYXZlcy9TYXZlc1wiO1xuaW1wb3J0IHsgU2V0dGluZ3MgfSBmcm9tIFwiLi9zY3JlZW5zL3NldHRpbmdzL1NldHRpbmdzXCI7XG5pbXBvcnQgeyB1c2VMaXZlU2V0dGluZ3MsIHVzZVNldHRpbmdzIH0gZnJvbSBcIi4vc2NyZWVucy9zZXR0aW5ncy9zdG9yZVwiO1xuaW1wb3J0IHsgU3BsYXNoIH0gZnJvbSBcIi4vc2NyZWVucy9TcGxhc2hcIjtcbmltcG9ydCB7IFRpdGxlIH0gZnJvbSBcIi4vc2NyZWVucy9UaXRsZVwiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4vc291bmRcIjtcbmltcG9ydCB7XG4gIE5FV19DSEFSQUNURVIsXG4gIFBST0xPR1VFLFxuICBTRUVEX1NBVkVTLFxuICB0eXBlIENoYXJhY3RlcixcbiAgdHlwZSBMaWZlcGF0aCxcbiAgdHlwZSBTYXZlLFxufSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IHsgU0NBTkxJTkVTIH0gZnJvbSBcIi4vdGhlbWVcIjtcbmltcG9ydCB7IEZJTEwgfSBmcm9tIFwiLi91aS9raXRcIjtcblxuZXhwb3J0IHR5cGUgU2NyZWVuID1cbiAgfCBcInNwbGFzaFwiXG4gIHwgXCJ0aXRsZVwiXG4gIHwgXCJtZW51XCJcbiAgfCBcIm5ld2dhbWVcIlxuICB8IFwibG9hZFwiXG4gIHwgXCJzYXZlXCJcbiAgfCBcInNldHRpbmdzXCJcbiAgfCBcImNyZWRpdHNcIlxuICB8IFwibG9hZGluZ1wiXG4gIHwgXCJnYW1lXCI7XG5cbmNvbnN0IE1BSU46IE1lbnVFbnRyeVtdID0gW1xuICB7IGlkOiBcIm5ld2dhbWVcIiwgbGFiZWw6IFwiTkVXIEdBTUVcIiB9LFxuICB7IGlkOiBcImxvYWRcIiwgbGFiZWw6IFwiTE9BRCBHQU1FXCIgfSxcbiAgeyBpZDogXCJzZXR0aW5nc1wiLCBsYWJlbDogXCJTRVRUSU5HU1wiIH0sXG4gIHsgaWQ6IFwiY3JlZGl0c1wiLCBsYWJlbDogXCJDUkVESVRTXCIgfSxcbiAgeyBpZDogXCJxdWl0XCIsIGxhYmVsOiBcIlFVSVQgR0FNRVwiIH0sXG5dO1xuXG5jb25zdCBQQVVTRTogTWVudUVudHJ5W10gPSBbXG4gIHsgaWQ6IFwicmVzdW1lXCIsIGxhYmVsOiBcIlJFU1VNRVwiIH0sXG4gIHsgaWQ6IFwic2F2ZVwiLCBsYWJlbDogXCJTQVZFIEdBTUVcIiB9LFxuICB7IGlkOiBcImxvYWRcIiwgbGFiZWw6IFwiTE9BRCBHQU1FXCIgfSxcbiAgeyBpZDogXCJzZXR0aW5nc1wiLCBsYWJlbDogXCJTRVRUSU5HU1wiIH0sXG4gIHsgaWQ6IFwiY3JlZGl0c1wiLCBsYWJlbDogXCJDUkVESVRTXCIgfSxcbiAgeyBpZDogXCJleGl0XCIsIGxhYmVsOiBcIkVYSVQgVE8gTUFJTiBNRU5VXCIgfSxcbiAgeyBpZDogXCJxdWl0XCIsIGxhYmVsOiBcIlFVSVQgR0FNRVwiIH0sXG5dO1xuXG50eXBlIERpYWxvZyA9IHsgdGV4dDogc3RyaW5nOyBvbkNvbmZpcm06ICgpID0+IHZvaWQgfSB8IG51bGw7XG5cbi8qKiBIb3cgbG9uZyBhIHNjcmVlbiBjaGFuZ2UgZ2xpdGNoZXMuICovXG5jb25zdCBNT1JQSF9NUyA9IDQyMDtcblxuLyoqIFRoZSBmcm9udCBlbmQ6IG9uZSBzY3JlZW4gYXQgYSB0aW1lIG92ZXIgdGhlIGRhdGFzY2FwZSAob3IsIGluIGdhbWUsXG4gKiAgb3ZlciB0aGUgd29ybGQpLCBldmVyeSBjaGFuZ2UgZ2xpdGNoaW5nIHRocm91Z2ggdGhlIGBnbGl0Y2hTd2FwYCBtb3JwaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IFtzY3JlZW4sIHNldFNjcmVlbl0gPSB1c2VTdGF0ZTxTY3JlZW4+KFwic3BsYXNoXCIpO1xuICBjb25zdCBbY2hhcmFjdGVyLCBzZXRDaGFyYWN0ZXJdID0gdXNlU3RhdGU8Q2hhcmFjdGVyPihORVdfQ0hBUkFDVEVSKTtcbiAgY29uc3QgW3NhdmVzLCBzZXRTYXZlc10gPSB1c2VTdGF0ZTxTYXZlW10+KFNFRURfU0FWRVMpO1xuICAvKiogVGhlIGdhbWUgYmVpbmcgcGxheWVkIChvciBiZWluZyBsb2FkZWQgaW50bykuICovXG4gIGNvbnN0IFtnYW1lLCBzZXRHYW1lXSA9IHVzZVN0YXRlPFNhdmUgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2luR2FtZSwgc2V0SW5HYW1lXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2RpYWxvZywgc2V0RGlhbG9nXSA9IHVzZVN0YXRlPERpYWxvZz4obnVsbCk7XG4gIGNvbnN0IFtkZWJ1Z1BvcnRhbCwgc2V0RGVidWdQb3J0YWxdID0gdXNlU3RhdGU8c3RyaW5nW10gfCBudWxsPihudWxsKTtcbiAgY29uc3Qgc2V0dGluZ3MgPSB1c2VTZXR0aW5ncygpO1xuICAvLyBUaGUgc2V0dGluZ3MgdGhhdCBjaGFuZ2UgQmV2eSAoY2FtZXJhLCB3aW5kb3csIGNvbG9yIGdyYWRpbmcsIHZvbHVtZSkuXG4gIHVzZUxpdmVTZXR0aW5ncygpO1xuXG4gIC8vIFNjcmVlbiBjaGFuZ2VzIG1vcnBoLiBUaGUgbW9ycGggaXMgYXJtZWQgb25seSB3aGlsZSBhIGNoYW5nZSBpcyBpblxuICAvLyBmbGlnaHQgKHNvIGFuIGlkbGUgc2NyZWVuIGlzbid0IGEgZnVsbC1zY3JlZW4gbGF5ZXIsIGFuZCBpdHMgbGl2ZSBwYXJ0c1xuICAvLyBuZWVkIG5vIGNhcmUpOiBwcm9tb3RlIHVuZGVyIHRoZSBjdXJyZW50IHNjcmVlbiwgZmxpcCB0aGUga2V5IChhbmRcbiAgLy8gYXBwbHkgdGhlIGNoYW5nZSkgYSBmZXcgZnJhbWVzIGxhdGVyLCBkZW1vdGUgb25jZSB0aGUgbW9ycGggaGFzIHJ1bi4gQVxuICAvLyBjaGFuZ2Ugd2hpbGUgb25lIGlzIGluIGZsaWdodCBmbGlwcyBhdCBvbmNlIOKAlCB0aGUgbW9ycGggcmVzdGFydHMgZnJvbVxuICAvLyB3aGVyZXZlciBpdCB3YXMuXG4gIGNvbnN0IFttb3JwaCwgc2V0TW9ycGhdID0gdXNlU3RhdGU8U2NyZWVuIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHRpbWVycyA9IHVzZVJlZjx7XG4gICAgZmxpcD86IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+O1xuICAgIGVuZD86IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+O1xuICB9Pih7fSk7XG4gIGNvbnN0IGdvID0gKG5leHQ6IFNjcmVlbiwgYXBwbHk/OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgc2V0RGlhbG9nKG51bGwpO1xuICAgIGNvbnN0IHQgPSB0aW1lcnMuY3VycmVudDtcbiAgICBjbGVhclRpbWVvdXQodC5lbmQpO1xuICAgIGNvbnN0IGZsaXAgPSAoKSA9PiB7XG4gICAgICBhcHBseT8uKCk7XG4gICAgICBzZXRTY3JlZW4obmV4dCk7XG4gICAgICBzZXRNb3JwaChuZXh0KTtcbiAgICAgIHQuZW5kID0gc2V0VGltZW91dCgoKSA9PiBzZXRNb3JwaChudWxsKSwgTU9SUEhfTVMgKyAxMjApO1xuICAgIH07XG4gICAgaWYgKG1vcnBoKSB7XG4gICAgICBjbGVhclRpbWVvdXQodC5mbGlwKTtcbiAgICAgIGZsaXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0TW9ycGgoc2NyZWVuKTtcbiAgICAgIHQuZmxpcCA9IHNldFRpbWVvdXQoZmxpcCwgNjApO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgbWVudSA9ICgpID0+IGdvKFwibWVudVwiKTtcblxuICAvLyBUaGUgd29ybGQgY2FtZXJhIGZpbG1zIHRoZSBydW5uaW5nIGdhbWUncyBsaWZlcGF0aC5cbiAgY29uc3QgbGlmZXBhdGg6IExpZmVwYXRoIHwgbnVsbCA9XG4gICAgaW5HYW1lICYmIGdhbWUgPyBnYW1lLmNoYXJhY3Rlci5saWZlcGF0aCA6IG51bGw7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYmV2eS5kaW9yYW1hcy53b3JsZCh7IGxpZmVwYXRoIH0pO1xuICB9LCBbbGlmZXBhdGhdKTtcblxuICBjb25zdCBwbGF5ID0gKHNhdmU6IFNhdmUpID0+XG4gICAgZ28oXCJsb2FkaW5nXCIsICgpID0+IHtcbiAgICAgIHNldEdhbWUoc2F2ZSk7XG4gICAgICBzZXRJbkdhbWUoZmFsc2UpO1xuICAgIH0pO1xuXG4gIGNvbnN0IHBpY2sgPSAoaWQ6IHN0cmluZykgPT4ge1xuICAgIHNmeChcImNsaWNrXCIpO1xuICAgIHN3aXRjaCAoaWQpIHtcbiAgICAgIGNhc2UgXCJuZXdnYW1lXCI6XG4gICAgICAgIHNldENoYXJhY3RlcihORVdfQ0hBUkFDVEVSKTtcbiAgICAgICAgcmV0dXJuIGdvKFwibmV3Z2FtZVwiKTtcbiAgICAgIGNhc2UgXCJyZXN1bWVcIjpcbiAgICAgICAgcmV0dXJuIGdvKFwiZ2FtZVwiKTtcbiAgICAgIGNhc2UgXCJsb2FkXCI6XG4gICAgICBjYXNlIFwic2F2ZVwiOlxuICAgICAgY2FzZSBcInNldHRpbmdzXCI6XG4gICAgICBjYXNlIFwiY3JlZGl0c1wiOlxuICAgICAgICByZXR1cm4gZ28oaWQpO1xuICAgICAgY2FzZSBcImV4aXRcIjpcbiAgICAgICAgcmV0dXJuIHNldERpYWxvZyh7XG4gICAgICAgICAgdGV4dDogXCJFeGl0IHRvIHRoZSBtYWluIG1lbnU/IEFueSB1bnNhdmVkIHByb2dyZXNzIHdpbGwgYmUgbG9zdC5cIixcbiAgICAgICAgICBvbkNvbmZpcm06ICgpID0+XG4gICAgICAgICAgICBnbyhcIm1lbnVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICBzZXRJbkdhbWUoZmFsc2UpO1xuICAgICAgICAgICAgICBzZXRHYW1lKG51bGwpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgICAgY2FzZSBcInF1aXRcIjpcbiAgICAgICAgcmV0dXJuIHNldERpYWxvZyh7XG4gICAgICAgICAgdGV4dDogXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcXVpdCB0aGUgZ2FtZT9cIixcbiAgICAgICAgICAvLyBJbiB0aGUgYnJvd3NlciBhbiBleGl0ZWQgYXBwIGlzIGEgZnJvemVuIHBhZ2U6IHN0YXJ0IG92ZXIuXG4gICAgICAgICAgb25Db25maXJtOiAoKSA9PlxuICAgICAgICAgICAgdHlwZW9mIGxvY2F0aW9uID09PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgICAgID8gYmV2eS5hcHAucXVpdChudWxsKVxuICAgICAgICAgICAgICA6IGxvY2F0aW9uLnJlbG9hZCgpLFxuICAgICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc3RhcnQgPSAoKSA9PlxuICAgIHBsYXkoe1xuICAgICAgaWQ6IDAsXG4gICAgICAuLi5QUk9MT0dVRVtjaGFyYWN0ZXIubGlmZXBhdGhdLFxuICAgICAgbmFtZTogXCJBdXRvU2F2ZVwiLFxuICAgICAgbGV2ZWw6IDEsXG4gICAgICBwbGF5dGltZTogMCxcbiAgICAgIGRhdGU6IHN0YW1wKCksXG4gICAgICBjaGFyYWN0ZXIsXG4gICAgfSk7XG5cbiAgY29uc3QgbG9hZCA9IChzYXZlOiBTYXZlKSA9PiB7XG4gICAgaWYgKCFpbkdhbWUpIHJldHVybiBwbGF5KHNhdmUpO1xuICAgIHNldERpYWxvZyh7XG4gICAgICB0ZXh0OiBcIkxvYWQgdGhpcyBzYXZlPyBBbnkgdW5zYXZlZCBwcm9ncmVzcyB3aWxsIGJlIGxvc3QuXCIsXG4gICAgICBvbkNvbmZpcm06ICgpID0+IHBsYXkoc2F2ZSksXG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3Qgc2F2ZSA9IChvdmVyd3JpdGU6IFNhdmUgfCBudWxsKSA9PiB7XG4gICAgaWYgKCFnYW1lKSByZXR1cm47XG4gICAgY29uc3QgaWQgPSBNYXRoLm1heCgwLCAuLi5zYXZlcy5tYXAoKHMpID0+IHMuaWQpKSArIDE7XG4gICAgY29uc3QgZnJlc2g6IFNhdmUgPSB7XG4gICAgICAuLi5nYW1lLFxuICAgICAgaWQsXG4gICAgICBuYW1lOiBvdmVyd3JpdGU/Lm5hbWUgPz8gYE1hbnVhbFNhdmUtJHtpZH1gLFxuICAgICAgcGxheXRpbWU6IGdhbWUucGxheXRpbWUgKyAyMyxcbiAgICAgIGRhdGU6IHN0YW1wKCksXG4gICAgfTtcbiAgICBzZXRTYXZlcyhbZnJlc2gsIC4uLnNhdmVzLmZpbHRlcigocykgPT4gcy5pZCAhPT0gb3ZlcndyaXRlPy5pZCldKTtcbiAgfTtcblxuICAvLyBJbiBnYW1lLCBFc2MgcGF1c2VzIChldmVyeSBvdGhlciBzY3JlZW4gaGFuZGxlcyBpdHMgb3duIEVzYykuXG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIgJiYgc2NyZWVuID09PSBcImdhbWVcIiAmJiAhZGlhbG9nKSB7XG4gICAgICBzZngoXCJiYWNrXCIpO1xuICAgICAgZ28oXCJtZW51XCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gU2NyaXB0ZWQgc3RlcHMgZm9yIGAtLXNob290YCAoc2VlIGBzaG9vdC5yc2ApOiBgZ28gPHNjcmVlbj5gLFxuICAvLyBgcGxheSA8bGlmZXBhdGg+YCAoc3RyYWlnaHQgaW50byB0aGUgZ2FtZSwgcGF1c2VkIHdpdGggYGdvIG1lbnVgKSxcbiAgLy8gYHBpY2sgPGVudHJ5PmAsIGBwb3J0YWwgPHRhcmdldD4gPHdpZHRoPiA8aGVpZ2h0PmAuXG4gIHVzZURlYnVnKFwiZ29cIiwgKHMpID0+IGdvKHMgYXMgU2NyZWVuKSk7XG4gIC8vIGBwb3J0YWwgPHRhcmdldD4gPHdpZHRoPiA8aGVpZ2h0PmA6IHNob3cgYSByZW5kZXIgdGFyZ2V0LCBjZW50ZXJlZC5cbiAgdXNlRGVidWcoXCJwb3J0YWxcIiwgKGFyZykgPT4gc2V0RGVidWdQb3J0YWwoYXJnID8gYXJnLnNwbGl0KFwiIFwiKSA6IG51bGwpKTtcbiAgdXNlRGVidWcoXCJwbGF5XCIsIChsKSA9PiB7XG4gICAgY29uc3QgbGlmZXBhdGggPSBsIGFzIExpZmVwYXRoO1xuICAgIHNldEdhbWUoe1xuICAgICAgLi4uU0VFRF9TQVZFU1swXSxcbiAgICAgIC4uLlBST0xPR1VFW2xpZmVwYXRoXSxcbiAgICAgIGNoYXJhY3RlcjogeyAuLi5ORVdfQ0hBUkFDVEVSLCBsaWZlcGF0aCB9LFxuICAgIH0pO1xuICAgIHNldEluR2FtZSh0cnVlKTtcbiAgICBnbyhcImdhbWVcIik7XG4gIH0pO1xuICAvLyBgcGljayA8ZW50cnk+YDogYXMgaWYgYSBtZW51IGVudHJ5IHdlcmUgY2xpY2tlZCAoYHF1aXRgIOKGkiB0aGUgZGlhbG9nKS5cbiAgdXNlRGVidWcoXCJwaWNrXCIsIHBpY2spO1xuXG4gIGNvbnN0IHBhdXNlZCA9IGluR2FtZSAmJiBzY3JlZW4gIT09IFwiZ2FtZVwiO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiIH19PlxuICAgICAge2luR2FtZSAmJiBnYW1lID8gKFxuICAgICAgICA8V29ybGQgbGlmZXBhdGg9e2dhbWUuY2hhcmFjdGVyLmxpZmVwYXRofSBwYXVzZWQ9e3BhdXNlZH0gLz5cbiAgICAgICkgOiAoXG4gICAgICAgIHNldHRpbmdzLmZpbG1HcmFpbiAmJiAoXG4gICAgICAgICAgLy8gRmlsbSBncmFpbiBvdmVyIHRoZSAzRCB3b3JsZCwgdW5kZXIgdGhlIG1lbnVzLlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5GSUxMLFxuICAgICAgICAgICAgICBmaWx0ZXI6IHsgbmFtZTogXCJncmFpblwiLCBwYXJhbXM6IHsgYW1vdW50OiAwLjA3IH0gfSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKVxuICAgICAgKX1cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uRklMTCxcbiAgICAgICAgICAuLi4obW9ycGggJiYge1xuICAgICAgICAgICAgLy8gTWlkLWNoYW5nZSwgd2hhdGV2ZXIgaXMgbGl2ZSB1bmRlcm5lYXRoIGtlZXBzIG1vdmluZy5cbiAgICAgICAgICAgIGNhY2hlOiBcIm5ldmVyXCIsXG4gICAgICAgICAgICAvLyBXaXRoIFVJIGdsaXRjaGVzIG9mZiAoSU5URVJGQUNFIHNldHRpbmdzKSwgc2NyZWVucyBjcm9zcy1mYWRlLlxuICAgICAgICAgICAgbW9ycGhGaWx0ZXI6IHNldHRpbmdzLnVpR2xpdGNoXG4gICAgICAgICAgICAgID8geyBrZXk6IG1vcnBoLCBuYW1lOiBcImdsaXRjaFN3YXBcIiB9XG4gICAgICAgICAgICAgIDogeyBrZXk6IG1vcnBoLCBuYW1lOiBcImNyb3NzZmFkZVwiLCBwYXJhbXM6IHsgc3ByZWFkOiAwIH0gfSxcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHtcbiAgICAgICAgICAgICAgbW9ycGhGaWx0ZXI6IHsgZHVyYXRpb246IE1PUlBIX01TLCBlYXNpbmc6IFwibGluZWFyXCIgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtzY3JlZW4gPT09IFwic3BsYXNoXCIgJiYgPFNwbGFzaCBvbkRvbmU9eygpID0+IGdvKFwidGl0bGVcIil9IC8+fVxuICAgICAgICB7c2NyZWVuID09PSBcInRpdGxlXCIgJiYgPFRpdGxlIG9uQ29udGludWU9e21lbnV9IC8+fVxuICAgICAgICB7c2NyZWVuID09PSBcIm1lbnVcIiAmJiAoXG4gICAgICAgICAgPE1haW5NZW51XG4gICAgICAgICAgICBlbnRyaWVzPXtpbkdhbWUgPyBQQVVTRSA6IE1BSU59XG4gICAgICAgICAgICBvblBpY2s9e3BpY2t9XG4gICAgICAgICAgICBvbkJhY2s9e2luR2FtZSA/ICgpID0+IGdvKFwiZ2FtZVwiKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIHZlcnNpb249XCIwLjcuMFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgICAge3NjcmVlbiA9PT0gXCJuZXdnYW1lXCIgJiYgKFxuICAgICAgICAgIDxOZXdHYW1lXG4gICAgICAgICAgICBjaGFyYWN0ZXI9e2NoYXJhY3Rlcn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRDaGFyYWN0ZXJ9XG4gICAgICAgICAgICBvbkJhY2s9e21lbnV9XG4gICAgICAgICAgICBvblN0YXJ0PXtzdGFydH1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICB7KHNjcmVlbiA9PT0gXCJsb2FkXCIgfHwgc2NyZWVuID09PSBcInNhdmVcIikgJiYgKFxuICAgICAgICAgIDxTYXZlc1xuICAgICAgICAgICAgbW9kZT17c2NyZWVufVxuICAgICAgICAgICAgc2F2ZXM9e3NhdmVzfVxuICAgICAgICAgICAgaW5HYW1lPXtpbkdhbWV9XG4gICAgICAgICAgICBvbkxvYWQ9e2xvYWR9XG4gICAgICAgICAgICBvblNhdmU9e3NhdmV9XG4gICAgICAgICAgICBvbkRlbGV0ZT17KHMpID0+IHNldFNhdmVzKHNhdmVzLmZpbHRlcigoeCkgPT4geC5pZCAhPT0gcy5pZCkpfVxuICAgICAgICAgICAgb25DbG9zZT17bWVudX1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICB7c2NyZWVuID09PSBcInNldHRpbmdzXCIgJiYgPFNldHRpbmdzIG9uQ2xvc2U9e21lbnV9IC8+fVxuICAgICAgICB7c2NyZWVuID09PSBcImNyZWRpdHNcIiAmJiA8Q3JlZGl0cyBvbkNsb3NlPXttZW51fSAvPn1cbiAgICAgICAge3NjcmVlbiA9PT0gXCJsb2FkaW5nXCIgJiYgZ2FtZSAmJiAoXG4gICAgICAgICAgPExvYWRpbmdcbiAgICAgICAgICAgIGxpZmVwYXRoPXtnYW1lLmNoYXJhY3Rlci5saWZlcGF0aH1cbiAgICAgICAgICAgIG9uRG9uZT17KCkgPT4gZ28oXCJnYW1lXCIsICgpID0+IHNldEluR2FtZSh0cnVlKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgICAge3NjcmVlbiA9PT0gXCJnYW1lXCIgJiYgKFxuICAgICAgICAgIDxHYW1lSHVkIG9uUGF1c2U9eygpID0+IGdvKFwibWVudVwiKX0gZ2FtZT17Z2FtZSA/PyB1bmRlZmluZWR9IC8+XG4gICAgICAgICl9XG4gICAgICAgIHtkaWFsb2cgJiYgKFxuICAgICAgICAgIDxDb25maXJtXG4gICAgICAgICAgICB0ZXh0PXtkaWFsb2cudGV4dH1cbiAgICAgICAgICAgIG9uQ29uZmlybT17ZGlhbG9nLm9uQ29uZmlybX1cbiAgICAgICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBzZXREaWFsb2cobnVsbCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIHtkZWJ1Z1BvcnRhbCAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3sgLi4uRklMTCwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxwb3J0YWxcbiAgICAgICAgICAgIHRhcmdldD17ZGVidWdQb3J0YWxbMF19XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogTnVtYmVyKGRlYnVnUG9ydGFsWzFdID8/IDY0MCksXG4gICAgICAgICAgICAgIGhlaWdodDogTnVtYmVyKGRlYnVnUG9ydGFsWzJdID8/IDM2MCksXG4gICAgICAgICAgICAgIGNhY2hlOiBcIm5ldmVyXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICl9XG4gICAgICB7c2V0dGluZ3Muc2NhbmxpbmVzICYmIChcbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uRklMTCwgYmFja2dyb3VuZEltYWdlOiBTQ0FOTElORVMgfX0gLz5cbiAgICAgICl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogTm93LCBhcyB0aGUgc2F2ZSBsaXN0IHNob3dzIGl0OiBcIjEwLzA3LzkxLCA5OjEyIFBNXCIgKHRoZSBnYW1lJ3MgeWVhcikuICovXG5mdW5jdGlvbiBzdGFtcCgpIHtcbiAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGggPSBkLmdldEhvdXJzKCkgJSAxMiB8fCAxMjtcbiAgY29uc3QgbSA9IGQuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBhbXBtID0gZC5nZXRIb3VycygpIDwgMTIgPyBcIkFNXCIgOiBcIlBNXCI7XG4gIGNvbnN0IG1tID0gKGQuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBkZCA9IGQuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICByZXR1cm4gYCR7bW19LyR7ZGR9LzkxLCAke2h9OiR7bX0gJHthbXBtfWA7XG59XG4iLCAiLy8gQGdlbmVyYXRlZCBieSBiZXZ5LXJlYWN0IOKAlCBkbyBub3QgZWRpdCBieSBoYW5kLlxuLy8gTWlycm9ycyB0aGUgUnVzdCBgI1tyZWFjdF9tZXNzYWdlXWAgLyBgI1tyZWFjdF9yZXF1ZXN0XWAgLyBgI1tyZWFjdF9ldmVudF1gXG4vLyB0eXBlcyBhbmQgdGhlIHJlZ2lzdGVyZWQgYCNbcmVhY3RfZmlsdGVyXWBzIC8gYCNbcmVhY3RfbW9ycGhfZmlsdGVyXWBzIChwbHVzXG4vLyBidWlsdC1pbnMpLiBSZWdlbmVyYXRlIHZpYSB5b3VyIGFwcCdzIGBBcHA6OmV4cG9ydF9yZWFjdF90eXBlc2NyaXB0YCBleHBvcnRlci5cblxuaW1wb3J0IHtcbiAgZW1pdCBhcyByYXdFbWl0LFxuICByZXF1ZXN0IGFzIHJhd1JlcXVlc3QsXG4gIGFkZEV2ZW50TGlzdGVuZXIgYXMgcmF3QWRkRXZlbnRMaXN0ZW5lcixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lciBhcyByYXdSZW1vdmVFdmVudExpc3RlbmVyLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUsIFJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBBbmNob3JTY2FsaW5nLCBBbmltYXRhYmxlLCBCZXZ5QXR0cmlidXRlcywgQmV2eUNhbnZhc0VsZW1lbnQsIEJldnlGb2N1c1Byb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlTaGFwZVRyYW5zaXRpb24sIEJldnlTdHlsZSwgQmV2eVZhcmlhbnRQcm9wcywgQmV2eVdoZWVsUHJvcHMsIENhbnZhc1BhaW50ZXIsIERyYXdDbWQsIFZlYzMgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuXG5leHBvcnQgdHlwZSBBY3QgPSB7IGFjdGlvbjogc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgQmxvb21QYXJhbXMgPSB7IHJhZGl1czogbnVtYmVyIHwgc3RyaW5nLCB0aHJlc2hvbGQ6IG51bWJlciwgaW50ZW5zaXR5OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBCbHVyUGFyYW1zID0geyByYWRpdXM6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIEJyaWdodG5lc3NQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ2FudmFzU2l6ZSA9IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBDaHJvbWF0aWNBYmVycmF0aW9uUGFyYW1zID0geyBvZmZzZXQ6IG51bWJlciB8IHN0cmluZywgYW5nbGU6IG51bWJlciB8IHN0cmluZywgXG4vKipcbiAqIFRhbmdlbnRpYWwgc3dpcmw6IHRoZSBSIGltYWdlIHJvdGF0ZXMgYnkgYCtyb3RhdGlvbmAgZGVncmVlc1xuICogKGNsb2Nrd2lzZSwgeS1kb3duKSBhcm91bmQgdGhlIG5vZGUncyBjZW50ZXIsIEIgYnkgYC1yb3RhdGlvbmAuXG4gKiBQbGFpbiBudW1iZXIgaW4gZGVncmVlcyDigJQgYSBzY2FsYXIgbWFnbml0dWRlLCBzbyB0cmFuc2l0aW9ucyB1bndpbmRcbiAqIGxpbmVhcmx5IHRocm91Z2ggZXZlcnkgdHVybi4gMCA9IHB1cmVseSBkaXJlY3Rpb25hbCBzcGxpdC5cbiAqL1xucm90YXRpb246IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENvbnRyYXN0UGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENyb3NzZmFkZVBhcmFtcyA9IHsgXG4vKipcbiAqIDAuLjEgc3RhZ2dlciBhbW91bnQ7IDAgaXMgdGhlIHBsYWluIHVuaWZvcm0gY3Jvc3NmYWRlLlxuICovXG5zcHJlYWQ6IG51bWJlciwgXG4vKipcbiAqIE5vaXNlIGZlYXR1cmUgc2l6ZSBpbiBsb2dpY2FsIHB4LlxuICovXG5zY2FsZTogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogMC4uMSBsb2NhbCBmYWRlIHdpbmRvdyAoZnJhY3Rpb24gb2YgdGhlIHByb2dyZXNzIHJhbmdlKS5cbiAqL1xuc29mdG5lc3M6IG51bWJlciwgXG4vKipcbiAqIFJlLXJvbGxzIHRoZSBub2lzZSBwYXR0ZXJuIChkb21haW4gb2Zmc2V0KS5cbiAqL1xuc2VlZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEF4aXNDaGFuZ2UgPSB7IGdhbWVwYWQ6IG51bWJlciwgYXhpczogR2FtZXBhZEF4aXNOYW1lLCB2YWx1ZTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEF4aXNOYW1lID0gXCJsZWZ0U3RpY2tYXCIgfCBcImxlZnRTdGlja1lcIiB8IFwibGVmdFpcIiB8IFwicmlnaHRTdGlja1hcIiB8IFwicmlnaHRTdGlja1lcIiB8IFwicmlnaHRaXCIgfCB7IFwib3RoZXJcIjogbnVtYmVyIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQnV0dG9uQ2hhbmdlID0geyBnYW1lcGFkOiBudW1iZXIsIGJ1dHRvbjogR2FtZXBhZEJ1dHRvbk5hbWUsIFxuLyoqXG4gKiBEaWdpdGFsIHN0YXRlIGFmdGVyIHRoZSBjaGFuZ2UgKHRocmVzaG9sZHMgZnJvbSBgR2FtZXBhZFNldHRpbmdzYCkuXG4gKi9cbnByZXNzZWQ6IGJvb2xlYW4sIFxuLyoqXG4gKiBBbmFsb2cgdmFsdWUgaW4gYDAuMC4uPTEuMGAgKHRyaWdnZXJzIHJlcG9ydCB0aGUgZnVsbCByYW5nZSkuXG4gKi9cbnZhbHVlOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQnV0dG9uTmFtZSA9IFwic291dGhcIiB8IFwiZWFzdFwiIHwgXCJub3J0aFwiIHwgXCJ3ZXN0XCIgfCBcImNcIiB8IFwielwiIHwgXCJsZWZ0VHJpZ2dlclwiIHwgXCJsZWZ0VHJpZ2dlcjJcIiB8IFwicmlnaHRUcmlnZ2VyXCIgfCBcInJpZ2h0VHJpZ2dlcjJcIiB8IFwic2VsZWN0XCIgfCBcInN0YXJ0XCIgfCBcIm1vZGVcIiB8IFwibGVmdFRodW1iXCIgfCBcInJpZ2h0VGh1bWJcIiB8IFwiZFBhZFVwXCIgfCBcImRQYWREb3duXCIgfCBcImRQYWRMZWZ0XCIgfCBcImRQYWRSaWdodFwiIHwgeyBcIm90aGVyXCI6IG51bWJlciB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZENvbm5lY3RlZCA9IEdhbWVwYWRDb25uZWN0ZWREYXRhO1xuZXhwb3J0IHR5cGUgR2FtZXBhZENvbm5lY3RlZERhdGEgPSB7IFxuLyoqXG4gKiBNb25vdG9uaWMgd2lyZSBpZCDigJQgbmV2ZXIgcmV1c2VkIGFjcm9zcyByZWNvbm5lY3RzLlxuICovXG5nYW1lcGFkOiBudW1iZXIsIFxuLyoqXG4gKiBPUy1wcm92aWRlZCBkZXZpY2UgbmFtZS5cbiAqL1xubmFtZTogc3RyaW5nLCBcbi8qKlxuICogVVNCIHZlbmRvciBpZCwgd2hlbiB0aGUgYmFja2VuZCBrbm93cyBpdC5cbiAqL1xudmVuZG9ySWQ6IG51bWJlciB8IG51bGwsIFxuLyoqXG4gKiBVU0IgcHJvZHVjdCBpZCwgd2hlbiB0aGUgYmFja2VuZCBrbm93cyBpdC5cbiAqL1xucHJvZHVjdElkOiBudW1iZXIgfCBudWxsLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZERpc2Nvbm5lY3RlZCA9IEdhbWVwYWREaXNjb25uZWN0ZWREYXRhO1xuZXhwb3J0IHR5cGUgR2FtZXBhZERpc2Nvbm5lY3RlZERhdGEgPSB7IFxuLyoqXG4gKiBUaGUgd2lyZSBpZCB0aGUgcGFkIHdhcyBhbm5vdW5jZWQgdW5kZXIuIFJldGlyZWQgZm9yIGdvb2QuXG4gKi9cbmdhbWVwYWQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRJbnB1dERhdGEgPSB7IGJ1dHRvbnM6IEFycmF5PEdhbWVwYWRCdXR0b25DaGFuZ2U+LCBheGVzOiBBcnJheTxHYW1lcGFkQXhpc0NoYW5nZT4sIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkSW5wdXRFdmVudCA9IEdhbWVwYWRJbnB1dERhdGE7XG5leHBvcnQgdHlwZSBHYW1lcGFkUnVtYmxlID0geyBcbi8qKlxuICogV2lyZSBpZCBmcm9tIFtgR2FtZXBhZENvbm5lY3RlZGBdLlxuICovXG5nYW1lcGFkOiBudW1iZXIsIFxuLyoqXG4gKiBNaWxsaXNlY29uZHMgKHdlYi1gcGxheUVmZmVjdGAtbGlrZSkuIE5lZ2F0aXZlIHZhbHVlcyBjbGFtcCB0byAwLlxuICovXG5kdXJhdGlvbjogbnVtYmVyLCBcbi8qKlxuICogTG93LWZyZXF1ZW5jeSBtb3RvciBpbnRlbnNpdHksIGNsYW1wZWQgdG8gYDAuMC4uPTEuMGAuXG4gKi9cbnN0cm9uZ01vdG9yOiBudW1iZXIsIFxuLyoqXG4gKiBIaWdoLWZyZXF1ZW5jeSBtb3RvciBpbnRlbnNpdHksIGNsYW1wZWQgdG8gYDAuMC4uPTEuMGAuXG4gKi9cbndlYWtNb3RvcjogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZFN0b3BSdW1ibGUgPSB7IGdhbWVwYWQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbW1hID0geyBcbi8qKlxuICogMSA9IHVuY2hhbmdlZDsgYWJvdmUgMSBicmlnaHRlci5cbiAqL1xudmFsdWU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbW1hU2V0dGluZ3MgPSB7IFxuLyoqXG4gKiAxID0gdW5jaGFuZ2VkOyBhYm92ZSAxIGxpZnRzIHRoZSBkYXJrcywgYmVsb3cgc2lua3MgdGhlbS5cbiAqL1xudmFsdWU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdsaXRjaCA9IHsgXG4vKipcbiAqIEhvdyBicm9rZW4gdGhlIHNpZ25hbCBpcywgMC4uMS5cbiAqL1xuaW50ZW5zaXR5OiBudW1iZXIsIFxuLyoqXG4gKiAwID0gZ2xpdGNoaW5nIGFsbCB0aGUgdGltZTsgYWJvdmUgMCwgdGhlIGNoYW5jZSBhIHF1YXJ0ZXIgc2Vjb25kXG4gKiBnbGl0Y2hlcyAoYnVyc3RzKS5cbiAqL1xuZnJlcXVlbmN5OiBudW1iZXIsIFxuLyoqXG4gKiBIb3cgZmFyIHRoZSBjaGFubmVscyBzcGxpdCBhdCBmdWxsIGludGVuc2l0eSwgcHguXG4gKi9cbnNwbGl0OiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiBIb3cgZmFyIGEgdG9ybiBzbGljZSBtb3ZlcyBhdCBmdWxsIGludGVuc2l0eSwgcHggKOKJpCAzMikuXG4gKi9cbnRlYXI6IG51bWJlciB8IHN0cmluZywgXG4vKipcbiAqIERlY29ycmVsYXRlcyBnbGl0Y2hlcyB0aGF0IHJ1biBzaWRlIGJ5IHNpZGUuXG4gKi9cbnNlZWQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdsaXRjaFN3YXAgPSB7IFxuLyoqXG4gKiBIb3cgZmFyIHRoZSBjaGFubmVscyBzcGxpdCBhdCB0aGUgbWlkcG9pbnQsIHB4LlxuICovXG5zcGxpdDogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogVGhlIGNvbG9yIG9mIHRoZSBmbGFzaGluZyBiYW5kcyAoYWxwaGEgPSBob3cgc3Ryb25nKS5cbiAqL1xudGludDogc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgR3JhZGllbnRNYXBQYXJhbXMgPSB7IGFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIHN0b3BzOiBBcnJheTxHcmFkaWVudE1hcFN0b3A+LCBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYWRpZW50TWFwU3RvcCA9IHsgY29sb3I6IHN0cmluZywgcG9zaXRpb24/OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHcmFpbiA9IHsgXG4vKipcbiAqIEhvdyBzdHJvbmcgdGhlIHN0cm9uZ2VzdCBncmFpbnMgYXJlLCAwLi4xLlxuICovXG5hbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYXBoaWNzU2V0dGluZ3MgPSB7IFxuLyoqXG4gKiBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3LCBkZWdyZWVzLlxuICovXG5mb3Y6IG51bWJlciwgYWJlcnJhdGlvbjogYm9vbGVhbiwgXG4vKipcbiAqIERlcHRoIG9mIGZpZWxkLlxuICovXG5mb2N1czogYm9vbGVhbiwgXG4vKipcbiAqIExlbnMgZmxhcmU6IHRoZSBibG9vbS5cbiAqL1xuZmxhcmU6IGJvb2xlYW4sIFxuLyoqXG4gKiBNb3Rpb24gYmx1cjogMCA9IG9mZiwgMSA9IGxvdywgMiA9IGhpZ2guXG4gKi9cbmJsdXI6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYXlzY2FsZVBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBIdWVSb3RhdGVQYXJhbXMgPSB7IGFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBJbnZlcnRQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgS2V5RG93biA9IEtleWJvYXJkRXZlbnREYXRhO1xuZXhwb3J0IHR5cGUgS2V5VXAgPSBLZXlib2FyZEV2ZW50RGF0YTtcbmV4cG9ydCB0eXBlIEtleWJvYXJkRXZlbnREYXRhID0geyBcbi8qKlxuICogTGF5b3V0LWF3YXJlIGxvZ2ljYWwga2V5OiB0aGUgdHlwZWQgY2hhcmFjdGVyIChgXCJhXCJgLCBgXCJBXCJgKSBvciBhIG5hbWVkXG4gKiBrZXkgKGBcIkVudGVyXCJgLCBgXCJBcnJvd0xlZnRcImAsIGBcIkVzY2FwZVwiYCkuXG4gKi9cbmtleTogc3RyaW5nLCBcbi8qKlxuICogTGF5b3V0LWluZGVwZW5kZW50IHBoeXNpY2FsIGtleSwgVzNDIGBjb2RlYCBzdHlsZSAoYFwiS2V5QVwiYCwgYFwiRW50ZXJcImApLlxuICovXG5jb2RlOiBzdHJpbmcsIFxuLyoqXG4gKiBUaGUgdGV4dCBwcm9kdWNlZCBieSB0aGUga2V5LCBpZiBhbnkgKHJlc3BlY3RzIG1vZGlmaWVycy9JTUUpLiBgbnVsbGAgZm9yXG4gKiBrZXlzIHRoYXQgZG9uJ3QgcHJvZHVjZSB0ZXh0IChlLmcuIGFycm93cywgbW9kaWZpZXJzKS5cbiAqL1xudGV4dDogc3RyaW5nIHwgbnVsbCwgXG4vKipcbiAqIFdoZXRoZXIgdGhpcyBpcyBhbiBPUyBhdXRvLXJlcGVhdCB3aGlsZSB0aGUga2V5IGlzIGhlbGQuXG4gKi9cbnJlcGVhdDogYm9vbGVhbiwgY3RybEtleTogYm9vbGVhbiwgc2hpZnRLZXk6IGJvb2xlYW4sIGFsdEtleTogYm9vbGVhbiwgXG4vKipcbiAqIFRoZSBcIk1ldGFcIi9cIlN1cGVyXCIga2V5IChXaW5kb3dzL0NvbW1hbmQpLlxuICovXG5tZXRhS2V5OiBib29sZWFuLCB9O1xuZXhwb3J0IHR5cGUgTGluZWFyV2lwZVBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc29mdG5lc3M6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIE91dGxpbmVQYXJhbXMgPSB7IHdpZHRoOiBudW1iZXIgfCBzdHJpbmcsIGNvbG9yOiBzdHJpbmcsIHNvZnRuZXNzOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBQaW5jaFBhcmFtcyA9IHsgXG4vKipcbiAqIFBpbmNoIGNlbnRlciwgMC4uMSBhY3Jvc3MgdGhlIG5vZGUgcmVjdCAoMCA9IGxlZnQgZWRnZSkuXG4gKi9cbng6IG51bWJlciwgXG4vKipcbiAqIFBpbmNoIGNlbnRlciwgMC4uMSBhY3Jvc3MgdGhlIG5vZGUgcmVjdCAoMCA9IHRvcCBlZGdlKS5cbiAqL1xueTogbnVtYmVyLCBcbi8qKlxuICogLTEgKGZ1bGwgYnVsZ2UpIC4uPSAxIChmdWxsIHBpbmNoKTsgMCBpcyBpZGVudGl0eS5cbiAqL1xuc3RyZW5ndGg6IG51bWJlciwgXG4vKipcbiAqIEVmZmVjdCByYWRpdXMgYXMgYSBmcmFjdGlvbiBvZiB0aGUgbm9kZSdzIGxhcmdlciBkaW1lbnNpb24uXG4gKi9cbnJhZGl1czogbnVtYmVyLCBcbi8qKlxuICogRGlmZnVzZSBzaGFkaW5nIGludGVuc2l0eTogMCAodW5saXQsIHRoZSBkZWZhdWx0KSwgMSBub21pbmFsOyBsYXJnZXJcbiAqIHZhbHVlcyBvdmVyZHJpdmUsIGxpa2UgYGJyaWdodG5lc3NgLlxuICovXG5saWdodDogbnVtYmVyLCBcbi8qKlxuICogRGlyZWN0aW9uIHRoZSBsaWdodCBjb21lcyBGUk9NOiBkZWdyZWVzIGNsb2Nrd2lzZSBmcm9tICtYIGluIHNjcmVlblxuICogc3BhY2UgKGJhcmUgbnVtYmVyID0gZGVncmVlcywgYFwiMC4yNXR1cm5cImAgZXRjLiBhY2NlcHRlZCkuIERlZmF1bHRcbiAqIC0xMzUgPSB0b3AtbGVmdC5cbiAqL1xubGlnaHRBbmdsZTogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogU3BlY3VsYXIgKHdoaXRlKSBoaWdobGlnaHQgaW50ZW5zaXR5OiAwIChvZmYsIHRoZSBkZWZhdWx0KSwgMVxuICogbm9taW5hbDsgbGFyZ2VyIHZhbHVlcyBvdmVyZHJpdmUuXG4gKi9cbmdsb3NzOiBudW1iZXIsIFxuLyoqXG4gKiBTaXplIG9mIHRoZSBzcGVjdWxhciBoaWdobGlnaHQsIDAgKGEgcGlucG9pbnQpIC4uPSAxIChhIGJyb2FkIHNoZWVuKTtcbiAqIGRlZmF1bHQgMC4zLiBNYXBwZWQgbG9nLXdpc2Ugb250byBhIEJsaW5uLVBob25nIGV4cG9uZW50IGluIHRoZSBzaGFkZXJcbiAqICgxMjggYXQgMCwgfjMyIGF0IDAuMywgMSBhdCAxKS5cbiAqL1xuZ2xvc3NTaXplOiBudW1iZXIsIFxuLyoqXG4gKiBIb3cgdGhlIGVmZmVjdCBtZWV0cyBpdHMgcmltLCAwLi49MTogMCBpcyBhIGxpbmVhciBvbnNldCAoYSB2aXNpYmxlXG4gKiBjcmVhc2UsIGxpa2UgYSBwcmVzc2VkIGNvaW4gZWRnZSksIDAuNSAodGhlIGRlZmF1bHQpIHRoZSBjbGFzc2ljIGB1XjJgXG4gKiBzbW9vdGhzdGVwLWxpa2UgZmFkZSwgMSBhbiBpbXBlcmNlcHRpYmxlIGB1XjRgIGZhZGUtaW4uXG4gKi9cbm91dGVyU29mdG5lc3M6IG51bWJlciwgXG4vKipcbiAqIEhvdyB0aGUgZWZmZWN0IHBlYWtzIGF0IGl0cyBjZW50ZXIsIDAuLj0xOiAwIGlzIGEgY29uZSB0aXAgKGEgcG9pbnRlZFxuICogcGl0L3BlYWsgdGhlIGxpZ2h0aW5nIHNob3dzIGFzIGEgcG9pbnQpLCAwLjUgKHRoZSBkZWZhdWx0KSBhIHJvdW5kZWRcbiAqIGJvd2wsIDEgYSBicm9hZCBmbGF0IGZsb29yLiBJbmRlcGVuZGVudCBvZiBgb3V0ZXJTb2Z0bmVzc2A6IHRoZVxuICogcHJvZmlsZSBpcyBgMSAtICgxIC0gdV5hKV5iYCB3aXRoIGBhYC9gYmAgZnJvbSB0aGUgdHdvIGtub2JzLlxuICovXG5pbm5lclNvZnRuZXNzOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBQaXhlbGl6ZVBhcmFtcyA9IHsgXG4vKipcbiAqIENlbGxzIGFjcm9zcyB4L3kgYXQgdGhlIG1vc2FpYydzIGNvYXJzZXN0ICh1cHN0cmVhbSBgc3F1YXJlc01pbmApLlxuICovXG5zcXVhcmVzTWluOiBbbnVtYmVyLCBudW1iZXJdLCBcbi8qKlxuICogRGlzY3JldGUgY2VsbC1zaXplIGxldmVsczsgYDw9IDBgIGZvciBhIGNvbnRpbnVvdXMgcmFtcC5cbiAqL1xuc3RlcHM6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFBsYXkgPSB7IG5hbWU6IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIFF1aXQgPSBudWxsO1xuZXhwb3J0IHR5cGUgUmVzaXplID0gV2luZG93U2l6ZTtcbmV4cG9ydCB0eXBlIFNhdHVyYXRlUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNlcGlhUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNldERpZmZpY3VsdHkgPSB7IGxldmVsOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBTZXRXb3JsZCA9IHsgbGlmZXBhdGg6IHN0cmluZyB8IG51bGwsIH07XG5leHBvcnQgdHlwZSBTaGFkb3dQYXJhbXMgPSB7IGNvbG9yOiBzdHJpbmcsIG9mZnNldFg6IG51bWJlciB8IHN0cmluZywgb2Zmc2V0WTogbnVtYmVyIHwgc3RyaW5nLCBzcHJlYWQ6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIFZpZGVvU2V0dGluZ3MgPSB7IFxuLyoqXG4gKiAwID0gd2luZG93ZWQsIDEgPSBib3JkZXJsZXNzLCAyID0gZnVsbHNjcmVlbi5cbiAqL1xubW9kZTogbnVtYmVyLCBcbi8qKlxuICogVGhlIHdpbmRvd2VkIHNpemUsIHBoeXNpY2FsIHB4LlxuICovXG53aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgdnN5bmM6IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBWb2x1bWUgPSB7IG1hc3RlcjogbnVtYmVyLCBzZng6IG51bWJlciwgbXVzaWM6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFdpbmRvd1NpemUgPSB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB9O1xuXG4vKiogRXZlcnkgYGVtaXRgIG5hbWUgYW5kIHRoZSBwYXlsb2FkIHR5cGUgaXQgY2Fycmllcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RNZXNzYWdlcyB7XG4gIFwiYXBwLnF1aXRcIjogUXVpdDtcbiAgXCJkaW9yYW1hcy5kaWZmaWN1bHR5XCI6IFNldERpZmZpY3VsdHk7XG4gIFwiZGlvcmFtYXMud29ybGRcIjogU2V0V29ybGQ7XG4gIFwiZ2FtZXBhZC5ydW1ibGVcIjogR2FtZXBhZFJ1bWJsZTtcbiAgXCJnYW1lcGFkLnN0b3BSdW1ibGVcIjogR2FtZXBhZFN0b3BSdW1ibGU7XG4gIFwic2V0dGluZ3MuZ2FtbWFcIjogR2FtbWFTZXR0aW5ncztcbiAgXCJzZXR0aW5ncy5ncmFwaGljc1wiOiBHcmFwaGljc1NldHRpbmdzO1xuICBcInNldHRpbmdzLnZpZGVvXCI6IFZpZGVvU2V0dGluZ3M7XG4gIFwic291bmQucGxheVwiOiBQbGF5O1xuICBcInNvdW5kLnZvbHVtZVwiOiBWb2x1bWU7XG59XG5cbi8qKiBFdmVyeSBgcmVxdWVzdGAgbmFtZSBhbmQgaXRzIHJlcXVlc3QvcmVzcG9uc2UgdHlwZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYWN0UmVxdWVzdHMge1xuICBcImdhbWVwYWQuZ2V0QWxsXCI6IHsgcmVxdWVzdDogbnVsbDsgcmVzcG9uc2U6IEFycmF5PEdhbWVwYWRDb25uZWN0ZWREYXRhPiB9O1xuICBcIndpbmRvdy5zaXplXCI6IHsgcmVxdWVzdDogbnVsbDsgcmVzcG9uc2U6IFdpbmRvd1NpemUgfTtcbn1cblxuLyoqIEV2ZXJ5IEJldnkg4oaSIFJlYWN0IGV2ZW50IG5hbWUgYW5kIHRoZSBwYXlsb2FkIGl0IGNhcnJpZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYWN0RXZlbnRzIHtcbiAgXCJkZWJ1Zy5hY3RcIjogQWN0O1xuICBnYW1lcGFkQ29ubmVjdGVkOiBHYW1lcGFkQ29ubmVjdGVkO1xuICBnYW1lcGFkRGlzY29ubmVjdGVkOiBHYW1lcGFkRGlzY29ubmVjdGVkO1xuICBnYW1lcGFkSW5wdXQ6IEdhbWVwYWRJbnB1dEV2ZW50O1xuICBrZXlEb3duOiBLZXlEb3duO1xuICBrZXlVcDogS2V5VXA7XG4gIHJlc2l6ZTogUmVzaXplO1xufVxuXG4vKiogRXZlcnkgcmVnaXN0ZXJlZCBmaWx0ZXIgbmFtZSBhbmQgaXRzIHBhcmFtcyB0eXBlLCBzcGxpdCBieSBmYW1pbHkuXG4gKiAgQXVnbWVudHMgdGhlIGVtcHR5IGBCZXZ5RmlsdGVyc2AgKHJlZ3VsYXIgZmlsdGVycyDigJQgdGhlIGBmaWx0ZXJgIGFuZFxuICogIGBiYWNrZHJvcEZpbHRlcmAgY2hhaW5zKSBhbmQgYEJldnlNb3JwaEZpbHRlcnNgICh0d28taW5wdXQgbW9ycGhcbiAqICBmaWx0ZXJzIOKAlCB0aGUgYG1vcnBoRmlsdGVyYCBzdHlsZSkgcmVnaXN0cnkgaW50ZXJmYWNlcyBpbiB0aGVcbiAqICBgYmV2eS1yZWFjdGAgcGFja2FnZSwgc28gZWFjaCBzdHlsZSBmaWVsZCB0eXBlcyBpdHMgbmFtZXMnIHBhcmFtcy4gKi9cbmRlY2xhcmUgbW9kdWxlIFwiYmV2eS1yZWFjdFwiIHtcbiAgaW50ZXJmYWNlIEJldnlGaWx0ZXJzIHtcbiAgICBibG9vbTogQmxvb21QYXJhbXM7XG4gICAgYmx1cjogQmx1clBhcmFtcztcbiAgICBicmlnaHRuZXNzOiBCcmlnaHRuZXNzUGFyYW1zO1xuICAgIGNocm9tYXRpY0FiZXJyYXRpb246IENocm9tYXRpY0FiZXJyYXRpb25QYXJhbXM7XG4gICAgY29udHJhc3Q6IENvbnRyYXN0UGFyYW1zO1xuICAgIGdhbW1hOiBHYW1tYTtcbiAgICBnbGl0Y2g6IEdsaXRjaDtcbiAgICBncmFkaWVudE1hcDogR3JhZGllbnRNYXBQYXJhbXM7XG4gICAgZ3JhaW46IEdyYWluO1xuICAgIGdyYXlzY2FsZTogR3JheXNjYWxlUGFyYW1zO1xuICAgIGh1ZVJvdGF0ZTogSHVlUm90YXRlUGFyYW1zO1xuICAgIGludmVydDogSW52ZXJ0UGFyYW1zO1xuICAgIG91dGxpbmU6IE91dGxpbmVQYXJhbXM7XG4gICAgcGluY2g6IFBpbmNoUGFyYW1zO1xuICAgIHNhdHVyYXRlOiBTYXR1cmF0ZVBhcmFtcztcbiAgICBzZXBpYTogU2VwaWFQYXJhbXM7XG4gICAgc2hhZG93OiBTaGFkb3dQYXJhbXM7XG4gIH1cbiAgaW50ZXJmYWNlIEJldnlNb3JwaEZpbHRlcnMge1xuICAgIGNyb3NzZmFkZTogQ3Jvc3NmYWRlUGFyYW1zO1xuICAgIGdsaXRjaFN3YXA6IEdsaXRjaFN3YXA7XG4gICAgbGluZWFyV2lwZTogTGluZWFyV2lwZVBhcmFtcztcbiAgICBwaXhlbGl6ZTogUGl4ZWxpemVQYXJhbXM7XG4gIH1cbn1cblxuLyoqIFRoZSBhcHAncyBvd24gZWxlbWVudHMnIHByb3BzIChgYXBwLmFkZF9yZWFjdF9lbGVtZW50YCkuICovXG5leHBvcnQgaW50ZXJmYWNlIEJldnlBbmNob3JQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzLCBCZXZ5Rm9jdXNQcm9wcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICBlbnRpdHk6IG51bWJlciB8IGJpZ2ludDtcbiAgb2Zmc2V0PzogVmVjMztcbiAgc2NhbGU/OiBBbmNob3JTY2FsaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5Q2FudmFzUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVZhcmlhbnRQcm9wcywgQmV2eVBvaW50ZXJQcm9wcywgQmV2eVNjcm9sbFByb3BzLCBCZXZ5V2hlZWxQcm9wcywgQmV2eUZvY3VzUHJvcHMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgZHJhdz86IENhbnZhc1BhaW50ZXIgfCBEcmF3Q21kW107XG4gIG9uUmVzaXplPzogKHBheWxvYWQ6IENhbnZhc1NpemUpID0+IHZvaWQ7XG4gIHJlZj86IFJlZjxCZXZ5Q2FudmFzRWxlbWVudD47XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlDaXJjbGVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgY3g/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGN5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5RWxsaXBzZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBjeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgY3k/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHJ4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUdQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzIHtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUxpbmVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgeDE/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHkxPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB4Mj86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgeTI/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQYXRoUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIGQ/OiBzdHJpbmc7XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb2x5Z29uUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIHBvaW50cz86IG51bWJlcltdO1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UG9seWxpbmVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgcG9pbnRzPzogbnVtYmVyW107XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb3J0YWxQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzLCBCZXZ5Rm9jdXNQcm9wcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVJlY3RQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgeT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgd2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGhlaWdodD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcng/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHJ5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5U3VyZmFjZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgdGFyZ2V0OiBzdHJpbmc7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlTdmdQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzLCBCZXZ5Rm9jdXNQcm9wcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICB2aWV3Qm94Pzogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuLyoqIFRoZSBhcHAncyBvd24gZWxlbWVudHMgKGBhcHAuYWRkX3JlYWN0X2VsZW1lbnRgKS4gQXVnbWVudHMgdGhlXG4gKiAgYEJldnlJbnRyaW5zaWNFbGVtZW50c2AgaW50ZXJmYWNlIGluIHRoZSBgYmV2eS1yZWFjdGAgcGFja2FnZSwgc28gSlNYXG4gKiAgdHlwZXMgdGhlbS4gKi9cbmRlY2xhcmUgbW9kdWxlIFwiYmV2eS1yZWFjdFwiIHtcbiAgaW50ZXJmYWNlIEJldnlJbnRyaW5zaWNFbGVtZW50cyB7XG4gICAgYW5jaG9yOiBCZXZ5QW5jaG9yUHJvcHM7XG4gICAgY2FudmFzOiBCZXZ5Q2FudmFzUHJvcHM7XG4gICAgY2lyY2xlOiBCZXZ5Q2lyY2xlUHJvcHM7XG4gICAgZWxsaXBzZTogQmV2eUVsbGlwc2VQcm9wcztcbiAgICBnOiBCZXZ5R1Byb3BzO1xuICAgIGxpbmU6IEJldnlMaW5lUHJvcHM7XG4gICAgcGF0aDogQmV2eVBhdGhQcm9wcztcbiAgICBwb2x5Z29uOiBCZXZ5UG9seWdvblByb3BzO1xuICAgIHBvbHlsaW5lOiBCZXZ5UG9seWxpbmVQcm9wcztcbiAgICBwb3J0YWw6IEJldnlQb3J0YWxQcm9wcztcbiAgICByZWN0OiBCZXZ5UmVjdFByb3BzO1xuICAgIHN1cmZhY2U6IEJldnlTdXJmYWNlUHJvcHM7XG4gICAgc3ZnOiBCZXZ5U3ZnUHJvcHM7XG4gIH1cbn1cblxuLyoqIFNlbmQgYSB0eXBlZCBhcHAgbWVzc2FnZSB0byB0aGUgQmV2eSBzaWRlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVtaXQ8SyBleHRlbmRzIGtleW9mIFJlYWN0TWVzc2FnZXM+KG5hbWU6IEssIHZhbHVlOiBSZWFjdE1lc3NhZ2VzW0tdKTogdm9pZCB7XG4gIHJhd0VtaXQobmFtZSwgdmFsdWUpO1xufVxuXG4vKiogU2VuZCBhIHR5cGVkIHJlcXVlc3QgYW5kIGF3YWl0IGl0cyB0eXBlZCByZXNwb25zZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXF1ZXN0PEsgZXh0ZW5kcyBrZXlvZiBSZWFjdFJlcXVlc3RzPihcbiAgbmFtZTogSyxcbiAgdmFsdWU6IFJlYWN0UmVxdWVzdHNbS11bXCJyZXF1ZXN0XCJdLFxuKTogUHJvbWlzZTxSZWFjdFJlcXVlc3RzW0tdW1wicmVzcG9uc2VcIl0+IHtcbiAgcmV0dXJuIHJhd1JlcXVlc3QobmFtZSwgdmFsdWUpIGFzIFByb21pc2U8UmVhY3RSZXF1ZXN0c1tLXVtcInJlc3BvbnNlXCJdPjtcbn1cblxuLyoqIFN1YnNjcmliZSB0byBhIHR5cGVkIEJldnkg4oaSIFJlYWN0IGV2ZW50LiBSZXR1cm5zIGFuIHVuc3Vic2NyaWJlIGZuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uPEsgZXh0ZW5kcyBrZXlvZiBSZWFjdEV2ZW50cz4oXG4gIG5hbWU6IEssXG4gIGNiOiAodmFsdWU6IFJlYWN0RXZlbnRzW0tdKSA9PiB2b2lkLFxuKTogKCkgPT4gdm9pZCB7XG4gIHJhd0FkZEV2ZW50TGlzdGVuZXIobmFtZSwgY2IgYXMgKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkKTtcbiAgcmV0dXJuICgpID0+IHJhd1JlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgY2IgYXMgKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkKTtcbn1cblxuLyoqIFVuc3Vic2NyaWJlIGEgbGlzdGVuZXIgcHJldmlvdXNseSBwYXNzZWQgdG8gYG9uYC9gYWRkRXZlbnRMaXN0ZW5lcmAuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcjxLIGV4dGVuZHMga2V5b2YgUmVhY3RFdmVudHM+KFxuICBuYW1lOiBLLFxuICBjYjogKHZhbHVlOiBSZWFjdEV2ZW50c1tLXSkgPT4gdm9pZCxcbik6IHZvaWQge1xuICByYXdSZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG59XG5cbi8qKiBTdHJ1Y3R1cmVkLCBmdWxseSB0eXBlZCBwcm94eSBvdmVyIGV2ZXJ5IG1lc3NhZ2UsIHJlcXVlc3QsIGFuZCBldmVudC4gKi9cbmV4cG9ydCBjb25zdCBiZXZ5ID0ge1xuICBlbWl0LFxuICByZXF1ZXN0LFxuICBvbixcbiAgYWRkRXZlbnRMaXN0ZW5lcjogb24sXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIsXG4gIGFwcDoge1xuICAgIHF1aXQodmFsdWU6IFF1aXQpOiB2b2lkIHsgZW1pdChcImFwcC5xdWl0XCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgZGlvcmFtYXM6IHtcbiAgICBkaWZmaWN1bHR5KHZhbHVlOiBTZXREaWZmaWN1bHR5KTogdm9pZCB7IGVtaXQoXCJkaW9yYW1hcy5kaWZmaWN1bHR5XCIsIHZhbHVlKTsgfSxcbiAgICB3b3JsZCh2YWx1ZTogU2V0V29ybGQpOiB2b2lkIHsgZW1pdChcImRpb3JhbWFzLndvcmxkXCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgZ2FtZXBhZDoge1xuICAgIGdldEFsbCgpOiBQcm9taXNlPEFycmF5PEdhbWVwYWRDb25uZWN0ZWREYXRhPj4geyByZXR1cm4gcmVxdWVzdChcImdhbWVwYWQuZ2V0QWxsXCIsIG51bGwpOyB9LFxuICAgIHJ1bWJsZSh2YWx1ZTogR2FtZXBhZFJ1bWJsZSk6IHZvaWQgeyBlbWl0KFwiZ2FtZXBhZC5ydW1ibGVcIiwgdmFsdWUpOyB9LFxuICAgIHN0b3BSdW1ibGUodmFsdWU6IEdhbWVwYWRTdG9wUnVtYmxlKTogdm9pZCB7IGVtaXQoXCJnYW1lcGFkLnN0b3BSdW1ibGVcIiwgdmFsdWUpOyB9LFxuICB9LFxuICBzZXR0aW5nczoge1xuICAgIGdhbW1hKHZhbHVlOiBHYW1tYVNldHRpbmdzKTogdm9pZCB7IGVtaXQoXCJzZXR0aW5ncy5nYW1tYVwiLCB2YWx1ZSk7IH0sXG4gICAgZ3JhcGhpY3ModmFsdWU6IEdyYXBoaWNzU2V0dGluZ3MpOiB2b2lkIHsgZW1pdChcInNldHRpbmdzLmdyYXBoaWNzXCIsIHZhbHVlKTsgfSxcbiAgICB2aWRlbyh2YWx1ZTogVmlkZW9TZXR0aW5ncyk6IHZvaWQgeyBlbWl0KFwic2V0dGluZ3MudmlkZW9cIiwgdmFsdWUpOyB9LFxuICB9LFxuICBzb3VuZDoge1xuICAgIHBsYXkodmFsdWU6IFBsYXkpOiB2b2lkIHsgZW1pdChcInNvdW5kLnBsYXlcIiwgdmFsdWUpOyB9LFxuICAgIHZvbHVtZSh2YWx1ZTogVm9sdW1lKTogdm9pZCB7IGVtaXQoXCJzb3VuZC52b2x1bWVcIiwgdmFsdWUpOyB9LFxuICB9LFxuICB3aW5kb3c6IHtcbiAgICBzaXplKCk6IFByb21pc2U8V2luZG93U2l6ZT4geyByZXR1cm4gcmVxdWVzdChcIndpbmRvdy5zaXplXCIsIG51bGwpOyB9LFxuICB9LFxufSBhcyBjb25zdDtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgaW50ZXJwb2xhdGUsXG4gIHVzZVNoYXJlZFZhbHVlLFxuICB3aXRoRGVsYXksXG4gIHdpdGhUaW1pbmcsXG4gIHR5cGUgQmV2eVN0eWxlLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgb24sIHR5cGUgS2V5Ym9hcmRFdmVudERhdGEsIHR5cGUgUmVhY3RFdmVudHMgfSBmcm9tIFwiLi9iZXZ5XCI7XG5cbi8qKiBMaXN0ZW4gdG8gYSBCZXZ5IGV2ZW50IHdoaWxlIG1vdW50ZWQ7IGBydW5gIGFsd2F5cyBzZWVzIHRoZSBsYXRlc3RcbiAqICByZW5kZXIncyBzdGF0ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VFdmVudDxLIGV4dGVuZHMga2V5b2YgUmVhY3RFdmVudHM+KFxuICBuYW1lOiBLLFxuICBydW46ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pIHtcbiAgY29uc3QgbGF0ZXN0ID0gdXNlUmVmKHJ1bik7XG4gIGxhdGVzdC5jdXJyZW50ID0gcnVuO1xuICB1c2VFZmZlY3QoKCkgPT4gb24obmFtZSwgKHZhbHVlKSA9PiBsYXRlc3QuY3VycmVudCh2YWx1ZSkpLCBbbmFtZV0pO1xufVxuXG4vKiogS2V5IHByZXNzZXMgKG5vIGF1dG8tcmVwZWF0IHVubGVzcyBgcmVwZWF0YCksIHdoaWxlIG1vdW50ZWQuIGBydW5gIGdldHNcbiAqICB0aGUgZXZlbnQ7IG1hdGNoIG9uIGBlLmtleWAgb3IgYGUuY29kZWAuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlS2V5cyhydW46IChlOiBLZXlib2FyZEV2ZW50RGF0YSkgPT4gdm9pZCwgcmVwZWF0ID0gZmFsc2UpIHtcbiAgdXNlRXZlbnQoXCJrZXlEb3duXCIsIChlKSA9PiB7XG4gICAgaWYgKGUucmVwZWF0ICYmICFyZXBlYXQpIHJldHVybjtcbiAgICBydW4oZSk7XG4gIH0pO1xufVxuXG4vKiogQSBzY3JpcHRlZCBzdGVwIGZyb20gYC0tc2hvb3Qg4oCmIC0tZG8gXCI8c2Vjcz4gPHZlcmI+IFthcmddXCJgICh0aGVcbiAqICBgZGVidWcuYWN0YCBldmVudCk6IHJ1bnMgYHJ1bihhcmcpYCBmb3IgdGhpcyBjb21wb25lbnQncyBgdmVyYmAuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVidWcodmVyYjogc3RyaW5nLCBydW46IChhcmc6IHN0cmluZykgPT4gdm9pZCkge1xuICB1c2VFdmVudChcImRlYnVnLmFjdFwiLCAoeyBhY3Rpb24gfSkgPT4ge1xuICAgIGNvbnN0IFtoZWFkLCAuLi5yZXN0XSA9IGFjdGlvbi5zcGxpdChcIiBcIik7XG4gICAgaWYgKGhlYWQgPT09IHZlcmIpIHJ1bihyZXN0LmpvaW4oXCIgXCIpKTtcbiAgfSk7XG59XG5cbi8qKiBTbGlkZSBpbiBmcm9tIGB4YCBweCB3aGlsZSBmYWRpbmcgaW4sIGFmdGVyIGBkZWxheWAgbXMgKEJldnkgcnVucyB0aGVcbiAqICBhbmltYXRpb247IFJlYWN0IHJlbmRlcnMgb25jZSkuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRW50ZXIoeCA9IC0yNCwgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDI4MCk6IEJldnlTdHlsZSB7XG4gIGNvbnN0IHQgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0LnZhbHVlID0gd2l0aERlbGF5KGRlbGF5LCB3aXRoVGltaW5nKDEsIHsgZHVyYXRpb24sIGVhc2luZzogXCJlYXNlT3V0XCIgfSkpO1xuICB9LCBbdCwgZGVsYXksIGR1cmF0aW9uXSk7XG4gIHJldHVybiB7XG4gICAgb3BhY2l0eTogeyBhbmltYXRlZDogdCB9LFxuICAgIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVYOiB7IGFuaW1hdGVkOiBpbnRlcnBvbGF0ZSh0LCBbMCwgMV0sIFt4LCAwXSkgfSB9LFxuICB9O1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgY2FuY2VsQW5pbWF0aW9uLFxuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aFJlcGVhdCxcbiAgd2l0aFNlcXVlbmNlLFxuICB3aXRoVGltaW5nLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUV2ZW50LCB1c2VLZXlzIH0gZnJvbSBcIi4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEZJTEwsIEtleWNhcCB9IGZyb20gXCIuLi91aS9raXRcIjtcbmltcG9ydCB7IG1vZGFsT3BlbiB9IGZyb20gXCIuL0RpYWxvZ1wiO1xuXG4vKiogQSBzZWN0aW9uIHRpdGxlLCBhIHJvbGUgd2l0aCBpdHMgbmFtZXMgKG9uZSByb3cgZWFjaDsgYSByb2xlIG1heSBicmVha1xuICogIG92ZXIgbGluZXMgd2l0aCBgXFxuYCksIG9yIGVtcHR5IHNwYWNlLiAqL1xudHlwZSBCbG9jayA9XG4gIHwgeyB0aXRsZTogc3RyaW5nIH1cbiAgfCB7IHJvbGU6IHN0cmluZzsgbmFtZXM6IHN0cmluZ1tdIH1cbiAgfCB7IHNwYWNlOiBudW1iZXIgfTtcblxuY29uc3QgQ1JFRElUUzogQmxvY2tbXSA9IFtcbiAgeyB0aXRsZTogXCJBIEZST05UIEVORCBCVUlMVCBXSVRIIEJFVlktUkVBQ1RcIiB9LFxuICB7IHNwYWNlOiA2MCB9LFxuICB7IHRpdGxlOiBcIlNFVCBJTiBTQUJMRSBDSVRZLCBXSEVSRSBOT0JPRFkgTE9HUyBPRkZcIiB9LFxuICB7IHJvbGU6IFwiQkVWWS1SRUFDVFwiLCBuYW1lczogW1wiTUFURVVTWiBUT01DWllLXCJdIH0sXG4gIHtcbiAgICByb2xlOiBcIkdBTUUgRU5HSU5FOiBCRVZZXCIsXG4gICAgbmFtZXM6IFtcIkNBUlRFUiBBTkRFUlNPTlwiLCBcIkFORCBUSEUgQkVWWSBDT05UUklCVVRPUlNcIl0sXG4gIH0sXG4gIHtcbiAgICByb2xlOiBcIlVJIExJQlJBUlk6IFJFQUNUXCIsXG4gICAgbmFtZXM6IFtcIk1FVEEgT1BFTiBTT1VSQ0VcIiwgXCJBTkQgVEhFIFJFQUNUIENPTlRSSUJVVE9SU1wiXSxcbiAgfSxcbiAgeyByb2xlOiBcIkpBVkFTQ1JJUFQgRU5HSU5FOiBWOFwiLCBuYW1lczogW1wiVEhFIFY4IFBST0pFQ1QgQVVUSE9SU1wiXSB9LFxuICB7IHJvbGU6IFwiRU1CRURESU5HOiBERU5PX0NPUkVcIiwgbmFtZXM6IFtcIlRIRSBERU5PIEFVVEhPUlNcIl0gfSxcbiAge1xuICAgIHJvbGU6IFwiTEFZT1VUOiBUQUZGWVwiLFxuICAgIG5hbWVzOiBbXCJESU9YVVNMQUJTXCIsIFwiQU5EIFRIRSBUQUZGWSBDT05UUklCVVRPUlNcIl0sXG4gIH0sXG4gIHsgcm9sZTogXCJURVhUIFNIQVBJTkc6IENPU01JQy1URVhUXCIsIG5hbWVzOiBbXCJTWVNURU03NlwiXSB9LFxuICB7IHJvbGU6IFwiR1JBUEhJQ1M6IFdHUFVcIiwgbmFtZXM6IFtcIlRIRSBXR1BVIENPTlRSSUJVVE9SU1wiXSB9LFxuICB7XG4gICAgcm9sZTogXCJUWVBFRkFDRTogUkFKREhBTklcXG5TSUwgT1BFTiBGT05UIExJQ0VOU0VcIixcbiAgICBuYW1lczogW1wiSU5ESUFOIFRZUEUgRk9VTkRSWVwiXSxcbiAgfSxcbiAge1xuICAgIHJvbGU6IFwiTU9OT1NQQUNFOiBKRVRCUkFJTlMgTU9OT1xcblNJTCBPUEVOIEZPTlQgTElDRU5TRVwiLFxuICAgIG5hbWVzOiBbXCJKRVRCUkFJTlNcIl0sXG4gIH0sXG4gIHsgc3BhY2U6IDExMCB9LFxuICB7IHRpdGxlOiBcIk9OIFRIRSBTVFJFRVRTIE9GIFNBQkxFIENJVFlcIiB9LFxuICB7IHJvbGU6IFwiRklYRVIsIEtFU1NMRVIgRElTVFJJQ1RcIiwgbmFtZXM6IFtcIk1BTUEgT0RVWUFcIl0gfSxcbiAgeyByb2xlOiBcIlJJUFBFUkRPQywgTEFOVEVSTiBBTExFWVwiLCBuYW1lczogW1wiRFIuIElWTyBLQUxOSU5TXCJdIH0sXG4gIHsgcm9sZTogXCJORVRSVU5ORVJTXCIsIG5hbWVzOiBbXCJTUEFSUk9XLTlcIiwgXCJHSE9TVFdJUkVcIiwgXCJMSVRUTEUgTUVSQ1lcIl0gfSxcbiAgeyByb2xlOiBcIkJMQUNLIElDRSBDT05TVUxUQU5UXCIsIG5hbWVzOiBbXCJOT0JPRFkgWU9VIEhBVkUgTUVUXCJdIH0sXG4gIHsgcm9sZTogXCJOT01BRCBDT05WT1kgTEVBRCxcXG5SRUQgTUVTQSBQQVNTXCIsIG5hbWVzOiBbXCJKVU5PIFZBU1FVRVotSEFMRVwiXSB9LFxuICB7IHJvbGU6IFwiU1RSRUVUIE1FRElDIE9OIENBTExcIiwgbmFtZXM6IFtcIlNBSU5UIE1BR1NcIl0gfSxcbiAgeyByb2xlOiBcIk1FTU9SWSBSRVBMQVkgRURJVE9SXCIsIG5hbWVzOiBbXCJPS1NBTkEgUklWRVwiXSB9LFxuICB7IHJvbGU6IFwiUkFESU8sIDkxLjQgU1RBVElDIEZNXCIsIG5hbWVzOiBbXCJESiBMT1cgQkFUVEVSWVwiXSB9LFxuICB7IHJvbGU6IFwiQ0hST01FIEZJVFRJTkdTXCIsIG5hbWVzOiBbXCJUV0lOIEJMQURFUyBDTElOSUNcIl0gfSxcbiAgeyByb2xlOiBcIkNBVEVSSU5HXCIsIG5hbWVzOiBbXCJUSEUgTk9PRExFIENBUlQgT04gNVRIIEFORCBET1JTRVRcIl0gfSxcbiAgeyBzcGFjZTogMTEwIH0sXG4gIHsgdGl0bGU6IFwiVEVOS0FJIENPUlBPUkFUSU9OXCIgfSxcbiAgeyByb2xlOiBcIkNPVU5URVJJTlRFTExJR0VOQ0VcIiwgbmFtZXM6IFtcIltSRURBQ1RFRF1cIiwgXCJbUkVEQUNURURdXCJdIH0sXG4gIHsgcm9sZTogXCJMRUdBTCBSRVZJRVcgT0ZcXG5USEVTRSBDUkVESVRTXCIsIG5hbWVzOiBbXCJURU5LQUkgTEVHQUwsIEZMT09SIDg4XCJdIH0sXG4gIHsgcm9sZTogXCJTQ1BEIElOQ0lERU5UIFJFUE9SVFNcIiwgbmFtZXM6IFtcIlNHVC4gREFMRSBQUlVJVFQgKFJFVC4pXCJdIH0sXG4gIHsgc3BhY2U6IDExMCB9LFxuICB7IHRpdGxlOiBcIlNQRUNJQUwgVEhBTktTXCIgfSxcbiAge1xuICAgIHJvbGU6IFwiRk9SIEVWRVJZIExJTkUgT0YgQ09ERVxcblVOREVSIFRIRVNFIE1FTlVTXCIsXG4gICAgbmFtZXM6IFtcIlRIRSBPUEVOLVNPVVJDRSBDT05UUklCVVRPUlNcIl0sXG4gIH0sXG4gIHsgcm9sZTogXCJGT1IgUkVBRElORyBUSElTIEZBUlwiLCBuYW1lczogW1wiWU9VXCJdIH0sXG4gIHsgc3BhY2U6IDExMCB9LFxuICB7IHRpdGxlOiBcIklOU1BJUkVEIEJZIFRIRSBNRU5VUyBPRiBDWUJFUlBVTksgMjA3NyBCWSBDRCBQUk9KRUtUIFJFRFwiIH0sXG4gIHsgc3BhY2U6IDYwIH0sXG4gIHsgdGl0bGU6IFwiTk8gU0FWRSBGSUxFUyBXRVJFIEhBUk1FRCBJTiBUSEUgTUFLSU5HIE9GIFRIRVNFIE1FTlVTXCIgfSxcbl07XG5cbmNvbnN0IFRJVExFID0gODQ7XG5jb25zdCBST1cgPSA2NDtcbmNvbnN0IExJTkUgPSAyNjtcblxuY29uc3QgaGVpZ2h0ID0gKGI6IEJsb2NrKSA9PlxuICBcInRpdGxlXCIgaW4gYlxuICAgID8gVElUTEVcbiAgICA6IFwic3BhY2VcIiBpbiBiXG4gICAgICA/IGIuc3BhY2VcbiAgICAgIDogTWF0aC5tYXgoXG4gICAgICAgICAgYi5uYW1lcy5sZW5ndGggKiBST1csXG4gICAgICAgICAgUk9XICsgKGIucm9sZS5zcGxpdChcIlxcblwiKS5sZW5ndGggLSAxKSAqIExJTkUsXG4gICAgICAgICk7XG5cbi8qKiBUaGUgY29sdW1uJ3MgaGVpZ2h0LiAqL1xuY29uc3QgSCA9IENSRURJVFMucmVkdWNlKChoLCBiKSA9PiBoICsgaGVpZ2h0KGIpLCAwKTtcbi8qKiBSb2xlcyBlbmQgbGVmdCBvZiB0aGlzIGxpbmUsIG5hbWVzIHN0YXJ0IHJpZ2h0IG9mIGl0LiAqL1xuY29uc3QgU1BMSVQgPSA2ODI7XG5cbi8qKiBTY3JvbGwgc3BlZWRzLCBweC9zLiAqL1xuY29uc3QgTk9STUFMID0gNDg7XG5jb25zdCBGQVNUID0gNTIwO1xuLyoqIFRoZSBmaXJzdCBwYXNzIG9wZW5zIHdpdGggdGhlIGNvbHVtbiBhbHJlYWR5IHVwIChpdHMgdG9wIGhlcmUp4oCmICovXG5jb25zdCBTVEFSVCA9IDE1MDtcbi8qKiDigKZsYXRlciBwYXNzZXMgcmlzZSBmcm9tIHVuZGVyIHRoZSBzY3JlZW4uICovXG5jb25zdCBFTlRFUiA9IDEwOTA7XG5cbmNvbnN0IHJvbGUgPSB7XG4gIGZvbnRTaXplOiAyMixcbiAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgY29sb3I6IFwiIzQ4YzNiZFwiLFxuICBsZXR0ZXJTcGFjaW5nOiAxLFxuICBsaW5lSGVpZ2h0OiB7IHB4OiBMSU5FIH0sXG4gIHRleHRBbGlnbjogXCJyaWdodFwiLFxufSBhcyBjb25zdDtcbmNvbnN0IG5hbWUgPSB7XG4gIGZvbnRTaXplOiAyNSxcbiAgZm9udEZhbWlseTogRi5ib2xkLFxuICBjb2xvcjogXCIjYjJmNGYzXCIsXG4gIGxldHRlclNwYWNpbmc6IDEsXG4gIGxpbmVIZWlnaHQ6IHsgcHg6IFJPVyB9LFxuICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG59IGFzIGNvbnN0O1xuY29uc3QgdGl0bGUgPSB7XG4gIGZvbnRTaXplOiAzNixcbiAgY29sb3I6IFwiI2IyZjRmM1wiLFxuICBsZXR0ZXJTcGFjaW5nOiAxLjYsXG4gIGxpbmVIZWlnaHQ6IHsgcHg6IFRJVExFIH0sXG4gIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbn0gYXMgY29uc3Q7XG5cbi8qKiBUaGUgY3JlZGl0czogdHdvIGNvbHVtbnMgcmlzaW5nIG92ZXIgdGhlIGRhdGFzY2FwZSBmb3JldmVyLiBIb2xkIEYgKG9yXG4gKiAgRW50ZXIpIHRvIGZhc3QtZm9yd2FyZDsgRXNjIGNsb3Nlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVkaXRzKHsgb25DbG9zZSB9OiB7IG9uQ2xvc2U6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCB5ID0gdXNlU2hhcmVkVmFsdWUoU1RBUlQpO1xuICBjb25zdCBbZmFzdCwgc2V0RmFzdF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIC8vIEJldnkgb3ducyB0aGUgbGl2ZSBvZmZzZXQ7IHRoaXMgaXMgZW5vdWdoIHRvIGVzdGltYXRlIGl0IHdoZW4gdGhlXG4gIC8vIHNwZWVkIGNoYW5nZXMgKGVhY2ggbmV3IGRyaXZlciBzdGFydHMgZnJvbSBCZXZ5J3Mgb3duIHJlYWRpbmcpLlxuICBjb25zdCBjbG9jayA9IHVzZVJlZih7IGZyb206IFNUQVJULCBhdDogMCwgc3BlZWQ6IE5PUk1BTCB9KTtcblxuICBjb25zdCBydW4gPSAoZnJvbTogbnVtYmVyLCBzcGVlZDogbnVtYmVyKSA9PiB7XG4gICAgY2xvY2suY3VycmVudCA9IHsgZnJvbSwgYXQ6IERhdGUubm93KCksIHNwZWVkIH07XG4gICAgY29uc3QgbXMgPSAocHg6IG51bWJlcikgPT4gKHB4IC8gc3BlZWQpICogMTAwMDtcbiAgICB5LnZhbHVlID0gd2l0aFNlcXVlbmNlKFxuICAgICAgd2l0aFRpbWluZygtSCwgeyBkdXJhdGlvbjogbXMoZnJvbSArIEgpIH0pLFxuICAgICAgd2l0aFRpbWluZyhFTlRFUiwgeyBkdXJhdGlvbjogMCB9KSxcbiAgICAgIHdpdGhSZXBlYXQod2l0aFRpbWluZygtSCwgeyBkdXJhdGlvbjogbXMoRU5URVIgKyBIKSB9KSksXG4gICAgKTtcbiAgfTtcbiAgY29uc3Qgb2Zmc2V0ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZnJvbSwgYXQsIHNwZWVkIH0gPSBjbG9jay5jdXJyZW50O1xuICAgIGNvbnN0IHB4ID0gKChEYXRlLm5vdygpIC0gYXQpIC8gMTAwMCkgKiBzcGVlZDtcbiAgICByZXR1cm4gcHggPD0gZnJvbSArIEggPyBmcm9tIC0gcHggOiBFTlRFUiAtICgocHggLSBmcm9tIC0gSCkgJSAoRU5URVIgKyBIKSk7XG4gIH07XG4gIGNvbnN0IHNwZWVkID0gKG9uOiBib29sZWFuKSA9PiB7XG4gICAgaWYgKG9uID09PSBmYXN0KSByZXR1cm47XG4gICAgc2V0RmFzdChvbik7XG4gICAgcnVuKG9mZnNldCgpLCBvbiA/IEZBU1QgOiBOT1JNQUwpO1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcnVuKFNUQVJULCBOT1JNQUwpO1xuICAgIC8vIFRoZSByZXBlYXQgbmV2ZXIgZW5kcyBvbiBpdHMgb3duLlxuICAgIHJldHVybiAoKSA9PiBjYW5jZWxBbmltYXRpb24oeSk7XG4gIH0sIFtdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgc2Z4KFwiYmFja1wiKTtcbiAgICBvbkNsb3NlKCk7XG4gIH07XG4gIGNvbnN0IGZvcndhcmQgPSAoa2V5OiBzdHJpbmcpID0+XG4gICAga2V5ID09PSBcImZcIiB8fCBrZXkgPT09IFwiRlwiIHx8IGtleSA9PT0gXCJFbnRlclwiO1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKG1vZGFsT3BlbigpKSByZXR1cm47XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSBjbG9zZSgpO1xuICAgIGVsc2UgaWYgKGZvcndhcmQoZS5rZXkpKSBzcGVlZCh0cnVlKTtcbiAgfSk7XG4gIHVzZUV2ZW50KFwia2V5VXBcIiwgKGUpID0+IHtcbiAgICBpZiAoZm9yd2FyZChlLmtleSkpIHNwZWVkKGZhbHNlKTtcbiAgfSk7XG4gIC8vIGAtLXNob290YCBzdGVwOiBgZmYgb258b2ZmYC5cbiAgdXNlRGVidWcoXCJmZlwiLCAoYXJnKSA9PiBzcGVlZChhcmcgIT09IFwib2ZmXCIpKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5GSUxMLFxuICAgICAgICAvLyBBIHNoYWRlIG92ZXIgdGhlIGRhdGFzY2FwZSdzIGJyaWdodGVzdCBzdHJlYWtzLCBub3QgYSBwYW5lbC5cbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICBhbmdsZTogOTAsXG4gICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSgyLCA0LCA4LCAwLjYyKVwiIH0sXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoMiwgNCwgOCwgMC41KVwiLCBwb3NpdGlvbjogXCI1MCVcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDIsIDQsIDgsIDApXCIsIHBvc2l0aW9uOiBcIjg1JVwiIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICB3aWR0aDogMiAqIFNQTElULFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgdHJhbnNmb3JtOiB7IHRyYW5zbGF0ZVk6IHsgYW5pbWF0ZWQ6IHkgfSB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7Q1JFRElUUy5tYXAoKGIsIGkpID0+XG4gICAgICAgICAgXCJ0aXRsZVwiIGluIGIgPyAoXG4gICAgICAgICAgICA8dGV4dCBrZXk9e2l9IHN0eWxlPXt0aXRsZX0+XG4gICAgICAgICAgICAgIHtiLnRpdGxlfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICkgOiBcInNwYWNlXCIgaW4gYiA/IChcbiAgICAgICAgICAgIDxub2RlIGtleT17aX0gc3R5bGU9e3sgaGVpZ2h0OiBiLnNwYWNlIH19IC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodChiKSxcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICAgIGdhcDogMiAqIChTUExJVCAtIDY3MiksXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIC4uLnJvbGUsXG4gICAgICAgICAgICAgICAgICB3aWR0aDogNjcyLFxuICAgICAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogKFJPVyAtIExJTkUpIC8gMiB9LFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7Yi5yb2xlfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXtuYW1lfT57Yi5uYW1lcy5qb2luKFwiXFxuXCIpfTwvdGV4dD5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICApLFxuICAgICAgICApfVxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICByaWdodDogNzYsXG4gICAgICAgICAgYm90dG9tOiA2MCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLFxuICAgICAgICAgIGdhcDogMjAsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzcGVlZCghZmFzdCl9XG4gICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA4IH19XG4gICAgICAgICAgaG92ZXJTdHlsZT17eyBvcGFjaXR5OiAwLjggfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxLZXljYXAgaz1cIkZcIiBjb2xvcj17Qy5yZWR9IC8+XG4gICAgICAgICAgPEtleWNhcCBrPVwiZW50ZXJcIiBjb2xvcj17Qy5yZWR9IC8+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAyNSxcbiAgICAgICAgICAgICAgY29sb3I6IGZhc3QgPyBDLmN5YW4gOiBDLnJlZCxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBGYXN0LUZvcndhcmQgQ3JlZGl0c1xuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXtjbG9zZX1cbiAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX1cbiAgICAgICAgICBob3ZlclN0eWxlPXt7IG9wYWNpdHk6IDAuOCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEtleWNhcCBrPVwiRVNDXCIgY29sb3I9e0MucmVkfSAvPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyNSwgY29sb3I6IEMucmVkLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+XG4gICAgICAgICAgICBDTE9TRVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IGJldnkgfSBmcm9tIFwiLi9iZXZ5XCI7XG5cbi8qKiBUaGUgVUkgc291bmRzIEJldnkgc3ludGhlc2l6ZXMgKGBzb3VuZC5yc2ApLiAqL1xuZXhwb3J0IHR5cGUgU2Z4ID1cbiAgfCBcImhvdmVyXCJcbiAgfCBcImNsaWNrXCJcbiAgfCBcImJhY2tcIlxuICB8IFwidGFiXCJcbiAgfCBcImVycm9yXCJcbiAgfCBcImNvbmZpcm1cIlxuICB8IFwiYm9vdFwiO1xuXG4vKiogUGxheSBhIFVJIHNvdW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNmeChuYW1lOiBTZngpIHtcbiAgYmV2eS5zb3VuZC5wbGF5KHsgbmFtZSB9KTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEJldnlTdHlsZSwgR3JhZGllbnQgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuXG4vKiogVGhlIGZyb250IGVuZCdzIGxvb2ssIHNhbXBsZWQgZnJvbSB0aGUgZ2FtZSdzIG1lbnVzOiBzYWxtb24tcmVkIHR5cGUgYW5kXG4gKiAgZnJhbWVzIG9uIG5lYXItYmxhY2ssIGN5YW4gZm9yIHdoYXRldmVyIHlvdSBjYW4gYWN0IG9uLCB0aGUgd29yZG1hcmsgaW5cbiAqICBhY2lkIHllbGxvdy4gKi9cbmV4cG9ydCBjb25zdCBDID0ge1xuICByZWQ6IFwiI2ZmNWQ1MVwiLFxuICByZWRIaTogXCIjZmY4YTdmXCIsXG4gIHJlZERpbTogXCIjYzcyZTJiXCIsXG4gIHJlZERlZXA6IFwiIzkxMmQyYVwiLFxuICByZWRMaW5lOiBcInJnYmEoMjU1LCA5MywgODEsIDAuNSlcIixcbiAgcmVkRmFpbnQ6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4xNilcIixcbiAgY3lhbjogXCIjNWVmNmZmXCIsXG4gIGN5YW5IaTogXCIjMjNmOWZmXCIsXG4gIGN5YW5EaW06IFwiIzUyYmNkNFwiLFxuICBjeWFuRGVlcDogXCIjMGYzYTQ0XCIsXG4gIGN5YW5GYWludDogXCJyZ2JhKDk0LCAyNDYsIDI1NSwgMC4xMilcIixcbiAgeWVsbG93OiBcIiNmZmYwMDJcIixcbiAgd2hpdGU6IFwiI2U2ZmRmM1wiLFxuICBpbms6IFwiIzA1MGIxMFwiLFxuICAvLyBQYW5lbCBmaWxscy5cbiAgYmFuZDogXCJyZ2JhKDU4LCAxOCwgMjQsIDAuNSlcIixcbiAgc2VjdGlvbjogXCIjMjIxMTFjXCIsXG4gIHJvdzogXCIjMWYwZTE1XCIsXG4gIGZpZWxkOiBcIiMxNjEyMWZcIixcbiAgYnV0dG9uOiBcIiMxMTExMWVcIixcbiAgc2hhZGU6IFwicmdiYSg1LCA3LCAxMiwgMC43MilcIixcbiAgY2xlYXI6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxufTtcblxuLyoqIFJhamRoYW5pIGlzIHRoZSBkZWZhdWx0IGZvbnQgKE1lZGl1bSk7IGl0cyBvdGhlciB3ZWlnaHRzIGFyZSBmYW1pbGllcyBvZlxuICogIHRoZWlyIG93biAoc3RhdGljIGZpbGVzKS4gKi9cbmV4cG9ydCBjb25zdCBGID0ge1xuICBzZW1pYm9sZDogXCJSYWpkaGFuaSBTZW1pQm9sZFwiLFxuICBib2xkOiBcIlJhamRoYW5pIEJvbGRcIixcbiAgbW9ubzogXCJNb25vXCIsXG59O1xuXG4vKiogVGV4dCBzdHlsZXMuICovXG5leHBvcnQgY29uc3QgVCA9IHtcbiAgLyoqIE1lbnUgaXRlbXMsIGJ1dHRvbnM6IGJpZyB1cHBlcmNhc2UuICovXG4gIG1lbnU6IHsgZm9udFNpemU6IDMwLCBjb2xvcjogQy5yZWQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9IGFzIEJldnlTdHlsZSxcbiAgLyoqIFNjcmVlbiB0aXRsZXMgKFwiU0VMRUNUIERJRkZJQ1VMVFkgTEVWRUxcIikuICovXG4gIHRpdGxlOiB7XG4gICAgZm9udFNpemU6IDM2LFxuICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgbGV0dGVyU3BhY2luZzogMC41LFxuICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgfSBhcyBCZXZ5U3R5bGUsXG4gIC8qKiBVcHBlcmNhc2Ugc3VidGl0bGVzIHVuZGVyIGEgdGl0bGUuICovXG4gIGNhcHRpb246IHsgZm9udFNpemU6IDE5LCBjb2xvcjogQy5yZWQsIGxldHRlclNwYWNpbmc6IDAuNCB9IGFzIEJldnlTdHlsZSxcbiAgLyoqIFNldHRpbmdzIGxhYmVscywgbGlzdCB0ZXh0LiAqL1xuICBsYWJlbDoge1xuICAgIGZvbnRTaXplOiAyMixcbiAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgIGNvbG9yOiBDLnJlZCxcbiAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gIH0gYXMgQmV2eVN0eWxlLFxuICAvKiogU2VjdGlvbiBoZWFkZXJzIGluc2lkZSBsaXN0cy4gKi9cbiAgc2VjdGlvbjoge1xuICAgIGZvbnRTaXplOiAyMixcbiAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgIGNvbG9yOiBDLndoaXRlLFxuICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgfSBhcyBCZXZ5U3R5bGUsXG4gIC8qKiBCb2R5IGNvcHkuICovXG4gIGJvZHk6IHsgZm9udFNpemU6IDIyLCBjb2xvcjogQy5jeWFuLCBsaW5lSGVpZ2h0OiAxLjM1IH0gYXMgQmV2eVN0eWxlLFxuICAvKiogVGhlIHRpbnkgZGF0YSBub2lzZSBzcHJpbmtsZWQgYXJvdW5kIHRoZSBmcmFtZXMuICovXG4gIG1pY3JvOiB7XG4gICAgZm9udFNpemU6IDksXG4gICAgZm9udEZhbWlseTogRi5tb25vLFxuICAgIGNvbG9yOiBDLnJlZERpbSxcbiAgICBsaW5lSGVpZ2h0OiAxLjMsXG4gIH0gYXMgQmV2eVN0eWxlLFxufTtcblxuZXhwb3J0IHR5cGUgQ29ybmVyID0gXCJiclwiIHwgXCJ0bFwiIHwgXCJ0clwiIHwgXCJibFwiO1xuXG4vKiogVGhlIGdyYWRpZW50IGFuZ2xlIHRoYXQgc3RhcnRzIGF0IGBjb3JuZXJgIChDU1M6IGAwYCBwb2ludHMgdXAsIGFuZ2xlc1xuICogIGdyb3cgY2xvY2t3aXNlOyB0aGUgbGluZSBzdGFydHMgYXQgdGhlIGNvcm5lciBvcHBvc2l0ZSBpdHMgZGlyZWN0aW9uKS4gKi9cbmNvbnN0IEZST006IFJlY29yZDxDb3JuZXIsIG51bWJlcj4gPSB7IGJyOiAzMTUsIHRsOiAxMzUsIHRyOiAyMjUsIGJsOiA0NSB9O1xuXG5jb25zdCB0cmFuc3BhcmVudCA9IFwicmdiYSgwLCAwLCAwLCAwKVwiO1xuXG4vKiogQSBib3ggd2l0aCBvbmUgY29ybmVyIGN1dCBvZmYgYXQgNDXCsCDigJQgdGhlIGZyYW1lIGV2ZXJ5IHBhbmVsLCBidXR0b24gYW5kXG4gKiAgY2FyZCBpcyBidWlsdCBmcm9tLiBObyBjbGlwIHBhdGhzOiBhIGxpbmVhciBncmFkaWVudCB3aG9zZSBsaW5lIHN0YXJ0c1xuICogIGF0IHRoZSBjb3JuZXIgaXMgdHJhbnNwYXJlbnQgZm9yIGl0cyBmaXJzdCBgY3V0IC8g4oiaMmAgcHggYW5kIGBmaWxsYCBhZnRlclxuICogIChhIDQ1wrAgZWRnZSBhdCBhbnkgYm94IHNpemUpOyBgYm9yZGVyR3JhZGllbnRgIGRvZXMgdGhlIHNhbWUgdG8gdGhlXG4gKiAgYm9yZGVyLCBzbyB0aGUgdHdvIHNpZGVzIHN0b3AgZXhhY3RseSBhdCB0aGUgY3V0LCBhbmQgYSBiYW5kIG9mIGBsaW5lYFxuICogIGRyYXdzIHRoZSBjdXQgaXRzZWxmLiBUaGUgYmFja2dyb3VuZCBwYWludHMgaW5zaWRlIHRoZSBib3JkZXIsIHdoaWNoIGlzXG4gKiAgd2h5IGl0cyBiYW5kIHN0YXJ0cyBg4oiaMsK3d2lkdGhgIGVhcmxpZXIuICovXG5leHBvcnQgZnVuY3Rpb24gY2hhbWZlcihcbiAgZmlsbDogc3RyaW5nLFxuICBjdXQ6IG51bWJlcixcbiAgbGluZT86IHN0cmluZyxcbiAgd2lkdGggPSAxLFxuICBjb3JuZXI6IENvcm5lciA9IFwiYnJcIixcbik6IEJldnlTdHlsZSB7XG4gIGNvbnN0IGQgPSBjdXQgLyBNYXRoLlNRUlQyO1xuICBjb25zdCBhbmdsZSA9IEZST01bY29ybmVyXTtcbiAgaWYgKCFsaW5lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICBhbmdsZSxcbiAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICB7IGNvbG9yOiB0cmFuc3BhcmVudCwgcG9zaXRpb246IGQgLSAwLjYgfSxcbiAgICAgICAgICB7IGNvbG9yOiBmaWxsLCBwb3NpdGlvbjogZCArIDAuNiB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG4gIGNvbnN0IGlubmVyID0gZCAtIE1hdGguU1FSVDIgKiB3aWR0aDtcbiAgcmV0dXJuIHtcbiAgICBib3JkZXI6IHdpZHRoLFxuICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgIGFuZ2xlLFxuICAgICAgc3RvcHM6IFtcbiAgICAgICAgeyBjb2xvcjogdHJhbnNwYXJlbnQsIHBvc2l0aW9uOiBpbm5lciAtIDAuNiB9LFxuICAgICAgICB7IGNvbG9yOiBsaW5lLCBwb3NpdGlvbjogaW5uZXIgKyAwLjYgfSxcbiAgICAgICAgeyBjb2xvcjogbGluZSwgcG9zaXRpb246IGlubmVyICsgd2lkdGggLSAwLjQgfSxcbiAgICAgICAgeyBjb2xvcjogZmlsbCwgcG9zaXRpb246IGlubmVyICsgd2lkdGggKyAwLjYgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBib3JkZXJHcmFkaWVudDoge1xuICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgIGFuZ2xlLFxuICAgICAgc3RvcHM6IFtcbiAgICAgICAgeyBjb2xvcjogdHJhbnNwYXJlbnQsIHBvc2l0aW9uOiBkIC0gMC42IH0sXG4gICAgICAgIHsgY29sb3I6IGxpbmUsIHBvc2l0aW9uOiBkICsgMC42IH0sXG4gICAgICBdLFxuICAgIH0sXG4gIH07XG59XG5cbi8qKiBBIHNvZnQgaG9yaXpvbnRhbCBmYWRlLCBmb3IgdGhlIGJhbmRzIGJlaGluZCBsaXN0cyBhbmQgaGVhZGVycy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmYWRlKGNvbG9yOiBzdHJpbmcsIGFuZ2xlID0gOTAsIGZyb20gPSAwLCB0byA9IDEpOiBHcmFkaWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICBhbmdsZSxcbiAgICBzdG9wczogW3sgY29sb3I6IGFscGhhKGNvbG9yLCBmcm9tKSB9LCB7IGNvbG9yOiBhbHBoYShjb2xvciwgdG8pIH1dLFxuICB9O1xufVxuXG4vKiogYCNycmdnYmJgIHdpdGggYW4gYWxwaGEuICovXG5leHBvcnQgZnVuY3Rpb24gYWxwaGEoaGV4OiBzdHJpbmcsIGE6IG51bWJlcikge1xuICBjb25zdCBuID0gcGFyc2VJbnQoaGV4LnNsaWNlKDEsIDcpLCAxNik7XG4gIHJldHVybiBgcmdiYSgkeyhuID4+IDE2KSAmIDI1NX0sICR7KG4gPj4gOCkgJiAyNTV9LCAke24gJiAyNTV9LCAke2F9KWA7XG59XG5cbi8qKiBUaGUgZmFpbnQgc2NhbmxpbmVzIGxhaWQgb3ZlciBwYW5lbHMgKGEgNCBweCByZXBlYXRpbmcgdGV4dHVyZSkuICovXG5leHBvcnQgY29uc3QgU0NBTkxJTkVTID0ge1xuICBzcmM6IFwiaW1hZ2VzL3NjYW5saW5lcy5wbmdcIixcbiAgbW9kZTogXCJyZXBlYXRcIixcbiAgc2NhbGU6IDEsXG59IGFzIGNvbnN0O1xuXG4vKiogQW55IGhvdmVyIHN0eWxlIG1ha2VzIGEgbm9kZSBpbnRlcmFjdGl2ZSAoaXQgdGhlbiBvd25zIHRoZSBwb2ludGVyKS4gKi9cbmV4cG9ydCBjb25zdCBPV05TX1BPSU5URVIgPSB7fTtcbiIsICJpbXBvcnQgeyBDIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5cbi8qKiBBIG1vdXNlLCBpdHMgbGVmdCBidXR0b24gbGl0OiB0aGUgXCJjbGlja1wiIGdseXBoIG9mIGV2ZXJ5IGhpbnQgYmFyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1vdXNlSWNvbih7XG4gIGNvbG9yID0gQy5jeWFuLFxuICBzaXplID0gMjYsXG59OiB7XG4gIGNvbG9yPzogc3RyaW5nO1xuICBzaXplPzogbnVtYmVyO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAxNiAyNFwiIHN0eWxlPXt7IHdpZHRoOiAoc2l6ZSAqIDE2KSAvIDI0LCBoZWlnaHQ6IHNpemUgfX0+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTggMS41IEM0IDEuNSAxLjggNCAxLjggOCBMMS44IDE2IEMxLjggMjAgNC40IDIyLjUgOCAyMi41IEMxMS42IDIyLjUgMTQuMiAyMCAxNC4yIDE2IEwxNC4yIDggQzE0LjIgNCAxMiAxLjUgOCAxLjUgWlwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgIC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTggMi41IEw4IDkuNSBMMi44IDkuNSBMMi44IDggQzIuOCA0LjYgNC42IDIuNiA4IDIuNSBaXCJcbiAgICAgICAgZmlsbD17Y29sb3J9XG4gICAgICAvPlxuICAgICAgPGxpbmVcbiAgICAgICAgeDE9ezEuOH1cbiAgICAgICAgeTE9ezEwfVxuICAgICAgICB4Mj17MTQuMn1cbiAgICAgICAgeTI9ezEwfVxuICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICBzdHJva2VXaWR0aD17MS4yfVxuICAgICAgLz5cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuLyoqIFRoZSBsaXR0bGUgc3RhY2tlZC1iYXJzIG1hcmsgdGhhdCByaWRlcyBpbnNpZGUgYSBzZWxlY3RlZCBtZW51IGl0ZW0uICovXG5leHBvcnQgZnVuY3Rpb24gUHJvdG9jb2xHbHlwaCh7XG4gIGNvbG9yID0gQy5jeWFuLFxuICB3aWR0aCA9IDMwLFxufToge1xuICBjb2xvcj86IHN0cmluZztcbiAgd2lkdGg/OiBudW1iZXI7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDMwIDIyXCIgc3R5bGU9e3sgd2lkdGgsIGhlaWdodDogKHdpZHRoICogMjIpIC8gMzAgfX0+XG4gICAgICA8cmVjdCB4PXswfSB5PXswfSB3aWR0aD17MTJ9IGhlaWdodD17Mi4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxyZWN0IHg9ezE0fSB5PXswfSB3aWR0aD17MTZ9IGhlaWdodD17Mi4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxyZWN0IHg9ezB9IHk9ezR9IHdpZHRoPXsyMH0gaGVpZ2h0PXsyLjJ9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgPHJlY3QgeD17MjJ9IHk9ezR9IHdpZHRoPXs4fSBoZWlnaHQ9ezIuMn0gZmlsbD17Y29sb3J9IC8+XG4gICAgICA8cmVjdCB4PXswfSB5PXs4fSB3aWR0aD17OH0gaGVpZ2h0PXsyLjJ9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgPHJlY3QgeD17MTB9IHk9ezh9IHdpZHRoPXsyMH0gaGVpZ2h0PXsyLjJ9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgPHBvbHlsaW5lXG4gICAgICAgIHBvaW50cz17WzAsIDE0LCAxMCwgMTQsIDEzLCAxMSwgMTcsIDE3LCAyMCwgMTQsIDMwLCAxNF19XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNH1cbiAgICAgIC8+XG4gICAgICA8cmVjdCB4PXswfSB5PXsxOX0gd2lkdGg9ezMwfSBoZWlnaHQ9ezEuMn0gZmlsbD17Y29sb3J9IG9wYWNpdHk9ezAuNn0gLz5cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuLyoqIEEgd2FybmluZyB0cmlhbmdsZSB3aXRoIGFuIGV4Y2xhbWF0aW9uIG1hcmsuICovXG5leHBvcnQgZnVuY3Rpb24gV2FybmluZ0ljb24oe1xuICBjb2xvciA9IEMucmVkLFxuICBzaXplID0gMTgsXG59OiB7XG4gIGNvbG9yPzogc3RyaW5nO1xuICBzaXplPzogbnVtYmVyO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAyMCAxOFwiIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IChzaXplICogMTgpIC8gMjAgfX0+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e1sxMCwgMSwgMTksIDE3LCAxLCAxN119IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgPHJlY3QgeD17OX0geT17Nn0gd2lkdGg9ezJ9IGhlaWdodD17Nn0gZmlsbD1cIiMxMjBhMGNcIiAvPlxuICAgICAgPHJlY3QgeD17OX0geT17MTMuNX0gd2lkdGg9ezJ9IGhlaWdodD17Mn0gZmlsbD1cIiMxMjBhMGNcIiAvPlxuICAgIDwvc3ZnPlxuICApO1xufVxuXG4vKiogVGhlIHN0ZXAtc2VsZWN0b3IgYXJyb3dzOiBob2xsb3cgdHJpYW5nbGVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycm93KHtcbiAgZGlyLFxuICBjb2xvciA9IEMuY3lhbixcbiAgc2l6ZSA9IDIwLFxufToge1xuICBkaXI6IFwibGVmdFwiIHwgXCJyaWdodFwiO1xuICBjb2xvcj86IHN0cmluZztcbiAgc2l6ZT86IG51bWJlcjtcbn0pIHtcbiAgY29uc3QgcG9pbnRzID1cbiAgICBkaXIgPT09IFwibGVmdFwiID8gWzE3LCAyLCAzLCAxMCwgMTcsIDE4XSA6IFszLCAyLCAxNywgMTAsIDMsIDE4XTtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjAgMjBcIiBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplIH19PlxuICAgICAgPHBvbHlnb24gcG9pbnRzPXtwb2ludHN9IGZpbGw9XCJub25lXCIgc3Ryb2tlPXtjb2xvcn0gc3Ryb2tlV2lkdGg9ezJ9IC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IEMsIEYsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IE1vdXNlSWNvbiB9IGZyb20gXCIuL2ljb25zXCI7XG5cbi8qKiBUaGUgZ2x5cGhzIGRyYXduIGluc2lkZSBhIGtleWNhcCBpbnN0ZWFkIG9mIGEgbGV0dGVyLiAqL1xuY29uc3QgR0xZUEhTOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXJbXT4gPSB7XG4gIHNwYWNlOiBbMS41LCAxLCAxLjUsIDgsIDE2LjUsIDgsIDE2LjUsIDFdLFxuICBlbnRlcjogWzE2LCAxLCAxNiwgNywgMywgNywgNywgMy41LCAzLCA3LCA3LCAxMF0sXG59O1xuXG4vKiogQSBrZXkgYXMgdGhlIGhpbnRzIGRyYXcgaXQ6IGEgYnJhY2tldGVkIGxldHRlciwgYSB0aW55IHdvcmQgKFwiRVNDXCIpLCBvclxuICogIGEgZ2x5cGggKGBrOiBcInNwYWNlXCJgLCBgXCJlbnRlclwiYCkuICovXG5leHBvcnQgZnVuY3Rpb24gS2V5Y2FwKHsgaywgY29sb3IgPSBDLmN5YW4gfTogeyBrOiBzdHJpbmc7IGNvbG9yPzogc3RyaW5nIH0pIHtcbiAgY29uc3QgZ2x5cGggPSBHTFlQSFNba107XG4gIGlmIChnbHlwaCkge1xuICAgIHJldHVybiAoXG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAyNyxcbiAgICAgICAgICBoZWlnaHQ6IDI3LFxuICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICBib3JkZXJDb2xvcjogY29sb3IsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDE4IDEwXCIgc3R5bGU9e3sgd2lkdGg6IDE2LCBoZWlnaHQ6IDkgfX0+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17Z2x5cGh9IGZpbGw9XCJub25lXCIgc3Ryb2tlPXtjb2xvcn0gc3Ryb2tlV2lkdGg9ezJ9IC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgPC9ub2RlPlxuICAgICk7XG4gIH1cbiAgY29uc3Qgd29yZCA9IGsubGVuZ3RoID4gMTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgbWluV2lkdGg6IDI3LFxuICAgICAgICBoZWlnaHQ6IDI3LFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IHdvcmQgPyAzIDogMCB9LFxuICAgICAgICBib3JkZXI6IDIsXG4gICAgICAgIGJvcmRlckNvbG9yOiBjb2xvcixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udFNpemU6IHdvcmQgPyAxMSA6IDIwLFxuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtrfVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIE9uZSBoaW50OiBhIGtleSAob3IgdGhlIG1vdXNlLCBgazogXCJtb3VzZVwiYCkgYW5kIHdoYXQgaXQgZG9lcy4gQ2xpY2thYmxlLFxuICogIGxpa2UgdGhlIGdhbWUncy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaW50KHtcbiAgayxcbiAgbGFiZWwsXG4gIG9uQ2xpY2ssXG4gIGNvbG9yID0gQy5yZWQsXG59OiB7XG4gIGs6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgb25DbGljaz86ICgpID0+IHZvaWQ7XG4gIGNvbG9yPzogc3RyaW5nO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDgsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jbGVhcixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXt7IG9wYWNpdHk6IDAuOCB9fVxuICAgID5cbiAgICAgIHtrID09PSBcIm1vdXNlXCIgPyA8TW91c2VJY29uIC8+IDogPEtleWNhcCBrPXtrfSAvPn1cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyNSwgY29sb3IsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT57bGFiZWx9PC90ZXh0PlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogVGhlIGhpbnQgYmFyLCBib3R0b20gcmlnaHQgb2YgZXZlcnkgc2NyZWVuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhpbnRzKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIHJpZ2h0OiA1MixcbiAgICAgICAgYm90dG9tOiA0NixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiAzMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgY3V0LWNvcm5lciBidXR0b246IGN5YW4gbGFiZWwgb24gYSBkYXJrIHBsYXRlIGluIGEgZGltIHJlZCBmcmFtZTtcbiAqICBicmlnaHRlciBvbiBob3Zlci4gYGhvdGAga2VlcHMgaXQgbGl0IChrZXlib2FyZCBmb2N1cykuICovXG5leHBvcnQgZnVuY3Rpb24gQ3V0QnV0dG9uKHtcbiAgbGFiZWwsXG4gIG9uQ2xpY2ssXG4gIHdpZHRoLFxuICBoZWlnaHQgPSA1MixcbiAgayxcbiAgaG90ID0gZmFsc2UsXG4gIGRpc2FibGVkID0gZmFsc2UsXG4gIHN0eWxlLFxufToge1xuICBsYWJlbDogc3RyaW5nO1xuICBvbkNsaWNrPzogKCkgPT4gdm9pZDtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGhlaWdodD86IG51bWJlcjtcbiAgaz86IHN0cmluZztcbiAgaG90PzogYm9vbGVhbjtcbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbn0pIHtcbiAgY29uc3QgZnJhbWUgPSBob3QgPyBDLmN5YW4gOiBcInJnYmEoMjU1LCA5MywgODEsIDAuNDUpXCI7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17ZGlzYWJsZWQgPyB1bmRlZmluZWQgOiBvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uY2hhbWZlcihDLmJ1dHRvbiwgMTIsIGZyYW1lLCAxKSxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAyNCB9LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiAxMixcbiAgICAgICAgb3BhY2l0eTogZGlzYWJsZWQgPyAwLjQgOiAxLFxuICAgICAgICAuLi5zdHlsZSxcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXtkaXNhYmxlZCA/IHVuZGVmaW5lZCA6IGNoYW1mZXIoXCIjMWExYTJjXCIsIDEyLCBDLmN5YW4sIDEpfVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5tZW51LFxuICAgICAgICAgIGZvbnRTaXplOiAyNSxcbiAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6IDAuNixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2xhYmVsfVxuICAgICAgPC90ZXh0PlxuICAgICAge2sgJiYgPEtleWNhcCBrPXtrfSAvPn1cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIFRoZSBoZWFkZXIgb2YgdGhlIGZ1bGwtc2NyZWVuIG1lbnVzOiBhIGxvbmcgcmVkIHJ1bGUgYWNyb3NzIHRoZSB0b3AsXG4gKiAgdGhlIHRpdGxlIGluIGN5YW4gd2l0aCBpdHMgYmFkZ2UgYW5kIGEgc3RhY2sgb2YgYmluYXJ5LCBhIHJvdyBvZiBzZWdtZW50c1xuICogIHVuZGVyIGl0ICh0aGUgY3VycmVudCBzdGVwIGxpdCBjeWFuKSBhbmQgYSByZWQgY2FwdGlvbiBiZWxvdy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIZWFkZXIoe1xuICB0aXRsZSxcbiAgY2FwdGlvbixcbiAgaWNvbixcbiAgc3RlcCA9IDAsXG4gIHN0ZXBzID0gNSxcbiAgbGVmdCA9IDYwNixcbn06IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgY2FwdGlvbj86IHN0cmluZztcbiAgLyoqIFRoZSBiYWRnZSBsZWZ0IG9mIHRoZSB0aXRsZSAoYSBzbWFsbCBgPHN2Zz5gLCB+MzQgcHgpLiAqL1xuICBpY29uPzogUmVhY3ROb2RlO1xuICAvKiogVGhlIGxpdCBzZWdtZW50ICgwLWJhc2VkKTsgYC0xYCBsaWdodHMgbm9uZS4gKi9cbiAgc3RlcD86IG51bWJlcjtcbiAgc3RlcHM/OiBudW1iZXI7XG4gIC8qKiBXaGVyZSB0aGUgdGl0bGUgYmxvY2sgc3RhcnRzLCBweC4gKi9cbiAgbGVmdD86IG51bWJlcjtcbn0pIHtcbiAgY29uc3Qgc2VnbWVudCA9IDEzODtcbiAgY29uc3QgZ2FwID0gNjtcbiAgY29uc3Qgd2lkdGggPSBzdGVwcyAqIHNlZ21lbnQgKyAoc3RlcHMgLSAxKSAqIGdhcDtcbiAgY29uc3QgcnVsZSA9IFwicmdiYSgyNTUsIDkzLCA4MSwgMC43NSlcIjtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGhlaWdodDogMTIwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgd2lkdGg6IGxlZnQgLSA4LFxuICAgICAgICAgIHRvcDogNDQsXG4gICAgICAgICAgaGVpZ2h0OiAyLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGFuZ2xlOiA5MCxcbiAgICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjM1KVwiIH0sIHsgY29sb3I6IHJ1bGUgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IGxlZnQgKyB3aWR0aCArIDgsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiA0NCxcbiAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDkwLFxuICAgICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBydWxlIH0sIHsgY29sb3I6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4zNSlcIiB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdCxcbiAgICAgICAgICB0b3A6IDgsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2ljb259XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDcsIGNvbG9yOiBDLmN5YW4sIGxpbmVIZWlnaHQ6IDEuMSB9fVxuICAgICAgICA+XG4gICAgICAgICAge1wiMDExMDAwMTFcXG4wMTEwMTAwMFxcbjAxMTAwMDAxXFxuMDExMTAwMTBcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17VC50aXRsZX0+e3RpdGxlfTwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdCxcbiAgICAgICAgICB0b3A6IDUwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgZ2FwLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogc3RlcHMgfSwgKF8sIGkpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IHNlZ21lbnQsXG4gICAgICAgICAgICAgIGhlaWdodDogaSA9PT0gc3RlcCA/IDMgOiAyLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGkgPT09IHN0ZXAgPyBDLmN5YW4gOiBcInJnYmEoMjU1LCA5MywgODEsIDAuNDUpXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAge2NhcHRpb24gJiYgKFxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5ULmNhcHRpb24sXG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgICB0b3A6IDY0LFxuICAgICAgICAgICAgd2lkdGg6IDc2MCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2NhcHRpb259XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogRmlsbCB0aGUgc2NyZWVuIChzY3JlZW5zIGFyZSBhYnNvbHV0ZWx5IHBvc2l0aW9uZWQgbGF5ZXJzKS4gKi9cbmV4cG9ydCBjb25zdCBGSUxMOiBCZXZ5U3R5bGUgPSB7XG4gIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICBsZWZ0OiAwLFxuICB0b3A6IDAsXG4gIHJpZ2h0OiAwLFxuICBib3R0b206IDAsXG59O1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdHlwZSBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHVzZUtleXMgfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi9zb3VuZFwiO1xuaW1wb3J0IHsgQywgRiwgY2hhbWZlciB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgV2FybmluZ0ljb24gfSBmcm9tIFwiLi4vdWkvaWNvbnNcIjtcbmltcG9ydCB7IEZJTEwsIEtleWNhcCB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuLyoqIEhvdyBtYW55IHBsYXRlcyBhcmUgdXAuIEV2ZXJ5IGxpc3RlbmVyIGhlYXJzIGV2ZXJ5IGtleSwgc28gd2hpbGUgb25lIGlzXG4gKiAgdXAgdGhlIHNjcmVlbiB1bmRlciBpdCBsZWF2ZXMgRW50ZXIsIEVzYyBhbmQgaXRzIG93biBrZXlzIGFsb25lLiAqL1xubGV0IG9wZW4gPSAwO1xuXG4vKiogV2hldGhlciBhIGNvbmZpcm1hdGlvbiBwbGF0ZSBpcyB1cCAoc2NyZWVucyBjaGVjayBpdCBpbiB0aGVpciBrZXlcbiAqICBoYW5kbGVycykuICovXG5leHBvcnQgY29uc3QgbW9kYWxPcGVuID0gKCkgPT4gb3BlbiA+IDA7XG5cbi8qKiBBIGNvbmZpcm1hdGlvbiBvdmVyIHRoZSBjdXJyZW50IHNjcmVlbjogdGhlIHdvcmxkIGRpbW1lZCwgdGhlIHJlZCBwbGF0ZVxuICogIHdpdGggdGhlIHF1ZXN0aW9uLCBDT05GSVJNIGFuZCBDQU5DRUwgdW5kZXIgaXQuIEVudGVyIGNvbmZpcm1zLCBFc2NcbiAqICBjYW5jZWxzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbmZpcm0oe1xuICB0ZXh0LFxuICBvbkNvbmZpcm0sXG4gIG9uQ2FuY2VsLFxufToge1xuICB0ZXh0OiBzdHJpbmc7XG4gIG9uQ29uZmlybTogKCkgPT4gdm9pZDtcbiAgb25DYW5jZWw6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLkZJTEwsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEsIDIsIDUsIDAuODgpXCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBmb2N1c1BvbGljeTogXCJibG9ja1wiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3t9fVxuICAgID5cbiAgICAgIDxQbGF0ZVxuICAgICAgICB0ZXh0PXt0ZXh0fVxuICAgICAgICBpY29uPXs8V2FybmluZ0ljb24gc2l6ZT17NjR9IGNvbG9yPXtDLnJlZH0gLz59XG4gICAgICAgIG9uQ29uZmlybT17b25Db25maXJtfVxuICAgICAgICBvbkNhbmNlbD17b25DYW5jZWx9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgUExBVEUgPSBcIiM0OTFjMjRcIjtcbmNvbnN0IFRBQiA9IFwicmdiYSgxNTAsIDM0LCAzMCwgMC42MilcIjtcblxuLyoqIFRoZSBwbGF0ZSBpdHNlbGY6IGEgdHJhbnNsdWNlbnQgdGFiLCB0aGUgZGFyayByZWQgcGFuZWwgd2l0aCBgaWNvbmAgaW4gYVxuICogIHRodW1ibmFpbC1zaXplZCBpbnNldCBhbmQgdGhlIHF1ZXN0aW9uLCB0aGUgdHdvIGJ1dHRvbnMgdW5kZXIgaXQgKHJpZ2h0XG4gKiAgYWxpZ25lZCkuIEFsc28gbGFpZCBpbmxpbmUgb3ZlciBhIHNhdmUgcm93LiBPd25zIEVudGVyIGFuZCBFc2MuICovXG5leHBvcnQgZnVuY3Rpb24gUGxhdGUoe1xuICB0ZXh0LFxuICBpY29uLFxuICBvbkNvbmZpcm0sXG4gIG9uQ2FuY2VsLFxuICBzdHlsZSxcbn06IHtcbiAgdGV4dDogc3RyaW5nO1xuICBpY29uOiBSZWFjdE5vZGU7XG4gIG9uQ29uZmlybTogKCkgPT4gdm9pZDtcbiAgb25DYW5jZWw6ICgpID0+IHZvaWQ7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xufSkge1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIG9wZW4rKztcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgb3Blbi0tO1xuICAgIH07XG4gIH0sIFtdKTtcbiAgY29uc3QgY29uZmlybSA9ICgpID0+IHtcbiAgICBzZngoXCJjb25maXJtXCIpO1xuICAgIG9uQ29uZmlybSgpO1xuICB9O1xuICBjb25zdCBjYW5jZWwgPSAoKSA9PiB7XG4gICAgc2Z4KFwiYmFja1wiKTtcbiAgICBvbkNhbmNlbCgpO1xuICB9O1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIGNvbmZpcm0oKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikgY2FuY2VsKCk7XG4gIH0pO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiA2OTMsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMjYsIC4uLnN0eWxlIH19PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDY4MCwgaGVpZ2h0OiAxMjAsIGZsZXhEaXJlY3Rpb246IFwicm93XCIgfX0+XG4gICAgICAgIDxUYWIgLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uY2hhbWZlcihQTEFURSwgMTYsIEMucmVkLCAxKSxcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGdhcDogMjYsXG4gICAgICAgICAgICBwYWRkaW5nOiAxMyxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEluc2V0PntpY29ufTwvSW5zZXQ+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAyNCxcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAxLjE2LFxuICAgICAgICAgICAgICBmbGV4U2hyaW5rOiAxLFxuICAgICAgICAgICAgICBtYXJnaW46IHsgdG9wOiAyIH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0ZXh0fVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICB7LyogVGhlIGJyYWNrZXQgcmlkaW5nIHRoZSBwbGF0ZSdzIHJpZ2h0IGVkZ2UuICovfVxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgcmlnaHQ6IC02LFxuICAgICAgICAgICAgICB0b3A6IDIwLFxuICAgICAgICAgICAgICBib3R0b206IDIyLFxuICAgICAgICAgICAgICB3aWR0aDogNSxcbiAgICAgICAgICAgICAgYm9yZGVyOiB7IHRvcDogMSwgcmlnaHQ6IDEsIGJvdHRvbTogMSB9LFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWQsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogNiwgYWxpZ25TZWxmOiBcImZsZXhFbmRcIiB9fT5cbiAgICAgICAgPFBsYXRlQnV0dG9uIGs9XCJlbnRlclwiIGxhYmVsPVwiQ09ORklSTVwiIG9uQ2xpY2s9e2NvbmZpcm19IC8+XG4gICAgICAgIDxQbGF0ZUJ1dHRvbiBrPVwiRVNDXCIgbGFiZWw9XCJDQU5DRUxcIiBvbkNsaWNrPXtjYW5jZWx9IC8+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHRyYW5zbHVjZW50IHRhYiBvbiB0aGUgcGxhdGUncyBsZWZ0LCB3aXRoIGl0cyB0aWNrLiAqL1xuZnVuY3Rpb24gVGFiKCkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogNDIsXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkLFxuICAgICAgICBib3JkZXJSYWRpdXM6IHsgbGVmdDogNiB9LFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFRBQixcbiAgICAgICAgbWFyZ2luOiB7IHJpZ2h0OiAxIH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICB0b3A6IDU4LFxuICAgICAgICAgIHdpZHRoOiAxNSxcbiAgICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLnJlZCxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHRodW1ibmFpbC1zaXplZCB3ZWxsIHRoZSBwbGF0ZSdzIHBpY3R1cmUgZ2xvd3MgaW4uICovXG5mdW5jdGlvbiBJbnNldCh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLmNoYW1mZXIoXCIjNGUxZDI1XCIsIDEyLCBcInJnYmEoMjU1LCA5MywgODEsIDAuMjgpXCIsIDEpLFxuICAgICAgICB3aWR0aDogMTY4LFxuICAgICAgICBoZWlnaHQ6IDk0LFxuICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxLFxuICAgICAgICAgIHRvcDogMSxcbiAgICAgICAgICByaWdodDogMSxcbiAgICAgICAgICBib3R0b206IDEsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcInJhZGlhbFwiLFxuICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDI1NSwgNzAsIDYwLCAwLjMpXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDI1NSwgNzAsIDYwLCAwKVwiLCBwb3NpdGlvbjogXCI3MCVcIiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBDT05GSVJNIC8gQ0FOQ0VMOiBhIGtleWNhcCBhbmQgYSByZWQgbGFiZWwgb24gYSBkYXJrIHJlZCBwbGF0ZSBpbiBhIHRlYWxcbiAqICBmcmFtZS4gKi9cbmZ1bmN0aW9uIFBsYXRlQnV0dG9uKHtcbiAgayxcbiAgbGFiZWwsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGs6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uY2hhbWZlcihcIiM0NDE1MThcIiwgMTIsIFwiIzMyOGU4ZlwiLCAxKSxcbiAgICAgICAgd2lkdGg6IDE2MixcbiAgICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiA5LFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDggfSxcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXtjaGFtZmVyKFwiIzVjMWExZlwiLCAxMiwgQy5jeWFuLCAxKX1cbiAgICA+XG4gICAgICA8S2V5Y2FwIGs9e2t9IC8+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRTaXplOiAyNCxcbiAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtsYWJlbH1cbiAgICAgIDwvdGV4dD5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICBpbnRlcnBvbGF0ZSxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhEZWxheSxcbiAgd2l0aFNlcXVlbmNlLFxuICB3aXRoVGltaW5nLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uL3NvdW5kXCI7XG5pbXBvcnQgeyBQUk9MT0dVRSwgdHlwZSBMaWZlcGF0aCwgdHlwZSBTYXZlIH0gZnJvbSBcIi4uL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBGSUxMLCBIaW50LCBIaW50cyB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuLyoqIFRoZSBnYW1lOiB0aGUgY2hvc2VuIGxpZmVwYXRoJ3Mgd29ybGQsIGZ1bGwgc2NyZWVuIChhIGA8cG9ydGFsPmAgb2YgdGhlXG4gKiAgYHdvcmxkYCBjYW1lcmEpLCBibHVycmVkIHdoaWxlIHBhdXNlZC4gUmVuZGVyZWQgdW5kZXIgdGhlIG1lbnVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFdvcmxkKHsgcGF1c2VkIH06IHsgbGlmZXBhdGg6IExpZmVwYXRoOyBwYXVzZWQ6IGJvb2xlYW4gfSkge1xuICByZXR1cm4gKFxuICAgIDxwb3J0YWxcbiAgICAgIHRhcmdldD1cIndvcmxkXCJcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLkZJTEwsXG4gICAgICAgIGNhY2hlOiBcIm5ldmVyXCIsXG4gICAgICAgIGZpbHRlcjogeyBuYW1lOiBcImJsdXJcIiwgcGFyYW1zOiB7IHJhZGl1czogcGF1c2VkID8gMTQgOiAwIH0gfSxcbiAgICAgICAgdHJhbnNpdGlvbjogeyBmaWx0ZXI6IHsgZHVyYXRpb246IDMwMCB9IH0sXG4gICAgICB9fVxuICAgIC8+XG4gICk7XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBuZXh0IEhVRCBhbm5vdW5jZXMgd2hlcmUgeW91IGFyZTogZXZlcnkgbG9hZCBkb2VzIChzZWVcbiAqICBgTG9hZGluZ2ApLCBhIHJlc3VtZSBmcm9tIHRoZSBwYXVzZSBtZW51IGRvZXNuJ3QuICovXG5sZXQgYXJyaXZpbmcgPSB0cnVlO1xuZXhwb3J0IGNvbnN0IGFubm91bmNlQXJyaXZhbCA9ICgpID0+IHtcbiAgYXJyaXZpbmcgPSB0cnVlO1xufTtcblxuLyoqIFRoZSBpbi1nYW1lIG92ZXJsYXkgKHVucGF1c2VkKTogd2hlcmUgeW91IGFyZSwgc2xpZGluZyBpbiB0b3AgbGVmdCBmb3IgYVxuICogIGZldyBzZWNvbmRzIGFmdGVyIGEgbG9hZCwgYW5kIHRoZSBoaW50IHRvIG9wZW4gdGhlIG1lbnUuICovXG5leHBvcnQgZnVuY3Rpb24gR2FtZUh1ZCh7XG4gIG9uUGF1c2UsXG4gIGdhbWUsXG59OiB7XG4gIG9uUGF1c2U6ICgpID0+IHZvaWQ7XG4gIC8qKiBUaGUgcnVubmluZyBnYW1lLCBmb3IgdGhlIHRvYXN0ICh3aXRob3V0IGl0OiB0aGUgc3RyZWV0IGtpZCdzIGZpcnN0XG4gICAqICBzdG9wKS4gKi9cbiAgZ2FtZT86IFNhdmU7XG59KSB7XG4gIGNvbnN0IFthbm5vdW5jZV0gPSB1c2VTdGF0ZShhcnJpdmluZyk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYXJyaXZpbmcgPSBmYWxzZTtcbiAgfSwgW10pO1xuICBjb25zdCB3aGVyZSA9IGdhbWUgPz8gUFJPTE9HVUUuc3RyZWV0a2lkO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAge2Fubm91bmNlICYmIDxUb2FzdCBsb2NhdGlvbj17d2hlcmUubG9jYXRpb259IHF1ZXN0PXt3aGVyZS5xdWVzdH0gLz59XG4gICAgICA8SGludHM+XG4gICAgICAgIDxIaW50XG4gICAgICAgICAgaz1cIkVTQ1wiXG4gICAgICAgICAgbGFiZWw9XCJQYXVzZVwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgc2Z4KFwiYmFja1wiKTtcbiAgICAgICAgICAgIG9uUGF1c2UoKTtcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBcIktFU1NMRVIgLyBMQU5URVJOIEFMTEVZXCIsIHRoZSBqb2IgdW5kZXIgaXQ6IGEgSFVEIHBsYXRlIHRoYXQgc2xpZGVzIGluLFxuICogIGhvbGRzLCBhbmQgc2xpZGVzIGJhY2sgb3V0IChvbmUgc2hhcmVkIHZhbHVlLCBCZXZ5LWRyaXZlbikuICovXG5mdW5jdGlvbiBUb2FzdCh7IGxvY2F0aW9uLCBxdWVzdCB9OiB7IGxvY2F0aW9uOiBzdHJpbmc7IHF1ZXN0OiBzdHJpbmcgfSkge1xuICBjb25zdCB0ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdC52YWx1ZSA9IHdpdGhEZWxheShcbiAgICAgIDYwMCxcbiAgICAgIHdpdGhTZXF1ZW5jZShcbiAgICAgICAgd2l0aFRpbWluZygxLCB7IGR1cmF0aW9uOiAzNjAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSksXG4gICAgICAgIHdpdGhEZWxheSg0MjAwLCB3aXRoVGltaW5nKDAsIHsgZHVyYXRpb246IDQyMCwgZWFzaW5nOiBcImVhc2VJblwiIH0pKSxcbiAgICAgICksXG4gICAgKTtcbiAgfSwgW3RdKTtcbiAgY29uc3QgW2Rpc3RyaWN0LCBwbGFjZSA9IFwiXCJdID0gbG9jYXRpb24uc3BsaXQoXCI6IFwiKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDY0LFxuICAgICAgICB0b3A6IDE1MCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgZ2FwOiA4LFxuICAgICAgICBvcGFjaXR5OiB7IGFuaW1hdGVkOiB0IH0sXG4gICAgICAgIHRyYW5zZm9ybToge1xuICAgICAgICAgIHRyYW5zbGF0ZVg6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHQsIFswLCAxXSwgWy02MCwgMF0pIH0sXG4gICAgICAgIH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihcInJnYmEoMTAsIDgsIDE0LCAwLjcyKVwiLCAxNiwgXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjYpXCIsIDEpLFxuICAgICAgICAgIHdpZHRoOiA0NjAsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBnYXA6IDE2LFxuICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMCwgcmlnaHQ6IDIwLCB2ZXJ0aWNhbDogMTIgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDQsIGJhY2tncm91bmRDb2xvcjogQy5jeWFuIH19IC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogMTAsIGNvbG9yOiBDLmN5YW5EaW0gfX0+XG4gICAgICAgICAgICBFTlRFUklORyBESVNUUklDVFxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDQwLFxuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEuNSxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ZGlzdHJpY3QudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5sYWJlbCwgZm9udFNpemU6IDIyLCBsZXR0ZXJTcGFjaW5nOiAxIH19PlxuICAgICAgICAgICAge3BsYWNlLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEwIH19PlxuICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogOCwgaGVpZ2h0OiA4LCBiYWNrZ3JvdW5kQ29sb3I6IEMueWVsbG93IH19IC8+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLlQubGFiZWwsXG4gICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICBjb2xvcjogQy55ZWxsb3csXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7YEpPQiAgwrcgICR7cXVlc3QudG9VcHBlckNhc2UoKX1gfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgIi8vIFRoZSBmcm9udCBlbmQncyBvd24gc3RhdGUgc2hhcGVzLCBzaGFyZWQgYnkgZXZlcnkgc2NyZWVuLiBFdmVyeXRoaW5nIGlzXG4vLyBtYWRlIHVwIGFuZCBsaXZlcyBpbiBSZWFjdDogdGhlIGNoYXJhY3RlciBiZWluZyBjcmVhdGVkLCB0aGUgc2F2ZSBzbG90cy5cblxuZXhwb3J0IHR5cGUgTGlmZXBhdGggPSBcIm5vbWFkXCIgfCBcInN0cmVldGtpZFwiIHwgXCJjb3Jwb1wiO1xuZXhwb3J0IHR5cGUgRGlmZmljdWx0eSA9IFwiZWFzeVwiIHwgXCJub3JtYWxcIiB8IFwiaGFyZFwiIHwgXCJ2ZXJ5aGFyZFwiO1xuZXhwb3J0IHR5cGUgQXR0cmlidXRlSWQgPVxuICB8IFwiYm9keVwiXG4gIHwgXCJpbnRlbGxpZ2VuY2VcIlxuICB8IFwicmVmbGV4ZXNcIlxuICB8IFwidGVjaFwiXG4gIHwgXCJjb29sXCI7XG5cbmV4cG9ydCBjb25zdCBMSUZFUEFUSFM6IHsgaWQ6IExpZmVwYXRoOyBuYW1lOiBzdHJpbmcgfVtdID0gW1xuICB7IGlkOiBcIm5vbWFkXCIsIG5hbWU6IFwiTm9tYWRcIiB9LFxuICB7IGlkOiBcInN0cmVldGtpZFwiLCBuYW1lOiBcIlN0cmVldGtpZFwiIH0sXG4gIHsgaWQ6IFwiY29ycG9cIiwgbmFtZTogXCJDb3Jwb1wiIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgRElGRklDVUxUSUVTOiB7IGlkOiBEaWZmaWN1bHR5OyBuYW1lOiBzdHJpbmcgfVtdID0gW1xuICB7IGlkOiBcImVhc3lcIiwgbmFtZTogXCJFQVNZXCIgfSxcbiAgeyBpZDogXCJub3JtYWxcIiwgbmFtZTogXCJOT1JNQUxcIiB9LFxuICB7IGlkOiBcImhhcmRcIiwgbmFtZTogXCJIQVJEXCIgfSxcbiAgeyBpZDogXCJ2ZXJ5aGFyZFwiLCBuYW1lOiBcIlZFUlkgSEFSRFwiIH0sXG5dO1xuXG4vKiogVGhlIGNoYXJhY3RlciBiZWluZyBtYWRlIChhbmQgdGhlIG9uZSBhIHNhdmUgaG9sZHMpLiAqL1xuZXhwb3J0IHR5cGUgQ2hhcmFjdGVyID0ge1xuICAvKiogVGhlIHN0cmVldCBuYW1lIG9uIHRoZSBJRCBjYXJkLiAqL1xuICBoYW5kbGU6IHN0cmluZztcbiAgZGlmZmljdWx0eTogRGlmZmljdWx0eTtcbiAgbGlmZXBhdGg6IExpZmVwYXRoO1xuICAvKiogMCBvciAxOiB0aGUgdHdvIGJvZHkgdHlwZXMuICovXG4gIGJvZHk6IG51bWJlcjtcbiAgLyoqIDAgPSBtYXNjdWxpbmUsIDEgPSBmZW1pbmluZSB2b2ljZSB0b25lLiAqL1xuICB2b2ljZTogbnVtYmVyO1xuICAvKiogQXBwZWFyYW5jZSBvcHRpb24gaWQg4oaSIGNob3NlbiBpbmRleCAodGhlIG9wdGlvbnMgbGl2ZSB3aXRoIHRoZSBuZXdcbiAgICogIGdhbWUgc2NyZWVucykuICovXG4gIGxvb2s6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIGF0dHJpYnV0ZXM6IFJlY29yZDxBdHRyaWJ1dGVJZCwgbnVtYmVyPjtcbn07XG5cbmV4cG9ydCBjb25zdCBORVdfQ0hBUkFDVEVSOiBDaGFyYWN0ZXIgPSB7XG4gIGhhbmRsZTogXCJOWVhcIixcbiAgZGlmZmljdWx0eTogXCJub3JtYWxcIixcbiAgbGlmZXBhdGg6IFwic3RyZWV0a2lkXCIsXG4gIGJvZHk6IDAsXG4gIHZvaWNlOiAwLFxuICBsb29rOiB7fSxcbiAgYXR0cmlidXRlczogeyBib2R5OiAzLCBpbnRlbGxpZ2VuY2U6IDMsIHJlZmxleGVzOiAzLCB0ZWNoOiAzLCBjb29sOiAzIH0sXG59O1xuXG4vKiogT25lIHNhdmUgc2xvdC4gKi9cbmV4cG9ydCB0eXBlIFNhdmUgPSB7XG4gIGlkOiBudW1iZXI7XG4gIC8qKiBUaGUgcXVlc3QgaXQgd2FzIHNhdmVkIGluIChcIkd1dHRlciBTYWludHNcIikuICovXG4gIHF1ZXN0OiBzdHJpbmc7XG4gIC8qKiBcIk1hbnVhbFNhdmUtM1wiLCBcIkF1dG9TYXZlLTBcIiwgXCJRdWlja1NhdmVcIi4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICBsb2NhdGlvbjogc3RyaW5nO1xuICBsZXZlbDogbnVtYmVyO1xuICAvKiogTWludXRlcyBwbGF5ZWQuICovXG4gIHBsYXl0aW1lOiBudW1iZXI7XG4gIC8qKiBXaGVuIGl0IHdhcyBzYXZlZCwgYXMgc2hvd24gKFwiMTAvMDYvOTEsIDExOjQyIFBNXCIpLiAqL1xuICBkYXRlOiBzdHJpbmc7XG4gIGNoYXJhY3RlcjogQ2hhcmFjdGVyO1xufTtcblxuLyoqIEVhY2ggbGlmZXBhdGgncyBvcGVuaW5nIHF1ZXN0IGFuZCB3aGVyZSBpdCBzdGFydHMuICovXG5leHBvcnQgY29uc3QgUFJPTE9HVUU6IFJlY29yZDxMaWZlcGF0aCwgeyBxdWVzdDogc3RyaW5nOyBsb2NhdGlvbjogc3RyaW5nIH0+ID0ge1xuICBub21hZDogeyBxdWVzdDogXCJEdXN0IFJ1blwiLCBsb2NhdGlvbjogXCJCYWRsYW5kczogUmVkIE1lc2EgUGFzc1wiIH0sXG4gIHN0cmVldGtpZDogeyBxdWVzdDogXCJHdXR0ZXIgU2FpbnRzXCIsIGxvY2F0aW9uOiBcIktlc3NsZXI6IExhbnRlcm4gQWxsZXlcIiB9LFxuICBjb3JwbzogeyBxdWVzdDogXCJHbGFzcyBDZWlsaW5nXCIsIGxvY2F0aW9uOiBcIlRlbmthaSBUb3dlcjogTG9iYnkgM1wiIH0sXG59O1xuXG4vKiogVGhlIHNhdmVzIHRoYXQgc2hpcCB3aXRoIHRoZSBmcm9udCBlbmQsIG5ld2VzdCBmaXJzdC4gKi9cbmV4cG9ydCBjb25zdCBTRUVEX1NBVkVTOiBTYXZlW10gPSBbXG4gIHtcbiAgICBpZDogMyxcbiAgICBxdWVzdDogXCJHdXR0ZXIgU2FpbnRzXCIsXG4gICAgbmFtZTogXCJRdWlja1NhdmVcIixcbiAgICBsb2NhdGlvbjogXCJLZXNzbGVyOiBOaWdodCBNYXJrZXRcIixcbiAgICBsZXZlbDogMTQsXG4gICAgcGxheXRpbWU6IDEzMTIsXG4gICAgZGF0ZTogXCIxMC8wNi85MSwgMTE6NDIgUE1cIixcbiAgICBjaGFyYWN0ZXI6IHsgLi4uTkVXX0NIQVJBQ1RFUiwgbGlmZXBhdGg6IFwic3RyZWV0a2lkXCIgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAyLFxuICAgIHF1ZXN0OiBcIkdsYXNzIENlaWxpbmdcIixcbiAgICBuYW1lOiBcIk1hbnVhbFNhdmUtMlwiLFxuICAgIGxvY2F0aW9uOiBcIlRlbmthaSBUb3dlcjogQ291bnRlcmludGVsXCIsXG4gICAgbGV2ZWw6IDYsXG4gICAgcGxheXRpbWU6IDM4NCxcbiAgICBkYXRlOiBcIjEwLzA0LzkxLCA5OjEyIEFNXCIsXG4gICAgY2hhcmFjdGVyOiB7IC4uLk5FV19DSEFSQUNURVIsIGhhbmRsZTogXCJWRUdBXCIsIGxpZmVwYXRoOiBcImNvcnBvXCIsIGJvZHk6IDEgfSxcbiAgfSxcbiAge1xuICAgIGlkOiAxLFxuICAgIHF1ZXN0OiBcIkR1c3QgUnVuXCIsXG4gICAgbmFtZTogXCJBdXRvU2F2ZS0xXCIsXG4gICAgbG9jYXRpb246IFwiQmFkbGFuZHM6IFJlZCBNZXNhIFBhc3NcIixcbiAgICBsZXZlbDogMixcbiAgICBwbGF5dGltZTogNDEsXG4gICAgZGF0ZTogXCIwOS8yOS85MSwgNjowMyBQTVwiLFxuICAgIGNoYXJhY3RlcjogeyAuLi5ORVdfQ0hBUkFDVEVSLCBoYW5kbGU6IFwiUlVTVFwiLCBsaWZlcGF0aDogXCJub21hZFwiIH0sXG4gIH0sXG5dO1xuXG4vKiogXCIyMTo1MlwiIGZyb20gbWludXRlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwbGF5dGltZShtaW51dGVzOiBudW1iZXIpIHtcbiAgY29uc3QgaCA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcbiAgY29uc3QgbSA9IG1pbnV0ZXMgJSA2MDtcbiAgcmV0dXJuIGAke2h9OiR7bS50b1N0cmluZygpLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBpbnRlcnBvbGF0ZSwgdXNlU2hhcmVkVmFsdWUsIHdpdGhUaW1pbmcgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uL3NvdW5kXCI7XG5pbXBvcnQgdHlwZSB7IExpZmVwYXRoIH0gZnJvbSBcIi4uL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBSdWxlIH0gZnJvbSBcIi4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBGSUxMIH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgV29yZG1hcmsgfSBmcm9tIFwiLi4vdWkvV29yZG1hcmtcIjtcbmltcG9ydCB7IGFubm91bmNlQXJyaXZhbCB9IGZyb20gXCIuL0luR2FtZVwiO1xuaW1wb3J0IHsgTGlmZXBhdGhJY29uIH0gZnJvbSBcIi4vc2F2ZXMvaWNvbnNcIjtcblxuY29uc3QgRFVSQVRJT04gPSAyNDAwO1xuY29uc3QgU0VHTUVOVFMgPSAyNDtcblxuLyoqIFdoYXQgdGhlIHN0cmVldCBzYXlzIHdoaWxlIHRoZSB3b3JsZCBsb2Fkcy4gKi9cbmNvbnN0IFRJUFM6IFJlY29yZDxMaWZlcGF0aCwgc3RyaW5nPiA9IHtcbiAgbm9tYWQ6XG4gICAgXCJPdXQgaW4gdGhlIEJhZGxhbmRzIHRoZSBjbGFuIGlzIHlvdXIgYXJtb3IuIEluIFNhYmxlIENpdHksIGtlZXAgeW91ciBjYXIgY2xvc2UgYW5kIHlvdXIgZXhpdHMgY2xvc2VyLlwiLFxuICBzdHJlZXRraWQ6XG4gICAgXCJLZXNzbGVyIHJ1bnMgb24gZmF2b3JzLiBPd2UgdGhlIHdyb25nIGZpeGVyIGFuZCB0aGUgd2hvbGUgYmxvY2sga25vd3MgYnkgc3VuZG93bi5cIixcbiAgY29ycG86XG4gICAgXCJBdCBUZW5rYWkgZXZlcnkgZWxldmF0b3IgaGFzIGVhcnMuIFNwZWFrIGxpa2UgdGhlIGJvYXJkIGlzIGxpc3RlbmluZywgYmVjYXVzZSBpdCBpcy5cIixcbn07XG5cbi8qKiBUaGUgbG9hZCBpbnRvIHRoZSBnYW1lOiB0aGUgd29yZG1hcmsgdGlsdGVkIG92ZXIgdGhlIGRhdGFzY2FwZSxcbiAqICBCUkVBQ0hJTkfigKYgaW4gaXRzIHJlZCBib3gsIHRoZSBwcm9ncmVzcyBmaWxsaW5nIHNlZ21lbnQgYnkgc2VnbWVudCAob25lXG4gKiAgc2hhcmVkIHZhbHVlLCBCZXZ5LWRyaXZlbiksIGEgdGlwIGZvciB0aGUgY2hvc2VuIGxpZmVwYXRoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExvYWRpbmcoe1xuICBsaWZlcGF0aCxcbiAgb25Eb25lLFxufToge1xuICBsaWZlcGF0aDogTGlmZXBhdGg7XG4gIG9uRG9uZTogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgcHJvZ3Jlc3MgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgY29uc3QgZG9uZSA9IHVzZVJlZihvbkRvbmUpO1xuICBkb25lLmN1cnJlbnQgPSBvbkRvbmU7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2Z4KFwiYm9vdFwiKTtcbiAgICBhbm5vdW5jZUFycml2YWwoKTtcbiAgICBwcm9ncmVzcy52YWx1ZSA9IHdpdGhUaW1pbmcoMSwge1xuICAgICAgZHVyYXRpb246IERVUkFUSU9OIC0gMjAwLFxuICAgICAgZWFzaW5nOiBcImVhc2VJblwiLFxuICAgIH0pO1xuICAgIGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IGRvbmUuY3VycmVudCgpLCBEVVJBVElPTik7XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0KTtcbiAgfSwgW3Byb2dyZXNzXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8V29yZG1hcmtcbiAgICAgICAgd2lkdGg9ezEyNDB9XG4gICAgICAgIGdsaXRjaD17MC4zfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDMwMCxcbiAgICAgICAgICB0b3A6IDMwMCxcbiAgICAgICAgICB0cmFuc2Zvcm0zZDoge1xuICAgICAgICAgICAgcGVyc3BlY3RpdmU6IDE1MDAsXG4gICAgICAgICAgICByb3RhdGVYOiAyNCxcbiAgICAgICAgICAgIHJvdGF0ZVk6IC0xOCxcbiAgICAgICAgICAgIHJvdGF0ZVo6IC03LFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogODI2LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDEwLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMTg2LCBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgY29sb3I6IEMucmVkRGltIH19PlxuICAgICAgICAgICAge1wiTU9ERUwgTElORSAgICAgICAxLjIwMDFBXCJ9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBoZWlnaHQ6IDQ2LFxuICAgICAgICAgICAgICBib3JkZXI6IDIsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjAsIDYsIDEwLCAwLjYpXCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAzMCxcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgICAgY2FjaGU6IFwibmV2ZXJcIixcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICAgIG5hbWU6IFwiZ2xpdGNoXCIsXG4gICAgICAgICAgICAgICAgICBwYXJhbXM6IHsgaW50ZW5zaXR5OiAwLjUsIGZyZXF1ZW5jeTogMC42LCB0ZWFyOiAxMCB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIEJSRUFDSElORy4uLlxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDIgfX0+XG4gICAgICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IFNFR01FTlRTIH0sIChfLCBpKSA9PiAoXG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA0LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IHtcbiAgICAgICAgICAgICAgICAgIGFuaW1hdGVkOiBpbnRlcnBvbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgICAgIFtpIC8gU0VHTUVOVFMsIChpICsgMSkgLyBTRUdNRU5UU10sXG4gICAgICAgICAgICAgICAgICAgIFswLjEyLCAxXSxcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDY0MCxcbiAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDIwLCA2LCAxMCwgMC41KVwiLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMiwgdmVydGljYWw6IDcgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPExpZmVwYXRoSWNvbiBsaWZlcGF0aD17bGlmZXBhdGh9IHNpemU9ezIyfSAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMTcsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgbGluZUhlaWdodDogMS4yLFxuICAgICAgICAgICAgICBmbGV4U2hyaW5rOiAxLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7VElQU1tsaWZlcGF0aF19XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGNvbG9yOiBDLnJlZERpbSB9fT5cbiAgICAgICAgICB7XCLiloggU0NfREJfOTQzNTAzLjQzMDg4Mzk0NTZcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8UnVsZSB3aWR0aD17MTEwMH0gY29sb3I9e0MucmVkRGltfSAvPlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5cbi8qKiBBIHRpbnkgZGV0ZXJtaW5pc3RpYyBnZW5lcmF0b3IsIHNvIHRoZSBkYXRhIG5vaXNlIGlzIHN0YWJsZSBwZXIgc2VlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBybmcoc2VlZDogbnVtYmVyKSB7XG4gIGxldCBzID0gc2VlZCAqIDI2NTQ0MzU3NjEgKyAxO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHMgXj0gcyA8PCAxMztcbiAgICBzIF49IHMgPj4+IDE3O1xuICAgIHMgXj0gcyA8PCA1O1xuICAgIHJldHVybiAocyA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuXG5jb25zdCBIRVggPSBcIjAxMjM0NTY3ODlBQkNERUZcIjtcblxuLyoqIExpbmVzIG9mIGhleCBncm91cHMsIGxpa2UgdGhlIHJlYWRvdXRzIHN0cmV3biBhcm91bmQgdGhlIGdhbWUncyBmcmFtZXMuICovXG5leHBvcnQgZnVuY3Rpb24gbm9pc2VMaW5lcyhzZWVkOiBudW1iZXIsIGxpbmVzOiBudW1iZXIsIGdyb3VwczogbnVtYmVyKSB7XG4gIGNvbnN0IHIgPSBybmcoc2VlZCk7XG4gIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiBsaW5lcyB9LCAoKSA9PlxuICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IGdyb3VwcyB9LCAoKSA9PlxuICAgICAgQXJyYXkuZnJvbShcbiAgICAgICAgeyBsZW5ndGg6IDQgKyBNYXRoLmZsb29yKHIoKSAqIDUpIH0sXG4gICAgICAgICgpID0+IEhFWFtNYXRoLmZsb29yKHIoKSAqIDE2KV0sXG4gICAgICApLmpvaW4oXCJcIiksXG4gICAgKS5qb2luKFwiIFwiKSxcbiAgKTtcbn1cblxuLyoqIEEgYmxvY2sgb2YgZGF0YSBub2lzZSBpbiB0aGUgbWljcm8gbW9ubyBmYWNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERhdGFOb2lzZSh7XG4gIHNlZWQsXG4gIGxpbmVzID0gNCxcbiAgZ3JvdXBzID0gNCxcbiAgY29sb3IgPSBDLnJlZERpbSxcbiAgc3R5bGUsXG59OiB7XG4gIHNlZWQ6IG51bWJlcjtcbiAgbGluZXM/OiBudW1iZXI7XG4gIGdyb3Vwcz86IG51bWJlcjtcbiAgY29sb3I/OiBzdHJpbmc7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xufSkge1xuICByZXR1cm4gKFxuICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGNvbG9yLCAuLi5zdHlsZSB9fT5cbiAgICAgIHtub2lzZUxpbmVzKHNlZWQsIGxpbmVzLCBncm91cHMpLmpvaW4oXCJcXG5cIil9XG4gICAgPC90ZXh0PlxuICApO1xufVxuXG4vKiogVGhlIHN0YW1wIGluIHRoZSB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlIGZ1bGwtc2NyZWVuIG1lbnVzOiBhIG1hcmssIGFcbiAqICBwcm90b2NvbCBudW1iZXIsIGFuZCB0aGUgc21hbGwgcHJpbnQuICovXG5leHBvcnQgZnVuY3Rpb24gUHJvdG9jb2xTdGFtcCh7IHN0eWxlIH06IHsgc3R5bGU/OiBCZXZ5U3R5bGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogNTAsXG4gICAgICAgIHRvcDogNDIsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIGdhcDogNCxcbiAgICAgICAgLi4uc3R5bGUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMTAsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICB7WzM4LCAyNiwgMzQsIDIwXS5tYXAoKHcsIGkpID0+IChcbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IHcsIGhlaWdodDogMywgYmFja2dyb3VuZENvbG9yOiBDLnJlZERpbSB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogOSwgY29sb3I6IEMucmVkRGltIH19PlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwiT05MWSBTQ1BEIENMQVNTLTQgVEVDSFNcXG5NQVkgQUNDRVNTLCBPUEVSQVRFIE9SXFxuRElTQUJMRSBUSElTIERFVklDRS5cIlxuICAgICAgICAgIH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgIGNvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XCJQUk9UT0NPTFxcbjc3NDEtQjA5XCJ9XG4gICAgICA8L3RleHQ+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgaGVpZ2h0OiAxMSxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkRGVlcCxcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDE4IH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA4LCBjb2xvcjogXCIjZmZiM2FkXCIgfX0+XG4gICAgICAgICAgU0JMIDA0NCBDS0MgMTUxIENDMTAgQTU1XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHRoaW4gcnVsZSB3aXRoIGEgY2FwdGlvbiwgbGlrZSB0aGUgb25lcyBmcmFtaW5nIHRoZSBnYW1lJ3MgcGFuZWxzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJ1bGUoe1xuICB3aWR0aCxcbiAgbGFiZWwsXG4gIGNvbG9yID0gQy5yZWREaW0sXG4gIHN0eWxlLFxufToge1xuICB3aWR0aDogbnVtYmVyO1xuICBsYWJlbD86IHN0cmluZztcbiAgY29sb3I/OiBzdHJpbmc7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMywgd2lkdGgsIC4uLnN0eWxlIH19PlxuICAgICAge2xhYmVsICYmIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA4LCBjb2xvciB9fT57bGFiZWx9PC90ZXh0Pn1cbiAgICAgIDxub2RlIHN0eWxlPXt7IGhlaWdodDogMSwgYmFja2dyb3VuZENvbG9yOiBjb2xvciB9fSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSBmYWludCBkb3R0ZWQgcmFpbHMgZG93biBib3RoIGVkZ2VzIG9mIHRoZSBmdWxsLXNjcmVlbiBtZW51cywgd2l0aCBhXG4gKiAgcm90YXRlZCByZWFkb3V0IG9uIHRoZSBsZWZ0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVkZ2VSYWlscygpIHtcbiAgY29uc3QgcmFpbCA9IChzaWRlOiBcImxlZnRcIiB8IFwicmlnaHRcIik6IEJldnlTdHlsZSA9PiAoe1xuICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgIFtzaWRlXTogMTgsXG4gICAgdG9wOiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICB3aWR0aDogMyxcbiAgICBib3JkZXI6IHsgbGVmdDogMSB9LFxuICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMTgpXCIsXG4gIH0pO1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZSBzdHlsZT17cmFpbChcImxlZnRcIil9IC8+XG4gICAgICA8bm9kZSBzdHlsZT17cmFpbChcInJpZ2h0XCIpfSAvPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IC05NixcbiAgICAgICAgICB0b3A6IDUyMCxcbiAgICAgICAgICB3aWR0aDogMjQwLFxuICAgICAgICAgIGNvbG9yOiBcInJnYmEoMTk5LCA0NiwgNDMsIDAuNylcIixcbiAgICAgICAgICB0cmFuc2Zvcm06IHsgcm90YXRlOiAtOTAgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgREIgMTI0NC42MzUxMzIgMTI0NC42MzUxMzIgQ1BcbiAgICAgIDwvdGV4dD5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIFRoZSByZXNpZGVudC1kYXRhYmFzZSBzbWFsbCBwcmludCBhdCB0aGUgYm90dG9tIGxlZnQgb2YgdGhlIG5ldy1nYW1lXG4gKiAgc2NyZWVuczogYSBtYXJrIG9mIHRocmVlIHBlYWtzLCB0aGUgZGF0YWJhc2UncyBuYW1lLCB0aGUgZmluZSBwcmludC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMZWdhbEZvb3RlcigpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDUwLFxuICAgICAgICBib3R0b206IDEyLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDEwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgNjAgNDBcIiBzdHlsZT17eyB3aWR0aDogNjYsIGhlaWdodDogNDQgfX0+XG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXtbMiwgMzgsIDE2LCA4LCAyNiwgMjYsIDMyLCAxNCwgNDAsIDI4LCA0NiwgNiwgNTgsIDM4XX1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtDLnJlZERpbX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17Mi40fVxuICAgICAgICAgIHN0cm9rZUxpbmVqb2luPVwibWl0ZXJcIlxuICAgICAgICAvPlxuICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICBwb2ludHM9e1sxMCwgMzgsIDE4LCAyMiwgMjQsIDM4XX1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtDLnJlZERpbX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgICAvPlxuICAgICAgPC9zdmc+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgIGNvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgICBsaW5lSGVpZ2h0OiAxLjE1LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XCJTYWJsZSBDaXR5XFxuUmVzaWRlbnRcXG5EYXRhYmFzZVwifVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogNTIwLFxuICAgICAgICAgIGZvbnRTaXplOiAxMC41LFxuICAgICAgICAgIGNvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgICBsaW5lSGVpZ2h0OiAxLjI1LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XG4gICAgICAgICAgXCJUaGUgZGF0YSB5b3UgZW50ZXIgb24gYSBDUkQgdGVybWluYWwgd2lsbCBvbmx5IGJlIHVzZWQgZm9yIHRoZSBwdXJwb3NlIHlvdSBlbnRlcmVkIGl0LiBZb3VyIHBlcnNvbmFsIGRhdGEgaXMgcHJvdGVjdGVkIHVuZGVyIHRoZSAyMDg4IFByaXZhY3kgQWN0IGFuZCB0aGUgU2FibGUgQ2l0eSBDaGFydGVyLCBleGNlcHQgd2hlcmUgaXQgaXMgbm90LiBJbiBhY2NvcmRhbmNlIHdpdGggR3JpZHdhdGNoIE1lbW8gNDQxMC1CLCB0ZXJtaW5hbHMgbWF5IHJldGFpbiBiaW9tZXRyaWMgc2FtcGxlcyBmb3IgdGhlIGR1cmF0aW9uIG9mIHlvdXIgc2Vzc2lvbiBhbmQgdGhlIHJlc3Qgb2YgeW91ciBsaWZlLlwiXG4gICAgICAgIH1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN5bmNFeHRlcm5hbFN0b3JlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4uLy4uL2JldnlcIjtcbmltcG9ydCB7IERFRkFVTFRTLCBSRVNPTFVUSU9OUyB9IGZyb20gXCIuL2RhdGFcIjtcblxuZXhwb3J0IHR5cGUgU2V0dGluZ1ZhbHVlID0gbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZztcblxuLyoqIFRoZSBzZXR0aW5ncywgYnkgcm93IGlkIChgZGF0YS50c2ApLiBLZXB0IG9uIGBnbG9iYWxUaGlzYCBzbyBhIGhvdFxuICogIHJlbG9hZCAod2hpY2ggcmUtcnVucyB0aGlzIG1vZHVsZSkga2VlcHMgdGhlbS4gKi9cbnR5cGUgU3RvcmUgPSB7XG4gIHZhbHVlczogUmVjb3JkPHN0cmluZywgU2V0dGluZ1ZhbHVlPjtcbiAgbGlzdGVuZXJzOiBTZXQ8KCkgPT4gdm9pZD47XG59O1xuXG5jb25zdCBnID0gZ2xvYmFsVGhpcyBhcyB7IF9fY3liZXJwdW5rU2V0dGluZ3M/OiBTdG9yZSB9O1xuY29uc3Qgc3RvcmU6IFN0b3JlID0gKGcuX19jeWJlcnB1bmtTZXR0aW5ncyA/Pz0ge1xuICB2YWx1ZXM6IHt9LFxuICBsaXN0ZW5lcnM6IG5ldyBTZXQoKSxcbn0pO1xuLy8gUm93cyBhZGRlZCBzaW5jZSB0aGUgbGFzdCByZWxvYWQgc3RhcnQgYXQgdGhlaXIgZGVmYXVsdHMuXG5zdG9yZS52YWx1ZXMgPSB7IC4uLkRFRkFVTFRTLCAuLi5zdG9yZS52YWx1ZXMgfTtcblxuZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyOiAoKSA9PiB2b2lkKSB7XG4gIHN0b3JlLmxpc3RlbmVycy5hZGQobGlzdGVuZXIpO1xuICByZXR1cm4gKCkgPT4gc3RvcmUubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG59XG5cbi8qKiBFdmVyeSBzZXR0aW5nLCByZS1yZW5kZXJpbmcgb24gY2hhbmdlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVNldHRpbmdzKCkge1xuICByZXR1cm4gdXNlU3luY0V4dGVybmFsU3RvcmUoc3Vic2NyaWJlLCAoKSA9PiBzdG9yZS52YWx1ZXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2V0dGluZ3ModmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBTZXR0aW5nVmFsdWU+KSB7XG4gIHN0b3JlLnZhbHVlcyA9IHsgLi4uc3RvcmUudmFsdWVzLCAuLi52YWx1ZXMgfTtcbiAgc3RvcmUubGlzdGVuZXJzLmZvckVhY2goKGwpID0+IGwoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXR0aW5nKGlkOiBzdHJpbmcsIHZhbHVlOiBTZXR0aW5nVmFsdWUpIHtcbiAgc2V0U2V0dGluZ3MoeyBbaWRdOiB2YWx1ZSB9KTtcbn1cblxuLyoqIFB1c2ggdGhlIHNldHRpbmdzIEJldnkgYXBwbGllcyDigJQgdGhlIHZvbHVtZXMsIHRoZSBjYW1lcmEsIHRoZSBnYW1tYSDigJQgb25cbiAqICBtb3VudCBhbmQgd2hlbmV2ZXIgdGhleSBjaGFuZ2UuIFZJREVPIG9ubHkgb24gY2hhbmdlOiBvbiBtb3VudCBpdCB3b3VsZFxuICogIG9ubHkgZm9yY2UgdGhlIHdpbmRvdyBtYWluLnJzIG9wZW5lZCBiYWNrIHRvIHRoZSBzdG9yZWQgZGVmYXVsdHMuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlTGl2ZVNldHRpbmdzKCkge1xuICBjb25zdCB2ID0gdXNlU2V0dGluZ3MoKTtcbiAgY29uc3QgbiA9IChpZDogc3RyaW5nKSA9PiBOdW1iZXIodltpZF0pO1xuICB1c2VQdXNoKFxuICAgIHsgbWFzdGVyOiBuKFwibWFzdGVyXCIpIC8gMTAwLCBzZng6IG4oXCJzZnhcIikgLyAxMDAsIG11c2ljOiBuKFwibXVzaWNcIikgLyAxMDAgfSxcbiAgICBiZXZ5LnNvdW5kLnZvbHVtZSxcbiAgKTtcbiAgdXNlUHVzaChcbiAgICB7XG4gICAgICBmb3Y6IG4oXCJmb3ZcIiksXG4gICAgICBhYmVycmF0aW9uOiB2LmFiZXJyYXRpb24gPT09IHRydWUsXG4gICAgICBmb2N1czogdi5mb2N1cyA9PT0gdHJ1ZSxcbiAgICAgIGZsYXJlOiB2LmZsYXJlID09PSB0cnVlLFxuICAgICAgYmx1cjogbihcImJsdXJcIiksXG4gICAgfSxcbiAgICBiZXZ5LnNldHRpbmdzLmdyYXBoaWNzLFxuICApO1xuICB1c2VQdXNoKHsgdmFsdWU6IG4oXCJnYW1tYVwiKSB9LCBiZXZ5LnNldHRpbmdzLmdhbW1hKTtcbiAgY29uc3QgW3dpZHRoLCBoZWlnaHRdID0gKFJFU09MVVRJT05TW24oXCJyZXNvbHV0aW9uXCIpXSA/PyBcIjB4MFwiKVxuICAgIC5zcGxpdChcInhcIilcbiAgICAubWFwKE51bWJlcik7XG4gIHVzZVB1c2goXG4gICAgeyBtb2RlOiBuKFwibW9kZVwiKSwgd2lkdGgsIGhlaWdodCwgdnN5bmM6IHYudnN5bmMgPT09IHRydWUgfSxcbiAgICBiZXZ5LnNldHRpbmdzLnZpZGVvLFxuICAgIGZhbHNlLFxuICApO1xufVxuXG4vKiogU2VuZCBgdmFsdWVgIHdoZW5ldmVyIGl0IGRpZmZlcnMgZnJvbSB3aGF0IHdhcyBsYXN0IHNlbnQgKGFuZCBvbiBtb3VudCxcbiAqICB1bmxlc3MgYG9uTW91bnRgIGlzIGZhbHNlKS4gKi9cbmZ1bmN0aW9uIHVzZVB1c2g8VD4odmFsdWU6IFQsIHB1c2g6ICh2YWx1ZTogVCkgPT4gdm9pZCwgb25Nb3VudCA9IHRydWUpIHtcbiAgY29uc3Qga2V5ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICBjb25zdCBzZW50ID0gdXNlUmVmKG9uTW91bnQgPyBcIlwiIDoga2V5KTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VudC5jdXJyZW50ID09PSBrZXkpIHJldHVybjtcbiAgICBzZW50LmN1cnJlbnQgPSBrZXk7XG4gICAgcHVzaChKU09OLnBhcnNlKGtleSkpO1xuICB9LCBba2V5LCBwdXNoXSk7XG59XG4iLCAiLy8gVGhlIHNldHRpbmdzLCB0YWIgYnkgdGFiLiBFdmVyeSByb3cgd2l0aCBhbiBgaWRgIGtlZXBzIGl0cyB2YWx1ZSBpbiB0aGVcbi8vIHN0b3JlIHVuZGVyIHRoYXQgaWQgKGEgc2VsZWN0b3Igc3RvcmVzIHRoZSBjaG9zZW4gb3B0aW9uJ3MgaW5kZXgpLiBSb3dzXG4vLyBtYXJrZWQgbGl2ZSBpbiB0aGUgY29tbWVudHMgcmVhY2ggQmV2eSAoYHVzZUxpdmVTZXR0aW5nc2ApOyB0aGUgcmVzdCBhcmVcbi8vIGtlcHQgYW5kIHNob3duLCBsaWtlIGEgbWVudSBvZiBhIGdhbWUgdGhhdCBpc24ndCBydW5uaW5nLlxuXG5pbXBvcnQgdHlwZSB7IFNldHRpbmdWYWx1ZSB9IGZyb20gXCIuL3N0b3JlXCI7XG5cbmV4cG9ydCB0eXBlIFJvdyA9XG4gIHwgeyBraW5kOiBcInNlY3Rpb25cIjsgbGFiZWw6IHN0cmluZyB9XG4gIHwge1xuICAgICAga2luZDogXCJzZWxlY3RcIjtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgICBsYWJlbDogc3RyaW5nO1xuICAgICAgb3B0aW9uczogc3RyaW5nW107XG4gICAgICBkZWY6IG51bWJlcjtcbiAgICB9XG4gIHwgeyBraW5kOiBcInRvZ2dsZVwiOyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWY6IGJvb2xlYW4gfVxuICB8IHtcbiAgICAgIGtpbmQ6IFwic2xpZGVyXCI7XG4gICAgICBpZDogc3RyaW5nO1xuICAgICAgbGFiZWw6IHN0cmluZztcbiAgICAgIG1pbjogbnVtYmVyO1xuICAgICAgbWF4OiBudW1iZXI7XG4gICAgICBzdGVwOiBudW1iZXI7XG4gICAgICBkZWY6IG51bWJlcjtcbiAgICB9XG4gIHwgeyBraW5kOiBcImtleVwiOyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBkZWY6IHN0cmluZyB9XG4gIHwgeyBraW5kOiBcImluZm9cIjsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9O1xuXG5leHBvcnQgdHlwZSBTbGlkZXIgPSBFeHRyYWN0PFJvdywgeyBraW5kOiBcInNsaWRlclwiIH0+O1xuXG5leHBvcnQgdHlwZSBUYWJJZCA9XG4gIHwgXCJzb3VuZFwiXG4gIHwgXCJjb250cm9sc1wiXG4gIHwgXCJnYW1lcGxheVwiXG4gIHwgXCJncmFwaGljc1wiXG4gIHwgXCJ2aWRlb1wiXG4gIHwgXCJsYW5ndWFnZVwiXG4gIHwgXCJpbnRlcmZhY2VcIlxuICB8IFwia2V5c1wiO1xuXG5jb25zdCBzZWN0aW9uID0gKGxhYmVsOiBzdHJpbmcpOiBSb3cgPT4gKHsga2luZDogXCJzZWN0aW9uXCIsIGxhYmVsIH0pO1xuY29uc3Qgc2VsZWN0ID0gKFxuICBpZDogc3RyaW5nLFxuICBsYWJlbDogc3RyaW5nLFxuICBvcHRpb25zOiBzdHJpbmdbXSxcbiAgZGVmID0gMCxcbik6IFJvdyA9PiAoeyBraW5kOiBcInNlbGVjdFwiLCBpZCwgbGFiZWwsIG9wdGlvbnMsIGRlZiB9KTtcbmNvbnN0IHRvZ2dsZSA9IChpZDogc3RyaW5nLCBsYWJlbDogc3RyaW5nLCBkZWYgPSBmYWxzZSk6IFJvdyA9PiAoe1xuICBraW5kOiBcInRvZ2dsZVwiLFxuICBpZCxcbiAgbGFiZWwsXG4gIGRlZixcbn0pO1xuY29uc3Qgc2xpZGVyID0gKFxuICBpZDogc3RyaW5nLFxuICBsYWJlbDogc3RyaW5nLFxuICBtaW46IG51bWJlcixcbiAgbWF4OiBudW1iZXIsXG4gIGRlZjogbnVtYmVyLFxuICBzdGVwID0gMSxcbik6IFNsaWRlciA9PiAoeyBraW5kOiBcInNsaWRlclwiLCBpZCwgbGFiZWwsIG1pbiwgbWF4LCBzdGVwLCBkZWYgfSk7XG5jb25zdCBrZXkgPSAoaWQ6IHN0cmluZywgbGFiZWw6IHN0cmluZywgZGVmOiBzdHJpbmcpOiBSb3cgPT4gKHtcbiAga2luZDogXCJrZXlcIixcbiAgaWQsXG4gIGxhYmVsLFxuICBkZWYsXG59KTtcblxuLyoqIFRoZSB3aW5kb3dlZCBzaXplcyBWSURFTyBvZmZlcnMgKDE2OjkpLiAqL1xuZXhwb3J0IGNvbnN0IFJFU09MVVRJT05TID0gW1xuICBcIjEyODB4NzIwXCIsXG4gIFwiMTM2Nng3NjhcIixcbiAgXCIxNjAweDkwMFwiLFxuICBcIjE5MjB4MTA4MFwiLFxuICBcIjI1NjB4MTQ0MFwiLFxuICBcIjMyMDB4MTgwMFwiLFxuICBcIjM4NDB4MjE2MFwiLFxuXTtcblxuY29uc3QgTEFOR1VBR0VTID0gW1xuICBcIkVuZ2xpc2hcIixcbiAgXCJEZXV0c2NoXCIsXG4gIFwiRXNwYcOxb2xcIixcbiAgXCJGcmFuw6dhaXNcIixcbiAgXCJJdGFsaWFub1wiLFxuICBcIlBvbHNraVwiLFxuICBcIlBvcnR1Z3XDqnNcIixcbiAgXCLEjGXFoXRpbmFcIixcbiAgXCJNYWd5YXJcIixcbiAgXCJUw7xya8OnZVwiLFxuXTtcblxuLyoqIEdSQVBISUNTJyBRdWljayBQcmVzZXQgb3B0aW9uczsgdGhlIGxhc3Qgb25lIGlzIHdoYXQgdHdlYWtpbmcgYW55IHJvd1xuICogIHRoZSBwcmVzZXRzIHNldCB0dXJucyBpdCBpbnRvLiAqL1xuY29uc3QgUFJFU0VUX05BTUVTID0gW1wiTG93XCIsIFwiTWVkaXVtXCIsIFwiSGlnaFwiLCBcIlVsdHJhXCIsIFwiQ3VzdG9tXCJdO1xuZXhwb3J0IGNvbnN0IENVU1RPTSA9IFBSRVNFVF9OQU1FUy5sZW5ndGggLSAxO1xuXG4vKiogV2hhdCBlYWNoIHByZXNldCBzZXRzIChzZWxlY3RvcnMgYnkgaW5kZXgpLiAqL1xuZXhwb3J0IGNvbnN0IFBSRVNFVFM6IFJlY29yZDxzdHJpbmcsIFNldHRpbmdWYWx1ZT5bXSA9IFtcbiAgeyB0ZXh0dXJlczogMCwgYWJlcnJhdGlvbjogZmFsc2UsIGZvY3VzOiBmYWxzZSwgZmxhcmU6IGZhbHNlLCBibHVyOiAwIH0sXG4gIHsgdGV4dHVyZXM6IDEsIGFiZXJyYXRpb246IHRydWUsIGZvY3VzOiBmYWxzZSwgZmxhcmU6IHRydWUsIGJsdXI6IDAgfSxcbiAgeyB0ZXh0dXJlczogMiwgYWJlcnJhdGlvbjogdHJ1ZSwgZm9jdXM6IHRydWUsIGZsYXJlOiB0cnVlLCBibHVyOiAwIH0sXG4gIHsgdGV4dHVyZXM6IDIsIGFiZXJyYXRpb246IHRydWUsIGZvY3VzOiB0cnVlLCBmbGFyZTogdHJ1ZSwgYmx1cjogMiB9LFxuXTtcblxuLyoqIFRoZSBnYW1tYSBzY3JlZW4ncyBvbmUgcm93IChsaXZlKS4gKi9cbmV4cG9ydCBjb25zdCBHQU1NQSA9IHNsaWRlcihcImdhbW1hXCIsIFwiR2FtbWFcIiwgMC41LCAyLCAxLCAwLjA1KTtcblxuZXhwb3J0IGNvbnN0IFRBQlM6IHsgaWQ6IFRhYklkOyBsYWJlbDogc3RyaW5nOyByb3dzOiBSb3dbXSB9W10gPSBbXG4gIHtcbiAgICBpZDogXCJzb3VuZFwiLFxuICAgIGxhYmVsOiBcIlNPVU5EXCIsXG4gICAgcm93czogW1xuICAgICAgc2VjdGlvbihcIkR5bmFtaWMgUmFuZ2VcIiksXG4gICAgICBzZWxlY3QoXCJkeW5hbWljUmFuZ2VcIiwgXCJQcmVzZXRzXCIsIFtcbiAgICAgICAgXCJSZWZlcmVuY2VcIixcbiAgICAgICAgXCJIaS1GaSBTdGVyZW9cIixcbiAgICAgICAgXCJIb21lIFRoZWF0ZXJcIixcbiAgICAgICAgXCJMYXRlIE5pZ2h0XCIsXG4gICAgICAgIFwiSGVhZHBob25lc1wiLFxuICAgICAgICBcIkNvbXByZXNzZWRcIixcbiAgICAgIF0pLFxuICAgICAgc2VjdGlvbihcIlZvbHVtZVwiKSxcbiAgICAgIC8vIExpdmU6IG1hc3Rlciwgc2Z4IGFuZCBtdXNpYy5cbiAgICAgIHNsaWRlcihcIm1hc3RlclwiLCBcIk1hc3RlciBWb2x1bWVcIiwgMCwgMTAwLCAxMDApLFxuICAgICAgc2xpZGVyKFwic2Z4XCIsIFwiU0ZYIFZvbHVtZVwiLCAwLCAxMDAsIDEwMCksXG4gICAgICBzbGlkZXIoXCJkaWFsb2d1ZVwiLCBcIkRpYWxvZ3VlIFZvbHVtZVwiLCAwLCAxMDAsIDEwMCksXG4gICAgICBzbGlkZXIoXCJtdXNpY1wiLCBcIk11c2ljIFZvbHVtZVwiLCAwLCAxMDAsIDEwMCksXG4gICAgICBzbGlkZXIoXCJyYWRpb1wiLCBcIlZlaGljbGUgUmFkaW8gVm9sdW1lXCIsIDAsIDEwMCwgMTAwKSxcbiAgICAgIHNlY3Rpb24oXCJNaXNjXCIpLFxuICAgICAgdG9nZ2xlKFwiYWxlcnRQaW5nc1wiLCBcIk11dGUgQWxlcnQgUGluZ3NcIiksXG4gICAgICB0b2dnbGUoXCJzdHJlYW1TYWZlXCIsIFwiU3RyZWFtLVNhZmUgTXVzaWNcIiksXG4gICAgICBzZWN0aW9uKFwiU3VidGl0bGVzXCIpLFxuICAgICAgdG9nZ2xlKFwic3Vic0NpbmVtYXRpY1wiLCBcIkNpbmVtYXRpY1wiLCB0cnVlKSxcbiAgICAgIHRvZ2dsZShcInN1YnNPdmVyaGVhZFwiLCBcIk92ZXJoZWFkXCIsIHRydWUpLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJjb250cm9sc1wiLFxuICAgIGxhYmVsOiBcIkNPTlRST0xTXCIsXG4gICAgcm93czogW1xuICAgICAgc2xpZGVyKFwidmlicmF0aW9uXCIsIFwiQ29udHJvbGxlciBWaWJyYXRpb25cIiwgMCwgMTAwLCAxMDApLFxuICAgICAgc2xpZGVyKFwiaW5uZXJEZWFkWm9uZVwiLCBcIklubmVyIERlYWQgWm9uZVwiLCAwLCAwLjUsIDAuMDUsIDAuMDEpLFxuICAgICAgc2xpZGVyKFwib3V0ZXJEZWFkWm9uZVwiLCBcIk91dGVyIERlYWQgWm9uZVwiLCAwLjUsIDEsIDAuOSwgMC4wMSksXG4gICAgICBzZWN0aW9uKFwiRmlyc3QtUGVyc29uIENhbWVyYSAoTW91c2UpXCIpLFxuICAgICAgc2xpZGVyKFwiem9vbVNlbnNpdGl2aXR5XCIsIFwiWm9vbSBTZW5zaXRpdml0eVwiLCAwLCAyLCAxLCAwLjEpLFxuICAgICAgc2xpZGVyKFwiZnBWZXJ0aWNhbFwiLCBcIlZlcnRpY2FsIFNlbnNpdGl2aXR5XCIsIDEsIDMwLCA1KSxcbiAgICAgIHNsaWRlcihcImZwSG9yaXpvbnRhbFwiLCBcIkhvcml6b250YWwgU2Vuc2l0aXZpdHlcIiwgMSwgMzAsIDUpLFxuICAgICAgdG9nZ2xlKFwiZnBJbnZlcnRZXCIsIFwiSW52ZXJ0IFZlcnRpY2FsIEF4aXNcIiksXG4gICAgICB0b2dnbGUoXCJmcEludmVydFhcIiwgXCJJbnZlcnQgSG9yaXpvbnRhbCBBeGlzXCIpLFxuICAgICAgc2VjdGlvbihcIlRoaXJkLVBlcnNvbiBDYW1lcmEgKE1vdXNlKVwiKSxcbiAgICAgIHNsaWRlcihcInRwVmVydGljYWxcIiwgXCJWZXJ0aWNhbCBTZW5zaXRpdml0eVwiLCAxLCAzMCwgMyksXG4gICAgICBzbGlkZXIoXCJ0cEhvcml6b250YWxcIiwgXCJIb3Jpem9udGFsIFNlbnNpdGl2aXR5XCIsIDEsIDMwLCAzKSxcbiAgICAgIHRvZ2dsZShcInRwSW52ZXJ0WVwiLCBcIkludmVydCBWZXJ0aWNhbCBBeGlzXCIpLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJnYW1lcGxheVwiLFxuICAgIGxhYmVsOiBcIkdBTUVQTEFZXCIsXG4gICAgcm93czogW1xuICAgICAgc2VjdGlvbihcIkFjY2Vzc2liaWxpdHlcIiksXG4gICAgICBzZWxlY3QoXG4gICAgICAgIFwiYWltQXNzaXN0XCIsXG4gICAgICAgIFwiQWltIEFzc2lzdFwiLFxuICAgICAgICBbXCJPZmZcIiwgXCJMaWdodFwiLCBcIlN0YW5kYXJkXCIsIFwiU3Ryb25nXCJdLFxuICAgICAgICAyLFxuICAgICAgKSxcbiAgICAgIHRvZ2dsZShcInNuYXBUb1RhcmdldFwiLCBcIlNuYXAgdG8gVGFyZ2V0XCIsIHRydWUpLFxuICAgICAgc2VsZWN0KFxuICAgICAgICBcIm1lbGVlQXNzaXN0XCIsXG4gICAgICAgIFwiQWltIEFzc2lzdCAtIE1lbGVlXCIsXG4gICAgICAgIFtcIk9mZlwiLCBcIkxpZ2h0XCIsIFwiU3RhbmRhcmRcIl0sXG4gICAgICAgIDIsXG4gICAgICApLFxuICAgICAgc2VsZWN0KFwiY2FtZXJhU3dheVwiLCBcIkNhbWVyYSBTd2F5XCIsIFtcIk9mZlwiLCBcIlJlZHVjZWRcIiwgXCJGdWxsXCJdLCAyKSxcbiAgICAgIHNlY3Rpb24oXCJQZXJmb3JtYW5jZVwiKSxcbiAgICAgIHNlbGVjdChcImNyb3dkRGVuc2l0eVwiLCBcIkNyb3dkIERlbnNpdHlcIiwgW1wiTG93XCIsIFwiTWVkaXVtXCIsIFwiSGlnaFwiXSwgMiksXG4gICAgICB0b2dnbGUoXCJzbG93U3RvcmFnZVwiLCBcIlNsb3cgU3RvcmFnZSBNb2RlXCIpLFxuICAgICAgc2VjdGlvbihcIk1pc2NlbGxhbmVvdXNcIiksXG4gICAgICB0b2dnbGUoXCJ0dXRvcmlhbHNcIiwgXCJUdXRvcmlhbHNcIiwgdHJ1ZSksXG4gICAgICBzZWxlY3QoXG4gICAgICAgIFwic2tpcERpYWxvZ3VlXCIsXG4gICAgICAgIFwiU2tpcHBpbmcgRGlhbG9ndWVcIixcbiAgICAgICAgW1wiT2ZmXCIsIFwiU2tpcCBCeSBMaW5lXCIsIFwiU2tpcCBBbGxcIl0sXG4gICAgICAgIDEsXG4gICAgICApLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJncmFwaGljc1wiLFxuICAgIGxhYmVsOiBcIkdSQVBISUNTXCIsXG4gICAgcm93czogW1xuICAgICAgLy8gTGl2ZTogZXZlcnl0aGluZyBmcm9tIEZpZWxkIG9mIFZpZXcgdG8gTW90aW9uIEJsdXIgKEZpbG0gR3JhaW4gaW5cbiAgICAgIC8vIHRoZSBVSSBpdHNlbGYpLCBhbmQgdGhlIHByZXNldCB0aGF0IHNldHMgdGhlbS5cbiAgICAgIHNlbGVjdChcInByZXNldFwiLCBcIlF1aWNrIFByZXNldFwiLCBQUkVTRVRfTkFNRVMsIDIpLFxuICAgICAgc2VsZWN0KFwidGV4dHVyZXNcIiwgXCJUZXh0dXJlIFF1YWxpdHlcIiwgW1wiTG93XCIsIFwiTWVkaXVtXCIsIFwiSGlnaFwiXSwgMiksXG4gICAgICBzZWN0aW9uKFwiQmFzaWNcIiksXG4gICAgICBzbGlkZXIoXCJmb3ZcIiwgXCJGaWVsZCBvZiBWaWV3XCIsIDUwLCAxMDAsIDYwKSxcbiAgICAgIHRvZ2dsZShcImZpbG1HcmFpblwiLCBcIkZpbG0gR3JhaW5cIiwgdHJ1ZSksXG4gICAgICB0b2dnbGUoXCJhYmVycmF0aW9uXCIsIFwiQ2hyb21hdGljIEFiZXJyYXRpb25cIiwgdHJ1ZSksXG4gICAgICB0b2dnbGUoXCJmb2N1c1wiLCBcIkRlcHRoIG9mIEZpZWxkXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwiZmxhcmVcIiwgXCJMZW5zIEZsYXJlXCIsIHRydWUpLFxuICAgICAgc2VsZWN0KFwiYmx1clwiLCBcIk1vdGlvbiBCbHVyXCIsIFtcIk9mZlwiLCBcIkxvd1wiLCBcIkhpZ2hcIl0pLFxuICAgICAgc2VjdGlvbihcIkFkdmFuY2VkXCIpLFxuICAgICAgdG9nZ2xlKFwiY29udGFjdFNoYWRvd3NcIiwgXCJDb250YWN0IFNoYWRvd3NcIiksXG4gICAgICBzZWxlY3QoXCJhbmlzb3Ryb3B5XCIsIFwiQW5pc290cm9weVwiLCBbXCIxXCIsIFwiMlwiLCBcIjRcIiwgXCI4XCIsIFwiMTZcIl0sIDIpLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJ2aWRlb1wiLFxuICAgIGxhYmVsOiBcIlZJREVPXCIsXG4gICAgcm93czogW1xuICAgICAgLy8gTGl2ZTogVlN5bmMsIFdpbmRvd2VkIE1vZGUsIFJlc29sdXRpb24uXG4gICAgICBzZWN0aW9uKFwiRGlzcGxheVwiKSxcbiAgICAgIHNlbGVjdChcIm1vbml0b3JcIiwgXCJNb25pdG9yXCIsIFtcIjBcIiwgXCIxXCJdKSxcbiAgICAgIHRvZ2dsZShcInZzeW5jXCIsIFwiVlN5bmNcIiwgdHJ1ZSksXG4gICAgICB0b2dnbGUoXCJmcHNDYXBcIiwgXCJNYXhpbXVtIEZQU1wiKSxcbiAgICAgIHNlbGVjdChcIm1vZGVcIiwgXCJXaW5kb3dlZCBNb2RlXCIsIFtcIldpbmRvd2VkXCIsIFwiQm9yZGVybGVzc1wiLCBcIkZ1bGxzY3JlZW5cIl0pLFxuICAgICAgLy8gVGhlIHdpbmRvdyBtYWluLnJzIG9wZW5zLlxuICAgICAgc2VsZWN0KFwicmVzb2x1dGlvblwiLCBcIlJlc29sdXRpb25cIiwgUkVTT0xVVElPTlMsIDIpLFxuICAgICAgeyBraW5kOiBcImluZm9cIiwgbGFiZWw6IFwiSERSIE1vZGVcIiwgdmFsdWU6IFwiTm9uZVwiIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcImxhbmd1YWdlXCIsXG4gICAgbGFiZWw6IFwiTEFOR1VBR0VcIixcbiAgICByb3dzOiBbXG4gICAgICBzZWxlY3QoXCJ2b2ljZUxhbmd1YWdlXCIsIFwiQXVkaW9cIiwgTEFOR1VBR0VTKSxcbiAgICAgIHNlbGVjdChcInN1YnRpdGxlTGFuZ3VhZ2VcIiwgXCJTdWJ0aXRsZXNcIiwgTEFOR1VBR0VTKSxcbiAgICAgIHNlbGVjdChcInRleHRMYW5ndWFnZVwiLCBcIkludGVyZmFjZVwiLCBMQU5HVUFHRVMpLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJpbnRlcmZhY2VcIixcbiAgICBsYWJlbDogXCJJTlRFUkZBQ0VcIixcbiAgICByb3dzOiBbXG4gICAgICAvLyBMaXZlOiB0aGUgQXBwIHJlYWRzIGJvdGguXG4gICAgICB0b2dnbGUoXCJ1aUdsaXRjaFwiLCBcIlVJIEdsaXRjaCBFZmZlY3RzXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwic2NhbmxpbmVzXCIsIFwiU2NhbmxpbmVzXCIsIHRydWUpLFxuICAgICAgc2VsZWN0KFwiY29sb3JibGluZFwiLCBcIkNvbG9yYmxpbmQgTW9kZXNcIiwgW1xuICAgICAgICBcIk9mZlwiLFxuICAgICAgICBcIlByb3Rhbm9waWFcIixcbiAgICAgICAgXCJEZXV0ZXJhbm9waWFcIixcbiAgICAgICAgXCJUcml0YW5vcGlhXCIsXG4gICAgICBdKSxcbiAgICAgIHNlbGVjdChcbiAgICAgICAgXCJkYW1hZ2VOdW1iZXJzXCIsXG4gICAgICAgIFwiRGFtYWdlIE51bWJlcnNcIixcbiAgICAgICAgW1wiT2ZmXCIsIFwiQ3JpdGljYWwgT25seVwiLCBcIkJvdGhcIl0sXG4gICAgICAgIDIsXG4gICAgICApLFxuICAgICAgdG9nZ2xlKFwiaGl0TWFya2VyXCIsIFwiSGl0IE1hcmtlclwiLCB0cnVlKSxcbiAgICAgIHNlY3Rpb24oXCJIVUQgVmlzaWJpbGl0eVwiKSxcbiAgICAgIHRvZ2dsZShcImh1ZE1pbmltYXBcIiwgXCJNaW5pbWFwXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwiaHVkSGVhbHRoXCIsIFwiSGVhbHRoIEJhclwiLCB0cnVlKSxcbiAgICAgIHRvZ2dsZShcImh1ZEFtbW9cIiwgXCJBbW1vIENvdW50ZXJcIiwgdHJ1ZSksXG4gICAgICB0b2dnbGUoXCJodWRRdWVzdFwiLCBcIlF1ZXN0IFRyYWNrZXJcIiwgdHJ1ZSksXG4gICAgICB0b2dnbGUoXCJodWRIaW50c1wiLCBcIkhpbnRzXCIsIHRydWUpLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJrZXlzXCIsXG4gICAgbGFiZWw6IFwiS0VZIEJJTkRJTkdTXCIsXG4gICAgcm93czogW1xuICAgICAgc2VjdGlvbihcIk1lbW9yeSBSZXBsYXlcIiksXG4gICAgICBrZXkoXCJrZXkucmVwbGF5UGF1c2VcIiwgXCJQYXVzZSBSZXBsYXkgKFRvZ2dsZSlcIiwgXCJTcGFjZVwiKSxcbiAgICAgIGtleShcImtleS5yZXBsYXlGb3J3YXJkXCIsIFwiRmFzdC1Gb3J3YXJkIFJlcGxheVwiLCBcIktleUVcIiksXG4gICAgICBrZXkoXCJrZXkucmVwbGF5UmV3aW5kXCIsIFwiUmV3aW5kIFJlcGxheVwiLCBcIktleVFcIiksXG4gICAgICBrZXkoXCJrZXkucmVwbGF5TGF5ZXJcIiwgXCJTd2l0Y2ggUmVwbGF5IExheWVyXCIsIFwiU2hpZnRMZWZ0XCIpLFxuICAgICAga2V5KFwia2V5LnJlcGxheUV4aXRcIiwgXCJFeGl0IFJlcGxheVwiLCBcIktleVhcIiksXG4gICAgICBzZWN0aW9uKFwiR2VuZXJhbFwiKSxcbiAgICAgIGtleShcImtleS56b29tSW5cIiwgXCJab29tIEluXCIsIFwiTW91c2VXaGVlbFVwXCIpLFxuICAgICAga2V5KFwia2V5Lnpvb21PdXRcIiwgXCJab29tIE91dFwiLCBcIk1vdXNlV2hlZWxEb3duXCIpLFxuICAgICAga2V5KFwia2V5LnRhZ1wiLCBcIlRhZ1wiLCBcIk1vdXNlTWlkZGxlXCIpLFxuICAgICAgc2VjdGlvbihcIkV4cGxvcmF0aW9uIGFuZCBDb21iYXRcIiksXG4gICAgICBrZXkoXCJrZXkuZm9yd2FyZFwiLCBcIk1vdmUgRm9yd2FyZFwiLCBcIktleVdcIiksXG4gICAgICBrZXkoXCJrZXkuYmFja1wiLCBcIk1vdmUgQmFja3dhcmRcIiwgXCJLZXlTXCIpLFxuICAgICAga2V5KFwia2V5LmxlZnRcIiwgXCJNb3ZlIExlZnRcIiwgXCJLZXlBXCIpLFxuICAgICAga2V5KFwia2V5LnJpZ2h0XCIsIFwiTW92ZSBSaWdodFwiLCBcIktleURcIiksXG4gICAgICBrZXkoXCJrZXkuY3JvdWNoXCIsIFwiQ3JvdWNoXCIsIFwiS2V5Q1wiKSxcbiAgICAgIGtleShcImtleS5pbnRlcmFjdFwiLCBcIkludGVyYWN0XCIsIFwiS2V5RlwiKSxcbiAgICBdLFxuICB9LFxuXTtcblxuLyoqIEVhY2ggcm93J3MgZGVmYXVsdCwgYnkgaWQuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMocm93czogUm93W10pOiBSZWNvcmQ8c3RyaW5nLCBTZXR0aW5nVmFsdWU+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCBTZXR0aW5nVmFsdWU+ID0ge307XG4gIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIGlmIChcImlkXCIgaW4gcm93KSBvdXRbcm93LmlkXSA9IHJvdy5kZWY7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKiBFdmVyeSBzZXR0aW5nJ3MgZGVmYXVsdC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUUyA9IGRlZmF1bHRzKFsuLi5UQUJTLmZsYXRNYXAoKHQpID0+IHQucm93cyksIEdBTU1BXSk7XG4iLCAiLy8gVGhlIHdvcmRtYXJrJ3Mgb3V0bGluZTogYW5ndWxhciBzbGFzaGVkIGNhcGl0YWxzLCBzaGVhcmVkLCB3aXRoIGJsYWRlc1xuLy8gdHJhaWxpbmcgb2ZmIHRoZSBDLCB0aGUgWSBhbmQgdGhlIEssIGFuZCBvbmUgY3V0IHNsaWNlZCB0aHJvdWdoIHRoZSBtaWRkbGVcbi8vIGxldHRlcnMuIEdlbmVyYXRlZCBvbmNlIChhIHBvbHlnb24gcGVyIHN0cm9rZSBhbmQgY291bnRlciwgdGhlIGNvdW50ZXJzXG4vLyB3b3VuZCB0aGUgb3RoZXIgd2F5IHNvIHRoZXkgc3RheSBvcGVuIHVuZGVyIHRoZSBub256ZXJvIGZpbGwgcnVsZSkuXG5leHBvcnQgY29uc3QgV09SRE1BUktfVklFV0JPWCA9IFwiLTE4IC0yNCA2NjggMTcwXCI7XG5leHBvcnQgY29uc3QgV09SRE1BUktfQVNQRUNUID0gNjY4IC8gMTcwO1xuZXhwb3J0IGNvbnN0IFdPUkRNQVJLX1BBVEggPVxuICBcIk01MC4zIC0yLjUgTDkyLjMgLTIuNSBMODguNCA5LjUgTDUwLjQgOS41IEwyNi4xIDg1LjUgTDY0LjEgODUuNSBMNjAuMyA5Ny41IEwxOC4zIDk3LjUgTDEwLjEgODUuNSBMMzQuNCA5LjVaIE0xMDEuOSAtNC41IEwxMTcuOSAtNC41IEwxMjMuMyAyNS41IEwxNDcuOSAtNC41IEwxNjMuOSAtNC41IEwxMjYuMiA0MS41IEwxMDguOSA5NS41IEw5Mi45IDk1LjUgTDExMC4yIDQxLjVaIE0xNzEuOSAtMS41IEwyMTcuOSAtMS41IEwyMjQuNyA4LjUgTDIxNS44IDM2LjUgTDIwNy4yIDQ0LjUgTDIxMi43IDUyLjUgTDIwMS4xIDg4LjUgTDE4Ny45IDk4LjUgTDEzOS45IDk4LjVaIE0xNzUuMSAzOC41IEwxOTcuMSAzOC41IEwyMDIuNCAzNC41IEwyMDkuNSAxMi41IEwyMDguMSAxMC41IEwxODQuMSAxMC41WiBNMTU5LjggODYuNSBMMTgzLjggODYuNSBMMTg4LjQgODQuNSBMMTk3LjQgNTYuNSBMMTk2LjAgNTQuNSBMMTcwLjAgNTQuNVogTTI1NC45IDk0LjAgTDI1My4zIDk5LjAgTDI0Mi40IDk5LjBaIE0yMzkuNiAtMy41IEwyOTEuNiAtMy41IEwyODcuNyA4LjUgTDI1MS43IDguNSBMMjQxLjUgNDAuNSBMMjY5LjUgNDAuNSBMMjY1LjcgNTIuNSBMMjM3LjcgNTIuNSBMMjI3LjQgODQuNSBMMjYzLjQgODQuNSBMMjYyLjAgODguOSBMMjQyLjkgOTYuNSBMMjA3LjYgOTYuNVogTTMyMy41IDY2LjUgTDMyMS40IDEwMi4wIEwzMDUuNCAxMDIuMCBMMzA3LjQgNzMuMCBMMjgzLjYgODIuNSBMMjc3LjQgMTAyLjAgTDI2MS40IDEwMi4wIEwyNjUuMiA4OS45WiBNMjk5LjYgLTAuNSBMMzQ1LjYgLTAuNSBMMzUyLjQgOS41IEwzNDAuOSA0NS41IEwzMzAuMyA1My41IEwzMjkuOCA2MS43IEwzMTMuOCA2OC4xIEwzMTQuNyA1NS41IEwyOTcuNyA1NS41IEwyOTAuNyA3Ny40IEwyNzIuMyA4NC43WiBNMzAxLjUgNDMuNSBMMzIzLjUgNDMuNSBMMzI4LjggMzkuNSBMMzM3LjEgMTMuNSBMMzM1LjggMTEuNSBMMzExLjggMTEuNVogTTQwOC42IDMyLjQgTDQwNC4zIDQ2LjAgTDM5MS4xIDU2LjAgTDM2MS4xIDU2LjAgTDM0Ny42IDk4LjAgTDMzMS42IDk4LjAgTDM0NC40IDU4LjJaIE0zNjkuOSAtNC41IEw0MTUuOSAtNC41IEw0MjIuNyA1LjUgTDQxNS43IDI3LjMgTDM1MS41IDUzLjBaIE0zNzkuNyA0NC4wIEwzODYuOSA0NC4wIEwzOTEuNiA0Mi4wIEwzOTIuNiAzOC45WiBNMzcxLjIgNDEuNSBMMzgwLjIgNDEuNSBMMzk5LjcgMzMuNyBMNDA3LjQgOS41IEw0MDYuMSA3LjUgTDM4Mi4xIDcuNVogTTQzNy4zIDIwLjkgTDQxNS41IDg5LjAgTDQ0MS41IDg5LjAgTDQ2Ny4xIDkuMCBMNDg1LjUgMS42IEw0NTYuOSA5MS4wIEw0NDMuNyAxMDEuMCBMNDA1LjcgMTAxLjAgTDM5OC45IDkxLjAgTDQxOC45IDI4LjNaIE00MzMuOSAtMS41IEw0NDkuOSAtMS41IEw0NDQuNCAxNS44IEw0NzQuMiAzLjkgTDQ3NS45IC0xLjUgTDQ4Ny42IC0xLjUgTDQyNi4wIDIzLjFaIE00OTUuMyAtMS4wIEw1MTEuMyAtMS4wIEw1MTkuNSA2MS4wIEw1MzkuMyAtMS4wIEw1NTUuMyAtMS4wIEw1MjMuMyA5OS4wIEw1MDcuMyA5OS4wIEw0OTkuMiAzNy4wIEw0NzkuMyA5OS4wIEw0NjMuMyA5OS4wWiBNNTYzLjQgMi4wIEw1NzkuNCAyLjAgTDU2Ni42IDQyLjAgTDYwNS40IDIuMCBMNjIzLjQgMi4wIEw1NzguNiA0OC4wIEw1OTMuNCAxMDIuMCBMNTc1LjQgMTAyLjAgTDU2NC4yIDYyLjAgTDU1OC4yIDY4LjAgTDU0Ny40IDEwMi4wIEw1MzEuNCAxMDIuMFogTTM5LjkgOS4zIEwtMTMuNSAxNS41IEwtMTMuNSAxNS41IEw0MC44IC0yLjNaIE0xMDkuNSA5My4xIEw3Ni4yIDE0MS41IEw3Ni4yIDE0MS41IEw5NC44IDg5LjlaIE02MTAuOSAtMC4zIEw2NDYuNCAtMjAuMCBMNjQ2LjQgLTIwLjAgTDYxNi41IDguM1ogTTU5MS4xIDkzLjcgTDYzMS44IDEzOC4wIEw2MzEuOCAxMzguMCBMNTc4LjkgMTA2LjNaIE0yMDYuMyAxMTMuNSBMNjA3LjQgMTA4LjAgTDYwNy40IDEwOC4wIEwxOTguNiAxMTYuNlogTTE1MS42IDExMS44IEwyMDYuNiAxMTEuMCBMMTk4LjggMTE0LjIgTDE1MC42IDExNS4yWiBNMzIyLjkgMTIyLjEgTDUzNC4yIDExOC4wIEw1MzQuMiAxMTguMCBMMzIyLjQgMTIzLjlaXCI7XG4iLCAiaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgdXNlU2V0dGluZ3MgfSBmcm9tIFwiLi4vc2NyZWVucy9zZXR0aW5ncy9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHtcbiAgV09SRE1BUktfQVNQRUNULFxuICBXT1JETUFSS19QQVRILFxuICBXT1JETUFSS19WSUVXQk9YLFxufSBmcm9tIFwiLi93b3JkbWFyay1wYXRoXCI7XG5cbi8qKiBUaGUgdGl0bGU6IENZQkVSUFVOSyBpbiBzbGFzaGVkIGFjaWQteWVsbG93IGNhcGl0YWxzIG92ZXIgdGhlIHllYXIgbGluZSxcbiAqICBicmVha2luZyB1cCBub3cgYW5kIHRoZW4gKGEgYGdsaXRjaGAgZmlsdGVyIGluIGJ1cnN0IG1vZGUg4oCUIHRoZSBzaGFkZXJcbiAqICBkZWNpZGVzIHdoZW4sIFJlYWN0IHJlbmRlcnMgb25jZSkuICovXG5leHBvcnQgZnVuY3Rpb24gV29yZG1hcmsoe1xuICB3aWR0aCxcbiAgZ2xpdGNoOiBjaGFuY2UgPSAwLjEsXG4gIHN0eWxlLFxufToge1xuICB3aWR0aDogbnVtYmVyO1xuICAvKiogQ2hhbmNlIGEgcXVhcnRlciBzZWNvbmQgZ2xpdGNoZXM7IDAgPSBuZXZlci4gKi9cbiAgZ2xpdGNoPzogbnVtYmVyO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbn0pIHtcbiAgLy8gVUkgZ2xpdGNoIGVmZmVjdHMgY2FuIGJlIHN3aXRjaGVkIG9mZiAoSU5URVJGQUNFIHNldHRpbmdzKS5cbiAgY29uc3QgZ2xpdGNoID0gdXNlU2V0dGluZ3MoKS51aUdsaXRjaCA/IGNoYW5jZSA6IDA7XG4gIGNvbnN0IGhlaWdodCA9IHdpZHRoIC8gV09SRE1BUktfQVNQRUNUO1xuICBjb25zdCBkaWdpdCA9IHdpZHRoICogMC4wNTI7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodCArIGRpZ2l0ICogMC42LFxuICAgICAgICBmaWx0ZXI6XG4gICAgICAgICAgZ2xpdGNoID4gMFxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJnbGl0Y2hcIixcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHsgaW50ZW5zaXR5OiAwLjksIGZyZXF1ZW5jeTogZ2xpdGNoLCBzZWVkOiA3IH0sXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAuLi5zdHlsZSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHN2ZyB2aWV3Qm94PXtXT1JETUFSS19WSUVXQk9YfSBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0IH19PlxuICAgICAgICA8cGF0aCBkPXtXT1JETUFSS19QQVRIfSBmaWxsPXtDLnllbGxvd30gLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPFllYXJcbiAgICAgICAgc2l6ZT17ZGlnaXR9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogd2lkdGggKiAwLjQ3LFxuICAgICAgICAgIHRvcDogaGVpZ2h0ICogMC43OCxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHllYXIgbGluZSB1bmRlciB0aGUgd29yZG1hcms6IHNwYWNlZCBkaWdpdHMgc3RydW5nIG9uIGEgd2lyZS4gKi9cbmZ1bmN0aW9uIFllYXIoeyBzaXplLCBzdHlsZSB9OiB7IHNpemU6IG51bWJlcjsgc3R5bGU6IEJldnlTdHlsZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLFxuICAgICAgICBnYXA6IHNpemUgKiAwLjM1LFxuICAgICAgICAuLi5zdHlsZSxcbiAgICAgIH19XG4gICAgPlxuICAgICAge1tcIjJcIiwgXCIwXCIsIFwiOVwiLCBcIjFcIl0ubWFwKChkLCBpKSA9PiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAga2V5PXtkICsgaX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLFxuICAgICAgICAgICAgZ2FwOiBzaXplICogMC4zNSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiBzaXplLFxuICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuRGltLFxuICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtkfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICB7aSA8IDMgJiYgKFxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogc2l6ZSAqIDEuMSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEuNSxcbiAgICAgICAgICAgICAgICBtYXJnaW46IHsgYm90dG9tOiBzaXplICogMC4yMiB9LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jeWFuRGltLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L25vZGU+XG4gICAgICApKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBMaWZlcGF0aCB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQyB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuXG4vLyBUaGUgZGF0YXNoYXJkLCBkcmF3biBpbiBpc29tZXRyaWM6IGEgc2xhYiB3aG9zZSBsZW5ndGggcnVucyBkb3duLXJpZ2h0XG4vLyBhbmQgd2hvc2Ugd2lkdGggcnVucyB1cC1yaWdodCAoMzDCsCksIHNlZW4gZnJvbSBhYm92ZSBpdHMgbmVhciBsb25nIHNpZGUuXG5jb25zdCBMID0gOTI7XG5jb25zdCBXID0gMzQ7XG5jb25zdCBUID0gNztcbi8qKiBBIHBvaW50IG9uIHRoZSBzbGFiOiBgdWAgYWxvbmcgaXRzIGxlbmd0aCwgYHZgIGFjcm9zcyBpdCAoYm90aCAwLi4xKSxcbiAqICBgemAgcHggZG93biBpdHMgdGhpY2tuZXNzLiAqL1xuY29uc3QgYXQgPSAodTogbnVtYmVyLCB2OiBudW1iZXIsIHogPSAwKSA9PiBbXG4gIDggKyAwLjg2NiAqICh1ICogTCArIHYgKiBXKSxcbiAgMzEgKyAwLjUgKiAodSAqIEwgLSB2ICogVykgKyB6LFxuXTtcbi8qKiBBIHBhdGNoIG9mIHRoZSB0b3AgZmFjZS4gKi9cbmNvbnN0IHBhdGNoID0gKHUwOiBudW1iZXIsIHUxOiBudW1iZXIsIHYwOiBudW1iZXIsIHYxOiBudW1iZXIpID0+IFtcbiAgLi4uYXQodTAsIHYwKSxcbiAgLi4uYXQodTEsIHYwKSxcbiAgLi4uYXQodTEsIHYxKSxcbiAgLi4uYXQodTAsIHYxKSxcbl07XG4vKiogVGhlIGZhY2UgaGFuZ2luZyB1bmRlciB0aGUgdG9wIGVkZ2UgZnJvbSBgKHUwLCB2MClgIHRvIGAodTEsIHYxKWAuICovXG5jb25zdCBzaWRlID0gKHUwOiBudW1iZXIsIHYwOiBudW1iZXIsIHUxOiBudW1iZXIsIHYxOiBudW1iZXIpID0+IFtcbiAgLi4uYXQodTAsIHYwKSxcbiAgLi4uYXQodTEsIHYxKSxcbiAgLi4uYXQodTEsIHYxLCBUKSxcbiAgLi4uYXQodTAsIHYwLCBUKSxcbl07XG5cbmNvbnN0IElOSyA9IFwiIzRhMGYxMlwiO1xuXG4vKiogQSByZWQgZGF0YXNoYXJkLCB0aGUgc2F2ZSBnYW1lJ3Mgb3duIGljb24uICovXG5leHBvcnQgZnVuY3Rpb24gRGF0YXNoYXJkKHsgd2lkdGggPSAxMTggfTogeyB3aWR0aD86IG51bWJlciB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDEyNiA5MFwiIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQ6ICh3aWR0aCAqIDkwKSAvIDEyNiB9fT5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17c2lkZSgwLCAwLCAxLCAwKX0gZmlsbD1cIiNhODMwMmJcIiAvPlxuICAgICAgPHBvbHlnb24gcG9pbnRzPXtzaWRlKDEsIDAsIDEsIDEpfSBmaWxsPVwiI2QzNDYzY1wiIC8+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e3BhdGNoKDAsIDEsIDAsIDEpfSBmaWxsPVwiI2ZmNjQ1N1wiIC8+XG4gICAgICB7LyogVGhlIGNvbnRhY3RzLCB0aGUgbGFiZWwgc3RyaXAsIHRoZSBwcmludGVkIGxpbmVzLiAqL31cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17cGF0Y2goMC4wMywgMC4xMiwgMC4xMiwgMC40Mil9IGZpbGw9e0lOS30gLz5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17cGF0Y2goMC4wNSwgMC4xLCAwLjU1LCAwLjg4KX0gZmlsbD17SU5LfSBvcGFjaXR5PXswLjd9IC8+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e3BhdGNoKDAuMzYsIDAuOTYsIDAuMSwgMC4zNil9IGZpbGw9e0lOS30gLz5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17cGF0Y2goMC4xNywgMC42NiwgMC44LCAwLjg1KX0gZmlsbD17SU5LfSBvcGFjaXR5PXswLjh9IC8+XG4gICAgICA8cG9seWdvblxuICAgICAgICBwb2ludHM9e3BhdGNoKDAuMTcsIDAuNTIsIDAuNjgsIDAuNzIpfVxuICAgICAgICBmaWxsPXtJTkt9XG4gICAgICAgIG9wYWNpdHk9ezAuNn1cbiAgICAgIC8+XG4gICAgICA8cG9seWdvblxuICAgICAgICBwb2ludHM9e3BhdGNoKDAuMTcsIDAuMywgMC40OCwgMC41OCl9XG4gICAgICAgIGZpbGw9e0lOS31cbiAgICAgICAgb3BhY2l0eT17MC41NX1cbiAgICAgIC8+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e3BhdGNoKDAuODgsIDAuOSwgMCwgMSl9IGZpbGw9XCIjYjgzNjJmXCIgLz5cbiAgICAgIDxwb2x5bGluZVxuICAgICAgICBwb2ludHM9e1suLi5hdCgwLCAxKSwgLi4uYXQoMSwgMSksIC4uLmF0KDEsIDApXX1cbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9XCIjZmY5YThmXCJcbiAgICAgICAgc3Ryb2tlV2lkdGg9ezAuOH1cbiAgICAgIC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBUaGUgbGlmZXBhdGhzJyBiYWRnZXM6IGEgcmVkIGRpc2Mgd2l0aCBhIGRhcmsgZ2x5cGgg4oCUIGEgcm9hZCBmb3IgdGhlXG4gKiAgTm9tYWQsIGEgdGFnIGZvciB0aGUgU3RyZWV0a2lkLCBhIGdsb2JlIGZvciB0aGUgQ29ycG8uICovXG5leHBvcnQgZnVuY3Rpb24gTGlmZXBhdGhJY29uKHtcbiAgbGlmZXBhdGgsXG4gIHNpemUgPSAyMCxcbn06IHtcbiAgbGlmZXBhdGg6IExpZmVwYXRoO1xuICBzaXplPzogbnVtYmVyO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAyMCAyMFwiIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUgfX0+XG4gICAgICA8Y2lyY2xlIGN4PXsxMH0gY3k9ezEwfSByPXs5LjV9IGZpbGw9e0MucmVkfSAvPlxuICAgICAge2xpZmVwYXRoID09PSBcIm5vbWFkXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1s4LjYsIDQuNSwgMTEuNCwgNC41LCAxNiwgMTUuNSwgNCwgMTUuNV19XG4gICAgICAgICAgICBmaWxsPXtJTkt9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIHBvaW50cz17WzEwLCA2LjUsIDEwLCA4LjVdfVxuICAgICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjJ9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIHBvaW50cz17WzEwLCAxMC41LCAxMCwgMTMuNV19XG4gICAgICAgICAgICBzdHJva2U9e0MucmVkfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNH1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7bGlmZXBhdGggPT09IFwic3RyZWV0a2lkXCIgJiYgKFxuICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICBwb2ludHM9e1s0LjUsIDEzLCA4LCA2LCAxMCwgMTEsIDEyLjUsIDUuNSwgMTUuNSwgMTIuNV19XG4gICAgICAgICAgc3Ryb2tlPXtJTkt9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezIuMn1cbiAgICAgICAgICBzdHJva2VMaW5lam9pbj1cIm1pdGVyXCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge2xpZmVwYXRoID09PSBcImNvcnBvXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgIGN4PXsxMH1cbiAgICAgICAgICAgIGN5PXsxMH1cbiAgICAgICAgICAgIHI9ezUuNn1cbiAgICAgICAgICAgIHN0cm9rZT17SU5LfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxlbGxpcHNlXG4gICAgICAgICAgICBjeD17MTB9XG4gICAgICAgICAgICBjeT17MTB9XG4gICAgICAgICAgICByeD17Mi4zfVxuICAgICAgICAgICAgcnk9ezUuNn1cbiAgICAgICAgICAgIHN0cm9rZT17SU5LfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuMn1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAgcG9pbnRzPXtbNC40LCAxMCwgMTUuNiwgMTBdfVxuICAgICAgICAgICAgc3Ryb2tlPXtJTkt9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS4yfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L3N2Zz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VTaGFyZWRWYWx1ZSwgd2l0aFNlcXVlbmNlLCB3aXRoVGltaW5nIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHVzZUtleXMgfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IG1vZGFsT3BlbiB9IGZyb20gXCIuL0RpYWxvZ1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uL3NvdW5kXCI7XG5pbXBvcnQgeyB1c2VTZXR0aW5ncyB9IGZyb20gXCIuL3NldHRpbmdzL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBTQ0FOTElORVMsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IERhdGFOb2lzZSwgUnVsZSB9IGZyb20gXCIuLi91aS9kZWNvclwiO1xuaW1wb3J0IHsgUHJvdG9jb2xHbHlwaCwgV2FybmluZ0ljb24gfSBmcm9tIFwiLi4vdWkvaWNvbnNcIjtcbmltcG9ydCB7IEZJTEwsIEhpbnQsIEhpbnRzLCBLZXljYXAgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBXb3JkbWFyayB9IGZyb20gXCIuLi91aS9Xb3JkbWFya1wiO1xuXG5leHBvcnQgdHlwZSBNZW51RW50cnkgPSB7IGlkOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfTtcblxuLyoqIFRoZSBtYWluIG1lbnUg4oCUIGFuZCwgaW4gZ2FtZSwgdGhlIHBhdXNlIG1lbnU6IHRoZSB3b3JkbWFyayBhbmQgYSBjb2x1bW5cbiAqICBvZiBpdGVtcyBvbiBhIHRyYW5zbHVjZW50IHJlZCBiYW5kIG92ZXIgdGhlIGRhdGFzY2FwZS4gSG92ZXIgb3IgdGhlXG4gKiAgYXJyb3cga2V5cyBzZWxlY3Q7IGNsaWNrIG9yIEVudGVyIHBpY2tzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1haW5NZW51KHtcbiAgZW50cmllcyxcbiAgb25QaWNrLFxuICBvbkJhY2ssXG4gIHZlcnNpb24sXG59OiB7XG4gIGVudHJpZXM6IE1lbnVFbnRyeVtdO1xuICBvblBpY2s6IChpZDogc3RyaW5nKSA9PiB2b2lkO1xuICAvKiogRXNjICh0aGUgcGF1c2UgbWVudSByZXN1bWVzKS4gKi9cbiAgb25CYWNrPzogKCkgPT4gdm9pZDtcbiAgdmVyc2lvbjogc3RyaW5nO1xufSkge1xuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBzZWxlY3QgPSAoaTogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGkgPT09IHNlbGVjdGVkKSByZXR1cm47XG4gICAgc2Z4KFwiaG92ZXJcIik7XG4gICAgc2V0U2VsZWN0ZWQoaSk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICAvLyBBIGRpYWxvZyBvdmVyIHRoZSBtZW51IHRha2VzIHRoZSBrZXlzLlxuICAgIGlmIChtb2RhbE9wZW4oKSkgcmV0dXJuO1xuICAgIGlmIChlLmtleSA9PT0gXCJBcnJvd0Rvd25cIikgc2VsZWN0KChzZWxlY3RlZCArIDEpICUgZW50cmllcy5sZW5ndGgpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkFycm93VXBcIilcbiAgICAgIHNlbGVjdCgoc2VsZWN0ZWQgKyBlbnRyaWVzLmxlbmd0aCAtIDEpICUgZW50cmllcy5sZW5ndGgpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIG9uUGljayhlbnRyaWVzW3NlbGVjdGVkXS5pZCk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIgJiYgb25CYWNrKSB7XG4gICAgICBzZngoXCJiYWNrXCIpO1xuICAgICAgb25CYWNrKCk7XG4gICAgfVxuICB9LCB0cnVlKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtGSUxMfT5cbiAgICAgIDxCYW5kIC8+XG4gICAgICA8RGF0YU5vaXNlXG4gICAgICAgIHNlZWQ9ezExfVxuICAgICAgICBsaW5lcz17M31cbiAgICAgICAgZ3JvdXBzPXszfVxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgbGVmdDogMTUyLCB0b3A6IDQ0IH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxNTYsXG4gICAgICAgICAgdG9wOiA3MixcbiAgICAgICAgICB3aWR0aDogMTEyLFxuICAgICAgICAgIGhlaWdodDogMjIsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDYgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgY29sb3I6IEMucmVkRGltIH19PjREMEI5NSA3MjEwIDAwPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPFdvcmRtYXJrXG4gICAgICAgIHdpZHRoPXs1MjB9XG4gICAgICAgIHN0eWxlPXt7IHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLCBsZWZ0OiA5NiwgdG9wOiAyMzggfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDE3OCxcbiAgICAgICAgICB0b3A6IDQzOCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGdhcDogNCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2VudHJpZXMubWFwKChlbnRyeSwgaSkgPT4gKFxuICAgICAgICAgIDxNZW51SXRlbVxuICAgICAgICAgICAga2V5PXtlbnRyeS5pZH1cbiAgICAgICAgICAgIGxhYmVsPXtlbnRyeS5sYWJlbH1cbiAgICAgICAgICAgIHNlbGVjdGVkPXtpID09PSBzZWxlY3RlZH1cbiAgICAgICAgICAgIG9uU2VsZWN0PXsoKSA9PiBzZWxlY3QoaSl9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBpY2soZW50cnkuaWQpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPFJ1bGVcbiAgICAgICAgd2lkdGg9ezQ0MH1cbiAgICAgICAgbGFiZWw9XCJEUk5fVENMQVNfODAwMDk1XCJcbiAgICAgICAgY29sb3I9e0MucmVkRGltfVxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgbGVmdDogMTUwLCB0b3A6IDg3MCB9fVxuICAgICAgLz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMTUyLFxuICAgICAgICAgIHRvcDogODk2LFxuICAgICAgICAgIGZvbnRTaXplOiAyNCxcbiAgICAgICAgICBjb2xvcjogQy5yZWREaW0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHt2ZXJzaW9ufVxuICAgICAgPC90ZXh0PlxuICAgICAgPERhdGFOb2lzZVxuICAgICAgICBzZWVkPXs1fVxuICAgICAgICBsaW5lcz17M31cbiAgICAgICAgZ3JvdXBzPXs1fVxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgbGVmdDogMTUwLCB0b3A6IDk5NiB9fVxuICAgICAgLz5cbiAgICAgIDxUb3BSaWdodCAvPlxuICAgICAgeyFvbkJhY2sgJiYgPE1lc3NhZ2VzIC8+fVxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNlbGVjdFwiIC8+XG4gICAgICAgIHtvbkJhY2sgJiYgPEhpbnQgaz1cIkVTQ1wiIGxhYmVsPVwiQ2xvc2VcIiBvbkNsaWNrPXtvbkJhY2t9IC8+fVxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgdHJhbnNsdWNlbnQgcmVkIGJhbmQgdGhlIG1lbnUgaGFuZ3Mgb24sIHNjYW5saW5lZC4gKi9cbmZ1bmN0aW9uIEJhbmQoKSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAxMzQsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICB3aWR0aDogNDY2LFxuICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgIGFuZ2xlOiAxODAsXG4gICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSg4NCwgMjQsIDMyLCAwLjQpXCIgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSg2NCwgMTgsIDI2LCAwLjMyKVwiLCBwb3NpdGlvbjogXCI1NSVcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDcwLCAyMCwgMjgsIDAuNClcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIGJhY2tncm91bmRJbWFnZTogU0NBTkxJTkVTLFxuICAgICAgICBib3JkZXI6IHsgbGVmdDogMSwgcmlnaHQ6IDIgfSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4yMilcIixcbiAgICAgIH19XG4gICAgLz5cbiAgKTtcbn1cblxuLyoqIE9uZSBtZW51IGl0ZW0uIFNlbGVjdGVkLCBpdCBnZXRzIHRoZSBjeWFuIGN1dC1jb3JuZXIgZnJhbWUsIHRoZSBwcm90b2NvbFxuICogIG1hcmssIGFuZCBhIGJ1cnN0IG9mIGdsaXRjaCAoYSBmaWx0ZXIgcGFyYW0gYW5pbWF0ZWQgMSDihpIgMCBieSBCZXZ5KS4gKi9cbmZ1bmN0aW9uIE1lbnVJdGVtKHtcbiAgbGFiZWwsXG4gIHNlbGVjdGVkLFxuICBvblNlbGVjdCxcbiAgb25DbGljayxcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gIG9uU2VsZWN0OiAoKSA9PiB2b2lkO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBnbGl0Y2hlcyA9ICEhdXNlU2V0dGluZ3MoKS51aUdsaXRjaDtcbiAgY29uc3QgYnVyc3QgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWQpXG4gICAgICBidXJzdC52YWx1ZSA9IHdpdGhTZXF1ZW5jZShcbiAgICAgICAgd2l0aFRpbWluZygxLCB7IGR1cmF0aW9uOiAwIH0pLFxuICAgICAgICB3aXRoVGltaW5nKDAsIHsgZHVyYXRpb246IDM0MCwgZWFzaW5nOiBcImVhc2VPdXRcIiB9KSxcbiAgICAgICk7XG4gIH0sIFtzZWxlY3RlZCwgYnVyc3RdKTtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgb25Qb2ludGVyRW50ZXI9e29uU2VsZWN0fVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IDM1NixcbiAgICAgICAgaGVpZ2h0OiA1MixcbiAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxNCwgcmlnaHQ6IDEyIH0sXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICAgICAgICAuLi4oc2VsZWN0ZWRcbiAgICAgICAgICA/IGNoYW1mZXIoXCJyZ2JhKDYsIDgsIDE2LCAwLjUpXCIsIDIwLCBDLmN5YW5IaSwgMilcbiAgICAgICAgICA6IHsgYm9yZGVyOiAyLCBib3JkZXJDb2xvcjogQy5jbGVhciB9KSxcbiAgICAgICAgZmlsdGVyOlxuICAgICAgICAgIHNlbGVjdGVkICYmIGdsaXRjaGVzXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcImdsaXRjaFwiLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgaW50ZW5zaXR5OiB7IGFuaW1hdGVkOiBidXJzdCwgc2VlZDogMSB9LFxuICAgICAgICAgICAgICAgICAgc3BsaXQ6IDMsXG4gICAgICAgICAgICAgICAgICB0ZWFyOiAxMixcbiAgICAgICAgICAgICAgICAgIHNlZWQ6IDMsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWVudSwgY29sb3I6IHNlbGVjdGVkID8gQy5jeWFuIDogQy5yZWQgfX0+XG4gICAgICAgIHtsYWJlbH1cbiAgICAgIDwvdGV4dD5cbiAgICAgIHtzZWxlY3RlZCAmJiA8UHJvdG9jb2xHbHlwaCAvPn1cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIFNtYWxsIHByaW50IGFjcm9zcyB0aGUgdG9wIHJpZ2h0OiBhIGRhdGFiYXNlIGJhbm5lciBhbmQgYSB3YXJuaW5nLiAqL1xuZnVuY3Rpb24gVG9wUmlnaHQoKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxMDY2LFxuICAgICAgICAgIHRvcDogNTIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtcbiAgICAgICAgICBcIlNBQkxFIENJVFkgQ09SUCBSRUNPUkQgREFUQUJBU0UgIC8vICAwMDQ0NzI5LTAzNDAgIDAwMDFBRjA5ICAvLyAgNkI3M1xcblReNzIzNC0wMDkxICAwMDIwNDM0OTgyICAvLyAgMDAzNC0yMzA0LVQwNDJCNTcgICM5MjVcIlxuICAgICAgICB9XG4gICAgICA8L3RleHQ+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDE0NDAsXG4gICAgICAgICAgdG9wOiAzNixcbiAgICAgICAgICB3aWR0aDogNDAwLFxuICAgICAgICAgIGhlaWdodDogMzQsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDEwIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxXYXJuaW5nSWNvbiBzaXplPXsxNH0gY29sb3I9e0MucmVkRGltfSAvPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogOCwgY29sb3I6IEMucmVkRGltIH19PlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwiVGFtcGVyaW5nIHdpdGggdGhpcyB0ZXJtaW5hbCBpcyBhIGZlbG9ueSB1bmRlciBTYWJsZSBDaXR5IENvZGUgNDQuMi5cXG5BbGwgc2Vzc2lvbnMgYXJlIGxvZ2dlZCBhbmQgbWF5IGJlIHJldmlld2VkIGJ5IEdyaWR3YXRjaC5cIlxuICAgICAgICAgIH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvPlxuICApO1xufVxuXG4vKiogVGhlIGJveCBib3R0b20gcmlnaHQ6IHVucmVhZCBtZXNzYWdlcy4gKi9cbmZ1bmN0aW9uIE1lc3NhZ2VzKCkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgcmlnaHQ6IDgwLFxuICAgICAgICBib3R0b206IDExOCxcbiAgICAgICAgd2lkdGg6IDUxNixcbiAgICAgICAgaGVpZ2h0OiA0NCxcbiAgICAgICAgLi4uY2hhbWZlcihcInJnYmEoMjAsIDgsIDEyLCAwLjYpXCIsIDEwLCBDLnJlZERpbSwgMSksXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMTIsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogOCB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8S2V5Y2FwIGs9XCIzXCIgLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyNCwgY29sb3I6IEMucmVkIH19Pk1lc3NhZ2VzPC90ZXh0PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEgfX0gLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA4IH19PntcIlNZU1RFTSBJTlBVVCAxMlwifTwvdGV4dD5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMyB9fT5cbiAgICAgICAge1swLCAxLCAyXS5tYXAoKGkpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IDUsIGhlaWdodDogMTgsIGJhY2tncm91bmRDb2xvcjogQy5yZWQgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZURlYnVnIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB0eXBlIHsgQ2hhcmFjdGVyIH0gZnJvbSBcIi4uLy4uL3N0b3JlXCI7XG5pbXBvcnQgeyBFZGdlUmFpbHMgfSBmcm9tIFwiLi4vLi4vdWkvZGVjb3JcIjtcbmltcG9ydCB7IEZJTEwgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBBcHBlYXJhbmNlIH0gZnJvbSBcIi4vQXBwZWFyYW5jZVwiO1xuaW1wb3J0IHsgQXR0cmlidXRlcyB9IGZyb20gXCIuL0F0dHJpYnV0ZXNcIjtcbmltcG9ydCB7IEJvZHlUeXBlIH0gZnJvbSBcIi4vQm9keVR5cGVcIjtcbmltcG9ydCB7IERpZmZpY3VsdHkgfSBmcm9tIFwiLi9EaWZmaWN1bHR5XCI7XG5pbXBvcnQgeyBMaWZlcGF0aCB9IGZyb20gXCIuL0xpZmVwYXRoXCI7XG5pbXBvcnQgeyBTdW1tYXJ5IH0gZnJvbSBcIi4vU3VtbWFyeVwiO1xuXG4vKiogV2hhdCBldmVyeSBzdGVwIGdldHM6IHRoZSBjaGFyYWN0ZXIsIGFuZCB0aGUgd2F5IG91dCBlaXRoZXIgc2lkZS4gKi9cbmV4cG9ydCB0eXBlIFN0ZXBQcm9wcyA9IHtcbiAgY2hhcmFjdGVyOiBDaGFyYWN0ZXI7XG4gIG9uQ2hhbmdlOiAoY2hhcmFjdGVyOiBDaGFyYWN0ZXIpID0+IHZvaWQ7XG4gIG5leHQ6ICgpID0+IHZvaWQ7XG4gIGJhY2s6ICgpID0+IHZvaWQ7XG59O1xuXG5jb25zdCBTVEVQUyA9IFtcbiAgXCJkaWZmaWN1bHR5XCIsXG4gIFwibGlmZXBhdGhcIixcbiAgXCJib2R5XCIsXG4gIFwiYXBwZWFyYW5jZVwiLFxuICBcImF0dHJpYnV0ZXNcIixcbiAgXCJzdW1tYXJ5XCIsXG5dO1xuXG4vKiogVGhlIHNpeCBzdGVwcyBvZiBhIG5ldyBnYW1lOiBkaWZmaWN1bHR5LCBsaWZlcGF0aCwgYm9keSB0eXBlLFxuICogIGFwcGVhcmFuY2UsIGF0dHJpYnV0ZXMsIHN1bW1hcnkuIEVzYyBzdGVwcyBiYWNrIChvdXQgb2YgdGhlIGZpcnN0IHN0ZXA6XG4gKiAgYG9uQmFja2ApOyB0aGUgc3VtbWFyeSdzIHN0YXJ0IGNhbGxzIGBvblN0YXJ0YC4gRWFjaCBzdGVwIGNoYW5nZSBnbGl0Y2hlc1xuICogIHRocm91Z2ggdGhlIHNhbWUgbW9ycGggYXMgdGhlIHNjcmVlbnMuICovXG5leHBvcnQgZnVuY3Rpb24gTmV3R2FtZSh7XG4gIGNoYXJhY3RlcixcbiAgb25DaGFuZ2UsXG4gIG9uQmFjayxcbiAgb25TdGFydCxcbn06IHtcbiAgY2hhcmFjdGVyOiBDaGFyYWN0ZXI7XG4gIG9uQ2hhbmdlOiAoY2hhcmFjdGVyOiBDaGFyYWN0ZXIpID0+IHZvaWQ7XG4gIG9uQmFjazogKCkgPT4gdm9pZDtcbiAgb25TdGFydDogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgW3N0ZXAsIHNldFN0ZXBdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IHByb3BzOiBTdGVwUHJvcHMgPSB7XG4gICAgY2hhcmFjdGVyLFxuICAgIG9uQ2hhbmdlLFxuICAgIG5leHQ6ICgpID0+IHtcbiAgICAgIHNmeChcImNsaWNrXCIpO1xuICAgICAgc2V0U3RlcChNYXRoLm1pbihzdGVwICsgMSwgU1RFUFMubGVuZ3RoIC0gMSkpO1xuICAgIH0sXG4gICAgYmFjazogKCkgPT4ge1xuICAgICAgc2Z4KFwiYmFja1wiKTtcbiAgICAgIGlmIChzdGVwID09PSAwKSBvbkJhY2soKTtcbiAgICAgIGVsc2Ugc2V0U3RlcChzdGVwIC0gMSk7XG4gICAgfSxcbiAgfTtcbiAgLy8gYC0tc2hvb3Qg4oCmIC0tZG8gXCI8c2Vjcz4gc3RlcCBhdHRyaWJ1dGVzXCJgOiBqdW1wIHRvIGEgc3RlcC5cbiAgdXNlRGVidWcoXCJzdGVwXCIsIChzKSA9PiBzZXRTdGVwKE1hdGgubWF4KDAsIFNURVBTLmluZGV4T2YocykpKSk7XG4gIC8vIGBoYW5kbGUgVkVHQWA6IHJlbmFtZSB0aGUgY2hhcmFjdGVyLlxuICB1c2VEZWJ1ZyhcImhhbmRsZVwiLCAoaCkgPT4gb25DaGFuZ2UoeyAuLi5jaGFyYWN0ZXIsIGhhbmRsZTogaCB9KSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLkZJTEwsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSg1NCwgMTcsIDIzLCAwLjkzKVwiIH0sXG4gICAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSgyMiwgMTMsIDIwLCAwLjkyKVwiLCBwb3NpdGlvbjogXCI0NSVcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoNSwgMTEsIDE2LCAwLjk1KVwiIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPEVkZ2VSYWlscyAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5GSUxMLFxuICAgICAgICAgIG1vcnBoRmlsdGVyOiB7IGtleTogc3RlcCwgbmFtZTogXCJnbGl0Y2hTd2FwXCIgfSxcbiAgICAgICAgICB0cmFuc2l0aW9uOiB7IG1vcnBoRmlsdGVyOiB7IGR1cmF0aW9uOiAzNjAsIGVhc2luZzogXCJsaW5lYXJcIiB9IH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtzdGVwID09PSAwICYmIDxEaWZmaWN1bHR5IHsuLi5wcm9wc30gLz59XG4gICAgICAgIHtzdGVwID09PSAxICYmIDxMaWZlcGF0aCB7Li4ucHJvcHN9IC8+fVxuICAgICAgICB7c3RlcCA9PT0gMiAmJiA8Qm9keVR5cGUgey4uLnByb3BzfSAvPn1cbiAgICAgICAge3N0ZXAgPT09IDMgJiYgPEFwcGVhcmFuY2Ugey4uLnByb3BzfSAvPn1cbiAgICAgICAge3N0ZXAgPT09IDQgJiYgPEF0dHJpYnV0ZXMgey4uLnByb3BzfSAvPn1cbiAgICAgICAge3N0ZXAgPT09IDUgJiYgPFN1bW1hcnkgey4uLnByb3BzfSBvblN0YXJ0PXtvblN0YXJ0fSAvPn1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUsIHR5cGUgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VEZWJ1ZywgdXNlS2V5cyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJhY3RlciB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiwgVCwgY2hhbWZlciB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgQXJyb3csIFdhcm5pbmdJY29uIH0gZnJvbSBcIi4uLy4uL3VpL2ljb25zXCI7XG5pbXBvcnQgeyBGSUxMLCBIZWFkZXIsIEhpbnQsIEhpbnRzIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgTE9PS19PUFRJT05TLCBQUkVTRVRTLCBWT0lDRSwgaGFuZGxlT2YsIGxvb2ssIHR3byB9IGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCB7IElkQ2FyZCB9IGZyb20gXCIuL0lkQ2FyZFwiO1xuaW1wb3J0IHsgR3JpZEljb24sIFN0ZXBJY29uLCBXaGVlbEljb24gfSBmcm9tIFwiLi9nbHlwaHNcIjtcbmltcG9ydCB7IENocm9tZSwgSWNvbkhpbnQsIE5hdkJ1dHRvbnMgfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IHsgUG9ydHJhaXQgfSBmcm9tIFwiLi9Qb3J0cmFpdFwiO1xuaW1wb3J0IHsgU3dhdGNoZXMgfSBmcm9tIFwiLi9Td2F0Y2hlc1wiO1xuaW1wb3J0IHR5cGUgeyBTdGVwUHJvcHMgfSBmcm9tIFwiLi9OZXdHYW1lXCI7XG5cbmNvbnN0IFBMQVRFID0gXCIjMWMwYTBlXCI7XG5jb25zdCBTVEVQID0gXCIjMmEwOTBjXCI7XG5jb25zdCBFREdFID0gXCIjNWExYzFmXCI7XG5cbi8qKiBBUFBFQVJBTkNFOiBwcmVzZXRzIGRvd24gdGhlIGxlZnQsIHRoZSBsaXZlIElEIGNhcmQgaW4gdGhlIG1pZGRsZSwgYW5kXG4gKiAgdGhlIG9wdGlvbiBsaXN0IG9uIHRoZSByaWdodCwgZWFjaCByb3cgYSB2YWx1ZSBhbmQgaXRzIOKXgSDilrcgc3RlcHBlclxuICogIChjb2xvciByb3dzIG9wZW4gYSBzd2F0Y2ggZ3JpZCkuICovXG5leHBvcnQgZnVuY3Rpb24gQXBwZWFyYW5jZSh7IGNoYXJhY3Rlciwgb25DaGFuZ2UsIG5leHQsIGJhY2sgfTogU3RlcFByb3BzKSB7XG4gIGNvbnN0IFtncmlkLCBzZXRHcmlkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbZWRpdGluZywgc2V0RWRpdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzY3JvbGwsIHNldFNjcm9sbF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3Qgc2V0TG9vayA9IChpZDogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSA9PlxuICAgIG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCBsb29rOiB7IC4uLmNoYXJhY3Rlci5sb29rLCBbaWRdOiB2YWx1ZSB9IH0pO1xuICBjb25zdCBzdGVwID0gKGlkOiBzdHJpbmcsIGNvdW50OiBudW1iZXIsIGJ5OiBudW1iZXIpID0+IHtcbiAgICBzZngoXCJ0YWJcIik7XG4gICAgc2V0TG9vayhpZCwgKGxvb2soY2hhcmFjdGVyLCBpZCkgKyBieSArIGNvdW50KSAlIGNvdW50KTtcbiAgfTtcbiAgY29uc3Qgb3B0aW9uID0gTE9PS19PUFRJT05TLmZpbmQoKG8pID0+IG8uaWQgPT09IGdyaWQpO1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKGVkaXRpbmcpIHJldHVybjtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgIGlmIChncmlkKSB7XG4gICAgICAgIHNmeChcImJhY2tcIik7XG4gICAgICAgIHNldEdyaWQobnVsbCk7XG4gICAgICB9IGVsc2UgYmFjaygpO1xuICAgIH0gZWxzZSBpZiAoZS5jb2RlID09PSBcIktleUZcIiAmJiAhZ3JpZCkgbmV4dCgpO1xuICB9KTtcbiAgLy8gYHN3YXRjaCA8b3B0aW9uPmAgb3BlbnMgYSBncmlkLCBgbG9vayA8b3B0aW9uPiA8bj5gIHNldHMgYSB2YWx1ZSxcbiAgLy8gYHNjcm9sbCA8cHg+YCBzY3JvbGxzIHRoZSBsaXN0LlxuICB1c2VEZWJ1ZyhcInN3YXRjaFwiLCAoaWQpID0+IHNldEdyaWQoaWQgfHwgbnVsbCkpO1xuICB1c2VEZWJ1ZyhcImxvb2tcIiwgKGFyZykgPT4ge1xuICAgIGNvbnN0IFtpZCwgbl0gPSBhcmcuc3BsaXQoXCIgXCIpO1xuICAgIHNldExvb2soaWQsIE51bWJlcihuKSk7XG4gIH0pO1xuICB1c2VEZWJ1ZyhcInNjcm9sbFwiLCAocHgpID0+IHNldFNjcm9sbChOdW1iZXIocHgpKSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8Q2hyb21lIC8+XG4gICAgICA8SGVhZGVyXG4gICAgICAgIHRpdGxlPVwiQVBQRUFSQU5DRVwiXG4gICAgICAgIGNhcHRpb249XCJJTiBTQUJMRSBDSVRZLCBFVkVSWSBDQU1FUkEgS05PV1MgWU9VUiBGQUNFLiBNQUtFIElUIE9ORSBXT1JUSCBGSUxJTkcuXCJcbiAgICAgICAgaWNvbj17PFN0ZXBJY29uIGtpbmQ9XCJhcHBlYXJhbmNlXCIgLz59XG4gICAgICAgIHN0ZXA9ezJ9XG4gICAgICAvPlxuICAgICAgPFByZXNldHMgY2hhcmFjdGVyPXtjaGFyYWN0ZXJ9IG9uQ2hhbmdlPXtvbkNoYW5nZX0gLz5cbiAgICAgIDxJZENhcmRcbiAgICAgICAgY2hhcmFjdGVyPXtjaGFyYWN0ZXJ9XG4gICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgb25FZGl0aW5nPXtzZXRFZGl0aW5nfVxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgbGVmdDogNTYwLCB0b3A6IDE5NiB9fVxuICAgICAgLz5cbiAgICAgIHtvcHRpb24gJiYgKFxuICAgICAgICA8U3dhdGNoZXNcbiAgICAgICAgICBvcHRpb249e29wdGlvbn1cbiAgICAgICAgICB2YWx1ZT17bG9vayhjaGFyYWN0ZXIsIG9wdGlvbi5pZCl9XG4gICAgICAgICAgb25QaWNrPXsoaSkgPT4gc2V0TG9vayhvcHRpb24uaWQsIGkpfVxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICAgIHNmeChcImJhY2tcIik7XG4gICAgICAgICAgICBzZXRHcmlkKG51bGwpO1xuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgey8qIEhpZGRlbiwgbm90IHVubW91bnRlZCwgdW5kZXIgdGhlIGdyaWQ6IGl0IGtlZXBzIGl0cyBzY3JvbGwuICovfVxuICAgICAgPG5vZGVcbiAgICAgICAgc2Nyb2xsVG9wPXtzY3JvbGx9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZGlzcGxheTogb3B0aW9uID8gXCJub25lXCIgOiBcImZsZXhcIixcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICByaWdodDogMTQ2LFxuICAgICAgICAgIHRvcDogMjE0LFxuICAgICAgICAgIHdpZHRoOiA0OTEsXG4gICAgICAgICAgaGVpZ2h0OiA2NjAsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBnYXA6IDEwLFxuICAgICAgICAgIG92ZXJmbG93WTogXCJzY3JvbGxcIixcbiAgICAgICAgICBzY3JvbGxiYXI6IHtcbiAgICAgICAgICAgIHRyYWNrOiB7IGJhY2tncm91bmRDb2xvcjogXCIjNGUxNzE3XCIgfSxcbiAgICAgICAgICAgIHRodW1iOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjZmY1ZTUyXCIsXG4gICAgICAgICAgICAgIGhvdmVyOiB7IGJhY2tncm91bmRDb2xvcjogQy5yZWRIaSB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRoaWNrbmVzczogOCxcbiAgICAgICAgICAgIG1pblRodW1iTGVuZ3RoOiA2MCxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8UHJvbm91bnMgbmFtZT17aGFuZGxlT2YoY2hhcmFjdGVyKX0gdm9pY2U9e2NoYXJhY3Rlci52b2ljZX0gLz5cbiAgICAgICAgPFJvd1xuICAgICAgICAgIGxhYmVsPXtWT0lDRS5sYWJlbH1cbiAgICAgICAgICB2YWx1ZT17Vk9JQ0UubmFtZXNbY2hhcmFjdGVyLnZvaWNlXX1cbiAgICAgICAgICBvblN0ZXA9eygpID0+IHtcbiAgICAgICAgICAgIHNmeChcInRhYlwiKTtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCB2b2ljZTogMSAtIGNoYXJhY3Rlci52b2ljZSB9KTtcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgICB7TE9PS19PUFRJT05TLm1hcCgobykgPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9vayhjaGFyYWN0ZXIsIG8uaWQpO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Um93XG4gICAgICAgICAgICAgIGtleT17by5pZH1cbiAgICAgICAgICAgICAgbGFiZWw9e28ubGFiZWx9XG4gICAgICAgICAgICAgIHZhbHVlPXt0d28odmFsdWUpfVxuICAgICAgICAgICAgICBzd2F0Y2g9e28uc3dhdGNoZXM/Llt2YWx1ZV19XG4gICAgICAgICAgICAgIG9uU3RlcD17KGJ5KSA9PiBzdGVwKG8uaWQsIG8uY291bnQsIGJ5KX1cbiAgICAgICAgICAgICAgb25HcmlkPXtcbiAgICAgICAgICAgICAgICBvLnN3YXRjaGVzXG4gICAgICAgICAgICAgICAgICA/ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBzZngoXCJjbGlja1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICBzZXRHcmlkKG8uaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgPC9ub2RlPlxuICAgICAgPE5hdkJ1dHRvbnMgb25CYWNrPXtiYWNrfSBvbk5leHQ9e25leHR9IC8+XG4gICAgICA8SGludHM+XG4gICAgICAgIDxIaW50IGs9XCJtb3VzZVwiIGxhYmVsPVwiU0VMRUNUXCIgLz5cbiAgICAgICAgPEljb25IaW50IGljb249ezxXaGVlbEljb24gLz59IGxhYmVsPVwiU0NST0xMXCIgLz5cbiAgICAgIDwvSGludHM+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHdhcm5pbmcgb3ZlciB0aGUgdm9pY2Ugcm93OiB3aG8gdGhlIGNpdHkgd2lsbCB0YWtlIHlvdSBmb3IuICovXG5mdW5jdGlvbiBQcm9ub3Vucyh7IG5hbWUsIHZvaWNlIH06IHsgbmFtZTogc3RyaW5nOyB2b2ljZTogbnVtYmVyIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiA4LFxuICAgICAgICB3aWR0aDogNDU1LFxuICAgICAgICBoZWlnaHQ6IDQ0LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8V2FybmluZ0ljb24gc2l6ZT17MTh9IC8+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogNS41LCBjb2xvcjogQy5yZWQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fVxuICAgICAgPlxuICAgICAgICB7XCJWT1ggTU9EXFxuUkVHIDIwOTFcXG5TQyA0NC1BXCJ9XG4gICAgICA8L3RleHQ+XG4gICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMzkwIH19PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTksIGNvbG9yOiBDLnJlZCwgbGluZUhlaWdodDogMS4wNSB9fT5cbiAgICAgICAgICB7YE9USEVSIENIQVJBQ1RFUlMgV0lMTCBSRUZFUiBUT1xcbiR7bmFtZX0gQVMgJHt2b2ljZSA9PT0gMCA/IFwiSEUvSElNXCIgOiBcIlNIRS9IRVJcIn0uYH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIE9uZSBvcHRpb246IGl0cyBuYW1lIGFuZCB2YWx1ZSAob3Igc3dhdGNoKSBvbiBhIHBsYXRlLCB0aGUgc3RlcHBlclxuICogIHBsYXRlIHVuZGVyIGl0LiAqL1xuZnVuY3Rpb24gUm93KHtcbiAgbGFiZWwsXG4gIHZhbHVlLFxuICBzd2F0Y2gsXG4gIG9uU3RlcCxcbiAgb25HcmlkLFxufToge1xuICBsYWJlbDogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBzd2F0Y2g/OiBzdHJpbmc7XG4gIG9uU3RlcDogKGJ5OiBudW1iZXIpID0+IHZvaWQ7XG4gIG9uR3JpZD86ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA0LCB3aWR0aDogNDU1IH19PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKFBMQVRFLCAxNCwgRURHRSwgMSwgXCJibFwiKSxcbiAgICAgICAgICBoZWlnaHQ6IDYyLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDEwLCByaWdodDogOCB9LFxuICAgICAgICB9fVxuICAgICAgICBob3ZlclN0eWxlPXtjaGFtZmVyKFwiIzJhMGQxM1wiLCAxNCwgXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjc1KVwiLCAxLCBcImJsXCIpfVxuICAgICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2Z4KFwiaG92ZXJcIil9XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyNSwgY29sb3I6IEMucmVkLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+XG4gICAgICAgICAge2xhYmVsfVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIHtzd2F0Y2ggPyAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7IC4uLmNoYW1mZXIoc3dhdGNoLCA4LCBFREdFLCAxKSwgd2lkdGg6IDUwLCBoZWlnaHQ6IDUwIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMjUsIGNvbG9yOiBDLnJlZCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICAgICAge3ZhbHVlfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogNCwgaGVpZ2h0OiAzOCB9fT5cbiAgICAgICAgPFN0ZXBCdXR0b24gc2lkZT1cImxlZnRcIiBvbkNsaWNrPXsoKSA9PiBvblN0ZXAoLTEpfT5cbiAgICAgICAgICA8QXJyb3cgZGlyPVwibGVmdFwiIHNpemU9ezIyfSAvPlxuICAgICAgICA8L1N0ZXBCdXR0b24+XG4gICAgICAgIHtvbkdyaWQgJiYgKFxuICAgICAgICAgIDxTdGVwQnV0dG9uIG9uQ2xpY2s9e29uR3JpZH0+XG4gICAgICAgICAgICA8R3JpZEljb24gLz5cbiAgICAgICAgICA8L1N0ZXBCdXR0b24+XG4gICAgICAgICl9XG4gICAgICAgIDxTdGVwQnV0dG9uIHNpZGU9XCJyaWdodFwiIG9uQ2xpY2s9eygpID0+IG9uU3RlcCgxKX0+XG4gICAgICAgICAgPEFycm93IGRpcj1cInJpZ2h0XCIgc2l6ZT17MjJ9IC8+XG4gICAgICAgIDwvU3RlcEJ1dHRvbj5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHN0ZXBwZXIgcGxhdGU6IOKXgSwg4pa3IG9yIHRoZSBzd2F0Y2gtZ3JpZCBidXR0b24uICovXG5mdW5jdGlvbiBTdGVwQnV0dG9uKHtcbiAgc2lkZSxcbiAgb25DbGljayxcbiAgY2hpbGRyZW4sXG59OiB7XG4gIHNpZGU/OiBcImxlZnRcIiB8IFwicmlnaHRcIjtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn0pIHtcbiAgY29uc3QgY29ybmVyID0gc2lkZSA9PT0gXCJsZWZ0XCIgPyBcImJsXCIgOiBcImJyXCI7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNmeChcImhvdmVyXCIpfVxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLihzaWRlXG4gICAgICAgICAgPyBjaGFtZmVyKFNURVAsIDEyLCBFREdFLCAxLCBjb3JuZXIpXG4gICAgICAgICAgOiB7IGJhY2tncm91bmRDb2xvcjogU1RFUCwgYm9yZGVyOiAxLCBib3JkZXJDb2xvcjogRURHRSB9KSxcbiAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgIGZsZXhCYXNpczogMCxcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6XG4gICAgICAgICAgc2lkZSA9PT0gXCJsZWZ0XCIgPyBcImZsZXhTdGFydFwiIDogc2lkZSA/IFwiZmxleEVuZFwiIDogXCJjZW50ZXJcIixcbiAgICAgICAgcGFkZGluZzoge1xuICAgICAgICAgIGxlZnQ6IHNpZGUgPT09IFwibGVmdFwiID8gNjAgOiAwLFxuICAgICAgICAgIHJpZ2h0OiBzaWRlID09PSBcInJpZ2h0XCIgPyA3MCA6IDAsXG4gICAgICAgIH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17XG4gICAgICAgIHNpZGVcbiAgICAgICAgICA/IGNoYW1mZXIoXCIjNDgxMjFhXCIsIDEyLCBDLnJlZCwgMSwgY29ybmVyKVxuICAgICAgICAgIDogeyBiYWNrZ3JvdW5kQ29sb3I6IFwiIzQ4MTIxYVwiLCBib3JkZXJDb2xvcjogQy5yZWQgfVxuICAgICAgfVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIFRoZSBmb3VyIHJlYWR5LW1hZGUgZmFjZXM6IGEgY2xpY2sgcHV0cyBvbmUgb24gdGhlIGNhcmQuICovXG5mdW5jdGlvbiBQcmVzZXRzKHtcbiAgY2hhcmFjdGVyLFxuICBvbkNoYW5nZSxcbn06IHtcbiAgY2hhcmFjdGVyOiBDaGFyYWN0ZXI7XG4gIG9uQ2hhbmdlOiAoY2hhcmFjdGVyOiBDaGFyYWN0ZXIpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiA3NixcbiAgICAgICAgdG9wOiAxOTQsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIGdhcDogNSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5ULm1lbnUsXG4gICAgICAgICAgZm9udFNpemU6IDMxLFxuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgbWFyZ2luOiB7IGJvdHRvbTogNCB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBQUkVTRVRTXG4gICAgICA8L3RleHQ+XG4gICAgICB7UFJFU0VUUy5tYXAoKHAsIGkpID0+IHtcbiAgICAgICAgY29uc3Qgb24gPSBPYmplY3QuZW50cmllcyhwKS5ldmVyeShcbiAgICAgICAgICAoW2lkLCB2XSkgPT4gbG9vayhjaGFyYWN0ZXIsIGlkKSA9PT0gdixcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2Z4KFwiaG92ZXJcIil9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNmeChcImNsaWNrXCIpO1xuICAgICAgICAgICAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3RlciwgbG9vazogeyAuLi5jaGFyYWN0ZXIubG9vaywgLi4ucCB9IH0pO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIC4uLmNoYW1mZXIoXCIjMjQwYTBlXCIsIDE2LCBvbiA/IEMucmVkIDogRURHRSwgMSksXG4gICAgICAgICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgICAgICAgIGhlaWdodDogMTYwLFxuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBwYWRkaW5nOiB7IHRvcDogNCB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGhvdmVyU3R5bGU9e2NoYW1mZXIoXCIjM2ExMDE2XCIsIDE2LCBDLnJlZCwgMSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFBvcnRyYWl0XG4gICAgICAgICAgICAgIGxvb2s9e3sgLi4uY2hhcmFjdGVyLmxvb2ssIC4uLnAgfX1cbiAgICAgICAgICAgICAgYm9keT17Y2hhcmFjdGVyLmJvZHl9XG4gICAgICAgICAgICAgIHdpZHRoPXsxMDB9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgICAgICBtYXJnaW46IHsgdG9wOiAzLCBib3R0b206IDQgfSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEVER0UsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDk2LCBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiIH19PlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtgU0MrICR7dHdvKGkpfWB9XG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDUuNSB9fT5cbiAgICAgICAgICAgICAgICBURU1QTEFURSAvLyBSRVNJREVOVFxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICk7XG4gICAgICB9KX1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiLy8gVGhlIG5ldyBnYW1lJ3MgY29weSBhbmQgb3B0aW9uIHRhYmxlczogdGhlIGRpZmZpY3VsdHkgYW5kIGxpZmVwYXRoIGJsdXJicyxcbi8vIHRoZSBhcHBlYXJhbmNlIG9wdGlvbnMgKHZhbHVlcyBsaXZlIGluIGBjaGFyYWN0ZXIubG9va2ApLCB0aGUgcHJlc2V0cyBhbmRcbi8vIHRoZSBhdHRyaWJ1dGUgcnVsZXMuXG5cbmltcG9ydCB0eXBlIHsgQXR0cmlidXRlSWQsIENoYXJhY3RlciwgRGlmZmljdWx0eSwgTGlmZXBhdGggfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcblxuZXhwb3J0IGNvbnN0IERJRkZJQ1VMVFlfVEVYVDogUmVjb3JkPERpZmZpY3VsdHksIHN0cmluZz4gPSB7XG4gIGVhc3k6IFwiRm9yIHRob3NlIGhlcmUgZm9yIHRoZSBzdG9yeS4gRW5lbWllcyBnbyBkb3duIHF1aWNrbHksIGhpdCBzb2Z0bHksIGFuZCB0aGUgc3RyZWV0cyBmb3JnaXZlIG1vc3QgYmFkIGRlY2lzaW9ucy4gU2l0IGJhY2sgYW5kIHRha2UgaW4gdGhlIHNpZ2h0cy5cIixcbiAgbm9ybWFsOlxuICAgIFwiVGhlIGludGVuZGVkIGV4cGVyaWVuY2UuIEZpcmVmaWdodHMgdGFrZSBzb21lIHRob3VnaHQsIGFuZCBkZWNlbnQgZ2VhciBhbmQgd2VsbC1jaG9zZW4gY3liZXJ3YXJlIHdpbGwga2VlcCB5b3UgYnJlYXRoaW5nIG9uIG1vc3QgbmlnaHRzLlwiLFxuICBoYXJkOiBcIkVuZW1pZXMgYXJlIGRlYWRsaWVyIGFuZCB0aGV5IHRoaW5rIGJlZm9yZSB0aGV5IHNob290LiBTdGF5aW5nIGFsaXZlIHdpbGwgZGVwZW5kIG9uIGhvdyB3ZWxsIHlvdSB1c2UgeW91ciBwZXJrcywgaW1wbGFudHMsIGdhZGdldHMgYW5kIHN0aW1zLlwiLFxuICB2ZXJ5aGFyZDpcbiAgICBcIk5vIG1lcmN5LiBBbnkgZmlyZWZpZ2h0IGNvdWxkIGJlIHlvdXIgbGFzdDogcGxhbiBldmVyeSBtb3ZlLCByZWFkIGV2ZXJ5IHJvb20gYW5kIHNwZW5kIGV2ZXJ5IHJlc291cmNlIGFzIGlmIG5vdGhpbmcgY29tZXMgYWZ0ZXIgaXQuXCIsXG59O1xuXG5leHBvcnQgY29uc3QgTElGRVBBVEhfVEVYVDogUmVjb3JkPExpZmVwYXRoLCBzdHJpbmc+ID0ge1xuICBub21hZDpcbiAgICBcIlJhaXNlZCBvbiB0aGUgb3BlbiByb2FkIHBhc3QgdGhlIFNhYmxlIENpdHkgd2FsbHMsIHlvdSBsZWFybmVkIHRvIGZpeCBhIGRlYWQgZW5naW5lLCByZWFkIGEgZHVzdCBzdG9ybSBhbmQgdHJ1c3Qgbm9ib2R5IG91dHNpZGUgdGhlIGNsYW4uIFRoZSBjaXR5IHNlZXMgYW4gb3V0c2lkZXIuIFlvdSBzZWUgYSBjYWdlIHdpdGggbmVvbiBvbiB0aGUgYmFycy5cIixcbiAgc3RyZWV0a2lkOlxuICAgIFwiS2Vzc2xlcidzIGFsbGV5cyByYWlzZWQgeW91LiBZb3Uga25vdyB3aGljaCBmaXhlciBwYXlzLCB3aGljaCBnYW5nIG93bnMgd2hpY2ggY29ybmVyIGFuZCB3aGljaCBjb3AgbG9va3MgYXdheSBmb3IgYSBwcmljZS4gT3V0IGhlcmUgYSBmYXZvciBpcyBjdXJyZW5jeSBhbmQgYSBuYW1lIGlzIGFybW9yLCBhbmQgeW91IGhhdmUgc3BlbnQgeW91ciBsaWZlIGVhcm5pbmcgYm90aC5cIixcbiAgY29ycG86XG4gICAgXCJUd2VsdmUgeWVhcnMgaW4gVGVua2FpJ3MgZ2xhc3MgdG93ZXIgdGF1Z2h0IHlvdSB0aGF0IHRydXRoIGlzIGEgcmVzb3VyY2UgYW5kIGxveWFsdHkgaGFzIGEgcHJpY2UgdGFnLiBZb3UgaGF2ZSBidXJpZWQgcml2YWxzIGluIGF1ZGl0cyBhbmQgc29sZCBzZWNyZXRzIGJldHdlZW4gZmxvb3JzLCBzbWlsaW5nIHRoZSB3aG9sZSB3YXkuIFVwIHRoZXJlLCBub2JvZHkgaGFzIGZyaWVuZHMuIE9ubHkgbGV2ZXJhZ2UuXCIsXG59O1xuXG4vKiogT25lIHJvdyBvZiB0aGUgYXBwZWFyYW5jZSBsaXN0LiBgc3dhdGNoZXNgIG1ha2VzIGl0IGEgY29sb3Igb3B0aW9uICh0aGVcbiAqICBncmlkIGJ1dHRvbiBvcGVucyB0aGVtKTsgb3RoZXJ3aXNlIGl0IGhhcyBgY291bnRgIG51bWJlcmVkIHZhcmlhbnRzLiAqL1xuZXhwb3J0IHR5cGUgTG9va09wdGlvbiA9IHtcbiAgaWQ6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgY291bnQ6IG51bWJlcjtcbiAgc3dhdGNoZXM/OiBzdHJpbmdbXTtcbn07XG5cbmV4cG9ydCBjb25zdCBTS0lOX1RPTkVTID0gW1xuICBcIiNmM2Q3YzBcIixcbiAgXCIjZWJjNWE2XCIsXG4gIFwiI2RmYjA4YlwiLFxuICBcIiNkMDljNzZcIixcbiAgXCIjYzA4NjY0XCIsXG4gIFwiI2FkNzU1M1wiLFxuICBcIiM5ODYyNDRcIixcbiAgXCIjODI1MTM4XCIsXG4gIFwiIzZjNDEyZFwiLFxuICBcIiM1NzMzMjRcIixcbiAgXCIjNDMyODFkXCIsXG4gIFwiIzhmYTdhMlwiLFxuXTtcblxuZXhwb3J0IGNvbnN0IEhBSVJfQ09MT1JTID0gW1xuICBcIiMxYjE3MTZcIixcbiAgXCIjM2IyNjE5XCIsXG4gIFwiIzZiNDIyNlwiLFxuICBcIiM4YTNiMWVcIixcbiAgXCIjYjU1NjJhXCIsXG4gIFwiI2Q5YjU2Y1wiLFxuICBcIiNlOGUyZDBcIixcbiAgXCIjOGM4YzhjXCIsXG4gIFwiI2ZmNGZhM1wiLFxuICBcIiMzZmUwZmZcIixcbiAgXCIjN2NmZjRmXCIsXG4gIFwiIzhmNWJmZlwiLFxuXTtcblxuZXhwb3J0IGNvbnN0IEVZRV9DT0xPUlMgPSBbXG4gIFwiIzZmYjdmZlwiLFxuICBcIiM4YTYwMzhcIixcbiAgXCIjNWFhMDVhXCIsXG4gIFwiI2E1YWRiNVwiLFxuICBcIiNlOGI4NDdcIixcbiAgXCIjZmY1MDUwXCIsXG4gIFwiIzVlZjZmZlwiLFxuICBcIiNjNzdkZmZcIixcbl07XG5cbi8qKiBUaGUgdm9pY2UtdG9uZSByb3cgaXMgdGhlIGNoYXJhY3RlcidzIGB2b2ljZWAsIG5vdCBhIGBsb29rYCB2YWx1ZS4gKi9cbmV4cG9ydCBjb25zdCBWT0lDRSA9IHtcbiAgbGFiZWw6IFwiVk9JQ0UgVE9ORVwiLFxuICBuYW1lczogW1wiTUFTQ1VMSU5FXCIsIFwiRkVNSU5JTkVcIl0sXG59O1xuXG5leHBvcnQgY29uc3QgTE9PS19PUFRJT05TOiBMb29rT3B0aW9uW10gPSBbXG4gIHtcbiAgICBpZDogXCJza2luVG9uZVwiLFxuICAgIGxhYmVsOiBcIlNLSU4gVE9ORVwiLFxuICAgIGNvdW50OiBTS0lOX1RPTkVTLmxlbmd0aCxcbiAgICBzd2F0Y2hlczogU0tJTl9UT05FUyxcbiAgfSxcbiAgeyBpZDogXCJza2luVHlwZVwiLCBsYWJlbDogXCJTS0lOIFRZUEVcIiwgY291bnQ6IDggfSxcbiAgeyBpZDogXCJoYWlyc3R5bGVcIiwgbGFiZWw6IFwiSEFJUlNUWUxFXCIsIGNvdW50OiAxMiB9LFxuICB7XG4gICAgaWQ6IFwiaGFpckNvbG9yXCIsXG4gICAgbGFiZWw6IFwiSEFJUiBDT0xPUlwiLFxuICAgIGNvdW50OiBIQUlSX0NPTE9SUy5sZW5ndGgsXG4gICAgc3dhdGNoZXM6IEhBSVJfQ09MT1JTLFxuICB9LFxuICB7IGlkOiBcImV5ZXNcIiwgbGFiZWw6IFwiRVlFU1wiLCBjb3VudDogRVlFX0NPTE9SUy5sZW5ndGggfSxcbiAgeyBpZDogXCJleWVicm93c1wiLCBsYWJlbDogXCJFWUVCUk9XU1wiLCBjb3VudDogNiB9LFxuICB7IGlkOiBcIm5vc2VcIiwgbGFiZWw6IFwiTk9TRVwiLCBjb3VudDogNiB9LFxuICB7IGlkOiBcIm1vdXRoXCIsIGxhYmVsOiBcIk1PVVRIXCIsIGNvdW50OiA2IH0sXG4gIHsgaWQ6IFwiamF3XCIsIGxhYmVsOiBcIkpBV1wiLCBjb3VudDogNiB9LFxuICB7IGlkOiBcImVhcnNcIiwgbGFiZWw6IFwiRUFSU1wiLCBjb3VudDogNCB9LFxuICB7IGlkOiBcImN5YmVyd2FyZVwiLCBsYWJlbDogXCJDWUJFUldBUkVcIiwgY291bnQ6IDggfSxcbiAgeyBpZDogXCJzY2Fyc1wiLCBsYWJlbDogXCJTQ0FSU1wiLCBjb3VudDogNiB9LFxuICB7IGlkOiBcInRhdHRvb3NcIiwgbGFiZWw6IFwiVEFUVE9PU1wiLCBjb3VudDogOCB9LFxuICB7IGlkOiBcInBpZXJjaW5nc1wiLCBsYWJlbDogXCJQSUVSQ0lOR1NcIiwgY291bnQ6IDYgfSxcbiAgeyBpZDogXCJtYWtldXBcIiwgbGFiZWw6IFwiTUFLRVVQXCIsIGNvdW50OiA2IH0sXG4gIHsgaWQ6IFwibmFpbHNcIiwgbGFiZWw6IFwiTkFJTFNcIiwgY291bnQ6IDUgfSxcbl07XG5cbi8qKiBBIGxvb2sgdmFsdWUgKGV2ZXJ5IG9wdGlvbiBzdGFydHMgYXQgaXRzIGZpcnN0IHZhcmlhbnQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2soYzogQ2hhcmFjdGVyLCBpZDogc3RyaW5nKSB7XG4gIHJldHVybiBjLmxvb2tbaWRdID8/IDA7XG59XG5cbi8qKiBUaGUgZm91ciByZWFkeS1tYWRlIGZhY2VzIGxlZnQgb2YgdGhlIElEIGNhcmQuICovXG5leHBvcnQgY29uc3QgUFJFU0VUUzogUmVjb3JkPHN0cmluZywgbnVtYmVyPltdID0gW1xuICB7XG4gICAgc2tpblRvbmU6IDgsXG4gICAgc2tpblR5cGU6IDIsXG4gICAgaGFpcnN0eWxlOiAxLFxuICAgIGhhaXJDb2xvcjogNCxcbiAgICBleWVzOiAxLFxuICAgIGV5ZWJyb3dzOiAyLFxuICAgIGphdzogMixcbiAgICBjeWJlcndhcmU6IDAsXG4gICAgc2NhcnM6IDEsXG4gICAgdGF0dG9vczogMCxcbiAgICBwaWVyY2luZ3M6IDEsXG4gICAgbWFrZXVwOiAwLFxuICB9LFxuICB7XG4gICAgc2tpblRvbmU6IDQsXG4gICAgc2tpblR5cGU6IDEsXG4gICAgaGFpcnN0eWxlOiA3LFxuICAgIGhhaXJDb2xvcjogMCxcbiAgICBleWVzOiAwLFxuICAgIGV5ZWJyb3dzOiA0LFxuICAgIGphdzogNCxcbiAgICBjeWJlcndhcmU6IDEsXG4gICAgc2NhcnM6IDAsXG4gICAgdGF0dG9vczogNSxcbiAgICBwaWVyY2luZ3M6IDAsXG4gICAgbWFrZXVwOiAwLFxuICB9LFxuICB7XG4gICAgc2tpblRvbmU6IDEsXG4gICAgc2tpblR5cGU6IDAsXG4gICAgaGFpcnN0eWxlOiA0LFxuICAgIGhhaXJDb2xvcjogOSxcbiAgICBleWVzOiA2LFxuICAgIGV5ZWJyb3dzOiAxLFxuICAgIGphdzogMSxcbiAgICBjeWJlcndhcmU6IDMsXG4gICAgc2NhcnM6IDAsXG4gICAgdGF0dG9vczogMixcbiAgICBwaWVyY2luZ3M6IDMsXG4gICAgbWFrZXVwOiAyLFxuICB9LFxuICB7XG4gICAgc2tpblRvbmU6IDEwLFxuICAgIHNraW5UeXBlOiA0LFxuICAgIGhhaXJzdHlsZTogMixcbiAgICBoYWlyQ29sb3I6IDgsXG4gICAgZXllczogNSxcbiAgICBleWVicm93czogNSxcbiAgICBqYXc6IDMsXG4gICAgY3liZXJ3YXJlOiA3LFxuICAgIHNjYXJzOiA0LFxuICAgIHRhdHRvb3M6IDcsXG4gICAgcGllcmNpbmdzOiA1LFxuICAgIG1ha2V1cDogMyxcbiAgfSxcbl07XG5cbmV4cG9ydCBjb25zdCBBVFRSX01JTiA9IDM7XG5leHBvcnQgY29uc3QgQVRUUl9NQVggPSA2O1xuLyoqIFBvaW50cyB0byBzcGVuZCBvbiB0b3Agb2YgdGhlIHN0YXJ0aW5nIDMgaW4gZWFjaCBhdHRyaWJ1dGUuICovXG5leHBvcnQgY29uc3QgQVRUUl9QT0lOVFMgPSA3O1xuXG5leHBvcnQgY29uc3QgQVRUUklCVVRFUzoge1xuICBpZDogQXR0cmlidXRlSWQ7XG4gIG5hbWU6IHN0cmluZztcbiAgc2hvcnQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBlZmZlY3RzOiBzdHJpbmdbXTtcbn1bXSA9IFtcbiAge1xuICAgIGlkOiBcImJvZHlcIixcbiAgICBuYW1lOiBcIkJvZHlcIixcbiAgICBzaG9ydDogXCJCT0RcIixcbiAgICB0ZXh0OiBcIkJvZHkgaXMgcmF3IHN0cmVuZ3RoIGFuZCB0aGUgcHVuaXNobWVudCB5b3UgY2FuIHRha2UuIEV2ZXJ5IGxldmVsIGluIEJvZHkgd2lsbDpcIixcbiAgICBlZmZlY3RzOiBbXG4gICAgICBcIlJhaXNlIHlvdXIgbWF4aW11bSBIZWFsdGggYnkgNVwiLFxuICAgICAgXCJSYWlzZSBtZWxlZSBhbmQgdW5hcm1lZCBkYW1hZ2UgYnkgMiVcIixcbiAgICAgIFwiU2hvcnRlbiB0aGUgdGltZSB5b3Ugc3RheSBzdHVubmVkXCIsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcImludGVsbGlnZW5jZVwiLFxuICAgIG5hbWU6IFwiSW50ZWxsaWdlbmNlXCIsXG4gICAgc2hvcnQ6IFwiSU5UXCIsXG4gICAgdGV4dDogXCJJbnRlbGxpZ2VuY2UgaXMgaG93IGZhc3QgeW91ciBtaW5kIG1vdmVzIHRocm91Z2ggdGhlIE5ldC4gRXZlcnkgbGV2ZWwgaW4gSW50ZWxsaWdlbmNlIHdpbGw6XCIsXG4gICAgZWZmZWN0czogW1xuICAgICAgXCJBZGQgMSB1bml0IG9mIGN5YmVyZGVjayBSQU1cIixcbiAgICAgIFwiUmFpc2UgcXVpY2toYWNrIGRhbWFnZSBieSAyJVwiLFxuICAgICAgXCJDdXQgYnJlYWNoIHByb3RvY29sIHRpbWUgYnkgMC41IHNlY1wiLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJyZWZsZXhlc1wiLFxuICAgIG5hbWU6IFwiUmVmbGV4ZXNcIixcbiAgICBzaG9ydDogXCJSRUZcIixcbiAgICB0ZXh0OiBcIlJlZmxleGVzIGRlY2lkZSBob3cgcXVpY2tseSB5b3UgbW92ZSBhbmQgcmVhY3QuIE9uIHRvcCBvZiB5b3VyIG1vdmVtZW50IHNwZWVkLCBldmVyeSBsZXZlbCBpbiBSZWZsZXhlcyB3aWxsOlwiLFxuICAgIGVmZmVjdHM6IFtcbiAgICAgIFwiUmFpc2UgeW91ciBjaGFuY2UgdG8gZXZhZGUgYXR0YWNrcyBieSAxJVwiLFxuICAgICAgXCJSYWlzZSBjcml0aWNhbCBoaXQgY2hhbmNlIGJ5IDElXCIsXG4gICAgICBcIlJhaXNlIGRhbWFnZSBmcm9tIGJsYWRlIGltcGxhbnRzIGJ5IDMlXCIsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcInRlY2hcIixcbiAgICBuYW1lOiBcIlRlY2huaWNhbCBBYmlsaXR5XCIsXG4gICAgc2hvcnQ6IFwiVEVDXCIsXG4gICAgdGV4dDogXCJUZWNobmljYWwgQWJpbGl0eSBpcyB5b3VyIGZlZWwgZm9yIG1hY2hpbmVzLCB3ZWFwb25zIGFuZCBpbXBsYW50cy4gRXZlcnkgbGV2ZWwgaW4gVGVjaG5pY2FsIEFiaWxpdHkgd2lsbDpcIixcbiAgICBlZmZlY3RzOiBbXG4gICAgICBcIlJhaXNlIHlvdXIgYXJtb3IgYnkgNCVcIixcbiAgICAgIFwiVW5sb2NrIGJldHRlciBjcmFmdGluZyBzcGVjc1wiLFxuICAgICAgXCJSYWlzZSBkYW1hZ2UgZnJvbSBnYWRnZXRzIGJ5IDMlXCIsXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcImNvb2xcIixcbiAgICBuYW1lOiBcIkNvb2xcIixcbiAgICBzaG9ydDogXCJDT0xcIixcbiAgICB0ZXh0OiBcIkNvb2wgaXMgaG93IHN0ZWFkeSB5b3Ugc3RheSB3aGVuIGV2ZXJ5dGhpbmcgZ29lcyBsb3VkLiBFdmVyeSBsZXZlbCBpbiBDb29sIHdpbGw6XCIsXG4gICAgZWZmZWN0czogW1xuICAgICAgXCJSYWlzZSBjcml0aWNhbCBkYW1hZ2UgYnkgMiVcIixcbiAgICAgIFwiTWFrZSB5b3UgMC41JSBoYXJkZXIgdG8gZGV0ZWN0XCIsXG4gICAgICBcIlJhaXNlIHJlc2lzdGFuY2UgdG8gZmVhciBhbmQgcGFuaWMgYnkgMSVcIixcbiAgICBdLFxuICB9LFxuXTtcblxuLyoqIEZOVi0xYTogdGhlIElEIG51bWJlciBhbmQgYmFyY29kZSBhcmUgZGVyaXZlZCBmcm9tIHRoZSBoYW5kbGUuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzaChzOiBzdHJpbmcpIHtcbiAgbGV0IGggPSAyMTY2MTM2MjYxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcbiAgICBoIF49IHMuY2hhckNvZGVBdChpKTtcbiAgICBoID0gTWF0aC5pbXVsKGgsIDE2Nzc3NjE5KTtcbiAgfVxuICByZXR1cm4gaCA+Pj4gMDtcbn1cblxuLyoqIFwiU0M5MS00NDcxLTAyOTMtTllcIi4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNpZGVudElkKGhhbmRsZTogc3RyaW5nKSB7XG4gIGNvbnN0IGQgPSBoYXNoKGhhbmRsZSkudG9TdHJpbmcoKS5wYWRTdGFydCgxMCwgXCIwXCIpO1xuICBjb25zdCB0YWcgPSBoYW5kbGUucmVwbGFjZSgvW15BLVowLTldL2csIFwiXCIpLnNsaWNlKDAsIDIpIHx8IFwiWFhcIjtcbiAgcmV0dXJuIGBTQzkxLSR7ZC5zbGljZSgwLCA0KX0tJHtkLnNsaWNlKDQsIDgpfS0ke3RhZ31gO1xufVxuXG4vKiogXCIwNFwiIGZyb20gYSAwLWJhc2VkIHZhcmlhbnQuICovXG5leHBvcnQgZnVuY3Rpb24gdHdvKGk6IG51bWJlcikge1xuICByZXR1cm4gKGkgKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbn1cblxuLyoqIFRoZSBoYW5kbGUgYXMgdGhlIGNvcHkgdXNlcyBpdCAobmV2ZXIgZW1wdHkpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZU9mKGM6IENoYXJhY3Rlcikge1xuICByZXR1cm4gYy5oYW5kbGUudHJpbSgpIHx8IFwiTllYXCI7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdHlwZSBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7XG4gIGludGVycG9sYXRlLFxuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aFNlcXVlbmNlLFxuICB3aXRoVGltaW5nLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgdXNlS2V5cyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgRElGRklDVUxUSUVTLCBMSUZFUEFUSFMsIHR5cGUgQ2hhcmFjdGVyIH0gZnJvbSBcIi4uLy4uL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBWT0lDRSwgaGFzaCwgcmVzaWRlbnRJZCB9IGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCB7IExpZmVwYXRoSWNvbiB9IGZyb20gXCIuL2dseXBoc1wiO1xuaW1wb3J0IHsgQmFyY29kZSB9IGZyb20gXCIuL3BhcnRzXCI7XG5pbXBvcnQgeyBQb3J0cmFpdCB9IGZyb20gXCIuL1BvcnRyYWl0XCI7XG5pbXBvcnQgeyBSVUxFLCBSYWRhciB9IGZyb20gXCIuL1JhZGFyXCI7XG5cbmNvbnN0IFcgPSA0ODA7XG5jb25zdCBIID0gNjQwO1xuXG4vKiogVGhlIFNhYmxlIENpdHkgcmVzaWRlbnQgSUQgb2YgdGhlIGNoYXJhY3RlciBiZWluZyBtYWRlIOKAlCBldmVyeSBmaWVsZFxuICogIGxpdmU6IHRoZSBzY2FubmVkIHBvcnRyYWl0IChyZS1zY2FubmVkIG9uIGVhY2ggY2hhbmdlKSwgdGhlIGhhbmRsZVxuICogIChjbGljayB0byBlZGl0OyBFbnRlciBvciBFc2MgdG8gZmluaXNoKSwgdGhlIElEIG51bWJlciBhbmQgYmFyY29kZVxuICogIGRlcml2ZWQgZnJvbSBpdCwgdGhlIGxpZmVwYXRoLCBib2R5LCB2b2ljZSwgZGlmZmljdWx0eSBhbmQgYW5cbiAqICBhdHRyaWJ1dGUgcmFkYXIuIGBvbkVkaXRpbmdgIHJlcG9ydHMgdGhlIGhhbmRsZSBmaWVsZCdzIGZvY3VzLCBzbyB0aGVcbiAqICBzdGVwJ3Mgc2hvcnRjdXRzIHN0YXkgb3V0IG9mIHRoZSB3YXkgd2hpbGUgdHlwaW5nLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElkQ2FyZCh7XG4gIGNoYXJhY3RlcixcbiAgb25DaGFuZ2UsXG4gIG9uRWRpdGluZyxcbiAgc3R5bGUsXG59OiB7XG4gIGNoYXJhY3RlcjogQ2hhcmFjdGVyO1xuICBvbkNoYW5nZTogKGNoYXJhY3RlcjogQ2hhcmFjdGVyKSA9PiB2b2lkO1xuICBvbkVkaXRpbmc6IChlZGl0aW5nOiBib29sZWFuKSA9PiB2b2lkO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbn0pIHtcbiAgLy8gRXNjYXBlIGFuZCBhIGNsaWNrIGVsc2V3aGVyZSBibHVyIHRoZSBmaWVsZCB0aGVtc2VsdmVzLiBFbnRlciBkb2Vzbid0XG4gIC8vIChhbmQgUmVhY3QgY2FuJ3QgYmx1ciBvbmUpLCBzbyBpdCByZW1vdW50cyB0aGUgZmllbGQ6IGEgZGVzcGF3bmVkIGZpZWxkXG4gIC8vIGRyb3BzIHRoZSBmb2N1cy5cbiAgY29uc3QgW2ZpZWxkLCBzZXRGaWVsZF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBlZGl0ID0gKG9uOiBib29sZWFuKSA9PiB7XG4gICAgc2V0RWRpdGluZyhvbik7XG4gICAgb25FZGl0aW5nKG9uKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlZGl0aW5nICYmIGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAgIHNldEZpZWxkKGZpZWxkICsgMSk7XG4gICAgICBlZGl0KGZhbHNlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IHNjYW4gPSB1c2VTaGFyZWRWYWx1ZSgxKTtcbiAgY29uc3QgbG9va0tleSA9IEpTT04uc3RyaW5naWZ5KGNoYXJhY3Rlci5sb29rKSArIGNoYXJhY3Rlci5ib2R5O1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNjYW4udmFsdWUgPSB3aXRoU2VxdWVuY2UoXG4gICAgICB3aXRoVGltaW5nKDAsIHsgZHVyYXRpb246IDAgfSksXG4gICAgICB3aXRoVGltaW5nKDEsIHsgZHVyYXRpb246IDY1MCwgZWFzaW5nOiBcImVhc2VJbk91dFwiIH0pLFxuICAgICk7XG4gIH0sIFtsb29rS2V5LCBzY2FuXSk7XG5cbiAgY29uc3QgbGlmZXBhdGggPSBMSUZFUEFUSFMuZmluZCgobCkgPT4gbC5pZCA9PT0gY2hhcmFjdGVyLmxpZmVwYXRoKSE7XG4gIGNvbnN0IGRpZmZpY3VsdHkgPSBESUZGSUNVTFRJRVMuZmluZCgoZCkgPT4gZC5pZCA9PT0gY2hhcmFjdGVyLmRpZmZpY3VsdHkpITtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uY2hhbWZlcihcIiMwZDBhMTBcIiwgMzQsIFwicmdiYSgyNTUsIDkzLCA4MSwgMC42KVwiLCAxKSxcbiAgICAgICAgd2lkdGg6IFcsXG4gICAgICAgIGhlaWdodDogSCxcbiAgICAgICAgLi4uc3R5bGUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxIZWFkIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogNzgsXG4gICAgICAgICAgd2lkdGg6IDE5MCxcbiAgICAgICAgICBoZWlnaHQ6IDIzOCxcbiAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSg5NCwgMjQ2LCAyNTUsIDAuMjgpXCIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMwNzA5MGVcIixcbiAgICAgICAgICBvdmVyZmxvd1g6IFwiY2xpcFwiLFxuICAgICAgICAgIG92ZXJmbG93WTogXCJjbGlwXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxQb3J0cmFpdCBsb29rPXtjaGFyYWN0ZXIubG9va30gYm9keT17Y2hhcmFjdGVyLmJvZHl9IHdpZHRoPXsxODh9IC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgdG9wOiAtMyxcbiAgICAgICAgICAgIGhlaWdodDogMyxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgb3BhY2l0eToge1xuICAgICAgICAgICAgICBhbmltYXRlZDogaW50ZXJwb2xhdGUoc2NhbiwgWzAsIDAuMDQsIDAuOSwgMV0sIFswLCAwLjksIDAuOSwgMF0pLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRyYW5zZm9ybToge1xuICAgICAgICAgICAgICB0cmFuc2xhdGVZOiB7IGFuaW1hdGVkOiBpbnRlcnBvbGF0ZShzY2FuLCBbMCwgMV0sIFswLCAyNDBdKSB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMzIwLFxuICAgICAgICAgIGNvbG9yOiBDLmN5YW5EaW0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIEJJT01FVFJJQyBTQ0FOIDAxIC8vIExJVkVcbiAgICAgIDwvdGV4dD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjI4LFxuICAgICAgICAgIHRvcDogNzIsXG4gICAgICAgICAgd2lkdGg6IDIzMixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGdhcDogNixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAyIH19PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIiB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxMYWJlbD5IQU5ETEU8L0xhYmVsPlxuICAgICAgICAgICAgPExhYmVsIGNvbG9yPXtlZGl0aW5nID8gQy5jeWFuIDogQy5yZWREaW19PlxuICAgICAgICAgICAgICB7ZWRpdGluZyA/IFwiRU5URVIgVE8gQ09ORklSTVwiIDogXCJDTElDSyBUTyBFRElUXCJ9XG4gICAgICAgICAgICA8L0xhYmVsPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8ZWRpdGFibGVUZXh0XG4gICAgICAgICAgICBrZXk9e2ZpZWxkfVxuICAgICAgICAgICAgdmFsdWU9e2NoYXJhY3Rlci5oYW5kbGV9XG4gICAgICAgICAgICBtYXhMZW5ndGg9ezEyfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PlxuICAgICAgICAgICAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3RlciwgaGFuZGxlOiB2LnRvVXBwZXJDYXNlKCkgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uRm9jdXM9eygpID0+IGVkaXQodHJ1ZSl9XG4gICAgICAgICAgICBvbkJsdXI9eygpID0+IGVkaXQoZmFsc2UpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IDIzMixcbiAgICAgICAgICAgICAgaGVpZ2h0OiA0NCxcbiAgICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiA0IH0sXG4gICAgICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDIgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC42KVwiLFxuICAgICAgICAgICAgICBmb250U2l6ZTogMzYsXG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgICAgICAgY3Vyc29yOiBcInRleHRcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBmb2N1c1N0eWxlPXt7IGJvcmRlckNvbG9yOiBDLmN5YW4sIGJhY2tncm91bmRDb2xvcjogXCIjMGYxZDI0XCIgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxGaWVsZCBsYWJlbD1cIlJFU0lERU5UIE5PLlwiPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYubW9ubyxcbiAgICAgICAgICAgICAgY29sb3I6IEMud2hpdGUsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3Jlc2lkZW50SWQoY2hhcmFjdGVyLmhhbmRsZSl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L0ZpZWxkPlxuICAgICAgICA8RmllbGQgbGFiZWw9XCJMSUZFUEFUSFwiPlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogOCB9fT5cbiAgICAgICAgICAgIDxMaWZlcGF0aEljb24gaWQ9e2xpZmVwYXRoLmlkfSAvPlxuICAgICAgICAgICAgPFZhbHVlPntsaWZlcGF0aC5uYW1lLnRvVXBwZXJDYXNlKCl9PC9WYWx1ZT5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvRmllbGQ+XG4gICAgICAgIDxGaWVsZCBsYWJlbD1cIkJPRFkgVFlQRVwiPlxuICAgICAgICAgIDxWYWx1ZT5cbiAgICAgICAgICAgIHtjaGFyYWN0ZXIuYm9keSA9PT0gMCA/IFwiRlJBTUUgQSAvLyBCUk9BRFwiIDogXCJGUkFNRSBCIC8vIFNMSUdIVFwifVxuICAgICAgICAgIDwvVmFsdWU+XG4gICAgICAgIDwvRmllbGQ+XG4gICAgICAgIDxGaWVsZCBsYWJlbD1cIlZPSUNFIFRPTkVcIj5cbiAgICAgICAgICA8VmFsdWU+e1ZPSUNFLm5hbWVzW2NoYXJhY3Rlci52b2ljZV19PC9WYWx1ZT5cbiAgICAgICAgPC9GaWVsZD5cbiAgICAgICAgPEZpZWxkIGxhYmVsPVwiRElGRklDVUxUWVwiPlxuICAgICAgICAgIDxWYWx1ZT57ZGlmZmljdWx0eS5uYW1lfTwvVmFsdWU+XG4gICAgICAgIDwvRmllbGQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHJpZ2h0OiAyMCxcbiAgICAgICAgICB0b3A6IFJVTEUsXG4gICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjQ1KVwiLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxSYWRhciBhdHRyaWJ1dGVzPXtjaGFyYWN0ZXIuYXR0cmlidXRlc30gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiBSVUxFICsgMjEwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiAyLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8QmFyY29kZSBzZWVkPXtoYXNoKGNoYXJhY3Rlci5oYW5kbGUpfSB3aWR0aD17MzAwfSBoZWlnaHQ9ezMwfSAvPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBjb2xvcjogQy5yZWQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT5cbiAgICAgICAgICB7YCR7cmVzaWRlbnRJZChjaGFyYWN0ZXIuaGFuZGxlKS5yZXBsYWNlKC8tL2csIFwiIFwiKX0gICR7aGFzaChcbiAgICAgICAgICAgIGNoYXJhY3Rlci5oYW5kbGUgKyBcIiNcIixcbiAgICAgICAgICApXG4gICAgICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgICAgICAudG9VcHBlckNhc2UoKX1gfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLlQubWljcm8sXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMzQwLFxuICAgICAgICAgIHRvcDogUlVMRSArIDIxMyxcbiAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgIGZvbnRTaXplOiA3LjUsXG4gICAgICAgICAgY29sb3I6IEMucmVkRGltLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XG4gICAgICAgICAgXCJQUk9QRVJUWSBPRiBUSEUgQ0lUWVxcbk9GIFNBQkxFLiBWT0lEIElGXFxuVEFNUEVSRUQgV0lUSC4gQ0FSUllcXG5BVCBBTEwgVElNRVMuXCJcbiAgICAgICAgfVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSBjYXJkJ3MgaGVhZDogdGhlIHJlZ2lzdHJ5IG1hcmssIHRoZSB0aXRsZSBhbmQgaXRzIHNtYWxsIHByaW50LFxuICogIGFuZCBhIGNoaXAuICovXG5mdW5jdGlvbiBIZWFkKCkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGhlaWdodDogNjAsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDkwLFxuICAgICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBcIiMzYzEyMThcIiB9LCB7IGNvbG9yOiBcIiMxYTBjMTJcIiB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjYpXCIsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PVwiMCAwIDYwIDQwXCJcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxNixcbiAgICAgICAgICB0b3A6IDEyLFxuICAgICAgICAgIHdpZHRoOiA0OCxcbiAgICAgICAgICBoZWlnaHQ6IDMyLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIHBvaW50cz17WzIsIDM4LCAxNiwgOCwgMjYsIDI2LCAzMiwgMTQsIDQwLCAyOCwgNDYsIDYsIDU4LCAzOF19XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17Qy5yZWR9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezN9XG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogNzQsXG4gICAgICAgICAgdG9wOiA4LFxuICAgICAgICAgIGZvbnRTaXplOiAyNCxcbiAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBTQUJMRSBDSVRZIFJFU0lERU5UIElEXG4gICAgICA8L3RleHQ+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLlQubWljcm8sXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogNzUsXG4gICAgICAgICAgdG9wOiAzOCxcbiAgICAgICAgICBmb250U2l6ZTogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge1xuICAgICAgICAgIFwiQ0lUSVpFTiBSRUdJU1RSWSAvLyBESVNUUklDVCAwNCAvLyBJU1NVRUQgMTAuMDcuOTFcXG5HUklEV0FUQ0ggQ0xFQVJFRCAvLyBDTEFTUyBDIC8vIFZBTElEIFVOVElMIFJFVk9LRURcIlxuICAgICAgICB9XG4gICAgICA8L3RleHQ+XG4gICAgICA8c3ZnXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMzQgMjZcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIHJpZ2h0OiAxNixcbiAgICAgICAgICB0b3A6IDE2LFxuICAgICAgICAgIHdpZHRoOiAzNCxcbiAgICAgICAgICBoZWlnaHQ6IDI2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8cmVjdFxuICAgICAgICAgIHg9ezF9XG4gICAgICAgICAgeT17MX1cbiAgICAgICAgICB3aWR0aD17MzJ9XG4gICAgICAgICAgaGVpZ2h0PXsyNH1cbiAgICAgICAgICByeD17NH1cbiAgICAgICAgICBmaWxsPVwiIzFlMmEyZVwiXG4gICAgICAgICAgc3Ryb2tlPXtDLmN5YW5EaW19XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuMn1cbiAgICAgICAgLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTEgOUgxMVYxN0gxTTMzIDlIMjNWMTdIMzNNMTEgMVYyNU0yMyAxVjI1TTExIDEzSDIzXCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtDLmN5YW5EaW19XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezF9XG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIEEgZmllbGQncyBuYW1lOiB0aW55LCBzcGFjZWQsIG1vbm8uICovXG5mdW5jdGlvbiBMYWJlbCh7XG4gIGNoaWxkcmVuLFxuICBjb2xvciA9IEMucmVkRGltLFxufToge1xuICBjaGlsZHJlbjogc3RyaW5nO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8dGV4dFxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgICBjb2xvcixcbiAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC90ZXh0PlxuICApO1xufVxuXG4vKiogQSBmaWVsZCdzIHZhbHVlOiBzZW1pYm9sZCBjeWFuLiAqL1xuZnVuY3Rpb24gVmFsdWUoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDx0ZXh0XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmb250U2l6ZTogMjEsXG4gICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvdGV4dD5cbiAgKTtcbn1cblxuLyoqIEEgbGFiZWxsZWQgZmllbGQuICovXG5mdW5jdGlvbiBGaWVsZCh7IGxhYmVsLCBjaGlsZHJlbiB9OiB7IGxhYmVsOiBzdHJpbmc7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMSB9fT5cbiAgICAgIDxMYWJlbD57bGFiZWx9PC9MYWJlbD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBBdHRyaWJ1dGVJZCwgTGlmZXBhdGggfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcbmltcG9ydCB7IEMgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcblxuLy8gVGhlIG5ldyBnYW1lJ3MgbGluZS1hcnQgZ2x5cGhzLlxuXG4vKiogVGhlIG1vdXNlIHdpdGggaXRzIHdoZWVsIGxpdDogdGhlIFNDUk9MTCBoaW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFdoZWVsSWNvbih7IGNvbG9yID0gQy5jeWFuIH06IHsgY29sb3I/OiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAyMiAyNFwiIHN0eWxlPXt7IHdpZHRoOiAyNCwgaGVpZ2h0OiAyNiB9fT5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNOCAxLjUgQzQgMS41IDEuOCA0IDEuOCA4IEwxLjggMTYgQzEuOCAyMCA0LjQgMjIuNSA4IDIyLjUgQzExLjYgMjIuNSAxNC4yIDIwIDE0LjIgMTYgTDE0LjIgOCBDMTQuMiA0IDEyIDEuNSA4IDEuNSBaXCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgLz5cbiAgICAgIDxyZWN0IHg9ezYuNn0geT17NC41fSB3aWR0aD17Mi44fSBoZWlnaHQ9ezUuNX0gZmlsbD17Y29sb3J9IC8+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e1sxOCwgMSwgMjEsIDUsIDE1LCA1XX0gZmlsbD17Y29sb3J9IC8+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e1sxOCwgMTEsIDIxLCA3LCAxNSwgN119IGZpbGw9e2NvbG9yfSAvPlxuICAgIDwvc3ZnPlxuICApO1xufVxuXG4vKiogVGhlIGJhZGdlcyBsZWZ0IG9mIHRoZSBzdGVwIHRpdGxlcyAoMzYgcHgsIGN5YW4gbGluZSBhcnQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0ZXBJY29uKHtcbiAga2luZCxcbn06IHtcbiAga2luZDpcbiAgICB8IFwiZGlmZmljdWx0eVwiXG4gICAgfCBcImxpZmVwYXRoXCJcbiAgICB8IFwiYm9keVwiXG4gICAgfCBcImFwcGVhcmFuY2VcIlxuICAgIHwgXCJhdHRyaWJ1dGVzXCJcbiAgICB8IFwic3VtbWFyeVwiO1xufSkge1xuICBjb25zdCBzID0geyBmaWxsOiBcIm5vbmVcIiwgc3Ryb2tlOiBDLmN5YW4sIHN0cm9rZVdpZHRoOiAyIH0gYXMgY29uc3Q7XG4gIGNvbnN0IHRoaW4gPSB7IGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IEMuY3lhbiwgc3Ryb2tlV2lkdGg6IDEuNCB9IGFzIGNvbnN0O1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAzNiAzNlwiIHN0eWxlPXt7IHdpZHRoOiAzNiwgaGVpZ2h0OiAzNiB9fT5cbiAgICAgIHtraW5kID09PSBcImRpZmZpY3VsdHlcIiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPHBvbHlnb24gcG9pbnRzPXtbMiwgNSwgMzQsIDUsIDE4LCAzM119IHsuLi5zfSAvPlxuICAgICAgICAgIDxwb2x5Z29uIHBvaW50cz17WzExLCAxMywgMjUsIDEzLCAxOCwgMjVdfSB7Li4udGhpbn0gLz5cbiAgICAgICAgICA8cmVjdCB4PXsxMH0geT17Ny41fSB3aWR0aD17MTZ9IGhlaWdodD17Mn0gZmlsbD17Qy5jeWFufSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7a2luZCA9PT0gXCJsaWZlcGF0aFwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgcG9pbnRzPXtbMTgsIDEsIDMzLCA5LjUsIDMzLCAyNi41LCAxOCwgMzUsIDMsIDI2LjUsIDMsIDkuNV19XG4gICAgICAgICAgICB7Li4uc31cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9e1sxOCwgMjcsIDE4LCAxOSwgMTEsIDEyXX0gey4uLnRoaW59IC8+XG4gICAgICAgICAgPGxpbmUgeDE9ezE4fSB5MT17MTl9IHgyPXsyNX0geTI9ezEyfSB7Li4udGhpbn0gLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsxOH0gY3k9ezI3fSByPXsyLjR9IGZpbGw9e0MuY3lhbn0gLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsxMX0gY3k9ezExLjV9IHI9ezIuNH0gZmlsbD17Qy5jeWFufSAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezI1fSBjeT17MTEuNX0gcj17Mi40fSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtraW5kID09PSBcImJvZHlcIiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPHJlY3QgeD17Mn0geT17Mn0gd2lkdGg9ezMyfSBoZWlnaHQ9ezMyfSByeD17M30gey4uLnN9IC8+XG4gICAgICAgICAgPGNpcmNsZSBjeD17MTh9IGN5PXs5fSByPXszfSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17WzExLCAxOCwgMTQsIDE0LCAyMiwgMTQsIDI1LCAxOF19IHsuLi50aGlufSAvPlxuICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9e1sxNSwgMTQsIDE1LCAyMiwgMTMsIDMwXX0gey4uLnRoaW59IC8+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17WzIxLCAxNCwgMjEsIDIyLCAyMywgMzBdfSB7Li4udGhpbn0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge2tpbmQgPT09IFwiYXBwZWFyYW5jZVwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cmVjdCB4PXsyfSB5PXsyfSB3aWR0aD17MzJ9IGhlaWdodD17MzJ9IHsuLi5zfSAvPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBkPVwiTTE4IDcgQzEyIDcgMTAgMTEgMTAgMTYgQzEwIDIyIDEzIDI4IDE4IDI5IEMyMyAyOCAyNiAyMiAyNiAxNiBDMjYgMTEgMjQgNyAxOCA3IFpcIlxuICAgICAgICAgICAgey4uLnRoaW59XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8bGluZVxuICAgICAgICAgICAgeDE9ezZ9XG4gICAgICAgICAgICB5MT17MTV9XG4gICAgICAgICAgICB4Mj17MzB9XG4gICAgICAgICAgICB5Mj17MTV9XG4gICAgICAgICAgICBzdHJva2U9e0MuY3lhbn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxpbmVcbiAgICAgICAgICAgIHgxPXs2fVxuICAgICAgICAgICAgeTE9ezIxfVxuICAgICAgICAgICAgeDI9ezMwfVxuICAgICAgICAgICAgeTI9ezIxfVxuICAgICAgICAgICAgc3Ryb2tlPXtDLmN5YW59XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgICAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7a2luZCA9PT0gXCJhdHRyaWJ1dGVzXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1sxOCwgMiwgMzQsIDEzLjYsIDI3LjksIDMyLjQsIDguMSwgMzIuNCwgMiwgMTMuNl19XG4gICAgICAgICAgICB7Li4uc31cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1sxOCwgOSwgMjYsIDE1LCAyMywgMjYsIDEyLCAyNSwgMTEsIDE1XX1cbiAgICAgICAgICAgIGZpbGw9e0MuY3lhbn1cbiAgICAgICAgICAgIG9wYWNpdHk9ezAuNTV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge2tpbmQgPT09IFwic3VtbWFyeVwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWdvbiBwb2ludHM9e1sxOCwgMSwgMzUsIDE4LCAxOCwgMzUsIDEsIDE4XX0gey4uLnN9IC8+XG4gICAgICAgICAgPGNpcmNsZSBjeD17MTh9IGN5PXsxOH0gcj17OH0gey4uLnRoaW59IC8+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17WzE0LCAxOCwgMTcsIDIxLCAyMywgMTRdfSB7Li4uc30gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvc3ZnPlxuICApO1xufVxuXG4vKiogRWFjaCBhdHRyaWJ1dGUncyBiYWRnZTogYSBoZXhhZ29uIHJvdW5kIGEgZ2x5cGgg4oCUIGEgZHVtYmJlbGwsIGEgY2hpcCwgYVxuICogIGJvbHQsIGEgZ2VhciwgYSBjcm9zc2hhaXIuICovXG5leHBvcnQgZnVuY3Rpb24gQXR0cmlidXRlSWNvbih7XG4gIGlkLFxuICBjb2xvciA9IEMucmVkLFxufToge1xuICBpZDogQXR0cmlidXRlSWQ7XG4gIGNvbG9yPzogc3RyaW5nO1xufSkge1xuICBjb25zdCBzID0geyBmaWxsOiBcIm5vbmVcIiwgc3Ryb2tlOiBjb2xvciwgc3Ryb2tlV2lkdGg6IDIgfSBhcyBjb25zdDtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgNDAgNDJcIiBzdHlsZT17eyB3aWR0aDogNDAsIGhlaWdodDogNDIgfX0+XG4gICAgICA8cG9seWdvblxuICAgICAgICBwb2ludHM9e1syMCwgMiwgMzcsIDExLjUsIDM3LCAzMC41LCAyMCwgNDAsIDMsIDMwLjUsIDMsIDExLjVdfVxuICAgICAgICB7Li4uc31cbiAgICAgIC8+XG4gICAgICB7aWQgPT09IFwiYm9keVwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cmVjdCB4PXsxMX0geT17MTkuNX0gd2lkdGg9ezE4fSBoZWlnaHQ9ezN9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgICAgIDxyZWN0IHg9ezl9IHk9ezE0fSB3aWR0aD17NH0gaGVpZ2h0PXsxNH0gZmlsbD17Y29sb3J9IC8+XG4gICAgICAgICAgPHJlY3QgeD17Mjd9IHk9ezE0fSB3aWR0aD17NH0gaGVpZ2h0PXsxNH0gZmlsbD17Y29sb3J9IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtpZCA9PT0gXCJpbnRlbGxpZ2VuY2VcIiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPHJlY3QgeD17MTN9IHk9ezE0fSB3aWR0aD17MTR9IGhlaWdodD17MTR9IHsuLi5zfSBzdHJva2VXaWR0aD17MS42fSAvPlxuICAgICAgICAgIDxyZWN0IHg9ezE3LjV9IHk9ezE4LjV9IHdpZHRoPXs1fSBoZWlnaHQ9ezV9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBkPVwiTTE2IDExVjE0TTIwIDExVjE0TTI0IDExVjE0TTE2IDI4VjMxTTIwIDI4VjMxTTI0IDI4VjMxTTEwIDE3SDEzTTEwIDIxSDEzTTEwIDI1SDEzTTI3IDE3SDMwTTI3IDIxSDMwTTI3IDI1SDMwXCJcbiAgICAgICAgICAgIHsuLi5zfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuMn1cbiAgICAgICAgICAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7aWQgPT09IFwicmVmbGV4ZXNcIiAmJiAoXG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXtbMjIsIDksIDEzLCAyMywgMTksIDIzLCAxNywgMzMsIDI3LCAxOCwgMjEsIDE4XX1cbiAgICAgICAgICBmaWxsPXtjb2xvcn1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7aWQgPT09IFwidGVjaFwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgcG9pbnRzPXtbXG4gICAgICAgICAgICAgIDE3LCAxMCwgMjMsIDEwLCAyNCwgMTQsIDI4LCAxMiwgMzEsIDE3LCAyNywgMjAsIDMxLCAyNSwgMjgsIDMwLFxuICAgICAgICAgICAgICAyNCwgMjgsIDIzLCAzMiwgMTcsIDMyLCAxNiwgMjgsIDEyLCAzMCwgOSwgMjUsIDEzLCAyMSwgOSwgMTcsIDEyLFxuICAgICAgICAgICAgICAxMiwgMTYsIDE0LFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIHsuLi5zfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNH1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezIwfSBjeT17MjF9IHI9ezR9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7aWQgPT09IFwiY29vbFwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsyMH0gY3k9ezIxfSByPXs4fSB7Li4uc30gc3Ryb2tlV2lkdGg9ezEuNn0gLz5cbiAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgZD1cIk0yMCA5VjE2TTIwIDI2VjMzTTggMjFIMTVNMjUgMjFIMzJcIlxuICAgICAgICAgICAgey4uLnN9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGNpcmNsZSBjeD17MjB9IGN5PXsyMX0gcj17MS44fSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvc3ZnPlxuICApO1xufVxuXG4vKiogQSBzbWFsbCBnbHlwaCBwZXIgbGlmZXBhdGg6IGEgbWVzYSBhbmQgYSBzdW4sIGEgc2t5bGluZSwgYSB0b3dlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMaWZlcGF0aEljb24oe1xuICBpZCxcbiAgY29sb3IgPSBDLmN5YW4sXG59OiB7XG4gIGlkOiBMaWZlcGF0aDtcbiAgY29sb3I/OiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IHMgPSB7IGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IGNvbG9yLCBzdHJva2VXaWR0aDogMS42IH0gYXMgY29uc3Q7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgc3R5bGU9e3sgd2lkdGg6IDIyLCBoZWlnaHQ6IDIyIH19PlxuICAgICAgPHJlY3QgeD17MX0geT17MX0gd2lkdGg9ezIyfSBoZWlnaHQ9ezIyfSB7Li4uc30gc3Ryb2tlV2lkdGg9ezF9IC8+XG4gICAgICB7aWQgPT09IFwibm9tYWRcIiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17WzMsIDE5LCA5LCAxMCwgMTMsIDE1LCAxNiwgMTEsIDIxLCAxOV19IHsuLi5zfSAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezE2fSBjeT17Nn0gcj17Mi4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge2lkID09PSBcInN0cmVldGtpZFwiICYmIChcbiAgICAgICAgPHBhdGggZD1cIk0zIDIxVjEySDdWOEgxMVYxNEgxNFY1SDE4VjExSDIxVjIxXCIgey4uLnN9IC8+XG4gICAgICApfVxuICAgICAge2lkID09PSBcImNvcnBvXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxwb2x5Z29uIHBvaW50cz17WzksIDIxLCAxMCwgNywgMTIsIDMsIDE0LCA3LCAxNSwgMjFdfSB7Li4uc30gLz5cbiAgICAgICAgICA8bGluZSB4MT17NH0geTE9ezIxfSB4Mj17MjB9IHkyPXsyMX0gey4uLnN9IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuLyoqIFRoZSBncmlkIGJ1dHRvbidzIGdseXBoOiB0d28gcm93cyBvZiB0aHJlZSBjZWxscy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHcmlkSWNvbigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjYgMjBcIiBzdHlsZT17eyB3aWR0aDogMjYsIGhlaWdodDogMjAgfX0+XG4gICAgICB7WzAsIDFdLmZsYXRNYXAoKHIpID0+XG4gICAgICAgIFswLCAxLCAyXS5tYXAoKGMpID0+IChcbiAgICAgICAgICA8cmVjdFxuICAgICAgICAgICAga2V5PXtgJHtyfSR7Y31gfVxuICAgICAgICAgICAgeD17MSArIGMgKiA5fVxuICAgICAgICAgICAgeT17MSArIHIgKiAxMH1cbiAgICAgICAgICAgIHdpZHRoPXs2fVxuICAgICAgICAgICAgaGVpZ2h0PXs4fVxuICAgICAgICAgICAgcng9ezF9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e0MuY3lhbn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjR9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSksXG4gICAgICApfVxuICAgIDwvc3ZnPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBDLCBGLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBMZWdhbEZvb3RlciwgUHJvdG9jb2xTdGFtcCwgcm5nIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBLZXljYXAgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5cbi8qKiBUaGUgbGl0IHJlZCBvZiBob3ZlcmVkIGZyYW1lcy4gKi9cbmNvbnN0IEhPVCA9IFwiI2ZmNWY1NlwiO1xuLyoqIFdoYXQgc2l0cyBiZWhpbmQgdGhlIGNhcmRzOiBtYXNrcyBjdXQgdGhlaXIgY29udGVudCdzIGNvcm5lcnMgd2l0aCBpdC4gKi9cbmNvbnN0IEJHID0gXCIjMGEwZDEzXCI7XG5cbi8qKiBUaGUgZnVybml0dXJlIG9mIHN0ZXBzIDItNjogdGhlIHByb3RvY29sIHN0YW1wIHRvcCBsZWZ0LCB0aGUgcmVzaWRlbnRcbiAqICBkYXRhYmFzZSdzIHByaW50IGJvdHRvbSBsZWZ0LCBhIHJlZmVyZW5jZSB0YWcgYm90dG9tIGNlbnRlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDaHJvbWUoKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxQcm90b2NvbFN0YW1wIC8+XG4gICAgICA8TGVnYWxGb290ZXIgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogODE1LFxuICAgICAgICAgIGJvdHRvbTogMjIsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogNixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDEwIH19PlxuICAgICAgICAgIFNCTCAwNDQgQ0tDIDE1MSBDQzEwIEE1NVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAzMCA4XCIgc3R5bGU9e3sgd2lkdGg6IDMwLCBoZWlnaHQ6IDggfX0+XG4gICAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICAgIHBvaW50cz17WzAsIDQsIDksIDAsIDksIDMsIDMwLCAzLCAzMCwgNSwgOSwgNSwgOSwgOF19XG4gICAgICAgICAgICBmaWxsPXtDLnJlZH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIDwvbm9kZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIEEgZ3JhZGllbnQgdGhhdCBwYWludHMgdGhlIGBjdXRgIHB4IGJvdHRvbS1yaWdodCBjb3JuZXIgb2YgaXRzIG5vZGUgaW5cbiAqICBgY29sb3JgIChhbmQgYSBgbGluZWAgYmFuZCBhbG9uZyB0aGUgY3V0KTogaG93IGEgcmVjdGFuZ3VsYXIgYDxwb3J0YWw+YFxuICogIGdldHMgYSBjdXQgY29ybmVyLiAqL1xuZnVuY3Rpb24gY29ybmVyTWFzayhjdXQ6IG51bWJlciwgbGluZT86IHN0cmluZywgY29sb3IgPSBCRyk6IEJldnlTdHlsZSB7XG4gIGNvbnN0IGQgPSBjdXQgLyBNYXRoLlNRUlQyO1xuICBjb25zdCBjbGVhciA9IEMuY2xlYXI7XG4gIHJldHVybiB7XG4gICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgYW5nbGU6IDMxNSxcbiAgICAgIHN0b3BzOiBsaW5lXG4gICAgICAgID8gW1xuICAgICAgICAgICAgeyBjb2xvciwgcG9zaXRpb246IGQgLSAwLjMgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IGxpbmUsIHBvc2l0aW9uOiBkICsgMC4zIH0sXG4gICAgICAgICAgICB7IGNvbG9yOiBsaW5lLCBwb3NpdGlvbjogZCArIDIuNiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogY2xlYXIsIHBvc2l0aW9uOiBkICsgMy4yIH0sXG4gICAgICAgICAgXVxuICAgICAgICA6IFtcbiAgICAgICAgICAgIHsgY29sb3IsIHBvc2l0aW9uOiBkIH0sXG4gICAgICAgICAgICB7IGNvbG9yOiBjbGVhciwgcG9zaXRpb246IGQgKyAwLjYgfSxcbiAgICAgICAgICBdLFxuICAgIH0sXG4gIH07XG59XG5cbmNvbnN0IGFicyA9IChzOiBCZXZ5U3R5bGUpOiBCZXZ5U3R5bGUgPT4gKHsgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIC4uLnMgfSk7XG5cbi8qKiBUaGUgbGl0IGZyYW1lIG9mIHRoZSBob3ZlcmVkIGNhcmQsIGxhaWQgb3ZlciBpdHMgY29udGVudCBib3g6IHJlZCBydWxlc1xuICogIHJvdW5kIGl0LCBhIHN0ZXAgb3V0IGRvd24gdGhlIGxlZnQgZWRnZSwgYSB0aGljayBiYXIgb3V0c2lkZSB0aGUgcmlnaHRcbiAqICBlZGdlIHdpdGggaXRzIGZvb3QgY3V0IGF0IDQ1wrAgKGBjdXRgIOKJpSBgYmFyYCBhbHNvIGN1dHMgdGhlIGNvbnRlbnQnc1xuICogIGNvcm5lciksIGFsbCBnbG93aW5nLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhvdEZyYW1lKHtcbiAgYmFyID0gMjIsXG4gIGN1dCA9IDIyLFxuICBzdGVwID0gOTYsXG59OiB7XG4gIGJhcj86IG51bWJlcjtcbiAgY3V0PzogbnVtYmVyO1xuICBzdGVwPzogbnVtYmVyO1xufSkge1xuICAvLyBUaGUgY3V0IHJ1bnMgZnJvbSB0aGUgb3ZlcmxheSdzIG91dGVyIGNvcm5lciAoYGJhcmAgcmlnaHQgb2YgdGhlXG4gIC8vIGNvbnRlbnQsIDQgcHggdW5kZXIgaXQpOiB3aGF0J3MgbGVmdCBvZiBpdCBjdXRzIHRoZSBjb250ZW50J3MgY29ybmVyLlxuICBjb25zdCBpbm5lciA9IE1hdGgubWF4KDAsIGN1dCAtIGJhciAtIDQpO1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7LyogVGhlIGNvcm5lciBnb2VzIHVuZGVyIHRoZSBnbG93OyBpdHMgZWRnZSBnbG93cyB3aXRoIHRoZSByZXN0LiAqL31cbiAgICAgIHtpbm5lciA+IDAgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgLi4uY29ybmVyTWFzayhpbm5lciksXG4gICAgICAgICAgfSl9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5hYnMoeyBsZWZ0OiAtOCwgdG9wOiAtNCwgcmlnaHQ6IC1iYXIsIGJvdHRvbTogLTQgfSksXG4gICAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICBuYW1lOiBcInNoYWRvd1wiLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LCA2MCwgNTIsIDAuNzUpXCIsXG4gICAgICAgICAgICAgIG9mZnNldFg6IDAsXG4gICAgICAgICAgICAgIG9mZnNldFk6IDAsXG4gICAgICAgICAgICAgIHNwcmVhZDogMTQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtpbm5lciA+IDAgJiYgKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICAgICAgbGVmdDogOCxcbiAgICAgICAgICAgICAgdG9wOiA0LFxuICAgICAgICAgICAgICByaWdodDogYmFyLFxuICAgICAgICAgICAgICBib3R0b206IDQsXG4gICAgICAgICAgICAgIC4uLmNvcm5lck1hc2soaW5uZXIsIEhPVCwgQy5jbGVhciksXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgICAgbGVmdDogNSxcbiAgICAgICAgICAgIHJpZ2h0OiBiYXIsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDQsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEhPVCxcbiAgICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICAgIGxlZnQ6IDUsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICB3aWR0aDogMyxcbiAgICAgICAgICAgIGhlaWdodDogc3RlcCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogSE9ULFxuICAgICAgICAgIH0pfVxuICAgICAgICAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHRvcDogc3RlcCxcbiAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgLi4uY2hhbWZlcihIT1QsIDgsIHVuZGVmaW5lZCwgMSwgXCJibFwiKSxcbiAgICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICAgIGxlZnQ6IDgsXG4gICAgICAgICAgICByaWdodDogYmFyICsgaW5uZXIsXG4gICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDQsXG4gICAgICAgICAgICAuLi4oaW5uZXIgPiAwXG4gICAgICAgICAgICAgID8gY2hhbWZlcihIT1QsIDQsIHVuZGVmaW5lZCwgMSwgXCJiclwiKVxuICAgICAgICAgICAgICA6IHsgYmFja2dyb3VuZENvbG9yOiBIT1QgfSksXG4gICAgICAgICAgfSl9XG4gICAgICAgIC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e2Ficyh7XG4gICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgIHdpZHRoOiBiYXIsXG4gICAgICAgICAgICAuLi5jaGFtZmVyKEhPVCwgY3V0LCB1bmRlZmluZWQsIDEsIFwiYnJcIiksXG4gICAgICAgICAgfSl9XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBBIGNhcmQgYXQgcmVzdDogYSBoYWlybGluZSBmcmFtZSwgaXRzIGNvcm5lciBjdXQsIGEgdGljayBvbiBpdHMgZm9vdFxuICogIGB0aWNrYCBweCBmcm9tIGl0cyBsZWZ0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbGRGcmFtZSh7XG4gIGN1dCA9IDMwLFxuICB0aWNrID0gMTg2LFxuICBsaW5lID0gXCIjYTMzMzJiXCIsXG59OiB7XG4gIGN1dD86IG51bWJlcjtcbiAgdGljaz86IG51bWJlcjtcbiAgbGluZT86IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e2Ficyh7XG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgIC4uLmNvcm5lck1hc2soY3V0KSxcbiAgICAgICAgfSl9XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e2Ficyh7XG4gICAgICAgICAgbGVmdDogLTEsXG4gICAgICAgICAgdG9wOiAtMSxcbiAgICAgICAgICByaWdodDogLTEsXG4gICAgICAgICAgYm90dG9tOiAtMSxcbiAgICAgICAgICAuLi5jaGFtZmVyKEMuY2xlYXIsIGN1dCArIDEsIGxpbmUsIDEpLFxuICAgICAgICB9KX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICBsZWZ0OiB0aWNrLFxuICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICB3aWR0aDogNixcbiAgICAgICAgICBoZWlnaHQ6IDU0LFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogbGluZSxcbiAgICAgICAgfSl9XG4gICAgICAvPlxuICAgIDwvPlxuICApO1xufVxuXG4vKiogQSBiYXJjb2RlIGB3aWR0aGAgw5cgYGhlaWdodGAsIGl0cyBiYXJzIHJvbGxlZCBmcm9tIGBzZWVkYCAob25lIHBhdGgpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJhcmNvZGUoe1xuICBzZWVkLFxuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICBjb2xvciA9IEMucmVkLFxufToge1xuICBzZWVkOiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgY29uc3QgciA9IHJuZyhzZWVkKTtcbiAgbGV0IGQgPSBcIlwiO1xuICBmb3IgKGxldCB4ID0gMDsgeCA8IHdpZHRoIC0gMTsgKSB7XG4gICAgY29uc3QgdyA9IDEgKyBNYXRoLmZsb29yKHIoKSAqIDMpO1xuICAgIGlmIChyKCkgPiAwLjM1KSBkICs9IGBNJHt4fSAwaCR7d312JHtoZWlnaHR9aCR7LXd9WmA7XG4gICAgeCArPSB3ICsgMTtcbiAgfVxuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD17YDAgMCAke3dpZHRofSAke2hlaWdodH1gfSBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0IH19PlxuICAgICAgPHBhdGggZD17ZH0gZmlsbD17Y29sb3J9IC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBcIk1JTiBMRVZFTFwiIC8gXCJNQVggTEVWRUxcIjogYSBzbWFsbCBvdXRsaW5lZCB0YWcuICovXG5leHBvcnQgZnVuY3Rpb24gTGV2ZWxCYWRnZSh7IGxhYmVsIH06IHsgbGFiZWw6IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGhlaWdodDogMjQsXG4gICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkLFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDYgfSxcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjMmEwZDEwXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2xhYmVsfVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEJBQ0sgW0VTQ10gLyBORVhUIFtGXSwgYm90dG9tIHJpZ2h0OiB0d28gZGFyayByZWQgcGxhdGVzIGN1dCBhdCB0aGVpclxuICogIG91dGVyIGZlZXQsIGpvaW5lZCBieSBhIHNob3J0IHJ1bGUuICovXG5leHBvcnQgZnVuY3Rpb24gTmF2QnV0dG9ucyh7XG4gIG9uQmFjayxcbiAgb25OZXh0LFxuICBuZXh0ID0gXCJORVhUXCIsXG59OiB7XG4gIG9uQmFjazogKCkgPT4gdm9pZDtcbiAgb25OZXh0OiAoKSA9PiB2b2lkO1xuICBuZXh0Pzogc3RyaW5nO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgcmlnaHQ6IDE2NSxcbiAgICAgICAgdG9wOiA5MDYsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogNixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPE5hdkJ1dHRvbiBrPVwiRVNDXCIgbGFiZWw9XCJCQUNLXCIgY29ybmVyPVwiYmxcIiBvbkNsaWNrPXtvbkJhY2t9IC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICBsZWZ0OiAyMTQsXG4gICAgICAgICAgdG9wOiAyOCxcbiAgICAgICAgICB3aWR0aDogNDYsXG4gICAgICAgICAgaGVpZ2h0OiAzLFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjQ1KVwiLFxuICAgICAgICB9KX1cbiAgICAgIC8+XG4gICAgICA8TmF2QnV0dG9uIGs9XCJGXCIgbGFiZWw9e25leHR9IGNvcm5lcj1cImJyXCIgb25DbGljaz17b25OZXh0fSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gTmF2QnV0dG9uKHtcbiAgayxcbiAgbGFiZWwsXG4gIGNvcm5lcixcbiAgb25DbGljayxcbn06IHtcbiAgazogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xuICBjb3JuZXI6IFwiYmxcIiB8IFwiYnJcIjtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uY2hhbWZlcihcIiMyYTBiMGVcIiwgMTgsIFwicmdiYSgyNTUsIDkzLCA4MSwgMC41KVwiLCAxLCBjb3JuZXIpLFxuICAgICAgICB3aWR0aDogMjQwLFxuICAgICAgICBoZWlnaHQ6IDU4LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiAxMCxcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXtjaGFtZmVyKFwiIzRhMTQxYVwiLCAxOCwgQy5yZWQsIDEsIGNvcm5lcil9XG4gICAgPlxuICAgICAgPEtleWNhcCBrPXtrfSAvPlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5tZW51LCBmb250U2l6ZTogMjYgfX0+e2xhYmVsfTwvdGV4dD5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIEEgaGludCB3aXRoIGl0cyBvd24gZ2x5cGggKHRoZSBraXQncyBgSGludGAgdGFrZXMga2V5cyBhbmQgdGhlIG1vdXNlKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJY29uSGludCh7IGljb24sIGxhYmVsIH06IHsgaWNvbjogUmVhY3ROb2RlOyBsYWJlbDogc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX0+XG4gICAgICB7aWNvbn1cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyNSwgY29sb3I6IEMucmVkLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+XG4gICAgICAgIHtsYWJlbH1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgQyB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuXG4vKiogVGhlIGZhY2UncyBjZW50ZXIgbGluZSBpbiB0aGUgcG9ydHJhaXQncyAyMDAgw5cgMjUwIGRyYXdpbmcuICovXG5leHBvcnQgY29uc3QgQ1ggPSAxMDA7XG5leHBvcnQgdHlwZSBQdCA9IG51bWJlcltdO1xuLyoqIEZsYXQgcG9pbnRzIHdpdGggeCBtZWFzdXJlZCBmcm9tIHRoZSBjZW50ZXIgbGluZSAoYHMgPSAtMWAgbWlycm9ycykuICovXG5leHBvcnQgY29uc3QgYXQgPSAoYTogbnVtYmVyW10sIHMgPSAxKSA9PlxuICBhLm1hcCgodiwgaSkgPT4gKGkgJSAyID8gdiA6IENYICsgcyAqIHYpKTtcblxuY29uc3QgU0NBUiA9IFwiI2YwYTM5YVwiO1xuY29uc3QgTUVUQUwgPSBcIiNkOGRlZTRcIjtcblxuLyoqIFdoYXQgYSBsb29rIGFkZHMgdG8gdGhlIHBvcnRyYWl0J3MgZmFjZTogbWFrZXVwLCBpbmssIHNjYXJzLCBjaHJvbWVcbiAqICBhbmQgbWV0YWwgKGVhY2ggb3B0aW9uJ3MgdmFyaWFudHMsIGluIHRoZSBwb3J0cmFpdCdzIDIwMCDDlyAyNTAgdW5pdHMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1hcmtzKHtcbiAgdixcbiAgaGVhZCxcbiAgaW5rLFxuICBub3NlWSxcbiAgZWFyLFxuICBtb3V0aDogW21vdXRoVywgc21pbGVdLFxufToge1xuICB2OiAoaWQ6IHN0cmluZykgPT4gbnVtYmVyO1xuICBoZWFkOiBQdFtdO1xuICBpbms6IHN0cmluZztcbiAgbm9zZVk6IG51bWJlcjtcbiAgZWFyOiBudW1iZXI7XG4gIG1vdXRoOiBudW1iZXJbXTtcbn0pIHtcbiAgY29uc3QgbGluZSA9IChjb2xvcjogc3RyaW5nLCB3ID0gMS4yKSA9PlxuICAgICh7IGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IGNvbG9yLCBzdHJva2VXaWR0aDogdyB9KSBhcyBjb25zdDtcbiAgY29uc3QgbWFrZXVwID0gdihcIm1ha2V1cFwiKTtcbiAgY29uc3QgdGF0dG9vID0gdihcInRhdHRvb3NcIik7XG4gIGNvbnN0IHNjYXJzID0gdihcInNjYXJzXCIpO1xuICBjb25zdCBjeWJlciA9IHYoXCJjeWJlcndhcmVcIik7XG4gIGNvbnN0IG1ldGFsID0gdihcInBpZXJjaW5nc1wiKTtcbiAgY29uc3QgbGlwcyA9XG4gICAgbWFrZXVwID09PSAxID8gXCIjM2EwZDE4XCIgOiBtYWtldXAgPT09IDIgfHwgbWFrZXVwID09PSA1ID8gXCIjZmYzZDhiXCIgOiBudWxsO1xuICBjb25zdCBjaHJvbWUgPSAobjogbnVtYmVyKSA9PiBjeWJlciA9PT0gbiB8fCBjeWJlciA9PT0gNztcbiAgY29uc3QgcGllcmNlZCA9IChuOiBudW1iZXIpID0+IG1ldGFsID09PSBuIHx8IG1ldGFsID09PSA1O1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7bGlwcyAmJiAoXG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXthdChbXG4gICAgICAgICAgICAtbW91dGhXLFxuICAgICAgICAgICAgMTM0IC0gc21pbGUsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMTMxLjUsXG4gICAgICAgICAgICBtb3V0aFcsXG4gICAgICAgICAgICAxMzQgLSBzbWlsZSxcbiAgICAgICAgICAgIG1vdXRoVyAqIDAuNixcbiAgICAgICAgICAgIDEzOC41LFxuICAgICAgICAgICAgLW1vdXRoVyAqIDAuNixcbiAgICAgICAgICAgIDEzOC41LFxuICAgICAgICAgIF0pfVxuICAgICAgICAgIGZpbGw9e2xpcHN9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgeyhtYWtldXAgPT09IDMgfHwgbWFrZXVwID09PSA1KSAmJlxuICAgICAgICBbMSwgLTFdLm1hcCgocykgPT4gKFxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAga2V5PXtzfVxuICAgICAgICAgICAgcG9pbnRzPXthdChbMjYsIDk2LCAzMiwgOTJdLCBzKX1cbiAgICAgICAgICAgIHsuLi5saW5lKFwiIzEyMDYwOFwiLCAxLjQpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAge21ha2V1cCA9PT0gNCAmJlxuICAgICAgICBbMSwgLTFdLm1hcCgocykgPT4gKFxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAga2V5PXtzfVxuICAgICAgICAgICAgcG9pbnRzPXthdChbMTQsIDEwNiwgMjgsIDEwNl0sIHMpfVxuICAgICAgICAgICAgey4uLmxpbmUoQy5jeWFuLCAxLjYpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAge3RhdHRvbyA9PT0gMSAmJiAoXG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXthdChbLTE0LCAxNjYsIC0xMSwgMTc0LCAtMTgsIDE2OSwgLTEwLCAxNjksIC0xNywgMTc0XSl9XG4gICAgICAgICAgZmlsbD17aW5rfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHt0YXR0b28gPT09IDIgJiYgKFxuICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICBwb2ludHM9e2F0KFsyNCwgMTA0LCAzMiwgMTEwLCAyNiwgMTE2LCAzNCwgMTIyLCAyOCwgMTI4XSl9XG4gICAgICAgICAgey4uLmxpbmUoaW5rLCAxLjQpfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHt0YXR0b28gPT09IDMgJiYgKFxuICAgICAgICA8cG9seWdvbiBwb2ludHM9e2F0KFswLCA2MiwgNSwgNzEsIC01LCA3MV0pfSB7Li4ubGluZShpbmspfSAvPlxuICAgICAgKX1cbiAgICAgIHt0YXR0b28gPT09IDQgJiZcbiAgICAgICAgWzAsIDEsIDJdLm1hcCgoaSkgPT4gKFxuICAgICAgICAgIDxjaXJjbGUga2V5PXtpfSBjeD17Q1ggLSAxMyAtIGkgKiA0fSBjeT17MTA0fSByPXsxfSBmaWxsPXtpbmt9IC8+XG4gICAgICAgICkpfVxuICAgICAge3RhdHRvbyA9PT0gNSAmJlxuICAgICAgICBbMCwgMSwgMiwgMywgNF0ubWFwKChpKSA9PiAoXG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICBwb2ludHM9e2F0KFs2ICsgaSAqIDIuMiwgMTY0LCA2ICsgaSAqIDIuMiwgMTc4XSl9XG4gICAgICAgICAgICB7Li4ubGluZShpbmssIGkgJSAyID8gMC43IDogMS4zKX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIHt0YXR0b28gPT09IDYgJiZcbiAgICAgICAgWy0zLCAzXS5tYXAoKHgpID0+IChcbiAgICAgICAgICA8cG9seWxpbmUga2V5PXt4fSBwb2ludHM9e2F0KFt4LCAxNDMsIHgsIDE1M10pfSB7Li4ubGluZShpbmspfSAvPlxuICAgICAgICApKX1cbiAgICAgIHt0YXR0b28gPT09IDcgJiZcbiAgICAgICAgWzEsIC0xXS5tYXAoKHMpID0+IChcbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIGtleT17c31cbiAgICAgICAgICAgIHBvaW50cz17YXQoWzM2LCA2NiwgNDIsIDc0LCAzOCwgODRdLCBzKX1cbiAgICAgICAgICAgIHsuLi5saW5lKGluaywgMS4zKX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIHsoc2NhcnMgPT09IDEgfHwgc2NhcnMgPT09IDUpICYmIChcbiAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17YXQoWzksIDgwLCAyNSwgOTldKX0gey4uLmxpbmUoU0NBUil9IC8+XG4gICAgICApfVxuICAgICAge3NjYXJzID09PSAyICYmIChcbiAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17YXQoWy0zNiwgMTA2LCAtMjgsIDExNCwgLTIyLCAxMjRdKX0gey4uLmxpbmUoU0NBUil9IC8+XG4gICAgICApfVxuICAgICAge3NjYXJzID09PSAzICYmIChcbiAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17YXQoWzQsIDEyNywgOCwgMTQxXSl9IHsuLi5saW5lKFNDQVIpfSAvPlxuICAgICAgKX1cbiAgICAgIHtzY2FycyA9PT0gNCAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17YXQoWy0xNiwgNjQsIC02LCA3NF0pfSB7Li4ubGluZShTQ0FSKX0gLz5cbiAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXthdChbLTYsIDY0LCAtMTYsIDc0XSl9IHsuLi5saW5lKFNDQVIpfSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7Y2hyb21lKDEpICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIHBvaW50cz17YXQoWzMwLCA2NCwgMzYsIDc4LCAzMCwgOTIsIDMwLCAxMDBdKX1cbiAgICAgICAgICAgIHsuLi5saW5lKEMuY3lhbil9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXtDWCArIDMwfSBjeT17MTAyfSByPXsxLjh9IGZpbGw9e0MuY3lhbn0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge2Nocm9tZSgyKSAmJiAoXG4gICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgIHBvaW50cz17aGVhZFxuICAgICAgICAgICAgLmZpbHRlcigoWywgeV0pID0+IHkgPiAxMDYpXG4gICAgICAgICAgICAuZmxhdE1hcCgoW3gsIHldKSA9PiBbQ1ggLSB4ICogMC44NiwgeSAtIDNdKX1cbiAgICAgICAgICB7Li4ubGluZShDLmN5YW4sIDEuMSl9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge2Nocm9tZSgzKSAmJiA8Y2lyY2xlIGN4PXtDWCArIDE3LjV9IGN5PXs5Nn0gcj17OX0gey4uLmxpbmUoQy5jeWFuKX0gLz59XG4gICAgICB7Y3liZXIgPT09IDQgJiZcbiAgICAgICAgWy0xMiwgLTIsIDhdLm1hcCgoeCkgPT4gKFxuICAgICAgICAgIDxyZWN0IGtleT17eH0geD17Q1ggKyB4fSB5PXs2M30gd2lkdGg9ezV9IGhlaWdodD17M30gZmlsbD17Qy5jeWFufSAvPlxuICAgICAgICApKX1cbiAgICAgIHtjeWJlciA9PT0gNSAmJlxuICAgICAgICBbMCwgNSwgMTBdLm1hcCgoZCkgPT4gKFxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAga2V5PXtkfVxuICAgICAgICAgICAgcG9pbnRzPXthdChbLTM4ICsgZCwgMTA0LCAtMzAgKyBkLCAxMThdKX1cbiAgICAgICAgICAgIHsuLi5saW5lKEMuY3lhbiwgMSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICB7Y2hyb21lKDYpICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXtDWCAtIDl9IGN5PXsxNzJ9IHI9ezIuNn0gey4uLmxpbmUoQy5jeWFuLCAxKX0gLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXtDWCArIDl9IGN5PXsxNzJ9IHI9ezIuNn0gey4uLmxpbmUoQy5jeWFuLCAxKX0gLz5cbiAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXthdChbLTYsIDE3MiwgNiwgMTcyXSl9IHsuLi5saW5lKEMuY3lhbiwgMSl9IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtwaWVyY2VkKDEpICYmXG4gICAgICAgIFsxLCAtMV0ubWFwKChzKSA9PiAoXG4gICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAga2V5PXtzfVxuICAgICAgICAgICAgY3g9e0NYICsgcyAqICg0NiArIDYgKiBlYXIpfVxuICAgICAgICAgICAgY3k9ezEwNn1cbiAgICAgICAgICAgIHI9ezEuNn1cbiAgICAgICAgICAgIGZpbGw9e01FVEFMfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAge3BpZXJjZWQoMikgJiYgKFxuICAgICAgICA8Y2lyY2xlIGN4PXtDWCArIDI1fSBjeT17ODZ9IHI9ezIuNH0gey4uLmxpbmUoTUVUQUwsIDAuOSl9IC8+XG4gICAgICApfVxuICAgICAge3BpZXJjZWQoMykgJiYgKFxuICAgICAgICA8Y2lyY2xlIGN4PXtDWCArIDR9IGN5PXtub3NlWSArIDN9IHI9ezIuNH0gey4uLmxpbmUoTUVUQUwsIDAuOSl9IC8+XG4gICAgICApfVxuICAgICAge3BpZXJjZWQoNCkgJiYgKFxuICAgICAgICA8Y2lyY2xlIGN4PXtDWCArIDZ9IGN5PXsxNDB9IHI9ezIuNH0gey4uLmxpbmUoTUVUQUwsIDAuOSl9IC8+XG4gICAgICApfVxuICAgIDwvPlxuICApO1xufVxuIiwgImltcG9ydCB7IEMgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IHJuZyB9IGZyb20gXCIuLi8uLi91aS9kZWNvclwiO1xuaW1wb3J0IHsgRVlFX0NPTE9SUywgSEFJUl9DT0xPUlMsIFNLSU5fVE9ORVMgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBDWCwgTWFya3MsIGF0LCB0eXBlIFB0IH0gZnJvbSBcIi4vTWFya3NcIjtcblxuLyoqIGBhYCBtaXhlZCB0b3dhcmQgYGJgIGJ5IGB0YCAoaGV4IGNvbG9ycykuICovXG5mdW5jdGlvbiBtaXgoYTogc3RyaW5nLCBiOiBzdHJpbmcsIHQ6IG51bWJlcikge1xuICBjb25zdCBwID0gKGg6IHN0cmluZywgaTogbnVtYmVyKSA9PlxuICAgIHBhcnNlSW50KGguc2xpY2UoMSArIGkgKiAyLCAzICsgaSAqIDIpLCAxNik7XG4gIGNvbnN0IGMgPSBbMCwgMSwgMl0ubWFwKChpKSA9PiBNYXRoLnJvdW5kKHAoYSwgaSkgKyAocChiLCBpKSAtIHAoYSwgaSkpICogdCkpO1xuICByZXR1cm4gYCMke2MubWFwKCh2KSA9PiB2LnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCBcIjBcIikpLmpvaW4oXCJcIil9YDtcbn1cblxuLyoqIGBbeDAsIHkwLCB4MSwgeTEsIOKApl1gIOKGkiBwb2ludHMuICovXG5jb25zdCBwdHMgPSAoYTogbnVtYmVyW10pOiBQdFtdID0+XG4gIEFycmF5LmZyb20oeyBsZW5ndGg6IGEubGVuZ3RoIC8gMiB9LCAoXywgaSkgPT4gW2FbMiAqIGldLCBhWzIgKiBpICsgMV1dKTtcbmNvbnN0IGZsYXQgPSAocDogUHRbXSwgcyA9IDEpID0+IGF0KHAuZmxhdCgpLCBzKTtcblxuLyoqIFRoZSByaWdodCBoYWxmIG9mIHRoZSBoZWFkLCB0b3Agb2YgdGhlIHNrdWxsIHRvIHRoZSBjaGluLiAqL1xuY29uc3QgSEVBRCA9IHB0cyhbXG4gIDAsIDM4LCAxNiwgMzksIDI5LCA0NCwgMzgsIDUyLCA0MywgNjIsIDQ1LCA3NCwgNDUsIDg4LCA0NCwgMTAwLCA0MiwgMTEwLCAzOCxcbiAgMTIyLCAzMywgMTMyLCAyNiwgMTQyLCAxOCwgMTUwLCA5LCAxNTUsIDAsIDE1Nyxcbl0pO1xuLyoqIFRoZSByaWdodCBoYWxmIG9mIHRoZSBuZWNrIGFuZCBzaG91bGRlciBsaW5lLCBwZXIgYnVpbGQuICovXG5jb25zdCBTSE9VTERFUlMgPSBbXG4gIHB0cyhbMjAsIDE0MCwgMjIsIDE4NCwgNDYsIDE5NSwgNzgsIDIwMywgOTQsIDIxNiwgOTksIDI1MF0pLFxuICBwdHMoWzE3LCAxNDAsIDE5LCAxODgsIDM4LCAxOTcsIDY0LCAyMDQsIDgwLCAyMTYsIDg2LCAyNTBdKSxcbl07XG4vLyBQZXIgdmFyaWFudDogamF3IHdpZHRoIGFuZCBjaGluIGRyb3A7IGJyb3cgcmFpc2UsIHdlaWdodCBhbmQgYXJjaDsgbm9zZVxuLy8gbGVuZ3RoIGFuZCB3aWR0aDsgbW91dGggd2lkdGggYW5kIHNtaWxlOyBlYXIgc2l6ZS5cbmNvbnN0IEpBVyA9IFsxLCAwLjksIDEuMSwgMC44NCwgMS4xNiwgMC45Nl07XG5jb25zdCBDSElOID0gWzAsIDMsIC0yLCA1LCAtMSwgMV07XG5jb25zdCBCUk9XUyA9IFswLCAyLCAwLCAyLCAxLjUsIDEsIC0yLCAyLjYsIDAsIDEsIDMsIDIsIDMsIDEuMiwgLTEsIDAsIDEuOCwgM107XG5jb25zdCBOT1NFUyA9IFsxMTgsIDUsIDExNiwgNCwgMTIxLCA2LCAxMTksIDcsIDExNSwgNSwgMTIyLCA0XTtcbmNvbnN0IE1PVVRIUyA9IFsxMSwgMCwgOSwgMSwgMTMsIDAsIDEwLCAtMSwgMTQsIDEsIDEyLCAyXTtcbmNvbnN0IEVBUlMgPSBbMSwgMC43NSwgMS4zLCAxXTtcblxuLyoqIE1pcnJvciBhIHJpZ2h0IGhhbGYgaW50byBvbmUgY2xvc2VkIG91dGxpbmUgKGZsYXQgcG9pbnRzKS4gKi9cbmZ1bmN0aW9uIG1pcnJvcihoYWxmOiBQdFtdKSB7XG4gIHJldHVybiBbLi4uZmxhdChoYWxmKSwgLi4uZmxhdChoYWxmLnNsaWNlKDEsIC0xKS5yZXZlcnNlKCksIC0xKV07XG59XG5cbi8qKiBUaGUgaGFsZi13aWR0aCBvZiBhbiBvdXRsaW5lIChzb3J0ZWQgYnkgeSkgYXQgYHlgLiAqL1xuZnVuY3Rpb24gY2hvcmQoaGFsZjogUHRbXSwgeTogbnVtYmVyKSB7XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgaGFsZi5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IFt4MCwgeTBdID0gaGFsZltpIC0gMV07XG4gICAgY29uc3QgW3gxLCB5MV0gPSBoYWxmW2ldO1xuICAgIGlmICh5IDw9IHkxKVxuICAgICAgcmV0dXJuIHkxID09PSB5MCA/IHgxIDogeDAgKyAoKHgxIC0geDApICogKHkgLSB5MCkpIC8gKHkxIC0geTApO1xuICB9XG4gIHJldHVybiBoYWxmW2hhbGYubGVuZ3RoIC0gMV1bMF07XG59XG5cbi8qKiBUaGUgaGFpciBjYXA6IHRoZSBza3VsbCBhYm92ZSBgaGFpcmxpbmVgIHB1c2hlZCBvdXQgYnkgYHRoaWNrYCwgY2xvc2VkXG4gKiAgYnkgYSBoYWlybGluZSB0aGF0IGRpcHMgdG93YXJkIHRoZSBicm93LiAqL1xuZnVuY3Rpb24gY3Jvd24oaGVhZDogUHRbXSwgdGhpY2s6IG51bWJlciwgaGFpcmxpbmU6IG51bWJlcikge1xuICBjb25zdCBvdXQgPSBoZWFkXG4gICAgLmZpbHRlcigoWywgeV0pID0+IHkgPD0gaGFpcmxpbmUpXG4gICAgLm1hcCgoW3gsIHldKSA9PiB7XG4gICAgICBjb25zdCBkeSA9IHkgLSA5NjtcbiAgICAgIGNvbnN0IGwgPSBNYXRoLmh5cG90KHgsIGR5KSB8fCAxO1xuICAgICAgcmV0dXJuIFt4ICsgKHggLyBsKSAqIHRoaWNrLCB5ICsgKGR5IC8gbCkgKiB0aGlja107XG4gICAgfSk7XG4gIGNvbnN0IGVkZ2UgPSBjaG9yZChoZWFkLCBoYWlybGluZSk7XG4gIGNvbnN0IGJyb3cgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiA5IH0sIChfLCBpKSA9PiB7XG4gICAgY29uc3QgeCA9IGVkZ2UgKiAoMSAtIGkgLyA0KTtcbiAgICByZXR1cm4gW3gsIGhhaXJsaW5lIC0gNyAqICgxIC0gKHggLyBlZGdlKSAqKiAyKV07XG4gIH0pO1xuICByZXR1cm4gZmxhdChbXG4gICAgLi4ub3V0XG4gICAgICAuc2xpY2UoMSlcbiAgICAgIC5yZXZlcnNlKClcbiAgICAgIC5tYXAoKFt4LCB5XSkgPT4gWy14LCB5XSksXG4gICAgLi4ub3V0LFxuICAgIC4uLmJyb3csXG4gIF0pO1xufVxuXG5jb25zdCBjaXJjbGUgPSAoY3g6IG51bWJlciwgY3k6IG51bWJlciwgcjogbnVtYmVyKSA9PlxuICBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyMCB9LCAoXywgaSkgPT4gW1xuICAgIENYICsgY3ggKyByICogTWF0aC5jb3MoKGkgLyAyMCkgKiBNYXRoLlBJICogMiksXG4gICAgY3kgKyByICogTWF0aC5zaW4oKGkgLyAyMCkgKiBNYXRoLlBJICogMiksXG4gIF0pLmZsYXQoKTtcbmNvbnN0IGJvdGggPSAoYTogbnVtYmVyW10pID0+IFthdChhKSwgYXQoYSwgLTEpXTtcblxuLyoqIEVhY2ggaGFpcnN0eWxlOiBzaGFwZXMgZHJhd24gYmVoaW5kIHRoZSBoZWFkLCBhbmQgb3ZlciBpdC4gKi9cbmZ1bmN0aW9uIGhhaXIoXG4gIHN0eWxlOiBudW1iZXIsXG4gIGhlYWQ6IFB0W10sXG4pOiB7IGJhY2s6IG51bWJlcltdW107IGZyb250OiBudW1iZXJbXVtdIH0ge1xuICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgY2FzZSAwOiAvLyBidXp6XG4gICAgICByZXR1cm4geyBiYWNrOiBbXSwgZnJvbnQ6IFtjcm93bihoZWFkLCAyLCA2NildIH07XG4gICAgY2FzZSAxOiAvLyBzd2VwdCB1bmRlcmN1dFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFjazogW10sXG4gICAgICAgIGZyb250OiBbXG4gICAgICAgICAgY3Jvd24oaGVhZCwgMywgNjApLFxuICAgICAgICAgIGF0KFtcbiAgICAgICAgICAgIC0zNCwgNTQsIC0yNCwgMzIsIDYsIDI0LCAzOCwgMzIsIDU0LCA1MiwgNDAsIDQ4LCAxNiwgNDAsIC0xMiwgNDQsXG4gICAgICAgICAgXSksXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIGNhc2UgMjogLy8gY3Jlc3RcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2s6IFtdLFxuICAgICAgICBmcm9udDogW1xuICAgICAgICAgIGNyb3duKGhlYWQsIDEsIDcwKSxcbiAgICAgICAgICBhdChbLTcsIDY0LCAtMTAsIDMwLCAtNCwgNiwgMCwgMiwgNCwgNiwgMTAsIDMwLCA3LCA2NF0pLFxuICAgICAgICBdLFxuICAgICAgfTtcbiAgICBjYXNlIDM6IC8vIGxvbmdcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2s6IGJvdGgoW1xuICAgICAgICAgIDQwLCA2MCwgNTQsIDEwMCwgNTgsIDE1MCwgNjIsIDIwNiwgNDYsIDIxMCwgNDQsIDE1MCwgNDIsIDEwNCxcbiAgICAgICAgXSksXG4gICAgICAgIGZyb250OiBbY3Jvd24oaGVhZCwgNiwgNjApXSxcbiAgICAgIH07XG4gICAgY2FzZSA0OiAvLyBib2JcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2s6IFtdLFxuICAgICAgICBmcm9udDogW1xuICAgICAgICAgIGNyb3duKGhlYWQsIDcsIDU4KSxcbiAgICAgICAgICAuLi5ib3RoKFs0MiwgNTgsIDUyLCA5MiwgNTMsIDE0MCwgMzgsIDE0NiwgNDEsIDExMCwgNDMsIDgwXSksXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIGNhc2UgNTogLy8gYnVuXG4gICAgICByZXR1cm4geyBiYWNrOiBbY2lyY2xlKDAsIDI2LCAxNSldLCBmcm9udDogW2Nyb3duKGhlYWQsIDQsIDYwKV0gfTtcbiAgICBjYXNlIDY6IC8vIHNwaWtlc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFjazogW10sXG4gICAgICAgIGZyb250OiBbXG4gICAgICAgICAgYXQoW1xuICAgICAgICAgICAgLi4uQXJyYXkuZnJvbSh7IGxlbmd0aDogMTUgfSwgKF8sIGkpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgYSA9IE1hdGguUEkgKiAoMS4wOCArICgwLjg0ICogaSkgLyAxNCk7XG4gICAgICAgICAgICAgIGNvbnN0IHIgPSBpICUgMiA/IDY2IDogNTA7XG4gICAgICAgICAgICAgIHJldHVybiBbciAqIE1hdGguY29zKGEpLCA5NiArIHIgKiBNYXRoLnNpbihhKV07XG4gICAgICAgICAgICB9KS5mbGF0KCksXG4gICAgICAgICAgICAzOCxcbiAgICAgICAgICAgIDY2LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDU4LFxuICAgICAgICAgICAgLTM4LFxuICAgICAgICAgICAgNjYsXG4gICAgICAgICAgXSksXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIGNhc2UgNzogLy8gc2xpY2tlZCBiYWNrXG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYWNrOiBbYXQoWzMwLCA0NiwgNTYsIDU4LCA2MCwgOTIsIDUwLCAxMDAsIDQ2LCA3MF0pXSxcbiAgICAgICAgZnJvbnQ6IFtjcm93bihoZWFkLCA4LCA1NildLFxuICAgICAgfTtcbiAgICBjYXNlIDg6IC8vIHNoYXZlZFxuICAgICAgcmV0dXJuIHsgYmFjazogW10sIGZyb250OiBbXSB9O1xuICAgIGNhc2UgOTogLy8gYnJhaWRzXG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYWNrOiBib3RoKFs0MiwgNzAsIDUwLCAxMjAsIDUyLCAyMTQsIDQ0LCAyMTYsIDQyLCAxMjIsIDM4LCA3Nl0pLFxuICAgICAgICBmcm9udDogW2Nyb3duKGhlYWQsIDQsIDU4KV0sXG4gICAgICB9O1xuICAgIGNhc2UgMTA6IC8vIGNsb3VkXG4gICAgICByZXR1cm4geyBiYWNrOiBbY2lyY2xlKDAsIDc0LCA2NCldLCBmcm9udDogW2Nyb3duKGhlYWQsIDEwLCA2NCldIH07XG4gICAgZGVmYXVsdDogLy8gZnJpbmdlXG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYWNrOiBbXSxcbiAgICAgICAgZnJvbnQ6IFtcbiAgICAgICAgICBjcm93bihoZWFkLCA2LCA1OCksXG4gICAgICAgICAgYXQoW1xuICAgICAgICAgICAgLTQ2LCA1OCwgLTMwLCA0NiwgMCwgNDIsIDMwLCA0OCwgNDYsIDY0LCAzMCwgODAsIDgsIDc0LCAtMjAsIDgyLFxuICAgICAgICAgICAgLTQwLCA3NCxcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSxcbiAgICAgIH07XG4gIH1cbn1cblxuY29uc3QgR1JJRCA9ICgoKSA9PiB7XG4gIGxldCBkID0gXCJcIjtcbiAgZm9yIChsZXQgeCA9IDIwOyB4IDwgMjAwOyB4ICs9IDIwKSBkICs9IGBNJHt4fSAwVjI1MGA7XG4gIGZvciAobGV0IHkgPSAyNTsgeSA8IDI1MDsgeSArPSAyNSkgZCArPSBgTTAgJHt5fUgyMDBgO1xuICByZXR1cm4gZDtcbn0pKCk7XG5cbi8qKiBBIHNjYW5uZWQgaGVhZCBhbmQgc2hvdWxkZXJzIGluIGxpbmUgYXJ0ICgyMDAgw5cgMjUwIHVuaXRzKTogdGhlIHNrdWxsXG4gKiAgYW5kIHNob3VsZGVycyB0aW50ZWQgYnkgdGhlIHNraW4gdG9uZSBhbmQgd3JhcHBlZCBpbiBjb250b3VyIGxpbmVzLCB0aGVcbiAqICBoYWlyc3R5bGUgaW4gaXRzIGNvbG9yLCB0aGUgZmFjZSdzIGZlYXR1cmVzLCBhbmQgd2hhdGV2ZXIgY3liZXJ3YXJlLFxuICogIHNjYXJzLCBpbmsgYW5kIG1ldGFsIHRoZSBsb29rIGNhcnJpZXMuICovXG5leHBvcnQgZnVuY3Rpb24gUG9ydHJhaXQoe1xuICBsb29rLFxuICBib2R5LFxuICB3aWR0aCxcbn06IHtcbiAgbG9vazogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgYm9keTogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xufSkge1xuICBjb25zdCB2ID0gKGlkOiBzdHJpbmcpID0+IGxvb2tbaWRdID8/IDA7XG4gIGNvbnN0IHNraW4gPSBTS0lOX1RPTkVTW3YoXCJza2luVG9uZVwiKV07XG4gIGNvbnN0IGhhaXJDb2xvciA9IEhBSVJfQ09MT1JTW3YoXCJoYWlyQ29sb3JcIildO1xuICBjb25zdCBoYWlyTGluZSA9IG1peChoYWlyQ29sb3IsIFwiI2ZmZmZmZlwiLCAwLjMpO1xuICBjb25zdCBsaW5lID0gbWl4KHNraW4sIFwiI2ZmZmZmZlwiLCAwLjM1KTtcbiAgY29uc3QgY29udG91ciA9IG1peChza2luLCBcIiMwMDAwMDBcIiwgMC40NSk7XG4gIGNvbnN0IGphdyA9IHYoXCJqYXdcIik7XG4gIGNvbnN0IGhlYWQ6IFB0W10gPSBIRUFELm1hcCgoW3gsIHldKSA9PiB7XG4gICAgY29uc3QgayA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsICh5IC0gMTA0KSAvIDM2KSk7XG4gICAgcmV0dXJuIFtcbiAgICAgIHggKiAoMSArIChKQVdbamF3XSAtIDEpICogayksXG4gICAgICB5ICsgKHkgPiAxNDAgPyAoQ0hJTltqYXddICogKHkgLSAxNDApKSAvIDE3IDogMCksXG4gICAgXTtcbiAgfSk7XG4gIGNvbnN0IHNob3VsZGVycyA9IFNIT1VMREVSU1tib2R5XTtcbiAgY29uc3QgeyBiYWNrLCBmcm9udCB9ID0gaGFpcih2KFwiaGFpcnN0eWxlXCIpLCBoZWFkKTtcbiAgY29uc3QgW3JhaXNlLCBicm93VywgYXJjaF0gPSBCUk9XUy5zbGljZSh2KFwiZXllYnJvd3NcIikgKiAzKTtcbiAgY29uc3QgW25vc2VZLCBub3NlV10gPSBOT1NFUy5zbGljZSh2KFwibm9zZVwiKSAqIDIpO1xuICBjb25zdCBbbW91dGhXLCBzbWlsZV0gPSBNT1VUSFMuc2xpY2UodihcIm1vdXRoXCIpICogMik7XG4gIGNvbnN0IGVhciA9IEVBUlNbdihcImVhcnNcIildO1xuICBjb25zdCBmcmVja2xlcyA9IHJuZyh2KFwic2tpblR5cGVcIikgKyAzKTtcbiAgY29uc3Qgc3Ryb2tlID0gKGNvbG9yOiBzdHJpbmcsIHcgPSAxKSA9PlxuICAgICh7IGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IGNvbG9yLCBzdHJva2VXaWR0aDogdyB9KSBhcyBjb25zdDtcblxuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAyMDAgMjUwXCIgc3R5bGU9e3sgd2lkdGgsIGhlaWdodDogd2lkdGggKiAxLjI1IH19PlxuICAgICAgPHBhdGggZD17R1JJRH0gey4uLnN0cm9rZShDLmN5YW4sIDAuNSl9IG9wYWNpdHk9ezAuMTJ9IC8+XG4gICAgICB7YmFjay5tYXAoKHAsIGkpID0+IChcbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgcG9pbnRzPXtwfVxuICAgICAgICAgIGZpbGw9e2hhaXJDb2xvcn1cbiAgICAgICAgICBzdHJva2U9e2hhaXJMaW5lfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXswLjh9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17bWlycm9yKHNob3VsZGVycyl9IGZpbGw9e3NraW59IG9wYWNpdHk9ezAuNTV9IC8+XG4gICAgICA8cG9seWxpbmUgcG9pbnRzPXtmbGF0KHNob3VsZGVycyl9IHsuLi5zdHJva2UobGluZSwgMS40KX0gLz5cbiAgICAgIDxwb2x5bGluZSBwb2ludHM9e2ZsYXQoc2hvdWxkZXJzLCAtMSl9IHsuLi5zdHJva2UobGluZSwgMS40KX0gLz5cbiAgICAgIHtbMjE0LCAyMjYsIDIzOF0ubWFwKCh5KSA9PiAoXG4gICAgICAgIDxsaW5lXG4gICAgICAgICAga2V5PXt5fVxuICAgICAgICAgIHgxPXtDWCAtIGNob3JkKHNob3VsZGVycywgeSkgKyA2fVxuICAgICAgICAgIHkxPXt5fVxuICAgICAgICAgIHgyPXtDWCArIGNob3JkKHNob3VsZGVycywgeSkgLSA2fVxuICAgICAgICAgIHkyPXt5fVxuICAgICAgICAgIHN0cm9rZT17Y29udG91cn1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MC43fVxuICAgICAgICAgIG9wYWNpdHk9ezAuNn1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgICAge1sxLCAtMV0ubWFwKChzKSA9PiAoXG4gICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgIGtleT17c31cbiAgICAgICAgICBwb2ludHM9e2F0KFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICA0NSxcbiAgICAgICAgICAgICAgODYsXG4gICAgICAgICAgICAgIDQ1ICsgNiAqIGVhcixcbiAgICAgICAgICAgICAgdihcImVhcnNcIikgPT09IDMgPyA3MiA6IDgyLFxuICAgICAgICAgICAgICA0NSArIDggKiBlYXIsXG4gICAgICAgICAgICAgIDk0LFxuICAgICAgICAgICAgICA0NSArIDYgKiBlYXIsXG4gICAgICAgICAgICAgIDEwNixcbiAgICAgICAgICAgICAgNDQsXG4gICAgICAgICAgICAgIDExMCxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzLFxuICAgICAgICAgICl9XG4gICAgICAgICAgZmlsbD17c2tpbn1cbiAgICAgICAgICBzdHJva2U9e2xpbmV9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezF9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIDxwb2x5Z29uXG4gICAgICAgIHBvaW50cz17bWlycm9yKGhlYWQpfVxuICAgICAgICBmaWxsPXtza2lufVxuICAgICAgICBvcGFjaXR5PXswLjh9XG4gICAgICAgIHN0cm9rZT17bGluZX1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNH1cbiAgICAgIC8+XG4gICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogMTcgfSwgKF8sIGkpID0+IDQ0ICsgaSAqIDYuNSkubWFwKCh5KSA9PiAoXG4gICAgICAgIDxsaW5lXG4gICAgICAgICAga2V5PXt5fVxuICAgICAgICAgIHgxPXtDWCAtIGNob3JkKGhlYWQsIHkpICsgMX1cbiAgICAgICAgICB5MT17eX1cbiAgICAgICAgICB4Mj17Q1ggKyBjaG9yZChoZWFkLCB5KSAtIDF9XG4gICAgICAgICAgeTI9e3l9XG4gICAgICAgICAgc3Ryb2tlPXtjb250b3VyfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXswLjV9XG4gICAgICAgICAgb3BhY2l0eT17MC41fVxuICAgICAgICAvPlxuICAgICAgKSl9XG4gICAgICB7Wy0wLjYyLCAtMC4zLCAwLjMsIDAuNjJdLm1hcCgoZikgPT4gKFxuICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICBrZXk9e2Z9XG4gICAgICAgICAgcG9pbnRzPXtBcnJheS5mcm9tKHsgbGVuZ3RoOiAxOSB9LCAoXywgaSkgPT4gNDEgKyBpICogNi4zKS5mbGF0TWFwKFxuICAgICAgICAgICAgKHkpID0+IFtDWCArIGYgKiBjaG9yZChoZWFkLCB5KSwgeV0sXG4gICAgICAgICAgKX1cbiAgICAgICAgICB7Li4uc3Ryb2tlKGNvbnRvdXIsIDAuNSl9XG4gICAgICAgICAgb3BhY2l0eT17MC40NX1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IHYoXCJza2luVHlwZVwiKSAqIDUgfSwgKF8sIGkpID0+IChcbiAgICAgICAgPGNpcmNsZVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBjeD17Q1ggKyAoZnJlY2tsZXMoKSA+IDAuNSA/IDEgOiAtMSkgKiAoMTYgKyBmcmVja2xlcygpICogMTgpfVxuICAgICAgICAgIGN5PXsxMDIgKyBmcmVja2xlcygpICogMjB9XG4gICAgICAgICAgcj17MC43fVxuICAgICAgICAgIGZpbGw9e2NvbnRvdXJ9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIHtbMSwgLTFdLm1hcCgocykgPT4gKFxuICAgICAgICA8ZyBrZXk9e3N9PlxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAgcG9pbnRzPXthdChcbiAgICAgICAgICAgICAgWzgsIDg4IC0gYXJjaCAqIDAuMywgMTcsIDg1IC0gYXJjaCAtIHJhaXNlICogMC4zLCAyNywgODggLSByYWlzZV0sXG4gICAgICAgICAgICAgIHMsXG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgey4uLnN0cm9rZShtaXgoaGFpckNvbG9yLCBcIiMwMDAwMDBcIiwgMC4zKSwgYnJvd1cpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICAgIHBvaW50cz17YXQoWzksIDk2LCAxNCwgOTMsIDIxLCA5MywgMjYsIDk2LCAyMCwgOTguNSwgMTQsIDk4LjVdLCBzKX1cbiAgICAgICAgICAgIGZpbGw9XCIjMGMwYzEwXCJcbiAgICAgICAgICAgIHN0cm9rZT17bGluZX1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXswLjh9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICBjeD17Q1ggKyBzICogMTcuNX1cbiAgICAgICAgICAgIGN5PXs5NS44fVxuICAgICAgICAgICAgcj17Mi40fVxuICAgICAgICAgICAgZmlsbD17RVlFX0NPTE9SU1t2KFwiZXllc1wiKV19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9nPlxuICAgICAgKSl9XG4gICAgICA8cG9seWxpbmVcbiAgICAgICAgcG9pbnRzPXtbQ1ggKyAyLCA5OCwgQ1ggKyA0LCBub3NlWSAtIDIsIENYICsgbm9zZVcsIG5vc2VZXX1cbiAgICAgICAgey4uLnN0cm9rZShsaW5lKX1cbiAgICAgIC8+XG4gICAgICA8cG9seWxpbmVcbiAgICAgICAgcG9pbnRzPXtbQ1ggLSBub3NlVywgbm9zZVkgKyAxLCBDWCwgbm9zZVkgKyAyLjUsIENYICsgbm9zZVcsIG5vc2VZICsgMV19XG4gICAgICAgIHsuLi5zdHJva2UoY29udG91cil9XG4gICAgICAvPlxuICAgICAgPE1hcmtzXG4gICAgICAgIHY9e3Z9XG4gICAgICAgIGhlYWQ9e2hlYWR9XG4gICAgICAgIGluaz17bWl4KHNraW4sIFwiIzAwMDAwMFwiLCAwLjc1KX1cbiAgICAgICAgbm9zZVk9e25vc2VZfVxuICAgICAgICBlYXI9e2Vhcn1cbiAgICAgICAgbW91dGg9e1ttb3V0aFcsIHNtaWxlXX1cbiAgICAgIC8+XG4gICAgICA8cG9seWxpbmVcbiAgICAgICAgcG9pbnRzPXthdChbXG4gICAgICAgICAgLW1vdXRoVyxcbiAgICAgICAgICAxMzQgLSBzbWlsZSxcbiAgICAgICAgICAtbW91dGhXIC8gMyxcbiAgICAgICAgICAxMzIuNSxcbiAgICAgICAgICAwLFxuICAgICAgICAgIDEzMy41LFxuICAgICAgICAgIG1vdXRoVyAvIDMsXG4gICAgICAgICAgMTMyLjUsXG4gICAgICAgICAgbW91dGhXLFxuICAgICAgICAgIDEzNCAtIHNtaWxlLFxuICAgICAgICBdKX1cbiAgICAgICAgey4uLnN0cm9rZShjb250b3VyLCAxLjIpfVxuICAgICAgLz5cbiAgICAgIDxwb2x5bGluZVxuICAgICAgICBwb2ludHM9e2F0KFstbW91dGhXICogMC42LCAxMzcuNSwgMCwgMTM5LjUsIG1vdXRoVyAqIDAuNiwgMTM3LjVdKX1cbiAgICAgICAgey4uLnN0cm9rZShsaW5lLCAwLjgpfVxuICAgICAgLz5cbiAgICAgIHtmcm9udC5tYXAoKHAsIGkpID0+IChcbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgcG9pbnRzPXtwfVxuICAgICAgICAgIGZpbGw9e2hhaXJDb2xvcn1cbiAgICAgICAgICBzdHJva2U9e2hhaXJMaW5lfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXswLjh9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIDxyZWN0IHg9ezB9IHk9ezYyfSB3aWR0aD17MjAwfSBoZWlnaHQ9ezEwfSBmaWxsPXtDLmN5YW59IG9wYWNpdHk9ezAuMDd9IC8+XG4gICAgICA8cmVjdCB4PXswfSB5PXsxNjh9IHdpZHRoPXsyMDB9IGhlaWdodD17NH0gZmlsbD17Qy5jeWFufSBvcGFjaXR5PXswLjA4fSAvPlxuICAgIDwvc3ZnPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgQ2hhcmFjdGVyIH0gZnJvbSBcIi4uLy4uL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBBVFRSSUJVVEVTLCBBVFRSX01BWCB9IGZyb20gXCIuL2RhdGFcIjtcblxuLyoqIFdoZXJlIHRoZSBJRCBjYXJkJ3MgbG93ZXIgaGFsZiAocmFkYXIsIGxldmVscywgYmFyY29kZSkgc3RhcnRzLiAqL1xuZXhwb3J0IGNvbnN0IFJVTEUgPSAzNTI7XG5cbi8qKiBUaGUgZml2ZSBhdHRyaWJ1dGVzIGFzIGEgcmFkYXIgKHJpbmdzIGF0IDIsIDQgYW5kIDYpIGJlc2lkZSBhIGxpc3Qgb2ZcbiAqICBsZXZlbHMgZHJhd24gYXMgcGlwcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSYWRhcih7IGF0dHJpYnV0ZXMgfTogeyBhdHRyaWJ1dGVzOiBDaGFyYWN0ZXJbXCJhdHRyaWJ1dGVzXCJdIH0pIHtcbiAgY29uc3QgUiA9IDE0O1xuICBjb25zdCBhdCA9IChpOiBudW1iZXIsIHI6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGEgPSAtTWF0aC5QSSAvIDIgKyAoaSAqIE1hdGguUEkgKiAyKSAvIDU7XG4gICAgcmV0dXJuIFtyICogTWF0aC5jb3MoYSksIHIgKiBNYXRoLnNpbihhKV07XG4gIH07XG4gIGNvbnN0IHJpbmcgPSAocjogbnVtYmVyKSA9PiBbMCwgMSwgMiwgMywgNF0uZmxhdE1hcCgoaSkgPT4gYXQoaSwgcikpO1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLlQubWljcm8sXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiBSVUxFICsgMTAsXG4gICAgICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIEFUVFJJQlVURVNcbiAgICAgIDwvdGV4dD5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD1cIi0xMDAgLTEwMCAyMDAgMjAwXCJcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAyMixcbiAgICAgICAgICB0b3A6IFJVTEUgKyAyNCxcbiAgICAgICAgICB3aWR0aDogMTc2LFxuICAgICAgICAgIGhlaWdodDogMTc2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7WzIsIDQsIDZdLm1hcCgobCkgPT4gKFxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBrZXk9e2x9XG4gICAgICAgICAgICBwb2ludHM9e3JpbmcobCAqIFIpfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPVwiIzVjMWMxZVwiXG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgICAge1swLCAxLCAyLCAzLCA0XS5tYXAoKGkpID0+IChcbiAgICAgICAgICA8bGluZVxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgeDE9ezB9XG4gICAgICAgICAgICB5MT17MH1cbiAgICAgICAgICAgIHgyPXthdChpLCA2ICogUilbMF19XG4gICAgICAgICAgICB5Mj17YXQoaSwgNiAqIFIpWzFdfVxuICAgICAgICAgICAgc3Ryb2tlPVwiIzVjMWMxZVwiXG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBwb2ludHM9e0FUVFJJQlVURVMuZmxhdE1hcCgoYSwgaSkgPT4gYXQoaSwgYXR0cmlidXRlc1thLmlkXSAqIFIpKX1cbiAgICAgICAgICBmaWxsPXtDLnJlZH1cbiAgICAgICAgICBvcGFjaXR5PXswLjN9XG4gICAgICAgIC8+XG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXtBVFRSSUJVVEVTLmZsYXRNYXAoKGEsIGkpID0+IGF0KGksIGF0dHJpYnV0ZXNbYS5pZF0gKiBSKSl9XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17Qy5yZWR9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIC8+XG4gICAgICAgIHtBVFRSSUJVVEVTLm1hcCgoYSwgaSkgPT4gKFxuICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgIGtleT17YS5pZH1cbiAgICAgICAgICAgIGN4PXthdChpLCBhdHRyaWJ1dGVzW2EuaWRdICogUilbMF19XG4gICAgICAgICAgICBjeT17YXQoaSwgYXR0cmlidXRlc1thLmlkXSAqIFIpWzFdfVxuICAgICAgICAgICAgcj17My41fVxuICAgICAgICAgICAgZmlsbD17Qy5jeWFufVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9zdmc+XG4gICAgICB7QVRUUklCVVRFUy5tYXAoKGEsIGkpID0+IHtcbiAgICAgICAgY29uc3QgW3gsIHldID0gYXQoaSwgMTA2KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAga2V5PXthLmlkfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgIGxlZnQ6IDExMCArIHggKiAwLjg4IC0gOSxcbiAgICAgICAgICAgICAgdG9wOiBSVUxFICsgMTEyICsgeSAqIDAuODggLSA2LFxuICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuRGltLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YS5zaG9ydH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICk7XG4gICAgICB9KX1cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjM2LFxuICAgICAgICAgIHRvcDogUlVMRSArIDM2LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiA5LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7QVRUUklCVVRFUy5tYXAoKGEpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXthLmlkfVxuICAgICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA4IH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDExLCBjb2xvcjogQy5yZWQsIHdpZHRoOiAzMCB9fT5cbiAgICAgICAgICAgICAge2Euc2hvcnR9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDMgfX0+XG4gICAgICAgICAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBBVFRSX01BWCB9LCAoXywgbCkgPT4gKFxuICAgICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgICBrZXk9e2x9XG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTIsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbCA8IGF0dHJpYnV0ZXNbYS5pZF0gPyBDLnJlZCA6IFwiIzJhMTAxNlwiLFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2F0dHJpYnV0ZXNbYS5pZF0udG9TdHJpbmcoKX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgIDwvPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVudGVyIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IERhdGFOb2lzZSB9IGZyb20gXCIuLi8uLi91aS9kZWNvclwiO1xuaW1wb3J0IHsgS2V5Y2FwIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHR5cGUgeyBMb29rT3B0aW9uIH0gZnJvbSBcIi4vZGF0YVwiO1xuXG4vKiogVGhlIGNvbG9yIGdyaWQgYSBjb2xvciBvcHRpb24gb3BlbnMgKFNLSU4gVE9ORSwgSEFJUiBDT0xPUik6IHR3byByb3dzXG4gKiAgb2Ygc3dhdGNoZXMsIHRoZSBjaG9zZW4gb25lIHRpY2tlZCwgc21hbGwgcHJpbnQsIGFuZCBDTE9TRSBbRVNDXS4gQVxuICogIGNsaWNrIHBpY2tzIGEgY29sb3IgYW5kIGxlYXZlcyB0aGUgZ3JpZCBvcGVuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN3YXRjaGVzKHtcbiAgb3B0aW9uLFxuICB2YWx1ZSxcbiAgb25QaWNrLFxuICBvbkNsb3NlLFxufToge1xuICBvcHRpb246IExvb2tPcHRpb247XG4gIHZhbHVlOiBudW1iZXI7XG4gIG9uUGljazogKGk6IG51bWJlcikgPT4gdm9pZDtcbiAgb25DbG9zZTogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZW50ZXIgPSB1c2VFbnRlcigzMCk7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDEzNSxcbiAgICAgICAgICAuLi5lbnRlcixcbiAgICAgICAgICB0b3A6IDE1OCxcbiAgICAgICAgICB3aWR0aDogNTYwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiA2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsXG4gICAgICAgICAgICBnYXA6IDE0LFxuICAgICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAyOCB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8RGF0YU5vaXNlIHNlZWQ9ezQxfSBsaW5lcz17M30gZ3JvdXBzPXsyfSBzdHlsZT17eyBmb250U2l6ZTogNiB9fSAvPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWVudSwgZm9udFNpemU6IDI3LCBmb250RmFtaWx5OiBGLnNlbWlib2xkIH19PlxuICAgICAgICAgICAge29wdGlvbi5sYWJlbH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEgfX0gLz5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDE3LFxuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBTQytcbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uY2hhbWZlcihcIiMxYTBhMGVcIiwgMjIsIFwicmdiYSgyNTUsIDkzLCA4MSwgMC41NSlcIiwgMSksXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgZ2FwOiAxMixcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMjYsIHJpZ2h0OiAyNCwgdG9wOiAxMCwgYm90dG9tOiAxMiB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgZmxleFdyYXA6IFwid3JhcFwiLFxuICAgICAgICAgICAgICBnYXA6IDUsXG4gICAgICAgICAgICAgIHdpZHRoOiA1MDUsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtvcHRpb24uc3dhdGNoZXMhLm1hcCgoY29sb3IsIGkpID0+IChcbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGtleT17Y29sb3J9XG4gICAgICAgICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNmeChcImhvdmVyXCIpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNmeChcImNsaWNrXCIpO1xuICAgICAgICAgICAgICAgICAgb25QaWNrKGkpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIC4uLmNoYW1mZXIoY29sb3IsIDEyKSxcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiA4MCxcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogODAsXG4gICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJmbGV4RW5kXCIsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhTdGFydFwiLFxuICAgICAgICAgICAgICAgICAgcGFkZGluZzogeyB0b3A6IDgsIHJpZ2h0OiA4IH0sXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBob3ZlclN0eWxlPXt7IC4uLmNoYW1mZXIoY29sb3IsIDEyLCBDLmN5YW4sIDIpIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDE0LFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDE0LFxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6IDIsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMixcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2kgPT09IHZhbHVlICYmIChcbiAgICAgICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogNiwgaGVpZ2h0OiA2LCBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDcuNSwgY29sb3I6IEMucmVkRGltIH19PlxuICAgICAgICAgICAge2BJTUFHRSBOQU1FOiAgJHtvcHRpb24uaWQudG9VcHBlckNhc2UoKX0tJHsodmFsdWUgKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDMsIFwiMFwiKX0uU1dUXFxuSU1BR0UgVFlQRTogIEtFUk5FTCBJU09MQVRFRCBTQU1QTEVcXG5DT0RFQzogIFVOQ09NUFJFU1NFRFxcbkxPQUQgQUREUkVTUzogIDAwMDBBMTI0NGB9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIG9uQ2xpY2s9e29uQ2xvc2V9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihcIiMxYTBhMGVcIiwgMTIsIFwicmdiYSgyNTUsIDkzLCA4MSwgMC41NSlcIiwgMSksXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDE4NSxcbiAgICAgICAgICB0b3A6IDQzMixcbiAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgIGhlaWdodDogNDYsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgIH19XG4gICAgICAgIGhvdmVyU3R5bGU9e2NoYW1mZXIoXCIjM2ExMDE2XCIsIDEyLCBDLnJlZCwgMSl9XG4gICAgICA+XG4gICAgICAgIDxLZXljYXAgaz1cIkVTQ1wiIC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWVudSwgZm9udFNpemU6IDI1IH19PkNMT1NFPC90ZXh0PlxuICAgICAgPC9idXR0b24+XG4gICAgPC8+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VLZXlzIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IE5FV19DSEFSQUNURVIsIHR5cGUgQXR0cmlidXRlSWQgfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEZJTEwsIEhlYWRlciwgSGludCwgSGludHMsIEtleWNhcCB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IEFUVFJJQlVURVMsIEFUVFJfTUFYLCBBVFRSX01JTiwgQVRUUl9QT0lOVFMgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBJZENhcmQgfSBmcm9tIFwiLi9JZENhcmRcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZUljb24sIFN0ZXBJY29uIH0gZnJvbSBcIi4vZ2x5cGhzXCI7XG5pbXBvcnQgeyBDaHJvbWUsIExldmVsQmFkZ2UsIE5hdkJ1dHRvbnMgfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IHR5cGUgeyBTdGVwUHJvcHMgfSBmcm9tIFwiLi9OZXdHYW1lXCI7XG5cbmNvbnN0IERBUksgPSBcIiMwZDBmMTZcIjtcbmNvbnN0IEVER0UgPSBcInJnYmEoMjU1LCA5MywgODEsIDAuNDIpXCI7XG5jb25zdCBMSVQgPSBcIiM1YTFhMWVcIjtcblxuLyoqIEFUVFJJQlVURVM6IGZpdmUgYXR0cmlidXRlcyBmcm9tIDMgdG8gNiBhbmQgc2V2ZW4gcG9pbnRzIHRvIHNwZW5kXG4gKiAgKHJpZ2h0KSwgdGhlIGhvdmVyZWQgb25lIGV4cGxhaW5lZCAobGVmdCksIHRoZSBJRCBjYXJkJ3MgcmFkYXJcbiAqICBmb2xsb3dpbmcgYWxvbmcgKG1pZGRsZSkuIEEgYW5kIEQgdGFrZSBhbmQgZ2l2ZSBhIHBvaW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEF0dHJpYnV0ZXMoeyBjaGFyYWN0ZXIsIG9uQ2hhbmdlLCBuZXh0LCBiYWNrIH06IFN0ZXBQcm9wcykge1xuICBjb25zdCBbaG90LCBzZXRIb3RdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtlZGl0aW5nLCBzZXRFZGl0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgdmFsdWVzID0gY2hhcmFjdGVyLmF0dHJpYnV0ZXM7XG4gIGNvbnN0IHNwZW50ID0gQVRUUklCVVRFUy5yZWR1Y2UoKG4sIGEpID0+IG4gKyB2YWx1ZXNbYS5pZF0gLSBBVFRSX01JTiwgMCk7XG4gIGNvbnN0IHBvaW50cyA9IEFUVFJfUE9JTlRTIC0gc3BlbnQ7XG4gIGNvbnN0IGNoYW5nZSA9IChpZDogQXR0cmlidXRlSWQsIGJ5OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB2ID0gdmFsdWVzW2lkXSArIGJ5O1xuICAgIGlmICh2IDwgQVRUUl9NSU4gfHwgdiA+IEFUVFJfTUFYIHx8IChieSA+IDAgJiYgcG9pbnRzID09PSAwKSlcbiAgICAgIHJldHVybiBzZngoXCJlcnJvclwiKTtcbiAgICBzZngoXCJ0YWJcIik7XG4gICAgb25DaGFuZ2UoeyAuLi5jaGFyYWN0ZXIsIGF0dHJpYnV0ZXM6IHsgLi4udmFsdWVzLCBbaWRdOiB2IH0gfSk7XG4gIH07XG4gIGNvbnN0IGhvdmVyID0gKGk6IG51bWJlcikgPT4ge1xuICAgIGlmIChpID09PSBob3QpIHJldHVybjtcbiAgICBzZngoXCJob3ZlclwiKTtcbiAgICBzZXRIb3QoaSk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICAvLyBIb2xkIEEgb3IgRCB0byBrZWVwIHNwZW5kaW5nOyBFc2MgYW5kIEYgYWN0IG9uY2UuXG4gICAgaWYgKGVkaXRpbmcgfHwgKGUucmVwZWF0ICYmIChlLmtleSA9PT0gXCJFc2NhcGVcIiB8fCBlLmNvZGUgPT09IFwiS2V5RlwiKSkpXG4gICAgICByZXR1cm47XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSBiYWNrKCk7XG4gICAgZWxzZSBpZiAoZS5jb2RlID09PSBcIktleUZcIikgbmV4dCgpO1xuICAgIGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlBXCIpIGNoYW5nZShBVFRSSUJVVEVTW2hvdF0uaWQsIC0xKTtcbiAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5RFwiKSBjaGFuZ2UoQVRUUklCVVRFU1tob3RdLmlkLCAxKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd1VwXCIpIGhvdmVyKE1hdGgubWF4KDAsIGhvdCAtIDEpKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd0Rvd25cIilcbiAgICAgIGhvdmVyKE1hdGgubWluKEFUVFJJQlVURVMubGVuZ3RoIC0gMSwgaG90ICsgMSkpO1xuICB9LCB0cnVlKTtcbiAgdXNlRGVidWcoXCJob3ZlclwiLCAobikgPT4gc2V0SG90KE51bWJlcihuKSkpO1xuICAvLyBgYXR0cnMgMyA0IDYgNiAzYDogYm9keSwgaW50ZWxsaWdlbmNlLCByZWZsZXhlcywgdGVjaCwgY29vbC5cbiAgdXNlRGVidWcoXCJhdHRyc1wiLCAoYXJnKSA9PiB7XG4gICAgY29uc3QgbiA9IGFyZy5zcGxpdChcIiBcIikubWFwKE51bWJlcik7XG4gICAgb25DaGFuZ2Uoe1xuICAgICAgLi4uY2hhcmFjdGVyLFxuICAgICAgYXR0cmlidXRlczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBBVFRSSUJVVEVTLm1hcCgoYSwgaSkgPT4gW2EuaWQsIG5baV1dKSxcbiAgICAgICkgYXMgdHlwZW9mIHZhbHVlcyxcbiAgICB9KTtcbiAgfSk7XG5cbiAgY29uc3QgYSA9IEFUVFJJQlVURVNbaG90XTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8Q2hyb21lIC8+XG4gICAgICA8SGVhZGVyXG4gICAgICAgIHRpdGxlPVwiQVRUUklCVVRFU1wiXG4gICAgICAgIGNhcHRpb249XCJTUEVORCBZT1VSIFBPSU5UUy4gV0hBVCBZT1UgU1RBUlQgV0lUSCBERUNJREVTIEhPVyBZT1UgU1VSVklWRSBZT1VSIEZJUlNUIE5JR0hULlwiXG4gICAgICAgIGljb249ezxTdGVwSWNvbiBraW5kPVwiYXR0cmlidXRlc1wiIC8+fVxuICAgICAgICBzdGVwPXszfVxuICAgICAgLz5cbiAgICAgIDxFeHBsYWluZXJcbiAgICAgICAgbmFtZT17YS5uYW1lfVxuICAgICAgICB0ZXh0PXthLnRleHR9XG4gICAgICAgIGVmZmVjdHM9e2EuZWZmZWN0c31cbiAgICAgICAgdmFsdWU9e3ZhbHVlc1thLmlkXX1cbiAgICAgIC8+XG4gICAgICA8SWRDYXJkXG4gICAgICAgIGNoYXJhY3Rlcj17Y2hhcmFjdGVyfVxuICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgIG9uRWRpdGluZz17c2V0RWRpdGluZ31cbiAgICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIGxlZnQ6IDU2MCwgdG9wOiAxOTYgfX1cbiAgICAgIC8+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLlQubWVudSxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICByaWdodDogMjAwLFxuICAgICAgICAgIHRvcDogMTc4LFxuICAgICAgICAgIGZvbnRTaXplOiAyNyxcbiAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBQT0lOVFMgQVZBSUxBQkxFXG4gICAgICA8L3RleHQ+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBzZngoXCJjbGlja1wiKTtcbiAgICAgICAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3RlciwgYXR0cmlidXRlczogTkVXX0NIQVJBQ1RFUi5hdHRyaWJ1dGVzIH0pO1xuICAgICAgICB9fVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoREFSSywgMTQsIEVER0UsIDEsIFwiYmxcIiksXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDQwOCxcbiAgICAgICAgICB0b3A6IDIxMyxcbiAgICAgICAgICB3aWR0aDogMjQ5LFxuICAgICAgICAgIGhlaWdodDogNTAsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgICAgaG92ZXJTdHlsZT17Y2hhbWZlcihcIiMyYTBkMTJcIiwgMTQsIEMucmVkLCAxLCBcImJsXCIpfVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250U2l6ZTogMjIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBSRVNFVCBUTyBERUZBVUxUXG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICByaWdodDogLTIsXG4gICAgICAgICAgICB0b3A6IDIzLFxuICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgaGVpZ2h0OiAzLFxuICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEVER0UsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKERBUkssIDEyLCBFREdFLCAxLCBcImJsXCIpLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIHJpZ2h0OiAyMDAsXG4gICAgICAgICAgdG9wOiAyMTAsXG4gICAgICAgICAgd2lkdGg6IDExMCxcbiAgICAgICAgICBoZWlnaHQ6IDUzLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRTaXplOiA0MixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwb2ludHMudG9TdHJpbmcoKX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAge0FUVFJJQlVURVMubWFwKChhdHRyLCBpKSA9PiAoXG4gICAgICAgIDxBdHRyaWJ1dGVSb3dcbiAgICAgICAgICBrZXk9e2F0dHIuaWR9XG4gICAgICAgICAgaWQ9e2F0dHIuaWR9XG4gICAgICAgICAgbmFtZT17YXR0ci5uYW1lfVxuICAgICAgICAgIHZhbHVlPXt2YWx1ZXNbYXR0ci5pZF19XG4gICAgICAgICAgbGl0PXtpID09PSBob3R9XG4gICAgICAgICAgY2FuQWRkPXt2YWx1ZXNbYXR0ci5pZF0gPCBBVFRSX01BWCAmJiBwb2ludHMgPiAwfVxuICAgICAgICAgIHRvcD17Mjc4ICsgaSAqIDEyMX1cbiAgICAgICAgICBvbkVudGVyPXsoKSA9PiBob3ZlcihpKX1cbiAgICAgICAgICBvbkNoYW5nZT17KGJ5KSA9PiBjaGFuZ2UoYXR0ci5pZCwgYnkpfVxuICAgICAgICAvPlxuICAgICAgKSl9XG4gICAgICA8TmF2QnV0dG9ucyBvbkJhY2s9e2JhY2t9IG9uTmV4dD17bmV4dH0gLz5cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA4IH19PlxuICAgICAgICAgIDxLZXljYXAgaz1cIkFcIiAvPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyNSwgY29sb3I6IEMucmVkLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+XG4gICAgICAgICAgICAtIC8gK1xuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8S2V5Y2FwIGs9XCJEXCIgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNFTEVDVFwiIC8+XG4gICAgICA8L0hpbnRzPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIE9uZSBhdHRyaWJ1dGU6IGl0cyBwbGF0ZSAoaWNvbiwgbmFtZSwgTUlOL01BWCBiYWRnZSkgb3ZlciDiiJIgdmFsdWUgKy4gKi9cbmZ1bmN0aW9uIEF0dHJpYnV0ZVJvdyh7XG4gIGlkLFxuICBuYW1lLFxuICB2YWx1ZSxcbiAgbGl0LFxuICBjYW5BZGQsXG4gIHRvcCxcbiAgb25FbnRlcixcbiAgb25DaGFuZ2UsXG59OiB7XG4gIGlkOiBBdHRyaWJ1dGVJZDtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICBsaXQ6IGJvb2xlYW47XG4gIGNhbkFkZDogYm9vbGVhbjtcbiAgdG9wOiBudW1iZXI7XG4gIG9uRW50ZXI6ICgpID0+IHZvaWQ7XG4gIG9uQ2hhbmdlOiAoYnk6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZmlsbCA9IGxpdCA/IExJVCA6IERBUks7XG4gIGNvbnN0IGVkZ2UgPSBsaXQgPyBcInJnYmEoMjU1LCA5MywgODEsIDAuNzUpXCIgOiBFREdFO1xuICBjb25zdCBib3ggPSAoY29ybmVyPzogXCJibFwiIHwgXCJiclwiKSA9PlxuICAgIGNvcm5lclxuICAgICAgPyBjaGFtZmVyKGZpbGwsIDEyLCBlZGdlLCAxLCBjb3JuZXIpXG4gICAgICA6IHsgYmFja2dyb3VuZENvbG9yOiBmaWxsLCBib3JkZXI6IDEsIGJvcmRlckNvbG9yOiBlZGdlIH07XG4gIGNvbnN0IGJhZGdlID1cbiAgICB2YWx1ZSA9PT0gQVRUUl9NQVggPyBcIk1BWCBMRVZFTFwiIDogdmFsdWUgPT09IEFUVFJfTUlOID8gXCJNSU4gTEVWRUxcIiA6IG51bGw7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25Qb2ludGVyRW50ZXI9e29uRW50ZXJ9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgcmlnaHQ6IDIwMCxcbiAgICAgICAgdG9wLFxuICAgICAgICB3aWR0aDogNDU3LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBnYXA6IDYsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihmaWxsLCAxNiwgZWRnZSwgMSwgXCJibFwiKSxcbiAgICAgICAgICBoZWlnaHQ6IDYyLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLCBsZWZ0OiAzMiwgdG9wOiAxMCB9fT5cbiAgICAgICAgICA8QXR0cmlidXRlSWNvbiBpZD17aWR9IC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IDI1LFxuICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge25hbWV9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAge2JhZGdlICYmIChcbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgcmlnaHQ6IDEwLCB0b3A6IDE4IH19PlxuICAgICAgICAgICAgPExldmVsQmFkZ2UgbGFiZWw9e2JhZGdlfSAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogNCwgaGVpZ2h0OiA0NiB9fT5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIG9uUG9pbnRlckVudGVyPXtvbkVudGVyfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKC0xKX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uYm94KFwiYmxcIiksXG4gICAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgICAgaG92ZXJTdHlsZT17Y2hhbWZlcihcIiM2ZTIyMjhcIiwgMTIsIEMucmVkLCAxLCBcImJsXCIpfVxuICAgICAgICA+XG4gICAgICAgICAgPFNpZ24gcGx1cz17ZmFsc2V9IG9mZj17dmFsdWUgPD0gQVRUUl9NSU59IC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5ib3goKSxcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDI3LFxuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt2YWx1ZS50b1N0cmluZygpfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25Qb2ludGVyRW50ZXI9e29uRW50ZXJ9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoMSl9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmJveChcImJyXCIpLFxuICAgICAgICAgICAgd2lkdGg6IDExMSxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICB9fVxuICAgICAgICAgIGhvdmVyU3R5bGU9e2NoYW1mZXIoXCIjNmUyMjI4XCIsIDEyLCBDLnJlZCwgMSwgXCJiclwiKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxTaWduIHBsdXMgb2ZmPXshY2FuQWRkfSAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvbm9kZT5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIOKIkiBvciArOyBzdHJ1Y2sgdGhyb3VnaCAoYSBzbGFudGVkIGJhciBvdmVyIGEgYm94KSB3aGVuIHVuYXZhaWxhYmxlLiAqL1xuZnVuY3Rpb24gU2lnbih7IHBsdXMsIG9mZiB9OiB7IHBsdXM6IGJvb2xlYW47IG9mZjogYm9vbGVhbiB9KSB7XG4gIGNvbnN0IGNvbG9yID0gb2ZmID8gXCIjYTMzMzJiXCIgOiBDLnJlZDtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgNTggMTZcIiBzdHlsZT17eyB3aWR0aDogNTgsIGhlaWdodDogMTYgfX0+XG4gICAgICB7b2ZmICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cmVjdFxuICAgICAgICAgICAgeD17MX1cbiAgICAgICAgICAgIHk9ezN9XG4gICAgICAgICAgICB3aWR0aD17NTZ9XG4gICAgICAgICAgICBoZWlnaHQ9ezEwfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGxpbmUgeDE9ezF9IHkxPXszfSB4Mj17NTd9IHkyPXsxM30gc3Ryb2tlPXtjb2xvcn0gc3Ryb2tlV2lkdGg9ezF9IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIDxyZWN0IHg9ezIzfSB5PXs3fSB3aWR0aD17MTJ9IGhlaWdodD17Mi40fSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIHtwbHVzICYmIDxyZWN0IHg9ezI3Ljh9IHk9ezJ9IHdpZHRoPXsyLjR9IGhlaWdodD17MTJ9IGZpbGw9e2NvbG9yfSAvPn1cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuLyoqIFRoZSBob3ZlcmVkIGF0dHJpYnV0ZSwgZXhwbGFpbmVkOiBuYW1lIGFuZCBsZXZlbCBiYWRnZSwgd2hhdCBlYWNoXG4gKiAgbGV2ZWwgZ2l2ZXMgKGluIGN5YW4pLCBhbmQgdGhlIGN1cnJlbnQgbGV2ZWwuICovXG5mdW5jdGlvbiBFeHBsYWluZXIoe1xuICBuYW1lLFxuICB0ZXh0LFxuICBlZmZlY3RzLFxuICB2YWx1ZSxcbn06IHtcbiAgbmFtZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG4gIGVmZmVjdHM6IHN0cmluZ1tdO1xuICB2YWx1ZTogbnVtYmVyO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogNzUsXG4gICAgICAgIHRvcDogMTc4LFxuICAgICAgICB3aWR0aDogMzk3LFxuICAgICAgICBtaW5IZWlnaHQ6IDM2OCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKFwiIzE2MGEwZlwiLCAxMiwgRURHRSwgMSwgXCJibFwiKSxcbiAgICAgICAgICB3aWR0aDogNDAsXG4gICAgICAgICAgbWFyZ2luOiB7IHJpZ2h0OiAzIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogMjYsXG4gICAgICAgICAgICB0b3A6IDE2LFxuICAgICAgICAgICAgYm90dG9tOiAxNixcbiAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBFREdFLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogNCxcbiAgICAgICAgICAgIHRvcDogMTc1LFxuICAgICAgICAgICAgd2lkdGg6IDIyLFxuICAgICAgICAgICAgaGVpZ2h0OiA0LFxuICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEVER0UsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihEQVJLLCAxOCwgRURHRSwgMSksXG4gICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDE2LCByaWdodDogMTIsIHRvcDogMTAsIGJvdHRvbTogMTAgfSxcbiAgICAgICAgICBnYXA6IDEwLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICAgICAgICAgICAgaGVpZ2h0OiAzMixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAyNixcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICB7dmFsdWUgPT09IEFUVFJfTUFYICYmIDxMZXZlbEJhZGdlIGxhYmVsPVwiTUFYIExFVkVMXCIgLz59XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgaGVpZ2h0OiAxLCBiYWNrZ3JvdW5kQ29sb3I6IEVER0UgfX0gLz5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDMyMiB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMjIsIGNvbG9yOiBDLmN5YW4sIGxpbmVIZWlnaHQ6IDEuMTIgfX0+XG4gICAgICAgICAgICB7YCR7dGV4dH1cXG5cXG4ke2VmZmVjdHMubWFwKChlKSA9PiBgLSAke2V9YCkuam9pbihcIlxcblwiKX1gfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBoZWlnaHQ6IDEsIGJhY2tncm91bmRDb2xvcjogRURHRSB9fSAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGdhcDogMTIsXG4gICAgICAgICAgICBoZWlnaHQ6IDQ4LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogNDAsIGNvbG9yOiBDLnJlZCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICAgICAge3ZhbHVlLnRvU3RyaW5nKCl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMTcsXG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIEFUVFJJQlVURSBMRVZFTFxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICAgIGhlaWdodDogNDgsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiAxMCB9LFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEVER0UsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VLZXlzIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYsIFQgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IHJuZyB9IGZyb20gXCIuLi8uLi91aS9kZWNvclwiO1xuaW1wb3J0IHsgRklMTCwgSGVhZGVyLCBIaW50LCBIaW50cyB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IGhhbmRsZU9mIH0gZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IHsgRmlndXJlIH0gZnJvbSBcIi4vRmlndXJlXCI7XG5pbXBvcnQgeyBTdGVwSWNvbiB9IGZyb20gXCIuL2dseXBoc1wiO1xuaW1wb3J0IHsgQ2hyb21lLCBDb2xkRnJhbWUsIEhvdEZyYW1lIH0gZnJvbSBcIi4vcGFydHNcIjtcbmltcG9ydCB0eXBlIHsgU3RlcFByb3BzIH0gZnJvbSBcIi4vTmV3R2FtZVwiO1xuXG5jb25zdCBDQVJEID0geyB3aWR0aDogMzcyLCBoZWlnaHQ6IDg3MiwgdG9wOiAxMjUsIGxlZnRzOiBbNTM3LCAxMDE1XSB9O1xuXG4vKiogVGhlIGdlbm9tZSB0aGUgY2FyZHMgYXJlIHByaW50ZWQgb3Zlcjogcm93cyBvZiBjb2RvbiB0cmlwbGV0cy4gKi9cbmZ1bmN0aW9uIGdlbm9tZShzZWVkOiBudW1iZXIpIHtcbiAgY29uc3QgciA9IHJuZyhzZWVkKTtcbiAgY29uc3QgYmFzZSA9ICgpID0+IFwiQUNHVFwiW01hdGguZmxvb3IocigpICogNCldO1xuICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogNzkgfSwgKCkgPT5cbiAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxMiB9LCAoKSA9PiBiYXNlKCkgKyBiYXNlKCkgKyBiYXNlKCkpLmpvaW4oXCIgXCIpLFxuICApLmpvaW4oXCJcXG5cIik7XG59XG5jb25zdCBHRU5PTUUgPSBbZ2Vub21lKDIxKSwgZ2Vub21lKDM0KV07XG5cbi8qKiBCT0RZIFRZUEU6IHR3byB0YWxsIGNhcmRzLCBlYWNoIGEgZmlndXJlIGluIGxpbmUgYXJ0IG92ZXIgaXRzIGdlbm9tZS5cbiAqICBUaGUgaG92ZXJlZCBjYXJkIGlzIGxpdCByZWQ7IGEgY2xpY2sgKG9yIEVudGVyKSBjaG9vc2VzIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJvZHlUeXBlKHsgY2hhcmFjdGVyLCBvbkNoYW5nZSwgbmV4dCwgYmFjayB9OiBTdGVwUHJvcHMpIHtcbiAgY29uc3QgW2hvdCwgc2V0SG90XSA9IHVzZVN0YXRlKGNoYXJhY3Rlci5ib2R5KTtcbiAgY29uc3QgaG92ZXIgPSAoaTogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGkgPT09IGhvdCkgcmV0dXJuO1xuICAgIHNmeChcImhvdmVyXCIpO1xuICAgIHNldEhvdChpKTtcbiAgfTtcbiAgY29uc3QgcGljayA9IChpOiBudW1iZXIpID0+IHtcbiAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3RlciwgYm9keTogaSB9KTtcbiAgICBuZXh0KCk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGJhY2soKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikgaG92ZXIoMCk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09IFwiQXJyb3dSaWdodFwiKSBob3ZlcigxKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJFbnRlclwiIHx8IGUuY29kZSA9PT0gXCJLZXlGXCIpIHBpY2soaG90KTtcbiAgfSk7XG4gIHVzZURlYnVnKFwiaG92ZXJcIiwgKG4pID0+IHNldEhvdChOdW1iZXIobikpKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtGSUxMfT5cbiAgICAgIDxDaHJvbWUgLz5cbiAgICAgIDxIZWFkZXJcbiAgICAgICAgdGl0bGU9XCJCT0RZIFRZUEVcIlxuICAgICAgICBjYXB0aW9uPXtgUElDSyBBIEZSQU1FIEZPUiAke2hhbmRsZU9mKGNoYXJhY3Rlcil9LiBUSEUgV0FZIFlPVSBMT09LIENBTiBDSEFOR0UgSE9XIFNPTUUgUEVPUExFIElOIFNBQkxFIENJVFkgVFJFQVQgWU9VLmB9XG4gICAgICAgIGljb249ezxTdGVwSWNvbiBraW5kPVwiYm9keVwiIC8+fVxuICAgICAgICBzdGVwPXsxfVxuICAgICAgLz5cbiAgICAgIHtDQVJELmxlZnRzLm1hcCgobGVmdCwgaSkgPT4ge1xuICAgICAgICBjb25zdCBsaXQgPSBpID09PSBob3Q7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IGhvdmVyKGkpfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcGljayhpKX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICBsZWZ0LFxuICAgICAgICAgICAgICB0b3A6IENBUkQudG9wLFxuICAgICAgICAgICAgICB3aWR0aDogQ0FSRC53aWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiBDQVJELmhlaWdodCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBsaXRcbiAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBcIiM1YTFkMjBcIiB9LCB7IGNvbG9yOiBcIiMyZTE0MThcIiB9XSxcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2xpdCAmJiAoXG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgICAgbGVmdDogNixcbiAgICAgICAgICAgICAgICAgIHRvcDogMzAsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTAuNSxcbiAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYubW9ubyxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcIiM3NjI4MmJcIixcbiAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IDEuMCxcbiAgICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEuNSxcbiAgICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge0dFTk9NRVtpXX1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgICBsZWZ0OiA4LFxuICAgICAgICAgICAgICAgIHRvcDogOCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICAgICAgY29sb3I6IGxpdCA/IFwiI2Q3YTI5YlwiIDogXCIjNmIzYTNhXCIsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpID09PSAwXG4gICAgICAgICAgICAgICAgPyBcIlNDMjA5MTEwMDcwNDUxMTgzNjkwMDQyMFwiXG4gICAgICAgICAgICAgICAgOiBcIlNDMjA5MTEwMDcwNDUxNzI5MDM2MTE4NVwifVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDI2MixcbiAgICAgICAgICAgICAgICB0b3A6IDgsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBsaXQgPyBcIiNkN2EyOWJcIiA6IFwiIzZiM2EzYVwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAwNy4xMC4yMDkxXG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIC4uLkZJTEwsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IHRvcDogNTYgfSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEZpZ3VyZVxuICAgICAgICAgICAgICAgIGJ1aWxkPXtpfVxuICAgICAgICAgICAgICAgIGhlaWdodD17NzgwfVxuICAgICAgICAgICAgICAgIGNvbG9yPXtsaXQgPyBDLmN5YW4gOiBcIiMzYTc2ODBcIn1cbiAgICAgICAgICAgICAgICBhY2NlbnQ9e2xpdCA/IFwiI2ZmZTRkY1wiIDogXCIjNWEzMjM2XCJ9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICA8TWFyayBsaXQ9e2xpdH0gLz5cbiAgICAgICAgICAgIHtsaXQgPyAoXG4gICAgICAgICAgICAgIDxIb3RGcmFtZSBiYXI9ezIyfSBjdXQ9ezUwfSBzdGVwPXsxNjB9IC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8Q29sZEZyYW1lIGN1dD17NTB9IGxpbmU9XCIjNGExYzFmXCIgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICk7XG4gICAgICB9KX1cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIm1vdXNlXCIgbGFiZWw9XCJTRUxFQ1RcIiAvPlxuICAgICAgICA8SGludCBrPVwiRVNDXCIgbGFiZWw9XCJCQUNLXCIgb25DbGljaz17YmFja30gLz5cbiAgICAgIDwvSGludHM+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHJlZ2lzdHJ5J3MgbWFyayBvbiBlYWNoIGNhcmQncyBmb290OiBhIGZvdXItcG9pbnQgc3RhciwgU0M5MSBhbmRcbiAqICB0aGUgdGVtcGxhdGUncyBzbWFsbCBwcmludC4gKi9cbmZ1bmN0aW9uIE1hcmsoeyBsaXQgfTogeyBsaXQ6IGJvb2xlYW4gfSkge1xuICBjb25zdCBjb2xvciA9IGxpdCA/IEMucmVkIDogXCIjN2EyYjJiXCI7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAxNCxcbiAgICAgICAgYm90dG9tOiAxNCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgZ2FwOiAxLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDQgfX0+XG4gICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyMCAyMFwiIHN0eWxlPXt7IHdpZHRoOiAyMCwgaGVpZ2h0OiAyMCB9fT5cbiAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgcG9pbnRzPXtbXG4gICAgICAgICAgICAgIDEwLCAwLCAxMi41LCA3LjUsIDIwLCAxMCwgMTIuNSwgMTIuNSwgMTAsIDIwLCA3LjUsIDEyLjUsIDAsIDEwLFxuICAgICAgICAgICAgICA3LjUsIDcuNSxcbiAgICAgICAgICAgIF19XG4gICAgICAgICAgICBmaWxsPXtjb2xvcn1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IDI4LFxuICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFNDOTFcbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDcsIGNvbG9yIH19PlxuICAgICAgICB7XCJCSU9NRVRSSUMgVEVNUExBVEVcXG5TVEFOREFSRCA5MS1BXCJ9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgIi8qKiBIYWxmIG91dGxpbmVzIChyaWdodCBzaWRlLCBmbGF0IGBbeCwgeSwg4oCmXWAsIHggZnJvbSB0aGUgY2VudGVyIGxpbmUsIHlcbiAqICBkb3duKSBvZiB0aGUgdHdvIGJ1aWxkcyBpbiBhIDMwMCDDlyA3ODAgYm94OiBoZWFkLCBzaG91bGRlciwgcm91bmQgdGhlXG4gKiAgaGFuZ2luZyBhcm0gYW5kIGJhY2sgdXAgaW50byB0aGUgYXJtcGl0LCBkb3duIHRoZSBmbGFuayBhbmQgdGhlIG91dGVyXG4gKiAgbGVnLCB0aGUgZm9vdCwgdXAgdGhlIGlubmVyIGxlZy4gTWlycm9yZWQgaW50byBvbmUgcG9seWdvbi4gKi9cbmNvbnN0IEJVSUxEUyA9IFtcbiAgW1xuICAgIDAsIDI4LCAxMywgMzAsIDIyLCAzNywgMjcsIDUwLCAyOCwgNjYsIDI2LCA4MiwgMjEsIDk2LCAxNCwgMTA2LCAxMiwgMTE0LCAxMyxcbiAgICAxMjYsIDMwLCAxMzQsIDUyLCAxNDEsIDY2LCAxNTAsIDc0LCAxNjYsIDc4LCAxOTYsIDgwLCAyMzYsIDc5LCAyNjIsIDc3LCAzMDAsXG4gICAgNzMsIDM0MCwgNzAsIDM3MiwgNzMsIDM5MiwgNzIsIDQxNCwgNjYsIDQyOCwgNTksIDQyNCwgNTcsIDQwNCwgNTYsIDM3NiwgNTUsXG4gICAgMzQ0LCA1NCwgMzA0LCA1MywgMjcwLCA1MSwgMjMyLCA0OCwgMjAwLCA0NiwgMjEyLCA0NCwgMjUwLCA0MCwgMjk2LCA0MCwgMzIwLFxuICAgIDQ1LCAzNTIsIDQ4LCAzODQsIDQ3LCA0NDAsIDQ0LCA1MDAsIDQwLCA1MzAsIDM5LCA1NjAsIDQwLCA2MDAsIDM2LCA2NjAsIDMxLFxuICAgIDcxMiwgMzYsIDczMCwgNDAsIDc0OCwgMzAsIDc1NCwgMTQsIDc1NCwgMTIsIDczNiwgMTMsIDcxMiwgMTIsIDY2MCwgMTMsIDYwMCxcbiAgICAxMSwgNTYwLCAxMiwgNTMwLCAxMCwgNDcwLCA2LCA0MjAsIDAsIDQwNCxcbiAgXSxcbiAgW1xuICAgIDAsIDMwLCAxMiwgMzIsIDIwLCAzOCwgMjUsIDUwLCAyNiwgNjUsIDI0LCA4MCwgMTksIDkzLCAxMiwgMTAzLCAxMCwgMTEyLCAxMSxcbiAgICAxMjQsIDI0LCAxMzIsIDQyLCAxMzksIDUzLCAxNDcsIDU5LCAxNjIsIDYxLCAxOTIsIDYyLCAyMzAsIDYxLCAyNTgsIDU5LCAyOTYsXG4gICAgNTYsIDMzNCwgNTMsIDM2NCwgNTYsIDM4NCwgNTUsIDQwNCwgNTAsIDQxOCwgNDQsIDQxNCwgNDIsIDM5NiwgNDIsIDM2OCwgNDIsXG4gICAgMzM2LCA0MiwgMzAwLCA0MiwgMjY4LCA0MSwgMjM0LCA0MCwgMjAwLCAzOCwgMjE0LCAzNywgMjQ0LCAzMSwgMjg4LCAzMSwgMzA0LFxuICAgIDQwLCAzNDYsIDUwLCAzODgsIDQ5LCA0NDAsIDQ0LCA1MDAsIDM4LCA1MzIsIDM3LCA1NjIsIDM4LCA2MDAsIDMzLCA2NjAsIDI4LFxuICAgIDcxMiwgMzIsIDczMCwgMzUsIDc0OCwgMjYsIDc1NCwgMTMsIDc1NCwgMTEsIDczNiwgMTIsIDcxMiwgMTEsIDY2MCwgMTIsIDYwMCxcbiAgICAxMCwgNTYyLCAxMSwgNTMyLCA5LCA0NzAsIDUsIDQyNCwgMCwgNDA4LFxuICBdLFxuXTtcblxuLyoqIExpbmVzIGluc2lkZSBlYWNoIGJ1aWxkIChjb2xsYXJib25lcywgc3Rlcm51bSwgY2hlc3QsIGFicywgaGlwcyxcbiAqICBrbmVlcyksIGFzIGhhbGYgcG9seWxpbmVzLCBtaXJyb3JlZCB0b28uICovXG5jb25zdCBERVRBSUxTID0gW1xuICBbXG4gICAgWzgsIDE0MiwgNDAsIDEzNl0sXG4gICAgWzAsIDE1MCwgMCwgMjUwXSxcbiAgICBbMCwgMTk4LCAxOCwgMjAyLCAzNiwgMTkyXSxcbiAgICBbNCwgMjM2LCAxNiwgMjM0XSxcbiAgICBbNCwgMjYyLCAxNywgMjYxXSxcbiAgICBbNCwgMjg4LCAxNywgMjg4XSxcbiAgICBbMzAsIDMzMCwgMTIsIDM4MF0sXG4gICAgWzE4LCA1MjYsIDI2LCA1MzQsIDM0LCA1MjZdLFxuICBdLFxuICBbXG4gICAgWzcsIDEzNiwgMzIsIDEzMl0sXG4gICAgWzAsIDE0NCwgMCwgMjE0XSxcbiAgICBbNCwgMjE0LCAxNiwgMjIyLCAzMCwgMjE0LCAzNCwgMTk2XSxcbiAgICBbMjIsIDI4NiwgMzEsIDI5Nl0sXG4gICAgWzI4LCAzMzAsIDEwLCAzODRdLFxuICAgIFsxNiwgNTI4LCAyNCwgNTM2LCAzMiwgNTI4XSxcbiAgXSxcbl07XG5cbi8qKiBUaGUgam9pbnRzLCBtYXJrZWQgd2l0aCByaW5nczogc2hvdWxkZXIsIGVsYm93LCB3cmlzdCwgaGlwLCBrbmVlLFxuICogIGFua2xlLiAqL1xuY29uc3QgSk9JTlRTID0gW1xuICBbNjYsIDE1MiwgNjcsIDI2MiwgNjMsIDM3MiwgMzIsIDM4NCwgMjYsIDUzMiwgMjIsIDcxMl0sXG4gIFs1MCwgMTQ4LCA1MiwgMjU4LCA0OCwgMzY2LCAzMCwgMzg4LCAyNCwgNTM0LCAyMCwgNzEyXSxcbl07XG5cbmNvbnN0IENYID0gMTUwO1xuLyoqIEZsYXQgaGFsZiBwb2ludHMg4oaSIGZsYXQgcG9pbnRzLCBtaXJyb3JlZCB3aGVuIGBzID0gLTFgLiAqL1xuY29uc3Qgc2lkZSA9IChhOiBudW1iZXJbXSwgczogbnVtYmVyKSA9PlxuICBhLm1hcCgodiwgaSkgPT4gKGkgJSAyID8gdiA6IENYICsgcyAqIHYpKTtcbi8qKiBBIGhhbGYgb3V0bGluZSBhbmQgaXRzIG1pcnJvciBpbWFnZSwgYXMgb25lIGNsb3NlZCBvdXRsaW5lLiAqL1xuZnVuY3Rpb24gbWlycm9yKGhhbGY6IG51bWJlcltdKSB7XG4gIGNvbnN0IGJhY2s6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGkgPSBoYWxmLmxlbmd0aCAtIDQ7IGkgPj0gMjsgaSAtPSAyKSBiYWNrLnB1c2goaGFsZltpXSwgaGFsZltpICsgMV0pO1xuICByZXR1cm4gWy4uLnNpZGUoaGFsZiwgMSksIC4uLnNpZGUoYmFjaywgLTEpXTtcbn1cblxuLyoqIEEgc3RhbmRpbmcgZmlndXJlIGluIGxpbmUgYXJ0IChgYnVpbGRgIDAgb3IgMSkg4oCUIHdoYXQgdGhlIGJvZHktdHlwZVxuICogIGNhcmRzIHNob3cgaW4gcGxhY2Ugb2YgYSAzRCBtb2RlbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWd1cmUoe1xuICBidWlsZCxcbiAgY29sb3IsXG4gIGFjY2VudCxcbiAgaGVpZ2h0LFxufToge1xuICBidWlsZDogbnVtYmVyO1xuICBjb2xvcjogc3RyaW5nO1xuICBhY2NlbnQ6IHN0cmluZztcbiAgaGVpZ2h0OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IG91dGxpbmUgPSBtaXJyb3IoQlVJTERTW2J1aWxkXSk7XG4gIGNvbnN0IGpvaW50cyA9IEpPSU5UU1tidWlsZF07XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDMwMCA3ODBcIiBzdHlsZT17eyB3aWR0aDogKGhlaWdodCAqIDMwMCkgLyA3ODAsIGhlaWdodCB9fT5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17b3V0bGluZX0gZmlsbD17Y29sb3J9IG9wYWNpdHk9ezAuMTJ9IC8+XG4gICAgICA8cG9seWdvblxuICAgICAgICBwb2ludHM9e291dGxpbmV9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAge0RFVEFJTFNbYnVpbGRdLmZsYXRNYXAoKGxpbmUsIGkpID0+XG4gICAgICAgIFsxLCAtMV0ubWFwKChzKSA9PiAoXG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBrZXk9e2Ake2l9JHtzfWB9XG4gICAgICAgICAgICBwb2ludHM9e3NpZGUobGluZSwgcyl9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezF9XG4gICAgICAgICAgICBvcGFjaXR5PXswLjU1fVxuICAgICAgICAgIC8+XG4gICAgICAgICkpLFxuICAgICAgKX1cbiAgICAgIHtbMSwgLTFdLmZsYXRNYXAoKHMpID0+XG4gICAgICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IGpvaW50cy5sZW5ndGggLyAyIH0sIChfLCBpKSA9PiAoXG4gICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAga2V5PXtgJHtpfSR7c31gfVxuICAgICAgICAgICAgY3g9e0NYICsgcyAqIGpvaW50c1syICogaV19XG4gICAgICAgICAgICBjeT17am9pbnRzWzIgKiBpICsgMV19XG4gICAgICAgICAgICByPXszLjJ9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e2FjY2VudH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjJ9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSksXG4gICAgICApfVxuICAgICAge1sxMjAsIDMzMCwgNTYwXS5tYXAoKHkpID0+IChcbiAgICAgICAgPGxpbmVcbiAgICAgICAgICBrZXk9e3l9XG4gICAgICAgICAgeDE9ezIwfVxuICAgICAgICAgIHkxPXt5fVxuICAgICAgICAgIHgyPXsyODB9XG4gICAgICAgICAgeTI9e3l9XG4gICAgICAgICAgc3Ryb2tlPXthY2NlbnR9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezAuNn1cbiAgICAgICAgICBvcGFjaXR5PXswLjR9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L3N2Zz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4uLy4uL2JldnlcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VLZXlzIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IERJRkZJQ1VMVElFUyB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQywgVCB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgRklMTCwgSGludCwgSGludHMgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBESUZGSUNVTFRZX1RFWFQgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBTdGVwSWNvbiB9IGZyb20gXCIuL2dseXBoc1wiO1xuaW1wb3J0IHsgQmFyY29kZSwgSG90RnJhbWUgfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IHR5cGUgeyBTdGVwUHJvcHMgfSBmcm9tIFwiLi9OZXdHYW1lXCI7XG5cbi8qKiBTRUxFQ1QgRElGRklDVUxUWSBMRVZFTDogdGhlIGJ1cm5pbmcgc3RyZWV0IGluIGEgbGl0IGZyYW1lLCB0aGUgbGV2ZWwnc1xuICogIGJsdXJiIHVuZGVyIGl0IGFuZCB0aGUgZm91ciBsZXZlbHMuIEhvdmVyaW5nIGEgbGV2ZWwgcHJldmlld3MgaXQgKHRoZVxuICogIHN0cmVldCBidXJucyBob3R0ZXIpOyBhIGNsaWNrIG9yIEVudGVyIHBpY2tzIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERpZmZpY3VsdHkoeyBjaGFyYWN0ZXIsIG9uQ2hhbmdlLCBuZXh0LCBiYWNrIH06IFN0ZXBQcm9wcykge1xuICBjb25zdCBbaG90LCBzZXRIb3RdID0gdXNlU3RhdGUoXG4gICAgTWF0aC5tYXgoXG4gICAgICAwLFxuICAgICAgRElGRklDVUxUSUVTLmZpbmRJbmRleCgoZCkgPT4gZC5pZCA9PT0gY2hhcmFjdGVyLmRpZmZpY3VsdHkpLFxuICAgICksXG4gICk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYmV2eS5kaW9yYW1hcy5kaWZmaWN1bHR5KHsgbGV2ZWw6IGhvdCB9KTtcbiAgfSwgW2hvdF0pO1xuICBjb25zdCBob3ZlciA9IChpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoaSA9PT0gaG90KSByZXR1cm47XG4gICAgc2Z4KFwiaG92ZXJcIik7XG4gICAgc2V0SG90KGkpO1xuICB9O1xuICBjb25zdCBwaWNrID0gKGk6IG51bWJlcikgPT4ge1xuICAgIG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCBkaWZmaWN1bHR5OiBESUZGSUNVTFRJRVNbaV0uaWQgfSk7XG4gICAgbmV4dCgpO1xuICB9O1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSBiYWNrKCk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09IFwiQXJyb3dMZWZ0XCIpIGhvdmVyKE1hdGgubWF4KDAsIGhvdCAtIDEpKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd1JpZ2h0XCIpXG4gICAgICBob3ZlcihNYXRoLm1pbihESUZGSUNVTFRJRVMubGVuZ3RoIC0gMSwgaG90ICsgMSkpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkVudGVyXCIgfHwgZS5jb2RlID09PSBcIktleUZcIikgcGljayhob3QpO1xuICB9KTtcbiAgdXNlRGVidWcoXCJob3ZlclwiLCAobikgPT4gc2V0SG90KE51bWJlcihuKSkpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPENlbnRlcmVkSGVhZGVyIHRpdGxlPVwiU0VMRUNUIERJRkZJQ1VMVFkgTEVWRUxcIiAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzODEsXG4gICAgICAgICAgdG9wOiAxMDcsXG4gICAgICAgICAgd2lkdGg6IDExNTksXG4gICAgICAgICAgaGVpZ2h0OiA1NzcsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLkZJTEwsIGJhY2tncm91bmRDb2xvcjogXCIjMGMwYjEyXCIgfX0gLz5cbiAgICAgICAgPHBvcnRhbCB0YXJnZXQ9XCJjYXJkLWRpZmZpY3VsdHlcIiBzdHlsZT17eyAuLi5GSUxMLCBjYWNoZTogXCJuZXZlclwiIH19IC8+XG4gICAgICAgIDxIb3RGcmFtZSBiYXI9ezIyfSBjdXQ9ezIyfSBzdGVwPXs5OH0gLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5ib2R5LFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDM3OCxcbiAgICAgICAgICB0b3A6IDcwNixcbiAgICAgICAgICB3aWR0aDogMTE4MCxcbiAgICAgICAgICBmb250U2l6ZTogMjcsXG4gICAgICAgICAgbGluZUhlaWdodDogMS4yMixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge0RJRkZJQ1VMVFlfVEVYVFtESUZGSUNVTFRJRVNbaG90XS5pZF19XG4gICAgICA8L3RleHQ+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDM2NixcbiAgICAgICAgICB0b3A6IDg0NyxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtESUZGSUNVTFRJRVMubWFwKChkLCBpKSA9PiAoXG4gICAgICAgICAgPExldmVsQnV0dG9uXG4gICAgICAgICAgICBrZXk9e2QuaWR9XG4gICAgICAgICAgICBsYWJlbD17ZC5uYW1lfVxuICAgICAgICAgICAgaG90PXtpID09PSBob3R9XG4gICAgICAgICAgICBzZWVkPXtpICsgNH1cbiAgICAgICAgICAgIG9uRW50ZXI9eygpID0+IGhvdmVyKGkpfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcGljayhpKX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIm1vdXNlXCIgbGFiZWw9XCJTRUxFQ1RcIiAvPlxuICAgICAgICA8SGludCBrPVwiRVNDXCIgbGFiZWw9XCJCQUNLXCIgb25DbGljaz17YmFja30gLz5cbiAgICAgIDwvSGludHM+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSBsZXZlbCBwbGF0ZTogYSBub3RjaGVkIHRvcCBlZGdlLCBhIGN1dCBmb290LCBhIHRhYiBvbiB0aGUgbGVmdC4gTGl0XG4gKiAgcmVkIHdpdGggYSBjb2RlIHN0cmlwIHVuZGVyIGl0IHdoaWxlIGhvdC4gKi9cbmNvbnN0IFBMQVRFID0gW1xuICAxLCA1LCAyMiwgNSwgMjcsIDEwLCAxNzIsIDEwLCAxNzgsIDEsIDI5MSwgMSwgMjkxLCA3MSwgMTUsIDcxLCAxLCA1Nyxcbl07XG5cbmZ1bmN0aW9uIExldmVsQnV0dG9uKHtcbiAgbGFiZWwsXG4gIGhvdCxcbiAgc2VlZCxcbiAgb25FbnRlcixcbiAgb25DbGljayxcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgaG90OiBib29sZWFuO1xuICBzZWVkOiBudW1iZXI7XG4gIG9uRW50ZXI6ICgpID0+IHZvaWQ7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IGxpbmUgPSBob3QgPyBcIiNmMDUyNGFcIiA6IFwiIzVjMWMxZVwiO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uUG9pbnRlckVudGVyPXtvbkVudGVyfVxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiAyOTIsXG4gICAgICAgIGhlaWdodDogNzIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3ZnXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMjkyIDcyXCJcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICB3aWR0aDogMjkyLFxuICAgICAgICAgIGhlaWdodDogNzIsXG4gICAgICAgICAgZmlsdGVyOiBob3RcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwic2hhZG93XCIsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDI1NSwgNjAsIDUyLCAwLjU1KVwiLFxuICAgICAgICAgICAgICAgICAgb2Zmc2V0WDogMCxcbiAgICAgICAgICAgICAgICAgIG9mZnNldFk6IDAsXG4gICAgICAgICAgICAgICAgICBzcHJlYWQ6IDEwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIHBvaW50cz17UExBVEV9XG4gICAgICAgICAgZmlsbD17aG90ID8gXCIjNmQyMjIxXCIgOiBcIiMwZDBmMTZcIn1cbiAgICAgICAgICBzdHJva2U9e2xpbmV9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9e2hvdCA/IDIgOiAxLjJ9XG4gICAgICAgIC8+XG4gICAgICAgIDxyZWN0XG4gICAgICAgICAgeD17MX1cbiAgICAgICAgICB5PXszNH1cbiAgICAgICAgICB3aWR0aD17MjR9XG4gICAgICAgICAgaGVpZ2h0PXs0fVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e2xpbmV9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezF9XG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udFNpemU6IDI1LFxuICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgbGV0dGVyU3BhY2luZzogMC41LFxuICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2xhYmVsfVxuICAgICAgPC90ZXh0PlxuICAgICAge2hvdCAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHRvcDogNzgsXG4gICAgICAgICAgICB3aWR0aDogMjkyLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIGdhcDogMixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiA1IH19PlxuICAgICAgICAgICAgPEJhcmNvZGUgc2VlZD17MX0gd2lkdGg9ezE0fSBoZWlnaHQ9ezE4fSAvPlxuICAgICAgICAgICAgPEJhcmNvZGUgc2VlZD17c2VlZH0gd2lkdGg9ezI1NH0gaGVpZ2h0PXsxOH0gLz5cbiAgICAgICAgICAgIDxCYXJjb2RlIHNlZWQ9ezJ9IHdpZHRoPXsxNH0gaGVpZ2h0PXsxOH0gLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgXCJSRUZcIixcbiAgICAgICAgICAgICAgXCI1NDE1MjEwIDEwNTY4NDUgNTFcIixcbiAgICAgICAgICAgICAgXCI4NTA1NDEwMzAgNTQwNDU0XCIsXG4gICAgICAgICAgICAgIFwiNDg1MTUxIDU5MDc4NzA5XCIsXG4gICAgICAgICAgICAgIFwiMjBKRzhXNFwiLFxuICAgICAgICAgICAgICBcIk5DXCIsXG4gICAgICAgICAgICBdLm1hcCgodCkgPT4gKFxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIGtleT17dH1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiA3LFxuICAgICAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dH1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogVGhlIGRpZmZpY3VsdHkgc3RlcCdzIGhlYWRlcjogdGhlIHJlZCBydWxlIGFuZCBpdHMgZml2ZSAodW5saXQpXG4gKiAgc2VnbWVudHMsIHRoZSB0aXRsZSBjZW50ZXJlZCBvdmVyIHRoZW0uICovXG5mdW5jdGlvbiBDZW50ZXJlZEhlYWRlcih7IHRpdGxlIH06IHsgdGl0bGU6IHN0cmluZyB9KSB7XG4gIGNvbnN0IGxlZnQgPSA2MDY7XG4gIGNvbnN0IHdpZHRoID0gNSAqIDEzOCArIDQgKiA2O1xuICBjb25zdCBydWxlID0gXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjc1KVwiO1xuICBjb25zdCBmYWludCA9IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4zNSlcIjtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGhlaWdodDogNjAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICB3aWR0aDogbGVmdCAtIDgsXG4gICAgICAgICAgdG9wOiA0NCxcbiAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDkwLFxuICAgICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBmYWludCB9LCB7IGNvbG9yOiBydWxlIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiBsZWZ0ICsgd2lkdGggKyA4LFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogNDQsXG4gICAgICAgICAgaGVpZ2h0OiAyLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGFuZ2xlOiA5MCxcbiAgICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogcnVsZSB9LCB7IGNvbG9yOiBmYWludCB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdCxcbiAgICAgICAgICB0b3A6IDUwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgZ2FwOiA2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7WzAsIDEsIDIsIDMsIDRdLm1hcCgoaSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogMTM4LCBoZWlnaHQ6IDIsIGJhY2tncm91bmRDb2xvcjogQy5yZWRMaW5lIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgdG9wOiA4LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDgsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxTdGVwSWNvbiBraW5kPVwiZGlmZmljdWx0eVwiIC8+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDcsIGNvbG9yOiBDLmN5YW4sIGxpbmVIZWlnaHQ6IDEuMSB9fVxuICAgICAgICA+XG4gICAgICAgICAge1wiMDAxMDAwMDBcXG4wMTAwMDExMVxcbjAxMDAxMTExXCJ9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e1QudGl0bGV9Pnt0aXRsZX08L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VEZWJ1ZywgdXNlS2V5cyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBMSUZFUEFUSFMgfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcbmltcG9ydCB7IEMgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEZJTEwsIEhlYWRlciwgSGludCwgSGludHMgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBMSUZFUEFUSF9URVhUIH0gZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IHsgU3RlcEljb24gfSBmcm9tIFwiLi9nbHlwaHNcIjtcbmltcG9ydCB7IENocm9tZSwgQ29sZEZyYW1lLCBIb3RGcmFtZSB9IGZyb20gXCIuL3BhcnRzXCI7XG5pbXBvcnQgdHlwZSB7IFN0ZXBQcm9wcyB9IGZyb20gXCIuL05ld0dhbWVcIjtcblxuY29uc3QgQ0FSRCA9IHsgd2lkdGg6IDM3NCwgaGVpZ2h0OiA1NTEsIHBpdGNoOiA0NDgsIGxlZnQ6IDMxMywgdG9wOiAxNjkgfTtcblxuLyoqIExJRkVQQVRIOiB0aHJlZSB0YWxsIGNhcmRzLCBlYWNoIGEgbGl0dGxlIHdvcmxkIGZpbG1lZCBpbnRvIGEgcG9ydGFsLlxuICogIFRoZSBob3ZlcmVkIG9uZSBsaWdodHMgdXAgYW5kIHRlbGxzIGl0cyBzdG9yeSB1bmRlcm5lYXRoOyBhIGNsaWNrIChvclxuICogIEVudGVyKSBjaG9vc2VzIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpZmVwYXRoKHsgY2hhcmFjdGVyLCBvbkNoYW5nZSwgbmV4dCwgYmFjayB9OiBTdGVwUHJvcHMpIHtcbiAgY29uc3QgW2hvdCwgc2V0SG90XSA9IHVzZVN0YXRlKFxuICAgIE1hdGgubWF4KFxuICAgICAgMCxcbiAgICAgIExJRkVQQVRIUy5maW5kSW5kZXgoKGwpID0+IGwuaWQgPT09IGNoYXJhY3Rlci5saWZlcGF0aCksXG4gICAgKSxcbiAgKTtcbiAgY29uc3QgaG92ZXIgPSAoaTogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGkgPT09IGhvdCkgcmV0dXJuO1xuICAgIHNmeChcImhvdmVyXCIpO1xuICAgIHNldEhvdChpKTtcbiAgfTtcbiAgY29uc3QgcGljayA9IChpOiBudW1iZXIpID0+IHtcbiAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3RlciwgbGlmZXBhdGg6IExJRkVQQVRIU1tpXS5pZCB9KTtcbiAgICBuZXh0KCk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGJhY2soKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikgaG92ZXIoTWF0aC5tYXgoMCwgaG90IC0gMSkpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkFycm93UmlnaHRcIilcbiAgICAgIGhvdmVyKE1hdGgubWluKExJRkVQQVRIUy5sZW5ndGggLSAxLCBob3QgKyAxKSk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIiB8fCBlLmNvZGUgPT09IFwiS2V5RlwiKSBwaWNrKGhvdCk7XG4gIH0pO1xuICB1c2VEZWJ1ZyhcImhvdmVyXCIsIChuKSA9PiBzZXRIb3QoTnVtYmVyKG4pKSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8Q2hyb21lIC8+XG4gICAgICA8SGVhZGVyXG4gICAgICAgIHRpdGxlPVwiTElGRVBBVEhcIlxuICAgICAgICBjYXB0aW9uPVwiV0hFUkUgWU9VIENPTUUgRlJPTSBERUNJREVTIFdITyBPUEVOUyBUSEUgRE9PUiBGT1IgWU9VLiBTT01FIEpPQlMgQU5EIENPTlZFUlNBVElPTlMgSU4gU0FCTEUgQ0lUWSBXSUxMIENIQU5HRSBXSVRIIFRISVMgQ0hPSUNFLlwiXG4gICAgICAgIGljb249ezxTdGVwSWNvbiBraW5kPVwibGlmZXBhdGhcIiAvPn1cbiAgICAgICAgc3RlcD17MH1cbiAgICAgIC8+XG4gICAgICB7TElGRVBBVEhTLm1hcCgobCwgaSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAga2V5PXtsLmlkfVxuICAgICAgICAgIG9uUG9pbnRlckVudGVyPXsoKSA9PiBob3ZlcihpKX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBwaWNrKGkpfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIGxlZnQ6IENBUkQubGVmdCArIGkgKiBDQVJELnBpdGNoLFxuICAgICAgICAgICAgdG9wOiBDQVJELnRvcCxcbiAgICAgICAgICAgIHdpZHRoOiBDQVJELndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBDQVJELmhlaWdodCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICBsZWZ0OiA5LFxuICAgICAgICAgICAgICB0b3A6IC00NixcbiAgICAgICAgICAgICAgZm9udFNpemU6IDMzLFxuICAgICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2wubmFtZX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uRklMTCwgYmFja2dyb3VuZENvbG9yOiBcIiMwYzBiMTJcIiB9fSAvPlxuICAgICAgICAgIDxwb3J0YWwgdGFyZ2V0PXtgY2FyZC0ke2wuaWR9YH0gc3R5bGU9e3sgLi4uRklMTCwgY2FjaGU6IFwibmV2ZXJcIiB9fSAvPlxuICAgICAgICAgIHtpID09PSBob3QgPyA8SG90RnJhbWUgYmFyPXsyMH0gY3V0PXs0Nn0gc3RlcD17OTZ9IC8+IDogPENvbGRGcmFtZSAvPn1cbiAgICAgICAgICB7aSA9PT0gaG90ICYmIChcbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgICAgbGVmdDogLTIsXG4gICAgICAgICAgICAgICAgdG9wOiBDQVJELmhlaWdodCArIDE0LFxuICAgICAgICAgICAgICAgIHdpZHRoOiBDQVJELndpZHRoICsgMjQsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDI0LFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAxLjE4LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7TElGRVBBVEhfVEVYVFtsLmlkXX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNFTEVDVFwiIC8+XG4gICAgICAgIDxIaW50IGs9XCJFU0NcIiBsYWJlbD1cIkJBQ0tcIiBvbkNsaWNrPXtiYWNrfSAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgaW50ZXJwb2xhdGUsXG4gIHVzZVNoYXJlZFZhbHVlLFxuICB3aXRoRGVsYXksXG4gIHdpdGhUaW1pbmcsXG4gIHR5cGUgU2hhcmVkVmFsdWUsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyB1c2VFbnRlciwgdXNlS2V5cyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBGSUxMLCBIZWFkZXIsIEhpbnQsIEhpbnRzIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgSWRDYXJkIH0gZnJvbSBcIi4vSWRDYXJkXCI7XG5pbXBvcnQgeyBTdGVwSWNvbiB9IGZyb20gXCIuL2dseXBoc1wiO1xuaW1wb3J0IHsgQ2hyb21lLCBOYXZCdXR0b25zIH0gZnJvbSBcIi4vcGFydHNcIjtcbmltcG9ydCB0eXBlIHsgU3RlcFByb3BzIH0gZnJvbSBcIi4vTmV3R2FtZVwiO1xuXG5jb25zdCBQQU5FTCA9IFwiI2NiNDAzYlwiO1xuXG4vKiogU1VNTUFSWTogdGhlIGZpbmlzaGVkIElEIGNhcmQgYW5kIHRoZSBCSU9NT05JVE9SIFBBTkVMIHN5bmNpbmcgdG8gMTAwJVxuICogIChhIHNoYXJlZCB2YWx1ZSBCZXZ5IHJ1bnM7IHRoZSBkaWdpdHMgcm9sbCBvbiBpdHMgY2xvY2spLiBTVEFSVCAob3IgRilcbiAqICBiZWdpbnMgdGhlIGdhbWUuICovXG5leHBvcnQgZnVuY3Rpb24gU3VtbWFyeSh7XG4gIGNoYXJhY3RlcixcbiAgb25DaGFuZ2UsXG4gIGJhY2ssXG4gIG9uU3RhcnQsXG59OiBTdGVwUHJvcHMgJiB7IG9uU3RhcnQ6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBbZWRpdGluZywgc2V0RWRpdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtkb25lLCBzZXREb25lXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgZW50ZXIgPSB1c2VFbnRlcig0MCwgMTIwLCAzNjApO1xuICBjb25zdCBwcm9ncmVzcyA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHByb2dyZXNzLnZhbHVlID0gd2l0aERlbGF5KFxuICAgICAgMzUwLFxuICAgICAgd2l0aFRpbWluZygxLCB7IGR1cmF0aW9uOiAyNDAwLCBlYXNpbmc6IFwiZWFzZUluT3V0XCIgfSksXG4gICAgICAoZmluaXNoZWQpID0+IGZpbmlzaGVkICYmIHNldERvbmUodHJ1ZSksXG4gICAgKTtcbiAgfSwgW3Byb2dyZXNzXSk7XG4gIGNvbnN0IHN0YXJ0ID0gKCkgPT4ge1xuICAgIHNmeChcImNvbmZpcm1cIik7XG4gICAgb25TdGFydCgpO1xuICB9O1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKGVkaXRpbmcpIHJldHVybjtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGJhY2soKTtcbiAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5RlwiIHx8IGUua2V5ID09PSBcIkVudGVyXCIpIHN0YXJ0KCk7XG4gIH0pO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPENocm9tZSAvPlxuICAgICAgPEhlYWRlclxuICAgICAgICB0aXRsZT1cIlNVTU1BUllcIlxuICAgICAgICBjYXB0aW9uPVwiVEhFIEZJTEUgSVMgT1BFTi4gU0FCTEUgQ0lUWSBXSUxMIFdSSVRFIFRIRSBSRVNULlwiXG4gICAgICAgIGljb249ezxTdGVwSWNvbiBraW5kPVwic3VtbWFyeVwiIC8+fVxuICAgICAgICBzdGVwPXs0fVxuICAgICAgLz5cbiAgICAgIDxJZENhcmRcbiAgICAgICAgY2hhcmFjdGVyPXtjaGFyYWN0ZXJ9XG4gICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgb25FZGl0aW5nPXtzZXRFZGl0aW5nfVxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgbGVmdDogNDIwLCB0b3A6IDE5NiB9fVxuICAgICAgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDIxNSxcbiAgICAgICAgICB0b3A6IDM2MCxcbiAgICAgICAgICAuLi5lbnRlcixcbiAgICAgICAgICB3aWR0aDogNTkyLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiA2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDYgfX0+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAyIH19PlxuICAgICAgICAgICAge1syMiwgMTQsIDIwLCAxMF0ubWFwKCh3LCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiB3LCBoZWlnaHQ6IDIsIGJhY2tncm91bmRDb2xvcjogQy5yZWREaW0gfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogNS41LCBjb2xvcjogQy5yZWREaW0gfX0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwiQklPTU9OSVRPUiA3LjFcXG5ORVVSQUwgTElOSyBTVEFCTEVcXG5DRVJUSUZJRUQgU0NQRCBVTklUXFxuTk8gVVNFUiBTRVJWSUNFQUJMRSBQQVJUU1wiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmNoYW1mZXIoXCIjMWIxMDE3XCIsIDMwLCBQQU5FTCwgMiksXG4gICAgICAgICAgICBoZWlnaHQ6IDE4MSxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDQ0LCByaWdodDogMzQsIHRvcDogMTQsIGJvdHRvbTogMTIgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDI2LFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFBBTkVMLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgcmlnaHQ6IC0yLFxuICAgICAgICAgICAgICB0b3A6IDI0LFxuICAgICAgICAgICAgICBib3R0b206IDQwLFxuICAgICAgICAgICAgICB3aWR0aDogNCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBQQU5FTCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDI5LFxuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgQklPTU9OSVRPUiBQQU5FTFxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDIxLFxuICAgICAgICAgICAgICBjb2xvcjogZG9uZSA/IFwiI2Q5NDgzZlwiIDogXCIjYjgzYjM1XCIsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IDE0IH0sXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2RvbmUgPyBcIkNPTVBMRVRFXCIgOiBcIkNBTElCUkFUSU5HLi4uXCJ9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBoZWlnaHQ6IDMsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IDEwLCByaWdodDogOTYgfSxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMzYTE1MWFcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDMsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHByb2dyZXNzLCBbMCwgMV0sIFswLCA0MThdKSB9LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIixcbiAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA2LjUsIGNvbG9yOiBDLnJlZCB9fT5cbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiT05MWSBTQ1BELUNFUlRJRklFRCBCSU9URUNIUyBBTkQgQ0xBU1MtNCBPRkZJQ0VSUyBNQVlcXG5DQUxJQlJBVEUsIEFDQ0VTUyBPUiBESVNBQkxFIFRISVMgREVWSUNFLlwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDxQZXJjZW50IHZhbHVlPXtwcm9ncmVzc30gLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxOYXZCdXR0b25zIG9uQmFjaz17YmFja30gb25OZXh0PXtzdGFydH0gbmV4dD1cIlNUQVJUXCIgLz5cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIm1vdXNlXCIgbGFiZWw9XCJTRUxFQ1RcIiAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IERJR0lUID0gMTg7XG5jb25zdCBFUFMgPSAwLjAwMDE7XG5cbi8qKiBcIjAwMCVcIiByb2xsaW5nIHVwIHRvIFwiMTAwJVwiIG9uIGB2YWx1ZWAgKDAuLjEpOiBlYWNoIGRpZ2l0IGlzIGEgY29sdW1uXG4gKiAgb2YgMC05IGluIGEgY2xpcHBlZCB3aW5kb3csIHN0ZXBwZWQgYnkgYSBwaWVjZXdpc2UtY29uc3RhbnRcbiAqICBgaW50ZXJwb2xhdGVgIOKAlCBubyBSZWFjdCByZW5kZXIgcGVyIHRpY2suICovXG5mdW5jdGlvbiBQZXJjZW50KHsgdmFsdWUgfTogeyB2YWx1ZTogU2hhcmVkVmFsdWUgfSkge1xuICBjb25zdCBjb2x1bW4gPSAoZGlnaXQ6IChrOiBudW1iZXIpID0+IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGlucHV0OiBudW1iZXJbXSA9IFtdO1xuICAgIGNvbnN0IG91dHB1dDogbnVtYmVyW10gPSBbXTtcbiAgICBmb3IgKGxldCBrID0gMDsgayA8IDEwMDsgaysrKSB7XG4gICAgICBpbnB1dC5wdXNoKGsgLyAxMDAsIChrICsgMSkgLyAxMDAgLSBFUFMpO1xuICAgICAgb3V0cHV0LnB1c2goLWRpZ2l0KGspICogRElHSVQsIC1kaWdpdChrKSAqIERJR0lUKTtcbiAgICB9XG4gICAgcmV0dXJuIGludGVycG9sYXRlKHZhbHVlLCBbLi4uaW5wdXQsIDFdLCBbLi4ub3V0cHV0LCAtZGlnaXQoMTAwKSAqIERJR0lUXSk7XG4gIH07XG4gIGNvbnN0IGRpZ2l0cyA9IFtcbiAgICAoazogbnVtYmVyKSA9PiBNYXRoLmZsb29yKGsgLyAxMDApLFxuICAgIChrOiBudW1iZXIpID0+IE1hdGguZmxvb3IoayAvIDEwKSAlIDEwLFxuICAgIChrOiBudW1iZXIpID0+IGsgJSAxMCxcbiAgXTtcbiAgY29uc3QgZm9udCA9IHtcbiAgICBmb250U2l6ZTogMTksXG4gICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgIGNvbG9yOiBDLnJlZCxcbiAgICBsaW5lSGVpZ2h0OiB7IHB4OiBESUdJVCB9LFxuICB9IGFzIGNvbnN0O1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBtYXJnaW46IHsgYm90dG9tOiAxOCB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7ZGlnaXRzLm1hcCgoZCwgaSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDEwLjUsXG4gICAgICAgICAgICBoZWlnaHQ6IERJR0lULFxuICAgICAgICAgICAgb3ZlcmZsb3dZOiBcImNsaXBcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgLi4uZm9udCxcbiAgICAgICAgICAgICAgdGV4dEFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWTogeyBhbmltYXRlZDogY29sdW1uKGQpIH0gfSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge1wiMFxcbjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVwifVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSl9XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5mb250LCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+JTwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VLZXlzIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB0eXBlIHsgU2F2ZSB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiwgVCB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgUHJvdG9jb2xTdGFtcCB9IGZyb20gXCIuLi8uLi91aS9kZWNvclwiO1xuaW1wb3J0IHsgRklMTCwgSGludCwgSGludHMgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBQbGF0ZSwgbW9kYWxPcGVuIH0gZnJvbSBcIi4uL0RpYWxvZ1wiO1xuaW1wb3J0IHsgRGF0YXNoYXJkIH0gZnJvbSBcIi4vaWNvbnNcIjtcbmltcG9ydCB7XG4gIE5ld1NhdmVSb3csXG4gIFJPV19IRUlHSFQsXG4gIFJPV19QSVRDSCxcbiAgUk9XX1dJRFRILFxuICBTYXZlUm93LFxuICBURVhUX0xFRlQsXG59IGZyb20gXCIuL1Jvd1wiO1xuXG5jb25zdCBMSVNUX1RPUCA9IDE5MDtcbi8qKiBTZXZlbiByb3dzOyBtb3JlIHNjcm9sbC4gKi9cbmNvbnN0IExJU1RfSEVJR0hUID0gNyAqIFJPV19QSVRDSCAtIDQ7XG4vKiogQm90aCBzaWRlcyBvZiB0aGUgbGlzdCwgc28gdGhlIHJvd3Mgc3RheSBjZW50ZXJlZCB3aXRoIHRoZSBzY3JvbGxiYXIgaW5cbiAqICB0aGUgcmlnaHQgb25lLiAqL1xuY29uc3QgR1VUVEVSID0gMjQ7XG5cbi8qKiBUaGUgcXVlc3Rpb24gYSBwbGF0ZSBpcyBhc2tpbmcgYWJvdXQgYSBzbG90LiAqL1xudHlwZSBBc2sgPSB7IGtpbmQ6IFwib3ZlcndyaXRlXCIgfCBcImRlbGV0ZVwiOyBpbmRleDogbnVtYmVyIH0gfCBudWxsO1xuXG5jb25zdCBRVUVTVElPTlMgPSB7XG4gIG92ZXJ3cml0ZTpcbiAgICBcIldyaXRlIG92ZXIgdGhpcyBzYXZlP1xcbldoYXRldmVyIHdhcyBvbiB0aGlzIHNoYXJkIGdldHMgZmxhdGxpbmVkLlwiLFxuICBkZWxldGU6IFwiRGVsZXRlIHRoaXMgc2F2ZSBmb3IgZ29vZD9cXG5UaGVyZSBpcyBubyBiYWNrdXAuIE5vYm9keSBrZWVwcyBvbmUuXCIsXG59O1xuXG4vKiogTE9BRCBHQU1FIC8gU0FWRSBHQU1FOiB0aGUgc2F2ZSBzbG90cyAobmV3ZXN0IGZpcnN0KSwgZWFjaCB3aXRoIGFcbiAqICBzbmFwc2hvdCBvZiBpdHMgd29ybGQuIEhvdmVyIHNlbGVjdHMsIGEgY2xpY2sgbG9hZHMgb3Igc2F2ZXMgKGFza2luZ1xuICogIGJlZm9yZSBvdmVyd3JpdGluZyksIFggZGVsZXRlcyB0aGUgc2VsZWN0ZWQgc2xvdCwgRXNjIGNsb3Nlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTYXZlcyh7XG4gIG1vZGUsXG4gIHNhdmVzLFxuICBvbkxvYWQsXG4gIG9uU2F2ZSxcbiAgb25EZWxldGUsXG4gIG9uQ2xvc2UsXG59OiB7XG4gIG1vZGU6IFwibG9hZFwiIHwgXCJzYXZlXCI7XG4gIHNhdmVzOiBTYXZlW107XG4gIC8qKiBJbiBnYW1lLCBsb2FkaW5nIGFza3MgZmlyc3QgKHVuc2F2ZWQgcHJvZ3Jlc3MgaXMgbG9zdCkuICovXG4gIGluR2FtZTogYm9vbGVhbjtcbiAgb25Mb2FkOiAoc2F2ZTogU2F2ZSkgPT4gdm9pZDtcbiAgLyoqIFNhdmUgaW50byBhIG5ldyBzbG90IChgbnVsbGApIG9yIG92ZXIgYG92ZXJ3cml0ZWAuICovXG4gIG9uU2F2ZTogKG92ZXJ3cml0ZTogU2F2ZSB8IG51bGwpID0+IHZvaWQ7XG4gIG9uRGVsZXRlOiAoc2F2ZTogU2F2ZSkgPT4gdm9pZDtcbiAgb25DbG9zZTogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3Qgc2F2aW5nID0gbW9kZSA9PT0gXCJzYXZlXCI7XG4gIC8qKiBJbiBzYXZlIG1vZGUgdGhlIGJsYW5rIHNsb3QgY29tZXMgZmlyc3QuICovXG4gIGNvbnN0IHNsb3RzOiAoU2F2ZSB8IG51bGwpW10gPSBzYXZpbmcgPyBbbnVsbCwgLi4uc2F2ZXNdIDogc2F2ZXM7XG4gIGNvbnN0IFtzZWxlY3RlZCwgc2V0U2VsZWN0ZWRdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFthc2ssIHNldEFza10gPSB1c2VTdGF0ZTxBc2s+KG51bGwpO1xuICAvKiogVGhlIGxpc3QncyBzY3JvbGwgb2Zmc2V0LCB0byBsYXkgdGhlIHBsYXRlIG92ZXIgdGhlIHJpZ2h0IHJvdy4gKi9cbiAgY29uc3QgW3Njcm9sbCwgc2V0U2Nyb2xsXSA9IHVzZVN0YXRlKDApO1xuXG4gIGNvbnN0IHNlbGVjdCA9IChpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoaSA9PT0gc2VsZWN0ZWQpIHJldHVybjtcbiAgICBzZngoXCJob3ZlclwiKTtcbiAgICBzZXRTZWxlY3RlZChpKTtcbiAgfTtcbiAgY29uc3QgcGljayA9IChpOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBzYXZlID0gc2xvdHNbaV07XG4gICAgc2Z4KFwiY2xpY2tcIik7XG4gICAgc2V0U2VsZWN0ZWQoaSk7XG4gICAgaWYgKCFzYXZpbmcpIHtcbiAgICAgIGlmIChzYXZlKSBvbkxvYWQoc2F2ZSk7XG4gICAgfSBlbHNlIGlmIChzYXZlKSB7XG4gICAgICBzZXRBc2soeyBraW5kOiBcIm92ZXJ3cml0ZVwiLCBpbmRleDogaSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGZyZXNoIHNhdmUgbGFuZHMgb24gdG9wIG9mIHRoZSBsaXN0LCB1bmRlciB0aGUgYmxhbmsgc2xvdC5cbiAgICAgIG9uU2F2ZShudWxsKTtcbiAgICAgIHNldFNlbGVjdGVkKDEpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgYXNrRGVsZXRlID0gKCkgPT4ge1xuICAgIGlmICghc2xvdHNbc2VsZWN0ZWRdKSByZXR1cm4gc2Z4KFwiZXJyb3JcIik7XG4gICAgc2Z4KFwiY2xpY2tcIik7XG4gICAgc2V0QXNrKHsga2luZDogXCJkZWxldGVcIiwgaW5kZXg6IHNlbGVjdGVkIH0pO1xuICB9O1xuICBjb25zdCBhbnN3ZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2F2ZSA9IGFzayAmJiBzbG90c1thc2suaW5kZXhdO1xuICAgIGlmICghc2F2ZSkgcmV0dXJuO1xuICAgIGlmIChhc2sua2luZCA9PT0gXCJvdmVyd3JpdGVcIikge1xuICAgICAgb25TYXZlKHNhdmUpO1xuICAgICAgc2V0U2VsZWN0ZWQoMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uRGVsZXRlKHNhdmUpO1xuICAgICAgc2V0U2VsZWN0ZWQoTWF0aC5taW4oc2VsZWN0ZWQsIHNsb3RzLmxlbmd0aCAtIDIpKTtcbiAgICB9XG4gICAgc2V0QXNrKG51bGwpO1xuICB9O1xuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBzZngoXCJiYWNrXCIpO1xuICAgIG9uQ2xvc2UoKTtcbiAgfTtcblxuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKG1vZGFsT3BlbigpKSByZXR1cm47XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSBjbG9zZSgpO1xuICAgIGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlYXCIpIGFza0RlbGV0ZSgpO1xuICB9KTtcbiAgLy8gYC0tc2hvb3RgIHN0ZXBzOiBgaG92ZXIgPHJvdz5gLCBgcGljayA8cm93PmAsIGBkZWxldGVgICh0aGUgc2VsZWN0ZWQpLlxuICB1c2VEZWJ1ZyhcImhvdmVyXCIsIChpKSA9PiBzZXRTZWxlY3RlZChOdW1iZXIoaSkpKTtcbiAgdXNlRGVidWcoXCJwaWNrXCIsIChpKSA9PiBwaWNrKE51bWJlcihpKSkpO1xuICB1c2VEZWJ1ZyhcImRlbGV0ZVwiLCBhc2tEZWxldGUpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgLi4uRklMTCwgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMywgNSwgOSwgMC40MilcIiB9fT5cbiAgICAgIDxEZWNvciAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogTElTVF9UT1AsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIG9uU2Nyb2xsPXsoZSkgPT4gc2V0U2Nyb2xsKGUuc2Nyb2xsVG9wKX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IFJPV19XSURUSCArIDIgKiBHVVRURVIsXG4gICAgICAgICAgICBoZWlnaHQ6IExJU1RfSEVJR0hULFxuICAgICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiBHVVRURVIgfSxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICBnYXA6IFJPV19QSVRDSCAtIFJPV19IRUlHSFQsXG4gICAgICAgICAgICBvdmVyZmxvd1k6IFwic2Nyb2xsXCIsXG4gICAgICAgICAgICBzY3JvbGxiYXJXaWR0aDogR1VUVEVSLFxuICAgICAgICAgICAgc2Nyb2xsYmFyOiB7XG4gICAgICAgICAgICAgIHRyYWNrOiB7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjE0KVwiIH0sXG4gICAgICAgICAgICAgIHRodW1iOiB7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgICBob3ZlcjogeyBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkSGkgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGhpY2tuZXNzOiAzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Nsb3RzLm1hcCgoc2F2ZSwgaSkgPT5cbiAgICAgICAgICAgIHNhdmUgPyAoXG4gICAgICAgICAgICAgIDxTYXZlUm93XG4gICAgICAgICAgICAgICAga2V5PXtzYXZlLmlkfVxuICAgICAgICAgICAgICAgIHNhdmU9e3NhdmV9XG4gICAgICAgICAgICAgICAgaW5kZXg9e2l9XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e2kgPT09IHNlbGVjdGVkfVxuICAgICAgICAgICAgICAgIG9uU2VsZWN0PXsoKSA9PiBzZWxlY3QoaSl9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gcGljayhpKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxOZXdTYXZlUm93XG4gICAgICAgICAgICAgICAga2V5PVwibmV3XCJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZD17aSA9PT0gc2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgb25TZWxlY3Q9eygpID0+IHNlbGVjdChpKX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBwaWNrKGkpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApfVxuICAgICAgICAgIHtzbG90cy5sZW5ndGggPT09IDAgJiYgKFxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDI0LCBjb2xvcjogQy5yZWREaW0sIG1hcmdpbjogeyB0b3A6IDQwIH0gfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgTm8gc2F2ZSBkYXRhIG9uIHRoaXMgZGVjay5cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApfVxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8SGludHM+XG4gICAgICAgIDxIaW50IGs9XCJtb3VzZVwiIGxhYmVsPVwiU2VsZWN0XCIgLz5cbiAgICAgICAgPEhpbnQgaz1cIlhcIiBsYWJlbD1cIkRlbGV0ZSBTYXZlXCIgb25DbGljaz17YXNrRGVsZXRlfSAvPlxuICAgICAgICA8SGludCBrPVwiRVNDXCIgbGFiZWw9XCJDbG9zZVwiIG9uQ2xpY2s9e2Nsb3NlfSAvPlxuICAgICAgPC9IaW50cz5cbiAgICAgIHthc2sgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5GSUxMLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMSwgMiwgNSwgMC44OClcIixcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgZm9jdXNQb2xpY3k6IFwiYmxvY2tcIixcbiAgICAgICAgICB9fVxuICAgICAgICAgIGhvdmVyU3R5bGU9e3t9fVxuICAgICAgICA+XG4gICAgICAgICAgey8qIFRoZSBhc2tlZC1hYm91dCByb3cncyBwbGFjZTsgdGhlIHBsYXRlIGNvdmVycyBpdHMgdGV4dC4gKi99XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiBST1dfV0lEVEgsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IExJU1RfVE9QICsgYXNrLmluZGV4ICogUk9XX1BJVENIIC0gc2Nyb2xsICsgMSB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8UGxhdGVcbiAgICAgICAgICAgICAgdGV4dD17UVVFU1RJT05TW2Fzay5raW5kXX1cbiAgICAgICAgICAgICAgaWNvbj17PERhdGFzaGFyZCB3aWR0aD17MTE4fSAvPn1cbiAgICAgICAgICAgICAgb25Db25maXJtPXthbnN3ZXJ9XG4gICAgICAgICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBzZXRBc2sobnVsbCl9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IG1hcmdpbjogeyBsZWZ0OiBURVhUX0xFRlQgLSA4IH0gfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgICAgPEhlYWRlciB0aXRsZT17c2F2aW5nID8gXCJTQVZFIEdBTUVcIiA6IFwiTE9BRCBHQU1FXCJ9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHRpdGxlIGNlbnRlcmVkIHVuZGVyIGEgbG9uZyByZWQgYXJjLCB0aGUgcHJvdG9jb2wgc3RhbXAgdG9wIGxlZnQuICovXG5mdW5jdGlvbiBIZWFkZXIoeyB0aXRsZSB9OiB7IHRpdGxlOiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8c3ZnXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMTkyMCAxMDBcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNIDIwMCA2MS43IFEgMTA0MS43IDExNS4zIDE4NzggNDdcIlxuICAgICAgICAgIHN0cm9rZT17Qy5yZWR9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICAgIDxQcm90b2NvbFN0YW1wIHN0eWxlPXt7IGxlZnQ6IDM2LCB0b3A6IDQgfX0gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICB0b3A6IDM2LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNiAyNlwiIHN0eWxlPXt7IHdpZHRoOiAyNiwgaGVpZ2h0OiAyNiB9fT5cbiAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgcG9pbnRzPXtbMTMsIDEuNSwgMjQuNSwgMTMsIDEzLCAyNC41LCAxLjUsIDEzXX1cbiAgICAgICAgICAgIHN0cm9rZT17Qy5yZWR9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxyZWN0IHg9ezZ9IHk9ezEwLjV9IHdpZHRoPXsxNH0gaGVpZ2h0PXs1fSByeD17MX0gZmlsbD17Qy5yZWR9IC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA1LCBjb2xvcjogQy5yZWQsIGxpbmVIZWlnaHQ6IDEuMTUgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtcIjAxMTAgMTAxXFxuMTAwMSAxMTBcXG4wMTExIDAwMVxcbjEwMTAgMDExXCJ9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IDM0LFxuICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiA0LCB0b3A6IDYgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3RpdGxlfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBUaGUgcmFpbHM6IGZhaW50IGRhc2hlcyBkb3duIGFuIGVkZ2UgKG9uZSBwYXRoKS4gKi9cbmNvbnN0IERBU0hFUyA9IEFycmF5LmZyb20oXG4gIHsgbGVuZ3RoOiAxMzUgfSxcbiAgKF8sIGkpID0+IGBNMCAke2kgKiA4fWgydjRoLTJ6YCxcbikuam9pbihcIlwiKTtcblxuLyoqIFRoZSBzbWFsbCBwcmludDogZG90dGVkIHJhaWxzIGRvd24gdGhlIGVkZ2VzIHdpdGggYSByZWFkb3V0IHR1cm5lZCB1cFxuICogIHRoZSBsZWZ0IG9uZSwgcmVhZG91dHMgYWxvbmcgdGhlIGJvdHRvbS4gKi9cbmZ1bmN0aW9uIERlY29yKCkge1xuICBjb25zdCBtaWNybyA9IHsgLi4uVC5taWNybywgZm9udFNpemU6IDExLCBjb2xvcjogQy5yZWREaW0gfTtcbiAgY29uc3QgcmFpbCA9IChzaWRlOiBcImxlZnRcIiB8IFwicmlnaHRcIikgPT4gKFxuICAgIDxzdmdcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBbc2lkZV06IDE4LFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoOiAyLFxuICAgICAgICBoZWlnaHQ6IDEwODAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxwYXRoIGQ9e0RBU0hFU30gZmlsbD1cInJnYmEoMjU1LCA5MywgODEsIDAuMilcIiAvPlxuICAgIDwvc3ZnPlxuICApO1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7cmFpbChcImxlZnRcIil9XG4gICAgICB7cmFpbChcInJpZ2h0XCIpfVxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxMyxcbiAgICAgICAgICB0b3A6IDQyNSxcbiAgICAgICAgICB3aWR0aDogNixcbiAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDI3LFxuICAgICAgICAgIHRvcDogNDIzLFxuICAgICAgICAgIHdpZHRoOiAxNixcbiAgICAgICAgICBoZWlnaHQ6IDE3LFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5yZWREZWVwLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLm1pY3JvLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgY29sb3I6IFwiI2ZmYjNhZFwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICAxXG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4ubWljcm8sXG4gICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxNiAtIDE1MCxcbiAgICAgICAgICB0b3A6IDU3NCxcbiAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICAgIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICB0cmFuc2Zvcm06IHsgcm90YXRlOiAtOTAgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgMDAwMzIgMDUgNTQgMDggQ1AgMDAwMzIgMDUgNTQgMDggQ1BcbiAgICAgIDwvdGV4dD5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4ubWljcm8sXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogNTIsXG4gICAgICAgICAgYm90dG9tOiAyNixcbiAgICAgICAgICB0cmFuc2Zvcm06IHsgcm90YXRlOiAtMiB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XCIwMDAzMiAwNSA1NCAwOCBDUCAgMDAwMzIgMDUgNTQgMDggQ1BcXG4wMDAzMiAwNSA1NCAwOFwifVxuICAgICAgPC90ZXh0PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIGJvdHRvbTogOCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiAxMixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDYsIGhlaWdodDogNiwgYmFja2dyb3VuZENvbG9yOiBDLnJlZERpbSB9fSAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogMTYsXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxuICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkRGltLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5taWNybywgZm9udEZhbWlseTogRi5ib2xkLCBmb250U2l6ZTogMTAgfX0+QjwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5taWNybywgbWFyZ2luOiB7IGxlZnQ6IDM2IH0gfX0+XG4gICAgICAgICAgU0JMIDEwMiBUTksgMTUxIENDMTAgQTU1XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e21pY3JvfT4xMCBBNTUg4oaQPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VFbnRlciB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgTElGRVBBVEhTLCBwbGF5dGltZSwgdHlwZSBTYXZlIH0gZnJvbSBcIi4uLy4uL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGLCBjaGFtZmVyIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBEYXRhc2hhcmQsIExpZmVwYXRoSWNvbiB9IGZyb20gXCIuL2ljb25zXCI7XG5cbmV4cG9ydCBjb25zdCBST1dfV0lEVEggPSAxMDM1O1xuZXhwb3J0IGNvbnN0IFJPV19IRUlHSFQgPSAxMDQ7XG4vKiogUm93IHRvIHJvdywgcHguICovXG5leHBvcnQgY29uc3QgUk9XX1BJVENIID0gUk9XX0hFSUdIVCArIDQ7XG4vKiogV2hlcmUgYSByb3cncyB0ZXh0IHN0YXJ0cywgZnJvbSBpdHMgbGVmdCBlZGdlICh0aGUgb3ZlcndyaXRlIHBsYXRlIGxhbmRzXG4gKiAgdGhlcmUgdG9vKS4gKi9cbmV4cG9ydCBjb25zdCBURVhUX0xFRlQgPSAxODY7XG5cbmNvbnN0IFBMQVRFID0gXCJyZ2JhKDEzLCAxOCwgMjcsIDAuNzQpXCI7XG5jb25zdCBMSU5FID0gXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjI2KVwiO1xuXG4vKiogT25lIHNsb3Qgb2YgdGhlIGxpc3Q6IGEgY3V0LWNvcm5lciBwbGF0ZSBvdmVyIHRoZSB3b3JsZCwgZnJhbWVkIGJyaWdodFxuICogIHJlZCB3aGlsZSBzZWxlY3RlZCAodGhlIG9uZSBob3ZlcmVkIGxhc3QpLiBTbGlkZXMgaW4gd2hlbiBpdCBtb3VudHMsIHNvXG4gKiAgYSBmcmVzaCBzYXZlIGFycml2ZXMgdmlzaWJseS4gKi9cbmZ1bmN0aW9uIFNsb3Qoe1xuICBpbmRleCxcbiAgc2VsZWN0ZWQsXG4gIG9uU2VsZWN0LFxuICBvbkNsaWNrLFxuICBjaGlsZHJlbixcbn06IHtcbiAgaW5kZXg6IG51bWJlcjtcbiAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gIG9uU2VsZWN0OiAoKSA9PiB2b2lkO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xuICBjaGlsZHJlbjogUmVhY3ROb2RlO1xufSkge1xuICBjb25zdCBlbnRlciA9IHVzZUVudGVyKC0yOCwgNDAgKiBNYXRoLm1pbihpbmRleCwgOCkpO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uUG9pbnRlckVudGVyPXtvblNlbGVjdH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5jaGFtZmVyKFBMQVRFLCAxNiwgc2VsZWN0ZWQgPyBDLnJlZCA6IExJTkUsIDIpLFxuICAgICAgICB3aWR0aDogUk9XX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFJPV19IRUlHSFQsXG4gICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMSB9LFxuICAgICAgICAuLi5lbnRlcixcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogVGhlIHBpY3R1cmUgd2VsbCBsZWZ0IG9mIGEgcm93OiBmcmFtZWQsIGl0cyBjb3JuZXIgY3V0IGxpa2UgdGhlIHJvdydzLiAqL1xuZnVuY3Rpb24gVGh1bWIoe1xuICBzZWxlY3RlZCxcbiAgY2hpbGRyZW4sXG59OiB7XG4gIHNlbGVjdGVkOiBib29sZWFuO1xuICBjaGlsZHJlbjogUmVhY3ROb2RlO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5jaGFtZmVyKFwicmdiYSg2LCA4LCAxMywgMC42KVwiLCAxNCwgc2VsZWN0ZWQgPyBDLnJlZCA6IExJTkUsIDEpLFxuICAgICAgICB3aWR0aDogMTcwLFxuICAgICAgICBoZWlnaHQ6IDk2LFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgbGluZSA9IHtcbiAgZm9udFNpemU6IDI0LFxuICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICBjb2xvcjogQy5yZWQsXG4gIGxpbmVCcmVhazogXCJub1dyYXBcIixcbn0gYXMgY29uc3Q7XG5cbi8qKiBBIHNhdmU6IGl0cyB3b3JsZCdzIHNuYXBzaG90LCB0aGUgcXVlc3QgYW5kIHRoZSBzbG90J3MgbmFtZSwgd2hlcmUgaXRcbiAqICB3YXMgbWFkZSwgd2hvLCBob3cgZmFyIGFsb25nLCB3aGVuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNhdmVSb3coe1xuICBzYXZlLFxuICBpbmRleCxcbiAgc2VsZWN0ZWQsXG4gIG9uU2VsZWN0LFxuICBvbkNsaWNrLFxufToge1xuICBzYXZlOiBTYXZlO1xuICBpbmRleDogbnVtYmVyO1xuICBzZWxlY3RlZDogYm9vbGVhbjtcbiAgb25TZWxlY3Q6ICgpID0+IHZvaWQ7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IHsgbGlmZXBhdGggfSA9IHNhdmUuY2hhcmFjdGVyO1xuICByZXR1cm4gKFxuICAgIDxTbG90XG4gICAgICBpbmRleD17aW5kZXh9XG4gICAgICBzZWxlY3RlZD17c2VsZWN0ZWR9XG4gICAgICBvblNlbGVjdD17b25TZWxlY3R9XG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgID5cbiAgICAgIDxUaHVtYiBzZWxlY3RlZD17c2VsZWN0ZWR9PlxuICAgICAgICA8cG9ydGFsXG4gICAgICAgICAgdGFyZ2V0PXtgc2hvdC0ke2xpZmVwYXRofWB9XG4gICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IDE2OCwgaGVpZ2h0OiA5NCwgY2FjaGU6IFwibmV2ZXJcIiB9fVxuICAgICAgICAvPlxuICAgICAgPC9UaHVtYj5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMTUsIHJpZ2h0OiAyNiwgdG9wOiAxNCwgYm90dG9tOiA3IH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4ubGluZSwgY29sb3I6IEMuY3lhbiB9fT57c2F2ZS5xdWVzdH08L3RleHQ+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4ubGluZSwgbWFyZ2luOiB7IGhvcml6b250YWw6IDExIH0gfX0+LTwvdGV4dD5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17bGluZX0+e3NhdmUubmFtZX08L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEgfX0gLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17bGluZX0+e3BsYXl0aW1lKHNhdmUucGxheXRpbWUpfTwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiIH19PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmxpbmUsIGZvbnRTaXplOiAyMyB9fT57c2F2ZS5sb2NhdGlvbn08L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDI3IH19IC8+XG4gICAgICAgICAgPExpZmVwYXRoSWNvbiBsaWZlcGF0aD17bGlmZXBhdGh9IC8+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4ubGluZSwgZm9udFNpemU6IDIzLCBtYXJnaW46IHsgbGVmdDogNyB9IH19PlxuICAgICAgICAgICAge0xJRkVQQVRIUy5maW5kKChsKSA9PiBsLmlkID09PSBsaWZlcGF0aCk/Lm5hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmxpbmUsIGZvbnRTaXplOiAyMywgbWFyZ2luOiB7IGxlZnQ6IDI4IH0gfX0+XG4gICAgICAgICAgICBMZXZlbCB7c2F2ZS5sZXZlbH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEgfX0gLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5saW5lLCBmb250U2l6ZTogMjMgfX0+e3NhdmUuZGF0ZX08L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L1Nsb3Q+XG4gICk7XG59XG5cbi8qKiBUaGUgZmlyc3Qgc2xvdCB3aGVuIHNhdmluZzogYSBibGFuayBkYXRhc2hhcmQuICovXG5leHBvcnQgZnVuY3Rpb24gTmV3U2F2ZVJvdyh7XG4gIHNlbGVjdGVkLFxuICBvblNlbGVjdCxcbiAgb25DbGljayxcbn06IHtcbiAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gIG9uU2VsZWN0OiAoKSA9PiB2b2lkO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxTbG90IGluZGV4PXswfSBzZWxlY3RlZD17c2VsZWN0ZWR9IG9uU2VsZWN0PXtvblNlbGVjdH0gb25DbGljaz17b25DbGlja30+XG4gICAgICA8VGh1bWIgc2VsZWN0ZWQ9e3NlbGVjdGVkfT5cbiAgICAgICAgPERhdGFzaGFyZCB3aWR0aD17MTI4fSAvPlxuICAgICAgICA8c3ZnXG4gICAgICAgICAgdmlld0JveD1cIjAgMCAxNCAxNFwiXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgcmlnaHQ6IDMwLFxuICAgICAgICAgICAgdG9wOiAxMixcbiAgICAgICAgICAgIHdpZHRoOiAxNCxcbiAgICAgICAgICAgIGhlaWdodDogMTQsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAgcG9pbnRzPXtbNywgMCwgNywgMTRdfVxuICAgICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjR9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIHBvaW50cz17WzAsIDcsIDE0LCA3XX1cbiAgICAgICAgICAgIHN0cm9rZT17Qy5yZWR9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS40fVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgPC9UaHVtYj5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4ubGluZSxcbiAgICAgICAgICBmb250U2l6ZTogMjksXG4gICAgICAgICAgYWxpZ25TZWxmOiBcImZsZXhTdGFydFwiLFxuICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiAxNSwgdG9wOiAxNSB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBOZXcgU2F2ZVxuICAgICAgPC90ZXh0PlxuICAgIDwvU2xvdD5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHsgQywgRiwgVCwgY2hhbWZlciB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgRWRnZVJhaWxzLCBQcm90b2NvbFN0YW1wIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBDdXRCdXR0b24sIEZJTEwsIEhpbnQsIEhpbnRzLCBLZXljYXAgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBDb250cm9sU2NoZW1lIH0gZnJvbSBcIi4vQ29udHJvbFNjaGVtZVwiO1xuaW1wb3J0IHsgQ1VTVE9NLCBQUkVTRVRTLCBUQUJTLCBkZWZhdWx0cywgdHlwZSBUYWJJZCB9IGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCB7IEdhbW1hIH0gZnJvbSBcIi4vR2FtbWFcIjtcbmltcG9ydCB7IEJhY2tkcm9wLCBTZXR0aW5nUm93IH0gZnJvbSBcIi4vcm93c1wiO1xuaW1wb3J0IHtcbiAgc2V0U2V0dGluZyxcbiAgc2V0U2V0dGluZ3MsXG4gIHVzZVNldHRpbmdzLFxuICB0eXBlIFNldHRpbmdWYWx1ZSxcbn0gZnJvbSBcIi4vc3RvcmVcIjtcblxudHlwZSBTdWIgPSBcImdhbW1hXCIgfCBcImNvbnRyb2xzXCIgfCBudWxsO1xuXG4vKiogQ2hhbmdlIGEgc2V0dGluZzsgR1JBUEhJQ1MnIFF1aWNrIFByZXNldCBzZXRzIHRoZSByb3dzIGl0IGdvdmVybnMsIGFuZFxuICogIHR3ZWFraW5nIG9uZSBvZiB0aG9zZSBtYWtlcyB0aGUgcHJlc2V0IEN1c3RvbS4gKi9cbmZ1bmN0aW9uIGNoYW5nZShpZDogc3RyaW5nLCB2YWx1ZTogU2V0dGluZ1ZhbHVlKSB7XG4gIGlmIChpZCA9PT0gXCJwcmVzZXRcIilcbiAgICBzZXRTZXR0aW5ncyh7IHByZXNldDogdmFsdWUsIC4uLlBSRVNFVFNbTnVtYmVyKHZhbHVlKV0gfSk7XG4gIGVsc2UgaWYgKGlkIGluIFBSRVNFVFNbMF0pIHNldFNldHRpbmdzKHsgW2lkXTogdmFsdWUsIHByZXNldDogQ1VTVE9NIH0pO1xuICBlbHNlIHNldFNldHRpbmcoaWQsIHZhbHVlKTtcbn1cblxuLyoqIFNFVFRJTkdTOiBlaWdodCB0YWJzIG9mIHJvd3MsIHRoZSBnYW1tYSBjb3JyZWN0aW9uIGFuZCBjb250cm9sIHNjaGVtZVxuICogIHNjcmVlbnMuIFsxXS9bM10gKG9yIFEvRSkgc3dpdGNoIHRhYnMsIEYxIHJlc3RvcmVzIHRoZSB0YWIncyBkZWZhdWx0cyxcbiAqICBFc2MgY2xvc2VzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldHRpbmdzKHsgb25DbG9zZSB9OiB7IG9uQ2xvc2U6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gdXNlU3RhdGU8VGFiSWQ+KFwic291bmRcIik7XG4gIGNvbnN0IFtzdWIsIHNldFN1Yl0gPSB1c2VTdGF0ZTxTdWI+KG51bGwpO1xuICAvKiogVGhlIGtleSBiaW5kaW5nIHdhaXRpbmcgZm9yIGEga2V5LiAqL1xuICBjb25zdCBbbGlzdGVuaW5nLCBzZXRMaXN0ZW5pbmddID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHZhbHVlcyA9IHVzZVNldHRpbmdzKCk7XG4gIGNvbnN0IGluZGV4ID0gVEFCUy5maW5kSW5kZXgoKHQpID0+IHQuaWQgPT09IHRhYik7XG4gIGNvbnN0IHJvd3MgPSBUQUJTW2luZGV4XS5yb3dzO1xuXG4gIGNvbnN0IHBpY2sgPSAoaWQ6IFRhYklkKSA9PiB7XG4gICAgaWYgKGlkID09PSB0YWIpIHJldHVybjtcbiAgICBzZngoXCJ0YWJcIik7XG4gICAgc2V0TGlzdGVuaW5nKG51bGwpO1xuICAgIHNldFRhYihpZCk7XG4gIH07XG4gIGNvbnN0IHN0ZXAgPSAoZDogbnVtYmVyKSA9PlxuICAgIHBpY2soVEFCU1soaW5kZXggKyBkICsgVEFCUy5sZW5ndGgpICUgVEFCUy5sZW5ndGhdLmlkKTtcbiAgY29uc3QgcmVzdG9yZSA9ICgpID0+IHtcbiAgICBzZngoXCJjb25maXJtXCIpO1xuICAgIHNldExpc3RlbmluZyhudWxsKTtcbiAgICBzZXRTZXR0aW5ncyhkZWZhdWx0cyhyb3dzKSk7XG4gIH07XG4gIGNvbnN0IG9wZW4gPSAoczogU3ViKSA9PiB7XG4gICAgc2Z4KFwiY2xpY2tcIik7XG4gICAgc2V0TGlzdGVuaW5nKG51bGwpO1xuICAgIHNldFN1YihzKTtcbiAgfTtcblxuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKHN1YikgcmV0dXJuOyAvLyB0aGUgc3ViLXNjcmVlbiBoYXMgdGhlIGtleXNcbiAgICBpZiAobGlzdGVuaW5nKSB7XG4gICAgICBpZiAoZS5rZXkgIT09IFwiRXNjYXBlXCIpIHNldFNldHRpbmcobGlzdGVuaW5nLCBlLmNvZGUpO1xuICAgICAgc2Z4KGUua2V5ID09PSBcIkVzY2FwZVwiID8gXCJiYWNrXCIgOiBcImNvbmZpcm1cIik7XG4gICAgICBzZXRMaXN0ZW5pbmcobnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN3aXRjaCAoZS5jb2RlKSB7XG4gICAgICBjYXNlIFwiRXNjYXBlXCI6XG4gICAgICAgIHNmeChcImJhY2tcIik7XG4gICAgICAgIHJldHVybiBvbkNsb3NlKCk7XG4gICAgICBjYXNlIFwiRGlnaXQxXCI6XG4gICAgICBjYXNlIFwiS2V5UVwiOlxuICAgICAgICByZXR1cm4gc3RlcCgtMSk7XG4gICAgICBjYXNlIFwiRGlnaXQzXCI6XG4gICAgICBjYXNlIFwiS2V5RVwiOlxuICAgICAgICByZXR1cm4gc3RlcCgxKTtcbiAgICAgIGNhc2UgXCJLZXlaXCI6XG4gICAgICAgIHJldHVybiBvcGVuKFwiZ2FtbWFcIik7XG4gICAgICBjYXNlIFwiS2V5WFwiOlxuICAgICAgICByZXR1cm4gb3BlbihcImNvbnRyb2xzXCIpO1xuICAgICAgY2FzZSBcIkYxXCI6XG4gICAgICAgIHJldHVybiByZXN0b3JlKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBTY3JpcHRlZCBzdGVwcyBmb3IgYC0tc2hvb3RgOiBgdGFiIDxpZD5gLCBgc3ViIGdhbW1hfGNvbnRyb2xzfG5vbmVgLFxuICAvLyBgc2V0IDxpZD4gPHZhbHVlPmAsIGBsaXN0ZW4gPGlkPmAuXG4gIHVzZURlYnVnKFwidGFiXCIsICh0KSA9PiB7XG4gICAgaWYgKFRBQlMuc29tZSgoeCkgPT4geC5pZCA9PT0gdCkpIHNldFRhYih0IGFzIFRhYklkKTtcbiAgfSk7XG4gIHVzZURlYnVnKFwic3ViXCIsIChzKSA9PiBzZXRTdWIocyA9PT0gXCJub25lXCIgPyBudWxsIDogKHMgYXMgU3ViKSkpO1xuICB1c2VEZWJ1ZyhcInNldFwiLCAoYXJnKSA9PiB7XG4gICAgY29uc3QgW2lkLCB2XSA9IGFyZy5zcGxpdChcIiBcIik7XG4gICAgY2hhbmdlKGlkLCB2ID09PSBcInRydWVcIiA/IHRydWUgOiB2ID09PSBcImZhbHNlXCIgPyBmYWxzZSA6IE51bWJlcih2KSk7XG4gIH0pO1xuICB1c2VEZWJ1ZyhcImxpc3RlblwiLCBzZXRMaXN0ZW5pbmcpO1xuXG4gIGlmIChzdWIgPT09IFwiZ2FtbWFcIikgcmV0dXJuIDxHYW1tYSBvbkJhY2s9eygpID0+IHNldFN1YihudWxsKX0gLz47XG4gIGlmIChzdWIgPT09IFwiY29udHJvbHNcIikgcmV0dXJuIDxDb250cm9sU2NoZW1lIG9uQmFjaz17KCkgPT4gc2V0U3ViKG51bGwpfSAvPjtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtGSUxMfT5cbiAgICAgIDxCYWNrZHJvcCAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzNixcbiAgICAgICAgICByaWdodDogMzYsXG4gICAgICAgICAgdG9wOiA4NCxcbiAgICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMilcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8UHJvdG9jb2xTdGFtcCBzdHlsZT17eyBsZWZ0OiAzNiwgdG9wOiA3MCB9fSAvPlxuICAgICAgPEVkZ2VSYWlscyAvPlxuICAgICAgPFRhYnMgdGFiPXt0YWJ9IG9uUGljaz17cGlja30gb25TdGVwPXtzdGVwfSAvPlxuICAgICAgey8qIFRoZSBsaXN0LCBjZW50cmVkLCB0aGUgc2lkZSBidXR0b25zIGhhbmdpbmcgb2ZmIGl0cyByaWdodDogdGhlXG4gICAgICAgICAgc3BhY2VyIG9uIHRoZSBsZWZ0IGJhbGFuY2VzIHRoZW0sIGFuZCBnaXZlcyB3YXkgZmlyc3Qgb24gYVxuICAgICAgICAgIG5hcnJvdyB3aW5kb3cuICovfVxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMTU5LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiAzMTAsIGZsZXhTaHJpbms6IDEgfX0gLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICAgIC8vIFRoZSBnbGl0Y2ggZXZlcnkgdGFiIGNoYW5nZSBydW5zIHRocm91Z2ggKGEgY3Jvc3NmYWRlIHdpdGggVUlcbiAgICAgICAgICAgIC8vIGdsaXRjaCBlZmZlY3RzIG9mZikuXG4gICAgICAgICAgICBtb3JwaEZpbHRlcjoge1xuICAgICAgICAgICAgICBrZXk6IHRhYixcbiAgICAgICAgICAgICAgbmFtZTogdmFsdWVzLnVpR2xpdGNoID8gXCJnbGl0Y2hTd2FwXCIgOiBcImNyb3NzZmFkZVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHsgbW9ycGhGaWx0ZXI6IHsgZHVyYXRpb246IDI2MCwgZWFzaW5nOiBcImxpbmVhclwiIH0gfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17dGFifVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IDk2MixcbiAgICAgICAgICAgICAgaGVpZ2h0OiA3MDAsXG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgIG92ZXJmbG93WTogXCJzY3JvbGxcIixcbiAgICAgICAgICAgICAgc2Nyb2xsYmFyOiB7XG4gICAgICAgICAgICAgICAgdHJhY2s6IHsgYmFja2dyb3VuZENvbG9yOiBcIiMyYTBkMTJcIiB9LFxuICAgICAgICAgICAgICAgIHRodW1iOiB7XG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiI2YyNGQ0N1wiLFxuICAgICAgICAgICAgICAgICAgaG92ZXI6IHsgYmFja2dyb3VuZENvbG9yOiBDLnJlZEhpIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aGlja25lc3M6IDQsXG4gICAgICAgICAgICAgICAgbWluVGh1bWJMZW5ndGg6IDQwLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHNjcm9sbFN0ZXA9ezQ3fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiA5MjUsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGZsZXhTaHJpbms6IDAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3Jvd3MubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICA8U2V0dGluZ1Jvd1xuICAgICAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICAgICAgcm93PXtyb3d9XG4gICAgICAgICAgICAgICAgICB2YWx1ZXM9e3ZhbHVlc31cbiAgICAgICAgICAgICAgICAgIGxpc3RlbmluZz17bGlzdGVuaW5nfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2NoYW5nZX1cbiAgICAgICAgICAgICAgICAgIG9uTGlzdGVuPXtzZXRMaXN0ZW5pbmd9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgZ2FwOiAyNSxcbiAgICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiA0MywgdG9wOiAzMDcgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFNpZGVCdXR0b25cbiAgICAgICAgICAgIGxhYmVsPVwiR0FNTUEgQ09SUkVDVElPTlwiXG4gICAgICAgICAgICBrPVwiWlwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvcGVuKFwiZ2FtbWFcIil9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8U2lkZUJ1dHRvblxuICAgICAgICAgICAgbGFiZWw9XCJDT05UUk9MIFNDSEVNRVwiXG4gICAgICAgICAgICBrPVwiWFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvcGVuKFwiY29udHJvbHNcIil9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogOTE3LFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8Q3V0QnV0dG9uIGxhYmVsPVwiREVGQVVMVFNcIiB3aWR0aD17MjAwfSBoZWlnaHQ9ezUzfSBvbkNsaWNrPXtyZXN0b3JlfSAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMTA0MyxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiA2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogOCB9fT5cbiAgICAgICAgICBTQkwgMTAyIENLQyAxNTEgQ0MxMCBBNTVcbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMzAgOFwiIHN0eWxlPXt7IHdpZHRoOiAzMCwgaGVpZ2h0OiA4IH19PlxuICAgICAgICAgIDxwb2x5Z29uIHBvaW50cz17WzAsIDQsIDksIDAsIDksIDhdfSBmaWxsPXtDLnJlZERpbX0gLz5cbiAgICAgICAgICA8cmVjdCB4PXs5fSB5PXszfSB3aWR0aD17MjF9IGhlaWdodD17Mn0gZmlsbD17Qy5yZWREaW19IC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgPC9ub2RlPlxuICAgICAgPEJhZGdlIC8+XG4gICAgICA8SGludHM+XG4gICAgICAgIDxIaW50IGs9XCJFU0NcIiBsYWJlbD1cIkNsb3NlXCIgb25DbGljaz17b25DbG9zZX0gLz5cbiAgICAgICAgPEhpbnQgaz1cIkYxXCIgbGFiZWw9XCJSZXN0b3JlIERlZmF1bHRzXCIgb25DbGljaz17cmVzdG9yZX0gLz5cbiAgICAgICAgPEhpbnQgaz1cIm1vdXNlXCIgbGFiZWw9XCJTZWxlY3RcIiAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgdGFiIGJhcjogWzFdIOKAuXRhYnPigLogWzNdLCB0aGUgY3VycmVudCBvbmUgY3lhbi4gKi9cbmZ1bmN0aW9uIFRhYnMoe1xuICB0YWIsXG4gIG9uUGljayxcbiAgb25TdGVwLFxufToge1xuICB0YWI6IFRhYklkO1xuICBvblBpY2s6IChpZDogVGFiSWQpID0+IHZvaWQ7XG4gIG9uU3RlcDogKGQ6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB0b3A6IDMwLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiA0MixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBvblN0ZXAoLTEpfT5cbiAgICAgICAgPEtleWNhcCBrPVwiMVwiIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMjIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+XG4gICAgICAgIHtUQUJTLm1hcCgodCkgPT4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGtleT17dC5pZH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUGljayh0LmlkKX1cbiAgICAgICAgICAgIHN0eWxlPXt7IGhlaWdodDogMzYsIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiIH19XG4gICAgICAgICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjA2KVwiIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMjQsXG4gICAgICAgICAgICAgICAgY29sb3I6IHQuaWQgPT09IHRhYiA/IEMuY3lhbiA6IEMucmVkLFxuICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3QubGFiZWx9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBvblN0ZXAoMSl9PlxuICAgICAgICA8S2V5Y2FwIGs9XCIzXCIgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgU0lERV9GUkFNRSA9IFwiIzViMWEyMFwiO1xuXG4vKiogR0FNTUEgQ09SUkVDVElPTiAvIENPTlRST0wgU0NIRU1FOiBhIHBsYXRlIHdpdGggYSByYWlzZWQgdGFiIG9uIGl0cyB0b3BcbiAqICBlZGdlIGFuZCBhIHJhaWwgZG93biBpdHMgbGVmdC4gKi9cbmZ1bmN0aW9uIFNpZGVCdXR0b24oe1xuICBsYWJlbCxcbiAgayxcbiAgb25DbGljayxcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgazogc3RyaW5nO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b24gb25DbGljaz17b25DbGlja30gc3R5bGU9e3sgd2lkdGg6IDI1NSwgaGVpZ2h0OiA0OSB9fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihDLmJ1dHRvbiwgMTAsIFNJREVfRlJBTUUsIDEpLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiA0LFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiZmxleEVuZFwiLFxuICAgICAgICAgIGdhcDogMTQsXG4gICAgICAgICAgcGFkZGluZzogeyByaWdodDogMTQgfSxcbiAgICAgICAgfX1cbiAgICAgICAgaG92ZXJTdHlsZT17Y2hhbWZlcihcIiMxYTFhMmNcIiwgMTAsIEMuY3lhbiwgMSl9XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogNCxcbiAgICAgICAgICAgIHRvcDogNSxcbiAgICAgICAgICAgIGJvdHRvbTogNSxcbiAgICAgICAgICAgIHdpZHRoOiAyLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBTSURFX0ZSQU1FLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyMSwgY29sb3I6IEMuY3lhbiwgbGV0dGVyU3BhY2luZzogMC40IH19PlxuICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8S2V5Y2FwIGs9e2t9IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoQy5idXR0b24sIDUsIFNJREVfRlJBTUUsIDEsIFwidHJcIiksXG4gICAgICAgICAgYm9yZGVyOiB7IHRvcDogMSwgbGVmdDogMSwgcmlnaHQ6IDEgfSxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICB3aWR0aDogNzIsXG4gICAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIFRoZSB2ZXJzaW9uIGJhZGdlIGFuZCB0aGUgc21hbGwgcHJpbnQsIGJvdHRvbSBsZWZ0LiAqL1xuZnVuY3Rpb24gQmFkZ2UoKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogNTAsXG4gICAgICAgICAgdG9wOiA5OTMsXG4gICAgICAgICAgd2lkdGg6IDI4LFxuICAgICAgICAgIGhlaWdodDogMzgsXG4gICAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZERpbSxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDQsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgZm9udFNpemU6IDE0LFxuICAgICAgICAgICAgY29sb3I6IEMucmVkRGltLFxuICAgICAgICAgICAgbGluZUhlaWdodDogMC45NSxcbiAgICAgICAgICAgIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge1wiVlxcbjg1XCJ9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICBmb250U2l6ZTogNyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiA4NixcbiAgICAgICAgICB0b3A6IDk5OCxcbiAgICAgICAgICB3aWR0aDogNDYwLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XG4gICAgICAgICAgXCJUaGUgZGF0YSB5b3UgZW50ZXIgb24gYW4gU0NQRCB0ZXJtaW5hbCB3aWxsIG9ubHkgYmUgdXNlZCBmb3IgdGhlIHB1cnBvc2UgeW91IGVudGVyZWQgaXQgZm9yLiBZb3VyIHBlcnNvbmFsIGRhdGEgaXMgcHJvdGVjdGVkIGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgMjA4OCBQcml2YWN5IEFjdCwgdGhlIFNhYmxlIENpdHkgQ2hhcnRlciBhbmQgVGVua2FpIENvcnBvcmF0ZSBQb2xpY3kgNy4gVGVybWluYWwgc2Vzc2lvbnMgbWF5IGJlIHJldGFpbmVkIGZvciB0aGUgbGVuZ3RoIG9mIHlvdXIgcmVzaWRlbmN5LlwiXG4gICAgICAgIH1cbiAgICAgIDwvdGV4dD5cbiAgICA8Lz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUsIFBvaW50ZXJFdmVudERhdGEgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBBcnJvdywgTW91c2VJY29uIH0gZnJvbSBcIi4uLy4uL3VpL2ljb25zXCI7XG5pbXBvcnQgeyBLZXljYXAgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgdHlwZSB7IFJvdywgU2xpZGVyIH0gZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IHR5cGUgeyBTZXR0aW5nVmFsdWUgfSBmcm9tIFwiLi9zdG9yZVwiO1xuXG4vLyBUaGUgc2V0dGluZ3MnIGJ1aWxkaW5nIGJsb2NrczogdGhlIHJvd3MgYW5kIHRoZWlyIHdpZGdldHMgKGEgc2VsZWN0b3IsIGFuXG4vLyBPRkYvT04gc3dpdGNoLCBhIHNsaWRlciwgYSBrZXkgYmluZGluZyksIHBsdXMgdGhlIGJhY2tkcm9wIGFuZCBzdGFnZSBldmVyeVxuLy8gc2V0dGluZ3Mgc2NyZWVuIHNpdHMgb24uXG5cbi8qKiBUaGUgd2lkZ2V0IGNvbHVtbi4gKi9cbmNvbnN0IFdJRFRIID0gNDUwO1xuLyoqIEEgcGxhdGUncyBkaW0gcmVkIGZyYW1lLCBhbmQgdGhlIGJyaWdodGVyIG9uZSB1bmRlciB0aGUgcG9pbnRlci4gKi9cbmNvbnN0IEZSQU1FID0gXCIjNTUxNjFjXCI7XG5jb25zdCBGUkFNRV9IT1QgPSBcIiNhODMyMmZcIjtcbmNvbnN0IFZBTFVFOiBCZXZ5U3R5bGUgPSB7IGZvbnRTaXplOiAyMSwgY29sb3I6IEMuY3lhbiwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH07XG5cbi8qKiBUaGUgMTkyMCBweCB3aWRlIGNhbnZhcyB0aGUgc2NyZWVucyBhcmUgZHJhd24gb24gKHRoZSByZWZlcmVuY2UgbGF5b3V0J3NcbiAqICBjb29yZGluYXRlcyksIGNlbnRyZWQgd2hhdGV2ZXIgdGhlIHdpbmRvdydzIGFzcGVjdC4gKi9cbmV4cG9ydCBjb25zdCBTVEFHRTogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgdG9wOiAwLFxuICBib3R0b206IDAsXG4gIGxlZnQ6IFwiNTAlXCIsXG4gIHdpZHRoOiAxOTIwLFxuICBtYXJnaW46IHsgbGVmdDogLTk2MCB9LFxufTtcblxuLyoqIFRoZSBzZXR0aW5ncycgb3duIGRhcmsgYmFja2Ryb3A6IHdpbmUgcmVkIGF0IHRoZSB0b3AgZmFkaW5nIGludG8gYmx1ZS1cbiAqICBibGFjaywgYSBicmVhdGggb2YgdGhlIGRhdGFzY2FwZSBzdGlsbCBzaG93aW5nIHRocm91Z2guICovXG5leHBvcnQgZnVuY3Rpb24gQmFja2Ryb3AoKSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDU2LCAxOSwgMjcsIDAuOTgpXCIgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSgzMywgMTMsIDIxLCAwLjk4KVwiLCBwb3NpdGlvbjogXCIyMiVcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDEzLCA4LCAxNSwgMC45OClcIiwgcG9zaXRpb246IFwiNDUlXCIgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSg1LCA5LCAxNCwgMC45OClcIiwgcG9zaXRpb246IFwiNjUlXCIgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSg2LCAxNCwgMTksIDAuOTgpXCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfX1cbiAgICAvPlxuICApO1xufVxuXG4vKiogQSBzdWItc2NyZWVuJ3MgdGl0bGUsIGNlbnRyZWQgb3ZlciBhIGxvbmcgcmVkIHJ1bGUuICovXG5leHBvcnQgZnVuY3Rpb24gU3ViSGVhZGVyKHsgdGl0bGUgfTogeyB0aXRsZTogc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzNixcbiAgICAgICAgICByaWdodDogMzYsXG4gICAgICAgICAgdG9wOiA3MCxcbiAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMzIpXCIsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMzIsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgc3R5bGU9e3sgd2lkdGg6IDMwLCBoZWlnaHQ6IDMwIH19PlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1sxMCwgMSwgMTksIDEwLCAxMCwgMTksIDEsIDEwXX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17Qy5yZWR9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGNpcmNsZSBjeD17Ny41fSBjeT17OC41fSByPXsxLjZ9IGZpbGw9XCJub25lXCIgc3Ryb2tlPXtDLnJlZH0gLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsxMi41fSBjeT17MTEuNX0gcj17MS42fSBmaWxsPVwibm9uZVwiIHN0cm9rZT17Qy5yZWR9IC8+XG4gICAgICAgICAgPGxpbmUgeDE9ezl9IHkxPXs5LjV9IHgyPXsxMX0geTI9ezEwLjV9IHN0cm9rZT17Qy5yZWR9IC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogNiwgbGluZUhlaWdodDogMS4xIH19PlxuICAgICAgICAgIHtcIjQ4NDgxODFcXG40MTU1NjgxXFxuQjAwTDM2NFxcbjMwNjEyMzNcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnRpdGxlLCBmb250U2l6ZTogMzAgfX0+e3RpdGxlfTwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIEEgc2VjdGlvbiBoZWFkZXI6IGEgdGVhbCBydWxlIG92ZXIgYSBsaWdodGVyIGJhbmQsIHRoZSBuYW1lIGluIHdoaXRlLiAqL1xuZnVuY3Rpb24gU2VjdGlvbih7IGxhYmVsIH06IHsgbGFiZWw6IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgbWFyZ2luOiB7IHRvcDogNywgYm90dG9tOiA4IH0gfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICBhbmdsZTogOTAsXG4gICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiMyYzFhMjRcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiMzNDg0N2FcIiwgcG9zaXRpb246IFwiMjUlXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCIjMmEzZTY2XCIsIHBvc2l0aW9uOiBcIjQ4JVwiIH0sXG4gICAgICAgICAgICAgIHsgY29sb3I6IFwiIzJjMWE0YVwiIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6IDQwLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxMSB9LFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDQwLCA0NiwgNzAsIDAuMjIpXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXtULnNlY3Rpb259PntsYWJlbH08L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogT25lIHNldHRpbmc6IHRoZSBsYWJlbCBpbiByZWQsIHRoZSB3aWRnZXQgaW4gdGhlIHJpZ2h0LWhhbmQgY29sdW1uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldHRpbmdSb3coe1xuICByb3csXG4gIHZhbHVlcyxcbiAgbGlzdGVuaW5nLFxuICBvbkNoYW5nZSxcbiAgb25MaXN0ZW4sXG59OiB7XG4gIHJvdzogUm93O1xuICB2YWx1ZXM6IFJlY29yZDxzdHJpbmcsIFNldHRpbmdWYWx1ZT47XG4gIC8qKiBUaGUga2V5IGJpbmRpbmcgd2FpdGluZyBmb3IgYSBrZXksIGlmIGFueS4gKi9cbiAgbGlzdGVuaW5nOiBzdHJpbmcgfCBudWxsO1xuICBvbkNoYW5nZTogKGlkOiBzdHJpbmcsIHZhbHVlOiBTZXR0aW5nVmFsdWUpID0+IHZvaWQ7XG4gIG9uTGlzdGVuOiAoaWQ6IHN0cmluZykgPT4gdm9pZDtcbn0pIHtcbiAgaWYgKHJvdy5raW5kID09PSBcInNlY3Rpb25cIikgcmV0dXJuIDxTZWN0aW9uIGxhYmVsPXtyb3cubGFiZWx9IC8+O1xuICBsZXQgd2lkZ2V0OiBSZWFjdE5vZGU7XG4gIHN3aXRjaCAocm93LmtpbmQpIHtcbiAgICBjYXNlIFwic2VsZWN0XCI6XG4gICAgICB3aWRnZXQgPSAoXG4gICAgICAgIDxTZWxlY3RvclxuICAgICAgICAgIG9wdGlvbnM9e3Jvdy5vcHRpb25zfVxuICAgICAgICAgIHZhbHVlPXtOdW1iZXIodmFsdWVzW3Jvdy5pZF0pfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gb25DaGFuZ2Uocm93LmlkLCB2KX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwidG9nZ2xlXCI6XG4gICAgICB3aWRnZXQgPSAoXG4gICAgICAgIDxUb2dnbGVcbiAgICAgICAgICB2YWx1ZT17dmFsdWVzW3Jvdy5pZF0gPT09IHRydWV9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBvbkNoYW5nZShyb3cuaWQsIHYpfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJzbGlkZXJcIjpcbiAgICAgIHdpZGdldCA9IChcbiAgICAgICAgPFNsaWRlckJhclxuICAgICAgICAgIHJvdz17cm93fVxuICAgICAgICAgIHZhbHVlPXtOdW1iZXIodmFsdWVzW3Jvdy5pZF0pfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gb25DaGFuZ2Uocm93LmlkLCB2KX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwia2V5XCI6XG4gICAgICB3aWRnZXQgPSAoXG4gICAgICAgIDxLZXlCaW5kXG4gICAgICAgICAgY29kZT17U3RyaW5nKHZhbHVlc1tyb3cuaWRdKX1cbiAgICAgICAgICBsaXN0ZW5pbmc9e2xpc3RlbmluZyA9PT0gcm93LmlkfVxuICAgICAgICAgIG9uTGlzdGVuPXsoKSA9PiBvbkxpc3Rlbihyb3cuaWQpfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJpbmZvXCI6XG4gICAgICB3aWRnZXQgPSA8SW5mbyB2YWx1ZT17cm93LnZhbHVlfSAvPjtcbiAgfVxuICByZXR1cm4gPFJvd0ZyYW1lIGxhYmVsPXtyb3cubGFiZWx9Pnt3aWRnZXR9PC9Sb3dGcmFtZT47XG59XG5cbi8qKiBBIHJvdydzIGZyYW1lOiA0NyBweCwgbGl0IGZhaW50bHkgdW5kZXIgdGhlIHBvaW50ZXIuIFRoZSBsYWJlbCByaWRlcyBhXG4gKiAgbGl0dGxlIGFib3ZlIHRoZSB3aWRnZXQncyBjZW50cmUsIGxpa2UgdGhlIGdhbWUncy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSb3dGcmFtZSh7XG4gIGxhYmVsLFxuICBjaGlsZHJlbixcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNmeChcImhvdmVyXCIpfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgaGVpZ2h0OiA0NyxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMjAsIHJpZ2h0OiAyNSB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMDUpXCIgfX1cbiAgICA+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULmxhYmVsLCBtYXJnaW46IHsgYm90dG9tOiAxNCB9IH19PntsYWJlbH08L3RleHQ+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIGRhcmsgcGxhdGUgdW5kZXIgYSBzZWxlY3Rvciwgc2xpZGVyIG9yIGtleSBiaW5kaW5nLiAqL1xuZnVuY3Rpb24gcGxhdGUobGluZSA9IEZSQU1FKTogQmV2eVN0eWxlIHtcbiAgcmV0dXJuIHsgLi4uY2hhbWZlcihDLmZpZWxkLCAxMCwgbGluZSwgMSksIHdpZHRoOiBXSURUSCwgaGVpZ2h0OiA0MCB9O1xufVxuXG4vKiogYOKXgSB2YWx1ZSDilrdgLCB3aXRoIGEgcGlwIHBlciBvcHRpb24gdW5kZXIgdGhlIHZhbHVlLiAqL1xuZnVuY3Rpb24gU2VsZWN0b3Ioe1xuICBvcHRpb25zLFxuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG59OiB7XG4gIG9wdGlvbnM6IHN0cmluZ1tdO1xuICB2YWx1ZTogbnVtYmVyO1xuICBvbkNoYW5nZTogKHZhbHVlOiBudW1iZXIpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IHN0ZXAgPSAoZDogbnVtYmVyKSA9PiB7XG4gICAgc2Z4KFwiY2xpY2tcIik7XG4gICAgb25DaGFuZ2UoKHZhbHVlICsgZCArIG9wdGlvbnMubGVuZ3RoKSAlIG9wdGlvbnMubGVuZ3RoKTtcbiAgfTtcbiAgY29uc3QgcGlwID0gTWF0aC5taW4oMjAsICgyODAgLSA0ICogKG9wdGlvbnMubGVuZ3RoIC0gMSkpIC8gb3B0aW9ucy5sZW5ndGgpO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5wbGF0ZSgpLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAyMSB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3BsYXRlKEZSQU1FX0hPVCl9XG4gICAgPlxuICAgICAgPEFycm93QnV0dG9uIGRpcj1cImxlZnRcIiBvbkNsaWNrPXsoKSA9PiBzdGVwKC0xKX0gLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlZBTFVFLCBtYXJnaW46IHsgYm90dG9tOiA1IH0gfX0+e29wdGlvbnNbdmFsdWVdfTwvdGV4dD5cbiAgICAgIDxBcnJvd0J1dHRvbiBkaXI9XCJyaWdodFwiIG9uQ2xpY2s9eygpID0+IHN0ZXAoMSl9IC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgYm90dG9tOiA1LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiA0LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7b3B0aW9ucy5tYXAoKF8sIGkpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IHBpcCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiAyLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGkgPT09IHZhbHVlID8gXCIjZTk0YTQyXCIgOiBcIiM0YTFkMjRcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBBcnJvd0J1dHRvbih7XG4gIGRpcixcbiAgb25DbGljayxcbn06IHtcbiAgZGlyOiBcImxlZnRcIiB8IFwicmlnaHRcIjtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IDMyLFxuICAgICAgICBoZWlnaHQ6IDMyLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDk0LCAyNDYsIDI1NSwgMC4wOClcIiB9fVxuICAgID5cbiAgICAgIDxBcnJvdyBkaXI9e2Rpcn0gLz5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIE9GRiB8IE9OOiB0aGUgY2hvc2VuIGhhbGYgbGl0IChyZWQgT0ZGLCBjeWFuIE9OKSwgdGhlIG90aGVyIGFsbCBidXRcbiAqICBnb25lLiAqL1xuZnVuY3Rpb24gVG9nZ2xlKHtcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlLFxufToge1xuICB2YWx1ZTogYm9vbGVhbjtcbiAgb25DaGFuZ2U6ICh2YWx1ZTogYm9vbGVhbikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgaGFsZiA9IChvbjogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IGxpdCA9IHZhbHVlID09PSBvbjtcbiAgICBjb25zdCBbZmlsbCwgbGluZSwgaW5rXSA9IG9uXG4gICAgICA/IGxpdFxuICAgICAgICA/IFtDLmN5YW4sIEMuY3lhbkhpLCBcIiMwNjE0MWFcIl1cbiAgICAgICAgOiBbXCIjMGExZDIwXCIsIFwiIzBmMmEyZlwiLCBcIiMxMjM1M2JcIl1cbiAgICAgIDogbGl0XG4gICAgICAgID8gW1wiIzkzMmQyYVwiLCBcIiNjNzNkMzhcIiwgXCIjZmY2ZjY0XCJdXG4gICAgICAgIDogW1wiIzFhMGMxMFwiLCBcIiMyYTBlMTNcIiwgXCIjM2QxMTE2XCJdO1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBzZngoXCJjbGlja1wiKTtcbiAgICAgICAgICBvbkNoYW5nZShvbik7XG4gICAgICAgIH19XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihmaWxsLCAxMCwgbGluZSwgMSwgb24gPyBcImJyXCIgOiBcImJsXCIpLFxuICAgICAgICAgIHdpZHRoOiAyMjIsXG4gICAgICAgICAgaGVpZ2h0OiAzOCxcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICBjb2xvcjogaW5rLFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMC41LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7b24gPyBcIk9OXCIgOiBcIk9GRlwifVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L2J1dHRvbj5cbiAgICApO1xuICB9O1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogV0lEVEgsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7aGFsZihmYWxzZSl9XG4gICAgICB7aGFsZih0cnVlKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgdmFsdWUgY2VudHJlZCBvbiBhIHBsYXRlLCBhIHJlZCBibG9jayBtYXJraW5nIHdoZXJlIGl0IHNpdHM7IGNsaWNrXG4gKiAgb3IgZHJhZyBhbnl3aGVyZSBvbiBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTbGlkZXJCYXIoe1xuICByb3csXG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbn06IHtcbiAgcm93OiBTbGlkZXI7XG4gIHZhbHVlOiBudW1iZXI7XG4gIG9uQ2hhbmdlOiAodmFsdWU6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgeyBtaW4sIG1heCwgc3RlcCB9ID0gcm93O1xuICBjb25zdCBkZWNpbWFscyA9IE1hdGgubWF4KDAsIC1NYXRoLmZsb29yKE1hdGgubG9nMTAoc3RlcCkpKTtcbiAgY29uc3Qgc2V0ID0gKGU6IFBvaW50ZXJFdmVudERhdGEpID0+IHtcbiAgICAvLyBUaGUgYmxvY2sncyBjZW50cmUgdHJhdmVscyBmcm9tIDIwIHB4IGluIHRvIDIwIHB4IGZyb20gdGhlIGVuZC5cbiAgICBjb25zdCB0ID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgKGUueCAqIFdJRFRIIC0gMjApIC8gKFdJRFRIIC0gNDApKSk7XG4gICAgY29uc3QgbmV4dCA9IE51bWJlcihcbiAgICAgIChNYXRoLnJvdW5kKChtaW4gKyB0ICogKG1heCAtIG1pbikpIC8gc3RlcCkgKiBzdGVwKS50b0ZpeGVkKGRlY2ltYWxzKSxcbiAgICApO1xuICAgIGlmIChuZXh0ICE9PSB2YWx1ZSkgb25DaGFuZ2UobmV4dCk7XG4gIH07XG4gIGNvbnN0IGxlZnQgPSAoKHZhbHVlIC0gbWluKSAvIChtYXggLSBtaW4pKSAqIChXSURUSCAtIDQyKTtcbiAgLy8gV2hpdGUgd2hlcmUgdGhlIGJsb2NrIHNpdHMgdW5kZXIgdGhlIHZhbHVlLlxuICBjb25zdCB1bmRlciA9IE1hdGguYWJzKGxlZnQgKyAyMCAtIChXSURUSCAtIDIpIC8gMikgPCA0MDtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25Qb2ludGVyRG93bj17c2V0fVxuICAgICAgb25Qb2ludGVyTW92ZT17c2V0fVxuICAgICAgc3R5bGU9e3sgLi4ucGxhdGUoKSwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3BsYXRlKEZSQU1FX0hPVCl9XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKFwiI2RkNDY0M1wiLCAxMCksXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgIHdpZHRoOiA0MCxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5WQUxVRSwgY29sb3I6IHVuZGVyID8gQy53aGl0ZSA6IEMuY3lhbiB9fT5cbiAgICAgICAge3ZhbHVlLnRvRml4ZWQoZGVjaW1hbHMpfVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSBrZXkgYW4gYWN0aW9uIGlzIGJvdW5kIHRvLCBhcyBhIGtleWNhcCAob3IgdGhlIG1vdXNlKTsgY2xpY2ssIHRoZW5cbiAqICBwcmVzcyBhIGtleSB0byByZWJpbmQuICovXG5mdW5jdGlvbiBLZXlCaW5kKHtcbiAgY29kZSxcbiAgbGlzdGVuaW5nLFxuICBvbkxpc3Rlbixcbn06IHtcbiAgY29kZTogc3RyaW5nO1xuICBsaXN0ZW5pbmc6IGJvb2xlYW47XG4gIG9uTGlzdGVuOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgc2Z4KFwiY2xpY2tcIik7XG4gICAgICAgIG9uTGlzdGVuKCk7XG4gICAgICB9fVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4ucGxhdGUobGlzdGVuaW5nID8gQy5jeWFuIDogRlJBTUUpLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXtwbGF0ZShsaXN0ZW5pbmcgPyBDLmN5YW4gOiBGUkFNRV9IT1QpfVxuICAgID5cbiAgICAgIHtsaXN0ZW5pbmcgPyAoXG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlZBTFVFLCBmb250RmFtaWx5OiBGLnNlbWlib2xkLCBsZXR0ZXJTcGFjaW5nOiAxIH19PlxuICAgICAgICAgIFBSRVNTIEEgS0VZXG4gICAgICAgIDwvdGV4dD5cbiAgICAgICkgOiBjb2RlLnN0YXJ0c1dpdGgoXCJNb3VzZVwiKSA/IChcbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJmbGV4U3RhcnRcIiwgZ2FwOiAxIH19PlxuICAgICAgICAgIDxNb3VzZUljb24gc2l6ZT17Mjh9IC8+XG4gICAgICAgICAge2NvZGUuaW5jbHVkZXMoXCJXaGVlbFwiKSAmJiAoXG4gICAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgOCA2XCIgc3R5bGU9e3sgd2lkdGg6IDgsIGhlaWdodDogNiB9fT5cbiAgICAgICAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICAgICAgICBwb2ludHM9e1xuICAgICAgICAgICAgICAgICAgY29kZS5lbmRzV2l0aChcIlVwXCIpID8gWzAsIDYsIDQsIDAsIDgsIDZdIDogWzAsIDAsIDgsIDAsIDQsIDZdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbGw9e0MuY3lhbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkgOiAoXG4gICAgICAgIDxLZXljYXAgaz17a2V5TGFiZWwoY29kZSl9IC8+XG4gICAgICApfVxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogQSBzZXR0aW5nIHRoYXQgY2FuJ3QgY2hhbmdlIGhlcmUsIHNob3duIG9uIGEgcGFsZSBwbGF0ZS4gKi9cbmZ1bmN0aW9uIEluZm8oeyB2YWx1ZSB9OiB7IHZhbHVlOiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5jaGFtZmVyKFwiIzEyMGUxOFwiLCAxMCwgXCIjYjhhZWIzXCIsIDEpLFxuICAgICAgICB3aWR0aDogV0lEVEgsXG4gICAgICAgIGhlaWdodDogNDAsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5WQUxVRSwgY29sb3I6IFwiI2NkYzZjYVwiLCBtYXJnaW46IHsgYm90dG9tOiA1IH0gfX0+XG4gICAgICAgIHt2YWx1ZX1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgYm90dG9tOiA1LFxuICAgICAgICAgIHdpZHRoOiAyMCxcbiAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNlOTRhNDJcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogS2V5cyBuYW1lZCB0aGUgd2F5IGEga2V5Y2FwIGZpdHMgdGhlbS4gKi9cbmNvbnN0IEtFWV9OQU1FUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgU3BhY2U6IFwic3BhY2VcIixcbiAgRW50ZXI6IFwiZW50ZXJcIixcbiAgU2hpZnRMZWZ0OiBcIlNISUZUXCIsXG4gIFNoaWZ0UmlnaHQ6IFwiU0hJRlRcIixcbiAgQ29udHJvbExlZnQ6IFwiQ1RSTFwiLFxuICBDb250cm9sUmlnaHQ6IFwiQ1RSTFwiLFxuICBBbHRMZWZ0OiBcIkFMVFwiLFxuICBBbHRSaWdodDogXCJBTFRcIixcbiAgVGFiOiBcIlRBQlwiLFxuICBCYWNrc3BhY2U6IFwiQktTUFwiLFxuICBDYXBzTG9jazogXCJDQVBTXCIsXG4gIEFycm93VXA6IFwiVVBcIixcbiAgQXJyb3dEb3duOiBcIkRPV05cIixcbiAgQXJyb3dMZWZ0OiBcIkxFRlRcIixcbiAgQXJyb3dSaWdodDogXCJSSUdIVFwiLFxuICBNaW51czogXCItXCIsXG4gIEVxdWFsOiBcIj1cIixcbiAgQnJhY2tldExlZnQ6IFwiW1wiLFxuICBCcmFja2V0UmlnaHQ6IFwiXVwiLFxuICBTZW1pY29sb246IFwiO1wiLFxuICBRdW90ZTogXCInXCIsXG4gIENvbW1hOiBcIixcIixcbiAgUGVyaW9kOiBcIi5cIixcbiAgU2xhc2g6IFwiL1wiLFxuICBCYWNrc2xhc2g6IFwiXFxcXFwiLFxuICBCYWNrcXVvdGU6IFwiYFwiLFxufTtcblxuLyoqIGBcIktleVdcImAg4oaSIGBcIldcImAsIGBcIlNoaWZ0TGVmdFwiYCDihpIgYFwiU0hJRlRcImAgKGEgYEtleWJvYXJkRXZlbnQuY29kZWApLiAqL1xuZnVuY3Rpb24ga2V5TGFiZWwoY29kZTogc3RyaW5nKSB7XG4gIHJldHVybiAoXG4gICAgS0VZX05BTUVTW2NvZGVdID8/XG4gICAgY29kZVxuICAgICAgLnJlcGxhY2UoL14oS2V5fERpZ2l0KS8sIFwiXCIpXG4gICAgICAucmVwbGFjZSgvXk51bXBhZC8sIFwiTlVNXCIpXG4gICAgICAudG9VcHBlckNhc2UoKVxuICAgICAgLnNsaWNlKDAsIDUpXG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHsgQywgRiwgVCB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgRWRnZVJhaWxzIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBGSUxMLCBIaW50LCBIaW50cyB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IEJhY2tkcm9wLCBTVEFHRSwgU3ViSGVhZGVyIH0gZnJvbSBcIi4vcm93c1wiO1xuXG4vKiogQ09OVFJPTCBTQ0hFTUU6IGEgZ2FtZXBhZCBpbiByZWQgb3V0bGluZSwgd2hhdCBlYWNoIGNvbnRyb2wgZG9lcyBjYWxsZWRcbiAqICBvdXQgaW4gdGhlIG1hcmdpbnMgYWxvbmcgY3lhbiB3aXJlcy4gRXNjIHJldHVybnMgdG8gdGhlIHNldHRpbmdzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbnRyb2xTY2hlbWUoeyBvbkJhY2sgfTogeyBvbkJhY2s6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBiYWNrID0gKCkgPT4ge1xuICAgIHNmeChcImJhY2tcIik7XG4gICAgb25CYWNrKCk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGJhY2soKTtcbiAgfSk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPEJhY2tkcm9wIC8+XG4gICAgICA8U3ViSGVhZGVyIHRpdGxlPVwiQ09OVFJPTCBTQ0hFTUVcIiAvPlxuICAgICAgPEVkZ2VSYWlscyAvPlxuICAgICAgPG5vZGUgc3R5bGU9e1NUQUdFfT5cbiAgICAgICAgPEdhbWVwYWQgLz5cbiAgICAgICAge0NBTExPVVRTLm1hcCgoW3NpZGUsIHgsIHksIGljb24sIGxpbmVzXSkgPT4gKFxuICAgICAgICAgIDxMYWJlbCBrZXk9e2Ake3h9ICR7eX1gfSBzaWRlPXtzaWRlfSB4PXt4fSB5PXt5fSBpY29uPXtpY29ufT5cbiAgICAgICAgICAgIHtsaW5lc31cbiAgICAgICAgICA8L0xhYmVsPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIkVTQ1wiIGxhYmVsPVwiQ2xvc2VcIiBvbkNsaWNrPXtiYWNrfSAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBXaGF0IGVhY2ggY29udHJvbCBkb2VzOiAoc2lkZSwgeCBvZiB0aGUgaWNvbidzIG91dGVyIGVkZ2UsIHkgb2YgdGhlXG4gKiAgZmlyc3QgbGluZSwgaWNvbiwgbGluZXMpLiAqL1xuY29uc3QgQ0FMTE9VVFM6IFtcImxlZnRcIiB8IFwicmlnaHRcIiwgbnVtYmVyLCBudW1iZXIsIFJlYWN0Tm9kZSwgc3RyaW5nW11dW10gPSBbXG4gIFtcImxlZnRcIiwgNzMwLCAxODAsIDxTbWFsbCBnbHlwaD1cInZpZXdcIiAvPiwgW1wiSG9sbyBNYXBcIl1dLFxuICBbXCJyaWdodFwiLCAxMTg2LCAxODAsIDxTbWFsbCBnbHlwaD1cIm1lbnVcIiAvPiwgW1wiUGF1c2UgTWVudVwiXV0sXG4gIFtcImxlZnRcIiwgNTAwLCAyNDgsIDxUYWcgaz1cIkxCXCIgLz4sIFtcIlBpbmcgU2NhblwiLCBcIlNjYW5uZXIgTW9kZSAoSG9sZClcIl1dLFxuICBbXCJsZWZ0XCIsIDUwMCwgMzM4LCA8VGFnIGs9XCJMVFwiIC8+LCBbXCIoTWVsZWUpIEd1YXJkXCIsIFwiKFJhbmdlZCkgQWltXCJdXSxcbiAgW1wibGVmdFwiLCA1MDAsIDQ0OCwgPFRhZyBrPVwiTFNcIiAvPiwgW1wiU3ByaW50XCJdXSxcbiAgW1wibGVmdFwiLCA1MDAsIDQ5MCwgPFRhZyBrPVwiTFMrUlNcIiAvPiwgW1wiUGhvdG8gTW9kZVwiXV0sXG4gIFtcImxlZnRcIiwgNTAwLCA1MzQsIDxTbWFsbCBnbHlwaD1cInN0aWNrXCIgLz4sIFtcIk1vdmVcIl1dLFxuICBbXG4gICAgXCJsZWZ0XCIsXG4gICAgNTAwLFxuICAgIDYwMCxcbiAgICA8U21hbGwgZ2x5cGg9XCJkcGFkXCIgLz4sXG4gICAgW1wiKERpYWxvZ3VlKSBVcFwiLCBcIlVzZSBDb25zdW1hYmxlXCIsIFwiKEFpbWluZykgWm9vbSBJblwiXSxcbiAgXSxcbiAgW1xuICAgIFwibGVmdFwiLFxuICAgIDUwMCxcbiAgICA3MDgsXG4gICAgPFNtYWxsIGdseXBoPVwiZHBhZFwiIC8+LFxuICAgIFtcIihEaWFsb2d1ZSkgRG93blwiLCBcIihBaW1pbmcpIFpvb20gT3V0XCIsIFwiQ3ljbGUgT2JqZWN0aXZlXCJdLFxuICBdLFxuICBbXCJsZWZ0XCIsIDUwMCwgODIwLCA8U21hbGwgZ2x5cGg9XCJkcGFkXCIgLz4sIFtcIk1lc3NhZ2VzXCJdXSxcbiAgW1wibGVmdFwiLCA1MDAsIDg2OCwgPFNtYWxsIGdseXBoPVwiZHBhZFwiIC8+LCBbXCJTdW1tb24gVmVoaWNsZVwiXV0sXG4gIFtcbiAgICBcInJpZ2h0XCIsXG4gICAgMTQxNCxcbiAgICAyMzYsXG4gICAgPFRhZyBrPVwiUkJcIiAvPixcbiAgICBbXCJVc2UgQ29tYmF0IEltcGxhbnRcIiwgXCJBaW0gQ29tYmF0IEltcGxhbnQgKEhvbGQpXCJdLFxuICBdLFxuICBbXG4gICAgXCJyaWdodFwiLFxuICAgIDE0MTQsXG4gICAgMzE1LFxuICAgIDxUYWcgaz1cIlJUXCIgLz4sXG4gICAgW1wiKFJhbmdlZCkgRmlyZVwiLCBcIihNZWxlZSkgTGlnaHQgU3RyaWtlXCIsIFwiKE1lbGVlKSBIZWF2eSBTdHJpa2UgKEhvbGQpXCJdLFxuICBdLFxuICBbXCJyaWdodFwiLCAxNDE0LCA0NDcsIDxTbWFsbCBnbHlwaD1cIndlc3RcIiAvPiwgW1wiSW50ZXJhY3RcIiwgXCJSZWxvYWRcIl1dLFxuICBbXG4gICAgXCJyaWdodFwiLFxuICAgIDE0MTQsXG4gICAgNTE3LFxuICAgIDxTbWFsbCBnbHlwaD1cIm5vcnRoXCIgLz4sXG4gICAgW1wiRHJhdyBXZWFwb25cIiwgXCJIb2xzdGVyIFdlYXBvbiAoRG91YmxlLVRhcClcIl0sXG4gIF0sXG4gIFtcInJpZ2h0XCIsIDE0MTQsIDU5MCwgPFNtYWxsIGdseXBoPVwibm9ydGhcIiAvPiwgW1wiUXVpY2sgQWNjZXNzIE1lbnUgKEhvbGQpXCJdXSxcbiAgW1wicmlnaHRcIiwgMTQxNCwgNjMyLCA8U21hbGwgZ2x5cGg9XCJzb3V0aFwiIC8+LCBbXCJKdW1wXCJdXSxcbiAgW1xuICAgIFwicmlnaHRcIixcbiAgICAxNDE0LFxuICAgIDY3NSxcbiAgICA8U21hbGwgZ2x5cGg9XCJlYXN0XCIgLz4sXG4gICAgW1wiQ3JvdWNoXCIsIFwiRG9kZ2UgKERvdWJsZS1UYXApXCJdLFxuICBdLFxuICBbXG4gICAgXCJyaWdodFwiLFxuICAgIDEzMTQsXG4gICAgNzUxLFxuICAgIDxUYWcgaz1cIlJTXCIgLz4sXG4gICAgW1wiUXVpY2sgTWVsZWUgQXR0YWNrXCIsIFwiKFNjYW5uaW5nKSBNYXJrIFRhcmdldFwiXSxcbiAgXSxcbiAgW1wicmlnaHRcIiwgMTMxNCwgODIwLCA8U21hbGwgZ2x5cGg9XCJzdGlja1wiIC8+LCBbXCJMb29rIEFyb3VuZFwiXV0sXG5dO1xuXG4vKiogQSBjYWxsb3V0OiBsaW5lcyBvZiByZWQgdGV4dCBieSBhIGN5YW4gaWNvbiwgaGFuZ2luZyBvZmYgYHhgICh0aGVcbiAqICBpY29uJ3Mgb3V0ZXIgZWRnZSkgb24gdGhlIGdpdmVuIHNpZGUuICovXG5mdW5jdGlvbiBMYWJlbCh7XG4gIHgsXG4gIHksXG4gIHNpZGUsXG4gIGljb24sXG4gIGNoaWxkcmVuLFxufToge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgc2lkZTogXCJsZWZ0XCIgfCBcInJpZ2h0XCI7XG4gIGljb246IFJlYWN0Tm9kZTtcbiAgY2hpbGRyZW46IHN0cmluZ1tdO1xufSkge1xuICBjb25zdCBsZWZ0ID0gc2lkZSA9PT0gXCJsZWZ0XCI7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICB0b3A6IHkgLSAxNixcbiAgICAgICAgLi4uKGxlZnQgPyB7IHJpZ2h0OiAxOTIwIC0geCB9IDogeyBsZWZ0OiB4IH0pLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBsZWZ0ID8gXCJyb3dcIiA6IFwicm93UmV2ZXJzZVwiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhTdGFydFwiLFxuICAgICAgICBnYXA6IDEwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogbGVmdCA/IFwiZmxleEVuZFwiIDogXCJmbGV4U3RhcnRcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2NoaWxkcmVuLm1hcCgobGluZSkgPT4gKFxuICAgICAgICAgIDx0ZXh0IGtleT17bGluZX0gc3R5bGU9e3sgLi4uVC5sYWJlbCwgbGluZUhlaWdodDogMS40IH19PlxuICAgICAgICAgICAge2xpbmV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGhlaWdodDogMzEsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+e2ljb259PC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgYnVtcGVyLCB0cmlnZ2VyIG9yIHN0aWNrLWNsaWNrIGJhZGdlLiAqL1xuZnVuY3Rpb24gVGFnKHsgayB9OiB7IGs6IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGhlaWdodDogMTgsXG4gICAgICAgIG1pbldpZHRoOiAyNixcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAzIH0sXG4gICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmN5YW4sXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRTaXplOiAxMSxcbiAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgY29sb3I6IFwiIzA2MTQxYVwiLFxuICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2t9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG50eXBlIEdseXBoID1cbiAgfCBcInZpZXdcIlxuICB8IFwibWVudVwiXG4gIHwgXCJzdGlja1wiXG4gIHwgXCJkcGFkXCJcbiAgfCBcIm5vcnRoXCJcbiAgfCBcImVhc3RcIlxuICB8IFwic291dGhcIlxuICB8IFwid2VzdFwiO1xuXG4vKiogQSBjeWFuIGRpc2Mgd2l0aCBhIGNvbnRyb2wncyBnbHlwaCwgYXMgdGhlIG1hcmdpbnMgc2hvdyBpdC4gKi9cbmZ1bmN0aW9uIFNtYWxsKHsgZ2x5cGggfTogeyBnbHlwaDogR2x5cGggfSkge1xuICBjb25zdCBpbmsgPSBcIiMwNjE0MWFcIjtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBzdHlsZT17eyB3aWR0aDogMjQsIGhlaWdodDogMjQgfX0+XG4gICAgICB7Z2x5cGggPT09IFwiZHBhZFwiID8gKFxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIHBvaW50cz17UExVUygxMiwgMTIsIDQsIDEwKX1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtDLmN5YW59XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuOH1cbiAgICAgICAgLz5cbiAgICAgICkgOiBnbHlwaCA9PT0gXCJzdGlja1wiID8gKFxuICAgICAgICA8PlxuICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgIGN4PXsxMn1cbiAgICAgICAgICAgIGN5PXsxMn1cbiAgICAgICAgICAgIHI9ezEwLjV9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e0MuY3lhbn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsxMn0gY3k9ezEyfSByPXs2fSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgIDwvPlxuICAgICAgKSA6IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsxMn0gY3k9ezEyfSByPXsxMC41fSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgICAgPEZhY2VHbHlwaCBnbHlwaD17Z2x5cGh9IGN4PXsxMn0gY3k9ezEyfSBzaXplPXs1fSBjb2xvcj17aW5rfSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBUaGUgbWFya3Mgb24gdGhlIGZhY2UgYnV0dG9ucyAoYW5kIHRoZSB0d28gc21hbGwgYnV0dG9ucykuICovXG5mdW5jdGlvbiBGYWNlR2x5cGgoe1xuICBnbHlwaCxcbiAgY3gsXG4gIGN5LFxuICBzaXplOiBzLFxuICBjb2xvcixcbn06IHtcbiAgZ2x5cGg6IEdseXBoO1xuICBjeDogbnVtYmVyO1xuICBjeTogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIGNvbG9yOiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IHN0cm9rZSA9IHsgc3Ryb2tlOiBjb2xvciwgc3Ryb2tlV2lkdGg6IHMgKiAwLjQsIGZpbGw6IFwibm9uZVwiIH07XG4gIHN3aXRjaCAoZ2x5cGgpIHtcbiAgICBjYXNlIFwibm9ydGhcIjpcbiAgICAgIHJldHVybiA8bGluZSB4MT17Y3h9IHkxPXtjeSAtIHN9IHgyPXtjeH0geTI9e2N5ICsgc30gey4uLnN0cm9rZX0gLz47XG4gICAgY2FzZSBcImVhc3RcIjpcbiAgICAgIHJldHVybiA8bGluZSB4MT17Y3ggLSBzfSB5MT17Y3l9IHgyPXtjeCArIHN9IHkyPXtjeX0gey4uLnN0cm9rZX0gLz47XG4gICAgY2FzZSBcInNvdXRoXCI6XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICBwb2ludHM9e1tcbiAgICAgICAgICAgIGN4IC0gcyxcbiAgICAgICAgICAgIGN5IC0gcyAqIDAuNSxcbiAgICAgICAgICAgIGN4LFxuICAgICAgICAgICAgY3kgKyBzICogMC42LFxuICAgICAgICAgICAgY3ggKyBzLFxuICAgICAgICAgICAgY3kgLSBzICogMC41LFxuICAgICAgICAgIF19XG4gICAgICAgICAgey4uLnN0cm9rZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgY2FzZSBcIndlc3RcIjpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxyZWN0XG4gICAgICAgICAgeD17Y3ggLSBzICogMC43fVxuICAgICAgICAgIHk9e2N5IC0gcyAqIDAuN31cbiAgICAgICAgICB3aWR0aD17cyAqIDEuNH1cbiAgICAgICAgICBoZWlnaHQ9e3MgKiAxLjR9XG4gICAgICAgICAgey4uLnN0cm9rZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgY2FzZSBcInZpZXdcIjpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxyZWN0XG4gICAgICAgICAgeD17Y3ggLSBzfVxuICAgICAgICAgIHk9e2N5IC0gcyAqIDAuNn1cbiAgICAgICAgICB3aWR0aD17cyAqIDJ9XG4gICAgICAgICAgaGVpZ2h0PXtzICogMS4yfVxuICAgICAgICAgIHJ4PXtzICogMC4zfVxuICAgICAgICAgIHsuLi5zdHJva2V9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIGNhc2UgXCJtZW51XCI6XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8PlxuICAgICAgICAgIHtbLTAuNSwgMCwgMC41XS5tYXAoKGQpID0+IChcbiAgICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICAgIGtleT17ZH1cbiAgICAgICAgICAgICAgeDE9e2N4IC0gcyAqIDAuOH1cbiAgICAgICAgICAgICAgeTE9e2N5ICsgZCAqIHN9XG4gICAgICAgICAgICAgIHgyPXtjeCArIHMgKiAwLjh9XG4gICAgICAgICAgICAgIHkyPXtjeSArIGQgKiBzfVxuICAgICAgICAgICAgICB7Li4uc3Ryb2tlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC8+XG4gICAgICApO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogQSBwbHVzIG91dGxpbmUgKHRoZSBkLXBhZCkgY2VudHJlZCBvbiAoY3gsIGN5KTogYXJtcyBgd2AgaGFsZi13aWRlLFxuICogIHJlYWNoaW5nIGBsYCBvdXQuICovXG5mdW5jdGlvbiBQTFVTKGN4OiBudW1iZXIsIGN5OiBudW1iZXIsIHc6IG51bWJlciwgbDogbnVtYmVyKSB7XG4gIHJldHVybiBbXG4gICAgWy13LCAtbF0sXG4gICAgW3csIC1sXSxcbiAgICBbdywgLXddLFxuICAgIFtsLCAtd10sXG4gICAgW2wsIHddLFxuICAgIFt3LCB3XSxcbiAgICBbdywgbF0sXG4gICAgWy13LCBsXSxcbiAgICBbLXcsIHddLFxuICAgIFstbCwgd10sXG4gICAgWy1sLCAtd10sXG4gICAgWy13LCAtd10sXG4gIF0uZmxhdE1hcCgoW3gsIHldKSA9PiBbY3ggKyB4LCBjeSArIHldKTtcbn1cblxuLyoqIFRoZSBwYWQncyBvdXRsaW5lLCByaWdodCBoYWxmIHRoZW4gbGVmdCAobWlycm9yZWQgYWJvdXQgeCA9IDk2MCkuICovXG5jb25zdCBCT0RZID1cbiAgXCJNOTYwIDM1MiBMMTA5OCAzNTIgQzExNDAgMzUwIDExNzIgMzYyIDExODggMzkyIEMxMjIyIDQ1OCAxMjQ4IDU3MCAxMjU2IDY1MCBcIiArXG4gIFwiQzEyNjIgNzEyIDEyNDAgNzM4IDEyMDggNzMwIEMxMTgyIDcyNCAxMTYyIDcwMCAxMTQwIDY2NCBDMTExNiA2MjYgMTA5MCA2MTIgMTA1MiA2MTIgXCIgK1xuICBcIkw4NjggNjEyIEM4MzAgNjEyIDgwNCA2MjYgNzgwIDY2NCBDNzU4IDcwMCA3MzggNzI0IDcxMiA3MzAgQzY4MCA3MzggNjU4IDcxMiA2NjQgNjUwIFwiICtcbiAgXCJDNjcyIDU3MCA2OTggNDU4IDczMiAzOTIgQzc0OCAzNjIgNzgwIDM1MCA4MjIgMzUyIFpcIjtcblxuLyoqIFRoZSBmYWNlIGJ1dHRvbnM6IChnbHlwaCwgY3gsIGN5KS4gKi9cbmNvbnN0IEZBQ0U6IFtHbHlwaCwgbnVtYmVyLCBudW1iZXJdW10gPSBbXG4gIFtcIm5vcnRoXCIsIDExMDQsIDQxMl0sXG4gIFtcIndlc3RcIiwgMTA3MCwgNDQ2XSxcbiAgW1wiZWFzdFwiLCAxMTM4LCA0NDZdLFxuICBbXCJzb3V0aFwiLCAxMTA0LCA0ODBdLFxuXTtcblxuLyoqIFRoZSB3aXJlcyBmcm9tIHRoZSBtYXJnaW5zIHRvIHRoZSBjb250cm9scyAoc3RhZ2UgcHgpLiAqL1xuY29uc3QgV0lSRVMgPSBbXG4gIFs1NDgsIDI0OCwgNzEyLCAyNDgsIDgwNiwgMzQ0XSxcbiAgWzUyMiwgNDQ4LCA3OTYsIDQ0OF0sXG4gIFs1MzAsIDYwMCwgODEwLCA2MDAsIDg2NiwgNTUwXSxcbiAgWzc0MiwgMTgwLCA4NzQsIDE4MCwgODc0LCA0MTIsIDkxMiwgNDQwXSxcbiAgWzEzODQsIDIzNiwgMTIzMiwgMjM2LCAxMTE4LCAzNDRdLFxuICBbMTM4NiwgNDcyLCAxMTUwLCA0NzIsIDExMjIsIDQ3OF0sXG4gIFsxMjkwLCA3NDgsIDEyNDAsIDc0OCwgMTA2MCwgNTYwXSxcbiAgWzExNzYsIDE4MCwgMTA0NiwgMTgwLCAxMDQ2LCA0MTIsIDEwMDgsIDQ0MF0sXG5dO1xuXG4vKiogQW4gb3JpZ2luYWwgcGFkLCBkcmF3biBpbiB0aGUgZ2FtZSdzIHJlZCBsaW5lIHdvcms6IHRoZSBib2R5IGFuZCBpdHNcbiAqICBpbm5lciBjb250b3VyLCBidW1wZXJzIGFuZCB0cmlnZ2VycywgdHdvIHN0aWNrcywgYSBkLXBhZCwgZm91ciBmYWNlXG4gKiAgYnV0dG9ucywgdGhlIHNtYWxsIGJ1dHRvbnMgYW5kIGEgY3Jlc3QuICovXG5mdW5jdGlvbiBHYW1lcGFkKCkge1xuICBjb25zdCByZWQgPSBDLnJlZDtcbiAgY29uc3QgZGltID0gXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjQ1KVwiO1xuICBjb25zdCBzdGljayA9IChjeDogbnVtYmVyLCBjeTogbnVtYmVyKSA9PiAoXG4gICAgPD5cbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY3g9e2N4fVxuICAgICAgICBjeT17Y3l9XG4gICAgICAgIHI9ezQwfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17ZGltfVxuICAgICAgICBzdHJva2VXaWR0aD17MS41fVxuICAgICAgLz5cbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY3g9e2N4fVxuICAgICAgICBjeT17Y3l9XG4gICAgICAgIHI9ezMxfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17cmVkfVxuICAgICAgICBzdHJva2VXaWR0aD17Mi4yfVxuICAgICAgLz5cbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY3g9e2N4fVxuICAgICAgICBjeT17Y3l9XG4gICAgICAgIHI9ezIyfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17cmVkfVxuICAgICAgICBzdHJva2VXaWR0aD17MS41fVxuICAgICAgLz5cbiAgICA8Lz5cbiAgKTtcbiAgcmV0dXJuIChcbiAgICA8c3ZnXG4gICAgICB2aWV3Qm94PVwiMCAwIDE5MjAgMTA4MFwiXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICB3aWR0aDogMTkyMCxcbiAgICAgICAgaGVpZ2h0OiAxMDgwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7V0lSRVMubWFwKChwb2ludHMsIGkpID0+IChcbiAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAga2V5PXtpfVxuICAgICAgICAgIHBvaW50cz17cG9pbnRzfVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e0MuY3lhbkRpbX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MS40fVxuICAgICAgICAvPlxuICAgICAgKSl9XG4gICAgICA8cGF0aFxuICAgICAgICBkPXtCT0RZfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17cmVkfVxuICAgICAgICBzdHJva2VXaWR0aD17Mi40fVxuICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoOTYwIDUwMCkgc2NhbGUoMC45NTUgMC45NCkgdHJhbnNsYXRlKC05NjAgLTUwMClcIj5cbiAgICAgICAgPHBhdGggZD17Qk9EWX0gZmlsbD1cIm5vbmVcIiBzdHJva2U9e2RpbX0gc3Ryb2tlV2lkdGg9ezEuNH0gLz5cbiAgICAgIDwvZz5cbiAgICAgIHsvKiBCdW1wZXJzIGFuZCB0cmlnZ2Vycy4gKi99XG4gICAgICB7WzEsIC0xXS5tYXAoKHNpZGUpID0+IChcbiAgICAgICAgPGdcbiAgICAgICAgICBrZXk9e3NpZGV9XG4gICAgICAgICAgdHJhbnNmb3JtPXtzaWRlIDwgMCA/IFwidHJhbnNsYXRlKDE5MjAgMCkgc2NhbGUoLTEgMSlcIiA6IHVuZGVmaW5lZH1cbiAgICAgICAgPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBkPVwiTTEwOTggMzQ2IEMxMTEyIDMzMiAxMTUwIDMyNiAxMTc2IDMzOCBDMTE4NiAzNDMgMTE5MSAzNTEgMTE5MCAzNjBcIlxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17Mi4yfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGQ9XCJNMTExMiAzMzAgQzExMTggMzEyIDExNDYgMzA2IDExNjIgMzE0IEwxMTcwIDMzNFwiXG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e2RpbX1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9nPlxuICAgICAgKSl9XG4gICAgICB7c3RpY2soODM4LCA0NDgpfVxuICAgICAge3N0aWNrKDEwMzAsIDUzMil9XG4gICAgICA8Y2lyY2xlXG4gICAgICAgIGN4PXs4OTN9XG4gICAgICAgIGN5PXs1MzJ9XG4gICAgICAgIHI9ezQwfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17ZGltfVxuICAgICAgICBzdHJva2VXaWR0aD17MS41fVxuICAgICAgLz5cbiAgICAgIDxwb2x5Z29uXG4gICAgICAgIHBvaW50cz17UExVUyg4OTMsIDUzMiwgMTEsIDMwKX1cbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e3JlZH1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezIuMn1cbiAgICAgIC8+XG4gICAgICB7RkFDRS5tYXAoKFtnbHlwaCwgY3gsIGN5XSkgPT4gKFxuICAgICAgICA8ZyBrZXk9e2dseXBofT5cbiAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICBjeD17Y3h9XG4gICAgICAgICAgICBjeT17Y3l9XG4gICAgICAgICAgICByPXsxNn1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17cmVkfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezIuMn1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGYWNlR2x5cGggZ2x5cGg9e2dseXBofSBjeD17Y3h9IGN5PXtjeX0gc2l6ZT17Nn0gY29sb3I9e3JlZH0gLz5cbiAgICAgICAgPC9nPlxuICAgICAgKSl9XG4gICAgICA8Y2lyY2xlXG4gICAgICAgIGN4PXs5MjJ9XG4gICAgICAgIGN5PXs0NDZ9XG4gICAgICAgIHI9ezExfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17cmVkfVxuICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgLz5cbiAgICAgIDxGYWNlR2x5cGggZ2x5cGg9XCJ2aWV3XCIgY3g9ezkyMn0gY3k9ezQ0Nn0gc2l6ZT17NX0gY29sb3I9e3JlZH0gLz5cbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY3g9ezk5OH1cbiAgICAgICAgY3k9ezQ0Nn1cbiAgICAgICAgcj17MTF9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAvPlxuICAgICAgPEZhY2VHbHlwaCBnbHlwaD1cIm1lbnVcIiBjeD17OTk4fSBjeT17NDQ2fSBzaXplPXs1fSBjb2xvcj17cmVkfSAvPlxuICAgICAgPHJlY3RcbiAgICAgICAgeD17OTUwfVxuICAgICAgICB5PXs0NzR9XG4gICAgICAgIHdpZHRoPXsyMH1cbiAgICAgICAgaGVpZ2h0PXsxMX1cbiAgICAgICAgcng9ezN9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAvPlxuICAgICAgey8qIFRoZSBjcmVzdDogYSBjdXQgZGlhbW9uZCwgbm9ib2R5J3MgbG9nby4gKi99XG4gICAgICA8cG9seWdvbiBwb2ludHM9e1s5NjAsIDM3MiwgOTgyLCAzOTQsIDk2MCwgNDE2LCA5MzgsIDM5NF19IGZpbGw9e3JlZH0gLz5cbiAgICAgIDxwb2x5bGluZVxuICAgICAgICBwb2ludHM9e1s5NDgsIDQwNCwgOTcyLCAzODRdfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT1cIiMxMjA3MDhcIlxuICAgICAgICBzdHJva2VXaWR0aD17M31cbiAgICAgIC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlS2V5cyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBjaGFtZmVyIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBFZGdlUmFpbHMgfSBmcm9tIFwiLi4vLi4vdWkvZGVjb3JcIjtcbmltcG9ydCB7IEZJTEwsIEhpbnQsIEhpbnRzIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHtcbiAgV09SRE1BUktfQVNQRUNULFxuICBXT1JETUFSS19QQVRILFxuICBXT1JETUFSS19WSUVXQk9YLFxufSBmcm9tIFwiLi4vLi4vdWkvd29yZG1hcmstcGF0aFwiO1xuaW1wb3J0IHsgR0FNTUEgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBCYWNrZHJvcCwgUm93RnJhbWUsIFNUQUdFLCBTbGlkZXJCYXIsIFN1YkhlYWRlciB9IGZyb20gXCIuL3Jvd3NcIjtcbmltcG9ydCB7IHNldFNldHRpbmcsIHVzZVNldHRpbmdzIH0gZnJvbSBcIi4vc3RvcmVcIjtcblxuLyoqIEdBTU1BIENPUlJFQ1RJT046IHRoZSB3b3JkbWFyayBvbiBibGFjayBpbiB0aHJlZSBzbGljZXMgb2YgcmlzaW5nXG4gKiAgYnJpZ2h0bmVzcywgc2VlbiB0aHJvdWdoIHRoZSBgZ2FtbWFgIGZpbHRlciBhdCB0aGUgY2hvc2VuIHZhbHVlIOKAlCB0aGVcbiAqICBzYW1lIGN1cnZlIHRoZSBzZXR0aW5nIHB1dHMgb24gdGhlIHdvcmxkIChgc2V0dGluZ3MucnNgKS4gRXNjIHJldHVybnMgdG9cbiAqICB0aGUgc2V0dGluZ3MuICovXG5leHBvcnQgZnVuY3Rpb24gR2FtbWEoeyBvbkJhY2sgfTogeyBvbkJhY2s6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBnYW1tYSA9IE51bWJlcih1c2VTZXR0aW5ncygpLmdhbW1hKTtcbiAgY29uc3QgYmFjayA9ICgpID0+IHtcbiAgICBzZngoXCJiYWNrXCIpO1xuICAgIG9uQmFjaygpO1xuICB9O1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSBiYWNrKCk7XG4gIH0pO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtGSUxMfT5cbiAgICAgIDxCYWNrZHJvcCAvPlxuICAgICAgPFN1YkhlYWRlciB0aXRsZT1cIkdBTU1BIENPUlJFQ1RJT05cIiAvPlxuICAgICAgPEVkZ2VSYWlscyAvPlxuICAgICAgPG5vZGUgc3R5bGU9e1NUQUdFfT5cbiAgICAgICAgPFRlc3RJbWFnZSBnYW1tYT17Z2FtbWF9IC8+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgdG9wOiA3NjQsXG4gICAgICAgICAgICBmb250U2l6ZTogMjUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgdGV4dEFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBSYWlzZSBvciBsb3dlciB0aGUgZ2FtbWEgdW50aWwgdGhlIG1hcmsgb24gdGhlIGxlZnQgaXMgb25seSBqdXN0XG4gICAgICAgICAgdmlzaWJsZS5cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIGxlZnQ6IDUxMCxcbiAgICAgICAgICAgIHRvcDogODI3LFxuICAgICAgICAgICAgd2lkdGg6IDkyNSxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxSb3dGcmFtZSBsYWJlbD17R0FNTUEubGFiZWx9PlxuICAgICAgICAgICAgPFNsaWRlckJhclxuICAgICAgICAgICAgICByb3c9e0dBTU1BfVxuICAgICAgICAgICAgICB2YWx1ZT17Z2FtbWF9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0U2V0dGluZyhHQU1NQS5pZCwgdil9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvUm93RnJhbWU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIm1vdXNlXCIgbGFiZWw9XCJTRUxFQ1RcIiAvPlxuICAgICAgICA8SGludCBrPVwiRVNDXCIgbGFiZWw9XCJCQUNLXCIgb25DbGljaz17YmFja30gLz5cbiAgICAgIDwvSGludHM+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogV2hlcmUgZWFjaCBzbGljZSBvZiB0aGUgbWFyayBlbmRzIChpdHMgc2hhcmUgb2YgdGhlIHdpZHRoKSwgYW5kIGhvd1xuICogIGJyaWdodCBpdCBpczogYWxsIGJ1dCBibGFjaywgYSBkaW0gZ3JleSwgd2hpdGUuICovXG5jb25zdCBTTElDRVM6IFtudW1iZXIsIHN0cmluZ11bXSA9IFtcbiAgWzAuMzYsIFwiIzBhMGEwYVwiXSxcbiAgWzAuNjgsIFwiIzQwNDA0MFwiXSxcbiAgWzEsIFwiI2ZmZmZmZlwiXSxcbl07XG5cbi8qKiBUaGUgYmxhY2sgZmllbGQgaW4gaXRzIHJlZCBmcmFtZSAoYSBoZWF2eSBiYXIgZG93biB0aGUgcmlnaHQsIGEgdGhpbm5lclxuICogIG9uZSBkb3duIHRoZSBsb3dlciBsZWZ0KSwgdGhlIG1hcmsgaW4gaXQgdW5kZXIgdGhlIGZpbHRlci4gKi9cbmZ1bmN0aW9uIFRlc3RJbWFnZSh7IGdhbW1hIH06IHsgZ2FtbWE6IG51bWJlciB9KSB7XG4gIGNvbnN0IHdpZHRoID0gOTUwO1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoQy5yZWQsIDgsIHVuZGVmaW5lZCwgMSwgXCJ0bFwiKSxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzMjksXG4gICAgICAgICAgdG9wOiAyMDAsXG4gICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgaGVpZ2h0OiA1MzYsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzMzUsXG4gICAgICAgICAgdG9wOiAxMDMsXG4gICAgICAgICAgd2lkdGg6IDEyNTAsXG4gICAgICAgICAgaGVpZ2h0OiA2MzMsXG4gICAgICAgICAgYm9yZGVyOiB7IHRvcDogMiwgbGVmdDogMiwgYm90dG9tOiAzIH0sXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMwMDAwMDBcIixcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgcGFkZGluZzogeyB0b3A6IDE1OCwgcmlnaHQ6IDMwIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IHsgbmFtZTogXCJnYW1tYVwiLCBwYXJhbXM6IHsgdmFsdWU6IGdhbW1hIH0gfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGgsIGhlaWdodDogd2lkdGggLyBXT1JETUFSS19BU1BFQ1QgKyA0MCB9fT5cbiAgICAgICAgICAgIHtTTElDRVMubWFwKChbZW5kLCBjb2xvcl0sIGkpID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBpID09PSAwID8gMCA6IFNMSUNFU1tpIC0gMV1bMF07XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgIGtleT17Y29sb3J9XG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogc3RhcnQgKiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChlbmQgLSBzdGFydCkgKiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93WDogXCJjbGlwXCIsXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93WTogXCJjbGlwXCIsXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxNYXJrXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgICAgICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBsZWZ0OiAtc3RhcnQgKiB3aWR0aCB9fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgey8qIFRoZSBub3RjaCBhdCB0aGUgYm90dG9tIG9mIHRoZSBmaWVsZC4gKi99XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICBsZWZ0OiA2MjcsXG4gICAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDcsXG4gICAgICAgICAgICAgIGhlaWdodDogNTYsXG4gICAgICAgICAgICAgIGJvcmRlcjogeyB0b3A6IDEsIGxlZnQ6IDEsIHJpZ2h0OiAxIH0sXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKEMucmVkLCAyMiwgdW5kZWZpbmVkLCAxLCBcImJyXCIpLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDE1ODMsXG4gICAgICAgICAgdG9wOiAxMDMsXG4gICAgICAgICAgd2lkdGg6IDIyLFxuICAgICAgICAgIGhlaWdodDogNjMzLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIGxlZnQ6IDIsXG4gICAgICAgICAgICB0b3A6IDEzMixcbiAgICAgICAgICAgIGhlaWdodDogMzcwLFxuICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzNhMTAxNFwiLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBUaGUgd29yZG1hcmsgYW5kIGl0cyB5ZWFyIGxpbmUgaW4gb25lIGZsYXQgY29sb3VyLiAqL1xuZnVuY3Rpb24gTWFyayh7XG4gIHdpZHRoLFxuICBjb2xvcixcbiAgc3R5bGUsXG59OiB7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIHN0eWxlOiB7IGxlZnQ6IG51bWJlciB9O1xufSkge1xuICBjb25zdCBoZWlnaHQgPSB3aWR0aCAvIFdPUkRNQVJLX0FTUEVDVDtcbiAgY29uc3QgZGlnaXQgPSB3aWR0aCAqIDAuMDUyO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHQgKyA0MCxcbiAgICAgICAgLi4uc3R5bGUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzdmcgdmlld0JveD17V09SRE1BUktfVklFV0JPWH0gc3R5bGU9e3sgd2lkdGgsIGhlaWdodCB9fT5cbiAgICAgICAgPHBhdGggZD17V09SRE1BUktfUEFUSH0gZmlsbD17Y29sb3J9IC8+XG4gICAgICA8L3N2Zz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogd2lkdGggKiAwLjM2LFxuICAgICAgICAgIHRvcDogaGVpZ2h0ICogMC44LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsXG4gICAgICAgICAgZ2FwOiBkaWdpdCAqIDAuNSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge1tcIjJcIiwgXCIwXCIsIFwiOVwiLCBcIjFcIl0ubWFwKChkLCBpKSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLFxuICAgICAgICAgICAgICBnYXA6IGRpZ2l0ICogMC41LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IGRpZ2l0LFxuICAgICAgICAgICAgICAgIGNvbG9yLFxuICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2R9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICB7aSA8IDMgJiYgKFxuICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogZGlnaXQgKiAxLjYsXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgICAgICAgICBtYXJnaW46IHsgYm90dG9tOiBkaWdpdCAqIDAuMjIgfSxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3IsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHR5cGUgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aERlbGF5LFxuICB3aXRoU2VxdWVuY2UsXG4gIHdpdGhUaW1pbmcsXG4gIHR5cGUgQmV2eVN0eWxlLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgdXNlS2V5cyB9IGZyb20gXCIuLi9ob29rc1wiO1xuaW1wb3J0IHsgRiB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgRklMTCB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuLyoqIFRoZSBtYXJrcycgcmVkIChvbmUgZmxhdCBpbmssIGxpa2UgYSBsaWNlbnNpbmcgc2NyZWVuKS4gKi9cbmNvbnN0IElOSyA9IFwiI2RiNGY0OVwiO1xuXG4vKiogSW4sIGhvbGQsIG91dCAobXMpLiAqL1xuY29uc3QgY2FyZCA9IChkZWxheTogbnVtYmVyLCBob2xkOiBudW1iZXIpID0+XG4gIHdpdGhEZWxheShcbiAgICBkZWxheSxcbiAgICB3aXRoU2VxdWVuY2UoXG4gICAgICB3aXRoVGltaW5nKDEsIHsgZHVyYXRpb246IDMyMCwgZWFzaW5nOiBcImVhc2VPdXRcIiB9KSxcbiAgICAgIHdpdGhEZWxheShob2xkLCB3aXRoVGltaW5nKDAsIHsgZHVyYXRpb246IDI4MCwgZWFzaW5nOiBcImVhc2VJblwiIH0pKSxcbiAgICApLFxuICApO1xuXG4vKiogVGhlIGJvb3Q6IHRoZSBtYXJrcyBvZiB0aGUgc3RhY2sgdGhpcyBydW5zIG9uLCB0aW50ZWQgcmVkLCB0aGVuIGEgbGluZVxuICogIG93bmluZyB1cCB0byB0aGUgaG9tYWdlLiBBYm91dCB0aHJlZSBzZWNvbmRzOyBhbnkga2V5IG9yIGEgY2xpY2sgc2tpcHMuICovXG5leHBvcnQgZnVuY3Rpb24gU3BsYXNoKHsgb25Eb25lIH06IHsgb25Eb25lOiAoKSA9PiB2b2lkIH0pIHtcbiAgY29uc3QgbWFya3MgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgY29uc3Qgbm90aWNlID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIGNvbnN0IGRvbmUgPSB1c2VSZWYob25Eb25lKTtcbiAgZG9uZS5jdXJyZW50ID0gb25Eb25lO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIEEgYmVhdCBvZiBibGFjayBmaXJzdDogdGhlIGFwcCdzIGZpcnN0IGZyYW1lcyBjb21waWxlIHBpcGVsaW5lcy5cbiAgICBtYXJrcy52YWx1ZSA9IGNhcmQoMjUwLCA4MDApO1xuICAgIG5vdGljZS52YWx1ZSA9IGNhcmQoMTcwMCwgOTAwKTtcbiAgICBjb25zdCB0ID0gc2V0VGltZW91dCgoKSA9PiBkb25lLmN1cnJlbnQoKSwgMzMwMCk7XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0KTtcbiAgfSwgW21hcmtzLCBub3RpY2VdKTtcbiAgdXNlS2V5cygoKSA9PiBkb25lLmN1cnJlbnQoKSk7XG5cbiAgY29uc3QgY2VudGVyOiBCZXZ5U3R5bGUgPSB7XG4gICAgLi4uRklMTCxcbiAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICB9O1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHN0eWxlPXt7IC4uLkZJTEwsIGJhY2tncm91bmRDb2xvcjogXCIjMDAwMDAwXCIgfX1cbiAgICAgIG9uQ2xpY2s9eygpID0+IGRvbmUuY3VycmVudCgpfVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmNlbnRlciwgb3BhY2l0eTogeyBhbmltYXRlZDogbWFya3MgfSB9fT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDEyNDAsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgZmxleFdyYXA6IFwid3JhcFwiLFxuICAgICAgICAgICAgcm93R2FwOiA4MCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPE1hcms+XG4gICAgICAgICAgICA8TG9nbyBzcmM9XCJpbWFnZXMvYmV2eS1sb2dvLnBuZ1wiIC8+XG4gICAgICAgICAgICA8V29yZCBzaXplPXs2MH0+YmV2eTwvV29yZD5cbiAgICAgICAgICA8L01hcms+XG4gICAgICAgICAgPE1hcms+XG4gICAgICAgICAgICA8TG9nbyBzcmM9XCJpbWFnZXMvcmVhY3QtbG9nby5wbmdcIiAvPlxuICAgICAgICAgICAgPFdvcmQgc2l6ZT17NTZ9PlJlYWN0PC9Xb3JkPlxuICAgICAgICAgIDwvTWFyaz5cbiAgICAgICAgICA8TWFyaz5cbiAgICAgICAgICAgIDxXb3JkIHNpemU9ezc2fT53Z3B1PC9Xb3JkPlxuICAgICAgICAgIDwvTWFyaz5cbiAgICAgICAgICA8TWFyaz5cbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogNiB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogOTIsXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IDkyLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBJTkssXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxXb3JkIHNpemU9ezU4fSBjb2xvcj1cIiMwMDAwMDBcIj5cbiAgICAgICAgICAgICAgICAgIFY4XG4gICAgICAgICAgICAgICAgPC9Xb3JkPlxuICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICAgIDxXb3JkIHNpemU9ezE5fSBmb250PXtGLnNlbWlib2xkfT5cbiAgICAgICAgICAgICAgICBKQVZBU0NSSVBUIEVOR0lORVxuICAgICAgICAgICAgICA8L1dvcmQ+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPC9NYXJrPlxuICAgICAgICAgIDxNYXJrPlxuICAgICAgICAgICAgPFdvcmQgc2l6ZT17NzJ9PnRhZmZ5PC9Xb3JkPlxuICAgICAgICAgIDwvTWFyaz5cbiAgICAgICAgICA8TWFyaz5cbiAgICAgICAgICAgIDxXb3JkIHNpemU9ezQ2fSBmb250PXtGLm1vbm99PlxuICAgICAgICAgICAgICBkZW5vX2NvcmVcbiAgICAgICAgICAgIDwvV29yZD5cbiAgICAgICAgICA8L01hcms+XG4gICAgICAgICAgPE1hcms+XG4gICAgICAgICAgICA8V29yZCBzaXplPXs1NH0gZm9udD17Ri5zZW1pYm9sZH0+XG4gICAgICAgICAgICAgIGNvc21pYy10ZXh0XG4gICAgICAgICAgICA8L1dvcmQ+XG4gICAgICAgICAgPC9NYXJrPlxuICAgICAgICAgIDxNYXJrPlxuICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fT5cbiAgICAgICAgICAgICAgPFdvcmQgc2l6ZT17MjB9IGZvbnQ9e0Yuc2VtaWJvbGR9PlxuICAgICAgICAgICAgICAgIHBvd2VyZWQgYnlcbiAgICAgICAgICAgICAgPC9Xb3JkPlxuICAgICAgICAgICAgICA8V29yZCBzaXplPXs1NH0+YmV2eS1yZWFjdDwvV29yZD5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8L01hcms+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmNlbnRlciwgb3BhY2l0eTogeyBhbmltYXRlZDogbm90aWNlIH0gfX0+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAxMjgwLFxuICAgICAgICAgICAgZm9udFNpemU6IDI1LFxuICAgICAgICAgICAgY29sb3I6IFwiI2M5NDYzZlwiLFxuICAgICAgICAgICAgbGluZUhlaWdodDogMS40NSxcbiAgICAgICAgICAgIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJDWUJFUlBVTksgMjA5MSBpcyBhIGZhbiBob21hZ2UgdG8gdGhlIG1lbnVzIG9mIEN5YmVycHVuayAyMDc3LCBidWlsdCB3aXRoIGJldnktcmVhY3QuIEl0IGlzIG5vdCBhZmZpbGlhdGVkIHdpdGggb3IgZW5kb3JzZWQgYnkgQ0QgUFJPSkVLVCBSRUQuIFNhYmxlIENpdHksIFRlbmthaSBhbmQgZXZlcnlvbmUgaW4gdGhlbSBhcmUgbWFkZSB1cC4gQmV2eSwgUmVhY3QsIHdncHUsIFY4LCB0YWZmeSwgZGVub19jb3JlIGFuZCBjb3NtaWMtdGV4dCBhcmUgdGhlIHdvcmsgb2YgdGhlaXIgYXV0aG9ycywgdXNlZCB1bmRlciB0aGVpciBvcGVuLXNvdXJjZSBsaWNlbnNlcy5cIlxuICAgICAgICAgIH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogT25lIGNlbGwgb2YgdGhlIGdyaWQuICovXG5mdW5jdGlvbiBNYXJrKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IFwiMjUlXCIsXG4gICAgICAgIGhlaWdodDogMTIwLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiAxNCxcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgcHJvamVjdCdzIGxvZ28sIGZsYXR0ZW5lZCB0byB0aGUgcmVkIGluay4gKi9cbmZ1bmN0aW9uIExvZ28oeyBzcmMgfTogeyBzcmM6IHN0cmluZyB9KSB7XG4gIHJldHVybiA8aW1hZ2Ugc3JjPXtzcmN9IHRpbnQ9e0lOS30gc3R5bGU9e3sgd2lkdGg6IDg0LCBoZWlnaHQ6IDg0IH19IC8+O1xufVxuXG4vKiogQSB3b3JkbWFyayBzZXQgaW4gdHlwZS4gKi9cbmZ1bmN0aW9uIFdvcmQoe1xuICBzaXplLFxuICBmb250ID0gRi5ib2xkLFxuICBjb2xvciA9IElOSyxcbiAgY2hpbGRyZW4sXG59OiB7XG4gIHNpemU6IG51bWJlcjtcbiAgZm9udD86IHN0cmluZztcbiAgY29sb3I/OiBzdHJpbmc7XG4gIGNoaWxkcmVuOiBzdHJpbmc7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPHRleHRcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZvbnRTaXplOiBzaXplLFxuICAgICAgICBmb250RmFtaWx5OiBmb250LFxuICAgICAgICBjb2xvcixcbiAgICAgICAgbGluZUhlaWdodDogMSxcbiAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC90ZXh0PlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIGludGVycG9sYXRlLFxuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aFJlcGVhdCxcbiAgd2l0aFRpbWluZyxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHVzZUtleXMgfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi9zb3VuZFwiO1xuaW1wb3J0IHsgQywgRiwgVCB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgRGF0YU5vaXNlLCBSdWxlIH0gZnJvbSBcIi4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBGSUxMLCBLZXljYXAgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBXb3JkbWFyayB9IGZyb20gXCIuLi91aS9Xb3JkbWFya1wiO1xuXG4vKiogVGhlIHRpdGxlIHNjcmVlbjogdGhlIHdvcmRtYXJrIGxhaWQgb24gdGhlIGRhdGFzY2FwZSBhdCBhbiBhbmdsZSAoYVxuICogIGB0cmFuc2Zvcm0zZGAgb24gaXRzIGxheWVyIOKAlCBzdGlsbCBSZWFjdCwgc3RpbGwgYSBnbGl0Y2ggZmlsdGVyKSwgYW5kXG4gKiAgXCJQUkVTUyBbU1BBQ0VdIFRPIENPTlRJTlVFLlwiIFNwYWNlLCBFbnRlciBvciBhIGNsaWNrIHN0YXJ0cyBCUkVBQ0hJTkfigKYsXG4gKiAgdGhlbiB0aGUgbWFpbiBtZW51LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRpdGxlKHsgb25Db250aW51ZSB9OiB7IG9uQ29udGludWU6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBbYnJlYWNoaW5nLCBzZXRCcmVhY2hpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBnbyA9ICgpID0+IHtcbiAgICBpZiAoYnJlYWNoaW5nKSByZXR1cm47XG4gICAgc2Z4KFwiY29uZmlybVwiKTtcbiAgICBzZXRCcmVhY2hpbmcodHJ1ZSk7XG4gICAgc2V0VGltZW91dChvbkNvbnRpbnVlLCAxNTAwKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gXCJTcGFjZVwiIHx8IGUua2V5ID09PSBcIkVudGVyXCIpIGdvKCk7XG4gIH0pO1xuICAvLyBUaGUgcGxhbmUgdGhlIHdvcmRtYXJrIGxpZXMgb24gc3dheXMgYSBsaXR0bGUsIG5ldmVyIHN0aWxsLlxuICBjb25zdCBzd2F5ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc3dheS52YWx1ZSA9IHdpdGhSZXBlYXQoXG4gICAgICB3aXRoVGltaW5nKDEsIHsgZHVyYXRpb246IDcwMDAsIGVhc2luZzogXCJlYXNlSW5PdXRcIiB9KSxcbiAgICAgIHsgcmV2ZXJzZTogdHJ1ZSB9LFxuICAgICk7XG4gIH0sIFtzd2F5XSk7XG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uIHN0eWxlPXt7IC4uLkZJTEwsIGJhY2tncm91bmRDb2xvcjogQy5jbGVhciB9fSBvbkNsaWNrPXtnb30+XG4gICAgICA8V29yZG1hcmtcbiAgICAgICAgd2lkdGg9ezEyNDB9XG4gICAgICAgIGdsaXRjaD17MC4yMn1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzMDAsXG4gICAgICAgICAgdG9wOiAzMDAsXG4gICAgICAgICAgdHJhbnNmb3JtM2Q6IHtcbiAgICAgICAgICAgIHBlcnNwZWN0aXZlOiAxNTAwLFxuICAgICAgICAgICAgcm90YXRlWDogeyBhbmltYXRlZDogaW50ZXJwb2xhdGUoc3dheSwgWzAsIDFdLCBbMjIsIDI2XSkgfSxcbiAgICAgICAgICAgIHJvdGF0ZVk6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHN3YXksIFswLCAxXSwgWy0yMCwgLTE1XSkgfSxcbiAgICAgICAgICAgIHJvdGF0ZVo6IC03LFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogODQyLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDgsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiAzMjAsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMyB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBjb2xvcjogQy5yZWREaW0gfX0+XG4gICAgICAgICAgICB7XCJNT0RFTCBMSU5FICAgICAgICAxLjIwMDFBXCJ9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBoZWlnaHQ6IDUwLFxuICAgICAgICAgICAgICBib3JkZXI6IDIsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjAsIDYsIDEwLCAwLjU1KVwiLFxuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgZ2FwOiA4LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YnJlYWNoaW5nID8gKFxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogMzAsXG4gICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEsXG4gICAgICAgICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJnbGl0Y2hcIixcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7IGludGVuc2l0eTogMC41LCBmcmVxdWVuY3k6IDAuNiwgdGVhcjogMTAgfSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIEJSRUFDSElORy4uLlxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWVudSwgZm9udEZhbWlseTogRi5zZW1pYm9sZCB9fT5QUkVTUzwvdGV4dD5cbiAgICAgICAgICAgICAgICA8S2V5Y2FwIGs9XCJzcGFjZVwiIC8+XG4gICAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5tZW51LCBmb250RmFtaWx5OiBGLnNlbWlib2xkIH19PlxuICAgICAgICAgICAgICAgICAgVE8gQ09OVElOVUUuXG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAyMzAsXG4gICAgICAgICAgICBoZWlnaHQ6IDIwLFxuICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkRGltLFxuICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiA2IH0sXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPERhdGFOb2lzZSBzZWVkPXszfSBsaW5lcz17Mn0gZ3JvdXBzPXs2fSBzdHlsZT17eyBmb250U2l6ZTogNiB9fSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxSdWxlIHdpZHRoPXsxMTAwfSBjb2xvcj17Qy5yZWREaW19IHN0eWxlPXt7IG1hcmdpbjogeyB0b3A6IDEwIH0gfX0gLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFB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QUFZLENBQUEsS0FBTSxHQUFBO2NBQ2pDb0UsT0FBTztZQUNUOzs7UUFJTGxFLFNBQVN5RyxhQUNSLHlDQUFBN0MsS0FBQ0osUUFBQUE7VUFBS0MsT0FBTztZQUFFLEdBQUdNO1lBQU0yQyxpQkFBaUJDO1VBQVU7Ozs7RUFJM0Q7QUFHQSxXQUFTckUsUUFBQUE7QUFDUCxVQUFNc0UsSUFBSSxvQkFBSUMsS0FBQUE7QUFDZCxVQUFNQyxJQUFJRixFQUFFRyxTQUFRLElBQUssTUFBTTtBQUMvQixVQUFNQyxJQUFJSixFQUFFSyxXQUFVLEVBQUdDLFNBQVEsRUFBR0MsU0FBUyxHQUFHLEdBQUE7QUFDaEQsVUFBTUMsT0FBT1IsRUFBRUcsU0FBUSxJQUFLLEtBQUssT0FBTztBQUN4QyxVQUFNTSxNQUFNVCxFQUFFVSxTQUFRLElBQUssR0FBR0osU0FBUSxFQUFHQyxTQUFTLEdBQUcsR0FBQTtBQUNyRCxVQUFNSSxLQUFLWCxFQUFFWSxRQUFPLEVBQUdOLFNBQVEsRUFBR0MsU0FBUyxHQUFHLEdBQUE7QUFDOUMsV0FBTyxHQUFHRSxFQUFBQSxJQUFNRSxFQUFBQSxRQUFVVCxDQUFBQSxJQUFLRSxDQUFBQSxJQUFLSSxJQUFBQTtFQUN0Qzs7O0FEL1RBSyxpQ0FBTSx5Q0FBQUMsS0FBQ0MsS0FBQUEsQ0FBQUEsQ0FBQUEsQ0FBQUE7IiwKICAibmFtZXMiOiBbImltcG9ydF9iZXZ5X3JlYWN0IiwgImltcG9ydF9yZWFjdCIsICJlbWl0IiwgIm5hbWUiLCAidmFsdWUiLCAicmF3RW1pdCIsICJyZXF1ZXN0IiwgInJhd1JlcXVlc3QiLCAib24iLCAiY2IiLCAicmF3QWRkRXZlbnRMaXN0ZW5lciIsICJyYXdSZW1vdmVFdmVudExpc3RlbmVyIiwgInJlbW92ZUV2ZW50TGlzdGVuZXIiLCAiYmV2eSIsICJhZGRFdmVudExpc3RlbmVyIiwgImFwcCIsICJxdWl0IiwgImRpb3JhbWFzIiwgImRpZmZpY3VsdHkiLCAid29ybGQiLCAiZ2FtZXBhZCIsICJnZXRBbGwiLCAicnVtYmxlIiwgInN0b3BSdW1ibGUiLCAic2V0dGluZ3MiLCAiZ2FtbWEiLCAiZ3JhcGhpY3MiLCAidmlkZW8iLCAic291bmQiLCAicGxheSIsICJ2b2x1bWUiLCAid2luZG93IiwgInNpemUiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAidXNlRXZlbnQiLCAibmFtZSIsICJydW4iLCAibGF0ZXN0IiwgInVzZVJlZiIsICJjdXJyZW50IiwgInVzZUVmZmVjdCIsICJvbiIsICJ2YWx1ZSIsICJ1c2VLZXlzIiwgInJlcGVhdCIsICJlIiwgInVzZURlYnVnIiwgInZlcmIiLCAiYWN0aW9uIiwgImhlYWQiLCAicmVzdCIsICJzcGxpdCIsICJqb2luIiwgInVzZUVudGVyIiwgIngiLCAiZGVsYXkiLCAiZHVyYXRpb24iLCAidCIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ3aXRoRGVsYXkiLCAid2l0aFRpbWluZyIsICJlYXNpbmciLCAib3BhY2l0eSIsICJhbmltYXRlZCIsICJ0cmFuc2Zvcm0iLCAidHJhbnNsYXRlWCIsICJpbnRlcnBvbGF0ZSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAic2Z4IiwgIm5hbWUiLCAiYmV2eSIsICJzb3VuZCIsICJwbGF5IiwgIkMiLCAicmVkIiwgInJlZEhpIiwgInJlZERpbSIsICJyZWREZWVwIiwgInJlZExpbmUiLCAicmVkRmFpbnQiLCAiY3lhbiIsICJjeWFuSGkiLCAiY3lhbkRpbSIsICJjeWFuRGVlcCIsICJjeWFuRmFpbnQiLCAieWVsbG93IiwgIndoaXRlIiwgImluayIsICJiYW5kIiwgInNlY3Rpb24iLCAicm93IiwgImZpZWxkIiwgImJ1dHRvbiIsICJzaGFkZSIsICJjbGVhciIsICJGIiwgInNlbWlib2xkIiwgImJvbGQiLCAibW9ubyIsICJUIiwgIm1lbnUiLCAiZm9udFNpemUiLCAiY29sb3IiLCAibGluZUJyZWFrIiwgInRpdGxlIiwgImxldHRlclNwYWNpbmciLCAiY2FwdGlvbiIsICJsYWJlbCIsICJmb250RmFtaWx5IiwgImJvZHkiLCAibGluZUhlaWdodCIsICJtaWNybyIsICJGUk9NIiwgImJyIiwgInRsIiwgInRyIiwgImJsIiwgInRyYW5zcGFyZW50IiwgImNoYW1mZXIiLCAiZmlsbCIsICJjdXQiLCAibGluZSIsICJ3aWR0aCIsICJjb3JuZXIiLCAiZCIsICJNYXRoIiwgIlNRUlQyIiwgImFuZ2xlIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgInN0b3BzIiwgInBvc2l0aW9uIiwgImlubmVyIiwgImJvcmRlciIsICJib3JkZXJHcmFkaWVudCIsICJTQ0FOTElORVMiLCAic3JjIiwgIm1vZGUiLCAic2NhbGUiLCAiTW91c2VJY29uIiwgImNvbG9yIiwgIkMiLCAiY3lhbiIsICJzaXplIiwgIl9qc3hzIiwgInN2ZyIsICJ2aWV3Qm94IiwgInN0eWxlIiwgIndpZHRoIiwgImhlaWdodCIsICJfanN4IiwgInBhdGgiLCAiZCIsICJmaWxsIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJsaW5lIiwgIngxIiwgInkxIiwgIngyIiwgInkyIiwgIlByb3RvY29sR2x5cGgiLCAicmVjdCIsICJ4IiwgInkiLCAicG9seWxpbmUiLCAicG9pbnRzIiwgIm9wYWNpdHkiLCAiV2FybmluZ0ljb24iLCAicmVkIiwgInBvbHlnb24iLCAiQXJyb3ciLCAiZGlyIiwgIkdMWVBIUyIsICJzcGFjZSIsICJlbnRlciIsICJLZXljYXAiLCAiayIsICJjb2xvciIsICJDIiwgImN5YW4iLCAiZ2x5cGgiLCAiX2pzeCIsICJub2RlIiwgInN0eWxlIiwgIndpZHRoIiwgImhlaWdodCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJzdmciLCAidmlld0JveCIsICJwb2x5bGluZSIsICJwb2ludHMiLCAiZmlsbCIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAid29yZCIsICJsZW5ndGgiLCAibWluV2lkdGgiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInRleHQiLCAiZm9udFNpemUiLCAiZm9udEZhbWlseSIsICJGIiwgImJvbGQiLCAibGluZUJyZWFrIiwgIkhpbnQiLCAibGFiZWwiLCAib25DbGljayIsICJyZWQiLCAiX2pzeHMiLCAiYnV0dG9uIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImJhY2tncm91bmRDb2xvciIsICJjbGVhciIsICJob3ZlclN0eWxlIiwgIm9wYWNpdHkiLCAiTW91c2VJY29uIiwgIkhpbnRzIiwgImNoaWxkcmVuIiwgInBvc2l0aW9uVHlwZSIsICJyaWdodCIsICJib3R0b20iLCAiQ3V0QnV0dG9uIiwgImhvdCIsICJkaXNhYmxlZCIsICJmcmFtZSIsICJ1bmRlZmluZWQiLCAiY2hhbWZlciIsICJUIiwgIm1lbnUiLCAibGV0dGVyU3BhY2luZyIsICJIZWFkZXIiLCAidGl0bGUiLCAiY2FwdGlvbiIsICJpY29uIiwgInN0ZXAiLCAic3RlcHMiLCAibGVmdCIsICJzZWdtZW50IiwgInJ1bGUiLCAidG9wIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgIm1pY3JvIiwgImxpbmVIZWlnaHQiLCAiQXJyYXkiLCAiZnJvbSIsICJfIiwgImkiLCAiRklMTCIsICJpbXBvcnRfcmVhY3QiLCAib3BlbiIsICJtb2RhbE9wZW4iLCAiQ29uZmlybSIsICJ0ZXh0IiwgIm9uQ29uZmlybSIsICJvbkNhbmNlbCIsICJfanN4IiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJmb2N1c1BvbGljeSIsICJob3ZlclN0eWxlIiwgIlBsYXRlIiwgImljb24iLCAiV2FybmluZ0ljb24iLCAic2l6ZSIsICJjb2xvciIsICJDIiwgInJlZCIsICJQTEFURSIsICJUQUIiLCAidXNlRWZmZWN0IiwgImNvbmZpcm0iLCAic2Z4IiwgImNhbmNlbCIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgIl9qc3hzIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImhlaWdodCIsICJUYWIiLCAiY2hhbWZlciIsICJmbGV4R3JvdyIsICJwYWRkaW5nIiwgIkluc2V0IiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJsaW5lSGVpZ2h0IiwgImZsZXhTaHJpbmsiLCAibWFyZ2luIiwgInRvcCIsICJwb3NpdGlvblR5cGUiLCAicmlnaHQiLCAiYm90dG9tIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJhbGlnblNlbGYiLCAiUGxhdGVCdXR0b24iLCAiayIsICJsYWJlbCIsICJvbkNsaWNrIiwgImJvcmRlclJhZGl1cyIsICJsZWZ0IiwgImNoaWxkcmVuIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgInN0b3BzIiwgInBvc2l0aW9uIiwgImJ1dHRvbiIsICJob3Jpem9udGFsIiwgImN5YW4iLCAiS2V5Y2FwIiwgImxpbmVCcmVhayIsICJDUkVESVRTIiwgInRpdGxlIiwgInNwYWNlIiwgInJvbGUiLCAibmFtZXMiLCAiVElUTEUiLCAiUk9XIiwgIkxJTkUiLCAiaGVpZ2h0IiwgImIiLCAiTWF0aCIsICJtYXgiLCAibGVuZ3RoIiwgInNwbGl0IiwgIkgiLCAicmVkdWNlIiwgImgiLCAiU1BMSVQiLCAiTk9STUFMIiwgIkZBU1QiLCAiU1RBUlQiLCAiRU5URVIiLCAiZm9udFNpemUiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImNvbG9yIiwgImxldHRlclNwYWNpbmciLCAibGluZUhlaWdodCIsICJweCIsICJ0ZXh0QWxpZ24iLCAibmFtZSIsICJib2xkIiwgImxpbmVCcmVhayIsICJDcmVkaXRzIiwgIm9uQ2xvc2UiLCAieSIsICJ1c2VTaGFyZWRWYWx1ZSIsICJmYXN0IiwgInNldEZhc3QiLCAidXNlU3RhdGUiLCAiY2xvY2siLCAidXNlUmVmIiwgImZyb20iLCAiYXQiLCAic3BlZWQiLCAicnVuIiwgImN1cnJlbnQiLCAiRGF0ZSIsICJub3ciLCAibXMiLCAidmFsdWUiLCAid2l0aFNlcXVlbmNlIiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAid2l0aFJlcGVhdCIsICJvZmZzZXQiLCAib24iLCAidXNlRWZmZWN0IiwgImNhbmNlbEFuaW1hdGlvbiIsICJjbG9zZSIsICJzZngiLCAiZm9yd2FyZCIsICJrZXkiLCAidXNlS2V5cyIsICJlIiwgIm1vZGFsT3BlbiIsICJ1c2VFdmVudCIsICJ1c2VEZWJ1ZyIsICJhcmciLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgInBvc2l0aW9uIiwgIl9qc3giLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAidHJhbnNmb3JtIiwgInRyYW5zbGF0ZVkiLCAiYW5pbWF0ZWQiLCAibWFwIiwgImkiLCAidGV4dCIsICJnYXAiLCAibWFyZ2luIiwgImpvaW4iLCAicmlnaHQiLCAiYm90dG9tIiwgImFsaWduSXRlbXMiLCAiYnV0dG9uIiwgIm9uQ2xpY2siLCAiaG92ZXJTdHlsZSIsICJvcGFjaXR5IiwgIktleWNhcCIsICJrIiwgIkMiLCAicmVkIiwgImN5YW4iLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIkxJRkVQQVRIUyIsICJpZCIsICJuYW1lIiwgIkRJRkZJQ1VMVElFUyIsICJORVdfQ0hBUkFDVEVSIiwgImhhbmRsZSIsICJkaWZmaWN1bHR5IiwgImxpZmVwYXRoIiwgImJvZHkiLCAidm9pY2UiLCAibG9vayIsICJhdHRyaWJ1dGVzIiwgImludGVsbGlnZW5jZSIsICJyZWZsZXhlcyIsICJ0ZWNoIiwgImNvb2wiLCAiUFJPTE9HVUUiLCAibm9tYWQiLCAicXVlc3QiLCAibG9jYXRpb24iLCAic3RyZWV0a2lkIiwgImNvcnBvIiwgIlNFRURfU0FWRVMiLCAibGV2ZWwiLCAicGxheXRpbWUiLCAiZGF0ZSIsICJjaGFyYWN0ZXIiLCAibWludXRlcyIsICJoIiwgIk1hdGgiLCAiZmxvb3IiLCAibSIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJXb3JsZCIsICJwYXVzZWQiLCAiX2pzeCIsICJwb3J0YWwiLCAidGFyZ2V0IiwgInN0eWxlIiwgIkZJTEwiLCAiY2FjaGUiLCAiZmlsdGVyIiwgIm5hbWUiLCAicGFyYW1zIiwgInJhZGl1cyIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImFycml2aW5nIiwgImFubm91bmNlQXJyaXZhbCIsICJHYW1lSHVkIiwgIm9uUGF1c2UiLCAiZ2FtZSIsICJhbm5vdW5jZSIsICJ1c2VTdGF0ZSIsICJ1c2VFZmZlY3QiLCAid2hlcmUiLCAiUFJPTE9HVUUiLCAic3RyZWV0a2lkIiwgIl9qc3hzIiwgIm5vZGUiLCAiVG9hc3QiLCAibG9jYXRpb24iLCAicXVlc3QiLCAiSGludHMiLCAiSGludCIsICJrIiwgImxhYmVsIiwgIm9uQ2xpY2siLCAic2Z4IiwgInQiLCAidXNlU2hhcmVkVmFsdWUiLCAidmFsdWUiLCAid2l0aERlbGF5IiwgIndpdGhTZXF1ZW5jZSIsICJ3aXRoVGltaW5nIiwgImVhc2luZyIsICJkaXN0cmljdCIsICJwbGFjZSIsICJzcGxpdCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAib3BhY2l0eSIsICJhbmltYXRlZCIsICJ0cmFuc2Zvcm0iLCAidHJhbnNsYXRlWCIsICJpbnRlcnBvbGF0ZSIsICJjaGFtZmVyIiwgIndpZHRoIiwgInBhZGRpbmciLCAicmlnaHQiLCAidmVydGljYWwiLCAiYmFja2dyb3VuZENvbG9yIiwgIkMiLCAiY3lhbiIsICJ0ZXh0IiwgIlQiLCAibWljcm8iLCAiZm9udFNpemUiLCAiY29sb3IiLCAiY3lhbkRpbSIsICJmb250RmFtaWx5IiwgIkYiLCAiYm9sZCIsICJsZXR0ZXJTcGFjaW5nIiwgImxpbmVCcmVhayIsICJ0b1VwcGVyQ2FzZSIsICJhbGlnbkl0ZW1zIiwgImhlaWdodCIsICJ5ZWxsb3ciLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgInJuZyIsICJzZWVkIiwgInMiLCAiSEVYIiwgIm5vaXNlTGluZXMiLCAibGluZXMiLCAiZ3JvdXBzIiwgInIiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiTWF0aCIsICJmbG9vciIsICJqb2luIiwgIkRhdGFOb2lzZSIsICJjb2xvciIsICJDIiwgInJlZERpbSIsICJzdHlsZSIsICJfanN4IiwgInRleHQiLCAiVCIsICJtaWNybyIsICJQcm90b2NvbFN0YW1wIiwgIl9qc3hzIiwgIm5vZGUiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImFsaWduSXRlbXMiLCAibWFwIiwgInciLCAiaSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYmFja2dyb3VuZENvbG9yIiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJib2xkIiwgImxldHRlclNwYWNpbmciLCAicmVkRGVlcCIsICJqdXN0aWZ5Q29udGVudCIsICJwYWRkaW5nIiwgIlJ1bGUiLCAibGFiZWwiLCAiRWRnZVJhaWxzIiwgInJhaWwiLCAic2lkZSIsICJib3R0b20iLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgIl9GcmFnbWVudCIsICJ0cmFuc2Zvcm0iLCAicm90YXRlIiwgIkxlZ2FsRm9vdGVyIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgInN0cm9rZUxpbmVqb2luIiwgInBvbHlsaW5lIiwgInNlbWlib2xkIiwgImxpbmVIZWlnaHQiLCAiaW1wb3J0X3JlYWN0IiwgInNlY3Rpb24iLCAibGFiZWwiLCAia2luZCIsICJzZWxlY3QiLCAiaWQiLCAib3B0aW9ucyIsICJkZWYiLCAidG9nZ2xlIiwgInNsaWRlciIsICJtaW4iLCAibWF4IiwgInN0ZXAiLCAia2V5IiwgIlJFU09MVVRJT05TIiwgIkxBTkdVQUdFUyIsICJQUkVTRVRfTkFNRVMiLCAiQ1VTVE9NIiwgImxlbmd0aCIsICJQUkVTRVRTIiwgInRleHR1cmVzIiwgImFiZXJyYXRpb24iLCAiZm9jdXMiLCAiZmxhcmUiLCAiYmx1ciIsICJHQU1NQSIsICJUQUJTIiwgInJvd3MiLCAidmFsdWUiLCAiZGVmYXVsdHMiLCAib3V0IiwgInJvdyIsICJERUZBVUxUUyIsICJmbGF0TWFwIiwgInQiLCAiZyIsICJnbG9iYWxUaGlzIiwgInN0b3JlIiwgIl9fY3liZXJwdW5rU2V0dGluZ3MiLCAidmFsdWVzIiwgImxpc3RlbmVycyIsICJTZXQiLCAiREVGQVVMVFMiLCAic3Vic2NyaWJlIiwgImxpc3RlbmVyIiwgImFkZCIsICJkZWxldGUiLCAidXNlU2V0dGluZ3MiLCAidXNlU3luY0V4dGVybmFsU3RvcmUiLCAic2V0U2V0dGluZ3MiLCAiZm9yRWFjaCIsICJsIiwgInNldFNldHRpbmciLCAiaWQiLCAidmFsdWUiLCAidXNlTGl2ZVNldHRpbmdzIiwgInYiLCAibiIsICJOdW1iZXIiLCAidXNlUHVzaCIsICJtYXN0ZXIiLCAic2Z4IiwgIm11c2ljIiwgImJldnkiLCAic291bmQiLCAidm9sdW1lIiwgImZvdiIsICJhYmVycmF0aW9uIiwgImZvY3VzIiwgImZsYXJlIiwgImJsdXIiLCAic2V0dGluZ3MiLCAiZ3JhcGhpY3MiLCAiZ2FtbWEiLCAid2lkdGgiLCAiaGVpZ2h0IiwgIlJFU09MVVRJT05TIiwgInNwbGl0IiwgIm1hcCIsICJtb2RlIiwgInZzeW5jIiwgInZpZGVvIiwgInB1c2giLCAib25Nb3VudCIsICJrZXkiLCAiSlNPTiIsICJzdHJpbmdpZnkiLCAic2VudCIsICJ1c2VSZWYiLCAidXNlRWZmZWN0IiwgImN1cnJlbnQiLCAicGFyc2UiLCAiV09SRE1BUktfVklFV0JPWCIsICJXT1JETUFSS19BU1BFQ1QiLCAiV09SRE1BUktfUEFUSCIsICJXb3JkbWFyayIsICJ3aWR0aCIsICJnbGl0Y2giLCAiY2hhbmNlIiwgInN0eWxlIiwgInVzZVNldHRpbmdzIiwgInVpR2xpdGNoIiwgImhlaWdodCIsICJXT1JETUFSS19BU1BFQ1QiLCAiZGlnaXQiLCAiX2pzeHMiLCAibm9kZSIsICJmaWx0ZXIiLCAibmFtZSIsICJwYXJhbXMiLCAiaW50ZW5zaXR5IiwgImZyZXF1ZW5jeSIsICJzZWVkIiwgInVuZGVmaW5lZCIsICJfanN4IiwgInN2ZyIsICJ2aWV3Qm94IiwgIldPUkRNQVJLX1ZJRVdCT1giLCAicGF0aCIsICJkIiwgIldPUkRNQVJLX1BBVEgiLCAiZmlsbCIsICJDIiwgInllbGxvdyIsICJZZWFyIiwgInNpemUiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAibWFwIiwgImkiLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAiZm9udFNpemUiLCAiY29sb3IiLCAiY3lhbkRpbSIsICJsaW5lQnJlYWsiLCAibWFyZ2luIiwgImJvdHRvbSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiTCIsICJXIiwgIlQiLCAiYXQiLCAidSIsICJ2IiwgInoiLCAicGF0Y2giLCAidTAiLCAidTEiLCAidjAiLCAidjEiLCAic2lkZSIsICJJTksiLCAiRGF0YXNoYXJkIiwgIndpZHRoIiwgIl9qc3hzIiwgInN2ZyIsICJ2aWV3Qm94IiwgInN0eWxlIiwgImhlaWdodCIsICJfanN4IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAib3BhY2l0eSIsICJwb2x5bGluZSIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAiTGlmZXBhdGhJY29uIiwgImxpZmVwYXRoIiwgInNpemUiLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAiQyIsICJyZWQiLCAiX0ZyYWdtZW50IiwgInN0cm9rZUxpbmVqb2luIiwgImVsbGlwc2UiLCAicngiLCAicnkiLCAiRFVSQVRJT04iLCAiU0VHTUVOVFMiLCAiVElQUyIsICJub21hZCIsICJzdHJlZXRraWQiLCAiY29ycG8iLCAiTG9hZGluZyIsICJsaWZlcGF0aCIsICJvbkRvbmUiLCAicHJvZ3Jlc3MiLCAidXNlU2hhcmVkVmFsdWUiLCAiZG9uZSIsICJ1c2VSZWYiLCAiY3VycmVudCIsICJ1c2VFZmZlY3QiLCAic2Z4IiwgImFubm91bmNlQXJyaXZhbCIsICJ2YWx1ZSIsICJ3aXRoVGltaW5nIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJ0IiwgInNldFRpbWVvdXQiLCAiY2xlYXJUaW1lb3V0IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgIldvcmRtYXJrIiwgIndpZHRoIiwgImdsaXRjaCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAidHJhbnNmb3JtM2QiLCAicGVyc3BlY3RpdmUiLCAicm90YXRlWCIsICJyb3RhdGVZIiwgInJvdGF0ZVoiLCAicmlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJ0ZXh0IiwgIlQiLCAibWljcm8iLCAiY29sb3IiLCAiQyIsICJyZWREaW0iLCAiaGVpZ2h0IiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJyZWQiLCAiYmFja2dyb3VuZENvbG9yIiwgImp1c3RpZnlDb250ZW50IiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJjeWFuIiwgImxldHRlclNwYWNpbmciLCAibGluZUJyZWFrIiwgImNhY2hlIiwgImZpbHRlciIsICJuYW1lIiwgInBhcmFtcyIsICJpbnRlbnNpdHkiLCAiZnJlcXVlbmN5IiwgInRlYXIiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiXyIsICJpIiwgIm9wYWNpdHkiLCAiYW5pbWF0ZWQiLCAiaW50ZXJwb2xhdGUiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgIkxpZmVwYXRoSWNvbiIsICJzaXplIiwgImxpbmVIZWlnaHQiLCAiZmxleFNocmluayIsICJSdWxlIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJNYWluTWVudSIsICJlbnRyaWVzIiwgIm9uUGljayIsICJvbkJhY2siLCAidmVyc2lvbiIsICJzZWxlY3RlZCIsICJzZXRTZWxlY3RlZCIsICJ1c2VTdGF0ZSIsICJzZWxlY3QiLCAiaSIsICJzZngiLCAidXNlS2V5cyIsICJlIiwgIm1vZGFsT3BlbiIsICJrZXkiLCAibGVuZ3RoIiwgImlkIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgIkJhbmQiLCAiRGF0YU5vaXNlIiwgInNlZWQiLCAibGluZXMiLCAiZ3JvdXBzIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgIkMiLCAicmVkRGltIiwgImp1c3RpZnlDb250ZW50IiwgInBhZGRpbmciLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImNvbG9yIiwgIldvcmRtYXJrIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgIm1hcCIsICJlbnRyeSIsICJNZW51SXRlbSIsICJsYWJlbCIsICJvblNlbGVjdCIsICJvbkNsaWNrIiwgIlJ1bGUiLCAiZm9udFNpemUiLCAiVG9wUmlnaHQiLCAiTWVzc2FnZXMiLCAiSGludHMiLCAiSGludCIsICJrIiwgImJvdHRvbSIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJwb3NpdGlvbiIsICJiYWNrZ3JvdW5kSW1hZ2UiLCAiU0NBTkxJTkVTIiwgInJpZ2h0IiwgImdsaXRjaGVzIiwgInVzZVNldHRpbmdzIiwgInVpR2xpdGNoIiwgImJ1cnN0IiwgInVzZVNoYXJlZFZhbHVlIiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ3aXRoU2VxdWVuY2UiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAiYnV0dG9uIiwgIm9uUG9pbnRlckVudGVyIiwgImFsaWduSXRlbXMiLCAiY2hhbWZlciIsICJjeWFuSGkiLCAiY2xlYXIiLCAiZmlsdGVyIiwgIm5hbWUiLCAicGFyYW1zIiwgImludGVuc2l0eSIsICJhbmltYXRlZCIsICJzcGxpdCIsICJ0ZWFyIiwgInVuZGVmaW5lZCIsICJtZW51IiwgImN5YW4iLCAicmVkIiwgIlByb3RvY29sR2x5cGgiLCAiX0ZyYWdtZW50IiwgImhvcml6b250YWwiLCAiV2FybmluZ0ljb24iLCAic2l6ZSIsICJLZXljYXAiLCAiZmxleEdyb3ciLCAiYmFja2dyb3VuZENvbG9yIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiRElGRklDVUxUWV9URVhUIiwgImVhc3kiLCAibm9ybWFsIiwgImhhcmQiLCAidmVyeWhhcmQiLCAiTElGRVBBVEhfVEVYVCIsICJub21hZCIsICJzdHJlZXRraWQiLCAiY29ycG8iLCAiU0tJTl9UT05FUyIsICJIQUlSX0NPTE9SUyIsICJFWUVfQ09MT1JTIiwgIlZPSUNFIiwgImxhYmVsIiwgIm5hbWVzIiwgIkxPT0tfT1BUSU9OUyIsICJpZCIsICJjb3VudCIsICJsZW5ndGgiLCAic3dhdGNoZXMiLCAibG9vayIsICJjIiwgIlBSRVNFVFMiLCAic2tpblRvbmUiLCAic2tpblR5cGUiLCAiaGFpcnN0eWxlIiwgImhhaXJDb2xvciIsICJleWVzIiwgImV5ZWJyb3dzIiwgImphdyIsICJjeWJlcndhcmUiLCAic2NhcnMiLCAidGF0dG9vcyIsICJwaWVyY2luZ3MiLCAibWFrZXVwIiwgIkFUVFJfTUlOIiwgIkFUVFJfTUFYIiwgIkFUVFJfUE9JTlRTIiwgIkFUVFJJQlVURVMiLCAibmFtZSIsICJzaG9ydCIsICJ0ZXh0IiwgImVmZmVjdHMiLCAiaGFzaCIsICJzIiwgImgiLCAiaSIsICJjaGFyQ29kZUF0IiwgIk1hdGgiLCAiaW11bCIsICJyZXNpZGVudElkIiwgImhhbmRsZSIsICJkIiwgInRvU3RyaW5nIiwgInBhZFN0YXJ0IiwgInRhZyIsICJyZXBsYWNlIiwgInNsaWNlIiwgInR3byIsICJoYW5kbGVPZiIsICJ0cmltIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJXaGVlbEljb24iLCAiY29sb3IiLCAiQyIsICJjeWFuIiwgIl9qc3hzIiwgInN2ZyIsICJ2aWV3Qm94IiwgInN0eWxlIiwgIndpZHRoIiwgImhlaWdodCIsICJfanN4IiwgInBhdGgiLCAiZCIsICJmaWxsIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJyZWN0IiwgIngiLCAieSIsICJwb2x5Z29uIiwgInBvaW50cyIsICJTdGVwSWNvbiIsICJraW5kIiwgInMiLCAidGhpbiIsICJfRnJhZ21lbnQiLCAicG9seWxpbmUiLCAibGluZSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJyeCIsICJvcGFjaXR5IiwgIkF0dHJpYnV0ZUljb24iLCAiaWQiLCAicmVkIiwgIkxpZmVwYXRoSWNvbiIsICJHcmlkSWNvbiIsICJmbGF0TWFwIiwgIm1hcCIsICJjIiwgIkhPVCIsICJCRyIsICJDaHJvbWUiLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgIl9qc3giLCAiUHJvdG9jb2xTdGFtcCIsICJMZWdhbEZvb3RlciIsICJub2RlIiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgImJvdHRvbSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgInRleHQiLCAiVCIsICJtaWNybyIsICJmb250U2l6ZSIsICJzdmciLCAidmlld0JveCIsICJ3aWR0aCIsICJoZWlnaHQiLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJDIiwgInJlZCIsICJjb3JuZXJNYXNrIiwgImN1dCIsICJsaW5lIiwgImNvbG9yIiwgImQiLCAiTWF0aCIsICJTUVJUMiIsICJjbGVhciIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJwb3NpdGlvbiIsICJhYnMiLCAicyIsICJIb3RGcmFtZSIsICJiYXIiLCAic3RlcCIsICJpbm5lciIsICJtYXgiLCAidG9wIiwgInJpZ2h0IiwgImZpbHRlciIsICJuYW1lIiwgInBhcmFtcyIsICJvZmZzZXRYIiwgIm9mZnNldFkiLCAic3ByZWFkIiwgImJhY2tncm91bmRDb2xvciIsICJjaGFtZmVyIiwgInVuZGVmaW5lZCIsICJDb2xkRnJhbWUiLCAidGljayIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiQmFyY29kZSIsICJzZWVkIiwgInIiLCAicm5nIiwgIngiLCAidyIsICJmbG9vciIsICJwYXRoIiwgIkxldmVsQmFkZ2UiLCAibGFiZWwiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgImp1c3RpZnlDb250ZW50IiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJsaW5lQnJlYWsiLCAiTmF2QnV0dG9ucyIsICJvbkJhY2siLCAib25OZXh0IiwgIm5leHQiLCAiTmF2QnV0dG9uIiwgImsiLCAiY29ybmVyIiwgIm9uQ2xpY2siLCAiYnV0dG9uIiwgImhvdmVyU3R5bGUiLCAiS2V5Y2FwIiwgIm1lbnUiLCAiSWNvbkhpbnQiLCAiaWNvbiIsICJDWCIsICJhdCIsICJhIiwgInMiLCAibWFwIiwgInYiLCAiaSIsICJTQ0FSIiwgIk1FVEFMIiwgIk1hcmtzIiwgImhlYWQiLCAiaW5rIiwgIm5vc2VZIiwgImVhciIsICJtb3V0aCIsICJtb3V0aFciLCAic21pbGUiLCAibGluZSIsICJjb2xvciIsICJ3IiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgIm1ha2V1cCIsICJ0YXR0b28iLCAic2NhcnMiLCAiY3liZXIiLCAibWV0YWwiLCAibGlwcyIsICJjaHJvbWUiLCAibiIsICJwaWVyY2VkIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgInBvbHlnb24iLCAicG9pbnRzIiwgInBvbHlsaW5lIiwgIkMiLCAiY3lhbiIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJ4IiwgImZpbHRlciIsICJ5IiwgImZsYXRNYXAiLCAicmVjdCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZCIsICJtaXgiLCAiYSIsICJiIiwgInQiLCAicCIsICJoIiwgImkiLCAicGFyc2VJbnQiLCAic2xpY2UiLCAiYyIsICJtYXAiLCAiTWF0aCIsICJyb3VuZCIsICJ2IiwgInRvU3RyaW5nIiwgInBhZFN0YXJ0IiwgImpvaW4iLCAicHRzIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIl8iLCAiZmxhdCIsICJzIiwgImF0IiwgIkhFQUQiLCAiU0hPVUxERVJTIiwgIkpBVyIsICJDSElOIiwgIkJST1dTIiwgIk5PU0VTIiwgIk1PVVRIUyIsICJFQVJTIiwgIm1pcnJvciIsICJoYWxmIiwgInJldmVyc2UiLCAiY2hvcmQiLCAieSIsICJ4MCIsICJ5MCIsICJ4MSIsICJ5MSIsICJjcm93biIsICJoZWFkIiwgInRoaWNrIiwgImhhaXJsaW5lIiwgIm91dCIsICJmaWx0ZXIiLCAieCIsICJkeSIsICJsIiwgImh5cG90IiwgImVkZ2UiLCAiYnJvdyIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJDWCIsICJjb3MiLCAiUEkiLCAic2luIiwgImJvdGgiLCAiaGFpciIsICJzdHlsZSIsICJiYWNrIiwgImZyb250IiwgIkdSSUQiLCAiZCIsICJQb3J0cmFpdCIsICJsb29rIiwgImJvZHkiLCAid2lkdGgiLCAiaWQiLCAic2tpbiIsICJTS0lOX1RPTkVTIiwgImhhaXJDb2xvciIsICJIQUlSX0NPTE9SUyIsICJoYWlyTGluZSIsICJsaW5lIiwgImNvbnRvdXIiLCAiamF3IiwgImsiLCAibWluIiwgIm1heCIsICJzaG91bGRlcnMiLCAicmFpc2UiLCAiYnJvd1ciLCAiYXJjaCIsICJub3NlWSIsICJub3NlVyIsICJtb3V0aFciLCAic21pbGUiLCAiZWFyIiwgImZyZWNrbGVzIiwgInJuZyIsICJzdHJva2UiLCAiY29sb3IiLCAidyIsICJmaWxsIiwgInN0cm9rZVdpZHRoIiwgIl9qc3hzIiwgInN2ZyIsICJ2aWV3Qm94IiwgImhlaWdodCIsICJfanN4IiwgInBhdGgiLCAiQyIsICJjeWFuIiwgIm9wYWNpdHkiLCAicG9seWdvbiIsICJwb2ludHMiLCAicG9seWxpbmUiLCAieDIiLCAieTIiLCAiZiIsICJmbGF0TWFwIiwgImciLCAiRVlFX0NPTE9SUyIsICJNYXJrcyIsICJpbmsiLCAibW91dGgiLCAicmVjdCIsICJSVUxFIiwgIlJhZGFyIiwgImF0dHJpYnV0ZXMiLCAiUiIsICJhdCIsICJpIiwgInIiLCAiYSIsICJNYXRoIiwgIlBJIiwgImNvcyIsICJzaW4iLCAicmluZyIsICJmbGF0TWFwIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgInRleHQiLCAic3R5bGUiLCAiVCIsICJtaWNybyIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAiZm9udFNpemUiLCAibGV0dGVyU3BhY2luZyIsICJzdmciLCAidmlld0JveCIsICJ3aWR0aCIsICJoZWlnaHQiLCAibWFwIiwgImwiLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAibGluZSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJBVFRSSUJVVEVTIiwgImlkIiwgIkMiLCAicmVkIiwgIm9wYWNpdHkiLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgImN5YW4iLCAieCIsICJ5IiwgImNvbG9yIiwgImN5YW5EaW0iLCAic2hvcnQiLCAibm9kZSIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJhbGlnbkl0ZW1zIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIkFUVFJfTUFYIiwgIl8iLCAiYmFja2dyb3VuZENvbG9yIiwgImZvbnRGYW1pbHkiLCAiRiIsICJib2xkIiwgImxpbmVCcmVhayIsICJ0b1N0cmluZyIsICJXIiwgIkgiLCAiSWRDYXJkIiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJvbkVkaXRpbmciLCAic3R5bGUiLCAiZmllbGQiLCAic2V0RmllbGQiLCAidXNlU3RhdGUiLCAiZWRpdGluZyIsICJzZXRFZGl0aW5nIiwgImVkaXQiLCAib24iLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJzY2FuIiwgInVzZVNoYXJlZFZhbHVlIiwgImxvb2tLZXkiLCAiSlNPTiIsICJzdHJpbmdpZnkiLCAibG9vayIsICJib2R5IiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ3aXRoU2VxdWVuY2UiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAibGlmZXBhdGgiLCAiTElGRVBBVEhTIiwgImZpbmQiLCAibCIsICJpZCIsICJkaWZmaWN1bHR5IiwgIkRJRkZJQ1VMVElFUyIsICJkIiwgIl9qc3hzIiwgIm5vZGUiLCAiY2hhbWZlciIsICJ3aWR0aCIsICJoZWlnaHQiLCAiX2pzeCIsICJIZWFkIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYmFja2dyb3VuZENvbG9yIiwgIm92ZXJmbG93WCIsICJvdmVyZmxvd1kiLCAiUG9ydHJhaXQiLCAicmlnaHQiLCAiQyIsICJjeWFuIiwgIm9wYWNpdHkiLCAiYW5pbWF0ZWQiLCAiaW50ZXJwb2xhdGUiLCAidHJhbnNmb3JtIiwgInRyYW5zbGF0ZVkiLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImNvbG9yIiwgImN5YW5EaW0iLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAianVzdGlmeUNvbnRlbnQiLCAiTGFiZWwiLCAicmVkRGltIiwgImVkaXRhYmxlVGV4dCIsICJoYW5kbGUiLCAibWF4TGVuZ3RoIiwgInYiLCAidG9VcHBlckNhc2UiLCAib25Gb2N1cyIsICJvbkJsdXIiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgImJvdHRvbSIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkYiLCAiYm9sZCIsICJsZXR0ZXJTcGFjaW5nIiwgImN1cnNvciIsICJmb2N1c1N0eWxlIiwgIkZpZWxkIiwgImxhYmVsIiwgIm1vbm8iLCAid2hpdGUiLCAibGluZUJyZWFrIiwgInJlc2lkZW50SWQiLCAiYWxpZ25JdGVtcyIsICJMaWZlcGF0aEljb24iLCAiVmFsdWUiLCAibmFtZSIsICJWT0lDRSIsICJuYW1lcyIsICJ2b2ljZSIsICJSVUxFIiwgIlJhZGFyIiwgImF0dHJpYnV0ZXMiLCAiQmFyY29kZSIsICJzZWVkIiwgImhhc2giLCAicmVkIiwgInJlcGxhY2UiLCAidG9TdHJpbmciLCAiX0ZyYWdtZW50IiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgInJlY3QiLCAieCIsICJ5IiwgInJ4IiwgInBhdGgiLCAiY2hpbGRyZW4iLCAic2VtaWJvbGQiLCAiU3dhdGNoZXMiLCAib3B0aW9uIiwgInZhbHVlIiwgIm9uUGljayIsICJvbkNsb3NlIiwgImVudGVyIiwgInVzZUVudGVyIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJub2RlIiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJyaWdodCIsICJ0b3AiLCAid2lkdGgiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAiYWxpZ25JdGVtcyIsICJwYWRkaW5nIiwgImxlZnQiLCAiX2pzeCIsICJEYXRhTm9pc2UiLCAic2VlZCIsICJsaW5lcyIsICJncm91cHMiLCAiZm9udFNpemUiLCAidGV4dCIsICJUIiwgIm1lbnUiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImxhYmVsIiwgImZsZXhHcm93IiwgImJvbGQiLCAiY29sb3IiLCAiQyIsICJyZWQiLCAibGluZUJyZWFrIiwgImNoYW1mZXIiLCAiYm90dG9tIiwgImZsZXhXcmFwIiwgInN3YXRjaGVzIiwgIm1hcCIsICJpIiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJzZngiLCAib25DbGljayIsICJoZWlnaHQiLCAianVzdGlmeUNvbnRlbnQiLCAiaG92ZXJTdHlsZSIsICJjeWFuIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJiYWNrZ3JvdW5kQ29sb3IiLCAibWljcm8iLCAicmVkRGltIiwgImlkIiwgInRvVXBwZXJDYXNlIiwgInRvU3RyaW5nIiwgInBhZFN0YXJ0IiwgIktleWNhcCIsICJrIiwgIlBMQVRFIiwgIlNURVAiLCAiRURHRSIsICJBcHBlYXJhbmNlIiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJuZXh0IiwgImJhY2siLCAiZ3JpZCIsICJzZXRHcmlkIiwgInVzZVN0YXRlIiwgImVkaXRpbmciLCAic2V0RWRpdGluZyIsICJzY3JvbGwiLCAic2V0U2Nyb2xsIiwgInNldExvb2siLCAiaWQiLCAidmFsdWUiLCAibG9vayIsICJzdGVwIiwgImNvdW50IiwgImJ5IiwgInNmeCIsICJvcHRpb24iLCAiTE9PS19PUFRJT05TIiwgImZpbmQiLCAibyIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgImNvZGUiLCAidXNlRGVidWciLCAiYXJnIiwgIm4iLCAic3BsaXQiLCAiTnVtYmVyIiwgInB4IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgIkNocm9tZSIsICJIZWFkZXIiLCAidGl0bGUiLCAiY2FwdGlvbiIsICJpY29uIiwgIlN0ZXBJY29uIiwgImtpbmQiLCAiUHJlc2V0cyIsICJJZENhcmQiLCAib25FZGl0aW5nIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJTd2F0Y2hlcyIsICJvblBpY2siLCAiaSIsICJvbkNsb3NlIiwgInNjcm9sbFRvcCIsICJkaXNwbGF5IiwgInJpZ2h0IiwgIndpZHRoIiwgImhlaWdodCIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJvdmVyZmxvd1kiLCAic2Nyb2xsYmFyIiwgInRyYWNrIiwgImJhY2tncm91bmRDb2xvciIsICJ0aHVtYiIsICJob3ZlciIsICJDIiwgInJlZEhpIiwgInRoaWNrbmVzcyIsICJtaW5UaHVtYkxlbmd0aCIsICJQcm9ub3VucyIsICJuYW1lIiwgImhhbmRsZU9mIiwgInZvaWNlIiwgIlJvdyIsICJsYWJlbCIsICJWT0lDRSIsICJuYW1lcyIsICJvblN0ZXAiLCAibWFwIiwgInR3byIsICJzd2F0Y2giLCAic3dhdGNoZXMiLCAib25HcmlkIiwgInVuZGVmaW5lZCIsICJOYXZCdXR0b25zIiwgIm9uQmFjayIsICJvbk5leHQiLCAiSGludHMiLCAiSGludCIsICJrIiwgIkljb25IaW50IiwgIldoZWVsSWNvbiIsICJhbGlnbkl0ZW1zIiwgIldhcm5pbmdJY29uIiwgInNpemUiLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImZvbnRTaXplIiwgImNvbG9yIiwgInJlZCIsICJsaW5lQnJlYWsiLCAibGluZUhlaWdodCIsICJjaGFtZmVyIiwgImp1c3RpZnlDb250ZW50IiwgInBhZGRpbmciLCAiaG92ZXJTdHlsZSIsICJvblBvaW50ZXJFbnRlciIsICJTdGVwQnV0dG9uIiwgInNpZGUiLCAib25DbGljayIsICJBcnJvdyIsICJkaXIiLCAiR3JpZEljb24iLCAiY2hpbGRyZW4iLCAiY29ybmVyIiwgImJ1dHRvbiIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiZmxleEdyb3ciLCAiZmxleEJhc2lzIiwgIm1lbnUiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgIm1hcmdpbiIsICJib3R0b20iLCAiUFJFU0VUUyIsICJwIiwgIm9uIiwgIk9iamVjdCIsICJlbnRyaWVzIiwgImV2ZXJ5IiwgInYiLCAiUG9ydHJhaXQiLCAiYm9keSIsICJib2xkIiwgImltcG9ydF9yZWFjdCIsICJEQVJLIiwgIkVER0UiLCAiTElUIiwgIkF0dHJpYnV0ZXMiLCAiY2hhcmFjdGVyIiwgIm9uQ2hhbmdlIiwgIm5leHQiLCAiYmFjayIsICJob3QiLCAic2V0SG90IiwgInVzZVN0YXRlIiwgImVkaXRpbmciLCAic2V0RWRpdGluZyIsICJ2YWx1ZXMiLCAiYXR0cmlidXRlcyIsICJzcGVudCIsICJBVFRSSUJVVEVTIiwgInJlZHVjZSIsICJuIiwgImEiLCAiaWQiLCAiQVRUUl9NSU4iLCAicG9pbnRzIiwgIkFUVFJfUE9JTlRTIiwgImNoYW5nZSIsICJieSIsICJ2IiwgIkFUVFJfTUFYIiwgInNmeCIsICJob3ZlciIsICJpIiwgInVzZUtleXMiLCAiZSIsICJyZXBlYXQiLCAia2V5IiwgImNvZGUiLCAiTWF0aCIsICJtYXgiLCAibWluIiwgImxlbmd0aCIsICJ1c2VEZWJ1ZyIsICJOdW1iZXIiLCAiYXJnIiwgInNwbGl0IiwgIm1hcCIsICJPYmplY3QiLCAiZnJvbUVudHJpZXMiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgIl9qc3giLCAiQ2hyb21lIiwgIkhlYWRlciIsICJ0aXRsZSIsICJjYXB0aW9uIiwgImljb24iLCAiU3RlcEljb24iLCAia2luZCIsICJzdGVwIiwgIkV4cGxhaW5lciIsICJuYW1lIiwgInRleHQiLCAiZWZmZWN0cyIsICJ2YWx1ZSIsICJJZENhcmQiLCAib25FZGl0aW5nIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJUIiwgIm1lbnUiLCAicmlnaHQiLCAiZm9udFNpemUiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImJ1dHRvbiIsICJvbkNsaWNrIiwgIk5FV19DSEFSQUNURVIiLCAiY2hhbWZlciIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJob3ZlclN0eWxlIiwgIkMiLCAicmVkIiwgImNvbG9yIiwgImxpbmVCcmVhayIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAidG9TdHJpbmciLCAiYXR0ciIsICJBdHRyaWJ1dGVSb3ciLCAibGl0IiwgImNhbkFkZCIsICJvbkVudGVyIiwgIk5hdkJ1dHRvbnMiLCAib25CYWNrIiwgIm9uTmV4dCIsICJIaW50cyIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJLZXljYXAiLCAiayIsICJIaW50IiwgImxhYmVsIiwgImZpbGwiLCAiZWRnZSIsICJib3giLCAiY29ybmVyIiwgImJhY2tncm91bmRDb2xvciIsICJiYWRnZSIsICJvblBvaW50ZXJFbnRlciIsICJBdHRyaWJ1dGVJY29uIiwgIkxldmVsQmFkZ2UiLCAiU2lnbiIsICJwbHVzIiwgIm9mZiIsICJmbGV4R3JvdyIsICJjeWFuIiwgInN2ZyIsICJ2aWV3Qm94IiwgIl9GcmFnbWVudCIsICJyZWN0IiwgIngiLCAieSIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAibGluZSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJtaW5IZWlnaHQiLCAibWFyZ2luIiwgImJvdHRvbSIsICJwYWRkaW5nIiwgImxpbmVIZWlnaHQiLCAiam9pbiIsICJib2xkIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfanN4X3J1bnRpbWUiLCAiQlVJTERTIiwgIkRFVEFJTFMiLCAiSk9JTlRTIiwgIkNYIiwgInNpZGUiLCAiYSIsICJzIiwgIm1hcCIsICJ2IiwgImkiLCAibWlycm9yIiwgImhhbGYiLCAiYmFjayIsICJsZW5ndGgiLCAicHVzaCIsICJGaWd1cmUiLCAiYnVpbGQiLCAiY29sb3IiLCAiYWNjZW50IiwgImhlaWdodCIsICJvdXRsaW5lIiwgImpvaW50cyIsICJfanN4cyIsICJzdmciLCAidmlld0JveCIsICJzdHlsZSIsICJ3aWR0aCIsICJfanN4IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAib3BhY2l0eSIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAic3Ryb2tlTGluZWpvaW4iLCAiZmxhdE1hcCIsICJsaW5lIiwgInBvbHlsaW5lIiwgIkFycmF5IiwgImZyb20iLCAiXyIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJ5IiwgIngxIiwgInkxIiwgIngyIiwgInkyIiwgIkNBUkQiLCAid2lkdGgiLCAiaGVpZ2h0IiwgInRvcCIsICJsZWZ0cyIsICJnZW5vbWUiLCAic2VlZCIsICJyIiwgInJuZyIsICJiYXNlIiwgIk1hdGgiLCAiZmxvb3IiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiam9pbiIsICJHRU5PTUUiLCAiQm9keVR5cGUiLCAiY2hhcmFjdGVyIiwgIm9uQ2hhbmdlIiwgIm5leHQiLCAiYmFjayIsICJob3QiLCAic2V0SG90IiwgInVzZVN0YXRlIiwgImJvZHkiLCAiaG92ZXIiLCAiaSIsICJzZngiLCAicGljayIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgImNvZGUiLCAidXNlRGVidWciLCAibiIsICJOdW1iZXIiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgIl9qc3giLCAiQ2hyb21lIiwgIkhlYWRlciIsICJ0aXRsZSIsICJjYXB0aW9uIiwgImhhbmRsZU9mIiwgImljb24iLCAiU3RlcEljb24iLCAia2luZCIsICJzdGVwIiwgIm1hcCIsICJsZWZ0IiwgImxpdCIsICJidXR0b24iLCAib25Qb2ludGVyRW50ZXIiLCAib25DbGljayIsICJwb3NpdGlvblR5cGUiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAiY29sb3IiLCAidW5kZWZpbmVkIiwgInRleHQiLCAiZm9udFNpemUiLCAiZm9udEZhbWlseSIsICJGIiwgIm1vbm8iLCAibGluZUhlaWdodCIsICJsZXR0ZXJTcGFjaW5nIiwgImxpbmVCcmVhayIsICJUIiwgIm1pY3JvIiwgImFsaWduSXRlbXMiLCAicGFkZGluZyIsICJGaWd1cmUiLCAiYnVpbGQiLCAiQyIsICJjeWFuIiwgImFjY2VudCIsICJNYXJrIiwgIkhvdEZyYW1lIiwgImJhciIsICJjdXQiLCAiQ29sZEZyYW1lIiwgImxpbmUiLCAiSGludHMiLCAiSGludCIsICJrIiwgImxhYmVsIiwgInJlZCIsICJib3R0b20iLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAic3ZnIiwgInZpZXdCb3giLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJib2xkIiwgImltcG9ydF9yZWFjdCIsICJEaWZmaWN1bHR5IiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJuZXh0IiwgImJhY2siLCAiaG90IiwgInNldEhvdCIsICJ1c2VTdGF0ZSIsICJNYXRoIiwgIm1heCIsICJESUZGSUNVTFRJRVMiLCAiZmluZEluZGV4IiwgImQiLCAiaWQiLCAiZGlmZmljdWx0eSIsICJ1c2VFZmZlY3QiLCAiYmV2eSIsICJkaW9yYW1hcyIsICJsZXZlbCIsICJob3ZlciIsICJpIiwgInNmeCIsICJwaWNrIiwgInVzZUtleXMiLCAiZSIsICJrZXkiLCAibWluIiwgImxlbmd0aCIsICJjb2RlIiwgInVzZURlYnVnIiwgIm4iLCAiTnVtYmVyIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgIkNlbnRlcmVkSGVhZGVyIiwgInRpdGxlIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYmFja2dyb3VuZENvbG9yIiwgInBvcnRhbCIsICJ0YXJnZXQiLCAiY2FjaGUiLCAiSG90RnJhbWUiLCAiYmFyIiwgImN1dCIsICJzdGVwIiwgInRleHQiLCAiVCIsICJib2R5IiwgImZvbnRTaXplIiwgImxpbmVIZWlnaHQiLCAiRElGRklDVUxUWV9URVhUIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgIm1hcCIsICJMZXZlbEJ1dHRvbiIsICJsYWJlbCIsICJuYW1lIiwgInNlZWQiLCAib25FbnRlciIsICJvbkNsaWNrIiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJQTEFURSIsICJsaW5lIiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgInN2ZyIsICJ2aWV3Qm94IiwgImZpbHRlciIsICJwYXJhbXMiLCAiY29sb3IiLCAib2Zmc2V0WCIsICJvZmZzZXRZIiwgInNwcmVhZCIsICJ1bmRlZmluZWQiLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAicmVjdCIsICJ4IiwgInkiLCAiQyIsICJjeWFuIiwgImxldHRlclNwYWNpbmciLCAibGluZUJyZWFrIiwgIkJhcmNvZGUiLCAidCIsICJtaWNybyIsICJyZWQiLCAicnVsZSIsICJmYWludCIsICJyaWdodCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJyZWRMaW5lIiwgIlN0ZXBJY29uIiwgImtpbmQiLCAiaW1wb3J0X3JlYWN0IiwgIkNBUkQiLCAid2lkdGgiLCAiaGVpZ2h0IiwgInBpdGNoIiwgImxlZnQiLCAidG9wIiwgIkxpZmVwYXRoIiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJuZXh0IiwgImJhY2siLCAiaG90IiwgInNldEhvdCIsICJ1c2VTdGF0ZSIsICJNYXRoIiwgIm1heCIsICJMSUZFUEFUSFMiLCAiZmluZEluZGV4IiwgImwiLCAiaWQiLCAibGlmZXBhdGgiLCAiaG92ZXIiLCAiaSIsICJzZngiLCAicGljayIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgIm1pbiIsICJsZW5ndGgiLCAiY29kZSIsICJ1c2VEZWJ1ZyIsICJuIiwgIk51bWJlciIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJDaHJvbWUiLCAiSGVhZGVyIiwgInRpdGxlIiwgImNhcHRpb24iLCAiaWNvbiIsICJTdGVwSWNvbiIsICJraW5kIiwgInN0ZXAiLCAibWFwIiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJvbkNsaWNrIiwgInBvc2l0aW9uVHlwZSIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImNvbG9yIiwgIkMiLCAicmVkIiwgImxpbmVCcmVhayIsICJuYW1lIiwgImJhY2tncm91bmRDb2xvciIsICJwb3J0YWwiLCAidGFyZ2V0IiwgImNhY2hlIiwgIkhvdEZyYW1lIiwgImJhciIsICJjdXQiLCAiQ29sZEZyYW1lIiwgImxpbmVIZWlnaHQiLCAiTElGRVBBVEhfVEVYVCIsICJIaW50cyIsICJIaW50IiwgImsiLCAibGFiZWwiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIlBBTkVMIiwgIlN1bW1hcnkiLCAiY2hhcmFjdGVyIiwgIm9uQ2hhbmdlIiwgImJhY2siLCAib25TdGFydCIsICJlZGl0aW5nIiwgInNldEVkaXRpbmciLCAidXNlU3RhdGUiLCAiZG9uZSIsICJzZXREb25lIiwgImVudGVyIiwgInVzZUVudGVyIiwgInByb2dyZXNzIiwgInVzZVNoYXJlZFZhbHVlIiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ3aXRoRGVsYXkiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAiZmluaXNoZWQiLCAic3RhcnQiLCAic2Z4IiwgInVzZUtleXMiLCAiZSIsICJrZXkiLCAiY29kZSIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJDaHJvbWUiLCAiSGVhZGVyIiwgInRpdGxlIiwgImNhcHRpb24iLCAiaWNvbiIsICJTdGVwSWNvbiIsICJraW5kIiwgInN0ZXAiLCAiSWRDYXJkIiwgIm9uRWRpdGluZyIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAicmlnaHQiLCAid2lkdGgiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAiYWxpZ25JdGVtcyIsICJtYXAiLCAidyIsICJpIiwgImhlaWdodCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQyIsICJyZWREaW0iLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImZvbnRTaXplIiwgImNvbG9yIiwgImNoYW1mZXIiLCAicGFkZGluZyIsICJib3R0b20iLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgInJlZCIsICJsaW5lQnJlYWsiLCAibWFyZ2luIiwgImFuaW1hdGVkIiwgImludGVycG9sYXRlIiwgImZsZXhHcm93IiwgImp1c3RpZnlDb250ZW50IiwgIlBlcmNlbnQiLCAiTmF2QnV0dG9ucyIsICJvbkJhY2siLCAib25OZXh0IiwgIm5leHQiLCAiSGludHMiLCAiSGludCIsICJrIiwgImxhYmVsIiwgIkRJR0lUIiwgIkVQUyIsICJjb2x1bW4iLCAiZGlnaXQiLCAiaW5wdXQiLCAib3V0cHV0IiwgInB1c2giLCAiZGlnaXRzIiwgIk1hdGgiLCAiZmxvb3IiLCAiZm9udCIsICJib2xkIiwgImxpbmVIZWlnaHQiLCAicHgiLCAiZCIsICJvdmVyZmxvd1kiLCAidGV4dEFsaWduIiwgInRyYW5zZm9ybSIsICJ0cmFuc2xhdGVZIiwgIlNURVBTIiwgIk5ld0dhbWUiLCAiY2hhcmFjdGVyIiwgIm9uQ2hhbmdlIiwgIm9uQmFjayIsICJvblN0YXJ0IiwgInN0ZXAiLCAic2V0U3RlcCIsICJ1c2VTdGF0ZSIsICJwcm9wcyIsICJuZXh0IiwgInNmeCIsICJNYXRoIiwgIm1pbiIsICJsZW5ndGgiLCAiYmFjayIsICJ1c2VEZWJ1ZyIsICJzIiwgIm1heCIsICJpbmRleE9mIiwgImgiLCAiaGFuZGxlIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImNvbG9yIiwgInBvc2l0aW9uIiwgIkVkZ2VSYWlscyIsICJtb3JwaEZpbHRlciIsICJrZXkiLCAibmFtZSIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJEaWZmaWN1bHR5IiwgIkxpZmVwYXRoIiwgIkJvZHlUeXBlIiwgIkFwcGVhcmFuY2UiLCAiQXR0cmlidXRlcyIsICJTdW1tYXJ5IiwgImltcG9ydF9yZWFjdCIsICJST1dfV0lEVEgiLCAiUk9XX0hFSUdIVCIsICJST1dfUElUQ0giLCAiVEVYVF9MRUZUIiwgIlBMQVRFIiwgIkxJTkUiLCAiU2xvdCIsICJpbmRleCIsICJzZWxlY3RlZCIsICJvblNlbGVjdCIsICJvbkNsaWNrIiwgImNoaWxkcmVuIiwgImVudGVyIiwgInVzZUVudGVyIiwgIk1hdGgiLCAibWluIiwgIl9qc3giLCAiYnV0dG9uIiwgIm9uUG9pbnRlckVudGVyIiwgInN0eWxlIiwgImNoYW1mZXIiLCAiQyIsICJyZWQiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImZsZXhTaHJpbmsiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgInBhZGRpbmciLCAibGVmdCIsICJUaHVtYiIsICJub2RlIiwgImp1c3RpZnlDb250ZW50IiwgImxpbmUiLCAiZm9udFNpemUiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImNvbG9yIiwgImxpbmVCcmVhayIsICJTYXZlUm93IiwgInNhdmUiLCAibGlmZXBhdGgiLCAiY2hhcmFjdGVyIiwgIl9qc3hzIiwgInBvcnRhbCIsICJ0YXJnZXQiLCAiY2FjaGUiLCAiZmxleEdyb3ciLCAicmlnaHQiLCAidG9wIiwgImJvdHRvbSIsICJ0ZXh0IiwgImN5YW4iLCAicXVlc3QiLCAibWFyZ2luIiwgImhvcml6b250YWwiLCAibmFtZSIsICJwbGF5dGltZSIsICJsb2NhdGlvbiIsICJMaWZlcGF0aEljb24iLCAiTElGRVBBVEhTIiwgImZpbmQiLCAibCIsICJpZCIsICJsZXZlbCIsICJkYXRlIiwgIk5ld1NhdmVSb3ciLCAiRGF0YXNoYXJkIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBvc2l0aW9uVHlwZSIsICJwb2x5bGluZSIsICJwb2ludHMiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgImZpbGwiLCAiYWxpZ25TZWxmIiwgIkxJU1RfVE9QIiwgIkxJU1RfSEVJR0hUIiwgIlJPV19QSVRDSCIsICJHVVRURVIiLCAiUVVFU1RJT05TIiwgIm92ZXJ3cml0ZSIsICJkZWxldGUiLCAiU2F2ZXMiLCAibW9kZSIsICJzYXZlcyIsICJvbkxvYWQiLCAib25TYXZlIiwgIm9uRGVsZXRlIiwgIm9uQ2xvc2UiLCAic2F2aW5nIiwgInNsb3RzIiwgInNlbGVjdGVkIiwgInNldFNlbGVjdGVkIiwgInVzZVN0YXRlIiwgImFzayIsICJzZXRBc2siLCAic2Nyb2xsIiwgInNldFNjcm9sbCIsICJzZWxlY3QiLCAiaSIsICJzZngiLCAicGljayIsICJzYXZlIiwgImtpbmQiLCAiaW5kZXgiLCAiYXNrRGVsZXRlIiwgImFuc3dlciIsICJNYXRoIiwgIm1pbiIsICJsZW5ndGgiLCAiY2xvc2UiLCAidXNlS2V5cyIsICJlIiwgIm1vZGFsT3BlbiIsICJrZXkiLCAiY29kZSIsICJ1c2VEZWJ1ZyIsICJOdW1iZXIiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgImJhY2tncm91bmRDb2xvciIsICJfanN4IiwgIkRlY29yIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInJpZ2h0IiwgInRvcCIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAib25TY3JvbGwiLCAic2Nyb2xsVG9wIiwgIndpZHRoIiwgIlJPV19XSURUSCIsICJoZWlnaHQiLCAicGFkZGluZyIsICJnYXAiLCAiUk9XX0hFSUdIVCIsICJvdmVyZmxvd1kiLCAic2Nyb2xsYmFyV2lkdGgiLCAic2Nyb2xsYmFyIiwgInRyYWNrIiwgInRodW1iIiwgIkMiLCAicmVkIiwgImhvdmVyIiwgInJlZEhpIiwgInRoaWNrbmVzcyIsICJtYXAiLCAiU2F2ZVJvdyIsICJvblNlbGVjdCIsICJvbkNsaWNrIiwgImlkIiwgIk5ld1NhdmVSb3ciLCAidGV4dCIsICJmb250U2l6ZSIsICJjb2xvciIsICJyZWREaW0iLCAibWFyZ2luIiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJsYWJlbCIsICJmb2N1c1BvbGljeSIsICJob3ZlclN0eWxlIiwgIlBsYXRlIiwgImljb24iLCAiRGF0YXNoYXJkIiwgIm9uQ29uZmlybSIsICJvbkNhbmNlbCIsICJURVhUX0xFRlQiLCAiSGVhZGVyIiwgInRpdGxlIiwgIl9GcmFnbWVudCIsICJzdmciLCAidmlld0JveCIsICJwYXRoIiwgImQiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgImZpbGwiLCAiUHJvdG9jb2xTdGFtcCIsICJqdXN0aWZ5Q29udGVudCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJyZWN0IiwgIngiLCAieSIsICJyeCIsICJUIiwgIm1pY3JvIiwgImxpbmVIZWlnaHQiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImxpbmVCcmVhayIsICJEQVNIRVMiLCAiQXJyYXkiLCAiZnJvbSIsICJfIiwgImpvaW4iLCAicmFpbCIsICJzaWRlIiwgInJlZERlZXAiLCAiYm9sZCIsICJ0ZXh0QWxpZ24iLCAidHJhbnNmb3JtIiwgInJvdGF0ZSIsICJib3R0b20iLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImltcG9ydF9yZWFjdCIsICJXSURUSCIsICJGUkFNRSIsICJGUkFNRV9IT1QiLCAiVkFMVUUiLCAiZm9udFNpemUiLCAiY29sb3IiLCAiQyIsICJjeWFuIiwgImxpbmVCcmVhayIsICJTVEFHRSIsICJwb3NpdGlvblR5cGUiLCAidG9wIiwgImJvdHRvbSIsICJsZWZ0IiwgIndpZHRoIiwgIm1hcmdpbiIsICJCYWNrZHJvcCIsICJfanN4IiwgIm5vZGUiLCAic3R5bGUiLCAicmlnaHQiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAicG9zaXRpb24iLCAiU3ViSGVhZGVyIiwgInRpdGxlIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJoZWlnaHQiLCAiYmFja2dyb3VuZENvbG9yIiwgImZsZXhEaXJlY3Rpb24iLCAianVzdGlmeUNvbnRlbnQiLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAic3ZnIiwgInZpZXdCb3giLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJzdHJva2UiLCAicmVkIiwgInN0cm9rZVdpZHRoIiwgImNpcmNsZSIsICJjeCIsICJjeSIsICJyIiwgImxpbmUiLCAieDEiLCAieTEiLCAieDIiLCAieTIiLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImxpbmVIZWlnaHQiLCAiU2VjdGlvbiIsICJsYWJlbCIsICJwYWRkaW5nIiwgInNlY3Rpb24iLCAiU2V0dGluZ1JvdyIsICJyb3ciLCAidmFsdWVzIiwgImxpc3RlbmluZyIsICJvbkNoYW5nZSIsICJvbkxpc3RlbiIsICJraW5kIiwgIndpZGdldCIsICJTZWxlY3RvciIsICJvcHRpb25zIiwgInZhbHVlIiwgIk51bWJlciIsICJpZCIsICJ2IiwgIlRvZ2dsZSIsICJTbGlkZXJCYXIiLCAiS2V5QmluZCIsICJjb2RlIiwgIlN0cmluZyIsICJJbmZvIiwgIlJvd0ZyYW1lIiwgImNoaWxkcmVuIiwgIm9uUG9pbnRlckVudGVyIiwgInNmeCIsICJob3ZlclN0eWxlIiwgInBsYXRlIiwgImNoYW1mZXIiLCAiZmllbGQiLCAic3RlcCIsICJkIiwgImxlbmd0aCIsICJwaXAiLCAiTWF0aCIsICJtaW4iLCAiaG9yaXpvbnRhbCIsICJBcnJvd0J1dHRvbiIsICJkaXIiLCAib25DbGljayIsICJtYXAiLCAiXyIsICJpIiwgImJ1dHRvbiIsICJBcnJvdyIsICJoYWxmIiwgIm9uIiwgImxpdCIsICJpbmsiLCAiY3lhbkhpIiwgImZvbnRGYW1pbHkiLCAiRiIsICJib2xkIiwgImxldHRlclNwYWNpbmciLCAibWF4IiwgImRlY2ltYWxzIiwgImZsb29yIiwgImxvZzEwIiwgInNldCIsICJlIiwgInQiLCAieCIsICJuZXh0IiwgInJvdW5kIiwgInRvRml4ZWQiLCAidW5kZXIiLCAiYWJzIiwgIm9uUG9pbnRlckRvd24iLCAib25Qb2ludGVyTW92ZSIsICJ3aGl0ZSIsICJzZW1pYm9sZCIsICJzdGFydHNXaXRoIiwgIk1vdXNlSWNvbiIsICJzaXplIiwgImluY2x1ZGVzIiwgImVuZHNXaXRoIiwgIktleWNhcCIsICJrIiwgImtleUxhYmVsIiwgIktFWV9OQU1FUyIsICJTcGFjZSIsICJFbnRlciIsICJTaGlmdExlZnQiLCAiU2hpZnRSaWdodCIsICJDb250cm9sTGVmdCIsICJDb250cm9sUmlnaHQiLCAiQWx0TGVmdCIsICJBbHRSaWdodCIsICJUYWIiLCAiQmFja3NwYWNlIiwgIkNhcHNMb2NrIiwgIkFycm93VXAiLCAiQXJyb3dEb3duIiwgIkFycm93TGVmdCIsICJBcnJvd1JpZ2h0IiwgIk1pbnVzIiwgIkVxdWFsIiwgIkJyYWNrZXRMZWZ0IiwgIkJyYWNrZXRSaWdodCIsICJTZW1pY29sb24iLCAiUXVvdGUiLCAiQ29tbWEiLCAiUGVyaW9kIiwgIlNsYXNoIiwgIkJhY2tzbGFzaCIsICJCYWNrcXVvdGUiLCAicmVwbGFjZSIsICJ0b1VwcGVyQ2FzZSIsICJzbGljZSIsICJDb250cm9sU2NoZW1lIiwgIm9uQmFjayIsICJiYWNrIiwgInNmeCIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgIkJhY2tkcm9wIiwgIlN1YkhlYWRlciIsICJ0aXRsZSIsICJFZGdlUmFpbHMiLCAiU1RBR0UiLCAiR2FtZXBhZCIsICJDQUxMT1VUUyIsICJtYXAiLCAic2lkZSIsICJ4IiwgInkiLCAiaWNvbiIsICJsaW5lcyIsICJMYWJlbCIsICJIaW50cyIsICJIaW50IiwgImsiLCAibGFiZWwiLCAib25DbGljayIsICJTbWFsbCIsICJnbHlwaCIsICJUYWciLCAiY2hpbGRyZW4iLCAibGVmdCIsICJwb3NpdGlvblR5cGUiLCAidG9wIiwgInJpZ2h0IiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAibGluZSIsICJ0ZXh0IiwgIlQiLCAibGluZUhlaWdodCIsICJoZWlnaHQiLCAibWluV2lkdGgiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQyIsICJjeWFuIiwgImp1c3RpZnlDb250ZW50IiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJib2xkIiwgImNvbG9yIiwgImxpbmVCcmVhayIsICJpbmsiLCAic3ZnIiwgInZpZXdCb3giLCAid2lkdGgiLCAicG9seWdvbiIsICJwb2ludHMiLCAiUExVUyIsICJmaWxsIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJfRnJhZ21lbnQiLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAiRmFjZUdseXBoIiwgInNpemUiLCAicyIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJwb2x5bGluZSIsICJyZWN0IiwgInJ4IiwgImQiLCAidyIsICJsIiwgImZsYXRNYXAiLCAiQk9EWSIsICJGQUNFIiwgIldJUkVTIiwgInJlZCIsICJkaW0iLCAic3RpY2siLCAiaSIsICJjeWFuRGltIiwgInBhdGgiLCAic3Ryb2tlTGluZWpvaW4iLCAiZyIsICJ0cmFuc2Zvcm0iLCAidW5kZWZpbmVkIiwgIkdhbW1hIiwgIm9uQmFjayIsICJnYW1tYSIsICJOdW1iZXIiLCAidXNlU2V0dGluZ3MiLCAiYmFjayIsICJzZngiLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJCYWNrZHJvcCIsICJTdWJIZWFkZXIiLCAidGl0bGUiLCAiRWRnZVJhaWxzIiwgIlNUQUdFIiwgIlRlc3RJbWFnZSIsICJ0ZXh0IiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInJpZ2h0IiwgInRvcCIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAiY29sb3IiLCAiQyIsICJyZWQiLCAidGV4dEFsaWduIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAiUm93RnJhbWUiLCAibGFiZWwiLCAiR0FNTUEiLCAiU2xpZGVyQmFyIiwgInJvdyIsICJ2YWx1ZSIsICJvbkNoYW5nZSIsICJ2IiwgInNldFNldHRpbmciLCAiaWQiLCAiSGludHMiLCAiSGludCIsICJrIiwgIm9uQ2xpY2siLCAiU0xJQ0VTIiwgIl9GcmFnbWVudCIsICJjaGFtZmVyIiwgInVuZGVmaW5lZCIsICJoZWlnaHQiLCAiYm9yZGVyIiwgImJvdHRvbSIsICJib3JkZXJDb2xvciIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYWxpZ25JdGVtcyIsICJwYWRkaW5nIiwgImZpbHRlciIsICJuYW1lIiwgInBhcmFtcyIsICJXT1JETUFSS19BU1BFQ1QiLCAibWFwIiwgImVuZCIsICJpIiwgInN0YXJ0IiwgIm92ZXJmbG93WCIsICJvdmVyZmxvd1kiLCAiTWFyayIsICJkaWdpdCIsICJzdmciLCAidmlld0JveCIsICJXT1JETUFSS19WSUVXQk9YIiwgInBhdGgiLCAiZCIsICJXT1JETUFSS19QQVRIIiwgImZpbGwiLCAiZ2FwIiwgImxpbmVCcmVhayIsICJtYXJnaW4iLCAiY2hhbmdlIiwgImlkIiwgInZhbHVlIiwgInNldFNldHRpbmdzIiwgInByZXNldCIsICJQUkVTRVRTIiwgIk51bWJlciIsICJDVVNUT00iLCAic2V0U2V0dGluZyIsICJTZXR0aW5ncyIsICJvbkNsb3NlIiwgInRhYiIsICJzZXRUYWIiLCAidXNlU3RhdGUiLCAic3ViIiwgInNldFN1YiIsICJsaXN0ZW5pbmciLCAic2V0TGlzdGVuaW5nIiwgInZhbHVlcyIsICJ1c2VTZXR0aW5ncyIsICJpbmRleCIsICJUQUJTIiwgImZpbmRJbmRleCIsICJ0IiwgInJvd3MiLCAicGljayIsICJzZngiLCAic3RlcCIsICJkIiwgImxlbmd0aCIsICJyZXN0b3JlIiwgImRlZmF1bHRzIiwgIm9wZW4iLCAicyIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgImNvZGUiLCAidXNlRGVidWciLCAic29tZSIsICJ4IiwgImFyZyIsICJ2IiwgInNwbGl0IiwgIl9qc3giLCAiR2FtbWEiLCAib25CYWNrIiwgIkNvbnRyb2xTY2hlbWUiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgIkJhY2tkcm9wIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInJpZ2h0IiwgInRvcCIsICJoZWlnaHQiLCAiYmFja2dyb3VuZENvbG9yIiwgIlByb3RvY29sU3RhbXAiLCAiRWRnZVJhaWxzIiwgIlRhYnMiLCAib25QaWNrIiwgIm9uU3RlcCIsICJmbGV4RGlyZWN0aW9uIiwgImp1c3RpZnlDb250ZW50IiwgIndpZHRoIiwgImZsZXhTaHJpbmsiLCAibW9ycGhGaWx0ZXIiLCAibmFtZSIsICJ1aUdsaXRjaCIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJvdmVyZmxvd1kiLCAic2Nyb2xsYmFyIiwgInRyYWNrIiwgInRodW1iIiwgImhvdmVyIiwgIkMiLCAicmVkSGkiLCAidGhpY2tuZXNzIiwgIm1pblRodW1iTGVuZ3RoIiwgInNjcm9sbFN0ZXAiLCAibWFwIiwgInJvdyIsICJpIiwgIlNldHRpbmdSb3ciLCAib25DaGFuZ2UiLCAib25MaXN0ZW4iLCAiZ2FwIiwgIm1hcmdpbiIsICJTaWRlQnV0dG9uIiwgImxhYmVsIiwgImsiLCAib25DbGljayIsICJDdXRCdXR0b24iLCAiYWxpZ25JdGVtcyIsICJ0ZXh0IiwgIlQiLCAibWljcm8iLCAiZm9udFNpemUiLCAic3ZnIiwgInZpZXdCb3giLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJyZWREaW0iLCAicmVjdCIsICJ5IiwgIkJhZGdlIiwgIkhpbnRzIiwgIkhpbnQiLCAiYnV0dG9uIiwgIktleWNhcCIsICJob3ZlclN0eWxlIiwgImNvbG9yIiwgImN5YW4iLCAicmVkIiwgImxpbmVCcmVhayIsICJTSURFX0ZSQU1FIiwgImNoYW1mZXIiLCAiYm90dG9tIiwgInBhZGRpbmciLCAibGV0dGVyU3BhY2luZyIsICJib3JkZXIiLCAiX0ZyYWdtZW50IiwgImJvcmRlckNvbG9yIiwgImJvcmRlclJhZGl1cyIsICJmb250RmFtaWx5IiwgIkYiLCAiYm9sZCIsICJsaW5lSGVpZ2h0IiwgInRleHRBbGlnbiIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAiSU5LIiwgImNhcmQiLCAiZGVsYXkiLCAiaG9sZCIsICJ3aXRoRGVsYXkiLCAid2l0aFNlcXVlbmNlIiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgIlNwbGFzaCIsICJvbkRvbmUiLCAibWFya3MiLCAidXNlU2hhcmVkVmFsdWUiLCAibm90aWNlIiwgImRvbmUiLCAidXNlUmVmIiwgImN1cnJlbnQiLCAidXNlRWZmZWN0IiwgInZhbHVlIiwgInQiLCAic2V0VGltZW91dCIsICJjbGVhclRpbWVvdXQiLCAidXNlS2V5cyIsICJjZW50ZXIiLCAiRklMTCIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgIl9qc3hzIiwgImJ1dHRvbiIsICJzdHlsZSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAib25DbGljayIsICJfanN4IiwgIm5vZGUiLCAib3BhY2l0eSIsICJhbmltYXRlZCIsICJ3aWR0aCIsICJmbGV4RGlyZWN0aW9uIiwgImZsZXhXcmFwIiwgInJvd0dhcCIsICJNYXJrIiwgIkxvZ28iLCAic3JjIiwgIldvcmQiLCAic2l6ZSIsICJnYXAiLCAiaGVpZ2h0IiwgImJvcmRlclJhZGl1cyIsICJjb2xvciIsICJmb250IiwgIkYiLCAic2VtaWJvbGQiLCAibW9ubyIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImxpbmVIZWlnaHQiLCAidGV4dEFsaWduIiwgImNoaWxkcmVuIiwgImltYWdlIiwgInRpbnQiLCAiYm9sZCIsICJmb250RmFtaWx5IiwgImxpbmVCcmVhayIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAiVGl0bGUiLCAib25Db250aW51ZSIsICJicmVhY2hpbmciLCAic2V0QnJlYWNoaW5nIiwgInVzZVN0YXRlIiwgImdvIiwgInNmeCIsICJzZXRUaW1lb3V0IiwgInVzZUtleXMiLCAiZSIsICJrZXkiLCAic3dheSIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aFJlcGVhdCIsICJ3aXRoVGltaW5nIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJyZXZlcnNlIiwgIl9qc3hzIiwgImJ1dHRvbiIsICJzdHlsZSIsICJGSUxMIiwgImJhY2tncm91bmRDb2xvciIsICJDIiwgImNsZWFyIiwgIm9uQ2xpY2siLCAiX2pzeCIsICJXb3JkbWFyayIsICJ3aWR0aCIsICJnbGl0Y2giLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgInRyYW5zZm9ybTNkIiwgInBlcnNwZWN0aXZlIiwgInJvdGF0ZVgiLCAiYW5pbWF0ZWQiLCAiaW50ZXJwb2xhdGUiLCAicm90YXRlWSIsICJyb3RhdGVaIiwgIm5vZGUiLCAicmlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJ0ZXh0IiwgIlQiLCAibWljcm8iLCAiY29sb3IiLCAicmVkRGltIiwgImhlaWdodCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAicmVkIiwgImp1c3RpZnlDb250ZW50IiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJjeWFuIiwgImxldHRlclNwYWNpbmciLCAiZmlsdGVyIiwgIm5hbWUiLCAicGFyYW1zIiwgImludGVuc2l0eSIsICJmcmVxdWVuY3kiLCAidGVhciIsICJfRnJhZ21lbnQiLCAibWVudSIsICJLZXljYXAiLCAiayIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAiRGF0YU5vaXNlIiwgInNlZWQiLCAibGluZXMiLCAiZ3JvdXBzIiwgIlJ1bGUiLCAibWFyZ2luIiwgIk1BSU4iLCAiaWQiLCAibGFiZWwiLCAiUEFVU0UiLCAiTU9SUEhfTVMiLCAiQXBwIiwgInNjcmVlbiIsICJzZXRTY3JlZW4iLCAidXNlU3RhdGUiLCAiY2hhcmFjdGVyIiwgInNldENoYXJhY3RlciIsICJORVdfQ0hBUkFDVEVSIiwgInNhdmVzIiwgInNldFNhdmVzIiwgIlNFRURfU0FWRVMiLCAiZ2FtZSIsICJzZXRHYW1lIiwgImluR2FtZSIsICJzZXRJbkdhbWUiLCAiZGlhbG9nIiwgInNldERpYWxvZyIsICJkZWJ1Z1BvcnRhbCIsICJzZXREZWJ1Z1BvcnRhbCIsICJzZXR0aW5ncyIsICJ1c2VTZXR0aW5ncyIsICJ1c2VMaXZlU2V0dGluZ3MiLCAibW9ycGgiLCAic2V0TW9ycGgiLCAidGltZXJzIiwgInVzZVJlZiIsICJnbyIsICJuZXh0IiwgImFwcGx5IiwgInQiLCAiY3VycmVudCIsICJjbGVhclRpbWVvdXQiLCAiZW5kIiwgImZsaXAiLCAic2V0VGltZW91dCIsICJtZW51IiwgImxpZmVwYXRoIiwgInVzZUVmZmVjdCIsICJiZXZ5IiwgImRpb3JhbWFzIiwgIndvcmxkIiwgInBsYXkiLCAic2F2ZSIsICJwaWNrIiwgInNmeCIsICJ0ZXh0IiwgIm9uQ29uZmlybSIsICJsb2NhdGlvbiIsICJhcHAiLCAicXVpdCIsICJyZWxvYWQiLCAic3RhcnQiLCAiUFJPTE9HVUUiLCAibmFtZSIsICJsZXZlbCIsICJwbGF5dGltZSIsICJkYXRlIiwgInN0YW1wIiwgImxvYWQiLCAib3ZlcndyaXRlIiwgIk1hdGgiLCAibWF4IiwgIm1hcCIsICJzIiwgImZyZXNoIiwgImZpbHRlciIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgInVzZURlYnVnIiwgImFyZyIsICJzcGxpdCIsICJsIiwgInBhdXNlZCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIndpZHRoIiwgImhlaWdodCIsICJfanN4IiwgIldvcmxkIiwgImZpbG1HcmFpbiIsICJGSUxMIiwgInBhcmFtcyIsICJhbW91bnQiLCAiY2FjaGUiLCAibW9ycGhGaWx0ZXIiLCAidWlHbGl0Y2giLCAic3ByZWFkIiwgInRyYW5zaXRpb24iLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgIlNwbGFzaCIsICJvbkRvbmUiLCAiVGl0bGUiLCAib25Db250aW51ZSIsICJNYWluTWVudSIsICJlbnRyaWVzIiwgIm9uUGljayIsICJvbkJhY2siLCAidW5kZWZpbmVkIiwgInZlcnNpb24iLCAiTmV3R2FtZSIsICJvbkNoYW5nZSIsICJvblN0YXJ0IiwgIlNhdmVzIiwgIm1vZGUiLCAib25Mb2FkIiwgIm9uU2F2ZSIsICJvbkRlbGV0ZSIsICJ4IiwgIm9uQ2xvc2UiLCAiU2V0dGluZ3MiLCAiQ3JlZGl0cyIsICJMb2FkaW5nIiwgIkdhbWVIdWQiLCAib25QYXVzZSIsICJDb25maXJtIiwgIm9uQ2FuY2VsIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAicG9ydGFsIiwgInRhcmdldCIsICJOdW1iZXIiLCAic2NhbmxpbmVzIiwgImJhY2tncm91bmRJbWFnZSIsICJTQ0FOTElORVMiLCAiZCIsICJEYXRlIiwgImgiLCAiZ2V0SG91cnMiLCAibSIsICJnZXRNaW51dGVzIiwgInRvU3RyaW5nIiwgInBhZFN0YXJ0IiwgImFtcG0iLCAibW0iLCAiZ2V0TW9udGgiLCAiZGQiLCAiZ2V0RGF0ZSIsICJtb3VudCIsICJfanN4IiwgIkFwcCJdCn0K
