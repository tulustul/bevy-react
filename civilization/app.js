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
  var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
  var import_bevy_react4 = __toESM(require_bevy_react(), 1);

  // src/App.tsx
  var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
  var import_react10 = __toESM(require_react(), 1);

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
    map: {
      focus(value) {
        emit("map.focus", value);
      },
      jump(value) {
        emit("map.jump", value);
      },
      lens(value) {
        emit("map.lens", value);
      },
      select(value) {
        emit("map.select", value);
      },
      world() {
        return request("map.world", null);
      }
    },
    window: {
      size() {
        return request("window.size", null);
      }
    }
  };

  // src/city/CityPanel.tsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);

  // src/techs.ts
  var ERAS = [
    {
      name: "Ancient Era",
      columns: 3
    },
    {
      name: "Classical Era",
      columns: 2
    },
    {
      name: "Medieval Era",
      columns: 2
    },
    {
      name: "Renaissance Era",
      columns: 2
    }
  ];
  var t = (id, name, col, row, requires, icon, unlocks, boost) => ({
    id,
    name,
    col,
    row,
    cost: 30 + col * col * 7 + col * 10,
    requires,
    icon,
    unlocks: unlocks.map(([icon2, name2]) => ({
      icon: icon2,
      name: name2
    })),
    boost
  });
  var TECHS = [
    t("pottery", "Pottery", 0, 0, [], "food", [
      [
        "food",
        "Granary"
      ]
    ], "Found a city"),
    t("husbandry", "Animal Husbandry", 0, 2, [], "movement", [
      [
        "map",
        "Pasture"
      ]
    ], "Find horses"),
    t("mining", "Mining", 0, 4, [], "production", [
      [
        "production",
        "Mine"
      ]
    ], "Settle near hills"),
    t("sailing", "Sailing", 0, 6, [], "anchor", [
      [
        "anchor",
        "Galley"
      ]
    ], "Found a city on the coast"),
    t("irrigation", "Irrigation", 1, 0, [
      "pottery"
    ], "food", [
      [
        "food",
        "Farm on plains"
      ]
    ], "Farm a resource"),
    t("writing", "Writing", 1, 1, [
      "pottery"
    ], "book", [
      [
        "science",
        "Campus"
      ]
    ], "Meet another civilization"),
    t("archery", "Archery", 1, 2, [
      "husbandry"
    ], "bow", [
      [
        "bow",
        "Archer"
      ]
    ], "Kill a unit with a slinger"),
    t("masonry", "Masonry", 1, 4, [
      "mining"
    ], "castle", [
      [
        "castle",
        "Ancient Walls"
      ]
    ], "Build a quarry"),
    t("bronze", "Bronze Working", 1, 5, [
      "mining"
    ], "strength", [
      [
        "strength",
        "Spearman"
      ]
    ], "Kill three barbarians"),
    t("astrology", "Astrology", 1, 6, [
      "sailing"
    ], "faith", [
      [
        "faith",
        "Holy Site"
      ]
    ], "Find a natural wonder"),
    t("wheel", "The Wheel", 2, 3, [
      "mining",
      "husbandry"
    ], "movement", [
      [
        "movement",
        "Heavy Chariot"
      ]
    ], "Mine a resource"),
    t("currency", "Currency", 3, 1, [
      "writing"
    ], "gold", [
      [
        "gold",
        "Market"
      ]
    ], "Make a trade route"),
    t("riding", "Horseback Riding", 3, 2, [
      "archery"
    ], "movement", [
      [
        "movement",
        "Horseman"
      ]
    ], "Build a pasture"),
    t("iron", "Iron Working", 3, 5, [
      "bronze"
    ], "strength", [
      [
        "strength",
        "Swordsman"
      ]
    ], "Build an iron mine"),
    t("navigation", "Celestial Navigation", 3, 6, [
      "sailing",
      "astrology"
    ], "anchor", [
      [
        "anchor",
        "Harbor"
      ]
    ], "Improve two sea resources"),
    t("mathematics", "Mathematics", 4, 1, [
      "currency"
    ], "science", [
      [
        "science",
        "+1 movement at sea"
      ]
    ], "Build three districts"),
    t("construction", "Construction", 4, 3, [
      "masonry",
      "wheel"
    ], "castle", [
      [
        "culture",
        "Amphitheater"
      ]
    ], "Build a water mill"),
    t("shipbuilding", "Shipbuilding", 4, 6, [
      "navigation"
    ], "anchor", [
      [
        "anchor",
        "Quadrireme"
      ]
    ], "Own two galleys"),
    t("engineering", "Engineering", 4, 4, [
      "wheel"
    ], "production", [
      [
        "castle",
        "Aqueduct"
      ]
    ], "Build ancient walls"),
    t("tactics", "Military Tactics", 5, 2, [
      "mathematics"
    ], "strength", [
      [
        "strength",
        "Pikeman"
      ]
    ], "Kill a unit with a spearman"),
    t("apprenticeship", "Apprenticeship", 5, 4, [
      "currency",
      "engineering"
    ], "production", [
      [
        "production",
        "Industrial Zone"
      ]
    ], "Build three mines"),
    t("machinery", "Machinery", 6, 3, [
      "iron",
      "engineering"
    ], "production", [
      [
        "bow",
        "Crossbowman"
      ]
    ], "Own three archers"),
    t("education", "Education", 6, 1, [
      "mathematics",
      "apprenticeship"
    ], "book", [
      [
        "book",
        "University"
      ]
    ], "Earn a Great Scientist"),
    t("stirrups", "Stirrups", 6, 2, [
      "riding"
    ], "movement", [
      [
        "movement",
        "Knight"
      ]
    ], "Have the Feudalism civic"),
    t("engineers", "Military Engineering", 5, 5, [
      "construction"
    ], "castle", [
      [
        "castle",
        "Medieval Walls"
      ]
    ], "Build an aqueduct"),
    t("castles", "Castles", 6, 5, [
      "engineers"
    ], "castle", [
      [
        "castle",
        "Fortress"
      ]
    ], "Have a government with six slots"),
    t("cartography", "Cartography", 7, 6, [
      "shipbuilding"
    ], "map", [
      [
        "anchor",
        "Caravel"
      ]
    ], "Build two harbors"),
    t("production", "Mass Production", 7, 4, [
      "education",
      "shipbuilding"
    ], "production", [
      [
        "production",
        "Lumber mill"
      ]
    ], "Build a water mill"),
    t("banking", "Banking", 7, 1, [
      "education",
      "apprenticeship"
    ], "gold", [
      [
        "gold",
        "Bank"
      ]
    ], "Have the Guilds civic"),
    t("gunpowder", "Gunpowder", 7, 3, [
      "machinery",
      "apprenticeship"
    ], "strength", [
      [
        "strength",
        "Musketman"
      ]
    ], "Build an armory"),
    t("printing", "Printing", 8, 2, [
      "machinery"
    ], "book", [
      [
        "book",
        "Printing press"
      ]
    ], "Build two universities"),
    t("astronomy", "Astronomy", 8, 0, [
      "education"
    ], "eye", [
      [
        "science",
        "Observatory"
      ]
    ], "Build a university next to a mountain"),
    t("siege", "Siege Tactics", 8, 5, [
      "castles",
      "gunpowder"
    ], "strength", [
      [
        "strength",
        "Bombard"
      ]
    ], "Own two heavy chariots")
  ];
  var tech = (id) => TECHS.find((t2) => t2.id === id);
  var STARTING_TECHS = TECHS.filter((t2) => t2.col <= 4 && t2.id !== "shipbuilding" || [
    "tactics",
    "apprenticeship",
    "engineers"
  ].includes(t2.id)).map((t2) => t2.id);
  var CIVICS = [
    "Political Philosophy",
    "Drama and Poetry",
    "Military Training",
    "Defensive Tactics",
    "Recorded History",
    "Theology",
    "Naval Tradition",
    "Feudalism",
    "Civil Service",
    "Mercenaries",
    "Medieval Faires",
    "Guilds"
  ];

  // src/theme.ts
  var C = {
    ink: "#060d15",
    navy: "#0d1826",
    navyHi: "#1b2d44",
    slate: "#22384f",
    slateHi: "#2e4b69",
    gold: "#d9b76c",
    goldHi: "#f6e4a8",
    goldLo: "#8a6b35",
    goldLine: "rgba(217, 183, 108, 0.45)",
    text: "#f0e8d6",
    muted: "#a2b3c6",
    faint: "#62778d",
    good: "#7ad35e",
    bad: "#ec6450",
    // The yields.
    food: "#8fd34f",
    production: "#f09b3d",
    coin: "#f6cf4a",
    science: "#5fbff4",
    culture: "#d08aef",
    faith: "#e4defe"
  };
  var Fonts = {
    /** Carved Roman capitals, for titles. */
    display: "Cinzel"
  };
  var YIELDS = [
    {
      key: "food",
      name: "Food",
      color: C.food
    },
    {
      key: "production",
      name: "Production",
      color: C.production
    },
    {
      key: "gold",
      name: "Gold",
      color: C.coin
    },
    {
      key: "science",
      name: "Science",
      color: C.science
    },
    {
      key: "culture",
      name: "Culture",
      color: C.culture
    },
    {
      key: "faith",
      name: "Faith",
      color: C.faith
    }
  ];
  var panel = {
    backgroundGradient: {
      type: "linear",
      angle: 180,
      stops: [
        {
          color: C.navyHi
        },
        {
          color: C.navy
        }
      ]
    },
    border: 1,
    borderColor: C.goldLo,
    borderRadius: 3,
    boxShadow: {
      color: "rgba(0, 0, 0, 0.55)",
      blurRadius: 16,
      yOffset: 5
    }
  };
  var gilt = {
    type: "linear",
    angle: 160,
    stops: [
      {
        color: C.goldHi
      },
      {
        color: C.gold
      },
      {
        color: C.goldLo
      },
      {
        color: C.gold
      }
    ]
  };
  var caps = {
    fontSize: 11,
    fontWeight: "semibold",
    letterSpacing: 1.6,
    color: C.gold,
    lineBreak: "noWrap"
  };
  var OWNS_POINTER = {};
  var fmt = (n) => Math.abs(n) >= 100 || Math.abs(n - Math.round(n)) < 0.05 ? Math.round(n).toString() : n.toFixed(1);
  var signed = (n) => n >= 0 ? `+${fmt(n)}` : fmt(n);
  function tone(hex, k) {
    const n = parseInt(hex.slice(1, 7), 16);
    return "#" + [
      n >> 16 & 255,
      n >> 8 & 255,
      n & 255
    ].map((c) => k >= 1 ? c + (255 - c) * (k - 1) : c * k).map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("");
  }
  function mix(a, b, t2) {
    const ch = (hex) => {
      const n = parseInt(hex.slice(1, 7), 16);
      return [
        n >> 16 & 255,
        n >> 8 & 255,
        n & 255
      ];
    };
    const [x, y] = [
      ch(a),
      ch(b)
    ];
    return "#" + x.map((c, i) => Math.round(c + (y[i] - c) * t2).toString(16).padStart(2, "0")).join("");
  }

  // src/game.ts
  var START_TURN = 128;
  var METRICS = [
    {
      key: "score",
      name: "Score",
      unit: "points",
      color: C.goldHi,
      icon: "trophy"
    },
    {
      key: "science",
      name: "Science",
      unit: "per turn",
      color: C.science,
      icon: "science"
    },
    {
      key: "culture",
      name: "Culture",
      unit: "per turn",
      color: C.culture,
      icon: "culture"
    },
    {
      key: "gold",
      name: "Gold",
      unit: "per turn",
      color: C.coin,
      icon: "gold"
    },
    {
      key: "faith",
      name: "Faith",
      unit: "per turn",
      color: C.faith,
      icon: "faith"
    },
    {
      key: "military",
      name: "Military",
      unit: "strength",
      color: C.bad,
      icon: "strength"
    },
    {
      key: "population",
      name: "Population",
      unit: "citizens",
      color: C.food,
      icon: "person"
    }
  ];
  var ITEMS = [
    {
      id: "campus",
      name: "Campus",
      kind: "District",
      cost: 108,
      icon: "science",
      effect: "+2 science, Great Scientist points"
    },
    {
      id: "theater",
      name: "Theater Square",
      kind: "District",
      cost: 108,
      icon: "culture",
      effect: "+2 culture, Great Writer points"
    },
    {
      id: "holysite",
      name: "Holy Site",
      kind: "District",
      cost: 108,
      icon: "faith",
      effect: "+2 faith, Great Prophet points"
    },
    {
      id: "harbor",
      name: "Harbor",
      kind: "District",
      cost: 108,
      icon: "anchor",
      effect: "+2 gold, +1 trade route"
    },
    {
      id: "monument",
      name: "Monument",
      kind: "Building",
      cost: 60,
      icon: "obelisk",
      effect: "+2 culture"
    },
    {
      id: "granary",
      name: "Granary",
      kind: "Building",
      cost: 65,
      icon: "food",
      effect: "+1 food, +2 housing"
    },
    {
      id: "library",
      name: "Library",
      kind: "Building",
      cost: 90,
      icon: "book",
      effect: "+2 science"
    },
    {
      id: "shrine",
      name: "Shrine",
      kind: "Building",
      cost: 70,
      icon: "faith",
      effect: "+2 faith"
    },
    {
      id: "market",
      name: "Market",
      kind: "Building",
      cost: 120,
      icon: "gold",
      effect: "+3 gold"
    },
    {
      id: "walls",
      name: "Ancient Walls",
      kind: "Building",
      cost: 80,
      icon: "castle",
      effect: "+100 city defense"
    },
    {
      id: "warrior",
      name: "Warrior",
      kind: "Unit",
      cost: 40,
      icon: "strength",
      effect: "Melee \xB7 20 strength"
    },
    {
      id: "archer",
      name: "Archer",
      kind: "Unit",
      cost: 60,
      icon: "bow",
      effect: "Ranged \xB7 25 strength"
    },
    {
      id: "builder",
      name: "Builder",
      kind: "Unit",
      cost: 50,
      icon: "production",
      effect: "3 build charges"
    },
    {
      id: "settler",
      name: "Settler",
      kind: "Unit",
      cost: 80,
      icon: "flag",
      effect: "Founds a new city"
    }
  ];
  var item = (id) => ITEMS.find((i) => i.id === id);
  var civicCost = (n) => 180 + n * 45;
  function rng(seed) {
    return () => {
      seed = seed + 1831565813 | 0;
      let t2 = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t2 = t2 + Math.imul(t2 ^ t2 >>> 7, 61 | t2) ^ t2;
      return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296;
    };
  }
  var seedOf = (s) => [
    ...s
  ].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261);
  function totals(cities, civ) {
    const sum = {
      food: 0,
      production: 0,
      gold: 0,
      science: 0,
      culture: 0,
      faith: 0,
      population: 0
    };
    for (const c of cities.filter((c2) => c2.civ === civ)) {
      for (const k of [
        "food",
        "production",
        "gold",
        "science",
        "culture",
        "faith"
      ]) {
        sum[k] += c.yields[k];
      }
      sum.population += c.population;
    }
    return sum;
  }
  function curve(final, turns, seed, wobble) {
    const r = rng(seed);
    const raw = [];
    let drift = 1;
    for (let t2 = 1; t2 <= turns; t2++) {
      drift = drift * 0.85 + (1 + (r() - 0.5) * wobble) * 0.15;
      raw.push((0.03 + 0.97 * Math.pow(t2 / turns, 1.7)) * drift);
    }
    const k = final / raw[raw.length - 1];
    return raw.map((v) => v * k);
  }
  function score(h, t2) {
    return 8 + t2 * 0.55 + h.population[t2] * 3 + h.science[t2] * 2.2 + h.culture[t2] * 2 + h.military[t2] * 0.3;
  }
  function history(world, civ) {
    const sum = totals(world.cities, civ.id);
    const r = rng(seedOf(civ.id));
    const n = START_TURN - 1;
    const cities = world.cities.filter((c) => c.civ === civ.id).length;
    const h = {
      science: curve(sum.science, n, seedOf(civ.id + "s"), 0.5),
      culture: curve(sum.culture, n, seedOf(civ.id + "c"), 0.6),
      gold: curve(sum.gold, n, seedOf(civ.id + "g"), 0.8),
      faith: curve(Math.max(1, sum.faith), n, seedOf(civ.id + "f"), 0.8),
      military: curve(25 + cities * 14 + r() * 50, n, seedOf(civ.id + "m"), 2.4),
      population: curve(sum.population, n, seedOf(civ.id + "p"), 0.3),
      score: []
    };
    h.score = h.science.map((_, t2) => score(h, t2));
    return h;
  }
  function newGame(world) {
    const building = {};
    const built = {};
    const mine = world.cities.filter((c) => c.civ === world.civs[0].id);
    mine.forEach((c, i) => {
      const r = rng(seedOf(c.id));
      const owned = c.capital ? [
        "monument",
        "granary",
        "walls",
        "campus",
        "library"
      ] : [
        "monument",
        "granary",
        "shrine"
      ].slice(0, 1 + i % 3);
      built[c.id] = owned;
      const next = ITEMS.find((it) => it.kind !== "Unit" && !owned.includes(it.id));
      building[c.id] = {
        item: next.id,
        progress: Math.floor(r() * next.cost * 0.7)
      };
    });
    return {
      turn: START_TURN,
      gold: 312,
      faith: 86,
      research: "machinery",
      researched: STARTING_TECHS,
      progress: {
        machinery: Math.round(tech("machinery").cost * 0.62)
      },
      civic: 4,
      civicProgress: 140,
      building,
      built,
      history: Object.fromEntries(world.civs.map((c) => [
        c.id,
        history(world, c)
      ])),
      notes: [
        {
          id: 1,
          icon: "person",
          color: C.science,
          title: "Great Scientist",
          body: "Hypatia of Lumen awaits your call"
        },
        {
          id: 2,
          icon: "food",
          color: C.food,
          title: "City grown",
          body: "Aurelia has grown to new heights"
        },
        {
          id: 3,
          icon: "map",
          color: C.gold,
          title: "First contact",
          body: "Envoys from every corner of the world"
        }
      ],
      nextNote: 4
    };
  }
  function income(game, civ) {
    const h = game.history[civ];
    const last = (m) => h[m][h[m].length - 1];
    return {
      science: last("science"),
      culture: last("culture"),
      gold: last("gold"),
      faith: last("faith")
    };
  }
  function ledger(world, game) {
    const player = world.civs[0].id;
    const cities = world.cities.filter((c) => c.civ === player);
    const built = cities.flatMap((c) => game.built[c.id] ?? []);
    const sources = [
      ...cities.map((c) => ({
        name: c.name,
        value: c.yields.gold
      })),
      {
        name: "Trade routes",
        value: 12
      }
    ];
    const upkeep = [
      {
        name: "Buildings",
        value: built.filter((b) => item(b).kind === "Building").length
      },
      {
        name: "Districts",
        value: built.filter((b) => item(b).kind === "District").length * 2
      },
      {
        name: "Units",
        value: world.units.filter((u) => u.civ === player).length
      }
    ];
    const sum = (xs) => xs.reduce((n, x) => n + x.value, 0);
    return {
      sources,
      upkeep,
      net: sum(sources) - sum(upkeep)
    };
  }
  var RUMORS = [
    [
      "strength",
      C.bad,
      "Barbarians",
      "A barbarian camp was spotted to the north"
    ],
    [
      "person",
      C.culture,
      "Great Writer",
      "A Great Writer was born in a rival land"
    ],
    [
      "map",
      C.gold,
      "Trade route",
      "A caravan from Sunmarch reached Aurelia"
    ],
    [
      "faith",
      C.faith,
      "Religion",
      "A new pantheon is worshipped in Tzalan"
    ],
    [
      "trophy",
      C.goldHi,
      "Wonder",
      "Kharjan began building the Colossus"
    ]
  ];
  function step(world, game, action) {
    switch (action.type) {
      case "research":
        return {
          ...game,
          research: action.tech
        };
      case "produce":
        return {
          ...game,
          building: {
            ...game.building,
            [action.city]: {
              item: action.item,
              progress: 0
            }
          }
        };
      case "dismiss":
        return {
          ...game,
          notes: game.notes.filter((n) => n.id !== action.id)
        };
      case "turn":
        return nextTurn(world, game);
    }
  }
  function nextTurn(world, game) {
    const r = rng(game.turn * 7919);
    const player = world.civs[0].id;
    const notes = [];
    const g = {
      ...game,
      turn: game.turn + 1
    };
    g.history = Object.fromEntries(Object.entries(game.history).map(([civ, h]) => {
      const next = {
        ...h
      };
      for (const m of [
        "science",
        "culture",
        "gold",
        "faith",
        "population"
      ]) {
        next[m] = [
          ...h[m],
          h[m][h[m].length - 1] * (1.003 + r() * 0.012)
        ];
      }
      next.military = [
        ...h.military,
        h.military[h.military.length - 1] * (0.97 + r() * 0.07)
      ];
      next.score = [
        ...h.score,
        score(next, next.science.length - 1)
      ];
      return [
        civ,
        next
      ];
    }));
    const pay = income(g, player);
    g.gold = game.gold + ledger(world, game).net;
    g.faith = game.faith + pay.faith;
    if (game.research) {
      const banked = (game.progress[game.research] ?? 0) + pay.science;
      const done = tech(game.research);
      if (banked >= done.cost) {
        g.researched = [
          ...game.researched,
          done.id
        ];
        g.research = null;
        notes.push({
          icon: done.icon,
          color: C.science,
          title: "Research complete",
          body: done.name
        });
      }
      g.progress = {
        ...game.progress,
        [game.research]: banked
      };
    }
    g.civicProgress = game.civicProgress + pay.culture;
    if (g.civicProgress >= civicCost(game.civic)) {
      notes.push({
        icon: "culture",
        color: C.culture,
        title: "Civic complete",
        body: CIVICS[game.civic % CIVICS.length]
      });
      g.civic = game.civic + 1;
      g.civicProgress = 0;
    }
    g.building = {
      ...game.building
    };
    g.built = {
      ...game.built
    };
    for (const city of world.cities.filter((c) => c.civ === player)) {
      const now = game.building[city.id];
      const progress = now.progress + city.yields.production;
      const it = item(now.item);
      if (progress < it.cost) {
        g.building[city.id] = {
          ...now,
          progress
        };
        continue;
      }
      notes.push({
        icon: it.icon,
        color: C.production,
        title: `${city.name} completed`,
        body: it.name
      });
      const built = it.kind === "Unit" ? game.built[city.id] : [
        ...game.built[city.id],
        it.id
      ];
      g.built[city.id] = built;
      const next = ITEMS.find((i) => i.kind !== "Unit" && !built.includes(i.id)) ?? item("builder");
      g.building[city.id] = {
        item: next.id,
        progress: progress - it.cost
      };
    }
    if (r() < 0.6) {
      const [icon, color, title, body] = RUMORS[Math.floor(r() * RUMORS.length)];
      notes.push({
        icon,
        color,
        title,
        body
      });
    }
    let id = game.nextNote;
    g.notes = [
      ...notes.map((n) => ({
        ...n,
        id: id++
      })),
      ...game.notes
    ].slice(0, 6);
    g.nextNote = id;
    return g;
  }
  function year(turn) {
    let y = -4e3;
    let left = turn;
    for (const [turns, span] of [
      [
        75,
        40
      ],
      [
        60,
        25
      ],
      [
        50,
        20
      ],
      [
        80,
        10
      ],
      [
        Infinity,
        5
      ]
    ]) {
      const n = Math.min(left, turns);
      y += n * span;
      left -= n;
      if (left <= 0) break;
    }
    return y < 0 ? `${-y} BC` : `${y} AD`;
  }
  var plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  var turnsLeft = (cost, banked, rate) => Math.max(1, Math.ceil((cost - banked) / Math.max(0.1, rate)));

  // src/hooks.ts
  var import_react = __toESM(require_react(), 1);
  var import_bevy_react2 = __toESM(require_bevy_react(), 1);
  function useWindowSize() {
    const [size, setSize] = (0, import_react.useState)({
      width: 0,
      height: 0
    });
    (0, import_react.useEffect)(() => {
      bevy.window.size().then(setSize).catch(() => setSize({
        width: 1440,
        height: 900
      }));
      return bevy.on("resize", setSize);
    }, []);
    return size;
  }
  function useEvent(name, run) {
    const latest = (0, import_react.useRef)(run);
    latest.current = run;
    (0, import_react.useEffect)(() => on(name, (value) => latest.current(value)), [
      name
    ]);
  }
  function useDebug(verb, run) {
    useEvent("debug.act", ({ action }) => {
      const [head, ...rest] = action.split(" ");
      if (head === verb) run(rest.join(" "));
    });
  }
  function useSlideIn(x, y, duration = 320) {
    const t2 = (0, import_bevy_react2.useSharedValue)(0);
    (0, import_react.useEffect)(() => {
      t2.value = (0, import_bevy_react2.withTiming)(1, {
        duration,
        easing: "easeOut"
      });
    }, [
      t2,
      duration
    ]);
    return {
      transform: {
        translateX: {
          animated: (0, import_bevy_react2.interpolate)(t2, [
            0,
            1
          ], [
            x,
            0
          ])
        },
        translateY: {
          animated: (0, import_bevy_react2.interpolate)(t2, [
            0,
            1
          ], [
            y,
            0
          ])
        }
      }
    };
  }
  function useFadeIn(duration = 260) {
    const t2 = (0, import_bevy_react2.useSharedValue)(0);
    (0, import_react.useEffect)(() => {
      t2.value = (0, import_bevy_react2.withTiming)(1, {
        duration,
        easing: "easeOut"
      });
    }, [
      t2,
      duration
    ]);
    return {
      opacity: {
        animated: t2
      },
      transform: {
        scale: {
          animated: (0, import_bevy_react2.interpolate)(t2, [
            0,
            1
          ], [
            0.97,
            1
          ])
        }
      }
    };
  }

  // src/ui/Icon.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
  var ICONS = {
    science: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M8.5 3h7",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M10 3.5v6L5 18.2A2 2 0 0 0 6.8 21h10.4a2 2 0 0 0 1.8-2.8L14 9.5v-6",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinejoin: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M7.4 15h9.2l1.5 3.1c.3.6-.1.9-.7.9H6.6c-.6 0-1-.3-.7-.9z",
          fill: c
        })
      ]
    }),
    culture: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M9.2 17.5V5.2l10.5-2.2v12.4",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinejoin: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 6.4,
          cy: 17.6,
          r: 3,
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 16.9,
          cy: 15.5,
          r: 3,
          fill: c
        })
      ]
    }),
    gold: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 12,
          cy: 12,
          r: 9,
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 12,
          cy: 12,
          r: 5.6,
          fill: "none",
          stroke: "#7a5b16",
          strokeWidth: 1.5
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 10.5,
          y: 10.5,
          width: 3,
          height: 3,
          fill: "#7a5b16"
        })
      ]
    }),
    faith: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
      points: star(12, 12, 10, 4.2, 8),
      fill: c
    }),
    food: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M12 22V7",
          fill: "none",
          stroke: c,
          strokeWidth: 1.8,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
          cx: 12,
          cy: 4.6,
          rx: 1.8,
          ry: 2.8,
          fill: c
        }),
        [
          8,
          12.5,
          17
        ].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
              cx: 9,
              cy: y,
              rx: 1.9,
              ry: 3.1,
              fill: c,
              transform: `rotate(-38 9 ${y})`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
              cx: 15,
              cy: y,
              rx: 1.9,
              ry: 3.1,
              fill: c,
              transform: `rotate(38 15 ${y})`
            })
          ]
        }, y))
      ]
    }),
    production: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M4.5 19.5l8.5-8.5",
          fill: "none",
          stroke: c,
          strokeWidth: 2.8,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M10.6 6.2l3.6-3.6 7.2 7.2-3.6 3.6z",
          fill: c
        })
      ]
    }),
    housing: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M3 11.5L12 4l9 7.5",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M5.5 10.5V20h5v-5h3v5h5v-9.5L12 5z",
          fill: c
        })
      ]
    }),
    amenities: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 12,
          cy: 12,
          r: 9,
          fill: "none",
          stroke: c,
          strokeWidth: 2
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M8 13.8c1.4 2.4 6.6 2.4 8 0",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 9,
          cy: 9.5,
          r: 1.3,
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 15,
          cy: 9.5,
          r: 1.3,
          fill: c
        })
      ]
    }),
    strength: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M5 3.5l13 13M19 3.5L6 16.5",
          fill: "none",
          stroke: c,
          strokeWidth: 2.2,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M3.5 15.5l5 5M20.5 15.5l-5 5",
          fill: "none",
          stroke: c,
          strokeWidth: 2.2,
          strokeLinecap: "round"
        })
      ]
    }),
    movement: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M5 5l7 7-7 7M12 5l7 7-7 7",
      fill: "none",
      stroke: c,
      strokeWidth: 2.2,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }),
    bow: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M7 3c8 2.5 8 15.5 0 18",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M7 3v18",
          fill: "none",
          stroke: c,
          strokeWidth: 1
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M3 12h17M17 9l3 3-3 3",
          fill: "none",
          stroke: c,
          strokeWidth: 1.8,
          strokeLinecap: "round",
          strokeLinejoin: "round"
        })
      ]
    }),
    eye: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinejoin: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 12,
          cy: 12,
          r: 3.2,
          fill: c
        })
      ]
    }),
    flag: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M6 21V3.5",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M6 4h12l-3 4.5 3 4.5H6z",
          fill: c
        })
      ]
    }),
    city: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M3 21h18",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M5 21V11l4-3 4 3v10zM14 21V5h5v16z",
          fill: c
        })
      ]
    }),
    book: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M12 6.5C10 4.8 6.5 4.5 4 5.2v13.6c2.5-.7 6-.4 8 1.3 2-1.7 5.5-2 8-1.3V5.2c-2.5-.7-6-.4-8 1.3zM12 6.5v13.6",
      fill: "none",
      stroke: c,
      strokeWidth: 1.9,
      strokeLinejoin: "round"
    }),
    castle: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M4 21V8h3v3h2.5V8h5v3H17V8h3v13h-6v-4.5a2 2 0 0 0-4 0V21z",
      fill: c
    }),
    obelisk: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M10 20l1-14 1-3 1 3 1 14z",
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M6 20.5h12",
          fill: "none",
          stroke: c,
          strokeWidth: 2,
          strokeLinecap: "round"
        })
      ]
    }),
    anchor: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 12,
          cy: 5,
          r: 2.2,
          fill: "none",
          stroke: c,
          strokeWidth: 1.9
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M12 7.2V21M5 13c0 4.5 3.2 8 7 8s7-3.5 7-8M8.5 10.5h7",
          fill: "none",
          stroke: c,
          strokeWidth: 1.9,
          strokeLinecap: "round"
        })
      ]
    }),
    trophy: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M7 3.5h10V9a5 5 0 0 1-10 0z",
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M7 5.5H4v1.2A3.3 3.3 0 0 0 7.3 10M17 5.5h3v1.2a3.3 3.3 0 0 1-3.3 3.3M12 14v4M8 20.5h8",
          fill: "none",
          stroke: c,
          strokeWidth: 1.9,
          strokeLinecap: "round"
        })
      ]
    }),
    chart: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M3.5 20.5h17",
          fill: "none",
          stroke: c,
          strokeWidth: 1.9,
          strokeLinecap: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 5,
          y: 12,
          width: 3.4,
          height: 6.5,
          rx: 0.8,
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 10.3,
          y: 7,
          width: 3.4,
          height: 11.5,
          rx: 0.8,
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 15.6,
          y: 3.5,
          width: 3.4,
          height: 15,
          rx: 0.8,
          fill: c
        })
      ]
    }),
    map: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M3 6.5l6-3 6 3 6-3v14l-6 3-6-3-6 3zM9 3.5v14M15 6.5v14",
      fill: "none",
      stroke: c,
      strokeWidth: 1.9,
      strokeLinejoin: "round"
    }),
    person: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: 12,
          cy: 7.5,
          r: 4,
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M4 21c0-4.6 3.6-7.5 8-7.5s8 2.9 8 7.5z",
          fill: c
        })
      ]
    }),
    shield: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M12 2.5l8.5 3.2v6.1c0 5.1-3.6 8.5-8.5 9.7-4.9-1.2-8.5-4.6-8.5-9.7V5.7z",
      fill: c
    }),
    moon: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z",
      fill: c
    }),
    skip: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M5 5l9 7-9 7z",
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M17.5 5v14",
          fill: "none",
          stroke: c,
          strokeWidth: 2.4,
          strokeLinecap: "round"
        })
      ]
    }),
    arrow: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M4 12h14M13 6l6 6-6 6",
      fill: "none",
      stroke: c,
      strokeWidth: 2.4,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }),
    trash: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M4 7h16M10 3.5h4M6.5 7l1 13.5h9l1-13.5",
      fill: "none",
      stroke: c,
      strokeWidth: 1.9,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }),
    check: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M5 12.5l4.5 4.5L19 7.5",
      fill: "none",
      stroke: c,
      strokeWidth: 2.6,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }),
    close: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M6 6l12 12M18 6L6 18",
      fill: "none",
      stroke: c,
      strokeWidth: 2.2,
      strokeLinecap: "round"
    }),
    menu: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
      d: "M4 7h16M4 12h16M4 17h16",
      fill: "none",
      stroke: c,
      strokeWidth: 2,
      strokeLinecap: "round"
    }),
    star: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
      points: star(12, 12.6, 10, 4.2, 5),
      fill: c
    }),
    lock: (c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          x: 5,
          y: 10.5,
          width: 14,
          height: 10,
          rx: 2,
          fill: c
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5",
          fill: "none",
          stroke: c,
          strokeWidth: 2
        })
      ]
    })
  };
  function star(cx, cy, outer, inner, n) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = Math.PI * i / n - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    return pts;
  }
  function Icon({ name, size = 16, color = "#f0e8d6" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
      viewBox: "0 0 24 24",
      style: {
        width: size,
        height: size,
        flexShrink: 0
      },
      children: ICONS[name](color)
    });
  }

  // src/ui/kit.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
  var import_react2 = __toESM(require_react(), 1);
  function conic(progress, color) {
    const deg = Math.max(0, Math.min(1, progress)) * 360;
    const track = "rgba(0, 0, 0, 0.55)";
    return {
      type: "conic",
      stops: [
        {
          color,
          angle: 0
        },
        {
          color,
          angle: deg
        },
        {
          color: track,
          angle: deg
        },
        {
          color: track,
          angle: 360
        }
      ]
    };
  }
  function radial(inner, outer) {
    return {
      type: "radial",
      stops: [
        {
          color: inner
        },
        {
          color: outer
        }
      ]
    };
  }
  function Medallion({ size, inner = C.slateHi, outer = C.navy, progress, ring = C.science, children, style }) {
    const r = size / 2;
    const frame = Math.max(2, Math.round(size * 0.06));
    const face = /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
      style: {
        flexGrow: 1,
        borderRadius: r,
        backgroundGradient: radial(inner, outer),
        alignItems: "center",
        justifyContent: "center"
      },
      children
    });
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
      style: {
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: r,
        backgroundGradient: gilt,
        padding: frame,
        ...style
      },
      children: progress === void 0 ? face : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
        style: {
          flexGrow: 1,
          borderRadius: r,
          padding: Math.max(3, size * 0.075),
          backgroundGradient: conic(progress, ring)
        },
        children: face
      })
    });
  }
  function RoundButton({ icon, size = 38, color = C.goldHi, tip, tipSide = "bottom", active = false, onClick }) {
    const [hover, setHover] = (0, import_react2.useState)(false);
    const r = size / 2;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", {
      onClick,
      onPointerEnter: () => setHover(true),
      onPointerLeave: () => setHover(false),
      style: {
        width: size,
        height: size,
        borderRadius: r,
        padding: 2,
        backgroundGradient: gilt,
        boxShadow: active ? {
          color: "rgba(246, 228, 168, 0.55)",
          blurRadius: 10
        } : {
          color: "rgba(0, 0, 0, 0.5)",
          blurRadius: 6,
          yOffset: 2
        }
      },
      hoverStyle: {
        boxShadow: {
          color: "rgba(246, 228, 168, 0.45)",
          blurRadius: 12
        }
      },
      pressStyle: {
        transform: {
          scale: 0.93
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: {
            flexGrow: 1,
            borderRadius: r,
            alignItems: "center",
            justifyContent: "center",
            backgroundGradient: active ? radial("#3f6a92", C.slate) : radial(C.slateHi, C.navy)
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, {
            name: icon,
            size: size * 0.5,
            color
          })
        }),
        hover && tip && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tip, {
          text: tip,
          side: tipSide,
          offset: size + 6
        })
      ]
    });
  }
  function Tip({ text, side, offset }) {
    const place = side === "left" ? {
      right: offset,
      top: "50%",
      transform: {
        translateY: "-50%"
      }
    } : {
      left: "50%",
      transform: {
        translateX: "-50%"
      },
      ...side === "bottom" ? {
        top: offset
      } : {
        bottom: offset
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
      style: {
        positionType: "absolute",
        ...place,
        padding: {
          horizontal: 10,
          vertical: 5
        },
        backgroundColor: "rgba(6, 13, 21, 0.94)",
        border: 1,
        borderColor: C.goldLo,
        borderRadius: 3,
        globalZIndex: 10
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
        style: {
          fontSize: 12,
          color: C.text,
          lineBreak: "noWrap"
        },
        children: text
      })
    });
  }
  function Header({ children, color = C.gold }) {
    const rule = (angle) => ({
      flexGrow: 1,
      height: 1,
      backgroundGradient: {
        type: "linear",
        angle,
        stops: [
          {
            color: "rgba(217, 183, 108, 0)"
          },
          {
            color: C.goldLine
          }
        ]
      }
    });
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: rule(90)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
          style: {
            ...caps,
            color
          },
          children: children.toUpperCase()
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: rule(270)
        })
      ]
    });
  }
  function Bar({ value, width, color, height = 6 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
      style: {
        width,
        height,
        flexShrink: 0,
        borderRadius: height / 2,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        border: 1,
        borderColor: "rgba(255, 255, 255, 0.06)"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
        style: {
          width: Math.max(0, Math.min(1, value)) * (width - 2),
          height: height - 2,
          borderRadius: height / 2,
          backgroundColor: color,
          transition: {
            size: {
              duration: 600,
              easing: "easeOut"
            }
          }
        }
      })
    });
  }
  function Amount({ icon, color, value, size = 13 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, {
          name: icon,
          size: size + 3,
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
          style: {
            fontSize: size,
            fontWeight: "semibold",
            color
          },
          children: value
        })
      ]
    });
  }
  function CloseButton({ onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", {
      onClick,
      style: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        border: 1,
        borderColor: C.goldLo,
        backgroundColor: "rgba(6, 13, 21, 0.6)"
      },
      hoverStyle: {
        backgroundColor: C.slateHi,
        borderColor: C.gold
      },
      pressStyle: {
        transform: {
          scale: 0.92
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, {
        name: "close",
        size: 14,
        color: C.goldHi
      })
    });
  }
  function Crest({ civ, size }) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Medallion, {
      size,
      inner: tone(civ.color, 1.25),
      outer: tone(civ.color, 0.4),
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
        style: {
          fontFamily: Fonts.display,
          fontWeight: "bold",
          fontSize: size * 0.42,
          color: "#ffffff",
          textShadow: {
            color: "rgba(0, 0, 0, 0.6)",
            offsetX: 0,
            offsetY: 1
          }
        },
        children: civ.name[0]
      })
    });
  }

  // src/city/CityPanel.tsx
  var WIDTH = 360;
  function CityPanel({ city, civ, game, dispatch, onClose }) {
    const enter = useSlideIn(-80, 0);
    const mine = civ.player;
    const surplus = city.yields.food - city.population * 2;
    const built = game.built[city.id] ?? [];
    const housing = city.population + 2 + (built.includes("granary") ? 2 : 0);
    const amenities = 2 + (city.capital ? 2 : 0);
    const unhappy = Math.ceil(city.population / 2);
    const growth = (game.turn * 7 + city.population * 13) % 20 / 20;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
      style: {
        ...panel,
        ...enter,
        positionType: "absolute",
        left: 12,
        top: 44,
        bottom: 12,
        width: WIDTH,
        flexDirection: "column"
      },
      hoverStyle: OWNS_POINTER,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: {
              horizontal: 12,
              vertical: 10
            },
            borderRadius: {
              top: 3,
              right: 3
            },
            backgroundGradient: {
              type: "linear",
              angle: 180,
              stops: [
                {
                  color: tone(civ.color, 0.9)
                },
                {
                  color: tone(civ.color, 0.35)
                }
              ]
            },
            border: {
              bottom: 1
            },
            borderColor: C.gold
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Medallion, {
              size: 48,
              inner: C.slate,
              outer: C.ink,
              progress: growth,
              ring: C.food,
              children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                style: {
                  fontSize: 17,
                  fontWeight: "bold",
                  color: C.text
                },
                children: `${city.population}`
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
              style: {
                flexDirection: "column",
                flexGrow: 1,
                gap: 1
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6
                  },
                  children: [
                    city.capital && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, {
                      name: "star",
                      size: 15,
                      color: C.goldHi
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                      style: {
                        fontFamily: Fonts.display,
                        fontWeight: "bold",
                        fontSize: 21,
                        letterSpacing: 1.5,
                        color: "#ffffff",
                        textShadow: {
                          color: "rgba(0, 0, 0, 0.6)",
                          offsetX: 0,
                          offsetY: 1
                        }
                      },
                      children: city.name.toUpperCase()
                    })
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                  style: {
                    fontSize: 12,
                    color: tone(civ.color, 1.6)
                  },
                  children: city.capital ? `Capital of ${civ.name}` : civ.name
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CloseButton, {
              onClick: onClose
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            flexDirection: "row",
            justifyContent: "spaceBetween",
            padding: {
              horizontal: 16,
              vertical: 12
            },
            backgroundColor: "rgba(0, 0, 0, 0.25)"
          },
          children: YIELDS.map((y) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
            style: {
              flexDirection: "column",
              alignItems: "center",
              gap: 3
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, {
                name: y.key,
                size: 20,
                color: y.color
              }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                style: {
                  fontSize: 14,
                  fontWeight: "bold",
                  color: y.color
                },
                children: signed(y.key === "food" ? surplus : city.yields[y.key])
              })
            ]
          }, y.key))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 9,
            padding: 14
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, {
              icon: "food",
              color: C.food,
              label: "Growth",
              value: plural(Math.max(1, Math.ceil((1 - growth) * 12)), "turn"),
              fill: growth
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, {
              icon: "housing",
              color: "#7ec8c0",
              label: "Housing",
              value: `${city.population} / ${housing}`,
              fill: city.population / housing
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, {
              icon: "amenities",
              color: amenities >= unhappy ? C.good : C.bad,
              label: "Amenities",
              value: `${amenities} / ${unhappy}`,
              fill: Math.min(1, amenities / unhappy)
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Stat, {
              icon: "map",
              color: C.muted,
              label: "Territory",
              value: `${city.tiles} tiles`
            })
          ]
        }),
        mine ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Production, {
          city,
          game,
          dispatch
        }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            padding: 14
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
            style: {
              fontSize: 12,
              color: C.muted
            },
            children: `A city of ${civ.name}. Its works are hidden from you.`
          })
        })
      ]
    });
  }
  function Stat({ icon, color, label, value, fill }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, {
          name: icon,
          size: 16,
          color
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
          style: {
            width: 82,
            fontSize: 12,
            color: C.text
          },
          children: label
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            flexGrow: 1
          },
          children: fill !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Bar, {
            value: fill,
            width: 150,
            color
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
          style: {
            fontSize: 12,
            fontWeight: "semibold",
            color: C.text
          },
          children: value
        })
      ]
    });
  }
  function Production({ city, game, dispatch }) {
    const now = game.building[city.id];
    const current = item(now.item);
    const built = game.built[city.id] ?? [];
    const rate = city.yields.production;
    const groups = [
      "District",
      "Building",
      "Unit"
    ].map((kind) => ({
      kind,
      items: ITEMS.filter((i) => i.kind === kind && !built.includes(i.id))
    }));
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
      style: {
        flexDirection: "column",
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            padding: {
              horizontal: 14
            },
            flexDirection: "column",
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Header, {
              color: C.production,
              children: "Producing"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 10
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Medallion, {
                  size: 46,
                  progress: now.progress / current.cost,
                  ring: C.production,
                  children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, {
                    name: current.icon,
                    size: 20,
                    color: C.production
                  })
                }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
                  style: {
                    flexDirection: "column",
                    gap: 2,
                    flexGrow: 1
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                      style: {
                        fontSize: 14,
                        fontWeight: "semibold",
                        color: C.text
                      },
                      children: current.name
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                      style: {
                        fontSize: 12,
                        color: C.production
                      },
                      children: `${plural(turnsLeft(current.cost, now.progress, rate), "turn")} \xB7 ${fmt(now.progress)}/${current.cost}`
                    })
                  ]
                })
              ]
            }),
            built.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
              style: {
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 5
              },
              children: built.map((id) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
                style: {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  padding: {
                    horizontal: 7,
                    vertical: 3
                  },
                  borderRadius: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.06)"
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, {
                    name: item(id).icon,
                    size: 11,
                    color: C.muted
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                    style: {
                      fontSize: 11,
                      color: C.muted
                    },
                    children: item(id).name
                  })
                ]
              }, id))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Header, {
              children: "Choose production"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            overflowY: "scroll",
            flexDirection: "column",
            padding: {
              horizontal: 10,
              bottom: 10
            },
            scrollbar: {
              thickness: 6,
              position: "float",
              thumb: {
                backgroundColor: C.goldLo,
                borderRadius: 3
              }
            }
          },
          children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
            style: {
              flexDirection: "column",
              gap: 4,
              margin: {
                top: 8
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                style: {
                  ...caps,
                  color: C.muted,
                  margin: {
                    left: 4
                  }
                },
                children: `${g.kind}s`
              }),
              g.items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Choice, {
                it,
                turns: turnsLeft(it.cost, 0, rate),
                active: it.id === current.id,
                onClick: () => dispatch({
                  type: "produce",
                  city: city.id,
                  item: it.id
                })
              }, it.id))
            ]
          }, g.kind))
        })
      ]
    });
  }
  function Choice({ it, turns, active, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", {
      onClick,
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: {
          horizontal: 8,
          vertical: 6
        },
        borderRadius: 3,
        border: 1,
        borderColor: active ? C.production : "rgba(255, 255, 255, 0.06)",
        backgroundColor: active ? "rgba(240, 155, 61, 0.16)" : "rgba(255, 255, 255, 0.03)"
      },
      hoverStyle: {
        backgroundColor: "rgba(95, 191, 244, 0.14)",
        borderColor: C.slateHi
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            width: 30,
            height: 30,
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: C.ink,
            border: 1,
            borderColor: C.goldLo
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, {
            name: it.icon,
            size: 16,
            color: C.goldHi
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            flexDirection: "column",
            flexGrow: 1,
            gap: 1
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
              style: {
                fontSize: 13,
                fontWeight: "semibold",
                color: C.text
              },
              children: it.name
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
              style: {
                fontSize: 11,
                color: C.muted
              },
              children: it.effect
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            flexDirection: "column",
            alignItems: "flexEnd",
            gap: 1
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 3
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, {
                  name: "production",
                  size: 11,
                  color: C.production
                }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                  style: {
                    fontSize: 12,
                    color: C.production
                  },
                  children: `${it.cost}`
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
              style: {
                fontSize: 11,
                color: C.muted
              },
              children: plural(turns, "turn")
            })
          ]
        })
      ]
    });
  }

  // src/hud/ActionPanel.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
  var import_react3 = __toESM(require_react(), 1);
  var import_bevy_react3 = __toESM(require_bevy_react(), 1);
  var MAP_W = 300;
  var MAP_H = Math.round(MAP_W / 1.83);
  function ActionPanel({ label, busy, lens, onNext, onLens }) {
    const jump = (e) => bevy.map.jump({
      u: e.x,
      v: e.y
    });
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
      style: {
        positionType: "absolute",
        right: 12,
        bottom: 12,
        flexDirection: "column",
        alignItems: "flexEnd"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            margin: {
              bottom: 8,
              right: 8
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
              style: {
                ...panel,
                height: 34,
                padding: {
                  left: 16,
                  right: 30
                },
                margin: {
                  right: -22
                },
                alignItems: "center",
                borderRadius: 17
              },
              hoverStyle: OWNS_POINTER,
              children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
                style: {
                  fontFamily: Fonts.display,
                  fontWeight: "bold",
                  fontSize: 14,
                  letterSpacing: 1.5,
                  color: C.goldHi
                },
                children: label
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(EndTurn, {
              busy,
              onClick: onNext
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
          style: {
            ...panel,
            padding: 6,
            flexDirection: "column",
            gap: 6
          },
          hoverStyle: OWNS_POINTER,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                padding: {
                  left: 2
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(RoundButton, {
                  icon: "map",
                  size: 28,
                  tip: lens ? "Back to the terrain" : "Political lens",
                  tipSide: "top",
                  active: lens,
                  onClick: onLens
                }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
                  style: {
                    ...caps,
                    color: lens ? C.goldHi : C.muted
                  },
                  children: lens ? "POLITICAL LENS" : "TERRAIN"
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("portal", {
              target: "minimap",
              onPointerDown: jump,
              onPointerMove: jump,
              style: {
                width: MAP_W,
                height: MAP_H,
                border: 1,
                borderColor: C.goldLo,
                cursor: "crosshair"
              }
            })
          ]
        })
      ]
    });
  }
  function EndTurn({ busy, onClick }) {
    const spin = (0, import_bevy_react3.useSharedValue)(0);
    const [glow, setGlow] = (0, import_react3.useState)(false);
    (0, import_react3.useEffect)(() => {
      spin.value = 0;
      if (busy) spin.value = (0, import_bevy_react3.withRepeat)((0, import_bevy_react3.withTiming)(360, {
        duration: 700
      }));
    }, [
      busy,
      spin
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", {
      onClick,
      onPointerEnter: () => setGlow(true),
      onPointerLeave: () => setGlow(false),
      style: {
        width: 96,
        height: 96,
        borderRadius: 48,
        padding: 5,
        backgroundGradient: gilt,
        boxShadow: glow ? {
          color: "rgba(246, 228, 168, 0.6)",
          blurRadius: 22
        } : {
          color: "rgba(0, 0, 0, 0.6)",
          blurRadius: 14,
          yOffset: 4
        }
      },
      pressStyle: {
        transform: {
          scale: 0.95
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
        style: {
          flexGrow: 1,
          borderRadius: 43,
          padding: 6,
          backgroundGradient: {
            type: "conic",
            stops: [
              {
                color: "#7fd0ff"
              },
              {
                color: "#16446a"
              },
              {
                color: "#7fd0ff"
              },
              {
                color: "#16446a"
              },
              {
                color: "#7fd0ff"
              }
            ]
          },
          transform: {
            rotate: {
              animated: spin
            }
          }
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("node", {
          style: {
            flexGrow: 1,
            borderRadius: 37,
            alignItems: "center",
            justifyContent: "center",
            backgroundGradient: radial("#2f6a9c", "#0b1c2e")
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, {
            name: busy ? "moon" : "arrow",
            size: 34,
            color: C.goldHi
          })
        })
      })
    });
  }

  // src/hud/Banners.tsx
  var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);

  // src/hud/UnitPanel.tsx
  var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
  var MOVE = {
    icon: "arrow",
    name: "Move"
  };
  var FORTIFY = {
    icon: "shield",
    name: "Fortify"
  };
  var SLEEP = {
    icon: "moon",
    name: "Sleep"
  };
  var SKIP = {
    icon: "skip",
    name: "Skip turn"
  };
  var DELETE = {
    icon: "trash",
    name: "Delete unit"
  };
  var UNITS = {
    warrior: {
      name: "Warrior",
      role: "Melee",
      icon: "strength",
      strength: 20,
      moves: 2,
      orders: [
        MOVE,
        FORTIFY,
        SLEEP,
        SKIP,
        DELETE
      ]
    },
    archer: {
      name: "Archer",
      role: "Ranged",
      icon: "bow",
      strength: 15,
      ranged: 25,
      moves: 2,
      orders: [
        MOVE,
        {
          icon: "bow",
          name: "Ranged attack"
        },
        FORTIFY,
        SKIP,
        DELETE
      ]
    },
    scout: {
      name: "Scout",
      role: "Recon",
      icon: "eye",
      strength: 10,
      moves: 3,
      orders: [
        MOVE,
        {
          icon: "map",
          name: "Explore"
        },
        SLEEP,
        SKIP,
        DELETE
      ]
    },
    settler: {
      name: "Settler",
      role: "Civilian",
      icon: "flag",
      moves: 2,
      orders: [
        MOVE,
        {
          icon: "city",
          name: "Found city"
        },
        SLEEP,
        SKIP,
        DELETE
      ]
    },
    builder: {
      name: "Builder",
      role: "Civilian \xB7 3 charges",
      icon: "production",
      moves: 2,
      orders: [
        MOVE,
        {
          icon: "production",
          name: "Build farm"
        },
        SLEEP,
        SKIP,
        DELETE
      ]
    }
  };
  function UnitPanel({ unit, civ, onClose }) {
    const def = UNITS[unit.kind];
    const enter = useSlideIn(0, 70);
    const mine = civ.player;
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
      style: {
        ...panel,
        ...enter,
        positionType: "absolute",
        left: 12,
        bottom: 12,
        width: 400,
        padding: 12,
        flexDirection: "column",
        gap: 12
      },
      hoverStyle: OWNS_POINTER,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 14,
            alignItems: "center"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Medallion, {
              size: 88,
              inner: tone(civ.color, 1.3),
              outer: tone(civ.color, 0.35),
              children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, {
                name: def.icon,
                size: 42,
                color: "#ffffff"
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
              style: {
                flexDirection: "column",
                gap: 5,
                flexGrow: 1
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    alignItems: "center"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
                      style: {
                        flexGrow: 1,
                        fontFamily: Fonts.display,
                        fontWeight: "bold",
                        fontSize: 20,
                        letterSpacing: 1.5,
                        color: C.goldHi
                      },
                      children: def.name.toUpperCase()
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CloseButton, {
                      onClick: onClose
                    })
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
                  style: {
                    fontSize: 12,
                    color: C.muted
                  },
                  children: `${def.role} \xB7 ${civ.name}`
                }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    gap: 16,
                    margin: {
                      top: 2
                    }
                  },
                  children: [
                    def.strength && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Amount, {
                      icon: "strength",
                      color: C.text,
                      value: `${def.strength}`
                    }),
                    def.ranged && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Amount, {
                      icon: "bow",
                      color: C.text,
                      value: `${def.ranged}`
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Amount, {
                      icon: "movement",
                      color: C.text,
                      value: `${def.moves}/${def.moves}`
                    })
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Bar, {
                  value: mine ? 1 : 0.7,
                  width: 240,
                  height: 8,
                  color: C.good
                })
              ]
            })
          ]
        }),
        mine && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
          style: {
            flexDirection: "row",
            gap: 10,
            padding: {
              top: 10
            },
            border: {
              top: 1
            },
            borderColor: C.goldLine,
            justifyContent: "center"
          },
          children: def.orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(RoundButton, {
            icon: o.icon,
            tip: o.name,
            tipSide: "top",
            onClick: onClose
          }, o.name))
        })
      ]
    });
  }

  // src/hud/Banners.tsx
  var ANCHOR_SCALING = {
    baseDistance: 20,
    factor: 1.1,
    min: 0.7,
    max: 1
  };
  function Banners({ world, game, selection, onSelect }) {
    const civ = (id) => world.civs.find((c) => c.id === id);
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, {
      children: [
        world.cities.map((city) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CityBanner, {
          city,
          civ: civ(city.civ),
          game,
          selected: selection?.kind === "city" && selection.id === city.id,
          onClick: () => onSelect({
            kind: "city",
            id: city.id
          })
        }, city.id)),
        world.units.filter((u) => !u.hidden).map((unit) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(UnitFlag, {
          unit,
          civ: civ(unit.civ),
          selected: selection?.kind === "unit" && selection.id === unit.id,
          onClick: () => onSelect({
            kind: "unit",
            id: unit.id
          })
        }, unit.id))
      ]
    });
  }
  function CityBanner({ city, civ, game, selected, onClick }) {
    const producing = game.building[city.id];
    const it = producing && item(producing.item);
    const growth = (game.turn * 7 + city.population * 13) % 20 / 20;
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("anchor", {
      entity: city.entity,
      style: {
        flexDirection: "row",
        alignItems: "center",
        height: 42
      },
      scale: ANCHOR_SCALING,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: {
            width: 46,
            height: 46,
            borderRadius: 23,
            padding: 4,
            margin: {
              right: -12
            },
            backgroundGradient: conic(growth, C.food),
            zIndex: 1
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
            style: {
              flexGrow: 1,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: C.ink
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontSize: 20,
                fontWeight: "bold",
                color: C.text
              },
              children: `${city.population}`
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", {
          onClick,
          style: {
            height: 36,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            padding: {
              left: 21,
              right: it ? 21 : 15
            },
            borderRadius: 4,
            border: 1,
            borderColor: selected ? C.goldHi : tone(civ.color, 1.45),
            backgroundGradient: {
              type: "linear",
              angle: 180,
              stops: [
                {
                  color: tone(civ.color, 1.05)
                },
                {
                  color: tone(civ.color, 0.55)
                }
              ]
            },
            boxShadow: selected ? {
              color: "rgba(246, 228, 168, 0.7)",
              blurRadius: 15
            } : {
              color: "rgba(0, 0, 0, 0.55)",
              blurRadius: 9,
              yOffset: 3
            }
          },
          hoverStyle: {
            borderColor: C.goldHi
          },
          children: [
            city.capital && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, {
              name: "star",
              size: 18,
              color: C.goldHi
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 18,
                letterSpacing: 1.5,
                color: "#ffffff",
                textShadow: {
                  color: "rgba(0, 0, 0, 0.7)",
                  offsetX: 0,
                  offsetY: 1
                }
              },
              children: city.name.toUpperCase()
            })
          ]
        }),
        it && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
          style: {
            flexDirection: "column",
            alignItems: "center",
            margin: {
              left: -12
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
              style: {
                width: 42,
                height: 42,
                borderRadius: 21,
                padding: 4,
                backgroundGradient: conic(producing.progress / it.cost, C.production)
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
                style: {
                  flexGrow: 1,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: C.ink
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, {
                  name: it.icon,
                  size: 20,
                  color: C.production
                })
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
              style: {
                positionType: "absolute",
                top: 42,
                padding: {
                  horizontal: 6
                },
                borderRadius: 4,
                backgroundColor: "rgba(6, 13, 21, 0.85)"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                style: {
                  fontSize: 15,
                  color: C.production
                },
                children: `${turnsLeft(it.cost, producing.progress, city.yields.production)}`
              })
            })
          ]
        })
      ]
    });
  }
  function UnitFlag({ unit, civ, selected, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("anchor", {
      entity: unit.entity,
      offset: [
        0,
        1,
        0
      ],
      scale: ANCHOR_SCALING,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", {
        onClick,
        style: {
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          border: 3,
          borderColor: selected ? C.goldHi : "rgba(255, 255, 255, 0.75)",
          backgroundGradient: radial(tone(civ.color, 1.2), tone(civ.color, 0.45)),
          boxShadow: {
            color: "rgba(0, 0, 0, 0.55)",
            blurRadius: 8,
            yOffset: 3
          }
        },
        hoverStyle: {
          transform: {
            scale: 1.12
          }
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, {
          name: UNITS[unit.kind].icon,
          size: 22,
          color: "#ffffff"
        })
      })
    });
  }
  var FEATURES = {
    woods: "Woods",
    rainforest: "Rainforest"
  };
  function TileTooltip({ tile, cursor, world }) {
    const owner = world.civs.find((c) => c.id === tile.owner);
    const city = world.cities.find((c) => c.id === tile.city);
    const unit = world.units.find((u) => u.id === tile.unit);
    const relief = tile.mountains ? "Mountains" : tile.hills ? "Hills" : null;
    const name = [
      tile.terrain,
      relief,
      tile.feature && FEATURES[tile.feature]
    ].filter(Boolean).join(" \xB7 ");
    const yields = YIELDS.filter((y) => tile.yields[y.key] > 0);
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("anchor", {
      entity: cursor,
      style: {
        width: 2,
        height: 2,
        globalZIndex: 1
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
        style: {
          ...panel,
          positionType: "absolute",
          left: 34,
          bottom: 18,
          padding: {
            horizontal: 12,
            vertical: 9
          },
          flexDirection: "column",
          gap: 5,
          backgroundGradient: void 0,
          backgroundColor: C.navy
        },
        children: !tile.revealed ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            fontSize: 13,
            fontWeight: "semibold",
            color: C.muted,
            lineBreak: "noWrap"
          },
          children: "Unexplored lands"
        }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontSize: 13,
                fontWeight: "semibold",
                color: C.goldHi,
                lineBreak: "noWrap"
              },
              children: name
            }),
            tile.mountains ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontSize: 12,
                color: C.muted
              },
              children: "Impassable"
            }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
              style: {
                flexDirection: "row",
                gap: 10
              },
              children: [
                yields.map((y) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, {
                      name: y.key,
                      size: 14,
                      color: y.color
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                      style: {
                        fontSize: 12,
                        fontWeight: "semibold",
                        color: y.color
                      },
                      children: fmt(tile.yields[y.key])
                    })
                  ]
                }, y.key)),
                tile.farm && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                  style: {
                    fontSize: 12,
                    color: C.muted
                  },
                  children: "Farm"
                })
              ]
            }),
            owner && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontSize: 12,
                color: owner.color,
                lineBreak: "noWrap"
              },
              children: city ? `${owner.name} \xB7 ${city.name}` : owner.name
            }),
            unit && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontSize: 12,
                color: C.text
              },
              children: UNITS[unit.kind].name
            })
          ]
        })
      })
    });
  }

  // src/hud/Leaders.tsx
  var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
  var import_react4 = __toESM(require_react(), 1);
  var MOODS = [
    {
      name: "Friendly",
      color: C.good,
      note: "Declared friendship 12 turns ago"
    },
    {
      name: "Guarded",
      color: C.coin,
      note: "Covets your coastal cities"
    },
    {
      name: "Unfriendly",
      color: C.bad,
      note: "Denounced you for your borders"
    },
    {
      name: "Neutral",
      color: C.muted,
      note: "Trades with you now and then"
    }
  ];
  function Leaders({ rivals, game, onOpen }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("node", {
      style: {
        positionType: "absolute",
        right: 14,
        top: 42,
        flexDirection: "row",
        gap: 10
      },
      children: rivals.map((civ, i) => {
        const score2 = game.history[civ.id].score;
        return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Leader, {
          civ,
          mood: MOODS[i % MOODS.length],
          score: Math.round(score2[score2.length - 1]),
          onClick: onOpen
        }, civ.id);
      })
    });
  }
  function Leader({ civ, mood, score: score2, onClick }) {
    const [hover, setHover] = (0, import_react4.useState)(false);
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", {
      onClick,
      onPointerEnter: () => setHover(true),
      onPointerLeave: () => setHover(false),
      style: {
        width: 54,
        height: 60,
        alignItems: "flexStart"
      },
      hoverStyle: {
        transform: {
          scale: 1.06
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Crest, {
          civ,
          size: 54
        }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("node", {
          style: {
            positionType: "absolute",
            left: 20,
            top: 48,
            width: 14,
            height: 14,
            borderRadius: 7,
            border: 2,
            borderColor: C.navy,
            backgroundColor: mood.color
          }
        }),
        hover && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("node", {
          style: {
            ...panel,
            positionType: "absolute",
            right: 0,
            top: 66,
            width: 250,
            padding: 12,
            flexDirection: "column",
            gap: 4,
            globalZIndex: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("text", {
              style: {
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 16,
                color: C.goldHi
              },
              children: civ.leader
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("text", {
              style: {
                fontSize: 12,
                color: civ.color
              },
              children: civ.name
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("node", {
              style: {
                flexDirection: "row",
                gap: 6,
                margin: {
                  top: 6
                }
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("text", {
                  style: {
                    fontSize: 12,
                    fontWeight: "semibold",
                    color: mood.color
                  },
                  children: mood.name
                }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("text", {
                  style: {
                    fontSize: 12,
                    color: C.muted
                  },
                  children: `\xB7 score ${score2}`
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("text", {
              style: {
                fontSize: 12,
                color: C.muted
              },
              children: mood.note
            })
          ]
        })
      ]
    });
  }

  // src/hud/Notifications.tsx
  var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
  var import_react5 = __toESM(require_react(), 1);
  function Notifications({ notes, onDismiss }) {
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
      style: {
        positionType: "absolute",
        right: 16,
        top: 128,
        flexDirection: "column",
        alignItems: "flexEnd",
        gap: 10
      },
      children: notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Notice, {
        note: n,
        onDismiss: () => onDismiss(n.id)
      }, n.id))
    });
  }
  function Notice({ note, onDismiss }) {
    const [hover, setHover] = (0, import_react5.useState)(false);
    const enter = useSlideIn(90, 0);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
      style: {
        ...enter,
        transition: {
          layout: {
            duration: 300,
            easing: "easeOut"
          }
        }
      },
      children: [
        hover && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
          style: {
            ...panel,
            positionType: "absolute",
            right: 56,
            top: "50%",
            transform: {
              translateY: "-50%"
            },
            flexDirection: "column",
            padding: {
              horizontal: 12,
              vertical: 7
            },
            gap: 2
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
              style: {
                fontSize: 12,
                fontWeight: "semibold",
                color: note.color
              },
              children: note.title
            }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
              style: {
                fontSize: 12,
                color: C.text,
                lineBreak: "noWrap"
              },
              children: note.body
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", {
          onClick: onDismiss,
          onPointerEnter: () => setHover(true),
          onPointerLeave: () => setHover(false),
          style: {
            width: 46,
            height: 46,
            borderRadius: 23,
            padding: 2,
            backgroundGradient: gilt,
            boxShadow: {
              color: "rgba(0, 0, 0, 0.5)",
              blurRadius: 8,
              yOffset: 2
            }
          },
          hoverStyle: {
            transform: {
              scale: 1.08
            }
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
            style: {
              flexGrow: 1,
              borderRadius: 21,
              alignItems: "center",
              justifyContent: "center",
              backgroundGradient: radial(C.slateHi, C.ink)
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, {
              name: note.icon,
              size: 22,
              color: note.color
            })
          })
        })
      ]
    });
  }

  // src/hud/TopBar.tsx
  var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
  var import_react6 = __toESM(require_react(), 1);
  function TopBar({ game, player, net }) {
    const pay = income(game, player);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 32,
        flexDirection: "row",
        alignItems: "center",
        gap: 22,
        padding: {
          horizontal: 16
        },
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            {
              color: "#15233a"
            },
            {
              color: "#070d16"
            }
          ]
        },
        border: {
          bottom: 1
        },
        borderColor: C.goldLo,
        boxShadow: {
          color: "rgba(0, 0, 0, 0.6)",
          blurRadius: 10,
          yOffset: 2
        }
      },
      hoverStyle: OWNS_POINTER,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Amount, {
          icon: "science",
          color: C.science,
          value: signed(pay.science)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Amount, {
          icon: "culture",
          color: C.culture,
          value: signed(pay.culture)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Amount, {
          icon: "gold",
          color: C.coin,
          value: `${Math.floor(game.gold)} (${signed(net)})`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Amount, {
          icon: "faith",
          color: C.faith,
          value: `${Math.floor(game.faith)} (${signed(pay.faith)})`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
          style: {
            flexGrow: 1
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
          style: {
            ...caps,
            fontFamily: Fonts.display,
            fontSize: 13,
            color: C.goldHi
          },
          children: `TURN ${game.turn}`
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
          style: {
            fontSize: 13,
            color: C.text
          },
          children: year(game.turn)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Clock, {})
      ]
    });
  }
  function Clock() {
    const [now, setNow] = (0, import_react6.useState)(() => /* @__PURE__ */ new Date());
    (0, import_react6.useEffect)(() => {
      const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), 15e3);
      return () => clearInterval(id);
    }, []);
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
      style: {
        fontSize: 13,
        color: C.muted
      },
      children: `${hh}:${mm}`
    });
  }
  function LaunchBar({ onOpen, research }) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 12,
        top: 40,
        flexDirection: "row",
        gap: 10,
        padding: {
          horizontal: 10,
          vertical: 7
        },
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            {
              color: "rgba(27, 45, 68, 0.95)"
            },
            {
              color: "rgba(13, 24, 38, 0.95)"
            }
          ]
        },
        border: 1,
        borderColor: C.goldLo,
        borderRadius: 27,
        boxShadow: {
          color: "rgba(0, 0, 0, 0.5)",
          blurRadius: 10,
          yOffset: 3
        }
      },
      hoverStyle: OWNS_POINTER,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RoundButton, {
          icon: "science",
          color: C.science,
          tip: "Technology tree",
          active: !research,
          onClick: () => onOpen("tech")
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RoundButton, {
          icon: "chart",
          tip: "Reports",
          onClick: () => onOpen("reports")
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RoundButton, {
          icon: "trophy",
          tip: "World rankings",
          onClick: () => onOpen("rankings")
        })
      ]
    });
  }

  // src/hud/Trackers.tsx
  var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
  var WIDTH2 = 300;
  function Trackers({ game, player, onResearch }) {
    const pay = income(game, player);
    const research = game.research ? tech(game.research) : null;
    const banked = research ? game.progress[research.id] ?? 0 : 0;
    const civicName = CIVICS[game.civic % CIVICS.length];
    const civicNeed = civicCost(game.civic);
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
      style: {
        positionType: "absolute",
        left: 12,
        top: 100,
        width: WIDTH2,
        flexDirection: "column",
        gap: 8
      },
      children: [
        research ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Tracker, {
          title: "Research",
          color: C.science,
          icon: research.icon,
          name: research.name,
          progress: banked / research.cost,
          detail: plural(turnsLeft(research.cost, banked, pay.science), "turn"),
          hint: `Boost: ${research.boost}`,
          onClick: onResearch
        }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Tracker, {
          title: "Research",
          color: C.science,
          icon: "science",
          name: "Choose a research",
          progress: 0,
          detail: "Your scholars are idle",
          onClick: onResearch
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Tracker, {
          title: "Civic",
          color: C.culture,
          icon: "culture",
          name: civicName,
          progress: game.civicProgress / civicNeed,
          detail: plural(turnsLeft(civicNeed, game.civicProgress, pay.culture), "turn")
        })
      ]
    });
  }
  function Tracker({ title, color, icon, name, progress, detail, hint, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
      onClick,
      style: {
        ...panel,
        flexDirection: "column",
        padding: {
          horizontal: 10,
          top: 7,
          bottom: 9
        },
        gap: 6
      },
      hoverStyle: onClick ? {
        borderColor: C.gold
      } : OWNS_POINTER,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Header, {
          color,
          children: title
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Medallion, {
              size: 52,
              progress,
              ring: color,
              children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, {
                name: icon,
                size: 22,
                color
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
              style: {
                flexDirection: "column",
                gap: 2
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
                  style: {
                    fontSize: 14,
                    fontWeight: "semibold",
                    color: C.text
                  },
                  children: name
                }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
                  style: {
                    fontSize: 12,
                    color
                  },
                  children: detail
                }),
                hint && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("text", {
                  style: {
                    width: WIDTH2 - 90,
                    fontSize: 11,
                    color: C.muted
                  },
                  children: hint
                })
              ]
            })
          ]
        })
      ]
    });
  }

  // src/screens/Rankings.tsx
  var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
  var RANKING_TABS = [
    "Overall",
    "Science",
    "Culture",
    "Domination",
    "Religion",
    "Diplomatic"
  ];
  var VICTORIES = [
    {
      tab: "Science",
      icon: "science",
      color: C.science,
      goal: "Lead the world in learning and launch the first colony ship."
    },
    {
      tab: "Culture",
      icon: "culture",
      color: C.culture,
      goal: "Draw more visiting tourists than any rival has at home."
    },
    {
      tab: "Domination",
      icon: "strength",
      color: C.bad,
      goal: "Hold the original capital of every other civilization."
    },
    {
      tab: "Religion",
      icon: "faith",
      color: C.faith,
      goal: "See your religion followed by most cities of every civilization."
    },
    {
      tab: "Diplomatic",
      icon: "trophy",
      color: C.coin,
      goal: "Earn 20 diplomatic victory points in the world congress."
    }
  ];
  function standings(tab, world, game) {
    const sci = (c) => game.history[c.id].science.at(-1);
    const mine = world.civs[0];
    return world.civs.map((civ, i) => {
      const r = rng(i * 97 + 13);
      const sum = totals(world.cities, civ.id);
      switch (tab) {
        case "Science": {
          const known = civ.player ? game.researched.length : Math.min(TECHS.length - 1, Math.round(game.researched.length * (sci(civ) / sci(mine)) ** 0.5));
          return {
            civ,
            progress: known / TECHS.length,
            note: `${known} of ${TECHS.length} technologies`
          };
        }
        case "Culture": {
          const visiting = Math.round(sum.culture * 1.4 + r() * 6);
          const need = Math.round(30 + r() * 25);
          return {
            civ,
            progress: visiting / need,
            note: `${visiting} of ${need} tourists needed`
          };
        }
        case "Domination":
          return {
            civ,
            progress: 1 / world.civs.length,
            note: "Holds its own capital"
          };
        case "Religion": {
          const cities = 1 + Math.floor(sum.faith / 3 + r() * 3);
          return {
            civ,
            progress: cities / world.cities.length,
            note: `Followed in ${cities} of ${world.cities.length} cities`
          };
        }
        default: {
          const points = 2 + Math.floor(r() * 9);
          return {
            civ,
            progress: points / 20,
            note: `${points} of 20 victory points`
          };
        }
      }
    });
  }
  function Rankings({ tab, world, game }) {
    if (tab !== "Overall") {
      const v = VICTORIES.find((v2) => v2.tab === tab);
      const rows = standings(tab, world, game).sort((a, b) => b.progress - a.progress);
      return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
        style: {
          flexDirection: "column",
          padding: {
            horizontal: 40,
            vertical: 22
          },
          gap: 14
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
            style: {
              flexDirection: "row",
              alignItems: "center",
              gap: 14
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Medallion, {
                size: 58,
                ring: v.color,
                children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, {
                  name: v.icon,
                  size: 26,
                  color: v.color
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
                style: {
                  flexDirection: "column",
                  gap: 3
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                    style: {
                      fontFamily: Fonts.display,
                      fontWeight: "bold",
                      fontSize: 20,
                      color: C.goldHi
                    },
                    children: `${tab.toUpperCase()} VICTORY`
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                    style: {
                      fontSize: 13,
                      color: C.muted
                    },
                    children: v.goal
                  })
                ]
              })
            ]
          }),
          rows.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
            style: {
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: {
                horizontal: 14,
                vertical: 10
              },
              borderRadius: 3,
              backgroundColor: s.civ.player ? "rgba(217, 183, 108, 0.08)" : "rgba(255, 255, 255, 0.025)",
              border: 1,
              borderColor: s.civ.player ? C.goldLine : "rgba(255, 255, 255, 0.05)"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                style: {
                  width: 24,
                  fontFamily: Fonts.display,
                  fontWeight: "bold",
                  fontSize: 18,
                  color: C.gold
                },
                children: `${i + 1}`
              }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Crest, {
                civ: s.civ,
                size: 42
              }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
                style: {
                  width: 200,
                  flexDirection: "column",
                  gap: 2
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                    style: {
                      fontSize: 14,
                      fontWeight: "semibold",
                      color: C.text
                    },
                    children: s.civ.player ? `${s.civ.name} (you)` : s.civ.name
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                    style: {
                      fontSize: 12,
                      color: C.muted
                    },
                    children: s.civ.leader
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Bar, {
                value: s.progress,
                width: 380,
                height: 12,
                color: s.civ.color
              }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                style: {
                  fontSize: 12,
                  color: C.text
                },
                children: s.note
              })
            ]
          }, s.civ.id))
        ]
      });
    }
    const all = VICTORIES.map((v) => ({
      v,
      rows: standings(v.tab, world, game)
    }));
    const civs = [
      ...world.civs
    ].sort((a, b) => game.history[b.id].score.at(-1) - game.history[a.id].score.at(-1));
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
      style: {
        flexDirection: "column",
        padding: {
          horizontal: 40,
          vertical: 22
        },
        gap: 10
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
          style: {
            flexDirection: "row",
            padding: {
              horizontal: 14
            },
            gap: 16
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: {
                ...caps,
                width: 300,
                color: C.muted
              },
              children: "CIVILIZATION"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: {
                ...caps,
                width: 90,
                color: C.muted
              },
              children: "SCORE"
            }),
            VICTORIES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
              style: {
                width: 92,
                flexDirection: "row",
                gap: 5,
                alignItems: "center"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, {
                  name: v.icon,
                  size: 13,
                  color: v.color
                }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                  style: {
                    ...caps,
                    fontSize: 10,
                    color: C.muted
                  },
                  children: v.tab.toUpperCase()
                })
              ]
            }, v.tab))
          ]
        }),
        civs.map((civ, i) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            padding: {
              horizontal: 14,
              vertical: 10
            },
            borderRadius: 3,
            backgroundColor: civ.player ? "rgba(217, 183, 108, 0.08)" : "rgba(255, 255, 255, 0.025)",
            border: 1,
            borderColor: civ.player ? C.goldLine : "rgba(255, 255, 255, 0.05)"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
              style: {
                width: 300,
                flexDirection: "row",
                alignItems: "center",
                gap: 12
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                  style: {
                    width: 22,
                    fontFamily: Fonts.display,
                    fontWeight: "bold",
                    fontSize: 18,
                    color: C.gold
                  },
                  children: `${i + 1}`
                }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Crest, {
                  civ,
                  size: 46
                }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
                  style: {
                    flexDirection: "column",
                    gap: 2
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                      style: {
                        fontSize: 15,
                        fontWeight: "semibold",
                        color: C.text
                      },
                      children: civ.player ? `${civ.name} (you)` : civ.name
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                      style: {
                        fontSize: 12,
                        color: C.muted
                      },
                      children: civ.leader
                    })
                  ]
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: {
                width: 90,
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 22,
                color: C.goldHi
              },
              children: `${Math.round(game.history[civ.id].score.at(-1))}`
            }),
            all.map(({ v, rows }) => {
              const s = rows.find((r) => r.civ.id === civ.id);
              return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
                style: {
                  width: 92,
                  flexDirection: "column",
                  gap: 4
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Bar, {
                    value: s.progress,
                    width: 80,
                    height: 6,
                    color: v.color
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
                    style: {
                      fontSize: 11,
                      color: C.muted
                    },
                    children: `${Math.round(Math.min(1, s.progress) * 100)}%`
                  })
                ]
              }, v.tab);
            })
          ]
        }, civ.id))
      ]
    });
  }

  // src/screens/Reports.tsx
  var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
  var import_react8 = __toESM(require_react(), 1);

  // src/screens/charts.tsx
  var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
  var import_react7 = __toESM(require_react(), 1);
  var PAD = {
    left: 46,
    right: 14,
    top: 10,
    bottom: 24
  };
  var GRID = "#223247";
  var SURFACE = "#101d2e";
  function ticks(max) {
    const raw = Math.max(max, 1e-6) / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step2 = [
      1,
      2,
      2.5,
      5,
      10
    ].map((m) => m * mag).find((s) => s >= raw);
    const out = [];
    for (let v = 0; v < max + step2 * 0.999; v += step2) out.push(v);
    return out;
  }
  var compact = (v) => v >= 1e4 ? `${Math.round(v / 1e3)}k` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : fmt(v);
  function Axes({ width, height, grid, top, first, count }) {
    const plotW = width - PAD.left - PAD.right;
    const plotH = height - PAD.top - PAD.bottom;
    const every = count > 100 ? 25 : count > 40 ? 10 : 5;
    const turns = [];
    for (let t2 = Math.ceil(first / every) * every; t2 < first + count; t2 += every) turns.push(t2);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, {
      children: [
        grid.map((v) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
          style: {
            positionType: "absolute",
            left: 0,
            width: PAD.left - 8,
            top: PAD.top + plotH - v / top * plotH - 7,
            textAlign: "right",
            fontSize: 10,
            color: C.faint
          },
          children: compact(v)
        }, v)),
        turns.map((t2) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
          style: {
            positionType: "absolute",
            left: PAD.left + (t2 - first) / Math.max(1, count - 1) * plotW - 10,
            top: height - PAD.bottom + 6,
            fontSize: 10,
            color: C.faint
          },
          children: `${t2}`
        }, t2))
      ]
    });
  }
  function gridLines(grid, top, plotW, plotH) {
    return grid.map((v) => {
      const y = plotH - v / top * plotH;
      return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("line", {
        x1: 0,
        y1: y,
        x2: plotW,
        y2: y,
        stroke: GRID,
        strokeWidth: 1
      }, v);
    });
  }
  function LineChart({ series, width, height, first }) {
    const [hover, setHover] = (0, import_react7.useState)(null);
    const plotW = width - PAD.left - PAD.right;
    const plotH = height - PAD.top - PAD.bottom;
    const n = Math.max(2, ...series.map((s) => s.values.length));
    const grid = ticks(Math.max(0, ...series.flatMap((s) => s.values)));
    const top = grid[grid.length - 1];
    const x = (i) => i / (n - 1) * plotW;
    const y = (v) => plotH - v / top * plotH;
    const lead = series.find((s) => s.bold);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
      style: {
        width,
        height
      },
      onPointerLeave: () => setHover(null),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Axes, {
          width,
          height,
          grid,
          top,
          first,
          count: n
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", {
          viewBox: `0 0 ${plotW} ${plotH}`,
          style: {
            positionType: "absolute",
            left: PAD.left,
            top: PAD.top,
            width: plotW,
            height: plotH
          },
          children: [
            lead && // The leader's wash, pre-mixed opaque: bevy composites the
            // drawing in linear light, where a translucent fill lands far
            // brighter than on the web.
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("polygon", {
              points: [
                0,
                plotH,
                ...lead.values.flatMap((v, i) => [
                  x(i),
                  y(v)
                ]),
                x(lead.values.length - 1),
                plotH
              ],
              fill: mix(SURFACE, lead.color, 0.12)
            }),
            gridLines(grid, top, plotW, plotH),
            series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("polyline", {
              points: s.values.flatMap((v, i) => [
                x(i),
                y(v)
              ]),
              fill: "none",
              stroke: s.color,
              strokeWidth: s.bold ? 3 : 2,
              strokeLinejoin: "round",
              strokeLinecap: "round"
            }, s.id))
          ]
        }),
        hover !== null && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Readout, {
          rows: series.map((s) => ({
            s,
            value: s.values[hover],
            y: y(s.values[hover])
          })),
          turn: first + hover,
          left: PAD.left + x(hover),
          width,
          plotH
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Strip, {
          n,
          width: plotW,
          height: plotH,
          onHover: setHover
        })
      ]
    });
  }
  function Strip({ n, width, height, onHover }) {
    const step2 = width / (n - 1);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
      style: {
        positionType: "absolute",
        left: PAD.left - step2 / 2,
        top: PAD.top,
        width: width + step2,
        height,
        flexDirection: "row"
      },
      children: Array.from({
        length: n
      }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
        style: {
          flexGrow: 1,
          flexBasis: 0
        },
        onPointerEnter: () => onHover(i)
      }, i))
    });
  }
  function Readout({ rows, turn, left, width, plotH }) {
    const sorted = rows.filter((r) => r.value !== void 0).sort((a, b) => b.value - a.value);
    const flip = left > width * 0.68;
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: {
            positionType: "absolute",
            left,
            top: PAD.top,
            width: 1,
            height: plotH,
            backgroundColor: "rgba(246, 228, 168, 0.55)"
          }
        }),
        sorted.filter((r) => r.y !== void 0).map(({ s, y }) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: {
            positionType: "absolute",
            left: left - 5,
            top: PAD.top + y - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            border: 2,
            borderColor: SURFACE,
            backgroundColor: s.color
          }
        }, s.id)),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
          style: {
            positionType: "absolute",
            ...flip ? {
              right: width - left + 12
            } : {
              left: left + 12
            },
            top: PAD.top + 4,
            padding: {
              horizontal: 10,
              vertical: 8
            },
            flexDirection: "column",
            gap: 4,
            borderRadius: 3,
            border: 1,
            borderColor: C.goldLo,
            backgroundColor: "rgba(6, 13, 21, 0.94)"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
              style: {
                fontSize: 11,
                color: C.muted
              },
              children: `Turn ${turn}`
            }),
            sorted.map(({ s, value }) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 6
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
                  style: {
                    width: 10,
                    height: 2,
                    backgroundColor: s.color
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
                  style: {
                    width: 44,
                    fontSize: 12,
                    fontWeight: "bold",
                    color: C.text
                  },
                  children: compact(value)
                }),
                /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
                  style: {
                    fontSize: 11,
                    color: C.muted,
                    lineBreak: "noWrap"
                  },
                  children: s.name
                })
              ]
            }, s.id))
          ]
        })
      ]
    });
  }
  function StackedArea({ series, width, height, first }) {
    const [hover, setHover] = (0, import_react7.useState)(null);
    const LABELS = 70;
    const plotW = width - PAD.left - PAD.right - LABELS;
    const plotH = height - PAD.top - PAD.bottom;
    const n = Math.max(2, ...series.map((s) => s.values.length));
    const stacked = [];
    series.forEach((s, k) => stacked.push(s.values.map((v, i) => v + (k ? stacked[k - 1][i] : 0))));
    const grid = ticks(Math.max(...stacked[stacked.length - 1]));
    const top = grid[grid.length - 1];
    const x = (i) => i / (n - 1) * plotW;
    const y = (v) => plotH - v / top * plotH;
    const tops = stacked.map((line) => line.flatMap((v, i) => [
      x(i),
      y(v)
    ]));
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
      style: {
        width,
        height
      },
      onPointerLeave: () => setHover(null),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Axes, {
          width: width - LABELS,
          height,
          grid,
          top,
          first,
          count: n
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", {
          viewBox: `0 0 ${plotW} ${plotH}`,
          style: {
            positionType: "absolute",
            left: PAD.left,
            top: PAD.top,
            width: plotW,
            height: plotH
          },
          children: [
            gridLines(grid, top, plotW, plotH),
            series.map((s, k) => {
              const base = k ? backwards(tops[k - 1]) : [
                x(n - 1),
                plotH,
                0,
                plotH
              ];
              return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("polygon", {
                points: [
                  ...tops[k],
                  ...base
                ],
                fill: s.color
              }, s.id);
            }),
            tops.slice(0, -1).map((line, k) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("polyline", {
              points: line,
              fill: "none",
              stroke: SURFACE,
              strokeWidth: 2,
              strokeLinejoin: "round"
            }, k))
          ]
        }),
        series.map((s, k) => {
          const mid = (stacked[k][n - 1] + (k ? stacked[k - 1][n - 1] : 0)) / 2;
          return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
            style: {
              positionType: "absolute",
              left: PAD.left + plotW + 8,
              top: PAD.top + y(mid) - 7,
              fontSize: 11,
              color: C.muted
            },
            children: s.name
          }, s.id);
        }),
        hover !== null && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Readout, {
          rows: series.map((s) => ({
            s,
            value: s.values[hover]
          })),
          turn: first + hover,
          left: PAD.left + x(hover),
          width,
          plotH
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Strip, {
          n,
          width: plotW,
          height: plotH,
          onHover: setHover
        })
      ]
    });
  }
  function backwards(points) {
    const out = [];
    for (let i = points.length - 2; i >= 0; i -= 2) out.push(points[i], points[i + 1]);
    return out;
  }
  function Donut({ slices, size, label }) {
    const [hover, setHover] = (0, import_react7.useState)(null);
    const total = slices.reduce((n, s) => n + s.value, 0);
    const r1 = size / 2 - 2;
    const r0 = r1 * 0.62;
    let a = 0;
    const arcs = slices.map((s) => {
      const from = a;
      a += s.value / total * Math.PI * 2;
      return {
        ...s,
        from,
        to: a
      };
    });
    const shown = hover === null ? null : slices[hover];
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("node", {
      style: {
        width: size,
        height: size,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", {
          viewBox: `0 0 ${size} ${size}`,
          style: {
            positionType: "absolute",
            left: 0,
            top: 0,
            width: size,
            height: size
          },
          children: arcs.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", {
            d: sector(size / 2, size / 2, hover === i ? r0 - 3 : r0, hover === i ? r1 + 2 : r1, s.from, s.to, 2),
            fill: s.color,
            onPointerEnter: () => setHover(i),
            onPointerLeave: () => setHover((h) => h === i ? null : h)
          }, s.name))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
          style: {
            fontSize: 22,
            fontWeight: "bold",
            color: C.text
          },
          children: fmt(shown ? shown.value : total)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
          style: {
            fontSize: 11,
            color: C.muted
          },
          children: shown ? shown.name : label
        })
      ]
    });
  }
  function sector(cx, cy, r0, r1, a0, a1, gap) {
    const at2 = (r, a) => `${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`;
    const g1 = gap / 2 / r1;
    const g0 = gap / 2 / r0;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return [
      `M ${at2(r1, a0 + g1)}`,
      `A ${r1} ${r1} 0 ${large} 1 ${at2(r1, a1 - g1)}`,
      `L ${at2(r0, a1 - g0)}`,
      `A ${r0} ${r0} 0 ${large} 0 ${at2(r0, a0 + g0)}`,
      "Z"
    ].join(" ");
  }

  // src/screens/Reports.tsx
  var REPORT_TABS = [
    "Graphs",
    "Cities",
    "Demographics"
  ];
  function Reports({ tab, world, game, width, height }) {
    if (tab === "Cities") return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Cities, {
      world,
      game,
      width
    });
    if (tab === "Demographics") return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Demographics, {
      world,
      game
    });
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Graphs, {
      world,
      game,
      width,
      height
    });
  }
  function Graphs({ world, game, width, height }) {
    const [metric, setMetric] = (0, import_react8.useState)("score");
    const [hidden, setHidden] = (0, import_react8.useState)(/* @__PURE__ */ new Set());
    const player = world.civs[0];
    const def = METRICS.find((m) => m.key === metric);
    const series = world.civs.filter((c) => !hidden.has(c.id)).map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      values: game.history[c.id][metric],
      bold: c.player
    }));
    const chartW = width - 220;
    const own = game.history[player.id];
    const yields = STACK.map(({ key, color }) => ({
      id: key,
      name: METRICS.find((m) => m.key === key).name,
      color,
      values: own[key]
    }));
    const toggle = (id) => setHidden((h) => {
      const next = new Set(h);
      if (!next.delete(id)) next.add(id);
      return next;
    });
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      style: {
        flexDirection: "row",
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
          style: {
            width: 190,
            flexDirection: "column",
            gap: 4,
            padding: 14,
            border: {
              right: 1
            },
            borderColor: C.goldLine
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
              style: {
                ...caps,
                color: C.muted,
                margin: {
                  bottom: 6
                }
              },
              children: "MEASURE"
            }),
            METRICS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("button", {
              onClick: () => setMetric(m.key),
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: {
                  horizontal: 10,
                  vertical: 8
                },
                borderRadius: 3,
                backgroundColor: m.key === metric ? "rgba(217, 183, 108, 0.14)" : "rgba(0, 0, 0, 0)",
                border: {
                  left: 2
                },
                borderColor: m.key === metric ? C.gold : "rgba(0, 0, 0, 0)"
              },
              hoverStyle: {
                backgroundColor: "rgba(217, 183, 108, 0.1)"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, {
                  name: m.icon,
                  size: 16,
                  color: m.color
                }),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                  style: {
                    fontSize: 13,
                    color: m.key === metric ? C.goldHi : C.text
                  },
                  children: m.name
                })
              ]
            }, m.key))
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
          style: {
            flexDirection: "column",
            flexGrow: 1,
            padding: {
              horizontal: 16,
              vertical: 12
            },
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "flexEnd",
                gap: 10
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                  style: {
                    fontSize: 17,
                    fontWeight: "semibold",
                    color: C.text
                  },
                  children: def.name
                }),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                  style: {
                    fontSize: 12,
                    color: C.muted,
                    margin: {
                      bottom: 2
                    }
                  },
                  children: `${def.unit}, every civilization, by turn`
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
              style: {
                flexDirection: "row",
                gap: 6
              },
              children: world.civs.map((c) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Toggle, {
                civ: c,
                on: !hidden.has(c.id),
                onClick: () => toggle(c.id)
              }, c.id))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(LineChart, {
              series,
              width: chartW,
              height: Math.max(200, height - 430),
              first: 1
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Header, {
              children: `${player.name} \xB7 yields per turn`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
              style: {
                flexDirection: "row",
                gap: 14
              },
              children: [
                ...yields
              ].reverse().map((s) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
                style: {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                    style: {
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: s.color
                    }
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                    style: {
                      fontSize: 12,
                      color: C.muted
                    },
                    children: s.name
                  })
                ]
              }, s.id))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StackedArea, {
              series: yields,
              width: chartW,
              height: 170,
              first: 1
            })
          ]
        })
      ]
    });
  }
  function Toggle({ civ, on: on2, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("button", {
      onClick,
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: {
          horizontal: 10,
          vertical: 5
        },
        borderRadius: 12,
        border: 1,
        borderColor: on2 ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.06)",
        backgroundColor: on2 ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0)"
      },
      hoverStyle: {
        borderColor: C.gold
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
          style: {
            width: 12,
            height: civ.player ? 3 : 2,
            backgroundColor: on2 ? civ.color : C.faint
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontSize: 12,
            color: on2 ? C.text : C.faint
          },
          children: civ.player ? `${civ.name} (you)` : civ.name
        })
      ]
    });
  }
  var STACK = [
    {
      key: "culture",
      color: "#a05cc8"
    },
    {
      key: "gold",
      color: "#c08a1c"
    },
    {
      key: "science",
      color: "#2f8fc8"
    },
    {
      key: "faith",
      color: "#d3cdf2"
    }
  ];
  var COLS = [
    {
      key: "city",
      label: "City",
      width: 170
    },
    {
      key: "population",
      label: "Pop.",
      width: 64
    },
    ...YIELDS.map((y) => ({
      key: y.key,
      label: y.key === "production" ? "Prod." : y.name,
      width: 100
    }))
  ];
  var TABLE_W = COLS.reduce((n, c) => n + c.width, 0);
  function Cities({ world, game, width }) {
    const player = world.civs[0];
    const cities = world.cities.filter((c) => c.civ === player.id);
    const sum = totals(world.cities, player.id);
    const money = ledger(world, game);
    const slots = [
      "#3987e5",
      "#d95926",
      "#199e70",
      "#c98500",
      "#d55181"
    ];
    const sources = money.sources.map((s, i) => ({
      ...s,
      color: slots[i % slots.length]
    }));
    const food = (y, pop) => y.food - pop * 2;
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      style: {
        flexDirection: "row",
        flexGrow: 1,
        padding: 18,
        gap: 22
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
          style: {
            flexDirection: "column",
            width: width - 380,
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
              style: {
                flexDirection: "column",
                width: TABLE_W
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Row, {
                  header: true,
                  cells: COLS.map((c) => c.label)
                }),
                cities.map((c) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Row, {
                  star: c.capital,
                  cells: [
                    c.name,
                    `${c.population}`,
                    ...YIELDS.map((y) => fmt(y.key === "food" ? food(c.yields, c.population) : c.yields[y.key]))
                  ]
                }, c.id)),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Row, {
                  total: true,
                  cells: [
                    "Empire",
                    `${sum.population}`,
                    ...YIELDS.map((y) => fmt(y.key === "food" ? food(sum, sum.population) : sum[y.key]))
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                  style: {
                    width: TABLE_W,
                    fontSize: 11,
                    color: C.faint,
                    margin: {
                      top: 8
                    }
                  },
                  children: "Food is after what the citizens eat, two each. Every yield comes from the tiles a city works on the map."
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
              style: {
                margin: {
                  top: 14
                }
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Header, {
                children: "Where each yield comes from"
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
              style: {
                flexDirection: "row",
                flexWrap: "wrap",
                columnGap: 26,
                rowGap: 14
              },
              children: YIELDS.map((y) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Breakdown, {
                icon: y.key,
                name: y.name,
                color: y.color,
                rows: cities.map((c) => ({
                  name: c.name,
                  value: y.key === "food" ? Math.max(0, food(c.yields, c.population)) : c.yields[y.key]
                }))
              }, y.key))
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
          style: {
            flexDirection: "column",
            width: 320,
            gap: 12,
            alignItems: "center"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Header, {
              children: "Gold per turn"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Donut, {
              slices: sources,
              size: 190,
              label: "gold income"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
              style: {
                flexDirection: "column",
                gap: 4,
                width: 270
              },
              children: [
                sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Ledger, {
                  swatch: s.color,
                  name: s.name,
                  value: signed(s.value)
                }, s.name)),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                  style: {
                    height: 1,
                    backgroundColor: C.goldLine,
                    margin: {
                      vertical: 4
                    }
                  }
                }),
                money.upkeep.map((u) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Ledger, {
                  name: `${u.name} upkeep`,
                  value: signed(-u.value)
                }, u.name)),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                  style: {
                    height: 1,
                    backgroundColor: C.goldLine,
                    margin: {
                      vertical: 4
                    }
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Ledger, {
                  name: "Net per turn",
                  value: signed(money.net),
                  strong: true
                })
              ]
            })
          ]
        })
      ]
    });
  }
  function Breakdown({ icon, name, color, rows }) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    const BAR = 150;
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      style: {
        width: 268,
        flexDirection: "column",
        gap: 5
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, {
              name: icon,
              size: 14,
              color
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
              style: {
                ...caps,
                color: C.muted
              },
              children: name.toUpperCase()
            })
          ]
        }),
        rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            height: 16
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
              style: {
                width: 74,
                fontSize: 11,
                color: C.muted,
                lineBreak: "noWrap"
              },
              children: r.name
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
              style: {
                width: Math.max(2, r.value / max * BAR),
                height: 10,
                borderRadius: {
                  top: 0,
                  right: 3,
                  bottom: 3,
                  left: 0
                },
                backgroundColor: color
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
              style: {
                fontSize: 11,
                color: C.text
              },
              children: fmt(r.value)
            })
          ]
        }, r.name))
      ]
    });
  }
  function Row({ cells, header, total, star: star2 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        height: header ? 34 : 36,
        border: {
          bottom: 1
        },
        borderColor: total ? C.goldLine : "rgba(255, 255, 255, 0.06)",
        backgroundColor: total ? "rgba(217, 183, 108, 0.08)" : "rgba(0, 0, 0, 0)"
      },
      hoverStyle: header ? void 0 : {
        backgroundColor: "rgba(95, 191, 244, 0.08)"
      },
      children: cells.map((cell, i) => {
        const col = COLS[i];
        const y = YIELDS.find((y2) => y2.key === col.key);
        return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
          style: {
            width: col.width,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: i === 0 ? "flexStart" : "flexEnd",
            gap: 5,
            padding: {
              horizontal: 8
            }
          },
          children: [
            header && y && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, {
              name: y.key,
              size: 14,
              color: y.color
            }),
            !header && i === 0 && star2 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, {
              name: "star",
              size: 12,
              color: C.goldHi
            }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
              style: header ? {
                ...caps,
                fontSize: 10.5,
                color: C.muted
              } : {
                fontSize: 13,
                fontWeight: total || i === 0 ? "semibold" : "normal",
                color: C.text,
                lineBreak: "noWrap"
              },
              children: header ? cell.toUpperCase() : cell
            })
          ]
        }, col.key);
      })
    });
  }
  function Ledger({ swatch, name, value, strong }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
          style: {
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: swatch ?? "rgba(0, 0, 0, 0)"
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            flexGrow: 1,
            fontSize: 12,
            color: strong ? C.text : C.muted
          },
          children: name
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontSize: 12,
            fontWeight: strong ? "bold" : "semibold",
            color: C.text
          },
          children: value
        })
      ]
    });
  }
  var DEMOGRAPHICS = [
    {
      name: "Population",
      unit: "citizens",
      of: (c, w) => totals(w.cities, c).population * 1e3
    },
    {
      name: "Crop yield",
      unit: "bushels",
      of: (c, w) => totals(w.cities, c).food * 120
    },
    {
      name: "Manufactured goods",
      unit: "tons",
      of: (c, w) => totals(w.cities, c).production * 45
    },
    {
      name: "GNP",
      unit: "gold",
      of: (c, w) => totals(w.cities, c).gold * 260
    },
    {
      name: "Literacy",
      unit: "%",
      of: (c, _, g) => Math.min(96, 18 + g.history[c].science.at(-1) * 1.6)
    },
    {
      name: "Soldiers",
      unit: "troops",
      of: (c, _, g) => g.history[c].military.at(-1) * 520
    },
    {
      name: "Land",
      unit: "sq. mi",
      of: (c, w) => w.cities.filter((x) => x.civ === c).reduce((n, x) => n + x.tiles, 0) * 1900
    }
  ];
  function Demographics({ world, game }) {
    const player = world.civs[0];
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      style: {
        flexDirection: "column",
        padding: 18
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
          style: {
            flexDirection: "row",
            height: 30,
            alignItems: "center",
            border: {
              bottom: 1
            },
            borderColor: C.goldLine
          },
          children: [
            "Measure",
            "You",
            "Rank",
            "The world",
            "Best",
            "Average"
          ].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
            style: {
              ...caps,
              fontSize: 10.5,
              color: C.muted,
              width: [
                190,
                110,
                70,
                360,
                170,
                110
              ][i]
            },
            children: h.toUpperCase()
          }, h))
        }),
        DEMOGRAPHICS.map((d) => {
          const values = world.civs.map((c) => ({
            civ: c,
            v: d.of(c.id, world, game)
          }));
          const sorted = [
            ...values
          ].sort((a, b) => b.v - a.v);
          const mine = values[0].v;
          const rank = sorted.findIndex((x) => x.civ.id === player.id) + 1;
          const max = sorted[0].v;
          const avg = values.reduce((n, x) => n + x.v, 0) / values.length;
          return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
            style: {
              flexDirection: "row",
              alignItems: "center",
              height: 52,
              border: {
                bottom: 1
              },
              borderColor: "rgba(255, 255, 255, 0.06)"
            },
            hoverStyle: {
              backgroundColor: "rgba(95, 191, 244, 0.06)"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                style: {
                  width: 190,
                  fontSize: 13,
                  fontWeight: "semibold",
                  color: C.text,
                  lineBreak: "noWrap"
                },
                children: d.name
              }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                style: {
                  width: 110,
                  fontSize: 13,
                  color: C.text
                },
                children: `${compact(mine)}${d.unit === "%" ? "%" : ""}`
              }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                style: {
                  width: 70
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                  style: {
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: rank === 1 ? "rgba(217, 183, 108, 0.25)" : "rgba(255, 255, 255, 0.06)",
                    border: 1,
                    borderColor: rank === 1 ? C.gold : "rgba(255, 255, 255, 0.12)"
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                    style: {
                      fontSize: 13,
                      fontWeight: "bold",
                      color: rank === 1 ? C.goldHi : C.text
                    },
                    children: `${rank}`
                  })
                })
              }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
                style: {
                  width: 360,
                  height: 20
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                    style: {
                      positionType: "absolute",
                      left: 0,
                      right: 30,
                      top: 9,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.1)"
                    }
                  }),
                  values.map(({ civ, v }) => {
                    const size = civ.player ? 16 : 12;
                    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                      style: {
                        positionType: "absolute",
                        left: v / max * 330 - size / 2,
                        top: 10 - size / 2,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        border: 2,
                        borderColor: civ.player ? C.goldHi : "#101d2e",
                        backgroundColor: civ.color,
                        zIndex: civ.player ? 1 : 0
                      }
                    }, civ.id);
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
                style: {
                  width: 170,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("node", {
                    style: {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: sorted[0].civ.color
                    }
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                    style: {
                      fontSize: 12,
                      color: C.text,
                      lineBreak: "noWrap"
                    },
                    children: `${sorted[0].civ.name} \xB7 ${compact(max)}`
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
                style: {
                  width: 110,
                  fontSize: 12,
                  color: C.muted
                },
                children: compact(avg)
              })
            ]
          }, d.name);
        })
      ]
    });
  }

  // src/screens/Screen.tsx
  var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
  function Screen({ title, width, height, tabs, tab, onTab, onClose, children }) {
    const enter = useFadeIn();
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
      style: {
        positionType: "absolute",
        left: 0,
        right: 0,
        top: 32,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(3, 8, 14, 0.55)",
        backdropFilter: {
          name: "blur",
          params: {
            radius: 8
          }
        }
      },
      hoverStyle: OWNS_POINTER,
      children: /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
        style: {
          ...panel,
          ...enter,
          width,
          height,
          flexDirection: "column",
          border: 1.5,
          borderColor: C.gold
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
            style: {
              height: 54,
              flexShrink: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              border: {
                bottom: 1
              },
              borderColor: C.goldLine,
              backgroundGradient: {
                type: "linear",
                angle: 180,
                stops: [
                  {
                    color: "#24405e"
                  },
                  {
                    color: "#132438"
                  }
                ]
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                style: {
                  fontFamily: Fonts.display,
                  fontWeight: "bold",
                  fontSize: 24,
                  letterSpacing: 4,
                  color: C.goldHi,
                  textShadow: {
                    color: "rgba(0, 0, 0, 0.6)",
                    offsetX: 0,
                    offsetY: 2
                  }
                },
                children: title.toUpperCase()
              }),
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
                style: {
                  positionType: "absolute",
                  right: 14,
                  top: 12
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(CloseButton, {
                  onClick: onClose
                })
              })
            ]
          }),
          tabs && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
            style: {
              flexDirection: "row",
              justifyContent: "center",
              gap: 4,
              padding: {
                top: 8
              },
              border: {
                bottom: 1
              },
              borderColor: C.goldLine,
              flexShrink: 0
            },
            children: tabs.map((t2) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", {
              onClick: () => onTab?.(t2),
              style: {
                padding: {
                  horizontal: 18,
                  vertical: 9
                },
                border: {
                  bottom: 2
                },
                borderColor: t2 === tab ? C.gold : "rgba(0, 0, 0, 0)",
                backgroundColor: t2 === tab ? "rgba(217, 183, 108, 0.1)" : "rgba(0, 0, 0, 0)"
              },
              hoverStyle: {
                backgroundColor: "rgba(217, 183, 108, 0.16)"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                style: {
                  ...caps,
                  fontSize: 12,
                  color: t2 === tab ? C.goldHi : C.muted
                },
                children: t2.toUpperCase()
              })
            }, t2))
          }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
            style: {
              flexGrow: 1,
              flexShrink: 1,
              minHeight: 0,
              flexDirection: "column"
            },
            children
          })
        ]
      })
    });
  }

  // src/screens/TechTree.tsx
  var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
  var import_react9 = __toESM(require_react(), 1);
  var COL = 266;
  var NODE_W = 226;
  var NODE_H = 60;
  var PAD2 = 26;
  var HEAD = 46;
  var ROWS = 7;
  var COLUMNS = ERAS.reduce((n, e) => n + e.columns, 0);
  var WIDTH3 = PAD2 * 2 + COLUMNS * COL - (COL - NODE_W);
  var rowFor = (height) => Math.max(72, Math.min(104, (height - HEAD - 60) / ROWS));
  var at = (t2, row) => ({
    x: PAD2 + t2.col * COL,
    y: HEAD + 14 + t2.row * row
  });
  function TechTree({ game, player, dispatch, width, height }) {
    const current = game.research ? tech(game.research) : null;
    const row = rowFor(height);
    const max = Math.max(0, WIDTH3 - width);
    const [scroll, setScroll] = (0, import_react9.useState)(() => Math.min(max, Math.max(0, at(current ?? tech("machinery"), row).x - width * 0.45)));
    const science = income(game, player).science;
    const state = (t2) => game.researched.includes(t2.id) ? "done" : t2.id === game.research ? "current" : t2.requires.every((r) => game.researched.includes(r)) ? "open" : "locked";
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
      onWheel: (e) => setScroll((s) => Math.min(max, Math.max(0, s - (e.deltaY + e.deltaX) * 90))),
      scrollLeft: scroll,
      style: {
        flexGrow: 1,
        overflowX: "scroll",
        overflowY: "hidden",
        scrollbar: {
          thickness: 8,
          thumb: {
            backgroundColor: C.goldLo,
            borderRadius: 4
          },
          track: {
            backgroundColor: "rgba(0, 0, 0, 0.3)"
          }
        },
        transition: {
          scroll: {
            duration: 260,
            easing: "easeOut"
          }
        },
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            {
              color: "#10243a"
            },
            {
              color: "#0a1522"
            }
          ]
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("node", {
        style: {
          width: WIDTH3,
          height: "100%",
          flexShrink: 0
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Eras, {}),
          TECHS.flatMap((t2) => t2.requires.map((r) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Wire, {
            from: tech(r),
            to: t2,
            row,
            lit: game.researched.includes(r)
          }, `${r}-${t2.id}`))),
          TECHS.map((t2) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(TechNode, {
            t: t2,
            row,
            state: state(t2),
            progress: (game.progress[t2.id] ?? 0) / t2.cost,
            turns: turnsLeft(t2.cost, game.progress[t2.id] ?? 0, science),
            onClick: () => dispatch({
              type: "research",
              tech: t2.id
            })
          }, t2.id))
        ]
      })
    });
  }
  var edge = (c) => c === 0 ? 0 : c === COLUMNS ? WIDTH3 : PAD2 + c * COL - (COL - NODE_W) / 2;
  function Eras() {
    let col = 0;
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_jsx_runtime15.Fragment, {
      children: ERAS.map((era, i) => {
        const left = edge(col);
        const right = edge(col += era.columns);
        return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
          style: {
            positionType: "absolute",
            left,
            width: right - left,
            top: 0,
            bottom: 0,
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: i % 2 ? "rgba(255, 255, 255, 0.025)" : "rgba(0, 0, 0, 0)",
            border: {
              right: 1
            },
            borderColor: C.goldLine
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
            style: {
              fontFamily: Fonts.display,
              fontWeight: "bold",
              fontSize: 15,
              letterSpacing: 3,
              color: C.gold,
              margin: {
                top: 14
              }
            },
            children: era.name.toUpperCase()
          })
        }, era.name);
      })
    });
  }
  function Wire({ from, to, row, lit }) {
    const a = at(from, row);
    const b = at(to, row);
    const x1 = a.x + NODE_W;
    const y1 = a.y + NODE_H / 2;
    const x2 = b.x;
    const y2 = b.y + NODE_H / 2;
    const elbow = x2 - (COL - NODE_W) / 2;
    const color = lit ? "rgba(217, 183, 108, 0.75)" : "rgba(98, 119, 141, 0.55)";
    const seg = (left, top, width, height) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
      style: {
        positionType: "absolute",
        left,
        top,
        width,
        height,
        backgroundColor: color
      }
    });
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, {
      children: [
        seg(x1, y1 - 1, elbow - x1, 2),
        seg(elbow - 1, Math.min(y1, y2) - 1, 2, Math.abs(y2 - y1) + 2),
        seg(elbow, y2 - 1, x2 - elbow, 2)
      ]
    });
  }
  var LOOK = {
    done: {
      top: "#4b3c1e",
      bottom: "#251c0e",
      border: C.gold,
      text: C.goldHi
    },
    current: {
      top: "#245b88",
      bottom: "#123150",
      border: C.science,
      text: "#ffffff"
    },
    open: {
      top: "#1f3954",
      bottom: "#101f30",
      border: C.slateHi,
      text: C.text
    },
    locked: {
      top: "#141e2a",
      bottom: "#0b1119",
      border: "#273443",
      text: C.faint
    }
  };
  function TechNode({ t: t2, row, state, progress, turns, onClick }) {
    const [hover, setHover] = (0, import_react9.useState)(false);
    const look = LOOK[state];
    const { x, y } = at(t2, row);
    const status = state === "done" ? "Researched" : state === "locked" ? `${plural(turns, "turn")} \xB7 locked` : plural(turns, "turn");
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", {
      onClick: state === "done" ? void 0 : onClick,
      onPointerEnter: () => setHover(true),
      onPointerLeave: () => setHover(false),
      style: {
        positionType: "absolute",
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: {
          left: 5,
          right: 10
        },
        borderRadius: NODE_H / 2,
        border: 1.5,
        borderColor: look.border,
        backgroundGradient: {
          type: "linear",
          angle: 180,
          stops: [
            {
              color: look.top
            },
            {
              color: look.bottom
            }
          ]
        },
        boxShadow: state === "current" ? {
          color: "rgba(95, 191, 244, 0.55)",
          blurRadius: 16
        } : {
          color: "rgba(0, 0, 0, 0.45)",
          blurRadius: 6,
          yOffset: 2
        }
      },
      hoverStyle: {
        borderColor: C.goldHi
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Medallion, {
          size: 48,
          inner: state === "done" ? "#6d5426" : C.slateHi,
          outer: state === "done" ? "#2d220f" : C.ink,
          progress: state === "current" ? progress : void 0,
          ring: C.science,
          children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, {
            name: state === "done" ? "check" : t2.icon,
            size: 20,
            color: state === "done" ? C.goldHi : state === "locked" ? C.faint : C.science
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 2,
            flexGrow: 1,
            flexShrink: 1
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
              style: {
                ...caps,
                fontSize: 11,
                letterSpacing: 1.1,
                color: look.text,
                lineBreak: "noWrap"
              },
              children: t2.name.toUpperCase()
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
              style: {
                fontSize: 11,
                color: state === "current" ? C.science : C.muted
              },
              children: status
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
              style: {
                flexDirection: "row",
                gap: 3
              },
              children: t2.unlocks.map((u) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
                style: {
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: tone(look.bottom, 0.6),
                  border: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)"
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Icon, {
                  name: u.icon,
                  size: 12,
                  color: state === "locked" ? C.faint : C.goldHi
                })
              }, u.name))
            })
          ]
        }),
        hover && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Tip, {
          text: `${t2.unlocks.map((u) => u.name).join(", ")} \xB7 Boost: ${t2.boost}`,
          side: "bottom",
          offset: NODE_H + 4
        })
      ]
    });
  }

  // src/App.tsx
  function App() {
    const win = useWindowSize();
    const [world, setWorld] = (0, import_react10.useState)(null);
    (0, import_react10.useEffect)(() => {
      bevy.map.world().then(setWorld);
    }, []);
    if (!world || win.width === 0) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Civilization, {
      world,
      width: win.width,
      height: win.height
    });
  }
  var TITLES = {
    tech: "Technology",
    reports: "Reports",
    rankings: "World Rankings"
  };
  function Civilization({ world, width, height }) {
    const [game, dispatch] = (0, import_react10.useReducer)((g, a) => step(world, g, a), world, newGame);
    const [screen, setScreen] = (0, import_react10.useState)(null);
    const [tabs, setTabs] = (0, import_react10.useState)({
      reports: REPORT_TABS[0],
      rankings: RANKING_TABS[0]
    });
    const [selection, setSelection] = (0, import_react10.useState)(null);
    const [hover, setHover] = (0, import_react10.useState)(null);
    const [busy, setBusy] = (0, import_react10.useState)(false);
    const [lens, setLens] = (0, import_react10.useState)(false);
    const player = world.civs[0];
    const civ = (id) => world.civs.find((c) => c.id === id);
    const city = selection?.kind === "city" ? world.cities.find((c) => c.id === selection.id) : void 0;
    const unit = selection?.kind === "unit" ? world.units.find((u) => u.id === selection.id) : void 0;
    const select = (s) => {
      setSelection(s);
      const at2 = s?.kind === "city" ? world.cities.find((c) => c.id === s.id) : world.units.find((u) => u.id === s?.id);
      const tile = at2 ? {
        col: at2.col,
        row: at2.row
      } : null;
      bevy.map.select(tile);
      if (tile && s?.kind === "city") bevy.map.focus({
        tile,
        zoom: 0.2
      });
    };
    const nextTurn2 = () => {
      if (busy) return;
      if (!game.research) return setScreen("tech");
      setBusy(true);
      setTimeout(() => {
        dispatch({
          type: "turn"
        });
        setBusy(false);
      }, 650);
    };
    const toggleLens = () => {
      setLens(!lens);
      bevy.map.lens({
        political: !lens
      });
    };
    useEvent("map.hover", setHover);
    useEvent("map.click", (tile) => select(tile.settlement ? {
      kind: "city",
      id: tile.settlement
    } : tile.unit ? {
      kind: "unit",
      id: tile.unit
    } : null));
    useEvent("keyDown", (e) => {
      if (e.repeat) return;
      if (e.key === "Escape") {
        if (screen) setScreen(null);
        else select(null);
      }
      if (e.key === "Enter" && !screen) nextTurn2();
    });
    useDebug("screen", (s) => setScreen(s === "none" ? null : s));
    useDebug("tab", (t2) => setTabs((tabs2) => REPORT_TABS.includes(t2) ? {
      ...tabs2,
      reports: t2
    } : {
      ...tabs2,
      rankings: t2
    }));
    useDebug("city", (id) => select({
      kind: "city",
      id
    }));
    useDebug("unit", (id) => select({
      kind: "unit",
      id
    }));
    useDebug("turn", () => dispatch({
      type: "turn"
    }));
    useDebug("lens", toggleLens);
    const boxW = screen === "tech" ? width - 60 : Math.min(1280, width - 60);
    const boxH = height - 32 - 40;
    const label = busy ? "PLEASE WAIT" : game.research ? "NEXT TURN" : "CHOOSE RESEARCH";
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
      style: {
        width: "100%",
        height: "100%"
      },
      children: [
        !screen && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Banners, {
              world,
              game,
              selection,
              onSelect: select
            }),
            hover && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(TileTooltip, {
              tile: hover,
              cursor: world.cursor,
              world
            }),
            city ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(CityPanel, {
              city,
              civ: civ(city.civ),
              game,
              dispatch,
              onClose: () => select(null)
            }, city.id) : /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, {
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(LaunchBar, {
                  onOpen: setScreen,
                  research: !!game.research
                }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Trackers, {
                  game,
                  player: player.id,
                  onResearch: () => setScreen("tech")
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Leaders, {
              rivals: world.civs.slice(1),
              game,
              onOpen: () => setScreen("rankings")
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Notifications, {
              notes: game.notes,
              onDismiss: (id) => dispatch({
                type: "dismiss",
                id
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ActionPanel, {
              label,
              busy,
              lens,
              onNext: nextTurn2,
              onLens: toggleLens
            }),
            unit && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(UnitPanel, {
              unit,
              civ: civ(unit.civ),
              onClose: () => select(null)
            }, unit.id)
          ]
        }),
        screen && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Screen, {
          title: TITLES[screen],
          width: boxW,
          height: boxH,
          tabs: screen === "reports" ? REPORT_TABS : screen === "rankings" ? RANKING_TABS : void 0,
          tab: screen === "reports" ? tabs.reports : tabs.rankings,
          onTab: (t2) => setTabs((tabs2) => ({
            ...tabs2,
            [screen]: t2
          })),
          onClose: () => setScreen(null),
          children: screen === "tech" ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(TechTree, {
            game,
            player: player.id,
            dispatch,
            width: boxW,
            height: boxH
          }) : screen === "reports" ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Reports, {
            tab: tabs.reports,
            world,
            game,
            width: boxW,
            height: boxH
          }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Rankings, {
            tab: tabs.rankings,
            world,
            game
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(TopBar, {
          game,
          player: player.id,
          net: ledger(world, game).net
        })
      ]
    });
  }

  // src/index.tsx
  (0, import_bevy_react4.mount)(/* @__PURE__ */ (0, import_jsx_runtime17.jsx)(App, {}));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidmVuZG9yLWdsb2JhbDpiZXZ5LXJlYWN0L2pzeC1ydW50aW1lIiwgInZlbmRvci1nbG9iYWw6YmV2eS1yZWFjdCIsICJ2ZW5kb3ItZ2xvYmFsOnJlYWN0IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvaW5kZXgudHN4IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvQXBwLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL2JldnkudHMiLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy90ZWNocy50cyIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL3RoZW1lLnRzIiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvZ2FtZS50cyIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL2hvb2tzLnRzIiwgIi4uL3NyYy91aS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvdWkvSWNvbi50c3giLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy91aS9raXQudHN4IiwgIi4uL3NyYy9jaXR5L2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9jaXR5L0NpdHlQYW5lbC50c3giLCAiLi4vc3JjL2h1ZC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvaHVkL0FjdGlvblBhbmVsLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvVW5pdFBhbmVsLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvQmFubmVycy50c3giLCAiLi4vc3JjL2h1ZC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvaHVkL0xlYWRlcnMudHN4IiwgIi4uL3NyYy9odWQvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL2h1ZC9Ob3RpZmljYXRpb25zLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvVG9wQmFyLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvVHJhY2tlcnMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9zY3JlZW5zL1JhbmtpbmdzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvc2NyZWVucy9SZXBvcnRzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvc2NyZWVucy9jaGFydHMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9zY3JlZW5zL1NjcmVlbi50c3giLCAiLi4vc3JjL3NjcmVlbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL3NjcmVlbnMvVGVjaFRyZWUudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuX19iZXZ5VmVuZG9yW1wiYmV2eS1yZWFjdC9qc3gtcnVudGltZVwiXTsiLCAibW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLl9fYmV2eVZlbmRvcltcImJldnktcmVhY3RcIl07IiwgIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5fX2JldnlWZW5kb3JbXCJyZWFjdFwiXTsiLCAiaW1wb3J0IHsgbW91bnQgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSBcIi4vQXBwXCI7XG5cbi8vIGBtb3VudGAgcGFya3Mgb24gdGhlIFJ1c3QtZHJpdmVuIGV2ZW50IGxvb3AgYW5kIG5ldmVyIHJlc29sdmVzLiBPbiBhIGhvdFxuLy8gcmVsb2FkIHRoaXMgZmlsZSByZS1leGVjdXRlcyBhbmQgYG1vdW50YCB0cmlnZ2VycyBhIFJlYWN0IEZhc3QgUmVmcmVzaC5cbm1vdW50KDxBcHAgLz4pO1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVkdWNlciwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGJldnksIHR5cGUgVGlsZUluZm8sIHR5cGUgV29ybGRJbmZvIH0gZnJvbSBcIi4vYmV2eVwiO1xuaW1wb3J0IHsgQ2l0eVBhbmVsIH0gZnJvbSBcIi4vY2l0eS9DaXR5UGFuZWxcIjtcbmltcG9ydCB7IGxlZGdlciwgbmV3R2FtZSwgc3RlcCwgdHlwZSBBY3Rpb24sIHR5cGUgR2FtZSB9IGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VFdmVudCwgdXNlV2luZG93U2l6ZSB9IGZyb20gXCIuL2hvb2tzXCI7XG5pbXBvcnQgeyBBY3Rpb25QYW5lbCB9IGZyb20gXCIuL2h1ZC9BY3Rpb25QYW5lbFwiO1xuaW1wb3J0IHsgQmFubmVycywgVGlsZVRvb2x0aXAsIHR5cGUgU2VsZWN0aW9uIH0gZnJvbSBcIi4vaHVkL0Jhbm5lcnNcIjtcbmltcG9ydCB7IExlYWRlcnMgfSBmcm9tIFwiLi9odWQvTGVhZGVyc1wiO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9ucyB9IGZyb20gXCIuL2h1ZC9Ob3RpZmljYXRpb25zXCI7XG5pbXBvcnQgeyBMYXVuY2hCYXIsIFRvcEJhciwgdHlwZSBTY3JlZW5JZCB9IGZyb20gXCIuL2h1ZC9Ub3BCYXJcIjtcbmltcG9ydCB7IFRyYWNrZXJzIH0gZnJvbSBcIi4vaHVkL1RyYWNrZXJzXCI7XG5pbXBvcnQgeyBVbml0UGFuZWwgfSBmcm9tIFwiLi9odWQvVW5pdFBhbmVsXCI7XG5pbXBvcnQgeyBSQU5LSU5HX1RBQlMsIFJhbmtpbmdzIH0gZnJvbSBcIi4vc2NyZWVucy9SYW5raW5nc1wiO1xuaW1wb3J0IHsgUkVQT1JUX1RBQlMsIFJlcG9ydHMgfSBmcm9tIFwiLi9zY3JlZW5zL1JlcG9ydHNcIjtcbmltcG9ydCB7IFNjcmVlbiB9IGZyb20gXCIuL3NjcmVlbnMvU2NyZWVuXCI7XG5pbXBvcnQgeyBUZWNoVHJlZSB9IGZyb20gXCIuL3NjcmVlbnMvVGVjaFRyZWVcIjtcblxuLyoqIENpdmlsaXphdGlvbjogdGhlIHdvcmxkIGNvbWVzIGZyb20gQmV2eSBvbmNlOyBldmVyeXRoaW5nIGVsc2Ugb24gc2NyZWVuIGlzXG4gKiAgUmVhY3Qgb3ZlciBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IHdpbiA9IHVzZVdpbmRvd1NpemUoKTtcbiAgY29uc3QgW3dvcmxkLCBzZXRXb3JsZF0gPSB1c2VTdGF0ZTxXb3JsZEluZm8gfCBudWxsPihudWxsKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5Lm1hcC53b3JsZCgpLnRoZW4oc2V0V29ybGQpO1xuICB9LCBbXSk7XG4gIGlmICghd29ybGQgfHwgd2luLndpZHRoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIDxDaXZpbGl6YXRpb24gd29ybGQ9e3dvcmxkfSB3aWR0aD17d2luLndpZHRofSBoZWlnaHQ9e3dpbi5oZWlnaHR9IC8+O1xufVxuXG5jb25zdCBUSVRMRVM6IFJlY29yZDxTY3JlZW5JZCwgc3RyaW5nPiA9IHtcbiAgdGVjaDogXCJUZWNobm9sb2d5XCIsXG4gIHJlcG9ydHM6IFwiUmVwb3J0c1wiLFxuICByYW5raW5nczogXCJXb3JsZCBSYW5raW5nc1wiLFxufTtcblxuZnVuY3Rpb24gQ2l2aWxpemF0aW9uKHtcbiAgd29ybGQsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufSkge1xuICBjb25zdCBbZ2FtZSwgZGlzcGF0Y2hdID0gdXNlUmVkdWNlcihcbiAgICAoZzogR2FtZSwgYTogQWN0aW9uKSA9PiBzdGVwKHdvcmxkLCBnLCBhKSxcbiAgICB3b3JsZCxcbiAgICBuZXdHYW1lLFxuICApO1xuICBjb25zdCBbc2NyZWVuLCBzZXRTY3JlZW5dID0gdXNlU3RhdGU8U2NyZWVuSWQgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3RhYnMsIHNldFRhYnNdID0gdXNlU3RhdGUoe1xuICAgIHJlcG9ydHM6IFJFUE9SVF9UQUJTWzBdLFxuICAgIHJhbmtpbmdzOiBSQU5LSU5HX1RBQlNbMF0sXG4gIH0pO1xuICBjb25zdCBbc2VsZWN0aW9uLCBzZXRTZWxlY3Rpb25dID0gdXNlU3RhdGU8U2VsZWN0aW9uPihudWxsKTtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZTxUaWxlSW5mbyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtsZW5zLCBzZXRMZW5zXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgcGxheWVyID0gd29ybGQuY2l2c1swXTtcbiAgY29uc3QgY2l2ID0gKGlkOiBzdHJpbmcpID0+IHdvcmxkLmNpdnMuZmluZCgoYykgPT4gYy5pZCA9PT0gaWQpITtcbiAgY29uc3QgY2l0eSA9XG4gICAgc2VsZWN0aW9uPy5raW5kID09PSBcImNpdHlcIlxuICAgICAgPyB3b3JsZC5jaXRpZXMuZmluZCgoYykgPT4gYy5pZCA9PT0gc2VsZWN0aW9uLmlkKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHVuaXQgPVxuICAgIHNlbGVjdGlvbj8ua2luZCA9PT0gXCJ1bml0XCJcbiAgICAgID8gd29ybGQudW5pdHMuZmluZCgodSkgPT4gdS5pZCA9PT0gc2VsZWN0aW9uLmlkKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2VsZWN0ID0gKHM6IFNlbGVjdGlvbikgPT4ge1xuICAgIHNldFNlbGVjdGlvbihzKTtcbiAgICBjb25zdCBhdCA9XG4gICAgICBzPy5raW5kID09PSBcImNpdHlcIlxuICAgICAgICA/IHdvcmxkLmNpdGllcy5maW5kKChjKSA9PiBjLmlkID09PSBzLmlkKVxuICAgICAgICA6IHdvcmxkLnVuaXRzLmZpbmQoKHUpID0+IHUuaWQgPT09IHM/LmlkKTtcbiAgICBjb25zdCB0aWxlID0gYXQgPyB7IGNvbDogYXQuY29sLCByb3c6IGF0LnJvdyB9IDogbnVsbDtcbiAgICBiZXZ5Lm1hcC5zZWxlY3QodGlsZSk7XG4gICAgaWYgKHRpbGUgJiYgcz8ua2luZCA9PT0gXCJjaXR5XCIpIGJldnkubWFwLmZvY3VzKHsgdGlsZSwgem9vbTogMC4yIH0pO1xuICB9O1xuXG4gIGNvbnN0IG5leHRUdXJuID0gKCkgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm47XG4gICAgaWYgKCFnYW1lLnJlc2VhcmNoKSByZXR1cm4gc2V0U2NyZWVuKFwidGVjaFwiKTtcbiAgICBzZXRCdXN5KHRydWUpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcInR1cm5cIiB9KTtcbiAgICAgIHNldEJ1c3koZmFsc2UpO1xuICAgIH0sIDY1MCk7XG4gIH07XG5cbiAgY29uc3QgdG9nZ2xlTGVucyA9ICgpID0+IHtcbiAgICBzZXRMZW5zKCFsZW5zKTtcbiAgICBiZXZ5Lm1hcC5sZW5zKHsgcG9saXRpY2FsOiAhbGVucyB9KTtcbiAgfTtcblxuICB1c2VFdmVudChcIm1hcC5ob3ZlclwiLCBzZXRIb3Zlcik7XG4gIHVzZUV2ZW50KFwibWFwLmNsaWNrXCIsICh0aWxlKSA9PlxuICAgIHNlbGVjdChcbiAgICAgIHRpbGUuc2V0dGxlbWVudFxuICAgICAgICA/IHsga2luZDogXCJjaXR5XCIsIGlkOiB0aWxlLnNldHRsZW1lbnQgfVxuICAgICAgICA6IHRpbGUudW5pdFxuICAgICAgICAgID8geyBraW5kOiBcInVuaXRcIiwgaWQ6IHRpbGUudW5pdCB9XG4gICAgICAgICAgOiBudWxsLFxuICAgICksXG4gICk7XG4gIHVzZUV2ZW50KFwia2V5RG93blwiLCAoZSkgPT4ge1xuICAgIGlmIChlLnJlcGVhdCkgcmV0dXJuO1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgaWYgKHNjcmVlbikgc2V0U2NyZWVuKG51bGwpO1xuICAgICAgZWxzZSBzZWxlY3QobnVsbCk7XG4gICAgfVxuICAgIGlmIChlLmtleSA9PT0gXCJFbnRlclwiICYmICFzY3JlZW4pIG5leHRUdXJuKCk7XG4gIH0pO1xuXG4gIC8vIFNjcmlwdGVkIHN0ZXBzIGZvciBgLS1zaG9vdGAgKHNlZSBgc2hvb3QucnNgKS5cbiAgdXNlRGVidWcoXCJzY3JlZW5cIiwgKHMpID0+IHNldFNjcmVlbihzID09PSBcIm5vbmVcIiA/IG51bGwgOiAocyBhcyBTY3JlZW5JZCkpKTtcbiAgdXNlRGVidWcoXCJ0YWJcIiwgKHQpID0+XG4gICAgc2V0VGFicygodGFicykgPT5cbiAgICAgIFJFUE9SVF9UQUJTLmluY2x1ZGVzKHQpXG4gICAgICAgID8geyAuLi50YWJzLCByZXBvcnRzOiB0IH1cbiAgICAgICAgOiB7IC4uLnRhYnMsIHJhbmtpbmdzOiB0IH0sXG4gICAgKSxcbiAgKTtcbiAgdXNlRGVidWcoXCJjaXR5XCIsIChpZCkgPT4gc2VsZWN0KHsga2luZDogXCJjaXR5XCIsIGlkIH0pKTtcbiAgdXNlRGVidWcoXCJ1bml0XCIsIChpZCkgPT4gc2VsZWN0KHsga2luZDogXCJ1bml0XCIsIGlkIH0pKTtcbiAgdXNlRGVidWcoXCJ0dXJuXCIsICgpID0+IGRpc3BhdGNoKHsgdHlwZTogXCJ0dXJuXCIgfSkpO1xuICB1c2VEZWJ1ZyhcImxlbnNcIiwgdG9nZ2xlTGVucyk7XG5cbiAgLy8gVGhlIHRlY2ggdHJlZSBpcyB3aWRlciB0aGFuIGFueSB3aW5kb3c6IGl0cyBzY3JlZW4gc3BhbnMgdGhpcyBvbmUuXG4gIGNvbnN0IGJveFcgPSBzY3JlZW4gPT09IFwidGVjaFwiID8gd2lkdGggLSA2MCA6IE1hdGgubWluKDEyODAsIHdpZHRoIC0gNjApO1xuICBjb25zdCBib3hIID0gaGVpZ2h0IC0gMzIgLSA0MDtcbiAgY29uc3QgbGFiZWwgPSBidXN5XG4gICAgPyBcIlBMRUFTRSBXQUlUXCJcbiAgICA6IGdhbWUucmVzZWFyY2hcbiAgICAgID8gXCJORVhUIFRVUk5cIlxuICAgICAgOiBcIkNIT09TRSBSRVNFQVJDSFwiO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiIH19PlxuICAgICAgeyFzY3JlZW4gJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxCYW5uZXJzXG4gICAgICAgICAgICB3b3JsZD17d29ybGR9XG4gICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgc2VsZWN0aW9uPXtzZWxlY3Rpb259XG4gICAgICAgICAgICBvblNlbGVjdD17c2VsZWN0fVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2hvdmVyICYmIChcbiAgICAgICAgICAgIDxUaWxlVG9vbHRpcCB0aWxlPXtob3Zlcn0gY3Vyc29yPXt3b3JsZC5jdXJzb3J9IHdvcmxkPXt3b3JsZH0gLz5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtjaXR5ID8gKFxuICAgICAgICAgICAgPENpdHlQYW5lbFxuICAgICAgICAgICAgICBrZXk9e2NpdHkuaWR9XG4gICAgICAgICAgICAgIGNpdHk9e2NpdHl9XG4gICAgICAgICAgICAgIGNpdj17Y2l2KGNpdHkuY2l2KX1cbiAgICAgICAgICAgICAgZ2FtZT17Z2FtZX1cbiAgICAgICAgICAgICAgZGlzcGF0Y2g9e2Rpc3BhdGNofVxuICAgICAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZWxlY3QobnVsbCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8TGF1bmNoQmFyIG9uT3Blbj17c2V0U2NyZWVufSByZXNlYXJjaD17ISFnYW1lLnJlc2VhcmNofSAvPlxuICAgICAgICAgICAgICA8VHJhY2tlcnNcbiAgICAgICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgICAgIHBsYXllcj17cGxheWVyLmlkfVxuICAgICAgICAgICAgICAgIG9uUmVzZWFyY2g9eygpID0+IHNldFNjcmVlbihcInRlY2hcIil9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxMZWFkZXJzXG4gICAgICAgICAgICByaXZhbHM9e3dvcmxkLmNpdnMuc2xpY2UoMSl9XG4gICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgb25PcGVuPXsoKSA9PiBzZXRTY3JlZW4oXCJyYW5raW5nc1wiKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxOb3RpZmljYXRpb25zXG4gICAgICAgICAgICBub3Rlcz17Z2FtZS5ub3Rlc31cbiAgICAgICAgICAgIG9uRGlzbWlzcz17KGlkKSA9PiBkaXNwYXRjaCh7IHR5cGU6IFwiZGlzbWlzc1wiLCBpZCB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxBY3Rpb25QYW5lbFxuICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgYnVzeT17YnVzeX1cbiAgICAgICAgICAgIGxlbnM9e2xlbnN9XG4gICAgICAgICAgICBvbk5leHQ9e25leHRUdXJufVxuICAgICAgICAgICAgb25MZW5zPXt0b2dnbGVMZW5zfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge3VuaXQgJiYgKFxuICAgICAgICAgICAgPFVuaXRQYW5lbFxuICAgICAgICAgICAgICBrZXk9e3VuaXQuaWR9XG4gICAgICAgICAgICAgIHVuaXQ9e3VuaXR9XG4gICAgICAgICAgICAgIGNpdj17Y2l2KHVuaXQuY2l2KX1cbiAgICAgICAgICAgICAgb25DbG9zZT17KCkgPT4gc2VsZWN0KG51bGwpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7c2NyZWVuICYmIChcbiAgICAgICAgPFNjcmVlblxuICAgICAgICAgIHRpdGxlPXtUSVRMRVNbc2NyZWVuXX1cbiAgICAgICAgICB3aWR0aD17Ym94V31cbiAgICAgICAgICBoZWlnaHQ9e2JveEh9XG4gICAgICAgICAgdGFicz17XG4gICAgICAgICAgICBzY3JlZW4gPT09IFwicmVwb3J0c1wiXG4gICAgICAgICAgICAgID8gUkVQT1JUX1RBQlNcbiAgICAgICAgICAgICAgOiBzY3JlZW4gPT09IFwicmFua2luZ3NcIlxuICAgICAgICAgICAgICAgID8gUkFOS0lOR19UQUJTXG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFiPXtzY3JlZW4gPT09IFwicmVwb3J0c1wiID8gdGFicy5yZXBvcnRzIDogdGFicy5yYW5raW5nc31cbiAgICAgICAgICBvblRhYj17KHQpID0+IHNldFRhYnMoKHRhYnMpID0+ICh7IC4uLnRhYnMsIFtzY3JlZW5dOiB0IH0pKX1cbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRTY3JlZW4obnVsbCl9XG4gICAgICAgID5cbiAgICAgICAgICB7c2NyZWVuID09PSBcInRlY2hcIiA/IChcbiAgICAgICAgICAgIDxUZWNoVHJlZVxuICAgICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgICBwbGF5ZXI9e3BsYXllci5pZH1cbiAgICAgICAgICAgICAgZGlzcGF0Y2g9e2Rpc3BhdGNofVxuICAgICAgICAgICAgICB3aWR0aD17Ym94V31cbiAgICAgICAgICAgICAgaGVpZ2h0PXtib3hIfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogc2NyZWVuID09PSBcInJlcG9ydHNcIiA/IChcbiAgICAgICAgICAgIDxSZXBvcnRzXG4gICAgICAgICAgICAgIHRhYj17dGFicy5yZXBvcnRzfVxuICAgICAgICAgICAgICB3b3JsZD17d29ybGR9XG4gICAgICAgICAgICAgIGdhbWU9e2dhbWV9XG4gICAgICAgICAgICAgIHdpZHRoPXtib3hXfVxuICAgICAgICAgICAgICBoZWlnaHQ9e2JveEh9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8UmFua2luZ3MgdGFiPXt0YWJzLnJhbmtpbmdzfSB3b3JsZD17d29ybGR9IGdhbWU9e2dhbWV9IC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9TY3JlZW4+XG4gICAgICApfVxuICAgICAgPFRvcEJhciBnYW1lPXtnYW1lfSBwbGF5ZXI9e3BsYXllci5pZH0gbmV0PXtsZWRnZXIod29ybGQsIGdhbWUpLm5ldH0gLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiLy8gQGdlbmVyYXRlZCBieSBiZXZ5LXJlYWN0IOKAlCBkbyBub3QgZWRpdCBieSBoYW5kLlxuLy8gTWlycm9ycyB0aGUgUnVzdCBgI1tyZWFjdF9tZXNzYWdlXWAgLyBgI1tyZWFjdF9yZXF1ZXN0XWAgLyBgI1tyZWFjdF9ldmVudF1gXG4vLyB0eXBlcyBhbmQgdGhlIHJlZ2lzdGVyZWQgYCNbcmVhY3RfZmlsdGVyXWBzIC8gYCNbcmVhY3RfbW9ycGhfZmlsdGVyXWBzIChwbHVzXG4vLyBidWlsdC1pbnMpLiBSZWdlbmVyYXRlIHZpYSB5b3VyIGFwcCdzIGBBcHA6OmV4cG9ydF9yZWFjdF90eXBlc2NyaXB0YCBleHBvcnRlci5cblxuaW1wb3J0IHtcbiAgZW1pdCBhcyByYXdFbWl0LFxuICByZXF1ZXN0IGFzIHJhd1JlcXVlc3QsXG4gIGFkZEV2ZW50TGlzdGVuZXIgYXMgcmF3QWRkRXZlbnRMaXN0ZW5lcixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lciBhcyByYXdSZW1vdmVFdmVudExpc3RlbmVyLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUsIFJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBBbmNob3JTY2FsaW5nLCBBbmltYXRhYmxlLCBCZXZ5QXR0cmlidXRlcywgQmV2eUNhbnZhc0VsZW1lbnQsIEJldnlGb2N1c1Byb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlTaGFwZVRyYW5zaXRpb24sIEJldnlTdHlsZSwgQmV2eVZhcmlhbnRQcm9wcywgQmV2eVdoZWVsUHJvcHMsIENhbnZhc1BhaW50ZXIsIERyYXdDbWQsIFZlYzMgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuXG5leHBvcnQgdHlwZSBBY3QgPSB7IGFjdGlvbjogc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgQmxvb21QYXJhbXMgPSB7IHJhZGl1czogbnVtYmVyIHwgc3RyaW5nLCB0aHJlc2hvbGQ6IG51bWJlciwgaW50ZW5zaXR5OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBCbHVyUGFyYW1zID0geyByYWRpdXM6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIEJyaWdodG5lc3NQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ2FudmFzU2l6ZSA9IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBDaHJvbWF0aWNBYmVycmF0aW9uUGFyYW1zID0geyBvZmZzZXQ6IG51bWJlciB8IHN0cmluZywgYW5nbGU6IG51bWJlciB8IHN0cmluZywgXG4vKipcbiAqIFRhbmdlbnRpYWwgc3dpcmw6IHRoZSBSIGltYWdlIHJvdGF0ZXMgYnkgYCtyb3RhdGlvbmAgZGVncmVlc1xuICogKGNsb2Nrd2lzZSwgeS1kb3duKSBhcm91bmQgdGhlIG5vZGUncyBjZW50ZXIsIEIgYnkgYC1yb3RhdGlvbmAuXG4gKiBQbGFpbiBudW1iZXIgaW4gZGVncmVlcyDigJQgYSBzY2FsYXIgbWFnbml0dWRlLCBzbyB0cmFuc2l0aW9ucyB1bndpbmRcbiAqIGxpbmVhcmx5IHRocm91Z2ggZXZlcnkgdHVybi4gMCA9IHB1cmVseSBkaXJlY3Rpb25hbCBzcGxpdC5cbiAqL1xucm90YXRpb246IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENpdHlJbmZvID0geyBpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGNpdjogc3RyaW5nLCBjb2w6IG51bWJlciwgcm93OiBudW1iZXIsIFxuLyoqXG4gKiBUaGUgcG9pbnQgYWJvdmUgdGhlIHRvd24gaXRzIGJhbm5lciBpcyBwaW5uZWQgdG8gKGBFbnRpdHk6OnRvX2JpdHNgKS5cbiAqL1xuZW50aXR5OiBudW1iZXIsIGNhcGl0YWw6IGJvb2xlYW4sIHBvcHVsYXRpb246IG51bWJlciwgeWllbGRzOiBZaWVsZHMsIFxuLyoqXG4gKiBUaWxlcyBpbnNpZGUgaXRzIGJvcmRlcnMuXG4gKi9cbnRpbGVzOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBDaXZJbmZvID0geyBpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGxlYWRlcjogc3RyaW5nLCBcbi8qKlxuICogYCNycmdnYmJgLlxuICovXG5jb2xvcjogc3RyaW5nLCBwbGF5ZXI6IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBDbGlja1RpbGUgPSBUaWxlSW5mbztcbmV4cG9ydCB0eXBlIENvbnRyYXN0UGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENyb3NzZmFkZVBhcmFtcyA9IHsgXG4vKipcbiAqIDAuLjEgc3RhZ2dlciBhbW91bnQ7IDAgaXMgdGhlIHBsYWluIHVuaWZvcm0gY3Jvc3NmYWRlLlxuICovXG5zcHJlYWQ6IG51bWJlciwgXG4vKipcbiAqIE5vaXNlIGZlYXR1cmUgc2l6ZSBpbiBsb2dpY2FsIHB4LlxuICovXG5zY2FsZTogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogMC4uMSBsb2NhbCBmYWRlIHdpbmRvdyAoZnJhY3Rpb24gb2YgdGhlIHByb2dyZXNzIHJhbmdlKS5cbiAqL1xuc29mdG5lc3M6IG51bWJlciwgXG4vKipcbiAqIFJlLXJvbGxzIHRoZSBub2lzZSBwYXR0ZXJuIChkb21haW4gb2Zmc2V0KS5cbiAqL1xuc2VlZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgRm9jdXMgPSB7IHRpbGU6IFRpbGVQb3MsIHpvb206IG51bWJlciB8IG51bGwsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQXhpc0NoYW5nZSA9IHsgZ2FtZXBhZDogbnVtYmVyLCBheGlzOiBHYW1lcGFkQXhpc05hbWUsIHZhbHVlOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQXhpc05hbWUgPSBcImxlZnRTdGlja1hcIiB8IFwibGVmdFN0aWNrWVwiIHwgXCJsZWZ0WlwiIHwgXCJyaWdodFN0aWNrWFwiIHwgXCJyaWdodFN0aWNrWVwiIHwgXCJyaWdodFpcIiB8IHsgXCJvdGhlclwiOiBudW1iZXIgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRCdXR0b25DaGFuZ2UgPSB7IGdhbWVwYWQ6IG51bWJlciwgYnV0dG9uOiBHYW1lcGFkQnV0dG9uTmFtZSwgXG4vKipcbiAqIERpZ2l0YWwgc3RhdGUgYWZ0ZXIgdGhlIGNoYW5nZSAodGhyZXNob2xkcyBmcm9tIGBHYW1lcGFkU2V0dGluZ3NgKS5cbiAqL1xucHJlc3NlZDogYm9vbGVhbiwgXG4vKipcbiAqIEFuYWxvZyB2YWx1ZSBpbiBgMC4wLi49MS4wYCAodHJpZ2dlcnMgcmVwb3J0IHRoZSBmdWxsIHJhbmdlKS5cbiAqL1xudmFsdWU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRCdXR0b25OYW1lID0gXCJzb3V0aFwiIHwgXCJlYXN0XCIgfCBcIm5vcnRoXCIgfCBcIndlc3RcIiB8IFwiY1wiIHwgXCJ6XCIgfCBcImxlZnRUcmlnZ2VyXCIgfCBcImxlZnRUcmlnZ2VyMlwiIHwgXCJyaWdodFRyaWdnZXJcIiB8IFwicmlnaHRUcmlnZ2VyMlwiIHwgXCJzZWxlY3RcIiB8IFwic3RhcnRcIiB8IFwibW9kZVwiIHwgXCJsZWZ0VGh1bWJcIiB8IFwicmlnaHRUaHVtYlwiIHwgXCJkUGFkVXBcIiB8IFwiZFBhZERvd25cIiB8IFwiZFBhZExlZnRcIiB8IFwiZFBhZFJpZ2h0XCIgfCB7IFwib3RoZXJcIjogbnVtYmVyIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkQ29ubmVjdGVkID0gR2FtZXBhZENvbm5lY3RlZERhdGE7XG5leHBvcnQgdHlwZSBHYW1lcGFkQ29ubmVjdGVkRGF0YSA9IHsgXG4vKipcbiAqIE1vbm90b25pYyB3aXJlIGlkIOKAlCBuZXZlciByZXVzZWQgYWNyb3NzIHJlY29ubmVjdHMuXG4gKi9cbmdhbWVwYWQ6IG51bWJlciwgXG4vKipcbiAqIE9TLXByb3ZpZGVkIGRldmljZSBuYW1lLlxuICovXG5uYW1lOiBzdHJpbmcsIFxuLyoqXG4gKiBVU0IgdmVuZG9yIGlkLCB3aGVuIHRoZSBiYWNrZW5kIGtub3dzIGl0LlxuICovXG52ZW5kb3JJZDogbnVtYmVyIHwgbnVsbCwgXG4vKipcbiAqIFVTQiBwcm9kdWN0IGlkLCB3aGVuIHRoZSBiYWNrZW5kIGtub3dzIGl0LlxuICovXG5wcm9kdWN0SWQ6IG51bWJlciB8IG51bGwsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkRGlzY29ubmVjdGVkID0gR2FtZXBhZERpc2Nvbm5lY3RlZERhdGE7XG5leHBvcnQgdHlwZSBHYW1lcGFkRGlzY29ubmVjdGVkRGF0YSA9IHsgXG4vKipcbiAqIFRoZSB3aXJlIGlkIHRoZSBwYWQgd2FzIGFubm91bmNlZCB1bmRlci4gUmV0aXJlZCBmb3IgZ29vZC5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZElucHV0RGF0YSA9IHsgYnV0dG9uczogQXJyYXk8R2FtZXBhZEJ1dHRvbkNoYW5nZT4sIGF4ZXM6IEFycmF5PEdhbWVwYWRBeGlzQ2hhbmdlPiwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRJbnB1dEV2ZW50ID0gR2FtZXBhZElucHV0RGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRSdW1ibGUgPSB7IFxuLyoqXG4gKiBXaXJlIGlkIGZyb20gW2BHYW1lcGFkQ29ubmVjdGVkYF0uXG4gKi9cbmdhbWVwYWQ6IG51bWJlciwgXG4vKipcbiAqIE1pbGxpc2Vjb25kcyAod2ViLWBwbGF5RWZmZWN0YC1saWtlKS4gTmVnYXRpdmUgdmFsdWVzIGNsYW1wIHRvIDAuXG4gKi9cbmR1cmF0aW9uOiBudW1iZXIsIFxuLyoqXG4gKiBMb3ctZnJlcXVlbmN5IG1vdG9yIGludGVuc2l0eSwgY2xhbXBlZCB0byBgMC4wLi49MS4wYC5cbiAqL1xuc3Ryb25nTW90b3I6IG51bWJlciwgXG4vKipcbiAqIEhpZ2gtZnJlcXVlbmN5IG1vdG9yIGludGVuc2l0eSwgY2xhbXBlZCB0byBgMC4wLi49MS4wYC5cbiAqL1xud2Vha01vdG9yOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkU3RvcFJ1bWJsZSA9IHsgZ2FtZXBhZDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR3JhZGllbnRNYXBQYXJhbXMgPSB7IGFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIHN0b3BzOiBBcnJheTxHcmFkaWVudE1hcFN0b3A+LCBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYWRpZW50TWFwU3RvcCA9IHsgY29sb3I6IHN0cmluZywgcG9zaXRpb24/OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHcmF5c2NhbGVQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgSG92ZXJUaWxlID0gVGlsZUluZm8gfCBudWxsO1xuZXhwb3J0IHR5cGUgSHVlUm90YXRlUGFyYW1zID0geyBhbmdsZTogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgSW52ZXJ0UGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEp1bXAgPSB7IHU6IG51bWJlciwgdjogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgS2V5RG93biA9IEtleWJvYXJkRXZlbnREYXRhO1xuZXhwb3J0IHR5cGUgS2V5VXAgPSBLZXlib2FyZEV2ZW50RGF0YTtcbmV4cG9ydCB0eXBlIEtleWJvYXJkRXZlbnREYXRhID0geyBcbi8qKlxuICogTGF5b3V0LWF3YXJlIGxvZ2ljYWwga2V5OiB0aGUgdHlwZWQgY2hhcmFjdGVyIChgXCJhXCJgLCBgXCJBXCJgKSBvciBhIG5hbWVkXG4gKiBrZXkgKGBcIkVudGVyXCJgLCBgXCJBcnJvd0xlZnRcImAsIGBcIkVzY2FwZVwiYCkuXG4gKi9cbmtleTogc3RyaW5nLCBcbi8qKlxuICogTGF5b3V0LWluZGVwZW5kZW50IHBoeXNpY2FsIGtleSwgVzNDIGBjb2RlYCBzdHlsZSAoYFwiS2V5QVwiYCwgYFwiRW50ZXJcImApLlxuICovXG5jb2RlOiBzdHJpbmcsIFxuLyoqXG4gKiBUaGUgdGV4dCBwcm9kdWNlZCBieSB0aGUga2V5LCBpZiBhbnkgKHJlc3BlY3RzIG1vZGlmaWVycy9JTUUpLiBgbnVsbGAgZm9yXG4gKiBrZXlzIHRoYXQgZG9uJ3QgcHJvZHVjZSB0ZXh0IChlLmcuIGFycm93cywgbW9kaWZpZXJzKS5cbiAqL1xudGV4dDogc3RyaW5nIHwgbnVsbCwgXG4vKipcbiAqIFdoZXRoZXIgdGhpcyBpcyBhbiBPUyBhdXRvLXJlcGVhdCB3aGlsZSB0aGUga2V5IGlzIGhlbGQuXG4gKi9cbnJlcGVhdDogYm9vbGVhbiwgY3RybEtleTogYm9vbGVhbiwgc2hpZnRLZXk6IGJvb2xlYW4sIGFsdEtleTogYm9vbGVhbiwgXG4vKipcbiAqIFRoZSBcIk1ldGFcIi9cIlN1cGVyXCIga2V5IChXaW5kb3dzL0NvbW1hbmQpLlxuICovXG5tZXRhS2V5OiBib29sZWFuLCB9O1xuZXhwb3J0IHR5cGUgTGVucyA9IHsgcG9saXRpY2FsOiBib29sZWFuLCB9O1xuZXhwb3J0IHR5cGUgTGluZWFyV2lwZVBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc29mdG5lc3M6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIE91dGxpbmVQYXJhbXMgPSB7IHdpZHRoOiBudW1iZXIgfCBzdHJpbmcsIGNvbG9yOiBzdHJpbmcsIHNvZnRuZXNzOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBQaW5jaFBhcmFtcyA9IHsgXG4vKipcbiAqIFBpbmNoIGNlbnRlciwgMC4uMSBhY3Jvc3MgdGhlIG5vZGUgcmVjdCAoMCA9IGxlZnQgZWRnZSkuXG4gKi9cbng6IG51bWJlciwgXG4vKipcbiAqIFBpbmNoIGNlbnRlciwgMC4uMSBhY3Jvc3MgdGhlIG5vZGUgcmVjdCAoMCA9IHRvcCBlZGdlKS5cbiAqL1xueTogbnVtYmVyLCBcbi8qKlxuICogLTEgKGZ1bGwgYnVsZ2UpIC4uPSAxIChmdWxsIHBpbmNoKTsgMCBpcyBpZGVudGl0eS5cbiAqL1xuc3RyZW5ndGg6IG51bWJlciwgXG4vKipcbiAqIEVmZmVjdCByYWRpdXMgYXMgYSBmcmFjdGlvbiBvZiB0aGUgbm9kZSdzIGxhcmdlciBkaW1lbnNpb24uXG4gKi9cbnJhZGl1czogbnVtYmVyLCBcbi8qKlxuICogRGlmZnVzZSBzaGFkaW5nIGludGVuc2l0eTogMCAodW5saXQsIHRoZSBkZWZhdWx0KSwgMSBub21pbmFsOyBsYXJnZXJcbiAqIHZhbHVlcyBvdmVyZHJpdmUsIGxpa2UgYGJyaWdodG5lc3NgLlxuICovXG5saWdodDogbnVtYmVyLCBcbi8qKlxuICogRGlyZWN0aW9uIHRoZSBsaWdodCBjb21lcyBGUk9NOiBkZWdyZWVzIGNsb2Nrd2lzZSBmcm9tICtYIGluIHNjcmVlblxuICogc3BhY2UgKGJhcmUgbnVtYmVyID0gZGVncmVlcywgYFwiMC4yNXR1cm5cImAgZXRjLiBhY2NlcHRlZCkuIERlZmF1bHRcbiAqIC0xMzUgPSB0b3AtbGVmdC5cbiAqL1xubGlnaHRBbmdsZTogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogU3BlY3VsYXIgKHdoaXRlKSBoaWdobGlnaHQgaW50ZW5zaXR5OiAwIChvZmYsIHRoZSBkZWZhdWx0KSwgMVxuICogbm9taW5hbDsgbGFyZ2VyIHZhbHVlcyBvdmVyZHJpdmUuXG4gKi9cbmdsb3NzOiBudW1iZXIsIFxuLyoqXG4gKiBTaXplIG9mIHRoZSBzcGVjdWxhciBoaWdobGlnaHQsIDAgKGEgcGlucG9pbnQpIC4uPSAxIChhIGJyb2FkIHNoZWVuKTtcbiAqIGRlZmF1bHQgMC4zLiBNYXBwZWQgbG9nLXdpc2Ugb250byBhIEJsaW5uLVBob25nIGV4cG9uZW50IGluIHRoZSBzaGFkZXJcbiAqICgxMjggYXQgMCwgfjMyIGF0IDAuMywgMSBhdCAxKS5cbiAqL1xuZ2xvc3NTaXplOiBudW1iZXIsIFxuLyoqXG4gKiBIb3cgdGhlIGVmZmVjdCBtZWV0cyBpdHMgcmltLCAwLi49MTogMCBpcyBhIGxpbmVhciBvbnNldCAoYSB2aXNpYmxlXG4gKiBjcmVhc2UsIGxpa2UgYSBwcmVzc2VkIGNvaW4gZWRnZSksIDAuNSAodGhlIGRlZmF1bHQpIHRoZSBjbGFzc2ljIGB1XjJgXG4gKiBzbW9vdGhzdGVwLWxpa2UgZmFkZSwgMSBhbiBpbXBlcmNlcHRpYmxlIGB1XjRgIGZhZGUtaW4uXG4gKi9cbm91dGVyU29mdG5lc3M6IG51bWJlciwgXG4vKipcbiAqIEhvdyB0aGUgZWZmZWN0IHBlYWtzIGF0IGl0cyBjZW50ZXIsIDAuLj0xOiAwIGlzIGEgY29uZSB0aXAgKGEgcG9pbnRlZFxuICogcGl0L3BlYWsgdGhlIGxpZ2h0aW5nIHNob3dzIGFzIGEgcG9pbnQpLCAwLjUgKHRoZSBkZWZhdWx0KSBhIHJvdW5kZWRcbiAqIGJvd2wsIDEgYSBicm9hZCBmbGF0IGZsb29yLiBJbmRlcGVuZGVudCBvZiBgb3V0ZXJTb2Z0bmVzc2A6IHRoZVxuICogcHJvZmlsZSBpcyBgMSAtICgxIC0gdV5hKV5iYCB3aXRoIGBhYC9gYmAgZnJvbSB0aGUgdHdvIGtub2JzLlxuICovXG5pbm5lclNvZnRuZXNzOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBQaXhlbGl6ZVBhcmFtcyA9IHsgXG4vKipcbiAqIENlbGxzIGFjcm9zcyB4L3kgYXQgdGhlIG1vc2FpYydzIGNvYXJzZXN0ICh1cHN0cmVhbSBgc3F1YXJlc01pbmApLlxuICovXG5zcXVhcmVzTWluOiBbbnVtYmVyLCBudW1iZXJdLCBcbi8qKlxuICogRGlzY3JldGUgY2VsbC1zaXplIGxldmVsczsgYDw9IDBgIGZvciBhIGNvbnRpbnVvdXMgcmFtcC5cbiAqL1xuc3RlcHM6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFJlc2l6ZSA9IFdpbmRvd1NpemU7XG5leHBvcnQgdHlwZSBTYXR1cmF0ZVBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBTZWxlY3QgPSBUaWxlUG9zIHwgbnVsbDtcbmV4cG9ydCB0eXBlIFNlcGlhUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNoYWRvd1BhcmFtcyA9IHsgY29sb3I6IHN0cmluZywgb2Zmc2V0WDogbnVtYmVyIHwgc3RyaW5nLCBvZmZzZXRZOiBudW1iZXIgfCBzdHJpbmcsIHNwcmVhZDogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgVGlsZUluZm8gPSB7IGNvbDogbnVtYmVyLCByb3c6IG51bWJlciwgXG4vKipcbiAqIEV4cGxvcmVkOiBvZiBhbiB1bmV4cGxvcmVkIHRpbGUsIG5vdGhpbmcgZWxzZSBpcyBrbm93bi5cbiAqL1xucmV2ZWFsZWQ6IGJvb2xlYW4sIHRlcnJhaW46IHN0cmluZywgaGlsbHM6IGJvb2xlYW4sIG1vdW50YWluczogYm9vbGVhbiwgXG4vKipcbiAqIGBcIndvb2RzXCJgLCBgXCJyYWluZm9yZXN0XCJgLlxuICovXG5mZWF0dXJlOiBzdHJpbmcgfCBudWxsLCB5aWVsZHM6IFlpZWxkcywgZmFybTogYm9vbGVhbiwgXG4vKipcbiAqIFRoZSBjaXYgd2hvc2UgYm9yZGVycyBpdCBsaWVzIGluLlxuICovXG5vd25lcjogc3RyaW5nIHwgbnVsbCwgXG4vKipcbiAqIFRoZSBjaXR5IHdob3NlIHRlcnJpdG9yeSBpdCBpcy5cbiAqL1xuY2l0eTogc3RyaW5nIHwgbnVsbCwgXG4vKipcbiAqIFRoZSBjaXR5IHN0YW5kaW5nIG9uIGl0LlxuICovXG5zZXR0bGVtZW50OiBzdHJpbmcgfCBudWxsLCB1bml0OiBzdHJpbmcgfCBudWxsLCB9O1xuZXhwb3J0IHR5cGUgVGlsZVBvcyA9IHsgY29sOiBudW1iZXIsIHJvdzogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgVW5pdEluZm8gPSB7IGlkOiBzdHJpbmcsIGtpbmQ6IHN0cmluZywgY2l2OiBzdHJpbmcsIGNvbDogbnVtYmVyLCByb3c6IG51bWJlciwgXG4vKipcbiAqIFRoZSBmaWd1cmUgaXRzIGZsYWcgaXMgcGlubmVkIHRvIChgRW50aXR5Ojp0b19iaXRzYCkuXG4gKi9cbmVudGl0eTogbnVtYmVyLCBcbi8qKlxuICogT3V0IGluIHRoZSB1bmV4cGxvcmVkLCB1bnNlZW4uXG4gKi9cbmhpZGRlbjogYm9vbGVhbiwgfTtcbmV4cG9ydCB0eXBlIFdpbmRvd1NpemUgPSB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgV29ybGRJbmZvID0geyBjb2xzOiBudW1iZXIsIHJvd3M6IG51bWJlciwgXG4vKipcbiAqIFRoZSByaW5nIG92ZXIgdGhlIGhvdmVyZWQgdGlsZSwgZm9yIHRoZSB0b29sdGlwJ3MgYDxhbmNob3I+YC5cbiAqL1xuY3Vyc29yOiBudW1iZXIsIGNpdnM6IEFycmF5PENpdkluZm8+LCBjaXRpZXM6IEFycmF5PENpdHlJbmZvPiwgdW5pdHM6IEFycmF5PFVuaXRJbmZvPiwgfTtcbmV4cG9ydCB0eXBlIFlpZWxkcyA9IHsgZm9vZDogbnVtYmVyLCBwcm9kdWN0aW9uOiBudW1iZXIsIGdvbGQ6IG51bWJlciwgc2NpZW5jZTogbnVtYmVyLCBjdWx0dXJlOiBudW1iZXIsIGZhaXRoOiBudW1iZXIsIH07XG5cbi8qKiBFdmVyeSBgZW1pdGAgbmFtZSBhbmQgdGhlIHBheWxvYWQgdHlwZSBpdCBjYXJyaWVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFjdE1lc3NhZ2VzIHtcbiAgXCJnYW1lcGFkLnJ1bWJsZVwiOiBHYW1lcGFkUnVtYmxlO1xuICBcImdhbWVwYWQuc3RvcFJ1bWJsZVwiOiBHYW1lcGFkU3RvcFJ1bWJsZTtcbiAgXCJtYXAuZm9jdXNcIjogRm9jdXM7XG4gIFwibWFwLmp1bXBcIjogSnVtcDtcbiAgXCJtYXAubGVuc1wiOiBMZW5zO1xuICBcIm1hcC5zZWxlY3RcIjogU2VsZWN0O1xufVxuXG4vKiogRXZlcnkgYHJlcXVlc3RgIG5hbWUgYW5kIGl0cyByZXF1ZXN0L3Jlc3BvbnNlIHR5cGVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFjdFJlcXVlc3RzIHtcbiAgXCJnYW1lcGFkLmdldEFsbFwiOiB7IHJlcXVlc3Q6IG51bGw7IHJlc3BvbnNlOiBBcnJheTxHYW1lcGFkQ29ubmVjdGVkRGF0YT4gfTtcbiAgXCJtYXAud29ybGRcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogV29ybGRJbmZvIH07XG4gIFwid2luZG93LnNpemVcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogV2luZG93U2l6ZSB9O1xufVxuXG4vKiogRXZlcnkgQmV2eSDihpIgUmVhY3QgZXZlbnQgbmFtZSBhbmQgdGhlIHBheWxvYWQgaXQgY2Fycmllcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RFdmVudHMge1xuICBcImRlYnVnLmFjdFwiOiBBY3Q7XG4gIGdhbWVwYWRDb25uZWN0ZWQ6IEdhbWVwYWRDb25uZWN0ZWQ7XG4gIGdhbWVwYWREaXNjb25uZWN0ZWQ6IEdhbWVwYWREaXNjb25uZWN0ZWQ7XG4gIGdhbWVwYWRJbnB1dDogR2FtZXBhZElucHV0RXZlbnQ7XG4gIGtleURvd246IEtleURvd247XG4gIGtleVVwOiBLZXlVcDtcbiAgXCJtYXAuY2xpY2tcIjogQ2xpY2tUaWxlO1xuICBcIm1hcC5ob3ZlclwiOiBIb3ZlclRpbGU7XG4gIHJlc2l6ZTogUmVzaXplO1xufVxuXG4vKiogRXZlcnkgcmVnaXN0ZXJlZCBmaWx0ZXIgbmFtZSBhbmQgaXRzIHBhcmFtcyB0eXBlLCBzcGxpdCBieSBmYW1pbHkuXG4gKiAgQXVnbWVudHMgdGhlIGVtcHR5IGBCZXZ5RmlsdGVyc2AgKHJlZ3VsYXIgZmlsdGVycyDigJQgdGhlIGBmaWx0ZXJgIGFuZFxuICogIGBiYWNrZHJvcEZpbHRlcmAgY2hhaW5zKSBhbmQgYEJldnlNb3JwaEZpbHRlcnNgICh0d28taW5wdXQgbW9ycGhcbiAqICBmaWx0ZXJzIOKAlCB0aGUgYG1vcnBoRmlsdGVyYCBzdHlsZSkgcmVnaXN0cnkgaW50ZXJmYWNlcyBpbiB0aGVcbiAqICBgYmV2eS1yZWFjdGAgcGFja2FnZSwgc28gZWFjaCBzdHlsZSBmaWVsZCB0eXBlcyBpdHMgbmFtZXMnIHBhcmFtcy4gKi9cbmRlY2xhcmUgbW9kdWxlIFwiYmV2eS1yZWFjdFwiIHtcbiAgaW50ZXJmYWNlIEJldnlGaWx0ZXJzIHtcbiAgICBibG9vbTogQmxvb21QYXJhbXM7XG4gICAgYmx1cjogQmx1clBhcmFtcztcbiAgICBicmlnaHRuZXNzOiBCcmlnaHRuZXNzUGFyYW1zO1xuICAgIGNocm9tYXRpY0FiZXJyYXRpb246IENocm9tYXRpY0FiZXJyYXRpb25QYXJhbXM7XG4gICAgY29udHJhc3Q6IENvbnRyYXN0UGFyYW1zO1xuICAgIGdyYWRpZW50TWFwOiBHcmFkaWVudE1hcFBhcmFtcztcbiAgICBncmF5c2NhbGU6IEdyYXlzY2FsZVBhcmFtcztcbiAgICBodWVSb3RhdGU6IEh1ZVJvdGF0ZVBhcmFtcztcbiAgICBpbnZlcnQ6IEludmVydFBhcmFtcztcbiAgICBvdXRsaW5lOiBPdXRsaW5lUGFyYW1zO1xuICAgIHBpbmNoOiBQaW5jaFBhcmFtcztcbiAgICBzYXR1cmF0ZTogU2F0dXJhdGVQYXJhbXM7XG4gICAgc2VwaWE6IFNlcGlhUGFyYW1zO1xuICAgIHNoYWRvdzogU2hhZG93UGFyYW1zO1xuICB9XG4gIGludGVyZmFjZSBCZXZ5TW9ycGhGaWx0ZXJzIHtcbiAgICBjcm9zc2ZhZGU6IENyb3NzZmFkZVBhcmFtcztcbiAgICBsaW5lYXJXaXBlOiBMaW5lYXJXaXBlUGFyYW1zO1xuICAgIHBpeGVsaXplOiBQaXhlbGl6ZVBhcmFtcztcbiAgfVxufVxuXG4vKiogVGhlIGFwcCdzIG93biBlbGVtZW50cycgcHJvcHMgKGBhcHAuYWRkX3JlYWN0X2VsZW1lbnRgKS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUFuY2hvclByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMsIEJldnlGb2N1c1Byb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIGVudGl0eTogbnVtYmVyIHwgYmlnaW50O1xuICBvZmZzZXQ/OiBWZWMzO1xuICBzY2FsZT86IEFuY2hvclNjYWxpbmc7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlDYW52YXNQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzLCBCZXZ5Rm9jdXNQcm9wcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICBkcmF3PzogQ2FudmFzUGFpbnRlciB8IERyYXdDbWRbXTtcbiAgb25SZXNpemU/OiAocGF5bG9hZDogQ2FudmFzU2l6ZSkgPT4gdm9pZDtcbiAgcmVmPzogUmVmPEJldnlDYW52YXNFbGVtZW50PjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUNpcmNsZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBjeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgY3k/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHI/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlFbGxpcHNlUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIGN4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBjeT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcng/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHJ5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5R1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMge1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5TGluZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICB4MT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgeTE/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHgyPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5Mj86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVBhdGhQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgZD86IHN0cmluZztcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVBvbHlnb25Qcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgcG9pbnRzPzogbnVtYmVyW107XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb2x5bGluZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBwb2ludHM/OiBudW1iZXJbXTtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVBvcnRhbFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMsIEJldnlGb2N1c1Byb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UmVjdFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICB4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB3aWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgaGVpZ2h0PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcnk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlTdXJmYWNlUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVN2Z1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMsIEJldnlGb2N1c1Byb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIHZpZXdCb3g/OiBzdHJpbmc7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG4vKiogVGhlIGFwcCdzIG93biBlbGVtZW50cyAoYGFwcC5hZGRfcmVhY3RfZWxlbWVudGApLiBBdWdtZW50cyB0aGVcbiAqICBgQmV2eUludHJpbnNpY0VsZW1lbnRzYCBpbnRlcmZhY2UgaW4gdGhlIGBiZXZ5LXJlYWN0YCBwYWNrYWdlLCBzbyBKU1hcbiAqICB0eXBlcyB0aGVtLiAqL1xuZGVjbGFyZSBtb2R1bGUgXCJiZXZ5LXJlYWN0XCIge1xuICBpbnRlcmZhY2UgQmV2eUludHJpbnNpY0VsZW1lbnRzIHtcbiAgICBhbmNob3I6IEJldnlBbmNob3JQcm9wcztcbiAgICBjYW52YXM6IEJldnlDYW52YXNQcm9wcztcbiAgICBjaXJjbGU6IEJldnlDaXJjbGVQcm9wcztcbiAgICBlbGxpcHNlOiBCZXZ5RWxsaXBzZVByb3BzO1xuICAgIGc6IEJldnlHUHJvcHM7XG4gICAgbGluZTogQmV2eUxpbmVQcm9wcztcbiAgICBwYXRoOiBCZXZ5UGF0aFByb3BzO1xuICAgIHBvbHlnb246IEJldnlQb2x5Z29uUHJvcHM7XG4gICAgcG9seWxpbmU6IEJldnlQb2x5bGluZVByb3BzO1xuICAgIHBvcnRhbDogQmV2eVBvcnRhbFByb3BzO1xuICAgIHJlY3Q6IEJldnlSZWN0UHJvcHM7XG4gICAgc3VyZmFjZTogQmV2eVN1cmZhY2VQcm9wcztcbiAgICBzdmc6IEJldnlTdmdQcm9wcztcbiAgfVxufVxuXG4vKiogU2VuZCBhIHR5cGVkIGFwcCBtZXNzYWdlIHRvIHRoZSBCZXZ5IHNpZGUuICovXG5leHBvcnQgZnVuY3Rpb24gZW1pdDxLIGV4dGVuZHMga2V5b2YgUmVhY3RNZXNzYWdlcz4obmFtZTogSywgdmFsdWU6IFJlYWN0TWVzc2FnZXNbS10pOiB2b2lkIHtcbiAgcmF3RW1pdChuYW1lLCB2YWx1ZSk7XG59XG5cbi8qKiBTZW5kIGEgdHlwZWQgcmVxdWVzdCBhbmQgYXdhaXQgaXRzIHR5cGVkIHJlc3BvbnNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3Q8SyBleHRlbmRzIGtleW9mIFJlYWN0UmVxdWVzdHM+KFxuICBuYW1lOiBLLFxuICB2YWx1ZTogUmVhY3RSZXF1ZXN0c1tLXVtcInJlcXVlc3RcIl0sXG4pOiBQcm9taXNlPFJlYWN0UmVxdWVzdHNbS11bXCJyZXNwb25zZVwiXT4ge1xuICByZXR1cm4gcmF3UmVxdWVzdChuYW1lLCB2YWx1ZSkgYXMgUHJvbWlzZTxSZWFjdFJlcXVlc3RzW0tdW1wicmVzcG9uc2VcIl0+O1xufVxuXG4vKiogU3Vic2NyaWJlIHRvIGEgdHlwZWQgQmV2eSDihpIgUmVhY3QgZXZlbnQuIFJldHVybnMgYW4gdW5zdWJzY3JpYmUgZm4uICovXG5leHBvcnQgZnVuY3Rpb24gb248SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgY2I6ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pOiAoKSA9PiB2b2lkIHtcbiAgcmF3QWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xuICByZXR1cm4gKCkgPT4gcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xufVxuXG4vKiogVW5zdWJzY3JpYmUgYSBsaXN0ZW5lciBwcmV2aW91c2x5IHBhc3NlZCB0byBgb25gL2BhZGRFdmVudExpc3RlbmVyYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyPEsgZXh0ZW5kcyBrZXlvZiBSZWFjdEV2ZW50cz4oXG4gIG5hbWU6IEssXG4gIGNiOiAodmFsdWU6IFJlYWN0RXZlbnRzW0tdKSA9PiB2b2lkLFxuKTogdm9pZCB7XG4gIHJhd1JlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgY2IgYXMgKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkKTtcbn1cblxuLyoqIFN0cnVjdHVyZWQsIGZ1bGx5IHR5cGVkIHByb3h5IG92ZXIgZXZlcnkgbWVzc2FnZSwgcmVxdWVzdCwgYW5kIGV2ZW50LiAqL1xuZXhwb3J0IGNvbnN0IGJldnkgPSB7XG4gIGVtaXQsXG4gIHJlcXVlc3QsXG4gIG9uLFxuICBhZGRFdmVudExpc3RlbmVyOiBvbixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcixcbiAgZ2FtZXBhZDoge1xuICAgIGdldEFsbCgpOiBQcm9taXNlPEFycmF5PEdhbWVwYWRDb25uZWN0ZWREYXRhPj4geyByZXR1cm4gcmVxdWVzdChcImdhbWVwYWQuZ2V0QWxsXCIsIG51bGwpOyB9LFxuICAgIHJ1bWJsZSh2YWx1ZTogR2FtZXBhZFJ1bWJsZSk6IHZvaWQgeyBlbWl0KFwiZ2FtZXBhZC5ydW1ibGVcIiwgdmFsdWUpOyB9LFxuICAgIHN0b3BSdW1ibGUodmFsdWU6IEdhbWVwYWRTdG9wUnVtYmxlKTogdm9pZCB7IGVtaXQoXCJnYW1lcGFkLnN0b3BSdW1ibGVcIiwgdmFsdWUpOyB9LFxuICB9LFxuICBtYXA6IHtcbiAgICBmb2N1cyh2YWx1ZTogRm9jdXMpOiB2b2lkIHsgZW1pdChcIm1hcC5mb2N1c1wiLCB2YWx1ZSk7IH0sXG4gICAganVtcCh2YWx1ZTogSnVtcCk6IHZvaWQgeyBlbWl0KFwibWFwLmp1bXBcIiwgdmFsdWUpOyB9LFxuICAgIGxlbnModmFsdWU6IExlbnMpOiB2b2lkIHsgZW1pdChcIm1hcC5sZW5zXCIsIHZhbHVlKTsgfSxcbiAgICBzZWxlY3QodmFsdWU6IFNlbGVjdCk6IHZvaWQgeyBlbWl0KFwibWFwLnNlbGVjdFwiLCB2YWx1ZSk7IH0sXG4gICAgd29ybGQoKTogUHJvbWlzZTxXb3JsZEluZm8+IHsgcmV0dXJuIHJlcXVlc3QoXCJtYXAud29ybGRcIiwgbnVsbCk7IH0sXG4gIH0sXG4gIHdpbmRvdzoge1xuICAgIHNpemUoKTogUHJvbWlzZTxXaW5kb3dTaXplPiB7IHJldHVybiByZXF1ZXN0KFwid2luZG93LnNpemVcIiwgbnVsbCk7IH0sXG4gIH0sXG59IGFzIGNvbnN0O1xuIiwgImltcG9ydCB0eXBlIHsgSWNvbk5hbWUgfSBmcm9tIFwiLi91aS9JY29uXCI7XG5cbmV4cG9ydCB0eXBlIEVyYSA9IHsgbmFtZTogc3RyaW5nOyBjb2x1bW5zOiBudW1iZXIgfTtcblxuLyoqIFRoZSB0cmVlJ3MgZXJhcywgbGVmdCB0byByaWdodCwgYW5kIGhvdyBtYW55IGNvbHVtbnMgZWFjaCBzcGFucy4gKi9cbmV4cG9ydCBjb25zdCBFUkFTOiBFcmFbXSA9IFtcbiAgeyBuYW1lOiBcIkFuY2llbnQgRXJhXCIsIGNvbHVtbnM6IDMgfSxcbiAgeyBuYW1lOiBcIkNsYXNzaWNhbCBFcmFcIiwgY29sdW1uczogMiB9LFxuICB7IG5hbWU6IFwiTWVkaWV2YWwgRXJhXCIsIGNvbHVtbnM6IDIgfSxcbiAgeyBuYW1lOiBcIlJlbmFpc3NhbmNlIEVyYVwiLCBjb2x1bW5zOiAyIH0sXG5dO1xuXG5leHBvcnQgdHlwZSBUZWNoID0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGNvbDogbnVtYmVyO1xuICByb3c6IG51bWJlcjtcbiAgY29zdDogbnVtYmVyO1xuICByZXF1aXJlczogc3RyaW5nW107XG4gIGljb246IEljb25OYW1lO1xuICAvKiogV2hhdCBpdCB1bmxvY2tzLCBhcyBzbWFsbCBpY29ucyB3aXRoIGNhcHRpb25zLiAqL1xuICB1bmxvY2tzOiB7IGljb246IEljb25OYW1lOyBuYW1lOiBzdHJpbmcgfVtdO1xuICAvKiogQSBkZWVkIHRoYXQgc3BlZWRzIGl0IHVwLiAqL1xuICBib29zdDogc3RyaW5nO1xufTtcblxuY29uc3QgdCA9IChcbiAgaWQ6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nLFxuICBjb2w6IG51bWJlcixcbiAgcm93OiBudW1iZXIsXG4gIHJlcXVpcmVzOiBzdHJpbmdbXSxcbiAgaWNvbjogSWNvbk5hbWUsXG4gIHVubG9ja3M6IFtJY29uTmFtZSwgc3RyaW5nXVtdLFxuICBib29zdDogc3RyaW5nLFxuKTogVGVjaCA9PiAoe1xuICBpZCxcbiAgbmFtZSxcbiAgY29sLFxuICByb3csXG4gIGNvc3Q6IDMwICsgY29sICogY29sICogNyArIGNvbCAqIDEwLFxuICByZXF1aXJlcyxcbiAgaWNvbixcbiAgdW5sb2NrczogdW5sb2Nrcy5tYXAoKFtpY29uLCBuYW1lXSkgPT4gKHsgaWNvbiwgbmFtZSB9KSksXG4gIGJvb3N0LFxufSk7XG5cbmV4cG9ydCBjb25zdCBURUNIUzogVGVjaFtdID0gW1xuICB0KFxuICAgIFwicG90dGVyeVwiLFxuICAgIFwiUG90dGVyeVwiLFxuICAgIDAsXG4gICAgMCxcbiAgICBbXSxcbiAgICBcImZvb2RcIixcbiAgICBbW1wiZm9vZFwiLCBcIkdyYW5hcnlcIl1dLFxuICAgIFwiRm91bmQgYSBjaXR5XCIsXG4gICksXG4gIHQoXG4gICAgXCJodXNiYW5kcnlcIixcbiAgICBcIkFuaW1hbCBIdXNiYW5kcnlcIixcbiAgICAwLFxuICAgIDIsXG4gICAgW10sXG4gICAgXCJtb3ZlbWVudFwiLFxuICAgIFtbXCJtYXBcIiwgXCJQYXN0dXJlXCJdXSxcbiAgICBcIkZpbmQgaG9yc2VzXCIsXG4gICksXG4gIHQoXG4gICAgXCJtaW5pbmdcIixcbiAgICBcIk1pbmluZ1wiLFxuICAgIDAsXG4gICAgNCxcbiAgICBbXSxcbiAgICBcInByb2R1Y3Rpb25cIixcbiAgICBbW1wicHJvZHVjdGlvblwiLCBcIk1pbmVcIl1dLFxuICAgIFwiU2V0dGxlIG5lYXIgaGlsbHNcIixcbiAgKSxcbiAgdChcbiAgICBcInNhaWxpbmdcIixcbiAgICBcIlNhaWxpbmdcIixcbiAgICAwLFxuICAgIDYsXG4gICAgW10sXG4gICAgXCJhbmNob3JcIixcbiAgICBbW1wiYW5jaG9yXCIsIFwiR2FsbGV5XCJdXSxcbiAgICBcIkZvdW5kIGEgY2l0eSBvbiB0aGUgY29hc3RcIixcbiAgKSxcbiAgdChcbiAgICBcImlycmlnYXRpb25cIixcbiAgICBcIklycmlnYXRpb25cIixcbiAgICAxLFxuICAgIDAsXG4gICAgW1wicG90dGVyeVwiXSxcbiAgICBcImZvb2RcIixcbiAgICBbW1wiZm9vZFwiLCBcIkZhcm0gb24gcGxhaW5zXCJdXSxcbiAgICBcIkZhcm0gYSByZXNvdXJjZVwiLFxuICApLFxuICB0KFxuICAgIFwid3JpdGluZ1wiLFxuICAgIFwiV3JpdGluZ1wiLFxuICAgIDEsXG4gICAgMSxcbiAgICBbXCJwb3R0ZXJ5XCJdLFxuICAgIFwiYm9va1wiLFxuICAgIFtbXCJzY2llbmNlXCIsIFwiQ2FtcHVzXCJdXSxcbiAgICBcIk1lZXQgYW5vdGhlciBjaXZpbGl6YXRpb25cIixcbiAgKSxcbiAgdChcbiAgICBcImFyY2hlcnlcIixcbiAgICBcIkFyY2hlcnlcIixcbiAgICAxLFxuICAgIDIsXG4gICAgW1wiaHVzYmFuZHJ5XCJdLFxuICAgIFwiYm93XCIsXG4gICAgW1tcImJvd1wiLCBcIkFyY2hlclwiXV0sXG4gICAgXCJLaWxsIGEgdW5pdCB3aXRoIGEgc2xpbmdlclwiLFxuICApLFxuICB0KFxuICAgIFwibWFzb25yeVwiLFxuICAgIFwiTWFzb25yeVwiLFxuICAgIDEsXG4gICAgNCxcbiAgICBbXCJtaW5pbmdcIl0sXG4gICAgXCJjYXN0bGVcIixcbiAgICBbW1wiY2FzdGxlXCIsIFwiQW5jaWVudCBXYWxsc1wiXV0sXG4gICAgXCJCdWlsZCBhIHF1YXJyeVwiLFxuICApLFxuICB0KFxuICAgIFwiYnJvbnplXCIsXG4gICAgXCJCcm9uemUgV29ya2luZ1wiLFxuICAgIDEsXG4gICAgNSxcbiAgICBbXCJtaW5pbmdcIl0sXG4gICAgXCJzdHJlbmd0aFwiLFxuICAgIFtbXCJzdHJlbmd0aFwiLCBcIlNwZWFybWFuXCJdXSxcbiAgICBcIktpbGwgdGhyZWUgYmFyYmFyaWFuc1wiLFxuICApLFxuICB0KFxuICAgIFwiYXN0cm9sb2d5XCIsXG4gICAgXCJBc3Ryb2xvZ3lcIixcbiAgICAxLFxuICAgIDYsXG4gICAgW1wic2FpbGluZ1wiXSxcbiAgICBcImZhaXRoXCIsXG4gICAgW1tcImZhaXRoXCIsIFwiSG9seSBTaXRlXCJdXSxcbiAgICBcIkZpbmQgYSBuYXR1cmFsIHdvbmRlclwiLFxuICApLFxuICB0KFxuICAgIFwid2hlZWxcIixcbiAgICBcIlRoZSBXaGVlbFwiLFxuICAgIDIsXG4gICAgMyxcbiAgICBbXCJtaW5pbmdcIiwgXCJodXNiYW5kcnlcIl0sXG4gICAgXCJtb3ZlbWVudFwiLFxuICAgIFtbXCJtb3ZlbWVudFwiLCBcIkhlYXZ5IENoYXJpb3RcIl1dLFxuICAgIFwiTWluZSBhIHJlc291cmNlXCIsXG4gICksXG4gIHQoXG4gICAgXCJjdXJyZW5jeVwiLFxuICAgIFwiQ3VycmVuY3lcIixcbiAgICAzLFxuICAgIDEsXG4gICAgW1wid3JpdGluZ1wiXSxcbiAgICBcImdvbGRcIixcbiAgICBbW1wiZ29sZFwiLCBcIk1hcmtldFwiXV0sXG4gICAgXCJNYWtlIGEgdHJhZGUgcm91dGVcIixcbiAgKSxcbiAgdChcbiAgICBcInJpZGluZ1wiLFxuICAgIFwiSG9yc2ViYWNrIFJpZGluZ1wiLFxuICAgIDMsXG4gICAgMixcbiAgICBbXCJhcmNoZXJ5XCJdLFxuICAgIFwibW92ZW1lbnRcIixcbiAgICBbW1wibW92ZW1lbnRcIiwgXCJIb3JzZW1hblwiXV0sXG4gICAgXCJCdWlsZCBhIHBhc3R1cmVcIixcbiAgKSxcbiAgdChcbiAgICBcImlyb25cIixcbiAgICBcIklyb24gV29ya2luZ1wiLFxuICAgIDMsXG4gICAgNSxcbiAgICBbXCJicm9uemVcIl0sXG4gICAgXCJzdHJlbmd0aFwiLFxuICAgIFtbXCJzdHJlbmd0aFwiLCBcIlN3b3Jkc21hblwiXV0sXG4gICAgXCJCdWlsZCBhbiBpcm9uIG1pbmVcIixcbiAgKSxcbiAgdChcbiAgICBcIm5hdmlnYXRpb25cIixcbiAgICBcIkNlbGVzdGlhbCBOYXZpZ2F0aW9uXCIsXG4gICAgMyxcbiAgICA2LFxuICAgIFtcInNhaWxpbmdcIiwgXCJhc3Ryb2xvZ3lcIl0sXG4gICAgXCJhbmNob3JcIixcbiAgICBbW1wiYW5jaG9yXCIsIFwiSGFyYm9yXCJdXSxcbiAgICBcIkltcHJvdmUgdHdvIHNlYSByZXNvdXJjZXNcIixcbiAgKSxcbiAgdChcbiAgICBcIm1hdGhlbWF0aWNzXCIsXG4gICAgXCJNYXRoZW1hdGljc1wiLFxuICAgIDQsXG4gICAgMSxcbiAgICBbXCJjdXJyZW5jeVwiXSxcbiAgICBcInNjaWVuY2VcIixcbiAgICBbW1wic2NpZW5jZVwiLCBcIisxIG1vdmVtZW50IGF0IHNlYVwiXV0sXG4gICAgXCJCdWlsZCB0aHJlZSBkaXN0cmljdHNcIixcbiAgKSxcbiAgdChcbiAgICBcImNvbnN0cnVjdGlvblwiLFxuICAgIFwiQ29uc3RydWN0aW9uXCIsXG4gICAgNCxcbiAgICAzLFxuICAgIFtcIm1hc29ucnlcIiwgXCJ3aGVlbFwiXSxcbiAgICBcImNhc3RsZVwiLFxuICAgIFtbXCJjdWx0dXJlXCIsIFwiQW1waGl0aGVhdGVyXCJdXSxcbiAgICBcIkJ1aWxkIGEgd2F0ZXIgbWlsbFwiLFxuICApLFxuICB0KFxuICAgIFwic2hpcGJ1aWxkaW5nXCIsXG4gICAgXCJTaGlwYnVpbGRpbmdcIixcbiAgICA0LFxuICAgIDYsXG4gICAgW1wibmF2aWdhdGlvblwiXSxcbiAgICBcImFuY2hvclwiLFxuICAgIFtbXCJhbmNob3JcIiwgXCJRdWFkcmlyZW1lXCJdXSxcbiAgICBcIk93biB0d28gZ2FsbGV5c1wiLFxuICApLFxuICB0KFxuICAgIFwiZW5naW5lZXJpbmdcIixcbiAgICBcIkVuZ2luZWVyaW5nXCIsXG4gICAgNCxcbiAgICA0LFxuICAgIFtcIndoZWVsXCJdLFxuICAgIFwicHJvZHVjdGlvblwiLFxuICAgIFtbXCJjYXN0bGVcIiwgXCJBcXVlZHVjdFwiXV0sXG4gICAgXCJCdWlsZCBhbmNpZW50IHdhbGxzXCIsXG4gICksXG4gIHQoXG4gICAgXCJ0YWN0aWNzXCIsXG4gICAgXCJNaWxpdGFyeSBUYWN0aWNzXCIsXG4gICAgNSxcbiAgICAyLFxuICAgIFtcIm1hdGhlbWF0aWNzXCJdLFxuICAgIFwic3RyZW5ndGhcIixcbiAgICBbW1wic3RyZW5ndGhcIiwgXCJQaWtlbWFuXCJdXSxcbiAgICBcIktpbGwgYSB1bml0IHdpdGggYSBzcGVhcm1hblwiLFxuICApLFxuICB0KFxuICAgIFwiYXBwcmVudGljZXNoaXBcIixcbiAgICBcIkFwcHJlbnRpY2VzaGlwXCIsXG4gICAgNSxcbiAgICA0LFxuICAgIFtcImN1cnJlbmN5XCIsIFwiZW5naW5lZXJpbmdcIl0sXG4gICAgXCJwcm9kdWN0aW9uXCIsXG4gICAgW1tcInByb2R1Y3Rpb25cIiwgXCJJbmR1c3RyaWFsIFpvbmVcIl1dLFxuICAgIFwiQnVpbGQgdGhyZWUgbWluZXNcIixcbiAgKSxcbiAgdChcbiAgICBcIm1hY2hpbmVyeVwiLFxuICAgIFwiTWFjaGluZXJ5XCIsXG4gICAgNixcbiAgICAzLFxuICAgIFtcImlyb25cIiwgXCJlbmdpbmVlcmluZ1wiXSxcbiAgICBcInByb2R1Y3Rpb25cIixcbiAgICBbW1wiYm93XCIsIFwiQ3Jvc3Nib3dtYW5cIl1dLFxuICAgIFwiT3duIHRocmVlIGFyY2hlcnNcIixcbiAgKSxcbiAgdChcbiAgICBcImVkdWNhdGlvblwiLFxuICAgIFwiRWR1Y2F0aW9uXCIsXG4gICAgNixcbiAgICAxLFxuICAgIFtcIm1hdGhlbWF0aWNzXCIsIFwiYXBwcmVudGljZXNoaXBcIl0sXG4gICAgXCJib29rXCIsXG4gICAgW1tcImJvb2tcIiwgXCJVbml2ZXJzaXR5XCJdXSxcbiAgICBcIkVhcm4gYSBHcmVhdCBTY2llbnRpc3RcIixcbiAgKSxcbiAgdChcbiAgICBcInN0aXJydXBzXCIsXG4gICAgXCJTdGlycnVwc1wiLFxuICAgIDYsXG4gICAgMixcbiAgICBbXCJyaWRpbmdcIl0sXG4gICAgXCJtb3ZlbWVudFwiLFxuICAgIFtbXCJtb3ZlbWVudFwiLCBcIktuaWdodFwiXV0sXG4gICAgXCJIYXZlIHRoZSBGZXVkYWxpc20gY2l2aWNcIixcbiAgKSxcbiAgdChcbiAgICBcImVuZ2luZWVyc1wiLFxuICAgIFwiTWlsaXRhcnkgRW5naW5lZXJpbmdcIixcbiAgICA1LFxuICAgIDUsXG4gICAgW1wiY29uc3RydWN0aW9uXCJdLFxuICAgIFwiY2FzdGxlXCIsXG4gICAgW1tcImNhc3RsZVwiLCBcIk1lZGlldmFsIFdhbGxzXCJdXSxcbiAgICBcIkJ1aWxkIGFuIGFxdWVkdWN0XCIsXG4gICksXG4gIHQoXG4gICAgXCJjYXN0bGVzXCIsXG4gICAgXCJDYXN0bGVzXCIsXG4gICAgNixcbiAgICA1LFxuICAgIFtcImVuZ2luZWVyc1wiXSxcbiAgICBcImNhc3RsZVwiLFxuICAgIFtbXCJjYXN0bGVcIiwgXCJGb3J0cmVzc1wiXV0sXG4gICAgXCJIYXZlIGEgZ292ZXJubWVudCB3aXRoIHNpeCBzbG90c1wiLFxuICApLFxuICB0KFxuICAgIFwiY2FydG9ncmFwaHlcIixcbiAgICBcIkNhcnRvZ3JhcGh5XCIsXG4gICAgNyxcbiAgICA2LFxuICAgIFtcInNoaXBidWlsZGluZ1wiXSxcbiAgICBcIm1hcFwiLFxuICAgIFtbXCJhbmNob3JcIiwgXCJDYXJhdmVsXCJdXSxcbiAgICBcIkJ1aWxkIHR3byBoYXJib3JzXCIsXG4gICksXG4gIHQoXG4gICAgXCJwcm9kdWN0aW9uXCIsXG4gICAgXCJNYXNzIFByb2R1Y3Rpb25cIixcbiAgICA3LFxuICAgIDQsXG4gICAgW1wiZWR1Y2F0aW9uXCIsIFwic2hpcGJ1aWxkaW5nXCJdLFxuICAgIFwicHJvZHVjdGlvblwiLFxuICAgIFtbXCJwcm9kdWN0aW9uXCIsIFwiTHVtYmVyIG1pbGxcIl1dLFxuICAgIFwiQnVpbGQgYSB3YXRlciBtaWxsXCIsXG4gICksXG4gIHQoXG4gICAgXCJiYW5raW5nXCIsXG4gICAgXCJCYW5raW5nXCIsXG4gICAgNyxcbiAgICAxLFxuICAgIFtcImVkdWNhdGlvblwiLCBcImFwcHJlbnRpY2VzaGlwXCJdLFxuICAgIFwiZ29sZFwiLFxuICAgIFtbXCJnb2xkXCIsIFwiQmFua1wiXV0sXG4gICAgXCJIYXZlIHRoZSBHdWlsZHMgY2l2aWNcIixcbiAgKSxcbiAgdChcbiAgICBcImd1bnBvd2RlclwiLFxuICAgIFwiR3VucG93ZGVyXCIsXG4gICAgNyxcbiAgICAzLFxuICAgIFtcIm1hY2hpbmVyeVwiLCBcImFwcHJlbnRpY2VzaGlwXCJdLFxuICAgIFwic3RyZW5ndGhcIixcbiAgICBbW1wic3RyZW5ndGhcIiwgXCJNdXNrZXRtYW5cIl1dLFxuICAgIFwiQnVpbGQgYW4gYXJtb3J5XCIsXG4gICksXG4gIHQoXG4gICAgXCJwcmludGluZ1wiLFxuICAgIFwiUHJpbnRpbmdcIixcbiAgICA4LFxuICAgIDIsXG4gICAgW1wibWFjaGluZXJ5XCJdLFxuICAgIFwiYm9va1wiLFxuICAgIFtbXCJib29rXCIsIFwiUHJpbnRpbmcgcHJlc3NcIl1dLFxuICAgIFwiQnVpbGQgdHdvIHVuaXZlcnNpdGllc1wiLFxuICApLFxuICB0KFxuICAgIFwiYXN0cm9ub215XCIsXG4gICAgXCJBc3Ryb25vbXlcIixcbiAgICA4LFxuICAgIDAsXG4gICAgW1wiZWR1Y2F0aW9uXCJdLFxuICAgIFwiZXllXCIsXG4gICAgW1tcInNjaWVuY2VcIiwgXCJPYnNlcnZhdG9yeVwiXV0sXG4gICAgXCJCdWlsZCBhIHVuaXZlcnNpdHkgbmV4dCB0byBhIG1vdW50YWluXCIsXG4gICksXG4gIHQoXG4gICAgXCJzaWVnZVwiLFxuICAgIFwiU2llZ2UgVGFjdGljc1wiLFxuICAgIDgsXG4gICAgNSxcbiAgICBbXCJjYXN0bGVzXCIsIFwiZ3VucG93ZGVyXCJdLFxuICAgIFwic3RyZW5ndGhcIixcbiAgICBbW1wic3RyZW5ndGhcIiwgXCJCb21iYXJkXCJdXSxcbiAgICBcIk93biB0d28gaGVhdnkgY2hhcmlvdHNcIixcbiAgKSxcbl07XG5cbmV4cG9ydCBjb25zdCB0ZWNoID0gKGlkOiBzdHJpbmcpID0+IFRFQ0hTLmZpbmQoKHQpID0+IHQuaWQgPT09IGlkKSE7XG5cbi8qKiBXaGF0IHRoZSBlbXBpcmUga25vd3MgYXQgdGhlIHN0YXJ0OiB0aGUgYW5jaWVudCBhbmQgY2xhc3NpY2FsIGVyYXNcbiAqICAoYmFyIGEgc3RyYWdnbGVyKSBhbmQgdGhlIGZpcnN0IG9mIHRoZSBtZWRpZXZhbC4gKi9cbmV4cG9ydCBjb25zdCBTVEFSVElOR19URUNIUyA9IFRFQ0hTLmZpbHRlcihcbiAgKHQpID0+XG4gICAgKHQuY29sIDw9IDQgJiYgdC5pZCAhPT0gXCJzaGlwYnVpbGRpbmdcIikgfHxcbiAgICBbXCJ0YWN0aWNzXCIsIFwiYXBwcmVudGljZXNoaXBcIiwgXCJlbmdpbmVlcnNcIl0uaW5jbHVkZXModC5pZCksXG4pLm1hcCgodCkgPT4gdC5pZCk7XG5cbmV4cG9ydCBjb25zdCBDSVZJQ1MgPSBbXG4gIFwiUG9saXRpY2FsIFBoaWxvc29waHlcIixcbiAgXCJEcmFtYSBhbmQgUG9ldHJ5XCIsXG4gIFwiTWlsaXRhcnkgVHJhaW5pbmdcIixcbiAgXCJEZWZlbnNpdmUgVGFjdGljc1wiLFxuICBcIlJlY29yZGVkIEhpc3RvcnlcIixcbiAgXCJUaGVvbG9neVwiLFxuICBcIk5hdmFsIFRyYWRpdGlvblwiLFxuICBcIkZldWRhbGlzbVwiLFxuICBcIkNpdmlsIFNlcnZpY2VcIixcbiAgXCJNZXJjZW5hcmllc1wiLFxuICBcIk1lZGlldmFsIEZhaXJlc1wiLFxuICBcIkd1aWxkc1wiLFxuXTtcbiIsICJpbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5cbi8qKiBDaXZpbGl6YXRpb24ncyBsb29rLCBhZnRlciB0aGUgZ3JlYXQgNFggaW50ZXJmYWNlczogZGVlcCBuYXZ5IHBhbmVscyBpbiBmaW5lXG4gKiAgZ29sZCBmcmFtZXMsIHBhcmNobWVudC13aGl0ZSB0eXBlLCBjYXJ2ZWQgY2FwaXRhbHMgZm9yIHRpdGxlcywgYW5kIG9uZVxuICogIGNvbG9yIHBlciBraW5kIG9mIHlpZWxkLiAqL1xuZXhwb3J0IGNvbnN0IEMgPSB7XG4gIGluazogXCIjMDYwZDE1XCIsXG4gIG5hdnk6IFwiIzBkMTgyNlwiLFxuICBuYXZ5SGk6IFwiIzFiMmQ0NFwiLFxuICBzbGF0ZTogXCIjMjIzODRmXCIsXG4gIHNsYXRlSGk6IFwiIzJlNGI2OVwiLFxuICBnb2xkOiBcIiNkOWI3NmNcIixcbiAgZ29sZEhpOiBcIiNmNmU0YThcIixcbiAgZ29sZExvOiBcIiM4YTZiMzVcIixcbiAgZ29sZExpbmU6IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjQ1KVwiLFxuICB0ZXh0OiBcIiNmMGU4ZDZcIixcbiAgbXV0ZWQ6IFwiI2EyYjNjNlwiLFxuICBmYWludDogXCIjNjI3NzhkXCIsXG4gIGdvb2Q6IFwiIzdhZDM1ZVwiLFxuICBiYWQ6IFwiI2VjNjQ1MFwiLFxuICAvLyBUaGUgeWllbGRzLlxuICBmb29kOiBcIiM4ZmQzNGZcIixcbiAgcHJvZHVjdGlvbjogXCIjZjA5YjNkXCIsXG4gIGNvaW46IFwiI2Y2Y2Y0YVwiLFxuICBzY2llbmNlOiBcIiM1ZmJmZjRcIixcbiAgY3VsdHVyZTogXCIjZDA4YWVmXCIsXG4gIGZhaXRoOiBcIiNlNGRlZmVcIixcbn07XG5cbmV4cG9ydCBjb25zdCBGb250cyA9IHtcbiAgLyoqIENhcnZlZCBSb21hbiBjYXBpdGFscywgZm9yIHRpdGxlcy4gKi9cbiAgZGlzcGxheTogXCJDaW56ZWxcIixcbn07XG5cbmV4cG9ydCB0eXBlIFlpZWxkS2V5ID1cbiAgfCBcImZvb2RcIlxuICB8IFwicHJvZHVjdGlvblwiXG4gIHwgXCJnb2xkXCJcbiAgfCBcInNjaWVuY2VcIlxuICB8IFwiY3VsdHVyZVwiXG4gIHwgXCJmYWl0aFwiO1xuXG5leHBvcnQgY29uc3QgWUlFTERTOiB7IGtleTogWWllbGRLZXk7IG5hbWU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9W10gPSBbXG4gIHsga2V5OiBcImZvb2RcIiwgbmFtZTogXCJGb29kXCIsIGNvbG9yOiBDLmZvb2QgfSxcbiAgeyBrZXk6IFwicHJvZHVjdGlvblwiLCBuYW1lOiBcIlByb2R1Y3Rpb25cIiwgY29sb3I6IEMucHJvZHVjdGlvbiB9LFxuICB7IGtleTogXCJnb2xkXCIsIG5hbWU6IFwiR29sZFwiLCBjb2xvcjogQy5jb2luIH0sXG4gIHsga2V5OiBcInNjaWVuY2VcIiwgbmFtZTogXCJTY2llbmNlXCIsIGNvbG9yOiBDLnNjaWVuY2UgfSxcbiAgeyBrZXk6IFwiY3VsdHVyZVwiLCBuYW1lOiBcIkN1bHR1cmVcIiwgY29sb3I6IEMuY3VsdHVyZSB9LFxuICB7IGtleTogXCJmYWl0aFwiLCBuYW1lOiBcIkZhaXRoXCIsIGNvbG9yOiBDLmZhaXRoIH0sXG5dO1xuXG4vKiogVGhlIGZyYW1lZCBuYXZ5IHBhbmVsIG5lYXJseSBldmVyeXRoaW5nIHNpdHMgb24uICovXG5leHBvcnQgY29uc3QgcGFuZWw6IEJldnlTdHlsZSA9IHtcbiAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICBhbmdsZTogMTgwLFxuICAgIHN0b3BzOiBbeyBjb2xvcjogQy5uYXZ5SGkgfSwgeyBjb2xvcjogQy5uYXZ5IH1dLFxuICB9LFxuICBib3JkZXI6IDEsXG4gIGJvcmRlckNvbG9yOiBDLmdvbGRMbyxcbiAgYm9yZGVyUmFkaXVzOiAzLFxuICBib3hTaGFkb3c6IHsgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjU1KVwiLCBibHVyUmFkaXVzOiAxNiwgeU9mZnNldDogNSB9LFxufTtcblxuLyoqIEJydXNoZWQgZ29sZCwgZm9yIHJpbmdzIGFuZCBmcmFtZXMuICovXG5leHBvcnQgY29uc3QgZ2lsdDogQmV2eVN0eWxlW1wiYmFja2dyb3VuZEdyYWRpZW50XCJdID0ge1xuICB0eXBlOiBcImxpbmVhclwiLFxuICBhbmdsZTogMTYwLFxuICBzdG9wczogW1xuICAgIHsgY29sb3I6IEMuZ29sZEhpIH0sXG4gICAgeyBjb2xvcjogQy5nb2xkIH0sXG4gICAgeyBjb2xvcjogQy5nb2xkTG8gfSxcbiAgICB7IGNvbG9yOiBDLmdvbGQgfSxcbiAgXSxcbn07XG5cbi8qKiBTbWFsbCBzcGFjZWQgY2FwaXRhbHM6IHNlY3Rpb24gdGl0bGVzIGFuZCBsYWJlbHMuICovXG5leHBvcnQgY29uc3QgY2FwczogQmV2eVN0eWxlID0ge1xuICBmb250U2l6ZTogMTEsXG4gIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbiAgbGV0dGVyU3BhY2luZzogMS42LFxuICBjb2xvcjogQy5nb2xkLFxuICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG59O1xuXG4vKiogQSBwYW5lbCdzIGBob3ZlclN0eWxlYC4gQW55IGhvdmVyIHN0eWxlIG1ha2VzIGEgbm9kZSBpbnRlcmFjdGl2ZSwgYW5kXG4gKiAgaG92ZXJpbmcgYW4gaW50ZXJhY3RpdmUgbm9kZSBpcyB3aGF0IGBQb2ludGVyQ2FwdHVyZWAgcmVwb3J0cyBhcyB0aGVcbiAqICBwb2ludGVyIGJlaW5nIHRoZSBVSSdzIOKAlCBzbyB0aGUgbWFwIHVuZGVybmVhdGggYSBwYW5lbCBpZ25vcmVzIGl0LiAqL1xuZXhwb3J0IGNvbnN0IE9XTlNfUE9JTlRFUiA9IHt9O1xuXG4vKiogQSB5aWVsZDogd2hvbGUgYWJvdmUgYSBodW5kcmVkIG9yIHdoZW4gaXQgaXMgb25lLCBlbHNlIG9uZSBkZWNpbWFsLiAqL1xuZXhwb3J0IGNvbnN0IGZtdCA9IChuOiBudW1iZXIpID0+XG4gIE1hdGguYWJzKG4pID49IDEwMCB8fCBNYXRoLmFicyhuIC0gTWF0aC5yb3VuZChuKSkgPCAwLjA1XG4gICAgPyBNYXRoLnJvdW5kKG4pLnRvU3RyaW5nKClcbiAgICA6IG4udG9GaXhlZCgxKTtcblxuZXhwb3J0IGNvbnN0IHNpZ25lZCA9IChuOiBudW1iZXIpID0+IChuID49IDAgPyBgKyR7Zm10KG4pfWAgOiBmbXQobikpO1xuXG4vKiogYGhleGAgbGlnaHRlbmVkIHRvd2FyZCB3aGl0ZSAoYGsgPiAxYCkgb3IgZGFya2VuZWQgKGBrIDwgMWApLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvbmUoaGV4OiBzdHJpbmcsIGs6IG51bWJlcikge1xuICBjb25zdCBuID0gcGFyc2VJbnQoaGV4LnNsaWNlKDEsIDcpLCAxNik7XG4gIHJldHVybiAoXG4gICAgXCIjXCIgK1xuICAgIFsobiA+PiAxNikgJiAyNTUsIChuID4+IDgpICYgMjU1LCBuICYgMjU1XVxuICAgICAgLm1hcCgoYykgPT4gKGsgPj0gMSA/IGMgKyAoMjU1IC0gYykgKiAoayAtIDEpIDogYyAqIGspKVxuICAgICAgLm1hcCgoYykgPT5cbiAgICAgICAgTWF0aC5yb3VuZChNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIGMpKSlcbiAgICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgICAgLnBhZFN0YXJ0KDIsIFwiMFwiKSxcbiAgICAgIClcbiAgICAgIC5qb2luKFwiXCIpXG4gICk7XG59XG5cbi8qKiBgYWAgYmxlbmRlZCBgdGAgb2YgdGhlIHdheSB0byBgYmAgKG9wYXF1ZSBoZXggY29sb3JzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaXgoYTogc3RyaW5nLCBiOiBzdHJpbmcsIHQ6IG51bWJlcikge1xuICBjb25zdCBjaCA9IChoZXg6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IG4gPSBwYXJzZUludChoZXguc2xpY2UoMSwgNyksIDE2KTtcbiAgICByZXR1cm4gWyhuID4+IDE2KSAmIDI1NSwgKG4gPj4gOCkgJiAyNTUsIG4gJiAyNTVdO1xuICB9O1xuICBjb25zdCBbeCwgeV0gPSBbY2goYSksIGNoKGIpXTtcbiAgcmV0dXJuIChcbiAgICBcIiNcIiArXG4gICAgeFxuICAgICAgLm1hcCgoYywgaSkgPT5cbiAgICAgICAgTWF0aC5yb3VuZChjICsgKHlbaV0gLSBjKSAqIHQpXG4gICAgICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgICAgIC5wYWRTdGFydCgyLCBcIjBcIiksXG4gICAgICApXG4gICAgICAuam9pbihcIlwiKVxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgQ2l0eUluZm8sIENpdkluZm8sIFdvcmxkSW5mbywgWWllbGRzIH0gZnJvbSBcIi4vYmV2eVwiO1xuaW1wb3J0IHsgQ0lWSUNTLCBTVEFSVElOR19URUNIUywgdGVjaCB9IGZyb20gXCIuL3RlY2hzXCI7XG5pbXBvcnQgeyBDIH0gZnJvbSBcIi4vdGhlbWVcIjtcbmltcG9ydCB0eXBlIHsgSWNvbk5hbWUgfSBmcm9tIFwiLi91aS9JY29uXCI7XG5cbi8qKiBObyBnYW1lIGlzIHBsYXllZCBoZXJlOiB0aGUgZW1waXJlJ3MgbnVtYmVycyBhcmUgbWFkZSB1cCBmcm9tIHRoZSBtYXBcbiAqICAoZXZlcnkgY2l0eSdzIHlpZWxkcyBjb21lIGZyb20gdGhlIHRpbGVzIGFyb3VuZCBpdCkgYW5kIGEgc2VlZGVkXG4gKiAgcmFuZG9tIHdhbGsgZm9yIHRoZSBoaXN0b3J5IHRoZSBncmFwaHMgZHJhdy4gXCJOZXh0IHR1cm5cIiBhZHZhbmNlcyBpdFxuICogIGFsbCBhIHN0ZXAuICovXG5cbmNvbnN0IFNUQVJUX1RVUk4gPSAxMjg7XG5cbmV4cG9ydCB0eXBlIE1ldHJpYyA9XG4gIHwgXCJzY29yZVwiXG4gIHwgXCJzY2llbmNlXCJcbiAgfCBcImN1bHR1cmVcIlxuICB8IFwiZ29sZFwiXG4gIHwgXCJmYWl0aFwiXG4gIHwgXCJtaWxpdGFyeVwiXG4gIHwgXCJwb3B1bGF0aW9uXCI7XG5cbmV4cG9ydCBjb25zdCBNRVRSSUNTOiB7XG4gIGtleTogTWV0cmljO1xuICBuYW1lOiBzdHJpbmc7XG4gIHVuaXQ6IHN0cmluZztcbiAgY29sb3I6IHN0cmluZztcbiAgaWNvbjogSWNvbk5hbWU7XG59W10gPSBbXG4gIHtcbiAgICBrZXk6IFwic2NvcmVcIixcbiAgICBuYW1lOiBcIlNjb3JlXCIsXG4gICAgdW5pdDogXCJwb2ludHNcIixcbiAgICBjb2xvcjogQy5nb2xkSGksXG4gICAgaWNvbjogXCJ0cm9waHlcIixcbiAgfSxcbiAge1xuICAgIGtleTogXCJzY2llbmNlXCIsXG4gICAgbmFtZTogXCJTY2llbmNlXCIsXG4gICAgdW5pdDogXCJwZXIgdHVyblwiLFxuICAgIGNvbG9yOiBDLnNjaWVuY2UsXG4gICAgaWNvbjogXCJzY2llbmNlXCIsXG4gIH0sXG4gIHtcbiAgICBrZXk6IFwiY3VsdHVyZVwiLFxuICAgIG5hbWU6IFwiQ3VsdHVyZVwiLFxuICAgIHVuaXQ6IFwicGVyIHR1cm5cIixcbiAgICBjb2xvcjogQy5jdWx0dXJlLFxuICAgIGljb246IFwiY3VsdHVyZVwiLFxuICB9LFxuICB7IGtleTogXCJnb2xkXCIsIG5hbWU6IFwiR29sZFwiLCB1bml0OiBcInBlciB0dXJuXCIsIGNvbG9yOiBDLmNvaW4sIGljb246IFwiZ29sZFwiIH0sXG4gIHtcbiAgICBrZXk6IFwiZmFpdGhcIixcbiAgICBuYW1lOiBcIkZhaXRoXCIsXG4gICAgdW5pdDogXCJwZXIgdHVyblwiLFxuICAgIGNvbG9yOiBDLmZhaXRoLFxuICAgIGljb246IFwiZmFpdGhcIixcbiAgfSxcbiAge1xuICAgIGtleTogXCJtaWxpdGFyeVwiLFxuICAgIG5hbWU6IFwiTWlsaXRhcnlcIixcbiAgICB1bml0OiBcInN0cmVuZ3RoXCIsXG4gICAgY29sb3I6IEMuYmFkLFxuICAgIGljb246IFwic3RyZW5ndGhcIixcbiAgfSxcbiAge1xuICAgIGtleTogXCJwb3B1bGF0aW9uXCIsXG4gICAgbmFtZTogXCJQb3B1bGF0aW9uXCIsXG4gICAgdW5pdDogXCJjaXRpemVuc1wiLFxuICAgIGNvbG9yOiBDLmZvb2QsXG4gICAgaWNvbjogXCJwZXJzb25cIixcbiAgfSxcbl07XG5cbmV4cG9ydCB0eXBlIE5vdGUgPSB7XG4gIGlkOiBudW1iZXI7XG4gIGljb246IEljb25OYW1lO1xuICBjb2xvcjogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBib2R5OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBJdGVtID0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGtpbmQ6IFwiRGlzdHJpY3RcIiB8IFwiQnVpbGRpbmdcIiB8IFwiVW5pdFwiO1xuICBjb3N0OiBudW1iZXI7XG4gIGljb246IEljb25OYW1lO1xuICBlZmZlY3Q6IHN0cmluZztcbn07XG5cbmV4cG9ydCBjb25zdCBJVEVNUzogSXRlbVtdID0gW1xuICB7XG4gICAgaWQ6IFwiY2FtcHVzXCIsXG4gICAgbmFtZTogXCJDYW1wdXNcIixcbiAgICBraW5kOiBcIkRpc3RyaWN0XCIsXG4gICAgY29zdDogMTA4LFxuICAgIGljb246IFwic2NpZW5jZVwiLFxuICAgIGVmZmVjdDogXCIrMiBzY2llbmNlLCBHcmVhdCBTY2llbnRpc3QgcG9pbnRzXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJ0aGVhdGVyXCIsXG4gICAgbmFtZTogXCJUaGVhdGVyIFNxdWFyZVwiLFxuICAgIGtpbmQ6IFwiRGlzdHJpY3RcIixcbiAgICBjb3N0OiAxMDgsXG4gICAgaWNvbjogXCJjdWx0dXJlXCIsXG4gICAgZWZmZWN0OiBcIisyIGN1bHR1cmUsIEdyZWF0IFdyaXRlciBwb2ludHNcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcImhvbHlzaXRlXCIsXG4gICAgbmFtZTogXCJIb2x5IFNpdGVcIixcbiAgICBraW5kOiBcIkRpc3RyaWN0XCIsXG4gICAgY29zdDogMTA4LFxuICAgIGljb246IFwiZmFpdGhcIixcbiAgICBlZmZlY3Q6IFwiKzIgZmFpdGgsIEdyZWF0IFByb3BoZXQgcG9pbnRzXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJoYXJib3JcIixcbiAgICBuYW1lOiBcIkhhcmJvclwiLFxuICAgIGtpbmQ6IFwiRGlzdHJpY3RcIixcbiAgICBjb3N0OiAxMDgsXG4gICAgaWNvbjogXCJhbmNob3JcIixcbiAgICBlZmZlY3Q6IFwiKzIgZ29sZCwgKzEgdHJhZGUgcm91dGVcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcIm1vbnVtZW50XCIsXG4gICAgbmFtZTogXCJNb251bWVudFwiLFxuICAgIGtpbmQ6IFwiQnVpbGRpbmdcIixcbiAgICBjb3N0OiA2MCxcbiAgICBpY29uOiBcIm9iZWxpc2tcIixcbiAgICBlZmZlY3Q6IFwiKzIgY3VsdHVyZVwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwiZ3JhbmFyeVwiLFxuICAgIG5hbWU6IFwiR3JhbmFyeVwiLFxuICAgIGtpbmQ6IFwiQnVpbGRpbmdcIixcbiAgICBjb3N0OiA2NSxcbiAgICBpY29uOiBcImZvb2RcIixcbiAgICBlZmZlY3Q6IFwiKzEgZm9vZCwgKzIgaG91c2luZ1wiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwibGlicmFyeVwiLFxuICAgIG5hbWU6IFwiTGlicmFyeVwiLFxuICAgIGtpbmQ6IFwiQnVpbGRpbmdcIixcbiAgICBjb3N0OiA5MCxcbiAgICBpY29uOiBcImJvb2tcIixcbiAgICBlZmZlY3Q6IFwiKzIgc2NpZW5jZVwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2hyaW5lXCIsXG4gICAgbmFtZTogXCJTaHJpbmVcIixcbiAgICBraW5kOiBcIkJ1aWxkaW5nXCIsXG4gICAgY29zdDogNzAsXG4gICAgaWNvbjogXCJmYWl0aFwiLFxuICAgIGVmZmVjdDogXCIrMiBmYWl0aFwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwibWFya2V0XCIsXG4gICAgbmFtZTogXCJNYXJrZXRcIixcbiAgICBraW5kOiBcIkJ1aWxkaW5nXCIsXG4gICAgY29zdDogMTIwLFxuICAgIGljb246IFwiZ29sZFwiLFxuICAgIGVmZmVjdDogXCIrMyBnb2xkXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJ3YWxsc1wiLFxuICAgIG5hbWU6IFwiQW5jaWVudCBXYWxsc1wiLFxuICAgIGtpbmQ6IFwiQnVpbGRpbmdcIixcbiAgICBjb3N0OiA4MCxcbiAgICBpY29uOiBcImNhc3RsZVwiLFxuICAgIGVmZmVjdDogXCIrMTAwIGNpdHkgZGVmZW5zZVwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwid2FycmlvclwiLFxuICAgIG5hbWU6IFwiV2FycmlvclwiLFxuICAgIGtpbmQ6IFwiVW5pdFwiLFxuICAgIGNvc3Q6IDQwLFxuICAgIGljb246IFwic3RyZW5ndGhcIixcbiAgICBlZmZlY3Q6IFwiTWVsZWUgwrcgMjAgc3RyZW5ndGhcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcImFyY2hlclwiLFxuICAgIG5hbWU6IFwiQXJjaGVyXCIsXG4gICAga2luZDogXCJVbml0XCIsXG4gICAgY29zdDogNjAsXG4gICAgaWNvbjogXCJib3dcIixcbiAgICBlZmZlY3Q6IFwiUmFuZ2VkIMK3IDI1IHN0cmVuZ3RoXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJidWlsZGVyXCIsXG4gICAgbmFtZTogXCJCdWlsZGVyXCIsXG4gICAga2luZDogXCJVbml0XCIsXG4gICAgY29zdDogNTAsXG4gICAgaWNvbjogXCJwcm9kdWN0aW9uXCIsXG4gICAgZWZmZWN0OiBcIjMgYnVpbGQgY2hhcmdlc1wiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2V0dGxlclwiLFxuICAgIG5hbWU6IFwiU2V0dGxlclwiLFxuICAgIGtpbmQ6IFwiVW5pdFwiLFxuICAgIGNvc3Q6IDgwLFxuICAgIGljb246IFwiZmxhZ1wiLFxuICAgIGVmZmVjdDogXCJGb3VuZHMgYSBuZXcgY2l0eVwiLFxuICB9LFxuXTtcblxuZXhwb3J0IGNvbnN0IGl0ZW0gPSAoaWQ6IHN0cmluZykgPT4gSVRFTVMuZmluZCgoaSkgPT4gaS5pZCA9PT0gaWQpITtcblxuZXhwb3J0IHR5cGUgUHJvZHVjdGlvbiA9IHsgaXRlbTogc3RyaW5nOyBwcm9ncmVzczogbnVtYmVyIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2FtZSB7XG4gIHR1cm46IG51bWJlcjtcbiAgZ29sZDogbnVtYmVyO1xuICBmYWl0aDogbnVtYmVyO1xuICByZXNlYXJjaDogc3RyaW5nIHwgbnVsbDtcbiAgcmVzZWFyY2hlZDogc3RyaW5nW107XG4gIC8qKiBTY2llbmNlIGJhbmtlZCB0b3dhcmQgZWFjaCB0ZWNoLiAqL1xuICBwcm9ncmVzczogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgY2l2aWM6IG51bWJlcjtcbiAgY2l2aWNQcm9ncmVzczogbnVtYmVyO1xuICAvKiogVGhlIHBsYXllcidzIGNpdGllczogd2hhdCBlYWNoIGlzIGJ1aWxkaW5nLCBhbmQgd2hhdCBpdCBoYXMgYnVpbHQuICovXG4gIGJ1aWxkaW5nOiBSZWNvcmQ8c3RyaW5nLCBQcm9kdWN0aW9uPjtcbiAgYnVpbHQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgLyoqIFBlciBjaXYsIHBlciBtZXRyaWMsIG9uZSB2YWx1ZSBwZXIgdHVybiBzbyBmYXIuICovXG4gIGhpc3Rvcnk6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxNZXRyaWMsIG51bWJlcltdPj47XG4gIG5vdGVzOiBOb3RlW107XG4gIG5leHROb3RlOiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIEFjdGlvbiA9XG4gIHwgeyB0eXBlOiBcInR1cm5cIiB9XG4gIHwgeyB0eXBlOiBcInJlc2VhcmNoXCI7IHRlY2g6IHN0cmluZyB9XG4gIHwgeyB0eXBlOiBcInByb2R1Y2VcIjsgY2l0eTogc3RyaW5nOyBpdGVtOiBzdHJpbmcgfVxuICB8IHsgdHlwZTogXCJkaXNtaXNzXCI7IGlkOiBudW1iZXIgfTtcblxuZXhwb3J0IGNvbnN0IGNpdmljQ29zdCA9IChuOiBudW1iZXIpID0+IDE4MCArIG4gKiA0NTtcblxuLyoqIEEgc21hbGwgc2VlZGVkIGdlbmVyYXRvciAobXVsYmVycnkzMikuICovXG5leHBvcnQgZnVuY3Rpb24gcm5nKHNlZWQ6IG51bWJlcikge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHNlZWQgPSAoc2VlZCArIDB4NmQyYjc5ZjUpIHwgMDtcbiAgICBsZXQgdCA9IE1hdGguaW11bChzZWVkIF4gKHNlZWQgPj4+IDE1KSwgMSB8IHNlZWQpO1xuICAgIHQgPSAodCArIE1hdGguaW11bCh0IF4gKHQgPj4+IDcpLCA2MSB8IHQpKSBeIHQ7XG4gICAgcmV0dXJuICgodCBeICh0ID4+PiAxNCkpID4+PiAwKSAvIDQyOTQ5NjcyOTY7XG4gIH07XG59XG5cbmNvbnN0IHNlZWRPZiA9IChzOiBzdHJpbmcpID0+XG4gIFsuLi5zXS5yZWR1Y2UoXG4gICAgKGgsIGNoKSA9PiBNYXRoLmltdWwoaCBeIGNoLmNoYXJDb2RlQXQoMCksIDE2Nzc3NjE5KSxcbiAgICAyMTY2MTM2MjYxLFxuICApO1xuXG5leHBvcnQgZnVuY3Rpb24gdG90YWxzKFxuICBjaXRpZXM6IENpdHlJbmZvW10sXG4gIGNpdjogc3RyaW5nLFxuKTogWWllbGRzICYgeyBwb3B1bGF0aW9uOiBudW1iZXIgfSB7XG4gIGNvbnN0IHN1bSA9IHtcbiAgICBmb29kOiAwLFxuICAgIHByb2R1Y3Rpb246IDAsXG4gICAgZ29sZDogMCxcbiAgICBzY2llbmNlOiAwLFxuICAgIGN1bHR1cmU6IDAsXG4gICAgZmFpdGg6IDAsXG4gICAgcG9wdWxhdGlvbjogMCxcbiAgfTtcbiAgZm9yIChjb25zdCBjIG9mIGNpdGllcy5maWx0ZXIoKGMpID0+IGMuY2l2ID09PSBjaXYpKSB7XG4gICAgZm9yIChjb25zdCBrIG9mIFtcbiAgICAgIFwiZm9vZFwiLFxuICAgICAgXCJwcm9kdWN0aW9uXCIsXG4gICAgICBcImdvbGRcIixcbiAgICAgIFwic2NpZW5jZVwiLFxuICAgICAgXCJjdWx0dXJlXCIsXG4gICAgICBcImZhaXRoXCIsXG4gICAgXSBhcyBjb25zdCkge1xuICAgICAgc3VtW2tdICs9IGMueWllbGRzW2tdO1xuICAgIH1cbiAgICBzdW0ucG9wdWxhdGlvbiArPSBjLnBvcHVsYXRpb247XG4gIH1cbiAgcmV0dXJuIHN1bTtcbn1cblxuLyoqIGBmaW5hbGAgcmVhY2hlZCBieSBhIG5vaXN5IGdyb3d0aCBjdXJ2ZSBvdmVyIGB0dXJuc2AuICovXG5mdW5jdGlvbiBjdXJ2ZShmaW5hbDogbnVtYmVyLCB0dXJuczogbnVtYmVyLCBzZWVkOiBudW1iZXIsIHdvYmJsZTogbnVtYmVyKSB7XG4gIGNvbnN0IHIgPSBybmcoc2VlZCk7XG4gIGNvbnN0IHJhdzogbnVtYmVyW10gPSBbXTtcbiAgbGV0IGRyaWZ0ID0gMTtcbiAgZm9yIChsZXQgdCA9IDE7IHQgPD0gdHVybnM7IHQrKykge1xuICAgIGRyaWZ0ID0gZHJpZnQgKiAwLjg1ICsgKDEgKyAocigpIC0gMC41KSAqIHdvYmJsZSkgKiAwLjE1O1xuICAgIHJhdy5wdXNoKCgwLjAzICsgMC45NyAqIE1hdGgucG93KHQgLyB0dXJucywgMS43KSkgKiBkcmlmdCk7XG4gIH1cbiAgY29uc3QgayA9IGZpbmFsIC8gcmF3W3Jhdy5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIHJhdy5tYXAoKHYpID0+IHYgKiBrKTtcbn1cblxuZnVuY3Rpb24gc2NvcmUoaDogUmVjb3JkPE1ldHJpYywgbnVtYmVyW10+LCB0OiBudW1iZXIpIHtcbiAgcmV0dXJuIChcbiAgICA4ICtcbiAgICB0ICogMC41NSArXG4gICAgaC5wb3B1bGF0aW9uW3RdICogMyArXG4gICAgaC5zY2llbmNlW3RdICogMi4yICtcbiAgICBoLmN1bHR1cmVbdF0gKiAyICtcbiAgICBoLm1pbGl0YXJ5W3RdICogMC4zXG4gICk7XG59XG5cbmZ1bmN0aW9uIGhpc3Rvcnkod29ybGQ6IFdvcmxkSW5mbywgY2l2OiBDaXZJbmZvKTogUmVjb3JkPE1ldHJpYywgbnVtYmVyW10+IHtcbiAgY29uc3Qgc3VtID0gdG90YWxzKHdvcmxkLmNpdGllcywgY2l2LmlkKTtcbiAgY29uc3QgciA9IHJuZyhzZWVkT2YoY2l2LmlkKSk7XG4gIGNvbnN0IG4gPSBTVEFSVF9UVVJOIC0gMTtcbiAgY29uc3QgY2l0aWVzID0gd29ybGQuY2l0aWVzLmZpbHRlcigoYykgPT4gYy5jaXYgPT09IGNpdi5pZCkubGVuZ3RoO1xuICBjb25zdCBoID0ge1xuICAgIHNjaWVuY2U6IGN1cnZlKHN1bS5zY2llbmNlLCBuLCBzZWVkT2YoY2l2LmlkICsgXCJzXCIpLCAwLjUpLFxuICAgIGN1bHR1cmU6IGN1cnZlKHN1bS5jdWx0dXJlLCBuLCBzZWVkT2YoY2l2LmlkICsgXCJjXCIpLCAwLjYpLFxuICAgIGdvbGQ6IGN1cnZlKHN1bS5nb2xkLCBuLCBzZWVkT2YoY2l2LmlkICsgXCJnXCIpLCAwLjgpLFxuICAgIGZhaXRoOiBjdXJ2ZShNYXRoLm1heCgxLCBzdW0uZmFpdGgpLCBuLCBzZWVkT2YoY2l2LmlkICsgXCJmXCIpLCAwLjgpLFxuICAgIG1pbGl0YXJ5OiBjdXJ2ZSgyNSArIGNpdGllcyAqIDE0ICsgcigpICogNTAsIG4sIHNlZWRPZihjaXYuaWQgKyBcIm1cIiksIDIuNCksXG4gICAgcG9wdWxhdGlvbjogY3VydmUoc3VtLnBvcHVsYXRpb24sIG4sIHNlZWRPZihjaXYuaWQgKyBcInBcIiksIDAuMyksXG4gICAgc2NvcmU6IFtdIGFzIG51bWJlcltdLFxuICB9O1xuICBoLnNjb3JlID0gaC5zY2llbmNlLm1hcCgoXywgdCkgPT4gc2NvcmUoaCwgdCkpO1xuICByZXR1cm4gaDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5ld0dhbWUod29ybGQ6IFdvcmxkSW5mbyk6IEdhbWUge1xuICBjb25zdCBidWlsZGluZzogUmVjb3JkPHN0cmluZywgUHJvZHVjdGlvbj4gPSB7fTtcbiAgY29uc3QgYnVpbHQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xuICBjb25zdCBtaW5lID0gd29ybGQuY2l0aWVzLmZpbHRlcigoYykgPT4gYy5jaXYgPT09IHdvcmxkLmNpdnNbMF0uaWQpO1xuICBtaW5lLmZvckVhY2goKGMsIGkpID0+IHtcbiAgICBjb25zdCByID0gcm5nKHNlZWRPZihjLmlkKSk7XG4gICAgY29uc3Qgb3duZWQgPSBjLmNhcGl0YWxcbiAgICAgID8gW1wibW9udW1lbnRcIiwgXCJncmFuYXJ5XCIsIFwid2FsbHNcIiwgXCJjYW1wdXNcIiwgXCJsaWJyYXJ5XCJdXG4gICAgICA6IFtcIm1vbnVtZW50XCIsIFwiZ3JhbmFyeVwiLCBcInNocmluZVwiXS5zbGljZSgwLCAxICsgKGkgJSAzKSk7XG4gICAgYnVpbHRbYy5pZF0gPSBvd25lZDtcbiAgICBjb25zdCBuZXh0ID0gSVRFTVMuZmluZChcbiAgICAgIChpdCkgPT4gaXQua2luZCAhPT0gXCJVbml0XCIgJiYgIW93bmVkLmluY2x1ZGVzKGl0LmlkKSxcbiAgICApITtcbiAgICBidWlsZGluZ1tjLmlkXSA9IHtcbiAgICAgIGl0ZW06IG5leHQuaWQsXG4gICAgICBwcm9ncmVzczogTWF0aC5mbG9vcihyKCkgKiBuZXh0LmNvc3QgKiAwLjcpLFxuICAgIH07XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHR1cm46IFNUQVJUX1RVUk4sXG4gICAgZ29sZDogMzEyLFxuICAgIGZhaXRoOiA4NixcbiAgICByZXNlYXJjaDogXCJtYWNoaW5lcnlcIixcbiAgICByZXNlYXJjaGVkOiBTVEFSVElOR19URUNIUyxcbiAgICBwcm9ncmVzczogeyBtYWNoaW5lcnk6IE1hdGgucm91bmQodGVjaChcIm1hY2hpbmVyeVwiKS5jb3N0ICogMC42MikgfSxcbiAgICBjaXZpYzogNCxcbiAgICBjaXZpY1Byb2dyZXNzOiAxNDAsXG4gICAgYnVpbGRpbmcsXG4gICAgYnVpbHQsXG4gICAgaGlzdG9yeTogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgd29ybGQuY2l2cy5tYXAoKGMpID0+IFtjLmlkLCBoaXN0b3J5KHdvcmxkLCBjKV0pLFxuICAgICksXG4gICAgbm90ZXM6IFtcbiAgICAgIHtcbiAgICAgICAgaWQ6IDEsXG4gICAgICAgIGljb246IFwicGVyc29uXCIsXG4gICAgICAgIGNvbG9yOiBDLnNjaWVuY2UsXG4gICAgICAgIHRpdGxlOiBcIkdyZWF0IFNjaWVudGlzdFwiLFxuICAgICAgICBib2R5OiBcIkh5cGF0aWEgb2YgTHVtZW4gYXdhaXRzIHlvdXIgY2FsbFwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDIsXG4gICAgICAgIGljb246IFwiZm9vZFwiLFxuICAgICAgICBjb2xvcjogQy5mb29kLFxuICAgICAgICB0aXRsZTogXCJDaXR5IGdyb3duXCIsXG4gICAgICAgIGJvZHk6IFwiQXVyZWxpYSBoYXMgZ3Jvd24gdG8gbmV3IGhlaWdodHNcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiAzLFxuICAgICAgICBpY29uOiBcIm1hcFwiLFxuICAgICAgICBjb2xvcjogQy5nb2xkLFxuICAgICAgICB0aXRsZTogXCJGaXJzdCBjb250YWN0XCIsXG4gICAgICAgIGJvZHk6IFwiRW52b3lzIGZyb20gZXZlcnkgY29ybmVyIG9mIHRoZSB3b3JsZFwiLFxuICAgICAgfSxcbiAgICBdLFxuICAgIG5leHROb3RlOiA0LFxuICB9O1xufVxuXG4vKiogQSBjaXYncyBwZXItdHVybiB5aWVsZHM6IHRoZSBsYXN0IHN0ZXAgb2YgaXRzIGhpc3RvcnkuICovXG5leHBvcnQgZnVuY3Rpb24gaW5jb21lKGdhbWU6IEdhbWUsIGNpdjogc3RyaW5nKSB7XG4gIGNvbnN0IGggPSBnYW1lLmhpc3RvcnlbY2l2XTtcbiAgY29uc3QgbGFzdCA9IChtOiBNZXRyaWMpID0+IGhbbV1baFttXS5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIHtcbiAgICBzY2llbmNlOiBsYXN0KFwic2NpZW5jZVwiKSxcbiAgICBjdWx0dXJlOiBsYXN0KFwiY3VsdHVyZVwiKSxcbiAgICBnb2xkOiBsYXN0KFwiZ29sZFwiKSxcbiAgICBmYWl0aDogbGFzdChcImZhaXRoXCIpLFxuICB9O1xufVxuXG4vKiogV2hlcmUgdGhlIHRyZWFzdXJ5J3MgZ29sZCBjb21lcyBmcm9tIGFuZCBnb2VzLCBwZXIgdHVybi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZWRnZXIod29ybGQ6IFdvcmxkSW5mbywgZ2FtZTogR2FtZSkge1xuICBjb25zdCBwbGF5ZXIgPSB3b3JsZC5jaXZzWzBdLmlkO1xuICBjb25zdCBjaXRpZXMgPSB3b3JsZC5jaXRpZXMuZmlsdGVyKChjKSA9PiBjLmNpdiA9PT0gcGxheWVyKTtcbiAgY29uc3QgYnVpbHQgPSBjaXRpZXMuZmxhdE1hcCgoYykgPT4gZ2FtZS5idWlsdFtjLmlkXSA/PyBbXSk7XG4gIGNvbnN0IHNvdXJjZXMgPSBbXG4gICAgLi4uY2l0aWVzLm1hcCgoYykgPT4gKHsgbmFtZTogYy5uYW1lLCB2YWx1ZTogYy55aWVsZHMuZ29sZCB9KSksXG4gICAgeyBuYW1lOiBcIlRyYWRlIHJvdXRlc1wiLCB2YWx1ZTogMTIgfSxcbiAgXTtcbiAgY29uc3QgdXBrZWVwID0gW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiQnVpbGRpbmdzXCIsXG4gICAgICB2YWx1ZTogYnVpbHQuZmlsdGVyKChiKSA9PiBpdGVtKGIpLmtpbmQgPT09IFwiQnVpbGRpbmdcIikubGVuZ3RoLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJEaXN0cmljdHNcIixcbiAgICAgIHZhbHVlOiBidWlsdC5maWx0ZXIoKGIpID0+IGl0ZW0oYikua2luZCA9PT0gXCJEaXN0cmljdFwiKS5sZW5ndGggKiAyLFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJVbml0c1wiLFxuICAgICAgdmFsdWU6IHdvcmxkLnVuaXRzLmZpbHRlcigodSkgPT4gdS5jaXYgPT09IHBsYXllcikubGVuZ3RoLFxuICAgIH0sXG4gIF07XG4gIGNvbnN0IHN1bSA9ICh4czogeyB2YWx1ZTogbnVtYmVyIH1bXSkgPT4geHMucmVkdWNlKChuLCB4KSA9PiBuICsgeC52YWx1ZSwgMCk7XG4gIHJldHVybiB7IHNvdXJjZXMsIHVwa2VlcCwgbmV0OiBzdW0oc291cmNlcykgLSBzdW0odXBrZWVwKSB9O1xufVxuXG5jb25zdCBSVU1PUlM6IFtJY29uTmFtZSwgc3RyaW5nLCBzdHJpbmcsIHN0cmluZ11bXSA9IFtcbiAgW1xuICAgIFwic3RyZW5ndGhcIixcbiAgICBDLmJhZCxcbiAgICBcIkJhcmJhcmlhbnNcIixcbiAgICBcIkEgYmFyYmFyaWFuIGNhbXAgd2FzIHNwb3R0ZWQgdG8gdGhlIG5vcnRoXCIsXG4gIF0sXG4gIFtcbiAgICBcInBlcnNvblwiLFxuICAgIEMuY3VsdHVyZSxcbiAgICBcIkdyZWF0IFdyaXRlclwiLFxuICAgIFwiQSBHcmVhdCBXcml0ZXIgd2FzIGJvcm4gaW4gYSByaXZhbCBsYW5kXCIsXG4gIF0sXG4gIFtcIm1hcFwiLCBDLmdvbGQsIFwiVHJhZGUgcm91dGVcIiwgXCJBIGNhcmF2YW4gZnJvbSBTdW5tYXJjaCByZWFjaGVkIEF1cmVsaWFcIl0sXG4gIFtcImZhaXRoXCIsIEMuZmFpdGgsIFwiUmVsaWdpb25cIiwgXCJBIG5ldyBwYW50aGVvbiBpcyB3b3JzaGlwcGVkIGluIFR6YWxhblwiXSxcbiAgW1widHJvcGh5XCIsIEMuZ29sZEhpLCBcIldvbmRlclwiLCBcIktoYXJqYW4gYmVnYW4gYnVpbGRpbmcgdGhlIENvbG9zc3VzXCJdLFxuXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0ZXAod29ybGQ6IFdvcmxkSW5mbywgZ2FtZTogR2FtZSwgYWN0aW9uOiBBY3Rpb24pOiBHYW1lIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJyZXNlYXJjaFwiOlxuICAgICAgcmV0dXJuIHsgLi4uZ2FtZSwgcmVzZWFyY2g6IGFjdGlvbi50ZWNoIH07XG4gICAgY2FzZSBcInByb2R1Y2VcIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmdhbWUsXG4gICAgICAgIGJ1aWxkaW5nOiB7XG4gICAgICAgICAgLi4uZ2FtZS5idWlsZGluZyxcbiAgICAgICAgICBbYWN0aW9uLmNpdHldOiB7IGl0ZW06IGFjdGlvbi5pdGVtLCBwcm9ncmVzczogMCB9LFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICBjYXNlIFwiZGlzbWlzc1wiOlxuICAgICAgcmV0dXJuIHsgLi4uZ2FtZSwgbm90ZXM6IGdhbWUubm90ZXMuZmlsdGVyKChuKSA9PiBuLmlkICE9PSBhY3Rpb24uaWQpIH07XG4gICAgY2FzZSBcInR1cm5cIjpcbiAgICAgIHJldHVybiBuZXh0VHVybih3b3JsZCwgZ2FtZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmV4dFR1cm4od29ybGQ6IFdvcmxkSW5mbywgZ2FtZTogR2FtZSk6IEdhbWUge1xuICBjb25zdCByID0gcm5nKGdhbWUudHVybiAqIDc5MTkpO1xuICBjb25zdCBwbGF5ZXIgPSB3b3JsZC5jaXZzWzBdLmlkO1xuICBjb25zdCBub3RlczogT21pdDxOb3RlLCBcImlkXCI+W10gPSBbXTtcbiAgY29uc3QgZyA9IHsgLi4uZ2FtZSwgdHVybjogZ2FtZS50dXJuICsgMSB9O1xuXG4gIC8vIEhpc3RvcnkgZ3Jvd3MgYSBzdGVwIGZvciBldmVyeW9uZS5cbiAgZy5oaXN0b3J5ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKGdhbWUuaGlzdG9yeSkubWFwKChbY2l2LCBoXSkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IHsgLi4uaCB9IGFzIFJlY29yZDxNZXRyaWMsIG51bWJlcltdPjtcbiAgICAgIGZvciAoY29uc3QgbSBvZiBbXG4gICAgICAgIFwic2NpZW5jZVwiLFxuICAgICAgICBcImN1bHR1cmVcIixcbiAgICAgICAgXCJnb2xkXCIsXG4gICAgICAgIFwiZmFpdGhcIixcbiAgICAgICAgXCJwb3B1bGF0aW9uXCIsXG4gICAgICBdIGFzIGNvbnN0KSB7XG4gICAgICAgIG5leHRbbV0gPSBbLi4uaFttXSwgaFttXVtoW21dLmxlbmd0aCAtIDFdICogKDEuMDAzICsgcigpICogMC4wMTIpXTtcbiAgICAgIH1cbiAgICAgIG5leHQubWlsaXRhcnkgPSBbXG4gICAgICAgIC4uLmgubWlsaXRhcnksXG4gICAgICAgIGgubWlsaXRhcnlbaC5taWxpdGFyeS5sZW5ndGggLSAxXSAqICgwLjk3ICsgcigpICogMC4wNyksXG4gICAgICBdO1xuICAgICAgbmV4dC5zY29yZSA9IFsuLi5oLnNjb3JlLCBzY29yZShuZXh0LCBuZXh0LnNjaWVuY2UubGVuZ3RoIC0gMSldO1xuICAgICAgcmV0dXJuIFtjaXYsIG5leHRdO1xuICAgIH0pLFxuICApO1xuXG4gIGNvbnN0IHBheSA9IGluY29tZShnLCBwbGF5ZXIpO1xuICBnLmdvbGQgPSBnYW1lLmdvbGQgKyBsZWRnZXIod29ybGQsIGdhbWUpLm5ldDtcbiAgZy5mYWl0aCA9IGdhbWUuZmFpdGggKyBwYXkuZmFpdGg7XG5cbiAgaWYgKGdhbWUucmVzZWFyY2gpIHtcbiAgICBjb25zdCBiYW5rZWQgPSAoZ2FtZS5wcm9ncmVzc1tnYW1lLnJlc2VhcmNoXSA/PyAwKSArIHBheS5zY2llbmNlO1xuICAgIGNvbnN0IGRvbmUgPSB0ZWNoKGdhbWUucmVzZWFyY2gpO1xuICAgIGlmIChiYW5rZWQgPj0gZG9uZS5jb3N0KSB7XG4gICAgICBnLnJlc2VhcmNoZWQgPSBbLi4uZ2FtZS5yZXNlYXJjaGVkLCBkb25lLmlkXTtcbiAgICAgIGcucmVzZWFyY2ggPSBudWxsO1xuICAgICAgbm90ZXMucHVzaCh7XG4gICAgICAgIGljb246IGRvbmUuaWNvbixcbiAgICAgICAgY29sb3I6IEMuc2NpZW5jZSxcbiAgICAgICAgdGl0bGU6IFwiUmVzZWFyY2ggY29tcGxldGVcIixcbiAgICAgICAgYm9keTogZG9uZS5uYW1lLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGcucHJvZ3Jlc3MgPSB7IC4uLmdhbWUucHJvZ3Jlc3MsIFtnYW1lLnJlc2VhcmNoXTogYmFua2VkIH07XG4gIH1cblxuICBnLmNpdmljUHJvZ3Jlc3MgPSBnYW1lLmNpdmljUHJvZ3Jlc3MgKyBwYXkuY3VsdHVyZTtcbiAgaWYgKGcuY2l2aWNQcm9ncmVzcyA+PSBjaXZpY0Nvc3QoZ2FtZS5jaXZpYykpIHtcbiAgICBub3Rlcy5wdXNoKHtcbiAgICAgIGljb246IFwiY3VsdHVyZVwiLFxuICAgICAgY29sb3I6IEMuY3VsdHVyZSxcbiAgICAgIHRpdGxlOiBcIkNpdmljIGNvbXBsZXRlXCIsXG4gICAgICBib2R5OiBDSVZJQ1NbZ2FtZS5jaXZpYyAlIENJVklDUy5sZW5ndGhdLFxuICAgIH0pO1xuICAgIGcuY2l2aWMgPSBnYW1lLmNpdmljICsgMTtcbiAgICBnLmNpdmljUHJvZ3Jlc3MgPSAwO1xuICB9XG5cbiAgZy5idWlsZGluZyA9IHsgLi4uZ2FtZS5idWlsZGluZyB9O1xuICBnLmJ1aWx0ID0geyAuLi5nYW1lLmJ1aWx0IH07XG4gIGZvciAoY29uc3QgY2l0eSBvZiB3b3JsZC5jaXRpZXMuZmlsdGVyKChjKSA9PiBjLmNpdiA9PT0gcGxheWVyKSkge1xuICAgIGNvbnN0IG5vdyA9IGdhbWUuYnVpbGRpbmdbY2l0eS5pZF07XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBub3cucHJvZ3Jlc3MgKyBjaXR5LnlpZWxkcy5wcm9kdWN0aW9uO1xuICAgIGNvbnN0IGl0ID0gaXRlbShub3cuaXRlbSk7XG4gICAgaWYgKHByb2dyZXNzIDwgaXQuY29zdCkge1xuICAgICAgZy5idWlsZGluZ1tjaXR5LmlkXSA9IHsgLi4ubm93LCBwcm9ncmVzcyB9O1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIG5vdGVzLnB1c2goe1xuICAgICAgaWNvbjogaXQuaWNvbixcbiAgICAgIGNvbG9yOiBDLnByb2R1Y3Rpb24sXG4gICAgICB0aXRsZTogYCR7Y2l0eS5uYW1lfSBjb21wbGV0ZWRgLFxuICAgICAgYm9keTogaXQubmFtZSxcbiAgICB9KTtcbiAgICBjb25zdCBidWlsdCA9XG4gICAgICBpdC5raW5kID09PSBcIlVuaXRcIlxuICAgICAgICA/IGdhbWUuYnVpbHRbY2l0eS5pZF1cbiAgICAgICAgOiBbLi4uZ2FtZS5idWlsdFtjaXR5LmlkXSwgaXQuaWRdO1xuICAgIGcuYnVpbHRbY2l0eS5pZF0gPSBidWlsdDtcbiAgICBjb25zdCBuZXh0ID1cbiAgICAgIElURU1TLmZpbmQoKGkpID0+IGkua2luZCAhPT0gXCJVbml0XCIgJiYgIWJ1aWx0LmluY2x1ZGVzKGkuaWQpKSA/P1xuICAgICAgaXRlbShcImJ1aWxkZXJcIik7XG4gICAgZy5idWlsZGluZ1tjaXR5LmlkXSA9IHsgaXRlbTogbmV4dC5pZCwgcHJvZ3Jlc3M6IHByb2dyZXNzIC0gaXQuY29zdCB9O1xuICB9XG5cbiAgaWYgKHIoKSA8IDAuNikge1xuICAgIGNvbnN0IFtpY29uLCBjb2xvciwgdGl0bGUsIGJvZHldID0gUlVNT1JTW01hdGguZmxvb3IocigpICogUlVNT1JTLmxlbmd0aCldO1xuICAgIG5vdGVzLnB1c2goeyBpY29uLCBjb2xvciwgdGl0bGUsIGJvZHkgfSk7XG4gIH1cbiAgbGV0IGlkID0gZ2FtZS5uZXh0Tm90ZTtcbiAgZy5ub3RlcyA9IFsuLi5ub3Rlcy5tYXAoKG4pID0+ICh7IC4uLm4sIGlkOiBpZCsrIH0pKSwgLi4uZ2FtZS5ub3Rlc10uc2xpY2UoXG4gICAgMCxcbiAgICA2LFxuICApO1xuICBnLm5leHROb3RlID0gaWQ7XG4gIHJldHVybiBnO1xufVxuXG4vKiogVGhlIGNhbGVuZGFyOiBmb3J0eSB5ZWFycyBhIHR1cm4gYXQgZmlyc3QsIGZld2VyIGFzIGhpc3Rvcnkgc3BlZWRzIHVwLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHllYXIodHVybjogbnVtYmVyKSB7XG4gIGxldCB5ID0gLTQwMDA7XG4gIGxldCBsZWZ0ID0gdHVybjtcbiAgZm9yIChjb25zdCBbdHVybnMsIHNwYW5dIG9mIFtcbiAgICBbNzUsIDQwXSxcbiAgICBbNjAsIDI1XSxcbiAgICBbNTAsIDIwXSxcbiAgICBbODAsIDEwXSxcbiAgICBbSW5maW5pdHksIDVdLFxuICBdKSB7XG4gICAgY29uc3QgbiA9IE1hdGgubWluKGxlZnQsIHR1cm5zKTtcbiAgICB5ICs9IG4gKiBzcGFuO1xuICAgIGxlZnQgLT0gbjtcbiAgICBpZiAobGVmdCA8PSAwKSBicmVhaztcbiAgfVxuICByZXR1cm4geSA8IDAgPyBgJHsteX0gQkNgIDogYCR7eX0gQURgO1xufVxuXG5leHBvcnQgY29uc3QgcGx1cmFsID0gKG46IG51bWJlciwgd29yZDogc3RyaW5nKSA9PlxuICBgJHtufSAke3dvcmR9JHtuID09PSAxID8gXCJcIiA6IFwic1wifWA7XG5cbi8qKiBUdXJucyB1bnRpbCBgY29zdGAgYXQgYHJhdGVgIHBlciB0dXJuLCBmcm9tIGBiYW5rZWRgLiAqL1xuZXhwb3J0IGNvbnN0IHR1cm5zTGVmdCA9IChjb3N0OiBudW1iZXIsIGJhbmtlZDogbnVtYmVyLCByYXRlOiBudW1iZXIpID0+XG4gIE1hdGgubWF4KDEsIE1hdGguY2VpbCgoY29zdCAtIGJhbmtlZCkgLyBNYXRoLm1heCgwLjEsIHJhdGUpKSk7XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICBpbnRlcnBvbGF0ZSxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhUaW1pbmcsXG4gIHR5cGUgQmV2eVN0eWxlLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgYmV2eSwgb24sIHR5cGUgUmVhY3RFdmVudHMsIHR5cGUgV2luZG93U2l6ZSB9IGZyb20gXCIuL2JldnlcIjtcblxuLyoqIFRoZSBVSSB2aWV3cG9ydCdzIGxvZ2ljYWwgc2l6ZSwgc3RyZWFtZWQgYnkgdGhlIGJ1aWx0LWluIGByZXNpemVgIGV2ZW50LlxuICogIGAww5cwYCB1bnRpbCB0aGUgaG9zdCBhbnN3ZXJzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVdpbmRvd1NpemUoKTogV2luZG93U2l6ZSB7XG4gIGNvbnN0IFtzaXplLCBzZXRTaXplXSA9IHVzZVN0YXRlPFdpbmRvd1NpemU+KHsgd2lkdGg6IDAsIGhlaWdodDogMCB9KTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5LndpbmRvd1xuICAgICAgLnNpemUoKVxuICAgICAgLnRoZW4oc2V0U2l6ZSlcbiAgICAgIC5jYXRjaCgoKSA9PiBzZXRTaXplKHsgd2lkdGg6IDE0NDAsIGhlaWdodDogOTAwIH0pKTtcbiAgICByZXR1cm4gYmV2eS5vbihcInJlc2l6ZVwiLCBzZXRTaXplKTtcbiAgfSwgW10pO1xuICByZXR1cm4gc2l6ZTtcbn1cblxuLyoqIExpc3RlbiB0byBhIEJldnkgZXZlbnQgd2hpbGUgbW91bnRlZDsgYHJ1bmAgYWx3YXlzIHNlZXMgdGhlIGxhdGVzdFxuICogIHJlbmRlcidzIHN0YXRlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV2ZW50PEsgZXh0ZW5kcyBrZXlvZiBSZWFjdEV2ZW50cz4oXG4gIG5hbWU6IEssXG4gIHJ1bjogKHZhbHVlOiBSZWFjdEV2ZW50c1tLXSkgPT4gdm9pZCxcbikge1xuICBjb25zdCBsYXRlc3QgPSB1c2VSZWYocnVuKTtcbiAgbGF0ZXN0LmN1cnJlbnQgPSBydW47XG4gIHVzZUVmZmVjdCgoKSA9PiBvbihuYW1lLCAodmFsdWUpID0+IGxhdGVzdC5jdXJyZW50KHZhbHVlKSksIFtuYW1lXSk7XG59XG5cbi8qKiBBIHNjcmlwdGVkIHN0ZXAgZnJvbSBgLS1zaG9vdCDigKYgLS1kbyBcIjxzZWNzPiA8dmVyYj4gW2FyZ11cImAgKHRoZVxuICogIGBkZWJ1Zy5hY3RgIGV2ZW50KTogcnVucyBgcnVuKGFyZylgIGZvciB0aGlzIGNvbXBvbmVudCdzIGB2ZXJiYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWJ1Zyh2ZXJiOiBzdHJpbmcsIHJ1bjogKGFyZzogc3RyaW5nKSA9PiB2b2lkKSB7XG4gIHVzZUV2ZW50KFwiZGVidWcuYWN0XCIsICh7IGFjdGlvbiB9KSA9PiB7XG4gICAgY29uc3QgW2hlYWQsIC4uLnJlc3RdID0gYWN0aW9uLnNwbGl0KFwiIFwiKTtcbiAgICBpZiAoaGVhZCA9PT0gdmVyYikgcnVuKHJlc3Quam9pbihcIiBcIikpO1xuICB9KTtcbn1cblxuLyoqIFNsaWRlIGluIGZyb20gYW4gb2Zmc2V0IHdoZW4gbW91bnRlZCAoQmV2eSBydW5zIHRoZSBhbmltYXRpb247IFJlYWN0XG4gKiAgcmVuZGVycyBvbmNlKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VTbGlkZUluKHg6IG51bWJlciwgeTogbnVtYmVyLCBkdXJhdGlvbiA9IDMyMCk6IEJldnlTdHlsZSB7XG4gIGNvbnN0IHQgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0LnZhbHVlID0gd2l0aFRpbWluZygxLCB7IGR1cmF0aW9uLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0pO1xuICB9LCBbdCwgZHVyYXRpb25dKTtcbiAgcmV0dXJuIHtcbiAgICB0cmFuc2Zvcm06IHtcbiAgICAgIHRyYW5zbGF0ZVg6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHQsIFswLCAxXSwgW3gsIDBdKSB9LFxuICAgICAgdHJhbnNsYXRlWTogeyBhbmltYXRlZDogaW50ZXJwb2xhdGUodCwgWzAsIDFdLCBbeSwgMF0pIH0sXG4gICAgfSxcbiAgfTtcbn1cblxuLyoqIEZhZGUgYW5kIGdyb3cgaW4gd2hlbiBtb3VudGVkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUZhZGVJbihkdXJhdGlvbiA9IDI2MCk6IEJldnlTdHlsZSB7XG4gIGNvbnN0IHQgPSB1c2VTaGFyZWRWYWx1ZSgwKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0LnZhbHVlID0gd2l0aFRpbWluZygxLCB7IGR1cmF0aW9uLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0pO1xuICB9LCBbdCwgZHVyYXRpb25dKTtcbiAgcmV0dXJuIHtcbiAgICBvcGFjaXR5OiB7IGFuaW1hdGVkOiB0IH0sXG4gICAgdHJhbnNmb3JtOiB7IHNjYWxlOiB7IGFuaW1hdGVkOiBpbnRlcnBvbGF0ZSh0LCBbMCwgMV0sIFswLjk3LCAxXSkgfSB9LFxuICB9O1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5cbi8qKiBMaW5lLWFuZC1maWxsIHBpY3RvZ3JhbXMgb24gYSAyNC11bml0IGdyaWQsIGRyYXduIHdpdGggYDxzdmc+YCAoZWFjaFxuICogIG9uZSByYXN0ZXJpemVkIGF0IGl0cyBsYWlkLW91dCBzaXplLCBzbyBjcmlzcCBhdCBhbnkgc2l6ZSkuICovXG5jb25zdCBJQ09OUyA9IHtcbiAgc2NpZW5jZTogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTguNSAzaDdcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk0xMCAzLjV2Nkw1IDE4LjJBMiAyIDAgMCAwIDYuOCAyMWgxMC40YTIgMiAwIDAgMCAxLjgtMi44TDE0IDkuNXYtNlwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk03LjQgMTVoOS4ybDEuNSAzLjFjLjMuNi0uMS45LS43LjlINi42Yy0uNiAwLTEtLjMtLjctLjl6XCJcbiAgICAgICAgZmlsbD17Y31cbiAgICAgIC8+XG4gICAgPC8+XG4gICksXG4gIGN1bHR1cmU6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk05LjIgMTcuNVY1LjJsMTAuNS0yLjJ2MTIuNFwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPGNpcmNsZSBjeD17Ni40fSBjeT17MTcuNn0gcj17M30gZmlsbD17Y30gLz5cbiAgICAgIDxjaXJjbGUgY3g9ezE2Ljl9IGN5PXsxNS41fSByPXszfSBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBnb2xkOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxjaXJjbGUgY3g9ezEyfSBjeT17MTJ9IHI9ezl9IGZpbGw9e2N9IC8+XG4gICAgICA8Y2lyY2xlXG4gICAgICAgIGN4PXsxMn1cbiAgICAgICAgY3k9ezEyfVxuICAgICAgICByPXs1LjZ9XG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPVwiIzdhNWIxNlwiXG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAvPlxuICAgICAgPHJlY3QgeD17MTAuNX0geT17MTAuNX0gd2lkdGg9ezN9IGhlaWdodD17M30gZmlsbD1cIiM3YTViMTZcIiAvPlxuICAgIDwvPlxuICApLFxuICBmYWl0aDogKGM6IHN0cmluZykgPT4gPHBvbHlnb24gcG9pbnRzPXtzdGFyKDEyLCAxMiwgMTAsIDQuMiwgOCl9IGZpbGw9e2N9IC8+LFxuICBmb29kOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNMTIgMjJWN1wiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17MS44fVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgLz5cbiAgICAgIDxlbGxpcHNlIGN4PXsxMn0gY3k9ezQuNn0gcng9ezEuOH0gcnk9ezIuOH0gZmlsbD17Y30gLz5cbiAgICAgIHtbOCwgMTIuNSwgMTddLm1hcCgoeSkgPT4gKFxuICAgICAgICA8ZyBrZXk9e3l9PlxuICAgICAgICAgIDxlbGxpcHNlXG4gICAgICAgICAgICBjeD17OX1cbiAgICAgICAgICAgIGN5PXt5fVxuICAgICAgICAgICAgcng9ezEuOX1cbiAgICAgICAgICAgIHJ5PXszLjF9XG4gICAgICAgICAgICBmaWxsPXtjfVxuICAgICAgICAgICAgdHJhbnNmb3JtPXtgcm90YXRlKC0zOCA5ICR7eX0pYH1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxlbGxpcHNlXG4gICAgICAgICAgICBjeD17MTV9XG4gICAgICAgICAgICBjeT17eX1cbiAgICAgICAgICAgIHJ4PXsxLjl9XG4gICAgICAgICAgICByeT17My4xfVxuICAgICAgICAgICAgZmlsbD17Y31cbiAgICAgICAgICAgIHRyYW5zZm9ybT17YHJvdGF0ZSgzOCAxNSAke3l9KWB9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9nPlxuICAgICAgKSl9XG4gICAgPC8+XG4gICksXG4gIHByb2R1Y3Rpb246IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk00LjUgMTkuNWw4LjUtOC41XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyLjh9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGggZD1cIk0xMC42IDYuMmwzLjYtMy42IDcuMiA3LjItMy42IDMuNnpcIiBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBob3VzaW5nOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNMyAxMS41TDEyIDRsOSA3LjVcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNS41IDEwLjVWMjBoNXYtNWgzdjVoNXYtOS41TDEyIDV6XCIgZmlsbD17Y30gLz5cbiAgICA8Lz5cbiAgKSxcbiAgYW1lbml0aWVzOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxjaXJjbGUgY3g9ezEyfSBjeT17MTJ9IHI9ezl9IGZpbGw9XCJub25lXCIgc3Ryb2tlPXtjfSBzdHJva2VXaWR0aD17Mn0gLz5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNOCAxMy44YzEuNCAyLjQgNi42IDIuNCA4IDBcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPGNpcmNsZSBjeD17OX0gY3k9ezkuNX0gcj17MS4zfSBmaWxsPXtjfSAvPlxuICAgICAgPGNpcmNsZSBjeD17MTV9IGN5PXs5LjV9IHI9ezEuM30gZmlsbD17Y30gLz5cbiAgICA8Lz5cbiAgKSxcbiAgc3RyZW5ndGg6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk01IDMuNWwxMyAxM00xOSAzLjVMNiAxNi41XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyLjJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk0zLjUgMTUuNWw1IDVNMjAuNSAxNS41bC01IDVcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezIuMn1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgPC8+XG4gICksXG4gIG1vdmVtZW50OiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPHBhdGhcbiAgICAgIGQ9XCJNNSA1bDcgNy03IDdNMTIgNWw3IDctNyA3XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsyLjJ9XG4gICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgLz5cbiAgKSxcbiAgYm93OiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNNyAzYzggMi41IDggMTUuNSAwIDE4XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNyAzdjE4XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9e2N9IHN0cm9rZVdpZHRoPXsxfSAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk0zIDEyaDE3TTE3IDlsMyAzLTMgM1wiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17MS44fVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgPC8+XG4gICksXG4gIGV5ZTogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTIgMTJzMy44LTYuNSAxMC02LjVTMjIgMTIgMjIgMTJzLTMuOCA2LjUtMTAgNi41UzIgMTIgMiAxMnpcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgLz5cbiAgICAgIDxjaXJjbGUgY3g9ezEyfSBjeT17MTJ9IHI9ezMuMn0gZmlsbD17Y30gLz5cbiAgICA8Lz5cbiAgKSxcbiAgZmxhZzogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTYgMjFWMy41XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNiA0aDEybC0zIDQuNSAzIDQuNUg2elwiIGZpbGw9e2N9IC8+XG4gICAgPC8+XG4gICksXG4gIGNpdHk6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk0zIDIxaDE4XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNSAyMVYxMWw0LTMgNCAzdjEwek0xNCAyMVY1aDV2MTZ6XCIgZmlsbD17Y30gLz5cbiAgICA8Lz5cbiAgKSxcbiAgYm9vazogKGM6IHN0cmluZykgPT4gKFxuICAgIDxwYXRoXG4gICAgICBkPVwiTTEyIDYuNUMxMCA0LjggNi41IDQuNSA0IDUuMnYxMy42YzIuNS0uNyA2LS40IDggMS4zIDItMS43IDUuNS0yIDgtMS4zVjUuMmMtMi41LS43LTYtLjQtOCAxLjN6TTEyIDYuNXYxMy42XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsxLjl9XG4gICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAvPlxuICApLFxuICBjYXN0bGU6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk00IDIxVjhoM3YzaDIuNVY4aDV2M0gxN1Y4aDN2MTNoLTZ2LTQuNWEyIDIgMCAwIDAtNCAwVjIxelwiXG4gICAgICBmaWxsPXtjfVxuICAgIC8+XG4gICksXG4gIG9iZWxpc2s6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGggZD1cIk0xMCAyMGwxLTE0IDEtMyAxIDMgMSAxNHpcIiBmaWxsPXtjfSAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk02IDIwLjVoMTJcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgIDwvPlxuICApLFxuICBhbmNob3I6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPGNpcmNsZSBjeD17MTJ9IGN5PXs1fSByPXsyLjJ9IGZpbGw9XCJub25lXCIgc3Ryb2tlPXtjfSBzdHJva2VXaWR0aD17MS45fSAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk0xMiA3LjJWMjFNNSAxM2MwIDQuNSAzLjIgOCA3IDhzNy0zLjUgNy04TTguNSAxMC41aDdcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuOX1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgPC8+XG4gICksXG4gIHRyb3BoeTogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aCBkPVwiTTcgMy41aDEwVjlhNSA1IDAgMCAxLTEwIDB6XCIgZmlsbD17Y30gLz5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNNyA1LjVINHYxLjJBMy4zIDMuMyAwIDAgMCA3LjMgMTBNMTcgNS41aDN2MS4yYTMuMyAzLjMgMCAwIDEtMy4zIDMuM00xMiAxNHY0TTggMjAuNWg4XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjl9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgIDwvPlxuICApLFxuICBjaGFydDogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTMuNSAyMC41aDE3XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjl9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHJlY3QgeD17NX0geT17MTJ9IHdpZHRoPXszLjR9IGhlaWdodD17Ni41fSByeD17MC44fSBmaWxsPXtjfSAvPlxuICAgICAgPHJlY3QgeD17MTAuM30geT17N30gd2lkdGg9ezMuNH0gaGVpZ2h0PXsxMS41fSByeD17MC44fSBmaWxsPXtjfSAvPlxuICAgICAgPHJlY3QgeD17MTUuNn0geT17My41fSB3aWR0aD17My40fSBoZWlnaHQ9ezE1fSByeD17MC44fSBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBtYXA6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk0zIDYuNWw2LTMgNiAzIDYtM3YxNGwtNiAzLTYtMy02IDN6TTkgMy41djE0TTE1IDYuNXYxNFwiXG4gICAgICBmaWxsPVwibm9uZVwiXG4gICAgICBzdHJva2U9e2N9XG4gICAgICBzdHJva2VXaWR0aD17MS45fVxuICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgLz5cbiAgKSxcbiAgcGVyc29uOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxjaXJjbGUgY3g9ezEyfSBjeT17Ny41fSByPXs0fSBmaWxsPXtjfSAvPlxuICAgICAgPHBhdGggZD1cIk00IDIxYzAtNC42IDMuNi03LjUgOC03LjVzOCAyLjkgOCA3LjV6XCIgZmlsbD17Y30gLz5cbiAgICA8Lz5cbiAgKSxcbiAgc2hpZWxkOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPHBhdGhcbiAgICAgIGQ9XCJNMTIgMi41bDguNSAzLjJ2Ni4xYzAgNS4xLTMuNiA4LjUtOC41IDkuNy00LjktMS4yLTguNS00LjYtOC41LTkuN1Y1Ljd6XCJcbiAgICAgIGZpbGw9e2N9XG4gICAgLz5cbiAgKSxcbiAgbW9vbjogKGM6IHN0cmluZykgPT4gKFxuICAgIDxwYXRoIGQ9XCJNMTkuNSAxNC41QTggOCAwIDEgMSA5LjUgNC41YTYuNSA2LjUgMCAwIDAgMTAgMTB6XCIgZmlsbD17Y30gLz5cbiAgKSxcbiAgc2tpcDogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aCBkPVwiTTUgNWw5IDctOSA3elwiIGZpbGw9e2N9IC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTE3LjUgNXYxNFwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mi40fVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgLz5cbiAgICA8Lz5cbiAgKSxcbiAgYXJyb3c6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk00IDEyaDE0TTEzIDZsNiA2LTYgNlwiXG4gICAgICBmaWxsPVwibm9uZVwiXG4gICAgICBzdHJva2U9e2N9XG4gICAgICBzdHJva2VXaWR0aD17Mi40fVxuICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgIC8+XG4gICksXG4gIHRyYXNoOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPHBhdGhcbiAgICAgIGQ9XCJNNCA3aDE2TTEwIDMuNWg0TTYuNSA3bDEgMTMuNWg5bDEtMTMuNVwiXG4gICAgICBmaWxsPVwibm9uZVwiXG4gICAgICBzdHJva2U9e2N9XG4gICAgICBzdHJva2VXaWR0aD17MS45fVxuICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgIC8+XG4gICksXG4gIGNoZWNrOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPHBhdGhcbiAgICAgIGQ9XCJNNSAxMi41bDQuNSA0LjVMMTkgNy41XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsyLjZ9XG4gICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgLz5cbiAgKSxcbiAgY2xvc2U6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk02IDZsMTIgMTJNMTggNkw2IDE4XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsyLjJ9XG4gICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgIC8+XG4gICksXG4gIG1lbnU6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk00IDdoMTZNNCAxMmgxNk00IDE3aDE2XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAvPlxuICApLFxuICBzdGFyOiAoYzogc3RyaW5nKSA9PiA8cG9seWdvbiBwb2ludHM9e3N0YXIoMTIsIDEyLjYsIDEwLCA0LjIsIDUpfSBmaWxsPXtjfSAvPixcbiAgbG9jazogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cmVjdCB4PXs1fSB5PXsxMC41fSB3aWR0aD17MTR9IGhlaWdodD17MTB9IHJ4PXsyfSBmaWxsPXtjfSAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk04LjUgMTAuNVY4YTMuNSAzLjUgMCAwIDEgNyAwdjIuNVwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgIC8+XG4gICAgPC8+XG4gICksXG59IHNhdGlzZmllcyBSZWNvcmQ8c3RyaW5nLCAoY29sb3I6IHN0cmluZykgPT4gUmVhY3ROb2RlPjtcblxuZXhwb3J0IHR5cGUgSWNvbk5hbWUgPSBrZXlvZiB0eXBlb2YgSUNPTlM7XG5cbi8qKiBUaGUgcG9pbnRzIG9mIGFuIGBuYC1wb2ludGVkIHN0YXIsIHRoZSBmaXJzdCBwb2ludCBzdHJhaWdodCB1cC4gKi9cbmZ1bmN0aW9uIHN0YXIoY3g6IG51bWJlciwgY3k6IG51bWJlciwgb3V0ZXI6IG51bWJlciwgaW5uZXI6IG51bWJlciwgbjogbnVtYmVyKSB7XG4gIGNvbnN0IHB0czogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuICogMjsgaSsrKSB7XG4gICAgY29uc3QgYSA9IChNYXRoLlBJICogaSkgLyBuIC0gTWF0aC5QSSAvIDI7XG4gICAgY29uc3QgciA9IGkgJSAyID09PSAwID8gb3V0ZXIgOiBpbm5lcjtcbiAgICBwdHMucHVzaChjeCArIE1hdGguY29zKGEpICogciwgY3kgKyBNYXRoLnNpbihhKSAqIHIpO1xuICB9XG4gIHJldHVybiBwdHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJY29uKHtcbiAgbmFtZSxcbiAgc2l6ZSA9IDE2LFxuICBjb2xvciA9IFwiI2YwZThkNlwiLFxufToge1xuICBuYW1lOiBJY29uTmFtZTtcbiAgc2l6ZT86IG51bWJlcjtcbiAgY29sb3I/OiBzdHJpbmc7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPHN2Z1xuICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplLCBmbGV4U2hyaW5rOiAwIH19XG4gICAgPlxuICAgICAge0lDT05TW25hbWVdKGNvbG9yKX1cbiAgICA8L3N2Zz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSwgdHlwZSBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQ2l2SW5mbyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBDLCBGb250cywgY2FwcywgZ2lsdCwgdG9uZSB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgSWNvbiwgdHlwZSBJY29uTmFtZSB9IGZyb20gXCIuL0ljb25cIjtcblxuLyoqIEEgZmlsbGVkIHJpbmc6IGBwcm9ncmVzc2AgKDAuLjEpIG9mIGBjb2xvcmAgb3ZlciBhIGRpbSB0cmFjaywgYXMgYVxuICogIGNvbmljIGdyYWRpZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmljKFxuICBwcm9ncmVzczogbnVtYmVyLFxuICBjb2xvcjogc3RyaW5nLFxuKTogQmV2eVN0eWxlW1wiYmFja2dyb3VuZEdyYWRpZW50XCJdIHtcbiAgY29uc3QgZGVnID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgcHJvZ3Jlc3MpKSAqIDM2MDtcbiAgY29uc3QgdHJhY2sgPSBcInJnYmEoMCwgMCwgMCwgMC41NSlcIjtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBcImNvbmljXCIsXG4gICAgc3RvcHM6IFtcbiAgICAgIHsgY29sb3IsIGFuZ2xlOiAwIH0sXG4gICAgICB7IGNvbG9yLCBhbmdsZTogZGVnIH0sXG4gICAgICB7IGNvbG9yOiB0cmFjaywgYW5nbGU6IGRlZyB9LFxuICAgICAgeyBjb2xvcjogdHJhY2ssIGFuZ2xlOiAzNjAgfSxcbiAgICBdLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmFkaWFsKFxuICBpbm5lcjogc3RyaW5nLFxuICBvdXRlcjogc3RyaW5nLFxuKTogQmV2eVN0eWxlW1wiYmFja2dyb3VuZEdyYWRpZW50XCJdIHtcbiAgcmV0dXJuIHsgdHlwZTogXCJyYWRpYWxcIiwgc3RvcHM6IFt7IGNvbG9yOiBpbm5lciB9LCB7IGNvbG9yOiBvdXRlciB9XSB9O1xufVxuXG4vKiogVGhlIHJvdW5kIGdpbHQgZnJhbWUgdGhlIGdyZWF0IDRYIGdhbWVzIHB1dCBldmVyeSBwb3J0cmFpdCBpbiwgd2l0aCBhblxuICogIG9wdGlvbmFsIHByb2dyZXNzIHJpbmcgaW5zaWRlIHRoZSBnb2xkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1lZGFsbGlvbih7XG4gIHNpemUsXG4gIGlubmVyID0gQy5zbGF0ZUhpLFxuICBvdXRlciA9IEMubmF2eSxcbiAgcHJvZ3Jlc3MsXG4gIHJpbmcgPSBDLnNjaWVuY2UsXG4gIGNoaWxkcmVuLFxuICBzdHlsZSxcbn06IHtcbiAgc2l6ZTogbnVtYmVyO1xuICBpbm5lcj86IHN0cmluZztcbiAgb3V0ZXI/OiBzdHJpbmc7XG4gIHByb2dyZXNzPzogbnVtYmVyO1xuICByaW5nPzogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG59KSB7XG4gIGNvbnN0IHIgPSBzaXplIC8gMjtcbiAgY29uc3QgZnJhbWUgPSBNYXRoLm1heCgyLCBNYXRoLnJvdW5kKHNpemUgKiAwLjA2KSk7XG4gIGNvbnN0IGZhY2UgPSAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICBib3JkZXJSYWRpdXM6IHIsXG4gICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogcmFkaWFsKGlubmVyLCBvdXRlciksXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9ub2RlPlxuICApO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgaGVpZ2h0OiBzaXplLFxuICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICBib3JkZXJSYWRpdXM6IHIsXG4gICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogZ2lsdCxcbiAgICAgICAgcGFkZGluZzogZnJhbWUsXG4gICAgICAgIC4uLnN0eWxlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7cHJvZ3Jlc3MgPT09IHVuZGVmaW5lZCA/IChcbiAgICAgICAgZmFjZVxuICAgICAgKSA6IChcbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IHIsXG4gICAgICAgICAgICBwYWRkaW5nOiBNYXRoLm1heCgzLCBzaXplICogMC4wNzUpLFxuICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBjb25pYyhwcm9ncmVzcywgcmluZyksXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtmYWNlfVxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgcm91bmQgZ2lsdCBpY29uIGJ1dHRvbiB3aXRoIGEgY2FwdGlvbiBvbiBob3Zlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSb3VuZEJ1dHRvbih7XG4gIGljb24sXG4gIHNpemUgPSAzOCxcbiAgY29sb3IgPSBDLmdvbGRIaSxcbiAgdGlwLFxuICB0aXBTaWRlID0gXCJib3R0b21cIixcbiAgYWN0aXZlID0gZmFsc2UsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGljb246IEljb25OYW1lO1xuICBzaXplPzogbnVtYmVyO1xuICBjb2xvcj86IHN0cmluZztcbiAgdGlwPzogc3RyaW5nO1xuICB0aXBTaWRlPzogXCJib3R0b21cIiB8IFwidG9wXCIgfCBcImxlZnRcIjtcbiAgYWN0aXZlPzogYm9vbGVhbjtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IHIgPSBzaXplIC8gMjtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNldEhvdmVyKHRydWUpfVxuICAgICAgb25Qb2ludGVyTGVhdmU9eygpID0+IHNldEhvdmVyKGZhbHNlKX1cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICBoZWlnaHQ6IHNpemUsXG4gICAgICAgIGJvcmRlclJhZGl1czogcixcbiAgICAgICAgcGFkZGluZzogMixcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBnaWx0LFxuICAgICAgICBib3hTaGFkb3c6IGFjdGl2ZVxuICAgICAgICAgID8geyBjb2xvcjogXCJyZ2JhKDI0NiwgMjI4LCAxNjgsIDAuNTUpXCIsIGJsdXJSYWRpdXM6IDEwIH1cbiAgICAgICAgICA6IHsgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjUpXCIsIGJsdXJSYWRpdXM6IDYsIHlPZmZzZXQ6IDIgfSxcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXt7XG4gICAgICAgIGJveFNoYWRvdzogeyBjb2xvcjogXCJyZ2JhKDI0NiwgMjI4LCAxNjgsIDAuNDUpXCIsIGJsdXJSYWRpdXM6IDEyIH0sXG4gICAgICB9fVxuICAgICAgcHJlc3NTdHlsZT17eyB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOTMgfSB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiByLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBhY3RpdmVcbiAgICAgICAgICAgID8gcmFkaWFsKFwiIzNmNmE5MlwiLCBDLnNsYXRlKVxuICAgICAgICAgICAgOiByYWRpYWwoQy5zbGF0ZUhpLCBDLm5hdnkpLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8SWNvbiBuYW1lPXtpY29ufSBzaXplPXtzaXplICogMC41fSBjb2xvcj17Y29sb3J9IC8+XG4gICAgICA8L25vZGU+XG4gICAgICB7aG92ZXIgJiYgdGlwICYmIDxUaXAgdGV4dD17dGlwfSBzaWRlPXt0aXBTaWRlfSBvZmZzZXQ9e3NpemUgKyA2fSAvPn1cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIEEgc21hbGwgY2FwdGlvbiBwbGF0ZSBiZXNpZGUgaXRzIChyZWxhdGl2ZWx5IHBvc2l0aW9uZWQpIHBhcmVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUaXAoe1xuICB0ZXh0LFxuICBzaWRlLFxuICBvZmZzZXQsXG59OiB7XG4gIHRleHQ6IHN0cmluZztcbiAgc2lkZTogXCJib3R0b21cIiB8IFwidG9wXCIgfCBcImxlZnRcIjtcbiAgb2Zmc2V0OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IHBsYWNlOiBCZXZ5U3R5bGUgPVxuICAgIHNpZGUgPT09IFwibGVmdFwiXG4gICAgICA/IHsgcmlnaHQ6IG9mZnNldCwgdG9wOiBcIjUwJVwiLCB0cmFuc2Zvcm06IHsgdHJhbnNsYXRlWTogXCItNTAlXCIgfSB9XG4gICAgICA6IHtcbiAgICAgICAgICBsZWZ0OiBcIjUwJVwiLFxuICAgICAgICAgIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVYOiBcIi01MCVcIiB9LFxuICAgICAgICAgIC4uLihzaWRlID09PSBcImJvdHRvbVwiID8geyB0b3A6IG9mZnNldCB9IDogeyBib3R0b206IG9mZnNldCB9KSxcbiAgICAgICAgfTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIC4uLnBsYWNlLFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDEwLCB2ZXJ0aWNhbDogNSB9LFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg2LCAxMywgMjEsIDAuOTQpXCIsXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExvLFxuICAgICAgICBib3JkZXJSYWRpdXM6IDMsXG4gICAgICAgIGdsb2JhbFpJbmRleDogMTAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMudGV4dCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICB7dGV4dH1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIHNlY3Rpb24gdGl0bGUgYmV0d2VlbiB0d28gZmFkaW5nIGdvbGQgcnVsZXMuICovXG5leHBvcnQgZnVuY3Rpb24gSGVhZGVyKHtcbiAgY2hpbGRyZW4sXG4gIGNvbG9yID0gQy5nb2xkLFxufToge1xuICBjaGlsZHJlbjogc3RyaW5nO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgY29uc3QgcnVsZSA9IChhbmdsZTogbnVtYmVyKTogQmV2eVN0eWxlID0+ICh7XG4gICAgZmxleEdyb3c6IDEsXG4gICAgaGVpZ2h0OiAxLFxuICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgIGFuZ2xlLFxuICAgICAgc3RvcHM6IFt7IGNvbG9yOiBcInJnYmEoMjE3LCAxODMsIDEwOCwgMClcIiB9LCB7IGNvbG9yOiBDLmdvbGRMaW5lIH1dLFxuICAgIH0sXG4gIH0pO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTAgfX0+XG4gICAgICA8bm9kZSBzdHlsZT17cnVsZSg5MCl9IC8+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5jYXBzLCBjb2xvciB9fT57Y2hpbGRyZW4udG9VcHBlckNhc2UoKX08L3RleHQ+XG4gICAgICA8bm9kZSBzdHlsZT17cnVsZSgyNzApfSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgcHJvZ3Jlc3MgYmFyIHRoYXQgZWFzZXMgdG8gaXRzIG5ldyB2YWx1ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCYXIoe1xuICB2YWx1ZSxcbiAgd2lkdGgsXG4gIGNvbG9yLFxuICBoZWlnaHQgPSA2LFxufToge1xuICB2YWx1ZTogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBjb2xvcjogc3RyaW5nO1xuICBoZWlnaHQ/OiBudW1iZXI7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgIGJvcmRlclJhZGl1czogaGVpZ2h0IC8gMixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC40NSlcIixcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDYpXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZhbHVlKSkgKiAod2lkdGggLSAyKSxcbiAgICAgICAgICBoZWlnaHQ6IGhlaWdodCAtIDIsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiBoZWlnaHQgLyAyLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3IsXG4gICAgICAgICAgdHJhbnNpdGlvbjogeyBzaXplOiB7IGR1cmF0aW9uOiA2MDAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSB9LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBbiBpY29uIGFuZCBhIG51bWJlciBpbiB0aGUgeWllbGQncyBjb2xvci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBbW91bnQoe1xuICBpY29uLFxuICBjb2xvcixcbiAgdmFsdWUsXG4gIHNpemUgPSAxMyxcbn06IHtcbiAgaWNvbjogSWNvbk5hbWU7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHNpemU/OiBudW1iZXI7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA0IH19PlxuICAgICAgPEljb24gbmFtZT17aWNvbn0gc2l6ZT17c2l6ZSArIDN9IGNvbG9yPXtjb2xvcn0gLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiBzaXplLCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yIH19PlxuICAgICAgICB7dmFsdWV9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIOKclSBpbiBhIHBhbmVsJ3MgY29ybmVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsb3NlQnV0dG9uKHsgb25DbGljayB9OiB7IG9uQ2xpY2s6ICgpID0+IHZvaWQgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogMzAsXG4gICAgICAgIGhlaWdodDogMzAsXG4gICAgICAgIGJvcmRlclJhZGl1czogMTUsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMbyxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoNiwgMTMsIDIxLCAwLjYpXCIsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IEMuc2xhdGVIaSwgYm9yZGVyQ29sb3I6IEMuZ29sZCB9fVxuICAgICAgcHJlc3NTdHlsZT17eyB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOTIgfSB9fVxuICAgID5cbiAgICAgIDxJY29uIG5hbWU9XCJjbG9zZVwiIHNpemU9ezE0fSBjb2xvcj17Qy5nb2xkSGl9IC8+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBBIGNpdmlsaXphdGlvbidzIHJvdW5kIGNyZXN0OiBpdHMgaW5pdGlhbCBvbiBpdHMgY29sb3IuICovXG5leHBvcnQgZnVuY3Rpb24gQ3Jlc3QoeyBjaXYsIHNpemUgfTogeyBjaXY6IENpdkluZm87IHNpemU6IG51bWJlciB9KSB7XG4gIHJldHVybiAoXG4gICAgPE1lZGFsbGlvblxuICAgICAgc2l6ZT17c2l6ZX1cbiAgICAgIGlubmVyPXt0b25lKGNpdi5jb2xvciwgMS4yNSl9XG4gICAgICBvdXRlcj17dG9uZShjaXYuY29sb3IsIDAuNCl9XG4gICAgPlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgIGZvbnRTaXplOiBzaXplICogMC40MixcbiAgICAgICAgICBjb2xvcjogXCIjZmZmZmZmXCIsXG4gICAgICAgICAgdGV4dFNoYWRvdzogeyBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNilcIiwgb2Zmc2V0WDogMCwgb2Zmc2V0WTogMSB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7Y2l2Lm5hbWVbMF19XG4gICAgICA8L3RleHQ+XG4gICAgPC9NZWRhbGxpb24+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDaXR5SW5mbywgQ2l2SW5mbyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQge1xuICBJVEVNUyxcbiAgaXRlbSxcbiAgcGx1cmFsLFxuICB0dXJuc0xlZnQsXG4gIHR5cGUgQWN0aW9uLFxuICB0eXBlIEdhbWUsXG4gIHR5cGUgSXRlbSxcbn0gZnJvbSBcIi4uL2dhbWVcIjtcbmltcG9ydCB7IHVzZVNsaWRlSW4gfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7XG4gIEMsXG4gIEZvbnRzLFxuICBPV05TX1BPSU5URVIsXG4gIFlJRUxEUyxcbiAgY2FwcyxcbiAgZm10LFxuICBwYW5lbCxcbiAgc2lnbmVkLFxuICB0b25lLFxufSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEljb24sIHR5cGUgSWNvbk5hbWUgfSBmcm9tIFwiLi4vdWkvSWNvblwiO1xuaW1wb3J0IHsgQmFyLCBDbG9zZUJ1dHRvbiwgSGVhZGVyLCBNZWRhbGxpb24gfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5cbmNvbnN0IFdJRFRIID0gMzYwO1xuXG4vKiogVGhlIGNpdHkgc2NyZWVuLCBkb3duIHRoZSBsZWZ0IHNpZGU6IGl0cyB5aWVsZHMgZnJvbSB0aGUgdGlsZXMgaXRcbiAqICB3b3JrcywgaXRzIGdyb3d0aCwgd2hhdCBpdCBpcyBidWlsZGluZyBhbmQgd2hhdCBpdCBjb3VsZCBidWlsZCBuZXh0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENpdHlQYW5lbCh7XG4gIGNpdHksXG4gIGNpdixcbiAgZ2FtZSxcbiAgZGlzcGF0Y2gsXG4gIG9uQ2xvc2UsXG59OiB7XG4gIGNpdHk6IENpdHlJbmZvO1xuICBjaXY6IENpdkluZm87XG4gIGdhbWU6IEdhbWU7XG4gIGRpc3BhdGNoOiAoYTogQWN0aW9uKSA9PiB2b2lkO1xuICBvbkNsb3NlOiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBlbnRlciA9IHVzZVNsaWRlSW4oLTgwLCAwKTtcbiAgY29uc3QgbWluZSA9IGNpdi5wbGF5ZXI7XG4gIGNvbnN0IHN1cnBsdXMgPSBjaXR5LnlpZWxkcy5mb29kIC0gY2l0eS5wb3B1bGF0aW9uICogMjtcbiAgY29uc3QgYnVpbHQgPSBnYW1lLmJ1aWx0W2NpdHkuaWRdID8/IFtdO1xuICBjb25zdCBob3VzaW5nID0gY2l0eS5wb3B1bGF0aW9uICsgMiArIChidWlsdC5pbmNsdWRlcyhcImdyYW5hcnlcIikgPyAyIDogMCk7XG4gIGNvbnN0IGFtZW5pdGllcyA9IDIgKyAoY2l0eS5jYXBpdGFsID8gMiA6IDApO1xuICBjb25zdCB1bmhhcHB5ID0gTWF0aC5jZWlsKGNpdHkucG9wdWxhdGlvbiAvIDIpO1xuICBjb25zdCBncm93dGggPSAoKGdhbWUudHVybiAqIDcgKyBjaXR5LnBvcHVsYXRpb24gKiAxMykgJSAyMCkgLyAyMDtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4ucGFuZWwsXG4gICAgICAgIC4uLmVudGVyLFxuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgbGVmdDogMTIsXG4gICAgICAgIHRvcDogNDQsXG4gICAgICAgIGJvdHRvbTogMTIsXG4gICAgICAgIHdpZHRoOiBXSURUSCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXtPV05TX1BPSU5URVJ9XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiAxMixcbiAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDEyLCB2ZXJ0aWNhbDogMTAgfSxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IHsgdG9wOiAzLCByaWdodDogMyB9LFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGFuZ2xlOiAxODAsXG4gICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICB7IGNvbG9yOiB0b25lKGNpdi5jb2xvciwgMC45KSB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiB0b25lKGNpdi5jb2xvciwgMC4zNSkgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib3JkZXI6IHsgYm90dG9tOiAxIH0sXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPE1lZGFsbGlvblxuICAgICAgICAgIHNpemU9ezQ4fVxuICAgICAgICAgIGlubmVyPXtDLnNsYXRlfVxuICAgICAgICAgIG91dGVyPXtDLmlua31cbiAgICAgICAgICBwcm9ncmVzcz17Z3Jvd3RofVxuICAgICAgICAgIHJpbmc9e0MuZm9vZH1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxNywgZm9udFdlaWdodDogXCJib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgICAgICB7YCR7Y2l0eS5wb3B1bGF0aW9ufWB9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L01lZGFsbGlvbj5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZmxleEdyb3c6IDEsIGdhcDogMSB9fT5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDYgfX0+XG4gICAgICAgICAgICB7Y2l0eS5jYXBpdGFsICYmIDxJY29uIG5hbWU9XCJzdGFyXCIgc2l6ZT17MTV9IGNvbG9yPXtDLmdvbGRIaX0gLz59XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDIxLFxuICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEuNSxcbiAgICAgICAgICAgICAgICBjb2xvcjogXCIjZmZmZmZmXCIsXG4gICAgICAgICAgICAgICAgdGV4dFNoYWRvdzoge1xuICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjYpXCIsXG4gICAgICAgICAgICAgICAgICBvZmZzZXRYOiAwLFxuICAgICAgICAgICAgICAgICAgb2Zmc2V0WTogMSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7Y2l0eS5uYW1lLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IHRvbmUoY2l2LmNvbG9yLCAxLjYpIH19PlxuICAgICAgICAgICAge2NpdHkuY2FwaXRhbCA/IGBDYXBpdGFsIG9mICR7Y2l2Lm5hbWV9YCA6IGNpdi5uYW1lfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8Q2xvc2VCdXR0b24gb25DbGljaz17b25DbG9zZX0gLz5cbiAgICAgIDwvbm9kZT5cblxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTYsIHZlcnRpY2FsOiAxMiB9LFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuMjUpXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtZSUVMRFMubWFwKCh5KSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17eS5rZXl9XG4gICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDMgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXt5LmtleX0gc2l6ZT17MjB9IGNvbG9yPXt5LmNvbG9yfSAvPlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiBcImJvbGRcIiwgY29sb3I6IHkuY29sb3IgfX0+XG4gICAgICAgICAgICAgIHtzaWduZWQoeS5rZXkgPT09IFwiZm9vZFwiID8gc3VycGx1cyA6IGNpdHkueWllbGRzW3kua2V5XSl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cblxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA5LCBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgPFN0YXRcbiAgICAgICAgICBpY29uPVwiZm9vZFwiXG4gICAgICAgICAgY29sb3I9e0MuZm9vZH1cbiAgICAgICAgICBsYWJlbD1cIkdyb3d0aFwiXG4gICAgICAgICAgdmFsdWU9e3BsdXJhbChNYXRoLm1heCgxLCBNYXRoLmNlaWwoKDEgLSBncm93dGgpICogMTIpKSwgXCJ0dXJuXCIpfVxuICAgICAgICAgIGZpbGw9e2dyb3d0aH1cbiAgICAgICAgLz5cbiAgICAgICAgPFN0YXRcbiAgICAgICAgICBpY29uPVwiaG91c2luZ1wiXG4gICAgICAgICAgY29sb3I9XCIjN2VjOGMwXCJcbiAgICAgICAgICBsYWJlbD1cIkhvdXNpbmdcIlxuICAgICAgICAgIHZhbHVlPXtgJHtjaXR5LnBvcHVsYXRpb259IC8gJHtob3VzaW5nfWB9XG4gICAgICAgICAgZmlsbD17Y2l0eS5wb3B1bGF0aW9uIC8gaG91c2luZ31cbiAgICAgICAgLz5cbiAgICAgICAgPFN0YXRcbiAgICAgICAgICBpY29uPVwiYW1lbml0aWVzXCJcbiAgICAgICAgICBjb2xvcj17YW1lbml0aWVzID49IHVuaGFwcHkgPyBDLmdvb2QgOiBDLmJhZH1cbiAgICAgICAgICBsYWJlbD1cIkFtZW5pdGllc1wiXG4gICAgICAgICAgdmFsdWU9e2Ake2FtZW5pdGllc30gLyAke3VuaGFwcHl9YH1cbiAgICAgICAgICBmaWxsPXtNYXRoLm1pbigxLCBhbWVuaXRpZXMgLyB1bmhhcHB5KX1cbiAgICAgICAgLz5cbiAgICAgICAgPFN0YXRcbiAgICAgICAgICBpY29uPVwibWFwXCJcbiAgICAgICAgICBjb2xvcj17Qy5tdXRlZH1cbiAgICAgICAgICBsYWJlbD1cIlRlcnJpdG9yeVwiXG4gICAgICAgICAgdmFsdWU9e2Ake2NpdHkudGlsZXN9IHRpbGVzYH1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cblxuICAgICAge21pbmUgPyAoXG4gICAgICAgIDxQcm9kdWN0aW9uIGNpdHk9e2NpdHl9IGdhbWU9e2dhbWV9IGRpc3BhdGNoPXtkaXNwYXRjaH0gLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxub2RlIHN0eWxlPXt7IHBhZGRpbmc6IDE0IH19PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgICAgICB7YEEgY2l0eSBvZiAke2Npdi5uYW1lfS4gSXRzIHdvcmtzIGFyZSBoaWRkZW4gZnJvbSB5b3UuYH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBTdGF0KHtcbiAgaWNvbixcbiAgY29sb3IsXG4gIGxhYmVsLFxuICB2YWx1ZSxcbiAgZmlsbCxcbn06IHtcbiAgaWNvbjogSWNvbk5hbWU7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGZpbGw/OiBudW1iZXI7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA4IH19PlxuICAgICAgPEljb24gbmFtZT17aWNvbn0gc2l6ZT17MTZ9IGNvbG9yPXtjb2xvcn0gLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IHdpZHRoOiA4MiwgZm9udFNpemU6IDEyLCBjb2xvcjogQy50ZXh0IH19PntsYWJlbH08L3RleHQ+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fT5cbiAgICAgICAge2ZpbGwgIT09IHVuZGVmaW5lZCAmJiA8QmFyIHZhbHVlPXtmaWxsfSB3aWR0aD17MTUwfSBjb2xvcj17Y29sb3J9IC8+fVxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgIHt2YWx1ZX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFByb2R1Y3Rpb24oe1xuICBjaXR5LFxuICBnYW1lLFxuICBkaXNwYXRjaCxcbn06IHtcbiAgY2l0eTogQ2l0eUluZm87XG4gIGdhbWU6IEdhbWU7XG4gIGRpc3BhdGNoOiAoYTogQWN0aW9uKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBub3cgPSBnYW1lLmJ1aWxkaW5nW2NpdHkuaWRdO1xuICBjb25zdCBjdXJyZW50ID0gaXRlbShub3cuaXRlbSk7XG4gIGNvbnN0IGJ1aWx0ID0gZ2FtZS5idWlsdFtjaXR5LmlkXSA/PyBbXTtcbiAgY29uc3QgcmF0ZSA9IGNpdHkueWllbGRzLnByb2R1Y3Rpb247XG4gIGNvbnN0IGdyb3VwcyA9IChbXCJEaXN0cmljdFwiLCBcIkJ1aWxkaW5nXCIsIFwiVW5pdFwiXSBhcyBjb25zdCkubWFwKChraW5kKSA9PiAoe1xuICAgIGtpbmQsXG4gICAgaXRlbXM6IElURU1TLmZpbHRlcigoaSkgPT4gaS5raW5kID09PSBraW5kICYmICFidWlsdC5pbmNsdWRlcyhpLmlkKSksXG4gIH0pKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgIGZsZXhTaHJpbms6IDEsXG4gICAgICAgIG1pbkhlaWdodDogMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogeyBob3Jpem9udGFsOiAxNCB9LCBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDggfX1cbiAgICAgID5cbiAgICAgICAgPEhlYWRlciBjb2xvcj17Qy5wcm9kdWN0aW9ufT5Qcm9kdWNpbmc8L0hlYWRlcj5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCB9fT5cbiAgICAgICAgICA8TWVkYWxsaW9uXG4gICAgICAgICAgICBzaXplPXs0Nn1cbiAgICAgICAgICAgIHByb2dyZXNzPXtub3cucHJvZ3Jlc3MgLyBjdXJyZW50LmNvc3R9XG4gICAgICAgICAgICByaW5nPXtDLnByb2R1Y3Rpb259XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPEljb24gbmFtZT17Y3VycmVudC5pY29ufSBzaXplPXsyMH0gY29sb3I9e0MucHJvZHVjdGlvbn0gLz5cbiAgICAgICAgICA8L01lZGFsbGlvbj5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIsIGZsZXhHcm93OiAxIH19PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2N1cnJlbnQubmFtZX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMucHJvZHVjdGlvbiB9fT5cbiAgICAgICAgICAgICAge2Ake3BsdXJhbCh0dXJuc0xlZnQoY3VycmVudC5jb3N0LCBub3cucHJvZ3Jlc3MsIHJhdGUpLCBcInR1cm5cIil9IMK3ICR7Zm10KG5vdy5wcm9ncmVzcyl9LyR7Y3VycmVudC5jb3N0fWB9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIHtidWlsdC5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBmbGV4V3JhcDogXCJ3cmFwXCIsIGdhcDogNSB9fT5cbiAgICAgICAgICAgIHtidWlsdC5tYXAoKGlkKSA9PiAoXG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAga2V5PXtpZH1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgICBnYXA6IDQsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDcsIHZlcnRpY2FsOiAzIH0sXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDEwLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNilcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEljb24gbmFtZT17aXRlbShpZCkuaWNvbn0gc2l6ZT17MTF9IGNvbG9yPXtDLm11dGVkfSAvPlxuICAgICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgICAgICAgICAgICB7aXRlbShpZCkubmFtZX1cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKX1cbiAgICAgICAgPEhlYWRlcj5DaG9vc2UgcHJvZHVjdGlvbjwvSGVhZGVyPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICBmbGV4U2hyaW5rOiAxLFxuICAgICAgICAgIG1pbkhlaWdodDogMCxcbiAgICAgICAgICBvdmVyZmxvd1k6IFwic2Nyb2xsXCIsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDEwLCBib3R0b206IDEwIH0sXG4gICAgICAgICAgc2Nyb2xsYmFyOiB7XG4gICAgICAgICAgICB0aGlja25lc3M6IDYsXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJmbG9hdFwiLFxuICAgICAgICAgICAgdGh1bWI6IHsgYmFja2dyb3VuZENvbG9yOiBDLmdvbGRMbywgYm9yZGVyUmFkaXVzOiAzIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2dyb3Vwcy5tYXAoKGcpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtnLmtpbmR9XG4gICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDQsIG1hcmdpbjogeyB0b3A6IDggfSB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7IC4uLmNhcHMsIGNvbG9yOiBDLm11dGVkLCBtYXJnaW46IHsgbGVmdDogNCB9IH19XG4gICAgICAgICAgICA+e2Ake2cua2luZH1zYH08L3RleHQ+XG4gICAgICAgICAgICB7Zy5pdGVtcy5tYXAoKGl0KSA9PiAoXG4gICAgICAgICAgICAgIDxDaG9pY2VcbiAgICAgICAgICAgICAgICBrZXk9e2l0LmlkfVxuICAgICAgICAgICAgICAgIGl0PXtpdH1cbiAgICAgICAgICAgICAgICB0dXJucz17dHVybnNMZWZ0KGl0LmNvc3QsIDAsIHJhdGUpfVxuICAgICAgICAgICAgICAgIGFjdGl2ZT17aXQuaWQgPT09IGN1cnJlbnQuaWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT5cbiAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJwcm9kdWNlXCIsIGNpdHk6IGNpdHkuaWQsIGl0ZW06IGl0LmlkIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIENob2ljZSh7XG4gIGl0LFxuICB0dXJucyxcbiAgYWN0aXZlLFxuICBvbkNsaWNrLFxufToge1xuICBpdDogSXRlbTtcbiAgdHVybnM6IG51bWJlcjtcbiAgYWN0aXZlOiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDEwLFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDgsIHZlcnRpY2FsOiA2IH0sXG4gICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogYWN0aXZlID8gQy5wcm9kdWN0aW9uIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDYpXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogYWN0aXZlXG4gICAgICAgICAgPyBcInJnYmEoMjQwLCAxNTUsIDYxLCAwLjE2KVwiXG4gICAgICAgICAgOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMylcIixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXt7XG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDk1LCAxOTEsIDI0NCwgMC4xNClcIixcbiAgICAgICAgYm9yZGVyQ29sb3I6IEMuc2xhdGVIaSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMzAsXG4gICAgICAgICAgaGVpZ2h0OiAzMCxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDE1LFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmluayxcbiAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExvLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8SWNvbiBuYW1lPXtpdC5pY29ufSBzaXplPXsxNn0gY29sb3I9e0MuZ29sZEhpfSAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZmxleEdyb3c6IDEsIGdhcDogMSB9fT5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgICAge2l0Lm5hbWV9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogQy5tdXRlZCB9fT57aXQuZWZmZWN0fTwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLCBnYXA6IDEgfX0+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMyB9fT5cbiAgICAgICAgICA8SWNvbiBuYW1lPVwicHJvZHVjdGlvblwiIHNpemU9ezExfSBjb2xvcj17Qy5wcm9kdWN0aW9ufSAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnByb2R1Y3Rpb24gfX1cbiAgICAgICAgICA+e2Ake2l0LmNvc3R9YH08L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogQy5tdXRlZCB9fT5cbiAgICAgICAgICB7cGx1cmFsKHR1cm5zLCBcInR1cm5cIil9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aFJlcGVhdCxcbiAgd2l0aFRpbWluZyxcbiAgdHlwZSBQb2ludGVyRXZlbnREYXRhLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBDLCBGb250cywgT1dOU19QT0lOVEVSLCBjYXBzLCBnaWx0LCBwYW5lbCB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgSWNvbiB9IGZyb20gXCIuLi91aS9JY29uXCI7XG5pbXBvcnQgeyBSb3VuZEJ1dHRvbiwgcmFkaWFsIH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuXG5jb25zdCBNQVBfVyA9IDMwMDtcbi8qKiBUaGUgbWFwJ3MgYXNwZWN0IChpdHMgaGV4IGdyaWQncyB3aWR0aCBvdmVyIGl0cyBoZWlnaHQpLiAqL1xuY29uc3QgTUFQX0ggPSBNYXRoLnJvdW5kKE1BUF9XIC8gMS44Myk7XG5cbi8qKiBCb3R0b20gcmlnaHQ6IHRoZSBlbmQtdHVybiBidXR0b24gYW5kIHRoZSBtaW5pbWFwIOKAlCBhIGA8cG9ydGFsPmAgb2YgYVxuICogIHRvcC1kb3duIGNhbWVyYSBmaWxtaW5nIHRoZSB3aG9sZSBtYXAsIHlvdXIgdmlldyBvdXRsaW5lZCBvbiBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBY3Rpb25QYW5lbCh7XG4gIGxhYmVsLFxuICBidXN5LFxuICBsZW5zLFxuICBvbk5leHQsXG4gIG9uTGVucyxcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgYnVzeTogYm9vbGVhbjtcbiAgbGVuczogYm9vbGVhbjtcbiAgb25OZXh0OiAoKSA9PiB2b2lkO1xuICBvbkxlbnM6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IGp1bXAgPSAoZTogUG9pbnRlckV2ZW50RGF0YSkgPT4gYmV2eS5tYXAuanVtcCh7IHU6IGUueCwgdjogZS55IH0pO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgcmlnaHQ6IDEyLFxuICAgICAgICBib3R0b206IDEyLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgbWFyZ2luOiB7IGJvdHRvbTogOCwgcmlnaHQ6IDggfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgLi4ucGFuZWwsXG4gICAgICAgICAgICBoZWlnaHQ6IDM0LFxuICAgICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAxNiwgcmlnaHQ6IDMwIH0sXG4gICAgICAgICAgICBtYXJnaW46IHsgcmlnaHQ6IC0yMiB9LFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogMTcsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBob3ZlclN0eWxlPXtPV05TX1BPSU5URVJ9XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRm9udHMuZGlzcGxheSxcbiAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgICBjb2xvcjogQy5nb2xkSGksXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtsYWJlbH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPEVuZFR1cm4gYnVzeT17YnVzeX0gb25DbGljaz17b25OZXh0fSAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgLi4ucGFuZWwsIHBhZGRpbmc6IDYsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNiB9fVxuICAgICAgICBob3ZlclN0eWxlPXtPV05TX1BPSU5URVJ9XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgZ2FwOiA4LFxuICAgICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAyIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxSb3VuZEJ1dHRvblxuICAgICAgICAgICAgaWNvbj1cIm1hcFwiXG4gICAgICAgICAgICBzaXplPXsyOH1cbiAgICAgICAgICAgIHRpcD17bGVucyA/IFwiQmFjayB0byB0aGUgdGVycmFpblwiIDogXCJQb2xpdGljYWwgbGVuc1wifVxuICAgICAgICAgICAgdGlwU2lkZT1cInRvcFwiXG4gICAgICAgICAgICBhY3RpdmU9e2xlbnN9XG4gICAgICAgICAgICBvbkNsaWNrPXtvbkxlbnN9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5jYXBzLCBjb2xvcjogbGVucyA/IEMuZ29sZEhpIDogQy5tdXRlZCB9fT5cbiAgICAgICAgICAgIHtsZW5zID8gXCJQT0xJVElDQUwgTEVOU1wiIDogXCJURVJSQUlOXCJ9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxwb3J0YWxcbiAgICAgICAgICB0YXJnZXQ9XCJtaW5pbWFwXCJcbiAgICAgICAgICBvblBvaW50ZXJEb3duPXtqdW1wfVxuICAgICAgICAgIG9uUG9pbnRlck1vdmU9e2p1bXB9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiBNQVBfVyxcbiAgICAgICAgICAgIGhlaWdodDogTUFQX0gsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogQy5nb2xkTG8sXG4gICAgICAgICAgICBjdXJzb3I6IFwiY3Jvc3NoYWlyXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgZ3JlYXQgcm91bmQgYnV0dG9uOiBhIGdpbHQgcmluZyB0aGF0IHR1cm5zIHdoaWxlIHRoZSB3b3JsZCB0YWtlc1xuICogIGl0cyB0dXJuLiAqL1xuZnVuY3Rpb24gRW5kVHVybih7IGJ1c3ksIG9uQ2xpY2sgfTogeyBidXN5OiBib29sZWFuOyBvbkNsaWNrOiAoKSA9PiB2b2lkIH0pIHtcbiAgY29uc3Qgc3BpbiA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICBjb25zdCBbZ2xvdywgc2V0R2xvd10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc3Bpbi52YWx1ZSA9IDA7XG4gICAgaWYgKGJ1c3kpIHNwaW4udmFsdWUgPSB3aXRoUmVwZWF0KHdpdGhUaW1pbmcoMzYwLCB7IGR1cmF0aW9uOiA3MDAgfSkpO1xuICB9LCBbYnVzeSwgc3Bpbl0pO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2V0R2xvdyh0cnVlKX1cbiAgICAgIG9uUG9pbnRlckxlYXZlPXsoKSA9PiBzZXRHbG93KGZhbHNlKX1cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiA5NixcbiAgICAgICAgaGVpZ2h0OiA5NixcbiAgICAgICAgYm9yZGVyUmFkaXVzOiA0OCxcbiAgICAgICAgcGFkZGluZzogNSxcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBnaWx0LFxuICAgICAgICBib3hTaGFkb3c6IGdsb3dcbiAgICAgICAgICA/IHsgY29sb3I6IFwicmdiYSgyNDYsIDIyOCwgMTY4LCAwLjYpXCIsIGJsdXJSYWRpdXM6IDIyIH1cbiAgICAgICAgICA6IHsgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjYpXCIsIGJsdXJSYWRpdXM6IDE0LCB5T2Zmc2V0OiA0IH0sXG4gICAgICB9fVxuICAgICAgcHJlc3NTdHlsZT17eyB0cmFuc2Zvcm06IHsgc2NhbGU6IDAuOTUgfSB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiA0MyxcbiAgICAgICAgICBwYWRkaW5nOiA2LFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgICAgdHlwZTogXCJjb25pY1wiLFxuICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCIjN2ZkMGZmXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCIjMTY0NDZhXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCIjN2ZkMGZmXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCIjMTY0NDZhXCIgfSxcbiAgICAgICAgICAgICAgeyBjb2xvcjogXCIjN2ZkMGZmXCIgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0cmFuc2Zvcm06IHsgcm90YXRlOiB7IGFuaW1hdGVkOiBzcGluIH0gfSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDM3LFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiByYWRpYWwoXCIjMmY2YTljXCIsIFwiIzBiMWMyZVwiKSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEljb24gbmFtZT17YnVzeSA/IFwibW9vblwiIDogXCJhcnJvd1wifSBzaXplPXszNH0gY29sb3I9e0MuZ29sZEhpfSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDaXZJbmZvLCBVbml0SW5mbyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyB1c2VTbGlkZUluIH0gZnJvbSBcIi4uL2hvb2tzXCI7XG5pbXBvcnQgeyBDLCBGb250cywgT1dOU19QT0lOVEVSLCBwYW5lbCwgdG9uZSB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgSWNvbiwgdHlwZSBJY29uTmFtZSB9IGZyb20gXCIuLi91aS9JY29uXCI7XG5pbXBvcnQgeyBBbW91bnQsIEJhciwgQ2xvc2VCdXR0b24sIE1lZGFsbGlvbiwgUm91bmRCdXR0b24gfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5cbnR5cGUgT3JkZXIgPSB7IGljb246IEljb25OYW1lOyBuYW1lOiBzdHJpbmcgfTtcblxuY29uc3QgTU9WRTogT3JkZXIgPSB7IGljb246IFwiYXJyb3dcIiwgbmFtZTogXCJNb3ZlXCIgfTtcbmNvbnN0IEZPUlRJRlk6IE9yZGVyID0geyBpY29uOiBcInNoaWVsZFwiLCBuYW1lOiBcIkZvcnRpZnlcIiB9O1xuY29uc3QgU0xFRVA6IE9yZGVyID0geyBpY29uOiBcIm1vb25cIiwgbmFtZTogXCJTbGVlcFwiIH07XG5jb25zdCBTS0lQOiBPcmRlciA9IHsgaWNvbjogXCJza2lwXCIsIG5hbWU6IFwiU2tpcCB0dXJuXCIgfTtcbmNvbnN0IERFTEVURTogT3JkZXIgPSB7IGljb246IFwidHJhc2hcIiwgbmFtZTogXCJEZWxldGUgdW5pdFwiIH07XG5cbmV4cG9ydCBjb25zdCBVTklUUzogUmVjb3JkPFxuICBzdHJpbmcsXG4gIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgcm9sZTogc3RyaW5nO1xuICAgIGljb246IEljb25OYW1lO1xuICAgIHN0cmVuZ3RoPzogbnVtYmVyO1xuICAgIHJhbmdlZD86IG51bWJlcjtcbiAgICBtb3ZlczogbnVtYmVyO1xuICAgIG9yZGVyczogT3JkZXJbXTtcbiAgfVxuPiA9IHtcbiAgd2Fycmlvcjoge1xuICAgIG5hbWU6IFwiV2FycmlvclwiLFxuICAgIHJvbGU6IFwiTWVsZWVcIixcbiAgICBpY29uOiBcInN0cmVuZ3RoXCIsXG4gICAgc3RyZW5ndGg6IDIwLFxuICAgIG1vdmVzOiAyLFxuICAgIG9yZGVyczogW01PVkUsIEZPUlRJRlksIFNMRUVQLCBTS0lQLCBERUxFVEVdLFxuICB9LFxuICBhcmNoZXI6IHtcbiAgICBuYW1lOiBcIkFyY2hlclwiLFxuICAgIHJvbGU6IFwiUmFuZ2VkXCIsXG4gICAgaWNvbjogXCJib3dcIixcbiAgICBzdHJlbmd0aDogMTUsXG4gICAgcmFuZ2VkOiAyNSxcbiAgICBtb3ZlczogMixcbiAgICBvcmRlcnM6IFtcbiAgICAgIE1PVkUsXG4gICAgICB7IGljb246IFwiYm93XCIsIG5hbWU6IFwiUmFuZ2VkIGF0dGFja1wiIH0sXG4gICAgICBGT1JUSUZZLFxuICAgICAgU0tJUCxcbiAgICAgIERFTEVURSxcbiAgICBdLFxuICB9LFxuICBzY291dDoge1xuICAgIG5hbWU6IFwiU2NvdXRcIixcbiAgICByb2xlOiBcIlJlY29uXCIsXG4gICAgaWNvbjogXCJleWVcIixcbiAgICBzdHJlbmd0aDogMTAsXG4gICAgbW92ZXM6IDMsXG4gICAgb3JkZXJzOiBbTU9WRSwgeyBpY29uOiBcIm1hcFwiLCBuYW1lOiBcIkV4cGxvcmVcIiB9LCBTTEVFUCwgU0tJUCwgREVMRVRFXSxcbiAgfSxcbiAgc2V0dGxlcjoge1xuICAgIG5hbWU6IFwiU2V0dGxlclwiLFxuICAgIHJvbGU6IFwiQ2l2aWxpYW5cIixcbiAgICBpY29uOiBcImZsYWdcIixcbiAgICBtb3ZlczogMixcbiAgICBvcmRlcnM6IFtNT1ZFLCB7IGljb246IFwiY2l0eVwiLCBuYW1lOiBcIkZvdW5kIGNpdHlcIiB9LCBTTEVFUCwgU0tJUCwgREVMRVRFXSxcbiAgfSxcbiAgYnVpbGRlcjoge1xuICAgIG5hbWU6IFwiQnVpbGRlclwiLFxuICAgIHJvbGU6IFwiQ2l2aWxpYW4gwrcgMyBjaGFyZ2VzXCIsXG4gICAgaWNvbjogXCJwcm9kdWN0aW9uXCIsXG4gICAgbW92ZXM6IDIsXG4gICAgb3JkZXJzOiBbXG4gICAgICBNT1ZFLFxuICAgICAgeyBpY29uOiBcInByb2R1Y3Rpb25cIiwgbmFtZTogXCJCdWlsZCBmYXJtXCIgfSxcbiAgICAgIFNMRUVQLFxuICAgICAgU0tJUCxcbiAgICAgIERFTEVURSxcbiAgICBdLFxuICB9LFxufTtcblxuLyoqIEJvdHRvbSBsZWZ0LCB3aGlsZSBhIHVuaXQgaXMgc2VsZWN0ZWQ6IGl0cyBwb3J0cmFpdCwgbnVtYmVycyBhbmRcbiAqICBvcmRlcnMuIChPcmRlcnMganVzdCBkaXNtaXNzIGl0OiBub3RoaW5nIGlzIHBsYXllZCBoZXJlLikgKi9cbmV4cG9ydCBmdW5jdGlvbiBVbml0UGFuZWwoe1xuICB1bml0LFxuICBjaXYsXG4gIG9uQ2xvc2UsXG59OiB7XG4gIHVuaXQ6IFVuaXRJbmZvO1xuICBjaXY6IENpdkluZm87XG4gIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IGRlZiA9IFVOSVRTW3VuaXQua2luZF07XG4gIGNvbnN0IGVudGVyID0gdXNlU2xpZGVJbigwLCA3MCk7XG4gIGNvbnN0IG1pbmUgPSBjaXYucGxheWVyO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5wYW5lbCxcbiAgICAgICAgLi4uZW50ZXIsXG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAxMixcbiAgICAgICAgYm90dG9tOiAxMixcbiAgICAgICAgd2lkdGg6IDQwMCxcbiAgICAgICAgcGFkZGluZzogMTIsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIGdhcDogMTIsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17T1dOU19QT0lOVEVSfVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMTQsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIgfX0+XG4gICAgICAgIDxNZWRhbGxpb25cbiAgICAgICAgICBzaXplPXs4OH1cbiAgICAgICAgICBpbm5lcj17dG9uZShjaXYuY29sb3IsIDEuMyl9XG4gICAgICAgICAgb3V0ZXI9e3RvbmUoY2l2LmNvbG9yLCAwLjM1KX1cbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uIG5hbWU9e2RlZi5pY29ufSBzaXplPXs0Mn0gY29sb3I9XCIjZmZmZmZmXCIgLz5cbiAgICAgICAgPC9NZWRhbGxpb24+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNSwgZmxleEdyb3c6IDEgfX0+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fT5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRm9udHMuZGlzcGxheSxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2RlZi5uYW1lLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8Q2xvc2VCdXR0b24gb25DbGljaz17b25DbG9zZX0gLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMubXV0ZWQgfX1cbiAgICAgICAgICA+e2Ake2RlZi5yb2xlfSDCtyAke2Npdi5uYW1lfWB9PC90ZXh0PlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMTYsIG1hcmdpbjogeyB0b3A6IDIgfSB9fT5cbiAgICAgICAgICAgIHtkZWYuc3RyZW5ndGggJiYgKFxuICAgICAgICAgICAgICA8QW1vdW50XG4gICAgICAgICAgICAgICAgaWNvbj1cInN0cmVuZ3RoXCJcbiAgICAgICAgICAgICAgICBjb2xvcj17Qy50ZXh0fVxuICAgICAgICAgICAgICAgIHZhbHVlPXtgJHtkZWYuc3RyZW5ndGh9YH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICB7ZGVmLnJhbmdlZCAmJiAoXG4gICAgICAgICAgICAgIDxBbW91bnQgaWNvbj1cImJvd1wiIGNvbG9yPXtDLnRleHR9IHZhbHVlPXtgJHtkZWYucmFuZ2VkfWB9IC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPEFtb3VudFxuICAgICAgICAgICAgICBpY29uPVwibW92ZW1lbnRcIlxuICAgICAgICAgICAgICBjb2xvcj17Qy50ZXh0fVxuICAgICAgICAgICAgICB2YWx1ZT17YCR7ZGVmLm1vdmVzfS8ke2RlZi5tb3Zlc31gfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPEJhciB2YWx1ZT17bWluZSA/IDEgOiAwLjd9IHdpZHRoPXsyNDB9IGhlaWdodD17OH0gY29sb3I9e0MuZ29vZH0gLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAge21pbmUgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgdG9wOiAxMCB9LFxuICAgICAgICAgICAgYm9yZGVyOiB7IHRvcDogMSB9LFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2RlZi5vcmRlcnMubWFwKChvKSA9PiAoXG4gICAgICAgICAgICA8Um91bmRCdXR0b25cbiAgICAgICAgICAgICAga2V5PXtvLm5hbWV9XG4gICAgICAgICAgICAgIGljb249e28uaWNvbn1cbiAgICAgICAgICAgICAgdGlwPXtvLm5hbWV9XG4gICAgICAgICAgICAgIHRpcFNpZGU9XCJ0b3BcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXtvbkNsb3NlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgQW5jaG9yU2NhbGluZyB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IENpdHlJbmZvLCBDaXZJbmZvLCBUaWxlSW5mbywgVW5pdEluZm8sIFdvcmxkSW5mbyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBpdGVtLCB0dXJuc0xlZnQsIHR5cGUgR2FtZSB9IGZyb20gXCIuLi9nYW1lXCI7XG5pbXBvcnQgeyBDLCBGb250cywgWUlFTERTLCBmbXQsIHBhbmVsLCB0b25lIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IGNvbmljLCByYWRpYWwgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBVTklUUyB9IGZyb20gXCIuL1VuaXRQYW5lbFwiO1xuXG5leHBvcnQgdHlwZSBTZWxlY3Rpb24gPSB7IGtpbmQ6IFwiY2l0eVwiIHwgXCJ1bml0XCI7IGlkOiBzdHJpbmcgfSB8IG51bGw7XG5cbmNvbnN0IEFOQ0hPUl9TQ0FMSU5HOiBBbmNob3JTY2FsaW5nID0ge1xuICBiYXNlRGlzdGFuY2U6IDIwLFxuICBmYWN0b3I6IDEuMSxcbiAgbWluOiAwLjcsXG4gIG1heDogMSxcbn07XG5cbi8qKiBUaGUgY2l0eSBiYW5uZXJzIGFuZCB1bml0IGZsYWdzOiBzY3JlZW4tc3BhY2UgUmVhY3QgcGlubmVkIHRvIHBvaW50cyBvZlxuICogIHRoZSAzRCBtYXAgd2l0aCBgPGFuY2hvcj5gLCBmb2xsb3dpbmcgaXQgYXMgdGhlIGNhbWVyYSBtb3Zlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCYW5uZXJzKHtcbiAgd29ybGQsXG4gIGdhbWUsXG4gIHNlbGVjdGlvbixcbiAgb25TZWxlY3QsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHNlbGVjdGlvbjogU2VsZWN0aW9uO1xuICBvblNlbGVjdDogKHM6IFNlbGVjdGlvbikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgY2l2ID0gKGlkOiBzdHJpbmcpID0+IHdvcmxkLmNpdnMuZmluZCgoYykgPT4gYy5pZCA9PT0gaWQpITtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge3dvcmxkLmNpdGllcy5tYXAoKGNpdHkpID0+IChcbiAgICAgICAgPENpdHlCYW5uZXJcbiAgICAgICAgICBrZXk9e2NpdHkuaWR9XG4gICAgICAgICAgY2l0eT17Y2l0eX1cbiAgICAgICAgICBjaXY9e2NpdihjaXR5LmNpdil9XG4gICAgICAgICAgZ2FtZT17Z2FtZX1cbiAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0aW9uPy5raW5kID09PSBcImNpdHlcIiAmJiBzZWxlY3Rpb24uaWQgPT09IGNpdHkuaWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25TZWxlY3QoeyBraW5kOiBcImNpdHlcIiwgaWQ6IGNpdHkuaWQgfSl9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIHt3b3JsZC51bml0c1xuICAgICAgICAuZmlsdGVyKCh1KSA9PiAhdS5oaWRkZW4pXG4gICAgICAgIC5tYXAoKHVuaXQpID0+IChcbiAgICAgICAgICA8VW5pdEZsYWdcbiAgICAgICAgICAgIGtleT17dW5pdC5pZH1cbiAgICAgICAgICAgIHVuaXQ9e3VuaXR9XG4gICAgICAgICAgICBjaXY9e2Npdih1bml0LmNpdil9XG4gICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0aW9uPy5raW5kID09PSBcInVuaXRcIiAmJiBzZWxlY3Rpb24uaWQgPT09IHVuaXQuaWR9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdCh7IGtpbmQ6IFwidW5pdFwiLCBpZDogdW5pdC5pZCB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICA8Lz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gQ2l0eUJhbm5lcih7XG4gIGNpdHksXG4gIGNpdixcbiAgZ2FtZSxcbiAgc2VsZWN0ZWQsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGNpdHk6IENpdHlJbmZvO1xuICBjaXY6IENpdkluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHNlbGVjdGVkOiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBwcm9kdWNpbmcgPSBnYW1lLmJ1aWxkaW5nW2NpdHkuaWRdO1xuICBjb25zdCBpdCA9IHByb2R1Y2luZyAmJiBpdGVtKHByb2R1Y2luZy5pdGVtKTtcbiAgLy8gR3Jvd3RoIGlzIHByZXRlbmQ6IGEgZmlsbCB0aGF0IGNyZWVwcyBvbiB3aXRoIHRoZSB0dXJucy5cbiAgY29uc3QgZ3Jvd3RoID0gKChnYW1lLnR1cm4gKiA3ICsgY2l0eS5wb3B1bGF0aW9uICogMTMpICUgMjApIC8gMjA7XG4gIHJldHVybiAoXG4gICAgPGFuY2hvclxuICAgICAgZW50aXR5PXtjaXR5LmVudGl0eX1cbiAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGhlaWdodDogNDIgfX1cbiAgICAgIHNjYWxlPXtBTkNIT1JfU0NBTElOR31cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiA0NixcbiAgICAgICAgICBoZWlnaHQ6IDQ2LFxuICAgICAgICAgIGJvcmRlclJhZGl1czogMjMsXG4gICAgICAgICAgcGFkZGluZzogNCxcbiAgICAgICAgICBtYXJnaW46IHsgcmlnaHQ6IC0xMiB9LFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogY29uaWMoZ3Jvd3RoLCBDLmZvb2QpLFxuICAgICAgICAgIHpJbmRleDogMSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDE5LFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmluayxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDIwLCBmb250V2VpZ2h0OiBcImJvbGRcIiwgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAgICAgIHtgJHtjaXR5LnBvcHVsYXRpb259YH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6IDM2LFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDgsXG4gICAgICAgICAgcGFkZGluZzogeyBsZWZ0OiAyMSwgcmlnaHQ6IGl0ID8gMjEgOiAxNSB9LFxuICAgICAgICAgIGJvcmRlclJhZGl1czogNCxcbiAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IHNlbGVjdGVkID8gQy5nb2xkSGkgOiB0b25lKGNpdi5jb2xvciwgMS40NSksXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgIHsgY29sb3I6IHRvbmUoY2l2LmNvbG9yLCAxLjA1KSB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiB0b25lKGNpdi5jb2xvciwgMC41NSkgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib3hTaGFkb3c6IHNlbGVjdGVkXG4gICAgICAgICAgICA/IHsgY29sb3I6IFwicmdiYSgyNDYsIDIyOCwgMTY4LCAwLjcpXCIsIGJsdXJSYWRpdXM6IDE1IH1cbiAgICAgICAgICAgIDogeyBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNTUpXCIsIGJsdXJSYWRpdXM6IDksIHlPZmZzZXQ6IDMgfSxcbiAgICAgICAgfX1cbiAgICAgICAgaG92ZXJTdHlsZT17eyBib3JkZXJDb2xvcjogQy5nb2xkSGkgfX1cbiAgICAgID5cbiAgICAgICAge2NpdHkuY2FwaXRhbCAmJiA8SWNvbiBuYW1lPVwic3RhclwiIHNpemU9ezE4fSBjb2xvcj17Qy5nb2xkSGl9IC8+fVxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMTgsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjUsXG4gICAgICAgICAgICBjb2xvcjogXCIjZmZmZmZmXCIsXG4gICAgICAgICAgICB0ZXh0U2hhZG93OiB7IGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC43KVwiLCBvZmZzZXRYOiAwLCBvZmZzZXRZOiAxIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtjaXR5Lm5hbWUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9idXR0b24+XG4gICAgICB7aXQgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiAtMTIgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiA0MixcbiAgICAgICAgICAgICAgaGVpZ2h0OiA0MixcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAyMSxcbiAgICAgICAgICAgICAgcGFkZGluZzogNCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBjb25pYyhcbiAgICAgICAgICAgICAgICBwcm9kdWNpbmcucHJvZ3Jlc3MgLyBpdC5jb3N0LFxuICAgICAgICAgICAgICAgIEMucHJvZHVjdGlvbixcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDE3LFxuICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmluayxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEljb24gbmFtZT17aXQuaWNvbn0gc2l6ZT17MjB9IGNvbG9yPXtDLnByb2R1Y3Rpb259IC8+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgdG9wOiA0MixcbiAgICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiA2IH0sXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogNCxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoNiwgMTMsIDIxLCAwLjg1KVwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTUsIGNvbG9yOiBDLnByb2R1Y3Rpb24gfX0+XG4gICAgICAgICAgICAgIHtgJHt0dXJuc0xlZnQoaXQuY29zdCwgcHJvZHVjaW5nLnByb2dyZXNzLCBjaXR5LnlpZWxkcy5wcm9kdWN0aW9uKX1gfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKX1cbiAgICA8L2FuY2hvcj5cbiAgKTtcbn1cblxuZnVuY3Rpb24gVW5pdEZsYWcoe1xuICB1bml0LFxuICBjaXYsXG4gIHNlbGVjdGVkLFxuICBvbkNsaWNrLFxufToge1xuICB1bml0OiBVbml0SW5mbztcbiAgY2l2OiBDaXZJbmZvO1xuICBzZWxlY3RlZDogYm9vbGVhbjtcbiAgb25DbGljazogKCkgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8YW5jaG9yIGVudGl0eT17dW5pdC5lbnRpdHl9IG9mZnNldD17WzAsIDEuMCwgMF19IHNjYWxlPXtBTkNIT1JfU0NBTElOR30+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IDQyLFxuICAgICAgICAgIGhlaWdodDogNDIsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAyMSxcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIGJvcmRlcjogMyxcbiAgICAgICAgICBib3JkZXJDb2xvcjogc2VsZWN0ZWQgPyBDLmdvbGRIaSA6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KVwiLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogcmFkaWFsKFxuICAgICAgICAgICAgdG9uZShjaXYuY29sb3IsIDEuMiksXG4gICAgICAgICAgICB0b25lKGNpdi5jb2xvciwgMC40NSksXG4gICAgICAgICAgKSxcbiAgICAgICAgICBib3hTaGFkb3c6IHtcbiAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC41NSlcIixcbiAgICAgICAgICAgIGJsdXJSYWRpdXM6IDgsXG4gICAgICAgICAgICB5T2Zmc2V0OiAzLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAgIGhvdmVyU3R5bGU9e3sgdHJhbnNmb3JtOiB7IHNjYWxlOiAxLjEyIH0gfX1cbiAgICAgID5cbiAgICAgICAgPEljb24gbmFtZT17VU5JVFNbdW5pdC5raW5kXS5pY29ufSBzaXplPXsyMn0gY29sb3I9XCIjZmZmZmZmXCIgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvYW5jaG9yPlxuICApO1xufVxuXG5jb25zdCBGRUFUVVJFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgd29vZHM6IFwiV29vZHNcIixcbiAgcmFpbmZvcmVzdDogXCJSYWluZm9yZXN0XCIsXG59O1xuXG4vKiogVGhlIGhvdmVyZWQgdGlsZSdzIHRlcnJhaW4gYW5kIHlpZWxkcywgcGlubmVkIGJlc2lkZSBpdDogdGhlIGFuY2hvclxuICogIGZvbGxvd3MgdGhlIHJpbmcgQmV2eSBwdXRzIG9uIHRoZSB0aWxlIHVuZGVyIHRoZSBwb2ludGVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRpbGVUb29sdGlwKHtcbiAgdGlsZSxcbiAgY3Vyc29yLFxuICB3b3JsZCxcbn06IHtcbiAgdGlsZTogVGlsZUluZm87XG4gIGN1cnNvcjogbnVtYmVyO1xuICB3b3JsZDogV29ybGRJbmZvO1xufSkge1xuICBjb25zdCBvd25lciA9IHdvcmxkLmNpdnMuZmluZCgoYykgPT4gYy5pZCA9PT0gdGlsZS5vd25lcik7XG4gIGNvbnN0IGNpdHkgPSB3b3JsZC5jaXRpZXMuZmluZCgoYykgPT4gYy5pZCA9PT0gdGlsZS5jaXR5KTtcbiAgY29uc3QgdW5pdCA9IHdvcmxkLnVuaXRzLmZpbmQoKHUpID0+IHUuaWQgPT09IHRpbGUudW5pdCk7XG4gIGNvbnN0IHJlbGllZiA9IHRpbGUubW91bnRhaW5zID8gXCJNb3VudGFpbnNcIiA6IHRpbGUuaGlsbHMgPyBcIkhpbGxzXCIgOiBudWxsO1xuICBjb25zdCBuYW1lID0gW3RpbGUudGVycmFpbiwgcmVsaWVmLCB0aWxlLmZlYXR1cmUgJiYgRkVBVFVSRVNbdGlsZS5mZWF0dXJlXV1cbiAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oXCIgwrcgXCIpO1xuICBjb25zdCB5aWVsZHMgPSBZSUVMRFMuZmlsdGVyKCh5KSA9PiB0aWxlLnlpZWxkc1t5LmtleV0gPiAwKTtcbiAgcmV0dXJuIChcbiAgICA8YW5jaG9yIGVudGl0eT17Y3Vyc29yfSBzdHlsZT17eyB3aWR0aDogMiwgaGVpZ2h0OiAyLCBnbG9iYWxaSW5kZXg6IDEgfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDM0LFxuICAgICAgICAgIGJvdHRvbTogMTgsXG4gICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMiwgdmVydGljYWw6IDkgfSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGdhcDogNSxcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMubmF2eSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgeyF0aWxlLnJldmVhbGVkID8gKFxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbiAgICAgICAgICAgICAgY29sb3I6IEMubXV0ZWQsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgVW5leHBsb3JlZCBsYW5kc1xuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAge3RpbGUubW91bnRhaW5zID8gKFxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkIH19PkltcGFzc2FibGU8L3RleHQ+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDEwIH19PlxuICAgICAgICAgICAgICAgIHt5aWVsZHMubWFwKCh5KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgICAgICBrZXk9e3kua2V5fVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICBnYXA6IDMsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uIG5hbWU9e3kua2V5fSBzaXplPXsxNH0gY29sb3I9e3kuY29sb3J9IC8+XG4gICAgICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiB5LmNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7Zm10KHRpbGUueWllbGRzW3kua2V5XSl9XG4gICAgICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICB7dGlsZS5mYXJtICYmIChcbiAgICAgICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMubXV0ZWQgfX0+RmFybTwvdGV4dD5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge293bmVyICYmIChcbiAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IG93bmVyLmNvbG9yLFxuICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7Y2l0eSA/IGAke293bmVyLm5hbWV9IMK3ICR7Y2l0eS5uYW1lfWAgOiBvd25lci5uYW1lfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge3VuaXQgJiYgKFxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgICAgICAgICAge1VOSVRTW3VuaXQua2luZF0ubmFtZX1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L2FuY2hvcj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBDaXZJbmZvIH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB0eXBlIHsgR2FtZSB9IGZyb20gXCIuLi9nYW1lXCI7XG5pbXBvcnQgeyBDLCBGb250cywgcGFuZWwgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IENyZXN0IH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuXG5jb25zdCBNT09EUyA9IFtcbiAgeyBuYW1lOiBcIkZyaWVuZGx5XCIsIGNvbG9yOiBDLmdvb2QsIG5vdGU6IFwiRGVjbGFyZWQgZnJpZW5kc2hpcCAxMiB0dXJucyBhZ29cIiB9LFxuICB7IG5hbWU6IFwiR3VhcmRlZFwiLCBjb2xvcjogQy5jb2luLCBub3RlOiBcIkNvdmV0cyB5b3VyIGNvYXN0YWwgY2l0aWVzXCIgfSxcbiAgeyBuYW1lOiBcIlVuZnJpZW5kbHlcIiwgY29sb3I6IEMuYmFkLCBub3RlOiBcIkRlbm91bmNlZCB5b3UgZm9yIHlvdXIgYm9yZGVyc1wiIH0sXG4gIHsgbmFtZTogXCJOZXV0cmFsXCIsIGNvbG9yOiBDLm11dGVkLCBub3RlOiBcIlRyYWRlcyB3aXRoIHlvdSBub3cgYW5kIHRoZW5cIiB9LFxuXTtcblxuLyoqIFRoZSByaXZhbHMgeW91IGhhdmUgbWV0LCB0b3AgcmlnaHQ6IGhvdmVyIG9uZSBmb3IgdGhlaXIgbGVhZGVyIGFuZFxuICogIHN0YW5kaW5nLCBjbGljayBmb3IgdGhlIHdvcmxkIHJhbmtpbmdzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExlYWRlcnMoe1xuICByaXZhbHMsXG4gIGdhbWUsXG4gIG9uT3Blbixcbn06IHtcbiAgcml2YWxzOiBDaXZJbmZvW107XG4gIGdhbWU6IEdhbWU7XG4gIG9uT3BlbjogKCkgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIHJpZ2h0OiAxNCxcbiAgICAgICAgdG9wOiA0MixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgZ2FwOiAxMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAge3JpdmFscy5tYXAoKGNpdiwgaSkgPT4ge1xuICAgICAgICBjb25zdCBzY29yZSA9IGdhbWUuaGlzdG9yeVtjaXYuaWRdLnNjb3JlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxMZWFkZXJcbiAgICAgICAgICAgIGtleT17Y2l2LmlkfVxuICAgICAgICAgICAgY2l2PXtjaXZ9XG4gICAgICAgICAgICBtb29kPXtNT09EU1tpICUgTU9PRFMubGVuZ3RoXX1cbiAgICAgICAgICAgIHNjb3JlPXtNYXRoLnJvdW5kKHNjb3JlW3Njb3JlLmxlbmd0aCAtIDFdKX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uT3Blbn1cbiAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBMZWFkZXIoe1xuICBjaXYsXG4gIG1vb2QsXG4gIHNjb3JlLFxuICBvbkNsaWNrLFxufToge1xuICBjaXY6IENpdkluZm87XG4gIG1vb2Q6ICh0eXBlb2YgTU9PRFMpW251bWJlcl07XG4gIHNjb3JlOiBudW1iZXI7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2V0SG92ZXIodHJ1ZSl9XG4gICAgICBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIoZmFsc2UpfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IDU0LCBoZWlnaHQ6IDYwLCBhbGlnbkl0ZW1zOiBcImZsZXhTdGFydFwiIH19XG4gICAgICBob3ZlclN0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMS4wNiB9IH19XG4gICAgPlxuICAgICAgPENyZXN0IGNpdj17Y2l2fSBzaXplPXs1NH0gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiA0OCxcbiAgICAgICAgICB3aWR0aDogMTQsXG4gICAgICAgICAgaGVpZ2h0OiAxNCxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDcsXG4gICAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLm5hdnksXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBtb29kLmNvbG9yLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIHtob3ZlciAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgIHRvcDogNjYsXG4gICAgICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICAgICAgcGFkZGluZzogMTIsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgZ2FwOiA0LFxuICAgICAgICAgICAgZ2xvYmFsWkluZGV4OiAxMCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgICAgICBmb250U2l6ZTogMTYsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2Npdi5sZWFkZXJ9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IGNpdi5jb2xvciB9fT57Y2l2Lm5hbWV9PC90ZXh0PlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogNiwgbWFyZ2luOiB7IHRvcDogNiB9IH19PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBtb29kLmNvbG9yLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7bW9vZC5uYW1lfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fVxuICAgICAgICAgICAgPntgwrcgc2NvcmUgJHtzY29yZX1gfTwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fT57bW9vZC5ub3RlfTwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKX1cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBOb3RlIH0gZnJvbSBcIi4uL2dhbWVcIjtcbmltcG9ydCB7IHVzZVNsaWRlSW4gfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IEMsIGdpbHQsIHBhbmVsIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IHJhZGlhbCB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuLyoqIFRoZSBzdGFjayBvZiByb3VuZCBub3RpY2VzIGRvd24gdGhlIHJpZ2h0IGVkZ2UuIE5ldyBvbmVzIHNsaWRlIGluIG9uXG4gKiAgdG9wIGFuZCBwdXNoIHRoZSByZXN0IGRvd247IGhvdmVyIG9uZSB0byByZWFkIGl0LCBjbGljayB0byBkaXNtaXNzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5vdGlmaWNhdGlvbnMoe1xuICBub3RlcyxcbiAgb25EaXNtaXNzLFxufToge1xuICBub3RlczogTm90ZVtdO1xuICBvbkRpc21pc3M6IChpZDogbnVtYmVyKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgcmlnaHQ6IDE2LFxuICAgICAgICB0b3A6IDEyOCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsXG4gICAgICAgIGdhcDogMTAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtub3Rlcy5tYXAoKG4pID0+IChcbiAgICAgICAgPE5vdGljZSBrZXk9e24uaWR9IG5vdGU9e259IG9uRGlzbWlzcz17KCkgPT4gb25EaXNtaXNzKG4uaWQpfSAvPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBOb3RpY2UoeyBub3RlLCBvbkRpc21pc3MgfTogeyBub3RlOiBOb3RlOyBvbkRpc21pc3M6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBbaG92ZXIsIHNldEhvdmVyXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgZW50ZXIgPSB1c2VTbGlkZUluKDkwLCAwKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uZW50ZXIsXG4gICAgICAgIHRyYW5zaXRpb246IHsgbGF5b3V0OiB7IGR1cmF0aW9uOiAzMDAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7aG92ZXIgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5wYW5lbCxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgcmlnaHQ6IDU2LFxuICAgICAgICAgICAgdG9wOiBcIjUwJVwiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiB7IHRyYW5zbGF0ZVk6IFwiLTUwJVwiIH0sXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMiwgdmVydGljYWw6IDcgfSxcbiAgICAgICAgICAgIGdhcDogMixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLCBjb2xvcjogbm90ZS5jb2xvciB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtub3RlLnRpdGxlfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnRleHQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT5cbiAgICAgICAgICAgIHtub3RlLmJvZHl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgICAgPGJ1dHRvblxuICAgICAgICBvbkNsaWNrPXtvbkRpc21pc3N9XG4gICAgICAgIG9uUG9pbnRlckVudGVyPXsoKSA9PiBzZXRIb3Zlcih0cnVlKX1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9eygpID0+IHNldEhvdmVyKGZhbHNlKX1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogNDYsXG4gICAgICAgICAgaGVpZ2h0OiA0NixcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDIzLFxuICAgICAgICAgIHBhZGRpbmc6IDIsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBnaWx0LFxuICAgICAgICAgIGJveFNoYWRvdzogeyBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNSlcIiwgYmx1clJhZGl1czogOCwgeU9mZnNldDogMiB9LFxuICAgICAgICB9fVxuICAgICAgICBob3ZlclN0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMS4wOCB9IH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAyMSxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogcmFkaWFsKEMuc2xhdGVIaSwgQy5pbmspLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvbiBuYW1lPXtub3RlLmljb259IHNpemU9ezIyfSBjb2xvcj17bm90ZS5jb2xvcn0gLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGluY29tZSwgeWVhciwgdHlwZSBHYW1lIH0gZnJvbSBcIi4uL2dhbWVcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBPV05TX1BPSU5URVIsIGNhcHMsIHNpZ25lZCB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgQW1vdW50LCBSb3VuZEJ1dHRvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuZXhwb3J0IHR5cGUgU2NyZWVuSWQgPSBcInRlY2hcIiB8IFwicmVwb3J0c1wiIHwgXCJyYW5raW5nc1wiO1xuXG4vKiogVGhlIHN0cmlwIGFjcm9zcyB0aGUgdG9wOiB0aGUgZW1waXJlJ3MgeWllbGRzIHBlciB0dXJuIGFuZCB0cmVhc3VyaWVzLFxuICogIHRoZW4gdGhlIHR1cm4sIHRoZSB5ZWFyIGFuZCB0aGUgdGltZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb3BCYXIoe1xuICBnYW1lLFxuICBwbGF5ZXIsXG4gIG5ldCxcbn06IHtcbiAgZ2FtZTogR2FtZTtcbiAgcGxheWVyOiBzdHJpbmc7XG4gIG5ldDogbnVtYmVyO1xufSkge1xuICBjb25zdCBwYXkgPSBpbmNvbWUoZ2FtZSwgcGxheWVyKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMjIsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTYgfSxcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogXCIjMTUyMzNhXCIgfSwgeyBjb2xvcjogXCIjMDcwZDE2XCIgfV0sXG4gICAgICAgIH0sXG4gICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExvLFxuICAgICAgICBib3hTaGFkb3c6IHsgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjYpXCIsIGJsdXJSYWRpdXM6IDEwLCB5T2Zmc2V0OiAyIH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17T1dOU19QT0lOVEVSfVxuICAgID5cbiAgICAgIDxBbW91bnQgaWNvbj1cInNjaWVuY2VcIiBjb2xvcj17Qy5zY2llbmNlfSB2YWx1ZT17c2lnbmVkKHBheS5zY2llbmNlKX0gLz5cbiAgICAgIDxBbW91bnQgaWNvbj1cImN1bHR1cmVcIiBjb2xvcj17Qy5jdWx0dXJlfSB2YWx1ZT17c2lnbmVkKHBheS5jdWx0dXJlKX0gLz5cbiAgICAgIDxBbW91bnRcbiAgICAgICAgaWNvbj1cImdvbGRcIlxuICAgICAgICBjb2xvcj17Qy5jb2lufVxuICAgICAgICB2YWx1ZT17YCR7TWF0aC5mbG9vcihnYW1lLmdvbGQpfSAoJHtzaWduZWQobmV0KX0pYH1cbiAgICAgIC8+XG4gICAgICA8QW1vdW50XG4gICAgICAgIGljb249XCJmYWl0aFwiXG4gICAgICAgIGNvbG9yPXtDLmZhaXRofVxuICAgICAgICB2YWx1ZT17YCR7TWF0aC5mbG9vcihnYW1lLmZhaXRoKX0gKCR7c2lnbmVkKHBheS5mYWl0aCl9KWB9XG4gICAgICAvPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEgfX0gLz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2FwcyxcbiAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICBjb2xvcjogQy5nb2xkSGksXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtgVFVSTiAke2dhbWUudHVybn1gfVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEzLCBjb2xvcjogQy50ZXh0IH19Pnt5ZWFyKGdhbWUudHVybil9PC90ZXh0PlxuICAgICAgPENsb2NrIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBDbG9jaygpIHtcbiAgY29uc3QgW25vdywgc2V0Tm93XSA9IHVzZVN0YXRlKCgpID0+IG5ldyBEYXRlKCkpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCkgPT4gc2V0Tm93KG5ldyBEYXRlKCkpLCAxNV8wMDApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGlkKTtcbiAgfSwgW10pO1xuICBjb25zdCBoaCA9IG5vdy5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBtbSA9IG5vdy5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gIHJldHVybiA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTMsIGNvbG9yOiBDLm11dGVkIH19PntgJHtoaH06JHttbX1gfTwvdGV4dD47XG59XG5cbi8qKiBUaGUgcm91bmQgYnV0dG9ucyB1bmRlciB0aGUgdG9wLWxlZnQgY29ybmVyOiB0aGUgZW1waXJlJ3Mgc2NyZWVucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMYXVuY2hCYXIoe1xuICBvbk9wZW4sXG4gIHJlc2VhcmNoLFxufToge1xuICBvbk9wZW46IChzOiBTY3JlZW5JZCkgPT4gdm9pZDtcbiAgcmVzZWFyY2g6IGJvb2xlYW47XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAxMixcbiAgICAgICAgdG9wOiA0MCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCwgdmVydGljYWw6IDcgfSxcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoMjcsIDQ1LCA2OCwgMC45NSlcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDEzLCAyNCwgMzgsIDAuOTUpXCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMbyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAyNyxcbiAgICAgICAgYm94U2hhZG93OiB7IGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC41KVwiLCBibHVyUmFkaXVzOiAxMCwgeU9mZnNldDogMyB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e09XTlNfUE9JTlRFUn1cbiAgICA+XG4gICAgICA8Um91bmRCdXR0b25cbiAgICAgICAgaWNvbj1cInNjaWVuY2VcIlxuICAgICAgICBjb2xvcj17Qy5zY2llbmNlfVxuICAgICAgICB0aXA9XCJUZWNobm9sb2d5IHRyZWVcIlxuICAgICAgICBhY3RpdmU9eyFyZXNlYXJjaH1cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25PcGVuKFwidGVjaFwiKX1cbiAgICAgIC8+XG4gICAgICA8Um91bmRCdXR0b25cbiAgICAgICAgaWNvbj1cImNoYXJ0XCJcbiAgICAgICAgdGlwPVwiUmVwb3J0c1wiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbihcInJlcG9ydHNcIil9XG4gICAgICAvPlxuICAgICAgPFJvdW5kQnV0dG9uXG4gICAgICAgIGljb249XCJ0cm9waHlcIlxuICAgICAgICB0aXA9XCJXb3JsZCByYW5raW5nc1wiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbihcInJhbmtpbmdzXCIpfVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgY2l2aWNDb3N0LCBpbmNvbWUsIHBsdXJhbCwgdHVybnNMZWZ0LCB0eXBlIEdhbWUgfSBmcm9tIFwiLi4vZ2FtZVwiO1xuaW1wb3J0IHsgQ0lWSUNTLCB0ZWNoIH0gZnJvbSBcIi4uL3RlY2hzXCI7XG5pbXBvcnQgeyBDLCBPV05TX1BPSU5URVIsIHBhbmVsIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uLCB0eXBlIEljb25OYW1lIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IEhlYWRlciwgTWVkYWxsaW9uIH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuXG5jb25zdCBXSURUSCA9IDMwMDtcblxuLyoqIFRoZSByZXNlYXJjaCBhbmQgY2l2aWMgaW4gcHJvZ3Jlc3MsIHVuZGVyIHRoZSBsYXVuY2ggYmFyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRyYWNrZXJzKHtcbiAgZ2FtZSxcbiAgcGxheWVyLFxuICBvblJlc2VhcmNoLFxufToge1xuICBnYW1lOiBHYW1lO1xuICBwbGF5ZXI6IHN0cmluZztcbiAgb25SZXNlYXJjaDogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgcGF5ID0gaW5jb21lKGdhbWUsIHBsYXllcik7XG4gIGNvbnN0IHJlc2VhcmNoID0gZ2FtZS5yZXNlYXJjaCA/IHRlY2goZ2FtZS5yZXNlYXJjaCkgOiBudWxsO1xuICBjb25zdCBiYW5rZWQgPSByZXNlYXJjaCA/IChnYW1lLnByb2dyZXNzW3Jlc2VhcmNoLmlkXSA/PyAwKSA6IDA7XG4gIGNvbnN0IGNpdmljTmFtZSA9IENJVklDU1tnYW1lLmNpdmljICUgQ0lWSUNTLmxlbmd0aF07XG4gIGNvbnN0IGNpdmljTmVlZCA9IGNpdmljQ29zdChnYW1lLmNpdmljKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDEyLFxuICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgd2lkdGg6IFdJRFRILFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBnYXA6IDgsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtyZXNlYXJjaCA/IChcbiAgICAgICAgPFRyYWNrZXJcbiAgICAgICAgICB0aXRsZT1cIlJlc2VhcmNoXCJcbiAgICAgICAgICBjb2xvcj17Qy5zY2llbmNlfVxuICAgICAgICAgIGljb249e3Jlc2VhcmNoLmljb259XG4gICAgICAgICAgbmFtZT17cmVzZWFyY2gubmFtZX1cbiAgICAgICAgICBwcm9ncmVzcz17YmFua2VkIC8gcmVzZWFyY2guY29zdH1cbiAgICAgICAgICBkZXRhaWw9e3BsdXJhbCh0dXJuc0xlZnQocmVzZWFyY2guY29zdCwgYmFua2VkLCBwYXkuc2NpZW5jZSksIFwidHVyblwiKX1cbiAgICAgICAgICBoaW50PXtgQm9vc3Q6ICR7cmVzZWFyY2guYm9vc3R9YH1cbiAgICAgICAgICBvbkNsaWNrPXtvblJlc2VhcmNofVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPFRyYWNrZXJcbiAgICAgICAgICB0aXRsZT1cIlJlc2VhcmNoXCJcbiAgICAgICAgICBjb2xvcj17Qy5zY2llbmNlfVxuICAgICAgICAgIGljb249XCJzY2llbmNlXCJcbiAgICAgICAgICBuYW1lPVwiQ2hvb3NlIGEgcmVzZWFyY2hcIlxuICAgICAgICAgIHByb2dyZXNzPXswfVxuICAgICAgICAgIGRldGFpbD1cIllvdXIgc2Nob2xhcnMgYXJlIGlkbGVcIlxuICAgICAgICAgIG9uQ2xpY2s9e29uUmVzZWFyY2h9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPFRyYWNrZXJcbiAgICAgICAgdGl0bGU9XCJDaXZpY1wiXG4gICAgICAgIGNvbG9yPXtDLmN1bHR1cmV9XG4gICAgICAgIGljb249XCJjdWx0dXJlXCJcbiAgICAgICAgbmFtZT17Y2l2aWNOYW1lfVxuICAgICAgICBwcm9ncmVzcz17Z2FtZS5jaXZpY1Byb2dyZXNzIC8gY2l2aWNOZWVkfVxuICAgICAgICBkZXRhaWw9e3BsdXJhbChcbiAgICAgICAgICB0dXJuc0xlZnQoY2l2aWNOZWVkLCBnYW1lLmNpdmljUHJvZ3Jlc3MsIHBheS5jdWx0dXJlKSxcbiAgICAgICAgICBcInR1cm5cIixcbiAgICAgICAgKX1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBUcmFja2VyKHtcbiAgdGl0bGUsXG4gIGNvbG9yLFxuICBpY29uLFxuICBuYW1lLFxuICBwcm9ncmVzcyxcbiAgZGV0YWlsLFxuICBoaW50LFxuICBvbkNsaWNrLFxufToge1xuICB0aXRsZTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBpY29uOiBJY29uTmFtZTtcbiAgbmFtZTogc3RyaW5nO1xuICBwcm9ncmVzczogbnVtYmVyO1xuICBkZXRhaWw6IHN0cmluZztcbiAgaGludD86IHN0cmluZztcbiAgb25DbGljaz86ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5wYW5lbCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCwgdG9wOiA3LCBib3R0b206IDkgfSxcbiAgICAgICAgZ2FwOiA2LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e29uQ2xpY2sgPyB7IGJvcmRlckNvbG9yOiBDLmdvbGQgfSA6IE9XTlNfUE9JTlRFUn1cbiAgICA+XG4gICAgICA8SGVhZGVyIGNvbG9yPXtjb2xvcn0+e3RpdGxlfTwvSGVhZGVyPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCB9fT5cbiAgICAgICAgPE1lZGFsbGlvbiBzaXplPXs1Mn0gcHJvZ3Jlc3M9e3Byb2dyZXNzfSByaW5nPXtjb2xvcn0+XG4gICAgICAgICAgPEljb24gbmFtZT17aWNvbn0gc2l6ZT17MjJ9IGNvbG9yPXtjb2xvcn0gLz5cbiAgICAgICAgPC9NZWRhbGxpb24+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIiwgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yIH19PntkZXRhaWx9PC90ZXh0PlxuICAgICAgICAgIHtoaW50ICYmIChcbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IHdpZHRoOiBXSURUSCAtIDkwLCBmb250U2l6ZTogMTEsIGNvbG9yOiBDLm11dGVkIH19PlxuICAgICAgICAgICAgICB7aGludH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApfVxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgQ2l2SW5mbywgV29ybGRJbmZvIH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB7IHJuZywgdG90YWxzLCB0eXBlIEdhbWUgfSBmcm9tIFwiLi4vZ2FtZVwiO1xuaW1wb3J0IHsgVEVDSFMgfSBmcm9tIFwiLi4vdGVjaHNcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBjYXBzIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uLCB0eXBlIEljb25OYW1lIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IEJhciwgQ3Jlc3QsIE1lZGFsbGlvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuZXhwb3J0IGNvbnN0IFJBTktJTkdfVEFCUyA9IFtcbiAgXCJPdmVyYWxsXCIsXG4gIFwiU2NpZW5jZVwiLFxuICBcIkN1bHR1cmVcIixcbiAgXCJEb21pbmF0aW9uXCIsXG4gIFwiUmVsaWdpb25cIixcbiAgXCJEaXBsb21hdGljXCIsXG5dO1xuXG50eXBlIFN0YW5kaW5nID0geyBjaXY6IENpdkluZm87IHByb2dyZXNzOiBudW1iZXI7IG5vdGU6IHN0cmluZyB9O1xuXG5jb25zdCBWSUNUT1JJRVM6IHtcbiAgdGFiOiBzdHJpbmc7XG4gIGljb246IEljb25OYW1lO1xuICBjb2xvcjogc3RyaW5nO1xuICBnb2FsOiBzdHJpbmc7XG59W10gPSBbXG4gIHtcbiAgICB0YWI6IFwiU2NpZW5jZVwiLFxuICAgIGljb246IFwic2NpZW5jZVwiLFxuICAgIGNvbG9yOiBDLnNjaWVuY2UsXG4gICAgZ29hbDogXCJMZWFkIHRoZSB3b3JsZCBpbiBsZWFybmluZyBhbmQgbGF1bmNoIHRoZSBmaXJzdCBjb2xvbnkgc2hpcC5cIixcbiAgfSxcbiAge1xuICAgIHRhYjogXCJDdWx0dXJlXCIsXG4gICAgaWNvbjogXCJjdWx0dXJlXCIsXG4gICAgY29sb3I6IEMuY3VsdHVyZSxcbiAgICBnb2FsOiBcIkRyYXcgbW9yZSB2aXNpdGluZyB0b3VyaXN0cyB0aGFuIGFueSByaXZhbCBoYXMgYXQgaG9tZS5cIixcbiAgfSxcbiAge1xuICAgIHRhYjogXCJEb21pbmF0aW9uXCIsXG4gICAgaWNvbjogXCJzdHJlbmd0aFwiLFxuICAgIGNvbG9yOiBDLmJhZCxcbiAgICBnb2FsOiBcIkhvbGQgdGhlIG9yaWdpbmFsIGNhcGl0YWwgb2YgZXZlcnkgb3RoZXIgY2l2aWxpemF0aW9uLlwiLFxuICB9LFxuICB7XG4gICAgdGFiOiBcIlJlbGlnaW9uXCIsXG4gICAgaWNvbjogXCJmYWl0aFwiLFxuICAgIGNvbG9yOiBDLmZhaXRoLFxuICAgIGdvYWw6IFwiU2VlIHlvdXIgcmVsaWdpb24gZm9sbG93ZWQgYnkgbW9zdCBjaXRpZXMgb2YgZXZlcnkgY2l2aWxpemF0aW9uLlwiLFxuICB9LFxuICB7XG4gICAgdGFiOiBcIkRpcGxvbWF0aWNcIixcbiAgICBpY29uOiBcInRyb3BoeVwiLFxuICAgIGNvbG9yOiBDLmNvaW4sXG4gICAgZ29hbDogXCJFYXJuIDIwIGRpcGxvbWF0aWMgdmljdG9yeSBwb2ludHMgaW4gdGhlIHdvcmxkIGNvbmdyZXNzLlwiLFxuICB9LFxuXTtcblxuLyoqIEhvdyBjbG9zZSBldmVyeSBjaXZpbGl6YXRpb24gaXMgdG8gZWFjaCB3YXkgb2Ygd2lubmluZyDigJQgbnVtYmVyc1xuICogIGRlcml2ZWQgZnJvbSBpdHMgY2l0aWVzIGFuZCBpdHMgaGlzdG9yeS4gKi9cbmZ1bmN0aW9uIHN0YW5kaW5ncyh0YWI6IHN0cmluZywgd29ybGQ6IFdvcmxkSW5mbywgZ2FtZTogR2FtZSk6IFN0YW5kaW5nW10ge1xuICBjb25zdCBzY2kgPSAoYzogQ2l2SW5mbykgPT4gZ2FtZS5oaXN0b3J5W2MuaWRdLnNjaWVuY2UuYXQoLTEpITtcbiAgY29uc3QgbWluZSA9IHdvcmxkLmNpdnNbMF07XG4gIHJldHVybiB3b3JsZC5jaXZzLm1hcCgoY2l2LCBpKSA9PiB7XG4gICAgY29uc3QgciA9IHJuZyhpICogOTcgKyAxMyk7XG4gICAgY29uc3Qgc3VtID0gdG90YWxzKHdvcmxkLmNpdGllcywgY2l2LmlkKTtcbiAgICBzd2l0Y2ggKHRhYikge1xuICAgICAgY2FzZSBcIlNjaWVuY2VcIjoge1xuICAgICAgICBjb25zdCBrbm93biA9IGNpdi5wbGF5ZXJcbiAgICAgICAgICA/IGdhbWUucmVzZWFyY2hlZC5sZW5ndGhcbiAgICAgICAgICA6IE1hdGgubWluKFxuICAgICAgICAgICAgICBURUNIUy5sZW5ndGggLSAxLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKFxuICAgICAgICAgICAgICAgIGdhbWUucmVzZWFyY2hlZC5sZW5ndGggKiAoc2NpKGNpdikgLyBzY2kobWluZSkpICoqIDAuNSxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2l2LFxuICAgICAgICAgIHByb2dyZXNzOiBrbm93biAvIFRFQ0hTLmxlbmd0aCxcbiAgICAgICAgICBub3RlOiBgJHtrbm93bn0gb2YgJHtURUNIUy5sZW5ndGh9IHRlY2hub2xvZ2llc2AsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwiQ3VsdHVyZVwiOiB7XG4gICAgICAgIGNvbnN0IHZpc2l0aW5nID0gTWF0aC5yb3VuZChzdW0uY3VsdHVyZSAqIDEuNCArIHIoKSAqIDYpO1xuICAgICAgICBjb25zdCBuZWVkID0gTWF0aC5yb3VuZCgzMCArIHIoKSAqIDI1KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaXYsXG4gICAgICAgICAgcHJvZ3Jlc3M6IHZpc2l0aW5nIC8gbmVlZCxcbiAgICAgICAgICBub3RlOiBgJHt2aXNpdGluZ30gb2YgJHtuZWVkfSB0b3VyaXN0cyBuZWVkZWRgLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcIkRvbWluYXRpb25cIjpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaXYsXG4gICAgICAgICAgcHJvZ3Jlc3M6IDEgLyB3b3JsZC5jaXZzLmxlbmd0aCxcbiAgICAgICAgICBub3RlOiBcIkhvbGRzIGl0cyBvd24gY2FwaXRhbFwiLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBcIlJlbGlnaW9uXCI6IHtcbiAgICAgICAgY29uc3QgY2l0aWVzID0gMSArIE1hdGguZmxvb3Ioc3VtLmZhaXRoIC8gMyArIHIoKSAqIDMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNpdixcbiAgICAgICAgICBwcm9ncmVzczogY2l0aWVzIC8gd29ybGQuY2l0aWVzLmxlbmd0aCxcbiAgICAgICAgICBub3RlOiBgRm9sbG93ZWQgaW4gJHtjaXRpZXN9IG9mICR7d29ybGQuY2l0aWVzLmxlbmd0aH0gY2l0aWVzYCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gMiArIE1hdGguZmxvb3IocigpICogOSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2l2LFxuICAgICAgICAgIHByb2dyZXNzOiBwb2ludHMgLyAyMCxcbiAgICAgICAgICBub3RlOiBgJHtwb2ludHN9IG9mIDIwIHZpY3RvcnkgcG9pbnRzYCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmFua2luZ3Moe1xuICB0YWIsXG4gIHdvcmxkLFxuICBnYW1lLFxufToge1xuICB0YWI6IHN0cmluZztcbiAgd29ybGQ6IFdvcmxkSW5mbztcbiAgZ2FtZTogR2FtZTtcbn0pIHtcbiAgaWYgKHRhYiAhPT0gXCJPdmVyYWxsXCIpIHtcbiAgICBjb25zdCB2ID0gVklDVE9SSUVTLmZpbmQoKHYpID0+IHYudGFiID09PSB0YWIpITtcbiAgICBjb25zdCByb3dzID0gc3RhbmRpbmdzKHRhYiwgd29ybGQsIGdhbWUpLnNvcnQoXG4gICAgICAoYSwgYikgPT4gYi5wcm9ncmVzcyAtIGEucHJvZ3Jlc3MsXG4gICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogNDAsIHZlcnRpY2FsOiAyMiB9LFxuICAgICAgICAgIGdhcDogMTQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTQgfX0+XG4gICAgICAgICAgPE1lZGFsbGlvbiBzaXplPXs1OH0gcmluZz17di5jb2xvcn0+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXt2Lmljb259IHNpemU9ezI2fSBjb2xvcj17di5jb2xvcn0gLz5cbiAgICAgICAgICA8L01lZGFsbGlvbj5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMgfX0+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2Ake3RhYi50b1VwcGVyQ2FzZSgpfSBWSUNUT1JZYH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgY29sb3I6IEMubXV0ZWQgfX0+e3YuZ29hbH08L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIHtyb3dzLm1hcCgocywgaSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e3MuY2l2LmlkfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgZ2FwOiAxNixcbiAgICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxNCwgdmVydGljYWw6IDEwIH0sXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzLmNpdi5wbGF5ZXJcbiAgICAgICAgICAgICAgICA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjA4KVwiXG4gICAgICAgICAgICAgICAgOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMjUpXCIsXG4gICAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IHMuY2l2LnBsYXllclxuICAgICAgICAgICAgICAgID8gQy5nb2xkTGluZVxuICAgICAgICAgICAgICAgIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDE4LFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGQsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtgJHtpICsgMX1gfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPENyZXN0IGNpdj17cy5jaXZ9IHNpemU9ezQyfSAvPlxuICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDIwMCwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAyIH19PlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxNCwgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLCBjb2xvcjogQy50ZXh0IH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7cy5jaXYucGxheWVyID8gYCR7cy5jaXYubmFtZX0gKHlvdSlgIDogcy5jaXYubmFtZX1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkIH19PlxuICAgICAgICAgICAgICAgIHtzLmNpdi5sZWFkZXJ9XG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDxCYXJcbiAgICAgICAgICAgICAgdmFsdWU9e3MucHJvZ3Jlc3N9XG4gICAgICAgICAgICAgIHdpZHRoPXszODB9XG4gICAgICAgICAgICAgIGhlaWdodD17MTJ9XG4gICAgICAgICAgICAgIGNvbG9yPXtzLmNpdi5jb2xvcn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnRleHQgfX0+e3Mubm90ZX08L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICApO1xuICB9XG5cbiAgY29uc3QgYWxsID0gVklDVE9SSUVTLm1hcCgodikgPT4gKHtcbiAgICB2LFxuICAgIHJvd3M6IHN0YW5kaW5ncyh2LnRhYiwgd29ybGQsIGdhbWUpLFxuICB9KSk7XG4gIGNvbnN0IGNpdnMgPSBbLi4ud29ybGQuY2l2c10uc29ydChcbiAgICAoYSwgYikgPT5cbiAgICAgIGdhbWUuaGlzdG9yeVtiLmlkXS5zY29yZS5hdCgtMSkhIC0gZ2FtZS5oaXN0b3J5W2EuaWRdLnNjb3JlLmF0KC0xKSEsXG4gICk7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogNDAsIHZlcnRpY2FsOiAyMiB9LFxuICAgICAgICBnYXA6IDEwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE0IH0sIGdhcDogMTYgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uY2Fwcywgd2lkdGg6IDMwMCwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgICAgQ0lWSUxJWkFUSU9OXG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uY2Fwcywgd2lkdGg6IDkwLCBjb2xvcjogQy5tdXRlZCB9fT5TQ09SRTwvdGV4dD5cbiAgICAgICAge1ZJQ1RPUklFUy5tYXAoKHYpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXt2LnRhYn1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiA5MixcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgZ2FwOiA1LFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXt2Lmljb259IHNpemU9ezEzfSBjb2xvcj17di5jb2xvcn0gLz5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmNhcHMsIGZvbnRTaXplOiAxMCwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgICAgICAgIHt2LnRhYi50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgICB7Y2l2cy5tYXAoKGNpdiwgaSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17Y2l2LmlkfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGdhcDogMTYsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE0LCB2ZXJ0aWNhbDogMTAgfSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY2l2LnBsYXllclxuICAgICAgICAgICAgICA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjA4KVwiXG4gICAgICAgICAgICAgIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDI1KVwiLFxuICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGNpdi5wbGF5ZXIgPyBDLmdvbGRMaW5lIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiAyMixcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxOCxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5nb2xkLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7YCR7aSArIDF9YH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDxDcmVzdCBjaXY9e2Npdn0gc2l6ZT17NDZ9IC8+XG4gICAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIgfX0+XG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDE1LCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtjaXYucGxheWVyID8gYCR7Y2l2Lm5hbWV9ICh5b3UpYCA6IGNpdi5uYW1lfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMubXV0ZWQgfX0+e2Npdi5sZWFkZXJ9PC90ZXh0PlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IDkwLFxuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgICAgZm9udFNpemU6IDIyLFxuICAgICAgICAgICAgICBjb2xvcjogQy5nb2xkSGksXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtgJHtNYXRoLnJvdW5kKGdhbWUuaGlzdG9yeVtjaXYuaWRdLnNjb3JlLmF0KC0xKSEpfWB9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIHthbGwubWFwKCh7IHYsIHJvd3MgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcyA9IHJvd3MuZmluZCgocikgPT4gci5jaXYuaWQgPT09IGNpdi5pZCkhO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBrZXk9e3YudGFifVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiA5MiwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA0IH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8QmFyIHZhbHVlPXtzLnByb2dyZXNzfSB3aWR0aD17ODB9IGhlaWdodD17Nn0gY29sb3I9e3YuY29sb3J9IC8+XG4gICAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMubXV0ZWQgfX1cbiAgICAgICAgICAgICAgICA+e2Ake01hdGgucm91bmQoTWF0aC5taW4oMSwgcy5wcm9ncmVzcykgKiAxMDApfSVgfTwvdGV4dD5cbiAgICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IENpdkluZm8sIFdvcmxkSW5mbyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBNRVRSSUNTLCBsZWRnZXIsIHRvdGFscywgdHlwZSBHYW1lLCB0eXBlIE1ldHJpYyB9IGZyb20gXCIuLi9nYW1lXCI7XG5pbXBvcnQgeyBDLCBZSUVMRFMsIGNhcHMsIGZtdCwgc2lnbmVkLCB0eXBlIFlpZWxkS2V5IH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IEhlYWRlciB9IGZyb20gXCIuLi91aS9raXRcIjtcbmltcG9ydCB7IERvbnV0LCBMaW5lQ2hhcnQsIFN0YWNrZWRBcmVhLCBjb21wYWN0LCB0eXBlIFNlcmllcyB9IGZyb20gXCIuL2NoYXJ0c1wiO1xuXG5leHBvcnQgY29uc3QgUkVQT1JUX1RBQlMgPSBbXCJHcmFwaHNcIiwgXCJDaXRpZXNcIiwgXCJEZW1vZ3JhcGhpY3NcIl07XG5cbi8qKiBUaGUgZW1waXJlJ3MgcmVwb3J0czogaGlzdG9yeSBncmFwaHMgZm9yIGV2ZXJ5IGNpdmlsaXphdGlvbiwgdGhlXG4gKiAgcGxheWVyJ3MgY2l0aWVzIGJ5IHlpZWxkLCBhbmQgaG93IHRoZSB3b3JsZCBjb21wYXJlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXBvcnRzKHtcbiAgdGFiLFxuICB3b3JsZCxcbiAgZ2FtZSxcbiAgd2lkdGgsXG4gIGhlaWdodCxcbn06IHtcbiAgdGFiOiBzdHJpbmc7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufSkge1xuICBpZiAodGFiID09PSBcIkNpdGllc1wiKVxuICAgIHJldHVybiA8Q2l0aWVzIHdvcmxkPXt3b3JsZH0gZ2FtZT17Z2FtZX0gd2lkdGg9e3dpZHRofSAvPjtcbiAgaWYgKHRhYiA9PT0gXCJEZW1vZ3JhcGhpY3NcIikgcmV0dXJuIDxEZW1vZ3JhcGhpY3Mgd29ybGQ9e3dvcmxkfSBnYW1lPXtnYW1lfSAvPjtcbiAgcmV0dXJuIDxHcmFwaHMgd29ybGQ9e3dvcmxkfSBnYW1lPXtnYW1lfSB3aWR0aD17d2lkdGh9IGhlaWdodD17aGVpZ2h0fSAvPjtcbn1cblxuZnVuY3Rpb24gR3JhcGhzKHtcbiAgd29ybGQsXG4gIGdhbWUsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufSkge1xuICBjb25zdCBbbWV0cmljLCBzZXRNZXRyaWNdID0gdXNlU3RhdGU8TWV0cmljPihcInNjb3JlXCIpO1xuICBjb25zdCBbaGlkZGVuLCBzZXRIaWRkZW5dID0gdXNlU3RhdGU8U2V0PHN0cmluZz4+KG5ldyBTZXQoKSk7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF07XG4gIGNvbnN0IGRlZiA9IE1FVFJJQ1MuZmluZCgobSkgPT4gbS5rZXkgPT09IG1ldHJpYykhO1xuICBjb25zdCBzZXJpZXM6IFNlcmllc1tdID0gd29ybGQuY2l2c1xuICAgIC5maWx0ZXIoKGMpID0+ICFoaWRkZW4uaGFzKGMuaWQpKVxuICAgIC5tYXAoKGMpID0+ICh7XG4gICAgICBpZDogYy5pZCxcbiAgICAgIG5hbWU6IGMubmFtZSxcbiAgICAgIGNvbG9yOiBjLmNvbG9yLFxuICAgICAgdmFsdWVzOiBnYW1lLmhpc3RvcnlbYy5pZF1bbWV0cmljXSxcbiAgICAgIGJvbGQ6IGMucGxheWVyLFxuICAgIH0pKTtcbiAgY29uc3QgY2hhcnRXID0gd2lkdGggLSAyMjA7XG4gIGNvbnN0IG93biA9IGdhbWUuaGlzdG9yeVtwbGF5ZXIuaWRdO1xuICBjb25zdCB5aWVsZHM6IFNlcmllc1tdID0gU1RBQ0subWFwKCh7IGtleSwgY29sb3IgfSkgPT4gKHtcbiAgICBpZDoga2V5LFxuICAgIG5hbWU6IE1FVFJJQ1MuZmluZCgobSkgPT4gbS5rZXkgPT09IGtleSkhLm5hbWUsXG4gICAgY29sb3IsXG4gICAgdmFsdWVzOiBvd25ba2V5XSxcbiAgfSkpO1xuICBjb25zdCB0b2dnbGUgPSAoaWQ6IHN0cmluZykgPT5cbiAgICBzZXRIaWRkZW4oKGgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGgpO1xuICAgICAgaWYgKCFuZXh0LmRlbGV0ZShpZCkpIG5leHQuYWRkKGlkKTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGZsZXhHcm93OiAxIH19PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMTkwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiA0LFxuICAgICAgICAgIHBhZGRpbmc6IDE0LFxuICAgICAgICAgIGJvcmRlcjogeyByaWdodDogMSB9LFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMaW5lLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5jYXBzLCBjb2xvcjogQy5tdXRlZCwgbWFyZ2luOiB7IGJvdHRvbTogNiB9IH19PlxuICAgICAgICAgIE1FQVNVUkVcbiAgICAgICAgPC90ZXh0PlxuICAgICAgICB7TUVUUklDUy5tYXAoKG0pID0+IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBrZXk9e20ua2V5fVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TWV0cmljKG0ua2V5KX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAsIHZlcnRpY2FsOiA4IH0sXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOlxuICAgICAgICAgICAgICAgIG0ua2V5ID09PSBtZXRyaWNcbiAgICAgICAgICAgICAgICAgID8gXCJyZ2JhKDIxNywgMTgzLCAxMDgsIDAuMTQpXCJcbiAgICAgICAgICAgICAgICAgIDogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG4gICAgICAgICAgICAgIGJvcmRlcjogeyBsZWZ0OiAyIH0sXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBtLmtleSA9PT0gbWV0cmljID8gQy5nb2xkIDogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjEpXCIgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXttLmljb259IHNpemU9ezE2fSBjb2xvcj17bS5jb2xvcn0gLz5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBtLmtleSA9PT0gbWV0cmljID8gQy5nb2xkSGkgOiBDLnRleHQsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHttLm5hbWV9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTYsIHZlcnRpY2FsOiAxMiB9LFxuICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsIGdhcDogMTAgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDE3LCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgICAgICB7ZGVmLm5hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkLCBtYXJnaW46IHsgYm90dG9tOiAyIH0gfX1cbiAgICAgICAgICA+e2Ake2RlZi51bml0fSwgZXZlcnkgY2l2aWxpemF0aW9uLCBieSB0dXJuYH08L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiA2IH19PlxuICAgICAgICAgIHt3b3JsZC5jaXZzLm1hcCgoYykgPT4gKFxuICAgICAgICAgICAgPFRvZ2dsZVxuICAgICAgICAgICAgICBrZXk9e2MuaWR9XG4gICAgICAgICAgICAgIGNpdj17Y31cbiAgICAgICAgICAgICAgb249eyFoaWRkZW4uaGFzKGMuaWQpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0b2dnbGUoYy5pZCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxMaW5lQ2hhcnRcbiAgICAgICAgICBzZXJpZXM9e3Nlcmllc31cbiAgICAgICAgICB3aWR0aD17Y2hhcnRXfVxuICAgICAgICAgIGhlaWdodD17TWF0aC5tYXgoMjAwLCBoZWlnaHQgLSA0MzApfVxuICAgICAgICAgIGZpcnN0PXsxfVxuICAgICAgICAvPlxuICAgICAgICA8SGVhZGVyPntgJHtwbGF5ZXIubmFtZX0gwrcgeWllbGRzIHBlciB0dXJuYH08L0hlYWRlcj5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAxNCB9fT5cbiAgICAgICAgICB7Wy4uLnlpZWxkc10ucmV2ZXJzZSgpLm1hcCgocykgPT4gKFxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAga2V5PXtzLmlkfVxuICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDUgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMixcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogcy5jb2xvcixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkIH19PntzLm5hbWV9PC90ZXh0PlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxTdGFja2VkQXJlYSBzZXJpZXM9e3lpZWxkc30gd2lkdGg9e2NoYXJ0V30gaGVpZ2h0PXsxNzB9IGZpcnN0PXsxfSAvPlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgbGVnZW5kIGVudHJ5IHRoYXQgc2hvd3Mgb3IgaGlkZXMgaXRzIGNpdmlsaXphdGlvbidzIGxpbmUuICovXG5mdW5jdGlvbiBUb2dnbGUoe1xuICBjaXYsXG4gIG9uLFxuICBvbkNsaWNrLFxufToge1xuICBjaXY6IENpdkluZm87XG4gIG9uOiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDYsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAsIHZlcnRpY2FsOiA1IH0sXG4gICAgICAgIGJvcmRlclJhZGl1czogMTIsXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IG9uXG4gICAgICAgICAgPyBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xOClcIlxuICAgICAgICAgIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDYpXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogb24gPyBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSlcIiA6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3sgYm9yZGVyQ29sb3I6IEMuZ29sZCB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICAgIGhlaWdodDogY2l2LnBsYXllciA/IDMgOiAyLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb24gPyBjaXYuY29sb3IgOiBDLmZhaW50LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IG9uID8gQy50ZXh0IDogQy5mYWludCB9fT5cbiAgICAgICAge2Npdi5wbGF5ZXIgPyBgJHtjaXYubmFtZX0gKHlvdSlgIDogY2l2Lm5hbWV9XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBUaGUgc3RhY2tlZCB5aWVsZHMsIGJvdHRvbSB0byB0b3A6IHRoZSBnYW1lJ3Mgb3duIHlpZWxkIGNvbG9ycyBmYWlsIGFzXG4gKiAgbmVpZ2hib3JzIChzY2llbmNlIGFuZCBjdWx0dXJlIG1hdGNoIHVuZGVyIGRldXRlcmFub3BpYSksIHNvIHRoZSBjaGFydFxuICogIHVzZXMgc3RlcHMgY2hlY2tlZCBmb3IgYWRqYWNlbnQgc2VwYXJhdGlvbiwgaW4gdGhpcyBvcmRlci4gKi9cbmNvbnN0IFNUQUNLID0gW1xuICB7IGtleTogXCJjdWx0dXJlXCIsIGNvbG9yOiBcIiNhMDVjYzhcIiB9LFxuICB7IGtleTogXCJnb2xkXCIsIGNvbG9yOiBcIiNjMDhhMWNcIiB9LFxuICB7IGtleTogXCJzY2llbmNlXCIsIGNvbG9yOiBcIiMyZjhmYzhcIiB9LFxuICB7IGtleTogXCJmYWl0aFwiLCBjb2xvcjogXCIjZDNjZGYyXCIgfSxcbl0gYXMgY29uc3Q7XG5cbmNvbnN0IENPTFMgPSBbXG4gIHsga2V5OiBcImNpdHlcIiwgbGFiZWw6IFwiQ2l0eVwiLCB3aWR0aDogMTcwIH0sXG4gIHsga2V5OiBcInBvcHVsYXRpb25cIiwgbGFiZWw6IFwiUG9wLlwiLCB3aWR0aDogNjQgfSxcbiAgLi4uWUlFTERTLm1hcCgoeSkgPT4gKHtcbiAgICBrZXk6IHkua2V5LFxuICAgIGxhYmVsOiB5LmtleSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcIlByb2QuXCIgOiB5Lm5hbWUsXG4gICAgd2lkdGg6IDEwMCxcbiAgfSkpLFxuXTtcbmNvbnN0IFRBQkxFX1cgPSBDT0xTLnJlZHVjZSgobiwgYykgPT4gbiArIGMud2lkdGgsIDApO1xuXG5mdW5jdGlvbiBDaXRpZXMoe1xuICB3b3JsZCxcbiAgZ2FtZSxcbiAgd2lkdGgsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHdpZHRoOiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF07XG4gIGNvbnN0IGNpdGllcyA9IHdvcmxkLmNpdGllcy5maWx0ZXIoKGMpID0+IGMuY2l2ID09PSBwbGF5ZXIuaWQpO1xuICBjb25zdCBzdW0gPSB0b3RhbHMod29ybGQuY2l0aWVzLCBwbGF5ZXIuaWQpO1xuICBjb25zdCBtb25leSA9IGxlZGdlcih3b3JsZCwgZ2FtZSk7XG4gIC8vIENhdGVnb3JpY2FsIHN0ZXBzIHZhbGlkYXRlZCBmb3IgbmVpZ2hib3JzIGFyb3VuZCB0aGUgcmluZyAodGhlIGxhc3RcbiAgLy8gc2xpY2UgdG91Y2hlcyB0aGUgZmlyc3QpLCBvbiB0aGlzIHBhbmVsJ3MgbmF2eS5cbiAgY29uc3Qgc2xvdHMgPSBbXCIjMzk4N2U1XCIsIFwiI2Q5NTkyNlwiLCBcIiMxOTllNzBcIiwgXCIjYzk4NTAwXCIsIFwiI2Q1NTE4MVwiXTtcbiAgY29uc3Qgc291cmNlcyA9IG1vbmV5LnNvdXJjZXMubWFwKChzLCBpKSA9PiAoe1xuICAgIC4uLnMsXG4gICAgY29sb3I6IHNsb3RzW2kgJSBzbG90cy5sZW5ndGhdLFxuICB9KSk7XG4gIGNvbnN0IGZvb2QgPSAoeTogeyBmb29kOiBudW1iZXIgfSwgcG9wOiBudW1iZXIpID0+IHkuZm9vZCAtIHBvcCAqIDI7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZmxleEdyb3c6IDEsIHBhZGRpbmc6IDE4LCBnYXA6IDIyIH19PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgd2lkdGg6IHdpZHRoIC0gMzgwLCBnYXA6IDYgfX0+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIHdpZHRoOiBUQUJMRV9XIH19PlxuICAgICAgICAgIDxSb3cgaGVhZGVyIGNlbGxzPXtDT0xTLm1hcCgoYykgPT4gYy5sYWJlbCl9IC8+XG4gICAgICAgICAge2NpdGllcy5tYXAoKGMpID0+IChcbiAgICAgICAgICAgIDxSb3dcbiAgICAgICAgICAgICAga2V5PXtjLmlkfVxuICAgICAgICAgICAgICBzdGFyPXtjLmNhcGl0YWx9XG4gICAgICAgICAgICAgIGNlbGxzPXtbXG4gICAgICAgICAgICAgICAgYy5uYW1lLFxuICAgICAgICAgICAgICAgIGAke2MucG9wdWxhdGlvbn1gLFxuICAgICAgICAgICAgICAgIC4uLllJRUxEUy5tYXAoKHkpID0+XG4gICAgICAgICAgICAgICAgICBmbXQoXG4gICAgICAgICAgICAgICAgICAgIHkua2V5ID09PSBcImZvb2RcIlxuICAgICAgICAgICAgICAgICAgICAgID8gZm9vZChjLnlpZWxkcywgYy5wb3B1bGF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgIDogYy55aWVsZHNbeS5rZXldLFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8Um93XG4gICAgICAgICAgICB0b3RhbFxuICAgICAgICAgICAgY2VsbHM9e1tcbiAgICAgICAgICAgICAgXCJFbXBpcmVcIixcbiAgICAgICAgICAgICAgYCR7c3VtLnBvcHVsYXRpb259YCxcbiAgICAgICAgICAgICAgLi4uWUlFTERTLm1hcCgoeSkgPT5cbiAgICAgICAgICAgICAgICBmbXQoeS5rZXkgPT09IFwiZm9vZFwiID8gZm9vZChzdW0sIHN1bS5wb3B1bGF0aW9uKSA6IHN1bVt5LmtleV0pLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogVEFCTEVfVyxcbiAgICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgICBjb2xvcjogQy5mYWludCxcbiAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogOCB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBGb29kIGlzIGFmdGVyIHdoYXQgdGhlIGNpdGl6ZW5zIGVhdCwgdHdvIGVhY2guIEV2ZXJ5IHlpZWxkIGNvbWVzXG4gICAgICAgICAgICBmcm9tIHRoZSB0aWxlcyBhIGNpdHkgd29ya3Mgb24gdGhlIG1hcC5cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgbWFyZ2luOiB7IHRvcDogMTQgfSB9fT5cbiAgICAgICAgICA8SGVhZGVyPldoZXJlIGVhY2ggeWllbGQgY29tZXMgZnJvbTwvSGVhZGVyPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBmbGV4V3JhcDogXCJ3cmFwXCIsXG4gICAgICAgICAgICBjb2x1bW5HYXA6IDI2LFxuICAgICAgICAgICAgcm93R2FwOiAxNCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge1lJRUxEUy5tYXAoKHkpID0+IChcbiAgICAgICAgICAgIDxCcmVha2Rvd25cbiAgICAgICAgICAgICAga2V5PXt5LmtleX1cbiAgICAgICAgICAgICAgaWNvbj17eS5rZXl9XG4gICAgICAgICAgICAgIG5hbWU9e3kubmFtZX1cbiAgICAgICAgICAgICAgY29sb3I9e3kuY29sb3J9XG4gICAgICAgICAgICAgIHJvd3M9e2NpdGllcy5tYXAoKGMpID0+ICh7XG4gICAgICAgICAgICAgICAgbmFtZTogYy5uYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOlxuICAgICAgICAgICAgICAgICAgeS5rZXkgPT09IFwiZm9vZFwiXG4gICAgICAgICAgICAgICAgICAgID8gTWF0aC5tYXgoMCwgZm9vZChjLnlpZWxkcywgYy5wb3B1bGF0aW9uKSlcbiAgICAgICAgICAgICAgICAgICAgOiBjLnlpZWxkc1t5LmtleV0sXG4gICAgICAgICAgICAgIH0pKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICB3aWR0aDogMzIwLFxuICAgICAgICAgIGdhcDogMTIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPEhlYWRlcj5Hb2xkIHBlciB0dXJuPC9IZWFkZXI+XG4gICAgICAgIDxEb251dCBzbGljZXM9e3NvdXJjZXN9IHNpemU9ezE5MH0gbGFiZWw9XCJnb2xkIGluY29tZVwiIC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNCwgd2lkdGg6IDI3MCB9fT5cbiAgICAgICAgICB7c291cmNlcy5tYXAoKHMpID0+IChcbiAgICAgICAgICAgIDxMZWRnZXJcbiAgICAgICAgICAgICAga2V5PXtzLm5hbWV9XG4gICAgICAgICAgICAgIHN3YXRjaD17cy5jb2xvcn1cbiAgICAgICAgICAgICAgbmFtZT17cy5uYW1lfVxuICAgICAgICAgICAgICB2YWx1ZT17c2lnbmVkKHMudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyB2ZXJ0aWNhbDogNCB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHttb25leS51cGtlZXAubWFwKCh1KSA9PiAoXG4gICAgICAgICAgICA8TGVkZ2VyXG4gICAgICAgICAgICAgIGtleT17dS5uYW1lfVxuICAgICAgICAgICAgICBuYW1lPXtgJHt1Lm5hbWV9IHVwa2VlcGB9XG4gICAgICAgICAgICAgIHZhbHVlPXtzaWduZWQoLXUudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyB2ZXJ0aWNhbDogNCB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxMZWRnZXIgbmFtZT1cIk5ldCBwZXIgdHVyblwiIHZhbHVlPXtzaWduZWQobW9uZXkubmV0KX0gc3Ryb25nIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBPbmUgeWllbGQgYWNyb3NzIHRoZSBjaXRpZXM6IGEgc21hbGwgYmFyIGNoYXJ0IGluIHRoYXQgeWllbGQncyBjb2xvclxuICogIChvbmUgc2VyaWVzIHBlciBjaGFydCDigJQgc21hbGwgbXVsdGlwbGVzLCBub3Qgc2l4IGh1ZXMgc2lkZSBieSBzaWRlKS4gKi9cbmZ1bmN0aW9uIEJyZWFrZG93bih7XG4gIGljb24sXG4gIG5hbWUsXG4gIGNvbG9yLFxuICByb3dzLFxufToge1xuICBpY29uOiBZaWVsZEtleTtcbiAgbmFtZTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICByb3dzOiB7IG5hbWU6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9W107XG59KSB7XG4gIGNvbnN0IG1heCA9IE1hdGgubWF4KDEsIC4uLnJvd3MubWFwKChyKSA9PiByLnZhbHVlKSk7XG4gIGNvbnN0IEJBUiA9IDE1MDtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMjY4LCBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDUgfX0+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDYgfX0+XG4gICAgICAgIDxJY29uIG5hbWU9e2ljb259IHNpemU9ezE0fSBjb2xvcj17Y29sb3J9IC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmNhcHMsIGNvbG9yOiBDLm11dGVkIH19PntuYW1lLnRvVXBwZXJDYXNlKCl9PC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAge3Jvd3MubWFwKChyKSA9PiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAga2V5PXtyLm5hbWV9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgZ2FwOiA4LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiA3NCxcbiAgICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgICBjb2xvcjogQy5tdXRlZCxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ci5uYW1lfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KDIsIChyLnZhbHVlIC8gbWF4KSAqIEJBUiksXG4gICAgICAgICAgICAgIGhlaWdodDogMTAsXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogeyB0b3A6IDAsIHJpZ2h0OiAzLCBib3R0b206IDMsIGxlZnQ6IDAgfSxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTEsIGNvbG9yOiBDLnRleHQgfX0+e2ZtdChyLnZhbHVlKX08L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gUm93KHtcbiAgY2VsbHMsXG4gIGhlYWRlcixcbiAgdG90YWwsXG4gIHN0YXIsXG59OiB7XG4gIGNlbGxzOiBzdHJpbmdbXTtcbiAgaGVhZGVyPzogYm9vbGVhbjtcbiAgdG90YWw/OiBib29sZWFuO1xuICBzdGFyPzogYm9vbGVhbjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgaGVpZ2h0OiBoZWFkZXIgPyAzNCA6IDM2LFxuICAgICAgICBib3JkZXI6IHsgYm90dG9tOiAxIH0sXG4gICAgICAgIGJvcmRlckNvbG9yOiB0b3RhbCA/IEMuZ29sZExpbmUgOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNilcIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0b3RhbFxuICAgICAgICAgID8gXCJyZ2JhKDIxNywgMTgzLCAxMDgsIDAuMDgpXCJcbiAgICAgICAgICA6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e1xuICAgICAgICBoZWFkZXIgPyB1bmRlZmluZWQgOiB7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDk1LCAxOTEsIDI0NCwgMC4wOClcIiB9XG4gICAgICB9XG4gICAgPlxuICAgICAge2NlbGxzLm1hcCgoY2VsbCwgaSkgPT4ge1xuICAgICAgICBjb25zdCBjb2wgPSBDT0xTW2ldO1xuICAgICAgICBjb25zdCB5ID0gWUlFTERTLmZpbmQoKHkpID0+IHkua2V5ID09PSBjb2wua2V5KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtjb2wua2V5fVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IGNvbC53aWR0aCxcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IGkgPT09IDAgPyBcImZsZXhTdGFydFwiIDogXCJmbGV4RW5kXCIsXG4gICAgICAgICAgICAgIGdhcDogNSxcbiAgICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiA4IH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtoZWFkZXIgJiYgeSAmJiA8SWNvbiBuYW1lPXt5LmtleX0gc2l6ZT17MTR9IGNvbG9yPXt5LmNvbG9yfSAvPn1cbiAgICAgICAgICAgIHshaGVhZGVyICYmIGkgPT09IDAgJiYgc3RhciAmJiAoXG4gICAgICAgICAgICAgIDxJY29uIG5hbWU9XCJzdGFyXCIgc2l6ZT17MTJ9IGNvbG9yPXtDLmdvbGRIaX0gLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17XG4gICAgICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgICAgICAgICA/IHsgLi4uY2FwcywgZm9udFNpemU6IDEwLjUsIGNvbG9yOiBDLm11dGVkIH1cbiAgICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiB0b3RhbCB8fCBpID09PSAwID8gXCJzZW1pYm9sZFwiIDogXCJub3JtYWxcIixcbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogQy50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtoZWFkZXIgPyBjZWxsLnRvVXBwZXJDYXNlKCkgOiBjZWxsfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gTGVkZ2VyKHtcbiAgc3dhdGNoLFxuICBuYW1lLFxuICB2YWx1ZSxcbiAgc3Ryb25nLFxufToge1xuICBzd2F0Y2g/OiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgc3Ryb25nPzogYm9vbGVhbjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAxMCxcbiAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogMixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHN3YXRjaCA/PyBcInJnYmEoMCwgMCwgMCwgMClcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17eyBmbGV4R3JvdzogMSwgZm9udFNpemU6IDEyLCBjb2xvcjogc3Ryb25nID8gQy50ZXh0IDogQy5tdXRlZCB9fVxuICAgICAgPlxuICAgICAgICB7bmFtZX1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgIGZvbnRXZWlnaHQ6IHN0cm9uZyA/IFwiYm9sZFwiIDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgIGNvbG9yOiBDLnRleHQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHt2YWx1ZX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IERFTU9HUkFQSElDUzoge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVuaXQ6IHN0cmluZztcbiAgb2Y6IChjaXY6IHN0cmluZywgdzogV29ybGRJbmZvLCBnOiBHYW1lKSA9PiBudW1iZXI7XG59W10gPSBbXG4gIHtcbiAgICBuYW1lOiBcIlBvcHVsYXRpb25cIixcbiAgICB1bml0OiBcImNpdGl6ZW5zXCIsXG4gICAgb2Y6IChjLCB3KSA9PiB0b3RhbHMody5jaXRpZXMsIGMpLnBvcHVsYXRpb24gKiAxMDAwLFxuICB9LFxuICB7XG4gICAgbmFtZTogXCJDcm9wIHlpZWxkXCIsXG4gICAgdW5pdDogXCJidXNoZWxzXCIsXG4gICAgb2Y6IChjLCB3KSA9PiB0b3RhbHMody5jaXRpZXMsIGMpLmZvb2QgKiAxMjAsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIk1hbnVmYWN0dXJlZCBnb29kc1wiLFxuICAgIHVuaXQ6IFwidG9uc1wiLFxuICAgIG9mOiAoYywgdykgPT4gdG90YWxzKHcuY2l0aWVzLCBjKS5wcm9kdWN0aW9uICogNDUsXG4gIH0sXG4gIHsgbmFtZTogXCJHTlBcIiwgdW5pdDogXCJnb2xkXCIsIG9mOiAoYywgdykgPT4gdG90YWxzKHcuY2l0aWVzLCBjKS5nb2xkICogMjYwIH0sXG4gIHtcbiAgICBuYW1lOiBcIkxpdGVyYWN5XCIsXG4gICAgdW5pdDogXCIlXCIsXG4gICAgb2Y6IChjLCBfLCBnKSA9PiBNYXRoLm1pbig5NiwgMTggKyBnLmhpc3RvcnlbY10uc2NpZW5jZS5hdCgtMSkhICogMS42KSxcbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiU29sZGllcnNcIixcbiAgICB1bml0OiBcInRyb29wc1wiLFxuICAgIG9mOiAoYywgXywgZykgPT4gZy5oaXN0b3J5W2NdLm1pbGl0YXJ5LmF0KC0xKSEgKiA1MjAsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIkxhbmRcIixcbiAgICB1bml0OiBcInNxLiBtaVwiLFxuICAgIG9mOiAoYywgdykgPT5cbiAgICAgIHcuY2l0aWVzLmZpbHRlcigoeCkgPT4geC5jaXYgPT09IGMpLnJlZHVjZSgobiwgeCkgPT4gbiArIHgudGlsZXMsIDApICpcbiAgICAgIDE5MDAsXG4gIH0sXG5dO1xuXG4vKiogSG93IHRoZSB3b3JsZCBjb21wYXJlcywgbWVhc3VyZSBieSBtZWFzdXJlOiB5b3VyIHZhbHVlIGFuZCByYW5rLCBhbmQgYVxuICogIHN0cmlwIHdpdGggZXZlcnkgY2l2aWxpemF0aW9uIHBsYWNlZCBhbG9uZyBpdC4gKi9cbmZ1bmN0aW9uIERlbW9ncmFwaGljcyh7IHdvcmxkLCBnYW1lIH06IHsgd29ybGQ6IFdvcmxkSW5mbzsgZ2FtZTogR2FtZSB9KSB7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF07XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgcGFkZGluZzogMTggfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgaGVpZ2h0OiAzMCxcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5nb2xkTGluZSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge1tcIk1lYXN1cmVcIiwgXCJZb3VcIiwgXCJSYW5rXCIsIFwiVGhlIHdvcmxkXCIsIFwiQmVzdFwiLCBcIkF2ZXJhZ2VcIl0ubWFwKFxuICAgICAgICAgIChoLCBpKSA9PiAoXG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBrZXk9e2h9XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgLi4uY2FwcyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTAuNSxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5tdXRlZCxcbiAgICAgICAgICAgICAgICB3aWR0aDogWzE5MCwgMTEwLCA3MCwgMzYwLCAxNzAsIDExMF1baV0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtoLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgKSxcbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIHtERU1PR1JBUEhJQ1MubWFwKChkKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IHdvcmxkLmNpdnMubWFwKChjKSA9PiAoe1xuICAgICAgICAgIGNpdjogYyxcbiAgICAgICAgICB2OiBkLm9mKGMuaWQsIHdvcmxkLCBnYW1lKSxcbiAgICAgICAgfSkpO1xuICAgICAgICBjb25zdCBzb3J0ZWQgPSBbLi4udmFsdWVzXS5zb3J0KChhLCBiKSA9PiBiLnYgLSBhLnYpO1xuICAgICAgICBjb25zdCBtaW5lID0gdmFsdWVzWzBdLnY7XG4gICAgICAgIGNvbnN0IHJhbmsgPSBzb3J0ZWQuZmluZEluZGV4KCh4KSA9PiB4LmNpdi5pZCA9PT0gcGxheWVyLmlkKSArIDE7XG4gICAgICAgIGNvbnN0IG1heCA9IHNvcnRlZFswXS52O1xuICAgICAgICBjb25zdCBhdmcgPSB2YWx1ZXMucmVkdWNlKChuLCB4KSA9PiBuICsgeC52LCAwKSAvIHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17ZC5uYW1lfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgaGVpZ2h0OiA1MixcbiAgICAgICAgICAgICAgYm9yZGVyOiB7IGJvdHRvbTogMSB9LFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDYpXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg5NSwgMTkxLCAyNDQsIDAuMDYpXCIgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxOTAsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbiAgICAgICAgICAgICAgICBjb2xvcjogQy50ZXh0LFxuICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2QubmFtZX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAxMTAsIGZvbnRTaXplOiAxMywgY29sb3I6IEMudGV4dCB9fVxuICAgICAgICAgICAgPntgJHtjb21wYWN0KG1pbmUpfSR7ZC51bml0ID09PSBcIiVcIiA/IFwiJVwiIDogXCJcIn1gfTwvdGV4dD5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiA3MCB9fT5cbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6IDI4LFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyOCxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMTQsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6XG4gICAgICAgICAgICAgICAgICAgIHJhbmsgPT09IDFcbiAgICAgICAgICAgICAgICAgICAgICA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjI1KVwiXG4gICAgICAgICAgICAgICAgICAgICAgOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNilcIixcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOlxuICAgICAgICAgICAgICAgICAgICByYW5rID09PSAxID8gQy5nb2xkIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTIpXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcmFuayA9PT0gMSA/IEMuZ29sZEhpIDogQy50ZXh0LFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+e2Ake3Jhbmt9YH08L3RleHQ+XG4gICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiAzNjAsIGhlaWdodDogMjAgfX0+XG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICAgIHJpZ2h0OiAzMCxcbiAgICAgICAgICAgICAgICAgIHRvcDogOSxcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMSxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSlcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7dmFsdWVzLm1hcCgoeyBjaXYsIHYgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpemUgPSBjaXYucGxheWVyID8gMTYgOiAxMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgICAga2V5PXtjaXYuaWR9XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgbGVmdDogKHYgLyBtYXgpICogMzMwIC0gc2l6ZSAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgdG9wOiAxMCAtIHNpemUgLyAyLFxuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IHNpemUgLyAyLFxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogY2l2LnBsYXllciA/IEMuZ29sZEhpIDogXCIjMTAxZDJlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjaXYuY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgekluZGV4OiBjaXYucGxheWVyID8gMSA6IDAsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogMTcwLFxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBnYXA6IDYsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA4LFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzb3J0ZWRbMF0uY2l2LmNvbG9yLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy50ZXh0LCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX1cbiAgICAgICAgICAgICAgPntgJHtzb3J0ZWRbMF0uY2l2Lm5hbWV9IMK3ICR7Y29tcGFjdChtYXgpfWB9PC90ZXh0PlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgd2lkdGg6IDExMCwgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fT5cbiAgICAgICAgICAgICAge2NvbXBhY3QoYXZnKX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICk7XG4gICAgICB9KX1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEMsIGZtdCwgbWl4IH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5cbi8qKiBDaGFydHMgZHJhd24gd2l0aCBgPHN2Zz5gIHNoYXBlczsgYXhpcyBsYWJlbHMsIGNyb3NzaGFpcnMgYW5kIHRvb2x0aXBzXG4gKiAgYXJlIG9yZGluYXJ5IG5vZGVzIG92ZXIgdGhlbSAoc28gaG92ZXJpbmcgbmV2ZXIgcmUtcmFzdGVyaXplcyB0aGVcbiAqICBkcmF3aW5nKS4gKi9cblxuZXhwb3J0IHR5cGUgU2VyaWVzID0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIHZhbHVlczogbnVtYmVyW107XG4gIGJvbGQ/OiBib29sZWFuO1xufTtcblxuY29uc3QgUEFEID0geyBsZWZ0OiA0NiwgcmlnaHQ6IDE0LCB0b3A6IDEwLCBib3R0b206IDI0IH07XG5jb25zdCBHUklEID0gXCIjMjIzMjQ3XCI7XG4vKiogVGhlIHBhbmVsJ3Mgb3duIG5hdnk6IHRoZSAycHggZ2FwcyBiZXR3ZWVuIHRvdWNoaW5nIG1hcmtzLiAqL1xuY29uc3QgU1VSRkFDRSA9IFwiIzEwMWQyZVwiO1xuXG4vKiogUm91bmQgYXhpcyBzdGVwcyBjb3ZlcmluZyBgbWF4YDogMCwgdGhlbiB0aHJlZSBvciBmb3VyIG1vcmUuICovXG5mdW5jdGlvbiB0aWNrcyhtYXg6IG51bWJlcik6IG51bWJlcltdIHtcbiAgY29uc3QgcmF3ID0gTWF0aC5tYXgobWF4LCAxZS02KSAvIDQ7XG4gIGNvbnN0IG1hZyA9IE1hdGgucG93KDEwLCBNYXRoLmZsb29yKE1hdGgubG9nMTAocmF3KSkpO1xuICBjb25zdCBzdGVwID0gWzEsIDIsIDIuNSwgNSwgMTBdLm1hcCgobSkgPT4gbSAqIG1hZykuZmluZCgocykgPT4gcyA+PSByYXcpITtcbiAgY29uc3Qgb3V0ID0gW107XG4gIGZvciAobGV0IHYgPSAwOyB2IDwgbWF4ICsgc3RlcCAqIDAuOTk5OyB2ICs9IHN0ZXApIG91dC5wdXNoKHYpO1xuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgY29tcGFjdCA9ICh2OiBudW1iZXIpID0+XG4gIHYgPj0gMTBfMDAwXG4gICAgPyBgJHtNYXRoLnJvdW5kKHYgLyAxMDAwKX1rYFxuICAgIDogdiA+PSAxMDAwXG4gICAgICA/IGAkeyh2IC8gMTAwMCkudG9GaXhlZCgxKX1rYFxuICAgICAgOiBmbXQodik7XG5cbmZ1bmN0aW9uIEF4ZXMoe1xuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICBncmlkLFxuICB0b3AsXG4gIGZpcnN0LFxuICBjb3VudCxcbn06IHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIGdyaWQ6IG51bWJlcltdO1xuICB0b3A6IG51bWJlcjtcbiAgZmlyc3Q6IG51bWJlcjtcbiAgY291bnQ6IG51bWJlcjtcbn0pIHtcbiAgY29uc3QgcGxvdFcgPSB3aWR0aCAtIFBBRC5sZWZ0IC0gUEFELnJpZ2h0O1xuICBjb25zdCBwbG90SCA9IGhlaWdodCAtIFBBRC50b3AgLSBQQUQuYm90dG9tO1xuICBjb25zdCBldmVyeSA9IGNvdW50ID4gMTAwID8gMjUgOiBjb3VudCA+IDQwID8gMTAgOiA1O1xuICBjb25zdCB0dXJucyA9IFtdO1xuICBmb3IgKGxldCB0ID0gTWF0aC5jZWlsKGZpcnN0IC8gZXZlcnkpICogZXZlcnk7IHQgPCBmaXJzdCArIGNvdW50OyB0ICs9IGV2ZXJ5KVxuICAgIHR1cm5zLnB1c2godCk7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtncmlkLm1hcCgodikgPT4gKFxuICAgICAgICA8dGV4dFxuICAgICAgICAgIGtleT17dn1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgd2lkdGg6IFBBRC5sZWZ0IC0gOCxcbiAgICAgICAgICAgIHRvcDogUEFELnRvcCArIHBsb3RIIC0gKHYgLyB0b3ApICogcGxvdEggLSA3LFxuICAgICAgICAgICAgdGV4dEFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMTAsXG4gICAgICAgICAgICBjb2xvcjogQy5mYWludCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2NvbXBhY3Qodil9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICkpfVxuICAgICAge3R1cm5zLm1hcCgodCkgPT4gKFxuICAgICAgICA8dGV4dFxuICAgICAgICAgIGtleT17dH1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OlxuICAgICAgICAgICAgICBQQUQubGVmdCArICgodCAtIGZpcnN0KSAvIE1hdGgubWF4KDEsIGNvdW50IC0gMSkpICogcGxvdFcgLSAxMCxcbiAgICAgICAgICAgIHRvcDogaGVpZ2h0IC0gUEFELmJvdHRvbSArIDYsXG4gICAgICAgICAgICBmb250U2l6ZTogMTAsXG4gICAgICAgICAgICBjb2xvcjogQy5mYWludCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2Ake3R9YH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgKSl9XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBIYWlybGluZSBncmlkbGluZXMgYXQgdGhlIGF4aXMgc3RlcHMsIGRyYXduIGZpcnN0IGluc2lkZSB0aGUgcGxvdCdzXG4gKiAgYDxzdmc+YCBzbyBmaWxscyBwYWludCBvdmVyIHRoZW0uICovXG5mdW5jdGlvbiBncmlkTGluZXMoZ3JpZDogbnVtYmVyW10sIHRvcDogbnVtYmVyLCBwbG90VzogbnVtYmVyLCBwbG90SDogbnVtYmVyKSB7XG4gIHJldHVybiBncmlkLm1hcCgodikgPT4ge1xuICAgIGNvbnN0IHkgPSBwbG90SCAtICh2IC8gdG9wKSAqIHBsb3RIO1xuICAgIHJldHVybiAoXG4gICAgICA8bGluZVxuICAgICAgICBrZXk9e3Z9XG4gICAgICAgIHgxPXswfVxuICAgICAgICB5MT17eX1cbiAgICAgICAgeDI9e3Bsb3RXfVxuICAgICAgICB5Mj17eX1cbiAgICAgICAgc3Ryb2tlPXtHUklEfVxuICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfSk7XG59XG5cbi8qKiBPbmUgbGluZSBwZXIgc2VyaWVzIG92ZXIgdGhlIHR1cm5zLCB3aXRoIGEgY3Jvc3NoYWlyIHRoYXQgc25hcHMgdG8gdGhlXG4gKiAgbmVhcmVzdCB0dXJuIGFuZCByZWFkcyBldmVyeSBzZXJpZXMgb3V0IGF0IG9uY2UuICovXG5leHBvcnQgZnVuY3Rpb24gTGluZUNoYXJ0KHtcbiAgc2VyaWVzLFxuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICBmaXJzdCxcbn06IHtcbiAgc2VyaWVzOiBTZXJpZXNbXTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIGZpcnN0OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHBsb3RXID0gd2lkdGggLSBQQUQubGVmdCAtIFBBRC5yaWdodDtcbiAgY29uc3QgcGxvdEggPSBoZWlnaHQgLSBQQUQudG9wIC0gUEFELmJvdHRvbTtcbiAgY29uc3QgbiA9IE1hdGgubWF4KDIsIC4uLnNlcmllcy5tYXAoKHMpID0+IHMudmFsdWVzLmxlbmd0aCkpO1xuICBjb25zdCBncmlkID0gdGlja3MoTWF0aC5tYXgoMCwgLi4uc2VyaWVzLmZsYXRNYXAoKHMpID0+IHMudmFsdWVzKSkpO1xuICBjb25zdCB0b3AgPSBncmlkW2dyaWQubGVuZ3RoIC0gMV07XG4gIGNvbnN0IHggPSAoaTogbnVtYmVyKSA9PiAoaSAvIChuIC0gMSkpICogcGxvdFc7XG4gIGNvbnN0IHkgPSAodjogbnVtYmVyKSA9PiBwbG90SCAtICh2IC8gdG9wKSAqIHBsb3RIO1xuICBjb25zdCBsZWFkID0gc2VyaWVzLmZpbmQoKHMpID0+IHMuYm9sZCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGgsIGhlaWdodCB9fSBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIobnVsbCl9PlxuICAgICAgPEF4ZXNcbiAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgZ3JpZD17Z3JpZH1cbiAgICAgICAgdG9wPXt0b3B9XG4gICAgICAgIGZpcnN0PXtmaXJzdH1cbiAgICAgICAgY291bnQ9e259XG4gICAgICAvPlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PXtgMCAwICR7cGxvdFd9ICR7cGxvdEh9YH1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiBQQUQubGVmdCxcbiAgICAgICAgICB0b3A6IFBBRC50b3AsXG4gICAgICAgICAgd2lkdGg6IHBsb3RXLFxuICAgICAgICAgIGhlaWdodDogcGxvdEgsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtsZWFkICYmIChcbiAgICAgICAgICAvLyBUaGUgbGVhZGVyJ3Mgd2FzaCwgcHJlLW1peGVkIG9wYXF1ZTogYmV2eSBjb21wb3NpdGVzIHRoZVxuICAgICAgICAgIC8vIGRyYXdpbmcgaW4gbGluZWFyIGxpZ2h0LCB3aGVyZSBhIHRyYW5zbHVjZW50IGZpbGwgbGFuZHMgZmFyXG4gICAgICAgICAgLy8gYnJpZ2h0ZXIgdGhhbiBvbiB0aGUgd2ViLlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1tcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgcGxvdEgsXG4gICAgICAgICAgICAgIC4uLmxlYWQudmFsdWVzLmZsYXRNYXAoKHYsIGkpID0+IFt4KGkpLCB5KHYpXSksXG4gICAgICAgICAgICAgIHgobGVhZC52YWx1ZXMubGVuZ3RoIC0gMSksXG4gICAgICAgICAgICAgIHBsb3RILFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIGZpbGw9e21peChTVVJGQUNFLCBsZWFkLmNvbG9yLCAwLjEyKX1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICB7Z3JpZExpbmVzKGdyaWQsIHRvcCwgcGxvdFcsIHBsb3RIKX1cbiAgICAgICAge3Nlcmllcy5tYXAoKHMpID0+IChcbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIGtleT17cy5pZH1cbiAgICAgICAgICAgIHBvaW50cz17cy52YWx1ZXMuZmxhdE1hcCgodiwgaSkgPT4gW3goaSksIHkodildKX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17cy5jb2xvcn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXtzLmJvbGQgPyAzIDogMn1cbiAgICAgICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvc3ZnPlxuICAgICAge2hvdmVyICE9PSBudWxsICYmIChcbiAgICAgICAgPFJlYWRvdXRcbiAgICAgICAgICByb3dzPXtzZXJpZXMubWFwKChzKSA9PiAoe1xuICAgICAgICAgICAgcyxcbiAgICAgICAgICAgIHZhbHVlOiBzLnZhbHVlc1tob3Zlcl0sXG4gICAgICAgICAgICB5OiB5KHMudmFsdWVzW2hvdmVyXSksXG4gICAgICAgICAgfSkpfVxuICAgICAgICAgIHR1cm49e2ZpcnN0ICsgaG92ZXJ9XG4gICAgICAgICAgbGVmdD17UEFELmxlZnQgKyB4KGhvdmVyKX1cbiAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgcGxvdEg9e3Bsb3RIfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIDxTdHJpcCBuPXtufSB3aWR0aD17cGxvdFd9IGhlaWdodD17cGxvdEh9IG9uSG92ZXI9e3NldEhvdmVyfSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEludmlzaWJsZSBjb2x1bW5zIG92ZXIgdGhlIHBsb3QsIG9uZSBwZXIgdHVybjogZW50ZXJpbmcgb25lIG1vdmVzIHRoZVxuICogIGNyb3NzaGFpciB0aGVyZS4gKi9cbmZ1bmN0aW9uIFN0cmlwKHtcbiAgbixcbiAgd2lkdGgsXG4gIGhlaWdodCxcbiAgb25Ib3Zlcixcbn06IHtcbiAgbjogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb25Ib3ZlcjogKGk6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3Qgc3RlcCA9IHdpZHRoIC8gKG4gLSAxKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IFBBRC5sZWZ0IC0gc3RlcCAvIDIsXG4gICAgICAgIHRvcDogUEFELnRvcCxcbiAgICAgICAgd2lkdGg6IHdpZHRoICsgc3RlcCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogbiB9LCAoXywgaSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBzdHlsZT17eyBmbGV4R3JvdzogMSwgZmxleEJhc2lzOiAwIH19XG4gICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IG9uSG92ZXIoaSl9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbnR5cGUgUm93ID0geyBzOiBTZXJpZXM7IHZhbHVlOiBudW1iZXI7IHk/OiBudW1iZXIgfTtcblxuLyoqIFRoZSBjcm9zc2hhaXIgYXQgb25lIHR1cm46IGEgZG90IHdoZXJlIGl0IGNyb3NzZXMgZWFjaCBsaW5lLCBhbmQgZXZlcnlcbiAqICBzZXJpZXMnIHZhbHVlIHRoZXJlLCBsYXJnZXN0IGZpcnN0LiAqL1xuZnVuY3Rpb24gUmVhZG91dCh7XG4gIHJvd3MsXG4gIHR1cm4sXG4gIGxlZnQsXG4gIHdpZHRoLFxuICBwbG90SCxcbn06IHtcbiAgcm93czogUm93W107XG4gIHR1cm46IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBwbG90SDogbnVtYmVyO1xufSkge1xuICBjb25zdCBzb3J0ZWQgPSByb3dzXG4gICAgLmZpbHRlcigocikgPT4gci52YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgIC5zb3J0KChhLCBiKSA9PiBiLnZhbHVlIC0gYS52YWx1ZSk7XG4gIGNvbnN0IGZsaXAgPSBsZWZ0ID4gd2lkdGggKiAwLjY4O1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgdG9wOiBQQUQudG9wLFxuICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgIGhlaWdodDogcGxvdEgsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjQ2LCAyMjgsIDE2OCwgMC41NSlcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICB7c29ydGVkXG4gICAgICAgIC5maWx0ZXIoKHIpID0+IHIueSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAubWFwKCh7IHMsIHkgfSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e3MuaWR9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbGVmdDogbGVmdCAtIDUsXG4gICAgICAgICAgICAgIHRvcDogUEFELnRvcCArIHkhIC0gNSxcbiAgICAgICAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDUsXG4gICAgICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFNVUkZBQ0UsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogcy5jb2xvcixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIC4uLihmbGlwID8geyByaWdodDogd2lkdGggLSBsZWZ0ICsgMTIgfSA6IHsgbGVmdDogbGVmdCArIDEyIH0pLFxuICAgICAgICAgIHRvcDogUEFELnRvcCArIDQsXG4gICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCwgdmVydGljYWw6IDggfSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGdhcDogNCxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDMsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMbyxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg2LCAxMywgMjEsIDAuOTQpXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMubXV0ZWQgfX0+e2BUdXJuICR7dHVybn1gfTwvdGV4dD5cbiAgICAgICAge3NvcnRlZC5tYXAoKHsgcywgdmFsdWUgfSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e3MuaWR9XG4gICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDYgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMTAsIGhlaWdodDogMiwgYmFja2dyb3VuZENvbG9yOiBzLmNvbG9yIH19IC8+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiA0NCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgY29sb3I6IEMudGV4dCxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2NvbXBhY3QodmFsdWUpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogQy5tdXRlZCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICAgICAgICB7cy5uYW1lfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBTZXJpZXMgc3RhY2tlZCBvbiBlYWNoIG90aGVyOiB0aGUgd2hvbGUgaXMgdGhlIHRvcCBsaW5lLCBlYWNoIGJhbmQgb25lXG4gKiAgcGFydCwgc3BsaXQgYnkgMnB4IGdhcHMgb2YgdGhlIHBhbmVsJ3MgY29sb3IgYW5kIG5hbWVkIGF0IGl0cyBlbmQuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhY2tlZEFyZWEoe1xuICBzZXJpZXMsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG4gIGZpcnN0LFxufToge1xuICBzZXJpZXM6IFNlcmllc1tdO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgZmlyc3Q6IG51bWJlcjtcbn0pIHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKTtcbiAgY29uc3QgTEFCRUxTID0gNzA7XG4gIGNvbnN0IHBsb3RXID0gd2lkdGggLSBQQUQubGVmdCAtIFBBRC5yaWdodCAtIExBQkVMUztcbiAgY29uc3QgcGxvdEggPSBoZWlnaHQgLSBQQUQudG9wIC0gUEFELmJvdHRvbTtcbiAgY29uc3QgbiA9IE1hdGgubWF4KDIsIC4uLnNlcmllcy5tYXAoKHMpID0+IHMudmFsdWVzLmxlbmd0aCkpO1xuICBjb25zdCBzdGFja2VkOiBudW1iZXJbXVtdID0gW107XG4gIHNlcmllcy5mb3JFYWNoKChzLCBrKSA9PlxuICAgIHN0YWNrZWQucHVzaChzLnZhbHVlcy5tYXAoKHYsIGkpID0+IHYgKyAoayA/IHN0YWNrZWRbayAtIDFdW2ldIDogMCkpKSxcbiAgKTtcbiAgY29uc3QgZ3JpZCA9IHRpY2tzKE1hdGgubWF4KC4uLnN0YWNrZWRbc3RhY2tlZC5sZW5ndGggLSAxXSkpO1xuICBjb25zdCB0b3AgPSBncmlkW2dyaWQubGVuZ3RoIC0gMV07XG4gIGNvbnN0IHggPSAoaTogbnVtYmVyKSA9PiAoaSAvIChuIC0gMSkpICogcGxvdFc7XG4gIGNvbnN0IHkgPSAodjogbnVtYmVyKSA9PiBwbG90SCAtICh2IC8gdG9wKSAqIHBsb3RIO1xuICBjb25zdCB0b3BzID0gc3RhY2tlZC5tYXAoKGxpbmUpID0+IGxpbmUuZmxhdE1hcCgodiwgaSkgPT4gW3goaSksIHkodildKSk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGgsIGhlaWdodCB9fSBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIobnVsbCl9PlxuICAgICAgPEF4ZXNcbiAgICAgICAgd2lkdGg9e3dpZHRoIC0gTEFCRUxTfVxuICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgZ3JpZD17Z3JpZH1cbiAgICAgICAgdG9wPXt0b3B9XG4gICAgICAgIGZpcnN0PXtmaXJzdH1cbiAgICAgICAgY291bnQ9e259XG4gICAgICAvPlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PXtgMCAwICR7cGxvdFd9ICR7cGxvdEh9YH1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiBQQUQubGVmdCxcbiAgICAgICAgICB0b3A6IFBBRC50b3AsXG4gICAgICAgICAgd2lkdGg6IHBsb3RXLFxuICAgICAgICAgIGhlaWdodDogcGxvdEgsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtncmlkTGluZXMoZ3JpZCwgdG9wLCBwbG90VywgcGxvdEgpfVxuICAgICAgICB7c2VyaWVzLm1hcCgocywgaykgPT4ge1xuICAgICAgICAgIGNvbnN0IGJhc2UgPSBrID8gYmFja3dhcmRzKHRvcHNbayAtIDFdKSA6IFt4KG4gLSAxKSwgcGxvdEgsIDAsIHBsb3RIXTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHBvbHlnb24ga2V5PXtzLmlkfSBwb2ludHM9e1suLi50b3BzW2tdLCAuLi5iYXNlXX0gZmlsbD17cy5jb2xvcn0gLz5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgICAge3RvcHMuc2xpY2UoMCwgLTEpLm1hcCgobGluZSwgaykgPT4gKFxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAga2V5PXtrfVxuICAgICAgICAgICAgcG9pbnRzPXtsaW5lfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtTVVJGQUNFfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvc3ZnPlxuICAgICAge3Nlcmllcy5tYXAoKHMsIGspID0+IHtcbiAgICAgICAgY29uc3QgbWlkID0gKHN0YWNrZWRba11bbiAtIDFdICsgKGsgPyBzdGFja2VkW2sgLSAxXVtuIC0gMV0gOiAwKSkgLyAyO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBrZXk9e3MuaWR9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbGVmdDogUEFELmxlZnQgKyBwbG90VyArIDgsXG4gICAgICAgICAgICAgIHRvcDogUEFELnRvcCArIHkobWlkKSAtIDcsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxMSxcbiAgICAgICAgICAgICAgY29sb3I6IEMubXV0ZWQsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtzLm5hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgICB7aG92ZXIgIT09IG51bGwgJiYgKFxuICAgICAgICA8UmVhZG91dFxuICAgICAgICAgIHJvd3M9e3Nlcmllcy5tYXAoKHMpID0+ICh7IHMsIHZhbHVlOiBzLnZhbHVlc1tob3Zlcl0gfSkpfVxuICAgICAgICAgIHR1cm49e2ZpcnN0ICsgaG92ZXJ9XG4gICAgICAgICAgbGVmdD17UEFELmxlZnQgKyB4KGhvdmVyKX1cbiAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgcGxvdEg9e3Bsb3RIfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIDxTdHJpcCBuPXtufSB3aWR0aD17cGxvdFd9IGhlaWdodD17cGxvdEh9IG9uSG92ZXI9e3NldEhvdmVyfSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgZmxhdCBgW3gwLCB5MCwgeDEsIHkxLCDigKZdYCBsaXN0LCBsYXN0IHBvaW50IGZpcnN0LiAqL1xuZnVuY3Rpb24gYmFja3dhcmRzKHBvaW50czogbnVtYmVyW10pIHtcbiAgY29uc3Qgb3V0OiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gcG9pbnRzLmxlbmd0aCAtIDI7IGkgPj0gMDsgaSAtPSAyKVxuICAgIG91dC5wdXNoKHBvaW50c1tpXSwgcG9pbnRzW2kgKyAxXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbnR5cGUgU2xpY2UgPSB7IG5hbWU6IHN0cmluZzsgdmFsdWU6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9O1xuXG4vKiogQSByaW5nIG9mIHBhcnRzIG9mIGEgd2hvbGUgKGtlZXAgaXQgdG8gc2l4IG9yIGZld2VyKTsgaG92ZXIgYSBwYXJ0IHRvXG4gKiAgcmVhZCBpdCBpbiB0aGUgbWlkZGxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERvbnV0KHtcbiAgc2xpY2VzLFxuICBzaXplLFxuICBsYWJlbCxcbn06IHtcbiAgc2xpY2VzOiBTbGljZVtdO1xuICBzaXplOiBudW1iZXI7XG4gIGxhYmVsOiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHRvdGFsID0gc2xpY2VzLnJlZHVjZSgobiwgcykgPT4gbiArIHMudmFsdWUsIDApO1xuICBjb25zdCByMSA9IHNpemUgLyAyIC0gMjtcbiAgY29uc3QgcjAgPSByMSAqIDAuNjI7XG4gIGxldCBhID0gMDtcbiAgY29uc3QgYXJjcyA9IHNsaWNlcy5tYXAoKHMpID0+IHtcbiAgICBjb25zdCBmcm9tID0gYTtcbiAgICBhICs9IChzLnZhbHVlIC8gdG90YWwpICogTWF0aC5QSSAqIDI7XG4gICAgcmV0dXJuIHsgLi4ucywgZnJvbSwgdG86IGEgfTtcbiAgfSk7XG4gIGNvbnN0IHNob3duID0gaG92ZXIgPT09IG51bGwgPyBudWxsIDogc2xpY2VzW2hvdmVyXTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD17YDAgMCAke3NpemV9ICR7c2l6ZX1gfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2FyY3MubWFwKChzLCBpKSA9PiAoXG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGtleT17cy5uYW1lfVxuICAgICAgICAgICAgZD17c2VjdG9yKFxuICAgICAgICAgICAgICBzaXplIC8gMixcbiAgICAgICAgICAgICAgc2l6ZSAvIDIsXG4gICAgICAgICAgICAgIGhvdmVyID09PSBpID8gcjAgLSAzIDogcjAsXG4gICAgICAgICAgICAgIGhvdmVyID09PSBpID8gcjEgKyAyIDogcjEsXG4gICAgICAgICAgICAgIHMuZnJvbSxcbiAgICAgICAgICAgICAgcy50byxcbiAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICBmaWxsPXtzLmNvbG9yfVxuICAgICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNldEhvdmVyKGkpfVxuICAgICAgICAgICAgb25Qb2ludGVyTGVhdmU9eygpID0+IHNldEhvdmVyKChoKSA9PiAoaCA9PT0gaSA/IG51bGwgOiBoKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L3N2Zz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyMiwgZm9udFdlaWdodDogXCJib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgIHtmbXQoc2hvd24gPyBzaG93bi52YWx1ZSA6IHRvdGFsKX1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgIHtzaG93biA/IHNob3duLm5hbWUgOiBsYWJlbH1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBbiBhbm51bGFyIHNlY3RvciBmcm9tIGFuZ2xlIGBhMGAgdG8gYGExYCAocmFkaWFucywgY2xvY2t3aXNlIGZyb21cbiAqICB0d2VsdmUgbydjbG9jayksIGxlc3MgYSBgZ2FwYCBvZiBweCBhdCBlYWNoIGVuZC4gKi9cbmZ1bmN0aW9uIHNlY3RvcihcbiAgY3g6IG51bWJlcixcbiAgY3k6IG51bWJlcixcbiAgcjA6IG51bWJlcixcbiAgcjE6IG51bWJlcixcbiAgYTA6IG51bWJlcixcbiAgYTE6IG51bWJlcixcbiAgZ2FwOiBudW1iZXIsXG4pIHtcbiAgY29uc3QgYXQgPSAocjogbnVtYmVyLCBhOiBudW1iZXIpID0+XG4gICAgYCR7Y3ggKyByICogTWF0aC5zaW4oYSl9ICR7Y3kgLSByICogTWF0aC5jb3MoYSl9YDtcbiAgY29uc3QgZzEgPSBnYXAgLyAyIC8gcjE7XG4gIGNvbnN0IGcwID0gZ2FwIC8gMiAvIHIwO1xuICBjb25zdCBsYXJnZSA9IGExIC0gYTAgPiBNYXRoLlBJID8gMSA6IDA7XG4gIHJldHVybiBbXG4gICAgYE0gJHthdChyMSwgYTAgKyBnMSl9YCxcbiAgICBgQSAke3IxfSAke3IxfSAwICR7bGFyZ2V9IDEgJHthdChyMSwgYTEgLSBnMSl9YCxcbiAgICBgTCAke2F0KHIwLCBhMSAtIGcwKX1gLFxuICAgIGBBICR7cjB9ICR7cjB9IDAgJHtsYXJnZX0gMCAke2F0KHIwLCBhMCArIGcwKX1gLFxuICAgIFwiWlwiLFxuICBdLmpvaW4oXCIgXCIpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VGYWRlSW4gfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBPV05TX1BPSU5URVIsIGNhcHMsIHBhbmVsIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBDbG9zZUJ1dHRvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuLyoqIEEgZnVsbCBzY3JlZW4gb3ZlciB0aGUgbWFwICh3aGljaCBibHVycyBiZWhpbmQgaXQsIGEgYmFja2Ryb3AgZmlsdGVyXG4gKiAgb3ZlciB0aGUgbGl2ZSAzRCBmcmFtZSk6IGEgZ2lsdCB0aXRsZSwgdGFicywgYW5kIHRoZSBjb250ZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbih7XG4gIHRpdGxlLFxuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICB0YWJzLFxuICB0YWIsXG4gIG9uVGFiLFxuICBvbkNsb3NlLFxuICBjaGlsZHJlbixcbn06IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIHRhYnM/OiBzdHJpbmdbXTtcbiAgdGFiPzogc3RyaW5nO1xuICBvblRhYj86ICh0YWI6IHN0cmluZykgPT4gdm9pZDtcbiAgb25DbG9zZTogKCkgPT4gdm9pZDtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn0pIHtcbiAgY29uc3QgZW50ZXIgPSB1c2VGYWRlSW4oKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB0b3A6IDMyLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgzLCA4LCAxNCwgMC41NSlcIixcbiAgICAgICAgYmFja2Ryb3BGaWx0ZXI6IHsgbmFtZTogXCJibHVyXCIsIHBhcmFtczogeyByYWRpdXM6IDggfSB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e09XTlNfUE9JTlRFUn1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAgIC4uLmVudGVyLFxuICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGJvcmRlcjogMS41LFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGhlaWdodDogNTQsXG4gICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMaW5lLFxuICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICAgIGFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogXCIjMjQ0MDVlXCIgfSwgeyBjb2xvcjogXCIjMTMyNDM4XCIgfV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRm9udHMuZGlzcGxheSxcbiAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAyNCxcbiAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogNCxcbiAgICAgICAgICAgICAgY29sb3I6IEMuZ29sZEhpLFxuICAgICAgICAgICAgICB0ZXh0U2hhZG93OiB7XG4gICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjYpXCIsXG4gICAgICAgICAgICAgICAgb2Zmc2V0WDogMCxcbiAgICAgICAgICAgICAgICBvZmZzZXRZOiAyLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dGl0bGUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIHJpZ2h0OiAxNCwgdG9wOiAxMiB9fT5cbiAgICAgICAgICAgIDxDbG9zZUJ1dHRvbiBvbkNsaWNrPXtvbkNsb3NlfSAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICB7dGFicyAmJiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBnYXA6IDQsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgdG9wOiA4IH0sXG4gICAgICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0YWJzLm1hcCgodCkgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXt0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVGFiPy4odCl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTgsIHZlcnRpY2FsOiA5IH0sXG4gICAgICAgICAgICAgICAgICBib3JkZXI6IHsgYm90dG9tOiAyIH0sXG4gICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogdCA9PT0gdGFiID8gQy5nb2xkIDogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6XG4gICAgICAgICAgICAgICAgICAgIHQgPT09IHRhYiA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjEpXCIgOiBcInJnYmEoMCwgMCwgMCwgMClcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjE3LCAxODMsIDEwOCwgMC4xNilcIiB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIC4uLmNhcHMsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHQgPT09IHRhYiA/IEMuZ29sZEhpIDogQy5tdXRlZCxcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApfVxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDEsXG4gICAgICAgICAgICBtaW5IZWlnaHQ6IDAsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGluY29tZSwgcGx1cmFsLCB0dXJuc0xlZnQsIHR5cGUgQWN0aW9uLCB0eXBlIEdhbWUgfSBmcm9tIFwiLi4vZ2FtZVwiO1xuaW1wb3J0IHsgRVJBUywgVEVDSFMsIHRlY2gsIHR5cGUgVGVjaCB9IGZyb20gXCIuLi90ZWNoc1wiO1xuaW1wb3J0IHsgQywgRm9udHMsIGNhcHMsIHRvbmUgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEljb24gfSBmcm9tIFwiLi4vdWkvSWNvblwiO1xuaW1wb3J0IHsgTWVkYWxsaW9uLCBUaXAgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5cbmNvbnN0IENPTCA9IDI2NjtcbmNvbnN0IE5PREVfVyA9IDIyNjtcbmNvbnN0IE5PREVfSCA9IDYwO1xuY29uc3QgUEFEID0gMjY7XG5jb25zdCBIRUFEID0gNDY7XG5jb25zdCBST1dTID0gNztcbmNvbnN0IENPTFVNTlMgPSBFUkFTLnJlZHVjZSgobiwgZSkgPT4gbiArIGUuY29sdW1ucywgMCk7XG5jb25zdCBXSURUSCA9IFBBRCAqIDIgKyBDT0xVTU5TICogQ09MIC0gKENPTCAtIE5PREVfVyk7XG5cbnR5cGUgU3RhdGUgPSBcImRvbmVcIiB8IFwiY3VycmVudFwiIHwgXCJvcGVuXCIgfCBcImxvY2tlZFwiO1xuXG4vKiogUm93cyBzaGFyZSB0aGUgc2NyZWVuJ3MgaGVpZ2h0ICh3aXRoaW4gcmVhc29uKS4gKi9cbmNvbnN0IHJvd0ZvciA9IChoZWlnaHQ6IG51bWJlcikgPT5cbiAgTWF0aC5tYXgoNzIsIE1hdGgubWluKDEwNCwgKGhlaWdodCAtIEhFQUQgLSA2MCkgLyBST1dTKSk7XG5cbmNvbnN0IGF0ID0gKHQ6IFRlY2gsIHJvdzogbnVtYmVyKSA9PiAoe1xuICB4OiBQQUQgKyB0LmNvbCAqIENPTCxcbiAgeTogSEVBRCArIDE0ICsgdC5yb3cgKiByb3csXG59KTtcblxuLyoqIFRoZSB0ZWNobm9sb2d5IHRyZWU6IGVyYXMgbGVmdCB0byByaWdodCwgZWFjaCB0ZWNoIGEgcGlsbCB3aXJlZCB0byB3aGF0XG4gKiAgaXQgbmVlZHMuIENsaWNrIG9uZSB5b3UgY2FuIHN0dWR5IHRvIHJlc2VhcmNoIGl0LiBTY3JvbGwgd2l0aCB0aGVcbiAqICB3aGVlbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUZWNoVHJlZSh7XG4gIGdhbWUsXG4gIHBsYXllcixcbiAgZGlzcGF0Y2gsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG59OiB7XG4gIGdhbWU6IEdhbWU7XG4gIHBsYXllcjogc3RyaW5nO1xuICBkaXNwYXRjaDogKGE6IEFjdGlvbikgPT4gdm9pZDtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IGN1cnJlbnQgPSBnYW1lLnJlc2VhcmNoID8gdGVjaChnYW1lLnJlc2VhcmNoKSA6IG51bGw7XG4gIGNvbnN0IHJvdyA9IHJvd0ZvcihoZWlnaHQpO1xuICBjb25zdCBtYXggPSBNYXRoLm1heCgwLCBXSURUSCAtIHdpZHRoKTtcbiAgY29uc3QgW3Njcm9sbCwgc2V0U2Nyb2xsXSA9IHVzZVN0YXRlKCgpID0+XG4gICAgTWF0aC5taW4oXG4gICAgICBtYXgsXG4gICAgICBNYXRoLm1heCgwLCBhdChjdXJyZW50ID8/IHRlY2goXCJtYWNoaW5lcnlcIiksIHJvdykueCAtIHdpZHRoICogMC40NSksXG4gICAgKSxcbiAgKTtcbiAgY29uc3Qgc2NpZW5jZSA9IGluY29tZShnYW1lLCBwbGF5ZXIpLnNjaWVuY2U7XG4gIGNvbnN0IHN0YXRlID0gKHQ6IFRlY2gpOiBTdGF0ZSA9PlxuICAgIGdhbWUucmVzZWFyY2hlZC5pbmNsdWRlcyh0LmlkKVxuICAgICAgPyBcImRvbmVcIlxuICAgICAgOiB0LmlkID09PSBnYW1lLnJlc2VhcmNoXG4gICAgICAgID8gXCJjdXJyZW50XCJcbiAgICAgICAgOiB0LnJlcXVpcmVzLmV2ZXJ5KChyKSA9PiBnYW1lLnJlc2VhcmNoZWQuaW5jbHVkZXMocikpXG4gICAgICAgICAgPyBcIm9wZW5cIlxuICAgICAgICAgIDogXCJsb2NrZWRcIjtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25XaGVlbD17KGUpID0+XG4gICAgICAgIHNldFNjcm9sbCgocykgPT5cbiAgICAgICAgICBNYXRoLm1pbihtYXgsIE1hdGgubWF4KDAsIHMgLSAoZS5kZWx0YVkgKyBlLmRlbHRhWCkgKiA5MCkpLFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBzY3JvbGxMZWZ0PXtzY3JvbGx9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgb3ZlcmZsb3dYOiBcInNjcm9sbFwiLFxuICAgICAgICBvdmVyZmxvd1k6IFwiaGlkZGVuXCIsXG4gICAgICAgIHNjcm9sbGJhcjoge1xuICAgICAgICAgIHRoaWNrbmVzczogOCxcbiAgICAgICAgICB0aHVtYjogeyBiYWNrZ3JvdW5kQ29sb3I6IEMuZ29sZExvLCBib3JkZXJSYWRpdXM6IDQgfSxcbiAgICAgICAgICB0cmFjazogeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjMpXCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNpdGlvbjogeyBzY3JvbGw6IHsgZHVyYXRpb246IDI2MCwgZWFzaW5nOiBcImVhc2VPdXRcIiB9IH0sXG4gICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiIzEwMjQzYVwiIH0sIHsgY29sb3I6IFwiIzBhMTUyMlwiIH1dLFxuICAgICAgICB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogV0lEVEgsIGhlaWdodDogXCIxMDAlXCIsIGZsZXhTaHJpbms6IDAgfX0+XG4gICAgICAgIDxFcmFzIC8+XG4gICAgICAgIHtURUNIUy5mbGF0TWFwKCh0KSA9PlxuICAgICAgICAgIHQucmVxdWlyZXMubWFwKChyKSA9PiAoXG4gICAgICAgICAgICA8V2lyZVxuICAgICAgICAgICAgICBrZXk9e2Ake3J9LSR7dC5pZH1gfVxuICAgICAgICAgICAgICBmcm9tPXt0ZWNoKHIpfVxuICAgICAgICAgICAgICB0bz17dH1cbiAgICAgICAgICAgICAgcm93PXtyb3d9XG4gICAgICAgICAgICAgIGxpdD17Z2FtZS5yZXNlYXJjaGVkLmluY2x1ZGVzKHIpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKSxcbiAgICAgICAgKX1cbiAgICAgICAge1RFQ0hTLm1hcCgodCkgPT4gKFxuICAgICAgICAgIDxUZWNoTm9kZVxuICAgICAgICAgICAga2V5PXt0LmlkfVxuICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgIHJvdz17cm93fVxuICAgICAgICAgICAgc3RhdGU9e3N0YXRlKHQpfVxuICAgICAgICAgICAgcHJvZ3Jlc3M9eyhnYW1lLnByb2dyZXNzW3QuaWRdID8/IDApIC8gdC5jb3N0fVxuICAgICAgICAgICAgdHVybnM9e3R1cm5zTGVmdCh0LmNvc3QsIGdhbWUucHJvZ3Jlc3NbdC5pZF0gPz8gMCwgc2NpZW5jZSl9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBkaXNwYXRjaCh7IHR5cGU6IFwicmVzZWFyY2hcIiwgdGVjaDogdC5pZCB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBXaGVyZSBjb2x1bW4gYGNgIGJlZ2luczogbWlkLXdheSB0aHJvdWdoIHRoZSBnYXAgYmVmb3JlIGl0LiAqL1xuY29uc3QgZWRnZSA9IChjOiBudW1iZXIpID0+XG4gIGMgPT09IDAgPyAwIDogYyA9PT0gQ09MVU1OUyA/IFdJRFRIIDogUEFEICsgYyAqIENPTCAtIChDT0wgLSBOT0RFX1cpIC8gMjtcblxuZnVuY3Rpb24gRXJhcygpIHtcbiAgbGV0IGNvbCA9IDA7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtFUkFTLm1hcCgoZXJhLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGxlZnQgPSBlZGdlKGNvbCk7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gZWRnZSgoY29sICs9IGVyYS5jb2x1bW5zKSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17ZXJhLm5hbWV9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbGVmdCxcbiAgICAgICAgICAgICAgd2lkdGg6IHJpZ2h0IC0gbGVmdCxcbiAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjpcbiAgICAgICAgICAgICAgICBpICUgMiA/IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyNSlcIiA6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxuICAgICAgICAgICAgICBib3JkZXI6IHsgcmlnaHQ6IDEgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRm9udHMuZGlzcGxheSxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMyxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5nb2xkLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IDE0IH0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtlcmEubmFtZS50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgIDwvPlxuICApO1xufVxuXG4vKiogQW4gZWxib3dlZCB3aXJlIGZyb20gYGZyb21gJ3MgcmlnaHQgZWRnZSB0byBgdG9gJ3MgbGVmdCBlZGdlLiAqL1xuZnVuY3Rpb24gV2lyZSh7XG4gIGZyb20sXG4gIHRvLFxuICByb3csXG4gIGxpdCxcbn06IHtcbiAgZnJvbTogVGVjaDtcbiAgdG86IFRlY2g7XG4gIHJvdzogbnVtYmVyO1xuICBsaXQ6IGJvb2xlYW47XG59KSB7XG4gIGNvbnN0IGEgPSBhdChmcm9tLCByb3cpO1xuICBjb25zdCBiID0gYXQodG8sIHJvdyk7XG4gIGNvbnN0IHgxID0gYS54ICsgTk9ERV9XO1xuICBjb25zdCB5MSA9IGEueSArIE5PREVfSCAvIDI7XG4gIGNvbnN0IHgyID0gYi54O1xuICBjb25zdCB5MiA9IGIueSArIE5PREVfSCAvIDI7XG4gIGNvbnN0IGVsYm93ID0geDIgLSAoQ09MIC0gTk9ERV9XKSAvIDI7XG4gIGNvbnN0IGNvbG9yID0gbGl0ID8gXCJyZ2JhKDIxNywgMTgzLCAxMDgsIDAuNzUpXCIgOiBcInJnYmEoOTgsIDExOSwgMTQxLCAwLjU1KVwiO1xuICBjb25zdCBzZWcgPSAobGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpID0+IChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQsXG4gICAgICAgIHRvcCxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgIH19XG4gICAgLz5cbiAgKTtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge3NlZyh4MSwgeTEgLSAxLCBlbGJvdyAtIHgxLCAyKX1cbiAgICAgIHtzZWcoZWxib3cgLSAxLCBNYXRoLm1pbih5MSwgeTIpIC0gMSwgMiwgTWF0aC5hYnMoeTIgLSB5MSkgKyAyKX1cbiAgICAgIHtzZWcoZWxib3csIHkyIC0gMSwgeDIgLSBlbGJvdywgMil9XG4gICAgPC8+XG4gICk7XG59XG5cbmNvbnN0IExPT0s6IFJlY29yZDxcbiAgU3RhdGUsXG4gIHsgdG9wOiBzdHJpbmc7IGJvdHRvbTogc3RyaW5nOyBib3JkZXI6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1cbj4gPSB7XG4gIGRvbmU6IHsgdG9wOiBcIiM0YjNjMWVcIiwgYm90dG9tOiBcIiMyNTFjMGVcIiwgYm9yZGVyOiBDLmdvbGQsIHRleHQ6IEMuZ29sZEhpIH0sXG4gIGN1cnJlbnQ6IHtcbiAgICB0b3A6IFwiIzI0NWI4OFwiLFxuICAgIGJvdHRvbTogXCIjMTIzMTUwXCIsXG4gICAgYm9yZGVyOiBDLnNjaWVuY2UsXG4gICAgdGV4dDogXCIjZmZmZmZmXCIsXG4gIH0sXG4gIG9wZW46IHsgdG9wOiBcIiMxZjM5NTRcIiwgYm90dG9tOiBcIiMxMDFmMzBcIiwgYm9yZGVyOiBDLnNsYXRlSGksIHRleHQ6IEMudGV4dCB9LFxuICBsb2NrZWQ6IHtcbiAgICB0b3A6IFwiIzE0MWUyYVwiLFxuICAgIGJvdHRvbTogXCIjMGIxMTE5XCIsXG4gICAgYm9yZGVyOiBcIiMyNzM0NDNcIixcbiAgICB0ZXh0OiBDLmZhaW50LFxuICB9LFxufTtcblxuZnVuY3Rpb24gVGVjaE5vZGUoe1xuICB0LFxuICByb3csXG4gIHN0YXRlLFxuICBwcm9ncmVzcyxcbiAgdHVybnMsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIHQ6IFRlY2g7XG4gIHJvdzogbnVtYmVyO1xuICBzdGF0ZTogU3RhdGU7XG4gIHByb2dyZXNzOiBudW1iZXI7XG4gIHR1cm5zOiBudW1iZXI7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBsb29rID0gTE9PS1tzdGF0ZV07XG4gIGNvbnN0IHsgeCwgeSB9ID0gYXQodCwgcm93KTtcbiAgY29uc3Qgc3RhdHVzID1cbiAgICBzdGF0ZSA9PT0gXCJkb25lXCJcbiAgICAgID8gXCJSZXNlYXJjaGVkXCJcbiAgICAgIDogc3RhdGUgPT09IFwibG9ja2VkXCJcbiAgICAgICAgPyBgJHtwbHVyYWwodHVybnMsIFwidHVyblwiKX0gwrcgbG9ja2VkYFxuICAgICAgICA6IHBsdXJhbCh0dXJucywgXCJ0dXJuXCIpO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e3N0YXRlID09PSBcImRvbmVcIiA/IHVuZGVmaW5lZCA6IG9uQ2xpY2t9XG4gICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2V0SG92ZXIodHJ1ZSl9XG4gICAgICBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIoZmFsc2UpfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IHgsXG4gICAgICAgIHRvcDogeSxcbiAgICAgICAgd2lkdGg6IE5PREVfVyxcbiAgICAgICAgaGVpZ2h0OiBOT0RFX0gsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogOCxcbiAgICAgICAgcGFkZGluZzogeyBsZWZ0OiA1LCByaWdodDogMTAgfSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiBOT0RFX0ggLyAyLFxuICAgICAgICBib3JkZXI6IDEuNSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IGxvb2suYm9yZGVyLFxuICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgIGFuZ2xlOiAxODAsXG4gICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBsb29rLnRvcCB9LCB7IGNvbG9yOiBsb29rLmJvdHRvbSB9XSxcbiAgICAgICAgfSxcbiAgICAgICAgYm94U2hhZG93OlxuICAgICAgICAgIHN0YXRlID09PSBcImN1cnJlbnRcIlxuICAgICAgICAgICAgPyB7IGNvbG9yOiBcInJnYmEoOTUsIDE5MSwgMjQ0LCAwLjU1KVwiLCBibHVyUmFkaXVzOiAxNiB9XG4gICAgICAgICAgICA6IHsgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjQ1KVwiLCBibHVyUmFkaXVzOiA2LCB5T2Zmc2V0OiAyIH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBib3JkZXJDb2xvcjogQy5nb2xkSGkgfX1cbiAgICA+XG4gICAgICA8TWVkYWxsaW9uXG4gICAgICAgIHNpemU9ezQ4fVxuICAgICAgICBpbm5lcj17c3RhdGUgPT09IFwiZG9uZVwiID8gXCIjNmQ1NDI2XCIgOiBDLnNsYXRlSGl9XG4gICAgICAgIG91dGVyPXtzdGF0ZSA9PT0gXCJkb25lXCIgPyBcIiMyZDIyMGZcIiA6IEMuaW5rfVxuICAgICAgICBwcm9ncmVzcz17c3RhdGUgPT09IFwiY3VycmVudFwiID8gcHJvZ3Jlc3MgOiB1bmRlZmluZWR9XG4gICAgICAgIHJpbmc9e0Muc2NpZW5jZX1cbiAgICAgID5cbiAgICAgICAgPEljb25cbiAgICAgICAgICBuYW1lPXtzdGF0ZSA9PT0gXCJkb25lXCIgPyBcImNoZWNrXCIgOiB0Lmljb259XG4gICAgICAgICAgc2l6ZT17MjB9XG4gICAgICAgICAgY29sb3I9e1xuICAgICAgICAgICAgc3RhdGUgPT09IFwiZG9uZVwiXG4gICAgICAgICAgICAgID8gQy5nb2xkSGlcbiAgICAgICAgICAgICAgOiBzdGF0ZSA9PT0gXCJsb2NrZWRcIlxuICAgICAgICAgICAgICAgID8gQy5mYWludFxuICAgICAgICAgICAgICAgIDogQy5zY2llbmNlXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9NZWRhbGxpb24+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIsIGZsZXhHcm93OiAxLCBmbGV4U2hyaW5rOiAxIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmNhcHMsXG4gICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjEsXG4gICAgICAgICAgICBjb2xvcjogbG9vay50ZXh0LFxuICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dC5uYW1lLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgY29sb3I6IHN0YXRlID09PSBcImN1cnJlbnRcIiA/IEMuc2NpZW5jZSA6IEMubXV0ZWQsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtzdGF0dXN9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAzIH19PlxuICAgICAgICAgIHt0LnVubG9ja3MubWFwKCh1KSA9PiAoXG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBrZXk9e3UubmFtZX1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogMTgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxOCxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDMsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRvbmUobG9vay5ib3R0b20sIDAuNiksXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMilcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEljb25cbiAgICAgICAgICAgICAgICBuYW1lPXt1Lmljb259XG4gICAgICAgICAgICAgICAgc2l6ZT17MTJ9XG4gICAgICAgICAgICAgICAgY29sb3I9e3N0YXRlID09PSBcImxvY2tlZFwiID8gQy5mYWludCA6IEMuZ29sZEhpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICB7aG92ZXIgJiYgKFxuICAgICAgICA8VGlwXG4gICAgICAgICAgdGV4dD17YCR7dC51bmxvY2tzLm1hcCgodSkgPT4gdS5uYW1lKS5qb2luKFwiLCBcIil9IMK3IEJvb3N0OiAke3QuYm9vc3R9YH1cbiAgICAgICAgICBzaWRlPVwiYm90dG9tXCJcbiAgICAgICAgICBvZmZzZXQ9e05PREVfSCArIDR9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUEsYUFBTyxVQUFVLFdBQVcsYUFBYSx3QkFBd0I7QUFBQTtBQUFBOzs7QUNBakU7QUFBQTtBQUFBLGFBQU8sVUFBVSxXQUFXLGFBQWEsWUFBWTtBQUFBO0FBQUE7OztBQ0FyRDtBQUFBO0FBQUEsYUFBTyxVQUFVLFdBQVcsYUFBYSxPQUFPO0FBQUE7QUFBQTs7OztBQ0FoRCxNQUFBQSxxQkFBc0I7Ozs7QUNBdEIsTUFBQUMsaUJBQWdEOzs7QUNLaEQsMEJBS087QUFpZUEsV0FBU0MsS0FBb0NDLE1BQVNDLE9BQXVCO0FBQ2xGQywwQkFBQUEsTUFBUUYsTUFBTUMsS0FBQUE7RUFDaEI7QUFHTyxXQUFTRSxRQUNkSCxNQUNBQyxPQUFrQztBQUVsQyxlQUFPRyxrQkFBQUEsU0FBV0osTUFBTUMsS0FBQUE7RUFDMUI7QUFHTyxXQUFTSSxHQUNkTCxNQUNBTSxJQUFtQztBQUVuQ0MsMEJBQUFBLGtCQUFvQlAsTUFBTU0sRUFBQUE7QUFDMUIsV0FBTyxVQUFNRSxrQkFBQUEscUJBQXVCUixNQUFNTSxFQUFBQTtFQUM1QztBQUdPLFdBQVNHLG9CQUNkVCxNQUNBTSxJQUFtQztBQUVuQ0UsMEJBQUFBLHFCQUF1QlIsTUFBTU0sRUFBQUE7RUFDL0I7QUFHTyxNQUFNSSxPQUFPO0lBQ2xCWDtJQUNBSTtJQUNBRTtJQUNBTSxrQkFBa0JOO0lBQ2xCSTtJQUNBRyxTQUFTO01BQ1BDLFNBQUFBO0FBQWlELGVBQU9WLFFBQVEsa0JBQWtCLElBQUE7TUFBTztNQUN6RlcsT0FBT2IsT0FBb0I7QUFBVUYsYUFBSyxrQkFBa0JFLEtBQUFBO01BQVE7TUFDcEVjLFdBQVdkLE9BQXdCO0FBQVVGLGFBQUssc0JBQXNCRSxLQUFBQTtNQUFRO0lBQ2xGO0lBQ0FlLEtBQUs7TUFDSEMsTUFBTWhCLE9BQVk7QUFBVUYsYUFBSyxhQUFhRSxLQUFBQTtNQUFRO01BQ3REaUIsS0FBS2pCLE9BQVc7QUFBVUYsYUFBSyxZQUFZRSxLQUFBQTtNQUFRO01BQ25Ea0IsS0FBS2xCLE9BQVc7QUFBVUYsYUFBSyxZQUFZRSxLQUFBQTtNQUFRO01BQ25EbUIsT0FBT25CLE9BQWE7QUFBVUYsYUFBSyxjQUFjRSxLQUFBQTtNQUFRO01BQ3pEb0IsUUFBQUE7QUFBOEIsZUFBT2xCLFFBQVEsYUFBYSxJQUFBO01BQU87SUFDbkU7SUFDQW1CLFFBQVE7TUFDTkMsT0FBQUE7QUFBOEIsZUFBT3BCLFFBQVEsZUFBZSxJQUFBO01BQU87SUFDckU7RUFDRjs7Ozs7O0FDemhCTyxNQUFNcUIsT0FBYztJQUN6QjtNQUFFQyxNQUFNO01BQWVDLFNBQVM7SUFBRTtJQUNsQztNQUFFRCxNQUFNO01BQWlCQyxTQUFTO0lBQUU7SUFDcEM7TUFBRUQsTUFBTTtNQUFnQkMsU0FBUztJQUFFO0lBQ25DO01BQUVELE1BQU07TUFBbUJDLFNBQVM7SUFBRTs7QUFpQnhDLE1BQU1DLElBQUksQ0FDUkMsSUFDQUgsTUFDQUksS0FDQUMsS0FDQUMsVUFDQUMsTUFDQUMsU0FDQUMsV0FDVTtJQUNWTjtJQUNBSDtJQUNBSTtJQUNBQztJQUNBSyxNQUFNLEtBQUtOLE1BQU1BLE1BQU0sSUFBSUEsTUFBTTtJQUNqQ0U7SUFDQUM7SUFDQUMsU0FBU0EsUUFBUUcsSUFBSSxDQUFDLENBQUNKLE9BQU1QLEtBQUFBLE9BQVc7TUFBRU8sTUFBQUE7TUFBTVAsTUFBQUE7SUFBSyxFQUFBO0lBQ3JEUztFQUNGO0FBRU8sTUFBTUcsUUFBZ0I7SUFDM0JWLEVBQ0UsV0FDQSxXQUNBLEdBQ0EsR0FDQSxDQUFBLEdBQ0EsUUFDQTtNQUFDO1FBQUM7UUFBUTs7T0FDVixjQUFBO0lBRUZBLEVBQ0UsYUFDQSxvQkFDQSxHQUNBLEdBQ0EsQ0FBQSxHQUNBLFlBQ0E7TUFBQztRQUFDO1FBQU87O09BQ1QsYUFBQTtJQUVGQSxFQUNFLFVBQ0EsVUFDQSxHQUNBLEdBQ0EsQ0FBQSxHQUNBLGNBQ0E7TUFBQztRQUFDO1FBQWM7O09BQ2hCLG1CQUFBO0lBRUZBLEVBQ0UsV0FDQSxXQUNBLEdBQ0EsR0FDQSxDQUFBLEdBQ0EsVUFDQTtNQUFDO1FBQUM7UUFBVTs7T0FDWiwyQkFBQTtJQUVGQSxFQUNFLGNBQ0EsY0FDQSxHQUNBLEdBQ0E7TUFBQztPQUNELFFBQ0E7TUFBQztRQUFDO1FBQVE7O09BQ1YsaUJBQUE7SUFFRkEsRUFDRSxXQUNBLFdBQ0EsR0FDQSxHQUNBO01BQUM7T0FDRCxRQUNBO01BQUM7UUFBQztRQUFXOztPQUNiLDJCQUFBO0lBRUZBLEVBQ0UsV0FDQSxXQUNBLEdBQ0EsR0FDQTtNQUFDO09BQ0QsT0FDQTtNQUFDO1FBQUM7UUFBTzs7T0FDVCw0QkFBQTtJQUVGQSxFQUNFLFdBQ0EsV0FDQSxHQUNBLEdBQ0E7TUFBQztPQUNELFVBQ0E7TUFBQztRQUFDO1FBQVU7O09BQ1osZ0JBQUE7SUFFRkEsRUFDRSxVQUNBLGtCQUNBLEdBQ0EsR0FDQTtNQUFDO09BQ0QsWUFDQTtNQUFDO1FBQUM7UUFBWTs7T0FDZCx1QkFBQTtJQUVGQSxFQUNFLGFBQ0EsYUFDQSxHQUNBLEdBQ0E7TUFBQztPQUNELFNBQ0E7TUFBQztRQUFDO1FBQVM7O09BQ1gsdUJBQUE7SUFFRkEsRUFDRSxTQUNBLGFBQ0EsR0FDQSxHQUNBO01BQUM7TUFBVTtPQUNYLFlBQ0E7TUFBQztRQUFDO1FBQVk7O09BQ2QsaUJBQUE7SUFFRkEsRUFDRSxZQUNBLFlBQ0EsR0FDQSxHQUNBO01BQUM7T0FDRCxRQUNBO01BQUM7UUFBQztRQUFROztPQUNWLG9CQUFBO0lBRUZBLEVBQ0UsVUFDQSxvQkFDQSxHQUNBLEdBQ0E7TUFBQztPQUNELFlBQ0E7TUFBQztRQUFDO1FBQVk7O09BQ2QsaUJBQUE7SUFFRkEsRUFDRSxRQUNBLGdCQUNBLEdBQ0EsR0FDQTtNQUFDO09BQ0QsWUFDQTtNQUFDO1FBQUM7UUFBWTs7T0FDZCxvQkFBQTtJQUVGQSxFQUNFLGNBQ0Esd0JBQ0EsR0FDQSxHQUNBO01BQUM7TUFBVztPQUNaLFVBQ0E7TUFBQztRQUFDO1FBQVU7O09BQ1osMkJBQUE7SUFFRkEsRUFDRSxlQUNBLGVBQ0EsR0FDQSxHQUNBO01BQUM7T0FDRCxXQUNBO01BQUM7UUFBQztRQUFXOztPQUNiLHVCQUFBO0lBRUZBLEVBQ0UsZ0JBQ0EsZ0JBQ0EsR0FDQSxHQUNBO01BQUM7TUFBVztPQUNaLFVBQ0E7TUFBQztRQUFDO1FBQVc7O09BQ2Isb0JBQUE7SUFFRkEsRUFDRSxnQkFDQSxnQkFDQSxHQUNBLEdBQ0E7TUFBQztPQUNELFVBQ0E7TUFBQztRQUFDO1FBQVU7O09BQ1osaUJBQUE7SUFFRkEsRUFDRSxlQUNBLGVBQ0EsR0FDQSxHQUNBO01BQUM7T0FDRCxjQUNBO01BQUM7UUFBQztRQUFVOztPQUNaLHFCQUFBO0lBRUZBLEVBQ0UsV0FDQSxvQkFDQSxHQUNBLEdBQ0E7TUFBQztPQUNELFlBQ0E7TUFBQztRQUFDO1FBQVk7O09BQ2QsNkJBQUE7SUFFRkEsRUFDRSxrQkFDQSxrQkFDQSxHQUNBLEdBQ0E7TUFBQztNQUFZO09BQ2IsY0FDQTtNQUFDO1FBQUM7UUFBYzs7T0FDaEIsbUJBQUE7SUFFRkEsRUFDRSxhQUNBLGFBQ0EsR0FDQSxHQUNBO01BQUM7TUFBUTtPQUNULGNBQ0E7TUFBQztRQUFDO1FBQU87O09BQ1QsbUJBQUE7SUFFRkEsRUFDRSxhQUNBLGFBQ0EsR0FDQSxHQUNBO01BQUM7TUFBZTtPQUNoQixRQUNBO01BQUM7UUFBQztRQUFROztPQUNWLHdCQUFBO0lBRUZBLEVBQ0UsWUFDQSxZQUNBLEdBQ0EsR0FDQTtNQUFDO09BQ0QsWUFDQTtNQUFDO1FBQUM7UUFBWTs7T0FDZCwwQkFBQTtJQUVGQSxFQUNFLGFBQ0Esd0JBQ0EsR0FDQSxHQUNBO01BQUM7T0FDRCxVQUNBO01BQUM7UUFBQztRQUFVOztPQUNaLG1CQUFBO0lBRUZBLEVBQ0UsV0FDQSxXQUNBLEdBQ0EsR0FDQTtNQUFDO09BQ0QsVUFDQTtNQUFDO1FBQUM7UUFBVTs7T0FDWixrQ0FBQTtJQUVGQSxFQUNFLGVBQ0EsZUFDQSxHQUNBLEdBQ0E7TUFBQztPQUNELE9BQ0E7TUFBQztRQUFDO1FBQVU7O09BQ1osbUJBQUE7SUFFRkEsRUFDRSxjQUNBLG1CQUNBLEdBQ0EsR0FDQTtNQUFDO01BQWE7T0FDZCxjQUNBO01BQUM7UUFBQztRQUFjOztPQUNoQixvQkFBQTtJQUVGQSxFQUNFLFdBQ0EsV0FDQSxHQUNBLEdBQ0E7TUFBQztNQUFhO09BQ2QsUUFDQTtNQUFDO1FBQUM7UUFBUTs7T0FDVix1QkFBQTtJQUVGQSxFQUNFLGFBQ0EsYUFDQSxHQUNBLEdBQ0E7TUFBQztNQUFhO09BQ2QsWUFDQTtNQUFDO1FBQUM7UUFBWTs7T0FDZCxpQkFBQTtJQUVGQSxFQUNFLFlBQ0EsWUFDQSxHQUNBLEdBQ0E7TUFBQztPQUNELFFBQ0E7TUFBQztRQUFDO1FBQVE7O09BQ1Ysd0JBQUE7SUFFRkEsRUFDRSxhQUNBLGFBQ0EsR0FDQSxHQUNBO01BQUM7T0FDRCxPQUNBO01BQUM7UUFBQztRQUFXOztPQUNiLHVDQUFBO0lBRUZBLEVBQ0UsU0FDQSxpQkFDQSxHQUNBLEdBQ0E7TUFBQztNQUFXO09BQ1osWUFDQTtNQUFDO1FBQUM7UUFBWTs7T0FDZCx3QkFBQTs7QUFJRyxNQUFNVyxPQUFPLENBQUNWLE9BQWVTLE1BQU1FLEtBQUssQ0FBQ1osT0FBTUEsR0FBRUMsT0FBT0EsRUFBQUE7QUFJeEQsTUFBTVksaUJBQWlCSCxNQUFNSSxPQUNsQyxDQUFDZCxPQUNFQSxHQUFFRSxPQUFPLEtBQUtGLEdBQUVDLE9BQU8sa0JBQ3hCO0lBQUM7SUFBVztJQUFrQjtJQUFhYyxTQUFTZixHQUFFQyxFQUFFLENBQUEsRUFDMURRLElBQUksQ0FBQ1QsT0FBTUEsR0FBRUMsRUFBRTtBQUVWLE1BQU1lLFNBQVM7SUFDcEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOzs7O0FDN1lLLE1BQU1DLElBQUk7SUFDZkMsS0FBSztJQUNMQyxNQUFNO0lBQ05DLFFBQVE7SUFDUkMsT0FBTztJQUNQQyxTQUFTO0lBQ1RDLE1BQU07SUFDTkMsUUFBUTtJQUNSQyxRQUFRO0lBQ1JDLFVBQVU7SUFDVkMsTUFBTTtJQUNOQyxPQUFPO0lBQ1BDLE9BQU87SUFDUEMsTUFBTTtJQUNOQyxLQUFLOztJQUVMQyxNQUFNO0lBQ05DLFlBQVk7SUFDWkMsTUFBTTtJQUNOQyxTQUFTO0lBQ1RDLFNBQVM7SUFDVEMsT0FBTztFQUNUO0FBRU8sTUFBTUMsUUFBUTs7SUFFbkJDLFNBQVM7RUFDWDtBQVVPLE1BQU1DLFNBQTJEO0lBQ3RFO01BQUVDLEtBQUs7TUFBUUMsTUFBTTtNQUFRQyxPQUFPMUIsRUFBRWU7SUFBSztJQUMzQztNQUFFUyxLQUFLO01BQWNDLE1BQU07TUFBY0MsT0FBTzFCLEVBQUVnQjtJQUFXO0lBQzdEO01BQUVRLEtBQUs7TUFBUUMsTUFBTTtNQUFRQyxPQUFPMUIsRUFBRWlCO0lBQUs7SUFDM0M7TUFBRU8sS0FBSztNQUFXQyxNQUFNO01BQVdDLE9BQU8xQixFQUFFa0I7SUFBUTtJQUNwRDtNQUFFTSxLQUFLO01BQVdDLE1BQU07TUFBV0MsT0FBTzFCLEVBQUVtQjtJQUFRO0lBQ3BEO01BQUVLLEtBQUs7TUFBU0MsTUFBTTtNQUFTQyxPQUFPMUIsRUFBRW9CO0lBQU07O0FBSXpDLE1BQU1PLFFBQW1CO0lBQzlCQyxvQkFBb0I7TUFDbEJDLE1BQU07TUFDTkMsT0FBTztNQUNQQyxPQUFPO1FBQUM7VUFBRUwsT0FBTzFCLEVBQUVHO1FBQU87UUFBRztVQUFFdUIsT0FBTzFCLEVBQUVFO1FBQUs7O0lBQy9DO0lBQ0E4QixRQUFRO0lBQ1JDLGFBQWFqQyxFQUFFUTtJQUNmMEIsY0FBYztJQUNkQyxXQUFXO01BQUVULE9BQU87TUFBdUJVLFlBQVk7TUFBSUMsU0FBUztJQUFFO0VBQ3hFO0FBR08sTUFBTUMsT0FBd0M7SUFDbkRULE1BQU07SUFDTkMsT0FBTztJQUNQQyxPQUFPO01BQ0w7UUFBRUwsT0FBTzFCLEVBQUVPO01BQU87TUFDbEI7UUFBRW1CLE9BQU8xQixFQUFFTTtNQUFLO01BQ2hCO1FBQUVvQixPQUFPMUIsRUFBRVE7TUFBTztNQUNsQjtRQUFFa0IsT0FBTzFCLEVBQUVNO01BQUs7O0VBRXBCO0FBR08sTUFBTWlDLE9BQWtCO0lBQzdCQyxVQUFVO0lBQ1ZDLFlBQVk7SUFDWkMsZUFBZTtJQUNmaEIsT0FBTzFCLEVBQUVNO0lBQ1RxQyxXQUFXO0VBQ2I7QUFLTyxNQUFNQyxlQUFlLENBQUM7QUFHdEIsTUFBTUMsTUFBTSxDQUFDQyxNQUNsQkMsS0FBS0MsSUFBSUYsQ0FBQUEsS0FBTSxPQUFPQyxLQUFLQyxJQUFJRixJQUFJQyxLQUFLRSxNQUFNSCxDQUFBQSxDQUFBQSxJQUFNLE9BQ2hEQyxLQUFLRSxNQUFNSCxDQUFBQSxFQUFHSSxTQUFRLElBQ3RCSixFQUFFSyxRQUFRLENBQUE7QUFFVCxNQUFNQyxTQUFTLENBQUNOLE1BQWVBLEtBQUssSUFBSSxJQUFJRCxJQUFJQyxDQUFBQSxDQUFBQSxLQUFPRCxJQUFJQyxDQUFBQTtBQUczRCxXQUFTTyxLQUFLQyxLQUFhQyxHQUFTO0FBQ3pDLFVBQU1ULElBQUlVLFNBQVNGLElBQUlHLE1BQU0sR0FBRyxDQUFBLEdBQUksRUFBQTtBQUNwQyxXQUNFLE1BQ0E7TUFBRVgsS0FBSyxLQUFNO01BQU1BLEtBQUssSUFBSztNQUFLQSxJQUFJO01BQ25DWSxJQUFJLENBQUNDLE1BQU9KLEtBQUssSUFBSUksS0FBSyxNQUFNQSxNQUFNSixJQUFJLEtBQUtJLElBQUlKLENBQUFBLEVBQ25ERyxJQUFJLENBQUNDLE1BQ0paLEtBQUtFLE1BQU1GLEtBQUthLElBQUksS0FBS2IsS0FBS2MsSUFBSSxHQUFHRixDQUFBQSxDQUFBQSxDQUFBQSxFQUNsQ1QsU0FBUyxFQUFBLEVBQ1RZLFNBQVMsR0FBRyxHQUFBLENBQUEsRUFFaEJDLEtBQUssRUFBQTtFQUVaO0FBR08sV0FBU0MsSUFBSUMsR0FBV0MsR0FBV0MsSUFBUztBQUNqRCxVQUFNQyxLQUFLLENBQUNkLFFBQUFBO0FBQ1YsWUFBTVIsSUFBSVUsU0FBU0YsSUFBSUcsTUFBTSxHQUFHLENBQUEsR0FBSSxFQUFBO0FBQ3BDLGFBQU87UUFBRVgsS0FBSyxLQUFNO1FBQU1BLEtBQUssSUFBSztRQUFLQSxJQUFJOztJQUMvQztBQUNBLFVBQU0sQ0FBQ3VCLEdBQUdDLENBQUFBLElBQUs7TUFBQ0YsR0FBR0gsQ0FBQUE7TUFBSUcsR0FBR0YsQ0FBQUE7O0FBQzFCLFdBQ0UsTUFDQUcsRUFDR1gsSUFBSSxDQUFDQyxHQUFHWSxNQUNQeEIsS0FBS0UsTUFBTVUsS0FBS1csRUFBRUMsQ0FBQUEsSUFBS1osS0FBS1EsRUFBQUEsRUFDekJqQixTQUFTLEVBQUEsRUFDVFksU0FBUyxHQUFHLEdBQUEsQ0FBQSxFQUVoQkMsS0FBSyxFQUFBO0VBRVo7OztBQ3pIQSxNQUFNUyxhQUFhO0FBV1osTUFBTUMsVUFNUDtJQUNKO01BQ0VDLEtBQUs7TUFDTEMsTUFBTTtNQUNOQyxNQUFNO01BQ05DLE9BQU9DLEVBQUVDO01BQ1RDLE1BQU07SUFDUjtJQUNBO01BQ0VOLEtBQUs7TUFDTEMsTUFBTTtNQUNOQyxNQUFNO01BQ05DLE9BQU9DLEVBQUVHO01BQ1RELE1BQU07SUFDUjtJQUNBO01BQ0VOLEtBQUs7TUFDTEMsTUFBTTtNQUNOQyxNQUFNO01BQ05DLE9BQU9DLEVBQUVJO01BQ1RGLE1BQU07SUFDUjtJQUNBO01BQUVOLEtBQUs7TUFBUUMsTUFBTTtNQUFRQyxNQUFNO01BQVlDLE9BQU9DLEVBQUVLO01BQU1ILE1BQU07SUFBTztJQUMzRTtNQUNFTixLQUFLO01BQ0xDLE1BQU07TUFDTkMsTUFBTTtNQUNOQyxPQUFPQyxFQUFFTTtNQUNUSixNQUFNO0lBQ1I7SUFDQTtNQUNFTixLQUFLO01BQ0xDLE1BQU07TUFDTkMsTUFBTTtNQUNOQyxPQUFPQyxFQUFFTztNQUNUTCxNQUFNO0lBQ1I7SUFDQTtNQUNFTixLQUFLO01BQ0xDLE1BQU07TUFDTkMsTUFBTTtNQUNOQyxPQUFPQyxFQUFFUTtNQUNUTixNQUFNO0lBQ1I7O0FBb0JLLE1BQU1PLFFBQWdCO0lBQzNCO01BQ0VDLElBQUk7TUFDSmIsTUFBTTtNQUNOYyxNQUFNO01BQ05DLE1BQU07TUFDTlYsTUFBTTtNQUNOVyxRQUFRO0lBQ1Y7SUFDQTtNQUNFSCxJQUFJO01BQ0piLE1BQU07TUFDTmMsTUFBTTtNQUNOQyxNQUFNO01BQ05WLE1BQU07TUFDTlcsUUFBUTtJQUNWO0lBQ0E7TUFDRUgsSUFBSTtNQUNKYixNQUFNO01BQ05jLE1BQU07TUFDTkMsTUFBTTtNQUNOVixNQUFNO01BQ05XLFFBQVE7SUFDVjtJQUNBO01BQ0VILElBQUk7TUFDSmIsTUFBTTtNQUNOYyxNQUFNO01BQ05DLE1BQU07TUFDTlYsTUFBTTtNQUNOVyxRQUFRO0lBQ1Y7SUFDQTtNQUNFSCxJQUFJO01BQ0piLE1BQU07TUFDTmMsTUFBTTtNQUNOQyxNQUFNO01BQ05WLE1BQU07TUFDTlcsUUFBUTtJQUNWO0lBQ0E7TUFDRUgsSUFBSTtNQUNKYixNQUFNO01BQ05jLE1BQU07TUFDTkMsTUFBTTtNQUNOVixNQUFNO01BQ05XLFFBQVE7SUFDVjtJQUNBO01BQ0VILElBQUk7TUFDSmIsTUFBTTtNQUNOYyxNQUFNO01BQ05DLE1BQU07TUFDTlYsTUFBTTtNQUNOVyxRQUFRO0lBQ1Y7SUFDQTtNQUNFSCxJQUFJO01BQ0piLE1BQU07TUFDTmMsTUFBTTtNQUNOQyxNQUFNO01BQ05WLE1BQU07TUFDTlcsUUFBUTtJQUNWO0lBQ0E7TUFDRUgsSUFBSTtNQUNKYixNQUFNO01BQ05jLE1BQU07TUFDTkMsTUFBTTtNQUNOVixNQUFNO01BQ05XLFFBQVE7SUFDVjtJQUNBO01BQ0VILElBQUk7TUFDSmIsTUFBTTtNQUNOYyxNQUFNO01BQ05DLE1BQU07TUFDTlYsTUFBTTtNQUNOVyxRQUFRO0lBQ1Y7SUFDQTtNQUNFSCxJQUFJO01BQ0piLE1BQU07TUFDTmMsTUFBTTtNQUNOQyxNQUFNO01BQ05WLE1BQU07TUFDTlcsUUFBUTtJQUNWO0lBQ0E7TUFDRUgsSUFBSTtNQUNKYixNQUFNO01BQ05jLE1BQU07TUFDTkMsTUFBTTtNQUNOVixNQUFNO01BQ05XLFFBQVE7SUFDVjtJQUNBO01BQ0VILElBQUk7TUFDSmIsTUFBTTtNQUNOYyxNQUFNO01BQ05DLE1BQU07TUFDTlYsTUFBTTtNQUNOVyxRQUFRO0lBQ1Y7SUFDQTtNQUNFSCxJQUFJO01BQ0piLE1BQU07TUFDTmMsTUFBTTtNQUNOQyxNQUFNO01BQ05WLE1BQU07TUFDTlcsUUFBUTtJQUNW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LE9BQU9nRTtZQUNQN0QsUUFBUWdFO2VBRVJwRCxXQUFXLFlBQ2IseUNBQUFkLEtBQUNpRyxTQUFBQTtZQUNDSCxLQUFLOUUsS0FBS1g7WUFDVmI7WUFDQWU7WUFDQVIsT0FBT2dFO1lBQ1A3RCxRQUFRZ0U7ZUFHVix5Q0FBQWxFLEtBQUNrRyxVQUFBQTtZQUFTSixLQUFLOUUsS0FBS1Y7WUFBVWQ7WUFBY2U7OztRQUlsRCx5Q0FBQVAsS0FBQ21HLFFBQUFBO1VBQU81RjtVQUFZcUIsUUFBUUEsT0FBT0c7VUFBSXFFLEtBQUtDLE9BQU83RyxPQUFPZSxJQUFBQSxFQUFNNkY7Ozs7RUFHdEU7OztBRHRPQUUsZ0NBQU0seUNBQUFDLEtBQUNDLEtBQUFBLENBQUFBLENBQUFBLENBQUFBOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfYmV2eV9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiZW1pdCIsICJuYW1lIiwgInZhbHVlIiwgInJhd0VtaXQiLCAicmVxdWVzdCIsICJyYXdSZXF1ZXN0IiwgIm9uIiwgImNiIiwgInJhd0FkZEV2ZW50TGlzdGVuZXIiLCAicmF3UmVtb3ZlRXZlbnRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImJldnkiLCAiYWRkRXZlbnRMaXN0ZW5lciIsICJnYW1lcGFkIiwgImdldEFsbCIsICJydW1ibGUiLCAic3RvcFJ1bWJsZSIsICJtYXAiLCAiZm9jdXMiLCAianVtcCIsICJsZW5zIiwgInNlbGVjdCIsICJ3b3JsZCIsICJ3aW5kb3ciLCAic2l6ZSIsICJFUkFTIiwgIm5hbWUiLCAiY29sdW1ucyIsICJ0IiwgImlkIiwgImNvbCIsICJyb3ciLCAicmVxdWlyZXMiLCAiaWNvbiIsICJ1bmxvY2tzIiwgImJvb3N0IiwgImNvc3QiLCAibWFwIiwgIlRFQ0hTIiwgInRlY2giLCAiZmluZCIsICJTVEFSVElOR19URUNIUyIsICJmaWx0ZXIiLCAiaW5jbHVkZXMiLCAiQ0lWSUNTIiwgIkMiLCAiaW5rIiwgIm5hdnkiLCAibmF2eUhpIiwgInNsYXRlIiwgInNsYXRlSGkiLCAiZ29sZCIsICJnb2xkSGkiLCAiZ29sZExvIiwgImdvbGRMaW5lIiwgInRleHQiLCAibXV0ZWQiLCAiZmFpbnQiLCAiZ29vZCIsICJiYWQiLCAiZm9vZCIsICJwcm9kdWN0aW9uIiwgImNvaW4iLCAic2NpZW5jZSIsICJjdWx0dXJlIiwgImZhaXRoIiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiWUlFTERTIiwgImtleSIsICJuYW1lIiwgImNvbG9yIiwgInBhbmVsIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJib3JkZXJSYWRpdXMiLCAiYm94U2hhZG93IiwgImJsdXJSYWRpdXMiLCAieU9mZnNldCIsICJnaWx0IiwgImNhcHMiLCAiZm9udFNpemUiLCAiZm9udFdlaWdodCIsICJsZXR0ZXJTcGFjaW5nIiwgImxpbmVCcmVhayIsICJPV05TX1BPSU5URVIiLCAiZm10IiwgIm4iLCAiTWF0aCIsICJhYnMiLCAicm91bmQiLCAidG9TdHJpbmciLCAidG9GaXhlZCIsICJzaWduZWQiLCAidG9uZSIsICJoZXgiLCAiayIsICJwYXJzZUludCIsICJzbGljZSIsICJtYXAiLCAiYyIsICJtaW4iLCAibWF4IiwgInBhZFN0YXJ0IiwgImpvaW4iLCAibWl4IiwgImEiLCAiYiIsICJ0IiwgImNoIiwgIngiLCAieSIsICJpIiwgIlNUQVJUX1RVUk4iLCAiTUVUUklDUyIsICJrZXkiLCAibmFtZSIsICJ1bml0IiwgImNvbG9yIiwgIkMiLCAiZ29sZEhpIiwgImljb24iLCAic2NpZW5jZSIsICJjdWx0dXJlIiwgImNvaW4iLCAiZmFpdGgiLCAiYmFkIiwgImZvb2QiLCAiSVRFTVMiLCAiaWQiLCAia2luZCIsICJjb3N0IiwgImVmZmVjdCIsICJpdGVtIiwgImZpbmQiLCAiaSIsICJjaXZpY0Nvc3QiLCAibiIsICJybmciLCAic2VlZCIsICJ0IiwgIk1hdGgiLCAiaW11bCIsICJzZWVkT2YiLCAicyIsICJyZWR1Y2UiLCAiaCIsICJjaCIsICJjaGFyQ29kZUF0IiwgInRvdGFscyIsICJjaXRpZXMiLCAiY2l2IiwgInN1bSIsICJwcm9kdWN0aW9uIiwgImdvbGQiLCAicG9wdWxhdGlvbiIsICJjIiwgImZpbHRlciIsICJrIiwgInlpZWxkcyIsICJjdXJ2ZSIsICJmaW5hbCIsICJ0dXJucyIsICJ3b2JibGUiLCAiciIsICJyYXciLCAiZHJpZnQiLCAicHVzaCIsICJwb3ciLCAibGVuZ3RoIiwgIm1hcCIsICJ2IiwgInNjb3JlIiwgIm1pbGl0YXJ5IiwgImhpc3RvcnkiLCAid29ybGQiLCAibWF4IiwgIl8iLCAibmV3R2FtZSIsICJidWlsZGluZyIsICJidWlsdCIsICJtaW5lIiwgImNpdnMiLCAiZm9yRWFjaCIsICJvd25lZCIsICJjYXBpdGFsIiwgInNsaWNlIiwgIm5leHQiLCAiaXQiLCAiaW5jbHVkZXMiLCAicHJvZ3Jlc3MiLCAiZmxvb3IiLCAidHVybiIsICJyZXNlYXJjaCIsICJyZXNlYXJjaGVkIiwgIlNUQVJUSU5HX1RFQ0hTIiwgIm1hY2hpbmVyeSIsICJyb3VuZCIsICJ0ZWNoIiwgImNpdmljIiwgImNpdmljUHJvZ3Jlc3MiLCAiT2JqZWN0IiwgImZyb21FbnRyaWVzIiwgIm5vdGVzIiwgInRpdGxlIiwgImJvZHkiLCAibmV4dE5vdGUiLCAiaW5jb21lIiwgImdhbWUiLCAibGFzdCIsICJtIiwgImxlZGdlciIsICJwbGF5ZXIiLCAiZmxhdE1hcCIsICJzb3VyY2VzIiwgInZhbHVlIiwgInVwa2VlcCIsICJiIiwgInVuaXRzIiwgInUiLCAieHMiLCAieCIsICJuZXQiLCAiUlVNT1JTIiwgInN0ZXAiLCAiYWN0aW9uIiwgInR5cGUiLCAiY2l0eSIsICJuZXh0VHVybiIsICJnIiwgImVudHJpZXMiLCAicGF5IiwgImJhbmtlZCIsICJkb25lIiwgIkNJVklDUyIsICJub3ciLCAieWVhciIsICJ5IiwgImxlZnQiLCAic3BhbiIsICJJbmZpbml0eSIsICJtaW4iLCAicGx1cmFsIiwgIndvcmQiLCAidHVybnNMZWZ0IiwgInJhdGUiLCAiY2VpbCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJ1c2VXaW5kb3dTaXplIiwgInNpemUiLCAic2V0U2l6ZSIsICJ1c2VTdGF0ZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAidXNlRWZmZWN0IiwgImJldnkiLCAid2luZG93IiwgInRoZW4iLCAiY2F0Y2giLCAib24iLCAidXNlRXZlbnQiLCAibmFtZSIsICJydW4iLCAibGF0ZXN0IiwgInVzZVJlZiIsICJjdXJyZW50IiwgInZhbHVlIiwgInVzZURlYnVnIiwgInZlcmIiLCAiYWN0aW9uIiwgImhlYWQiLCAicmVzdCIsICJzcGxpdCIsICJqb2luIiwgInVzZVNsaWRlSW4iLCAieCIsICJ5IiwgImR1cmF0aW9uIiwgInQiLCAidXNlU2hhcmVkVmFsdWUiLCAid2l0aFRpbWluZyIsICJlYXNpbmciLCAidHJhbnNmb3JtIiwgInRyYW5zbGF0ZVgiLCAiYW5pbWF0ZWQiLCAiaW50ZXJwb2xhdGUiLCAidHJhbnNsYXRlWSIsICJ1c2VGYWRlSW4iLCAib3BhY2l0eSIsICJzY2FsZSIsICJJQ09OUyIsICJzY2llbmNlIiwgImMiLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgIl9qc3giLCAicGF0aCIsICJkIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgInN0cm9rZUxpbmVjYXAiLCAic3Ryb2tlTGluZWpvaW4iLCAiY3VsdHVyZSIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJnb2xkIiwgInJlY3QiLCAieCIsICJ5IiwgIndpZHRoIiwgImhlaWdodCIsICJmYWl0aCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJzdGFyIiwgImZvb2QiLCAiZWxsaXBzZSIsICJyeCIsICJyeSIsICJtYXAiLCAiZyIsICJ0cmFuc2Zvcm0iLCAicHJvZHVjdGlvbiIsICJob3VzaW5nIiwgImFtZW5pdGllcyIsICJzdHJlbmd0aCIsICJtb3ZlbWVudCIsICJib3ciLCAiZXllIiwgImZsYWciLCAiY2l0eSIsICJib29rIiwgImNhc3RsZSIsICJvYmVsaXNrIiwgImFuY2hvciIsICJ0cm9waHkiLCAiY2hhcnQiLCAicGVyc29uIiwgInNoaWVsZCIsICJtb29uIiwgInNraXAiLCAiYXJyb3ciLCAidHJhc2giLCAiY2hlY2siLCAiY2xvc2UiLCAibWVudSIsICJsb2NrIiwgIm91dGVyIiwgImlubmVyIiwgIm4iLCAicHRzIiwgImkiLCAiYSIsICJNYXRoIiwgIlBJIiwgInB1c2giLCAiY29zIiwgInNpbiIsICJJY29uIiwgIm5hbWUiLCAic2l6ZSIsICJjb2xvciIsICJzdmciLCAidmlld0JveCIsICJzdHlsZSIsICJmbGV4U2hyaW5rIiwgImltcG9ydF9yZWFjdCIsICJjb25pYyIsICJwcm9ncmVzcyIsICJjb2xvciIsICJkZWciLCAiTWF0aCIsICJtYXgiLCAibWluIiwgInRyYWNrIiwgInR5cGUiLCAic3RvcHMiLCAiYW5nbGUiLCAicmFkaWFsIiwgImlubmVyIiwgIm91dGVyIiwgIk1lZGFsbGlvbiIsICJzaXplIiwgIkMiLCAic2xhdGVIaSIsICJuYXZ5IiwgInJpbmciLCAic2NpZW5jZSIsICJjaGlsZHJlbiIsICJzdHlsZSIsICJyIiwgImZyYW1lIiwgInJvdW5kIiwgImZhY2UiLCAiX2pzeCIsICJub2RlIiwgImZsZXhHcm93IiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZmxleFNocmluayIsICJnaWx0IiwgInBhZGRpbmciLCAidW5kZWZpbmVkIiwgIlJvdW5kQnV0dG9uIiwgImljb24iLCAiZ29sZEhpIiwgInRpcCIsICJ0aXBTaWRlIiwgImFjdGl2ZSIsICJvbkNsaWNrIiwgImhvdmVyIiwgInNldEhvdmVyIiwgInVzZVN0YXRlIiwgIl9qc3hzIiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJvblBvaW50ZXJMZWF2ZSIsICJib3hTaGFkb3ciLCAiYmx1clJhZGl1cyIsICJ5T2Zmc2V0IiwgImhvdmVyU3R5bGUiLCAicHJlc3NTdHlsZSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAic2xhdGUiLCAiSWNvbiIsICJuYW1lIiwgIlRpcCIsICJ0ZXh0IiwgInNpZGUiLCAib2Zmc2V0IiwgInBsYWNlIiwgInJpZ2h0IiwgInRvcCIsICJ0cmFuc2xhdGVZIiwgImxlZnQiLCAidHJhbnNsYXRlWCIsICJib3R0b20iLCAicG9zaXRpb25UeXBlIiwgImhvcml6b250YWwiLCAidmVydGljYWwiLCAiYmFja2dyb3VuZENvbG9yIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkTG8iLCAiZ2xvYmFsWkluZGV4IiwgImZvbnRTaXplIiwgImxpbmVCcmVhayIsICJIZWFkZXIiLCAiZ29sZCIsICJydWxlIiwgImdvbGRMaW5lIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImNhcHMiLCAidG9VcHBlckNhc2UiLCAiQmFyIiwgInZhbHVlIiwgInRyYW5zaXRpb24iLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgIkFtb3VudCIsICJmb250V2VpZ2h0IiwgIkNsb3NlQnV0dG9uIiwgIkNyZXN0IiwgImNpdiIsICJ0b25lIiwgImZvbnRGYW1pbHkiLCAiRm9udHMiLCAiZGlzcGxheSIsICJ0ZXh0U2hhZG93IiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJXSURUSCIsICJDaXR5UGFuZWwiLCAiY2l0eSIsICJjaXYiLCAiZ2FtZSIsICJkaXNwYXRjaCIsICJvbkNsb3NlIiwgImVudGVyIiwgInVzZVNsaWRlSW4iLCAibWluZSIsICJwbGF5ZXIiLCAic3VycGx1cyIsICJ5aWVsZHMiLCAiZm9vZCIsICJwb3B1bGF0aW9uIiwgImJ1aWx0IiwgImlkIiwgImhvdXNpbmciLCAiaW5jbHVkZXMiLCAiYW1lbml0aWVzIiwgImNhcGl0YWwiLCAidW5oYXBweSIsICJNYXRoIiwgImNlaWwiLCAiZ3Jvd3RoIiwgInR1cm4iLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJwYW5lbCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAiYm90dG9tIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAiaG92ZXJTdHlsZSIsICJPV05TX1BPSU5URVIiLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImJvcmRlclJhZGl1cyIsICJyaWdodCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJjb2xvciIsICJ0b25lIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJDIiwgImdvbGQiLCAiX2pzeCIsICJNZWRhbGxpb24iLCAic2l6ZSIsICJpbm5lciIsICJzbGF0ZSIsICJvdXRlciIsICJpbmsiLCAicHJvZ3Jlc3MiLCAicmluZyIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImZvbnRXZWlnaHQiLCAiZmxleEdyb3ciLCAiSWNvbiIsICJuYW1lIiwgImdvbGRIaSIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAibGV0dGVyU3BhY2luZyIsICJ0ZXh0U2hhZG93IiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJ0b1VwcGVyQ2FzZSIsICJDbG9zZUJ1dHRvbiIsICJvbkNsaWNrIiwgImp1c3RpZnlDb250ZW50IiwgImJhY2tncm91bmRDb2xvciIsICJZSUVMRFMiLCAibWFwIiwgInkiLCAia2V5IiwgInNpZ25lZCIsICJTdGF0IiwgImljb24iLCAibGFiZWwiLCAidmFsdWUiLCAicGx1cmFsIiwgIm1heCIsICJmaWxsIiwgImdvb2QiLCAiYmFkIiwgIm1pbiIsICJtdXRlZCIsICJ0aWxlcyIsICJQcm9kdWN0aW9uIiwgInVuZGVmaW5lZCIsICJCYXIiLCAibm93IiwgImJ1aWxkaW5nIiwgImN1cnJlbnQiLCAiaXRlbSIsICJyYXRlIiwgInByb2R1Y3Rpb24iLCAiZ3JvdXBzIiwgImtpbmQiLCAiaXRlbXMiLCAiSVRFTVMiLCAiZmlsdGVyIiwgImkiLCAiZmxleFNocmluayIsICJtaW5IZWlnaHQiLCAiSGVhZGVyIiwgImNvc3QiLCAidHVybnNMZWZ0IiwgImZtdCIsICJsZW5ndGgiLCAiZmxleFdyYXAiLCAib3ZlcmZsb3dZIiwgInNjcm9sbGJhciIsICJ0aGlja25lc3MiLCAicG9zaXRpb24iLCAidGh1bWIiLCAiZ29sZExvIiwgImciLCAibWFyZ2luIiwgImNhcHMiLCAiaXQiLCAiQ2hvaWNlIiwgInR1cm5zIiwgImFjdGl2ZSIsICJidXR0b24iLCAic2xhdGVIaSIsICJoZWlnaHQiLCAiZWZmZWN0IiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJNQVBfVyIsICJNQVBfSCIsICJNYXRoIiwgInJvdW5kIiwgIkFjdGlvblBhbmVsIiwgImxhYmVsIiwgImJ1c3kiLCAibGVucyIsICJvbk5leHQiLCAib25MZW5zIiwgImp1bXAiLCAiZSIsICJiZXZ5IiwgIm1hcCIsICJ1IiwgIngiLCAidiIsICJ5IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgInJpZ2h0IiwgImJvdHRvbSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAibWFyZ2luIiwgIl9qc3giLCAicGFuZWwiLCAiaGVpZ2h0IiwgInBhZGRpbmciLCAibGVmdCIsICJib3JkZXJSYWRpdXMiLCAiaG92ZXJTdHlsZSIsICJPV05TX1BPSU5URVIiLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFdlaWdodCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImNvbG9yIiwgIkMiLCAiZ29sZEhpIiwgIkVuZFR1cm4iLCAib25DbGljayIsICJnYXAiLCAiUm91bmRCdXR0b24iLCAiaWNvbiIsICJzaXplIiwgInRpcCIsICJ0aXBTaWRlIiwgImFjdGl2ZSIsICJjYXBzIiwgIm11dGVkIiwgInBvcnRhbCIsICJ0YXJnZXQiLCAib25Qb2ludGVyRG93biIsICJvblBvaW50ZXJNb3ZlIiwgIndpZHRoIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkTG8iLCAiY3Vyc29yIiwgInNwaW4iLCAidXNlU2hhcmVkVmFsdWUiLCAiZ2xvdyIsICJzZXRHbG93IiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ3aXRoUmVwZWF0IiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiYnV0dG9uIiwgIm9uUG9pbnRlckVudGVyIiwgIm9uUG9pbnRlckxlYXZlIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJnaWx0IiwgImJveFNoYWRvdyIsICJibHVyUmFkaXVzIiwgInlPZmZzZXQiLCAicHJlc3NTdHlsZSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAiZmxleEdyb3ciLCAidHlwZSIsICJzdG9wcyIsICJyb3RhdGUiLCAiYW5pbWF0ZWQiLCAianVzdGlmeUNvbnRlbnQiLCAicmFkaWFsIiwgIkljb24iLCAibmFtZSIsICJNT1ZFIiwgImljb24iLCAibmFtZSIsICJGT1JUSUZZIiwgIlNMRUVQIiwgIlNLSVAiLCAiREVMRVRFIiwgIlVOSVRTIiwgIndhcnJpb3IiLCAicm9sZSIsICJzdHJlbmd0aCIsICJtb3ZlcyIsICJvcmRlcnMiLCAiYXJjaGVyIiwgInJhbmdlZCIsICJzY291dCIsICJzZXR0bGVyIiwgImJ1aWxkZXIiLCAiVW5pdFBhbmVsIiwgInVuaXQiLCAiY2l2IiwgIm9uQ2xvc2UiLCAiZGVmIiwgImtpbmQiLCAiZW50ZXIiLCAidXNlU2xpZGVJbiIsICJtaW5lIiwgInBsYXllciIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgInBhbmVsIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgImJvdHRvbSIsICJ3aWR0aCIsICJwYWRkaW5nIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImhvdmVyU3R5bGUiLCAiT1dOU19QT0lOVEVSIiwgImFsaWduSXRlbXMiLCAiX2pzeCIsICJNZWRhbGxpb24iLCAic2l6ZSIsICJpbm5lciIsICJ0b25lIiwgImNvbG9yIiwgIm91dGVyIiwgIkljb24iLCAiZmxleEdyb3ciLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFdlaWdodCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgIkMiLCAiZ29sZEhpIiwgInRvVXBwZXJDYXNlIiwgIkNsb3NlQnV0dG9uIiwgIm9uQ2xpY2siLCAibXV0ZWQiLCAibWFyZ2luIiwgInRvcCIsICJBbW91bnQiLCAidmFsdWUiLCAiQmFyIiwgImhlaWdodCIsICJnb29kIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkTGluZSIsICJqdXN0aWZ5Q29udGVudCIsICJtYXAiLCAibyIsICJSb3VuZEJ1dHRvbiIsICJ0aXAiLCAidGlwU2lkZSIsICJBTkNIT1JfU0NBTElORyIsICJiYXNlRGlzdGFuY2UiLCAiZmFjdG9yIiwgIm1pbiIsICJtYXgiLCAiQmFubmVycyIsICJ3b3JsZCIsICJnYW1lIiwgInNlbGVjdGlvbiIsICJvblNlbGVjdCIsICJjaXYiLCAiaWQiLCAiY2l2cyIsICJmaW5kIiwgImMiLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgImNpdGllcyIsICJtYXAiLCAiY2l0eSIsICJfanN4IiwgIkNpdHlCYW5uZXIiLCAic2VsZWN0ZWQiLCAia2luZCIsICJvbkNsaWNrIiwgInVuaXRzIiwgImZpbHRlciIsICJ1IiwgImhpZGRlbiIsICJ1bml0IiwgIlVuaXRGbGFnIiwgInByb2R1Y2luZyIsICJidWlsZGluZyIsICJpdCIsICJpdGVtIiwgImdyb3d0aCIsICJ0dXJuIiwgInBvcHVsYXRpb24iLCAiYW5jaG9yIiwgImVudGl0eSIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiaGVpZ2h0IiwgInNjYWxlIiwgIm5vZGUiLCAid2lkdGgiLCAiYm9yZGVyUmFkaXVzIiwgInBhZGRpbmciLCAibWFyZ2luIiwgInJpZ2h0IiwgImJhY2tncm91bmRHcmFkaWVudCIsICJjb25pYyIsICJDIiwgImZvb2QiLCAiekluZGV4IiwgImZsZXhHcm93IiwgImp1c3RpZnlDb250ZW50IiwgImJhY2tncm91bmRDb2xvciIsICJpbmsiLCAidGV4dCIsICJmb250U2l6ZSIsICJmb250V2VpZ2h0IiwgImNvbG9yIiwgImJ1dHRvbiIsICJnYXAiLCAibGVmdCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiZ29sZEhpIiwgInRvbmUiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJib3hTaGFkb3ciLCAiYmx1clJhZGl1cyIsICJ5T2Zmc2V0IiwgImhvdmVyU3R5bGUiLCAiY2FwaXRhbCIsICJJY29uIiwgIm5hbWUiLCAic2l6ZSIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAibGV0dGVyU3BhY2luZyIsICJ0ZXh0U2hhZG93IiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJ0b1VwcGVyQ2FzZSIsICJwcm9ncmVzcyIsICJjb3N0IiwgInByb2R1Y3Rpb24iLCAiaWNvbiIsICJwb3NpdGlvblR5cGUiLCAidG9wIiwgImhvcml6b250YWwiLCAidHVybnNMZWZ0IiwgInlpZWxkcyIsICJvZmZzZXQiLCAicmFkaWFsIiwgInRyYW5zZm9ybSIsICJVTklUUyIsICJGRUFUVVJFUyIsICJ3b29kcyIsICJyYWluZm9yZXN0IiwgIlRpbGVUb29sdGlwIiwgInRpbGUiLCAiY3Vyc29yIiwgIm93bmVyIiwgInJlbGllZiIsICJtb3VudGFpbnMiLCAiaGlsbHMiLCAidGVycmFpbiIsICJmZWF0dXJlIiwgIkJvb2xlYW4iLCAiam9pbiIsICJZSUVMRFMiLCAieSIsICJrZXkiLCAiZ2xvYmFsWkluZGV4IiwgInBhbmVsIiwgImJvdHRvbSIsICJ2ZXJ0aWNhbCIsICJ1bmRlZmluZWQiLCAibmF2eSIsICJyZXZlYWxlZCIsICJtdXRlZCIsICJsaW5lQnJlYWsiLCAiZm10IiwgImZhcm0iLCAiaW1wb3J0X3JlYWN0IiwgIk1PT0RTIiwgIm5hbWUiLCAiY29sb3IiLCAiQyIsICJnb29kIiwgIm5vdGUiLCAiY29pbiIsICJiYWQiLCAibXV0ZWQiLCAiTGVhZGVycyIsICJyaXZhbHMiLCAiZ2FtZSIsICJvbk9wZW4iLCAiX2pzeCIsICJub2RlIiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJyaWdodCIsICJ0b3AiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAibWFwIiwgImNpdiIsICJpIiwgInNjb3JlIiwgImhpc3RvcnkiLCAiaWQiLCAiTGVhZGVyIiwgIm1vb2QiLCAibGVuZ3RoIiwgIk1hdGgiLCAicm91bmQiLCAib25DbGljayIsICJob3ZlciIsICJzZXRIb3ZlciIsICJ1c2VTdGF0ZSIsICJfanN4cyIsICJidXR0b24iLCAib25Qb2ludGVyRW50ZXIiLCAib25Qb2ludGVyTGVhdmUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImFsaWduSXRlbXMiLCAiaG92ZXJTdHlsZSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAiQ3Jlc3QiLCAic2l6ZSIsICJsZWZ0IiwgImJvcmRlclJhZGl1cyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAibmF2eSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAicGFuZWwiLCAicGFkZGluZyIsICJnbG9iYWxaSW5kZXgiLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFdlaWdodCIsICJmb250U2l6ZSIsICJnb2xkSGkiLCAibGVhZGVyIiwgIm1hcmdpbiIsICJpbXBvcnRfcmVhY3QiLCAiTm90aWZpY2F0aW9ucyIsICJub3RlcyIsICJvbkRpc21pc3MiLCAiX2pzeCIsICJub2RlIiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJyaWdodCIsICJ0b3AiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJtYXAiLCAibiIsICJOb3RpY2UiLCAibm90ZSIsICJpZCIsICJob3ZlciIsICJzZXRIb3ZlciIsICJ1c2VTdGF0ZSIsICJlbnRlciIsICJ1c2VTbGlkZUluIiwgIl9qc3hzIiwgInRyYW5zaXRpb24iLCAibGF5b3V0IiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJwYW5lbCIsICJ0cmFuc2Zvcm0iLCAidHJhbnNsYXRlWSIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAidmVydGljYWwiLCAidGV4dCIsICJmb250U2l6ZSIsICJmb250V2VpZ2h0IiwgImNvbG9yIiwgInRpdGxlIiwgIkMiLCAibGluZUJyZWFrIiwgImJvZHkiLCAiYnV0dG9uIiwgIm9uQ2xpY2siLCAib25Qb2ludGVyRW50ZXIiLCAib25Qb2ludGVyTGVhdmUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAiZ2lsdCIsICJib3hTaGFkb3ciLCAiYmx1clJhZGl1cyIsICJ5T2Zmc2V0IiwgImhvdmVyU3R5bGUiLCAic2NhbGUiLCAiZmxleEdyb3ciLCAianVzdGlmeUNvbnRlbnQiLCAicmFkaWFsIiwgInNsYXRlSGkiLCAiaW5rIiwgIkljb24iLCAibmFtZSIsICJpY29uIiwgInNpemUiLCAiaW1wb3J0X3JlYWN0IiwgIlRvcEJhciIsICJnYW1lIiwgInBsYXllciIsICJuZXQiLCAicGF5IiwgImluY29tZSIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInJpZ2h0IiwgInRvcCIsICJoZWlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAiY29sb3IiLCAiYm9yZGVyIiwgImJvdHRvbSIsICJib3JkZXJDb2xvciIsICJDIiwgImdvbGRMbyIsICJib3hTaGFkb3ciLCAiYmx1clJhZGl1cyIsICJ5T2Zmc2V0IiwgImhvdmVyU3R5bGUiLCAiT1dOU19QT0lOVEVSIiwgIl9qc3giLCAiQW1vdW50IiwgImljb24iLCAic2NpZW5jZSIsICJ2YWx1ZSIsICJzaWduZWQiLCAiY3VsdHVyZSIsICJjb2luIiwgIk1hdGgiLCAiZmxvb3IiLCAiZ29sZCIsICJmYWl0aCIsICJmbGV4R3JvdyIsICJ0ZXh0IiwgImNhcHMiLCAiZm9udEZhbWlseSIsICJGb250cyIsICJkaXNwbGF5IiwgImZvbnRTaXplIiwgImdvbGRIaSIsICJ0dXJuIiwgInllYXIiLCAiQ2xvY2siLCAibm93IiwgInNldE5vdyIsICJ1c2VTdGF0ZSIsICJEYXRlIiwgInVzZUVmZmVjdCIsICJpZCIsICJzZXRJbnRlcnZhbCIsICJjbGVhckludGVydmFsIiwgImhoIiwgImdldEhvdXJzIiwgInRvU3RyaW5nIiwgInBhZFN0YXJ0IiwgIm1tIiwgImdldE1pbnV0ZXMiLCAibXV0ZWQiLCAiTGF1bmNoQmFyIiwgIm9uT3BlbiIsICJyZXNlYXJjaCIsICJ2ZXJ0aWNhbCIsICJib3JkZXJSYWRpdXMiLCAiUm91bmRCdXR0b24iLCAidGlwIiwgImFjdGl2ZSIsICJvbkNsaWNrIiwgIldJRFRIIiwgIlRyYWNrZXJzIiwgImdhbWUiLCAicGxheWVyIiwgIm9uUmVzZWFyY2giLCAicGF5IiwgImluY29tZSIsICJyZXNlYXJjaCIsICJ0ZWNoIiwgImJhbmtlZCIsICJwcm9ncmVzcyIsICJpZCIsICJjaXZpY05hbWUiLCAiQ0lWSUNTIiwgImNpdmljIiwgImxlbmd0aCIsICJjaXZpY05lZWQiLCAiY2l2aWNDb3N0IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgIl9qc3giLCAiVHJhY2tlciIsICJ0aXRsZSIsICJjb2xvciIsICJDIiwgInNjaWVuY2UiLCAiaWNvbiIsICJuYW1lIiwgImNvc3QiLCAiZGV0YWlsIiwgInBsdXJhbCIsICJ0dXJuc0xlZnQiLCAiaGludCIsICJib29zdCIsICJvbkNsaWNrIiwgImN1bHR1cmUiLCAiY2l2aWNQcm9ncmVzcyIsICJwYW5lbCIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAiYm90dG9tIiwgImhvdmVyU3R5bGUiLCAiYm9yZGVyQ29sb3IiLCAiZ29sZCIsICJPV05TX1BPSU5URVIiLCAiSGVhZGVyIiwgImFsaWduSXRlbXMiLCAiTWVkYWxsaW9uIiwgInNpemUiLCAicmluZyIsICJJY29uIiwgInRleHQiLCAiZm9udFNpemUiLCAiZm9udFdlaWdodCIsICJtdXRlZCIsICJSQU5LSU5HX1RBQlMiLCAiVklDVE9SSUVTIiwgInRhYiIsICJpY29uIiwgImNvbG9yIiwgIkMiLCAic2NpZW5jZSIsICJnb2FsIiwgImN1bHR1cmUiLCAiYmFkIiwgImZhaXRoIiwgImNvaW4iLCAic3RhbmRpbmdzIiwgIndvcmxkIiwgImdhbWUiLCAic2NpIiwgImMiLCAiaGlzdG9yeSIsICJpZCIsICJhdCIsICJtaW5lIiwgImNpdnMiLCAibWFwIiwgImNpdiIsICJpIiwgInIiLCAicm5nIiwgInN1bSIsICJ0b3RhbHMiLCAiY2l0aWVzIiwgImtub3duIiwgInBsYXllciIsICJyZXNlYXJjaGVkIiwgImxlbmd0aCIsICJNYXRoIiwgIm1pbiIsICJURUNIUyIsICJyb3VuZCIsICJwcm9ncmVzcyIsICJub3RlIiwgInZpc2l0aW5nIiwgIm5lZWQiLCAiZmxvb3IiLCAicG9pbnRzIiwgIlJhbmtpbmdzIiwgInYiLCAiZmluZCIsICJyb3dzIiwgInNvcnQiLCAiYSIsICJiIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiZmxleERpcmVjdGlvbiIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAidmVydGljYWwiLCAiZ2FwIiwgImFsaWduSXRlbXMiLCAiX2pzeCIsICJNZWRhbGxpb24iLCAic2l6ZSIsICJyaW5nIiwgIkljb24iLCAibmFtZSIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRm9udHMiLCAiZGlzcGxheSIsICJmb250V2VpZ2h0IiwgImZvbnRTaXplIiwgImdvbGRIaSIsICJ0b1VwcGVyQ2FzZSIsICJtdXRlZCIsICJzIiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImdvbGRMaW5lIiwgIndpZHRoIiwgImdvbGQiLCAiQ3Jlc3QiLCAibGVhZGVyIiwgIkJhciIsICJ2YWx1ZSIsICJoZWlnaHQiLCAiYWxsIiwgInNjb3JlIiwgImNhcHMiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9yZWFjdCIsICJQQUQiLCAibGVmdCIsICJyaWdodCIsICJ0b3AiLCAiYm90dG9tIiwgIkdSSUQiLCAiU1VSRkFDRSIsICJ0aWNrcyIsICJtYXgiLCAicmF3IiwgIk1hdGgiLCAibWFnIiwgInBvdyIsICJmbG9vciIsICJsb2cxMCIsICJzdGVwIiwgIm1hcCIsICJtIiwgImZpbmQiLCAicyIsICJvdXQiLCAidiIsICJwdXNoIiwgImNvbXBhY3QiLCAicm91bmQiLCAidG9GaXhlZCIsICJmbXQiLCAiQXhlcyIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZ3JpZCIsICJmaXJzdCIsICJjb3VudCIsICJwbG90VyIsICJwbG90SCIsICJldmVyeSIsICJ0dXJucyIsICJ0IiwgImNlaWwiLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgIl9qc3giLCAidGV4dCIsICJzdHlsZSIsICJwb3NpdGlvblR5cGUiLCAidGV4dEFsaWduIiwgImZvbnRTaXplIiwgImNvbG9yIiwgIkMiLCAiZmFpbnQiLCAiZ3JpZExpbmVzIiwgInkiLCAibGluZSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAiTGluZUNoYXJ0IiwgInNlcmllcyIsICJob3ZlciIsICJzZXRIb3ZlciIsICJ1c2VTdGF0ZSIsICJuIiwgInZhbHVlcyIsICJsZW5ndGgiLCAiZmxhdE1hcCIsICJ4IiwgImkiLCAibGVhZCIsICJib2xkIiwgIm5vZGUiLCAib25Qb2ludGVyTGVhdmUiLCAic3ZnIiwgInZpZXdCb3giLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJtaXgiLCAicG9seWxpbmUiLCAic3Ryb2tlTGluZWpvaW4iLCAic3Ryb2tlTGluZWNhcCIsICJpZCIsICJSZWFkb3V0IiwgInJvd3MiLCAidmFsdWUiLCAidHVybiIsICJTdHJpcCIsICJvbkhvdmVyIiwgImZsZXhEaXJlY3Rpb24iLCAiQXJyYXkiLCAiZnJvbSIsICJfIiwgImZsZXhHcm93IiwgImZsZXhCYXNpcyIsICJvblBvaW50ZXJFbnRlciIsICJzb3J0ZWQiLCAiZmlsdGVyIiwgInIiLCAidW5kZWZpbmVkIiwgInNvcnQiLCAiYSIsICJiIiwgImZsaXAiLCAiYmFja2dyb3VuZENvbG9yIiwgImJvcmRlclJhZGl1cyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImdhcCIsICJnb2xkTG8iLCAibXV0ZWQiLCAiYWxpZ25JdGVtcyIsICJmb250V2VpZ2h0IiwgImxpbmVCcmVhayIsICJuYW1lIiwgIlN0YWNrZWRBcmVhIiwgIkxBQkVMUyIsICJzdGFja2VkIiwgImZvckVhY2giLCAiayIsICJ0b3BzIiwgImJhc2UiLCAiYmFja3dhcmRzIiwgInNsaWNlIiwgIm1pZCIsICJEb251dCIsICJzbGljZXMiLCAic2l6ZSIsICJsYWJlbCIsICJ0b3RhbCIsICJyZWR1Y2UiLCAicjEiLCAicjAiLCAiYXJjcyIsICJQSSIsICJ0byIsICJzaG93biIsICJqdXN0aWZ5Q29udGVudCIsICJwYXRoIiwgImQiLCAic2VjdG9yIiwgImgiLCAiY3giLCAiY3kiLCAiYTAiLCAiYTEiLCAiYXQiLCAic2luIiwgImNvcyIsICJnMSIsICJnMCIsICJsYXJnZSIsICJqb2luIiwgIlJFUE9SVF9UQUJTIiwgIlJlcG9ydHMiLCAidGFiIiwgIndvcmxkIiwgImdhbWUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgIl9qc3giLCAiQ2l0aWVzIiwgIkRlbW9ncmFwaGljcyIsICJHcmFwaHMiLCAibWV0cmljIiwgInNldE1ldHJpYyIsICJ1c2VTdGF0ZSIsICJoaWRkZW4iLCAic2V0SGlkZGVuIiwgIlNldCIsICJwbGF5ZXIiLCAiY2l2cyIsICJkZWYiLCAiTUVUUklDUyIsICJmaW5kIiwgIm0iLCAia2V5IiwgInNlcmllcyIsICJmaWx0ZXIiLCAiYyIsICJoYXMiLCAiaWQiLCAibWFwIiwgIm5hbWUiLCAiY29sb3IiLCAidmFsdWVzIiwgImhpc3RvcnkiLCAiYm9sZCIsICJjaGFydFciLCAib3duIiwgInlpZWxkcyIsICJTVEFDSyIsICJ0b2dnbGUiLCAiaCIsICJuZXh0IiwgImRlbGV0ZSIsICJhZGQiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgImZsZXhHcm93IiwgImdhcCIsICJwYWRkaW5nIiwgImJvcmRlciIsICJyaWdodCIsICJib3JkZXJDb2xvciIsICJDIiwgImdvbGRMaW5lIiwgInRleHQiLCAiY2FwcyIsICJtdXRlZCIsICJtYXJnaW4iLCAiYm90dG9tIiwgImJ1dHRvbiIsICJvbkNsaWNrIiwgImFsaWduSXRlbXMiLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJib3JkZXJSYWRpdXMiLCAiYmFja2dyb3VuZENvbG9yIiwgImxlZnQiLCAiZ29sZCIsICJob3ZlclN0eWxlIiwgIkljb24iLCAiaWNvbiIsICJzaXplIiwgImZvbnRTaXplIiwgImdvbGRIaSIsICJmb250V2VpZ2h0IiwgInVuaXQiLCAiVG9nZ2xlIiwgImNpdiIsICJvbiIsICJMaW5lQ2hhcnQiLCAiTWF0aCIsICJtYXgiLCAiZmlyc3QiLCAiSGVhZGVyIiwgInJldmVyc2UiLCAicyIsICJTdGFja2VkQXJlYSIsICJmYWludCIsICJDT0xTIiwgImxhYmVsIiwgIllJRUxEUyIsICJ5IiwgIlRBQkxFX1ciLCAicmVkdWNlIiwgIm4iLCAiY2l0aWVzIiwgInN1bSIsICJ0b3RhbHMiLCAibW9uZXkiLCAibGVkZ2VyIiwgInNsb3RzIiwgInNvdXJjZXMiLCAiaSIsICJsZW5ndGgiLCAiZm9vZCIsICJwb3AiLCAiUm93IiwgImhlYWRlciIsICJjZWxscyIsICJzdGFyIiwgImNhcGl0YWwiLCAicG9wdWxhdGlvbiIsICJmbXQiLCAidG90YWwiLCAidG9wIiwgImZsZXhXcmFwIiwgImNvbHVtbkdhcCIsICJyb3dHYXAiLCAiQnJlYWtkb3duIiwgInJvd3MiLCAidmFsdWUiLCAiRG9udXQiLCAic2xpY2VzIiwgIkxlZGdlciIsICJzd2F0Y2giLCAic2lnbmVkIiwgInVwa2VlcCIsICJ1IiwgIm5ldCIsICJzdHJvbmciLCAiciIsICJCQVIiLCAidG9VcHBlckNhc2UiLCAibGluZUJyZWFrIiwgInVuZGVmaW5lZCIsICJjZWxsIiwgImNvbCIsICJqdXN0aWZ5Q29udGVudCIsICJERU1PR1JBUEhJQ1MiLCAib2YiLCAidyIsICJwcm9kdWN0aW9uIiwgIl8iLCAiZyIsICJtaW4iLCAic2NpZW5jZSIsICJhdCIsICJtaWxpdGFyeSIsICJ4IiwgInRpbGVzIiwgImQiLCAidiIsICJzb3J0ZWQiLCAic29ydCIsICJhIiwgImIiLCAibWluZSIsICJyYW5rIiwgImZpbmRJbmRleCIsICJhdmciLCAiY29tcGFjdCIsICJwb3NpdGlvblR5cGUiLCAiekluZGV4IiwgIlNjcmVlbiIsICJ0aXRsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAidGFicyIsICJ0YWIiLCAib25UYWIiLCAib25DbG9zZSIsICJjaGlsZHJlbiIsICJlbnRlciIsICJ1c2VGYWRlSW4iLCAiX2pzeCIsICJub2RlIiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgInJpZ2h0IiwgInRvcCIsICJib3R0b20iLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYmFja2Ryb3BGaWx0ZXIiLCAibmFtZSIsICJwYXJhbXMiLCAicmFkaXVzIiwgImhvdmVyU3R5bGUiLCAiT1dOU19QT0lOVEVSIiwgIl9qc3hzIiwgInBhbmVsIiwgImZsZXhEaXJlY3Rpb24iLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgIkMiLCAiZ29sZCIsICJmbGV4U2hyaW5rIiwgImdvbGRMaW5lIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImNvbG9yIiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGb250cyIsICJkaXNwbGF5IiwgImZvbnRXZWlnaHQiLCAiZm9udFNpemUiLCAibGV0dGVyU3BhY2luZyIsICJnb2xkSGkiLCAidGV4dFNoYWRvdyIsICJvZmZzZXRYIiwgIm9mZnNldFkiLCAidG9VcHBlckNhc2UiLCAiQ2xvc2VCdXR0b24iLCAib25DbGljayIsICJnYXAiLCAicGFkZGluZyIsICJtYXAiLCAidCIsICJidXR0b24iLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJjYXBzIiwgIm11dGVkIiwgImZsZXhHcm93IiwgIm1pbkhlaWdodCIsICJpbXBvcnRfcmVhY3QiLCAiQ09MIiwgIk5PREVfVyIsICJOT0RFX0giLCAiUEFEIiwgIkhFQUQiLCAiUk9XUyIsICJDT0xVTU5TIiwgIkVSQVMiLCAicmVkdWNlIiwgIm4iLCAiZSIsICJjb2x1bW5zIiwgIldJRFRIIiwgInJvd0ZvciIsICJoZWlnaHQiLCAiTWF0aCIsICJtYXgiLCAibWluIiwgImF0IiwgInQiLCAicm93IiwgIngiLCAiY29sIiwgInkiLCAiVGVjaFRyZWUiLCAiZ2FtZSIsICJwbGF5ZXIiLCAiZGlzcGF0Y2giLCAid2lkdGgiLCAiY3VycmVudCIsICJyZXNlYXJjaCIsICJ0ZWNoIiwgInNjcm9sbCIsICJzZXRTY3JvbGwiLCAidXNlU3RhdGUiLCAic2NpZW5jZSIsICJpbmNvbWUiLCAic3RhdGUiLCAicmVzZWFyY2hlZCIsICJpbmNsdWRlcyIsICJpZCIsICJyZXF1aXJlcyIsICJldmVyeSIsICJyIiwgIl9qc3giLCAibm9kZSIsICJvbldoZWVsIiwgInMiLCAiZGVsdGFZIiwgImRlbHRhWCIsICJzY3JvbGxMZWZ0IiwgInN0eWxlIiwgImZsZXhHcm93IiwgIm92ZXJmbG93WCIsICJvdmVyZmxvd1kiLCAic2Nyb2xsYmFyIiwgInRoaWNrbmVzcyIsICJ0aHVtYiIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQyIsICJnb2xkTG8iLCAiYm9yZGVyUmFkaXVzIiwgInRyYWNrIiwgInRyYW5zaXRpb24iLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImNvbG9yIiwgIl9qc3hzIiwgImZsZXhTaHJpbmsiLCAiRXJhcyIsICJURUNIUyIsICJmbGF0TWFwIiwgIm1hcCIsICJXaXJlIiwgImZyb20iLCAidG8iLCAibGl0IiwgIlRlY2hOb2RlIiwgInByb2dyZXNzIiwgImNvc3QiLCAidHVybnMiLCAidHVybnNMZWZ0IiwgIm9uQ2xpY2siLCAiZWRnZSIsICJjIiwgIl9GcmFnbWVudCIsICJlcmEiLCAiaSIsICJsZWZ0IiwgInJpZ2h0IiwgInBvc2l0aW9uVHlwZSIsICJ0b3AiLCAiYm90dG9tIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiZ29sZExpbmUiLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFdlaWdodCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImdvbGQiLCAibWFyZ2luIiwgIm5hbWUiLCAidG9VcHBlckNhc2UiLCAiYSIsICJiIiwgIngxIiwgInkxIiwgIngyIiwgInkyIiwgImVsYm93IiwgInNlZyIsICJhYnMiLCAiTE9PSyIsICJkb25lIiwgImdvbGRIaSIsICJvcGVuIiwgInNsYXRlSGkiLCAibG9ja2VkIiwgImZhaW50IiwgImhvdmVyIiwgInNldEhvdmVyIiwgImxvb2siLCAic3RhdHVzIiwgInBsdXJhbCIsICJidXR0b24iLCAidW5kZWZpbmVkIiwgIm9uUG9pbnRlckVudGVyIiwgIm9uUG9pbnRlckxlYXZlIiwgImdhcCIsICJwYWRkaW5nIiwgImJveFNoYWRvdyIsICJibHVyUmFkaXVzIiwgInlPZmZzZXQiLCAiaG92ZXJTdHlsZSIsICJNZWRhbGxpb24iLCAic2l6ZSIsICJpbm5lciIsICJvdXRlciIsICJpbmsiLCAicmluZyIsICJJY29uIiwgImljb24iLCAiY2FwcyIsICJsaW5lQnJlYWsiLCAibXV0ZWQiLCAidW5sb2NrcyIsICJ1IiwgImp1c3RpZnlDb250ZW50IiwgInRvbmUiLCAiVGlwIiwgImpvaW4iLCAiYm9vc3QiLCAic2lkZSIsICJvZmZzZXQiLCAiQXBwIiwgIndpbiIsICJ1c2VXaW5kb3dTaXplIiwgIndvcmxkIiwgInNldFdvcmxkIiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJiZXZ5IiwgIm1hcCIsICJ0aGVuIiwgIndpZHRoIiwgIl9qc3giLCAiQ2l2aWxpemF0aW9uIiwgImhlaWdodCIsICJUSVRMRVMiLCAidGVjaCIsICJyZXBvcnRzIiwgInJhbmtpbmdzIiwgImdhbWUiLCAiZGlzcGF0Y2giLCAidXNlUmVkdWNlciIsICJnIiwgImEiLCAic3RlcCIsICJuZXdHYW1lIiwgInNjcmVlbiIsICJzZXRTY3JlZW4iLCAidGFicyIsICJzZXRUYWJzIiwgIlJFUE9SVF9UQUJTIiwgIlJBTktJTkdfVEFCUyIsICJzZWxlY3Rpb24iLCAic2V0U2VsZWN0aW9uIiwgImhvdmVyIiwgInNldEhvdmVyIiwgImJ1c3kiLCAic2V0QnVzeSIsICJsZW5zIiwgInNldExlbnMiLCAicGxheWVyIiwgImNpdnMiLCAiY2l2IiwgImlkIiwgImZpbmQiLCAiYyIsICJjaXR5IiwgImtpbmQiLCAiY2l0aWVzIiwgInVuZGVmaW5lZCIsICJ1bml0IiwgInVuaXRzIiwgInUiLCAic2VsZWN0IiwgInMiLCAiYXQiLCAidGlsZSIsICJjb2wiLCAicm93IiwgImZvY3VzIiwgInpvb20iLCAibmV4dFR1cm4iLCAicmVzZWFyY2giLCAic2V0VGltZW91dCIsICJ0eXBlIiwgInRvZ2dsZUxlbnMiLCAicG9saXRpY2FsIiwgInVzZUV2ZW50IiwgInNldHRsZW1lbnQiLCAiZSIsICJyZXBlYXQiLCAia2V5IiwgInVzZURlYnVnIiwgInQiLCAiaW5jbHVkZXMiLCAiYm94VyIsICJNYXRoIiwgIm1pbiIsICJib3hIIiwgImxhYmVsIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiX0ZyYWdtZW50IiwgIkJhbm5lcnMiLCAib25TZWxlY3QiLCAiVGlsZVRvb2x0aXAiLCAiY3Vyc29yIiwgIkNpdHlQYW5lbCIsICJvbkNsb3NlIiwgIkxhdW5jaEJhciIsICJvbk9wZW4iLCAiVHJhY2tlcnMiLCAib25SZXNlYXJjaCIsICJMZWFkZXJzIiwgInJpdmFscyIsICJzbGljZSIsICJOb3RpZmljYXRpb25zIiwgIm5vdGVzIiwgIm9uRGlzbWlzcyIsICJBY3Rpb25QYW5lbCIsICJvbk5leHQiLCAib25MZW5zIiwgIlVuaXRQYW5lbCIsICJTY3JlZW4iLCAidGl0bGUiLCAidGFiIiwgIm9uVGFiIiwgIlRlY2hUcmVlIiwgIlJlcG9ydHMiLCAiUmFua2luZ3MiLCAiVG9wQmFyIiwgIm5ldCIsICJsZWRnZXIiLCAibW91bnQiLCAiX2pzeCIsICJBcHAiXQp9Cg==
