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
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: {
            width: 520
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
            style: {
              fontSize: 10.5,
              color: C.redDim,
              lineHeight: 1.25
            },
            children: "The data you enter on a CRD terminal will only be used for the purpose you entered it. Your personal data is protected under the 2088 Privacy Act and the Sable City Charter, except where it is not. In accordance with Gridwatch Memo 4410-B, terminals may retain biometric samples for the duration of your session and the rest of your life."
          })
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
      if (editing && (e.key === "Enter" || e.key === "Escape")) {
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
          children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("node", {
            style: {
              width: 1280
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("text", {
              style: {
                fontSize: 25,
                color: "#c9463f",
                lineHeight: 1.45,
                textAlign: "center"
              },
              children: "CYBERPUNK 2091 is a fan homage to the menus of Cyberpunk 2077, built with bevy-react. It is not affiliated with or endorsed by CD PROJEKT RED. Sable City, Tenkai and everyone in them are made up. Bevy, React, wgpu, V8, taffy, deno_core and cosmic-text are the work of their authors, used under their open-source licenses."
            })
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidmVuZG9yLWdsb2JhbDpiZXZ5LXJlYWN0L2pzeC1ydW50aW1lIiwgInZlbmRvci1nbG9iYWw6YmV2eS1yZWFjdCIsICJ2ZW5kb3ItZ2xvYmFsOnJlYWN0IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvaW5kZXgudHN4IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvQXBwLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL2JldnkudHMiLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9ob29rcy50cyIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9DcmVkaXRzLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NvdW5kLnRzIiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvdGhlbWUudHMiLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy91aS9pY29ucy50c3giLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy91aS9raXQudHN4IiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL0RpYWxvZy50c3giLCAiLi4vc3JjL3NjcmVlbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvSW5HYW1lLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3N0b3JlLnRzIiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL0xvYWRpbmcudHN4IiwgIi4uL3NyYy91aS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvdWkvZGVjb3IudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NldHRpbmdzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NldHRpbmdzL3N0b3JlLnRzIiwgIi4uL3NyYy9zY3JlZW5zL3NldHRpbmdzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NldHRpbmdzL2RhdGEudHMiLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy91aS93b3JkbWFyay1wYXRoLnRzIiwgIi4uL3NyYy91aS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvdWkvV29yZG1hcmsudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NhdmVzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NhdmVzL2ljb25zLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9NYWluTWVudS50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL05ld0dhbWUudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9BcHBlYXJhbmNlLnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvZGF0YS50cyIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvSWRDYXJkLnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvZ2x5cGhzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvcGFydHMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9NYXJrcy50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL1BvcnRyYWl0LnRzeCIsICIuLi9zcmMvc2NyZWVucy9uZXdnYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL25ld2dhbWUvUmFkYXIudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9Td2F0Y2hlcy50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL0F0dHJpYnV0ZXMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9Cb2R5VHlwZS50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL0ZpZ3VyZS50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL0RpZmZpY3VsdHkudHN4IiwgIi4uL3NyYy9zY3JlZW5zL25ld2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvbmV3Z2FtZS9MaWZlcGF0aC50c3giLCAiLi4vc3JjL3NjcmVlbnMvbmV3Z2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9uZXdnYW1lL1N1bW1hcnkudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NhdmVzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NhdmVzL1NhdmVzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zYXZlcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zYXZlcy9Sb3cudHN4IiwgIi4uL3NyYy9zY3JlZW5zL3NldHRpbmdzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY3liZXJwdW5rL3VpL3NyYy9zY3JlZW5zL3NldHRpbmdzL1NldHRpbmdzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zZXR0aW5ncy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zZXR0aW5ncy9yb3dzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zZXR0aW5ncy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zZXR0aW5ncy9Db250cm9sU2NoZW1lLnRzeCIsICIuLi9zcmMvc2NyZWVucy9zZXR0aW5ncy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9zZXR0aW5ncy9HYW1tYS50c3giLCAiLi4vc3JjL3NjcmVlbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jeWJlcnB1bmsvdWkvc3JjL3NjcmVlbnMvU3BsYXNoLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2N5YmVycHVuay91aS9zcmMvc2NyZWVucy9UaXRsZS50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5fX2JldnlWZW5kb3JbXCJiZXZ5LXJlYWN0L2pzeC1ydW50aW1lXCJdOyIsICJtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuX19iZXZ5VmVuZG9yW1wiYmV2eS1yZWFjdFwiXTsiLCAibW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLl9fYmV2eVZlbmRvcltcInJlYWN0XCJdOyIsICJpbXBvcnQgeyBtb3VudCB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBBcHAgfSBmcm9tIFwiLi9BcHBcIjtcblxuLy8gYG1vdW50YCBwYXJrcyBvbiB0aGUgUnVzdC1kcml2ZW4gZXZlbnQgbG9vcCBhbmQgbmV2ZXIgcmVzb2x2ZXMuIE9uIGEgaG90XG4vLyByZWxvYWQgdGhpcyBmaWxlIHJlLWV4ZWN1dGVzIGFuZCBgbW91bnRgIHRyaWdnZXJzIGEgUmVhY3QgRmFzdCBSZWZyZXNoLlxubW91bnQoPEFwcCAvPik7XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4vYmV2eVwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi9ob29rc1wiO1xuaW1wb3J0IHsgQ3JlZGl0cyB9IGZyb20gXCIuL3NjcmVlbnMvQ3JlZGl0c1wiO1xuaW1wb3J0IHsgQ29uZmlybSB9IGZyb20gXCIuL3NjcmVlbnMvRGlhbG9nXCI7XG5pbXBvcnQgeyBHYW1lSHVkLCBXb3JsZCB9IGZyb20gXCIuL3NjcmVlbnMvSW5HYW1lXCI7XG5pbXBvcnQgeyBMb2FkaW5nIH0gZnJvbSBcIi4vc2NyZWVucy9Mb2FkaW5nXCI7XG5pbXBvcnQgeyBNYWluTWVudSwgdHlwZSBNZW51RW50cnkgfSBmcm9tIFwiLi9zY3JlZW5zL01haW5NZW51XCI7XG5pbXBvcnQgeyBOZXdHYW1lIH0gZnJvbSBcIi4vc2NyZWVucy9uZXdnYW1lL05ld0dhbWVcIjtcbmltcG9ydCB7IFNhdmVzIH0gZnJvbSBcIi4vc2NyZWVucy9zYXZlcy9TYXZlc1wiO1xuaW1wb3J0IHsgU2V0dGluZ3MgfSBmcm9tIFwiLi9zY3JlZW5zL3NldHRpbmdzL1NldHRpbmdzXCI7XG5pbXBvcnQgeyB1c2VMaXZlU2V0dGluZ3MsIHVzZVNldHRpbmdzIH0gZnJvbSBcIi4vc2NyZWVucy9zZXR0aW5ncy9zdG9yZVwiO1xuaW1wb3J0IHsgU3BsYXNoIH0gZnJvbSBcIi4vc2NyZWVucy9TcGxhc2hcIjtcbmltcG9ydCB7IFRpdGxlIH0gZnJvbSBcIi4vc2NyZWVucy9UaXRsZVwiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4vc291bmRcIjtcbmltcG9ydCB7XG4gIE5FV19DSEFSQUNURVIsXG4gIFBST0xPR1VFLFxuICBTRUVEX1NBVkVTLFxuICB0eXBlIENoYXJhY3RlcixcbiAgdHlwZSBMaWZlcGF0aCxcbiAgdHlwZSBTYXZlLFxufSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IHsgU0NBTkxJTkVTIH0gZnJvbSBcIi4vdGhlbWVcIjtcbmltcG9ydCB7IEZJTEwgfSBmcm9tIFwiLi91aS9raXRcIjtcblxuZXhwb3J0IHR5cGUgU2NyZWVuID1cbiAgfCBcInNwbGFzaFwiXG4gIHwgXCJ0aXRsZVwiXG4gIHwgXCJtZW51XCJcbiAgfCBcIm5ld2dhbWVcIlxuICB8IFwibG9hZFwiXG4gIHwgXCJzYXZlXCJcbiAgfCBcInNldHRpbmdzXCJcbiAgfCBcImNyZWRpdHNcIlxuICB8IFwibG9hZGluZ1wiXG4gIHwgXCJnYW1lXCI7XG5cbmNvbnN0IE1BSU46IE1lbnVFbnRyeVtdID0gW1xuICB7IGlkOiBcIm5ld2dhbWVcIiwgbGFiZWw6IFwiTkVXIEdBTUVcIiB9LFxuICB7IGlkOiBcImxvYWRcIiwgbGFiZWw6IFwiTE9BRCBHQU1FXCIgfSxcbiAgeyBpZDogXCJzZXR0aW5nc1wiLCBsYWJlbDogXCJTRVRUSU5HU1wiIH0sXG4gIHsgaWQ6IFwiY3JlZGl0c1wiLCBsYWJlbDogXCJDUkVESVRTXCIgfSxcbiAgeyBpZDogXCJxdWl0XCIsIGxhYmVsOiBcIlFVSVQgR0FNRVwiIH0sXG5dO1xuXG5jb25zdCBQQVVTRTogTWVudUVudHJ5W10gPSBbXG4gIHsgaWQ6IFwicmVzdW1lXCIsIGxhYmVsOiBcIlJFU1VNRVwiIH0sXG4gIHsgaWQ6IFwic2F2ZVwiLCBsYWJlbDogXCJTQVZFIEdBTUVcIiB9LFxuICB7IGlkOiBcImxvYWRcIiwgbGFiZWw6IFwiTE9BRCBHQU1FXCIgfSxcbiAgeyBpZDogXCJzZXR0aW5nc1wiLCBsYWJlbDogXCJTRVRUSU5HU1wiIH0sXG4gIHsgaWQ6IFwiY3JlZGl0c1wiLCBsYWJlbDogXCJDUkVESVRTXCIgfSxcbiAgeyBpZDogXCJleGl0XCIsIGxhYmVsOiBcIkVYSVQgVE8gTUFJTiBNRU5VXCIgfSxcbiAgeyBpZDogXCJxdWl0XCIsIGxhYmVsOiBcIlFVSVQgR0FNRVwiIH0sXG5dO1xuXG50eXBlIERpYWxvZyA9IHsgdGV4dDogc3RyaW5nOyBvbkNvbmZpcm06ICgpID0+IHZvaWQgfSB8IG51bGw7XG5cbi8qKiBIb3cgbG9uZyBhIHNjcmVlbiBjaGFuZ2UgZ2xpdGNoZXMuICovXG5jb25zdCBNT1JQSF9NUyA9IDQyMDtcblxuLyoqIFRoZSBmcm9udCBlbmQ6IG9uZSBzY3JlZW4gYXQgYSB0aW1lIG92ZXIgdGhlIGRhdGFzY2FwZSAob3IsIGluIGdhbWUsXG4gKiAgb3ZlciB0aGUgd29ybGQpLCBldmVyeSBjaGFuZ2UgZ2xpdGNoaW5nIHRocm91Z2ggdGhlIGBnbGl0Y2hTd2FwYCBtb3JwaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IFtzY3JlZW4sIHNldFNjcmVlbl0gPSB1c2VTdGF0ZTxTY3JlZW4+KFwic3BsYXNoXCIpO1xuICBjb25zdCBbY2hhcmFjdGVyLCBzZXRDaGFyYWN0ZXJdID0gdXNlU3RhdGU8Q2hhcmFjdGVyPihORVdfQ0hBUkFDVEVSKTtcbiAgY29uc3QgW3NhdmVzLCBzZXRTYXZlc10gPSB1c2VTdGF0ZTxTYXZlW10+KFNFRURfU0FWRVMpO1xuICAvKiogVGhlIGdhbWUgYmVpbmcgcGxheWVkIChvciBiZWluZyBsb2FkZWQgaW50bykuICovXG4gIGNvbnN0IFtnYW1lLCBzZXRHYW1lXSA9IHVzZVN0YXRlPFNhdmUgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2luR2FtZSwgc2V0SW5HYW1lXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2RpYWxvZywgc2V0RGlhbG9nXSA9IHVzZVN0YXRlPERpYWxvZz4obnVsbCk7XG4gIGNvbnN0IFtkZWJ1Z1BvcnRhbCwgc2V0RGVidWdQb3J0YWxdID0gdXNlU3RhdGU8c3RyaW5nW10gfCBudWxsPihudWxsKTtcbiAgY29uc3Qgc2V0dGluZ3MgPSB1c2VTZXR0aW5ncygpO1xuICAvLyBUaGUgc2V0dGluZ3MgdGhhdCBjaGFuZ2UgQmV2eSAoY2FtZXJhLCB3aW5kb3csIGNvbG9yIGdyYWRpbmcsIHZvbHVtZSkuXG4gIHVzZUxpdmVTZXR0aW5ncygpO1xuXG4gIC8vIFNjcmVlbiBjaGFuZ2VzIG1vcnBoLiBUaGUgbW9ycGggaXMgYXJtZWQgb25seSB3aGlsZSBhIGNoYW5nZSBpcyBpblxuICAvLyBmbGlnaHQgKHNvIGFuIGlkbGUgc2NyZWVuIGlzbid0IGEgZnVsbC1zY3JlZW4gbGF5ZXIsIGFuZCBpdHMgbGl2ZSBwYXJ0c1xuICAvLyBuZWVkIG5vIGNhcmUpOiBwcm9tb3RlIHVuZGVyIHRoZSBjdXJyZW50IHNjcmVlbiwgZmxpcCB0aGUga2V5IChhbmRcbiAgLy8gYXBwbHkgdGhlIGNoYW5nZSkgYSBmZXcgZnJhbWVzIGxhdGVyLCBkZW1vdGUgb25jZSB0aGUgbW9ycGggaGFzIHJ1bi4gQVxuICAvLyBjaGFuZ2Ugd2hpbGUgb25lIGlzIGluIGZsaWdodCBmbGlwcyBhdCBvbmNlIOKAlCB0aGUgbW9ycGggcmVzdGFydHMgZnJvbVxuICAvLyB3aGVyZXZlciBpdCB3YXMuXG4gIGNvbnN0IFttb3JwaCwgc2V0TW9ycGhdID0gdXNlU3RhdGU8U2NyZWVuIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHRpbWVycyA9IHVzZVJlZjx7XG4gICAgZmxpcD86IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+O1xuICAgIGVuZD86IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+O1xuICB9Pih7fSk7XG4gIGNvbnN0IGdvID0gKG5leHQ6IFNjcmVlbiwgYXBwbHk/OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgc2V0RGlhbG9nKG51bGwpO1xuICAgIGNvbnN0IHQgPSB0aW1lcnMuY3VycmVudDtcbiAgICBjbGVhclRpbWVvdXQodC5lbmQpO1xuICAgIGNvbnN0IGZsaXAgPSAoKSA9PiB7XG4gICAgICBhcHBseT8uKCk7XG4gICAgICBzZXRTY3JlZW4obmV4dCk7XG4gICAgICBzZXRNb3JwaChuZXh0KTtcbiAgICAgIHQuZW5kID0gc2V0VGltZW91dCgoKSA9PiBzZXRNb3JwaChudWxsKSwgTU9SUEhfTVMgKyAxMjApO1xuICAgIH07XG4gICAgaWYgKG1vcnBoKSB7XG4gICAgICBjbGVhclRpbWVvdXQodC5mbGlwKTtcbiAgICAgIGZsaXAoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0TW9ycGgoc2NyZWVuKTtcbiAgICAgIHQuZmxpcCA9IHNldFRpbWVvdXQoZmxpcCwgNjApO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgbWVudSA9ICgpID0+IGdvKFwibWVudVwiKTtcblxuICAvLyBUaGUgd29ybGQgY2FtZXJhIGZpbG1zIHRoZSBydW5uaW5nIGdhbWUncyBsaWZlcGF0aC5cbiAgY29uc3QgbGlmZXBhdGg6IExpZmVwYXRoIHwgbnVsbCA9XG4gICAgaW5HYW1lICYmIGdhbWUgPyBnYW1lLmNoYXJhY3Rlci5saWZlcGF0aCA6IG51bGw7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYmV2eS5kaW9yYW1hcy53b3JsZCh7IGxpZmVwYXRoIH0pO1xuICB9LCBbbGlmZXBhdGhdKTtcblxuICBjb25zdCBwbGF5ID0gKHNhdmU6IFNhdmUpID0+XG4gICAgZ28oXCJsb2FkaW5nXCIsICgpID0+IHtcbiAgICAgIHNldEdhbWUoc2F2ZSk7XG4gICAgICBzZXRJbkdhbWUoZmFsc2UpO1xuICAgIH0pO1xuXG4gIGNvbnN0IHBpY2sgPSAoaWQ6IHN0cmluZykgPT4ge1xuICAgIHNmeChcImNsaWNrXCIpO1xuICAgIHN3aXRjaCAoaWQpIHtcbiAgICAgIGNhc2UgXCJuZXdnYW1lXCI6XG4gICAgICAgIHNldENoYXJhY3RlcihORVdfQ0hBUkFDVEVSKTtcbiAgICAgICAgcmV0dXJuIGdvKFwibmV3Z2FtZVwiKTtcbiAgICAgIGNhc2UgXCJyZXN1bWVcIjpcbiAgICAgICAgcmV0dXJuIGdvKFwiZ2FtZVwiKTtcbiAgICAgIGNhc2UgXCJsb2FkXCI6XG4gICAgICBjYXNlIFwic2F2ZVwiOlxuICAgICAgY2FzZSBcInNldHRpbmdzXCI6XG4gICAgICBjYXNlIFwiY3JlZGl0c1wiOlxuICAgICAgICByZXR1cm4gZ28oaWQpO1xuICAgICAgY2FzZSBcImV4aXRcIjpcbiAgICAgICAgcmV0dXJuIHNldERpYWxvZyh7XG4gICAgICAgICAgdGV4dDogXCJFeGl0IHRvIHRoZSBtYWluIG1lbnU/IEFueSB1bnNhdmVkIHByb2dyZXNzIHdpbGwgYmUgbG9zdC5cIixcbiAgICAgICAgICBvbkNvbmZpcm06ICgpID0+XG4gICAgICAgICAgICBnbyhcIm1lbnVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICBzZXRJbkdhbWUoZmFsc2UpO1xuICAgICAgICAgICAgICBzZXRHYW1lKG51bGwpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgICAgY2FzZSBcInF1aXRcIjpcbiAgICAgICAgcmV0dXJuIHNldERpYWxvZyh7XG4gICAgICAgICAgdGV4dDogXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcXVpdCB0aGUgZ2FtZT9cIixcbiAgICAgICAgICAvLyBJbiB0aGUgYnJvd3NlciBhbiBleGl0ZWQgYXBwIGlzIGEgZnJvemVuIHBhZ2U6IHN0YXJ0IG92ZXIuXG4gICAgICAgICAgb25Db25maXJtOiAoKSA9PlxuICAgICAgICAgICAgdHlwZW9mIGxvY2F0aW9uID09PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgICAgID8gYmV2eS5hcHAucXVpdChudWxsKVxuICAgICAgICAgICAgICA6IGxvY2F0aW9uLnJlbG9hZCgpLFxuICAgICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc3RhcnQgPSAoKSA9PlxuICAgIHBsYXkoe1xuICAgICAgaWQ6IDAsXG4gICAgICAuLi5QUk9MT0dVRVtjaGFyYWN0ZXIubGlmZXBhdGhdLFxuICAgICAgbmFtZTogXCJBdXRvU2F2ZVwiLFxuICAgICAgbGV2ZWw6IDEsXG4gICAgICBwbGF5dGltZTogMCxcbiAgICAgIGRhdGU6IHN0YW1wKCksXG4gICAgICBjaGFyYWN0ZXIsXG4gICAgfSk7XG5cbiAgY29uc3QgbG9hZCA9IChzYXZlOiBTYXZlKSA9PiB7XG4gICAgaWYgKCFpbkdhbWUpIHJldHVybiBwbGF5KHNhdmUpO1xuICAgIHNldERpYWxvZyh7XG4gICAgICB0ZXh0OiBcIkxvYWQgdGhpcyBzYXZlPyBBbnkgdW5zYXZlZCBwcm9ncmVzcyB3aWxsIGJlIGxvc3QuXCIsXG4gICAgICBvbkNvbmZpcm06ICgpID0+IHBsYXkoc2F2ZSksXG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3Qgc2F2ZSA9IChvdmVyd3JpdGU6IFNhdmUgfCBudWxsKSA9PiB7XG4gICAgaWYgKCFnYW1lKSByZXR1cm47XG4gICAgY29uc3QgaWQgPSBNYXRoLm1heCgwLCAuLi5zYXZlcy5tYXAoKHMpID0+IHMuaWQpKSArIDE7XG4gICAgY29uc3QgZnJlc2g6IFNhdmUgPSB7XG4gICAgICAuLi5nYW1lLFxuICAgICAgaWQsXG4gICAgICBuYW1lOiBvdmVyd3JpdGU/Lm5hbWUgPz8gYE1hbnVhbFNhdmUtJHtpZH1gLFxuICAgICAgcGxheXRpbWU6IGdhbWUucGxheXRpbWUgKyAyMyxcbiAgICAgIGRhdGU6IHN0YW1wKCksXG4gICAgfTtcbiAgICBzZXRTYXZlcyhbZnJlc2gsIC4uLnNhdmVzLmZpbHRlcigocykgPT4gcy5pZCAhPT0gb3ZlcndyaXRlPy5pZCldKTtcbiAgfTtcblxuICAvLyBJbiBnYW1lLCBFc2MgcGF1c2VzIChldmVyeSBvdGhlciBzY3JlZW4gaGFuZGxlcyBpdHMgb3duIEVzYykuXG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIgJiYgc2NyZWVuID09PSBcImdhbWVcIiAmJiAhZGlhbG9nKSB7XG4gICAgICBzZngoXCJiYWNrXCIpO1xuICAgICAgZ28oXCJtZW51XCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gU2NyaXB0ZWQgc3RlcHMgZm9yIGAtLXNob290YCAoc2VlIGBzaG9vdC5yc2ApOiBgZ28gPHNjcmVlbj5gLFxuICAvLyBgcGxheSA8bGlmZXBhdGg+YCAoc3RyYWlnaHQgaW50byB0aGUgZ2FtZSwgcGF1c2VkIHdpdGggYGdvIG1lbnVgKSxcbiAgLy8gYHBpY2sgPGVudHJ5PmAsIGBwb3J0YWwgPHRhcmdldD4gPHdpZHRoPiA8aGVpZ2h0PmAuXG4gIHVzZURlYnVnKFwiZ29cIiwgKHMpID0+IGdvKHMgYXMgU2NyZWVuKSk7XG4gIC8vIGBwb3J0YWwgPHRhcmdldD4gPHdpZHRoPiA8aGVpZ2h0PmA6IHNob3cgYSByZW5kZXIgdGFyZ2V0LCBjZW50ZXJlZC5cbiAgdXNlRGVidWcoXCJwb3J0YWxcIiwgKGFyZykgPT4gc2V0RGVidWdQb3J0YWwoYXJnID8gYXJnLnNwbGl0KFwiIFwiKSA6IG51bGwpKTtcbiAgdXNlRGVidWcoXCJwbGF5XCIsIChsKSA9PiB7XG4gICAgY29uc3QgbGlmZXBhdGggPSBsIGFzIExpZmVwYXRoO1xuICAgIHNldEdhbWUoe1xuICAgICAgLi4uU0VFRF9TQVZFU1swXSxcbiAgICAgIC4uLlBST0xPR1VFW2xpZmVwYXRoXSxcbiAgICAgIGNoYXJhY3RlcjogeyAuLi5ORVdfQ0hBUkFDVEVSLCBsaWZlcGF0aCB9LFxuICAgIH0pO1xuICAgIHNldEluR2FtZSh0cnVlKTtcbiAgICBnbyhcImdhbWVcIik7XG4gIH0pO1xuICAvLyBgcGljayA8ZW50cnk+YDogYXMgaWYgYSBtZW51IGVudHJ5IHdlcmUgY2xpY2tlZCAoYHF1aXRgIOKGkiB0aGUgZGlhbG9nKS5cbiAgdXNlRGVidWcoXCJwaWNrXCIsIHBpY2spO1xuXG4gIGNvbnN0IHBhdXNlZCA9IGluR2FtZSAmJiBzY3JlZW4gIT09IFwiZ2FtZVwiO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiIH19PlxuICAgICAge2luR2FtZSAmJiBnYW1lID8gKFxuICAgICAgICA8V29ybGQgbGlmZXBhdGg9e2dhbWUuY2hhcmFjdGVyLmxpZmVwYXRofSBwYXVzZWQ9e3BhdXNlZH0gLz5cbiAgICAgICkgOiAoXG4gICAgICAgIHNldHRpbmdzLmZpbG1HcmFpbiAmJiAoXG4gICAgICAgICAgLy8gRmlsbSBncmFpbiBvdmVyIHRoZSAzRCB3b3JsZCwgdW5kZXIgdGhlIG1lbnVzLlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5GSUxMLFxuICAgICAgICAgICAgICBmaWx0ZXI6IHsgbmFtZTogXCJncmFpblwiLCBwYXJhbXM6IHsgYW1vdW50OiAwLjA3IH0gfSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKVxuICAgICAgKX1cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uRklMTCxcbiAgICAgICAgICAuLi4obW9ycGggJiYge1xuICAgICAgICAgICAgLy8gTWlkLWNoYW5nZSwgd2hhdGV2ZXIgaXMgbGl2ZSB1bmRlcm5lYXRoIGtlZXBzIG1vdmluZy5cbiAgICAgICAgICAgIGNhY2hlOiBcIm5ldmVyXCIsXG4gICAgICAgICAgICAvLyBXaXRoIFVJIGdsaXRjaGVzIG9mZiAoSU5URVJGQUNFIHNldHRpbmdzKSwgc2NyZWVucyBjcm9zcy1mYWRlLlxuICAgICAgICAgICAgbW9ycGhGaWx0ZXI6IHNldHRpbmdzLnVpR2xpdGNoXG4gICAgICAgICAgICAgID8geyBrZXk6IG1vcnBoLCBuYW1lOiBcImdsaXRjaFN3YXBcIiB9XG4gICAgICAgICAgICAgIDogeyBrZXk6IG1vcnBoLCBuYW1lOiBcImNyb3NzZmFkZVwiLCBwYXJhbXM6IHsgc3ByZWFkOiAwIH0gfSxcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHtcbiAgICAgICAgICAgICAgbW9ycGhGaWx0ZXI6IHsgZHVyYXRpb246IE1PUlBIX01TLCBlYXNpbmc6IFwibGluZWFyXCIgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtzY3JlZW4gPT09IFwic3BsYXNoXCIgJiYgPFNwbGFzaCBvbkRvbmU9eygpID0+IGdvKFwidGl0bGVcIil9IC8+fVxuICAgICAgICB7c2NyZWVuID09PSBcInRpdGxlXCIgJiYgPFRpdGxlIG9uQ29udGludWU9e21lbnV9IC8+fVxuICAgICAgICB7c2NyZWVuID09PSBcIm1lbnVcIiAmJiAoXG4gICAgICAgICAgPE1haW5NZW51XG4gICAgICAgICAgICBlbnRyaWVzPXtpbkdhbWUgPyBQQVVTRSA6IE1BSU59XG4gICAgICAgICAgICBvblBpY2s9e3BpY2t9XG4gICAgICAgICAgICBvbkJhY2s9e2luR2FtZSA/ICgpID0+IGdvKFwiZ2FtZVwiKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIHZlcnNpb249XCIwLjcuMFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgICAge3NjcmVlbiA9PT0gXCJuZXdnYW1lXCIgJiYgKFxuICAgICAgICAgIDxOZXdHYW1lXG4gICAgICAgICAgICBjaGFyYWN0ZXI9e2NoYXJhY3Rlcn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRDaGFyYWN0ZXJ9XG4gICAgICAgICAgICBvbkJhY2s9e21lbnV9XG4gICAgICAgICAgICBvblN0YXJ0PXtzdGFydH1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICB7KHNjcmVlbiA9PT0gXCJsb2FkXCIgfHwgc2NyZWVuID09PSBcInNhdmVcIikgJiYgKFxuICAgICAgICAgIDxTYXZlc1xuICAgICAgICAgICAgbW9kZT17c2NyZWVufVxuICAgICAgICAgICAgc2F2ZXM9e3NhdmVzfVxuICAgICAgICAgICAgaW5HYW1lPXtpbkdhbWV9XG4gICAgICAgICAgICBvbkxvYWQ9e2xvYWR9XG4gICAgICAgICAgICBvblNhdmU9e3NhdmV9XG4gICAgICAgICAgICBvbkRlbGV0ZT17KHMpID0+IHNldFNhdmVzKHNhdmVzLmZpbHRlcigoeCkgPT4geC5pZCAhPT0gcy5pZCkpfVxuICAgICAgICAgICAgb25DbG9zZT17bWVudX1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICB7c2NyZWVuID09PSBcInNldHRpbmdzXCIgJiYgPFNldHRpbmdzIG9uQ2xvc2U9e21lbnV9IC8+fVxuICAgICAgICB7c2NyZWVuID09PSBcImNyZWRpdHNcIiAmJiA8Q3JlZGl0cyBvbkNsb3NlPXttZW51fSAvPn1cbiAgICAgICAge3NjcmVlbiA9PT0gXCJsb2FkaW5nXCIgJiYgZ2FtZSAmJiAoXG4gICAgICAgICAgPExvYWRpbmdcbiAgICAgICAgICAgIGxpZmVwYXRoPXtnYW1lLmNoYXJhY3Rlci5saWZlcGF0aH1cbiAgICAgICAgICAgIG9uRG9uZT17KCkgPT4gZ28oXCJnYW1lXCIsICgpID0+IHNldEluR2FtZSh0cnVlKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgICAge3NjcmVlbiA9PT0gXCJnYW1lXCIgJiYgKFxuICAgICAgICAgIDxHYW1lSHVkIG9uUGF1c2U9eygpID0+IGdvKFwibWVudVwiKX0gZ2FtZT17Z2FtZSA/PyB1bmRlZmluZWR9IC8+XG4gICAgICAgICl9XG4gICAgICAgIHtkaWFsb2cgJiYgKFxuICAgICAgICAgIDxDb25maXJtXG4gICAgICAgICAgICB0ZXh0PXtkaWFsb2cudGV4dH1cbiAgICAgICAgICAgIG9uQ29uZmlybT17ZGlhbG9nLm9uQ29uZmlybX1cbiAgICAgICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBzZXREaWFsb2cobnVsbCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIHtkZWJ1Z1BvcnRhbCAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3sgLi4uRklMTCwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxwb3J0YWxcbiAgICAgICAgICAgIHRhcmdldD17ZGVidWdQb3J0YWxbMF19XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogTnVtYmVyKGRlYnVnUG9ydGFsWzFdID8/IDY0MCksXG4gICAgICAgICAgICAgIGhlaWdodDogTnVtYmVyKGRlYnVnUG9ydGFsWzJdID8/IDM2MCksXG4gICAgICAgICAgICAgIGNhY2hlOiBcIm5ldmVyXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICl9XG4gICAgICB7c2V0dGluZ3Muc2NhbmxpbmVzICYmIChcbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uRklMTCwgYmFja2dyb3VuZEltYWdlOiBTQ0FOTElORVMgfX0gLz5cbiAgICAgICl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogTm93LCBhcyB0aGUgc2F2ZSBsaXN0IHNob3dzIGl0OiBcIjEwLzA3LzkxLCA5OjEyIFBNXCIgKHRoZSBnYW1lJ3MgeWVhcikuICovXG5mdW5jdGlvbiBzdGFtcCgpIHtcbiAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGggPSBkLmdldEhvdXJzKCkgJSAxMiB8fCAxMjtcbiAgY29uc3QgbSA9IGQuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBhbXBtID0gZC5nZXRIb3VycygpIDwgMTIgPyBcIkFNXCIgOiBcIlBNXCI7XG4gIGNvbnN0IG1tID0gKGQuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBkZCA9IGQuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICByZXR1cm4gYCR7bW19LyR7ZGR9LzkxLCAke2h9OiR7bX0gJHthbXBtfWA7XG59XG4iLCAiLy8gQGdlbmVyYXRlZCBieSBiZXZ5LXJlYWN0IOKAlCBkbyBub3QgZWRpdCBieSBoYW5kLlxuLy8gTWlycm9ycyB0aGUgUnVzdCBgI1tyZWFjdF9tZXNzYWdlXWAgLyBgI1tyZWFjdF9yZXF1ZXN0XWAgLyBgI1tyZWFjdF9ldmVudF1gXG4vLyB0eXBlcyBhbmQgdGhlIHJlZ2lzdGVyZWQgYCNbcmVhY3RfZmlsdGVyXWBzIC8gYCNbcmVhY3RfbW9ycGhfZmlsdGVyXWBzIChwbHVzXG4vLyBidWlsdC1pbnMpLiBSZWdlbmVyYXRlIHZpYSB5b3VyIGFwcCdzIGBBcHA6OmV4cG9ydF9yZWFjdF90eXBlc2NyaXB0YCBleHBvcnRlci5cblxuaW1wb3J0IHtcbiAgZW1pdCBhcyByYXdFbWl0LFxuICByZXF1ZXN0IGFzIHJhd1JlcXVlc3QsXG4gIGFkZEV2ZW50TGlzdGVuZXIgYXMgcmF3QWRkRXZlbnRMaXN0ZW5lcixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lciBhcyByYXdSZW1vdmVFdmVudExpc3RlbmVyLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUsIFJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBBbmNob3JTY2FsaW5nLCBBbmltYXRhYmxlLCBCZXZ5QXR0cmlidXRlcywgQmV2eUNhbnZhc0VsZW1lbnQsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVNoYXBlVHJhbnNpdGlvbiwgQmV2eVN0eWxlLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5V2hlZWxQcm9wcywgQ2FudmFzUGFpbnRlciwgRHJhd0NtZCwgVmVjMyB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5cbmV4cG9ydCB0eXBlIEFjdCA9IHsgYWN0aW9uOiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBCbG9vbVBhcmFtcyA9IHsgcmFkaXVzOiBudW1iZXIgfCBzdHJpbmcsIHRocmVzaG9sZDogbnVtYmVyLCBpbnRlbnNpdHk6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEJsdXJQYXJhbXMgPSB7IHJhZGl1czogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgQnJpZ2h0bmVzc1BhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBDYW52YXNTaXplID0geyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENocm9tYXRpY0FiZXJyYXRpb25QYXJhbXMgPSB7IG9mZnNldDogbnVtYmVyIHwgc3RyaW5nLCBhbmdsZTogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogVGFuZ2VudGlhbCBzd2lybDogdGhlIFIgaW1hZ2Ugcm90YXRlcyBieSBgK3JvdGF0aW9uYCBkZWdyZWVzXG4gKiAoY2xvY2t3aXNlLCB5LWRvd24pIGFyb3VuZCB0aGUgbm9kZSdzIGNlbnRlciwgQiBieSBgLXJvdGF0aW9uYC5cbiAqIFBsYWluIG51bWJlciBpbiBkZWdyZWVzIOKAlCBhIHNjYWxhciBtYWduaXR1ZGUsIHNvIHRyYW5zaXRpb25zIHVud2luZFxuICogbGluZWFybHkgdGhyb3VnaCBldmVyeSB0dXJuLiAwID0gcHVyZWx5IGRpcmVjdGlvbmFsIHNwbGl0LlxuICovXG5yb3RhdGlvbjogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ29udHJhc3RQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ3Jvc3NmYWRlUGFyYW1zID0geyBcbi8qKlxuICogMC4uMSBzdGFnZ2VyIGFtb3VudDsgMCBpcyB0aGUgcGxhaW4gdW5pZm9ybSBjcm9zc2ZhZGUuXG4gKi9cbnNwcmVhZDogbnVtYmVyLCBcbi8qKlxuICogTm9pc2UgZmVhdHVyZSBzaXplIGluIGxvZ2ljYWwgcHguXG4gKi9cbnNjYWxlOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiAwLi4xIGxvY2FsIGZhZGUgd2luZG93IChmcmFjdGlvbiBvZiB0aGUgcHJvZ3Jlc3MgcmFuZ2UpLlxuICovXG5zb2Z0bmVzczogbnVtYmVyLCBcbi8qKlxuICogUmUtcm9sbHMgdGhlIG5vaXNlIHBhdHRlcm4gKGRvbWFpbiBvZmZzZXQpLlxuICovXG5zZWVkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQXhpc0NoYW5nZSA9IHsgZ2FtZXBhZDogbnVtYmVyLCBheGlzOiBHYW1lcGFkQXhpc05hbWUsIHZhbHVlOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQXhpc05hbWUgPSBcImxlZnRTdGlja1hcIiB8IFwibGVmdFN0aWNrWVwiIHwgXCJsZWZ0WlwiIHwgXCJyaWdodFN0aWNrWFwiIHwgXCJyaWdodFN0aWNrWVwiIHwgXCJyaWdodFpcIiB8IHsgXCJvdGhlclwiOiBudW1iZXIgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRCdXR0b25DaGFuZ2UgPSB7IGdhbWVwYWQ6IG51bWJlciwgYnV0dG9uOiBHYW1lcGFkQnV0dG9uTmFtZSwgXG4vKipcbiAqIERpZ2l0YWwgc3RhdGUgYWZ0ZXIgdGhlIGNoYW5nZSAodGhyZXNob2xkcyBmcm9tIGBHYW1lcGFkU2V0dGluZ3NgKS5cbiAqL1xucHJlc3NlZDogYm9vbGVhbiwgXG4vKipcbiAqIEFuYWxvZyB2YWx1ZSBpbiBgMC4wLi49MS4wYCAodHJpZ2dlcnMgcmVwb3J0IHRoZSBmdWxsIHJhbmdlKS5cbiAqL1xudmFsdWU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRCdXR0b25OYW1lID0gXCJzb3V0aFwiIHwgXCJlYXN0XCIgfCBcIm5vcnRoXCIgfCBcIndlc3RcIiB8IFwiY1wiIHwgXCJ6XCIgfCBcImxlZnRUcmlnZ2VyXCIgfCBcImxlZnRUcmlnZ2VyMlwiIHwgXCJyaWdodFRyaWdnZXJcIiB8IFwicmlnaHRUcmlnZ2VyMlwiIHwgXCJzZWxlY3RcIiB8IFwic3RhcnRcIiB8IFwibW9kZVwiIHwgXCJsZWZ0VGh1bWJcIiB8IFwicmlnaHRUaHVtYlwiIHwgXCJkUGFkVXBcIiB8IFwiZFBhZERvd25cIiB8IFwiZFBhZExlZnRcIiB8IFwiZFBhZFJpZ2h0XCIgfCB7IFwib3RoZXJcIjogbnVtYmVyIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQ29ubmVjdGVkID0gR2FtZXBhZENvbm5lY3RlZERhdGE7XG5leHBvcnQgdHlwZSBHYW1lcGFkQ29ubmVjdGVkRGF0YSA9IHsgXG4vKipcbiAqIE1vbm90b25pYyB3aXJlIGlkIOKAlCBuZXZlciByZXVzZWQgYWNyb3NzIHJlY29ubmVjdHMuXG4gKi9cbmdhbWVwYWQ6IG51bWJlciwgXG4vKipcbiAqIE9TLXByb3ZpZGVkIGRldmljZSBuYW1lLlxuICovXG5uYW1lOiBzdHJpbmcsIFxuLyoqXG4gKiBVU0IgdmVuZG9yIGlkLCB3aGVuIHRoZSBiYWNrZW5kIGtub3dzIGl0LlxuICovXG52ZW5kb3JJZDogbnVtYmVyIHwgbnVsbCwgXG4vKipcbiAqIFVTQiBwcm9kdWN0IGlkLCB3aGVuIHRoZSBiYWNrZW5kIGtub3dzIGl0LlxuICovXG5wcm9kdWN0SWQ6IG51bWJlciB8IG51bGwsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkRGlzY29ubmVjdGVkID0gR2FtZXBhZERpc2Nvbm5lY3RlZERhdGE7XG5leHBvcnQgdHlwZSBHYW1lcGFkRGlzY29ubmVjdGVkRGF0YSA9IHsgXG4vKipcbiAqIFRoZSB3aXJlIGlkIHRoZSBwYWQgd2FzIGFubm91bmNlZCB1bmRlci4gUmV0aXJlZCBmb3IgZ29vZC5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZElucHV0RGF0YSA9IHsgYnV0dG9uczogQXJyYXk8R2FtZXBhZEJ1dHRvbkNoYW5nZT4sIGF4ZXM6IEFycmF5PEdhbWVwYWRBeGlzQ2hhbmdlPiwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRJbnB1dEV2ZW50ID0gR2FtZXBhZElucHV0RGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRSdW1ibGUgPSB7IFxuLyoqXG4gKiBXaXJlIGlkIGZyb20gW2BHYW1lcGFkQ29ubmVjdGVkYF0uXG4gKi9cbmdhbWVwYWQ6IG51bWJlciwgXG4vKipcbiAqIE1pbGxpc2Vjb25kcyAod2ViLWBwbGF5RWZmZWN0YC1saWtlKS4gTmVnYXRpdmUgdmFsdWVzIGNsYW1wIHRvIDAuXG4gKi9cbmR1cmF0aW9uOiBudW1iZXIsIFxuLyoqXG4gKiBMb3ctZnJlcXVlbmN5IG1vdG9yIGludGVuc2l0eSwgY2xhbXBlZCB0byBgMC4wLi49MS4wYC5cbiAqL1xuc3Ryb25nTW90b3I6IG51bWJlciwgXG4vKipcbiAqIEhpZ2gtZnJlcXVlbmN5IG1vdG9yIGludGVuc2l0eSwgY2xhbXBlZCB0byBgMC4wLi49MS4wYC5cbiAqL1xud2Vha01vdG9yOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkU3RvcFJ1bWJsZSA9IHsgZ2FtZXBhZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtbWEgPSB7IFxuLyoqXG4gKiAxID0gdW5jaGFuZ2VkOyBhYm92ZSAxIGJyaWdodGVyLlxuICovXG52YWx1ZTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtbWFTZXR0aW5ncyA9IHsgXG4vKipcbiAqIDEgPSB1bmNoYW5nZWQ7IGFib3ZlIDEgbGlmdHMgdGhlIGRhcmtzLCBiZWxvdyBzaW5rcyB0aGVtLlxuICovXG52YWx1ZTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2xpdGNoID0geyBcbi8qKlxuICogSG93IGJyb2tlbiB0aGUgc2lnbmFsIGlzLCAwLi4xLlxuICovXG5pbnRlbnNpdHk6IG51bWJlciwgXG4vKipcbiAqIDAgPSBnbGl0Y2hpbmcgYWxsIHRoZSB0aW1lOyBhYm92ZSAwLCB0aGUgY2hhbmNlIGEgcXVhcnRlciBzZWNvbmRcbiAqIGdsaXRjaGVzIChidXJzdHMpLlxuICovXG5mcmVxdWVuY3k6IG51bWJlciwgXG4vKipcbiAqIEhvdyBmYXIgdGhlIGNoYW5uZWxzIHNwbGl0IGF0IGZ1bGwgaW50ZW5zaXR5LCBweC5cbiAqL1xuc3BsaXQ6IG51bWJlciB8IHN0cmluZywgXG4vKipcbiAqIEhvdyBmYXIgYSB0b3JuIHNsaWNlIG1vdmVzIGF0IGZ1bGwgaW50ZW5zaXR5LCBweCAo4omkIDMyKS5cbiAqL1xudGVhcjogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogRGVjb3JyZWxhdGVzIGdsaXRjaGVzIHRoYXQgcnVuIHNpZGUgYnkgc2lkZS5cbiAqL1xuc2VlZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2xpdGNoU3dhcCA9IHsgXG4vKipcbiAqIEhvdyBmYXIgdGhlIGNoYW5uZWxzIHNwbGl0IGF0IHRoZSBtaWRwb2ludCwgcHguXG4gKi9cbnNwbGl0OiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiBUaGUgY29sb3Igb2YgdGhlIGZsYXNoaW5nIGJhbmRzIChhbHBoYSA9IGhvdyBzdHJvbmcpLlxuICovXG50aW50OiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBHcmFkaWVudE1hcFBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc3RvcHM6IEFycmF5PEdyYWRpZW50TWFwU3RvcD4sIGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR3JhZGllbnRNYXBTdG9wID0geyBjb2xvcjogc3RyaW5nLCBwb3NpdGlvbj86IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYWluID0geyBcbi8qKlxuICogSG93IHN0cm9uZyB0aGUgc3Ryb25nZXN0IGdyYWlucyBhcmUsIDAuLjEuXG4gKi9cbmFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR3JhcGhpY3NTZXR0aW5ncyA9IHsgXG4vKipcbiAqIFZlcnRpY2FsIGZpZWxkIG9mIHZpZXcsIGRlZ3JlZXMuXG4gKi9cbmZvdjogbnVtYmVyLCBhYmVycmF0aW9uOiBib29sZWFuLCBcbi8qKlxuICogRGVwdGggb2YgZmllbGQuXG4gKi9cbmZvY3VzOiBib29sZWFuLCBcbi8qKlxuICogTGVucyBmbGFyZTogdGhlIGJsb29tLlxuICovXG5mbGFyZTogYm9vbGVhbiwgXG4vKipcbiAqIE1vdGlvbiBibHVyOiAwID0gb2ZmLCAxID0gbG93LCAyID0gaGlnaC5cbiAqL1xuYmx1cjogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR3JheXNjYWxlUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEh1ZVJvdGF0ZVBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIEludmVydFBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBLZXlEb3duID0gS2V5Ym9hcmRFdmVudERhdGE7XG5leHBvcnQgdHlwZSBLZXlVcCA9IEtleWJvYXJkRXZlbnREYXRhO1xuZXhwb3J0IHR5cGUgS2V5Ym9hcmRFdmVudERhdGEgPSB7IFxuLyoqXG4gKiBMYXlvdXQtYXdhcmUgbG9naWNhbCBrZXk6IHRoZSB0eXBlZCBjaGFyYWN0ZXIgKGBcImFcImAsIGBcIkFcImApIG9yIGEgbmFtZWRcbiAqIGtleSAoYFwiRW50ZXJcImAsIGBcIkFycm93TGVmdFwiYCwgYFwiRXNjYXBlXCJgKS5cbiAqL1xua2V5OiBzdHJpbmcsIFxuLyoqXG4gKiBMYXlvdXQtaW5kZXBlbmRlbnQgcGh5c2ljYWwga2V5LCBXM0MgYGNvZGVgIHN0eWxlIChgXCJLZXlBXCJgLCBgXCJFbnRlclwiYCkuXG4gKi9cbmNvZGU6IHN0cmluZywgXG4vKipcbiAqIFRoZSB0ZXh0IHByb2R1Y2VkIGJ5IHRoZSBrZXksIGlmIGFueSAocmVzcGVjdHMgbW9kaWZpZXJzL0lNRSkuIGBudWxsYCBmb3JcbiAqIGtleXMgdGhhdCBkb24ndCBwcm9kdWNlIHRleHQgKGUuZy4gYXJyb3dzLCBtb2RpZmllcnMpLlxuICovXG50ZXh0OiBzdHJpbmcgfCBudWxsLCBcbi8qKlxuICogV2hldGhlciB0aGlzIGlzIGFuIE9TIGF1dG8tcmVwZWF0IHdoaWxlIHRoZSBrZXkgaXMgaGVsZC5cbiAqL1xucmVwZWF0OiBib29sZWFuLCBjdHJsS2V5OiBib29sZWFuLCBzaGlmdEtleTogYm9vbGVhbiwgYWx0S2V5OiBib29sZWFuLCBcbi8qKlxuICogVGhlIFwiTWV0YVwiL1wiU3VwZXJcIiBrZXkgKFdpbmRvd3MvQ29tbWFuZCkuXG4gKi9cbm1ldGFLZXk6IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBMaW5lYXJXaXBlUGFyYW1zID0geyBhbmdsZTogbnVtYmVyIHwgc3RyaW5nLCBzb2Z0bmVzczogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgT3V0bGluZVBhcmFtcyA9IHsgd2lkdGg6IG51bWJlciB8IHN0cmluZywgY29sb3I6IHN0cmluZywgc29mdG5lc3M6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIFBpbmNoUGFyYW1zID0geyBcbi8qKlxuICogUGluY2ggY2VudGVyLCAwLi4xIGFjcm9zcyB0aGUgbm9kZSByZWN0ICgwID0gbGVmdCBlZGdlKS5cbiAqL1xueDogbnVtYmVyLCBcbi8qKlxuICogUGluY2ggY2VudGVyLCAwLi4xIGFjcm9zcyB0aGUgbm9kZSByZWN0ICgwID0gdG9wIGVkZ2UpLlxuICovXG55OiBudW1iZXIsIFxuLyoqXG4gKiAtMSAoZnVsbCBidWxnZSkgLi49IDEgKGZ1bGwgcGluY2gpOyAwIGlzIGlkZW50aXR5LlxuICovXG5zdHJlbmd0aDogbnVtYmVyLCBcbi8qKlxuICogRWZmZWN0IHJhZGl1cyBhcyBhIGZyYWN0aW9uIG9mIHRoZSBub2RlJ3MgbGFyZ2VyIGRpbWVuc2lvbi5cbiAqL1xucmFkaXVzOiBudW1iZXIsIFxuLyoqXG4gKiBEaWZmdXNlIHNoYWRpbmcgaW50ZW5zaXR5OiAwICh1bmxpdCwgdGhlIGRlZmF1bHQpLCAxIG5vbWluYWw7IGxhcmdlclxuICogdmFsdWVzIG92ZXJkcml2ZSwgbGlrZSBgYnJpZ2h0bmVzc2AuXG4gKi9cbmxpZ2h0OiBudW1iZXIsIFxuLyoqXG4gKiBEaXJlY3Rpb24gdGhlIGxpZ2h0IGNvbWVzIEZST006IGRlZ3JlZXMgY2xvY2t3aXNlIGZyb20gK1ggaW4gc2NyZWVuXG4gKiBzcGFjZSAoYmFyZSBudW1iZXIgPSBkZWdyZWVzLCBgXCIwLjI1dHVyblwiYCBldGMuIGFjY2VwdGVkKS4gRGVmYXVsdFxuICogLTEzNSA9IHRvcC1sZWZ0LlxuICovXG5saWdodEFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiBTcGVjdWxhciAod2hpdGUpIGhpZ2hsaWdodCBpbnRlbnNpdHk6IDAgKG9mZiwgdGhlIGRlZmF1bHQpLCAxXG4gKiBub21pbmFsOyBsYXJnZXIgdmFsdWVzIG92ZXJkcml2ZS5cbiAqL1xuZ2xvc3M6IG51bWJlciwgXG4vKipcbiAqIFNpemUgb2YgdGhlIHNwZWN1bGFyIGhpZ2hsaWdodCwgMCAoYSBwaW5wb2ludCkgLi49IDEgKGEgYnJvYWQgc2hlZW4pO1xuICogZGVmYXVsdCAwLjMuIE1hcHBlZCBsb2ctd2lzZSBvbnRvIGEgQmxpbm4tUGhvbmcgZXhwb25lbnQgaW4gdGhlIHNoYWRlclxuICogKDEyOCBhdCAwLCB+MzIgYXQgMC4zLCAxIGF0IDEpLlxuICovXG5nbG9zc1NpemU6IG51bWJlciwgXG4vKipcbiAqIEhvdyB0aGUgZWZmZWN0IG1lZXRzIGl0cyByaW0sIDAuLj0xOiAwIGlzIGEgbGluZWFyIG9uc2V0IChhIHZpc2libGVcbiAqIGNyZWFzZSwgbGlrZSBhIHByZXNzZWQgY29pbiBlZGdlKSwgMC41ICh0aGUgZGVmYXVsdCkgdGhlIGNsYXNzaWMgYHVeMmBcbiAqIHNtb290aHN0ZXAtbGlrZSBmYWRlLCAxIGFuIGltcGVyY2VwdGlibGUgYHVeNGAgZmFkZS1pbi5cbiAqL1xub3V0ZXJTb2Z0bmVzczogbnVtYmVyLCBcbi8qKlxuICogSG93IHRoZSBlZmZlY3QgcGVha3MgYXQgaXRzIGNlbnRlciwgMC4uPTE6IDAgaXMgYSBjb25lIHRpcCAoYSBwb2ludGVkXG4gKiBwaXQvcGVhayB0aGUgbGlnaHRpbmcgc2hvd3MgYXMgYSBwb2ludCksIDAuNSAodGhlIGRlZmF1bHQpIGEgcm91bmRlZFxuICogYm93bCwgMSBhIGJyb2FkIGZsYXQgZmxvb3IuIEluZGVwZW5kZW50IG9mIGBvdXRlclNvZnRuZXNzYDogdGhlXG4gKiBwcm9maWxlIGlzIGAxIC0gKDEgLSB1XmEpXmJgIHdpdGggYGFgL2BiYCBmcm9tIHRoZSB0d28ga25vYnMuXG4gKi9cbmlubmVyU29mdG5lc3M6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFBpeGVsaXplUGFyYW1zID0geyBcbi8qKlxuICogQ2VsbHMgYWNyb3NzIHgveSBhdCB0aGUgbW9zYWljJ3MgY29hcnNlc3QgKHVwc3RyZWFtIGBzcXVhcmVzTWluYCkuXG4gKi9cbnNxdWFyZXNNaW46IFtudW1iZXIsIG51bWJlcl0sIFxuLyoqXG4gKiBEaXNjcmV0ZSBjZWxsLXNpemUgbGV2ZWxzOyBgPD0gMGAgZm9yIGEgY29udGludW91cyByYW1wLlxuICovXG5zdGVwczogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgUGxheSA9IHsgbmFtZTogc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgUXVpdCA9IG51bGw7XG5leHBvcnQgdHlwZSBSZXNpemUgPSBXaW5kb3dTaXplO1xuZXhwb3J0IHR5cGUgU2F0dXJhdGVQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgU2VwaWFQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgU2V0RGlmZmljdWx0eSA9IHsgbGV2ZWw6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNldFdvcmxkID0geyBsaWZlcGF0aDogc3RyaW5nIHwgbnVsbCwgfTtcbmV4cG9ydCB0eXBlIFNoYWRvd1BhcmFtcyA9IHsgY29sb3I6IHN0cmluZywgb2Zmc2V0WDogbnVtYmVyIHwgc3RyaW5nLCBvZmZzZXRZOiBudW1iZXIgfCBzdHJpbmcsIHNwcmVhZDogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgVmlkZW9TZXR0aW5ncyA9IHsgXG4vKipcbiAqIDAgPSB3aW5kb3dlZCwgMSA9IGJvcmRlcmxlc3MsIDIgPSBmdWxsc2NyZWVuLlxuICovXG5tb2RlOiBudW1iZXIsIFxuLyoqXG4gKiBUaGUgd2luZG93ZWQgc2l6ZSwgcGh5c2ljYWwgcHguXG4gKi9cbndpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB2c3luYzogYm9vbGVhbiwgfTtcbmV4cG9ydCB0eXBlIFZvbHVtZSA9IHsgbWFzdGVyOiBudW1iZXIsIHNmeDogbnVtYmVyLCBtdXNpYzogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgV2luZG93U2l6ZSA9IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIH07XG5cbi8qKiBFdmVyeSBgZW1pdGAgbmFtZSBhbmQgdGhlIHBheWxvYWQgdHlwZSBpdCBjYXJyaWVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFjdE1lc3NhZ2VzIHtcbiAgXCJhcHAucXVpdFwiOiBRdWl0O1xuICBcImRpb3JhbWFzLmRpZmZpY3VsdHlcIjogU2V0RGlmZmljdWx0eTtcbiAgXCJkaW9yYW1hcy53b3JsZFwiOiBTZXRXb3JsZDtcbiAgXCJnYW1lcGFkLnJ1bWJsZVwiOiBHYW1lcGFkUnVtYmxlO1xuICBcImdhbWVwYWQuc3RvcFJ1bWJsZVwiOiBHYW1lcGFkU3RvcFJ1bWJsZTtcbiAgXCJzZXR0aW5ncy5nYW1tYVwiOiBHYW1tYVNldHRpbmdzO1xuICBcInNldHRpbmdzLmdyYXBoaWNzXCI6IEdyYXBoaWNzU2V0dGluZ3M7XG4gIFwic2V0dGluZ3MudmlkZW9cIjogVmlkZW9TZXR0aW5ncztcbiAgXCJzb3VuZC5wbGF5XCI6IFBsYXk7XG4gIFwic291bmQudm9sdW1lXCI6IFZvbHVtZTtcbn1cblxuLyoqIEV2ZXJ5IGByZXF1ZXN0YCBuYW1lIGFuZCBpdHMgcmVxdWVzdC9yZXNwb25zZSB0eXBlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RSZXF1ZXN0cyB7XG4gIFwiZ2FtZXBhZC5nZXRBbGxcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogQXJyYXk8R2FtZXBhZENvbm5lY3RlZERhdGE+IH07XG4gIFwid2luZG93LnNpemVcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogV2luZG93U2l6ZSB9O1xufVxuXG4vKiogRXZlcnkgQmV2eSDihpIgUmVhY3QgZXZlbnQgbmFtZSBhbmQgdGhlIHBheWxvYWQgaXQgY2Fycmllcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RFdmVudHMge1xuICBcImRlYnVnLmFjdFwiOiBBY3Q7XG4gIGdhbWVwYWRDb25uZWN0ZWQ6IEdhbWVwYWRDb25uZWN0ZWQ7XG4gIGdhbWVwYWREaXNjb25uZWN0ZWQ6IEdhbWVwYWREaXNjb25uZWN0ZWQ7XG4gIGdhbWVwYWRJbnB1dDogR2FtZXBhZElucHV0RXZlbnQ7XG4gIGtleURvd246IEtleURvd247XG4gIGtleVVwOiBLZXlVcDtcbiAgcmVzaXplOiBSZXNpemU7XG59XG5cbi8qKiBFdmVyeSByZWdpc3RlcmVkIGZpbHRlciBuYW1lIGFuZCBpdHMgcGFyYW1zIHR5cGUsIHNwbGl0IGJ5IGZhbWlseS5cbiAqICBBdWdtZW50cyB0aGUgZW1wdHkgYEJldnlGaWx0ZXJzYCAocmVndWxhciBmaWx0ZXJzIOKAlCB0aGUgYGZpbHRlcmAgYW5kXG4gKiAgYGJhY2tkcm9wRmlsdGVyYCBjaGFpbnMpIGFuZCBgQmV2eU1vcnBoRmlsdGVyc2AgKHR3by1pbnB1dCBtb3JwaFxuICogIGZpbHRlcnMg4oCUIHRoZSBgbW9ycGhGaWx0ZXJgIHN0eWxlKSByZWdpc3RyeSBpbnRlcmZhY2VzIGluIHRoZVxuICogIGBiZXZ5LXJlYWN0YCBwYWNrYWdlLCBzbyBlYWNoIHN0eWxlIGZpZWxkIHR5cGVzIGl0cyBuYW1lcycgcGFyYW1zLiAqL1xuZGVjbGFyZSBtb2R1bGUgXCJiZXZ5LXJlYWN0XCIge1xuICBpbnRlcmZhY2UgQmV2eUZpbHRlcnMge1xuICAgIGJsb29tOiBCbG9vbVBhcmFtcztcbiAgICBibHVyOiBCbHVyUGFyYW1zO1xuICAgIGJyaWdodG5lc3M6IEJyaWdodG5lc3NQYXJhbXM7XG4gICAgY2hyb21hdGljQWJlcnJhdGlvbjogQ2hyb21hdGljQWJlcnJhdGlvblBhcmFtcztcbiAgICBjb250cmFzdDogQ29udHJhc3RQYXJhbXM7XG4gICAgZ2FtbWE6IEdhbW1hO1xuICAgIGdsaXRjaDogR2xpdGNoO1xuICAgIGdyYWRpZW50TWFwOiBHcmFkaWVudE1hcFBhcmFtcztcbiAgICBncmFpbjogR3JhaW47XG4gICAgZ3JheXNjYWxlOiBHcmF5c2NhbGVQYXJhbXM7XG4gICAgaHVlUm90YXRlOiBIdWVSb3RhdGVQYXJhbXM7XG4gICAgaW52ZXJ0OiBJbnZlcnRQYXJhbXM7XG4gICAgb3V0bGluZTogT3V0bGluZVBhcmFtcztcbiAgICBwaW5jaDogUGluY2hQYXJhbXM7XG4gICAgc2F0dXJhdGU6IFNhdHVyYXRlUGFyYW1zO1xuICAgIHNlcGlhOiBTZXBpYVBhcmFtcztcbiAgICBzaGFkb3c6IFNoYWRvd1BhcmFtcztcbiAgfVxuICBpbnRlcmZhY2UgQmV2eU1vcnBoRmlsdGVycyB7XG4gICAgY3Jvc3NmYWRlOiBDcm9zc2ZhZGVQYXJhbXM7XG4gICAgZ2xpdGNoU3dhcDogR2xpdGNoU3dhcDtcbiAgICBsaW5lYXJXaXBlOiBMaW5lYXJXaXBlUGFyYW1zO1xuICAgIHBpeGVsaXplOiBQaXhlbGl6ZVBhcmFtcztcbiAgfVxufVxuXG4vKiogVGhlIGFwcCdzIG93biBlbGVtZW50cycgcHJvcHMgKGBhcHAuYWRkX3JlYWN0X2VsZW1lbnRgKS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUFuY2hvclByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgZW50aXR5OiBudW1iZXIgfCBiaWdpbnQ7XG4gIG9mZnNldD86IFZlYzM7XG4gIHNjYWxlPzogQW5jaG9yU2NhbGluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUNhbnZhc1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgZHJhdz86IENhbnZhc1BhaW50ZXIgfCBEcmF3Q21kW107XG4gIG9uUmVzaXplPzogKHBheWxvYWQ6IENhbnZhc1NpemUpID0+IHZvaWQ7XG4gIHJlZj86IFJlZjxCZXZ5Q2FudmFzRWxlbWVudD47XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlDaXJjbGVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgY3g/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGN5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5RWxsaXBzZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBjeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgY3k/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHJ4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUdQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzIHtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUxpbmVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgeDE/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHkxPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB4Mj86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgeTI/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQYXRoUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIGQ/OiBzdHJpbmc7XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb2x5Z29uUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIHBvaW50cz86IG51bWJlcltdO1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UG9seWxpbmVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgcG9pbnRzPzogbnVtYmVyW107XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb3J0YWxQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UmVjdFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICB4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB3aWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgaGVpZ2h0PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcnk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlTdXJmYWNlUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVN2Z1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgdmlld0JveD86IHN0cmluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbi8qKiBUaGUgYXBwJ3Mgb3duIGVsZW1lbnRzIChgYXBwLmFkZF9yZWFjdF9lbGVtZW50YCkuIEF1Z21lbnRzIHRoZVxuICogIGBCZXZ5SW50cmluc2ljRWxlbWVudHNgIGludGVyZmFjZSBpbiB0aGUgYGJldnktcmVhY3RgIHBhY2thZ2UsIHNvIEpTWFxuICogIHR5cGVzIHRoZW0uICovXG5kZWNsYXJlIG1vZHVsZSBcImJldnktcmVhY3RcIiB7XG4gIGludGVyZmFjZSBCZXZ5SW50cmluc2ljRWxlbWVudHMge1xuICAgIGFuY2hvcjogQmV2eUFuY2hvclByb3BzO1xuICAgIGNhbnZhczogQmV2eUNhbnZhc1Byb3BzO1xuICAgIGNpcmNsZTogQmV2eUNpcmNsZVByb3BzO1xuICAgIGVsbGlwc2U6IEJldnlFbGxpcHNlUHJvcHM7XG4gICAgZzogQmV2eUdQcm9wcztcbiAgICBsaW5lOiBCZXZ5TGluZVByb3BzO1xuICAgIHBhdGg6IEJldnlQYXRoUHJvcHM7XG4gICAgcG9seWdvbjogQmV2eVBvbHlnb25Qcm9wcztcbiAgICBwb2x5bGluZTogQmV2eVBvbHlsaW5lUHJvcHM7XG4gICAgcG9ydGFsOiBCZXZ5UG9ydGFsUHJvcHM7XG4gICAgcmVjdDogQmV2eVJlY3RQcm9wcztcbiAgICBzdXJmYWNlOiBCZXZ5U3VyZmFjZVByb3BzO1xuICAgIHN2ZzogQmV2eVN2Z1Byb3BzO1xuICB9XG59XG5cbi8qKiBTZW5kIGEgdHlwZWQgYXBwIG1lc3NhZ2UgdG8gdGhlIEJldnkgc2lkZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbWl0PEsgZXh0ZW5kcyBrZXlvZiBSZWFjdE1lc3NhZ2VzPihuYW1lOiBLLCB2YWx1ZTogUmVhY3RNZXNzYWdlc1tLXSk6IHZvaWQge1xuICByYXdFbWl0KG5hbWUsIHZhbHVlKTtcbn1cblxuLyoqIFNlbmQgYSB0eXBlZCByZXF1ZXN0IGFuZCBhd2FpdCBpdHMgdHlwZWQgcmVzcG9uc2UuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdDxLIGV4dGVuZHMga2V5b2YgUmVhY3RSZXF1ZXN0cz4oXG4gIG5hbWU6IEssXG4gIHZhbHVlOiBSZWFjdFJlcXVlc3RzW0tdW1wicmVxdWVzdFwiXSxcbik6IFByb21pc2U8UmVhY3RSZXF1ZXN0c1tLXVtcInJlc3BvbnNlXCJdPiB7XG4gIHJldHVybiByYXdSZXF1ZXN0KG5hbWUsIHZhbHVlKSBhcyBQcm9taXNlPFJlYWN0UmVxdWVzdHNbS11bXCJyZXNwb25zZVwiXT47XG59XG5cbi8qKiBTdWJzY3JpYmUgdG8gYSB0eXBlZCBCZXZ5IOKGkiBSZWFjdCBldmVudC4gUmV0dXJucyBhbiB1bnN1YnNjcmliZSBmbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbjxLIGV4dGVuZHMga2V5b2YgUmVhY3RFdmVudHM+KFxuICBuYW1lOiBLLFxuICBjYjogKHZhbHVlOiBSZWFjdEV2ZW50c1tLXSkgPT4gdm9pZCxcbik6ICgpID0+IHZvaWQge1xuICByYXdBZGRFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG4gIHJldHVybiAoKSA9PiByYXdSZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG59XG5cbi8qKiBVbnN1YnNjcmliZSBhIGxpc3RlbmVyIHByZXZpb3VzbHkgcGFzc2VkIHRvIGBvbmAvYGFkZEV2ZW50TGlzdGVuZXJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXI8SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgY2I6ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xufVxuXG4vKiogU3RydWN0dXJlZCwgZnVsbHkgdHlwZWQgcHJveHkgb3ZlciBldmVyeSBtZXNzYWdlLCByZXF1ZXN0LCBhbmQgZXZlbnQuICovXG5leHBvcnQgY29uc3QgYmV2eSA9IHtcbiAgZW1pdCxcbiAgcmVxdWVzdCxcbiAgb24sXG4gIGFkZEV2ZW50TGlzdGVuZXI6IG9uLFxuICByZW1vdmVFdmVudExpc3RlbmVyLFxuICBhcHA6IHtcbiAgICBxdWl0KHZhbHVlOiBRdWl0KTogdm9pZCB7IGVtaXQoXCJhcHAucXVpdFwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIGRpb3JhbWFzOiB7XG4gICAgZGlmZmljdWx0eSh2YWx1ZTogU2V0RGlmZmljdWx0eSk6IHZvaWQgeyBlbWl0KFwiZGlvcmFtYXMuZGlmZmljdWx0eVwiLCB2YWx1ZSk7IH0sXG4gICAgd29ybGQodmFsdWU6IFNldFdvcmxkKTogdm9pZCB7IGVtaXQoXCJkaW9yYW1hcy53b3JsZFwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIGdhbWVwYWQ6IHtcbiAgICBnZXRBbGwoKTogUHJvbWlzZTxBcnJheTxHYW1lcGFkQ29ubmVjdGVkRGF0YT4+IHsgcmV0dXJuIHJlcXVlc3QoXCJnYW1lcGFkLmdldEFsbFwiLCBudWxsKTsgfSxcbiAgICBydW1ibGUodmFsdWU6IEdhbWVwYWRSdW1ibGUpOiB2b2lkIHsgZW1pdChcImdhbWVwYWQucnVtYmxlXCIsIHZhbHVlKTsgfSxcbiAgICBzdG9wUnVtYmxlKHZhbHVlOiBHYW1lcGFkU3RvcFJ1bWJsZSk6IHZvaWQgeyBlbWl0KFwiZ2FtZXBhZC5zdG9wUnVtYmxlXCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgc2V0dGluZ3M6IHtcbiAgICBnYW1tYSh2YWx1ZTogR2FtbWFTZXR0aW5ncyk6IHZvaWQgeyBlbWl0KFwic2V0dGluZ3MuZ2FtbWFcIiwgdmFsdWUpOyB9LFxuICAgIGdyYXBoaWNzKHZhbHVlOiBHcmFwaGljc1NldHRpbmdzKTogdm9pZCB7IGVtaXQoXCJzZXR0aW5ncy5ncmFwaGljc1wiLCB2YWx1ZSk7IH0sXG4gICAgdmlkZW8odmFsdWU6IFZpZGVvU2V0dGluZ3MpOiB2b2lkIHsgZW1pdChcInNldHRpbmdzLnZpZGVvXCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgc291bmQ6IHtcbiAgICBwbGF5KHZhbHVlOiBQbGF5KTogdm9pZCB7IGVtaXQoXCJzb3VuZC5wbGF5XCIsIHZhbHVlKTsgfSxcbiAgICB2b2x1bWUodmFsdWU6IFZvbHVtZSk6IHZvaWQgeyBlbWl0KFwic291bmQudm9sdW1lXCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgd2luZG93OiB7XG4gICAgc2l6ZSgpOiBQcm9taXNlPFdpbmRvd1NpemU+IHsgcmV0dXJuIHJlcXVlc3QoXCJ3aW5kb3cuc2l6ZVwiLCBudWxsKTsgfSxcbiAgfSxcbn0gYXMgY29uc3Q7XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIGludGVycG9sYXRlLFxuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aERlbGF5LFxuICB3aXRoVGltaW5nLFxuICB0eXBlIEJldnlTdHlsZSxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IG9uLCB0eXBlIEtleWJvYXJkRXZlbnREYXRhLCB0eXBlIFJlYWN0RXZlbnRzIH0gZnJvbSBcIi4vYmV2eVwiO1xuXG4vKiogTGlzdGVuIHRvIGEgQmV2eSBldmVudCB3aGlsZSBtb3VudGVkOyBgcnVuYCBhbHdheXMgc2VlcyB0aGUgbGF0ZXN0XG4gKiAgcmVuZGVyJ3Mgc3RhdGUuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRXZlbnQ8SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgcnVuOiAodmFsdWU6IFJlYWN0RXZlbnRzW0tdKSA9PiB2b2lkLFxuKSB7XG4gIGNvbnN0IGxhdGVzdCA9IHVzZVJlZihydW4pO1xuICBsYXRlc3QuY3VycmVudCA9IHJ1bjtcbiAgdXNlRWZmZWN0KCgpID0+IG9uKG5hbWUsICh2YWx1ZSkgPT4gbGF0ZXN0LmN1cnJlbnQodmFsdWUpKSwgW25hbWVdKTtcbn1cblxuLyoqIEtleSBwcmVzc2VzIChubyBhdXRvLXJlcGVhdCB1bmxlc3MgYHJlcGVhdGApLCB3aGlsZSBtb3VudGVkLiBgcnVuYCBnZXRzXG4gKiAgdGhlIGV2ZW50OyBtYXRjaCBvbiBgZS5rZXlgIG9yIGBlLmNvZGVgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUtleXMocnVuOiAoZTogS2V5Ym9hcmRFdmVudERhdGEpID0+IHZvaWQsIHJlcGVhdCA9IGZhbHNlKSB7XG4gIHVzZUV2ZW50KFwia2V5RG93blwiLCAoZSkgPT4ge1xuICAgIGlmIChlLnJlcGVhdCAmJiAhcmVwZWF0KSByZXR1cm47XG4gICAgcnVuKGUpO1xuICB9KTtcbn1cblxuLyoqIEEgc2NyaXB0ZWQgc3RlcCBmcm9tIGAtLXNob290IOKApiAtLWRvIFwiPHNlY3M+IDx2ZXJiPiBbYXJnXVwiYCAodGhlXG4gKiAgYGRlYnVnLmFjdGAgZXZlbnQpOiBydW5zIGBydW4oYXJnKWAgZm9yIHRoaXMgY29tcG9uZW50J3MgYHZlcmJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURlYnVnKHZlcmI6IHN0cmluZywgcnVuOiAoYXJnOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgdXNlRXZlbnQoXCJkZWJ1Zy5hY3RcIiwgKHsgYWN0aW9uIH0pID0+IHtcbiAgICBjb25zdCBbaGVhZCwgLi4ucmVzdF0gPSBhY3Rpb24uc3BsaXQoXCIgXCIpO1xuICAgIGlmIChoZWFkID09PSB2ZXJiKSBydW4ocmVzdC5qb2luKFwiIFwiKSk7XG4gIH0pO1xufVxuXG4vKiogU2xpZGUgaW4gZnJvbSBgeGAgcHggd2hpbGUgZmFkaW5nIGluLCBhZnRlciBgZGVsYXlgIG1zIChCZXZ5IHJ1bnMgdGhlXG4gKiAgYW5pbWF0aW9uOyBSZWFjdCByZW5kZXJzIG9uY2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUVudGVyKHggPSAtMjQsIGRlbGF5ID0gMCwgZHVyYXRpb24gPSAyODApOiBCZXZ5U3R5bGUge1xuICBjb25zdCB0ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdC52YWx1ZSA9IHdpdGhEZWxheShkZWxheSwgd2l0aFRpbWluZygxLCB7IGR1cmF0aW9uLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0pKTtcbiAgfSwgW3QsIGRlbGF5LCBkdXJhdGlvbl0pO1xuICByZXR1cm4ge1xuICAgIG9wYWNpdHk6IHsgYW5pbWF0ZWQ6IHQgfSxcbiAgICB0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWDogeyBhbmltYXRlZDogaW50ZXJwb2xhdGUodCwgWzAsIDFdLCBbeCwgMF0pIH0gfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIGNhbmNlbEFuaW1hdGlvbixcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhSZXBlYXQsXG4gIHdpdGhTZXF1ZW5jZSxcbiAgd2l0aFRpbWluZyxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VFdmVudCwgdXNlS2V5cyB9IGZyb20gXCIuLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBGSUxMLCBLZXljYXAgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBtb2RhbE9wZW4gfSBmcm9tIFwiLi9EaWFsb2dcIjtcblxuLyoqIEEgc2VjdGlvbiB0aXRsZSwgYSByb2xlIHdpdGggaXRzIG5hbWVzIChvbmUgcm93IGVhY2g7IGEgcm9sZSBtYXkgYnJlYWtcbiAqICBvdmVyIGxpbmVzIHdpdGggYFxcbmApLCBvciBlbXB0eSBzcGFjZS4gKi9cbnR5cGUgQmxvY2sgPVxuICB8IHsgdGl0bGU6IHN0cmluZyB9XG4gIHwgeyByb2xlOiBzdHJpbmc7IG5hbWVzOiBzdHJpbmdbXSB9XG4gIHwgeyBzcGFjZTogbnVtYmVyIH07XG5cbmNvbnN0IENSRURJVFM6IEJsb2NrW10gPSBbXG4gIHsgdGl0bGU6IFwiQSBGUk9OVCBFTkQgQlVJTFQgV0lUSCBCRVZZLVJFQUNUXCIgfSxcbiAgeyBzcGFjZTogNjAgfSxcbiAgeyB0aXRsZTogXCJTRVQgSU4gU0FCTEUgQ0lUWSwgV0hFUkUgTk9CT0RZIExPR1MgT0ZGXCIgfSxcbiAgeyByb2xlOiBcIkJFVlktUkVBQ1RcIiwgbmFtZXM6IFtcIk1BVEVVU1ogVE9NQ1pZS1wiXSB9LFxuICB7XG4gICAgcm9sZTogXCJHQU1FIEVOR0lORTogQkVWWVwiLFxuICAgIG5hbWVzOiBbXCJDQVJURVIgQU5ERVJTT05cIiwgXCJBTkQgVEhFIEJFVlkgQ09OVFJJQlVUT1JTXCJdLFxuICB9LFxuICB7XG4gICAgcm9sZTogXCJVSSBMSUJSQVJZOiBSRUFDVFwiLFxuICAgIG5hbWVzOiBbXCJNRVRBIE9QRU4gU09VUkNFXCIsIFwiQU5EIFRIRSBSRUFDVCBDT05UUklCVVRPUlNcIl0sXG4gIH0sXG4gIHsgcm9sZTogXCJKQVZBU0NSSVBUIEVOR0lORTogVjhcIiwgbmFtZXM6IFtcIlRIRSBWOCBQUk9KRUNUIEFVVEhPUlNcIl0gfSxcbiAgeyByb2xlOiBcIkVNQkVERElORzogREVOT19DT1JFXCIsIG5hbWVzOiBbXCJUSEUgREVOTyBBVVRIT1JTXCJdIH0sXG4gIHtcbiAgICByb2xlOiBcIkxBWU9VVDogVEFGRllcIixcbiAgICBuYW1lczogW1wiRElPWFVTTEFCU1wiLCBcIkFORCBUSEUgVEFGRlkgQ09OVFJJQlVUT1JTXCJdLFxuICB9LFxuICB7IHJvbGU6IFwiVEVYVCBTSEFQSU5HOiBDT1NNSUMtVEVYVFwiLCBuYW1lczogW1wiU1lTVEVNNzZcIl0gfSxcbiAgeyByb2xlOiBcIkdSQVBISUNTOiBXR1BVXCIsIG5hbWVzOiBbXCJUSEUgV0dQVSBDT05UUklCVVRPUlNcIl0gfSxcbiAge1xuICAgIHJvbGU6IFwiVFlQRUZBQ0U6IFJBSkRIQU5JXFxuU0lMIE9QRU4gRk9OVCBMSUNFTlNFXCIsXG4gICAgbmFtZXM6IFtcIklORElBTiBUWVBFIEZPVU5EUllcIl0sXG4gIH0sXG4gIHtcbiAgICByb2xlOiBcIk1PTk9TUEFDRTogSkVUQlJBSU5TIE1PTk9cXG5TSUwgT1BFTiBGT05UIExJQ0VOU0VcIixcbiAgICBuYW1lczogW1wiSkVUQlJBSU5TXCJdLFxuICB9LFxuICB7IHNwYWNlOiAxMTAgfSxcbiAgeyB0aXRsZTogXCJPTiBUSEUgU1RSRUVUUyBPRiBTQUJMRSBDSVRZXCIgfSxcbiAgeyByb2xlOiBcIkZJWEVSLCBLRVNTTEVSIERJU1RSSUNUXCIsIG5hbWVzOiBbXCJNQU1BIE9EVVlBXCJdIH0sXG4gIHsgcm9sZTogXCJSSVBQRVJET0MsIExBTlRFUk4gQUxMRVlcIiwgbmFtZXM6IFtcIkRSLiBJVk8gS0FMTklOU1wiXSB9LFxuICB7IHJvbGU6IFwiTkVUUlVOTkVSU1wiLCBuYW1lczogW1wiU1BBUlJPVy05XCIsIFwiR0hPU1RXSVJFXCIsIFwiTElUVExFIE1FUkNZXCJdIH0sXG4gIHsgcm9sZTogXCJCTEFDSyBJQ0UgQ09OU1VMVEFOVFwiLCBuYW1lczogW1wiTk9CT0RZIFlPVSBIQVZFIE1FVFwiXSB9LFxuICB7IHJvbGU6IFwiTk9NQUQgQ09OVk9ZIExFQUQsXFxuUkVEIE1FU0EgUEFTU1wiLCBuYW1lczogW1wiSlVOTyBWQVNRVUVaLUhBTEVcIl0gfSxcbiAgeyByb2xlOiBcIlNUUkVFVCBNRURJQyBPTiBDQUxMXCIsIG5hbWVzOiBbXCJTQUlOVCBNQUdTXCJdIH0sXG4gIHsgcm9sZTogXCJNRU1PUlkgUkVQTEFZIEVESVRPUlwiLCBuYW1lczogW1wiT0tTQU5BIFJJVkVcIl0gfSxcbiAgeyByb2xlOiBcIlJBRElPLCA5MS40IFNUQVRJQyBGTVwiLCBuYW1lczogW1wiREogTE9XIEJBVFRFUllcIl0gfSxcbiAgeyByb2xlOiBcIkNIUk9NRSBGSVRUSU5HU1wiLCBuYW1lczogW1wiVFdJTiBCTEFERVMgQ0xJTklDXCJdIH0sXG4gIHsgcm9sZTogXCJDQVRFUklOR1wiLCBuYW1lczogW1wiVEhFIE5PT0RMRSBDQVJUIE9OIDVUSCBBTkQgRE9SU0VUXCJdIH0sXG4gIHsgc3BhY2U6IDExMCB9LFxuICB7IHRpdGxlOiBcIlRFTktBSSBDT1JQT1JBVElPTlwiIH0sXG4gIHsgcm9sZTogXCJDT1VOVEVSSU5URUxMSUdFTkNFXCIsIG5hbWVzOiBbXCJbUkVEQUNURURdXCIsIFwiW1JFREFDVEVEXVwiXSB9LFxuICB7IHJvbGU6IFwiTEVHQUwgUkVWSUVXIE9GXFxuVEhFU0UgQ1JFRElUU1wiLCBuYW1lczogW1wiVEVOS0FJIExFR0FMLCBGTE9PUiA4OFwiXSB9LFxuICB7IHJvbGU6IFwiU0NQRCBJTkNJREVOVCBSRVBPUlRTXCIsIG5hbWVzOiBbXCJTR1QuIERBTEUgUFJVSVRUIChSRVQuKVwiXSB9LFxuICB7IHNwYWNlOiAxMTAgfSxcbiAgeyB0aXRsZTogXCJTUEVDSUFMIFRIQU5LU1wiIH0sXG4gIHtcbiAgICByb2xlOiBcIkZPUiBFVkVSWSBMSU5FIE9GIENPREVcXG5VTkRFUiBUSEVTRSBNRU5VU1wiLFxuICAgIG5hbWVzOiBbXCJUSEUgT1BFTi1TT1VSQ0UgQ09OVFJJQlVUT1JTXCJdLFxuICB9LFxuICB7IHJvbGU6IFwiRk9SIFJFQURJTkcgVEhJUyBGQVJcIiwgbmFtZXM6IFtcIllPVVwiXSB9LFxuICB7IHNwYWNlOiAxMTAgfSxcbiAgeyB0aXRsZTogXCJJTlNQSVJFRCBCWSBUSEUgTUVOVVMgT0YgQ1lCRVJQVU5LIDIwNzcgQlkgQ0QgUFJPSkVLVCBSRURcIiB9LFxuICB7IHNwYWNlOiA2MCB9LFxuICB7IHRpdGxlOiBcIk5PIFNBVkUgRklMRVMgV0VSRSBIQVJNRUQgSU4gVEhFIE1BS0lORyBPRiBUSEVTRSBNRU5VU1wiIH0sXG5dO1xuXG5jb25zdCBUSVRMRSA9IDg0O1xuY29uc3QgUk9XID0gNjQ7XG5jb25zdCBMSU5FID0gMjY7XG5cbmNvbnN0IGhlaWdodCA9IChiOiBCbG9jaykgPT5cbiAgXCJ0aXRsZVwiIGluIGJcbiAgICA/IFRJVExFXG4gICAgOiBcInNwYWNlXCIgaW4gYlxuICAgICAgPyBiLnNwYWNlXG4gICAgICA6IE1hdGgubWF4KFxuICAgICAgICAgIGIubmFtZXMubGVuZ3RoICogUk9XLFxuICAgICAgICAgIFJPVyArIChiLnJvbGUuc3BsaXQoXCJcXG5cIikubGVuZ3RoIC0gMSkgKiBMSU5FLFxuICAgICAgICApO1xuXG4vKiogVGhlIGNvbHVtbidzIGhlaWdodC4gKi9cbmNvbnN0IEggPSBDUkVESVRTLnJlZHVjZSgoaCwgYikgPT4gaCArIGhlaWdodChiKSwgMCk7XG4vKiogUm9sZXMgZW5kIGxlZnQgb2YgdGhpcyBsaW5lLCBuYW1lcyBzdGFydCByaWdodCBvZiBpdC4gKi9cbmNvbnN0IFNQTElUID0gNjgyO1xuXG4vKiogU2Nyb2xsIHNwZWVkcywgcHgvcy4gKi9cbmNvbnN0IE5PUk1BTCA9IDQ4O1xuY29uc3QgRkFTVCA9IDUyMDtcbi8qKiBUaGUgZmlyc3QgcGFzcyBvcGVucyB3aXRoIHRoZSBjb2x1bW4gYWxyZWFkeSB1cCAoaXRzIHRvcCBoZXJlKeKApiAqL1xuY29uc3QgU1RBUlQgPSAxNTA7XG4vKiog4oCmbGF0ZXIgcGFzc2VzIHJpc2UgZnJvbSB1bmRlciB0aGUgc2NyZWVuLiAqL1xuY29uc3QgRU5URVIgPSAxMDkwO1xuXG5jb25zdCByb2xlID0ge1xuICBmb250U2l6ZTogMjIsXG4gIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gIGNvbG9yOiBcIiM0OGMzYmRcIixcbiAgbGV0dGVyU3BhY2luZzogMSxcbiAgbGluZUhlaWdodDogeyBweDogTElORSB9LFxuICB0ZXh0QWxpZ246IFwicmlnaHRcIixcbn0gYXMgY29uc3Q7XG5jb25zdCBuYW1lID0ge1xuICBmb250U2l6ZTogMjUsXG4gIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgY29sb3I6IFwiI2IyZjRmM1wiLFxuICBsZXR0ZXJTcGFjaW5nOiAxLFxuICBsaW5lSGVpZ2h0OiB7IHB4OiBST1cgfSxcbiAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxufSBhcyBjb25zdDtcbmNvbnN0IHRpdGxlID0ge1xuICBmb250U2l6ZTogMzYsXG4gIGNvbG9yOiBcIiNiMmY0ZjNcIixcbiAgbGV0dGVyU3BhY2luZzogMS42LFxuICBsaW5lSGVpZ2h0OiB7IHB4OiBUSVRMRSB9LFxuICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG59IGFzIGNvbnN0O1xuXG4vKiogVGhlIGNyZWRpdHM6IHR3byBjb2x1bW5zIHJpc2luZyBvdmVyIHRoZSBkYXRhc2NhcGUgZm9yZXZlci4gSG9sZCBGIChvclxuICogIEVudGVyKSB0byBmYXN0LWZvcndhcmQ7IEVzYyBjbG9zZXMuICovXG5leHBvcnQgZnVuY3Rpb24gQ3JlZGl0cyh7IG9uQ2xvc2UgfTogeyBvbkNsb3NlOiAoKSA9PiB2b2lkIH0pIHtcbiAgY29uc3QgeSA9IHVzZVNoYXJlZFZhbHVlKFNUQVJUKTtcbiAgY29uc3QgW2Zhc3QsIHNldEZhc3RdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAvLyBCZXZ5IG93bnMgdGhlIGxpdmUgb2Zmc2V0OyB0aGlzIGlzIGVub3VnaCB0byBlc3RpbWF0ZSBpdCB3aGVuIHRoZVxuICAvLyBzcGVlZCBjaGFuZ2VzIChlYWNoIG5ldyBkcml2ZXIgc3RhcnRzIGZyb20gQmV2eSdzIG93biByZWFkaW5nKS5cbiAgY29uc3QgY2xvY2sgPSB1c2VSZWYoeyBmcm9tOiBTVEFSVCwgYXQ6IDAsIHNwZWVkOiBOT1JNQUwgfSk7XG5cbiAgY29uc3QgcnVuID0gKGZyb206IG51bWJlciwgc3BlZWQ6IG51bWJlcikgPT4ge1xuICAgIGNsb2NrLmN1cnJlbnQgPSB7IGZyb20sIGF0OiBEYXRlLm5vdygpLCBzcGVlZCB9O1xuICAgIGNvbnN0IG1zID0gKHB4OiBudW1iZXIpID0+IChweCAvIHNwZWVkKSAqIDEwMDA7XG4gICAgeS52YWx1ZSA9IHdpdGhTZXF1ZW5jZShcbiAgICAgIHdpdGhUaW1pbmcoLUgsIHsgZHVyYXRpb246IG1zKGZyb20gKyBIKSB9KSxcbiAgICAgIHdpdGhUaW1pbmcoRU5URVIsIHsgZHVyYXRpb246IDAgfSksXG4gICAgICB3aXRoUmVwZWF0KHdpdGhUaW1pbmcoLUgsIHsgZHVyYXRpb246IG1zKEVOVEVSICsgSCkgfSkpLFxuICAgICk7XG4gIH07XG4gIGNvbnN0IG9mZnNldCA9ICgpID0+IHtcbiAgICBjb25zdCB7IGZyb20sIGF0LCBzcGVlZCB9ID0gY2xvY2suY3VycmVudDtcbiAgICBjb25zdCBweCA9ICgoRGF0ZS5ub3coKSAtIGF0KSAvIDEwMDApICogc3BlZWQ7XG4gICAgcmV0dXJuIHB4IDw9IGZyb20gKyBIID8gZnJvbSAtIHB4IDogRU5URVIgLSAoKHB4IC0gZnJvbSAtIEgpICUgKEVOVEVSICsgSCkpO1xuICB9O1xuICBjb25zdCBzcGVlZCA9IChvbjogYm9vbGVhbikgPT4ge1xuICAgIGlmIChvbiA9PT0gZmFzdCkgcmV0dXJuO1xuICAgIHNldEZhc3Qob24pO1xuICAgIHJ1bihvZmZzZXQoKSwgb24gPyBGQVNUIDogTk9STUFMKTtcbiAgfTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJ1bihTVEFSVCwgTk9STUFMKTtcbiAgICAvLyBUaGUgcmVwZWF0IG5ldmVyIGVuZHMgb24gaXRzIG93bi5cbiAgICByZXR1cm4gKCkgPT4gY2FuY2VsQW5pbWF0aW9uKHkpO1xuICB9LCBbXSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIHNmeChcImJhY2tcIik7XG4gICAgb25DbG9zZSgpO1xuICB9O1xuICBjb25zdCBmb3J3YXJkID0gKGtleTogc3RyaW5nKSA9PlxuICAgIGtleSA9PT0gXCJmXCIgfHwga2V5ID09PSBcIkZcIiB8fCBrZXkgPT09IFwiRW50ZXJcIjtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChtb2RhbE9wZW4oKSkgcmV0dXJuO1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikgY2xvc2UoKTtcbiAgICBlbHNlIGlmIChmb3J3YXJkKGUua2V5KSkgc3BlZWQodHJ1ZSk7XG4gIH0pO1xuICB1c2VFdmVudChcImtleVVwXCIsIChlKSA9PiB7XG4gICAgaWYgKGZvcndhcmQoZS5rZXkpKSBzcGVlZChmYWxzZSk7XG4gIH0pO1xuICAvLyBgLS1zaG9vdGAgc3RlcDogYGZmIG9ufG9mZmAuXG4gIHVzZURlYnVnKFwiZmZcIiwgKGFyZykgPT4gc3BlZWQoYXJnICE9PSBcIm9mZlwiKSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uRklMTCxcbiAgICAgICAgLy8gQSBzaGFkZSBvdmVyIHRoZSBkYXRhc2NhcGUncyBicmlnaHRlc3Qgc3RyZWFrcywgbm90IGEgcGFuZWwuXG4gICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgYW5nbGU6IDkwLFxuICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoMiwgNCwgOCwgMC42MilcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDIsIDQsIDgsIDAuNSlcIiwgcG9zaXRpb246IFwiNTAlXCIgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSgyLCA0LCA4LCAwKVwiLCBwb3NpdGlvbjogXCI4NSVcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgd2lkdGg6IDIgKiBTUExJVCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVZOiB7IGFuaW1hdGVkOiB5IH0gfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge0NSRURJVFMubWFwKChiLCBpKSA9PlxuICAgICAgICAgIFwidGl0bGVcIiBpbiBiID8gKFxuICAgICAgICAgICAgPHRleHQga2V5PXtpfSBzdHlsZT17dGl0bGV9PlxuICAgICAgICAgICAgICB7Yi50aXRsZX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApIDogXCJzcGFjZVwiIGluIGIgPyAoXG4gICAgICAgICAgICA8bm9kZSBrZXk9e2l9IHN0eWxlPXt7IGhlaWdodDogYi5zcGFjZSB9fSAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQoYiksXG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgICBnYXA6IDIgKiAoU1BMSVQgLSA2NzIpLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAuLi5yb2xlLFxuICAgICAgICAgICAgICAgICAgd2lkdGg6IDY3MixcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IChST1cgLSBMSU5FKSAvIDIgfSxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2Iucm9sZX1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17bmFtZX0+e2IubmFtZXMuam9pbihcIlxcblwiKX08L3RleHQ+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgKSxcbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDc2LFxuICAgICAgICAgIGJvdHRvbTogNjAsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIixcbiAgICAgICAgICBnYXA6IDIwLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc3BlZWQoIWZhc3QpfVxuICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogOCB9fVxuICAgICAgICAgIGhvdmVyU3R5bGU9e3sgb3BhY2l0eTogMC44IH19XG4gICAgICAgID5cbiAgICAgICAgICA8S2V5Y2FwIGs9XCJGXCIgY29sb3I9e0MucmVkfSAvPlxuICAgICAgICAgIDxLZXljYXAgaz1cImVudGVyXCIgY29sb3I9e0MucmVkfSAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMjUsXG4gICAgICAgICAgICAgIGNvbG9yOiBmYXN0ID8gQy5jeWFuIDogQy5yZWQsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgRmFzdC1Gb3J3YXJkIENyZWRpdHNcbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25DbGljaz17Y2xvc2V9XG4gICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA4IH19XG4gICAgICAgICAgaG92ZXJTdHlsZT17eyBvcGFjaXR5OiAwLjggfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxLZXljYXAgaz1cIkVTQ1wiIGNvbG9yPXtDLnJlZH0gLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMjUsIGNvbG9yOiBDLnJlZCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICAgICAgQ0xPU0VcbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4vYmV2eVwiO1xuXG4vKiogVGhlIFVJIHNvdW5kcyBCZXZ5IHN5bnRoZXNpemVzIChgc291bmQucnNgKS4gKi9cbmV4cG9ydCB0eXBlIFNmeCA9XG4gIHwgXCJob3ZlclwiXG4gIHwgXCJjbGlja1wiXG4gIHwgXCJiYWNrXCJcbiAgfCBcInRhYlwiXG4gIHwgXCJlcnJvclwiXG4gIHwgXCJjb25maXJtXCJcbiAgfCBcImJvb3RcIjtcblxuLyoqIFBsYXkgYSBVSSBzb3VuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZngobmFtZTogU2Z4KSB7XG4gIGJldnkuc291bmQucGxheSh7IG5hbWUgfSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUsIEdyYWRpZW50IH0gZnJvbSBcImJldnktcmVhY3RcIjtcblxuLyoqIFRoZSBmcm9udCBlbmQncyBsb29rLCBzYW1wbGVkIGZyb20gdGhlIGdhbWUncyBtZW51czogc2FsbW9uLXJlZCB0eXBlIGFuZFxuICogIGZyYW1lcyBvbiBuZWFyLWJsYWNrLCBjeWFuIGZvciB3aGF0ZXZlciB5b3UgY2FuIGFjdCBvbiwgdGhlIHdvcmRtYXJrIGluXG4gKiAgYWNpZCB5ZWxsb3cuICovXG5leHBvcnQgY29uc3QgQyA9IHtcbiAgcmVkOiBcIiNmZjVkNTFcIixcbiAgcmVkSGk6IFwiI2ZmOGE3ZlwiLFxuICByZWREaW06IFwiI2M3MmUyYlwiLFxuICByZWREZWVwOiBcIiM5MTJkMmFcIixcbiAgcmVkTGluZTogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjUpXCIsXG4gIHJlZEZhaW50OiBcInJnYmEoMjU1LCA5MywgODEsIDAuMTYpXCIsXG4gIGN5YW46IFwiIzVlZjZmZlwiLFxuICBjeWFuSGk6IFwiIzIzZjlmZlwiLFxuICBjeWFuRGltOiBcIiM1MmJjZDRcIixcbiAgY3lhbkRlZXA6IFwiIzBmM2E0NFwiLFxuICBjeWFuRmFpbnQ6IFwicmdiYSg5NCwgMjQ2LCAyNTUsIDAuMTIpXCIsXG4gIHllbGxvdzogXCIjZmZmMDAyXCIsXG4gIHdoaXRlOiBcIiNlNmZkZjNcIixcbiAgaW5rOiBcIiMwNTBiMTBcIixcbiAgLy8gUGFuZWwgZmlsbHMuXG4gIGJhbmQ6IFwicmdiYSg1OCwgMTgsIDI0LCAwLjUpXCIsXG4gIHNlY3Rpb246IFwiIzIyMTExY1wiLFxuICByb3c6IFwiIzFmMGUxNVwiLFxuICBmaWVsZDogXCIjMTYxMjFmXCIsXG4gIGJ1dHRvbjogXCIjMTExMTFlXCIsXG4gIHNoYWRlOiBcInJnYmEoNSwgNywgMTIsIDAuNzIpXCIsXG4gIGNsZWFyOiBcInJnYmEoMCwgMCwgMCwgMClcIixcbn07XG5cbi8qKiBSYWpkaGFuaSBpcyB0aGUgZGVmYXVsdCBmb250IChNZWRpdW0pOyBpdHMgb3RoZXIgd2VpZ2h0cyBhcmUgZmFtaWxpZXMgb2ZcbiAqICB0aGVpciBvd24gKHN0YXRpYyBmaWxlcykuICovXG5leHBvcnQgY29uc3QgRiA9IHtcbiAgc2VtaWJvbGQ6IFwiUmFqZGhhbmkgU2VtaUJvbGRcIixcbiAgYm9sZDogXCJSYWpkaGFuaSBCb2xkXCIsXG4gIG1vbm86IFwiTW9ub1wiLFxufTtcblxuLyoqIFRleHQgc3R5bGVzLiAqL1xuZXhwb3J0IGNvbnN0IFQgPSB7XG4gIC8qKiBNZW51IGl0ZW1zLCBidXR0b25zOiBiaWcgdXBwZXJjYXNlLiAqL1xuICBtZW51OiB7IGZvbnRTaXplOiAzMCwgY29sb3I6IEMucmVkLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfSBhcyBCZXZ5U3R5bGUsXG4gIC8qKiBTY3JlZW4gdGl0bGVzIChcIlNFTEVDVCBESUZGSUNVTFRZIExFVkVMXCIpLiAqL1xuICB0aXRsZToge1xuICAgIGZvbnRTaXplOiAzNixcbiAgICBjb2xvcjogQy5jeWFuLFxuICAgIGxldHRlclNwYWNpbmc6IDAuNSxcbiAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gIH0gYXMgQmV2eVN0eWxlLFxuICAvKiogVXBwZXJjYXNlIHN1YnRpdGxlcyB1bmRlciBhIHRpdGxlLiAqL1xuICBjYXB0aW9uOiB7IGZvbnRTaXplOiAxOSwgY29sb3I6IEMucmVkLCBsZXR0ZXJTcGFjaW5nOiAwLjQgfSBhcyBCZXZ5U3R5bGUsXG4gIC8qKiBTZXR0aW5ncyBsYWJlbHMsIGxpc3QgdGV4dC4gKi9cbiAgbGFiZWw6IHtcbiAgICBmb250U2l6ZTogMjIsXG4gICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICBjb2xvcjogQy5yZWQsXG4gICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICB9IGFzIEJldnlTdHlsZSxcbiAgLyoqIFNlY3Rpb24gaGVhZGVycyBpbnNpZGUgbGlzdHMuICovXG4gIHNlY3Rpb246IHtcbiAgICBmb250U2l6ZTogMjIsXG4gICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICBjb2xvcjogQy53aGl0ZSxcbiAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gIH0gYXMgQmV2eVN0eWxlLFxuICAvKiogQm9keSBjb3B5LiAqL1xuICBib2R5OiB7IGZvbnRTaXplOiAyMiwgY29sb3I6IEMuY3lhbiwgbGluZUhlaWdodDogMS4zNSB9IGFzIEJldnlTdHlsZSxcbiAgLyoqIFRoZSB0aW55IGRhdGEgbm9pc2Ugc3ByaW5rbGVkIGFyb3VuZCB0aGUgZnJhbWVzLiAqL1xuICBtaWNybzoge1xuICAgIGZvbnRTaXplOiA5LFxuICAgIGZvbnRGYW1pbHk6IEYubW9ubyxcbiAgICBjb2xvcjogQy5yZWREaW0sXG4gICAgbGluZUhlaWdodDogMS4zLFxuICB9IGFzIEJldnlTdHlsZSxcbn07XG5cbmV4cG9ydCB0eXBlIENvcm5lciA9IFwiYnJcIiB8IFwidGxcIiB8IFwidHJcIiB8IFwiYmxcIjtcblxuLyoqIFRoZSBncmFkaWVudCBhbmdsZSB0aGF0IHN0YXJ0cyBhdCBgY29ybmVyYCAoQ1NTOiBgMGAgcG9pbnRzIHVwLCBhbmdsZXNcbiAqICBncm93IGNsb2Nrd2lzZTsgdGhlIGxpbmUgc3RhcnRzIGF0IHRoZSBjb3JuZXIgb3Bwb3NpdGUgaXRzIGRpcmVjdGlvbikuICovXG5jb25zdCBGUk9NOiBSZWNvcmQ8Q29ybmVyLCBudW1iZXI+ID0geyBicjogMzE1LCB0bDogMTM1LCB0cjogMjI1LCBibDogNDUgfTtcblxuY29uc3QgdHJhbnNwYXJlbnQgPSBcInJnYmEoMCwgMCwgMCwgMClcIjtcblxuLyoqIEEgYm94IHdpdGggb25lIGNvcm5lciBjdXQgb2ZmIGF0IDQ1wrAg4oCUIHRoZSBmcmFtZSBldmVyeSBwYW5lbCwgYnV0dG9uIGFuZFxuICogIGNhcmQgaXMgYnVpbHQgZnJvbS4gTm8gY2xpcCBwYXRoczogYSBsaW5lYXIgZ3JhZGllbnQgd2hvc2UgbGluZSBzdGFydHNcbiAqICBhdCB0aGUgY29ybmVyIGlzIHRyYW5zcGFyZW50IGZvciBpdHMgZmlyc3QgYGN1dCAvIOKImjJgIHB4IGFuZCBgZmlsbGAgYWZ0ZXJcbiAqICAoYSA0NcKwIGVkZ2UgYXQgYW55IGJveCBzaXplKTsgYGJvcmRlckdyYWRpZW50YCBkb2VzIHRoZSBzYW1lIHRvIHRoZVxuICogIGJvcmRlciwgc28gdGhlIHR3byBzaWRlcyBzdG9wIGV4YWN0bHkgYXQgdGhlIGN1dCwgYW5kIGEgYmFuZCBvZiBgbGluZWBcbiAqICBkcmF3cyB0aGUgY3V0IGl0c2VsZi4gVGhlIGJhY2tncm91bmQgcGFpbnRzIGluc2lkZSB0aGUgYm9yZGVyLCB3aGljaCBpc1xuICogIHdoeSBpdHMgYmFuZCBzdGFydHMgYOKImjLCt3dpZHRoYCBlYXJsaWVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoYW1mZXIoXG4gIGZpbGw6IHN0cmluZyxcbiAgY3V0OiBudW1iZXIsXG4gIGxpbmU/OiBzdHJpbmcsXG4gIHdpZHRoID0gMSxcbiAgY29ybmVyOiBDb3JuZXIgPSBcImJyXCIsXG4pOiBCZXZ5U3R5bGUge1xuICBjb25zdCBkID0gY3V0IC8gTWF0aC5TUVJUMjtcbiAgY29uc3QgYW5nbGUgPSBGUk9NW2Nvcm5lcl07XG4gIGlmICghbGluZSkge1xuICAgIHJldHVybiB7XG4gICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgYW5nbGUsXG4gICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgeyBjb2xvcjogdHJhbnNwYXJlbnQsIHBvc2l0aW9uOiBkIC0gMC42IH0sXG4gICAgICAgICAgeyBjb2xvcjogZmlsbCwgcG9zaXRpb246IGQgKyAwLjYgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuICBjb25zdCBpbm5lciA9IGQgLSBNYXRoLlNRUlQyICogd2lkdGg7XG4gIHJldHVybiB7XG4gICAgYm9yZGVyOiB3aWR0aCxcbiAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICBhbmdsZSxcbiAgICAgIHN0b3BzOiBbXG4gICAgICAgIHsgY29sb3I6IHRyYW5zcGFyZW50LCBwb3NpdGlvbjogaW5uZXIgLSAwLjYgfSxcbiAgICAgICAgeyBjb2xvcjogbGluZSwgcG9zaXRpb246IGlubmVyICsgMC42IH0sXG4gICAgICAgIHsgY29sb3I6IGxpbmUsIHBvc2l0aW9uOiBpbm5lciArIHdpZHRoIC0gMC40IH0sXG4gICAgICAgIHsgY29sb3I6IGZpbGwsIHBvc2l0aW9uOiBpbm5lciArIHdpZHRoICsgMC42IH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAgYm9yZGVyR3JhZGllbnQ6IHtcbiAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICBhbmdsZSxcbiAgICAgIHN0b3BzOiBbXG4gICAgICAgIHsgY29sb3I6IHRyYW5zcGFyZW50LCBwb3NpdGlvbjogZCAtIDAuNiB9LFxuICAgICAgICB7IGNvbG9yOiBsaW5lLCBwb3NpdGlvbjogZCArIDAuNiB9LFxuICAgICAgXSxcbiAgICB9LFxuICB9O1xufVxuXG4vKiogQSBzb2Z0IGhvcml6b250YWwgZmFkZSwgZm9yIHRoZSBiYW5kcyBiZWhpbmQgbGlzdHMgYW5kIGhlYWRlcnMuICovXG5leHBvcnQgZnVuY3Rpb24gZmFkZShjb2xvcjogc3RyaW5nLCBhbmdsZSA9IDkwLCBmcm9tID0gMCwgdG8gPSAxKTogR3JhZGllbnQge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgYW5nbGUsXG4gICAgc3RvcHM6IFt7IGNvbG9yOiBhbHBoYShjb2xvciwgZnJvbSkgfSwgeyBjb2xvcjogYWxwaGEoY29sb3IsIHRvKSB9XSxcbiAgfTtcbn1cblxuLyoqIGAjcnJnZ2JiYCB3aXRoIGFuIGFscGhhLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFscGhhKGhleDogc3RyaW5nLCBhOiBudW1iZXIpIHtcbiAgY29uc3QgbiA9IHBhcnNlSW50KGhleC5zbGljZSgxLCA3KSwgMTYpO1xuICByZXR1cm4gYHJnYmEoJHsobiA+PiAxNikgJiAyNTV9LCAkeyhuID4+IDgpICYgMjU1fSwgJHtuICYgMjU1fSwgJHthfSlgO1xufVxuXG4vKiogVGhlIGZhaW50IHNjYW5saW5lcyBsYWlkIG92ZXIgcGFuZWxzIChhIDQgcHggcmVwZWF0aW5nIHRleHR1cmUpLiAqL1xuZXhwb3J0IGNvbnN0IFNDQU5MSU5FUyA9IHtcbiAgc3JjOiBcImltYWdlcy9zY2FubGluZXMucG5nXCIsXG4gIG1vZGU6IFwicmVwZWF0XCIsXG4gIHNjYWxlOiAxLFxufSBhcyBjb25zdDtcblxuLyoqIEFueSBob3ZlciBzdHlsZSBtYWtlcyBhIG5vZGUgaW50ZXJhY3RpdmUgKGl0IHRoZW4gb3ducyB0aGUgcG9pbnRlcikuICovXG5leHBvcnQgY29uc3QgT1dOU19QT0lOVEVSID0ge307XG4iLCAiaW1wb3J0IHsgQyB9IGZyb20gXCIuLi90aGVtZVwiO1xuXG4vKiogQSBtb3VzZSwgaXRzIGxlZnQgYnV0dG9uIGxpdDogdGhlIFwiY2xpY2tcIiBnbHlwaCBvZiBldmVyeSBoaW50IGJhci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNb3VzZUljb24oe1xuICBjb2xvciA9IEMuY3lhbixcbiAgc2l6ZSA9IDI2LFxufToge1xuICBjb2xvcj86IHN0cmluZztcbiAgc2l6ZT86IG51bWJlcjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTYgMjRcIiBzdHlsZT17eyB3aWR0aDogKHNpemUgKiAxNikgLyAyNCwgaGVpZ2h0OiBzaXplIH19PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk04IDEuNSBDNCAxLjUgMS44IDQgMS44IDggTDEuOCAxNiBDMS44IDIwIDQuNCAyMi41IDggMjIuNSBDMTEuNiAyMi41IDE0LjIgMjAgMTQuMiAxNiBMMTQuMiA4IEMxNC4yIDQgMTIgMS41IDggMS41IFpcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk04IDIuNSBMOCA5LjUgTDIuOCA5LjUgTDIuOCA4IEMyLjggNC42IDQuNiAyLjYgOCAyLjUgWlwiXG4gICAgICAgIGZpbGw9e2NvbG9yfVxuICAgICAgLz5cbiAgICAgIDxsaW5lXG4gICAgICAgIHgxPXsxLjh9XG4gICAgICAgIHkxPXsxMH1cbiAgICAgICAgeDI9ezE0LjJ9XG4gICAgICAgIHkyPXsxMH1cbiAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuMn1cbiAgICAgIC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBUaGUgbGl0dGxlIHN0YWNrZWQtYmFycyBtYXJrIHRoYXQgcmlkZXMgaW5zaWRlIGEgc2VsZWN0ZWQgbWVudSBpdGVtLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFByb3RvY29sR2x5cGgoe1xuICBjb2xvciA9IEMuY3lhbixcbiAgd2lkdGggPSAzMCxcbn06IHtcbiAgY29sb3I/OiBzdHJpbmc7XG4gIHdpZHRoPzogbnVtYmVyO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAzMCAyMlwiIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQ6ICh3aWR0aCAqIDIyKSAvIDMwIH19PlxuICAgICAgPHJlY3QgeD17MH0geT17MH0gd2lkdGg9ezEyfSBoZWlnaHQ9ezIuMn0gZmlsbD17Y29sb3J9IC8+XG4gICAgICA8cmVjdCB4PXsxNH0geT17MH0gd2lkdGg9ezE2fSBoZWlnaHQ9ezIuMn0gZmlsbD17Y29sb3J9IC8+XG4gICAgICA8cmVjdCB4PXswfSB5PXs0fSB3aWR0aD17MjB9IGhlaWdodD17Mi4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxyZWN0IHg9ezIyfSB5PXs0fSB3aWR0aD17OH0gaGVpZ2h0PXsyLjJ9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgPHJlY3QgeD17MH0geT17OH0gd2lkdGg9ezh9IGhlaWdodD17Mi4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxyZWN0IHg9ezEwfSB5PXs4fSB3aWR0aD17MjB9IGhlaWdodD17Mi4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxwb2x5bGluZVxuICAgICAgICBwb2ludHM9e1swLCAxNCwgMTAsIDE0LCAxMywgMTEsIDE3LCAxNywgMjAsIDE0LCAzMCwgMTRdfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjR9XG4gICAgICAvPlxuICAgICAgPHJlY3QgeD17MH0geT17MTl9IHdpZHRoPXszMH0gaGVpZ2h0PXsxLjJ9IGZpbGw9e2NvbG9yfSBvcGFjaXR5PXswLjZ9IC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBBIHdhcm5pbmcgdHJpYW5nbGUgd2l0aCBhbiBleGNsYW1hdGlvbiBtYXJrLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFdhcm5pbmdJY29uKHtcbiAgY29sb3IgPSBDLnJlZCxcbiAgc2l6ZSA9IDE4LFxufToge1xuICBjb2xvcj86IHN0cmluZztcbiAgc2l6ZT86IG51bWJlcjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjAgMThcIiBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiAoc2l6ZSAqIDE4KSAvIDIwIH19PlxuICAgICAgPHBvbHlnb24gcG9pbnRzPXtbMTAsIDEsIDE5LCAxNywgMSwgMTddfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxyZWN0IHg9ezl9IHk9ezZ9IHdpZHRoPXsyfSBoZWlnaHQ9ezZ9IGZpbGw9XCIjMTIwYTBjXCIgLz5cbiAgICAgIDxyZWN0IHg9ezl9IHk9ezEzLjV9IHdpZHRoPXsyfSBoZWlnaHQ9ezJ9IGZpbGw9XCIjMTIwYTBjXCIgLz5cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuLyoqIFRoZSBzdGVwLXNlbGVjdG9yIGFycm93czogaG9sbG93IHRyaWFuZ2xlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJvdyh7XG4gIGRpcixcbiAgY29sb3IgPSBDLmN5YW4sXG4gIHNpemUgPSAyMCxcbn06IHtcbiAgZGlyOiBcImxlZnRcIiB8IFwicmlnaHRcIjtcbiAgY29sb3I/OiBzdHJpbmc7XG4gIHNpemU/OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IHBvaW50cyA9XG4gICAgZGlyID09PSBcImxlZnRcIiA/IFsxNywgMiwgMywgMTAsIDE3LCAxOF0gOiBbMywgMiwgMTcsIDEwLCAzLCAxOF07XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgc3R5bGU9e3sgd2lkdGg6IHNpemUsIGhlaWdodDogc2l6ZSB9fT5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17cG9pbnRzfSBmaWxsPVwibm9uZVwiIHN0cm9rZT17Y29sb3J9IHN0cm9rZVdpZHRoPXsyfSAvPlxuICAgIDwvc3ZnPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBDLCBGLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBNb3VzZUljb24gfSBmcm9tIFwiLi9pY29uc1wiO1xuXG4vKiogVGhlIGdseXBocyBkcmF3biBpbnNpZGUgYSBrZXljYXAgaW5zdGVhZCBvZiBhIGxldHRlci4gKi9cbmNvbnN0IEdMWVBIUzogUmVjb3JkPHN0cmluZywgbnVtYmVyW10+ID0ge1xuICBzcGFjZTogWzEuNSwgMSwgMS41LCA4LCAxNi41LCA4LCAxNi41LCAxXSxcbiAgZW50ZXI6IFsxNiwgMSwgMTYsIDcsIDMsIDcsIDcsIDMuNSwgMywgNywgNywgMTBdLFxufTtcblxuLyoqIEEga2V5IGFzIHRoZSBoaW50cyBkcmF3IGl0OiBhIGJyYWNrZXRlZCBsZXR0ZXIsIGEgdGlueSB3b3JkIChcIkVTQ1wiKSwgb3JcbiAqICBhIGdseXBoIChgazogXCJzcGFjZVwiYCwgYFwiZW50ZXJcImApLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEtleWNhcCh7IGssIGNvbG9yID0gQy5jeWFuIH06IHsgazogc3RyaW5nOyBjb2xvcj86IHN0cmluZyB9KSB7XG4gIGNvbnN0IGdseXBoID0gR0xZUEhTW2tdO1xuICBpZiAoZ2x5cGgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMjcsXG4gICAgICAgICAgaGVpZ2h0OiAyNyxcbiAgICAgICAgICBib3JkZXI6IDIsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IGNvbG9yLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAxOCAxMFwiIHN0eWxlPXt7IHdpZHRoOiAxNiwgaGVpZ2h0OiA5IH19PlxuICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9e2dseXBofSBmaWxsPVwibm9uZVwiIHN0cm9rZT17Y29sb3J9IHN0cm9rZVdpZHRoPXsyfSAvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIDwvbm9kZT5cbiAgICApO1xuICB9XG4gIGNvbnN0IHdvcmQgPSBrLmxlbmd0aCA+IDE7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIG1pbldpZHRoOiAyNyxcbiAgICAgICAgaGVpZ2h0OiAyNyxcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiB3b3JkID8gMyA6IDAgfSxcbiAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICBib3JkZXJDb2xvcjogY29sb3IsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRTaXplOiB3b3JkID8gMTEgOiAyMCxcbiAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgY29sb3IsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7a31cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBPbmUgaGludDogYSBrZXkgKG9yIHRoZSBtb3VzZSwgYGs6IFwibW91c2VcImApIGFuZCB3aGF0IGl0IGRvZXMuIENsaWNrYWJsZSxcbiAqICBsaWtlIHRoZSBnYW1lJ3MuICovXG5leHBvcnQgZnVuY3Rpb24gSGludCh7XG4gIGssXG4gIGxhYmVsLFxuICBvbkNsaWNrLFxuICBjb2xvciA9IEMucmVkLFxufToge1xuICBrOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIG9uQ2xpY2s/OiAoKSA9PiB2b2lkO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiA4LFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuY2xlYXIsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBvcGFjaXR5OiAwLjggfX1cbiAgICA+XG4gICAgICB7ayA9PT0gXCJtb3VzZVwiID8gPE1vdXNlSWNvbiAvPiA6IDxLZXljYXAgaz17a30gLz59XG4gICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMjUsIGNvbG9yLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+e2xhYmVsfTwvdGV4dD5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIFRoZSBoaW50IGJhciwgYm90dG9tIHJpZ2h0IG9mIGV2ZXJ5IHNjcmVlbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaW50cyh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICByaWdodDogNTIsXG4gICAgICAgIGJvdHRvbTogNDYsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMzAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIGN1dC1jb3JuZXIgYnV0dG9uOiBjeWFuIGxhYmVsIG9uIGEgZGFyayBwbGF0ZSBpbiBhIGRpbSByZWQgZnJhbWU7XG4gKiAgYnJpZ2h0ZXIgb24gaG92ZXIuIGBob3RgIGtlZXBzIGl0IGxpdCAoa2V5Ym9hcmQgZm9jdXMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEN1dEJ1dHRvbih7XG4gIGxhYmVsLFxuICBvbkNsaWNrLFxuICB3aWR0aCxcbiAgaGVpZ2h0ID0gNTIsXG4gIGssXG4gIGhvdCA9IGZhbHNlLFxuICBkaXNhYmxlZCA9IGZhbHNlLFxuICBzdHlsZSxcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgb25DbGljaz86ICgpID0+IHZvaWQ7XG4gIHdpZHRoPzogbnVtYmVyO1xuICBoZWlnaHQ/OiBudW1iZXI7XG4gIGs/OiBzdHJpbmc7XG4gIGhvdD86IGJvb2xlYW47XG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG59KSB7XG4gIGNvbnN0IGZyYW1lID0gaG90ID8gQy5jeWFuIDogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjQ1KVwiO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e2Rpc2FibGVkID8gdW5kZWZpbmVkIDogb25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLmNoYW1mZXIoQy5idXR0b24sIDEyLCBmcmFtZSwgMSksXG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMjQgfSxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMTIsXG4gICAgICAgIG9wYWNpdHk6IGRpc2FibGVkID8gMC40IDogMSxcbiAgICAgICAgLi4uc3R5bGUsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17ZGlzYWJsZWQgPyB1bmRlZmluZWQgOiBjaGFtZmVyKFwiIzFhMWEyY1wiLCAxMiwgQy5jeWFuLCAxKX1cbiAgICA+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLlQubWVudSxcbiAgICAgICAgICBmb250U2l6ZTogMjUsXG4gICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAwLjYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtsYWJlbH1cbiAgICAgIDwvdGV4dD5cbiAgICAgIHtrICYmIDxLZXljYXAgaz17a30gLz59XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBUaGUgaGVhZGVyIG9mIHRoZSBmdWxsLXNjcmVlbiBtZW51czogYSBsb25nIHJlZCBydWxlIGFjcm9zcyB0aGUgdG9wLFxuICogIHRoZSB0aXRsZSBpbiBjeWFuIHdpdGggaXRzIGJhZGdlIGFuZCBhIHN0YWNrIG9mIGJpbmFyeSwgYSByb3cgb2Ygc2VnbWVudHNcbiAqICB1bmRlciBpdCAodGhlIGN1cnJlbnQgc3RlcCBsaXQgY3lhbikgYW5kIGEgcmVkIGNhcHRpb24gYmVsb3cuICovXG5leHBvcnQgZnVuY3Rpb24gSGVhZGVyKHtcbiAgdGl0bGUsXG4gIGNhcHRpb24sXG4gIGljb24sXG4gIHN0ZXAgPSAwLFxuICBzdGVwcyA9IDUsXG4gIGxlZnQgPSA2MDYsXG59OiB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGNhcHRpb24/OiBzdHJpbmc7XG4gIC8qKiBUaGUgYmFkZ2UgbGVmdCBvZiB0aGUgdGl0bGUgKGEgc21hbGwgYDxzdmc+YCwgfjM0IHB4KS4gKi9cbiAgaWNvbj86IFJlYWN0Tm9kZTtcbiAgLyoqIFRoZSBsaXQgc2VnbWVudCAoMC1iYXNlZCk7IGAtMWAgbGlnaHRzIG5vbmUuICovXG4gIHN0ZXA/OiBudW1iZXI7XG4gIHN0ZXBzPzogbnVtYmVyO1xuICAvKiogV2hlcmUgdGhlIHRpdGxlIGJsb2NrIHN0YXJ0cywgcHguICovXG4gIGxlZnQ/OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IHNlZ21lbnQgPSAxMzg7XG4gIGNvbnN0IGdhcCA9IDY7XG4gIGNvbnN0IHdpZHRoID0gc3RlcHMgKiBzZWdtZW50ICsgKHN0ZXBzIC0gMSkgKiBnYXA7XG4gIGNvbnN0IHJ1bGUgPSBcInJnYmEoMjU1LCA5MywgODEsIDAuNzUpXCI7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICBoZWlnaHQ6IDEyMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHdpZHRoOiBsZWZ0IC0gOCxcbiAgICAgICAgICB0b3A6IDQ0LFxuICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICBhbmdsZTogOTAsXG4gICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4zNSlcIiB9LCB7IGNvbG9yOiBydWxlIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiBsZWZ0ICsgd2lkdGggKyA4LFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogNDQsXG4gICAgICAgICAgaGVpZ2h0OiAyLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGFuZ2xlOiA5MCxcbiAgICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogcnVsZSB9LCB7IGNvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMzUpXCIgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgdG9wOiA4LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDgsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtpY29ufVxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA3LCBjb2xvcjogQy5jeWFuLCBsaW5lSGVpZ2h0OiAxLjEgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtcIjAxMTAwMDExXFxuMDExMDEwMDBcXG4wMTEwMDAwMVxcbjAxMTEwMDEwXCJ9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e1QudGl0bGV9Pnt0aXRsZX08L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgdG9wOiA1MCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGdhcCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IHN0ZXBzIH0sIChfLCBpKSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiBzZWdtZW50LFxuICAgICAgICAgICAgICBoZWlnaHQ6IGkgPT09IHN0ZXAgPyAzIDogMixcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBpID09PSBzdGVwID8gQy5jeWFuIDogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjQ1KVwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIHtjYXB0aW9uICYmIChcbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uVC5jYXB0aW9uLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0LFxuICAgICAgICAgICAgdG9wOiA2NCxcbiAgICAgICAgICAgIHdpZHRoOiA3NjAsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtjYXB0aW9ufVxuICAgICAgICA8L3RleHQ+XG4gICAgICApfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEZpbGwgdGhlIHNjcmVlbiAoc2NyZWVucyBhcmUgYWJzb2x1dGVseSBwb3NpdGlvbmVkIGxheWVycykuICovXG5leHBvcnQgY29uc3QgRklMTDogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgbGVmdDogMCxcbiAgdG9wOiAwLFxuICByaWdodDogMCxcbiAgYm90dG9tOiAwLFxufTtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHR5cGUgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyB1c2VLZXlzIH0gZnJvbSBcIi4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYsIGNoYW1mZXIgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IFdhcm5pbmdJY29uIH0gZnJvbSBcIi4uL3VpL2ljb25zXCI7XG5pbXBvcnQgeyBGSUxMLCBLZXljYXAgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5cbi8qKiBIb3cgbWFueSBwbGF0ZXMgYXJlIHVwLiBFdmVyeSBsaXN0ZW5lciBoZWFycyBldmVyeSBrZXksIHNvIHdoaWxlIG9uZSBpc1xuICogIHVwIHRoZSBzY3JlZW4gdW5kZXIgaXQgbGVhdmVzIEVudGVyLCBFc2MgYW5kIGl0cyBvd24ga2V5cyBhbG9uZS4gKi9cbmxldCBvcGVuID0gMDtcblxuLyoqIFdoZXRoZXIgYSBjb25maXJtYXRpb24gcGxhdGUgaXMgdXAgKHNjcmVlbnMgY2hlY2sgaXQgaW4gdGhlaXIga2V5XG4gKiAgaGFuZGxlcnMpLiAqL1xuZXhwb3J0IGNvbnN0IG1vZGFsT3BlbiA9ICgpID0+IG9wZW4gPiAwO1xuXG4vKiogQSBjb25maXJtYXRpb24gb3ZlciB0aGUgY3VycmVudCBzY3JlZW46IHRoZSB3b3JsZCBkaW1tZWQsIHRoZSByZWQgcGxhdGVcbiAqICB3aXRoIHRoZSBxdWVzdGlvbiwgQ09ORklSTSBhbmQgQ0FOQ0VMIHVuZGVyIGl0LiBFbnRlciBjb25maXJtcywgRXNjXG4gKiAgY2FuY2Vscy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDb25maXJtKHtcbiAgdGV4dCxcbiAgb25Db25maXJtLFxuICBvbkNhbmNlbCxcbn06IHtcbiAgdGV4dDogc3RyaW5nO1xuICBvbkNvbmZpcm06ICgpID0+IHZvaWQ7XG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5GSUxMLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxLCAyLCA1LCAwLjg4KVwiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgZm9jdXNQb2xpY3k6IFwiYmxvY2tcIixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXt7fX1cbiAgICA+XG4gICAgICA8UGxhdGVcbiAgICAgICAgdGV4dD17dGV4dH1cbiAgICAgICAgaWNvbj17PFdhcm5pbmdJY29uIHNpemU9ezY0fSBjb2xvcj17Qy5yZWR9IC8+fVxuICAgICAgICBvbkNvbmZpcm09e29uQ29uZmlybX1cbiAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsfVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IFBMQVRFID0gXCIjNDkxYzI0XCI7XG5jb25zdCBUQUIgPSBcInJnYmEoMTUwLCAzNCwgMzAsIDAuNjIpXCI7XG5cbi8qKiBUaGUgcGxhdGUgaXRzZWxmOiBhIHRyYW5zbHVjZW50IHRhYiwgdGhlIGRhcmsgcmVkIHBhbmVsIHdpdGggYGljb25gIGluIGFcbiAqICB0aHVtYm5haWwtc2l6ZWQgaW5zZXQgYW5kIHRoZSBxdWVzdGlvbiwgdGhlIHR3byBidXR0b25zIHVuZGVyIGl0IChyaWdodFxuICogIGFsaWduZWQpLiBBbHNvIGxhaWQgaW5saW5lIG92ZXIgYSBzYXZlIHJvdy4gT3ducyBFbnRlciBhbmQgRXNjLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBsYXRlKHtcbiAgdGV4dCxcbiAgaWNvbixcbiAgb25Db25maXJtLFxuICBvbkNhbmNlbCxcbiAgc3R5bGUsXG59OiB7XG4gIHRleHQ6IHN0cmluZztcbiAgaWNvbjogUmVhY3ROb2RlO1xuICBvbkNvbmZpcm06ICgpID0+IHZvaWQ7XG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbn0pIHtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBvcGVuKys7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIG9wZW4tLTtcbiAgICB9O1xuICB9LCBbXSk7XG4gIGNvbnN0IGNvbmZpcm0gPSAoKSA9PiB7XG4gICAgc2Z4KFwiY29uZmlybVwiKTtcbiAgICBvbkNvbmZpcm0oKTtcbiAgfTtcbiAgY29uc3QgY2FuY2VsID0gKCkgPT4ge1xuICAgIHNmeChcImJhY2tcIik7XG4gICAgb25DYW5jZWwoKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gXCJFbnRlclwiKSBjb25maXJtKCk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGNhbmNlbCgpO1xuICB9KTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogNjkzLCBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDI2LCAuLi5zdHlsZSB9fT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiA2ODAsIGhlaWdodDogMTIwLCBmbGV4RGlyZWN0aW9uOiBcInJvd1wiIH19PlxuICAgICAgICA8VGFiIC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmNoYW1mZXIoUExBVEUsIDE2LCBDLnJlZCwgMSksXG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBnYXA6IDI2LFxuICAgICAgICAgICAgcGFkZGluZzogMTMsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxJbnNldD57aWNvbn08L0luc2V0PlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMjQsXG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgbGluZUhlaWdodDogMS4xNixcbiAgICAgICAgICAgICAgZmxleFNocmluazogMSxcbiAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogMiB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dGV4dH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgey8qIFRoZSBicmFja2V0IHJpZGluZyB0aGUgcGxhdGUncyByaWdodCBlZGdlLiAqL31cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgIHJpZ2h0OiAtNixcbiAgICAgICAgICAgICAgdG9wOiAyMCxcbiAgICAgICAgICAgICAgYm90dG9tOiAyMixcbiAgICAgICAgICAgICAgd2lkdGg6IDUsXG4gICAgICAgICAgICAgIGJvcmRlcjogeyB0b3A6IDEsIHJpZ2h0OiAxLCBib3R0b206IDEgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDYsIGFsaWduU2VsZjogXCJmbGV4RW5kXCIgfX0+XG4gICAgICAgIDxQbGF0ZUJ1dHRvbiBrPVwiZW50ZXJcIiBsYWJlbD1cIkNPTkZJUk1cIiBvbkNsaWNrPXtjb25maXJtfSAvPlxuICAgICAgICA8UGxhdGVCdXR0b24gaz1cIkVTQ1wiIGxhYmVsPVwiQ0FOQ0VMXCIgb25DbGljaz17Y2FuY2VsfSAvPlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSB0cmFuc2x1Y2VudCB0YWIgb24gdGhlIHBsYXRlJ3MgbGVmdCwgd2l0aCBpdHMgdGljay4gKi9cbmZ1bmN0aW9uIFRhYigpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IDQyLFxuICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLnJlZCxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiB7IGxlZnQ6IDYgfSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBUQUIsXG4gICAgICAgIG1hcmdpbjogeyByaWdodDogMSB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiA1OCxcbiAgICAgICAgICB3aWR0aDogMTUsXG4gICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5yZWQsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSB0aHVtYm5haWwtc2l6ZWQgd2VsbCB0aGUgcGxhdGUncyBwaWN0dXJlIGdsb3dzIGluLiAqL1xuZnVuY3Rpb24gSW5zZXQoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5jaGFtZmVyKFwiIzRlMWQyNVwiLCAxMiwgXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjI4KVwiLCAxKSxcbiAgICAgICAgd2lkdGg6IDE2OCxcbiAgICAgICAgaGVpZ2h0OiA5NCxcbiAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMSxcbiAgICAgICAgICB0b3A6IDEsXG4gICAgICAgICAgcmlnaHQ6IDEsXG4gICAgICAgICAgYm90dG9tOiAxLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJyYWRpYWxcIixcbiAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSgyNTUsIDcwLCA2MCwgMC4zKVwiIH0sXG4gICAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSgyNTUsIDcwLCA2MCwgMClcIiwgcG9zaXRpb246IFwiNzAlXCIgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQ09ORklSTSAvIENBTkNFTDogYSBrZXljYXAgYW5kIGEgcmVkIGxhYmVsIG9uIGEgZGFyayByZWQgcGxhdGUgaW4gYSB0ZWFsXG4gKiAgZnJhbWUuICovXG5mdW5jdGlvbiBQbGF0ZUJ1dHRvbih7XG4gIGssXG4gIGxhYmVsLFxuICBvbkNsaWNrLFxufToge1xuICBrOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLmNoYW1mZXIoXCIjNDQxNTE4XCIsIDEyLCBcIiMzMjhlOGZcIiwgMSksXG4gICAgICAgIHdpZHRoOiAxNjIsXG4gICAgICAgIGhlaWdodDogNDAsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogOSxcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiA4IH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17Y2hhbWZlcihcIiM1YzFhMWZcIiwgMTIsIEMuY3lhbiwgMSl9XG4gICAgPlxuICAgICAgPEtleWNhcCBrPXtrfSAvPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogMjQsXG4gICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgaW50ZXJwb2xhdGUsXG4gIHVzZVNoYXJlZFZhbHVlLFxuICB3aXRoRGVsYXksXG4gIHdpdGhTZXF1ZW5jZSxcbiAgd2l0aFRpbWluZyxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi9zb3VuZFwiO1xuaW1wb3J0IHsgUFJPTE9HVUUsIHR5cGUgTGlmZXBhdGgsIHR5cGUgU2F2ZSB9IGZyb20gXCIuLi9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiwgVCwgY2hhbWZlciB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgRklMTCwgSGludCwgSGludHMgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5cbi8qKiBUaGUgZ2FtZTogdGhlIGNob3NlbiBsaWZlcGF0aCdzIHdvcmxkLCBmdWxsIHNjcmVlbiAoYSBgPHBvcnRhbD5gIG9mIHRoZVxuICogIGB3b3JsZGAgY2FtZXJhKSwgYmx1cnJlZCB3aGlsZSBwYXVzZWQuIFJlbmRlcmVkIHVuZGVyIHRoZSBtZW51cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXb3JsZCh7IHBhdXNlZCB9OiB7IGxpZmVwYXRoOiBMaWZlcGF0aDsgcGF1c2VkOiBib29sZWFuIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8cG9ydGFsXG4gICAgICB0YXJnZXQ9XCJ3b3JsZFwiXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5GSUxMLFxuICAgICAgICBjYWNoZTogXCJuZXZlclwiLFxuICAgICAgICBmaWx0ZXI6IHsgbmFtZTogXCJibHVyXCIsIHBhcmFtczogeyByYWRpdXM6IHBhdXNlZCA/IDE0IDogMCB9IH0sXG4gICAgICAgIHRyYW5zaXRpb246IHsgZmlsdGVyOiB7IGR1cmF0aW9uOiAzMDAgfSB9LFxuICAgICAgfX1cbiAgICAvPlxuICApO1xufVxuXG4vKiogV2hldGhlciB0aGUgbmV4dCBIVUQgYW5ub3VuY2VzIHdoZXJlIHlvdSBhcmU6IGV2ZXJ5IGxvYWQgZG9lcyAoc2VlXG4gKiAgYExvYWRpbmdgKSwgYSByZXN1bWUgZnJvbSB0aGUgcGF1c2UgbWVudSBkb2Vzbid0LiAqL1xubGV0IGFycml2aW5nID0gdHJ1ZTtcbmV4cG9ydCBjb25zdCBhbm5vdW5jZUFycml2YWwgPSAoKSA9PiB7XG4gIGFycml2aW5nID0gdHJ1ZTtcbn07XG5cbi8qKiBUaGUgaW4tZ2FtZSBvdmVybGF5ICh1bnBhdXNlZCk6IHdoZXJlIHlvdSBhcmUsIHNsaWRpbmcgaW4gdG9wIGxlZnQgZm9yIGFcbiAqICBmZXcgc2Vjb25kcyBhZnRlciBhIGxvYWQsIGFuZCB0aGUgaGludCB0byBvcGVuIHRoZSBtZW51LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdhbWVIdWQoe1xuICBvblBhdXNlLFxuICBnYW1lLFxufToge1xuICBvblBhdXNlOiAoKSA9PiB2b2lkO1xuICAvKiogVGhlIHJ1bm5pbmcgZ2FtZSwgZm9yIHRoZSB0b2FzdCAod2l0aG91dCBpdDogdGhlIHN0cmVldCBraWQncyBmaXJzdFxuICAgKiAgc3RvcCkuICovXG4gIGdhbWU/OiBTYXZlO1xufSkge1xuICBjb25zdCBbYW5ub3VuY2VdID0gdXNlU3RhdGUoYXJyaXZpbmcpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGFycml2aW5nID0gZmFsc2U7XG4gIH0sIFtdKTtcbiAgY29uc3Qgd2hlcmUgPSBnYW1lID8/IFBST0xPR1VFLnN0cmVldGtpZDtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtGSUxMfT5cbiAgICAgIHthbm5vdW5jZSAmJiA8VG9hc3QgbG9jYXRpb249e3doZXJlLmxvY2F0aW9ufSBxdWVzdD17d2hlcmUucXVlc3R9IC8+fVxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludFxuICAgICAgICAgIGs9XCJFU0NcIlxuICAgICAgICAgIGxhYmVsPVwiUGF1c2VcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIHNmeChcImJhY2tcIik7XG4gICAgICAgICAgICBvblBhdXNlKCk7XG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvSGludHM+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogXCJLRVNTTEVSIC8gTEFOVEVSTiBBTExFWVwiLCB0aGUgam9iIHVuZGVyIGl0OiBhIEhVRCBwbGF0ZSB0aGF0IHNsaWRlcyBpbixcbiAqICBob2xkcywgYW5kIHNsaWRlcyBiYWNrIG91dCAob25lIHNoYXJlZCB2YWx1ZSwgQmV2eS1kcml2ZW4pLiAqL1xuZnVuY3Rpb24gVG9hc3QoeyBsb2NhdGlvbiwgcXVlc3QgfTogeyBsb2NhdGlvbjogc3RyaW5nOyBxdWVzdDogc3RyaW5nIH0pIHtcbiAgY29uc3QgdCA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHQudmFsdWUgPSB3aXRoRGVsYXkoXG4gICAgICA2MDAsXG4gICAgICB3aXRoU2VxdWVuY2UoXG4gICAgICAgIHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogMzYwLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0pLFxuICAgICAgICB3aXRoRGVsYXkoNDIwMCwgd2l0aFRpbWluZygwLCB7IGR1cmF0aW9uOiA0MjAsIGVhc2luZzogXCJlYXNlSW5cIiB9KSksXG4gICAgICApLFxuICAgICk7XG4gIH0sIFt0XSk7XG4gIGNvbnN0IFtkaXN0cmljdCwgcGxhY2UgPSBcIlwiXSA9IGxvY2F0aW9uLnNwbGl0KFwiOiBcIik7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiA2NCxcbiAgICAgICAgdG9wOiAxNTAsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIGdhcDogOCxcbiAgICAgICAgb3BhY2l0eTogeyBhbmltYXRlZDogdCB9LFxuICAgICAgICB0cmFuc2Zvcm06IHtcbiAgICAgICAgICB0cmFuc2xhdGVYOiB7IGFuaW1hdGVkOiBpbnRlcnBvbGF0ZSh0LCBbMCwgMV0sIFstNjAsIDBdKSB9LFxuICAgICAgICB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoXCJyZ2JhKDEwLCA4LCAxNCwgMC43MilcIiwgMTYsIFwicmdiYSgyNTUsIDkzLCA4MSwgMC42KVwiLCAxKSxcbiAgICAgICAgICB3aWR0aDogNDYwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgZ2FwOiAxNixcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDAsIHJpZ2h0OiAyMCwgdmVydGljYWw6IDEyIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiA0LCBiYWNrZ3JvdW5kQ29sb3I6IEMuY3lhbiB9fSAvPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDEwLCBjb2xvcjogQy5jeWFuRGltIH19PlxuICAgICAgICAgICAgRU5URVJJTkcgRElTVFJJQ1RcbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiA0MCxcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjUsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2Rpc3RyaWN0LnRvVXBwZXJDYXNlKCl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubGFiZWwsIGZvbnRTaXplOiAyMiwgbGV0dGVyU3BhY2luZzogMSB9fT5cbiAgICAgICAgICAgIHtwbGFjZS50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCB9fT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDgsIGhlaWdodDogOCwgYmFja2dyb3VuZENvbG9yOiBDLnllbGxvdyB9fSAvPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5ULmxhYmVsLFxuICAgICAgICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgICAgICAgY29sb3I6IEMueWVsbG93LFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2BKT0IgIMK3ICAke3F1ZXN0LnRvVXBwZXJDYXNlKCl9YH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICIvLyBUaGUgZnJvbnQgZW5kJ3Mgb3duIHN0YXRlIHNoYXBlcywgc2hhcmVkIGJ5IGV2ZXJ5IHNjcmVlbi4gRXZlcnl0aGluZyBpc1xuLy8gbWFkZSB1cCBhbmQgbGl2ZXMgaW4gUmVhY3Q6IHRoZSBjaGFyYWN0ZXIgYmVpbmcgY3JlYXRlZCwgdGhlIHNhdmUgc2xvdHMuXG5cbmV4cG9ydCB0eXBlIExpZmVwYXRoID0gXCJub21hZFwiIHwgXCJzdHJlZXRraWRcIiB8IFwiY29ycG9cIjtcbmV4cG9ydCB0eXBlIERpZmZpY3VsdHkgPSBcImVhc3lcIiB8IFwibm9ybWFsXCIgfCBcImhhcmRcIiB8IFwidmVyeWhhcmRcIjtcbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZUlkID1cbiAgfCBcImJvZHlcIlxuICB8IFwiaW50ZWxsaWdlbmNlXCJcbiAgfCBcInJlZmxleGVzXCJcbiAgfCBcInRlY2hcIlxuICB8IFwiY29vbFwiO1xuXG5leHBvcnQgY29uc3QgTElGRVBBVEhTOiB7IGlkOiBMaWZlcGF0aDsgbmFtZTogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogXCJub21hZFwiLCBuYW1lOiBcIk5vbWFkXCIgfSxcbiAgeyBpZDogXCJzdHJlZXRraWRcIiwgbmFtZTogXCJTdHJlZXRraWRcIiB9LFxuICB7IGlkOiBcImNvcnBvXCIsIG5hbWU6IFwiQ29ycG9cIiB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IERJRkZJQ1VMVElFUzogeyBpZDogRGlmZmljdWx0eTsgbmFtZTogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogXCJlYXN5XCIsIG5hbWU6IFwiRUFTWVwiIH0sXG4gIHsgaWQ6IFwibm9ybWFsXCIsIG5hbWU6IFwiTk9STUFMXCIgfSxcbiAgeyBpZDogXCJoYXJkXCIsIG5hbWU6IFwiSEFSRFwiIH0sXG4gIHsgaWQ6IFwidmVyeWhhcmRcIiwgbmFtZTogXCJWRVJZIEhBUkRcIiB9LFxuXTtcblxuLyoqIFRoZSBjaGFyYWN0ZXIgYmVpbmcgbWFkZSAoYW5kIHRoZSBvbmUgYSBzYXZlIGhvbGRzKS4gKi9cbmV4cG9ydCB0eXBlIENoYXJhY3RlciA9IHtcbiAgLyoqIFRoZSBzdHJlZXQgbmFtZSBvbiB0aGUgSUQgY2FyZC4gKi9cbiAgaGFuZGxlOiBzdHJpbmc7XG4gIGRpZmZpY3VsdHk6IERpZmZpY3VsdHk7XG4gIGxpZmVwYXRoOiBMaWZlcGF0aDtcbiAgLyoqIDAgb3IgMTogdGhlIHR3byBib2R5IHR5cGVzLiAqL1xuICBib2R5OiBudW1iZXI7XG4gIC8qKiAwID0gbWFzY3VsaW5lLCAxID0gZmVtaW5pbmUgdm9pY2UgdG9uZS4gKi9cbiAgdm9pY2U6IG51bWJlcjtcbiAgLyoqIEFwcGVhcmFuY2Ugb3B0aW9uIGlkIOKGkiBjaG9zZW4gaW5kZXggKHRoZSBvcHRpb25zIGxpdmUgd2l0aCB0aGUgbmV3XG4gICAqICBnYW1lIHNjcmVlbnMpLiAqL1xuICBsb29rOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICBhdHRyaWJ1dGVzOiBSZWNvcmQ8QXR0cmlidXRlSWQsIG51bWJlcj47XG59O1xuXG5leHBvcnQgY29uc3QgTkVXX0NIQVJBQ1RFUjogQ2hhcmFjdGVyID0ge1xuICBoYW5kbGU6IFwiTllYXCIsXG4gIGRpZmZpY3VsdHk6IFwibm9ybWFsXCIsXG4gIGxpZmVwYXRoOiBcInN0cmVldGtpZFwiLFxuICBib2R5OiAwLFxuICB2b2ljZTogMCxcbiAgbG9vazoge30sXG4gIGF0dHJpYnV0ZXM6IHsgYm9keTogMywgaW50ZWxsaWdlbmNlOiAzLCByZWZsZXhlczogMywgdGVjaDogMywgY29vbDogMyB9LFxufTtcblxuLyoqIE9uZSBzYXZlIHNsb3QuICovXG5leHBvcnQgdHlwZSBTYXZlID0ge1xuICBpZDogbnVtYmVyO1xuICAvKiogVGhlIHF1ZXN0IGl0IHdhcyBzYXZlZCBpbiAoXCJHdXR0ZXIgU2FpbnRzXCIpLiAqL1xuICBxdWVzdDogc3RyaW5nO1xuICAvKiogXCJNYW51YWxTYXZlLTNcIiwgXCJBdXRvU2F2ZS0wXCIsIFwiUXVpY2tTYXZlXCIuICovXG4gIG5hbWU6IHN0cmluZztcbiAgbG9jYXRpb246IHN0cmluZztcbiAgbGV2ZWw6IG51bWJlcjtcbiAgLyoqIE1pbnV0ZXMgcGxheWVkLiAqL1xuICBwbGF5dGltZTogbnVtYmVyO1xuICAvKiogV2hlbiBpdCB3YXMgc2F2ZWQsIGFzIHNob3duIChcIjEwLzA2LzkxLCAxMTo0MiBQTVwiKS4gKi9cbiAgZGF0ZTogc3RyaW5nO1xuICBjaGFyYWN0ZXI6IENoYXJhY3Rlcjtcbn07XG5cbi8qKiBFYWNoIGxpZmVwYXRoJ3Mgb3BlbmluZyBxdWVzdCBhbmQgd2hlcmUgaXQgc3RhcnRzLiAqL1xuZXhwb3J0IGNvbnN0IFBST0xPR1VFOiBSZWNvcmQ8TGlmZXBhdGgsIHsgcXVlc3Q6IHN0cmluZzsgbG9jYXRpb246IHN0cmluZyB9PiA9IHtcbiAgbm9tYWQ6IHsgcXVlc3Q6IFwiRHVzdCBSdW5cIiwgbG9jYXRpb246IFwiQmFkbGFuZHM6IFJlZCBNZXNhIFBhc3NcIiB9LFxuICBzdHJlZXRraWQ6IHsgcXVlc3Q6IFwiR3V0dGVyIFNhaW50c1wiLCBsb2NhdGlvbjogXCJLZXNzbGVyOiBMYW50ZXJuIEFsbGV5XCIgfSxcbiAgY29ycG86IHsgcXVlc3Q6IFwiR2xhc3MgQ2VpbGluZ1wiLCBsb2NhdGlvbjogXCJUZW5rYWkgVG93ZXI6IExvYmJ5IDNcIiB9LFxufTtcblxuLyoqIFRoZSBzYXZlcyB0aGF0IHNoaXAgd2l0aCB0aGUgZnJvbnQgZW5kLCBuZXdlc3QgZmlyc3QuICovXG5leHBvcnQgY29uc3QgU0VFRF9TQVZFUzogU2F2ZVtdID0gW1xuICB7XG4gICAgaWQ6IDMsXG4gICAgcXVlc3Q6IFwiR3V0dGVyIFNhaW50c1wiLFxuICAgIG5hbWU6IFwiUXVpY2tTYXZlXCIsXG4gICAgbG9jYXRpb246IFwiS2Vzc2xlcjogTmlnaHQgTWFya2V0XCIsXG4gICAgbGV2ZWw6IDE0LFxuICAgIHBsYXl0aW1lOiAxMzEyLFxuICAgIGRhdGU6IFwiMTAvMDYvOTEsIDExOjQyIFBNXCIsXG4gICAgY2hhcmFjdGVyOiB7IC4uLk5FV19DSEFSQUNURVIsIGxpZmVwYXRoOiBcInN0cmVldGtpZFwiIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogMixcbiAgICBxdWVzdDogXCJHbGFzcyBDZWlsaW5nXCIsXG4gICAgbmFtZTogXCJNYW51YWxTYXZlLTJcIixcbiAgICBsb2NhdGlvbjogXCJUZW5rYWkgVG93ZXI6IENvdW50ZXJpbnRlbFwiLFxuICAgIGxldmVsOiA2LFxuICAgIHBsYXl0aW1lOiAzODQsXG4gICAgZGF0ZTogXCIxMC8wNC85MSwgOToxMiBBTVwiLFxuICAgIGNoYXJhY3RlcjogeyAuLi5ORVdfQ0hBUkFDVEVSLCBoYW5kbGU6IFwiVkVHQVwiLCBsaWZlcGF0aDogXCJjb3Jwb1wiLCBib2R5OiAxIH0sXG4gIH0sXG4gIHtcbiAgICBpZDogMSxcbiAgICBxdWVzdDogXCJEdXN0IFJ1blwiLFxuICAgIG5hbWU6IFwiQXV0b1NhdmUtMVwiLFxuICAgIGxvY2F0aW9uOiBcIkJhZGxhbmRzOiBSZWQgTWVzYSBQYXNzXCIsXG4gICAgbGV2ZWw6IDIsXG4gICAgcGxheXRpbWU6IDQxLFxuICAgIGRhdGU6IFwiMDkvMjkvOTEsIDY6MDMgUE1cIixcbiAgICBjaGFyYWN0ZXI6IHsgLi4uTkVXX0NIQVJBQ1RFUiwgaGFuZGxlOiBcIlJVU1RcIiwgbGlmZXBhdGg6IFwibm9tYWRcIiB9LFxuICB9LFxuXTtcblxuLyoqIFwiMjE6NTJcIiBmcm9tIG1pbnV0ZXMuICovXG5leHBvcnQgZnVuY3Rpb24gcGxheXRpbWUobWludXRlczogbnVtYmVyKSB7XG4gIGNvbnN0IGggPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XG4gIGNvbnN0IG0gPSBtaW51dGVzICUgNjA7XG4gIHJldHVybiBgJHtofToke20udG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIil9YDtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgaW50ZXJwb2xhdGUsIHVzZVNoYXJlZFZhbHVlLCB3aXRoVGltaW5nIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi9zb3VuZFwiO1xuaW1wb3J0IHR5cGUgeyBMaWZlcGF0aCB9IGZyb20gXCIuLi9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiwgVCB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgUnVsZSB9IGZyb20gXCIuLi91aS9kZWNvclwiO1xuaW1wb3J0IHsgRklMTCB9IGZyb20gXCIuLi91aS9raXRcIjtcbmltcG9ydCB7IFdvcmRtYXJrIH0gZnJvbSBcIi4uL3VpL1dvcmRtYXJrXCI7XG5pbXBvcnQgeyBhbm5vdW5jZUFycml2YWwgfSBmcm9tIFwiLi9JbkdhbWVcIjtcbmltcG9ydCB7IExpZmVwYXRoSWNvbiB9IGZyb20gXCIuL3NhdmVzL2ljb25zXCI7XG5cbmNvbnN0IERVUkFUSU9OID0gMjQwMDtcbmNvbnN0IFNFR01FTlRTID0gMjQ7XG5cbi8qKiBXaGF0IHRoZSBzdHJlZXQgc2F5cyB3aGlsZSB0aGUgd29ybGQgbG9hZHMuICovXG5jb25zdCBUSVBTOiBSZWNvcmQ8TGlmZXBhdGgsIHN0cmluZz4gPSB7XG4gIG5vbWFkOlxuICAgIFwiT3V0IGluIHRoZSBCYWRsYW5kcyB0aGUgY2xhbiBpcyB5b3VyIGFybW9yLiBJbiBTYWJsZSBDaXR5LCBrZWVwIHlvdXIgY2FyIGNsb3NlIGFuZCB5b3VyIGV4aXRzIGNsb3Nlci5cIixcbiAgc3RyZWV0a2lkOlxuICAgIFwiS2Vzc2xlciBydW5zIG9uIGZhdm9ycy4gT3dlIHRoZSB3cm9uZyBmaXhlciBhbmQgdGhlIHdob2xlIGJsb2NrIGtub3dzIGJ5IHN1bmRvd24uXCIsXG4gIGNvcnBvOlxuICAgIFwiQXQgVGVua2FpIGV2ZXJ5IGVsZXZhdG9yIGhhcyBlYXJzLiBTcGVhayBsaWtlIHRoZSBib2FyZCBpcyBsaXN0ZW5pbmcsIGJlY2F1c2UgaXQgaXMuXCIsXG59O1xuXG4vKiogVGhlIGxvYWQgaW50byB0aGUgZ2FtZTogdGhlIHdvcmRtYXJrIHRpbHRlZCBvdmVyIHRoZSBkYXRhc2NhcGUsXG4gKiAgQlJFQUNISU5H4oCmIGluIGl0cyByZWQgYm94LCB0aGUgcHJvZ3Jlc3MgZmlsbGluZyBzZWdtZW50IGJ5IHNlZ21lbnQgKG9uZVxuICogIHNoYXJlZCB2YWx1ZSwgQmV2eS1kcml2ZW4pLCBhIHRpcCBmb3IgdGhlIGNob3NlbiBsaWZlcGF0aC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMb2FkaW5nKHtcbiAgbGlmZXBhdGgsXG4gIG9uRG9uZSxcbn06IHtcbiAgbGlmZXBhdGg6IExpZmVwYXRoO1xuICBvbkRvbmU6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IHByb2dyZXNzID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIGNvbnN0IGRvbmUgPSB1c2VSZWYob25Eb25lKTtcbiAgZG9uZS5jdXJyZW50ID0gb25Eb25lO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNmeChcImJvb3RcIik7XG4gICAgYW5ub3VuY2VBcnJpdmFsKCk7XG4gICAgcHJvZ3Jlc3MudmFsdWUgPSB3aXRoVGltaW5nKDEsIHtcbiAgICAgIGR1cmF0aW9uOiBEVVJBVElPTiAtIDIwMCxcbiAgICAgIGVhc2luZzogXCJlYXNlSW5cIixcbiAgICB9KTtcbiAgICBjb25zdCB0ID0gc2V0VGltZW91dCgoKSA9PiBkb25lLmN1cnJlbnQoKSwgRFVSQVRJT04pO1xuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQodCk7XG4gIH0sIFtwcm9ncmVzc10pO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPFdvcmRtYXJrXG4gICAgICAgIHdpZHRoPXsxMjQwfVxuICAgICAgICBnbGl0Y2g9ezAuM31cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzMDAsXG4gICAgICAgICAgdG9wOiAzMDAsXG4gICAgICAgICAgdHJhbnNmb3JtM2Q6IHtcbiAgICAgICAgICAgIHBlcnNwZWN0aXZlOiAxNTAwLFxuICAgICAgICAgICAgcm90YXRlWDogMjQsXG4gICAgICAgICAgICByb3RhdGVZOiAtMTgsXG4gICAgICAgICAgICByb3RhdGVaOiAtNyxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICB0b3A6IDgyNixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDE4NiwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAzIH19PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGNvbG9yOiBDLnJlZERpbSB9fT5cbiAgICAgICAgICAgIHtcIk1PREVMIExJTkUgICAgICAgMS4yMDAxQVwifVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgaGVpZ2h0OiA0NixcbiAgICAgICAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDIwLCA2LCAxMCwgMC42KVwiLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMzAsXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEsXG4gICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIGNhY2hlOiBcIm5ldmVyXCIsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBcImdsaXRjaFwiLFxuICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7IGludGVuc2l0eTogMC41LCBmcmVxdWVuY3k6IDAuNiwgdGVhcjogMTAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBCUkVBQ0hJTkcuLi5cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAyIH19PlxuICAgICAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBTRUdNRU5UUyB9LCAoXywgaSkgPT4gKFxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgICAgIGhlaWdodDogNCxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuY3lhbixcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiB7XG4gICAgICAgICAgICAgICAgICBhbmltYXRlZDogaW50ZXJwb2xhdGUoXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICBbaSAvIFNFR01FTlRTLCAoaSArIDEpIC8gU0VHTUVOVFNdLFxuICAgICAgICAgICAgICAgICAgICBbMC4xMiwgMV0sXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiA2NDAsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyMCwgNiwgMTAsIDAuNSlcIixcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgZ2FwOiAxMixcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTIsIHZlcnRpY2FsOiA3IH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxMaWZlcGF0aEljb24gbGlmZXBhdGg9e2xpZmVwYXRofSBzaXplPXsyMn0gLz5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDE3LFxuICAgICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IDEuMixcbiAgICAgICAgICAgICAgZmxleFNocmluazogMSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge1RJUFNbbGlmZXBhdGhdfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBjb2xvcjogQy5yZWREaW0gfX0+XG4gICAgICAgICAge1wi4paIIFNDX0RCXzk0MzUwMy40MzA4ODM5NDU2XCJ9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPFJ1bGUgd2lkdGg9ezExMDB9IGNvbG9yPXtDLnJlZERpbX0gLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQywgRiwgVCB9IGZyb20gXCIuLi90aGVtZVwiO1xuXG4vKiogQSB0aW55IGRldGVybWluaXN0aWMgZ2VuZXJhdG9yLCBzbyB0aGUgZGF0YSBub2lzZSBpcyBzdGFibGUgcGVyIHNlZWQuICovXG5leHBvcnQgZnVuY3Rpb24gcm5nKHNlZWQ6IG51bWJlcikge1xuICBsZXQgcyA9IHNlZWQgKiAyNjU0NDM1NzYxICsgMTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBzIF49IHMgPDwgMTM7XG4gICAgcyBePSBzID4+PiAxNztcbiAgICBzIF49IHMgPDwgNTtcbiAgICByZXR1cm4gKHMgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cblxuY29uc3QgSEVYID0gXCIwMTIzNDU2Nzg5QUJDREVGXCI7XG5cbi8qKiBMaW5lcyBvZiBoZXggZ3JvdXBzLCBsaWtlIHRoZSByZWFkb3V0cyBzdHJld24gYXJvdW5kIHRoZSBnYW1lJ3MgZnJhbWVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vaXNlTGluZXMoc2VlZDogbnVtYmVyLCBsaW5lczogbnVtYmVyLCBncm91cHM6IG51bWJlcikge1xuICBjb25zdCByID0gcm5nKHNlZWQpO1xuICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogbGluZXMgfSwgKCkgPT5cbiAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBncm91cHMgfSwgKCkgPT5cbiAgICAgIEFycmF5LmZyb20oXG4gICAgICAgIHsgbGVuZ3RoOiA0ICsgTWF0aC5mbG9vcihyKCkgKiA1KSB9LFxuICAgICAgICAoKSA9PiBIRVhbTWF0aC5mbG9vcihyKCkgKiAxNildLFxuICAgICAgKS5qb2luKFwiXCIpLFxuICAgICkuam9pbihcIiBcIiksXG4gICk7XG59XG5cbi8qKiBBIGJsb2NrIG9mIGRhdGEgbm9pc2UgaW4gdGhlIG1pY3JvIG1vbm8gZmFjZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEYXRhTm9pc2Uoe1xuICBzZWVkLFxuICBsaW5lcyA9IDQsXG4gIGdyb3VwcyA9IDQsXG4gIGNvbG9yID0gQy5yZWREaW0sXG4gIHN0eWxlLFxufToge1xuICBzZWVkOiBudW1iZXI7XG4gIGxpbmVzPzogbnVtYmVyO1xuICBncm91cHM/OiBudW1iZXI7XG4gIGNvbG9yPzogc3RyaW5nO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBjb2xvciwgLi4uc3R5bGUgfX0+XG4gICAgICB7bm9pc2VMaW5lcyhzZWVkLCBsaW5lcywgZ3JvdXBzKS5qb2luKFwiXFxuXCIpfVxuICAgIDwvdGV4dD5cbiAgKTtcbn1cblxuLyoqIFRoZSBzdGFtcCBpbiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSBmdWxsLXNjcmVlbiBtZW51czogYSBtYXJrLCBhXG4gKiAgcHJvdG9jb2wgbnVtYmVyLCBhbmQgdGhlIHNtYWxsIHByaW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFByb3RvY29sU3RhbXAoeyBzdHlsZSB9OiB7IHN0eWxlPzogQmV2eVN0eWxlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDUwLFxuICAgICAgICB0b3A6IDQyLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBnYXA6IDQsXG4gICAgICAgIC4uLnN0eWxlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDEwLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiIH19PlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIgfX0+XG4gICAgICAgICAge1szOCwgMjYsIDM0LCAyMF0ubWFwKCh3LCBpKSA9PiAoXG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiB3LCBoZWlnaHQ6IDMsIGJhY2tncm91bmRDb2xvcjogQy5yZWREaW0gfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDksIGNvbG9yOiBDLnJlZERpbSB9fT5cbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIk9OTFkgU0NQRCBDTEFTUy00IFRFQ0hTXFxuTUFZIEFDQ0VTUywgT1BFUkFURSBPUlxcbkRJU0FCTEUgVEhJUyBERVZJQ0UuXCJcbiAgICAgICAgICB9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICBjb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge1wiUFJPVE9DT0xcXG43NzQxLUIwOVwifVxuICAgICAgPC90ZXh0PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgIGhlaWdodDogMTEsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLnJlZERlZXAsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxOCB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogOCwgY29sb3I6IFwiI2ZmYjNhZFwiIH19PlxuICAgICAgICAgIFNCTCAwNDQgQ0tDIDE1MSBDQzEwIEE1NVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSB0aGluIHJ1bGUgd2l0aCBhIGNhcHRpb24sIGxpa2UgdGhlIG9uZXMgZnJhbWluZyB0aGUgZ2FtZSdzIHBhbmVscy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSdWxlKHtcbiAgd2lkdGgsXG4gIGxhYmVsLFxuICBjb2xvciA9IEMucmVkRGltLFxuICBzdHlsZSxcbn06IHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgbGFiZWw/OiBzdHJpbmc7XG4gIGNvbG9yPzogc3RyaW5nO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMsIHdpZHRoLCAuLi5zdHlsZSB9fT5cbiAgICAgIHtsYWJlbCAmJiA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogOCwgY29sb3IgfX0+e2xhYmVsfTwvdGV4dD59XG4gICAgICA8bm9kZSBzdHlsZT17eyBoZWlnaHQ6IDEsIGJhY2tncm91bmRDb2xvcjogY29sb3IgfX0gLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgZmFpbnQgZG90dGVkIHJhaWxzIGRvd24gYm90aCBlZGdlcyBvZiB0aGUgZnVsbC1zY3JlZW4gbWVudXMsIHdpdGggYVxuICogIHJvdGF0ZWQgcmVhZG91dCBvbiB0aGUgbGVmdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFZGdlUmFpbHMoKSB7XG4gIGNvbnN0IHJhaWwgPSAoc2lkZTogXCJsZWZ0XCIgfCBcInJpZ2h0XCIpOiBCZXZ5U3R5bGUgPT4gKHtcbiAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICBbc2lkZV06IDE4LFxuICAgIHRvcDogMCxcbiAgICBib3R0b206IDAsXG4gICAgd2lkdGg6IDMsXG4gICAgYm9yZGVyOiB7IGxlZnQ6IDEgfSxcbiAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjE4KVwiLFxuICB9KTtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPG5vZGUgc3R5bGU9e3JhaWwoXCJsZWZ0XCIpfSAvPlxuICAgICAgPG5vZGUgc3R5bGU9e3JhaWwoXCJyaWdodFwiKX0gLz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAtOTYsXG4gICAgICAgICAgdG9wOiA1MjAsXG4gICAgICAgICAgd2lkdGg6IDI0MCxcbiAgICAgICAgICBjb2xvcjogXCJyZ2JhKDE5OSwgNDYsIDQzLCAwLjcpXCIsXG4gICAgICAgICAgdHJhbnNmb3JtOiB7IHJvdGF0ZTogLTkwIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIERCIDEyNDQuNjM1MTMyIDEyNDQuNjM1MTMyIENQXG4gICAgICA8L3RleHQ+XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBUaGUgcmVzaWRlbnQtZGF0YWJhc2Ugc21hbGwgcHJpbnQgYXQgdGhlIGJvdHRvbSBsZWZ0IG9mIHRoZSBuZXctZ2FtZVxuICogIHNjcmVlbnM6IGEgbWFyayBvZiB0aHJlZSBwZWFrcywgdGhlIGRhdGFiYXNlJ3MgbmFtZSwgdGhlIGZpbmUgcHJpbnQuICovXG5leHBvcnQgZnVuY3Rpb24gTGVnYWxGb290ZXIoKSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiA1MCxcbiAgICAgICAgYm90dG9tOiAxMixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiAxMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDYwIDQwXCIgc3R5bGU9e3sgd2lkdGg6IDY2LCBoZWlnaHQ6IDQ0IH19PlxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIHBvaW50cz17WzIsIDM4LCAxNiwgOCwgMjYsIDI2LCAzMiwgMTQsIDQwLCAyOCwgNDYsIDYsIDU4LCAzOF19XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17Qy5yZWREaW19XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezIuNH1cbiAgICAgICAgICBzdHJva2VMaW5lam9pbj1cIm1pdGVyXCJcbiAgICAgICAgLz5cbiAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgcG9pbnRzPXtbMTAsIDM4LCAxOCwgMjIsIDI0LCAzOF19XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17Qy5yZWREaW19XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICBjb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAgbGluZUhlaWdodDogMS4xNSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge1wiU2FibGUgQ2l0eVxcblJlc2lkZW50XFxuRGF0YWJhc2VcIn1cbiAgICAgIDwvdGV4dD5cbiAgICAgIHsvKiBUaGUgd2lkdGggc2l0cyBvbiBhIHdyYXBwZXI6IGEgYDx0ZXh0PmAgd2l0aCBpdHMgb3duIHdpZHRoIGluIGFuXG4gICAgICAgICAgYGFsaWduSXRlbXM6IFwiY2VudGVyXCJgIHJvdyBpcyBtZWFzdXJlZCBvbmUgd29yZCBhIGxpbmUgKFRPRE8pLiAqL31cbiAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiA1MjAgfX0+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMC41LCBjb2xvcjogQy5yZWREaW0sIGxpbmVIZWlnaHQ6IDEuMjUgfX0+XG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJUaGUgZGF0YSB5b3UgZW50ZXIgb24gYSBDUkQgdGVybWluYWwgd2lsbCBvbmx5IGJlIHVzZWQgZm9yIHRoZSBwdXJwb3NlIHlvdSBlbnRlcmVkIGl0LiBZb3VyIHBlcnNvbmFsIGRhdGEgaXMgcHJvdGVjdGVkIHVuZGVyIHRoZSAyMDg4IFByaXZhY3kgQWN0IGFuZCB0aGUgU2FibGUgQ2l0eSBDaGFydGVyLCBleGNlcHQgd2hlcmUgaXQgaXMgbm90LiBJbiBhY2NvcmRhbmNlIHdpdGggR3JpZHdhdGNoIE1lbW8gNDQxMC1CLCB0ZXJtaW5hbHMgbWF5IHJldGFpbiBiaW9tZXRyaWMgc2FtcGxlcyBmb3IgdGhlIGR1cmF0aW9uIG9mIHlvdXIgc2Vzc2lvbiBhbmQgdGhlIHJlc3Qgb2YgeW91ciBsaWZlLlwiXG4gICAgICAgICAgfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTeW5jRXh0ZXJuYWxTdG9yZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCIuLi8uLi9iZXZ5XCI7XG5pbXBvcnQgeyBERUZBVUxUUywgUkVTT0xVVElPTlMgfSBmcm9tIFwiLi9kYXRhXCI7XG5cbmV4cG9ydCB0eXBlIFNldHRpbmdWYWx1ZSA9IG51bWJlciB8IGJvb2xlYW4gfCBzdHJpbmc7XG5cbi8qKiBUaGUgc2V0dGluZ3MsIGJ5IHJvdyBpZCAoYGRhdGEudHNgKS4gS2VwdCBvbiBgZ2xvYmFsVGhpc2Agc28gYSBob3RcbiAqICByZWxvYWQgKHdoaWNoIHJlLXJ1bnMgdGhpcyBtb2R1bGUpIGtlZXBzIHRoZW0uICovXG50eXBlIFN0b3JlID0ge1xuICB2YWx1ZXM6IFJlY29yZDxzdHJpbmcsIFNldHRpbmdWYWx1ZT47XG4gIGxpc3RlbmVyczogU2V0PCgpID0+IHZvaWQ+O1xufTtcblxuY29uc3QgZyA9IGdsb2JhbFRoaXMgYXMgeyBfX2N5YmVycHVua1NldHRpbmdzPzogU3RvcmUgfTtcbmNvbnN0IHN0b3JlOiBTdG9yZSA9IChnLl9fY3liZXJwdW5rU2V0dGluZ3MgPz89IHtcbiAgdmFsdWVzOiB7fSxcbiAgbGlzdGVuZXJzOiBuZXcgU2V0KCksXG59KTtcbi8vIFJvd3MgYWRkZWQgc2luY2UgdGhlIGxhc3QgcmVsb2FkIHN0YXJ0IGF0IHRoZWlyIGRlZmF1bHRzLlxuc3RvcmUudmFsdWVzID0geyAuLi5ERUZBVUxUUywgLi4uc3RvcmUudmFsdWVzIH07XG5cbmZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcjogKCkgPT4gdm9pZCkge1xuICBzdG9yZS5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgcmV0dXJuICgpID0+IHN0b3JlLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xufVxuXG4vKiogRXZlcnkgc2V0dGluZywgcmUtcmVuZGVyaW5nIG9uIGNoYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VTZXR0aW5ncygpIHtcbiAgcmV0dXJuIHVzZVN5bmNFeHRlcm5hbFN0b3JlKHN1YnNjcmliZSwgKCkgPT4gc3RvcmUudmFsdWVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNldHRpbmdzKHZhbHVlczogUmVjb3JkPHN0cmluZywgU2V0dGluZ1ZhbHVlPikge1xuICBzdG9yZS52YWx1ZXMgPSB7IC4uLnN0b3JlLnZhbHVlcywgLi4udmFsdWVzIH07XG4gIHN0b3JlLmxpc3RlbmVycy5mb3JFYWNoKChsKSA9PiBsKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2V0dGluZyhpZDogc3RyaW5nLCB2YWx1ZTogU2V0dGluZ1ZhbHVlKSB7XG4gIHNldFNldHRpbmdzKHsgW2lkXTogdmFsdWUgfSk7XG59XG5cbi8qKiBQdXNoIHRoZSBzZXR0aW5ncyBCZXZ5IGFwcGxpZXMg4oCUIHRoZSB2b2x1bWVzLCB0aGUgY2FtZXJhLCB0aGUgZ2FtbWEg4oCUIG9uXG4gKiAgbW91bnQgYW5kIHdoZW5ldmVyIHRoZXkgY2hhbmdlLiBWSURFTyBvbmx5IG9uIGNoYW5nZTogb24gbW91bnQgaXQgd291bGRcbiAqICBvbmx5IGZvcmNlIHRoZSB3aW5kb3cgbWFpbi5ycyBvcGVuZWQgYmFjayB0byB0aGUgc3RvcmVkIGRlZmF1bHRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxpdmVTZXR0aW5ncygpIHtcbiAgY29uc3QgdiA9IHVzZVNldHRpbmdzKCk7XG4gIGNvbnN0IG4gPSAoaWQ6IHN0cmluZykgPT4gTnVtYmVyKHZbaWRdKTtcbiAgdXNlUHVzaChcbiAgICB7IG1hc3RlcjogbihcIm1hc3RlclwiKSAvIDEwMCwgc2Z4OiBuKFwic2Z4XCIpIC8gMTAwLCBtdXNpYzogbihcIm11c2ljXCIpIC8gMTAwIH0sXG4gICAgYmV2eS5zb3VuZC52b2x1bWUsXG4gICk7XG4gIHVzZVB1c2goXG4gICAge1xuICAgICAgZm92OiBuKFwiZm92XCIpLFxuICAgICAgYWJlcnJhdGlvbjogdi5hYmVycmF0aW9uID09PSB0cnVlLFxuICAgICAgZm9jdXM6IHYuZm9jdXMgPT09IHRydWUsXG4gICAgICBmbGFyZTogdi5mbGFyZSA9PT0gdHJ1ZSxcbiAgICAgIGJsdXI6IG4oXCJibHVyXCIpLFxuICAgIH0sXG4gICAgYmV2eS5zZXR0aW5ncy5ncmFwaGljcyxcbiAgKTtcbiAgdXNlUHVzaCh7IHZhbHVlOiBuKFwiZ2FtbWFcIikgfSwgYmV2eS5zZXR0aW5ncy5nYW1tYSk7XG4gIGNvbnN0IFt3aWR0aCwgaGVpZ2h0XSA9IChSRVNPTFVUSU9OU1tuKFwicmVzb2x1dGlvblwiKV0gPz8gXCIweDBcIilcbiAgICAuc3BsaXQoXCJ4XCIpXG4gICAgLm1hcChOdW1iZXIpO1xuICB1c2VQdXNoKFxuICAgIHsgbW9kZTogbihcIm1vZGVcIiksIHdpZHRoLCBoZWlnaHQsIHZzeW5jOiB2LnZzeW5jID09PSB0cnVlIH0sXG4gICAgYmV2eS5zZXR0aW5ncy52aWRlbyxcbiAgICBmYWxzZSxcbiAgKTtcbn1cblxuLyoqIFNlbmQgYHZhbHVlYCB3aGVuZXZlciBpdCBkaWZmZXJzIGZyb20gd2hhdCB3YXMgbGFzdCBzZW50IChhbmQgb24gbW91bnQsXG4gKiAgdW5sZXNzIGBvbk1vdW50YCBpcyBmYWxzZSkuICovXG5mdW5jdGlvbiB1c2VQdXNoPFQ+KHZhbHVlOiBULCBwdXNoOiAodmFsdWU6IFQpID0+IHZvaWQsIG9uTW91bnQgPSB0cnVlKSB7XG4gIGNvbnN0IGtleSA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgY29uc3Qgc2VudCA9IHVzZVJlZihvbk1vdW50ID8gXCJcIiA6IGtleSk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbnQuY3VycmVudCA9PT0ga2V5KSByZXR1cm47XG4gICAgc2VudC5jdXJyZW50ID0ga2V5O1xuICAgIHB1c2goSlNPTi5wYXJzZShrZXkpKTtcbiAgfSwgW2tleSwgcHVzaF0pO1xufVxuIiwgIi8vIFRoZSBzZXR0aW5ncywgdGFiIGJ5IHRhYi4gRXZlcnkgcm93IHdpdGggYW4gYGlkYCBrZWVwcyBpdHMgdmFsdWUgaW4gdGhlXG4vLyBzdG9yZSB1bmRlciB0aGF0IGlkIChhIHNlbGVjdG9yIHN0b3JlcyB0aGUgY2hvc2VuIG9wdGlvbidzIGluZGV4KS4gUm93c1xuLy8gbWFya2VkIGxpdmUgaW4gdGhlIGNvbW1lbnRzIHJlYWNoIEJldnkgKGB1c2VMaXZlU2V0dGluZ3NgKTsgdGhlIHJlc3QgYXJlXG4vLyBrZXB0IGFuZCBzaG93biwgbGlrZSBhIG1lbnUgb2YgYSBnYW1lIHRoYXQgaXNuJ3QgcnVubmluZy5cblxuaW1wb3J0IHR5cGUgeyBTZXR0aW5nVmFsdWUgfSBmcm9tIFwiLi9zdG9yZVwiO1xuXG5leHBvcnQgdHlwZSBSb3cgPVxuICB8IHsga2luZDogXCJzZWN0aW9uXCI7IGxhYmVsOiBzdHJpbmcgfVxuICB8IHtcbiAgICAgIGtpbmQ6IFwic2VsZWN0XCI7XG4gICAgICBpZDogc3RyaW5nO1xuICAgICAgbGFiZWw6IHN0cmluZztcbiAgICAgIG9wdGlvbnM6IHN0cmluZ1tdO1xuICAgICAgZGVmOiBudW1iZXI7XG4gICAgfVxuICB8IHsga2luZDogXCJ0b2dnbGVcIjsgaWQ6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVmOiBib29sZWFuIH1cbiAgfCB7XG4gICAgICBraW5kOiBcInNsaWRlclwiO1xuICAgICAgaWQ6IHN0cmluZztcbiAgICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgICBtaW46IG51bWJlcjtcbiAgICAgIG1heDogbnVtYmVyO1xuICAgICAgc3RlcDogbnVtYmVyO1xuICAgICAgZGVmOiBudW1iZXI7XG4gICAgfVxuICB8IHsga2luZDogXCJrZXlcIjsgaWQ6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgZGVmOiBzdHJpbmcgfVxuICB8IHsga2luZDogXCJpbmZvXCI7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfTtcblxuZXhwb3J0IHR5cGUgU2xpZGVyID0gRXh0cmFjdDxSb3csIHsga2luZDogXCJzbGlkZXJcIiB9PjtcblxuZXhwb3J0IHR5cGUgVGFiSWQgPVxuICB8IFwic291bmRcIlxuICB8IFwiY29udHJvbHNcIlxuICB8IFwiZ2FtZXBsYXlcIlxuICB8IFwiZ3JhcGhpY3NcIlxuICB8IFwidmlkZW9cIlxuICB8IFwibGFuZ3VhZ2VcIlxuICB8IFwiaW50ZXJmYWNlXCJcbiAgfCBcImtleXNcIjtcblxuY29uc3Qgc2VjdGlvbiA9IChsYWJlbDogc3RyaW5nKTogUm93ID0+ICh7IGtpbmQ6IFwic2VjdGlvblwiLCBsYWJlbCB9KTtcbmNvbnN0IHNlbGVjdCA9IChcbiAgaWQ6IHN0cmluZyxcbiAgbGFiZWw6IHN0cmluZyxcbiAgb3B0aW9uczogc3RyaW5nW10sXG4gIGRlZiA9IDAsXG4pOiBSb3cgPT4gKHsga2luZDogXCJzZWxlY3RcIiwgaWQsIGxhYmVsLCBvcHRpb25zLCBkZWYgfSk7XG5jb25zdCB0b2dnbGUgPSAoaWQ6IHN0cmluZywgbGFiZWw6IHN0cmluZywgZGVmID0gZmFsc2UpOiBSb3cgPT4gKHtcbiAga2luZDogXCJ0b2dnbGVcIixcbiAgaWQsXG4gIGxhYmVsLFxuICBkZWYsXG59KTtcbmNvbnN0IHNsaWRlciA9IChcbiAgaWQ6IHN0cmluZyxcbiAgbGFiZWw6IHN0cmluZyxcbiAgbWluOiBudW1iZXIsXG4gIG1heDogbnVtYmVyLFxuICBkZWY6IG51bWJlcixcbiAgc3RlcCA9IDEsXG4pOiBTbGlkZXIgPT4gKHsga2luZDogXCJzbGlkZXJcIiwgaWQsIGxhYmVsLCBtaW4sIG1heCwgc3RlcCwgZGVmIH0pO1xuY29uc3Qga2V5ID0gKGlkOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmcsIGRlZjogc3RyaW5nKTogUm93ID0+ICh7XG4gIGtpbmQ6IFwia2V5XCIsXG4gIGlkLFxuICBsYWJlbCxcbiAgZGVmLFxufSk7XG5cbi8qKiBUaGUgd2luZG93ZWQgc2l6ZXMgVklERU8gb2ZmZXJzICgxNjo5KS4gKi9cbmV4cG9ydCBjb25zdCBSRVNPTFVUSU9OUyA9IFtcbiAgXCIxMjgweDcyMFwiLFxuICBcIjEzNjZ4NzY4XCIsXG4gIFwiMTYwMHg5MDBcIixcbiAgXCIxOTIweDEwODBcIixcbiAgXCIyNTYweDE0NDBcIixcbiAgXCIzMjAweDE4MDBcIixcbiAgXCIzODQweDIxNjBcIixcbl07XG5cbmNvbnN0IExBTkdVQUdFUyA9IFtcbiAgXCJFbmdsaXNoXCIsXG4gIFwiRGV1dHNjaFwiLFxuICBcIkVzcGHDsW9sXCIsXG4gIFwiRnJhbsOnYWlzXCIsXG4gIFwiSXRhbGlhbm9cIixcbiAgXCJQb2xza2lcIixcbiAgXCJQb3J0dWd1w6pzXCIsXG4gIFwixIxlxaF0aW5hXCIsXG4gIFwiTWFneWFyXCIsXG4gIFwiVMO8cmvDp2VcIixcbl07XG5cbi8qKiBHUkFQSElDUycgUXVpY2sgUHJlc2V0IG9wdGlvbnM7IHRoZSBsYXN0IG9uZSBpcyB3aGF0IHR3ZWFraW5nIGFueSByb3dcbiAqICB0aGUgcHJlc2V0cyBzZXQgdHVybnMgaXQgaW50by4gKi9cbmNvbnN0IFBSRVNFVF9OQU1FUyA9IFtcIkxvd1wiLCBcIk1lZGl1bVwiLCBcIkhpZ2hcIiwgXCJVbHRyYVwiLCBcIkN1c3RvbVwiXTtcbmV4cG9ydCBjb25zdCBDVVNUT00gPSBQUkVTRVRfTkFNRVMubGVuZ3RoIC0gMTtcblxuLyoqIFdoYXQgZWFjaCBwcmVzZXQgc2V0cyAoc2VsZWN0b3JzIGJ5IGluZGV4KS4gKi9cbmV4cG9ydCBjb25zdCBQUkVTRVRTOiBSZWNvcmQ8c3RyaW5nLCBTZXR0aW5nVmFsdWU+W10gPSBbXG4gIHsgdGV4dHVyZXM6IDAsIGFiZXJyYXRpb246IGZhbHNlLCBmb2N1czogZmFsc2UsIGZsYXJlOiBmYWxzZSwgYmx1cjogMCB9LFxuICB7IHRleHR1cmVzOiAxLCBhYmVycmF0aW9uOiB0cnVlLCBmb2N1czogZmFsc2UsIGZsYXJlOiB0cnVlLCBibHVyOiAwIH0sXG4gIHsgdGV4dHVyZXM6IDIsIGFiZXJyYXRpb246IHRydWUsIGZvY3VzOiB0cnVlLCBmbGFyZTogdHJ1ZSwgYmx1cjogMCB9LFxuICB7IHRleHR1cmVzOiAyLCBhYmVycmF0aW9uOiB0cnVlLCBmb2N1czogdHJ1ZSwgZmxhcmU6IHRydWUsIGJsdXI6IDIgfSxcbl07XG5cbi8qKiBUaGUgZ2FtbWEgc2NyZWVuJ3Mgb25lIHJvdyAobGl2ZSkuICovXG5leHBvcnQgY29uc3QgR0FNTUEgPSBzbGlkZXIoXCJnYW1tYVwiLCBcIkdhbW1hXCIsIDAuNSwgMiwgMSwgMC4wNSk7XG5cbmV4cG9ydCBjb25zdCBUQUJTOiB7IGlkOiBUYWJJZDsgbGFiZWw6IHN0cmluZzsgcm93czogUm93W10gfVtdID0gW1xuICB7XG4gICAgaWQ6IFwic291bmRcIixcbiAgICBsYWJlbDogXCJTT1VORFwiLFxuICAgIHJvd3M6IFtcbiAgICAgIHNlY3Rpb24oXCJEeW5hbWljIFJhbmdlXCIpLFxuICAgICAgc2VsZWN0KFwiZHluYW1pY1JhbmdlXCIsIFwiUHJlc2V0c1wiLCBbXG4gICAgICAgIFwiUmVmZXJlbmNlXCIsXG4gICAgICAgIFwiSGktRmkgU3RlcmVvXCIsXG4gICAgICAgIFwiSG9tZSBUaGVhdGVyXCIsXG4gICAgICAgIFwiTGF0ZSBOaWdodFwiLFxuICAgICAgICBcIkhlYWRwaG9uZXNcIixcbiAgICAgICAgXCJDb21wcmVzc2VkXCIsXG4gICAgICBdKSxcbiAgICAgIHNlY3Rpb24oXCJWb2x1bWVcIiksXG4gICAgICAvLyBMaXZlOiBtYXN0ZXIsIHNmeCBhbmQgbXVzaWMuXG4gICAgICBzbGlkZXIoXCJtYXN0ZXJcIiwgXCJNYXN0ZXIgVm9sdW1lXCIsIDAsIDEwMCwgMTAwKSxcbiAgICAgIHNsaWRlcihcInNmeFwiLCBcIlNGWCBWb2x1bWVcIiwgMCwgMTAwLCAxMDApLFxuICAgICAgc2xpZGVyKFwiZGlhbG9ndWVcIiwgXCJEaWFsb2d1ZSBWb2x1bWVcIiwgMCwgMTAwLCAxMDApLFxuICAgICAgc2xpZGVyKFwibXVzaWNcIiwgXCJNdXNpYyBWb2x1bWVcIiwgMCwgMTAwLCAxMDApLFxuICAgICAgc2xpZGVyKFwicmFkaW9cIiwgXCJWZWhpY2xlIFJhZGlvIFZvbHVtZVwiLCAwLCAxMDAsIDEwMCksXG4gICAgICBzZWN0aW9uKFwiTWlzY1wiKSxcbiAgICAgIHRvZ2dsZShcImFsZXJ0UGluZ3NcIiwgXCJNdXRlIEFsZXJ0IFBpbmdzXCIpLFxuICAgICAgdG9nZ2xlKFwic3RyZWFtU2FmZVwiLCBcIlN0cmVhbS1TYWZlIE11c2ljXCIpLFxuICAgICAgc2VjdGlvbihcIlN1YnRpdGxlc1wiKSxcbiAgICAgIHRvZ2dsZShcInN1YnNDaW5lbWF0aWNcIiwgXCJDaW5lbWF0aWNcIiwgdHJ1ZSksXG4gICAgICB0b2dnbGUoXCJzdWJzT3ZlcmhlYWRcIiwgXCJPdmVyaGVhZFwiLCB0cnVlKSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwiY29udHJvbHNcIixcbiAgICBsYWJlbDogXCJDT05UUk9MU1wiLFxuICAgIHJvd3M6IFtcbiAgICAgIHNsaWRlcihcInZpYnJhdGlvblwiLCBcIkNvbnRyb2xsZXIgVmlicmF0aW9uXCIsIDAsIDEwMCwgMTAwKSxcbiAgICAgIHNsaWRlcihcImlubmVyRGVhZFpvbmVcIiwgXCJJbm5lciBEZWFkIFpvbmVcIiwgMCwgMC41LCAwLjA1LCAwLjAxKSxcbiAgICAgIHNsaWRlcihcIm91dGVyRGVhZFpvbmVcIiwgXCJPdXRlciBEZWFkIFpvbmVcIiwgMC41LCAxLCAwLjksIDAuMDEpLFxuICAgICAgc2VjdGlvbihcIkZpcnN0LVBlcnNvbiBDYW1lcmEgKE1vdXNlKVwiKSxcbiAgICAgIHNsaWRlcihcInpvb21TZW5zaXRpdml0eVwiLCBcIlpvb20gU2Vuc2l0aXZpdHlcIiwgMCwgMiwgMSwgMC4xKSxcbiAgICAgIHNsaWRlcihcImZwVmVydGljYWxcIiwgXCJWZXJ0aWNhbCBTZW5zaXRpdml0eVwiLCAxLCAzMCwgNSksXG4gICAgICBzbGlkZXIoXCJmcEhvcml6b250YWxcIiwgXCJIb3Jpem9udGFsIFNlbnNpdGl2aXR5XCIsIDEsIDMwLCA1KSxcbiAgICAgIHRvZ2dsZShcImZwSW52ZXJ0WVwiLCBcIkludmVydCBWZXJ0aWNhbCBBeGlzXCIpLFxuICAgICAgdG9nZ2xlKFwiZnBJbnZlcnRYXCIsIFwiSW52ZXJ0IEhvcml6b250YWwgQXhpc1wiKSxcbiAgICAgIHNlY3Rpb24oXCJUaGlyZC1QZXJzb24gQ2FtZXJhIChNb3VzZSlcIiksXG4gICAgICBzbGlkZXIoXCJ0cFZlcnRpY2FsXCIsIFwiVmVydGljYWwgU2Vuc2l0aXZpdHlcIiwgMSwgMzAsIDMpLFxuICAgICAgc2xpZGVyKFwidHBIb3Jpem9udGFsXCIsIFwiSG9yaXpvbnRhbCBTZW5zaXRpdml0eVwiLCAxLCAzMCwgMyksXG4gICAgICB0b2dnbGUoXCJ0cEludmVydFlcIiwgXCJJbnZlcnQgVmVydGljYWwgQXhpc1wiKSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwiZ2FtZXBsYXlcIixcbiAgICBsYWJlbDogXCJHQU1FUExBWVwiLFxuICAgIHJvd3M6IFtcbiAgICAgIHNlY3Rpb24oXCJBY2Nlc3NpYmlsaXR5XCIpLFxuICAgICAgc2VsZWN0KFxuICAgICAgICBcImFpbUFzc2lzdFwiLFxuICAgICAgICBcIkFpbSBBc3Npc3RcIixcbiAgICAgICAgW1wiT2ZmXCIsIFwiTGlnaHRcIiwgXCJTdGFuZGFyZFwiLCBcIlN0cm9uZ1wiXSxcbiAgICAgICAgMixcbiAgICAgICksXG4gICAgICB0b2dnbGUoXCJzbmFwVG9UYXJnZXRcIiwgXCJTbmFwIHRvIFRhcmdldFwiLCB0cnVlKSxcbiAgICAgIHNlbGVjdChcbiAgICAgICAgXCJtZWxlZUFzc2lzdFwiLFxuICAgICAgICBcIkFpbSBBc3Npc3QgLSBNZWxlZVwiLFxuICAgICAgICBbXCJPZmZcIiwgXCJMaWdodFwiLCBcIlN0YW5kYXJkXCJdLFxuICAgICAgICAyLFxuICAgICAgKSxcbiAgICAgIHNlbGVjdChcImNhbWVyYVN3YXlcIiwgXCJDYW1lcmEgU3dheVwiLCBbXCJPZmZcIiwgXCJSZWR1Y2VkXCIsIFwiRnVsbFwiXSwgMiksXG4gICAgICBzZWN0aW9uKFwiUGVyZm9ybWFuY2VcIiksXG4gICAgICBzZWxlY3QoXCJjcm93ZERlbnNpdHlcIiwgXCJDcm93ZCBEZW5zaXR5XCIsIFtcIkxvd1wiLCBcIk1lZGl1bVwiLCBcIkhpZ2hcIl0sIDIpLFxuICAgICAgdG9nZ2xlKFwic2xvd1N0b3JhZ2VcIiwgXCJTbG93IFN0b3JhZ2UgTW9kZVwiKSxcbiAgICAgIHNlY3Rpb24oXCJNaXNjZWxsYW5lb3VzXCIpLFxuICAgICAgdG9nZ2xlKFwidHV0b3JpYWxzXCIsIFwiVHV0b3JpYWxzXCIsIHRydWUpLFxuICAgICAgc2VsZWN0KFxuICAgICAgICBcInNraXBEaWFsb2d1ZVwiLFxuICAgICAgICBcIlNraXBwaW5nIERpYWxvZ3VlXCIsXG4gICAgICAgIFtcIk9mZlwiLCBcIlNraXAgQnkgTGluZVwiLCBcIlNraXAgQWxsXCJdLFxuICAgICAgICAxLFxuICAgICAgKSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwiZ3JhcGhpY3NcIixcbiAgICBsYWJlbDogXCJHUkFQSElDU1wiLFxuICAgIHJvd3M6IFtcbiAgICAgIC8vIExpdmU6IGV2ZXJ5dGhpbmcgZnJvbSBGaWVsZCBvZiBWaWV3IHRvIE1vdGlvbiBCbHVyIChGaWxtIEdyYWluIGluXG4gICAgICAvLyB0aGUgVUkgaXRzZWxmKSwgYW5kIHRoZSBwcmVzZXQgdGhhdCBzZXRzIHRoZW0uXG4gICAgICBzZWxlY3QoXCJwcmVzZXRcIiwgXCJRdWljayBQcmVzZXRcIiwgUFJFU0VUX05BTUVTLCAyKSxcbiAgICAgIHNlbGVjdChcInRleHR1cmVzXCIsIFwiVGV4dHVyZSBRdWFsaXR5XCIsIFtcIkxvd1wiLCBcIk1lZGl1bVwiLCBcIkhpZ2hcIl0sIDIpLFxuICAgICAgc2VjdGlvbihcIkJhc2ljXCIpLFxuICAgICAgc2xpZGVyKFwiZm92XCIsIFwiRmllbGQgb2YgVmlld1wiLCA1MCwgMTAwLCA2MCksXG4gICAgICB0b2dnbGUoXCJmaWxtR3JhaW5cIiwgXCJGaWxtIEdyYWluXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwiYWJlcnJhdGlvblwiLCBcIkNocm9tYXRpYyBBYmVycmF0aW9uXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwiZm9jdXNcIiwgXCJEZXB0aCBvZiBGaWVsZFwiLCB0cnVlKSxcbiAgICAgIHRvZ2dsZShcImZsYXJlXCIsIFwiTGVucyBGbGFyZVwiLCB0cnVlKSxcbiAgICAgIHNlbGVjdChcImJsdXJcIiwgXCJNb3Rpb24gQmx1clwiLCBbXCJPZmZcIiwgXCJMb3dcIiwgXCJIaWdoXCJdKSxcbiAgICAgIHNlY3Rpb24oXCJBZHZhbmNlZFwiKSxcbiAgICAgIHRvZ2dsZShcImNvbnRhY3RTaGFkb3dzXCIsIFwiQ29udGFjdCBTaGFkb3dzXCIpLFxuICAgICAgc2VsZWN0KFwiYW5pc290cm9weVwiLCBcIkFuaXNvdHJvcHlcIiwgW1wiMVwiLCBcIjJcIiwgXCI0XCIsIFwiOFwiLCBcIjE2XCJdLCAyKSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidmlkZW9cIixcbiAgICBsYWJlbDogXCJWSURFT1wiLFxuICAgIHJvd3M6IFtcbiAgICAgIC8vIExpdmU6IFZTeW5jLCBXaW5kb3dlZCBNb2RlLCBSZXNvbHV0aW9uLlxuICAgICAgc2VjdGlvbihcIkRpc3BsYXlcIiksXG4gICAgICBzZWxlY3QoXCJtb25pdG9yXCIsIFwiTW9uaXRvclwiLCBbXCIwXCIsIFwiMVwiXSksXG4gICAgICB0b2dnbGUoXCJ2c3luY1wiLCBcIlZTeW5jXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwiZnBzQ2FwXCIsIFwiTWF4aW11bSBGUFNcIiksXG4gICAgICBzZWxlY3QoXCJtb2RlXCIsIFwiV2luZG93ZWQgTW9kZVwiLCBbXCJXaW5kb3dlZFwiLCBcIkJvcmRlcmxlc3NcIiwgXCJGdWxsc2NyZWVuXCJdKSxcbiAgICAgIC8vIFRoZSB3aW5kb3cgbWFpbi5ycyBvcGVucy5cbiAgICAgIHNlbGVjdChcInJlc29sdXRpb25cIiwgXCJSZXNvbHV0aW9uXCIsIFJFU09MVVRJT05TLCAyKSxcbiAgICAgIHsga2luZDogXCJpbmZvXCIsIGxhYmVsOiBcIkhEUiBNb2RlXCIsIHZhbHVlOiBcIk5vbmVcIiB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJsYW5ndWFnZVwiLFxuICAgIGxhYmVsOiBcIkxBTkdVQUdFXCIsXG4gICAgcm93czogW1xuICAgICAgc2VsZWN0KFwidm9pY2VMYW5ndWFnZVwiLCBcIkF1ZGlvXCIsIExBTkdVQUdFUyksXG4gICAgICBzZWxlY3QoXCJzdWJ0aXRsZUxhbmd1YWdlXCIsIFwiU3VidGl0bGVzXCIsIExBTkdVQUdFUyksXG4gICAgICBzZWxlY3QoXCJ0ZXh0TGFuZ3VhZ2VcIiwgXCJJbnRlcmZhY2VcIiwgTEFOR1VBR0VTKSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwiaW50ZXJmYWNlXCIsXG4gICAgbGFiZWw6IFwiSU5URVJGQUNFXCIsXG4gICAgcm93czogW1xuICAgICAgLy8gTGl2ZTogdGhlIEFwcCByZWFkcyBib3RoLlxuICAgICAgdG9nZ2xlKFwidWlHbGl0Y2hcIiwgXCJVSSBHbGl0Y2ggRWZmZWN0c1wiLCB0cnVlKSxcbiAgICAgIHRvZ2dsZShcInNjYW5saW5lc1wiLCBcIlNjYW5saW5lc1wiLCB0cnVlKSxcbiAgICAgIHNlbGVjdChcImNvbG9yYmxpbmRcIiwgXCJDb2xvcmJsaW5kIE1vZGVzXCIsIFtcbiAgICAgICAgXCJPZmZcIixcbiAgICAgICAgXCJQcm90YW5vcGlhXCIsXG4gICAgICAgIFwiRGV1dGVyYW5vcGlhXCIsXG4gICAgICAgIFwiVHJpdGFub3BpYVwiLFxuICAgICAgXSksXG4gICAgICBzZWxlY3QoXG4gICAgICAgIFwiZGFtYWdlTnVtYmVyc1wiLFxuICAgICAgICBcIkRhbWFnZSBOdW1iZXJzXCIsXG4gICAgICAgIFtcIk9mZlwiLCBcIkNyaXRpY2FsIE9ubHlcIiwgXCJCb3RoXCJdLFxuICAgICAgICAyLFxuICAgICAgKSxcbiAgICAgIHRvZ2dsZShcImhpdE1hcmtlclwiLCBcIkhpdCBNYXJrZXJcIiwgdHJ1ZSksXG4gICAgICBzZWN0aW9uKFwiSFVEIFZpc2liaWxpdHlcIiksXG4gICAgICB0b2dnbGUoXCJodWRNaW5pbWFwXCIsIFwiTWluaW1hcFwiLCB0cnVlKSxcbiAgICAgIHRvZ2dsZShcImh1ZEhlYWx0aFwiLCBcIkhlYWx0aCBCYXJcIiwgdHJ1ZSksXG4gICAgICB0b2dnbGUoXCJodWRBbW1vXCIsIFwiQW1tbyBDb3VudGVyXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwiaHVkUXVlc3RcIiwgXCJRdWVzdCBUcmFja2VyXCIsIHRydWUpLFxuICAgICAgdG9nZ2xlKFwiaHVkSGludHNcIiwgXCJIaW50c1wiLCB0cnVlKSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwia2V5c1wiLFxuICAgIGxhYmVsOiBcIktFWSBCSU5ESU5HU1wiLFxuICAgIHJvd3M6IFtcbiAgICAgIHNlY3Rpb24oXCJNZW1vcnkgUmVwbGF5XCIpLFxuICAgICAga2V5KFwia2V5LnJlcGxheVBhdXNlXCIsIFwiUGF1c2UgUmVwbGF5IChUb2dnbGUpXCIsIFwiU3BhY2VcIiksXG4gICAgICBrZXkoXCJrZXkucmVwbGF5Rm9yd2FyZFwiLCBcIkZhc3QtRm9yd2FyZCBSZXBsYXlcIiwgXCJLZXlFXCIpLFxuICAgICAga2V5KFwia2V5LnJlcGxheVJld2luZFwiLCBcIlJld2luZCBSZXBsYXlcIiwgXCJLZXlRXCIpLFxuICAgICAga2V5KFwia2V5LnJlcGxheUxheWVyXCIsIFwiU3dpdGNoIFJlcGxheSBMYXllclwiLCBcIlNoaWZ0TGVmdFwiKSxcbiAgICAgIGtleShcImtleS5yZXBsYXlFeGl0XCIsIFwiRXhpdCBSZXBsYXlcIiwgXCJLZXlYXCIpLFxuICAgICAgc2VjdGlvbihcIkdlbmVyYWxcIiksXG4gICAgICBrZXkoXCJrZXkuem9vbUluXCIsIFwiWm9vbSBJblwiLCBcIk1vdXNlV2hlZWxVcFwiKSxcbiAgICAgIGtleShcImtleS56b29tT3V0XCIsIFwiWm9vbSBPdXRcIiwgXCJNb3VzZVdoZWVsRG93blwiKSxcbiAgICAgIGtleShcImtleS50YWdcIiwgXCJUYWdcIiwgXCJNb3VzZU1pZGRsZVwiKSxcbiAgICAgIHNlY3Rpb24oXCJFeHBsb3JhdGlvbiBhbmQgQ29tYmF0XCIpLFxuICAgICAga2V5KFwia2V5LmZvcndhcmRcIiwgXCJNb3ZlIEZvcndhcmRcIiwgXCJLZXlXXCIpLFxuICAgICAga2V5KFwia2V5LmJhY2tcIiwgXCJNb3ZlIEJhY2t3YXJkXCIsIFwiS2V5U1wiKSxcbiAgICAgIGtleShcImtleS5sZWZ0XCIsIFwiTW92ZSBMZWZ0XCIsIFwiS2V5QVwiKSxcbiAgICAgIGtleShcImtleS5yaWdodFwiLCBcIk1vdmUgUmlnaHRcIiwgXCJLZXlEXCIpLFxuICAgICAga2V5KFwia2V5LmNyb3VjaFwiLCBcIkNyb3VjaFwiLCBcIktleUNcIiksXG4gICAgICBrZXkoXCJrZXkuaW50ZXJhY3RcIiwgXCJJbnRlcmFjdFwiLCBcIktleUZcIiksXG4gICAgXSxcbiAgfSxcbl07XG5cbi8qKiBFYWNoIHJvdydzIGRlZmF1bHQsIGJ5IGlkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKHJvd3M6IFJvd1tdKTogUmVjb3JkPHN0cmluZywgU2V0dGluZ1ZhbHVlPiB7XG4gIGNvbnN0IG91dDogUmVjb3JkPHN0cmluZywgU2V0dGluZ1ZhbHVlPiA9IHt9O1xuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSBpZiAoXCJpZFwiIGluIHJvdykgb3V0W3Jvdy5pZF0gPSByb3cuZGVmO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKiogRXZlcnkgc2V0dGluZydzIGRlZmF1bHQuICovXG5leHBvcnQgY29uc3QgREVGQVVMVFMgPSBkZWZhdWx0cyhbLi4uVEFCUy5mbGF0TWFwKCh0KSA9PiB0LnJvd3MpLCBHQU1NQV0pO1xuIiwgIi8vIFRoZSB3b3JkbWFyaydzIG91dGxpbmU6IGFuZ3VsYXIgc2xhc2hlZCBjYXBpdGFscywgc2hlYXJlZCwgd2l0aCBibGFkZXNcbi8vIHRyYWlsaW5nIG9mZiB0aGUgQywgdGhlIFkgYW5kIHRoZSBLLCBhbmQgb25lIGN1dCBzbGljZWQgdGhyb3VnaCB0aGUgbWlkZGxlXG4vLyBsZXR0ZXJzLiBHZW5lcmF0ZWQgb25jZSAoYSBwb2x5Z29uIHBlciBzdHJva2UgYW5kIGNvdW50ZXIsIHRoZSBjb3VudGVyc1xuLy8gd291bmQgdGhlIG90aGVyIHdheSBzbyB0aGV5IHN0YXkgb3BlbiB1bmRlciB0aGUgbm9uemVybyBmaWxsIHJ1bGUpLlxuZXhwb3J0IGNvbnN0IFdPUkRNQVJLX1ZJRVdCT1ggPSBcIi0xOCAtMjQgNjY4IDE3MFwiO1xuZXhwb3J0IGNvbnN0IFdPUkRNQVJLX0FTUEVDVCA9IDY2OCAvIDE3MDtcbmV4cG9ydCBjb25zdCBXT1JETUFSS19QQVRIID1cbiAgXCJNNTAuMyAtMi41IEw5Mi4zIC0yLjUgTDg4LjQgOS41IEw1MC40IDkuNSBMMjYuMSA4NS41IEw2NC4xIDg1LjUgTDYwLjMgOTcuNSBMMTguMyA5Ny41IEwxMC4xIDg1LjUgTDM0LjQgOS41WiBNMTAxLjkgLTQuNSBMMTE3LjkgLTQuNSBMMTIzLjMgMjUuNSBMMTQ3LjkgLTQuNSBMMTYzLjkgLTQuNSBMMTI2LjIgNDEuNSBMMTA4LjkgOTUuNSBMOTIuOSA5NS41IEwxMTAuMiA0MS41WiBNMTcxLjkgLTEuNSBMMjE3LjkgLTEuNSBMMjI0LjcgOC41IEwyMTUuOCAzNi41IEwyMDcuMiA0NC41IEwyMTIuNyA1Mi41IEwyMDEuMSA4OC41IEwxODcuOSA5OC41IEwxMzkuOSA5OC41WiBNMTc1LjEgMzguNSBMMTk3LjEgMzguNSBMMjAyLjQgMzQuNSBMMjA5LjUgMTIuNSBMMjA4LjEgMTAuNSBMMTg0LjEgMTAuNVogTTE1OS44IDg2LjUgTDE4My44IDg2LjUgTDE4OC40IDg0LjUgTDE5Ny40IDU2LjUgTDE5Ni4wIDU0LjUgTDE3MC4wIDU0LjVaIE0yNTQuOSA5NC4wIEwyNTMuMyA5OS4wIEwyNDIuNCA5OS4wWiBNMjM5LjYgLTMuNSBMMjkxLjYgLTMuNSBMMjg3LjcgOC41IEwyNTEuNyA4LjUgTDI0MS41IDQwLjUgTDI2OS41IDQwLjUgTDI2NS43IDUyLjUgTDIzNy43IDUyLjUgTDIyNy40IDg0LjUgTDI2My40IDg0LjUgTDI2Mi4wIDg4LjkgTDI0Mi45IDk2LjUgTDIwNy42IDk2LjVaIE0zMjMuNSA2Ni41IEwzMjEuNCAxMDIuMCBMMzA1LjQgMTAyLjAgTDMwNy40IDczLjAgTDI4My42IDgyLjUgTDI3Ny40IDEwMi4wIEwyNjEuNCAxMDIuMCBMMjY1LjIgODkuOVogTTI5OS42IC0wLjUgTDM0NS42IC0wLjUgTDM1Mi40IDkuNSBMMzQwLjkgNDUuNSBMMzMwLjMgNTMuNSBMMzI5LjggNjEuNyBMMzEzLjggNjguMSBMMzE0LjcgNTUuNSBMMjk3LjcgNTUuNSBMMjkwLjcgNzcuNCBMMjcyLjMgODQuN1ogTTMwMS41IDQzLjUgTDMyMy41IDQzLjUgTDMyOC44IDM5LjUgTDMzNy4xIDEzLjUgTDMzNS44IDExLjUgTDMxMS44IDExLjVaIE00MDguNiAzMi40IEw0MDQuMyA0Ni4wIEwzOTEuMSA1Ni4wIEwzNjEuMSA1Ni4wIEwzNDcuNiA5OC4wIEwzMzEuNiA5OC4wIEwzNDQuNCA1OC4yWiBNMzY5LjkgLTQuNSBMNDE1LjkgLTQuNSBMNDIyLjcgNS41IEw0MTUuNyAyNy4zIEwzNTEuNSA1My4wWiBNMzc5LjcgNDQuMCBMMzg2LjkgNDQuMCBMMzkxLjYgNDIuMCBMMzkyLjYgMzguOVogTTM3MS4yIDQxLjUgTDM4MC4yIDQxLjUgTDM5OS43IDMzLjcgTDQwNy40IDkuNSBMNDA2LjEgNy41IEwzODIuMSA3LjVaIE00MzcuMyAyMC45IEw0MTUuNSA4OS4wIEw0NDEuNSA4OS4wIEw0NjcuMSA5LjAgTDQ4NS41IDEuNiBMNDU2LjkgOTEuMCBMNDQzLjcgMTAxLjAgTDQwNS43IDEwMS4wIEwzOTguOSA5MS4wIEw0MTguOSAyOC4zWiBNNDMzLjkgLTEuNSBMNDQ5LjkgLTEuNSBMNDQ0LjQgMTUuOCBMNDc0LjIgMy45IEw0NzUuOSAtMS41IEw0ODcuNiAtMS41IEw0MjYuMCAyMy4xWiBNNDk1LjMgLTEuMCBMNTExLjMgLTEuMCBMNTE5LjUgNjEuMCBMNTM5LjMgLTEuMCBMNTU1LjMgLTEuMCBMNTIzLjMgOTkuMCBMNTA3LjMgOTkuMCBMNDk5LjIgMzcuMCBMNDc5LjMgOTkuMCBMNDYzLjMgOTkuMFogTTU2My40IDIuMCBMNTc5LjQgMi4wIEw1NjYuNiA0Mi4wIEw2MDUuNCAyLjAgTDYyMy40IDIuMCBMNTc4LjYgNDguMCBMNTkzLjQgMTAyLjAgTDU3NS40IDEwMi4wIEw1NjQuMiA2Mi4wIEw1NTguMiA2OC4wIEw1NDcuNCAxMDIuMCBMNTMxLjQgMTAyLjBaIE0zOS45IDkuMyBMLTEzLjUgMTUuNSBMLTEzLjUgMTUuNSBMNDAuOCAtMi4zWiBNMTA5LjUgOTMuMSBMNzYuMiAxNDEuNSBMNzYuMiAxNDEuNSBMOTQuOCA4OS45WiBNNjEwLjkgLTAuMyBMNjQ2LjQgLTIwLjAgTDY0Ni40IC0yMC4wIEw2MTYuNSA4LjNaIE01OTEuMSA5My43IEw2MzEuOCAxMzguMCBMNjMxLjggMTM4LjAgTDU3OC45IDEwNi4zWiBNMjA2LjMgMTEzLjUgTDYwNy40IDEwOC4wIEw2MDcuNCAxMDguMCBMMTk4LjYgMTE2LjZaIE0xNTEuNiAxMTEuOCBMMjA2LjYgMTExLjAgTDE5OC44IDExNC4yIEwxNTAuNiAxMTUuMlogTTMyMi45IDEyMi4xIEw1MzQuMiAxMTguMCBMNTM0LjIgMTE4LjAgTDMyMi40IDEyMy45WlwiO1xuIiwgImltcG9ydCB0eXBlIHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHVzZVNldHRpbmdzIH0gZnJvbSBcIi4uL3NjcmVlbnMvc2V0dGluZ3Mvc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7XG4gIFdPUkRNQVJLX0FTUEVDVCxcbiAgV09SRE1BUktfUEFUSCxcbiAgV09SRE1BUktfVklFV0JPWCxcbn0gZnJvbSBcIi4vd29yZG1hcmstcGF0aFwiO1xuXG4vKiogVGhlIHRpdGxlOiBDWUJFUlBVTksgaW4gc2xhc2hlZCBhY2lkLXllbGxvdyBjYXBpdGFscyBvdmVyIHRoZSB5ZWFyIGxpbmUsXG4gKiAgYnJlYWtpbmcgdXAgbm93IGFuZCB0aGVuIChhIGBnbGl0Y2hgIGZpbHRlciBpbiBidXJzdCBtb2RlIOKAlCB0aGUgc2hhZGVyXG4gKiAgZGVjaWRlcyB3aGVuLCBSZWFjdCByZW5kZXJzIG9uY2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFdvcmRtYXJrKHtcbiAgd2lkdGgsXG4gIGdsaXRjaDogY2hhbmNlID0gMC4xLFxuICBzdHlsZSxcbn06IHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgLyoqIENoYW5jZSBhIHF1YXJ0ZXIgc2Vjb25kIGdsaXRjaGVzOyAwID0gbmV2ZXIuICovXG4gIGdsaXRjaD86IG51bWJlcjtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG59KSB7XG4gIC8vIFVJIGdsaXRjaCBlZmZlY3RzIGNhbiBiZSBzd2l0Y2hlZCBvZmYgKElOVEVSRkFDRSBzZXR0aW5ncykuXG4gIGNvbnN0IGdsaXRjaCA9IHVzZVNldHRpbmdzKCkudWlHbGl0Y2ggPyBjaGFuY2UgOiAwO1xuICBjb25zdCBoZWlnaHQgPSB3aWR0aCAvIFdPUkRNQVJLX0FTUEVDVDtcbiAgY29uc3QgZGlnaXQgPSB3aWR0aCAqIDAuMDUyO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHQgKyBkaWdpdCAqIDAuNixcbiAgICAgICAgZmlsdGVyOlxuICAgICAgICAgIGdsaXRjaCA+IDBcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ2xpdGNoXCIsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7IGludGVuc2l0eTogMC45LCBmcmVxdWVuY3k6IGdsaXRjaCwgc2VlZDogNyB9LFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgLi4uc3R5bGUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzdmcgdmlld0JveD17V09SRE1BUktfVklFV0JPWH0gc3R5bGU9e3sgd2lkdGgsIGhlaWdodCB9fT5cbiAgICAgICAgPHBhdGggZD17V09SRE1BUktfUEFUSH0gZmlsbD17Qy55ZWxsb3d9IC8+XG4gICAgICA8L3N2Zz5cbiAgICAgIDxZZWFyXG4gICAgICAgIHNpemU9e2RpZ2l0fVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IHdpZHRoICogMC40NyxcbiAgICAgICAgICB0b3A6IGhlaWdodCAqIDAuNzgsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSB5ZWFyIGxpbmUgdW5kZXIgdGhlIHdvcmRtYXJrOiBzcGFjZWQgZGlnaXRzIHN0cnVuZyBvbiBhIHdpcmUuICovXG5mdW5jdGlvbiBZZWFyKHsgc2l6ZSwgc3R5bGUgfTogeyBzaXplOiBudW1iZXI7IHN0eWxlOiBCZXZ5U3R5bGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIixcbiAgICAgICAgZ2FwOiBzaXplICogMC4zNSxcbiAgICAgICAgLi4uc3R5bGUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtbXCIyXCIsIFwiMFwiLCBcIjlcIiwgXCIxXCJdLm1hcCgoZCwgaSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17ZCArIGl9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIixcbiAgICAgICAgICAgIGdhcDogc2l6ZSAqIDAuMzUsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICBmb250U2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgY29sb3I6IEMuY3lhbkRpbSxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ZH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAge2kgPCAzICYmIChcbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHNpemUgKiAxLjEsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxLjUsXG4gICAgICAgICAgICAgICAgbWFyZ2luOiB7IGJvdHRvbTogc2l6ZSAqIDAuMjIgfSxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuY3lhbkRpbSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgTGlmZXBhdGggfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcbmltcG9ydCB7IEMgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcblxuLy8gVGhlIGRhdGFzaGFyZCwgZHJhd24gaW4gaXNvbWV0cmljOiBhIHNsYWIgd2hvc2UgbGVuZ3RoIHJ1bnMgZG93bi1yaWdodFxuLy8gYW5kIHdob3NlIHdpZHRoIHJ1bnMgdXAtcmlnaHQgKDMwwrApLCBzZWVuIGZyb20gYWJvdmUgaXRzIG5lYXIgbG9uZyBzaWRlLlxuY29uc3QgTCA9IDkyO1xuY29uc3QgVyA9IDM0O1xuY29uc3QgVCA9IDc7XG4vKiogQSBwb2ludCBvbiB0aGUgc2xhYjogYHVgIGFsb25nIGl0cyBsZW5ndGgsIGB2YCBhY3Jvc3MgaXQgKGJvdGggMC4uMSksXG4gKiAgYHpgIHB4IGRvd24gaXRzIHRoaWNrbmVzcy4gKi9cbmNvbnN0IGF0ID0gKHU6IG51bWJlciwgdjogbnVtYmVyLCB6ID0gMCkgPT4gW1xuICA4ICsgMC44NjYgKiAodSAqIEwgKyB2ICogVyksXG4gIDMxICsgMC41ICogKHUgKiBMIC0gdiAqIFcpICsgeixcbl07XG4vKiogQSBwYXRjaCBvZiB0aGUgdG9wIGZhY2UuICovXG5jb25zdCBwYXRjaCA9ICh1MDogbnVtYmVyLCB1MTogbnVtYmVyLCB2MDogbnVtYmVyLCB2MTogbnVtYmVyKSA9PiBbXG4gIC4uLmF0KHUwLCB2MCksXG4gIC4uLmF0KHUxLCB2MCksXG4gIC4uLmF0KHUxLCB2MSksXG4gIC4uLmF0KHUwLCB2MSksXG5dO1xuLyoqIFRoZSBmYWNlIGhhbmdpbmcgdW5kZXIgdGhlIHRvcCBlZGdlIGZyb20gYCh1MCwgdjApYCB0byBgKHUxLCB2MSlgLiAqL1xuY29uc3Qgc2lkZSA9ICh1MDogbnVtYmVyLCB2MDogbnVtYmVyLCB1MTogbnVtYmVyLCB2MTogbnVtYmVyKSA9PiBbXG4gIC4uLmF0KHUwLCB2MCksXG4gIC4uLmF0KHUxLCB2MSksXG4gIC4uLmF0KHUxLCB2MSwgVCksXG4gIC4uLmF0KHUwLCB2MCwgVCksXG5dO1xuXG5jb25zdCBJTksgPSBcIiM0YTBmMTJcIjtcblxuLyoqIEEgcmVkIGRhdGFzaGFyZCwgdGhlIHNhdmUgZ2FtZSdzIG93biBpY29uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERhdGFzaGFyZCh7IHdpZHRoID0gMTE4IH06IHsgd2lkdGg/OiBudW1iZXIgfSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAxMjYgOTBcIiBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0OiAod2lkdGggKiA5MCkgLyAxMjYgfX0+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e3NpZGUoMCwgMCwgMSwgMCl9IGZpbGw9XCIjYTgzMDJiXCIgLz5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17c2lkZSgxLCAwLCAxLCAxKX0gZmlsbD1cIiNkMzQ2M2NcIiAvPlxuICAgICAgPHBvbHlnb24gcG9pbnRzPXtwYXRjaCgwLCAxLCAwLCAxKX0gZmlsbD1cIiNmZjY0NTdcIiAvPlxuICAgICAgey8qIFRoZSBjb250YWN0cywgdGhlIGxhYmVsIHN0cmlwLCB0aGUgcHJpbnRlZCBsaW5lcy4gKi99XG4gICAgICA8cG9seWdvbiBwb2ludHM9e3BhdGNoKDAuMDMsIDAuMTIsIDAuMTIsIDAuNDIpfSBmaWxsPXtJTkt9IC8+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e3BhdGNoKDAuMDUsIDAuMSwgMC41NSwgMC44OCl9IGZpbGw9e0lOS30gb3BhY2l0eT17MC43fSAvPlxuICAgICAgPHBvbHlnb24gcG9pbnRzPXtwYXRjaCgwLjM2LCAwLjk2LCAwLjEsIDAuMzYpfSBmaWxsPXtJTkt9IC8+XG4gICAgICA8cG9seWdvbiBwb2ludHM9e3BhdGNoKDAuMTcsIDAuNjYsIDAuOCwgMC44NSl9IGZpbGw9e0lOS30gb3BhY2l0eT17MC44fSAvPlxuICAgICAgPHBvbHlnb25cbiAgICAgICAgcG9pbnRzPXtwYXRjaCgwLjE3LCAwLjUyLCAwLjY4LCAwLjcyKX1cbiAgICAgICAgZmlsbD17SU5LfVxuICAgICAgICBvcGFjaXR5PXswLjZ9XG4gICAgICAvPlxuICAgICAgPHBvbHlnb25cbiAgICAgICAgcG9pbnRzPXtwYXRjaCgwLjE3LCAwLjMsIDAuNDgsIDAuNTgpfVxuICAgICAgICBmaWxsPXtJTkt9XG4gICAgICAgIG9wYWNpdHk9ezAuNTV9XG4gICAgICAvPlxuICAgICAgPHBvbHlnb24gcG9pbnRzPXtwYXRjaCgwLjg4LCAwLjksIDAsIDEpfSBmaWxsPVwiI2I4MzYyZlwiIC8+XG4gICAgICA8cG9seWxpbmVcbiAgICAgICAgcG9pbnRzPXtbLi4uYXQoMCwgMSksIC4uLmF0KDEsIDEpLCAuLi5hdCgxLCAwKV19XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPVwiI2ZmOWE4ZlwiXG4gICAgICAgIHN0cm9rZVdpZHRoPXswLjh9XG4gICAgICAvPlxuICAgIDwvc3ZnPlxuICApO1xufVxuXG4vKiogVGhlIGxpZmVwYXRocycgYmFkZ2VzOiBhIHJlZCBkaXNjIHdpdGggYSBkYXJrIGdseXBoIOKAlCBhIHJvYWQgZm9yIHRoZVxuICogIE5vbWFkLCBhIHRhZyBmb3IgdGhlIFN0cmVldGtpZCwgYSBnbG9iZSBmb3IgdGhlIENvcnBvLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpZmVwYXRoSWNvbih7XG4gIGxpZmVwYXRoLFxuICBzaXplID0gMjAsXG59OiB7XG4gIGxpZmVwYXRoOiBMaWZlcGF0aDtcbiAgc2l6ZT86IG51bWJlcjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjAgMjBcIiBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplIH19PlxuICAgICAgPGNpcmNsZSBjeD17MTB9IGN5PXsxMH0gcj17OS41fSBmaWxsPXtDLnJlZH0gLz5cbiAgICAgIHtsaWZlcGF0aCA9PT0gXCJub21hZFwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgcG9pbnRzPXtbOC42LCA0LjUsIDExLjQsIDQuNSwgMTYsIDE1LjUsIDQsIDE1LjVdfVxuICAgICAgICAgICAgZmlsbD17SU5LfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBwb2ludHM9e1sxMCwgNi41LCAxMCwgOC41XX1cbiAgICAgICAgICAgIHN0cm9rZT17Qy5yZWR9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS4yfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBwb2ludHM9e1sxMCwgMTAuNSwgMTAsIDEzLjVdfVxuICAgICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjR9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge2xpZmVwYXRoID09PSBcInN0cmVldGtpZFwiICYmIChcbiAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgcG9pbnRzPXtbNC41LCAxMywgOCwgNiwgMTAsIDExLCAxMi41LCA1LjUsIDE1LjUsIDEyLjVdfVxuICAgICAgICAgIHN0cm9rZT17SU5LfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXsyLjJ9XG4gICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJtaXRlclwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtsaWZlcGF0aCA9PT0gXCJjb3Jwb1wiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICBjeD17MTB9XG4gICAgICAgICAgICBjeT17MTB9XG4gICAgICAgICAgICByPXs1LjZ9XG4gICAgICAgICAgICBzdHJva2U9e0lOS31cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZWxsaXBzZVxuICAgICAgICAgICAgY3g9ezEwfVxuICAgICAgICAgICAgY3k9ezEwfVxuICAgICAgICAgICAgcng9ezIuM31cbiAgICAgICAgICAgIHJ5PXs1LjZ9XG4gICAgICAgICAgICBzdHJva2U9e0lOS31cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjJ9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIHBvaW50cz17WzQuNCwgMTAsIDE1LjYsIDEwXX1cbiAgICAgICAgICAgIHN0cm9rZT17SU5LfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuMn1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlU2hhcmVkVmFsdWUsIHdpdGhTZXF1ZW5jZSwgd2l0aFRpbWluZyB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyB1c2VLZXlzIH0gZnJvbSBcIi4uL2hvb2tzXCI7XG5pbXBvcnQgeyBtb2RhbE9wZW4gfSBmcm9tIFwiLi9EaWFsb2dcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi9zb3VuZFwiO1xuaW1wb3J0IHsgdXNlU2V0dGluZ3MgfSBmcm9tIFwiLi9zZXR0aW5ncy9zdG9yZVwiO1xuaW1wb3J0IHsgQywgU0NBTkxJTkVTLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBEYXRhTm9pc2UsIFJ1bGUgfSBmcm9tIFwiLi4vdWkvZGVjb3JcIjtcbmltcG9ydCB7IFByb3RvY29sR2x5cGgsIFdhcm5pbmdJY29uIH0gZnJvbSBcIi4uL3VpL2ljb25zXCI7XG5pbXBvcnQgeyBGSUxMLCBIaW50LCBIaW50cywgS2V5Y2FwIH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgV29yZG1hcmsgfSBmcm9tIFwiLi4vdWkvV29yZG1hcmtcIjtcblxuZXhwb3J0IHR5cGUgTWVudUVudHJ5ID0geyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH07XG5cbi8qKiBUaGUgbWFpbiBtZW51IOKAlCBhbmQsIGluIGdhbWUsIHRoZSBwYXVzZSBtZW51OiB0aGUgd29yZG1hcmsgYW5kIGEgY29sdW1uXG4gKiAgb2YgaXRlbXMgb24gYSB0cmFuc2x1Y2VudCByZWQgYmFuZCBvdmVyIHRoZSBkYXRhc2NhcGUuIEhvdmVyIG9yIHRoZVxuICogIGFycm93IGtleXMgc2VsZWN0OyBjbGljayBvciBFbnRlciBwaWNrcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNYWluTWVudSh7XG4gIGVudHJpZXMsXG4gIG9uUGljayxcbiAgb25CYWNrLFxuICB2ZXJzaW9uLFxufToge1xuICBlbnRyaWVzOiBNZW51RW50cnlbXTtcbiAgb25QaWNrOiAoaWQ6IHN0cmluZykgPT4gdm9pZDtcbiAgLyoqIEVzYyAodGhlIHBhdXNlIG1lbnUgcmVzdW1lcykuICovXG4gIG9uQmFjaz86ICgpID0+IHZvaWQ7XG4gIHZlcnNpb246IHN0cmluZztcbn0pIHtcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3Qgc2VsZWN0ID0gKGk6IG51bWJlcikgPT4ge1xuICAgIGlmIChpID09PSBzZWxlY3RlZCkgcmV0dXJuO1xuICAgIHNmeChcImhvdmVyXCIpO1xuICAgIHNldFNlbGVjdGVkKGkpO1xuICB9O1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgLy8gQSBkaWFsb2cgb3ZlciB0aGUgbWVudSB0YWtlcyB0aGUga2V5cy5cbiAgICBpZiAobW9kYWxPcGVuKCkpIHJldHVybjtcbiAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dEb3duXCIpIHNlbGVjdCgoc2VsZWN0ZWQgKyAxKSAlIGVudHJpZXMubGVuZ3RoKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd1VwXCIpXG4gICAgICBzZWxlY3QoKHNlbGVjdGVkICsgZW50cmllcy5sZW5ndGggLSAxKSAlIGVudHJpZXMubGVuZ3RoKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJFbnRlclwiKSBvblBpY2soZW50cmllc1tzZWxlY3RlZF0uaWQpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiICYmIG9uQmFjaykge1xuICAgICAgc2Z4KFwiYmFja1wiKTtcbiAgICAgIG9uQmFjaygpO1xuICAgIH1cbiAgfSwgdHJ1ZSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8QmFuZCAvPlxuICAgICAgPERhdGFOb2lzZVxuICAgICAgICBzZWVkPXsxMX1cbiAgICAgICAgbGluZXM9ezN9XG4gICAgICAgIGdyb3Vwcz17M31cbiAgICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIGxlZnQ6IDE1MiwgdG9wOiA0NCB9fVxuICAgICAgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMTU2LFxuICAgICAgICAgIHRvcDogNzIsXG4gICAgICAgICAgd2lkdGg6IDExMixcbiAgICAgICAgICBoZWlnaHQ6IDIyLFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiA2IH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGNvbG9yOiBDLnJlZERpbSB9fT40RDBCOTUgNzIxMCAwMDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxXb3JkbWFya1xuICAgICAgICB3aWR0aD17NTIwfVxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgbGVmdDogOTYsIHRvcDogMjM4IH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxNzgsXG4gICAgICAgICAgdG9wOiA0MzgsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBnYXA6IDQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtlbnRyaWVzLm1hcCgoZW50cnksIGkpID0+IChcbiAgICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICAgIGtleT17ZW50cnkuaWR9XG4gICAgICAgICAgICBsYWJlbD17ZW50cnkubGFiZWx9XG4gICAgICAgICAgICBzZWxlY3RlZD17aSA9PT0gc2VsZWN0ZWR9XG4gICAgICAgICAgICBvblNlbGVjdD17KCkgPT4gc2VsZWN0KGkpfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QaWNrKGVudHJ5LmlkKX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxSdWxlXG4gICAgICAgIHdpZHRoPXs0NDB9XG4gICAgICAgIGxhYmVsPVwiRFJOX1RDTEFTXzgwMDA5NVwiXG4gICAgICAgIGNvbG9yPXtDLnJlZERpbX1cbiAgICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIGxlZnQ6IDE1MCwgdG9wOiA4NzAgfX1cbiAgICAgIC8+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDE1MixcbiAgICAgICAgICB0b3A6IDg5NixcbiAgICAgICAgICBmb250U2l6ZTogMjQsXG4gICAgICAgICAgY29sb3I6IEMucmVkRGltLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7dmVyc2lvbn1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDxEYXRhTm9pc2VcbiAgICAgICAgc2VlZD17NX1cbiAgICAgICAgbGluZXM9ezN9XG4gICAgICAgIGdyb3Vwcz17NX1cbiAgICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIGxlZnQ6IDE1MCwgdG9wOiA5OTYgfX1cbiAgICAgIC8+XG4gICAgICA8VG9wUmlnaHQgLz5cbiAgICAgIHshb25CYWNrICYmIDxNZXNzYWdlcyAvPn1cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIm1vdXNlXCIgbGFiZWw9XCJTZWxlY3RcIiAvPlxuICAgICAgICB7b25CYWNrICYmIDxIaW50IGs9XCJFU0NcIiBsYWJlbD1cIkNsb3NlXCIgb25DbGljaz17b25CYWNrfSAvPn1cbiAgICAgIDwvSGludHM+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHRyYW5zbHVjZW50IHJlZCBiYW5kIHRoZSBtZW51IGhhbmdzIG9uLCBzY2FubGluZWQuICovXG5mdW5jdGlvbiBCYW5kKCkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogMTM0LFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgd2lkdGg6IDQ2NixcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoODQsIDI0LCAzMiwgMC40KVwiIH0sXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoNjQsIDE4LCAyNiwgMC4zMilcIiwgcG9zaXRpb246IFwiNTUlXCIgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IFwicmdiYSg3MCwgMjAsIDI4LCAwLjQpXCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IFNDQU5MSU5FUyxcbiAgICAgICAgYm9yZGVyOiB7IGxlZnQ6IDEsIHJpZ2h0OiAyIH0sXG4gICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMjIpXCIsXG4gICAgICB9fVxuICAgIC8+XG4gICk7XG59XG5cbi8qKiBPbmUgbWVudSBpdGVtLiBTZWxlY3RlZCwgaXQgZ2V0cyB0aGUgY3lhbiBjdXQtY29ybmVyIGZyYW1lLCB0aGUgcHJvdG9jb2xcbiAqICBtYXJrLCBhbmQgYSBidXJzdCBvZiBnbGl0Y2ggKGEgZmlsdGVyIHBhcmFtIGFuaW1hdGVkIDEg4oaSIDAgYnkgQmV2eSkuICovXG5mdW5jdGlvbiBNZW51SXRlbSh7XG4gIGxhYmVsLFxuICBzZWxlY3RlZCxcbiAgb25TZWxlY3QsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHNlbGVjdGVkOiBib29sZWFuO1xuICBvblNlbGVjdDogKCkgPT4gdm9pZDtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZ2xpdGNoZXMgPSAhIXVzZVNldHRpbmdzKCkudWlHbGl0Y2g7XG4gIGNvbnN0IGJ1cnN0ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkKVxuICAgICAgYnVyc3QudmFsdWUgPSB3aXRoU2VxdWVuY2UoXG4gICAgICAgIHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogMCB9KSxcbiAgICAgICAgd2l0aFRpbWluZygwLCB7IGR1cmF0aW9uOiAzNDAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSksXG4gICAgICApO1xuICB9LCBbc2VsZWN0ZWQsIGJ1cnN0XSk7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIG9uUG9pbnRlckVudGVyPXtvblNlbGVjdH1cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiAzNTYsXG4gICAgICAgIGhlaWdodDogNTIsXG4gICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMTQsIHJpZ2h0OiAxMiB9LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgLi4uKHNlbGVjdGVkXG4gICAgICAgICAgPyBjaGFtZmVyKFwicmdiYSg2LCA4LCAxNiwgMC41KVwiLCAyMCwgQy5jeWFuSGksIDIpXG4gICAgICAgICAgOiB7IGJvcmRlcjogMiwgYm9yZGVyQ29sb3I6IEMuY2xlYXIgfSksXG4gICAgICAgIGZpbHRlcjpcbiAgICAgICAgICBzZWxlY3RlZCAmJiBnbGl0Y2hlc1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJnbGl0Y2hcIixcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgIGludGVuc2l0eTogeyBhbmltYXRlZDogYnVyc3QsIHNlZWQ6IDEgfSxcbiAgICAgICAgICAgICAgICAgIHNwbGl0OiAzLFxuICAgICAgICAgICAgICAgICAgdGVhcjogMTIsXG4gICAgICAgICAgICAgICAgICBzZWVkOiAzLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1lbnUsIGNvbG9yOiBzZWxlY3RlZCA/IEMuY3lhbiA6IEMucmVkIH19PlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgICB7c2VsZWN0ZWQgJiYgPFByb3RvY29sR2x5cGggLz59XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBTbWFsbCBwcmludCBhY3Jvc3MgdGhlIHRvcCByaWdodDogYSBkYXRhYmFzZSBiYW5uZXIgYW5kIGEgd2FybmluZy4gKi9cbmZ1bmN0aW9uIFRvcFJpZ2h0KCkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLlQubWljcm8sXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMTA2NixcbiAgICAgICAgICB0b3A6IDUyLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XG4gICAgICAgICAgXCJTQUJMRSBDSVRZIENPUlAgUkVDT1JEIERBVEFCQVNFICAvLyAgMDA0NDcyOS0wMzQwICAwMDAxQUYwOSAgLy8gIDZCNzNcXG5UXjcyMzQtMDA5MSAgMDAyMDQzNDk4MiAgLy8gIDAwMzQtMjMwNC1UMDQyQjU3ICAjOTI1XCJcbiAgICAgICAgfVxuICAgICAgPC90ZXh0PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxNDQwLFxuICAgICAgICAgIHRvcDogMzYsXG4gICAgICAgICAgd2lkdGg6IDQwMCxcbiAgICAgICAgICBoZWlnaHQ6IDM0LFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8V2FybmluZ0ljb24gc2l6ZT17MTR9IGNvbG9yPXtDLnJlZERpbX0gLz5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDgsIGNvbG9yOiBDLnJlZERpbSB9fT5cbiAgICAgICAgICB7XG4gICAgICAgICAgICBcIlRhbXBlcmluZyB3aXRoIHRoaXMgdGVybWluYWwgaXMgYSBmZWxvbnkgdW5kZXIgU2FibGUgQ2l0eSBDb2RlIDQ0LjIuXFxuQWxsIHNlc3Npb25zIGFyZSBsb2dnZWQgYW5kIG1heSBiZSByZXZpZXdlZCBieSBHcmlkd2F0Y2guXCJcbiAgICAgICAgICB9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIFRoZSBib3ggYm90dG9tIHJpZ2h0OiB1bnJlYWQgbWVzc2FnZXMuICovXG5mdW5jdGlvbiBNZXNzYWdlcygpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIHJpZ2h0OiA4MCxcbiAgICAgICAgYm90dG9tOiAxMTgsXG4gICAgICAgIHdpZHRoOiA1MTYsXG4gICAgICAgIGhlaWdodDogNDQsXG4gICAgICAgIC4uLmNoYW1mZXIoXCJyZ2JhKDIwLCA4LCAxMiwgMC42KVwiLCAxMCwgQy5yZWREaW0sIDEpLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDEyLFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDggfSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPEtleWNhcCBrPVwiM1wiIC8+XG4gICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMjQsIGNvbG9yOiBDLnJlZCB9fT5NZXNzYWdlczwvdGV4dD5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxIH19IC8+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogOCB9fT57XCJTWVNURU0gSU5QVVQgMTJcIn08L3RleHQ+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDMgfX0+XG4gICAgICAgIHtbMCwgMSwgMl0ubWFwKChpKSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiA1LCBoZWlnaHQ6IDE4LCBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VEZWJ1ZyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJhY3RlciB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgRWRnZVJhaWxzIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBGSUxMIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgQXBwZWFyYW5jZSB9IGZyb20gXCIuL0FwcGVhcmFuY2VcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZXMgfSBmcm9tIFwiLi9BdHRyaWJ1dGVzXCI7XG5pbXBvcnQgeyBCb2R5VHlwZSB9IGZyb20gXCIuL0JvZHlUeXBlXCI7XG5pbXBvcnQgeyBEaWZmaWN1bHR5IH0gZnJvbSBcIi4vRGlmZmljdWx0eVwiO1xuaW1wb3J0IHsgTGlmZXBhdGggfSBmcm9tIFwiLi9MaWZlcGF0aFwiO1xuaW1wb3J0IHsgU3VtbWFyeSB9IGZyb20gXCIuL1N1bW1hcnlcIjtcblxuLyoqIFdoYXQgZXZlcnkgc3RlcCBnZXRzOiB0aGUgY2hhcmFjdGVyLCBhbmQgdGhlIHdheSBvdXQgZWl0aGVyIHNpZGUuICovXG5leHBvcnQgdHlwZSBTdGVwUHJvcHMgPSB7XG4gIGNoYXJhY3RlcjogQ2hhcmFjdGVyO1xuICBvbkNoYW5nZTogKGNoYXJhY3RlcjogQ2hhcmFjdGVyKSA9PiB2b2lkO1xuICBuZXh0OiAoKSA9PiB2b2lkO1xuICBiYWNrOiAoKSA9PiB2b2lkO1xufTtcblxuY29uc3QgU1RFUFMgPSBbXG4gIFwiZGlmZmljdWx0eVwiLFxuICBcImxpZmVwYXRoXCIsXG4gIFwiYm9keVwiLFxuICBcImFwcGVhcmFuY2VcIixcbiAgXCJhdHRyaWJ1dGVzXCIsXG4gIFwic3VtbWFyeVwiLFxuXTtcblxuLyoqIFRoZSBzaXggc3RlcHMgb2YgYSBuZXcgZ2FtZTogZGlmZmljdWx0eSwgbGlmZXBhdGgsIGJvZHkgdHlwZSxcbiAqICBhcHBlYXJhbmNlLCBhdHRyaWJ1dGVzLCBzdW1tYXJ5LiBFc2Mgc3RlcHMgYmFjayAob3V0IG9mIHRoZSBmaXJzdCBzdGVwOlxuICogIGBvbkJhY2tgKTsgdGhlIHN1bW1hcnkncyBzdGFydCBjYWxscyBgb25TdGFydGAuIEVhY2ggc3RlcCBjaGFuZ2UgZ2xpdGNoZXNcbiAqICB0aHJvdWdoIHRoZSBzYW1lIG1vcnBoIGFzIHRoZSBzY3JlZW5zLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5ld0dhbWUoe1xuICBjaGFyYWN0ZXIsXG4gIG9uQ2hhbmdlLFxuICBvbkJhY2ssXG4gIG9uU3RhcnQsXG59OiB7XG4gIGNoYXJhY3RlcjogQ2hhcmFjdGVyO1xuICBvbkNoYW5nZTogKGNoYXJhY3RlcjogQ2hhcmFjdGVyKSA9PiB2b2lkO1xuICBvbkJhY2s6ICgpID0+IHZvaWQ7XG4gIG9uU3RhcnQ6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IFtzdGVwLCBzZXRTdGVwXSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBwcm9wczogU3RlcFByb3BzID0ge1xuICAgIGNoYXJhY3RlcixcbiAgICBvbkNoYW5nZSxcbiAgICBuZXh0OiAoKSA9PiB7XG4gICAgICBzZngoXCJjbGlja1wiKTtcbiAgICAgIHNldFN0ZXAoTWF0aC5taW4oc3RlcCArIDEsIFNURVBTLmxlbmd0aCAtIDEpKTtcbiAgICB9LFxuICAgIGJhY2s6ICgpID0+IHtcbiAgICAgIHNmeChcImJhY2tcIik7XG4gICAgICBpZiAoc3RlcCA9PT0gMCkgb25CYWNrKCk7XG4gICAgICBlbHNlIHNldFN0ZXAoc3RlcCAtIDEpO1xuICAgIH0sXG4gIH07XG4gIC8vIGAtLXNob290IOKApiAtLWRvIFwiPHNlY3M+IHN0ZXAgYXR0cmlidXRlc1wiYDoganVtcCB0byBhIHN0ZXAuXG4gIHVzZURlYnVnKFwic3RlcFwiLCAocykgPT4gc2V0U3RlcChNYXRoLm1heCgwLCBTVEVQUy5pbmRleE9mKHMpKSkpO1xuICAvLyBgaGFuZGxlIFZFR0FgOiByZW5hbWUgdGhlIGNoYXJhY3Rlci5cbiAgdXNlRGVidWcoXCJoYW5kbGVcIiwgKGgpID0+IG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCBoYW5kbGU6IGggfSkpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5GSUxMLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGFuZ2xlOiAxODAsXG4gICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoNTQsIDE3LCAyMywgMC45MylcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoMjIsIDEzLCAyMCwgMC45MilcIiwgcG9zaXRpb246IFwiNDUlXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDUsIDExLCAxNiwgMC45NSlcIiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxFZGdlUmFpbHMgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uRklMTCxcbiAgICAgICAgICBtb3JwaEZpbHRlcjogeyBrZXk6IHN0ZXAsIG5hbWU6IFwiZ2xpdGNoU3dhcFwiIH0sXG4gICAgICAgICAgdHJhbnNpdGlvbjogeyBtb3JwaEZpbHRlcjogeyBkdXJhdGlvbjogMzYwLCBlYXNpbmc6IFwibGluZWFyXCIgfSB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7c3RlcCA9PT0gMCAmJiA8RGlmZmljdWx0eSB7Li4ucHJvcHN9IC8+fVxuICAgICAgICB7c3RlcCA9PT0gMSAmJiA8TGlmZXBhdGggey4uLnByb3BzfSAvPn1cbiAgICAgICAge3N0ZXAgPT09IDIgJiYgPEJvZHlUeXBlIHsuLi5wcm9wc30gLz59XG4gICAgICAgIHtzdGVwID09PSAzICYmIDxBcHBlYXJhbmNlIHsuLi5wcm9wc30gLz59XG4gICAgICAgIHtzdGVwID09PSA0ICYmIDxBdHRyaWJ1dGVzIHsuLi5wcm9wc30gLz59XG4gICAgICAgIHtzdGVwID09PSA1ICYmIDxTdW1tYXJ5IHsuLi5wcm9wc30gb25TdGFydD17b25TdGFydH0gLz59XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlLCB0eXBlIFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHR5cGUgeyBDaGFyYWN0ZXIgfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEFycm93LCBXYXJuaW5nSWNvbiB9IGZyb20gXCIuLi8uLi91aS9pY29uc1wiO1xuaW1wb3J0IHsgRklMTCwgSGVhZGVyLCBIaW50LCBIaW50cyB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IExPT0tfT1BUSU9OUywgUFJFU0VUUywgVk9JQ0UsIGhhbmRsZU9mLCBsb29rLCB0d28gfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBJZENhcmQgfSBmcm9tIFwiLi9JZENhcmRcIjtcbmltcG9ydCB7IEdyaWRJY29uLCBTdGVwSWNvbiwgV2hlZWxJY29uIH0gZnJvbSBcIi4vZ2x5cGhzXCI7XG5pbXBvcnQgeyBDaHJvbWUsIEljb25IaW50LCBOYXZCdXR0b25zIH0gZnJvbSBcIi4vcGFydHNcIjtcbmltcG9ydCB7IFBvcnRyYWl0IH0gZnJvbSBcIi4vUG9ydHJhaXRcIjtcbmltcG9ydCB7IFN3YXRjaGVzIH0gZnJvbSBcIi4vU3dhdGNoZXNcIjtcbmltcG9ydCB0eXBlIHsgU3RlcFByb3BzIH0gZnJvbSBcIi4vTmV3R2FtZVwiO1xuXG5jb25zdCBQTEFURSA9IFwiIzFjMGEwZVwiO1xuY29uc3QgU1RFUCA9IFwiIzJhMDkwY1wiO1xuY29uc3QgRURHRSA9IFwiIzVhMWMxZlwiO1xuXG4vKiogQVBQRUFSQU5DRTogcHJlc2V0cyBkb3duIHRoZSBsZWZ0LCB0aGUgbGl2ZSBJRCBjYXJkIGluIHRoZSBtaWRkbGUsIGFuZFxuICogIHRoZSBvcHRpb24gbGlzdCBvbiB0aGUgcmlnaHQsIGVhY2ggcm93IGEgdmFsdWUgYW5kIGl0cyDil4Eg4pa3IHN0ZXBwZXJcbiAqICAoY29sb3Igcm93cyBvcGVuIGEgc3dhdGNoIGdyaWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFwcGVhcmFuY2UoeyBjaGFyYWN0ZXIsIG9uQ2hhbmdlLCBuZXh0LCBiYWNrIH06IFN0ZXBQcm9wcykge1xuICBjb25zdCBbZ3JpZCwgc2V0R3JpZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2Nyb2xsLCBzZXRTY3JvbGxdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IHNldExvb2sgPSAoaWQ6IHN0cmluZywgdmFsdWU6IG51bWJlcikgPT5cbiAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3RlciwgbG9vazogeyAuLi5jaGFyYWN0ZXIubG9vaywgW2lkXTogdmFsdWUgfSB9KTtcbiAgY29uc3Qgc3RlcCA9IChpZDogc3RyaW5nLCBjb3VudDogbnVtYmVyLCBieTogbnVtYmVyKSA9PiB7XG4gICAgc2Z4KFwidGFiXCIpO1xuICAgIHNldExvb2soaWQsIChsb29rKGNoYXJhY3RlciwgaWQpICsgYnkgKyBjb3VudCkgJSBjb3VudCk7XG4gIH07XG4gIGNvbnN0IG9wdGlvbiA9IExPT0tfT1BUSU9OUy5maW5kKChvKSA9PiBvLmlkID09PSBncmlkKTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlZGl0aW5nKSByZXR1cm47XG4gICAgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBpZiAoZ3JpZCkge1xuICAgICAgICBzZngoXCJiYWNrXCIpO1xuICAgICAgICBzZXRHcmlkKG51bGwpO1xuICAgICAgfSBlbHNlIGJhY2soKTtcbiAgICB9IGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlGXCIgJiYgIWdyaWQpIG5leHQoKTtcbiAgfSk7XG4gIC8vIGBzd2F0Y2ggPG9wdGlvbj5gIG9wZW5zIGEgZ3JpZCwgYGxvb2sgPG9wdGlvbj4gPG4+YCBzZXRzIGEgdmFsdWUsXG4gIC8vIGBzY3JvbGwgPHB4PmAgc2Nyb2xscyB0aGUgbGlzdC5cbiAgdXNlRGVidWcoXCJzd2F0Y2hcIiwgKGlkKSA9PiBzZXRHcmlkKGlkIHx8IG51bGwpKTtcbiAgdXNlRGVidWcoXCJsb29rXCIsIChhcmcpID0+IHtcbiAgICBjb25zdCBbaWQsIG5dID0gYXJnLnNwbGl0KFwiIFwiKTtcbiAgICBzZXRMb29rKGlkLCBOdW1iZXIobikpO1xuICB9KTtcbiAgdXNlRGVidWcoXCJzY3JvbGxcIiwgKHB4KSA9PiBzZXRTY3JvbGwoTnVtYmVyKHB4KSkpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPENocm9tZSAvPlxuICAgICAgPEhlYWRlclxuICAgICAgICB0aXRsZT1cIkFQUEVBUkFOQ0VcIlxuICAgICAgICBjYXB0aW9uPVwiSU4gU0FCTEUgQ0lUWSwgRVZFUlkgQ0FNRVJBIEtOT1dTIFlPVVIgRkFDRS4gTUFLRSBJVCBPTkUgV09SVEggRklMSU5HLlwiXG4gICAgICAgIGljb249ezxTdGVwSWNvbiBraW5kPVwiYXBwZWFyYW5jZVwiIC8+fVxuICAgICAgICBzdGVwPXsyfVxuICAgICAgLz5cbiAgICAgIDxQcmVzZXRzIGNoYXJhY3Rlcj17Y2hhcmFjdGVyfSBvbkNoYW5nZT17b25DaGFuZ2V9IC8+XG4gICAgICA8SWRDYXJkXG4gICAgICAgIGNoYXJhY3Rlcj17Y2hhcmFjdGVyfVxuICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgIG9uRWRpdGluZz17c2V0RWRpdGluZ31cbiAgICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIGxlZnQ6IDU2MCwgdG9wOiAxOTYgfX1cbiAgICAgIC8+XG4gICAgICB7b3B0aW9uICYmIChcbiAgICAgICAgPFN3YXRjaGVzXG4gICAgICAgICAgb3B0aW9uPXtvcHRpb259XG4gICAgICAgICAgdmFsdWU9e2xvb2soY2hhcmFjdGVyLCBvcHRpb24uaWQpfVxuICAgICAgICAgIG9uUGljaz17KGkpID0+IHNldExvb2sob3B0aW9uLmlkLCBpKX1cbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgICBzZngoXCJiYWNrXCIpO1xuICAgICAgICAgICAgc2V0R3JpZChudWxsKTtcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHsvKiBIaWRkZW4sIG5vdCB1bm1vdW50ZWQsIHVuZGVyIHRoZSBncmlkOiBpdCBrZWVwcyBpdHMgc2Nyb2xsLiAqL31cbiAgICAgIDxub2RlXG4gICAgICAgIHNjcm9sbFRvcD17c2Nyb2xsfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGRpc3BsYXk6IG9wdGlvbiA/IFwibm9uZVwiIDogXCJmbGV4XCIsXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDE0NixcbiAgICAgICAgICB0b3A6IDIxNCxcbiAgICAgICAgICB3aWR0aDogNDkxLFxuICAgICAgICAgIGhlaWdodDogNjYwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgICBvdmVyZmxvd1k6IFwic2Nyb2xsXCIsXG4gICAgICAgICAgc2Nyb2xsYmFyOiB7XG4gICAgICAgICAgICB0cmFjazogeyBiYWNrZ3JvdW5kQ29sb3I6IFwiIzRlMTcxN1wiIH0sXG4gICAgICAgICAgICB0aHVtYjoge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiI2ZmNWU1MlwiLFxuICAgICAgICAgICAgICBob3ZlcjogeyBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkSGkgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlja25lc3M6IDgsXG4gICAgICAgICAgICBtaW5UaHVtYkxlbmd0aDogNjAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPFByb25vdW5zIG5hbWU9e2hhbmRsZU9mKGNoYXJhY3Rlcil9IHZvaWNlPXtjaGFyYWN0ZXIudm9pY2V9IC8+XG4gICAgICAgIDxSb3dcbiAgICAgICAgICBsYWJlbD17Vk9JQ0UubGFiZWx9XG4gICAgICAgICAgdmFsdWU9e1ZPSUNFLm5hbWVzW2NoYXJhY3Rlci52b2ljZV19XG4gICAgICAgICAgb25TdGVwPXsoKSA9PiB7XG4gICAgICAgICAgICBzZngoXCJ0YWJcIik7XG4gICAgICAgICAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3Rlciwgdm9pY2U6IDEgLSBjaGFyYWN0ZXIudm9pY2UgfSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAge0xPT0tfT1BUSU9OUy5tYXAoKG8pID0+IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvb2soY2hhcmFjdGVyLCBvLmlkKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJvd1xuICAgICAgICAgICAgICBrZXk9e28uaWR9XG4gICAgICAgICAgICAgIGxhYmVsPXtvLmxhYmVsfVxuICAgICAgICAgICAgICB2YWx1ZT17dHdvKHZhbHVlKX1cbiAgICAgICAgICAgICAgc3dhdGNoPXtvLnN3YXRjaGVzPy5bdmFsdWVdfVxuICAgICAgICAgICAgICBvblN0ZXA9eyhieSkgPT4gc3RlcChvLmlkLCBvLmNvdW50LCBieSl9XG4gICAgICAgICAgICAgIG9uR3JpZD17XG4gICAgICAgICAgICAgICAgby5zd2F0Y2hlc1xuICAgICAgICAgICAgICAgICAgPyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgc2Z4KFwiY2xpY2tcIik7XG4gICAgICAgICAgICAgICAgICAgICAgc2V0R3JpZChvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxOYXZCdXR0b25zIG9uQmFjaz17YmFja30gb25OZXh0PXtuZXh0fSAvPlxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNFTEVDVFwiIC8+XG4gICAgICAgIDxJY29uSGludCBpY29uPXs8V2hlZWxJY29uIC8+fSBsYWJlbD1cIlNDUk9MTFwiIC8+XG4gICAgICA8L0hpbnRzPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSB3YXJuaW5nIG92ZXIgdGhlIHZvaWNlIHJvdzogd2hvIHRoZSBjaXR5IHdpbGwgdGFrZSB5b3UgZm9yLiAqL1xuZnVuY3Rpb24gUHJvbm91bnMoeyBuYW1lLCB2b2ljZSB9OiB7IG5hbWU6IHN0cmluZzsgdm9pY2U6IG51bWJlciB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogOCxcbiAgICAgICAgd2lkdGg6IDQ1NSxcbiAgICAgICAgaGVpZ2h0OiA0NCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPFdhcm5pbmdJY29uIHNpemU9ezE4fSAvPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDUuNSwgY29sb3I6IEMucmVkLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX1cbiAgICAgID5cbiAgICAgICAge1wiVk9YIE1PRFxcblJFRyAyMDkxXFxuU0MgNDQtQVwifVxuICAgICAgPC90ZXh0PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDM5MCB9fT5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDE5LCBjb2xvcjogQy5yZWQsIGxpbmVIZWlnaHQ6IDEuMDUgfX0+XG4gICAgICAgICAge2BPVEhFUiBDSEFSQUNURVJTIFdJTEwgUkVGRVIgVE9cXG4ke25hbWV9IEFTICR7dm9pY2UgPT09IDAgPyBcIkhFL0hJTVwiIDogXCJTSEUvSEVSXCJ9LmB9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBPbmUgb3B0aW9uOiBpdHMgbmFtZSBhbmQgdmFsdWUgKG9yIHN3YXRjaCkgb24gYSBwbGF0ZSwgdGhlIHN0ZXBwZXJcbiAqICBwbGF0ZSB1bmRlciBpdC4gKi9cbmZ1bmN0aW9uIFJvdyh7XG4gIGxhYmVsLFxuICB2YWx1ZSxcbiAgc3dhdGNoLFxuICBvblN0ZXAsXG4gIG9uR3JpZCxcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgc3dhdGNoPzogc3RyaW5nO1xuICBvblN0ZXA6IChieTogbnVtYmVyKSA9PiB2b2lkO1xuICBvbkdyaWQ/OiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNCwgd2lkdGg6IDQ1NSB9fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihQTEFURSwgMTQsIEVER0UsIDEsIFwiYmxcIiksXG4gICAgICAgICAgaGVpZ2h0OiA2MixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxMCwgcmlnaHQ6IDggfSxcbiAgICAgICAgfX1cbiAgICAgICAgaG92ZXJTdHlsZT17Y2hhbWZlcihcIiMyYTBkMTNcIiwgMTQsIFwicmdiYSgyNTUsIDkzLCA4MSwgMC43NSlcIiwgMSwgXCJibFwiKX1cbiAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNmeChcImhvdmVyXCIpfVxuICAgICAgPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMjUsIGNvbG9yOiBDLnJlZCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICB7c3dhdGNoID8gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17eyAuLi5jaGFtZmVyKHN3YXRjaCwgOCwgRURHRSwgMSksIHdpZHRoOiA1MCwgaGVpZ2h0OiA1MCB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDI1LCBjb2xvcjogQy5yZWQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT5cbiAgICAgICAgICAgIHt2YWx1ZX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICl9XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDQsIGhlaWdodDogMzggfX0+XG4gICAgICAgIDxTdGVwQnV0dG9uIHNpZGU9XCJsZWZ0XCIgb25DbGljaz17KCkgPT4gb25TdGVwKC0xKX0+XG4gICAgICAgICAgPEFycm93IGRpcj1cImxlZnRcIiBzaXplPXsyMn0gLz5cbiAgICAgICAgPC9TdGVwQnV0dG9uPlxuICAgICAgICB7b25HcmlkICYmIChcbiAgICAgICAgICA8U3RlcEJ1dHRvbiBvbkNsaWNrPXtvbkdyaWR9PlxuICAgICAgICAgICAgPEdyaWRJY29uIC8+XG4gICAgICAgICAgPC9TdGVwQnV0dG9uPlxuICAgICAgICApfVxuICAgICAgICA8U3RlcEJ1dHRvbiBzaWRlPVwicmlnaHRcIiBvbkNsaWNrPXsoKSA9PiBvblN0ZXAoMSl9PlxuICAgICAgICAgIDxBcnJvdyBkaXI9XCJyaWdodFwiIHNpemU9ezIyfSAvPlxuICAgICAgICA8L1N0ZXBCdXR0b24+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSBzdGVwcGVyIHBsYXRlOiDil4EsIOKWtyBvciB0aGUgc3dhdGNoLWdyaWQgYnV0dG9uLiAqL1xuZnVuY3Rpb24gU3RlcEJ1dHRvbih7XG4gIHNpZGUsXG4gIG9uQ2xpY2ssXG4gIGNoaWxkcmVuLFxufToge1xuICBzaWRlPzogXCJsZWZ0XCIgfCBcInJpZ2h0XCI7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG59KSB7XG4gIGNvbnN0IGNvcm5lciA9IHNpZGUgPT09IFwibGVmdFwiID8gXCJibFwiIDogXCJiclwiO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uUG9pbnRlckVudGVyPXsoKSA9PiBzZngoXCJob3ZlclwiKX1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi4oc2lkZVxuICAgICAgICAgID8gY2hhbWZlcihTVEVQLCAxMiwgRURHRSwgMSwgY29ybmVyKVxuICAgICAgICAgIDogeyBiYWNrZ3JvdW5kQ29sb3I6IFNURVAsIGJvcmRlcjogMSwgYm9yZGVyQ29sb3I6IEVER0UgfSksXG4gICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICBmbGV4QmFzaXM6IDAsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OlxuICAgICAgICAgIHNpZGUgPT09IFwibGVmdFwiID8gXCJmbGV4U3RhcnRcIiA6IHNpZGUgPyBcImZsZXhFbmRcIiA6IFwiY2VudGVyXCIsXG4gICAgICAgIHBhZGRpbmc6IHtcbiAgICAgICAgICBsZWZ0OiBzaWRlID09PSBcImxlZnRcIiA/IDYwIDogMCxcbiAgICAgICAgICByaWdodDogc2lkZSA9PT0gXCJyaWdodFwiID8gNzAgOiAwLFxuICAgICAgICB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e1xuICAgICAgICBzaWRlXG4gICAgICAgICAgPyBjaGFtZmVyKFwiIzQ4MTIxYVwiLCAxMiwgQy5yZWQsIDEsIGNvcm5lcilcbiAgICAgICAgICA6IHsgYmFja2dyb3VuZENvbG9yOiBcIiM0ODEyMWFcIiwgYm9yZGVyQ29sb3I6IEMucmVkIH1cbiAgICAgIH1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBUaGUgZm91ciByZWFkeS1tYWRlIGZhY2VzOiBhIGNsaWNrIHB1dHMgb25lIG9uIHRoZSBjYXJkLiAqL1xuZnVuY3Rpb24gUHJlc2V0cyh7XG4gIGNoYXJhY3RlcixcbiAgb25DaGFuZ2UsXG59OiB7XG4gIGNoYXJhY3RlcjogQ2hhcmFjdGVyO1xuICBvbkNoYW5nZTogKGNoYXJhY3RlcjogQ2hhcmFjdGVyKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogNzYsXG4gICAgICAgIHRvcDogMTk0LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBnYXA6IDUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5tZW51LFxuICAgICAgICAgIGZvbnRTaXplOiAzMSxcbiAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgIG1hcmdpbjogeyBib3R0b206IDQgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgUFJFU0VUU1xuICAgICAgPC90ZXh0PlxuICAgICAge1BSRVNFVFMubWFwKChwLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uID0gT2JqZWN0LmVudHJpZXMocCkuZXZlcnkoXG4gICAgICAgICAgKFtpZCwgdl0pID0+IGxvb2soY2hhcmFjdGVyLCBpZCkgPT09IHYsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNmeChcImhvdmVyXCIpfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZngoXCJjbGlja1wiKTtcbiAgICAgICAgICAgICAgb25DaGFuZ2UoeyAuLi5jaGFyYWN0ZXIsIGxvb2s6IHsgLi4uY2hhcmFjdGVyLmxvb2ssIC4uLnAgfSB9KTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5jaGFtZmVyKFwiIzI0MGEwZVwiLCAxNiwgb24gPyBDLnJlZCA6IEVER0UsIDEpLFxuICAgICAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDE2MCxcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgcGFkZGluZzogeyB0b3A6IDQgfSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBob3ZlclN0eWxlPXtjaGFtZmVyKFwiIzNhMTAxNlwiLCAxNiwgQy5yZWQsIDEpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxQb3J0cmFpdFxuICAgICAgICAgICAgICBsb29rPXt7IC4uLmNoYXJhY3Rlci5sb29rLCAuLi5wIH19XG4gICAgICAgICAgICAgIGJvZHk9e2NoYXJhY3Rlci5ib2R5fVxuICAgICAgICAgICAgICB3aWR0aD17MTAwfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogMywgYm90dG9tOiA0IH0sXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBFREdFLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiA5NiwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiB9fT5cbiAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7YFNDKyAke3R3byhpKX1gfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA1LjUgfX0+XG4gICAgICAgICAgICAgICAgVEVNUExBVEUgLy8gUkVTSURFTlRcbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgIi8vIFRoZSBuZXcgZ2FtZSdzIGNvcHkgYW5kIG9wdGlvbiB0YWJsZXM6IHRoZSBkaWZmaWN1bHR5IGFuZCBsaWZlcGF0aCBibHVyYnMsXG4vLyB0aGUgYXBwZWFyYW5jZSBvcHRpb25zICh2YWx1ZXMgbGl2ZSBpbiBgY2hhcmFjdGVyLmxvb2tgKSwgdGhlIHByZXNldHMgYW5kXG4vLyB0aGUgYXR0cmlidXRlIHJ1bGVzLlxuXG5pbXBvcnQgdHlwZSB7IEF0dHJpYnV0ZUlkLCBDaGFyYWN0ZXIsIERpZmZpY3VsdHksIExpZmVwYXRoIH0gZnJvbSBcIi4uLy4uL3N0b3JlXCI7XG5cbmV4cG9ydCBjb25zdCBESUZGSUNVTFRZX1RFWFQ6IFJlY29yZDxEaWZmaWN1bHR5LCBzdHJpbmc+ID0ge1xuICBlYXN5OiBcIkZvciB0aG9zZSBoZXJlIGZvciB0aGUgc3RvcnkuIEVuZW1pZXMgZ28gZG93biBxdWlja2x5LCBoaXQgc29mdGx5LCBhbmQgdGhlIHN0cmVldHMgZm9yZ2l2ZSBtb3N0IGJhZCBkZWNpc2lvbnMuIFNpdCBiYWNrIGFuZCB0YWtlIGluIHRoZSBzaWdodHMuXCIsXG4gIG5vcm1hbDpcbiAgICBcIlRoZSBpbnRlbmRlZCBleHBlcmllbmNlLiBGaXJlZmlnaHRzIHRha2Ugc29tZSB0aG91Z2h0LCBhbmQgZGVjZW50IGdlYXIgYW5kIHdlbGwtY2hvc2VuIGN5YmVyd2FyZSB3aWxsIGtlZXAgeW91IGJyZWF0aGluZyBvbiBtb3N0IG5pZ2h0cy5cIixcbiAgaGFyZDogXCJFbmVtaWVzIGFyZSBkZWFkbGllciBhbmQgdGhleSB0aGluayBiZWZvcmUgdGhleSBzaG9vdC4gU3RheWluZyBhbGl2ZSB3aWxsIGRlcGVuZCBvbiBob3cgd2VsbCB5b3UgdXNlIHlvdXIgcGVya3MsIGltcGxhbnRzLCBnYWRnZXRzIGFuZCBzdGltcy5cIixcbiAgdmVyeWhhcmQ6XG4gICAgXCJObyBtZXJjeS4gQW55IGZpcmVmaWdodCBjb3VsZCBiZSB5b3VyIGxhc3Q6IHBsYW4gZXZlcnkgbW92ZSwgcmVhZCBldmVyeSByb29tIGFuZCBzcGVuZCBldmVyeSByZXNvdXJjZSBhcyBpZiBub3RoaW5nIGNvbWVzIGFmdGVyIGl0LlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IExJRkVQQVRIX1RFWFQ6IFJlY29yZDxMaWZlcGF0aCwgc3RyaW5nPiA9IHtcbiAgbm9tYWQ6XG4gICAgXCJSYWlzZWQgb24gdGhlIG9wZW4gcm9hZCBwYXN0IHRoZSBTYWJsZSBDaXR5IHdhbGxzLCB5b3UgbGVhcm5lZCB0byBmaXggYSBkZWFkIGVuZ2luZSwgcmVhZCBhIGR1c3Qgc3Rvcm0gYW5kIHRydXN0IG5vYm9keSBvdXRzaWRlIHRoZSBjbGFuLiBUaGUgY2l0eSBzZWVzIGFuIG91dHNpZGVyLiBZb3Ugc2VlIGEgY2FnZSB3aXRoIG5lb24gb24gdGhlIGJhcnMuXCIsXG4gIHN0cmVldGtpZDpcbiAgICBcIktlc3NsZXIncyBhbGxleXMgcmFpc2VkIHlvdS4gWW91IGtub3cgd2hpY2ggZml4ZXIgcGF5cywgd2hpY2ggZ2FuZyBvd25zIHdoaWNoIGNvcm5lciBhbmQgd2hpY2ggY29wIGxvb2tzIGF3YXkgZm9yIGEgcHJpY2UuIE91dCBoZXJlIGEgZmF2b3IgaXMgY3VycmVuY3kgYW5kIGEgbmFtZSBpcyBhcm1vciwgYW5kIHlvdSBoYXZlIHNwZW50IHlvdXIgbGlmZSBlYXJuaW5nIGJvdGguXCIsXG4gIGNvcnBvOlxuICAgIFwiVHdlbHZlIHllYXJzIGluIFRlbmthaSdzIGdsYXNzIHRvd2VyIHRhdWdodCB5b3UgdGhhdCB0cnV0aCBpcyBhIHJlc291cmNlIGFuZCBsb3lhbHR5IGhhcyBhIHByaWNlIHRhZy4gWW91IGhhdmUgYnVyaWVkIHJpdmFscyBpbiBhdWRpdHMgYW5kIHNvbGQgc2VjcmV0cyBiZXR3ZWVuIGZsb29ycywgc21pbGluZyB0aGUgd2hvbGUgd2F5LiBVcCB0aGVyZSwgbm9ib2R5IGhhcyBmcmllbmRzLiBPbmx5IGxldmVyYWdlLlwiLFxufTtcblxuLyoqIE9uZSByb3cgb2YgdGhlIGFwcGVhcmFuY2UgbGlzdC4gYHN3YXRjaGVzYCBtYWtlcyBpdCBhIGNvbG9yIG9wdGlvbiAodGhlXG4gKiAgZ3JpZCBidXR0b24gb3BlbnMgdGhlbSk7IG90aGVyd2lzZSBpdCBoYXMgYGNvdW50YCBudW1iZXJlZCB2YXJpYW50cy4gKi9cbmV4cG9ydCB0eXBlIExvb2tPcHRpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGNvdW50OiBudW1iZXI7XG4gIHN3YXRjaGVzPzogc3RyaW5nW107XG59O1xuXG5leHBvcnQgY29uc3QgU0tJTl9UT05FUyA9IFtcbiAgXCIjZjNkN2MwXCIsXG4gIFwiI2ViYzVhNlwiLFxuICBcIiNkZmIwOGJcIixcbiAgXCIjZDA5Yzc2XCIsXG4gIFwiI2MwODY2NFwiLFxuICBcIiNhZDc1NTNcIixcbiAgXCIjOTg2MjQ0XCIsXG4gIFwiIzgyNTEzOFwiLFxuICBcIiM2YzQxMmRcIixcbiAgXCIjNTczMzI0XCIsXG4gIFwiIzQzMjgxZFwiLFxuICBcIiM4ZmE3YTJcIixcbl07XG5cbmV4cG9ydCBjb25zdCBIQUlSX0NPTE9SUyA9IFtcbiAgXCIjMWIxNzE2XCIsXG4gIFwiIzNiMjYxOVwiLFxuICBcIiM2YjQyMjZcIixcbiAgXCIjOGEzYjFlXCIsXG4gIFwiI2I1NTYyYVwiLFxuICBcIiNkOWI1NmNcIixcbiAgXCIjZThlMmQwXCIsXG4gIFwiIzhjOGM4Y1wiLFxuICBcIiNmZjRmYTNcIixcbiAgXCIjM2ZlMGZmXCIsXG4gIFwiIzdjZmY0ZlwiLFxuICBcIiM4ZjViZmZcIixcbl07XG5cbmV4cG9ydCBjb25zdCBFWUVfQ09MT1JTID0gW1xuICBcIiM2ZmI3ZmZcIixcbiAgXCIjOGE2MDM4XCIsXG4gIFwiIzVhYTA1YVwiLFxuICBcIiNhNWFkYjVcIixcbiAgXCIjZThiODQ3XCIsXG4gIFwiI2ZmNTA1MFwiLFxuICBcIiM1ZWY2ZmZcIixcbiAgXCIjYzc3ZGZmXCIsXG5dO1xuXG4vKiogVGhlIHZvaWNlLXRvbmUgcm93IGlzIHRoZSBjaGFyYWN0ZXIncyBgdm9pY2VgLCBub3QgYSBgbG9va2AgdmFsdWUuICovXG5leHBvcnQgY29uc3QgVk9JQ0UgPSB7XG4gIGxhYmVsOiBcIlZPSUNFIFRPTkVcIixcbiAgbmFtZXM6IFtcIk1BU0NVTElORVwiLCBcIkZFTUlOSU5FXCJdLFxufTtcblxuZXhwb3J0IGNvbnN0IExPT0tfT1BUSU9OUzogTG9va09wdGlvbltdID0gW1xuICB7XG4gICAgaWQ6IFwic2tpblRvbmVcIixcbiAgICBsYWJlbDogXCJTS0lOIFRPTkVcIixcbiAgICBjb3VudDogU0tJTl9UT05FUy5sZW5ndGgsXG4gICAgc3dhdGNoZXM6IFNLSU5fVE9ORVMsXG4gIH0sXG4gIHsgaWQ6IFwic2tpblR5cGVcIiwgbGFiZWw6IFwiU0tJTiBUWVBFXCIsIGNvdW50OiA4IH0sXG4gIHsgaWQ6IFwiaGFpcnN0eWxlXCIsIGxhYmVsOiBcIkhBSVJTVFlMRVwiLCBjb3VudDogMTIgfSxcbiAge1xuICAgIGlkOiBcImhhaXJDb2xvclwiLFxuICAgIGxhYmVsOiBcIkhBSVIgQ09MT1JcIixcbiAgICBjb3VudDogSEFJUl9DT0xPUlMubGVuZ3RoLFxuICAgIHN3YXRjaGVzOiBIQUlSX0NPTE9SUyxcbiAgfSxcbiAgeyBpZDogXCJleWVzXCIsIGxhYmVsOiBcIkVZRVNcIiwgY291bnQ6IEVZRV9DT0xPUlMubGVuZ3RoIH0sXG4gIHsgaWQ6IFwiZXllYnJvd3NcIiwgbGFiZWw6IFwiRVlFQlJPV1NcIiwgY291bnQ6IDYgfSxcbiAgeyBpZDogXCJub3NlXCIsIGxhYmVsOiBcIk5PU0VcIiwgY291bnQ6IDYgfSxcbiAgeyBpZDogXCJtb3V0aFwiLCBsYWJlbDogXCJNT1VUSFwiLCBjb3VudDogNiB9LFxuICB7IGlkOiBcImphd1wiLCBsYWJlbDogXCJKQVdcIiwgY291bnQ6IDYgfSxcbiAgeyBpZDogXCJlYXJzXCIsIGxhYmVsOiBcIkVBUlNcIiwgY291bnQ6IDQgfSxcbiAgeyBpZDogXCJjeWJlcndhcmVcIiwgbGFiZWw6IFwiQ1lCRVJXQVJFXCIsIGNvdW50OiA4IH0sXG4gIHsgaWQ6IFwic2NhcnNcIiwgbGFiZWw6IFwiU0NBUlNcIiwgY291bnQ6IDYgfSxcbiAgeyBpZDogXCJ0YXR0b29zXCIsIGxhYmVsOiBcIlRBVFRPT1NcIiwgY291bnQ6IDggfSxcbiAgeyBpZDogXCJwaWVyY2luZ3NcIiwgbGFiZWw6IFwiUElFUkNJTkdTXCIsIGNvdW50OiA2IH0sXG4gIHsgaWQ6IFwibWFrZXVwXCIsIGxhYmVsOiBcIk1BS0VVUFwiLCBjb3VudDogNiB9LFxuICB7IGlkOiBcIm5haWxzXCIsIGxhYmVsOiBcIk5BSUxTXCIsIGNvdW50OiA1IH0sXG5dO1xuXG4vKiogQSBsb29rIHZhbHVlIChldmVyeSBvcHRpb24gc3RhcnRzIGF0IGl0cyBmaXJzdCB2YXJpYW50KS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rKGM6IENoYXJhY3RlciwgaWQ6IHN0cmluZykge1xuICByZXR1cm4gYy5sb29rW2lkXSA/PyAwO1xufVxuXG4vKiogVGhlIGZvdXIgcmVhZHktbWFkZSBmYWNlcyBsZWZ0IG9mIHRoZSBJRCBjYXJkLiAqL1xuZXhwb3J0IGNvbnN0IFBSRVNFVFM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj5bXSA9IFtcbiAge1xuICAgIHNraW5Ub25lOiA4LFxuICAgIHNraW5UeXBlOiAyLFxuICAgIGhhaXJzdHlsZTogMSxcbiAgICBoYWlyQ29sb3I6IDQsXG4gICAgZXllczogMSxcbiAgICBleWVicm93czogMixcbiAgICBqYXc6IDIsXG4gICAgY3liZXJ3YXJlOiAwLFxuICAgIHNjYXJzOiAxLFxuICAgIHRhdHRvb3M6IDAsXG4gICAgcGllcmNpbmdzOiAxLFxuICAgIG1ha2V1cDogMCxcbiAgfSxcbiAge1xuICAgIHNraW5Ub25lOiA0LFxuICAgIHNraW5UeXBlOiAxLFxuICAgIGhhaXJzdHlsZTogNyxcbiAgICBoYWlyQ29sb3I6IDAsXG4gICAgZXllczogMCxcbiAgICBleWVicm93czogNCxcbiAgICBqYXc6IDQsXG4gICAgY3liZXJ3YXJlOiAxLFxuICAgIHNjYXJzOiAwLFxuICAgIHRhdHRvb3M6IDUsXG4gICAgcGllcmNpbmdzOiAwLFxuICAgIG1ha2V1cDogMCxcbiAgfSxcbiAge1xuICAgIHNraW5Ub25lOiAxLFxuICAgIHNraW5UeXBlOiAwLFxuICAgIGhhaXJzdHlsZTogNCxcbiAgICBoYWlyQ29sb3I6IDksXG4gICAgZXllczogNixcbiAgICBleWVicm93czogMSxcbiAgICBqYXc6IDEsXG4gICAgY3liZXJ3YXJlOiAzLFxuICAgIHNjYXJzOiAwLFxuICAgIHRhdHRvb3M6IDIsXG4gICAgcGllcmNpbmdzOiAzLFxuICAgIG1ha2V1cDogMixcbiAgfSxcbiAge1xuICAgIHNraW5Ub25lOiAxMCxcbiAgICBza2luVHlwZTogNCxcbiAgICBoYWlyc3R5bGU6IDIsXG4gICAgaGFpckNvbG9yOiA4LFxuICAgIGV5ZXM6IDUsXG4gICAgZXllYnJvd3M6IDUsXG4gICAgamF3OiAzLFxuICAgIGN5YmVyd2FyZTogNyxcbiAgICBzY2FyczogNCxcbiAgICB0YXR0b29zOiA3LFxuICAgIHBpZXJjaW5nczogNSxcbiAgICBtYWtldXA6IDMsXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgQVRUUl9NSU4gPSAzO1xuZXhwb3J0IGNvbnN0IEFUVFJfTUFYID0gNjtcbi8qKiBQb2ludHMgdG8gc3BlbmQgb24gdG9wIG9mIHRoZSBzdGFydGluZyAzIGluIGVhY2ggYXR0cmlidXRlLiAqL1xuZXhwb3J0IGNvbnN0IEFUVFJfUE9JTlRTID0gNztcblxuZXhwb3J0IGNvbnN0IEFUVFJJQlVURVM6IHtcbiAgaWQ6IEF0dHJpYnV0ZUlkO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNob3J0OiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgZWZmZWN0czogc3RyaW5nW107XG59W10gPSBbXG4gIHtcbiAgICBpZDogXCJib2R5XCIsXG4gICAgbmFtZTogXCJCb2R5XCIsXG4gICAgc2hvcnQ6IFwiQk9EXCIsXG4gICAgdGV4dDogXCJCb2R5IGlzIHJhdyBzdHJlbmd0aCBhbmQgdGhlIHB1bmlzaG1lbnQgeW91IGNhbiB0YWtlLiBFdmVyeSBsZXZlbCBpbiBCb2R5IHdpbGw6XCIsXG4gICAgZWZmZWN0czogW1xuICAgICAgXCJSYWlzZSB5b3VyIG1heGltdW0gSGVhbHRoIGJ5IDVcIixcbiAgICAgIFwiUmFpc2UgbWVsZWUgYW5kIHVuYXJtZWQgZGFtYWdlIGJ5IDIlXCIsXG4gICAgICBcIlNob3J0ZW4gdGhlIHRpbWUgeW91IHN0YXkgc3R1bm5lZFwiLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJpbnRlbGxpZ2VuY2VcIixcbiAgICBuYW1lOiBcIkludGVsbGlnZW5jZVwiLFxuICAgIHNob3J0OiBcIklOVFwiLFxuICAgIHRleHQ6IFwiSW50ZWxsaWdlbmNlIGlzIGhvdyBmYXN0IHlvdXIgbWluZCBtb3ZlcyB0aHJvdWdoIHRoZSBOZXQuIEV2ZXJ5IGxldmVsIGluIEludGVsbGlnZW5jZSB3aWxsOlwiLFxuICAgIGVmZmVjdHM6IFtcbiAgICAgIFwiQWRkIDEgdW5pdCBvZiBjeWJlcmRlY2sgUkFNXCIsXG4gICAgICBcIlJhaXNlIHF1aWNraGFjayBkYW1hZ2UgYnkgMiVcIixcbiAgICAgIFwiQ3V0IGJyZWFjaCBwcm90b2NvbCB0aW1lIGJ5IDAuNSBzZWNcIixcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwicmVmbGV4ZXNcIixcbiAgICBuYW1lOiBcIlJlZmxleGVzXCIsXG4gICAgc2hvcnQ6IFwiUkVGXCIsXG4gICAgdGV4dDogXCJSZWZsZXhlcyBkZWNpZGUgaG93IHF1aWNrbHkgeW91IG1vdmUgYW5kIHJlYWN0LiBPbiB0b3Agb2YgeW91ciBtb3ZlbWVudCBzcGVlZCwgZXZlcnkgbGV2ZWwgaW4gUmVmbGV4ZXMgd2lsbDpcIixcbiAgICBlZmZlY3RzOiBbXG4gICAgICBcIlJhaXNlIHlvdXIgY2hhbmNlIHRvIGV2YWRlIGF0dGFja3MgYnkgMSVcIixcbiAgICAgIFwiUmFpc2UgY3JpdGljYWwgaGl0IGNoYW5jZSBieSAxJVwiLFxuICAgICAgXCJSYWlzZSBkYW1hZ2UgZnJvbSBibGFkZSBpbXBsYW50cyBieSAzJVwiLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJ0ZWNoXCIsXG4gICAgbmFtZTogXCJUZWNobmljYWwgQWJpbGl0eVwiLFxuICAgIHNob3J0OiBcIlRFQ1wiLFxuICAgIHRleHQ6IFwiVGVjaG5pY2FsIEFiaWxpdHkgaXMgeW91ciBmZWVsIGZvciBtYWNoaW5lcywgd2VhcG9ucyBhbmQgaW1wbGFudHMuIEV2ZXJ5IGxldmVsIGluIFRlY2huaWNhbCBBYmlsaXR5IHdpbGw6XCIsXG4gICAgZWZmZWN0czogW1xuICAgICAgXCJSYWlzZSB5b3VyIGFybW9yIGJ5IDQlXCIsXG4gICAgICBcIlVubG9jayBiZXR0ZXIgY3JhZnRpbmcgc3BlY3NcIixcbiAgICAgIFwiUmFpc2UgZGFtYWdlIGZyb20gZ2FkZ2V0cyBieSAzJVwiLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJjb29sXCIsXG4gICAgbmFtZTogXCJDb29sXCIsXG4gICAgc2hvcnQ6IFwiQ09MXCIsXG4gICAgdGV4dDogXCJDb29sIGlzIGhvdyBzdGVhZHkgeW91IHN0YXkgd2hlbiBldmVyeXRoaW5nIGdvZXMgbG91ZC4gRXZlcnkgbGV2ZWwgaW4gQ29vbCB3aWxsOlwiLFxuICAgIGVmZmVjdHM6IFtcbiAgICAgIFwiUmFpc2UgY3JpdGljYWwgZGFtYWdlIGJ5IDIlXCIsXG4gICAgICBcIk1ha2UgeW91IDAuNSUgaGFyZGVyIHRvIGRldGVjdFwiLFxuICAgICAgXCJSYWlzZSByZXNpc3RhbmNlIHRvIGZlYXIgYW5kIHBhbmljIGJ5IDElXCIsXG4gICAgXSxcbiAgfSxcbl07XG5cbi8qKiBGTlYtMWE6IHRoZSBJRCBudW1iZXIgYW5kIGJhcmNvZGUgYXJlIGRlcml2ZWQgZnJvbSB0aGUgaGFuZGxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc2goczogc3RyaW5nKSB7XG4gIGxldCBoID0gMjE2NjEzNjI2MTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgaCBePSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgaCA9IE1hdGguaW11bChoLCAxNjc3NzYxOSk7XG4gIH1cbiAgcmV0dXJuIGggPj4+IDA7XG59XG5cbi8qKiBcIlNDOTEtNDQ3MS0wMjkzLU5ZXCIuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzaWRlbnRJZChoYW5kbGU6IHN0cmluZykge1xuICBjb25zdCBkID0gaGFzaChoYW5kbGUpLnRvU3RyaW5nKCkucGFkU3RhcnQoMTAsIFwiMFwiKTtcbiAgY29uc3QgdGFnID0gaGFuZGxlLnJlcGxhY2UoL1teQS1aMC05XS9nLCBcIlwiKS5zbGljZSgwLCAyKSB8fCBcIlhYXCI7XG4gIHJldHVybiBgU0M5MS0ke2Quc2xpY2UoMCwgNCl9LSR7ZC5zbGljZSg0LCA4KX0tJHt0YWd9YDtcbn1cblxuLyoqIFwiMDRcIiBmcm9tIGEgMC1iYXNlZCB2YXJpYW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR3byhpOiBudW1iZXIpIHtcbiAgcmV0dXJuIChpICsgMSkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG59XG5cbi8qKiBUaGUgaGFuZGxlIGFzIHRoZSBjb3B5IHVzZXMgaXQgKG5ldmVyIGVtcHR5KS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVPZihjOiBDaGFyYWN0ZXIpIHtcbiAgcmV0dXJuIGMuaGFuZGxlLnRyaW0oKSB8fCBcIk5ZWFwiO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUsIHR5cGUgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQge1xuICBpbnRlcnBvbGF0ZSxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhTZXF1ZW5jZSxcbiAgd2l0aFRpbWluZyxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IERJRkZJQ1VMVElFUywgTElGRVBBVEhTLCB0eXBlIENoYXJhY3RlciB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiwgVCwgY2hhbWZlciB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgVk9JQ0UsIGhhc2gsIHJlc2lkZW50SWQgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBMaWZlcGF0aEljb24gfSBmcm9tIFwiLi9nbHlwaHNcIjtcbmltcG9ydCB7IEJhcmNvZGUgfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IHsgUG9ydHJhaXQgfSBmcm9tIFwiLi9Qb3J0cmFpdFwiO1xuaW1wb3J0IHsgUlVMRSwgUmFkYXIgfSBmcm9tIFwiLi9SYWRhclwiO1xuXG5jb25zdCBXID0gNDgwO1xuY29uc3QgSCA9IDY0MDtcblxuLyoqIFRoZSBTYWJsZSBDaXR5IHJlc2lkZW50IElEIG9mIHRoZSBjaGFyYWN0ZXIgYmVpbmcgbWFkZSDigJQgZXZlcnkgZmllbGRcbiAqICBsaXZlOiB0aGUgc2Nhbm5lZCBwb3J0cmFpdCAocmUtc2Nhbm5lZCBvbiBlYWNoIGNoYW5nZSksIHRoZSBoYW5kbGVcbiAqICAoY2xpY2sgdG8gZWRpdDsgRW50ZXIgb3IgRXNjIHRvIGZpbmlzaCksIHRoZSBJRCBudW1iZXIgYW5kIGJhcmNvZGVcbiAqICBkZXJpdmVkIGZyb20gaXQsIHRoZSBsaWZlcGF0aCwgYm9keSwgdm9pY2UsIGRpZmZpY3VsdHkgYW5kIGFuXG4gKiAgYXR0cmlidXRlIHJhZGFyLiBgb25FZGl0aW5nYCByZXBvcnRzIHRoZSBoYW5kbGUgZmllbGQncyBmb2N1cywgc28gdGhlXG4gKiAgc3RlcCdzIHNob3J0Y3V0cyBzdGF5IG91dCBvZiB0aGUgd2F5IHdoaWxlIHR5cGluZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJZENhcmQoe1xuICBjaGFyYWN0ZXIsXG4gIG9uQ2hhbmdlLFxuICBvbkVkaXRpbmcsXG4gIHN0eWxlLFxufToge1xuICBjaGFyYWN0ZXI6IENoYXJhY3RlcjtcbiAgb25DaGFuZ2U6IChjaGFyYWN0ZXI6IENoYXJhY3RlcikgPT4gdm9pZDtcbiAgb25FZGl0aW5nOiAoZWRpdGluZzogYm9vbGVhbikgPT4gdm9pZDtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG59KSB7XG4gIC8vIEZvY3VzIG9ubHkgbGVhdmVzIGEgdGV4dCBmaWVsZCBmb3IgYW5vdGhlciBmb2N1c2FibGUsIHNvIGZpbmlzaGluZyBhblxuICAvLyBlZGl0IHJlbW91bnRzIHRoZSBmaWVsZCAoYSBkZXNwYXduZWQgZmllbGQgZHJvcHMgdGhlIGZvY3VzKS5cbiAgY29uc3QgW2ZpZWxkLCBzZXRGaWVsZF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBlZGl0ID0gKG9uOiBib29sZWFuKSA9PiB7XG4gICAgc2V0RWRpdGluZyhvbik7XG4gICAgb25FZGl0aW5nKG9uKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlZGl0aW5nICYmIChlLmtleSA9PT0gXCJFbnRlclwiIHx8IGUua2V5ID09PSBcIkVzY2FwZVwiKSkge1xuICAgICAgc2V0RmllbGQoZmllbGQgKyAxKTtcbiAgICAgIGVkaXQoZmFsc2UpO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3Qgc2NhbiA9IHVzZVNoYXJlZFZhbHVlKDEpO1xuICBjb25zdCBsb29rS2V5ID0gSlNPTi5zdHJpbmdpZnkoY2hhcmFjdGVyLmxvb2spICsgY2hhcmFjdGVyLmJvZHk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2Nhbi52YWx1ZSA9IHdpdGhTZXF1ZW5jZShcbiAgICAgIHdpdGhUaW1pbmcoMCwgeyBkdXJhdGlvbjogMCB9KSxcbiAgICAgIHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogNjUwLCBlYXNpbmc6IFwiZWFzZUluT3V0XCIgfSksXG4gICAgKTtcbiAgfSwgW2xvb2tLZXksIHNjYW5dKTtcblxuICBjb25zdCBsaWZlcGF0aCA9IExJRkVQQVRIUy5maW5kKChsKSA9PiBsLmlkID09PSBjaGFyYWN0ZXIubGlmZXBhdGgpITtcbiAgY29uc3QgZGlmZmljdWx0eSA9IERJRkZJQ1VMVElFUy5maW5kKChkKSA9PiBkLmlkID09PSBjaGFyYWN0ZXIuZGlmZmljdWx0eSkhO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5jaGFtZmVyKFwiIzBkMGExMFwiLCAzNCwgXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjYpXCIsIDEpLFxuICAgICAgICB3aWR0aDogVyxcbiAgICAgICAgaGVpZ2h0OiBILFxuICAgICAgICAuLi5zdHlsZSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPEhlYWQgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiA3OCxcbiAgICAgICAgICB3aWR0aDogMTkwLFxuICAgICAgICAgIGhlaWdodDogMjM4LFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDk0LCAyNDYsIDI1NSwgMC4yOClcIixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzA3MDkwZVwiLFxuICAgICAgICAgIG92ZXJmbG93WDogXCJjbGlwXCIsXG4gICAgICAgICAgb3ZlcmZsb3dZOiBcImNsaXBcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPFBvcnRyYWl0IGxvb2s9e2NoYXJhY3Rlci5sb29rfSBib2R5PXtjaGFyYWN0ZXIuYm9keX0gd2lkdGg9ezE4OH0gLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgICB0b3A6IC0zLFxuICAgICAgICAgICAgaGVpZ2h0OiAzLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICBvcGFjaXR5OiB7XG4gICAgICAgICAgICAgIGFuaW1hdGVkOiBpbnRlcnBvbGF0ZShzY2FuLCBbMCwgMC4wNCwgMC45LCAxXSwgWzAsIDAuOSwgMC45LCAwXSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJhbnNmb3JtOiB7XG4gICAgICAgICAgICAgIHRyYW5zbGF0ZVk6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHNjYW4sIFswLCAxXSwgWzAsIDI0MF0pIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLlQubWljcm8sXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiAzMjAsXG4gICAgICAgICAgY29sb3I6IEMuY3lhbkRpbSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgQklPTUVUUklDIFNDQU4gMDEgLy8gTElWRVxuICAgICAgPC90ZXh0PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAyMjgsXG4gICAgICAgICAgdG9wOiA3MixcbiAgICAgICAgICB3aWR0aDogMjMyLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiA2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIgfX0+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPExhYmVsPkhBTkRMRTwvTGFiZWw+XG4gICAgICAgICAgICA8TGFiZWwgY29sb3I9e2VkaXRpbmcgPyBDLmN5YW4gOiBDLnJlZERpbX0+XG4gICAgICAgICAgICAgIHtlZGl0aW5nID8gXCJFTlRFUiBUTyBDT05GSVJNXCIgOiBcIkNMSUNLIFRPIEVESVRcIn1cbiAgICAgICAgICAgIDwvTGFiZWw+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDxlZGl0YWJsZVRleHRcbiAgICAgICAgICAgIGtleT17ZmllbGR9XG4gICAgICAgICAgICB2YWx1ZT17Y2hhcmFjdGVyLmhhbmRsZX1cbiAgICAgICAgICAgIG1heExlbmd0aD17MTJ9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHYpID0+XG4gICAgICAgICAgICAgIG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCBoYW5kbGU6IHYudG9VcHBlckNhc2UoKSB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb25Gb2N1cz17KCkgPT4gZWRpdCh0cnVlKX1cbiAgICAgICAgICAgIG9uQmx1cj17KCkgPT4gZWRpdChmYWxzZSl9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogMjMyLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDQ0LFxuICAgICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDQgfSxcbiAgICAgICAgICAgICAgYm9yZGVyOiB7IGJvdHRvbTogMiB9LFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjYpXCIsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAzNixcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLFxuICAgICAgICAgICAgICBjdXJzb3I6IFwidGV4dFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGZvY3VzU3R5bGU9e3sgYm9yZGVyQ29sb3I6IEMuY3lhbiwgYmFja2dyb3VuZENvbG9yOiBcIiMwZjFkMjRcIiB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPEZpZWxkIGxhYmVsPVwiUkVTSURFTlQgTk8uXCI+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5tb25vLFxuICAgICAgICAgICAgICBjb2xvcjogQy53aGl0ZSxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7cmVzaWRlbnRJZChjaGFyYWN0ZXIuaGFuZGxlKX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvRmllbGQ+XG4gICAgICAgIDxGaWVsZCBsYWJlbD1cIkxJRkVQQVRIXCI+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA4IH19PlxuICAgICAgICAgICAgPExpZmVwYXRoSWNvbiBpZD17bGlmZXBhdGguaWR9IC8+XG4gICAgICAgICAgICA8VmFsdWU+e2xpZmVwYXRoLm5hbWUudG9VcHBlckNhc2UoKX08L1ZhbHVlPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9GaWVsZD5cbiAgICAgICAgPEZpZWxkIGxhYmVsPVwiQk9EWSBUWVBFXCI+XG4gICAgICAgICAgPFZhbHVlPlxuICAgICAgICAgICAge2NoYXJhY3Rlci5ib2R5ID09PSAwID8gXCJGUkFNRSBBIC8vIEJST0FEXCIgOiBcIkZSQU1FIEIgLy8gU0xJR0hUXCJ9XG4gICAgICAgICAgPC9WYWx1ZT5cbiAgICAgICAgPC9GaWVsZD5cbiAgICAgICAgPEZpZWxkIGxhYmVsPVwiVk9JQ0UgVE9ORVwiPlxuICAgICAgICAgIDxWYWx1ZT57Vk9JQ0UubmFtZXNbY2hhcmFjdGVyLnZvaWNlXX08L1ZhbHVlPlxuICAgICAgICA8L0ZpZWxkPlxuICAgICAgICA8RmllbGQgbGFiZWw9XCJESUZGSUNVTFRZXCI+XG4gICAgICAgICAgPFZhbHVlPntkaWZmaWN1bHR5Lm5hbWV9PC9WYWx1ZT5cbiAgICAgICAgPC9GaWVsZD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgcmlnaHQ6IDIwLFxuICAgICAgICAgIHRvcDogUlVMRSxcbiAgICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuNDUpXCIsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPFJhZGFyIGF0dHJpYnV0ZXM9e2NoYXJhY3Rlci5hdHRyaWJ1dGVzfSAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAyMCxcbiAgICAgICAgICB0b3A6IFJVTEUgKyAyMTAsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBnYXA6IDIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxCYXJjb2RlIHNlZWQ9e2hhc2goY2hhcmFjdGVyLmhhbmRsZSl9IHdpZHRoPXszMDB9IGhlaWdodD17MzB9IC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGNvbG9yOiBDLnJlZCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICAgIHtgJHtyZXNpZGVudElkKGNoYXJhY3Rlci5oYW5kbGUpLnJlcGxhY2UoLy0vZywgXCIgXCIpfSAgJHtoYXNoKFxuICAgICAgICAgICAgY2hhcmFjdGVyLmhhbmRsZSArIFwiI1wiLFxuICAgICAgICAgIClcbiAgICAgICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgICAgIC50b1VwcGVyQ2FzZSgpfWB9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAzNDAsXG4gICAgICAgICAgdG9wOiBSVUxFICsgMjEzLFxuICAgICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgICAgZm9udFNpemU6IDcuNSxcbiAgICAgICAgICBjb2xvcjogQy5yZWREaW0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtcbiAgICAgICAgICBcIlBST1BFUlRZIE9GIFRIRSBDSVRZXFxuT0YgU0FCTEUuIFZPSUQgSUZcXG5UQU1QRVJFRCBXSVRILiBDQVJSWVxcbkFUIEFMTCBUSU1FUy5cIlxuICAgICAgICB9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIGNhcmQncyBoZWFkOiB0aGUgcmVnaXN0cnkgbWFyaywgdGhlIHRpdGxlIGFuZCBpdHMgc21hbGwgcHJpbnQsXG4gKiAgYW5kIGEgY2hpcC4gKi9cbmZ1bmN0aW9uIEhlYWQoKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgaGVpZ2h0OiA2MCxcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICBhbmdsZTogOTAsXG4gICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiIzNjMTIxOFwiIH0sIHsgY29sb3I6IFwiIzFhMGMxMlwiIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9yZGVyOiB7IGJvdHRvbTogMSB9LFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuNilcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8c3ZnXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgNjAgNDBcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDE2LFxuICAgICAgICAgIHRvcDogMTIsXG4gICAgICAgICAgd2lkdGg6IDQ4LFxuICAgICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXtbMiwgMzgsIDE2LCA4LCAyNiwgMjYsIDMyLCAxNCwgNDAsIDI4LCA0NiwgNiwgNTgsIDM4XX1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICBzdHJva2VXaWR0aD17M31cbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiA3NCxcbiAgICAgICAgICB0b3A6IDgsXG4gICAgICAgICAgZm9udFNpemU6IDI0LFxuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIFNBQkxFIENJVFkgUkVTSURFTlQgSURcbiAgICAgIDwvdGV4dD5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiA3NSxcbiAgICAgICAgICB0b3A6IDM4LFxuICAgICAgICAgIGZvbnRTaXplOiA4LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7XG4gICAgICAgICAgXCJDSVRJWkVOIFJFR0lTVFJZIC8vIERJU1RSSUNUIDA0IC8vIElTU1VFRCAxMC4wNy45MVxcbkdSSURXQVRDSCBDTEVBUkVEIC8vIENMQVNTIEMgLy8gVkFMSUQgVU5USUwgUkVWT0tFRFwiXG4gICAgICAgIH1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD1cIjAgMCAzNCAyNlwiXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDE2LFxuICAgICAgICAgIHRvcDogMTYsXG4gICAgICAgICAgd2lkdGg6IDM0LFxuICAgICAgICAgIGhlaWdodDogMjYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxyZWN0XG4gICAgICAgICAgeD17MX1cbiAgICAgICAgICB5PXsxfVxuICAgICAgICAgIHdpZHRoPXszMn1cbiAgICAgICAgICBoZWlnaHQ9ezI0fVxuICAgICAgICAgIHJ4PXs0fVxuICAgICAgICAgIGZpbGw9XCIjMWUyYTJlXCJcbiAgICAgICAgICBzdHJva2U9e0MuY3lhbkRpbX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MS4yfVxuICAgICAgICAvPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNMSA5SDExVjE3SDFNMzMgOUgyM1YxN0gzM00xMSAxVjI1TTIzIDFWMjVNMTEgMTNIMjNcIlxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e0MuY3lhbkRpbX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnPlxuICAgIDwvPlxuICApO1xufVxuXG4vKiogQSBmaWVsZCdzIG5hbWU6IHRpbnksIHNwYWNlZCwgbW9uby4gKi9cbmZ1bmN0aW9uIExhYmVsKHtcbiAgY2hpbGRyZW4sXG4gIGNvbG9yID0gQy5yZWREaW0sXG59OiB7XG4gIGNoaWxkcmVuOiBzdHJpbmc7XG4gIGNvbG9yPzogc3RyaW5nO1xufSkge1xuICByZXR1cm4gKFxuICAgIDx0ZXh0XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICBmb250U2l6ZTogMTAsXG4gICAgICAgIGNvbG9yLFxuICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLFxuICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L3RleHQ+XG4gICk7XG59XG5cbi8qKiBBIGZpZWxkJ3MgdmFsdWU6IHNlbWlib2xkIGN5YW4uICovXG5mdW5jdGlvbiBWYWx1ZSh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPHRleHRcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZvbnRTaXplOiAyMSxcbiAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC90ZXh0PlxuICApO1xufVxuXG4vKiogQSBsYWJlbGxlZCBmaWVsZC4gKi9cbmZ1bmN0aW9uIEZpZWxkKHsgbGFiZWwsIGNoaWxkcmVuIH06IHsgbGFiZWw6IHN0cmluZzsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAxIH19PlxuICAgICAgPExhYmVsPntsYWJlbH08L0xhYmVsPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IEF0dHJpYnV0ZUlkLCBMaWZlcGF0aCB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQyB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuXG4vLyBUaGUgbmV3IGdhbWUncyBsaW5lLWFydCBnbHlwaHMuXG5cbi8qKiBUaGUgbW91c2Ugd2l0aCBpdHMgd2hlZWwgbGl0OiB0aGUgU0NST0xMIGhpbnQuICovXG5leHBvcnQgZnVuY3Rpb24gV2hlZWxJY29uKHsgY29sb3IgPSBDLmN5YW4gfTogeyBjb2xvcj86IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDIyIDI0XCIgc3R5bGU9e3sgd2lkdGg6IDI0LCBoZWlnaHQ6IDI2IH19PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk04IDEuNSBDNCAxLjUgMS44IDQgMS44IDggTDEuOCAxNiBDMS44IDIwIDQuNCAyMi41IDggMjIuNSBDMTEuNiAyMi41IDE0LjIgMjAgMTQuMiAxNiBMMTQuMiA4IEMxNC4yIDQgMTIgMS41IDggMS41IFpcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAvPlxuICAgICAgPHJlY3QgeD17Ni42fSB5PXs0LjV9IHdpZHRoPXsyLjh9IGhlaWdodD17NS41fSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17WzE4LCAxLCAyMSwgNSwgMTUsIDVdfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17WzE4LCAxMSwgMjEsIDcsIDE1LCA3XX0gZmlsbD17Y29sb3J9IC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBUaGUgYmFkZ2VzIGxlZnQgb2YgdGhlIHN0ZXAgdGl0bGVzICgzNiBweCwgY3lhbiBsaW5lIGFydCkuICovXG5leHBvcnQgZnVuY3Rpb24gU3RlcEljb24oe1xuICBraW5kLFxufToge1xuICBraW5kOlxuICAgIHwgXCJkaWZmaWN1bHR5XCJcbiAgICB8IFwibGlmZXBhdGhcIlxuICAgIHwgXCJib2R5XCJcbiAgICB8IFwiYXBwZWFyYW5jZVwiXG4gICAgfCBcImF0dHJpYnV0ZXNcIlxuICAgIHwgXCJzdW1tYXJ5XCI7XG59KSB7XG4gIGNvbnN0IHMgPSB7IGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IEMuY3lhbiwgc3Ryb2tlV2lkdGg6IDIgfSBhcyBjb25zdDtcbiAgY29uc3QgdGhpbiA9IHsgZmlsbDogXCJub25lXCIsIHN0cm9rZTogQy5jeWFuLCBzdHJva2VXaWR0aDogMS40IH0gYXMgY29uc3Q7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDM2IDM2XCIgc3R5bGU9e3sgd2lkdGg6IDM2LCBoZWlnaHQ6IDM2IH19PlxuICAgICAge2tpbmQgPT09IFwiZGlmZmljdWx0eVwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWdvbiBwb2ludHM9e1syLCA1LCAzNCwgNSwgMTgsIDMzXX0gey4uLnN9IC8+XG4gICAgICAgICAgPHBvbHlnb24gcG9pbnRzPXtbMTEsIDEzLCAyNSwgMTMsIDE4LCAyNV19IHsuLi50aGlufSAvPlxuICAgICAgICAgIDxyZWN0IHg9ezEwfSB5PXs3LjV9IHdpZHRoPXsxNn0gaGVpZ2h0PXsyfSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtraW5kID09PSBcImxpZmVwYXRoXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1sxOCwgMSwgMzMsIDkuNSwgMzMsIDI2LjUsIDE4LCAzNSwgMywgMjYuNSwgMywgOS41XX1cbiAgICAgICAgICAgIHsuLi5zfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17WzE4LCAyNywgMTgsIDE5LCAxMSwgMTJdfSB7Li4udGhpbn0gLz5cbiAgICAgICAgICA8bGluZSB4MT17MTh9IHkxPXsxOX0geDI9ezI1fSB5Mj17MTJ9IHsuLi50aGlufSAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezE4fSBjeT17Mjd9IHI9ezIuNH0gZmlsbD17Qy5jeWFufSAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezExfSBjeT17MTEuNX0gcj17Mi40fSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgICAgPGNpcmNsZSBjeD17MjV9IGN5PXsxMS41fSByPXsyLjR9IGZpbGw9e0MuY3lhbn0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge2tpbmQgPT09IFwiYm9keVwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cmVjdCB4PXsyfSB5PXsyfSB3aWR0aD17MzJ9IGhlaWdodD17MzJ9IHJ4PXszfSB7Li4uc30gLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsxOH0gY3k9ezl9IHI9ezN9IGZpbGw9e0MuY3lhbn0gLz5cbiAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXtbMTEsIDE4LCAxNCwgMTQsIDIyLCAxNCwgMjUsIDE4XX0gey4uLnRoaW59IC8+XG4gICAgICAgICAgPHBvbHlsaW5lIHBvaW50cz17WzE1LCAxNCwgMTUsIDIyLCAxMywgMzBdfSB7Li4udGhpbn0gLz5cbiAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXtbMjEsIDE0LCAyMSwgMjIsIDIzLCAzMF19IHsuLi50aGlufSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7a2luZCA9PT0gXCJhcHBlYXJhbmNlXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxyZWN0IHg9ezJ9IHk9ezJ9IHdpZHRoPXszMn0gaGVpZ2h0PXszMn0gey4uLnN9IC8+XG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGQ9XCJNMTggNyBDMTIgNyAxMCAxMSAxMCAxNiBDMTAgMjIgMTMgMjggMTggMjkgQzIzIDI4IDI2IDIyIDI2IDE2IEMyNiAxMSAyNCA3IDE4IDcgWlwiXG4gICAgICAgICAgICB7Li4udGhpbn1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICB4MT17Nn1cbiAgICAgICAgICAgIHkxPXsxNX1cbiAgICAgICAgICAgIHgyPXszMH1cbiAgICAgICAgICAgIHkyPXsxNX1cbiAgICAgICAgICAgIHN0cm9rZT17Qy5jeWFufVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezF9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8bGluZVxuICAgICAgICAgICAgeDE9ezZ9XG4gICAgICAgICAgICB5MT17MjF9XG4gICAgICAgICAgICB4Mj17MzB9XG4gICAgICAgICAgICB5Mj17MjF9XG4gICAgICAgICAgICBzdHJva2U9e0MuY3lhbn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtraW5kID09PSBcImF0dHJpYnV0ZXNcIiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICAgIHBvaW50cz17WzE4LCAyLCAzNCwgMTMuNiwgMjcuOSwgMzIuNCwgOC4xLCAzMi40LCAyLCAxMy42XX1cbiAgICAgICAgICAgIHsuLi5zfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICAgIHBvaW50cz17WzE4LCA5LCAyNiwgMTUsIDIzLCAyNiwgMTIsIDI1LCAxMSwgMTVdfVxuICAgICAgICAgICAgZmlsbD17Qy5jeWFufVxuICAgICAgICAgICAgb3BhY2l0eT17MC41NX1cbiAgICAgICAgICAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7a2luZCA9PT0gXCJzdW1tYXJ5XCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxwb2x5Z29uIHBvaW50cz17WzE4LCAxLCAzNSwgMTgsIDE4LCAzNSwgMSwgMThdfSB7Li4uc30gLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsxOH0gY3k9ezE4fSByPXs4fSB7Li4udGhpbn0gLz5cbiAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXtbMTQsIDE4LCAxNywgMjEsIDIzLCAxNF19IHsuLi5zfSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBFYWNoIGF0dHJpYnV0ZSdzIGJhZGdlOiBhIGhleGFnb24gcm91bmQgYSBnbHlwaCDigJQgYSBkdW1iYmVsbCwgYSBjaGlwLCBhXG4gKiAgYm9sdCwgYSBnZWFyLCBhIGNyb3NzaGFpci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBdHRyaWJ1dGVJY29uKHtcbiAgaWQsXG4gIGNvbG9yID0gQy5yZWQsXG59OiB7XG4gIGlkOiBBdHRyaWJ1dGVJZDtcbiAgY29sb3I/OiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IHMgPSB7IGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IGNvbG9yLCBzdHJva2VXaWR0aDogMiB9IGFzIGNvbnN0O1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCA0MCA0MlwiIHN0eWxlPXt7IHdpZHRoOiA0MCwgaGVpZ2h0OiA0MiB9fT5cbiAgICAgIDxwb2x5Z29uXG4gICAgICAgIHBvaW50cz17WzIwLCAyLCAzNywgMTEuNSwgMzcsIDMwLjUsIDIwLCA0MCwgMywgMzAuNSwgMywgMTEuNV19XG4gICAgICAgIHsuLi5zfVxuICAgICAgLz5cbiAgICAgIHtpZCA9PT0gXCJib2R5XCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxyZWN0IHg9ezExfSB5PXsxOS41fSB3aWR0aD17MTh9IGhlaWdodD17M30gZmlsbD17Y29sb3J9IC8+XG4gICAgICAgICAgPHJlY3QgeD17OX0geT17MTR9IHdpZHRoPXs0fSBoZWlnaHQ9ezE0fSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgICAgICA8cmVjdCB4PXsyN30geT17MTR9IHdpZHRoPXs0fSBoZWlnaHQ9ezE0fSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge2lkID09PSBcImludGVsbGlnZW5jZVwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cmVjdCB4PXsxM30geT17MTR9IHdpZHRoPXsxNH0gaGVpZ2h0PXsxNH0gey4uLnN9IHN0cm9rZVdpZHRoPXsxLjZ9IC8+XG4gICAgICAgICAgPHJlY3QgeD17MTcuNX0geT17MTguNX0gd2lkdGg9ezV9IGhlaWdodD17NX0gZmlsbD17Y29sb3J9IC8+XG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGQ9XCJNMTYgMTFWMTRNMjAgMTFWMTRNMjQgMTFWMTRNMTYgMjhWMzFNMjAgMjhWMzFNMjQgMjhWMzFNMTAgMTdIMTNNMTAgMjFIMTNNMTAgMjVIMTNNMjcgMTdIMzBNMjcgMjFIMzBNMjcgMjVIMzBcIlxuICAgICAgICAgICAgey4uLnN9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS4yfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtpZCA9PT0gXCJyZWZsZXhlc1wiICYmIChcbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBwb2ludHM9e1syMiwgOSwgMTMsIDIzLCAxOSwgMjMsIDE3LCAzMywgMjcsIDE4LCAyMSwgMThdfVxuICAgICAgICAgIGZpbGw9e2NvbG9yfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtpZCA9PT0gXCJ0ZWNoXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1tcbiAgICAgICAgICAgICAgMTcsIDEwLCAyMywgMTAsIDI0LCAxNCwgMjgsIDEyLCAzMSwgMTcsIDI3LCAyMCwgMzEsIDI1LCAyOCwgMzAsXG4gICAgICAgICAgICAgIDI0LCAyOCwgMjMsIDMyLCAxNywgMzIsIDE2LCAyOCwgMTIsIDMwLCA5LCAyNSwgMTMsIDIxLCA5LCAxNywgMTIsXG4gICAgICAgICAgICAgIDEyLCAxNiwgMTQsXG4gICAgICAgICAgICBdfVxuICAgICAgICAgICAgey4uLnN9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS40fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGNpcmNsZSBjeD17MjB9IGN5PXsyMX0gcj17NH0gZmlsbD17Y29sb3J9IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtpZCA9PT0gXCJjb29sXCIgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezIwfSBjeT17MjF9IHI9ezh9IHsuLi5zfSBzdHJva2VXaWR0aD17MS42fSAvPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBkPVwiTTIwIDlWMTZNMjAgMjZWMzNNOCAyMUgxNU0yNSAyMUgzMlwiXG4gICAgICAgICAgICB7Li4uc31cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXsyMH0gY3k9ezIxfSByPXsxLjh9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9zdmc+XG4gICk7XG59XG5cbi8qKiBBIHNtYWxsIGdseXBoIHBlciBsaWZlcGF0aDogYSBtZXNhIGFuZCBhIHN1biwgYSBza3lsaW5lLCBhIHRvd2VyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExpZmVwYXRoSWNvbih7XG4gIGlkLFxuICBjb2xvciA9IEMuY3lhbixcbn06IHtcbiAgaWQ6IExpZmVwYXRoO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgY29uc3QgcyA9IHsgZmlsbDogXCJub25lXCIsIHN0cm9rZTogY29sb3IsIHN0cm9rZVdpZHRoOiAxLjYgfSBhcyBjb25zdDtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBzdHlsZT17eyB3aWR0aDogMjIsIGhlaWdodDogMjIgfX0+XG4gICAgICA8cmVjdCB4PXsxfSB5PXsxfSB3aWR0aD17MjJ9IGhlaWdodD17MjJ9IHsuLi5zfSBzdHJva2VXaWR0aD17MX0gLz5cbiAgICAgIHtpZCA9PT0gXCJub21hZFwiICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXtbMywgMTksIDksIDEwLCAxMywgMTUsIDE2LCAxMSwgMjEsIDE5XX0gey4uLnN9IC8+XG4gICAgICAgICAgPGNpcmNsZSBjeD17MTZ9IGN5PXs2fSByPXsyLjJ9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7aWQgPT09IFwic3RyZWV0a2lkXCIgJiYgKFxuICAgICAgICA8cGF0aCBkPVwiTTMgMjFWMTJIN1Y4SDExVjE0SDE0VjVIMThWMTFIMjFWMjFcIiB7Li4uc30gLz5cbiAgICAgICl9XG4gICAgICB7aWQgPT09IFwiY29ycG9cIiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPHBvbHlnb24gcG9pbnRzPXtbOSwgMjEsIDEwLCA3LCAxMiwgMywgMTQsIDcsIDE1LCAyMV19IHsuLi5zfSAvPlxuICAgICAgICAgIDxsaW5lIHgxPXs0fSB5MT17MjF9IHgyPXsyMH0geTI9ezIxfSB7Li4uc30gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvc3ZnPlxuICApO1xufVxuXG4vKiogVGhlIGdyaWQgYnV0dG9uJ3MgZ2x5cGg6IHR3byByb3dzIG9mIHRocmVlIGNlbGxzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdyaWRJY29uKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNiAyMFwiIHN0eWxlPXt7IHdpZHRoOiAyNiwgaGVpZ2h0OiAyMCB9fT5cbiAgICAgIHtbMCwgMV0uZmxhdE1hcCgocikgPT5cbiAgICAgICAgWzAsIDEsIDJdLm1hcCgoYykgPT4gKFxuICAgICAgICAgIDxyZWN0XG4gICAgICAgICAgICBrZXk9e2Ake3J9JHtjfWB9XG4gICAgICAgICAgICB4PXsxICsgYyAqIDl9XG4gICAgICAgICAgICB5PXsxICsgciAqIDEwfVxuICAgICAgICAgICAgd2lkdGg9ezZ9XG4gICAgICAgICAgICBoZWlnaHQ9ezh9XG4gICAgICAgICAgICByeD17MX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17Qy5jeWFufVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNH1cbiAgICAgICAgICAvPlxuICAgICAgICApKSxcbiAgICAgICl9XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IEMsIEYsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IExlZ2FsRm9vdGVyLCBQcm90b2NvbFN0YW1wLCBybmcgfSBmcm9tIFwiLi4vLi4vdWkvZGVjb3JcIjtcbmltcG9ydCB7IEtleWNhcCB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcblxuLyoqIFRoZSBsaXQgcmVkIG9mIGhvdmVyZWQgZnJhbWVzLiAqL1xuY29uc3QgSE9UID0gXCIjZmY1ZjU2XCI7XG4vKiogV2hhdCBzaXRzIGJlaGluZCB0aGUgY2FyZHM6IG1hc2tzIGN1dCB0aGVpciBjb250ZW50J3MgY29ybmVycyB3aXRoIGl0LiAqL1xuY29uc3QgQkcgPSBcIiMwYTBkMTNcIjtcblxuLyoqIFRoZSBmdXJuaXR1cmUgb2Ygc3RlcHMgMi02OiB0aGUgcHJvdG9jb2wgc3RhbXAgdG9wIGxlZnQsIHRoZSByZXNpZGVudFxuICogIGRhdGFiYXNlJ3MgcHJpbnQgYm90dG9tIGxlZnQsIGEgcmVmZXJlbmNlIHRhZyBib3R0b20gY2VudGVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENocm9tZSgpIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPFByb3RvY29sU3RhbXAgLz5cbiAgICAgIDxMZWdhbEZvb3RlciAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiA4MTUsXG4gICAgICAgICAgYm90dG9tOiAyMixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiA2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogMTAgfX0+XG4gICAgICAgICAgU0JMIDA0NCBDS0MgMTUxIENDMTAgQTU1XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDMwIDhcIiBzdHlsZT17eyB3aWR0aDogMzAsIGhlaWdodDogOCB9fT5cbiAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgcG9pbnRzPXtbMCwgNCwgOSwgMCwgOSwgMywgMzAsIDMsIDMwLCA1LCA5LCA1LCA5LCA4XX1cbiAgICAgICAgICAgIGZpbGw9e0MucmVkfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgPC9ub2RlPlxuICAgIDwvPlxuICApO1xufVxuXG4vKiogQSBncmFkaWVudCB0aGF0IHBhaW50cyB0aGUgYGN1dGAgcHggYm90dG9tLXJpZ2h0IGNvcm5lciBvZiBpdHMgbm9kZSBpblxuICogIGBjb2xvcmAgKGFuZCBhIGBsaW5lYCBiYW5kIGFsb25nIHRoZSBjdXQpOiBob3cgYSByZWN0YW5ndWxhciBgPHBvcnRhbD5gXG4gKiAgZ2V0cyBhIGN1dCBjb3JuZXIuICovXG5mdW5jdGlvbiBjb3JuZXJNYXNrKGN1dDogbnVtYmVyLCBsaW5lPzogc3RyaW5nLCBjb2xvciA9IEJHKTogQmV2eVN0eWxlIHtcbiAgY29uc3QgZCA9IGN1dCAvIE1hdGguU1FSVDI7XG4gIGNvbnN0IGNsZWFyID0gQy5jbGVhcjtcbiAgcmV0dXJuIHtcbiAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICBhbmdsZTogMzE1LFxuICAgICAgc3RvcHM6IGxpbmVcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB7IGNvbG9yLCBwb3NpdGlvbjogZCAtIDAuMyB9LFxuICAgICAgICAgICAgeyBjb2xvcjogbGluZSwgcG9zaXRpb246IGQgKyAwLjMgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IGxpbmUsIHBvc2l0aW9uOiBkICsgMi42IH0sXG4gICAgICAgICAgICB7IGNvbG9yOiBjbGVhciwgcG9zaXRpb246IGQgKyAzLjIgfSxcbiAgICAgICAgICBdXG4gICAgICAgIDogW1xuICAgICAgICAgICAgeyBjb2xvciwgcG9zaXRpb246IGQgfSxcbiAgICAgICAgICAgIHsgY29sb3I6IGNsZWFyLCBwb3NpdGlvbjogZCArIDAuNiB9LFxuICAgICAgICAgIF0sXG4gICAgfSxcbiAgfTtcbn1cblxuY29uc3QgYWJzID0gKHM6IEJldnlTdHlsZSk6IEJldnlTdHlsZSA9PiAoeyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgLi4ucyB9KTtcblxuLyoqIFRoZSBsaXQgZnJhbWUgb2YgdGhlIGhvdmVyZWQgY2FyZCwgbGFpZCBvdmVyIGl0cyBjb250ZW50IGJveDogcmVkIHJ1bGVzXG4gKiAgcm91bmQgaXQsIGEgc3RlcCBvdXQgZG93biB0aGUgbGVmdCBlZGdlLCBhIHRoaWNrIGJhciBvdXRzaWRlIHRoZSByaWdodFxuICogIGVkZ2Ugd2l0aCBpdHMgZm9vdCBjdXQgYXQgNDXCsCAoYGN1dGAg4omlIGBiYXJgIGFsc28gY3V0cyB0aGUgY29udGVudCdzXG4gKiAgY29ybmVyKSwgYWxsIGdsb3dpbmcuICovXG5leHBvcnQgZnVuY3Rpb24gSG90RnJhbWUoe1xuICBiYXIgPSAyMixcbiAgY3V0ID0gMjIsXG4gIHN0ZXAgPSA5Nixcbn06IHtcbiAgYmFyPzogbnVtYmVyO1xuICBjdXQ/OiBudW1iZXI7XG4gIHN0ZXA/OiBudW1iZXI7XG59KSB7XG4gIC8vIFRoZSBjdXQgcnVucyBmcm9tIHRoZSBvdmVybGF5J3Mgb3V0ZXIgY29ybmVyIChgYmFyYCByaWdodCBvZiB0aGVcbiAgLy8gY29udGVudCwgNCBweCB1bmRlciBpdCk6IHdoYXQncyBsZWZ0IG9mIGl0IGN1dHMgdGhlIGNvbnRlbnQncyBjb3JuZXIuXG4gIGNvbnN0IGlubmVyID0gTWF0aC5tYXgoMCwgY3V0IC0gYmFyIC0gNCk7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHsvKiBUaGUgY29ybmVyIGdvZXMgdW5kZXIgdGhlIGdsb3c7IGl0cyBlZGdlIGdsb3dzIHdpdGggdGhlIHJlc3QuICovfVxuICAgICAge2lubmVyID4gMCAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e2Ficyh7XG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICAuLi5jb3JuZXJNYXNrKGlubmVyKSxcbiAgICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmFicyh7IGxlZnQ6IC04LCB0b3A6IC00LCByaWdodDogLWJhciwgYm90dG9tOiAtNCB9KSxcbiAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgIG5hbWU6IFwic2hhZG93XCIsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgyNTUsIDYwLCA1MiwgMC43NSlcIixcbiAgICAgICAgICAgICAgb2Zmc2V0WDogMCxcbiAgICAgICAgICAgICAgb2Zmc2V0WTogMCxcbiAgICAgICAgICAgICAgc3ByZWFkOiAxNCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2lubmVyID4gMCAmJiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgICAgICBsZWZ0OiA4LFxuICAgICAgICAgICAgICB0b3A6IDQsXG4gICAgICAgICAgICAgIHJpZ2h0OiBiYXIsXG4gICAgICAgICAgICAgIGJvdHRvbTogNCxcbiAgICAgICAgICAgICAgLi4uY29ybmVyTWFzayhpbm5lciwgSE9ULCBDLmNsZWFyKSxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgIC8+XG4gICAgICAgICl9XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e2Ficyh7XG4gICAgICAgICAgICBsZWZ0OiA1LFxuICAgICAgICAgICAgcmlnaHQ6IGJhcixcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGhlaWdodDogNCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogSE9ULFxuICAgICAgICAgIH0pfVxuICAgICAgICAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgICAgbGVmdDogNSxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIHdpZHRoOiAzLFxuICAgICAgICAgICAgaGVpZ2h0OiBzdGVwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBIT1QsXG4gICAgICAgICAgfSl9XG4gICAgICAgIC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e2Ficyh7XG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgdG9wOiBzdGVwLFxuICAgICAgICAgICAgd2lkdGg6IDgsXG4gICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICAuLi5jaGFtZmVyKEhPVCwgOCwgdW5kZWZpbmVkLCAxLCBcImJsXCIpLFxuICAgICAgICAgIH0pfVxuICAgICAgICAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgICAgbGVmdDogOCxcbiAgICAgICAgICAgIHJpZ2h0OiBiYXIgKyBpbm5lcixcbiAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgIGhlaWdodDogNCxcbiAgICAgICAgICAgIC4uLihpbm5lciA+IDBcbiAgICAgICAgICAgICAgPyBjaGFtZmVyKEhPVCwgNCwgdW5kZWZpbmVkLCAxLCBcImJyXCIpXG4gICAgICAgICAgICAgIDogeyBiYWNrZ3JvdW5kQ29sb3I6IEhPVCB9KSxcbiAgICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgd2lkdGg6IGJhcixcbiAgICAgICAgICAgIC4uLmNoYW1mZXIoSE9ULCBjdXQsIHVuZGVmaW5lZCwgMSwgXCJiclwiKSxcbiAgICAgICAgICB9KX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIEEgY2FyZCBhdCByZXN0OiBhIGhhaXJsaW5lIGZyYW1lLCBpdHMgY29ybmVyIGN1dCwgYSB0aWNrIG9uIGl0cyBmb290XG4gKiAgYHRpY2tgIHB4IGZyb20gaXRzIGxlZnQuICovXG5leHBvcnQgZnVuY3Rpb24gQ29sZEZyYW1lKHtcbiAgY3V0ID0gMzAsXG4gIHRpY2sgPSAxODYsXG4gIGxpbmUgPSBcIiNhMzMzMmJcIixcbn06IHtcbiAgY3V0PzogbnVtYmVyO1xuICB0aWNrPzogbnVtYmVyO1xuICBsaW5lPzogc3RyaW5nO1xufSkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgLi4uY29ybmVyTWFzayhjdXQpLFxuICAgICAgICB9KX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17YWJzKHtcbiAgICAgICAgICBsZWZ0OiAtMSxcbiAgICAgICAgICB0b3A6IC0xLFxuICAgICAgICAgIHJpZ2h0OiAtMSxcbiAgICAgICAgICBib3R0b206IC0xLFxuICAgICAgICAgIC4uLmNoYW1mZXIoQy5jbGVhciwgY3V0ICsgMSwgbGluZSwgMSksXG4gICAgICAgIH0pfVxuICAgICAgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgIGxlZnQ6IHRpY2ssXG4gICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgIHdpZHRoOiA2LFxuICAgICAgICAgIGhlaWdodDogNTQsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBsaW5lLFxuICAgICAgICB9KX1cbiAgICAgIC8+XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBBIGJhcmNvZGUgYHdpZHRoYCDDlyBgaGVpZ2h0YCwgaXRzIGJhcnMgcm9sbGVkIGZyb20gYHNlZWRgIChvbmUgcGF0aCkuICovXG5leHBvcnQgZnVuY3Rpb24gQmFyY29kZSh7XG4gIHNlZWQsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG4gIGNvbG9yID0gQy5yZWQsXG59OiB7XG4gIHNlZWQ6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIGNvbG9yPzogc3RyaW5nO1xufSkge1xuICBjb25zdCByID0gcm5nKHNlZWQpO1xuICBsZXQgZCA9IFwiXCI7XG4gIGZvciAobGV0IHggPSAwOyB4IDwgd2lkdGggLSAxOyApIHtcbiAgICBjb25zdCB3ID0gMSArIE1hdGguZmxvb3IocigpICogMyk7XG4gICAgaWYgKHIoKSA+IDAuMzUpIGQgKz0gYE0ke3h9IDBoJHt3fXYke2hlaWdodH1oJHstd31aYDtcbiAgICB4ICs9IHcgKyAxO1xuICB9XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PXtgMCAwICR7d2lkdGh9ICR7aGVpZ2h0fWB9IHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQgfX0+XG4gICAgICA8cGF0aCBkPXtkfSBmaWxsPXtjb2xvcn0gLz5cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuLyoqIFwiTUlOIExFVkVMXCIgLyBcIk1BWCBMRVZFTFwiOiBhIHNtYWxsIG91dGxpbmVkIHRhZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMZXZlbEJhZGdlKHsgbGFiZWwgfTogeyBsYWJlbDogc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgaGVpZ2h0OiAyNCxcbiAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICBib3JkZXJDb2xvcjogQy5yZWQsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogNiB9LFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMyYTBkMTBcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQkFDSyBbRVNDXSAvIE5FWFQgW0ZdLCBib3R0b20gcmlnaHQ6IHR3byBkYXJrIHJlZCBwbGF0ZXMgY3V0IGF0IHRoZWlyXG4gKiAgb3V0ZXIgZmVldCwgam9pbmVkIGJ5IGEgc2hvcnQgcnVsZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOYXZCdXR0b25zKHtcbiAgb25CYWNrLFxuICBvbk5leHQsXG4gIG5leHQgPSBcIk5FWFRcIixcbn06IHtcbiAgb25CYWNrOiAoKSA9PiB2b2lkO1xuICBvbk5leHQ6ICgpID0+IHZvaWQ7XG4gIG5leHQ/OiBzdHJpbmc7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICByaWdodDogMTY1LFxuICAgICAgICB0b3A6IDkwNixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiA2LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8TmF2QnV0dG9uIGs9XCJFU0NcIiBsYWJlbD1cIkJBQ0tcIiBjb3JuZXI9XCJibFwiIG9uQ2xpY2s9e29uQmFja30gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXthYnMoe1xuICAgICAgICAgIGxlZnQ6IDIxNCxcbiAgICAgICAgICB0b3A6IDI4LFxuICAgICAgICAgIHdpZHRoOiA0NixcbiAgICAgICAgICBoZWlnaHQ6IDMsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuNDUpXCIsXG4gICAgICAgIH0pfVxuICAgICAgLz5cbiAgICAgIDxOYXZCdXR0b24gaz1cIkZcIiBsYWJlbD17bmV4dH0gY29ybmVyPVwiYnJcIiBvbkNsaWNrPXtvbk5leHR9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBOYXZCdXR0b24oe1xuICBrLFxuICBsYWJlbCxcbiAgY29ybmVyLFxuICBvbkNsaWNrLFxufToge1xuICBrOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGNvcm5lcjogXCJibFwiIHwgXCJiclwiO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5jaGFtZmVyKFwiIzJhMGIwZVwiLCAxOCwgXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjUpXCIsIDEsIGNvcm5lciksXG4gICAgICAgIHdpZHRoOiAyNDAsXG4gICAgICAgIGhlaWdodDogNTgsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDEwLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e2NoYW1mZXIoXCIjNGExNDFhXCIsIDE4LCBDLnJlZCwgMSwgY29ybmVyKX1cbiAgICA+XG4gICAgICA8S2V5Y2FwIGs9e2t9IC8+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1lbnUsIGZvbnRTaXplOiAyNiB9fT57bGFiZWx9PC90ZXh0PlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogQSBoaW50IHdpdGggaXRzIG93biBnbHlwaCAodGhlIGtpdCdzIGBIaW50YCB0YWtlcyBrZXlzIGFuZCB0aGUgbW91c2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEljb25IaW50KHsgaWNvbiwgbGFiZWwgfTogeyBpY29uOiBSZWFjdE5vZGU7IGxhYmVsOiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogOCB9fT5cbiAgICAgIHtpY29ufVxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDI1LCBjb2xvcjogQy5yZWQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT5cbiAgICAgICAge2xhYmVsfVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyBDIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5cbi8qKiBUaGUgZmFjZSdzIGNlbnRlciBsaW5lIGluIHRoZSBwb3J0cmFpdCdzIDIwMCDDlyAyNTAgZHJhd2luZy4gKi9cbmV4cG9ydCBjb25zdCBDWCA9IDEwMDtcbmV4cG9ydCB0eXBlIFB0ID0gbnVtYmVyW107XG4vKiogRmxhdCBwb2ludHMgd2l0aCB4IG1lYXN1cmVkIGZyb20gdGhlIGNlbnRlciBsaW5lIChgcyA9IC0xYCBtaXJyb3JzKS4gKi9cbmV4cG9ydCBjb25zdCBhdCA9IChhOiBudW1iZXJbXSwgcyA9IDEpID0+XG4gIGEubWFwKCh2LCBpKSA9PiAoaSAlIDIgPyB2IDogQ1ggKyBzICogdikpO1xuXG5jb25zdCBTQ0FSID0gXCIjZjBhMzlhXCI7XG5jb25zdCBNRVRBTCA9IFwiI2Q4ZGVlNFwiO1xuXG4vKiogV2hhdCBhIGxvb2sgYWRkcyB0byB0aGUgcG9ydHJhaXQncyBmYWNlOiBtYWtldXAsIGluaywgc2NhcnMsIGNocm9tZVxuICogIGFuZCBtZXRhbCAoZWFjaCBvcHRpb24ncyB2YXJpYW50cywgaW4gdGhlIHBvcnRyYWl0J3MgMjAwIMOXIDI1MCB1bml0cykuICovXG5leHBvcnQgZnVuY3Rpb24gTWFya3Moe1xuICB2LFxuICBoZWFkLFxuICBpbmssXG4gIG5vc2VZLFxuICBlYXIsXG4gIG1vdXRoOiBbbW91dGhXLCBzbWlsZV0sXG59OiB7XG4gIHY6IChpZDogc3RyaW5nKSA9PiBudW1iZXI7XG4gIGhlYWQ6IFB0W107XG4gIGluazogc3RyaW5nO1xuICBub3NlWTogbnVtYmVyO1xuICBlYXI6IG51bWJlcjtcbiAgbW91dGg6IG51bWJlcltdO1xufSkge1xuICBjb25zdCBsaW5lID0gKGNvbG9yOiBzdHJpbmcsIHcgPSAxLjIpID0+XG4gICAgKHsgZmlsbDogXCJub25lXCIsIHN0cm9rZTogY29sb3IsIHN0cm9rZVdpZHRoOiB3IH0pIGFzIGNvbnN0O1xuICBjb25zdCBtYWtldXAgPSB2KFwibWFrZXVwXCIpO1xuICBjb25zdCB0YXR0b28gPSB2KFwidGF0dG9vc1wiKTtcbiAgY29uc3Qgc2NhcnMgPSB2KFwic2NhcnNcIik7XG4gIGNvbnN0IGN5YmVyID0gdihcImN5YmVyd2FyZVwiKTtcbiAgY29uc3QgbWV0YWwgPSB2KFwicGllcmNpbmdzXCIpO1xuICBjb25zdCBsaXBzID1cbiAgICBtYWtldXAgPT09IDEgPyBcIiMzYTBkMThcIiA6IG1ha2V1cCA9PT0gMiB8fCBtYWtldXAgPT09IDUgPyBcIiNmZjNkOGJcIiA6IG51bGw7XG4gIGNvbnN0IGNocm9tZSA9IChuOiBudW1iZXIpID0+IGN5YmVyID09PSBuIHx8IGN5YmVyID09PSA3O1xuICBjb25zdCBwaWVyY2VkID0gKG46IG51bWJlcikgPT4gbWV0YWwgPT09IG4gfHwgbWV0YWwgPT09IDU7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtsaXBzICYmIChcbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBwb2ludHM9e2F0KFtcbiAgICAgICAgICAgIC1tb3V0aFcsXG4gICAgICAgICAgICAxMzQgLSBzbWlsZSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxMzEuNSxcbiAgICAgICAgICAgIG1vdXRoVyxcbiAgICAgICAgICAgIDEzNCAtIHNtaWxlLFxuICAgICAgICAgICAgbW91dGhXICogMC42LFxuICAgICAgICAgICAgMTM4LjUsXG4gICAgICAgICAgICAtbW91dGhXICogMC42LFxuICAgICAgICAgICAgMTM4LjUsXG4gICAgICAgICAgXSl9XG4gICAgICAgICAgZmlsbD17bGlwc31cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7KG1ha2V1cCA9PT0gMyB8fCBtYWtldXAgPT09IDUpICYmXG4gICAgICAgIFsxLCAtMV0ubWFwKChzKSA9PiAoXG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBrZXk9e3N9XG4gICAgICAgICAgICBwb2ludHM9e2F0KFsyNiwgOTYsIDMyLCA5Ml0sIHMpfVxuICAgICAgICAgICAgey4uLmxpbmUoXCIjMTIwNjA4XCIsIDEuNCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICB7bWFrZXVwID09PSA0ICYmXG4gICAgICAgIFsxLCAtMV0ubWFwKChzKSA9PiAoXG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBrZXk9e3N9XG4gICAgICAgICAgICBwb2ludHM9e2F0KFsxNCwgMTA2LCAyOCwgMTA2XSwgcyl9XG4gICAgICAgICAgICB7Li4ubGluZShDLmN5YW4sIDEuNil9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICB7dGF0dG9vID09PSAxICYmIChcbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBwb2ludHM9e2F0KFstMTQsIDE2NiwgLTExLCAxNzQsIC0xOCwgMTY5LCAtMTAsIDE2OSwgLTE3LCAxNzRdKX1cbiAgICAgICAgICBmaWxsPXtpbmt9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge3RhdHRvbyA9PT0gMiAmJiAoXG4gICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgIHBvaW50cz17YXQoWzI0LCAxMDQsIDMyLCAxMTAsIDI2LCAxMTYsIDM0LCAxMjIsIDI4LCAxMjhdKX1cbiAgICAgICAgICB7Li4ubGluZShpbmssIDEuNCl9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge3RhdHRvbyA9PT0gMyAmJiAoXG4gICAgICAgIDxwb2x5Z29uIHBvaW50cz17YXQoWzAsIDYyLCA1LCA3MSwgLTUsIDcxXSl9IHsuLi5saW5lKGluayl9IC8+XG4gICAgICApfVxuICAgICAge3RhdHRvbyA9PT0gNCAmJlxuICAgICAgICBbMCwgMSwgMl0ubWFwKChpKSA9PiAoXG4gICAgICAgICAgPGNpcmNsZSBrZXk9e2l9IGN4PXtDWCAtIDEzIC0gaSAqIDR9IGN5PXsxMDR9IHI9ezF9IGZpbGw9e2lua30gLz5cbiAgICAgICAgKSl9XG4gICAgICB7dGF0dG9vID09PSA1ICYmXG4gICAgICAgIFswLCAxLCAyLCAzLCA0XS5tYXAoKGkpID0+IChcbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgIHBvaW50cz17YXQoWzYgKyBpICogMi4yLCAxNjQsIDYgKyBpICogMi4yLCAxNzhdKX1cbiAgICAgICAgICAgIHsuLi5saW5lKGluaywgaSAlIDIgPyAwLjcgOiAxLjMpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAge3RhdHRvbyA9PT0gNiAmJlxuICAgICAgICBbLTMsIDNdLm1hcCgoeCkgPT4gKFxuICAgICAgICAgIDxwb2x5bGluZSBrZXk9e3h9IHBvaW50cz17YXQoW3gsIDE0MywgeCwgMTUzXSl9IHsuLi5saW5lKGluayl9IC8+XG4gICAgICAgICkpfVxuICAgICAge3RhdHRvbyA9PT0gNyAmJlxuICAgICAgICBbMSwgLTFdLm1hcCgocykgPT4gKFxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAga2V5PXtzfVxuICAgICAgICAgICAgcG9pbnRzPXthdChbMzYsIDY2LCA0MiwgNzQsIDM4LCA4NF0sIHMpfVxuICAgICAgICAgICAgey4uLmxpbmUoaW5rLCAxLjMpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgeyhzY2FycyA9PT0gMSB8fCBzY2FycyA9PT0gNSkgJiYgKFxuICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXthdChbOSwgODAsIDI1LCA5OV0pfSB7Li4ubGluZShTQ0FSKX0gLz5cbiAgICAgICl9XG4gICAgICB7c2NhcnMgPT09IDIgJiYgKFxuICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXthdChbLTM2LCAxMDYsIC0yOCwgMTE0LCAtMjIsIDEyNF0pfSB7Li4ubGluZShTQ0FSKX0gLz5cbiAgICAgICl9XG4gICAgICB7c2NhcnMgPT09IDMgJiYgKFxuICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXthdChbNCwgMTI3LCA4LCAxNDFdKX0gey4uLmxpbmUoU0NBUil9IC8+XG4gICAgICApfVxuICAgICAge3NjYXJzID09PSA0ICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPXthdChbLTE2LCA2NCwgLTYsIDc0XSl9IHsuLi5saW5lKFNDQVIpfSAvPlxuICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9e2F0KFstNiwgNjQsIC0xNiwgNzRdKX0gey4uLmxpbmUoU0NBUil9IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICAgIHtjaHJvbWUoMSkgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAgcG9pbnRzPXthdChbMzAsIDY0LCAzNiwgNzgsIDMwLCA5MiwgMzAsIDEwMF0pfVxuICAgICAgICAgICAgey4uLmxpbmUoQy5jeWFuKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9e0NYICsgMzB9IGN5PXsxMDJ9IHI9ezEuOH0gZmlsbD17Qy5jeWFufSAvPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7Y2hyb21lKDIpICYmIChcbiAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgcG9pbnRzPXtoZWFkXG4gICAgICAgICAgICAuZmlsdGVyKChbLCB5XSkgPT4geSA+IDEwNilcbiAgICAgICAgICAgIC5mbGF0TWFwKChbeCwgeV0pID0+IFtDWCAtIHggKiAwLjg2LCB5IC0gM10pfVxuICAgICAgICAgIHsuLi5saW5lKEMuY3lhbiwgMS4xKX1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7Y2hyb21lKDMpICYmIDxjaXJjbGUgY3g9e0NYICsgMTcuNX0gY3k9ezk2fSByPXs5fSB7Li4ubGluZShDLmN5YW4pfSAvPn1cbiAgICAgIHtjeWJlciA9PT0gNCAmJlxuICAgICAgICBbLTEyLCAtMiwgOF0ubWFwKCh4KSA9PiAoXG4gICAgICAgICAgPHJlY3Qga2V5PXt4fSB4PXtDWCArIHh9IHk9ezYzfSB3aWR0aD17NX0gaGVpZ2h0PXszfSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgICkpfVxuICAgICAge2N5YmVyID09PSA1ICYmXG4gICAgICAgIFswLCA1LCAxMF0ubWFwKChkKSA9PiAoXG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBrZXk9e2R9XG4gICAgICAgICAgICBwb2ludHM9e2F0KFstMzggKyBkLCAxMDQsIC0zMCArIGQsIDExOF0pfVxuICAgICAgICAgICAgey4uLmxpbmUoQy5jeWFuLCAxKX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIHtjaHJvbWUoNikgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxjaXJjbGUgY3g9e0NYIC0gOX0gY3k9ezE3Mn0gcj17Mi42fSB7Li4ubGluZShDLmN5YW4sIDEpfSAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9e0NYICsgOX0gY3k9ezE3Mn0gcj17Mi42fSB7Li4ubGluZShDLmN5YW4sIDEpfSAvPlxuICAgICAgICAgIDxwb2x5bGluZSBwb2ludHM9e2F0KFstNiwgMTcyLCA2LCAxNzJdKX0gey4uLmxpbmUoQy5jeWFuLCAxKX0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAge3BpZXJjZWQoMSkgJiZcbiAgICAgICAgWzEsIC0xXS5tYXAoKHMpID0+IChcbiAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICBrZXk9e3N9XG4gICAgICAgICAgICBjeD17Q1ggKyBzICogKDQ2ICsgNiAqIGVhcil9XG4gICAgICAgICAgICBjeT17MTA2fVxuICAgICAgICAgICAgcj17MS42fVxuICAgICAgICAgICAgZmlsbD17TUVUQUx9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICB7cGllcmNlZCgyKSAmJiAoXG4gICAgICAgIDxjaXJjbGUgY3g9e0NYICsgMjV9IGN5PXs4Nn0gcj17Mi40fSB7Li4ubGluZShNRVRBTCwgMC45KX0gLz5cbiAgICAgICl9XG4gICAgICB7cGllcmNlZCgzKSAmJiAoXG4gICAgICAgIDxjaXJjbGUgY3g9e0NYICsgNH0gY3k9e25vc2VZICsgM30gcj17Mi40fSB7Li4ubGluZShNRVRBTCwgMC45KX0gLz5cbiAgICAgICl9XG4gICAgICB7cGllcmNlZCg0KSAmJiAoXG4gICAgICAgIDxjaXJjbGUgY3g9e0NYICsgNn0gY3k9ezE0MH0gcj17Mi40fSB7Li4ubGluZShNRVRBTCwgMC45KX0gLz5cbiAgICAgICl9XG4gICAgPC8+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgQyB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgcm5nIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBFWUVfQ09MT1JTLCBIQUlSX0NPTE9SUywgU0tJTl9UT05FUyB9IGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCB7IENYLCBNYXJrcywgYXQsIHR5cGUgUHQgfSBmcm9tIFwiLi9NYXJrc1wiO1xuXG4vKiogYGFgIG1peGVkIHRvd2FyZCBgYmAgYnkgYHRgIChoZXggY29sb3JzKS4gKi9cbmZ1bmN0aW9uIG1peChhOiBzdHJpbmcsIGI6IHN0cmluZywgdDogbnVtYmVyKSB7XG4gIGNvbnN0IHAgPSAoaDogc3RyaW5nLCBpOiBudW1iZXIpID0+XG4gICAgcGFyc2VJbnQoaC5zbGljZSgxICsgaSAqIDIsIDMgKyBpICogMiksIDE2KTtcbiAgY29uc3QgYyA9IFswLCAxLCAyXS5tYXAoKGkpID0+IE1hdGgucm91bmQocChhLCBpKSArIChwKGIsIGkpIC0gcChhLCBpKSkgKiB0KSk7XG4gIHJldHVybiBgIyR7Yy5tYXAoKHYpID0+IHYudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKSkuam9pbihcIlwiKX1gO1xufVxuXG4vKiogYFt4MCwgeTAsIHgxLCB5MSwg4oCmXWAg4oaSIHBvaW50cy4gKi9cbmNvbnN0IHB0cyA9IChhOiBudW1iZXJbXSk6IFB0W10gPT5cbiAgQXJyYXkuZnJvbSh7IGxlbmd0aDogYS5sZW5ndGggLyAyIH0sIChfLCBpKSA9PiBbYVsyICogaV0sIGFbMiAqIGkgKyAxXV0pO1xuY29uc3QgZmxhdCA9IChwOiBQdFtdLCBzID0gMSkgPT4gYXQocC5mbGF0KCksIHMpO1xuXG4vKiogVGhlIHJpZ2h0IGhhbGYgb2YgdGhlIGhlYWQsIHRvcCBvZiB0aGUgc2t1bGwgdG8gdGhlIGNoaW4uICovXG5jb25zdCBIRUFEID0gcHRzKFtcbiAgMCwgMzgsIDE2LCAzOSwgMjksIDQ0LCAzOCwgNTIsIDQzLCA2MiwgNDUsIDc0LCA0NSwgODgsIDQ0LCAxMDAsIDQyLCAxMTAsIDM4LFxuICAxMjIsIDMzLCAxMzIsIDI2LCAxNDIsIDE4LCAxNTAsIDksIDE1NSwgMCwgMTU3LFxuXSk7XG4vKiogVGhlIHJpZ2h0IGhhbGYgb2YgdGhlIG5lY2sgYW5kIHNob3VsZGVyIGxpbmUsIHBlciBidWlsZC4gKi9cbmNvbnN0IFNIT1VMREVSUyA9IFtcbiAgcHRzKFsyMCwgMTQwLCAyMiwgMTg0LCA0NiwgMTk1LCA3OCwgMjAzLCA5NCwgMjE2LCA5OSwgMjUwXSksXG4gIHB0cyhbMTcsIDE0MCwgMTksIDE4OCwgMzgsIDE5NywgNjQsIDIwNCwgODAsIDIxNiwgODYsIDI1MF0pLFxuXTtcbi8vIFBlciB2YXJpYW50OiBqYXcgd2lkdGggYW5kIGNoaW4gZHJvcDsgYnJvdyByYWlzZSwgd2VpZ2h0IGFuZCBhcmNoOyBub3NlXG4vLyBsZW5ndGggYW5kIHdpZHRoOyBtb3V0aCB3aWR0aCBhbmQgc21pbGU7IGVhciBzaXplLlxuY29uc3QgSkFXID0gWzEsIDAuOSwgMS4xLCAwLjg0LCAxLjE2LCAwLjk2XTtcbmNvbnN0IENISU4gPSBbMCwgMywgLTIsIDUsIC0xLCAxXTtcbmNvbnN0IEJST1dTID0gWzAsIDIsIDAsIDIsIDEuNSwgMSwgLTIsIDIuNiwgMCwgMSwgMywgMiwgMywgMS4yLCAtMSwgMCwgMS44LCAzXTtcbmNvbnN0IE5PU0VTID0gWzExOCwgNSwgMTE2LCA0LCAxMjEsIDYsIDExOSwgNywgMTE1LCA1LCAxMjIsIDRdO1xuY29uc3QgTU9VVEhTID0gWzExLCAwLCA5LCAxLCAxMywgMCwgMTAsIC0xLCAxNCwgMSwgMTIsIDJdO1xuY29uc3QgRUFSUyA9IFsxLCAwLjc1LCAxLjMsIDFdO1xuXG4vKiogTWlycm9yIGEgcmlnaHQgaGFsZiBpbnRvIG9uZSBjbG9zZWQgb3V0bGluZSAoZmxhdCBwb2ludHMpLiAqL1xuZnVuY3Rpb24gbWlycm9yKGhhbGY6IFB0W10pIHtcbiAgcmV0dXJuIFsuLi5mbGF0KGhhbGYpLCAuLi5mbGF0KGhhbGYuc2xpY2UoMSwgLTEpLnJldmVyc2UoKSwgLTEpXTtcbn1cblxuLyoqIFRoZSBoYWxmLXdpZHRoIG9mIGFuIG91dGxpbmUgKHNvcnRlZCBieSB5KSBhdCBgeWAuICovXG5mdW5jdGlvbiBjaG9yZChoYWxmOiBQdFtdLCB5OiBudW1iZXIpIHtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBoYWxmLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgW3gwLCB5MF0gPSBoYWxmW2kgLSAxXTtcbiAgICBjb25zdCBbeDEsIHkxXSA9IGhhbGZbaV07XG4gICAgaWYgKHkgPD0geTEpXG4gICAgICByZXR1cm4geTEgPT09IHkwID8geDEgOiB4MCArICgoeDEgLSB4MCkgKiAoeSAtIHkwKSkgLyAoeTEgLSB5MCk7XG4gIH1cbiAgcmV0dXJuIGhhbGZbaGFsZi5sZW5ndGggLSAxXVswXTtcbn1cblxuLyoqIFRoZSBoYWlyIGNhcDogdGhlIHNrdWxsIGFib3ZlIGBoYWlybGluZWAgcHVzaGVkIG91dCBieSBgdGhpY2tgLCBjbG9zZWRcbiAqICBieSBhIGhhaXJsaW5lIHRoYXQgZGlwcyB0b3dhcmQgdGhlIGJyb3cuICovXG5mdW5jdGlvbiBjcm93bihoZWFkOiBQdFtdLCB0aGljazogbnVtYmVyLCBoYWlybGluZTogbnVtYmVyKSB7XG4gIGNvbnN0IG91dCA9IGhlYWRcbiAgICAuZmlsdGVyKChbLCB5XSkgPT4geSA8PSBoYWlybGluZSlcbiAgICAubWFwKChbeCwgeV0pID0+IHtcbiAgICAgIGNvbnN0IGR5ID0geSAtIDk2O1xuICAgICAgY29uc3QgbCA9IE1hdGguaHlwb3QoeCwgZHkpIHx8IDE7XG4gICAgICByZXR1cm4gW3ggKyAoeCAvIGwpICogdGhpY2ssIHkgKyAoZHkgLyBsKSAqIHRoaWNrXTtcbiAgICB9KTtcbiAgY29uc3QgZWRnZSA9IGNob3JkKGhlYWQsIGhhaXJsaW5lKTtcbiAgY29uc3QgYnJvdyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDkgfSwgKF8sIGkpID0+IHtcbiAgICBjb25zdCB4ID0gZWRnZSAqICgxIC0gaSAvIDQpO1xuICAgIHJldHVybiBbeCwgaGFpcmxpbmUgLSA3ICogKDEgLSAoeCAvIGVkZ2UpICoqIDIpXTtcbiAgfSk7XG4gIHJldHVybiBmbGF0KFtcbiAgICAuLi5vdXRcbiAgICAgIC5zbGljZSgxKVxuICAgICAgLnJldmVyc2UoKVxuICAgICAgLm1hcCgoW3gsIHldKSA9PiBbLXgsIHldKSxcbiAgICAuLi5vdXQsXG4gICAgLi4uYnJvdyxcbiAgXSk7XG59XG5cbmNvbnN0IGNpcmNsZSA9IChjeDogbnVtYmVyLCBjeTogbnVtYmVyLCByOiBudW1iZXIpID0+XG4gIEFycmF5LmZyb20oeyBsZW5ndGg6IDIwIH0sIChfLCBpKSA9PiBbXG4gICAgQ1ggKyBjeCArIHIgKiBNYXRoLmNvcygoaSAvIDIwKSAqIE1hdGguUEkgKiAyKSxcbiAgICBjeSArIHIgKiBNYXRoLnNpbigoaSAvIDIwKSAqIE1hdGguUEkgKiAyKSxcbiAgXSkuZmxhdCgpO1xuY29uc3QgYm90aCA9IChhOiBudW1iZXJbXSkgPT4gW2F0KGEpLCBhdChhLCAtMSldO1xuXG4vKiogRWFjaCBoYWlyc3R5bGU6IHNoYXBlcyBkcmF3biBiZWhpbmQgdGhlIGhlYWQsIGFuZCBvdmVyIGl0LiAqL1xuZnVuY3Rpb24gaGFpcihcbiAgc3R5bGU6IG51bWJlcixcbiAgaGVhZDogUHRbXSxcbik6IHsgYmFjazogbnVtYmVyW11bXTsgZnJvbnQ6IG51bWJlcltdW10gfSB7XG4gIHN3aXRjaCAoc3R5bGUpIHtcbiAgICBjYXNlIDA6IC8vIGJ1enpcbiAgICAgIHJldHVybiB7IGJhY2s6IFtdLCBmcm9udDogW2Nyb3duKGhlYWQsIDIsIDY2KV0gfTtcbiAgICBjYXNlIDE6IC8vIHN3ZXB0IHVuZGVyY3V0XG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYWNrOiBbXSxcbiAgICAgICAgZnJvbnQ6IFtcbiAgICAgICAgICBjcm93bihoZWFkLCAzLCA2MCksXG4gICAgICAgICAgYXQoW1xuICAgICAgICAgICAgLTM0LCA1NCwgLTI0LCAzMiwgNiwgMjQsIDM4LCAzMiwgNTQsIDUyLCA0MCwgNDgsIDE2LCA0MCwgLTEyLCA0NCxcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSxcbiAgICAgIH07XG4gICAgY2FzZSAyOiAvLyBjcmVzdFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFjazogW10sXG4gICAgICAgIGZyb250OiBbXG4gICAgICAgICAgY3Jvd24oaGVhZCwgMSwgNzApLFxuICAgICAgICAgIGF0KFstNywgNjQsIC0xMCwgMzAsIC00LCA2LCAwLCAyLCA0LCA2LCAxMCwgMzAsIDcsIDY0XSksXG4gICAgICAgIF0sXG4gICAgICB9O1xuICAgIGNhc2UgMzogLy8gbG9uZ1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFjazogYm90aChbXG4gICAgICAgICAgNDAsIDYwLCA1NCwgMTAwLCA1OCwgMTUwLCA2MiwgMjA2LCA0NiwgMjEwLCA0NCwgMTUwLCA0MiwgMTA0LFxuICAgICAgICBdKSxcbiAgICAgICAgZnJvbnQ6IFtjcm93bihoZWFkLCA2LCA2MCldLFxuICAgICAgfTtcbiAgICBjYXNlIDQ6IC8vIGJvYlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFjazogW10sXG4gICAgICAgIGZyb250OiBbXG4gICAgICAgICAgY3Jvd24oaGVhZCwgNywgNTgpLFxuICAgICAgICAgIC4uLmJvdGgoWzQyLCA1OCwgNTIsIDkyLCA1MywgMTQwLCAzOCwgMTQ2LCA0MSwgMTEwLCA0MywgODBdKSxcbiAgICAgICAgXSxcbiAgICAgIH07XG4gICAgY2FzZSA1OiAvLyBidW5cbiAgICAgIHJldHVybiB7IGJhY2s6IFtjaXJjbGUoMCwgMjYsIDE1KV0sIGZyb250OiBbY3Jvd24oaGVhZCwgNCwgNjApXSB9O1xuICAgIGNhc2UgNjogLy8gc3Bpa2VzXG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYWNrOiBbXSxcbiAgICAgICAgZnJvbnQ6IFtcbiAgICAgICAgICBhdChbXG4gICAgICAgICAgICAuLi5BcnJheS5mcm9tKHsgbGVuZ3RoOiAxNSB9LCAoXywgaSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBhID0gTWF0aC5QSSAqICgxLjA4ICsgKDAuODQgKiBpKSAvIDE0KTtcbiAgICAgICAgICAgICAgY29uc3QgciA9IGkgJSAyID8gNjYgOiA1MDtcbiAgICAgICAgICAgICAgcmV0dXJuIFtyICogTWF0aC5jb3MoYSksIDk2ICsgciAqIE1hdGguc2luKGEpXTtcbiAgICAgICAgICAgIH0pLmZsYXQoKSxcbiAgICAgICAgICAgIDM4LFxuICAgICAgICAgICAgNjYsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgNTgsXG4gICAgICAgICAgICAtMzgsXG4gICAgICAgICAgICA2NixcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSxcbiAgICAgIH07XG4gICAgY2FzZSA3OiAvLyBzbGlja2VkIGJhY2tcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2s6IFthdChbMzAsIDQ2LCA1NiwgNTgsIDYwLCA5MiwgNTAsIDEwMCwgNDYsIDcwXSldLFxuICAgICAgICBmcm9udDogW2Nyb3duKGhlYWQsIDgsIDU2KV0sXG4gICAgICB9O1xuICAgIGNhc2UgODogLy8gc2hhdmVkXG4gICAgICByZXR1cm4geyBiYWNrOiBbXSwgZnJvbnQ6IFtdIH07XG4gICAgY2FzZSA5OiAvLyBicmFpZHNcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2s6IGJvdGgoWzQyLCA3MCwgNTAsIDEyMCwgNTIsIDIxNCwgNDQsIDIxNiwgNDIsIDEyMiwgMzgsIDc2XSksXG4gICAgICAgIGZyb250OiBbY3Jvd24oaGVhZCwgNCwgNTgpXSxcbiAgICAgIH07XG4gICAgY2FzZSAxMDogLy8gY2xvdWRcbiAgICAgIHJldHVybiB7IGJhY2s6IFtjaXJjbGUoMCwgNzQsIDY0KV0sIGZyb250OiBbY3Jvd24oaGVhZCwgMTAsIDY0KV0gfTtcbiAgICBkZWZhdWx0OiAvLyBmcmluZ2VcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2s6IFtdLFxuICAgICAgICBmcm9udDogW1xuICAgICAgICAgIGNyb3duKGhlYWQsIDYsIDU4KSxcbiAgICAgICAgICBhdChbXG4gICAgICAgICAgICAtNDYsIDU4LCAtMzAsIDQ2LCAwLCA0MiwgMzAsIDQ4LCA0NiwgNjQsIDMwLCA4MCwgOCwgNzQsIC0yMCwgODIsXG4gICAgICAgICAgICAtNDAsIDc0LFxuICAgICAgICAgIF0pLFxuICAgICAgICBdLFxuICAgICAgfTtcbiAgfVxufVxuXG5jb25zdCBHUklEID0gKCgpID0+IHtcbiAgbGV0IGQgPSBcIlwiO1xuICBmb3IgKGxldCB4ID0gMjA7IHggPCAyMDA7IHggKz0gMjApIGQgKz0gYE0ke3h9IDBWMjUwYDtcbiAgZm9yIChsZXQgeSA9IDI1OyB5IDwgMjUwOyB5ICs9IDI1KSBkICs9IGBNMCAke3l9SDIwMGA7XG4gIHJldHVybiBkO1xufSkoKTtcblxuLyoqIEEgc2Nhbm5lZCBoZWFkIGFuZCBzaG91bGRlcnMgaW4gbGluZSBhcnQgKDIwMCDDlyAyNTAgdW5pdHMpOiB0aGUgc2t1bGxcbiAqICBhbmQgc2hvdWxkZXJzIHRpbnRlZCBieSB0aGUgc2tpbiB0b25lIGFuZCB3cmFwcGVkIGluIGNvbnRvdXIgbGluZXMsIHRoZVxuICogIGhhaXJzdHlsZSBpbiBpdHMgY29sb3IsIHRoZSBmYWNlJ3MgZmVhdHVyZXMsIGFuZCB3aGF0ZXZlciBjeWJlcndhcmUsXG4gKiAgc2NhcnMsIGluayBhbmQgbWV0YWwgdGhlIGxvb2sgY2Fycmllcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQb3J0cmFpdCh7XG4gIGxvb2ssXG4gIGJvZHksXG4gIHdpZHRoLFxufToge1xuICBsb29rOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICBib2R5OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IHYgPSAoaWQ6IHN0cmluZykgPT4gbG9va1tpZF0gPz8gMDtcbiAgY29uc3Qgc2tpbiA9IFNLSU5fVE9ORVNbdihcInNraW5Ub25lXCIpXTtcbiAgY29uc3QgaGFpckNvbG9yID0gSEFJUl9DT0xPUlNbdihcImhhaXJDb2xvclwiKV07XG4gIGNvbnN0IGhhaXJMaW5lID0gbWl4KGhhaXJDb2xvciwgXCIjZmZmZmZmXCIsIDAuMyk7XG4gIGNvbnN0IGxpbmUgPSBtaXgoc2tpbiwgXCIjZmZmZmZmXCIsIDAuMzUpO1xuICBjb25zdCBjb250b3VyID0gbWl4KHNraW4sIFwiIzAwMDAwMFwiLCAwLjQ1KTtcbiAgY29uc3QgamF3ID0gdihcImphd1wiKTtcbiAgY29uc3QgaGVhZDogUHRbXSA9IEhFQUQubWFwKChbeCwgeV0pID0+IHtcbiAgICBjb25zdCBrID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgKHkgLSAxMDQpIC8gMzYpKTtcbiAgICByZXR1cm4gW1xuICAgICAgeCAqICgxICsgKEpBV1tqYXddIC0gMSkgKiBrKSxcbiAgICAgIHkgKyAoeSA+IDE0MCA/IChDSElOW2phd10gKiAoeSAtIDE0MCkpIC8gMTcgOiAwKSxcbiAgICBdO1xuICB9KTtcbiAgY29uc3Qgc2hvdWxkZXJzID0gU0hPVUxERVJTW2JvZHldO1xuICBjb25zdCB7IGJhY2ssIGZyb250IH0gPSBoYWlyKHYoXCJoYWlyc3R5bGVcIiksIGhlYWQpO1xuICBjb25zdCBbcmFpc2UsIGJyb3dXLCBhcmNoXSA9IEJST1dTLnNsaWNlKHYoXCJleWVicm93c1wiKSAqIDMpO1xuICBjb25zdCBbbm9zZVksIG5vc2VXXSA9IE5PU0VTLnNsaWNlKHYoXCJub3NlXCIpICogMik7XG4gIGNvbnN0IFttb3V0aFcsIHNtaWxlXSA9IE1PVVRIUy5zbGljZSh2KFwibW91dGhcIikgKiAyKTtcbiAgY29uc3QgZWFyID0gRUFSU1t2KFwiZWFyc1wiKV07XG4gIGNvbnN0IGZyZWNrbGVzID0gcm5nKHYoXCJza2luVHlwZVwiKSArIDMpO1xuICBjb25zdCBzdHJva2UgPSAoY29sb3I6IHN0cmluZywgdyA9IDEpID0+XG4gICAgKHsgZmlsbDogXCJub25lXCIsIHN0cm9rZTogY29sb3IsIHN0cm9rZVdpZHRoOiB3IH0pIGFzIGNvbnN0O1xuXG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDIwMCAyNTBcIiBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0OiB3aWR0aCAqIDEuMjUgfX0+XG4gICAgICA8cGF0aCBkPXtHUklEfSB7Li4uc3Ryb2tlKEMuY3lhbiwgMC41KX0gb3BhY2l0eT17MC4xMn0gLz5cbiAgICAgIHtiYWNrLm1hcCgocCwgaSkgPT4gKFxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBwb2ludHM9e3B9XG4gICAgICAgICAgZmlsbD17aGFpckNvbG9yfVxuICAgICAgICAgIHN0cm9rZT17aGFpckxpbmV9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezAuOH1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgICAgPHBvbHlnb24gcG9pbnRzPXttaXJyb3Ioc2hvdWxkZXJzKX0gZmlsbD17c2tpbn0gb3BhY2l0eT17MC41NX0gLz5cbiAgICAgIDxwb2x5bGluZSBwb2ludHM9e2ZsYXQoc2hvdWxkZXJzKX0gey4uLnN0cm9rZShsaW5lLCAxLjQpfSAvPlxuICAgICAgPHBvbHlsaW5lIHBvaW50cz17ZmxhdChzaG91bGRlcnMsIC0xKX0gey4uLnN0cm9rZShsaW5lLCAxLjQpfSAvPlxuICAgICAge1syMTQsIDIyNiwgMjM4XS5tYXAoKHkpID0+IChcbiAgICAgICAgPGxpbmVcbiAgICAgICAgICBrZXk9e3l9XG4gICAgICAgICAgeDE9e0NYIC0gY2hvcmQoc2hvdWxkZXJzLCB5KSArIDZ9XG4gICAgICAgICAgeTE9e3l9XG4gICAgICAgICAgeDI9e0NYICsgY2hvcmQoc2hvdWxkZXJzLCB5KSAtIDZ9XG4gICAgICAgICAgeTI9e3l9XG4gICAgICAgICAgc3Ryb2tlPXtjb250b3VyfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXswLjd9XG4gICAgICAgICAgb3BhY2l0eT17MC42fVxuICAgICAgICAvPlxuICAgICAgKSl9XG4gICAgICB7WzEsIC0xXS5tYXAoKHMpID0+IChcbiAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAga2V5PXtzfVxuICAgICAgICAgIHBvaW50cz17YXQoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIDQ1LFxuICAgICAgICAgICAgICA4NixcbiAgICAgICAgICAgICAgNDUgKyA2ICogZWFyLFxuICAgICAgICAgICAgICB2KFwiZWFyc1wiKSA9PT0gMyA/IDcyIDogODIsXG4gICAgICAgICAgICAgIDQ1ICsgOCAqIGVhcixcbiAgICAgICAgICAgICAgOTQsXG4gICAgICAgICAgICAgIDQ1ICsgNiAqIGVhcixcbiAgICAgICAgICAgICAgMTA2LFxuICAgICAgICAgICAgICA0NCxcbiAgICAgICAgICAgICAgMTEwLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHMsXG4gICAgICAgICAgKX1cbiAgICAgICAgICBmaWxsPXtza2lufVxuICAgICAgICAgIHN0cm9rZT17bGluZX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgICAgPHBvbHlnb25cbiAgICAgICAgcG9pbnRzPXttaXJyb3IoaGVhZCl9XG4gICAgICAgIGZpbGw9e3NraW59XG4gICAgICAgIG9wYWNpdHk9ezAuOH1cbiAgICAgICAgc3Ryb2tlPXtsaW5lfVxuICAgICAgICBzdHJva2VXaWR0aD17MS40fVxuICAgICAgLz5cbiAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiAxNyB9LCAoXywgaSkgPT4gNDQgKyBpICogNi41KS5tYXAoKHkpID0+IChcbiAgICAgICAgPGxpbmVcbiAgICAgICAgICBrZXk9e3l9XG4gICAgICAgICAgeDE9e0NYIC0gY2hvcmQoaGVhZCwgeSkgKyAxfVxuICAgICAgICAgIHkxPXt5fVxuICAgICAgICAgIHgyPXtDWCArIGNob3JkKGhlYWQsIHkpIC0gMX1cbiAgICAgICAgICB5Mj17eX1cbiAgICAgICAgICBzdHJva2U9e2NvbnRvdXJ9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezAuNX1cbiAgICAgICAgICBvcGFjaXR5PXswLjV9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIHtbLTAuNjIsIC0wLjMsIDAuMywgMC42Ml0ubWFwKChmKSA9PiAoXG4gICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgIGtleT17Zn1cbiAgICAgICAgICBwb2ludHM9e0FycmF5LmZyb20oeyBsZW5ndGg6IDE5IH0sIChfLCBpKSA9PiA0MSArIGkgKiA2LjMpLmZsYXRNYXAoXG4gICAgICAgICAgICAoeSkgPT4gW0NYICsgZiAqIGNob3JkKGhlYWQsIHkpLCB5XSxcbiAgICAgICAgICApfVxuICAgICAgICAgIHsuLi5zdHJva2UoY29udG91ciwgMC41KX1cbiAgICAgICAgICBvcGFjaXR5PXswLjQ1fVxuICAgICAgICAvPlxuICAgICAgKSl9XG4gICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogdihcInNraW5UeXBlXCIpICogNSB9LCAoXywgaSkgPT4gKFxuICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAga2V5PXtpfVxuICAgICAgICAgIGN4PXtDWCArIChmcmVja2xlcygpID4gMC41ID8gMSA6IC0xKSAqICgxNiArIGZyZWNrbGVzKCkgKiAxOCl9XG4gICAgICAgICAgY3k9ezEwMiArIGZyZWNrbGVzKCkgKiAyMH1cbiAgICAgICAgICByPXswLjd9XG4gICAgICAgICAgZmlsbD17Y29udG91cn1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgICAge1sxLCAtMV0ubWFwKChzKSA9PiAoXG4gICAgICAgIDxnIGtleT17c30+XG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBwb2ludHM9e2F0KFxuICAgICAgICAgICAgICBbOCwgODggLSBhcmNoICogMC4zLCAxNywgODUgLSBhcmNoIC0gcmFpc2UgKiAwLjMsIDI3LCA4OCAtIHJhaXNlXSxcbiAgICAgICAgICAgICAgcyxcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICB7Li4uc3Ryb2tlKG1peChoYWlyQ29sb3IsIFwiIzAwMDAwMFwiLCAwLjMpLCBicm93Vyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgcG9pbnRzPXthdChbOSwgOTYsIDE0LCA5MywgMjEsIDkzLCAyNiwgOTYsIDIwLCA5OC41LCAxNCwgOTguNV0sIHMpfVxuICAgICAgICAgICAgZmlsbD1cIiMwYzBjMTBcIlxuICAgICAgICAgICAgc3Ryb2tlPXtsaW5lfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezAuOH1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgIGN4PXtDWCArIHMgKiAxNy41fVxuICAgICAgICAgICAgY3k9ezk1Ljh9XG4gICAgICAgICAgICByPXsyLjR9XG4gICAgICAgICAgICBmaWxsPXtFWUVfQ09MT1JTW3YoXCJleWVzXCIpXX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2c+XG4gICAgICApKX1cbiAgICAgIDxwb2x5bGluZVxuICAgICAgICBwb2ludHM9e1tDWCArIDIsIDk4LCBDWCArIDQsIG5vc2VZIC0gMiwgQ1ggKyBub3NlVywgbm9zZVldfVxuICAgICAgICB7Li4uc3Ryb2tlKGxpbmUpfVxuICAgICAgLz5cbiAgICAgIDxwb2x5bGluZVxuICAgICAgICBwb2ludHM9e1tDWCAtIG5vc2VXLCBub3NlWSArIDEsIENYLCBub3NlWSArIDIuNSwgQ1ggKyBub3NlVywgbm9zZVkgKyAxXX1cbiAgICAgICAgey4uLnN0cm9rZShjb250b3VyKX1cbiAgICAgIC8+XG4gICAgICA8TWFya3NcbiAgICAgICAgdj17dn1cbiAgICAgICAgaGVhZD17aGVhZH1cbiAgICAgICAgaW5rPXttaXgoc2tpbiwgXCIjMDAwMDAwXCIsIDAuNzUpfVxuICAgICAgICBub3NlWT17bm9zZVl9XG4gICAgICAgIGVhcj17ZWFyfVxuICAgICAgICBtb3V0aD17W21vdXRoVywgc21pbGVdfVxuICAgICAgLz5cbiAgICAgIDxwb2x5bGluZVxuICAgICAgICBwb2ludHM9e2F0KFtcbiAgICAgICAgICAtbW91dGhXLFxuICAgICAgICAgIDEzNCAtIHNtaWxlLFxuICAgICAgICAgIC1tb3V0aFcgLyAzLFxuICAgICAgICAgIDEzMi41LFxuICAgICAgICAgIDAsXG4gICAgICAgICAgMTMzLjUsXG4gICAgICAgICAgbW91dGhXIC8gMyxcbiAgICAgICAgICAxMzIuNSxcbiAgICAgICAgICBtb3V0aFcsXG4gICAgICAgICAgMTM0IC0gc21pbGUsXG4gICAgICAgIF0pfVxuICAgICAgICB7Li4uc3Ryb2tlKGNvbnRvdXIsIDEuMil9XG4gICAgICAvPlxuICAgICAgPHBvbHlsaW5lXG4gICAgICAgIHBvaW50cz17YXQoWy1tb3V0aFcgKiAwLjYsIDEzNy41LCAwLCAxMzkuNSwgbW91dGhXICogMC42LCAxMzcuNV0pfVxuICAgICAgICB7Li4uc3Ryb2tlKGxpbmUsIDAuOCl9XG4gICAgICAvPlxuICAgICAge2Zyb250Lm1hcCgocCwgaSkgPT4gKFxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBwb2ludHM9e3B9XG4gICAgICAgICAgZmlsbD17aGFpckNvbG9yfVxuICAgICAgICAgIHN0cm9rZT17aGFpckxpbmV9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezAuOH1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgICAgPHJlY3QgeD17MH0geT17NjJ9IHdpZHRoPXsyMDB9IGhlaWdodD17MTB9IGZpbGw9e0MuY3lhbn0gb3BhY2l0eT17MC4wN30gLz5cbiAgICAgIDxyZWN0IHg9ezB9IHk9ezE2OH0gd2lkdGg9ezIwMH0gaGVpZ2h0PXs0fSBmaWxsPXtDLmN5YW59IG9wYWNpdHk9ezAuMDh9IC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDaGFyYWN0ZXIgfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYsIFQgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEFUVFJJQlVURVMsIEFUVFJfTUFYIH0gZnJvbSBcIi4vZGF0YVwiO1xuXG4vKiogV2hlcmUgdGhlIElEIGNhcmQncyBsb3dlciBoYWxmIChyYWRhciwgbGV2ZWxzLCBiYXJjb2RlKSBzdGFydHMuICovXG5leHBvcnQgY29uc3QgUlVMRSA9IDM1MjtcblxuLyoqIFRoZSBmaXZlIGF0dHJpYnV0ZXMgYXMgYSByYWRhciAocmluZ3MgYXQgMiwgNCBhbmQgNikgYmVzaWRlIGEgbGlzdCBvZlxuICogIGxldmVscyBkcmF3biBhcyBwaXBzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJhZGFyKHsgYXR0cmlidXRlcyB9OiB7IGF0dHJpYnV0ZXM6IENoYXJhY3RlcltcImF0dHJpYnV0ZXNcIl0gfSkge1xuICBjb25zdCBSID0gMTQ7XG4gIGNvbnN0IGF0ID0gKGk6IG51bWJlciwgcjogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgYSA9IC1NYXRoLlBJIC8gMiArIChpICogTWF0aC5QSSAqIDIpIC8gNTtcbiAgICByZXR1cm4gW3IgKiBNYXRoLmNvcyhhKSwgciAqIE1hdGguc2luKGEpXTtcbiAgfTtcbiAgY29uc3QgcmluZyA9IChyOiBudW1iZXIpID0+IFswLCAxLCAyLCAzLCA0XS5mbGF0TWFwKChpKSA9PiBhdChpLCByKSk7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5taWNybyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAyMCxcbiAgICAgICAgICB0b3A6IFJVTEUgKyAxMCxcbiAgICAgICAgICBmb250U2l6ZTogMTAsXG4gICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgQVRUUklCVVRFU1xuICAgICAgPC90ZXh0PlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PVwiLTEwMCAtMTAwIDIwMCAyMDBcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDIyLFxuICAgICAgICAgIHRvcDogUlVMRSArIDI0LFxuICAgICAgICAgIHdpZHRoOiAxNzYsXG4gICAgICAgICAgaGVpZ2h0OiAxNzYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtbMiwgNCwgNl0ubWFwKChsKSA9PiAoXG4gICAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICAgIGtleT17bH1cbiAgICAgICAgICAgIHBvaW50cz17cmluZyhsICogUil9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9XCIjNWMxYzFlXCJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgICB7WzAsIDEsIDIsIDMsIDRdLm1hcCgoaSkgPT4gKFxuICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICB4MT17MH1cbiAgICAgICAgICAgIHkxPXswfVxuICAgICAgICAgICAgeDI9e2F0KGksIDYgKiBSKVswXX1cbiAgICAgICAgICAgIHkyPXthdChpLCA2ICogUilbMV19XG4gICAgICAgICAgICBzdHJva2U9XCIjNWMxYzFlXCJcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIHBvaW50cz17QVRUUklCVVRFUy5mbGF0TWFwKChhLCBpKSA9PiBhdChpLCBhdHRyaWJ1dGVzW2EuaWRdICogUikpfVxuICAgICAgICAgIGZpbGw9e0MucmVkfVxuICAgICAgICAgIG9wYWNpdHk9ezAuM31cbiAgICAgICAgLz5cbiAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICBwb2ludHM9e0FUVFJJQlVURVMuZmxhdE1hcCgoYSwgaSkgPT4gYXQoaSwgYXR0cmlidXRlc1thLmlkXSAqIFIpKX1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgLz5cbiAgICAgICAge0FUVFJJQlVURVMubWFwKChhLCBpKSA9PiAoXG4gICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAga2V5PXthLmlkfVxuICAgICAgICAgICAgY3g9e2F0KGksIGF0dHJpYnV0ZXNbYS5pZF0gKiBSKVswXX1cbiAgICAgICAgICAgIGN5PXthdChpLCBhdHRyaWJ1dGVzW2EuaWRdICogUilbMV19XG4gICAgICAgICAgICByPXszLjV9XG4gICAgICAgICAgICBmaWxsPXtDLmN5YW59XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L3N2Zz5cbiAgICAgIHtBVFRSSUJVVEVTLm1hcCgoYSwgaSkgPT4ge1xuICAgICAgICBjb25zdCBbeCwgeV0gPSBhdChpLCAxMDYpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBrZXk9e2EuaWR9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbGVmdDogMTEwICsgeCAqIDAuODggLSA5LFxuICAgICAgICAgICAgICB0b3A6IFJVTEUgKyAxMTIgKyB5ICogMC44OCAtIDYsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW5EaW0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHthLnNob3J0fVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAyMzYsXG4gICAgICAgICAgdG9wOiBSVUxFICsgMzYsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBnYXA6IDksXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtBVFRSSUJVVEVTLm1hcCgoYSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e2EuaWR9XG4gICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogMTEsIGNvbG9yOiBDLnJlZCwgd2lkdGg6IDMwIH19PlxuICAgICAgICAgICAgICB7YS5zaG9ydH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMyB9fT5cbiAgICAgICAgICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IEFUVFJfTUFYIH0sIChfLCBsKSA9PiAoXG4gICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgIGtleT17bH1cbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxOCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMixcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBsIDwgYXR0cmlidXRlc1thLmlkXSA/IEMucmVkIDogXCIjMmExMDE2XCIsXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7YXR0cmlidXRlc1thLmlkXS50b1N0cmluZygpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRW50ZXIgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHsgQywgRiwgVCwgY2hhbWZlciB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgRGF0YU5vaXNlIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBLZXljYXAgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgdHlwZSB7IExvb2tPcHRpb24gfSBmcm9tIFwiLi9kYXRhXCI7XG5cbi8qKiBUaGUgY29sb3IgZ3JpZCBhIGNvbG9yIG9wdGlvbiBvcGVucyAoU0tJTiBUT05FLCBIQUlSIENPTE9SKTogdHdvIHJvd3NcbiAqICBvZiBzd2F0Y2hlcywgdGhlIGNob3NlbiBvbmUgdGlja2VkLCBzbWFsbCBwcmludCwgYW5kIENMT1NFIFtFU0NdLiBBXG4gKiAgY2xpY2sgcGlja3MgYSBjb2xvciBhbmQgbGVhdmVzIHRoZSBncmlkIG9wZW4uICovXG5leHBvcnQgZnVuY3Rpb24gU3dhdGNoZXMoe1xuICBvcHRpb24sXG4gIHZhbHVlLFxuICBvblBpY2ssXG4gIG9uQ2xvc2UsXG59OiB7XG4gIG9wdGlvbjogTG9va09wdGlvbjtcbiAgdmFsdWU6IG51bWJlcjtcbiAgb25QaWNrOiAoaTogbnVtYmVyKSA9PiB2b2lkO1xuICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBlbnRlciA9IHVzZUVudGVyKDMwKTtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICByaWdodDogMTM1LFxuICAgICAgICAgIC4uLmVudGVyLFxuICAgICAgICAgIHRvcDogMTU4LFxuICAgICAgICAgIHdpZHRoOiA1NjAsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBnYXA6IDYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIixcbiAgICAgICAgICAgIGdhcDogMTQsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDI4IH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxEYXRhTm9pc2Ugc2VlZD17NDF9IGxpbmVzPXszfSBncm91cHM9ezJ9IHN0eWxlPXt7IGZvbnRTaXplOiA2IH19IC8+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5tZW51LCBmb250U2l6ZTogMjcsIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQgfX0+XG4gICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMTcsXG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFNDK1xuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5jaGFtZmVyKFwiIzFhMGEwZVwiLCAyMiwgXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjU1KVwiLCAxKSxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAyNiwgcmlnaHQ6IDI0LCB0b3A6IDEwLCBib3R0b206IDEyIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICBmbGV4V3JhcDogXCJ3cmFwXCIsXG4gICAgICAgICAgICAgIGdhcDogNSxcbiAgICAgICAgICAgICAgd2lkdGg6IDUwNSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge29wdGlvbi5zd2F0Y2hlcyEubWFwKChjb2xvciwgaSkgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXtjb2xvcn1cbiAgICAgICAgICAgICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2Z4KFwiaG92ZXJcIil9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2Z4KFwiY2xpY2tcIik7XG4gICAgICAgICAgICAgICAgICBvblBpY2soaSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgLi4uY2hhbWZlcihjb2xvciwgMTIpLFxuICAgICAgICAgICAgICAgICAgd2lkdGg6IDgwLFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA4MCxcbiAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImZsZXhFbmRcIixcbiAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiZmxleFN0YXJ0XCIsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IHRvcDogOCwgcmlnaHQ6IDggfSxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGhvdmVyU3R5bGU9e3sgLi4uY2hhbWZlcihjb2xvciwgMTIsIEMuY3lhbiwgMikgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMTQsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMTQsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAyLFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7aSA9PT0gdmFsdWUgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiA2LCBoZWlnaHQ6IDYsIGJhY2tncm91bmRDb2xvcjogQy5yZWQgfX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogNy41LCBjb2xvcjogQy5yZWREaW0gfX0+XG4gICAgICAgICAgICB7YElNQUdFIE5BTUU6ICAke29wdGlvbi5pZC50b1VwcGVyQ2FzZSgpfS0keyh2YWx1ZSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgXCIwXCIpfS5TV1RcXG5JTUFHRSBUWVBFOiAgS0VSTkVMIElTT0xBVEVEIFNBTVBMRVxcbkNPREVDOiAgVU5DT01QUkVTU0VEXFxuTE9BRCBBRERSRVNTOiAgMDAwMEExMjQ0YH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgb25DbGljaz17b25DbG9zZX1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKFwiIzFhMGEwZVwiLCAxMiwgXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjU1KVwiLCAxKSxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICByaWdodDogMTg1LFxuICAgICAgICAgIHRvcDogNDMyLFxuICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgaGVpZ2h0OiA0NixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgfX1cbiAgICAgICAgaG92ZXJTdHlsZT17Y2hhbWZlcihcIiMzYTEwMTZcIiwgMTIsIEMucmVkLCAxKX1cbiAgICAgID5cbiAgICAgICAgPEtleWNhcCBrPVwiRVNDXCIgLz5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5tZW51LCBmb250U2l6ZTogMjUgfX0+Q0xPU0U8L3RleHQ+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8Lz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHsgTkVXX0NIQVJBQ1RFUiwgdHlwZSBBdHRyaWJ1dGVJZCB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiwgVCwgY2hhbWZlciB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgRklMTCwgSGVhZGVyLCBIaW50LCBIaW50cywgS2V5Y2FwIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgQVRUUklCVVRFUywgQVRUUl9NQVgsIEFUVFJfTUlOLCBBVFRSX1BPSU5UUyB9IGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCB7IElkQ2FyZCB9IGZyb20gXCIuL0lkQ2FyZFwiO1xuaW1wb3J0IHsgQXR0cmlidXRlSWNvbiwgU3RlcEljb24gfSBmcm9tIFwiLi9nbHlwaHNcIjtcbmltcG9ydCB7IENocm9tZSwgTGV2ZWxCYWRnZSwgTmF2QnV0dG9ucyB9IGZyb20gXCIuL3BhcnRzXCI7XG5pbXBvcnQgdHlwZSB7IFN0ZXBQcm9wcyB9IGZyb20gXCIuL05ld0dhbWVcIjtcblxuY29uc3QgREFSSyA9IFwiIzBkMGYxNlwiO1xuY29uc3QgRURHRSA9IFwicmdiYSgyNTUsIDkzLCA4MSwgMC40MilcIjtcbmNvbnN0IExJVCA9IFwiIzVhMWExZVwiO1xuXG4vKiogQVRUUklCVVRFUzogZml2ZSBhdHRyaWJ1dGVzIGZyb20gMyB0byA2IGFuZCBzZXZlbiBwb2ludHMgdG8gc3BlbmRcbiAqICAocmlnaHQpLCB0aGUgaG92ZXJlZCBvbmUgZXhwbGFpbmVkIChsZWZ0KSwgdGhlIElEIGNhcmQncyByYWRhclxuICogIGZvbGxvd2luZyBhbG9uZyAobWlkZGxlKS4gQSBhbmQgRCB0YWtlIGFuZCBnaXZlIGEgcG9pbnQuICovXG5leHBvcnQgZnVuY3Rpb24gQXR0cmlidXRlcyh7IGNoYXJhY3Rlciwgb25DaGFuZ2UsIG5leHQsIGJhY2sgfTogU3RlcFByb3BzKSB7XG4gIGNvbnN0IFtob3QsIHNldEhvdF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCB2YWx1ZXMgPSBjaGFyYWN0ZXIuYXR0cmlidXRlcztcbiAgY29uc3Qgc3BlbnQgPSBBVFRSSUJVVEVTLnJlZHVjZSgobiwgYSkgPT4gbiArIHZhbHVlc1thLmlkXSAtIEFUVFJfTUlOLCAwKTtcbiAgY29uc3QgcG9pbnRzID0gQVRUUl9QT0lOVFMgLSBzcGVudDtcbiAgY29uc3QgY2hhbmdlID0gKGlkOiBBdHRyaWJ1dGVJZCwgYnk6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHYgPSB2YWx1ZXNbaWRdICsgYnk7XG4gICAgaWYgKHYgPCBBVFRSX01JTiB8fCB2ID4gQVRUUl9NQVggfHwgKGJ5ID4gMCAmJiBwb2ludHMgPT09IDApKVxuICAgICAgcmV0dXJuIHNmeChcImVycm9yXCIpO1xuICAgIHNmeChcInRhYlwiKTtcbiAgICBvbkNoYW5nZSh7IC4uLmNoYXJhY3RlciwgYXR0cmlidXRlczogeyAuLi52YWx1ZXMsIFtpZF06IHYgfSB9KTtcbiAgfTtcbiAgY29uc3QgaG92ZXIgPSAoaTogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGkgPT09IGhvdCkgcmV0dXJuO1xuICAgIHNmeChcImhvdmVyXCIpO1xuICAgIHNldEhvdChpKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIC8vIEhvbGQgQSBvciBEIHRvIGtlZXAgc3BlbmRpbmc7IEVzYyBhbmQgRiBhY3Qgb25jZS5cbiAgICBpZiAoZWRpdGluZyB8fCAoZS5yZXBlYXQgJiYgKGUua2V5ID09PSBcIkVzY2FwZVwiIHx8IGUuY29kZSA9PT0gXCJLZXlGXCIpKSlcbiAgICAgIHJldHVybjtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGJhY2soKTtcbiAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5RlwiKSBuZXh0KCk7XG4gICAgZWxzZSBpZiAoZS5jb2RlID09PSBcIktleUFcIikgY2hhbmdlKEFUVFJJQlVURVNbaG90XS5pZCwgLTEpO1xuICAgIGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlEXCIpIGNoYW5nZShBVFRSSUJVVEVTW2hvdF0uaWQsIDEpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkFycm93VXBcIikgaG92ZXIoTWF0aC5tYXgoMCwgaG90IC0gMSkpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkFycm93RG93blwiKVxuICAgICAgaG92ZXIoTWF0aC5taW4oQVRUUklCVVRFUy5sZW5ndGggLSAxLCBob3QgKyAxKSk7XG4gIH0sIHRydWUpO1xuICB1c2VEZWJ1ZyhcImhvdmVyXCIsIChuKSA9PiBzZXRIb3QoTnVtYmVyKG4pKSk7XG4gIC8vIGBhdHRycyAzIDQgNiA2IDNgOiBib2R5LCBpbnRlbGxpZ2VuY2UsIHJlZmxleGVzLCB0ZWNoLCBjb29sLlxuICB1c2VEZWJ1ZyhcImF0dHJzXCIsIChhcmcpID0+IHtcbiAgICBjb25zdCBuID0gYXJnLnNwbGl0KFwiIFwiKS5tYXAoTnVtYmVyKTtcbiAgICBvbkNoYW5nZSh7XG4gICAgICAuLi5jaGFyYWN0ZXIsXG4gICAgICBhdHRyaWJ1dGVzOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIEFUVFJJQlVURVMubWFwKChhLCBpKSA9PiBbYS5pZCwgbltpXV0pLFxuICAgICAgKSBhcyB0eXBlb2YgdmFsdWVzLFxuICAgIH0pO1xuICB9KTtcblxuICBjb25zdCBhID0gQVRUUklCVVRFU1tob3RdO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtGSUxMfT5cbiAgICAgIDxDaHJvbWUgLz5cbiAgICAgIDxIZWFkZXJcbiAgICAgICAgdGl0bGU9XCJBVFRSSUJVVEVTXCJcbiAgICAgICAgY2FwdGlvbj1cIlNQRU5EIFlPVVIgUE9JTlRTLiBXSEFUIFlPVSBTVEFSVCBXSVRIIERFQ0lERVMgSE9XIFlPVSBTVVJWSVZFIFlPVVIgRklSU1QgTklHSFQuXCJcbiAgICAgICAgaWNvbj17PFN0ZXBJY29uIGtpbmQ9XCJhdHRyaWJ1dGVzXCIgLz59XG4gICAgICAgIHN0ZXA9ezN9XG4gICAgICAvPlxuICAgICAgPEV4cGxhaW5lclxuICAgICAgICBuYW1lPXthLm5hbWV9XG4gICAgICAgIHRleHQ9e2EudGV4dH1cbiAgICAgICAgZWZmZWN0cz17YS5lZmZlY3RzfVxuICAgICAgICB2YWx1ZT17dmFsdWVzW2EuaWRdfVxuICAgICAgLz5cbiAgICAgIDxJZENhcmRcbiAgICAgICAgY2hhcmFjdGVyPXtjaGFyYWN0ZXJ9XG4gICAgICAgIG9uQ2hhbmdlPXtvbkNoYW5nZX1cbiAgICAgICAgb25FZGl0aW5nPXtzZXRFZGl0aW5nfVxuICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgbGVmdDogNTYwLCB0b3A6IDE5NiB9fVxuICAgICAgLz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uVC5tZW51LFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIHJpZ2h0OiAyMDAsXG4gICAgICAgICAgdG9wOiAxNzgsXG4gICAgICAgICAgZm9udFNpemU6IDI3LFxuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIFBPSU5UUyBBVkFJTEFCTEVcbiAgICAgIDwvdGV4dD5cbiAgICAgIDxidXR0b25cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIHNmeChcImNsaWNrXCIpO1xuICAgICAgICAgIG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCBhdHRyaWJ1dGVzOiBORVdfQ0hBUkFDVEVSLmF0dHJpYnV0ZXMgfSk7XG4gICAgICAgIH19XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihEQVJLLCAxNCwgRURHRSwgMSwgXCJibFwiKSxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICByaWdodDogNDA4LFxuICAgICAgICAgIHRvcDogMjEzLFxuICAgICAgICAgIHdpZHRoOiAyNDksXG4gICAgICAgICAgaGVpZ2h0OiA1MCxcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICB9fVxuICAgICAgICBob3ZlclN0eWxlPXtjaGFtZmVyKFwiIzJhMGQxMlwiLCAxNCwgQy5yZWQsIDEsIFwiYmxcIil9XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRTaXplOiAyMixcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFJFU0VUIFRPIERFRkFVTFRcbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIHJpZ2h0OiAtMixcbiAgICAgICAgICAgIHRvcDogMjMsXG4gICAgICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgICAgICBoZWlnaHQ6IDMsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogRURHRSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoREFSSywgMTIsIEVER0UsIDEsIFwiYmxcIiksXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgcmlnaHQ6IDIwMCxcbiAgICAgICAgICB0b3A6IDIxMCxcbiAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgIGhlaWdodDogNTMsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IDQyLFxuICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3BvaW50cy50b1N0cmluZygpfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICB7QVRUUklCVVRFUy5tYXAoKGF0dHIsIGkpID0+IChcbiAgICAgICAgPEF0dHJpYnV0ZVJvd1xuICAgICAgICAgIGtleT17YXR0ci5pZH1cbiAgICAgICAgICBpZD17YXR0ci5pZH1cbiAgICAgICAgICBuYW1lPXthdHRyLm5hbWV9XG4gICAgICAgICAgdmFsdWU9e3ZhbHVlc1thdHRyLmlkXX1cbiAgICAgICAgICBsaXQ9e2kgPT09IGhvdH1cbiAgICAgICAgICBjYW5BZGQ9e3ZhbHVlc1thdHRyLmlkXSA8IEFUVFJfTUFYICYmIHBvaW50cyA+IDB9XG4gICAgICAgICAgdG9wPXsyNzggKyBpICogMTIxfVxuICAgICAgICAgIG9uRW50ZXI9eygpID0+IGhvdmVyKGkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoYnkpID0+IGNoYW5nZShhdHRyLmlkLCBieSl9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIDxOYXZCdXR0b25zIG9uQmFjaz17YmFja30gb25OZXh0PXtuZXh0fSAvPlxuICAgICAgPEhpbnRzPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX0+XG4gICAgICAgICAgPEtleWNhcCBrPVwiQVwiIC8+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDI1LCBjb2xvcjogQy5yZWQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT5cbiAgICAgICAgICAgIC0gLyArXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxLZXljYXAgaz1cIkRcIiAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxIaW50IGs9XCJtb3VzZVwiIGxhYmVsPVwiU0VMRUNUXCIgLz5cbiAgICAgIDwvSGludHM+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogT25lIGF0dHJpYnV0ZTogaXRzIHBsYXRlIChpY29uLCBuYW1lLCBNSU4vTUFYIGJhZGdlKSBvdmVyIOKIkiB2YWx1ZSArLiAqL1xuZnVuY3Rpb24gQXR0cmlidXRlUm93KHtcbiAgaWQsXG4gIG5hbWUsXG4gIHZhbHVlLFxuICBsaXQsXG4gIGNhbkFkZCxcbiAgdG9wLFxuICBvbkVudGVyLFxuICBvbkNoYW5nZSxcbn06IHtcbiAgaWQ6IEF0dHJpYnV0ZUlkO1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIGxpdDogYm9vbGVhbjtcbiAgY2FuQWRkOiBib29sZWFuO1xuICB0b3A6IG51bWJlcjtcbiAgb25FbnRlcjogKCkgPT4gdm9pZDtcbiAgb25DaGFuZ2U6IChieTogbnVtYmVyKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBmaWxsID0gbGl0ID8gTElUIDogREFSSztcbiAgY29uc3QgZWRnZSA9IGxpdCA/IFwicmdiYSgyNTUsIDkzLCA4MSwgMC43NSlcIiA6IEVER0U7XG4gIGNvbnN0IGJveCA9IChjb3JuZXI/OiBcImJsXCIgfCBcImJyXCIpID0+XG4gICAgY29ybmVyXG4gICAgICA/IGNoYW1mZXIoZmlsbCwgMTIsIGVkZ2UsIDEsIGNvcm5lcilcbiAgICAgIDogeyBiYWNrZ3JvdW5kQ29sb3I6IGZpbGwsIGJvcmRlcjogMSwgYm9yZGVyQ29sb3I6IGVkZ2UgfTtcbiAgY29uc3QgYmFkZ2UgPVxuICAgIHZhbHVlID09PSBBVFRSX01BWCA/IFwiTUFYIExFVkVMXCIgOiB2YWx1ZSA9PT0gQVRUUl9NSU4gPyBcIk1JTiBMRVZFTFwiIDogbnVsbDtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvblBvaW50ZXJFbnRlcj17b25FbnRlcn1cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICByaWdodDogMjAwLFxuICAgICAgICB0b3AsXG4gICAgICAgIHdpZHRoOiA0NTcsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIGdhcDogNixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKGZpbGwsIDE2LCBlZGdlLCAxLCBcImJsXCIpLFxuICAgICAgICAgIGhlaWdodDogNjIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIGxlZnQ6IDMyLCB0b3A6IDEwIH19PlxuICAgICAgICAgIDxBdHRyaWJ1dGVJY29uIGlkPXtpZH0gLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250U2l6ZTogMjUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7bmFtZX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICB7YmFkZ2UgJiYgKFxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLCByaWdodDogMTAsIHRvcDogMTggfX0+XG4gICAgICAgICAgICA8TGV2ZWxCYWRnZSBsYWJlbD17YmFkZ2V9IC8+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApfVxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiA0LCBoZWlnaHQ6IDQ2IH19PlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25Qb2ludGVyRW50ZXI9e29uRW50ZXJ9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoLTEpfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5ib3goXCJibFwiKSxcbiAgICAgICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBob3ZlclN0eWxlPXtjaGFtZmVyKFwiIzZlMjIyOFwiLCAxMiwgQy5yZWQsIDEsIFwiYmxcIil9XG4gICAgICAgID5cbiAgICAgICAgICA8U2lnbiBwbHVzPXtmYWxzZX0gb2ZmPXt2YWx1ZSA8PSBBVFRSX01JTn0gLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmJveCgpLFxuICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMjcsXG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3ZhbHVlLnRvU3RyaW5nKCl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvblBvaW50ZXJFbnRlcj17b25FbnRlcn1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgxKX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uYm94KFwiYnJcIiksXG4gICAgICAgICAgICB3aWR0aDogMTExLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgICAgaG92ZXJTdHlsZT17Y2hhbWZlcihcIiM2ZTIyMjhcIiwgMTIsIEMucmVkLCAxLCBcImJyXCIpfVxuICAgICAgICA+XG4gICAgICAgICAgPFNpZ24gcGx1cyBvZmY9eyFjYW5BZGR9IC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9ub2RlPlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiog4oiSIG9yICs7IHN0cnVjayB0aHJvdWdoIChhIHNsYW50ZWQgYmFyIG92ZXIgYSBib3gpIHdoZW4gdW5hdmFpbGFibGUuICovXG5mdW5jdGlvbiBTaWduKHsgcGx1cywgb2ZmIH06IHsgcGx1czogYm9vbGVhbjsgb2ZmOiBib29sZWFuIH0pIHtcbiAgY29uc3QgY29sb3IgPSBvZmYgPyBcIiNhMzMzMmJcIiA6IEMucmVkO1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCA1OCAxNlwiIHN0eWxlPXt7IHdpZHRoOiA1OCwgaGVpZ2h0OiAxNiB9fT5cbiAgICAgIHtvZmYgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxyZWN0XG4gICAgICAgICAgICB4PXsxfVxuICAgICAgICAgICAgeT17M31cbiAgICAgICAgICAgIHdpZHRoPXs1Nn1cbiAgICAgICAgICAgIGhlaWdodD17MTB9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezF9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8bGluZSB4MT17MX0geTE9ezN9IHgyPXs1N30geTI9ezEzfSBzdHJva2U9e2NvbG9yfSBzdHJva2VXaWR0aD17MX0gLz5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD17MjN9IHk9ezd9IHdpZHRoPXsxMn0gaGVpZ2h0PXsyLjR9IGZpbGw9e2NvbG9yfSAvPlxuICAgICAge3BsdXMgJiYgPHJlY3QgeD17MjcuOH0geT17Mn0gd2lkdGg9ezIuNH0gaGVpZ2h0PXsxMn0gZmlsbD17Y29sb3J9IC8+fVxuICAgIDwvc3ZnPlxuICApO1xufVxuXG4vKiogVGhlIGhvdmVyZWQgYXR0cmlidXRlLCBleHBsYWluZWQ6IG5hbWUgYW5kIGxldmVsIGJhZGdlLCB3aGF0IGVhY2hcbiAqICBsZXZlbCBnaXZlcyAoaW4gY3lhbiksIGFuZCB0aGUgY3VycmVudCBsZXZlbC4gKi9cbmZ1bmN0aW9uIEV4cGxhaW5lcih7XG4gIG5hbWUsXG4gIHRleHQsXG4gIGVmZmVjdHMsXG4gIHZhbHVlLFxufToge1xuICBuYW1lOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgZWZmZWN0czogc3RyaW5nW107XG4gIHZhbHVlOiBudW1iZXI7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiA3NSxcbiAgICAgICAgdG9wOiAxNzgsXG4gICAgICAgIHdpZHRoOiAzOTcsXG4gICAgICAgIG1pbkhlaWdodDogMzY4LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoXCIjMTYwYTBmXCIsIDEyLCBFREdFLCAxLCBcImJsXCIpLFxuICAgICAgICAgIHdpZHRoOiA0MCxcbiAgICAgICAgICBtYXJnaW46IHsgcmlnaHQ6IDMgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAyNixcbiAgICAgICAgICAgIHRvcDogMTYsXG4gICAgICAgICAgICBib3R0b206IDE2LFxuICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEVER0UsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiA0LFxuICAgICAgICAgICAgdG9wOiAxNzUsXG4gICAgICAgICAgICB3aWR0aDogMjIsXG4gICAgICAgICAgICBoZWlnaHQ6IDQsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogRURHRSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKERBUkssIDE4LCBFREdFLCAxKSxcbiAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMTYsIHJpZ2h0OiAxMiwgdG9wOiAxMCwgYm90dG9tOiAxMCB9LFxuICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgICAgICBoZWlnaHQ6IDMyLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDI2LFxuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge25hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIHt2YWx1ZSA9PT0gQVRUUl9NQVggJiYgPExldmVsQmFkZ2UgbGFiZWw9XCJNQVggTEVWRUxcIiAvPn1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBoZWlnaHQ6IDEsIGJhY2tncm91bmRDb2xvcjogRURHRSB9fSAvPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMzIyIH19PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyMiwgY29sb3I6IEMuY3lhbiwgbGluZUhlaWdodDogMS4xMiB9fT5cbiAgICAgICAgICAgIHtgJHt0ZXh0fVxcblxcbiR7ZWZmZWN0cy5tYXAoKGUpID0+IGAtICR7ZX1gKS5qb2luKFwiXFxuXCIpfWB9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxIH19IC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGhlaWdodDogMSwgYmFja2dyb3VuZENvbG9yOiBFREdFIH19IC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgZ2FwOiAxMixcbiAgICAgICAgICAgIGhlaWdodDogNDgsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiA0MCwgY29sb3I6IEMucmVkLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+XG4gICAgICAgICAgICB7dmFsdWUudG9TdHJpbmcoKX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxNyxcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgQVRUUklCVVRFIExFVkVMXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgICAgaGVpZ2h0OiA0OCxcbiAgICAgICAgICAgICAgbWFyZ2luOiB7IGxlZnQ6IDEwIH0sXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogRURHRSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHsgQywgRiwgVCB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgcm5nIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBGSUxMLCBIZWFkZXIsIEhpbnQsIEhpbnRzIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgaGFuZGxlT2YgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBGaWd1cmUgfSBmcm9tIFwiLi9GaWd1cmVcIjtcbmltcG9ydCB7IFN0ZXBJY29uIH0gZnJvbSBcIi4vZ2x5cGhzXCI7XG5pbXBvcnQgeyBDaHJvbWUsIENvbGRGcmFtZSwgSG90RnJhbWUgfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IHR5cGUgeyBTdGVwUHJvcHMgfSBmcm9tIFwiLi9OZXdHYW1lXCI7XG5cbmNvbnN0IENBUkQgPSB7IHdpZHRoOiAzNzIsIGhlaWdodDogODcyLCB0b3A6IDEyNSwgbGVmdHM6IFs1MzcsIDEwMTVdIH07XG5cbi8qKiBUaGUgZ2Vub21lIHRoZSBjYXJkcyBhcmUgcHJpbnRlZCBvdmVyOiByb3dzIG9mIGNvZG9uIHRyaXBsZXRzLiAqL1xuZnVuY3Rpb24gZ2Vub21lKHNlZWQ6IG51bWJlcikge1xuICBjb25zdCByID0gcm5nKHNlZWQpO1xuICBjb25zdCBiYXNlID0gKCkgPT4gXCJBQ0dUXCJbTWF0aC5mbG9vcihyKCkgKiA0KV07XG4gIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiA3OSB9LCAoKSA9PlxuICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IDEyIH0sICgpID0+IGJhc2UoKSArIGJhc2UoKSArIGJhc2UoKSkuam9pbihcIiBcIiksXG4gICkuam9pbihcIlxcblwiKTtcbn1cbmNvbnN0IEdFTk9NRSA9IFtnZW5vbWUoMjEpLCBnZW5vbWUoMzQpXTtcblxuLyoqIEJPRFkgVFlQRTogdHdvIHRhbGwgY2FyZHMsIGVhY2ggYSBmaWd1cmUgaW4gbGluZSBhcnQgb3ZlciBpdHMgZ2Vub21lLlxuICogIFRoZSBob3ZlcmVkIGNhcmQgaXMgbGl0IHJlZDsgYSBjbGljayAob3IgRW50ZXIpIGNob29zZXMgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gQm9keVR5cGUoeyBjaGFyYWN0ZXIsIG9uQ2hhbmdlLCBuZXh0LCBiYWNrIH06IFN0ZXBQcm9wcykge1xuICBjb25zdCBbaG90LCBzZXRIb3RdID0gdXNlU3RhdGUoY2hhcmFjdGVyLmJvZHkpO1xuICBjb25zdCBob3ZlciA9IChpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoaSA9PT0gaG90KSByZXR1cm47XG4gICAgc2Z4KFwiaG92ZXJcIik7XG4gICAgc2V0SG90KGkpO1xuICB9O1xuICBjb25zdCBwaWNrID0gKGk6IG51bWJlcikgPT4ge1xuICAgIG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCBib2R5OiBpIH0pO1xuICAgIG5leHQoKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikgYmFjaygpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkFycm93TGVmdFwiKSBob3ZlcigwKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd1JpZ2h0XCIpIGhvdmVyKDEpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkVudGVyXCIgfHwgZS5jb2RlID09PSBcIktleUZcIikgcGljayhob3QpO1xuICB9KTtcbiAgdXNlRGVidWcoXCJob3ZlclwiLCAobikgPT4gc2V0SG90KE51bWJlcihuKSkpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPENocm9tZSAvPlxuICAgICAgPEhlYWRlclxuICAgICAgICB0aXRsZT1cIkJPRFkgVFlQRVwiXG4gICAgICAgIGNhcHRpb249e2BQSUNLIEEgRlJBTUUgRk9SICR7aGFuZGxlT2YoY2hhcmFjdGVyKX0uIFRIRSBXQVkgWU9VIExPT0sgQ0FOIENIQU5HRSBIT1cgU09NRSBQRU9QTEUgSU4gU0FCTEUgQ0lUWSBUUkVBVCBZT1UuYH1cbiAgICAgICAgaWNvbj17PFN0ZXBJY29uIGtpbmQ9XCJib2R5XCIgLz59XG4gICAgICAgIHN0ZXA9ezF9XG4gICAgICAvPlxuICAgICAge0NBUkQubGVmdHMubWFwKChsZWZ0LCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpdCA9IGkgPT09IGhvdDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gaG92ZXIoaSl9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBwaWNrKGkpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgICAgIHRvcDogQ0FSRC50b3AsXG4gICAgICAgICAgICAgIHdpZHRoOiBDQVJELndpZHRoLFxuICAgICAgICAgICAgICBoZWlnaHQ6IENBUkQuaGVpZ2h0LFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IGxpdFxuICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiIzVhMWQyMFwiIH0sIHsgY29sb3I6IFwiIzJlMTQxOFwiIH1dLFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7bGl0ICYmIChcbiAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgICAgICBsZWZ0OiA2LFxuICAgICAgICAgICAgICAgICAgdG9wOiAzMCxcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMC41LFxuICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5tb25vLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IFwiIzc2MjgyYlwiLFxuICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogMS4wLFxuICAgICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7R0VOT01FW2ldfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgIGxlZnQ6IDgsXG4gICAgICAgICAgICAgICAgdG9wOiA4LFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMSxcbiAgICAgICAgICAgICAgICBjb2xvcjogbGl0ID8gXCIjZDdhMjliXCIgOiBcIiM2YjNhM2FcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2kgPT09IDBcbiAgICAgICAgICAgICAgICA/IFwiU0MyMDkxMTAwNzA0NTExODM2OTAwNDIwXCJcbiAgICAgICAgICAgICAgICA6IFwiU0MyMDkxMTAwNzA0NTE3MjkwMzYxMTg1XCJ9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIC4uLlQubWljcm8sXG4gICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgICAgbGVmdDogMjYyLFxuICAgICAgICAgICAgICAgIHRvcDogOCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICAgICAgY29sb3I6IGxpdCA/IFwiI2Q3YTI5YlwiIDogXCIjNmIzYTNhXCIsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDA3LjEwLjIwOTFcbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgLi4uRklMTCxcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6IHsgdG9wOiA1NiB9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8RmlndXJlXG4gICAgICAgICAgICAgICAgYnVpbGQ9e2l9XG4gICAgICAgICAgICAgICAgaGVpZ2h0PXs3ODB9XG4gICAgICAgICAgICAgICAgY29sb3I9e2xpdCA/IEMuY3lhbiA6IFwiIzNhNzY4MFwifVxuICAgICAgICAgICAgICAgIGFjY2VudD17bGl0ID8gXCIjZmZlNGRjXCIgOiBcIiM1YTMyMzZcIn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDxNYXJrIGxpdD17bGl0fSAvPlxuICAgICAgICAgICAge2xpdCA/IChcbiAgICAgICAgICAgICAgPEhvdEZyYW1lIGJhcj17MjJ9IGN1dD17NTB9IHN0ZXA9ezE2MH0gLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxDb2xkRnJhbWUgY3V0PXs1MH0gbGluZT1cIiM0YTFjMWZcIiAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNFTEVDVFwiIC8+XG4gICAgICAgIDxIaW50IGs9XCJFU0NcIiBsYWJlbD1cIkJBQ0tcIiBvbkNsaWNrPXtiYWNrfSAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgcmVnaXN0cnkncyBtYXJrIG9uIGVhY2ggY2FyZCdzIGZvb3Q6IGEgZm91ci1wb2ludCBzdGFyLCBTQzkxIGFuZFxuICogIHRoZSB0ZW1wbGF0ZSdzIHNtYWxsIHByaW50LiAqL1xuZnVuY3Rpb24gTWFyayh7IGxpdCB9OiB7IGxpdDogYm9vbGVhbiB9KSB7XG4gIGNvbnN0IGNvbG9yID0gbGl0ID8gQy5yZWQgOiBcIiM3YTJiMmJcIjtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDE0LFxuICAgICAgICBib3R0b206IDE0LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBnYXA6IDEsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogNCB9fT5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDIwIDIwXCIgc3R5bGU9e3sgd2lkdGg6IDIwLCBoZWlnaHQ6IDIwIH19PlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1tcbiAgICAgICAgICAgICAgMTAsIDAsIDEyLjUsIDcuNSwgMjAsIDEwLCAxMi41LCAxMi41LCAxMCwgMjAsIDcuNSwgMTIuNSwgMCwgMTAsXG4gICAgICAgICAgICAgIDcuNSwgNy41LFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIGZpbGw9e2NvbG9yfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250U2l6ZTogMjgsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICBjb2xvcixcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgU0M5MVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogNywgY29sb3IgfX0+XG4gICAgICAgIHtcIkJJT01FVFJJQyBURU1QTEFURVxcblNUQU5EQVJEIDkxLUFcIn1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiLyoqIEhhbGYgb3V0bGluZXMgKHJpZ2h0IHNpZGUsIGZsYXQgYFt4LCB5LCDigKZdYCwgeCBmcm9tIHRoZSBjZW50ZXIgbGluZSwgeVxuICogIGRvd24pIG9mIHRoZSB0d28gYnVpbGRzIGluIGEgMzAwIMOXIDc4MCBib3g6IGhlYWQsIHNob3VsZGVyLCByb3VuZCB0aGVcbiAqICBoYW5naW5nIGFybSBhbmQgYmFjayB1cCBpbnRvIHRoZSBhcm1waXQsIGRvd24gdGhlIGZsYW5rIGFuZCB0aGUgb3V0ZXJcbiAqICBsZWcsIHRoZSBmb290LCB1cCB0aGUgaW5uZXIgbGVnLiBNaXJyb3JlZCBpbnRvIG9uZSBwb2x5Z29uLiAqL1xuY29uc3QgQlVJTERTID0gW1xuICBbXG4gICAgMCwgMjgsIDEzLCAzMCwgMjIsIDM3LCAyNywgNTAsIDI4LCA2NiwgMjYsIDgyLCAyMSwgOTYsIDE0LCAxMDYsIDEyLCAxMTQsIDEzLFxuICAgIDEyNiwgMzAsIDEzNCwgNTIsIDE0MSwgNjYsIDE1MCwgNzQsIDE2NiwgNzgsIDE5NiwgODAsIDIzNiwgNzksIDI2MiwgNzcsIDMwMCxcbiAgICA3MywgMzQwLCA3MCwgMzcyLCA3MywgMzkyLCA3MiwgNDE0LCA2NiwgNDI4LCA1OSwgNDI0LCA1NywgNDA0LCA1NiwgMzc2LCA1NSxcbiAgICAzNDQsIDU0LCAzMDQsIDUzLCAyNzAsIDUxLCAyMzIsIDQ4LCAyMDAsIDQ2LCAyMTIsIDQ0LCAyNTAsIDQwLCAyOTYsIDQwLCAzMjAsXG4gICAgNDUsIDM1MiwgNDgsIDM4NCwgNDcsIDQ0MCwgNDQsIDUwMCwgNDAsIDUzMCwgMzksIDU2MCwgNDAsIDYwMCwgMzYsIDY2MCwgMzEsXG4gICAgNzEyLCAzNiwgNzMwLCA0MCwgNzQ4LCAzMCwgNzU0LCAxNCwgNzU0LCAxMiwgNzM2LCAxMywgNzEyLCAxMiwgNjYwLCAxMywgNjAwLFxuICAgIDExLCA1NjAsIDEyLCA1MzAsIDEwLCA0NzAsIDYsIDQyMCwgMCwgNDA0LFxuICBdLFxuICBbXG4gICAgMCwgMzAsIDEyLCAzMiwgMjAsIDM4LCAyNSwgNTAsIDI2LCA2NSwgMjQsIDgwLCAxOSwgOTMsIDEyLCAxMDMsIDEwLCAxMTIsIDExLFxuICAgIDEyNCwgMjQsIDEzMiwgNDIsIDEzOSwgNTMsIDE0NywgNTksIDE2MiwgNjEsIDE5MiwgNjIsIDIzMCwgNjEsIDI1OCwgNTksIDI5NixcbiAgICA1NiwgMzM0LCA1MywgMzY0LCA1NiwgMzg0LCA1NSwgNDA0LCA1MCwgNDE4LCA0NCwgNDE0LCA0MiwgMzk2LCA0MiwgMzY4LCA0MixcbiAgICAzMzYsIDQyLCAzMDAsIDQyLCAyNjgsIDQxLCAyMzQsIDQwLCAyMDAsIDM4LCAyMTQsIDM3LCAyNDQsIDMxLCAyODgsIDMxLCAzMDQsXG4gICAgNDAsIDM0NiwgNTAsIDM4OCwgNDksIDQ0MCwgNDQsIDUwMCwgMzgsIDUzMiwgMzcsIDU2MiwgMzgsIDYwMCwgMzMsIDY2MCwgMjgsXG4gICAgNzEyLCAzMiwgNzMwLCAzNSwgNzQ4LCAyNiwgNzU0LCAxMywgNzU0LCAxMSwgNzM2LCAxMiwgNzEyLCAxMSwgNjYwLCAxMiwgNjAwLFxuICAgIDEwLCA1NjIsIDExLCA1MzIsIDksIDQ3MCwgNSwgNDI0LCAwLCA0MDgsXG4gIF0sXG5dO1xuXG4vKiogTGluZXMgaW5zaWRlIGVhY2ggYnVpbGQgKGNvbGxhcmJvbmVzLCBzdGVybnVtLCBjaGVzdCwgYWJzLCBoaXBzLFxuICogIGtuZWVzKSwgYXMgaGFsZiBwb2x5bGluZXMsIG1pcnJvcmVkIHRvby4gKi9cbmNvbnN0IERFVEFJTFMgPSBbXG4gIFtcbiAgICBbOCwgMTQyLCA0MCwgMTM2XSxcbiAgICBbMCwgMTUwLCAwLCAyNTBdLFxuICAgIFswLCAxOTgsIDE4LCAyMDIsIDM2LCAxOTJdLFxuICAgIFs0LCAyMzYsIDE2LCAyMzRdLFxuICAgIFs0LCAyNjIsIDE3LCAyNjFdLFxuICAgIFs0LCAyODgsIDE3LCAyODhdLFxuICAgIFszMCwgMzMwLCAxMiwgMzgwXSxcbiAgICBbMTgsIDUyNiwgMjYsIDUzNCwgMzQsIDUyNl0sXG4gIF0sXG4gIFtcbiAgICBbNywgMTM2LCAzMiwgMTMyXSxcbiAgICBbMCwgMTQ0LCAwLCAyMTRdLFxuICAgIFs0LCAyMTQsIDE2LCAyMjIsIDMwLCAyMTQsIDM0LCAxOTZdLFxuICAgIFsyMiwgMjg2LCAzMSwgMjk2XSxcbiAgICBbMjgsIDMzMCwgMTAsIDM4NF0sXG4gICAgWzE2LCA1MjgsIDI0LCA1MzYsIDMyLCA1MjhdLFxuICBdLFxuXTtcblxuLyoqIFRoZSBqb2ludHMsIG1hcmtlZCB3aXRoIHJpbmdzOiBzaG91bGRlciwgZWxib3csIHdyaXN0LCBoaXAsIGtuZWUsXG4gKiAgYW5rbGUuICovXG5jb25zdCBKT0lOVFMgPSBbXG4gIFs2NiwgMTUyLCA2NywgMjYyLCA2MywgMzcyLCAzMiwgMzg0LCAyNiwgNTMyLCAyMiwgNzEyXSxcbiAgWzUwLCAxNDgsIDUyLCAyNTgsIDQ4LCAzNjYsIDMwLCAzODgsIDI0LCA1MzQsIDIwLCA3MTJdLFxuXTtcblxuY29uc3QgQ1ggPSAxNTA7XG4vKiogRmxhdCBoYWxmIHBvaW50cyDihpIgZmxhdCBwb2ludHMsIG1pcnJvcmVkIHdoZW4gYHMgPSAtMWAuICovXG5jb25zdCBzaWRlID0gKGE6IG51bWJlcltdLCBzOiBudW1iZXIpID0+XG4gIGEubWFwKCh2LCBpKSA9PiAoaSAlIDIgPyB2IDogQ1ggKyBzICogdikpO1xuLyoqIEEgaGFsZiBvdXRsaW5lIGFuZCBpdHMgbWlycm9yIGltYWdlLCBhcyBvbmUgY2xvc2VkIG91dGxpbmUuICovXG5mdW5jdGlvbiBtaXJyb3IoaGFsZjogbnVtYmVyW10pIHtcbiAgY29uc3QgYmFjazogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IGhhbGYubGVuZ3RoIC0gNDsgaSA+PSAyOyBpIC09IDIpIGJhY2sucHVzaChoYWxmW2ldLCBoYWxmW2kgKyAxXSk7XG4gIHJldHVybiBbLi4uc2lkZShoYWxmLCAxKSwgLi4uc2lkZShiYWNrLCAtMSldO1xufVxuXG4vKiogQSBzdGFuZGluZyBmaWd1cmUgaW4gbGluZSBhcnQgKGBidWlsZGAgMCBvciAxKSDigJQgd2hhdCB0aGUgYm9keS10eXBlXG4gKiAgY2FyZHMgc2hvdyBpbiBwbGFjZSBvZiBhIDNEIG1vZGVsLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpZ3VyZSh7XG4gIGJ1aWxkLFxuICBjb2xvcixcbiAgYWNjZW50LFxuICBoZWlnaHQsXG59OiB7XG4gIGJ1aWxkOiBudW1iZXI7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIGFjY2VudDogc3RyaW5nO1xuICBoZWlnaHQ6IG51bWJlcjtcbn0pIHtcbiAgY29uc3Qgb3V0bGluZSA9IG1pcnJvcihCVUlMRFNbYnVpbGRdKTtcbiAgY29uc3Qgam9pbnRzID0gSk9JTlRTW2J1aWxkXTtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMzAwIDc4MFwiIHN0eWxlPXt7IHdpZHRoOiAoaGVpZ2h0ICogMzAwKSAvIDc4MCwgaGVpZ2h0IH19PlxuICAgICAgPHBvbHlnb24gcG9pbnRzPXtvdXRsaW5lfSBmaWxsPXtjb2xvcn0gb3BhY2l0eT17MC4xMn0gLz5cbiAgICAgIDxwb2x5Z29uXG4gICAgICAgIHBvaW50cz17b3V0bGluZX1cbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICB7REVUQUlMU1tidWlsZF0uZmxhdE1hcCgobGluZSwgaSkgPT5cbiAgICAgICAgWzEsIC0xXS5tYXAoKHMpID0+IChcbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIGtleT17YCR7aX0ke3N9YH1cbiAgICAgICAgICAgIHBvaW50cz17c2lkZShsaW5lLCBzKX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgICAgIG9wYWNpdHk9ezAuNTV9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSksXG4gICAgICApfVxuICAgICAge1sxLCAtMV0uZmxhdE1hcCgocykgPT5cbiAgICAgICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogam9pbnRzLmxlbmd0aCAvIDIgfSwgKF8sIGkpID0+IChcbiAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICBrZXk9e2Ake2l9JHtzfWB9XG4gICAgICAgICAgICBjeD17Q1ggKyBzICogam9pbnRzWzIgKiBpXX1cbiAgICAgICAgICAgIGN5PXtqb2ludHNbMiAqIGkgKyAxXX1cbiAgICAgICAgICAgIHI9ezMuMn1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17YWNjZW50fVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuMn1cbiAgICAgICAgICAvPlxuICAgICAgICApKSxcbiAgICAgICl9XG4gICAgICB7WzEyMCwgMzMwLCA1NjBdLm1hcCgoeSkgPT4gKFxuICAgICAgICA8bGluZVxuICAgICAgICAgIGtleT17eX1cbiAgICAgICAgICB4MT17MjB9XG4gICAgICAgICAgeTE9e3l9XG4gICAgICAgICAgeDI9ezI4MH1cbiAgICAgICAgICB5Mj17eX1cbiAgICAgICAgICBzdHJva2U9e2FjY2VudH1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MC42fVxuICAgICAgICAgIG9wYWNpdHk9ezAuNH1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgIDwvc3ZnPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGJldnkgfSBmcm9tIFwiLi4vLi4vYmV2eVwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHsgRElGRklDVUxUSUVTIH0gZnJvbSBcIi4uLy4uL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBUIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBGSUxMLCBIaW50LCBIaW50cyB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IERJRkZJQ1VMVFlfVEVYVCB9IGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCB7IFN0ZXBJY29uIH0gZnJvbSBcIi4vZ2x5cGhzXCI7XG5pbXBvcnQgeyBCYXJjb2RlLCBIb3RGcmFtZSB9IGZyb20gXCIuL3BhcnRzXCI7XG5pbXBvcnQgdHlwZSB7IFN0ZXBQcm9wcyB9IGZyb20gXCIuL05ld0dhbWVcIjtcblxuLyoqIFNFTEVDVCBESUZGSUNVTFRZIExFVkVMOiB0aGUgYnVybmluZyBzdHJlZXQgaW4gYSBsaXQgZnJhbWUsIHRoZSBsZXZlbCdzXG4gKiAgYmx1cmIgdW5kZXIgaXQgYW5kIHRoZSBmb3VyIGxldmVscy4gSG92ZXJpbmcgYSBsZXZlbCBwcmV2aWV3cyBpdCAodGhlXG4gKiAgc3RyZWV0IGJ1cm5zIGhvdHRlcik7IGEgY2xpY2sgb3IgRW50ZXIgcGlja3MgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gRGlmZmljdWx0eSh7IGNoYXJhY3Rlciwgb25DaGFuZ2UsIG5leHQsIGJhY2sgfTogU3RlcFByb3BzKSB7XG4gIGNvbnN0IFtob3QsIHNldEhvdF0gPSB1c2VTdGF0ZShcbiAgICBNYXRoLm1heChcbiAgICAgIDAsXG4gICAgICBESUZGSUNVTFRJRVMuZmluZEluZGV4KChkKSA9PiBkLmlkID09PSBjaGFyYWN0ZXIuZGlmZmljdWx0eSksXG4gICAgKSxcbiAgKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5LmRpb3JhbWFzLmRpZmZpY3VsdHkoeyBsZXZlbDogaG90IH0pO1xuICB9LCBbaG90XSk7XG4gIGNvbnN0IGhvdmVyID0gKGk6IG51bWJlcikgPT4ge1xuICAgIGlmIChpID09PSBob3QpIHJldHVybjtcbiAgICBzZngoXCJob3ZlclwiKTtcbiAgICBzZXRIb3QoaSk7XG4gIH07XG4gIGNvbnN0IHBpY2sgPSAoaTogbnVtYmVyKSA9PiB7XG4gICAgb25DaGFuZ2UoeyAuLi5jaGFyYWN0ZXIsIGRpZmZpY3VsdHk6IERJRkZJQ1VMVElFU1tpXS5pZCB9KTtcbiAgICBuZXh0KCk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGJhY2soKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikgaG92ZXIoTWF0aC5tYXgoMCwgaG90IC0gMSkpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkFycm93UmlnaHRcIilcbiAgICAgIGhvdmVyKE1hdGgubWluKERJRkZJQ1VMVElFUy5sZW5ndGggLSAxLCBob3QgKyAxKSk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIiB8fCBlLmNvZGUgPT09IFwiS2V5RlwiKSBwaWNrKGhvdCk7XG4gIH0pO1xuICB1c2VEZWJ1ZyhcImhvdmVyXCIsIChuKSA9PiBzZXRIb3QoTnVtYmVyKG4pKSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8Q2VudGVyZWRIZWFkZXIgdGl0bGU9XCJTRUxFQ1QgRElGRklDVUxUWSBMRVZFTFwiIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDM4MSxcbiAgICAgICAgICB0b3A6IDEwNyxcbiAgICAgICAgICB3aWR0aDogMTE1OSxcbiAgICAgICAgICBoZWlnaHQ6IDU3NyxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uRklMTCwgYmFja2dyb3VuZENvbG9yOiBcIiMwYzBiMTJcIiB9fSAvPlxuICAgICAgICA8cG9ydGFsIHRhcmdldD1cImNhcmQtZGlmZmljdWx0eVwiIHN0eWxlPXt7IC4uLkZJTEwsIGNhY2hlOiBcIm5ldmVyXCIgfX0gLz5cbiAgICAgICAgPEhvdEZyYW1lIGJhcj17MjJ9IGN1dD17MjJ9IHN0ZXA9ezk4fSAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5ULmJvZHksXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMzc4LFxuICAgICAgICAgIHRvcDogNzA2LFxuICAgICAgICAgIHdpZHRoOiAxMTgwLFxuICAgICAgICAgIGZvbnRTaXplOiAyNyxcbiAgICAgICAgICBsaW5lSGVpZ2h0OiAxLjIyLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7RElGRklDVUxUWV9URVhUW0RJRkZJQ1VMVElFU1tob3RdLmlkXX1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMzY2LFxuICAgICAgICAgIHRvcDogODQ3LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge0RJRkZJQ1VMVElFUy5tYXAoKGQsIGkpID0+IChcbiAgICAgICAgICA8TGV2ZWxCdXR0b25cbiAgICAgICAgICAgIGtleT17ZC5pZH1cbiAgICAgICAgICAgIGxhYmVsPXtkLm5hbWV9XG4gICAgICAgICAgICBob3Q9e2kgPT09IGhvdH1cbiAgICAgICAgICAgIHNlZWQ9e2kgKyA0fVxuICAgICAgICAgICAgb25FbnRlcj17KCkgPT4gaG92ZXIoaSl9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBwaWNrKGkpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNFTEVDVFwiIC8+XG4gICAgICAgIDxIaW50IGs9XCJFU0NcIiBsYWJlbD1cIkJBQ0tcIiBvbkNsaWNrPXtiYWNrfSAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIGxldmVsIHBsYXRlOiBhIG5vdGNoZWQgdG9wIGVkZ2UsIGEgY3V0IGZvb3QsIGEgdGFiIG9uIHRoZSBsZWZ0LiBMaXRcbiAqICByZWQgd2l0aCBhIGNvZGUgc3RyaXAgdW5kZXIgaXQgd2hpbGUgaG90LiAqL1xuY29uc3QgUExBVEUgPSBbXG4gIDEsIDUsIDIyLCA1LCAyNywgMTAsIDE3MiwgMTAsIDE3OCwgMSwgMjkxLCAxLCAyOTEsIDcxLCAxNSwgNzEsIDEsIDU3LFxuXTtcblxuZnVuY3Rpb24gTGV2ZWxCdXR0b24oe1xuICBsYWJlbCxcbiAgaG90LFxuICBzZWVkLFxuICBvbkVudGVyLFxuICBvbkNsaWNrLFxufToge1xuICBsYWJlbDogc3RyaW5nO1xuICBob3Q6IGJvb2xlYW47XG4gIHNlZWQ6IG51bWJlcjtcbiAgb25FbnRlcjogKCkgPT4gdm9pZDtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgbGluZSA9IGhvdCA/IFwiI2YwNTI0YVwiIDogXCIjNWMxYzFlXCI7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25Qb2ludGVyRW50ZXI9e29uRW50ZXJ9XG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IDI5MixcbiAgICAgICAgaGVpZ2h0OiA3MixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD1cIjAgMCAyOTIgNzJcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHdpZHRoOiAyOTIsXG4gICAgICAgICAgaGVpZ2h0OiA3MixcbiAgICAgICAgICBmaWx0ZXI6IGhvdFxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJzaGFkb3dcIixcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMjU1LCA2MCwgNTIsIDAuNTUpXCIsXG4gICAgICAgICAgICAgICAgICBvZmZzZXRYOiAwLFxuICAgICAgICAgICAgICAgICAgb2Zmc2V0WTogMCxcbiAgICAgICAgICAgICAgICAgIHNwcmVhZDogMTAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXtQTEFURX1cbiAgICAgICAgICBmaWxsPXtob3QgPyBcIiM2ZDIyMjFcIiA6IFwiIzBkMGYxNlwifVxuICAgICAgICAgIHN0cm9rZT17bGluZX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17aG90ID8gMiA6IDEuMn1cbiAgICAgICAgLz5cbiAgICAgICAgPHJlY3RcbiAgICAgICAgICB4PXsxfVxuICAgICAgICAgIHk9ezM0fVxuICAgICAgICAgIHdpZHRoPXsyNH1cbiAgICAgICAgICBoZWlnaHQ9ezR9XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17bGluZX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogMjUsXG4gICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAwLjUsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgICB7aG90ICYmIChcbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgdG9wOiA3OCxcbiAgICAgICAgICAgIHdpZHRoOiAyOTIsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgZ2FwOiAyLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDUgfX0+XG4gICAgICAgICAgICA8QmFyY29kZSBzZWVkPXsxfSB3aWR0aD17MTR9IGhlaWdodD17MTh9IC8+XG4gICAgICAgICAgICA8QmFyY29kZSBzZWVkPXtzZWVkfSB3aWR0aD17MjU0fSBoZWlnaHQ9ezE4fSAvPlxuICAgICAgICAgICAgPEJhcmNvZGUgc2VlZD17Mn0gd2lkdGg9ezE0fSBoZWlnaHQ9ezE4fSAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7W1xuICAgICAgICAgICAgICBcIlJFRlwiLFxuICAgICAgICAgICAgICBcIjU0MTUyMTAgMTA1Njg0NSA1MVwiLFxuICAgICAgICAgICAgICBcIjg1MDU0MTAzMCA1NDA0NTRcIixcbiAgICAgICAgICAgICAgXCI0ODUxNTEgNTkwNzg3MDlcIixcbiAgICAgICAgICAgICAgXCIyMEpHOFc0XCIsXG4gICAgICAgICAgICAgIFwiTkNcIixcbiAgICAgICAgICAgIF0ubWFwKCh0KSA9PiAoXG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAga2V5PXt0fVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDcsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0fVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICl9XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBUaGUgZGlmZmljdWx0eSBzdGVwJ3MgaGVhZGVyOiB0aGUgcmVkIHJ1bGUgYW5kIGl0cyBmaXZlICh1bmxpdClcbiAqICBzZWdtZW50cywgdGhlIHRpdGxlIGNlbnRlcmVkIG92ZXIgdGhlbS4gKi9cbmZ1bmN0aW9uIENlbnRlcmVkSGVhZGVyKHsgdGl0bGUgfTogeyB0aXRsZTogc3RyaW5nIH0pIHtcbiAgY29uc3QgbGVmdCA9IDYwNjtcbiAgY29uc3Qgd2lkdGggPSA1ICogMTM4ICsgNCAqIDY7XG4gIGNvbnN0IHJ1bGUgPSBcInJnYmEoMjU1LCA5MywgODEsIDAuNzUpXCI7XG4gIGNvbnN0IGZhaW50ID0gXCJyZ2JhKDI1NSwgOTMsIDgxLCAwLjM1KVwiO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgaGVpZ2h0OiA2MCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHdpZHRoOiBsZWZ0IC0gOCxcbiAgICAgICAgICB0b3A6IDQ0LFxuICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICBhbmdsZTogOTAsXG4gICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IGZhaW50IH0sIHsgY29sb3I6IHJ1bGUgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IGxlZnQgKyB3aWR0aCArIDgsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiA0NCxcbiAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDkwLFxuICAgICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBydWxlIH0sIHsgY29sb3I6IGZhaW50IH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0LFxuICAgICAgICAgIHRvcDogNTAsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBnYXA6IDYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtbMCwgMSwgMiwgMywgNF0ubWFwKChpKSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAxMzgsIGhlaWdodDogMiwgYmFja2dyb3VuZENvbG9yOiBDLnJlZExpbmUgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdCxcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICB0b3A6IDgsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPFN0ZXBJY29uIGtpbmQ9XCJkaWZmaWN1bHR5XCIgLz5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17eyAuLi5ULm1pY3JvLCBmb250U2l6ZTogNywgY29sb3I6IEMuY3lhbiwgbGluZUhlaWdodDogMS4xIH19XG4gICAgICAgID5cbiAgICAgICAgICB7XCIwMDEwMDAwMFxcbjAxMDAwMTExXFxuMDEwMDExMTFcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17VC50aXRsZX0+e3RpdGxlfTwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VLZXlzIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IExJRkVQQVRIUyB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgQyB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgRklMTCwgSGVhZGVyLCBIaW50LCBIaW50cyB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IExJRkVQQVRIX1RFWFQgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgeyBTdGVwSWNvbiB9IGZyb20gXCIuL2dseXBoc1wiO1xuaW1wb3J0IHsgQ2hyb21lLCBDb2xkRnJhbWUsIEhvdEZyYW1lIH0gZnJvbSBcIi4vcGFydHNcIjtcbmltcG9ydCB0eXBlIHsgU3RlcFByb3BzIH0gZnJvbSBcIi4vTmV3R2FtZVwiO1xuXG5jb25zdCBDQVJEID0geyB3aWR0aDogMzc0LCBoZWlnaHQ6IDU1MSwgcGl0Y2g6IDQ0OCwgbGVmdDogMzEzLCB0b3A6IDE2OSB9O1xuXG4vKiogTElGRVBBVEg6IHRocmVlIHRhbGwgY2FyZHMsIGVhY2ggYSBsaXR0bGUgd29ybGQgZmlsbWVkIGludG8gYSBwb3J0YWwuXG4gKiAgVGhlIGhvdmVyZWQgb25lIGxpZ2h0cyB1cCBhbmQgdGVsbHMgaXRzIHN0b3J5IHVuZGVybmVhdGg7IGEgY2xpY2sgKG9yXG4gKiAgRW50ZXIpIGNob29zZXMgaXQuICovXG5leHBvcnQgZnVuY3Rpb24gTGlmZXBhdGgoeyBjaGFyYWN0ZXIsIG9uQ2hhbmdlLCBuZXh0LCBiYWNrIH06IFN0ZXBQcm9wcykge1xuICBjb25zdCBbaG90LCBzZXRIb3RdID0gdXNlU3RhdGUoXG4gICAgTWF0aC5tYXgoXG4gICAgICAwLFxuICAgICAgTElGRVBBVEhTLmZpbmRJbmRleCgobCkgPT4gbC5pZCA9PT0gY2hhcmFjdGVyLmxpZmVwYXRoKSxcbiAgICApLFxuICApO1xuICBjb25zdCBob3ZlciA9IChpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoaSA9PT0gaG90KSByZXR1cm47XG4gICAgc2Z4KFwiaG92ZXJcIik7XG4gICAgc2V0SG90KGkpO1xuICB9O1xuICBjb25zdCBwaWNrID0gKGk6IG51bWJlcikgPT4ge1xuICAgIG9uQ2hhbmdlKHsgLi4uY2hhcmFjdGVyLCBsaWZlcGF0aDogTElGRVBBVEhTW2ldLmlkIH0pO1xuICAgIG5leHQoKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikgYmFjaygpO1xuICAgIGVsc2UgaWYgKGUua2V5ID09PSBcIkFycm93TGVmdFwiKSBob3ZlcihNYXRoLm1heCgwLCBob3QgLSAxKSk7XG4gICAgZWxzZSBpZiAoZS5rZXkgPT09IFwiQXJyb3dSaWdodFwiKVxuICAgICAgaG92ZXIoTWF0aC5taW4oTElGRVBBVEhTLmxlbmd0aCAtIDEsIGhvdCArIDEpKTtcbiAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJFbnRlclwiIHx8IGUuY29kZSA9PT0gXCJLZXlGXCIpIHBpY2soaG90KTtcbiAgfSk7XG4gIHVzZURlYnVnKFwiaG92ZXJcIiwgKG4pID0+IHNldEhvdChOdW1iZXIobikpKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtGSUxMfT5cbiAgICAgIDxDaHJvbWUgLz5cbiAgICAgIDxIZWFkZXJcbiAgICAgICAgdGl0bGU9XCJMSUZFUEFUSFwiXG4gICAgICAgIGNhcHRpb249XCJXSEVSRSBZT1UgQ09NRSBGUk9NIERFQ0lERVMgV0hPIE9QRU5TIFRIRSBET09SIEZPUiBZT1UuIFNPTUUgSk9CUyBBTkQgQ09OVkVSU0FUSU9OUyBJTiBTQUJMRSBDSVRZIFdJTEwgQ0hBTkdFIFdJVEggVEhJUyBDSE9JQ0UuXCJcbiAgICAgICAgaWNvbj17PFN0ZXBJY29uIGtpbmQ9XCJsaWZlcGF0aFwiIC8+fVxuICAgICAgICBzdGVwPXswfVxuICAgICAgLz5cbiAgICAgIHtMSUZFUEFUSFMubWFwKChsLCBpKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBrZXk9e2wuaWR9XG4gICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IGhvdmVyKGkpfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHBpY2soaSl9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogQ0FSRC5sZWZ0ICsgaSAqIENBUkQucGl0Y2gsXG4gICAgICAgICAgICB0b3A6IENBUkQudG9wLFxuICAgICAgICAgICAgd2lkdGg6IENBUkQud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IENBUkQuaGVpZ2h0LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgIGxlZnQ6IDksXG4gICAgICAgICAgICAgIHRvcDogLTQ2LFxuICAgICAgICAgICAgICBmb250U2l6ZTogMzMsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7bC5uYW1lfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyAuLi5GSUxMLCBiYWNrZ3JvdW5kQ29sb3I6IFwiIzBjMGIxMlwiIH19IC8+XG4gICAgICAgICAgPHBvcnRhbCB0YXJnZXQ9e2BjYXJkLSR7bC5pZH1gfSBzdHlsZT17eyAuLi5GSUxMLCBjYWNoZTogXCJuZXZlclwiIH19IC8+XG4gICAgICAgICAge2kgPT09IGhvdCA/IDxIb3RGcmFtZSBiYXI9ezIwfSBjdXQ9ezQ2fSBzdGVwPXs5Nn0gLz4gOiA8Q29sZEZyYW1lIC8+fVxuICAgICAgICAgIHtpID09PSBob3QgJiYgKFxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgICBsZWZ0OiAtMixcbiAgICAgICAgICAgICAgICB0b3A6IENBUkQuaGVpZ2h0ICsgMTQsXG4gICAgICAgICAgICAgICAgd2lkdGg6IENBUkQud2lkdGggKyAyNCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMjQsXG4gICAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IDEuMTgsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtMSUZFUEFUSF9URVhUW2wuaWRdfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgICA8SGludHM+XG4gICAgICAgIDxIaW50IGs9XCJtb3VzZVwiIGxhYmVsPVwiU0VMRUNUXCIgLz5cbiAgICAgICAgPEhpbnQgaz1cIkVTQ1wiIGxhYmVsPVwiQkFDS1wiIG9uQ2xpY2s9e2JhY2t9IC8+XG4gICAgICA8L0hpbnRzPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICBpbnRlcnBvbGF0ZSxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhEZWxheSxcbiAgd2l0aFRpbWluZyxcbiAgdHlwZSBTaGFyZWRWYWx1ZSxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IHVzZUVudGVyLCB1c2VLZXlzIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEZJTEwsIEhlYWRlciwgSGludCwgSGludHMgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBJZENhcmQgfSBmcm9tIFwiLi9JZENhcmRcIjtcbmltcG9ydCB7IFN0ZXBJY29uIH0gZnJvbSBcIi4vZ2x5cGhzXCI7XG5pbXBvcnQgeyBDaHJvbWUsIE5hdkJ1dHRvbnMgfSBmcm9tIFwiLi9wYXJ0c1wiO1xuaW1wb3J0IHR5cGUgeyBTdGVwUHJvcHMgfSBmcm9tIFwiLi9OZXdHYW1lXCI7XG5cbmNvbnN0IFBBTkVMID0gXCIjY2I0MDNiXCI7XG5cbi8qKiBTVU1NQVJZOiB0aGUgZmluaXNoZWQgSUQgY2FyZCBhbmQgdGhlIEJJT01PTklUT1IgUEFORUwgc3luY2luZyB0byAxMDAlXG4gKiAgKGEgc2hhcmVkIHZhbHVlIEJldnkgcnVuczsgdGhlIGRpZ2l0cyByb2xsIG9uIGl0cyBjbG9jaykuIFNUQVJUIChvciBGKVxuICogIGJlZ2lucyB0aGUgZ2FtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdW1tYXJ5KHtcbiAgY2hhcmFjdGVyLFxuICBvbkNoYW5nZSxcbiAgYmFjayxcbiAgb25TdGFydCxcbn06IFN0ZXBQcm9wcyAmIHsgb25TdGFydDogKCkgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IFtlZGl0aW5nLCBzZXRFZGl0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2RvbmUsIHNldERvbmVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBlbnRlciA9IHVzZUVudGVyKDQwLCAxMjAsIDM2MCk7XG4gIGNvbnN0IHByb2dyZXNzID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcHJvZ3Jlc3MudmFsdWUgPSB3aXRoRGVsYXkoXG4gICAgICAzNTAsXG4gICAgICB3aXRoVGltaW5nKDEsIHsgZHVyYXRpb246IDI0MDAsIGVhc2luZzogXCJlYXNlSW5PdXRcIiB9KSxcbiAgICAgIChmaW5pc2hlZCkgPT4gZmluaXNoZWQgJiYgc2V0RG9uZSh0cnVlKSxcbiAgICApO1xuICB9LCBbcHJvZ3Jlc3NdKTtcbiAgY29uc3Qgc3RhcnQgPSAoKSA9PiB7XG4gICAgc2Z4KFwiY29uZmlybVwiKTtcbiAgICBvblN0YXJ0KCk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZWRpdGluZykgcmV0dXJuO1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikgYmFjaygpO1xuICAgIGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlGXCIgfHwgZS5rZXkgPT09IFwiRW50ZXJcIikgc3RhcnQoKTtcbiAgfSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8Q2hyb21lIC8+XG4gICAgICA8SGVhZGVyXG4gICAgICAgIHRpdGxlPVwiU1VNTUFSWVwiXG4gICAgICAgIGNhcHRpb249XCJUSEUgRklMRSBJUyBPUEVOLiBTQUJMRSBDSVRZIFdJTEwgV1JJVEUgVEhFIFJFU1QuXCJcbiAgICAgICAgaWNvbj17PFN0ZXBJY29uIGtpbmQ9XCJzdW1tYXJ5XCIgLz59XG4gICAgICAgIHN0ZXA9ezR9XG4gICAgICAvPlxuICAgICAgPElkQ2FyZFxuICAgICAgICBjaGFyYWN0ZXI9e2NoYXJhY3Rlcn1cbiAgICAgICAgb25DaGFuZ2U9e29uQ2hhbmdlfVxuICAgICAgICBvbkVkaXRpbmc9e3NldEVkaXRpbmd9XG4gICAgICAgIHN0eWxlPXt7IHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLCBsZWZ0OiA0MjAsIHRvcDogMTk2IH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICByaWdodDogMjE1LFxuICAgICAgICAgIHRvcDogMzYwLFxuICAgICAgICAgIC4uLmVudGVyLFxuICAgICAgICAgIHdpZHRoOiA1OTIsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBnYXA6IDYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogNiB9fT5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIgfX0+XG4gICAgICAgICAgICB7WzIyLCAxNCwgMjAsIDEwXS5tYXAoKHcsIGkpID0+IChcbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IHcsIGhlaWdodDogMiwgYmFja2dyb3VuZENvbG9yOiBDLnJlZERpbSB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA1LjUsIGNvbG9yOiBDLnJlZERpbSB9fT5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJCSU9NT05JVE9SIDcuMVxcbk5FVVJBTCBMSU5LIFNUQUJMRVxcbkNFUlRJRklFRCBTQ1BEIFVOSVRcXG5OTyBVU0VSIFNFUlZJQ0VBQkxFIFBBUlRTXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uY2hhbWZlcihcIiMxYjEwMTdcIiwgMzAsIFBBTkVMLCAyKSxcbiAgICAgICAgICAgIGhlaWdodDogMTgxLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogNDQsIHJpZ2h0OiAzNCwgdG9wOiAxNCwgYm90dG9tOiAxMiB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgICB3aWR0aDogMjYsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogUEFORUwsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICByaWdodDogLTIsXG4gICAgICAgICAgICAgIHRvcDogMjQsXG4gICAgICAgICAgICAgIGJvdHRvbTogNDAsXG4gICAgICAgICAgICAgIHdpZHRoOiA0LFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFBBTkVMLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMjksXG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBCSU9NT05JVE9SIFBBTkVMXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMjEsXG4gICAgICAgICAgICAgIGNvbG9yOiBkb25lID8gXCIjZDk0ODNmXCIgOiBcIiNiODNiMzVcIixcbiAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogMTQgfSxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ZG9uZSA/IFwiQ09NUExFVEVcIiA6IFwiQ0FMSUJSQVRJTkcuLi5cIn1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGhlaWdodDogMyxcbiAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogMTAsIHJpZ2h0OiA5NiB9LFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzNhMTUxYVwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGhlaWdodDogMyxcbiAgICAgICAgICAgICAgICB3aWR0aDogeyBhbmltYXRlZDogaW50ZXJwb2xhdGUocHJvZ3Jlc3MsIFswLCAxXSwgWzAsIDQxOF0pIH0sXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLnJlZCxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxIH19IC8+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLFxuICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDYuNSwgY29sb3I6IEMucmVkIH19PlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJPTkxZIFNDUEQtQ0VSVElGSUVEIEJJT1RFQ0hTIEFORCBDTEFTUy00IE9GRklDRVJTIE1BWVxcbkNBTElCUkFURSwgQUNDRVNTIE9SIERJU0FCTEUgVEhJUyBERVZJQ0UuXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPFBlcmNlbnQgdmFsdWU9e3Byb2dyZXNzfSAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPE5hdkJ1dHRvbnMgb25CYWNrPXtiYWNrfSBvbk5leHQ9e3N0YXJ0fSBuZXh0PVwiU1RBUlRcIiAvPlxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNFTEVDVFwiIC8+XG4gICAgICA8L0hpbnRzPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgRElHSVQgPSAxODtcbmNvbnN0IEVQUyA9IDAuMDAwMTtcblxuLyoqIFwiMDAwJVwiIHJvbGxpbmcgdXAgdG8gXCIxMDAlXCIgb24gYHZhbHVlYCAoMC4uMSk6IGVhY2ggZGlnaXQgaXMgYSBjb2x1bW5cbiAqICBvZiAwLTkgaW4gYSBjbGlwcGVkIHdpbmRvdywgc3RlcHBlZCBieSBhIHBpZWNld2lzZS1jb25zdGFudFxuICogIGBpbnRlcnBvbGF0ZWAg4oCUIG5vIFJlYWN0IHJlbmRlciBwZXIgdGljay4gKi9cbmZ1bmN0aW9uIFBlcmNlbnQoeyB2YWx1ZSB9OiB7IHZhbHVlOiBTaGFyZWRWYWx1ZSB9KSB7XG4gIGNvbnN0IGNvbHVtbiA9IChkaWdpdDogKGs6IG51bWJlcikgPT4gbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgaW5wdXQ6IG51bWJlcltdID0gW107XG4gICAgY29uc3Qgb3V0cHV0OiBudW1iZXJbXSA9IFtdO1xuICAgIGZvciAobGV0IGsgPSAwOyBrIDwgMTAwOyBrKyspIHtcbiAgICAgIGlucHV0LnB1c2goayAvIDEwMCwgKGsgKyAxKSAvIDEwMCAtIEVQUyk7XG4gICAgICBvdXRwdXQucHVzaCgtZGlnaXQoaykgKiBESUdJVCwgLWRpZ2l0KGspICogRElHSVQpO1xuICAgIH1cbiAgICByZXR1cm4gaW50ZXJwb2xhdGUodmFsdWUsIFsuLi5pbnB1dCwgMV0sIFsuLi5vdXRwdXQsIC1kaWdpdCgxMDApICogRElHSVRdKTtcbiAgfTtcbiAgY29uc3QgZGlnaXRzID0gW1xuICAgIChrOiBudW1iZXIpID0+IE1hdGguZmxvb3IoayAvIDEwMCksXG4gICAgKGs6IG51bWJlcikgPT4gTWF0aC5mbG9vcihrIC8gMTApICUgMTAsXG4gICAgKGs6IG51bWJlcikgPT4gayAlIDEwLFxuICBdO1xuICBjb25zdCBmb250ID0ge1xuICAgIGZvbnRTaXplOiAxOSxcbiAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgY29sb3I6IEMucmVkLFxuICAgIGxpbmVIZWlnaHQ6IHsgcHg6IERJR0lUIH0sXG4gIH0gYXMgY29uc3Q7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIG1hcmdpbjogeyBib3R0b206IDE4IH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtkaWdpdHMubWFwKChkLCBpKSA9PiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAga2V5PXtpfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogMTAuNSxcbiAgICAgICAgICAgIGhlaWdodDogRElHSVQsXG4gICAgICAgICAgICBvdmVyZmxvd1k6IFwiY2xpcFwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5mb250LFxuICAgICAgICAgICAgICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVZOiB7IGFuaW1hdGVkOiBjb2x1bW4oZCkgfSB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7XCIwXFxuMVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XCJ9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICApKX1cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmZvbnQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT4lPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUtleXMgfSBmcm9tIFwiLi4vLi4vaG9va3NcIjtcbmltcG9ydCB7IHNmeCB9IGZyb20gXCIuLi8uLi9zb3VuZFwiO1xuaW1wb3J0IHR5cGUgeyBTYXZlIH0gZnJvbSBcIi4uLy4uL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBQcm90b2NvbFN0YW1wIH0gZnJvbSBcIi4uLy4uL3VpL2RlY29yXCI7XG5pbXBvcnQgeyBGSUxMLCBIaW50LCBIaW50cyB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IFBsYXRlLCBtb2RhbE9wZW4gfSBmcm9tIFwiLi4vRGlhbG9nXCI7XG5pbXBvcnQgeyBEYXRhc2hhcmQgfSBmcm9tIFwiLi9pY29uc1wiO1xuaW1wb3J0IHtcbiAgTmV3U2F2ZVJvdyxcbiAgUk9XX0hFSUdIVCxcbiAgUk9XX1BJVENILFxuICBST1dfV0lEVEgsXG4gIFNhdmVSb3csXG4gIFRFWFRfTEVGVCxcbn0gZnJvbSBcIi4vUm93XCI7XG5cbmNvbnN0IExJU1RfVE9QID0gMTkwO1xuLyoqIFNldmVuIHJvd3M7IG1vcmUgc2Nyb2xsLiAqL1xuY29uc3QgTElTVF9IRUlHSFQgPSA3ICogUk9XX1BJVENIIC0gNDtcbi8qKiBCb3RoIHNpZGVzIG9mIHRoZSBsaXN0LCBzbyB0aGUgcm93cyBzdGF5IGNlbnRlcmVkIHdpdGggdGhlIHNjcm9sbGJhciBpblxuICogIHRoZSByaWdodCBvbmUuICovXG5jb25zdCBHVVRURVIgPSAyNDtcblxuLyoqIFRoZSBxdWVzdGlvbiBhIHBsYXRlIGlzIGFza2luZyBhYm91dCBhIHNsb3QuICovXG50eXBlIEFzayA9IHsga2luZDogXCJvdmVyd3JpdGVcIiB8IFwiZGVsZXRlXCI7IGluZGV4OiBudW1iZXIgfSB8IG51bGw7XG5cbmNvbnN0IFFVRVNUSU9OUyA9IHtcbiAgb3ZlcndyaXRlOlxuICAgIFwiV3JpdGUgb3ZlciB0aGlzIHNhdmU/XFxuV2hhdGV2ZXIgd2FzIG9uIHRoaXMgc2hhcmQgZ2V0cyBmbGF0bGluZWQuXCIsXG4gIGRlbGV0ZTogXCJEZWxldGUgdGhpcyBzYXZlIGZvciBnb29kP1xcblRoZXJlIGlzIG5vIGJhY2t1cC4gTm9ib2R5IGtlZXBzIG9uZS5cIixcbn07XG5cbi8qKiBMT0FEIEdBTUUgLyBTQVZFIEdBTUU6IHRoZSBzYXZlIHNsb3RzIChuZXdlc3QgZmlyc3QpLCBlYWNoIHdpdGggYVxuICogIHNuYXBzaG90IG9mIGl0cyB3b3JsZC4gSG92ZXIgc2VsZWN0cywgYSBjbGljayBsb2FkcyBvciBzYXZlcyAoYXNraW5nXG4gKiAgYmVmb3JlIG92ZXJ3cml0aW5nKSwgWCBkZWxldGVzIHRoZSBzZWxlY3RlZCBzbG90LCBFc2MgY2xvc2VzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNhdmVzKHtcbiAgbW9kZSxcbiAgc2F2ZXMsXG4gIG9uTG9hZCxcbiAgb25TYXZlLFxuICBvbkRlbGV0ZSxcbiAgb25DbG9zZSxcbn06IHtcbiAgbW9kZTogXCJsb2FkXCIgfCBcInNhdmVcIjtcbiAgc2F2ZXM6IFNhdmVbXTtcbiAgLyoqIEluIGdhbWUsIGxvYWRpbmcgYXNrcyBmaXJzdCAodW5zYXZlZCBwcm9ncmVzcyBpcyBsb3N0KS4gKi9cbiAgaW5HYW1lOiBib29sZWFuO1xuICBvbkxvYWQ6IChzYXZlOiBTYXZlKSA9PiB2b2lkO1xuICAvKiogU2F2ZSBpbnRvIGEgbmV3IHNsb3QgKGBudWxsYCkgb3Igb3ZlciBgb3ZlcndyaXRlYC4gKi9cbiAgb25TYXZlOiAob3ZlcndyaXRlOiBTYXZlIHwgbnVsbCkgPT4gdm9pZDtcbiAgb25EZWxldGU6IChzYXZlOiBTYXZlKSA9PiB2b2lkO1xuICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBzYXZpbmcgPSBtb2RlID09PSBcInNhdmVcIjtcbiAgLyoqIEluIHNhdmUgbW9kZSB0aGUgYmxhbmsgc2xvdCBjb21lcyBmaXJzdC4gKi9cbiAgY29uc3Qgc2xvdHM6IChTYXZlIHwgbnVsbClbXSA9IHNhdmluZyA/IFtudWxsLCAuLi5zYXZlc10gOiBzYXZlcztcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW2Fzaywgc2V0QXNrXSA9IHVzZVN0YXRlPEFzaz4obnVsbCk7XG4gIC8qKiBUaGUgbGlzdCdzIHNjcm9sbCBvZmZzZXQsIHRvIGxheSB0aGUgcGxhdGUgb3ZlciB0aGUgcmlnaHQgcm93LiAqL1xuICBjb25zdCBbc2Nyb2xsLCBzZXRTY3JvbGxdID0gdXNlU3RhdGUoMCk7XG5cbiAgY29uc3Qgc2VsZWN0ID0gKGk6IG51bWJlcikgPT4ge1xuICAgIGlmIChpID09PSBzZWxlY3RlZCkgcmV0dXJuO1xuICAgIHNmeChcImhvdmVyXCIpO1xuICAgIHNldFNlbGVjdGVkKGkpO1xuICB9O1xuICBjb25zdCBwaWNrID0gKGk6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHNhdmUgPSBzbG90c1tpXTtcbiAgICBzZngoXCJjbGlja1wiKTtcbiAgICBzZXRTZWxlY3RlZChpKTtcbiAgICBpZiAoIXNhdmluZykge1xuICAgICAgaWYgKHNhdmUpIG9uTG9hZChzYXZlKTtcbiAgICB9IGVsc2UgaWYgKHNhdmUpIHtcbiAgICAgIHNldEFzayh7IGtpbmQ6IFwib3ZlcndyaXRlXCIsIGluZGV4OiBpIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgZnJlc2ggc2F2ZSBsYW5kcyBvbiB0b3Agb2YgdGhlIGxpc3QsIHVuZGVyIHRoZSBibGFuayBzbG90LlxuICAgICAgb25TYXZlKG51bGwpO1xuICAgICAgc2V0U2VsZWN0ZWQoMSk7XG4gICAgfVxuICB9O1xuICBjb25zdCBhc2tEZWxldGUgPSAoKSA9PiB7XG4gICAgaWYgKCFzbG90c1tzZWxlY3RlZF0pIHJldHVybiBzZngoXCJlcnJvclwiKTtcbiAgICBzZngoXCJjbGlja1wiKTtcbiAgICBzZXRBc2soeyBraW5kOiBcImRlbGV0ZVwiLCBpbmRleDogc2VsZWN0ZWQgfSk7XG4gIH07XG4gIGNvbnN0IGFuc3dlciA9ICgpID0+IHtcbiAgICBjb25zdCBzYXZlID0gYXNrICYmIHNsb3RzW2Fzay5pbmRleF07XG4gICAgaWYgKCFzYXZlKSByZXR1cm47XG4gICAgaWYgKGFzay5raW5kID09PSBcIm92ZXJ3cml0ZVwiKSB7XG4gICAgICBvblNhdmUoc2F2ZSk7XG4gICAgICBzZXRTZWxlY3RlZCgxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb25EZWxldGUoc2F2ZSk7XG4gICAgICBzZXRTZWxlY3RlZChNYXRoLm1pbihzZWxlY3RlZCwgc2xvdHMubGVuZ3RoIC0gMikpO1xuICAgIH1cbiAgICBzZXRBc2sobnVsbCk7XG4gIH07XG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIHNmeChcImJhY2tcIik7XG4gICAgb25DbG9zZSgpO1xuICB9O1xuXG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAobW9kYWxPcGVuKCkpIHJldHVybjtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGNsb3NlKCk7XG4gICAgZWxzZSBpZiAoZS5jb2RlID09PSBcIktleVhcIikgYXNrRGVsZXRlKCk7XG4gIH0pO1xuICAvLyBgLS1zaG9vdGAgc3RlcHM6IGBob3ZlciA8cm93PmAsIGBwaWNrIDxyb3c+YCwgYGRlbGV0ZWAgKHRoZSBzZWxlY3RlZCkuXG4gIHVzZURlYnVnKFwiaG92ZXJcIiwgKGkpID0+IHNldFNlbGVjdGVkKE51bWJlcihpKSkpO1xuICB1c2VEZWJ1ZyhcInBpY2tcIiwgKGkpID0+IHBpY2soTnVtYmVyKGkpKSk7XG4gIHVzZURlYnVnKFwiZGVsZXRlXCIsIGFza0RlbGV0ZSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyAuLi5GSUxMLCBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgzLCA1LCA5LCAwLjQyKVwiIH19PlxuICAgICAgPERlY29yIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiBMSVNUX1RPUCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgb25TY3JvbGw9eyhlKSA9PiBzZXRTY3JvbGwoZS5zY3JvbGxUb3ApfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogUk9XX1dJRFRIICsgMiAqIEdVVFRFUixcbiAgICAgICAgICAgIGhlaWdodDogTElTVF9IRUlHSFQsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IEdVVFRFUiB9LFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIGdhcDogUk9XX1BJVENIIC0gUk9XX0hFSUdIVCxcbiAgICAgICAgICAgIG92ZXJmbG93WTogXCJzY3JvbGxcIixcbiAgICAgICAgICAgIHNjcm9sbGJhcldpZHRoOiBHVVRURVIsXG4gICAgICAgICAgICBzY3JvbGxiYXI6IHtcbiAgICAgICAgICAgICAgdHJhY2s6IHsgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMTQpXCIgfSxcbiAgICAgICAgICAgICAgdGh1bWI6IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICAgIGhvdmVyOiB7IGJhY2tncm91bmRDb2xvcjogQy5yZWRIaSB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0aGlja25lc3M6IDMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7c2xvdHMubWFwKChzYXZlLCBpKSA9PlxuICAgICAgICAgICAgc2F2ZSA/IChcbiAgICAgICAgICAgICAgPFNhdmVSb3dcbiAgICAgICAgICAgICAgICBrZXk9e3NhdmUuaWR9XG4gICAgICAgICAgICAgICAgc2F2ZT17c2F2ZX1cbiAgICAgICAgICAgICAgICBpbmRleD17aX1cbiAgICAgICAgICAgICAgICBzZWxlY3RlZD17aSA9PT0gc2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgb25TZWxlY3Q9eygpID0+IHNlbGVjdChpKX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBwaWNrKGkpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPE5ld1NhdmVSb3dcbiAgICAgICAgICAgICAgICBrZXk9XCJuZXdcIlxuICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtpID09PSBzZWxlY3RlZH1cbiAgICAgICAgICAgICAgICBvblNlbGVjdD17KCkgPT4gc2VsZWN0KGkpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHBpY2soaSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApLFxuICAgICAgICAgICl9XG4gICAgICAgICAge3Nsb3RzLmxlbmd0aCA9PT0gMCAmJiAoXG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17eyBmb250U2l6ZTogMjQsIGNvbG9yOiBDLnJlZERpbSwgbWFyZ2luOiB7IHRvcDogNDAgfSB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBObyBzYXZlIGRhdGEgb24gdGhpcyBkZWNrLlxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIm1vdXNlXCIgbGFiZWw9XCJTZWxlY3RcIiAvPlxuICAgICAgICA8SGludCBrPVwiWFwiIGxhYmVsPVwiRGVsZXRlIFNhdmVcIiBvbkNsaWNrPXthc2tEZWxldGV9IC8+XG4gICAgICAgIDxIaW50IGs9XCJFU0NcIiBsYWJlbD1cIkNsb3NlXCIgb25DbGljaz17Y2xvc2V9IC8+XG4gICAgICA8L0hpbnRzPlxuICAgICAge2FzayAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLkZJTEwsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxLCAyLCA1LCAwLjg4KVwiLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBmb2N1c1BvbGljeTogXCJibG9ja1wiLFxuICAgICAgICAgIH19XG4gICAgICAgICAgaG92ZXJTdHlsZT17e319XG4gICAgICAgID5cbiAgICAgICAgICB7LyogVGhlIGFza2VkLWFib3V0IHJvdydzIHBsYWNlOyB0aGUgcGxhdGUgY292ZXJzIGl0cyB0ZXh0LiAqL31cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IFJPV19XSURUSCxcbiAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogTElTVF9UT1AgKyBhc2suaW5kZXggKiBST1dfUElUQ0ggLSBzY3JvbGwgKyAxIH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxQbGF0ZVxuICAgICAgICAgICAgICB0ZXh0PXtRVUVTVElPTlNbYXNrLmtpbmRdfVxuICAgICAgICAgICAgICBpY29uPXs8RGF0YXNoYXJkIHdpZHRoPXsxMTh9IC8+fVxuICAgICAgICAgICAgICBvbkNvbmZpcm09e2Fuc3dlcn1cbiAgICAgICAgICAgICAgb25DYW5jZWw9eygpID0+IHNldEFzayhudWxsKX1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgbWFyZ2luOiB7IGxlZnQ6IFRFWFRfTEVGVCAtIDggfSB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICl9XG4gICAgICA8SGVhZGVyIHRpdGxlPXtzYXZpbmcgPyBcIlNBVkUgR0FNRVwiIDogXCJMT0FEIEdBTUVcIn0gLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgdGl0bGUgY2VudGVyZWQgdW5kZXIgYSBsb25nIHJlZCBhcmMsIHRoZSBwcm90b2NvbCBzdGFtcCB0b3AgbGVmdC4gKi9cbmZ1bmN0aW9uIEhlYWRlcih7IHRpdGxlIH06IHsgdGl0bGU6IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD1cIjAgMCAxOTIwIDEwMFwiXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgaGVpZ2h0OiAxMDAsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk0gMjAwIDYxLjcgUSAxMDQxLjcgMTE1LjMgMTg3OCA0N1wiXG4gICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPFByb3RvY29sU3RhbXAgc3R5bGU9e3sgbGVmdDogMzYsIHRvcDogNCB9fSAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMzYsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogNCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI2IDI2XCIgc3R5bGU9e3sgd2lkdGg6IDI2LCBoZWlnaHQ6IDI2IH19PlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1sxMywgMS41LCAyNC41LCAxMywgMTMsIDI0LjUsIDEuNSwgMTNdfVxuICAgICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHJlY3QgeD17Nn0geT17MTAuNX0gd2lkdGg9ezE0fSBoZWlnaHQ9ezV9IHJ4PXsxfSBmaWxsPXtDLnJlZH0gLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3sgLi4uVC5taWNybywgZm9udFNpemU6IDUsIGNvbG9yOiBDLnJlZCwgbGluZUhlaWdodDogMS4xNSB9fVxuICAgICAgICA+XG4gICAgICAgICAge1wiMDExMCAxMDFcXG4xMDAxIDExMFxcbjAxMTEgMDAxXFxuMTAxMCAwMTFcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250U2l6ZTogMzQsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgbWFyZ2luOiB7IGxlZnQ6IDQsIHRvcDogNiB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dGl0bGV9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIFRoZSByYWlsczogZmFpbnQgZGFzaGVzIGRvd24gYW4gZWRnZSAob25lIHBhdGgpLiAqL1xuY29uc3QgREFTSEVTID0gQXJyYXkuZnJvbShcbiAgeyBsZW5ndGg6IDEzNSB9LFxuICAoXywgaSkgPT4gYE0wICR7aSAqIDh9aDJ2NGgtMnpgLFxuKS5qb2luKFwiXCIpO1xuXG4vKiogVGhlIHNtYWxsIHByaW50OiBkb3R0ZWQgcmFpbHMgZG93biB0aGUgZWRnZXMgd2l0aCBhIHJlYWRvdXQgdHVybmVkIHVwXG4gKiAgdGhlIGxlZnQgb25lLCByZWFkb3V0cyBhbG9uZyB0aGUgYm90dG9tLiAqL1xuZnVuY3Rpb24gRGVjb3IoKSB7XG4gIGNvbnN0IG1pY3JvID0geyAuLi5ULm1pY3JvLCBmb250U2l6ZTogMTEsIGNvbG9yOiBDLnJlZERpbSB9O1xuICBjb25zdCByYWlsID0gKHNpZGU6IFwibGVmdFwiIHwgXCJyaWdodFwiKSA9PiAoXG4gICAgPHN2Z1xuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIFtzaWRlXTogMTgsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgd2lkdGg6IDIsXG4gICAgICAgIGhlaWdodDogMTA4MCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHBhdGggZD17REFTSEVTfSBmaWxsPVwicmdiYSgyNTUsIDkzLCA4MSwgMC4yKVwiIC8+XG4gICAgPC9zdmc+XG4gICk7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtyYWlsKFwibGVmdFwiKX1cbiAgICAgIHtyYWlsKFwicmlnaHRcIil9XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDEzLFxuICAgICAgICAgIHRvcDogNDI1LFxuICAgICAgICAgIHdpZHRoOiA2LFxuICAgICAgICAgIGhlaWdodDogNixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkRGltLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjcsXG4gICAgICAgICAgdG9wOiA0MjMsXG4gICAgICAgICAgd2lkdGg6IDE2LFxuICAgICAgICAgIGhlaWdodDogMTcsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLnJlZERlZXAsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4ubWljcm8sXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBjb2xvcjogXCIjZmZiM2FkXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDFcbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5taWNybyxcbiAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDE2IC0gMTUwLFxuICAgICAgICAgIHRvcDogNTc0LFxuICAgICAgICAgIHdpZHRoOiAzMDAsXG4gICAgICAgICAgdGV4dEFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgIHRyYW5zZm9ybTogeyByb3RhdGU6IC05MCB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICAwMDAzMiAwNSA1NCAwOCBDUCAwMDAzMiAwNSA1NCAwOCBDUFxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5taWNybyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiA1MixcbiAgICAgICAgICBib3R0b206IDI2LFxuICAgICAgICAgIHRyYW5zZm9ybTogeyByb3RhdGU6IC0yIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtcIjAwMDMyIDA1IDU0IDA4IENQICAwMDAzMiAwNSA1NCAwOCBDUFxcbjAwMDMyIDA1IDU0IDA4XCJ9XG4gICAgICA8L3RleHQ+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgYm90dG9tOiA4LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogNiwgaGVpZ2h0OiA2LCBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkRGltIH19IC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAxNixcbiAgICAgICAgICAgIGhlaWdodDogMTYsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLm1pY3JvLCBmb250RmFtaWx5OiBGLmJvbGQsIGZvbnRTaXplOiAxMCB9fT5CPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLm1pY3JvLCBtYXJnaW46IHsgbGVmdDogMzYgfSB9fT5cbiAgICAgICAgICBTQkwgMTAyIFROSyAxNTEgQ0MxMCBBNTVcbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17bWljcm99PjEwIEE1NSDihpA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUVudGVyIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBMSUZFUEFUSFMsIHBsYXl0aW1lLCB0eXBlIFNhdmUgfSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IERhdGFzaGFyZCwgTGlmZXBhdGhJY29uIH0gZnJvbSBcIi4vaWNvbnNcIjtcblxuZXhwb3J0IGNvbnN0IFJPV19XSURUSCA9IDEwMzU7XG5leHBvcnQgY29uc3QgUk9XX0hFSUdIVCA9IDEwNDtcbi8qKiBSb3cgdG8gcm93LCBweC4gKi9cbmV4cG9ydCBjb25zdCBST1dfUElUQ0ggPSBST1dfSEVJR0hUICsgNDtcbi8qKiBXaGVyZSBhIHJvdydzIHRleHQgc3RhcnRzLCBmcm9tIGl0cyBsZWZ0IGVkZ2UgKHRoZSBvdmVyd3JpdGUgcGxhdGUgbGFuZHNcbiAqICB0aGVyZSB0b28pLiAqL1xuZXhwb3J0IGNvbnN0IFRFWFRfTEVGVCA9IDE4NjtcblxuY29uc3QgUExBVEUgPSBcInJnYmEoMTMsIDE4LCAyNywgMC43NClcIjtcbmNvbnN0IExJTkUgPSBcInJnYmEoMjU1LCA5MywgODEsIDAuMjYpXCI7XG5cbi8qKiBPbmUgc2xvdCBvZiB0aGUgbGlzdDogYSBjdXQtY29ybmVyIHBsYXRlIG92ZXIgdGhlIHdvcmxkLCBmcmFtZWQgYnJpZ2h0XG4gKiAgcmVkIHdoaWxlIHNlbGVjdGVkICh0aGUgb25lIGhvdmVyZWQgbGFzdCkuIFNsaWRlcyBpbiB3aGVuIGl0IG1vdW50cywgc29cbiAqICBhIGZyZXNoIHNhdmUgYXJyaXZlcyB2aXNpYmx5LiAqL1xuZnVuY3Rpb24gU2xvdCh7XG4gIGluZGV4LFxuICBzZWxlY3RlZCxcbiAgb25TZWxlY3QsXG4gIG9uQ2xpY2ssXG4gIGNoaWxkcmVuLFxufToge1xuICBpbmRleDogbnVtYmVyO1xuICBzZWxlY3RlZDogYm9vbGVhbjtcbiAgb25TZWxlY3Q6ICgpID0+IHZvaWQ7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG59KSB7XG4gIGNvbnN0IGVudGVyID0gdXNlRW50ZXIoLTI4LCA0MCAqIE1hdGgubWluKGluZGV4LCA4KSk7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25Qb2ludGVyRW50ZXI9e29uU2VsZWN0fVxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLmNoYW1mZXIoUExBVEUsIDE2LCBzZWxlY3RlZCA/IEMucmVkIDogTElORSwgMiksXG4gICAgICAgIHdpZHRoOiBST1dfV0lEVEgsXG4gICAgICAgIGhlaWdodDogUk9XX0hFSUdIVCxcbiAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxIH0sXG4gICAgICAgIC4uLmVudGVyLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBUaGUgcGljdHVyZSB3ZWxsIGxlZnQgb2YgYSByb3c6IGZyYW1lZCwgaXRzIGNvcm5lciBjdXQgbGlrZSB0aGUgcm93J3MuICovXG5mdW5jdGlvbiBUaHVtYih7XG4gIHNlbGVjdGVkLFxuICBjaGlsZHJlbixcbn06IHtcbiAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLmNoYW1mZXIoXCJyZ2JhKDYsIDgsIDEzLCAwLjYpXCIsIDE0LCBzZWxlY3RlZCA/IEMucmVkIDogTElORSwgMSksXG4gICAgICAgIHdpZHRoOiAxNzAsXG4gICAgICAgIGhlaWdodDogOTYsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBsaW5lID0ge1xuICBmb250U2l6ZTogMjQsXG4gIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gIGNvbG9yOiBDLnJlZCxcbiAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxufSBhcyBjb25zdDtcblxuLyoqIEEgc2F2ZTogaXRzIHdvcmxkJ3Mgc25hcHNob3QsIHRoZSBxdWVzdCBhbmQgdGhlIHNsb3QncyBuYW1lLCB3aGVyZSBpdFxuICogIHdhcyBtYWRlLCB3aG8sIGhvdyBmYXIgYWxvbmcsIHdoZW4uICovXG5leHBvcnQgZnVuY3Rpb24gU2F2ZVJvdyh7XG4gIHNhdmUsXG4gIGluZGV4LFxuICBzZWxlY3RlZCxcbiAgb25TZWxlY3QsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIHNhdmU6IFNhdmU7XG4gIGluZGV4OiBudW1iZXI7XG4gIHNlbGVjdGVkOiBib29sZWFuO1xuICBvblNlbGVjdDogKCkgPT4gdm9pZDtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgeyBsaWZlcGF0aCB9ID0gc2F2ZS5jaGFyYWN0ZXI7XG4gIHJldHVybiAoXG4gICAgPFNsb3RcbiAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZH1cbiAgICAgIG9uU2VsZWN0PXtvblNlbGVjdH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgPlxuICAgICAgPFRodW1iIHNlbGVjdGVkPXtzZWxlY3RlZH0+XG4gICAgICAgIDxwb3J0YWxcbiAgICAgICAgICB0YXJnZXQ9e2BzaG90LSR7bGlmZXBhdGh9YH1cbiAgICAgICAgICBzdHlsZT17eyB3aWR0aDogMTY4LCBoZWlnaHQ6IDk0LCBjYWNoZTogXCJuZXZlclwiIH19XG4gICAgICAgIC8+XG4gICAgICA8L1RodW1iPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxNSwgcmlnaHQ6IDI2LCB0b3A6IDE0LCBib3R0b206IDcgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5saW5lLCBjb2xvcjogQy5jeWFuIH19PntzYXZlLnF1ZXN0fTwvdGV4dD5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5saW5lLCBtYXJnaW46IHsgaG9yaXpvbnRhbDogMTEgfSB9fT4tPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXtsaW5lfT57c2F2ZS5uYW1lfTwvdGV4dD5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXtsaW5lfT57cGxheXRpbWUoc2F2ZS5wbGF5dGltZSl9PC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4ubGluZSwgZm9udFNpemU6IDIzIH19PntzYXZlLmxvY2F0aW9ufTwvdGV4dD5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMjcgfX0gLz5cbiAgICAgICAgICA8TGlmZXBhdGhJY29uIGxpZmVwYXRoPXtsaWZlcGF0aH0gLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5saW5lLCBmb250U2l6ZTogMjMsIG1hcmdpbjogeyBsZWZ0OiA3IH0gfX0+XG4gICAgICAgICAgICB7TElGRVBBVEhTLmZpbmQoKGwpID0+IGwuaWQgPT09IGxpZmVwYXRoKT8ubmFtZX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4ubGluZSwgZm9udFNpemU6IDIzLCBtYXJnaW46IHsgbGVmdDogMjggfSB9fT5cbiAgICAgICAgICAgIExldmVsIHtzYXZlLmxldmVsfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmxpbmUsIGZvbnRTaXplOiAyMyB9fT57c2F2ZS5kYXRlfTwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgIDwvU2xvdD5cbiAgKTtcbn1cblxuLyoqIFRoZSBmaXJzdCBzbG90IHdoZW4gc2F2aW5nOiBhIGJsYW5rIGRhdGFzaGFyZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOZXdTYXZlUm93KHtcbiAgc2VsZWN0ZWQsXG4gIG9uU2VsZWN0LFxuICBvbkNsaWNrLFxufToge1xuICBzZWxlY3RlZDogYm9vbGVhbjtcbiAgb25TZWxlY3Q6ICgpID0+IHZvaWQ7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPFNsb3QgaW5kZXg9ezB9IHNlbGVjdGVkPXtzZWxlY3RlZH0gb25TZWxlY3Q9e29uU2VsZWN0fSBvbkNsaWNrPXtvbkNsaWNrfT5cbiAgICAgIDxUaHVtYiBzZWxlY3RlZD17c2VsZWN0ZWR9PlxuICAgICAgICA8RGF0YXNoYXJkIHdpZHRoPXsxMjh9IC8+XG4gICAgICAgIDxzdmdcbiAgICAgICAgICB2aWV3Qm94PVwiMCAwIDE0IDE0XCJcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICByaWdodDogMzAsXG4gICAgICAgICAgICB0b3A6IDEyLFxuICAgICAgICAgICAgd2lkdGg6IDE0LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHBvbHlsaW5lXG4gICAgICAgICAgICBwb2ludHM9e1s3LCAwLCA3LCAxNF19XG4gICAgICAgICAgICBzdHJva2U9e0MucmVkfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNH1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAgcG9pbnRzPXtbMCwgNywgMTQsIDddfVxuICAgICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjR9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICA8L1RodW1iPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5saW5lLFxuICAgICAgICAgIGZvbnRTaXplOiAyOSxcbiAgICAgICAgICBhbGlnblNlbGY6IFwiZmxleFN0YXJ0XCIsXG4gICAgICAgICAgbWFyZ2luOiB7IGxlZnQ6IDE1LCB0b3A6IDE1IH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIE5ldyBTYXZlXG4gICAgICA8L3RleHQ+XG4gICAgPC9TbG90PlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VEZWJ1ZywgdXNlS2V5cyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBULCBjaGFtZmVyIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBFZGdlUmFpbHMsIFByb3RvY29sU3RhbXAgfSBmcm9tIFwiLi4vLi4vdWkvZGVjb3JcIjtcbmltcG9ydCB7IEN1dEJ1dHRvbiwgRklMTCwgSGludCwgSGludHMsIEtleWNhcCB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB7IENvbnRyb2xTY2hlbWUgfSBmcm9tIFwiLi9Db250cm9sU2NoZW1lXCI7XG5pbXBvcnQgeyBDVVNUT00sIFBSRVNFVFMsIFRBQlMsIGRlZmF1bHRzLCB0eXBlIFRhYklkIH0gZnJvbSBcIi4vZGF0YVwiO1xuaW1wb3J0IHsgR2FtbWEgfSBmcm9tIFwiLi9HYW1tYVwiO1xuaW1wb3J0IHsgQmFja2Ryb3AsIFNldHRpbmdSb3cgfSBmcm9tIFwiLi9yb3dzXCI7XG5pbXBvcnQge1xuICBzZXRTZXR0aW5nLFxuICBzZXRTZXR0aW5ncyxcbiAgdXNlU2V0dGluZ3MsXG4gIHR5cGUgU2V0dGluZ1ZhbHVlLFxufSBmcm9tIFwiLi9zdG9yZVwiO1xuXG50eXBlIFN1YiA9IFwiZ2FtbWFcIiB8IFwiY29udHJvbHNcIiB8IG51bGw7XG5cbi8qKiBDaGFuZ2UgYSBzZXR0aW5nOyBHUkFQSElDUycgUXVpY2sgUHJlc2V0IHNldHMgdGhlIHJvd3MgaXQgZ292ZXJucywgYW5kXG4gKiAgdHdlYWtpbmcgb25lIG9mIHRob3NlIG1ha2VzIHRoZSBwcmVzZXQgQ3VzdG9tLiAqL1xuZnVuY3Rpb24gY2hhbmdlKGlkOiBzdHJpbmcsIHZhbHVlOiBTZXR0aW5nVmFsdWUpIHtcbiAgaWYgKGlkID09PSBcInByZXNldFwiKVxuICAgIHNldFNldHRpbmdzKHsgcHJlc2V0OiB2YWx1ZSwgLi4uUFJFU0VUU1tOdW1iZXIodmFsdWUpXSB9KTtcbiAgZWxzZSBpZiAoaWQgaW4gUFJFU0VUU1swXSkgc2V0U2V0dGluZ3MoeyBbaWRdOiB2YWx1ZSwgcHJlc2V0OiBDVVNUT00gfSk7XG4gIGVsc2Ugc2V0U2V0dGluZyhpZCwgdmFsdWUpO1xufVxuXG4vKiogU0VUVElOR1M6IGVpZ2h0IHRhYnMgb2Ygcm93cywgdGhlIGdhbW1hIGNvcnJlY3Rpb24gYW5kIGNvbnRyb2wgc2NoZW1lXG4gKiAgc2NyZWVucy4gWzFdL1szXSAob3IgUS9FKSBzd2l0Y2ggdGFicywgRjEgcmVzdG9yZXMgdGhlIHRhYidzIGRlZmF1bHRzLFxuICogIEVzYyBjbG9zZXMuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0dGluZ3MoeyBvbkNsb3NlIH06IHsgb25DbG9zZTogKCkgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZTxUYWJJZD4oXCJzb3VuZFwiKTtcbiAgY29uc3QgW3N1Yiwgc2V0U3ViXSA9IHVzZVN0YXRlPFN1Yj4obnVsbCk7XG4gIC8qKiBUaGUga2V5IGJpbmRpbmcgd2FpdGluZyBmb3IgYSBrZXkuICovXG4gIGNvbnN0IFtsaXN0ZW5pbmcsIHNldExpc3RlbmluZ10gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgdmFsdWVzID0gdXNlU2V0dGluZ3MoKTtcbiAgY29uc3QgaW5kZXggPSBUQUJTLmZpbmRJbmRleCgodCkgPT4gdC5pZCA9PT0gdGFiKTtcbiAgY29uc3Qgcm93cyA9IFRBQlNbaW5kZXhdLnJvd3M7XG5cbiAgY29uc3QgcGljayA9IChpZDogVGFiSWQpID0+IHtcbiAgICBpZiAoaWQgPT09IHRhYikgcmV0dXJuO1xuICAgIHNmeChcInRhYlwiKTtcbiAgICBzZXRMaXN0ZW5pbmcobnVsbCk7XG4gICAgc2V0VGFiKGlkKTtcbiAgfTtcbiAgY29uc3Qgc3RlcCA9IChkOiBudW1iZXIpID0+XG4gICAgcGljayhUQUJTWyhpbmRleCArIGQgKyBUQUJTLmxlbmd0aCkgJSBUQUJTLmxlbmd0aF0uaWQpO1xuICBjb25zdCByZXN0b3JlID0gKCkgPT4ge1xuICAgIHNmeChcImNvbmZpcm1cIik7XG4gICAgc2V0TGlzdGVuaW5nKG51bGwpO1xuICAgIHNldFNldHRpbmdzKGRlZmF1bHRzKHJvd3MpKTtcbiAgfTtcbiAgY29uc3Qgb3BlbiA9IChzOiBTdWIpID0+IHtcbiAgICBzZngoXCJjbGlja1wiKTtcbiAgICBzZXRMaXN0ZW5pbmcobnVsbCk7XG4gICAgc2V0U3ViKHMpO1xuICB9O1xuXG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoc3ViKSByZXR1cm47IC8vIHRoZSBzdWItc2NyZWVuIGhhcyB0aGUga2V5c1xuICAgIGlmIChsaXN0ZW5pbmcpIHtcbiAgICAgIGlmIChlLmtleSAhPT0gXCJFc2NhcGVcIikgc2V0U2V0dGluZyhsaXN0ZW5pbmcsIGUuY29kZSk7XG4gICAgICBzZngoZS5rZXkgPT09IFwiRXNjYXBlXCIgPyBcImJhY2tcIiA6IFwiY29uZmlybVwiKTtcbiAgICAgIHNldExpc3RlbmluZyhudWxsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3dpdGNoIChlLmNvZGUpIHtcbiAgICAgIGNhc2UgXCJFc2NhcGVcIjpcbiAgICAgICAgc2Z4KFwiYmFja1wiKTtcbiAgICAgICAgcmV0dXJuIG9uQ2xvc2UoKTtcbiAgICAgIGNhc2UgXCJEaWdpdDFcIjpcbiAgICAgIGNhc2UgXCJLZXlRXCI6XG4gICAgICAgIHJldHVybiBzdGVwKC0xKTtcbiAgICAgIGNhc2UgXCJEaWdpdDNcIjpcbiAgICAgIGNhc2UgXCJLZXlFXCI6XG4gICAgICAgIHJldHVybiBzdGVwKDEpO1xuICAgICAgY2FzZSBcIktleVpcIjpcbiAgICAgICAgcmV0dXJuIG9wZW4oXCJnYW1tYVwiKTtcbiAgICAgIGNhc2UgXCJLZXlYXCI6XG4gICAgICAgIHJldHVybiBvcGVuKFwiY29udHJvbHNcIik7XG4gICAgICBjYXNlIFwiRjFcIjpcbiAgICAgICAgcmV0dXJuIHJlc3RvcmUoKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFNjcmlwdGVkIHN0ZXBzIGZvciBgLS1zaG9vdGA6IGB0YWIgPGlkPmAsIGBzdWIgZ2FtbWF8Y29udHJvbHN8bm9uZWAsXG4gIC8vIGBzZXQgPGlkPiA8dmFsdWU+YCwgYGxpc3RlbiA8aWQ+YC5cbiAgdXNlRGVidWcoXCJ0YWJcIiwgKHQpID0+IHtcbiAgICBpZiAoVEFCUy5zb21lKCh4KSA9PiB4LmlkID09PSB0KSkgc2V0VGFiKHQgYXMgVGFiSWQpO1xuICB9KTtcbiAgdXNlRGVidWcoXCJzdWJcIiwgKHMpID0+IHNldFN1YihzID09PSBcIm5vbmVcIiA/IG51bGwgOiAocyBhcyBTdWIpKSk7XG4gIHVzZURlYnVnKFwic2V0XCIsIChhcmcpID0+IHtcbiAgICBjb25zdCBbaWQsIHZdID0gYXJnLnNwbGl0KFwiIFwiKTtcbiAgICBjaGFuZ2UoaWQsIHYgPT09IFwidHJ1ZVwiID8gdHJ1ZSA6IHYgPT09IFwiZmFsc2VcIiA/IGZhbHNlIDogTnVtYmVyKHYpKTtcbiAgfSk7XG4gIHVzZURlYnVnKFwibGlzdGVuXCIsIHNldExpc3RlbmluZyk7XG5cbiAgaWYgKHN1YiA9PT0gXCJnYW1tYVwiKSByZXR1cm4gPEdhbW1hIG9uQmFjaz17KCkgPT4gc2V0U3ViKG51bGwpfSAvPjtcbiAgaWYgKHN1YiA9PT0gXCJjb250cm9sc1wiKSByZXR1cm4gPENvbnRyb2xTY2hlbWUgb25CYWNrPXsoKSA9PiBzZXRTdWIobnVsbCl9IC8+O1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPEJhY2tkcm9wIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDM2LFxuICAgICAgICAgIHJpZ2h0OiAzNixcbiAgICAgICAgICB0b3A6IDg0LFxuICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4yKVwiLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxQcm90b2NvbFN0YW1wIHN0eWxlPXt7IGxlZnQ6IDM2LCB0b3A6IDcwIH19IC8+XG4gICAgICA8RWRnZVJhaWxzIC8+XG4gICAgICA8VGFicyB0YWI9e3RhYn0gb25QaWNrPXtwaWNrfSBvblN0ZXA9e3N0ZXB9IC8+XG4gICAgICB7LyogVGhlIGxpc3QsIGNlbnRyZWQsIHRoZSBzaWRlIGJ1dHRvbnMgaGFuZ2luZyBvZmYgaXRzIHJpZ2h0OiB0aGVcbiAgICAgICAgICBzcGFjZXIgb24gdGhlIGxlZnQgYmFsYW5jZXMgdGhlbSwgYW5kIGdpdmVzIHdheSBmaXJzdCBvbiBhXG4gICAgICAgICAgbmFycm93IHdpbmRvdy4gKi99XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiAxNTksXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDMxMCwgZmxleFNocmluazogMSB9fSAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgLy8gVGhlIGdsaXRjaCBldmVyeSB0YWIgY2hhbmdlIHJ1bnMgdGhyb3VnaCAoYSBjcm9zc2ZhZGUgd2l0aCBVSVxuICAgICAgICAgICAgLy8gZ2xpdGNoIGVmZmVjdHMgb2ZmKS5cbiAgICAgICAgICAgIG1vcnBoRmlsdGVyOiB7XG4gICAgICAgICAgICAgIGtleTogdGFiLFxuICAgICAgICAgICAgICBuYW1lOiB2YWx1ZXMudWlHbGl0Y2ggPyBcImdsaXRjaFN3YXBcIiA6IFwiY3Jvc3NmYWRlXCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogeyBtb3JwaEZpbHRlcjogeyBkdXJhdGlvbjogMjYwLCBlYXNpbmc6IFwibGluZWFyXCIgfSB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXt0YWJ9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogOTYyLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDcwMCxcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgICAgb3ZlcmZsb3dZOiBcInNjcm9sbFwiLFxuICAgICAgICAgICAgICBzY3JvbGxiYXI6IHtcbiAgICAgICAgICAgICAgICB0cmFjazogeyBiYWNrZ3JvdW5kQ29sb3I6IFwiIzJhMGQxMlwiIH0sXG4gICAgICAgICAgICAgICAgdGh1bWI6IHtcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjZjI0ZDQ3XCIsXG4gICAgICAgICAgICAgICAgICBob3ZlcjogeyBiYWNrZ3JvdW5kQ29sb3I6IEMucmVkSGkgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRoaWNrbmVzczogNCxcbiAgICAgICAgICAgICAgICBtaW5UaHVtYkxlbmd0aDogNDAsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgc2Nyb2xsU3RlcD17NDd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IDkyNSwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZmxleFNocmluazogMCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7cm93cy5tYXAoKHJvdywgaSkgPT4gKFxuICAgICAgICAgICAgICAgIDxTZXR0aW5nUm93XG4gICAgICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgICAgICByb3c9e3Jvd31cbiAgICAgICAgICAgICAgICAgIHZhbHVlcz17dmFsdWVzfVxuICAgICAgICAgICAgICAgICAgbGlzdGVuaW5nPXtsaXN0ZW5pbmd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17Y2hhbmdlfVxuICAgICAgICAgICAgICAgICAgb25MaXN0ZW49e3NldExpc3RlbmluZ31cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICBnYXA6IDI1LFxuICAgICAgICAgICAgbWFyZ2luOiB7IGxlZnQ6IDQzLCB0b3A6IDMwNyB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8U2lkZUJ1dHRvblxuICAgICAgICAgICAgbGFiZWw9XCJHQU1NQSBDT1JSRUNUSU9OXCJcbiAgICAgICAgICAgIGs9XCJaXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9wZW4oXCJnYW1tYVwiKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxTaWRlQnV0dG9uXG4gICAgICAgICAgICBsYWJlbD1cIkNPTlRST0wgU0NIRU1FXCJcbiAgICAgICAgICAgIGs9XCJYXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9wZW4oXCJjb250cm9sc1wiKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiA5MTcsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxDdXRCdXR0b24gbGFiZWw9XCJERUZBVUxUU1wiIHdpZHRoPXsyMDB9IGhlaWdodD17NTN9IG9uQ2xpY2s9e3Jlc3RvcmV9IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiAxMDQzLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA4IH19PlxuICAgICAgICAgIFNCTCAxMDIgQ0tDIDE1MSBDQzEwIEE1NVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAzMCA4XCIgc3R5bGU9e3sgd2lkdGg6IDMwLCBoZWlnaHQ6IDggfX0+XG4gICAgICAgICAgPHBvbHlnb24gcG9pbnRzPXtbMCwgNCwgOSwgMCwgOSwgOF19IGZpbGw9e0MucmVkRGltfSAvPlxuICAgICAgICAgIDxyZWN0IHg9ezl9IHk9ezN9IHdpZHRoPXsyMX0gaGVpZ2h0PXsyfSBmaWxsPXtDLnJlZERpbX0gLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICA8L25vZGU+XG4gICAgICA8QmFkZ2UgLz5cbiAgICAgIDxIaW50cz5cbiAgICAgICAgPEhpbnQgaz1cIkVTQ1wiIGxhYmVsPVwiQ2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfSAvPlxuICAgICAgICA8SGludCBrPVwiRjFcIiBsYWJlbD1cIlJlc3RvcmUgRGVmYXVsdHNcIiBvbkNsaWNrPXtyZXN0b3JlfSAvPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNlbGVjdFwiIC8+XG4gICAgICA8L0hpbnRzPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSB0YWIgYmFyOiBbMV0g4oC5dGFic+KAuiBbM10sIHRoZSBjdXJyZW50IG9uZSBjeWFuLiAqL1xuZnVuY3Rpb24gVGFicyh7XG4gIHRhYixcbiAgb25QaWNrLFxuICBvblN0ZXAsXG59OiB7XG4gIHRhYjogVGFiSWQ7XG4gIG9uUGljazogKGlkOiBUYWJJZCkgPT4gdm9pZDtcbiAgb25TdGVwOiAoZDogbnVtYmVyKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIHRvcDogMzAsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDQyLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IG9uU3RlcCgtMSl9PlxuICAgICAgICA8S2V5Y2FwIGs9XCIxXCIgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAyMiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fT5cbiAgICAgICAge1RBQlMubWFwKCh0KSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAga2V5PXt0LmlkfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QaWNrKHQuaWQpfVxuICAgICAgICAgICAgc3R5bGU9e3sgaGVpZ2h0OiAzNiwganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIgfX1cbiAgICAgICAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCA5MywgODEsIDAuMDYpXCIgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAyNCxcbiAgICAgICAgICAgICAgICBjb2xvcjogdC5pZCA9PT0gdGFiID8gQy5jeWFuIDogQy5yZWQsXG4gICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dC5sYWJlbH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IG9uU3RlcCgxKX0+XG4gICAgICAgIDxLZXljYXAgaz1cIjNcIiAvPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBTSURFX0ZSQU1FID0gXCIjNWIxYTIwXCI7XG5cbi8qKiBHQU1NQSBDT1JSRUNUSU9OIC8gQ09OVFJPTCBTQ0hFTUU6IGEgcGxhdGUgd2l0aCBhIHJhaXNlZCB0YWIgb24gaXRzIHRvcFxuICogIGVkZ2UgYW5kIGEgcmFpbCBkb3duIGl0cyBsZWZ0LiAqL1xuZnVuY3Rpb24gU2lkZUJ1dHRvbih7XG4gIGxhYmVsLFxuICBrLFxuICBvbkNsaWNrLFxufToge1xuICBsYWJlbDogc3RyaW5nO1xuICBrOiBzdHJpbmc7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvbiBvbkNsaWNrPXtvbkNsaWNrfSBzdHlsZT17eyB3aWR0aDogMjU1LCBoZWlnaHQ6IDQ5IH19PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKEMuYnV0dG9uLCAxMCwgU0lERV9GUkFNRSwgMSksXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICB0b3A6IDQsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJmbGV4RW5kXCIsXG4gICAgICAgICAgZ2FwOiAxNCxcbiAgICAgICAgICBwYWRkaW5nOiB7IHJpZ2h0OiAxNCB9LFxuICAgICAgICB9fVxuICAgICAgICBob3ZlclN0eWxlPXtjaGFtZmVyKFwiIzFhMWEyY1wiLCAxMCwgQy5jeWFuLCAxKX1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiA0LFxuICAgICAgICAgICAgdG9wOiA1LFxuICAgICAgICAgICAgYm90dG9tOiA1LFxuICAgICAgICAgICAgd2lkdGg6IDIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFNJREVfRlJBTUUsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDIxLCBjb2xvcjogQy5jeWFuLCBsZXR0ZXJTcGFjaW5nOiAwLjQgfX0+XG4gICAgICAgICAge2xhYmVsfVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDxLZXljYXAgaz17a30gLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihDLmJ1dHRvbiwgNSwgU0lERV9GUkFNRSwgMSwgXCJ0clwiKSxcbiAgICAgICAgICBib3JkZXI6IHsgdG9wOiAxLCBsZWZ0OiAxLCByaWdodDogMSB9LFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHdpZHRoOiA3MixcbiAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogVGhlIHZlcnNpb24gYmFkZ2UgYW5kIHRoZSBzbWFsbCBwcmludCwgYm90dG9tIGxlZnQuICovXG5mdW5jdGlvbiBCYWRnZSgpIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiA1MCxcbiAgICAgICAgICB0b3A6IDk5MyxcbiAgICAgICAgICB3aWR0aDogMjgsXG4gICAgICAgICAgaGVpZ2h0OiAzOCxcbiAgICAgICAgICBib3JkZXI6IDIsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkRGltLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogNCxcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICBmb250U2l6ZTogMTQsXG4gICAgICAgICAgICBjb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAgICBsaW5lSGVpZ2h0OiAwLjk1LFxuICAgICAgICAgICAgdGV4dEFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7XCJWXFxuODVcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5ULm1pY3JvLFxuICAgICAgICAgIGZvbnRTaXplOiA3LFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDg2LFxuICAgICAgICAgIHRvcDogOTk4LFxuICAgICAgICAgIHdpZHRoOiA0NjAsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtcbiAgICAgICAgICBcIlRoZSBkYXRhIHlvdSBlbnRlciBvbiBhbiBTQ1BEIHRlcm1pbmFsIHdpbGwgb25seSBiZSB1c2VkIGZvciB0aGUgcHVycG9zZSB5b3UgZW50ZXJlZCBpdCBmb3IuIFlvdXIgcGVyc29uYWwgZGF0YSBpcyBwcm90ZWN0ZWQgaW4gYWNjb3JkYW5jZSB3aXRoIHRoZSAyMDg4IFByaXZhY3kgQWN0LCB0aGUgU2FibGUgQ2l0eSBDaGFydGVyIGFuZCBUZW5rYWkgQ29ycG9yYXRlIFBvbGljeSA3LiBUZXJtaW5hbCBzZXNzaW9ucyBtYXkgYmUgcmV0YWluZWQgZm9yIHRoZSBsZW5ndGggb2YgeW91ciByZXNpZGVuY3kuXCJcbiAgICAgICAgfVxuICAgICAgPC90ZXh0PlxuICAgIDwvPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJldnlTdHlsZSwgUG9pbnRlckV2ZW50RGF0YSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYsIFQsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEFycm93LCBNb3VzZUljb24gfSBmcm9tIFwiLi4vLi4vdWkvaWNvbnNcIjtcbmltcG9ydCB7IEtleWNhcCB9IGZyb20gXCIuLi8uLi91aS9raXRcIjtcbmltcG9ydCB0eXBlIHsgUm93LCBTbGlkZXIgfSBmcm9tIFwiLi9kYXRhXCI7XG5pbXBvcnQgdHlwZSB7IFNldHRpbmdWYWx1ZSB9IGZyb20gXCIuL3N0b3JlXCI7XG5cbi8vIFRoZSBzZXR0aW5ncycgYnVpbGRpbmcgYmxvY2tzOiB0aGUgcm93cyBhbmQgdGhlaXIgd2lkZ2V0cyAoYSBzZWxlY3RvciwgYW5cbi8vIE9GRi9PTiBzd2l0Y2gsIGEgc2xpZGVyLCBhIGtleSBiaW5kaW5nKSwgcGx1cyB0aGUgYmFja2Ryb3AgYW5kIHN0YWdlIGV2ZXJ5XG4vLyBzZXR0aW5ncyBzY3JlZW4gc2l0cyBvbi5cblxuLyoqIFRoZSB3aWRnZXQgY29sdW1uLiAqL1xuY29uc3QgV0lEVEggPSA0NTA7XG4vKiogQSBwbGF0ZSdzIGRpbSByZWQgZnJhbWUsIGFuZCB0aGUgYnJpZ2h0ZXIgb25lIHVuZGVyIHRoZSBwb2ludGVyLiAqL1xuY29uc3QgRlJBTUUgPSBcIiM1NTE2MWNcIjtcbmNvbnN0IEZSQU1FX0hPVCA9IFwiI2E4MzIyZlwiO1xuY29uc3QgVkFMVUU6IEJldnlTdHlsZSA9IHsgZm9udFNpemU6IDIxLCBjb2xvcjogQy5jeWFuLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfTtcblxuLyoqIFRoZSAxOTIwIHB4IHdpZGUgY2FudmFzIHRoZSBzY3JlZW5zIGFyZSBkcmF3biBvbiAodGhlIHJlZmVyZW5jZSBsYXlvdXQnc1xuICogIGNvb3JkaW5hdGVzKSwgY2VudHJlZCB3aGF0ZXZlciB0aGUgd2luZG93J3MgYXNwZWN0LiAqL1xuZXhwb3J0IGNvbnN0IFNUQUdFOiBCZXZ5U3R5bGUgPSB7XG4gIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICB0b3A6IDAsXG4gIGJvdHRvbTogMCxcbiAgbGVmdDogXCI1MCVcIixcbiAgd2lkdGg6IDE5MjAsXG4gIG1hcmdpbjogeyBsZWZ0OiAtOTYwIH0sXG59O1xuXG4vKiogVGhlIHNldHRpbmdzJyBvd24gZGFyayBiYWNrZHJvcDogd2luZSByZWQgYXQgdGhlIHRvcCBmYWRpbmcgaW50byBibHVlLVxuICogIGJsYWNrLCBhIGJyZWF0aCBvZiB0aGUgZGF0YXNjYXBlIHN0aWxsIHNob3dpbmcgdGhyb3VnaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCYWNrZHJvcCgpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoNTYsIDE5LCAyNywgMC45OClcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDMzLCAxMywgMjEsIDAuOTgpXCIsIHBvc2l0aW9uOiBcIjIyJVwiIH0sXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoMTMsIDgsIDE1LCAwLjk4KVwiLCBwb3NpdGlvbjogXCI0NSVcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDUsIDksIDE0LCAwLjk4KVwiLCBwb3NpdGlvbjogXCI2NSVcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDYsIDE0LCAxOSwgMC45OClcIiB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9fVxuICAgIC8+XG4gICk7XG59XG5cbi8qKiBBIHN1Yi1zY3JlZW4ncyB0aXRsZSwgY2VudHJlZCBvdmVyIGEgbG9uZyByZWQgcnVsZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdWJIZWFkZXIoeyB0aXRsZSB9OiB7IHRpdGxlOiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDM2LFxuICAgICAgICAgIHJpZ2h0OiAzNixcbiAgICAgICAgICB0b3A6IDcwLFxuICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4zMilcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiAzMixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiA4LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjAgMjBcIiBzdHlsZT17eyB3aWR0aDogMzAsIGhlaWdodDogMzAgfX0+XG4gICAgICAgICAgPHBvbHlnb25cbiAgICAgICAgICAgIHBvaW50cz17WzEwLCAxLCAxOSwgMTAsIDEwLCAxOSwgMSwgMTBdfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtDLnJlZH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8Y2lyY2xlIGN4PXs3LjV9IGN5PXs4LjV9IHI9ezEuNn0gZmlsbD1cIm5vbmVcIiBzdHJva2U9e0MucmVkfSAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezEyLjV9IGN5PXsxMS41fSByPXsxLjZ9IGZpbGw9XCJub25lXCIgc3Ryb2tlPXtDLnJlZH0gLz5cbiAgICAgICAgICA8bGluZSB4MT17OX0geTE9ezkuNX0geDI9ezExfSB5Mj17MTAuNX0gc3Ryb2tlPXtDLnJlZH0gLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGZvbnRTaXplOiA2LCBsaW5lSGVpZ2h0OiAxLjEgfX0+XG4gICAgICAgICAge1wiNDg0ODE4MVxcbjQxNTU2ODFcXG5CMDBMMzY0XFxuMzA2MTIzM1wifVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQudGl0bGUsIGZvbnRTaXplOiAzMCB9fT57dGl0bGV9PC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvPlxuICApO1xufVxuXG4vKiogQSBzZWN0aW9uIGhlYWRlcjogYSB0ZWFsIHJ1bGUgb3ZlciBhIGxpZ2h0ZXIgYmFuZCwgdGhlIG5hbWUgaW4gd2hpdGUuICovXG5mdW5jdGlvbiBTZWN0aW9uKHsgbGFiZWwgfTogeyBsYWJlbDogc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBtYXJnaW46IHsgdG9wOiA3LCBib3R0b206IDggfSB9fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgaGVpZ2h0OiAyLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGFuZ2xlOiA5MCxcbiAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgIHsgY29sb3I6IFwiIzJjMWEyNFwiIH0sXG4gICAgICAgICAgICAgIHsgY29sb3I6IFwiIzM0ODQ3YVwiLCBwb3NpdGlvbjogXCIyNSVcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiMyYTNlNjZcIiwgcG9zaXRpb246IFwiNDglXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCIjMmMxYTRhXCIgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGhlaWdodDogNDAsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDExIH0sXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoNDAsIDQ2LCA3MCwgMC4yMilcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHQgc3R5bGU9e1Quc2VjdGlvbn0+e2xhYmVsfTwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBPbmUgc2V0dGluZzogdGhlIGxhYmVsIGluIHJlZCwgdGhlIHdpZGdldCBpbiB0aGUgcmlnaHQtaGFuZCBjb2x1bW4uICovXG5leHBvcnQgZnVuY3Rpb24gU2V0dGluZ1Jvdyh7XG4gIHJvdyxcbiAgdmFsdWVzLFxuICBsaXN0ZW5pbmcsXG4gIG9uQ2hhbmdlLFxuICBvbkxpc3Rlbixcbn06IHtcbiAgcm93OiBSb3c7XG4gIHZhbHVlczogUmVjb3JkPHN0cmluZywgU2V0dGluZ1ZhbHVlPjtcbiAgLyoqIFRoZSBrZXkgYmluZGluZyB3YWl0aW5nIGZvciBhIGtleSwgaWYgYW55LiAqL1xuICBsaXN0ZW5pbmc6IHN0cmluZyB8IG51bGw7XG4gIG9uQ2hhbmdlOiAoaWQ6IHN0cmluZywgdmFsdWU6IFNldHRpbmdWYWx1ZSkgPT4gdm9pZDtcbiAgb25MaXN0ZW46IChpZDogc3RyaW5nKSA9PiB2b2lkO1xufSkge1xuICBpZiAocm93LmtpbmQgPT09IFwic2VjdGlvblwiKSByZXR1cm4gPFNlY3Rpb24gbGFiZWw9e3Jvdy5sYWJlbH0gLz47XG4gIGxldCB3aWRnZXQ6IFJlYWN0Tm9kZTtcbiAgc3dpdGNoIChyb3cua2luZCkge1xuICAgIGNhc2UgXCJzZWxlY3RcIjpcbiAgICAgIHdpZGdldCA9IChcbiAgICAgICAgPFNlbGVjdG9yXG4gICAgICAgICAgb3B0aW9ucz17cm93Lm9wdGlvbnN9XG4gICAgICAgICAgdmFsdWU9e051bWJlcih2YWx1ZXNbcm93LmlkXSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBvbkNoYW5nZShyb3cuaWQsIHYpfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJ0b2dnbGVcIjpcbiAgICAgIHdpZGdldCA9IChcbiAgICAgICAgPFRvZ2dsZVxuICAgICAgICAgIHZhbHVlPXt2YWx1ZXNbcm93LmlkXSA9PT0gdHJ1ZX1cbiAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IG9uQ2hhbmdlKHJvdy5pZCwgdil9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInNsaWRlclwiOlxuICAgICAgd2lkZ2V0ID0gKFxuICAgICAgICA8U2xpZGVyQmFyXG4gICAgICAgICAgcm93PXtyb3d9XG4gICAgICAgICAgdmFsdWU9e051bWJlcih2YWx1ZXNbcm93LmlkXSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBvbkNoYW5nZShyb3cuaWQsIHYpfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJrZXlcIjpcbiAgICAgIHdpZGdldCA9IChcbiAgICAgICAgPEtleUJpbmRcbiAgICAgICAgICBjb2RlPXtTdHJpbmcodmFsdWVzW3Jvdy5pZF0pfVxuICAgICAgICAgIGxpc3RlbmluZz17bGlzdGVuaW5nID09PSByb3cuaWR9XG4gICAgICAgICAgb25MaXN0ZW49eygpID0+IG9uTGlzdGVuKHJvdy5pZCl9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImluZm9cIjpcbiAgICAgIHdpZGdldCA9IDxJbmZvIHZhbHVlPXtyb3cudmFsdWV9IC8+O1xuICB9XG4gIHJldHVybiA8Um93RnJhbWUgbGFiZWw9e3Jvdy5sYWJlbH0+e3dpZGdldH08L1Jvd0ZyYW1lPjtcbn1cblxuLyoqIEEgcm93J3MgZnJhbWU6IDQ3IHB4LCBsaXQgZmFpbnRseSB1bmRlciB0aGUgcG9pbnRlci4gVGhlIGxhYmVsIHJpZGVzIGFcbiAqICBsaXR0bGUgYWJvdmUgdGhlIHdpZGdldCdzIGNlbnRyZSwgbGlrZSB0aGUgZ2FtZSdzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJvd0ZyYW1lKHtcbiAgbGFiZWwsXG4gIGNoaWxkcmVuLFxufToge1xuICBsYWJlbDogc3RyaW5nO1xuICBjaGlsZHJlbjogUmVhY3ROb2RlO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2Z4KFwiaG92ZXJcIil9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBoZWlnaHQ6IDQ3LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAyMCwgcmlnaHQ6IDI1IH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsIDkzLCA4MSwgMC4wNSlcIiB9fVxuICAgID5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubGFiZWwsIG1hcmdpbjogeyBib3R0b206IDE0IH0gfX0+e2xhYmVsfTwvdGV4dD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgZGFyayBwbGF0ZSB1bmRlciBhIHNlbGVjdG9yLCBzbGlkZXIgb3Iga2V5IGJpbmRpbmcuICovXG5mdW5jdGlvbiBwbGF0ZShsaW5lID0gRlJBTUUpOiBCZXZ5U3R5bGUge1xuICByZXR1cm4geyAuLi5jaGFtZmVyKEMuZmllbGQsIDEwLCBsaW5lLCAxKSwgd2lkdGg6IFdJRFRILCBoZWlnaHQ6IDQwIH07XG59XG5cbi8qKiBg4peBIHZhbHVlIOKWt2AsIHdpdGggYSBwaXAgcGVyIG9wdGlvbiB1bmRlciB0aGUgdmFsdWUuICovXG5mdW5jdGlvbiBTZWxlY3Rvcih7XG4gIG9wdGlvbnMsXG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbn06IHtcbiAgb3B0aW9uczogc3RyaW5nW107XG4gIHZhbHVlOiBudW1iZXI7XG4gIG9uQ2hhbmdlOiAodmFsdWU6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3Qgc3RlcCA9IChkOiBudW1iZXIpID0+IHtcbiAgICBzZngoXCJjbGlja1wiKTtcbiAgICBvbkNoYW5nZSgodmFsdWUgKyBkICsgb3B0aW9ucy5sZW5ndGgpICUgb3B0aW9ucy5sZW5ndGgpO1xuICB9O1xuICBjb25zdCBwaXAgPSBNYXRoLm1pbigyMCwgKDI4MCAtIDQgKiAob3B0aW9ucy5sZW5ndGggLSAxKSkgLyBvcHRpb25zLmxlbmd0aCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLnBsYXRlKCksXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDIxIH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17cGxhdGUoRlJBTUVfSE9UKX1cbiAgICA+XG4gICAgICA8QXJyb3dCdXR0b24gZGlyPVwibGVmdFwiIG9uQ2xpY2s9eygpID0+IHN0ZXAoLTEpfSAvPlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVkFMVUUsIG1hcmdpbjogeyBib3R0b206IDUgfSB9fT57b3B0aW9uc1t2YWx1ZV19PC90ZXh0PlxuICAgICAgPEFycm93QnV0dG9uIGRpcj1cInJpZ2h0XCIgb25DbGljaz17KCkgPT4gc3RlcCgxKX0gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICBib3R0b206IDUsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtvcHRpb25zLm1hcCgoXywgaSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogcGlwLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDIsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogaSA9PT0gdmFsdWUgPyBcIiNlOTRhNDJcIiA6IFwiIzRhMWQyNFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIEFycm93QnV0dG9uKHtcbiAgZGlyLFxuICBvbkNsaWNrLFxufToge1xuICBkaXI6IFwibGVmdFwiIHwgXCJyaWdodFwiO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogMzIsXG4gICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoOTQsIDI0NiwgMjU1LCAwLjA4KVwiIH19XG4gICAgPlxuICAgICAgPEFycm93IGRpcj17ZGlyfSAvPlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogT0ZGIHwgT046IHRoZSBjaG9zZW4gaGFsZiBsaXQgKHJlZCBPRkYsIGN5YW4gT04pLCB0aGUgb3RoZXIgYWxsIGJ1dFxuICogIGdvbmUuICovXG5mdW5jdGlvbiBUb2dnbGUoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG59OiB7XG4gIHZhbHVlOiBib29sZWFuO1xuICBvbkNoYW5nZTogKHZhbHVlOiBib29sZWFuKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBoYWxmID0gKG9uOiBib29sZWFuKSA9PiB7XG4gICAgY29uc3QgbGl0ID0gdmFsdWUgPT09IG9uO1xuICAgIGNvbnN0IFtmaWxsLCBsaW5lLCBpbmtdID0gb25cbiAgICAgID8gbGl0XG4gICAgICAgID8gW0MuY3lhbiwgQy5jeWFuSGksIFwiIzA2MTQxYVwiXVxuICAgICAgICA6IFtcIiMwYTFkMjBcIiwgXCIjMGYyYTJmXCIsIFwiIzEyMzUzYlwiXVxuICAgICAgOiBsaXRcbiAgICAgICAgPyBbXCIjOTMyZDJhXCIsIFwiI2M3M2QzOFwiLCBcIiNmZjZmNjRcIl1cbiAgICAgICAgOiBbXCIjMWEwYzEwXCIsIFwiIzJhMGUxM1wiLCBcIiMzZDExMTZcIl07XG4gICAgcmV0dXJuIChcbiAgICAgIDxidXR0b25cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIHNmeChcImNsaWNrXCIpO1xuICAgICAgICAgIG9uQ2hhbmdlKG9uKTtcbiAgICAgICAgfX1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5jaGFtZmVyKGZpbGwsIDEwLCBsaW5lLCAxLCBvbiA/IFwiYnJcIiA6IFwiYmxcIiksXG4gICAgICAgICAgd2lkdGg6IDIyMixcbiAgICAgICAgICBoZWlnaHQ6IDM4LFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRTaXplOiAyMCxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICAgIGNvbG9yOiBpbmssXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAwLjUsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtvbiA/IFwiT05cIiA6IFwiT0ZGXCJ9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvYnV0dG9uPlxuICAgICk7XG4gIH07XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiBXSURUSCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtoYWxmKGZhbHNlKX1cbiAgICAgIHtoYWxmKHRydWUpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSB2YWx1ZSBjZW50cmVkIG9uIGEgcGxhdGUsIGEgcmVkIGJsb2NrIG1hcmtpbmcgd2hlcmUgaXQgc2l0czsgY2xpY2tcbiAqICBvciBkcmFnIGFueXdoZXJlIG9uIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNsaWRlckJhcih7XG4gIHJvdyxcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlLFxufToge1xuICByb3c6IFNsaWRlcjtcbiAgdmFsdWU6IG51bWJlcjtcbiAgb25DaGFuZ2U6ICh2YWx1ZTogbnVtYmVyKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCB7IG1pbiwgbWF4LCBzdGVwIH0gPSByb3c7XG4gIGNvbnN0IGRlY2ltYWxzID0gTWF0aC5tYXgoMCwgLU1hdGguZmxvb3IoTWF0aC5sb2cxMChzdGVwKSkpO1xuICBjb25zdCBzZXQgPSAoZTogUG9pbnRlckV2ZW50RGF0YSkgPT4ge1xuICAgIC8vIFRoZSBibG9jaydzIGNlbnRyZSB0cmF2ZWxzIGZyb20gMjAgcHggaW4gdG8gMjAgcHggZnJvbSB0aGUgZW5kLlxuICAgIGNvbnN0IHQgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCAoZS54ICogV0lEVEggLSAyMCkgLyAoV0lEVEggLSA0MCkpKTtcbiAgICBjb25zdCBuZXh0ID0gTnVtYmVyKFxuICAgICAgKE1hdGgucm91bmQoKG1pbiArIHQgKiAobWF4IC0gbWluKSkgLyBzdGVwKSAqIHN0ZXApLnRvRml4ZWQoZGVjaW1hbHMpLFxuICAgICk7XG4gICAgaWYgKG5leHQgIT09IHZhbHVlKSBvbkNoYW5nZShuZXh0KTtcbiAgfTtcbiAgY29uc3QgbGVmdCA9ICgodmFsdWUgLSBtaW4pIC8gKG1heCAtIG1pbikpICogKFdJRFRIIC0gNDIpO1xuICAvLyBXaGl0ZSB3aGVyZSB0aGUgYmxvY2sgc2l0cyB1bmRlciB0aGUgdmFsdWUuXG4gIGNvbnN0IHVuZGVyID0gTWF0aC5hYnMobGVmdCArIDIwIC0gKFdJRFRIIC0gMikgLyAyKSA8IDQwO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBvblBvaW50ZXJEb3duPXtzZXR9XG4gICAgICBvblBvaW50ZXJNb3ZlPXtzZXR9XG4gICAgICBzdHlsZT17eyAuLi5wbGF0ZSgpLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIiB9fVxuICAgICAgaG92ZXJTdHlsZT17cGxhdGUoRlJBTUVfSE9UKX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoXCIjZGQ0NjQzXCIsIDEwKSxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0LFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgd2lkdGg6IDQwLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlZBTFVFLCBjb2xvcjogdW5kZXIgPyBDLndoaXRlIDogQy5jeWFuIH19PlxuICAgICAgICB7dmFsdWUudG9GaXhlZChkZWNpbWFscyl9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIGtleSBhbiBhY3Rpb24gaXMgYm91bmQgdG8sIGFzIGEga2V5Y2FwIChvciB0aGUgbW91c2UpOyBjbGljaywgdGhlblxuICogIHByZXNzIGEga2V5IHRvIHJlYmluZC4gKi9cbmZ1bmN0aW9uIEtleUJpbmQoe1xuICBjb2RlLFxuICBsaXN0ZW5pbmcsXG4gIG9uTGlzdGVuLFxufToge1xuICBjb2RlOiBzdHJpbmc7XG4gIGxpc3RlbmluZzogYm9vbGVhbjtcbiAgb25MaXN0ZW46ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBzZngoXCJjbGlja1wiKTtcbiAgICAgICAgb25MaXN0ZW4oKTtcbiAgICAgIH19XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5wbGF0ZShsaXN0ZW5pbmcgPyBDLmN5YW4gOiBGUkFNRSksXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3BsYXRlKGxpc3RlbmluZyA/IEMuY3lhbiA6IEZSQU1FX0hPVCl9XG4gICAgPlxuICAgICAge2xpc3RlbmluZyA/IChcbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVkFMVUUsIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsIGxldHRlclNwYWNpbmc6IDEgfX0+XG4gICAgICAgICAgUFJFU1MgQSBLRVlcbiAgICAgICAgPC90ZXh0PlxuICAgICAgKSA6IGNvZGUuc3RhcnRzV2l0aChcIk1vdXNlXCIpID8gKFxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImZsZXhTdGFydFwiLCBnYXA6IDEgfX0+XG4gICAgICAgICAgPE1vdXNlSWNvbiBzaXplPXsyOH0gLz5cbiAgICAgICAgICB7Y29kZS5pbmNsdWRlcyhcIldoZWVsXCIpICYmIChcbiAgICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCA4IDZcIiBzdHlsZT17eyB3aWR0aDogOCwgaGVpZ2h0OiA2IH19PlxuICAgICAgICAgICAgICA8cG9seWdvblxuICAgICAgICAgICAgICAgIHBvaW50cz17XG4gICAgICAgICAgICAgICAgICBjb2RlLmVuZHNXaXRoKFwiVXBcIikgPyBbMCwgNiwgNCwgMCwgOCwgNl0gOiBbMCwgMCwgOCwgMCwgNCwgNl1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmlsbD17Qy5jeWFufVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSA6IChcbiAgICAgICAgPEtleWNhcCBrPXtrZXlMYWJlbChjb2RlKX0gLz5cbiAgICAgICl9XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBBIHNldHRpbmcgdGhhdCBjYW4ndCBjaGFuZ2UgaGVyZSwgc2hvd24gb24gYSBwYWxlIHBsYXRlLiAqL1xuZnVuY3Rpb24gSW5mbyh7IHZhbHVlIH06IHsgdmFsdWU6IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLmNoYW1mZXIoXCIjMTIwZTE4XCIsIDEwLCBcIiNiOGFlYjNcIiwgMSksXG4gICAgICAgIHdpZHRoOiBXSURUSCxcbiAgICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlZBTFVFLCBjb2xvcjogXCIjY2RjNmNhXCIsIG1hcmdpbjogeyBib3R0b206IDUgfSB9fT5cbiAgICAgICAge3ZhbHVlfVxuICAgICAgPC90ZXh0PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBib3R0b206IDUsXG4gICAgICAgICAgd2lkdGg6IDIwLFxuICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiI2U5NGE0MlwiLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBLZXlzIG5hbWVkIHRoZSB3YXkgYSBrZXljYXAgZml0cyB0aGVtLiAqL1xuY29uc3QgS0VZX05BTUVTOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBTcGFjZTogXCJzcGFjZVwiLFxuICBFbnRlcjogXCJlbnRlclwiLFxuICBTaGlmdExlZnQ6IFwiU0hJRlRcIixcbiAgU2hpZnRSaWdodDogXCJTSElGVFwiLFxuICBDb250cm9sTGVmdDogXCJDVFJMXCIsXG4gIENvbnRyb2xSaWdodDogXCJDVFJMXCIsXG4gIEFsdExlZnQ6IFwiQUxUXCIsXG4gIEFsdFJpZ2h0OiBcIkFMVFwiLFxuICBUYWI6IFwiVEFCXCIsXG4gIEJhY2tzcGFjZTogXCJCS1NQXCIsXG4gIENhcHNMb2NrOiBcIkNBUFNcIixcbiAgQXJyb3dVcDogXCJVUFwiLFxuICBBcnJvd0Rvd246IFwiRE9XTlwiLFxuICBBcnJvd0xlZnQ6IFwiTEVGVFwiLFxuICBBcnJvd1JpZ2h0OiBcIlJJR0hUXCIsXG4gIE1pbnVzOiBcIi1cIixcbiAgRXF1YWw6IFwiPVwiLFxuICBCcmFja2V0TGVmdDogXCJbXCIsXG4gIEJyYWNrZXRSaWdodDogXCJdXCIsXG4gIFNlbWljb2xvbjogXCI7XCIsXG4gIFF1b3RlOiBcIidcIixcbiAgQ29tbWE6IFwiLFwiLFxuICBQZXJpb2Q6IFwiLlwiLFxuICBTbGFzaDogXCIvXCIsXG4gIEJhY2tzbGFzaDogXCJcXFxcXCIsXG4gIEJhY2txdW90ZTogXCJgXCIsXG59O1xuXG4vKiogYFwiS2V5V1wiYCDihpIgYFwiV1wiYCwgYFwiU2hpZnRMZWZ0XCJgIOKGkiBgXCJTSElGVFwiYCAoYSBgS2V5Ym9hcmRFdmVudC5jb2RlYCkuICovXG5mdW5jdGlvbiBrZXlMYWJlbChjb2RlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIChcbiAgICBLRVlfTkFNRVNbY29kZV0gPz9cbiAgICBjb2RlXG4gICAgICAucmVwbGFjZSgvXihLZXl8RGlnaXQpLywgXCJcIilcbiAgICAgIC5yZXBsYWNlKC9eTnVtcGFkLywgXCJOVU1cIilcbiAgICAgIC50b1VwcGVyQ2FzZSgpXG4gICAgICAuc2xpY2UoMCwgNSlcbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlS2V5cyB9IGZyb20gXCIuLi8uLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBFZGdlUmFpbHMgfSBmcm9tIFwiLi4vLi4vdWkvZGVjb3JcIjtcbmltcG9ydCB7IEZJTEwsIEhpbnQsIEhpbnRzIH0gZnJvbSBcIi4uLy4uL3VpL2tpdFwiO1xuaW1wb3J0IHsgQmFja2Ryb3AsIFNUQUdFLCBTdWJIZWFkZXIgfSBmcm9tIFwiLi9yb3dzXCI7XG5cbi8qKiBDT05UUk9MIFNDSEVNRTogYSBnYW1lcGFkIGluIHJlZCBvdXRsaW5lLCB3aGF0IGVhY2ggY29udHJvbCBkb2VzIGNhbGxlZFxuICogIG91dCBpbiB0aGUgbWFyZ2lucyBhbG9uZyBjeWFuIHdpcmVzLiBFc2MgcmV0dXJucyB0byB0aGUgc2V0dGluZ3MuICovXG5leHBvcnQgZnVuY3Rpb24gQ29udHJvbFNjaGVtZSh7IG9uQmFjayB9OiB7IG9uQmFjazogKCkgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IGJhY2sgPSAoKSA9PiB7XG4gICAgc2Z4KFwiYmFja1wiKTtcbiAgICBvbkJhY2soKTtcbiAgfTtcbiAgdXNlS2V5cygoZSkgPT4ge1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikgYmFjaygpO1xuICB9KTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17RklMTH0+XG4gICAgICA8QmFja2Ryb3AgLz5cbiAgICAgIDxTdWJIZWFkZXIgdGl0bGU9XCJDT05UUk9MIFNDSEVNRVwiIC8+XG4gICAgICA8RWRnZVJhaWxzIC8+XG4gICAgICA8bm9kZSBzdHlsZT17U1RBR0V9PlxuICAgICAgICA8R2FtZXBhZCAvPlxuICAgICAgICB7Q0FMTE9VVFMubWFwKChbc2lkZSwgeCwgeSwgaWNvbiwgbGluZXNdKSA9PiAoXG4gICAgICAgICAgPExhYmVsIGtleT17YCR7eH0gJHt5fWB9IHNpZGU9e3NpZGV9IHg9e3h9IHk9e3l9IGljb249e2ljb259PlxuICAgICAgICAgICAge2xpbmVzfVxuICAgICAgICAgIDwvTGFiZWw+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwiRVNDXCIgbGFiZWw9XCJDbG9zZVwiIG9uQ2xpY2s9e2JhY2t9IC8+XG4gICAgICA8L0hpbnRzPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFdoYXQgZWFjaCBjb250cm9sIGRvZXM6IChzaWRlLCB4IG9mIHRoZSBpY29uJ3Mgb3V0ZXIgZWRnZSwgeSBvZiB0aGVcbiAqICBmaXJzdCBsaW5lLCBpY29uLCBsaW5lcykuICovXG5jb25zdCBDQUxMT1VUUzogW1wibGVmdFwiIHwgXCJyaWdodFwiLCBudW1iZXIsIG51bWJlciwgUmVhY3ROb2RlLCBzdHJpbmdbXV1bXSA9IFtcbiAgW1wibGVmdFwiLCA3MzAsIDE4MCwgPFNtYWxsIGdseXBoPVwidmlld1wiIC8+LCBbXCJIb2xvIE1hcFwiXV0sXG4gIFtcInJpZ2h0XCIsIDExODYsIDE4MCwgPFNtYWxsIGdseXBoPVwibWVudVwiIC8+LCBbXCJQYXVzZSBNZW51XCJdXSxcbiAgW1wibGVmdFwiLCA1MDAsIDI0OCwgPFRhZyBrPVwiTEJcIiAvPiwgW1wiUGluZyBTY2FuXCIsIFwiU2Nhbm5lciBNb2RlIChIb2xkKVwiXV0sXG4gIFtcImxlZnRcIiwgNTAwLCAzMzgsIDxUYWcgaz1cIkxUXCIgLz4sIFtcIihNZWxlZSkgR3VhcmRcIiwgXCIoUmFuZ2VkKSBBaW1cIl1dLFxuICBbXCJsZWZ0XCIsIDUwMCwgNDQ4LCA8VGFnIGs9XCJMU1wiIC8+LCBbXCJTcHJpbnRcIl1dLFxuICBbXCJsZWZ0XCIsIDUwMCwgNDkwLCA8VGFnIGs9XCJMUytSU1wiIC8+LCBbXCJQaG90byBNb2RlXCJdXSxcbiAgW1wibGVmdFwiLCA1MDAsIDUzNCwgPFNtYWxsIGdseXBoPVwic3RpY2tcIiAvPiwgW1wiTW92ZVwiXV0sXG4gIFtcbiAgICBcImxlZnRcIixcbiAgICA1MDAsXG4gICAgNjAwLFxuICAgIDxTbWFsbCBnbHlwaD1cImRwYWRcIiAvPixcbiAgICBbXCIoRGlhbG9ndWUpIFVwXCIsIFwiVXNlIENvbnN1bWFibGVcIiwgXCIoQWltaW5nKSBab29tIEluXCJdLFxuICBdLFxuICBbXG4gICAgXCJsZWZ0XCIsXG4gICAgNTAwLFxuICAgIDcwOCxcbiAgICA8U21hbGwgZ2x5cGg9XCJkcGFkXCIgLz4sXG4gICAgW1wiKERpYWxvZ3VlKSBEb3duXCIsIFwiKEFpbWluZykgWm9vbSBPdXRcIiwgXCJDeWNsZSBPYmplY3RpdmVcIl0sXG4gIF0sXG4gIFtcImxlZnRcIiwgNTAwLCA4MjAsIDxTbWFsbCBnbHlwaD1cImRwYWRcIiAvPiwgW1wiTWVzc2FnZXNcIl1dLFxuICBbXCJsZWZ0XCIsIDUwMCwgODY4LCA8U21hbGwgZ2x5cGg9XCJkcGFkXCIgLz4sIFtcIlN1bW1vbiBWZWhpY2xlXCJdXSxcbiAgW1xuICAgIFwicmlnaHRcIixcbiAgICAxNDE0LFxuICAgIDIzNixcbiAgICA8VGFnIGs9XCJSQlwiIC8+LFxuICAgIFtcIlVzZSBDb21iYXQgSW1wbGFudFwiLCBcIkFpbSBDb21iYXQgSW1wbGFudCAoSG9sZClcIl0sXG4gIF0sXG4gIFtcbiAgICBcInJpZ2h0XCIsXG4gICAgMTQxNCxcbiAgICAzMTUsXG4gICAgPFRhZyBrPVwiUlRcIiAvPixcbiAgICBbXCIoUmFuZ2VkKSBGaXJlXCIsIFwiKE1lbGVlKSBMaWdodCBTdHJpa2VcIiwgXCIoTWVsZWUpIEhlYXZ5IFN0cmlrZSAoSG9sZClcIl0sXG4gIF0sXG4gIFtcInJpZ2h0XCIsIDE0MTQsIDQ0NywgPFNtYWxsIGdseXBoPVwid2VzdFwiIC8+LCBbXCJJbnRlcmFjdFwiLCBcIlJlbG9hZFwiXV0sXG4gIFtcbiAgICBcInJpZ2h0XCIsXG4gICAgMTQxNCxcbiAgICA1MTcsXG4gICAgPFNtYWxsIGdseXBoPVwibm9ydGhcIiAvPixcbiAgICBbXCJEcmF3IFdlYXBvblwiLCBcIkhvbHN0ZXIgV2VhcG9uIChEb3VibGUtVGFwKVwiXSxcbiAgXSxcbiAgW1wicmlnaHRcIiwgMTQxNCwgNTkwLCA8U21hbGwgZ2x5cGg9XCJub3J0aFwiIC8+LCBbXCJRdWljayBBY2Nlc3MgTWVudSAoSG9sZClcIl1dLFxuICBbXCJyaWdodFwiLCAxNDE0LCA2MzIsIDxTbWFsbCBnbHlwaD1cInNvdXRoXCIgLz4sIFtcIkp1bXBcIl1dLFxuICBbXG4gICAgXCJyaWdodFwiLFxuICAgIDE0MTQsXG4gICAgNjc1LFxuICAgIDxTbWFsbCBnbHlwaD1cImVhc3RcIiAvPixcbiAgICBbXCJDcm91Y2hcIiwgXCJEb2RnZSAoRG91YmxlLVRhcClcIl0sXG4gIF0sXG4gIFtcbiAgICBcInJpZ2h0XCIsXG4gICAgMTMxNCxcbiAgICA3NTEsXG4gICAgPFRhZyBrPVwiUlNcIiAvPixcbiAgICBbXCJRdWljayBNZWxlZSBBdHRhY2tcIiwgXCIoU2Nhbm5pbmcpIE1hcmsgVGFyZ2V0XCJdLFxuICBdLFxuICBbXCJyaWdodFwiLCAxMzE0LCA4MjAsIDxTbWFsbCBnbHlwaD1cInN0aWNrXCIgLz4sIFtcIkxvb2sgQXJvdW5kXCJdXSxcbl07XG5cbi8qKiBBIGNhbGxvdXQ6IGxpbmVzIG9mIHJlZCB0ZXh0IGJ5IGEgY3lhbiBpY29uLCBoYW5naW5nIG9mZiBgeGAgKHRoZVxuICogIGljb24ncyBvdXRlciBlZGdlKSBvbiB0aGUgZ2l2ZW4gc2lkZS4gKi9cbmZ1bmN0aW9uIExhYmVsKHtcbiAgeCxcbiAgeSxcbiAgc2lkZSxcbiAgaWNvbixcbiAgY2hpbGRyZW4sXG59OiB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICBzaWRlOiBcImxlZnRcIiB8IFwicmlnaHRcIjtcbiAgaWNvbjogUmVhY3ROb2RlO1xuICBjaGlsZHJlbjogc3RyaW5nW107XG59KSB7XG4gIGNvbnN0IGxlZnQgPSBzaWRlID09PSBcImxlZnRcIjtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIHRvcDogeSAtIDE2LFxuICAgICAgICAuLi4obGVmdCA/IHsgcmlnaHQ6IDE5MjAgLSB4IH0gOiB7IGxlZnQ6IHggfSksXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IGxlZnQgPyBcInJvd1wiIDogXCJyb3dSZXZlcnNlXCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiZmxleFN0YXJ0XCIsXG4gICAgICAgIGdhcDogMTAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBsZWZ0ID8gXCJmbGV4RW5kXCIgOiBcImZsZXhTdGFydFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7Y2hpbGRyZW4ubWFwKChsaW5lKSA9PiAoXG4gICAgICAgICAgPHRleHQga2V5PXtsaW5lfSBzdHlsZT17eyAuLi5ULmxhYmVsLCBsaW5lSGVpZ2h0OiAxLjQgfX0+XG4gICAgICAgICAgICB7bGluZX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgaGVpZ2h0OiAzMSwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fT57aWNvbn08L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSBidW1wZXIsIHRyaWdnZXIgb3Igc3RpY2stY2xpY2sgYmFkZ2UuICovXG5mdW5jdGlvbiBUYWcoeyBrIH06IHsgazogc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgaGVpZ2h0OiAxOCxcbiAgICAgICAgbWluV2lkdGg6IDI2LFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDMgfSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAzLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuY3lhbixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuYm9sZCxcbiAgICAgICAgICBjb2xvcjogXCIjMDYxNDFhXCIsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7a31cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbnR5cGUgR2x5cGggPVxuICB8IFwidmlld1wiXG4gIHwgXCJtZW51XCJcbiAgfCBcInN0aWNrXCJcbiAgfCBcImRwYWRcIlxuICB8IFwibm9ydGhcIlxuICB8IFwiZWFzdFwiXG4gIHwgXCJzb3V0aFwiXG4gIHwgXCJ3ZXN0XCI7XG5cbi8qKiBBIGN5YW4gZGlzYyB3aXRoIGEgY29udHJvbCdzIGdseXBoLCBhcyB0aGUgbWFyZ2lucyBzaG93IGl0LiAqL1xuZnVuY3Rpb24gU21hbGwoeyBnbHlwaCB9OiB7IGdseXBoOiBHbHlwaCB9KSB7XG4gIGNvbnN0IGluayA9IFwiIzA2MTQxYVwiO1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHN0eWxlPXt7IHdpZHRoOiAyNCwgaGVpZ2h0OiAyNCB9fT5cbiAgICAgIHtnbHlwaCA9PT0gXCJkcGFkXCIgPyAoXG4gICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgcG9pbnRzPXtQTFVTKDEyLCAxMiwgNCwgMTApfVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e0MuY3lhbn1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MS44fVxuICAgICAgICAvPlxuICAgICAgKSA6IGdseXBoID09PSBcInN0aWNrXCIgPyAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAgY3g9ezEyfVxuICAgICAgICAgICAgY3k9ezEyfVxuICAgICAgICAgICAgcj17MTAuNX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17Qy5jeWFufVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezEyfSBjeT17MTJ9IHI9ezZ9IGZpbGw9e0MuY3lhbn0gLz5cbiAgICAgICAgPC8+XG4gICAgICApIDogKFxuICAgICAgICA8PlxuICAgICAgICAgIDxjaXJjbGUgY3g9ezEyfSBjeT17MTJ9IHI9ezEwLjV9IGZpbGw9e0MuY3lhbn0gLz5cbiAgICAgICAgICA8RmFjZUdseXBoIGdseXBoPXtnbHlwaH0gY3g9ezEyfSBjeT17MTJ9IHNpemU9ezV9IGNvbG9yPXtpbmt9IC8+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuLyoqIFRoZSBtYXJrcyBvbiB0aGUgZmFjZSBidXR0b25zIChhbmQgdGhlIHR3byBzbWFsbCBidXR0b25zKS4gKi9cbmZ1bmN0aW9uIEZhY2VHbHlwaCh7XG4gIGdseXBoLFxuICBjeCxcbiAgY3ksXG4gIHNpemU6IHMsXG4gIGNvbG9yLFxufToge1xuICBnbHlwaDogR2x5cGg7XG4gIGN4OiBudW1iZXI7XG4gIGN5OiBudW1iZXI7XG4gIHNpemU6IG51bWJlcjtcbiAgY29sb3I6IHN0cmluZztcbn0pIHtcbiAgY29uc3Qgc3Ryb2tlID0geyBzdHJva2U6IGNvbG9yLCBzdHJva2VXaWR0aDogcyAqIDAuNCwgZmlsbDogXCJub25lXCIgfTtcbiAgc3dpdGNoIChnbHlwaCkge1xuICAgIGNhc2UgXCJub3J0aFwiOlxuICAgICAgcmV0dXJuIDxsaW5lIHgxPXtjeH0geTE9e2N5IC0gc30geDI9e2N4fSB5Mj17Y3kgKyBzfSB7Li4uc3Ryb2tlfSAvPjtcbiAgICBjYXNlIFwiZWFzdFwiOlxuICAgICAgcmV0dXJuIDxsaW5lIHgxPXtjeCAtIHN9IHkxPXtjeX0geDI9e2N4ICsgc30geTI9e2N5fSB7Li4uc3Ryb2tlfSAvPjtcbiAgICBjYXNlIFwic291dGhcIjpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgIHBvaW50cz17W1xuICAgICAgICAgICAgY3ggLSBzLFxuICAgICAgICAgICAgY3kgLSBzICogMC41LFxuICAgICAgICAgICAgY3gsXG4gICAgICAgICAgICBjeSArIHMgKiAwLjYsXG4gICAgICAgICAgICBjeCArIHMsXG4gICAgICAgICAgICBjeSAtIHMgKiAwLjUsXG4gICAgICAgICAgXX1cbiAgICAgICAgICB7Li4uc3Ryb2tlfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICBjYXNlIFwid2VzdFwiOlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHJlY3RcbiAgICAgICAgICB4PXtjeCAtIHMgKiAwLjd9XG4gICAgICAgICAgeT17Y3kgLSBzICogMC43fVxuICAgICAgICAgIHdpZHRoPXtzICogMS40fVxuICAgICAgICAgIGhlaWdodD17cyAqIDEuNH1cbiAgICAgICAgICB7Li4uc3Ryb2tlfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICBjYXNlIFwidmlld1wiOlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHJlY3RcbiAgICAgICAgICB4PXtjeCAtIHN9XG4gICAgICAgICAgeT17Y3kgLSBzICogMC42fVxuICAgICAgICAgIHdpZHRoPXtzICogMn1cbiAgICAgICAgICBoZWlnaHQ9e3MgKiAxLjJ9XG4gICAgICAgICAgcng9e3MgKiAwLjN9XG4gICAgICAgICAgey4uLnN0cm9rZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgY2FzZSBcIm1lbnVcIjpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDw+XG4gICAgICAgICAge1stMC41LCAwLCAwLjVdLm1hcCgoZCkgPT4gKFxuICAgICAgICAgICAgPGxpbmVcbiAgICAgICAgICAgICAga2V5PXtkfVxuICAgICAgICAgICAgICB4MT17Y3ggLSBzICogMC44fVxuICAgICAgICAgICAgICB5MT17Y3kgKyBkICogc31cbiAgICAgICAgICAgICAgeDI9e2N4ICsgcyAqIDAuOH1cbiAgICAgICAgICAgICAgeTI9e2N5ICsgZCAqIHN9XG4gICAgICAgICAgICAgIHsuLi5zdHJva2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8Lz5cbiAgICAgICk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKiBBIHBsdXMgb3V0bGluZSAodGhlIGQtcGFkKSBjZW50cmVkIG9uIChjeCwgY3kpOiBhcm1zIGB3YCBoYWxmLXdpZGUsXG4gKiAgcmVhY2hpbmcgYGxgIG91dC4gKi9cbmZ1bmN0aW9uIFBMVVMoY3g6IG51bWJlciwgY3k6IG51bWJlciwgdzogbnVtYmVyLCBsOiBudW1iZXIpIHtcbiAgcmV0dXJuIFtcbiAgICBbLXcsIC1sXSxcbiAgICBbdywgLWxdLFxuICAgIFt3LCAtd10sXG4gICAgW2wsIC13XSxcbiAgICBbbCwgd10sXG4gICAgW3csIHddLFxuICAgIFt3LCBsXSxcbiAgICBbLXcsIGxdLFxuICAgIFstdywgd10sXG4gICAgWy1sLCB3XSxcbiAgICBbLWwsIC13XSxcbiAgICBbLXcsIC13XSxcbiAgXS5mbGF0TWFwKChbeCwgeV0pID0+IFtjeCArIHgsIGN5ICsgeV0pO1xufVxuXG4vKiogVGhlIHBhZCdzIG91dGxpbmUsIHJpZ2h0IGhhbGYgdGhlbiBsZWZ0IChtaXJyb3JlZCBhYm91dCB4ID0gOTYwKS4gKi9cbmNvbnN0IEJPRFkgPVxuICBcIk05NjAgMzUyIEwxMDk4IDM1MiBDMTE0MCAzNTAgMTE3MiAzNjIgMTE4OCAzOTIgQzEyMjIgNDU4IDEyNDggNTcwIDEyNTYgNjUwIFwiICtcbiAgXCJDMTI2MiA3MTIgMTI0MCA3MzggMTIwOCA3MzAgQzExODIgNzI0IDExNjIgNzAwIDExNDAgNjY0IEMxMTE2IDYyNiAxMDkwIDYxMiAxMDUyIDYxMiBcIiArXG4gIFwiTDg2OCA2MTIgQzgzMCA2MTIgODA0IDYyNiA3ODAgNjY0IEM3NTggNzAwIDczOCA3MjQgNzEyIDczMCBDNjgwIDczOCA2NTggNzEyIDY2NCA2NTAgXCIgK1xuICBcIkM2NzIgNTcwIDY5OCA0NTggNzMyIDM5MiBDNzQ4IDM2MiA3ODAgMzUwIDgyMiAzNTIgWlwiO1xuXG4vKiogVGhlIGZhY2UgYnV0dG9uczogKGdseXBoLCBjeCwgY3kpLiAqL1xuY29uc3QgRkFDRTogW0dseXBoLCBudW1iZXIsIG51bWJlcl1bXSA9IFtcbiAgW1wibm9ydGhcIiwgMTEwNCwgNDEyXSxcbiAgW1wid2VzdFwiLCAxMDcwLCA0NDZdLFxuICBbXCJlYXN0XCIsIDExMzgsIDQ0Nl0sXG4gIFtcInNvdXRoXCIsIDExMDQsIDQ4MF0sXG5dO1xuXG4vKiogVGhlIHdpcmVzIGZyb20gdGhlIG1hcmdpbnMgdG8gdGhlIGNvbnRyb2xzIChzdGFnZSBweCkuICovXG5jb25zdCBXSVJFUyA9IFtcbiAgWzU0OCwgMjQ4LCA3MTIsIDI0OCwgODA2LCAzNDRdLFxuICBbNTIyLCA0NDgsIDc5NiwgNDQ4XSxcbiAgWzUzMCwgNjAwLCA4MTAsIDYwMCwgODY2LCA1NTBdLFxuICBbNzQyLCAxODAsIDg3NCwgMTgwLCA4NzQsIDQxMiwgOTEyLCA0NDBdLFxuICBbMTM4NCwgMjM2LCAxMjMyLCAyMzYsIDExMTgsIDM0NF0sXG4gIFsxMzg2LCA0NzIsIDExNTAsIDQ3MiwgMTEyMiwgNDc4XSxcbiAgWzEyOTAsIDc0OCwgMTI0MCwgNzQ4LCAxMDYwLCA1NjBdLFxuICBbMTE3NiwgMTgwLCAxMDQ2LCAxODAsIDEwNDYsIDQxMiwgMTAwOCwgNDQwXSxcbl07XG5cbi8qKiBBbiBvcmlnaW5hbCBwYWQsIGRyYXduIGluIHRoZSBnYW1lJ3MgcmVkIGxpbmUgd29yazogdGhlIGJvZHkgYW5kIGl0c1xuICogIGlubmVyIGNvbnRvdXIsIGJ1bXBlcnMgYW5kIHRyaWdnZXJzLCB0d28gc3RpY2tzLCBhIGQtcGFkLCBmb3VyIGZhY2VcbiAqICBidXR0b25zLCB0aGUgc21hbGwgYnV0dG9ucyBhbmQgYSBjcmVzdC4gKi9cbmZ1bmN0aW9uIEdhbWVwYWQoKSB7XG4gIGNvbnN0IHJlZCA9IEMucmVkO1xuICBjb25zdCBkaW0gPSBcInJnYmEoMjU1LCA5MywgODEsIDAuNDUpXCI7XG4gIGNvbnN0IHN0aWNrID0gKGN4OiBudW1iZXIsIGN5OiBudW1iZXIpID0+IChcbiAgICA8PlxuICAgICAgPGNpcmNsZVxuICAgICAgICBjeD17Y3h9XG4gICAgICAgIGN5PXtjeX1cbiAgICAgICAgcj17NDB9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtkaW19XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAvPlxuICAgICAgPGNpcmNsZVxuICAgICAgICBjeD17Y3h9XG4gICAgICAgIGN5PXtjeX1cbiAgICAgICAgcj17MzF9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyLjJ9XG4gICAgICAvPlxuICAgICAgPGNpcmNsZVxuICAgICAgICBjeD17Y3h9XG4gICAgICAgIGN5PXtjeX1cbiAgICAgICAgcj17MjJ9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAvPlxuICAgIDwvPlxuICApO1xuICByZXR1cm4gKFxuICAgIDxzdmdcbiAgICAgIHZpZXdCb3g9XCIwIDAgMTkyMCAxMDgwXCJcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoOiAxOTIwLFxuICAgICAgICBoZWlnaHQ6IDEwODAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtXSVJFUy5tYXAoKHBvaW50cywgaSkgPT4gKFxuICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgcG9pbnRzPXtwb2ludHN9XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17Qy5jeWFuRGltfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjR9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9e0JPRFl9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyLjR9XG4gICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgLz5cbiAgICAgIDxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSg5NjAgNTAwKSBzY2FsZSgwLjk1NSAwLjk0KSB0cmFuc2xhdGUoLTk2MCAtNTAwKVwiPlxuICAgICAgICA8cGF0aCBkPXtCT0RZfSBmaWxsPVwibm9uZVwiIHN0cm9rZT17ZGltfSBzdHJva2VXaWR0aD17MS40fSAvPlxuICAgICAgPC9nPlxuICAgICAgey8qIEJ1bXBlcnMgYW5kIHRyaWdnZXJzLiAqL31cbiAgICAgIHtbMSwgLTFdLm1hcCgoc2lkZSkgPT4gKFxuICAgICAgICA8Z1xuICAgICAgICAgIGtleT17c2lkZX1cbiAgICAgICAgICB0cmFuc2Zvcm09e3NpZGUgPCAwID8gXCJ0cmFuc2xhdGUoMTkyMCAwKSBzY2FsZSgtMSAxKVwiIDogdW5kZWZpbmVkfVxuICAgICAgICA+XG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGQ9XCJNMTA5OCAzNDYgQzExMTIgMzMyIDExNTAgMzI2IDExNzYgMzM4IEMxMTg2IDM0MyAxMTkxIDM1MSAxMTkwIDM2MFwiXG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e3JlZH1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsyLjJ9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgZD1cIk0xMTEyIDMzMCBDMTExOCAzMTIgMTE0NiAzMDYgMTE2MiAzMTQgTDExNzAgMzM0XCJcbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17ZGltfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2c+XG4gICAgICApKX1cbiAgICAgIHtzdGljayg4MzgsIDQ0OCl9XG4gICAgICB7c3RpY2soMTAzMCwgNTMyKX1cbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY3g9ezg5M31cbiAgICAgICAgY3k9ezUzMn1cbiAgICAgICAgcj17NDB9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtkaW19XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAvPlxuICAgICAgPHBvbHlnb25cbiAgICAgICAgcG9pbnRzPXtQTFVTKDg5MywgNTMyLCAxMSwgMzApfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17cmVkfVxuICAgICAgICBzdHJva2VXaWR0aD17Mi4yfVxuICAgICAgLz5cbiAgICAgIHtGQUNFLm1hcCgoW2dseXBoLCBjeCwgY3ldKSA9PiAoXG4gICAgICAgIDxnIGtleT17Z2x5cGh9PlxuICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgIGN4PXtjeH1cbiAgICAgICAgICAgIGN5PXtjeX1cbiAgICAgICAgICAgIHI9ezE2fVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17Mi4yfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEZhY2VHbHlwaCBnbHlwaD17Z2x5cGh9IGN4PXtjeH0gY3k9e2N5fSBzaXplPXs2fSBjb2xvcj17cmVkfSAvPlxuICAgICAgICA8L2c+XG4gICAgICApKX1cbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY3g9ezkyMn1cbiAgICAgICAgY3k9ezQ0Nn1cbiAgICAgICAgcj17MTF9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtyZWR9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjZ9XG4gICAgICAvPlxuICAgICAgPEZhY2VHbHlwaCBnbHlwaD1cInZpZXdcIiBjeD17OTIyfSBjeT17NDQ2fSBzaXplPXs1fSBjb2xvcj17cmVkfSAvPlxuICAgICAgPGNpcmNsZVxuICAgICAgICBjeD17OTk4fVxuICAgICAgICBjeT17NDQ2fVxuICAgICAgICByPXsxMX1cbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e3JlZH1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgIC8+XG4gICAgICA8RmFjZUdseXBoIGdseXBoPVwibWVudVwiIGN4PXs5OTh9IGN5PXs0NDZ9IHNpemU9ezV9IGNvbG9yPXtyZWR9IC8+XG4gICAgICA8cmVjdFxuICAgICAgICB4PXs5NTB9XG4gICAgICAgIHk9ezQ3NH1cbiAgICAgICAgd2lkdGg9ezIwfVxuICAgICAgICBoZWlnaHQ9ezExfVxuICAgICAgICByeD17M31cbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e3JlZH1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNn1cbiAgICAgIC8+XG4gICAgICB7LyogVGhlIGNyZXN0OiBhIGN1dCBkaWFtb25kLCBub2JvZHkncyBsb2dvLiAqL31cbiAgICAgIDxwb2x5Z29uIHBvaW50cz17Wzk2MCwgMzcyLCA5ODIsIDM5NCwgOTYwLCA0MTYsIDkzOCwgMzk0XX0gZmlsbD17cmVkfSAvPlxuICAgICAgPHBvbHlsaW5lXG4gICAgICAgIHBvaW50cz17Wzk0OCwgNDA0LCA5NzIsIDM4NF19XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPVwiIzEyMDcwOFwiXG4gICAgICAgIHN0cm9rZVdpZHRoPXszfVxuICAgICAgLz5cbiAgICA8L3N2Zz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VLZXlzIH0gZnJvbSBcIi4uLy4uL2hvb2tzXCI7XG5pbXBvcnQgeyBzZnggfSBmcm9tIFwiLi4vLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYsIGNoYW1mZXIgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEVkZ2VSYWlscyB9IGZyb20gXCIuLi8uLi91aS9kZWNvclwiO1xuaW1wb3J0IHsgRklMTCwgSGludCwgSGludHMgfSBmcm9tIFwiLi4vLi4vdWkva2l0XCI7XG5pbXBvcnQge1xuICBXT1JETUFSS19BU1BFQ1QsXG4gIFdPUkRNQVJLX1BBVEgsXG4gIFdPUkRNQVJLX1ZJRVdCT1gsXG59IGZyb20gXCIuLi8uLi91aS93b3JkbWFyay1wYXRoXCI7XG5pbXBvcnQgeyBHQU1NQSB9IGZyb20gXCIuL2RhdGFcIjtcbmltcG9ydCB7IEJhY2tkcm9wLCBSb3dGcmFtZSwgU1RBR0UsIFNsaWRlckJhciwgU3ViSGVhZGVyIH0gZnJvbSBcIi4vcm93c1wiO1xuaW1wb3J0IHsgc2V0U2V0dGluZywgdXNlU2V0dGluZ3MgfSBmcm9tIFwiLi9zdG9yZVwiO1xuXG4vKiogR0FNTUEgQ09SUkVDVElPTjogdGhlIHdvcmRtYXJrIG9uIGJsYWNrIGluIHRocmVlIHNsaWNlcyBvZiByaXNpbmdcbiAqICBicmlnaHRuZXNzLCBzZWVuIHRocm91Z2ggdGhlIGBnYW1tYWAgZmlsdGVyIGF0IHRoZSBjaG9zZW4gdmFsdWUg4oCUIHRoZVxuICogIHNhbWUgY3VydmUgdGhlIHNldHRpbmcgcHV0cyBvbiB0aGUgd29ybGQgKGBzZXR0aW5ncy5yc2ApLiBFc2MgcmV0dXJucyB0b1xuICogIHRoZSBzZXR0aW5ncy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHYW1tYSh7IG9uQmFjayB9OiB7IG9uQmFjazogKCkgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IGdhbW1hID0gTnVtYmVyKHVzZVNldHRpbmdzKCkuZ2FtbWEpO1xuICBjb25zdCBiYWNrID0gKCkgPT4ge1xuICAgIHNmeChcImJhY2tcIik7XG4gICAgb25CYWNrKCk7XG4gIH07XG4gIHVzZUtleXMoKGUpID0+IHtcbiAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIGJhY2soKTtcbiAgfSk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e0ZJTEx9PlxuICAgICAgPEJhY2tkcm9wIC8+XG4gICAgICA8U3ViSGVhZGVyIHRpdGxlPVwiR0FNTUEgQ09SUkVDVElPTlwiIC8+XG4gICAgICA8RWRnZVJhaWxzIC8+XG4gICAgICA8bm9kZSBzdHlsZT17U1RBR0V9PlxuICAgICAgICA8VGVzdEltYWdlIGdhbW1hPXtnYW1tYX0gLz5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgICB0b3A6IDc2NCxcbiAgICAgICAgICAgIGZvbnRTaXplOiAyNSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFJhaXNlIG9yIGxvd2VyIHRoZSBnYW1tYSB1bnRpbCB0aGUgbWFyayBvbiB0aGUgbGVmdCBpcyBvbmx5IGp1c3RcbiAgICAgICAgICB2aXNpYmxlLlxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogNTEwLFxuICAgICAgICAgICAgdG9wOiA4MjcsXG4gICAgICAgICAgICB3aWR0aDogOTI1LFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFJvd0ZyYW1lIGxhYmVsPXtHQU1NQS5sYWJlbH0+XG4gICAgICAgICAgICA8U2xpZGVyQmFyXG4gICAgICAgICAgICAgIHJvdz17R0FNTUF9XG4gICAgICAgICAgICAgIHZhbHVlPXtnYW1tYX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXRTZXR0aW5nKEdBTU1BLmlkLCB2KX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Sb3dGcmFtZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPEhpbnRzPlxuICAgICAgICA8SGludCBrPVwibW91c2VcIiBsYWJlbD1cIlNFTEVDVFwiIC8+XG4gICAgICAgIDxIaW50IGs9XCJFU0NcIiBsYWJlbD1cIkJBQ0tcIiBvbkNsaWNrPXtiYWNrfSAvPlxuICAgICAgPC9IaW50cz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBXaGVyZSBlYWNoIHNsaWNlIG9mIHRoZSBtYXJrIGVuZHMgKGl0cyBzaGFyZSBvZiB0aGUgd2lkdGgpLCBhbmQgaG93XG4gKiAgYnJpZ2h0IGl0IGlzOiBhbGwgYnV0IGJsYWNrLCBhIGRpbSBncmV5LCB3aGl0ZS4gKi9cbmNvbnN0IFNMSUNFUzogW251bWJlciwgc3RyaW5nXVtdID0gW1xuICBbMC4zNiwgXCIjMGEwYTBhXCJdLFxuICBbMC42OCwgXCIjNDA0MDQwXCJdLFxuICBbMSwgXCIjZmZmZmZmXCJdLFxuXTtcblxuLyoqIFRoZSBibGFjayBmaWVsZCBpbiBpdHMgcmVkIGZyYW1lIChhIGhlYXZ5IGJhciBkb3duIHRoZSByaWdodCwgYSB0aGlubmVyXG4gKiAgb25lIGRvd24gdGhlIGxvd2VyIGxlZnQpLCB0aGUgbWFyayBpbiBpdCB1bmRlciB0aGUgZmlsdGVyLiAqL1xuZnVuY3Rpb24gVGVzdEltYWdlKHsgZ2FtbWEgfTogeyBnYW1tYTogbnVtYmVyIH0pIHtcbiAgY29uc3Qgd2lkdGggPSA5NTA7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2hhbWZlcihDLnJlZCwgOCwgdW5kZWZpbmVkLCAxLCBcInRsXCIpLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDMyOSxcbiAgICAgICAgICB0b3A6IDIwMCxcbiAgICAgICAgICB3aWR0aDogOCxcbiAgICAgICAgICBoZWlnaHQ6IDUzNixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDMzNSxcbiAgICAgICAgICB0b3A6IDEwMyxcbiAgICAgICAgICB3aWR0aDogMTI1MCxcbiAgICAgICAgICBoZWlnaHQ6IDYzMyxcbiAgICAgICAgICBib3JkZXI6IHsgdG9wOiAyLCBsZWZ0OiAyLCBib3R0b206IDMgfSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzAwMDAwMFwiLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IHRvcDogMTU4LCByaWdodDogMzAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogeyBuYW1lOiBcImdhbW1hXCIsIHBhcmFtczogeyB2YWx1ZTogZ2FtbWEgfSB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0OiB3aWR0aCAvIFdPUkRNQVJLX0FTUEVDVCArIDQwIH19PlxuICAgICAgICAgICAge1NMSUNFUy5tYXAoKFtlbmQsIGNvbG9yXSwgaSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGkgPT09IDAgPyAwIDogU0xJQ0VTW2kgLSAxXVswXTtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgICAga2V5PXtjb2xvcn1cbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGFydCAqIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogKGVuZCAtIHN0YXJ0KSAqIHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3dYOiBcImNsaXBcIixcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3dZOiBcImNsaXBcIixcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPE1hcmtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICAgICAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IC1zdGFydCAqIHdpZHRoIH19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICB7LyogVGhlIG5vdGNoIGF0IHRoZSBib3R0b20gb2YgdGhlIGZpZWxkLiAqL31cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgIGxlZnQ6IDYyNyxcbiAgICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgICB3aWR0aDogNyxcbiAgICAgICAgICAgICAgaGVpZ2h0OiA1NixcbiAgICAgICAgICAgICAgYm9yZGVyOiB7IHRvcDogMSwgbGVmdDogMSwgcmlnaHQ6IDEgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmNoYW1mZXIoQy5yZWQsIDIyLCB1bmRlZmluZWQsIDEsIFwiYnJcIiksXG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMTU4MyxcbiAgICAgICAgICB0b3A6IDEwMyxcbiAgICAgICAgICB3aWR0aDogMjIsXG4gICAgICAgICAgaGVpZ2h0OiA2MzMsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogMixcbiAgICAgICAgICAgIHRvcDogMTMyLFxuICAgICAgICAgICAgaGVpZ2h0OiAzNzAsXG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjM2ExMDE0XCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIFRoZSB3b3JkbWFyayBhbmQgaXRzIHllYXIgbGluZSBpbiBvbmUgZmxhdCBjb2xvdXIuICovXG5mdW5jdGlvbiBNYXJrKHtcbiAgd2lkdGgsXG4gIGNvbG9yLFxuICBzdHlsZSxcbn06IHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgY29sb3I6IHN0cmluZztcbiAgc3R5bGU6IHsgbGVmdDogbnVtYmVyIH07XG59KSB7XG4gIGNvbnN0IGhlaWdodCA9IHdpZHRoIC8gV09SRE1BUktfQVNQRUNUO1xuICBjb25zdCBkaWdpdCA9IHdpZHRoICogMC4wNTI7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodCArIDQwLFxuICAgICAgICAuLi5zdHlsZSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHN2ZyB2aWV3Qm94PXtXT1JETUFSS19WSUVXQk9YfSBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0IH19PlxuICAgICAgICA8cGF0aCBkPXtXT1JETUFSS19QQVRIfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiB3aWR0aCAqIDAuMzYsXG4gICAgICAgICAgdG9wOiBoZWlnaHQgKiAwLjgsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIixcbiAgICAgICAgICBnYXA6IGRpZ2l0ICogMC41LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7W1wiMlwiLCBcIjBcIiwgXCI5XCIsIFwiMVwiXS5tYXAoKGQsIGkpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsXG4gICAgICAgICAgICAgIGdhcDogZGlnaXQgKiAwLjUsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogZGlnaXQsXG4gICAgICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7ZH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIHtpIDwgMyAmJiAoXG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiBkaWdpdCAqIDEuNixcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogeyBib3R0b206IGRpZ2l0ICogMC4yMiB9LFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdHlwZSBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIHVzZVNoYXJlZFZhbHVlLFxuICB3aXRoRGVsYXksXG4gIHdpdGhTZXF1ZW5jZSxcbiAgd2l0aFRpbWluZyxcbiAgdHlwZSBCZXZ5U3R5bGUsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyB1c2VLZXlzIH0gZnJvbSBcIi4uL2hvb2tzXCI7XG5pbXBvcnQgeyBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBGSUxMIH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuXG4vKiogVGhlIG1hcmtzJyByZWQgKG9uZSBmbGF0IGluaywgbGlrZSBhIGxpY2Vuc2luZyBzY3JlZW4pLiAqL1xuY29uc3QgSU5LID0gXCIjZGI0ZjQ5XCI7XG5cbi8qKiBJbiwgaG9sZCwgb3V0IChtcykuICovXG5jb25zdCBjYXJkID0gKGRlbGF5OiBudW1iZXIsIGhvbGQ6IG51bWJlcikgPT5cbiAgd2l0aERlbGF5KFxuICAgIGRlbGF5LFxuICAgIHdpdGhTZXF1ZW5jZShcbiAgICAgIHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogMzIwLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0pLFxuICAgICAgd2l0aERlbGF5KGhvbGQsIHdpdGhUaW1pbmcoMCwgeyBkdXJhdGlvbjogMjgwLCBlYXNpbmc6IFwiZWFzZUluXCIgfSkpLFxuICAgICksXG4gICk7XG5cbi8qKiBUaGUgYm9vdDogdGhlIG1hcmtzIG9mIHRoZSBzdGFjayB0aGlzIHJ1bnMgb24sIHRpbnRlZCByZWQsIHRoZW4gYSBsaW5lXG4gKiAgb3duaW5nIHVwIHRvIHRoZSBob21hZ2UuIEFib3V0IHRocmVlIHNlY29uZHM7IGFueSBrZXkgb3IgYSBjbGljayBza2lwcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTcGxhc2goeyBvbkRvbmUgfTogeyBvbkRvbmU6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBtYXJrcyA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICBjb25zdCBub3RpY2UgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgY29uc3QgZG9uZSA9IHVzZVJlZihvbkRvbmUpO1xuICBkb25lLmN1cnJlbnQgPSBvbkRvbmU7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gQSBiZWF0IG9mIGJsYWNrIGZpcnN0OiB0aGUgYXBwJ3MgZmlyc3QgZnJhbWVzIGNvbXBpbGUgcGlwZWxpbmVzLlxuICAgIG1hcmtzLnZhbHVlID0gY2FyZCgyNTAsIDgwMCk7XG4gICAgbm90aWNlLnZhbHVlID0gY2FyZCgxNzAwLCA5MDApO1xuICAgIGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IGRvbmUuY3VycmVudCgpLCAzMzAwKTtcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KHQpO1xuICB9LCBbbWFya3MsIG5vdGljZV0pO1xuICB1c2VLZXlzKCgpID0+IGRvbmUuY3VycmVudCgpKTtcblxuICBjb25zdCBjZW50ZXI6IEJldnlTdHlsZSA9IHtcbiAgICAuLi5GSUxMLFxuICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIH07XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgc3R5bGU9e3sgLi4uRklMTCwgYmFja2dyb3VuZENvbG9yOiBcIiMwMDAwMDBcIiB9fVxuICAgICAgb25DbGljaz17KCkgPT4gZG9uZS5jdXJyZW50KCl9XG4gICAgPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uY2VudGVyLCBvcGFjaXR5OiB7IGFuaW1hdGVkOiBtYXJrcyB9IH19PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogMTI0MCxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBmbGV4V3JhcDogXCJ3cmFwXCIsXG4gICAgICAgICAgICByb3dHYXA6IDgwLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8TWFyaz5cbiAgICAgICAgICAgIDxMb2dvIHNyYz1cImltYWdlcy9iZXZ5LWxvZ28ucG5nXCIgLz5cbiAgICAgICAgICAgIDxXb3JkIHNpemU9ezYwfT5iZXZ5PC9Xb3JkPlxuICAgICAgICAgIDwvTWFyaz5cbiAgICAgICAgICA8TWFyaz5cbiAgICAgICAgICAgIDxMb2dvIHNyYz1cImltYWdlcy9yZWFjdC1sb2dvLnBuZ1wiIC8+XG4gICAgICAgICAgICA8V29yZCBzaXplPXs1Nn0+UmVhY3Q8L1dvcmQ+XG4gICAgICAgICAgPC9NYXJrPlxuICAgICAgICAgIDxNYXJrPlxuICAgICAgICAgICAgPFdvcmQgc2l6ZT17NzZ9PndncHU8L1dvcmQ+XG4gICAgICAgICAgPC9NYXJrPlxuICAgICAgICAgIDxNYXJrPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA2IH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiA5MixcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogOTIsXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IElOSyxcbiAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFdvcmQgc2l6ZT17NTh9IGNvbG9yPVwiIzAwMDAwMFwiPlxuICAgICAgICAgICAgICAgICAgVjhcbiAgICAgICAgICAgICAgICA8L1dvcmQ+XG4gICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgPFdvcmQgc2l6ZT17MTl9IGZvbnQ9e0Yuc2VtaWJvbGR9PlxuICAgICAgICAgICAgICAgIEpBVkFTQ1JJUFQgRU5HSU5FXG4gICAgICAgICAgICAgIDwvV29yZD5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8L01hcms+XG4gICAgICAgICAgPE1hcms+XG4gICAgICAgICAgICA8V29yZCBzaXplPXs3Mn0+dGFmZnk8L1dvcmQ+XG4gICAgICAgICAgPC9NYXJrPlxuICAgICAgICAgIDxNYXJrPlxuICAgICAgICAgICAgPFdvcmQgc2l6ZT17NDZ9IGZvbnQ9e0YubW9ub30+XG4gICAgICAgICAgICAgIGRlbm9fY29yZVxuICAgICAgICAgICAgPC9Xb3JkPlxuICAgICAgICAgIDwvTWFyaz5cbiAgICAgICAgICA8TWFyaz5cbiAgICAgICAgICAgIDxXb3JkIHNpemU9ezU0fSBmb250PXtGLnNlbWlib2xkfT5cbiAgICAgICAgICAgICAgY29zbWljLXRleHRcbiAgICAgICAgICAgIDwvV29yZD5cbiAgICAgICAgICA8L01hcms+XG4gICAgICAgICAgPE1hcms+XG4gICAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiIH19PlxuICAgICAgICAgICAgICA8V29yZCBzaXplPXsyMH0gZm9udD17Ri5zZW1pYm9sZH0+XG4gICAgICAgICAgICAgICAgcG93ZXJlZCBieVxuICAgICAgICAgICAgICA8L1dvcmQ+XG4gICAgICAgICAgICAgIDxXb3JkIHNpemU9ezU0fT5iZXZ5LXJlYWN0PC9Xb3JkPlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDwvTWFyaz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uY2VudGVyLCBvcGFjaXR5OiB7IGFuaW1hdGVkOiBub3RpY2UgfSB9fT5cbiAgICAgICAgey8qIFRoZSB3aWR0aCBzaXRzIG9uIGEgd3JhcHBlcjogYSBgPHRleHQ+YCB3aXRoIGEgd2lkdGggb2YgaXRzIG93bixcbiAgICAgICAgICAgIGNlbnRlcmVkIG9uIHRoZSBjcm9zcyBheGlzLCBtZWFzdXJlcyB6ZXJvIHRhbGwuICovfVxuICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMTI4MCB9fT5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IDI1LFxuICAgICAgICAgICAgICBjb2xvcjogXCIjYzk0NjNmXCIsXG4gICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IDEuNDUsXG4gICAgICAgICAgICAgIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcIkNZQkVSUFVOSyAyMDkxIGlzIGEgZmFuIGhvbWFnZSB0byB0aGUgbWVudXMgb2YgQ3liZXJwdW5rIDIwNzcsIGJ1aWx0IHdpdGggYmV2eS1yZWFjdC4gSXQgaXMgbm90IGFmZmlsaWF0ZWQgd2l0aCBvciBlbmRvcnNlZCBieSBDRCBQUk9KRUtUIFJFRC4gU2FibGUgQ2l0eSwgVGVua2FpIGFuZCBldmVyeW9uZSBpbiB0aGVtIGFyZSBtYWRlIHVwLiBCZXZ5LCBSZWFjdCwgd2dwdSwgVjgsIHRhZmZ5LCBkZW5vX2NvcmUgYW5kIGNvc21pYy10ZXh0IGFyZSB0aGUgd29yayBvZiB0aGVpciBhdXRob3JzLCB1c2VkIHVuZGVyIHRoZWlyIG9wZW4tc291cmNlIGxpY2Vuc2VzLlwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBPbmUgY2VsbCBvZiB0aGUgZ3JpZC4gKi9cbmZ1bmN0aW9uIE1hcmsoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogXCIyNSVcIixcbiAgICAgICAgaGVpZ2h0OiAxMjAsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDE0LFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSBwcm9qZWN0J3MgbG9nbywgZmxhdHRlbmVkIHRvIHRoZSByZWQgaW5rLiAqL1xuZnVuY3Rpb24gTG9nbyh7IHNyYyB9OiB7IHNyYzogc3RyaW5nIH0pIHtcbiAgcmV0dXJuIDxpbWFnZSBzcmM9e3NyY30gdGludD17SU5LfSBzdHlsZT17eyB3aWR0aDogODQsIGhlaWdodDogODQgfX0gLz47XG59XG5cbi8qKiBBIHdvcmRtYXJrIHNldCBpbiB0eXBlLiAqL1xuZnVuY3Rpb24gV29yZCh7XG4gIHNpemUsXG4gIGZvbnQgPSBGLmJvbGQsXG4gIGNvbG9yID0gSU5LLFxuICBjaGlsZHJlbixcbn06IHtcbiAgc2l6ZTogbnVtYmVyO1xuICBmb250Pzogc3RyaW5nO1xuICBjb2xvcj86IHN0cmluZztcbiAgY2hpbGRyZW46IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8dGV4dFxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZm9udFNpemU6IHNpemUsXG4gICAgICAgIGZvbnRGYW1pbHk6IGZvbnQsXG4gICAgICAgIGNvbG9yLFxuICAgICAgICBsaW5lSGVpZ2h0OiAxLFxuICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L3RleHQ+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgaW50ZXJwb2xhdGUsXG4gIHVzZVNoYXJlZFZhbHVlLFxuICB3aXRoUmVwZWF0LFxuICB3aXRoVGltaW5nLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgdXNlS2V5cyB9IGZyb20gXCIuLi9ob29rc1wiO1xuaW1wb3J0IHsgc2Z4IH0gZnJvbSBcIi4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBEYXRhTm9pc2UsIFJ1bGUgfSBmcm9tIFwiLi4vdWkvZGVjb3JcIjtcbmltcG9ydCB7IEZJTEwsIEtleWNhcCB9IGZyb20gXCIuLi91aS9raXRcIjtcbmltcG9ydCB7IFdvcmRtYXJrIH0gZnJvbSBcIi4uL3VpL1dvcmRtYXJrXCI7XG5cbi8qKiBUaGUgdGl0bGUgc2NyZWVuOiB0aGUgd29yZG1hcmsgbGFpZCBvbiB0aGUgZGF0YXNjYXBlIGF0IGFuIGFuZ2xlIChhXG4gKiAgYHRyYW5zZm9ybTNkYCBvbiBpdHMgbGF5ZXIg4oCUIHN0aWxsIFJlYWN0LCBzdGlsbCBhIGdsaXRjaCBmaWx0ZXIpLCBhbmRcbiAqICBcIlBSRVNTIFtTUEFDRV0gVE8gQ09OVElOVUUuXCIgU3BhY2UsIEVudGVyIG9yIGEgY2xpY2sgc3RhcnRzIEJSRUFDSElOR+KApixcbiAqICB0aGVuIHRoZSBtYWluIG1lbnUuICovXG5leHBvcnQgZnVuY3Rpb24gVGl0bGUoeyBvbkNvbnRpbnVlIH06IHsgb25Db250aW51ZTogKCkgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IFticmVhY2hpbmcsIHNldEJyZWFjaGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IGdvID0gKCkgPT4ge1xuICAgIGlmIChicmVhY2hpbmcpIHJldHVybjtcbiAgICBzZngoXCJjb25maXJtXCIpO1xuICAgIHNldEJyZWFjaGluZyh0cnVlKTtcbiAgICBzZXRUaW1lb3V0KG9uQ29udGludWUsIDE1MDApO1xuICB9O1xuICB1c2VLZXlzKChlKSA9PiB7XG4gICAgaWYgKGUua2V5ID09PSBcIlNwYWNlXCIgfHwgZS5rZXkgPT09IFwiRW50ZXJcIikgZ28oKTtcbiAgfSk7XG4gIC8vIFRoZSBwbGFuZSB0aGUgd29yZG1hcmsgbGllcyBvbiBzd2F5cyBhIGxpdHRsZSwgbmV2ZXIgc3RpbGwuXG4gIGNvbnN0IHN3YXkgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzd2F5LnZhbHVlID0gd2l0aFJlcGVhdChcbiAgICAgIHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogNzAwMCwgZWFzaW5nOiBcImVhc2VJbk91dFwiIH0pLFxuICAgICAgeyByZXZlcnNlOiB0cnVlIH0sXG4gICAgKTtcbiAgfSwgW3N3YXldKTtcblxuICByZXR1cm4gKFxuICAgIDxidXR0b24gc3R5bGU9e3sgLi4uRklMTCwgYmFja2dyb3VuZENvbG9yOiBDLmNsZWFyIH19IG9uQ2xpY2s9e2dvfT5cbiAgICAgIDxXb3JkbWFya1xuICAgICAgICB3aWR0aD17MTI0MH1cbiAgICAgICAgZ2xpdGNoPXswLjIyfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDMwMCxcbiAgICAgICAgICB0b3A6IDMwMCxcbiAgICAgICAgICB0cmFuc2Zvcm0zZDoge1xuICAgICAgICAgICAgcGVyc3BlY3RpdmU6IDE1MDAsXG4gICAgICAgICAgICByb3RhdGVYOiB7IGFuaW1hdGVkOiBpbnRlcnBvbGF0ZShzd2F5LCBbMCwgMV0sIFsyMiwgMjZdKSB9LFxuICAgICAgICAgICAgcm90YXRlWTogeyBhbmltYXRlZDogaW50ZXJwb2xhdGUoc3dheSwgWzAsIDFdLCBbLTIwLCAtMTVdKSB9LFxuICAgICAgICAgICAgcm90YXRlWjogLTcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgdG9wOiA4NDIsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDMyMCwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAzIH19PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubWljcm8sIGNvbG9yOiBDLnJlZERpbSB9fT5cbiAgICAgICAgICAgIHtcIk1PREVMIExJTkUgICAgICAgIDEuMjAwMUFcIn1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGhlaWdodDogNTAsXG4gICAgICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyMCwgNiwgMTAsIDAuNTUpXCIsXG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBnYXA6IDgsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHticmVhY2hpbmcgPyAoXG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAzMCxcbiAgICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgICAgICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBcImdsaXRjaFwiLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbXM6IHsgaW50ZW5zaXR5OiAwLjUsIGZyZXF1ZW5jeTogMC42LCB0ZWFyOiAxMCB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgQlJFQUNISU5HLi4uXG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5tZW51LCBmb250RmFtaWx5OiBGLnNlbWlib2xkIH19PlBSRVNTPC90ZXh0PlxuICAgICAgICAgICAgICAgIDxLZXljYXAgaz1cInNwYWNlXCIgLz5cbiAgICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm1lbnUsIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQgfX0+XG4gICAgICAgICAgICAgICAgICBUTyBDT05USU5VRS5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDIzMCxcbiAgICAgICAgICAgIGhlaWdodDogMjAsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogQy5yZWREaW0sXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDYgfSxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8RGF0YU5vaXNlIHNlZWQ9ezN9IGxpbmVzPXsyfSBncm91cHM9ezZ9IHN0eWxlPXt7IGZvbnRTaXplOiA2IH19IC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPFJ1bGUgd2lkdGg9ezExMDB9IGNvbG9yPXtDLnJlZERpbX0gc3R5bGU9e3sgbWFyZ2luOiB7IHRvcDogMTAgfSB9fSAvPlxuICAgICAgPC9ub2RlPlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUEsYUFBTyxVQUFVLFdBQVcsYUFBYSx3QkFBd0I7QUFBQTtBQUFBOzs7QUNBakU7QUFBQTtBQUFBLGFBQU8sVUFBVSxXQUFXLGFBQWEsWUFBWTtBQUFBO0FBQUE7OztBQ0FyRDtBQUFBO0FBQUEsYUFBTyxVQUFVLFdBQVcsYUFBYSxPQUFPO0FBQUE7QUFBQTs7OztBQ0FoRCxNQUFBQSxzQkFBc0I7Ozs7QUNBdEIsTUFBQUMsaUJBQTRDOzs7QUNLNUMsMEJBS087QUEwZkEsV0FBU0MsS0FBb0NDLE9BQVNDLE9BQXVCO0FBQ2xGQywwQkFBQUEsTUFBUUYsT0FBTUMsS0FBQUE7RUFDaEI7QUFHTyxXQUFTRSxRQUNkSCxPQUNBQyxPQUFrQztBQUVsQyxlQUFPRyxrQkFBQUEsU0FBV0osT0FBTUMsS0FBQUE7RUFDMUI7QUFHTyxXQUFTSSxHQUNkTCxPQUNBTSxJQUFtQztBQUVuQ0MsMEJBQUFBLGtCQUFvQlAsT0FBTU0sRUFBQUE7QUFDMUIsV0FBTyxVQUFNRSxrQkFBQUEscUJBQXVCUixPQUFNTSxFQUFBQTtFQUM1QztBQUdPLFdBQVNHLG9CQUNkVCxPQUNBTSxJQUFtQztBQUVuQ0UsMEJBQUFBLHFCQUF1QlIsT0FBTU0sRUFBQUE7RUFDL0I7QUFHTyxNQUFNSSxPQUFPO0lBQ2xCWDtJQUNBSTtJQUNBRTtJQUNBTSxrQkFBa0JOO0lBQ2xCSTtJQUNBRyxLQUFLO01BQ0hDLEtBQUtaLE9BQVc7QUFBVUYsYUFBSyxZQUFZRSxLQUFBQTtNQUFRO0lBQ3JEO0lBQ0Fh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STtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUN4RTtNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQ3hFO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFDeEU7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBRztNQUFLO01BQUc7O0lBRXhDO01BQ0U7TUFBRztNQUFJO01BQUk7TUFBSTtNQUFJO01BQUk7TUFBSTtNQUFJO01BQUk7TUFBSTtNQUFJO01BQUk7TUFBSTtNQUFJO01BQUk7TUFBSztNQUFJO01BQUs7TUFDekU7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUN4RTtNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQ3hFO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFDeEU7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUN4RTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQUs7TUFBSTtNQUFLO01BQUk7TUFBSztNQUFJO01BQ3hFO01BQUk7TUFBSztNQUFJO01BQUs7TUFBRztNQUFLO01BQUc7TUFBSztNQUFHOzs7QUFNekMsTUFBTUMsVUFBVTtJQUNkO01BQ0U7UUFB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LEtBQUNDLEtBQUFBLENBQUFBLENBQUFBLENBQUFBOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfYmV2eV9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiZW1pdCIsICJuYW1lIiwgInZhbHVlIiwgInJhd0VtaXQiLCAicmVxdWVzdCIsICJyYXdSZXF1ZXN0IiwgIm9uIiwgImNiIiwgInJhd0FkZEV2ZW50TGlzdGVuZXIiLCAicmF3UmVtb3ZlRXZlbnRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImJldnkiLCAiYWRkRXZlbnRMaXN0ZW5lciIsICJhcHAiLCAicXVpdCIsICJkaW9yYW1hcyIsICJkaWZmaWN1bHR5IiwgIndvcmxkIiwgImdhbWVwYWQiLCAiZ2V0QWxsIiwgInJ1bWJsZSIsICJzdG9wUnVtYmxlIiwgInNldHRpbmdzIiwgImdhbW1hIiwgImdyYXBoaWNzIiwgInZpZGVvIiwgInNvdW5kIiwgInBsYXkiLCAidm9sdW1lIiwgIndpbmRvdyIsICJzaXplIiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgInVzZUV2ZW50IiwgIm5hbWUiLCAicnVuIiwgImxhdGVzdCIsICJ1c2VSZWYiLCAiY3VycmVudCIsICJ1c2VFZmZlY3QiLCAib24iLCAidmFsdWUiLCAidXNlS2V5cyIsICJyZXBlYXQiLCAiZSIsICJ1c2VEZWJ1ZyIsICJ2ZXJiIiwgImFjdGlvbiIsICJoZWFkIiwgInJlc3QiLCAic3BsaXQiLCAiam9pbiIsICJ1c2VFbnRlciIsICJ4IiwgImRlbGF5IiwgImR1cmF0aW9uIiwgInQiLCAidXNlU2hhcmVkVmFsdWUiLCAid2l0aERlbGF5IiwgIndpdGhUaW1pbmciLCAiZWFzaW5nIiwgIm9wYWNpdHkiLCAiYW5pbWF0ZWQiLCAidHJhbnNmb3JtIiwgInRyYW5zbGF0ZVgiLCAiaW50ZXJwb2xhdGUiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgInNmeCIsICJuYW1lIiwgImJldnkiLCAic291bmQiLCAicGxheSIsICJDIiwgInJlZCIsICJyZWRIaSIsICJyZWREaW0iLCAicmVkRGVlcCIsICJyZWRMaW5lIiwgInJlZEZhaW50IiwgImN5YW4iLCAiY3lhbkhpIiwgImN5YW5EaW0iLCAiY3lhbkRlZXAiLCAiY3lhbkZhaW50IiwgInllbGxvdyIsICJ3aGl0ZSIsICJpbmsiLCAiYmFuZCIsICJzZWN0aW9uIiwgInJvdyIsICJmaWVsZCIsICJidXR0b24iLCAic2hhZGUiLCAiY2xlYXIiLCAiRiIsICJzZW1pYm9sZCIsICJib2xkIiwgIm1vbm8iLCAiVCIsICJtZW51IiwgImZvbnRTaXplIiwgImNvbG9yIiwgImxpbmVCcmVhayIsICJ0aXRsZSIsICJsZXR0ZXJTcGFjaW5nIiwgImNhcHRpb24iLCAibGFiZWwiLCAiZm9udEZhbWlseSIsICJib2R5IiwgImxpbmVIZWlnaHQiLCAibWljcm8iLCAiRlJPTSIsICJiciIsICJ0bCIsICJ0ciIsICJibCIsICJ0cmFuc3BhcmVudCIsICJjaGFtZmVyIiwgImZpbGwiLCAiY3V0IiwgImxpbmUiLCAid2lkdGgiLCAiY29ybmVyIiwgImQiLCAiTWF0aCIsICJTUVJUMiIsICJhbmdsZSIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJzdG9wcyIsICJwb3NpdGlvbiIsICJpbm5lciIsICJib3JkZXIiLCAiYm9yZGVyR3JhZGllbnQiLCAiU0NBTkxJTkVTIiwgInNyYyIsICJtb2RlIiwgInNjYWxlIiwgIk1vdXNlSWNvbiIsICJjb2xvciIsICJDIiwgImN5YW4iLCAic2l6ZSIsICJfanN4cyIsICJzdmciLCAidmlld0JveCIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiX2pzeCIsICJwYXRoIiwgImQiLCAiZmlsbCIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAibGluZSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJQcm90b2NvbEdseXBoIiwgInJlY3QiLCAieCIsICJ5IiwgInBvbHlsaW5lIiwgInBvaW50cyIsICJvcGFjaXR5IiwgIldhcm5pbmdJY29uIiwgInJlZCIsICJwb2x5Z29uIiwgIkFycm93IiwgImRpciIsICJHTFlQSFMiLCAic3BhY2UiLCAiZW50ZXIiLCAiS2V5Y2FwIiwgImsiLCAiY29sb3IiLCAiQyIsICJjeWFuIiwgImdseXBoIiwgIl9qc3giLCAibm9kZSIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAic3ZnIiwgInZpZXdCb3giLCAicG9seWxpbmUiLCAicG9pbnRzIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgIndvcmQiLCAibGVuZ3RoIiwgIm1pbldpZHRoIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJib2xkIiwgImxpbmVCcmVhayIsICJIaW50IiwgImxhYmVsIiwgIm9uQ2xpY2siLCAicmVkIiwgIl9qc3hzIiwgImJ1dHRvbiIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiY2xlYXIiLCAiaG92ZXJTdHlsZSIsICJvcGFjaXR5IiwgIk1vdXNlSWNvbiIsICJIaW50cyIsICJjaGlsZHJlbiIsICJwb3NpdGlvblR5cGUiLCAicmlnaHQiLCAiYm90dG9tIiwgIkN1dEJ1dHRvbiIsICJob3QiLCAiZGlzYWJsZWQiLCAiZnJhbWUiLCAidW5kZWZpbmVkIiwgImNoYW1mZXIiLCAiVCIsICJtZW51IiwgImxldHRlclNwYWNpbmciLCAiSGVhZGVyIiwgInRpdGxlIiwgImNhcHRpb24iLCAiaWNvbiIsICJzdGVwIiwgInN0ZXBzIiwgImxlZnQiLCAic2VnbWVudCIsICJydWxlIiwgInRvcCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJtaWNybyIsICJsaW5lSGVpZ2h0IiwgIkFycmF5IiwgImZyb20iLCAiXyIsICJpIiwgIkZJTEwiLCAiaW1wb3J0X3JlYWN0IiwgIm9wZW4iLCAibW9kYWxPcGVuIiwgIkNvbmZpcm0iLCAidGV4dCIsICJvbkNvbmZpcm0iLCAib25DYW5jZWwiLCAiX2pzeCIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiYmFja2dyb3VuZENvbG9yIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAiZm9jdXNQb2xpY3kiLCAiaG92ZXJTdHlsZSIsICJQbGF0ZSIsICJpY29uIiwgIldhcm5pbmdJY29uIiwgInNpemUiLCAiY29sb3IiLCAiQyIsICJyZWQiLCAiUExBVEUiLCAiVEFCIiwgInVzZUVmZmVjdCIsICJjb25maXJtIiwgInNmeCIsICJjYW5jZWwiLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJfanN4cyIsICJ3aWR0aCIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJoZWlnaHQiLCAiVGFiIiwgImNoYW1mZXIiLCAiZmxleEdyb3ciLCAicGFkZGluZyIsICJJbnNldCIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAibGluZUhlaWdodCIsICJmbGV4U2hyaW5rIiwgIm1hcmdpbiIsICJ0b3AiLCAicG9zaXRpb25UeXBlIiwgInJpZ2h0IiwgImJvdHRvbSIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYWxpZ25TZWxmIiwgIlBsYXRlQnV0dG9uIiwgImsiLCAibGFiZWwiLCAib25DbGljayIsICJib3JkZXJSYWRpdXMiLCAibGVmdCIsICJjaGlsZHJlbiIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJzdG9wcyIsICJwb3NpdGlvbiIsICJidXR0b24iLCAiaG9yaXpvbnRhbCIsICJjeWFuIiwgIktleWNhcCIsICJsaW5lQnJlYWsiLCAiQ1JFRElUUyIsICJ0aXRsZSIsICJzcGFjZSIsICJyb2xlIiwgIm5hbWVzIiwgIlRJVExFIiwgIlJPVyIsICJMSU5FIiwgImhlaWdodCIsICJiIiwgIk1hdGgiLCAibWF4IiwgImxlbmd0aCIsICJzcGxpdCIsICJIIiwgInJlZHVjZSIsICJoIiwgIlNQTElUIiwgIk5PUk1BTCIsICJGQVNUIiwgIlNUQVJUIiwgIkVOVEVSIiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJjb2xvciIsICJsZXR0ZXJTcGFjaW5nIiwgImxpbmVIZWlnaHQiLCAicHgiLCAidGV4dEFsaWduIiwgIm5hbWUiLCAiYm9sZCIsICJsaW5lQnJlYWsiLCAiQ3JlZGl0cyIsICJvbkNsb3NlIiwgInkiLCAidXNlU2hhcmVkVmFsdWUiLCAiZmFzdCIsICJzZXRGYXN0IiwgInVzZVN0YXRlIiwgImNsb2NrIiwgInVzZVJlZiIsICJmcm9tIiwgImF0IiwgInNwZWVkIiwgInJ1biIsICJjdXJyZW50IiwgIkRhdGUiLCAibm93IiwgIm1zIiwgInZhbHVlIiwgIndpdGhTZXF1ZW5jZSIsICJ3aXRoVGltaW5nIiwgImR1cmF0aW9uIiwgIndpdGhSZXBlYXQiLCAib2Zmc2V0IiwgIm9uIiwgInVzZUVmZmVjdCIsICJjYW5jZWxBbmltYXRpb24iLCAiY2xvc2UiLCAic2Z4IiwgImZvcndhcmQiLCAia2V5IiwgInVzZUtleXMiLCAiZSIsICJtb2RhbE9wZW4iLCAidXNlRXZlbnQiLCAidXNlRGVidWciLCAiYXJnIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJwb3NpdGlvbiIsICJfanN4IiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJ3aWR0aCIsICJmbGV4RGlyZWN0aW9uIiwgInRyYW5zZm9ybSIsICJ0cmFuc2xhdGVZIiwgImFuaW1hdGVkIiwgIm1hcCIsICJpIiwgInRleHQiLCAiZ2FwIiwgIm1hcmdpbiIsICJqb2luIiwgInJpZ2h0IiwgImJvdHRvbSIsICJhbGlnbkl0ZW1zIiwgImJ1dHRvbiIsICJvbkNsaWNrIiwgImhvdmVyU3R5bGUiLCAib3BhY2l0eSIsICJLZXljYXAiLCAiayIsICJDIiwgInJlZCIsICJjeWFuIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJMSUZFUEFUSFMiLCAiaWQiLCAibmFtZSIsICJESUZGSUNVTFRJRVMiLCAiTkVXX0NIQVJBQ1RFUiIsICJoYW5kbGUiLCAiZGlmZmljdWx0eSIsICJsaWZlcGF0aCIsICJib2R5IiwgInZvaWNlIiwgImxvb2siLCAiYXR0cmlidXRlcyIsICJpbnRlbGxpZ2VuY2UiLCAicmVmbGV4ZXMiLCAidGVjaCIsICJjb29sIiwgIlBST0xPR1VFIiwgIm5vbWFkIiwgInF1ZXN0IiwgImxvY2F0aW9uIiwgInN0cmVldGtpZCIsICJjb3JwbyIsICJTRUVEX1NBVkVTIiwgImxldmVsIiwgInBsYXl0aW1lIiwgImRhdGUiLCAiY2hhcmFjdGVyIiwgIm1pbnV0ZXMiLCAiaCIsICJNYXRoIiwgImZsb29yIiwgIm0iLCAidG9TdHJpbmciLCAicGFkU3RhcnQiLCAiV29ybGQiLCAicGF1c2VkIiwgIl9qc3giLCAicG9ydGFsIiwgInRhcmdldCIsICJzdHlsZSIsICJGSUxMIiwgImNhY2hlIiwgImZpbHRlciIsICJuYW1lIiwgInBhcmFtcyIsICJyYWRpdXMiLCAidHJhbnNpdGlvbiIsICJkdXJhdGlvbiIsICJhcnJpdmluZyIsICJhbm5vdW5jZUFycml2YWwiLCAiR2FtZUh1ZCIsICJvblBhdXNlIiwgImdhbWUiLCAiYW5ub3VuY2UiLCAidXNlU3RhdGUiLCAidXNlRWZmZWN0IiwgIndoZXJlIiwgIlBST0xPR1VFIiwgInN0cmVldGtpZCIsICJfanN4cyIsICJub2RlIiwgIlRvYXN0IiwgImxvY2F0aW9uIiwgInF1ZXN0IiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJsYWJlbCIsICJvbkNsaWNrIiwgInNmeCIsICJ0IiwgInVzZVNoYXJlZFZhbHVlIiwgInZhbHVlIiwgIndpdGhEZWxheSIsICJ3aXRoU2VxdWVuY2UiLCAid2l0aFRpbWluZyIsICJlYXNpbmciLCAiZGlzdHJpY3QiLCAicGxhY2UiLCAic3BsaXQiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgIm9wYWNpdHkiLCAiYW5pbWF0ZWQiLCAidHJhbnNmb3JtIiwgInRyYW5zbGF0ZVgiLCAiaW50ZXJwb2xhdGUiLCAiY2hhbWZlciIsICJ3aWR0aCIsICJwYWRkaW5nIiwgInJpZ2h0IiwgInZlcnRpY2FsIiwgImJhY2tncm91bmRDb2xvciIsICJDIiwgImN5YW4iLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImZvbnRTaXplIiwgImNvbG9yIiwgImN5YW5EaW0iLCAiZm9udEZhbWlseSIsICJGIiwgImJvbGQiLCAibGV0dGVyU3BhY2luZyIsICJsaW5lQnJlYWsiLCAidG9VcHBlckNhc2UiLCAiYWxpZ25JdGVtcyIsICJoZWlnaHQiLCAieWVsbG93IiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJybmciLCAic2VlZCIsICJzIiwgIkhFWCIsICJub2lzZUxpbmVzIiwgImxpbmVzIiwgImdyb3VwcyIsICJyIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIk1hdGgiLCAiZmxvb3IiLCAiam9pbiIsICJEYXRhTm9pc2UiLCAiY29sb3IiLCAiQyIsICJyZWREaW0iLCAic3R5bGUiLCAiX2pzeCIsICJ0ZXh0IiwgIlQiLCAibWljcm8iLCAiUHJvdG9jb2xTdGFtcCIsICJfanN4cyIsICJub2RlIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJhbGlnbkl0ZW1zIiwgIm1hcCIsICJ3IiwgImkiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJhY2tncm91bmRDb2xvciIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkYiLCAiYm9sZCIsICJsZXR0ZXJTcGFjaW5nIiwgInJlZERlZXAiLCAianVzdGlmeUNvbnRlbnQiLCAicGFkZGluZyIsICJSdWxlIiwgImxhYmVsIiwgIkVkZ2VSYWlscyIsICJyYWlsIiwgInNpZGUiLCAiYm90dG9tIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJfRnJhZ21lbnQiLCAidHJhbnNmb3JtIiwgInJvdGF0ZSIsICJMZWdhbEZvb3RlciIsICJzdmciLCAidmlld0JveCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJmaWxsIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJzdHJva2VMaW5lam9pbiIsICJwb2x5bGluZSIsICJzZW1pYm9sZCIsICJsaW5lSGVpZ2h0IiwgImltcG9ydF9yZWFjdCIsICJzZWN0aW9uIiwgImxhYmVsIiwgImtpbmQiLCAic2VsZWN0IiwgImlkIiwgIm9wdGlvbnMiLCAiZGVmIiwgInRvZ2dsZSIsICJzbGlkZXIiLCAibWluIiwgIm1heCIsICJzdGVwIiwgImtleSIsICJSRVNPTFVUSU9OUyIsICJMQU5HVUFHRVMiLCAiUFJFU0VUX05BTUVTIiwgIkNVU1RPTSIsICJsZW5ndGgiLCAiUFJFU0VUUyIsICJ0ZXh0dXJlcyIsICJhYmVycmF0aW9uIiwgImZvY3VzIiwgImZsYXJlIiwgImJsdXIiLCAiR0FNTUEiLCAiVEFCUyIsICJyb3dzIiwgInZhbHVlIiwgImRlZmF1bHRzIiwgIm91dCIsICJyb3ciLCAiREVGQVVMVFMiLCAiZmxhdE1hcCIsICJ0IiwgImciLCAiZ2xvYmFsVGhpcyIsICJzdG9yZSIsICJfX2N5YmVycHVua1NldHRpbmdzIiwgInZhbHVlcyIsICJsaXN0ZW5lcnMiLCAiU2V0IiwgIkRFRkFVTFRTIiwgInN1YnNjcmliZSIsICJsaXN0ZW5lciIsICJhZGQiLCAiZGVsZXRlIiwgInVzZVNldHRpbmdzIiwgInVzZVN5bmNFeHRlcm5hbFN0b3JlIiwgInNldFNldHRpbmdzIiwgImZvckVhY2giLCAibCIsICJzZXRTZXR0aW5nIiwgImlkIiwgInZhbHVlIiwgInVzZUxpdmVTZXR0aW5ncyIsICJ2IiwgIm4iLCAiTnVtYmVyIiwgInVzZVB1c2giLCAibWFzdGVyIiwgInNmeCIsICJtdXNpYyIsICJiZXZ5IiwgInNvdW5kIiwgInZvbHVtZSIsICJmb3YiLCAiYWJlcnJhdGlvbiIsICJmb2N1cyIsICJmbGFyZSIsICJibHVyIiwgInNldHRpbmdzIiwgImdyYXBoaWNzIiwgImdhbW1hIiwgIndpZHRoIiwgImhlaWdodCIsICJSRVNPTFVUSU9OUyIsICJzcGxpdCIsICJtYXAiLCAibW9kZSIsICJ2c3luYyIsICJ2aWRlbyIsICJwdXNoIiwgIm9uTW91bnQiLCAia2V5IiwgIkpTT04iLCAic3RyaW5naWZ5IiwgInNlbnQiLCAidXNlUmVmIiwgInVzZUVmZmVjdCIsICJjdXJyZW50IiwgInBhcnNlIiwgIldPUkRNQVJLX1ZJRVdCT1giLCAiV09SRE1BUktfQVNQRUNUIiwgIldPUkRNQVJLX1BBVEgiLCAiV29yZG1hcmsiLCAid2lkdGgiLCAiZ2xpdGNoIiwgImNoYW5jZSIsICJzdHlsZSIsICJ1c2VTZXR0aW5ncyIsICJ1aUdsaXRjaCIsICJoZWlnaHQiLCAiV09SRE1BUktfQVNQRUNUIiwgImRpZ2l0IiwgIl9qc3hzIiwgIm5vZGUiLCAiZmlsdGVyIiwgIm5hbWUiLCAicGFyYW1zIiwgImludGVuc2l0eSIsICJmcmVxdWVuY3kiLCAic2VlZCIsICJ1bmRlZmluZWQiLCAiX2pzeCIsICJzdmciLCAidmlld0JveCIsICJXT1JETUFSS19WSUVXQk9YIiwgInBhdGgiLCAiZCIsICJXT1JETUFSS19QQVRIIiwgImZpbGwiLCAiQyIsICJ5ZWxsb3ciLCAiWWVhciIsICJzaXplIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgIm1hcCIsICJpIiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImZvbnRTaXplIiwgImNvbG9yIiwgImN5YW5EaW0iLCAibGluZUJyZWFrIiwgIm1hcmdpbiIsICJib3R0b20iLCAiYmFja2dyb3VuZENvbG9yIiwgIkwiLCAiVyIsICJUIiwgImF0IiwgInUiLCAidiIsICJ6IiwgInBhdGNoIiwgInUwIiwgInUxIiwgInYwIiwgInYxIiwgInNpZGUiLCAiSU5LIiwgIkRhdGFzaGFyZCIsICJ3aWR0aCIsICJfanN4cyIsICJzdmciLCAidmlld0JveCIsICJzdHlsZSIsICJoZWlnaHQiLCAiX2pzeCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJmaWxsIiwgIm9wYWNpdHkiLCAicG9seWxpbmUiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgIkxpZmVwYXRoSWNvbiIsICJsaWZlcGF0aCIsICJzaXplIiwgImNpcmNsZSIsICJjeCIsICJjeSIsICJyIiwgIkMiLCAicmVkIiwgIl9GcmFnbWVudCIsICJzdHJva2VMaW5lam9pbiIsICJlbGxpcHNlIiwgInJ4IiwgInJ5IiwgIkRVUkFUSU9OIiwgIlNFR01FTlRTIiwgIlRJUFMiLCAibm9tYWQiLCAic3RyZWV0a2lkIiwgImNvcnBvIiwgIkxvYWRpbmciLCAibGlmZXBhdGgiLCAib25Eb25lIiwgInByb2dyZXNzIiwgInVzZVNoYXJlZFZhbHVlIiwgImRvbmUiLCAidXNlUmVmIiwgImN1cnJlbnQiLCAidXNlRWZmZWN0IiwgInNmeCIsICJhbm5vdW5jZUFycml2YWwiLCAidmFsdWUiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAidCIsICJzZXRUaW1lb3V0IiwgImNsZWFyVGltZW91dCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJXb3JkbWFyayIsICJ3aWR0aCIsICJnbGl0Y2giLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgInRyYW5zZm9ybTNkIiwgInBlcnNwZWN0aXZlIiwgInJvdGF0ZVgiLCAicm90YXRlWSIsICJyb3RhdGVaIiwgInJpZ2h0IiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImNvbG9yIiwgIkMiLCAicmVkRGltIiwgImhlaWdodCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAicmVkIiwgImJhY2tncm91bmRDb2xvciIsICJqdXN0aWZ5Q29udGVudCIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAiY3lhbiIsICJsZXR0ZXJTcGFjaW5nIiwgImxpbmVCcmVhayIsICJjYWNoZSIsICJmaWx0ZXIiLCAibmFtZSIsICJwYXJhbXMiLCAiaW50ZW5zaXR5IiwgImZyZXF1ZW5jeSIsICJ0ZWFyIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIl8iLCAiaSIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgImludGVycG9sYXRlIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJMaWZlcGF0aEljb24iLCAic2l6ZSIsICJsaW5lSGVpZ2h0IiwgImZsZXhTaHJpbmsiLCAiUnVsZSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAiTWFpbk1lbnUiLCAiZW50cmllcyIsICJvblBpY2siLCAib25CYWNrIiwgInZlcnNpb24iLCAic2VsZWN0ZWQiLCAic2V0U2VsZWN0ZWQiLCAidXNlU3RhdGUiLCAic2VsZWN0IiwgImkiLCAic2Z4IiwgInVzZUtleXMiLCAiZSIsICJtb2RhbE9wZW4iLCAia2V5IiwgImxlbmd0aCIsICJpZCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJCYW5kIiwgIkRhdGFOb2lzZSIsICJzZWVkIiwgImxpbmVzIiwgImdyb3VwcyIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJDIiwgInJlZERpbSIsICJqdXN0aWZ5Q29udGVudCIsICJwYWRkaW5nIiwgInRleHQiLCAiVCIsICJtaWNybyIsICJjb2xvciIsICJXb3JkbWFyayIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJtYXAiLCAiZW50cnkiLCAiTWVudUl0ZW0iLCAibGFiZWwiLCAib25TZWxlY3QiLCAib25DbGljayIsICJSdWxlIiwgImZvbnRTaXplIiwgIlRvcFJpZ2h0IiwgIk1lc3NhZ2VzIiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJib3R0b20iLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAicG9zaXRpb24iLCAiYmFja2dyb3VuZEltYWdlIiwgIlNDQU5MSU5FUyIsICJyaWdodCIsICJnbGl0Y2hlcyIsICJ1c2VTZXR0aW5ncyIsICJ1aUdsaXRjaCIsICJidXJzdCIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aFNlcXVlbmNlIiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJhbGlnbkl0ZW1zIiwgImNoYW1mZXIiLCAiY3lhbkhpIiwgImNsZWFyIiwgImZpbHRlciIsICJuYW1lIiwgInBhcmFtcyIsICJpbnRlbnNpdHkiLCAiYW5pbWF0ZWQiLCAic3BsaXQiLCAidGVhciIsICJ1bmRlZmluZWQiLCAibWVudSIsICJjeWFuIiwgInJlZCIsICJQcm90b2NvbEdseXBoIiwgIl9GcmFnbWVudCIsICJob3Jpem9udGFsIiwgIldhcm5pbmdJY29uIiwgInNpemUiLCAiS2V5Y2FwIiwgImZsZXhHcm93IiwgImJhY2tncm91bmRDb2xvciIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgIkRJRkZJQ1VMVFlfVEVYVCIsICJlYXN5IiwgIm5vcm1hbCIsICJoYXJkIiwgInZlcnloYXJkIiwgIkxJRkVQQVRIX1RFWFQiLCAibm9tYWQiLCAic3RyZWV0a2lkIiwgImNvcnBvIiwgIlNLSU5fVE9ORVMiLCAiSEFJUl9DT0xPUlMiLCAiRVlFX0NPTE9SUyIsICJWT0lDRSIsICJsYWJlbCIsICJuYW1lcyIsICJMT09LX09QVElPTlMiLCAiaWQiLCAiY291bnQiLCAibGVuZ3RoIiwgInN3YXRjaGVzIiwgImxvb2siLCAiYyIsICJQUkVTRVRTIiwgInNraW5Ub25lIiwgInNraW5UeXBlIiwgImhhaXJzdHlsZSIsICJoYWlyQ29sb3IiLCAiZXllcyIsICJleWVicm93cyIsICJqYXciLCAiY3liZXJ3YXJlIiwgInNjYXJzIiwgInRhdHRvb3MiLCAicGllcmNpbmdzIiwgIm1ha2V1cCIsICJBVFRSX01JTiIsICJBVFRSX01BWCIsICJBVFRSX1BPSU5UUyIsICJBVFRSSUJVVEVTIiwgIm5hbWUiLCAic2hvcnQiLCAidGV4dCIsICJlZmZlY3RzIiwgImhhc2giLCAicyIsICJoIiwgImkiLCAiY2hhckNvZGVBdCIsICJNYXRoIiwgImltdWwiLCAicmVzaWRlbnRJZCIsICJoYW5kbGUiLCAiZCIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJ0YWciLCAicmVwbGFjZSIsICJzbGljZSIsICJ0d28iLCAiaGFuZGxlT2YiLCAidHJpbSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAiV2hlZWxJY29uIiwgImNvbG9yIiwgIkMiLCAiY3lhbiIsICJfanN4cyIsICJzdmciLCAidmlld0JveCIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiX2pzeCIsICJwYXRoIiwgImQiLCAiZmlsbCIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAicmVjdCIsICJ4IiwgInkiLCAicG9seWdvbiIsICJwb2ludHMiLCAiU3RlcEljb24iLCAia2luZCIsICJzIiwgInRoaW4iLCAiX0ZyYWdtZW50IiwgInBvbHlsaW5lIiwgImxpbmUiLCAieDEiLCAieTEiLCAieDIiLCAieTIiLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAicngiLCAib3BhY2l0eSIsICJBdHRyaWJ1dGVJY29uIiwgImlkIiwgInJlZCIsICJMaWZlcGF0aEljb24iLCAiR3JpZEljb24iLCAiZmxhdE1hcCIsICJtYXAiLCAiYyIsICJIT1QiLCAiQkciLCAiQ2hyb21lIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgIlByb3RvY29sU3RhbXAiLCAiTGVnYWxGb290ZXIiLCAibm9kZSIsICJzdHlsZSIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJib3R0b20iLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJ0ZXh0IiwgIlQiLCAibWljcm8iLCAiZm9udFNpemUiLCAic3ZnIiwgInZpZXdCb3giLCAid2lkdGgiLCAiaGVpZ2h0IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAiQyIsICJyZWQiLCAiY29ybmVyTWFzayIsICJjdXQiLCAibGluZSIsICJjb2xvciIsICJkIiwgIk1hdGgiLCAiU1FSVDIiLCAiY2xlYXIiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAicG9zaXRpb24iLCAiYWJzIiwgInMiLCAiSG90RnJhbWUiLCAiYmFyIiwgInN0ZXAiLCAiaW5uZXIiLCAibWF4IiwgInRvcCIsICJyaWdodCIsICJmaWx0ZXIiLCAibmFtZSIsICJwYXJhbXMiLCAib2Zmc2V0WCIsICJvZmZzZXRZIiwgInNwcmVhZCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiY2hhbWZlciIsICJ1bmRlZmluZWQiLCAiQ29sZEZyYW1lIiwgInRpY2siLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgIkJhcmNvZGUiLCAic2VlZCIsICJyIiwgInJuZyIsICJ4IiwgInciLCAiZmxvb3IiLCAicGF0aCIsICJMZXZlbEJhZGdlIiwgImxhYmVsIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJqdXN0aWZ5Q29udGVudCIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAibGluZUJyZWFrIiwgIk5hdkJ1dHRvbnMiLCAib25CYWNrIiwgIm9uTmV4dCIsICJuZXh0IiwgIk5hdkJ1dHRvbiIsICJrIiwgImNvcm5lciIsICJvbkNsaWNrIiwgImJ1dHRvbiIsICJob3ZlclN0eWxlIiwgIktleWNhcCIsICJtZW51IiwgIkljb25IaW50IiwgImljb24iLCAiQ1giLCAiYXQiLCAiYSIsICJzIiwgIm1hcCIsICJ2IiwgImkiLCAiU0NBUiIsICJNRVRBTCIsICJNYXJrcyIsICJoZWFkIiwgImluayIsICJub3NlWSIsICJlYXIiLCAibW91dGgiLCAibW91dGhXIiwgInNtaWxlIiwgImxpbmUiLCAiY29sb3IiLCAidyIsICJmaWxsIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJtYWtldXAiLCAidGF0dG9vIiwgInNjYXJzIiwgImN5YmVyIiwgIm1ldGFsIiwgImxpcHMiLCAiY2hyb21lIiwgIm4iLCAicGllcmNlZCIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJwb2x5bGluZSIsICJDIiwgImN5YW4iLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAieCIsICJmaWx0ZXIiLCAieSIsICJmbGF0TWFwIiwgInJlY3QiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImQiLCAibWl4IiwgImEiLCAiYiIsICJ0IiwgInAiLCAiaCIsICJpIiwgInBhcnNlSW50IiwgInNsaWNlIiwgImMiLCAibWFwIiwgIk1hdGgiLCAicm91bmQiLCAidiIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJqb2luIiwgInB0cyIsICJBcnJheSIsICJmcm9tIiwgImxlbmd0aCIsICJfIiwgImZsYXQiLCAicyIsICJhdCIsICJIRUFEIiwgIlNIT1VMREVSUyIsICJKQVciLCAiQ0hJTiIsICJCUk9XUyIsICJOT1NFUyIsICJNT1VUSFMiLCAiRUFSUyIsICJtaXJyb3IiLCAiaGFsZiIsICJyZXZlcnNlIiwgImNob3JkIiwgInkiLCAieDAiLCAieTAiLCAieDEiLCAieTEiLCAiY3Jvd24iLCAiaGVhZCIsICJ0aGljayIsICJoYWlybGluZSIsICJvdXQiLCAiZmlsdGVyIiwgIngiLCAiZHkiLCAibCIsICJoeXBvdCIsICJlZGdlIiwgImJyb3ciLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAiQ1giLCAiY29zIiwgIlBJIiwgInNpbiIsICJib3RoIiwgImhhaXIiLCAic3R5bGUiLCAiYmFjayIsICJmcm9udCIsICJHUklEIiwgImQiLCAiUG9ydHJhaXQiLCAibG9vayIsICJib2R5IiwgIndpZHRoIiwgImlkIiwgInNraW4iLCAiU0tJTl9UT05FUyIsICJoYWlyQ29sb3IiLCAiSEFJUl9DT0xPUlMiLCAiaGFpckxpbmUiLCAibGluZSIsICJjb250b3VyIiwgImphdyIsICJrIiwgIm1pbiIsICJtYXgiLCAic2hvdWxkZXJzIiwgInJhaXNlIiwgImJyb3dXIiwgImFyY2giLCAibm9zZVkiLCAibm9zZVciLCAibW91dGhXIiwgInNtaWxlIiwgImVhciIsICJmcmVja2xlcyIsICJybmciLCAic3Ryb2tlIiwgImNvbG9yIiwgInciLCAiZmlsbCIsICJzdHJva2VXaWR0aCIsICJfanN4cyIsICJzdmciLCAidmlld0JveCIsICJoZWlnaHQiLCAiX2pzeCIsICJwYXRoIiwgIkMiLCAiY3lhbiIsICJvcGFjaXR5IiwgInBvbHlnb24iLCAicG9pbnRzIiwgInBvbHlsaW5lIiwgIngyIiwgInkyIiwgImYiLCAiZmxhdE1hcCIsICJnIiwgIkVZRV9DT0xPUlMiLCAiTWFya3MiLCAiaW5rIiwgIm1vdXRoIiwgInJlY3QiLCAiUlVMRSIsICJSYWRhciIsICJhdHRyaWJ1dGVzIiwgIlIiLCAiYXQiLCAiaSIsICJyIiwgImEiLCAiTWF0aCIsICJQSSIsICJjb3MiLCAic2luIiwgInJpbmciLCAiZmxhdE1hcCIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJ0ZXh0IiwgInN0eWxlIiwgIlQiLCAibWljcm8iLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgImZvbnRTaXplIiwgImxldHRlclNwYWNpbmciLCAic3ZnIiwgInZpZXdCb3giLCAid2lkdGgiLCAiaGVpZ2h0IiwgIm1hcCIsICJsIiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgImxpbmUiLCAieDEiLCAieTEiLCAieDIiLCAieTIiLCAiQVRUUklCVVRFUyIsICJpZCIsICJDIiwgInJlZCIsICJvcGFjaXR5IiwgImNpcmNsZSIsICJjeCIsICJjeSIsICJjeWFuIiwgIngiLCAieSIsICJjb2xvciIsICJjeWFuRGltIiwgInNob3J0IiwgIm5vZGUiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAiYWxpZ25JdGVtcyIsICJBcnJheSIsICJmcm9tIiwgImxlbmd0aCIsICJBVFRSX01BWCIsICJfIiwgImJhY2tncm91bmRDb2xvciIsICJmb250RmFtaWx5IiwgIkYiLCAiYm9sZCIsICJsaW5lQnJlYWsiLCAidG9TdHJpbmciLCAiVyIsICJIIiwgIklkQ2FyZCIsICJjaGFyYWN0ZXIiLCAib25DaGFuZ2UiLCAib25FZGl0aW5nIiwgInN0eWxlIiwgImZpZWxkIiwgInNldEZpZWxkIiwgInVzZVN0YXRlIiwgImVkaXRpbmciLCAic2V0RWRpdGluZyIsICJlZGl0IiwgIm9uIiwgInVzZUtleXMiLCAiZSIsICJrZXkiLCAic2NhbiIsICJ1c2VTaGFyZWRWYWx1ZSIsICJsb29rS2V5IiwgIkpTT04iLCAic3RyaW5naWZ5IiwgImxvb2siLCAiYm9keSIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aFNlcXVlbmNlIiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgImxpZmVwYXRoIiwgIkxJRkVQQVRIUyIsICJmaW5kIiwgImwiLCAiaWQiLCAiZGlmZmljdWx0eSIsICJESUZGSUNVTFRJRVMiLCAiZCIsICJfanN4cyIsICJub2RlIiwgImNoYW1mZXIiLCAid2lkdGgiLCAiaGVpZ2h0IiwgIl9qc3giLCAiSGVhZCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImJhY2tncm91bmRDb2xvciIsICJvdmVyZmxvd1giLCAib3ZlcmZsb3dZIiwgIlBvcnRyYWl0IiwgInJpZ2h0IiwgIkMiLCAiY3lhbiIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgImludGVycG9sYXRlIiwgInRyYW5zZm9ybSIsICJ0cmFuc2xhdGVZIiwgInRleHQiLCAiVCIsICJtaWNybyIsICJjb2xvciIsICJjeWFuRGltIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImp1c3RpZnlDb250ZW50IiwgIkxhYmVsIiwgInJlZERpbSIsICJlZGl0YWJsZVRleHQiLCAiaGFuZGxlIiwgIm1heExlbmd0aCIsICJ2IiwgInRvVXBwZXJDYXNlIiwgIm9uRm9jdXMiLCAib25CbHVyIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJib3R0b20iLCAiZm9udFNpemUiLCAiZm9udEZhbWlseSIsICJGIiwgImJvbGQiLCAibGV0dGVyU3BhY2luZyIsICJjdXJzb3IiLCAiZm9jdXNTdHlsZSIsICJGaWVsZCIsICJsYWJlbCIsICJtb25vIiwgIndoaXRlIiwgImxpbmVCcmVhayIsICJyZXNpZGVudElkIiwgImFsaWduSXRlbXMiLCAiTGlmZXBhdGhJY29uIiwgIlZhbHVlIiwgIm5hbWUiLCAiVk9JQ0UiLCAibmFtZXMiLCAidm9pY2UiLCAiUlVMRSIsICJSYWRhciIsICJhdHRyaWJ1dGVzIiwgIkJhcmNvZGUiLCAic2VlZCIsICJoYXNoIiwgInJlZCIsICJyZXBsYWNlIiwgInRvU3RyaW5nIiwgIl9GcmFnbWVudCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJzdmciLCAidmlld0JveCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJmaWxsIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJyZWN0IiwgIngiLCAieSIsICJyeCIsICJwYXRoIiwgImNoaWxkcmVuIiwgInNlbWlib2xkIiwgIlN3YXRjaGVzIiwgIm9wdGlvbiIsICJ2YWx1ZSIsICJvblBpY2siLCAib25DbG9zZSIsICJlbnRlciIsICJ1c2VFbnRlciIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAibm9kZSIsICJzdHlsZSIsICJwb3NpdGlvblR5cGUiLCAicmlnaHQiLCAidG9wIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImFsaWduSXRlbXMiLCAicGFkZGluZyIsICJsZWZ0IiwgIl9qc3giLCAiRGF0YU5vaXNlIiwgInNlZWQiLCAibGluZXMiLCAiZ3JvdXBzIiwgImZvbnRTaXplIiwgInRleHQiLCAiVCIsICJtZW51IiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJsYWJlbCIsICJmbGV4R3JvdyIsICJib2xkIiwgImNvbG9yIiwgIkMiLCAicmVkIiwgImxpbmVCcmVhayIsICJjaGFtZmVyIiwgImJvdHRvbSIsICJmbGV4V3JhcCIsICJzd2F0Y2hlcyIsICJtYXAiLCAiaSIsICJidXR0b24iLCAib25Qb2ludGVyRW50ZXIiLCAic2Z4IiwgIm9uQ2xpY2siLCAiaGVpZ2h0IiwgImp1c3RpZnlDb250ZW50IiwgImhvdmVyU3R5bGUiLCAiY3lhbiIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYmFja2dyb3VuZENvbG9yIiwgIm1pY3JvIiwgInJlZERpbSIsICJpZCIsICJ0b1VwcGVyQ2FzZSIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJLZXljYXAiLCAiayIsICJQTEFURSIsICJTVEVQIiwgIkVER0UiLCAiQXBwZWFyYW5jZSIsICJjaGFyYWN0ZXIiLCAib25DaGFuZ2UiLCAibmV4dCIsICJiYWNrIiwgImdyaWQiLCAic2V0R3JpZCIsICJ1c2VTdGF0ZSIsICJlZGl0aW5nIiwgInNldEVkaXRpbmciLCAic2Nyb2xsIiwgInNldFNjcm9sbCIsICJzZXRMb29rIiwgImlkIiwgInZhbHVlIiwgImxvb2siLCAic3RlcCIsICJjb3VudCIsICJieSIsICJzZngiLCAib3B0aW9uIiwgIkxPT0tfT1BUSU9OUyIsICJmaW5kIiwgIm8iLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJjb2RlIiwgInVzZURlYnVnIiwgImFyZyIsICJuIiwgInNwbGl0IiwgIk51bWJlciIsICJweCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJDaHJvbWUiLCAiSGVhZGVyIiwgInRpdGxlIiwgImNhcHRpb24iLCAiaWNvbiIsICJTdGVwSWNvbiIsICJraW5kIiwgIlByZXNldHMiLCAiSWRDYXJkIiwgIm9uRWRpdGluZyIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAiU3dhdGNoZXMiLCAib25QaWNrIiwgImkiLCAib25DbG9zZSIsICJzY3JvbGxUb3AiLCAiZGlzcGxheSIsICJyaWdodCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAib3ZlcmZsb3dZIiwgInNjcm9sbGJhciIsICJ0cmFjayIsICJiYWNrZ3JvdW5kQ29sb3IiLCAidGh1bWIiLCAiaG92ZXIiLCAiQyIsICJyZWRIaSIsICJ0aGlja25lc3MiLCAibWluVGh1bWJMZW5ndGgiLCAiUHJvbm91bnMiLCAibmFtZSIsICJoYW5kbGVPZiIsICJ2b2ljZSIsICJSb3ciLCAibGFiZWwiLCAiVk9JQ0UiLCAibmFtZXMiLCAib25TdGVwIiwgIm1hcCIsICJ0d28iLCAic3dhdGNoIiwgInN3YXRjaGVzIiwgIm9uR3JpZCIsICJ1bmRlZmluZWQiLCAiTmF2QnV0dG9ucyIsICJvbkJhY2siLCAib25OZXh0IiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJJY29uSGludCIsICJXaGVlbEljb24iLCAiYWxpZ25JdGVtcyIsICJXYXJuaW5nSWNvbiIsICJzaXplIiwgInRleHQiLCAiVCIsICJtaWNybyIsICJmb250U2l6ZSIsICJjb2xvciIsICJyZWQiLCAibGluZUJyZWFrIiwgImxpbmVIZWlnaHQiLCAiY2hhbWZlciIsICJqdXN0aWZ5Q29udGVudCIsICJwYWRkaW5nIiwgImhvdmVyU3R5bGUiLCAib25Qb2ludGVyRW50ZXIiLCAiU3RlcEJ1dHRvbiIsICJzaWRlIiwgIm9uQ2xpY2siLCAiQXJyb3ciLCAiZGlyIiwgIkdyaWRJY29uIiwgImNoaWxkcmVuIiwgImNvcm5lciIsICJidXR0b24iLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImZsZXhHcm93IiwgImZsZXhCYXNpcyIsICJtZW51IiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJtYXJnaW4iLCAiYm90dG9tIiwgIlBSRVNFVFMiLCAicCIsICJvbiIsICJPYmplY3QiLCAiZW50cmllcyIsICJldmVyeSIsICJ2IiwgIlBvcnRyYWl0IiwgImJvZHkiLCAiYm9sZCIsICJpbXBvcnRfcmVhY3QiLCAiREFSSyIsICJFREdFIiwgIkxJVCIsICJBdHRyaWJ1dGVzIiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJuZXh0IiwgImJhY2siLCAiaG90IiwgInNldEhvdCIsICJ1c2VTdGF0ZSIsICJlZGl0aW5nIiwgInNldEVkaXRpbmciLCAidmFsdWVzIiwgImF0dHJpYnV0ZXMiLCAic3BlbnQiLCAiQVRUUklCVVRFUyIsICJyZWR1Y2UiLCAibiIsICJhIiwgImlkIiwgIkFUVFJfTUlOIiwgInBvaW50cyIsICJBVFRSX1BPSU5UUyIsICJjaGFuZ2UiLCAiYnkiLCAidiIsICJBVFRSX01BWCIsICJzZngiLCAiaG92ZXIiLCAiaSIsICJ1c2VLZXlzIiwgImUiLCAicmVwZWF0IiwgImtleSIsICJjb2RlIiwgIk1hdGgiLCAibWF4IiwgIm1pbiIsICJsZW5ndGgiLCAidXNlRGVidWciLCAiTnVtYmVyIiwgImFyZyIsICJzcGxpdCIsICJtYXAiLCAiT2JqZWN0IiwgImZyb21FbnRyaWVzIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgIkNocm9tZSIsICJIZWFkZXIiLCAidGl0bGUiLCAiY2FwdGlvbiIsICJpY29uIiwgIlN0ZXBJY29uIiwgImtpbmQiLCAic3RlcCIsICJFeHBsYWluZXIiLCAibmFtZSIsICJ0ZXh0IiwgImVmZmVjdHMiLCAidmFsdWUiLCAiSWRDYXJkIiwgIm9uRWRpdGluZyIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAiVCIsICJtZW51IiwgInJpZ2h0IiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJidXR0b24iLCAib25DbGljayIsICJORVdfQ0hBUkFDVEVSIiwgImNoYW1mZXIiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAiaG92ZXJTdHlsZSIsICJDIiwgInJlZCIsICJjb2xvciIsICJsaW5lQnJlYWsiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgInRvU3RyaW5nIiwgImF0dHIiLCAiQXR0cmlidXRlUm93IiwgImxpdCIsICJjYW5BZGQiLCAib25FbnRlciIsICJOYXZCdXR0b25zIiwgIm9uQmFjayIsICJvbk5leHQiLCAiSGludHMiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAiS2V5Y2FwIiwgImsiLCAiSGludCIsICJsYWJlbCIsICJmaWxsIiwgImVkZ2UiLCAiYm94IiwgImNvcm5lciIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYmFkZ2UiLCAib25Qb2ludGVyRW50ZXIiLCAiQXR0cmlidXRlSWNvbiIsICJMZXZlbEJhZGdlIiwgIlNpZ24iLCAicGx1cyIsICJvZmYiLCAiZmxleEdyb3ciLCAiY3lhbiIsICJzdmciLCAidmlld0JveCIsICJfRnJhZ21lbnQiLCAicmVjdCIsICJ4IiwgInkiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgImxpbmUiLCAieDEiLCAieTEiLCAieDIiLCAieTIiLCAibWluSGVpZ2h0IiwgIm1hcmdpbiIsICJib3R0b20iLCAicGFkZGluZyIsICJsaW5lSGVpZ2h0IiwgImpvaW4iLCAiYm9sZCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgIkJVSUxEUyIsICJERVRBSUxTIiwgIkpPSU5UUyIsICJDWCIsICJzaWRlIiwgImEiLCAicyIsICJtYXAiLCAidiIsICJpIiwgIm1pcnJvciIsICJoYWxmIiwgImJhY2siLCAibGVuZ3RoIiwgInB1c2giLCAiRmlndXJlIiwgImJ1aWxkIiwgImNvbG9yIiwgImFjY2VudCIsICJoZWlnaHQiLCAib3V0bGluZSIsICJqb2ludHMiLCAiX2pzeHMiLCAic3ZnIiwgInZpZXdCb3giLCAic3R5bGUiLCAid2lkdGgiLCAiX2pzeCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJmaWxsIiwgIm9wYWNpdHkiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgInN0cm9rZUxpbmVqb2luIiwgImZsYXRNYXAiLCAibGluZSIsICJwb2x5bGluZSIsICJBcnJheSIsICJmcm9tIiwgIl8iLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAieSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJDQVJEIiwgIndpZHRoIiwgImhlaWdodCIsICJ0b3AiLCAibGVmdHMiLCAiZ2Vub21lIiwgInNlZWQiLCAiciIsICJybmciLCAiYmFzZSIsICJNYXRoIiwgImZsb29yIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgImpvaW4iLCAiR0VOT01FIiwgIkJvZHlUeXBlIiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJuZXh0IiwgImJhY2siLCAiaG90IiwgInNldEhvdCIsICJ1c2VTdGF0ZSIsICJib2R5IiwgImhvdmVyIiwgImkiLCAic2Z4IiwgInBpY2siLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJjb2RlIiwgInVzZURlYnVnIiwgIm4iLCAiTnVtYmVyIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJfanN4IiwgIkNocm9tZSIsICJIZWFkZXIiLCAidGl0bGUiLCAiY2FwdGlvbiIsICJoYW5kbGVPZiIsICJpY29uIiwgIlN0ZXBJY29uIiwgImtpbmQiLCAic3RlcCIsICJtYXAiLCAibGVmdCIsICJsaXQiLCAiYnV0dG9uIiwgIm9uUG9pbnRlckVudGVyIiwgIm9uQ2xpY2siLCAicG9zaXRpb25UeXBlIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImNvbG9yIiwgInVuZGVmaW5lZCIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJtb25vIiwgImxpbmVIZWlnaHQiLCAibGV0dGVyU3BhY2luZyIsICJsaW5lQnJlYWsiLCAiVCIsICJtaWNybyIsICJhbGlnbkl0ZW1zIiwgInBhZGRpbmciLCAiRmlndXJlIiwgImJ1aWxkIiwgIkMiLCAiY3lhbiIsICJhY2NlbnQiLCAiTWFyayIsICJIb3RGcmFtZSIsICJiYXIiLCAiY3V0IiwgIkNvbGRGcmFtZSIsICJsaW5lIiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJsYWJlbCIsICJyZWQiLCAiYm90dG9tIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAiYm9sZCIsICJpbXBvcnRfcmVhY3QiLCAiRGlmZmljdWx0eSIsICJjaGFyYWN0ZXIiLCAib25DaGFuZ2UiLCAibmV4dCIsICJiYWNrIiwgImhvdCIsICJzZXRIb3QiLCAidXNlU3RhdGUiLCAiTWF0aCIsICJtYXgiLCAiRElGRklDVUxUSUVTIiwgImZpbmRJbmRleCIsICJkIiwgImlkIiwgImRpZmZpY3VsdHkiLCAidXNlRWZmZWN0IiwgImJldnkiLCAiZGlvcmFtYXMiLCAibGV2ZWwiLCAiaG92ZXIiLCAiaSIsICJzZngiLCAicGljayIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgIm1pbiIsICJsZW5ndGgiLCAiY29kZSIsICJ1c2VEZWJ1ZyIsICJuIiwgIk51bWJlciIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJDZW50ZXJlZEhlYWRlciIsICJ0aXRsZSIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJhY2tncm91bmRDb2xvciIsICJwb3J0YWwiLCAidGFyZ2V0IiwgImNhY2hlIiwgIkhvdEZyYW1lIiwgImJhciIsICJjdXQiLCAic3RlcCIsICJ0ZXh0IiwgIlQiLCAiYm9keSIsICJmb250U2l6ZSIsICJsaW5lSGVpZ2h0IiwgIkRJRkZJQ1VMVFlfVEVYVCIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJtYXAiLCAiTGV2ZWxCdXR0b24iLCAibGFiZWwiLCAibmFtZSIsICJzZWVkIiwgIm9uRW50ZXIiLCAib25DbGljayIsICJIaW50cyIsICJIaW50IiwgImsiLCAiUExBVEUiLCAibGluZSIsICJidXR0b24iLCAib25Qb2ludGVyRW50ZXIiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJzdmciLCAidmlld0JveCIsICJmaWx0ZXIiLCAicGFyYW1zIiwgImNvbG9yIiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJzcHJlYWQiLCAidW5kZWZpbmVkIiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgInJlY3QiLCAieCIsICJ5IiwgIkMiLCAiY3lhbiIsICJsZXR0ZXJTcGFjaW5nIiwgImxpbmVCcmVhayIsICJCYXJjb2RlIiwgInQiLCAibWljcm8iLCAicmVkIiwgInJ1bGUiLCAiZmFpbnQiLCAicmlnaHQiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAicmVkTGluZSIsICJTdGVwSWNvbiIsICJraW5kIiwgImltcG9ydF9yZWFjdCIsICJDQVJEIiwgIndpZHRoIiwgImhlaWdodCIsICJwaXRjaCIsICJsZWZ0IiwgInRvcCIsICJMaWZlcGF0aCIsICJjaGFyYWN0ZXIiLCAib25DaGFuZ2UiLCAibmV4dCIsICJiYWNrIiwgImhvdCIsICJzZXRIb3QiLCAidXNlU3RhdGUiLCAiTWF0aCIsICJtYXgiLCAiTElGRVBBVEhTIiwgImZpbmRJbmRleCIsICJsIiwgImlkIiwgImxpZmVwYXRoIiwgImhvdmVyIiwgImkiLCAic2Z4IiwgInBpY2siLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJtaW4iLCAibGVuZ3RoIiwgImNvZGUiLCAidXNlRGVidWciLCAibiIsICJOdW1iZXIiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgIl9qc3giLCAiQ2hyb21lIiwgIkhlYWRlciIsICJ0aXRsZSIsICJjYXB0aW9uIiwgImljb24iLCAiU3RlcEljb24iLCAia2luZCIsICJzdGVwIiwgIm1hcCIsICJidXR0b24iLCAib25Qb2ludGVyRW50ZXIiLCAib25DbGljayIsICJwb3NpdGlvblR5cGUiLCAidGV4dCIsICJmb250U2l6ZSIsICJjb2xvciIsICJDIiwgInJlZCIsICJsaW5lQnJlYWsiLCAibmFtZSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAicG9ydGFsIiwgInRhcmdldCIsICJjYWNoZSIsICJIb3RGcmFtZSIsICJiYXIiLCAiY3V0IiwgIkNvbGRGcmFtZSIsICJsaW5lSGVpZ2h0IiwgIkxJRkVQQVRIX1RFWFQiLCAiSGludHMiLCAiSGludCIsICJrIiwgImxhYmVsIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJQQU5FTCIsICJTdW1tYXJ5IiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJiYWNrIiwgIm9uU3RhcnQiLCAiZWRpdGluZyIsICJzZXRFZGl0aW5nIiwgInVzZVN0YXRlIiwgImRvbmUiLCAic2V0RG9uZSIsICJlbnRlciIsICJ1c2VFbnRlciIsICJwcm9ncmVzcyIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aERlbGF5IiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgImZpbmlzaGVkIiwgInN0YXJ0IiwgInNmeCIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgImNvZGUiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgIl9qc3giLCAiQ2hyb21lIiwgIkhlYWRlciIsICJ0aXRsZSIsICJjYXB0aW9uIiwgImljb24iLCAiU3RlcEljb24iLCAia2luZCIsICJzdGVwIiwgIklkQ2FyZCIsICJvbkVkaXRpbmciLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgInJpZ2h0IiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImFsaWduSXRlbXMiLCAibWFwIiwgInciLCAiaSIsICJoZWlnaHQiLCAiYmFja2dyb3VuZENvbG9yIiwgIkMiLCAicmVkRGltIiwgInRleHQiLCAiVCIsICJtaWNybyIsICJmb250U2l6ZSIsICJjb2xvciIsICJjaGFtZmVyIiwgInBhZGRpbmciLCAiYm90dG9tIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJyZWQiLCAibGluZUJyZWFrIiwgIm1hcmdpbiIsICJhbmltYXRlZCIsICJpbnRlcnBvbGF0ZSIsICJmbGV4R3JvdyIsICJqdXN0aWZ5Q29udGVudCIsICJQZXJjZW50IiwgIk5hdkJ1dHRvbnMiLCAib25CYWNrIiwgIm9uTmV4dCIsICJuZXh0IiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJsYWJlbCIsICJESUdJVCIsICJFUFMiLCAiY29sdW1uIiwgImRpZ2l0IiwgImlucHV0IiwgIm91dHB1dCIsICJwdXNoIiwgImRpZ2l0cyIsICJNYXRoIiwgImZsb29yIiwgImZvbnQiLCAiYm9sZCIsICJsaW5lSGVpZ2h0IiwgInB4IiwgImQiLCAib3ZlcmZsb3dZIiwgInRleHRBbGlnbiIsICJ0cmFuc2Zvcm0iLCAidHJhbnNsYXRlWSIsICJTVEVQUyIsICJOZXdHYW1lIiwgImNoYXJhY3RlciIsICJvbkNoYW5nZSIsICJvbkJhY2siLCAib25TdGFydCIsICJzdGVwIiwgInNldFN0ZXAiLCAidXNlU3RhdGUiLCAicHJvcHMiLCAibmV4dCIsICJzZngiLCAiTWF0aCIsICJtaW4iLCAibGVuZ3RoIiwgImJhY2siLCAidXNlRGVidWciLCAicyIsICJtYXgiLCAiaW5kZXhPZiIsICJoIiwgImhhbmRsZSIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJjb2xvciIsICJwb3NpdGlvbiIsICJFZGdlUmFpbHMiLCAibW9ycGhGaWx0ZXIiLCAia2V5IiwgIm5hbWUiLCAidHJhbnNpdGlvbiIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAiRGlmZmljdWx0eSIsICJMaWZlcGF0aCIsICJCb2R5VHlwZSIsICJBcHBlYXJhbmNlIiwgIkF0dHJpYnV0ZXMiLCAiU3VtbWFyeSIsICJpbXBvcnRfcmVhY3QiLCAiUk9XX1dJRFRIIiwgIlJPV19IRUlHSFQiLCAiUk9XX1BJVENIIiwgIlRFWFRfTEVGVCIsICJQTEFURSIsICJMSU5FIiwgIlNsb3QiLCAiaW5kZXgiLCAic2VsZWN0ZWQiLCAib25TZWxlY3QiLCAib25DbGljayIsICJjaGlsZHJlbiIsICJlbnRlciIsICJ1c2VFbnRlciIsICJNYXRoIiwgIm1pbiIsICJfanN4IiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJzdHlsZSIsICJjaGFtZmVyIiwgIkMiLCAicmVkIiwgIndpZHRoIiwgImhlaWdodCIsICJmbGV4U2hyaW5rIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJwYWRkaW5nIiwgImxlZnQiLCAiVGh1bWIiLCAibm9kZSIsICJqdXN0aWZ5Q29udGVudCIsICJsaW5lIiwgImZvbnRTaXplIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJjb2xvciIsICJsaW5lQnJlYWsiLCAiU2F2ZVJvdyIsICJzYXZlIiwgImxpZmVwYXRoIiwgImNoYXJhY3RlciIsICJfanN4cyIsICJwb3J0YWwiLCAidGFyZ2V0IiwgImNhY2hlIiwgImZsZXhHcm93IiwgInJpZ2h0IiwgInRvcCIsICJib3R0b20iLCAidGV4dCIsICJjeWFuIiwgInF1ZXN0IiwgIm1hcmdpbiIsICJob3Jpem9udGFsIiwgIm5hbWUiLCAicGxheXRpbWUiLCAibG9jYXRpb24iLCAiTGlmZXBhdGhJY29uIiwgIkxJRkVQQVRIUyIsICJmaW5kIiwgImwiLCAiaWQiLCAibGV2ZWwiLCAiZGF0ZSIsICJOZXdTYXZlUm93IiwgIkRhdGFzaGFyZCIsICJzdmciLCAidmlld0JveCIsICJwb3NpdGlvblR5cGUiLCAicG9seWxpbmUiLCAicG9pbnRzIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJmaWxsIiwgImFsaWduU2VsZiIsICJMSVNUX1RPUCIsICJMSVNUX0hFSUdIVCIsICJST1dfUElUQ0giLCAiR1VUVEVSIiwgIlFVRVNUSU9OUyIsICJvdmVyd3JpdGUiLCAiZGVsZXRlIiwgIlNhdmVzIiwgIm1vZGUiLCAic2F2ZXMiLCAib25Mb2FkIiwgIm9uU2F2ZSIsICJvbkRlbGV0ZSIsICJvbkNsb3NlIiwgInNhdmluZyIsICJzbG90cyIsICJzZWxlY3RlZCIsICJzZXRTZWxlY3RlZCIsICJ1c2VTdGF0ZSIsICJhc2siLCAic2V0QXNrIiwgInNjcm9sbCIsICJzZXRTY3JvbGwiLCAic2VsZWN0IiwgImkiLCAic2Z4IiwgInBpY2siLCAic2F2ZSIsICJraW5kIiwgImluZGV4IiwgImFza0RlbGV0ZSIsICJhbnN3ZXIiLCAiTWF0aCIsICJtaW4iLCAibGVuZ3RoIiwgImNsb3NlIiwgInVzZUtleXMiLCAiZSIsICJtb2RhbE9wZW4iLCAia2V5IiwgImNvZGUiLCAidXNlRGVidWciLCAiTnVtYmVyIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiX2pzeCIsICJEZWNvciIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJyaWdodCIsICJ0b3AiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgIm9uU2Nyb2xsIiwgInNjcm9sbFRvcCIsICJ3aWR0aCIsICJST1dfV0lEVEgiLCAiaGVpZ2h0IiwgInBhZGRpbmciLCAiZ2FwIiwgIlJPV19IRUlHSFQiLCAib3ZlcmZsb3dZIiwgInNjcm9sbGJhcldpZHRoIiwgInNjcm9sbGJhciIsICJ0cmFjayIsICJ0aHVtYiIsICJDIiwgInJlZCIsICJob3ZlciIsICJyZWRIaSIsICJ0aGlja25lc3MiLCAibWFwIiwgIlNhdmVSb3ciLCAib25TZWxlY3QiLCAib25DbGljayIsICJpZCIsICJOZXdTYXZlUm93IiwgInRleHQiLCAiZm9udFNpemUiLCAiY29sb3IiLCAicmVkRGltIiwgIm1hcmdpbiIsICJIaW50cyIsICJIaW50IiwgImsiLCAibGFiZWwiLCAiZm9jdXNQb2xpY3kiLCAiaG92ZXJTdHlsZSIsICJQbGF0ZSIsICJpY29uIiwgIkRhdGFzaGFyZCIsICJvbkNvbmZpcm0iLCAib25DYW5jZWwiLCAiVEVYVF9MRUZUIiwgIkhlYWRlciIsICJ0aXRsZSIsICJfRnJhZ21lbnQiLCAic3ZnIiwgInZpZXdCb3giLCAicGF0aCIsICJkIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJmaWxsIiwgIlByb3RvY29sU3RhbXAiLCAianVzdGlmeUNvbnRlbnQiLCAicG9seWdvbiIsICJwb2ludHMiLCAicmVjdCIsICJ4IiwgInkiLCAicngiLCAiVCIsICJtaWNybyIsICJsaW5lSGVpZ2h0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJsaW5lQnJlYWsiLCAiREFTSEVTIiwgIkFycmF5IiwgImZyb20iLCAiXyIsICJqb2luIiwgInJhaWwiLCAic2lkZSIsICJyZWREZWVwIiwgImJvbGQiLCAidGV4dEFsaWduIiwgInRyYW5zZm9ybSIsICJyb3RhdGUiLCAiYm90dG9tIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJpbXBvcnRfcmVhY3QiLCAiV0lEVEgiLCAiRlJBTUUiLCAiRlJBTUVfSE9UIiwgIlZBTFVFIiwgImZvbnRTaXplIiwgImNvbG9yIiwgIkMiLCAiY3lhbiIsICJsaW5lQnJlYWsiLCAiU1RBR0UiLCAicG9zaXRpb25UeXBlIiwgInRvcCIsICJib3R0b20iLCAibGVmdCIsICJ3aWR0aCIsICJtYXJnaW4iLCAiQmFja2Ryb3AiLCAiX2pzeCIsICJub2RlIiwgInN0eWxlIiwgInJpZ2h0IiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgInBvc2l0aW9uIiwgIlN1YkhlYWRlciIsICJ0aXRsZSIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiaGVpZ2h0IiwgImJhY2tncm91bmRDb2xvciIsICJmbGV4RGlyZWN0aW9uIiwgImp1c3RpZnlDb250ZW50IiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAic3Ryb2tlIiwgInJlZCIsICJzdHJva2VXaWR0aCIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJsaW5lIiwgIngxIiwgInkxIiwgIngyIiwgInkyIiwgInRleHQiLCAiVCIsICJtaWNybyIsICJsaW5lSGVpZ2h0IiwgIlNlY3Rpb24iLCAibGFiZWwiLCAicGFkZGluZyIsICJzZWN0aW9uIiwgIlNldHRpbmdSb3ciLCAicm93IiwgInZhbHVlcyIsICJsaXN0ZW5pbmciLCAib25DaGFuZ2UiLCAib25MaXN0ZW4iLCAia2luZCIsICJ3aWRnZXQiLCAiU2VsZWN0b3IiLCAib3B0aW9ucyIsICJ2YWx1ZSIsICJOdW1iZXIiLCAiaWQiLCAidiIsICJUb2dnbGUiLCAiU2xpZGVyQmFyIiwgIktleUJpbmQiLCAiY29kZSIsICJTdHJpbmciLCAiSW5mbyIsICJSb3dGcmFtZSIsICJjaGlsZHJlbiIsICJvblBvaW50ZXJFbnRlciIsICJzZngiLCAiaG92ZXJTdHlsZSIsICJwbGF0ZSIsICJjaGFtZmVyIiwgImZpZWxkIiwgInN0ZXAiLCAiZCIsICJsZW5ndGgiLCAicGlwIiwgIk1hdGgiLCAibWluIiwgImhvcml6b250YWwiLCAiQXJyb3dCdXR0b24iLCAiZGlyIiwgIm9uQ2xpY2siLCAibWFwIiwgIl8iLCAiaSIsICJidXR0b24iLCAiQXJyb3ciLCAiaGFsZiIsICJvbiIsICJsaXQiLCAiaW5rIiwgImN5YW5IaSIsICJmb250RmFtaWx5IiwgIkYiLCAiYm9sZCIsICJsZXR0ZXJTcGFjaW5nIiwgIm1heCIsICJkZWNpbWFscyIsICJmbG9vciIsICJsb2cxMCIsICJzZXQiLCAiZSIsICJ0IiwgIngiLCAibmV4dCIsICJyb3VuZCIsICJ0b0ZpeGVkIiwgInVuZGVyIiwgImFicyIsICJvblBvaW50ZXJEb3duIiwgIm9uUG9pbnRlck1vdmUiLCAid2hpdGUiLCAic2VtaWJvbGQiLCAic3RhcnRzV2l0aCIsICJNb3VzZUljb24iLCAic2l6ZSIsICJpbmNsdWRlcyIsICJlbmRzV2l0aCIsICJLZXljYXAiLCAiayIsICJrZXlMYWJlbCIsICJLRVlfTkFNRVMiLCAiU3BhY2UiLCAiRW50ZXIiLCAiU2hpZnRMZWZ0IiwgIlNoaWZ0UmlnaHQiLCAiQ29udHJvbExlZnQiLCAiQ29udHJvbFJpZ2h0IiwgIkFsdExlZnQiLCAiQWx0UmlnaHQiLCAiVGFiIiwgIkJhY2tzcGFjZSIsICJDYXBzTG9jayIsICJBcnJvd1VwIiwgIkFycm93RG93biIsICJBcnJvd0xlZnQiLCAiQXJyb3dSaWdodCIsICJNaW51cyIsICJFcXVhbCIsICJCcmFja2V0TGVmdCIsICJCcmFja2V0UmlnaHQiLCAiU2VtaWNvbG9uIiwgIlF1b3RlIiwgIkNvbW1hIiwgIlBlcmlvZCIsICJTbGFzaCIsICJCYWNrc2xhc2giLCAiQmFja3F1b3RlIiwgInJlcGxhY2UiLCAidG9VcHBlckNhc2UiLCAic2xpY2UiLCAiQ29udHJvbFNjaGVtZSIsICJvbkJhY2siLCAiYmFjayIsICJzZngiLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIkZJTEwiLCAiX2pzeCIsICJCYWNrZHJvcCIsICJTdWJIZWFkZXIiLCAidGl0bGUiLCAiRWRnZVJhaWxzIiwgIlNUQUdFIiwgIkdhbWVwYWQiLCAiQ0FMTE9VVFMiLCAibWFwIiwgInNpZGUiLCAieCIsICJ5IiwgImljb24iLCAibGluZXMiLCAiTGFiZWwiLCAiSGludHMiLCAiSGludCIsICJrIiwgImxhYmVsIiwgIm9uQ2xpY2siLCAiU21hbGwiLCAiZ2x5cGgiLCAiVGFnIiwgImNoaWxkcmVuIiwgImxlZnQiLCAicG9zaXRpb25UeXBlIiwgInRvcCIsICJyaWdodCIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgImxpbmUiLCAidGV4dCIsICJUIiwgImxpbmVIZWlnaHQiLCAiaGVpZ2h0IiwgIm1pbldpZHRoIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJib3JkZXJSYWRpdXMiLCAiYmFja2dyb3VuZENvbG9yIiwgIkMiLCAiY3lhbiIsICJqdXN0aWZ5Q29udGVudCIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkYiLCAiYm9sZCIsICJjb2xvciIsICJsaW5lQnJlYWsiLCAiaW5rIiwgInN2ZyIsICJ2aWV3Qm94IiwgIndpZHRoIiwgInBvbHlnb24iLCAicG9pbnRzIiwgIlBMVVMiLCAiZmlsbCIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAiX0ZyYWdtZW50IiwgImNpcmNsZSIsICJjeCIsICJjeSIsICJyIiwgIkZhY2VHbHlwaCIsICJzaXplIiwgInMiLCAieDEiLCAieTEiLCAieDIiLCAieTIiLCAicG9seWxpbmUiLCAicmVjdCIsICJyeCIsICJkIiwgInciLCAibCIsICJmbGF0TWFwIiwgIkJPRFkiLCAiRkFDRSIsICJXSVJFUyIsICJyZWQiLCAiZGltIiwgInN0aWNrIiwgImkiLCAiY3lhbkRpbSIsICJwYXRoIiwgInN0cm9rZUxpbmVqb2luIiwgImciLCAidHJhbnNmb3JtIiwgInVuZGVmaW5lZCIsICJHYW1tYSIsICJvbkJhY2siLCAiZ2FtbWEiLCAiTnVtYmVyIiwgInVzZVNldHRpbmdzIiwgImJhY2siLCAic2Z4IiwgInVzZUtleXMiLCAiZSIsICJrZXkiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJGSUxMIiwgIl9qc3giLCAiQmFja2Ryb3AiLCAiU3ViSGVhZGVyIiwgInRpdGxlIiwgIkVkZ2VSYWlscyIsICJTVEFHRSIsICJUZXN0SW1hZ2UiLCAidGV4dCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJyaWdodCIsICJ0b3AiLCAiZm9udFNpemUiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImNvbG9yIiwgIkMiLCAicmVkIiwgInRleHRBbGlnbiIsICJ3aWR0aCIsICJmbGV4RGlyZWN0aW9uIiwgIlJvd0ZyYW1lIiwgImxhYmVsIiwgIkdBTU1BIiwgIlNsaWRlckJhciIsICJyb3ciLCAidmFsdWUiLCAib25DaGFuZ2UiLCAidiIsICJzZXRTZXR0aW5nIiwgImlkIiwgIkhpbnRzIiwgIkhpbnQiLCAiayIsICJvbkNsaWNrIiwgIlNMSUNFUyIsICJfRnJhZ21lbnQiLCAiY2hhbWZlciIsICJ1bmRlZmluZWQiLCAiaGVpZ2h0IiwgImJvcmRlciIsICJib3R0b20iLCAiYm9yZGVyQ29sb3IiLCAiYmFja2dyb3VuZENvbG9yIiwgImFsaWduSXRlbXMiLCAicGFkZGluZyIsICJmaWx0ZXIiLCAibmFtZSIsICJwYXJhbXMiLCAiV09SRE1BUktfQVNQRUNUIiwgIm1hcCIsICJlbmQiLCAiaSIsICJzdGFydCIsICJvdmVyZmxvd1giLCAib3ZlcmZsb3dZIiwgIk1hcmsiLCAiZGlnaXQiLCAic3ZnIiwgInZpZXdCb3giLCAiV09SRE1BUktfVklFV0JPWCIsICJwYXRoIiwgImQiLCAiV09SRE1BUktfUEFUSCIsICJmaWxsIiwgImdhcCIsICJsaW5lQnJlYWsiLCAibWFyZ2luIiwgImNoYW5nZSIsICJpZCIsICJ2YWx1ZSIsICJzZXRTZXR0aW5ncyIsICJwcmVzZXQiLCAiUFJFU0VUUyIsICJOdW1iZXIiLCAiQ1VTVE9NIiwgInNldFNldHRpbmciLCAiU2V0dGluZ3MiLCAib25DbG9zZSIsICJ0YWIiLCAic2V0VGFiIiwgInVzZVN0YXRlIiwgInN1YiIsICJzZXRTdWIiLCAibGlzdGVuaW5nIiwgInNldExpc3RlbmluZyIsICJ2YWx1ZXMiLCAidXNlU2V0dGluZ3MiLCAiaW5kZXgiLCAiVEFCUyIsICJmaW5kSW5kZXgiLCAidCIsICJyb3dzIiwgInBpY2siLCAic2Z4IiwgInN0ZXAiLCAiZCIsICJsZW5ndGgiLCAicmVzdG9yZSIsICJkZWZhdWx0cyIsICJvcGVuIiwgInMiLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJjb2RlIiwgInVzZURlYnVnIiwgInNvbWUiLCAieCIsICJhcmciLCAidiIsICJzcGxpdCIsICJfanN4IiwgIkdhbW1hIiwgIm9uQmFjayIsICJDb250cm9sU2NoZW1lIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiRklMTCIsICJCYWNrZHJvcCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJyaWdodCIsICJ0b3AiLCAiaGVpZ2h0IiwgImJhY2tncm91bmRDb2xvciIsICJQcm90b2NvbFN0YW1wIiwgIkVkZ2VSYWlscyIsICJUYWJzIiwgIm9uUGljayIsICJvblN0ZXAiLCAiZmxleERpcmVjdGlvbiIsICJqdXN0aWZ5Q29udGVudCIsICJ3aWR0aCIsICJmbGV4U2hyaW5rIiwgIm1vcnBoRmlsdGVyIiwgIm5hbWUiLCAidWlHbGl0Y2giLCAidHJhbnNpdGlvbiIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAib3ZlcmZsb3dZIiwgInNjcm9sbGJhciIsICJ0cmFjayIsICJ0aHVtYiIsICJob3ZlciIsICJDIiwgInJlZEhpIiwgInRoaWNrbmVzcyIsICJtaW5UaHVtYkxlbmd0aCIsICJzY3JvbGxTdGVwIiwgIm1hcCIsICJyb3ciLCAiaSIsICJTZXR0aW5nUm93IiwgIm9uQ2hhbmdlIiwgIm9uTGlzdGVuIiwgImdhcCIsICJtYXJnaW4iLCAiU2lkZUJ1dHRvbiIsICJsYWJlbCIsICJrIiwgIm9uQ2xpY2siLCAiQ3V0QnV0dG9uIiwgImFsaWduSXRlbXMiLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImZvbnRTaXplIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAicmVkRGltIiwgInJlY3QiLCAieSIsICJCYWRnZSIsICJIaW50cyIsICJIaW50IiwgImJ1dHRvbiIsICJLZXljYXAiLCAiaG92ZXJTdHlsZSIsICJjb2xvciIsICJjeWFuIiwgInJlZCIsICJsaW5lQnJlYWsiLCAiU0lERV9GUkFNRSIsICJjaGFtZmVyIiwgImJvdHRvbSIsICJwYWRkaW5nIiwgImxldHRlclNwYWNpbmciLCAiYm9yZGVyIiwgIl9GcmFnbWVudCIsICJib3JkZXJDb2xvciIsICJib3JkZXJSYWRpdXMiLCAiZm9udEZhbWlseSIsICJGIiwgImJvbGQiLCAibGluZUhlaWdodCIsICJ0ZXh0QWxpZ24iLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIklOSyIsICJjYXJkIiwgImRlbGF5IiwgImhvbGQiLCAid2l0aERlbGF5IiwgIndpdGhTZXF1ZW5jZSIsICJ3aXRoVGltaW5nIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJTcGxhc2giLCAib25Eb25lIiwgIm1hcmtzIiwgInVzZVNoYXJlZFZhbHVlIiwgIm5vdGljZSIsICJkb25lIiwgInVzZVJlZiIsICJjdXJyZW50IiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ0IiwgInNldFRpbWVvdXQiLCAiY2xlYXJUaW1lb3V0IiwgInVzZUtleXMiLCAiY2VudGVyIiwgIkZJTEwiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJfanN4cyIsICJidXR0b24iLCAic3R5bGUiLCAiYmFja2dyb3VuZENvbG9yIiwgIm9uQ2xpY2siLCAiX2pzeCIsICJub2RlIiwgIm9wYWNpdHkiLCAiYW5pbWF0ZWQiLCAid2lkdGgiLCAiZmxleERpcmVjdGlvbiIsICJmbGV4V3JhcCIsICJyb3dHYXAiLCAiTWFyayIsICJMb2dvIiwgInNyYyIsICJXb3JkIiwgInNpemUiLCAiZ2FwIiwgImhlaWdodCIsICJib3JkZXJSYWRpdXMiLCAiY29sb3IiLCAiZm9udCIsICJGIiwgInNlbWlib2xkIiwgIm1vbm8iLCAidGV4dCIsICJmb250U2l6ZSIsICJsaW5lSGVpZ2h0IiwgInRleHRBbGlnbiIsICJjaGlsZHJlbiIsICJpbWFnZSIsICJ0aW50IiwgImJvbGQiLCAiZm9udEZhbWlseSIsICJsaW5lQnJlYWsiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIlRpdGxlIiwgIm9uQ29udGludWUiLCAiYnJlYWNoaW5nIiwgInNldEJyZWFjaGluZyIsICJ1c2VTdGF0ZSIsICJnbyIsICJzZngiLCAic2V0VGltZW91dCIsICJ1c2VLZXlzIiwgImUiLCAia2V5IiwgInN3YXkiLCAidXNlU2hhcmVkVmFsdWUiLCAidXNlRWZmZWN0IiwgInZhbHVlIiwgIndpdGhSZXBlYXQiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAicmV2ZXJzZSIsICJfanN4cyIsICJidXR0b24iLCAic3R5bGUiLCAiRklMTCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQyIsICJjbGVhciIsICJvbkNsaWNrIiwgIl9qc3giLCAiV29yZG1hcmsiLCAid2lkdGgiLCAiZ2xpdGNoIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJ0cmFuc2Zvcm0zZCIsICJwZXJzcGVjdGl2ZSIsICJyb3RhdGVYIiwgImFuaW1hdGVkIiwgImludGVycG9sYXRlIiwgInJvdGF0ZVkiLCAicm90YXRlWiIsICJub2RlIiwgInJpZ2h0IiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAidGV4dCIsICJUIiwgIm1pY3JvIiwgImNvbG9yIiwgInJlZERpbSIsICJoZWlnaHQiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgInJlZCIsICJqdXN0aWZ5Q29udGVudCIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAiY3lhbiIsICJsZXR0ZXJTcGFjaW5nIiwgImZpbHRlciIsICJuYW1lIiwgInBhcmFtcyIsICJpbnRlbnNpdHkiLCAiZnJlcXVlbmN5IiwgInRlYXIiLCAiX0ZyYWdtZW50IiwgIm1lbnUiLCAiS2V5Y2FwIiwgImsiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgIkRhdGFOb2lzZSIsICJzZWVkIiwgImxpbmVzIiwgImdyb3VwcyIsICJSdWxlIiwgIm1hcmdpbiIsICJNQUlOIiwgImlkIiwgImxhYmVsIiwgIlBBVVNFIiwgIk1PUlBIX01TIiwgIkFwcCIsICJzY3JlZW4iLCAic2V0U2NyZWVuIiwgInVzZVN0YXRlIiwgImNoYXJhY3RlciIsICJzZXRDaGFyYWN0ZXIiLCAiTkVXX0NIQVJBQ1RFUiIsICJzYXZlcyIsICJzZXRTYXZlcyIsICJTRUVEX1NBVkVTIiwgImdhbWUiLCAic2V0R2FtZSIsICJpbkdhbWUiLCAic2V0SW5HYW1lIiwgImRpYWxvZyIsICJzZXREaWFsb2ciLCAiZGVidWdQb3J0YWwiLCAic2V0RGVidWdQb3J0YWwiLCAic2V0dGluZ3MiLCAidXNlU2V0dGluZ3MiLCAidXNlTGl2ZVNldHRpbmdzIiwgIm1vcnBoIiwgInNldE1vcnBoIiwgInRpbWVycyIsICJ1c2VSZWYiLCAiZ28iLCAibmV4dCIsICJhcHBseSIsICJ0IiwgImN1cnJlbnQiLCAiY2xlYXJUaW1lb3V0IiwgImVuZCIsICJmbGlwIiwgInNldFRpbWVvdXQiLCAibWVudSIsICJsaWZlcGF0aCIsICJ1c2VFZmZlY3QiLCAiYmV2eSIsICJkaW9yYW1hcyIsICJ3b3JsZCIsICJwbGF5IiwgInNhdmUiLCAicGljayIsICJzZngiLCAidGV4dCIsICJvbkNvbmZpcm0iLCAibG9jYXRpb24iLCAiYXBwIiwgInF1aXQiLCAicmVsb2FkIiwgInN0YXJ0IiwgIlBST0xPR1VFIiwgIm5hbWUiLCAibGV2ZWwiLCAicGxheXRpbWUiLCAiZGF0ZSIsICJzdGFtcCIsICJsb2FkIiwgIm92ZXJ3cml0ZSIsICJNYXRoIiwgIm1heCIsICJtYXAiLCAicyIsICJmcmVzaCIsICJmaWx0ZXIiLCAidXNlS2V5cyIsICJlIiwgImtleSIsICJ1c2VEZWJ1ZyIsICJhcmciLCAic3BsaXQiLCAibCIsICJwYXVzZWQiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiX2pzeCIsICJXb3JsZCIsICJmaWxtR3JhaW4iLCAiRklMTCIsICJwYXJhbXMiLCAiYW1vdW50IiwgImNhY2hlIiwgIm1vcnBoRmlsdGVyIiwgInVpR2xpdGNoIiwgInNwcmVhZCIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJTcGxhc2giLCAib25Eb25lIiwgIlRpdGxlIiwgIm9uQ29udGludWUiLCAiTWFpbk1lbnUiLCAiZW50cmllcyIsICJvblBpY2siLCAib25CYWNrIiwgInVuZGVmaW5lZCIsICJ2ZXJzaW9uIiwgIk5ld0dhbWUiLCAib25DaGFuZ2UiLCAib25TdGFydCIsICJTYXZlcyIsICJtb2RlIiwgIm9uTG9hZCIsICJvblNhdmUiLCAib25EZWxldGUiLCAieCIsICJvbkNsb3NlIiwgIlNldHRpbmdzIiwgIkNyZWRpdHMiLCAiTG9hZGluZyIsICJHYW1lSHVkIiwgIm9uUGF1c2UiLCAiQ29uZmlybSIsICJvbkNhbmNlbCIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgInBvcnRhbCIsICJ0YXJnZXQiLCAiTnVtYmVyIiwgInNjYW5saW5lcyIsICJiYWNrZ3JvdW5kSW1hZ2UiLCAiU0NBTkxJTkVTIiwgImQiLCAiRGF0ZSIsICJoIiwgImdldEhvdXJzIiwgIm0iLCAiZ2V0TWludXRlcyIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJhbXBtIiwgIm1tIiwgImdldE1vbnRoIiwgImRkIiwgImdldERhdGUiLCAibW91bnQiLCAiX2pzeCIsICJBcHAiXQp9Cg==
