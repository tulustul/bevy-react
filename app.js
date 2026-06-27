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
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
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
  var import_jsx_runtime53 = __toESM(require_jsx_runtime(), 1);
  var import_bevy_react10 = __toESM(require_bevy_react(), 1);

  // src/App.tsx
  var import_jsx_runtime52 = __toESM(require_jsx_runtime(), 1);
  var import_react39 = __toESM(require_react(), 1);

  // src/bevy.ts
  var import_bevy_react = __toESM(require_bevy_react(), 1);
  function emit(name, value) {
    (0, import_bevy_react.emit)(name, value);
  }
  function request(name, value) {
    return (0, import_bevy_react.request)(name, value);
  }
  function on(name, cb) {
    (0, import_bevy_react.addEventListener)(name, cb);
    return () => (0, import_bevy_react.removeEventListener)(name, cb);
  }
  function removeEventListener(name, cb) {
    (0, import_bevy_react.removeEventListener)(name, cb);
  }
  var bevy = {
    emit,
    request,
    on,
    addEventListener: on,
    removeEventListener,
    basicDemo: {
      setCount(value) {
        emit("basicDemo.setCount", value);
      }
    },
    crowdedCubes: {
      followRandom(value) {
        emit("crowdedCubes.followRandom", value);
      },
      setFollowMode(value) {
        emit("crowdedCubes.setFollowMode", value);
      }
    },
    pollingDemo: {
      getBall() {
        return request("pollingDemo.getBall", null);
      }
    },
    selectScene(value) {
      emit("selectScene", value);
    },
    surfaceDemo: {
      setCrt(value) {
        emit("surfaceDemo.setCrt", value);
      }
    }
  };

  // src/theme.ts
  var Colors = {
    primary100: "#7aa2f7",
    primary200: "#89b4fa",
    primary300: "#5a7fd6",
    primaryOverlay: "#7aa2f733",
    textColor100: "#cdd6f4",
    textColor200: "#a6adc8",
    textColor300: "#6c7086",
    textColor400: "#1e1e2e",
    surface100: "#11111b",
    surface200: "#1e1e2e",
    surface300: "#2a2a3c",
    surface400: "#313244",
    surface500: "#42425e",
    surface600: "#505072",
    green100: "#9ece6a",
    red100: "#f7768e",
    red200: "#ff8fa3",
    red300: "#d65a72",
    yellow100: "#e0af68",
    purple100: "#bb9af7",
    sky100: "#7dcfff",
    amber100: "#f9e2af",
    orange100: "#ff9e64",
    teal100: "#73daca",
    shadow100: "#00000088",
    shadow200: "#ffffff33",
    transparent: "#00000000"
  };
  var linear = (angle, ...colors) => ({
    type: "linear",
    angle,
    stops: colors.map((color) => ({
      color
    }))
  });
  var Gradients = {
    // accent — active nav item, radio "selected", progress fill, primary buttons
    primary: linear(135, Colors.primary300, Colors.primary100, Colors.primary200),
    primaryHover: linear(135, Colors.primary100, Colors.primary200, Colors.sky100),
    // neutral surface lifts — unselected pills, generic buttons, code toggle
    surface: linear(180, Colors.surface500, Colors.surface300),
    surfaceHover: linear(180, Colors.surface500, Colors.surface600),
    // card / panel depth
    card: linear(160, Colors.surface200, Colors.surface100),
    track: linear(180, Colors.surface300, Colors.surface400),
    // showy multi-hue border for cards (borderGradient)
    accentBorder: linear(135, Colors.primary300, Colors.sky100, Colors.purple100),
    // immersive nav backdrop: dark vertical base + faint primary glow at top
    navBackdrop: [
      linear(180, Colors.surface100, Colors.surface200),
      {
        type: "radial",
        position: "top",
        stops: [
          {
            color: Colors.primaryOverlay
          },
          {
            color: Colors.transparent,
            position: 300
          }
        ]
      }
    ],
    // vivid set cycled across layout swatches/cells (decorative)
    spectrum: [
      linear(135, Colors.red100, Colors.orange100),
      linear(135, Colors.sky100, Colors.teal100),
      linear(135, Colors.purple100, Colors.primary100),
      linear(135, Colors.green100, Colors.amber100)
    ]
  };
  var FontSizes = {
    xxs: 11,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 50
  };

  // src/demos/Home.tsx
  var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
  var import_react3 = __toESM(require_react(), 1);

  // src/components/Checkbox.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
  function Checkbox({ label: label3, enabled, onChange }) {
    function _onChange() {
      onChange(!enabled);
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
      style: wrapper,
      hoverStyle: wrapperHovered,
      onClick: _onChange,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
          style: box,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
            style: {
              backgroundColor: Colors.textColor100,
              backgroundGradient: Gradients.primary,
              width: 21,
              height: 21,
              borderRadius: 5,
              transform: {
                scale: enabled ? 1 : 0
              },
              transition: {
                transform: {
                  duration: 150
                }
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
          style: checkboxLabel,
          children: label3
        })
      ]
    });
  }
  var wrapper = {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: {
      top: 8,
      right: 12,
      bottom: 8,
      left: 12
    },
    borderRadius: 8,
    backgroundColor: Colors.transparent,
    transition: {
      backgroundColor: {
        duration: 150
      }
    }
  };
  var wrapperHovered = {
    backgroundGradient: Gradients.surface
  };
  var box = {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderColor: Colors.surface600,
    borderGradient: Gradients.accentBorder,
    border: 2,
    alignItems: "center",
    justifyContent: "center"
  };
  var checkboxLabel = {
    color: Colors.textColor100,
    fontSize: FontSizes.sm
  };

  // src/components/ProgressBar.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
  var clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  function ProgressBar({ progress, from = 0, label: label3 = "" }) {
    const start = clamp(from, 0, 1);
    const fill = clamp(progress - start, 0, 1 - start);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("node", {
      style: track,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: {
            ...fillStyle,
            left: `${start * 100}%`,
            width: `${fill * 100}%`
          }
        }),
        label3 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: labelWrap,
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
            style: labelText,
            children: label3
          })
        }) : null
      ]
    });
  }
  var track = {
    positionType: "relative",
    width: "100%",
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.surface400,
    backgroundGradient: Gradients.track
  };
  var fillStyle = {
    positionType: "absolute",
    top: 0,
    height: "100%",
    borderRadius: 6,
    backgroundColor: Colors.primary100,
    backgroundGradient: Gradients.primary
  };
  var labelWrap = {
    positionType: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  };
  var labelText = {
    color: Colors.textColor100,
    fontSize: FontSizes.xs,
    fontWeight: "semibold",
    textAlign: "center"
  };

  // src/components/Slider.tsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
  var clamp2 = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  function Slider({ value, min = 0, max = 1, label: label3 = "", onChange }) {
    const progress = max > min ? clamp2((value - min) / (max - min), 0, 1) : 0;
    const setFromX = (e) => onChange(min + (max - min) * clamp2(e.x, 0, 1));
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
      style: sliderTrack,
      onPointerDown: setFromX,
      onPointerMove: setFromX,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProgressBar, {
        progress,
        label: label3
      })
    });
  }
  var sliderTrack = {
    width: 240,
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.surface400,
    backgroundGradient: Gradients.track
  };

  // src/components/Example.tsx
  var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
  var import_react = __toESM(require_react(), 1);

  // src/components/TextMono.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
  function TextMono({ children, style }) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
      style: {
        ...style,
        fontFamily: "Noto Sans Mono"
      },
      children
    });
  }

  // src/components/Example.tsx
  function Example({ children, description, tsx, rust }) {
    const hasCode = !!(rust || tsx);
    const hasAside = !!(description || hasCode);
    const [open, setOpen] = (0, import_react.useState)(true);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
      style: cardStyle,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
          style: demoStyle,
          children
        }),
        hasCode && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", {
          onClick: () => setOpen((o) => !o),
          style: codeToggleStyle,
          hoverStyle: {
            backgroundGradient: Gradients.surfaceHover
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextMono, {
            style: codeToggleLabelStyle,
            children: open ? "-" : "+"
          })
        }),
        hasAside && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
          style: asideStyle,
          children: [
            description && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
              style: descriptionStyle,
              children: description
            }),
            hasCode && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
              style: {
                flexDirection: "column",
                gap: 8,
                overflowY: "clip",
                maxHeight: open ? estimateCodeHeight(rust, tsx) : 0,
                transition: {
                  size: {
                    duration: 300,
                    easing: "easeOut"
                  }
                }
              },
              children: [
                rust && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Code, {
                  lang: "rust",
                  code: rust
                }),
                tsx && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Code, {
                  lang: "tsx",
                  code: tsx
                })
              ]
            })
          ]
        })
      ]
    });
  }
  function estimateCodeHeight(rust, typescript) {
    const lines = (s) => s ? s.split("\n").length : 0;
    const PER_LINE_PX = 20;
    const PER_SNIPPET_PX = 60;
    const snippets = [
      rust,
      typescript
    ].filter(Boolean);
    const lineTotal = snippets.reduce((sum, s) => sum + lines(s), 0);
    return lineTotal * PER_LINE_PX + snippets.length * PER_SNIPPET_PX;
  }
  function Code({ lang, code }) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
      style: {
        flexDirection: "column"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextMono, {
          style: {
            fontSize: FontSizes.sm,
            padding: {
              bottom: 5
            }
          },
          children: lang
        }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextMono, {
          style: {
            fontSize: FontSizes.xxs,
            color: Colors.textColor200
          },
          children: code
        })
      ]
    });
  }
  var cardStyle = {
    alignItems: "stretch",
    justifyContent: "center",
    minWidth: 320,
    backgroundColor: Colors.surface200,
    backgroundGradient: Gradients.card,
    borderRadius: 16,
    border: 2,
    borderColor: Colors.primary100,
    borderGradient: Gradients.accentBorder,
    zIndex: 1e3,
    boxShadow: {
      blurRadius: 15,
      spreadRadius: 5,
      color: Colors.shadow100
    }
  };
  var demoStyle = {
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    border: {
      right: 2
    },
    borderColor: Colors.primary100,
    borderGradient: Gradients.accentBorder,
    padding: 28
  };
  var asideStyle = {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    padding: 16
  };
  var codeToggleStyle = {
    positionType: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: Colors.surface300,
    backgroundGradient: Gradients.surface,
    zIndex: 1,
    transition: {
      backgroundColor: {
        duration: 200
      }
    }
  };
  var codeToggleLabelStyle = {
    color: Colors.textColor100,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };
  var descriptionStyle = {
    color: Colors.textColor200,
    fontSize: FontSizes.sm,
    maxWidth: 320,
    padding: 5
  };

  // src/components/Button.tsx
  var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
  function Button({ onClick, style, hoverStyle, pressStyle, labelStyle: labelStyle2, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", {
      onClick,
      style: {
        ...buttonStyle,
        ...style ?? {}
      },
      hoverStyle: {
        ...buttonHoverStyle,
        ...hoverStyle ?? {}
      },
      pressStyle: {
        ...buttonPressStyle,
        ...pressStyle ?? {}
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
        style: {
          ...buttonLabelStyle,
          ...labelStyle2 ?? {}
        },
        children
      })
    });
  }
  var buttonStyle = {
    justifyContent: "center",
    alignItems: "center",
    padding: {
      top: 8,
      right: 12,
      bottom: 8,
      left: 12
    },
    borderRadius: 8,
    backgroundColor: Colors.surface400,
    backgroundGradient: Gradients.surface,
    transition: {
      backgroundColor: {
        duration: 150
      },
      transform: {
        duration: 150
      }
    }
  };
  var buttonHoverStyle = {
    backgroundGradient: Gradients.surfaceHover
  };
  var buttonPressStyle = {
    transform: {
      scale: 0.9
    }
  };
  var buttonLabelStyle = {
    color: Colors.textColor100,
    fontSize: FontSizes.sm,
    fontWeight: "bold"
  };

  // src/components/Radio.tsx
  var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
  function Radio({ options, value, onChange }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("node", {
      style: groupStyle,
      children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Option, {
        option,
        selected: option.value === value,
        onClick: () => {
          if (option.value !== value) onChange(option.value);
        }
      }, String(option.value)))
    });
  }
  function Option({ option, selected, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", {
      onClick,
      style: {
        ...pillStyle,
        backgroundColor: selected ? ACCENT : SURFACE,
        backgroundGradient: selected ? Gradients.primary : Gradients.surface
      },
      hoverStyle: {
        backgroundGradient: selected ? Gradients.primaryHover : Gradients.surfaceHover
      },
      pressStyle: {
        transform: {
          scale: 0.95
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("text", {
        style: {
          ...pillLabel,
          color: selected ? Colors.textColor400 : Colors.textColor100,
          fontWeight: selected ? "bold" : "medium"
        },
        children: option.label
      })
    });
  }
  var ACCENT = Colors.primary100;
  var SURFACE = Colors.surface300;
  var groupStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6
  };
  var pillStyle = {
    justifyContent: "center",
    alignItems: "center",
    padding: {
      top: 6,
      right: 14,
      bottom: 6,
      left: 14
    },
    borderRadius: 8,
    transform: {
      scale: 1
    },
    transition: {
      backgroundColor: {
        duration: 150
      },
      transform: {
        duration: 120,
        easing: "easeOut"
      }
    }
  };
  var pillLabel = {
    fontSize: FontSizes.sm
  };

  // src/components/Typewriter.tsx
  var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
  var import_react2 = __toESM(require_react(), 1);
  var CURSOR = "\u258B";
  function Typewriter({ text, style, charsPerTick = 1, tickMs = 28, startDelay = 0, cursor = false, onDone }) {
    const [count, setCount] = (0, import_react2.useState)(0);
    const [blink, setBlink] = (0, import_react2.useState)(true);
    const onDoneRef = (0, import_react2.useRef)(onDone);
    onDoneRef.current = onDone;
    (0, import_react2.useEffect)(() => {
      setCount(0);
      let timer;
      const start = setTimeout(() => {
        timer = setInterval(() => {
          setCount((c) => {
            const next = Math.min(text.length, c + charsPerTick);
            if (next >= text.length) clearInterval(timer);
            return next;
          });
        }, tickMs);
      }, startDelay);
      return () => {
        clearTimeout(start);
        clearInterval(timer);
      };
    }, [
      text,
      charsPerTick,
      tickMs,
      startDelay
    ]);
    const finished = text.length === 0 || count >= text.length;
    (0, import_react2.useEffect)(() => {
      if (finished) onDoneRef.current?.();
    }, [
      finished
    ]);
    (0, import_react2.useEffect)(() => {
      if (!cursor) return;
      const timer = setInterval(() => setBlink((b) => !b), 500);
      return () => clearInterval(timer);
    }, [
      cursor
    ]);
    const glyph = cursor && blink ? CURSOR : "";
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("text", {
      style,
      children: [
        text.slice(0, count),
        glyph
      ]
    });
  }

  // src/demos/Home.tsx
  var FEATURES = [
    {
      title: "Native Bevy UI",
      body: "No browser, no web view. Your UI is bevy_ui entities in the same world as your game."
    },
    {
      title: "Hot reload that keeps state",
      body: "Edit a component and it re-renders live, with hook state and running animations intact."
    },
    {
      title: "Typed two-way messaging",
      body: "React and the ECS talk over typed channels generated straight from your Rust types."
    },
    {
      title: "React, not a DSL",
      body: "Hooks, components, lists, conditional rendering \u2014 everything you already know."
    }
  ];
  function Home() {
    const [mode, setMode] = (0, import_react3.useState)("monitor");
    (0, import_react3.useEffect)(() => {
      bevy.selectScene(mode === "monitor" ? "Surface" : null);
    }, [
      mode
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
      style: containerStyle,
      children: mode === "monitor" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("surface", {
        name: "monitor",
        style: screenRoot,
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Landing, {
          mode,
          onMode: setMode
        })
      }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Landing, {
        mode,
        onMode: setMode
      })
    });
  }
  function Landing({ mode, onMode }) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
      style: pageStyle,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
          style: heroStyle,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("image", {
              src: "bevy-react-logo.png",
              style: {
                width: 150
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
              style: titleStyle,
              children: "bevy-react"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
              style: taglineStyle,
              children: "Build bevy_ui interfaces with React \u2014 no web view, no DOM."
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
          style: introStyle,
          children: "You write components in React/TSX and they render to native Bevy UI through a React Native-style bridge. State and interactions flow both ways, and edits hot-reload live while keeping component state."
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
          style: cardsRowStyle,
          children: FEATURES.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
            style: cardStyle2,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
                style: cardTitleStyle,
                children: feature.title
              }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
                style: cardBodyStyle,
                children: feature.body
              })
            ]
          }, feature.title))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
          style: browseStyle,
          children: "Browse the demos in the side panel"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, {
          style: surfaceSwith,
          labelStyle: surfaceLabelSwith,
          onClick: () => onMode(mode === "flat" ? "monitor" : "flat"),
          children: mode === "flat" ? "Switch to CRT monitor" : "Switch to flat"
        })
      ]
    });
  }
  var containerStyle = {
    flexDirection: "column",
    alignItems: "center",
    gap: 16
  };
  var screenRoot = {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface100,
    backgroundGradient: Gradients.navBackdrop
  };
  var pageStyle = {
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    padding: 32,
    maxWidth: 720
  };
  var heroStyle = {
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  };
  var titleStyle = {
    color: Colors.primary100,
    fontSize: FontSizes.xxl,
    fontWeight: "bold"
  };
  var taglineStyle = {
    color: Colors.textColor100,
    fontSize: FontSizes.base,
    maxWidth: 520
  };
  var introStyle = {
    color: Colors.textColor200,
    fontSize: FontSizes.sm,
    maxWidth: 600,
    textAlign: "center"
  };
  var cardsRowStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14
  };
  var cardStyle2 = {
    flexDirection: "column",
    gap: 6,
    width: 320,
    padding: 16,
    backgroundColor: Colors.surface200,
    backgroundGradient: Gradients.card,
    borderRadius: 14,
    border: 2,
    borderColor: Colors.primary100,
    borderGradient: Gradients.accentBorder,
    boxShadow: {
      blurRadius: 12,
      spreadRadius: 4,
      color: Colors.shadow100
    }
  };
  var cardTitleStyle = {
    color: Colors.primary100,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };
  var cardBodyStyle = {
    color: Colors.textColor200,
    fontSize: FontSizes.xs
  };
  var browseStyle = {
    color: Colors.textColor100,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };
  var surfaceSwith = {
    padding: 20
  };
  var surfaceLabelSwith = {
    fontSize: FontSizes.xl
  };

  // src/demos/communication/ReactToBevyDemo.tsx
  var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
  var import_react4 = __toESM(require_react(), 1);
  var MAX = 8;
  var TYPESCRIPT = "bevy.basicDemo.setCount(n);";
  var RUST = `#[react_message(name = "basicDemo.setCount")]
struct SetCount(usize);

fn apply_set_count(
    count: On<SetCount>,
    mut desired: ResMut<DesiredCubes>,
) {
    desired.0 = count.event().0;
}

app.add_react_handler(apply_set_count);`;
  function ReactToBevyDemo() {
    const [count, setCount] = (0, import_react4.useState)(3);
    (0, import_react4.useEffect)(() => {
      bevy.basicDemo.setCount(count);
    }, [
      count
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Example, {
      description: "React -> Bevy: a typed `emit` notifies the ECS, which spawns that many cubes.",
      tsx: TYPESCRIPT,
      rust: RUST,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("text", {
          style: countStyle,
          children: [
            "Cubes: ",
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
              style: {
                color: Colors.primary100
              },
              children: count
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 12
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, {
              onClick: () => setCount((c) => Math.min(MAX, c + 1)),
              style: {
                ...buttonStyle2,
                backgroundColor: Colors.primary100,
                backgroundGradient: void 0
              },
              hoverStyle: {
                backgroundColor: Colors.primary200,
                backgroundGradient: void 0
              },
              pressStyle: {
                backgroundColor: Colors.primary300,
                backgroundGradient: void 0
              },
              labelStyle: {
                fontSize: FontSizes.xxxl
              },
              children: "+"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, {
              onClick: () => setCount((c) => Math.max(0, c - 1)),
              style: {
                ...buttonStyle2,
                backgroundColor: Colors.red100,
                backgroundGradient: void 0
              },
              hoverStyle: {
                backgroundColor: Colors.red200,
                backgroundGradient: void 0
              },
              pressStyle: {
                backgroundColor: Colors.red300,
                backgroundGradient: void 0
              },
              labelStyle: {
                fontSize: FontSizes.xxxl
              },
              children: "-"
            })
          ]
        })
      ]
    });
  }
  var countStyle = {
    color: Colors.textColor100,
    fontSize: FontSizes.xl,
    fontWeight: "bold"
  };
  var buttonStyle2 = {
    width: 60,
    height: 60
  };

  // src/demos/communication/BevyToReactDemo.tsx
  var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
  var import_react5 = __toESM(require_react(), 1);
  var TYPESCRIPT2 = `bevy.on("bevyEventsDemo.ballBounced", (e) => {
  setBounces((n) => n + 1);
});`;
  var RUST2 = `#[react_event(name = "bevyEventsDemo.ballBounced")]
struct BallBounced {
    wall: Wall,
    speed: f32,
}

fn bounce(events: ReactEvents, /* ... */) {
    events.send(&BallBounced { wall, speed });
}

app.add_react_event::<BallBounced>();`;
  function BevyToReactDemo() {
    const [bounces, setBounces] = (0, import_react5.useState)(0);
    (0, import_react5.useEffect)(() => {
      const off = bevy.on("bevyEventsDemo.ballBounced", () => {
        setBounces((bounces2) => bounces2 + 1);
      });
      return () => {
        off();
      };
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(Example, {
      description: "Bevy -> React: a typed event sent from a system fires every JS listener subscribed by name.",
      tsx: TYPESCRIPT2,
      rust: RUST2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
          style: {
            fontSize: FontSizes.lg
          },
          children: "Bounces"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
          style: {
            fontSize: FontSizes.xxxl,
            fontWeight: "bold",
            color: Colors.yellow100
          },
          children: bounces
        })
      ]
    });
  }

  // src/demos/communication/BidirectionCommunicationDemo.tsx
  var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
  var import_react6 = __toESM(require_react(), 1);
  var TYPESCRIPT3 = "const ball = await bevy.pollingDemo.getBall();";
  var RUST3 = `#[react_request(name = "pollingDemo.getBall", response = BallState)]
struct GetBall;

#[derive(Serialize, TS)]
struct BallState { x: f32, y: f32, vx: f32, vy: f32 }

fn report_ball(
    req: On<Request<GetBall>>,
    balls: Query<(&Transform, &Velocity)>,
) {
    let (t, v) = balls.single().unwrap();
    req.respond(BallState {
        x: t.translation.x, y: t.translation.y,
        vx: v.0.x, vy: v.0.y,
    });
}

app.add_react_request_handler(report_ball);`;
  function BidirectionCommunicationDemo() {
    const [state, setState] = (0, import_react6.useState)(null);
    (0, import_react6.useEffect)(() => {
      let alive = true;
      let handle;
      const tick = async () => {
        try {
          const ball = await bevy.pollingDemo.getBall();
          if (!alive) {
            return;
          }
          setState(ball);
        } catch {
        }
        if (alive) {
          handle = setTimeout(tick, 50);
        }
      };
      tick();
      return () => {
        alive = false;
        clearTimeout(handle);
      };
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Example, {
      description: "React <-> Bevy: an awaited request returns a typed response, polled here for live telemetry.",
      tsx: TYPESCRIPT3,
      rust: RUST3,
      children: state ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
        style: {
          flexDirection: "column",
          gap: 8,
          alignItems: "start"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Row, {
            label: "position",
            x: state.x,
            y: state.y
          }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Row, {
            label: "velocity",
            x: state.vx,
            y: state.vy
          })
        ]
      }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
        style: {
          color: Colors.textColor300,
          fontSize: FontSizes.sm
        },
        children: "waiting for the ball..."
      })
    });
  }
  function Row({ label: label3, x, y }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
      style: {
        flexDirection: "row",
        gap: 8
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
          style: {
            color: Colors.textColor200,
            fontSize: FontSizes.base,
            width: 80
          },
          children: label3
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("text", {
          style: {
            color: Colors.primary100,
            fontSize: FontSizes.base,
            fontWeight: "bold"
          },
          children: [
            "x ",
            x.toFixed(2),
            ", y ",
            y.toFixed(2)
          ]
        })
      ]
    });
  }

  // src/demos/AnchoredDemo.tsx
  var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
  var import_react7 = __toESM(require_react(), 1);
  var import_bevy_react2 = __toESM(require_bevy_react(), 1);
  var TYPESCRIPT4 = `<Anchored.node entity={cube.entity} offset={[0, 0.8, 0]}>
  <text>{cube.label}</text>
</Anchored.node>`;
  function AnchoredDemo() {
    const [cubes, setCubes] = (0, import_react7.useState)([]);
    const [scalingEnabled, setScalingEnabled] = (0, import_react7.useState)(true);
    const [baseDistance, setBaseDistance] = (0, import_react7.useState)(24);
    const [scaleFactor, setScaleFactor] = (0, import_react7.useState)(1);
    (0, import_react7.useEffect)(() => {
      const off = bevy.on("crowdedCubes.spawned", (e) => setCubes(e.cubes));
      return () => {
        off();
      };
    }, []);
    const scaling = scalingEnabled ? {
      min: 0.4,
      max: 3,
      factor: scaleFactor,
      baseDistance
    } : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Example, {
          description: "UI nodes pinned to a 3D entity, tracking it on screen and optionally scaling with distance.",
          tsx: TYPESCRIPT4,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Checkbox, {
              label: "Scale with distance",
              enabled: scalingEnabled,
              onChange: setScalingEnabled
            }),
            scalingEnabled && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, {
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Slider, {
                  value: scaleFactor,
                  onChange: setScaleFactor,
                  label: `Scale factor ${scaleFactor.toFixed(1)}`,
                  min: 0,
                  max: 3
                }),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Slider, {
                  value: baseDistance,
                  onChange: setBaseDistance,
                  label: `Base distance ${baseDistance.toFixed(1)}`,
                  min: 1,
                  max: 50
                })
              ]
            })
          ]
        }),
        cubes.map((cube) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Badge, {
          cube,
          scaling
        }, String(cube.entity)))
      ]
    });
  }
  function Badge({ cube, scaling }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_bevy_react2.Anchored.node, {
      entity: cube.entity,
      offset: [
        0,
        0.8,
        0
      ],
      scale: scaling,
      style: badgeStyle,
      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
        style: badgeText,
        children: cube.label
      })
    });
  }
  var badgeStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: {
      top: 3,
      right: 8,
      bottom: 3,
      left: 8
    },
    backgroundColor: Colors.primary100,
    backgroundGradient: Gradients.primary,
    borderRadius: 999,
    boxShadow: {
      color: Colors.shadow100,
      blurRadius: 4,
      spreadRadius: 2
    }
  };
  var badgeText = {
    color: Colors.textColor400,
    fontSize: FontSizes.xs,
    fontWeight: "bold"
  };

  // src/demos/InteractionsDemo.tsx
  var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
  var import_react8 = __toESM(require_react(), 1);
  var TYPESCRIPT5 = `<node
  onClick={...}
  onPointerDown={...}
  onPointerMove={...}
  onPointerUp={...}
/>`;
  var STAGE_W = 380;
  var STAGE_H = 240;
  var BOX = 72;
  var clamp3 = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function InteractionsDemo() {
    const [pos, setPos] = (0, import_react8.useState)({
      left: (STAGE_W - BOX) / 2,
      top: (STAGE_H - BOX) / 2
    });
    const [pressed, setPressed] = (0, import_react8.useState)(false);
    const [last, setLast] = (0, import_react8.useState)("-");
    const [log, setLog] = (0, import_react8.useState)([]);
    const lastClient = (0, import_react8.useRef)({
      x: 0,
      y: 0
    });
    const lineId = (0, import_react8.useRef)(0);
    const record = (text) => {
      setLast(text);
      setLog((prev) => {
        const next = [
          {
            id: lineId.current++,
            text
          },
          ...prev
        ];
        return next.slice(0, 6);
      });
    };
    const fmt = (e) => `x=${e.x.toFixed(2)} y=${e.y.toFixed(2)} | client=(${Math.round(e.clientX)}, ${Math.round(e.clientY)})`;
    const onPointerDown = (e) => {
      lastClient.current = {
        x: e.clientX,
        y: e.clientY
      };
      setPressed(true);
      record(`pointerDown  ${fmt(e)}`);
    };
    const onPointerMove = (e) => {
      const dx = e.clientX - lastClient.current.x;
      const dy = e.clientY - lastClient.current.y;
      lastClient.current = {
        x: e.clientX,
        y: e.clientY
      };
      setPos((p) => ({
        left: clamp3(p.left + dx, 0, STAGE_W - BOX),
        top: clamp3(p.top + dy, 0, STAGE_H - BOX)
      }));
      record(`pointerMove  ${fmt(e)}`);
    };
    const onPointerUp = (e) => {
      setPressed(false);
      record(`pointerUp  ${fmt(e)}`);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(Example, {
      description: "Raw pointer events the bridge reports. Grab the box and drag it around the stage.",
      tsx: TYPESCRIPT5,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
          style: stageStyle,
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
            style: {
              ...boxStyle,
              left: pos.left,
              top: pos.top,
              backgroundColor: pressed ? Colors.purple100 : Colors.primary100
            },
            onClick: () => record("click"),
            onPointerDown,
            onPointerMove,
            onPointerUp,
            children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
              style: boxLabelStyle,
              children: "drag"
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
          style: {
            color: Colors.primary100,
            fontSize: FontSizes.sm,
            fontWeight: "bold"
          },
          children: last
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
          style: logStyle,
          children: log.map((l) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
            style: logLineStyle,
            children: l.text
          }, l.id))
        })
      ]
    });
  }
  var stageStyle = {
    width: STAGE_W,
    height: STAGE_H,
    positionType: "relative",
    backgroundColor: Colors.surface100,
    borderRadius: 12,
    border: 1,
    borderColor: Colors.surface400,
    overflowX: "hidden",
    overflowY: "hidden"
  };
  var boxStyle = {
    positionType: "absolute",
    width: BOX,
    height: BOX,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  };
  var boxLabelStyle = {
    color: Colors.textColor400,
    fontSize: FontSizes.sm,
    fontWeight: "bold"
  };
  var logStyle = {
    flexDirection: "column",
    alignItems: "start",
    gap: 2,
    width: STAGE_W,
    height: 110
  };
  var logLineStyle = {
    color: Colors.textColor300,
    fontSize: FontSizes.xs
  };

  // src/demos/elements/CanvasDemo.tsx
  var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
  var import_react9 = __toESM(require_react(), 1);
  var W = 460;
  var H = 260;
  var PAD = 28;
  var POINTS = 9;
  var PERIOD_MS = 1500;
  var DURATION_MS = 500;
  var FRAME_MS = 16;
  var TYPESCRIPT6 = `<canvas
  draw={(ctx) => {
    ctx.strokeStyle = "#7aa2f7";
    ctx.bezierCurveTo(/* ... */);
    ctx.stroke();
  }}
/>`;
  var randomData = (n) => Array.from({
    length: n
  }, () => 0.12 + Math.random() * 0.8);
  var easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function CanvasDemo() {
    const [values, setValues] = (0, import_react9.useState)(() => randomData(POINTS));
    const valuesRef = (0, import_react9.useRef)(values);
    valuesRef.current = values;
    const frameRef = (0, import_react9.useRef)();
    const animateRef = (0, import_react9.useRef)(() => {
    });
    (0, import_react9.useEffect)(() => {
      let alive = true;
      const animateTo = (target) => {
        clearTimeout(frameRef.current);
        const from = valuesRef.current;
        let elapsed = 0;
        const step = () => {
          if (!alive) return;
          elapsed += FRAME_MS;
          const e = easeInOut(Math.min(1, elapsed / DURATION_MS));
          setValues(from.map((v, i) => v + (target[i] - v) * e));
          if (elapsed < DURATION_MS) frameRef.current = setTimeout(step, FRAME_MS);
        };
        step();
      };
      animateRef.current = animateTo;
      let cycle;
      const tick = () => {
        animateTo(randomData(POINTS));
        cycle = setTimeout(tick, PERIOD_MS);
      };
      cycle = setTimeout(tick, PERIOD_MS);
      return () => {
        alive = false;
        clearTimeout(frameRef.current);
        clearTimeout(cycle);
      };
    }, []);
    const shuffle = (0, import_react9.useCallback)(() => animateRef.current(randomData(POINTS)), []);
    const draw = (ctx) => {
      ctx.fillStyle = Colors.surface100;
      ctx.rect(0, 0, W, H);
      ctx.fill();
      ctx.strokeStyle = Colors.surface400;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = PAD + (H - 2 * PAD) * i / 4;
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(W - PAD, y);
        ctx.stroke();
      }
      const pts = values.map((v, i) => ({
        x: PAD + (W - 2 * PAD) * i / (values.length - 1),
        y: H - PAD - v * (H - 2 * PAD)
      }));
      ctx.fillStyle = Colors.primaryOverlay;
      smoothPath(ctx, pts);
      ctx.lineTo(pts[pts.length - 1].x, H - PAD);
      ctx.lineTo(pts[0].x, H - PAD);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = Colors.primary100;
      ctx.lineWidth = 3;
      smoothPath(ctx, pts);
      ctx.stroke();
      ctx.fillStyle = Colors.purple100;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Example, {
      description: "An immediate-mode raster surface.",
      tsx: TYPESCRIPT6,
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("canvas", {
        style: canvasStyle,
        draw,
        onClick: shuffle
      })
    });
  }
  function smoothPath(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
    }
  }
  var canvasStyle = {
    width: W,
    height: H,
    borderRadius: 12,
    border: 1,
    borderColor: Colors.surface400
  };

  // src/demos/elements/PortalDemo.tsx
  var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
  var import_react10 = __toESM(require_react(), 1);
  var TYPESCRIPT7 = `<portal target="minimap" style={
  { width: 160, height: 160 }
} />`;
  var RUST4 = `let minimap = render_targets.create(
    &mut images,
    "minimap",
    RenderTargetSpec {
        mode: RenderMode::Snapshot,
        ..default()
    },
);

commands.spawn((
    Camera3d::default(),
    minimap.camera_target(),
    PortalCamera("minimap".into()),
));`;
  function PortalDemo() {
    const [continuous, setContinuous] = (0, import_react10.useState)(true);
    (0, import_react10.useEffect)(() => {
      bevy.crowdedCubes.setFollowMode(continuous);
      return bevy.on("crowdedCubes.spawned", () => bevy.crowdedCubes.setFollowMode(continuous));
    }, [
      continuous
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Example, {
      description: "A view of an offscreen Bevy camera, rendered to a texture and shown in the UI.",
      tsx: TYPESCRIPT7,
      rust: RUST4,
      children: /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
        style: row,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
            style: column,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
                style: label,
                children: "Follow cam"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("portal", {
                target: "follow",
                style: followView
              }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Button, {
                onClick: () => bevy.crowdedCubes.followRandom(null),
                children: "Pick another cube"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Checkbox, {
                label: "Continuous",
                enabled: continuous,
                onChange: setContinuous
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
            style: column,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
                style: label,
                children: "Minimap"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("portal", {
                target: "minimap",
                style: minimapView
              })
            ]
          })
        ]
      })
    });
  }
  var row = {
    flexDirection: "row",
    alignItems: "flexStart",
    gap: 16
  };
  var column = {
    flexDirection: "column",
    alignItems: "center",
    gap: 8
  };
  var label = {
    color: Colors.textColor200,
    fontSize: FontSizes.sm,
    fontWeight: "semibold"
  };
  var followView = {
    width: 160,
    height: 160,
    borderRadius: 8,
    border: 2,
    borderColor: Colors.surface500,
    backgroundColor: Colors.surface100
  };
  var minimapView = {
    width: 160,
    height: 160,
    borderRadius: 8,
    border: 2,
    borderColor: Colors.surface500,
    backgroundColor: Colors.surface100
  };

  // src/demos/elements/surfaceDemo/index.tsx
  var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);

  // src/demos/elements/surfaceDemo/MonitorApp.tsx
  var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
  var import_react16 = __toESM(require_react(), 1);

  // src/demos/elements/surfaceDemo/Desktop.tsx
  var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
  var import_react14 = __toESM(require_react(), 1);

  // src/demos/elements/surfaceDemo/MenuBar.tsx
  var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);

  // src/demos/elements/surfaceDemo/menu.tsx
  var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
  var import_react11 = __toESM(require_react(), 1);
  function Popup({ style, from = "top", children }) {
    const [shown, setShown] = (0, import_react11.useState)(false);
    (0, import_react11.useEffect)(() => setShown(true), []);
    const dy = from === "top" ? -8 : 8;
    return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
      style: {
        ...style,
        opacity: shown ? 1 : 0,
        transform: {
          scale: shown ? 1 : 0.96,
          translateY: shown ? 0 : dy
        },
        transition: shown ? {
          opacity: {
            duration: 120
          },
          transform: {
            duration: 130,
            easing: "easeOut"
          }
        } : void 0
      },
      children
    });
  }
  function MenuList({ items }) {
    const [firstRender, setFirstRender] = (0, import_react11.useState)(true);
    (0, import_react11.useEffect)(() => {
      setTimeout(() => {
        setFirstRender(false);
      }, 100);
    });
    return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
      style: {
        ...list,
        transform: {
          scaleY: firstRender ? 0 : 1
        }
      },
      children: items.map((item, i) => {
        if ("separator" in item && item.separator) {
          return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
            style: separator
          }, `sep-${i}`);
        }
        return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("button", {
          style: row2,
          hoverStyle: rowHover,
          onClick: item.onClick,
          children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
            style: label2,
            children: item.label
          })
        }, item.label);
      })
    });
  }
  var list = {
    flexDirection: "column",
    minWidth: 200,
    padding: {
      top: 6,
      bottom: 6,
      left: 6,
      right: 6
    },
    backgroundColor: Colors.surface300,
    borderColor: Colors.surface500,
    border: 2,
    borderRadius: 10,
    gap: 2,
    transition: {
      transform: {
        duration: 100
      }
    }
  };
  var row2 = {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: {
      top: 8,
      bottom: 8,
      left: 10,
      right: 18
    },
    borderRadius: 7,
    backgroundColor: Colors.transparent
  };
  var rowHover = {
    backgroundColor: Colors.primary300
  };
  var check = {
    width: 16,
    color: Colors.primary100,
    fontSize: FontSizes.sm,
    fontWeight: "bold"
  };
  var label2 = {
    color: Colors.textColor100,
    fontSize: FontSizes.base
  };
  var separator = {
    height: 2,
    margin: {
      top: 4,
      bottom: 4,
      left: 6,
      right: 6
    },
    backgroundColor: Colors.surface500
  };

  // src/demos/elements/surfaceDemo/MenuBar.tsx
  function MenuBar({ open, onToggle, view, crt, onSource, onReboot, onToggleCrt, onAbout }) {
    const menus = [
      {
        id: "system",
        label: "System",
        items: [
          {
            label: view === "code" ? "Close Source" : "View Source",
            onClick: onSource
          },
          {
            separator: true
          },
          {
            label: "Reboot",
            onClick: onReboot
          },
          {
            label: "About bevy-react OS",
            onClick: onAbout
          }
        ]
      },
      {
        id: "view",
        label: "View",
        items: [
          {
            label: view === "code" ? "Home" : "Source Code",
            onClick: onSource
          },
          {
            label: "Toggle CRT Effect",
            checked: crt,
            onClick: onToggleCrt
          }
        ]
      },
      {
        id: "help",
        label: "Help",
        items: [
          {
            label: "About bevy-react OS",
            onClick: onAbout
          }
        ]
      }
    ];
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: bar,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("node", {
          style: menuRow,
          children: menus.map((menu) => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
            style: menuAnchor,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", {
                style: open === menu.id ? menuLabelActive : menuLabel,
                hoverStyle: menuLabelHover,
                onClick: () => onToggle(menu.id),
                children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
                  style: menuLabelText,
                  children: menu.label
                })
              }),
              open === menu.id ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Popup, {
                style: dropdown,
                from: "top",
                children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MenuList, {
                  items: menu.items
                })
              }) : null
            ]
          }, menu.id))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(TextMono, {
          style: title,
          children: "surface://monitor"
        })
      ]
    });
  }
  var bar = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "spaceBetween",
    padding: {
      top: 20,
      right: 18,
      bottom: 6,
      left: 10
    },
    backgroundColor: Colors.surface100,
    borderColor: Colors.primary100,
    border: {
      top: 0,
      right: 0,
      bottom: 3,
      left: 0
    },
    width: "100%"
  };
  var menuRow = {
    flexDirection: "row",
    gap: 2
  };
  var menuAnchor = {
    positionType: "relative",
    flexDirection: "column"
  };
  var menuLabel = {
    padding: {
      top: 8,
      bottom: 8,
      left: 14,
      right: 14
    },
    borderRadius: 7,
    backgroundColor: Colors.transparent
  };
  var menuLabelHover = {
    backgroundColor: Colors.surface300
  };
  var menuLabelActive = {
    padding: {
      top: 8,
      bottom: 8,
      left: 14,
      right: 14
    },
    borderRadius: 7,
    backgroundColor: Colors.primary300
  };
  var menuLabelText = {
    color: Colors.textColor100,
    fontSize: FontSizes.base,
    fontWeight: "semibold"
  };
  var dropdown = {
    positionType: "absolute",
    top: "100%",
    left: 0,
    margin: {
      top: 6
    }
  };
  var title = {
    color: Colors.primary100,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };

  // src/demos/elements/surfaceDemo/Taskbar.tsx
  var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
  var import_react12 = __toESM(require_react(), 1);
  function Taskbar({ startOpen, view, onStart, onSource, onReboot, onAbout }) {
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
      style: bar2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
          style: startAnchor,
          children: [
            startOpen ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Popup, {
              style: startPopup,
              from: "bottom",
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(MenuList, {
                items: [
                  {
                    label: view === "code" ? "Home" : "Source Code",
                    onClick: onSource
                  },
                  {
                    label: "About",
                    onClick: onAbout
                  },
                  {
                    separator: true
                  },
                  {
                    label: "Reboot",
                    onClick: onReboot
                  }
                ]
              })
            }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", {
              style: startOpen ? startButtonActive : startButton,
              hoverStyle: startButtonHover,
              onClick: onStart,
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                style: startText,
                children: "bevy-react"
              })
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Clock, {})
      ]
    });
  }
  function Clock() {
    const [now, setNow] = (0, import_react12.useState)(formatTime);
    (0, import_react12.useEffect)(() => {
      const id = setInterval(() => setNow(formatTime()), 1e3);
      return () => clearInterval(id);
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
      style: clock,
      children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(TextMono, {
        style: clockText,
        children: now
      })
    });
  }
  function formatTime() {
    const d = /* @__PURE__ */ new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }
  var bar2 = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "spaceBetween",
    padding: {
      top: 6,
      right: 10,
      bottom: 20,
      left: 8
    },
    backgroundColor: Colors.surface100,
    borderColor: Colors.surface500,
    border: {
      top: 3,
      right: 0,
      bottom: 0,
      left: 0
    },
    width: "100%"
  };
  var startAnchor = {
    positionType: "relative",
    flexDirection: "column"
  };
  var startButton = {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: {
      top: 8,
      bottom: 8,
      left: 12,
      right: 16
    },
    borderRadius: 8,
    backgroundColor: Colors.surface300
  };
  var startButtonHover = {
    backgroundColor: Colors.surface500
  };
  var startButtonActive = {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: {
      top: 8,
      bottom: 8,
      left: 12,
      right: 16
    },
    borderRadius: 8,
    backgroundColor: Colors.primary300
  };
  var startText = {
    color: Colors.textColor100,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };
  var startPopup = {
    positionType: "absolute",
    bottom: "100%",
    left: 0,
    margin: {
      bottom: 8
    }
  };
  var clock = {
    padding: {
      top: 6,
      bottom: 6,
      left: 14,
      right: 14
    },
    borderRadius: 7,
    borderColor: Colors.surface500,
    border: 2,
    backgroundColor: Colors.surface200
  };
  var clockText = {
    color: Colors.textColor200,
    fontSize: FontSizes.sm
  };

  // src/demos/elements/surfaceDemo/Home.tsx
  var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
  function Home2({ crt, setCrt }) {
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("node", {
      style: home,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("text", {
          style: brand,
          children: "bevy-react OS"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("text", {
          style: brandSub,
          children: "bevy_ui rendered with React, live on a 3D screen"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("node", {
          style: controls,
          children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Checkbox, {
            label: "CRT effect",
            enabled: crt,
            onChange: setCrt
          })
        })
      ]
    });
  }
  var home = {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14
  };
  var brand = {
    color: Colors.textColor100,
    fontSize: FontSizes.xxxl,
    fontWeight: "bold"
  };
  var brandSub = {
    color: Colors.textColor200,
    fontSize: FontSizes.lg
  };
  var controls = {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    margin: {
      top: 10
    }
  };

  // src/demos/elements/surfaceDemo/CodeViewer.tsx
  var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);

  // src/demos/elements/surfaceDemo/source.ts
  var TSX = `<surface name="monitor">
  <MonitorApp />
</surface>`;
  var RUST5 = `// register the surface \u2192 Handle<Image>
let screen = surfaces.create(
    &mut images, "monitor", spec,
);
// drape it on the glTF screen mesh and
// make it clickable in 3D
material.base_color_texture = Some(screen);
commands.entity(screen_mesh)
    .insert(SurfacePointer("monitor".into()));`;

  // src/demos/elements/surfaceDemo/CodeViewer.tsx
  function CodeViewer() {
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
      style: body,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(TextMono, {
          style: heading,
          children: "SURFACE.RS \u2014 source"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(CodeBlock, {
          lang: "rust",
          code: RUST5
        }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(CodeBlock, {
          lang: "tsx",
          code: TSX
        })
      ]
    });
  }
  function CodeBlock({ lang, code }) {
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
      style: block,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(TextMono, {
          style: langLabel,
          children: lang
        }),
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Typewriter, {
          style: codeText,
          text: code,
          cursor: true
        })
      ]
    });
  }
  var body = {
    flexGrow: 1,
    flexDirection: "column",
    gap: 14,
    padding: 24
  };
  var heading = {
    color: Colors.textColor300,
    fontSize: FontSizes.sm,
    fontWeight: "bold"
  };
  var block = {
    flexDirection: "column",
    backgroundColor: Colors.surface100,
    borderRadius: 8,
    padding: {
      top: 12,
      right: 16,
      bottom: 14,
      left: 16
    }
  };
  var langLabel = {
    color: Colors.primary100,
    fontSize: FontSizes.sm,
    fontWeight: "bold",
    padding: {
      bottom: 6
    }
  };
  var codeText = {
    color: Colors.textColor100,
    fontSize: FontSizes.base,
    fontFamily: "Noto Sans Mono"
  };

  // src/demos/elements/surfaceDemo/AboutDialog.tsx
  var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
  var import_react13 = __toESM(require_react(), 1);
  function AboutDialog({ onClose }) {
    const [firstRender, setFirstRender] = (0, import_react13.useState)(true);
    (0, import_react13.useEffect)(() => {
      setTimeout(() => {
        setFirstRender(false);
      }, 100);
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("node", {
      style: {
        ...scrim,
        transform: {
          scale: firstRender ? 0 : 1
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
        style: panel,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
            style: titleBar,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
                style: titleText,
                children: "About"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Button, {
                hoverStyle: closeButtonHover,
                onClick: onClose,
                children: "\xD7"
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("node", {
            style: panelBody,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
                style: brand2,
                children: "bevy-react OS"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(TextMono, {
                style: version,
                children: "version 0.1 \xB7 surface://monitor"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("text", {
                style: blurb,
                children: "A React UI rendered into an offscreen texture and draped over a 3D monitor \u2014 clickable in-world."
              }),
              /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Button, {
                onClick: onClose,
                children: "OK"
              })
            ]
          })
        ]
      })
    });
  }
  var scrim = {
    positionType: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    transition: {
      transform: {
        duration: 200
      }
    }
  };
  var panel = {
    width: "70%",
    flexDirection: "column",
    borderRadius: 12,
    borderColor: Colors.primary100,
    border: 2,
    backgroundColor: Colors.surface200
  };
  var titleBar = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "spaceBetween",
    padding: {
      top: 10,
      bottom: 10,
      left: 16,
      right: 10
    },
    backgroundColor: Colors.primary300,
    borderRadius: {
      top: 10,
      right: 10,
      bottom: 0,
      left: 0
    }
  };
  var titleText = {
    color: Colors.textColor100,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };
  var closeButtonHover = {
    backgroundColor: Colors.red300
  };
  var panelBody = {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: {
      top: 24,
      bottom: 24,
      left: 24,
      right: 24
    }
  };
  var brand2 = {
    color: Colors.textColor100,
    fontSize: FontSizes.xxl,
    fontWeight: "bold"
  };
  var version = {
    color: Colors.textColor300,
    fontSize: FontSizes.sm
  };
  var blurb = {
    color: Colors.textColor200,
    fontSize: FontSizes.base,
    textAlign: "center"
  };

  // src/demos/elements/surfaceDemo/Desktop.tsx
  function Desktop({ crt, setCrt, onReboot }) {
    const [view, setView] = (0, import_react14.useState)("home");
    const [openMenu, setOpenMenu] = (0, import_react14.useState)(null);
    const [aboutOpen, setAboutOpen] = (0, import_react14.useState)(false);
    const toggle = (id) => setOpenMenu((cur) => cur === id ? null : id);
    const close = () => setOpenMenu(null);
    const showSource = () => {
      setView((v) => v === "code" ? "home" : "code");
      close();
    };
    const reboot = () => {
      onReboot();
      close();
    };
    const toggleCrt = () => {
      setCrt(!crt);
      close();
    };
    const about = () => {
      setAboutOpen(true);
      close();
    };
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("node", {
      style: desktop,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("node", {
          style: menuLayer,
          children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(MenuBar, {
            open: openMenu,
            onToggle: toggle,
            view,
            crt,
            onSource: showSource,
            onReboot: reboot,
            onToggleCrt: toggleCrt,
            onAbout: about
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("node", {
          style: bodyWrap,
          children: view === "code" ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(CodeViewer, {}) : /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Home2, {
            crt,
            setCrt
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("node", {
          style: statusBar,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("text", {
              style: statusText,
              children: view === "code" ? "Viewing source" : "Ready"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("text", {
              style: statusText,
              children: crt ? "CRT: on" : "CRT: off"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("node", {
          style: taskLayer,
          children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Taskbar, {
            startOpen: openMenu === "start",
            view,
            onStart: () => toggle("start"),
            onSource: showSource,
            onReboot: reboot,
            onAbout: about
          })
        }),
        openMenu !== null ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("button", {
          style: backdrop,
          onClick: close
        }) : null,
        aboutOpen ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(AboutDialog, {
          onClose: () => setAboutOpen(false)
        }) : null
      ]
    });
  }
  var desktop = {
    positionType: "relative",
    width: "100%",
    height: "100%",
    flexDirection: "column"
  };
  var menuLayer = {
    zIndex: 100
  };
  var taskLayer = {
    zIndex: 100
  };
  var bodyWrap = {
    flexGrow: 1,
    flexDirection: "column",
    zIndex: 0
  };
  var statusBar = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "spaceBetween",
    padding: {
      top: 6,
      bottom: 6,
      left: 16,
      right: 16
    },
    backgroundColor: Colors.surface100,
    borderColor: Colors.surface400,
    border: {
      top: 2,
      right: 0,
      bottom: 0,
      left: 0
    }
  };
  var statusText = {
    color: Colors.textColor300,
    fontSize: FontSizes.xs,
    fontFamily: "Noto Sans Mono"
  };
  var backdrop = {
    positionType: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.transparent,
    zIndex: 50
  };

  // src/demos/elements/surfaceDemo/BootScreen.tsx
  var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
  var import_react15 = __toESM(require_react(), 1);
  function BootScreen({ phase, titleDelay, onTitleDone, onBootDone }) {
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
      style: bootScreen,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Typewriter, {
          style: bootBrand,
          text: "bevy-react OS",
          tickMs: 150,
          startDelay: titleDelay,
          onDone: onTitleDone
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
          style: {
            height: 200,
            flexDirection: "column",
            alignItems: "center",
            gap: 10
          },
          children: phase === "booting" && /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)(import_jsx_runtime24.Fragment, {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(TextMono, {
                style: bootStatus,
                children: "booting..."
              }),
              /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(ProgressBar2, {
                onDone: onBootDone
              })
            ]
          })
        })
      ]
    });
  }
  var STRIP_COUNT = 20;
  var STRIPS = Array(STRIP_COUNT).fill(0);
  var STRIP_MS = 150;
  var FULL_HOLD_MS = 400;
  function ProgressBar2({ onDone }) {
    const [progress, setProgress] = (0, import_react15.useState)(0);
    (0, import_react15.useEffect)(() => {
      if (progress >= STRIP_COUNT) {
        const t2 = setTimeout(onDone, FULL_HOLD_MS);
        return () => clearTimeout(t2);
      }
      const t = setTimeout(() => setProgress((p) => p + 1), STRIP_MS);
      return () => clearTimeout(t);
    }, [
      progress
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
      style: {
        width: 350,
        height: 50,
        border: 2,
        borderColor: Colors.surface600,
        borderRadius: 8,
        flexDirection: "row",
        gap: 7,
        padding: 5
      },
      children: STRIPS.map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
        style: {
          width: 20,
          backgroundColor: progress > index ? Colors.surface600 : Colors.transparent
        }
      }, index))
    });
  }
  var bootScreen = {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24
  };
  var bootBrand = {
    color: Colors.textColor100,
    fontSize: FontSizes.xxl,
    fontWeight: "bold"
  };
  var bootStatus = {
    color: Colors.primary100,
    fontSize: FontSizes.lg
  };

  // src/demos/elements/surfaceDemo/MonitorApp.tsx
  var POWER_MS = 420;
  var BLACK_HOLD_MS = 2e3;
  var TITLE_DELAY_MS = 1500;
  function MonitorApp() {
    const [phase, setPhase] = (0, import_react16.useState)(null);
    const [crt, setCrt] = (0, import_react16.useState)(true);
    (0, import_react16.useEffect)(() => {
      bevy.surfaceDemo.setCrt(crt);
    }, [
      crt
    ]);
    function startReboot() {
      setPhase("off");
    }
    (0, import_react16.useEffect)(() => {
      if (phase !== "off") return;
      const t = setTimeout(() => setPhase("boot"), POWER_MS + BLACK_HOLD_MS);
      return () => clearTimeout(t);
    }, [
      phase
    ]);
    const powered = phase !== "off";
    const booting = phase === "boot" || phase === "booting";
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("node", {
      style: {
        ...powerWrap,
        opacity: powered ? 1 : 0,
        transform: {
          scale: powered ? 1 : 0
        },
        transition: {
          opacity: {
            duration: POWER_MS
          },
          transform: {
            duration: POWER_MS,
            easing: "easeInOut"
          }
        }
      },
      children: booting ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(BootScreen, {
        phase,
        titleDelay: TITLE_DELAY_MS,
        onTitleDone: () => setTimeout(() => setPhase("booting"), 1e3),
        onBootDone: () => setPhase(null)
      }) : /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Desktop, {
        crt,
        setCrt,
        onReboot: startReboot
      })
    });
  }
  var powerWrap = {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: Colors.surface200
  };

  // src/demos/elements/surfaceDemo/index.tsx
  function SurfaceDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("surface", {
      name: "monitor",
      style: screenRoot2,
      children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(MonitorApp, {})
    });
  }
  var screenRoot2 = {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: Colors.transparent
  };

  // src/demos/layout/ScrollDemo.tsx
  var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
  var ITEMS = Array.from({
    length: 20
  }, (_, i) => `Item ${i + 1}`);
  function ScrollDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(Example, {
      description: "overflowY: scroll clips a tall child and adds a wheel scrollbar. Hover the list and scroll.",
      tsx: `<node style={{
  height: 180,
  overflowY: "scroll",
  scrollbarWidth: 8,
}}>`,
      children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
        style: listStyle,
        children: ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("node", {
          style: rowStyle,
          children: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("text", {
            style: {
              color: Colors.textColor100,
              fontSize: FontSizes.sm
            },
            children: item
          })
        }, item))
      })
    });
  }
  var listStyle = {
    flexDirection: "column",
    gap: 6,
    width: 240,
    height: 180,
    padding: 8,
    overflowY: "scroll",
    scrollbarWidth: 8,
    backgroundColor: Colors.surface100,
    borderRadius: 8
  };
  var rowStyle = {
    padding: "10px 12px",
    borderRadius: 6,
    backgroundColor: Colors.surface400
  };

  // src/demos/elements/EditableTextDemo.tsx
  var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
  var import_react17 = __toESM(require_react(), 1);
  var TYPESCRIPT8 = `<editableText
  value={text}
  onChange={setText}
  maxLength={40}
/>`;
  function EditableTextDemo() {
    const [text, setText] = (0, import_react17.useState)("");
    return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)(Example, {
      description: "A focusable text input: a controlled value with onChange.",
      tsx: TYPESCRIPT8,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("text", {
          children: "What's your name?"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("editableText", {
          value: text,
          onChange: setText,
          maxLength: 40,
          style: inputStyle
        }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("text", {
          style: {
            fontSize: FontSizes.xxl,
            opacity: text ? 1 : 0
          },
          children: [
            "Hello ",
            text
          ]
        })
      ]
    });
  }
  var inputStyle = {
    width: 280,
    height: 40,
    justifyContent: "center",
    padding: {
      top: 8,
      right: 12,
      bottom: 8,
      left: 12
    },
    backgroundColor: Colors.surface100,
    borderRadius: 8,
    border: 1,
    borderColor: Colors.primary100,
    color: Colors.textColor100,
    fontSize: FontSizes.base
  };

  // src/demos/elements/NodeDemo.tsx
  var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);
  var import_react18 = __toESM(require_react(), 1);
  var TYPESCRIPT9 = `<node style={{ padding: 16, gap: 12 }}>
  <node style={{ width: 48, height: 48 }} />
</node>`;
  function NodeDemo() {
    const [gap, setGap] = (0, import_react18.useState)(12);
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)(Example, {
      description: "A plain container you style and nest. Children flow inside it; drag to space them out.",
      tsx: TYPESCRIPT9,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("node", {
          style: {
            ...panelStyle,
            gap
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("node", {
              style: {
                ...boxStyle2,
                backgroundColor: Colors.primary100
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("node", {
              style: {
                ...boxStyle2,
                backgroundColor: Colors.green100
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("node", {
              style: {
                ...boxStyle2,
                backgroundColor: Colors.red100
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(Slider, {
          value: gap,
          min: 0,
          max: 32,
          onChange: setGap,
          label: `gap ${gap.toFixed(0)}`
        })
      ]
    });
  }
  var panelStyle = {
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var boxStyle2 = {
    width: 48,
    height: 48,
    borderRadius: 8
  };

  // src/demos/layout/FlexDemo.tsx
  var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
  var import_react19 = __toESM(require_react(), 1);
  var SWATCHES = Gradients.spectrum;
  var DIRECTION_OPTIONS = [
    {
      label: "row",
      value: "row"
    },
    {
      label: "column",
      value: "column"
    }
  ];
  var JUSTIFY_OPTIONS = [
    {
      label: "center",
      value: "center"
    },
    {
      label: "flexStart",
      value: "flexStart"
    },
    {
      label: "flexEnd",
      value: "flexEnd"
    },
    {
      label: "spaceBetween",
      value: "spaceBetween"
    }
  ];
  var ALIGN_OPTIONS = [
    {
      label: "center",
      value: "center"
    },
    {
      label: "flexStart",
      value: "flexStart"
    },
    {
      label: "flexEnd",
      value: "flexEnd"
    },
    {
      label: "stretch",
      value: "stretch"
    }
  ];
  function Swatches({ count = 4 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(import_jsx_runtime30.Fragment, {
      children: SWATCHES.slice(0, count).map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
        style: {
          ...swatch,
          backgroundGradient: g
        }
      }, i))
    });
  }
  function FlexPlayground() {
    const [flexDirection, setFlexDirection] = (0, import_react19.useState)("row");
    const [justifyContent, setJustifyContent] = (0, import_react19.useState)("center");
    const [alignItems, setAlignItems] = (0, import_react19.useState)("center");
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 12,
        alignItems: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
          style: {
            ...playground,
            flexDirection,
            justifyContent,
            alignItems
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Swatches, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Radio, {
          options: DIRECTION_OPTIONS,
          value: flexDirection,
          onChange: setFlexDirection
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Radio, {
          options: JUSTIFY_OPTIONS,
          value: justifyContent,
          onChange: setJustifyContent
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Radio, {
          options: ALIGN_OPTIONS,
          value: alignItems,
          onChange: setAlignItems
        })
      ]
    });
  }
  function FlexDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)(import_jsx_runtime30.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Example, {
          description: "Flip the three main flex knobs live and watch the swatches rearrange.",
          tsx: `<node style={{
  flexDirection,
  justifyContent,
  alignItems
}}>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(FlexPlayground, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Example, {
          description: "flexWrap pushes overflowing children onto the next line.",
          tsx: `<node style={{ flexWrap: "wrap", gap: 8 }}>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
            style: {
              ...frame,
              width: 152,
              flexWrap: "wrap",
              gap: 8
            },
            children: Array.from({
              length: 8
            }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
              style: {
                ...swatch,
                backgroundGradient: SWATCHES[i % SWATCHES.length]
              }
            }, i))
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(Example, {
          description: "flexGrow lets a child absorb the remaining space.",
          tsx: `<node style={{ flexGrow: 1 }}>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("node", {
            style: {
              ...frame,
              width: 260,
              gap: 8
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
                style: {
                  ...swatch,
                  backgroundGradient: SWATCHES[0]
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
                style: {
                  ...grow,
                  backgroundGradient: SWATCHES[1]
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("node", {
                style: {
                  ...swatch,
                  backgroundGradient: SWATCHES[2]
                }
              })
            ]
          })
        })
      ]
    });
  }
  var playground = {
    width: 320,
    height: 160,
    gap: 10,
    padding: 12,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var frame = {
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var swatch = {
    width: 40,
    height: 40,
    borderRadius: 8
  };
  var grow = {
    flexGrow: 1,
    height: 40,
    borderRadius: 8
  };

  // src/demos/layout/GridDemo.tsx
  var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
  var import_react20 = __toESM(require_react(), 1);
  var CELLS = Gradients.spectrum;
  function Cells({ count, from = 0 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(import_jsx_runtime31.Fragment, {
      children: Array.from({
        length: count
      }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Cell, {
        label: i + from + 1,
        gradient: CELLS[(i + from) % CELLS.length]
      }, i))
    });
  }
  function Cell({ label: label3, gradient }) {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
      style: {
        ...cell,
        backgroundGradient: gradient
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
        style: cellText,
        children: label3
      })
    });
  }
  var COLS_OPTIONS = [
    {
      label: "2",
      value: 2
    },
    {
      label: "3",
      value: 3
    },
    {
      label: "4",
      value: 4
    }
  ];
  function GridPlayground() {
    const [cols, setCols] = (0, import_react20.useState)(3);
    const [gap, setGap] = (0, import_react20.useState)(8);
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
      style: controlColumn,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
          style: {
            ...frame2,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Cells, {
            count: cols * 2
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Radio, {
          options: COLS_OPTIONS,
          value: cols,
          onChange: setCols
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Slider, {
          value: gap,
          min: 0,
          max: 20,
          onChange: setGap,
          label: `gap ${gap.toFixed(0)}`
        })
      ]
    });
  }
  function GridDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)(import_jsx_runtime31.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Example, {
          description: "repeat(n, 1fr) makes n equal, flexible columns. Try the count and gap.",
          tsx: `<node style={{
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
}}>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(GridPlayground, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Example, {
          description: "Mixed tracks: a fixed sidebar and a flexible body column.",
          tsx: `gridTemplateColumns: "80px 1fr"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
            style: {
              ...frame2,
              gridTemplateColumns: "80px 1fr"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Cells, {
              count: 4
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Example, {
          description: "gridColumn: span 2 makes a cell straddle two columns.",
          tsx: `<node style={{ gridColumn: "span 2" }}>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
            style: {
              ...frame2,
              gridTemplateColumns: "repeat(3, 1fr)"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
                style: {
                  ...cell,
                  gridColumn: "span 2",
                  backgroundGradient: CELLS[0]
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
                  style: cellText,
                  children: "span 2"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Cells, {
                count: 4,
                from: 1
              })
            ]
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Example, {
          description: "gridRow: span 2 with explicit rows builds a feature cell.",
          tsx: `gridTemplateRows: "repeat(2, 48px)"
gridRow: "span 2"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("node", {
            style: {
              ...frame2,
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(2, 48px)"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("node", {
                style: {
                  ...cell,
                  gridRow: "span 2",
                  backgroundGradient: CELLS[0]
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("text", {
                  style: cellText,
                  children: "tall"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(Cells, {
                count: 4,
                from: 1
              })
            ]
          })
        })
      ]
    });
  }
  var controlColumn = {
    flexDirection: "column",
    alignItems: "center",
    gap: 16
  };
  var frame2 = {
    display: "grid",
    width: 280,
    gap: 8,
    padding: 12,
    gridAutoRows: "48px",
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var cell = {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  };
  var cellText = {
    color: Colors.textColor400,
    fontSize: FontSizes.xs,
    fontWeight: "bold"
  };

  // src/demos/elements/ButtonDemo.tsx
  var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
  var import_react21 = __toESM(require_react(), 1);
  var TYPESCRIPT10 = `<button
  onClick={() => setCount((c) => c + 1)}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ backgroundColor: "#5a7fd6" }}
/>`;
  function ButtonDemo() {
    const [count, setCount] = (0, import_react21.useState)(0);
    return /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(Example, {
      description: "A clickable node with hover and press style overrides, driving React state.",
      tsx: TYPESCRIPT10,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("text", {
          style: countStyle2,
          children: [
            "Clicks: ",
            /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("text", {
              style: {
                color: Colors.primary100
              },
              children: count
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("button", {
          onClick: () => setCount((c) => c + 1),
          style: clickButtonStyle,
          hoverStyle: {
            backgroundColor: Colors.primary200
          },
          pressStyle: {
            backgroundColor: Colors.primary300
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("text", {
            style: clickLabelStyle,
            children: "Click me"
          })
        })
      ]
    });
  }
  var countStyle2 = {
    color: Colors.textColor100,
    fontSize: FontSizes.lg
  };
  var clickButtonStyle = {
    width: 160,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.primary100
  };
  var clickLabelStyle = {
    color: Colors.textColor400,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };

  // src/demos/elements/TextDemo.tsx
  var import_jsx_runtime33 = __toESM(require_jsx_runtime(), 1);
  var import_react22 = __toESM(require_react(), 1);
  var SIZE_TS = `<text style={{ fontSize: 28, fontWeight: "bold" }}>
  Big & bold
</text>`;
  var FAMILY_TS = `<text style={{ fontFamily: "DancingScript" }}>`;
  var TYPOGRAPHY_TS = `<text style={{ lineHeight: 1.8, letterSpacing: 2 }}>
<text style={{ textShadow: { color: "#000", offsetX: 2, offsetY: 2 } }}>`;
  var WRAP_TS = `<text style={{ width: 220, lineBreak: "anyCharacter" }}>`;
  var PARAGRAPH = "Line height, letter spacing, and a drop shadow give a block of text its rhythm and weight.";
  var LINE_BREAKS = [
    {
      label: "wordBoundary",
      value: "wordBoundary"
    },
    {
      label: "anyCharacter",
      value: "anyCharacter"
    },
    {
      label: "wordOrCharacter",
      value: "wordOrCharacter"
    },
    {
      label: "noWrap",
      value: "noWrap"
    }
  ];
  function TextDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(import_jsx_runtime33.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Example, {
          description: "fontSize and fontWeight scale text. Drag to resize.",
          tsx: SIZE_TS,
          children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(SizeControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(Example, {
          description: "Custom font families, and inline nested color spans within one <text>.",
          tsx: FAMILY_TS,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
              style: {
                fontFamily: "DancingScript",
                fontSize: FontSizes.xxl,
                color: Colors.amber100
              },
              children: "Styled with a custom font family"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("text", {
              style: {
                fontSize: FontSizes.lg,
                color: Colors.textColor100
              },
              children: [
                "Nested texts color",
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
                  style: {
                    color: Colors.primary100,
                    fontWeight: "bold"
                  },
                  children: "part"
                }),
                " ",
                "of a",
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
                  style: {
                    color: Colors.red100,
                    fontWeight: "bold"
                  },
                  children: "sentence"
                }),
                "."
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Example, {
          description: "lineHeight, letterSpacing, and textShadow tune typography. Drag the sliders and toggle the shadow.",
          tsx: TYPOGRAPHY_TS,
          children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(TypographyControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Example, {
          description: "lineBreak controls wrapping when text overflows its width. Pick a mode.",
          tsx: WRAP_TS,
          children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(WrapControl, {})
        })
      ]
    });
  }
  function SizeControl() {
    const [size, setSize] = (0, import_react22.useState)(28);
    return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("node", {
      style: {
        flexDirection: "column",
        alignItems: "center",
        gap: 16
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
          style: {
            fontSize: size,
            fontWeight: "thin"
          },
          children: "thin"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
          style: {
            fontSize: size,
            fontWeight: "normal"
          },
          children: "normal"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
          style: {
            fontSize: size,
            fontWeight: "bold"
          },
          children: "bold"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Slider, {
          value: size,
          min: 10,
          max: 48,
          onChange: setSize,
          label: `fontSize ${size.toFixed(0)}`
        })
      ]
    });
  }
  function TypographyControl() {
    const [lineHeight, setLineHeight] = (0, import_react22.useState)(1.4);
    const [letterSpacing, setLetterSpacing] = (0, import_react22.useState)(1.5);
    const [shadow, setShadow] = (0, import_react22.useState)(true);
    return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 16,
        width: 380
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
          style: {
            fontSize: FontSizes.base,
            color: Colors.textColor100,
            lineHeight,
            letterSpacing,
            textShadow: shadow ? {
              color: "#000000cc",
              offsetX: 2,
              offsetY: 2
            } : void 0
          },
          children: PARAGRAPH
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Slider, {
          value: lineHeight,
          min: 1,
          max: 2.5,
          onChange: setLineHeight,
          label: `lineHeight ${lineHeight.toFixed(2)}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Slider, {
          value: letterSpacing,
          min: 0,
          max: 8,
          onChange: setLetterSpacing,
          label: `letterSpacing ${letterSpacing.toFixed(1)}px`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Checkbox, {
          label: "textShadow",
          enabled: shadow,
          onChange: setShadow
        })
      ]
    });
  }
  function WrapControl() {
    const [mode, setMode] = (0, import_react22.useState)("wordBoundary");
    return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("node", {
      style: {
        flexDirection: "column",
        alignItems: "center",
        gap: 16
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("node", {
          style: {
            width: 220,
            padding: 12,
            backgroundColor: Colors.surface100,
            borderRadius: 8
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("text", {
            style: {
              fontSize: FontSizes.sm,
              color: Colors.textColor200,
              lineBreak: mode
            },
            children: "Pneumonoultramicroscopicsilicovolcanoconiosis wraps differently per mode."
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(Radio, {
          value: mode,
          options: LINE_BREAKS,
          onChange: setMode
        })
      ]
    });
  }

  // src/demos/elements/ImageDemo.tsx
  var import_jsx_runtime34 = __toESM(require_jsx_runtime(), 1);
  var import_react23 = __toESM(require_react(), 1);
  var FLIP_TSX = `<image src="bevy-react-logo.png" tint="#7aa2f7" flipX flipY />`;
  var SLICE_TSX = `<image
  src="modal.png"
  imageMode={{ type: "sliced", border: 60 }}
  style={{ width, height }}
/>`;
  function ImageDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(import_jsx_runtime34.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Example, {
          description: "An image asset loaded by src, with an optional tint and per-axis flips.",
          tsx: FLIP_TSX,
          children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(FlipControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Example, {
          description: "9-slice scaling resizes a frame without distorting its corners. Drag the sliders: the corners stay crisp while the edges stretch.",
          tsx: SLICE_TSX,
          children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(SliceControl, {})
        })
      ]
    });
  }
  function FlipControl() {
    const [flipX, setFlipX] = (0, import_react23.useState)(false);
    const [flipY, setFlipY] = (0, import_react23.useState)(false);
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(import_jsx_runtime34.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 24,
            alignItems: "center"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("image", {
              src: "bevy-react-logo.png",
              style: logoStyle,
              flipX,
              flipY
            }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("image", {
              src: "bevy-react-logo.png",
              style: logoStyle,
              tint: Colors.primary100,
              flipX,
              flipY
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 12
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(Button, {
              onClick: () => setFlipX((f) => !f),
              children: [
                "flipX: ",
                flipX ? "on" : "off"
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)(Button, {
              onClick: () => setFlipY((f) => !f),
              children: [
                "flipY: ",
                flipY ? "on" : "off"
              ]
            })
          ]
        })
      ]
    });
  }
  function SliceControl() {
    const [width, setWidth] = (0, import_react23.useState)(280);
    const [height, setHeight] = (0, import_react23.useState)(160);
    return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("node", {
      style: {
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("node", {
          style: frameBox,
          children: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("image", {
            src: "modal.png",
            style: {
              width,
              height
            },
            imageMode: {
              type: "sliced",
              border: 120,
              maxCornerScale: 0.7
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Slider, {
          value: width,
          min: 80,
          max: 360,
          onChange: (v) => setWidth(Math.round(v)),
          label: `width ${Math.round(width)}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(Slider, {
          value: height,
          min: 80,
          max: 240,
          onChange: (v) => setHeight(Math.round(v)),
          label: `height ${Math.round(height)}`
        })
      ]
    });
  }
  var logoStyle = {
    width: 120,
    height: 120
  };
  var frameBox = {
    alignItems: "center",
    justifyContent: "center",
    backgroundGradient: Gradients.spectrum,
    borderRadius: 100
  };

  // src/demos/animations/FadeAnimationDemo.tsx
  var import_jsx_runtime35 = __toESM(require_jsx_runtime(), 1);
  var import_react24 = __toESM(require_react(), 1);
  var import_bevy_react3 = __toESM(require_bevy_react(), 1);
  var FADE_MS = 500;
  var TYPESCRIPT11 = `const opacity = useSharedValue(1);
opacity.value = withRepeat(
  withTiming(0, { duration: 500 }),
  -1, true, // ping-pong
);
<Animated.node animatedStyle={{ opacity }} />`;
  function FadeAnimationDemo() {
    const opacity = (0, import_bevy_react3.useSharedValue)(1);
    (0, import_react24.useEffect)(() => {
      opacity.value = (0, import_bevy_react3.withRepeat)((0, import_bevy_react3.withTiming)(0, {
        duration: FADE_MS,
        easing: "easeInOut"
      }), -1, true);
    }, [
      opacity
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(Example, {
      description: "A shared value drives animatedStyle imperatively, looped, ping-ponging opacity.",
      tsx: TYPESCRIPT11,
      children: /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("node", {
        style: fadeStageStyle,
        children: /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(import_bevy_react3.Animated.node, {
          style: fadeSquareStyle,
          animatedStyle: {
            opacity
          }
        })
      })
    });
  }
  var fadeStageStyle = {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center"
  };
  var fadeSquareStyle = {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: Colors.primary100
  };

  // src/demos/animations/BouncingBallsAnimationDemo.tsx
  var import_jsx_runtime36 = __toESM(require_jsx_runtime(), 1);
  var import_react25 = __toESM(require_react(), 1);
  var import_bevy_react4 = __toESM(require_bevy_react(), 1);
  var TYPESCRIPT12 = `withRepeat(withSequence(
  withDelay(280, withTiming(110)),
  withDelay(280, withTiming(-110)),
), -1);
animatedStyle={{ translateX, scale, backgroundColor }}`;
  var COUNT = 4;
  var AMP = 110;
  var SQUARE = 44;
  var TRAVEL_MS = 650;
  var STOP_MS = 280;
  var STAGGER_MS = 80;
  var PULSE_MS = 600;
  var RETARGET_MS = 280;
  var COOL = [
    Colors.primary100,
    Colors.red100,
    Colors.green100,
    Colors.yellow100,
    Colors.purple100
  ];
  var WARM = [
    Colors.purple100,
    Colors.orange100,
    Colors.teal100,
    Colors.red100,
    Colors.sky100
  ];
  function BouncingBallsAnimationDemo() {
    const [mode, setMode] = (0, import_react25.useState)("easeInOut");
    return /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)(Example, {
      description: "Staggered squares compose sequence/repeat/delay drivers; switch the easing live.",
      tsx: TYPESCRIPT12,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("node", {
          style: lanesStyle,
          children: Array.from({
            length: COUNT
          }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(BouncingSquare, {
            index: i,
            mode
          }, i))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("node", {
          style: rowStyle2,
          children: [
            "linear",
            "easeInOut",
            "spring"
          ].map((m) => /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(ModeButton, {
            label: m,
            selected: m === mode,
            onPress: () => setMode(m)
          }, m))
        })
      ]
    });
  }
  function BouncingSquare({ index, mode }) {
    const x = (0, import_bevy_react4.useSharedValue)(-AMP);
    const pulse = (0, import_bevy_react4.useSharedValue)(0);
    const first = (0, import_react25.useRef)(true);
    (0, import_react25.useEffect)(() => {
      pulse.value = (0, import_bevy_react4.withDelay)(index * STAGGER_MS, (0, import_bevy_react4.withRepeat)((0, import_bevy_react4.withTiming)(1, {
        duration: PULSE_MS,
        easing: "easeInOut"
      }), -1, true));
    }, [
      pulse,
      index
    ]);
    (0, import_react25.useEffect)(() => {
      const move = (to) => mode === "spring" ? (0, import_bevy_react4.withSpring)(to, {
        stiffness: 120,
        damping: 14
      }) : (0, import_bevy_react4.withTiming)(to, {
        duration: TRAVEL_MS,
        easing: mode
      });
      const bounce = (0, import_bevy_react4.withRepeat)((0, import_bevy_react4.withSequence)((0, import_bevy_react4.withDelay)(STOP_MS, move(AMP)), (0, import_bevy_react4.withDelay)(STOP_MS, move(-AMP))), -1);
      const driver = first.current ? bounce : (0, import_bevy_react4.withSequence)((0, import_bevy_react4.withTiming)(-AMP, {
        duration: RETARGET_MS,
        easing: "easeInOut"
      }), bounce);
      first.current = false;
      x.value = (0, import_bevy_react4.withDelay)(index * STAGGER_MS, driver);
    }, [
      x,
      index,
      mode
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("node", {
      style: laneStyle,
      children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)(import_bevy_react4.Animated.node, {
        style: {
          ...squareStyle,
          backgroundColor: COOL[index]
        },
        animatedStyle: {
          translateX: x,
          scale: (0, import_bevy_react4.interpolate)(pulse, [
            0,
            1
          ], [
            0.9,
            1.1
          ]),
          backgroundColor: (0, import_bevy_react4.interpolateColor)(pulse, [
            0,
            1
          ], [
            COOL[index],
            WARM[index]
          ])
        }
      })
    });
  }
  function ModeButton({ label: label3, selected, onPress }) {
    return /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("button", {
      onClick: onPress,
      style: {
        ...modeButtonStyle,
        backgroundColor: selected ? Colors.primary100 : Colors.surface300
      },
      hoverStyle: {
        backgroundColor: selected ? Colors.primary100 : Colors.surface500
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("text", {
        style: {
          color: selected ? Colors.textColor400 : Colors.textColor100,
          fontSize: FontSizes.sm
        },
        children: label3
      })
    });
  }
  var lanesStyle = {
    flexDirection: "column",
    alignItems: "center",
    gap: 10
  };
  var laneStyle = {
    width: 2 * AMP + SQUARE,
    height: SQUARE,
    justifyContent: "center",
    alignItems: "center"
  };
  var squareStyle = {
    width: SQUARE,
    height: SQUARE,
    borderRadius: 10,
    backgroundColor: Colors.primary100
  };
  var rowStyle2 = {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center"
  };
  var modeButtonStyle = {
    padding: {
      top: 8,
      right: 14,
      bottom: 8,
      left: 14
    },
    borderRadius: 8,
    backgroundColor: Colors.surface300,
    justifyContent: "center",
    alignItems: "center"
  };

  // src/demos/animations/TransitionDemo.tsx
  var import_jsx_runtime37 = __toESM(require_jsx_runtime(), 1);
  var import_react26 = __toESM(require_react(), 1);
  function TransitionDemo() {
    const [on2, setOn] = (0, import_react26.useState)(false);
    return /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)(import_jsx_runtime37.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(Example, {
          description: "A `transition` eases hover/press style changes instead of snapping them.",
          tsx: `<button
  style={{ transform: { scale: 1 }, transition: {
    transform: { duration: 120, easing: "easeOut" },
    backgroundColor: { duration: 180 },
  }}}
  hoverStyle={{ backgroundColor: "#89b4fa" }}
  pressStyle={{ transform: { scale: 0.92 } }}
/>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("button", {
            style: {
              ...pillStyle2,
              backgroundColor: Colors.primary100,
              transform: {
                scale: 1
              },
              transition: {
                transform: {
                  duration: 120,
                  easing: "easeOut"
                },
                backgroundColor: {
                  duration: 180
                }
              }
            },
            hoverStyle: {
              backgroundColor: Colors.primary200
            },
            pressStyle: {
              transform: {
                scale: 0.92
              },
              backgroundColor: Colors.primary300
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("text", {
              style: labelStyle,
              children: "Press me"
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime37.jsx)(Example, {
          description: "Transitions also ease plain React-state changes; here a spring drives the toggle.",
          tsx: `<button
  style={{
    transform: { translateX: on ? 36 : -36 },
    transition: { transform: { stiffness: 180, damping: 14 } },
  }}
/>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("button", {
            onClick: () => setOn((v) => !v),
            style: {
              ...pillStyle2,
              backgroundColor: on2 ? Colors.green100 : Colors.surface500,
              opacity: on2 ? 1 : 0.6,
              transform: {
                translateX: on2 ? 36 : -36
              },
              transition: {
                transform: {
                  stiffness: 180,
                  damping: 14
                },
                opacity: {
                  duration: 200
                },
                backgroundColor: {
                  duration: 200
                }
              }
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("text", {
              style: labelStyle,
              children: on2 ? "ON" : "OFF"
            })
          })
        })
      ]
    });
  }
  var pillStyle2 = {
    width: 160,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8
  };
  var labelStyle = {
    color: Colors.textColor400,
    fontSize: FontSizes.base,
    fontWeight: "bold"
  };

  // src/demos/animations/EasingDemo.tsx
  var import_jsx_runtime38 = __toESM(require_jsx_runtime(), 1);
  var import_react27 = __toESM(require_react(), 1);
  var import_bevy_react5 = __toESM(require_bevy_react(), 1);

  // src/demos/animations/shared.ts
  var column2 = {
    flexDirection: "column",
    alignItems: "center",
    gap: 16
  };
  var playButton = {
    justifyContent: "center",
    alignItems: "center",
    padding: {
      top: 8,
      right: 18,
      bottom: 8,
      left: 18
    },
    borderRadius: 8,
    backgroundColor: Colors.primary100,
    backgroundGradient: Gradients.primary,
    transform: {
      scale: 1
    },
    transition: {
      transform: {
        duration: 100,
        easing: "easeOut"
      }
    }
  };
  var playLabel = {
    color: Colors.textColor400,
    fontSize: FontSizes.sm,
    fontWeight: "bold"
  };

  // src/demos/animations/EasingDemo.tsx
  var TRAVEL = 200;
  var DOT = 24;
  var LANES = [
    {
      name: "linear",
      easing: "linear",
      color: Colors.primary100
    },
    {
      name: "easeIn",
      easing: "easeIn",
      color: Colors.green100
    },
    {
      name: "easeOut",
      easing: "easeOut",
      color: Colors.red100
    },
    {
      name: "easeInOut",
      easing: "easeInOut",
      color: Colors.purple100
    }
  ];
  var TYPESCRIPT13 = `x.value = withTiming(200, {
  duration: 800,
  easing: "easeInOut",
});`;
  function EasingDemo() {
    const [duration, setDuration] = (0, import_react27.useState)(800);
    const [play, setPlay] = (0, import_react27.useState)(0);
    return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Example, {
      description: "Same distance, same duration: press Play to compare the four easings.",
      tsx: TYPESCRIPT13,
      children: /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("node", {
        style: column2,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("node", {
            style: {
              flexDirection: "column",
              gap: 8
            },
            children: LANES.map((lane2) => /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Lane, {
              ...lane2,
              duration,
              play
            }, lane2.name))
          }),
          /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(Slider, {
            value: duration,
            min: 200,
            max: 2e3,
            onChange: setDuration,
            label: `duration ${duration.toFixed(0)}ms`
          }),
          /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("button", {
            style: playButton,
            pressStyle: {
              transform: {
                scale: 0.92
              }
            },
            onClick: () => setPlay((n) => n + 1),
            children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("text", {
              style: playLabel,
              children: "Play"
            })
          })
        ]
      })
    });
  }
  function Lane({ name, easing, color, duration, play }) {
    const x = (0, import_bevy_react5.useSharedValue)(0);
    const mounted = (0, import_react27.useRef)(false);
    (0, import_react27.useEffect)(() => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      x.value = 0;
      x.value = (0, import_bevy_react5.withTiming)(TRAVEL, {
        duration,
        easing
      });
    }, [
      x,
      easing,
      duration,
      play
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("node", {
      style: lane,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("text", {
          style: laneLabel,
          children: name
        }),
        /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("node", {
          style: track2,
          children: /* @__PURE__ */ (0, import_jsx_runtime38.jsx)(import_bevy_react5.Animated.node, {
            style: {
              ...dot,
              backgroundColor: color
            },
            animatedStyle: {
              translateX: x
            }
          })
        })
      ]
    });
  }
  var lane = {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  };
  var laneLabel = {
    width: 76,
    color: Colors.textColor200,
    fontSize: FontSizes.xs,
    textAlign: "right"
  };
  var track2 = {
    flexDirection: "row",
    alignItems: "center",
    width: TRAVEL + DOT,
    height: DOT + 6,
    backgroundColor: Colors.surface100,
    borderRadius: 6
  };
  var dot = {
    width: DOT,
    height: DOT,
    borderRadius: 6
  };

  // src/demos/animations/SpringDemo.tsx
  var import_jsx_runtime39 = __toESM(require_jsx_runtime(), 1);
  var import_react28 = __toESM(require_react(), 1);
  var import_bevy_react6 = __toESM(require_bevy_react(), 1);
  var TYPESCRIPT14 = `x.value = withSpring(90, {
  stiffness: 120,
  damping: 12,
});`;
  function SpringDemo() {
    const [stiffness, setStiffness] = (0, import_react28.useState)(120);
    const [damping, setDamping] = (0, import_react28.useState)(12);
    const [right, setRight] = (0, import_react28.useState)(false);
    const x = (0, import_bevy_react6.useSharedValue)(-90);
    const bounce = () => {
      const to = right ? -90 : 90;
      x.value = (0, import_bevy_react6.withSpring)(to, {
        stiffness,
        damping
      });
      setRight(!right);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(Example, {
      description: "A physical spring: low damping overshoots and wobbles, high damping glides.",
      tsx: TYPESCRIPT14,
      children: /* @__PURE__ */ (0, import_jsx_runtime39.jsxs)("node", {
        style: column2,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("node", {
            style: stage,
            children: /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(import_bevy_react6.Animated.node, {
              style: square,
              animatedStyle: {
                translateX: x
              }
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(Slider, {
            value: stiffness,
            min: 20,
            max: 300,
            onChange: setStiffness,
            label: `stiffness ${stiffness.toFixed(0)}`
          }),
          /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(Slider, {
            value: damping,
            min: 2,
            max: 40,
            onChange: setDamping,
            label: `damping ${damping.toFixed(0)}`
          }),
          /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("button", {
            style: playButton,
            pressStyle: {
              transform: {
                scale: 0.92
              }
            },
            onClick: bounce,
            children: /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("text", {
              style: playLabel,
              children: "Bounce"
            })
          })
        ]
      })
    });
  }
  var stage = {
    alignItems: "center",
    justifyContent: "center",
    width: 240,
    height: 64,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var square = {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary100,
    backgroundGradient: Gradients.primary
  };

  // src/demos/animations/SequenceDemo.tsx
  var import_jsx_runtime40 = __toESM(require_jsx_runtime(), 1);
  var import_bevy_react7 = __toESM(require_bevy_react(), 1);
  var TYPESCRIPT15 = `x.value = withSequence(
  withTiming(110, { easing: "easeOut" }),
  withDelay(250, withTiming(-110)),
  withDelay(250, withTiming(0)),
);`;
  function SequenceDemo() {
    const x = (0, import_bevy_react7.useSharedValue)(0);
    const run = () => {
      x.value = (0, import_bevy_react7.withSequence)((0, import_bevy_react7.withTiming)(110, {
        duration: 450,
        easing: "easeOut"
      }), (0, import_bevy_react7.withDelay)(250, (0, import_bevy_react7.withTiming)(-110, {
        duration: 450,
        easing: "easeInOut"
      })), (0, import_bevy_react7.withDelay)(250, (0, import_bevy_react7.withTiming)(0, {
        duration: 350,
        easing: "easeIn"
      })));
    };
    return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(Example, {
      description: "Press Play: slide right, pause, slide left, pause, return - one composed driver.",
      tsx: TYPESCRIPT15,
      children: /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)("node", {
        style: column2,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("node", {
            style: stage2,
            children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(import_bevy_react7.Animated.node, {
              style: square2,
              animatedStyle: {
                translateX: x
              }
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("button", {
            style: playButton,
            pressStyle: {
              transform: {
                scale: 0.92
              }
            },
            onClick: run,
            children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("text", {
              style: playLabel,
              children: "Play"
            })
          })
        ]
      })
    });
  }
  var stage2 = {
    alignItems: "center",
    justifyContent: "center",
    width: 280,
    height: 64,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var square2 = {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.green100
  };

  // src/demos/animations/SpinDemo.tsx
  var import_jsx_runtime41 = __toESM(require_jsx_runtime(), 1);
  var import_react29 = __toESM(require_react(), 1);
  var import_bevy_react8 = __toESM(require_bevy_react(), 1);
  var TYPESCRIPT16 = `rot.value = withRepeat(
  withTiming(Math.PI * 2, { easing: "linear" }),
  -1,
);
cancelAnimation(rot); // freeze`;
  function SpinDemo() {
    const rot = (0, import_bevy_react8.useSharedValue)(0);
    const [spinning, setSpinning] = (0, import_react29.useState)(false);
    const start = () => {
      rot.value = 0;
      rot.value = (0, import_bevy_react8.withRepeat)((0, import_bevy_react8.withTiming)(Math.PI * 2, {
        duration: 1200,
        easing: "linear"
      }), -1);
      setSpinning(true);
    };
    const stop = () => {
      (0, import_bevy_react8.cancelAnimation)(rot);
      setSpinning(false);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(Example, {
      description: "An endless rotation via withRepeat; Stop calls cancelAnimation to freeze it.",
      tsx: TYPESCRIPT16,
      children: /* @__PURE__ */ (0, import_jsx_runtime41.jsxs)("node", {
        style: column2,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("node", {
            style: stage3,
            children: /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(import_bevy_react8.Animated.node, {
              style: square3,
              animatedStyle: {
                rotate: rot
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("text", {
                style: squareText,
                children: "^"
              })
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime41.jsxs)("node", {
            style: {
              flexDirection: "row",
              gap: 10
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("button", {
                style: playButton,
                pressStyle: {
                  transform: {
                    scale: 0.92
                  }
                },
                onClick: start,
                children: /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("text", {
                  style: playLabel,
                  children: spinning ? "Restart" : "Start"
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("button", {
                style: {
                  ...playButton,
                  backgroundColor: Colors.red100
                },
                pressStyle: {
                  transform: {
                    scale: 0.92
                  }
                },
                onClick: stop,
                children: /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("text", {
                  style: playLabel,
                  children: "Stop"
                })
              })
            ]
          })
        ]
      })
    });
  }
  var stage3 = {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 120,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var square3 = {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.purple100,
    justifyContent: "center",
    alignItems: "center"
  };
  var squareText = {
    color: Colors.textColor400,
    fontSize: FontSizes.xxl,
    fontWeight: "bold"
  };

  // src/demos/animations/InterpolateDemo.tsx
  var import_jsx_runtime42 = __toESM(require_jsx_runtime(), 1);
  var import_react30 = __toESM(require_react(), 1);
  var import_bevy_react9 = __toESM(require_bevy_react(), 1);
  var TYPESCRIPT17 = `animatedStyle={{
  scale: interpolate(t, [0, 1], [0.6, 1.4]),
  backgroundColor: interpolateColor(
    t, [0, 1], ["#7aa2f7", "#f7768e"],
  ),
}}`;
  function InterpolateDemo() {
    const t = (0, import_bevy_react9.useSharedValue)(0);
    const [v, setV] = (0, import_react30.useState)(0);
    const onChange = (n) => {
      setV(n);
      t.value = n;
    };
    return /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(Example, {
      description: "Drag the value 0 to 1 and watch one shared value drive both scale and color.",
      tsx: TYPESCRIPT17,
      children: /* @__PURE__ */ (0, import_jsx_runtime42.jsxs)("node", {
        style: column2,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("node", {
            style: stage4,
            children: /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(import_bevy_react9.Animated.node, {
              style: square4,
              animatedStyle: {
                scale: (0, import_bevy_react9.interpolate)(t, [
                  0,
                  1
                ], [
                  0.6,
                  1.4
                ]),
                backgroundColor: (0, import_bevy_react9.interpolateColor)(t, [
                  0,
                  1
                ], [
                  Colors.primary100,
                  Colors.red100
                ])
              }
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(Slider, {
            value: v,
            min: 0,
            max: 1,
            onChange,
            label: `t ${v.toFixed(2)}`
          })
        ]
      })
    });
  }
  var stage4 = {
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 120,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var square4 = {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.primary100
  };

  // src/demos/styling/UnitsDemo.tsx
  var import_jsx_runtime43 = __toESM(require_jsx_runtime(), 1);
  var import_react31 = __toESM(require_react(), 1);

  // src/demos/styling/shared.ts
  var box2 = {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.primary100,
    justifyContent: "center",
    alignItems: "center"
  };
  var row3 = {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  };
  var stage5 = {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 14,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var caption = {
    color: Colors.textColor200,
    fontSize: FontSizes.xs
  };
  var controlColumn2 = {
    flexDirection: "column",
    alignItems: "center",
    gap: 16
  };

  // src/demos/styling/UnitsDemo.tsx
  function UnitsDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)(import_jsx_runtime43.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(Example, {
          description: "Lengths: a bare number is px; strings carry a unit. % is relative to the parent, vw/vh/vmin/vmax to the viewport, plus auto.",
          tsx: `width: "80px" | "50%" | "10vw"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(LengthSection, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(Example, {
          description: "Font size: a bare number is px; strings carry px, viewport units (vw/vh/vmin/vmax), or rem (relative to Bevy's RemSize, default 20px).",
          tsx: `fontSize: "14px" | "1.5rem" | "2vw"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(FontSizeSection, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(Example, {
          description: "Angles: a bare number is degrees; strings carry deg/rad/turn/grad. These four are the same 45\xB0 written four ways.",
          tsx: `rotate: "45deg" | "0.785rad" | "0.125turn" | "50grad"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(AngleSection, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(Example, {
          description: "Time: a bare number is milliseconds; strings carry ms/s. Both boxes ease identically \u2014 click either to toggle.",
          tsx: `duration: "300ms"  \u2261  duration: "0.3s"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TimeSection, {})
        })
      ]
    });
  }
  var LENGTHS = [
    "80px",
    "50%",
    "10vw"
  ];
  function LengthSection() {
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
      style: {
        flexDirection: "column",
        gap: 10,
        width: 360
      },
      children: LENGTHS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("node", {
        style: {
          flexDirection: "column",
          gap: 4
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TextMono, {
            style: caption,
            children: w
          }),
          /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
            style: {
              width: w,
              height: 28,
              borderRadius: 6,
              backgroundColor: Colors.primary100
            }
          })
        ]
      }, w))
    });
  }
  var FONT_SIZES = [
    "14px",
    "1.5rem",
    "2vw"
  ];
  function FontSizeSection() {
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
      style: {
        flexDirection: "column",
        gap: 12
      },
      children: FONT_SIZES.map((size) => /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("node", {
        style: {
          flexDirection: "row",
          alignItems: "center",
          gap: 14
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
            style: {
              width: 90
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TextMono, {
              style: caption,
              children: size
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("text", {
            style: {
              fontSize: size,
              color: Colors.textColor100,
              fontWeight: "bold"
            },
            children: "Aa Bb Cc"
          })
        ]
      }, size))
    });
  }
  var ANGLES = [
    "45deg",
    "0.785rad",
    "0.125turn",
    "50grad"
  ];
  function AngleSection() {
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
      style: {
        ...row3,
        gap: 24
      },
      children: ANGLES.map((angle) => /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("node", {
        style: {
          flexDirection: "column",
          alignItems: "center",
          gap: 10
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
            style: stage5,
            children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
              style: {
                ...box2,
                width: 48,
                height: 48,
                backgroundColor: Colors.purple100,
                transform: {
                  rotate: angle
                }
              }
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TextMono, {
            style: caption,
            children: angle
          })
        ]
      }, angle))
    });
  }
  function TimeSection() {
    const [on2, setOn] = (0, import_react31.useState)(false);
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("node", {
      style: {
        ...row3,
        gap: 20
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TimeBox, {
          label: "300ms",
          duration: "300ms",
          on: on2,
          onToggle: () => setOn((v) => !v)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TimeBox, {
          label: "0.3s",
          duration: "0.3s",
          on: on2,
          onToggle: () => setOn((v) => !v)
        })
      ]
    });
  }
  function TimeBox({ label: label3, duration, on: on2, onToggle }) {
    return /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("node", {
      style: {
        flexDirection: "column",
        alignItems: "center",
        gap: 10
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("button", {
          onClick: onToggle,
          style: timeTrack,
          children: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("node", {
            style: {
              ...box2,
              width: 44,
              height: 44,
              backgroundColor: Colors.green100,
              transform: {
                translateX: on2 ? 96 : 0
              },
              transition: {
                transform: {
                  duration,
                  easing: "easeOut"
                }
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TextMono, {
          style: caption,
          children: label3
        })
      ]
    });
  }
  var timeTrack = {
    width: 160,
    height: 64,
    borderRadius: 12,
    padding: 10,
    justifyContent: "start",
    alignItems: "center",
    backgroundColor: Colors.surface100
  };

  // src/demos/styling/ColorsDemo.tsx
  var import_jsx_runtime44 = __toESM(require_jsx_runtime(), 1);
  var import_react32 = __toESM(require_react(), 1);
  var toHex = (n) => Math.round(n).toString(16).padStart(2, "0");
  function ColorsDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)(import_jsx_runtime44.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Example, {
          description: "backgroundColor fills a node. Mix it from R/G/B channels.",
          tsx: `<node style={{ backgroundColor: "#7aa2f7" }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(BackgroundControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Example, {
          description: "borderColor paints the edge laid out by `border`.",
          tsx: `border: 4, borderColor: "#bb9af7"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(BorderColorControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Example, {
          description: "color sets text color and inherits into nested <text>.",
          tsx: `<text style={{ color: "#f9e2af" }}>`,
          children: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(TextColorControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Example, {
          description: "Any CSS color works: hex, named, rgb()/hsl()/oklch(), or transparent.",
          tsx: `backgroundColor: "rebeccapurple""`,
          children: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(ColorFormatsRow, {})
        })
      ]
    });
  }
  var COLOR_FORMATS = [
    "tomato",
    "rgb(122 162 247)",
    "rgb(122, 62, 247)",
    "rgb(255 255 255 / 5%)",
    "hsl(140 70% 45%)",
    "oklch(0.7 0.15 30)",
    "#bb9af7"
  ];
  function ColorFormatsRow() {
    return /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("node", {
      style: {
        flexDirection: "column",
        gap: 10
      },
      children: COLOR_FORMATS.map((color) => /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("node", {
        style: {
          width: 150,
          height: 76,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("text", {
          style: {
            color: Colors.textColor400,
            fontSize: FontSizes.xs,
            fontWeight: "bold"
          },
          children: color
        })
      }, color))
    });
  }
  function BackgroundControl() {
    const [r, setR] = (0, import_react32.useState)(122);
    const [g, setG] = (0, import_react32.useState)(162);
    const [b, setB] = (0, import_react32.useState)(247);
    const color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("node", {
          style: {
            ...box2,
            width: 110,
            height: 72,
            backgroundColor: color
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("text", {
            style: {
              color: Colors.textColor400,
              fontSize: FontSizes.xs,
              fontWeight: "bold"
            },
            children: color
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Slider, {
          value: r,
          min: 0,
          max: 255,
          onChange: setR,
          label: `R ${r.toFixed(0)}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Slider, {
          value: g,
          min: 0,
          max: 255,
          onChange: setG,
          label: `G ${g.toFixed(0)}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Slider, {
          value: b,
          min: 0,
          max: 255,
          onChange: setB,
          label: `B ${b.toFixed(0)}`
        })
      ]
    });
  }
  var BORDER_OPTIONS = [
    {
      label: "blue",
      value: Colors.primary100
    },
    {
      label: "green",
      value: Colors.green100
    },
    {
      label: "red",
      value: Colors.red100
    },
    {
      label: "purple",
      value: Colors.purple100
    }
  ];
  function BorderColorControl() {
    const [c, setC] = (0, import_react32.useState)(Colors.purple100);
    return /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("node", {
          style: {
            ...box2,
            backgroundColor: Colors.surface200,
            border: 4,
            borderColor: c
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Radio, {
          options: BORDER_OPTIONS,
          value: c,
          onChange: setC
        })
      ]
    });
  }
  var TEXT_OPTIONS = [
    {
      label: "amber",
      value: Colors.amber100
    },
    {
      label: "sky",
      value: Colors.sky100
    },
    {
      label: "green",
      value: Colors.green100
    },
    {
      label: "red",
      value: Colors.red100
    }
  ];
  function TextColorControl() {
    const [c, setC] = (0, import_react32.useState)(Colors.amber100);
    return /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("text", {
          style: {
            color: c,
            fontSize: FontSizes.xxl,
            fontWeight: "bold"
          },
          children: "Colored text"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(Radio, {
          options: TEXT_OPTIONS,
          value: c,
          onChange: setC
        })
      ]
    });
  }

  // src/demos/styling/BordersDemo.tsx
  var import_jsx_runtime45 = __toESM(require_jsx_runtime(), 1);
  var import_react33 = __toESM(require_react(), 1);
  function BordersDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime45.jsxs)(import_jsx_runtime45.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(Example, {
          description: "borderRadius rounds the corners. Drag from square to pill.",
          tsx: `<node style={{ borderRadius: 16 }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(RadiusControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(Example, {
          description: "border adds an edge, painted by borderColor.",
          tsx: `border: 2, borderColor: "#7aa2f7"`,
          children: /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(WidthControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(Example, {
          description: "outline draws a ring outside the box, ignored by layout.",
          tsx: `outline: { width: 3, offset: 4, color: "#f9e2af" }`,
          children: /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(OutlineControl, {})
        })
      ]
    });
  }
  function RadiusControl() {
    const [r, setR] = (0, import_react33.useState)(16);
    return /* @__PURE__ */ (0, import_jsx_runtime45.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)("node", {
          style: {
            ...box2,
            borderRadius: r
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(Slider, {
          value: r,
          min: 0,
          max: 36,
          onChange: setR,
          label: `borderRadius ${r.toFixed(0)}`
        })
      ]
    });
  }
  function WidthControl() {
    const [w, setW] = (0, import_react33.useState)(2);
    return /* @__PURE__ */ (0, import_jsx_runtime45.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)("node", {
          style: {
            ...box2,
            backgroundColor: Colors.surface200,
            border: w,
            borderColor: Colors.primary100
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(Slider, {
          value: w,
          min: 0,
          max: 12,
          onChange: setW,
          label: `border ${w.toFixed(0)}`
        })
      ]
    });
  }
  function OutlineControl() {
    const [offset, setOffset] = (0, import_react33.useState)(4);
    return /* @__PURE__ */ (0, import_jsx_runtime45.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)("node", {
          style: {
            ...box2,
            outline: {
              width: 3,
              offset,
              color: Colors.amber100
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime45.jsx)(Slider, {
          value: offset,
          min: 0,
          max: 16,
          onChange: setOffset,
          label: `outline offset ${offset.toFixed(0)}`
        })
      ]
    });
  }

  // src/demos/styling/SpacingDemo.tsx
  var import_jsx_runtime46 = __toESM(require_jsx_runtime(), 1);
  var import_react34 = __toESM(require_react(), 1);
  function SpacingDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime46.jsxs)(import_jsx_runtime46.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(Example, {
          description: "padding insets content from the node's own edges.",
          tsx: `<node style={{ padding: 16 }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(PaddingControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(Example, {
          description: "gap spaces flex/grid children; rowGap/columnGap split it.",
          tsx: `<node style={{ gap: 16 }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(GapControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(Example, {
          description: "margin pushes a node away from its siblings.",
          tsx: `margin: { left: 24 }`,
          children: /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(MarginControl, {})
        })
      ]
    });
  }
  function PaddingControl() {
    const [p, setP] = (0, import_react34.useState)(16);
    return /* @__PURE__ */ (0, import_jsx_runtime46.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("node", {
          style: {
            ...wrap,
            padding: p
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("node", {
            style: inner
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(Slider, {
          value: p,
          min: 0,
          max: 40,
          onChange: setP,
          label: `padding ${p.toFixed(0)}`
        })
      ]
    });
  }
  function GapControl() {
    const [g, setG] = (0, import_react34.useState)(12);
    return /* @__PURE__ */ (0, import_jsx_runtime46.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime46.jsxs)("node", {
          style: {
            ...wrap,
            flexDirection: "row",
            gap: g
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("node", {
              style: inner
            }),
            /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("node", {
              style: {
                ...inner,
                backgroundColor: Colors.purple100
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("node", {
              style: {
                ...inner,
                backgroundColor: Colors.yellow100
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(Slider, {
          value: g,
          min: 0,
          max: 32,
          onChange: setG,
          label: `gap ${g.toFixed(0)}`
        })
      ]
    });
  }
  function MarginControl() {
    const [m, setM] = (0, import_react34.useState)(24);
    return /* @__PURE__ */ (0, import_jsx_runtime46.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("node", {
          style: {
            ...wrap,
            flexDirection: "row"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("node", {
            style: {
              ...inner,
              backgroundColor: Colors.green100,
              margin: {
                left: m
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime46.jsx)(Slider, {
          value: m,
          min: 0,
          max: 48,
          onChange: setM,
          label: `margin.left ${m.toFixed(0)}`
        })
      ]
    });
  }
  var wrap = {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: Colors.surface100,
    borderRadius: 10
  };
  var inner = {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.primary100
  };

  // src/demos/styling/SizingDemo.tsx
  var import_jsx_runtime47 = __toESM(require_jsx_runtime(), 1);
  var import_react35 = __toESM(require_react(), 1);
  function SizingDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)(import_jsx_runtime47.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Example, {
          description: "width/height take pixels, percentages, or viewport units.",
          tsx: `<node style={{ width: "60%" }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(WidthControl2, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Example, {
          description: "aspectRatio derives the missing dimension from the given one.",
          tsx: `height: 50, aspectRatio: 1.6`,
          children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(AspectControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Example, {
          description: "minWidth/maxWidth clamp an otherwise flexible size.",
          tsx: `width: "100%", maxWidth: 160`,
          children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(MaxWidthControl, {})
        })
      ]
    });
  }
  function WidthControl2() {
    const [w, setW] = (0, import_react35.useState)(60);
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("node", {
          style: track3,
          children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("node", {
            style: {
              ...bar3,
              width: `${Math.round(w)}%`
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Slider, {
          value: w,
          min: 10,
          max: 100,
          onChange: setW,
          label: `width ${w.toFixed(0)}%`
        })
      ]
    });
  }
  function AspectControl() {
    const [ar, setAr] = (0, import_react35.useState)(1.6);
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("node", {
          style: {
            height: 50,
            aspectRatio: ar,
            borderRadius: 10,
            backgroundColor: Colors.red100
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Slider, {
          value: ar,
          min: 0.5,
          max: 2.5,
          onChange: setAr,
          label: `aspectRatio ${ar.toFixed(2)}`
        })
      ]
    });
  }
  function MaxWidthControl() {
    const [max, setMax] = (0, import_react35.useState)(160);
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("node", {
          style: track3,
          children: /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("node", {
            style: {
              ...bar3,
              width: "100%",
              maxWidth: max,
              backgroundColor: Colors.yellow100
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)(Slider, {
          value: max,
          min: 40,
          max: 240,
          onChange: setMax,
          label: `maxWidth ${max.toFixed(0)}`
        })
      ]
    });
  }
  var track3 = {
    flexDirection: "column",
    width: 240,
    padding: 12,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var bar3 = {
    height: 26,
    borderRadius: 6,
    backgroundColor: Colors.primary100
  };

  // src/demos/styling/TransformDemo.tsx
  var import_jsx_runtime48 = __toESM(require_jsx_runtime(), 1);
  var import_react36 = __toESM(require_react(), 1);
  function TransformDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)(import_jsx_runtime48.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(Example, {
          description: "translate shifts a node after layout, without moving siblings.",
          tsx: `transform: { translateX: 16, translateY: 0 }`,
          children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(TranslateControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(Example, {
          description: "scale grows or shrinks a node around its center.",
          tsx: `transform: { scale: 0.7 }`,
          children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(ScaleControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(Example, {
          description: "rotate spins a node around its center (degrees, or a unit string like '0.25turn').",
          tsx: `transform: { rotate: 45 }`,
          children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(RotateControl, {})
        })
      ]
    });
  }
  function TranslateControl() {
    const [x, setX] = (0, import_react36.useState)(16);
    const [y, setY] = (0, import_react36.useState)(0);
    return /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("node", {
          style: stage6,
          children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("node", {
            style: {
              ...box2,
              transform: {
                translateX: x,
                translateY: y
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(Slider, {
          value: x,
          min: -60,
          max: 60,
          onChange: setX,
          label: `translateX ${x.toFixed(0)}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(Slider, {
          value: y,
          min: -40,
          max: 40,
          onChange: setY,
          label: `translateY ${y.toFixed(0)}`
        })
      ]
    });
  }
  function ScaleControl() {
    const [s, setS] = (0, import_react36.useState)(1);
    return /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("node", {
          style: stage6,
          children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("node", {
            style: {
              ...box2,
              backgroundColor: Colors.green100,
              transform: {
                scale: s
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(Slider, {
          value: s,
          min: 0.3,
          max: 1.8,
          onChange: setS,
          label: `scale ${s.toFixed(2)}`
        })
      ]
    });
  }
  function RotateControl() {
    const [r, setR] = (0, import_react36.useState)(45);
    return /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("node", {
          style: stage6,
          children: /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("node", {
            style: {
              ...box2,
              backgroundColor: Colors.purple100,
              transform: {
                rotate: r
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime48.jsx)(Slider, {
          value: r,
          min: 0,
          max: 360,
          onChange: setR,
          label: `rotate ${r.toFixed(0)}\xB0`
        })
      ]
    });
  }
  var stage6 = {
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 140,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };

  // src/demos/styling/ShadowDemo.tsx
  var import_jsx_runtime49 = __toESM(require_jsx_runtime(), 1);
  var import_react37 = __toESM(require_react(), 1);
  function ShadowDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime49.jsxs)(import_jsx_runtime49.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(Example, {
          description: "boxShadow casts a soft drop shadow. Drag blur and spread.",
          tsx: `boxShadow: {
  color: "#FFFFFF33",
  blurRadius: 12,
  spreadRadius: 3,
}`,
          children: /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(BlurControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(Example, {
          description: "xOffset / yOffset push the shadow to imply a light direction.",
          tsx: `boxShadow: {
  xOffset: 8,
  yOffset: 8,
  blurRadius: 6,
}`,
          children: /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(OffsetControl, {})
        })
      ]
    });
  }
  function BlurControl() {
    const [blur, setBlur] = (0, import_react37.useState)(12);
    const [spread, setSpread] = (0, import_react37.useState)(3);
    return /* @__PURE__ */ (0, import_jsx_runtime49.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)("node", {
          style: stage7,
          children: /* @__PURE__ */ (0, import_jsx_runtime49.jsx)("node", {
            style: {
              ...box2,
              boxShadow: {
                color: Colors.shadow200,
                blurRadius: blur,
                spreadRadius: spread
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(Slider, {
          value: blur,
          min: 0,
          max: 40,
          onChange: setBlur,
          label: `blurRadius ${blur.toFixed(0)}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(Slider, {
          value: spread,
          min: 0,
          max: 16,
          onChange: setSpread,
          label: `spreadRadius ${spread.toFixed(0)}`
        })
      ]
    });
  }
  function OffsetControl() {
    const [x, setX] = (0, import_react37.useState)(8);
    const [y, setY] = (0, import_react37.useState)(8);
    return /* @__PURE__ */ (0, import_jsx_runtime49.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)("node", {
          style: stage7,
          children: /* @__PURE__ */ (0, import_jsx_runtime49.jsx)("node", {
            style: {
              ...box2,
              backgroundColor: Colors.red100,
              boxShadow: {
                color: Colors.shadow200,
                xOffset: x,
                yOffset: y,
                blurRadius: 6
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(Slider, {
          value: x,
          min: -24,
          max: 24,
          onChange: setX,
          label: `xOffset ${x.toFixed(0)}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime49.jsx)(Slider, {
          value: y,
          min: -24,
          max: 24,
          onChange: setY,
          label: `yOffset ${y.toFixed(0)}`
        })
      ]
    });
  }
  var stage7 = {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };

  // src/demos/styling/GradientsDemo.tsx
  var import_jsx_runtime50 = __toESM(require_jsx_runtime(), 1);
  function GradientsDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)(import_jsx_runtime50.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)(Example, {
          description: "backgroundGradient paints a linear/radial/conic gradient. Angles are in degrees (0 = up, clockwise).",
          tsx: `backgroundGradient: {
  type: "linear",
  angle: 90,
  stops: [
    { color: "#f7768e" },
    { color: "#7aa2f7" },
  ],
}`,
          children: /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)("node", {
            style: stage5,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("node", {
                style: {
                  ...box2,
                  backgroundGradient: {
                    type: "linear",
                    angle: 90,
                    stops: [
                      {
                        color: "#f7768e"
                      },
                      {
                        color: "#7aa2f7"
                      }
                    ]
                  }
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("node", {
                style: {
                  ...box2,
                  backgroundColor: void 0,
                  backgroundGradient: {
                    type: "radial",
                    stops: [
                      {
                        color: "#e0af68"
                      },
                      {
                        color: "#1a1b26"
                      }
                    ]
                  }
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("node", {
                style: {
                  ...box2,
                  backgroundGradient: {
                    type: "conic",
                    stops: [
                      {
                        color: "#f7768e"
                      },
                      {
                        color: "#9ece6a"
                      },
                      {
                        color: "#7aa2f7"
                      },
                      {
                        color: "#f7768e"
                      }
                    ]
                  }
                }
              })
            ]
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)(Example, {
          description: "borderGradient paints the border (needs a border width). Pairs with a solid or gradient fill.",
          tsx: `border: 6,
backgroundColor: "#1a1b26",
borderGradient: {
  type: "conic",
  stops: [
    { color: "#f7768e" },
    { color: "#7aa2f7" },
    { color: "#9ece6a" },
    { color: "#f7768e" },
  ],
}`,
          children: /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)("node", {
            style: stage5,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("node", {
                style: {
                  ...box2,
                  border: 6,
                  backgroundColor: "#1a1b26",
                  borderGradient: {
                    type: "conic",
                    stops: [
                      {
                        color: "#f7768e"
                      },
                      {
                        color: "#7aa2f7"
                      },
                      {
                        color: "#9ece6a"
                      },
                      {
                        color: "#f7768e"
                      }
                    ]
                  }
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("node", {
                style: {
                  ...box2,
                  border: 6,
                  backgroundColor: "#1a1b26",
                  borderGradient: {
                    type: "linear",
                    angle: 90,
                    stops: [
                      {
                        color: "#e0af68"
                      },
                      {
                        color: "#bb9af7"
                      }
                    ]
                  }
                }
              })
            ]
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)(Example, {
          description: "Pass an array to layer translucent gradients. Hover the swatch to swap the gradient (proves hoverStyle merging).",
          tsx: `backgroundGradient: [
  { type: "linear", angle: 45,
    stops: [{ color: "#f7768e80" }, { color: "#00000000" }] },
  { type: "linear", angle: 135,
    stops: [{ color: "#7aa2f780" }, { color: "#00000000" }] },
]`,
          children: /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("node", {
            style: stage5,
            children: /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("node", {
              style: {
                ...box2,
                backgroundColor: "#1a1b26",
                backgroundGradient: layered
              },
              hoverStyle: {
                backgroundGradient: hovered
              }
            })
          })
        })
      ]
    });
  }
  var layered = [
    {
      type: "linear",
      angle: 45,
      stops: [
        {
          color: "#f7768e80"
        },
        {
          color: "#00000000"
        }
      ]
    },
    {
      type: "linear",
      angle: 135,
      stops: [
        {
          color: "#7aa2f780"
        },
        {
          color: "#00000000"
        }
      ]
    }
  ];
  var hovered = {
    type: "conic",
    stops: [
      {
        color: "#9ece6a"
      },
      {
        color: "#7aa2f7"
      },
      {
        color: "#9ece6a"
      }
    ]
  };

  // src/demos/styling/OpacityDemo.tsx
  var import_jsx_runtime51 = __toESM(require_jsx_runtime(), 1);
  var import_react38 = __toESM(require_react(), 1);
  function OpacityDemo() {
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)(import_jsx_runtime51.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Example, {
          description: "opacity fades a node and its children together. Drag to fade.",
          tsx: `<node style={{ opacity: 0.4 }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(OpacityControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Example, {
          description: "zIndex controls paint order when nodes overlap.",
          tsx: `<node style={{ zIndex: 2 }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(ZIndexControl, {})
        }),
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Example, {
          description: "display: none removes a node from layout entirely.",
          tsx: `<node style={{ display: "none" }} />`,
          children: /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(DisplayControl, {})
        })
      ]
    });
  }
  function OpacityControl() {
    const [opacity, setOpacity] = (0, import_react38.useState)(0.4);
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("node", {
          style: {
            ...box2,
            opacity
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Slider, {
          value: opacity,
          min: 0,
          max: 1,
          onChange: setOpacity,
          label: `opacity ${opacity.toFixed(2)}`
        })
      ]
    });
  }
  var FRONT_OPTIONS = [
    {
      label: "blue front",
      value: "blue"
    },
    {
      label: "red front",
      value: "red"
    }
  ];
  function ZIndexControl() {
    const [front, setFront] = (0, import_react38.useState)("red");
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("node", {
          style: overlapStage,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("node", {
              style: {
                ...chip,
                left: 18,
                top: 14,
                backgroundColor: Colors.primary100,
                zIndex: front === "blue" ? 2 : 1
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("node", {
              style: {
                ...chip,
                left: 50,
                top: 30,
                backgroundColor: Colors.red100,
                zIndex: front === "red" ? 2 : 1
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Radio, {
          options: FRONT_OPTIONS,
          value: front,
          onChange: setFront
        })
      ]
    });
  }
  function DisplayControl() {
    const [hidden, setHidden] = (0, import_react38.useState)(false);
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("node", {
      style: controlColumn2,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("node", {
          style: row3,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("node", {
              style: box2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("node", {
              style: {
                ...box2,
                backgroundColor: Colors.green100,
                display: hidden ? "none" : "flex"
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("node", {
              style: {
                ...box2,
                backgroundColor: Colors.purple100
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(Checkbox, {
          label: "Hide middle box",
          enabled: hidden,
          onChange: setHidden
        })
      ]
    });
  }
  var overlapStage = {
    positionType: "relative",
    width: 150,
    height: 96,
    padding: 12,
    backgroundColor: Colors.surface100,
    borderRadius: 12
  };
  var chip = {
    positionType: "absolute",
    width: 60,
    height: 60,
    borderRadius: 10
  };

  // src/App.tsx
  var DEMOS = [
    {
      label: "Home",
      scene: "Surface",
      component: Home
    },
    {
      label: "Elements",
      expandedByDefault: true,
      children: [
        {
          label: "<node>",
          component: NodeDemo
        },
        {
          label: "<button>",
          component: ButtonDemo
        },
        {
          label: "<text>",
          component: TextDemo
        },
        {
          label: "<editableText>",
          component: EditableTextDemo
        },
        {
          label: "<image>",
          component: ImageDemo
        },
        {
          label: "<canvas>",
          component: CanvasDemo
        },
        {
          label: "<portal>",
          scene: "CrowdedCubes",
          component: PortalDemo
        },
        {
          label: "<surface>",
          scene: "Surface",
          component: SurfaceDemo
        },
        {
          label: "<Anchored.node>",
          scene: "CrowdedCubes",
          component: AnchoredDemo
        }
      ]
    },
    {
      label: "Layout",
      children: [
        {
          label: "Flex",
          component: FlexDemo
        },
        {
          label: "Grid",
          component: GridDemo
        },
        {
          label: "Scroll",
          component: ScrollDemo
        }
      ]
    },
    {
      label: "Styling",
      children: [
        {
          label: "Units",
          component: UnitsDemo
        },
        {
          label: "Colors",
          component: ColorsDemo
        },
        {
          label: "Borders",
          component: BordersDemo
        },
        {
          label: "Spacing",
          component: SpacingDemo
        },
        {
          label: "Sizing",
          component: SizingDemo
        },
        {
          label: "Transform",
          component: TransformDemo
        },
        {
          label: "Shadow",
          component: ShadowDemo
        },
        {
          label: "Gradients",
          component: GradientsDemo
        },
        {
          label: "Opacity",
          component: OpacityDemo
        }
      ]
    },
    {
      label: "Communication",
      children: [
        {
          label: "Bevy -> React",
          scene: "BouncingBall",
          component: BevyToReactDemo
        },
        {
          label: "Bevy <- React",
          scene: "Cubes",
          component: ReactToBevyDemo
        },
        {
          label: "Bevy <-> React",
          scene: "BouncingBall",
          component: BidirectionCommunicationDemo
        }
      ]
    },
    {
      label: "Animations",
      children: [
        {
          label: "Fade",
          component: FadeAnimationDemo
        },
        {
          label: "Easing",
          component: EasingDemo
        },
        {
          label: "Spring",
          component: SpringDemo
        },
        {
          label: "Sequence",
          component: SequenceDemo
        },
        {
          label: "Spin",
          component: SpinDemo
        },
        {
          label: "Interpolate",
          component: InterpolateDemo
        },
        {
          label: "Bouncing Squares",
          component: BouncingBallsAnimationDemo
        },
        {
          label: "Style Transition",
          component: TransitionDemo
        }
      ]
    },
    {
      label: "Interactions",
      component: InteractionsDemo
    }
  ];
  function findDemoByLabel(items, label3) {
    for (const item of items) {
      if (item.label === label3 && item.component) return item;
      const found = item.children && findDemoByLabel(item.children, label3);
      if (found) return found;
    }
    return void 0;
  }
  function App() {
    const [selectedDemo, setSelectedDemo] = (0, import_react39.useState)(DEMOS[0]);
    (0, import_react39.useEffect)(() => {
      bevy.selectScene(selectedDemo.scene ?? null);
    }, [
      selectedDemo
    ]);
    (0, import_react39.useEffect)(() => {
      return bevy.on("debug.selectDemo", ({ label: label3 }) => {
        const demo = findDemoByLabel(DEMOS, label3);
        if (demo) setSelectedDemo(demo);
      });
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)("node", {
      style: rootStyle,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)("node", {
          style: navStyle,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("image", {
              src: "bevy-react-logo.png",
              style: {
                width: 150
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("text", {
              style: titleStyle2,
              children: "bevy-react"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("node", {
              style: itemsStyle,
              children: DEMOS.map((demo, index) => /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(Item, {
                item: demo,
                selectedItem: selectedDemo,
                onSelected: setSelectedDemo
              }, index))
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("node", {
          style: contentStyle,
          children: selectedDemo.component && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(selectedDemo.component, {})
        })
      ]
    });
  }
  function Item({ item, selectedItem, isChild, onSelected }) {
    const [expanded, setExpanded] = (0, import_react39.useState)(item.expandedByDefault ?? false);
    function onPress() {
      if (item.children?.length) {
        setExpanded(!expanded);
      } else if (item.component) {
        onSelected(item);
      }
    }
    function onChildSelected(item2) {
      if (expanded) {
        onSelected(item2);
      }
    }
    return /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)("node", {
      style: {
        flexDirection: "column"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(ItemButton, {
          isActive: item.label === selectedItem.label,
          isExpanded: expanded,
          label: item.label,
          onPress,
          isChild: isChild ?? false,
          hasChildren: !!item.children?.length
        }),
        item.children?.length ? /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 8,
            margin: {
              left: 15
            },
            overflowY: "clip",
            maxHeight: expanded ? item.children.length * NAV_ITEM_PX : 0,
            transition: {
              size: {
                duration: 300,
                easing: "easeOut"
              }
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("node", {}),
            item.children.map((child, index) => /* @__PURE__ */ (0, import_jsx_runtime52.jsx)(Item, {
              item: child,
              isChild: true,
              onSelected: onChildSelected,
              selectedItem
            }, index))
          ]
        }) : null
      ]
    });
  }
  var NAV_ITEM_PX = 42;
  function ItemButton({ isActive, isExpanded, isChild, hasChildren, label: label3, onPress }) {
    return /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("button", {
      onClick: onPress,
      style: {
        ...navButtonStyle,
        padding: isChild ? 6 : 12,
        backgroundColor: isActive ? Colors.primary100 : Colors.surface300,
        backgroundGradient: isActive ? Gradients.primary : Gradients.surface
      },
      hoverStyle: {
        backgroundGradient: isActive ? Gradients.primary : Gradients.surfaceHover
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime52.jsxs)("node", {
        style: {
          justifyContent: "spaceBetween",
          alignItems: "center",
          width: "100%"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("text", {
            style: {
              color: isActive ? Colors.textColor400 : Colors.textColor100,
              fontSize: isChild ? FontSizes.sm : FontSizes.base,
              fontWeight: "bold"
            },
            children: label3
          }),
          hasChildren && /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("text", {
            style: {
              fontFamily: "Noto Sans Mono"
            },
            children: isExpanded ? "-" : "+"
          })
        ]
      })
    });
  }
  var rootStyle = {
    width: "100%",
    height: "100%",
    flexDirection: "row"
  };
  var navStyle = {
    flexDirection: "column",
    alignItems: "center",
    width: 220,
    height: "100%",
    gap: 8,
    padding: 20,
    backgroundColor: Colors.surface100,
    backgroundGradient: Gradients.navBackdrop,
    zIndex: 100,
    boxShadow: {
      blurRadius: 15,
      spreadRadius: 0,
      color: Colors.shadow100
    }
  };
  var itemsStyle = {
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
    height: "100%",
    gap: 8,
    overflowY: "scroll"
  };
  var titleStyle2 = {
    color: Colors.primary100,
    fontSize: FontSizes.xl,
    fontWeight: "bold",
    margin: {
      top: 0,
      right: 0,
      bottom: 12,
      left: 0
    }
  };
  var navButtonStyle = {
    flexDirection: "column",
    alignItems: "start",
    gap: 2,
    padding: 12,
    borderRadius: 8,
    width: "100%"
  };
  var contentStyle = {
    flexGrow: 1,
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    padding: 24,
    overflowY: "scroll"
  };

  // src/index.tsx
  (0, import_bevy_react10.mount)(/* @__PURE__ */ (0, import_jsx_runtime53.jsx)(App, {}));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidmVuZG9yLWdsb2JhbDpiZXZ5LXJlYWN0L2pzeC1ydW50aW1lIiwgInZlbmRvci1nbG9iYWw6YmV2eS1yZWFjdCIsICJ2ZW5kb3ItZ2xvYmFsOnJlYWN0IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9pbmRleC50c3giLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL0FwcC50c3giLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2JldnkudHMiLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL3RoZW1lLnRzIiwgIi4uL3NyYy9kZW1vcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9Ib21lLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9jb21wb25lbnRzL0NoZWNrYm94LnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9jb21wb25lbnRzL1Byb2dyZXNzQmFyLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9jb21wb25lbnRzL1NsaWRlci50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvY29tcG9uZW50cy9FeGFtcGxlLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9jb21wb25lbnRzL1RleHRNb25vLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9jb21wb25lbnRzL0J1dHRvbi50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvY29tcG9uZW50cy9SYWRpby50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvY29tcG9uZW50cy9UeXBld3JpdGVyLnRzeCIsICIuLi9zcmMvZGVtb3MvY29tbXVuaWNhdGlvbi9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9jb21tdW5pY2F0aW9uL1JlYWN0VG9CZXZ5RGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2NvbW11bmljYXRpb24vaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvY29tbXVuaWNhdGlvbi9CZXZ5VG9SZWFjdERlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9jb21tdW5pY2F0aW9uL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2NvbW11bmljYXRpb24vQmlkaXJlY3Rpb25Db21tdW5pY2F0aW9uRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL0FuY2hvcmVkRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL0ludGVyYWN0aW9uc0RlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9lbGVtZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9lbGVtZW50cy9DYW52YXNEZW1vLnRzeCIsICIuLi9zcmMvZGVtb3MvZWxlbWVudHMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvZWxlbWVudHMvUG9ydGFsRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL01vbml0b3JBcHAudHN4IiwgIi4uL3NyYy9kZW1vcy9lbGVtZW50cy9zdXJmYWNlRGVtby9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9lbGVtZW50cy9zdXJmYWNlRGVtby9EZXNrdG9wLnRzeCIsICIuLi9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vbWVudS50c3giLCAiLi4vc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL01lbnVCYXIudHN4IiwgIi4uL3NyYy9kZW1vcy9lbGVtZW50cy9zdXJmYWNlRGVtby9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9lbGVtZW50cy9zdXJmYWNlRGVtby9UYXNrYmFyLnRzeCIsICIuLi9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vSG9tZS50c3giLCAiLi4vc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL3NvdXJjZS50cyIsICIuLi9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vQ29kZVZpZXdlci50c3giLCAiLi4vc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL0Fib3V0RGlhbG9nLnRzeCIsICIuLi9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvZWxlbWVudHMvc3VyZmFjZURlbW8vQm9vdFNjcmVlbi50c3giLCAiLi4vc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vL2luZGV4LnRzeCIsICIuLi9zcmMvZGVtb3MvbGF5b3V0L2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2xheW91dC9TY3JvbGxEZW1vLnRzeCIsICIuLi9zcmMvZGVtb3MvZWxlbWVudHMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvZWxlbWVudHMvRWRpdGFibGVUZXh0RGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2VsZW1lbnRzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2VsZW1lbnRzL05vZGVEZW1vLnRzeCIsICIuLi9zcmMvZGVtb3MvbGF5b3V0L2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2xheW91dC9GbGV4RGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2xheW91dC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9sYXlvdXQvR3JpZERlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9lbGVtZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9lbGVtZW50cy9CdXR0b25EZW1vLnRzeCIsICIuLi9zcmMvZGVtb3MvZWxlbWVudHMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvZWxlbWVudHMvVGV4dERlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9lbGVtZW50cy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9lbGVtZW50cy9JbWFnZURlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9hbmltYXRpb25zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2FuaW1hdGlvbnMvRmFkZUFuaW1hdGlvbkRlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9hbmltYXRpb25zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2FuaW1hdGlvbnMvQm91bmNpbmdCYWxsc0FuaW1hdGlvbkRlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9hbmltYXRpb25zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2FuaW1hdGlvbnMvVHJhbnNpdGlvbkRlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9hbmltYXRpb25zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL2FuaW1hdGlvbnMvRWFzaW5nRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2FuaW1hdGlvbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvYW5pbWF0aW9ucy9zaGFyZWQudHMiLCAiLi4vc3JjL2RlbW9zL2FuaW1hdGlvbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvYW5pbWF0aW9ucy9TcHJpbmdEZW1vLnRzeCIsICIuLi9zcmMvZGVtb3MvYW5pbWF0aW9ucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9hbmltYXRpb25zL1NlcXVlbmNlRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2FuaW1hdGlvbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvYW5pbWF0aW9ucy9TcGluRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL2FuaW1hdGlvbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3MvYW5pbWF0aW9ucy9JbnRlcnBvbGF0ZURlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9zdHlsaW5nL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL3N0eWxpbmcvVW5pdHNEZW1vLnRzeCIsICIuLi9zcmMvZGVtb3Mvc3R5bGluZy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9zdHlsaW5nL3NoYXJlZC50cyIsICIuLi9zcmMvZGVtb3Mvc3R5bGluZy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9zdHlsaW5nL0NvbG9yc0RlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9zdHlsaW5nL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL3N0eWxpbmcvQm9yZGVyc0RlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9zdHlsaW5nL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL3N0eWxpbmcvU3BhY2luZ0RlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9zdHlsaW5nL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL3N0eWxpbmcvU2l6aW5nRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL3N0eWxpbmcvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3Mvc3R5bGluZy9UcmFuc2Zvcm1EZW1vLnRzeCIsICIuLi9zcmMvZGVtb3Mvc3R5bGluZy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2RlbW9zL3VpL3NyYy9kZW1vcy9zdHlsaW5nL1NoYWRvd0RlbW8udHN4IiwgIi4uL3NyYy9kZW1vcy9zdHlsaW5nL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvZGVtb3MvdWkvc3JjL2RlbW9zL3N0eWxpbmcvR3JhZGllbnRzRGVtby50c3giLCAiLi4vc3JjL2RlbW9zL3N0eWxpbmcvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9kZW1vcy91aS9zcmMvZGVtb3Mvc3R5bGluZy9PcGFjaXR5RGVtby50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5fX2JldnlWZW5kb3JbXCJiZXZ5LXJlYWN0L2pzeC1ydW50aW1lXCJdOyIsICJtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuX19iZXZ5VmVuZG9yW1wiYmV2eS1yZWFjdFwiXTsiLCAibW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLl9fYmV2eVZlbmRvcltcInJlYWN0XCJdOyIsICJpbXBvcnQgeyBtb3VudCB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBBcHAgfSBmcm9tIFwiLi9BcHBcIjtcblxuLy8gYG1vdW50YCBwYXJrcyBvbiBgb3BfbmV4dF9ldmVudGAgKGRyaXZlbiBieSB0aGUgUnVzdCBldmVudCBsb29wKSBhbmQgbmV2ZXJcbi8vIHJlc29sdmVzLCBzbyB3ZSBkb24ndCBhd2FpdCBpdCDigJQgdGhlIGFwcCBidW5kbGUgaXMgYW4gSUlGRSAobm8gdG9wLWxldmVsXG4vLyBhd2FpdCkuIE9uIGEgaG90IHJlbG9hZCB0aGlzIHdob2xlIGZpbGUgcmUtZXhlY3V0ZXM7IGBtb3VudGAgZGV0ZWN0cyB0aGVcbi8vIGV4aXN0aW5nIGlzb2xhdGUgYW5kIHRyaWdnZXJzIGEgRmFzdCBSZWZyZXNoIGluc3RlYWQgb2YgcmVtb3VudGluZy5cbm1vdW50KDxBcHAgLz4pO1xuIiwgImltcG9ydCB7IENvbXBvbmVudFR5cGUsIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCJAL2JldnlcIjtcbmltcG9ydCB0eXBlIHsgU2NlbmVJZCB9IGZyb20gXCJAL2JldnlcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzLCBHcmFkaWVudHMgfSBmcm9tIFwiQC90aGVtZVwiO1xuaW1wb3J0IHsgSG9tZSB9IGZyb20gXCIuL2RlbW9zL0hvbWVcIjtcbmltcG9ydCB7IFJlYWN0VG9CZXZ5RGVtbyB9IGZyb20gXCIuL2RlbW9zL2NvbW11bmljYXRpb24vUmVhY3RUb0JldnlEZW1vXCI7XG5pbXBvcnQgeyBCZXZ5VG9SZWFjdERlbW8gfSBmcm9tIFwiLi9kZW1vcy9jb21tdW5pY2F0aW9uL0JldnlUb1JlYWN0RGVtb1wiO1xuaW1wb3J0IHsgQmlkaXJlY3Rpb25Db21tdW5pY2F0aW9uRGVtbyB9IGZyb20gXCIuL2RlbW9zL2NvbW11bmljYXRpb24vQmlkaXJlY3Rpb25Db21tdW5pY2F0aW9uRGVtb1wiO1xuaW1wb3J0IHsgQW5jaG9yZWREZW1vIH0gZnJvbSBcIi4vZGVtb3MvQW5jaG9yZWREZW1vXCI7XG5pbXBvcnQgeyBJbnRlcmFjdGlvbnNEZW1vIH0gZnJvbSBcIi4vZGVtb3MvSW50ZXJhY3Rpb25zRGVtb1wiO1xuaW1wb3J0IHsgQ2FudmFzRGVtbyB9IGZyb20gXCIuL2RlbW9zL2VsZW1lbnRzL0NhbnZhc0RlbW9cIjtcbmltcG9ydCB7IFBvcnRhbERlbW8gfSBmcm9tIFwiLi9kZW1vcy9lbGVtZW50cy9Qb3J0YWxEZW1vXCI7XG5pbXBvcnQgeyBTdXJmYWNlRGVtbyB9IGZyb20gXCIuL2RlbW9zL2VsZW1lbnRzL3N1cmZhY2VEZW1vXCI7XG5pbXBvcnQgeyBTY3JvbGxEZW1vIH0gZnJvbSBcIi4vZGVtb3MvbGF5b3V0L1Njcm9sbERlbW9cIjtcbmltcG9ydCB7IEVkaXRhYmxlVGV4dERlbW8gfSBmcm9tIFwiLi9kZW1vcy9lbGVtZW50cy9FZGl0YWJsZVRleHREZW1vXCI7XG5pbXBvcnQgeyBOb2RlRGVtbyB9IGZyb20gXCIuL2RlbW9zL2VsZW1lbnRzL05vZGVEZW1vXCI7XG5pbXBvcnQgeyBGbGV4RGVtbyB9IGZyb20gXCIuL2RlbW9zL2xheW91dC9GbGV4RGVtb1wiO1xuaW1wb3J0IHsgR3JpZERlbW8gfSBmcm9tIFwiLi9kZW1vcy9sYXlvdXQvR3JpZERlbW9cIjtcbmltcG9ydCB7IEJ1dHRvbkRlbW8gfSBmcm9tIFwiLi9kZW1vcy9lbGVtZW50cy9CdXR0b25EZW1vXCI7XG5pbXBvcnQgeyBUZXh0RGVtbyB9IGZyb20gXCIuL2RlbW9zL2VsZW1lbnRzL1RleHREZW1vXCI7XG5pbXBvcnQgeyBJbWFnZURlbW8gfSBmcm9tIFwiLi9kZW1vcy9lbGVtZW50cy9JbWFnZURlbW9cIjtcbmltcG9ydCB7IEZhZGVBbmltYXRpb25EZW1vIH0gZnJvbSBcIi4vZGVtb3MvYW5pbWF0aW9ucy9GYWRlQW5pbWF0aW9uRGVtb1wiO1xuaW1wb3J0IHsgQm91bmNpbmdCYWxsc0FuaW1hdGlvbkRlbW8gfSBmcm9tIFwiLi9kZW1vcy9hbmltYXRpb25zL0JvdW5jaW5nQmFsbHNBbmltYXRpb25EZW1vXCI7XG5pbXBvcnQgeyBUcmFuc2l0aW9uRGVtbyB9IGZyb20gXCIuL2RlbW9zL2FuaW1hdGlvbnMvVHJhbnNpdGlvbkRlbW9cIjtcbmltcG9ydCB7IEVhc2luZ0RlbW8gfSBmcm9tIFwiLi9kZW1vcy9hbmltYXRpb25zL0Vhc2luZ0RlbW9cIjtcbmltcG9ydCB7IFNwcmluZ0RlbW8gfSBmcm9tIFwiLi9kZW1vcy9hbmltYXRpb25zL1NwcmluZ0RlbW9cIjtcbmltcG9ydCB7IFNlcXVlbmNlRGVtbyB9IGZyb20gXCIuL2RlbW9zL2FuaW1hdGlvbnMvU2VxdWVuY2VEZW1vXCI7XG5pbXBvcnQgeyBTcGluRGVtbyB9IGZyb20gXCIuL2RlbW9zL2FuaW1hdGlvbnMvU3BpbkRlbW9cIjtcbmltcG9ydCB7IEludGVycG9sYXRlRGVtbyB9IGZyb20gXCIuL2RlbW9zL2FuaW1hdGlvbnMvSW50ZXJwb2xhdGVEZW1vXCI7XG5pbXBvcnQgeyBVbml0c0RlbW8gfSBmcm9tIFwiLi9kZW1vcy9zdHlsaW5nL1VuaXRzRGVtb1wiO1xuaW1wb3J0IHsgQ29sb3JzRGVtbyB9IGZyb20gXCIuL2RlbW9zL3N0eWxpbmcvQ29sb3JzRGVtb1wiO1xuaW1wb3J0IHsgQm9yZGVyc0RlbW8gfSBmcm9tIFwiLi9kZW1vcy9zdHlsaW5nL0JvcmRlcnNEZW1vXCI7XG5pbXBvcnQgeyBTcGFjaW5nRGVtbyB9IGZyb20gXCIuL2RlbW9zL3N0eWxpbmcvU3BhY2luZ0RlbW9cIjtcbmltcG9ydCB7IFNpemluZ0RlbW8gfSBmcm9tIFwiLi9kZW1vcy9zdHlsaW5nL1NpemluZ0RlbW9cIjtcbmltcG9ydCB7IFRyYW5zZm9ybURlbW8gfSBmcm9tIFwiLi9kZW1vcy9zdHlsaW5nL1RyYW5zZm9ybURlbW9cIjtcbmltcG9ydCB7IFNoYWRvd0RlbW8gfSBmcm9tIFwiLi9kZW1vcy9zdHlsaW5nL1NoYWRvd0RlbW9cIjtcbmltcG9ydCB7IEdyYWRpZW50c0RlbW8gfSBmcm9tIFwiLi9kZW1vcy9zdHlsaW5nL0dyYWRpZW50c0RlbW9cIjtcbmltcG9ydCB7IE9wYWNpdHlEZW1vIH0gZnJvbSBcIi4vZGVtb3Mvc3R5bGluZy9PcGFjaXR5RGVtb1wiO1xuXG50eXBlIEJhc2VEZW1vSXRlbSA9IHsgbGFiZWw6IHN0cmluZzsgc2NlbmU/OiBTY2VuZUlkIH07XG50eXBlIERlbW9JdGVtID0gQmFzZURlbW9JdGVtICZcbiAgKFxuICAgIHwge1xuICAgICAgICBjb21wb25lbnQ6IENvbXBvbmVudFR5cGU7XG4gICAgICAgIGNoaWxkcmVuPzogdW5kZWZpbmVkO1xuICAgICAgICBleHBhbmRlZEJ5RGVmYXVsdD86IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB8IHtcbiAgICAgICAgY2hpbGRyZW46IERlbW9JdGVtW107XG4gICAgICAgIGNvbXBvbmVudD86IHVuZGVmaW5lZDtcbiAgICAgICAgZXhwYW5kZWRCeURlZmF1bHQ/OiBib29sZWFuO1xuICAgICAgfVxuICApO1xuXG5jb25zdCBERU1PUzogRGVtb0l0ZW1bXSA9IFtcbiAgeyBsYWJlbDogXCJIb21lXCIsIHNjZW5lOiBcIlN1cmZhY2VcIiwgY29tcG9uZW50OiBIb21lIH0sXG4gIHtcbiAgICBsYWJlbDogXCJFbGVtZW50c1wiLFxuICAgIGV4cGFuZGVkQnlEZWZhdWx0OiB0cnVlLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICB7IGxhYmVsOiBcIjxub2RlPlwiLCBjb21wb25lbnQ6IE5vZGVEZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIjxidXR0b24+XCIsIGNvbXBvbmVudDogQnV0dG9uRGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCI8dGV4dD5cIiwgY29tcG9uZW50OiBUZXh0RGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCI8ZWRpdGFibGVUZXh0PlwiLCBjb21wb25lbnQ6IEVkaXRhYmxlVGV4dERlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiPGltYWdlPlwiLCBjb21wb25lbnQ6IEltYWdlRGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCI8Y2FudmFzPlwiLCBjb21wb25lbnQ6IENhbnZhc0RlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiPHBvcnRhbD5cIiwgc2NlbmU6IFwiQ3Jvd2RlZEN1YmVzXCIsIGNvbXBvbmVudDogUG9ydGFsRGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCI8c3VyZmFjZT5cIiwgc2NlbmU6IFwiU3VyZmFjZVwiLCBjb21wb25lbnQ6IFN1cmZhY2VEZW1vIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIjxBbmNob3JlZC5ub2RlPlwiLFxuICAgICAgICBzY2VuZTogXCJDcm93ZGVkQ3ViZXNcIixcbiAgICAgICAgY29tcG9uZW50OiBBbmNob3JlZERlbW8sXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJMYXlvdXRcIixcbiAgICBjaGlsZHJlbjogW1xuICAgICAgeyBsYWJlbDogXCJGbGV4XCIsIGNvbXBvbmVudDogRmxleERlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiR3JpZFwiLCBjb21wb25lbnQ6IEdyaWREZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIlNjcm9sbFwiLCBjb21wb25lbnQ6IFNjcm9sbERlbW8gfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgbGFiZWw6IFwiU3R5bGluZ1wiLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICB7IGxhYmVsOiBcIlVuaXRzXCIsIGNvbXBvbmVudDogVW5pdHNEZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIkNvbG9yc1wiLCBjb21wb25lbnQ6IENvbG9yc0RlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiQm9yZGVyc1wiLCBjb21wb25lbnQ6IEJvcmRlcnNEZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIlNwYWNpbmdcIiwgY29tcG9uZW50OiBTcGFjaW5nRGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCJTaXppbmdcIiwgY29tcG9uZW50OiBTaXppbmdEZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIlRyYW5zZm9ybVwiLCBjb21wb25lbnQ6IFRyYW5zZm9ybURlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiU2hhZG93XCIsIGNvbXBvbmVudDogU2hhZG93RGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCJHcmFkaWVudHNcIiwgY29tcG9uZW50OiBHcmFkaWVudHNEZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIk9wYWNpdHlcIiwgY29tcG9uZW50OiBPcGFjaXR5RGVtbyB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJDb21tdW5pY2F0aW9uXCIsXG4gICAgY2hpbGRyZW46IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6IFwiQmV2eSAtPiBSZWFjdFwiLFxuICAgICAgICBzY2VuZTogXCJCb3VuY2luZ0JhbGxcIixcbiAgICAgICAgY29tcG9uZW50OiBCZXZ5VG9SZWFjdERlbW8sXG4gICAgICB9LFxuICAgICAgeyBsYWJlbDogXCJCZXZ5IDwtIFJlYWN0XCIsIHNjZW5lOiBcIkN1YmVzXCIsIGNvbXBvbmVudDogUmVhY3RUb0JldnlEZW1vIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiBcIkJldnkgPC0+IFJlYWN0XCIsXG4gICAgICAgIHNjZW5lOiBcIkJvdW5jaW5nQmFsbFwiLFxuICAgICAgICBjb21wb25lbnQ6IEJpZGlyZWN0aW9uQ29tbXVuaWNhdGlvbkRlbW8sXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogXCJBbmltYXRpb25zXCIsXG4gICAgY2hpbGRyZW46IFtcbiAgICAgIHsgbGFiZWw6IFwiRmFkZVwiLCBjb21wb25lbnQ6IEZhZGVBbmltYXRpb25EZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIkVhc2luZ1wiLCBjb21wb25lbnQ6IEVhc2luZ0RlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiU3ByaW5nXCIsIGNvbXBvbmVudDogU3ByaW5nRGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCJTZXF1ZW5jZVwiLCBjb21wb25lbnQ6IFNlcXVlbmNlRGVtbyB9LFxuICAgICAgeyBsYWJlbDogXCJTcGluXCIsIGNvbXBvbmVudDogU3BpbkRlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiSW50ZXJwb2xhdGVcIiwgY29tcG9uZW50OiBJbnRlcnBvbGF0ZURlbW8gfSxcbiAgICAgIHsgbGFiZWw6IFwiQm91bmNpbmcgU3F1YXJlc1wiLCBjb21wb25lbnQ6IEJvdW5jaW5nQmFsbHNBbmltYXRpb25EZW1vIH0sXG4gICAgICB7IGxhYmVsOiBcIlN0eWxlIFRyYW5zaXRpb25cIiwgY29tcG9uZW50OiBUcmFuc2l0aW9uRGVtbyB9LFxuICAgIF0sXG4gIH0sXG4gIHsgbGFiZWw6IFwiSW50ZXJhY3Rpb25zXCIsIGNvbXBvbmVudDogSW50ZXJhY3Rpb25zRGVtbyB9LFxuXTtcblxuLyoqIEZpbmQgdGhlIGZpcnN0IHNlbGVjdGFibGUgZGVtbyAoYSBsZWFmIHdpdGggYSBgY29tcG9uZW50YCkgYnkgaXRzIG5hdiBsYWJlbC4gKi9cbmZ1bmN0aW9uIGZpbmREZW1vQnlMYWJlbChcbiAgaXRlbXM6IERlbW9JdGVtW10sXG4gIGxhYmVsOiBzdHJpbmcsXG4pOiBEZW1vSXRlbSB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgIGlmIChpdGVtLmxhYmVsID09PSBsYWJlbCAmJiBpdGVtLmNvbXBvbmVudCkgcmV0dXJuIGl0ZW07XG4gICAgY29uc3QgZm91bmQgPSBpdGVtLmNoaWxkcmVuICYmIGZpbmREZW1vQnlMYWJlbChpdGVtLmNoaWxkcmVuLCBsYWJlbCk7XG4gICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFwcCgpIHtcbiAgY29uc3QgW3NlbGVjdGVkRGVtbywgc2V0U2VsZWN0ZWREZW1vXSA9IHVzZVN0YXRlPERlbW9JdGVtPihERU1PU1swXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5LnNlbGVjdFNjZW5lKHNlbGVjdGVkRGVtby5zY2VuZSA/PyBudWxsKTtcbiAgfSwgW3NlbGVjdGVkRGVtb10pO1xuXG4gIC8vIERlYnVnL2F1dG9tYXRpb24gaG9vazogbGV0IHRoZSBCZXZ5IHNpZGUgKHRoZSBgLS1zaG9vdGAgc2NyZWVuc2hvdCB0b29sKSBkcml2ZVxuICAvLyBuYXZpZ2F0aW9uIGJ5IGRlbW8gbGFiZWwuIFNlbGVjdGluZyB0aGUgYWxyZWFkeS1zZWxlY3RlZCBkZW1vIGlzIGEgbm8tb3AuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuIGJldnkub24oXCJkZWJ1Zy5zZWxlY3REZW1vXCIsICh7IGxhYmVsIH0pID0+IHtcbiAgICAgIGNvbnN0IGRlbW8gPSBmaW5kRGVtb0J5TGFiZWwoREVNT1MsIGxhYmVsKTtcbiAgICAgIGlmIChkZW1vKSBzZXRTZWxlY3RlZERlbW8oZGVtbyk7XG4gICAgfSk7XG4gIH0sIFtdKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtyb290U3R5bGV9PlxuICAgICAgPG5vZGUgc3R5bGU9e25hdlN0eWxlfT5cbiAgICAgICAgPGltYWdlIHNyYz1cImJldnktcmVhY3QtbG9nby5wbmdcIiBzdHlsZT17eyB3aWR0aDogMTUwIH19IC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt0aXRsZVN0eWxlfT5iZXZ5LXJlYWN0PC90ZXh0PlxuICAgICAgICA8bm9kZSBzdHlsZT17aXRlbXNTdHlsZX0+XG4gICAgICAgICAge0RFTU9TLm1hcCgoZGVtbywgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxJdGVtXG4gICAgICAgICAgICAgIGtleT17aW5kZXh9XG4gICAgICAgICAgICAgIGl0ZW09e2RlbW99XG4gICAgICAgICAgICAgIHNlbGVjdGVkSXRlbT17c2VsZWN0ZWREZW1vfVxuICAgICAgICAgICAgICBvblNlbGVjdGVkPXtzZXRTZWxlY3RlZERlbW99XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG5cbiAgICAgIDxub2RlIHN0eWxlPXtjb250ZW50U3R5bGV9PlxuICAgICAgICB7c2VsZWN0ZWREZW1vLmNvbXBvbmVudCAmJiA8c2VsZWN0ZWREZW1vLmNvbXBvbmVudCAvPn1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbnR5cGUgSXRlbVByb3BzID0ge1xuICBpdGVtOiBEZW1vSXRlbTtcbiAgc2VsZWN0ZWRJdGVtOiBEZW1vSXRlbTtcbiAgaXNDaGlsZD86IGJvb2xlYW47XG4gIG9uU2VsZWN0ZWQ6IChpdGVtOiBEZW1vSXRlbSkgPT4gdm9pZDtcbn07XG5cbmZ1bmN0aW9uIEl0ZW0oeyBpdGVtLCBzZWxlY3RlZEl0ZW0sIGlzQ2hpbGQsIG9uU2VsZWN0ZWQgfTogSXRlbVByb3BzKSB7XG4gIGNvbnN0IFtleHBhbmRlZCwgc2V0RXhwYW5kZWRdID0gdXNlU3RhdGUoaXRlbS5leHBhbmRlZEJ5RGVmYXVsdCA/PyBmYWxzZSk7XG5cbiAgZnVuY3Rpb24gb25QcmVzcygpIHtcbiAgICBpZiAoaXRlbS5jaGlsZHJlbj8ubGVuZ3RoKSB7XG4gICAgICBzZXRFeHBhbmRlZCghZXhwYW5kZWQpO1xuICAgIH0gZWxzZSBpZiAoaXRlbS5jb21wb25lbnQpIHtcbiAgICAgIG9uU2VsZWN0ZWQoaXRlbSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25DaGlsZFNlbGVjdGVkKGl0ZW06IERlbW9JdGVtKSB7XG4gICAgaWYgKGV4cGFuZGVkKSB7XG4gICAgICBvblNlbGVjdGVkKGl0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiB9fT5cbiAgICAgIDxJdGVtQnV0dG9uXG4gICAgICAgIGlzQWN0aXZlPXtpdGVtLmxhYmVsID09PSBzZWxlY3RlZEl0ZW0ubGFiZWx9XG4gICAgICAgIGlzRXhwYW5kZWQ9e2V4cGFuZGVkfVxuICAgICAgICBsYWJlbD17aXRlbS5sYWJlbH1cbiAgICAgICAgb25QcmVzcz17b25QcmVzc31cbiAgICAgICAgaXNDaGlsZD17aXNDaGlsZCA/PyBmYWxzZX1cbiAgICAgICAgaGFzQ2hpbGRyZW49eyEhaXRlbS5jaGlsZHJlbj8ubGVuZ3RofVxuICAgICAgLz5cblxuICAgICAge2l0ZW0uY2hpbGRyZW4/Lmxlbmd0aCA/IChcbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiAxNSB9LFxuICAgICAgICAgICAgb3ZlcmZsb3dZOiBcImNsaXBcIixcbiAgICAgICAgICAgIG1heEhlaWdodDogZXhwYW5kZWQgPyBpdGVtLmNoaWxkcmVuLmxlbmd0aCAqIE5BVl9JVEVNX1BYIDogMCxcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHtcbiAgICAgICAgICAgICAgc2l6ZTogeyBkdXJhdGlvbjogMzAwLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZSAvPlxuICAgICAgICAgIHtpdGVtLmNoaWxkcmVuLm1hcCgoY2hpbGQsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8SXRlbVxuICAgICAgICAgICAgICBrZXk9e2luZGV4fVxuICAgICAgICAgICAgICBpdGVtPXtjaGlsZH1cbiAgICAgICAgICAgICAgaXNDaGlsZD17dHJ1ZX1cbiAgICAgICAgICAgICAgb25TZWxlY3RlZD17b25DaGlsZFNlbGVjdGVkfVxuICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW09e3NlbGVjdGVkSXRlbX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLy8gRXN0aW1hdGVkIGhlaWdodCBvZiBvbmUgKGxlYWYpIHN1Ym1lbnUgcm93IOKAlCBjaGlsZCBidXR0b24gcGx1cyB0aGUgY29sdW1uIGdhcC5cbi8vIEEgc2xpZ2h0IG92ZXJzaG9vdCBpcyBmaW5lIChoaWRkZW4gYnkgYG92ZXJmbG93WTogY2xpcGApOyB1bmRlcnNob290IHdvdWxkIGNsaXBcbi8vIHRoZSBsYXN0IHJvdywgc28gcm91bmQgdXAuXG5jb25zdCBOQVZfSVRFTV9QWCA9IDQyO1xuXG50eXBlIEl0ZW1CdXR0b25Qcm9wcyA9IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgaXNBY3RpdmU6IGJvb2xlYW47XG4gIGlzRXhwYW5kZWQ6IGJvb2xlYW47XG4gIGlzQ2hpbGQ6IGJvb2xlYW47XG4gIGhhc0NoaWxkcmVuOiBib29sZWFuO1xuICBvblByZXNzOiAoKSA9PiB2b2lkO1xufTtcbmZ1bmN0aW9uIEl0ZW1CdXR0b24oe1xuICBpc0FjdGl2ZSxcbiAgaXNFeHBhbmRlZCxcbiAgaXNDaGlsZCxcbiAgaGFzQ2hpbGRyZW4sXG4gIGxhYmVsLFxuICBvblByZXNzLFxufTogSXRlbUJ1dHRvblByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25QcmVzc31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLm5hdkJ1dHRvblN0eWxlLFxuICAgICAgICBwYWRkaW5nOiBpc0NoaWxkID8gNiA6IDEyLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGlzQWN0aXZlID8gQ29sb3JzLnByaW1hcnkxMDAgOiBDb2xvcnMuc3VyZmFjZTMwMCxcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBpc0FjdGl2ZSA/IEdyYWRpZW50cy5wcmltYXJ5IDogR3JhZGllbnRzLnN1cmZhY2UsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17e1xuICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IGlzQWN0aXZlXG4gICAgICAgICAgPyBHcmFkaWVudHMucHJpbWFyeVxuICAgICAgICAgIDogR3JhZGllbnRzLnN1cmZhY2VIb3ZlcixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgY29sb3I6IGlzQWN0aXZlID8gQ29sb3JzLnRleHRDb2xvcjQwMCA6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gICAgICAgICAgICBmb250U2l6ZTogaXNDaGlsZCA/IEZvbnRTaXplcy5zbSA6IEZvbnRTaXplcy5iYXNlLFxuICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICB7aGFzQ2hpbGRyZW4gJiYgKFxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250RmFtaWx5OiBcIk5vdG8gU2FucyBNb25vXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtpc0V4cGFuZGVkID8gXCItXCIgOiBcIitcIn1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICl9XG4gICAgICA8L25vZGU+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbmNvbnN0IHJvb3RTdHlsZTogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogXCIxMDAlXCIsXG4gIGhlaWdodDogXCIxMDAlXCIsXG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG59O1xuXG5jb25zdCBuYXZTdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICB3aWR0aDogMjIwLFxuICBoZWlnaHQ6IFwiMTAwJVwiLFxuICBnYXA6IDgsXG4gIHBhZGRpbmc6IDIwLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBiYWNrZ3JvdW5kR3JhZGllbnQ6IEdyYWRpZW50cy5uYXZCYWNrZHJvcCxcbiAgekluZGV4OiAxMDAsXG4gIGJveFNoYWRvdzogeyBibHVyUmFkaXVzOiAxNSwgc3ByZWFkUmFkaXVzOiAwLCBjb2xvcjogQ29sb3JzLnNoYWRvdzEwMCB9LFxufTtcblxuY29uc3QgaXRlbXNTdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBhbGlnbkl0ZW1zOiBcInN0cmV0Y2hcIixcbiAgd2lkdGg6IFwiMTAwJVwiLFxuICBoZWlnaHQ6IFwiMTAwJVwiLFxuICBnYXA6IDgsXG4gIG92ZXJmbG93WTogXCJzY3JvbGxcIixcbn07XG5cbmNvbnN0IHRpdGxlU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnhsLFxuICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgbWFyZ2luOiB7IHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMTIsIGxlZnQ6IDAgfSxcbn07XG5cbmNvbnN0IG5hdkJ1dHRvblN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIGFsaWduSXRlbXM6IFwic3RhcnRcIixcbiAgZ2FwOiAyLFxuICBwYWRkaW5nOiAxMixcbiAgYm9yZGVyUmFkaXVzOiA4LFxuICB3aWR0aDogXCIxMDAlXCIsXG59O1xuXG5jb25zdCBjb250ZW50U3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgZmxleEdyb3c6IDEsXG4gIGhlaWdodDogXCIxMDAlXCIsXG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGdhcDogMjAsXG4gIHBhZGRpbmc6IDI0LFxuICBvdmVyZmxvd1k6IFwic2Nyb2xsXCIsXG59O1xuIiwgIi8vIEBnZW5lcmF0ZWQgYnkgYmV2eS1yZWFjdCDigJQgZG8gbm90IGVkaXQgYnkgaGFuZC5cbi8vIE1pcnJvcnMgdGhlIFJ1c3QgYCNbcmVhY3RfbWVzc2FnZV1gIC8gYCNbcmVhY3RfcmVxdWVzdF1gIC8gYCNbcmVhY3RfZXZlbnRdYFxuLy8gdHlwZXMuIFJlZ2VuZXJhdGUgdmlhIHlvdXIgYXBwJ3MgYEFwcDo6ZXhwb3J0X3JlYWN0X3R5cGVzY3JpcHRgIGV4cG9ydGVyLlxuXG5pbXBvcnQge1xuICBlbWl0IGFzIHJhd0VtaXQsXG4gIHJlcXVlc3QgYXMgcmF3UmVxdWVzdCxcbiAgYWRkRXZlbnRMaXN0ZW5lciBhcyByYXdBZGRFdmVudExpc3RlbmVyLFxuICByZW1vdmVFdmVudExpc3RlbmVyIGFzIHJhd1JlbW92ZUV2ZW50TGlzdGVuZXIsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5cbmV4cG9ydCB0eXBlIEJhbGxCb3VuY2VkID0geyBcbi8qKlxuICogV2hpY2ggd2FsbCBpdCBoaXQuXG4gKi9cbndhbGw6IFdhbGwsIFxuLyoqXG4gKiBJbXBhY3Qgc3BlZWQgKHdvcmxkIHVuaXRzL3NlYyksIGZvciBmbGF2b3IgaW4gdGhlIHRvYXN0LlxuICovXG5zcGVlZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQmFsbFN0YXRlID0geyB4OiBudW1iZXIsIHk6IG51bWJlciwgdng6IG51bWJlciwgdnk6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEN1YmVJbmZvID0geyBlbnRpdHk6IGJpZ2ludCwgbGFiZWw6IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIEN1YmVzU3Bhd25lZCA9IHsgY3ViZXM6IEFycmF5PEN1YmVJbmZvPiwgfTtcbmV4cG9ydCB0eXBlIEZvbGxvd1JhbmRvbSA9IG51bGw7XG5leHBvcnQgdHlwZSBTY2VuZUlkID0gXCJDdWJlc1wiIHwgXCJCb3VuY2luZ0JhbGxcIiB8IFwiQ3Jvd2RlZEN1YmVzXCIgfCBcIlN1cmZhY2VcIjtcbmV4cG9ydCB0eXBlIFNlbGVjdERlbW8gPSB7IGxhYmVsOiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBTZWxlY3RTY2VuZSA9IFNjZW5lSWQgfCBudWxsO1xuZXhwb3J0IHR5cGUgU2V0Q291bnQgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBTZXRDcnQgPSBib29sZWFuO1xuZXhwb3J0IHR5cGUgU2V0Rm9sbG93TW9kZSA9IGJvb2xlYW47XG5leHBvcnQgdHlwZSBXYWxsID0gXCJMZWZ0XCIgfCBcIlJpZ2h0XCIgfCBcIlRvcFwiIHwgXCJCb3R0b21cIiB8IFwiRnJvbnRcIiB8IFwiQmFja1wiO1xuXG4vKiogRXZlcnkgYGVtaXRgIG5hbWUgYW5kIHRoZSBwYXlsb2FkIHR5cGUgaXQgY2Fycmllcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RNZXNzYWdlcyB7XG4gIFwiYmFzaWNEZW1vLnNldENvdW50XCI6IFNldENvdW50O1xuICBcImNyb3dkZWRDdWJlcy5mb2xsb3dSYW5kb21cIjogRm9sbG93UmFuZG9tO1xuICBcImNyb3dkZWRDdWJlcy5zZXRGb2xsb3dNb2RlXCI6IFNldEZvbGxvd01vZGU7XG4gIHNlbGVjdFNjZW5lOiBTZWxlY3RTY2VuZTtcbiAgXCJzdXJmYWNlRGVtby5zZXRDcnRcIjogU2V0Q3J0O1xufVxuXG4vKiogRXZlcnkgYHJlcXVlc3RgIG5hbWUgYW5kIGl0cyByZXF1ZXN0L3Jlc3BvbnNlIHR5cGVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFjdFJlcXVlc3RzIHtcbiAgXCJwb2xsaW5nRGVtby5nZXRCYWxsXCI6IHsgcmVxdWVzdDogbnVsbDsgcmVzcG9uc2U6IEJhbGxTdGF0ZSB9O1xufVxuXG4vKiogRXZlcnkgQmV2eSDihpIgUmVhY3QgZXZlbnQgbmFtZSBhbmQgdGhlIHBheWxvYWQgaXQgY2Fycmllcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RFdmVudHMge1xuICBcImJldnlFdmVudHNEZW1vLmJhbGxCb3VuY2VkXCI6IEJhbGxCb3VuY2VkO1xuICBcImNyb3dkZWRDdWJlcy5zcGF3bmVkXCI6IEN1YmVzU3Bhd25lZDtcbiAgXCJkZWJ1Zy5zZWxlY3REZW1vXCI6IFNlbGVjdERlbW87XG59XG5cbi8qKiBTZW5kIGEgdHlwZWQgYXBwIG1lc3NhZ2UgdG8gdGhlIEJldnkgc2lkZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbWl0PEsgZXh0ZW5kcyBrZXlvZiBSZWFjdE1lc3NhZ2VzPihuYW1lOiBLLCB2YWx1ZTogUmVhY3RNZXNzYWdlc1tLXSk6IHZvaWQge1xuICByYXdFbWl0KG5hbWUsIHZhbHVlKTtcbn1cblxuLyoqIFNlbmQgYSB0eXBlZCByZXF1ZXN0IGFuZCBhd2FpdCBpdHMgdHlwZWQgcmVzcG9uc2UuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdDxLIGV4dGVuZHMga2V5b2YgUmVhY3RSZXF1ZXN0cz4oXG4gIG5hbWU6IEssXG4gIHZhbHVlOiBSZWFjdFJlcXVlc3RzW0tdW1wicmVxdWVzdFwiXSxcbik6IFByb21pc2U8UmVhY3RSZXF1ZXN0c1tLXVtcInJlc3BvbnNlXCJdPiB7XG4gIHJldHVybiByYXdSZXF1ZXN0KG5hbWUsIHZhbHVlKSBhcyBQcm9taXNlPFJlYWN0UmVxdWVzdHNbS11bXCJyZXNwb25zZVwiXT47XG59XG5cbi8qKiBTdWJzY3JpYmUgdG8gYSB0eXBlZCBCZXZ5IOKGkiBSZWFjdCBldmVudC4gUmV0dXJucyBhbiB1bnN1YnNjcmliZSBmbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbjxLIGV4dGVuZHMga2V5b2YgUmVhY3RFdmVudHM+KFxuICBuYW1lOiBLLFxuICBjYjogKHZhbHVlOiBSZWFjdEV2ZW50c1tLXSkgPT4gdm9pZCxcbik6ICgpID0+IHZvaWQge1xuICByYXdBZGRFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG4gIHJldHVybiAoKSA9PiByYXdSZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG59XG5cbi8qKiBVbnN1YnNjcmliZSBhIGxpc3RlbmVyIHByZXZpb3VzbHkgcGFzc2VkIHRvIGBvbmAvYGFkZEV2ZW50TGlzdGVuZXJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXI8SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgY2I6ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xufVxuXG4vKiogU3RydWN0dXJlZCwgZnVsbHkgdHlwZWQgcHJveHkgb3ZlciBldmVyeSBtZXNzYWdlLCByZXF1ZXN0LCBhbmQgZXZlbnQuICovXG5leHBvcnQgY29uc3QgYmV2eSA9IHtcbiAgZW1pdCxcbiAgcmVxdWVzdCxcbiAgb24sXG4gIGFkZEV2ZW50TGlzdGVuZXI6IG9uLFxuICByZW1vdmVFdmVudExpc3RlbmVyLFxuICBiYXNpY0RlbW86IHtcbiAgICBzZXRDb3VudCh2YWx1ZTogU2V0Q291bnQpOiB2b2lkIHsgZW1pdChcImJhc2ljRGVtby5zZXRDb3VudFwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIGNyb3dkZWRDdWJlczoge1xuICAgIGZvbGxvd1JhbmRvbSh2YWx1ZTogRm9sbG93UmFuZG9tKTogdm9pZCB7IGVtaXQoXCJjcm93ZGVkQ3ViZXMuZm9sbG93UmFuZG9tXCIsIHZhbHVlKTsgfSxcbiAgICBzZXRGb2xsb3dNb2RlKHZhbHVlOiBTZXRGb2xsb3dNb2RlKTogdm9pZCB7IGVtaXQoXCJjcm93ZGVkQ3ViZXMuc2V0Rm9sbG93TW9kZVwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIHBvbGxpbmdEZW1vOiB7XG4gICAgZ2V0QmFsbCgpOiBQcm9taXNlPEJhbGxTdGF0ZT4geyByZXR1cm4gcmVxdWVzdChcInBvbGxpbmdEZW1vLmdldEJhbGxcIiwgbnVsbCk7IH0sXG4gIH0sXG4gIHNlbGVjdFNjZW5lKHZhbHVlOiBTZWxlY3RTY2VuZSk6IHZvaWQgeyBlbWl0KFwic2VsZWN0U2NlbmVcIiwgdmFsdWUpOyB9LFxuICBzdXJmYWNlRGVtbzoge1xuICAgIHNldENydCh2YWx1ZTogU2V0Q3J0KTogdm9pZCB7IGVtaXQoXCJzdXJmYWNlRGVtby5zZXRDcnRcIiwgdmFsdWUpOyB9LFxuICB9LFxufSBhcyBjb25zdDtcbiIsICJleHBvcnQgY29uc3QgQ29sb3JzID0ge1xuICBwcmltYXJ5MTAwOiBcIiM3YWEyZjdcIixcbiAgcHJpbWFyeTIwMDogXCIjODliNGZhXCIsXG4gIHByaW1hcnkzMDA6IFwiIzVhN2ZkNlwiLFxuICBwcmltYXJ5T3ZlcmxheTogXCIjN2FhMmY3MzNcIixcblxuICB0ZXh0Q29sb3IxMDA6IFwiI2NkZDZmNFwiLFxuICB0ZXh0Q29sb3IyMDA6IFwiI2E2YWRjOFwiLFxuICB0ZXh0Q29sb3IzMDA6IFwiIzZjNzA4NlwiLFxuICB0ZXh0Q29sb3I0MDA6IFwiIzFlMWUyZVwiLFxuXG4gIHN1cmZhY2UxMDA6IFwiIzExMTExYlwiLFxuICBzdXJmYWNlMjAwOiBcIiMxZTFlMmVcIixcbiAgc3VyZmFjZTMwMDogXCIjMmEyYTNjXCIsXG4gIHN1cmZhY2U0MDA6IFwiIzMxMzI0NFwiLFxuICBzdXJmYWNlNTAwOiBcIiM0MjQyNWVcIixcbiAgc3VyZmFjZTYwMDogXCIjNTA1MDcyXCIsXG5cbiAgZ3JlZW4xMDA6IFwiIzllY2U2YVwiLFxuICByZWQxMDA6IFwiI2Y3NzY4ZVwiLFxuICByZWQyMDA6IFwiI2ZmOGZhM1wiLFxuICByZWQzMDA6IFwiI2Q2NWE3MlwiLFxuICB5ZWxsb3cxMDA6IFwiI2UwYWY2OFwiLFxuICBwdXJwbGUxMDA6IFwiI2JiOWFmN1wiLFxuICBza3kxMDA6IFwiIzdkY2ZmZlwiLFxuICBhbWJlcjEwMDogXCIjZjllMmFmXCIsXG4gIG9yYW5nZTEwMDogXCIjZmY5ZTY0XCIsXG4gIHRlYWwxMDA6IFwiIzczZGFjYVwiLFxuXG4gIHNoYWRvdzEwMDogXCIjMDAwMDAwODhcIixcbiAgc2hhZG93MjAwOiBcIiNmZmZmZmYzM1wiLFxuICB0cmFuc3BhcmVudDogXCIjMDAwMDAwMDBcIixcbn0gYXMgY29uc3Q7XG5cbi8vIC0tLSBHcmFkaWVudCBwcmVzZXRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWx0IGZyb20gdGhlIHBhbGV0dGUgYWJvdmUgc28gdGhlIHdob2xlIGFwcCBzaGFyZXMgb25lIHR1bmFibGUgc2V0LiBFYWNoIGlzXG4vLyBhIGBiYWNrZ3JvdW5kR3JhZGllbnRgL2Bib3JkZXJHcmFkaWVudGAgdmFsdWU7IHR3ZWFrIGhlcmUgdG8gcmV0dW5lIGFwcC13aWRlLlxuaW1wb3J0IHR5cGUgeyBHcmFkaWVudCB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuXG5jb25zdCBsaW5lYXIgPSAoYW5nbGU6IG51bWJlciwgLi4uY29sb3JzOiBzdHJpbmdbXSk6IEdyYWRpZW50ID0+ICh7XG4gIHR5cGU6IFwibGluZWFyXCIsXG4gIGFuZ2xlLFxuICBzdG9wczogY29sb3JzLm1hcCgoY29sb3IpID0+ICh7IGNvbG9yIH0pKSxcbn0pO1xuXG5leHBvcnQgY29uc3QgR3JhZGllbnRzID0ge1xuICAvLyBhY2NlbnQg4oCUIGFjdGl2ZSBuYXYgaXRlbSwgcmFkaW8gXCJzZWxlY3RlZFwiLCBwcm9ncmVzcyBmaWxsLCBwcmltYXJ5IGJ1dHRvbnNcbiAgcHJpbWFyeTogbGluZWFyKDEzNSwgQ29sb3JzLnByaW1hcnkzMDAsIENvbG9ycy5wcmltYXJ5MTAwLCBDb2xvcnMucHJpbWFyeTIwMCksXG4gIHByaW1hcnlIb3ZlcjogbGluZWFyKFxuICAgIDEzNSxcbiAgICBDb2xvcnMucHJpbWFyeTEwMCxcbiAgICBDb2xvcnMucHJpbWFyeTIwMCxcbiAgICBDb2xvcnMuc2t5MTAwLFxuICApLFxuICAvLyBuZXV0cmFsIHN1cmZhY2UgbGlmdHMg4oCUIHVuc2VsZWN0ZWQgcGlsbHMsIGdlbmVyaWMgYnV0dG9ucywgY29kZSB0b2dnbGVcbiAgc3VyZmFjZTogbGluZWFyKDE4MCwgQ29sb3JzLnN1cmZhY2U1MDAsIENvbG9ycy5zdXJmYWNlMzAwKSxcbiAgc3VyZmFjZUhvdmVyOiBsaW5lYXIoMTgwLCBDb2xvcnMuc3VyZmFjZTUwMCwgQ29sb3JzLnN1cmZhY2U2MDApLFxuICAvLyBjYXJkIC8gcGFuZWwgZGVwdGhcbiAgY2FyZDogbGluZWFyKDE2MCwgQ29sb3JzLnN1cmZhY2UyMDAsIENvbG9ycy5zdXJmYWNlMTAwKSxcbiAgdHJhY2s6IGxpbmVhcigxODAsIENvbG9ycy5zdXJmYWNlMzAwLCBDb2xvcnMuc3VyZmFjZTQwMCksXG4gIC8vIHNob3d5IG11bHRpLWh1ZSBib3JkZXIgZm9yIGNhcmRzIChib3JkZXJHcmFkaWVudClcbiAgYWNjZW50Qm9yZGVyOiBsaW5lYXIoMTM1LCBDb2xvcnMucHJpbWFyeTMwMCwgQ29sb3JzLnNreTEwMCwgQ29sb3JzLnB1cnBsZTEwMCksXG4gIC8vIGltbWVyc2l2ZSBuYXYgYmFja2Ryb3A6IGRhcmsgdmVydGljYWwgYmFzZSArIGZhaW50IHByaW1hcnkgZ2xvdyBhdCB0b3BcbiAgbmF2QmFja2Ryb3A6IFtcbiAgICBsaW5lYXIoMTgwLCBDb2xvcnMuc3VyZmFjZTEwMCwgQ29sb3JzLnN1cmZhY2UyMDApLFxuICAgIHtcbiAgICAgIHR5cGU6IFwicmFkaWFsXCIsXG4gICAgICBwb3NpdGlvbjogXCJ0b3BcIixcbiAgICAgIHN0b3BzOiBbXG4gICAgICAgIHsgY29sb3I6IENvbG9ycy5wcmltYXJ5T3ZlcmxheSB9LFxuICAgICAgICB7IGNvbG9yOiBDb2xvcnMudHJhbnNwYXJlbnQsIHBvc2l0aW9uOiAzMDAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXSBzYXRpc2ZpZXMgR3JhZGllbnRbXSxcbiAgLy8gdml2aWQgc2V0IGN5Y2xlZCBhY3Jvc3MgbGF5b3V0IHN3YXRjaGVzL2NlbGxzIChkZWNvcmF0aXZlKVxuICBzcGVjdHJ1bTogW1xuICAgIGxpbmVhcigxMzUsIENvbG9ycy5yZWQxMDAsIENvbG9ycy5vcmFuZ2UxMDApLFxuICAgIGxpbmVhcigxMzUsIENvbG9ycy5za3kxMDAsIENvbG9ycy50ZWFsMTAwKSxcbiAgICBsaW5lYXIoMTM1LCBDb2xvcnMucHVycGxlMTAwLCBDb2xvcnMucHJpbWFyeTEwMCksXG4gICAgbGluZWFyKDEzNSwgQ29sb3JzLmdyZWVuMTAwLCBDb2xvcnMuYW1iZXIxMDApLFxuICBdIHNhdGlzZmllcyBHcmFkaWVudFtdLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IEZvbnRTaXplcyA9IHtcbiAgeHhzOiAxMSxcbiAgeHM6IDEyLFxuICBzbTogMTQsXG4gIGJhc2U6IDE2LFxuICBsZzogMTgsXG4gIHhsOiAyMixcbiAgeHhsOiAyOCxcbiAgeHh4bDogNTAsXG59IGFzIGNvbnN0O1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCJAL2JldnlcIjtcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzLCBHcmFkaWVudHMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG50eXBlIE1vZGUgPSBcIm1vbml0b3JcIiB8IFwiZmxhdFwiO1xuXG50eXBlIEZlYXR1cmUgPSB7IHRpdGxlOiBzdHJpbmc7IGJvZHk6IHN0cmluZyB9O1xuXG5jb25zdCBGRUFUVVJFUzogRmVhdHVyZVtdID0gW1xuICB7XG4gICAgdGl0bGU6IFwiTmF0aXZlIEJldnkgVUlcIixcbiAgICBib2R5OiBcIk5vIGJyb3dzZXIsIG5vIHdlYiB2aWV3LiBZb3VyIFVJIGlzIGJldnlfdWkgZW50aXRpZXMgaW4gdGhlIHNhbWUgd29ybGQgYXMgeW91ciBnYW1lLlwiLFxuICB9LFxuICB7XG4gICAgdGl0bGU6IFwiSG90IHJlbG9hZCB0aGF0IGtlZXBzIHN0YXRlXCIsXG4gICAgYm9keTogXCJFZGl0IGEgY29tcG9uZW50IGFuZCBpdCByZS1yZW5kZXJzIGxpdmUsIHdpdGggaG9vayBzdGF0ZSBhbmQgcnVubmluZyBhbmltYXRpb25zIGludGFjdC5cIixcbiAgfSxcbiAge1xuICAgIHRpdGxlOiBcIlR5cGVkIHR3by13YXkgbWVzc2FnaW5nXCIsXG4gICAgYm9keTogXCJSZWFjdCBhbmQgdGhlIEVDUyB0YWxrIG92ZXIgdHlwZWQgY2hhbm5lbHMgZ2VuZXJhdGVkIHN0cmFpZ2h0IGZyb20geW91ciBSdXN0IHR5cGVzLlwiLFxuICB9LFxuICB7XG4gICAgdGl0bGU6IFwiUmVhY3QsIG5vdCBhIERTTFwiLFxuICAgIGJvZHk6IFwiSG9va3MsIGNvbXBvbmVudHMsIGxpc3RzLCBjb25kaXRpb25hbCByZW5kZXJpbmcg4oCUIGV2ZXJ5dGhpbmcgeW91IGFscmVhZHkga25vdy5cIixcbiAgfSxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBIb21lKCkge1xuICBjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSB1c2VTdGF0ZTxNb2RlPihcIm1vbml0b3JcIik7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5LnNlbGVjdFNjZW5lKG1vZGUgPT09IFwibW9uaXRvclwiID8gXCJTdXJmYWNlXCIgOiBudWxsKTtcbiAgfSwgW21vZGVdKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250YWluZXJTdHlsZX0+XG4gICAgICB7bW9kZSA9PT0gXCJtb25pdG9yXCIgPyAoXG4gICAgICAgIDxzdXJmYWNlIG5hbWU9XCJtb25pdG9yXCIgc3R5bGU9e3NjcmVlblJvb3R9PlxuICAgICAgICAgIDxMYW5kaW5nIG1vZGU9e21vZGV9IG9uTW9kZT17c2V0TW9kZX0gLz5cbiAgICAgICAgPC9zdXJmYWNlPlxuICAgICAgKSA6IChcbiAgICAgICAgPExhbmRpbmcgbW9kZT17bW9kZX0gb25Nb2RlPXtzZXRNb2RlfSAvPlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG1vZGU6IE1vZGU7XG4gIG9uTW9kZTogKG1vZGU6IE1vZGUpID0+IHZvaWQ7XG59O1xuXG5mdW5jdGlvbiBMYW5kaW5nKHsgbW9kZSwgb25Nb2RlIH06IFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3BhZ2VTdHlsZX0+XG4gICAgICA8bm9kZSBzdHlsZT17aGVyb1N0eWxlfT5cbiAgICAgICAgPGltYWdlIHNyYz1cImJldnktcmVhY3QtbG9nby5wbmdcIiBzdHlsZT17eyB3aWR0aDogMTUwIH19IC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt0aXRsZVN0eWxlfT5iZXZ5LXJlYWN0PC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17dGFnbGluZVN0eWxlfT5cbiAgICAgICAgICBCdWlsZCBiZXZ5X3VpIGludGVyZmFjZXMgd2l0aCBSZWFjdCDigJQgbm8gd2ViIHZpZXcsIG5vIERPTS5cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8dGV4dCBzdHlsZT17aW50cm9TdHlsZX0+XG4gICAgICAgIFlvdSB3cml0ZSBjb21wb25lbnRzIGluIFJlYWN0L1RTWCBhbmQgdGhleSByZW5kZXIgdG8gbmF0aXZlIEJldnkgVUlcbiAgICAgICAgdGhyb3VnaCBhIFJlYWN0IE5hdGl2ZS1zdHlsZSBicmlkZ2UuIFN0YXRlIGFuZCBpbnRlcmFjdGlvbnMgZmxvdyBib3RoXG4gICAgICAgIHdheXMsIGFuZCBlZGl0cyBob3QtcmVsb2FkIGxpdmUgd2hpbGUga2VlcGluZyBjb21wb25lbnQgc3RhdGUuXG4gICAgICA8L3RleHQ+XG5cbiAgICAgIDxub2RlIHN0eWxlPXtjYXJkc1Jvd1N0eWxlfT5cbiAgICAgICAge0ZFQVRVUkVTLm1hcCgoZmVhdHVyZSkgPT4gKFxuICAgICAgICAgIDxub2RlIGtleT17ZmVhdHVyZS50aXRsZX0gc3R5bGU9e2NhcmRTdHlsZX0+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17Y2FyZFRpdGxlU3R5bGV9PntmZWF0dXJlLnRpdGxlfTwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXtjYXJkQm9keVN0eWxlfT57ZmVhdHVyZS5ib2R5fTwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8dGV4dCBzdHlsZT17YnJvd3NlU3R5bGV9PkJyb3dzZSB0aGUgZGVtb3MgaW4gdGhlIHNpZGUgcGFuZWw8L3RleHQ+XG5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgc3R5bGU9e3N1cmZhY2VTd2l0aH1cbiAgICAgICAgbGFiZWxTdHlsZT17c3VyZmFjZUxhYmVsU3dpdGh9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uTW9kZShtb2RlID09PSBcImZsYXRcIiA/IFwibW9uaXRvclwiIDogXCJmbGF0XCIpfVxuICAgICAgPlxuICAgICAgICB7bW9kZSA9PT0gXCJmbGF0XCIgPyBcIlN3aXRjaCB0byBDUlQgbW9uaXRvclwiIDogXCJTd2l0Y2ggdG8gZmxhdFwifVxuICAgICAgPC9CdXR0b24+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBjb250YWluZXJTdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBnYXA6IDE2LFxufTtcblxuY29uc3Qgc2NyZWVuUm9vdDogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogXCIxMDAlXCIsXG4gIGhlaWdodDogXCIxMDAlXCIsXG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBiYWNrZ3JvdW5kR3JhZGllbnQ6IEdyYWRpZW50cy5uYXZCYWNrZHJvcCxcbn07XG5cbmNvbnN0IHBhZ2VTdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBnYXA6IDIwLFxuICBwYWRkaW5nOiAzMixcbiAgbWF4V2lkdGg6IDcyMCxcbn07XG5cbmNvbnN0IGhlcm9TdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBnYXA6IDYsXG59O1xuXG5jb25zdCB0aXRsZVN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy54eGwsXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcblxuY29uc3QgdGFnbGluZVN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gIG1heFdpZHRoOiA1MjAsXG59O1xuXG5jb25zdCBpbnRyb1N0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMjAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnNtLFxuICBtYXhXaWR0aDogNjAwLFxuICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG59O1xuXG5jb25zdCBjYXJkc1Jvd1N0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gIGZsZXhXcmFwOiBcIndyYXBcIixcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIGdhcDogMTQsXG59O1xuXG5jb25zdCBjYXJkU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgZ2FwOiA2LFxuICB3aWR0aDogMzIwLFxuICBwYWRkaW5nOiAxNixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTIwMCxcbiAgYmFja2dyb3VuZEdyYWRpZW50OiBHcmFkaWVudHMuY2FyZCxcbiAgYm9yZGVyUmFkaXVzOiAxNCxcbiAgYm9yZGVyOiAyLFxuICBib3JkZXJDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGJvcmRlckdyYWRpZW50OiBHcmFkaWVudHMuYWNjZW50Qm9yZGVyLFxuICBib3hTaGFkb3c6IHsgYmx1clJhZGl1czogMTIsIHNwcmVhZFJhZGl1czogNCwgY29sb3I6IENvbG9ycy5zaGFkb3cxMDAgfSxcbn07XG5cbmNvbnN0IGNhcmRUaXRsZVN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5iYXNlLFxuICBmb250V2VpZ2h0OiBcImJvbGRcIixcbn07XG5cbmNvbnN0IGNhcmRCb2R5U3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IyMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMueHMsXG59O1xuXG5jb25zdCBicm93c2VTdHlsZTogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5iYXNlLFxuICBmb250V2VpZ2h0OiBcImJvbGRcIixcbn07XG5cbmNvbnN0IHN1cmZhY2VTd2l0aDogQmV2eVN0eWxlID0ge1xuICBwYWRkaW5nOiAyMCxcbn07XG5cbmNvbnN0IHN1cmZhY2VMYWJlbFN3aXRoOiBCZXZ5U3R5bGUgPSB7XG4gIGZvbnRTaXplOiBGb250U2l6ZXMueGwsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMsIEdyYWRpZW50cyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbmV4cG9ydCB0eXBlIENoZWNrYm94UHJvcHMgPSB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGVuYWJsZWQ/OiBib29sZWFuO1xuICBvbkNoYW5nZTogKGVuYWJsZWQ6IGJvb2xlYW4pID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQ2hlY2tib3goeyBsYWJlbCwgZW5hYmxlZCwgb25DaGFuZ2UgfTogQ2hlY2tib3hQcm9wcykge1xuICBmdW5jdGlvbiBfb25DaGFuZ2UoKSB7XG4gICAgb25DaGFuZ2UoIWVuYWJsZWQpO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uIHN0eWxlPXt3cmFwcGVyfSBob3ZlclN0eWxlPXt3cmFwcGVySG92ZXJlZH0gb25DbGljaz17X29uQ2hhbmdlfT5cbiAgICAgIDxub2RlIHN0eWxlPXtib3h9PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IEdyYWRpZW50cy5wcmltYXJ5LFxuICAgICAgICAgICAgd2lkdGg6IDIxLFxuICAgICAgICAgICAgaGVpZ2h0OiAyMSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogNSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyBzY2FsZTogZW5hYmxlZCA/IDEgOiAwIH0sXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogeyBkdXJhdGlvbjogMTUwIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8dGV4dCBzdHlsZT17Y2hlY2tib3hMYWJlbH0+e2xhYmVsfTwvdGV4dD5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuY29uc3Qgd3JhcHBlcjogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBnYXA6IDgsXG4gIHBhZGRpbmc6IHsgdG9wOiA4LCByaWdodDogMTIsIGJvdHRvbTogOCwgbGVmdDogMTIgfSxcbiAgYm9yZGVyUmFkaXVzOiA4LFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy50cmFuc3BhcmVudCxcbiAgdHJhbnNpdGlvbjoge1xuICAgIGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMTUwIH0sXG4gIH0sXG59O1xuXG5jb25zdCB3cmFwcGVySG92ZXJlZDogQmV2eVN0eWxlID0ge1xuICBiYWNrZ3JvdW5kR3JhZGllbnQ6IEdyYWRpZW50cy5zdXJmYWNlLFxufTtcblxuY29uc3QgYm94OiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiAzMCxcbiAgaGVpZ2h0OiAzMCxcbiAgYm9yZGVyUmFkaXVzOiA3LFxuICBib3JkZXJDb2xvcjogQ29sb3JzLnN1cmZhY2U2MDAsXG4gIGJvcmRlckdyYWRpZW50OiBHcmFkaWVudHMuYWNjZW50Qm9yZGVyLFxuICBib3JkZXI6IDIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxufTtcblxuY29uc3QgY2hlY2tib3hMYWJlbDogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbn07XG4iLCAiaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBDb2xvcnMsIEZvbnRTaXplcywgR3JhZGllbnRzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuZXhwb3J0IHR5cGUgUHJvZ3Jlc3NCYXJQcm9wcyA9IHtcbiAgLyoqIEZpbGwgZW5kLCAwLi4xLiAqL1xuICBwcm9ncmVzczogbnVtYmVyO1xuICAvKiogRmlsbCBzdGFydCwgMC4uMSAoZGVmYXVsdCAwKS4gVGhlIGZpbGxlZCBzZWdtZW50IHJ1bnMgZnJvbSBgZnJvbWAgdG9cbiAgICogIGBwcm9ncmVzc2AsIHNvIGEgbm9uLXplcm8gYGZyb21gIHNob3dzIGEgc3ViLXJhbmdlLiAqL1xuICBmcm9tPzogbnVtYmVyO1xuICAvKiogT3B0aW9uYWwgbGFiZWwgY2VudGVyZWQgb3ZlciB0aGUgYmFyLiAqL1xuICBsYWJlbD86IHN0cmluZztcbn07XG5cbmNvbnN0IGNsYW1wID0gKHY6IG51bWJlciwgbG86IG51bWJlciwgaGk6IG51bWJlcikgPT5cbiAgTWF0aC5taW4oTWF0aC5tYXgodiwgbG8pLCBoaSk7XG5cbi8qKiBBIGhvcml6b250YWwgYmFyIHdpdGggYSBjb2xvcmVkIGZpbGwgc2VnbWVudCBhbmQgYW4gb3B0aW9uYWwgY2VudGVyZWQgbGFiZWwuXG4gKiAgVGhlbWVkIGZyb20gdGhlIGdsb2JhbCB0b2tlbnM6IHN1cmZhY2UgdHJhY2ssIHByaW1hcnkgZmlsbCwgbGlnaHQgbGFiZWwuICovXG5leHBvcnQgZnVuY3Rpb24gUHJvZ3Jlc3NCYXIoe1xuICBwcm9ncmVzcyxcbiAgZnJvbSA9IDAsXG4gIGxhYmVsID0gXCJcIixcbn06IFByb2dyZXNzQmFyUHJvcHMpIHtcbiAgY29uc3Qgc3RhcnQgPSBjbGFtcChmcm9tLCAwLCAxKTtcbiAgY29uc3QgZmlsbCA9IGNsYW1wKHByb2dyZXNzIC0gc3RhcnQsIDAsIDEgLSBzdGFydCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3RyYWNrfT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uZmlsbFN0eWxlLFxuICAgICAgICAgIGxlZnQ6IGAke3N0YXJ0ICogMTAwfSVgLFxuICAgICAgICAgIHdpZHRoOiBgJHtmaWxsICogMTAwfSVgLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIHtsYWJlbCA/IChcbiAgICAgICAgPG5vZGUgc3R5bGU9e2xhYmVsV3JhcH0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e2xhYmVsVGV4dH0+e2xhYmVsfTwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCB0cmFjazogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwicmVsYXRpdmVcIixcbiAgd2lkdGg6IFwiMTAwJVwiLFxuICBoZWlnaHQ6IDIwLFxuICBib3JkZXJSYWRpdXM6IDYsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2U0MDAsXG4gIGJhY2tncm91bmRHcmFkaWVudDogR3JhZGllbnRzLnRyYWNrLFxufTtcblxuY29uc3QgZmlsbFN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICB0b3A6IDAsXG4gIGhlaWdodDogXCIxMDAlXCIsXG4gIGJvcmRlclJhZGl1czogNixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgYmFja2dyb3VuZEdyYWRpZW50OiBHcmFkaWVudHMucHJpbWFyeSxcbn07XG5cbmNvbnN0IGxhYmVsV3JhcDogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgbGVmdDogMCxcbiAgdG9wOiAwLFxuICB3aWR0aDogXCIxMDAlXCIsXG4gIGhlaWdodDogXCIxMDAlXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxufTtcblxuY29uc3QgbGFiZWxUZXh0OiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnhzLFxuICBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsXG4gIHRleHRBbGlnbjogXCJjZW50ZXJcIixcbn07XG4iLCAiaW1wb3J0IHsgQmV2eVN0eWxlLCBQb2ludGVyRXZlbnREYXRhIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBQcm9ncmVzc0JhciB9IGZyb20gXCIuL1Byb2dyZXNzQmFyXCI7XG5pbXBvcnQgeyBDb2xvcnMsIEdyYWRpZW50cyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbmV4cG9ydCB0eXBlIFNsaWRlclByb3BzID0ge1xuICAvKiogQ3VycmVudCB2YWx1ZSAoY29udHJvbGxlZCDigJQgdGhlIHBhcmVudCBvd25zIGl0KS4gKi9cbiAgdmFsdWU6IG51bWJlcjtcbiAgLyoqIFJhbmdlIG1pbmltdW0gKGRlZmF1bHQgMCkuICovXG4gIG1pbj86IG51bWJlcjtcbiAgLyoqIFJhbmdlIG1heGltdW0gKGRlZmF1bHQgMSkuICovXG4gIG1heD86IG51bWJlcjtcbiAgLyoqIE9wdGlvbmFsIGxhYmVsIGNlbnRlcmVkIG92ZXIgdGhlIGJhci4gKi9cbiAgbGFiZWw/OiBzdHJpbmc7XG4gIC8qKiBDYWxsZWQgd2l0aCB0aGUgbmV3IHZhbHVlIG9uIGNsaWNrIGFuZCBkdXJpbmcgYSBkcmFnLiAqL1xuICBvbkNoYW5nZTogKHZhbHVlOiBudW1iZXIpID0+IHZvaWQ7XG59O1xuXG5jb25zdCBjbGFtcCA9ICh2OiBudW1iZXIsIGxvOiBudW1iZXIsIGhpOiBudW1iZXIpID0+XG4gIE1hdGgubWluKE1hdGgubWF4KHYsIGxvKSwgaGkpO1xuXG4vKiogQSBkcmFnZ2FibGUgc2xpZGVyIGJ1aWx0IG9uIGBQcm9ncmVzc0JhcmAuIE1hcHMgdGhlIGN1cnNvcidzIG5vcm1hbGl6ZWQgeFxuICogICgwLi4xIGFjcm9zcyB0aGUgdHJhY2spIHRvIGEgdmFsdWUgaW4gYFttaW4sIG1heF1gLiBNaXJyb3JzIHRoZSBTbGludFxuICogIGBTbGlkZXJgOiBjbGljay10by1zZXQgcGx1cyBkcmFnLCBjbGFtcGVkIHRvIHRoZSBlbmRzLlxuICpcbiAqICBEcmFnIHdvcmtzIHZpYSB0aGUgbmF0aXZlIHBvaW50ZXIgZXZlbnRzOiBgb25Qb2ludGVyRG93bmAgY292ZXJzIFNsaW50J3NcbiAqICBgY2xpY2tlZGAsIGFuZCBgb25Qb2ludGVyTW92ZWAgKHdoaWNoIGZpcmVzIG9ubHkgd2hpbGUgdGhlIGJ1dHRvbiBpcyBoZWxkKVxuICogIGNvdmVycyBgbW92ZWRgLXdoaWxlLXByZXNzZWQgYW5kIGtlZXBzIGZvbGxvd2luZyB0aGUgY3Vyc29yIHBhc3QgdGhlIGVuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gU2xpZGVyKHtcbiAgdmFsdWUsXG4gIG1pbiA9IDAsXG4gIG1heCA9IDEsXG4gIGxhYmVsID0gXCJcIixcbiAgb25DaGFuZ2UsXG59OiBTbGlkZXJQcm9wcykge1xuICBjb25zdCBwcm9ncmVzcyA9IG1heCA+IG1pbiA/IGNsYW1wKCh2YWx1ZSAtIG1pbikgLyAobWF4IC0gbWluKSwgMCwgMSkgOiAwO1xuICBjb25zdCBzZXRGcm9tWCA9IChlOiBQb2ludGVyRXZlbnREYXRhKSA9PlxuICAgIG9uQ2hhbmdlKG1pbiArIChtYXggLSBtaW4pICogY2xhbXAoZS54LCAwLCAxKSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17c2xpZGVyVHJhY2t9IG9uUG9pbnRlckRvd249e3NldEZyb21YfSBvblBvaW50ZXJNb3ZlPXtzZXRGcm9tWH0+XG4gICAgICA8UHJvZ3Jlc3NCYXIgcHJvZ3Jlc3M9e3Byb2dyZXNzfSBsYWJlbD17bGFiZWx9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBzbGlkZXJUcmFjazogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogMjQwLFxuICBoZWlnaHQ6IDIwLFxuICBib3JkZXJSYWRpdXM6IDYsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2U0MDAsXG4gIGJhY2tncm91bmRHcmFkaWVudDogR3JhZGllbnRzLnRyYWNrLFxufTtcbiIsICJpbXBvcnQgeyBQcm9wc1dpdGhDaGlsZHJlbiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMsIEdyYWRpZW50cyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBUZXh0TW9ubyB9IGZyb20gXCIuL1RleHRNb25vXCI7XG5cbmV4cG9ydCB0eXBlIEV4YW1wbGVQcm9wcyA9IFByb3BzV2l0aENoaWxkcmVuICYge1xuICAvLyBBIG9uZS90d28tbGluZSBub3RlIHNob3duIG9uIHRoZSByaWdodCwgYWJvdmUgdGhlIGNvZGUuXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICB0c3g/OiBzdHJpbmc7XG4gIHJ1c3Q/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gRXhhbXBsZSh7IGNoaWxkcmVuLCBkZXNjcmlwdGlvbiwgdHN4LCBydXN0IH06IEV4YW1wbGVQcm9wcykge1xuICBjb25zdCBoYXNDb2RlID0gISEocnVzdCB8fCB0c3gpO1xuICBjb25zdCBoYXNBc2lkZSA9ICEhKGRlc2NyaXB0aW9uIHx8IGhhc0NvZGUpO1xuXG4gIC8vIENvZGUgc25pcHBldHMgYXJlIHNob3duIGJ5IGRlZmF1bHQgYnV0IGNhbiBiZSBjb2xsYXBzZWQgc28gYSB0YWxsIGNhcmRcbiAgLy8gZG9lc24ndCBvdmVybGF5IHRoZSBzY2VuZSBiZWhpbmQgaXQuXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NhcmRTdHlsZX0+XG4gICAgICA8bm9kZSBzdHlsZT17ZGVtb1N0eWxlfT57Y2hpbGRyZW59PC9ub2RlPlxuXG4gICAgICB7aGFzQ29kZSAmJiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKChvKSA9PiAhbyl9XG4gICAgICAgICAgc3R5bGU9e2NvZGVUb2dnbGVTdHlsZX1cbiAgICAgICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRHcmFkaWVudDogR3JhZGllbnRzLnN1cmZhY2VIb3ZlciB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFRleHRNb25vIHN0eWxlPXtjb2RlVG9nZ2xlTGFiZWxTdHlsZX0+e29wZW4gPyBcIi1cIiA6IFwiK1wifTwvVGV4dE1vbm8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKX1cblxuICAgICAge2hhc0FzaWRlICYmIChcbiAgICAgICAgPG5vZGUgc3R5bGU9e2FzaWRlU3R5bGV9PlxuICAgICAgICAgIHtkZXNjcmlwdGlvbiAmJiA8dGV4dCBzdHlsZT17ZGVzY3JpcHRpb25TdHlsZX0+e2Rlc2NyaXB0aW9ufTwvdGV4dD59XG5cbiAgICAgICAgICB7aGFzQ29kZSAmJiAoXG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgICAgZ2FwOiA4LFxuICAgICAgICAgICAgICAgIG92ZXJmbG93WTogXCJjbGlwXCIsXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiBvcGVuID8gZXN0aW1hdGVDb2RlSGVpZ2h0KHJ1c3QsIHRzeCkgOiAwLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHsgc2l6ZTogeyBkdXJhdGlvbjogMzAwLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0gfSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3J1c3QgJiYgPENvZGUgbGFuZz1cInJ1c3RcIiBjb2RlPXtydXN0fSAvPn1cbiAgICAgICAgICAgICAge3RzeCAmJiA8Q29kZSBsYW5nPVwidHN4XCIgY29kZT17dHN4fSAvPn1cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICApfVxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLy8gYG1heEhlaWdodGAgb25seSBjbGlwcywgc28gYSBnZW5lcm91cyBvdmVyc2hvb3QgaXMgc2FmZTogd2hlbiBpdCBleGNlZWRzIHRoZVxuLy8gY29udGVudCB0aGUgc25pcHBldHMgdGFrZSB0aGVpciBuYXR1cmFsIGhlaWdodC4gRXN0aW1hdGUgZnJvbSBsaW5lIGNvdW50cyBzb1xuLy8gdGhlIG9wZW4gYW5pbWF0aW9uIHJlYWNoZXMgZnVsbCBoZWlnaHQgd2l0aG91dCBjbGlwcGluZyB0aGUgbGFzdCBsaW5lLlxuZnVuY3Rpb24gZXN0aW1hdGVDb2RlSGVpZ2h0KHJ1c3Q/OiBzdHJpbmcsIHR5cGVzY3JpcHQ/OiBzdHJpbmcpOiBudW1iZXIge1xuICBjb25zdCBsaW5lcyA9IChzPzogc3RyaW5nKSA9PiAocyA/IHMuc3BsaXQoXCJcXG5cIikubGVuZ3RoIDogMCk7XG4gIGNvbnN0IFBFUl9MSU5FX1BYID0gMjA7XG4gIGNvbnN0IFBFUl9TTklQUEVUX1BYID0gNjA7IC8vIGxhbmcgbGFiZWwgKyBwYWRkaW5nc1xuICBjb25zdCBzbmlwcGV0cyA9IFtydXN0LCB0eXBlc2NyaXB0XS5maWx0ZXIoQm9vbGVhbikgYXMgc3RyaW5nW107XG4gIGNvbnN0IGxpbmVUb3RhbCA9IHNuaXBwZXRzLnJlZHVjZSgoc3VtLCBzKSA9PiBzdW0gKyBsaW5lcyhzKSwgMCk7XG4gIHJldHVybiBsaW5lVG90YWwgKiBQRVJfTElORV9QWCArIHNuaXBwZXRzLmxlbmd0aCAqIFBFUl9TTklQUEVUX1BYO1xufVxuXG50eXBlIENvZGVQcm9wcyA9IHtcbiAgbGFuZzogXCJ0c3hcIiB8IFwicnVzdFwiO1xuICBjb2RlOiBzdHJpbmc7XG59O1xuZnVuY3Rpb24gQ29kZSh7IGxhbmcsIGNvZGUgfTogQ29kZVByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiB9fT5cbiAgICAgIDxUZXh0TW9ubyBzdHlsZT17eyBmb250U2l6ZTogRm9udFNpemVzLnNtLCBwYWRkaW5nOiB7IGJvdHRvbTogNSB9IH19PlxuICAgICAgICB7bGFuZ31cbiAgICAgIDwvVGV4dE1vbm8+XG4gICAgICA8VGV4dE1vbm9cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLnh4cyxcbiAgICAgICAgICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjIwMCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2NvZGV9XG4gICAgICA8L1RleHRNb25vPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgY2FyZFN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGFsaWduSXRlbXM6IFwic3RyZXRjaFwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgbWluV2lkdGg6IDMyMCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTIwMCxcbiAgYmFja2dyb3VuZEdyYWRpZW50OiBHcmFkaWVudHMuY2FyZCxcbiAgYm9yZGVyUmFkaXVzOiAxNixcbiAgYm9yZGVyOiAyLFxuICBib3JkZXJDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGJvcmRlckdyYWRpZW50OiBHcmFkaWVudHMuYWNjZW50Qm9yZGVyLFxuICB6SW5kZXg6IDEwMDAsXG4gIGJveFNoYWRvdzogeyBibHVyUmFkaXVzOiAxNSwgc3ByZWFkUmFkaXVzOiA1LCBjb2xvcjogQ29sb3JzLnNoYWRvdzEwMCB9LFxufTtcblxuY29uc3QgZGVtb1N0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIGdhcDogOCxcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIGJvcmRlcjogeyByaWdodDogMiB9LFxuICBib3JkZXJDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGJvcmRlckdyYWRpZW50OiBHcmFkaWVudHMuYWNjZW50Qm9yZGVyLFxuICBwYWRkaW5nOiAyOCxcbn07XG5cbmNvbnN0IGFzaWRlU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIGdhcDogOCxcbiAgcGFkZGluZzogMTYsXG59O1xuXG5jb25zdCBjb2RlVG9nZ2xlU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gIHRvcDogOCxcbiAgcmlnaHQ6IDgsXG4gIHdpZHRoOiAyNCxcbiAgaGVpZ2h0OiAyNCxcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGJvcmRlclJhZGl1czogNixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTMwMCxcbiAgYmFja2dyb3VuZEdyYWRpZW50OiBHcmFkaWVudHMuc3VyZmFjZSxcbiAgekluZGV4OiAxLFxuICB0cmFuc2l0aW9uOiB7IGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMjAwIH0gfSxcbn07XG5cbmNvbnN0IGNvZGVUb2dnbGVMYWJlbFN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcblxuY29uc3QgZGVzY3JpcHRpb25TdHlsZTogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjIwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbiAgbWF4V2lkdGg6IDMyMCxcbiAgcGFkZGluZzogNSxcbn07XG4iLCAiaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBQcm9wc1dpdGhDaGlsZHJlbiB9IGZyb20gXCJyZWFjdFwiO1xuXG50eXBlIFByb3BzID0gUHJvcHNXaXRoQ2hpbGRyZW4gJiB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRNb25vKHsgY2hpbGRyZW4sIHN0eWxlIH06IFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPHRleHQgc3R5bGU9e3sgLi4uc3R5bGUsIGZvbnRGYW1pbHk6IFwiTm90byBTYW5zIE1vbm9cIiB9fT57Y2hpbGRyZW59PC90ZXh0PlxuICApO1xufVxuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgUHJvcHNXaXRoQ2hpbGRyZW4gfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzLCBHcmFkaWVudHMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG5leHBvcnQgdHlwZSBCdXR0b25Qcm9wcyA9IFByb3BzV2l0aENoaWxkcmVuICYge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgaG92ZXJTdHlsZT86IEJldnlTdHlsZTtcbiAgcHJlc3NTdHlsZT86IEJldnlTdHlsZTtcbiAgbGFiZWxTdHlsZT86IEJldnlTdHlsZTtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b24oe1xuICBvbkNsaWNrLFxuICBzdHlsZSxcbiAgaG92ZXJTdHlsZSxcbiAgcHJlc3NTdHlsZSxcbiAgbGFiZWxTdHlsZSxcbiAgY2hpbGRyZW4sXG59OiBCdXR0b25Qcm9wcykge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17eyAuLi5idXR0b25TdHlsZSwgLi4uKHN0eWxlID8/IHt9KSB9fVxuICAgICAgaG92ZXJTdHlsZT17eyAuLi5idXR0b25Ib3ZlclN0eWxlLCAuLi4oaG92ZXJTdHlsZSA/PyB7fSkgfX1cbiAgICAgIHByZXNzU3R5bGU9e3sgLi4uYnV0dG9uUHJlc3NTdHlsZSwgLi4uKHByZXNzU3R5bGUgPz8ge30pIH19XG4gICAgPlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uYnV0dG9uTGFiZWxTdHlsZSwgLi4uKGxhYmVsU3R5bGUgPz8ge30pIH19PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbmNvbnN0IGJ1dHRvblN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBwYWRkaW5nOiB7IHRvcDogOCwgcmlnaHQ6IDEyLCBib3R0b206IDgsIGxlZnQ6IDEyIH0sXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTQwMCxcbiAgYmFja2dyb3VuZEdyYWRpZW50OiBHcmFkaWVudHMuc3VyZmFjZSxcbiAgdHJhbnNpdGlvbjoge1xuICAgIGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMTUwIH0sXG4gICAgdHJhbnNmb3JtOiB7IGR1cmF0aW9uOiAxNTAgfSxcbiAgfSxcbn07XG5cbmNvbnN0IGJ1dHRvbkhvdmVyU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgYmFja2dyb3VuZEdyYWRpZW50OiBHcmFkaWVudHMuc3VyZmFjZUhvdmVyLFxufTtcblxuY29uc3QgYnV0dG9uUHJlc3NTdHlsZTogQmV2eVN0eWxlID0ge1xuICB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOSB9LFxufTtcblxuY29uc3QgYnV0dG9uTGFiZWxTdHlsZTogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMsIEdyYWRpZW50cyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbmV4cG9ydCB0eXBlIFJhZGlvVmFsdWUgPSBzdHJpbmcgfCBudW1iZXI7XG5cbmV4cG9ydCB0eXBlIFJhZGlvT3B0aW9uPFQgZXh0ZW5kcyBSYWRpb1ZhbHVlID0gUmFkaW9WYWx1ZT4gPSB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHZhbHVlOiBUO1xufTtcblxuZXhwb3J0IHR5cGUgUmFkaW9Qcm9wczxUIGV4dGVuZHMgUmFkaW9WYWx1ZSA9IFJhZGlvVmFsdWU+ID0ge1xuICB2YWx1ZTogVDtcbiAgb3B0aW9uczogUmFkaW9PcHRpb248VD5bXTtcbiAgb25DaGFuZ2U6ICh2YWx1ZTogVCkgPT4gdm9pZDtcbn07XG5cbi8vIEEgc2VnbWVudGVkIHBpbGwgY29udHJvbDogZWFjaCBvcHRpb24gaXMgYSBwaWxsLCB0aGUgc2VsZWN0ZWQgb25lIGZpbGxlZCB3aXRoXG4vLyB0aGUgYWNjZW50LiBTZWxlY3Rpb24gZWFzZXMgdGhlIGZpbGwgdmlhIHRoZSBgdHJhbnNpdGlvbmAgc3R5bGUgKGxpa2UgQnV0dG9uKS5cbmV4cG9ydCBmdW5jdGlvbiBSYWRpbzxUIGV4dGVuZHMgUmFkaW9WYWx1ZT4oe1xuICBvcHRpb25zLFxuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG59OiBSYWRpb1Byb3BzPFQ+KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2dyb3VwU3R5bGV9PlxuICAgICAge29wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgPE9wdGlvblxuICAgICAgICAgIGtleT17U3RyaW5nKG9wdGlvbi52YWx1ZSl9XG4gICAgICAgICAgb3B0aW9uPXtvcHRpb259XG4gICAgICAgICAgc2VsZWN0ZWQ9e29wdGlvbi52YWx1ZSA9PT0gdmFsdWV9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgaWYgKG9wdGlvbi52YWx1ZSAhPT0gdmFsdWUpIG9uQ2hhbmdlKG9wdGlvbi52YWx1ZSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxudHlwZSBPcHRpb25Qcm9wcyA9IHtcbiAgb3B0aW9uOiBSYWRpb09wdGlvbjtcbiAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59O1xuXG5mdW5jdGlvbiBPcHRpb24oeyBvcHRpb24sIHNlbGVjdGVkLCBvbkNsaWNrIH06IE9wdGlvblByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLnBpbGxTdHlsZSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzZWxlY3RlZCA/IEFDQ0VOVCA6IFNVUkZBQ0UsXG4gICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogc2VsZWN0ZWQgPyBHcmFkaWVudHMucHJpbWFyeSA6IEdyYWRpZW50cy5zdXJmYWNlLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3tcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBzZWxlY3RlZFxuICAgICAgICAgID8gR3JhZGllbnRzLnByaW1hcnlIb3ZlclxuICAgICAgICAgIDogR3JhZGllbnRzLnN1cmZhY2VIb3ZlcixcbiAgICAgIH19XG4gICAgICBwcmVzc1N0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMC45NSB9IH19XG4gICAgPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5waWxsTGFiZWwsXG4gICAgICAgICAgY29sb3I6IHNlbGVjdGVkID8gQ29sb3JzLnRleHRDb2xvcjQwMCA6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gICAgICAgICAgZm9udFdlaWdodDogc2VsZWN0ZWQgPyBcImJvbGRcIiA6IFwibWVkaXVtXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtvcHRpb24ubGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbmNvbnN0IEFDQ0VOVCA9IENvbG9ycy5wcmltYXJ5MTAwO1xuY29uc3QgU1VSRkFDRSA9IENvbG9ycy5zdXJmYWNlMzAwO1xuXG5jb25zdCBncm91cFN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gIGZsZXhXcmFwOiBcIndyYXBcIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiA2LFxufTtcblxuY29uc3QgcGlsbFN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBwYWRkaW5nOiB7IHRvcDogNiwgcmlnaHQ6IDE0LCBib3R0b206IDYsIGxlZnQ6IDE0IH0sXG4gIGJvcmRlclJhZGl1czogOCxcbiAgdHJhbnNmb3JtOiB7IHNjYWxlOiAxIH0sXG4gIHRyYW5zaXRpb246IHtcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IHsgZHVyYXRpb246IDE1MCB9LFxuICAgIHRyYW5zZm9ybTogeyBkdXJhdGlvbjogMTIwLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0sXG4gIH0sXG59O1xuXG5jb25zdCBwaWxsTGFiZWw6IEJldnlTdHlsZSA9IHtcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbn07XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcblxuZXhwb3J0IHR5cGUgVHlwZXdyaXRlclByb3BzID0ge1xuICAvKiogRnVsbCB0ZXh0IHRvIHJldmVhbC4gQ2hhbmdpbmcgaXQgcmVzdGFydHMgdGhlIHJldmVhbCBmcm9tIHRoZSBzdGFydC4gKi9cbiAgdGV4dDogc3RyaW5nO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgLyoqIENoYXJhY3RlcnMgcmV2ZWFsZWQgcGVyIHRpY2sgKGRlZmF1bHQgMSkuIFJhaXNlIHRvIHR5cGUgbG9uZyB0ZXh0IGZhc3Rlci4gKi9cbiAgY2hhcnNQZXJUaWNrPzogbnVtYmVyO1xuICAvKiogTWlsbGlzZWNvbmRzIGJldHdlZW4gdGlja3MgKGRlZmF1bHQgMjgpLiAqL1xuICB0aWNrTXM/OiBudW1iZXI7XG4gIC8qKiBNaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgdHlwaW5nIGJlZ2lucyAoZGVmYXVsdCAwKS4gQSBibGlua2luZyBjdXJzb3JcbiAgICogIHNob3dzIGR1cmluZyB0aGUgd2FpdCBpZiBgY3Vyc29yYCBpcyBzZXQuICovXG4gIHN0YXJ0RGVsYXk/OiBudW1iZXI7XG4gIC8qKiBTaG93IGEgYmxpbmtpbmcgYmxvY2sgY3Vyc29yIHdoaWxlIHR5cGluZyAvIHdoZW4gZG9uZSAoZGVmYXVsdCBmYWxzZSkuICovXG4gIGN1cnNvcj86IGJvb2xlYW47XG4gIC8qKiBDYWxsZWQgb25jZSwgd2hlbiB0aGUgZnVsbCB0ZXh0IGhhcyBiZWVuIHJldmVhbGVkLiAqL1xuICBvbkRvbmU/OiAoKSA9PiB2b2lkO1xufTtcblxuY29uc3QgQ1VSU09SID0gXCLilotcIjtcblxuLyoqIFJldmVhbHMgYHRleHRgIG9uZSBjaHVuayBhdCBhIHRpbWUsIGxpa2UgYSB0ZXJtaW5hbCB0eXBpbmcgaXQgb3V0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFR5cGV3cml0ZXIoe1xuICB0ZXh0LFxuICBzdHlsZSxcbiAgY2hhcnNQZXJUaWNrID0gMSxcbiAgdGlja01zID0gMjgsXG4gIHN0YXJ0RGVsYXkgPSAwLFxuICBjdXJzb3IgPSBmYWxzZSxcbiAgb25Eb25lLFxufTogVHlwZXdyaXRlclByb3BzKSB7XG4gIGNvbnN0IFtjb3VudCwgc2V0Q291bnRdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtibGluaywgc2V0QmxpbmtdID0gdXNlU3RhdGUodHJ1ZSk7XG5cbiAgLy8gS2VlcCBgb25Eb25lYCBpbiBhIHJlZiBzbyBpdCBpc24ndCBhIHJlc2V0IGRlcGVuZGVuY3kgb2YgdGhlIHR5cGluZyBlZmZlY3QuXG4gIGNvbnN0IG9uRG9uZVJlZiA9IHVzZVJlZihvbkRvbmUpO1xuICBvbkRvbmVSZWYuY3VycmVudCA9IG9uRG9uZTtcblxuICAvLyBUeXBlIHRoZSB0ZXh0IG91dCwgcmVzZXR0aW5nIHdoZW5ldmVyIHRoZSB0ZXh0IChvciBzcGVlZCkgY2hhbmdlcy4gQW4gb3B0aW9uYWxcbiAgLy8gYHN0YXJ0RGVsYXlgIGhvbGRzIGF0IHplcm8gY2hhcnMgYmVmb3JlIHRoZSBpbnRlcnZhbCBraWNrcyBpbi5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRDb3VudCgwKTtcbiAgICBsZXQgdGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldEludGVydmFsPjtcbiAgICBjb25zdCBzdGFydCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHNldENvdW50KChjKSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV4dCA9IE1hdGgubWluKHRleHQubGVuZ3RoLCBjICsgY2hhcnNQZXJUaWNrKTtcbiAgICAgICAgICBpZiAobmV4dCA+PSB0ZXh0Lmxlbmd0aCkgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH0pO1xuICAgICAgfSwgdGlja01zKTtcbiAgICB9LCBzdGFydERlbGF5KTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHN0YXJ0KTtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgIH07XG4gIH0sIFt0ZXh0LCBjaGFyc1BlclRpY2ssIHRpY2tNcywgc3RhcnREZWxheV0pO1xuXG4gIC8vIEZpcmUgYG9uRG9uZWAgb25jZSwgZnJvbSBhbiBlZmZlY3QgKG5vdCB0aGUgdXBkYXRlciBhYm92ZSkgc28gd2UgbmV2ZXIgc2V0XG4gIC8vIHBhcmVudCBzdGF0ZSBtaWQtcmVuZGVyIG9mIHRoaXMgY29tcG9uZW50LlxuICBjb25zdCBmaW5pc2hlZCA9IHRleHQubGVuZ3RoID09PSAwIHx8IGNvdW50ID49IHRleHQubGVuZ3RoO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChmaW5pc2hlZCkgb25Eb25lUmVmLmN1cnJlbnQ/LigpO1xuICB9LCBbZmluaXNoZWRdKTtcblxuICAvLyBCbGluayB0aGUgY3Vyc29yIGluZGVwZW5kZW50bHkgb2YgdGhlIHR5cGluZyBjYWRlbmNlLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY3Vyc29yKSByZXR1cm47XG4gICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiBzZXRCbGluaygoYikgPT4gIWIpLCA1MDApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgfSwgW2N1cnNvcl0pO1xuXG4gIGNvbnN0IGdseXBoID0gY3Vyc29yICYmIGJsaW5rID8gQ1VSU09SIDogXCJcIjtcblxuICByZXR1cm4gKFxuICAgIDx0ZXh0IHN0eWxlPXtzdHlsZX0+XG4gICAgICB7dGV4dC5zbGljZSgwLCBjb3VudCl9XG4gICAgICB7Z2x5cGh9XG4gICAgPC90ZXh0PlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGJldnkgfSBmcm9tIFwiQC9iZXZ5XCI7XG5pbXBvcnQgeyBCdXR0b24sIEV4YW1wbGUgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuY29uc3QgTUFYID0gODtcbmNvbnN0IFRZUEVTQ1JJUFQgPSBcImJldnkuYmFzaWNEZW1vLnNldENvdW50KG4pO1wiO1xuXG5jb25zdCBSVVNUID0gYCNbcmVhY3RfbWVzc2FnZShuYW1lID0gXCJiYXNpY0RlbW8uc2V0Q291bnRcIildXG5zdHJ1Y3QgU2V0Q291bnQodXNpemUpO1xuXG5mbiBhcHBseV9zZXRfY291bnQoXG4gICAgY291bnQ6IE9uPFNldENvdW50PixcbiAgICBtdXQgZGVzaXJlZDogUmVzTXV0PERlc2lyZWRDdWJlcz4sXG4pIHtcbiAgICBkZXNpcmVkLjAgPSBjb3VudC5ldmVudCgpLjA7XG59XG5cbmFwcC5hZGRfcmVhY3RfaGFuZGxlcihhcHBseV9zZXRfY291bnQpO2A7XG5cbmV4cG9ydCBmdW5jdGlvbiBSZWFjdFRvQmV2eURlbW8oKSB7XG4gIGNvbnN0IFtjb3VudCwgc2V0Q291bnRdID0gdXNlU3RhdGUoMyk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5LmJhc2ljRGVtby5zZXRDb3VudChjb3VudCk7XG4gIH0sIFtjb3VudF0pO1xuXG4gIHJldHVybiAoXG4gICAgPEV4YW1wbGVcbiAgICAgIGRlc2NyaXB0aW9uPVwiUmVhY3QgLT4gQmV2eTogYSB0eXBlZCBgZW1pdGAgbm90aWZpZXMgdGhlIEVDUywgd2hpY2ggc3Bhd25zIHRoYXQgbWFueSBjdWJlcy5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgICAgcnVzdD17UlVTVH1cbiAgICA+XG4gICAgICA8dGV4dCBzdHlsZT17Y291bnRTdHlsZX0+XG4gICAgICAgIEN1YmVzOiA8dGV4dCBzdHlsZT17eyBjb2xvcjogQ29sb3JzLnByaW1hcnkxMDAgfX0+e2NvdW50fTwvdGV4dD5cbiAgICAgIDwvdGV4dD5cblxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAxMiB9fT5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldENvdW50KChjKSA9PiBNYXRoLm1pbihNQVgsIGMgKyAxKSl9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmJ1dHRvblN0eWxlLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogdW5kZWZpbmVkLFxuICAgICAgICAgIH19XG4gICAgICAgICAgaG92ZXJTdHlsZT17e1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTIwMCxcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogdW5kZWZpbmVkLFxuICAgICAgICAgIH19XG4gICAgICAgICAgcHJlc3NTdHlsZT17e1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTMwMCxcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogdW5kZWZpbmVkLFxuICAgICAgICAgIH19XG4gICAgICAgICAgbGFiZWxTdHlsZT17eyBmb250U2l6ZTogRm9udFNpemVzLnh4eGwgfX1cbiAgICAgICAgPlxuICAgICAgICAgICtcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRDb3VudCgoYykgPT4gTWF0aC5tYXgoMCwgYyAtIDEpKX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uYnV0dG9uU3R5bGUsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5yZWQxMDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGhvdmVyU3R5bGU9e3tcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnJlZDIwMCxcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogdW5kZWZpbmVkLFxuICAgICAgICAgIH19XG4gICAgICAgICAgcHJlc3NTdHlsZT17e1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucmVkMzAwLFxuICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB1bmRlZmluZWQsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBsYWJlbFN0eWxlPXt7IGZvbnRTaXplOiBGb250U2l6ZXMueHh4bCB9fVxuICAgICAgICA+XG4gICAgICAgICAgLVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvbm9kZT5cbiAgICA8L0V4YW1wbGU+XG4gICk7XG59XG5cbmNvbnN0IGNvdW50U3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMueGwsXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcblxuY29uc3QgYnV0dG9uU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDYwLFxuICBoZWlnaHQ6IDYwLFxufTtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIkAvYmV2eVwiO1xuaW1wb3J0IHsgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuY29uc3QgVFlQRVNDUklQVCA9IGBiZXZ5Lm9uKFwiYmV2eUV2ZW50c0RlbW8uYmFsbEJvdW5jZWRcIiwgKGUpID0+IHtcbiAgc2V0Qm91bmNlcygobikgPT4gbiArIDEpO1xufSk7YDtcblxuY29uc3QgUlVTVCA9IGAjW3JlYWN0X2V2ZW50KG5hbWUgPSBcImJldnlFdmVudHNEZW1vLmJhbGxCb3VuY2VkXCIpXVxuc3RydWN0IEJhbGxCb3VuY2VkIHtcbiAgICB3YWxsOiBXYWxsLFxuICAgIHNwZWVkOiBmMzIsXG59XG5cbmZuIGJvdW5jZShldmVudHM6IFJlYWN0RXZlbnRzLCAvKiAuLi4gKi8pIHtcbiAgICBldmVudHMuc2VuZCgmQmFsbEJvdW5jZWQgeyB3YWxsLCBzcGVlZCB9KTtcbn1cblxuYXBwLmFkZF9yZWFjdF9ldmVudDo6PEJhbGxCb3VuY2VkPigpO2A7XG5cbmV4cG9ydCBmdW5jdGlvbiBCZXZ5VG9SZWFjdERlbW8oKSB7XG4gIGNvbnN0IFtib3VuY2VzLCBzZXRCb3VuY2VzXSA9IHVzZVN0YXRlKDApO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb2ZmID0gYmV2eS5vbihcImJldnlFdmVudHNEZW1vLmJhbGxCb3VuY2VkXCIsICgpID0+IHtcbiAgICAgIHNldEJvdW5jZXMoKGJvdW5jZXMpID0+IGJvdW5jZXMgKyAxKTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBvZmYoKTtcbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8RXhhbXBsZVxuICAgICAgZGVzY3JpcHRpb249XCJCZXZ5IC0+IFJlYWN0OiBhIHR5cGVkIGV2ZW50IHNlbnQgZnJvbSBhIHN5c3RlbSBmaXJlcyBldmVyeSBKUyBsaXN0ZW5lciBzdWJzY3JpYmVkIGJ5IG5hbWUuXCJcbiAgICAgIHRzeD17VFlQRVNDUklQVH1cbiAgICAgIHJ1c3Q9e1JVU1R9XG4gICAgPlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IEZvbnRTaXplcy5sZyB9fT5Cb3VuY2VzPC90ZXh0PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLnh4eGwsXG4gICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgY29sb3I6IENvbG9ycy55ZWxsb3cxMDAsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtib3VuY2VzfVxuICAgICAgPC90ZXh0PlxuICAgIDwvRXhhbXBsZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIkAvYmV2eVwiO1xuaW1wb3J0IHR5cGUgeyBCYWxsU3RhdGUgfSBmcm9tIFwiQC9iZXZ5XCI7XG5pbXBvcnQgeyBFeGFtcGxlIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG5jb25zdCBUWVBFU0NSSVBUID0gXCJjb25zdCBiYWxsID0gYXdhaXQgYmV2eS5wb2xsaW5nRGVtby5nZXRCYWxsKCk7XCI7XG5cbmNvbnN0IFJVU1QgPSBgI1tyZWFjdF9yZXF1ZXN0KG5hbWUgPSBcInBvbGxpbmdEZW1vLmdldEJhbGxcIiwgcmVzcG9uc2UgPSBCYWxsU3RhdGUpXVxuc3RydWN0IEdldEJhbGw7XG5cbiNbZGVyaXZlKFNlcmlhbGl6ZSwgVFMpXVxuc3RydWN0IEJhbGxTdGF0ZSB7IHg6IGYzMiwgeTogZjMyLCB2eDogZjMyLCB2eTogZjMyIH1cblxuZm4gcmVwb3J0X2JhbGwoXG4gICAgcmVxOiBPbjxSZXF1ZXN0PEdldEJhbGw+PixcbiAgICBiYWxsczogUXVlcnk8KCZUcmFuc2Zvcm0sICZWZWxvY2l0eSk+LFxuKSB7XG4gICAgbGV0ICh0LCB2KSA9IGJhbGxzLnNpbmdsZSgpLnVud3JhcCgpO1xuICAgIHJlcS5yZXNwb25kKEJhbGxTdGF0ZSB7XG4gICAgICAgIHg6IHQudHJhbnNsYXRpb24ueCwgeTogdC50cmFuc2xhdGlvbi55LFxuICAgICAgICB2eDogdi4wLngsIHZ5OiB2LjAueSxcbiAgICB9KTtcbn1cblxuYXBwLmFkZF9yZWFjdF9yZXF1ZXN0X2hhbmRsZXIocmVwb3J0X2JhbGwpO2A7XG5cbmV4cG9ydCBmdW5jdGlvbiBCaWRpcmVjdGlvbkNvbW11bmljYXRpb25EZW1vKCkge1xuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlPEJhbGxTdGF0ZSB8IG51bGw+KG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGFsaXZlID0gdHJ1ZTtcbiAgICBsZXQgaGFuZGxlOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PjtcblxuICAgIGNvbnN0IHRpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBiYWxsID0gYXdhaXQgYmV2eS5wb2xsaW5nRGVtby5nZXRCYWxsKCk7XG4gICAgICAgIGlmICghYWxpdmUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RhdGUoYmFsbCk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gVGhlIGRlbW8gd2FzIHN3aXRjaGVkIGF3YXkgbWlkLWZsaWdodDogdGhlIGJhbGwgaXMgZ29uZSBhbmQgQmV2eVxuICAgICAgICAvLyByZWplY3RlZC4gSWdub3JlIOKAlCB0aGUgY2xlYW51cCBiZWxvdyBzdG9wcyB0aGUgbG9vcC5cbiAgICAgIH1cbiAgICAgIGlmIChhbGl2ZSkge1xuICAgICAgICBoYW5kbGUgPSBzZXRUaW1lb3V0KHRpY2ssIDUwKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRpY2soKTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBhbGl2ZSA9IGZhbHNlO1xuICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiAoXG4gICAgPEV4YW1wbGVcbiAgICAgIGRlc2NyaXB0aW9uPVwiUmVhY3QgPC0+IEJldnk6IGFuIGF3YWl0ZWQgcmVxdWVzdCByZXR1cm5zIGEgdHlwZWQgcmVzcG9uc2UsIHBvbGxlZCBoZXJlIGZvciBsaXZlIHRlbGVtZXRyeS5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgICAgcnVzdD17UlVTVH1cbiAgICA+XG4gICAgICB7c3RhdGUgPyAoXG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogOCwgYWxpZ25JdGVtczogXCJzdGFydFwiIH19PlxuICAgICAgICAgIDxSb3cgbGFiZWw9XCJwb3NpdGlvblwiIHg9e3N0YXRlLnh9IHk9e3N0YXRlLnl9IC8+XG4gICAgICAgICAgPFJvdyBsYWJlbD1cInZlbG9jaXR5XCIgeD17c3RhdGUudnh9IHk9e3N0YXRlLnZ5fSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICApIDogKFxuICAgICAgICA8dGV4dCBzdHlsZT17eyBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjMwMCwgZm9udFNpemU6IEZvbnRTaXplcy5zbSB9fT5cbiAgICAgICAgICB3YWl0aW5nIGZvciB0aGUgYmFsbC4uLlxuICAgICAgICA8L3RleHQ+XG4gICAgICApfVxuICAgIDwvRXhhbXBsZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gUm93KHsgbGFiZWwsIHgsIHkgfTogeyBsYWJlbDogc3RyaW5nOyB4OiBudW1iZXI7IHk6IG51bWJlciB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiA4IH19PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjIwMCxcbiAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gICAgICAgICAgd2lkdGg6IDgwLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGNvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHgge3gudG9GaXhlZCgyKX0sIHkge3kudG9GaXhlZCgyKX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQW5jaG9yZWQsIEFuY2hvclNjYWxpbmcgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIkAvYmV2eVwiO1xuaW1wb3J0IHR5cGUgeyBDdWJlSW5mbyB9IGZyb20gXCJAL2JldnlcIjtcbmltcG9ydCB7IENoZWNrYm94LCBFeGFtcGxlLCBTbGlkZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBDb2xvcnMsIEZvbnRTaXplcywgR3JhZGllbnRzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuY29uc3QgVFlQRVNDUklQVCA9IGA8QW5jaG9yZWQubm9kZSBlbnRpdHk9e2N1YmUuZW50aXR5fSBvZmZzZXQ9e1swLCAwLjgsIDBdfT5cbiAgPHRleHQ+e2N1YmUubGFiZWx9PC90ZXh0PlxuPC9BbmNob3JlZC5ub2RlPmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBBbmNob3JlZERlbW8oKSB7XG4gIGNvbnN0IFtjdWJlcywgc2V0Q3ViZXNdID0gdXNlU3RhdGU8Q3ViZUluZm9bXT4oW10pO1xuICBjb25zdCBbc2NhbGluZ0VuYWJsZWQsIHNldFNjYWxpbmdFbmFibGVkXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbYmFzZURpc3RhbmNlLCBzZXRCYXNlRGlzdGFuY2VdID0gdXNlU3RhdGUoMjQpO1xuICBjb25zdCBbc2NhbGVGYWN0b3IsIHNldFNjYWxlRmFjdG9yXSA9IHVzZVN0YXRlKDEpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb2ZmID0gYmV2eS5vbihcImNyb3dkZWRDdWJlcy5zcGF3bmVkXCIsIChlKSA9PiBzZXRDdWJlcyhlLmN1YmVzKSk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgb2ZmKCk7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IHNjYWxpbmc6IEFuY2hvclNjYWxpbmcgfCB1bmRlZmluZWQgPSBzY2FsaW5nRW5hYmxlZFxuICAgID8ge1xuICAgICAgICBtaW46IDAuNCxcbiAgICAgICAgbWF4OiAzLFxuICAgICAgICBmYWN0b3I6IHNjYWxlRmFjdG9yLFxuICAgICAgICBiYXNlRGlzdGFuY2U6IGJhc2VEaXN0YW5jZSxcbiAgICAgIH1cbiAgICA6IHVuZGVmaW5lZDtcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIlVJIG5vZGVzIHBpbm5lZCB0byBhIDNEIGVudGl0eSwgdHJhY2tpbmcgaXQgb24gc2NyZWVuIGFuZCBvcHRpb25hbGx5IHNjYWxpbmcgd2l0aCBkaXN0YW5jZS5cIlxuICAgICAgICB0c3g9e1RZUEVTQ1JJUFR9XG4gICAgICA+XG4gICAgICAgIDxDaGVja2JveFxuICAgICAgICAgIGxhYmVsPVwiU2NhbGUgd2l0aCBkaXN0YW5jZVwiXG4gICAgICAgICAgZW5hYmxlZD17c2NhbGluZ0VuYWJsZWR9XG4gICAgICAgICAgb25DaGFuZ2U9e3NldFNjYWxpbmdFbmFibGVkfVxuICAgICAgICAvPlxuXG4gICAgICAgIHtzY2FsaW5nRW5hYmxlZCAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxTbGlkZXJcbiAgICAgICAgICAgICAgdmFsdWU9e3NjYWxlRmFjdG9yfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0U2NhbGVGYWN0b3J9XG4gICAgICAgICAgICAgIGxhYmVsPXtgU2NhbGUgZmFjdG9yICR7c2NhbGVGYWN0b3IudG9GaXhlZCgxKX1gfVxuICAgICAgICAgICAgICBtaW49ezB9XG4gICAgICAgICAgICAgIG1heD17M31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8U2xpZGVyXG4gICAgICAgICAgICAgIHZhbHVlPXtiYXNlRGlzdGFuY2V9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRCYXNlRGlzdGFuY2V9XG4gICAgICAgICAgICAgIGxhYmVsPXtgQmFzZSBkaXN0YW5jZSAke2Jhc2VEaXN0YW5jZS50b0ZpeGVkKDEpfWB9XG4gICAgICAgICAgICAgIG1pbj17MX1cbiAgICAgICAgICAgICAgbWF4PXs1MH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC8+XG4gICAgICAgICl9XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIHtjdWJlcy5tYXAoKGN1YmUpID0+IChcbiAgICAgICAgPEJhZGdlIGtleT17U3RyaW5nKGN1YmUuZW50aXR5KX0gY3ViZT17Y3ViZX0gc2NhbGluZz17c2NhbGluZ30gLz5cbiAgICAgICkpfVxuICAgIDwvPlxuICApO1xufVxuXG50eXBlIEJhZGdlUHJvcHMgPSB7XG4gIGN1YmU6IEN1YmVJbmZvO1xuICBzY2FsaW5nOiBBbmNob3JTY2FsaW5nIHwgdW5kZWZpbmVkO1xufTtcblxuZnVuY3Rpb24gQmFkZ2UoeyBjdWJlLCBzY2FsaW5nIH06IEJhZGdlUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8QW5jaG9yZWQubm9kZVxuICAgICAgZW50aXR5PXtjdWJlLmVudGl0eX1cbiAgICAgIG9mZnNldD17WzAsIDAuOCwgMF19XG4gICAgICBzY2FsZT17c2NhbGluZ31cbiAgICAgIHN0eWxlPXtiYWRnZVN0eWxlfVxuICAgID5cbiAgICAgIDx0ZXh0IHN0eWxlPXtiYWRnZVRleHR9PntjdWJlLmxhYmVsfTwvdGV4dD5cbiAgICA8L0FuY2hvcmVkLm5vZGU+XG4gICk7XG59XG5cbmNvbnN0IGJhZGdlU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIHBhZGRpbmc6IHsgdG9wOiAzLCByaWdodDogOCwgYm90dG9tOiAzLCBsZWZ0OiA4IH0sXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGJhY2tncm91bmRHcmFkaWVudDogR3JhZGllbnRzLnByaW1hcnksXG4gIGJvcmRlclJhZGl1czogOTk5LFxuICBib3hTaGFkb3c6IHtcbiAgICBjb2xvcjogQ29sb3JzLnNoYWRvdzEwMCxcbiAgICBibHVyUmFkaXVzOiA0LFxuICAgIHNwcmVhZFJhZGl1czogMixcbiAgfSxcbn07XG5cbmNvbnN0IGJhZGdlVGV4dDogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjQwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy54cyxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG59O1xuIiwgImltcG9ydCB7IHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSwgUG9pbnRlckV2ZW50RGF0YSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuY29uc3QgVFlQRVNDUklQVCA9IGA8bm9kZVxuICBvbkNsaWNrPXsuLi59XG4gIG9uUG9pbnRlckRvd249ey4uLn1cbiAgb25Qb2ludGVyTW92ZT17Li4ufVxuICBvblBvaW50ZXJVcD17Li4ufVxuLz5gO1xuXG4vLyBBIHB1cmUtVUkgZGVtbyBvZiB0aGUgcmF3IHBvaW50ZXIgZXZlbnRzIHRoZSBicmlkZ2UgcmVwb3J0czogYGNsaWNrYCxcbi8vIGBwb2ludGVyRG93bmAsIGBwb2ludGVyTW92ZWAsIGBwb2ludGVyVXBgLiBHcmFiIHRoZSBib3ggYW5kIGRyYWcgaXQgYXJvdW5kIOKAlFxuLy8gZHJhZ2dpbmcgdXNlcyB0aGUgYWJzb2x1dGUgYGNsaWVudFhgL2BjbGllbnRZYCB0aGUgYnJpZGdlIG5vdyBzZW5kcyAodGhlXG4vLyBub3JtYWxpemVkIGB4YC9geWAgYXJlIGNsYW1wZWQgdG8gdGhlIGJveCBhbmQgY2FuJ3QgZHJpdmUgZnJlZSBtb3ZlbWVudCkuIE5vXG4vLyBCZXZ5IHNjZW5lOiB0aGUgM0Qgdmlld3BvcnQgc3RheXMgZW1wdHkuXG5cbmNvbnN0IFNUQUdFX1cgPSAzODA7XG5jb25zdCBTVEFHRV9IID0gMjQwO1xuY29uc3QgQk9YID0gNzI7XG5cbmNvbnN0IGNsYW1wID0gKHY6IG51bWJlciwgbG86IG51bWJlciwgaGk6IG51bWJlcikgPT5cbiAgTWF0aC5tYXgobG8sIE1hdGgubWluKGhpLCB2KSk7XG5cbnR5cGUgTG9nTGluZSA9IHsgaWQ6IG51bWJlcjsgdGV4dDogc3RyaW5nIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnRlcmFjdGlvbnNEZW1vKCkge1xuICBjb25zdCBbcG9zLCBzZXRQb3NdID0gdXNlU3RhdGUoe1xuICAgIGxlZnQ6IChTVEFHRV9XIC0gQk9YKSAvIDIsXG4gICAgdG9wOiAoU1RBR0VfSCAtIEJPWCkgLyAyLFxuICB9KTtcbiAgY29uc3QgW3ByZXNzZWQsIHNldFByZXNzZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbbGFzdCwgc2V0TGFzdF0gPSB1c2VTdGF0ZShcIi1cIik7XG4gIGNvbnN0IFtsb2csIHNldExvZ10gPSB1c2VTdGF0ZTxMb2dMaW5lW10+KFtdKTtcblxuICAvLyBDdXJzb3IgcG9zaXRpb24gYXQgdGhlIHByZXZpb3VzIGRyYWcgZnJhbWUsIHNvIHdlIG1vdmUgdGhlIGJveCBieSB0aGUgZGVsdGEuXG4gIGNvbnN0IGxhc3RDbGllbnQgPSB1c2VSZWYoeyB4OiAwLCB5OiAwIH0pO1xuICBjb25zdCBsaW5lSWQgPSB1c2VSZWYoMCk7XG5cbiAgY29uc3QgcmVjb3JkID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgIHNldExhc3QodGV4dCk7XG4gICAgc2V0TG9nKChwcmV2KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gW3sgaWQ6IGxpbmVJZC5jdXJyZW50KyssIHRleHQgfSwgLi4ucHJldl07XG4gICAgICByZXR1cm4gbmV4dC5zbGljZSgwLCA2KTtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBmbXQgPSAoZTogUG9pbnRlckV2ZW50RGF0YSkgPT5cbiAgICBgeD0ke2UueC50b0ZpeGVkKDIpfSB5PSR7ZS55LnRvRml4ZWQoMil9IHwgY2xpZW50PSgke01hdGgucm91bmQoXG4gICAgICBlLmNsaWVudFgsXG4gICAgKX0sICR7TWF0aC5yb3VuZChlLmNsaWVudFkpfSlgO1xuXG4gIGNvbnN0IG9uUG9pbnRlckRvd24gPSAoZTogUG9pbnRlckV2ZW50RGF0YSkgPT4ge1xuICAgIGxhc3RDbGllbnQuY3VycmVudCA9IHsgeDogZS5jbGllbnRYLCB5OiBlLmNsaWVudFkgfTtcbiAgICBzZXRQcmVzc2VkKHRydWUpO1xuICAgIHJlY29yZChgcG9pbnRlckRvd24gICR7Zm10KGUpfWApO1xuICB9O1xuXG4gIGNvbnN0IG9uUG9pbnRlck1vdmUgPSAoZTogUG9pbnRlckV2ZW50RGF0YSkgPT4ge1xuICAgIGNvbnN0IGR4ID0gZS5jbGllbnRYIC0gbGFzdENsaWVudC5jdXJyZW50Lng7XG4gICAgY29uc3QgZHkgPSBlLmNsaWVudFkgLSBsYXN0Q2xpZW50LmN1cnJlbnQueTtcbiAgICBsYXN0Q2xpZW50LmN1cnJlbnQgPSB7IHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH07XG4gICAgc2V0UG9zKChwKSA9PiAoe1xuICAgICAgbGVmdDogY2xhbXAocC5sZWZ0ICsgZHgsIDAsIFNUQUdFX1cgLSBCT1gpLFxuICAgICAgdG9wOiBjbGFtcChwLnRvcCArIGR5LCAwLCBTVEFHRV9IIC0gQk9YKSxcbiAgICB9KSk7XG4gICAgcmVjb3JkKGBwb2ludGVyTW92ZSAgJHtmbXQoZSl9YCk7XG4gIH07XG5cbiAgY29uc3Qgb25Qb2ludGVyVXAgPSAoZTogUG9pbnRlckV2ZW50RGF0YSkgPT4ge1xuICAgIHNldFByZXNzZWQoZmFsc2UpO1xuICAgIHJlY29yZChgcG9pbnRlclVwICAke2ZtdChlKX1gKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxFeGFtcGxlXG4gICAgICBkZXNjcmlwdGlvbj1cIlJhdyBwb2ludGVyIGV2ZW50cyB0aGUgYnJpZGdlIHJlcG9ydHMuIEdyYWIgdGhlIGJveCBhbmQgZHJhZyBpdCBhcm91bmQgdGhlIHN0YWdlLlwiXG4gICAgICB0c3g9e1RZUEVTQ1JJUFR9XG4gICAgPlxuICAgICAgPG5vZGUgc3R5bGU9e3N0YWdlU3R5bGV9PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5ib3hTdHlsZSxcbiAgICAgICAgICAgIGxlZnQ6IHBvcy5sZWZ0LFxuICAgICAgICAgICAgdG9wOiBwb3MudG9wLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBwcmVzc2VkID8gQ29sb3JzLnB1cnBsZTEwMCA6IENvbG9ycy5wcmltYXJ5MTAwLFxuICAgICAgICAgIH19XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gcmVjb3JkKFwiY2xpY2tcIil9XG4gICAgICAgICAgb25Qb2ludGVyRG93bj17b25Qb2ludGVyRG93bn1cbiAgICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICAgIG9uUG9pbnRlclVwPXtvblBvaW50ZXJVcH1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXtib3hMYWJlbFN0eWxlfT5kcmFnPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgY29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxuICAgICAgICAgIGZvbnRTaXplOiBGb250U2l6ZXMuc20sXG4gICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtsYXN0fVxuICAgICAgPC90ZXh0PlxuXG4gICAgICA8bm9kZSBzdHlsZT17bG9nU3R5bGV9PlxuICAgICAgICB7bG9nLm1hcCgobCkgPT4gKFxuICAgICAgICAgIDx0ZXh0IGtleT17bC5pZH0gc3R5bGU9e2xvZ0xpbmVTdHlsZX0+XG4gICAgICAgICAgICB7bC50ZXh0fVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC9FeGFtcGxlPlxuICApO1xufVxuXG5jb25zdCBzdGFnZVN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiBTVEFHRV9XLFxuICBoZWlnaHQ6IFNUQUdFX0gsXG4gIHBvc2l0aW9uVHlwZTogXCJyZWxhdGl2ZVwiLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBib3JkZXJSYWRpdXM6IDEyLFxuICBib3JkZXI6IDEsXG4gIGJvcmRlckNvbG9yOiBDb2xvcnMuc3VyZmFjZTQwMCxcbiAgb3ZlcmZsb3dYOiBcImhpZGRlblwiLFxuICBvdmVyZmxvd1k6IFwiaGlkZGVuXCIsXG59O1xuXG5jb25zdCBib3hTdHlsZTogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgd2lkdGg6IEJPWCxcbiAgaGVpZ2h0OiBCT1gsXG4gIGJvcmRlclJhZGl1czogMTIsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxufTtcblxuY29uc3QgYm94TGFiZWxTdHlsZTogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjQwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG59O1xuXG5jb25zdCBsb2dTdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBhbGlnbkl0ZW1zOiBcInN0YXJ0XCIsXG4gIGdhcDogMixcbiAgd2lkdGg6IFNUQUdFX1csXG4gIGhlaWdodDogMTEwLFxufTtcblxuY29uc3QgbG9nTGluZVN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMzAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnhzLFxufTtcbiIsICJpbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IENhbnZhc0NvbnRleHQgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBFeGFtcGxlIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gQSBwdXJlLVVJIGRlbW8gb2YgdGhlIGA8Y2FudmFzPmAgaG9zdCBlbGVtZW50OiBhbiBhbnRpLWFsaWFzZWQgdmVjdG9yIGxpbmVcbi8vIGNoYXJ0IGRyYXduIGVudGlyZWx5IHdpdGggSFRNTC1jYW52YXMtc3R5bGUgY29tbWFuZHMgKGF4ZXMsIGdyaWRsaW5lcywgYVxuLy8gc21vb3RoIELDqXppZXIgY3VydmUsIGEgdHJhbnNsdWNlbnQgYXJlYSBmaWxsLCBhbmQgcG9pbnQgbWFya2VycykuIFRoZSBkYXRhXG4vLyByZXNodWZmbGVzIG9uIGl0cyBvd24gZXZlcnkgZmV3IHNlY29uZHMg4oCUIGFuZCBvbiBjbGljayDigJQgYW5pbWF0aW5nIHRvIHRoZSBuZXdcbi8vIHBvc2l0aW9uczsgZWFjaCBmcmFtZSByZS1yZW5kZXJzIFJlYWN0LCB3aGljaCByZXBhaW50cyB0aGUgdGV4dHVyZSBvbiB0aGUgQmV2eVxuLy8gc2lkZS4gTm8gM0Qgc2NlbmU6IHRoZSB2aWV3cG9ydCBzdGF5cyBlbXB0eS5cblxuY29uc3QgVyA9IDQ2MDtcbmNvbnN0IEggPSAyNjA7XG5jb25zdCBQQUQgPSAyODtcbmNvbnN0IFBPSU5UUyA9IDk7XG5jb25zdCBQRVJJT0RfTVMgPSAxNTAwOyAvLyBhdXRvLXNodWZmbGUgY2FkZW5jZVxuY29uc3QgRFVSQVRJT05fTVMgPSA1MDA7IC8vIHR3ZWVuIGxlbmd0aFxuY29uc3QgRlJBTUVfTVMgPSAxNjsgLy8gfjYwZnBzOyB0aGUgcnVudGltZSBoYXMgbm8gRGF0ZS5ub3csIHNvIHdlIGFjY3VtdWxhdGUgdGhpc1xuXG5jb25zdCBUWVBFU0NSSVBUID0gYDxjYW52YXNcbiAgZHJhdz17KGN0eCkgPT4ge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwiIzdhYTJmN1wiO1xuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKC8qIC4uLiAqLyk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICB9fVxuLz5gO1xuXG50eXBlIFB0ID0geyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuXG5jb25zdCByYW5kb21EYXRhID0gKG46IG51bWJlcik6IG51bWJlcltdID0+XG4gIEFycmF5LmZyb20oeyBsZW5ndGg6IG4gfSwgKCkgPT4gMC4xMiArIE1hdGgucmFuZG9tKCkgKiAwLjgpO1xuXG4vLyBlYXNlSW5PdXRDdWJpYyDigJQgYSBuYXR1cmFsIGFjY2VsZXJhdGlvbi9kZWNlbGVyYXRpb24gZm9yIHRoZSB0d2Vlbi5cbmNvbnN0IGVhc2VJbk91dCA9ICh0OiBudW1iZXIpOiBudW1iZXIgPT5cbiAgdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAxIC0gTWF0aC5wb3coLTIgKiB0ICsgMiwgMykgLyAyO1xuXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzRGVtbygpIHtcbiAgY29uc3QgW3ZhbHVlcywgc2V0VmFsdWVzXSA9IHVzZVN0YXRlPG51bWJlcltdPigoKSA9PiByYW5kb21EYXRhKFBPSU5UUykpO1xuICAvLyBMYXRlc3QgZGlzcGxheWVkIHZhbHVlcywgc28gYSB0d2VlbiBhbHdheXMgc3RhcnRzIGZyb20gd2hlcmUgd2UgYXJlIG5vd1xuICAvLyAoYSBtaWQtZmxpZ2h0IHJlc2h1ZmZsZSByZXRhcmdldHMgc21vb3RobHkpLlxuICBjb25zdCB2YWx1ZXNSZWYgPSB1c2VSZWYodmFsdWVzKTtcbiAgdmFsdWVzUmVmLmN1cnJlbnQgPSB2YWx1ZXM7XG4gIGNvbnN0IGZyYW1lUmVmID0gdXNlUmVmPFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+PigpO1xuICBjb25zdCBhbmltYXRlUmVmID0gdXNlUmVmPCh0YXJnZXQ6IG51bWJlcltdKSA9PiB2b2lkPigoKSA9PiB7fSk7XG5cbiAgLy8gT25lIGFuaW1hdGlvbiBsb29wIGZvciB0aGUgY29tcG9uZW50J3MgbGlmZXRpbWU6IGFuIGF1dG8tc2h1ZmZsZSBldmVyeVxuICAvLyBQRVJJT0RfTVMsIGVhY2ggdHdlZW5pbmcgdG8gaXRzIG5ldyBkYXRhIG92ZXIgRFVSQVRJT05fTVMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGFsaXZlID0gdHJ1ZTtcblxuICAgIGNvbnN0IGFuaW1hdGVUbyA9ICh0YXJnZXQ6IG51bWJlcltdKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQoZnJhbWVSZWYuY3VycmVudCk7XG4gICAgICBjb25zdCBmcm9tID0gdmFsdWVzUmVmLmN1cnJlbnQ7XG4gICAgICBsZXQgZWxhcHNlZCA9IDA7XG4gICAgICBjb25zdCBzdGVwID0gKCkgPT4ge1xuICAgICAgICBpZiAoIWFsaXZlKSByZXR1cm47XG4gICAgICAgIGVsYXBzZWQgKz0gRlJBTUVfTVM7XG4gICAgICAgIGNvbnN0IGUgPSBlYXNlSW5PdXQoTWF0aC5taW4oMSwgZWxhcHNlZCAvIERVUkFUSU9OX01TKSk7XG4gICAgICAgIHNldFZhbHVlcyhmcm9tLm1hcCgodiwgaSkgPT4gdiArICh0YXJnZXRbaV0gLSB2KSAqIGUpKTtcbiAgICAgICAgaWYgKGVsYXBzZWQgPCBEVVJBVElPTl9NUylcbiAgICAgICAgICBmcmFtZVJlZi5jdXJyZW50ID0gc2V0VGltZW91dChzdGVwLCBGUkFNRV9NUyk7XG4gICAgICB9O1xuICAgICAgc3RlcCgpO1xuICAgIH07XG4gICAgYW5pbWF0ZVJlZi5jdXJyZW50ID0gYW5pbWF0ZVRvO1xuXG4gICAgbGV0IGN5Y2xlOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PjtcbiAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgYW5pbWF0ZVRvKHJhbmRvbURhdGEoUE9JTlRTKSk7XG4gICAgICBjeWNsZSA9IHNldFRpbWVvdXQodGljaywgUEVSSU9EX01TKTtcbiAgICB9O1xuICAgIGN5Y2xlID0gc2V0VGltZW91dCh0aWNrLCBQRVJJT0RfTVMpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGFsaXZlID0gZmFsc2U7XG4gICAgICBjbGVhclRpbWVvdXQoZnJhbWVSZWYuY3VycmVudCk7XG4gICAgICBjbGVhclRpbWVvdXQoY3ljbGUpO1xuICAgIH07XG4gIH0sIFtdKTtcblxuICAvLyBSZXNodWZmbGUgaW1tZWRpYXRlbHkgKGNsaWNrKSwgYW5pbWF0aW5nIGZyb20gdGhlIGN1cnJlbnQgcG9zaXRpb25zLlxuICBjb25zdCBzaHVmZmxlID0gdXNlQ2FsbGJhY2soKCkgPT4gYW5pbWF0ZVJlZi5jdXJyZW50KHJhbmRvbURhdGEoUE9JTlRTKSksIFtdKTtcblxuICBjb25zdCBkcmF3ID0gKGN0eDogQ2FudmFzQ29udGV4dCkgPT4ge1xuICAgIC8vIEJhY2tncm91bmQgcGFuZWwuXG4gICAgY3R4LmZpbGxTdHlsZSA9IENvbG9ycy5zdXJmYWNlMTAwO1xuICAgIGN0eC5yZWN0KDAsIDAsIFcsIEgpO1xuICAgIGN0eC5maWxsKCk7XG5cbiAgICAvLyBIb3Jpem9udGFsIGdyaWRsaW5lcy5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBDb2xvcnMuc3VyZmFjZTQwMDtcbiAgICBjdHgubGluZVdpZHRoID0gMTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSA0OyBpKyspIHtcbiAgICAgIGNvbnN0IHkgPSBQQUQgKyAoKEggLSAyICogUEFEKSAqIGkpIC8gNDtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5tb3ZlVG8oUEFELCB5KTtcbiAgICAgIGN0eC5saW5lVG8oVyAtIFBBRCwgeSk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgLy8gTWFwIGRhdGEgdG8gY2FudmFzIHBvaW50cy5cbiAgICBjb25zdCBwdHM6IFB0W10gPSB2YWx1ZXMubWFwKCh2LCBpKSA9PiAoe1xuICAgICAgeDogUEFEICsgKChXIC0gMiAqIFBBRCkgKiBpKSAvICh2YWx1ZXMubGVuZ3RoIC0gMSksXG4gICAgICB5OiBIIC0gUEFEIC0gdiAqIChIIC0gMiAqIFBBRCksXG4gICAgfSkpO1xuXG4gICAgLy8gVHJhbnNsdWNlbnQgYXJlYSB1bmRlciB0aGUgc21vb3RoIGN1cnZlLlxuICAgIGN0eC5maWxsU3R5bGUgPSBDb2xvcnMucHJpbWFyeU92ZXJsYXk7XG4gICAgc21vb3RoUGF0aChjdHgsIHB0cyk7XG4gICAgY3R4LmxpbmVUbyhwdHNbcHRzLmxlbmd0aCAtIDFdLngsIEggLSBQQUQpO1xuICAgIGN0eC5saW5lVG8ocHRzWzBdLngsIEggLSBQQUQpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgLy8gVGhlIHNtb290aCBjdXJ2ZSBpdHNlbGYuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gQ29sb3JzLnByaW1hcnkxMDA7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDM7XG4gICAgc21vb3RoUGF0aChjdHgsIHB0cyk7XG4gICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgLy8gUG9pbnQgbWFya2Vycy5cbiAgICBjdHguZmlsbFN0eWxlID0gQ29sb3JzLnB1cnBsZTEwMDtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcHRzKSB7XG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICBjdHguYXJjKHAueCwgcC55LCA0LCAwLCBNYXRoLlBJICogMik7XG4gICAgICBjdHguZmlsbCgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxFeGFtcGxlIGRlc2NyaXB0aW9uPVwiQW4gaW1tZWRpYXRlLW1vZGUgcmFzdGVyIHN1cmZhY2UuXCIgdHN4PXtUWVBFU0NSSVBUfT5cbiAgICAgIDxjYW52YXMgc3R5bGU9e2NhbnZhc1N0eWxlfSBkcmF3PXtkcmF3fSBvbkNsaWNrPXtzaHVmZmxlfSAvPlxuICAgIDwvRXhhbXBsZT5cbiAgKTtcbn1cblxuLy8gQnVpbGQgYSBDYXRtdWxsLVJvbSBzcGxpbmUgdGhyb3VnaCBgcHRzYCBhcyBjdWJpYyBCw6l6aWVycyDigJQgYSBzbW9vdGggY3VydmVcbi8vIHRoYXQgcGFzc2VzIHRocm91Z2ggZXZlcnkgcG9pbnQuIEJlZ2lucyBhIGZyZXNoIHBhdGggYXQgdGhlIGZpcnN0IHBvaW50LlxuZnVuY3Rpb24gc21vb3RoUGF0aChjdHg6IENhbnZhc0NvbnRleHQsIHB0czogUHRbXSkge1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8ocHRzWzBdLngsIHB0c1swXS55KTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwdHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgY29uc3QgcDAgPSBwdHNbaSAtIDFdID8/IHB0c1tpXTtcbiAgICBjb25zdCBwMSA9IHB0c1tpXTtcbiAgICBjb25zdCBwMiA9IHB0c1tpICsgMV07XG4gICAgY29uc3QgcDMgPSBwdHNbaSArIDJdID8/IHAyO1xuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKFxuICAgICAgcDEueCArIChwMi54IC0gcDAueCkgLyA2LFxuICAgICAgcDEueSArIChwMi55IC0gcDAueSkgLyA2LFxuICAgICAgcDIueCAtIChwMy54IC0gcDEueCkgLyA2LFxuICAgICAgcDIueSAtIChwMy55IC0gcDEueSkgLyA2LFxuICAgICAgcDIueCxcbiAgICAgIHAyLnksXG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCBjYW52YXNTdHlsZTogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogVyxcbiAgaGVpZ2h0OiBILFxuICBib3JkZXJSYWRpdXM6IDEyLFxuICBib3JkZXI6IDEsXG4gIGJvcmRlckNvbG9yOiBDb2xvcnMuc3VyZmFjZTQwMCxcbn07XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIkAvYmV2eVwiO1xuaW1wb3J0IHsgQnV0dG9uLCBDaGVja2JveCwgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gQSBkZW1vIG9mIHRoZSBgPHBvcnRhbD5gIGhvc3QgZWxlbWVudDogYSBVSSByZWN0YW5nbGUgdGhhdCBzaG93cyBhbiBvZmZzY3JlZW5cbi8vIEJldnkgcmVuZGVyIHRhcmdldCAocmVuZGVyLXRvLXRleHR1cmUpLiBUd28gY2FtZXJhcyBpbiB0aGUgQ3Jvd2RlZEN1YmVzIHNjZW5lXG4vLyBkcmF3IGludG8gbmFtZWQgdGFyZ2V0cyDigJQgYSAzRCBjaGFzZSBjYW0gKFwiZm9sbG93XCIpIGFuZCBhIDJEIG1pbmltYXAg4oCUIGFuZCBlYWNoXG4vLyBgPHBvcnRhbD5gIGRpc3BsYXlzIG9uZS4gVGhlIGZvbGxvdyBjYW0gY2FuIHJlbmRlciBsaXZlIG9yIGFzIGEgZnJvemVuIHNuYXBzaG90LlxuXG5jb25zdCBUWVBFU0NSSVBUID0gYDxwb3J0YWwgdGFyZ2V0PVwibWluaW1hcFwiIHN0eWxlPXtcbiAgeyB3aWR0aDogMTYwLCBoZWlnaHQ6IDE2MCB9XG59IC8+YDtcblxuY29uc3QgUlVTVCA9IGBsZXQgbWluaW1hcCA9IHJlbmRlcl90YXJnZXRzLmNyZWF0ZShcbiAgICAmbXV0IGltYWdlcyxcbiAgICBcIm1pbmltYXBcIixcbiAgICBSZW5kZXJUYXJnZXRTcGVjIHtcbiAgICAgICAgbW9kZTogUmVuZGVyTW9kZTo6U25hcHNob3QsXG4gICAgICAgIC4uZGVmYXVsdCgpXG4gICAgfSxcbik7XG5cbmNvbW1hbmRzLnNwYXduKChcbiAgICBDYW1lcmEzZDo6ZGVmYXVsdCgpLFxuICAgIG1pbmltYXAuY2FtZXJhX3RhcmdldCgpLFxuICAgIFBvcnRhbENhbWVyYShcIm1pbmltYXBcIi5pbnRvKCkpLFxuKSk7YDtcblxuZXhwb3J0IGZ1bmN0aW9uIFBvcnRhbERlbW8oKSB7XG4gIGNvbnN0IFtjb250aW51b3VzLCBzZXRDb250aW51b3VzXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gIC8vIEtlZXAgQmV2eSdzIFwiZm9sbG93XCIgcmVuZGVyIG1vZGUgaW4gc3luYyB3aXRoIHRoZSBjaGVja2JveC4gV2UgZW1pdCBvbiBldmVyeVxuICAvLyBjaGFuZ2UgQU5EIHJlLWVtaXQgd2hlbmV2ZXIgdGhlIHNjZW5lIChyZSlzcGF3bnMgaXRzIHRhcmdldHM6IHRoZSBcImZvbGxvd1wiXG4gIC8vIHRhcmdldCBpcyBjcmVhdGVkIChpbiBTbmFwc2hvdCBtb2RlKSBvbmx5IHdoZW4gdGhlIENyb3dkZWRDdWJlcyBzY2VuZSdzXG4gIC8vIE9uRW50ZXIgcnVucywgd2hpY2ggaXMgKmFmdGVyKiB0aGlzIGNvbXBvbmVudCdzIGZpcnN0IHJlbmRlciDigJQgc28gYSBtb3VudC10aW1lXG4gIC8vIGVtaXQgYWxvbmUgd291bGQgaGl0IGEgbm90LXlldC1yZWdpc3RlcmVkIHRhcmdldCBhbmQgYmUgZHJvcHBlZCwgbGVhdmluZyB0aGVcbiAgLy8gaW5pdGlhbCBcImNvbnRpbnVvdXNcIiBzdGF0ZSBpZ25vcmVkIHVudGlsIHRoZSBib3ggd2FzIHRvZ2dsZWQuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYmV2eS5jcm93ZGVkQ3ViZXMuc2V0Rm9sbG93TW9kZShjb250aW51b3VzKTtcbiAgICByZXR1cm4gYmV2eS5vbihcImNyb3dkZWRDdWJlcy5zcGF3bmVkXCIsICgpID0+XG4gICAgICBiZXZ5LmNyb3dkZWRDdWJlcy5zZXRGb2xsb3dNb2RlKGNvbnRpbnVvdXMpLFxuICAgICk7XG4gIH0sIFtjb250aW51b3VzXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8RXhhbXBsZVxuICAgICAgZGVzY3JpcHRpb249XCJBIHZpZXcgb2YgYW4gb2Zmc2NyZWVuIEJldnkgY2FtZXJhLCByZW5kZXJlZCB0byBhIHRleHR1cmUgYW5kIHNob3duIGluIHRoZSBVSS5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgICAgcnVzdD17UlVTVH1cbiAgICA+XG4gICAgICA8bm9kZSBzdHlsZT17cm93fT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e2NvbHVtbn0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e2xhYmVsfT5Gb2xsb3cgY2FtPC90ZXh0PlxuICAgICAgICAgIDxwb3J0YWwgdGFyZ2V0PVwiZm9sbG93XCIgc3R5bGU9e2ZvbGxvd1ZpZXd9IC8+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBiZXZ5LmNyb3dkZWRDdWJlcy5mb2xsb3dSYW5kb20obnVsbCl9PlxuICAgICAgICAgICAgUGljayBhbm90aGVyIGN1YmVcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgIGxhYmVsPVwiQ29udGludW91c1wiXG4gICAgICAgICAgICBlbmFibGVkPXtjb250aW51b3VzfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3NldENvbnRpbnVvdXN9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuXG4gICAgICAgIDxub2RlIHN0eWxlPXtjb2x1bW59PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXtsYWJlbH0+TWluaW1hcDwvdGV4dD5cbiAgICAgICAgICA8cG9ydGFsIHRhcmdldD1cIm1pbmltYXBcIiBzdHlsZT17bWluaW1hcFZpZXd9IC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L0V4YW1wbGU+XG4gICk7XG59XG5cbmNvbnN0IHJvdzogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBhbGlnbkl0ZW1zOiBcImZsZXhTdGFydFwiLFxuICBnYXA6IDE2LFxufTtcblxuY29uc3QgY29sdW1uOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGdhcDogOCxcbn07XG5cbmNvbnN0IGxhYmVsOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMjAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnNtLFxuICBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsXG59O1xuXG5jb25zdCBmb2xsb3dWaWV3OiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiAxNjAsXG4gIGhlaWdodDogMTYwLFxuICBib3JkZXJSYWRpdXM6IDgsXG4gIGJvcmRlcjogMixcbiAgYm9yZGVyQ29sb3I6IENvbG9ycy5zdXJmYWNlNTAwLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxufTtcblxuY29uc3QgbWluaW1hcFZpZXc6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDE2MCxcbiAgaGVpZ2h0OiAxNjAsXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYm9yZGVyOiAyLFxuICBib3JkZXJDb2xvcjogQ29sb3JzLnN1cmZhY2U1MDAsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG59O1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCJAL2JldnlcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBEZXNrdG9wIH0gZnJvbSBcIi4vRGVza3RvcFwiO1xuaW1wb3J0IHsgQm9vdFNjcmVlbiB9IGZyb20gXCIuL0Jvb3RTY3JlZW5cIjtcblxuLy8gVGhlIHJlYm9vdCBwb3dlci1jeWNsZTogYG9mZmAgPSBzY3JlZW4gY29sbGFwc2VkIHRvIGJsYWNrLCBgYm9vdGAgPSBwb3dlcmluZyBiYWNrXG4vLyBvbiB3aGlsZSB0aGUgYnJhbmQgdHlwZXMgb3V0LCBgYm9vdGluZ2AgPSBwcm9ncmVzcyBiYXI7IGBudWxsYCA9IHJ1bm5pbmcgbm9ybWFsbHkuXG5leHBvcnQgdHlwZSBQaGFzZSA9IFwib2ZmXCIgfCBcImJvb3RcIiB8IFwiYm9vdGluZ1wiO1xuXG4vKiogQ1JUIHBvd2VyLW9uL29mZiB0cmFuc2l0aW9uIHRpbWUgKG1zKSBhbmQgaG93IGxvbmcgdG8gaG9sZCBibGFjayBhZnRlciBjb2xsYXBzZS4gKi9cbmNvbnN0IFBPV0VSX01TID0gNDIwO1xuY29uc3QgQkxBQ0tfSE9MRF9NUyA9IDIwMDA7XG4vKiogQmVhdCBhZnRlciB0aGUgc2NyZWVuIHBvd2VycyBiYWNrIG9uIGJlZm9yZSB0aGUgYnJhbmQgc3RhcnRzIHR5cGluZy4gKi9cbmNvbnN0IFRJVExFX0RFTEFZX01TID0gMTUwMDtcblxuLyoqIFRoZSBsaXR0bGUgT1MgdGhhdCBsaXZlcyBvbiB0aGUgbW9uaXRvcidzIHNjcmVlbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNb25pdG9yQXBwKCkge1xuICBjb25zdCBbcGhhc2UsIHNldFBoYXNlXSA9IHVzZVN0YXRlPFBoYXNlIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtjcnQsIHNldENydF0gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICAvLyBEcml2ZSB0aGUgQmV2eS1zaWRlIENSVCBtYXRlcmlhbCB0b2dnbGUuIEFuIGVmZmVjdCAobm90IGp1c3QgdGhlIGNsaWNrIGhhbmRsZXIpXG4gIC8vIGtlZXBzIHRoZSBFQ1MgaW4gc3luYyBvbiBmaXJzdCBtb3VudCBhbmQgb24gc2NlbmUgcmUtZW50cnkgLyBob3QgcmVsb2FkLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGJldnkuc3VyZmFjZURlbW8uc2V0Q3J0KGNydCk7XG4gIH0sIFtjcnRdKTtcblxuICAvLyBTdGFydCB0aGUgcmVib290OiBjb2xsYXBzZSB0byBibGFjayAodGhlIHdyYXBwZXIgYW5pbWF0ZXMgYmVjYXVzZSBgcG93ZXJlZGAgZmxpcHMpLlxuICBmdW5jdGlvbiBzdGFydFJlYm9vdCgpIHtcbiAgICBzZXRQaGFzZShcIm9mZlwiKTtcbiAgfVxuXG4gIC8vIGBvZmZgOiBhZnRlciB0aGUgcG93ZXItZG93biBhbmltYXRpb24gKyBhIGJlYXQgb2YgYmxhY2ssIHBvd2VyIGJhY2sgb24gaW50byBib290LlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwaGFzZSAhPT0gXCJvZmZcIikgcmV0dXJuO1xuICAgIGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHNldFBoYXNlKFwiYm9vdFwiKSwgUE9XRVJfTVMgKyBCTEFDS19IT0xEX01TKTtcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KHQpO1xuICB9LCBbcGhhc2VdKTtcblxuICAvLyBUaGUgc2NyZWVuIGlzIFwicG93ZXJlZFwiICh2aXNpYmxlKSBleGNlcHQgd2hpbGUgY29sbGFwc2VkIHRvIGJsYWNrLlxuICBjb25zdCBwb3dlcmVkID0gcGhhc2UgIT09IFwib2ZmXCI7XG4gIGNvbnN0IGJvb3RpbmcgPSBwaGFzZSA9PT0gXCJib290XCIgfHwgcGhhc2UgPT09IFwiYm9vdGluZ1wiO1xuXG4gIC8vIEEgc2luZ2xlIHBlcnNpc3RlbnQgd3JhcHBlciBjYXJyaWVzIHRoZSBwb3dlci1vbi9vZmYgYW5pbWF0aW9uOiBrZWVwaW5nIGl0XG4gIC8vIG1vdW50ZWQgYWNyb3NzIGV2ZXJ5IHBoYXNlIGlzIHdoYXQgbGV0cyB0aGUgc2NhbGUvb3BhY2l0eSB0cmFuc2l0aW9uIHJ1bi5cbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4ucG93ZXJXcmFwLFxuICAgICAgICBvcGFjaXR5OiBwb3dlcmVkID8gMSA6IDAsXG4gICAgICAgIHRyYW5zZm9ybTogeyBzY2FsZTogcG93ZXJlZCA/IDEgOiAwIH0sXG4gICAgICAgIHRyYW5zaXRpb246IHtcbiAgICAgICAgICBvcGFjaXR5OiB7IGR1cmF0aW9uOiBQT1dFUl9NUyB9LFxuICAgICAgICAgIHRyYW5zZm9ybTogeyBkdXJhdGlvbjogUE9XRVJfTVMsIGVhc2luZzogXCJlYXNlSW5PdXRcIiB9LFxuICAgICAgICB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Ym9vdGluZyA/IChcbiAgICAgICAgPEJvb3RTY3JlZW5cbiAgICAgICAgICBwaGFzZT17cGhhc2V9XG4gICAgICAgICAgdGl0bGVEZWxheT17VElUTEVfREVMQVlfTVN9XG4gICAgICAgICAgb25UaXRsZURvbmU9eygpID0+IHNldFRpbWVvdXQoKCkgPT4gc2V0UGhhc2UoXCJib290aW5nXCIpLCAxMDAwKX1cbiAgICAgICAgICBvbkJvb3REb25lPXsoKSA9PiBzZXRQaGFzZShudWxsKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxEZXNrdG9wIGNydD17Y3J0fSBzZXRDcnQ9e3NldENydH0gb25SZWJvb3Q9e3N0YXJ0UmVib290fSAvPlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8vIFRoZSB3aG9sZSB2aXNpYmxlIHNjcmVlbi4gQ2FycmllcyB0aGUgc2NyZWVuIGJhY2tncm91bmQgYW5kIHNjYWxlcy9mYWRlcyBhcyBvbmVcbi8vIGR1cmluZyB0aGUgcmVib290IHBvd2VyLWN5Y2xlLlxuY29uc3QgcG93ZXJXcmFwOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiBcIjEwMCVcIixcbiAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTIwMCxcbn07XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBDb2xvcnMsIEZvbnRTaXplcyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBNZW51QmFyLCBNZW51SWQgfSBmcm9tIFwiLi9NZW51QmFyXCI7XG5pbXBvcnQgeyBUYXNrYmFyIH0gZnJvbSBcIi4vVGFza2JhclwiO1xuaW1wb3J0IHsgSG9tZSB9IGZyb20gXCIuL0hvbWVcIjtcbmltcG9ydCB7IENvZGVWaWV3ZXIgfSBmcm9tIFwiLi9Db2RlVmlld2VyXCI7XG5pbXBvcnQgeyBBYm91dERpYWxvZyB9IGZyb20gXCIuL0Fib3V0RGlhbG9nXCI7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNydDogYm9vbGVhbjtcbiAgc2V0Q3J0OiAodjogYm9vbGVhbikgPT4gdm9pZDtcbiAgb25SZWJvb3Q6ICgpID0+IHZvaWQ7XG59O1xuXG50eXBlIE9wZW5NZW51ID0gTWVudUlkIHwgXCJzdGFydFwiIHwgbnVsbDtcblxuLyoqIFRoZSBydW5uaW5nIGRlc2t0b3Agc2hlbGw6IG1lbnUgYmFyLCB3aW5kb3cgYm9keSwgc3RhdHVzIGJhciwgdGFza2JhciwgZGlhbG9ncy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEZXNrdG9wKHsgY3J0LCBzZXRDcnQsIG9uUmVib290IH06IFByb3BzKSB7XG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IHVzZVN0YXRlPFwiaG9tZVwiIHwgXCJjb2RlXCI+KFwiaG9tZVwiKTtcbiAgY29uc3QgW29wZW5NZW51LCBzZXRPcGVuTWVudV0gPSB1c2VTdGF0ZTxPcGVuTWVudT4obnVsbCk7XG4gIGNvbnN0IFthYm91dE9wZW4sIHNldEFib3V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgY29uc3QgdG9nZ2xlID0gKGlkOiBPcGVuTWVudSkgPT5cbiAgICBzZXRPcGVuTWVudSgoY3VyKSA9PiAoY3VyID09PSBpZCA/IG51bGwgOiBpZCkpO1xuICBjb25zdCBjbG9zZSA9ICgpID0+IHNldE9wZW5NZW51KG51bGwpO1xuXG4gIGNvbnN0IHNob3dTb3VyY2UgPSAoKSA9PiB7XG4gICAgc2V0VmlldygodikgPT4gKHYgPT09IFwiY29kZVwiID8gXCJob21lXCIgOiBcImNvZGVcIikpO1xuICAgIGNsb3NlKCk7XG4gIH07XG4gIGNvbnN0IHJlYm9vdCA9ICgpID0+IHtcbiAgICBvblJlYm9vdCgpO1xuICAgIGNsb3NlKCk7XG4gIH07XG4gIGNvbnN0IHRvZ2dsZUNydCA9ICgpID0+IHtcbiAgICBzZXRDcnQoIWNydCk7XG4gICAgY2xvc2UoKTtcbiAgfTtcbiAgY29uc3QgYWJvdXQgPSAoKSA9PiB7XG4gICAgc2V0QWJvdXRPcGVuKHRydWUpO1xuICAgIGNsb3NlKCk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17ZGVza3RvcH0+XG4gICAgICA8bm9kZSBzdHlsZT17bWVudUxheWVyfT5cbiAgICAgICAgPE1lbnVCYXJcbiAgICAgICAgICBvcGVuPXtvcGVuTWVudX1cbiAgICAgICAgICBvblRvZ2dsZT17dG9nZ2xlfVxuICAgICAgICAgIHZpZXc9e3ZpZXd9XG4gICAgICAgICAgY3J0PXtjcnR9XG4gICAgICAgICAgb25Tb3VyY2U9e3Nob3dTb3VyY2V9XG4gICAgICAgICAgb25SZWJvb3Q9e3JlYm9vdH1cbiAgICAgICAgICBvblRvZ2dsZUNydD17dG9nZ2xlQ3J0fVxuICAgICAgICAgIG9uQWJvdXQ9e2Fib3V0fVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8bm9kZSBzdHlsZT17Ym9keVdyYXB9PlxuICAgICAgICB7dmlldyA9PT0gXCJjb2RlXCIgPyA8Q29kZVZpZXdlciAvPiA6IDxIb21lIGNydD17Y3J0fSBzZXRDcnQ9e3NldENydH0gLz59XG4gICAgICA8L25vZGU+XG5cbiAgICAgIDxub2RlIHN0eWxlPXtzdGF0dXNCYXJ9PlxuICAgICAgICA8dGV4dCBzdHlsZT17c3RhdHVzVGV4dH0+XG4gICAgICAgICAge3ZpZXcgPT09IFwiY29kZVwiID8gXCJWaWV3aW5nIHNvdXJjZVwiIDogXCJSZWFkeVwifVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXtzdGF0dXNUZXh0fT57Y3J0ID8gXCJDUlQ6IG9uXCIgOiBcIkNSVDogb2ZmXCJ9PC90ZXh0PlxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8bm9kZSBzdHlsZT17dGFza0xheWVyfT5cbiAgICAgICAgPFRhc2tiYXJcbiAgICAgICAgICBzdGFydE9wZW49e29wZW5NZW51ID09PSBcInN0YXJ0XCJ9XG4gICAgICAgICAgdmlldz17dmlld31cbiAgICAgICAgICBvblN0YXJ0PXsoKSA9PiB0b2dnbGUoXCJzdGFydFwiKX1cbiAgICAgICAgICBvblNvdXJjZT17c2hvd1NvdXJjZX1cbiAgICAgICAgICBvblJlYm9vdD17cmVib290fVxuICAgICAgICAgIG9uQWJvdXQ9e2Fib3V0fVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuXG4gICAgICB7b3Blbk1lbnUgIT09IG51bGwgPyA8YnV0dG9uIHN0eWxlPXtiYWNrZHJvcH0gb25DbGljaz17Y2xvc2V9IC8+IDogbnVsbH1cblxuICAgICAge2Fib3V0T3BlbiA/IDxBYm91dERpYWxvZyBvbkNsb3NlPXsoKSA9PiBzZXRBYm91dE9wZW4oZmFsc2UpfSAvPiA6IG51bGx9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBkZXNrdG9wOiBCZXZ5U3R5bGUgPSB7XG4gIHBvc2l0aW9uVHlwZTogXCJyZWxhdGl2ZVwiLFxuICB3aWR0aDogXCIxMDAlXCIsXG4gIGhlaWdodDogXCIxMDAlXCIsXG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG59O1xuXG4vLyBBYm92ZSB0aGUgYm9keSArIGJhY2tkcm9wIHNvIGRyb3Bkb3ducyBmbG9hdCBvdmVyIGV2ZXJ5dGhpbmcuXG5jb25zdCBtZW51TGF5ZXI6IEJldnlTdHlsZSA9IHsgekluZGV4OiAxMDAgfTtcbmNvbnN0IHRhc2tMYXllcjogQmV2eVN0eWxlID0geyB6SW5kZXg6IDEwMCB9O1xuXG5jb25zdCBib2R5V3JhcDogQmV2eVN0eWxlID0ge1xuICBmbGV4R3JvdzogMSxcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgekluZGV4OiAwLFxufTtcblxuY29uc3Qgc3RhdHVzQmFyOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICBwYWRkaW5nOiB7IHRvcDogNiwgYm90dG9tOiA2LCBsZWZ0OiAxNiwgcmlnaHQ6IDE2IH0sXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG4gIGJvcmRlckNvbG9yOiBDb2xvcnMuc3VyZmFjZTQwMCxcbiAgYm9yZGVyOiB7IHRvcDogMiwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogMCB9LFxufTtcblxuY29uc3Qgc3RhdHVzVGV4dDogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjMwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy54cyxcbiAgZm9udEZhbWlseTogXCJOb3RvIFNhbnMgTW9ub1wiLFxufTtcblxuLy8gQ2xpY2stY2F0Y2hlciB0aGF0IGNsb3NlcyBhbnkgb3BlbiBtZW51OyBzaXRzIGFib3ZlIHRoZSBib2R5LCBiZWxvdyB0aGUgbWVudXMuXG5jb25zdCBiYWNrZHJvcDogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgdG9wOiAwLFxuICBsZWZ0OiAwLFxuICByaWdodDogMCxcbiAgYm90dG9tOiAwLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy50cmFuc3BhcmVudCxcbiAgekluZGV4OiA1MCxcbn07XG4iLCAiaW1wb3J0IHsgUmVhY3ROb2RlLCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLyoqIFdyYXBzIGEgZmxvYXRpbmcgbWVudSBzbyBpdCBmYWRlcyArIHNsaWRlcyBpbiBvbiBvcGVuLiBNb3VudHMgaW4gdGhlIGNsb3NlZFxuICogIHN0YXRlLCB0aGVuIGZsaXBzIHRvIG9wZW4gb24gdGhlIG5leHQgZnJhbWUgc28gdGhlIHRyYW5zaXRpb24gaW50ZXJwb2xhdGVzO1xuICogIHRoZSB0cmFuc2l0aW9uIGlzIG9ubHkgYXR0YWNoZWQgb25jZSBvcGVuLCB0byBhdm9pZCBhbiBpbml0aWFsIGZsYXNoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBvcHVwKHtcbiAgc3R5bGUsXG4gIGZyb20gPSBcInRvcFwiLFxuICBjaGlsZHJlbixcbn06IHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIC8qKiBXaGljaCBlZGdlIGl0IGdyb3dzIGZyb20g4oCUIGRyb3Bkb3ducyBcInRvcFwiLCB0aGUgU3RhcnQgbWVudSBcImJvdHRvbVwiLiAqL1xuICBmcm9tPzogXCJ0b3BcIiB8IFwiYm90dG9tXCI7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG59KSB7XG4gIGNvbnN0IFtzaG93biwgc2V0U2hvd25dID0gdXNlU3RhdGUoZmFsc2UpO1xuICB1c2VFZmZlY3QoKCkgPT4gc2V0U2hvd24odHJ1ZSksIFtdKTtcbiAgY29uc3QgZHkgPSBmcm9tID09PSBcInRvcFwiID8gLTggOiA4O1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5zdHlsZSxcbiAgICAgICAgb3BhY2l0eTogc2hvd24gPyAxIDogMCxcbiAgICAgICAgdHJhbnNmb3JtOiB7IHNjYWxlOiBzaG93biA/IDEgOiAwLjk2LCB0cmFuc2xhdGVZOiBzaG93biA/IDAgOiBkeSB9LFxuICAgICAgICB0cmFuc2l0aW9uOiBzaG93blxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBvcGFjaXR5OiB7IGR1cmF0aW9uOiAxMjAgfSxcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiB7IGR1cmF0aW9uOiAxMzAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgIH19XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLy8gQSBzaW5nbGUgZHJvcGRvd24gbWVudSBpdGVtLiBgc2VwYXJhdG9yYCBkcmF3cyBhIGRpdmlkZXIgbGluZSBpbnN0ZWFkIG9mIGEgcm93O1xuLy8gYGNoZWNrZWRgIHNob3dzIGEg4pyTIHRvIHRoZSBsZWZ0IChmb3IgdG9nZ2xlcyBsaWtlIHRoZSBDUlQgZWZmZWN0KS5cbmV4cG9ydCB0eXBlIE1lbnVJdGVtID1cbiAgfCB7IHNlcGFyYXRvcjogdHJ1ZSB9XG4gIHwge1xuICAgICAgc2VwYXJhdG9yPzogZmFsc2U7XG4gICAgICBsYWJlbDogc3RyaW5nO1xuICAgICAgY2hlY2tlZD86IGJvb2xlYW47XG4gICAgICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xuICAgIH07XG5cbi8qKiBBIGZsb2F0aW5nIGxpc3Qgb2YgbWVudSBpdGVtcyDigJQgdXNlZCBieSBib3RoIHRoZSB0b3AgbWVudSBiYXIgYW5kIHRoZSBTdGFydCBtZW51LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1lbnVMaXN0KHsgaXRlbXMgfTogeyBpdGVtczogTWVudUl0ZW1bXSB9KSB7XG4gIGNvbnN0IFtmaXJzdFJlbmRlciwgc2V0Rmlyc3RSZW5kZXJdID0gdXNlU3RhdGUodHJ1ZSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldEZpcnN0UmVuZGVyKGZhbHNlKTtcbiAgICB9LCAxMDApO1xuICB9KTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IC4uLmxpc3QsIHRyYW5zZm9ybTogeyBzY2FsZVk6IGZpcnN0UmVuZGVyID8gMCA6IDEgfSB9fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgaWYgKFwic2VwYXJhdG9yXCIgaW4gaXRlbSAmJiBpdGVtLnNlcGFyYXRvcikge1xuICAgICAgICAgIHJldHVybiA8bm9kZSBrZXk9e2BzZXAtJHtpfWB9IHN0eWxlPXtzZXBhcmF0b3J9IC8+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAga2V5PXtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgc3R5bGU9e3Jvd31cbiAgICAgICAgICAgIGhvdmVyU3R5bGU9e3Jvd0hvdmVyfVxuICAgICAgICAgICAgb25DbGljaz17aXRlbS5vbkNsaWNrfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXtsYWJlbH0+e2l0ZW0ubGFiZWx9PC90ZXh0PlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBsaXN0OiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIG1pbldpZHRoOiAyMDAsXG4gIHBhZGRpbmc6IHsgdG9wOiA2LCBib3R0b206IDYsIGxlZnQ6IDYsIHJpZ2h0OiA2IH0sXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UzMDAsXG4gIGJvcmRlckNvbG9yOiBDb2xvcnMuc3VyZmFjZTUwMCxcbiAgYm9yZGVyOiAyLFxuICBib3JkZXJSYWRpdXM6IDEwLFxuICBnYXA6IDIsXG4gIHRyYW5zaXRpb246IHsgdHJhbnNmb3JtOiB7IGR1cmF0aW9uOiAxMDAgfSB9LFxufTtcblxuY29uc3Qgcm93OiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGdhcDogMTAsXG4gIHBhZGRpbmc6IHsgdG9wOiA4LCBib3R0b206IDgsIGxlZnQ6IDEwLCByaWdodDogMTggfSxcbiAgYm9yZGVyUmFkaXVzOiA3LFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy50cmFuc3BhcmVudCxcbn07XG5cbmNvbnN0IHJvd0hvdmVyOiBCZXZ5U3R5bGUgPSB7IGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkzMDAgfTtcblxuY29uc3QgY2hlY2s6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDE2LFxuICBjb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMuc20sXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcblxuY29uc3QgbGFiZWw6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMuYmFzZSxcbn07XG5cbmNvbnN0IHNlcGFyYXRvcjogQmV2eVN0eWxlID0ge1xuICBoZWlnaHQ6IDIsXG4gIG1hcmdpbjogeyB0b3A6IDQsIGJvdHRvbTogNCwgbGVmdDogNiwgcmlnaHQ6IDYgfSxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTUwMCxcbn07XG4iLCAiaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBUZXh0TW9ubyB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcbmltcG9ydCB7IE1lbnVJdGVtLCBNZW51TGlzdCwgUG9wdXAgfSBmcm9tIFwiLi9tZW51XCI7XG5cbmV4cG9ydCB0eXBlIE1lbnVJZCA9IFwic3lzdGVtXCIgfCBcInZpZXdcIiB8IFwiaGVscFwiO1xuXG50eXBlIFByb3BzID0ge1xuICBvcGVuOiBzdHJpbmcgfCBudWxsO1xuICBvblRvZ2dsZTogKGlkOiBNZW51SWQpID0+IHZvaWQ7XG4gIHZpZXc6IFwiaG9tZVwiIHwgXCJjb2RlXCI7XG4gIGNydDogYm9vbGVhbjtcbiAgb25Tb3VyY2U6ICgpID0+IHZvaWQ7XG4gIG9uUmVib290OiAoKSA9PiB2b2lkO1xuICBvblRvZ2dsZUNydDogKCkgPT4gdm9pZDtcbiAgb25BYm91dDogKCkgPT4gdm9pZDtcbn07XG5cbi8qKiBUaGUgd2luZG93J3MgdG9wIG1lbnUgYmFyIHdpdGggdGhyZWUgY2xpY2stdG8tb3BlbiBkcm9wZG93biBtZW51cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNZW51QmFyKHtcbiAgb3BlbixcbiAgb25Ub2dnbGUsXG4gIHZpZXcsXG4gIGNydCxcbiAgb25Tb3VyY2UsXG4gIG9uUmVib290LFxuICBvblRvZ2dsZUNydCxcbiAgb25BYm91dCxcbn06IFByb3BzKSB7XG4gIGNvbnN0IG1lbnVzOiB7IGlkOiBNZW51SWQ7IGxhYmVsOiBzdHJpbmc7IGl0ZW1zOiBNZW51SXRlbVtdIH1bXSA9IFtcbiAgICB7XG4gICAgICBpZDogXCJzeXN0ZW1cIixcbiAgICAgIGxhYmVsOiBcIlN5c3RlbVwiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiB2aWV3ID09PSBcImNvZGVcIiA/IFwiQ2xvc2UgU291cmNlXCIgOiBcIlZpZXcgU291cmNlXCIsXG4gICAgICAgICAgb25DbGljazogb25Tb3VyY2UsXG4gICAgICAgIH0sXG4gICAgICAgIHsgc2VwYXJhdG9yOiB0cnVlIH0sXG4gICAgICAgIHsgbGFiZWw6IFwiUmVib290XCIsIG9uQ2xpY2s6IG9uUmVib290IH0sXG4gICAgICAgIHsgbGFiZWw6IFwiQWJvdXQgYmV2eS1yZWFjdCBPU1wiLCBvbkNsaWNrOiBvbkFib3V0IH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IFwidmlld1wiLFxuICAgICAgbGFiZWw6IFwiVmlld1wiLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsYWJlbDogdmlldyA9PT0gXCJjb2RlXCIgPyBcIkhvbWVcIiA6IFwiU291cmNlIENvZGVcIiwgb25DbGljazogb25Tb3VyY2UgfSxcbiAgICAgICAgeyBsYWJlbDogXCJUb2dnbGUgQ1JUIEVmZmVjdFwiLCBjaGVja2VkOiBjcnQsIG9uQ2xpY2s6IG9uVG9nZ2xlQ3J0IH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6IFwiaGVscFwiLFxuICAgICAgbGFiZWw6IFwiSGVscFwiLFxuICAgICAgaXRlbXM6IFt7IGxhYmVsOiBcIkFib3V0IGJldnktcmVhY3QgT1NcIiwgb25DbGljazogb25BYm91dCB9XSxcbiAgICB9LFxuICBdO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2Jhcn0+XG4gICAgICA8bm9kZSBzdHlsZT17bWVudVJvd30+XG4gICAgICAgIHttZW51cy5tYXAoKG1lbnUpID0+IChcbiAgICAgICAgICA8bm9kZSBrZXk9e21lbnUuaWR9IHN0eWxlPXttZW51QW5jaG9yfT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgc3R5bGU9e29wZW4gPT09IG1lbnUuaWQgPyBtZW51TGFiZWxBY3RpdmUgOiBtZW51TGFiZWx9XG4gICAgICAgICAgICAgIGhvdmVyU3R5bGU9e21lbnVMYWJlbEhvdmVyfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRvZ2dsZShtZW51LmlkKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e21lbnVMYWJlbFRleHR9PnttZW51LmxhYmVsfTwvdGV4dD5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAge29wZW4gPT09IG1lbnUuaWQgPyAoXG4gICAgICAgICAgICAgIDxQb3B1cCBzdHlsZT17ZHJvcGRvd259IGZyb209XCJ0b3BcIj5cbiAgICAgICAgICAgICAgICA8TWVudUxpc3QgaXRlbXM9e21lbnUuaXRlbXN9IC8+XG4gICAgICAgICAgICAgIDwvUG9wdXA+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8VGV4dE1vbm8gc3R5bGU9e3RpdGxlfT5zdXJmYWNlOi8vbW9uaXRvcjwvVGV4dE1vbm8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBiYXI6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gIHBhZGRpbmc6IHsgdG9wOiAyMCwgcmlnaHQ6IDE4LCBib3R0b206IDYsIGxlZnQ6IDEwIH0sXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG4gIGJvcmRlckNvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgYm9yZGVyOiB7IHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMywgbGVmdDogMCB9LFxuICB3aWR0aDogXCIxMDAlXCIsXG59O1xuXG5jb25zdCBtZW51Um93OiBCZXZ5U3R5bGUgPSB7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMiB9O1xuXG4vLyBSZWxhdGl2ZSBzbyBpdHMgZHJvcGRvd24gY2FuIHBvc2l0aW9uIGl0c2VsZiBqdXN0IGJlbG93IHRoZSBsYWJlbC5cbmNvbnN0IG1lbnVBbmNob3I6IEJldnlTdHlsZSA9IHtcbiAgcG9zaXRpb25UeXBlOiBcInJlbGF0aXZlXCIsXG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG59O1xuXG5jb25zdCBtZW51TGFiZWw6IEJldnlTdHlsZSA9IHtcbiAgcGFkZGluZzogeyB0b3A6IDgsIGJvdHRvbTogOCwgbGVmdDogMTQsIHJpZ2h0OiAxNCB9LFxuICBib3JkZXJSYWRpdXM6IDcsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnRyYW5zcGFyZW50LFxufTtcblxuY29uc3QgbWVudUxhYmVsSG92ZXI6IEJldnlTdHlsZSA9IHsgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTMwMCB9O1xuXG5jb25zdCBtZW51TGFiZWxBY3RpdmU6IEJldnlTdHlsZSA9IHtcbiAgcGFkZGluZzogeyB0b3A6IDgsIGJvdHRvbTogOCwgbGVmdDogMTQsIHJpZ2h0OiAxNCB9LFxuICBib3JkZXJSYWRpdXM6IDcsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkzMDAsXG59O1xuXG5jb25zdCBtZW51TGFiZWxUZXh0OiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbn07XG5cbi8vIEZsb2F0cyBiZWxvdyB0aGUgbGFiZWwsIG9uIHRvcCBvZiB0aGUgYm9keSAodGhlIG1lbnUgYmFyIGNhcnJpZXMgYSBoaWdoIHpJbmRleCkuXG5jb25zdCBkcm9wZG93bjogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgdG9wOiBcIjEwMCVcIixcbiAgbGVmdDogMCxcbiAgbWFyZ2luOiB7IHRvcDogNiB9LFxufTtcblxuY29uc3QgdGl0bGU6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IFRleHRNb25vIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuaW1wb3J0IHsgTWVudUxpc3QsIFBvcHVwIH0gZnJvbSBcIi4vbWVudVwiO1xuXG50eXBlIFByb3BzID0ge1xuICBzdGFydE9wZW46IGJvb2xlYW47XG4gIHZpZXc6IFwiaG9tZVwiIHwgXCJjb2RlXCI7XG4gIG9uU3RhcnQ6ICgpID0+IHZvaWQ7XG4gIG9uU291cmNlOiAoKSA9PiB2b2lkO1xuICBvblJlYm9vdDogKCkgPT4gdm9pZDtcbiAgb25BYm91dDogKCkgPT4gdm9pZDtcbn07XG5cbi8qKiBUaGUgYm90dG9tIHRhc2tiYXI6IGEgU3RhcnQgYnV0dG9uIChvcGVucyBhIG1lbnUpIGFuZCBhIGxpdmUgY2xvY2suICovXG5leHBvcnQgZnVuY3Rpb24gVGFza2Jhcih7XG4gIHN0YXJ0T3BlbixcbiAgdmlldyxcbiAgb25TdGFydCxcbiAgb25Tb3VyY2UsXG4gIG9uUmVib290LFxuICBvbkFib3V0LFxufTogUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17YmFyfT5cbiAgICAgIDxub2RlIHN0eWxlPXtzdGFydEFuY2hvcn0+XG4gICAgICAgIHtzdGFydE9wZW4gPyAoXG4gICAgICAgICAgPFBvcHVwIHN0eWxlPXtzdGFydFBvcHVwfSBmcm9tPVwiYm90dG9tXCI+XG4gICAgICAgICAgICA8TWVudUxpc3RcbiAgICAgICAgICAgICAgaXRlbXM9e1tcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBsYWJlbDogdmlldyA9PT0gXCJjb2RlXCIgPyBcIkhvbWVcIiA6IFwiU291cmNlIENvZGVcIixcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6IG9uU291cmNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogXCJBYm91dFwiLCBvbkNsaWNrOiBvbkFib3V0IH0sXG4gICAgICAgICAgICAgICAgeyBzZXBhcmF0b3I6IHRydWUgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiBcIlJlYm9vdFwiLCBvbkNsaWNrOiBvblJlYm9vdCB9LFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L1BvcHVwPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHN0eWxlPXtzdGFydE9wZW4gPyBzdGFydEJ1dHRvbkFjdGl2ZSA6IHN0YXJ0QnV0dG9ufVxuICAgICAgICAgIGhvdmVyU3R5bGU9e3N0YXJ0QnV0dG9uSG92ZXJ9XG4gICAgICAgICAgb25DbGljaz17b25TdGFydH1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXtzdGFydFRleHR9PmJldnktcmVhY3Q8L3RleHQ+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8Q2xvY2sgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHRpY2tpbmcgSEg6TU0gQU0vUE0gY2xvY2suICovXG5mdW5jdGlvbiBDbG9jaygpIHtcbiAgY29uc3QgW25vdywgc2V0Tm93XSA9IHVzZVN0YXRlKGZvcm1hdFRpbWUpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCkgPT4gc2V0Tm93KGZvcm1hdFRpbWUoKSksIDEwMDApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGlkKTtcbiAgfSwgW10pO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjbG9ja30+XG4gICAgICA8VGV4dE1vbm8gc3R5bGU9e2Nsb2NrVGV4dH0+e25vd308L1RleHRNb25vPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VGltZSgpIHtcbiAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gIGxldCBoID0gZC5nZXRIb3VycygpO1xuICBjb25zdCBtID0gZC5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gIGNvbnN0IGFtcG0gPSBoID49IDEyID8gXCJQTVwiIDogXCJBTVwiO1xuICBoID0gaCAlIDEyIHx8IDEyO1xuICByZXR1cm4gYCR7aH06JHttfSAke2FtcG19YDtcbn1cblxuY29uc3QgYmFyOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICBwYWRkaW5nOiB7IHRvcDogNiwgcmlnaHQ6IDEwLCBib3R0b206IDIwLCBsZWZ0OiA4IH0sXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG4gIGJvcmRlckNvbG9yOiBDb2xvcnMuc3VyZmFjZTUwMCxcbiAgYm9yZGVyOiB7IHRvcDogMywgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogMCB9LFxuICB3aWR0aDogXCIxMDAlXCIsXG59O1xuXG5jb25zdCBzdGFydEFuY2hvcjogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwicmVsYXRpdmVcIixcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbn07XG5cbmNvbnN0IHN0YXJ0QnV0dG9uOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGdhcDogOCxcbiAgcGFkZGluZzogeyB0b3A6IDgsIGJvdHRvbTogOCwgbGVmdDogMTIsIHJpZ2h0OiAxNiB9LFxuICBib3JkZXJSYWRpdXM6IDgsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UzMDAsXG59O1xuXG5jb25zdCBzdGFydEJ1dHRvbkhvdmVyOiBCZXZ5U3R5bGUgPSB7IGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2U1MDAgfTtcblxuY29uc3Qgc3RhcnRCdXR0b25BY3RpdmU6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiA4LFxuICBwYWRkaW5nOiB7IHRvcDogOCwgYm90dG9tOiA4LCBsZWZ0OiAxMiwgcmlnaHQ6IDE2IH0sXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTMwMCxcbn07XG5cbmNvbnN0IHN0YXJ0VGV4dDogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5iYXNlLFxuICBmb250V2VpZ2h0OiBcImJvbGRcIixcbn07XG5cbi8vIEFuY2hvcmVkIGp1c3QgYWJvdmUgdGhlIFN0YXJ0IGJ1dHRvbi5cbmNvbnN0IHN0YXJ0UG9wdXA6IEJldnlTdHlsZSA9IHtcbiAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gIGJvdHRvbTogXCIxMDAlXCIsXG4gIGxlZnQ6IDAsXG4gIG1hcmdpbjogeyBib3R0b206IDggfSxcbn07XG5cbmNvbnN0IGNsb2NrOiBCZXZ5U3R5bGUgPSB7XG4gIHBhZGRpbmc6IHsgdG9wOiA2LCBib3R0b206IDYsIGxlZnQ6IDE0LCByaWdodDogMTQgfSxcbiAgYm9yZGVyUmFkaXVzOiA3LFxuICBib3JkZXJDb2xvcjogQ29sb3JzLnN1cmZhY2U1MDAsXG4gIGJvcmRlcjogMixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTIwMCxcbn07XG5cbmNvbnN0IGNsb2NrVGV4dDogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjIwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbn07XG4iLCAiaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBCdXR0b24sIENoZWNrYm94IH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG50eXBlIFByb3BzID0ge1xuICBjcnQ6IGJvb2xlYW47XG4gIHNldENydDogKHY6IGJvb2xlYW4pID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gSG9tZSh7IGNydCwgc2V0Q3J0IH06IFByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2hvbWV9PlxuICAgICAgPHRleHQgc3R5bGU9e2JyYW5kfT5iZXZ5LXJlYWN0IE9TPC90ZXh0PlxuICAgICAgPHRleHQgc3R5bGU9e2JyYW5kU3VifT5cbiAgICAgICAgYmV2eV91aSByZW5kZXJlZCB3aXRoIFJlYWN0LCBsaXZlIG9uIGEgM0Qgc2NyZWVuXG4gICAgICA8L3RleHQ+XG5cbiAgICAgIDxub2RlIHN0eWxlPXtjb250cm9sc30+XG4gICAgICAgIDxDaGVja2JveCBsYWJlbD1cIkNSVCBlZmZlY3RcIiBlbmFibGVkPXtjcnR9IG9uQ2hhbmdlPXtzZXRDcnR9IC8+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBob21lOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhHcm93OiAxLFxuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgZ2FwOiAxNCxcbn07XG5cbmNvbnN0IGJyYW5kOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnh4eGwsXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcblxuY29uc3QgYnJhbmRTdWI6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IyMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMubGcsXG59O1xuXG5jb25zdCBjb250cm9sczogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBnYXA6IDE0LFxuICBtYXJnaW46IHsgdG9wOiAxMCB9LFxufTtcbiIsICIvLyBUaGUgY29kZSBzYW1wbGVzIHNob3duIGluIHRoZSBtb25pdG9yIFwiT1NcIiBzb3VyY2Ugdmlld2VyLlxuXG5leHBvcnQgY29uc3QgVFNYID0gYDxzdXJmYWNlIG5hbWU9XCJtb25pdG9yXCI+XG4gIDxNb25pdG9yQXBwIC8+XG48L3N1cmZhY2U+YDtcblxuZXhwb3J0IGNvbnN0IFJVU1QgPSBgLy8gcmVnaXN0ZXIgdGhlIHN1cmZhY2Ug4oaSIEhhbmRsZTxJbWFnZT5cbmxldCBzY3JlZW4gPSBzdXJmYWNlcy5jcmVhdGUoXG4gICAgJm11dCBpbWFnZXMsIFwibW9uaXRvclwiLCBzcGVjLFxuKTtcbi8vIGRyYXBlIGl0IG9uIHRoZSBnbFRGIHNjcmVlbiBtZXNoIGFuZFxuLy8gbWFrZSBpdCBjbGlja2FibGUgaW4gM0Rcbm1hdGVyaWFsLmJhc2VfY29sb3JfdGV4dHVyZSA9IFNvbWUoc2NyZWVuKTtcbmNvbW1hbmRzLmVudGl0eShzY3JlZW5fbWVzaClcbiAgICAuaW5zZXJ0KFN1cmZhY2VQb2ludGVyKFwibW9uaXRvclwiLmludG8oKSkpO2A7XG4iLCAiaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBUZXh0TW9ubywgVHlwZXdyaXRlciB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcbmltcG9ydCB7IFJVU1QsIFRTWCB9IGZyb20gXCIuL3NvdXJjZVwiO1xuXG4vKiogVGhlIHNvdXJjZSB2aWV3ZXI6IHRoZSBzdXJmYWNlJ3Mgb3duIGNvZGUsIHJldmVhbGVkIHdpdGggdGhlIHR5cGV3cml0ZXIuICovXG5leHBvcnQgZnVuY3Rpb24gQ29kZVZpZXdlcigpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17Ym9keX0+XG4gICAgICA8VGV4dE1vbm8gc3R5bGU9e2hlYWRpbmd9PlNVUkZBQ0UuUlMg4oCUIHNvdXJjZTwvVGV4dE1vbm8+XG4gICAgICA8Q29kZUJsb2NrIGxhbmc9XCJydXN0XCIgY29kZT17UlVTVH0gLz5cbiAgICAgIDxDb2RlQmxvY2sgbGFuZz1cInRzeFwiIGNvZGU9e1RTWH0gLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIENvZGVCbG9jayh7IGxhbmcsIGNvZGUgfTogeyBsYW5nOiBzdHJpbmc7IGNvZGU6IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2Jsb2NrfT5cbiAgICAgIDxUZXh0TW9ubyBzdHlsZT17bGFuZ0xhYmVsfT57bGFuZ308L1RleHRNb25vPlxuICAgICAgPFR5cGV3cml0ZXIgc3R5bGU9e2NvZGVUZXh0fSB0ZXh0PXtjb2RlfSBjdXJzb3IgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IGJvZHk6IEJldnlTdHlsZSA9IHtcbiAgZmxleEdyb3c6IDEsXG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIGdhcDogMTQsXG4gIHBhZGRpbmc6IDI0LFxufTtcblxuY29uc3QgaGVhZGluZzogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjMwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG59O1xuXG5jb25zdCBibG9jazogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBib3JkZXJSYWRpdXM6IDgsXG4gIHBhZGRpbmc6IHsgdG9wOiAxMiwgcmlnaHQ6IDE2LCBib3R0b206IDE0LCBsZWZ0OiAxNiB9LFxufTtcblxuY29uc3QgbGFuZ0xhYmVsOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gIHBhZGRpbmc6IHsgYm90dG9tOiA2IH0sXG59O1xuXG5jb25zdCBjb2RlVGV4dDogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjEwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5iYXNlLFxuICBmb250RmFtaWx5OiBcIk5vdG8gU2FucyBNb25vXCIsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQnV0dG9uLCBUZXh0TW9ubyB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcblxuLyoqIEEgY2VudGVyZWQgXCJBYm91dFwiIGRpYWxvZyBvdmVyIGEgZGltbWluZyBzY3JpbTsgY2xvc2VzIG9uIE9LIG9yIHNjcmltIGNsaWNrLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFib3V0RGlhbG9nKHsgb25DbG9zZSB9OiB7IG9uQ2xvc2U6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBbZmlyc3RSZW5kZXIsIHNldEZpcnN0UmVuZGVyXSA9IHVzZVN0YXRlKHRydWUpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRGaXJzdFJlbmRlcihmYWxzZSk7XG4gICAgfSwgMTAwKTtcbiAgfSwgW10pO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgLi4uc2NyaW0sIHRyYW5zZm9ybTogeyBzY2FsZTogZmlyc3RSZW5kZXIgPyAwIDogMSB9IH19PlxuICAgICAgPG5vZGUgc3R5bGU9e3BhbmVsfT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3RpdGxlQmFyfT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17dGl0bGVUZXh0fT5BYm91dDwvdGV4dD5cbiAgICAgICAgICA8QnV0dG9uIGhvdmVyU3R5bGU9e2Nsb3NlQnV0dG9uSG92ZXJ9IG9uQ2xpY2s9e29uQ2xvc2V9PlxuICAgICAgICAgICAgw5dcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17cGFuZWxCb2R5fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17YnJhbmR9PmJldnktcmVhY3QgT1M8L3RleHQ+XG4gICAgICAgICAgPFRleHRNb25vIHN0eWxlPXt2ZXJzaW9ufT52ZXJzaW9uIDAuMSDCtyBzdXJmYWNlOi8vbW9uaXRvcjwvVGV4dE1vbm8+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e2JsdXJifT5cbiAgICAgICAgICAgIEEgUmVhY3QgVUkgcmVuZGVyZWQgaW50byBhbiBvZmZzY3JlZW4gdGV4dHVyZSBhbmQgZHJhcGVkIG92ZXIgYSAzRFxuICAgICAgICAgICAgbW9uaXRvciDigJQgY2xpY2thYmxlIGluLXdvcmxkLlxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e29uQ2xvc2V9Pk9LPC9CdXR0b24+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IHNjcmltOiBCZXZ5U3R5bGUgPSB7XG4gIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICB0b3A6IDAsXG4gIGxlZnQ6IDAsXG4gIHJpZ2h0OiAwLFxuICBib3R0b206IDAsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICB6SW5kZXg6IDIwMCxcbiAgdHJhbnNpdGlvbjogeyB0cmFuc2Zvcm06IHsgZHVyYXRpb246IDIwMCB9IH0sXG59O1xuXG5jb25zdCBwYW5lbDogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogXCI3MCVcIixcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYm9yZGVyUmFkaXVzOiAxMixcbiAgYm9yZGVyQ29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxuICBib3JkZXI6IDIsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UyMDAsXG59O1xuXG5jb25zdCB0aXRsZUJhcjogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgcGFkZGluZzogeyB0b3A6IDEwLCBib3R0b206IDEwLCBsZWZ0OiAxNiwgcmlnaHQ6IDEwIH0sXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkzMDAsXG4gIGJvcmRlclJhZGl1czogeyB0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMCwgbGVmdDogMCB9LFxufTtcblxuY29uc3QgdGl0bGVUZXh0OiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcblxuY29uc3QgY2xvc2VCdXR0b25Ib3ZlcjogQmV2eVN0eWxlID0geyBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5yZWQzMDAgfTtcblxuY29uc3QgcGFuZWxCb2R5OiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGdhcDogMTIsXG4gIHBhZGRpbmc6IHsgdG9wOiAyNCwgYm90dG9tOiAyNCwgbGVmdDogMjQsIHJpZ2h0OiAyNCB9LFxufTtcblxuY29uc3QgYnJhbmQ6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMueHhsLFxuICBmb250V2VpZ2h0OiBcImJvbGRcIixcbn07XG5cbmNvbnN0IHZlcnNpb246IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IzMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMuc20sXG59O1xuXG5jb25zdCBibHVyYjogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjIwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5iYXNlLFxuICB0ZXh0QWxpZ246IFwiY2VudGVyXCIsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgVGV4dE1vbm8sIFR5cGV3cml0ZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBDb2xvcnMsIEZvbnRTaXplcyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgdHlwZSB7IFBoYXNlIH0gZnJvbSBcIi4vTW9uaXRvckFwcFwiO1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuXG50eXBlIFByb3BzID0ge1xuICBwaGFzZTogUGhhc2UgfCBudWxsO1xuICAvKiogQmVhdCBiZWZvcmUgdGhlIGJyYW5kIHN0YXJ0cyB0eXBpbmcgb25jZSB0aGUgc2NyZWVuIHBvd2VycyBvbi4gKi9cbiAgdGl0bGVEZWxheTogbnVtYmVyO1xuICBvblRpdGxlRG9uZTogKCkgPT4gdm9pZDtcbiAgLyoqIEZpcmVkIG9uY2UgdGhlIHByb2dyZXNzIGJhciBoYXMgZmlsbGVkIOKAlCBib290IGlzIGNvbXBsZXRlLiAqL1xuICBvbkJvb3REb25lOiAoKSA9PiB2b2lkO1xufTtcblxuLyoqIFRoZSBwb3dlci1vbiBib290IHNjcmVlbjogdHlwZXMgdGhlIGJyYW5kLCB0aGVuIHNob3dzIGBib290aW5nLi4uYCArIGEgcHJvZ3Jlc3MgYmFyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJvb3RTY3JlZW4oe1xuICBwaGFzZSxcbiAgdGl0bGVEZWxheSxcbiAgb25UaXRsZURvbmUsXG4gIG9uQm9vdERvbmUsXG59OiBQcm9wcykge1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtib290U2NyZWVufT5cbiAgICAgIDxUeXBld3JpdGVyXG4gICAgICAgIHN0eWxlPXtib290QnJhbmR9XG4gICAgICAgIHRleHQ9XCJiZXZ5LXJlYWN0IE9TXCJcbiAgICAgICAgdGlja01zPXsxNTB9XG4gICAgICAgIHN0YXJ0RGVsYXk9e3RpdGxlRGVsYXl9XG4gICAgICAgIG9uRG9uZT17b25UaXRsZURvbmV9XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6IDIwMCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge3BoYXNlID09PSBcImJvb3RpbmdcIiAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxUZXh0TW9ubyBzdHlsZT17Ym9vdFN0YXR1c30+Ym9vdGluZy4uLjwvVGV4dE1vbm8+XG4gICAgICAgICAgICA8UHJvZ3Jlc3NCYXIgb25Eb25lPXtvbkJvb3REb25lfSAvPlxuICAgICAgICAgIDwvPlxuICAgICAgICApfVxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgU1RSSVBfQ09VTlQgPSAyMDtcbmNvbnN0IFNUUklQUyA9IEFycmF5KFNUUklQX0NPVU5UKS5maWxsKDApO1xuLyoqIFRpbWUgdG8gbGlnaHQgZWFjaCBzdHJpcCwgYW5kIGEgYmVhdCB0byBob2xkIHRoZSBmdWxsIGJhciBiZWZvcmUgZmluaXNoaW5nLiAqL1xuY29uc3QgU1RSSVBfTVMgPSAxNTA7XG5jb25zdCBGVUxMX0hPTERfTVMgPSA0MDA7XG5cbnR5cGUgUHJvZ3Jlc3NCYXJQcm9wcyA9IHtcbiAgb25Eb25lOiAoKSA9PiB2b2lkO1xufTtcblxuZnVuY3Rpb24gUHJvZ3Jlc3NCYXIoeyBvbkRvbmUgfTogUHJvZ3Jlc3NCYXJQcm9wcykge1xuICBjb25zdCBbcHJvZ3Jlc3MsIHNldFByb2dyZXNzXSA9IHVzZVN0YXRlKDApO1xuXG4gIC8vIExpZ2h0IG9uZSBtb3JlIHN0cmlwIGV2ZXJ5IHRpY2s7IG9uY2UgZnVsbCwgaG9sZCBhIGJlYXQgdGhlbiBzaWduYWwgZG9uZS5cbiAgLy8gS2V5ZWQgb24gYHByb2dyZXNzYCBzbyBlYWNoIHN0ZXAgcmVhZHMgdGhlIGxpdmUgdmFsdWUgKG5vIHN0YWxlIGNsb3N1cmUpLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcm9ncmVzcyA+PSBTVFJJUF9DT1VOVCkge1xuICAgICAgY29uc3QgdCA9IHNldFRpbWVvdXQob25Eb25lLCBGVUxMX0hPTERfTVMpO1xuICAgICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0KTtcbiAgICB9XG4gICAgY29uc3QgdCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0UHJvZ3Jlc3MoKHApID0+IHAgKyAxKSwgU1RSSVBfTVMpO1xuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQodCk7XG4gIH0sIFtwcm9ncmVzc10pO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiAzNTAsXG4gICAgICAgIGhlaWdodDogNTAsXG4gICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgYm9yZGVyQ29sb3I6IENvbG9ycy5zdXJmYWNlNjAwLFxuICAgICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGdhcDogNyxcbiAgICAgICAgcGFkZGluZzogNSxcbiAgICAgIH19XG4gICAgPlxuICAgICAge1NUUklQUy5tYXAoKF8sIGluZGV4KSA9PiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAga2V5PXtpbmRleH1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDIwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOlxuICAgICAgICAgICAgICBwcm9ncmVzcyA+IGluZGV4ID8gQ29sb3JzLnN1cmZhY2U2MDAgOiBDb2xvcnMudHJhbnNwYXJlbnQsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgYm9vdFNjcmVlbjogQmV2eVN0eWxlID0ge1xuICBmbGV4R3JvdzogMSxcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIGdhcDogMjQsXG59O1xuXG5jb25zdCBib290QnJhbmQ6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMueHhsLFxuICBmb250V2VpZ2h0OiBcImJvbGRcIixcbn07XG5cbmNvbnN0IGJvb3RTdGF0dXM6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLmxnLFxufTtcblxuY29uc3QgYm9vdEJhcldyYXA6IEJldnlTdHlsZSA9IHsgd2lkdGg6IFwiNzAlXCIgfTtcbiIsICJpbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBNb25pdG9yQXBwIH0gZnJvbSBcIi4vTW9uaXRvckFwcFwiO1xuXG4vLyBBIGRlbW8gb2YgdGhlIGA8c3VyZmFjZT5gIGhvc3QgZWxlbWVudDogdGhlIGludmVyc2Ugb2YgYDxwb3J0YWw+YC4gSXRzIHN1YnRyZWUgaXNcbi8vIHJlbmRlcmVkIGludG8gYW4gb2Zmc2NyZWVuIHRleHR1cmUgdGhhdCB0aGUgQmV2eSBhcHAgZHJhcGVzIG92ZXIgdGhlIHNjcmVlbiBvZiBhIDNEXG4vLyBtb25pdG9yIG1vZGVsIChzZWUgYHNjZW5lcy9tb25pdG9yLnJzYCkuIEJlY2F1c2UgdGhlIHNjcmVlbiBtZXNoIGlzIHRhZ2dlZFxuLy8gYFN1cmZhY2VQb2ludGVyYCwgdGhlIFVJIG9uIGl0IGlzIGEgcmVhbCwgY2xpY2thYmxlIGluLXdvcmxkIGFwcCDigJQgYSB0aW55IFwiT1NcIiB3aXRoIGFcbi8vIG1lbnUgYmFyLCB0YXNrYmFyLCBjb2RlIHZpZXdlciwgZGlhbG9ncywgYW5kIGEgcmVib290IHBvd2VyLWN5Y2xlLCBhbGwgZHJpdmVuIGJ5IFJlYWN0LlxuXG5leHBvcnQgZnVuY3Rpb24gU3VyZmFjZURlbW8oKSB7XG4gIHJldHVybiAoXG4gICAgPHN1cmZhY2UgbmFtZT1cIm1vbml0b3JcIiBzdHlsZT17c2NyZWVuUm9vdH0+XG4gICAgICA8TW9uaXRvckFwcCAvPlxuICAgIDwvc3VyZmFjZT5cbiAgKTtcbn1cblxuLy8gVHJhbnNwYXJlbnQgc28gdGhhdCB3aGVuIHRoZSBwb3dlciB3cmFwcGVyIGNvbGxhcHNlcywgdGhlIHN1cmZhY2UncyBvd24gbmVhci1ibGFja1xuLy8gY2xlYXIgY29sb3IgKHNlZSBgbW9uaXRvci5yc2ApIHNob3dzIHRocm91Z2gg4oCUIGEgdHJ1ZSBDUlQgYmxhY2tvdXQuXG5jb25zdCBzY3JlZW5Sb290OiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiBcIjEwMCVcIixcbiAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMudHJhbnNwYXJlbnQsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gQSBsb25nZXItdGhhbi1pdHMtYm94IGxpc3QgdG8gZGVtb25zdHJhdGUgd2hlZWwgc2Nyb2xsaW5nLiBUaGUgY29udGFpbmVyIHNldHNcbi8vIGBvdmVyZmxvd1k6IFwic2Nyb2xsXCJgOyBob3ZlcmluZyBhbnl3aGVyZSBvdmVyIGl0IChpbmNsdWRpbmcgYSByb3cpIHNjcm9sbHMgaXQuXG5jb25zdCBJVEVNUyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDIwIH0sIChfLCBpKSA9PiBgSXRlbSAke2kgKyAxfWApO1xuXG5leHBvcnQgZnVuY3Rpb24gU2Nyb2xsRGVtbygpIHtcbiAgcmV0dXJuIChcbiAgICA8RXhhbXBsZVxuICAgICAgZGVzY3JpcHRpb249XCJvdmVyZmxvd1k6IHNjcm9sbCBjbGlwcyBhIHRhbGwgY2hpbGQgYW5kIGFkZHMgYSB3aGVlbCBzY3JvbGxiYXIuIEhvdmVyIHRoZSBsaXN0IGFuZCBzY3JvbGwuXCJcbiAgICAgIHRzeD17YDxub2RlIHN0eWxlPXt7XG4gIGhlaWdodDogMTgwLFxuICBvdmVyZmxvd1k6IFwic2Nyb2xsXCIsXG4gIHNjcm9sbGJhcldpZHRoOiA4LFxufX0+YH1cbiAgICA+XG4gICAgICA8bm9kZSBzdHlsZT17bGlzdFN0eWxlfT5cbiAgICAgICAge0lURU1TLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgIDxub2RlIGtleT17aXRlbX0gc3R5bGU9e3Jvd1N0eWxlfT5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7IGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLCBmb250U2l6ZTogRm9udFNpemVzLnNtIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtpdGVtfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC9FeGFtcGxlPlxuICApO1xufVxuXG5jb25zdCBsaXN0U3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgZ2FwOiA2LFxuICB3aWR0aDogMjQwLFxuICBoZWlnaHQ6IDE4MCxcbiAgcGFkZGluZzogOCxcbiAgb3ZlcmZsb3dZOiBcInNjcm9sbFwiLFxuICBzY3JvbGxiYXJXaWR0aDogOCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiA4LFxufTtcblxuY29uc3Qgcm93U3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgcGFkZGluZzogXCIxMHB4IDEycHhcIixcbiAgYm9yZGVyUmFkaXVzOiA2LFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlNDAwLFxufTtcbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBFeGFtcGxlIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG5jb25zdCBUWVBFU0NSSVBUID0gYDxlZGl0YWJsZVRleHRcbiAgdmFsdWU9e3RleHR9XG4gIG9uQ2hhbmdlPXtzZXRUZXh0fVxuICBtYXhMZW5ndGg9ezQwfVxuLz5gO1xuXG5leHBvcnQgZnVuY3Rpb24gRWRpdGFibGVUZXh0RGVtbygpIHtcbiAgY29uc3QgW3RleHQsIHNldFRleHRdID0gdXNlU3RhdGUoXCJcIik7XG5cbiAgcmV0dXJuIChcbiAgICA8RXhhbXBsZVxuICAgICAgZGVzY3JpcHRpb249XCJBIGZvY3VzYWJsZSB0ZXh0IGlucHV0OiBhIGNvbnRyb2xsZWQgdmFsdWUgd2l0aCBvbkNoYW5nZS5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgID5cbiAgICAgIDx0ZXh0PldoYXQncyB5b3VyIG5hbWU/PC90ZXh0PlxuICAgICAgPGVkaXRhYmxlVGV4dFxuICAgICAgICB2YWx1ZT17dGV4dH1cbiAgICAgICAgb25DaGFuZ2U9e3NldFRleHR9XG4gICAgICAgIG1heExlbmd0aD17NDB9XG4gICAgICAgIHN0eWxlPXtpbnB1dFN0eWxlfVxuICAgICAgLz5cblxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IEZvbnRTaXplcy54eGwsIG9wYWNpdHk6IHRleHQgPyAxIDogMCB9fT5cbiAgICAgICAgSGVsbG8ge3RleHR9XG4gICAgICA8L3RleHQ+XG4gICAgPC9FeGFtcGxlPlxuICApO1xufVxuXG5jb25zdCBpbnB1dFN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiAyODAsXG4gIGhlaWdodDogNDAsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBwYWRkaW5nOiB7IHRvcDogOCwgcmlnaHQ6IDEyLCBib3R0b206IDgsIGxlZnQ6IDEyIH0sXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYm9yZGVyOiAxLFxuICBib3JkZXJDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG59O1xuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEV4YW1wbGUsIFNsaWRlciB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbi8vIFRoZSBgPG5vZGU+YCBob3N0IGVsZW1lbnQ6IGEgc3R5bGVhYmxlLCBuZXN0YWJsZSBib3gg4oCUIHRoZSBidWlsZGluZyBibG9jayBldmVyeVxuLy8gb3RoZXIgbGF5b3V0IGlzIG1hZGUgb2YuIFNlZSBMYXlvdXQg4oaSIEZsZXgvR3JpZCBmb3IgYXJyYW5naW5nIGl0cyBjaGlsZHJlbi5cblxuY29uc3QgVFlQRVNDUklQVCA9IGA8bm9kZSBzdHlsZT17eyBwYWRkaW5nOiAxNiwgZ2FwOiAxMiB9fT5cbiAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDQ4LCBoZWlnaHQ6IDQ4IH19IC8+XG48L25vZGU+YDtcblxuZXhwb3J0IGZ1bmN0aW9uIE5vZGVEZW1vKCkge1xuICBjb25zdCBbZ2FwLCBzZXRHYXBdID0gdXNlU3RhdGUoMTIpO1xuXG4gIHJldHVybiAoXG4gICAgPEV4YW1wbGVcbiAgICAgIGRlc2NyaXB0aW9uPVwiQSBwbGFpbiBjb250YWluZXIgeW91IHN0eWxlIGFuZCBuZXN0LiBDaGlsZHJlbiBmbG93IGluc2lkZSBpdDsgZHJhZyB0byBzcGFjZSB0aGVtIG91dC5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXt7IC4uLnBhbmVsU3R5bGUsIGdhcCB9fT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uYm94U3R5bGUsIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAgfX0gLz5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uYm94U3R5bGUsIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLmdyZWVuMTAwIH19IC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmJveFN0eWxlLCBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5yZWQxMDAgfX0gLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e2dhcH1cbiAgICAgICAgbWluPXswfVxuICAgICAgICBtYXg9ezMyfVxuICAgICAgICBvbkNoYW5nZT17c2V0R2FwfVxuICAgICAgICBsYWJlbD17YGdhcCAke2dhcC50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvRXhhbXBsZT5cbiAgKTtcbn1cblxuY29uc3QgcGFuZWxTdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBwYWRkaW5nOiAxNixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbn07XG5cbmNvbnN0IGJveFN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiA0OCxcbiAgaGVpZ2h0OiA0OCxcbiAgYm9yZGVyUmFkaXVzOiA4LFxufTtcbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBFeGFtcGxlLCBSYWRpbywgUmFkaW9PcHRpb24gfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBDb2xvcnMsIEdyYWRpZW50cyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbi8vIGA8bm9kZT5gIGlzIGEgZmxleGJveCBjb250YWluZXIgYnkgZGVmYXVsdC4gVGhlc2Ugc25pcHBldHMgc2hvdyB0aGUgbWFpbiBmbGV4XG4vLyBrbm9iczsgc2VlIExheW91dCDihpIgR3JpZCBmb3IgYGRpc3BsYXk6IFwiZ3JpZFwiYC5cblxuY29uc3QgU1dBVENIRVMgPSBHcmFkaWVudHMuc3BlY3RydW07XG5cbnR5cGUgRmxleERpcmVjdGlvbiA9IFJlcXVpcmVkPEJldnlTdHlsZT5bXCJmbGV4RGlyZWN0aW9uXCJdO1xudHlwZSBKdXN0aWZ5Q29udGVudCA9IFJlcXVpcmVkPEJldnlTdHlsZT5bXCJqdXN0aWZ5Q29udGVudFwiXTtcbnR5cGUgQWxpZ25JdGVtcyA9IFJlcXVpcmVkPEJldnlTdHlsZT5bXCJhbGlnbkl0ZW1zXCJdO1xuXG5jb25zdCBESVJFQ1RJT05fT1BUSU9OUzogUmFkaW9PcHRpb248RmxleERpcmVjdGlvbj5bXSA9IFtcbiAgeyBsYWJlbDogXCJyb3dcIiwgdmFsdWU6IFwicm93XCIgfSxcbiAgeyBsYWJlbDogXCJjb2x1bW5cIiwgdmFsdWU6IFwiY29sdW1uXCIgfSxcbl07XG5cbmNvbnN0IEpVU1RJRllfT1BUSU9OUzogUmFkaW9PcHRpb248SnVzdGlmeUNvbnRlbnQ+W10gPSBbXG4gIHsgbGFiZWw6IFwiY2VudGVyXCIsIHZhbHVlOiBcImNlbnRlclwiIH0sXG4gIHsgbGFiZWw6IFwiZmxleFN0YXJ0XCIsIHZhbHVlOiBcImZsZXhTdGFydFwiIH0sXG4gIHsgbGFiZWw6IFwiZmxleEVuZFwiLCB2YWx1ZTogXCJmbGV4RW5kXCIgfSxcbiAgeyBsYWJlbDogXCJzcGFjZUJldHdlZW5cIiwgdmFsdWU6IFwic3BhY2VCZXR3ZWVuXCIgfSxcbl07XG5cbmNvbnN0IEFMSUdOX09QVElPTlM6IFJhZGlvT3B0aW9uPEFsaWduSXRlbXM+W10gPSBbXG4gIHsgbGFiZWw6IFwiY2VudGVyXCIsIHZhbHVlOiBcImNlbnRlclwiIH0sXG4gIHsgbGFiZWw6IFwiZmxleFN0YXJ0XCIsIHZhbHVlOiBcImZsZXhTdGFydFwiIH0sXG4gIHsgbGFiZWw6IFwiZmxleEVuZFwiLCB2YWx1ZTogXCJmbGV4RW5kXCIgfSxcbiAgeyBsYWJlbDogXCJzdHJldGNoXCIsIHZhbHVlOiBcInN0cmV0Y2hcIiB9LFxuXTtcblxuZnVuY3Rpb24gU3dhdGNoZXMoeyBjb3VudCA9IDQgfTogeyBjb3VudD86IG51bWJlciB9KSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtTV0FUQ0hFUy5zbGljZSgwLCBjb3VudCkubWFwKChnLCBpKSA9PiAoXG4gICAgICAgIDxub2RlIGtleT17aX0gc3R5bGU9e3sgLi4uc3dhdGNoLCBiYWNrZ3JvdW5kR3JhZGllbnQ6IGcgfX0gLz5cbiAgICAgICkpfVxuICAgIDwvPlxuICApO1xufVxuXG4vLyBBbiBpbnRlcmFjdGl2ZSBjb250YWluZXI6IGZsaXAgdGhlIHRocmVlIG1haW4gZmxleCBrbm9icyBhbmQgd2F0Y2ggdGhlIHN3YXRjaGVzXG4vLyByZWFycmFuZ2UgbGl2ZS5cbmZ1bmN0aW9uIEZsZXhQbGF5Z3JvdW5kKCkge1xuICBjb25zdCBbZmxleERpcmVjdGlvbiwgc2V0RmxleERpcmVjdGlvbl0gPSB1c2VTdGF0ZTxGbGV4RGlyZWN0aW9uPihcInJvd1wiKTtcbiAgY29uc3QgW2p1c3RpZnlDb250ZW50LCBzZXRKdXN0aWZ5Q29udGVudF0gPVxuICAgIHVzZVN0YXRlPEp1c3RpZnlDb250ZW50PihcImNlbnRlclwiKTtcbiAgY29uc3QgW2FsaWduSXRlbXMsIHNldEFsaWduSXRlbXNdID0gdXNlU3RhdGU8QWxpZ25JdGVtcz4oXCJjZW50ZXJcIik7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDEyLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiIH19PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgLi4ucGxheWdyb3VuZCwgZmxleERpcmVjdGlvbiwganVzdGlmeUNvbnRlbnQsIGFsaWduSXRlbXMgfX1cbiAgICAgID5cbiAgICAgICAgPFN3YXRjaGVzIC8+XG4gICAgICA8L25vZGU+XG5cbiAgICAgIDxSYWRpb1xuICAgICAgICBvcHRpb25zPXtESVJFQ1RJT05fT1BUSU9OU31cbiAgICAgICAgdmFsdWU9e2ZsZXhEaXJlY3Rpb259XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRGbGV4RGlyZWN0aW9ufVxuICAgICAgLz5cbiAgICAgIDxSYWRpb1xuICAgICAgICBvcHRpb25zPXtKVVNUSUZZX09QVElPTlN9XG4gICAgICAgIHZhbHVlPXtqdXN0aWZ5Q29udGVudH1cbiAgICAgICAgb25DaGFuZ2U9e3NldEp1c3RpZnlDb250ZW50fVxuICAgICAgLz5cbiAgICAgIDxSYWRpb1xuICAgICAgICBvcHRpb25zPXtBTElHTl9PUFRJT05TfVxuICAgICAgICB2YWx1ZT17YWxpZ25JdGVtc31cbiAgICAgICAgb25DaGFuZ2U9e3NldEFsaWduSXRlbXN9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZsZXhEZW1vKCkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIkZsaXAgdGhlIHRocmVlIG1haW4gZmxleCBrbm9icyBsaXZlIGFuZCB3YXRjaCB0aGUgc3dhdGNoZXMgcmVhcnJhbmdlLlwiXG4gICAgICAgIHRzeD17YDxub2RlIHN0eWxlPXt7XG4gIGZsZXhEaXJlY3Rpb24sXG4gIGp1c3RpZnlDb250ZW50LFxuICBhbGlnbkl0ZW1zXG59fT5gfVxuICAgICAgPlxuICAgICAgICA8RmxleFBsYXlncm91bmQgLz5cbiAgICAgIDwvRXhhbXBsZT5cblxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJmbGV4V3JhcCBwdXNoZXMgb3ZlcmZsb3dpbmcgY2hpbGRyZW4gb250byB0aGUgbmV4dCBsaW5lLlwiXG4gICAgICAgIHRzeD17YDxub2RlIHN0eWxlPXt7IGZsZXhXcmFwOiBcIndyYXBcIiwgZ2FwOiA4IH19PmB9XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmZyYW1lLCB3aWR0aDogMTUyLCBmbGV4V3JhcDogXCJ3cmFwXCIsIGdhcDogOCB9fT5cbiAgICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogOCB9LCAoXywgaSkgPT4gKFxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIC4uLnN3YXRjaCxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IFNXQVRDSEVTW2kgJSBTV0FUQ0hFUy5sZW5ndGhdLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cImZsZXhHcm93IGxldHMgYSBjaGlsZCBhYnNvcmIgdGhlIHJlbWFpbmluZyBzcGFjZS5cIlxuICAgICAgICB0c3g9e2A8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fT5gfVxuICAgICAgPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyAuLi5mcmFtZSwgd2lkdGg6IDI2MCwgZ2FwOiA4IH19PlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLnN3YXRjaCwgYmFja2dyb3VuZEdyYWRpZW50OiBTV0FUQ0hFU1swXSB9fSAvPlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmdyb3csIGJhY2tncm91bmRHcmFkaWVudDogU1dBVENIRVNbMV0gfX0gLz5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyAuLi5zd2F0Y2gsIGJhY2tncm91bmRHcmFkaWVudDogU1dBVENIRVNbMl0gfX0gLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9FeGFtcGxlPlxuICAgIDwvPlxuICApO1xufVxuXG5jb25zdCBwbGF5Z3JvdW5kOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiAzMjAsXG4gIGhlaWdodDogMTYwLFxuICBnYXA6IDEwLFxuICBwYWRkaW5nOiAxMixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbn07XG5cbmNvbnN0IGZyYW1lOiBCZXZ5U3R5bGUgPSB7XG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIHBhZGRpbmc6IDEyLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBib3JkZXJSYWRpdXM6IDEyLFxufTtcblxuY29uc3Qgc3dhdGNoOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiA0MCxcbiAgaGVpZ2h0OiA0MCxcbiAgYm9yZGVyUmFkaXVzOiA4LFxufTtcblxuY29uc3QgZ3JvdzogQmV2eVN0eWxlID0ge1xuICBmbGV4R3JvdzogMSxcbiAgaGVpZ2h0OiA0MCxcbiAgYm9yZGVyUmFkaXVzOiA4LFxufTtcbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlLCBHcmFkaWVudCB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgRXhhbXBsZSwgUmFkaW8sIFJhZGlvT3B0aW9uLCBTbGlkZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBDb2xvcnMsIEZvbnRTaXplcywgR3JhZGllbnRzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gYGRpc3BsYXk6IFwiZ3JpZFwiYCBvcHRzIGEgYDxub2RlPmAgaW50byBDU1MtZ3JpZCBsYXlvdXQuIFRyYWNrcyBhY2NlcHQgdGhlIGZ1bGxcbi8vIENTUyBzeW50YXg6IGByZXBlYXQobiwg4oCmKWAsIGZyIHVuaXRzLCBmaXhlZCBzaXplcywgYW5kIGBzcGFuYC9saW5lIHBsYWNlbWVudC5cblxuY29uc3QgQ0VMTFMgPSBHcmFkaWVudHMuc3BlY3RydW07XG5cbmZ1bmN0aW9uIENlbGxzKHsgY291bnQsIGZyb20gPSAwIH06IHsgY291bnQ6IG51bWJlcjsgZnJvbT86IG51bWJlciB9KSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBjb3VudCB9LCAoXywgaSkgPT4gKFxuICAgICAgICA8Q2VsbFxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBsYWJlbD17aSArIGZyb20gKyAxfVxuICAgICAgICAgIGdyYWRpZW50PXtDRUxMU1soaSArIGZyb20pICUgQ0VMTFMubGVuZ3RoXX1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgIDwvPlxuICApO1xufVxuXG5mdW5jdGlvbiBDZWxsKHtcbiAgbGFiZWwsXG4gIGdyYWRpZW50LFxufToge1xuICBsYWJlbDogbnVtYmVyIHwgc3RyaW5nO1xuICBncmFkaWVudDogR3JhZGllbnQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgLi4uY2VsbCwgYmFja2dyb3VuZEdyYWRpZW50OiBncmFkaWVudCB9fT5cbiAgICAgIDx0ZXh0IHN0eWxlPXtjZWxsVGV4dH0+e2xhYmVsfTwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IENPTFNfT1BUSU9OUzogUmFkaW9PcHRpb248bnVtYmVyPltdID0gW1xuICB7IGxhYmVsOiBcIjJcIiwgdmFsdWU6IDIgfSxcbiAgeyBsYWJlbDogXCIzXCIsIHZhbHVlOiAzIH0sXG4gIHsgbGFiZWw6IFwiNFwiLCB2YWx1ZTogNCB9LFxuXTtcblxuZnVuY3Rpb24gR3JpZFBsYXlncm91bmQoKSB7XG4gIGNvbnN0IFtjb2xzLCBzZXRDb2xzXSA9IHVzZVN0YXRlKDMpO1xuICBjb25zdCBbZ2FwLCBzZXRHYXBdID0gdXNlU3RhdGUoOCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgLi4uZnJhbWUsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IGByZXBlYXQoJHtjb2xzfSwgMWZyKWAsIGdhcCB9fVxuICAgICAgPlxuICAgICAgICA8Q2VsbHMgY291bnQ9e2NvbHMgKiAyfSAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPFJhZGlvIG9wdGlvbnM9e0NPTFNfT1BUSU9OU30gdmFsdWU9e2NvbHN9IG9uQ2hhbmdlPXtzZXRDb2xzfSAvPlxuICAgICAgPFNsaWRlclxuICAgICAgICB2YWx1ZT17Z2FwfVxuICAgICAgICBtaW49ezB9XG4gICAgICAgIG1heD17MjB9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRHYXB9XG4gICAgICAgIGxhYmVsPXtgZ2FwICR7Z2FwLnRvRml4ZWQoMCl9YH1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gR3JpZERlbW8oKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwicmVwZWF0KG4sIDFmcikgbWFrZXMgbiBlcXVhbCwgZmxleGlibGUgY29sdW1ucy4gVHJ5IHRoZSBjb3VudCBhbmQgZ2FwLlwiXG4gICAgICAgIHRzeD17YDxub2RlIHN0eWxlPXt7XG4gIGRpc3BsYXk6IFwiZ3JpZFwiLFxuICBncmlkVGVtcGxhdGVDb2x1bW5zOiBcInJlcGVhdCgzLCAxZnIpXCIsXG4gIGdhcDogOCxcbn19PmB9XG4gICAgICA+XG4gICAgICAgIDxHcmlkUGxheWdyb3VuZCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIk1peGVkIHRyYWNrczogYSBmaXhlZCBzaWRlYmFyIGFuZCBhIGZsZXhpYmxlIGJvZHkgY29sdW1uLlwiXG4gICAgICAgIHRzeD17YGdyaWRUZW1wbGF0ZUNvbHVtbnM6IFwiODBweCAxZnJcImB9XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmZyYW1lLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBcIjgwcHggMWZyXCIgfX0+XG4gICAgICAgICAgPENlbGxzIGNvdW50PXs0fSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiZ3JpZENvbHVtbjogc3BhbiAyIG1ha2VzIGEgY2VsbCBzdHJhZGRsZSB0d28gY29sdW1ucy5cIlxuICAgICAgICB0c3g9e2A8bm9kZSBzdHlsZT17eyBncmlkQ29sdW1uOiBcInNwYW4gMlwiIH19PmB9XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmZyYW1lLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBcInJlcGVhdCgzLCAxZnIpXCIgfX0+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIC4uLmNlbGwsXG4gICAgICAgICAgICAgIGdyaWRDb2x1bW46IFwic3BhbiAyXCIsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogQ0VMTFNbMF0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXtjZWxsVGV4dH0+c3BhbiAyPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8Q2VsbHMgY291bnQ9ezR9IGZyb209ezF9IC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvRXhhbXBsZT5cblxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJncmlkUm93OiBzcGFuIDIgd2l0aCBleHBsaWNpdCByb3dzIGJ1aWxkcyBhIGZlYXR1cmUgY2VsbC5cIlxuICAgICAgICB0c3g9e2BncmlkVGVtcGxhdGVSb3dzOiBcInJlcGVhdCgyLCA0OHB4KVwiXG5ncmlkUm93OiBcInNwYW4gMlwiYH1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uZnJhbWUsXG4gICAgICAgICAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiBcInJlcGVhdCgzLCAxZnIpXCIsXG4gICAgICAgICAgICBncmlkVGVtcGxhdGVSb3dzOiBcInJlcGVhdCgyLCA0OHB4KVwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3sgLi4uY2VsbCwgZ3JpZFJvdzogXCJzcGFuIDJcIiwgYmFja2dyb3VuZEdyYWRpZW50OiBDRUxMU1swXSB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXtjZWxsVGV4dH0+dGFsbDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPENlbGxzIGNvdW50PXs0fSBmcm9tPXsxfSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L0V4YW1wbGU+XG4gICAgPC8+XG4gICk7XG59XG5cbmNvbnN0IGNvbnRyb2xDb2x1bW46IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiAxNixcbn07XG5cbmNvbnN0IGZyYW1lOiBCZXZ5U3R5bGUgPSB7XG4gIGRpc3BsYXk6IFwiZ3JpZFwiLFxuICB3aWR0aDogMjgwLFxuICBnYXA6IDgsXG4gIHBhZGRpbmc6IDEyLFxuICBncmlkQXV0b1Jvd3M6IFwiNDhweFwiLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBib3JkZXJSYWRpdXM6IDEyLFxufTtcblxuY29uc3QgY2VsbDogQmV2eVN0eWxlID0ge1xuICBib3JkZXJSYWRpdXM6IDgsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxufTtcblxuY29uc3QgY2VsbFRleHQ6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3I0MDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMueHMsXG4gIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxufTtcbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBFeGFtcGxlIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG4vLyBBIHB1cmUtVUkgZGVtbyBvZiB0aGUgYDxidXR0b24+YCBob3N0IGVsZW1lbnQ6IGEgY2xpY2thYmxlIGNvbnRhaW5lciB0aGF0XG4vLyByZWFjdHMgdG8gaG92ZXIgYW5kIHByZXNzIHZpYSBgaG92ZXJTdHlsZWAgLyBgcHJlc3NTdHlsZWAsIGRyaXZpbmcgYSBSZWFjdFxuLy8gc3RhdGUgY291bnRlciBvbiBgb25DbGlja2AuIE5vIDNEIHNjZW5lOiB0aGUgdmlld3BvcnQgc3RheXMgZW1wdHkuXG5cbmNvbnN0IFRZUEVTQ1JJUFQgPSBgPGJ1dHRvblxuICBvbkNsaWNrPXsoKSA9PiBzZXRDb3VudCgoYykgPT4gYyArIDEpfVxuICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCIjODliNGZhXCIgfX1cbiAgcHJlc3NTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwiIzVhN2ZkNlwiIH19XG4vPmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b25EZW1vKCkge1xuICBjb25zdCBbY291bnQsIHNldENvdW50XSA9IHVzZVN0YXRlKDApO1xuXG4gIHJldHVybiAoXG4gICAgPEV4YW1wbGVcbiAgICAgIGRlc2NyaXB0aW9uPVwiQSBjbGlja2FibGUgbm9kZSB3aXRoIGhvdmVyIGFuZCBwcmVzcyBzdHlsZSBvdmVycmlkZXMsIGRyaXZpbmcgUmVhY3Qgc3RhdGUuXCJcbiAgICAgIHRzeD17VFlQRVNDUklQVH1cbiAgICA+XG4gICAgICA8dGV4dCBzdHlsZT17Y291bnRTdHlsZX0+XG4gICAgICAgIENsaWNrczogPHRleHQgc3R5bGU9e3sgY29sb3I6IENvbG9ycy5wcmltYXJ5MTAwIH19Pntjb3VudH08L3RleHQ+XG4gICAgICA8L3RleHQ+XG5cbiAgICAgIDxidXR0b25cbiAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Q291bnQoKGMpID0+IGMgKyAxKX1cbiAgICAgICAgc3R5bGU9e2NsaWNrQnV0dG9uU3R5bGV9XG4gICAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTIwMCB9fVxuICAgICAgICBwcmVzc1N0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkzMDAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHQgc3R5bGU9e2NsaWNrTGFiZWxTdHlsZX0+Q2xpY2sgbWU8L3RleHQ+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L0V4YW1wbGU+XG4gICk7XG59XG5cbmNvbnN0IGNvdW50U3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMubGcsXG59O1xuXG5jb25zdCBjbGlja0J1dHRvblN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiAxNjAsXG4gIGhlaWdodDogNTYsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBib3JkZXJSYWRpdXM6IDgsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG59O1xuXG5jb25zdCBjbGlja0xhYmVsU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3I0MDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMuYmFzZSxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG59O1xuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQ2hlY2tib3gsIEV4YW1wbGUsIFJhZGlvLCBTbGlkZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBDb2xvcnMsIEZvbnRTaXplcyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbmNvbnN0IFNJWkVfVFMgPSBgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDI4LCBmb250V2VpZ2h0OiBcImJvbGRcIiB9fT5cbiAgQmlnICYgYm9sZFxuPC90ZXh0PmA7XG5cbmNvbnN0IEZBTUlMWV9UUyA9IGA8dGV4dCBzdHlsZT17eyBmb250RmFtaWx5OiBcIkRhbmNpbmdTY3JpcHRcIiB9fT5gO1xuXG5jb25zdCBUWVBPR1JBUEhZX1RTID0gYDx0ZXh0IHN0eWxlPXt7IGxpbmVIZWlnaHQ6IDEuOCwgbGV0dGVyU3BhY2luZzogMiB9fT5cbjx0ZXh0IHN0eWxlPXt7IHRleHRTaGFkb3c6IHsgY29sb3I6IFwiIzAwMFwiLCBvZmZzZXRYOiAyLCBvZmZzZXRZOiAyIH0gfX0+YDtcblxuY29uc3QgV1JBUF9UUyA9IGA8dGV4dCBzdHlsZT17eyB3aWR0aDogMjIwLCBsaW5lQnJlYWs6IFwiYW55Q2hhcmFjdGVyXCIgfX0+YDtcblxuY29uc3QgUEFSQUdSQVBIID1cbiAgXCJMaW5lIGhlaWdodCwgbGV0dGVyIHNwYWNpbmcsIGFuZCBhIGRyb3Agc2hhZG93IGdpdmUgYSBibG9jayBvZiB0ZXh0IGl0cyByaHl0aG0gYW5kIHdlaWdodC5cIjtcblxudHlwZSBMaW5lQnJlYWsgPSBOb25OdWxsYWJsZTxCZXZ5U3R5bGVbXCJsaW5lQnJlYWtcIl0+O1xuXG5jb25zdCBMSU5FX0JSRUFLUzogeyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogTGluZUJyZWFrIH1bXSA9IFtcbiAgeyBsYWJlbDogXCJ3b3JkQm91bmRhcnlcIiwgdmFsdWU6IFwid29yZEJvdW5kYXJ5XCIgfSxcbiAgeyBsYWJlbDogXCJhbnlDaGFyYWN0ZXJcIiwgdmFsdWU6IFwiYW55Q2hhcmFjdGVyXCIgfSxcbiAgeyBsYWJlbDogXCJ3b3JkT3JDaGFyYWN0ZXJcIiwgdmFsdWU6IFwid29yZE9yQ2hhcmFjdGVyXCIgfSxcbiAgeyBsYWJlbDogXCJub1dyYXBcIiwgdmFsdWU6IFwibm9XcmFwXCIgfSxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0RGVtbygpIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJmb250U2l6ZSBhbmQgZm9udFdlaWdodCBzY2FsZSB0ZXh0LiBEcmFnIHRvIHJlc2l6ZS5cIlxuICAgICAgICB0c3g9e1NJWkVfVFN9XG4gICAgICA+XG4gICAgICAgIDxTaXplQ29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIkN1c3RvbSBmb250IGZhbWlsaWVzLCBhbmQgaW5saW5lIG5lc3RlZCBjb2xvciBzcGFucyB3aXRoaW4gb25lIDx0ZXh0Pi5cIlxuICAgICAgICB0c3g9e0ZBTUlMWV9UU31cbiAgICAgID5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udEZhbWlseTogXCJEYW5jaW5nU2NyaXB0XCIsXG4gICAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLnh4bCxcbiAgICAgICAgICAgIGNvbG9yOiBDb2xvcnMuYW1iZXIxMDAsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFN0eWxlZCB3aXRoIGEgY3VzdG9tIGZvbnQgZmFtaWx5XG4gICAgICAgIDwvdGV4dD5cblxuICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogRm9udFNpemVzLmxnLCBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjEwMCB9fT5cbiAgICAgICAgICBOZXN0ZWQgdGV4dHMgY29sb3J7XCIgXCJ9XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgY29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLCBmb250V2VpZ2h0OiBcImJvbGRcIiB9fT5cbiAgICAgICAgICAgIHBhcnRcbiAgICAgICAgICA8L3RleHQ+e1wiIFwifVxuICAgICAgICAgIG9mIGF7XCIgXCJ9XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgY29sb3I6IENvbG9ycy5yZWQxMDAsIGZvbnRXZWlnaHQ6IFwiYm9sZFwiIH19PlxuICAgICAgICAgICAgc2VudGVuY2VcbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgLlxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwibGluZUhlaWdodCwgbGV0dGVyU3BhY2luZywgYW5kIHRleHRTaGFkb3cgdHVuZSB0eXBvZ3JhcGh5LiBEcmFnIHRoZSBzbGlkZXJzIGFuZCB0b2dnbGUgdGhlIHNoYWRvdy5cIlxuICAgICAgICB0c3g9e1RZUE9HUkFQSFlfVFN9XG4gICAgICA+XG4gICAgICAgIDxUeXBvZ3JhcGh5Q29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cImxpbmVCcmVhayBjb250cm9scyB3cmFwcGluZyB3aGVuIHRleHQgb3ZlcmZsb3dzIGl0cyB3aWR0aC4gUGljayBhIG1vZGUuXCJcbiAgICAgICAgdHN4PXtXUkFQX1RTfVxuICAgICAgPlxuICAgICAgICA8V3JhcENvbnRyb2wgLz5cbiAgICAgIDwvRXhhbXBsZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gU2l6ZUNvbnRyb2woKSB7XG4gIGNvbnN0IFtzaXplLCBzZXRTaXplXSA9IHVzZVN0YXRlKDI4KTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDE2IH19PlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IHNpemUsIGZvbnRXZWlnaHQ6IFwidGhpblwiIH19PnRoaW48L3RleHQ+XG4gICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogc2l6ZSwgZm9udFdlaWdodDogXCJub3JtYWxcIiB9fT5ub3JtYWw8L3RleHQ+XG4gICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogc2l6ZSwgZm9udFdlaWdodDogXCJib2xkXCIgfX0+Ym9sZDwvdGV4dD5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e3NpemV9XG4gICAgICAgIG1pbj17MTB9XG4gICAgICAgIG1heD17NDh9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRTaXplfVxuICAgICAgICBsYWJlbD17YGZvbnRTaXplICR7c2l6ZS50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gVHlwb2dyYXBoeUNvbnRyb2woKSB7XG4gIGNvbnN0IFtsaW5lSGVpZ2h0LCBzZXRMaW5lSGVpZ2h0XSA9IHVzZVN0YXRlKDEuNCk7XG4gIGNvbnN0IFtsZXR0ZXJTcGFjaW5nLCBzZXRMZXR0ZXJTcGFjaW5nXSA9IHVzZVN0YXRlKDEuNSk7XG4gIGNvbnN0IFtzaGFkb3csIHNldFNoYWRvd10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDE2LCB3aWR0aDogMzgwIH19PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLmJhc2UsXG4gICAgICAgICAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3IxMDAsXG4gICAgICAgICAgbGluZUhlaWdodCxcbiAgICAgICAgICBsZXR0ZXJTcGFjaW5nLFxuICAgICAgICAgIHRleHRTaGFkb3c6IHNoYWRvd1xuICAgICAgICAgICAgPyB7IGNvbG9yOiBcIiMwMDAwMDBjY1wiLCBvZmZzZXRYOiAyLCBvZmZzZXRZOiAyIH1cbiAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7UEFSQUdSQVBIfVxuICAgICAgPC90ZXh0PlxuICAgICAgPFNsaWRlclxuICAgICAgICB2YWx1ZT17bGluZUhlaWdodH1cbiAgICAgICAgbWluPXsxfVxuICAgICAgICBtYXg9ezIuNX1cbiAgICAgICAgb25DaGFuZ2U9e3NldExpbmVIZWlnaHR9XG4gICAgICAgIGxhYmVsPXtgbGluZUhlaWdodCAke2xpbmVIZWlnaHQudG9GaXhlZCgyKX1gfVxuICAgICAgLz5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e2xldHRlclNwYWNpbmd9XG4gICAgICAgIG1pbj17MH1cbiAgICAgICAgbWF4PXs4fVxuICAgICAgICBvbkNoYW5nZT17c2V0TGV0dGVyU3BhY2luZ31cbiAgICAgICAgbGFiZWw9e2BsZXR0ZXJTcGFjaW5nICR7bGV0dGVyU3BhY2luZy50b0ZpeGVkKDEpfXB4YH1cbiAgICAgIC8+XG4gICAgICA8Q2hlY2tib3ggbGFiZWw9XCJ0ZXh0U2hhZG93XCIgZW5hYmxlZD17c2hhZG93fSBvbkNoYW5nZT17c2V0U2hhZG93fSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gV3JhcENvbnRyb2woKSB7XG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPExpbmVCcmVhaz4oXCJ3b3JkQm91bmRhcnlcIik7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxNiB9fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IDIyMCxcbiAgICAgICAgICBwYWRkaW5nOiAxMixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbiAgICAgICAgICAgIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMjAwLFxuICAgICAgICAgICAgbGluZUJyZWFrOiBtb2RlLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBQbmV1bW9ub3VsdHJhbWljcm9zY29waWNzaWxpY292b2xjYW5vY29uaW9zaXMgd3JhcHMgZGlmZmVyZW50bHkgcGVyXG4gICAgICAgICAgbW9kZS5cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPFJhZGlvIHZhbHVlPXttb2RlfSBvcHRpb25zPXtMSU5FX0JSRUFLU30gb25DaGFuZ2U9e3NldE1vZGV9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEJ1dHRvbiwgRXhhbXBsZSwgU2xpZGVyIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzLCBHcmFkaWVudHMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG4vLyBEZW1vcyBvZiB0aGUgYDxpbWFnZT5gIGhvc3QgZWxlbWVudCwgb25lIEV4YW1wbGUgcGVyIGZlYXR1cmU6XG4vLyAgIDEuIGFuIGFzc2V0IGxvYWRlZCBieSBgc3JjYCwgd2l0aCBgdGludGAsIGBmbGlwWGAsIGFuZCBgZmxpcFlgO1xuLy8gICAyLiA5LXNsaWNlIHNjYWxpbmcg4oCUIGEgc2luZ2xlIGBtb2RhbC5wbmdgIGZyYW1lIHdob3NlIG9ybmF0ZSBjb3JuZXJzIHN0YXlcbi8vICAgICAgY3Jpc3Agd2hpbGUgdGhlIGVkZ2VzIHN0cmV0Y2gsIHJlc2l6ZWQgbGl2ZSBieSB3aWR0aC9oZWlnaHQgc2xpZGVycy5cblxuY29uc3QgRkxJUF9UU1ggPSBgPGltYWdlIHNyYz1cImJldnktcmVhY3QtbG9nby5wbmdcIiB0aW50PVwiIzdhYTJmN1wiIGZsaXBYIGZsaXBZIC8+YDtcblxuY29uc3QgU0xJQ0VfVFNYID0gYDxpbWFnZVxuICBzcmM9XCJtb2RhbC5wbmdcIlxuICBpbWFnZU1vZGU9e3sgdHlwZTogXCJzbGljZWRcIiwgYm9yZGVyOiA2MCB9fVxuICBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0IH19XG4vPmA7XG5cbmV4cG9ydCBmdW5jdGlvbiBJbWFnZURlbW8oKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiQW4gaW1hZ2UgYXNzZXQgbG9hZGVkIGJ5IHNyYywgd2l0aCBhbiBvcHRpb25hbCB0aW50IGFuZCBwZXItYXhpcyBmbGlwcy5cIlxuICAgICAgICB0c3g9e0ZMSVBfVFNYfVxuICAgICAgPlxuICAgICAgICA8RmxpcENvbnRyb2wgLz5cbiAgICAgIDwvRXhhbXBsZT5cblxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCI5LXNsaWNlIHNjYWxpbmcgcmVzaXplcyBhIGZyYW1lIHdpdGhvdXQgZGlzdG9ydGluZyBpdHMgY29ybmVycy4gRHJhZyB0aGUgc2xpZGVyczogdGhlIGNvcm5lcnMgc3RheSBjcmlzcCB3aGlsZSB0aGUgZWRnZXMgc3RyZXRjaC5cIlxuICAgICAgICB0c3g9e1NMSUNFX1RTWH1cbiAgICAgID5cbiAgICAgICAgPFNsaWNlQ29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuICAgIDwvPlxuICApO1xufVxuXG5mdW5jdGlvbiBGbGlwQ29udHJvbCgpIHtcbiAgY29uc3QgW2ZsaXBYLCBzZXRGbGlwWF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtmbGlwWSwgc2V0RmxpcFldID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMjQsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+XG4gICAgICAgIDxpbWFnZVxuICAgICAgICAgIHNyYz1cImJldnktcmVhY3QtbG9nby5wbmdcIlxuICAgICAgICAgIHN0eWxlPXtsb2dvU3R5bGV9XG4gICAgICAgICAgZmxpcFg9e2ZsaXBYfVxuICAgICAgICAgIGZsaXBZPXtmbGlwWX1cbiAgICAgICAgLz5cbiAgICAgICAgPGltYWdlXG4gICAgICAgICAgc3JjPVwiYmV2eS1yZWFjdC1sb2dvLnBuZ1wiXG4gICAgICAgICAgc3R5bGU9e2xvZ29TdHlsZX1cbiAgICAgICAgICB0aW50PXtDb2xvcnMucHJpbWFyeTEwMH1cbiAgICAgICAgICBmbGlwWD17ZmxpcFh9XG4gICAgICAgICAgZmxpcFk9e2ZsaXBZfVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDEyIH19PlxuICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEZsaXBYKChmKSA9PiAhZil9PlxuICAgICAgICAgIGZsaXBYOiB7ZmxpcFggPyBcIm9uXCIgOiBcIm9mZlwifVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRGbGlwWSgoZikgPT4gIWYpfT5cbiAgICAgICAgICBmbGlwWToge2ZsaXBZID8gXCJvblwiIDogXCJvZmZcIn1cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFNsaWNlQ29udHJvbCgpIHtcbiAgY29uc3QgW3dpZHRoLCBzZXRXaWR0aF0gPSB1c2VTdGF0ZSgyODApO1xuICBjb25zdCBbaGVpZ2h0LCBzZXRIZWlnaHRdID0gdXNlU3RhdGUoMTYwKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTIgfX0+XG4gICAgICA8bm9kZSBzdHlsZT17ZnJhbWVCb3h9PlxuICAgICAgICA8aW1hZ2VcbiAgICAgICAgICBzcmM9XCJtb2RhbC5wbmdcIlxuICAgICAgICAgIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQgfX1cbiAgICAgICAgICBpbWFnZU1vZGU9e3sgdHlwZTogXCJzbGljZWRcIiwgYm9yZGVyOiAxMjAsIG1heENvcm5lclNjYWxlOiAwLjcgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cblxuICAgICAgPFNsaWRlclxuICAgICAgICB2YWx1ZT17d2lkdGh9XG4gICAgICAgIG1pbj17ODB9XG4gICAgICAgIG1heD17MzYwfVxuICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldFdpZHRoKE1hdGgucm91bmQodikpfVxuICAgICAgICBsYWJlbD17YHdpZHRoICR7TWF0aC5yb3VuZCh3aWR0aCl9YH1cbiAgICAgIC8+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXtoZWlnaHR9XG4gICAgICAgIG1pbj17ODB9XG4gICAgICAgIG1heD17MjQwfVxuICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldEhlaWdodChNYXRoLnJvdW5kKHYpKX1cbiAgICAgICAgbGFiZWw9e2BoZWlnaHQgJHtNYXRoLnJvdW5kKGhlaWdodCl9YH1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBsb2dvU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDEyMCxcbiAgaGVpZ2h0OiAxMjAsXG59O1xuXG4vLyBBIGZpeGVkIGJveCBzbyB0aGUgZnJhbWUncyBib3ggY2FuIGdyb3cvc2hyaW5rIHdpdGhpbiBpdCB3aXRob3V0IHNoaWZ0aW5nIHRoZVxuLy8gc3Vycm91bmRpbmcgbGF5b3V0IChzbGlkZXJzIHN0YXkgcHV0KS5cbmNvbnN0IGZyYW1lQm94OiBCZXZ5U3R5bGUgPSB7XG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBiYWNrZ3JvdW5kR3JhZGllbnQ6IEdyYWRpZW50cy5zcGVjdHJ1bSxcbiAgYm9yZGVyUmFkaXVzOiAxMDAsXG59O1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQW5pbWF0ZWQsIHVzZVNoYXJlZFZhbHVlLCB3aXRoUmVwZWF0LCB3aXRoVGltaW5nIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbmNvbnN0IEZBREVfTVMgPSA1MDA7XG5cbmNvbnN0IFRZUEVTQ1JJUFQgPSBgY29uc3Qgb3BhY2l0eSA9IHVzZVNoYXJlZFZhbHVlKDEpO1xub3BhY2l0eS52YWx1ZSA9IHdpdGhSZXBlYXQoXG4gIHdpdGhUaW1pbmcoMCwgeyBkdXJhdGlvbjogNTAwIH0pLFxuICAtMSwgdHJ1ZSwgLy8gcGluZy1wb25nXG4pO1xuPEFuaW1hdGVkLm5vZGUgYW5pbWF0ZWRTdHlsZT17eyBvcGFjaXR5IH19IC8+YDtcblxuZXhwb3J0IGZ1bmN0aW9uIEZhZGVBbmltYXRpb25EZW1vKCkge1xuICBjb25zdCBvcGFjaXR5ID0gdXNlU2hhcmVkVmFsdWUoMSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBvcGFjaXR5LnZhbHVlID0gd2l0aFJlcGVhdChcbiAgICAgIHdpdGhUaW1pbmcoMCwgeyBkdXJhdGlvbjogRkFERV9NUywgZWFzaW5nOiBcImVhc2VJbk91dFwiIH0pLFxuICAgICAgLTEsXG4gICAgICB0cnVlLCAvLyBwaW5nLXBvbmcgYmFjayB0byAxXG4gICAgKTtcbiAgfSwgW29wYWNpdHldKTtcblxuICByZXR1cm4gKFxuICAgIDxFeGFtcGxlXG4gICAgICBkZXNjcmlwdGlvbj1cIkEgc2hhcmVkIHZhbHVlIGRyaXZlcyBhbmltYXRlZFN0eWxlIGltcGVyYXRpdmVseSwgbG9vcGVkLCBwaW5nLXBvbmdpbmcgb3BhY2l0eS5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXtmYWRlU3RhZ2VTdHlsZX0+XG4gICAgICAgIDxBbmltYXRlZC5ub2RlIHN0eWxlPXtmYWRlU3F1YXJlU3R5bGV9IGFuaW1hdGVkU3R5bGU9e3sgb3BhY2l0eSB9fSAvPlxuICAgICAgPC9ub2RlPlxuICAgIDwvRXhhbXBsZT5cbiAgKTtcbn1cblxuY29uc3QgZmFkZVN0YWdlU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDE2MCxcbiAgaGVpZ2h0OiAxNjAsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxufTtcblxuY29uc3QgZmFkZVNxdWFyZVN0eWxlOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiA4OCxcbiAgaGVpZ2h0OiA4OCxcbiAgYm9yZGVyUmFkaXVzOiAxNixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbn07XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICBBbmltYXRlZCxcbiAgaW50ZXJwb2xhdGUsXG4gIGludGVycG9sYXRlQ29sb3IsXG4gIHVzZVNoYXJlZFZhbHVlLFxuICB3aXRoRGVsYXksXG4gIHdpdGhSZXBlYXQsXG4gIHdpdGhTZXF1ZW5jZSxcbiAgd2l0aFNwcmluZyxcbiAgd2l0aFRpbWluZyxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxudHlwZSBNb2RlID0gXCJsaW5lYXJcIiB8IFwiZWFzZUluT3V0XCIgfCBcInNwcmluZ1wiO1xuXG5jb25zdCBUWVBFU0NSSVBUID0gYHdpdGhSZXBlYXQod2l0aFNlcXVlbmNlKFxuICB3aXRoRGVsYXkoMjgwLCB3aXRoVGltaW5nKDExMCkpLFxuICB3aXRoRGVsYXkoMjgwLCB3aXRoVGltaW5nKC0xMTApKSxcbiksIC0xKTtcbmFuaW1hdGVkU3R5bGU9e3sgdHJhbnNsYXRlWCwgc2NhbGUsIGJhY2tncm91bmRDb2xvciB9fWA7XG5cbmNvbnN0IENPVU5UID0gNDtcbmNvbnN0IEFNUCA9IDExMDsgLy8gaG9yaXpvbnRhbCB0cmF2ZWwsIMKxIGZyb20gY2VudGVyIChweClcbmNvbnN0IFNRVUFSRSA9IDQ0O1xuY29uc3QgVFJBVkVMX01TID0gNjUwOyAvLyBvbmUtd2F5IHNsaWRlIGR1cmF0aW9uXG5jb25zdCBTVE9QX01TID0gMjgwOyAvLyBwYXVzZSBhdCBlYWNoIGVuZFxuY29uc3QgU1RBR0dFUl9NUyA9IDgwOyAvLyBwZXItc3F1YXJlIHN0YXJ0IG9mZnNldFxuY29uc3QgUFVMU0VfTVMgPSA2MDA7IC8vIHNjYWxlL2h1ZSBwdWxzZSBoYWxmLXBlcmlvZFxuY29uc3QgUkVUQVJHRVRfTVMgPSAyODA7IC8vIGdsaWRlIGJhY2sgdG8gdGhlIGxvb3Agc3RhcnQgb24gYSBtb2RlIGNoYW5nZVxuXG4vLyBFYWNoIHNxdWFyZSBwdWxzZXMgZnJvbSBpdHMgY29vbCBiYXNlIGNvbG9yIHRvIGEgd2FybSBwYXJ0bmVyLlxuY29uc3QgQ09PTCA9IFtcbiAgQ29sb3JzLnByaW1hcnkxMDAsXG4gIENvbG9ycy5yZWQxMDAsXG4gIENvbG9ycy5ncmVlbjEwMCxcbiAgQ29sb3JzLnllbGxvdzEwMCxcbiAgQ29sb3JzLnB1cnBsZTEwMCxcbl07XG5jb25zdCBXQVJNID0gW1xuICBDb2xvcnMucHVycGxlMTAwLFxuICBDb2xvcnMub3JhbmdlMTAwLFxuICBDb2xvcnMudGVhbDEwMCxcbiAgQ29sb3JzLnJlZDEwMCxcbiAgQ29sb3JzLnNreTEwMCxcbl07XG5cbmV4cG9ydCBmdW5jdGlvbiBCb3VuY2luZ0JhbGxzQW5pbWF0aW9uRGVtbygpIHtcbiAgY29uc3QgW21vZGUsIHNldE1vZGVdID0gdXNlU3RhdGU8TW9kZT4oXCJlYXNlSW5PdXRcIik7XG5cbiAgcmV0dXJuIChcbiAgICA8RXhhbXBsZVxuICAgICAgZGVzY3JpcHRpb249XCJTdGFnZ2VyZWQgc3F1YXJlcyBjb21wb3NlIHNlcXVlbmNlL3JlcGVhdC9kZWxheSBkcml2ZXJzOyBzd2l0Y2ggdGhlIGVhc2luZyBsaXZlLlwiXG4gICAgICB0c3g9e1RZUEVTQ1JJUFR9XG4gICAgPlxuICAgICAgPG5vZGUgc3R5bGU9e2xhbmVzU3R5bGV9PlxuICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogQ09VTlQgfSwgKF8sIGkpID0+IChcbiAgICAgICAgICA8Qm91bmNpbmdTcXVhcmUga2V5PXtpfSBpbmRleD17aX0gbW9kZT17bW9kZX0gLz5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG5cbiAgICAgIDxub2RlIHN0eWxlPXtyb3dTdHlsZX0+XG4gICAgICAgIHsoW1wibGluZWFyXCIsIFwiZWFzZUluT3V0XCIsIFwic3ByaW5nXCJdIGFzIGNvbnN0KS5tYXAoKG0pID0+IChcbiAgICAgICAgICA8TW9kZUJ1dHRvblxuICAgICAgICAgICAga2V5PXttfVxuICAgICAgICAgICAgbGFiZWw9e219XG4gICAgICAgICAgICBzZWxlY3RlZD17bSA9PT0gbW9kZX1cbiAgICAgICAgICAgIG9uUHJlc3M9eygpID0+IHNldE1vZGUobSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC9FeGFtcGxlPlxuICApO1xufVxuXG5mdW5jdGlvbiBCb3VuY2luZ1NxdWFyZSh7IGluZGV4LCBtb2RlIH06IHsgaW5kZXg6IG51bWJlcjsgbW9kZTogTW9kZSB9KSB7XG4gIC8vIFN0YXJ0IGF0IHRoZSBsZWZ0IGV4dHJlbWUgc28gZWFjaCBsb29wIGN5Y2xlIGVuZHMgd2hlcmUgaXQgYmVnYW4gKHNlYW1sZXNzKS5cbiAgY29uc3QgeCA9IHVzZVNoYXJlZFZhbHVlKC1BTVApO1xuICAvLyBTY2FsZS9odWUgcHJvZ3Jlc3MsIDDihpQxLCBpbmRlcGVuZGVudCBvZiB0aGUgYm91bmNlLlxuICBjb25zdCBwdWxzZSA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICBjb25zdCBmaXJzdCA9IHVzZVJlZih0cnVlKTtcblxuICAvLyBDb250aW51b3VzIHNjYWxlICsgaHVlIHB1bHNlOiBzZXQgb25jZSwgbmV2ZXIga2V5ZWQgb24gYG1vZGVgLCBzbyBpdCBrZWVwc1xuICAvLyBydW5uaW5nIChldmVuIGR1cmluZyB0aGUgYm91bmNlJ3MgZW5kLXN0b3BzKSBhbmQgbmV2ZXIgcmUtYXJtcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBwdWxzZS52YWx1ZSA9IHdpdGhEZWxheShcbiAgICAgIGluZGV4ICogU1RBR0dFUl9NUyxcbiAgICAgIHdpdGhSZXBlYXQoXG4gICAgICAgIHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogUFVMU0VfTVMsIGVhc2luZzogXCJlYXNlSW5PdXRcIiB9KSxcbiAgICAgICAgLTEsXG4gICAgICAgIHRydWUsIC8vIHBpbmctcG9uZyAw4oaUMVxuICAgICAgKSxcbiAgICApO1xuICB9LCBbcHVsc2UsIGluZGV4XSk7XG5cbiAgLy8gSG9yaXpvbnRhbCBib3VuY2U6IHJlLWFybWVkIHdoZW4gdGhlIGVhc2luZyBtb2RlIGNoYW5nZXMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbW92ZSA9ICh0bzogbnVtYmVyKSA9PlxuICAgICAgbW9kZSA9PT0gXCJzcHJpbmdcIlxuICAgICAgICA/IHdpdGhTcHJpbmcodG8sIHsgc3RpZmZuZXNzOiAxMjAsIGRhbXBpbmc6IDE0IH0pXG4gICAgICAgIDogd2l0aFRpbWluZyh0bywgeyBkdXJhdGlvbjogVFJBVkVMX01TLCBlYXNpbmc6IG1vZGUgfSk7XG5cbiAgICAvLyBwYXVzZS1sZWZ0IOKGkiBzbGlkZS1yaWdodCDihpIgcGF1c2UtcmlnaHQg4oaSIHNsaWRlLWxlZnQsIGZvcmV2ZXIuXG4gICAgY29uc3QgYm91bmNlID0gd2l0aFJlcGVhdChcbiAgICAgIHdpdGhTZXF1ZW5jZShcbiAgICAgICAgd2l0aERlbGF5KFNUT1BfTVMsIG1vdmUoQU1QKSksXG4gICAgICAgIHdpdGhEZWxheShTVE9QX01TLCBtb3ZlKC1BTVApKSxcbiAgICAgICksXG4gICAgICAtMSxcbiAgICApO1xuXG4gICAgLy8gT24gYSBtb2RlIGNoYW5nZSB0aGUgdmFsdWUgaXMgbWlkLWJvdW5jZTsgYSBub24tcmV2ZXJzZSByZXBlYXQgcmUtYW5jaG9ycyB0b1xuICAgIC8vIHdoZXJldmVyIGl0J3MgYnVpbHQgZnJvbSwgc28gZ2xpZGUgYmFjayB0byB0aGUgbG9vcCBzdGFydCAoLUFNUCkgZmlyc3QgdG9cbiAgICAvLyBrZWVwIHRoZSByZXBlYXQgc2VhbWxlc3MuIE9uIGZpcnN0IG1vdW50IHdlJ3JlIGFscmVhZHkgYXQgLUFNUC5cbiAgICBjb25zdCBkcml2ZXIgPSBmaXJzdC5jdXJyZW50XG4gICAgICA/IGJvdW5jZVxuICAgICAgOiB3aXRoU2VxdWVuY2UoXG4gICAgICAgICAgd2l0aFRpbWluZygtQU1QLCB7IGR1cmF0aW9uOiBSRVRBUkdFVF9NUywgZWFzaW5nOiBcImVhc2VJbk91dFwiIH0pLFxuICAgICAgICAgIGJvdW5jZSxcbiAgICAgICAgKTtcbiAgICBmaXJzdC5jdXJyZW50ID0gZmFsc2U7XG5cbiAgICB4LnZhbHVlID0gd2l0aERlbGF5KGluZGV4ICogU1RBR0dFUl9NUywgZHJpdmVyKTtcbiAgfSwgW3gsIGluZGV4LCBtb2RlXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17bGFuZVN0eWxlfT5cbiAgICAgIDxBbmltYXRlZC5ub2RlXG4gICAgICAgIHN0eWxlPXt7IC4uLnNxdWFyZVN0eWxlLCBiYWNrZ3JvdW5kQ29sb3I6IENPT0xbaW5kZXhdIH19XG4gICAgICAgIGFuaW1hdGVkU3R5bGU9e3tcbiAgICAgICAgICB0cmFuc2xhdGVYOiB4LFxuICAgICAgICAgIHNjYWxlOiBpbnRlcnBvbGF0ZShwdWxzZSwgWzAsIDFdLCBbMC45LCAxLjFdKSxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGludGVycG9sYXRlQ29sb3IoXG4gICAgICAgICAgICBwdWxzZSxcbiAgICAgICAgICAgIFswLCAxXSxcbiAgICAgICAgICAgIFtDT09MW2luZGV4XSwgV0FSTVtpbmRleF1dLFxuICAgICAgICAgICksXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gTW9kZUJ1dHRvbih7XG4gIGxhYmVsLFxuICBzZWxlY3RlZCxcbiAgb25QcmVzcyxcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgc2VsZWN0ZWQ6IGJvb2xlYW47XG4gIG9uUHJlc3M6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25QcmVzc31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLm1vZGVCdXR0b25TdHlsZSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzZWxlY3RlZCA/IENvbG9ycy5wcmltYXJ5MTAwIDogQ29sb3JzLnN1cmZhY2UzMDAsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17e1xuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHNlbGVjdGVkID8gQ29sb3JzLnByaW1hcnkxMDAgOiBDb2xvcnMuc3VyZmFjZTUwMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBjb2xvcjogc2VsZWN0ZWQgPyBDb2xvcnMudGV4dENvbG9yNDAwIDogQ29sb3JzLnRleHRDb2xvcjEwMCxcbiAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLnNtLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbmNvbnN0IGxhbmVzU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiAxMCxcbn07XG5cbmNvbnN0IGxhbmVTdHlsZTogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogMiAqIEFNUCArIFNRVUFSRSxcbiAgaGVpZ2h0OiBTUVVBUkUsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxufTtcblxuY29uc3Qgc3F1YXJlU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IFNRVUFSRSxcbiAgaGVpZ2h0OiBTUVVBUkUsXG4gIGJvcmRlclJhZGl1czogMTAsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG59O1xuXG5jb25zdCByb3dTdHlsZTogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBnYXA6IDEwLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbn07XG5cbmNvbnN0IG1vZGVCdXR0b25TdHlsZTogQmV2eVN0eWxlID0ge1xuICBwYWRkaW5nOiB7IHRvcDogOCwgcmlnaHQ6IDE0LCBib3R0b206IDgsIGxlZnQ6IDE0IH0sXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTMwMCxcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG59O1xuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcblxuaW1wb3J0IHsgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gQSBwdXJlLVVJIGRlbW8gb2YgQ1NTLWxpa2UgYHRyYW5zaXRpb25gOiBhIHN0eWxlIGNoYW5nZSAoaG92ZXIvcHJlc3MsIG9yIFJlYWN0XG4vLyBzdGF0ZSkgKmVhc2VzKiBpbnN0ZWFkIG9mIHNuYXBwaW5nLCBnb3Zlcm5lZCBieSB0aGUgc2FtZSBCZXZ5IGFuaW1hdGlvbiBlbmdpbmVcbi8vIGFzIGBhbmltYXRlZFN0eWxlYCDigJQgYnV0IGZ1bGx5IGRlY2xhcmF0aXZlLCBubyBzaGFyZWQgdmFsdWVzIG9yIGV2ZW50IHdpcmluZy5cblxuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zaXRpb25EZW1vKCkge1xuICBjb25zdCBbb24sIHNldE9uXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIkEgYHRyYW5zaXRpb25gIGVhc2VzIGhvdmVyL3ByZXNzIHN0eWxlIGNoYW5nZXMgaW5zdGVhZCBvZiBzbmFwcGluZyB0aGVtLlwiXG4gICAgICAgIHRzeD17YDxidXR0b25cbiAgc3R5bGU9e3sgdHJhbnNmb3JtOiB7IHNjYWxlOiAxIH0sIHRyYW5zaXRpb246IHtcbiAgICB0cmFuc2Zvcm06IHsgZHVyYXRpb246IDEyMCwgZWFzaW5nOiBcImVhc2VPdXRcIiB9LFxuICAgIGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMTgwIH0sXG4gIH19fVxuICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCIjODliNGZhXCIgfX1cbiAgcHJlc3NTdHlsZT17eyB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOTIgfSB9fVxuLz5gfVxuICAgICAgPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLnBpbGxTdHlsZSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHsgc2NhbGU6IDEgfSxcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiB7IGR1cmF0aW9uOiAxMjAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB7IGR1cmF0aW9uOiAxODAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkyMDAgfX1cbiAgICAgICAgICBwcmVzc1N0eWxlPXt7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOTIgfSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkzMDAsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXtsYWJlbFN0eWxlfT5QcmVzcyBtZTwvdGV4dD5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiVHJhbnNpdGlvbnMgYWxzbyBlYXNlIHBsYWluIFJlYWN0LXN0YXRlIGNoYW5nZXM7IGhlcmUgYSBzcHJpbmcgZHJpdmVzIHRoZSB0b2dnbGUuXCJcbiAgICAgICAgdHN4PXtgPGJ1dHRvblxuICBzdHlsZT17e1xuICAgIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVYOiBvbiA/IDM2IDogLTM2IH0sXG4gICAgdHJhbnNpdGlvbjogeyB0cmFuc2Zvcm06IHsgc3RpZmZuZXNzOiAxODAsIGRhbXBpbmc6IDE0IH0gfSxcbiAgfX1cbi8+YH1cbiAgICAgID5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9uKCh2KSA9PiAhdil9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLnBpbGxTdHlsZSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb24gPyBDb2xvcnMuZ3JlZW4xMDAgOiBDb2xvcnMuc3VyZmFjZTUwMCxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9uID8gMSA6IDAuNixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVYOiBvbiA/IDM2IDogLTM2IH0sXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogeyBzdGlmZm5lc3M6IDE4MCwgZGFtcGluZzogMTQgfSxcbiAgICAgICAgICAgICAgb3BhY2l0eTogeyBkdXJhdGlvbjogMjAwIH0sXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMjAwIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17bGFiZWxTdHlsZX0+e29uID8gXCJPTlwiIDogXCJPRkZcIn08L3RleHQ+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9FeGFtcGxlPlxuICAgIDwvPlxuICApO1xufVxuXG5jb25zdCBwaWxsU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDE2MCxcbiAgaGVpZ2h0OiA1NixcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGJvcmRlclJhZGl1czogOCxcbn07XG5cbmNvbnN0IGxhYmVsU3R5bGU6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3I0MDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMuYmFzZSxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG59O1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQW5pbWF0ZWQsIEVhc2luZ05hbWUsIHVzZVNoYXJlZFZhbHVlLCB3aXRoVGltaW5nIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgRXhhbXBsZSwgU2xpZGVyIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgY29sdW1uLCBwbGF5QnV0dG9uLCBwbGF5TGFiZWwgfSBmcm9tIFwiLi9zaGFyZWRcIjtcbmltcG9ydCB7IENvbG9ycywgRm9udFNpemVzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gVGhlIGZvdXIgZWFzaW5nIGN1cnZlcywgcmFjZWQgc2lkZSBieSBzaWRlIG92ZXIgdGhlIHNhbWUgZGlzdGFuY2UvZHVyYXRpb24gc29cbi8vIHRoZWlyIGFjY2VsZXJhdGlvbiBwcm9maWxlcyBhcmUgZWFzeSB0byBjb21wYXJlLlxuXG5jb25zdCBUUkFWRUwgPSAyMDA7XG5jb25zdCBET1QgPSAyNDtcblxuY29uc3QgTEFORVM6IHsgbmFtZTogc3RyaW5nOyBlYXNpbmc6IEVhc2luZ05hbWU7IGNvbG9yOiBzdHJpbmcgfVtdID0gW1xuICB7IG5hbWU6IFwibGluZWFyXCIsIGVhc2luZzogXCJsaW5lYXJcIiwgY29sb3I6IENvbG9ycy5wcmltYXJ5MTAwIH0sXG4gIHsgbmFtZTogXCJlYXNlSW5cIiwgZWFzaW5nOiBcImVhc2VJblwiLCBjb2xvcjogQ29sb3JzLmdyZWVuMTAwIH0sXG4gIHsgbmFtZTogXCJlYXNlT3V0XCIsIGVhc2luZzogXCJlYXNlT3V0XCIsIGNvbG9yOiBDb2xvcnMucmVkMTAwIH0sXG4gIHsgbmFtZTogXCJlYXNlSW5PdXRcIiwgZWFzaW5nOiBcImVhc2VJbk91dFwiLCBjb2xvcjogQ29sb3JzLnB1cnBsZTEwMCB9LFxuXTtcblxuY29uc3QgVFlQRVNDUklQVCA9IGB4LnZhbHVlID0gd2l0aFRpbWluZygyMDAsIHtcbiAgZHVyYXRpb246IDgwMCxcbiAgZWFzaW5nOiBcImVhc2VJbk91dFwiLFxufSk7YDtcblxuZXhwb3J0IGZ1bmN0aW9uIEVhc2luZ0RlbW8oKSB7XG4gIGNvbnN0IFtkdXJhdGlvbiwgc2V0RHVyYXRpb25dID0gdXNlU3RhdGUoODAwKTtcbiAgY29uc3QgW3BsYXksIHNldFBsYXldID0gdXNlU3RhdGUoMCk7XG5cbiAgcmV0dXJuIChcbiAgICA8RXhhbXBsZVxuICAgICAgZGVzY3JpcHRpb249XCJTYW1lIGRpc3RhbmNlLCBzYW1lIGR1cmF0aW9uOiBwcmVzcyBQbGF5IHRvIGNvbXBhcmUgdGhlIGZvdXIgZWFzaW5ncy5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXtjb2x1bW59PlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDggfX0+XG4gICAgICAgICAge0xBTkVTLm1hcCgobGFuZSkgPT4gKFxuICAgICAgICAgICAgPExhbmUga2V5PXtsYW5lLm5hbWV9IHsuLi5sYW5lfSBkdXJhdGlvbj17ZHVyYXRpb259IHBsYXk9e3BsYXl9IC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPFNsaWRlclxuICAgICAgICAgIHZhbHVlPXtkdXJhdGlvbn1cbiAgICAgICAgICBtaW49ezIwMH1cbiAgICAgICAgICBtYXg9ezIwMDB9XG4gICAgICAgICAgb25DaGFuZ2U9e3NldER1cmF0aW9ufVxuICAgICAgICAgIGxhYmVsPXtgZHVyYXRpb24gJHtkdXJhdGlvbi50b0ZpeGVkKDApfW1zYH1cbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHN0eWxlPXtwbGF5QnV0dG9ufVxuICAgICAgICAgIHByZXNzU3R5bGU9e3sgdHJhbnNmb3JtOiB7IHNjYWxlOiAwLjkyIH0gfX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQbGF5KChuKSA9PiBuICsgMSl9XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17cGxheUxhYmVsfT5QbGF5PC90ZXh0PlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvbm9kZT5cbiAgICA8L0V4YW1wbGU+XG4gICk7XG59XG5cbnR5cGUgTGFuZVByb3BzID0ge1xuICBuYW1lOiBzdHJpbmc7XG4gIGVhc2luZzogRWFzaW5nTmFtZTtcbiAgY29sb3I6IHN0cmluZztcbiAgZHVyYXRpb246IG51bWJlcjtcbiAgcGxheTogbnVtYmVyO1xufTtcblxuZnVuY3Rpb24gTGFuZSh7IG5hbWUsIGVhc2luZywgY29sb3IsIGR1cmF0aW9uLCBwbGF5IH06IExhbmVQcm9wcykge1xuICBjb25zdCB4ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIGNvbnN0IG1vdW50ZWQgPSB1c2VSZWYoZmFsc2UpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFtb3VudGVkLmN1cnJlbnQpIHtcbiAgICAgIG1vdW50ZWQuY3VycmVudCA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHgudmFsdWUgPSAwO1xuICAgIHgudmFsdWUgPSB3aXRoVGltaW5nKFRSQVZFTCwgeyBkdXJhdGlvbiwgZWFzaW5nIH0pO1xuICB9LCBbeCwgZWFzaW5nLCBkdXJhdGlvbiwgcGxheV0pO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2xhbmV9PlxuICAgICAgPHRleHQgc3R5bGU9e2xhbmVMYWJlbH0+e25hbWV9PC90ZXh0PlxuICAgICAgPG5vZGUgc3R5bGU9e3RyYWNrfT5cbiAgICAgICAgPEFuaW1hdGVkLm5vZGVcbiAgICAgICAgICBzdHlsZT17eyAuLi5kb3QsIGJhY2tncm91bmRDb2xvcjogY29sb3IgfX1cbiAgICAgICAgICBhbmltYXRlZFN0eWxlPXt7IHRyYW5zbGF0ZVg6IHggfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IGxhbmU6IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiAxMCxcbn07XG5cbmNvbnN0IGxhbmVMYWJlbDogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogNzYsXG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMjAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnhzLFxuICB0ZXh0QWxpZ246IFwicmlnaHRcIixcbn07XG5cbmNvbnN0IHRyYWNrOiBCZXZ5U3R5bGUgPSB7XG4gIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIHdpZHRoOiBUUkFWRUwgKyBET1QsXG4gIGhlaWdodDogRE9UICsgNixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiA2LFxufTtcblxuY29uc3QgZG90OiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiBET1QsXG4gIGhlaWdodDogRE9ULFxuICBib3JkZXJSYWRpdXM6IDYsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMsIEdyYWRpZW50cyB9IGZyb20gXCJAL3RoZW1lXCI7XG5cbi8vIFNoYXJlZCBiaXRzIGZvciB0aGUgYW5pbWF0aW9uIGRlbW9zOiB0aGUgc3RhbmRhcmQgY29sdW1uIGxheW91dCBhbmQgYSBcIlBsYXlcIi1zdHlsZVxuLy8gYnV0dG9uIHNvIHRoZSBpbnRlcmFjdGl2ZSB0cmlnZ2VycyBsb29rIGNvbnNpc3RlbnQuIENvbG9ycyBjb21lIGZyb20gLi4vLi4vdGhlbWUuXG5cbmV4cG9ydCBjb25zdCBjb2x1bW46IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiAxNixcbn07XG5cbmV4cG9ydCBjb25zdCBwbGF5QnV0dG9uOiBCZXZ5U3R5bGUgPSB7XG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBwYWRkaW5nOiB7IHRvcDogOCwgcmlnaHQ6IDE4LCBib3R0b206IDgsIGxlZnQ6IDE4IH0sXG4gIGJvcmRlclJhZGl1czogOCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgYmFja2dyb3VuZEdyYWRpZW50OiBHcmFkaWVudHMucHJpbWFyeSxcbiAgdHJhbnNmb3JtOiB7IHNjYWxlOiAxIH0sXG4gIHRyYW5zaXRpb246IHsgdHJhbnNmb3JtOiB7IGR1cmF0aW9uOiAxMDAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSB9LFxufTtcblxuZXhwb3J0IGNvbnN0IHBsYXlMYWJlbDogQmV2eVN0eWxlID0ge1xuICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjQwMCxcbiAgZm9udFNpemU6IEZvbnRTaXplcy5zbSxcbiAgZm9udFdlaWdodDogXCJib2xkXCIsXG59O1xuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBBbmltYXRlZCwgdXNlU2hhcmVkVmFsdWUsIHdpdGhTcHJpbmcgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBFeGFtcGxlLCBTbGlkZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBjb2x1bW4sIHBsYXlCdXR0b24sIHBsYXlMYWJlbCB9IGZyb20gXCIuL3NoYXJlZFwiO1xuaW1wb3J0IHsgQ29sb3JzLCBHcmFkaWVudHMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG4vLyBBIGRhbXBlZCBzcHJpbmc6IHR1bmUgc3RpZmZuZXNzIGFuZCBkYW1waW5nLCB0aGVuIHdhdGNoIHRoZSBzcXVhcmUgc2V0dGxlLlxuXG5jb25zdCBUWVBFU0NSSVBUID0gYHgudmFsdWUgPSB3aXRoU3ByaW5nKDkwLCB7XG4gIHN0aWZmbmVzczogMTIwLFxuICBkYW1waW5nOiAxMixcbn0pO2A7XG5cbmV4cG9ydCBmdW5jdGlvbiBTcHJpbmdEZW1vKCkge1xuICBjb25zdCBbc3RpZmZuZXNzLCBzZXRTdGlmZm5lc3NdID0gdXNlU3RhdGUoMTIwKTtcbiAgY29uc3QgW2RhbXBpbmcsIHNldERhbXBpbmddID0gdXNlU3RhdGUoMTIpO1xuICBjb25zdCBbcmlnaHQsIHNldFJpZ2h0XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgeCA9IHVzZVNoYXJlZFZhbHVlKC05MCk7XG5cbiAgY29uc3QgYm91bmNlID0gKCkgPT4ge1xuICAgIGNvbnN0IHRvID0gcmlnaHQgPyAtOTAgOiA5MDtcbiAgICB4LnZhbHVlID0gd2l0aFNwcmluZyh0bywgeyBzdGlmZm5lc3MsIGRhbXBpbmcgfSk7XG4gICAgc2V0UmlnaHQoIXJpZ2h0KTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxFeGFtcGxlXG4gICAgICBkZXNjcmlwdGlvbj1cIkEgcGh5c2ljYWwgc3ByaW5nOiBsb3cgZGFtcGluZyBvdmVyc2hvb3RzIGFuZCB3b2JibGVzLCBoaWdoIGRhbXBpbmcgZ2xpZGVzLlwiXG4gICAgICB0c3g9e1RZUEVTQ1JJUFR9XG4gICAgPlxuICAgICAgPG5vZGUgc3R5bGU9e2NvbHVtbn0+XG4gICAgICAgIDxub2RlIHN0eWxlPXtzdGFnZX0+XG4gICAgICAgICAgPEFuaW1hdGVkLm5vZGUgc3R5bGU9e3NxdWFyZX0gYW5pbWF0ZWRTdHlsZT17eyB0cmFuc2xhdGVYOiB4IH19IC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPFNsaWRlclxuICAgICAgICAgIHZhbHVlPXtzdGlmZm5lc3N9XG4gICAgICAgICAgbWluPXsyMH1cbiAgICAgICAgICBtYXg9ezMwMH1cbiAgICAgICAgICBvbkNoYW5nZT17c2V0U3RpZmZuZXNzfVxuICAgICAgICAgIGxhYmVsPXtgc3RpZmZuZXNzICR7c3RpZmZuZXNzLnRvRml4ZWQoMCl9YH1cbiAgICAgICAgLz5cbiAgICAgICAgPFNsaWRlclxuICAgICAgICAgIHZhbHVlPXtkYW1waW5nfVxuICAgICAgICAgIG1pbj17Mn1cbiAgICAgICAgICBtYXg9ezQwfVxuICAgICAgICAgIG9uQ2hhbmdlPXtzZXREYW1waW5nfVxuICAgICAgICAgIGxhYmVsPXtgZGFtcGluZyAke2RhbXBpbmcudG9GaXhlZCgwKX1gfVxuICAgICAgICAvPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgc3R5bGU9e3BsYXlCdXR0b259XG4gICAgICAgICAgcHJlc3NTdHlsZT17eyB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOTIgfSB9fVxuICAgICAgICAgIG9uQ2xpY2s9e2JvdW5jZX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXtwbGF5TGFiZWx9PkJvdW5jZTwvdGV4dD5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L25vZGU+XG4gICAgPC9FeGFtcGxlPlxuICApO1xufVxuXG5jb25zdCBzdGFnZTogQmV2eVN0eWxlID0ge1xuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgd2lkdGg6IDI0MCxcbiAgaGVpZ2h0OiA2NCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbn07XG5cbmNvbnN0IHNxdWFyZTogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogNDAsXG4gIGhlaWdodDogNDAsXG4gIGJvcmRlclJhZGl1czogMTAsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGJhY2tncm91bmRHcmFkaWVudDogR3JhZGllbnRzLnByaW1hcnksXG59O1xuIiwgImltcG9ydCB7XG4gIEFuaW1hdGVkLFxuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aERlbGF5LFxuICB3aXRoU2VxdWVuY2UsXG4gIHdpdGhUaW1pbmcsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEV4YW1wbGUgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBjb2x1bW4sIHBsYXlCdXR0b24sIHBsYXlMYWJlbCB9IGZyb20gXCIuL3NoYXJlZFwiO1xuaW1wb3J0IHsgQ29sb3JzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gd2l0aFNlcXVlbmNlIGNoYWlucyBkcml2ZXJzIOKAlCBlYWNoIHN0YXJ0cyB3aGVyZSB0aGUgcHJldmlvdXMgZW5kZWQg4oCUIGFuZFxuLy8gd2l0aERlbGF5IGluc2VydHMgdGhlIHBhdXNlcyBiZXR3ZWVuIHRoZW0uXG5cbmNvbnN0IFRZUEVTQ1JJUFQgPSBgeC52YWx1ZSA9IHdpdGhTZXF1ZW5jZShcbiAgd2l0aFRpbWluZygxMTAsIHsgZWFzaW5nOiBcImVhc2VPdXRcIiB9KSxcbiAgd2l0aERlbGF5KDI1MCwgd2l0aFRpbWluZygtMTEwKSksXG4gIHdpdGhEZWxheSgyNTAsIHdpdGhUaW1pbmcoMCkpLFxuKTtgO1xuXG5leHBvcnQgZnVuY3Rpb24gU2VxdWVuY2VEZW1vKCkge1xuICBjb25zdCB4ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG5cbiAgY29uc3QgcnVuID0gKCkgPT4ge1xuICAgIHgudmFsdWUgPSB3aXRoU2VxdWVuY2UoXG4gICAgICB3aXRoVGltaW5nKDExMCwgeyBkdXJhdGlvbjogNDUwLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0pLFxuICAgICAgd2l0aERlbGF5KDI1MCwgd2l0aFRpbWluZygtMTEwLCB7IGR1cmF0aW9uOiA0NTAsIGVhc2luZzogXCJlYXNlSW5PdXRcIiB9KSksXG4gICAgICB3aXRoRGVsYXkoMjUwLCB3aXRoVGltaW5nKDAsIHsgZHVyYXRpb246IDM1MCwgZWFzaW5nOiBcImVhc2VJblwiIH0pKSxcbiAgICApO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEV4YW1wbGVcbiAgICAgIGRlc2NyaXB0aW9uPVwiUHJlc3MgUGxheTogc2xpZGUgcmlnaHQsIHBhdXNlLCBzbGlkZSBsZWZ0LCBwYXVzZSwgcmV0dXJuIC0gb25lIGNvbXBvc2VkIGRyaXZlci5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXtjb2x1bW59PlxuICAgICAgICA8bm9kZSBzdHlsZT17c3RhZ2V9PlxuICAgICAgICAgIDxBbmltYXRlZC5ub2RlIHN0eWxlPXtzcXVhcmV9IGFuaW1hdGVkU3R5bGU9e3sgdHJhbnNsYXRlWDogeCB9fSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBzdHlsZT17cGxheUJ1dHRvbn1cbiAgICAgICAgICBwcmVzc1N0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMC45MiB9IH19XG4gICAgICAgICAgb25DbGljaz17cnVufVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3BsYXlMYWJlbH0+UGxheTwvdGV4dD5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L25vZGU+XG4gICAgPC9FeGFtcGxlPlxuICApO1xufVxuXG5jb25zdCBzdGFnZTogQmV2eVN0eWxlID0ge1xuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgd2lkdGg6IDI4MCxcbiAgaGVpZ2h0OiA2NCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbn07XG5cbmNvbnN0IHNxdWFyZTogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogNDAsXG4gIGhlaWdodDogNDAsXG4gIGJvcmRlclJhZGl1czogMTAsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLmdyZWVuMTAwLFxufTtcbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgQW5pbWF0ZWQsXG4gIGNhbmNlbEFuaW1hdGlvbixcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhSZXBlYXQsXG4gIHdpdGhUaW1pbmcsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEV4YW1wbGUgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBjb2x1bW4sIHBsYXlCdXR0b24sIHBsYXlMYWJlbCB9IGZyb20gXCIuL3NoYXJlZFwiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG4vLyB3aXRoUmVwZWF0IGxvb3BzIGEgZHJpdmVyIGZvcmV2ZXIgKGNvdW50IC0xKTsgY2FuY2VsQW5pbWF0aW9uIGZyZWV6ZXMgdGhlXG4vLyBzaGFyZWQgdmFsdWUgd2hlcmV2ZXIgaXQgY3VycmVudGx5IGlzLlxuXG5jb25zdCBUWVBFU0NSSVBUID0gYHJvdC52YWx1ZSA9IHdpdGhSZXBlYXQoXG4gIHdpdGhUaW1pbmcoTWF0aC5QSSAqIDIsIHsgZWFzaW5nOiBcImxpbmVhclwiIH0pLFxuICAtMSxcbik7XG5jYW5jZWxBbmltYXRpb24ocm90KTsgLy8gZnJlZXplYDtcblxuZXhwb3J0IGZ1bmN0aW9uIFNwaW5EZW1vKCkge1xuICBjb25zdCByb3QgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgY29uc3QgW3NwaW5uaW5nLCBzZXRTcGlubmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgY29uc3Qgc3RhcnQgPSAoKSA9PiB7XG4gICAgcm90LnZhbHVlID0gMDtcbiAgICByb3QudmFsdWUgPSB3aXRoUmVwZWF0KFxuICAgICAgd2l0aFRpbWluZyhNYXRoLlBJICogMiwgeyBkdXJhdGlvbjogMTIwMCwgZWFzaW5nOiBcImxpbmVhclwiIH0pLFxuICAgICAgLTEsXG4gICAgKTtcbiAgICBzZXRTcGlubmluZyh0cnVlKTtcbiAgfTtcblxuICBjb25zdCBzdG9wID0gKCkgPT4ge1xuICAgIGNhbmNlbEFuaW1hdGlvbihyb3QpO1xuICAgIHNldFNwaW5uaW5nKGZhbHNlKTtcbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxFeGFtcGxlXG4gICAgICBkZXNjcmlwdGlvbj1cIkFuIGVuZGxlc3Mgcm90YXRpb24gdmlhIHdpdGhSZXBlYXQ7IFN0b3AgY2FsbHMgY2FuY2VsQW5pbWF0aW9uIHRvIGZyZWV6ZSBpdC5cIlxuICAgICAgdHN4PXtUWVBFU0NSSVBUfVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXtjb2x1bW59PlxuICAgICAgICA8bm9kZSBzdHlsZT17c3RhZ2V9PlxuICAgICAgICAgIDxBbmltYXRlZC5ub2RlIHN0eWxlPXtzcXVhcmV9IGFuaW1hdGVkU3R5bGU9e3sgcm90YXRlOiByb3QgfX0+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17c3F1YXJlVGV4dH0+XjwvdGV4dD5cbiAgICAgICAgICA8L0FuaW1hdGVkLm5vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAxMCB9fT5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBzdHlsZT17cGxheUJ1dHRvbn1cbiAgICAgICAgICAgIHByZXNzU3R5bGU9e3sgdHJhbnNmb3JtOiB7IHNjYWxlOiAwLjkyIH0gfX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3N0YXJ0fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXtwbGF5TGFiZWx9PntzcGlubmluZyA/IFwiUmVzdGFydFwiIDogXCJTdGFydFwifTwvdGV4dD5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBzdHlsZT17eyAuLi5wbGF5QnV0dG9uLCBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5yZWQxMDAgfX1cbiAgICAgICAgICAgIHByZXNzU3R5bGU9e3sgdHJhbnNmb3JtOiB7IHNjYWxlOiAwLjkyIH0gfX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3N0b3B9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3BsYXlMYWJlbH0+U3RvcDwvdGV4dD5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgIDwvRXhhbXBsZT5cbiAgKTtcbn1cblxuY29uc3Qgc3RhZ2U6IEJldnlTdHlsZSA9IHtcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gIHdpZHRoOiAxNjAsXG4gIGhlaWdodDogMTIwLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBib3JkZXJSYWRpdXM6IDEyLFxufTtcblxuY29uc3Qgc3F1YXJlOiBCZXZ5U3R5bGUgPSB7XG4gIHdpZHRoOiA2NCxcbiAgaGVpZ2h0OiA2NCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHVycGxlMTAwLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbn07XG5cbmNvbnN0IHNxdWFyZVRleHQ6IEJldnlTdHlsZSA9IHtcbiAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3I0MDAsXG4gIGZvbnRTaXplOiBGb250U2l6ZXMueHhsLFxuICBmb250V2VpZ2h0OiBcImJvbGRcIixcbn07XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIEFuaW1hdGVkLFxuICBpbnRlcnBvbGF0ZSxcbiAgaW50ZXJwb2xhdGVDb2xvcixcbiAgdXNlU2hhcmVkVmFsdWUsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEV4YW1wbGUsIFNsaWRlciB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IGNvbHVtbiB9IGZyb20gXCIuL3NoYXJlZFwiO1xuaW1wb3J0IHsgQ29sb3JzIH0gZnJvbSBcIkAvdGhlbWVcIjtcblxuLy8gT25lIHNoYXJlZCB2YWx1ZSwgbWFueSBvdXRwdXRzOiBhIHNsaWRlciBzZXRzIGl0IGRpcmVjdGx5LCBhbmQgaW50ZXJwb2xhdGUgL1xuLy8gaW50ZXJwb2xhdGVDb2xvciBtYXAgaXQgb250byBzY2FsZSBhbmQgYmFja2dyb3VuZCBjb2xvciBlYWNoIGZyYW1lIGluIEJldnkuXG5cbmNvbnN0IFRZUEVTQ1JJUFQgPSBgYW5pbWF0ZWRTdHlsZT17e1xuICBzY2FsZTogaW50ZXJwb2xhdGUodCwgWzAsIDFdLCBbMC42LCAxLjRdKSxcbiAgYmFja2dyb3VuZENvbG9yOiBpbnRlcnBvbGF0ZUNvbG9yKFxuICAgIHQsIFswLCAxXSwgW1wiIzdhYTJmN1wiLCBcIiNmNzc2OGVcIl0sXG4gICksXG59fWA7XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnRlcnBvbGF0ZURlbW8oKSB7XG4gIGNvbnN0IHQgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgY29uc3QgW3YsIHNldFZdID0gdXNlU3RhdGUoMCk7XG5cbiAgY29uc3Qgb25DaGFuZ2UgPSAobjogbnVtYmVyKSA9PiB7XG4gICAgc2V0VihuKTtcbiAgICB0LnZhbHVlID0gbjsgLy8gaW1tZWRpYXRlIHNldCDigJQgZHJpdmVzIHRoZSBiaW5kaW5ncyBiZWxvd1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEV4YW1wbGVcbiAgICAgIGRlc2NyaXB0aW9uPVwiRHJhZyB0aGUgdmFsdWUgMCB0byAxIGFuZCB3YXRjaCBvbmUgc2hhcmVkIHZhbHVlIGRyaXZlIGJvdGggc2NhbGUgYW5kIGNvbG9yLlwiXG4gICAgICB0c3g9e1RZUEVTQ1JJUFR9XG4gICAgPlxuICAgICAgPG5vZGUgc3R5bGU9e2NvbHVtbn0+XG4gICAgICAgIDxub2RlIHN0eWxlPXtzdGFnZX0+XG4gICAgICAgICAgPEFuaW1hdGVkLm5vZGVcbiAgICAgICAgICAgIHN0eWxlPXtzcXVhcmV9XG4gICAgICAgICAgICBhbmltYXRlZFN0eWxlPXt7XG4gICAgICAgICAgICAgIHNjYWxlOiBpbnRlcnBvbGF0ZSh0LCBbMCwgMV0sIFswLjYsIDEuNF0pLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGludGVycG9sYXRlQ29sb3IoXG4gICAgICAgICAgICAgICAgdCxcbiAgICAgICAgICAgICAgICBbMCwgMV0sXG4gICAgICAgICAgICAgICAgW0NvbG9ycy5wcmltYXJ5MTAwLCBDb2xvcnMucmVkMTAwXSxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8U2xpZGVyXG4gICAgICAgICAgdmFsdWU9e3Z9XG4gICAgICAgICAgbWluPXswfVxuICAgICAgICAgIG1heD17MX1cbiAgICAgICAgICBvbkNoYW5nZT17b25DaGFuZ2V9XG4gICAgICAgICAgbGFiZWw9e2B0ICR7di50b0ZpeGVkKDIpfWB9XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgPC9FeGFtcGxlPlxuICApO1xufVxuXG5jb25zdCBzdGFnZTogQmV2eVN0eWxlID0ge1xuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgd2lkdGg6IDIwMCxcbiAgaGVpZ2h0OiAxMjAsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG4gIGJvcmRlclJhZGl1czogMTIsXG59O1xuXG5jb25zdCBzcXVhcmU6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDY0LFxuICBoZWlnaHQ6IDY0LFxuICBib3JkZXJSYWRpdXM6IDEyLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxufTtcbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBFeGFtcGxlLCBUZXh0TW9ubyB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBib3gsIGNhcHRpb24sIHJvdywgc3RhZ2UgfSBmcm9tIFwiLi9zaGFyZWRcIjtcblxuLy8gQSBjcm9zcy1jdXR0aW5nIHJlZmVyZW5jZSBmb3IgdGhlIHVuaXQgKnN0cmluZ3MqIHRoZSBzdHlsZSBwcm9wcyBhY2NlcHQuIEVhY2hcbi8vIHNlY3Rpb24gc2hvd3Mgc2V2ZXJhbCBub3RhdGlvbnMgc2lkZSBieSBzaWRlOyB3aGVyZSB0aGUgdW5pdHMgYXJlIGVxdWl2YWxlbnRcbi8vIChhbmdsZXMsIHRpbWUpIHRoZSByZXN1bHRzIGFyZSB2aXNpYmx5IGlkZW50aWNhbC4gQ29sb3JzIGdldCB0aGVpciBvd25cbi8vIGludGVyYWN0aXZlIG1peGVyIGluIHRoZSBDb2xvcnMgZGVtbyDigJQgaGVyZSBqdXN0IGEgY29tcGFjdCBzd2F0Y2ggcm93LlxuZXhwb3J0IGZ1bmN0aW9uIFVuaXRzRGVtbygpIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJMZW5ndGhzOiBhIGJhcmUgbnVtYmVyIGlzIHB4OyBzdHJpbmdzIGNhcnJ5IGEgdW5pdC4gJSBpcyByZWxhdGl2ZSB0byB0aGUgcGFyZW50LCB2dy92aC92bWluL3ZtYXggdG8gdGhlIHZpZXdwb3J0LCBwbHVzIGF1dG8uXCJcbiAgICAgICAgdHN4PXtgd2lkdGg6IFwiODBweFwiIHwgXCI1MCVcIiB8IFwiMTB2d1wiYH1cbiAgICAgID5cbiAgICAgICAgPExlbmd0aFNlY3Rpb24gLz5cbiAgICAgIDwvRXhhbXBsZT5cblxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJGb250IHNpemU6IGEgYmFyZSBudW1iZXIgaXMgcHg7IHN0cmluZ3MgY2FycnkgcHgsIHZpZXdwb3J0IHVuaXRzICh2dy92aC92bWluL3ZtYXgpLCBvciByZW0gKHJlbGF0aXZlIHRvIEJldnkncyBSZW1TaXplLCBkZWZhdWx0IDIwcHgpLlwiXG4gICAgICAgIHRzeD17YGZvbnRTaXplOiBcIjE0cHhcIiB8IFwiMS41cmVtXCIgfCBcIjJ2d1wiYH1cbiAgICAgID5cbiAgICAgICAgPEZvbnRTaXplU2VjdGlvbiAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIkFuZ2xlczogYSBiYXJlIG51bWJlciBpcyBkZWdyZWVzOyBzdHJpbmdzIGNhcnJ5IGRlZy9yYWQvdHVybi9ncmFkLiBUaGVzZSBmb3VyIGFyZSB0aGUgc2FtZSA0NcKwIHdyaXR0ZW4gZm91ciB3YXlzLlwiXG4gICAgICAgIHRzeD17YHJvdGF0ZTogXCI0NWRlZ1wiIHwgXCIwLjc4NXJhZFwiIHwgXCIwLjEyNXR1cm5cIiB8IFwiNTBncmFkXCJgfVxuICAgICAgPlxuICAgICAgICA8QW5nbGVTZWN0aW9uIC8+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiVGltZTogYSBiYXJlIG51bWJlciBpcyBtaWxsaXNlY29uZHM7IHN0cmluZ3MgY2FycnkgbXMvcy4gQm90aCBib3hlcyBlYXNlIGlkZW50aWNhbGx5IOKAlCBjbGljayBlaXRoZXIgdG8gdG9nZ2xlLlwiXG4gICAgICAgIHRzeD17YGR1cmF0aW9uOiBcIjMwMG1zXCIgIOKJoSAgZHVyYXRpb246IFwiMC4zc1wiYH1cbiAgICAgID5cbiAgICAgICAgPFRpbWVTZWN0aW9uIC8+XG4gICAgICA8L0V4YW1wbGU+XG4gICAgPC8+XG4gICk7XG59XG5cbmNvbnN0IExFTkdUSFMgPSBbXCI4MHB4XCIsIFwiNTAlXCIsIFwiMTB2d1wiXTtcblxuZnVuY3Rpb24gTGVuZ3RoU2VjdGlvbigpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDEwLCB3aWR0aDogMzYwIH19PlxuICAgICAge0xFTkdUSFMubWFwKCh3KSA9PiAoXG4gICAgICAgIDxub2RlIGtleT17d30gc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA0IH19PlxuICAgICAgICAgIDxUZXh0TW9ubyBzdHlsZT17Y2FwdGlvbn0+e3d9PC9UZXh0TW9ubz5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IHcsXG4gICAgICAgICAgICAgIGhlaWdodDogMjgsXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNixcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHJpbWFyeTEwMCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBGT05UX1NJWkVTID0gW1wiMTRweFwiLCBcIjEuNXJlbVwiLCBcIjJ2d1wiXTtcblxuZnVuY3Rpb24gRm9udFNpemVTZWN0aW9uKCkge1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMTIgfX0+XG4gICAgICB7Rk9OVF9TSVpFUy5tYXAoKHNpemUpID0+IChcbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBrZXk9e3NpemV9XG4gICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxNCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDkwIH19PlxuICAgICAgICAgICAgPFRleHRNb25vIHN0eWxlPXtjYXB0aW9ufT57c2l6ZX08L1RleHRNb25vPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udFNpemU6IHNpemUsXG4gICAgICAgICAgICAgIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMTAwLFxuICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgQWEgQmIgQ2NcbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgQU5HTEVTID0gW1wiNDVkZWdcIiwgXCIwLjc4NXJhZFwiLCBcIjAuMTI1dHVyblwiLCBcIjUwZ3JhZFwiXTtcblxuZnVuY3Rpb24gQW5nbGVTZWN0aW9uKCkge1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IC4uLnJvdywgZ2FwOiAyNCB9fT5cbiAgICAgIHtBTkdMRVMubWFwKChhbmdsZSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17YW5nbGV9XG4gICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3N0YWdlfT5cbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgLi4uYm94LFxuICAgICAgICAgICAgICAgIHdpZHRoOiA0OCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDQ4LFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnB1cnBsZTEwMCxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHsgcm90YXRlOiBhbmdsZSB9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPFRleHRNb25vIHN0eWxlPXtjYXB0aW9ufT57YW5nbGV9PC9UZXh0TW9ubz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBUaW1lU2VjdGlvbigpIHtcbiAgY29uc3QgW29uLCBzZXRPbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgLi4ucm93LCBnYXA6IDIwIH19PlxuICAgICAgPFRpbWVCb3hcbiAgICAgICAgbGFiZWw9XCIzMDBtc1wiXG4gICAgICAgIGR1cmF0aW9uPVwiMzAwbXNcIlxuICAgICAgICBvbj17b259XG4gICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRPbigodikgPT4gIXYpfVxuICAgICAgLz5cbiAgICAgIDxUaW1lQm94XG4gICAgICAgIGxhYmVsPVwiMC4zc1wiXG4gICAgICAgIGR1cmF0aW9uPVwiMC4zc1wiXG4gICAgICAgIG9uPXtvbn1cbiAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldE9uKCh2KSA9PiAhdil9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxudHlwZSBUaW1lQm94UHJvcHMgPSB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIGR1cmF0aW9uOiBzdHJpbmc7XG4gIG9uOiBib29sZWFuO1xuICBvblRvZ2dsZTogKCkgPT4gdm9pZDtcbn07XG5cbmZ1bmN0aW9uIFRpbWVCb3goeyBsYWJlbCwgZHVyYXRpb24sIG9uLCBvblRvZ2dsZSB9OiBUaW1lQm94UHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEwIH19PlxuICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtvblRvZ2dsZX0gc3R5bGU9e3RpbWVUcmFja30+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmJveCxcbiAgICAgICAgICAgIHdpZHRoOiA0NCxcbiAgICAgICAgICAgIGhlaWdodDogNDQsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5ncmVlbjEwMCxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVYOiBvbiA/IDk2IDogMCB9LFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogeyB0cmFuc2Zvcm06IHsgZHVyYXRpb24sIGVhc2luZzogXCJlYXNlT3V0XCIgfSB9LFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxUZXh0TW9ubyBzdHlsZT17Y2FwdGlvbn0+e2xhYmVsfTwvVGV4dE1vbm8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCB0aW1lVHJhY2s6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDE2MCxcbiAgaGVpZ2h0OiA2NCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbiAgcGFkZGluZzogMTAsXG4gIGp1c3RpZnlDb250ZW50OiBcInN0YXJ0XCIsXG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuXG4vLyBTbWFsbCBzaGFyZWQgYnVpbGRpbmcgYmxvY2tzIHNvIHRoZSBzdHlsaW5nIGRlbW9zIHN0YXkgc2hvcnQgYW5kIGNvbnNpc3RlbnQuXG4vLyBDb2xvcnMgY29tZSBmcm9tIHRoZSBnbG9iYWwgdGhlbWU7IHNlZSAuLi8uLi90aGVtZS5cblxuZXhwb3J0IGNvbnN0IGJveDogQmV2eVN0eWxlID0ge1xuICB3aWR0aDogNzIsXG4gIGhlaWdodDogNzIsXG4gIGJvcmRlclJhZGl1czogMTAsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxufTtcblxuZXhwb3J0IGNvbnN0IHJvdzogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBnYXA6IDEyLFxufTtcblxuZXhwb3J0IGNvbnN0IHN0YWdlOiBCZXZ5U3R5bGUgPSB7XG4gIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICBnYXA6IDEyLFxuICBwYWRkaW5nOiAxNCxcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbn07XG5cbmV4cG9ydCBjb25zdCBjYXB0aW9uOiBCZXZ5U3R5bGUgPSB7XG4gIGNvbG9yOiBDb2xvcnMudGV4dENvbG9yMjAwLFxuICBmb250U2l6ZTogRm9udFNpemVzLnhzLFxufTtcblxuLy8gQSBsaXZlIHRhcmdldCBzdGFja2VkIGFib3ZlIGl0cyBzbGlkZXIocykvY29udHJvbCDigJQgdGhlIHN0YW5kYXJkIGxheW91dCBmb3IgdGhlXG4vLyBpbnRlcmFjdGl2ZSBzdHlsaW5nIGV4YW1wbGVzLlxuZXhwb3J0IGNvbnN0IGNvbnRyb2xDb2x1bW46IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiAxNixcbn07XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEV4YW1wbGUsIFJhZGlvLCBSYWRpb09wdGlvbiwgU2xpZGVyIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzLCBGb250U2l6ZXMgfSBmcm9tIFwiQC90aGVtZVwiO1xuaW1wb3J0IHsgYm94LCBjb250cm9sQ29sdW1uIH0gZnJvbSBcIi4vc2hhcmVkXCI7XG5cbmNvbnN0IHRvSGV4ID0gKG46IG51bWJlcikgPT4gTWF0aC5yb3VuZChuKS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpO1xuXG5leHBvcnQgZnVuY3Rpb24gQ29sb3JzRGVtbygpIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJiYWNrZ3JvdW5kQ29sb3IgZmlsbHMgYSBub2RlLiBNaXggaXQgZnJvbSBSL0cvQiBjaGFubmVscy5cIlxuICAgICAgICB0c3g9e2A8bm9kZSBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwiIzdhYTJmN1wiIH19IC8+YH1cbiAgICAgID5cbiAgICAgICAgPEJhY2tncm91bmRDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiYm9yZGVyQ29sb3IgcGFpbnRzIHRoZSBlZGdlIGxhaWQgb3V0IGJ5IGBib3JkZXJgLlwiXG4gICAgICAgIHRzeD17YGJvcmRlcjogNCwgYm9yZGVyQ29sb3I6IFwiI2JiOWFmN1wiYH1cbiAgICAgID5cbiAgICAgICAgPEJvcmRlckNvbG9yQ29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cImNvbG9yIHNldHMgdGV4dCBjb2xvciBhbmQgaW5oZXJpdHMgaW50byBuZXN0ZWQgPHRleHQ+LlwiXG4gICAgICAgIHRzeD17YDx0ZXh0IHN0eWxlPXt7IGNvbG9yOiBcIiNmOWUyYWZcIiB9fT5gfVxuICAgICAgPlxuICAgICAgICA8VGV4dENvbG9yQ29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIkFueSBDU1MgY29sb3Igd29ya3M6IGhleCwgbmFtZWQsIHJnYigpL2hzbCgpL29rbGNoKCksIG9yIHRyYW5zcGFyZW50LlwiXG4gICAgICAgIHRzeD17YGJhY2tncm91bmRDb2xvcjogXCJyZWJlY2NhcHVycGxlXCJcImB9XG4gICAgICA+XG4gICAgICAgIDxDb2xvckZvcm1hdHNSb3cgLz5cbiAgICAgIDwvRXhhbXBsZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuY29uc3QgQ09MT1JfRk9STUFUUzogc3RyaW5nW10gPSBbXG4gIFwidG9tYXRvXCIsXG4gIFwicmdiKDEyMiAxNjIgMjQ3KVwiLFxuICBcInJnYigxMjIsIDYyLCAyNDcpXCIsXG4gIFwicmdiKDI1NSAyNTUgMjU1IC8gNSUpXCIsXG4gIFwiaHNsKDE0MCA3MCUgNDUlKVwiLFxuICBcIm9rbGNoKDAuNyAwLjE1IDMwKVwiLFxuICBcIiNiYjlhZjdcIixcbl07XG5cbmZ1bmN0aW9uIENvbG9yRm9ybWF0c1JvdygpIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDEwIH19PlxuICAgICAge0NPTE9SX0ZPUk1BVFMubWFwKChjb2xvcikgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17Y29sb3J9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBoZWlnaHQ6IDc2LFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAxMCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3IsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBjb2xvcjogQ29sb3JzLnRleHRDb2xvcjQwMCxcbiAgICAgICAgICAgICAgZm9udFNpemU6IEZvbnRTaXplcy54cyxcbiAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtjb2xvcn1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gQmFja2dyb3VuZENvbnRyb2woKSB7XG4gIGNvbnN0IFtyLCBzZXRSXSA9IHVzZVN0YXRlKDEyMik7XG4gIGNvbnN0IFtnLCBzZXRHXSA9IHVzZVN0YXRlKDE2Mik7XG4gIGNvbnN0IFtiLCBzZXRCXSA9IHVzZVN0YXRlKDI0Nyk7XG4gIGNvbnN0IGNvbG9yID0gYCMke3RvSGV4KHIpfSR7dG9IZXgoZyl9JHt0b0hleChiKX1gO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250cm9sQ29sdW1ufT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmJveCwgd2lkdGg6IDExMCwgaGVpZ2h0OiA3MiwgYmFja2dyb3VuZENvbG9yOiBjb2xvciB9fT5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgY29sb3I6IENvbG9ycy50ZXh0Q29sb3I0MDAsXG4gICAgICAgICAgICBmb250U2l6ZTogRm9udFNpemVzLnhzLFxuICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtjb2xvcn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPFNsaWRlclxuICAgICAgICB2YWx1ZT17cn1cbiAgICAgICAgbWluPXswfVxuICAgICAgICBtYXg9ezI1NX1cbiAgICAgICAgb25DaGFuZ2U9e3NldFJ9XG4gICAgICAgIGxhYmVsPXtgUiAke3IudG9GaXhlZCgwKX1gfVxuICAgICAgLz5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e2d9XG4gICAgICAgIG1pbj17MH1cbiAgICAgICAgbWF4PXsyNTV9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRHfVxuICAgICAgICBsYWJlbD17YEcgJHtnLnRvRml4ZWQoMCl9YH1cbiAgICAgIC8+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXtifVxuICAgICAgICBtaW49ezB9XG4gICAgICAgIG1heD17MjU1fVxuICAgICAgICBvbkNoYW5nZT17c2V0Qn1cbiAgICAgICAgbGFiZWw9e2BCICR7Yi50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3QgQk9SREVSX09QVElPTlM6IFJhZGlvT3B0aW9uPHN0cmluZz5bXSA9IFtcbiAgeyBsYWJlbDogXCJibHVlXCIsIHZhbHVlOiBDb2xvcnMucHJpbWFyeTEwMCB9LFxuICB7IGxhYmVsOiBcImdyZWVuXCIsIHZhbHVlOiBDb2xvcnMuZ3JlZW4xMDAgfSxcbiAgeyBsYWJlbDogXCJyZWRcIiwgdmFsdWU6IENvbG9ycy5yZWQxMDAgfSxcbiAgeyBsYWJlbDogXCJwdXJwbGVcIiwgdmFsdWU6IENvbG9ycy5wdXJwbGUxMDAgfSxcbl07XG5cbmZ1bmN0aW9uIEJvcmRlckNvbG9yQ29udHJvbCgpIHtcbiAgY29uc3QgW2MsIHNldENdID0gdXNlU3RhdGU8c3RyaW5nPihDb2xvcnMucHVycGxlMTAwKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17Y29udHJvbENvbHVtbn0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmJveCxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMjAwLFxuICAgICAgICAgIGJvcmRlcjogNCxcbiAgICAgICAgICBib3JkZXJDb2xvcjogYyxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8UmFkaW8gb3B0aW9ucz17Qk9SREVSX09QVElPTlN9IHZhbHVlPXtjfSBvbkNoYW5nZT17c2V0Q30gLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IFRFWFRfT1BUSU9OUzogUmFkaW9PcHRpb248c3RyaW5nPltdID0gW1xuICB7IGxhYmVsOiBcImFtYmVyXCIsIHZhbHVlOiBDb2xvcnMuYW1iZXIxMDAgfSxcbiAgeyBsYWJlbDogXCJza3lcIiwgdmFsdWU6IENvbG9ycy5za3kxMDAgfSxcbiAgeyBsYWJlbDogXCJncmVlblwiLCB2YWx1ZTogQ29sb3JzLmdyZWVuMTAwIH0sXG4gIHsgbGFiZWw6IFwicmVkXCIsIHZhbHVlOiBDb2xvcnMucmVkMTAwIH0sXG5dO1xuXG5mdW5jdGlvbiBUZXh0Q29sb3JDb250cm9sKCkge1xuICBjb25zdCBbYywgc2V0Q10gPSB1c2VTdGF0ZTxzdHJpbmc+KENvbG9ycy5hbWJlcjEwMCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPHRleHQgc3R5bGU9e3sgY29sb3I6IGMsIGZvbnRTaXplOiBGb250U2l6ZXMueHhsLCBmb250V2VpZ2h0OiBcImJvbGRcIiB9fT5cbiAgICAgICAgQ29sb3JlZCB0ZXh0XG4gICAgICA8L3RleHQ+XG4gICAgICA8UmFkaW8gb3B0aW9ucz17VEVYVF9PUFRJT05TfSB2YWx1ZT17Y30gb25DaGFuZ2U9e3NldEN9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBFeGFtcGxlLCBTbGlkZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBDb2xvcnMgfSBmcm9tIFwiQC90aGVtZVwiO1xuaW1wb3J0IHsgYm94LCBjb250cm9sQ29sdW1uIH0gZnJvbSBcIi4vc2hhcmVkXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBCb3JkZXJzRGVtbygpIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJib3JkZXJSYWRpdXMgcm91bmRzIHRoZSBjb3JuZXJzLiBEcmFnIGZyb20gc3F1YXJlIHRvIHBpbGwuXCJcbiAgICAgICAgdHN4PXtgPG5vZGUgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAxNiB9fSAvPmB9XG4gICAgICA+XG4gICAgICAgIDxSYWRpdXNDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiYm9yZGVyIGFkZHMgYW4gZWRnZSwgcGFpbnRlZCBieSBib3JkZXJDb2xvci5cIlxuICAgICAgICB0c3g9e2Bib3JkZXI6IDIsIGJvcmRlckNvbG9yOiBcIiM3YWEyZjdcImB9XG4gICAgICA+XG4gICAgICAgIDxXaWR0aENvbnRyb2wgLz5cbiAgICAgIDwvRXhhbXBsZT5cblxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJvdXRsaW5lIGRyYXdzIGEgcmluZyBvdXRzaWRlIHRoZSBib3gsIGlnbm9yZWQgYnkgbGF5b3V0LlwiXG4gICAgICAgIHRzeD17YG91dGxpbmU6IHsgd2lkdGg6IDMsIG9mZnNldDogNCwgY29sb3I6IFwiI2Y5ZTJhZlwiIH1gfVxuICAgICAgPlxuICAgICAgICA8T3V0bGluZUNvbnRyb2wgLz5cbiAgICAgIDwvRXhhbXBsZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gUmFkaXVzQ29udHJvbCgpIHtcbiAgY29uc3QgW3IsIHNldFJdID0gdXNlU3RhdGUoMTYpO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250cm9sQ29sdW1ufT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmJveCwgYm9yZGVyUmFkaXVzOiByIH19IC8+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXtyfVxuICAgICAgICBtaW49ezB9XG4gICAgICAgIG1heD17MzZ9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRSfVxuICAgICAgICBsYWJlbD17YGJvcmRlclJhZGl1cyAke3IudG9GaXhlZCgwKX1gfVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFdpZHRoQ29udHJvbCgpIHtcbiAgY29uc3QgW3csIHNldFddID0gdXNlU3RhdGUoMik7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5ib3gsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTIwMCxcbiAgICAgICAgICBib3JkZXI6IHcsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e3d9XG4gICAgICAgIG1pbj17MH1cbiAgICAgICAgbWF4PXsxMn1cbiAgICAgICAgb25DaGFuZ2U9e3NldFd9XG4gICAgICAgIGxhYmVsPXtgYm9yZGVyICR7dy50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gT3V0bGluZUNvbnRyb2woKSB7XG4gIGNvbnN0IFtvZmZzZXQsIHNldE9mZnNldF0gPSB1c2VTdGF0ZSg0KTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17Y29udHJvbENvbHVtbn0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmJveCxcbiAgICAgICAgICBvdXRsaW5lOiB7IHdpZHRoOiAzLCBvZmZzZXQsIGNvbG9yOiBDb2xvcnMuYW1iZXIxMDAgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXtvZmZzZXR9XG4gICAgICAgIG1pbj17MH1cbiAgICAgICAgbWF4PXsxNn1cbiAgICAgICAgb25DaGFuZ2U9e3NldE9mZnNldH1cbiAgICAgICAgbGFiZWw9e2BvdXRsaW5lIG9mZnNldCAke29mZnNldC50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3QvanN4XCI7XG5pbXBvcnQgeyBFeGFtcGxlLCBTbGlkZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzXCI7XG5pbXBvcnQgeyBDb2xvcnMgfSBmcm9tIFwiQC90aGVtZVwiO1xuaW1wb3J0IHsgY29udHJvbENvbHVtbiB9IGZyb20gXCIuL3NoYXJlZFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gU3BhY2luZ0RlbW8oKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwicGFkZGluZyBpbnNldHMgY29udGVudCBmcm9tIHRoZSBub2RlJ3Mgb3duIGVkZ2VzLlwiXG4gICAgICAgIHRzeD17YDxub2RlIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19IC8+YH1cbiAgICAgID5cbiAgICAgICAgPFBhZGRpbmdDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiZ2FwIHNwYWNlcyBmbGV4L2dyaWQgY2hpbGRyZW47IHJvd0dhcC9jb2x1bW5HYXAgc3BsaXQgaXQuXCJcbiAgICAgICAgdHN4PXtgPG5vZGUgc3R5bGU9e3sgZ2FwOiAxNiB9fSAvPmB9XG4gICAgICA+XG4gICAgICAgIDxHYXBDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwibWFyZ2luIHB1c2hlcyBhIG5vZGUgYXdheSBmcm9tIGl0cyBzaWJsaW5ncy5cIlxuICAgICAgICB0c3g9e2BtYXJnaW46IHsgbGVmdDogMjQgfWB9XG4gICAgICA+XG4gICAgICAgIDxNYXJnaW5Db250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG4gICAgPC8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFBhZGRpbmdDb250cm9sKCkge1xuICBjb25zdCBbcCwgc2V0UF0gPSB1c2VTdGF0ZSgxNik7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgLi4ud3JhcCwgcGFkZGluZzogcCB9fT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e2lubmVyfSAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPFNsaWRlclxuICAgICAgICB2YWx1ZT17cH1cbiAgICAgICAgbWluPXswfVxuICAgICAgICBtYXg9ezQwfVxuICAgICAgICBvbkNoYW5nZT17c2V0UH1cbiAgICAgICAgbGFiZWw9e2BwYWRkaW5nICR7cC50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gR2FwQ29udHJvbCgpIHtcbiAgY29uc3QgW2csIHNldEddID0gdXNlU3RhdGUoMTIpO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250cm9sQ29sdW1ufT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IC4uLndyYXAsIGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogZyB9fT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e2lubmVyfSAvPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyAuLi5pbm5lciwgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHVycGxlMTAwIH19IC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmlubmVyLCBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy55ZWxsb3cxMDAgfX0gLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e2d9XG4gICAgICAgIG1pbj17MH1cbiAgICAgICAgbWF4PXszMn1cbiAgICAgICAgb25DaGFuZ2U9e3NldEd9XG4gICAgICAgIGxhYmVsPXtgZ2FwICR7Zy50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gTWFyZ2luQ29udHJvbCgpIHtcbiAgY29uc3QgW20sIHNldE1dID0gdXNlU3RhdGUoMjQpO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250cm9sQ29sdW1ufT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IC4uLndyYXAsIGZsZXhEaXJlY3Rpb246IFwicm93XCIgfX0+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmlubmVyLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuZ3JlZW4xMDAsXG4gICAgICAgICAgICBtYXJnaW46IHsgbGVmdDogbSB9LFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXttfVxuICAgICAgICBtaW49ezB9XG4gICAgICAgIG1heD17NDh9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRNfVxuICAgICAgICBsYWJlbD17YG1hcmdpbi5sZWZ0ICR7bS50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuY29uc3Qgd3JhcDogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBwYWRkaW5nOiA4LFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBib3JkZXJSYWRpdXM6IDEwLFxufTtcblxuY29uc3QgaW5uZXI6IEJldnlTdHlsZSA9IHtcbiAgd2lkdGg6IDM2LFxuICBoZWlnaHQ6IDM2LFxuICBib3JkZXJSYWRpdXM6IDYsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG59O1xuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEV4YW1wbGUsIFNsaWRlciB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBjb250cm9sQ29sdW1uIH0gZnJvbSBcIi4vc2hhcmVkXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBTaXppbmdEZW1vKCkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cIndpZHRoL2hlaWdodCB0YWtlIHBpeGVscywgcGVyY2VudGFnZXMsIG9yIHZpZXdwb3J0IHVuaXRzLlwiXG4gICAgICAgIHRzeD17YDxub2RlIHN0eWxlPXt7IHdpZHRoOiBcIjYwJVwiIH19IC8+YH1cbiAgICAgID5cbiAgICAgICAgPFdpZHRoQ29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cImFzcGVjdFJhdGlvIGRlcml2ZXMgdGhlIG1pc3NpbmcgZGltZW5zaW9uIGZyb20gdGhlIGdpdmVuIG9uZS5cIlxuICAgICAgICB0c3g9e2BoZWlnaHQ6IDUwLCBhc3BlY3RSYXRpbzogMS42YH1cbiAgICAgID5cbiAgICAgICAgPEFzcGVjdENvbnRyb2wgLz5cbiAgICAgIDwvRXhhbXBsZT5cblxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJtaW5XaWR0aC9tYXhXaWR0aCBjbGFtcCBhbiBvdGhlcndpc2UgZmxleGlibGUgc2l6ZS5cIlxuICAgICAgICB0c3g9e2B3aWR0aDogXCIxMDAlXCIsIG1heFdpZHRoOiAxNjBgfVxuICAgICAgPlxuICAgICAgICA8TWF4V2lkdGhDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG4gICAgPC8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFdpZHRoQ29udHJvbCgpIHtcbiAgY29uc3QgW3csIHNldFddID0gdXNlU3RhdGUoNjApO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250cm9sQ29sdW1ufT5cbiAgICAgIDxub2RlIHN0eWxlPXt0cmFja30+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmJhciwgd2lkdGg6IGAke01hdGgucm91bmQodyl9JWAgfX0gLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e3d9XG4gICAgICAgIG1pbj17MTB9XG4gICAgICAgIG1heD17MTAwfVxuICAgICAgICBvbkNoYW5nZT17c2V0V31cbiAgICAgICAgbGFiZWw9e2B3aWR0aCAke3cudG9GaXhlZCgwKX0lYH1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBBc3BlY3RDb250cm9sKCkge1xuICBjb25zdCBbYXIsIHNldEFyXSA9IHVzZVN0YXRlKDEuNik7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6IDUwLFxuICAgICAgICAgIGFzcGVjdFJhdGlvOiBhcixcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDEwLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnJlZDEwMCxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXthcn1cbiAgICAgICAgbWluPXswLjV9XG4gICAgICAgIG1heD17Mi41fVxuICAgICAgICBvbkNoYW5nZT17c2V0QXJ9XG4gICAgICAgIGxhYmVsPXtgYXNwZWN0UmF0aW8gJHthci50b0ZpeGVkKDIpfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gTWF4V2lkdGhDb250cm9sKCkge1xuICBjb25zdCBbbWF4LCBzZXRNYXhdID0gdXNlU3RhdGUoMTYwKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17Y29udHJvbENvbHVtbn0+XG4gICAgICA8bm9kZSBzdHlsZT17dHJhY2t9PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5iYXIsXG4gICAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICBtYXhXaWR0aDogbWF4LFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMueWVsbG93MTAwLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXttYXh9XG4gICAgICAgIG1pbj17NDB9XG4gICAgICAgIG1heD17MjQwfVxuICAgICAgICBvbkNoYW5nZT17c2V0TWF4fVxuICAgICAgICBsYWJlbD17YG1heFdpZHRoICR7bWF4LnRvRml4ZWQoMCl9YH1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCB0cmFjazogQmV2eVN0eWxlID0ge1xuICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICB3aWR0aDogMjQwLFxuICBwYWRkaW5nOiAxMixcbiAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuc3VyZmFjZTEwMCxcbiAgYm9yZGVyUmFkaXVzOiAxMixcbn07XG5cbmNvbnN0IGJhcjogQmV2eVN0eWxlID0ge1xuICBoZWlnaHQ6IDI2LFxuICBib3JkZXJSYWRpdXM6IDYsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnByaW1hcnkxMDAsXG59O1xuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEV4YW1wbGUsIFNsaWRlciB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBib3gsIGNvbnRyb2xDb2x1bW4gfSBmcm9tIFwiLi9zaGFyZWRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zZm9ybURlbW8oKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwidHJhbnNsYXRlIHNoaWZ0cyBhIG5vZGUgYWZ0ZXIgbGF5b3V0LCB3aXRob3V0IG1vdmluZyBzaWJsaW5ncy5cIlxuICAgICAgICB0c3g9e2B0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWDogMTYsIHRyYW5zbGF0ZVk6IDAgfWB9XG4gICAgICA+XG4gICAgICAgIDxUcmFuc2xhdGVDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwic2NhbGUgZ3Jvd3Mgb3Igc2hyaW5rcyBhIG5vZGUgYXJvdW5kIGl0cyBjZW50ZXIuXCJcbiAgICAgICAgdHN4PXtgdHJhbnNmb3JtOiB7IHNjYWxlOiAwLjcgfWB9XG4gICAgICA+XG4gICAgICAgIDxTY2FsZUNvbnRyb2wgLz5cbiAgICAgIDwvRXhhbXBsZT5cblxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJyb3RhdGUgc3BpbnMgYSBub2RlIGFyb3VuZCBpdHMgY2VudGVyIChkZWdyZWVzLCBvciBhIHVuaXQgc3RyaW5nIGxpa2UgJzAuMjV0dXJuJykuXCJcbiAgICAgICAgdHN4PXtgdHJhbnNmb3JtOiB7IHJvdGF0ZTogNDUgfWB9XG4gICAgICA+XG4gICAgICAgIDxSb3RhdGVDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG4gICAgPC8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFRyYW5zbGF0ZUNvbnRyb2woKSB7XG4gIGNvbnN0IFt4LCBzZXRYXSA9IHVzZVN0YXRlKDE2KTtcbiAgY29uc3QgW3ksIHNldFldID0gdXNlU3RhdGUoMCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGUgc3R5bGU9e3N0YWdlfT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uYm94LCB0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWDogeCwgdHJhbnNsYXRlWTogeSB9IH19IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXt4fVxuICAgICAgICBtaW49ey02MH1cbiAgICAgICAgbWF4PXs2MH1cbiAgICAgICAgb25DaGFuZ2U9e3NldFh9XG4gICAgICAgIGxhYmVsPXtgdHJhbnNsYXRlWCAke3gudG9GaXhlZCgwKX1gfVxuICAgICAgLz5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e3l9XG4gICAgICAgIG1pbj17LTQwfVxuICAgICAgICBtYXg9ezQwfVxuICAgICAgICBvbkNoYW5nZT17c2V0WX1cbiAgICAgICAgbGFiZWw9e2B0cmFuc2xhdGVZICR7eS50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gU2NhbGVDb250cm9sKCkge1xuICBjb25zdCBbcywgc2V0U10gPSB1c2VTdGF0ZSgxKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17Y29udHJvbENvbHVtbn0+XG4gICAgICA8bm9kZSBzdHlsZT17c3RhZ2V9PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5ib3gsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5ncmVlbjEwMCxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyBzY2FsZTogcyB9LFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXtzfVxuICAgICAgICBtaW49ezAuM31cbiAgICAgICAgbWF4PXsxLjh9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRTfVxuICAgICAgICBsYWJlbD17YHNjYWxlICR7cy50b0ZpeGVkKDIpfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gUm90YXRlQ29udHJvbCgpIHtcbiAgY29uc3QgW3IsIHNldFJdID0gdXNlU3RhdGUoNDUpO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250cm9sQ29sdW1ufT5cbiAgICAgIDxub2RlIHN0eWxlPXtzdGFnZX0+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmJveCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnB1cnBsZTEwMCxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyByb3RhdGU6IHIgfSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPFNsaWRlclxuICAgICAgICB2YWx1ZT17cn1cbiAgICAgICAgbWluPXswfVxuICAgICAgICBtYXg9ezM2MH1cbiAgICAgICAgb25DaGFuZ2U9e3NldFJ9XG4gICAgICAgIGxhYmVsPXtgcm90YXRlICR7ci50b0ZpeGVkKDApfcKwYH1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBzdGFnZTogQmV2eVN0eWxlID0ge1xuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgd2lkdGg6IDIwMCxcbiAgaGVpZ2h0OiAxNDAsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG4gIGJvcmRlclJhZGl1czogMTIsXG59O1xuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdC9qc3hcIjtcbmltcG9ydCB7IEV4YW1wbGUsIFNsaWRlciB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IENvbG9ycyB9IGZyb20gXCJAL3RoZW1lXCI7XG5pbXBvcnQgeyBib3gsIGNvbnRyb2xDb2x1bW4gfSBmcm9tIFwiLi9zaGFyZWRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIFNoYWRvd0RlbW8oKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiYm94U2hhZG93IGNhc3RzIGEgc29mdCBkcm9wIHNoYWRvdy4gRHJhZyBibHVyIGFuZCBzcHJlYWQuXCJcbiAgICAgICAgdHN4PXtgYm94U2hhZG93OiB7XG4gIGNvbG9yOiBcIiNGRkZGRkYzM1wiLFxuICBibHVyUmFkaXVzOiAxMixcbiAgc3ByZWFkUmFkaXVzOiAzLFxufWB9XG4gICAgICA+XG4gICAgICAgIDxCbHVyQ29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cInhPZmZzZXQgLyB5T2Zmc2V0IHB1c2ggdGhlIHNoYWRvdyB0byBpbXBseSBhIGxpZ2h0IGRpcmVjdGlvbi5cIlxuICAgICAgICB0c3g9e2Bib3hTaGFkb3c6IHtcbiAgeE9mZnNldDogOCxcbiAgeU9mZnNldDogOCxcbiAgYmx1clJhZGl1czogNixcbn1gfVxuICAgICAgPlxuICAgICAgICA8T2Zmc2V0Q29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuICAgIDwvPlxuICApO1xufVxuXG5mdW5jdGlvbiBCbHVyQ29udHJvbCgpIHtcbiAgY29uc3QgW2JsdXIsIHNldEJsdXJdID0gdXNlU3RhdGUoMTIpO1xuICBjb25zdCBbc3ByZWFkLCBzZXRTcHJlYWRdID0gdXNlU3RhdGUoMyk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGUgc3R5bGU9e3N0YWdlfT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uYm94LFxuICAgICAgICAgICAgYm94U2hhZG93OiB7XG4gICAgICAgICAgICAgIGNvbG9yOiBDb2xvcnMuc2hhZG93MjAwLFxuICAgICAgICAgICAgICBibHVyUmFkaXVzOiBibHVyLFxuICAgICAgICAgICAgICBzcHJlYWRSYWRpdXM6IHNwcmVhZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e2JsdXJ9XG4gICAgICAgIG1pbj17MH1cbiAgICAgICAgbWF4PXs0MH1cbiAgICAgICAgb25DaGFuZ2U9e3NldEJsdXJ9XG4gICAgICAgIGxhYmVsPXtgYmx1clJhZGl1cyAke2JsdXIudG9GaXhlZCgwKX1gfVxuICAgICAgLz5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e3NwcmVhZH1cbiAgICAgICAgbWluPXswfVxuICAgICAgICBtYXg9ezE2fVxuICAgICAgICBvbkNoYW5nZT17c2V0U3ByZWFkfVxuICAgICAgICBsYWJlbD17YHNwcmVhZFJhZGl1cyAke3NwcmVhZC50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gT2Zmc2V0Q29udHJvbCgpIHtcbiAgY29uc3QgW3gsIHNldFhdID0gdXNlU3RhdGUoOCk7XG4gIGNvbnN0IFt5LCBzZXRZXSA9IHVzZVN0YXRlKDgpO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXtjb250cm9sQ29sdW1ufT5cbiAgICAgIDxub2RlIHN0eWxlPXtzdGFnZX0+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmJveCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnJlZDEwMCxcbiAgICAgICAgICAgIGJveFNoYWRvdzoge1xuICAgICAgICAgICAgICBjb2xvcjogQ29sb3JzLnNoYWRvdzIwMCxcbiAgICAgICAgICAgICAgeE9mZnNldDogeCxcbiAgICAgICAgICAgICAgeU9mZnNldDogeSxcbiAgICAgICAgICAgICAgYmx1clJhZGl1czogNixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxTbGlkZXJcbiAgICAgICAgdmFsdWU9e3h9XG4gICAgICAgIG1pbj17LTI0fVxuICAgICAgICBtYXg9ezI0fVxuICAgICAgICBvbkNoYW5nZT17c2V0WH1cbiAgICAgICAgbGFiZWw9e2B4T2Zmc2V0ICR7eC50b0ZpeGVkKDApfWB9XG4gICAgICAvPlxuICAgICAgPFNsaWRlclxuICAgICAgICB2YWx1ZT17eX1cbiAgICAgICAgbWluPXstMjR9XG4gICAgICAgIG1heD17MjR9XG4gICAgICAgIG9uQ2hhbmdlPXtzZXRZfVxuICAgICAgICBsYWJlbD17YHlPZmZzZXQgJHt5LnRvRml4ZWQoMCl9YH1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBzdGFnZTogQmV2eVN0eWxlID0ge1xuICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgcGFkZGluZzogMzIsXG4gIGJhY2tncm91bmRDb2xvcjogQ29sb3JzLnN1cmZhY2UxMDAsXG4gIGJvcmRlclJhZGl1czogMTIsXG59O1xuIiwgImltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgRXhhbXBsZSB9IGZyb20gXCJAL2NvbXBvbmVudHNcIjtcbmltcG9ydCB7IGJveCwgc3RhZ2UgfSBmcm9tIFwiLi9zaGFyZWRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEdyYWRpZW50c0RlbW8oKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiYmFja2dyb3VuZEdyYWRpZW50IHBhaW50cyBhIGxpbmVhci9yYWRpYWwvY29uaWMgZ3JhZGllbnQuIEFuZ2xlcyBhcmUgaW4gZGVncmVlcyAoMCA9IHVwLCBjbG9ja3dpc2UpLlwiXG4gICAgICAgIHRzeD17YGJhY2tncm91bmRHcmFkaWVudDoge1xuICB0eXBlOiBcImxpbmVhclwiLFxuICBhbmdsZTogOTAsXG4gIHN0b3BzOiBbXG4gICAgeyBjb2xvcjogXCIjZjc3NjhlXCIgfSxcbiAgICB7IGNvbG9yOiBcIiM3YWEyZjdcIiB9LFxuICBdLFxufWB9XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXtzdGFnZX0+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIC4uLmJveCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgICAgICBhbmdsZTogOTAsXG4gICAgICAgICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBcIiNmNzc2OGVcIiB9LCB7IGNvbG9yOiBcIiM3YWEyZjdcIiB9XSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgLi4uYm94LFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJyYWRpYWxcIixcbiAgICAgICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiI2UwYWY2OFwiIH0sIHsgY29sb3I6IFwiIzFhMWIyNlwiIH1dLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5ib3gsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiY29uaWNcIixcbiAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgeyBjb2xvcjogXCIjZjc3NjhlXCIgfSxcbiAgICAgICAgICAgICAgICAgIHsgY29sb3I6IFwiIzllY2U2YVwiIH0sXG4gICAgICAgICAgICAgICAgICB7IGNvbG9yOiBcIiM3YWEyZjdcIiB9LFxuICAgICAgICAgICAgICAgICAgeyBjb2xvcjogXCIjZjc3NjhlXCIgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiYm9yZGVyR3JhZGllbnQgcGFpbnRzIHRoZSBib3JkZXIgKG5lZWRzIGEgYm9yZGVyIHdpZHRoKS4gUGFpcnMgd2l0aCBhIHNvbGlkIG9yIGdyYWRpZW50IGZpbGwuXCJcbiAgICAgICAgdHN4PXtgYm9yZGVyOiA2LFxuYmFja2dyb3VuZENvbG9yOiBcIiMxYTFiMjZcIixcbmJvcmRlckdyYWRpZW50OiB7XG4gIHR5cGU6IFwiY29uaWNcIixcbiAgc3RvcHM6IFtcbiAgICB7IGNvbG9yOiBcIiNmNzc2OGVcIiB9LFxuICAgIHsgY29sb3I6IFwiIzdhYTJmN1wiIH0sXG4gICAgeyBjb2xvcjogXCIjOWVjZTZhXCIgfSxcbiAgICB7IGNvbG9yOiBcIiNmNzc2OGVcIiB9LFxuICBdLFxufWB9XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXtzdGFnZX0+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIC4uLmJveCxcbiAgICAgICAgICAgICAgYm9yZGVyOiA2LFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzFhMWIyNlwiLFxuICAgICAgICAgICAgICBib3JkZXJHcmFkaWVudDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiY29uaWNcIixcbiAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgeyBjb2xvcjogXCIjZjc3NjhlXCIgfSxcbiAgICAgICAgICAgICAgICAgIHsgY29sb3I6IFwiIzdhYTJmN1wiIH0sXG4gICAgICAgICAgICAgICAgICB7IGNvbG9yOiBcIiM5ZWNlNmFcIiB9LFxuICAgICAgICAgICAgICAgICAgeyBjb2xvcjogXCIjZjc3NjhlXCIgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5ib3gsXG4gICAgICAgICAgICAgIGJvcmRlcjogNixcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMxYTFiMjZcIixcbiAgICAgICAgICAgICAgYm9yZGVyR3JhZGllbnQ6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICAgIGFuZ2xlOiA5MCxcbiAgICAgICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiI2UwYWY2OFwiIH0sIHsgY29sb3I6IFwiI2JiOWFmN1wiIH1dLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiUGFzcyBhbiBhcnJheSB0byBsYXllciB0cmFuc2x1Y2VudCBncmFkaWVudHMuIEhvdmVyIHRoZSBzd2F0Y2ggdG8gc3dhcCB0aGUgZ3JhZGllbnQgKHByb3ZlcyBob3ZlclN0eWxlIG1lcmdpbmcpLlwiXG4gICAgICAgIHRzeD17YGJhY2tncm91bmRHcmFkaWVudDogW1xuICB7IHR5cGU6IFwibGluZWFyXCIsIGFuZ2xlOiA0NSxcbiAgICBzdG9wczogW3sgY29sb3I6IFwiI2Y3NzY4ZTgwXCIgfSwgeyBjb2xvcjogXCIjMDAwMDAwMDBcIiB9XSB9LFxuICB7IHR5cGU6IFwibGluZWFyXCIsIGFuZ2xlOiAxMzUsXG4gICAgc3RvcHM6IFt7IGNvbG9yOiBcIiM3YWEyZjc4MFwiIH0sIHsgY29sb3I6IFwiIzAwMDAwMDAwXCIgfV0gfSxcbl1gfVxuICAgICAgPlxuICAgICAgICA8bm9kZSBzdHlsZT17c3RhZ2V9PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAuLi5ib3gsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjMWExYjI2XCIsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogbGF5ZXJlZCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRHcmFkaWVudDogaG92ZXJlZCB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvRXhhbXBsZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuY29uc3QgbGF5ZXJlZDogQmV2eVN0eWxlW1wiYmFja2dyb3VuZEdyYWRpZW50XCJdID0gW1xuICB7XG4gICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICBhbmdsZTogNDUsXG4gICAgc3RvcHM6IFt7IGNvbG9yOiBcIiNmNzc2OGU4MFwiIH0sIHsgY29sb3I6IFwiIzAwMDAwMDAwXCIgfV0sXG4gIH0sXG4gIHtcbiAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgIGFuZ2xlOiAxMzUsXG4gICAgc3RvcHM6IFt7IGNvbG9yOiBcIiM3YWEyZjc4MFwiIH0sIHsgY29sb3I6IFwiIzAwMDAwMDAwXCIgfV0sXG4gIH0sXG5dO1xuXG5jb25zdCBob3ZlcmVkOiBCZXZ5U3R5bGVbXCJiYWNrZ3JvdW5kR3JhZGllbnRcIl0gPSB7XG4gIHR5cGU6IFwiY29uaWNcIixcbiAgc3RvcHM6IFt7IGNvbG9yOiBcIiM5ZWNlNmFcIiB9LCB7IGNvbG9yOiBcIiM3YWEyZjdcIiB9LCB7IGNvbG9yOiBcIiM5ZWNlNmFcIiB9XSxcbn07XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0L2pzeFwiO1xuaW1wb3J0IHsgQ2hlY2tib3gsIEV4YW1wbGUsIFJhZGlvLCBSYWRpb09wdGlvbiwgU2xpZGVyIH0gZnJvbSBcIkAvY29tcG9uZW50c1wiO1xuaW1wb3J0IHsgQ29sb3JzIH0gZnJvbSBcIkAvdGhlbWVcIjtcbmltcG9ydCB7IGJveCwgY29udHJvbENvbHVtbiwgcm93IH0gZnJvbSBcIi4vc2hhcmVkXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBPcGFjaXR5RGVtbygpIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4YW1wbGVcbiAgICAgICAgZGVzY3JpcHRpb249XCJvcGFjaXR5IGZhZGVzIGEgbm9kZSBhbmQgaXRzIGNoaWxkcmVuIHRvZ2V0aGVyLiBEcmFnIHRvIGZhZGUuXCJcbiAgICAgICAgdHN4PXtgPG5vZGUgc3R5bGU9e3sgb3BhY2l0eTogMC40IH19IC8+YH1cbiAgICAgID5cbiAgICAgICAgPE9wYWNpdHlDb250cm9sIC8+XG4gICAgICA8L0V4YW1wbGU+XG5cbiAgICAgIDxFeGFtcGxlXG4gICAgICAgIGRlc2NyaXB0aW9uPVwiekluZGV4IGNvbnRyb2xzIHBhaW50IG9yZGVyIHdoZW4gbm9kZXMgb3ZlcmxhcC5cIlxuICAgICAgICB0c3g9e2A8bm9kZSBzdHlsZT17eyB6SW5kZXg6IDIgfX0gLz5gfVxuICAgICAgPlxuICAgICAgICA8WkluZGV4Q29udHJvbCAvPlxuICAgICAgPC9FeGFtcGxlPlxuXG4gICAgICA8RXhhbXBsZVxuICAgICAgICBkZXNjcmlwdGlvbj1cImRpc3BsYXk6IG5vbmUgcmVtb3ZlcyBhIG5vZGUgZnJvbSBsYXlvdXQgZW50aXJlbHkuXCJcbiAgICAgICAgdHN4PXtgPG5vZGUgc3R5bGU9e3sgZGlzcGxheTogXCJub25lXCIgfX0gLz5gfVxuICAgICAgPlxuICAgICAgICA8RGlzcGxheUNvbnRyb2wgLz5cbiAgICAgIDwvRXhhbXBsZT5cbiAgICA8Lz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gT3BhY2l0eUNvbnRyb2woKSB7XG4gIGNvbnN0IFtvcGFjaXR5LCBzZXRPcGFjaXR5XSA9IHVzZVN0YXRlKDAuNCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgLi4uYm94LCBvcGFjaXR5IH19IC8+XG4gICAgICA8U2xpZGVyXG4gICAgICAgIHZhbHVlPXtvcGFjaXR5fVxuICAgICAgICBtaW49ezB9XG4gICAgICAgIG1heD17MX1cbiAgICAgICAgb25DaGFuZ2U9e3NldE9wYWNpdHl9XG4gICAgICAgIGxhYmVsPXtgb3BhY2l0eSAke29wYWNpdHkudG9GaXhlZCgyKX1gfVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbnR5cGUgRnJvbnQgPSBcImJsdWVcIiB8IFwicmVkXCI7XG5jb25zdCBGUk9OVF9PUFRJT05TOiBSYWRpb09wdGlvbjxGcm9udD5bXSA9IFtcbiAgeyBsYWJlbDogXCJibHVlIGZyb250XCIsIHZhbHVlOiBcImJsdWVcIiB9LFxuICB7IGxhYmVsOiBcInJlZCBmcm9udFwiLCB2YWx1ZTogXCJyZWRcIiB9LFxuXTtcblxuZnVuY3Rpb24gWkluZGV4Q29udHJvbCgpIHtcbiAgY29uc3QgW2Zyb250LCBzZXRGcm9udF0gPSB1c2VTdGF0ZTxGcm9udD4oXCJyZWRcIik7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e2NvbnRyb2xDb2x1bW59PlxuICAgICAgPG5vZGUgc3R5bGU9e292ZXJsYXBTdGFnZX0+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmNoaXAsXG4gICAgICAgICAgICBsZWZ0OiAxOCxcbiAgICAgICAgICAgIHRvcDogMTQsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5wcmltYXJ5MTAwLFxuICAgICAgICAgICAgekluZGV4OiBmcm9udCA9PT0gXCJibHVlXCIgPyAyIDogMSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5jaGlwLFxuICAgICAgICAgICAgbGVmdDogNTAsXG4gICAgICAgICAgICB0b3A6IDMwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucmVkMTAwLFxuICAgICAgICAgICAgekluZGV4OiBmcm9udCA9PT0gXCJyZWRcIiA/IDIgOiAxLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8UmFkaW8gb3B0aW9ucz17RlJPTlRfT1BUSU9OU30gdmFsdWU9e2Zyb250fSBvbkNoYW5nZT17c2V0RnJvbnR9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBEaXNwbGF5Q29udHJvbCgpIHtcbiAgY29uc3QgW2hpZGRlbiwgc2V0SGlkZGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17Y29udHJvbENvbHVtbn0+XG4gICAgICA8bm9kZSBzdHlsZT17cm93fT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e2JveH0gLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4uYm94LFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMuZ3JlZW4xMDAsXG4gICAgICAgICAgICBkaXNwbGF5OiBoaWRkZW4gPyBcIm5vbmVcIiA6IFwiZmxleFwiLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IC4uLmJveCwgYmFja2dyb3VuZENvbG9yOiBDb2xvcnMucHVycGxlMTAwIH19IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8Q2hlY2tib3ggbGFiZWw9XCJIaWRlIG1pZGRsZSBib3hcIiBlbmFibGVkPXtoaWRkZW59IG9uQ2hhbmdlPXtzZXRIaWRkZW59IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBvdmVybGFwU3RhZ2U6IEJldnlTdHlsZSA9IHtcbiAgcG9zaXRpb25UeXBlOiBcInJlbGF0aXZlXCIsXG4gIHdpZHRoOiAxNTAsXG4gIGhlaWdodDogOTYsXG4gIHBhZGRpbmc6IDEyLFxuICBiYWNrZ3JvdW5kQ29sb3I6IENvbG9ycy5zdXJmYWNlMTAwLFxuICBib3JkZXJSYWRpdXM6IDEyLFxufTtcblxuY29uc3QgY2hpcDogQmV2eVN0eWxlID0ge1xuICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgd2lkdGg6IDYwLFxuICBoZWlnaHQ6IDYwLFxuICBib3JkZXJSYWRpdXM6IDEwLFxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBLGFBQU8s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LFVBQVU7SUFDVmIsUUFBUTtJQUNSekMsZUFBZTtJQUNmK0IsWUFBWTtJQUNaMUIsS0FBSztJQUNMYyxTQUFTO0lBQ1RYLFdBQVc7RUFDYjs7O0FEdFdBK0MsaUNBQU0seUNBQUFDLEtBQUNDLEtBQUFBLENBQUFBLENBQUFBLENBQUFBOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfYmV2eV9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiZW1pdCIsICJuYW1lIiwgInZhbHVlIiwgInJhd0VtaXQiLCAicmVxdWVzdCIsICJyYXdSZXF1ZXN0IiwgIm9uIiwgImNiIiwgInJhd0FkZEV2ZW50TGlzdGVuZXIiLCAicmF3UmVtb3ZlRXZlbnRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImJldnkiLCAiYWRkRXZlbnRMaXN0ZW5lciIsICJiYXNpY0RlbW8iLCAic2V0Q291bnQiLCAiY3Jvd2RlZEN1YmVzIiwgImZvbGxvd1JhbmRvbSIsICJzZXRGb2xsb3dNb2RlIiwgInBvbGxpbmdEZW1vIiwgImdldEJhbGwiLCAic2VsZWN0U2NlbmUiLCAic3VyZmFjZURlbW8iLCAic2V0Q3J0IiwgIkNvbG9ycyIsICJwcmltYXJ5MTAwIiwgInByaW1hcnkyMDAiLCAicHJpbWFyeTMwMCIsICJwcmltYXJ5T3ZlcmxheSIsICJ0ZXh0Q29sb3IxMDAiLCAidGV4dENvbG9yMjAwIiwgInRleHRDb2xvcjMwMCIsICJ0ZXh0Q29sb3I0MDAiLCAic3VyZmFjZTEwMCIsICJzdXJmYWNlMjAwIiwgInN1cmZhY2UzMDAiLCAic3VyZmFjZTQwMCIsICJzdXJmYWNlNTAwIiwgInN1cmZhY2U2MDAiLCAiZ3JlZW4xMDAiLCAicmVkMTAwIiwgInJlZDIwMCIsICJyZWQzMDAiLCAieWVsbG93MTAwIiwgInB1cnBsZTEwMCIsICJza3kxMDAiLCAiYW1iZXIxMDAiLCAib3JhbmdlMTAwIiwgInRlYWwxMDAiLCAic2hhZG93MTAwIiwgInNoYWRvdzIwMCIsICJ0cmFuc3BhcmVudCIsICJsaW5lYXIiLCAiYW5nbGUiLCAiY29sb3JzIiwgInR5cGUiLCAic3RvcHMiLCAibWFwIiwgImNvbG9yIiwgIkdyYWRpZW50cyIsICJwcmltYXJ5IiwgInByaW1hcnlIb3ZlciIsICJzdXJmYWNlIiwgInN1cmZhY2VIb3ZlciIsICJjYXJkIiwgInRyYWNrIiwgImFjY2VudEJvcmRlciIsICJuYXZCYWNrZHJvcCIsICJwb3NpdGlvbiIsICJzcGVjdHJ1bSIsICJGb250U2l6ZXMiLCAieHhzIiwgInhzIiwgInNtIiwgImJhc2UiLCAibGciLCAieGwiLCAieHhsIiwgInh4eGwiLCAiaW1wb3J0X3JlYWN0IiwgIkNoZWNrYm94IiwgImxhYmVsIiwgImVuYWJsZWQiLCAib25DaGFuZ2UiLCAiX29uQ2hhbmdlIiwgIl9qc3hzIiwgImJ1dHRvbiIsICJzdHlsZSIsICJ3cmFwcGVyIiwgImhvdmVyU3R5bGUiLCAid3JhcHBlckhvdmVyZWQiLCAib25DbGljayIsICJfanN4IiwgIm5vZGUiLCAiYm94IiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAidGV4dENvbG9yMTAwIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJHcmFkaWVudHMiLCAicHJpbWFyeSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYm9yZGVyUmFkaXVzIiwgInRyYW5zZm9ybSIsICJzY2FsZSIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgInRleHQiLCAiY2hlY2tib3hMYWJlbCIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgInBhZGRpbmciLCAidG9wIiwgInJpZ2h0IiwgImJvdHRvbSIsICJsZWZ0IiwgInRyYW5zcGFyZW50IiwgInN1cmZhY2UiLCAiYm9yZGVyQ29sb3IiLCAic3VyZmFjZTYwMCIsICJib3JkZXJHcmFkaWVudCIsICJhY2NlbnRCb3JkZXIiLCAiYm9yZGVyIiwgImp1c3RpZnlDb250ZW50IiwgImNvbG9yIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJzbSIsICJjbGFtcCIsICJ2IiwgImxvIiwgImhpIiwgIk1hdGgiLCAibWluIiwgIm1heCIsICJQcm9ncmVzc0JhciIsICJwcm9ncmVzcyIsICJmcm9tIiwgImxhYmVsIiwgInN0YXJ0IiwgImZpbGwiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJ0cmFjayIsICJfanN4IiwgImZpbGxTdHlsZSIsICJsZWZ0IiwgIndpZHRoIiwgImxhYmVsV3JhcCIsICJ0ZXh0IiwgImxhYmVsVGV4dCIsICJwb3NpdGlvblR5cGUiLCAiaGVpZ2h0IiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInN1cmZhY2U0MDAiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgIkdyYWRpZW50cyIsICJ0b3AiLCAicHJpbWFyeTEwMCIsICJwcmltYXJ5IiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAiY29sb3IiLCAidGV4dENvbG9yMTAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJ4cyIsICJmb250V2VpZ2h0IiwgInRleHRBbGlnbiIsICJjbGFtcCIsICJ2IiwgImxvIiwgImhpIiwgIk1hdGgiLCAibWluIiwgIm1heCIsICJTbGlkZXIiLCAidmFsdWUiLCAibGFiZWwiLCAib25DaGFuZ2UiLCAicHJvZ3Jlc3MiLCAic2V0RnJvbVgiLCAiZSIsICJ4IiwgIl9qc3giLCAibm9kZSIsICJzdHlsZSIsICJzbGlkZXJUcmFjayIsICJvblBvaW50ZXJEb3duIiwgIm9uUG9pbnRlck1vdmUiLCAiUHJvZ3Jlc3NCYXIiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInN1cmZhY2U0MDAiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgIkdyYWRpZW50cyIsICJ0cmFjayIsICJUZXh0TW9ubyIsICJjaGlsZHJlbiIsICJzdHlsZSIsICJfanN4IiwgInRleHQiLCAiZm9udEZhbWlseSIsICJFeGFtcGxlIiwgImNoaWxkcmVuIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJydXN0IiwgImhhc0NvZGUiLCAiaGFzQXNpZGUiLCAib3BlbiIsICJzZXRPcGVuIiwgInVzZVN0YXRlIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiY2FyZFN0eWxlIiwgIl9qc3giLCAiZGVtb1N0eWxlIiwgImJ1dHRvbiIsICJvbkNsaWNrIiwgIm8iLCAiY29kZVRvZ2dsZVN0eWxlIiwgImhvdmVyU3R5bGUiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgIkdyYWRpZW50cyIsICJzdXJmYWNlSG92ZXIiLCAiVGV4dE1vbm8iLCAiY29kZVRvZ2dsZUxhYmVsU3R5bGUiLCAiYXNpZGVTdHlsZSIsICJ0ZXh0IiwgImRlc2NyaXB0aW9uU3R5bGUiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAib3ZlcmZsb3dZIiwgIm1heEhlaWdodCIsICJlc3RpbWF0ZUNvZGVIZWlnaHQiLCAidHJhbnNpdGlvbiIsICJzaXplIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJDb2RlIiwgImxhbmciLCAiY29kZSIsICJ0eXBlc2NyaXB0IiwgImxpbmVzIiwgInMiLCAic3BsaXQiLCAibGVuZ3RoIiwgIlBFUl9MSU5FX1BYIiwgIlBFUl9TTklQUEVUX1BYIiwgInNuaXBwZXRzIiwgImZpbHRlciIsICJCb29sZWFuIiwgImxpbmVUb3RhbCIsICJyZWR1Y2UiLCAic3VtIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJzbSIsICJwYWRkaW5nIiwgImJvdHRvbSIsICJ4eHMiLCAiY29sb3IiLCAiQ29sb3JzIiwgInRleHRDb2xvcjIwMCIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgIm1pbldpZHRoIiwgImJhY2tncm91bmRDb2xvciIsICJzdXJmYWNlMjAwIiwgImNhcmQiLCAiYm9yZGVyUmFkaXVzIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJwcmltYXJ5MTAwIiwgImJvcmRlckdyYWRpZW50IiwgImFjY2VudEJvcmRlciIsICJ6SW5kZXgiLCAiYm94U2hhZG93IiwgImJsdXJSYWRpdXMiLCAic3ByZWFkUmFkaXVzIiwgInNoYWRvdzEwMCIsICJyaWdodCIsICJwb3NpdGlvblR5cGUiLCAidG9wIiwgIndpZHRoIiwgImhlaWdodCIsICJzdXJmYWNlMzAwIiwgInN1cmZhY2UiLCAidGV4dENvbG9yMTAwIiwgImJhc2UiLCAiZm9udFdlaWdodCIsICJtYXhXaWR0aCIsICJCdXR0b24iLCAib25DbGljayIsICJzdHlsZSIsICJob3ZlclN0eWxlIiwgInByZXNzU3R5bGUiLCAibGFiZWxTdHlsZSIsICJjaGlsZHJlbiIsICJfanN4IiwgImJ1dHRvbiIsICJidXR0b25TdHlsZSIsICJidXR0b25Ib3ZlclN0eWxlIiwgImJ1dHRvblByZXNzU3R5bGUiLCAidGV4dCIsICJidXR0b25MYWJlbFN0eWxlIiwgImp1c3RpZnlDb250ZW50IiwgImFsaWduSXRlbXMiLCAicGFkZGluZyIsICJ0b3AiLCAicmlnaHQiLCAiYm90dG9tIiwgImxlZnQiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAic3VyZmFjZTQwMCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAiR3JhZGllbnRzIiwgInN1cmZhY2UiLCAidHJhbnNpdGlvbiIsICJkdXJhdGlvbiIsICJ0cmFuc2Zvcm0iLCAic3VyZmFjZUhvdmVyIiwgInNjYWxlIiwgImNvbG9yIiwgInRleHRDb2xvcjEwMCIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAic20iLCAiZm9udFdlaWdodCIsICJSYWRpbyIsICJvcHRpb25zIiwgInZhbHVlIiwgIm9uQ2hhbmdlIiwgIl9qc3giLCAibm9kZSIsICJzdHlsZSIsICJncm91cFN0eWxlIiwgIm1hcCIsICJvcHRpb24iLCAiT3B0aW9uIiwgInNlbGVjdGVkIiwgIm9uQ2xpY2siLCAiU3RyaW5nIiwgImJ1dHRvbiIsICJwaWxsU3R5bGUiLCAiYmFja2dyb3VuZENvbG9yIiwgIkFDQ0VOVCIsICJTVVJGQUNFIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJHcmFkaWVudHMiLCAicHJpbWFyeSIsICJzdXJmYWNlIiwgImhvdmVyU3R5bGUiLCAicHJpbWFyeUhvdmVyIiwgInN1cmZhY2VIb3ZlciIsICJwcmVzc1N0eWxlIiwgInRyYW5zZm9ybSIsICJzY2FsZSIsICJ0ZXh0IiwgInBpbGxMYWJlbCIsICJjb2xvciIsICJDb2xvcnMiLCAidGV4dENvbG9yNDAwIiwgInRleHRDb2xvcjEwMCIsICJmb250V2VpZ2h0IiwgImxhYmVsIiwgInByaW1hcnkxMDAiLCAic3VyZmFjZTMwMCIsICJmbGV4RGlyZWN0aW9uIiwgImZsZXhXcmFwIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgImp1c3RpZnlDb250ZW50IiwgInBhZGRpbmciLCAidG9wIiwgInJpZ2h0IiwgImJvdHRvbSIsICJsZWZ0IiwgImJvcmRlclJhZGl1cyIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAic20iLCAiaW1wb3J0X3JlYWN0IiwgIkNVUlNPUiIsICJUeXBld3JpdGVyIiwgInRleHQiLCAic3R5bGUiLCAiY2hhcnNQZXJUaWNrIiwgInRpY2tNcyIsICJzdGFydERlbGF5IiwgImN1cnNvciIsICJvbkRvbmUiLCAiY291bnQiLCAic2V0Q291bnQiLCAidXNlU3RhdGUiLCAiYmxpbmsiLCAic2V0QmxpbmsiLCAib25Eb25lUmVmIiwgInVzZVJlZiIsICJjdXJyZW50IiwgInVzZUVmZmVjdCIsICJ0aW1lciIsICJzdGFydCIsICJzZXRUaW1lb3V0IiwgInNldEludGVydmFsIiwgImMiLCAibmV4dCIsICJNYXRoIiwgIm1pbiIsICJsZW5ndGgiLCAiY2xlYXJJbnRlcnZhbCIsICJjbGVhclRpbWVvdXQiLCAiZmluaXNoZWQiLCAiYiIsICJnbHlwaCIsICJfanN4cyIsICJzbGljZSIsICJGRUFUVVJFUyIsICJ0aXRsZSIsICJib2R5IiwgIkhvbWUiLCAibW9kZSIsICJzZXRNb2RlIiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJiZXZ5IiwgInNlbGVjdFNjZW5lIiwgIl9qc3giLCAibm9kZSIsICJzdHlsZSIsICJjb250YWluZXJTdHlsZSIsICJzdXJmYWNlIiwgIm5hbWUiLCAic2NyZWVuUm9vdCIsICJMYW5kaW5nIiwgIm9uTW9kZSIsICJfanN4cyIsICJwYWdlU3R5bGUiLCAiaGVyb1N0eWxlIiwgImltYWdlIiwgInNyYyIsICJ3aWR0aCIsICJ0ZXh0IiwgInRpdGxlU3R5bGUiLCAidGFnbGluZVN0eWxlIiwgImludHJvU3R5bGUiLCAiY2FyZHNSb3dTdHlsZSIsICJtYXAiLCAiZmVhdHVyZSIsICJjYXJkU3R5bGUiLCAiY2FyZFRpdGxlU3R5bGUiLCAiY2FyZEJvZHlTdHlsZSIsICJicm93c2VTdHlsZSIsICJCdXR0b24iLCAic3VyZmFjZVN3aXRoIiwgImxhYmVsU3R5bGUiLCAic3VyZmFjZUxhYmVsU3dpdGgiLCAib25DbGljayIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgImhlaWdodCIsICJqdXN0aWZ5Q29udGVudCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInN1cmZhY2UxMDAiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgIkdyYWRpZW50cyIsICJuYXZCYWNrZHJvcCIsICJwYWRkaW5nIiwgIm1heFdpZHRoIiwgImNvbG9yIiwgInByaW1hcnkxMDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInh4bCIsICJmb250V2VpZ2h0IiwgInRleHRDb2xvcjEwMCIsICJiYXNlIiwgInRleHRDb2xvcjIwMCIsICJzbSIsICJ0ZXh0QWxpZ24iLCAiZmxleFdyYXAiLCAic3VyZmFjZTIwMCIsICJjYXJkIiwgImJvcmRlclJhZGl1cyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYm9yZGVyR3JhZGllbnQiLCAiYWNjZW50Qm9yZGVyIiwgImJveFNoYWRvdyIsICJibHVyUmFkaXVzIiwgInNwcmVhZFJhZGl1cyIsICJzaGFkb3cxMDAiLCAieHMiLCAieGwiLCAiaW1wb3J0X3JlYWN0IiwgIk1BWCIsICJUWVBFU0NSSVBUIiwgIlJVU1QiLCAiUmVhY3RUb0JldnlEZW1vIiwgImNvdW50IiwgInNldENvdW50IiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJiZXZ5IiwgImJhc2ljRGVtbyIsICJfanN4cyIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJydXN0IiwgInRleHQiLCAic3R5bGUiLCAiY291bnRTdHlsZSIsICJfanN4IiwgImNvbG9yIiwgIkNvbG9ycyIsICJwcmltYXJ5MTAwIiwgIm5vZGUiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAiQnV0dG9uIiwgIm9uQ2xpY2siLCAiYyIsICJNYXRoIiwgIm1pbiIsICJidXR0b25TdHlsZSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInVuZGVmaW5lZCIsICJob3ZlclN0eWxlIiwgInByaW1hcnkyMDAiLCAicHJlc3NTdHlsZSIsICJwcmltYXJ5MzAwIiwgImxhYmVsU3R5bGUiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInh4eGwiLCAibWF4IiwgInJlZDEwMCIsICJyZWQyMDAiLCAicmVkMzAwIiwgInRleHRDb2xvcjEwMCIsICJ4bCIsICJmb250V2VpZ2h0IiwgIndpZHRoIiwgImhlaWdodCIsICJpbXBvcnRfcmVhY3QiLCAiVFlQRVNDUklQVCIsICJSVVNUIiwgIkJldnlUb1JlYWN0RGVtbyIsICJib3VuY2VzIiwgInNldEJvdW5jZXMiLCAidXNlU3RhdGUiLCAidXNlRWZmZWN0IiwgIm9mZiIsICJiZXZ5IiwgIm9uIiwgIl9qc3hzIiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgInJ1c3QiLCAiX2pzeCIsICJ0ZXh0IiwgInN0eWxlIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJsZyIsICJ4eHhsIiwgImZvbnRXZWlnaHQiLCAiY29sb3IiLCAiQ29sb3JzIiwgInllbGxvdzEwMCIsICJpbXBvcnRfcmVhY3QiLCAiVFlQRVNDUklQVCIsICJSVVNUIiwgIkJpZGlyZWN0aW9uQ29tbXVuaWNhdGlvbkRlbW8iLCAic3RhdGUiLCAic2V0U3RhdGUiLCAidXNlU3RhdGUiLCAidXNlRWZmZWN0IiwgImFsaXZlIiwgImhhbmRsZSIsICJ0aWNrIiwgImJhbGwiLCAiYmV2eSIsICJwb2xsaW5nRGVtbyIsICJnZXRCYWxsIiwgInNldFRpbWVvdXQiLCAiY2xlYXJUaW1lb3V0IiwgIl9qc3giLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAicnVzdCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImFsaWduSXRlbXMiLCAiUm93IiwgImxhYmVsIiwgIngiLCAieSIsICJ2eCIsICJ2eSIsICJ0ZXh0IiwgImNvbG9yIiwgIkNvbG9ycyIsICJ0ZXh0Q29sb3IzMDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInNtIiwgInRleHRDb2xvcjIwMCIsICJiYXNlIiwgIndpZHRoIiwgInByaW1hcnkxMDAiLCAiZm9udFdlaWdodCIsICJ0b0ZpeGVkIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJUWVBFU0NSSVBUIiwgIkFuY2hvcmVkRGVtbyIsICJjdWJlcyIsICJzZXRDdWJlcyIsICJ1c2VTdGF0ZSIsICJzY2FsaW5nRW5hYmxlZCIsICJzZXRTY2FsaW5nRW5hYmxlZCIsICJiYXNlRGlzdGFuY2UiLCAic2V0QmFzZURpc3RhbmNlIiwgInNjYWxlRmFjdG9yIiwgInNldFNjYWxlRmFjdG9yIiwgInVzZUVmZmVjdCIsICJvZmYiLCAiYmV2eSIsICJvbiIsICJlIiwgInNjYWxpbmciLCAibWluIiwgIm1heCIsICJmYWN0b3IiLCAidW5kZWZpbmVkIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJfanN4IiwgIkNoZWNrYm94IiwgImxhYmVsIiwgImVuYWJsZWQiLCAib25DaGFuZ2UiLCAiU2xpZGVyIiwgInZhbHVlIiwgInRvRml4ZWQiLCAibWFwIiwgImN1YmUiLCAiQmFkZ2UiLCAiU3RyaW5nIiwgImVudGl0eSIsICJBbmNob3JlZCIsICJub2RlIiwgIm9mZnNldCIsICJzY2FsZSIsICJzdHlsZSIsICJiYWRnZVN0eWxlIiwgInRleHQiLCAiYmFkZ2VUZXh0IiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJwYWRkaW5nIiwgInRvcCIsICJyaWdodCIsICJib3R0b20iLCAibGVmdCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInByaW1hcnkxMDAiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgIkdyYWRpZW50cyIsICJwcmltYXJ5IiwgImJvcmRlclJhZGl1cyIsICJib3hTaGFkb3ciLCAiY29sb3IiLCAic2hhZG93MTAwIiwgImJsdXJSYWRpdXMiLCAic3ByZWFkUmFkaXVzIiwgInRleHRDb2xvcjQwMCIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAieHMiLCAiZm9udFdlaWdodCIsICJpbXBvcnRfcmVhY3QiLCAiVFlQRVNDUklQVCIsICJTVEFHRV9XIiwgIlNUQUdFX0giLCAiQk9YIiwgImNsYW1wIiwgInYiLCAibG8iLCAiaGkiLCAiTWF0aCIsICJtYXgiLCAibWluIiwgIkludGVyYWN0aW9uc0RlbW8iLCAicG9zIiwgInNldFBvcyIsICJ1c2VTdGF0ZSIsICJsZWZ0IiwgInRvcCIsICJwcmVzc2VkIiwgInNldFByZXNzZWQiLCAibGFzdCIsICJzZXRMYXN0IiwgImxvZyIsICJzZXRMb2ciLCAibGFzdENsaWVudCIsICJ1c2VSZWYiLCAieCIsICJ5IiwgImxpbmVJZCIsICJyZWNvcmQiLCAidGV4dCIsICJwcmV2IiwgIm5leHQiLCAiaWQiLCAiY3VycmVudCIsICJzbGljZSIsICJmbXQiLCAiZSIsICJ0b0ZpeGVkIiwgInJvdW5kIiwgImNsaWVudFgiLCAiY2xpZW50WSIsICJvblBvaW50ZXJEb3duIiwgIm9uUG9pbnRlck1vdmUiLCAiZHgiLCAiZHkiLCAicCIsICJvblBvaW50ZXJVcCIsICJfanN4cyIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJfanN4IiwgIm5vZGUiLCAic3R5bGUiLCAic3RhZ2VTdHlsZSIsICJib3hTdHlsZSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInB1cnBsZTEwMCIsICJwcmltYXJ5MTAwIiwgIm9uQ2xpY2siLCAiYm94TGFiZWxTdHlsZSIsICJjb2xvciIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAic20iLCAiZm9udFdlaWdodCIsICJsb2dTdHlsZSIsICJtYXAiLCAibCIsICJsb2dMaW5lU3R5bGUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgInBvc2l0aW9uVHlwZSIsICJzdXJmYWNlMTAwIiwgImJvcmRlclJhZGl1cyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAic3VyZmFjZTQwMCIsICJvdmVyZmxvd1giLCAib3ZlcmZsb3dZIiwgImp1c3RpZnlDb250ZW50IiwgImFsaWduSXRlbXMiLCAidGV4dENvbG9yNDAwIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgInRleHRDb2xvcjMwMCIsICJ4cyIsICJpbXBvcnRfcmVhY3QiLCAiVyIsICJIIiwgIlBBRCIsICJQT0lOVFMiLCAiUEVSSU9EX01TIiwgIkRVUkFUSU9OX01TIiwgIkZSQU1FX01TIiwgIlRZUEVTQ1JJUFQiLCAicmFuZG9tRGF0YSIsICJuIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIk1hdGgiLCAicmFuZG9tIiwgImVhc2VJbk91dCIsICJ0IiwgInBvdyIsICJDYW52YXNEZW1vIiwgInZhbHVlcyIsICJzZXRWYWx1ZXMiLCAidXNlU3RhdGUiLCAidmFsdWVzUmVmIiwgInVzZVJlZiIsICJjdXJyZW50IiwgImZyYW1lUmVmIiwgImFuaW1hdGVSZWYiLCAidXNlRWZmZWN0IiwgImFsaXZlIiwgImFuaW1hdGVUbyIsICJ0YXJnZXQiLCAiY2xlYXJUaW1lb3V0IiwgImVsYXBzZWQiLCAic3RlcCIsICJlIiwgIm1pbiIsICJtYXAiLCAidiIsICJpIiwgInNldFRpbWVvdXQiLCAiY3ljbGUiLCAidGljayIsICJzaHVmZmxlIiwgInVzZUNhbGxiYWNrIiwgImRyYXciLCAiY3R4IiwgImZpbGxTdHlsZSIsICJDb2xvcnMiLCAic3VyZmFjZTEwMCIsICJyZWN0IiwgImZpbGwiLCAic3Ryb2tlU3R5bGUiLCAic3VyZmFjZTQwMCIsICJsaW5lV2lkdGgiLCAieSIsICJiZWdpblBhdGgiLCAibW92ZVRvIiwgImxpbmVUbyIsICJzdHJva2UiLCAicHRzIiwgIngiLCAicHJpbWFyeU92ZXJsYXkiLCAic21vb3RoUGF0aCIsICJjbG9zZVBhdGgiLCAicHJpbWFyeTEwMCIsICJwdXJwbGUxMDAiLCAicCIsICJhcmMiLCAiUEkiLCAiX2pzeCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJjYW52YXMiLCAic3R5bGUiLCAiY2FudmFzU3R5bGUiLCAib25DbGljayIsICJwMCIsICJwMSIsICJwMiIsICJwMyIsICJiZXppZXJDdXJ2ZVRvIiwgIndpZHRoIiwgImhlaWdodCIsICJib3JkZXJSYWRpdXMiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImltcG9ydF9yZWFjdCIsICJUWVBFU0NSSVBUIiwgIlJVU1QiLCAiUG9ydGFsRGVtbyIsICJjb250aW51b3VzIiwgInNldENvbnRpbnVvdXMiLCAidXNlU3RhdGUiLCAidXNlRWZmZWN0IiwgImJldnkiLCAiY3Jvd2RlZEN1YmVzIiwgInNldEZvbGxvd01vZGUiLCAib24iLCAiX2pzeCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJydXN0IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAicm93IiwgImNvbHVtbiIsICJ0ZXh0IiwgImxhYmVsIiwgInBvcnRhbCIsICJ0YXJnZXQiLCAiZm9sbG93VmlldyIsICJCdXR0b24iLCAib25DbGljayIsICJmb2xsb3dSYW5kb20iLCAiQ2hlY2tib3giLCAiZW5hYmxlZCIsICJvbkNoYW5nZSIsICJtaW5pbWFwVmlldyIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgImNvbG9yIiwgIkNvbG9ycyIsICJ0ZXh0Q29sb3IyMDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInNtIiwgImZvbnRXZWlnaHQiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJvcmRlclJhZGl1cyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAic3VyZmFjZTUwMCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAic3VyZmFjZTEwMCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9yZWFjdCIsICJQb3B1cCIsICJzdHlsZSIsICJmcm9tIiwgImNoaWxkcmVuIiwgInNob3duIiwgInNldFNob3duIiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJkeSIsICJfanN4IiwgIm5vZGUiLCAib3BhY2l0eSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAidHJhbnNsYXRlWSIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJ1bmRlZmluZWQiLCAiTWVudUxpc3QiLCAiaXRlbXMiLCAiZmlyc3RSZW5kZXIiLCAic2V0Rmlyc3RSZW5kZXIiLCAic2V0VGltZW91dCIsICJsaXN0IiwgInNjYWxlWSIsICJtYXAiLCAiaXRlbSIsICJpIiwgInNlcGFyYXRvciIsICJidXR0b24iLCAicm93IiwgImhvdmVyU3R5bGUiLCAicm93SG92ZXIiLCAib25DbGljayIsICJ0ZXh0IiwgImxhYmVsIiwgImZsZXhEaXJlY3Rpb24iLCAibWluV2lkdGgiLCAicGFkZGluZyIsICJ0b3AiLCAiYm90dG9tIiwgImxlZnQiLCAicmlnaHQiLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJzdXJmYWNlMzAwIiwgImJvcmRlckNvbG9yIiwgInN1cmZhY2U1MDAiLCAiYm9yZGVyIiwgImJvcmRlclJhZGl1cyIsICJnYXAiLCAiYWxpZ25JdGVtcyIsICJ0cmFuc3BhcmVudCIsICJwcmltYXJ5MzAwIiwgImNoZWNrIiwgIndpZHRoIiwgImNvbG9yIiwgInByaW1hcnkxMDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInNtIiwgImZvbnRXZWlnaHQiLCAidGV4dENvbG9yMTAwIiwgImJhc2UiLCAiaGVpZ2h0IiwgIm1hcmdpbiIsICJNZW51QmFyIiwgIm9wZW4iLCAib25Ub2dnbGUiLCAidmlldyIsICJjcnQiLCAib25Tb3VyY2UiLCAib25SZWJvb3QiLCAib25Ub2dnbGVDcnQiLCAib25BYm91dCIsICJtZW51cyIsICJpZCIsICJsYWJlbCIsICJpdGVtcyIsICJvbkNsaWNrIiwgInNlcGFyYXRvciIsICJjaGVja2VkIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiYmFyIiwgIl9qc3giLCAibWVudVJvdyIsICJtYXAiLCAibWVudSIsICJtZW51QW5jaG9yIiwgImJ1dHRvbiIsICJtZW51TGFiZWxBY3RpdmUiLCAibWVudUxhYmVsIiwgImhvdmVyU3R5bGUiLCAibWVudUxhYmVsSG92ZXIiLCAidGV4dCIsICJtZW51TGFiZWxUZXh0IiwgIlBvcHVwIiwgImRyb3Bkb3duIiwgImZyb20iLCAiTWVudUxpc3QiLCAiVGV4dE1vbm8iLCAidGl0bGUiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgInBhZGRpbmciLCAidG9wIiwgInJpZ2h0IiwgImJvdHRvbSIsICJsZWZ0IiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAic3VyZmFjZTEwMCIsICJib3JkZXJDb2xvciIsICJwcmltYXJ5MTAwIiwgImJvcmRlciIsICJ3aWR0aCIsICJnYXAiLCAicG9zaXRpb25UeXBlIiwgImJvcmRlclJhZGl1cyIsICJ0cmFuc3BhcmVudCIsICJzdXJmYWNlMzAwIiwgInByaW1hcnkzMDAiLCAiY29sb3IiLCAidGV4dENvbG9yMTAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJiYXNlIiwgImZvbnRXZWlnaHQiLCAibWFyZ2luIiwgImltcG9ydF9yZWFjdCIsICJUYXNrYmFyIiwgInN0YXJ0T3BlbiIsICJ2aWV3IiwgIm9uU3RhcnQiLCAib25Tb3VyY2UiLCAib25SZWJvb3QiLCAib25BYm91dCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImJhciIsICJzdGFydEFuY2hvciIsICJfanN4IiwgIlBvcHVwIiwgInN0YXJ0UG9wdXAiLCAiZnJvbSIsICJNZW51TGlzdCIsICJpdGVtcyIsICJsYWJlbCIsICJvbkNsaWNrIiwgInNlcGFyYXRvciIsICJidXR0b24iLCAic3RhcnRCdXR0b25BY3RpdmUiLCAic3RhcnRCdXR0b24iLCAiaG92ZXJTdHlsZSIsICJzdGFydEJ1dHRvbkhvdmVyIiwgInRleHQiLCAic3RhcnRUZXh0IiwgIkNsb2NrIiwgIm5vdyIsICJzZXROb3ciLCAidXNlU3RhdGUiLCAiZm9ybWF0VGltZSIsICJ1c2VFZmZlY3QiLCAiaWQiLCAic2V0SW50ZXJ2YWwiLCAiY2xlYXJJbnRlcnZhbCIsICJjbG9jayIsICJUZXh0TW9ubyIsICJjbG9ja1RleHQiLCAiZCIsICJEYXRlIiwgImgiLCAiZ2V0SG91cnMiLCAibSIsICJnZXRNaW51dGVzIiwgInRvU3RyaW5nIiwgInBhZFN0YXJ0IiwgImFtcG0iLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgInBhZGRpbmciLCAidG9wIiwgInJpZ2h0IiwgImJvdHRvbSIsICJsZWZ0IiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAic3VyZmFjZTEwMCIsICJib3JkZXJDb2xvciIsICJzdXJmYWNlNTAwIiwgImJvcmRlciIsICJ3aWR0aCIsICJwb3NpdGlvblR5cGUiLCAiZ2FwIiwgImJvcmRlclJhZGl1cyIsICJzdXJmYWNlMzAwIiwgInByaW1hcnkzMDAiLCAiY29sb3IiLCAidGV4dENvbG9yMTAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJiYXNlIiwgImZvbnRXZWlnaHQiLCAibWFyZ2luIiwgInN1cmZhY2UyMDAiLCAidGV4dENvbG9yMjAwIiwgInNtIiwgIkhvbWUiLCAiY3J0IiwgInNldENydCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImhvbWUiLCAiX2pzeCIsICJ0ZXh0IiwgImJyYW5kIiwgImJyYW5kU3ViIiwgImNvbnRyb2xzIiwgIkNoZWNrYm94IiwgImxhYmVsIiwgImVuYWJsZWQiLCAib25DaGFuZ2UiLCAiZmxleEdyb3ciLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgImdhcCIsICJjb2xvciIsICJDb2xvcnMiLCAidGV4dENvbG9yMTAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJ4eHhsIiwgImZvbnRXZWlnaHQiLCAidGV4dENvbG9yMjAwIiwgImxnIiwgIm1hcmdpbiIsICJ0b3AiLCAiVFNYIiwgIlJVU1QiLCAiQ29kZVZpZXdlciIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImJvZHkiLCAiX2pzeCIsICJUZXh0TW9ubyIsICJoZWFkaW5nIiwgIkNvZGVCbG9jayIsICJsYW5nIiwgImNvZGUiLCAiUlVTVCIsICJUU1giLCAiYmxvY2siLCAibGFuZ0xhYmVsIiwgIlR5cGV3cml0ZXIiLCAiY29kZVRleHQiLCAidGV4dCIsICJjdXJzb3IiLCAiZmxleEdyb3ciLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAicGFkZGluZyIsICJjb2xvciIsICJDb2xvcnMiLCAidGV4dENvbG9yMzAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJzbSIsICJmb250V2VpZ2h0IiwgImJhY2tncm91bmRDb2xvciIsICJzdXJmYWNlMTAwIiwgImJvcmRlclJhZGl1cyIsICJ0b3AiLCAicmlnaHQiLCAiYm90dG9tIiwgImxlZnQiLCAicHJpbWFyeTEwMCIsICJ0ZXh0Q29sb3IxMDAiLCAiYmFzZSIsICJmb250RmFtaWx5IiwgImltcG9ydF9yZWFjdCIsICJBYm91dERpYWxvZyIsICJvbkNsb3NlIiwgImZpcnN0UmVuZGVyIiwgInNldEZpcnN0UmVuZGVyIiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJzZXRUaW1lb3V0IiwgIl9qc3giLCAibm9kZSIsICJzdHlsZSIsICJzY3JpbSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAiX2pzeHMiLCAicGFuZWwiLCAidGl0bGVCYXIiLCAidGV4dCIsICJ0aXRsZVRleHQiLCAiQnV0dG9uIiwgImhvdmVyU3R5bGUiLCAiY2xvc2VCdXR0b25Ib3ZlciIsICJvbkNsaWNrIiwgInBhbmVsQm9keSIsICJicmFuZCIsICJUZXh0TW9ubyIsICJ2ZXJzaW9uIiwgImJsdXJiIiwgInBvc2l0aW9uVHlwZSIsICJ0b3AiLCAibGVmdCIsICJyaWdodCIsICJib3R0b20iLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJ6SW5kZXgiLCAidHJhbnNpdGlvbiIsICJkdXJhdGlvbiIsICJ3aWR0aCIsICJmbGV4RGlyZWN0aW9uIiwgImJvcmRlclJhZGl1cyIsICJib3JkZXJDb2xvciIsICJDb2xvcnMiLCAicHJpbWFyeTEwMCIsICJib3JkZXIiLCAiYmFja2dyb3VuZENvbG9yIiwgInN1cmZhY2UyMDAiLCAicGFkZGluZyIsICJwcmltYXJ5MzAwIiwgImNvbG9yIiwgInRleHRDb2xvcjEwMCIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAiYmFzZSIsICJmb250V2VpZ2h0IiwgInJlZDMwMCIsICJnYXAiLCAieHhsIiwgInRleHRDb2xvcjMwMCIsICJzbSIsICJ0ZXh0Q29sb3IyMDAiLCAidGV4dEFsaWduIiwgIkRlc2t0b3AiLCAiY3J0IiwgInNldENydCIsICJvblJlYm9vdCIsICJ2aWV3IiwgInNldFZpZXciLCAidXNlU3RhdGUiLCAib3Blbk1lbnUiLCAic2V0T3Blbk1lbnUiLCAiYWJvdXRPcGVuIiwgInNldEFib3V0T3BlbiIsICJ0b2dnbGUiLCAiaWQiLCAiY3VyIiwgImNsb3NlIiwgInNob3dTb3VyY2UiLCAidiIsICJyZWJvb3QiLCAidG9nZ2xlQ3J0IiwgImFib3V0IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiZGVza3RvcCIsICJfanN4IiwgIm1lbnVMYXllciIsICJNZW51QmFyIiwgIm9wZW4iLCAib25Ub2dnbGUiLCAib25Tb3VyY2UiLCAib25Ub2dnbGVDcnQiLCAib25BYm91dCIsICJib2R5V3JhcCIsICJDb2RlVmlld2VyIiwgIkhvbWUiLCAic3RhdHVzQmFyIiwgInRleHQiLCAic3RhdHVzVGV4dCIsICJ0YXNrTGF5ZXIiLCAiVGFza2JhciIsICJzdGFydE9wZW4iLCAib25TdGFydCIsICJidXR0b24iLCAiYmFja2Ryb3AiLCAib25DbGljayIsICJBYm91dERpYWxvZyIsICJvbkNsb3NlIiwgInBvc2l0aW9uVHlwZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJ6SW5kZXgiLCAiZmxleEdyb3ciLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJwYWRkaW5nIiwgInRvcCIsICJib3R0b20iLCAibGVmdCIsICJyaWdodCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInN1cmZhY2UxMDAiLCAiYm9yZGVyQ29sb3IiLCAic3VyZmFjZTQwMCIsICJib3JkZXIiLCAiY29sb3IiLCAidGV4dENvbG9yMzAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJ4cyIsICJmb250RmFtaWx5IiwgInRyYW5zcGFyZW50IiwgImltcG9ydF9yZWFjdCIsICJCb290U2NyZWVuIiwgInBoYXNlIiwgInRpdGxlRGVsYXkiLCAib25UaXRsZURvbmUiLCAib25Cb290RG9uZSIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImJvb3RTY3JlZW4iLCAiX2pzeCIsICJUeXBld3JpdGVyIiwgImJvb3RCcmFuZCIsICJ0ZXh0IiwgInRpY2tNcyIsICJzdGFydERlbGF5IiwgIm9uRG9uZSIsICJoZWlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJfRnJhZ21lbnQiLCAiVGV4dE1vbm8iLCAiYm9vdFN0YXR1cyIsICJQcm9ncmVzc0JhciIsICJTVFJJUF9DT1VOVCIsICJTVFJJUFMiLCAiQXJyYXkiLCAiZmlsbCIsICJTVFJJUF9NUyIsICJGVUxMX0hPTERfTVMiLCAicHJvZ3Jlc3MiLCAic2V0UHJvZ3Jlc3MiLCAidXNlU3RhdGUiLCAidXNlRWZmZWN0IiwgInQiLCAic2V0VGltZW91dCIsICJjbGVhclRpbWVvdXQiLCAicCIsICJ3aWR0aCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiQ29sb3JzIiwgInN1cmZhY2U2MDAiLCAiYm9yZGVyUmFkaXVzIiwgInBhZGRpbmciLCAibWFwIiwgIl8iLCAiaW5kZXgiLCAiYmFja2dyb3VuZENvbG9yIiwgInRyYW5zcGFyZW50IiwgImZsZXhHcm93IiwgImp1c3RpZnlDb250ZW50IiwgImNvbG9yIiwgInRleHRDb2xvcjEwMCIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAieHhsIiwgImZvbnRXZWlnaHQiLCAicHJpbWFyeTEwMCIsICJsZyIsICJQT1dFUl9NUyIsICJCTEFDS19IT0xEX01TIiwgIlRJVExFX0RFTEFZX01TIiwgIk1vbml0b3JBcHAiLCAicGhhc2UiLCAic2V0UGhhc2UiLCAidXNlU3RhdGUiLCAiY3J0IiwgInNldENydCIsICJ1c2VFZmZlY3QiLCAiYmV2eSIsICJzdXJmYWNlRGVtbyIsICJzdGFydFJlYm9vdCIsICJ0IiwgInNldFRpbWVvdXQiLCAiY2xlYXJUaW1lb3V0IiwgInBvd2VyZWQiLCAiYm9vdGluZyIsICJfanN4IiwgIm5vZGUiLCAic3R5bGUiLCAicG93ZXJXcmFwIiwgIm9wYWNpdHkiLCAidHJhbnNmb3JtIiwgInNjYWxlIiwgInRyYW5zaXRpb24iLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgIkJvb3RTY3JlZW4iLCAidGl0bGVEZWxheSIsICJvblRpdGxlRG9uZSIsICJvbkJvb3REb25lIiwgIkRlc2t0b3AiLCAib25SZWJvb3QiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImZsZXhEaXJlY3Rpb24iLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJzdXJmYWNlMjAwIiwgIlN1cmZhY2VEZW1vIiwgIl9qc3giLCAic3VyZmFjZSIsICJuYW1lIiwgInN0eWxlIiwgInNjcmVlblJvb3QiLCAiTW9uaXRvckFwcCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInRyYW5zcGFyZW50IiwgIklURU1TIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIl8iLCAiaSIsICJTY3JvbGxEZW1vIiwgIl9qc3giLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAibm9kZSIsICJzdHlsZSIsICJsaXN0U3R5bGUiLCAibWFwIiwgIml0ZW0iLCAicm93U3R5bGUiLCAidGV4dCIsICJjb2xvciIsICJDb2xvcnMiLCAidGV4dENvbG9yMTAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJzbSIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJ3aWR0aCIsICJoZWlnaHQiLCAicGFkZGluZyIsICJvdmVyZmxvd1kiLCAic2Nyb2xsYmFyV2lkdGgiLCAiYmFja2dyb3VuZENvbG9yIiwgInN1cmZhY2UxMDAiLCAiYm9yZGVyUmFkaXVzIiwgInN1cmZhY2U0MDAiLCAiaW1wb3J0X3JlYWN0IiwgIlRZUEVTQ1JJUFQiLCAiRWRpdGFibGVUZXh0RGVtbyIsICJ0ZXh0IiwgInNldFRleHQiLCAidXNlU3RhdGUiLCAiX2pzeHMiLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiX2pzeCIsICJlZGl0YWJsZVRleHQiLCAidmFsdWUiLCAib25DaGFuZ2UiLCAibWF4TGVuZ3RoIiwgInN0eWxlIiwgImlucHV0U3R5bGUiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInh4bCIsICJvcGFjaXR5IiwgIndpZHRoIiwgImhlaWdodCIsICJqdXN0aWZ5Q29udGVudCIsICJwYWRkaW5nIiwgInRvcCIsICJyaWdodCIsICJib3R0b20iLCAibGVmdCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInN1cmZhY2UxMDAiLCAiYm9yZGVyUmFkaXVzIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJwcmltYXJ5MTAwIiwgImNvbG9yIiwgInRleHRDb2xvcjEwMCIsICJiYXNlIiwgImltcG9ydF9yZWFjdCIsICJUWVBFU0NSSVBUIiwgIk5vZGVEZW1vIiwgImdhcCIsICJzZXRHYXAiLCAidXNlU3RhdGUiLCAiX2pzeHMiLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAibm9kZSIsICJzdHlsZSIsICJwYW5lbFN0eWxlIiwgIl9qc3giLCAiYm94U3R5bGUiLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJwcmltYXJ5MTAwIiwgImdyZWVuMTAwIiwgInJlZDEwMCIsICJTbGlkZXIiLCAidmFsdWUiLCAibWluIiwgIm1heCIsICJvbkNoYW5nZSIsICJsYWJlbCIsICJ0b0ZpeGVkIiwgImZsZXhEaXJlY3Rpb24iLCAicGFkZGluZyIsICJzdXJmYWNlMTAwIiwgImJvcmRlclJhZGl1cyIsICJ3aWR0aCIsICJoZWlnaHQiLCAiaW1wb3J0X3JlYWN0IiwgIlNXQVRDSEVTIiwgIkdyYWRpZW50cyIsICJzcGVjdHJ1bSIsICJESVJFQ1RJT05fT1BUSU9OUyIsICJsYWJlbCIsICJ2YWx1ZSIsICJKVVNUSUZZX09QVElPTlMiLCAiQUxJR05fT1BUSU9OUyIsICJTd2F0Y2hlcyIsICJjb3VudCIsICJfanN4IiwgIl9GcmFnbWVudCIsICJzbGljZSIsICJtYXAiLCAiZyIsICJpIiwgIm5vZGUiLCAic3R5bGUiLCAic3dhdGNoIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJGbGV4UGxheWdyb3VuZCIsICJmbGV4RGlyZWN0aW9uIiwgInNldEZsZXhEaXJlY3Rpb24iLCAidXNlU3RhdGUiLCAianVzdGlmeUNvbnRlbnQiLCAic2V0SnVzdGlmeUNvbnRlbnQiLCAiYWxpZ25JdGVtcyIsICJzZXRBbGlnbkl0ZW1zIiwgIl9qc3hzIiwgImdhcCIsICJwbGF5Z3JvdW5kIiwgIlJhZGlvIiwgIm9wdGlvbnMiLCAib25DaGFuZ2UiLCAiRmxleERlbW8iLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiZnJhbWUiLCAid2lkdGgiLCAiZmxleFdyYXAiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiXyIsICJncm93IiwgImhlaWdodCIsICJwYWRkaW5nIiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAic3VyZmFjZTEwMCIsICJib3JkZXJSYWRpdXMiLCAiZmxleEdyb3ciLCAiaW1wb3J0X3JlYWN0IiwgIkNFTExTIiwgIkdyYWRpZW50cyIsICJzcGVjdHJ1bSIsICJDZWxscyIsICJjb3VudCIsICJmcm9tIiwgIl9qc3giLCAiX0ZyYWdtZW50IiwgIkFycmF5IiwgImxlbmd0aCIsICJfIiwgImkiLCAiQ2VsbCIsICJsYWJlbCIsICJncmFkaWVudCIsICJub2RlIiwgInN0eWxlIiwgImNlbGwiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInRleHQiLCAiY2VsbFRleHQiLCAiQ09MU19PUFRJT05TIiwgInZhbHVlIiwgIkdyaWRQbGF5Z3JvdW5kIiwgImNvbHMiLCAic2V0Q29scyIsICJ1c2VTdGF0ZSIsICJnYXAiLCAic2V0R2FwIiwgIl9qc3hzIiwgImNvbnRyb2xDb2x1bW4iLCAiZnJhbWUiLCAiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsICJSYWRpbyIsICJvcHRpb25zIiwgIm9uQ2hhbmdlIiwgIlNsaWRlciIsICJtaW4iLCAibWF4IiwgInRvRml4ZWQiLCAiR3JpZERlbW8iLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiZ3JpZENvbHVtbiIsICJncmlkVGVtcGxhdGVSb3dzIiwgImdyaWRSb3ciLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImRpc3BsYXkiLCAid2lkdGgiLCAicGFkZGluZyIsICJncmlkQXV0b1Jvd3MiLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJzdXJmYWNlMTAwIiwgImJvcmRlclJhZGl1cyIsICJqdXN0aWZ5Q29udGVudCIsICJjb2xvciIsICJ0ZXh0Q29sb3I0MDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInhzIiwgImZvbnRXZWlnaHQiLCAiaW1wb3J0X3JlYWN0IiwgIlRZUEVTQ1JJUFQiLCAiQnV0dG9uRGVtbyIsICJjb3VudCIsICJzZXRDb3VudCIsICJ1c2VTdGF0ZSIsICJfanN4cyIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJ0ZXh0IiwgInN0eWxlIiwgImNvdW50U3R5bGUiLCAiX2pzeCIsICJjb2xvciIsICJDb2xvcnMiLCAicHJpbWFyeTEwMCIsICJidXR0b24iLCAib25DbGljayIsICJjIiwgImNsaWNrQnV0dG9uU3R5bGUiLCAiaG92ZXJTdHlsZSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAicHJpbWFyeTIwMCIsICJwcmVzc1N0eWxlIiwgInByaW1hcnkzMDAiLCAiY2xpY2tMYWJlbFN0eWxlIiwgInRleHRDb2xvcjEwMCIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAibGciLCAid2lkdGgiLCAiaGVpZ2h0IiwgImp1c3RpZnlDb250ZW50IiwgImFsaWduSXRlbXMiLCAiYm9yZGVyUmFkaXVzIiwgInRleHRDb2xvcjQwMCIsICJiYXNlIiwgImZvbnRXZWlnaHQiLCAiaW1wb3J0X3JlYWN0IiwgIlNJWkVfVFMiLCAiRkFNSUxZX1RTIiwgIlRZUE9HUkFQSFlfVFMiLCAiV1JBUF9UUyIsICJQQVJBR1JBUEgiLCAiTElORV9CUkVBS1MiLCAibGFiZWwiLCAidmFsdWUiLCAiVGV4dERlbW8iLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgIl9qc3giLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiU2l6ZUNvbnRyb2wiLCAidGV4dCIsICJzdHlsZSIsICJmb250RmFtaWx5IiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJ4eGwiLCAiY29sb3IiLCAiQ29sb3JzIiwgImFtYmVyMTAwIiwgImxnIiwgInRleHRDb2xvcjEwMCIsICJwcmltYXJ5MTAwIiwgImZvbnRXZWlnaHQiLCAicmVkMTAwIiwgIlR5cG9ncmFwaHlDb250cm9sIiwgIldyYXBDb250cm9sIiwgInNpemUiLCAic2V0U2l6ZSIsICJ1c2VTdGF0ZSIsICJub2RlIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAiU2xpZGVyIiwgIm1pbiIsICJtYXgiLCAib25DaGFuZ2UiLCAidG9GaXhlZCIsICJsaW5lSGVpZ2h0IiwgInNldExpbmVIZWlnaHQiLCAibGV0dGVyU3BhY2luZyIsICJzZXRMZXR0ZXJTcGFjaW5nIiwgInNoYWRvdyIsICJzZXRTaGFkb3ciLCAid2lkdGgiLCAiYmFzZSIsICJ0ZXh0U2hhZG93IiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJ1bmRlZmluZWQiLCAiQ2hlY2tib3giLCAiZW5hYmxlZCIsICJtb2RlIiwgInNldE1vZGUiLCAicGFkZGluZyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAic3VyZmFjZTEwMCIsICJib3JkZXJSYWRpdXMiLCAic20iLCAidGV4dENvbG9yMjAwIiwgImxpbmVCcmVhayIsICJSYWRpbyIsICJvcHRpb25zIiwgImltcG9ydF9yZWFjdCIsICJGTElQX1RTWCIsICJTTElDRV9UU1giLCAiSW1hZ2VEZW1vIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIkZsaXBDb250cm9sIiwgIlNsaWNlQ29udHJvbCIsICJmbGlwWCIsICJzZXRGbGlwWCIsICJ1c2VTdGF0ZSIsICJmbGlwWSIsICJzZXRGbGlwWSIsICJub2RlIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImFsaWduSXRlbXMiLCAiaW1hZ2UiLCAic3JjIiwgImxvZ29TdHlsZSIsICJ0aW50IiwgIkNvbG9ycyIsICJwcmltYXJ5MTAwIiwgIkJ1dHRvbiIsICJvbkNsaWNrIiwgImYiLCAid2lkdGgiLCAic2V0V2lkdGgiLCAiaGVpZ2h0IiwgInNldEhlaWdodCIsICJmcmFtZUJveCIsICJpbWFnZU1vZGUiLCAidHlwZSIsICJib3JkZXIiLCAibWF4Q29ybmVyU2NhbGUiLCAiU2xpZGVyIiwgInZhbHVlIiwgIm1pbiIsICJtYXgiLCAib25DaGFuZ2UiLCAidiIsICJNYXRoIiwgInJvdW5kIiwgImxhYmVsIiwgImp1c3RpZnlDb250ZW50IiwgImJhY2tncm91bmRHcmFkaWVudCIsICJHcmFkaWVudHMiLCAic3BlY3RydW0iLCAiYm9yZGVyUmFkaXVzIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJGQURFX01TIiwgIlRZUEVTQ1JJUFQiLCAiRmFkZUFuaW1hdGlvbkRlbW8iLCAib3BhY2l0eSIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aFJlcGVhdCIsICJ3aXRoVGltaW5nIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIm5vZGUiLCAic3R5bGUiLCAiZmFkZVN0YWdlU3R5bGUiLCAiQW5pbWF0ZWQiLCAiZmFkZVNxdWFyZVN0eWxlIiwgImFuaW1hdGVkU3R5bGUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImp1c3RpZnlDb250ZW50IiwgImFsaWduSXRlbXMiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAicHJpbWFyeTEwMCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAiVFlQRVNDUklQVCIsICJDT1VOVCIsICJBTVAiLCAiU1FVQVJFIiwgIlRSQVZFTF9NUyIsICJTVE9QX01TIiwgIlNUQUdHRVJfTVMiLCAiUFVMU0VfTVMiLCAiUkVUQVJHRVRfTVMiLCAiQ09PTCIsICJDb2xvcnMiLCAicHJpbWFyeTEwMCIsICJyZWQxMDAiLCAiZ3JlZW4xMDAiLCAieWVsbG93MTAwIiwgInB1cnBsZTEwMCIsICJXQVJNIiwgIm9yYW5nZTEwMCIsICJ0ZWFsMTAwIiwgInNreTEwMCIsICJCb3VuY2luZ0JhbGxzQW5pbWF0aW9uRGVtbyIsICJtb2RlIiwgInNldE1vZGUiLCAidXNlU3RhdGUiLCAiX2pzeHMiLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiX2pzeCIsICJub2RlIiwgInN0eWxlIiwgImxhbmVzU3R5bGUiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiXyIsICJpIiwgIkJvdW5jaW5nU3F1YXJlIiwgImluZGV4IiwgInJvd1N0eWxlIiwgIm1hcCIsICJtIiwgIk1vZGVCdXR0b24iLCAibGFiZWwiLCAic2VsZWN0ZWQiLCAib25QcmVzcyIsICJ4IiwgInVzZVNoYXJlZFZhbHVlIiwgInB1bHNlIiwgImZpcnN0IiwgInVzZVJlZiIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aERlbGF5IiwgIndpdGhSZXBlYXQiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAibW92ZSIsICJ0byIsICJ3aXRoU3ByaW5nIiwgInN0aWZmbmVzcyIsICJkYW1waW5nIiwgImJvdW5jZSIsICJ3aXRoU2VxdWVuY2UiLCAiZHJpdmVyIiwgImN1cnJlbnQiLCAibGFuZVN0eWxlIiwgIkFuaW1hdGVkIiwgInNxdWFyZVN0eWxlIiwgImJhY2tncm91bmRDb2xvciIsICJhbmltYXRlZFN0eWxlIiwgInRyYW5zbGF0ZVgiLCAic2NhbGUiLCAiaW50ZXJwb2xhdGUiLCAiaW50ZXJwb2xhdGVDb2xvciIsICJidXR0b24iLCAib25DbGljayIsICJtb2RlQnV0dG9uU3R5bGUiLCAic3VyZmFjZTMwMCIsICJob3ZlclN0eWxlIiwgInN1cmZhY2U1MDAiLCAidGV4dCIsICJjb2xvciIsICJ0ZXh0Q29sb3I0MDAiLCAidGV4dENvbG9yMTAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJzbSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgIndpZHRoIiwgImhlaWdodCIsICJqdXN0aWZ5Q29udGVudCIsICJib3JkZXJSYWRpdXMiLCAicGFkZGluZyIsICJ0b3AiLCAicmlnaHQiLCAiYm90dG9tIiwgImxlZnQiLCAiaW1wb3J0X3JlYWN0IiwgIlRyYW5zaXRpb25EZW1vIiwgIm9uIiwgInNldE9uIiwgInVzZVN0YXRlIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgImJ1dHRvbiIsICJzdHlsZSIsICJwaWxsU3R5bGUiLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJwcmltYXJ5MTAwIiwgInRyYW5zZm9ybSIsICJzY2FsZSIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJob3ZlclN0eWxlIiwgInByaW1hcnkyMDAiLCAicHJlc3NTdHlsZSIsICJwcmltYXJ5MzAwIiwgInRleHQiLCAibGFiZWxTdHlsZSIsICJvbkNsaWNrIiwgInYiLCAiZ3JlZW4xMDAiLCAic3VyZmFjZTUwMCIsICJvcGFjaXR5IiwgInRyYW5zbGF0ZVgiLCAic3RpZmZuZXNzIiwgImRhbXBpbmciLCAid2lkdGgiLCAiaGVpZ2h0IiwgImp1c3RpZnlDb250ZW50IiwgImFsaWduSXRlbXMiLCAiYm9yZGVyUmFkaXVzIiwgImNvbG9yIiwgInRleHRDb2xvcjQwMCIsICJmb250U2l6ZSIsICJGb250U2l6ZXMiLCAiYmFzZSIsICJmb250V2VpZ2h0IiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJjb2x1bW4iLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJwbGF5QnV0dG9uIiwgImp1c3RpZnlDb250ZW50IiwgInBhZGRpbmciLCAidG9wIiwgInJpZ2h0IiwgImJvdHRvbSIsICJsZWZ0IiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInByaW1hcnkxMDAiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgIkdyYWRpZW50cyIsICJwcmltYXJ5IiwgInRyYW5zZm9ybSIsICJzY2FsZSIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJwbGF5TGFiZWwiLCAiY29sb3IiLCAidGV4dENvbG9yNDAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJzbSIsICJmb250V2VpZ2h0IiwgIlRSQVZFTCIsICJET1QiLCAiTEFORVMiLCAibmFtZSIsICJlYXNpbmciLCAiY29sb3IiLCAiQ29sb3JzIiwgInByaW1hcnkxMDAiLCAiZ3JlZW4xMDAiLCAicmVkMTAwIiwgInB1cnBsZTEwMCIsICJUWVBFU0NSSVBUIiwgIkVhc2luZ0RlbW8iLCAiZHVyYXRpb24iLCAic2V0RHVyYXRpb24iLCAidXNlU3RhdGUiLCAicGxheSIsICJzZXRQbGF5IiwgIl9qc3giLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJjb2x1bW4iLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAibWFwIiwgImxhbmUiLCAiTGFuZSIsICJTbGlkZXIiLCAidmFsdWUiLCAibWluIiwgIm1heCIsICJvbkNoYW5nZSIsICJsYWJlbCIsICJ0b0ZpeGVkIiwgImJ1dHRvbiIsICJwbGF5QnV0dG9uIiwgInByZXNzU3R5bGUiLCAidHJhbnNmb3JtIiwgInNjYWxlIiwgIm9uQ2xpY2siLCAibiIsICJ0ZXh0IiwgInBsYXlMYWJlbCIsICJ4IiwgInVzZVNoYXJlZFZhbHVlIiwgIm1vdW50ZWQiLCAidXNlUmVmIiwgInVzZUVmZmVjdCIsICJjdXJyZW50IiwgIndpdGhUaW1pbmciLCAibGFuZUxhYmVsIiwgInRyYWNrIiwgIkFuaW1hdGVkIiwgImRvdCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYW5pbWF0ZWRTdHlsZSIsICJ0cmFuc2xhdGVYIiwgImFsaWduSXRlbXMiLCAid2lkdGgiLCAidGV4dENvbG9yMjAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJ4cyIsICJ0ZXh0QWxpZ24iLCAiaGVpZ2h0IiwgInN1cmZhY2UxMDAiLCAiYm9yZGVyUmFkaXVzIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJUWVBFU0NSSVBUIiwgIlNwcmluZ0RlbW8iLCAic3RpZmZuZXNzIiwgInNldFN0aWZmbmVzcyIsICJ1c2VTdGF0ZSIsICJkYW1waW5nIiwgInNldERhbXBpbmciLCAicmlnaHQiLCAic2V0UmlnaHQiLCAieCIsICJ1c2VTaGFyZWRWYWx1ZSIsICJib3VuY2UiLCAidG8iLCAidmFsdWUiLCAid2l0aFNwcmluZyIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiY29sdW1uIiwgInN0YWdlIiwgIkFuaW1hdGVkIiwgInNxdWFyZSIsICJhbmltYXRlZFN0eWxlIiwgInRyYW5zbGF0ZVgiLCAiU2xpZGVyIiwgIm1pbiIsICJtYXgiLCAib25DaGFuZ2UiLCAibGFiZWwiLCAidG9GaXhlZCIsICJidXR0b24iLCAicGxheUJ1dHRvbiIsICJwcmVzc1N0eWxlIiwgInRyYW5zZm9ybSIsICJzY2FsZSIsICJvbkNsaWNrIiwgInRleHQiLCAicGxheUxhYmVsIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAic3VyZmFjZTEwMCIsICJib3JkZXJSYWRpdXMiLCAicHJpbWFyeTEwMCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAiR3JhZGllbnRzIiwgInByaW1hcnkiLCAiaW1wb3J0X2JldnlfcmVhY3QiLCAiVFlQRVNDUklQVCIsICJTZXF1ZW5jZURlbW8iLCAieCIsICJ1c2VTaGFyZWRWYWx1ZSIsICJydW4iLCAidmFsdWUiLCAid2l0aFNlcXVlbmNlIiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgIndpdGhEZWxheSIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiY29sdW1uIiwgInN0YWdlIiwgIkFuaW1hdGVkIiwgInNxdWFyZSIsICJhbmltYXRlZFN0eWxlIiwgInRyYW5zbGF0ZVgiLCAiYnV0dG9uIiwgInBsYXlCdXR0b24iLCAicHJlc3NTdHlsZSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAib25DbGljayIsICJ0ZXh0IiwgInBsYXlMYWJlbCIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgIndpZHRoIiwgImhlaWdodCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInN1cmZhY2UxMDAiLCAiYm9yZGVyUmFkaXVzIiwgImdyZWVuMTAwIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJUWVBFU0NSSVBUIiwgIlNwaW5EZW1vIiwgInJvdCIsICJ1c2VTaGFyZWRWYWx1ZSIsICJzcGlubmluZyIsICJzZXRTcGlubmluZyIsICJ1c2VTdGF0ZSIsICJzdGFydCIsICJ2YWx1ZSIsICJ3aXRoUmVwZWF0IiwgIndpdGhUaW1pbmciLCAiTWF0aCIsICJQSSIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAic3RvcCIsICJjYW5jZWxBbmltYXRpb24iLCAiX2pzeCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImNvbHVtbiIsICJzdGFnZSIsICJBbmltYXRlZCIsICJzcXVhcmUiLCAiYW5pbWF0ZWRTdHlsZSIsICJyb3RhdGUiLCAidGV4dCIsICJzcXVhcmVUZXh0IiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImJ1dHRvbiIsICJwbGF5QnV0dG9uIiwgInByZXNzU3R5bGUiLCAidHJhbnNmb3JtIiwgInNjYWxlIiwgIm9uQ2xpY2siLCAicGxheUxhYmVsIiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAicmVkMTAwIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAid2lkdGgiLCAiaGVpZ2h0IiwgInN1cmZhY2UxMDAiLCAiYm9yZGVyUmFkaXVzIiwgInB1cnBsZTEwMCIsICJjb2xvciIsICJ0ZXh0Q29sb3I0MDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInh4bCIsICJmb250V2VpZ2h0IiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJUWVBFU0NSSVBUIiwgIkludGVycG9sYXRlRGVtbyIsICJ0IiwgInVzZVNoYXJlZFZhbHVlIiwgInYiLCAic2V0ViIsICJ1c2VTdGF0ZSIsICJvbkNoYW5nZSIsICJuIiwgInZhbHVlIiwgIl9qc3giLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJjb2x1bW4iLCAic3RhZ2UiLCAiQW5pbWF0ZWQiLCAic3F1YXJlIiwgImFuaW1hdGVkU3R5bGUiLCAic2NhbGUiLCAiaW50ZXJwb2xhdGUiLCAiYmFja2dyb3VuZENvbG9yIiwgImludGVycG9sYXRlQ29sb3IiLCAiQ29sb3JzIiwgInByaW1hcnkxMDAiLCAicmVkMTAwIiwgIlNsaWRlciIsICJtaW4iLCAibWF4IiwgImxhYmVsIiwgInRvRml4ZWQiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJ3aWR0aCIsICJoZWlnaHQiLCAic3VyZmFjZTEwMCIsICJib3JkZXJSYWRpdXMiLCAiaW1wb3J0X3JlYWN0IiwgImJveCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAicHJpbWFyeTEwMCIsICJqdXN0aWZ5Q29udGVudCIsICJhbGlnbkl0ZW1zIiwgInJvdyIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJzdGFnZSIsICJwYWRkaW5nIiwgInN1cmZhY2UxMDAiLCAiY2FwdGlvbiIsICJjb2xvciIsICJ0ZXh0Q29sb3IyMDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInhzIiwgImNvbnRyb2xDb2x1bW4iLCAiVW5pdHNEZW1vIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIkxlbmd0aFNlY3Rpb24iLCAiRm9udFNpemVTZWN0aW9uIiwgIkFuZ2xlU2VjdGlvbiIsICJUaW1lU2VjdGlvbiIsICJMRU5HVEhTIiwgIm5vZGUiLCAic3R5bGUiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAid2lkdGgiLCAibWFwIiwgInciLCAiVGV4dE1vbm8iLCAiY2FwdGlvbiIsICJoZWlnaHQiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAicHJpbWFyeTEwMCIsICJGT05UX1NJWkVTIiwgInNpemUiLCAiYWxpZ25JdGVtcyIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImNvbG9yIiwgInRleHRDb2xvcjEwMCIsICJmb250V2VpZ2h0IiwgIkFOR0xFUyIsICJyb3ciLCAiYW5nbGUiLCAic3RhZ2UiLCAiYm94IiwgInB1cnBsZTEwMCIsICJ0cmFuc2Zvcm0iLCAicm90YXRlIiwgIm9uIiwgInNldE9uIiwgInVzZVN0YXRlIiwgIlRpbWVCb3giLCAibGFiZWwiLCAiZHVyYXRpb24iLCAib25Ub2dnbGUiLCAidiIsICJidXR0b24iLCAib25DbGljayIsICJ0aW1lVHJhY2siLCAiZ3JlZW4xMDAiLCAidHJhbnNsYXRlWCIsICJ0cmFuc2l0aW9uIiwgImVhc2luZyIsICJwYWRkaW5nIiwgImp1c3RpZnlDb250ZW50IiwgInN1cmZhY2UxMDAiLCAiaW1wb3J0X3JlYWN0IiwgInRvSGV4IiwgIm4iLCAiTWF0aCIsICJyb3VuZCIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJDb2xvcnNEZW1vIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIkJhY2tncm91bmRDb250cm9sIiwgIkJvcmRlckNvbG9yQ29udHJvbCIsICJUZXh0Q29sb3JDb250cm9sIiwgIkNvbG9yRm9ybWF0c1JvdyIsICJDT0xPUl9GT1JNQVRTIiwgIm5vZGUiLCAic3R5bGUiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAibWFwIiwgImNvbG9yIiwgIndpZHRoIiwgImhlaWdodCIsICJib3JkZXJSYWRpdXMiLCAiYmFja2dyb3VuZENvbG9yIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAidGV4dCIsICJDb2xvcnMiLCAidGV4dENvbG9yNDAwIiwgImZvbnRTaXplIiwgIkZvbnRTaXplcyIsICJ4cyIsICJmb250V2VpZ2h0IiwgInIiLCAic2V0UiIsICJ1c2VTdGF0ZSIsICJnIiwgInNldEciLCAiYiIsICJzZXRCIiwgImNvbnRyb2xDb2x1bW4iLCAiYm94IiwgIlNsaWRlciIsICJ2YWx1ZSIsICJtaW4iLCAibWF4IiwgIm9uQ2hhbmdlIiwgImxhYmVsIiwgInRvRml4ZWQiLCAiQk9SREVSX09QVElPTlMiLCAicHJpbWFyeTEwMCIsICJncmVlbjEwMCIsICJyZWQxMDAiLCAicHVycGxlMTAwIiwgImMiLCAic2V0QyIsICJzdXJmYWNlMjAwIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJSYWRpbyIsICJvcHRpb25zIiwgIlRFWFRfT1BUSU9OUyIsICJhbWJlcjEwMCIsICJza3kxMDAiLCAieHhsIiwgImltcG9ydF9yZWFjdCIsICJCb3JkZXJzRGVtbyIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJSYWRpdXNDb250cm9sIiwgIldpZHRoQ29udHJvbCIsICJPdXRsaW5lQ29udHJvbCIsICJyIiwgInNldFIiLCAidXNlU3RhdGUiLCAibm9kZSIsICJzdHlsZSIsICJjb250cm9sQ29sdW1uIiwgImJveCIsICJib3JkZXJSYWRpdXMiLCAiU2xpZGVyIiwgInZhbHVlIiwgIm1pbiIsICJtYXgiLCAib25DaGFuZ2UiLCAibGFiZWwiLCAidG9GaXhlZCIsICJ3IiwgInNldFciLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJzdXJmYWNlMjAwIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJwcmltYXJ5MTAwIiwgIm9mZnNldCIsICJzZXRPZmZzZXQiLCAib3V0bGluZSIsICJ3aWR0aCIsICJjb2xvciIsICJhbWJlcjEwMCIsICJpbXBvcnRfcmVhY3QiLCAiU3BhY2luZ0RlbW8iLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgIl9qc3giLCAiRXhhbXBsZSIsICJkZXNjcmlwdGlvbiIsICJ0c3giLCAiUGFkZGluZ0NvbnRyb2wiLCAiR2FwQ29udHJvbCIsICJNYXJnaW5Db250cm9sIiwgInAiLCAic2V0UCIsICJ1c2VTdGF0ZSIsICJub2RlIiwgInN0eWxlIiwgImNvbnRyb2xDb2x1bW4iLCAid3JhcCIsICJwYWRkaW5nIiwgImlubmVyIiwgIlNsaWRlciIsICJ2YWx1ZSIsICJtaW4iLCAibWF4IiwgIm9uQ2hhbmdlIiwgImxhYmVsIiwgInRvRml4ZWQiLCAiZyIsICJzZXRHIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImJhY2tncm91bmRDb2xvciIsICJDb2xvcnMiLCAicHVycGxlMTAwIiwgInllbGxvdzEwMCIsICJtIiwgInNldE0iLCAiZ3JlZW4xMDAiLCAibWFyZ2luIiwgImxlZnQiLCAiYWxpZ25JdGVtcyIsICJzdXJmYWNlMTAwIiwgImJvcmRlclJhZGl1cyIsICJ3aWR0aCIsICJoZWlnaHQiLCAicHJpbWFyeTEwMCIsICJpbXBvcnRfcmVhY3QiLCAiU2l6aW5nRGVtbyIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJXaWR0aENvbnRyb2wiLCAiQXNwZWN0Q29udHJvbCIsICJNYXhXaWR0aENvbnRyb2wiLCAidyIsICJzZXRXIiwgInVzZVN0YXRlIiwgIm5vZGUiLCAic3R5bGUiLCAiY29udHJvbENvbHVtbiIsICJ0cmFjayIsICJiYXIiLCAid2lkdGgiLCAiTWF0aCIsICJyb3VuZCIsICJTbGlkZXIiLCAidmFsdWUiLCAibWluIiwgIm1heCIsICJvbkNoYW5nZSIsICJsYWJlbCIsICJ0b0ZpeGVkIiwgImFyIiwgInNldEFyIiwgImhlaWdodCIsICJhc3BlY3RSYXRpbyIsICJib3JkZXJSYWRpdXMiLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJyZWQxMDAiLCAic2V0TWF4IiwgIm1heFdpZHRoIiwgInllbGxvdzEwMCIsICJmbGV4RGlyZWN0aW9uIiwgInBhZGRpbmciLCAic3VyZmFjZTEwMCIsICJwcmltYXJ5MTAwIiwgImltcG9ydF9yZWFjdCIsICJUcmFuc2Zvcm1EZW1vIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIlRyYW5zbGF0ZUNvbnRyb2wiLCAiU2NhbGVDb250cm9sIiwgIlJvdGF0ZUNvbnRyb2wiLCAieCIsICJzZXRYIiwgInVzZVN0YXRlIiwgInkiLCAic2V0WSIsICJub2RlIiwgInN0eWxlIiwgImNvbnRyb2xDb2x1bW4iLCAic3RhZ2UiLCAiYm94IiwgInRyYW5zZm9ybSIsICJ0cmFuc2xhdGVYIiwgInRyYW5zbGF0ZVkiLCAiU2xpZGVyIiwgInZhbHVlIiwgIm1pbiIsICJtYXgiLCAib25DaGFuZ2UiLCAibGFiZWwiLCAidG9GaXhlZCIsICJzIiwgInNldFMiLCAiYmFja2dyb3VuZENvbG9yIiwgIkNvbG9ycyIsICJncmVlbjEwMCIsICJzY2FsZSIsICJyIiwgInNldFIiLCAicHVycGxlMTAwIiwgInJvdGF0ZSIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgIndpZHRoIiwgImhlaWdodCIsICJzdXJmYWNlMTAwIiwgImJvcmRlclJhZGl1cyIsICJpbXBvcnRfcmVhY3QiLCAiU2hhZG93RGVtbyIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJCbHVyQ29udHJvbCIsICJPZmZzZXRDb250cm9sIiwgImJsdXIiLCAic2V0Qmx1ciIsICJ1c2VTdGF0ZSIsICJzcHJlYWQiLCAic2V0U3ByZWFkIiwgIm5vZGUiLCAic3R5bGUiLCAiY29udHJvbENvbHVtbiIsICJzdGFnZSIsICJib3giLCAiYm94U2hhZG93IiwgImNvbG9yIiwgIkNvbG9ycyIsICJzaGFkb3cyMDAiLCAiYmx1clJhZGl1cyIsICJzcHJlYWRSYWRpdXMiLCAiU2xpZGVyIiwgInZhbHVlIiwgIm1pbiIsICJtYXgiLCAib25DaGFuZ2UiLCAibGFiZWwiLCAidG9GaXhlZCIsICJ4IiwgInNldFgiLCAieSIsICJzZXRZIiwgImJhY2tncm91bmRDb2xvciIsICJyZWQxMDAiLCAieE9mZnNldCIsICJ5T2Zmc2V0IiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAicGFkZGluZyIsICJzdXJmYWNlMTAwIiwgImJvcmRlclJhZGl1cyIsICJHcmFkaWVudHNEZW1vIiwgIl9qc3hzIiwgIl9GcmFnbWVudCIsICJfanN4IiwgIkV4YW1wbGUiLCAiZGVzY3JpcHRpb24iLCAidHN4IiwgIm5vZGUiLCAic3R5bGUiLCAic3RhZ2UiLCAiYm94IiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImNvbG9yIiwgImJhY2tncm91bmRDb2xvciIsICJ1bmRlZmluZWQiLCAiYm9yZGVyIiwgImJvcmRlckdyYWRpZW50IiwgImxheWVyZWQiLCAiaG92ZXJTdHlsZSIsICJob3ZlcmVkIiwgImltcG9ydF9yZWFjdCIsICJPcGFjaXR5RGVtbyIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJFeGFtcGxlIiwgImRlc2NyaXB0aW9uIiwgInRzeCIsICJPcGFjaXR5Q29udHJvbCIsICJaSW5kZXhDb250cm9sIiwgIkRpc3BsYXlDb250cm9sIiwgIm9wYWNpdHkiLCAic2V0T3BhY2l0eSIsICJ1c2VTdGF0ZSIsICJub2RlIiwgInN0eWxlIiwgImNvbnRyb2xDb2x1bW4iLCAiYm94IiwgIlNsaWRlciIsICJ2YWx1ZSIsICJtaW4iLCAibWF4IiwgIm9uQ2hhbmdlIiwgImxhYmVsIiwgInRvRml4ZWQiLCAiRlJPTlRfT1BUSU9OUyIsICJmcm9udCIsICJzZXRGcm9udCIsICJvdmVybGFwU3RhZ2UiLCAiY2hpcCIsICJsZWZ0IiwgInRvcCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInByaW1hcnkxMDAiLCAiekluZGV4IiwgInJlZDEwMCIsICJSYWRpbyIsICJvcHRpb25zIiwgImhpZGRlbiIsICJzZXRIaWRkZW4iLCAicm93IiwgImdyZWVuMTAwIiwgImRpc3BsYXkiLCAicHVycGxlMTAwIiwgIkNoZWNrYm94IiwgImVuYWJsZWQiLCAicG9zaXRpb25UeXBlIiwgIndpZHRoIiwgImhlaWdodCIsICJwYWRkaW5nIiwgInN1cmZhY2UxMDAiLCAiYm9yZGVyUmFkaXVzIiwgIkRFTU9TIiwgImxhYmVsIiwgInNjZW5lIiwgImNvbXBvbmVudCIsICJIb21lIiwgImV4cGFuZGVkQnlEZWZhdWx0IiwgImNoaWxkcmVuIiwgIk5vZGVEZW1vIiwgIkJ1dHRvbkRlbW8iLCAiVGV4dERlbW8iLCAiRWRpdGFibGVUZXh0RGVtbyIsICJJbWFnZURlbW8iLCAiQ2FudmFzRGVtbyIsICJQb3J0YWxEZW1vIiwgIlN1cmZhY2VEZW1vIiwgIkFuY2hvcmVkRGVtbyIsICJGbGV4RGVtbyIsICJHcmlkRGVtbyIsICJTY3JvbGxEZW1vIiwgIlVuaXRzRGVtbyIsICJDb2xvcnNEZW1vIiwgIkJvcmRlcnNEZW1vIiwgIlNwYWNpbmdEZW1vIiwgIlNpemluZ0RlbW8iLCAiVHJhbnNmb3JtRGVtbyIsICJTaGFkb3dEZW1vIiwgIkdyYWRpZW50c0RlbW8iLCAiT3BhY2l0eURlbW8iLCAiQmV2eVRvUmVhY3REZW1vIiwgIlJlYWN0VG9CZXZ5RGVtbyIsICJCaWRpcmVjdGlvbkNvbW11bmljYXRpb25EZW1vIiwgIkZhZGVBbmltYXRpb25EZW1vIiwgIkVhc2luZ0RlbW8iLCAiU3ByaW5nRGVtbyIsICJTZXF1ZW5jZURlbW8iLCAiU3BpbkRlbW8iLCAiSW50ZXJwb2xhdGVEZW1vIiwgIkJvdW5jaW5nQmFsbHNBbmltYXRpb25EZW1vIiwgIlRyYW5zaXRpb25EZW1vIiwgIkludGVyYWN0aW9uc0RlbW8iLCAiZmluZERlbW9CeUxhYmVsIiwgIml0ZW1zIiwgIml0ZW0iLCAiZm91bmQiLCAidW5kZWZpbmVkIiwgIkFwcCIsICJzZWxlY3RlZERlbW8iLCAic2V0U2VsZWN0ZWREZW1vIiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJiZXZ5IiwgInNlbGVjdFNjZW5lIiwgIm9uIiwgImRlbW8iLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJyb290U3R5bGUiLCAibmF2U3R5bGUiLCAiX2pzeCIsICJpbWFnZSIsICJzcmMiLCAid2lkdGgiLCAidGV4dCIsICJ0aXRsZVN0eWxlIiwgIml0ZW1zU3R5bGUiLCAibWFwIiwgImluZGV4IiwgIkl0ZW0iLCAic2VsZWN0ZWRJdGVtIiwgIm9uU2VsZWN0ZWQiLCAiY29udGVudFN0eWxlIiwgImlzQ2hpbGQiLCAiZXhwYW5kZWQiLCAic2V0RXhwYW5kZWQiLCAib25QcmVzcyIsICJsZW5ndGgiLCAib25DaGlsZFNlbGVjdGVkIiwgImZsZXhEaXJlY3Rpb24iLCAiSXRlbUJ1dHRvbiIsICJpc0FjdGl2ZSIsICJpc0V4cGFuZGVkIiwgImhhc0NoaWxkcmVuIiwgImdhcCIsICJtYXJnaW4iLCAibGVmdCIsICJvdmVyZmxvd1kiLCAibWF4SGVpZ2h0IiwgIk5BVl9JVEVNX1BYIiwgInRyYW5zaXRpb24iLCAic2l6ZSIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAiY2hpbGQiLCAiYnV0dG9uIiwgIm9uQ2xpY2siLCAibmF2QnV0dG9uU3R5bGUiLCAicGFkZGluZyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQ29sb3JzIiwgInByaW1hcnkxMDAiLCAic3VyZmFjZTMwMCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAiR3JhZGllbnRzIiwgInByaW1hcnkiLCAic3VyZmFjZSIsICJob3ZlclN0eWxlIiwgInN1cmZhY2VIb3ZlciIsICJqdXN0aWZ5Q29udGVudCIsICJhbGlnbkl0ZW1zIiwgImNvbG9yIiwgInRleHRDb2xvcjQwMCIsICJ0ZXh0Q29sb3IxMDAiLCAiZm9udFNpemUiLCAiRm9udFNpemVzIiwgInNtIiwgImJhc2UiLCAiZm9udFdlaWdodCIsICJmb250RmFtaWx5IiwgImhlaWdodCIsICJzdXJmYWNlMTAwIiwgIm5hdkJhY2tkcm9wIiwgInpJbmRleCIsICJib3hTaGFkb3ciLCAiYmx1clJhZGl1cyIsICJzcHJlYWRSYWRpdXMiLCAic2hhZG93MTAwIiwgInhsIiwgInRvcCIsICJyaWdodCIsICJib3R0b20iLCAiYm9yZGVyUmFkaXVzIiwgImZsZXhHcm93IiwgIm1vdW50IiwgIl9qc3giLCAiQXBwIl0KfQo=
