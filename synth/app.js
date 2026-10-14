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
  var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
  var import_bevy_react7 = __toESM(require_bevy_react(), 1);

  // src/App.tsx
  var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
  var import_react12 = __toESM(require_react(), 1);
  var import_bevy_react6 = __toESM(require_bevy_react(), 1);

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
    patch: {
      set(value) {
        emit("patch.set", value);
      }
    },
    pointer: {
      get() {
        return request("pointer.get", null);
      }
    },
    synth: {
      set(value) {
        emit("synth.set", value);
      }
    },
    view: {
      set(value) {
        emit("view.set", value);
      }
    },
    window: {
      size() {
        return request("window.size", null);
      }
    }
  };

  // src/chrome/AddMenu.tsx
  var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
  var import_react6 = __toESM(require_react(), 1);
  var import_bevy_react5 = __toESM(require_bevy_react(), 1);

  // src/graph/catalog.ts
  var CATEGORIES = {
    timing: {
      label: "Timing",
      color: "#9d7bff"
    },
    source: {
      label: "Sources",
      color: "#4cc2ff"
    },
    shaper: {
      label: "Shapers",
      color: "#ff7a59"
    },
    effect: {
      label: "Effects",
      color: "#57e38c"
    },
    output: {
      label: "Output",
      color: "#ffd166"
    }
  };
  var port = (name, signal) => ({
    name,
    signal
  });
  var KINDS = {
    clock: {
      title: "Clock",
      category: "timing",
      blurb: "Ticks on the beat, swung or straight",
      icon: "M21 12a9 9 0 1 1-18 0a9 9 0 1 1 18 0Z M12 7v5l3 2",
      inputs: [],
      outputs: [
        port("pulse", "gate")
      ],
      width: 220,
      body: 78,
      params: {
        div: 1,
        swing: 0
      }
    },
    sequencer: {
      title: "Sequencer",
      category: "timing",
      blurb: "Eight steps of melody",
      icon: "M4 19v-6 M9 19V8 M14 19v-4 M19 19V5",
      inputs: [
        port("clock", "gate")
      ],
      outputs: [
        port("pitch", "cv"),
        port("gate", "gate")
      ],
      width: 272,
      body: 96,
      params: {
        p0: 0.3,
        p1: 0.55,
        p2: 0.3,
        p3: 0.8,
        p4: 0.45,
        p5: 0.3,
        p6: 0.65,
        p7: 0.95,
        mask: 219
      }
    },
    beat: {
      title: "Beat",
      category: "timing",
      blurb: "Four lanes of sixteenth hits",
      icon: "M3 6h18 M3 12h18 M3 18h18 M7 3.5v5 M15 9.5v5 M11 15.5v5",
      inputs: [
        port("clock", "gate")
      ],
      outputs: [
        port("a", "gate"),
        port("b", "gate"),
        port("c", "gate"),
        port("d", "gate")
      ],
      width: 340,
      body: 108,
      // A bar per lane, bit `i` the `i`-th sixteenth: four on the floor,
      // a backbeat, off-beat eighths.
      params: {
        k0: 4369,
        k1: 4112,
        k2: 17476,
        k3: 0
      }
    },
    oscillator: {
      title: "Oscillator",
      category: "source",
      blurb: "A tone, four shapes, detunable",
      icon: "M1 12q3.5-8 7 0t7 0t7 0",
      inputs: [
        port("pitch", "cv"),
        port("fm", "cv")
      ],
      outputs: [
        port("out", "audio")
      ],
      width: 236,
      body: 150,
      params: {
        wave: 1,
        tune: 0.5,
        level: 0.8,
        detune: 0
      }
    },
    noise: {
      title: "Noise",
      category: "source",
      blurb: "Hiss in three colors",
      icon: "M2 12l2-5 2 9 2-7 2 6 2-9 2 8 2-4 2 5 2-6 2 3",
      inputs: [],
      outputs: [
        port("out", "audio")
      ],
      width: 212,
      body: 146,
      params: {
        color: 1,
        level: 0.5
      }
    },
    lfo: {
      title: "LFO",
      category: "source",
      blurb: "A slow wobble, or random steps",
      icon: "M2 14q5-11 10 0t10 0",
      inputs: [],
      outputs: [
        port("out", "cv")
      ],
      width: 212,
      body: 150,
      params: {
        shape: 0,
        rate: 0.55,
        depth: 0.6
      }
    },
    drum: {
      title: "Drum",
      category: "source",
      blurb: "A kick, snare, clap or hat",
      icon: "M4 8.5a8 3 0 1 0 16 0a8 3 0 1 0-16 0Z M4 8.5v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7",
      inputs: [
        port("trig", "gate"),
        port("pitch", "cv")
      ],
      outputs: [
        port("out", "audio")
      ],
      width: 236,
      body: 140,
      params: {
        voice: 0,
        tune: 0.4,
        decay: 0.4,
        level: 0.8
      }
    },
    envelope: {
      title: "Envelope",
      category: "shaper",
      blurb: "Attack, decay, sustain, release",
      icon: "M3 19L7 5l4 6h6l4 8",
      inputs: [
        port("gate", "gate")
      ],
      outputs: [
        port("env", "cv")
      ],
      width: 244,
      body: 132,
      params: {
        a: 0.12,
        d: 0.35,
        s: 0.55,
        r: 0.45
      }
    },
    filter: {
      title: "Filter",
      category: "shaper",
      blurb: "Cuts the highs, the lows",
      icon: "M2 9h9c4 0 5 2 6 5s2 5 5 5",
      inputs: [
        port("in", "audio"),
        port("cutoff", "cv"),
        port("fm", "cv")
      ],
      outputs: [
        port("out", "audio")
      ],
      width: 236,
      body: 156,
      params: {
        mode: 0,
        cutoff: 0.55,
        res: 0.4,
        mod: 0.6
      }
    },
    vca: {
      title: "VCA",
      category: "shaper",
      blurb: "Lets sound through as a voltage says",
      icon: "M5 4v16l14-8z M12 3v5.5",
      inputs: [
        port("in", "audio"),
        port("cv", "cv")
      ],
      outputs: [
        port("out", "audio")
      ],
      width: 212,
      body: 120,
      params: {
        gain: 0.8,
        curve: 0
      }
    },
    glide: {
      title: "Glide",
      category: "shaper",
      blurb: "Slides from note to note",
      icon: "M3 17h5c4 0 4-10 8-10h5",
      inputs: [
        port("in", "cv")
      ],
      outputs: [
        port("out", "cv")
      ],
      width: 200,
      body: 112,
      params: {
        time: 0.3
      }
    },
    mixer: {
      title: "Mixer",
      category: "effect",
      blurb: "Four into one",
      icon: "M6 4v16 M12 4v16 M18 4v16 M4 9h4 M10 15h4 M16 7h4",
      inputs: [
        port("ch 1", "audio"),
        port("ch 2", "audio"),
        port("ch 3", "audio"),
        port("ch 4", "audio")
      ],
      outputs: [
        port("mix", "audio")
      ],
      width: 220,
      body: 112,
      params: {
        l0: 0.8,
        l1: 0.6,
        l2: 0.6,
        l3: 0.6
      }
    },
    delay: {
      title: "Delay",
      category: "effect",
      blurb: "Echoes, fading, in time",
      icon: "M4 6v12 M9 8v8 M14 10v4 M19 11v2",
      inputs: [
        port("in", "audio")
      ],
      outputs: [
        port("out", "audio")
      ],
      width: 236,
      body: 154,
      params: {
        time: 0.4,
        feedback: 0.45,
        mix: 0.3,
        sync: 1
      }
    },
    reverb: {
      title: "Reverb",
      category: "effect",
      blurb: "A plate, in stereo",
      icon: "M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M7.8 7.8a6 6 0 0 0 0 8.4 M16.2 7.8a6 6 0 0 1 0 8.4 M4.9 4.9a10 10 0 0 0 0 14.2 M19.1 4.9a10 10 0 0 1 0 14.2",
      inputs: [
        port("in", "audio")
      ],
      outputs: [
        port("left", "audio"),
        port("right", "audio")
      ],
      width: 236,
      body: 116,
      params: {
        size: 0.6,
        damp: 0.4,
        mix: 0.3
      }
    },
    output: {
      title: "Output",
      category: "output",
      blurb: "Where it all ends up",
      icon: "M4 9h4l5-4v14l-5-4H4z M17 8a5 5 0 0 1 0 8 M20 5a9 9 0 0 1 0 14",
      inputs: [
        port("left", "audio"),
        port("right", "audio")
      ],
      outputs: [],
      width: 224,
      body: 132,
      params: {
        volume: 0.7
      }
    }
  };
  var kind = (k) => KINDS[k];
  var HEADER = 36;
  var ROW = 24;
  var ROWS_PAD = 6;
  var BODY_PAD = 12;
  function cardHeight(k) {
    const d = kind(k);
    const rows = Math.max(d.inputs.length, d.outputs.length);
    return HEADER + (rows ? rows * ROW + ROWS_PAD * 2 : 0) + d.body + BODY_PAD;
  }

  // src/graph/NodeCard.tsx
  var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
  var import_react4 = __toESM(require_react(), 1);
  var import_bevy_react4 = __toESM(require_bevy_react(), 1);

  // src/bodies/drums.tsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);

  // src/theme.ts
  var REM = 16;
  var r = (px) => `${+(px / REM).toFixed(4)}rem`;
  var C = {
    text: "#e6e9f2",
    dim: "#8d94a8",
    faint: "#596078",
    card: "#151a26",
    cardDeep: "#0d1018",
    edge: "#262d40",
    edgeHi: "#3a4360",
    glass: "rgba(18, 22, 34, 0.62)",
    glassEdge: "rgba(255, 255, 255, 0.07)"
  };
  var SIGNAL = {
    audio: "#2ee6c5",
    cv: "#ffb547",
    gate: "#ff5fa2"
  };
  var FONT_MONO = "Mono";
  var glass = {
    backgroundColor: C.glass,
    border: 1,
    borderColor: C.glassEdge,
    borderRadius: 14,
    backdropFilter: [
      {
        name: "blur",
        params: {
          radius: 16
        }
      },
      {
        name: "saturate",
        params: {
          amount: 1.4
        }
      }
    ],
    // The graph under a panel never sees its presses.
    focusPolicy: "block"
  };
  function alpha(hex, a) {
    const byte = Math.round(Math.max(0, Math.min(1, a)) * 255);
    return hex + byte.toString(16).padStart(2, "0");
  }

  // src/widgets.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
  var import_react = __toESM(require_react(), 1);
  var import_bevy_react2 = __toESM(require_bevy_react(), 1);
  var LiveContext = /* @__PURE__ */ (0, import_react.createContext)(null);
  var useLive = () => (0, import_react.useContext)(LiveContext);
  var ZoomContext = /* @__PURE__ */ (0, import_react.createContext)(1);
  var STEPS = 16;
  var clamp01 = (v) => Math.min(1, Math.max(0, v));
  function stepLight(steps, level, dim = 0.16, per = 1) {
    const input = [];
    const output = [];
    for (let j = 0; j < STEPS * per; j++) {
      const on2 = dim + (1 - dim) * level(j);
      const at = j / per;
      input.push(at, at + 0.03 / per, at + 0.92 / per);
      output.push(dim, on2, dim + (on2 - dim) * 0.3);
    }
    input.push(STEPS);
    output.push(dim);
    return (0, import_bevy_react2.interpolate)(steps, input, output);
  }
  function rand(seed, i) {
    const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function arc(cx, cy, rad, a0, a1) {
    const at = (a) => {
      const t = a * Math.PI / 180;
      return `${(cx + rad * Math.sin(t)).toFixed(2)} ${(cy - rad * Math.cos(t)).toFixed(2)}`;
    };
    return `M ${at(a0)} A ${rad} ${rad} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${at(a1)}`;
  }
  var label = {
    fontSize: r(9),
    color: C.dim,
    letterSpacing: r(0.6)
  };
  function Knob({ name, value, onChange, color, size = 38, show }) {
    const drag = (0, import_react.useRef)(null);
    const angle = -135 + 270 * value;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("node", {
      style: {
        flexDirection: "column",
        alignItems: "center",
        gap: r(3)
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("node", {
          onPointerDown: (e) => {
            drag.current = {
              y: e.clientY,
              v: value
            };
          },
          onPointerMove: (e) => {
            const d = drag.current;
            if (d) onChange(clamp01(d.v + (d.y - e.clientY) / (e.shiftKey ? 700 : 170)));
          },
          onPointerUp: () => {
            drag.current = null;
          },
          style: {
            width: r(size),
            height: r(size),
            cursor: "nsResize"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
              viewBox: "0 0 40 40",
              style: {
                positionType: "absolute",
                width: "100%",
                height: "100%"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
                  d: arc(20, 20, 17, -135, 135),
                  stroke: C.edge,
                  strokeWidth: 3,
                  fill: "none",
                  strokeLinecap: "round"
                }),
                value > 4e-3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
                  d: arc(20, 20, 17, -135, angle),
                  stroke: color,
                  strokeWidth: 3,
                  fill: "none",
                  strokeLinecap: "round"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
              style: {
                positionType: "absolute",
                left: "21%",
                top: "21%",
                width: "58%",
                height: "58%",
                borderRadius: "50%",
                border: r(1),
                borderColor: C.edgeHi,
                backgroundGradient: {
                  type: "radial",
                  position: "topLeft",
                  stops: [
                    {
                      color: "#3a4360"
                    },
                    {
                      color: "#1a1f2e"
                    }
                  ]
                },
                boxShadow: {
                  color: "rgba(0,0,0,0.5)",
                  yOffset: r(2),
                  blurRadius: r(4)
                },
                transform: {
                  rotate: angle
                }
              },
              hoverStyle: {
                borderColor: color
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
                style: {
                  positionType: "absolute",
                  left: "50%",
                  top: r(2),
                  width: r(2),
                  height: "36%",
                  margin: {
                    left: r(-1)
                  },
                  borderRadius: r(1),
                  backgroundColor: color
                }
              })
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
          style: label,
          children: name
        }),
        show && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
          style: {
            fontSize: r(9),
            color: C.text,
            fontFamily: FONT_MONO
          },
          children: show(value)
        })
      ]
    });
  }
  function Tabs({ options, value, onChange, color }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
      style: {
        height: r(22),
        padding: r(2),
        borderRadius: r(7),
        backgroundColor: C.cardDeep,
        border: r(1),
        borderColor: C.edge
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("node", {
        style: {
          flexGrow: 1,
          flexDirection: "row"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
            style: {
              positionType: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: `${100 / options.length}%`,
              borderRadius: r(5),
              backgroundColor: alpha(color, 0.22),
              border: r(1),
              borderColor: alpha(color, 0.55),
              transform: {
                translateX: `${value * 100}%`
              },
              transition: {
                transform: {
                  stiffness: 380,
                  damping: 28
                }
              }
            }
          }),
          options.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
            onClick: () => onChange(i),
            style: {
              flexGrow: 1,
              flexBasis: 0,
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
              style: {
                fontSize: r(9),
                fontWeight: "semibold",
                letterSpacing: r(0.4),
                color: i === value ? C.text : C.faint
              },
              children: o
            })
          }, o))
        ]
      })
    });
  }
  function Scope({ wave, cycles, periodMs, color, width, height = 44 }) {
    const { playing } = useLive();
    const zoom = (0, import_react.useContext)(ZoomContext);
    const t = (0, import_bevy_react2.useSharedValue)(0);
    (0, import_react.useEffect)(() => {
      if (!playing) {
        (0, import_bevy_react2.cancelAnimation)(t);
        return;
      }
      t.value = 0;
      t.value = (0, import_bevy_react2.withRepeat)((0, import_bevy_react2.withTiming)(1, {
        duration: periodMs
      }));
    }, [
      t,
      playing,
      periodMs
    ]);
    const period = width / cycles;
    const drawn = width + period;
    const samples = Math.ceil((cycles + 1) * 48);
    const mid = height / 2;
    let d = "";
    for (let i = 0; i <= samples; i++) {
      const x = i / samples * drawn;
      const y = mid - wave((x / period % 1 + 1) % 1) * (mid - 5);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("node", {
      style: {
        width: r(width),
        height: r(height),
        overflowX: "clip",
        overflowY: "clip",
        borderRadius: r(6),
        backgroundColor: C.cardDeep,
        border: r(1),
        borderColor: C.edge
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: r(1),
            backgroundColor: alpha("#ffffff", 0.05)
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
          viewBox: `0 0 ${drawn} ${height}`,
          style: {
            positionType: "absolute",
            left: 0,
            top: 0,
            width: r(drawn),
            height: r(height),
            transform: {
              translateX: {
                animated: (0, import_bevy_react2.interpolate)(t, [
                  0,
                  1
                ], [
                  0,
                  -period * zoom
                ])
              }
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
              d,
              fill: "none",
              stroke: alpha(color, 0.25),
              strokeWidth: 5,
              strokeLinejoin: "round"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
              d,
              fill: "none",
              stroke: color,
              strokeWidth: 1.6,
              strokeLinejoin: "round"
            })
          ]
        })
      ]
    });
  }
  function Meter({ seed, gain, color, count = 10, height = 64, width = 8 }) {
    const { steps } = useLive();
    const levels = Array.from({
      length: STEPS
    }, (_, j) => gain * (0.35 + 0.65 * rand(seed, j)));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
      style: {
        height: r(height),
        width: r(width),
        flexDirection: "columnReverse",
        gap: r(2)
      },
      children: Array.from({
        length: count
      }, (_, k) => {
        const at = (k + 0.5) / count;
        const hue = k >= count - 2 ? "#ff5f7a" : k >= count - 4 ? "#ffd166" : color;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
          style: {
            flexGrow: 1,
            borderRadius: r(1.5),
            backgroundColor: hue,
            opacity: {
              animated: stepLight(steps, (j) => levels[j] >= at ? 1 : 0, 0.1)
            }
          }
        }, k);
      })
    });
  }
  function Led({ level, color, size = 7 }) {
    const { steps } = useLive();
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
      style: {
        width: r(size),
        height: r(size),
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: {
          color: alpha(color, 0.6),
          blurRadius: r(6)
        },
        opacity: {
          animated: stepLight(steps, level, 0.14)
        }
      }
    });
  }

  // src/bodies/kit.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
  var Col = ({ children, gap = 8 }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
    style: {
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "center",
      gap: r(gap)
    },
    children
  });
  var Row = ({ children, gap = 10 }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
    style: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: r(gap)
    },
    children
  });
  var pct = (v) => `${Math.round(v * 100)}`;

  // src/bodies/drums.tsx
  var LANES = [
    "A",
    "B",
    "C",
    "D"
  ];
  var sixteenth = (i) => (j) => j % 16 === i ? 1 : 0;
  function Beat({ node, set, color, steps }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Col, {
      gap: 5,
      children: [
        LANES.map((name, lane2) => {
          const mask = node.params[`k${lane2}`];
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Lane, {
            name,
            children: (i) => {
              const on2 = (mask >> i & 1) === 1;
              return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Pad, {
                on: on2,
                downbeat: i % 4 === 0,
                color,
                onClick: () => set(`k${lane2}`, mask ^ 1 << i),
                glow: on2 ? stepLight(steps, sixteenth(i), 0, 2) : null
              }, i);
            }
          }, name);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Lane, {
          name: "",
          children: (i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
            style: {
              flexGrow: 1,
              flexBasis: 0,
              height: r(3),
              borderRadius: r(1.5),
              backgroundColor: i % 4 ? C.dim : "#ffffff",
              opacity: {
                animated: stepLight(steps, sixteenth(i), 0.15, 2)
              }
            }
          }, i)
        })
      ]
    });
  }
  function Lane({ name, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: r(6)
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
          style: {
            width: r(9),
            fontSize: r(9),
            fontWeight: "semibold",
            color: C.dim
          },
          children: name
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            flexGrow: 1,
            flexDirection: "row",
            gap: r(6)
          },
          children: [
            0,
            1,
            2,
            3
          ].map((beat) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
            style: {
              flexGrow: 1,
              flexBasis: 0,
              flexDirection: "row",
              alignItems: "center",
              gap: r(2.5)
            },
            children: [
              0,
              1,
              2,
              3
            ].map((k) => children(beat * 4 + k))
          }, beat))
        })
      ]
    });
  }
  function Pad({ on: on2, downbeat, color, onClick, glow }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
      onClick,
      style: {
        flexGrow: 1,
        flexBasis: 0,
        height: r(17),
        borderRadius: r(3),
        backgroundColor: on2 ? alpha(color, 0.7) : downbeat ? "#171c2a" : C.cardDeep,
        border: r(1),
        borderColor: on2 ? color : C.edge
      },
      hoverStyle: {
        borderColor: C.text
      },
      children: glow && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
        style: {
          flexGrow: 1,
          borderRadius: r(2),
          backgroundColor: "#ffffff",
          opacity: {
            animated: glow
          }
        }
      })
    });
  }
  var VOICES = [
    "KICK",
    "SNARE",
    "CLAP",
    "HAT"
  ];
  var DECAYS = [
    (d) => 0.08 + d * d * 0.7,
    (d) => 0.05 + d * d * 0.3,
    (d) => 0.05 + d * d * 0.4,
    (d) => 0.012 + d * d * 0.35
  ];
  var PITCH = [
    (v) => `${Math.round(40 * 2 ** (v * 1.25))}`,
    (v) => `${Math.round(160 * 2 ** v)}`,
    (v) => `${Math.round(900 * 2 ** (v * 1.5))}`,
    (v) => `${(9 * 2 ** (v - 0.5)).toFixed(1)}k`
  ];
  function Drum({ node, set, color }) {
    const { voice, tune: tune2, decay, level } = node.params;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Hit, {
          voice,
          decay,
          level
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Tabs, {
          options: VOICES,
          value: voice,
          onChange: (i) => set("voice", i),
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(Row, {
          gap: 16,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Knob, {
              name: "TUNE",
              value: tune2,
              onChange: (v) => set("tune", v),
              color,
              size: 32,
              show: PITCH[voice]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Knob, {
              name: "DECAY",
              value: decay,
              onChange: (v) => set("decay", v),
              color,
              size: 32,
              show: (v) => `${Math.round(DECAYS[voice](v) * 1e3)}ms`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Knob, {
              name: "LEVEL",
              value: level,
              onChange: (v) => set("level", v),
              color,
              size: 32,
              show: pct
            })
          ]
        })
      ]
    });
  }
  function Hit({ voice, decay, level }) {
    const W2 = 212;
    const H2 = 40;
    const N = 240;
    const tau = DECAYS[voice](decay);
    const env = (t) => {
      if (voice !== 2) return Math.exp(-t / tau);
      const slaps = [
        0,
        0.011,
        0.022
      ].map((a) => t >= a ? Math.exp(-(t - a) / 45e-4) : 0);
      const tail = t >= 0.024 ? 0.7 * Math.exp(-(t - 0.024) / tau) : 0;
      return Math.max(tail, ...slaps);
    };
    let line = "";
    for (let i = 0; i <= N; i++) {
      const t = i / N * 0.6;
      const noise = rand(13 + voice, i) * 2 - 1;
      const v = [
        Math.sin(Math.PI * 2 * 7 * (1 - Math.exp(-t * 3))),
        0.5 * Math.sin(Math.PI * 2 * 24 * t) + 0.6 * noise,
        noise,
        noise
      ][voice];
      const y = H2 / 2 - Math.max(-1, Math.min(1, v)) * env(t) * (H2 / 2 - 4) * (0.4 + 0.6 * level);
      line += `${i ? "L" : "M"}${(i / N * W2).toFixed(1)} ${y.toFixed(1)}`;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
      style: {
        height: r(H2),
        borderRadius: r(6),
        backgroundColor: C.cardDeep,
        border: r(1),
        borderColor: C.edge
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", {
        viewBox: `0 0 ${W2} ${H2}`,
        style: {
          width: "100%",
          height: "100%"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", {
          d: line,
          fill: "none",
          stroke: SIGNAL.audio,
          strokeWidth: 1.2,
          strokeLinejoin: "round"
        })
      })
    });
  }

  // src/bodies/effects.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
  var import_react2 = __toESM(require_react(), 1);
  var import_bevy_react3 = __toESM(require_bevy_react(), 1);
  function Mixer({ node, set, color }) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Row, {
      gap: 12,
      children: [
        0,
        1,
        2,
        3
      ].map((i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
        style: {
          flexDirection: "column",
          alignItems: "center",
          gap: r(5)
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
            style: {
              flexDirection: "row",
              gap: r(6),
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Fader, {
                value: node.params[`l${i}`],
                onChange: (v) => set(`l${i}`, v),
                color
              }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Meter, {
                seed: 11 + i,
                gain: node.params[`l${i}`],
                color: SIGNAL.audio,
                height: 68,
                width: 6
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
            style: {
              fontSize: r(9),
              color: C.dim
            },
            children: `CH ${i + 1}`
          })
        ]
      }, i))
    });
  }
  function Fader({ value, onChange, color }) {
    const drag = (0, import_react2.useRef)(null);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
      onPointerDown: (e) => {
        drag.current = {
          y: e.clientY,
          v: value
        };
      },
      onPointerMove: (e) => {
        const d = drag.current;
        if (d) onChange(clamp01(d.v + (d.y - e.clientY) / 100));
      },
      onPointerUp: () => {
        drag.current = null;
      },
      style: {
        width: r(22),
        height: r(68),
        flexDirection: "column",
        alignItems: "center",
        cursor: "nsResize"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
          style: {
            width: r(4),
            height: "100%",
            borderRadius: r(2),
            backgroundColor: C.cardDeep
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
          style: {
            positionType: "absolute",
            bottom: 0,
            width: r(4),
            height: `${value * 100}%`,
            borderRadius: r(2),
            backgroundColor: color
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
          style: {
            positionType: "absolute",
            bottom: `${value * 100}%`,
            margin: {
              bottom: r(-5)
            },
            width: r(20),
            height: r(10),
            borderRadius: r(3),
            border: r(1),
            borderColor: C.edgeHi,
            backgroundGradient: {
              type: "linear",
              angle: 180,
              stops: [
                {
                  color: "#3a4360"
                },
                {
                  color: "#202638"
                }
              ]
            }
          },
          hoverStyle: {
            borderColor: color
          }
        })
      ]
    });
  }
  var NOTES = [
    "1/16",
    "1/8",
    "1/8.",
    "1/4",
    "1/4.",
    "1/2"
  ];
  function Delay({ node, set, color, steps }) {
    const { time, feedback, mix, sync } = node.params;
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
          style: {
            height: r(38),
            flexDirection: "row",
            alignItems: "flexEnd",
            gap: r(5),
            padding: {
              left: r(6),
              right: r(6),
              bottom: r(5)
            },
            borderRadius: r(6),
            backgroundColor: C.cardDeep,
            border: r(1),
            borderColor: C.edge
          },
          children: Array.from({
            length: 12
          }, (_, k) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
            style: {
              flexGrow: 1,
              height: `${Math.max(6, 90 * feedback ** (k * (0.4 + time)))}%`,
              borderRadius: r(2),
              backgroundColor: k ? SIGNAL.audio : "#ffffff",
              opacity: {
                animated: stepLight(steps, (j) => (j - k + STEPS) % 4 === 0 ? 1 : 0, 0.18)
              }
            }
          }, k))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Tabs, {
          options: [
            "FREE",
            "SYNC"
          ],
          value: sync,
          onChange: (i) => set("sync", i),
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Row, {
          gap: 14,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Knob, {
              name: "TIME",
              value: time,
              onChange: (v) => set("time", v),
              color,
              size: 32,
              show: (v) => sync ? NOTES[Math.round(v * 5)] : `${Math.round(40 + v * 960)}ms`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Knob, {
              name: "FDBK",
              value: feedback,
              onChange: (v) => set("feedback", v),
              color,
              size: 32,
              show: pct
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Knob, {
              name: "MIX",
              value: mix,
              onChange: (v) => set("mix", v),
              color,
              size: 32,
              show: pct
            })
          ]
        })
      ]
    });
  }
  var TAIL = 20;
  function Reverb({ node, set, color, steps }) {
    const { size, damp, mix } = node.params;
    const wash = (k) => {
      const input = [];
      const output = [];
      const late = k / TAIL * 1.6;
      const peak = Math.exp(-k / (TAIL * (0.12 + size * 0.7))) * (1 - damp * 0.5);
      for (let j = 0; j < STEPS; j += 2) {
        input.push(j + late, j + late + 0.04, j + late + 0.35);
        output.push(0.15, 0.15 + 0.85 * peak, 0.15);
      }
      return (0, import_bevy_react3.interpolate)(steps, input, output);
    };
    const side = (top) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
      style: {
        height: "50%",
        flexDirection: "row",
        alignItems: top ? "flexEnd" : "flexStart",
        gap: r(3)
      },
      children: Array.from({
        length: TAIL
      }, (_, k) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
        style: {
          flexGrow: 1,
          height: `${Math.max(8, 95 * Math.exp(-k / (TAIL * (0.12 + size * 0.7))) * (0.55 + 0.45 * rand(top ? 31 : 37, k)))}%`,
          borderRadius: r(1.5),
          backgroundColor: alpha(SIGNAL.audio, 1 - damp * 0.45),
          opacity: {
            animated: wash(k)
          }
        }
      }, k))
    });
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
          style: {
            height: r(40),
            flexDirection: "column",
            padding: {
              horizontal: r(6),
              vertical: r(4)
            },
            borderRadius: r(6),
            backgroundColor: C.cardDeep,
            border: r(1),
            borderColor: C.edge
          },
          children: [
            side(true),
            side(false)
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Row, {
          gap: 14,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Knob, {
              name: "SIZE",
              value: size,
              onChange: (v) => set("size", v),
              color,
              size: 32,
              show: pct
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Knob, {
              name: "DAMP",
              value: damp,
              onChange: (v) => set("damp", v),
              color,
              size: 32,
              show: pct
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Knob, {
              name: "MIX",
              value: mix,
              onChange: (v) => set("mix", v),
              color,
              size: 32,
              show: pct
            })
          ]
        })
      ]
    });
  }
  function Output({ node, set, color, steps }) {
    const { volume } = node.params;
    const input = [];
    const output = [];
    for (let j = 0; j < STEPS; j += 2) {
      input.push(j, j + 0.05, j + 1.6);
      output.push(1, 1 + 0.12 * volume, 1);
    }
    const kick = (0, import_bevy_react3.interpolate)(steps, input, output);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Row, {
      gap: 14,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
          style: {
            width: r(68),
            height: r(68),
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
            border: r(2),
            borderColor: C.edgeHi,
            backgroundGradient: {
              type: "radial",
              stops: [
                {
                  color: "#1e2434"
                },
                {
                  color: "#0b0e15"
                }
              ]
            }
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
            style: {
              width: r(46),
              height: r(46),
              borderRadius: "50%",
              alignItems: "center",
              justifyContent: "center",
              backgroundGradient: {
                type: "radial",
                position: "topLeft",
                stops: [
                  {
                    color: "#4a5374"
                  },
                  {
                    color: "#161b28"
                  }
                ]
              },
              transform: {
                scale: {
                  animated: kick
                }
              }
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
              style: {
                width: r(14),
                height: r(14),
                borderRadius: "50%",
                backgroundColor: alpha(color, 0.8)
              }
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Row, {
          gap: 4,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Meter, {
              seed: 21,
              gain: volume,
              color: SIGNAL.audio,
              height: 68
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Meter, {
              seed: 22,
              gain: volume * 0.92,
              color: SIGNAL.audio,
              height: 68
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Knob, {
          name: "VOLUME",
          value: volume,
          onChange: (v) => set("volume", v),
          color,
          show: pct
        })
      ]
    });
  }

  // src/bodies/rhythm.tsx
  var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
  var import_react3 = __toESM(require_react(), 1);
  function Clock({ node, set, color }) {
    const { bpm } = useLive();
    const { div, swing } = node.params;
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Row, {
      gap: 12,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Col, {
          gap: 10,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Row, {
              gap: 12,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    alignItems: "flexEnd",
                    gap: r(5)
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
                      style: {
                        fontSize: r(26),
                        fontFamily: FONT_MONO,
                        color: C.text
                      },
                      children: bpm
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
                      style: {
                        fontSize: r(9),
                        color: C.dim,
                        margin: {
                          bottom: r(5)
                        }
                      },
                      children: "BPM"
                    })
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Row, {
                  gap: 6,
                  children: [
                    0,
                    1,
                    2,
                    3
                  ].map((k) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Led, {
                    size: 9,
                    color: k ? color : "#ffffff",
                    level: (j) => j % 8 === k * 2 ? 1 : 0
                  }, k))
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Tabs, {
              options: [
                "1/4",
                "1/8",
                "1/16"
              ],
              value: div,
              onChange: (i) => set("div", i),
              color
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Knob, {
          name: "SWING",
          value: swing,
          onChange: (v) => set("swing", v),
          color,
          size: 30,
          // Where the late pulse lands between its pair, as drum machines say.
          show: (v) => `${Math.round(50 + v * 100 / 6)}%`
        })
      ]
    });
  }
  function Sequencer({ node, set, color, steps }) {
    const mask = node.params.mask;
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
      style: {
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: r(6)
      },
      children: Array.from({
        length: 8
      }, (_, i) => {
        const on2 = (mask >> i & 1) === 1;
        const here = (j) => j % 8 === i ? 1 : 0;
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
          style: {
            flexGrow: 1,
            flexBasis: 0,
            flexDirection: "column",
            alignItems: "center",
            gap: r(7)
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Bar, {
              value: node.params[`p${i}`],
              onChange: (v) => set(`p${i}`, v),
              color: on2 ? color : C.faint,
              glow: stepLight(steps, (j) => on2 ? here(j) : 0, 0)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
              onClick: () => set("mask", mask ^ 1 << i),
              style: {
                width: r(16),
                height: r(9),
                borderRadius: r(3),
                backgroundColor: on2 ? alpha(color, 0.35) : C.cardDeep,
                border: r(1),
                borderColor: on2 ? alpha(color, 0.7) : C.edge
              },
              hoverStyle: {
                borderColor: C.text
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
                style: {
                  flexGrow: 1,
                  borderRadius: r(2),
                  backgroundColor: on2 ? "#ffffff" : C.dim,
                  opacity: {
                    animated: stepLight(steps, here, 0)
                  }
                }
              })
            })
          ]
        }, i);
      })
    });
  }
  function Bar({ value, onChange, color, glow }) {
    const drag = (0, import_react3.useRef)(null);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
      onPointerDown: (e) => {
        drag.current = {
          y: e.clientY,
          v: value
        };
      },
      onPointerMove: (e) => {
        const d = drag.current;
        if (d) onChange(clamp01(d.v + (d.y - e.clientY) / 90));
      },
      onPointerUp: () => {
        drag.current = null;
      },
      style: {
        width: "100%",
        height: r(58),
        flexDirection: "column",
        justifyContent: "flexEnd",
        borderRadius: r(4),
        backgroundColor: C.cardDeep,
        border: r(1),
        borderColor: C.edge,
        cursor: "nsResize"
      },
      hoverStyle: {
        borderColor: C.edgeHi
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
          style: {
            height: `${Math.max(6, value * 100)}%`,
            borderRadius: r(3),
            backgroundGradient: {
              type: "linear",
              angle: 0,
              stops: [
                {
                  color: alpha(color, 0.25)
                },
                {
                  color
                }
              ]
            }
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: r(3),
            backgroundColor: alpha("#ffffff", 0.35),
            opacity: {
              animated: glow
            }
          }
        })
      ]
    });
  }

  // src/bodies/shapers.tsx
  var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
  function Plot({ w, h, line, color, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
      style: {
        height: r(h),
        borderRadius: r(6),
        backgroundColor: C.cardDeep,
        border: r(1),
        borderColor: C.edge
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", {
          viewBox: `0 0 ${w} ${h}`,
          style: {
            width: "100%",
            height: "100%"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", {
              d: `${line} L${w} ${h} L0 ${h} Z`,
              fill: alpha(color, 0.13)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", {
              d: line,
              fill: "none",
              stroke: color,
              strokeWidth: 1.8,
              strokeLinejoin: "round"
            })
          ]
        }),
        children
      ]
    });
  }
  function trace(w, h, f, n = 64) {
    let d = "";
    for (let i = 0; i <= n; i++) {
      const x = i / n;
      const y = h - 4 - Math.min(1.2, f(x)) * (h - 10);
      d += `${i ? "L" : "M"}${(x * w).toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }
  function Envelope({ node, set, color, steps }) {
    const { a, d, s, r: rel } = node.params;
    const W2 = 220;
    const H2 = 50;
    const top = 5;
    const floor = H2 - 3;
    const quarter = W2 / 4;
    const x1 = 2 + a * quarter;
    const x2 = x1 + 6 + d * quarter;
    const ys = floor - s * (floor - top);
    const x3 = x2 + quarter * 0.8;
    const x4 = Math.min(W2 - 2, x3 + 6 + rel * quarter);
    const line = `M2 ${floor} L${x1} ${top} Q${x1 + (x2 - x1) * 0.3} ${ys} ${x2} ${ys} L${x3} ${ys} Q${x3 + (x4 - x3) * 0.3} ${floor} ${x4} ${floor}`;
    const knobs = [
      [
        "a",
        "ATK"
      ],
      [
        "d",
        "DEC"
      ],
      [
        "s",
        "SUS"
      ],
      [
        "r",
        "REL"
      ]
    ];
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
          style: {
            height: r(H2),
            borderRadius: r(6),
            backgroundColor: C.cardDeep,
            border: r(1),
            borderColor: C.edge
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", {
              viewBox: `0 0 ${W2} ${H2}`,
              style: {
                width: "100%",
                height: "100%"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", {
                  d: `${line} L${x4} ${H2} L2 ${H2} Z`,
                  fill: alpha(SIGNAL.cv, 0.14)
                }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", {
                  d: line,
                  fill: "none",
                  stroke: SIGNAL.cv,
                  strokeWidth: 1.8,
                  strokeLinejoin: "round"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
              style: {
                positionType: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: r(x1 + 4),
                borderRadius: r(5),
                backgroundColor: alpha(SIGNAL.cv, 0.22),
                opacity: {
                  animated: stepLight(steps, () => 1, 0)
                }
              }
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Row, {
          gap: 8,
          children: knobs.map(([key, name]) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Knob, {
            name,
            value: node.params[key],
            onChange: (v) => set(key, v),
            color,
            size: 30
          }, key))
        })
      ]
    });
  }
  function Filter({ node, set, color }) {
    const { mode, cutoff, res, mod } = node.params;
    const W2 = 212;
    const H2 = 50;
    const q = 0.5 * 50 ** res;
    const bump = 0.5 * Math.log10(Math.max(1, q / 0.707));
    const line = trace(W2, H2, (x) => {
      const f = Math.pow(10, (x - cutoff) * 2.2);
      const lp = 1 / Math.sqrt(1 + f ** 4);
      const hp = 1 / Math.sqrt(1 + f ** -4);
      const peak = bump * Math.exp(-(((x - cutoff) / 0.05) ** 2));
      return [
        lp,
        Math.min(lp, hp) * 1.6,
        hp
      ][mode] + peak;
    });
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Plot, {
          w: W2,
          h: H2,
          line,
          color: SIGNAL.audio,
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
            style: {
              positionType: "absolute",
              left: `${cutoff * 100}%`,
              top: r(4),
              bottom: r(4),
              width: r(1),
              backgroundColor: alpha(color, 0.5)
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Tabs, {
          options: [
            "LOW",
            "BAND",
            "HIGH"
          ],
          value: mode,
          onChange: (i) => set("mode", i),
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Row, {
          gap: 18,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Knob, {
              name: "CUTOFF",
              value: cutoff,
              onChange: (v) => set("cutoff", v),
              color,
              show: (v) => `${Math.round(20 * 1e3 ** v)}`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Knob, {
              name: "RES",
              value: res,
              onChange: (v) => set("res", v),
              color,
              show: pct
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Knob, {
              name: "MOD",
              value: mod,
              onChange: (v) => set("mod", v),
              color,
              // How far the `cutoff` input opens it, octaves.
              show: (v) => `${(v * 6).toFixed(1)}`
            })
          ]
        })
      ]
    });
  }
  function Vca({ node, set, color }) {
    const { gain, curve } = node.params;
    const line = trace(188, 44, (x) => (curve ? x ** 3 : x) * gain);
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Plot, {
          w: 188,
          h: 44,
          line,
          color: SIGNAL.audio
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Row, {
          gap: 16,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
              style: {
                width: r(96),
                flexDirection: "column"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Tabs, {
                options: [
                  "LIN",
                  "EXP"
                ],
                value: curve,
                onChange: (i) => set("curve", i),
                color
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Knob, {
              name: "GAIN",
              value: gain,
              onChange: (v) => set("gain", v),
              color,
              size: 34,
              show: pct
            })
          ]
        })
      ]
    });
  }
  var slew = (time) => 1e-3 + time * time * 0.5;
  function Glide({ node, set, color }) {
    const { time } = node.params;
    const W2 = 176;
    const H2 = 40;
    const notes = [
      0.2,
      0.8,
      0.45,
      0.95,
      0.3
    ];
    const at = (x) => notes[Math.min(4, Math.floor(x * 5))];
    let level = notes[0];
    const smooth = trace(W2, H2, (x) => {
      level += (at(x) - level) * (1 - Math.exp(-1 / 64 / slew(time)));
      return level;
    });
    const stepped = trace(W2, H2, at, 320);
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Plot, {
          w: W2,
          h: H2,
          line: smooth,
          color: SIGNAL.cv,
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", {
            viewBox: `0 0 ${W2} ${H2}`,
            style: {
              positionType: "absolute",
              width: "100%",
              height: "100%"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", {
              d: stepped,
              fill: "none",
              stroke: alpha(C.text, 0.25),
              strokeWidth: 1
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Row, {
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Knob, {
            name: "TIME",
            value: time,
            onChange: (v) => set("time", v),
            color,
            size: 34,
            show: (v) => `${Math.round(slew(v) * 1e3)}ms`
          })
        })
      ]
    });
  }

  // src/bodies/sources.tsx
  var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
  var TAU = Math.PI * 2;
  var WAVES = [
    (p) => Math.sin(p * TAU),
    (p) => 2 * p - 1,
    (p) => p < 0.5 ? 0.8 : -0.8,
    (p) => 1 - 4 * Math.abs(p - 0.5)
  ];
  function Oscillator({ node, set, color }) {
    const { wave, tune: tune2, level, detune } = node.params;
    const semis = Math.round(tune2 * 24 - 12);
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Scope, {
          wave: WAVES[wave],
          cycles: 2 + Math.round(tune2 * 4),
          periodMs: 420 - tune2 * 200,
          color: SIGNAL.audio,
          width: 212
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Tabs, {
          options: [
            "SIN",
            "SAW",
            "SQR",
            "TRI"
          ],
          value: wave,
          onChange: (i) => set("wave", i),
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Row, {
          gap: 18,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Knob, {
              name: "TUNE",
              value: tune2,
              onChange: (v) => set("tune", v),
              color,
              show: () => `${semis > 0 ? "+" : ""}${semis}`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Knob, {
              name: "DETUNE",
              value: detune,
              onChange: (v) => set("detune", v),
              color,
              // Cents each way (`Osc::step` in `synth/voices.rs`).
              show: (v) => `${Math.round(v * v * 35)}c`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Knob, {
              name: "LEVEL",
              value: level,
              onChange: (v) => set("level", v),
              color,
              show: pct
            })
          ]
        })
      ]
    });
  }
  function Noise({ node, set, color }) {
    const { color: tint, level } = node.params;
    const points = [
      48,
      18,
      8
    ][tint];
    const noise = (p) => {
      const at = p * points;
      const i = Math.floor(at);
      const f = at - i;
      const v = (k) => rand(7 + tint, k % points) * 2 - 1;
      return (v(i) + (v(i + 1) - v(i)) * f * f * (3 - 2 * f)) * (0.35 + 0.6 * level);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Scope, {
          wave: noise,
          cycles: 1,
          periodMs: 900,
          color: SIGNAL.audio,
          width: 188,
          height: 40
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Tabs, {
          options: [
            "WHITE",
            "PINK",
            "BROWN"
          ],
          value: tint,
          onChange: (i) => set("color", i),
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Row, {
          gap: 18,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Knob, {
              name: "LEVEL",
              value: level,
              onChange: (v) => set("level", v),
              color,
              show: pct
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Meter, {
              seed: 3 + tint,
              gain: level,
              color: SIGNAL.audio,
              height: 52,
              count: 8
            })
          ]
        })
      ]
    });
  }
  var hz = (rate) => 0.02 * 1e3 ** rate;
  function Lfo({ node, set, color }) {
    const { shape, rate, depth } = node.params;
    const scale = 0.25 + 0.75 * depth;
    const steps = [
      0.6,
      -0.8,
      0.2,
      -0.3
    ].map((v, i) => v + rand(9, i) * 0.4 - 0.2);
    const wave = shape === 3 ? (p) => steps[Math.min(3, Math.floor(p * 4))] * scale : (p) => WAVES[[
      0,
      3,
      2
    ][shape]](p) * scale;
    const period = 1e3 / hz(rate);
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Col, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Scope, {
          wave,
          cycles: 1,
          periodMs: Math.min(9e3, Math.max(300, shape === 3 ? period * 4 : period)),
          color: SIGNAL.cv,
          width: 188
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Tabs, {
          options: [
            "SIN",
            "TRI",
            "SQR",
            "S&H"
          ],
          value: shape,
          onChange: (i) => set("shape", i),
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(Row, {
          gap: 22,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Knob, {
              name: "RATE",
              value: rate,
              onChange: (v) => set("rate", v),
              color,
              show: (v) => {
                const f = hz(v);
                return f < 1 ? f.toFixed(2) : f < 10 ? f.toFixed(1) : f.toFixed(0);
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Knob, {
              name: "DEPTH",
              value: depth,
              onChange: (v) => set("depth", v),
              color,
              show: pct
            })
          ]
        })
      ]
    });
  }

  // src/bodies/index.ts
  var BODIES = {
    clock: Clock,
    sequencer: Sequencer,
    beat: Beat,
    oscillator: Oscillator,
    noise: Noise,
    lfo: Lfo,
    drum: Drum,
    envelope: Envelope,
    filter: Filter,
    vca: Vca,
    glide: Glide,
    mixer: Mixer,
    delay: Delay,
    reverb: Reverb,
    output: Output
  };

  // src/graph/model.ts
  var socketName = (s) => `${s.node}:${s.side}${s.port}`;
  function signalOf(g, s) {
    const d = kind(g.nodes[s.node].kind);
    return (s.side === "o" ? d.outputs : d.inputs)[s.port].signal;
  }
  function canPlug(g, a, b) {
    return a.side !== b.side && a.node !== b.node && !!g.nodes[b.node] && !g.nodes[b.node].leaving && signalOf(g, a) === signalOf(g, b);
  }
  var nodeBox = (n) => ({
    x: n.x,
    y: n.y,
    w: kind(n.kind).width,
    h: cardHeight(n.kind)
  });
  function bounds(nodes) {
    if (!nodes.length) return null;
    const boxes = nodes.map(nodeBox);
    const x = Math.min(...boxes.map((b) => b.x));
    const y = Math.min(...boxes.map((b) => b.y));
    const w = Math.max(...boxes.map((b) => b.x + b.w)) - x;
    const h = Math.max(...boxes.map((b) => b.y + b.h)) - y;
    return {
      x,
      y,
      w,
      h
    };
  }
  var live = (g) => Object.values(g.nodes).filter((n) => !n.leaving);
  var EMPTY = {
    nodes: {},
    links: [],
    selected: [],
    seq: 1,
    top: 1
  };
  function reduce(g, a) {
    switch (a.type) {
      case "load":
        return {
          ...a.graph,
          seq: Math.max(a.graph.seq, g.seq),
          top: Math.max(a.graph.top, g.top)
        };
      case "links":
        return {
          ...g,
          links: [
            ...g.links,
            ...a.links
          ]
        };
      case "add": {
        const id = `n${g.seq}`;
        const node = {
          id,
          kind: a.kind,
          x: Math.round(a.x),
          y: Math.round(a.y),
          params: {
            ...KINDS[a.kind].params
          },
          z: g.top + 1,
          enter: 0
        };
        return {
          ...g,
          nodes: {
            ...g.nodes,
            [id]: node
          },
          selected: a.select ? [
            id
          ] : g.selected,
          seq: g.seq + 1,
          top: g.top + 1
        };
      }
      case "move": {
        const nodes = {
          ...g.nodes
        };
        for (const [id, p] of Object.entries(a.to)) {
          if (nodes[id]) nodes[id] = {
            ...nodes[id],
            x: p.x,
            y: p.y
          };
        }
        return {
          ...g,
          nodes
        };
      }
      case "select":
        return {
          ...g,
          selected: a.ids.filter((id) => g.nodes[id] && !g.nodes[id].leaving)
        };
      case "raise": {
        const nodes = {
          ...g.nodes
        };
        let top = g.top;
        for (const id of a.ids) {
          if (nodes[id]) nodes[id] = {
            ...nodes[id],
            z: ++top
          };
        }
        return {
          ...g,
          nodes,
          top
        };
      }
      case "delete": {
        const gone = new Set(a.ids);
        const nodes = {
          ...g.nodes
        };
        for (const id of gone) {
          if (nodes[id]) nodes[id] = {
            ...nodes[id],
            leaving: true
          };
        }
        return {
          ...g,
          nodes,
          links: g.links.filter((l) => !gone.has(l.from.node) && !gone.has(l.to.node)),
          selected: g.selected.filter((id) => !gone.has(id))
        };
      }
      case "purge": {
        if (!g.nodes[a.id]?.leaving) return g;
        const nodes = {
          ...g.nodes
        };
        delete nodes[a.id];
        return {
          ...g,
          nodes
        };
      }
      case "connect": {
        if (!canPlug(g, a.a, a.b)) return g;
        const [out, inp] = a.a.side === "o" ? [
          a.a,
          a.b
        ] : [
          a.b,
          a.a
        ];
        const from = {
          node: out.node,
          port: out.port
        };
        const to = {
          node: inp.node,
          port: inp.port
        };
        const links = g.links.filter((l) => !(l.to.node === to.node && l.to.port === to.port));
        links.push({
          id: `w${g.seq}`,
          from,
          to
        });
        return {
          ...g,
          links,
          seq: g.seq + 1
        };
      }
      case "unplug":
        return {
          ...g,
          links: g.links.filter((l) => l.id !== a.id)
        };
      case "param": {
        const n = g.nodes[a.id];
        if (!n) return g;
        const params = {
          ...n.params,
          [a.key]: a.value
        };
        return {
          ...g,
          nodes: {
            ...g.nodes,
            [a.id]: {
              ...n,
              params
            }
          }
        };
      }
      case "duplicate": {
        const copies = {};
        const nodes = {
          ...g.nodes
        };
        let seq = g.seq;
        let top = g.top;
        for (const id of g.selected) {
          const n = g.nodes[id];
          const copy = `n${seq++}`;
          copies[id] = copy;
          nodes[copy] = {
            ...n,
            id: copy,
            x: n.x + 32,
            y: n.y + 32,
            z: ++top,
            enter: 0
          };
        }
        const links = [
          ...g.links
        ];
        for (const l of g.links) {
          if (copies[l.from.node] && copies[l.to.node]) {
            links.push({
              id: `w${seq++}`,
              from: {
                node: copies[l.from.node],
                port: l.from.port
              },
              to: {
                node: copies[l.to.node],
                port: l.to.port
              }
            });
          }
        }
        return {
          ...g,
          nodes,
          links,
          selected: Object.values(copies),
          seq,
          top
        };
      }
    }
  }
  var GAP_X = 64;
  var GAP_Y = 32;
  function arrange(g) {
    const nodes = live(g);
    const depth = {};
    const walk = (id, seen) => {
      if (depth[id] !== void 0) return depth[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      const ups = g.links.filter((l) => l.to.node === id).map((l) => l.from.node);
      const d = ups.length ? Math.max(...ups.map((u) => walk(u, seen) + 1)) : 0;
      return depth[id] = d;
    };
    for (const n of nodes) walk(n.id, /* @__PURE__ */ new Set());
    const columns = [];
    for (const n of nodes) (columns[depth[n.id]] ??= []).push(n);
    const placed = {};
    let x = 0;
    for (const column of columns.filter(Boolean)) {
      const key = (n) => {
        const ups = g.links.filter((l) => l.to.node === n.id && placed[l.from.node]).map((l) => placed[l.from.node].y);
        return ups.length ? ups.reduce((s, v) => s + v, 0) / ups.length : n.y;
      };
      column.sort((a, b) => key(a) - key(b));
      const height = column.reduce((s, n) => s + cardHeight(n.kind) + GAP_Y, -GAP_Y);
      let y = -height / 2;
      for (const n of column) {
        placed[n.id] = {
          x,
          y
        };
        y += cardHeight(n.kind) + GAP_Y;
      }
      x += Math.max(...column.map((n) => kind(n.kind).width)) + GAP_X;
    }
    return placed;
  }

  // src/graph/NodeCard.tsx
  var RADIUS = 12;
  var NodeCard = /* @__PURE__ */ (0, import_react4.memo)(function NodeCard2({ node, selected, lifted, gliding, wired, plug, api }) {
    const def = kind(node.kind);
    const color = CATEGORIES[def.category].color;
    const { spin, steps } = useLive();
    const appear = (0, import_bevy_react4.useSharedValue)(0);
    (0, import_react4.useEffect)(() => {
      appear.value = (0, import_bevy_react4.withDelay)(node.enter, (0, import_bevy_react4.withSpring)(1, {
        stiffness: 240,
        damping: 16
      }));
    }, [
      appear,
      node.enter
    ]);
    (0, import_react4.useEffect)(() => {
      if (node.leaving) {
        appear.value = (0, import_bevy_react4.withTiming)(0, {
          duration: 180,
          easing: "easeIn",
          onComplete: () => api.purge(node.id)
        });
      }
    }, [
      appear,
      node.leaving,
      node.id,
      api
    ]);
    const lift = (0, import_bevy_react4.useSharedValue)(0);
    const tilt = (0, import_bevy_react4.useSharedValue)(0);
    (0, import_react4.useEffect)(() => {
      lift.value = (0, import_bevy_react4.withSpring)(lifted ? 1 : 0, {
        stiffness: 380,
        damping: 22
      });
    }, [
      lift,
      lifted
    ]);
    const lastX = (0, import_react4.useRef)(node.x);
    (0, import_react4.useEffect)(() => {
      const dx = node.x - lastX.current;
      lastX.current = node.x;
      if (!lifted || dx === 0) return;
      const lean = Math.max(-7, Math.min(7, dx * 0.35));
      tilt.value = (0, import_bevy_react4.withSequence)((0, import_bevy_react4.withTiming)(lean, {
        duration: 90,
        easing: "easeOut"
      }), (0, import_bevy_react4.withSpring)(0, {
        stiffness: 150,
        damping: 8
      }));
    }, [
      tilt,
      node.x,
      lifted
    ]);
    const ring = {
      type: "conic",
      start: {
        animated: spin
      },
      stops: [
        {
          color
        },
        {
          color: alpha(color, 0.12),
          angle: 90
        },
        {
          color: "#ffffff",
          angle: 180
        },
        {
          color: alpha(color, 0.12),
          angle: 270
        },
        {
          color,
          angle: 360
        }
      ]
    };
    const drop = {
      color: "rgba(0, 0, 0, 0.55)",
      yOffset: r(lifted ? 22 : 10),
      blurRadius: r(lifted ? 40 : 24)
    };
    const rows = Math.max(def.inputs.length, def.outputs.length);
    const Body = BODIES[node.kind];
    const set = (key, value) => api.param(node.id, key, value);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
      style: {
        positionType: "absolute",
        left: r(node.x),
        top: r(node.y),
        width: r(def.width),
        height: r(cardHeight(node.kind)),
        zIndex: node.z,
        transform: {
          scale: {
            animated: (0, import_bevy_react4.interpolate)(appear, [
              0,
              1,
              2
            ], [
              0.02,
              1,
              2
            ])
          }
        },
        transition: gliding ? {
          layout: {
            stiffness: 110,
            damping: 16
          }
        } : void 0
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
        onPointerDown: (e) => api.press(node.id, e),
        onPointerMove: (e) => api.drag(e),
        onPointerUp: (e) => api.release(e),
        style: {
          flexGrow: 1,
          flexDirection: "column",
          borderRadius: r(RADIUS),
          border: r(1.5),
          borderColor: selected ? "transparent" : C.edge,
          borderGradient: selected ? ring : void 0,
          backgroundGradient: {
            type: "linear",
            angle: 180,
            // See-through: the wires run under the cards.
            stops: [
              {
                color: alpha("#181d2b", 0.72)
              },
              {
                color: alpha("#11151f", 0.8)
              }
            ]
          },
          boxShadow: selected ? [
            {
              color: alpha(color, 0.32),
              blurRadius: r(26),
              spreadRadius: r(1)
            },
            drop
          ] : drop,
          transform: {
            scale: {
              animated: (0, import_bevy_react4.interpolate)(lift, [
                0,
                1,
                2
              ], [
                1,
                1.035,
                1.07
              ])
            },
            rotate: {
              animated: tilt
            }
          },
          cursor: lifted ? "grabbing" : "grab"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
            style: {
              positionType: "absolute",
              left: r(-1.5),
              top: r(-1.5),
              right: r(-1.5),
              bottom: r(-1.5),
              borderRadius: r(RADIUS),
              spotlight: {
                color,
                edge: 1.5,
                wash: 0.12
              }
            }
          }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
            style: {
              height: r(HEADER),
              flexDirection: "row",
              alignItems: "center",
              gap: r(8),
              padding: {
                horizontal: r(12)
              },
              borderRadius: `${r(RADIUS - 1.5)} ${r(RADIUS - 1.5)} 0 0`,
              backgroundGradient: {
                type: "linear",
                angle: 90,
                stops: [
                  {
                    color: alpha(color, 0.3)
                  },
                  {
                    color: alpha(color, 0.03)
                  }
                ]
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, {
                d: def.icon,
                color,
                size: r(16)
              }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
                style: {
                  flexGrow: 1,
                  fontSize: r(12),
                  fontWeight: "semibold",
                  letterSpacing: r(0.5),
                  color: C.text
                },
                children: def.title.toUpperCase()
              }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Led, {
                color,
                level: (j) => wired && j % 2 === 0 ? 1 : 0,
                size: 6
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
            style: {
              height: r(1),
              backgroundColor: C.edge
            }
          }),
          rows > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
            style: {
              flexDirection: "column",
              padding: {
                vertical: r(ROWS_PAD)
              }
            },
            children: Array.from({
              length: rows
            }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
              style: {
                height: r(ROW),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "spaceBetween"
              },
              children: [
                def.inputs[i],
                def.outputs[i]
              ].map((p, k) => {
                const side = k === 0 ? "i" : "o";
                return p ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Socket, {
                  at: {
                    node: node.id,
                    side,
                    port: i
                  },
                  name: p.name,
                  color: SIGNAL[p.signal],
                  wired: wired.includes(`${side}${i}`),
                  plug: plug?.[`${side}${i}`] ?? "idle",
                  api
                }, side) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {}, side);
              })
            }, i))
          }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
            style: {
              height: r(def.body),
              flexDirection: "column",
              padding: {
                horizontal: r(BODY_PAD)
              }
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Body, {
              node,
              set,
              color,
              steps
            })
          })
        ]
      })
    });
  });
  function Socket({ at, name, color, wired, plug, api }) {
    const input = at.side === "i";
    const { spin } = useLive();
    const scale = {
      idle: 1,
      open: 1.1,
      shut: 0.8,
      target: 1.6
    }[plug];
    const breath = (0, import_bevy_react4.interpolate)(spin, [
      0,
      45,
      90,
      135,
      180,
      225,
      270,
      315,
      360
    ], [
      1,
      1.3,
      1,
      1.3,
      1,
      1.3,
      1,
      1.3,
      1
    ]);
    const dim = plug === "shut" ? 0.25 : 1;
    const hit = {
      positionType: "absolute",
      left: input ? r(-12.75) : void 0,
      right: input ? void 0 : r(-12.75),
      top: r(0),
      width: r(24),
      height: r(24),
      alignItems: "center",
      justifyContent: "center",
      transform: {
        scale
      },
      transition: {
        transform: {
          stiffness: 420,
          damping: 20
        }
      },
      cursor: "crosshair"
    };
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
      style: {
        flexDirection: input ? "row" : "rowReverse",
        alignItems: "center",
        height: r(ROW),
        padding: {
          left: r(input ? 14 : 0),
          right: r(input ? 0 : 14)
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
          name: socketName(at),
          onPointerDown: (e) => api.socketDown(at, e),
          onPointerUp: (e) => api.socketUp(e),
          onPointerEnter: () => api.socketHover(at, true),
          onPointerLeave: () => api.socketHover(at, false),
          style: hit,
          hoverStyle: plug === "idle" ? {
            transform: {
              scale: 1.35
            }
          } : void 0,
          children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
            style: {
              width: r(12),
              height: r(12),
              borderRadius: "50%",
              border: r(2),
              borderColor: color,
              backgroundColor: wired || plug === "target" ? color : C.cardDeep,
              boxShadow: plug === "open" || plug === "target" ? {
                color: alpha(color, 0.75),
                blurRadius: r(10),
                spreadRadius: r(1)
              } : void 0,
              opacity: dim,
              transform: {
                scale: plug === "open" ? {
                  animated: breath
                } : 1
              },
              transition: {
                opacity: {
                  duration: 160
                }
              }
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
          style: {
            fontSize: r(10),
            color: plug === "shut" ? C.faint : C.dim,
            letterSpacing: r(0.3)
          },
          children: name
        })
      ]
    });
  }
  function Icon({ d, color, size }) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("svg", {
      viewBox: "0 0 24 24",
      style: {
        width: size,
        height: size
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", {
        d,
        fill: "none",
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round"
      })
    });
  }

  // src/hooks.ts
  var import_react5 = __toESM(require_react(), 1);
  function useWindowSize() {
    const [size, setSize] = (0, import_react5.useState)({
      width: 0,
      height: 0
    });
    (0, import_react5.useEffect)(() => {
      bevy.window.size().then(setSize).catch(() => {
      });
      return bevy.on("resize", setSize);
    }, []);
    return size;
  }
  function useEvent(name, run) {
    const latest = (0, import_react5.useRef)(run);
    latest.current = run;
    (0, import_react5.useEffect)(() => on(name, (value) => latest.current(value)), [
      name
    ]);
  }
  function useDebug(verb, run) {
    useEvent("debug.act", ({ action }) => {
      const [head, ...rest] = action.split(" ");
      if (head === verb) run(rest);
    });
  }
  function useLatest(value) {
    const ref = (0, import_react5.useRef)(value);
    ref.current = value;
    return ref;
  }

  // src/chrome/AddMenu.tsx
  var WIDTH = 240;
  var ITEM = 34;
  var HEAD = 22;
  var open = 0;
  var menuOpen = () => open > 0;
  function AddMenu({ x, y, accepts: accepts2, onPick, onClose }) {
    const [query, setQuery] = (0, import_react6.useState)("");
    const size = useWindowSize();
    const t = (0, import_bevy_react5.useSharedValue)(0);
    (0, import_react6.useEffect)(() => {
      t.value = (0, import_bevy_react5.withSpring)(1, {
        stiffness: 420,
        damping: 28
      });
    }, [
      t
    ]);
    const kinds = Object.keys(KINDS).filter((k) => (!accepts2 || accepts2(k)) && KINDS[k].title.toLowerCase().includes(query.toLowerCase()));
    const groups = Object.keys(CATEGORIES).map((c) => [
      c,
      kinds.filter((k) => KINDS[k].category === c)
    ]).filter(([, ks]) => ks.length);
    const latest = useLatest({
      kinds,
      onPick,
      onClose
    });
    (0, import_react6.useEffect)(() => {
      open++;
      const off = bevy.on("keyDown", (e) => {
        const { kinds: kinds2, onPick: onPick2, onClose: onClose2 } = latest.current;
        if (e.key === "Backspace") setQuery((q) => q.slice(0, -1));
        else if (e.key === "Enter") {
          if (kinds2[0]) onPick2(kinds2[0]);
          else onClose2();
        } else if (e.text && /^[\w ]$/.test(e.text) && !e.ctrlKey) {
          setQuery((q) => q + e.text);
        }
      });
      return () => {
        open--;
        off();
      };
    }, [
      latest
    ]);
    const height = 44 + groups.reduce((h, [, ks]) => h + HEAD + ks.length * ITEM, 0);
    const left = Math.max(8, Math.min(x, size.width - WIDTH - 8));
    const top = Math.max(8, Math.min(y, size.height - height - 8));
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
      style: {
        ...glass,
        positionType: "absolute",
        left,
        top,
        width: WIDTH,
        flexDirection: "column",
        padding: 6,
        globalZIndex: 20,
        opacity: {
          animated: t
        },
        transform: {
          scale: {
            animated: (0, import_bevy_react5.interpolate)(t, [
              0,
              1,
              2
            ], [
              0.92,
              1,
              1.08
            ])
          }
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
          style: {
            height: 30,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            padding: {
              left: 8
            },
            margin: {
              bottom: 4
            },
            borderRadius: 8,
            backgroundColor: "rgba(0, 0, 0, 0.25)"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, {
              d: "M10.5 17a6.5 6.5 0 1 1 0-13a6.5 6.5 0 0 1 0 13Z M15.5 15.5 20 20",
              color: C.dim,
              size: 14
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
              style: {
                fontSize: 12,
                color: query ? C.text : C.faint
              },
              children: query || (accepts2 ? "Plug into\u2026" : "Add a module\u2026")
            })
          ]
        }),
        groups.map(([c, ks]) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
          style: {
            flexDirection: "column"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
              style: {
                height: HEAD,
                padding: {
                  left: 8,
                  top: 6
                },
                fontSize: 10,
                fontWeight: "semibold",
                letterSpacing: 1,
                color: CATEGORIES[c].color
              },
              children: CATEGORIES[c].label.toUpperCase()
            }),
            ks.map((k) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
              onClick: () => onPick(k),
              style: {
                height: ITEM,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: {
                  left: 8
                },
                borderRadius: 8,
                backgroundColor: k === kinds[0] && query ? alpha("#ffffff", 0.06) : "transparent",
                transition: {
                  backgroundColor: {
                    duration: 120
                  }
                }
              },
              hoverStyle: {
                backgroundColor: alpha(CATEGORIES[c].color, 0.16)
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, {
                  d: KINDS[k].icon,
                  color: CATEGORIES[c].color,
                  size: 16
                }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
                  style: {
                    flexGrow: 1,
                    flexDirection: "column"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
                      style: {
                        fontSize: 12,
                        color: C.text
                      },
                      children: KINDS[k].title
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
                      style: {
                        fontSize: 10,
                        color: C.faint
                      },
                      children: KINDS[k].blurb
                    })
                  ]
                })
              ]
            }, k))
          ]
        }, c))
      ]
    });
  }

  // src/chrome/Minimap.tsx
  var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
  var import_react7 = __toESM(require_react(), 1);
  var W = 208;
  var H = 132;
  function Minimap({ graph, view, size, onCenter }) {
    const nodes = live(graph);
    const seen = {
      x: -view.x / view.zoom,
      y: -view.y / view.zoom,
      w: size.width / view.zoom,
      h: size.height / view.zoom
    };
    const b = bounds(nodes) ?? seen;
    const pad = 80;
    const x0 = Math.min(b.x, seen.x) - pad;
    const y0 = Math.min(b.y, seen.y) - pad;
    const x1 = Math.max(b.x + b.w, seen.x + seen.w) + pad;
    const y1 = Math.max(b.y + b.h, seen.y + seen.h) + pad;
    const s = Math.min(W / (x1 - x0), H / (y1 - y0));
    const ox = (W - (x1 - x0) * s) / 2 - x0 * s;
    const oy = (H - (y1 - y0) * s) / 2 - y0 * s;
    const px = 1 / s;
    const frozen = (0, import_react7.useRef)(null);
    const fly = (e, glide) => {
      const m = frozen.current ?? {
        s,
        ox,
        oy
      };
      onCenter((e.x * W - m.ox) / m.s, (e.y * H - m.oy) / m.s, glide);
    };
    let wires = "";
    for (const l of graph.links) {
      const a = graph.nodes[l.from.node];
      const z = graph.nodes[l.to.node];
      if (!a || !z) continue;
      const [ax, ay] = [
        a.x + kind(a.kind).width,
        a.y + 50
      ];
      const [zx, zy] = [
        z.x,
        z.y + 50
      ];
      const mid = Math.round((ax + zx) / 2);
      wires += `M${ax} ${ay}C${mid} ${ay} ${mid} ${zy} ${zx} ${zy}`;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("node", {
      onPointerDown: (e) => {
        frozen.current = {
          s,
          ox,
          oy
        };
        fly(e, 260);
      },
      onPointerMove: (e) => fly(e, 0),
      onPointerUp: () => {
        frozen.current = null;
      },
      style: {
        ...glass,
        positionType: "absolute",
        right: 14,
        bottom: 14,
        width: W + 2,
        height: H + 2,
        overflowX: "clip",
        overflowY: "clip",
        cursor: "pointer"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", {
        viewBox: `${-ox * px} ${-oy * px} ${W * px} ${H * px}`,
        style: {
          positionType: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", {
            d: wires,
            fill: "none",
            stroke: alpha("#ffffff", 0.22),
            strokeWidth: px
          }),
          nodes.map((n) => {
            const r2 = nodeBox(n);
            const color = CATEGORIES[kind(n.kind).category].color;
            const sel = graph.selected.includes(n.id);
            return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", {
              x: r2.x,
              y: r2.y,
              width: r2.w,
              height: r2.h,
              // World units: about 2 map px, and it never changes with the
              // frame.
              rx: 30,
              fill: alpha(color, sel ? 0.9 : 0.45)
            }, n.id);
          }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", {
            x: seen.x,
            y: seen.y,
            width: seen.w,
            height: seen.h,
            rx: 3 * px,
            fill: alpha(C.text, 0.04),
            stroke: alpha(C.text, 0.55),
            strokeWidth: px
          })
        ]
      })
    });
  }

  // src/chrome/Palette.tsx
  var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
  var import_react8 = __toESM(require_react(), 1);
  var PALETTE_W = 204;
  function Palette({ onAdd, onDrop }) {
    const [ghost, setGhost] = (0, import_react8.useState)(null);
    const press = (0, import_react8.useRef)(null);
    const down = (kind2) => (e) => {
      press.current = {
        kind: kind2,
        x: e.clientX,
        y: e.clientY,
        moved: false
      };
    };
    const move = (e) => {
      const p = press.current;
      if (!p) return;
      if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 4) return;
      p.moved = true;
      setGhost({
        kind: p.kind,
        x: e.clientX,
        y: e.clientY
      });
    };
    const up = (e) => {
      const p = press.current;
      press.current = null;
      setGhost(null);
      if (!p) return;
      if (!p.moved) onAdd(p.kind);
      else if (e.clientX > PALETTE_W + 24) onDrop(p.kind, e.clientX, e.clientY);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
          style: {
            ...glass,
            positionType: "absolute",
            left: 14,
            top: 14,
            width: PALETTE_W,
            flexDirection: "column",
            padding: "12px 8px 8px"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: {
                fontSize: 11,
                fontWeight: "semibold",
                letterSpacing: 1.4,
                color: C.dim,
                padding: {
                  left: 6
                },
                margin: {
                  bottom: 4
                }
              },
              children: "MODULES"
            }),
            Object.keys(CATEGORIES).map((c) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
              style: {
                flexDirection: "column"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    padding: {
                      left: 6
                    },
                    margin: {
                      top: 8,
                      bottom: 2
                    }
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("node", {
                      style: {
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: CATEGORIES[c].color
                      }
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                      style: {
                        fontSize: 10,
                        letterSpacing: 1,
                        color: C.dim
                      },
                      children: CATEGORIES[c].label.toUpperCase()
                    })
                  ]
                }),
                Object.keys(KINDS).filter((k) => KINDS[k].category === c).map((k) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
                  onPointerDown: down(k),
                  onPointerMove: move,
                  onPointerUp: up,
                  style: {
                    height: 32,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 9,
                    padding: {
                      left: 6
                    },
                    borderRadius: 8,
                    cursor: "grab",
                    backgroundColor: "rgba(255, 255, 255, 0)",
                    transform: {
                      translateX: 0
                    },
                    transition: {
                      backgroundColor: {
                        duration: 120
                      },
                      transform: {
                        stiffness: 420,
                        damping: 26
                      }
                    }
                  },
                  hoverStyle: {
                    backgroundColor: alpha(CATEGORIES[c].color, 0.14),
                    transform: {
                      translateX: 3
                    }
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("node", {
                      style: {
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: alpha(CATEGORIES[c].color, 0.14)
                      },
                      children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, {
                        d: KINDS[k].icon,
                        color: CATEGORIES[c].color,
                        size: 14
                      })
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                      style: {
                        fontSize: 12,
                        color: C.text
                      },
                      children: KINDS[k].title
                    })
                  ]
                }, k))
              ]
            }, c))
          ]
        }),
        ghost && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Ghost, {
          ...ghost
        })
      ]
    });
  }
  function Ghost({ kind: kind2, x, y }) {
    const def = KINDS[kind2];
    const color = CATEGORIES[def.category].color;
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: x - 18,
        top: y - 16,
        width: 168,
        height: 34,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        padding: {
          left: 10
        },
        borderRadius: 10,
        border: 1,
        borderColor: alpha(color, 0.7),
        backgroundColor: alpha("#151a26", 0.92),
        boxShadow: {
          color: alpha(color, 0.35),
          blurRadius: 18
        },
        globalZIndex: 30,
        transform: {
          rotate: -3
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, {
          d: def.icon,
          color,
          size: 15
        }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
          style: {
            fontSize: 12,
            fontWeight: "semibold",
            color: C.text
          },
          children: def.title.toUpperCase()
        })
      ]
    });
  }

  // src/chrome/TopBar.tsx
  var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
  var import_react10 = __toESM(require_react(), 1);

  // src/chrome/Presets.tsx
  var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
  var import_react9 = __toESM(require_react(), 1);
  function Presets({ presets, value, onChange }) {
    const [open2, setOpen] = (0, import_react9.useState)(false);
    const step = (by) => onChange((value + by + presets.length) % presets.length);
    (0, import_react9.useEffect)(() => {
      if (!open2) return;
      return bevy.on("keyDown", (e) => {
        if (e.key === "Escape") setOpen(false);
      });
    }, [
      open2
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Arrow, {
          d: "M15 6l-6 6 6 6",
          onClick: () => step(-1)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
          onClick: () => setOpen((o) => !o),
          style: {
            width: 150,
            height: 32,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            padding: {
              left: 12,
              right: 9
            },
            borderRadius: 9,
            backgroundColor: open2 ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.28)",
            transition: {
              backgroundColor: {
                duration: 120
              }
            }
          },
          hoverStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.08)"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
              style: {
                flexGrow: 1,
                fontSize: 13,
                color: C.text
              },
              children: presets[value].name
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, {
              d: "M6 9l6 6 6-6",
              color: C.dim,
              size: 14
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Arrow, {
          d: "M9 6l6 6-6 6",
          onClick: () => step(1)
        }),
        open2 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(List, {
          presets,
          value,
          onPick: (i) => {
            setOpen(false);
            onChange(i);
          },
          onClose: () => setOpen(false)
        })
      ]
    });
  }
  function Arrow({ d, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
      onClick,
      style: {
        width: 26,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0)",
        transition: {
          backgroundColor: {
            duration: 120
          }
        }
      },
      hoverStyle: {
        backgroundColor: "rgba(255, 255, 255, 0.07)"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, {
        d,
        color: C.dim,
        size: 15
      })
    });
  }
  function List({ presets, value, onPick, onClose }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
      onPointerDown: onClose,
      style: {
        positionType: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: "column",
        alignItems: "center",
        globalZIndex: 40
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
        // Owns the presses between the rows, so they don't close it.
        onPointerDown: () => {
        },
        style: {
          ...glass,
          margin: {
            top: 70
          },
          width: 340,
          flexDirection: "column",
          padding: 6
        },
        children: presets.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
          onClick: () => onPick(i),
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: {
              horizontal: 10,
              vertical: 7
            },
            borderRadius: 8,
            backgroundColor: i === value ? alpha("#ffffff", 0.08) : alpha("#ffffff", 0),
            transition: {
              backgroundColor: {
                duration: 120
              }
            }
          },
          hoverStyle: {
            backgroundColor: alpha("#ffffff", 0.12)
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
              style: {
                flexGrow: 1,
                flexDirection: "column",
                gap: 2
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
                  style: {
                    fontSize: 13,
                    color: i === value ? SIGNAL.audio : C.text
                  },
                  children: p.name
                }),
                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
                  style: {
                    fontSize: 11,
                    color: C.dim
                  },
                  children: p.blurb
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
              style: {
                fontSize: 11,
                fontFamily: FONT_MONO,
                color: C.dim
              },
              children: `${p.bpm}`
            })
          ]
        }, p.name))
      })
    });
  }

  // src/chrome/TopBar.tsx
  var button = {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: {
      left: 11,
      right: 12
    },
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0)",
    transition: {
      backgroundColor: {
        duration: 120
      },
      transform: {
        stiffness: 500,
        damping: 26
      }
    },
    transform: {
      scale: 1
    }
  };
  function Button({ icon, label: label2, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      onClick,
      style: button,
      hoverStyle: {
        backgroundColor: "rgba(255, 255, 255, 0.07)"
      },
      pressStyle: {
        transform: {
          scale: 0.94
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, {
          d: icon,
          color: C.dim,
          size: 15
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontSize: 12,
            color: C.text
          },
          children: label2
        })
      ]
    });
  }
  var Divider = () => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
    style: {
      width: 1,
      height: 22,
      backgroundColor: C.glassEdge
    }
  });
  function TopBar({ presets, preset: preset2, onPreset, playing, onPlay, bpm, onBpm, zoom, onArrange, onFit }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
      style: {
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 14,
        justifyContent: "center"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
        style: {
          ...glass,
          height: 48,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: {
            left: 14,
            right: 8
          }
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Logo, {}),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
            style: {
              fontSize: 15,
              fontWeight: "bold",
              color: C.text,
              letterSpacing: 0.5
            },
            children: "Synth"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Presets, {
            presets,
            value: preset2,
            onChange: onPreset
          }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Play, {
            playing,
            onPlay
          }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Tempo, {
            bpm,
            onBpm
          }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Divider, {}),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, {
            icon: "M4 6h6v4H4z M14 14h6v4h-6z M10 8h2v8h2",
            label: "Arrange",
            onClick: onArrange
          }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, {
            icon: "M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5",
            label: "Fit",
            onClick: onFit
          }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
            style: {
              width: 52,
              fontSize: 12,
              fontFamily: FONT_MONO,
              color: C.dim,
              textAlign: "right"
            },
            children: `${Math.round(zoom * 100)}%`
          })
        ]
      })
    });
  }
  function Logo() {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("svg", {
      viewBox: "0 0 28 28",
      style: {
        width: 26,
        height: 26
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("path", {
          d: "M7 8 C14 8 14 20 21 20",
          fill: "none",
          stroke: SIGNAL.audio,
          strokeWidth: 2.2
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("path", {
          d: "M7 20 C12 20 14 14 21 14",
          fill: "none",
          stroke: SIGNAL.gate,
          strokeWidth: 2.2
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: 7,
          cy: 8,
          r: 3.4,
          fill: SIGNAL.audio
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: 7,
          cy: 20,
          r: 3.4,
          fill: SIGNAL.gate
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: 21,
          cy: 20,
          r: 3.4,
          fill: C.text
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("circle", {
          cx: 21,
          cy: 14,
          r: 3.4,
          fill: SIGNAL.cv
        })
      ]
    });
  }
  function Play({ playing, onPlay }) {
    const color = playing ? SIGNAL.audio : C.text;
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
      onClick: onPlay,
      style: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        border: 1,
        borderColor: alpha(SIGNAL.audio, playing ? 0.6 : 0.25),
        backgroundColor: alpha(SIGNAL.audio, playing ? 0.16 : 0.05),
        // The icon cross-fades between play and pause.
        morphFilter: {
          key: playing ? 1 : 0,
          name: "crossfade"
        },
        transform: {
          scale: 1
        },
        transition: {
          transform: {
            stiffness: 500,
            damping: 24
          },
          morphFilter: {
            duration: 220
          }
        }
      },
      pressStyle: {
        transform: {
          scale: 0.9
        }
      },
      children: playing ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("svg", {
        viewBox: "0 0 24 24",
        style: {
          width: 14,
          height: 14
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("rect", {
            x: 5,
            y: 4,
            width: 4.5,
            height: 16,
            rx: 1.2,
            fill: color
          }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("rect", {
            x: 14.5,
            y: 4,
            width: 4.5,
            height: 16,
            rx: 1.2,
            fill: color
          })
        ]
      }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("svg", {
        viewBox: "0 0 24 24",
        style: {
          width: 14,
          height: 14
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("path", {
          d: "M7 4.5v15l12-7.5z",
          fill: color
        })
      })
    });
  }
  function Tempo({ bpm, onBpm }) {
    const [live2, setLive] = (0, import_react10.useState)(null);
    const drag = (0, import_react10.useRef)(null);
    const shown = live2 ?? bpm;
    const scrub = (x) => {
      const d = drag.current;
      return d ? Math.max(60, Math.min(180, Math.round(d.bpm + (x - d.x) / 3))) : bpm;
    };
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      onPointerDown: (e) => {
        drag.current = {
          x: e.clientX,
          bpm
        };
      },
      onPointerMove: (e) => setLive(scrub(e.clientX)),
      onPointerUp: (e) => {
        const next = scrub(e.clientX);
        drag.current = null;
        setLive(null);
        if (next !== bpm) onBpm(next);
      },
      style: {
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: {
          horizontal: 10
        },
        borderRadius: 9,
        cursor: "ewResize",
        backgroundColor: live2 === null ? "rgba(0, 0, 0, 0.22)" : "rgba(0, 0, 0, 0.4)"
      },
      hoverStyle: {
        backgroundColor: "rgba(0, 0, 0, 0.4)"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontSize: 15,
            fontFamily: FONT_MONO,
            color: C.text
          },
          children: shown
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontSize: 10,
            color: C.dim
          },
          children: "BPM"
        })
      ]
    });
  }
  function Hints() {
    const items = [
      [
        "Drag a socket",
        "patch"
      ],
      [
        "Right-click",
        "add"
      ],
      [
        "WASD",
        "pan"
      ],
      [
        "Space",
        "play"
      ],
      [
        "F",
        "fit"
      ],
      [
        "Del",
        "remove"
      ],
      [
        "Shift-drag",
        "select"
      ]
    ];
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
      style: {
        ...glass,
        positionType: "absolute",
        left: 14,
        bottom: 14,
        height: 34,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: {
          horizontal: 14
        },
        borderRadius: 17
      },
      children: items.map(([key, what]) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Hint, {
        k: key,
        what
      }, key))
    });
  }
  function Hint({ k, what }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontSize: 10,
            fontFamily: FONT_MONO,
            color: C.text,
            padding: "1px 5px",
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.08)"
          },
          children: k
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontSize: 11,
            color: C.dim
          },
          children: what
        })
      ]
    });
  }

  // src/graph/Canvas.tsx
  var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
  var import_react11 = __toESM(require_react(), 1);
  var GRAPH_ROOT = "graph-root";
  var ZOOM_STEP = 1.12;
  var zoomLevel = (zoom) => Math.max(-11, Math.min(7, Math.round(Math.log(zoom) / Math.log(ZOOM_STEP))));
  var zoomAt = (level) => ZOOM_STEP ** level;
  var same = (a, b) => a === b || !!a && !!b && a.node === b.node && a.side === b.side && a.port === b.port;
  function Canvas({ graph, dispatch, view, setView, gliding, playing }) {
    const [wire, setWire] = (0, import_react11.useState)(null);
    const [lifted, setLifted] = (0, import_react11.useState)([]);
    const [box, setBox] = (0, import_react11.useState)(null);
    const [menu, setMenu] = (0, import_react11.useState)(null);
    const gesture = (0, import_react11.useRef)(null);
    const wheel = (0, import_react11.useRef)(0);
    const state = useLatest({
      graph,
      view,
      wire
    });
    const toWorld = (p, v = state.current.view) => ({
      x: (p.x - v.x) / v.zoom,
      y: (p.y - v.y) / v.zoom
    });
    const client = (e) => ({
      x: e.clientX,
      y: e.clientY
    });
    const pan = {
      start(e) {
        gesture.current = {
          kind: "pan",
          from: client(e),
          view: state.current.view,
          moved: false,
          button: e.button ?? 0
        };
      },
      move(e) {
        const g = gesture.current;
        if (g?.kind !== "pan") return;
        const dx = e.clientX - g.from.x;
        const dy = e.clientY - g.from.y;
        if (!g.moved && Math.hypot(dx, dy) < 3) return;
        g.moved = true;
        setView({
          ...g.view,
          x: g.view.x + dx,
          y: g.view.y + dy,
          glide: 0
        });
      }
    };
    const api = (0, import_react11.useMemo)(
      () => ({
        press(id, e) {
          const { graph: graph2 } = state.current;
          if (graph2.nodes[id]?.leaving) return;
          setMenu(null);
          if (e.button === 1) return pan.start(e);
          if (e.button !== 0) return;
          const was = graph2.selected.includes(id);
          const ids = was ? graph2.selected : e.shiftKey ? [
            ...graph2.selected,
            id
          ] : [
            id
          ];
          if (!was) dispatch({
            type: "select",
            ids
          });
          dispatch({
            type: "raise",
            ids: [
              ...ids.filter((i) => i !== id),
              id
            ]
          });
          gesture.current = {
            kind: "move",
            from: client(e),
            start: Object.fromEntries(ids.map((i) => [
              i,
              {
                x: graph2.nodes[i].x,
                y: graph2.nodes[i].y
              }
            ])),
            moved: false,
            press: id,
            shift: e.shiftKey,
            was
          };
        },
        drag(e) {
          const g = gesture.current;
          if (g?.kind === "pan") return pan.move(e);
          if (g?.kind !== "move") return;
          const dx = e.clientX - g.from.x;
          const dy = e.clientY - g.from.y;
          if (!g.moved && Math.hypot(dx, dy) < 3) return;
          if (!g.moved) {
            g.moved = true;
            setLifted(Object.keys(g.start));
          }
          const zoom = state.current.view.zoom;
          const to = {};
          for (const [id, p] of Object.entries(g.start)) {
            to[id] = {
              x: Math.round(p.x + dx / zoom),
              y: Math.round(p.y + dy / zoom)
            };
          }
          dispatch({
            type: "move",
            to
          });
        },
        release() {
          const g = gesture.current;
          gesture.current = null;
          if (g?.kind !== "move") return;
          setLifted([]);
          if (g.moved) return;
          const { selected } = state.current.graph;
          if (!g.shift) dispatch({
            type: "select",
            ids: [
              g.press
            ]
          });
          else if (g.was) dispatch({
            type: "select",
            ids: selected.filter((i) => i !== g.press)
          });
        },
        socketDown(s, e) {
          if (e.button !== 0) return;
          setMenu(null);
          const { graph: graph2 } = state.current;
          let from = s;
          const held = s.side === "i" && graph2.links.find((l) => l.to.node === s.node && l.to.port === s.port);
          if (held) {
            dispatch({
              type: "unplug",
              id: held.id
            });
            from = {
              node: held.from.node,
              side: "o",
              port: held.from.port
            };
          }
          setWire({
            from,
            to: null,
            at: null
          });
        },
        socketHover(s, on2) {
          const { graph: graph2 } = state.current;
          setWire((w) => {
            if (!w || w.at) return w;
            if (!on2) return same(w.to, s) ? {
              ...w,
              to: null
            } : w;
            return canPlug(graph2, w.from, s) && !same(w.to, s) ? {
              ...w,
              to: s
            } : w;
          });
        },
        socketUp(e) {
          const { wire: wire2, graph: graph2 } = state.current;
          if (!wire2) return;
          if (wire2.to) {
            dispatch({
              type: "connect",
              a: wire2.from,
              b: wire2.to
            });
            setWire(null);
            return;
          }
          const p = toWorld(client(e));
          const onNode = live(graph2).some((n) => {
            const b = nodeBox(n);
            return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
          });
          if (onNode) return setWire(null);
          setWire({
            ...wire2,
            at: [
              e.clientX,
              e.clientY
            ]
          });
          setMenu({
            x: e.clientX,
            y: e.clientY,
            wire: wire2.from
          });
        },
        param(id, key, value) {
          dispatch({
            type: "param",
            id,
            key,
            value
          });
        },
        purge(id) {
          dispatch({
            type: "purge",
            id
          });
        }
      }),
      // `state`, `dispatch` and the setters are stable.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    const closeMenu = () => {
      setMenu(null);
      setWire(null);
    };
    const pick = (k) => {
      if (!menu) return;
      const p = toWorld(menu);
      const id = `n${graph.seq}`;
      const def = kind(k);
      const w = menu.wire;
      if (!w) {
        dispatch({
          type: "add",
          kind: k,
          x: p.x,
          y: p.y,
          select: true
        });
      } else {
        const side = w.side === "o" ? "i" : "o";
        const ports = side === "i" ? def.inputs : def.outputs;
        const port2 = Math.max(0, ports.findIndex((q) => q.signal === signalOf(graph, w)));
        dispatch({
          type: "add",
          kind: k,
          x: side === "i" ? p.x + 14 : p.x - def.width - 14,
          y: p.y - HEADER - ROWS_PAD - ROW * (port2 + 0.5),
          select: true
        });
        dispatch({
          type: "connect",
          a: w,
          b: {
            node: id,
            side,
            port: port2
          }
        });
      }
      setMenu(null);
      setWire(null);
    };
    (0, import_react11.useEffect)(() => bevy.on("keyDown", (e) => {
      if (e.repeat) return;
      if (e.key === "Escape") closeMenu();
      if (e.code === "KeyA" && e.shiftKey && !e.ctrlKey) {
        void bevy.pointer.get().then((at) => {
          const [x, y] = at ?? [
            400,
            300
          ];
          setMenu({
            x,
            y,
            wire: null
          });
        });
      }
    }), []);
    useDebug("menu", ([x, y]) => setMenu({
      x: Number(x),
      y: Number(y),
      wire: null
    }));
    const sent = (0, import_react11.useRef)("");
    (0, import_react11.useEffect)(() => {
      const selected = new Set(graph.selected);
      const drag = wire && {
        from: socketName(wire.from),
        output: wire.from.side === "o",
        to: wire.to && socketName(wire.to),
        at: wire.at,
        signal: signalOf(graph, wire.from),
        color: SIGNAL[signalOf(graph, wire.from)]
      };
      const msg = {
        wires: graph.links.map((l) => {
          const out = {
            node: l.from.node,
            side: "o",
            port: l.from.port
          };
          const signal = signalOf(graph, out);
          return {
            id: l.id,
            from: socketName(out),
            to: socketName({
              node: l.to.node,
              side: "i",
              port: l.to.port
            }),
            signal,
            color: SIGNAL[signal],
            hot: selected.has(l.from.node) || selected.has(l.to.node)
          };
        }),
        drag,
        playing
      };
      const json = JSON.stringify(msg);
      if (json !== sent.current) {
        sent.current = json;
        bevy.patch.set(msg);
      }
    });
    const plugs = (id) => {
      if (!wire) return null;
      const d = kind(graph.nodes[id].kind);
      const out = {};
      for (const [side, ports] of [
        [
          "i",
          d.inputs
        ],
        [
          "o",
          d.outputs
        ]
      ]) {
        ports.forEach((_, port2) => {
          const s = {
            node: id,
            side,
            port: port2
          };
          out[`${side}${port2}`] = same(s, wire.to) || same(s, wire.from) ? "target" : canPlug(graph, wire.from, s) ? "open" : "shut";
        });
      }
      return out;
    };
    const wired = (id) => graph.links.flatMap((l) => [
      l.from.node === id && `o${l.from.port}`,
      l.to.node === id && `i${l.to.port}`
    ]).filter(Boolean).join(" ");
    const selectBox = (a, b, base) => {
      const [p, q] = [
        toWorld(a),
        toWorld(b)
      ];
      const x0 = Math.min(p.x, q.x);
      const x1 = Math.max(p.x, q.x);
      const y0 = Math.min(p.y, q.y);
      const y1 = Math.max(p.y, q.y);
      const hits = live(graph).filter((n) => {
        const r2 = nodeBox(n);
        return r2.x < x1 && r2.x + r2.w > x0 && r2.y < y1 && r2.y + r2.h > y0;
      }).map((n) => n.id);
      dispatch({
        type: "select",
        ids: [
          .../* @__PURE__ */ new Set([
            ...base,
            ...hits
          ])
        ]
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
      onPointerDown: (e) => {
        setMenu(null);
        if (wire?.at) setWire(null);
        if (e.button === 2) return setMenu({
          x: e.clientX,
          y: e.clientY,
          wire: null
        });
        if (e.button === 0 && e.shiftKey) {
          gesture.current = {
            kind: "box",
            from: client(e),
            base: graph.selected
          };
          return setBox({
            a: client(e),
            b: client(e)
          });
        }
        pan.start(e);
      },
      onPointerMove: (e) => {
        const g = gesture.current;
        if (g?.kind === "box") {
          setBox({
            a: g.from,
            b: client(e)
          });
          selectBox(g.from, client(e), g.base);
        } else pan.move(e);
      },
      onPointerUp: () => {
        const g = gesture.current;
        gesture.current = null;
        setBox(null);
        if (g?.kind === "pan" && !g.moved && g.button === 0) dispatch({
          type: "select",
          ids: []
        });
      },
      onWheel: (e) => {
        wheel.current += e.deltaMode === "line" ? e.deltaY : e.deltaY / 50;
        const steps = Math.trunc(wheel.current);
        if (!steps) return;
        wheel.current -= steps;
        const zoom = zoomAt(zoomLevel(view.zoom) + steps);
        const p = toWorld(client(e));
        setView({
          x: e.clientX - p.x * zoom,
          y: e.clientY - p.y * zoom,
          zoom,
          glide: 170
        });
      },
      style: {
        positionType: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        overflowX: "clip",
        overflowY: "clip"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(ZoomContext.Provider, {
          value: view.zoom,
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
            name: GRAPH_ROOT,
            style: {
              positionType: "absolute",
              left: 0,
              top: 0,
              width: 0,
              height: 0
            },
            children: Object.values(graph.nodes).map((n) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(NodeCard, {
              node: n,
              selected: graph.selected.includes(n.id),
              lifted: lifted.includes(n.id),
              gliding,
              wired: wired(n.id),
              plug: plugs(n.id),
              api
            }, n.id))
          })
        }),
        box && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
          style: {
            positionType: "absolute",
            left: Math.min(box.a.x, box.b.x),
            top: Math.min(box.a.y, box.b.y),
            width: Math.abs(box.b.x - box.a.x),
            height: Math.abs(box.b.y - box.a.y),
            borderRadius: 4,
            border: 1,
            borderColor: alpha("#8fb4ff", 0.7),
            backgroundColor: alpha("#8fb4ff", 0.08)
          }
        }),
        menu && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(AddMenu, {
          x: menu.x,
          y: menu.y,
          accepts: menu.wire ? accepts(graph, menu.wire) : void 0,
          onPick: pick,
          onClose: closeMenu
        })
      ]
    });
  }
  function accepts(graph, s) {
    const signal = signalOf(graph, s);
    return (k) => (s.side === "o" ? kind(k).inputs : kind(k).outputs).some((p) => p.signal === signal);
  }

  // src/graph/presets.ts
  var deg = (...ns) => Object.fromEntries(ns.map((n, i) => [
    `p${i}`,
    n / 10
  ]));
  var tune = (semis) => (semis + 12) / 24;
  var lane = (bar) => [
    ...bar.replace(/ /g, "")
  ].reduce((m, c, i) => c === "x" ? m | 1 << i : m, 0);
  function preset(name, blurb, bpm, specs, wires) {
    const nodes = {};
    specs.forEach(([id, kind2, params], i) => {
      nodes[id] = {
        id,
        kind: kind2,
        x: 0,
        // Arrange keeps the sources in this order.
        y: i,
        params: {
          ...KINDS[kind2].params,
          ...params
        },
        z: i + 1,
        enter: 0
      };
    });
    const links = wires.map((w, i) => {
      const [from, to] = w.split(">").map((end) => {
        const [node, port2] = end.split(".");
        return {
          node,
          port: Number(port2)
        };
      });
      return {
        id: `${name}-w${i}`,
        from,
        to
      };
    });
    const at = arrange({
      ...EMPTY,
      nodes,
      links
    });
    const xs = Object.values(at).map((p) => p.x);
    const [left, right] = [
      Math.min(...xs),
      Math.max(...xs)
    ];
    Object.values(nodes).forEach((n, i) => {
      Object.assign(n, at[n.id]);
      n.enter = 60 + (n.x - left) / Math.max(1, right - left) * 420 + i % 2 * 40;
    });
    const graph = {
      nodes,
      links: [],
      selected: [],
      seq: 1,
      top: specs.length + 1
    };
    return {
      name,
      blurb,
      bpm,
      graph,
      links
    };
  }
  function instantiate(p, tag) {
    const id = (n) => `${n}~${tag}`;
    const nodes = {};
    for (const n of Object.values(p.graph.nodes)) nodes[id(n.id)] = {
      ...n,
      id: id(n.id)
    };
    const links = p.links.map((l) => ({
      id: id(l.id),
      from: {
        ...l.from,
        node: id(l.from.node)
      },
      to: {
        ...l.to,
        node: id(l.to.node)
      }
    }));
    return {
      graph: {
        ...p.graph,
        nodes
      },
      links
    };
  }
  var WIRE_DELAY = 520;
  var PRESETS = [
    preset("Night Drive", "A detuned saw arpeggio, dotted echoes, a kick", 112, [
      [
        "clk",
        "clock",
        {
          div: 1
        }
      ],
      [
        "lfo",
        "lfo",
        {
          shape: 0,
          rate: 0.2,
          depth: 0.3
        }
      ],
      [
        "seq",
        "sequencer",
        {
          ...deg(0, 3, 5, 6, 5, 3, 7, 6),
          mask: 255
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x... x... x... x..."),
          k1: 0,
          k2: lane("..x. ..x. ..x. ..x."),
          k3: 0
        }
      ],
      [
        "osc",
        "oscillator",
        {
          wave: 1,
          tune: tune(0),
          level: 0.8,
          detune: 0.5
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0,
          d: 0.3,
          s: 0.12,
          r: 0.25
        }
      ],
      [
        "kick",
        "drum",
        {
          voice: 0,
          tune: 0.3,
          decay: 0.3,
          level: 0.9
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.55,
          decay: 0.15,
          level: 0.6
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.36,
          res: 0.45,
          mod: 0.55
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "dly",
        "delay",
        {
          time: 0.4,
          feedback: 0.4,
          mix: 0.28,
          sync: 1
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 0.85,
          l1: 0.75,
          l2: 0.5,
          l3: 0
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.55,
          damp: 0.45,
          mix: 0.25
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.8
        }
      ]
    ], [
      "clk.0>seq.0",
      "clk.0>beat.0",
      "seq.0>osc.0",
      "seq.1>env.0",
      "osc.0>flt.0",
      "env.0>flt.1",
      "lfo.0>flt.2",
      "flt.0>vca.0",
      "env.0>vca.1",
      "vca.0>dly.0",
      "beat.0>kick.0",
      "beat.2>hat.0",
      "dly.0>mix.0",
      "kick.0>mix.1",
      "hat.0>mix.2",
      "mix.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Acid Line", "A squelching, sliding bassline over a kick and claps", 126, [
      [
        "clk",
        "clock",
        {
          div: 2,
          swing: 0.15
        }
      ],
      [
        "lfo",
        "lfo",
        {
          shape: 0,
          rate: 0.22,
          depth: 0.35
        }
      ],
      [
        "seq",
        "sequencer",
        {
          ...deg(0, 5, 0, 3, 0, 6, 5, 4),
          mask: 255
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x... x... x... x..."),
          k1: lane(".... x... .... x..."),
          k2: lane(".xxx .xxx .xxx .xxx"),
          k3: lane("x.xx x.x. xx.x x.xx")
        }
      ],
      [
        "glide",
        "glide",
        {
          time: 0.22
        }
      ],
      [
        "kick",
        "drum",
        {
          voice: 0,
          tune: 0.35,
          decay: 0.35,
          level: 0.9
        }
      ],
      [
        "clap",
        "drum",
        {
          voice: 2,
          tune: 0.4,
          decay: 0.3,
          level: 0.7
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.6,
          decay: 0.08,
          level: 0.4
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0,
          d: 0.32,
          s: 0,
          r: 0.12
        }
      ],
      [
        "osc",
        "oscillator",
        {
          wave: 1,
          tune: tune(-12),
          level: 0.9,
          detune: 0
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.26,
          res: 0.82,
          mod: 0.62
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 0.8,
          l1: 0.8,
          l2: 0.5,
          l3: 0.3
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.35,
          damp: 0.5,
          mix: 0.15
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.7
        }
      ]
    ], [
      "clk.0>seq.0",
      "clk.0>beat.0",
      "seq.0>glide.0",
      "glide.0>osc.0",
      "beat.0>kick.0",
      "beat.1>clap.0",
      "beat.2>hat.0",
      "beat.3>env.0",
      "osc.0>flt.0",
      "env.0>flt.1",
      "lfo.0>flt.2",
      "flt.0>vca.0",
      "env.0>vca.1",
      "vca.0>mix.0",
      "kick.0>mix.1",
      "clap.0>mix.2",
      "hat.0>mix.3",
      "mix.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Boom Bap", "A swung beat and a round bass, a small room", 88, [
      [
        "clk",
        "clock",
        {
          div: 2,
          swing: 0.55
        }
      ],
      [
        "seq",
        "sequencer",
        {
          ...deg(0, 0, 3, 3, 2, 2, 4, 3),
          mask: 255
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x... ...x ..x. ...."),
          k1: lane(".... x... .... x..."),
          k2: lane("x.x. x.x. x.x. x.x."),
          k3: lane("x..x ...x ..x. ..x.")
        }
      ],
      [
        "osc",
        "oscillator",
        {
          wave: 1,
          tune: tune(-12),
          level: 1,
          detune: 0.1
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0.05,
          d: 0.4,
          s: 0.3,
          r: 0.2
        }
      ],
      [
        "kick",
        "drum",
        {
          voice: 0,
          tune: 0.28,
          decay: 0.45,
          level: 0.95
        }
      ],
      [
        "snare",
        "drum",
        {
          voice: 1,
          tune: 0.45,
          decay: 0.35,
          level: 0.75
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.45,
          decay: 0.1,
          level: 0.45
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.3,
          res: 0.25,
          mod: 0.35
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 0.85,
          l1: 0.65,
          l2: 0.35,
          l3: 0.7
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.3,
          damp: 0.6,
          mix: 0.18
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.8
        }
      ]
    ], [
      "clk.0>seq.0",
      "clk.0>beat.0",
      "seq.0>osc.0",
      "beat.3>env.0",
      "beat.0>kick.0",
      "beat.1>snare.0",
      "beat.2>hat.0",
      "osc.0>flt.0",
      "env.0>flt.1",
      "flt.0>vca.0",
      "env.0>vca.1",
      "kick.0>mix.0",
      "snare.0>mix.1",
      "hat.0>mix.2",
      "vca.0>mix.3",
      "mix.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Dub Chords", "Minor sevenths in a long echo, a kick, a little hiss", 118, [
      [
        "clk",
        "clock",
        {
          div: 1,
          swing: 0.2
        }
      ],
      [
        "seq",
        "sequencer",
        {
          ...deg(5, 5, 5, 5, 7, 7, 7, 7),
          mask: 255
        }
      ],
      [
        "lfo",
        "lfo",
        {
          shape: 0,
          rate: 0.2,
          depth: 0.45
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x... x... x... x..."),
          k1: 0,
          k2: lane("..x. ..x. ..x. ..x."),
          k3: lane("..x. .... ..x. ....")
        }
      ],
      [
        "root",
        "oscillator",
        {
          wave: 1,
          tune: tune(-12),
          level: 1,
          detune: 0.15
        }
      ],
      [
        "sev",
        "oscillator",
        {
          wave: 1,
          tune: tune(-2),
          level: 0.85,
          detune: 0.15
        }
      ],
      [
        "third",
        "oscillator",
        {
          wave: 1,
          tune: tune(3),
          level: 0.85,
          detune: 0.15
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0.02,
          d: 0.4,
          s: 0,
          r: 0.3
        }
      ],
      [
        "kick",
        "drum",
        {
          voice: 0,
          tune: 0.25,
          decay: 0.45,
          level: 0.75
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.4,
          decay: 0.35,
          level: 0.4
        }
      ],
      [
        "hiss",
        "noise",
        {
          color: 1,
          level: 0.3
        }
      ],
      [
        "keys",
        "mixer",
        {
          l0: 1,
          l1: 0.9,
          l2: 0.9,
          l3: 0
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.45,
          res: 0.35,
          mod: 0.35
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "dly",
        "delay",
        {
          time: 0.4,
          feedback: 0.62,
          mix: 0.45,
          sync: 1
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 1,
          l1: 0.7,
          l2: 0.5,
          l3: 0.05
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.85,
          damp: 0.55,
          mix: 0.35
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.8
        }
      ]
    ], [
      "clk.0>seq.0",
      "clk.0>beat.0",
      "seq.0>root.0",
      "seq.0>sev.0",
      "seq.0>third.0",
      "root.0>keys.0",
      "sev.0>keys.1",
      "third.0>keys.2",
      "keys.0>flt.0",
      "beat.3>env.0",
      "env.0>flt.1",
      "lfo.0>flt.2",
      "flt.0>vca.0",
      "env.0>vca.1",
      "vca.0>dly.0",
      "beat.0>kick.0",
      "beat.2>hat.0",
      "dly.0>mix.0",
      "kick.0>mix.1",
      "hat.0>mix.2",
      "hiss.0>mix.3",
      "mix.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Jungle", "A chopped break at 172 and a rolling reese bass", 172, [
      [
        "clk",
        "clock",
        {
          div: 2
        }
      ],
      [
        "lfo",
        "lfo",
        {
          shape: 0,
          rate: 0.35,
          depth: 0.5
        }
      ],
      [
        "seq",
        "sequencer",
        {
          ...deg(0, 0, 0, 0, 0, 0, 4, 3),
          mask: 255
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x.x. .... ..x. ...."),
          k1: lane(".... x... .... x..."),
          k2: lane(".... ...x .x.. ...x"),
          k3: lane("x... .... ..x. ....")
        }
      ],
      [
        "osc",
        "oscillator",
        {
          wave: 1,
          tune: tune(-12),
          level: 0.9,
          detune: 0.9
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0,
          d: 0.5,
          s: 0.7,
          r: 0.55
        }
      ],
      [
        "kick",
        "drum",
        {
          voice: 0,
          tune: 0.35,
          decay: 0.3,
          level: 0.9
        }
      ],
      [
        "snare",
        "drum",
        {
          voice: 1,
          tune: 0.55,
          decay: 0.35,
          level: 0.8
        }
      ],
      [
        "ghost",
        "drum",
        {
          voice: 1,
          tune: 0.6,
          decay: 0.15,
          level: 0.35
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.7,
          decay: 0.12,
          level: 0.4
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.33,
          res: 0.3,
          mod: 0.3
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "drums",
        "mixer",
        {
          l0: 0.8,
          l1: 0.8,
          l2: 0.6,
          l3: 0.5
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 1,
          l1: 0.72,
          l2: 0,
          l3: 0
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.4,
          damp: 0.5,
          mix: 0.15
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.88
        }
      ]
    ], [
      "clk.0>seq.0",
      "clk.0>beat.0",
      "seq.0>osc.0",
      "beat.3>env.0",
      "osc.0>flt.0",
      "env.0>flt.1",
      "lfo.0>flt.2",
      "flt.0>vca.0",
      "env.0>vca.1",
      "beat.0>kick.0",
      "beat.1>snare.0",
      "beat.2>ghost.0",
      "seq.1>hat.0",
      "kick.0>drums.0",
      "snare.0>drums.1",
      "ghost.0>drums.2",
      "hat.0>drums.3",
      "drums.0>mix.0",
      "vca.0>mix.1",
      "mix.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Half Time", "Sliding 808s, wandering hats, a clap on three, a dark bell", 140, [
      [
        "clk",
        "clock",
        {
          div: 2
        }
      ],
      [
        "seq",
        "sequencer",
        {
          ...deg(0, 0, 0, 0, 0, 0, 2, 3),
          mask: 255
        }
      ],
      [
        "melody",
        "sequencer",
        {
          ...deg(10, 9, 9, 8, 7, 8, 8, 6),
          mask: 255
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x... ...x ..x. ...."),
          k1: lane(".... .... x... ...."),
          k2: lane("x.x. x.xx x.x. xxxx"),
          k3: lane("x..x ..x. x..x ..x.")
        }
      ],
      [
        "wander",
        "lfo",
        {
          shape: 3,
          rate: 0.75,
          depth: 0.12
        }
      ],
      [
        "glide",
        "glide",
        {
          time: 0.35
        }
      ],
      [
        "sub",
        "oscillator",
        {
          wave: 2,
          tune: tune(-12),
          level: 1,
          detune: 0
        }
      ],
      [
        "senv",
        "envelope",
        {
          a: 0,
          d: 0.8,
          s: 0,
          r: 0.55
        }
      ],
      [
        "bell",
        "oscillator",
        {
          wave: 3,
          tune: tune(12),
          level: 0.8,
          detune: 0
        }
      ],
      [
        "benv",
        "envelope",
        {
          a: 0,
          d: 0.4,
          s: 0,
          r: 0.4
        }
      ],
      [
        "clap",
        "drum",
        {
          voice: 2,
          tune: 0.45,
          decay: 0.45,
          level: 0.8
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.65,
          decay: 0.06,
          level: 0.6
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.28,
          res: 0.2,
          mod: 0.4
        }
      ],
      [
        "svca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "bvca",
        "vca",
        {
          gain: 1,
          curve: 1
        }
      ],
      [
        "dly",
        "delay",
        {
          time: 0.8,
          feedback: 0.4,
          mix: 0.3,
          sync: 1
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 0.9,
          l1: 0.75,
          l2: 0.55,
          l3: 0.85
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.6,
          damp: 0.5,
          mix: 0.25
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.75
        }
      ]
    ], [
      "clk.0>seq.0",
      "clk.0>melody.0",
      "clk.0>beat.0",
      "seq.0>glide.0",
      "glide.0>sub.0",
      "beat.0>senv.0",
      "sub.0>flt.0",
      "senv.0>flt.1",
      "flt.0>svca.0",
      "senv.0>svca.1",
      "melody.0>bell.0",
      "beat.3>benv.0",
      "bell.0>bvca.0",
      "benv.0>bvca.1",
      "bvca.0>dly.0",
      "beat.1>clap.0",
      "beat.2>hat.0",
      "wander.0>hat.1",
      "svca.0>mix.0",
      "clap.0>mix.1",
      "hat.0>mix.2",
      "dly.0>mix.3",
      "mix.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Arcade", "An 8-bit loop: a square lead, a triangle bass", 150, [
      [
        "clk",
        "clock",
        {
          div: 1
        }
      ],
      [
        "vib",
        "lfo",
        {
          shape: 0,
          rate: 0.78,
          depth: 0.12
        }
      ],
      [
        "lead",
        "sequencer",
        {
          ...deg(5, 6, 8, 10, 9, 8, 7, 8),
          mask: 255
        }
      ],
      [
        "bass",
        "sequencer",
        {
          ...deg(0, 5, 0, 5, 3, 8, 4, 9),
          mask: 255
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x... ..x. x... ...."),
          k1: lane(".... x... .... x..."),
          k2: lane("x.x. x.x. x.x. x.x."),
          k3: 0
        }
      ],
      [
        "sq",
        "oscillator",
        {
          wave: 2,
          tune: tune(12),
          level: 0.9,
          detune: 0
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0,
          d: 0.35,
          s: 0.6,
          r: 0.1
        }
      ],
      [
        "tri",
        "oscillator",
        {
          wave: 3,
          tune: tune(-12),
          level: 1,
          detune: 0
        }
      ],
      [
        "kick",
        "drum",
        {
          voice: 0,
          tune: 0.55,
          decay: 0.2,
          level: 0.8
        }
      ],
      [
        "snare",
        "drum",
        {
          voice: 1,
          tune: 0.7,
          decay: 0.3,
          level: 0.9
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.75,
          decay: 0.08,
          level: 0.6
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "dly",
        "delay",
        {
          time: 0.2,
          feedback: 0.25,
          mix: 0.22,
          sync: 1
        }
      ],
      [
        "drums",
        "mixer",
        {
          l0: 0.8,
          l1: 1,
          l2: 0.7,
          l3: 0
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 0.75,
          l1: 0.45,
          l2: 0.9,
          l3: 0
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.8
        }
      ]
    ], [
      "clk.0>lead.0",
      "clk.0>bass.0",
      "clk.0>beat.0",
      "lead.0>sq.0",
      "vib.0>sq.1",
      "lead.1>env.0",
      "sq.0>vca.0",
      "env.0>vca.1",
      "vca.0>dly.0",
      "bass.0>tri.0",
      "beat.0>kick.0",
      "beat.1>snare.0",
      "beat.2>hat.0",
      "kick.0>drums.0",
      "snare.0>drums.1",
      "hat.0>drums.2",
      "dly.0>mix.0",
      "tri.0>mix.1",
      "drums.0>mix.2",
      "mix.0>out.0"
    ]),
    preset("Electro", "A tuned 808 kick playing the bassline, claps, robot stabs", 126, [
      [
        "clk",
        "clock",
        {
          div: 2,
          swing: 0.1
        }
      ],
      [
        "bass",
        "sequencer",
        {
          ...deg(0, 0, 0, 5, 0, 3, 0, 4),
          mask: 255
        }
      ],
      [
        "riff",
        "sequencer",
        {
          ...deg(5, 8, 5, 10, 9, 5, 7, 5),
          mask: 255
        }
      ],
      [
        "beat",
        "beat",
        {
          k0: lane("x... ..x. ..x. .x.."),
          k1: lane(".... x... .... x..."),
          k2: lane("x.x. x.xx x.x. x.xx"),
          k3: lane("..x. ..x. .x.. x...")
        }
      ],
      // TUNE 0.3675 is 55 Hz: the bassline's A.
      [
        "kick",
        "drum",
        {
          voice: 0,
          tune: 0.3675,
          decay: 0.7,
          level: 0.95
        }
      ],
      [
        "clap",
        "drum",
        {
          voice: 2,
          tune: 0.5,
          decay: 0.4,
          level: 0.75
        }
      ],
      [
        "hat",
        "drum",
        {
          voice: 3,
          tune: 0.6,
          decay: 0.07,
          level: 0.45
        }
      ],
      [
        "osc",
        "oscillator",
        {
          wave: 1,
          tune: tune(0),
          level: 1,
          detune: 0.3
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0,
          d: 0.3,
          s: 0,
          r: 0.15
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.48,
          res: 0.6,
          mod: 0.5
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 0
        }
      ],
      [
        "dly",
        "delay",
        {
          time: 0.4,
          feedback: 0.35,
          mix: 0.25,
          sync: 1
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 0.5,
          l1: 0.75,
          l2: 0.55,
          l3: 1
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.35,
          damp: 0.5,
          mix: 0.15
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.75
        }
      ]
    ], [
      "clk.0>bass.0",
      "clk.0>riff.0",
      "clk.0>beat.0",
      "beat.0>kick.0",
      "bass.0>kick.1",
      "beat.1>clap.0",
      "beat.2>hat.0",
      "riff.0>osc.0",
      "beat.3>env.0",
      "osc.0>flt.0",
      "env.0>flt.1",
      "flt.0>vca.0",
      "env.0>vca.1",
      "vca.0>dly.0",
      "kick.0>mix.0",
      "clap.0>mix.1",
      "hat.0>mix.2",
      "dly.0>mix.3",
      "mix.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Music Box", "Plucked triangles, echoes and a large plate", 96, [
      [
        "clk",
        "clock",
        {
          div: 1
        }
      ],
      [
        "seq",
        "sequencer",
        {
          ...deg(5, 7, 9, 10, 9, 7, 8, 6),
          mask: 183
        }
      ],
      [
        "lfo",
        "lfo",
        {
          shape: 0,
          rate: 0.8,
          depth: 0.06
        }
      ],
      [
        "osc",
        "oscillator",
        {
          wave: 3,
          tune: tune(3),
          level: 1,
          detune: 0
        }
      ],
      [
        "env",
        "envelope",
        {
          a: 0,
          d: 0.38,
          s: 0,
          r: 0.35
        }
      ],
      [
        "vca",
        "vca",
        {
          gain: 1,
          curve: 1
        }
      ],
      [
        "dly",
        "delay",
        {
          time: 0.8,
          feedback: 0.45,
          mix: 0.32,
          sync: 1
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.82,
          damp: 0.25,
          mix: 0.45
        }
      ],
      [
        "out",
        "output",
        {
          volume: 1
        }
      ]
    ], [
      "clk.0>seq.0",
      "seq.0>osc.0",
      "lfo.0>osc.1",
      "seq.1>env.0",
      "osc.0>vca.0",
      "env.0>vca.1",
      "vca.0>dly.0",
      "dly.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Tide", "A drone in fifths, swelling under a slow sweep", 64, [
      [
        "lfo",
        "lfo",
        {
          shape: 0,
          rate: 0.1,
          depth: 0.75
        }
      ],
      [
        "drift",
        "lfo",
        {
          shape: 1,
          rate: 0.3,
          depth: 0.12
        }
      ],
      [
        "osa",
        "oscillator",
        {
          wave: 1,
          tune: tune(-7),
          level: 0.8,
          detune: 0.5
        }
      ],
      [
        "osb",
        "oscillator",
        {
          wave: 1,
          tune: tune(0),
          level: 0.6,
          detune: 0.4
        }
      ],
      [
        "nse",
        "noise",
        {
          color: 2,
          level: 0.35
        }
      ],
      [
        "mix",
        "mixer",
        {
          l0: 0.7,
          l1: 0.55,
          l2: 0.35,
          l3: 0
        }
      ],
      [
        "flt",
        "filter",
        {
          mode: 0,
          cutoff: 0.4,
          res: 0.42,
          mod: 0
        }
      ],
      [
        "dly",
        "delay",
        {
          time: 1,
          feedback: 0.5,
          mix: 0.3,
          sync: 1
        }
      ],
      [
        "rev",
        "reverb",
        {
          size: 0.95,
          damp: 0.3,
          mix: 0.6
        }
      ],
      [
        "out",
        "output",
        {
          volume: 0.7
        }
      ]
    ], [
      "drift.0>osb.1",
      "osa.0>mix.0",
      "osb.0>mix.1",
      "nse.0>mix.2",
      "mix.0>flt.0",
      "lfo.0>flt.2",
      "flt.0>dly.0",
      "dly.0>rev.0",
      "rev.0>out.0",
      "rev.1>out.1"
    ]),
    preset("Empty", "Start from nothing", 112, [], [])
  ];

  // src/App.tsx
  var INSET = {
    left: PALETTE_W + 28,
    top: 84,
    right: 24,
    bottom: 60
  };
  function App() {
    const [graph, dispatch] = (0, import_react12.useReducer)(reduce, EMPTY);
    const [view, setView] = (0, import_react12.useState)({
      x: 600,
      y: 400,
      zoom: 1,
      glide: 0
    });
    const [playing, setPlaying] = (0, import_react12.useState)(true);
    const [bpm, setBpm] = (0, import_react12.useState)(112);
    const [preset2, setPreset] = (0, import_react12.useState)(0);
    const [gliding, setGliding] = (0, import_react12.useState)(false);
    const size = useWindowSize();
    const latest = useLatest({
      graph,
      view,
      size
    });
    const steps = (0, import_bevy_react6.useSharedValue)(0);
    const spin = (0, import_bevy_react6.useSharedValue)(0);
    const ctx = (0, import_react12.useMemo)(() => ({
      playing,
      bpm,
      steps,
      spin
    }), [
      playing,
      bpm,
      steps,
      spin
    ]);
    (0, import_react12.useEffect)(() => {
      spin.value = (0, import_bevy_react6.withRepeat)((0, import_bevy_react6.withTiming)(360, {
        duration: 4e3
      }));
    }, [
      spin
    ]);
    (0, import_react12.useEffect)(() => bevy.view.set(view), [
      view
    ]);
    const sound = (0, import_react12.useRef)("");
    (0, import_react12.useEffect)(() => {
      const msg = {
        modules: live(graph).map(({ id, kind: kind2, params }) => ({
          id,
          kind: kind2,
          params
        })),
        cables: graph.links.map(({ from, to }) => ({
          from,
          to
        })),
        playing,
        bpm,
        lights: steps.id
      };
      const json = JSON.stringify(msg);
      if (json !== sound.current) {
        sound.current = json;
        bevy.synth.set(msg);
      }
    });
    const framing = (nodes, glide) => {
      const b = bounds(nodes);
      if (!b) return null;
      const { size: size2 } = latest.current;
      const w = size2.width - INSET.left - INSET.right;
      const h = size2.height - INSET.top - INSET.bottom;
      const zoom = Math.min(1, Math.floor(Math.min(w / b.w, h / b.h) * 64) / 64);
      return {
        x: INSET.left + w / 2 - (b.x + b.w / 2) * zoom,
        y: INSET.top + h / 2 - (b.y + b.h / 2) * zoom,
        zoom,
        glide
      };
    };
    const fit = () => {
      const v = framing(live(latest.current.graph), 520);
      if (v) setView(v);
    };
    const loads = (0, import_react12.useRef)(0);
    const timers = (0, import_react12.useRef)([]);
    const load = (i) => {
      timers.current.forEach(clearTimeout);
      const tag = ++loads.current;
      const { graph: graph2, links } = instantiate(PRESETS[i], tag);
      const current = live(latest.current.graph);
      dispatch({
        type: "delete",
        ids: current.map((n) => n.id)
      });
      setPreset(i);
      setBpm(PRESETS[i].bpm);
      const later = (ms, run) => timers.current.push(setTimeout(run, ms));
      later(current.length ? 240 : 0, () => {
        dispatch({
          type: "load",
          graph: graph2
        });
        const v = framing(Object.values(graph2.nodes), 650);
        if (v) setView(v);
        later(WIRE_DELAY, () => dispatch({
          type: "links",
          links
        }));
      });
    };
    (0, import_react12.useEffect)(() => {
      if (size.width) load(0);
    }, [
      size.width > 0
    ]);
    const arrangeAll = () => {
      const to = arrange(latest.current.graph);
      setGliding(true);
      setTimeout(() => {
        dispatch({
          type: "move",
          to
        });
        const placed = live(latest.current.graph).map((n) => ({
          ...n,
          ...to[n.id]
        }));
        const v = framing(placed, 700);
        if (v) setView(v);
      }, 40);
      setTimeout(() => setGliding(false), 1400);
    };
    const add = (k, x, y) => {
      const { view: view2 } = latest.current;
      dispatch({
        type: "add",
        kind: k,
        x: (x - view2.x) / view2.zoom,
        y: (y - view2.y) / view2.zoom,
        select: true
      });
    };
    const nudge = (0, import_react12.useRef)(0);
    const addMid = (k) => {
      const { size: size2 } = latest.current;
      const n = nudge.current++ % 6;
      const cx = INSET.left + (size2.width - INSET.left - INSET.right) / 2;
      const cy = INSET.top + (size2.height - INSET.top - INSET.bottom) / 2;
      const { view: view2 } = latest.current;
      add(k, cx - KINDS[k].width / 2 * view2.zoom + n * 26, cy - cardHeight(k) / 2 * view2.zoom + n * 26);
    };
    (0, import_react12.useEffect)(
      () => bevy.on("keyDown", (e) => {
        if (e.repeat || menuOpen()) return;
        const { graph: graph2 } = latest.current;
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && e.code === "KeyA") dispatch({
          type: "select",
          ids: live(graph2).map((n) => n.id)
        });
        else if (ctrl && e.code === "KeyD") dispatch({
          type: "duplicate"
        });
        else if (ctrl) return;
        else if (e.code === "Space") setPlaying((p) => !p);
        else if (e.code === "KeyF") fit();
        else if (e.code === "KeyL") arrangeAll();
        else if ([
          "Delete",
          "Backspace",
          "KeyX"
        ].includes(e.code)) {
          dispatch({
            type: "delete",
            ids: graph2.selected
          });
        } else if (e.code === "Escape") dispatch({
          type: "select",
          ids: []
        });
      }),
      // Reads everything through `latest`.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );
    useEvent("view.pan", ({ x, y }) => {
      if (menuOpen()) return;
      setView((v) => ({
        ...v,
        x: v.x + x,
        y: v.y + y,
        glide: 90
      }));
    });
    useDebug("preset", ([i]) => load(Number(i)));
    useDebug("play", () => setPlaying(true));
    useDebug("pause", () => setPlaying(false));
    useDebug("fit", fit);
    useDebug("arrange", arrangeAll);
    useDebug("add", ([k, x, y]) => add(k, Number(x), Number(y)));
    useDebug("view", ([x, y, z]) => setView({
      x: Number(x),
      y: Number(y),
      zoom: Number(z),
      glide: 400
    }));
    useDebug("select", (names) => {
      const ids = live(latest.current.graph).filter((n) => names.includes(n.id.split("~")[0])).map((n) => n.id);
      dispatch({
        type: "select",
        ids
      });
    });
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(LiveContext.Provider, {
      value: ctx,
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("node", {
        style: {
          width: "100%",
          height: "100%"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Canvas, {
            graph,
            dispatch,
            view,
            setView,
            gliding,
            playing
          }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Palette, {
            onAdd: addMid,
            onDrop: (k, x, y) => add(k, x - 20, y - 18)
          }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TopBar, {
            presets: PRESETS,
            preset: preset2,
            onPreset: load,
            playing,
            onPlay: () => setPlaying((p) => !p),
            bpm,
            onBpm: setBpm,
            zoom: view.zoom,
            onArrange: arrangeAll,
            onFit: fit
          }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Minimap, {
            graph,
            view,
            size,
            onCenter: (x, y, glide) => {
              const { view: view2, size: size2 } = latest.current;
              setView({
                ...view2,
                x: size2.width / 2 - x * view2.zoom,
                y: size2.height / 2 - y * view2.zoom,
                glide
              });
            }
          }),
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Hints, {})
        ]
      })
    });
  }

  // src/index.tsx
  (0, import_bevy_react7.mount)(/* @__PURE__ */ (0, import_jsx_runtime16.jsx)(App, {}));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidmVuZG9yLWdsb2JhbDpiZXZ5LXJlYWN0L2pzeC1ydW50aW1lIiwgInZlbmRvci1nbG9iYWw6YmV2eS1yZWFjdCIsICJ2ZW5kb3ItZ2xvYmFsOnJlYWN0IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9pbmRleC50c3giLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL0FwcC50c3giLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL2JldnkudHMiLCAiLi4vc3JjL2Nocm9tZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9jaHJvbWUvQWRkTWVudS50c3giLCAiLi4vc3JjL2dyYXBoL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL2dyYXBoL2NhdGFsb2cudHMiLCAiLi4vc3JjL2dyYXBoL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL2dyYXBoL05vZGVDYXJkLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9zeW50aC91aS9zcmMvdGhlbWUudHMiLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL3dpZGdldHMudHN4IiwgIi4uL3NyYy9ib2RpZXMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9zeW50aC91aS9zcmMvYm9kaWVzL2tpdC50c3giLCAiLi4vc3JjL2JvZGllcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9ib2RpZXMvZHJ1bXMudHN4IiwgIi4uL3NyYy9ib2RpZXMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9zeW50aC91aS9zcmMvYm9kaWVzL2VmZmVjdHMudHN4IiwgIi4uL3NyYy9ib2RpZXMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9zeW50aC91aS9zcmMvYm9kaWVzL3JoeXRobS50c3giLCAiLi4vc3JjL2JvZGllcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9ib2RpZXMvc2hhcGVycy50c3giLCAiLi4vc3JjL2JvZGllcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9ib2RpZXMvc291cmNlcy50c3giLCAiLi4vc3JjL2JvZGllcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9ib2RpZXMvaW5kZXgudHMiLCAiLi4vc3JjL2dyYXBoL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL2dyYXBoL21vZGVsLnRzIiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9ob29rcy50cyIsICIuLi9zcmMvY2hyb21lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL2Nocm9tZS9NaW5pbWFwLnRzeCIsICIuLi9zcmMvY2hyb21lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL2Nocm9tZS9QYWxldHRlLnRzeCIsICIuLi9zcmMvY2hyb21lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvc3ludGgvdWkvc3JjL2Nocm9tZS9Ub3BCYXIudHN4IiwgIi4uL3NyYy9jaHJvbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9zeW50aC91aS9zcmMvY2hyb21lL1ByZXNldHMudHN4IiwgIi4uL3NyYy9ncmFwaC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9ncmFwaC9DYW52YXMudHN4IiwgIi4uL3NyYy9ncmFwaC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL3N5bnRoL3VpL3NyYy9ncmFwaC9wcmVzZXRzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuX19iZXZ5VmVuZG9yW1wiYmV2eS1yZWFjdC9qc3gtcnVudGltZVwiXTsiLCAibW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLl9fYmV2eVZlbmRvcltcImJldnktcmVhY3RcIl07IiwgIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5fX2JldnlWZW5kb3JbXCJyZWFjdFwiXTsiLCAiaW1wb3J0IHsgbW91bnQgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSBcIi4vQXBwXCI7XG5cbi8vIGBtb3VudGAgcGFya3Mgb24gdGhlIFJ1c3QtZHJpdmVuIGV2ZW50IGxvb3AgYW5kIG5ldmVyIHJlc29sdmVzLiBPbiBhIGhvdFxuLy8gcmVsb2FkIHRoaXMgZmlsZSByZS1leGVjdXRlcyBhbmQgYG1vdW50YCB0cmlnZ2VycyBhIFJlYWN0IEZhc3QgUmVmcmVzaC5cbm1vdW50KDxBcHAgLz4pO1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVkdWNlciwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlU2hhcmVkVmFsdWUsIHdpdGhSZXBlYXQsIHdpdGhUaW1pbmcgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCIuL2JldnlcIjtcbmltcG9ydCB7IG1lbnVPcGVuIH0gZnJvbSBcIi4vY2hyb21lL0FkZE1lbnVcIjtcbmltcG9ydCB7IE1pbmltYXAgfSBmcm9tIFwiLi9jaHJvbWUvTWluaW1hcFwiO1xuaW1wb3J0IHsgUEFMRVRURV9XLCBQYWxldHRlIH0gZnJvbSBcIi4vY2hyb21lL1BhbGV0dGVcIjtcbmltcG9ydCB7IEhpbnRzLCBUb3BCYXIgfSBmcm9tIFwiLi9jaHJvbWUvVG9wQmFyXCI7XG5pbXBvcnQgeyBDYW52YXMsIHR5cGUgVmlldyB9IGZyb20gXCIuL2dyYXBoL0NhbnZhc1wiO1xuaW1wb3J0IHsgdHlwZSBLaW5kLCBLSU5EUywgY2FyZEhlaWdodCB9IGZyb20gXCIuL2dyYXBoL2NhdGFsb2dcIjtcbmltcG9ydCB7XG4gIEVNUFRZLFxuICB0eXBlIEdyYXBoTm9kZSxcbiAgYXJyYW5nZSxcbiAgYm91bmRzLFxuICBsaXZlLFxuICByZWR1Y2UsXG59IGZyb20gXCIuL2dyYXBoL21vZGVsXCI7XG5pbXBvcnQgeyBQUkVTRVRTLCBXSVJFX0RFTEFZLCBpbnN0YW50aWF0ZSB9IGZyb20gXCIuL2dyYXBoL3ByZXNldHNcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VFdmVudCwgdXNlTGF0ZXN0LCB1c2VXaW5kb3dTaXplIH0gZnJvbSBcIi4vaG9va3NcIjtcbmltcG9ydCB7IExpdmVDb250ZXh0IH0gZnJvbSBcIi4vd2lkZ2V0c1wiO1xuXG4vKiogV2hlcmUgdGhlIGdyYXBoIHNob3dzOiByaWdodCBvZiB0aGUgcGFsZXR0ZSwgdW5kZXIgdGhlIHRvcCBiYXIuICovXG5jb25zdCBJTlNFVCA9IHsgbGVmdDogUEFMRVRURV9XICsgMjgsIHRvcDogODQsIHJpZ2h0OiAyNCwgYm90dG9tOiA2MCB9O1xuXG5leHBvcnQgZnVuY3Rpb24gQXBwKCkge1xuICBjb25zdCBbZ3JhcGgsIGRpc3BhdGNoXSA9IHVzZVJlZHVjZXIocmVkdWNlLCBFTVBUWSk7XG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IHVzZVN0YXRlPFZpZXc+KHsgeDogNjAwLCB5OiA0MDAsIHpvb206IDEsIGdsaWRlOiAwIH0pO1xuICBjb25zdCBbcGxheWluZywgc2V0UGxheWluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2JwbSwgc2V0QnBtXSA9IHVzZVN0YXRlKDExMik7XG4gIGNvbnN0IFtwcmVzZXQsIHNldFByZXNldF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW2dsaWRpbmcsIHNldEdsaWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBzaXplID0gdXNlV2luZG93U2l6ZSgpO1xuICBjb25zdCBsYXRlc3QgPSB1c2VMYXRlc3QoeyBncmFwaCwgdmlldywgc2l6ZSB9KTtcblxuICAvLyBUaGUgdHJhbnNwb3J0OiBlaWdodGggbm90ZXMsIHR3byBiYXJzIHJvdW5kLiBCZXZ5IGRyaXZlcyBpdCBmcm9tIHdoZXJlXG4gIC8vIHRoZSBzb3VuZCBpcyAoYHN5bnRoL21vZC5yc2ApLCBzbyBldmVyeSBsaWdodCBzaG93cyB3aGF0IHBsYXlzLlxuICBjb25zdCBzdGVwcyA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICBjb25zdCBzcGluID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIC8vIFN0YWJsZSBiZXR3ZWVuIHJlbmRlcnM6IGEgcGFuIHJlLXJlbmRlcnMgQXBwIGV2ZXJ5IGZyYW1lLCBhbmQgYSBmcmVzaFxuICAvLyB2YWx1ZSB3b3VsZCByZS1yZW5kZXIgZXZlcnkgY2FyZCBhbmQgc2NvcGUgdGhhdCByZWFkcyBpdC5cbiAgY29uc3QgY3R4ID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoeyBwbGF5aW5nLCBicG0sIHN0ZXBzLCBzcGluIH0pLFxuICAgIFtwbGF5aW5nLCBicG0sIHN0ZXBzLCBzcGluXSxcbiAgKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzcGluLnZhbHVlID0gd2l0aFJlcGVhdCh3aXRoVGltaW5nKDM2MCwgeyBkdXJhdGlvbjogNDAwMCB9KSk7XG4gIH0sIFtzcGluXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IGJldnkudmlldy5zZXQodmlldyksIFt2aWV3XSk7XG5cbiAgLy8gQmV2eSBwbGF5cyB0aGUgcGF0Y2g6IGl0IGhlYXJzIHdoYXQgaXQgaXMgbWFkZSBvZiB3aGVuZXZlciB0aGF0XG4gIC8vIGNoYW5nZXMg4oCUIGEga25vYiwgYSBjYWJsZSwgdGhlIHRyYW5zcG9ydCDigJQgbmV2ZXIgb24gYSBtb3ZlLlxuICBjb25zdCBzb3VuZCA9IHVzZVJlZihcIlwiKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBtc2cgPSB7XG4gICAgICBtb2R1bGVzOiBsaXZlKGdyYXBoKS5tYXAoKHsgaWQsIGtpbmQsIHBhcmFtcyB9KSA9PiAoe1xuICAgICAgICBpZCxcbiAgICAgICAga2luZCxcbiAgICAgICAgcGFyYW1zLFxuICAgICAgfSkpLFxuICAgICAgY2FibGVzOiBncmFwaC5saW5rcy5tYXAoKHsgZnJvbSwgdG8gfSkgPT4gKHsgZnJvbSwgdG8gfSkpLFxuICAgICAgcGxheWluZyxcbiAgICAgIGJwbSxcbiAgICAgIGxpZ2h0czogc3RlcHMuaWQsXG4gICAgfTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkobXNnKTtcbiAgICBpZiAoanNvbiAhPT0gc291bmQuY3VycmVudCkge1xuICAgICAgc291bmQuY3VycmVudCA9IGpzb247XG4gICAgICBiZXZ5LnN5bnRoLnNldChtc2cpO1xuICAgIH1cbiAgfSk7XG5cbiAgLyoqIEEgdmlldyB0aGF0IHNob3dzIGBub2Rlc2Agd2hvbGUsIGF0IG1vc3QgYXQgem9vbSAxLiAqL1xuICBjb25zdCBmcmFtaW5nID0gKG5vZGVzOiBHcmFwaE5vZGVbXSwgZ2xpZGU6IG51bWJlcik6IFZpZXcgfCBudWxsID0+IHtcbiAgICBjb25zdCBiID0gYm91bmRzKG5vZGVzKTtcbiAgICBpZiAoIWIpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHsgc2l6ZSB9ID0gbGF0ZXN0LmN1cnJlbnQ7XG4gICAgY29uc3QgdyA9IHNpemUud2lkdGggLSBJTlNFVC5sZWZ0IC0gSU5TRVQucmlnaHQ7XG4gICAgY29uc3QgaCA9IHNpemUuaGVpZ2h0IC0gSU5TRVQudG9wIC0gSU5TRVQuYm90dG9tO1xuICAgIC8vIE9uIGEgMS82NCBncmlkICh0aGUgd2hlZWwncyBzdGVwcyBzbmFwIGJhY2sgb250byBwb3dlcnMgb2YgMS4xMikuXG4gICAgY29uc3Qgem9vbSA9IE1hdGgubWluKDEsIE1hdGguZmxvb3IoTWF0aC5taW4odyAvIGIudywgaCAvIGIuaCkgKiA2NCkgLyA2NCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IElOU0VULmxlZnQgKyB3IC8gMiAtIChiLnggKyBiLncgLyAyKSAqIHpvb20sXG4gICAgICB5OiBJTlNFVC50b3AgKyBoIC8gMiAtIChiLnkgKyBiLmggLyAyKSAqIHpvb20sXG4gICAgICB6b29tLFxuICAgICAgZ2xpZGUsXG4gICAgfTtcbiAgfTtcbiAgY29uc3QgZml0ID0gKCkgPT4ge1xuICAgIGNvbnN0IHYgPSBmcmFtaW5nKGxpdmUobGF0ZXN0LmN1cnJlbnQuZ3JhcGgpLCA1MjApO1xuICAgIGlmICh2KSBzZXRWaWV3KHYpO1xuICB9O1xuXG4gIC8vIEEgcHJlc2V0OiB0aGUgb2xkIHBhdGNoIHNocmlua3MgYXdheSwgdGhlIG5ldyBvbmUgcG9wcyBpbiBhdCBpdHNcbiAgLy8gdGVtcG8gYW5kIGlzIHdpcmVkIGEgbW9tZW50IGxhdGVyLlxuICBjb25zdCBsb2FkcyA9IHVzZVJlZigwKTtcbiAgY29uc3QgdGltZXJzID0gdXNlUmVmPFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+W10+KFtdKTtcbiAgY29uc3QgbG9hZCA9IChpOiBudW1iZXIpID0+IHtcbiAgICB0aW1lcnMuY3VycmVudC5mb3JFYWNoKGNsZWFyVGltZW91dCk7XG4gICAgY29uc3QgdGFnID0gKytsb2Fkcy5jdXJyZW50O1xuICAgIGNvbnN0IHsgZ3JhcGgsIGxpbmtzIH0gPSBpbnN0YW50aWF0ZShQUkVTRVRTW2ldLCB0YWcpO1xuICAgIGNvbnN0IGN1cnJlbnQgPSBsaXZlKGxhdGVzdC5jdXJyZW50LmdyYXBoKTtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IFwiZGVsZXRlXCIsIGlkczogY3VycmVudC5tYXAoKG4pID0+IG4uaWQpIH0pO1xuICAgIHNldFByZXNldChpKTtcbiAgICBzZXRCcG0oUFJFU0VUU1tpXS5icG0pO1xuICAgIGNvbnN0IGxhdGVyID0gKG1zOiBudW1iZXIsIHJ1bjogKCkgPT4gdm9pZCkgPT5cbiAgICAgIHRpbWVycy5jdXJyZW50LnB1c2goc2V0VGltZW91dChydW4sIG1zKSk7XG4gICAgbGF0ZXIoY3VycmVudC5sZW5ndGggPyAyNDAgOiAwLCAoKSA9PiB7XG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwibG9hZFwiLCBncmFwaCB9KTtcbiAgICAgIGNvbnN0IHYgPSBmcmFtaW5nKE9iamVjdC52YWx1ZXMoZ3JhcGgubm9kZXMpLCA2NTApO1xuICAgICAgaWYgKHYpIHNldFZpZXcodik7XG4gICAgICBsYXRlcihXSVJFX0RFTEFZLCAoKSA9PiBkaXNwYXRjaCh7IHR5cGU6IFwibGlua3NcIiwgbGlua3MgfSkpO1xuICAgIH0pO1xuICB9O1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzaXplLndpZHRoKSBsb2FkKDApO1xuICAgIC8vIE9uY2UsIHdoZW4gdGhlIHdpbmRvdyBzaXplIGlzIGtub3duLlxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3NpemUud2lkdGggPiAwXSk7XG5cbiAgY29uc3QgYXJyYW5nZUFsbCA9ICgpID0+IHtcbiAgICBjb25zdCB0byA9IGFycmFuZ2UobGF0ZXN0LmN1cnJlbnQuZ3JhcGgpO1xuICAgIHNldEdsaWRpbmcodHJ1ZSk7XG4gICAgLy8gQSBmcmFtZSBsYXRlciwgc28gdGhlIGNhcmRzIGhvbGQgYHRyYW5zaXRpb246IHsgbGF5b3V0IH1gIGJlZm9yZVxuICAgIC8vIHRoZWlyIHJlY3RzIGNoYW5nZS5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJtb3ZlXCIsIHRvIH0pO1xuICAgICAgY29uc3QgcGxhY2VkID0gbGl2ZShsYXRlc3QuY3VycmVudC5ncmFwaCkubWFwKChuKSA9PiAoe1xuICAgICAgICAuLi5uLFxuICAgICAgICAuLi50b1tuLmlkXSxcbiAgICAgIH0pKTtcbiAgICAgIGNvbnN0IHYgPSBmcmFtaW5nKHBsYWNlZCwgNzAwKTtcbiAgICAgIGlmICh2KSBzZXRWaWV3KHYpO1xuICAgIH0sIDQwKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHNldEdsaWRpbmcoZmFsc2UpLCAxNDAwKTtcbiAgfTtcblxuICBjb25zdCBhZGQgPSAoazogS2luZCwgeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB7IHZpZXcgfSA9IGxhdGVzdC5jdXJyZW50O1xuICAgIGRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IFwiYWRkXCIsXG4gICAgICBraW5kOiBrLFxuICAgICAgeDogKHggLSB2aWV3LngpIC8gdmlldy56b29tLFxuICAgICAgeTogKHkgLSB2aWV3LnkpIC8gdmlldy56b29tLFxuICAgICAgc2VsZWN0OiB0cnVlLFxuICAgIH0pO1xuICB9O1xuICAvLyBNaWQtdmlldywgZWFjaCBjbGljayBhIGxpdHRsZSBmdXJ0aGVyIGFsb25nIHNvIHRoZXkgZG9uJ3Qgc3RhY2suXG4gIGNvbnN0IG51ZGdlID0gdXNlUmVmKDApO1xuICBjb25zdCBhZGRNaWQgPSAoazogS2luZCkgPT4ge1xuICAgIGNvbnN0IHsgc2l6ZSB9ID0gbGF0ZXN0LmN1cnJlbnQ7XG4gICAgY29uc3QgbiA9IG51ZGdlLmN1cnJlbnQrKyAlIDY7XG4gICAgY29uc3QgY3ggPSBJTlNFVC5sZWZ0ICsgKHNpemUud2lkdGggLSBJTlNFVC5sZWZ0IC0gSU5TRVQucmlnaHQpIC8gMjtcbiAgICBjb25zdCBjeSA9IElOU0VULnRvcCArIChzaXplLmhlaWdodCAtIElOU0VULnRvcCAtIElOU0VULmJvdHRvbSkgLyAyO1xuICAgIGNvbnN0IHsgdmlldyB9ID0gbGF0ZXN0LmN1cnJlbnQ7XG4gICAgYWRkKFxuICAgICAgayxcbiAgICAgIGN4IC0gKEtJTkRTW2tdLndpZHRoIC8gMikgKiB2aWV3Lnpvb20gKyBuICogMjYsXG4gICAgICBjeSAtIChjYXJkSGVpZ2h0KGspIC8gMikgKiB2aWV3Lnpvb20gKyBuICogMjYsXG4gICAgKTtcbiAgfTtcblxuICAvLyBTaG9ydGN1dHMuIFRoZSBBZGQgbWVudSB0YWtlcyB0aGUga2V5Ym9hcmQgd2hpbGUgaXQgaXMgb3Blbi5cbiAgdXNlRWZmZWN0KFxuICAgICgpID0+XG4gICAgICBiZXZ5Lm9uKFwia2V5RG93blwiLCAoZSkgPT4ge1xuICAgICAgICBpZiAoZS5yZXBlYXQgfHwgbWVudU9wZW4oKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB7IGdyYXBoIH0gPSBsYXRlc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgY3RybCA9IGUuY3RybEtleSB8fCBlLm1ldGFLZXk7XG4gICAgICAgIGlmIChjdHJsICYmIGUuY29kZSA9PT0gXCJLZXlBXCIpXG4gICAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcInNlbGVjdFwiLCBpZHM6IGxpdmUoZ3JhcGgpLm1hcCgobikgPT4gbi5pZCkgfSk7XG4gICAgICAgIGVsc2UgaWYgKGN0cmwgJiYgZS5jb2RlID09PSBcIktleURcIikgZGlzcGF0Y2goeyB0eXBlOiBcImR1cGxpY2F0ZVwiIH0pO1xuICAgICAgICBlbHNlIGlmIChjdHJsKSByZXR1cm47XG4gICAgICAgIGVsc2UgaWYgKGUuY29kZSA9PT0gXCJTcGFjZVwiKSBzZXRQbGF5aW5nKChwKSA9PiAhcCk7XG4gICAgICAgIGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlGXCIpIGZpdCgpO1xuICAgICAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5TFwiKSBhcnJhbmdlQWxsKCk7XG4gICAgICAgIGVsc2UgaWYgKFtcIkRlbGV0ZVwiLCBcIkJhY2tzcGFjZVwiLCBcIktleVhcIl0uaW5jbHVkZXMoZS5jb2RlKSkge1xuICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJkZWxldGVcIiwgaWRzOiBncmFwaC5zZWxlY3RlZCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmNvZGUgPT09IFwiRXNjYXBlXCIpIGRpc3BhdGNoKHsgdHlwZTogXCJzZWxlY3RcIiwgaWRzOiBbXSB9KTtcbiAgICAgIH0pLFxuICAgIC8vIFJlYWRzIGV2ZXJ5dGhpbmcgdGhyb3VnaCBgbGF0ZXN0YC5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gICAgW10sXG4gICk7XG5cbiAgLy8gVyBBIFMgRDogQmV2eSByZXBvcnRzIHdoYXQgdGhlIGhlbGQga2V5cyBwYW4gZWFjaCBmcmFtZSAoYHZpZXcucnNgKTtcbiAgLy8gYSBzaG9ydCBnbGlkZSBzbW9vdGhzIG92ZXIgZnJhbWVzIHRoZSBtZXNzYWdlIGxhbmRzIGxhdGUuXG4gIHVzZUV2ZW50KFwidmlldy5wYW5cIiwgKHsgeCwgeSB9KSA9PiB7XG4gICAgaWYgKG1lbnVPcGVuKCkpIHJldHVybjtcbiAgICBzZXRWaWV3KCh2KSA9PiAoeyAuLi52LCB4OiB2LnggKyB4LCB5OiB2LnkgKyB5LCBnbGlkZTogOTAgfSkpO1xuICB9KTtcblxuICAvLyBgLS1zaG9vdGAgdmVyYnMgKHNlZSBzaG9vdC5ycykuXG4gIHVzZURlYnVnKFwicHJlc2V0XCIsIChbaV0pID0+IGxvYWQoTnVtYmVyKGkpKSk7XG4gIHVzZURlYnVnKFwicGxheVwiLCAoKSA9PiBzZXRQbGF5aW5nKHRydWUpKTtcbiAgdXNlRGVidWcoXCJwYXVzZVwiLCAoKSA9PiBzZXRQbGF5aW5nKGZhbHNlKSk7XG4gIHVzZURlYnVnKFwiZml0XCIsIGZpdCk7XG4gIHVzZURlYnVnKFwiYXJyYW5nZVwiLCBhcnJhbmdlQWxsKTtcbiAgdXNlRGVidWcoXCJhZGRcIiwgKFtrLCB4LCB5XSkgPT4gYWRkKGsgYXMgS2luZCwgTnVtYmVyKHgpLCBOdW1iZXIoeSkpKTtcbiAgdXNlRGVidWcoXCJ2aWV3XCIsIChbeCwgeSwgel0pID0+XG4gICAgc2V0Vmlldyh7IHg6IE51bWJlcih4KSwgeTogTnVtYmVyKHkpLCB6b29tOiBOdW1iZXIoeiksIGdsaWRlOiA0MDAgfSksXG4gICk7XG4gIHVzZURlYnVnKFwic2VsZWN0XCIsIChuYW1lcykgPT4ge1xuICAgIGNvbnN0IGlkcyA9IGxpdmUobGF0ZXN0LmN1cnJlbnQuZ3JhcGgpXG4gICAgICAuZmlsdGVyKChuKSA9PiBuYW1lcy5pbmNsdWRlcyhuLmlkLnNwbGl0KFwiflwiKVswXSkpXG4gICAgICAubWFwKChuKSA9PiBuLmlkKTtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IFwic2VsZWN0XCIsIGlkcyB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIChcbiAgICA8TGl2ZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e2N0eH0+XG4gICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIgfX0+XG4gICAgICAgIDxDYW52YXNcbiAgICAgICAgICBncmFwaD17Z3JhcGh9XG4gICAgICAgICAgZGlzcGF0Y2g9e2Rpc3BhdGNofVxuICAgICAgICAgIHZpZXc9e3ZpZXd9XG4gICAgICAgICAgc2V0Vmlldz17c2V0Vmlld31cbiAgICAgICAgICBnbGlkaW5nPXtnbGlkaW5nfVxuICAgICAgICAgIHBsYXlpbmc9e3BsYXlpbmd9XG4gICAgICAgIC8+XG4gICAgICAgIDxQYWxldHRlIG9uQWRkPXthZGRNaWR9IG9uRHJvcD17KGssIHgsIHkpID0+IGFkZChrLCB4IC0gMjAsIHkgLSAxOCl9IC8+XG4gICAgICAgIDxUb3BCYXJcbiAgICAgICAgICBwcmVzZXRzPXtQUkVTRVRTfVxuICAgICAgICAgIHByZXNldD17cHJlc2V0fVxuICAgICAgICAgIG9uUHJlc2V0PXtsb2FkfVxuICAgICAgICAgIHBsYXlpbmc9e3BsYXlpbmd9XG4gICAgICAgICAgb25QbGF5PXsoKSA9PiBzZXRQbGF5aW5nKChwKSA9PiAhcCl9XG4gICAgICAgICAgYnBtPXticG19XG4gICAgICAgICAgb25CcG09e3NldEJwbX1cbiAgICAgICAgICB6b29tPXt2aWV3Lnpvb219XG4gICAgICAgICAgb25BcnJhbmdlPXthcnJhbmdlQWxsfVxuICAgICAgICAgIG9uRml0PXtmaXR9XG4gICAgICAgIC8+XG4gICAgICAgIDxNaW5pbWFwXG4gICAgICAgICAgZ3JhcGg9e2dyYXBofVxuICAgICAgICAgIHZpZXc9e3ZpZXd9XG4gICAgICAgICAgc2l6ZT17c2l6ZX1cbiAgICAgICAgICBvbkNlbnRlcj17KHgsIHksIGdsaWRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHZpZXcsIHNpemUgfSA9IGxhdGVzdC5jdXJyZW50O1xuICAgICAgICAgICAgc2V0Vmlldyh7XG4gICAgICAgICAgICAgIC4uLnZpZXcsXG4gICAgICAgICAgICAgIHg6IHNpemUud2lkdGggLyAyIC0geCAqIHZpZXcuem9vbSxcbiAgICAgICAgICAgICAgeTogc2l6ZS5oZWlnaHQgLyAyIC0geSAqIHZpZXcuem9vbSxcbiAgICAgICAgICAgICAgZ2xpZGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgICA8SGludHMgLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8L0xpdmVDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufVxuIiwgIi8vIEBnZW5lcmF0ZWQgYnkgYmV2eS1yZWFjdCDigJQgZG8gbm90IGVkaXQgYnkgaGFuZC5cbi8vIE1pcnJvcnMgdGhlIFJ1c3QgYCNbcmVhY3RfbWVzc2FnZV1gIC8gYCNbcmVhY3RfcmVxdWVzdF1gIC8gYCNbcmVhY3RfZXZlbnRdYFxuLy8gdHlwZXMgYW5kIHRoZSByZWdpc3RlcmVkIGAjW3JlYWN0X2ZpbHRlcl1gcyAvIGAjW3JlYWN0X21vcnBoX2ZpbHRlcl1gcyAocGx1c1xuLy8gYnVpbHQtaW5zKS4gUmVnZW5lcmF0ZSB2aWEgeW91ciBhcHAncyBgQXBwOjpleHBvcnRfcmVhY3RfdHlwZXNjcmlwdGAgZXhwb3J0ZXIuXG5cbmltcG9ydCB7XG4gIGVtaXQgYXMgcmF3RW1pdCxcbiAgcmVxdWVzdCBhcyByYXdSZXF1ZXN0LFxuICBhZGRFdmVudExpc3RlbmVyIGFzIHJhd0FkZEV2ZW50TGlzdGVuZXIsXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIgYXMgcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcixcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEFuaW1hdGFibGUsIEJldnlBdHRyaWJ1dGVzLCBCZXZ5Rm9jdXNQcm9wcywgQmV2eVBvaW50ZXJQcm9wcywgQmV2eVNjcm9sbFByb3BzLCBCZXZ5U2hhcGVUcmFuc2l0aW9uLCBCZXZ5U3R5bGUsIEJldnlWYXJpYW50UHJvcHMsIEJldnlXaGVlbFByb3BzIH0gZnJvbSBcImJldnktcmVhY3RcIjtcblxuZXhwb3J0IHR5cGUgQWN0ID0geyBhY3Rpb246IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIEJsb29tUGFyYW1zID0geyByYWRpdXM6IG51bWJlciB8IHN0cmluZywgdGhyZXNob2xkOiBudW1iZXIsIGludGVuc2l0eTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQmx1clBhcmFtcyA9IHsgcmFkaXVzOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBCcmlnaHRuZXNzUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENhYmxlID0geyBmcm9tOiBKYWNrLCB0bzogSmFjaywgfTtcbmV4cG9ydCB0eXBlIENocm9tYXRpY0FiZXJyYXRpb25QYXJhbXMgPSB7IG9mZnNldDogbnVtYmVyIHwgc3RyaW5nLCBhbmdsZTogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogVGFuZ2VudGlhbCBzd2lybDogdGhlIFIgaW1hZ2Ugcm90YXRlcyBieSBgK3JvdGF0aW9uYCBkZWdyZWVzXG4gKiAoY2xvY2t3aXNlLCB5LWRvd24pIGFyb3VuZCB0aGUgbm9kZSdzIGNlbnRlciwgQiBieSBgLXJvdGF0aW9uYC5cbiAqIFBsYWluIG51bWJlciBpbiBkZWdyZWVzIOKAlCBhIHNjYWxhciBtYWduaXR1ZGUsIHNvIHRyYW5zaXRpb25zIHVud2luZFxuICogbGluZWFybHkgdGhyb3VnaCBldmVyeSB0dXJuLiAwID0gcHVyZWx5IGRpcmVjdGlvbmFsIHNwbGl0LlxuICovXG5yb3RhdGlvbjogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ29udHJhc3RQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ3Jvc3NmYWRlUGFyYW1zID0geyBcbi8qKlxuICogMC4uMSBzdGFnZ2VyIGFtb3VudDsgMCBpcyB0aGUgcGxhaW4gdW5pZm9ybSBjcm9zc2ZhZGUuXG4gKi9cbnNwcmVhZDogbnVtYmVyLCBcbi8qKlxuICogTm9pc2UgZmVhdHVyZSBzaXplIGluIGxvZ2ljYWwgcHguXG4gKi9cbnNjYWxlOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiAwLi4xIGxvY2FsIGZhZGUgd2luZG93IChmcmFjdGlvbiBvZiB0aGUgcHJvZ3Jlc3MgcmFuZ2UpLlxuICovXG5zb2Z0bmVzczogbnVtYmVyLCBcbi8qKlxuICogUmUtcm9sbHMgdGhlIG5vaXNlIHBhdHRlcm4gKGRvbWFpbiBvZmZzZXQpLlxuICovXG5zZWVkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBEcmFnID0geyBcbi8qKlxuICogVGhlIHNvY2tldCBpdCBjb21lcyBvdXQgb2YuXG4gKi9cbmZyb206IHN0cmluZywgXG4vKipcbiAqIFdoZXRoZXIgYGZyb21gIGlzIGFuIG91dHB1dCAodGhlIGZyZWUgZW5kIGlzIHRoZW4gdGhlIGlucHV0IGVuZCkuXG4gKi9cbm91dHB1dDogYm9vbGVhbiwgXG4vKipcbiAqIFRoZSBzb2NrZXQgdGhlIGZyZWUgZW5kIHNuYXBwZWQgdG8uXG4gKi9cbnRvOiBzdHJpbmcgfCBudWxsLCBcbi8qKlxuICogV2hlcmUgdGhlIGZyZWUgZW5kIHJlc3RzIGluc3RlYWQgb2YgdGhlIHBvaW50ZXIgKGxvZ2ljYWwgcHgpLCB3aGlsZVxuICogYSBtZW51IHBpY2tzIHdoYXQgdG8gY29ubmVjdCBpdCB0by5cbiAqL1xuYXQ6IFtudW1iZXIsIG51bWJlcl0gfCBudWxsLCBzaWduYWw6IFNpZ25hbCwgY29sb3I6IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRBeGlzQ2hhbmdlID0geyBnYW1lcGFkOiBudW1iZXIsIGF4aXM6IEdhbWVwYWRBeGlzTmFtZSwgdmFsdWU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRBeGlzTmFtZSA9IFwibGVmdFN0aWNrWFwiIHwgXCJsZWZ0U3RpY2tZXCIgfCBcImxlZnRaXCIgfCBcInJpZ2h0U3RpY2tYXCIgfCBcInJpZ2h0U3RpY2tZXCIgfCBcInJpZ2h0WlwiIHwgeyBcIm90aGVyXCI6IG51bWJlciB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEJ1dHRvbkNoYW5nZSA9IHsgZ2FtZXBhZDogbnVtYmVyLCBidXR0b246IEdhbWVwYWRCdXR0b25OYW1lLCBcbi8qKlxuICogRGlnaXRhbCBzdGF0ZSBhZnRlciB0aGUgY2hhbmdlICh0aHJlc2hvbGRzIGZyb20gYEdhbWVwYWRTZXR0aW5nc2ApLlxuICovXG5wcmVzc2VkOiBib29sZWFuLCBcbi8qKlxuICogQW5hbG9nIHZhbHVlIGluIGAwLjAuLj0xLjBgICh0cmlnZ2VycyByZXBvcnQgdGhlIGZ1bGwgcmFuZ2UpLlxuICovXG52YWx1ZTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEJ1dHRvbk5hbWUgPSBcInNvdXRoXCIgfCBcImVhc3RcIiB8IFwibm9ydGhcIiB8IFwid2VzdFwiIHwgXCJjXCIgfCBcInpcIiB8IFwibGVmdFRyaWdnZXJcIiB8IFwibGVmdFRyaWdnZXIyXCIgfCBcInJpZ2h0VHJpZ2dlclwiIHwgXCJyaWdodFRyaWdnZXIyXCIgfCBcInNlbGVjdFwiIHwgXCJzdGFydFwiIHwgXCJtb2RlXCIgfCBcImxlZnRUaHVtYlwiIHwgXCJyaWdodFRodW1iXCIgfCBcImRQYWRVcFwiIHwgXCJkUGFkRG93blwiIHwgXCJkUGFkTGVmdFwiIHwgXCJkUGFkUmlnaHRcIiB8IHsgXCJvdGhlclwiOiBudW1iZXIgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRDb25uZWN0ZWQgPSBHYW1lcGFkQ29ubmVjdGVkRGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRDb25uZWN0ZWREYXRhID0geyBcbi8qKlxuICogTW9ub3RvbmljIHdpcmUgaWQg4oCUIG5ldmVyIHJldXNlZCBhY3Jvc3MgcmVjb25uZWN0cy5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCBcbi8qKlxuICogT1MtcHJvdmlkZWQgZGV2aWNlIG5hbWUuXG4gKi9cbm5hbWU6IHN0cmluZywgXG4vKipcbiAqIFVTQiB2ZW5kb3IgaWQsIHdoZW4gdGhlIGJhY2tlbmQga25vd3MgaXQuXG4gKi9cbnZlbmRvcklkOiBudW1iZXIgfCBudWxsLCBcbi8qKlxuICogVVNCIHByb2R1Y3QgaWQsIHdoZW4gdGhlIGJhY2tlbmQga25vd3MgaXQuXG4gKi9cbnByb2R1Y3RJZDogbnVtYmVyIHwgbnVsbCwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWREaXNjb25uZWN0ZWQgPSBHYW1lcGFkRGlzY29ubmVjdGVkRGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWREaXNjb25uZWN0ZWREYXRhID0geyBcbi8qKlxuICogVGhlIHdpcmUgaWQgdGhlIHBhZCB3YXMgYW5ub3VuY2VkIHVuZGVyLiBSZXRpcmVkIGZvciBnb29kLlxuICovXG5nYW1lcGFkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkSW5wdXREYXRhID0geyBidXR0b25zOiBBcnJheTxHYW1lcGFkQnV0dG9uQ2hhbmdlPiwgYXhlczogQXJyYXk8R2FtZXBhZEF4aXNDaGFuZ2U+LCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZElucHV0RXZlbnQgPSBHYW1lcGFkSW5wdXREYXRhO1xuZXhwb3J0IHR5cGUgR2FtZXBhZFJ1bWJsZSA9IHsgXG4vKipcbiAqIFdpcmUgaWQgZnJvbSBbYEdhbWVwYWRDb25uZWN0ZWRgXS5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCBcbi8qKlxuICogTWlsbGlzZWNvbmRzICh3ZWItYHBsYXlFZmZlY3RgLWxpa2UpLiBOZWdhdGl2ZSB2YWx1ZXMgY2xhbXAgdG8gMC5cbiAqL1xuZHVyYXRpb246IG51bWJlciwgXG4vKipcbiAqIExvdy1mcmVxdWVuY3kgbW90b3IgaW50ZW5zaXR5LCBjbGFtcGVkIHRvIGAwLjAuLj0xLjBgLlxuICovXG5zdHJvbmdNb3RvcjogbnVtYmVyLCBcbi8qKlxuICogSGlnaC1mcmVxdWVuY3kgbW90b3IgaW50ZW5zaXR5LCBjbGFtcGVkIHRvIGAwLjAuLj0xLjBgLlxuICovXG53ZWFrTW90b3I6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRTdG9wUnVtYmxlID0geyBnYW1lcGFkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHcmFkaWVudE1hcFBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc3RvcHM6IEFycmF5PEdyYWRpZW50TWFwU3RvcD4sIGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR3JhZGllbnRNYXBTdG9wID0geyBjb2xvcjogc3RyaW5nLCBwb3NpdGlvbj86IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYXlzY2FsZVBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBIdWVSb3RhdGVQYXJhbXMgPSB7IGFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBJbnZlcnRQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgSmFjayA9IHsgbm9kZTogc3RyaW5nLCBwb3J0OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBLZXlEb3duID0gS2V5Ym9hcmRFdmVudERhdGE7XG5leHBvcnQgdHlwZSBLZXlVcCA9IEtleWJvYXJkRXZlbnREYXRhO1xuZXhwb3J0IHR5cGUgS2V5Ym9hcmRFdmVudERhdGEgPSB7IFxuLyoqXG4gKiBMYXlvdXQtYXdhcmUgbG9naWNhbCBrZXk6IHRoZSB0eXBlZCBjaGFyYWN0ZXIgKGBcImFcImAsIGBcIkFcImApIG9yIGEgbmFtZWRcbiAqIGtleSAoYFwiRW50ZXJcImAsIGBcIkFycm93TGVmdFwiYCwgYFwiRXNjYXBlXCJgKS5cbiAqL1xua2V5OiBzdHJpbmcsIFxuLyoqXG4gKiBMYXlvdXQtaW5kZXBlbmRlbnQgcGh5c2ljYWwga2V5LCBXM0MgYGNvZGVgIHN0eWxlIChgXCJLZXlBXCJgLCBgXCJFbnRlclwiYCkuXG4gKi9cbmNvZGU6IHN0cmluZywgXG4vKipcbiAqIFRoZSB0ZXh0IHByb2R1Y2VkIGJ5IHRoZSBrZXksIGlmIGFueSAocmVzcGVjdHMgbW9kaWZpZXJzL0lNRSkuIGBudWxsYCBmb3JcbiAqIGtleXMgdGhhdCBkb24ndCBwcm9kdWNlIHRleHQgKGUuZy4gYXJyb3dzLCBtb2RpZmllcnMpLlxuICovXG50ZXh0OiBzdHJpbmcgfCBudWxsLCBcbi8qKlxuICogV2hldGhlciB0aGlzIGlzIGFuIE9TIGF1dG8tcmVwZWF0IHdoaWxlIHRoZSBrZXkgaXMgaGVsZC5cbiAqL1xucmVwZWF0OiBib29sZWFuLCBjdHJsS2V5OiBib29sZWFuLCBzaGlmdEtleTogYm9vbGVhbiwgYWx0S2V5OiBib29sZWFuLCBcbi8qKlxuICogVGhlIFwiTWV0YVwiL1wiU3VwZXJcIiBrZXkgKFdpbmRvd3MvQ29tbWFuZCkuXG4gKi9cbm1ldGFLZXk6IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBLaW5kID0gXCJjbG9ja1wiIHwgXCJzZXF1ZW5jZXJcIiB8IFwiYmVhdFwiIHwgXCJvc2NpbGxhdG9yXCIgfCBcIm5vaXNlXCIgfCBcImxmb1wiIHwgXCJkcnVtXCIgfCBcImVudmVsb3BlXCIgfCBcImZpbHRlclwiIHwgXCJ2Y2FcIiB8IFwiZ2xpZGVcIiB8IFwibWl4ZXJcIiB8IFwiZGVsYXlcIiB8IFwicmV2ZXJiXCIgfCBcIm91dHB1dFwiO1xuZXhwb3J0IHR5cGUgTGluZWFyV2lwZVBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc29mdG5lc3M6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIE1vZHVsZSA9IHsgaWQ6IHN0cmluZywga2luZDogS2luZCwgXG4vKipcbiAqIFRoZSBjYXRhbG9nJ3MgcGFyYW1zIGJ5IG5hbWU7IHRoZSBlbmdpbmUgcmVhZHMgdGhlIG9uZXMgaXQga25vd3MuXG4gKi9cbnBhcmFtczogeyBba2V5IGluIHN0cmluZ10/OiBudW1iZXIgfSwgfTtcbmV4cG9ydCB0eXBlIE91dGxpbmVQYXJhbXMgPSB7IHdpZHRoOiBudW1iZXIgfCBzdHJpbmcsIGNvbG9yOiBzdHJpbmcsIHNvZnRuZXNzOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBQYW5WaWV3ID0geyB4OiBudW1iZXIsIHk6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFBpbmNoUGFyYW1zID0geyBcbi8qKlxuICogUGluY2ggY2VudGVyLCAwLi4xIGFjcm9zcyB0aGUgbm9kZSByZWN0ICgwID0gbGVmdCBlZGdlKS5cbiAqL1xueDogbnVtYmVyLCBcbi8qKlxuICogUGluY2ggY2VudGVyLCAwLi4xIGFjcm9zcyB0aGUgbm9kZSByZWN0ICgwID0gdG9wIGVkZ2UpLlxuICovXG55OiBudW1iZXIsIFxuLyoqXG4gKiAtMSAoZnVsbCBidWxnZSkgLi49IDEgKGZ1bGwgcGluY2gpOyAwIGlzIGlkZW50aXR5LlxuICovXG5zdHJlbmd0aDogbnVtYmVyLCBcbi8qKlxuICogRWZmZWN0IHJhZGl1cyBhcyBhIGZyYWN0aW9uIG9mIHRoZSBub2RlJ3MgbGFyZ2VyIGRpbWVuc2lvbi5cbiAqL1xucmFkaXVzOiBudW1iZXIsIFxuLyoqXG4gKiBEaWZmdXNlIHNoYWRpbmcgaW50ZW5zaXR5OiAwICh1bmxpdCwgdGhlIGRlZmF1bHQpLCAxIG5vbWluYWw7IGxhcmdlclxuICogdmFsdWVzIG92ZXJkcml2ZSwgbGlrZSBgYnJpZ2h0bmVzc2AuXG4gKi9cbmxpZ2h0OiBudW1iZXIsIFxuLyoqXG4gKiBEaXJlY3Rpb24gdGhlIGxpZ2h0IGNvbWVzIEZST006IGRlZ3JlZXMgY2xvY2t3aXNlIGZyb20gK1ggaW4gc2NyZWVuXG4gKiBzcGFjZSAoYmFyZSBudW1iZXIgPSBkZWdyZWVzLCBgXCIwLjI1dHVyblwiYCBldGMuIGFjY2VwdGVkKS4gRGVmYXVsdFxuICogLTEzNSA9IHRvcC1sZWZ0LlxuICovXG5saWdodEFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiBTcGVjdWxhciAod2hpdGUpIGhpZ2hsaWdodCBpbnRlbnNpdHk6IDAgKG9mZiwgdGhlIGRlZmF1bHQpLCAxXG4gKiBub21pbmFsOyBsYXJnZXIgdmFsdWVzIG92ZXJkcml2ZS5cbiAqL1xuZ2xvc3M6IG51bWJlciwgXG4vKipcbiAqIFNpemUgb2YgdGhlIHNwZWN1bGFyIGhpZ2hsaWdodCwgMCAoYSBwaW5wb2ludCkgLi49IDEgKGEgYnJvYWQgc2hlZW4pO1xuICogZGVmYXVsdCAwLjMuIE1hcHBlZCBsb2ctd2lzZSBvbnRvIGEgQmxpbm4tUGhvbmcgZXhwb25lbnQgaW4gdGhlIHNoYWRlclxuICogKDEyOCBhdCAwLCB+MzIgYXQgMC4zLCAxIGF0IDEpLlxuICovXG5nbG9zc1NpemU6IG51bWJlciwgXG4vKipcbiAqIEhvdyB0aGUgZWZmZWN0IG1lZXRzIGl0cyByaW0sIDAuLj0xOiAwIGlzIGEgbGluZWFyIG9uc2V0IChhIHZpc2libGVcbiAqIGNyZWFzZSwgbGlrZSBhIHByZXNzZWQgY29pbiBlZGdlKSwgMC41ICh0aGUgZGVmYXVsdCkgdGhlIGNsYXNzaWMgYHVeMmBcbiAqIHNtb290aHN0ZXAtbGlrZSBmYWRlLCAxIGFuIGltcGVyY2VwdGlibGUgYHVeNGAgZmFkZS1pbi5cbiAqL1xub3V0ZXJTb2Z0bmVzczogbnVtYmVyLCBcbi8qKlxuICogSG93IHRoZSBlZmZlY3QgcGVha3MgYXQgaXRzIGNlbnRlciwgMC4uPTE6IDAgaXMgYSBjb25lIHRpcCAoYSBwb2ludGVkXG4gKiBwaXQvcGVhayB0aGUgbGlnaHRpbmcgc2hvd3MgYXMgYSBwb2ludCksIDAuNSAodGhlIGRlZmF1bHQpIGEgcm91bmRlZFxuICogYm93bCwgMSBhIGJyb2FkIGZsYXQgZmxvb3IuIEluZGVwZW5kZW50IG9mIGBvdXRlclNvZnRuZXNzYDogdGhlXG4gKiBwcm9maWxlIGlzIGAxIC0gKDEgLSB1XmEpXmJgIHdpdGggYGFgL2BiYCBmcm9tIHRoZSB0d28ga25vYnMuXG4gKi9cbmlubmVyU29mdG5lc3M6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFBpeGVsaXplUGFyYW1zID0geyBcbi8qKlxuICogQ2VsbHMgYWNyb3NzIHgveSBhdCB0aGUgbW9zYWljJ3MgY29hcnNlc3QgKHVwc3RyZWFtIGBzcXVhcmVzTWluYCkuXG4gKi9cbnNxdWFyZXNNaW46IFtudW1iZXIsIG51bWJlcl0sIFxuLyoqXG4gKiBEaXNjcmV0ZSBjZWxsLXNpemUgbGV2ZWxzOyBgPD0gMGAgZm9yIGEgY29udGludW91cyByYW1wLlxuICovXG5zdGVwczogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgUmVzaXplID0gV2luZG93U2l6ZTtcbmV4cG9ydCB0eXBlIFNhdHVyYXRlUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNlcGlhUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNldFBhdGNoID0geyB3aXJlczogQXJyYXk8V2lyZT4sIGRyYWc6IERyYWcgfCBudWxsLCBcbi8qKlxuICogU2lnbmFscyBmbG93IGFsb25nIHRoZSB3aXJlcyB3aGlsZSB0aGUgdHJhbnNwb3J0IHBsYXlzLlxuICovXG5wbGF5aW5nOiBib29sZWFuLCB9O1xuZXhwb3J0IHR5cGUgU2V0U3ludGggPSB7IG1vZHVsZXM6IEFycmF5PE1vZHVsZT4sIGNhYmxlczogQXJyYXk8Q2FibGU+LCBwbGF5aW5nOiBib29sZWFuLCBicG06IG51bWJlciwgXG4vKipcbiAqIFRoZSBzaGFyZWQgdmFsdWUgUmVhY3QncyBzdGVwIGxpZ2h0cyByZWFkIChpdHMgYHN0ZXBzLmlkYCk6IEJldnlcbiAqIGRyaXZlcyBpdCBmcm9tIHRoZSBzb3VuZC5cbiAqL1xubGlnaHRzOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBTZXRWaWV3ID0geyB4OiBudW1iZXIsIHk6IG51bWJlciwgem9vbTogbnVtYmVyLCBcbi8qKlxuICogSG93IGxvbmcgdGhlIGdsaWRlIHRha2VzLCBtczsgYDBgIHNuYXBzIChhIGRyYWcgcGFucyB3aXRoIHRoZSBoYW5kKS5cbiAqL1xuZ2xpZGU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNoYWRvd1BhcmFtcyA9IHsgY29sb3I6IHN0cmluZywgb2Zmc2V0WDogbnVtYmVyIHwgc3RyaW5nLCBvZmZzZXRZOiBudW1iZXIgfCBzdHJpbmcsIHNwcmVhZDogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgU2lnbmFsID0gXCJhdWRpb1wiIHwgXCJjdlwiIHwgXCJnYXRlXCI7XG5leHBvcnQgdHlwZSBTcG90bGlnaHQgPSB7IFxuLyoqXG4gKiBMaWdodCBjb2xvciwgYW55IENTUyBjb2xvciAoZGVmYXVsdCB3aGl0ZSkuXG4gKi9cbmNvbG9yPzogc3RyaW5nLCBcbi8qKlxuICogSG93IGZhciBmcm9tIHRoZSBwb2ludGVyIHRoZSBsaWdodCByZWFjaGVzIChkZWZhdWx0IGAyNjBgKS5cbiAqL1xucmVhY2g/OiBudW1iZXIsIFxuLyoqXG4gKiBXaWR0aCBvZiB0aGUgbGl0IGVkZ2UgcmluZyBhbG9uZyB0aGUgbm9kZSdzIHJvdW5kZWQgYm9yZGVyXG4gKiAoZGVmYXVsdCBgMGAgPSBubyBlZGdlKS5cbiAqL1xuZWRnZT86IG51bWJlciwgXG4vKipcbiAqIFN0cmVuZ3RoIG9mIHRoZSBzb2Z0IGxpZ2h0IHBvb2wgb24gdGhlIG5vZGUncyBzdXJmYWNlLCBgMC4uMWBcbiAqIChkZWZhdWx0IGAwYCkuXG4gKi9cbndhc2g/OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBXaW5kb3dTaXplID0geyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFdpcmUgPSB7IGlkOiBzdHJpbmcsIGZyb206IHN0cmluZywgdG86IHN0cmluZywgc2lnbmFsOiBTaWduYWwsIFxuLyoqXG4gKiBBbnkgQ1NTIGNvbG9yLlxuICovXG5jb2xvcjogc3RyaW5nLCBcbi8qKlxuICogT24gYSBzZWxlY3RlZCBub2RlOiBkcmF3biBob3R0ZXIuXG4gKi9cbmhvdDogYm9vbGVhbiwgfTtcblxuLyoqIEV2ZXJ5IGBlbWl0YCBuYW1lIGFuZCB0aGUgcGF5bG9hZCB0eXBlIGl0IGNhcnJpZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYWN0TWVzc2FnZXMge1xuICBcImdhbWVwYWQucnVtYmxlXCI6IEdhbWVwYWRSdW1ibGU7XG4gIFwiZ2FtZXBhZC5zdG9wUnVtYmxlXCI6IEdhbWVwYWRTdG9wUnVtYmxlO1xuICBcInBhdGNoLnNldFwiOiBTZXRQYXRjaDtcbiAgXCJzeW50aC5zZXRcIjogU2V0U3ludGg7XG4gIFwidmlldy5zZXRcIjogU2V0Vmlldztcbn1cblxuLyoqIEV2ZXJ5IGByZXF1ZXN0YCBuYW1lIGFuZCBpdHMgcmVxdWVzdC9yZXNwb25zZSB0eXBlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RSZXF1ZXN0cyB7XG4gIFwiZ2FtZXBhZC5nZXRBbGxcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogQXJyYXk8R2FtZXBhZENvbm5lY3RlZERhdGE+IH07XG4gIFwicG9pbnRlci5nZXRcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogW251bWJlciwgbnVtYmVyXSB8IG51bGwgfTtcbiAgXCJ3aW5kb3cuc2l6ZVwiOiB7IHJlcXVlc3Q6IG51bGw7IHJlc3BvbnNlOiBXaW5kb3dTaXplIH07XG59XG5cbi8qKiBFdmVyeSBCZXZ5IOKGkiBSZWFjdCBldmVudCBuYW1lIGFuZCB0aGUgcGF5bG9hZCBpdCBjYXJyaWVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFjdEV2ZW50cyB7XG4gIFwiZGVidWcuYWN0XCI6IEFjdDtcbiAgZ2FtZXBhZENvbm5lY3RlZDogR2FtZXBhZENvbm5lY3RlZDtcbiAgZ2FtZXBhZERpc2Nvbm5lY3RlZDogR2FtZXBhZERpc2Nvbm5lY3RlZDtcbiAgZ2FtZXBhZElucHV0OiBHYW1lcGFkSW5wdXRFdmVudDtcbiAga2V5RG93bjogS2V5RG93bjtcbiAga2V5VXA6IEtleVVwO1xuICByZXNpemU6IFJlc2l6ZTtcbiAgXCJ2aWV3LnBhblwiOiBQYW5WaWV3O1xufVxuXG4vKiogRXZlcnkgcmVnaXN0ZXJlZCBmaWx0ZXIgbmFtZSBhbmQgaXRzIHBhcmFtcyB0eXBlLCBzcGxpdCBieSBmYW1pbHkuXG4gKiAgQXVnbWVudHMgdGhlIGVtcHR5IGBCZXZ5RmlsdGVyc2AgKHJlZ3VsYXIgZmlsdGVycyDigJQgdGhlIGBmaWx0ZXJgIGFuZFxuICogIGBiYWNrZHJvcEZpbHRlcmAgY2hhaW5zKSBhbmQgYEJldnlNb3JwaEZpbHRlcnNgICh0d28taW5wdXQgbW9ycGhcbiAqICBmaWx0ZXJzIOKAlCB0aGUgYG1vcnBoRmlsdGVyYCBzdHlsZSkgcmVnaXN0cnkgaW50ZXJmYWNlcyBpbiB0aGVcbiAqICBgYmV2eS1yZWFjdGAgcGFja2FnZSwgc28gZWFjaCBzdHlsZSBmaWVsZCB0eXBlcyBpdHMgbmFtZXMnIHBhcmFtcy4gKi9cbmRlY2xhcmUgbW9kdWxlIFwiYmV2eS1yZWFjdFwiIHtcbiAgaW50ZXJmYWNlIEJldnlGaWx0ZXJzIHtcbiAgICBibG9vbTogQmxvb21QYXJhbXM7XG4gICAgYmx1cjogQmx1clBhcmFtcztcbiAgICBicmlnaHRuZXNzOiBCcmlnaHRuZXNzUGFyYW1zO1xuICAgIGNocm9tYXRpY0FiZXJyYXRpb246IENocm9tYXRpY0FiZXJyYXRpb25QYXJhbXM7XG4gICAgY29udHJhc3Q6IENvbnRyYXN0UGFyYW1zO1xuICAgIGdyYWRpZW50TWFwOiBHcmFkaWVudE1hcFBhcmFtcztcbiAgICBncmF5c2NhbGU6IEdyYXlzY2FsZVBhcmFtcztcbiAgICBodWVSb3RhdGU6IEh1ZVJvdGF0ZVBhcmFtcztcbiAgICBpbnZlcnQ6IEludmVydFBhcmFtcztcbiAgICBvdXRsaW5lOiBPdXRsaW5lUGFyYW1zO1xuICAgIHBpbmNoOiBQaW5jaFBhcmFtcztcbiAgICBzYXR1cmF0ZTogU2F0dXJhdGVQYXJhbXM7XG4gICAgc2VwaWE6IFNlcGlhUGFyYW1zO1xuICAgIHNoYWRvdzogU2hhZG93UGFyYW1zO1xuICB9XG4gIGludGVyZmFjZSBCZXZ5TW9ycGhGaWx0ZXJzIHtcbiAgICBjcm9zc2ZhZGU6IENyb3NzZmFkZVBhcmFtcztcbiAgICBsaW5lYXJXaXBlOiBMaW5lYXJXaXBlUGFyYW1zO1xuICAgIHBpeGVsaXplOiBQaXhlbGl6ZVBhcmFtcztcbiAgfVxufVxuXG4vKiogVGhlIGFwcCdzIG93biBzdHlsZSBwcm9wZXJ0aWVzIChgYXBwLmFkZF9yZWFjdF9zdHlsZWApLiBBdWdtZW50cyB0aGVcbiAqICBgQmV2eVN0eWxlYCBpbnRlcmZhY2UgaW4gdGhlIGBiZXZ5LXJlYWN0YCBwYWNrYWdlLCBzbyBgc3R5bGVgIChhbmQgdGhlXG4gKiAgaG92ZXIvcHJlc3MvZm9jdXMgdmFyaWFudHMpIHR5cGUgdGhlbS4gKi9cbmRlY2xhcmUgbW9kdWxlIFwiYmV2eS1yZWFjdFwiIHtcbiAgaW50ZXJmYWNlIEJldnlTdHlsZSB7XG4gICAgc3BvdGxpZ2h0PzogU3BvdGxpZ2h0O1xuICB9XG59XG5cbi8qKiBUaGUgYXBwJ3Mgb3duIGVsZW1lbnRzJyBwcm9wcyAoYGFwcC5hZGRfcmVhY3RfZWxlbWVudGApLiAqL1xuZXhwb3J0IGludGVyZmFjZSBCZXZ5Q2lyY2xlUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIGN4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBjeT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcj86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUVsbGlwc2VQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgY3g/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGN5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcnk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlHUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcyB7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlMaW5lUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIHgxPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5MT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgeDI/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHkyPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UGF0aFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBkPzogc3RyaW5nO1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UG9seWdvblByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBwb2ludHM/OiBudW1iZXJbXTtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVBvbHlsaW5lUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIHBvaW50cz86IG51bWJlcltdO1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UmVjdFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICB4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB3aWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgaGVpZ2h0PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcnk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlTdmdQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzLCBCZXZ5Rm9jdXNQcm9wcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICB2aWV3Qm94Pzogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuLyoqIFRoZSBhcHAncyBvd24gZWxlbWVudHMgKGBhcHAuYWRkX3JlYWN0X2VsZW1lbnRgKS4gQXVnbWVudHMgdGhlXG4gKiAgYEJldnlJbnRyaW5zaWNFbGVtZW50c2AgaW50ZXJmYWNlIGluIHRoZSBgYmV2eS1yZWFjdGAgcGFja2FnZSwgc28gSlNYXG4gKiAgdHlwZXMgdGhlbS4gKi9cbmRlY2xhcmUgbW9kdWxlIFwiYmV2eS1yZWFjdFwiIHtcbiAgaW50ZXJmYWNlIEJldnlJbnRyaW5zaWNFbGVtZW50cyB7XG4gICAgY2lyY2xlOiBCZXZ5Q2lyY2xlUHJvcHM7XG4gICAgZWxsaXBzZTogQmV2eUVsbGlwc2VQcm9wcztcbiAgICBnOiBCZXZ5R1Byb3BzO1xuICAgIGxpbmU6IEJldnlMaW5lUHJvcHM7XG4gICAgcGF0aDogQmV2eVBhdGhQcm9wcztcbiAgICBwb2x5Z29uOiBCZXZ5UG9seWdvblByb3BzO1xuICAgIHBvbHlsaW5lOiBCZXZ5UG9seWxpbmVQcm9wcztcbiAgICByZWN0OiBCZXZ5UmVjdFByb3BzO1xuICAgIHN2ZzogQmV2eVN2Z1Byb3BzO1xuICB9XG59XG5cbi8qKiBTZW5kIGEgdHlwZWQgYXBwIG1lc3NhZ2UgdG8gdGhlIEJldnkgc2lkZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbWl0PEsgZXh0ZW5kcyBrZXlvZiBSZWFjdE1lc3NhZ2VzPihuYW1lOiBLLCB2YWx1ZTogUmVhY3RNZXNzYWdlc1tLXSk6IHZvaWQge1xuICByYXdFbWl0KG5hbWUsIHZhbHVlKTtcbn1cblxuLyoqIFNlbmQgYSB0eXBlZCByZXF1ZXN0IGFuZCBhd2FpdCBpdHMgdHlwZWQgcmVzcG9uc2UuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdDxLIGV4dGVuZHMga2V5b2YgUmVhY3RSZXF1ZXN0cz4oXG4gIG5hbWU6IEssXG4gIHZhbHVlOiBSZWFjdFJlcXVlc3RzW0tdW1wicmVxdWVzdFwiXSxcbik6IFByb21pc2U8UmVhY3RSZXF1ZXN0c1tLXVtcInJlc3BvbnNlXCJdPiB7XG4gIHJldHVybiByYXdSZXF1ZXN0KG5hbWUsIHZhbHVlKSBhcyBQcm9taXNlPFJlYWN0UmVxdWVzdHNbS11bXCJyZXNwb25zZVwiXT47XG59XG5cbi8qKiBTdWJzY3JpYmUgdG8gYSB0eXBlZCBCZXZ5IOKGkiBSZWFjdCBldmVudC4gUmV0dXJucyBhbiB1bnN1YnNjcmliZSBmbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbjxLIGV4dGVuZHMga2V5b2YgUmVhY3RFdmVudHM+KFxuICBuYW1lOiBLLFxuICBjYjogKHZhbHVlOiBSZWFjdEV2ZW50c1tLXSkgPT4gdm9pZCxcbik6ICgpID0+IHZvaWQge1xuICByYXdBZGRFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG4gIHJldHVybiAoKSA9PiByYXdSZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG59XG5cbi8qKiBVbnN1YnNjcmliZSBhIGxpc3RlbmVyIHByZXZpb3VzbHkgcGFzc2VkIHRvIGBvbmAvYGFkZEV2ZW50TGlzdGVuZXJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXI8SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgY2I6ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xufVxuXG4vKiogU3RydWN0dXJlZCwgZnVsbHkgdHlwZWQgcHJveHkgb3ZlciBldmVyeSBtZXNzYWdlLCByZXF1ZXN0LCBhbmQgZXZlbnQuICovXG5leHBvcnQgY29uc3QgYmV2eSA9IHtcbiAgZW1pdCxcbiAgcmVxdWVzdCxcbiAgb24sXG4gIGFkZEV2ZW50TGlzdGVuZXI6IG9uLFxuICByZW1vdmVFdmVudExpc3RlbmVyLFxuICBnYW1lcGFkOiB7XG4gICAgZ2V0QWxsKCk6IFByb21pc2U8QXJyYXk8R2FtZXBhZENvbm5lY3RlZERhdGE+PiB7IHJldHVybiByZXF1ZXN0KFwiZ2FtZXBhZC5nZXRBbGxcIiwgbnVsbCk7IH0sXG4gICAgcnVtYmxlKHZhbHVlOiBHYW1lcGFkUnVtYmxlKTogdm9pZCB7IGVtaXQoXCJnYW1lcGFkLnJ1bWJsZVwiLCB2YWx1ZSk7IH0sXG4gICAgc3RvcFJ1bWJsZSh2YWx1ZTogR2FtZXBhZFN0b3BSdW1ibGUpOiB2b2lkIHsgZW1pdChcImdhbWVwYWQuc3RvcFJ1bWJsZVwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIHBhdGNoOiB7XG4gICAgc2V0KHZhbHVlOiBTZXRQYXRjaCk6IHZvaWQgeyBlbWl0KFwicGF0Y2guc2V0XCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgcG9pbnRlcjoge1xuICAgIGdldCgpOiBQcm9taXNlPFtudW1iZXIsIG51bWJlcl0gfCBudWxsPiB7IHJldHVybiByZXF1ZXN0KFwicG9pbnRlci5nZXRcIiwgbnVsbCk7IH0sXG4gIH0sXG4gIHN5bnRoOiB7XG4gICAgc2V0KHZhbHVlOiBTZXRTeW50aCk6IHZvaWQgeyBlbWl0KFwic3ludGguc2V0XCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgdmlldzoge1xuICAgIHNldCh2YWx1ZTogU2V0Vmlldyk6IHZvaWQgeyBlbWl0KFwidmlldy5zZXRcIiwgdmFsdWUpOyB9LFxuICB9LFxuICB3aW5kb3c6IHtcbiAgICBzaXplKCk6IFByb21pc2U8V2luZG93U2l6ZT4geyByZXR1cm4gcmVxdWVzdChcIndpbmRvdy5zaXplXCIsIG51bGwpOyB9LFxuICB9LFxufSBhcyBjb25zdDtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBpbnRlcnBvbGF0ZSwgdXNlU2hhcmVkVmFsdWUsIHdpdGhTcHJpbmcgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBDQVRFR09SSUVTLCB0eXBlIENhdGVnb3J5LCB0eXBlIEtpbmQsIEtJTkRTIH0gZnJvbSBcIi4uL2dyYXBoL2NhdGFsb2dcIjtcbmltcG9ydCB7IEljb24gfSBmcm9tIFwiLi4vZ3JhcGgvTm9kZUNhcmRcIjtcbmltcG9ydCB7IHVzZUxhdGVzdCwgdXNlV2luZG93U2l6ZSB9IGZyb20gXCIuLi9ob29rc1wiO1xuaW1wb3J0IHsgQywgYWxwaGEsIGdsYXNzIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5cbmNvbnN0IFdJRFRIID0gMjQwO1xuY29uc3QgSVRFTSA9IDM0O1xuY29uc3QgSEVBRCA9IDIyO1xuXG4vKiogV2hldGhlciBhIG1lbnUgaXMgb3BlbjogdGhlIGFwcCdzIHNpbmdsZS1rZXkgc2hvcnRjdXRzIHN0ZXAgYXNpZGUgd2hpbGVcbiAqICBpdCB0YWtlcyB0eXBpbmcuICovXG5sZXQgb3BlbiA9IDA7XG5leHBvcnQgY29uc3QgbWVudU9wZW4gPSAoKSA9PiBvcGVuID4gMDtcblxuLyoqIFRoZSBBZGQgbWVudTogZXZlcnkgbW9kdWxlLCBvciBvbmx5IHRob3NlIGEgZHJvcHBlZCB3aXJlIGZpdHMuIFR5cGluZ1xuICogIGZpbHRlcnMsIEVudGVyIHRha2VzIHRoZSBmaXJzdCwgRXNjYXBlIGNsb3NlcyAodGhlIGNhbnZhcykuICovXG5leHBvcnQgZnVuY3Rpb24gQWRkTWVudSh7XG4gIHgsXG4gIHksXG4gIGFjY2VwdHMsXG4gIG9uUGljayxcbiAgb25DbG9zZSxcbn06IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIGFjY2VwdHM/OiAoazogS2luZCkgPT4gYm9vbGVhbjtcbiAgb25QaWNrOiAoazogS2luZCkgPT4gdm9pZDtcbiAgb25DbG9zZTogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3Qgc2l6ZSA9IHVzZVdpbmRvd1NpemUoKTtcbiAgY29uc3QgdCA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHQudmFsdWUgPSB3aXRoU3ByaW5nKDEsIHsgc3RpZmZuZXNzOiA0MjAsIGRhbXBpbmc6IDI4IH0pO1xuICB9LCBbdF0pO1xuXG4gIGNvbnN0IGtpbmRzID0gKE9iamVjdC5rZXlzKEtJTkRTKSBhcyBLaW5kW10pLmZpbHRlcihcbiAgICAoaykgPT5cbiAgICAgICghYWNjZXB0cyB8fCBhY2NlcHRzKGspKSAmJlxuICAgICAgS0lORFNba10udGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeS50b0xvd2VyQ2FzZSgpKSxcbiAgKTtcbiAgY29uc3QgZ3JvdXBzID0gKE9iamVjdC5rZXlzKENBVEVHT1JJRVMpIGFzIENhdGVnb3J5W10pXG4gICAgLm1hcCgoYykgPT4gW2MsIGtpbmRzLmZpbHRlcigoaykgPT4gS0lORFNba10uY2F0ZWdvcnkgPT09IGMpXSBhcyBjb25zdClcbiAgICAuZmlsdGVyKChbLCBrc10pID0+IGtzLmxlbmd0aCk7XG5cbiAgY29uc3QgbGF0ZXN0ID0gdXNlTGF0ZXN0KHsga2luZHMsIG9uUGljaywgb25DbG9zZSB9KTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBvcGVuKys7XG4gICAgY29uc3Qgb2ZmID0gYmV2eS5vbihcImtleURvd25cIiwgKGUpID0+IHtcbiAgICAgIGNvbnN0IHsga2luZHMsIG9uUGljaywgb25DbG9zZSB9ID0gbGF0ZXN0LmN1cnJlbnQ7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiQmFja3NwYWNlXCIpIHNldFF1ZXJ5KChxKSA9PiBxLnNsaWNlKDAsIC0xKSk7XG4gICAgICBlbHNlIGlmIChlLmtleSA9PT0gXCJFbnRlclwiKSB7XG4gICAgICAgIGlmIChraW5kc1swXSkgb25QaWNrKGtpbmRzWzBdKTtcbiAgICAgICAgZWxzZSBvbkNsb3NlKCk7XG4gICAgICB9IGVsc2UgaWYgKGUudGV4dCAmJiAvXltcXHcgXSQvLnRlc3QoZS50ZXh0KSAmJiAhZS5jdHJsS2V5KSB7XG4gICAgICAgIHNldFF1ZXJ5KChxKSA9PiBxICsgZS50ZXh0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgb3Blbi0tO1xuICAgICAgb2ZmKCk7XG4gICAgfTtcbiAgfSwgW2xhdGVzdF0pO1xuXG4gIGNvbnN0IGhlaWdodCA9XG4gICAgNDQgKyBncm91cHMucmVkdWNlKChoLCBbLCBrc10pID0+IGggKyBIRUFEICsga3MubGVuZ3RoICogSVRFTSwgMCk7XG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heCg4LCBNYXRoLm1pbih4LCBzaXplLndpZHRoIC0gV0lEVEggLSA4KSk7XG4gIGNvbnN0IHRvcCA9IE1hdGgubWF4KDgsIE1hdGgubWluKHksIHNpemUuaGVpZ2h0IC0gaGVpZ2h0IC0gOCkpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLmdsYXNzLFxuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdCxcbiAgICAgICAgdG9wLFxuICAgICAgICB3aWR0aDogV0lEVEgsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIHBhZGRpbmc6IDYsXG4gICAgICAgIGdsb2JhbFpJbmRleDogMjAsXG4gICAgICAgIG9wYWNpdHk6IHsgYW5pbWF0ZWQ6IHQgfSxcbiAgICAgICAgdHJhbnNmb3JtOiB7XG4gICAgICAgICAgc2NhbGU6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHQsIFswLCAxLCAyXSwgWzAuOTIsIDEsIDEuMDhdKSB9LFxuICAgICAgICB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGhlaWdodDogMzAsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDggfSxcbiAgICAgICAgICBtYXJnaW46IHsgYm90dG9tOiA0IH0sXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiA4LFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuMjUpXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxJY29uXG4gICAgICAgICAgZD1cIk0xMC41IDE3YTYuNSA2LjUgMCAxIDEgMC0xM2E2LjUgNi41IDAgMCAxIDAgMTNaIE0xNS41IDE1LjUgMjAgMjBcIlxuICAgICAgICAgIGNvbG9yPXtDLmRpbX1cbiAgICAgICAgICBzaXplPXsxNH1cbiAgICAgICAgLz5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogcXVlcnkgPyBDLnRleHQgOiBDLmZhaW50IH19PlxuICAgICAgICAgIHtxdWVyeSB8fCAoYWNjZXB0cyA/IFwiUGx1ZyBpbnRv4oCmXCIgOiBcIkFkZCBhIG1vZHVsZeKAplwiKX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAge2dyb3Vwcy5tYXAoKFtjLCBrc10pID0+IChcbiAgICAgICAgPG5vZGUga2V5PXtjfSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiIH19PlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBoZWlnaHQ6IEhFQUQsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogOCwgdG9wOiA2IH0sXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxMCxcbiAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLFxuICAgICAgICAgICAgICBjb2xvcjogQ0FURUdPUklFU1tjXS5jb2xvcixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge0NBVEVHT1JJRVNbY10ubGFiZWwudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAge2tzLm1hcCgoaykgPT4gKFxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAga2V5PXtrfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblBpY2soayl9XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBJVEVNLFxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBnYXA6IDEwLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogOCB9LFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOCxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6XG4gICAgICAgICAgICAgICAgICBrID09PSBraW5kc1swXSAmJiBxdWVyeVxuICAgICAgICAgICAgICAgICAgICA/IGFscGhhKFwiI2ZmZmZmZlwiLCAwLjA2KVxuICAgICAgICAgICAgICAgICAgICA6IFwidHJhbnNwYXJlbnRcIixcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB7IGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMTIwIH0gfSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IGFscGhhKENBVEVHT1JJRVNbY10uY29sb3IsIDAuMTYpIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxJY29uIGQ9e0tJTkRTW2tdLmljb259IGNvbG9yPXtDQVRFR09SSUVTW2NdLmNvbG9yfSBzaXplPXsxNn0gLz5cbiAgICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIgfX0+XG4gICAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy50ZXh0IH19PlxuICAgICAgICAgICAgICAgICAge0tJTkRTW2tdLnRpdGxlfVxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTAsIGNvbG9yOiBDLmZhaW50IH19PlxuICAgICAgICAgICAgICAgICAge0tJTkRTW2tdLmJsdXJifVxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICApKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBLaW5kIGFzIEVuZ2luZUtpbmQsIFNpZ25hbCB9IGZyb20gXCIuLi9iZXZ5XCI7XG5cbi8qKiBUaGUgbW9kdWxhciBzeW50aCdzIG1vZHVsZXM6IGV2ZXJ5IGtpbmQsIGl0cyBzb2NrZXRzIGFuZCB0aGUga25vYnMgaXRcbiAqICBzdGFydHMgd2l0aC4gQmV2eSBwbGF5cyB0aGVtIChgc3ludGgvYCBpbiBSdXN0KTogdGhlIGtpbmRzIGFyZSB0aGVcbiAqICBlbmdpbmUncyAoYHNhdGlzZmllc2AgYmVsb3cpLCB0aGUgcGFyYW1zIGl0cyBzbG90cyBieSBuYW1lIChhIFJ1c3QgdGVzdFxuICogIHJlYWRzIHRoaXMgZmlsZSkuICovXG5cbmV4cG9ydCB0eXBlIENhdGVnb3J5ID0gXCJ0aW1pbmdcIiB8IFwic291cmNlXCIgfCBcInNoYXBlclwiIHwgXCJlZmZlY3RcIiB8IFwib3V0cHV0XCI7XG5cbmV4cG9ydCBjb25zdCBDQVRFR09SSUVTOiBSZWNvcmQ8Q2F0ZWdvcnksIHsgbGFiZWw6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9PiA9IHtcbiAgdGltaW5nOiB7IGxhYmVsOiBcIlRpbWluZ1wiLCBjb2xvcjogXCIjOWQ3YmZmXCIgfSxcbiAgc291cmNlOiB7IGxhYmVsOiBcIlNvdXJjZXNcIiwgY29sb3I6IFwiIzRjYzJmZlwiIH0sXG4gIHNoYXBlcjogeyBsYWJlbDogXCJTaGFwZXJzXCIsIGNvbG9yOiBcIiNmZjdhNTlcIiB9LFxuICBlZmZlY3Q6IHsgbGFiZWw6IFwiRWZmZWN0c1wiLCBjb2xvcjogXCIjNTdlMzhjXCIgfSxcbiAgb3V0cHV0OiB7IGxhYmVsOiBcIk91dHB1dFwiLCBjb2xvcjogXCIjZmZkMTY2XCIgfSxcbn07XG5cbmV4cG9ydCB0eXBlIFBvcnQgPSB7IG5hbWU6IHN0cmluZzsgc2lnbmFsOiBTaWduYWwgfTtcblxuZXhwb3J0IHR5cGUgS2luZERlZiA9IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgY2F0ZWdvcnk6IENhdGVnb3J5O1xuICAvKiogT25lIGxpbmUgZm9yIHRoZSBwYWxldHRlLiAqL1xuICBibHVyYjogc3RyaW5nO1xuICAvKiogQW4gU1ZHIHBhdGggaW4gYSAyNMOXMjQgYm94LCBzdHJva2VkLiAqL1xuICBpY29uOiBzdHJpbmc7XG4gIGlucHV0czogUG9ydFtdO1xuICBvdXRwdXRzOiBQb3J0W107XG4gIC8qKiBDYXJkIHdpZHRoIGFuZCB0aGUgYm9keSdzIGhlaWdodCB1bmRlciB0aGUgc29ja2V0IHJvd3MsIHdvcmxkIHB4LiAqL1xuICB3aWR0aDogbnVtYmVyO1xuICBib2R5OiBudW1iZXI7XG4gIHBhcmFtczogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbn07XG5cbmNvbnN0IHBvcnQgPSAobmFtZTogc3RyaW5nLCBzaWduYWw6IFNpZ25hbCk6IFBvcnQgPT4gKHsgbmFtZSwgc2lnbmFsIH0pO1xuXG5leHBvcnQgY29uc3QgS0lORFMgPSB7XG4gIGNsb2NrOiB7XG4gICAgdGl0bGU6IFwiQ2xvY2tcIixcbiAgICBjYXRlZ29yeTogXCJ0aW1pbmdcIixcbiAgICBibHVyYjogXCJUaWNrcyBvbiB0aGUgYmVhdCwgc3d1bmcgb3Igc3RyYWlnaHRcIixcbiAgICBpY29uOiBcIk0yMSAxMmE5IDkgMCAxIDEtMTggMGE5IDkgMCAxIDEgMTggMFogTTEyIDd2NWwzIDJcIixcbiAgICBpbnB1dHM6IFtdLFxuICAgIG91dHB1dHM6IFtwb3J0KFwicHVsc2VcIiwgXCJnYXRlXCIpXSxcbiAgICB3aWR0aDogMjIwLFxuICAgIGJvZHk6IDc4LFxuICAgIHBhcmFtczogeyBkaXY6IDEsIHN3aW5nOiAwIH0sXG4gIH0sXG4gIHNlcXVlbmNlcjoge1xuICAgIHRpdGxlOiBcIlNlcXVlbmNlclwiLFxuICAgIGNhdGVnb3J5OiBcInRpbWluZ1wiLFxuICAgIGJsdXJiOiBcIkVpZ2h0IHN0ZXBzIG9mIG1lbG9keVwiLFxuICAgIGljb246IFwiTTQgMTl2LTYgTTkgMTlWOCBNMTQgMTl2LTQgTTE5IDE5VjVcIixcbiAgICBpbnB1dHM6IFtwb3J0KFwiY2xvY2tcIiwgXCJnYXRlXCIpXSxcbiAgICBvdXRwdXRzOiBbcG9ydChcInBpdGNoXCIsIFwiY3ZcIiksIHBvcnQoXCJnYXRlXCIsIFwiZ2F0ZVwiKV0sXG4gICAgd2lkdGg6IDI3MixcbiAgICBib2R5OiA5NixcbiAgICBwYXJhbXM6IHtcbiAgICAgIHAwOiAwLjMsXG4gICAgICBwMTogMC41NSxcbiAgICAgIHAyOiAwLjMsXG4gICAgICBwMzogMC44LFxuICAgICAgcDQ6IDAuNDUsXG4gICAgICBwNTogMC4zLFxuICAgICAgcDY6IDAuNjUsXG4gICAgICBwNzogMC45NSxcbiAgICAgIG1hc2s6IDBiMTEwMTEwMTEsXG4gICAgfSxcbiAgfSxcbiAgYmVhdDoge1xuICAgIHRpdGxlOiBcIkJlYXRcIixcbiAgICBjYXRlZ29yeTogXCJ0aW1pbmdcIixcbiAgICBibHVyYjogXCJGb3VyIGxhbmVzIG9mIHNpeHRlZW50aCBoaXRzXCIsXG4gICAgaWNvbjogXCJNMyA2aDE4IE0zIDEyaDE4IE0zIDE4aDE4IE03IDMuNXY1IE0xNSA5LjV2NSBNMTEgMTUuNXY1XCIsXG4gICAgaW5wdXRzOiBbcG9ydChcImNsb2NrXCIsIFwiZ2F0ZVwiKV0sXG4gICAgb3V0cHV0czogW1xuICAgICAgcG9ydChcImFcIiwgXCJnYXRlXCIpLFxuICAgICAgcG9ydChcImJcIiwgXCJnYXRlXCIpLFxuICAgICAgcG9ydChcImNcIiwgXCJnYXRlXCIpLFxuICAgICAgcG9ydChcImRcIiwgXCJnYXRlXCIpLFxuICAgIF0sXG4gICAgd2lkdGg6IDM0MCxcbiAgICBib2R5OiAxMDgsXG4gICAgLy8gQSBiYXIgcGVyIGxhbmUsIGJpdCBgaWAgdGhlIGBpYC10aCBzaXh0ZWVudGg6IGZvdXIgb24gdGhlIGZsb29yLFxuICAgIC8vIGEgYmFja2JlYXQsIG9mZi1iZWF0IGVpZ2h0aHMuXG4gICAgcGFyYW1zOiB7IGswOiAweDExMTEsIGsxOiAweDEwMTAsIGsyOiAweDQ0NDQsIGszOiAwIH0sXG4gIH0sXG4gIG9zY2lsbGF0b3I6IHtcbiAgICB0aXRsZTogXCJPc2NpbGxhdG9yXCIsXG4gICAgY2F0ZWdvcnk6IFwic291cmNlXCIsXG4gICAgYmx1cmI6IFwiQSB0b25lLCBmb3VyIHNoYXBlcywgZGV0dW5hYmxlXCIsXG4gICAgaWNvbjogXCJNMSAxMnEzLjUtOCA3IDB0NyAwdDcgMFwiLFxuICAgIGlucHV0czogW3BvcnQoXCJwaXRjaFwiLCBcImN2XCIpLCBwb3J0KFwiZm1cIiwgXCJjdlwiKV0sXG4gICAgb3V0cHV0czogW3BvcnQoXCJvdXRcIiwgXCJhdWRpb1wiKV0sXG4gICAgd2lkdGg6IDIzNixcbiAgICBib2R5OiAxNTAsXG4gICAgcGFyYW1zOiB7IHdhdmU6IDEsIHR1bmU6IDAuNSwgbGV2ZWw6IDAuOCwgZGV0dW5lOiAwIH0sXG4gIH0sXG4gIG5vaXNlOiB7XG4gICAgdGl0bGU6IFwiTm9pc2VcIixcbiAgICBjYXRlZ29yeTogXCJzb3VyY2VcIixcbiAgICBibHVyYjogXCJIaXNzIGluIHRocmVlIGNvbG9yc1wiLFxuICAgIGljb246IFwiTTIgMTJsMi01IDIgOSAyLTcgMiA2IDItOSAyIDggMi00IDIgNSAyLTYgMiAzXCIsXG4gICAgaW5wdXRzOiBbXSxcbiAgICBvdXRwdXRzOiBbcG9ydChcIm91dFwiLCBcImF1ZGlvXCIpXSxcbiAgICB3aWR0aDogMjEyLFxuICAgIGJvZHk6IDE0NixcbiAgICBwYXJhbXM6IHsgY29sb3I6IDEsIGxldmVsOiAwLjUgfSxcbiAgfSxcbiAgbGZvOiB7XG4gICAgdGl0bGU6IFwiTEZPXCIsXG4gICAgY2F0ZWdvcnk6IFwic291cmNlXCIsXG4gICAgYmx1cmI6IFwiQSBzbG93IHdvYmJsZSwgb3IgcmFuZG9tIHN0ZXBzXCIsXG4gICAgaWNvbjogXCJNMiAxNHE1LTExIDEwIDB0MTAgMFwiLFxuICAgIGlucHV0czogW10sXG4gICAgb3V0cHV0czogW3BvcnQoXCJvdXRcIiwgXCJjdlwiKV0sXG4gICAgd2lkdGg6IDIxMixcbiAgICBib2R5OiAxNTAsXG4gICAgcGFyYW1zOiB7IHNoYXBlOiAwLCByYXRlOiAwLjU1LCBkZXB0aDogMC42IH0sXG4gIH0sXG4gIGRydW06IHtcbiAgICB0aXRsZTogXCJEcnVtXCIsXG4gICAgY2F0ZWdvcnk6IFwic291cmNlXCIsXG4gICAgYmx1cmI6IFwiQSBraWNrLCBzbmFyZSwgY2xhcCBvciBoYXRcIixcbiAgICBpY29uOiBcIk00IDguNWE4IDMgMCAxIDAgMTYgMGE4IDMgMCAxIDAtMTYgMFogTTQgOC41djdjMCAxLjcgMy42IDMgOCAzczgtMS4zIDgtM3YtN1wiLFxuICAgIGlucHV0czogW3BvcnQoXCJ0cmlnXCIsIFwiZ2F0ZVwiKSwgcG9ydChcInBpdGNoXCIsIFwiY3ZcIildLFxuICAgIG91dHB1dHM6IFtwb3J0KFwib3V0XCIsIFwiYXVkaW9cIildLFxuICAgIHdpZHRoOiAyMzYsXG4gICAgYm9keTogMTQwLFxuICAgIHBhcmFtczogeyB2b2ljZTogMCwgdHVuZTogMC40LCBkZWNheTogMC40LCBsZXZlbDogMC44IH0sXG4gIH0sXG4gIGVudmVsb3BlOiB7XG4gICAgdGl0bGU6IFwiRW52ZWxvcGVcIixcbiAgICBjYXRlZ29yeTogXCJzaGFwZXJcIixcbiAgICBibHVyYjogXCJBdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlXCIsXG4gICAgaWNvbjogXCJNMyAxOUw3IDVsNCA2aDZsNCA4XCIsXG4gICAgaW5wdXRzOiBbcG9ydChcImdhdGVcIiwgXCJnYXRlXCIpXSxcbiAgICBvdXRwdXRzOiBbcG9ydChcImVudlwiLCBcImN2XCIpXSxcbiAgICB3aWR0aDogMjQ0LFxuICAgIGJvZHk6IDEzMixcbiAgICBwYXJhbXM6IHsgYTogMC4xMiwgZDogMC4zNSwgczogMC41NSwgcjogMC40NSB9LFxuICB9LFxuICBmaWx0ZXI6IHtcbiAgICB0aXRsZTogXCJGaWx0ZXJcIixcbiAgICBjYXRlZ29yeTogXCJzaGFwZXJcIixcbiAgICBibHVyYjogXCJDdXRzIHRoZSBoaWdocywgdGhlIGxvd3NcIixcbiAgICBpY29uOiBcIk0yIDloOWM0IDAgNSAyIDYgNXMyIDUgNSA1XCIsXG4gICAgaW5wdXRzOiBbcG9ydChcImluXCIsIFwiYXVkaW9cIiksIHBvcnQoXCJjdXRvZmZcIiwgXCJjdlwiKSwgcG9ydChcImZtXCIsIFwiY3ZcIildLFxuICAgIG91dHB1dHM6IFtwb3J0KFwib3V0XCIsIFwiYXVkaW9cIildLFxuICAgIHdpZHRoOiAyMzYsXG4gICAgYm9keTogMTU2LFxuICAgIHBhcmFtczogeyBtb2RlOiAwLCBjdXRvZmY6IDAuNTUsIHJlczogMC40LCBtb2Q6IDAuNiB9LFxuICB9LFxuICB2Y2E6IHtcbiAgICB0aXRsZTogXCJWQ0FcIixcbiAgICBjYXRlZ29yeTogXCJzaGFwZXJcIixcbiAgICBibHVyYjogXCJMZXRzIHNvdW5kIHRocm91Z2ggYXMgYSB2b2x0YWdlIHNheXNcIixcbiAgICBpY29uOiBcIk01IDR2MTZsMTQtOHogTTEyIDN2NS41XCIsXG4gICAgaW5wdXRzOiBbcG9ydChcImluXCIsIFwiYXVkaW9cIiksIHBvcnQoXCJjdlwiLCBcImN2XCIpXSxcbiAgICBvdXRwdXRzOiBbcG9ydChcIm91dFwiLCBcImF1ZGlvXCIpXSxcbiAgICB3aWR0aDogMjEyLFxuICAgIGJvZHk6IDEyMCxcbiAgICBwYXJhbXM6IHsgZ2FpbjogMC44LCBjdXJ2ZTogMCB9LFxuICB9LFxuICBnbGlkZToge1xuICAgIHRpdGxlOiBcIkdsaWRlXCIsXG4gICAgY2F0ZWdvcnk6IFwic2hhcGVyXCIsXG4gICAgYmx1cmI6IFwiU2xpZGVzIGZyb20gbm90ZSB0byBub3RlXCIsXG4gICAgaWNvbjogXCJNMyAxN2g1YzQgMCA0LTEwIDgtMTBoNVwiLFxuICAgIGlucHV0czogW3BvcnQoXCJpblwiLCBcImN2XCIpXSxcbiAgICBvdXRwdXRzOiBbcG9ydChcIm91dFwiLCBcImN2XCIpXSxcbiAgICB3aWR0aDogMjAwLFxuICAgIGJvZHk6IDExMixcbiAgICBwYXJhbXM6IHsgdGltZTogMC4zIH0sXG4gIH0sXG4gIG1peGVyOiB7XG4gICAgdGl0bGU6IFwiTWl4ZXJcIixcbiAgICBjYXRlZ29yeTogXCJlZmZlY3RcIixcbiAgICBibHVyYjogXCJGb3VyIGludG8gb25lXCIsXG4gICAgaWNvbjogXCJNNiA0djE2IE0xMiA0djE2IE0xOCA0djE2IE00IDloNCBNMTAgMTVoNCBNMTYgN2g0XCIsXG4gICAgaW5wdXRzOiBbXG4gICAgICBwb3J0KFwiY2ggMVwiLCBcImF1ZGlvXCIpLFxuICAgICAgcG9ydChcImNoIDJcIiwgXCJhdWRpb1wiKSxcbiAgICAgIHBvcnQoXCJjaCAzXCIsIFwiYXVkaW9cIiksXG4gICAgICBwb3J0KFwiY2ggNFwiLCBcImF1ZGlvXCIpLFxuICAgIF0sXG4gICAgb3V0cHV0czogW3BvcnQoXCJtaXhcIiwgXCJhdWRpb1wiKV0sXG4gICAgd2lkdGg6IDIyMCxcbiAgICBib2R5OiAxMTIsXG4gICAgcGFyYW1zOiB7IGwwOiAwLjgsIGwxOiAwLjYsIGwyOiAwLjYsIGwzOiAwLjYgfSxcbiAgfSxcbiAgZGVsYXk6IHtcbiAgICB0aXRsZTogXCJEZWxheVwiLFxuICAgIGNhdGVnb3J5OiBcImVmZmVjdFwiLFxuICAgIGJsdXJiOiBcIkVjaG9lcywgZmFkaW5nLCBpbiB0aW1lXCIsXG4gICAgaWNvbjogXCJNNCA2djEyIE05IDh2OCBNMTQgMTB2NCBNMTkgMTF2MlwiLFxuICAgIGlucHV0czogW3BvcnQoXCJpblwiLCBcImF1ZGlvXCIpXSxcbiAgICBvdXRwdXRzOiBbcG9ydChcIm91dFwiLCBcImF1ZGlvXCIpXSxcbiAgICB3aWR0aDogMjM2LFxuICAgIGJvZHk6IDE1NCxcbiAgICBwYXJhbXM6IHsgdGltZTogMC40LCBmZWVkYmFjazogMC40NSwgbWl4OiAwLjMsIHN5bmM6IDEgfSxcbiAgfSxcbiAgcmV2ZXJiOiB7XG4gICAgdGl0bGU6IFwiUmV2ZXJiXCIsXG4gICAgY2F0ZWdvcnk6IFwiZWZmZWN0XCIsXG4gICAgYmx1cmI6IFwiQSBwbGF0ZSwgaW4gc3RlcmVvXCIsXG4gICAgaWNvbjogXCJNMTAgMTJhMiAyIDAgMSAwIDQgMGEyIDIgMCAxIDAtNCAwIE03LjggNy44YTYgNiAwIDAgMCAwIDguNCBNMTYuMiA3LjhhNiA2IDAgMCAxIDAgOC40IE00LjkgNC45YTEwIDEwIDAgMCAwIDAgMTQuMiBNMTkuMSA0LjlhMTAgMTAgMCAwIDEgMCAxNC4yXCIsXG4gICAgaW5wdXRzOiBbcG9ydChcImluXCIsIFwiYXVkaW9cIildLFxuICAgIG91dHB1dHM6IFtwb3J0KFwibGVmdFwiLCBcImF1ZGlvXCIpLCBwb3J0KFwicmlnaHRcIiwgXCJhdWRpb1wiKV0sXG4gICAgd2lkdGg6IDIzNixcbiAgICBib2R5OiAxMTYsXG4gICAgcGFyYW1zOiB7IHNpemU6IDAuNiwgZGFtcDogMC40LCBtaXg6IDAuMyB9LFxuICB9LFxuICBvdXRwdXQ6IHtcbiAgICB0aXRsZTogXCJPdXRwdXRcIixcbiAgICBjYXRlZ29yeTogXCJvdXRwdXRcIixcbiAgICBibHVyYjogXCJXaGVyZSBpdCBhbGwgZW5kcyB1cFwiLFxuICAgIGljb246IFwiTTQgOWg0bDUtNHYxNGwtNS00SDR6IE0xNyA4YTUgNSAwIDAgMSAwIDggTTIwIDVhOSA5IDAgMCAxIDAgMTRcIixcbiAgICBpbnB1dHM6IFtwb3J0KFwibGVmdFwiLCBcImF1ZGlvXCIpLCBwb3J0KFwicmlnaHRcIiwgXCJhdWRpb1wiKV0sXG4gICAgb3V0cHV0czogW10sXG4gICAgd2lkdGg6IDIyNCxcbiAgICBib2R5OiAxMzIsXG4gICAgcGFyYW1zOiB7IHZvbHVtZTogMC43IH0sXG4gIH0sXG59IHNhdGlzZmllcyBSZWNvcmQ8RW5naW5lS2luZCwgS2luZERlZj47XG5cbmV4cG9ydCB0eXBlIEtpbmQgPSBrZXlvZiB0eXBlb2YgS0lORFM7XG5cbmV4cG9ydCBjb25zdCBraW5kID0gKGs6IEtpbmQpOiBLaW5kRGVmID0+IEtJTkRTW2tdO1xuXG4vKiogVGhlIGNhcmQncyBmaXhlZCBnZW9tZXRyeSAod29ybGQgcHgpIOKAlCBgTm9kZUNhcmRgIHJlbmRlcnMgZXhhY3RseSB0aGlzLFxuICogIGFuZCB0aGUgbWluaW1hcCwgYm94IHNlbGVjdCBhbmQgZnJhbWluZyBtZWFzdXJlIHdpdGggaXQuICovXG5leHBvcnQgY29uc3QgSEVBREVSID0gMzY7XG5leHBvcnQgY29uc3QgUk9XID0gMjQ7XG5leHBvcnQgY29uc3QgUk9XU19QQUQgPSA2O1xuZXhwb3J0IGNvbnN0IEJPRFlfUEFEID0gMTI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXJkSGVpZ2h0KGs6IEtpbmQpOiBudW1iZXIge1xuICBjb25zdCBkID0ga2luZChrKTtcbiAgY29uc3Qgcm93cyA9IE1hdGgubWF4KGQuaW5wdXRzLmxlbmd0aCwgZC5vdXRwdXRzLmxlbmd0aCk7XG4gIHJldHVybiBIRUFERVIgKyAocm93cyA/IHJvd3MgKiBST1cgKyBST1dTX1BBRCAqIDIgOiAwKSArIGQuYm9keSArIEJPRFlfUEFEO1xufVxuIiwgImltcG9ydCB7IG1lbW8sIHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICBpbnRlcnBvbGF0ZSxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhEZWxheSxcbiAgd2l0aFNlcXVlbmNlLFxuICB3aXRoU3ByaW5nLFxuICB3aXRoVGltaW5nLFxuICB0eXBlIEJldnlTdHlsZSxcbiAgdHlwZSBHcmFkaWVudCxcbiAgdHlwZSBQb2ludGVyRXZlbnREYXRhLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQk9ESUVTIH0gZnJvbSBcIi4uL2JvZGllc1wiO1xuaW1wb3J0IHsgQywgU0lHTkFMLCBhbHBoYSwgciB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgTGVkLCB1c2VMaXZlIH0gZnJvbSBcIi4uL3dpZGdldHNcIjtcbmltcG9ydCB7XG4gIEJPRFlfUEFELFxuICBDQVRFR09SSUVTLFxuICBIRUFERVIsXG4gIFJPVyxcbiAgUk9XU19QQUQsXG4gIGNhcmRIZWlnaHQsXG4gIGtpbmQsXG59IGZyb20gXCIuL2NhdGFsb2dcIjtcbmltcG9ydCB7IHR5cGUgR3JhcGhOb2RlLCB0eXBlIFNpZGUsIHR5cGUgU29ja2V0UmVmLCBzb2NrZXROYW1lIH0gZnJvbSBcIi4vbW9kZWxcIjtcblxuLyoqIFdoYXQgdGhlIGNhbnZhcyBkb2VzIHdpdGggYSBjYXJkJ3MgZ2VzdHVyZXMuIE9uZSBzdGFibGUgb2JqZWN0LCBzbyB0aGVcbiAqICBtZW1vaXplZCBjYXJkcyBuZXZlciByZS1yZW5kZXIgZm9yIGEgbmV3IGNhbGxiYWNrLiAqL1xuZXhwb3J0IHR5cGUgQ2FyZEFwaSA9IHtcbiAgcHJlc3MoaWQ6IHN0cmluZywgZTogUG9pbnRlckV2ZW50RGF0YSk6IHZvaWQ7XG4gIGRyYWcoZTogUG9pbnRlckV2ZW50RGF0YSk6IHZvaWQ7XG4gIHJlbGVhc2UoZTogUG9pbnRlckV2ZW50RGF0YSk6IHZvaWQ7XG4gIHNvY2tldERvd24oczogU29ja2V0UmVmLCBlOiBQb2ludGVyRXZlbnREYXRhKTogdm9pZDtcbiAgc29ja2V0VXAoZTogUG9pbnRlckV2ZW50RGF0YSk6IHZvaWQ7XG4gIHNvY2tldEhvdmVyKHM6IFNvY2tldFJlZiwgb246IGJvb2xlYW4pOiB2b2lkO1xuICBwYXJhbShpZDogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IG51bWJlcik6IHZvaWQ7XG4gIHB1cmdlKGlkOiBzdHJpbmcpOiB2b2lkO1xufTtcblxuLyoqIEhvdyBhIHNvY2tldCBsb29rcyB3aGlsZSBhIHdpcmUgaXMgYmVpbmcgcHVsbGVkLiAqL1xuZXhwb3J0IHR5cGUgUGx1ZyA9IFwiaWRsZVwiIHwgXCJvcGVuXCIgfCBcInNodXRcIiB8IFwidGFyZ2V0XCI7XG5cbmNvbnN0IFJBRElVUyA9IDEyO1xuXG5leHBvcnQgY29uc3QgTm9kZUNhcmQgPSBtZW1vKGZ1bmN0aW9uIE5vZGVDYXJkKHtcbiAgbm9kZSxcbiAgc2VsZWN0ZWQsXG4gIGxpZnRlZCxcbiAgZ2xpZGluZyxcbiAgd2lyZWQsXG4gIHBsdWcsXG4gIGFwaSxcbn06IHtcbiAgbm9kZTogR3JhcGhOb2RlO1xuICBzZWxlY3RlZDogYm9vbGVhbjtcbiAgLyoqIEJlaW5nIGRyYWdnZWQuICovXG4gIGxpZnRlZDogYm9vbGVhbjtcbiAgLyoqIEdsaWRpbmcgdG8gYW4gYXJyYW5nZWQgcG9zaXRpb24uICovXG4gIGdsaWRpbmc6IGJvb2xlYW47XG4gIC8qKiBTb2NrZXRzIHdpdGggYSB3aXJlLCBhcyBgXCJpMCBvMVwiYC4gKi9cbiAgd2lyZWQ6IHN0cmluZztcbiAgLyoqIFBlciBzb2NrZXQgd2hpbGUgYSB3aXJlIGlzIHB1bGxlZCAoYFwiaTBcImAg4oaSIGBcIm9wZW5cImApOyBgbnVsbGAgd2hlbiBub3QuICovXG4gIHBsdWc6IFJlY29yZDxzdHJpbmcsIFBsdWc+IHwgbnVsbDtcbiAgYXBpOiBDYXJkQXBpO1xufSkge1xuICBjb25zdCBkZWYgPSBraW5kKG5vZGUua2luZCk7XG4gIGNvbnN0IGNvbG9yID0gQ0FURUdPUklFU1tkZWYuY2F0ZWdvcnldLmNvbG9yO1xuICBjb25zdCB7IHNwaW4sIHN0ZXBzIH0gPSB1c2VMaXZlKCk7XG5cbiAgLy8gUG9wIGluIChzdGFnZ2VyZWQgYnkgYGVudGVyYCksIHNocmluayBhd2F5IHdoZW4gZGVsZXRlZC5cbiAgY29uc3QgYXBwZWFyID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYXBwZWFyLnZhbHVlID0gd2l0aERlbGF5KFxuICAgICAgbm9kZS5lbnRlcixcbiAgICAgIHdpdGhTcHJpbmcoMSwgeyBzdGlmZm5lc3M6IDI0MCwgZGFtcGluZzogMTYgfSksXG4gICAgKTtcbiAgfSwgW2FwcGVhciwgbm9kZS5lbnRlcl0pO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChub2RlLmxlYXZpbmcpIHtcbiAgICAgIGFwcGVhci52YWx1ZSA9IHdpdGhUaW1pbmcoMCwge1xuICAgICAgICBkdXJhdGlvbjogMTgwLFxuICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCIsXG4gICAgICAgIG9uQ29tcGxldGU6ICgpID0+IGFwaS5wdXJnZShub2RlLmlkKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgW2FwcGVhciwgbm9kZS5sZWF2aW5nLCBub2RlLmlkLCBhcGldKTtcblxuICAvLyBMaWZ0ZWQgd2hpbGUgZHJhZ2dlZCwgbGVhbmluZyBpbnRvIHRoZSBtb3Rpb24gYW5kIHNwcmluZ2luZyBiYWNrLlxuICBjb25zdCBsaWZ0ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIGNvbnN0IHRpbHQgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsaWZ0LnZhbHVlID0gd2l0aFNwcmluZyhsaWZ0ZWQgPyAxIDogMCwgeyBzdGlmZm5lc3M6IDM4MCwgZGFtcGluZzogMjIgfSk7XG4gIH0sIFtsaWZ0LCBsaWZ0ZWRdKTtcbiAgY29uc3QgbGFzdFggPSB1c2VSZWYobm9kZS54KTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkeCA9IG5vZGUueCAtIGxhc3RYLmN1cnJlbnQ7XG4gICAgbGFzdFguY3VycmVudCA9IG5vZGUueDtcbiAgICBpZiAoIWxpZnRlZCB8fCBkeCA9PT0gMCkgcmV0dXJuO1xuICAgIGNvbnN0IGxlYW4gPSBNYXRoLm1heCgtNywgTWF0aC5taW4oNywgZHggKiAwLjM1KSk7XG4gICAgdGlsdC52YWx1ZSA9IHdpdGhTZXF1ZW5jZShcbiAgICAgIHdpdGhUaW1pbmcobGVhbiwgeyBkdXJhdGlvbjogOTAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSksXG4gICAgICB3aXRoU3ByaW5nKDAsIHsgc3RpZmZuZXNzOiAxNTAsIGRhbXBpbmc6IDggfSksXG4gICAgKTtcbiAgfSwgW3RpbHQsIG5vZGUueCwgbGlmdGVkXSk7XG5cbiAgY29uc3QgcmluZzogR3JhZGllbnQgPSB7XG4gICAgdHlwZTogXCJjb25pY1wiLFxuICAgIHN0YXJ0OiB7IGFuaW1hdGVkOiBzcGluIH0sXG4gICAgc3RvcHM6IFtcbiAgICAgIHsgY29sb3IgfSxcbiAgICAgIHsgY29sb3I6IGFscGhhKGNvbG9yLCAwLjEyKSwgYW5nbGU6IDkwIH0sXG4gICAgICB7IGNvbG9yOiBcIiNmZmZmZmZcIiwgYW5nbGU6IDE4MCB9LFxuICAgICAgeyBjb2xvcjogYWxwaGEoY29sb3IsIDAuMTIpLCBhbmdsZTogMjcwIH0sXG4gICAgICB7IGNvbG9yLCBhbmdsZTogMzYwIH0sXG4gICAgXSxcbiAgfTtcbiAgY29uc3QgZHJvcCA9IHtcbiAgICBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNTUpXCIsXG4gICAgeU9mZnNldDogcihsaWZ0ZWQgPyAyMiA6IDEwKSxcbiAgICBibHVyUmFkaXVzOiByKGxpZnRlZCA/IDQwIDogMjQpLFxuICB9O1xuICBjb25zdCByb3dzID0gTWF0aC5tYXgoZGVmLmlucHV0cy5sZW5ndGgsIGRlZi5vdXRwdXRzLmxlbmd0aCk7XG4gIGNvbnN0IEJvZHkgPSBCT0RJRVNbbm9kZS5raW5kXTtcbiAgY29uc3Qgc2V0ID0gKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSA9PiBhcGkucGFyYW0obm9kZS5pZCwga2V5LCB2YWx1ZSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IHIobm9kZS54KSxcbiAgICAgICAgdG9wOiByKG5vZGUueSksXG4gICAgICAgIHdpZHRoOiByKGRlZi53aWR0aCksXG4gICAgICAgIGhlaWdodDogcihjYXJkSGVpZ2h0KG5vZGUua2luZCkpLFxuICAgICAgICB6SW5kZXg6IG5vZGUueixcbiAgICAgICAgdHJhbnNmb3JtOiB7XG4gICAgICAgICAgc2NhbGU6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKGFwcGVhciwgWzAsIDEsIDJdLCBbMC4wMiwgMSwgMl0pIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHRyYW5zaXRpb246IGdsaWRpbmdcbiAgICAgICAgICA/IHsgbGF5b3V0OiB7IHN0aWZmbmVzczogMTEwLCBkYW1waW5nOiAxNiB9IH1cbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgb25Qb2ludGVyRG93bj17KGUpID0+IGFwaS5wcmVzcyhub2RlLmlkLCBlKX1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17KGUpID0+IGFwaS5kcmFnKGUpfVxuICAgICAgICBvblBvaW50ZXJVcD17KGUpID0+IGFwaS5yZWxlYXNlKGUpfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiByKFJBRElVUyksXG4gICAgICAgICAgYm9yZGVyOiByKDEuNSksXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IHNlbGVjdGVkID8gXCJ0cmFuc3BhcmVudFwiIDogQy5lZGdlLFxuICAgICAgICAgIGJvcmRlckdyYWRpZW50OiBzZWxlY3RlZCA/IHJpbmcgOiB1bmRlZmluZWQsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICAgIC8vIFNlZS10aHJvdWdoOiB0aGUgd2lyZXMgcnVuIHVuZGVyIHRoZSBjYXJkcy5cbiAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgIHsgY29sb3I6IGFscGhhKFwiIzE4MWQyYlwiLCAwLjcyKSB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBhbHBoYShcIiMxMTE1MWZcIiwgMC44KSB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJveFNoYWRvdzogc2VsZWN0ZWRcbiAgICAgICAgICAgID8gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBhbHBoYShjb2xvciwgMC4zMiksXG4gICAgICAgICAgICAgICAgICBibHVyUmFkaXVzOiByKDI2KSxcbiAgICAgICAgICAgICAgICAgIHNwcmVhZFJhZGl1czogcigxKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRyb3AsXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIDogZHJvcCxcbiAgICAgICAgICB0cmFuc2Zvcm06IHtcbiAgICAgICAgICAgIHNjYWxlOiB7IGFuaW1hdGVkOiBpbnRlcnBvbGF0ZShsaWZ0LCBbMCwgMSwgMl0sIFsxLCAxLjAzNSwgMS4wN10pIH0sXG4gICAgICAgICAgICByb3RhdGU6IHsgYW5pbWF0ZWQ6IHRpbHQgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGN1cnNvcjogbGlmdGVkID8gXCJncmFiYmluZ1wiIDogXCJncmFiXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHsvKiBUaGUgY3Vyc29yIGxpZ2h0IChgc3BvdGxpZ2h0LnJzYCwgYWxsIGluIEJldnkpOiB0aGUgYm9yZGVyIGNhdGNoZXNcbiAgICAgICAgICAgIGl0LCB0aGUgc3VyZmFjZSB0YWtlcyBhIHNvZnQgd2FzaC4gRmlyc3Q6IHVuZGVyIHRoZSBjb250ZW50LiAqL31cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiByKC0xLjUpLFxuICAgICAgICAgICAgdG9wOiByKC0xLjUpLFxuICAgICAgICAgICAgcmlnaHQ6IHIoLTEuNSksXG4gICAgICAgICAgICBib3R0b206IHIoLTEuNSksXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoUkFESVVTKSxcbiAgICAgICAgICAgIHNwb3RsaWdodDogeyBjb2xvciwgZWRnZTogMS41LCB3YXNoOiAwLjEyIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgaGVpZ2h0OiByKEhFQURFUiksXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGdhcDogcig4KSxcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogcigxMikgfSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogYCR7cihSQURJVVMgLSAxLjUpfSAke3IoUkFESVVTIC0gMS41KX0gMCAwYCxcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgICBhbmdsZTogOTAsXG4gICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgeyBjb2xvcjogYWxwaGEoY29sb3IsIDAuMykgfSxcbiAgICAgICAgICAgICAgICB7IGNvbG9yOiBhbHBoYShjb2xvciwgMC4wMykgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uIGQ9e2RlZi5pY29ufSBjb2xvcj17Y29sb3J9IHNpemU9e3IoMTYpfSAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgICAgZm9udFNpemU6IHIoMTIpLFxuICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsXG4gICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IHIoMC41KSxcbiAgICAgICAgICAgICAgY29sb3I6IEMudGV4dCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2RlZi50aXRsZS50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8TGVkXG4gICAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgICBsZXZlbD17KGopID0+ICh3aXJlZCAmJiBqICUgMiA9PT0gMCA/IDEgOiAwKX1cbiAgICAgICAgICAgIHNpemU9ezZ9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBoZWlnaHQ6IHIoMSksIGJhY2tncm91bmRDb2xvcjogQy5lZGdlIH19IC8+XG4gICAgICAgIHtyb3dzID4gMCAmJiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgdmVydGljYWw6IHIoUk9XU19QQUQpIH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiByb3dzIH0sIChfLCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IHIoUk9XKSxcbiAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtbZGVmLmlucHV0c1tpXSwgZGVmLm91dHB1dHNbaV1dLm1hcCgocCwgaykgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgc2lkZTogU2lkZSA9IGsgPT09IDAgPyBcImlcIiA6IFwib1wiO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxTb2NrZXRcbiAgICAgICAgICAgICAgICAgICAgICBrZXk9e3NpZGV9XG4gICAgICAgICAgICAgICAgICAgICAgYXQ9e3sgbm9kZTogbm9kZS5pZCwgc2lkZSwgcG9ydDogaSB9fVxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU9e3AubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcj17U0lHTkFMW3Auc2lnbmFsXX1cbiAgICAgICAgICAgICAgICAgICAgICB3aXJlZD17d2lyZWQuaW5jbHVkZXMoYCR7c2lkZX0ke2l9YCl9XG4gICAgICAgICAgICAgICAgICAgICAgcGx1Zz17cGx1Zz8uW2Ake3NpZGV9JHtpfWBdID8/IFwiaWRsZVwifVxuICAgICAgICAgICAgICAgICAgICAgIGFwaT17YXBpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPG5vZGUga2V5PXtzaWRlfSAvPlxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApfVxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBoZWlnaHQ6IHIoZGVmLmJvZHkpLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogcihCT0RZX1BBRCkgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEJvZHkgbm9kZT17bm9kZX0gc2V0PXtzZXR9IGNvbG9yPXtjb2xvcn0gc3RlcHM9e3N0ZXBzfSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufSk7XG5cbmZ1bmN0aW9uIFNvY2tldCh7XG4gIGF0LFxuICBuYW1lLFxuICBjb2xvcixcbiAgd2lyZWQsXG4gIHBsdWcsXG4gIGFwaSxcbn06IHtcbiAgYXQ6IFNvY2tldFJlZjtcbiAgbmFtZTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICB3aXJlZDogYm9vbGVhbjtcbiAgcGx1ZzogUGx1ZztcbiAgYXBpOiBDYXJkQXBpO1xufSkge1xuICBjb25zdCBpbnB1dCA9IGF0LnNpZGUgPT09IFwiaVwiO1xuICBjb25zdCB7IHNwaW4gfSA9IHVzZUxpdmUoKTtcbiAgY29uc3Qgc2NhbGUgPSB7IGlkbGU6IDEsIG9wZW46IDEuMSwgc2h1dDogMC44LCB0YXJnZXQ6IDEuNiB9W3BsdWddO1xuICAvLyBTb2NrZXRzIHRoYXQgd291bGQgdGFrZSB0aGUgcHVsbGVkIHdpcmUgYnJlYXRoZSwgYWxsIGluIHN0ZXAuXG4gIGNvbnN0IGJyZWF0aCA9IGludGVycG9sYXRlKFxuICAgIHNwaW4sXG4gICAgWzAsIDQ1LCA5MCwgMTM1LCAxODAsIDIyNSwgMjcwLCAzMTUsIDM2MF0sXG4gICAgWzEsIDEuMywgMSwgMS4zLCAxLCAxLjMsIDEsIDEuMywgMV0sXG4gICk7XG4gIGNvbnN0IGRpbSA9IHBsdWcgPT09IFwic2h1dFwiID8gMC4yNSA6IDE7XG4gIGNvbnN0IGhpdDogQmV2eVN0eWxlID0ge1xuICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgIGxlZnQ6IGlucHV0ID8gcigtMTIuNzUpIDogdW5kZWZpbmVkLFxuICAgIHJpZ2h0OiBpbnB1dCA/IHVuZGVmaW5lZCA6IHIoLTEyLjc1KSxcbiAgICB0b3A6IHIoMCksXG4gICAgd2lkdGg6IHIoMjQpLFxuICAgIGhlaWdodDogcigyNCksXG4gICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICB0cmFuc2Zvcm06IHsgc2NhbGUgfSxcbiAgICB0cmFuc2l0aW9uOiB7IHRyYW5zZm9ybTogeyBzdGlmZm5lc3M6IDQyMCwgZGFtcGluZzogMjAgfSB9LFxuICAgIGN1cnNvcjogXCJjcm9zc2hhaXJcIixcbiAgfTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogaW5wdXQgPyBcInJvd1wiIDogXCJyb3dSZXZlcnNlXCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGhlaWdodDogcihST1cpLFxuICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IHIoaW5wdXQgPyAxNCA6IDApLCByaWdodDogcihpbnB1dCA/IDAgOiAxNCkgfSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgbmFtZT17c29ja2V0TmFtZShhdCl9XG4gICAgICAgIG9uUG9pbnRlckRvd249eyhlKSA9PiBhcGkuc29ja2V0RG93bihhdCwgZSl9XG4gICAgICAgIG9uUG9pbnRlclVwPXsoZSkgPT4gYXBpLnNvY2tldFVwKGUpfVxuICAgICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gYXBpLnNvY2tldEhvdmVyKGF0LCB0cnVlKX1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9eygpID0+IGFwaS5zb2NrZXRIb3ZlcihhdCwgZmFsc2UpfVxuICAgICAgICBzdHlsZT17aGl0fVxuICAgICAgICBob3ZlclN0eWxlPXtcbiAgICAgICAgICBwbHVnID09PSBcImlkbGVcIiA/IHsgdHJhbnNmb3JtOiB7IHNjYWxlOiAxLjM1IH0gfSA6IHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiByKDEyKSxcbiAgICAgICAgICAgIGhlaWdodDogcigxMiksXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IFwiNTAlXCIsXG4gICAgICAgICAgICBib3JkZXI6IHIoMiksXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogY29sb3IsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHdpcmVkIHx8IHBsdWcgPT09IFwidGFyZ2V0XCIgPyBjb2xvciA6IEMuY2FyZERlZXAsXG4gICAgICAgICAgICBib3hTaGFkb3c6XG4gICAgICAgICAgICAgIHBsdWcgPT09IFwib3BlblwiIHx8IHBsdWcgPT09IFwidGFyZ2V0XCJcbiAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGFscGhhKGNvbG9yLCAwLjc1KSxcbiAgICAgICAgICAgICAgICAgICAgYmx1clJhZGl1czogcigxMCksXG4gICAgICAgICAgICAgICAgICAgIHNwcmVhZFJhZGl1czogcigxKSxcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9wYWNpdHk6IGRpbSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyBzY2FsZTogcGx1ZyA9PT0gXCJvcGVuXCIgPyB7IGFuaW1hdGVkOiBicmVhdGggfSA6IDEgfSxcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHsgb3BhY2l0eTogeyBkdXJhdGlvbjogMTYwIH0gfSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogcigxMCksXG4gICAgICAgICAgY29sb3I6IHBsdWcgPT09IFwic2h1dFwiID8gQy5mYWludCA6IEMuZGltLFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6IHIoMC4zKSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge25hbWV9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSBjYXRhbG9nIGljb247IGBzaXplYCBpcyBhIGxlbmd0aCAoYHIoMTYpYCBpbnNpZGUgdGhlIGdyYXBoKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJY29uKHtcbiAgZCxcbiAgY29sb3IsXG4gIHNpemUsXG59OiB7XG4gIGQ6IHN0cmluZztcbiAgY29sb3I6IHN0cmluZztcbiAgc2l6ZTogbnVtYmVyIHwgc3RyaW5nO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUgfX0+XG4gICAgICA8cGF0aFxuICAgICAgICBkPXtkfVxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBTaWduYWwgfSBmcm9tIFwiLi9iZXZ5XCI7XG5cbi8qKiBgUmVtU2l6ZWAgYXQgem9vbSAxIChgUkVNYCBpbiBgdmlldy5yc2ApLiBFdmVyeSBsZW5ndGggaW5zaWRlIHRoZSBncmFwaFxuICogIGlzIHdyaXR0ZW4gd2l0aCBgcigpYDogaW4gcmVtLCBzbyBCZXZ5IHJlLWxheXMgdGhlIGdyYXBoIG91dCBhdCBlYWNoXG4gKiAgem9vbSBhbmQgdGV4dCBzdGF5cyBjcmlzcC4gQ2hyb21lIG91dHNpZGUgdGhlIGdyYXBoIHVzZXMgcGxhaW4gcHgg4oCUIGFuZFxuICogIGFsd2F5cyBhbiBleHBsaWNpdCBgZm9udFNpemVgLCBzaW5jZSBhbiB1bnNldCBvbmUgaXMgYDFyZW1gIGFuZCB6b29tcy4gKi9cbmV4cG9ydCBjb25zdCBSRU0gPSAxNjtcblxuLyoqIEEgZ3JhcGggbGVuZ3RoOiB3b3JsZCBweCAobG9naWNhbCBweCBhdCB6b29tIDEpIGluIHJlbS4gKi9cbmV4cG9ydCBjb25zdCByID0gKHB4OiBudW1iZXIpID0+IGAkeysocHggLyBSRU0pLnRvRml4ZWQoNCl9cmVtYDtcblxuZXhwb3J0IGNvbnN0IEMgPSB7XG4gIHRleHQ6IFwiI2U2ZTlmMlwiLFxuICBkaW06IFwiIzhkOTRhOFwiLFxuICBmYWludDogXCIjNTk2MDc4XCIsXG4gIGNhcmQ6IFwiIzE1MWEyNlwiLFxuICBjYXJkRGVlcDogXCIjMGQxMDE4XCIsXG4gIGVkZ2U6IFwiIzI2MmQ0MFwiLFxuICBlZGdlSGk6IFwiIzNhNDM2MFwiLFxuICBnbGFzczogXCJyZ2JhKDE4LCAyMiwgMzQsIDAuNjIpXCIsXG4gIGdsYXNzRWRnZTogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDcpXCIsXG59O1xuXG4vKiogU29ja2V0IGFuZCB3aXJlIGNvbG9ycyBwZXIgc2lnbmFsLiAqL1xuZXhwb3J0IGNvbnN0IFNJR05BTDogUmVjb3JkPFNpZ25hbCwgc3RyaW5nPiA9IHtcbiAgYXVkaW86IFwiIzJlZTZjNVwiLFxuICBjdjogXCIjZmZiNTQ3XCIsXG4gIGdhdGU6IFwiI2ZmNWZhMlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IEZPTlRfTU9OTyA9IFwiTW9ub1wiO1xuXG4vKiogQSBmcm9zdGVkIGZsb2F0aW5nIHBhbmVsIG92ZXIgdGhlIGdyYXBoICh0aGUgY2FtZXJhJ3MgYmFja2Ryb3Ag4oCUIHRoZVxuICogIGdyaWQgYW5kIHRoZSB3aXJlcyDigJQgYmx1cnJlZCBiZWhpbmQgaXQpLiBObyBgYm94U2hhZG93YDogdGhlIGJhY2tkcm9wXG4gKiAgbWFrZXMgdGhlIHBhbmVsIGEgbGF5ZXIsIHdoaWNoIGNhcHR1cmVzIG9ubHkgaXRzIGJvcmRlciBib3guICovXG5leHBvcnQgY29uc3QgZ2xhc3M6IEJldnlTdHlsZSA9IHtcbiAgYmFja2dyb3VuZENvbG9yOiBDLmdsYXNzLFxuICBib3JkZXI6IDEsXG4gIGJvcmRlckNvbG9yOiBDLmdsYXNzRWRnZSxcbiAgYm9yZGVyUmFkaXVzOiAxNCxcbiAgYmFja2Ryb3BGaWx0ZXI6IFtcbiAgICB7IG5hbWU6IFwiYmx1clwiLCBwYXJhbXM6IHsgcmFkaXVzOiAxNiB9IH0sXG4gICAgeyBuYW1lOiBcInNhdHVyYXRlXCIsIHBhcmFtczogeyBhbW91bnQ6IDEuNCB9IH0sXG4gIF0sXG4gIC8vIFRoZSBncmFwaCB1bmRlciBhIHBhbmVsIG5ldmVyIHNlZXMgaXRzIHByZXNzZXMuXG4gIGZvY3VzUG9saWN5OiBcImJsb2NrXCIsXG59O1xuXG4vKiogYCNycmdnYmJgICsgYWxwaGEgKDAuLjEpIOKGkiBgI3JyZ2diYmFhYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbHBoYShoZXg6IHN0cmluZywgYTogbnVtYmVyKTogc3RyaW5nIHtcbiAgY29uc3QgYnl0ZSA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgYSkpICogMjU1KTtcbiAgcmV0dXJuIGhleCArIGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbn1cbiIsICJpbXBvcnQgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgY2FuY2VsQW5pbWF0aW9uLFxuICBpbnRlcnBvbGF0ZSxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhSZXBlYXQsXG4gIHdpdGhUaW1pbmcsXG4gIHR5cGUgU2hhcmVkVmFsdWUsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBDLCBGT05UX01PTk8sIGFscGhhLCByIH0gZnJvbSBcIi4vdGhlbWVcIjtcblxuLyoqIFRoZSB0cmFuc3BvcnQsIHNoYXJlZCBieSBldmVyeSBtb2R1bGU6IGBzdGVwc2AgcnVucyAwIOKGkiAxNiBvdmVyIHR3b1xuICogIGJhcnMgb2YgZWlnaHRoIG5vdGVzIHdoaWxlIHBsYXlpbmcgKEJldnkgZHJpdmVzIGl0OyB0aGUgd2lyZXMnIGdhdGVcbiAqICBwdWxzZXMga2VlcCB0aGUgc2FtZSB0aW1lKSwgYHNwaW5gIHR1cm5zIHRoZSBzZWxlY3Rpb24gcmluZ3MuICovXG5leHBvcnQgdHlwZSBMaXZlID0ge1xuICBwbGF5aW5nOiBib29sZWFuO1xuICBicG06IG51bWJlcjtcbiAgc3RlcHM6IFNoYXJlZFZhbHVlO1xuICBzcGluOiBTaGFyZWRWYWx1ZTtcbn07XG5leHBvcnQgY29uc3QgTGl2ZUNvbnRleHQgPSBjcmVhdGVDb250ZXh0PExpdmU+KG51bGwhKTtcbmV4cG9ydCBjb25zdCB1c2VMaXZlID0gKCkgPT4gdXNlQ29udGV4dChMaXZlQ29udGV4dCk7XG5cbi8qKiBUaGUgY29tbWl0dGVkIHpvb206IGFuaW1hdGVkIHRyYW5zbGF0aW9ucyBhcmUgbG9naWNhbCBweCwgc28gYSBzY3JvbGxpbmdcbiAqICBwcmV2aWV3IG5lZWRzIGl0IHRvIG1vdmUgaW4gZ3JhcGggdW5pdHMuICovXG5leHBvcnQgY29uc3QgWm9vbUNvbnRleHQgPSBjcmVhdGVDb250ZXh0KDEpO1xuXG5leHBvcnQgY29uc3QgU1RFUFMgPSAxNjtcbmV4cG9ydCBjb25zdCBjbGFtcDAxID0gKHY6IG51bWJlcikgPT4gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdikpO1xuXG4vKiogQW4gb3BhY2l0eSBvdmVyIHRoZSBzdGVwIGxvb3A6IHN0ZXAgYGpgIGxpZ2h0cyB0byBgbGV2ZWwoailgICgwLi4xKSBhdFxuICogIGl0cyBzdGFydCBhbmQgZmFkZXMgdGhyb3VnaCBpdCwgYmV0d2VlbiBgZGltYCBhbmQgMS4gV2l0aCBgcGVyYCA+IDEgdGhlXG4gKiAgc3RlcHMgYXJlIHRoYXQgbWFueSB0byBhbiBlaWdodGggKDI6IHNpeHRlZW50aHMsIGBqYCAwLi4zMSkuICovXG5leHBvcnQgZnVuY3Rpb24gc3RlcExpZ2h0KFxuICBzdGVwczogU2hhcmVkVmFsdWUsXG4gIGxldmVsOiAoajogbnVtYmVyKSA9PiBudW1iZXIsXG4gIGRpbSA9IDAuMTYsXG4gIHBlciA9IDEsXG4pIHtcbiAgY29uc3QgaW5wdXQ6IG51bWJlcltdID0gW107XG4gIGNvbnN0IG91dHB1dDogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaiA9IDA7IGogPCBTVEVQUyAqIHBlcjsgaisrKSB7XG4gICAgY29uc3Qgb24gPSBkaW0gKyAoMSAtIGRpbSkgKiBsZXZlbChqKTtcbiAgICBjb25zdCBhdCA9IGogLyBwZXI7XG4gICAgaW5wdXQucHVzaChhdCwgYXQgKyAwLjAzIC8gcGVyLCBhdCArIDAuOTIgLyBwZXIpO1xuICAgIG91dHB1dC5wdXNoKGRpbSwgb24sIGRpbSArIChvbiAtIGRpbSkgKiAwLjMpO1xuICB9XG4gIGlucHV0LnB1c2goU1RFUFMpO1xuICBvdXRwdXQucHVzaChkaW0pO1xuICByZXR1cm4gaW50ZXJwb2xhdGUoc3RlcHMsIGlucHV0LCBvdXRwdXQpO1xufVxuXG4vKiogQSBzdGFibGUgcHNldWRvLXJhbmRvbSAwLi4xIHBlciAoc2VlZCwgaSkuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZChzZWVkOiBudW1iZXIsIGk6IG51bWJlcikge1xuICBjb25zdCB4ID0gTWF0aC5zaW4oc2VlZCAqIDEyNy4xICsgaSAqIDMxMS43KSAqIDQzNzU4LjU0NTM7XG4gIHJldHVybiB4IC0gTWF0aC5mbG9vcih4KTtcbn1cblxuLyoqIEFuIGFyYyBvZiBhIGNpcmNsZSwgYW5nbGVzIGluIGRlZ3JlZXMgY2xvY2t3aXNlIGZyb20gdXAuICovXG5leHBvcnQgZnVuY3Rpb24gYXJjKFxuICBjeDogbnVtYmVyLFxuICBjeTogbnVtYmVyLFxuICByYWQ6IG51bWJlcixcbiAgYTA6IG51bWJlcixcbiAgYTE6IG51bWJlcixcbikge1xuICBjb25zdCBhdCA9IChhOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0ID0gKGEgKiBNYXRoLlBJKSAvIDE4MDtcbiAgICByZXR1cm4gYCR7KGN4ICsgcmFkICogTWF0aC5zaW4odCkpLnRvRml4ZWQoMil9ICR7KGN5IC0gcmFkICogTWF0aC5jb3ModCkpLnRvRml4ZWQoMil9YDtcbiAgfTtcbiAgcmV0dXJuIGBNICR7YXQoYTApfSBBICR7cmFkfSAke3JhZH0gMCAke2ExIC0gYTAgPiAxODAgPyAxIDogMH0gMSAke2F0KGExKX1gO1xufVxuXG5jb25zdCBsYWJlbCA9IHsgZm9udFNpemU6IHIoOSksIGNvbG9yOiBDLmRpbSwgbGV0dGVyU3BhY2luZzogcigwLjYpIH07XG5cbi8qKiBBIGtub2I6IGRyYWcgdXAgYW5kIGRvd24gKFNoaWZ0IGZvciBmaW5lIHN0ZXBzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBLbm9iKHtcbiAgbmFtZSxcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlLFxuICBjb2xvcixcbiAgc2l6ZSA9IDM4LFxuICBzaG93LFxufToge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIG9uQ2hhbmdlOiAodjogbnVtYmVyKSA9PiB2b2lkO1xuICBjb2xvcjogc3RyaW5nO1xuICBzaXplPzogbnVtYmVyO1xuICBzaG93PzogKHY6IG51bWJlcikgPT4gc3RyaW5nO1xufSkge1xuICBjb25zdCBkcmFnID0gdXNlUmVmPHsgeTogbnVtYmVyOyB2OiBudW1iZXIgfSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBhbmdsZSA9IC0xMzUgKyAyNzAgKiB2YWx1ZTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IHIoMykgfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBvblBvaW50ZXJEb3duPXsoZSkgPT4ge1xuICAgICAgICAgIGRyYWcuY3VycmVudCA9IHsgeTogZS5jbGllbnRZLCB2OiB2YWx1ZSB9O1xuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXsoZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGQgPSBkcmFnLmN1cnJlbnQ7XG4gICAgICAgICAgaWYgKGQpXG4gICAgICAgICAgICBvbkNoYW5nZShcbiAgICAgICAgICAgICAgY2xhbXAwMShkLnYgKyAoZC55IC0gZS5jbGllbnRZKSAvIChlLnNoaWZ0S2V5ID8gNzAwIDogMTcwKSksXG4gICAgICAgICAgICApO1xuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJVcD17KCkgPT4ge1xuICAgICAgICAgIGRyYWcuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH19XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiByKHNpemUpLCBoZWlnaHQ6IHIoc2l6ZSksIGN1cnNvcjogXCJuc1Jlc2l6ZVwiIH19XG4gICAgICA+XG4gICAgICAgIDxzdmdcbiAgICAgICAgICB2aWV3Qm94PVwiMCAwIDQwIDQwXCJcbiAgICAgICAgICBzdHlsZT17eyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiIH19XG4gICAgICAgID5cbiAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgZD17YXJjKDIwLCAyMCwgMTcsIC0xMzUsIDEzNSl9XG4gICAgICAgICAgICBzdHJva2U9e0MuZWRnZX1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXszfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIHt2YWx1ZSA+IDAuMDA0ICYmIChcbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGQ9e2FyYygyMCwgMjAsIDE3LCAtMTM1LCBhbmdsZSl9XG4gICAgICAgICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXszfVxuICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc3ZnPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIGxlZnQ6IFwiMjElXCIsXG4gICAgICAgICAgICB0b3A6IFwiMjElXCIsXG4gICAgICAgICAgICB3aWR0aDogXCI1OCVcIixcbiAgICAgICAgICAgIGhlaWdodDogXCI1OCVcIixcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogXCI1MCVcIixcbiAgICAgICAgICAgIGJvcmRlcjogcigxKSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmVkZ2VIaSxcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgICB0eXBlOiBcInJhZGlhbFwiLFxuICAgICAgICAgICAgICBwb3NpdGlvbjogXCJ0b3BMZWZ0XCIsXG4gICAgICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogXCIjM2E0MzYwXCIgfSwgeyBjb2xvcjogXCIjMWExZjJlXCIgfV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm94U2hhZG93OiB7XG4gICAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMCwwLDAsMC41KVwiLFxuICAgICAgICAgICAgICB5T2Zmc2V0OiByKDIpLFxuICAgICAgICAgICAgICBibHVyUmFkaXVzOiByKDQpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyByb3RhdGU6IGFuZ2xlIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgICBob3ZlclN0eWxlPXt7IGJvcmRlckNvbG9yOiBjb2xvciB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICBsZWZ0OiBcIjUwJVwiLFxuICAgICAgICAgICAgICB0b3A6IHIoMiksXG4gICAgICAgICAgICAgIHdpZHRoOiByKDIpLFxuICAgICAgICAgICAgICBoZWlnaHQ6IFwiMzYlXCIsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiByKC0xKSB9LFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoMSksXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3IsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0IHN0eWxlPXtsYWJlbH0+e25hbWV9PC90ZXh0PlxuICAgICAge3Nob3cgJiYgKFxuICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogcig5KSwgY29sb3I6IEMudGV4dCwgZm9udEZhbWlseTogRk9OVF9NT05PIH19PlxuICAgICAgICAgIHtzaG93KHZhbHVlKX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHNlZ21lbnRlZCBjaG9pY2Ugd2l0aCBhIHBpbGwgdGhhdCBzcHJpbmdzIHRvIHRoZSBwaWNrZWQgb3B0aW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRhYnMoe1xuICBvcHRpb25zLFxuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG4gIGNvbG9yLFxufToge1xuICBvcHRpb25zOiBzdHJpbmdbXTtcbiAgdmFsdWU6IG51bWJlcjtcbiAgb25DaGFuZ2U6IChpOiBudW1iZXIpID0+IHZvaWQ7XG4gIGNvbG9yOiBzdHJpbmc7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGhlaWdodDogcigyMiksXG4gICAgICAgIHBhZGRpbmc6IHIoMiksXG4gICAgICAgIGJvcmRlclJhZGl1czogcig3KSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmNhcmREZWVwLFxuICAgICAgICBib3JkZXI6IHIoMSksXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLmVkZ2UsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxLCBmbGV4RGlyZWN0aW9uOiBcInJvd1wiIH19PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB3aWR0aDogYCR7MTAwIC8gb3B0aW9ucy5sZW5ndGh9JWAsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoNSksXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGFscGhhKGNvbG9yLCAwLjIyKSxcbiAgICAgICAgICAgIGJvcmRlcjogcigxKSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBhbHBoYShjb2xvciwgMC41NSksXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWDogYCR7dmFsdWUgKiAxMDB9JWAgfSxcbiAgICAgICAgICAgIHRyYW5zaXRpb246IHsgdHJhbnNmb3JtOiB7IHN0aWZmbmVzczogMzgwLCBkYW1waW5nOiAyOCB9IH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAge29wdGlvbnMubWFwKChvLCBpKSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17b31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKGkpfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICAgIGZsZXhCYXNpczogMCxcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udFNpemU6IHIoOSksXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IHIoMC40KSxcbiAgICAgICAgICAgICAgICBjb2xvcjogaSA9PT0gdmFsdWUgPyBDLnRleHQgOiBDLmZhaW50LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7b31cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgc2NvcGUgd2luZG93OiBgY3ljbGVzYCBwZXJpb2RzIG9mIGB3YXZlKHBoYXNlIDAuLjEpIOKGkiAtMS4uMWAgYWNyb3NzXG4gKiAgaXQsIHNjcm9sbGluZyBsZWZ0IG9uZSBwZXJpb2QgZXZlcnkgYHBlcmlvZE1zYCB3aGlsZSB0aGUgcGF0Y2ggcGxheXMuICovXG5leHBvcnQgZnVuY3Rpb24gU2NvcGUoe1xuICB3YXZlLFxuICBjeWNsZXMsXG4gIHBlcmlvZE1zLFxuICBjb2xvcixcbiAgd2lkdGgsXG4gIGhlaWdodCA9IDQ0LFxufToge1xuICB3YXZlOiAocGhhc2U6IG51bWJlcikgPT4gbnVtYmVyO1xuICBjeWNsZXM6IG51bWJlcjtcbiAgcGVyaW9kTXM6IG51bWJlcjtcbiAgY29sb3I6IHN0cmluZztcbiAgLyoqIFdvcmxkIHB4LiAqL1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ/OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IHsgcGxheWluZyB9ID0gdXNlTGl2ZSgpO1xuICBjb25zdCB6b29tID0gdXNlQ29udGV4dChab29tQ29udGV4dCk7XG4gIGNvbnN0IHQgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXBsYXlpbmcpIHtcbiAgICAgIGNhbmNlbEFuaW1hdGlvbih0KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdC52YWx1ZSA9IDA7XG4gICAgdC52YWx1ZSA9IHdpdGhSZXBlYXQod2l0aFRpbWluZygxLCB7IGR1cmF0aW9uOiBwZXJpb2RNcyB9KSk7XG4gIH0sIFt0LCBwbGF5aW5nLCBwZXJpb2RNc10pO1xuICBjb25zdCBwZXJpb2QgPSB3aWR0aCAvIGN5Y2xlcztcbiAgLy8gT25lIHBlcmlvZCBtb3JlIHRoYW4gc2hvd3MsIHNvIHRoZSBzY3JvbGwgd3JhcHMgc2VhbWxlc3NseS5cbiAgY29uc3QgZHJhd24gPSB3aWR0aCArIHBlcmlvZDtcbiAgY29uc3Qgc2FtcGxlcyA9IE1hdGguY2VpbCgoY3ljbGVzICsgMSkgKiA0OCk7XG4gIGNvbnN0IG1pZCA9IGhlaWdodCAvIDI7XG4gIGxldCBkID0gXCJcIjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc2FtcGxlczsgaSsrKSB7XG4gICAgY29uc3QgeCA9IChpIC8gc2FtcGxlcykgKiBkcmF3bjtcbiAgICBjb25zdCB5ID0gbWlkIC0gd2F2ZSgoKCh4IC8gcGVyaW9kKSAlIDEpICsgMSkgJSAxKSAqIChtaWQgLSA1KTtcbiAgICBkICs9IGAke2kgPyBcIkxcIiA6IFwiTVwifSR7eC50b0ZpeGVkKDEpfSAke3kudG9GaXhlZCgxKX1gO1xuICB9XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiByKHdpZHRoKSxcbiAgICAgICAgaGVpZ2h0OiByKGhlaWdodCksXG4gICAgICAgIG92ZXJmbG93WDogXCJjbGlwXCIsXG4gICAgICAgIG92ZXJmbG93WTogXCJjbGlwXCIsXG4gICAgICAgIGJvcmRlclJhZGl1czogcig2KSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmNhcmREZWVwLFxuICAgICAgICBib3JkZXI6IHIoMSksXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLmVkZ2UsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICB0b3A6IFwiNTAlXCIsXG4gICAgICAgICAgaGVpZ2h0OiByKDEpLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYWxwaGEoXCIjZmZmZmZmXCIsIDAuMDUpLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD17YDAgMCAke2RyYXdufSAke2hlaWdodH1gfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHdpZHRoOiByKGRyYXduKSxcbiAgICAgICAgICBoZWlnaHQ6IHIoaGVpZ2h0KSxcbiAgICAgICAgICB0cmFuc2Zvcm06IHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZVg6IHtcbiAgICAgICAgICAgICAgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHQsIFswLCAxXSwgWzAsIC1wZXJpb2QgKiB6b29tXSksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD17ZH1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXthbHBoYShjb2xvciwgMC4yNSl9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezV9XG4gICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD17ZH1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MS42fVxuICAgICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICAvPlxuICAgICAgPC9zdmc+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQW4gTEVEIG1ldGVyOiBgY291bnRgIHNlZ21lbnRzIGJvdW5jaW5nIG9uIHRoZSBzdGVwIGxvb3AsIGVhY2ggc3RlcCBhdFxuICogIGEgbGV2ZWwgcGlja2VkIGZyb20gYHNlZWRgLCBzY2FsZWQgYnkgYGdhaW5gLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1ldGVyKHtcbiAgc2VlZCxcbiAgZ2FpbixcbiAgY29sb3IsXG4gIGNvdW50ID0gMTAsXG4gIGhlaWdodCA9IDY0LFxuICB3aWR0aCA9IDgsXG59OiB7XG4gIHNlZWQ6IG51bWJlcjtcbiAgZ2FpbjogbnVtYmVyO1xuICBjb2xvcjogc3RyaW5nO1xuICBjb3VudD86IG51bWJlcjtcbiAgaGVpZ2h0PzogbnVtYmVyO1xuICB3aWR0aD86IG51bWJlcjtcbn0pIHtcbiAgY29uc3QgeyBzdGVwcyB9ID0gdXNlTGl2ZSgpO1xuICBjb25zdCBsZXZlbHMgPSBBcnJheS5mcm9tKFxuICAgIHsgbGVuZ3RoOiBTVEVQUyB9LFxuICAgIChfLCBqKSA9PiBnYWluICogKDAuMzUgKyAwLjY1ICogcmFuZChzZWVkLCBqKSksXG4gICk7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGhlaWdodDogcihoZWlnaHQpLFxuICAgICAgICB3aWR0aDogcih3aWR0aCksXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uUmV2ZXJzZVwiLFxuICAgICAgICBnYXA6IHIoMiksXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBjb3VudCB9LCAoXywgaykgPT4ge1xuICAgICAgICBjb25zdCBhdCA9IChrICsgMC41KSAvIGNvdW50O1xuICAgICAgICBjb25zdCBodWUgPVxuICAgICAgICAgIGsgPj0gY291bnQgLSAyID8gXCIjZmY1ZjdhXCIgOiBrID49IGNvdW50IC0gNCA/IFwiI2ZmZDE2NlwiIDogY29sb3I7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17a31cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoMS41KSxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBodWUsXG4gICAgICAgICAgICAgIG9wYWNpdHk6IHtcbiAgICAgICAgICAgICAgICBhbmltYXRlZDogc3RlcExpZ2h0KFxuICAgICAgICAgICAgICAgICAgc3RlcHMsXG4gICAgICAgICAgICAgICAgICAoaikgPT4gKGxldmVsc1tqXSA+PSBhdCA/IDEgOiAwKSxcbiAgICAgICAgICAgICAgICAgIDAuMSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSByb3VuZCBMRUQgb24gdGhlIHN0ZXAgbG9vcC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMZWQoe1xuICBsZXZlbCxcbiAgY29sb3IsXG4gIHNpemUgPSA3LFxufToge1xuICBsZXZlbDogKGo6IG51bWJlcikgPT4gbnVtYmVyO1xuICBjb2xvcjogc3RyaW5nO1xuICBzaXplPzogbnVtYmVyO1xufSkge1xuICBjb25zdCB7IHN0ZXBzIH0gPSB1c2VMaXZlKCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiByKHNpemUpLFxuICAgICAgICBoZWlnaHQ6IHIoc2l6ZSksXG4gICAgICAgIGJvcmRlclJhZGl1czogXCI1MCVcIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgICAgYm94U2hhZG93OiB7IGNvbG9yOiBhbHBoYShjb2xvciwgMC42KSwgYmx1clJhZGl1czogcig2KSB9LFxuICAgICAgICBvcGFjaXR5OiB7IGFuaW1hdGVkOiBzdGVwTGlnaHQoc3RlcHMsIGxldmVsLCAwLjE0KSB9LFxuICAgICAgfX1cbiAgICAvPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IFNoYXJlZFZhbHVlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgR3JhcGhOb2RlIH0gZnJvbSBcIi4uL2dyYXBoL21vZGVsXCI7XG5pbXBvcnQgeyByIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5cbi8qKiBXaGF0IGVhY2ggbW9kdWxlIHNob3dzIHVuZGVyIGl0cyBzb2NrZXRzLiBFdmVyeXRoaW5nIHRoYXQgbW92ZXMgcnVucyBvblxuICogIHRoZSBzdGVwIGxvb3AgaW4gQmV2eSAoYHN0ZXBMaWdodGAsIGBTY29wZWApOiBSZWFjdCByZW5kZXJzIG9ubHkgd2hlbiBhXG4gKiAga25vYiB0dXJucy4gKi9cblxuZXhwb3J0IHR5cGUgQm9keVByb3BzID0ge1xuICBub2RlOiBHcmFwaE5vZGU7XG4gIHNldDogKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSA9PiB2b2lkO1xuICBjb2xvcjogc3RyaW5nO1xuICBzdGVwczogU2hhcmVkVmFsdWU7XG59O1xuXG5leHBvcnQgY29uc3QgQ29sID0gKHtcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDgsXG59OiB7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG4gIGdhcD86IG51bWJlcjtcbn0pID0+IChcbiAgPG5vZGVcbiAgICBzdHlsZT17e1xuICAgICAgZmxleEdyb3c6IDEsXG4gICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICBnYXA6IHIoZ2FwKSxcbiAgICB9fVxuICA+XG4gICAge2NoaWxkcmVufVxuICA8L25vZGU+XG4pO1xuZXhwb3J0IGNvbnN0IFJvdyA9ICh7XG4gIGNoaWxkcmVuLFxuICBnYXAgPSAxMCxcbn06IHtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbiAgZ2FwPzogbnVtYmVyO1xufSkgPT4gKFxuICA8bm9kZVxuICAgIHN0eWxlPXt7XG4gICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgZ2FwOiByKGdhcCksXG4gICAgfX1cbiAgPlxuICAgIHtjaGlsZHJlbn1cbiAgPC9ub2RlPlxuKTtcblxuZXhwb3J0IGNvbnN0IHBjdCA9ICh2OiBudW1iZXIpID0+IGAke01hdGgucm91bmQodiAqIDEwMCl9YDtcbiIsICJpbXBvcnQgdHlwZSB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQywgU0lHTkFMLCBhbHBoYSwgciB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgS25vYiwgVGFicywgcmFuZCwgc3RlcExpZ2h0IH0gZnJvbSBcIi4uL3dpZGdldHNcIjtcbmltcG9ydCB7IHR5cGUgQm9keVByb3BzLCBDb2wsIFJvdywgcGN0IH0gZnJvbSBcIi4va2l0XCI7XG5cbi8qKiBUaGUgZHJ1bSBtYWNoaW5lOiB0aGUgYmVhdCdzIGdyaWQgb2YgaGl0cyBhbmQgdGhlIGRydW0gdm9pY2UuICovXG5cbmNvbnN0IExBTkVTID0gW1wiQVwiLCBcIkJcIiwgXCJDXCIsIFwiRFwiXTtcblxuLyoqIExpZ2h0cyBzaXh0ZWVudGggYGlgIG9mIHRoZSBiYXIgKHRoZSB0cmFuc3BvcnQgcnVucyB0d28gYmFyczogYGpgIGlzXG4gKiAgaXRzIHNpeHRlZW50aCwgMC4uMzEpLiAqL1xuY29uc3Qgc2l4dGVlbnRoID0gKGk6IG51bWJlcikgPT4gKGo6IG51bWJlcikgPT4gKGogJSAxNiA9PT0gaSA/IDEgOiAwKTtcblxuZXhwb3J0IGZ1bmN0aW9uIEJlYXQoeyBub2RlLCBzZXQsIGNvbG9yLCBzdGVwcyB9OiBCb2R5UHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8Q29sIGdhcD17NX0+XG4gICAgICB7TEFORVMubWFwKChuYW1lLCBsYW5lKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hc2sgPSBub2RlLnBhcmFtc1tgayR7bGFuZX1gXTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8TGFuZSBrZXk9e25hbWV9IG5hbWU9e25hbWV9PlxuICAgICAgICAgICAgeyhpKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG9uID0gKChtYXNrID4+IGkpICYgMSkgPT09IDE7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFBhZFxuICAgICAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICAgICAgb249e29ufVxuICAgICAgICAgICAgICAgICAgZG93bmJlYXQ9e2kgJSA0ID09PSAwfVxuICAgICAgICAgICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0KGBrJHtsYW5lfWAsIG1hc2sgXiAoMSA8PCBpKSl9XG4gICAgICAgICAgICAgICAgICBnbG93PXtvbiA/IHN0ZXBMaWdodChzdGVwcywgc2l4dGVlbnRoKGkpLCAwLCAyKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPC9MYW5lPlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgICA8TGFuZSBuYW1lPVwiXCI+XG4gICAgICAgIHsoaSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgICAgZmxleEJhc2lzOiAwLFxuICAgICAgICAgICAgICBoZWlnaHQ6IHIoMyksXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogcigxLjUpLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGkgJSA0ID8gQy5kaW0gOiBcIiNmZmZmZmZcIixcbiAgICAgICAgICAgICAgb3BhY2l0eTogeyBhbmltYXRlZDogc3RlcExpZ2h0KHN0ZXBzLCBzaXh0ZWVudGgoaSksIDAuMTUsIDIpIH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICl9XG4gICAgICA8L0xhbmU+XG4gICAgPC9Db2w+XG4gICk7XG59XG5cbi8qKiBBIGxhbmUncyBuYW1lLCB0aGVuIGl0cyBzaXh0ZWVuIGluIGZvdXJzLiAqL1xuZnVuY3Rpb24gTGFuZSh7XG4gIG5hbWUsXG4gIGNoaWxkcmVuLFxufToge1xuICBuYW1lOiBzdHJpbmc7XG4gIGNoaWxkcmVuOiAoaTogbnVtYmVyKSA9PiBSZWFjdE5vZGU7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiByKDYpIH19PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogcig5KSxcbiAgICAgICAgICBmb250U2l6ZTogcig5KSxcbiAgICAgICAgICBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsXG4gICAgICAgICAgY29sb3I6IEMuZGltLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bmFtZX1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxLCBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IHIoNikgfX0+XG4gICAgICAgIHtbMCwgMSwgMiwgM10ubWFwKChiZWF0KSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17YmVhdH1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgICBmbGV4QmFzaXM6IDAsXG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGdhcDogcigyLjUpLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7WzAsIDEsIDIsIDNdLm1hcCgoaykgPT4gY2hpbGRyZW4oYmVhdCAqIDQgKyBrKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHN0ZXAgb2YgYSBsYW5lOiBjbGljayB0byB0b2dnbGU7IGEgaGl0IGZsYXNoZXMgYXMgaXQgcGxheXMuICovXG5mdW5jdGlvbiBQYWQoe1xuICBvbixcbiAgZG93bmJlYXQsXG4gIGNvbG9yLFxuICBvbkNsaWNrLFxuICBnbG93LFxufToge1xuICBvbjogYm9vbGVhbjtcbiAgZG93bmJlYXQ6IGJvb2xlYW47XG4gIGNvbG9yOiBzdHJpbmc7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIGdsb3c6IFJldHVyblR5cGU8dHlwZW9mIHN0ZXBMaWdodD4gfCBudWxsO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgIGZsZXhCYXNpczogMCxcbiAgICAgICAgaGVpZ2h0OiByKDE3KSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiByKDMpLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IG9uXG4gICAgICAgICAgPyBhbHBoYShjb2xvciwgMC43KVxuICAgICAgICAgIDogZG93bmJlYXRcbiAgICAgICAgICAgID8gXCIjMTcxYzJhXCJcbiAgICAgICAgICAgIDogQy5jYXJkRGVlcCxcbiAgICAgICAgYm9yZGVyOiByKDEpLFxuICAgICAgICBib3JkZXJDb2xvcjogb24gPyBjb2xvciA6IEMuZWRnZSxcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXt7IGJvcmRlckNvbG9yOiBDLnRleHQgfX1cbiAgICA+XG4gICAgICB7Z2xvdyAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiByKDIpLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNmZmZmZmZcIixcbiAgICAgICAgICAgIG9wYWNpdHk6IHsgYW5pbWF0ZWQ6IGdsb3cgfSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IFZPSUNFUyA9IFtcIktJQ0tcIiwgXCJTTkFSRVwiLCBcIkNMQVBcIiwgXCJIQVRcIl07XG5cbi8qKiBFYWNoIHZvaWNlJ3MgbWFpbiBkZWNheSwgc2Vjb25kcywgYXMgYHN5bnRoL2RydW1zLnJzYCBoYXMgaXQuICovXG5jb25zdCBERUNBWVMgPSBbXG4gIChkOiBudW1iZXIpID0+IDAuMDggKyBkICogZCAqIDAuNyxcbiAgKGQ6IG51bWJlcikgPT4gMC4wNSArIGQgKiBkICogMC4zLFxuICAoZDogbnVtYmVyKSA9PiAwLjA1ICsgZCAqIGQgKiAwLjQsXG4gIChkOiBudW1iZXIpID0+IDAuMDEyICsgZCAqIGQgKiAwLjM1LFxuXTtcblxuLyoqIFdoYXQgYHR1bmVgIGRvZXMsIHBlciB2b2ljZTogdGhlIHBpdGNoIGl0IHNldHMuICovXG5jb25zdCBQSVRDSCA9IFtcbiAgKHY6IG51bWJlcikgPT4gYCR7TWF0aC5yb3VuZCg0MCAqIDIgKiogKHYgKiAxLjI1KSl9YCxcbiAgKHY6IG51bWJlcikgPT4gYCR7TWF0aC5yb3VuZCgxNjAgKiAyICoqIHYpfWAsXG4gICh2OiBudW1iZXIpID0+IGAke01hdGgucm91bmQoOTAwICogMiAqKiAodiAqIDEuNSkpfWAsXG4gICh2OiBudW1iZXIpID0+IGAkeyg5ICogMiAqKiAodiAtIDAuNSkpLnRvRml4ZWQoMSl9a2AsXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gRHJ1bSh7IG5vZGUsIHNldCwgY29sb3IgfTogQm9keVByb3BzKSB7XG4gIGNvbnN0IHsgdm9pY2UsIHR1bmUsIGRlY2F5LCBsZXZlbCB9ID0gbm9kZS5wYXJhbXM7XG4gIHJldHVybiAoXG4gICAgPENvbD5cbiAgICAgIDxIaXQgdm9pY2U9e3ZvaWNlfSBkZWNheT17ZGVjYXl9IGxldmVsPXtsZXZlbH0gLz5cbiAgICAgIDxUYWJzXG4gICAgICAgIG9wdGlvbnM9e1ZPSUNFU31cbiAgICAgICAgdmFsdWU9e3ZvaWNlfVxuICAgICAgICBvbkNoYW5nZT17KGkpID0+IHNldChcInZvaWNlXCIsIGkpfVxuICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAvPlxuICAgICAgPFJvdyBnYXA9ezE2fT5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiVFVORVwiXG4gICAgICAgICAgdmFsdWU9e3R1bmV9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJ0dW5lXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICBzaXplPXszMn1cbiAgICAgICAgICBzaG93PXtQSVRDSFt2b2ljZV19XG4gICAgICAgIC8+XG4gICAgICAgIDxLbm9iXG4gICAgICAgICAgbmFtZT1cIkRFQ0FZXCJcbiAgICAgICAgICB2YWx1ZT17ZGVjYXl9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJkZWNheVwiLCB2KX1cbiAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgc2l6ZT17MzJ9XG4gICAgICAgICAgc2hvdz17KHYpID0+IGAke01hdGgucm91bmQoREVDQVlTW3ZvaWNlXSh2KSAqIDEwMDApfW1zYH1cbiAgICAgICAgLz5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiTEVWRUxcIlxuICAgICAgICAgIHZhbHVlPXtsZXZlbH1cbiAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldChcImxldmVsXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICBzaXplPXszMn1cbiAgICAgICAgICBzaG93PXtwY3R9XG4gICAgICAgIC8+XG4gICAgICA8L1Jvdz5cbiAgICA8L0NvbD5cbiAgKTtcbn1cblxuLyoqIEEgZHJhd2luZyBvZiBvbmUgaGl0IG92ZXIgMC42IHM6IGEga2ljaydzIHNsb3dpbmcgc3dpbmcsIGEgc25hcmUncyB0b25lXG4gKiAgaW4gbm9pc2UsIGEgY2xhcCdzIHNsYXBzLCBhIGhhdCdzIGhpc3MuICovXG5mdW5jdGlvbiBIaXQoe1xuICB2b2ljZSxcbiAgZGVjYXksXG4gIGxldmVsLFxufToge1xuICB2b2ljZTogbnVtYmVyO1xuICBkZWNheTogbnVtYmVyO1xuICBsZXZlbDogbnVtYmVyO1xufSkge1xuICBjb25zdCBXID0gMjEyO1xuICBjb25zdCBIID0gNDA7XG4gIGNvbnN0IE4gPSAyNDA7XG4gIGNvbnN0IHRhdSA9IERFQ0FZU1t2b2ljZV0oZGVjYXkpO1xuICBjb25zdCBlbnYgPSAodDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKHZvaWNlICE9PSAyKSByZXR1cm4gTWF0aC5leHAoLXQgLyB0YXUpO1xuICAgIGNvbnN0IHNsYXBzID0gWzAsIDAuMDExLCAwLjAyMl0ubWFwKChhKSA9PlxuICAgICAgdCA+PSBhID8gTWF0aC5leHAoLSh0IC0gYSkgLyAwLjAwNDUpIDogMCxcbiAgICApO1xuICAgIGNvbnN0IHRhaWwgPSB0ID49IDAuMDI0ID8gMC43ICogTWF0aC5leHAoLSh0IC0gMC4wMjQpIC8gdGF1KSA6IDA7XG4gICAgcmV0dXJuIE1hdGgubWF4KHRhaWwsIC4uLnNsYXBzKTtcbiAgfTtcbiAgbGV0IGxpbmUgPSBcIlwiO1xuICBmb3IgKGxldCBpID0gMDsgaSA8PSBOOyBpKyspIHtcbiAgICBjb25zdCB0ID0gKGkgLyBOKSAqIDAuNjtcbiAgICBjb25zdCBub2lzZSA9IHJhbmQoMTMgKyB2b2ljZSwgaSkgKiAyIC0gMTtcbiAgICBjb25zdCB2ID0gW1xuICAgICAgTWF0aC5zaW4oTWF0aC5QSSAqIDIgKiA3ICogKDEgLSBNYXRoLmV4cCgtdCAqIDMpKSksXG4gICAgICAwLjUgKiBNYXRoLnNpbihNYXRoLlBJICogMiAqIDI0ICogdCkgKyAwLjYgKiBub2lzZSxcbiAgICAgIG5vaXNlLFxuICAgICAgbm9pc2UsXG4gICAgXVt2b2ljZV07XG4gICAgY29uc3QgeSA9XG4gICAgICBIIC8gMiAtXG4gICAgICBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgdikpICogZW52KHQpICogKEggLyAyIC0gNCkgKiAoMC40ICsgMC42ICogbGV2ZWwpO1xuICAgIGxpbmUgKz0gYCR7aSA/IFwiTFwiIDogXCJNXCJ9JHsoKGkgLyBOKSAqIFcpLnRvRml4ZWQoMSl9ICR7eS50b0ZpeGVkKDEpfWA7XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgaGVpZ2h0OiByKEgpLFxuICAgICAgICBib3JkZXJSYWRpdXM6IHIoNiksXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jYXJkRGVlcCxcbiAgICAgICAgYm9yZGVyOiByKDEpLFxuICAgICAgICBib3JkZXJDb2xvcjogQy5lZGdlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3ZnIHZpZXdCb3g9e2AwIDAgJHtXfSAke0h9YH0gc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiIH19PlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9e2xpbmV9XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17U0lHTkFMLmF1ZGlvfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjJ9XG4gICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBpbnRlcnBvbGF0ZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBDLCBTSUdOQUwsIGFscGhhLCByIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBLbm9iLCBNZXRlciwgU1RFUFMsIFRhYnMsIGNsYW1wMDEsIHJhbmQsIHN0ZXBMaWdodCB9IGZyb20gXCIuLi93aWRnZXRzXCI7XG5pbXBvcnQgeyB0eXBlIEJvZHlQcm9wcywgQ29sLCBSb3csIHBjdCB9IGZyb20gXCIuL2tpdFwiO1xuXG4vKiogVGhlIG1vZHVsZXMgdGhhdCBtb3ZlIGxldmVscyBhbmQgc3BhY2U6IG1peGVyLCBkZWxheSwgcmV2ZXJiLCBvdXRwdXQuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBNaXhlcih7IG5vZGUsIHNldCwgY29sb3IgfTogQm9keVByb3BzKSB7XG4gIHJldHVybiAoXG4gICAgPFJvdyBnYXA9ezEyfT5cbiAgICAgIHtbMCwgMSwgMiwgM10ubWFwKChpKSA9PiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAga2V5PXtpfVxuICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogcig1KSB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogcig2KSwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxGYWRlclxuICAgICAgICAgICAgICB2YWx1ZT17bm9kZS5wYXJhbXNbYGwke2l9YF19XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KGBsJHtpfWAsIHYpfVxuICAgICAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPE1ldGVyXG4gICAgICAgICAgICAgIHNlZWQ9ezExICsgaX1cbiAgICAgICAgICAgICAgZ2Fpbj17bm9kZS5wYXJhbXNbYGwke2l9YF19XG4gICAgICAgICAgICAgIGNvbG9yPXtTSUdOQUwuYXVkaW99XG4gICAgICAgICAgICAgIGhlaWdodD17Njh9XG4gICAgICAgICAgICAgIHdpZHRoPXs2fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IHIoOSksIGNvbG9yOiBDLmRpbSB9fT57YENIICR7aSArIDF9YH08L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkpfVxuICAgIDwvUm93PlxuICApO1xufVxuXG5mdW5jdGlvbiBGYWRlcih7XG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbiAgY29sb3IsXG59OiB7XG4gIHZhbHVlOiBudW1iZXI7XG4gIG9uQ2hhbmdlOiAodjogbnVtYmVyKSA9PiB2b2lkO1xuICBjb2xvcjogc3RyaW5nO1xufSkge1xuICBjb25zdCBkcmFnID0gdXNlUmVmPHsgeTogbnVtYmVyOyB2OiBudW1iZXIgfSB8IG51bGw+KG51bGwpO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBvblBvaW50ZXJEb3duPXsoZSkgPT4ge1xuICAgICAgICBkcmFnLmN1cnJlbnQgPSB7IHk6IGUuY2xpZW50WSwgdjogdmFsdWUgfTtcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZSkgPT4ge1xuICAgICAgICBjb25zdCBkID0gZHJhZy5jdXJyZW50O1xuICAgICAgICBpZiAoZCkgb25DaGFuZ2UoY2xhbXAwMShkLnYgKyAoZC55IC0gZS5jbGllbnRZKSAvIDEwMCkpO1xuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoKSA9PiB7XG4gICAgICAgIGRyYWcuY3VycmVudCA9IG51bGw7XG4gICAgICB9fVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IHIoMjIpLFxuICAgICAgICBoZWlnaHQ6IHIoNjgpLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBjdXJzb3I6IFwibnNSZXNpemVcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogcig0KSxcbiAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogcigyKSxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuY2FyZERlZXAsXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgd2lkdGg6IHIoNCksXG4gICAgICAgICAgaGVpZ2h0OiBgJHt2YWx1ZSAqIDEwMH0lYCxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoMiksXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGJvdHRvbTogYCR7dmFsdWUgKiAxMDB9JWAsXG4gICAgICAgICAgbWFyZ2luOiB7IGJvdHRvbTogcigtNSkgfSxcbiAgICAgICAgICB3aWR0aDogcigyMCksXG4gICAgICAgICAgaGVpZ2h0OiByKDEwKSxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoMyksXG4gICAgICAgICAgYm9yZGVyOiByKDEpLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmVkZ2VIaSxcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBcIiMzYTQzNjBcIiB9LCB7IGNvbG9yOiBcIiMyMDI2MzhcIiB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgICBob3ZlclN0eWxlPXt7IGJvcmRlckNvbG9yOiBjb2xvciB9fVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHN5bmNlZCBkZWxheSdzIG5vdGUgdmFsdWVzIChgTk9URVNgIGluIGBzeW50aC9lZmZlY3RzLnJzYCkuICovXG5jb25zdCBOT1RFUyA9IFtcIjEvMTZcIiwgXCIxLzhcIiwgXCIxLzguXCIsIFwiMS80XCIsIFwiMS80LlwiLCBcIjEvMlwiXTtcblxuZXhwb3J0IGZ1bmN0aW9uIERlbGF5KHsgbm9kZSwgc2V0LCBjb2xvciwgc3RlcHMgfTogQm9keVByb3BzKSB7XG4gIGNvbnN0IHsgdGltZSwgZmVlZGJhY2ssIG1peCwgc3luYyB9ID0gbm9kZS5wYXJhbXM7XG4gIHJldHVybiAoXG4gICAgPENvbD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgaGVpZ2h0OiByKDM4KSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLFxuICAgICAgICAgIGdhcDogcig1KSxcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IHIoNiksIHJpZ2h0OiByKDYpLCBib3R0b206IHIoNSkgfSxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoNiksXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmNhcmREZWVwLFxuICAgICAgICAgIGJvcmRlcjogcigxKSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5lZGdlLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogMTIgfSwgKF8sIGspID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtrfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICAgIGhlaWdodDogYCR7TWF0aC5tYXgoNiwgOTAgKiBmZWVkYmFjayAqKiAoayAqICgwLjQgKyB0aW1lKSkpfSVgLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoMiksXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogayA/IFNJR05BTC5hdWRpbyA6IFwiI2ZmZmZmZlwiLFxuICAgICAgICAgICAgICBvcGFjaXR5OiB7XG4gICAgICAgICAgICAgICAgYW5pbWF0ZWQ6IHN0ZXBMaWdodChcbiAgICAgICAgICAgICAgICAgIHN0ZXBzLFxuICAgICAgICAgICAgICAgICAgKGopID0+ICgoaiAtIGsgKyBTVEVQUykgJSA0ID09PSAwID8gMSA6IDApLFxuICAgICAgICAgICAgICAgICAgMC4xOCxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxUYWJzXG4gICAgICAgIG9wdGlvbnM9e1tcIkZSRUVcIiwgXCJTWU5DXCJdfVxuICAgICAgICB2YWx1ZT17c3luY31cbiAgICAgICAgb25DaGFuZ2U9eyhpKSA9PiBzZXQoXCJzeW5jXCIsIGkpfVxuICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAvPlxuICAgICAgPFJvdyBnYXA9ezE0fT5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiVElNRVwiXG4gICAgICAgICAgdmFsdWU9e3RpbWV9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJ0aW1lXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICBzaXplPXszMn1cbiAgICAgICAgICBzaG93PXsodikgPT5cbiAgICAgICAgICAgIHN5bmMgPyBOT1RFU1tNYXRoLnJvdW5kKHYgKiA1KV0gOiBgJHtNYXRoLnJvdW5kKDQwICsgdiAqIDk2MCl9bXNgXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8S25vYlxuICAgICAgICAgIG5hbWU9XCJGREJLXCJcbiAgICAgICAgICB2YWx1ZT17ZmVlZGJhY2t9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJmZWVkYmFja1wiLCB2KX1cbiAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgc2l6ZT17MzJ9XG4gICAgICAgICAgc2hvdz17cGN0fVxuICAgICAgICAvPlxuICAgICAgICA8S25vYlxuICAgICAgICAgIG5hbWU9XCJNSVhcIlxuICAgICAgICAgIHZhbHVlPXttaXh9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJtaXhcIiwgdil9XG4gICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgIHNpemU9ezMyfVxuICAgICAgICAgIHNob3c9e3BjdH1cbiAgICAgICAgLz5cbiAgICAgIDwvUm93PlxuICAgIDwvQ29sPlxuICApO1xufVxuXG4vKiogUmVmbGVjdGlvbnMgcGVyIHNpZGUgaW4gdGhlIHJldmVyYidzIHBpY3R1cmUuICovXG5jb25zdCBUQUlMID0gMjA7XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZlcmIoeyBub2RlLCBzZXQsIGNvbG9yLCBzdGVwcyB9OiBCb2R5UHJvcHMpIHtcbiAgY29uc3QgeyBzaXplLCBkYW1wLCBtaXggfSA9IG5vZGUucGFyYW1zO1xuICAvLyBPbiBldmVyeSBiZWF0IGEgd2FzaCBydW5zIG91dCBhY3Jvc3MgdGhlIHJlZmxlY3Rpb25zLCBsZWZ0IGFib3ZlIHRoZVxuICAvLyBsaW5lIGFuZCByaWdodCBiZWxvdzogbG9uZ2VyIHRoZSBiaWdnZXIgdGhlIHBsYXRlLCBkaW1tZXIgdGhlIGRhbXBlci5cbiAgY29uc3Qgd2FzaCA9IChrOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBpbnB1dDogbnVtYmVyW10gPSBbXTtcbiAgICBjb25zdCBvdXRwdXQ6IG51bWJlcltdID0gW107XG4gICAgY29uc3QgbGF0ZSA9IChrIC8gVEFJTCkgKiAxLjY7XG4gICAgY29uc3QgcGVhayA9IE1hdGguZXhwKC1rIC8gKFRBSUwgKiAoMC4xMiArIHNpemUgKiAwLjcpKSkgKiAoMSAtIGRhbXAgKiAwLjUpO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgU1RFUFM7IGogKz0gMikge1xuICAgICAgaW5wdXQucHVzaChqICsgbGF0ZSwgaiArIGxhdGUgKyAwLjA0LCBqICsgbGF0ZSArIDAuMzUpO1xuICAgICAgb3V0cHV0LnB1c2goMC4xNSwgMC4xNSArIDAuODUgKiBwZWFrLCAwLjE1KTtcbiAgICB9XG4gICAgcmV0dXJuIGludGVycG9sYXRlKHN0ZXBzLCBpbnB1dCwgb3V0cHV0KTtcbiAgfTtcbiAgY29uc3Qgc2lkZSA9ICh0b3A6IGJvb2xlYW4pID0+IChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgaGVpZ2h0OiBcIjUwJVwiLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiB0b3AgPyBcImZsZXhFbmRcIiA6IFwiZmxleFN0YXJ0XCIsXG4gICAgICAgIGdhcDogcigzKSxcbiAgICAgIH19XG4gICAgPlxuICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IFRBSUwgfSwgKF8sIGspID0+IChcbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBrZXk9e2t9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgaGVpZ2h0OiBgJHtNYXRoLm1heCg4LCA5NSAqIE1hdGguZXhwKC1rIC8gKFRBSUwgKiAoMC4xMiArIHNpemUgKiAwLjcpKSkgKiAoMC41NSArIDAuNDUgKiByYW5kKHRvcCA/IDMxIDogMzcsIGspKSl9JWAsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoMS41KSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYWxwaGEoU0lHTkFMLmF1ZGlvLCAxIC0gZGFtcCAqIDAuNDUpLFxuICAgICAgICAgICAgb3BhY2l0eTogeyBhbmltYXRlZDogd2FzaChrKSB9LFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L25vZGU+XG4gICk7XG4gIHJldHVybiAoXG4gICAgPENvbD5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgaGVpZ2h0OiByKDQwKSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogcig2KSwgdmVydGljYWw6IHIoNCkgfSxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoNiksXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmNhcmREZWVwLFxuICAgICAgICAgIGJvcmRlcjogcigxKSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5lZGdlLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7c2lkZSh0cnVlKX1cbiAgICAgICAge3NpZGUoZmFsc2UpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPFJvdyBnYXA9ezE0fT5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiU0laRVwiXG4gICAgICAgICAgdmFsdWU9e3NpemV9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJzaXplXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICBzaXplPXszMn1cbiAgICAgICAgICBzaG93PXtwY3R9XG4gICAgICAgIC8+XG4gICAgICAgIDxLbm9iXG4gICAgICAgICAgbmFtZT1cIkRBTVBcIlxuICAgICAgICAgIHZhbHVlPXtkYW1wfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KFwiZGFtcFwiLCB2KX1cbiAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgc2l6ZT17MzJ9XG4gICAgICAgICAgc2hvdz17cGN0fVxuICAgICAgICAvPlxuICAgICAgICA8S25vYlxuICAgICAgICAgIG5hbWU9XCJNSVhcIlxuICAgICAgICAgIHZhbHVlPXttaXh9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJtaXhcIiwgdil9XG4gICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgIHNpemU9ezMyfVxuICAgICAgICAgIHNob3c9e3BjdH1cbiAgICAgICAgLz5cbiAgICAgIDwvUm93PlxuICAgIDwvQ29sPlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gT3V0cHV0KHsgbm9kZSwgc2V0LCBjb2xvciwgc3RlcHMgfTogQm9keVByb3BzKSB7XG4gIGNvbnN0IHsgdm9sdW1lIH0gPSBub2RlLnBhcmFtcztcbiAgLy8gVGhlIGNvbmUga2lja3Mgb24gZXZlcnkgYmVhdC5cbiAgY29uc3QgaW5wdXQ6IG51bWJlcltdID0gW107XG4gIGNvbnN0IG91dHB1dDogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaiA9IDA7IGogPCBTVEVQUzsgaiArPSAyKSB7XG4gICAgaW5wdXQucHVzaChqLCBqICsgMC4wNSwgaiArIDEuNik7XG4gICAgb3V0cHV0LnB1c2goMSwgMSArIDAuMTIgKiB2b2x1bWUsIDEpO1xuICB9XG4gIGNvbnN0IGtpY2sgPSBpbnRlcnBvbGF0ZShzdGVwcywgaW5wdXQsIG91dHB1dCk7XG4gIHJldHVybiAoXG4gICAgPFJvdyBnYXA9ezE0fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IHIoNjgpLFxuICAgICAgICAgIGhlaWdodDogcig2OCksXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiBcIjUwJVwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgYm9yZGVyOiByKDIpLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmVkZ2VIaSxcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwicmFkaWFsXCIsXG4gICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiIzFlMjQzNFwiIH0sIHsgY29sb3I6IFwiIzBiMGUxNVwiIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiByKDQ2KSxcbiAgICAgICAgICAgIGhlaWdodDogcig0NiksXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IFwiNTAlXCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgICAgdHlwZTogXCJyYWRpYWxcIixcbiAgICAgICAgICAgICAgcG9zaXRpb246IFwidG9wTGVmdFwiLFxuICAgICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiIzRhNTM3NFwiIH0sIHsgY29sb3I6IFwiIzE2MWIyOFwiIH1dLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogeyBzY2FsZTogeyBhbmltYXRlZDoga2ljayB9IH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogcigxNCksXG4gICAgICAgICAgICAgIGhlaWdodDogcigxNCksXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogXCI1MCVcIixcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBhbHBoYShjb2xvciwgMC44KSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPFJvdyBnYXA9ezR9PlxuICAgICAgICA8TWV0ZXIgc2VlZD17MjF9IGdhaW49e3ZvbHVtZX0gY29sb3I9e1NJR05BTC5hdWRpb30gaGVpZ2h0PXs2OH0gLz5cbiAgICAgICAgPE1ldGVyXG4gICAgICAgICAgc2VlZD17MjJ9XG4gICAgICAgICAgZ2Fpbj17dm9sdW1lICogMC45Mn1cbiAgICAgICAgICBjb2xvcj17U0lHTkFMLmF1ZGlvfVxuICAgICAgICAgIGhlaWdodD17Njh9XG4gICAgICAgIC8+XG4gICAgICA8L1Jvdz5cbiAgICAgIDxLbm9iXG4gICAgICAgIG5hbWU9XCJWT0xVTUVcIlxuICAgICAgICB2YWx1ZT17dm9sdW1lfVxuICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldChcInZvbHVtZVwiLCB2KX1cbiAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICBzaG93PXtwY3R9XG4gICAgICAvPlxuICAgIDwvUm93PlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQywgRk9OVF9NT05PLCBhbHBoYSwgciB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgS25vYiwgTGVkLCBUYWJzLCBjbGFtcDAxLCBzdGVwTGlnaHQsIHVzZUxpdmUgfSBmcm9tIFwiLi4vd2lkZ2V0c1wiO1xuaW1wb3J0IHsgdHlwZSBCb2R5UHJvcHMsIENvbCwgUm93IH0gZnJvbSBcIi4va2l0XCI7XG5cbi8qKiBUaGUgbW9kdWxlcyB0aGF0IGtlZXAgdGltZTogdGhlIGNsb2NrIGFuZCB0aGUgc2VxdWVuY2VyLiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gQ2xvY2soeyBub2RlLCBzZXQsIGNvbG9yIH06IEJvZHlQcm9wcykge1xuICBjb25zdCB7IGJwbSB9ID0gdXNlTGl2ZSgpO1xuICBjb25zdCB7IGRpdiwgc3dpbmcgfSA9IG5vZGUucGFyYW1zO1xuICByZXR1cm4gKFxuICAgIDxSb3cgZ2FwPXsxMn0+XG4gICAgICA8Q29sIGdhcD17MTB9PlxuICAgICAgICA8Um93IGdhcD17MTJ9PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIiwgZ2FwOiByKDUpIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IHIoMjYpLCBmb250RmFtaWx5OiBGT05UX01PTk8sIGNvbG9yOiBDLnRleHQgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2JwbX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiByKDkpLCBjb2xvcjogQy5kaW0sIG1hcmdpbjogeyBib3R0b206IHIoNSkgfSB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBCUE1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPFJvdyBnYXA9ezZ9PlxuICAgICAgICAgICAge1swLCAxLCAyLCAzXS5tYXAoKGspID0+IChcbiAgICAgICAgICAgICAgPExlZFxuICAgICAgICAgICAgICAgIGtleT17a31cbiAgICAgICAgICAgICAgICBzaXplPXs5fVxuICAgICAgICAgICAgICAgIGNvbG9yPXtrID8gY29sb3IgOiBcIiNmZmZmZmZcIn1cbiAgICAgICAgICAgICAgICBsZXZlbD17KGopID0+IChqICUgOCA9PT0gayAqIDIgPyAxIDogMCl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9Sb3c+XG4gICAgICAgIDxUYWJzXG4gICAgICAgICAgb3B0aW9ucz17W1wiMS80XCIsIFwiMS84XCIsIFwiMS8xNlwiXX1cbiAgICAgICAgICB2YWx1ZT17ZGl2fVxuICAgICAgICAgIG9uQ2hhbmdlPXsoaSkgPT4gc2V0KFwiZGl2XCIsIGkpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgLz5cbiAgICAgIDwvQ29sPlxuICAgICAgPEtub2JcbiAgICAgICAgbmFtZT1cIlNXSU5HXCJcbiAgICAgICAgdmFsdWU9e3N3aW5nfVxuICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldChcInN3aW5nXCIsIHYpfVxuICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgIHNpemU9ezMwfVxuICAgICAgICAvLyBXaGVyZSB0aGUgbGF0ZSBwdWxzZSBsYW5kcyBiZXR3ZWVuIGl0cyBwYWlyLCBhcyBkcnVtIG1hY2hpbmVzIHNheS5cbiAgICAgICAgc2hvdz17KHYpID0+IGAke01hdGgucm91bmQoNTAgKyAodiAqIDEwMCkgLyA2KX0lYH1cbiAgICAgIC8+XG4gICAgPC9Sb3c+XG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXF1ZW5jZXIoeyBub2RlLCBzZXQsIGNvbG9yLCBzdGVwcyB9OiBCb2R5UHJvcHMpIHtcbiAgY29uc3QgbWFzayA9IG5vZGUucGFyYW1zLm1hc2s7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IHIoNiksXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiA4IH0sIChfLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IG9uID0gKChtYXNrID4+IGkpICYgMSkgPT09IDE7XG4gICAgICAgIGNvbnN0IGhlcmUgPSAoajogbnVtYmVyKSA9PiAoaiAlIDggPT09IGkgPyAxIDogMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgICBmbGV4QmFzaXM6IDAsXG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGdhcDogcig3KSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPEJhclxuICAgICAgICAgICAgICB2YWx1ZT17bm9kZS5wYXJhbXNbYHAke2l9YF19XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KGBwJHtpfWAsIHYpfVxuICAgICAgICAgICAgICBjb2xvcj17b24gPyBjb2xvciA6IEMuZmFpbnR9XG4gICAgICAgICAgICAgIGdsb3c9e3N0ZXBMaWdodChzdGVwcywgKGopID0+IChvbiA/IGhlcmUoaikgOiAwKSwgMCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0KFwibWFza1wiLCBtYXNrIF4gKDEgPDwgaSkpfVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiByKDE2KSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHIoOSksXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiByKDMpLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb24gPyBhbHBoYShjb2xvciwgMC4zNSkgOiBDLmNhcmREZWVwLFxuICAgICAgICAgICAgICAgIGJvcmRlcjogcigxKSxcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogb24gPyBhbHBoYShjb2xvciwgMC43KSA6IEMuZWRnZSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgaG92ZXJTdHlsZT17eyBib3JkZXJDb2xvcjogQy50ZXh0IH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiByKDIpLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBvbiA/IFwiI2ZmZmZmZlwiIDogQy5kaW0sXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiB7IGFuaW1hdGVkOiBzdGVwTGlnaHQoc3RlcHMsIGhlcmUsIDApIH0sXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICk7XG4gICAgICB9KX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHNlcXVlbmNlciBzdGVwOiBkcmFnIGl0cyBoZWlnaHQuICovXG5mdW5jdGlvbiBCYXIoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG4gIGNvbG9yLFxuICBnbG93LFxufToge1xuICB2YWx1ZTogbnVtYmVyO1xuICBvbkNoYW5nZTogKHY6IG51bWJlcikgPT4gdm9pZDtcbiAgY29sb3I6IHN0cmluZztcbiAgZ2xvdzogUmV0dXJuVHlwZTx0eXBlb2Ygc3RlcExpZ2h0Pjtcbn0pIHtcbiAgY29uc3QgZHJhZyA9IHVzZVJlZjx7IHk6IG51bWJlcjsgdjogbnVtYmVyIH0gfCBudWxsPihudWxsKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25Qb2ludGVyRG93bj17KGUpID0+IHtcbiAgICAgICAgZHJhZy5jdXJyZW50ID0geyB5OiBlLmNsaWVudFksIHY6IHZhbHVlIH07XG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGUpID0+IHtcbiAgICAgICAgY29uc3QgZCA9IGRyYWcuY3VycmVudDtcbiAgICAgICAgaWYgKGQpIG9uQ2hhbmdlKGNsYW1wMDEoZC52ICsgKGQueSAtIGUuY2xpZW50WSkgLyA5MCkpO1xuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoKSA9PiB7XG4gICAgICAgIGRyYWcuY3VycmVudCA9IG51bGw7XG4gICAgICB9fVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICBoZWlnaHQ6IHIoNTgpLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJmbGV4RW5kXCIsXG4gICAgICAgIGJvcmRlclJhZGl1czogcig0KSxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmNhcmREZWVwLFxuICAgICAgICBib3JkZXI6IHIoMSksXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLmVkZ2UsXG4gICAgICAgIGN1cnNvcjogXCJuc1Jlc2l6ZVwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3sgYm9yZGVyQ29sb3I6IEMuZWRnZUhpIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6IGAke01hdGgubWF4KDYsIHZhbHVlICogMTAwKX0lYCxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoMyksXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDAsXG4gICAgICAgICAgICBzdG9wczogW3sgY29sb3I6IGFscGhhKGNvbG9yLCAwLjI1KSB9LCB7IGNvbG9yIH1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiByKDMpLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYWxwaGEoXCIjZmZmZmZmXCIsIDAuMzUpLFxuICAgICAgICAgIG9wYWNpdHk6IHsgYW5pbWF0ZWQ6IGdsb3cgfSxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBDLCBTSUdOQUwsIGFscGhhLCByIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBLbm9iLCBUYWJzLCBzdGVwTGlnaHQgfSBmcm9tIFwiLi4vd2lkZ2V0c1wiO1xuaW1wb3J0IHsgdHlwZSBCb2R5UHJvcHMsIENvbCwgUm93LCBwY3QgfSBmcm9tIFwiLi9raXRcIjtcblxuLyoqIFRoZSBtb2R1bGVzIHRoYXQgc2hhcGUgYSBzaWduYWwsIGVhY2ggZHJhd2luZyB3aGF0IGl0IGRvZXM6IHRoZVxuICogIGVudmVsb3BlLCB0aGUgZmlsdGVyJ3MgY3VydmUsIHRoZSBWQ0EncyByZXNwb25zZSwgdGhlIGdsaWRlJ3Mgc2xldy4gKi9cblxuLyoqIEEgY3VydmUgaW4gYSByZWNlc3NlZCBib3g6IGBsaW5lYCBhbmQgdGhlIGFyZWEgdW5kZXIgaXQuICovXG5mdW5jdGlvbiBQbG90KHtcbiAgdyxcbiAgaCxcbiAgbGluZSxcbiAgY29sb3IsXG4gIGNoaWxkcmVuLFxufToge1xuICB3OiBudW1iZXI7XG4gIGg6IG51bWJlcjtcbiAgbGluZTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgaGVpZ2h0OiByKGgpLFxuICAgICAgICBib3JkZXJSYWRpdXM6IHIoNiksXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jYXJkRGVlcCxcbiAgICAgICAgYm9yZGVyOiByKDEpLFxuICAgICAgICBib3JkZXJDb2xvcjogQy5lZGdlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3ZnIHZpZXdCb3g9e2AwIDAgJHt3fSAke2h9YH0gc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiIH19PlxuICAgICAgICA8cGF0aCBkPXtgJHtsaW5lfSBMJHt3fSAke2h9IEwwICR7aH0gWmB9IGZpbGw9e2FscGhhKGNvbG9yLCAwLjEzKX0gLz5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPXtsaW5lfVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjh9XG4gICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBgZih4KWAgKHggYW5kIHRoZSByZXN1bHQgMC4uMSkgYXMgYSBwYXRoIGFjcm9zcyBhIGB3YMOXYGhgIHBsb3QuICovXG5mdW5jdGlvbiB0cmFjZSh3OiBudW1iZXIsIGg6IG51bWJlciwgZjogKHg6IG51bWJlcikgPT4gbnVtYmVyLCBuID0gNjQpIHtcbiAgbGV0IGQgPSBcIlwiO1xuICBmb3IgKGxldCBpID0gMDsgaSA8PSBuOyBpKyspIHtcbiAgICBjb25zdCB4ID0gaSAvIG47XG4gICAgY29uc3QgeSA9IGggLSA0IC0gTWF0aC5taW4oMS4yLCBmKHgpKSAqIChoIC0gMTApO1xuICAgIGQgKz0gYCR7aSA/IFwiTFwiIDogXCJNXCJ9JHsoeCAqIHcpLnRvRml4ZWQoMSl9ICR7eS50b0ZpeGVkKDEpfWA7XG4gIH1cbiAgcmV0dXJuIGQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbnZlbG9wZSh7IG5vZGUsIHNldCwgY29sb3IsIHN0ZXBzIH06IEJvZHlQcm9wcykge1xuICBjb25zdCB7IGEsIGQsIHMsIHI6IHJlbCB9ID0gbm9kZS5wYXJhbXM7XG4gIGNvbnN0IFcgPSAyMjA7XG4gIGNvbnN0IEggPSA1MDtcbiAgY29uc3QgdG9wID0gNTtcbiAgY29uc3QgZmxvb3IgPSBIIC0gMztcbiAgY29uc3QgcXVhcnRlciA9IFcgLyA0O1xuICBjb25zdCB4MSA9IDIgKyBhICogcXVhcnRlcjtcbiAgY29uc3QgeDIgPSB4MSArIDYgKyBkICogcXVhcnRlcjtcbiAgY29uc3QgeXMgPSBmbG9vciAtIHMgKiAoZmxvb3IgLSB0b3ApO1xuICBjb25zdCB4MyA9IHgyICsgcXVhcnRlciAqIDAuODtcbiAgY29uc3QgeDQgPSBNYXRoLm1pbihXIC0gMiwgeDMgKyA2ICsgcmVsICogcXVhcnRlcik7XG4gIGNvbnN0IGxpbmUgPSBgTTIgJHtmbG9vcn0gTCR7eDF9ICR7dG9wfSBRJHt4MSArICh4MiAtIHgxKSAqIDAuM30gJHt5c30gJHt4Mn0gJHt5c30gTCR7eDN9ICR7eXN9IFEke3gzICsgKHg0IC0geDMpICogMC4zfSAke2Zsb29yfSAke3g0fSAke2Zsb29yfWA7XG4gIGNvbnN0IGtub2JzOiBbc3RyaW5nLCBzdHJpbmddW10gPSBbXG4gICAgW1wiYVwiLCBcIkFUS1wiXSxcbiAgICBbXCJkXCIsIFwiREVDXCJdLFxuICAgIFtcInNcIiwgXCJTVVNcIl0sXG4gICAgW1wiclwiLCBcIlJFTFwiXSxcbiAgXTtcbiAgcmV0dXJuIChcbiAgICA8Q29sPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6IHIoSCksXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiByKDYpLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jYXJkRGVlcCxcbiAgICAgICAgICBib3JkZXI6IHIoMSksXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZWRnZSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2Z1xuICAgICAgICAgIHZpZXdCb3g9e2AwIDAgJHtXfSAke0h9YH1cbiAgICAgICAgICBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBkPXtgJHtsaW5lfSBMJHt4NH0gJHtIfSBMMiAke0h9IFpgfVxuICAgICAgICAgICAgZmlsbD17YWxwaGEoU0lHTkFMLmN2LCAwLjE0KX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBkPXtsaW5lfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtTSUdOQUwuY3Z9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MS44fVxuICAgICAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgIHdpZHRoOiByKHgxICsgNCksXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIoNSksXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGFscGhhKFNJR05BTC5jdiwgMC4yMiksXG4gICAgICAgICAgICBvcGFjaXR5OiB7IGFuaW1hdGVkOiBzdGVwTGlnaHQoc3RlcHMsICgpID0+IDEsIDApIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxSb3cgZ2FwPXs4fT5cbiAgICAgICAge2tub2JzLm1hcCgoW2tleSwgbmFtZV0pID0+IChcbiAgICAgICAgICA8S25vYlxuICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICBuYW1lPXtuYW1lfVxuICAgICAgICAgICAgdmFsdWU9e25vZGUucGFyYW1zW2tleV19XG4gICAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldChrZXksIHYpfVxuICAgICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgICAgc2l6ZT17MzB9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L1Jvdz5cbiAgICA8L0NvbD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZpbHRlcih7IG5vZGUsIHNldCwgY29sb3IgfTogQm9keVByb3BzKSB7XG4gIGNvbnN0IHsgbW9kZSwgY3V0b2ZmLCByZXMsIG1vZCB9ID0gbm9kZS5wYXJhbXM7XG4gIGNvbnN0IFcgPSAyMTI7XG4gIGNvbnN0IEggPSA1MDtcbiAgLy8gVGhlIHJlc29uYW50IHBlYWsgZ3Jvd3Mgd2l0aCBRICgwLjUgdG8gMjUsIGFzIHRoZSBlbmdpbmUgbWFwcyBpdCkuXG4gIGNvbnN0IHEgPSAwLjUgKiA1MCAqKiByZXM7XG4gIGNvbnN0IGJ1bXAgPSAwLjUgKiBNYXRoLmxvZzEwKE1hdGgubWF4KDEsIHEgLyAwLjcwNykpO1xuICBjb25zdCBsaW5lID0gdHJhY2UoVywgSCwgKHgpID0+IHtcbiAgICBjb25zdCBmID0gTWF0aC5wb3coMTAsICh4IC0gY3V0b2ZmKSAqIDIuMik7XG4gICAgY29uc3QgbHAgPSAxIC8gTWF0aC5zcXJ0KDEgKyBmICoqIDQpO1xuICAgIGNvbnN0IGhwID0gMSAvIE1hdGguc3FydCgxICsgZiAqKiAtNCk7XG4gICAgY29uc3QgcGVhayA9IGJ1bXAgKiBNYXRoLmV4cCgtKCgoeCAtIGN1dG9mZikgLyAwLjA1KSAqKiAyKSk7XG4gICAgcmV0dXJuIFtscCwgTWF0aC5taW4obHAsIGhwKSAqIDEuNiwgaHBdW21vZGVdICsgcGVhaztcbiAgfSk7XG4gIHJldHVybiAoXG4gICAgPENvbD5cbiAgICAgIDxQbG90IHc9e1d9IGg9e0h9IGxpbmU9e2xpbmV9IGNvbG9yPXtTSUdOQUwuYXVkaW99PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgIGxlZnQ6IGAke2N1dG9mZiAqIDEwMH0lYCxcbiAgICAgICAgICAgIHRvcDogcig0KSxcbiAgICAgICAgICAgIGJvdHRvbTogcig0KSxcbiAgICAgICAgICAgIHdpZHRoOiByKDEpLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBhbHBoYShjb2xvciwgMC41KSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9QbG90PlxuICAgICAgPFRhYnNcbiAgICAgICAgb3B0aW9ucz17W1wiTE9XXCIsIFwiQkFORFwiLCBcIkhJR0hcIl19XG4gICAgICAgIHZhbHVlPXttb2RlfVxuICAgICAgICBvbkNoYW5nZT17KGkpID0+IHNldChcIm1vZGVcIiwgaSl9XG4gICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgIC8+XG4gICAgICA8Um93IGdhcD17MTh9PlxuICAgICAgICA8S25vYlxuICAgICAgICAgIG5hbWU9XCJDVVRPRkZcIlxuICAgICAgICAgIHZhbHVlPXtjdXRvZmZ9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJjdXRvZmZcIiwgdil9XG4gICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgIHNob3c9eyh2KSA9PiBgJHtNYXRoLnJvdW5kKDIwICogMTAwMCAqKiB2KX1gfVxuICAgICAgICAvPlxuICAgICAgICA8S25vYlxuICAgICAgICAgIG5hbWU9XCJSRVNcIlxuICAgICAgICAgIHZhbHVlPXtyZXN9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJyZXNcIiwgdil9XG4gICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgIHNob3c9e3BjdH1cbiAgICAgICAgLz5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiTU9EXCJcbiAgICAgICAgICB2YWx1ZT17bW9kfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KFwibW9kXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICAvLyBIb3cgZmFyIHRoZSBgY3V0b2ZmYCBpbnB1dCBvcGVucyBpdCwgb2N0YXZlcy5cbiAgICAgICAgICBzaG93PXsodikgPT4gYCR7KHYgKiA2KS50b0ZpeGVkKDEpfWB9XG4gICAgICAgIC8+XG4gICAgICA8L1Jvdz5cbiAgICA8L0NvbD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFZjYSh7IG5vZGUsIHNldCwgY29sb3IgfTogQm9keVByb3BzKSB7XG4gIGNvbnN0IHsgZ2FpbiwgY3VydmUgfSA9IG5vZGUucGFyYW1zO1xuICBjb25zdCBsaW5lID0gdHJhY2UoMTg4LCA0NCwgKHgpID0+IChjdXJ2ZSA/IHggKiogMyA6IHgpICogZ2Fpbik7XG4gIHJldHVybiAoXG4gICAgPENvbD5cbiAgICAgIDxQbG90IHc9ezE4OH0gaD17NDR9IGxpbmU9e2xpbmV9IGNvbG9yPXtTSUdOQUwuYXVkaW99IC8+XG4gICAgICA8Um93IGdhcD17MTZ9PlxuICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogcig5NiksIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIgfX0+XG4gICAgICAgICAgPFRhYnNcbiAgICAgICAgICAgIG9wdGlvbnM9e1tcIkxJTlwiLCBcIkVYUFwiXX1cbiAgICAgICAgICAgIHZhbHVlPXtjdXJ2ZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoaSkgPT4gc2V0KFwiY3VydmVcIiwgaSl9XG4gICAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8S25vYlxuICAgICAgICAgIG5hbWU9XCJHQUlOXCJcbiAgICAgICAgICB2YWx1ZT17Z2Fpbn1cbiAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldChcImdhaW5cIiwgdil9XG4gICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgIHNpemU9ezM0fVxuICAgICAgICAgIHNob3c9e3BjdH1cbiAgICAgICAgLz5cbiAgICAgIDwvUm93PlxuICAgIDwvQ29sPlxuICApO1xufVxuXG4vKiogVGhlIGdsaWRlJ3MgdGltZSBjb25zdGFudCwgc2Vjb25kcyAoYERzcDo6R2xpZGVgIGluIGBzeW50aC9lbmdpbmUucnNgKS4gKi9cbmNvbnN0IHNsZXcgPSAodGltZTogbnVtYmVyKSA9PiAwLjAwMSArIHRpbWUgKiB0aW1lICogMC41O1xuXG5leHBvcnQgZnVuY3Rpb24gR2xpZGUoeyBub2RlLCBzZXQsIGNvbG9yIH06IEJvZHlQcm9wcykge1xuICBjb25zdCB7IHRpbWUgfSA9IG5vZGUucGFyYW1zO1xuICBjb25zdCBXID0gMTc2O1xuICBjb25zdCBIID0gNDA7XG4gIC8vIEZpdmUgbm90ZXMgYSBmaWZ0aCBvZiBhIHNlY29uZCBlYWNoOiB0aGUgc3RlcHMgYXMgcGxheWVkLCBhbmQgc2xld2VkLlxuICBjb25zdCBub3RlcyA9IFswLjIsIDAuOCwgMC40NSwgMC45NSwgMC4zXTtcbiAgY29uc3QgYXQgPSAoeDogbnVtYmVyKSA9PiBub3Rlc1tNYXRoLm1pbig0LCBNYXRoLmZsb29yKHggKiA1KSldO1xuICBsZXQgbGV2ZWwgPSBub3Rlc1swXTtcbiAgY29uc3Qgc21vb3RoID0gdHJhY2UoVywgSCwgKHgpID0+IHtcbiAgICBsZXZlbCArPSAoYXQoeCkgLSBsZXZlbCkgKiAoMSAtIE1hdGguZXhwKC0oMSAvIDY0KSAvIHNsZXcodGltZSkpKTtcbiAgICByZXR1cm4gbGV2ZWw7XG4gIH0pO1xuICBjb25zdCBzdGVwcGVkID0gdHJhY2UoVywgSCwgYXQsIDMyMCk7XG4gIHJldHVybiAoXG4gICAgPENvbD5cbiAgICAgIDxQbG90IHc9e1d9IGg9e0h9IGxpbmU9e3Ntb290aH0gY29sb3I9e1NJR05BTC5jdn0+XG4gICAgICAgIDxzdmdcbiAgICAgICAgICB2aWV3Qm94PXtgMCAwICR7V30gJHtIfWB9XG4gICAgICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiBcIjEwMCVcIiB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGQ9e3N0ZXBwZWR9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e2FscGhhKEMudGV4dCwgMC4yNSl9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIDwvUGxvdD5cbiAgICAgIDxSb3c+XG4gICAgICAgIDxLbm9iXG4gICAgICAgICAgbmFtZT1cIlRJTUVcIlxuICAgICAgICAgIHZhbHVlPXt0aW1lfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KFwidGltZVwiLCB2KX1cbiAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgc2l6ZT17MzR9XG4gICAgICAgICAgc2hvdz17KHYpID0+IGAke01hdGgucm91bmQoc2xldyh2KSAqIDEwMDApfW1zYH1cbiAgICAgICAgLz5cbiAgICAgIDwvUm93PlxuICAgIDwvQ29sPlxuICApO1xufVxuIiwgImltcG9ydCB7IFNJR05BTCB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgS25vYiwgTWV0ZXIsIFNjb3BlLCBUYWJzLCByYW5kIH0gZnJvbSBcIi4uL3dpZGdldHNcIjtcbmltcG9ydCB7IHR5cGUgQm9keVByb3BzLCBDb2wsIFJvdywgcGN0IH0gZnJvbSBcIi4va2l0XCI7XG5cbi8qKiBUaGUgc291cmNlcyB0aGF0IGRyYXcgdGhlaXIgc2lnbmFsIGluIGEgc2NvcGU6IG9zY2lsbGF0b3IsIG5vaXNlLCBMRk8uICovXG5cbmNvbnN0IFRBVSA9IE1hdGguUEkgKiAyO1xuY29uc3QgV0FWRVMgPSBbXG4gIChwOiBudW1iZXIpID0+IE1hdGguc2luKHAgKiBUQVUpLFxuICAocDogbnVtYmVyKSA9PiAyICogcCAtIDEsXG4gIChwOiBudW1iZXIpID0+IChwIDwgMC41ID8gMC44IDogLTAuOCksXG4gIChwOiBudW1iZXIpID0+IDEgLSA0ICogTWF0aC5hYnMocCAtIDAuNSksXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gT3NjaWxsYXRvcih7IG5vZGUsIHNldCwgY29sb3IgfTogQm9keVByb3BzKSB7XG4gIGNvbnN0IHsgd2F2ZSwgdHVuZSwgbGV2ZWwsIGRldHVuZSB9ID0gbm9kZS5wYXJhbXM7XG4gIGNvbnN0IHNlbWlzID0gTWF0aC5yb3VuZCh0dW5lICogMjQgLSAxMik7XG4gIHJldHVybiAoXG4gICAgPENvbD5cbiAgICAgIDxTY29wZVxuICAgICAgICB3YXZlPXtXQVZFU1t3YXZlXX1cbiAgICAgICAgY3ljbGVzPXsyICsgTWF0aC5yb3VuZCh0dW5lICogNCl9XG4gICAgICAgIHBlcmlvZE1zPXs0MjAgLSB0dW5lICogMjAwfVxuICAgICAgICBjb2xvcj17U0lHTkFMLmF1ZGlvfVxuICAgICAgICB3aWR0aD17MjEyfVxuICAgICAgLz5cbiAgICAgIDxUYWJzXG4gICAgICAgIG9wdGlvbnM9e1tcIlNJTlwiLCBcIlNBV1wiLCBcIlNRUlwiLCBcIlRSSVwiXX1cbiAgICAgICAgdmFsdWU9e3dhdmV9XG4gICAgICAgIG9uQ2hhbmdlPXsoaSkgPT4gc2V0KFwid2F2ZVwiLCBpKX1cbiAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgLz5cbiAgICAgIDxSb3cgZ2FwPXsxOH0+XG4gICAgICAgIDxLbm9iXG4gICAgICAgICAgbmFtZT1cIlRVTkVcIlxuICAgICAgICAgIHZhbHVlPXt0dW5lfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KFwidHVuZVwiLCB2KX1cbiAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgc2hvdz17KCkgPT4gYCR7c2VtaXMgPiAwID8gXCIrXCIgOiBcIlwifSR7c2VtaXN9YH1cbiAgICAgICAgLz5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiREVUVU5FXCJcbiAgICAgICAgICB2YWx1ZT17ZGV0dW5lfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KFwiZGV0dW5lXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICAvLyBDZW50cyBlYWNoIHdheSAoYE9zYzo6c3RlcGAgaW4gYHN5bnRoL3ZvaWNlcy5yc2ApLlxuICAgICAgICAgIHNob3c9eyh2KSA9PiBgJHtNYXRoLnJvdW5kKHYgKiB2ICogMzUpfWNgfVxuICAgICAgICAvPlxuICAgICAgICA8S25vYlxuICAgICAgICAgIG5hbWU9XCJMRVZFTFwiXG4gICAgICAgICAgdmFsdWU9e2xldmVsfVxuICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4gc2V0KFwibGV2ZWxcIiwgdil9XG4gICAgICAgICAgY29sb3I9e2NvbG9yfVxuICAgICAgICAgIHNob3c9e3BjdH1cbiAgICAgICAgLz5cbiAgICAgIDwvUm93PlxuICAgIDwvQ29sPlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTm9pc2UoeyBub2RlLCBzZXQsIGNvbG9yIH06IEJvZHlQcm9wcykge1xuICBjb25zdCB7IGNvbG9yOiB0aW50LCBsZXZlbCB9ID0gbm9kZS5wYXJhbXM7XG4gIC8vIEZld2VyLCBzbW9vdGhlciBwb2ludHMgdGhlIGRhcmtlciB0aGUgbm9pc2UuXG4gIGNvbnN0IHBvaW50cyA9IFs0OCwgMTgsIDhdW3RpbnRdO1xuICBjb25zdCBub2lzZSA9IChwOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBhdCA9IHAgKiBwb2ludHM7XG4gICAgY29uc3QgaSA9IE1hdGguZmxvb3IoYXQpO1xuICAgIGNvbnN0IGYgPSBhdCAtIGk7XG4gICAgY29uc3QgdiA9IChrOiBudW1iZXIpID0+IHJhbmQoNyArIHRpbnQsIGsgJSBwb2ludHMpICogMiAtIDE7XG4gICAgcmV0dXJuIChcbiAgICAgICh2KGkpICsgKHYoaSArIDEpIC0gdihpKSkgKiBmICogZiAqICgzIC0gMiAqIGYpKSAqICgwLjM1ICsgMC42ICogbGV2ZWwpXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIChcbiAgICA8Q29sPlxuICAgICAgPFNjb3BlXG4gICAgICAgIHdhdmU9e25vaXNlfVxuICAgICAgICBjeWNsZXM9ezF9XG4gICAgICAgIHBlcmlvZE1zPXs5MDB9XG4gICAgICAgIGNvbG9yPXtTSUdOQUwuYXVkaW99XG4gICAgICAgIHdpZHRoPXsxODh9XG4gICAgICAgIGhlaWdodD17NDB9XG4gICAgICAvPlxuICAgICAgPFRhYnNcbiAgICAgICAgb3B0aW9ucz17W1wiV0hJVEVcIiwgXCJQSU5LXCIsIFwiQlJPV05cIl19XG4gICAgICAgIHZhbHVlPXt0aW50fVxuICAgICAgICBvbkNoYW5nZT17KGkpID0+IHNldChcImNvbG9yXCIsIGkpfVxuICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAvPlxuICAgICAgPFJvdyBnYXA9ezE4fT5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiTEVWRUxcIlxuICAgICAgICAgIHZhbHVlPXtsZXZlbH1cbiAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHNldChcImxldmVsXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICBzaG93PXtwY3R9XG4gICAgICAgIC8+XG4gICAgICAgIDxNZXRlclxuICAgICAgICAgIHNlZWQ9ezMgKyB0aW50fVxuICAgICAgICAgIGdhaW49e2xldmVsfVxuICAgICAgICAgIGNvbG9yPXtTSUdOQUwuYXVkaW99XG4gICAgICAgICAgaGVpZ2h0PXs1Mn1cbiAgICAgICAgICBjb3VudD17OH1cbiAgICAgICAgLz5cbiAgICAgIDwvUm93PlxuICAgIDwvQ29sPlxuICApO1xufVxuXG4vKiogVGhlIExGTydzIHJhdGUgaW4gSHo6IDAuMDIgdG8gMjAsIGxvZ2FyaXRobWljIChgTGZvOjpzdGVwYCkuICovXG5jb25zdCBoeiA9IChyYXRlOiBudW1iZXIpID0+IDAuMDIgKiAxMDAwICoqIHJhdGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBMZm8oeyBub2RlLCBzZXQsIGNvbG9yIH06IEJvZHlQcm9wcykge1xuICBjb25zdCB7IHNoYXBlLCByYXRlLCBkZXB0aCB9ID0gbm9kZS5wYXJhbXM7XG4gIGNvbnN0IHNjYWxlID0gMC4yNSArIDAuNzUgKiBkZXB0aDtcbiAgLy8gUmFuZG9tIHN0ZXBzIGhvbGQgYSBsZXZlbCBhIGN5Y2xlIGVhY2g6IGZvdXIgb2YgdGhlbSBhY3Jvc3MgdGhlIHNjb3BlLlxuICBjb25zdCBzdGVwcyA9IFswLjYsIC0wLjgsIDAuMiwgLTAuM10ubWFwKFxuICAgICh2LCBpKSA9PiB2ICsgcmFuZCg5LCBpKSAqIDAuNCAtIDAuMixcbiAgKTtcbiAgY29uc3Qgd2F2ZSA9XG4gICAgc2hhcGUgPT09IDNcbiAgICAgID8gKHA6IG51bWJlcikgPT4gc3RlcHNbTWF0aC5taW4oMywgTWF0aC5mbG9vcihwICogNCkpXSAqIHNjYWxlXG4gICAgICA6IChwOiBudW1iZXIpID0+IFdBVkVTW1swLCAzLCAyXVtzaGFwZV1dKHApICogc2NhbGU7XG4gIGNvbnN0IHBlcmlvZCA9IDEwMDAgLyBoeihyYXRlKTtcbiAgcmV0dXJuIChcbiAgICA8Q29sPlxuICAgICAgPFNjb3BlXG4gICAgICAgIHdhdmU9e3dhdmV9XG4gICAgICAgIGN5Y2xlcz17MX1cbiAgICAgICAgcGVyaW9kTXM9e01hdGgubWluKFxuICAgICAgICAgIDkwMDAsXG4gICAgICAgICAgTWF0aC5tYXgoMzAwLCBzaGFwZSA9PT0gMyA/IHBlcmlvZCAqIDQgOiBwZXJpb2QpLFxuICAgICAgICApfVxuICAgICAgICBjb2xvcj17U0lHTkFMLmN2fVxuICAgICAgICB3aWR0aD17MTg4fVxuICAgICAgLz5cbiAgICAgIDxUYWJzXG4gICAgICAgIG9wdGlvbnM9e1tcIlNJTlwiLCBcIlRSSVwiLCBcIlNRUlwiLCBcIlMmSFwiXX1cbiAgICAgICAgdmFsdWU9e3NoYXBlfVxuICAgICAgICBvbkNoYW5nZT17KGkpID0+IHNldChcInNoYXBlXCIsIGkpfVxuICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAvPlxuICAgICAgPFJvdyBnYXA9ezIyfT5cbiAgICAgICAgPEtub2JcbiAgICAgICAgICBuYW1lPVwiUkFURVwiXG4gICAgICAgICAgdmFsdWU9e3JhdGV9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJyYXRlXCIsIHYpfVxuICAgICAgICAgIGNvbG9yPXtjb2xvcn1cbiAgICAgICAgICBzaG93PXsodikgPT4ge1xuICAgICAgICAgICAgY29uc3QgZiA9IGh6KHYpO1xuICAgICAgICAgICAgcmV0dXJuIGYgPCAxID8gZi50b0ZpeGVkKDIpIDogZiA8IDEwID8gZi50b0ZpeGVkKDEpIDogZi50b0ZpeGVkKDApO1xuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxLbm9iXG4gICAgICAgICAgbmFtZT1cIkRFUFRIXCJcbiAgICAgICAgICB2YWx1ZT17ZGVwdGh9XG4gICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiBzZXQoXCJkZXB0aFwiLCB2KX1cbiAgICAgICAgICBjb2xvcj17Y29sb3J9XG4gICAgICAgICAgc2hvdz17cGN0fVxuICAgICAgICAvPlxuICAgICAgPC9Sb3c+XG4gICAgPC9Db2w+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgS2luZCB9IGZyb20gXCIuLi9ncmFwaC9jYXRhbG9nXCI7XG5pbXBvcnQgeyBCZWF0LCBEcnVtIH0gZnJvbSBcIi4vZHJ1bXNcIjtcbmltcG9ydCB7IERlbGF5LCBNaXhlciwgT3V0cHV0LCBSZXZlcmIgfSBmcm9tIFwiLi9lZmZlY3RzXCI7XG5pbXBvcnQgdHlwZSB7IEJvZHlQcm9wcyB9IGZyb20gXCIuL2tpdFwiO1xuaW1wb3J0IHsgQ2xvY2ssIFNlcXVlbmNlciB9IGZyb20gXCIuL3JoeXRobVwiO1xuaW1wb3J0IHsgRW52ZWxvcGUsIEZpbHRlciwgR2xpZGUsIFZjYSB9IGZyb20gXCIuL3NoYXBlcnNcIjtcbmltcG9ydCB7IExmbywgTm9pc2UsIE9zY2lsbGF0b3IgfSBmcm9tIFwiLi9zb3VyY2VzXCI7XG5cbmV4cG9ydCBjb25zdCBCT0RJRVM6IFJlY29yZDxLaW5kLCAocDogQm9keVByb3BzKSA9PiBSZWFjdE5vZGU+ID0ge1xuICBjbG9jazogQ2xvY2ssXG4gIHNlcXVlbmNlcjogU2VxdWVuY2VyLFxuICBiZWF0OiBCZWF0LFxuICBvc2NpbGxhdG9yOiBPc2NpbGxhdG9yLFxuICBub2lzZTogTm9pc2UsXG4gIGxmbzogTGZvLFxuICBkcnVtOiBEcnVtLFxuICBlbnZlbG9wZTogRW52ZWxvcGUsXG4gIGZpbHRlcjogRmlsdGVyLFxuICB2Y2E6IFZjYSxcbiAgZ2xpZGU6IEdsaWRlLFxuICBtaXhlcjogTWl4ZXIsXG4gIGRlbGF5OiBEZWxheSxcbiAgcmV2ZXJiOiBSZXZlcmIsXG4gIG91dHB1dDogT3V0cHV0LFxufTtcbiIsICJpbXBvcnQgdHlwZSB7IFNpZ25hbCB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyB0eXBlIEtpbmQsIEtJTkRTLCBjYXJkSGVpZ2h0LCBraW5kIH0gZnJvbSBcIi4vY2F0YWxvZ1wiO1xuXG4vKiogVGhlIHBhdGNoOiBSZWFjdCdzIHN0YXRlLiBCZXZ5IG9ubHkgaGVhcnMgd2hpY2ggc29ja2V0cyBhcmUgd2lyZWRcbiAqICAoYHBhdGNoLnNldGApIGFuZCBkcmF3cyB0aGUgd2lyZXMgaXRzZWxmLiAqL1xuXG5leHBvcnQgdHlwZSBHcmFwaE5vZGUgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGtpbmQ6IEtpbmQ7XG4gIC8qKiBUb3AtbGVmdCwgd29ybGQgcHggKGxvZ2ljYWwgcHggYXQgem9vbSAxKS4gKi9cbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHBhcmFtczogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgLyoqIFN0YWNraW5nIG9yZGVyIGFtb25nIG5vZGVzOiB0aGUgbGFzdCBvbmUgcHJlc3NlZCBpcyBvbiB0b3AuICovXG4gIHo6IG51bWJlcjtcbiAgLyoqIERlbGF5IGJlZm9yZSB0aGUgcG9wLWluLCBtcy4gKi9cbiAgZW50ZXI6IG51bWJlcjtcbiAgLyoqIFNocmlua2luZyBhd2F5OyByZW1vdmVkIG9uY2UgdGhlIGFuaW1hdGlvbiBlbmRzLiAqL1xuICBsZWF2aW5nPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEVuZCA9IHsgbm9kZTogc3RyaW5nOyBwb3J0OiBudW1iZXIgfTtcbi8qKiBBbHdheXMgZnJvbSBhbiBvdXRwdXQgdG8gYW4gaW5wdXQuICovXG5leHBvcnQgdHlwZSBMaW5rID0geyBpZDogc3RyaW5nOyBmcm9tOiBFbmQ7IHRvOiBFbmQgfTtcblxuZXhwb3J0IHR5cGUgR3JhcGggPSB7XG4gIG5vZGVzOiBSZWNvcmQ8c3RyaW5nLCBHcmFwaE5vZGU+O1xuICBsaW5rczogTGlua1tdO1xuICBzZWxlY3RlZDogc3RyaW5nW107XG4gIC8qKiBJZCBjb3VudGVyLCBhbmQgdGhlIHRvcCBvZiB0aGUgc3RhY2tpbmcgb3JkZXIuICovXG4gIHNlcTogbnVtYmVyO1xuICB0b3A6IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFNpZGUgPSBcImlcIiB8IFwib1wiO1xuZXhwb3J0IHR5cGUgU29ja2V0UmVmID0geyBub2RlOiBzdHJpbmc7IHNpZGU6IFNpZGU7IHBvcnQ6IG51bWJlciB9O1xuXG4vKiogVGhlIG5hbWVkIG5vZGUgYSBzb2NrZXQgcmVuZGVycyDigJQgd2hhdCBCZXZ5IGZpbmRzIGl0cyBwb3NpdGlvbiBieS4gKi9cbmV4cG9ydCBjb25zdCBzb2NrZXROYW1lID0gKHM6IFNvY2tldFJlZikgPT4gYCR7cy5ub2RlfToke3Muc2lkZX0ke3MucG9ydH1gO1xuXG5leHBvcnQgZnVuY3Rpb24gc2lnbmFsT2YoZzogR3JhcGgsIHM6IFNvY2tldFJlZik6IFNpZ25hbCB7XG4gIGNvbnN0IGQgPSBraW5kKGcubm9kZXNbcy5ub2RlXS5raW5kKTtcbiAgcmV0dXJuIChzLnNpZGUgPT09IFwib1wiID8gZC5vdXRwdXRzIDogZC5pbnB1dHMpW3MucG9ydF0uc2lnbmFsO1xufVxuXG4vKiogV2hldGhlciBhIHdpcmUgcHVsbGVkIGZyb20gYGFgIG1heSBwbHVnIGludG8gYGJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblBsdWcoZzogR3JhcGgsIGE6IFNvY2tldFJlZiwgYjogU29ja2V0UmVmKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgYS5zaWRlICE9PSBiLnNpZGUgJiZcbiAgICBhLm5vZGUgIT09IGIubm9kZSAmJlxuICAgICEhZy5ub2Rlc1tiLm5vZGVdICYmXG4gICAgIWcubm9kZXNbYi5ub2RlXS5sZWF2aW5nICYmXG4gICAgc2lnbmFsT2YoZywgYSkgPT09IHNpZ25hbE9mKGcsIGIpXG4gICk7XG59XG5cbmV4cG9ydCB0eXBlIEJveCA9IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHc6IG51bWJlcjsgaDogbnVtYmVyIH07XG5cbmV4cG9ydCBjb25zdCBub2RlQm94ID0gKG46IEdyYXBoTm9kZSk6IEJveCA9PiAoe1xuICB4OiBuLngsXG4gIHk6IG4ueSxcbiAgdzoga2luZChuLmtpbmQpLndpZHRoLFxuICBoOiBjYXJkSGVpZ2h0KG4ua2luZCksXG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIGJvdW5kcyhub2RlczogR3JhcGhOb2RlW10pOiBCb3ggfCBudWxsIHtcbiAgaWYgKCFub2Rlcy5sZW5ndGgpIHJldHVybiBudWxsO1xuICBjb25zdCBib3hlcyA9IG5vZGVzLm1hcChub2RlQm94KTtcbiAgY29uc3QgeCA9IE1hdGgubWluKC4uLmJveGVzLm1hcCgoYikgPT4gYi54KSk7XG4gIGNvbnN0IHkgPSBNYXRoLm1pbiguLi5ib3hlcy5tYXAoKGIpID0+IGIueSkpO1xuICBjb25zdCB3ID0gTWF0aC5tYXgoLi4uYm94ZXMubWFwKChiKSA9PiBiLnggKyBiLncpKSAtIHg7XG4gIGNvbnN0IGggPSBNYXRoLm1heCguLi5ib3hlcy5tYXAoKGIpID0+IGIueSArIGIuaCkpIC0geTtcbiAgcmV0dXJuIHsgeCwgeSwgdywgaCB9O1xufVxuXG5leHBvcnQgY29uc3QgbGl2ZSA9IChnOiBHcmFwaCkgPT5cbiAgT2JqZWN0LnZhbHVlcyhnLm5vZGVzKS5maWx0ZXIoKG4pID0+ICFuLmxlYXZpbmcpO1xuXG5leHBvcnQgY29uc3QgRU1QVFk6IEdyYXBoID0ge1xuICBub2Rlczoge30sXG4gIGxpbmtzOiBbXSxcbiAgc2VsZWN0ZWQ6IFtdLFxuICBzZXE6IDEsXG4gIHRvcDogMSxcbn07XG5cbmV4cG9ydCB0eXBlIEFjdGlvbiA9XG4gIHwgeyB0eXBlOiBcImxvYWRcIjsgZ3JhcGg6IEdyYXBoIH1cbiAgfCB7IHR5cGU6IFwibGlua3NcIjsgbGlua3M6IExpbmtbXSB9XG4gIHwgeyB0eXBlOiBcImFkZFwiOyBraW5kOiBLaW5kOyB4OiBudW1iZXI7IHk6IG51bWJlcjsgc2VsZWN0PzogYm9vbGVhbiB9XG4gIHwgeyB0eXBlOiBcIm1vdmVcIjsgdG86IFJlY29yZDxzdHJpbmcsIHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfT4gfVxuICB8IHsgdHlwZTogXCJzZWxlY3RcIjsgaWRzOiBzdHJpbmdbXSB9XG4gIHwgeyB0eXBlOiBcInJhaXNlXCI7IGlkczogc3RyaW5nW10gfVxuICB8IHsgdHlwZTogXCJkZWxldGVcIjsgaWRzOiBzdHJpbmdbXSB9XG4gIHwgeyB0eXBlOiBcInB1cmdlXCI7IGlkOiBzdHJpbmcgfVxuICB8IHsgdHlwZTogXCJjb25uZWN0XCI7IGE6IFNvY2tldFJlZjsgYjogU29ja2V0UmVmIH1cbiAgfCB7IHR5cGU6IFwidW5wbHVnXCI7IGlkOiBzdHJpbmcgfVxuICB8IHsgdHlwZTogXCJwYXJhbVwiOyBpZDogc3RyaW5nOyBrZXk6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9XG4gIHwgeyB0eXBlOiBcImR1cGxpY2F0ZVwiIH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2UoZzogR3JhcGgsIGE6IEFjdGlvbik6IEdyYXBoIHtcbiAgc3dpdGNoIChhLnR5cGUpIHtcbiAgICBjYXNlIFwibG9hZFwiOlxuICAgICAgLy8gSWRzIHN0YXkgdW5pcXVlIGFjcm9zcyBsb2Fkcy5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmEuZ3JhcGgsXG4gICAgICAgIHNlcTogTWF0aC5tYXgoYS5ncmFwaC5zZXEsIGcuc2VxKSxcbiAgICAgICAgdG9wOiBNYXRoLm1heChhLmdyYXBoLnRvcCwgZy50b3ApLFxuICAgICAgfTtcbiAgICBjYXNlIFwibGlua3NcIjpcbiAgICAgIHJldHVybiB7IC4uLmcsIGxpbmtzOiBbLi4uZy5saW5rcywgLi4uYS5saW5rc10gfTtcbiAgICBjYXNlIFwiYWRkXCI6IHtcbiAgICAgIGNvbnN0IGlkID0gYG4ke2cuc2VxfWA7XG4gICAgICBjb25zdCBub2RlOiBHcmFwaE5vZGUgPSB7XG4gICAgICAgIGlkLFxuICAgICAgICBraW5kOiBhLmtpbmQsXG4gICAgICAgIHg6IE1hdGgucm91bmQoYS54KSxcbiAgICAgICAgeTogTWF0aC5yb3VuZChhLnkpLFxuICAgICAgICBwYXJhbXM6IHsgLi4uS0lORFNbYS5raW5kXS5wYXJhbXMgfSxcbiAgICAgICAgejogZy50b3AgKyAxLFxuICAgICAgICBlbnRlcjogMCxcbiAgICAgIH07XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5nLFxuICAgICAgICBub2RlczogeyAuLi5nLm5vZGVzLCBbaWRdOiBub2RlIH0sXG4gICAgICAgIHNlbGVjdGVkOiBhLnNlbGVjdCA/IFtpZF0gOiBnLnNlbGVjdGVkLFxuICAgICAgICBzZXE6IGcuc2VxICsgMSxcbiAgICAgICAgdG9wOiBnLnRvcCArIDEsXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIFwibW92ZVwiOiB7XG4gICAgICBjb25zdCBub2RlcyA9IHsgLi4uZy5ub2RlcyB9O1xuICAgICAgZm9yIChjb25zdCBbaWQsIHBdIG9mIE9iamVjdC5lbnRyaWVzKGEudG8pKSB7XG4gICAgICAgIGlmIChub2Rlc1tpZF0pIG5vZGVzW2lkXSA9IHsgLi4ubm9kZXNbaWRdLCB4OiBwLngsIHk6IHAueSB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgLi4uZywgbm9kZXMgfTtcbiAgICB9XG4gICAgY2FzZSBcInNlbGVjdFwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZyxcbiAgICAgICAgc2VsZWN0ZWQ6IGEuaWRzLmZpbHRlcigoaWQpID0+IGcubm9kZXNbaWRdICYmICFnLm5vZGVzW2lkXS5sZWF2aW5nKSxcbiAgICAgIH07XG4gICAgY2FzZSBcInJhaXNlXCI6IHtcbiAgICAgIGNvbnN0IG5vZGVzID0geyAuLi5nLm5vZGVzIH07XG4gICAgICBsZXQgdG9wID0gZy50b3A7XG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIGEuaWRzKSB7XG4gICAgICAgIGlmIChub2Rlc1tpZF0pIG5vZGVzW2lkXSA9IHsgLi4ubm9kZXNbaWRdLCB6OiArK3RvcCB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgLi4uZywgbm9kZXMsIHRvcCB9O1xuICAgIH1cbiAgICBjYXNlIFwiZGVsZXRlXCI6IHtcbiAgICAgIGNvbnN0IGdvbmUgPSBuZXcgU2V0KGEuaWRzKTtcbiAgICAgIGNvbnN0IG5vZGVzID0geyAuLi5nLm5vZGVzIH07XG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIGdvbmUpIHtcbiAgICAgICAgaWYgKG5vZGVzW2lkXSkgbm9kZXNbaWRdID0geyAuLi5ub2Rlc1tpZF0sIGxlYXZpbmc6IHRydWUgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmcsXG4gICAgICAgIG5vZGVzLFxuICAgICAgICBsaW5rczogZy5saW5rcy5maWx0ZXIoXG4gICAgICAgICAgKGwpID0+ICFnb25lLmhhcyhsLmZyb20ubm9kZSkgJiYgIWdvbmUuaGFzKGwudG8ubm9kZSksXG4gICAgICAgICksXG4gICAgICAgIHNlbGVjdGVkOiBnLnNlbGVjdGVkLmZpbHRlcigoaWQpID0+ICFnb25lLmhhcyhpZCkpLFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcInB1cmdlXCI6IHtcbiAgICAgIGlmICghZy5ub2Rlc1thLmlkXT8ubGVhdmluZykgcmV0dXJuIGc7XG4gICAgICBjb25zdCBub2RlcyA9IHsgLi4uZy5ub2RlcyB9O1xuICAgICAgZGVsZXRlIG5vZGVzW2EuaWRdO1xuICAgICAgcmV0dXJuIHsgLi4uZywgbm9kZXMgfTtcbiAgICB9XG4gICAgY2FzZSBcImNvbm5lY3RcIjoge1xuICAgICAgaWYgKCFjYW5QbHVnKGcsIGEuYSwgYS5iKSkgcmV0dXJuIGc7XG4gICAgICBjb25zdCBbb3V0LCBpbnBdID0gYS5hLnNpZGUgPT09IFwib1wiID8gW2EuYSwgYS5iXSA6IFthLmIsIGEuYV07XG4gICAgICBjb25zdCBmcm9tID0geyBub2RlOiBvdXQubm9kZSwgcG9ydDogb3V0LnBvcnQgfTtcbiAgICAgIGNvbnN0IHRvID0geyBub2RlOiBpbnAubm9kZSwgcG9ydDogaW5wLnBvcnQgfTtcbiAgICAgIC8vIEFuIGlucHV0IHRha2VzIG9uZSB3aXJlOiB0aGUgbmV3IG9uZSByZXBsYWNlcyBpdC5cbiAgICAgIGNvbnN0IGxpbmtzID0gZy5saW5rcy5maWx0ZXIoXG4gICAgICAgIChsKSA9PiAhKGwudG8ubm9kZSA9PT0gdG8ubm9kZSAmJiBsLnRvLnBvcnQgPT09IHRvLnBvcnQpLFxuICAgICAgKTtcbiAgICAgIGxpbmtzLnB1c2goeyBpZDogYHcke2cuc2VxfWAsIGZyb20sIHRvIH0pO1xuICAgICAgcmV0dXJuIHsgLi4uZywgbGlua3MsIHNlcTogZy5zZXEgKyAxIH07XG4gICAgfVxuICAgIGNhc2UgXCJ1bnBsdWdcIjpcbiAgICAgIHJldHVybiB7IC4uLmcsIGxpbmtzOiBnLmxpbmtzLmZpbHRlcigobCkgPT4gbC5pZCAhPT0gYS5pZCkgfTtcbiAgICBjYXNlIFwicGFyYW1cIjoge1xuICAgICAgY29uc3QgbiA9IGcubm9kZXNbYS5pZF07XG4gICAgICBpZiAoIW4pIHJldHVybiBnO1xuICAgICAgY29uc3QgcGFyYW1zID0geyAuLi5uLnBhcmFtcywgW2Eua2V5XTogYS52YWx1ZSB9O1xuICAgICAgcmV0dXJuIHsgLi4uZywgbm9kZXM6IHsgLi4uZy5ub2RlcywgW2EuaWRdOiB7IC4uLm4sIHBhcmFtcyB9IH0gfTtcbiAgICB9XG4gICAgY2FzZSBcImR1cGxpY2F0ZVwiOiB7XG4gICAgICBjb25zdCBjb3BpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcbiAgICAgIGNvbnN0IG5vZGVzID0geyAuLi5nLm5vZGVzIH07XG4gICAgICBsZXQgc2VxID0gZy5zZXE7XG4gICAgICBsZXQgdG9wID0gZy50b3A7XG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIGcuc2VsZWN0ZWQpIHtcbiAgICAgICAgY29uc3QgbiA9IGcubm9kZXNbaWRdO1xuICAgICAgICBjb25zdCBjb3B5ID0gYG4ke3NlcSsrfWA7XG4gICAgICAgIGNvcGllc1tpZF0gPSBjb3B5O1xuICAgICAgICBub2Rlc1tjb3B5XSA9IHtcbiAgICAgICAgICAuLi5uLFxuICAgICAgICAgIGlkOiBjb3B5LFxuICAgICAgICAgIHg6IG4ueCArIDMyLFxuICAgICAgICAgIHk6IG4ueSArIDMyLFxuICAgICAgICAgIHo6ICsrdG9wLFxuICAgICAgICAgIGVudGVyOiAwLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gV2lyZXMgYmV0d2VlbiB0aGUgY29waWVkIG5vZGVzIGNvbWUgYWxvbmcuXG4gICAgICBjb25zdCBsaW5rcyA9IFsuLi5nLmxpbmtzXTtcbiAgICAgIGZvciAoY29uc3QgbCBvZiBnLmxpbmtzKSB7XG4gICAgICAgIGlmIChjb3BpZXNbbC5mcm9tLm5vZGVdICYmIGNvcGllc1tsLnRvLm5vZGVdKSB7XG4gICAgICAgICAgbGlua3MucHVzaCh7XG4gICAgICAgICAgICBpZDogYHcke3NlcSsrfWAsXG4gICAgICAgICAgICBmcm9tOiB7IG5vZGU6IGNvcGllc1tsLmZyb20ubm9kZV0sIHBvcnQ6IGwuZnJvbS5wb3J0IH0sXG4gICAgICAgICAgICB0bzogeyBub2RlOiBjb3BpZXNbbC50by5ub2RlXSwgcG9ydDogbC50by5wb3J0IH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IC4uLmcsIG5vZGVzLCBsaW5rcywgc2VsZWN0ZWQ6IE9iamVjdC52YWx1ZXMoY29waWVzKSwgc2VxLCB0b3AgfTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgR0FQX1ggPSA2NDtcbmNvbnN0IEdBUF9ZID0gMzI7XG5cbi8qKiBMYXkgdGhlIHBhdGNoIG91dCBsZWZ0IHRvIHJpZ2h0IGJ5IGhvdyBmYXIgZWFjaCBub2RlIGlzIGZyb20gYSBzb3VyY2UsXG4gKiAgZWFjaCBjb2x1bW4gb3JkZXJlZCBieSB3aGVyZSBpdHMgaW5wdXRzIGNvbWUgZnJvbS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJhbmdlKGc6IEdyYXBoKTogUmVjb3JkPHN0cmluZywgeyB4OiBudW1iZXI7IHk6IG51bWJlciB9PiB7XG4gIGNvbnN0IG5vZGVzID0gbGl2ZShnKTtcbiAgY29uc3QgZGVwdGg6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcbiAgY29uc3Qgd2FsayA9IChpZDogc3RyaW5nLCBzZWVuOiBTZXQ8c3RyaW5nPik6IG51bWJlciA9PiB7XG4gICAgaWYgKGRlcHRoW2lkXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gZGVwdGhbaWRdO1xuICAgIGlmIChzZWVuLmhhcyhpZCkpIHJldHVybiAwO1xuICAgIHNlZW4uYWRkKGlkKTtcbiAgICBjb25zdCB1cHMgPSBnLmxpbmtzLmZpbHRlcigobCkgPT4gbC50by5ub2RlID09PSBpZCkubWFwKChsKSA9PiBsLmZyb20ubm9kZSk7XG4gICAgY29uc3QgZCA9IHVwcy5sZW5ndGggPyBNYXRoLm1heCguLi51cHMubWFwKCh1KSA9PiB3YWxrKHUsIHNlZW4pICsgMSkpIDogMDtcbiAgICByZXR1cm4gKGRlcHRoW2lkXSA9IGQpO1xuICB9O1xuICBmb3IgKGNvbnN0IG4gb2Ygbm9kZXMpIHdhbGsobi5pZCwgbmV3IFNldCgpKTtcblxuICBjb25zdCBjb2x1bW5zOiBHcmFwaE5vZGVbXVtdID0gW107XG4gIGZvciAoY29uc3QgbiBvZiBub2RlcykgKGNvbHVtbnNbZGVwdGhbbi5pZF1dID8/PSBbXSkucHVzaChuKTtcbiAgY29uc3QgcGxhY2VkOiBSZWNvcmQ8c3RyaW5nLCB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0+ID0ge307XG4gIGxldCB4ID0gMDtcbiAgZm9yIChjb25zdCBjb2x1bW4gb2YgY29sdW1ucy5maWx0ZXIoQm9vbGVhbikpIHtcbiAgICAvLyBCYXJ5Y2VudGVyOiB1bmRlciB0aGUgbm9kZXMgdGhhdCBmZWVkIGl0LCBlbHNlIHdoZXJlIGl0IHdhcy5cbiAgICBjb25zdCBrZXkgPSAobjogR3JhcGhOb2RlKSA9PiB7XG4gICAgICBjb25zdCB1cHMgPSBnLmxpbmtzXG4gICAgICAgIC5maWx0ZXIoKGwpID0+IGwudG8ubm9kZSA9PT0gbi5pZCAmJiBwbGFjZWRbbC5mcm9tLm5vZGVdKVxuICAgICAgICAubWFwKChsKSA9PiBwbGFjZWRbbC5mcm9tLm5vZGVdLnkpO1xuICAgICAgcmV0dXJuIHVwcy5sZW5ndGggPyB1cHMucmVkdWNlKChzLCB2KSA9PiBzICsgdiwgMCkgLyB1cHMubGVuZ3RoIDogbi55O1xuICAgIH07XG4gICAgY29sdW1uLnNvcnQoKGEsIGIpID0+IGtleShhKSAtIGtleShiKSk7XG4gICAgY29uc3QgaGVpZ2h0ID0gY29sdW1uLnJlZHVjZShcbiAgICAgIChzLCBuKSA9PiBzICsgY2FyZEhlaWdodChuLmtpbmQpICsgR0FQX1ksXG4gICAgICAtR0FQX1ksXG4gICAgKTtcbiAgICBsZXQgeSA9IC1oZWlnaHQgLyAyO1xuICAgIGZvciAoY29uc3QgbiBvZiBjb2x1bW4pIHtcbiAgICAgIHBsYWNlZFtuLmlkXSA9IHsgeCwgeSB9O1xuICAgICAgeSArPSBjYXJkSGVpZ2h0KG4ua2luZCkgKyBHQVBfWTtcbiAgICB9XG4gICAgeCArPSBNYXRoLm1heCguLi5jb2x1bW4ubWFwKChuKSA9PiBraW5kKG4ua2luZCkud2lkdGgpKSArIEdBUF9YO1xuICB9XG4gIHJldHVybiBwbGFjZWQ7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5LCBvbiwgdHlwZSBSZWFjdEV2ZW50cywgdHlwZSBXaW5kb3dTaXplIH0gZnJvbSBcIi4vYmV2eVwiO1xuXG4vKiogVGhlIHdpbmRvdydzIGxvZ2ljYWwgc2l6ZSwgc3RyZWFtZWQgYnkgdGhlIGJ1aWx0LWluIGByZXNpemVgIGV2ZW50LlxuICogIGAww5cwYCB1bnRpbCB0aGUgaG9zdCBhbnN3ZXJzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVdpbmRvd1NpemUoKTogV2luZG93U2l6ZSB7XG4gIGNvbnN0IFtzaXplLCBzZXRTaXplXSA9IHVzZVN0YXRlPFdpbmRvd1NpemU+KHsgd2lkdGg6IDAsIGhlaWdodDogMCB9KTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5LndpbmRvd1xuICAgICAgLnNpemUoKVxuICAgICAgLnRoZW4oc2V0U2l6ZSlcbiAgICAgIC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIGJldnkub24oXCJyZXNpemVcIiwgc2V0U2l6ZSk7XG4gIH0sIFtdKTtcbiAgcmV0dXJuIHNpemU7XG59XG5cbi8qKiBMaXN0ZW4gdG8gYSBCZXZ5IGV2ZW50IHdoaWxlIG1vdW50ZWQ7IGBydW5gIGFsd2F5cyBzZWVzIHRoZSBsYXRlc3RcbiAqICByZW5kZXIncyBzdGF0ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VFdmVudDxLIGV4dGVuZHMga2V5b2YgUmVhY3RFdmVudHM+KFxuICBuYW1lOiBLLFxuICBydW46ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pIHtcbiAgY29uc3QgbGF0ZXN0ID0gdXNlUmVmKHJ1bik7XG4gIGxhdGVzdC5jdXJyZW50ID0gcnVuO1xuICB1c2VFZmZlY3QoKCkgPT4gb24obmFtZSwgKHZhbHVlKSA9PiBsYXRlc3QuY3VycmVudCh2YWx1ZSkpLCBbbmFtZV0pO1xufVxuXG4vKiogQSBzY3JpcHRlZCBzdGVwIGZyb20gYC0tc2hvb3Qg4oCmIC0tZG8gXCI8c2Vjcz4gPHZlcmI+IFthcmdzXVwiYCAodGhlXG4gKiAgYGRlYnVnLmFjdGAgZXZlbnQpOiBydW5zIGBydW4oYXJncylgIGZvciB0aGlzIGNvbXBvbmVudCdzIGB2ZXJiYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWJ1Zyh2ZXJiOiBzdHJpbmcsIHJ1bjogKGFyZ3M6IHN0cmluZ1tdKSA9PiB2b2lkKSB7XG4gIHVzZUV2ZW50KFwiZGVidWcuYWN0XCIsICh7IGFjdGlvbiB9KSA9PiB7XG4gICAgY29uc3QgW2hlYWQsIC4uLnJlc3RdID0gYWN0aW9uLnNwbGl0KFwiIFwiKTtcbiAgICBpZiAoaGVhZCA9PT0gdmVyYikgcnVuKHJlc3QpO1xuICB9KTtcbn1cblxuLyoqIEEgcmVmIHRoYXQgYWx3YXlzIGhvbGRzIHRoZSBsYXRlc3QgdmFsdWU6IGhhbmRsZXJzIHRoYXQgb3V0bGl2ZSBhIHJlbmRlclxuICogIChnZXN0dXJlIGNhbGxiYWNrcywgdGltZXJzKSByZWFkIGN1cnJlbnQgc3RhdGUgdGhyb3VnaCBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VMYXRlc3Q8VD4odmFsdWU6IFQpIHtcbiAgY29uc3QgcmVmID0gdXNlUmVmKHZhbHVlKTtcbiAgcmVmLmN1cnJlbnQgPSB2YWx1ZTtcbiAgcmV0dXJuIHJlZjtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgUG9pbnRlckV2ZW50RGF0YSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IFdpbmRvd1NpemUgfSBmcm9tIFwiLi4vYmV2eVwiO1xuaW1wb3J0IHsgQ0FURUdPUklFUywga2luZCB9IGZyb20gXCIuLi9ncmFwaC9jYXRhbG9nXCI7XG5pbXBvcnQgeyB0eXBlIEdyYXBoLCBib3VuZHMsIGxpdmUsIG5vZGVCb3ggfSBmcm9tIFwiLi4vZ3JhcGgvbW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgVmlldyB9IGZyb20gXCIuLi9ncmFwaC9DYW52YXNcIjtcbmltcG9ydCB7IEMsIGFscGhhLCBnbGFzcyB9IGZyb20gXCIuLi90aGVtZVwiO1xuXG5jb25zdCBXID0gMjA4O1xuY29uc3QgSCA9IDEzMjtcblxuLyoqIFRoZSB3aG9sZSBwYXRjaCBpbiBhIGNvcm5lcjogcHJlc3Mgb3IgZHJhZyB0byBmbHkgdGhlIHZpZXcgdGhlcmUuIE9uZVxuICogIHN2ZyBpbiB3b3JsZCBjb29yZGluYXRlcyDigJQgdGhlIG1vZHVsZXMsIHRoZWlyIHdpcmVzLCB0aGUgdmlldydzIG91dGxpbmUg4oCUXG4gKiAgZnJhbWVkIGJ5IGl0cyBgdmlld0JveGAsIHNvIGEgcGFuIG9yIGEgem9vbSBjaGFuZ2VzIHRoZSBmcmFtZSBhbmQgdGhlXG4gKiAgb3V0bGluZSwgbm90IGV2ZXJ5IG1vZHVsZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW5pbWFwKHtcbiAgZ3JhcGgsXG4gIHZpZXcsXG4gIHNpemUsXG4gIG9uQ2VudGVyLFxufToge1xuICBncmFwaDogR3JhcGg7XG4gIHZpZXc6IFZpZXc7XG4gIHNpemU6IFdpbmRvd1NpemU7XG4gIC8qKiBDZW50ZXIgdGhlIHZpZXcgb24gYSB3b3JsZCBwb2ludDsgYGdsaWRlYCBtcy4gKi9cbiAgb25DZW50ZXI6ICh4OiBudW1iZXIsIHk6IG51bWJlciwgZ2xpZGU6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3Qgbm9kZXMgPSBsaXZlKGdyYXBoKTtcbiAgY29uc3Qgc2VlbiA9IHtcbiAgICB4OiAtdmlldy54IC8gdmlldy56b29tLFxuICAgIHk6IC12aWV3LnkgLyB2aWV3Lnpvb20sXG4gICAgdzogc2l6ZS53aWR0aCAvIHZpZXcuem9vbSxcbiAgICBoOiBzaXplLmhlaWdodCAvIHZpZXcuem9vbSxcbiAgfTtcbiAgY29uc3QgYiA9IGJvdW5kcyhub2RlcykgPz8gc2VlbjtcbiAgY29uc3QgcGFkID0gODA7XG4gIGNvbnN0IHgwID0gTWF0aC5taW4oYi54LCBzZWVuLngpIC0gcGFkO1xuICBjb25zdCB5MCA9IE1hdGgubWluKGIueSwgc2Vlbi55KSAtIHBhZDtcbiAgY29uc3QgeDEgPSBNYXRoLm1heChiLnggKyBiLncsIHNlZW4ueCArIHNlZW4udykgKyBwYWQ7XG4gIGNvbnN0IHkxID0gTWF0aC5tYXgoYi55ICsgYi5oLCBzZWVuLnkgKyBzZWVuLmgpICsgcGFkO1xuICBjb25zdCBzID0gTWF0aC5taW4oVyAvICh4MSAtIHgwKSwgSCAvICh5MSAtIHkwKSk7XG4gIGNvbnN0IG94ID0gKFcgLSAoeDEgLSB4MCkgKiBzKSAvIDIgLSB4MCAqIHM7XG4gIGNvbnN0IG95ID0gKEggLSAoeTEgLSB5MCkgKiBzKSAvIDIgLSB5MCAqIHM7XG4gIC8vIE9uZSBtYXAgcGl4ZWwsIGluIHdvcmxkIHVuaXRzLlxuICBjb25zdCBweCA9IDEgLyBzO1xuXG4gIC8vIFRoZSBzY2FsZSBpcyBmcm96ZW4gd2hpbGUgZHJhZ2dpbmcsIG9yIHRoZSBtYXAgd291bGQgc2xpZGUgdW5kZXIgdGhlIGhhbmQuXG4gIGNvbnN0IGZyb3plbiA9IHVzZVJlZjx7IHM6IG51bWJlcjsgb3g6IG51bWJlcjsgb3k6IG51bWJlciB9IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGZseSA9IChlOiBQb2ludGVyRXZlbnREYXRhLCBnbGlkZTogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgbSA9IGZyb3plbi5jdXJyZW50ID8/IHsgcywgb3gsIG95IH07XG4gICAgb25DZW50ZXIoKGUueCAqIFcgLSBtLm94KSAvIG0ucywgKGUueSAqIEggLSBtLm95KSAvIG0ucywgZ2xpZGUpO1xuICB9O1xuXG4gIGxldCB3aXJlcyA9IFwiXCI7XG4gIGZvciAoY29uc3QgbCBvZiBncmFwaC5saW5rcykge1xuICAgIGNvbnN0IGEgPSBncmFwaC5ub2Rlc1tsLmZyb20ubm9kZV07XG4gICAgY29uc3QgeiA9IGdyYXBoLm5vZGVzW2wudG8ubm9kZV07XG4gICAgaWYgKCFhIHx8ICF6KSBjb250aW51ZTtcbiAgICBjb25zdCBbYXgsIGF5XSA9IFthLnggKyBraW5kKGEua2luZCkud2lkdGgsIGEueSArIDUwXTtcbiAgICBjb25zdCBbengsIHp5XSA9IFt6LngsIHoueSArIDUwXTtcbiAgICBjb25zdCBtaWQgPSBNYXRoLnJvdW5kKChheCArIHp4KSAvIDIpO1xuICAgIHdpcmVzICs9IGBNJHtheH0gJHtheX1DJHttaWR9ICR7YXl9ICR7bWlkfSAke3p5fSAke3p4fSAke3p5fWA7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBvblBvaW50ZXJEb3duPXsoZSkgPT4ge1xuICAgICAgICBmcm96ZW4uY3VycmVudCA9IHsgcywgb3gsIG95IH07XG4gICAgICAgIGZseShlLCAyNjApO1xuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhlKSA9PiBmbHkoZSwgMCl9XG4gICAgICBvblBvaW50ZXJVcD17KCkgPT4ge1xuICAgICAgICBmcm96ZW4uY3VycmVudCA9IG51bGw7XG4gICAgICB9fVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uZ2xhc3MsXG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICByaWdodDogMTQsXG4gICAgICAgIGJvdHRvbTogMTQsXG4gICAgICAgIHdpZHRoOiBXICsgMixcbiAgICAgICAgaGVpZ2h0OiBIICsgMixcbiAgICAgICAgb3ZlcmZsb3dYOiBcImNsaXBcIixcbiAgICAgICAgb3ZlcmZsb3dZOiBcImNsaXBcIixcbiAgICAgICAgY3Vyc29yOiBcInBvaW50ZXJcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PXtgJHstb3ggKiBweH0gJHstb3kgKiBweH0gJHtXICogcHh9ICR7SCAqIHB4fWB9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgd2lkdGg6IFcsXG4gICAgICAgICAgaGVpZ2h0OiBILFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9e3dpcmVzfVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e2FscGhhKFwiI2ZmZmZmZlwiLCAwLjIyKX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17cHh9XG4gICAgICAgIC8+XG4gICAgICAgIHtub2Rlcy5tYXAoKG4pID0+IHtcbiAgICAgICAgICBjb25zdCByID0gbm9kZUJveChuKTtcbiAgICAgICAgICBjb25zdCBjb2xvciA9IENBVEVHT1JJRVNba2luZChuLmtpbmQpLmNhdGVnb3J5XS5jb2xvcjtcbiAgICAgICAgICBjb25zdCBzZWwgPSBncmFwaC5zZWxlY3RlZC5pbmNsdWRlcyhuLmlkKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHJlY3RcbiAgICAgICAgICAgICAga2V5PXtuLmlkfVxuICAgICAgICAgICAgICB4PXtyLnh9XG4gICAgICAgICAgICAgIHk9e3IueX1cbiAgICAgICAgICAgICAgd2lkdGg9e3Iud31cbiAgICAgICAgICAgICAgaGVpZ2h0PXtyLmh9XG4gICAgICAgICAgICAgIC8vIFdvcmxkIHVuaXRzOiBhYm91dCAyIG1hcCBweCwgYW5kIGl0IG5ldmVyIGNoYW5nZXMgd2l0aCB0aGVcbiAgICAgICAgICAgICAgLy8gZnJhbWUuXG4gICAgICAgICAgICAgIHJ4PXszMH1cbiAgICAgICAgICAgICAgZmlsbD17YWxwaGEoY29sb3IsIHNlbCA/IDAuOSA6IDAuNDUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgICAgPHJlY3RcbiAgICAgICAgICB4PXtzZWVuLnh9XG4gICAgICAgICAgeT17c2Vlbi55fVxuICAgICAgICAgIHdpZHRoPXtzZWVuLnd9XG4gICAgICAgICAgaGVpZ2h0PXtzZWVuLmh9XG4gICAgICAgICAgcng9ezMgKiBweH1cbiAgICAgICAgICBmaWxsPXthbHBoYShDLnRleHQsIDAuMDQpfVxuICAgICAgICAgIHN0cm9rZT17YWxwaGEoQy50ZXh0LCAwLjU1KX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17cHh9XG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBQb2ludGVyRXZlbnREYXRhIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IENBVEVHT1JJRVMsIHR5cGUgQ2F0ZWdvcnksIHR5cGUgS2luZCwgS0lORFMgfSBmcm9tIFwiLi4vZ3JhcGgvY2F0YWxvZ1wiO1xuaW1wb3J0IHsgSWNvbiB9IGZyb20gXCIuLi9ncmFwaC9Ob2RlQ2FyZFwiO1xuaW1wb3J0IHsgQywgYWxwaGEsIGdsYXNzIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBQQUxFVFRFX1cgPSAyMDQ7XG5cbi8qKiBUaGUgbW9kdWxlIHBhbGV0dGU6IGNsaWNrIGEgbW9kdWxlIHRvIGRyb3AgaXQgbWlkLXZpZXcsIG9yIGRyYWcgaXRcbiAqICB3aGVyZSBpdCBzaG91bGQgZ28uICovXG5leHBvcnQgZnVuY3Rpb24gUGFsZXR0ZSh7XG4gIG9uQWRkLFxuICBvbkRyb3AsXG59OiB7XG4gIG9uQWRkOiAoazogS2luZCkgPT4gdm9pZDtcbiAgLyoqIERyb3BwZWQgYXQgYSB3aW5kb3cgcG9pbnQgKGxvZ2ljYWwgcHgpLiAqL1xuICBvbkRyb3A6IChrOiBLaW5kLCB4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgW2dob3N0LCBzZXRHaG9zdF0gPSB1c2VTdGF0ZTx7XG4gICAga2luZDogS2luZDtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICB9IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHByZXNzID0gdXNlUmVmPHtcbiAgICBraW5kOiBLaW5kO1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgbW92ZWQ6IGJvb2xlYW47XG4gIH0gfCBudWxsPihudWxsKTtcblxuICBjb25zdCBkb3duID0gKGtpbmQ6IEtpbmQpID0+IChlOiBQb2ludGVyRXZlbnREYXRhKSA9PiB7XG4gICAgcHJlc3MuY3VycmVudCA9IHsga2luZCwgeDogZS5jbGllbnRYLCB5OiBlLmNsaWVudFksIG1vdmVkOiBmYWxzZSB9O1xuICB9O1xuICBjb25zdCBtb3ZlID0gKGU6IFBvaW50ZXJFdmVudERhdGEpID0+IHtcbiAgICBjb25zdCBwID0gcHJlc3MuY3VycmVudDtcbiAgICBpZiAoIXApIHJldHVybjtcbiAgICBpZiAoIXAubW92ZWQgJiYgTWF0aC5oeXBvdChlLmNsaWVudFggLSBwLngsIGUuY2xpZW50WSAtIHAueSkgPCA0KSByZXR1cm47XG4gICAgcC5tb3ZlZCA9IHRydWU7XG4gICAgc2V0R2hvc3QoeyBraW5kOiBwLmtpbmQsIHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH0pO1xuICB9O1xuICBjb25zdCB1cCA9IChlOiBQb2ludGVyRXZlbnREYXRhKSA9PiB7XG4gICAgY29uc3QgcCA9IHByZXNzLmN1cnJlbnQ7XG4gICAgcHJlc3MuY3VycmVudCA9IG51bGw7XG4gICAgc2V0R2hvc3QobnVsbCk7XG4gICAgaWYgKCFwKSByZXR1cm47XG4gICAgaWYgKCFwLm1vdmVkKSBvbkFkZChwLmtpbmQpO1xuICAgIGVsc2UgaWYgKGUuY2xpZW50WCA+IFBBTEVUVEVfVyArIDI0KSBvbkRyb3AocC5raW5kLCBlLmNsaWVudFgsIGUuY2xpZW50WSk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAuLi5nbGFzcyxcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiAxNCxcbiAgICAgICAgICB0b3A6IDE0LFxuICAgICAgICAgIHdpZHRoOiBQQUxFVFRFX1csXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBwYWRkaW5nOiBcIjEycHggOHB4IDhweFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjQsXG4gICAgICAgICAgICBjb2xvcjogQy5kaW0sXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDYgfSxcbiAgICAgICAgICAgIG1hcmdpbjogeyBib3R0b206IDQgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgTU9EVUxFU1xuICAgICAgICA8L3RleHQ+XG4gICAgICAgIHsoT2JqZWN0LmtleXMoQ0FURUdPUklFUykgYXMgQ2F0ZWdvcnlbXSkubWFwKChjKSA9PiAoXG4gICAgICAgICAgPG5vZGUga2V5PXtjfSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiIH19PlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgZ2FwOiA2LFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogNiB9LFxuICAgICAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IDgsIGJvdHRvbTogMiB9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogNixcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogNixcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ0FURUdPUklFU1tjXS5jb2xvcixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTAsIGxldHRlclNwYWNpbmc6IDEsIGNvbG9yOiBDLmRpbSB9fT5cbiAgICAgICAgICAgICAgICB7Q0FURUdPUklFU1tjXS5sYWJlbC50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICB7KE9iamVjdC5rZXlzKEtJTkRTKSBhcyBLaW5kW10pXG4gICAgICAgICAgICAgIC5maWx0ZXIoKGspID0+IEtJTkRTW2tdLmNhdGVnb3J5ID09PSBjKVxuICAgICAgICAgICAgICAubWFwKChrKSA9PiAoXG4gICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgIGtleT17a31cbiAgICAgICAgICAgICAgICAgIG9uUG9pbnRlckRvd249e2Rvd24oayl9XG4gICAgICAgICAgICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlfVxuICAgICAgICAgICAgICAgICAgb25Qb2ludGVyVXA9e3VwfVxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAzMixcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgZ2FwOiA5LFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDYgfSxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA4LFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IFwiZ3JhYlwiLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwKVwiLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWDogMCB9LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB7IGR1cmF0aW9uOiAxMjAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHsgc3RpZmZuZXNzOiA0MjAsIGRhbXBpbmc6IDI2IH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgaG92ZXJTdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGFscGhhKENBVEVHT1JJRVNbY10uY29sb3IsIDAuMTQpLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWDogMyB9LFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDI0LFxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNyxcbiAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogYWxwaGEoQ0FURUdPUklFU1tjXS5jb2xvciwgMC4xNCksXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uXG4gICAgICAgICAgICAgICAgICAgICAgZD17S0lORFNba10uaWNvbn1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcj17Q0FURUdPUklFU1tjXS5jb2xvcn1cbiAgICAgICAgICAgICAgICAgICAgICBzaXplPXsxNH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAgICAgICAgICAgICAge0tJTkRTW2tdLnRpdGxlfVxuICAgICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIHtnaG9zdCAmJiA8R2hvc3Qgey4uLmdob3N0fSAvPn1cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIFdoYXQgZm9sbG93cyB0aGUgcG9pbnRlciB3aGlsZSBhIG1vZHVsZSBpcyBkcmFnZ2VkIG91dC4gKi9cbmZ1bmN0aW9uIEdob3N0KHsga2luZCwgeCwgeSB9OiB7IGtpbmQ6IEtpbmQ7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0pIHtcbiAgY29uc3QgZGVmID0gS0lORFNba2luZF07XG4gIGNvbnN0IGNvbG9yID0gQ0FURUdPUklFU1tkZWYuY2F0ZWdvcnldLmNvbG9yO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogeCAtIDE4LFxuICAgICAgICB0b3A6IHkgLSAxNixcbiAgICAgICAgd2lkdGg6IDE2OCxcbiAgICAgICAgaGVpZ2h0OiAzNCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiA5LFxuICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDEwIH0sXG4gICAgICAgIGJvcmRlclJhZGl1czogMTAsXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IGFscGhhKGNvbG9yLCAwLjcpLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGFscGhhKFwiIzE1MWEyNlwiLCAwLjkyKSxcbiAgICAgICAgYm94U2hhZG93OiB7IGNvbG9yOiBhbHBoYShjb2xvciwgMC4zNSksIGJsdXJSYWRpdXM6IDE4IH0sXG4gICAgICAgIGdsb2JhbFpJbmRleDogMzAsXG4gICAgICAgIHRyYW5zZm9ybTogeyByb3RhdGU6IC0zIH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxJY29uIGQ9e2RlZi5pY29ufSBjb2xvcj17Y29sb3J9IHNpemU9ezE1fSAvPlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgIHtkZWYudGl0bGUudG9VcHBlckNhc2UoKX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdHlwZSBSZWFjdE5vZGUsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEljb24gfSBmcm9tIFwiLi4vZ3JhcGgvTm9kZUNhcmRcIjtcbmltcG9ydCB0eXBlIHsgUHJlc2V0IH0gZnJvbSBcIi4uL2dyYXBoL3ByZXNldHNcIjtcbmltcG9ydCB7IEMsIEZPTlRfTU9OTywgU0lHTkFMLCBhbHBoYSwgZ2xhc3MgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IFByZXNldHMgfSBmcm9tIFwiLi9QcmVzZXRzXCI7XG5cbmNvbnN0IGJ1dHRvbiA9IHtcbiAgaGVpZ2h0OiAzMixcbiAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgZ2FwOiA3LFxuICBwYWRkaW5nOiB7IGxlZnQ6IDExLCByaWdodDogMTIgfSxcbiAgYm9yZGVyUmFkaXVzOiA5LFxuICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwKVwiLFxuICB0cmFuc2l0aW9uOiB7XG4gICAgYmFja2dyb3VuZENvbG9yOiB7IGR1cmF0aW9uOiAxMjAgfSxcbiAgICB0cmFuc2Zvcm06IHsgc3RpZmZuZXNzOiA1MDAsIGRhbXBpbmc6IDI2IH0sXG4gIH0sXG4gIHRyYW5zZm9ybTogeyBzY2FsZTogMSB9LFxufSBhcyBjb25zdDtcblxuZnVuY3Rpb24gQnV0dG9uKHtcbiAgaWNvbixcbiAgbGFiZWwsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGljb246IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXtidXR0b259XG4gICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDcpXCIgfX1cbiAgICAgIHByZXNzU3R5bGU9e3sgdHJhbnNmb3JtOiB7IHNjYWxlOiAwLjk0IH0gfX1cbiAgICA+XG4gICAgICA8SWNvbiBkPXtpY29ufSBjb2xvcj17Qy5kaW19IHNpemU9ezE1fSAvPlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy50ZXh0IH19PntsYWJlbH08L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBEaXZpZGVyID0gKCkgPT4gKFxuICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMSwgaGVpZ2h0OiAyMiwgYmFja2dyb3VuZENvbG9yOiBDLmdsYXNzRWRnZSB9fSAvPlxuKTtcblxuZXhwb3J0IGZ1bmN0aW9uIFRvcEJhcih7XG4gIHByZXNldHMsXG4gIHByZXNldCxcbiAgb25QcmVzZXQsXG4gIHBsYXlpbmcsXG4gIG9uUGxheSxcbiAgYnBtLFxuICBvbkJwbSxcbiAgem9vbSxcbiAgb25BcnJhbmdlLFxuICBvbkZpdCxcbn06IHtcbiAgcHJlc2V0czogUHJlc2V0W107XG4gIHByZXNldDogbnVtYmVyO1xuICBvblByZXNldDogKGk6IG51bWJlcikgPT4gdm9pZDtcbiAgcGxheWluZzogYm9vbGVhbjtcbiAgb25QbGF5OiAoKSA9PiB2b2lkO1xuICBicG06IG51bWJlcjtcbiAgb25CcG06IChicG06IG51bWJlcikgPT4gdm9pZDtcbiAgem9vbTogbnVtYmVyO1xuICBvbkFycmFuZ2U6ICgpID0+IHZvaWQ7XG4gIG9uRml0OiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIHRvcDogMTQsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmdsYXNzLFxuICAgICAgICAgIGhlaWdodDogNDgsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxNCwgcmlnaHQ6IDggfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPExvZ28gLz5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICBjb2xvcjogQy50ZXh0LFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMC41LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBTeW50aFxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgIDxQcmVzZXRzIHByZXNldHM9e3ByZXNldHN9IHZhbHVlPXtwcmVzZXR9IG9uQ2hhbmdlPXtvblByZXNldH0gLz5cbiAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgPFBsYXkgcGxheWluZz17cGxheWluZ30gb25QbGF5PXtvblBsYXl9IC8+XG4gICAgICAgIDxUZW1wbyBicG09e2JwbX0gb25CcG09e29uQnBtfSAvPlxuICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgaWNvbj1cIk00IDZoNnY0SDR6IE0xNCAxNGg2djRoLTZ6IE0xMCA4aDJ2OGgyXCJcbiAgICAgICAgICBsYWJlbD1cIkFycmFuZ2VcIlxuICAgICAgICAgIG9uQ2xpY2s9e29uQXJyYW5nZX1cbiAgICAgICAgLz5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGljb249XCJNNCA5VjRoNSBNMjAgOVY0aC01IE00IDE1djVoNSBNMjAgMTV2NWgtNVwiXG4gICAgICAgICAgbGFiZWw9XCJGaXRcIlxuICAgICAgICAgIG9uQ2xpY2s9e29uRml0fVxuICAgICAgICAvPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogNTIsXG4gICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGT05UX01PTk8sXG4gICAgICAgICAgICBjb2xvcjogQy5kaW0sXG4gICAgICAgICAgICB0ZXh0QWxpZ246IFwicmlnaHRcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2Ake01hdGgucm91bmQoem9vbSAqIDEwMCl9JWB9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIExvZ28oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI4IDI4XCIgc3R5bGU9e3sgd2lkdGg6IDI2LCBoZWlnaHQ6IDI2IH19PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk03IDggQzE0IDggMTQgMjAgMjEgMjBcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17U0lHTkFMLmF1ZGlvfVxuICAgICAgICBzdHJva2VXaWR0aD17Mi4yfVxuICAgICAgLz5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNNyAyMCBDMTIgMjAgMTQgMTQgMjEgMTRcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17U0lHTkFMLmdhdGV9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyLjJ9XG4gICAgICAvPlxuICAgICAgPGNpcmNsZSBjeD17N30gY3k9ezh9IHI9ezMuNH0gZmlsbD17U0lHTkFMLmF1ZGlvfSAvPlxuICAgICAgPGNpcmNsZSBjeD17N30gY3k9ezIwfSByPXszLjR9IGZpbGw9e1NJR05BTC5nYXRlfSAvPlxuICAgICAgPGNpcmNsZSBjeD17MjF9IGN5PXsyMH0gcj17My40fSBmaWxsPXtDLnRleHR9IC8+XG4gICAgICA8Y2lyY2xlIGN4PXsyMX0gY3k9ezE0fSByPXszLjR9IGZpbGw9e1NJR05BTC5jdn0gLz5cbiAgICA8L3N2Zz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gUGxheSh7IHBsYXlpbmcsIG9uUGxheSB9OiB7IHBsYXlpbmc6IGJvb2xlYW47IG9uUGxheTogKCkgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IGNvbG9yID0gcGxheWluZyA/IFNJR05BTC5hdWRpbyA6IEMudGV4dDtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25DbGljaz17b25QbGF5fVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IDM0LFxuICAgICAgICBoZWlnaHQ6IDM0LFxuICAgICAgICBib3JkZXJSYWRpdXM6IDE3LFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogYWxwaGEoU0lHTkFMLmF1ZGlvLCBwbGF5aW5nID8gMC42IDogMC4yNSksXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogYWxwaGEoU0lHTkFMLmF1ZGlvLCBwbGF5aW5nID8gMC4xNiA6IDAuMDUpLFxuICAgICAgICAvLyBUaGUgaWNvbiBjcm9zcy1mYWRlcyBiZXR3ZWVuIHBsYXkgYW5kIHBhdXNlLlxuICAgICAgICBtb3JwaEZpbHRlcjogeyBrZXk6IHBsYXlpbmcgPyAxIDogMCwgbmFtZTogXCJjcm9zc2ZhZGVcIiB9LFxuICAgICAgICB0cmFuc2Zvcm06IHsgc2NhbGU6IDEgfSxcbiAgICAgICAgdHJhbnNpdGlvbjoge1xuICAgICAgICAgIHRyYW5zZm9ybTogeyBzdGlmZm5lc3M6IDUwMCwgZGFtcGluZzogMjQgfSxcbiAgICAgICAgICBtb3JwaEZpbHRlcjogeyBkdXJhdGlvbjogMjIwIH0sXG4gICAgICAgIH0sXG4gICAgICB9fVxuICAgICAgcHJlc3NTdHlsZT17eyB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOSB9IH19XG4gICAgPlxuICAgICAge3BsYXlpbmcgPyAoXG4gICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHN0eWxlPXt7IHdpZHRoOiAxNCwgaGVpZ2h0OiAxNCB9fT5cbiAgICAgICAgICA8cmVjdCB4PXs1fSB5PXs0fSB3aWR0aD17NC41fSBoZWlnaHQ9ezE2fSByeD17MS4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgICAgICA8cmVjdCB4PXsxNC41fSB5PXs0fSB3aWR0aD17NC41fSBoZWlnaHQ9ezE2fSByeD17MS4yfSBmaWxsPXtjb2xvcn0gLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICApIDogKFxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBzdHlsZT17eyB3aWR0aDogMTQsIGhlaWdodDogMTQgfX0+XG4gICAgICAgICAgPHBhdGggZD1cIk03IDQuNXYxNWwxMi03LjV6XCIgZmlsbD17Y29sb3J9IC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgdGVtcG86IGRyYWcgc2lkZXdheXMgdG8gc2NydWI7IGl0IHRha2VzIGVmZmVjdCBvbiByZWxlYXNlLiAqL1xuZnVuY3Rpb24gVGVtcG8oeyBicG0sIG9uQnBtIH06IHsgYnBtOiBudW1iZXI7IG9uQnBtOiAoYnBtOiBudW1iZXIpID0+IHZvaWQgfSkge1xuICBjb25zdCBbbGl2ZSwgc2V0TGl2ZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKTtcbiAgY29uc3QgZHJhZyA9IHVzZVJlZjx7IHg6IG51bWJlcjsgYnBtOiBudW1iZXIgfSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBzaG93biA9IGxpdmUgPz8gYnBtO1xuICBjb25zdCBzY3J1YiA9ICh4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBkID0gZHJhZy5jdXJyZW50O1xuICAgIHJldHVybiBkXG4gICAgICA/IE1hdGgubWF4KDYwLCBNYXRoLm1pbigxODAsIE1hdGgucm91bmQoZC5icG0gKyAoeCAtIGQueCkgLyAzKSkpXG4gICAgICA6IGJwbTtcbiAgfTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25Qb2ludGVyRG93bj17KGUpID0+IHtcbiAgICAgICAgZHJhZy5jdXJyZW50ID0geyB4OiBlLmNsaWVudFgsIGJwbSB9O1xuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhlKSA9PiBzZXRMaXZlKHNjcnViKGUuY2xpZW50WCkpfVxuICAgICAgb25Qb2ludGVyVXA9eyhlKSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBzY3J1YihlLmNsaWVudFgpO1xuICAgICAgICBkcmFnLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICBzZXRMaXZlKG51bGwpO1xuICAgICAgICBpZiAobmV4dCAhPT0gYnBtKSBvbkJwbShuZXh0KTtcbiAgICAgIH19XG4gICAgICBzdHlsZT17e1xuICAgICAgICBoZWlnaHQ6IDMyLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDYsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAgfSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiA5LFxuICAgICAgICBjdXJzb3I6IFwiZXdSZXNpemVcIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOlxuICAgICAgICAgIGxpdmUgPT09IG51bGwgPyBcInJnYmEoMCwgMCwgMCwgMC4yMilcIiA6IFwicmdiYSgwLCAwLCAwLCAwLjQpXCIsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjQpXCIgfX1cbiAgICA+XG4gICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTUsIGZvbnRGYW1pbHk6IEZPTlRfTU9OTywgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAge3Nob3dufVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEwLCBjb2xvcjogQy5kaW0gfX0+QlBNPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEhpbnRzKCkge1xuICBjb25zdCBpdGVtczogW3N0cmluZywgc3RyaW5nXVtdID0gW1xuICAgIFtcIkRyYWcgYSBzb2NrZXRcIiwgXCJwYXRjaFwiXSxcbiAgICBbXCJSaWdodC1jbGlja1wiLCBcImFkZFwiXSxcbiAgICBbXCJXQVNEXCIsIFwicGFuXCJdLFxuICAgIFtcIlNwYWNlXCIsIFwicGxheVwiXSxcbiAgICBbXCJGXCIsIFwiZml0XCJdLFxuICAgIFtcIkRlbFwiLCBcInJlbW92ZVwiXSxcbiAgICBbXCJTaGlmdC1kcmFnXCIsIFwic2VsZWN0XCJdLFxuICBdO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5nbGFzcyxcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDE0LFxuICAgICAgICBib3R0b206IDE0LFxuICAgICAgICBoZWlnaHQ6IDM0LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDE0LFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE0IH0sXG4gICAgICAgIGJvcmRlclJhZGl1czogMTcsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtpdGVtcy5tYXAoKFtrZXksIHdoYXRdKSA9PiAoXG4gICAgICAgIDxIaW50IGtleT17a2V5fSBrPXtrZXl9IHdoYXQ9e3doYXR9IC8+XG4gICAgICApKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIEhpbnQoeyBrLCB3aGF0IH06IHsgazogc3RyaW5nOyB3aGF0OiBzdHJpbmcgfSk6IFJlYWN0Tm9kZSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA2IH19PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogMTAsXG4gICAgICAgICAgZm9udEZhbWlseTogRk9OVF9NT05PLFxuICAgICAgICAgIGNvbG9yOiBDLnRleHQsXG4gICAgICAgICAgcGFkZGluZzogXCIxcHggNXB4XCIsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDgpXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtrfVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogQy5kaW0gfX0+e3doYXR9PC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB7IEljb24gfSBmcm9tIFwiLi4vZ3JhcGgvTm9kZUNhcmRcIjtcbmltcG9ydCB7IEMsIEZPTlRfTU9OTywgU0lHTkFMLCBhbHBoYSwgZ2xhc3MgfSBmcm9tIFwiLi4vdGhlbWVcIjtcblxudHlwZSBJdGVtID0geyBuYW1lOiBzdHJpbmc7IGJsdXJiOiBzdHJpbmc7IGJwbTogbnVtYmVyIH07XG5cbi8qKiBUaGUgcHJlc2V0IHBpY2tlcjogdGhlIHBhdGNoJ3MgbmFtZSBiZXR3ZWVuIGJhY2sgYW5kIGZvcndhcmQ7IHRoZSBuYW1lXG4gKiAgb3BlbnMgdGhlIGxpc3QuICovXG5leHBvcnQgZnVuY3Rpb24gUHJlc2V0cyh7XG4gIHByZXNldHMsXG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbn06IHtcbiAgcHJlc2V0czogSXRlbVtdO1xuICB2YWx1ZTogbnVtYmVyO1xuICBvbkNoYW5nZTogKGk6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBzdGVwID0gKGJ5OiBudW1iZXIpID0+XG4gICAgb25DaGFuZ2UoKHZhbHVlICsgYnkgKyBwcmVzZXRzLmxlbmd0aCkgJSBwcmVzZXRzLmxlbmd0aCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm47XG4gICAgcmV0dXJuIGJldnkub24oXCJrZXlEb3duXCIsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRXNjYXBlXCIpIHNldE9wZW4oZmFsc2UpO1xuICAgIH0pO1xuICB9LCBbb3Blbl0pO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMiB9fT5cbiAgICAgIDxBcnJvdyBkPVwiTTE1IDZsLTYgNiA2IDZcIiBvbkNsaWNrPXsoKSA9PiBzdGVwKC0xKX0gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKG8pID0+ICFvKX1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogNixcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDEyLCByaWdodDogOSB9LFxuICAgICAgICAgIGJvcmRlclJhZGl1czogOSxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IG9wZW5cbiAgICAgICAgICAgID8gXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSlcIlxuICAgICAgICAgICAgOiBcInJnYmEoMCwgMCwgMCwgMC4yOClcIixcbiAgICAgICAgICB0cmFuc2l0aW9uOiB7IGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMTIwIH0gfSxcbiAgICAgICAgfX1cbiAgICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA4KVwiIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZsZXhHcm93OiAxLCBmb250U2l6ZTogMTMsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgICAge3ByZXNldHNbdmFsdWVdLm5hbWV9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPEljb24gZD1cIk02IDlsNiA2IDYtNlwiIGNvbG9yPXtDLmRpbX0gc2l6ZT17MTR9IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8QXJyb3cgZD1cIk05IDZsNiA2LTYgNlwiIG9uQ2xpY2s9eygpID0+IHN0ZXAoMSl9IC8+XG4gICAgICB7b3BlbiAmJiAoXG4gICAgICAgIDxMaXN0XG4gICAgICAgICAgcHJlc2V0cz17cHJlc2V0c31cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgb25QaWNrPXsoaSkgPT4ge1xuICAgICAgICAgICAgc2V0T3BlbihmYWxzZSk7XG4gICAgICAgICAgICBvbkNoYW5nZShpKTtcbiAgICAgICAgICB9fVxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldE9wZW4oZmFsc2UpfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIEFycm93KHsgZCwgb25DbGljayB9OiB7IGQ6IHN0cmluZzsgb25DbGljazogKCkgPT4gdm9pZCB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogMjYsXG4gICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBib3JkZXJSYWRpdXM6IDgsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDApXCIsXG4gICAgICAgIHRyYW5zaXRpb246IHsgYmFja2dyb3VuZENvbG9yOiB7IGR1cmF0aW9uOiAxMjAgfSB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNylcIiB9fVxuICAgID5cbiAgICAgIDxJY29uIGQ9e2R9IGNvbG9yPXtDLmRpbX0gc2l6ZT17MTV9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogRXZlcnkgcHJlc2V0LCB1bmRlciB0aGUgdG9wIGJhci4gQSBwcmVzcyBhbnl3aGVyZSBlbHNlIGNsb3NlcyBpdDsgdGhlXG4gKiAgbGlzdCBpcyBgZml4ZWRgLCBzbyB0aGUgYmFyJ3MgZnJvc3RlZCBsYXllciBkb2Vzbid0IGNsaXAgaXQuICovXG5mdW5jdGlvbiBMaXN0KHtcbiAgcHJlc2V0cyxcbiAgdmFsdWUsXG4gIG9uUGljayxcbiAgb25DbG9zZSxcbn06IHtcbiAgcHJlc2V0czogSXRlbVtdO1xuICB2YWx1ZTogbnVtYmVyO1xuICBvblBpY2s6IChpOiBudW1iZXIpID0+IHZvaWQ7XG4gIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIG9uUG9pbnRlckRvd249e29uQ2xvc2V9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiZml4ZWRcIixcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnbG9iYWxaSW5kZXg6IDQwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICAvLyBPd25zIHRoZSBwcmVzc2VzIGJldHdlZW4gdGhlIHJvd3MsIHNvIHRoZXkgZG9uJ3QgY2xvc2UgaXQuXG4gICAgICAgIG9uUG9pbnRlckRvd249eygpID0+IHt9fVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLmdsYXNzLFxuICAgICAgICAgIG1hcmdpbjogeyB0b3A6IDcwIH0sXG4gICAgICAgICAgd2lkdGg6IDM0MCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIHBhZGRpbmc6IDYsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtwcmVzZXRzLm1hcCgocCwgaSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e3AubmFtZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUGljayhpKX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAsIHZlcnRpY2FsOiA3IH0sXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogOCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOlxuICAgICAgICAgICAgICAgIGkgPT09IHZhbHVlID8gYWxwaGEoXCIjZmZmZmZmXCIsIDAuMDgpIDogYWxwaGEoXCIjZmZmZmZmXCIsIDApLFxuICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB7IGJhY2tncm91bmRDb2xvcjogeyBkdXJhdGlvbjogMTIwIH0gfSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogYWxwaGEoXCIjZmZmZmZmXCIsIDAuMTIpIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IGkgPT09IHZhbHVlID8gU0lHTkFMLmF1ZGlvIDogQy50ZXh0LFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7cC5uYW1lfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMuZGltIH19PntwLmJsdXJifTwvdGV4dD5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgZm9udEZhbWlseTogRk9OVF9NT05PLCBjb2xvcjogQy5kaW0gfX0+XG4gICAgICAgICAgICAgIHtgJHtwLmJwbX1gfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHR5cGUgRGlzcGF0Y2gsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBQb2ludGVyRXZlbnREYXRhIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IGJldnksIHR5cGUgRHJhZyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBBZGRNZW51IH0gZnJvbSBcIi4uL2Nocm9tZS9BZGRNZW51XCI7XG5pbXBvcnQgeyB1c2VEZWJ1ZywgdXNlTGF0ZXN0IH0gZnJvbSBcIi4uL2hvb2tzXCI7XG5pbXBvcnQgeyBTSUdOQUwsIGFscGhhIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBab29tQ29udGV4dCB9IGZyb20gXCIuLi93aWRnZXRzXCI7XG5pbXBvcnQgeyBIRUFERVIsIHR5cGUgS2luZCwgUk9XLCBST1dTX1BBRCwga2luZCB9IGZyb20gXCIuL2NhdGFsb2dcIjtcbmltcG9ydCB7XG4gIHR5cGUgQWN0aW9uLFxuICB0eXBlIEdyYXBoLFxuICB0eXBlIFNvY2tldFJlZixcbiAgY2FuUGx1ZyxcbiAgbGl2ZSxcbiAgbm9kZUJveCxcbiAgc2lnbmFsT2YsXG4gIHNvY2tldE5hbWUsXG59IGZyb20gXCIuL21vZGVsXCI7XG5pbXBvcnQgeyB0eXBlIENhcmRBcGksIE5vZGVDYXJkLCB0eXBlIFBsdWcgfSBmcm9tIFwiLi9Ob2RlQ2FyZFwiO1xuXG4vKiogVGhlIG5vZGUgZXZlcnkgY2FyZCBpcyBsYWlkIG91dCBpbiAoYFJPT1RgIGluIGB2aWV3LnJzYCk6IEJldnkgb3ducyBpdHNcbiAqICB0cmFuc2Zvcm0sIGdsaWRpbmcgdGhlIHZpZXcgdG93YXJkIGB2aWV3LnNldGAuICovXG5leHBvcnQgY29uc3QgR1JBUEhfUk9PVCA9IFwiZ3JhcGgtcm9vdFwiO1xuXG5leHBvcnQgdHlwZSBWaWV3ID0geyB4OiBudW1iZXI7IHk6IG51bWJlcjsgem9vbTogbnVtYmVyOyBnbGlkZTogbnVtYmVyIH07XG5cbi8qKiBab29tIGxldmVscyBhcmUgcG93ZXJzIG9mIHRoaXMsIHNvIGEgem9vbSBsYXlzIHRleHQgb3V0IGF0IG9uZSBvZiBhXG4gKiAgYm91bmRlZCBzZXQgb2Ygc2l6ZXMuICovXG5jb25zdCBaT09NX1NURVAgPSAxLjEyO1xuZXhwb3J0IGNvbnN0IHpvb21MZXZlbCA9ICh6b29tOiBudW1iZXIpID0+XG4gIE1hdGgubWF4KC0xMSwgTWF0aC5taW4oNywgTWF0aC5yb3VuZChNYXRoLmxvZyh6b29tKSAvIE1hdGgubG9nKFpPT01fU1RFUCkpKSk7XG5leHBvcnQgY29uc3Qgem9vbUF0ID0gKGxldmVsOiBudW1iZXIpID0+IFpPT01fU1RFUCAqKiBsZXZlbDtcblxudHlwZSBWZWMgPSB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH07XG50eXBlIFdpcmUgPSB7XG4gIGZyb206IFNvY2tldFJlZjtcbiAgdG86IFNvY2tldFJlZiB8IG51bGw7XG4gIGF0OiBbbnVtYmVyLCBudW1iZXJdIHwgbnVsbDtcbn07XG50eXBlIE1lbnUgPSB7IHg6IG51bWJlcjsgeTogbnVtYmVyOyB3aXJlOiBTb2NrZXRSZWYgfCBudWxsIH07XG50eXBlIEdlc3R1cmUgPVxuICB8IHsga2luZDogXCJwYW5cIjsgZnJvbTogVmVjOyB2aWV3OiBWaWV3OyBtb3ZlZDogYm9vbGVhbjsgYnV0dG9uOiBudW1iZXIgfVxuICB8IHsga2luZDogXCJib3hcIjsgZnJvbTogVmVjOyBiYXNlOiBzdHJpbmdbXSB9XG4gIHwge1xuICAgICAga2luZDogXCJtb3ZlXCI7XG4gICAgICBmcm9tOiBWZWM7XG4gICAgICBzdGFydDogUmVjb3JkPHN0cmluZywgVmVjPjtcbiAgICAgIG1vdmVkOiBib29sZWFuO1xuICAgICAgcHJlc3M6IHN0cmluZztcbiAgICAgIHNoaWZ0OiBib29sZWFuO1xuICAgICAgd2FzOiBib29sZWFuO1xuICAgIH07XG5cbmNvbnN0IHNhbWUgPSAoYTogU29ja2V0UmVmIHwgbnVsbCwgYjogU29ja2V0UmVmIHwgbnVsbCkgPT5cbiAgYSA9PT0gYiB8fFxuICAoISFhICYmICEhYiAmJiBhLm5vZGUgPT09IGIubm9kZSAmJiBhLnNpZGUgPT09IGIuc2lkZSAmJiBhLnBvcnQgPT09IGIucG9ydCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBDYW52YXMoe1xuICBncmFwaCxcbiAgZGlzcGF0Y2gsXG4gIHZpZXcsXG4gIHNldFZpZXcsXG4gIGdsaWRpbmcsXG4gIHBsYXlpbmcsXG59OiB7XG4gIGdyYXBoOiBHcmFwaDtcbiAgZGlzcGF0Y2g6IERpc3BhdGNoPEFjdGlvbj47XG4gIHZpZXc6IFZpZXc7XG4gIHNldFZpZXc6ICh2OiBWaWV3KSA9PiB2b2lkO1xuICBnbGlkaW5nOiBib29sZWFuO1xuICBwbGF5aW5nOiBib29sZWFuO1xufSkge1xuICBjb25zdCBbd2lyZSwgc2V0V2lyZV0gPSB1c2VTdGF0ZTxXaXJlIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtsaWZ0ZWQsIHNldExpZnRlZF0gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oW10pO1xuICBjb25zdCBbYm94LCBzZXRCb3hdID0gdXNlU3RhdGU8eyBhOiBWZWM7IGI6IFZlYyB9IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFttZW51LCBzZXRNZW51XSA9IHVzZVN0YXRlPE1lbnUgfCBudWxsPihudWxsKTtcbiAgY29uc3QgZ2VzdHVyZSA9IHVzZVJlZjxHZXN0dXJlIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHdoZWVsID0gdXNlUmVmKDApO1xuICBjb25zdCBzdGF0ZSA9IHVzZUxhdGVzdCh7IGdyYXBoLCB2aWV3LCB3aXJlIH0pO1xuXG4gIGNvbnN0IHRvV29ybGQgPSAocDogVmVjLCB2ID0gc3RhdGUuY3VycmVudC52aWV3KSA9PiAoe1xuICAgIHg6IChwLnggLSB2LngpIC8gdi56b29tLFxuICAgIHk6IChwLnkgLSB2LnkpIC8gdi56b29tLFxuICB9KTtcbiAgY29uc3QgY2xpZW50ID0gKGU6IFBvaW50ZXJFdmVudERhdGEpID0+ICh7IHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH0pO1xuXG4gIGNvbnN0IHBhbiA9IHtcbiAgICBzdGFydChlOiBQb2ludGVyRXZlbnREYXRhKSB7XG4gICAgICBnZXN0dXJlLmN1cnJlbnQgPSB7XG4gICAgICAgIGtpbmQ6IFwicGFuXCIsXG4gICAgICAgIGZyb206IGNsaWVudChlKSxcbiAgICAgICAgdmlldzogc3RhdGUuY3VycmVudC52aWV3LFxuICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgIGJ1dHRvbjogZS5idXR0b24gPz8gMCxcbiAgICAgIH07XG4gICAgfSxcbiAgICBtb3ZlKGU6IFBvaW50ZXJFdmVudERhdGEpIHtcbiAgICAgIGNvbnN0IGcgPSBnZXN0dXJlLmN1cnJlbnQ7XG4gICAgICBpZiAoZz8ua2luZCAhPT0gXCJwYW5cIikgcmV0dXJuO1xuICAgICAgY29uc3QgZHggPSBlLmNsaWVudFggLSBnLmZyb20ueDtcbiAgICAgIGNvbnN0IGR5ID0gZS5jbGllbnRZIC0gZy5mcm9tLnk7XG4gICAgICBpZiAoIWcubW92ZWQgJiYgTWF0aC5oeXBvdChkeCwgZHkpIDwgMykgcmV0dXJuO1xuICAgICAgZy5tb3ZlZCA9IHRydWU7XG4gICAgICBzZXRWaWV3KHsgLi4uZy52aWV3LCB4OiBnLnZpZXcueCArIGR4LCB5OiBnLnZpZXcueSArIGR5LCBnbGlkZTogMCB9KTtcbiAgICB9LFxuICB9O1xuXG4gIC8vIFN0YWJsZSBmb3IgdGhlIG1lbW9pemVkIGNhcmRzOyByZWFkcyB0aGUgbGF0ZXN0IHN0YXRlIHRocm91Z2ggYHN0YXRlYC5cbiAgY29uc3QgYXBpID0gdXNlTWVtbzxDYXJkQXBpPihcbiAgICAoKSA9PiAoe1xuICAgICAgcHJlc3MoaWQsIGUpIHtcbiAgICAgICAgY29uc3QgeyBncmFwaCB9ID0gc3RhdGUuY3VycmVudDtcbiAgICAgICAgaWYgKGdyYXBoLm5vZGVzW2lkXT8ubGVhdmluZykgcmV0dXJuO1xuICAgICAgICBzZXRNZW51KG51bGwpO1xuICAgICAgICBpZiAoZS5idXR0b24gPT09IDEpIHJldHVybiBwYW4uc3RhcnQoZSk7XG4gICAgICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB3YXMgPSBncmFwaC5zZWxlY3RlZC5pbmNsdWRlcyhpZCk7XG4gICAgICAgIGNvbnN0IGlkcyA9IHdhc1xuICAgICAgICAgID8gZ3JhcGguc2VsZWN0ZWRcbiAgICAgICAgICA6IGUuc2hpZnRLZXlcbiAgICAgICAgICAgID8gWy4uLmdyYXBoLnNlbGVjdGVkLCBpZF1cbiAgICAgICAgICAgIDogW2lkXTtcbiAgICAgICAgaWYgKCF3YXMpIGRpc3BhdGNoKHsgdHlwZTogXCJzZWxlY3RcIiwgaWRzIH0pO1xuICAgICAgICBkaXNwYXRjaCh7IHR5cGU6IFwicmFpc2VcIiwgaWRzOiBbLi4uaWRzLmZpbHRlcigoaSkgPT4gaSAhPT0gaWQpLCBpZF0gfSk7XG4gICAgICAgIGdlc3R1cmUuY3VycmVudCA9IHtcbiAgICAgICAgICBraW5kOiBcIm1vdmVcIixcbiAgICAgICAgICBmcm9tOiBjbGllbnQoZSksXG4gICAgICAgICAgc3RhcnQ6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgIGlkcy5tYXAoKGkpID0+IFtpLCB7IHg6IGdyYXBoLm5vZGVzW2ldLngsIHk6IGdyYXBoLm5vZGVzW2ldLnkgfV0pLFxuICAgICAgICAgICksXG4gICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICAgIHByZXNzOiBpZCxcbiAgICAgICAgICBzaGlmdDogZS5zaGlmdEtleSxcbiAgICAgICAgICB3YXMsXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgZHJhZyhlKSB7XG4gICAgICAgIGNvbnN0IGcgPSBnZXN0dXJlLmN1cnJlbnQ7XG4gICAgICAgIGlmIChnPy5raW5kID09PSBcInBhblwiKSByZXR1cm4gcGFuLm1vdmUoZSk7XG4gICAgICAgIGlmIChnPy5raW5kICE9PSBcIm1vdmVcIikgcmV0dXJuO1xuICAgICAgICBjb25zdCBkeCA9IGUuY2xpZW50WCAtIGcuZnJvbS54O1xuICAgICAgICBjb25zdCBkeSA9IGUuY2xpZW50WSAtIGcuZnJvbS55O1xuICAgICAgICBpZiAoIWcubW92ZWQgJiYgTWF0aC5oeXBvdChkeCwgZHkpIDwgMykgcmV0dXJuO1xuICAgICAgICBpZiAoIWcubW92ZWQpIHtcbiAgICAgICAgICBnLm1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICBzZXRMaWZ0ZWQoT2JqZWN0LmtleXMoZy5zdGFydCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHpvb20gPSBzdGF0ZS5jdXJyZW50LnZpZXcuem9vbTtcbiAgICAgICAgY29uc3QgdG86IFJlY29yZDxzdHJpbmcsIFZlYz4gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIHBdIG9mIE9iamVjdC5lbnRyaWVzKGcuc3RhcnQpKSB7XG4gICAgICAgICAgdG9baWRdID0ge1xuICAgICAgICAgICAgeDogTWF0aC5yb3VuZChwLnggKyBkeCAvIHpvb20pLFxuICAgICAgICAgICAgeTogTWF0aC5yb3VuZChwLnkgKyBkeSAvIHpvb20pLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcIm1vdmVcIiwgdG8gfSk7XG4gICAgICB9LFxuICAgICAgcmVsZWFzZSgpIHtcbiAgICAgICAgY29uc3QgZyA9IGdlc3R1cmUuY3VycmVudDtcbiAgICAgICAgZ2VzdHVyZS5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKGc/LmtpbmQgIT09IFwibW92ZVwiKSByZXR1cm47XG4gICAgICAgIHNldExpZnRlZChbXSk7XG4gICAgICAgIGlmIChnLm1vdmVkKSByZXR1cm47XG4gICAgICAgIC8vIEEgY2xpY2s6IGp1c3QgdGhpcyBub2RlLCBvciBTaGlmdCB0b2dnbGVzIGl0LlxuICAgICAgICBjb25zdCB7IHNlbGVjdGVkIH0gPSBzdGF0ZS5jdXJyZW50LmdyYXBoO1xuICAgICAgICBpZiAoIWcuc2hpZnQpIGRpc3BhdGNoKHsgdHlwZTogXCJzZWxlY3RcIiwgaWRzOiBbZy5wcmVzc10gfSk7XG4gICAgICAgIGVsc2UgaWYgKGcud2FzKVxuICAgICAgICAgIGRpc3BhdGNoKHtcbiAgICAgICAgICAgIHR5cGU6IFwic2VsZWN0XCIsXG4gICAgICAgICAgICBpZHM6IHNlbGVjdGVkLmZpbHRlcigoaSkgPT4gaSAhPT0gZy5wcmVzcyksXG4gICAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgc29ja2V0RG93bihzLCBlKSB7XG4gICAgICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuO1xuICAgICAgICBzZXRNZW51KG51bGwpO1xuICAgICAgICBjb25zdCB7IGdyYXBoIH0gPSBzdGF0ZS5jdXJyZW50O1xuICAgICAgICBsZXQgZnJvbSA9IHM7XG4gICAgICAgIC8vIEEgd2lyZWQgaW5wdXQgbGV0cyBnbyBvZiBpdHMgd2lyZTogdGhlIGhhbmQgdGFrZXMgaXQgZnJvbSB0aGVyZS5cbiAgICAgICAgY29uc3QgaGVsZCA9XG4gICAgICAgICAgcy5zaWRlID09PSBcImlcIiAmJlxuICAgICAgICAgIGdyYXBoLmxpbmtzLmZpbmQoKGwpID0+IGwudG8ubm9kZSA9PT0gcy5ub2RlICYmIGwudG8ucG9ydCA9PT0gcy5wb3J0KTtcbiAgICAgICAgaWYgKGhlbGQpIHtcbiAgICAgICAgICBkaXNwYXRjaCh7IHR5cGU6IFwidW5wbHVnXCIsIGlkOiBoZWxkLmlkIH0pO1xuICAgICAgICAgIGZyb20gPSB7IG5vZGU6IGhlbGQuZnJvbS5ub2RlLCBzaWRlOiBcIm9cIiwgcG9ydDogaGVsZC5mcm9tLnBvcnQgfTtcbiAgICAgICAgfVxuICAgICAgICBzZXRXaXJlKHsgZnJvbSwgdG86IG51bGwsIGF0OiBudWxsIH0pO1xuICAgICAgfSxcbiAgICAgIHNvY2tldEhvdmVyKHMsIG9uKSB7XG4gICAgICAgIC8vIEZ1bmN0aW9uYWwgdXBkYXRlczogYW4gZW50ZXIgYW5kIGEgbGVhdmUgbWF5IGxhbmQgaW4gb25lIHRpY2suXG4gICAgICAgIGNvbnN0IHsgZ3JhcGggfSA9IHN0YXRlLmN1cnJlbnQ7XG4gICAgICAgIHNldFdpcmUoKHcpID0+IHtcbiAgICAgICAgICBpZiAoIXcgfHwgdy5hdCkgcmV0dXJuIHc7XG4gICAgICAgICAgaWYgKCFvbikgcmV0dXJuIHNhbWUody50bywgcykgPyB7IC4uLncsIHRvOiBudWxsIH0gOiB3O1xuICAgICAgICAgIHJldHVybiBjYW5QbHVnKGdyYXBoLCB3LmZyb20sIHMpICYmICFzYW1lKHcudG8sIHMpXG4gICAgICAgICAgICA/IHsgLi4udywgdG86IHMgfVxuICAgICAgICAgICAgOiB3O1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBzb2NrZXRVcChlKSB7XG4gICAgICAgIGNvbnN0IHsgd2lyZSwgZ3JhcGggfSA9IHN0YXRlLmN1cnJlbnQ7XG4gICAgICAgIGlmICghd2lyZSkgcmV0dXJuO1xuICAgICAgICBpZiAod2lyZS50bykge1xuICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJjb25uZWN0XCIsIGE6IHdpcmUuZnJvbSwgYjogd2lyZS50byB9KTtcbiAgICAgICAgICBzZXRXaXJlKG51bGwpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBEcm9wcGVkIG9uIGJhcmUgY2FudmFzOiBvZmZlciB0aGUgbW9kdWxlcyB0aGF0IHdvdWxkIGZpdC5cbiAgICAgICAgY29uc3QgcCA9IHRvV29ybGQoY2xpZW50KGUpKTtcbiAgICAgICAgY29uc3Qgb25Ob2RlID0gbGl2ZShncmFwaCkuc29tZSgobikgPT4ge1xuICAgICAgICAgIGNvbnN0IGIgPSBub2RlQm94KG4pO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICBwLnggPj0gYi54ICYmIHAueCA8PSBiLnggKyBiLncgJiYgcC55ID49IGIueSAmJiBwLnkgPD0gYi55ICsgYi5oXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvbk5vZGUpIHJldHVybiBzZXRXaXJlKG51bGwpO1xuICAgICAgICBzZXRXaXJlKHsgLi4ud2lyZSwgYXQ6IFtlLmNsaWVudFgsIGUuY2xpZW50WV0gfSk7XG4gICAgICAgIHNldE1lbnUoeyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSwgd2lyZTogd2lyZS5mcm9tIH0pO1xuICAgICAgfSxcbiAgICAgIHBhcmFtKGlkLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJwYXJhbVwiLCBpZCwga2V5LCB2YWx1ZSB9KTtcbiAgICAgIH0sXG4gICAgICBwdXJnZShpZCkge1xuICAgICAgICBkaXNwYXRjaCh7IHR5cGU6IFwicHVyZ2VcIiwgaWQgfSk7XG4gICAgICB9LFxuICAgIH0pLFxuICAgIC8vIGBzdGF0ZWAsIGBkaXNwYXRjaGAgYW5kIHRoZSBzZXR0ZXJzIGFyZSBzdGFibGUuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgIFtdLFxuICApO1xuICBjb25zdCBjbG9zZU1lbnUgPSAoKSA9PiB7XG4gICAgc2V0TWVudShudWxsKTtcbiAgICBzZXRXaXJlKG51bGwpO1xuICB9O1xuICBjb25zdCBwaWNrID0gKGs6IEtpbmQpID0+IHtcbiAgICBpZiAoIW1lbnUpIHJldHVybjtcbiAgICBjb25zdCBwID0gdG9Xb3JsZChtZW51KTtcbiAgICBjb25zdCBpZCA9IGBuJHtncmFwaC5zZXF9YDtcbiAgICBjb25zdCBkZWYgPSBraW5kKGspO1xuICAgIGNvbnN0IHcgPSBtZW51LndpcmU7XG4gICAgaWYgKCF3KSB7XG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwiYWRkXCIsIGtpbmQ6IGssIHg6IHAueCwgeTogcC55LCBzZWxlY3Q6IHRydWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBzb2NrZXQgdGhhdCB0YWtlcyB0aGUgd2lyZSBsYW5kcyB1bmRlciB0aGUgZHJvcCBwb2ludC5cbiAgICAgIGNvbnN0IHNpZGUgPSB3LnNpZGUgPT09IFwib1wiID8gXCJpXCIgOiBcIm9cIjtcbiAgICAgIGNvbnN0IHBvcnRzID0gc2lkZSA9PT0gXCJpXCIgPyBkZWYuaW5wdXRzIDogZGVmLm91dHB1dHM7XG4gICAgICBjb25zdCBwb3J0ID0gTWF0aC5tYXgoXG4gICAgICAgIDAsXG4gICAgICAgIHBvcnRzLmZpbmRJbmRleCgocSkgPT4gcS5zaWduYWwgPT09IHNpZ25hbE9mKGdyYXBoLCB3KSksXG4gICAgICApO1xuICAgICAgZGlzcGF0Y2goe1xuICAgICAgICB0eXBlOiBcImFkZFwiLFxuICAgICAgICBraW5kOiBrLFxuICAgICAgICB4OiBzaWRlID09PSBcImlcIiA/IHAueCArIDE0IDogcC54IC0gZGVmLndpZHRoIC0gMTQsXG4gICAgICAgIHk6IHAueSAtIEhFQURFUiAtIFJPV1NfUEFEIC0gUk9XICogKHBvcnQgKyAwLjUpLFxuICAgICAgICBzZWxlY3Q6IHRydWUsXG4gICAgICB9KTtcbiAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJjb25uZWN0XCIsIGE6IHcsIGI6IHsgbm9kZTogaWQsIHNpZGUsIHBvcnQgfSB9KTtcbiAgICB9XG4gICAgc2V0TWVudShudWxsKTtcbiAgICBzZXRXaXJlKG51bGwpO1xuICB9O1xuXG4gIC8vIFNoaWZ0K0EgYWRkcyBhdCB0aGUgcG9pbnRlciAoQmV2eSBrbm93cyB3aGVyZSBpdCBpczogbm90aGluZyBoZXJlXG4gIC8vIHRyYWNrcyBpdCk7IEVzY2FwZSBsZXRzIGdvIG9mIHdoYXRldmVyIGlzIG9wZW4uXG4gIHVzZUVmZmVjdChcbiAgICAoKSA9PlxuICAgICAgYmV2eS5vbihcImtleURvd25cIiwgKGUpID0+IHtcbiAgICAgICAgaWYgKGUucmVwZWF0KSByZXR1cm47XG4gICAgICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikgY2xvc2VNZW51KCk7XG4gICAgICAgIGlmIChlLmNvZGUgPT09IFwiS2V5QVwiICYmIGUuc2hpZnRLZXkgJiYgIWUuY3RybEtleSkge1xuICAgICAgICAgIHZvaWQgYmV2eS5wb2ludGVyLmdldCgpLnRoZW4oKGF0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbeCwgeV0gPSBhdCA/PyBbNDAwLCAzMDBdO1xuICAgICAgICAgICAgc2V0TWVudSh7IHgsIHksIHdpcmU6IG51bGwgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgIFtdLFxuICApO1xuICB1c2VEZWJ1ZyhcIm1lbnVcIiwgKFt4LCB5XSkgPT5cbiAgICBzZXRNZW51KHsgeDogTnVtYmVyKHgpLCB5OiBOdW1iZXIoeSksIHdpcmU6IG51bGwgfSksXG4gICk7XG5cbiAgLy8gQmV2eSBoZWFycyB0aGUgcGF0Y2ggd2hlbmV2ZXIgd2hhdCBpdCBkcmF3cyBjaGFuZ2VzIChub3Qgb24gbW92ZXMpLlxuICBjb25zdCBzZW50ID0gdXNlUmVmKFwiXCIpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdGVkID0gbmV3IFNldChncmFwaC5zZWxlY3RlZCk7XG4gICAgY29uc3QgZHJhZzogRHJhZyB8IG51bGwgPSB3aXJlICYmIHtcbiAgICAgIGZyb206IHNvY2tldE5hbWUod2lyZS5mcm9tKSxcbiAgICAgIG91dHB1dDogd2lyZS5mcm9tLnNpZGUgPT09IFwib1wiLFxuICAgICAgdG86IHdpcmUudG8gJiYgc29ja2V0TmFtZSh3aXJlLnRvKSxcbiAgICAgIGF0OiB3aXJlLmF0LFxuICAgICAgc2lnbmFsOiBzaWduYWxPZihncmFwaCwgd2lyZS5mcm9tKSxcbiAgICAgIGNvbG9yOiBTSUdOQUxbc2lnbmFsT2YoZ3JhcGgsIHdpcmUuZnJvbSldLFxuICAgIH07XG4gICAgY29uc3QgbXNnID0ge1xuICAgICAgd2lyZXM6IGdyYXBoLmxpbmtzLm1hcCgobCkgPT4ge1xuICAgICAgICBjb25zdCBvdXQ6IFNvY2tldFJlZiA9IHtcbiAgICAgICAgICBub2RlOiBsLmZyb20ubm9kZSxcbiAgICAgICAgICBzaWRlOiBcIm9cIixcbiAgICAgICAgICBwb3J0OiBsLmZyb20ucG9ydCxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc2lnbmFsID0gc2lnbmFsT2YoZ3JhcGgsIG91dCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGwuaWQsXG4gICAgICAgICAgZnJvbTogc29ja2V0TmFtZShvdXQpLFxuICAgICAgICAgIHRvOiBzb2NrZXROYW1lKHsgbm9kZTogbC50by5ub2RlLCBzaWRlOiBcImlcIiwgcG9ydDogbC50by5wb3J0IH0pLFxuICAgICAgICAgIHNpZ25hbCxcbiAgICAgICAgICBjb2xvcjogU0lHTkFMW3NpZ25hbF0sXG4gICAgICAgICAgaG90OiBzZWxlY3RlZC5oYXMobC5mcm9tLm5vZGUpIHx8IHNlbGVjdGVkLmhhcyhsLnRvLm5vZGUpLFxuICAgICAgICB9O1xuICAgICAgfSksXG4gICAgICBkcmFnLFxuICAgICAgcGxheWluZyxcbiAgICB9O1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShtc2cpO1xuICAgIGlmIChqc29uICE9PSBzZW50LmN1cnJlbnQpIHtcbiAgICAgIHNlbnQuY3VycmVudCA9IGpzb247XG4gICAgICBiZXZ5LnBhdGNoLnNldChtc2cpO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgcGx1Z3MgPSAoaWQ6IHN0cmluZyk6IFJlY29yZDxzdHJpbmcsIFBsdWc+IHwgbnVsbCA9PiB7XG4gICAgaWYgKCF3aXJlKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBkID0ga2luZChncmFwaC5ub2Rlc1tpZF0ua2luZCk7XG4gICAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCBQbHVnPiA9IHt9O1xuICAgIGZvciAoY29uc3QgW3NpZGUsIHBvcnRzXSBvZiBbXG4gICAgICBbXCJpXCIsIGQuaW5wdXRzXSxcbiAgICAgIFtcIm9cIiwgZC5vdXRwdXRzXSxcbiAgICBdIGFzIGNvbnN0KSB7XG4gICAgICBwb3J0cy5mb3JFYWNoKChfLCBwb3J0KSA9PiB7XG4gICAgICAgIGNvbnN0IHM6IFNvY2tldFJlZiA9IHsgbm9kZTogaWQsIHNpZGUsIHBvcnQgfTtcbiAgICAgICAgb3V0W2Ake3NpZGV9JHtwb3J0fWBdID1cbiAgICAgICAgICBzYW1lKHMsIHdpcmUudG8pIHx8IHNhbWUocywgd2lyZS5mcm9tKVxuICAgICAgICAgICAgPyBcInRhcmdldFwiXG4gICAgICAgICAgICA6IGNhblBsdWcoZ3JhcGgsIHdpcmUuZnJvbSwgcylcbiAgICAgICAgICAgICAgPyBcIm9wZW5cIlxuICAgICAgICAgICAgICA6IFwic2h1dFwiO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH07XG4gIGNvbnN0IHdpcmVkID0gKGlkOiBzdHJpbmcpID0+XG4gICAgZ3JhcGgubGlua3NcbiAgICAgIC5mbGF0TWFwKChsKSA9PiBbXG4gICAgICAgIGwuZnJvbS5ub2RlID09PSBpZCAmJiBgbyR7bC5mcm9tLnBvcnR9YCxcbiAgICAgICAgbC50by5ub2RlID09PSBpZCAmJiBgaSR7bC50by5wb3J0fWAsXG4gICAgICBdKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICAgICAgLmpvaW4oXCIgXCIpO1xuXG4gIGNvbnN0IHNlbGVjdEJveCA9IChhOiBWZWMsIGI6IFZlYywgYmFzZTogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCBbcCwgcV0gPSBbdG9Xb3JsZChhKSwgdG9Xb3JsZChiKV07XG4gICAgY29uc3QgeDAgPSBNYXRoLm1pbihwLngsIHEueCk7XG4gICAgY29uc3QgeDEgPSBNYXRoLm1heChwLngsIHEueCk7XG4gICAgY29uc3QgeTAgPSBNYXRoLm1pbihwLnksIHEueSk7XG4gICAgY29uc3QgeTEgPSBNYXRoLm1heChwLnksIHEueSk7XG4gICAgY29uc3QgaGl0cyA9IGxpdmUoZ3JhcGgpXG4gICAgICAuZmlsdGVyKChuKSA9PiB7XG4gICAgICAgIGNvbnN0IHIgPSBub2RlQm94KG4pO1xuICAgICAgICByZXR1cm4gci54IDwgeDEgJiYgci54ICsgci53ID4geDAgJiYgci55IDwgeTEgJiYgci55ICsgci5oID4geTA7XG4gICAgICB9KVxuICAgICAgLm1hcCgobikgPT4gbi5pZCk7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBcInNlbGVjdFwiLCBpZHM6IFsuLi5uZXcgU2V0KFsuLi5iYXNlLCAuLi5oaXRzXSldIH0pO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIG9uUG9pbnRlckRvd249eyhlKSA9PiB7XG4gICAgICAgIHNldE1lbnUobnVsbCk7XG4gICAgICAgIGlmICh3aXJlPy5hdCkgc2V0V2lyZShudWxsKTtcbiAgICAgICAgaWYgKGUuYnV0dG9uID09PSAyKVxuICAgICAgICAgIHJldHVybiBzZXRNZW51KHsgeDogZS5jbGllbnRYLCB5OiBlLmNsaWVudFksIHdpcmU6IG51bGwgfSk7XG4gICAgICAgIGlmIChlLmJ1dHRvbiA9PT0gMCAmJiBlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgZ2VzdHVyZS5jdXJyZW50ID0ge1xuICAgICAgICAgICAga2luZDogXCJib3hcIixcbiAgICAgICAgICAgIGZyb206IGNsaWVudChlKSxcbiAgICAgICAgICAgIGJhc2U6IGdyYXBoLnNlbGVjdGVkLFxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIHNldEJveCh7IGE6IGNsaWVudChlKSwgYjogY2xpZW50KGUpIH0pO1xuICAgICAgICB9XG4gICAgICAgIHBhbi5zdGFydChlKTtcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZSkgPT4ge1xuICAgICAgICBjb25zdCBnID0gZ2VzdHVyZS5jdXJyZW50O1xuICAgICAgICBpZiAoZz8ua2luZCA9PT0gXCJib3hcIikge1xuICAgICAgICAgIHNldEJveCh7IGE6IGcuZnJvbSwgYjogY2xpZW50KGUpIH0pO1xuICAgICAgICAgIHNlbGVjdEJveChnLmZyb20sIGNsaWVudChlKSwgZy5iYXNlKTtcbiAgICAgICAgfSBlbHNlIHBhbi5tb3ZlKGUpO1xuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoKSA9PiB7XG4gICAgICAgIGNvbnN0IGcgPSBnZXN0dXJlLmN1cnJlbnQ7XG4gICAgICAgIGdlc3R1cmUuY3VycmVudCA9IG51bGw7XG4gICAgICAgIHNldEJveChudWxsKTtcbiAgICAgICAgLy8gQSBjbGljayBvbiBiYXJlIGNhbnZhcyBsZXRzIGdvIG9mIHRoZSBzZWxlY3Rpb24uXG4gICAgICAgIGlmIChnPy5raW5kID09PSBcInBhblwiICYmICFnLm1vdmVkICYmIGcuYnV0dG9uID09PSAwKVxuICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJzZWxlY3RcIiwgaWRzOiBbXSB9KTtcbiAgICAgIH19XG4gICAgICBvbldoZWVsPXsoZSkgPT4ge1xuICAgICAgICB3aGVlbC5jdXJyZW50ICs9IGUuZGVsdGFNb2RlID09PSBcImxpbmVcIiA/IGUuZGVsdGFZIDogZS5kZWx0YVkgLyA1MDtcbiAgICAgICAgY29uc3Qgc3RlcHMgPSBNYXRoLnRydW5jKHdoZWVsLmN1cnJlbnQpO1xuICAgICAgICBpZiAoIXN0ZXBzKSByZXR1cm47XG4gICAgICAgIHdoZWVsLmN1cnJlbnQgLT0gc3RlcHM7XG4gICAgICAgIGNvbnN0IHpvb20gPSB6b29tQXQoem9vbUxldmVsKHZpZXcuem9vbSkgKyBzdGVwcyk7XG4gICAgICAgIGNvbnN0IHAgPSB0b1dvcmxkKGNsaWVudChlKSk7XG4gICAgICAgIHNldFZpZXcoe1xuICAgICAgICAgIHg6IGUuY2xpZW50WCAtIHAueCAqIHpvb20sXG4gICAgICAgICAgeTogZS5jbGllbnRZIC0gcC55ICogem9vbSxcbiAgICAgICAgICB6b29tLFxuICAgICAgICAgIGdsaWRlOiAxNzAsXG4gICAgICAgIH0pO1xuICAgICAgfX1cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgb3ZlcmZsb3dYOiBcImNsaXBcIixcbiAgICAgICAgb3ZlcmZsb3dZOiBcImNsaXBcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPFpvb21Db250ZXh0LlByb3ZpZGVyIHZhbHVlPXt2aWV3Lnpvb219PlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIG5hbWU9e0dSQVBIX1JPT1R9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7T2JqZWN0LnZhbHVlcyhncmFwaC5ub2RlcykubWFwKChuKSA9PiAoXG4gICAgICAgICAgICA8Tm9kZUNhcmRcbiAgICAgICAgICAgICAga2V5PXtuLmlkfVxuICAgICAgICAgICAgICBub2RlPXtufVxuICAgICAgICAgICAgICBzZWxlY3RlZD17Z3JhcGguc2VsZWN0ZWQuaW5jbHVkZXMobi5pZCl9XG4gICAgICAgICAgICAgIGxpZnRlZD17bGlmdGVkLmluY2x1ZGVzKG4uaWQpfVxuICAgICAgICAgICAgICBnbGlkaW5nPXtnbGlkaW5nfVxuICAgICAgICAgICAgICB3aXJlZD17d2lyZWQobi5pZCl9XG4gICAgICAgICAgICAgIHBsdWc9e3BsdWdzKG4uaWQpfVxuICAgICAgICAgICAgICBhcGk9e2FwaX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvWm9vbUNvbnRleHQuUHJvdmlkZXI+XG4gICAgICB7Ym94ICYmIChcbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiBNYXRoLm1pbihib3guYS54LCBib3guYi54KSxcbiAgICAgICAgICAgIHRvcDogTWF0aC5taW4oYm94LmEueSwgYm94LmIueSksXG4gICAgICAgICAgICB3aWR0aDogTWF0aC5hYnMoYm94LmIueCAtIGJveC5hLngpLFxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLmFicyhib3guYi55IC0gYm94LmEueSksXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDQsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogYWxwaGEoXCIjOGZiNGZmXCIsIDAuNyksXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGFscGhhKFwiIzhmYjRmZlwiLCAwLjA4KSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHttZW51ICYmIChcbiAgICAgICAgPEFkZE1lbnVcbiAgICAgICAgICB4PXttZW51Lnh9XG4gICAgICAgICAgeT17bWVudS55fVxuICAgICAgICAgIGFjY2VwdHM9e21lbnUud2lyZSA/IGFjY2VwdHMoZ3JhcGgsIG1lbnUud2lyZSkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgb25QaWNrPXtwaWNrfVxuICAgICAgICAgIG9uQ2xvc2U9e2Nsb3NlTWVudX1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogS2luZHMgd2l0aCBhIHNvY2tldCBhIHdpcmUgZnJvbSBgc2AgY291bGQgcGx1ZyBpbnRvLiAqL1xuZnVuY3Rpb24gYWNjZXB0cyhncmFwaDogR3JhcGgsIHM6IFNvY2tldFJlZikge1xuICBjb25zdCBzaWduYWwgPSBzaWduYWxPZihncmFwaCwgcyk7XG4gIHJldHVybiAoazogS2luZCkgPT5cbiAgICAocy5zaWRlID09PSBcIm9cIiA/IGtpbmQoaykuaW5wdXRzIDoga2luZChrKS5vdXRwdXRzKS5zb21lKFxuICAgICAgKHApID0+IHAuc2lnbmFsID09PSBzaWduYWwsXG4gICAgKTtcbn1cbiIsICJpbXBvcnQgeyB0eXBlIEtpbmQsIEtJTkRTIH0gZnJvbSBcIi4vY2F0YWxvZ1wiO1xuaW1wb3J0IHsgRU1QVFksIHR5cGUgR3JhcGgsIHR5cGUgR3JhcGhOb2RlLCB0eXBlIExpbmssIGFycmFuZ2UgfSBmcm9tIFwiLi9tb2RlbFwiO1xuXG4vKiogVGhlIHBhdGNoZXMgdGhlIHRvcCBiYXIgbG9hZHMsIGVhY2ggd2l0aCBpdHMgdGVtcG8uIFRoZXkgYXJlIGxhaWQgb3V0XG4gKiAgYXMgQXJyYW5nZSB3b3VsZCAoc28gTCBtb3ZlcyBub3RoaW5nKTsgbm9kZXMgcG9wIGluIGxlZnQgdG8gcmlnaHQsIGFuZFxuICogIHRoZSB3aXJlcyBhcmUgcGx1Z2dlZCBpbiBhIG1vbWVudCBsYXRlciAoYFdJUkVfREVMQVlgKSwgc28gdGhleSBncm93IG91dFxuICogIG9mIG5vZGVzIHRoYXQgYXJlIGFscmVhZHkgdGhlcmUuICovXG5cbnR5cGUgU3BlYyA9IFtpZDogc3RyaW5nLCBraW5kOiBLaW5kLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+XTtcblxuZXhwb3J0IHR5cGUgUHJlc2V0ID0ge1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBPbmUgbGluZSBmb3IgdGhlIG1lbnUuICovXG4gIGJsdXJiOiBzdHJpbmc7XG4gIGJwbTogbnVtYmVyO1xuICBncmFwaDogR3JhcGg7XG4gIGxpbmtzOiBMaW5rW107XG59O1xuXG4vKiogQSBzZXF1ZW5jZXIgc3RlcCdzIGhlaWdodCBmb3Igc2NhbGUgZGVncmVlIGBuYCAoMCB0aGUgcm9vdCwgNSBhbiBvY3RhdmVcbiAqICB1cCwgMTAgdHdvKTogdGhlIHNlcXVlbmNlciBzbmFwcyBoZWlnaHRzIHRvIG1pbm9yIHBlbnRhdG9uaWMuICovXG5jb25zdCBkZWcgPSAoLi4ubnM6IG51bWJlcltdKSA9PlxuICBPYmplY3QuZnJvbUVudHJpZXMobnMubWFwKChuLCBpKSA9PiBbYHAke2l9YCwgbiAvIDEwXSkpO1xuXG4vKiogQW4gb3NjaWxsYXRvcidzIGB0dW5lYCBmb3IgYHNlbWlzYCBmcm9tIEEyICgtMTIuLjEyKS4gKi9cbmNvbnN0IHR1bmUgPSAoc2VtaXM6IG51bWJlcikgPT4gKHNlbWlzICsgMTIpIC8gMjQ7XG5cbi8qKiBBIGJlYXQgbGFuZSBmcm9tIGEgYmFyIGRyYXduIGFzIGB4YCBhbmQgYC5gLCBzaXh0ZWVudGhzIGxlZnQgdG8gcmlnaHQuICovXG5jb25zdCBsYW5lID0gKGJhcjogc3RyaW5nKSA9PlxuICBbLi4uYmFyLnJlcGxhY2UoLyAvZywgXCJcIildLnJlZHVjZShcbiAgICAobSwgYywgaSkgPT4gKGMgPT09IFwieFwiID8gbSB8ICgxIDw8IGkpIDogbSksXG4gICAgMCxcbiAgKTtcblxuLyoqIGBcImEuMD5iLjFcImA6IG5vZGUgYGFgJ3Mgb3V0cHV0IDAgaW50byBub2RlIGBiYCdzIGlucHV0IDEuICovXG5mdW5jdGlvbiBwcmVzZXQoXG4gIG5hbWU6IHN0cmluZyxcbiAgYmx1cmI6IHN0cmluZyxcbiAgYnBtOiBudW1iZXIsXG4gIHNwZWNzOiBTcGVjW10sXG4gIHdpcmVzOiBzdHJpbmdbXSxcbik6IFByZXNldCB7XG4gIGNvbnN0IG5vZGVzOiBSZWNvcmQ8c3RyaW5nLCBHcmFwaE5vZGU+ID0ge307XG4gIHNwZWNzLmZvckVhY2goKFtpZCwga2luZCwgcGFyYW1zXSwgaSkgPT4ge1xuICAgIG5vZGVzW2lkXSA9IHtcbiAgICAgIGlkLFxuICAgICAga2luZCxcbiAgICAgIHg6IDAsXG4gICAgICAvLyBBcnJhbmdlIGtlZXBzIHRoZSBzb3VyY2VzIGluIHRoaXMgb3JkZXIuXG4gICAgICB5OiBpLFxuICAgICAgcGFyYW1zOiB7IC4uLktJTkRTW2tpbmRdLnBhcmFtcywgLi4ucGFyYW1zIH0sXG4gICAgICB6OiBpICsgMSxcbiAgICAgIGVudGVyOiAwLFxuICAgIH07XG4gIH0pO1xuICBjb25zdCBsaW5rcyA9IHdpcmVzLm1hcCgodywgaSkgPT4ge1xuICAgIGNvbnN0IFtmcm9tLCB0b10gPSB3LnNwbGl0KFwiPlwiKS5tYXAoKGVuZCkgPT4ge1xuICAgICAgY29uc3QgW25vZGUsIHBvcnRdID0gZW5kLnNwbGl0KFwiLlwiKTtcbiAgICAgIHJldHVybiB7IG5vZGUsIHBvcnQ6IE51bWJlcihwb3J0KSB9O1xuICAgIH0pO1xuICAgIHJldHVybiB7IGlkOiBgJHtuYW1lfS13JHtpfWAsIGZyb20sIHRvIH07XG4gIH0pO1xuICBjb25zdCBhdCA9IGFycmFuZ2UoeyAuLi5FTVBUWSwgbm9kZXMsIGxpbmtzIH0pO1xuICBjb25zdCB4cyA9IE9iamVjdC52YWx1ZXMoYXQpLm1hcCgocCkgPT4gcC54KTtcbiAgY29uc3QgW2xlZnQsIHJpZ2h0XSA9IFtNYXRoLm1pbiguLi54cyksIE1hdGgubWF4KC4uLnhzKV07XG4gIE9iamVjdC52YWx1ZXMobm9kZXMpLmZvckVhY2goKG4sIGkpID0+IHtcbiAgICBPYmplY3QuYXNzaWduKG4sIGF0W24uaWRdKTtcbiAgICBuLmVudGVyID1cbiAgICAgIDYwICsgKChuLnggLSBsZWZ0KSAvIE1hdGgubWF4KDEsIHJpZ2h0IC0gbGVmdCkpICogNDIwICsgKGkgJSAyKSAqIDQwO1xuICB9KTtcbiAgY29uc3QgZ3JhcGggPSB7XG4gICAgbm9kZXMsXG4gICAgbGlua3M6IFtdLFxuICAgIHNlbGVjdGVkOiBbXSxcbiAgICBzZXE6IDEsXG4gICAgdG9wOiBzcGVjcy5sZW5ndGggKyAxLFxuICB9O1xuICByZXR1cm4geyBuYW1lLCBibHVyYiwgYnBtLCBncmFwaCwgbGlua3MgfTtcbn1cblxuLyoqIEEgZnJlc2ggY29weSBvZiBgcGAgZm9yIGl0cyBgdGFnYC10aCBsb2FkOiBpZHMgbmV2ZXIgcmVwZWF0LCBzbyBjYXJkc1xuICogIHN0aWxsIHNocmlua2luZyBhd2F5IGZyb20gdGhlIGxhc3QgcGF0Y2ggbmV2ZXIgbWVldCB0aGVpciBzdWNjZXNzb3JzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbnRpYXRlKFxuICBwOiBQcmVzZXQsXG4gIHRhZzogbnVtYmVyLFxuKTogeyBncmFwaDogR3JhcGg7IGxpbmtzOiBMaW5rW10gfSB7XG4gIGNvbnN0IGlkID0gKG46IHN0cmluZykgPT4gYCR7bn1+JHt0YWd9YDtcbiAgY29uc3Qgbm9kZXM6IFJlY29yZDxzdHJpbmcsIEdyYXBoTm9kZT4gPSB7fTtcbiAgZm9yIChjb25zdCBuIG9mIE9iamVjdC52YWx1ZXMocC5ncmFwaC5ub2RlcykpXG4gICAgbm9kZXNbaWQobi5pZCldID0geyAuLi5uLCBpZDogaWQobi5pZCkgfTtcbiAgY29uc3QgbGlua3MgPSBwLmxpbmtzLm1hcCgobCkgPT4gKHtcbiAgICBpZDogaWQobC5pZCksXG4gICAgZnJvbTogeyAuLi5sLmZyb20sIG5vZGU6IGlkKGwuZnJvbS5ub2RlKSB9LFxuICAgIHRvOiB7IC4uLmwudG8sIG5vZGU6IGlkKGwudG8ubm9kZSkgfSxcbiAgfSkpO1xuICByZXR1cm4geyBncmFwaDogeyAuLi5wLmdyYXBoLCBub2RlcyB9LCBsaW5rcyB9O1xufVxuXG4vKiogV2hlbiB0aGUgd2lyZXMgZ28gaW4gYWZ0ZXIgYSBwcmVzZXQgbG9hZHMsIG1zLiAqL1xuZXhwb3J0IGNvbnN0IFdJUkVfREVMQVkgPSA1MjA7XG5cbmV4cG9ydCBjb25zdCBQUkVTRVRTOiBQcmVzZXRbXSA9IFtcbiAgcHJlc2V0KFxuICAgIFwiTmlnaHQgRHJpdmVcIixcbiAgICBcIkEgZGV0dW5lZCBzYXcgYXJwZWdnaW8sIGRvdHRlZCBlY2hvZXMsIGEga2lja1wiLFxuICAgIDExMixcbiAgICBbXG4gICAgICBbXCJjbGtcIiwgXCJjbG9ja1wiLCB7IGRpdjogMSB9XSxcbiAgICAgIFtcImxmb1wiLCBcImxmb1wiLCB7IHNoYXBlOiAwLCByYXRlOiAwLjIsIGRlcHRoOiAwLjMgfV0sXG4gICAgICBbXCJzZXFcIiwgXCJzZXF1ZW5jZXJcIiwgeyAuLi5kZWcoMCwgMywgNSwgNiwgNSwgMywgNywgNiksIG1hc2s6IDB4ZmYgfV0sXG4gICAgICBbXG4gICAgICAgIFwiYmVhdFwiLFxuICAgICAgICBcImJlYXRcIixcbiAgICAgICAge1xuICAgICAgICAgIGswOiBsYW5lKFwieC4uLiB4Li4uIHguLi4geC4uLlwiKSxcbiAgICAgICAgICBrMTogMCxcbiAgICAgICAgICBrMjogbGFuZShcIi4ueC4gLi54LiAuLnguIC4ueC5cIiksXG4gICAgICAgICAgazM6IDAsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBcIm9zY1wiLFxuICAgICAgICBcIm9zY2lsbGF0b3JcIixcbiAgICAgICAgeyB3YXZlOiAxLCB0dW5lOiB0dW5lKDApLCBsZXZlbDogMC44LCBkZXR1bmU6IDAuNSB9LFxuICAgICAgXSxcbiAgICAgIFtcImVudlwiLCBcImVudmVsb3BlXCIsIHsgYTogMCwgZDogMC4zLCBzOiAwLjEyLCByOiAwLjI1IH1dLFxuICAgICAgW1wia2lja1wiLCBcImRydW1cIiwgeyB2b2ljZTogMCwgdHVuZTogMC4zLCBkZWNheTogMC4zLCBsZXZlbDogMC45IH1dLFxuICAgICAgW1wiaGF0XCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAzLCB0dW5lOiAwLjU1LCBkZWNheTogMC4xNSwgbGV2ZWw6IDAuNiB9XSxcbiAgICAgIFtcImZsdFwiLCBcImZpbHRlclwiLCB7IG1vZGU6IDAsIGN1dG9mZjogMC4zNiwgcmVzOiAwLjQ1LCBtb2Q6IDAuNTUgfV0sXG4gICAgICBbXCJ2Y2FcIiwgXCJ2Y2FcIiwgeyBnYWluOiAxLCBjdXJ2ZTogMCB9XSxcbiAgICAgIFtcImRseVwiLCBcImRlbGF5XCIsIHsgdGltZTogMC40LCBmZWVkYmFjazogMC40LCBtaXg6IDAuMjgsIHN5bmM6IDEgfV0sXG4gICAgICBbXCJtaXhcIiwgXCJtaXhlclwiLCB7IGwwOiAwLjg1LCBsMTogMC43NSwgbDI6IDAuNSwgbDM6IDAgfV0sXG4gICAgICBbXCJyZXZcIiwgXCJyZXZlcmJcIiwgeyBzaXplOiAwLjU1LCBkYW1wOiAwLjQ1LCBtaXg6IDAuMjUgfV0sXG4gICAgICBbXCJvdXRcIiwgXCJvdXRwdXRcIiwgeyB2b2x1bWU6IDAuOCB9XSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFwiY2xrLjA+c2VxLjBcIixcbiAgICAgIFwiY2xrLjA+YmVhdC4wXCIsXG4gICAgICBcInNlcS4wPm9zYy4wXCIsXG4gICAgICBcInNlcS4xPmVudi4wXCIsXG4gICAgICBcIm9zYy4wPmZsdC4wXCIsXG4gICAgICBcImVudi4wPmZsdC4xXCIsXG4gICAgICBcImxmby4wPmZsdC4yXCIsXG4gICAgICBcImZsdC4wPnZjYS4wXCIsXG4gICAgICBcImVudi4wPnZjYS4xXCIsXG4gICAgICBcInZjYS4wPmRseS4wXCIsXG4gICAgICBcImJlYXQuMD5raWNrLjBcIixcbiAgICAgIFwiYmVhdC4yPmhhdC4wXCIsXG4gICAgICBcImRseS4wPm1peC4wXCIsXG4gICAgICBcImtpY2suMD5taXguMVwiLFxuICAgICAgXCJoYXQuMD5taXguMlwiLFxuICAgICAgXCJtaXguMD5yZXYuMFwiLFxuICAgICAgXCJyZXYuMD5vdXQuMFwiLFxuICAgICAgXCJyZXYuMT5vdXQuMVwiLFxuICAgIF0sXG4gICksXG4gIHByZXNldChcbiAgICBcIkFjaWQgTGluZVwiLFxuICAgIFwiQSBzcXVlbGNoaW5nLCBzbGlkaW5nIGJhc3NsaW5lIG92ZXIgYSBraWNrIGFuZCBjbGFwc1wiLFxuICAgIDEyNixcbiAgICBbXG4gICAgICBbXCJjbGtcIiwgXCJjbG9ja1wiLCB7IGRpdjogMiwgc3dpbmc6IDAuMTUgfV0sXG4gICAgICBbXCJsZm9cIiwgXCJsZm9cIiwgeyBzaGFwZTogMCwgcmF0ZTogMC4yMiwgZGVwdGg6IDAuMzUgfV0sXG4gICAgICBbXCJzZXFcIiwgXCJzZXF1ZW5jZXJcIiwgeyAuLi5kZWcoMCwgNSwgMCwgMywgMCwgNiwgNSwgNCksIG1hc2s6IDB4ZmYgfV0sXG4gICAgICBbXG4gICAgICAgIFwiYmVhdFwiLFxuICAgICAgICBcImJlYXRcIixcbiAgICAgICAge1xuICAgICAgICAgIGswOiBsYW5lKFwieC4uLiB4Li4uIHguLi4geC4uLlwiKSxcbiAgICAgICAgICBrMTogbGFuZShcIi4uLi4geC4uLiAuLi4uIHguLi5cIiksXG4gICAgICAgICAgazI6IGxhbmUoXCIueHh4IC54eHggLnh4eCAueHh4XCIpLFxuICAgICAgICAgIGszOiBsYW5lKFwieC54eCB4LnguIHh4LnggeC54eFwiKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBbXCJnbGlkZVwiLCBcImdsaWRlXCIsIHsgdGltZTogMC4yMiB9XSxcbiAgICAgIFtcImtpY2tcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDAsIHR1bmU6IDAuMzUsIGRlY2F5OiAwLjM1LCBsZXZlbDogMC45IH1dLFxuICAgICAgW1wiY2xhcFwiLCBcImRydW1cIiwgeyB2b2ljZTogMiwgdHVuZTogMC40LCBkZWNheTogMC4zLCBsZXZlbDogMC43IH1dLFxuICAgICAgW1wiaGF0XCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAzLCB0dW5lOiAwLjYsIGRlY2F5OiAwLjA4LCBsZXZlbDogMC40IH1dLFxuICAgICAgW1wiZW52XCIsIFwiZW52ZWxvcGVcIiwgeyBhOiAwLCBkOiAwLjMyLCBzOiAwLCByOiAwLjEyIH1dLFxuICAgICAgW1xuICAgICAgICBcIm9zY1wiLFxuICAgICAgICBcIm9zY2lsbGF0b3JcIixcbiAgICAgICAgeyB3YXZlOiAxLCB0dW5lOiB0dW5lKC0xMiksIGxldmVsOiAwLjksIGRldHVuZTogMCB9LFxuICAgICAgXSxcbiAgICAgIFtcImZsdFwiLCBcImZpbHRlclwiLCB7IG1vZGU6IDAsIGN1dG9mZjogMC4yNiwgcmVzOiAwLjgyLCBtb2Q6IDAuNjIgfV0sXG4gICAgICBbXCJ2Y2FcIiwgXCJ2Y2FcIiwgeyBnYWluOiAxLCBjdXJ2ZTogMCB9XSxcbiAgICAgIFtcIm1peFwiLCBcIm1peGVyXCIsIHsgbDA6IDAuOCwgbDE6IDAuOCwgbDI6IDAuNSwgbDM6IDAuMyB9XSxcbiAgICAgIFtcInJldlwiLCBcInJldmVyYlwiLCB7IHNpemU6IDAuMzUsIGRhbXA6IDAuNSwgbWl4OiAwLjE1IH1dLFxuICAgICAgW1wib3V0XCIsIFwib3V0cHV0XCIsIHsgdm9sdW1lOiAwLjcgfV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBcImNsay4wPnNlcS4wXCIsXG4gICAgICBcImNsay4wPmJlYXQuMFwiLFxuICAgICAgXCJzZXEuMD5nbGlkZS4wXCIsXG4gICAgICBcImdsaWRlLjA+b3NjLjBcIixcbiAgICAgIFwiYmVhdC4wPmtpY2suMFwiLFxuICAgICAgXCJiZWF0LjE+Y2xhcC4wXCIsXG4gICAgICBcImJlYXQuMj5oYXQuMFwiLFxuICAgICAgXCJiZWF0LjM+ZW52LjBcIixcbiAgICAgIFwib3NjLjA+Zmx0LjBcIixcbiAgICAgIFwiZW52LjA+Zmx0LjFcIixcbiAgICAgIFwibGZvLjA+Zmx0LjJcIixcbiAgICAgIFwiZmx0LjA+dmNhLjBcIixcbiAgICAgIFwiZW52LjA+dmNhLjFcIixcbiAgICAgIFwidmNhLjA+bWl4LjBcIixcbiAgICAgIFwia2ljay4wPm1peC4xXCIsXG4gICAgICBcImNsYXAuMD5taXguMlwiLFxuICAgICAgXCJoYXQuMD5taXguM1wiLFxuICAgICAgXCJtaXguMD5yZXYuMFwiLFxuICAgICAgXCJyZXYuMD5vdXQuMFwiLFxuICAgICAgXCJyZXYuMT5vdXQuMVwiLFxuICAgIF0sXG4gICksXG4gIHByZXNldChcbiAgICBcIkJvb20gQmFwXCIsXG4gICAgXCJBIHN3dW5nIGJlYXQgYW5kIGEgcm91bmQgYmFzcywgYSBzbWFsbCByb29tXCIsXG4gICAgODgsXG4gICAgW1xuICAgICAgW1wiY2xrXCIsIFwiY2xvY2tcIiwgeyBkaXY6IDIsIHN3aW5nOiAwLjU1IH1dLFxuICAgICAgW1wic2VxXCIsIFwic2VxdWVuY2VyXCIsIHsgLi4uZGVnKDAsIDAsIDMsIDMsIDIsIDIsIDQsIDMpLCBtYXNrOiAweGZmIH1dLFxuICAgICAgW1xuICAgICAgICBcImJlYXRcIixcbiAgICAgICAgXCJiZWF0XCIsXG4gICAgICAgIHtcbiAgICAgICAgICBrMDogbGFuZShcInguLi4gLi4ueCAuLnguIC4uLi5cIiksXG4gICAgICAgICAgazE6IGxhbmUoXCIuLi4uIHguLi4gLi4uLiB4Li4uXCIpLFxuICAgICAgICAgIGsyOiBsYW5lKFwieC54LiB4LnguIHgueC4geC54LlwiKSxcbiAgICAgICAgICBrMzogbGFuZShcInguLnggLi4ueCAuLnguIC4ueC5cIiksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBcIm9zY1wiLFxuICAgICAgICBcIm9zY2lsbGF0b3JcIixcbiAgICAgICAgeyB3YXZlOiAxLCB0dW5lOiB0dW5lKC0xMiksIGxldmVsOiAxLCBkZXR1bmU6IDAuMSB9LFxuICAgICAgXSxcbiAgICAgIFtcImVudlwiLCBcImVudmVsb3BlXCIsIHsgYTogMC4wNSwgZDogMC40LCBzOiAwLjMsIHI6IDAuMiB9XSxcbiAgICAgIFtcImtpY2tcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDAsIHR1bmU6IDAuMjgsIGRlY2F5OiAwLjQ1LCBsZXZlbDogMC45NSB9XSxcbiAgICAgIFtcInNuYXJlXCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAxLCB0dW5lOiAwLjQ1LCBkZWNheTogMC4zNSwgbGV2ZWw6IDAuNzUgfV0sXG4gICAgICBbXCJoYXRcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDMsIHR1bmU6IDAuNDUsIGRlY2F5OiAwLjEsIGxldmVsOiAwLjQ1IH1dLFxuICAgICAgW1wiZmx0XCIsIFwiZmlsdGVyXCIsIHsgbW9kZTogMCwgY3V0b2ZmOiAwLjMsIHJlczogMC4yNSwgbW9kOiAwLjM1IH1dLFxuICAgICAgW1widmNhXCIsIFwidmNhXCIsIHsgZ2FpbjogMSwgY3VydmU6IDAgfV0sXG4gICAgICBbXCJtaXhcIiwgXCJtaXhlclwiLCB7IGwwOiAwLjg1LCBsMTogMC42NSwgbDI6IDAuMzUsIGwzOiAwLjcgfV0sXG4gICAgICBbXCJyZXZcIiwgXCJyZXZlcmJcIiwgeyBzaXplOiAwLjMsIGRhbXA6IDAuNiwgbWl4OiAwLjE4IH1dLFxuICAgICAgW1wib3V0XCIsIFwib3V0cHV0XCIsIHsgdm9sdW1lOiAwLjggfV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBcImNsay4wPnNlcS4wXCIsXG4gICAgICBcImNsay4wPmJlYXQuMFwiLFxuICAgICAgXCJzZXEuMD5vc2MuMFwiLFxuICAgICAgXCJiZWF0LjM+ZW52LjBcIixcbiAgICAgIFwiYmVhdC4wPmtpY2suMFwiLFxuICAgICAgXCJiZWF0LjE+c25hcmUuMFwiLFxuICAgICAgXCJiZWF0LjI+aGF0LjBcIixcbiAgICAgIFwib3NjLjA+Zmx0LjBcIixcbiAgICAgIFwiZW52LjA+Zmx0LjFcIixcbiAgICAgIFwiZmx0LjA+dmNhLjBcIixcbiAgICAgIFwiZW52LjA+dmNhLjFcIixcbiAgICAgIFwia2ljay4wPm1peC4wXCIsXG4gICAgICBcInNuYXJlLjA+bWl4LjFcIixcbiAgICAgIFwiaGF0LjA+bWl4LjJcIixcbiAgICAgIFwidmNhLjA+bWl4LjNcIixcbiAgICAgIFwibWl4LjA+cmV2LjBcIixcbiAgICAgIFwicmV2LjA+b3V0LjBcIixcbiAgICAgIFwicmV2LjE+b3V0LjFcIixcbiAgICBdLFxuICApLFxuICBwcmVzZXQoXG4gICAgXCJEdWIgQ2hvcmRzXCIsXG4gICAgXCJNaW5vciBzZXZlbnRocyBpbiBhIGxvbmcgZWNobywgYSBraWNrLCBhIGxpdHRsZSBoaXNzXCIsXG4gICAgMTE4LFxuICAgIFtcbiAgICAgIFtcImNsa1wiLCBcImNsb2NrXCIsIHsgZGl2OiAxLCBzd2luZzogMC4yIH1dLFxuICAgICAgW1wic2VxXCIsIFwic2VxdWVuY2VyXCIsIHsgLi4uZGVnKDUsIDUsIDUsIDUsIDcsIDcsIDcsIDcpLCBtYXNrOiAweGZmIH1dLFxuICAgICAgW1wibGZvXCIsIFwibGZvXCIsIHsgc2hhcGU6IDAsIHJhdGU6IDAuMiwgZGVwdGg6IDAuNDUgfV0sXG4gICAgICBbXG4gICAgICAgIFwiYmVhdFwiLFxuICAgICAgICBcImJlYXRcIixcbiAgICAgICAge1xuICAgICAgICAgIGswOiBsYW5lKFwieC4uLiB4Li4uIHguLi4geC4uLlwiKSxcbiAgICAgICAgICBrMTogMCxcbiAgICAgICAgICBrMjogbGFuZShcIi4ueC4gLi54LiAuLnguIC4ueC5cIiksXG4gICAgICAgICAgazM6IGxhbmUoXCIuLnguIC4uLi4gLi54LiAuLi4uXCIpLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJyb290XCIsXG4gICAgICAgIFwib3NjaWxsYXRvclwiLFxuICAgICAgICB7IHdhdmU6IDEsIHR1bmU6IHR1bmUoLTEyKSwgbGV2ZWw6IDEsIGRldHVuZTogMC4xNSB9LFxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJzZXZcIixcbiAgICAgICAgXCJvc2NpbGxhdG9yXCIsXG4gICAgICAgIHsgd2F2ZTogMSwgdHVuZTogdHVuZSgtMiksIGxldmVsOiAwLjg1LCBkZXR1bmU6IDAuMTUgfSxcbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFwidGhpcmRcIixcbiAgICAgICAgXCJvc2NpbGxhdG9yXCIsXG4gICAgICAgIHsgd2F2ZTogMSwgdHVuZTogdHVuZSgzKSwgbGV2ZWw6IDAuODUsIGRldHVuZTogMC4xNSB9LFxuICAgICAgXSxcbiAgICAgIFtcImVudlwiLCBcImVudmVsb3BlXCIsIHsgYTogMC4wMiwgZDogMC40LCBzOiAwLCByOiAwLjMgfV0sXG4gICAgICBbXCJraWNrXCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAwLCB0dW5lOiAwLjI1LCBkZWNheTogMC40NSwgbGV2ZWw6IDAuNzUgfV0sXG4gICAgICBbXCJoYXRcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDMsIHR1bmU6IDAuNCwgZGVjYXk6IDAuMzUsIGxldmVsOiAwLjQgfV0sXG4gICAgICBbXCJoaXNzXCIsIFwibm9pc2VcIiwgeyBjb2xvcjogMSwgbGV2ZWw6IDAuMyB9XSxcbiAgICAgIFtcImtleXNcIiwgXCJtaXhlclwiLCB7IGwwOiAxLCBsMTogMC45LCBsMjogMC45LCBsMzogMCB9XSxcbiAgICAgIFtcImZsdFwiLCBcImZpbHRlclwiLCB7IG1vZGU6IDAsIGN1dG9mZjogMC40NSwgcmVzOiAwLjM1LCBtb2Q6IDAuMzUgfV0sXG4gICAgICBbXCJ2Y2FcIiwgXCJ2Y2FcIiwgeyBnYWluOiAxLCBjdXJ2ZTogMCB9XSxcbiAgICAgIFtcImRseVwiLCBcImRlbGF5XCIsIHsgdGltZTogMC40LCBmZWVkYmFjazogMC42MiwgbWl4OiAwLjQ1LCBzeW5jOiAxIH1dLFxuICAgICAgW1wibWl4XCIsIFwibWl4ZXJcIiwgeyBsMDogMSwgbDE6IDAuNywgbDI6IDAuNSwgbDM6IDAuMDUgfV0sXG4gICAgICBbXCJyZXZcIiwgXCJyZXZlcmJcIiwgeyBzaXplOiAwLjg1LCBkYW1wOiAwLjU1LCBtaXg6IDAuMzUgfV0sXG4gICAgICBbXCJvdXRcIiwgXCJvdXRwdXRcIiwgeyB2b2x1bWU6IDAuOCB9XSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFwiY2xrLjA+c2VxLjBcIixcbiAgICAgIFwiY2xrLjA+YmVhdC4wXCIsXG4gICAgICBcInNlcS4wPnJvb3QuMFwiLFxuICAgICAgXCJzZXEuMD5zZXYuMFwiLFxuICAgICAgXCJzZXEuMD50aGlyZC4wXCIsXG4gICAgICBcInJvb3QuMD5rZXlzLjBcIixcbiAgICAgIFwic2V2LjA+a2V5cy4xXCIsXG4gICAgICBcInRoaXJkLjA+a2V5cy4yXCIsXG4gICAgICBcImtleXMuMD5mbHQuMFwiLFxuICAgICAgXCJiZWF0LjM+ZW52LjBcIixcbiAgICAgIFwiZW52LjA+Zmx0LjFcIixcbiAgICAgIFwibGZvLjA+Zmx0LjJcIixcbiAgICAgIFwiZmx0LjA+dmNhLjBcIixcbiAgICAgIFwiZW52LjA+dmNhLjFcIixcbiAgICAgIFwidmNhLjA+ZGx5LjBcIixcbiAgICAgIFwiYmVhdC4wPmtpY2suMFwiLFxuICAgICAgXCJiZWF0LjI+aGF0LjBcIixcbiAgICAgIFwiZGx5LjA+bWl4LjBcIixcbiAgICAgIFwia2ljay4wPm1peC4xXCIsXG4gICAgICBcImhhdC4wPm1peC4yXCIsXG4gICAgICBcImhpc3MuMD5taXguM1wiLFxuICAgICAgXCJtaXguMD5yZXYuMFwiLFxuICAgICAgXCJyZXYuMD5vdXQuMFwiLFxuICAgICAgXCJyZXYuMT5vdXQuMVwiLFxuICAgIF0sXG4gICksXG4gIHByZXNldChcbiAgICBcIkp1bmdsZVwiLFxuICAgIFwiQSBjaG9wcGVkIGJyZWFrIGF0IDE3MiBhbmQgYSByb2xsaW5nIHJlZXNlIGJhc3NcIixcbiAgICAxNzIsXG4gICAgW1xuICAgICAgW1wiY2xrXCIsIFwiY2xvY2tcIiwgeyBkaXY6IDIgfV0sXG4gICAgICBbXCJsZm9cIiwgXCJsZm9cIiwgeyBzaGFwZTogMCwgcmF0ZTogMC4zNSwgZGVwdGg6IDAuNSB9XSxcbiAgICAgIFtcInNlcVwiLCBcInNlcXVlbmNlclwiLCB7IC4uLmRlZygwLCAwLCAwLCAwLCAwLCAwLCA0LCAzKSwgbWFzazogMHhmZiB9XSxcbiAgICAgIFtcbiAgICAgICAgXCJiZWF0XCIsXG4gICAgICAgIFwiYmVhdFwiLFxuICAgICAgICB7XG4gICAgICAgICAgazA6IGxhbmUoXCJ4LnguIC4uLi4gLi54LiAuLi4uXCIpLFxuICAgICAgICAgIGsxOiBsYW5lKFwiLi4uLiB4Li4uIC4uLi4geC4uLlwiKSxcbiAgICAgICAgICBrMjogbGFuZShcIi4uLi4gLi4ueCAueC4uIC4uLnhcIiksXG4gICAgICAgICAgazM6IGxhbmUoXCJ4Li4uIC4uLi4gLi54LiAuLi4uXCIpLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJvc2NcIixcbiAgICAgICAgXCJvc2NpbGxhdG9yXCIsXG4gICAgICAgIHsgd2F2ZTogMSwgdHVuZTogdHVuZSgtMTIpLCBsZXZlbDogMC45LCBkZXR1bmU6IDAuOSB9LFxuICAgICAgXSxcbiAgICAgIFtcImVudlwiLCBcImVudmVsb3BlXCIsIHsgYTogMCwgZDogMC41LCBzOiAwLjcsIHI6IDAuNTUgfV0sXG4gICAgICBbXCJraWNrXCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAwLCB0dW5lOiAwLjM1LCBkZWNheTogMC4zLCBsZXZlbDogMC45IH1dLFxuICAgICAgW1wic25hcmVcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDEsIHR1bmU6IDAuNTUsIGRlY2F5OiAwLjM1LCBsZXZlbDogMC44IH1dLFxuICAgICAgW1wiZ2hvc3RcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDEsIHR1bmU6IDAuNiwgZGVjYXk6IDAuMTUsIGxldmVsOiAwLjM1IH1dLFxuICAgICAgW1wiaGF0XCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAzLCB0dW5lOiAwLjcsIGRlY2F5OiAwLjEyLCBsZXZlbDogMC40IH1dLFxuICAgICAgW1wiZmx0XCIsIFwiZmlsdGVyXCIsIHsgbW9kZTogMCwgY3V0b2ZmOiAwLjMzLCByZXM6IDAuMywgbW9kOiAwLjMgfV0sXG4gICAgICBbXCJ2Y2FcIiwgXCJ2Y2FcIiwgeyBnYWluOiAxLCBjdXJ2ZTogMCB9XSxcbiAgICAgIFtcImRydW1zXCIsIFwibWl4ZXJcIiwgeyBsMDogMC44LCBsMTogMC44LCBsMjogMC42LCBsMzogMC41IH1dLFxuICAgICAgW1wibWl4XCIsIFwibWl4ZXJcIiwgeyBsMDogMSwgbDE6IDAuNzIsIGwyOiAwLCBsMzogMCB9XSxcbiAgICAgIFtcInJldlwiLCBcInJldmVyYlwiLCB7IHNpemU6IDAuNCwgZGFtcDogMC41LCBtaXg6IDAuMTUgfV0sXG4gICAgICBbXCJvdXRcIiwgXCJvdXRwdXRcIiwgeyB2b2x1bWU6IDAuODggfV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBcImNsay4wPnNlcS4wXCIsXG4gICAgICBcImNsay4wPmJlYXQuMFwiLFxuICAgICAgXCJzZXEuMD5vc2MuMFwiLFxuICAgICAgXCJiZWF0LjM+ZW52LjBcIixcbiAgICAgIFwib3NjLjA+Zmx0LjBcIixcbiAgICAgIFwiZW52LjA+Zmx0LjFcIixcbiAgICAgIFwibGZvLjA+Zmx0LjJcIixcbiAgICAgIFwiZmx0LjA+dmNhLjBcIixcbiAgICAgIFwiZW52LjA+dmNhLjFcIixcbiAgICAgIFwiYmVhdC4wPmtpY2suMFwiLFxuICAgICAgXCJiZWF0LjE+c25hcmUuMFwiLFxuICAgICAgXCJiZWF0LjI+Z2hvc3QuMFwiLFxuICAgICAgXCJzZXEuMT5oYXQuMFwiLFxuICAgICAgXCJraWNrLjA+ZHJ1bXMuMFwiLFxuICAgICAgXCJzbmFyZS4wPmRydW1zLjFcIixcbiAgICAgIFwiZ2hvc3QuMD5kcnVtcy4yXCIsXG4gICAgICBcImhhdC4wPmRydW1zLjNcIixcbiAgICAgIFwiZHJ1bXMuMD5taXguMFwiLFxuICAgICAgXCJ2Y2EuMD5taXguMVwiLFxuICAgICAgXCJtaXguMD5yZXYuMFwiLFxuICAgICAgXCJyZXYuMD5vdXQuMFwiLFxuICAgICAgXCJyZXYuMT5vdXQuMVwiLFxuICAgIF0sXG4gICksXG4gIHByZXNldChcbiAgICBcIkhhbGYgVGltZVwiLFxuICAgIFwiU2xpZGluZyA4MDhzLCB3YW5kZXJpbmcgaGF0cywgYSBjbGFwIG9uIHRocmVlLCBhIGRhcmsgYmVsbFwiLFxuICAgIDE0MCxcbiAgICBbXG4gICAgICBbXCJjbGtcIiwgXCJjbG9ja1wiLCB7IGRpdjogMiB9XSxcbiAgICAgIFtcInNlcVwiLCBcInNlcXVlbmNlclwiLCB7IC4uLmRlZygwLCAwLCAwLCAwLCAwLCAwLCAyLCAzKSwgbWFzazogMHhmZiB9XSxcbiAgICAgIFtcIm1lbG9keVwiLCBcInNlcXVlbmNlclwiLCB7IC4uLmRlZygxMCwgOSwgOSwgOCwgNywgOCwgOCwgNiksIG1hc2s6IDB4ZmYgfV0sXG4gICAgICBbXG4gICAgICAgIFwiYmVhdFwiLFxuICAgICAgICBcImJlYXRcIixcbiAgICAgICAge1xuICAgICAgICAgIGswOiBsYW5lKFwieC4uLiAuLi54IC4ueC4gLi4uLlwiKSxcbiAgICAgICAgICBrMTogbGFuZShcIi4uLi4gLi4uLiB4Li4uIC4uLi5cIiksXG4gICAgICAgICAgazI6IGxhbmUoXCJ4LnguIHgueHggeC54LiB4eHh4XCIpLFxuICAgICAgICAgIGszOiBsYW5lKFwieC4ueCAuLnguIHguLnggLi54LlwiKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBbXCJ3YW5kZXJcIiwgXCJsZm9cIiwgeyBzaGFwZTogMywgcmF0ZTogMC43NSwgZGVwdGg6IDAuMTIgfV0sXG4gICAgICBbXCJnbGlkZVwiLCBcImdsaWRlXCIsIHsgdGltZTogMC4zNSB9XSxcbiAgICAgIFtcInN1YlwiLCBcIm9zY2lsbGF0b3JcIiwgeyB3YXZlOiAyLCB0dW5lOiB0dW5lKC0xMiksIGxldmVsOiAxLCBkZXR1bmU6IDAgfV0sXG4gICAgICBbXCJzZW52XCIsIFwiZW52ZWxvcGVcIiwgeyBhOiAwLCBkOiAwLjgsIHM6IDAsIHI6IDAuNTUgfV0sXG4gICAgICBbXG4gICAgICAgIFwiYmVsbFwiLFxuICAgICAgICBcIm9zY2lsbGF0b3JcIixcbiAgICAgICAgeyB3YXZlOiAzLCB0dW5lOiB0dW5lKDEyKSwgbGV2ZWw6IDAuOCwgZGV0dW5lOiAwIH0sXG4gICAgICBdLFxuICAgICAgW1wiYmVudlwiLCBcImVudmVsb3BlXCIsIHsgYTogMCwgZDogMC40LCBzOiAwLCByOiAwLjQgfV0sXG4gICAgICBbXCJjbGFwXCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAyLCB0dW5lOiAwLjQ1LCBkZWNheTogMC40NSwgbGV2ZWw6IDAuOCB9XSxcbiAgICAgIFtcImhhdFwiLCBcImRydW1cIiwgeyB2b2ljZTogMywgdHVuZTogMC42NSwgZGVjYXk6IDAuMDYsIGxldmVsOiAwLjYgfV0sXG4gICAgICBbXCJmbHRcIiwgXCJmaWx0ZXJcIiwgeyBtb2RlOiAwLCBjdXRvZmY6IDAuMjgsIHJlczogMC4yLCBtb2Q6IDAuNCB9XSxcbiAgICAgIFtcInN2Y2FcIiwgXCJ2Y2FcIiwgeyBnYWluOiAxLCBjdXJ2ZTogMCB9XSxcbiAgICAgIFtcImJ2Y2FcIiwgXCJ2Y2FcIiwgeyBnYWluOiAxLCBjdXJ2ZTogMSB9XSxcbiAgICAgIFtcImRseVwiLCBcImRlbGF5XCIsIHsgdGltZTogMC44LCBmZWVkYmFjazogMC40LCBtaXg6IDAuMywgc3luYzogMSB9XSxcbiAgICAgIFtcIm1peFwiLCBcIm1peGVyXCIsIHsgbDA6IDAuOSwgbDE6IDAuNzUsIGwyOiAwLjU1LCBsMzogMC44NSB9XSxcbiAgICAgIFtcInJldlwiLCBcInJldmVyYlwiLCB7IHNpemU6IDAuNiwgZGFtcDogMC41LCBtaXg6IDAuMjUgfV0sXG4gICAgICBbXCJvdXRcIiwgXCJvdXRwdXRcIiwgeyB2b2x1bWU6IDAuNzUgfV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBcImNsay4wPnNlcS4wXCIsXG4gICAgICBcImNsay4wPm1lbG9keS4wXCIsXG4gICAgICBcImNsay4wPmJlYXQuMFwiLFxuICAgICAgXCJzZXEuMD5nbGlkZS4wXCIsXG4gICAgICBcImdsaWRlLjA+c3ViLjBcIixcbiAgICAgIFwiYmVhdC4wPnNlbnYuMFwiLFxuICAgICAgXCJzdWIuMD5mbHQuMFwiLFxuICAgICAgXCJzZW52LjA+Zmx0LjFcIixcbiAgICAgIFwiZmx0LjA+c3ZjYS4wXCIsXG4gICAgICBcInNlbnYuMD5zdmNhLjFcIixcbiAgICAgIFwibWVsb2R5LjA+YmVsbC4wXCIsXG4gICAgICBcImJlYXQuMz5iZW52LjBcIixcbiAgICAgIFwiYmVsbC4wPmJ2Y2EuMFwiLFxuICAgICAgXCJiZW52LjA+YnZjYS4xXCIsXG4gICAgICBcImJ2Y2EuMD5kbHkuMFwiLFxuICAgICAgXCJiZWF0LjE+Y2xhcC4wXCIsXG4gICAgICBcImJlYXQuMj5oYXQuMFwiLFxuICAgICAgXCJ3YW5kZXIuMD5oYXQuMVwiLFxuICAgICAgXCJzdmNhLjA+bWl4LjBcIixcbiAgICAgIFwiY2xhcC4wPm1peC4xXCIsXG4gICAgICBcImhhdC4wPm1peC4yXCIsXG4gICAgICBcImRseS4wPm1peC4zXCIsXG4gICAgICBcIm1peC4wPnJldi4wXCIsXG4gICAgICBcInJldi4wPm91dC4wXCIsXG4gICAgICBcInJldi4xPm91dC4xXCIsXG4gICAgXSxcbiAgKSxcbiAgcHJlc2V0KFxuICAgIFwiQXJjYWRlXCIsXG4gICAgXCJBbiA4LWJpdCBsb29wOiBhIHNxdWFyZSBsZWFkLCBhIHRyaWFuZ2xlIGJhc3NcIixcbiAgICAxNTAsXG4gICAgW1xuICAgICAgW1wiY2xrXCIsIFwiY2xvY2tcIiwgeyBkaXY6IDEgfV0sXG4gICAgICBbXCJ2aWJcIiwgXCJsZm9cIiwgeyBzaGFwZTogMCwgcmF0ZTogMC43OCwgZGVwdGg6IDAuMTIgfV0sXG4gICAgICBbXCJsZWFkXCIsIFwic2VxdWVuY2VyXCIsIHsgLi4uZGVnKDUsIDYsIDgsIDEwLCA5LCA4LCA3LCA4KSwgbWFzazogMHhmZiB9XSxcbiAgICAgIFtcImJhc3NcIiwgXCJzZXF1ZW5jZXJcIiwgeyAuLi5kZWcoMCwgNSwgMCwgNSwgMywgOCwgNCwgOSksIG1hc2s6IDB4ZmYgfV0sXG4gICAgICBbXG4gICAgICAgIFwiYmVhdFwiLFxuICAgICAgICBcImJlYXRcIixcbiAgICAgICAge1xuICAgICAgICAgIGswOiBsYW5lKFwieC4uLiAuLnguIHguLi4gLi4uLlwiKSxcbiAgICAgICAgICBrMTogbGFuZShcIi4uLi4geC4uLiAuLi4uIHguLi5cIiksXG4gICAgICAgICAgazI6IGxhbmUoXCJ4LnguIHgueC4geC54LiB4LnguXCIpLFxuICAgICAgICAgIGszOiAwLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIFtcInNxXCIsIFwib3NjaWxsYXRvclwiLCB7IHdhdmU6IDIsIHR1bmU6IHR1bmUoMTIpLCBsZXZlbDogMC45LCBkZXR1bmU6IDAgfV0sXG4gICAgICBbXCJlbnZcIiwgXCJlbnZlbG9wZVwiLCB7IGE6IDAsIGQ6IDAuMzUsIHM6IDAuNiwgcjogMC4xIH1dLFxuICAgICAgW1widHJpXCIsIFwib3NjaWxsYXRvclwiLCB7IHdhdmU6IDMsIHR1bmU6IHR1bmUoLTEyKSwgbGV2ZWw6IDEsIGRldHVuZTogMCB9XSxcbiAgICAgIFtcImtpY2tcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDAsIHR1bmU6IDAuNTUsIGRlY2F5OiAwLjIsIGxldmVsOiAwLjggfV0sXG4gICAgICBbXCJzbmFyZVwiLCBcImRydW1cIiwgeyB2b2ljZTogMSwgdHVuZTogMC43LCBkZWNheTogMC4zLCBsZXZlbDogMC45IH1dLFxuICAgICAgW1wiaGF0XCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAzLCB0dW5lOiAwLjc1LCBkZWNheTogMC4wOCwgbGV2ZWw6IDAuNiB9XSxcbiAgICAgIFtcInZjYVwiLCBcInZjYVwiLCB7IGdhaW46IDEsIGN1cnZlOiAwIH1dLFxuICAgICAgW1wiZGx5XCIsIFwiZGVsYXlcIiwgeyB0aW1lOiAwLjIsIGZlZWRiYWNrOiAwLjI1LCBtaXg6IDAuMjIsIHN5bmM6IDEgfV0sXG4gICAgICBbXCJkcnVtc1wiLCBcIm1peGVyXCIsIHsgbDA6IDAuOCwgbDE6IDEsIGwyOiAwLjcsIGwzOiAwIH1dLFxuICAgICAgW1wibWl4XCIsIFwibWl4ZXJcIiwgeyBsMDogMC43NSwgbDE6IDAuNDUsIGwyOiAwLjksIGwzOiAwIH1dLFxuICAgICAgW1wib3V0XCIsIFwib3V0cHV0XCIsIHsgdm9sdW1lOiAwLjggfV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBcImNsay4wPmxlYWQuMFwiLFxuICAgICAgXCJjbGsuMD5iYXNzLjBcIixcbiAgICAgIFwiY2xrLjA+YmVhdC4wXCIsXG4gICAgICBcImxlYWQuMD5zcS4wXCIsXG4gICAgICBcInZpYi4wPnNxLjFcIixcbiAgICAgIFwibGVhZC4xPmVudi4wXCIsXG4gICAgICBcInNxLjA+dmNhLjBcIixcbiAgICAgIFwiZW52LjA+dmNhLjFcIixcbiAgICAgIFwidmNhLjA+ZGx5LjBcIixcbiAgICAgIFwiYmFzcy4wPnRyaS4wXCIsXG4gICAgICBcImJlYXQuMD5raWNrLjBcIixcbiAgICAgIFwiYmVhdC4xPnNuYXJlLjBcIixcbiAgICAgIFwiYmVhdC4yPmhhdC4wXCIsXG4gICAgICBcImtpY2suMD5kcnVtcy4wXCIsXG4gICAgICBcInNuYXJlLjA+ZHJ1bXMuMVwiLFxuICAgICAgXCJoYXQuMD5kcnVtcy4yXCIsXG4gICAgICBcImRseS4wPm1peC4wXCIsXG4gICAgICBcInRyaS4wPm1peC4xXCIsXG4gICAgICBcImRydW1zLjA+bWl4LjJcIixcbiAgICAgIFwibWl4LjA+b3V0LjBcIixcbiAgICBdLFxuICApLFxuICBwcmVzZXQoXG4gICAgXCJFbGVjdHJvXCIsXG4gICAgXCJBIHR1bmVkIDgwOCBraWNrIHBsYXlpbmcgdGhlIGJhc3NsaW5lLCBjbGFwcywgcm9ib3Qgc3RhYnNcIixcbiAgICAxMjYsXG4gICAgW1xuICAgICAgW1wiY2xrXCIsIFwiY2xvY2tcIiwgeyBkaXY6IDIsIHN3aW5nOiAwLjEgfV0sXG4gICAgICBbXCJiYXNzXCIsIFwic2VxdWVuY2VyXCIsIHsgLi4uZGVnKDAsIDAsIDAsIDUsIDAsIDMsIDAsIDQpLCBtYXNrOiAweGZmIH1dLFxuICAgICAgW1wicmlmZlwiLCBcInNlcXVlbmNlclwiLCB7IC4uLmRlZyg1LCA4LCA1LCAxMCwgOSwgNSwgNywgNSksIG1hc2s6IDB4ZmYgfV0sXG4gICAgICBbXG4gICAgICAgIFwiYmVhdFwiLFxuICAgICAgICBcImJlYXRcIixcbiAgICAgICAge1xuICAgICAgICAgIGswOiBsYW5lKFwieC4uLiAuLnguIC4ueC4gLnguLlwiKSxcbiAgICAgICAgICBrMTogbGFuZShcIi4uLi4geC4uLiAuLi4uIHguLi5cIiksXG4gICAgICAgICAgazI6IGxhbmUoXCJ4LnguIHgueHggeC54LiB4Lnh4XCIpLFxuICAgICAgICAgIGszOiBsYW5lKFwiLi54LiAuLnguIC54Li4geC4uLlwiKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICAvLyBUVU5FIDAuMzY3NSBpcyA1NSBIejogdGhlIGJhc3NsaW5lJ3MgQS5cbiAgICAgIFtcImtpY2tcIiwgXCJkcnVtXCIsIHsgdm9pY2U6IDAsIHR1bmU6IDAuMzY3NSwgZGVjYXk6IDAuNywgbGV2ZWw6IDAuOTUgfV0sXG4gICAgICBbXCJjbGFwXCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAyLCB0dW5lOiAwLjUsIGRlY2F5OiAwLjQsIGxldmVsOiAwLjc1IH1dLFxuICAgICAgW1wiaGF0XCIsIFwiZHJ1bVwiLCB7IHZvaWNlOiAzLCB0dW5lOiAwLjYsIGRlY2F5OiAwLjA3LCBsZXZlbDogMC40NSB9XSxcbiAgICAgIFtcIm9zY1wiLCBcIm9zY2lsbGF0b3JcIiwgeyB3YXZlOiAxLCB0dW5lOiB0dW5lKDApLCBsZXZlbDogMSwgZGV0dW5lOiAwLjMgfV0sXG4gICAgICBbXCJlbnZcIiwgXCJlbnZlbG9wZVwiLCB7IGE6IDAsIGQ6IDAuMywgczogMCwgcjogMC4xNSB9XSxcbiAgICAgIFtcImZsdFwiLCBcImZpbHRlclwiLCB7IG1vZGU6IDAsIGN1dG9mZjogMC40OCwgcmVzOiAwLjYsIG1vZDogMC41IH1dLFxuICAgICAgW1widmNhXCIsIFwidmNhXCIsIHsgZ2FpbjogMSwgY3VydmU6IDAgfV0sXG4gICAgICBbXCJkbHlcIiwgXCJkZWxheVwiLCB7IHRpbWU6IDAuNCwgZmVlZGJhY2s6IDAuMzUsIG1peDogMC4yNSwgc3luYzogMSB9XSxcbiAgICAgIFtcIm1peFwiLCBcIm1peGVyXCIsIHsgbDA6IDAuNSwgbDE6IDAuNzUsIGwyOiAwLjU1LCBsMzogMSB9XSxcbiAgICAgIFtcInJldlwiLCBcInJldmVyYlwiLCB7IHNpemU6IDAuMzUsIGRhbXA6IDAuNSwgbWl4OiAwLjE1IH1dLFxuICAgICAgW1wib3V0XCIsIFwib3V0cHV0XCIsIHsgdm9sdW1lOiAwLjc1IH1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgXCJjbGsuMD5iYXNzLjBcIixcbiAgICAgIFwiY2xrLjA+cmlmZi4wXCIsXG4gICAgICBcImNsay4wPmJlYXQuMFwiLFxuICAgICAgXCJiZWF0LjA+a2ljay4wXCIsXG4gICAgICBcImJhc3MuMD5raWNrLjFcIixcbiAgICAgIFwiYmVhdC4xPmNsYXAuMFwiLFxuICAgICAgXCJiZWF0LjI+aGF0LjBcIixcbiAgICAgIFwicmlmZi4wPm9zYy4wXCIsXG4gICAgICBcImJlYXQuMz5lbnYuMFwiLFxuICAgICAgXCJvc2MuMD5mbHQuMFwiLFxuICAgICAgXCJlbnYuMD5mbHQuMVwiLFxuICAgICAgXCJmbHQuMD52Y2EuMFwiLFxuICAgICAgXCJlbnYuMD52Y2EuMVwiLFxuICAgICAgXCJ2Y2EuMD5kbHkuMFwiLFxuICAgICAgXCJraWNrLjA+bWl4LjBcIixcbiAgICAgIFwiY2xhcC4wPm1peC4xXCIsXG4gICAgICBcImhhdC4wPm1peC4yXCIsXG4gICAgICBcImRseS4wPm1peC4zXCIsXG4gICAgICBcIm1peC4wPnJldi4wXCIsXG4gICAgICBcInJldi4wPm91dC4wXCIsXG4gICAgICBcInJldi4xPm91dC4xXCIsXG4gICAgXSxcbiAgKSxcbiAgcHJlc2V0KFxuICAgIFwiTXVzaWMgQm94XCIsXG4gICAgXCJQbHVja2VkIHRyaWFuZ2xlcywgZWNob2VzIGFuZCBhIGxhcmdlIHBsYXRlXCIsXG4gICAgOTYsXG4gICAgW1xuICAgICAgW1wiY2xrXCIsIFwiY2xvY2tcIiwgeyBkaXY6IDEgfV0sXG4gICAgICBbXG4gICAgICAgIFwic2VxXCIsXG4gICAgICAgIFwic2VxdWVuY2VyXCIsXG4gICAgICAgIHsgLi4uZGVnKDUsIDcsIDksIDEwLCA5LCA3LCA4LCA2KSwgbWFzazogMGIxMDExMDExMSB9LFxuICAgICAgXSxcbiAgICAgIFtcImxmb1wiLCBcImxmb1wiLCB7IHNoYXBlOiAwLCByYXRlOiAwLjgsIGRlcHRoOiAwLjA2IH1dLFxuICAgICAgW1wib3NjXCIsIFwib3NjaWxsYXRvclwiLCB7IHdhdmU6IDMsIHR1bmU6IHR1bmUoMyksIGxldmVsOiAxLCBkZXR1bmU6IDAgfV0sXG4gICAgICBbXCJlbnZcIiwgXCJlbnZlbG9wZVwiLCB7IGE6IDAsIGQ6IDAuMzgsIHM6IDAsIHI6IDAuMzUgfV0sXG4gICAgICBbXCJ2Y2FcIiwgXCJ2Y2FcIiwgeyBnYWluOiAxLCBjdXJ2ZTogMSB9XSxcbiAgICAgIFtcImRseVwiLCBcImRlbGF5XCIsIHsgdGltZTogMC44LCBmZWVkYmFjazogMC40NSwgbWl4OiAwLjMyLCBzeW5jOiAxIH1dLFxuICAgICAgW1wicmV2XCIsIFwicmV2ZXJiXCIsIHsgc2l6ZTogMC44MiwgZGFtcDogMC4yNSwgbWl4OiAwLjQ1IH1dLFxuICAgICAgW1wib3V0XCIsIFwib3V0cHV0XCIsIHsgdm9sdW1lOiAxIH1dLFxuICAgIF0sXG4gICAgW1xuICAgICAgXCJjbGsuMD5zZXEuMFwiLFxuICAgICAgXCJzZXEuMD5vc2MuMFwiLFxuICAgICAgXCJsZm8uMD5vc2MuMVwiLFxuICAgICAgXCJzZXEuMT5lbnYuMFwiLFxuICAgICAgXCJvc2MuMD52Y2EuMFwiLFxuICAgICAgXCJlbnYuMD52Y2EuMVwiLFxuICAgICAgXCJ2Y2EuMD5kbHkuMFwiLFxuICAgICAgXCJkbHkuMD5yZXYuMFwiLFxuICAgICAgXCJyZXYuMD5vdXQuMFwiLFxuICAgICAgXCJyZXYuMT5vdXQuMVwiLFxuICAgIF0sXG4gICksXG4gIHByZXNldChcbiAgICBcIlRpZGVcIixcbiAgICBcIkEgZHJvbmUgaW4gZmlmdGhzLCBzd2VsbGluZyB1bmRlciBhIHNsb3cgc3dlZXBcIixcbiAgICA2NCxcbiAgICBbXG4gICAgICBbXCJsZm9cIiwgXCJsZm9cIiwgeyBzaGFwZTogMCwgcmF0ZTogMC4xLCBkZXB0aDogMC43NSB9XSxcbiAgICAgIFtcImRyaWZ0XCIsIFwibGZvXCIsIHsgc2hhcGU6IDEsIHJhdGU6IDAuMywgZGVwdGg6IDAuMTIgfV0sXG4gICAgICBbXG4gICAgICAgIFwib3NhXCIsXG4gICAgICAgIFwib3NjaWxsYXRvclwiLFxuICAgICAgICB7IHdhdmU6IDEsIHR1bmU6IHR1bmUoLTcpLCBsZXZlbDogMC44LCBkZXR1bmU6IDAuNSB9LFxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJvc2JcIixcbiAgICAgICAgXCJvc2NpbGxhdG9yXCIsXG4gICAgICAgIHsgd2F2ZTogMSwgdHVuZTogdHVuZSgwKSwgbGV2ZWw6IDAuNiwgZGV0dW5lOiAwLjQgfSxcbiAgICAgIF0sXG4gICAgICBbXCJuc2VcIiwgXCJub2lzZVwiLCB7IGNvbG9yOiAyLCBsZXZlbDogMC4zNSB9XSxcbiAgICAgIFtcIm1peFwiLCBcIm1peGVyXCIsIHsgbDA6IDAuNywgbDE6IDAuNTUsIGwyOiAwLjM1LCBsMzogMCB9XSxcbiAgICAgIFtcImZsdFwiLCBcImZpbHRlclwiLCB7IG1vZGU6IDAsIGN1dG9mZjogMC40LCByZXM6IDAuNDIsIG1vZDogMCB9XSxcbiAgICAgIFtcImRseVwiLCBcImRlbGF5XCIsIHsgdGltZTogMSwgZmVlZGJhY2s6IDAuNSwgbWl4OiAwLjMsIHN5bmM6IDEgfV0sXG4gICAgICBbXCJyZXZcIiwgXCJyZXZlcmJcIiwgeyBzaXplOiAwLjk1LCBkYW1wOiAwLjMsIG1peDogMC42IH1dLFxuICAgICAgW1wib3V0XCIsIFwib3V0cHV0XCIsIHsgdm9sdW1lOiAwLjcgfV0sXG4gICAgXSxcbiAgICBbXG4gICAgICBcImRyaWZ0LjA+b3NiLjFcIixcbiAgICAgIFwib3NhLjA+bWl4LjBcIixcbiAgICAgIFwib3NiLjA+bWl4LjFcIixcbiAgICAgIFwibnNlLjA+bWl4LjJcIixcbiAgICAgIFwibWl4LjA+Zmx0LjBcIixcbiAgICAgIFwibGZvLjA+Zmx0LjJcIixcbiAgICAgIFwiZmx0LjA+ZGx5LjBcIixcbiAgICAgIFwiZGx5LjA+cmV2LjBcIixcbiAgICAgIFwicmV2LjA+b3V0LjBcIixcbiAgICAgIFwicmV2LjE+b3V0LjFcIixcbiAgICBdLFxuICApLFxuICBwcmVzZXQoXCJFbXB0eVwiLCBcIlN0YXJ0IGZyb20gbm90aGluZ1wiLCAxMTIsIFtd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O1lBQ0N4STtZQUNBSztZQUNBZTtZQUNBcUgsVUFBVSxDQUFDakksR0FBR0MsR0FBR0UsVUFBQUE7QUFDZixvQkFBTSxFQUFFTixNQUFBQSxPQUFNZSxNQUFBQSxNQUFJLElBQUtFLE9BQU8rQjtBQUM5Qi9DLHNCQUFRO2dCQUNOLEdBQUdEO2dCQUNIRyxHQUFHWSxNQUFLd0MsUUFBUSxJQUFJcEQsSUFBSUgsTUFBS0s7Z0JBQzdCRCxHQUFHVyxNQUFLMEMsU0FBUyxJQUFJckQsSUFBSUosTUFBS0s7Z0JBQzlCQztjQUNGLENBQUE7WUFDRjs7VUFFRix5Q0FBQTRHLEtBQUNtQixPQUFBQSxDQUFBQSxDQUFBQTs7OztFQUlUOzs7QUR0UEFDLGdDQUFNLHlDQUFBQyxLQUFDQyxLQUFBQSxDQUFBQSxDQUFBQSxDQUFBQTsiLAogICJuYW1lcyI6IFsiaW1wb3J0X2JldnlfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgImVtaXQiLCAibmFtZSIsICJ2YWx1ZSIsICJyYXdFbWl0IiwgInJlcXVlc3QiLCAicmF3UmVxdWVzdCIsICJvbiIsICJjYiIsICJyYXdBZGRFdmVudExpc3RlbmVyIiwgInJhd1JlbW92ZUV2ZW50TGlzdGVuZXIiLCAicmVtb3ZlRXZlbnRMaXN0ZW5lciIsICJiZXZ5IiwgImFkZEV2ZW50TGlzdGVuZXIiLCAiZ2FtZXBhZCIsICJnZXRBbGwiLCAicnVtYmxlIiwgInN0b3BSdW1ibGUiLCAicGF0Y2giLCAic2V0IiwgInBvaW50ZXIiLCAiZ2V0IiwgInN5bnRoIiwgInZpZXciLCAid2luZG93IiwgInNpemUiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIkNBVEVHT1JJRVMiLCAidGltaW5nIiwgImxhYmVsIiwgImNvbG9yIiwgInNvdXJjZSIsICJzaGFwZXIiLCAiZWZmZWN0IiwgIm91dHB1dCIsICJwb3J0IiwgIm5hbWUiLCAic2lnbmFsIiwgIktJTkRTIiwgImNsb2NrIiwgInRpdGxlIiwgImNhdGVnb3J5IiwgImJsdXJiIiwgImljb24iLCAiaW5wdXRzIiwgIm91dHB1dHMiLCAid2lkdGgiLCAiYm9keSIsICJwYXJhbXMiLCAiZGl2IiwgInN3aW5nIiwgInNlcXVlbmNlciIsICJwMCIsICJwMSIsICJwMiIsICJwMyIsICJwNCIsICJwNSIsICJwNiIsICJwNyIsICJtYXNrIiwgImJlYXQiLCAiazAiLCAiazEiLCAiazIiLCAiazMiLCAib3NjaWxsYXRvciIsICJ3YXZlIiwgInR1bmUiLCAibGV2ZWwiLCAiZGV0dW5lIiwgIm5vaXNlIiwgImxmbyIsICJzaGFwZSIsICJyYXRlIiwgImRlcHRoIiwgImRydW0iLCAidm9pY2UiLCAiZGVjYXkiLCAiZW52ZWxvcGUiLCAiYSIsICJkIiwgInMiLCAiciIsICJmaWx0ZXIiLCAibW9kZSIsICJjdXRvZmYiLCAicmVzIiwgIm1vZCIsICJ2Y2EiLCAiZ2FpbiIsICJjdXJ2ZSIsICJnbGlkZSIsICJ0aW1lIiwgIm1peGVyIiwgImwwIiwgImwxIiwgImwyIiwgImwzIiwgImRlbGF5IiwgImZlZWRiYWNrIiwgIm1peCIsICJzeW5jIiwgInJldmVyYiIsICJzaXplIiwgImRhbXAiLCAidm9sdW1lIiwgImtpbmQiLCAiayIsICJIRUFERVIiLCAiUk9XIiwgIlJPV1NfUEFEIiwgIkJPRFlfUEFEIiwgImNhcmRIZWlnaHQiLCAicm93cyIsICJNYXRoIiwgIm1heCIsICJsZW5ndGgiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIlJFTSIsICJyIiwgInB4IiwgInRvRml4ZWQiLCAiQyIsICJ0ZXh0IiwgImRpbSIsICJmYWludCIsICJjYXJkIiwgImNhcmREZWVwIiwgImVkZ2UiLCAiZWRnZUhpIiwgImdsYXNzIiwgImdsYXNzRWRnZSIsICJTSUdOQUwiLCAiYXVkaW8iLCAiY3YiLCAiZ2F0ZSIsICJGT05UX01PTk8iLCAiYmFja2dyb3VuZENvbG9yIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJib3JkZXJSYWRpdXMiLCAiYmFja2Ryb3BGaWx0ZXIiLCAibmFtZSIsICJwYXJhbXMiLCAicmFkaXVzIiwgImFtb3VudCIsICJmb2N1c1BvbGljeSIsICJhbHBoYSIsICJoZXgiLCAiYSIsICJieXRlIiwgIk1hdGgiLCAicm91bmQiLCAibWF4IiwgIm1pbiIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJMaXZlQ29udGV4dCIsICJjcmVhdGVDb250ZXh0IiwgInVzZUxpdmUiLCAidXNlQ29udGV4dCIsICJab29tQ29udGV4dCIsICJTVEVQUyIsICJjbGFtcDAxIiwgInYiLCAiTWF0aCIsICJtaW4iLCAibWF4IiwgInN0ZXBMaWdodCIsICJzdGVwcyIsICJsZXZlbCIsICJkaW0iLCAicGVyIiwgImlucHV0IiwgIm91dHB1dCIsICJqIiwgIm9uIiwgImF0IiwgInB1c2giLCAiaW50ZXJwb2xhdGUiLCAicmFuZCIsICJzZWVkIiwgImkiLCAieCIsICJzaW4iLCAiZmxvb3IiLCAiYXJjIiwgImN4IiwgImN5IiwgInJhZCIsICJhMCIsICJhMSIsICJhIiwgInQiLCAiUEkiLCAidG9GaXhlZCIsICJjb3MiLCAibGFiZWwiLCAiZm9udFNpemUiLCAiciIsICJjb2xvciIsICJDIiwgImxldHRlclNwYWNpbmciLCAiS25vYiIsICJuYW1lIiwgInZhbHVlIiwgIm9uQ2hhbmdlIiwgInNpemUiLCAic2hvdyIsICJkcmFnIiwgInVzZVJlZiIsICJhbmdsZSIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAib25Qb2ludGVyRG93biIsICJlIiwgImN1cnJlbnQiLCAieSIsICJjbGllbnRZIiwgIm9uUG9pbnRlck1vdmUiLCAiZCIsICJzaGlmdEtleSIsICJvblBvaW50ZXJVcCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiY3Vyc29yIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBvc2l0aW9uVHlwZSIsICJfanN4IiwgInBhdGgiLCAic3Ryb2tlIiwgImVkZ2UiLCAic3Ryb2tlV2lkdGgiLCAiZmlsbCIsICJzdHJva2VMaW5lY2FwIiwgImxlZnQiLCAidG9wIiwgImJvcmRlclJhZGl1cyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiZWRnZUhpIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgInBvc2l0aW9uIiwgInN0b3BzIiwgImJveFNoYWRvdyIsICJ5T2Zmc2V0IiwgImJsdXJSYWRpdXMiLCAidHJhbnNmb3JtIiwgInJvdGF0ZSIsICJob3ZlclN0eWxlIiwgIm1hcmdpbiIsICJiYWNrZ3JvdW5kQ29sb3IiLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZPTlRfTU9OTyIsICJUYWJzIiwgIm9wdGlvbnMiLCAicGFkZGluZyIsICJjYXJkRGVlcCIsICJmbGV4R3JvdyIsICJib3R0b20iLCAibGVuZ3RoIiwgImFscGhhIiwgInRyYW5zbGF0ZVgiLCAidHJhbnNpdGlvbiIsICJzdGlmZm5lc3MiLCAiZGFtcGluZyIsICJtYXAiLCAibyIsICJvbkNsaWNrIiwgImZsZXhCYXNpcyIsICJqdXN0aWZ5Q29udGVudCIsICJmb250V2VpZ2h0IiwgImZhaW50IiwgIlNjb3BlIiwgIndhdmUiLCAiY3ljbGVzIiwgInBlcmlvZE1zIiwgInBsYXlpbmciLCAiem9vbSIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ1c2VFZmZlY3QiLCAiY2FuY2VsQW5pbWF0aW9uIiwgIndpdGhSZXBlYXQiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJwZXJpb2QiLCAiZHJhd24iLCAic2FtcGxlcyIsICJjZWlsIiwgIm1pZCIsICJvdmVyZmxvd1giLCAib3ZlcmZsb3dZIiwgInJpZ2h0IiwgImFuaW1hdGVkIiwgInN0cm9rZUxpbmVqb2luIiwgIk1ldGVyIiwgImdhaW4iLCAiY291bnQiLCAibGV2ZWxzIiwgIkFycmF5IiwgImZyb20iLCAiXyIsICJrIiwgImh1ZSIsICJvcGFjaXR5IiwgIkxlZCIsICJDb2wiLCAiY2hpbGRyZW4iLCAiZ2FwIiwgIl9qc3giLCAibm9kZSIsICJzdHlsZSIsICJmbGV4R3JvdyIsICJmbGV4RGlyZWN0aW9uIiwgImp1c3RpZnlDb250ZW50IiwgInIiLCAiUm93IiwgImFsaWduSXRlbXMiLCAicGN0IiwgInYiLCAiTWF0aCIsICJyb3VuZCIsICJMQU5FUyIsICJzaXh0ZWVudGgiLCAiaSIsICJqIiwgIkJlYXQiLCAibm9kZSIsICJzZXQiLCAiY29sb3IiLCAic3RlcHMiLCAiX2pzeHMiLCAiQ29sIiwgImdhcCIsICJtYXAiLCAibmFtZSIsICJsYW5lIiwgIm1hc2siLCAicGFyYW1zIiwgIl9qc3giLCAiTGFuZSIsICJvbiIsICJQYWQiLCAiZG93bmJlYXQiLCAib25DbGljayIsICJnbG93IiwgInN0ZXBMaWdodCIsICJzdHlsZSIsICJmbGV4R3JvdyIsICJmbGV4QmFzaXMiLCAiaGVpZ2h0IiwgInIiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJDIiwgImRpbSIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgImNoaWxkcmVuIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJ0ZXh0IiwgIndpZHRoIiwgImZvbnRTaXplIiwgImZvbnRXZWlnaHQiLCAiYmVhdCIsICJrIiwgImFscGhhIiwgImNhcmREZWVwIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJlZGdlIiwgImhvdmVyU3R5bGUiLCAiVk9JQ0VTIiwgIkRFQ0FZUyIsICJkIiwgIlBJVENIIiwgInYiLCAiTWF0aCIsICJyb3VuZCIsICJ0b0ZpeGVkIiwgIkRydW0iLCAidm9pY2UiLCAidHVuZSIsICJkZWNheSIsICJsZXZlbCIsICJIaXQiLCAiVGFicyIsICJvcHRpb25zIiwgInZhbHVlIiwgIm9uQ2hhbmdlIiwgIlJvdyIsICJLbm9iIiwgInNpemUiLCAic2hvdyIsICJwY3QiLCAiVyIsICJIIiwgIk4iLCAidGF1IiwgImVudiIsICJ0IiwgImV4cCIsICJzbGFwcyIsICJhIiwgInRhaWwiLCAibWF4IiwgImxpbmUiLCAibm9pc2UiLCAicmFuZCIsICJzaW4iLCAiUEkiLCAieSIsICJtaW4iLCAic3ZnIiwgInZpZXdCb3giLCAicGF0aCIsICJmaWxsIiwgInN0cm9rZSIsICJTSUdOQUwiLCAiYXVkaW8iLCAic3Ryb2tlV2lkdGgiLCAic3Ryb2tlTGluZWpvaW4iLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIk1peGVyIiwgIm5vZGUiLCAic2V0IiwgImNvbG9yIiwgIl9qc3giLCAiUm93IiwgImdhcCIsICJtYXAiLCAiaSIsICJfanN4cyIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiciIsICJGYWRlciIsICJ2YWx1ZSIsICJwYXJhbXMiLCAib25DaGFuZ2UiLCAidiIsICJNZXRlciIsICJzZWVkIiwgImdhaW4iLCAiU0lHTkFMIiwgImF1ZGlvIiwgImhlaWdodCIsICJ3aWR0aCIsICJ0ZXh0IiwgImZvbnRTaXplIiwgIkMiLCAiZGltIiwgImRyYWciLCAidXNlUmVmIiwgIm9uUG9pbnRlckRvd24iLCAiZSIsICJjdXJyZW50IiwgInkiLCAiY2xpZW50WSIsICJvblBvaW50ZXJNb3ZlIiwgImQiLCAiY2xhbXAwMSIsICJvblBvaW50ZXJVcCIsICJjdXJzb3IiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJjYXJkRGVlcCIsICJwb3NpdGlvblR5cGUiLCAiYm90dG9tIiwgIm1hcmdpbiIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiZWRnZUhpIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImhvdmVyU3R5bGUiLCAiTk9URVMiLCAiRGVsYXkiLCAic3RlcHMiLCAidGltZSIsICJmZWVkYmFjayIsICJtaXgiLCAic3luYyIsICJDb2wiLCAicGFkZGluZyIsICJsZWZ0IiwgInJpZ2h0IiwgImVkZ2UiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiXyIsICJrIiwgImZsZXhHcm93IiwgIk1hdGgiLCAibWF4IiwgIm9wYWNpdHkiLCAiYW5pbWF0ZWQiLCAic3RlcExpZ2h0IiwgImoiLCAiU1RFUFMiLCAiVGFicyIsICJvcHRpb25zIiwgIktub2IiLCAibmFtZSIsICJzaXplIiwgInNob3ciLCAicm91bmQiLCAicGN0IiwgIlRBSUwiLCAiUmV2ZXJiIiwgImRhbXAiLCAid2FzaCIsICJpbnB1dCIsICJvdXRwdXQiLCAibGF0ZSIsICJwZWFrIiwgImV4cCIsICJwdXNoIiwgImludGVycG9sYXRlIiwgInNpZGUiLCAidG9wIiwgInJhbmQiLCAiYWxwaGEiLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJPdXRwdXQiLCAidm9sdW1lIiwgImtpY2siLCAianVzdGlmeUNvbnRlbnQiLCAicG9zaXRpb24iLCAidHJhbnNmb3JtIiwgInNjYWxlIiwgImltcG9ydF9yZWFjdCIsICJDbG9jayIsICJub2RlIiwgInNldCIsICJjb2xvciIsICJicG0iLCAidXNlTGl2ZSIsICJkaXYiLCAic3dpbmciLCAicGFyYW1zIiwgIl9qc3hzIiwgIlJvdyIsICJnYXAiLCAiQ29sIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJyIiwgIl9qc3giLCAidGV4dCIsICJmb250U2l6ZSIsICJmb250RmFtaWx5IiwgIkZPTlRfTU9OTyIsICJDIiwgImRpbSIsICJtYXJnaW4iLCAiYm90dG9tIiwgIm1hcCIsICJrIiwgIkxlZCIsICJzaXplIiwgImxldmVsIiwgImoiLCAiVGFicyIsICJvcHRpb25zIiwgInZhbHVlIiwgIm9uQ2hhbmdlIiwgImkiLCAiS25vYiIsICJuYW1lIiwgInYiLCAic2hvdyIsICJNYXRoIiwgInJvdW5kIiwgIlNlcXVlbmNlciIsICJzdGVwcyIsICJtYXNrIiwgImZsZXhHcm93IiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIl8iLCAib24iLCAiaGVyZSIsICJmbGV4QmFzaXMiLCAiQmFyIiwgImZhaW50IiwgImdsb3ciLCAic3RlcExpZ2h0IiwgIm9uQ2xpY2siLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYWxwaGEiLCAiY2FyZERlZXAiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImVkZ2UiLCAiaG92ZXJTdHlsZSIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgImRyYWciLCAidXNlUmVmIiwgIm9uUG9pbnRlckRvd24iLCAiZSIsICJjdXJyZW50IiwgInkiLCAiY2xpZW50WSIsICJvblBvaW50ZXJNb3ZlIiwgImQiLCAiY2xhbXAwMSIsICJvblBvaW50ZXJVcCIsICJqdXN0aWZ5Q29udGVudCIsICJjdXJzb3IiLCAiZWRnZUhpIiwgIm1heCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJyaWdodCIsICJ0b3AiLCAiUGxvdCIsICJ3IiwgImgiLCAibGluZSIsICJjb2xvciIsICJjaGlsZHJlbiIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImhlaWdodCIsICJyIiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQyIsICJjYXJkRGVlcCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiZWRnZSIsICJzdmciLCAidmlld0JveCIsICJ3aWR0aCIsICJfanN4IiwgInBhdGgiLCAiZCIsICJmaWxsIiwgImFscGhhIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJzdHJva2VMaW5lam9pbiIsICJ0cmFjZSIsICJmIiwgIm4iLCAiaSIsICJ4IiwgInkiLCAiTWF0aCIsICJtaW4iLCAidG9GaXhlZCIsICJFbnZlbG9wZSIsICJzZXQiLCAic3RlcHMiLCAiYSIsICJzIiwgInJlbCIsICJwYXJhbXMiLCAiVyIsICJIIiwgInRvcCIsICJmbG9vciIsICJxdWFydGVyIiwgIngxIiwgIngyIiwgInlzIiwgIngzIiwgIng0IiwgImtub2JzIiwgIkNvbCIsICJTSUdOQUwiLCAiY3YiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAiYm90dG9tIiwgIm9wYWNpdHkiLCAiYW5pbWF0ZWQiLCAic3RlcExpZ2h0IiwgIlJvdyIsICJnYXAiLCAibWFwIiwgImtleSIsICJuYW1lIiwgIktub2IiLCAidmFsdWUiLCAib25DaGFuZ2UiLCAidiIsICJzaXplIiwgIkZpbHRlciIsICJtb2RlIiwgImN1dG9mZiIsICJyZXMiLCAibW9kIiwgInEiLCAiYnVtcCIsICJsb2cxMCIsICJtYXgiLCAicG93IiwgImxwIiwgInNxcnQiLCAiaHAiLCAicGVhayIsICJleHAiLCAiYXVkaW8iLCAiVGFicyIsICJvcHRpb25zIiwgInNob3ciLCAicm91bmQiLCAicGN0IiwgIlZjYSIsICJnYWluIiwgImN1cnZlIiwgImZsZXhEaXJlY3Rpb24iLCAic2xldyIsICJ0aW1lIiwgIkdsaWRlIiwgIm5vdGVzIiwgImF0IiwgImxldmVsIiwgInNtb290aCIsICJzdGVwcGVkIiwgInRleHQiLCAiVEFVIiwgIk1hdGgiLCAiUEkiLCAiV0FWRVMiLCAicCIsICJzaW4iLCAiYWJzIiwgIk9zY2lsbGF0b3IiLCAibm9kZSIsICJzZXQiLCAiY29sb3IiLCAid2F2ZSIsICJ0dW5lIiwgImxldmVsIiwgImRldHVuZSIsICJwYXJhbXMiLCAic2VtaXMiLCAicm91bmQiLCAiX2pzeHMiLCAiQ29sIiwgIl9qc3giLCAiU2NvcGUiLCAiY3ljbGVzIiwgInBlcmlvZE1zIiwgIlNJR05BTCIsICJhdWRpbyIsICJ3aWR0aCIsICJUYWJzIiwgIm9wdGlvbnMiLCAidmFsdWUiLCAib25DaGFuZ2UiLCAiaSIsICJSb3ciLCAiZ2FwIiwgIktub2IiLCAibmFtZSIsICJ2IiwgInNob3ciLCAicGN0IiwgIk5vaXNlIiwgInRpbnQiLCAicG9pbnRzIiwgIm5vaXNlIiwgImF0IiwgImZsb29yIiwgImYiLCAiayIsICJyYW5kIiwgImhlaWdodCIsICJNZXRlciIsICJzZWVkIiwgImdhaW4iLCAiY291bnQiLCAiaHoiLCAicmF0ZSIsICJMZm8iLCAic2hhcGUiLCAiZGVwdGgiLCAic2NhbGUiLCAic3RlcHMiLCAibWFwIiwgIm1pbiIsICJwZXJpb2QiLCAibWF4IiwgImN2IiwgInRvRml4ZWQiLCAiQk9ESUVTIiwgImNsb2NrIiwgIkNsb2NrIiwgInNlcXVlbmNlciIsICJTZXF1ZW5jZXIiLCAiYmVhdCIsICJCZWF0IiwgIm9zY2lsbGF0b3IiLCAiT3NjaWxsYXRvciIsICJub2lzZSIsICJOb2lzZSIsICJsZm8iLCAiTGZvIiwgImRydW0iLCAiRHJ1bSIsICJlbnZlbG9wZSIsICJFbnZlbG9wZSIsICJmaWx0ZXIiLCAiRmlsdGVyIiwgInZjYSIsICJWY2EiLCAiZ2xpZGUiLCAiR2xpZGUiLCAibWl4ZXIiLCAiTWl4ZXIiLCAiZGVsYXkiLCAiRGVsYXkiLCAicmV2ZXJiIiwgIlJldmVyYiIsICJvdXRwdXQiLCAiT3V0cHV0IiwgInNvY2tldE5hbWUiLCAicyIsICJub2RlIiwgInNpZGUiLCAicG9ydCIsICJzaWduYWxPZiIsICJnIiwgImQiLCAia2luZCIsICJub2RlcyIsICJvdXRwdXRzIiwgImlucHV0cyIsICJzaWduYWwiLCAiY2FuUGx1ZyIsICJhIiwgImIiLCAibGVhdmluZyIsICJub2RlQm94IiwgIm4iLCAieCIsICJ5IiwgInciLCAid2lkdGgiLCAiaCIsICJjYXJkSGVpZ2h0IiwgImJvdW5kcyIsICJsZW5ndGgiLCAiYm94ZXMiLCAibWFwIiwgIk1hdGgiLCAibWluIiwgIm1heCIsICJsaXZlIiwgIk9iamVjdCIsICJ2YWx1ZXMiLCAiZmlsdGVyIiwgIkVNUFRZIiwgImxpbmtzIiwgInNlbGVjdGVkIiwgInNlcSIsICJ0b3AiLCAicmVkdWNlIiwgInR5cGUiLCAiZ3JhcGgiLCAiaWQiLCAicm91bmQiLCAicGFyYW1zIiwgIktJTkRTIiwgInoiLCAiZW50ZXIiLCAic2VsZWN0IiwgInAiLCAiZW50cmllcyIsICJ0byIsICJpZHMiLCAiZ29uZSIsICJTZXQiLCAibCIsICJoYXMiLCAiZnJvbSIsICJvdXQiLCAiaW5wIiwgInB1c2giLCAia2V5IiwgInZhbHVlIiwgImNvcGllcyIsICJjb3B5IiwgIkdBUF9YIiwgIkdBUF9ZIiwgImFycmFuZ2UiLCAiZGVwdGgiLCAid2FsayIsICJzZWVuIiwgInVuZGVmaW5lZCIsICJhZGQiLCAidXBzIiwgInUiLCAiY29sdW1ucyIsICJwbGFjZWQiLCAiY29sdW1uIiwgIkJvb2xlYW4iLCAidiIsICJzb3J0IiwgImhlaWdodCIsICJSQURJVVMiLCAiTm9kZUNhcmQiLCAibWVtbyIsICJub2RlIiwgInNlbGVjdGVkIiwgImxpZnRlZCIsICJnbGlkaW5nIiwgIndpcmVkIiwgInBsdWciLCAiYXBpIiwgImRlZiIsICJraW5kIiwgImNvbG9yIiwgIkNBVEVHT1JJRVMiLCAiY2F0ZWdvcnkiLCAic3BpbiIsICJzdGVwcyIsICJ1c2VMaXZlIiwgImFwcGVhciIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aERlbGF5IiwgImVudGVyIiwgIndpdGhTcHJpbmciLCAic3RpZmZuZXNzIiwgImRhbXBpbmciLCAibGVhdmluZyIsICJ3aXRoVGltaW5nIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJvbkNvbXBsZXRlIiwgInB1cmdlIiwgImlkIiwgImxpZnQiLCAidGlsdCIsICJsYXN0WCIsICJ1c2VSZWYiLCAieCIsICJkeCIsICJjdXJyZW50IiwgImxlYW4iLCAiTWF0aCIsICJtYXgiLCAibWluIiwgIndpdGhTZXF1ZW5jZSIsICJyaW5nIiwgInR5cGUiLCAic3RhcnQiLCAiYW5pbWF0ZWQiLCAic3RvcHMiLCAiYWxwaGEiLCAiYW5nbGUiLCAiZHJvcCIsICJ5T2Zmc2V0IiwgInIiLCAiYmx1clJhZGl1cyIsICJyb3dzIiwgImlucHV0cyIsICJsZW5ndGgiLCAib3V0cHV0cyIsICJCb2R5IiwgIkJPRElFUyIsICJzZXQiLCAia2V5IiwgInBhcmFtIiwgIl9qc3giLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgInkiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImNhcmRIZWlnaHQiLCAiekluZGV4IiwgInoiLCAidHJhbnNmb3JtIiwgInNjYWxlIiwgImludGVycG9sYXRlIiwgInRyYW5zaXRpb24iLCAibGF5b3V0IiwgInVuZGVmaW5lZCIsICJfanN4cyIsICJvblBvaW50ZXJEb3duIiwgImUiLCAicHJlc3MiLCAib25Qb2ludGVyTW92ZSIsICJkcmFnIiwgIm9uUG9pbnRlclVwIiwgInJlbGVhc2UiLCAiZmxleEdyb3ciLCAiZmxleERpcmVjdGlvbiIsICJib3JkZXJSYWRpdXMiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgIkMiLCAiZWRnZSIsICJib3JkZXJHcmFkaWVudCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAiYm94U2hhZG93IiwgInNwcmVhZFJhZGl1cyIsICJyb3RhdGUiLCAiY3Vyc29yIiwgInJpZ2h0IiwgImJvdHRvbSIsICJzcG90bGlnaHQiLCAid2FzaCIsICJIRUFERVIiLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgIkljb24iLCAiZCIsICJpY29uIiwgInNpemUiLCAidGV4dCIsICJmb250U2l6ZSIsICJmb250V2VpZ2h0IiwgImxldHRlclNwYWNpbmciLCAidGl0bGUiLCAidG9VcHBlckNhc2UiLCAiTGVkIiwgImxldmVsIiwgImoiLCAiYmFja2dyb3VuZENvbG9yIiwgInZlcnRpY2FsIiwgIlJPV1NfUEFEIiwgIkFycmF5IiwgImZyb20iLCAiXyIsICJpIiwgIlJPVyIsICJqdXN0aWZ5Q29udGVudCIsICJtYXAiLCAicCIsICJrIiwgInNpZGUiLCAiU29ja2V0IiwgImF0IiwgInBvcnQiLCAibmFtZSIsICJTSUdOQUwiLCAic2lnbmFsIiwgImluY2x1ZGVzIiwgImJvZHkiLCAiQk9EWV9QQUQiLCAiaW5wdXQiLCAiaWRsZSIsICJvcGVuIiwgInNodXQiLCAidGFyZ2V0IiwgImJyZWF0aCIsICJkaW0iLCAiaGl0IiwgInNvY2tldE5hbWUiLCAic29ja2V0RG93biIsICJzb2NrZXRVcCIsICJvblBvaW50ZXJFbnRlciIsICJzb2NrZXRIb3ZlciIsICJvblBvaW50ZXJMZWF2ZSIsICJob3ZlclN0eWxlIiwgImNhcmREZWVwIiwgIm9wYWNpdHkiLCAiZmFpbnQiLCAic3ZnIiwgInZpZXdCb3giLCAicGF0aCIsICJmaWxsIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJzdHJva2VMaW5lY2FwIiwgInN0cm9rZUxpbmVqb2luIiwgImltcG9ydF9yZWFjdCIsICJ1c2VXaW5kb3dTaXplIiwgInNpemUiLCAic2V0U2l6ZSIsICJ1c2VTdGF0ZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAidXNlRWZmZWN0IiwgImJldnkiLCAid2luZG93IiwgInRoZW4iLCAiY2F0Y2giLCAib24iLCAidXNlRXZlbnQiLCAibmFtZSIsICJydW4iLCAibGF0ZXN0IiwgInVzZVJlZiIsICJjdXJyZW50IiwgInZhbHVlIiwgInVzZURlYnVnIiwgInZlcmIiLCAiYWN0aW9uIiwgImhlYWQiLCAicmVzdCIsICJzcGxpdCIsICJ1c2VMYXRlc3QiLCAicmVmIiwgIldJRFRIIiwgIklURU0iLCAiSEVBRCIsICJvcGVuIiwgIm1lbnVPcGVuIiwgIkFkZE1lbnUiLCAieCIsICJ5IiwgImFjY2VwdHMiLCAib25QaWNrIiwgIm9uQ2xvc2UiLCAicXVlcnkiLCAic2V0UXVlcnkiLCAidXNlU3RhdGUiLCAic2l6ZSIsICJ1c2VXaW5kb3dTaXplIiwgInQiLCAidXNlU2hhcmVkVmFsdWUiLCAidXNlRWZmZWN0IiwgInZhbHVlIiwgIndpdGhTcHJpbmciLCAic3RpZmZuZXNzIiwgImRhbXBpbmciLCAia2luZHMiLCAiT2JqZWN0IiwgImtleXMiLCAiS0lORFMiLCAiZmlsdGVyIiwgImsiLCAidGl0bGUiLCAidG9Mb3dlckNhc2UiLCAiaW5jbHVkZXMiLCAiZ3JvdXBzIiwgIkNBVEVHT1JJRVMiLCAibWFwIiwgImMiLCAiY2F0ZWdvcnkiLCAia3MiLCAibGVuZ3RoIiwgImxhdGVzdCIsICJ1c2VMYXRlc3QiLCAib2ZmIiwgImJldnkiLCAib24iLCAiZSIsICJjdXJyZW50IiwgImtleSIsICJxIiwgInNsaWNlIiwgInRleHQiLCAidGVzdCIsICJjdHJsS2V5IiwgImhlaWdodCIsICJyZWR1Y2UiLCAiaCIsICJsZWZ0IiwgIk1hdGgiLCAibWF4IiwgIm1pbiIsICJ3aWR0aCIsICJ0b3AiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJnbGFzcyIsICJwb3NpdGlvblR5cGUiLCAiZmxleERpcmVjdGlvbiIsICJwYWRkaW5nIiwgImdsb2JhbFpJbmRleCIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgInRyYW5zZm9ybSIsICJzY2FsZSIsICJpbnRlcnBvbGF0ZSIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJtYXJnaW4iLCAiYm90dG9tIiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiX2pzeCIsICJJY29uIiwgImQiLCAiY29sb3IiLCAiQyIsICJkaW0iLCAiZm9udFNpemUiLCAiZmFpbnQiLCAiZm9udFdlaWdodCIsICJsZXR0ZXJTcGFjaW5nIiwgImxhYmVsIiwgInRvVXBwZXJDYXNlIiwgIm9uQ2xpY2siLCAiYWxwaGEiLCAidHJhbnNpdGlvbiIsICJkdXJhdGlvbiIsICJob3ZlclN0eWxlIiwgImljb24iLCAiZmxleEdyb3ciLCAiYmx1cmIiLCAiaW1wb3J0X3JlYWN0IiwgIlciLCAiSCIsICJNaW5pbWFwIiwgImdyYXBoIiwgInZpZXciLCAic2l6ZSIsICJvbkNlbnRlciIsICJub2RlcyIsICJsaXZlIiwgInNlZW4iLCAieCIsICJ6b29tIiwgInkiLCAidyIsICJ3aWR0aCIsICJoIiwgImhlaWdodCIsICJiIiwgImJvdW5kcyIsICJwYWQiLCAieDAiLCAiTWF0aCIsICJtaW4iLCAieTAiLCAieDEiLCAibWF4IiwgInkxIiwgInMiLCAib3giLCAib3kiLCAicHgiLCAiZnJvemVuIiwgInVzZVJlZiIsICJmbHkiLCAiZSIsICJnbGlkZSIsICJtIiwgImN1cnJlbnQiLCAid2lyZXMiLCAibCIsICJsaW5rcyIsICJhIiwgImZyb20iLCAibm9kZSIsICJ6IiwgInRvIiwgImF4IiwgImF5IiwgImtpbmQiLCAiengiLCAienkiLCAibWlkIiwgInJvdW5kIiwgIl9qc3giLCAib25Qb2ludGVyRG93biIsICJvblBvaW50ZXJNb3ZlIiwgIm9uUG9pbnRlclVwIiwgInN0eWxlIiwgImdsYXNzIiwgInBvc2l0aW9uVHlwZSIsICJyaWdodCIsICJib3R0b20iLCAib3ZlcmZsb3dYIiwgIm92ZXJmbG93WSIsICJjdXJzb3IiLCAiX2pzeHMiLCAic3ZnIiwgInZpZXdCb3giLCAibGVmdCIsICJ0b3AiLCAicGF0aCIsICJkIiwgImZpbGwiLCAic3Ryb2tlIiwgImFscGhhIiwgInN0cm9rZVdpZHRoIiwgIm1hcCIsICJuIiwgInIiLCAibm9kZUJveCIsICJjb2xvciIsICJDQVRFR09SSUVTIiwgImNhdGVnb3J5IiwgInNlbCIsICJzZWxlY3RlZCIsICJpbmNsdWRlcyIsICJpZCIsICJyZWN0IiwgInJ4IiwgIkMiLCAidGV4dCIsICJpbXBvcnRfcmVhY3QiLCAiUEFMRVRURV9XIiwgIlBhbGV0dGUiLCAib25BZGQiLCAib25Ecm9wIiwgImdob3N0IiwgInNldEdob3N0IiwgInVzZVN0YXRlIiwgInByZXNzIiwgInVzZVJlZiIsICJkb3duIiwgImtpbmQiLCAiZSIsICJjdXJyZW50IiwgIngiLCAiY2xpZW50WCIsICJ5IiwgImNsaWVudFkiLCAibW92ZWQiLCAibW92ZSIsICJwIiwgIk1hdGgiLCAiaHlwb3QiLCAidXAiLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgIm5vZGUiLCAic3R5bGUiLCAiZ2xhc3MiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAicGFkZGluZyIsICJfanN4IiwgInRleHQiLCAiZm9udFNpemUiLCAiZm9udFdlaWdodCIsICJsZXR0ZXJTcGFjaW5nIiwgImNvbG9yIiwgIkMiLCAiZGltIiwgIm1hcmdpbiIsICJib3R0b20iLCAiT2JqZWN0IiwgImtleXMiLCAiQ0FURUdPUklFUyIsICJtYXAiLCAiYyIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJoZWlnaHQiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJsYWJlbCIsICJ0b1VwcGVyQ2FzZSIsICJLSU5EUyIsICJmaWx0ZXIiLCAiayIsICJjYXRlZ29yeSIsICJvblBvaW50ZXJEb3duIiwgIm9uUG9pbnRlck1vdmUiLCAib25Qb2ludGVyVXAiLCAiY3Vyc29yIiwgInRyYW5zZm9ybSIsICJ0cmFuc2xhdGVYIiwgInRyYW5zaXRpb24iLCAiZHVyYXRpb24iLCAic3RpZmZuZXNzIiwgImRhbXBpbmciLCAiaG92ZXJTdHlsZSIsICJhbHBoYSIsICJqdXN0aWZ5Q29udGVudCIsICJJY29uIiwgImQiLCAiaWNvbiIsICJzaXplIiwgInRpdGxlIiwgIkdob3N0IiwgImRlZiIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYm94U2hhZG93IiwgImJsdXJSYWRpdXMiLCAiZ2xvYmFsWkluZGV4IiwgInJvdGF0ZSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgIlByZXNldHMiLCAicHJlc2V0cyIsICJ2YWx1ZSIsICJvbkNoYW5nZSIsICJvcGVuIiwgInNldE9wZW4iLCAidXNlU3RhdGUiLCAic3RlcCIsICJieSIsICJsZW5ndGgiLCAidXNlRWZmZWN0IiwgImJldnkiLCAib24iLCAiZSIsICJrZXkiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgIl9qc3giLCAiQXJyb3ciLCAiZCIsICJvbkNsaWNrIiwgIm8iLCAid2lkdGgiLCAiaGVpZ2h0IiwgInBhZGRpbmciLCAibGVmdCIsICJyaWdodCIsICJib3JkZXJSYWRpdXMiLCAiYmFja2dyb3VuZENvbG9yIiwgInRyYW5zaXRpb24iLCAiZHVyYXRpb24iLCAiaG92ZXJTdHlsZSIsICJ0ZXh0IiwgImZsZXhHcm93IiwgImZvbnRTaXplIiwgImNvbG9yIiwgIkMiLCAibmFtZSIsICJJY29uIiwgImRpbSIsICJzaXplIiwgIkxpc3QiLCAib25QaWNrIiwgImkiLCAib25DbG9zZSIsICJqdXN0aWZ5Q29udGVudCIsICJvblBvaW50ZXJEb3duIiwgInBvc2l0aW9uVHlwZSIsICJ0b3AiLCAiYm90dG9tIiwgImdsb2JhbFpJbmRleCIsICJnbGFzcyIsICJtYXJnaW4iLCAibWFwIiwgInAiLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJhbHBoYSIsICJTSUdOQUwiLCAiYXVkaW8iLCAiYmx1cmIiLCAiZm9udEZhbWlseSIsICJGT05UX01PTk8iLCAiYnBtIiwgImJ1dHRvbiIsICJoZWlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJwYWRkaW5nIiwgImxlZnQiLCAicmlnaHQiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJ0cmFuc2l0aW9uIiwgImR1cmF0aW9uIiwgInRyYW5zZm9ybSIsICJzdGlmZm5lc3MiLCAiZGFtcGluZyIsICJzY2FsZSIsICJCdXR0b24iLCAiaWNvbiIsICJsYWJlbCIsICJvbkNsaWNrIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiaG92ZXJTdHlsZSIsICJwcmVzc1N0eWxlIiwgIl9qc3giLCAiSWNvbiIsICJkIiwgImNvbG9yIiwgIkMiLCAiZGltIiwgInNpemUiLCAidGV4dCIsICJmb250U2l6ZSIsICJEaXZpZGVyIiwgIndpZHRoIiwgImdsYXNzRWRnZSIsICJUb3BCYXIiLCAicHJlc2V0cyIsICJwcmVzZXQiLCAib25QcmVzZXQiLCAicGxheWluZyIsICJvblBsYXkiLCAiYnBtIiwgIm9uQnBtIiwgInpvb20iLCAib25BcnJhbmdlIiwgIm9uRml0IiwgInBvc2l0aW9uVHlwZSIsICJ0b3AiLCAianVzdGlmeUNvbnRlbnQiLCAiZ2xhc3MiLCAiTG9nbyIsICJmb250V2VpZ2h0IiwgImxldHRlclNwYWNpbmciLCAiUHJlc2V0cyIsICJ2YWx1ZSIsICJvbkNoYW5nZSIsICJQbGF5IiwgIlRlbXBvIiwgImZvbnRGYW1pbHkiLCAiRk9OVF9NT05PIiwgInRleHRBbGlnbiIsICJNYXRoIiwgInJvdW5kIiwgInN2ZyIsICJ2aWV3Qm94IiwgInBhdGgiLCAiZmlsbCIsICJzdHJva2UiLCAiU0lHTkFMIiwgImF1ZGlvIiwgInN0cm9rZVdpZHRoIiwgImdhdGUiLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAiY3YiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImFscGhhIiwgIm1vcnBoRmlsdGVyIiwgImtleSIsICJuYW1lIiwgInJlY3QiLCAieCIsICJ5IiwgInJ4IiwgImxpdmUiLCAic2V0TGl2ZSIsICJ1c2VTdGF0ZSIsICJkcmFnIiwgInVzZVJlZiIsICJzaG93biIsICJzY3J1YiIsICJjdXJyZW50IiwgIm1heCIsICJtaW4iLCAib25Qb2ludGVyRG93biIsICJlIiwgImNsaWVudFgiLCAib25Qb2ludGVyTW92ZSIsICJvblBvaW50ZXJVcCIsICJuZXh0IiwgImhvcml6b250YWwiLCAiY3Vyc29yIiwgIkhpbnRzIiwgIml0ZW1zIiwgImJvdHRvbSIsICJtYXAiLCAid2hhdCIsICJIaW50IiwgImsiLCAiaW1wb3J0X3JlYWN0IiwgIkdSQVBIX1JPT1QiLCAiWk9PTV9TVEVQIiwgInpvb21MZXZlbCIsICJ6b29tIiwgIk1hdGgiLCAibWF4IiwgIm1pbiIsICJyb3VuZCIsICJsb2ciLCAiem9vbUF0IiwgImxldmVsIiwgInNhbWUiLCAiYSIsICJiIiwgIm5vZGUiLCAic2lkZSIsICJwb3J0IiwgIkNhbnZhcyIsICJncmFwaCIsICJkaXNwYXRjaCIsICJ2aWV3IiwgInNldFZpZXciLCAiZ2xpZGluZyIsICJwbGF5aW5nIiwgIndpcmUiLCAic2V0V2lyZSIsICJ1c2VTdGF0ZSIsICJsaWZ0ZWQiLCAic2V0TGlmdGVkIiwgImJveCIsICJzZXRCb3giLCAibWVudSIsICJzZXRNZW51IiwgImdlc3R1cmUiLCAidXNlUmVmIiwgIndoZWVsIiwgInN0YXRlIiwgInVzZUxhdGVzdCIsICJ0b1dvcmxkIiwgInAiLCAidiIsICJjdXJyZW50IiwgIngiLCAieSIsICJjbGllbnQiLCAiZSIsICJjbGllbnRYIiwgImNsaWVudFkiLCAicGFuIiwgInN0YXJ0IiwgImtpbmQiLCAiZnJvbSIsICJtb3ZlZCIsICJidXR0b24iLCAibW92ZSIsICJnIiwgImR4IiwgImR5IiwgImh5cG90IiwgImdsaWRlIiwgImFwaSIsICJ1c2VNZW1vIiwgInByZXNzIiwgImlkIiwgIm5vZGVzIiwgImxlYXZpbmciLCAid2FzIiwgInNlbGVjdGVkIiwgImluY2x1ZGVzIiwgImlkcyIsICJzaGlmdEtleSIsICJ0eXBlIiwgImZpbHRlciIsICJpIiwgIk9iamVjdCIsICJmcm9tRW50cmllcyIsICJtYXAiLCAic2hpZnQiLCAiZHJhZyIsICJrZXlzIiwgInRvIiwgImVudHJpZXMiLCAicmVsZWFzZSIsICJzb2NrZXREb3duIiwgInMiLCAiaGVsZCIsICJsaW5rcyIsICJmaW5kIiwgImwiLCAiYXQiLCAic29ja2V0SG92ZXIiLCAib24iLCAidyIsICJjYW5QbHVnIiwgInNvY2tldFVwIiwgIm9uTm9kZSIsICJsaXZlIiwgInNvbWUiLCAibiIsICJub2RlQm94IiwgImgiLCAicGFyYW0iLCAia2V5IiwgInZhbHVlIiwgInB1cmdlIiwgImNsb3NlTWVudSIsICJwaWNrIiwgImsiLCAic2VxIiwgImRlZiIsICJzZWxlY3QiLCAicG9ydHMiLCAiaW5wdXRzIiwgIm91dHB1dHMiLCAiZmluZEluZGV4IiwgInEiLCAic2lnbmFsIiwgInNpZ25hbE9mIiwgIndpZHRoIiwgIkhFQURFUiIsICJST1dTX1BBRCIsICJST1ciLCAidXNlRWZmZWN0IiwgImJldnkiLCAicmVwZWF0IiwgImNvZGUiLCAiY3RybEtleSIsICJwb2ludGVyIiwgImdldCIsICJ0aGVuIiwgInVzZURlYnVnIiwgIk51bWJlciIsICJzZW50IiwgIlNldCIsICJzb2NrZXROYW1lIiwgIm91dHB1dCIsICJjb2xvciIsICJTSUdOQUwiLCAibXNnIiwgIndpcmVzIiwgIm91dCIsICJob3QiLCAiaGFzIiwgImpzb24iLCAiSlNPTiIsICJzdHJpbmdpZnkiLCAicGF0Y2giLCAic2V0IiwgInBsdWdzIiwgImQiLCAiZm9yRWFjaCIsICJfIiwgIndpcmVkIiwgImZsYXRNYXAiLCAiQm9vbGVhbiIsICJqb2luIiwgInNlbGVjdEJveCIsICJiYXNlIiwgIngwIiwgIngxIiwgInkwIiwgInkxIiwgImhpdHMiLCAiciIsICJfanN4cyIsICJvblBvaW50ZXJEb3duIiwgIm9uUG9pbnRlck1vdmUiLCAib25Qb2ludGVyVXAiLCAib25XaGVlbCIsICJkZWx0YU1vZGUiLCAiZGVsdGFZIiwgInN0ZXBzIiwgInRydW5jIiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInRvcCIsICJoZWlnaHQiLCAib3ZlcmZsb3dYIiwgIm92ZXJmbG93WSIsICJfanN4IiwgIlpvb21Db250ZXh0IiwgIlByb3ZpZGVyIiwgIm5hbWUiLCAidmFsdWVzIiwgIk5vZGVDYXJkIiwgInBsdWciLCAiYWJzIiwgImJvcmRlclJhZGl1cyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYWxwaGEiLCAiYmFja2dyb3VuZENvbG9yIiwgIkFkZE1lbnUiLCAiYWNjZXB0cyIsICJ1bmRlZmluZWQiLCAib25QaWNrIiwgIm9uQ2xvc2UiLCAiZGVnIiwgIm5zIiwgIk9iamVjdCIsICJmcm9tRW50cmllcyIsICJtYXAiLCAibiIsICJpIiwgInR1bmUiLCAic2VtaXMiLCAibGFuZSIsICJiYXIiLCAicmVwbGFjZSIsICJyZWR1Y2UiLCAibSIsICJjIiwgInByZXNldCIsICJuYW1lIiwgImJsdXJiIiwgImJwbSIsICJzcGVjcyIsICJ3aXJlcyIsICJub2RlcyIsICJmb3JFYWNoIiwgImlkIiwgImtpbmQiLCAicGFyYW1zIiwgIngiLCAieSIsICJLSU5EUyIsICJ6IiwgImVudGVyIiwgImxpbmtzIiwgInciLCAiZnJvbSIsICJ0byIsICJzcGxpdCIsICJlbmQiLCAibm9kZSIsICJwb3J0IiwgIk51bWJlciIsICJhdCIsICJhcnJhbmdlIiwgIkVNUFRZIiwgInhzIiwgInZhbHVlcyIsICJwIiwgImxlZnQiLCAicmlnaHQiLCAiTWF0aCIsICJtaW4iLCAibWF4IiwgImFzc2lnbiIsICJncmFwaCIsICJzZWxlY3RlZCIsICJzZXEiLCAidG9wIiwgImxlbmd0aCIsICJpbnN0YW50aWF0ZSIsICJ0YWciLCAibCIsICJXSVJFX0RFTEFZIiwgIlBSRVNFVFMiLCAiZGl2IiwgInNoYXBlIiwgInJhdGUiLCAiZGVwdGgiLCAibWFzayIsICJrMCIsICJrMSIsICJrMiIsICJrMyIsICJ3YXZlIiwgImxldmVsIiwgImRldHVuZSIsICJhIiwgImQiLCAicyIsICJyIiwgInZvaWNlIiwgImRlY2F5IiwgIm1vZGUiLCAiY3V0b2ZmIiwgInJlcyIsICJtb2QiLCAiZ2FpbiIsICJjdXJ2ZSIsICJ0aW1lIiwgImZlZWRiYWNrIiwgIm1peCIsICJzeW5jIiwgImwwIiwgImwxIiwgImwyIiwgImwzIiwgInNpemUiLCAiZGFtcCIsICJ2b2x1bWUiLCAic3dpbmciLCAiY29sb3IiLCAiSU5TRVQiLCAibGVmdCIsICJQQUxFVFRFX1ciLCAidG9wIiwgInJpZ2h0IiwgImJvdHRvbSIsICJBcHAiLCAiZ3JhcGgiLCAiZGlzcGF0Y2giLCAidXNlUmVkdWNlciIsICJyZWR1Y2UiLCAiRU1QVFkiLCAidmlldyIsICJzZXRWaWV3IiwgInVzZVN0YXRlIiwgIngiLCAieSIsICJ6b29tIiwgImdsaWRlIiwgInBsYXlpbmciLCAic2V0UGxheWluZyIsICJicG0iLCAic2V0QnBtIiwgInByZXNldCIsICJzZXRQcmVzZXQiLCAiZ2xpZGluZyIsICJzZXRHbGlkaW5nIiwgInNpemUiLCAidXNlV2luZG93U2l6ZSIsICJsYXRlc3QiLCAidXNlTGF0ZXN0IiwgInN0ZXBzIiwgInVzZVNoYXJlZFZhbHVlIiwgInNwaW4iLCAiY3R4IiwgInVzZU1lbW8iLCAidXNlRWZmZWN0IiwgInZhbHVlIiwgIndpdGhSZXBlYXQiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJiZXZ5IiwgInNldCIsICJzb3VuZCIsICJ1c2VSZWYiLCAibXNnIiwgIm1vZHVsZXMiLCAibGl2ZSIsICJtYXAiLCAiaWQiLCAia2luZCIsICJwYXJhbXMiLCAiY2FibGVzIiwgImxpbmtzIiwgImZyb20iLCAidG8iLCAibGlnaHRzIiwgImpzb24iLCAiSlNPTiIsICJzdHJpbmdpZnkiLCAiY3VycmVudCIsICJzeW50aCIsICJmcmFtaW5nIiwgIm5vZGVzIiwgImIiLCAiYm91bmRzIiwgInciLCAid2lkdGgiLCAiaCIsICJoZWlnaHQiLCAiTWF0aCIsICJtaW4iLCAiZmxvb3IiLCAiZml0IiwgInYiLCAibG9hZHMiLCAidGltZXJzIiwgImxvYWQiLCAiaSIsICJmb3JFYWNoIiwgImNsZWFyVGltZW91dCIsICJ0YWciLCAiaW5zdGFudGlhdGUiLCAiUFJFU0VUUyIsICJ0eXBlIiwgImlkcyIsICJuIiwgImxhdGVyIiwgIm1zIiwgInJ1biIsICJwdXNoIiwgInNldFRpbWVvdXQiLCAibGVuZ3RoIiwgIk9iamVjdCIsICJ2YWx1ZXMiLCAiV0lSRV9ERUxBWSIsICJhcnJhbmdlQWxsIiwgImFycmFuZ2UiLCAicGxhY2VkIiwgImFkZCIsICJrIiwgInNlbGVjdCIsICJudWRnZSIsICJhZGRNaWQiLCAiY3giLCAiY3kiLCAiS0lORFMiLCAiY2FyZEhlaWdodCIsICJvbiIsICJlIiwgInJlcGVhdCIsICJtZW51T3BlbiIsICJjdHJsIiwgImN0cmxLZXkiLCAibWV0YUtleSIsICJjb2RlIiwgInAiLCAiaW5jbHVkZXMiLCAic2VsZWN0ZWQiLCAidXNlRXZlbnQiLCAidXNlRGVidWciLCAiTnVtYmVyIiwgInoiLCAibmFtZXMiLCAiZmlsdGVyIiwgInNwbGl0IiwgIl9qc3giLCAiTGl2ZUNvbnRleHQiLCAiUHJvdmlkZXIiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJDYW52YXMiLCAiUGFsZXR0ZSIsICJvbkFkZCIsICJvbkRyb3AiLCAiVG9wQmFyIiwgInByZXNldHMiLCAib25QcmVzZXQiLCAib25QbGF5IiwgIm9uQnBtIiwgIm9uQXJyYW5nZSIsICJvbkZpdCIsICJNaW5pbWFwIiwgIm9uQ2VudGVyIiwgIkhpbnRzIiwgIm1vdW50IiwgIl9qc3giLCAiQXBwIl0KfQo=
