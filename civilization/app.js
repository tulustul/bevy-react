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
              bottom: -18,
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
                justifyContent: "center",
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
        height: 28
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: {
            width: 30,
            height: 30,
            borderRadius: 15,
            padding: 3,
            margin: {
              right: -8
            },
            backgroundGradient: conic(growth, C.food),
            zIndex: 1
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
            style: {
              flexGrow: 1,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: C.ink
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontSize: 13,
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
            height: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            padding: {
              left: 14,
              right: it ? 14 : 10
            },
            borderRadius: 3,
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
              blurRadius: 10
            } : {
              color: "rgba(0, 0, 0, 0.55)",
              blurRadius: 6,
              yOffset: 2
            }
          },
          hoverStyle: {
            borderColor: C.goldHi
          },
          children: [
            city.capital && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, {
              name: "star",
              size: 12,
              color: C.goldHi
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontFamily: Fonts.display,
                fontWeight: "bold",
                fontSize: 12,
                letterSpacing: 1,
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
              left: -8
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
              style: {
                width: 28,
                height: 28,
                borderRadius: 14,
                padding: 3,
                backgroundGradient: conic(producing.progress / it.cost, C.production)
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
                style: {
                  flexGrow: 1,
                  borderRadius: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: C.ink
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, {
                  name: it.icon,
                  size: 13,
                  color: C.production
                })
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
              style: {
                positionType: "absolute",
                top: 28,
                padding: {
                  horizontal: 4
                },
                borderRadius: 3,
                backgroundColor: "rgba(6, 13, 21, 0.85)"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                style: {
                  fontSize: 10,
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
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", {
        onClick,
        style: {
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          border: 2,
          borderColor: selected ? C.goldHi : "rgba(255, 255, 255, 0.75)",
          backgroundGradient: radial(tone(civ.color, 1.2), tone(civ.color, 0.45)),
          boxShadow: {
            color: "rgba(0, 0, 0, 0.55)",
            blurRadius: 5,
            yOffset: 2
          }
        },
        hoverStyle: {
          transform: {
            scale: 1.12
          }
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, {
          name: UNITS[unit.kind].icon,
          size: 15,
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
    const boxW = Math.min(1280, width - 60);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidmVuZG9yLWdsb2JhbDpiZXZ5LXJlYWN0L2pzeC1ydW50aW1lIiwgInZlbmRvci1nbG9iYWw6YmV2eS1yZWFjdCIsICJ2ZW5kb3ItZ2xvYmFsOnJlYWN0IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvaW5kZXgudHN4IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvQXBwLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL2JldnkudHMiLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy90ZWNocy50cyIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL3RoZW1lLnRzIiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvZ2FtZS50cyIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL2hvb2tzLnRzIiwgIi4uL3NyYy91aS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvdWkvSWNvbi50c3giLCAiLi4vc3JjL3VpL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy91aS9raXQudHN4IiwgIi4uL3NyYy9jaXR5L2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9jaXR5L0NpdHlQYW5lbC50c3giLCAiLi4vc3JjL2h1ZC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvaHVkL0FjdGlvblBhbmVsLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvVW5pdFBhbmVsLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvQmFubmVycy50c3giLCAiLi4vc3JjL2h1ZC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvaHVkL0xlYWRlcnMudHN4IiwgIi4uL3NyYy9odWQvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL2h1ZC9Ob3RpZmljYXRpb25zLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvVG9wQmFyLnRzeCIsICIuLi9zcmMvaHVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9odWQvVHJhY2tlcnMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9zY3JlZW5zL1JhbmtpbmdzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvc2NyZWVucy9SZXBvcnRzLnRzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NpdmlsaXphdGlvbi91aS9zcmMvc2NyZWVucy9jaGFydHMudHN4IiwgIi4uL3NyYy9zY3JlZW5zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY2l2aWxpemF0aW9uL3VpL3NyYy9zY3JlZW5zL1NjcmVlbi50c3giLCAiLi4vc3JjL3NjcmVlbnMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jaXZpbGl6YXRpb24vdWkvc3JjL3NjcmVlbnMvVGVjaFRyZWUudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuX19iZXZ5VmVuZG9yW1wiYmV2eS1yZWFjdC9qc3gtcnVudGltZVwiXTsiLCAibW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLl9fYmV2eVZlbmRvcltcImJldnktcmVhY3RcIl07IiwgIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5fX2JldnlWZW5kb3JbXCJyZWFjdFwiXTsiLCAiaW1wb3J0IHsgbW91bnQgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSBcIi4vQXBwXCI7XG5cbi8vIGBtb3VudGAgcGFya3Mgb24gdGhlIFJ1c3QtZHJpdmVuIGV2ZW50IGxvb3AgYW5kIG5ldmVyIHJlc29sdmVzLiBPbiBhIGhvdFxuLy8gcmVsb2FkIHRoaXMgZmlsZSByZS1leGVjdXRlcyBhbmQgYG1vdW50YCB0cmlnZ2VycyBhIFJlYWN0IEZhc3QgUmVmcmVzaC5cbm1vdW50KDxBcHAgLz4pO1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVkdWNlciwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGJldnksIHR5cGUgVGlsZUluZm8sIHR5cGUgV29ybGRJbmZvIH0gZnJvbSBcIi4vYmV2eVwiO1xuaW1wb3J0IHsgQ2l0eVBhbmVsIH0gZnJvbSBcIi4vY2l0eS9DaXR5UGFuZWxcIjtcbmltcG9ydCB7IGxlZGdlciwgbmV3R2FtZSwgc3RlcCwgdHlwZSBBY3Rpb24sIHR5cGUgR2FtZSB9IGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCB7IHVzZURlYnVnLCB1c2VFdmVudCwgdXNlV2luZG93U2l6ZSB9IGZyb20gXCIuL2hvb2tzXCI7XG5pbXBvcnQgeyBBY3Rpb25QYW5lbCB9IGZyb20gXCIuL2h1ZC9BY3Rpb25QYW5lbFwiO1xuaW1wb3J0IHsgQmFubmVycywgVGlsZVRvb2x0aXAsIHR5cGUgU2VsZWN0aW9uIH0gZnJvbSBcIi4vaHVkL0Jhbm5lcnNcIjtcbmltcG9ydCB7IExlYWRlcnMgfSBmcm9tIFwiLi9odWQvTGVhZGVyc1wiO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9ucyB9IGZyb20gXCIuL2h1ZC9Ob3RpZmljYXRpb25zXCI7XG5pbXBvcnQgeyBMYXVuY2hCYXIsIFRvcEJhciwgdHlwZSBTY3JlZW5JZCB9IGZyb20gXCIuL2h1ZC9Ub3BCYXJcIjtcbmltcG9ydCB7IFRyYWNrZXJzIH0gZnJvbSBcIi4vaHVkL1RyYWNrZXJzXCI7XG5pbXBvcnQgeyBVbml0UGFuZWwgfSBmcm9tIFwiLi9odWQvVW5pdFBhbmVsXCI7XG5pbXBvcnQgeyBSQU5LSU5HX1RBQlMsIFJhbmtpbmdzIH0gZnJvbSBcIi4vc2NyZWVucy9SYW5raW5nc1wiO1xuaW1wb3J0IHsgUkVQT1JUX1RBQlMsIFJlcG9ydHMgfSBmcm9tIFwiLi9zY3JlZW5zL1JlcG9ydHNcIjtcbmltcG9ydCB7IFNjcmVlbiB9IGZyb20gXCIuL3NjcmVlbnMvU2NyZWVuXCI7XG5pbXBvcnQgeyBUZWNoVHJlZSB9IGZyb20gXCIuL3NjcmVlbnMvVGVjaFRyZWVcIjtcblxuLyoqIENpdmlsaXphdGlvbjogdGhlIHdvcmxkIGNvbWVzIGZyb20gQmV2eSBvbmNlOyBldmVyeXRoaW5nIGVsc2Ugb24gc2NyZWVuIGlzXG4gKiAgUmVhY3Qgb3ZlciBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IHdpbiA9IHVzZVdpbmRvd1NpemUoKTtcbiAgY29uc3QgW3dvcmxkLCBzZXRXb3JsZF0gPSB1c2VTdGF0ZTxXb3JsZEluZm8gfCBudWxsPihudWxsKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBiZXZ5Lm1hcC53b3JsZCgpLnRoZW4oc2V0V29ybGQpO1xuICB9LCBbXSk7XG4gIGlmICghd29ybGQgfHwgd2luLndpZHRoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIDxDaXZpbGl6YXRpb24gd29ybGQ9e3dvcmxkfSB3aWR0aD17d2luLndpZHRofSBoZWlnaHQ9e3dpbi5oZWlnaHR9IC8+O1xufVxuXG5jb25zdCBUSVRMRVM6IFJlY29yZDxTY3JlZW5JZCwgc3RyaW5nPiA9IHtcbiAgdGVjaDogXCJUZWNobm9sb2d5XCIsXG4gIHJlcG9ydHM6IFwiUmVwb3J0c1wiLFxuICByYW5raW5nczogXCJXb3JsZCBSYW5raW5nc1wiLFxufTtcblxuZnVuY3Rpb24gQ2l2aWxpemF0aW9uKHtcbiAgd29ybGQsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufSkge1xuICBjb25zdCBbZ2FtZSwgZGlzcGF0Y2hdID0gdXNlUmVkdWNlcihcbiAgICAoZzogR2FtZSwgYTogQWN0aW9uKSA9PiBzdGVwKHdvcmxkLCBnLCBhKSxcbiAgICB3b3JsZCxcbiAgICBuZXdHYW1lLFxuICApO1xuICBjb25zdCBbc2NyZWVuLCBzZXRTY3JlZW5dID0gdXNlU3RhdGU8U2NyZWVuSWQgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3RhYnMsIHNldFRhYnNdID0gdXNlU3RhdGUoe1xuICAgIHJlcG9ydHM6IFJFUE9SVF9UQUJTWzBdLFxuICAgIHJhbmtpbmdzOiBSQU5LSU5HX1RBQlNbMF0sXG4gIH0pO1xuICBjb25zdCBbc2VsZWN0aW9uLCBzZXRTZWxlY3Rpb25dID0gdXNlU3RhdGU8U2VsZWN0aW9uPihudWxsKTtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZTxUaWxlSW5mbyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtsZW5zLCBzZXRMZW5zXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgcGxheWVyID0gd29ybGQuY2l2c1swXTtcbiAgY29uc3QgY2l2ID0gKGlkOiBzdHJpbmcpID0+IHdvcmxkLmNpdnMuZmluZCgoYykgPT4gYy5pZCA9PT0gaWQpITtcbiAgY29uc3QgY2l0eSA9XG4gICAgc2VsZWN0aW9uPy5raW5kID09PSBcImNpdHlcIlxuICAgICAgPyB3b3JsZC5jaXRpZXMuZmluZCgoYykgPT4gYy5pZCA9PT0gc2VsZWN0aW9uLmlkKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHVuaXQgPVxuICAgIHNlbGVjdGlvbj8ua2luZCA9PT0gXCJ1bml0XCJcbiAgICAgID8gd29ybGQudW5pdHMuZmluZCgodSkgPT4gdS5pZCA9PT0gc2VsZWN0aW9uLmlkKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2VsZWN0ID0gKHM6IFNlbGVjdGlvbikgPT4ge1xuICAgIHNldFNlbGVjdGlvbihzKTtcbiAgICBjb25zdCBhdCA9XG4gICAgICBzPy5raW5kID09PSBcImNpdHlcIlxuICAgICAgICA/IHdvcmxkLmNpdGllcy5maW5kKChjKSA9PiBjLmlkID09PSBzLmlkKVxuICAgICAgICA6IHdvcmxkLnVuaXRzLmZpbmQoKHUpID0+IHUuaWQgPT09IHM/LmlkKTtcbiAgICBjb25zdCB0aWxlID0gYXQgPyB7IGNvbDogYXQuY29sLCByb3c6IGF0LnJvdyB9IDogbnVsbDtcbiAgICBiZXZ5Lm1hcC5zZWxlY3QodGlsZSk7XG4gICAgaWYgKHRpbGUgJiYgcz8ua2luZCA9PT0gXCJjaXR5XCIpIGJldnkubWFwLmZvY3VzKHsgdGlsZSwgem9vbTogMC4yIH0pO1xuICB9O1xuXG4gIGNvbnN0IG5leHRUdXJuID0gKCkgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm47XG4gICAgaWYgKCFnYW1lLnJlc2VhcmNoKSByZXR1cm4gc2V0U2NyZWVuKFwidGVjaFwiKTtcbiAgICBzZXRCdXN5KHRydWUpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcInR1cm5cIiB9KTtcbiAgICAgIHNldEJ1c3koZmFsc2UpO1xuICAgIH0sIDY1MCk7XG4gIH07XG5cbiAgY29uc3QgdG9nZ2xlTGVucyA9ICgpID0+IHtcbiAgICBzZXRMZW5zKCFsZW5zKTtcbiAgICBiZXZ5Lm1hcC5sZW5zKHsgcG9saXRpY2FsOiAhbGVucyB9KTtcbiAgfTtcblxuICB1c2VFdmVudChcIm1hcC5ob3ZlclwiLCBzZXRIb3Zlcik7XG4gIHVzZUV2ZW50KFwibWFwLmNsaWNrXCIsICh0aWxlKSA9PlxuICAgIHNlbGVjdChcbiAgICAgIHRpbGUuc2V0dGxlbWVudFxuICAgICAgICA/IHsga2luZDogXCJjaXR5XCIsIGlkOiB0aWxlLnNldHRsZW1lbnQgfVxuICAgICAgICA6IHRpbGUudW5pdFxuICAgICAgICAgID8geyBraW5kOiBcInVuaXRcIiwgaWQ6IHRpbGUudW5pdCB9XG4gICAgICAgICAgOiBudWxsLFxuICAgICksXG4gICk7XG4gIHVzZUV2ZW50KFwia2V5RG93blwiLCAoZSkgPT4ge1xuICAgIGlmIChlLnJlcGVhdCkgcmV0dXJuO1xuICAgIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgaWYgKHNjcmVlbikgc2V0U2NyZWVuKG51bGwpO1xuICAgICAgZWxzZSBzZWxlY3QobnVsbCk7XG4gICAgfVxuICAgIGlmIChlLmtleSA9PT0gXCJFbnRlclwiICYmICFzY3JlZW4pIG5leHRUdXJuKCk7XG4gIH0pO1xuXG4gIC8vIFNjcmlwdGVkIHN0ZXBzIGZvciBgLS1zaG9vdGAgKHNlZSBgc2hvb3QucnNgKS5cbiAgdXNlRGVidWcoXCJzY3JlZW5cIiwgKHMpID0+IHNldFNjcmVlbihzID09PSBcIm5vbmVcIiA/IG51bGwgOiAocyBhcyBTY3JlZW5JZCkpKTtcbiAgdXNlRGVidWcoXCJ0YWJcIiwgKHQpID0+XG4gICAgc2V0VGFicygodGFicykgPT5cbiAgICAgIFJFUE9SVF9UQUJTLmluY2x1ZGVzKHQpXG4gICAgICAgID8geyAuLi50YWJzLCByZXBvcnRzOiB0IH1cbiAgICAgICAgOiB7IC4uLnRhYnMsIHJhbmtpbmdzOiB0IH0sXG4gICAgKSxcbiAgKTtcbiAgdXNlRGVidWcoXCJjaXR5XCIsIChpZCkgPT4gc2VsZWN0KHsga2luZDogXCJjaXR5XCIsIGlkIH0pKTtcbiAgdXNlRGVidWcoXCJ1bml0XCIsIChpZCkgPT4gc2VsZWN0KHsga2luZDogXCJ1bml0XCIsIGlkIH0pKTtcbiAgdXNlRGVidWcoXCJ0dXJuXCIsICgpID0+IGRpc3BhdGNoKHsgdHlwZTogXCJ0dXJuXCIgfSkpO1xuICB1c2VEZWJ1ZyhcImxlbnNcIiwgdG9nZ2xlTGVucyk7XG5cbiAgY29uc3QgYm94VyA9IE1hdGgubWluKDEyODAsIHdpZHRoIC0gNjApO1xuICBjb25zdCBib3hIID0gaGVpZ2h0IC0gMzIgLSA0MDtcbiAgY29uc3QgbGFiZWwgPSBidXN5XG4gICAgPyBcIlBMRUFTRSBXQUlUXCJcbiAgICA6IGdhbWUucmVzZWFyY2hcbiAgICAgID8gXCJORVhUIFRVUk5cIlxuICAgICAgOiBcIkNIT09TRSBSRVNFQVJDSFwiO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiIH19PlxuICAgICAgeyFzY3JlZW4gJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxCYW5uZXJzXG4gICAgICAgICAgICB3b3JsZD17d29ybGR9XG4gICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgc2VsZWN0aW9uPXtzZWxlY3Rpb259XG4gICAgICAgICAgICBvblNlbGVjdD17c2VsZWN0fVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2hvdmVyICYmIChcbiAgICAgICAgICAgIDxUaWxlVG9vbHRpcCB0aWxlPXtob3Zlcn0gY3Vyc29yPXt3b3JsZC5jdXJzb3J9IHdvcmxkPXt3b3JsZH0gLz5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtjaXR5ID8gKFxuICAgICAgICAgICAgPENpdHlQYW5lbFxuICAgICAgICAgICAgICBrZXk9e2NpdHkuaWR9XG4gICAgICAgICAgICAgIGNpdHk9e2NpdHl9XG4gICAgICAgICAgICAgIGNpdj17Y2l2KGNpdHkuY2l2KX1cbiAgICAgICAgICAgICAgZ2FtZT17Z2FtZX1cbiAgICAgICAgICAgICAgZGlzcGF0Y2g9e2Rpc3BhdGNofVxuICAgICAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZWxlY3QobnVsbCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8TGF1bmNoQmFyIG9uT3Blbj17c2V0U2NyZWVufSByZXNlYXJjaD17ISFnYW1lLnJlc2VhcmNofSAvPlxuICAgICAgICAgICAgICA8VHJhY2tlcnNcbiAgICAgICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgICAgIHBsYXllcj17cGxheWVyLmlkfVxuICAgICAgICAgICAgICAgIG9uUmVzZWFyY2g9eygpID0+IHNldFNjcmVlbihcInRlY2hcIil9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxMZWFkZXJzXG4gICAgICAgICAgICByaXZhbHM9e3dvcmxkLmNpdnMuc2xpY2UoMSl9XG4gICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgb25PcGVuPXsoKSA9PiBzZXRTY3JlZW4oXCJyYW5raW5nc1wiKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxOb3RpZmljYXRpb25zXG4gICAgICAgICAgICBub3Rlcz17Z2FtZS5ub3Rlc31cbiAgICAgICAgICAgIG9uRGlzbWlzcz17KGlkKSA9PiBkaXNwYXRjaCh7IHR5cGU6IFwiZGlzbWlzc1wiLCBpZCB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxBY3Rpb25QYW5lbFxuICAgICAgICAgICAgbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgYnVzeT17YnVzeX1cbiAgICAgICAgICAgIGxlbnM9e2xlbnN9XG4gICAgICAgICAgICBvbk5leHQ9e25leHRUdXJufVxuICAgICAgICAgICAgb25MZW5zPXt0b2dnbGVMZW5zfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge3VuaXQgJiYgKFxuICAgICAgICAgICAgPFVuaXRQYW5lbFxuICAgICAgICAgICAgICBrZXk9e3VuaXQuaWR9XG4gICAgICAgICAgICAgIHVuaXQ9e3VuaXR9XG4gICAgICAgICAgICAgIGNpdj17Y2l2KHVuaXQuY2l2KX1cbiAgICAgICAgICAgICAgb25DbG9zZT17KCkgPT4gc2VsZWN0KG51bGwpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgICB7c2NyZWVuICYmIChcbiAgICAgICAgPFNjcmVlblxuICAgICAgICAgIHRpdGxlPXtUSVRMRVNbc2NyZWVuXX1cbiAgICAgICAgICB3aWR0aD17Ym94V31cbiAgICAgICAgICBoZWlnaHQ9e2JveEh9XG4gICAgICAgICAgdGFicz17XG4gICAgICAgICAgICBzY3JlZW4gPT09IFwicmVwb3J0c1wiXG4gICAgICAgICAgICAgID8gUkVQT1JUX1RBQlNcbiAgICAgICAgICAgICAgOiBzY3JlZW4gPT09IFwicmFua2luZ3NcIlxuICAgICAgICAgICAgICAgID8gUkFOS0lOR19UQUJTXG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFiPXtzY3JlZW4gPT09IFwicmVwb3J0c1wiID8gdGFicy5yZXBvcnRzIDogdGFicy5yYW5raW5nc31cbiAgICAgICAgICBvblRhYj17KHQpID0+IHNldFRhYnMoKHRhYnMpID0+ICh7IC4uLnRhYnMsIFtzY3JlZW5dOiB0IH0pKX1cbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRTY3JlZW4obnVsbCl9XG4gICAgICAgID5cbiAgICAgICAgICB7c2NyZWVuID09PSBcInRlY2hcIiA/IChcbiAgICAgICAgICAgIDxUZWNoVHJlZVxuICAgICAgICAgICAgICBnYW1lPXtnYW1lfVxuICAgICAgICAgICAgICBwbGF5ZXI9e3BsYXllci5pZH1cbiAgICAgICAgICAgICAgZGlzcGF0Y2g9e2Rpc3BhdGNofVxuICAgICAgICAgICAgICB3aWR0aD17Ym94V31cbiAgICAgICAgICAgICAgaGVpZ2h0PXtib3hIfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogc2NyZWVuID09PSBcInJlcG9ydHNcIiA/IChcbiAgICAgICAgICAgIDxSZXBvcnRzXG4gICAgICAgICAgICAgIHRhYj17dGFicy5yZXBvcnRzfVxuICAgICAgICAgICAgICB3b3JsZD17d29ybGR9XG4gICAgICAgICAgICAgIGdhbWU9e2dhbWV9XG4gICAgICAgICAgICAgIHdpZHRoPXtib3hXfVxuICAgICAgICAgICAgICBoZWlnaHQ9e2JveEh9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8UmFua2luZ3MgdGFiPXt0YWJzLnJhbmtpbmdzfSB3b3JsZD17d29ybGR9IGdhbWU9e2dhbWV9IC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9TY3JlZW4+XG4gICAgICApfVxuICAgICAgPFRvcEJhciBnYW1lPXtnYW1lfSBwbGF5ZXI9e3BsYXllci5pZH0gbmV0PXtsZWRnZXIod29ybGQsIGdhbWUpLm5ldH0gLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiLy8gQGdlbmVyYXRlZCBieSBiZXZ5LXJlYWN0IOKAlCBkbyBub3QgZWRpdCBieSBoYW5kLlxuLy8gTWlycm9ycyB0aGUgUnVzdCBgI1tyZWFjdF9tZXNzYWdlXWAgLyBgI1tyZWFjdF9yZXF1ZXN0XWAgLyBgI1tyZWFjdF9ldmVudF1gXG4vLyB0eXBlcyBhbmQgdGhlIHJlZ2lzdGVyZWQgYCNbcmVhY3RfZmlsdGVyXWBzIC8gYCNbcmVhY3RfbW9ycGhfZmlsdGVyXWBzIChwbHVzXG4vLyBidWlsdC1pbnMpLiBSZWdlbmVyYXRlIHZpYSB5b3VyIGFwcCdzIGBBcHA6OmV4cG9ydF9yZWFjdF90eXBlc2NyaXB0YCBleHBvcnRlci5cblxuaW1wb3J0IHtcbiAgZW1pdCBhcyByYXdFbWl0LFxuICByZXF1ZXN0IGFzIHJhd1JlcXVlc3QsXG4gIGFkZEV2ZW50TGlzdGVuZXIgYXMgcmF3QWRkRXZlbnRMaXN0ZW5lcixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lciBhcyByYXdSZW1vdmVFdmVudExpc3RlbmVyLFxufSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUsIFJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBBbmNob3JTY2FsaW5nLCBBbmltYXRhYmxlLCBCZXZ5QXR0cmlidXRlcywgQmV2eUNhbnZhc0VsZW1lbnQsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVNoYXBlVHJhbnNpdGlvbiwgQmV2eVN0eWxlLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5V2hlZWxQcm9wcywgQ2FudmFzUGFpbnRlciwgRHJhd0NtZCwgVmVjMyB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5cbmV4cG9ydCB0eXBlIEFjdCA9IHsgYWN0aW9uOiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBCbG9vbVBhcmFtcyA9IHsgcmFkaXVzOiBudW1iZXIgfCBzdHJpbmcsIHRocmVzaG9sZDogbnVtYmVyLCBpbnRlbnNpdHk6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEJsdXJQYXJhbXMgPSB7IHJhZGl1czogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgQnJpZ2h0bmVzc1BhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBDYW52YXNTaXplID0geyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENocm9tYXRpY0FiZXJyYXRpb25QYXJhbXMgPSB7IG9mZnNldDogbnVtYmVyIHwgc3RyaW5nLCBhbmdsZTogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogVGFuZ2VudGlhbCBzd2lybDogdGhlIFIgaW1hZ2Ugcm90YXRlcyBieSBgK3JvdGF0aW9uYCBkZWdyZWVzXG4gKiAoY2xvY2t3aXNlLCB5LWRvd24pIGFyb3VuZCB0aGUgbm9kZSdzIGNlbnRlciwgQiBieSBgLXJvdGF0aW9uYC5cbiAqIFBsYWluIG51bWJlciBpbiBkZWdyZWVzIOKAlCBhIHNjYWxhciBtYWduaXR1ZGUsIHNvIHRyYW5zaXRpb25zIHVud2luZFxuICogbGluZWFybHkgdGhyb3VnaCBldmVyeSB0dXJuLiAwID0gcHVyZWx5IGRpcmVjdGlvbmFsIHNwbGl0LlxuICovXG5yb3RhdGlvbjogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ2l0eUluZm8gPSB7IGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgY2l2OiBzdHJpbmcsIGNvbDogbnVtYmVyLCByb3c6IG51bWJlciwgXG4vKipcbiAqIFRoZSBwb2ludCBhYm92ZSB0aGUgdG93biBpdHMgYmFubmVyIGlzIHBpbm5lZCB0byAoYEVudGl0eTo6dG9fYml0c2ApLlxuICovXG5lbnRpdHk6IG51bWJlciwgY2FwaXRhbDogYm9vbGVhbiwgcG9wdWxhdGlvbjogbnVtYmVyLCB5aWVsZHM6IFlpZWxkcywgXG4vKipcbiAqIFRpbGVzIGluc2lkZSBpdHMgYm9yZGVycy5cbiAqL1xudGlsZXM6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENpdkluZm8gPSB7IGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgbGVhZGVyOiBzdHJpbmcsIFxuLyoqXG4gKiBgI3JyZ2diYmAuXG4gKi9cbmNvbG9yOiBzdHJpbmcsIHBsYXllcjogYm9vbGVhbiwgfTtcbmV4cG9ydCB0eXBlIENsaWNrVGlsZSA9IFRpbGVJbmZvO1xuZXhwb3J0IHR5cGUgQ29udHJhc3RQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ3Jvc3NmYWRlUGFyYW1zID0geyBcbi8qKlxuICogMC4uMSBzdGFnZ2VyIGFtb3VudDsgMCBpcyB0aGUgcGxhaW4gdW5pZm9ybSBjcm9zc2ZhZGUuXG4gKi9cbnNwcmVhZDogbnVtYmVyLCBcbi8qKlxuICogTm9pc2UgZmVhdHVyZSBzaXplIGluIGxvZ2ljYWwgcHguXG4gKi9cbnNjYWxlOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiAwLi4xIGxvY2FsIGZhZGUgd2luZG93IChmcmFjdGlvbiBvZiB0aGUgcHJvZ3Jlc3MgcmFuZ2UpLlxuICovXG5zb2Z0bmVzczogbnVtYmVyLCBcbi8qKlxuICogUmUtcm9sbHMgdGhlIG5vaXNlIHBhdHRlcm4gKGRvbWFpbiBvZmZzZXQpLlxuICovXG5zZWVkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBGb2N1cyA9IHsgdGlsZTogVGlsZVBvcywgem9vbTogbnVtYmVyIHwgbnVsbCwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRBeGlzQ2hhbmdlID0geyBnYW1lcGFkOiBudW1iZXIsIGF4aXM6IEdhbWVwYWRBeGlzTmFtZSwgdmFsdWU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRBeGlzTmFtZSA9IFwibGVmdFN0aWNrWFwiIHwgXCJsZWZ0U3RpY2tZXCIgfCBcImxlZnRaXCIgfCBcInJpZ2h0U3RpY2tYXCIgfCBcInJpZ2h0U3RpY2tZXCIgfCBcInJpZ2h0WlwiIHwgeyBcIm90aGVyXCI6IG51bWJlciB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEJ1dHRvbkNoYW5nZSA9IHsgZ2FtZXBhZDogbnVtYmVyLCBidXR0b246IEdhbWVwYWRCdXR0b25OYW1lLCBcbi8qKlxuICogRGlnaXRhbCBzdGF0ZSBhZnRlciB0aGUgY2hhbmdlICh0aHJlc2hvbGRzIGZyb20gYEdhbWVwYWRTZXR0aW5nc2ApLlxuICovXG5wcmVzc2VkOiBib29sZWFuLCBcbi8qKlxuICogQW5hbG9nIHZhbHVlIGluIGAwLjAuLj0xLjBgICh0cmlnZ2VycyByZXBvcnQgdGhlIGZ1bGwgcmFuZ2UpLlxuICovXG52YWx1ZTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEJ1dHRvbk5hbWUgPSBcInNvdXRoXCIgfCBcImVhc3RcIiB8IFwibm9ydGhcIiB8IFwid2VzdFwiIHwgXCJjXCIgfCBcInpcIiB8IFwibGVmdFRyaWdnZXJcIiB8IFwibGVmdFRyaWdnZXIyXCIgfCBcInJpZ2h0VHJpZ2dlclwiIHwgXCJyaWdodFRyaWdnZXIyXCIgfCBcInNlbGVjdFwiIHwgXCJzdGFydFwiIHwgXCJtb2RlXCIgfCBcImxlZnRUaHVtYlwiIHwgXCJyaWdodFRodW1iXCIgfCBcImRQYWRVcFwiIHwgXCJkUGFkRG93blwiIHwgXCJkUGFkTGVmdFwiIHwgXCJkUGFkUmlnaHRcIiB8IHsgXCJvdGhlclwiOiBudW1iZXIgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRDb25uZWN0ZWQgPSBHYW1lcGFkQ29ubmVjdGVkRGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRDb25uZWN0ZWREYXRhID0geyBcbi8qKlxuICogTW9ub3RvbmljIHdpcmUgaWQg4oCUIG5ldmVyIHJldXNlZCBhY3Jvc3MgcmVjb25uZWN0cy5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCBcbi8qKlxuICogT1MtcHJvdmlkZWQgZGV2aWNlIG5hbWUuXG4gKi9cbm5hbWU6IHN0cmluZywgXG4vKipcbiAqIFVTQiB2ZW5kb3IgaWQsIHdoZW4gdGhlIGJhY2tlbmQga25vd3MgaXQuXG4gKi9cbnZlbmRvcklkOiBudW1iZXIgfCBudWxsLCBcbi8qKlxuICogVVNCIHByb2R1Y3QgaWQsIHdoZW4gdGhlIGJhY2tlbmQga25vd3MgaXQuXG4gKi9cbnByb2R1Y3RJZDogbnVtYmVyIHwgbnVsbCwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWREaXNjb25uZWN0ZWQgPSBHYW1lcGFkRGlzY29ubmVjdGVkRGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWREaXNjb25uZWN0ZWREYXRhID0geyBcbi8qKlxuICogVGhlIHdpcmUgaWQgdGhlIHBhZCB3YXMgYW5ub3VuY2VkIHVuZGVyLiBSZXRpcmVkIGZvciBnb29kLlxuICovXG5nYW1lcGFkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkSW5wdXREYXRhID0geyBidXR0b25zOiBBcnJheTxHYW1lcGFkQnV0dG9uQ2hhbmdlPiwgYXhlczogQXJyYXk8R2FtZXBhZEF4aXNDaGFuZ2U+LCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZElucHV0RXZlbnQgPSBHYW1lcGFkSW5wdXREYXRhO1xuZXhwb3J0IHR5cGUgR2FtZXBhZFJ1bWJsZSA9IHsgXG4vKipcbiAqIFdpcmUgaWQgZnJvbSBbYEdhbWVwYWRDb25uZWN0ZWRgXS5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCBcbi8qKlxuICogTWlsbGlzZWNvbmRzICh3ZWItYHBsYXlFZmZlY3RgLWxpa2UpLiBOZWdhdGl2ZSB2YWx1ZXMgY2xhbXAgdG8gMC5cbiAqL1xuZHVyYXRpb246IG51bWJlciwgXG4vKipcbiAqIExvdy1mcmVxdWVuY3kgbW90b3IgaW50ZW5zaXR5LCBjbGFtcGVkIHRvIGAwLjAuLj0xLjBgLlxuICovXG5zdHJvbmdNb3RvcjogbnVtYmVyLCBcbi8qKlxuICogSGlnaC1mcmVxdWVuY3kgbW90b3IgaW50ZW5zaXR5LCBjbGFtcGVkIHRvIGAwLjAuLj0xLjBgLlxuICovXG53ZWFrTW90b3I6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRTdG9wUnVtYmxlID0geyBnYW1lcGFkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHcmFkaWVudE1hcFBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc3RvcHM6IEFycmF5PEdyYWRpZW50TWFwU3RvcD4sIGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR3JhZGllbnRNYXBTdG9wID0geyBjb2xvcjogc3RyaW5nLCBwb3NpdGlvbj86IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYXlzY2FsZVBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBIb3ZlclRpbGUgPSBUaWxlSW5mbyB8IG51bGw7XG5leHBvcnQgdHlwZSBIdWVSb3RhdGVQYXJhbXMgPSB7IGFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBJbnZlcnRQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgSnVtcCA9IHsgdTogbnVtYmVyLCB2OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBLZXlEb3duID0gS2V5Ym9hcmRFdmVudERhdGE7XG5leHBvcnQgdHlwZSBLZXlVcCA9IEtleWJvYXJkRXZlbnREYXRhO1xuZXhwb3J0IHR5cGUgS2V5Ym9hcmRFdmVudERhdGEgPSB7IFxuLyoqXG4gKiBMYXlvdXQtYXdhcmUgbG9naWNhbCBrZXk6IHRoZSB0eXBlZCBjaGFyYWN0ZXIgKGBcImFcImAsIGBcIkFcImApIG9yIGEgbmFtZWRcbiAqIGtleSAoYFwiRW50ZXJcImAsIGBcIkFycm93TGVmdFwiYCwgYFwiRXNjYXBlXCJgKS5cbiAqL1xua2V5OiBzdHJpbmcsIFxuLyoqXG4gKiBMYXlvdXQtaW5kZXBlbmRlbnQgcGh5c2ljYWwga2V5LCBXM0MgYGNvZGVgIHN0eWxlIChgXCJLZXlBXCJgLCBgXCJFbnRlclwiYCkuXG4gKi9cbmNvZGU6IHN0cmluZywgXG4vKipcbiAqIFRoZSB0ZXh0IHByb2R1Y2VkIGJ5IHRoZSBrZXksIGlmIGFueSAocmVzcGVjdHMgbW9kaWZpZXJzL0lNRSkuIGBudWxsYCBmb3JcbiAqIGtleXMgdGhhdCBkb24ndCBwcm9kdWNlIHRleHQgKGUuZy4gYXJyb3dzLCBtb2RpZmllcnMpLlxuICovXG50ZXh0OiBzdHJpbmcgfCBudWxsLCBcbi8qKlxuICogV2hldGhlciB0aGlzIGlzIGFuIE9TIGF1dG8tcmVwZWF0IHdoaWxlIHRoZSBrZXkgaXMgaGVsZC5cbiAqL1xucmVwZWF0OiBib29sZWFuLCBjdHJsS2V5OiBib29sZWFuLCBzaGlmdEtleTogYm9vbGVhbiwgYWx0S2V5OiBib29sZWFuLCBcbi8qKlxuICogVGhlIFwiTWV0YVwiL1wiU3VwZXJcIiBrZXkgKFdpbmRvd3MvQ29tbWFuZCkuXG4gKi9cbm1ldGFLZXk6IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBMZW5zID0geyBwb2xpdGljYWw6IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBMaW5lYXJXaXBlUGFyYW1zID0geyBhbmdsZTogbnVtYmVyIHwgc3RyaW5nLCBzb2Z0bmVzczogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgT3V0bGluZVBhcmFtcyA9IHsgd2lkdGg6IG51bWJlciB8IHN0cmluZywgY29sb3I6IHN0cmluZywgc29mdG5lc3M6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIFBpbmNoUGFyYW1zID0geyBcbi8qKlxuICogUGluY2ggY2VudGVyLCAwLi4xIGFjcm9zcyB0aGUgbm9kZSByZWN0ICgwID0gbGVmdCBlZGdlKS5cbiAqL1xueDogbnVtYmVyLCBcbi8qKlxuICogUGluY2ggY2VudGVyLCAwLi4xIGFjcm9zcyB0aGUgbm9kZSByZWN0ICgwID0gdG9wIGVkZ2UpLlxuICovXG55OiBudW1iZXIsIFxuLyoqXG4gKiAtMSAoZnVsbCBidWxnZSkgLi49IDEgKGZ1bGwgcGluY2gpOyAwIGlzIGlkZW50aXR5LlxuICovXG5zdHJlbmd0aDogbnVtYmVyLCBcbi8qKlxuICogRWZmZWN0IHJhZGl1cyBhcyBhIGZyYWN0aW9uIG9mIHRoZSBub2RlJ3MgbGFyZ2VyIGRpbWVuc2lvbi5cbiAqL1xucmFkaXVzOiBudW1iZXIsIFxuLyoqXG4gKiBEaWZmdXNlIHNoYWRpbmcgaW50ZW5zaXR5OiAwICh1bmxpdCwgdGhlIGRlZmF1bHQpLCAxIG5vbWluYWw7IGxhcmdlclxuICogdmFsdWVzIG92ZXJkcml2ZSwgbGlrZSBgYnJpZ2h0bmVzc2AuXG4gKi9cbmxpZ2h0OiBudW1iZXIsIFxuLyoqXG4gKiBEaXJlY3Rpb24gdGhlIGxpZ2h0IGNvbWVzIEZST006IGRlZ3JlZXMgY2xvY2t3aXNlIGZyb20gK1ggaW4gc2NyZWVuXG4gKiBzcGFjZSAoYmFyZSBudW1iZXIgPSBkZWdyZWVzLCBgXCIwLjI1dHVyblwiYCBldGMuIGFjY2VwdGVkKS4gRGVmYXVsdFxuICogLTEzNSA9IHRvcC1sZWZ0LlxuICovXG5saWdodEFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiBTcGVjdWxhciAod2hpdGUpIGhpZ2hsaWdodCBpbnRlbnNpdHk6IDAgKG9mZiwgdGhlIGRlZmF1bHQpLCAxXG4gKiBub21pbmFsOyBsYXJnZXIgdmFsdWVzIG92ZXJkcml2ZS5cbiAqL1xuZ2xvc3M6IG51bWJlciwgXG4vKipcbiAqIFNpemUgb2YgdGhlIHNwZWN1bGFyIGhpZ2hsaWdodCwgMCAoYSBwaW5wb2ludCkgLi49IDEgKGEgYnJvYWQgc2hlZW4pO1xuICogZGVmYXVsdCAwLjMuIE1hcHBlZCBsb2ctd2lzZSBvbnRvIGEgQmxpbm4tUGhvbmcgZXhwb25lbnQgaW4gdGhlIHNoYWRlclxuICogKDEyOCBhdCAwLCB+MzIgYXQgMC4zLCAxIGF0IDEpLlxuICovXG5nbG9zc1NpemU6IG51bWJlciwgXG4vKipcbiAqIEhvdyB0aGUgZWZmZWN0IG1lZXRzIGl0cyByaW0sIDAuLj0xOiAwIGlzIGEgbGluZWFyIG9uc2V0IChhIHZpc2libGVcbiAqIGNyZWFzZSwgbGlrZSBhIHByZXNzZWQgY29pbiBlZGdlKSwgMC41ICh0aGUgZGVmYXVsdCkgdGhlIGNsYXNzaWMgYHVeMmBcbiAqIHNtb290aHN0ZXAtbGlrZSBmYWRlLCAxIGFuIGltcGVyY2VwdGlibGUgYHVeNGAgZmFkZS1pbi5cbiAqL1xub3V0ZXJTb2Z0bmVzczogbnVtYmVyLCBcbi8qKlxuICogSG93IHRoZSBlZmZlY3QgcGVha3MgYXQgaXRzIGNlbnRlciwgMC4uPTE6IDAgaXMgYSBjb25lIHRpcCAoYSBwb2ludGVkXG4gKiBwaXQvcGVhayB0aGUgbGlnaHRpbmcgc2hvd3MgYXMgYSBwb2ludCksIDAuNSAodGhlIGRlZmF1bHQpIGEgcm91bmRlZFxuICogYm93bCwgMSBhIGJyb2FkIGZsYXQgZmxvb3IuIEluZGVwZW5kZW50IG9mIGBvdXRlclNvZnRuZXNzYDogdGhlXG4gKiBwcm9maWxlIGlzIGAxIC0gKDEgLSB1XmEpXmJgIHdpdGggYGFgL2BiYCBmcm9tIHRoZSB0d28ga25vYnMuXG4gKi9cbmlubmVyU29mdG5lc3M6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFBpeGVsaXplUGFyYW1zID0geyBcbi8qKlxuICogQ2VsbHMgYWNyb3NzIHgveSBhdCB0aGUgbW9zYWljJ3MgY29hcnNlc3QgKHVwc3RyZWFtIGBzcXVhcmVzTWluYCkuXG4gKi9cbnNxdWFyZXNNaW46IFtudW1iZXIsIG51bWJlcl0sIFxuLyoqXG4gKiBEaXNjcmV0ZSBjZWxsLXNpemUgbGV2ZWxzOyBgPD0gMGAgZm9yIGEgY29udGludW91cyByYW1wLlxuICovXG5zdGVwczogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgUmVzaXplID0gV2luZG93U2l6ZTtcbmV4cG9ydCB0eXBlIFNhdHVyYXRlUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNlbGVjdCA9IFRpbGVQb3MgfCBudWxsO1xuZXhwb3J0IHR5cGUgU2VwaWFQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgU2hhZG93UGFyYW1zID0geyBjb2xvcjogc3RyaW5nLCBvZmZzZXRYOiBudW1iZXIgfCBzdHJpbmcsIG9mZnNldFk6IG51bWJlciB8IHN0cmluZywgc3ByZWFkOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBUaWxlSW5mbyA9IHsgY29sOiBudW1iZXIsIHJvdzogbnVtYmVyLCBcbi8qKlxuICogU3RpbGwgcGFyY2htZW50OiBub3RoaW5nIGVsc2UgaXMga25vd24uXG4gKi9cbnJldmVhbGVkOiBib29sZWFuLCB0ZXJyYWluOiBzdHJpbmcsIGhpbGxzOiBib29sZWFuLCBtb3VudGFpbnM6IGJvb2xlYW4sIFxuLyoqXG4gKiBgXCJ3b29kc1wiYCwgYFwicmFpbmZvcmVzdFwiYC5cbiAqL1xuZmVhdHVyZTogc3RyaW5nIHwgbnVsbCwgeWllbGRzOiBZaWVsZHMsIGZhcm06IGJvb2xlYW4sIFxuLyoqXG4gKiBUaGUgY2l2IHdob3NlIGJvcmRlcnMgaXQgbGllcyBpbi5cbiAqL1xub3duZXI6IHN0cmluZyB8IG51bGwsIFxuLyoqXG4gKiBUaGUgY2l0eSB3aG9zZSB0ZXJyaXRvcnkgaXQgaXMuXG4gKi9cbmNpdHk6IHN0cmluZyB8IG51bGwsIFxuLyoqXG4gKiBUaGUgY2l0eSBzdGFuZGluZyBvbiBpdC5cbiAqL1xuc2V0dGxlbWVudDogc3RyaW5nIHwgbnVsbCwgdW5pdDogc3RyaW5nIHwgbnVsbCwgfTtcbmV4cG9ydCB0eXBlIFRpbGVQb3MgPSB7IGNvbDogbnVtYmVyLCByb3c6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFVuaXRJbmZvID0geyBpZDogc3RyaW5nLCBraW5kOiBzdHJpbmcsIGNpdjogc3RyaW5nLCBjb2w6IG51bWJlciwgcm93OiBudW1iZXIsIFxuLyoqXG4gKiBUaGUgZmlndXJlIGl0cyBmbGFnIGlzIHBpbm5lZCB0byAoYEVudGl0eTo6dG9fYml0c2ApLlxuICovXG5lbnRpdHk6IG51bWJlciwgXG4vKipcbiAqIE91dCBpbiB0aGUgcGFyY2htZW50LCB1bnNlZW4uXG4gKi9cbmhpZGRlbjogYm9vbGVhbiwgfTtcbmV4cG9ydCB0eXBlIFdpbmRvd1NpemUgPSB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgV29ybGRJbmZvID0geyBjb2xzOiBudW1iZXIsIHJvd3M6IG51bWJlciwgXG4vKipcbiAqIFRoZSByaW5nIG92ZXIgdGhlIGhvdmVyZWQgdGlsZSwgZm9yIHRoZSB0b29sdGlwJ3MgYDxhbmNob3I+YC5cbiAqL1xuY3Vyc29yOiBudW1iZXIsIGNpdnM6IEFycmF5PENpdkluZm8+LCBjaXRpZXM6IEFycmF5PENpdHlJbmZvPiwgdW5pdHM6IEFycmF5PFVuaXRJbmZvPiwgfTtcbmV4cG9ydCB0eXBlIFlpZWxkcyA9IHsgZm9vZDogbnVtYmVyLCBwcm9kdWN0aW9uOiBudW1iZXIsIGdvbGQ6IG51bWJlciwgc2NpZW5jZTogbnVtYmVyLCBjdWx0dXJlOiBudW1iZXIsIGZhaXRoOiBudW1iZXIsIH07XG5cbi8qKiBFdmVyeSBgZW1pdGAgbmFtZSBhbmQgdGhlIHBheWxvYWQgdHlwZSBpdCBjYXJyaWVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFjdE1lc3NhZ2VzIHtcbiAgXCJnYW1lcGFkLnJ1bWJsZVwiOiBHYW1lcGFkUnVtYmxlO1xuICBcImdhbWVwYWQuc3RvcFJ1bWJsZVwiOiBHYW1lcGFkU3RvcFJ1bWJsZTtcbiAgXCJtYXAuZm9jdXNcIjogRm9jdXM7XG4gIFwibWFwLmp1bXBcIjogSnVtcDtcbiAgXCJtYXAubGVuc1wiOiBMZW5zO1xuICBcIm1hcC5zZWxlY3RcIjogU2VsZWN0O1xufVxuXG4vKiogRXZlcnkgYHJlcXVlc3RgIG5hbWUgYW5kIGl0cyByZXF1ZXN0L3Jlc3BvbnNlIHR5cGVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWFjdFJlcXVlc3RzIHtcbiAgXCJnYW1lcGFkLmdldEFsbFwiOiB7IHJlcXVlc3Q6IG51bGw7IHJlc3BvbnNlOiBBcnJheTxHYW1lcGFkQ29ubmVjdGVkRGF0YT4gfTtcbiAgXCJtYXAud29ybGRcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogV29ybGRJbmZvIH07XG4gIFwid2luZG93LnNpemVcIjogeyByZXF1ZXN0OiBudWxsOyByZXNwb25zZTogV2luZG93U2l6ZSB9O1xufVxuXG4vKiogRXZlcnkgQmV2eSDihpIgUmVhY3QgZXZlbnQgbmFtZSBhbmQgdGhlIHBheWxvYWQgaXQgY2Fycmllcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RFdmVudHMge1xuICBcImRlYnVnLmFjdFwiOiBBY3Q7XG4gIGdhbWVwYWRDb25uZWN0ZWQ6IEdhbWVwYWRDb25uZWN0ZWQ7XG4gIGdhbWVwYWREaXNjb25uZWN0ZWQ6IEdhbWVwYWREaXNjb25uZWN0ZWQ7XG4gIGdhbWVwYWRJbnB1dDogR2FtZXBhZElucHV0RXZlbnQ7XG4gIGtleURvd246IEtleURvd247XG4gIGtleVVwOiBLZXlVcDtcbiAgXCJtYXAuY2xpY2tcIjogQ2xpY2tUaWxlO1xuICBcIm1hcC5ob3ZlclwiOiBIb3ZlclRpbGU7XG4gIHJlc2l6ZTogUmVzaXplO1xufVxuXG4vKiogRXZlcnkgcmVnaXN0ZXJlZCBmaWx0ZXIgbmFtZSBhbmQgaXRzIHBhcmFtcyB0eXBlLCBzcGxpdCBieSBmYW1pbHkuXG4gKiAgQXVnbWVudHMgdGhlIGVtcHR5IGBCZXZ5RmlsdGVyc2AgKHJlZ3VsYXIgZmlsdGVycyDigJQgdGhlIGBmaWx0ZXJgIGFuZFxuICogIGBiYWNrZHJvcEZpbHRlcmAgY2hhaW5zKSBhbmQgYEJldnlNb3JwaEZpbHRlcnNgICh0d28taW5wdXQgbW9ycGhcbiAqICBmaWx0ZXJzIOKAlCB0aGUgYG1vcnBoRmlsdGVyYCBzdHlsZSkgcmVnaXN0cnkgaW50ZXJmYWNlcyBpbiB0aGVcbiAqICBgYmV2eS1yZWFjdGAgcGFja2FnZSwgc28gZWFjaCBzdHlsZSBmaWVsZCB0eXBlcyBpdHMgbmFtZXMnIHBhcmFtcy4gKi9cbmRlY2xhcmUgbW9kdWxlIFwiYmV2eS1yZWFjdFwiIHtcbiAgaW50ZXJmYWNlIEJldnlGaWx0ZXJzIHtcbiAgICBibG9vbTogQmxvb21QYXJhbXM7XG4gICAgYmx1cjogQmx1clBhcmFtcztcbiAgICBicmlnaHRuZXNzOiBCcmlnaHRuZXNzUGFyYW1zO1xuICAgIGNocm9tYXRpY0FiZXJyYXRpb246IENocm9tYXRpY0FiZXJyYXRpb25QYXJhbXM7XG4gICAgY29udHJhc3Q6IENvbnRyYXN0UGFyYW1zO1xuICAgIGdyYWRpZW50TWFwOiBHcmFkaWVudE1hcFBhcmFtcztcbiAgICBncmF5c2NhbGU6IEdyYXlzY2FsZVBhcmFtcztcbiAgICBodWVSb3RhdGU6IEh1ZVJvdGF0ZVBhcmFtcztcbiAgICBpbnZlcnQ6IEludmVydFBhcmFtcztcbiAgICBvdXRsaW5lOiBPdXRsaW5lUGFyYW1zO1xuICAgIHBpbmNoOiBQaW5jaFBhcmFtcztcbiAgICBzYXR1cmF0ZTogU2F0dXJhdGVQYXJhbXM7XG4gICAgc2VwaWE6IFNlcGlhUGFyYW1zO1xuICAgIHNoYWRvdzogU2hhZG93UGFyYW1zO1xuICB9XG4gIGludGVyZmFjZSBCZXZ5TW9ycGhGaWx0ZXJzIHtcbiAgICBjcm9zc2ZhZGU6IENyb3NzZmFkZVBhcmFtcztcbiAgICBsaW5lYXJXaXBlOiBMaW5lYXJXaXBlUGFyYW1zO1xuICAgIHBpeGVsaXplOiBQaXhlbGl6ZVBhcmFtcztcbiAgfVxufVxuXG4vKiogVGhlIGFwcCdzIG93biBlbGVtZW50cycgcHJvcHMgKGBhcHAuYWRkX3JlYWN0X2VsZW1lbnRgKS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUFuY2hvclByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgZW50aXR5OiBudW1iZXIgfCBiaWdpbnQ7XG4gIG9mZnNldD86IFZlYzM7XG4gIHNjYWxlPzogQW5jaG9yU2NhbGluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUNhbnZhc1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgZHJhdz86IENhbnZhc1BhaW50ZXIgfCBEcmF3Q21kW107XG4gIG9uUmVzaXplPzogKHBheWxvYWQ6IENhbnZhc1NpemUpID0+IHZvaWQ7XG4gIHJlZj86IFJlZjxCZXZ5Q2FudmFzRWxlbWVudD47XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlDaXJjbGVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgY3g/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGN5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5RWxsaXBzZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBjeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgY3k/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHJ4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUdQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzIHtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUxpbmVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgeDE/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHkxPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB4Mj86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgeTI/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQYXRoUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIGQ/OiBzdHJpbmc7XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb2x5Z29uUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIHBvaW50cz86IG51bWJlcltdO1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UG9seWxpbmVQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgcG9pbnRzPzogbnVtYmVyW107XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb3J0YWxQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UmVjdFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICB4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB3aWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgaGVpZ2h0PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcnk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlTdXJmYWNlUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVN2Z1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMge1xuICBzdHlsZT86IEJldnlTdHlsZTtcbiAgdmlld0JveD86IHN0cmluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbi8qKiBUaGUgYXBwJ3Mgb3duIGVsZW1lbnRzIChgYXBwLmFkZF9yZWFjdF9lbGVtZW50YCkuIEF1Z21lbnRzIHRoZVxuICogIGBCZXZ5SW50cmluc2ljRWxlbWVudHNgIGludGVyZmFjZSBpbiB0aGUgYGJldnktcmVhY3RgIHBhY2thZ2UsIHNvIEpTWFxuICogIHR5cGVzIHRoZW0uICovXG5kZWNsYXJlIG1vZHVsZSBcImJldnktcmVhY3RcIiB7XG4gIGludGVyZmFjZSBCZXZ5SW50cmluc2ljRWxlbWVudHMge1xuICAgIGFuY2hvcjogQmV2eUFuY2hvclByb3BzO1xuICAgIGNhbnZhczogQmV2eUNhbnZhc1Byb3BzO1xuICAgIGNpcmNsZTogQmV2eUNpcmNsZVByb3BzO1xuICAgIGVsbGlwc2U6IEJldnlFbGxpcHNlUHJvcHM7XG4gICAgZzogQmV2eUdQcm9wcztcbiAgICBsaW5lOiBCZXZ5TGluZVByb3BzO1xuICAgIHBhdGg6IEJldnlQYXRoUHJvcHM7XG4gICAgcG9seWdvbjogQmV2eVBvbHlnb25Qcm9wcztcbiAgICBwb2x5bGluZTogQmV2eVBvbHlsaW5lUHJvcHM7XG4gICAgcG9ydGFsOiBCZXZ5UG9ydGFsUHJvcHM7XG4gICAgcmVjdDogQmV2eVJlY3RQcm9wcztcbiAgICBzdXJmYWNlOiBCZXZ5U3VyZmFjZVByb3BzO1xuICAgIHN2ZzogQmV2eVN2Z1Byb3BzO1xuICB9XG59XG5cbi8qKiBTZW5kIGEgdHlwZWQgYXBwIG1lc3NhZ2UgdG8gdGhlIEJldnkgc2lkZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbWl0PEsgZXh0ZW5kcyBrZXlvZiBSZWFjdE1lc3NhZ2VzPihuYW1lOiBLLCB2YWx1ZTogUmVhY3RNZXNzYWdlc1tLXSk6IHZvaWQge1xuICByYXdFbWl0KG5hbWUsIHZhbHVlKTtcbn1cblxuLyoqIFNlbmQgYSB0eXBlZCByZXF1ZXN0IGFuZCBhd2FpdCBpdHMgdHlwZWQgcmVzcG9uc2UuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdDxLIGV4dGVuZHMga2V5b2YgUmVhY3RSZXF1ZXN0cz4oXG4gIG5hbWU6IEssXG4gIHZhbHVlOiBSZWFjdFJlcXVlc3RzW0tdW1wicmVxdWVzdFwiXSxcbik6IFByb21pc2U8UmVhY3RSZXF1ZXN0c1tLXVtcInJlc3BvbnNlXCJdPiB7XG4gIHJldHVybiByYXdSZXF1ZXN0KG5hbWUsIHZhbHVlKSBhcyBQcm9taXNlPFJlYWN0UmVxdWVzdHNbS11bXCJyZXNwb25zZVwiXT47XG59XG5cbi8qKiBTdWJzY3JpYmUgdG8gYSB0eXBlZCBCZXZ5IOKGkiBSZWFjdCBldmVudC4gUmV0dXJucyBhbiB1bnN1YnNjcmliZSBmbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbjxLIGV4dGVuZHMga2V5b2YgUmVhY3RFdmVudHM+KFxuICBuYW1lOiBLLFxuICBjYjogKHZhbHVlOiBSZWFjdEV2ZW50c1tLXSkgPT4gdm9pZCxcbik6ICgpID0+IHZvaWQge1xuICByYXdBZGRFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG4gIHJldHVybiAoKSA9PiByYXdSZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGNiIGFzICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCk7XG59XG5cbi8qKiBVbnN1YnNjcmliZSBhIGxpc3RlbmVyIHByZXZpb3VzbHkgcGFzc2VkIHRvIGBvbmAvYGFkZEV2ZW50TGlzdGVuZXJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXI8SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgY2I6ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pOiB2b2lkIHtcbiAgcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xufVxuXG4vKiogU3RydWN0dXJlZCwgZnVsbHkgdHlwZWQgcHJveHkgb3ZlciBldmVyeSBtZXNzYWdlLCByZXF1ZXN0LCBhbmQgZXZlbnQuICovXG5leHBvcnQgY29uc3QgYmV2eSA9IHtcbiAgZW1pdCxcbiAgcmVxdWVzdCxcbiAgb24sXG4gIGFkZEV2ZW50TGlzdGVuZXI6IG9uLFxuICByZW1vdmVFdmVudExpc3RlbmVyLFxuICBnYW1lcGFkOiB7XG4gICAgZ2V0QWxsKCk6IFByb21pc2U8QXJyYXk8R2FtZXBhZENvbm5lY3RlZERhdGE+PiB7IHJldHVybiByZXF1ZXN0KFwiZ2FtZXBhZC5nZXRBbGxcIiwgbnVsbCk7IH0sXG4gICAgcnVtYmxlKHZhbHVlOiBHYW1lcGFkUnVtYmxlKTogdm9pZCB7IGVtaXQoXCJnYW1lcGFkLnJ1bWJsZVwiLCB2YWx1ZSk7IH0sXG4gICAgc3RvcFJ1bWJsZSh2YWx1ZTogR2FtZXBhZFN0b3BSdW1ibGUpOiB2b2lkIHsgZW1pdChcImdhbWVwYWQuc3RvcFJ1bWJsZVwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIG1hcDoge1xuICAgIGZvY3VzKHZhbHVlOiBGb2N1cyk6IHZvaWQgeyBlbWl0KFwibWFwLmZvY3VzXCIsIHZhbHVlKTsgfSxcbiAgICBqdW1wKHZhbHVlOiBKdW1wKTogdm9pZCB7IGVtaXQoXCJtYXAuanVtcFwiLCB2YWx1ZSk7IH0sXG4gICAgbGVucyh2YWx1ZTogTGVucyk6IHZvaWQgeyBlbWl0KFwibWFwLmxlbnNcIiwgdmFsdWUpOyB9LFxuICAgIHNlbGVjdCh2YWx1ZTogU2VsZWN0KTogdm9pZCB7IGVtaXQoXCJtYXAuc2VsZWN0XCIsIHZhbHVlKTsgfSxcbiAgICB3b3JsZCgpOiBQcm9taXNlPFdvcmxkSW5mbz4geyByZXR1cm4gcmVxdWVzdChcIm1hcC53b3JsZFwiLCBudWxsKTsgfSxcbiAgfSxcbiAgd2luZG93OiB7XG4gICAgc2l6ZSgpOiBQcm9taXNlPFdpbmRvd1NpemU+IHsgcmV0dXJuIHJlcXVlc3QoXCJ3aW5kb3cuc2l6ZVwiLCBudWxsKTsgfSxcbiAgfSxcbn0gYXMgY29uc3Q7XG4iLCAiaW1wb3J0IHR5cGUgeyBJY29uTmFtZSB9IGZyb20gXCIuL3VpL0ljb25cIjtcblxuZXhwb3J0IHR5cGUgRXJhID0geyBuYW1lOiBzdHJpbmc7IGNvbHVtbnM6IG51bWJlciB9O1xuXG4vKiogVGhlIHRyZWUncyBlcmFzLCBsZWZ0IHRvIHJpZ2h0LCBhbmQgaG93IG1hbnkgY29sdW1ucyBlYWNoIHNwYW5zLiAqL1xuZXhwb3J0IGNvbnN0IEVSQVM6IEVyYVtdID0gW1xuICB7IG5hbWU6IFwiQW5jaWVudCBFcmFcIiwgY29sdW1uczogMyB9LFxuICB7IG5hbWU6IFwiQ2xhc3NpY2FsIEVyYVwiLCBjb2x1bW5zOiAyIH0sXG4gIHsgbmFtZTogXCJNZWRpZXZhbCBFcmFcIiwgY29sdW1uczogMiB9LFxuICB7IG5hbWU6IFwiUmVuYWlzc2FuY2UgRXJhXCIsIGNvbHVtbnM6IDIgfSxcbl07XG5cbmV4cG9ydCB0eXBlIFRlY2ggPSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgY29sOiBudW1iZXI7XG4gIHJvdzogbnVtYmVyO1xuICBjb3N0OiBudW1iZXI7XG4gIHJlcXVpcmVzOiBzdHJpbmdbXTtcbiAgaWNvbjogSWNvbk5hbWU7XG4gIC8qKiBXaGF0IGl0IHVubG9ja3MsIGFzIHNtYWxsIGljb25zIHdpdGggY2FwdGlvbnMuICovXG4gIHVubG9ja3M6IHsgaWNvbjogSWNvbk5hbWU7IG5hbWU6IHN0cmluZyB9W107XG4gIC8qKiBBIGRlZWQgdGhhdCBzcGVlZHMgaXQgdXAuICovXG4gIGJvb3N0OiBzdHJpbmc7XG59O1xuXG5jb25zdCB0ID0gKFxuICBpZDogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGNvbDogbnVtYmVyLFxuICByb3c6IG51bWJlcixcbiAgcmVxdWlyZXM6IHN0cmluZ1tdLFxuICBpY29uOiBJY29uTmFtZSxcbiAgdW5sb2NrczogW0ljb25OYW1lLCBzdHJpbmddW10sXG4gIGJvb3N0OiBzdHJpbmcsXG4pOiBUZWNoID0+ICh7XG4gIGlkLFxuICBuYW1lLFxuICBjb2wsXG4gIHJvdyxcbiAgY29zdDogMzAgKyBjb2wgKiBjb2wgKiA3ICsgY29sICogMTAsXG4gIHJlcXVpcmVzLFxuICBpY29uLFxuICB1bmxvY2tzOiB1bmxvY2tzLm1hcCgoW2ljb24sIG5hbWVdKSA9PiAoeyBpY29uLCBuYW1lIH0pKSxcbiAgYm9vc3QsXG59KTtcblxuZXhwb3J0IGNvbnN0IFRFQ0hTOiBUZWNoW10gPSBbXG4gIHQoXG4gICAgXCJwb3R0ZXJ5XCIsXG4gICAgXCJQb3R0ZXJ5XCIsXG4gICAgMCxcbiAgICAwLFxuICAgIFtdLFxuICAgIFwiZm9vZFwiLFxuICAgIFtbXCJmb29kXCIsIFwiR3JhbmFyeVwiXV0sXG4gICAgXCJGb3VuZCBhIGNpdHlcIixcbiAgKSxcbiAgdChcbiAgICBcImh1c2JhbmRyeVwiLFxuICAgIFwiQW5pbWFsIEh1c2JhbmRyeVwiLFxuICAgIDAsXG4gICAgMixcbiAgICBbXSxcbiAgICBcIm1vdmVtZW50XCIsXG4gICAgW1tcIm1hcFwiLCBcIlBhc3R1cmVcIl1dLFxuICAgIFwiRmluZCBob3JzZXNcIixcbiAgKSxcbiAgdChcbiAgICBcIm1pbmluZ1wiLFxuICAgIFwiTWluaW5nXCIsXG4gICAgMCxcbiAgICA0LFxuICAgIFtdLFxuICAgIFwicHJvZHVjdGlvblwiLFxuICAgIFtbXCJwcm9kdWN0aW9uXCIsIFwiTWluZVwiXV0sXG4gICAgXCJTZXR0bGUgbmVhciBoaWxsc1wiLFxuICApLFxuICB0KFxuICAgIFwic2FpbGluZ1wiLFxuICAgIFwiU2FpbGluZ1wiLFxuICAgIDAsXG4gICAgNixcbiAgICBbXSxcbiAgICBcImFuY2hvclwiLFxuICAgIFtbXCJhbmNob3JcIiwgXCJHYWxsZXlcIl1dLFxuICAgIFwiRm91bmQgYSBjaXR5IG9uIHRoZSBjb2FzdFwiLFxuICApLFxuICB0KFxuICAgIFwiaXJyaWdhdGlvblwiLFxuICAgIFwiSXJyaWdhdGlvblwiLFxuICAgIDEsXG4gICAgMCxcbiAgICBbXCJwb3R0ZXJ5XCJdLFxuICAgIFwiZm9vZFwiLFxuICAgIFtbXCJmb29kXCIsIFwiRmFybSBvbiBwbGFpbnNcIl1dLFxuICAgIFwiRmFybSBhIHJlc291cmNlXCIsXG4gICksXG4gIHQoXG4gICAgXCJ3cml0aW5nXCIsXG4gICAgXCJXcml0aW5nXCIsXG4gICAgMSxcbiAgICAxLFxuICAgIFtcInBvdHRlcnlcIl0sXG4gICAgXCJib29rXCIsXG4gICAgW1tcInNjaWVuY2VcIiwgXCJDYW1wdXNcIl1dLFxuICAgIFwiTWVldCBhbm90aGVyIGNpdmlsaXphdGlvblwiLFxuICApLFxuICB0KFxuICAgIFwiYXJjaGVyeVwiLFxuICAgIFwiQXJjaGVyeVwiLFxuICAgIDEsXG4gICAgMixcbiAgICBbXCJodXNiYW5kcnlcIl0sXG4gICAgXCJib3dcIixcbiAgICBbW1wiYm93XCIsIFwiQXJjaGVyXCJdXSxcbiAgICBcIktpbGwgYSB1bml0IHdpdGggYSBzbGluZ2VyXCIsXG4gICksXG4gIHQoXG4gICAgXCJtYXNvbnJ5XCIsXG4gICAgXCJNYXNvbnJ5XCIsXG4gICAgMSxcbiAgICA0LFxuICAgIFtcIm1pbmluZ1wiXSxcbiAgICBcImNhc3RsZVwiLFxuICAgIFtbXCJjYXN0bGVcIiwgXCJBbmNpZW50IFdhbGxzXCJdXSxcbiAgICBcIkJ1aWxkIGEgcXVhcnJ5XCIsXG4gICksXG4gIHQoXG4gICAgXCJicm9uemVcIixcbiAgICBcIkJyb256ZSBXb3JraW5nXCIsXG4gICAgMSxcbiAgICA1LFxuICAgIFtcIm1pbmluZ1wiXSxcbiAgICBcInN0cmVuZ3RoXCIsXG4gICAgW1tcInN0cmVuZ3RoXCIsIFwiU3BlYXJtYW5cIl1dLFxuICAgIFwiS2lsbCB0aHJlZSBiYXJiYXJpYW5zXCIsXG4gICksXG4gIHQoXG4gICAgXCJhc3Ryb2xvZ3lcIixcbiAgICBcIkFzdHJvbG9neVwiLFxuICAgIDEsXG4gICAgNixcbiAgICBbXCJzYWlsaW5nXCJdLFxuICAgIFwiZmFpdGhcIixcbiAgICBbW1wiZmFpdGhcIiwgXCJIb2x5IFNpdGVcIl1dLFxuICAgIFwiRmluZCBhIG5hdHVyYWwgd29uZGVyXCIsXG4gICksXG4gIHQoXG4gICAgXCJ3aGVlbFwiLFxuICAgIFwiVGhlIFdoZWVsXCIsXG4gICAgMixcbiAgICAzLFxuICAgIFtcIm1pbmluZ1wiLCBcImh1c2JhbmRyeVwiXSxcbiAgICBcIm1vdmVtZW50XCIsXG4gICAgW1tcIm1vdmVtZW50XCIsIFwiSGVhdnkgQ2hhcmlvdFwiXV0sXG4gICAgXCJNaW5lIGEgcmVzb3VyY2VcIixcbiAgKSxcbiAgdChcbiAgICBcImN1cnJlbmN5XCIsXG4gICAgXCJDdXJyZW5jeVwiLFxuICAgIDMsXG4gICAgMSxcbiAgICBbXCJ3cml0aW5nXCJdLFxuICAgIFwiZ29sZFwiLFxuICAgIFtbXCJnb2xkXCIsIFwiTWFya2V0XCJdXSxcbiAgICBcIk1ha2UgYSB0cmFkZSByb3V0ZVwiLFxuICApLFxuICB0KFxuICAgIFwicmlkaW5nXCIsXG4gICAgXCJIb3JzZWJhY2sgUmlkaW5nXCIsXG4gICAgMyxcbiAgICAyLFxuICAgIFtcImFyY2hlcnlcIl0sXG4gICAgXCJtb3ZlbWVudFwiLFxuICAgIFtbXCJtb3ZlbWVudFwiLCBcIkhvcnNlbWFuXCJdXSxcbiAgICBcIkJ1aWxkIGEgcGFzdHVyZVwiLFxuICApLFxuICB0KFxuICAgIFwiaXJvblwiLFxuICAgIFwiSXJvbiBXb3JraW5nXCIsXG4gICAgMyxcbiAgICA1LFxuICAgIFtcImJyb256ZVwiXSxcbiAgICBcInN0cmVuZ3RoXCIsXG4gICAgW1tcInN0cmVuZ3RoXCIsIFwiU3dvcmRzbWFuXCJdXSxcbiAgICBcIkJ1aWxkIGFuIGlyb24gbWluZVwiLFxuICApLFxuICB0KFxuICAgIFwibmF2aWdhdGlvblwiLFxuICAgIFwiQ2VsZXN0aWFsIE5hdmlnYXRpb25cIixcbiAgICAzLFxuICAgIDYsXG4gICAgW1wic2FpbGluZ1wiLCBcImFzdHJvbG9neVwiXSxcbiAgICBcImFuY2hvclwiLFxuICAgIFtbXCJhbmNob3JcIiwgXCJIYXJib3JcIl1dLFxuICAgIFwiSW1wcm92ZSB0d28gc2VhIHJlc291cmNlc1wiLFxuICApLFxuICB0KFxuICAgIFwibWF0aGVtYXRpY3NcIixcbiAgICBcIk1hdGhlbWF0aWNzXCIsXG4gICAgNCxcbiAgICAxLFxuICAgIFtcImN1cnJlbmN5XCJdLFxuICAgIFwic2NpZW5jZVwiLFxuICAgIFtbXCJzY2llbmNlXCIsIFwiKzEgbW92ZW1lbnQgYXQgc2VhXCJdXSxcbiAgICBcIkJ1aWxkIHRocmVlIGRpc3RyaWN0c1wiLFxuICApLFxuICB0KFxuICAgIFwiY29uc3RydWN0aW9uXCIsXG4gICAgXCJDb25zdHJ1Y3Rpb25cIixcbiAgICA0LFxuICAgIDMsXG4gICAgW1wibWFzb25yeVwiLCBcIndoZWVsXCJdLFxuICAgIFwiY2FzdGxlXCIsXG4gICAgW1tcImN1bHR1cmVcIiwgXCJBbXBoaXRoZWF0ZXJcIl1dLFxuICAgIFwiQnVpbGQgYSB3YXRlciBtaWxsXCIsXG4gICksXG4gIHQoXG4gICAgXCJzaGlwYnVpbGRpbmdcIixcbiAgICBcIlNoaXBidWlsZGluZ1wiLFxuICAgIDQsXG4gICAgNixcbiAgICBbXCJuYXZpZ2F0aW9uXCJdLFxuICAgIFwiYW5jaG9yXCIsXG4gICAgW1tcImFuY2hvclwiLCBcIlF1YWRyaXJlbWVcIl1dLFxuICAgIFwiT3duIHR3byBnYWxsZXlzXCIsXG4gICksXG4gIHQoXG4gICAgXCJlbmdpbmVlcmluZ1wiLFxuICAgIFwiRW5naW5lZXJpbmdcIixcbiAgICA0LFxuICAgIDQsXG4gICAgW1wid2hlZWxcIl0sXG4gICAgXCJwcm9kdWN0aW9uXCIsXG4gICAgW1tcImNhc3RsZVwiLCBcIkFxdWVkdWN0XCJdXSxcbiAgICBcIkJ1aWxkIGFuY2llbnQgd2FsbHNcIixcbiAgKSxcbiAgdChcbiAgICBcInRhY3RpY3NcIixcbiAgICBcIk1pbGl0YXJ5IFRhY3RpY3NcIixcbiAgICA1LFxuICAgIDIsXG4gICAgW1wibWF0aGVtYXRpY3NcIl0sXG4gICAgXCJzdHJlbmd0aFwiLFxuICAgIFtbXCJzdHJlbmd0aFwiLCBcIlBpa2VtYW5cIl1dLFxuICAgIFwiS2lsbCBhIHVuaXQgd2l0aCBhIHNwZWFybWFuXCIsXG4gICksXG4gIHQoXG4gICAgXCJhcHByZW50aWNlc2hpcFwiLFxuICAgIFwiQXBwcmVudGljZXNoaXBcIixcbiAgICA1LFxuICAgIDQsXG4gICAgW1wiY3VycmVuY3lcIiwgXCJlbmdpbmVlcmluZ1wiXSxcbiAgICBcInByb2R1Y3Rpb25cIixcbiAgICBbW1wicHJvZHVjdGlvblwiLCBcIkluZHVzdHJpYWwgWm9uZVwiXV0sXG4gICAgXCJCdWlsZCB0aHJlZSBtaW5lc1wiLFxuICApLFxuICB0KFxuICAgIFwibWFjaGluZXJ5XCIsXG4gICAgXCJNYWNoaW5lcnlcIixcbiAgICA2LFxuICAgIDMsXG4gICAgW1wiaXJvblwiLCBcImVuZ2luZWVyaW5nXCJdLFxuICAgIFwicHJvZHVjdGlvblwiLFxuICAgIFtbXCJib3dcIiwgXCJDcm9zc2Jvd21hblwiXV0sXG4gICAgXCJPd24gdGhyZWUgYXJjaGVyc1wiLFxuICApLFxuICB0KFxuICAgIFwiZWR1Y2F0aW9uXCIsXG4gICAgXCJFZHVjYXRpb25cIixcbiAgICA2LFxuICAgIDEsXG4gICAgW1wibWF0aGVtYXRpY3NcIiwgXCJhcHByZW50aWNlc2hpcFwiXSxcbiAgICBcImJvb2tcIixcbiAgICBbW1wiYm9va1wiLCBcIlVuaXZlcnNpdHlcIl1dLFxuICAgIFwiRWFybiBhIEdyZWF0IFNjaWVudGlzdFwiLFxuICApLFxuICB0KFxuICAgIFwic3RpcnJ1cHNcIixcbiAgICBcIlN0aXJydXBzXCIsXG4gICAgNixcbiAgICAyLFxuICAgIFtcInJpZGluZ1wiXSxcbiAgICBcIm1vdmVtZW50XCIsXG4gICAgW1tcIm1vdmVtZW50XCIsIFwiS25pZ2h0XCJdXSxcbiAgICBcIkhhdmUgdGhlIEZldWRhbGlzbSBjaXZpY1wiLFxuICApLFxuICB0KFxuICAgIFwiZW5naW5lZXJzXCIsXG4gICAgXCJNaWxpdGFyeSBFbmdpbmVlcmluZ1wiLFxuICAgIDUsXG4gICAgNSxcbiAgICBbXCJjb25zdHJ1Y3Rpb25cIl0sXG4gICAgXCJjYXN0bGVcIixcbiAgICBbW1wiY2FzdGxlXCIsIFwiTWVkaWV2YWwgV2FsbHNcIl1dLFxuICAgIFwiQnVpbGQgYW4gYXF1ZWR1Y3RcIixcbiAgKSxcbiAgdChcbiAgICBcImNhc3RsZXNcIixcbiAgICBcIkNhc3RsZXNcIixcbiAgICA2LFxuICAgIDUsXG4gICAgW1wiZW5naW5lZXJzXCJdLFxuICAgIFwiY2FzdGxlXCIsXG4gICAgW1tcImNhc3RsZVwiLCBcIkZvcnRyZXNzXCJdXSxcbiAgICBcIkhhdmUgYSBnb3Zlcm5tZW50IHdpdGggc2l4IHNsb3RzXCIsXG4gICksXG4gIHQoXG4gICAgXCJjYXJ0b2dyYXBoeVwiLFxuICAgIFwiQ2FydG9ncmFwaHlcIixcbiAgICA3LFxuICAgIDYsXG4gICAgW1wic2hpcGJ1aWxkaW5nXCJdLFxuICAgIFwibWFwXCIsXG4gICAgW1tcImFuY2hvclwiLCBcIkNhcmF2ZWxcIl1dLFxuICAgIFwiQnVpbGQgdHdvIGhhcmJvcnNcIixcbiAgKSxcbiAgdChcbiAgICBcInByb2R1Y3Rpb25cIixcbiAgICBcIk1hc3MgUHJvZHVjdGlvblwiLFxuICAgIDcsXG4gICAgNCxcbiAgICBbXCJlZHVjYXRpb25cIiwgXCJzaGlwYnVpbGRpbmdcIl0sXG4gICAgXCJwcm9kdWN0aW9uXCIsXG4gICAgW1tcInByb2R1Y3Rpb25cIiwgXCJMdW1iZXIgbWlsbFwiXV0sXG4gICAgXCJCdWlsZCBhIHdhdGVyIG1pbGxcIixcbiAgKSxcbiAgdChcbiAgICBcImJhbmtpbmdcIixcbiAgICBcIkJhbmtpbmdcIixcbiAgICA3LFxuICAgIDEsXG4gICAgW1wiZWR1Y2F0aW9uXCIsIFwiYXBwcmVudGljZXNoaXBcIl0sXG4gICAgXCJnb2xkXCIsXG4gICAgW1tcImdvbGRcIiwgXCJCYW5rXCJdXSxcbiAgICBcIkhhdmUgdGhlIEd1aWxkcyBjaXZpY1wiLFxuICApLFxuICB0KFxuICAgIFwiZ3VucG93ZGVyXCIsXG4gICAgXCJHdW5wb3dkZXJcIixcbiAgICA3LFxuICAgIDMsXG4gICAgW1wibWFjaGluZXJ5XCIsIFwiYXBwcmVudGljZXNoaXBcIl0sXG4gICAgXCJzdHJlbmd0aFwiLFxuICAgIFtbXCJzdHJlbmd0aFwiLCBcIk11c2tldG1hblwiXV0sXG4gICAgXCJCdWlsZCBhbiBhcm1vcnlcIixcbiAgKSxcbiAgdChcbiAgICBcInByaW50aW5nXCIsXG4gICAgXCJQcmludGluZ1wiLFxuICAgIDgsXG4gICAgMixcbiAgICBbXCJtYWNoaW5lcnlcIl0sXG4gICAgXCJib29rXCIsXG4gICAgW1tcImJvb2tcIiwgXCJQcmludGluZyBwcmVzc1wiXV0sXG4gICAgXCJCdWlsZCB0d28gdW5pdmVyc2l0aWVzXCIsXG4gICksXG4gIHQoXG4gICAgXCJhc3Ryb25vbXlcIixcbiAgICBcIkFzdHJvbm9teVwiLFxuICAgIDgsXG4gICAgMCxcbiAgICBbXCJlZHVjYXRpb25cIl0sXG4gICAgXCJleWVcIixcbiAgICBbW1wic2NpZW5jZVwiLCBcIk9ic2VydmF0b3J5XCJdXSxcbiAgICBcIkJ1aWxkIGEgdW5pdmVyc2l0eSBuZXh0IHRvIGEgbW91bnRhaW5cIixcbiAgKSxcbiAgdChcbiAgICBcInNpZWdlXCIsXG4gICAgXCJTaWVnZSBUYWN0aWNzXCIsXG4gICAgOCxcbiAgICA1LFxuICAgIFtcImNhc3RsZXNcIiwgXCJndW5wb3dkZXJcIl0sXG4gICAgXCJzdHJlbmd0aFwiLFxuICAgIFtbXCJzdHJlbmd0aFwiLCBcIkJvbWJhcmRcIl1dLFxuICAgIFwiT3duIHR3byBoZWF2eSBjaGFyaW90c1wiLFxuICApLFxuXTtcblxuZXhwb3J0IGNvbnN0IHRlY2ggPSAoaWQ6IHN0cmluZykgPT4gVEVDSFMuZmluZCgodCkgPT4gdC5pZCA9PT0gaWQpITtcblxuLyoqIFdoYXQgdGhlIGVtcGlyZSBrbm93cyBhdCB0aGUgc3RhcnQ6IHRoZSBhbmNpZW50IGFuZCBjbGFzc2ljYWwgZXJhc1xuICogIChiYXIgYSBzdHJhZ2dsZXIpIGFuZCB0aGUgZmlyc3Qgb2YgdGhlIG1lZGlldmFsLiAqL1xuZXhwb3J0IGNvbnN0IFNUQVJUSU5HX1RFQ0hTID0gVEVDSFMuZmlsdGVyKFxuICAodCkgPT5cbiAgICAodC5jb2wgPD0gNCAmJiB0LmlkICE9PSBcInNoaXBidWlsZGluZ1wiKSB8fFxuICAgIFtcInRhY3RpY3NcIiwgXCJhcHByZW50aWNlc2hpcFwiLCBcImVuZ2luZWVyc1wiXS5pbmNsdWRlcyh0LmlkKSxcbikubWFwKCh0KSA9PiB0LmlkKTtcblxuZXhwb3J0IGNvbnN0IENJVklDUyA9IFtcbiAgXCJQb2xpdGljYWwgUGhpbG9zb3BoeVwiLFxuICBcIkRyYW1hIGFuZCBQb2V0cnlcIixcbiAgXCJNaWxpdGFyeSBUcmFpbmluZ1wiLFxuICBcIkRlZmVuc2l2ZSBUYWN0aWNzXCIsXG4gIFwiUmVjb3JkZWQgSGlzdG9yeVwiLFxuICBcIlRoZW9sb2d5XCIsXG4gIFwiTmF2YWwgVHJhZGl0aW9uXCIsXG4gIFwiRmV1ZGFsaXNtXCIsXG4gIFwiQ2l2aWwgU2VydmljZVwiLFxuICBcIk1lcmNlbmFyaWVzXCIsXG4gIFwiTWVkaWV2YWwgRmFpcmVzXCIsXG4gIFwiR3VpbGRzXCIsXG5dO1xuIiwgImltcG9ydCB0eXBlIHsgQmV2eVN0eWxlIH0gZnJvbSBcImJldnktcmVhY3RcIjtcblxuLyoqIENpdmlsaXphdGlvbidzIGxvb2ssIGFmdGVyIHRoZSBncmVhdCA0WCBpbnRlcmZhY2VzOiBkZWVwIG5hdnkgcGFuZWxzIGluIGZpbmVcbiAqICBnb2xkIGZyYW1lcywgcGFyY2htZW50LXdoaXRlIHR5cGUsIGNhcnZlZCBjYXBpdGFscyBmb3IgdGl0bGVzLCBhbmQgb25lXG4gKiAgY29sb3IgcGVyIGtpbmQgb2YgeWllbGQuICovXG5leHBvcnQgY29uc3QgQyA9IHtcbiAgaW5rOiBcIiMwNjBkMTVcIixcbiAgbmF2eTogXCIjMGQxODI2XCIsXG4gIG5hdnlIaTogXCIjMWIyZDQ0XCIsXG4gIHNsYXRlOiBcIiMyMjM4NGZcIixcbiAgc2xhdGVIaTogXCIjMmU0YjY5XCIsXG4gIGdvbGQ6IFwiI2Q5Yjc2Y1wiLFxuICBnb2xkSGk6IFwiI2Y2ZTRhOFwiLFxuICBnb2xkTG86IFwiIzhhNmIzNVwiLFxuICBnb2xkTGluZTogXCJyZ2JhKDIxNywgMTgzLCAxMDgsIDAuNDUpXCIsXG4gIHRleHQ6IFwiI2YwZThkNlwiLFxuICBtdXRlZDogXCIjYTJiM2M2XCIsXG4gIGZhaW50OiBcIiM2Mjc3OGRcIixcbiAgZ29vZDogXCIjN2FkMzVlXCIsXG4gIGJhZDogXCIjZWM2NDUwXCIsXG4gIC8vIFRoZSB5aWVsZHMuXG4gIGZvb2Q6IFwiIzhmZDM0ZlwiLFxuICBwcm9kdWN0aW9uOiBcIiNmMDliM2RcIixcbiAgY29pbjogXCIjZjZjZjRhXCIsXG4gIHNjaWVuY2U6IFwiIzVmYmZmNFwiLFxuICBjdWx0dXJlOiBcIiNkMDhhZWZcIixcbiAgZmFpdGg6IFwiI2U0ZGVmZVwiLFxufTtcblxuZXhwb3J0IGNvbnN0IEZvbnRzID0ge1xuICAvKiogQ2FydmVkIFJvbWFuIGNhcGl0YWxzLCBmb3IgdGl0bGVzLiAqL1xuICBkaXNwbGF5OiBcIkNpbnplbFwiLFxufTtcblxuZXhwb3J0IHR5cGUgWWllbGRLZXkgPVxuICB8IFwiZm9vZFwiXG4gIHwgXCJwcm9kdWN0aW9uXCJcbiAgfCBcImdvbGRcIlxuICB8IFwic2NpZW5jZVwiXG4gIHwgXCJjdWx0dXJlXCJcbiAgfCBcImZhaXRoXCI7XG5cbmV4cG9ydCBjb25zdCBZSUVMRFM6IHsga2V5OiBZaWVsZEtleTsgbmFtZTogc3RyaW5nOyBjb2xvcjogc3RyaW5nIH1bXSA9IFtcbiAgeyBrZXk6IFwiZm9vZFwiLCBuYW1lOiBcIkZvb2RcIiwgY29sb3I6IEMuZm9vZCB9LFxuICB7IGtleTogXCJwcm9kdWN0aW9uXCIsIG5hbWU6IFwiUHJvZHVjdGlvblwiLCBjb2xvcjogQy5wcm9kdWN0aW9uIH0sXG4gIHsga2V5OiBcImdvbGRcIiwgbmFtZTogXCJHb2xkXCIsIGNvbG9yOiBDLmNvaW4gfSxcbiAgeyBrZXk6IFwic2NpZW5jZVwiLCBuYW1lOiBcIlNjaWVuY2VcIiwgY29sb3I6IEMuc2NpZW5jZSB9LFxuICB7IGtleTogXCJjdWx0dXJlXCIsIG5hbWU6IFwiQ3VsdHVyZVwiLCBjb2xvcjogQy5jdWx0dXJlIH0sXG4gIHsga2V5OiBcImZhaXRoXCIsIG5hbWU6IFwiRmFpdGhcIiwgY29sb3I6IEMuZmFpdGggfSxcbl07XG5cbi8qKiBUaGUgZnJhbWVkIG5hdnkgcGFuZWwgbmVhcmx5IGV2ZXJ5dGhpbmcgc2l0cyBvbi4gKi9cbmV4cG9ydCBjb25zdCBwYW5lbDogQmV2eVN0eWxlID0ge1xuICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgIGFuZ2xlOiAxODAsXG4gICAgc3RvcHM6IFt7IGNvbG9yOiBDLm5hdnlIaSB9LCB7IGNvbG9yOiBDLm5hdnkgfV0sXG4gIH0sXG4gIGJvcmRlcjogMSxcbiAgYm9yZGVyQ29sb3I6IEMuZ29sZExvLFxuICBib3JkZXJSYWRpdXM6IDMsXG4gIGJveFNoYWRvdzogeyBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNTUpXCIsIGJsdXJSYWRpdXM6IDE2LCB5T2Zmc2V0OiA1IH0sXG59O1xuXG4vKiogQnJ1c2hlZCBnb2xkLCBmb3IgcmluZ3MgYW5kIGZyYW1lcy4gKi9cbmV4cG9ydCBjb25zdCBnaWx0OiBCZXZ5U3R5bGVbXCJiYWNrZ3JvdW5kR3JhZGllbnRcIl0gPSB7XG4gIHR5cGU6IFwibGluZWFyXCIsXG4gIGFuZ2xlOiAxNjAsXG4gIHN0b3BzOiBbXG4gICAgeyBjb2xvcjogQy5nb2xkSGkgfSxcbiAgICB7IGNvbG9yOiBDLmdvbGQgfSxcbiAgICB7IGNvbG9yOiBDLmdvbGRMbyB9LFxuICAgIHsgY29sb3I6IEMuZ29sZCB9LFxuICBdLFxufTtcblxuLyoqIFNtYWxsIHNwYWNlZCBjYXBpdGFsczogc2VjdGlvbiB0aXRsZXMgYW5kIGxhYmVscy4gKi9cbmV4cG9ydCBjb25zdCBjYXBzOiBCZXZ5U3R5bGUgPSB7XG4gIGZvbnRTaXplOiAxMSxcbiAgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLFxuICBsZXR0ZXJTcGFjaW5nOiAxLjYsXG4gIGNvbG9yOiBDLmdvbGQsXG4gIGxpbmVCcmVhazogXCJub1dyYXBcIixcbn07XG5cbi8qKiBBIHBhbmVsJ3MgYGhvdmVyU3R5bGVgLiBBbnkgaG92ZXIgc3R5bGUgbWFrZXMgYSBub2RlIGludGVyYWN0aXZlLCBhbmRcbiAqICBob3ZlcmluZyBhbiBpbnRlcmFjdGl2ZSBub2RlIGlzIHdoYXQgYFBvaW50ZXJDYXB0dXJlYCByZXBvcnRzIGFzIHRoZVxuICogIHBvaW50ZXIgYmVpbmcgdGhlIFVJJ3Mg4oCUIHNvIHRoZSBtYXAgdW5kZXJuZWF0aCBhIHBhbmVsIGlnbm9yZXMgaXQuICovXG5leHBvcnQgY29uc3QgT1dOU19QT0lOVEVSID0ge307XG5cbi8qKiBBIHlpZWxkOiB3aG9sZSBhYm92ZSBhIGh1bmRyZWQgb3Igd2hlbiBpdCBpcyBvbmUsIGVsc2Ugb25lIGRlY2ltYWwuICovXG5leHBvcnQgY29uc3QgZm10ID0gKG46IG51bWJlcikgPT5cbiAgTWF0aC5hYnMobikgPj0gMTAwIHx8IE1hdGguYWJzKG4gLSBNYXRoLnJvdW5kKG4pKSA8IDAuMDVcbiAgICA/IE1hdGgucm91bmQobikudG9TdHJpbmcoKVxuICAgIDogbi50b0ZpeGVkKDEpO1xuXG5leHBvcnQgY29uc3Qgc2lnbmVkID0gKG46IG51bWJlcikgPT4gKG4gPj0gMCA/IGArJHtmbXQobil9YCA6IGZtdChuKSk7XG5cbi8qKiBgaGV4YCBsaWdodGVuZWQgdG93YXJkIHdoaXRlIChgayA+IDFgKSBvciBkYXJrZW5lZCAoYGsgPCAxYCkuICovXG5leHBvcnQgZnVuY3Rpb24gdG9uZShoZXg6IHN0cmluZywgazogbnVtYmVyKSB7XG4gIGNvbnN0IG4gPSBwYXJzZUludChoZXguc2xpY2UoMSwgNyksIDE2KTtcbiAgcmV0dXJuIChcbiAgICBcIiNcIiArXG4gICAgWyhuID4+IDE2KSAmIDI1NSwgKG4gPj4gOCkgJiAyNTUsIG4gJiAyNTVdXG4gICAgICAubWFwKChjKSA9PiAoayA+PSAxID8gYyArICgyNTUgLSBjKSAqIChrIC0gMSkgOiBjICogaykpXG4gICAgICAubWFwKChjKSA9PlxuICAgICAgICBNYXRoLnJvdW5kKE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgYykpKVxuICAgICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgICAucGFkU3RhcnQoMiwgXCIwXCIpLFxuICAgICAgKVxuICAgICAgLmpvaW4oXCJcIilcbiAgKTtcbn1cblxuLyoqIGBhYCBibGVuZGVkIGB0YCBvZiB0aGUgd2F5IHRvIGBiYCAob3BhcXVlIGhleCBjb2xvcnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1peChhOiBzdHJpbmcsIGI6IHN0cmluZywgdDogbnVtYmVyKSB7XG4gIGNvbnN0IGNoID0gKGhleDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgbiA9IHBhcnNlSW50KGhleC5zbGljZSgxLCA3KSwgMTYpO1xuICAgIHJldHVybiBbKG4gPj4gMTYpICYgMjU1LCAobiA+PiA4KSAmIDI1NSwgbiAmIDI1NV07XG4gIH07XG4gIGNvbnN0IFt4LCB5XSA9IFtjaChhKSwgY2goYildO1xuICByZXR1cm4gKFxuICAgIFwiI1wiICtcbiAgICB4XG4gICAgICAubWFwKChjLCBpKSA9PlxuICAgICAgICBNYXRoLnJvdW5kKGMgKyAoeVtpXSAtIGMpICogdClcbiAgICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgICAgLnBhZFN0YXJ0KDIsIFwiMFwiKSxcbiAgICAgIClcbiAgICAgIC5qb2luKFwiXCIpXG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBDaXR5SW5mbywgQ2l2SW5mbywgV29ybGRJbmZvLCBZaWVsZHMgfSBmcm9tIFwiLi9iZXZ5XCI7XG5pbXBvcnQgeyBDSVZJQ1MsIFNUQVJUSU5HX1RFQ0hTLCB0ZWNoIH0gZnJvbSBcIi4vdGVjaHNcIjtcbmltcG9ydCB7IEMgfSBmcm9tIFwiLi90aGVtZVwiO1xuaW1wb3J0IHR5cGUgeyBJY29uTmFtZSB9IGZyb20gXCIuL3VpL0ljb25cIjtcblxuLyoqIE5vIGdhbWUgaXMgcGxheWVkIGhlcmU6IHRoZSBlbXBpcmUncyBudW1iZXJzIGFyZSBtYWRlIHVwIGZyb20gdGhlIG1hcFxuICogIChldmVyeSBjaXR5J3MgeWllbGRzIGNvbWUgZnJvbSB0aGUgdGlsZXMgYXJvdW5kIGl0KSBhbmQgYSBzZWVkZWRcbiAqICByYW5kb20gd2FsayBmb3IgdGhlIGhpc3RvcnkgdGhlIGdyYXBocyBkcmF3LiBcIk5leHQgdHVyblwiIGFkdmFuY2VzIGl0XG4gKiAgYWxsIGEgc3RlcC4gKi9cblxuY29uc3QgU1RBUlRfVFVSTiA9IDEyODtcblxuZXhwb3J0IHR5cGUgTWV0cmljID1cbiAgfCBcInNjb3JlXCJcbiAgfCBcInNjaWVuY2VcIlxuICB8IFwiY3VsdHVyZVwiXG4gIHwgXCJnb2xkXCJcbiAgfCBcImZhaXRoXCJcbiAgfCBcIm1pbGl0YXJ5XCJcbiAgfCBcInBvcHVsYXRpb25cIjtcblxuZXhwb3J0IGNvbnN0IE1FVFJJQ1M6IHtcbiAga2V5OiBNZXRyaWM7XG4gIG5hbWU6IHN0cmluZztcbiAgdW5pdDogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBpY29uOiBJY29uTmFtZTtcbn1bXSA9IFtcbiAge1xuICAgIGtleTogXCJzY29yZVwiLFxuICAgIG5hbWU6IFwiU2NvcmVcIixcbiAgICB1bml0OiBcInBvaW50c1wiLFxuICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICBpY29uOiBcInRyb3BoeVwiLFxuICB9LFxuICB7XG4gICAga2V5OiBcInNjaWVuY2VcIixcbiAgICBuYW1lOiBcIlNjaWVuY2VcIixcbiAgICB1bml0OiBcInBlciB0dXJuXCIsXG4gICAgY29sb3I6IEMuc2NpZW5jZSxcbiAgICBpY29uOiBcInNjaWVuY2VcIixcbiAgfSxcbiAge1xuICAgIGtleTogXCJjdWx0dXJlXCIsXG4gICAgbmFtZTogXCJDdWx0dXJlXCIsXG4gICAgdW5pdDogXCJwZXIgdHVyblwiLFxuICAgIGNvbG9yOiBDLmN1bHR1cmUsXG4gICAgaWNvbjogXCJjdWx0dXJlXCIsXG4gIH0sXG4gIHsga2V5OiBcImdvbGRcIiwgbmFtZTogXCJHb2xkXCIsIHVuaXQ6IFwicGVyIHR1cm5cIiwgY29sb3I6IEMuY29pbiwgaWNvbjogXCJnb2xkXCIgfSxcbiAge1xuICAgIGtleTogXCJmYWl0aFwiLFxuICAgIG5hbWU6IFwiRmFpdGhcIixcbiAgICB1bml0OiBcInBlciB0dXJuXCIsXG4gICAgY29sb3I6IEMuZmFpdGgsXG4gICAgaWNvbjogXCJmYWl0aFwiLFxuICB9LFxuICB7XG4gICAga2V5OiBcIm1pbGl0YXJ5XCIsXG4gICAgbmFtZTogXCJNaWxpdGFyeVwiLFxuICAgIHVuaXQ6IFwic3RyZW5ndGhcIixcbiAgICBjb2xvcjogQy5iYWQsXG4gICAgaWNvbjogXCJzdHJlbmd0aFwiLFxuICB9LFxuICB7XG4gICAga2V5OiBcInBvcHVsYXRpb25cIixcbiAgICBuYW1lOiBcIlBvcHVsYXRpb25cIixcbiAgICB1bml0OiBcImNpdGl6ZW5zXCIsXG4gICAgY29sb3I6IEMuZm9vZCxcbiAgICBpY29uOiBcInBlcnNvblwiLFxuICB9LFxuXTtcblxuZXhwb3J0IHR5cGUgTm90ZSA9IHtcbiAgaWQ6IG51bWJlcjtcbiAgaWNvbjogSWNvbk5hbWU7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGJvZHk6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEl0ZW0gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAga2luZDogXCJEaXN0cmljdFwiIHwgXCJCdWlsZGluZ1wiIHwgXCJVbml0XCI7XG4gIGNvc3Q6IG51bWJlcjtcbiAgaWNvbjogSWNvbk5hbWU7XG4gIGVmZmVjdDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNvbnN0IElURU1TOiBJdGVtW10gPSBbXG4gIHtcbiAgICBpZDogXCJjYW1wdXNcIixcbiAgICBuYW1lOiBcIkNhbXB1c1wiLFxuICAgIGtpbmQ6IFwiRGlzdHJpY3RcIixcbiAgICBjb3N0OiAxMDgsXG4gICAgaWNvbjogXCJzY2llbmNlXCIsXG4gICAgZWZmZWN0OiBcIisyIHNjaWVuY2UsIEdyZWF0IFNjaWVudGlzdCBwb2ludHNcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcInRoZWF0ZXJcIixcbiAgICBuYW1lOiBcIlRoZWF0ZXIgU3F1YXJlXCIsXG4gICAga2luZDogXCJEaXN0cmljdFwiLFxuICAgIGNvc3Q6IDEwOCxcbiAgICBpY29uOiBcImN1bHR1cmVcIixcbiAgICBlZmZlY3Q6IFwiKzIgY3VsdHVyZSwgR3JlYXQgV3JpdGVyIHBvaW50c1wiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwiaG9seXNpdGVcIixcbiAgICBuYW1lOiBcIkhvbHkgU2l0ZVwiLFxuICAgIGtpbmQ6IFwiRGlzdHJpY3RcIixcbiAgICBjb3N0OiAxMDgsXG4gICAgaWNvbjogXCJmYWl0aFwiLFxuICAgIGVmZmVjdDogXCIrMiBmYWl0aCwgR3JlYXQgUHJvcGhldCBwb2ludHNcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcImhhcmJvclwiLFxuICAgIG5hbWU6IFwiSGFyYm9yXCIsXG4gICAga2luZDogXCJEaXN0cmljdFwiLFxuICAgIGNvc3Q6IDEwOCxcbiAgICBpY29uOiBcImFuY2hvclwiLFxuICAgIGVmZmVjdDogXCIrMiBnb2xkLCArMSB0cmFkZSByb3V0ZVwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwibW9udW1lbnRcIixcbiAgICBuYW1lOiBcIk1vbnVtZW50XCIsXG4gICAga2luZDogXCJCdWlsZGluZ1wiLFxuICAgIGNvc3Q6IDYwLFxuICAgIGljb246IFwib2JlbGlza1wiLFxuICAgIGVmZmVjdDogXCIrMiBjdWx0dXJlXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJncmFuYXJ5XCIsXG4gICAgbmFtZTogXCJHcmFuYXJ5XCIsXG4gICAga2luZDogXCJCdWlsZGluZ1wiLFxuICAgIGNvc3Q6IDY1LFxuICAgIGljb246IFwiZm9vZFwiLFxuICAgIGVmZmVjdDogXCIrMSBmb29kLCArMiBob3VzaW5nXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJsaWJyYXJ5XCIsXG4gICAgbmFtZTogXCJMaWJyYXJ5XCIsXG4gICAga2luZDogXCJCdWlsZGluZ1wiLFxuICAgIGNvc3Q6IDkwLFxuICAgIGljb246IFwiYm9va1wiLFxuICAgIGVmZmVjdDogXCIrMiBzY2llbmNlXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJzaHJpbmVcIixcbiAgICBuYW1lOiBcIlNocmluZVwiLFxuICAgIGtpbmQ6IFwiQnVpbGRpbmdcIixcbiAgICBjb3N0OiA3MCxcbiAgICBpY29uOiBcImZhaXRoXCIsXG4gICAgZWZmZWN0OiBcIisyIGZhaXRoXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJtYXJrZXRcIixcbiAgICBuYW1lOiBcIk1hcmtldFwiLFxuICAgIGtpbmQ6IFwiQnVpbGRpbmdcIixcbiAgICBjb3N0OiAxMjAsXG4gICAgaWNvbjogXCJnb2xkXCIsXG4gICAgZWZmZWN0OiBcIiszIGdvbGRcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcIndhbGxzXCIsXG4gICAgbmFtZTogXCJBbmNpZW50IFdhbGxzXCIsXG4gICAga2luZDogXCJCdWlsZGluZ1wiLFxuICAgIGNvc3Q6IDgwLFxuICAgIGljb246IFwiY2FzdGxlXCIsXG4gICAgZWZmZWN0OiBcIisxMDAgY2l0eSBkZWZlbnNlXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJ3YXJyaW9yXCIsXG4gICAgbmFtZTogXCJXYXJyaW9yXCIsXG4gICAga2luZDogXCJVbml0XCIsXG4gICAgY29zdDogNDAsXG4gICAgaWNvbjogXCJzdHJlbmd0aFwiLFxuICAgIGVmZmVjdDogXCJNZWxlZSDCtyAyMCBzdHJlbmd0aFwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwiYXJjaGVyXCIsXG4gICAgbmFtZTogXCJBcmNoZXJcIixcbiAgICBraW5kOiBcIlVuaXRcIixcbiAgICBjb3N0OiA2MCxcbiAgICBpY29uOiBcImJvd1wiLFxuICAgIGVmZmVjdDogXCJSYW5nZWQgwrcgMjUgc3RyZW5ndGhcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcImJ1aWxkZXJcIixcbiAgICBuYW1lOiBcIkJ1aWxkZXJcIixcbiAgICBraW5kOiBcIlVuaXRcIixcbiAgICBjb3N0OiA1MCxcbiAgICBpY29uOiBcInByb2R1Y3Rpb25cIixcbiAgICBlZmZlY3Q6IFwiMyBidWlsZCBjaGFyZ2VzXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJzZXR0bGVyXCIsXG4gICAgbmFtZTogXCJTZXR0bGVyXCIsXG4gICAga2luZDogXCJVbml0XCIsXG4gICAgY29zdDogODAsXG4gICAgaWNvbjogXCJmbGFnXCIsXG4gICAgZWZmZWN0OiBcIkZvdW5kcyBhIG5ldyBjaXR5XCIsXG4gIH0sXG5dO1xuXG5leHBvcnQgY29uc3QgaXRlbSA9IChpZDogc3RyaW5nKSA9PiBJVEVNUy5maW5kKChpKSA9PiBpLmlkID09PSBpZCkhO1xuXG5leHBvcnQgdHlwZSBQcm9kdWN0aW9uID0geyBpdGVtOiBzdHJpbmc7IHByb2dyZXNzOiBudW1iZXIgfTtcblxuZXhwb3J0IGludGVyZmFjZSBHYW1lIHtcbiAgdHVybjogbnVtYmVyO1xuICBnb2xkOiBudW1iZXI7XG4gIGZhaXRoOiBudW1iZXI7XG4gIHJlc2VhcmNoOiBzdHJpbmcgfCBudWxsO1xuICByZXNlYXJjaGVkOiBzdHJpbmdbXTtcbiAgLyoqIFNjaWVuY2UgYmFua2VkIHRvd2FyZCBlYWNoIHRlY2guICovXG4gIHByb2dyZXNzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICBjaXZpYzogbnVtYmVyO1xuICBjaXZpY1Byb2dyZXNzOiBudW1iZXI7XG4gIC8qKiBUaGUgcGxheWVyJ3MgY2l0aWVzOiB3aGF0IGVhY2ggaXMgYnVpbGRpbmcsIGFuZCB3aGF0IGl0IGhhcyBidWlsdC4gKi9cbiAgYnVpbGRpbmc6IFJlY29yZDxzdHJpbmcsIFByb2R1Y3Rpb24+O1xuICBidWlsdDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xuICAvKiogUGVyIGNpdiwgcGVyIG1ldHJpYywgb25lIHZhbHVlIHBlciB0dXJuIHNvIGZhci4gKi9cbiAgaGlzdG9yeTogUmVjb3JkPHN0cmluZywgUmVjb3JkPE1ldHJpYywgbnVtYmVyW10+PjtcbiAgbm90ZXM6IE5vdGVbXTtcbiAgbmV4dE5vdGU6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgQWN0aW9uID1cbiAgfCB7IHR5cGU6IFwidHVyblwiIH1cbiAgfCB7IHR5cGU6IFwicmVzZWFyY2hcIjsgdGVjaDogc3RyaW5nIH1cbiAgfCB7IHR5cGU6IFwicHJvZHVjZVwiOyBjaXR5OiBzdHJpbmc7IGl0ZW06IHN0cmluZyB9XG4gIHwgeyB0eXBlOiBcImRpc21pc3NcIjsgaWQ6IG51bWJlciB9O1xuXG5leHBvcnQgY29uc3QgY2l2aWNDb3N0ID0gKG46IG51bWJlcikgPT4gMTgwICsgbiAqIDQ1O1xuXG4vKiogQSBzbWFsbCBzZWVkZWQgZ2VuZXJhdG9yIChtdWxiZXJyeTMyKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBybmcoc2VlZDogbnVtYmVyKSB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgc2VlZCA9IChzZWVkICsgMHg2ZDJiNzlmNSkgfCAwO1xuICAgIGxldCB0ID0gTWF0aC5pbXVsKHNlZWQgXiAoc2VlZCA+Pj4gMTUpLCAxIHwgc2VlZCk7XG4gICAgdCA9ICh0ICsgTWF0aC5pbXVsKHQgXiAodCA+Pj4gNyksIDYxIHwgdCkpIF4gdDtcbiAgICByZXR1cm4gKCh0IF4gKHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cblxuY29uc3Qgc2VlZE9mID0gKHM6IHN0cmluZykgPT5cbiAgWy4uLnNdLnJlZHVjZShcbiAgICAoaCwgY2gpID0+IE1hdGguaW11bChoIF4gY2guY2hhckNvZGVBdCgwKSwgMTY3Nzc2MTkpLFxuICAgIDIxNjYxMzYyNjEsXG4gICk7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b3RhbHMoXG4gIGNpdGllczogQ2l0eUluZm9bXSxcbiAgY2l2OiBzdHJpbmcsXG4pOiBZaWVsZHMgJiB7IHBvcHVsYXRpb246IG51bWJlciB9IHtcbiAgY29uc3Qgc3VtID0ge1xuICAgIGZvb2Q6IDAsXG4gICAgcHJvZHVjdGlvbjogMCxcbiAgICBnb2xkOiAwLFxuICAgIHNjaWVuY2U6IDAsXG4gICAgY3VsdHVyZTogMCxcbiAgICBmYWl0aDogMCxcbiAgICBwb3B1bGF0aW9uOiAwLFxuICB9O1xuICBmb3IgKGNvbnN0IGMgb2YgY2l0aWVzLmZpbHRlcigoYykgPT4gYy5jaXYgPT09IGNpdikpIHtcbiAgICBmb3IgKGNvbnN0IGsgb2YgW1xuICAgICAgXCJmb29kXCIsXG4gICAgICBcInByb2R1Y3Rpb25cIixcbiAgICAgIFwiZ29sZFwiLFxuICAgICAgXCJzY2llbmNlXCIsXG4gICAgICBcImN1bHR1cmVcIixcbiAgICAgIFwiZmFpdGhcIixcbiAgICBdIGFzIGNvbnN0KSB7XG4gICAgICBzdW1ba10gKz0gYy55aWVsZHNba107XG4gICAgfVxuICAgIHN1bS5wb3B1bGF0aW9uICs9IGMucG9wdWxhdGlvbjtcbiAgfVxuICByZXR1cm4gc3VtO1xufVxuXG4vKiogYGZpbmFsYCByZWFjaGVkIGJ5IGEgbm9pc3kgZ3Jvd3RoIGN1cnZlIG92ZXIgYHR1cm5zYC4gKi9cbmZ1bmN0aW9uIGN1cnZlKGZpbmFsOiBudW1iZXIsIHR1cm5zOiBudW1iZXIsIHNlZWQ6IG51bWJlciwgd29iYmxlOiBudW1iZXIpIHtcbiAgY29uc3QgciA9IHJuZyhzZWVkKTtcbiAgY29uc3QgcmF3OiBudW1iZXJbXSA9IFtdO1xuICBsZXQgZHJpZnQgPSAxO1xuICBmb3IgKGxldCB0ID0gMTsgdCA8PSB0dXJuczsgdCsrKSB7XG4gICAgZHJpZnQgPSBkcmlmdCAqIDAuODUgKyAoMSArIChyKCkgLSAwLjUpICogd29iYmxlKSAqIDAuMTU7XG4gICAgcmF3LnB1c2goKDAuMDMgKyAwLjk3ICogTWF0aC5wb3codCAvIHR1cm5zLCAxLjcpKSAqIGRyaWZ0KTtcbiAgfVxuICBjb25zdCBrID0gZmluYWwgLyByYXdbcmF3Lmxlbmd0aCAtIDFdO1xuICByZXR1cm4gcmF3Lm1hcCgodikgPT4gdiAqIGspO1xufVxuXG5mdW5jdGlvbiBzY29yZShoOiBSZWNvcmQ8TWV0cmljLCBudW1iZXJbXT4sIHQ6IG51bWJlcikge1xuICByZXR1cm4gKFxuICAgIDggK1xuICAgIHQgKiAwLjU1ICtcbiAgICBoLnBvcHVsYXRpb25bdF0gKiAzICtcbiAgICBoLnNjaWVuY2VbdF0gKiAyLjIgK1xuICAgIGguY3VsdHVyZVt0XSAqIDIgK1xuICAgIGgubWlsaXRhcnlbdF0gKiAwLjNcbiAgKTtcbn1cblxuZnVuY3Rpb24gaGlzdG9yeSh3b3JsZDogV29ybGRJbmZvLCBjaXY6IENpdkluZm8pOiBSZWNvcmQ8TWV0cmljLCBudW1iZXJbXT4ge1xuICBjb25zdCBzdW0gPSB0b3RhbHMod29ybGQuY2l0aWVzLCBjaXYuaWQpO1xuICBjb25zdCByID0gcm5nKHNlZWRPZihjaXYuaWQpKTtcbiAgY29uc3QgbiA9IFNUQVJUX1RVUk4gLSAxO1xuICBjb25zdCBjaXRpZXMgPSB3b3JsZC5jaXRpZXMuZmlsdGVyKChjKSA9PiBjLmNpdiA9PT0gY2l2LmlkKS5sZW5ndGg7XG4gIGNvbnN0IGggPSB7XG4gICAgc2NpZW5jZTogY3VydmUoc3VtLnNjaWVuY2UsIG4sIHNlZWRPZihjaXYuaWQgKyBcInNcIiksIDAuNSksXG4gICAgY3VsdHVyZTogY3VydmUoc3VtLmN1bHR1cmUsIG4sIHNlZWRPZihjaXYuaWQgKyBcImNcIiksIDAuNiksXG4gICAgZ29sZDogY3VydmUoc3VtLmdvbGQsIG4sIHNlZWRPZihjaXYuaWQgKyBcImdcIiksIDAuOCksXG4gICAgZmFpdGg6IGN1cnZlKE1hdGgubWF4KDEsIHN1bS5mYWl0aCksIG4sIHNlZWRPZihjaXYuaWQgKyBcImZcIiksIDAuOCksXG4gICAgbWlsaXRhcnk6IGN1cnZlKDI1ICsgY2l0aWVzICogMTQgKyByKCkgKiA1MCwgbiwgc2VlZE9mKGNpdi5pZCArIFwibVwiKSwgMi40KSxcbiAgICBwb3B1bGF0aW9uOiBjdXJ2ZShzdW0ucG9wdWxhdGlvbiwgbiwgc2VlZE9mKGNpdi5pZCArIFwicFwiKSwgMC4zKSxcbiAgICBzY29yZTogW10gYXMgbnVtYmVyW10sXG4gIH07XG4gIGguc2NvcmUgPSBoLnNjaWVuY2UubWFwKChfLCB0KSA9PiBzY29yZShoLCB0KSk7XG4gIHJldHVybiBoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3R2FtZSh3b3JsZDogV29ybGRJbmZvKTogR2FtZSB7XG4gIGNvbnN0IGJ1aWxkaW5nOiBSZWNvcmQ8c3RyaW5nLCBQcm9kdWN0aW9uPiA9IHt9O1xuICBjb25zdCBidWlsdDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XG4gIGNvbnN0IG1pbmUgPSB3b3JsZC5jaXRpZXMuZmlsdGVyKChjKSA9PiBjLmNpdiA9PT0gd29ybGQuY2l2c1swXS5pZCk7XG4gIG1pbmUuZm9yRWFjaCgoYywgaSkgPT4ge1xuICAgIGNvbnN0IHIgPSBybmcoc2VlZE9mKGMuaWQpKTtcbiAgICBjb25zdCBvd25lZCA9IGMuY2FwaXRhbFxuICAgICAgPyBbXCJtb251bWVudFwiLCBcImdyYW5hcnlcIiwgXCJ3YWxsc1wiLCBcImNhbXB1c1wiLCBcImxpYnJhcnlcIl1cbiAgICAgIDogW1wibW9udW1lbnRcIiwgXCJncmFuYXJ5XCIsIFwic2hyaW5lXCJdLnNsaWNlKDAsIDEgKyAoaSAlIDMpKTtcbiAgICBidWlsdFtjLmlkXSA9IG93bmVkO1xuICAgIGNvbnN0IG5leHQgPSBJVEVNUy5maW5kKFxuICAgICAgKGl0KSA9PiBpdC5raW5kICE9PSBcIlVuaXRcIiAmJiAhb3duZWQuaW5jbHVkZXMoaXQuaWQpLFxuICAgICkhO1xuICAgIGJ1aWxkaW5nW2MuaWRdID0ge1xuICAgICAgaXRlbTogbmV4dC5pZCxcbiAgICAgIHByb2dyZXNzOiBNYXRoLmZsb29yKHIoKSAqIG5leHQuY29zdCAqIDAuNyksXG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdHVybjogU1RBUlRfVFVSTixcbiAgICBnb2xkOiAzMTIsXG4gICAgZmFpdGg6IDg2LFxuICAgIHJlc2VhcmNoOiBcIm1hY2hpbmVyeVwiLFxuICAgIHJlc2VhcmNoZWQ6IFNUQVJUSU5HX1RFQ0hTLFxuICAgIHByb2dyZXNzOiB7IG1hY2hpbmVyeTogTWF0aC5yb3VuZCh0ZWNoKFwibWFjaGluZXJ5XCIpLmNvc3QgKiAwLjYyKSB9LFxuICAgIGNpdmljOiA0LFxuICAgIGNpdmljUHJvZ3Jlc3M6IDE0MCxcbiAgICBidWlsZGluZyxcbiAgICBidWlsdCxcbiAgICBoaXN0b3J5OiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICB3b3JsZC5jaXZzLm1hcCgoYykgPT4gW2MuaWQsIGhpc3Rvcnkod29ybGQsIGMpXSksXG4gICAgKSxcbiAgICBub3RlczogW1xuICAgICAge1xuICAgICAgICBpZDogMSxcbiAgICAgICAgaWNvbjogXCJwZXJzb25cIixcbiAgICAgICAgY29sb3I6IEMuc2NpZW5jZSxcbiAgICAgICAgdGl0bGU6IFwiR3JlYXQgU2NpZW50aXN0XCIsXG4gICAgICAgIGJvZHk6IFwiSHlwYXRpYSBvZiBMdW1lbiBhd2FpdHMgeW91ciBjYWxsXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogMixcbiAgICAgICAgaWNvbjogXCJmb29kXCIsXG4gICAgICAgIGNvbG9yOiBDLmZvb2QsXG4gICAgICAgIHRpdGxlOiBcIkNpdHkgZ3Jvd25cIixcbiAgICAgICAgYm9keTogXCJBdXJlbGlhIGhhcyBncm93biB0byBuZXcgaGVpZ2h0c1wiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IDMsXG4gICAgICAgIGljb246IFwibWFwXCIsXG4gICAgICAgIGNvbG9yOiBDLmdvbGQsXG4gICAgICAgIHRpdGxlOiBcIkZpcnN0IGNvbnRhY3RcIixcbiAgICAgICAgYm9keTogXCJFbnZveXMgZnJvbSBldmVyeSBjb3JuZXIgb2YgdGhlIHdvcmxkXCIsXG4gICAgICB9LFxuICAgIF0sXG4gICAgbmV4dE5vdGU6IDQsXG4gIH07XG59XG5cbi8qKiBBIGNpdidzIHBlci10dXJuIHlpZWxkczogdGhlIGxhc3Qgc3RlcCBvZiBpdHMgaGlzdG9yeS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmNvbWUoZ2FtZTogR2FtZSwgY2l2OiBzdHJpbmcpIHtcbiAgY29uc3QgaCA9IGdhbWUuaGlzdG9yeVtjaXZdO1xuICBjb25zdCBsYXN0ID0gKG06IE1ldHJpYykgPT4gaFttXVtoW21dLmxlbmd0aCAtIDFdO1xuICByZXR1cm4ge1xuICAgIHNjaWVuY2U6IGxhc3QoXCJzY2llbmNlXCIpLFxuICAgIGN1bHR1cmU6IGxhc3QoXCJjdWx0dXJlXCIpLFxuICAgIGdvbGQ6IGxhc3QoXCJnb2xkXCIpLFxuICAgIGZhaXRoOiBsYXN0KFwiZmFpdGhcIiksXG4gIH07XG59XG5cbi8qKiBXaGVyZSB0aGUgdHJlYXN1cnkncyBnb2xkIGNvbWVzIGZyb20gYW5kIGdvZXMsIHBlciB0dXJuLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZGdlcih3b3JsZDogV29ybGRJbmZvLCBnYW1lOiBHYW1lKSB7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF0uaWQ7XG4gIGNvbnN0IGNpdGllcyA9IHdvcmxkLmNpdGllcy5maWx0ZXIoKGMpID0+IGMuY2l2ID09PSBwbGF5ZXIpO1xuICBjb25zdCBidWlsdCA9IGNpdGllcy5mbGF0TWFwKChjKSA9PiBnYW1lLmJ1aWx0W2MuaWRdID8/IFtdKTtcbiAgY29uc3Qgc291cmNlcyA9IFtcbiAgICAuLi5jaXRpZXMubWFwKChjKSA9PiAoeyBuYW1lOiBjLm5hbWUsIHZhbHVlOiBjLnlpZWxkcy5nb2xkIH0pKSxcbiAgICB7IG5hbWU6IFwiVHJhZGUgcm91dGVzXCIsIHZhbHVlOiAxMiB9LFxuICBdO1xuICBjb25zdCB1cGtlZXAgPSBbXG4gICAge1xuICAgICAgbmFtZTogXCJCdWlsZGluZ3NcIixcbiAgICAgIHZhbHVlOiBidWlsdC5maWx0ZXIoKGIpID0+IGl0ZW0oYikua2luZCA9PT0gXCJCdWlsZGluZ1wiKS5sZW5ndGgsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcIkRpc3RyaWN0c1wiLFxuICAgICAgdmFsdWU6IGJ1aWx0LmZpbHRlcigoYikgPT4gaXRlbShiKS5raW5kID09PSBcIkRpc3RyaWN0XCIpLmxlbmd0aCAqIDIsXG4gICAgfSxcbiAgICB7XG4gICAgICBuYW1lOiBcIlVuaXRzXCIsXG4gICAgICB2YWx1ZTogd29ybGQudW5pdHMuZmlsdGVyKCh1KSA9PiB1LmNpdiA9PT0gcGxheWVyKS5sZW5ndGgsXG4gICAgfSxcbiAgXTtcbiAgY29uc3Qgc3VtID0gKHhzOiB7IHZhbHVlOiBudW1iZXIgfVtdKSA9PiB4cy5yZWR1Y2UoKG4sIHgpID0+IG4gKyB4LnZhbHVlLCAwKTtcbiAgcmV0dXJuIHsgc291cmNlcywgdXBrZWVwLCBuZXQ6IHN1bShzb3VyY2VzKSAtIHN1bSh1cGtlZXApIH07XG59XG5cbmNvbnN0IFJVTU9SUzogW0ljb25OYW1lLCBzdHJpbmcsIHN0cmluZywgc3RyaW5nXVtdID0gW1xuICBbXG4gICAgXCJzdHJlbmd0aFwiLFxuICAgIEMuYmFkLFxuICAgIFwiQmFyYmFyaWFuc1wiLFxuICAgIFwiQSBiYXJiYXJpYW4gY2FtcCB3YXMgc3BvdHRlZCB0byB0aGUgbm9ydGhcIixcbiAgXSxcbiAgW1xuICAgIFwicGVyc29uXCIsXG4gICAgQy5jdWx0dXJlLFxuICAgIFwiR3JlYXQgV3JpdGVyXCIsXG4gICAgXCJBIEdyZWF0IFdyaXRlciB3YXMgYm9ybiBpbiBhIHJpdmFsIGxhbmRcIixcbiAgXSxcbiAgW1wibWFwXCIsIEMuZ29sZCwgXCJUcmFkZSByb3V0ZVwiLCBcIkEgY2FyYXZhbiBmcm9tIFN1bm1hcmNoIHJlYWNoZWQgQXVyZWxpYVwiXSxcbiAgW1wiZmFpdGhcIiwgQy5mYWl0aCwgXCJSZWxpZ2lvblwiLCBcIkEgbmV3IHBhbnRoZW9uIGlzIHdvcnNoaXBwZWQgaW4gVHphbGFuXCJdLFxuICBbXCJ0cm9waHlcIiwgQy5nb2xkSGksIFwiV29uZGVyXCIsIFwiS2hhcmphbiBiZWdhbiBidWlsZGluZyB0aGUgQ29sb3NzdXNcIl0sXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RlcCh3b3JsZDogV29ybGRJbmZvLCBnYW1lOiBHYW1lLCBhY3Rpb246IEFjdGlvbik6IEdhbWUge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBcInJlc2VhcmNoXCI6XG4gICAgICByZXR1cm4geyAuLi5nYW1lLCByZXNlYXJjaDogYWN0aW9uLnRlY2ggfTtcbiAgICBjYXNlIFwicHJvZHVjZVwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZ2FtZSxcbiAgICAgICAgYnVpbGRpbmc6IHtcbiAgICAgICAgICAuLi5nYW1lLmJ1aWxkaW5nLFxuICAgICAgICAgIFthY3Rpb24uY2l0eV06IHsgaXRlbTogYWN0aW9uLml0ZW0sIHByb2dyZXNzOiAwIH0sXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIGNhc2UgXCJkaXNtaXNzXCI6XG4gICAgICByZXR1cm4geyAuLi5nYW1lLCBub3RlczogZ2FtZS5ub3Rlcy5maWx0ZXIoKG4pID0+IG4uaWQgIT09IGFjdGlvbi5pZCkgfTtcbiAgICBjYXNlIFwidHVyblwiOlxuICAgICAgcmV0dXJuIG5leHRUdXJuKHdvcmxkLCBnYW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBuZXh0VHVybih3b3JsZDogV29ybGRJbmZvLCBnYW1lOiBHYW1lKTogR2FtZSB7XG4gIGNvbnN0IHIgPSBybmcoZ2FtZS50dXJuICogNzkxOSk7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF0uaWQ7XG4gIGNvbnN0IG5vdGVzOiBPbWl0PE5vdGUsIFwiaWRcIj5bXSA9IFtdO1xuICBjb25zdCBnID0geyAuLi5nYW1lLCB0dXJuOiBnYW1lLnR1cm4gKyAxIH07XG5cbiAgLy8gSGlzdG9yeSBncm93cyBhIHN0ZXAgZm9yIGV2ZXJ5b25lLlxuICBnLmhpc3RvcnkgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMoZ2FtZS5oaXN0b3J5KS5tYXAoKFtjaXYsIGhdKSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0geyAuLi5oIH0gYXMgUmVjb3JkPE1ldHJpYywgbnVtYmVyW10+O1xuICAgICAgZm9yIChjb25zdCBtIG9mIFtcbiAgICAgICAgXCJzY2llbmNlXCIsXG4gICAgICAgIFwiY3VsdHVyZVwiLFxuICAgICAgICBcImdvbGRcIixcbiAgICAgICAgXCJmYWl0aFwiLFxuICAgICAgICBcInBvcHVsYXRpb25cIixcbiAgICAgIF0gYXMgY29uc3QpIHtcbiAgICAgICAgbmV4dFttXSA9IFsuLi5oW21dLCBoW21dW2hbbV0ubGVuZ3RoIC0gMV0gKiAoMS4wMDMgKyByKCkgKiAwLjAxMildO1xuICAgICAgfVxuICAgICAgbmV4dC5taWxpdGFyeSA9IFtcbiAgICAgICAgLi4uaC5taWxpdGFyeSxcbiAgICAgICAgaC5taWxpdGFyeVtoLm1pbGl0YXJ5Lmxlbmd0aCAtIDFdICogKDAuOTcgKyByKCkgKiAwLjA3KSxcbiAgICAgIF07XG4gICAgICBuZXh0LnNjb3JlID0gWy4uLmguc2NvcmUsIHNjb3JlKG5leHQsIG5leHQuc2NpZW5jZS5sZW5ndGggLSAxKV07XG4gICAgICByZXR1cm4gW2NpdiwgbmV4dF07XG4gICAgfSksXG4gICk7XG5cbiAgY29uc3QgcGF5ID0gaW5jb21lKGcsIHBsYXllcik7XG4gIGcuZ29sZCA9IGdhbWUuZ29sZCArIGxlZGdlcih3b3JsZCwgZ2FtZSkubmV0O1xuICBnLmZhaXRoID0gZ2FtZS5mYWl0aCArIHBheS5mYWl0aDtcblxuICBpZiAoZ2FtZS5yZXNlYXJjaCkge1xuICAgIGNvbnN0IGJhbmtlZCA9IChnYW1lLnByb2dyZXNzW2dhbWUucmVzZWFyY2hdID8/IDApICsgcGF5LnNjaWVuY2U7XG4gICAgY29uc3QgZG9uZSA9IHRlY2goZ2FtZS5yZXNlYXJjaCk7XG4gICAgaWYgKGJhbmtlZCA+PSBkb25lLmNvc3QpIHtcbiAgICAgIGcucmVzZWFyY2hlZCA9IFsuLi5nYW1lLnJlc2VhcmNoZWQsIGRvbmUuaWRdO1xuICAgICAgZy5yZXNlYXJjaCA9IG51bGw7XG4gICAgICBub3Rlcy5wdXNoKHtcbiAgICAgICAgaWNvbjogZG9uZS5pY29uLFxuICAgICAgICBjb2xvcjogQy5zY2llbmNlLFxuICAgICAgICB0aXRsZTogXCJSZXNlYXJjaCBjb21wbGV0ZVwiLFxuICAgICAgICBib2R5OiBkb25lLm5hbWUsXG4gICAgICB9KTtcbiAgICB9XG4gICAgZy5wcm9ncmVzcyA9IHsgLi4uZ2FtZS5wcm9ncmVzcywgW2dhbWUucmVzZWFyY2hdOiBiYW5rZWQgfTtcbiAgfVxuXG4gIGcuY2l2aWNQcm9ncmVzcyA9IGdhbWUuY2l2aWNQcm9ncmVzcyArIHBheS5jdWx0dXJlO1xuICBpZiAoZy5jaXZpY1Byb2dyZXNzID49IGNpdmljQ29zdChnYW1lLmNpdmljKSkge1xuICAgIG5vdGVzLnB1c2goe1xuICAgICAgaWNvbjogXCJjdWx0dXJlXCIsXG4gICAgICBjb2xvcjogQy5jdWx0dXJlLFxuICAgICAgdGl0bGU6IFwiQ2l2aWMgY29tcGxldGVcIixcbiAgICAgIGJvZHk6IENJVklDU1tnYW1lLmNpdmljICUgQ0lWSUNTLmxlbmd0aF0sXG4gICAgfSk7XG4gICAgZy5jaXZpYyA9IGdhbWUuY2l2aWMgKyAxO1xuICAgIGcuY2l2aWNQcm9ncmVzcyA9IDA7XG4gIH1cblxuICBnLmJ1aWxkaW5nID0geyAuLi5nYW1lLmJ1aWxkaW5nIH07XG4gIGcuYnVpbHQgPSB7IC4uLmdhbWUuYnVpbHQgfTtcbiAgZm9yIChjb25zdCBjaXR5IG9mIHdvcmxkLmNpdGllcy5maWx0ZXIoKGMpID0+IGMuY2l2ID09PSBwbGF5ZXIpKSB7XG4gICAgY29uc3Qgbm93ID0gZ2FtZS5idWlsZGluZ1tjaXR5LmlkXTtcbiAgICBjb25zdCBwcm9ncmVzcyA9IG5vdy5wcm9ncmVzcyArIGNpdHkueWllbGRzLnByb2R1Y3Rpb247XG4gICAgY29uc3QgaXQgPSBpdGVtKG5vdy5pdGVtKTtcbiAgICBpZiAocHJvZ3Jlc3MgPCBpdC5jb3N0KSB7XG4gICAgICBnLmJ1aWxkaW5nW2NpdHkuaWRdID0geyAuLi5ub3csIHByb2dyZXNzIH07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgbm90ZXMucHVzaCh7XG4gICAgICBpY29uOiBpdC5pY29uLFxuICAgICAgY29sb3I6IEMucHJvZHVjdGlvbixcbiAgICAgIHRpdGxlOiBgJHtjaXR5Lm5hbWV9IGNvbXBsZXRlZGAsXG4gICAgICBib2R5OiBpdC5uYW1lLFxuICAgIH0pO1xuICAgIGNvbnN0IGJ1aWx0ID1cbiAgICAgIGl0LmtpbmQgPT09IFwiVW5pdFwiXG4gICAgICAgID8gZ2FtZS5idWlsdFtjaXR5LmlkXVxuICAgICAgICA6IFsuLi5nYW1lLmJ1aWx0W2NpdHkuaWRdLCBpdC5pZF07XG4gICAgZy5idWlsdFtjaXR5LmlkXSA9IGJ1aWx0O1xuICAgIGNvbnN0IG5leHQgPVxuICAgICAgSVRFTVMuZmluZCgoaSkgPT4gaS5raW5kICE9PSBcIlVuaXRcIiAmJiAhYnVpbHQuaW5jbHVkZXMoaS5pZCkpID8/XG4gICAgICBpdGVtKFwiYnVpbGRlclwiKTtcbiAgICBnLmJ1aWxkaW5nW2NpdHkuaWRdID0geyBpdGVtOiBuZXh0LmlkLCBwcm9ncmVzczogcHJvZ3Jlc3MgLSBpdC5jb3N0IH07XG4gIH1cblxuICBpZiAocigpIDwgMC42KSB7XG4gICAgY29uc3QgW2ljb24sIGNvbG9yLCB0aXRsZSwgYm9keV0gPSBSVU1PUlNbTWF0aC5mbG9vcihyKCkgKiBSVU1PUlMubGVuZ3RoKV07XG4gICAgbm90ZXMucHVzaCh7IGljb24sIGNvbG9yLCB0aXRsZSwgYm9keSB9KTtcbiAgfVxuICBsZXQgaWQgPSBnYW1lLm5leHROb3RlO1xuICBnLm5vdGVzID0gWy4uLm5vdGVzLm1hcCgobikgPT4gKHsgLi4ubiwgaWQ6IGlkKysgfSkpLCAuLi5nYW1lLm5vdGVzXS5zbGljZShcbiAgICAwLFxuICAgIDYsXG4gICk7XG4gIGcubmV4dE5vdGUgPSBpZDtcbiAgcmV0dXJuIGc7XG59XG5cbi8qKiBUaGUgY2FsZW5kYXI6IGZvcnR5IHllYXJzIGEgdHVybiBhdCBmaXJzdCwgZmV3ZXIgYXMgaGlzdG9yeSBzcGVlZHMgdXAuICovXG5leHBvcnQgZnVuY3Rpb24geWVhcih0dXJuOiBudW1iZXIpIHtcbiAgbGV0IHkgPSAtNDAwMDtcbiAgbGV0IGxlZnQgPSB0dXJuO1xuICBmb3IgKGNvbnN0IFt0dXJucywgc3Bhbl0gb2YgW1xuICAgIFs3NSwgNDBdLFxuICAgIFs2MCwgMjVdLFxuICAgIFs1MCwgMjBdLFxuICAgIFs4MCwgMTBdLFxuICAgIFtJbmZpbml0eSwgNV0sXG4gIF0pIHtcbiAgICBjb25zdCBuID0gTWF0aC5taW4obGVmdCwgdHVybnMpO1xuICAgIHkgKz0gbiAqIHNwYW47XG4gICAgbGVmdCAtPSBuO1xuICAgIGlmIChsZWZ0IDw9IDApIGJyZWFrO1xuICB9XG4gIHJldHVybiB5IDwgMCA/IGAkey15fSBCQ2AgOiBgJHt5fSBBRGA7XG59XG5cbmV4cG9ydCBjb25zdCBwbHVyYWwgPSAobjogbnVtYmVyLCB3b3JkOiBzdHJpbmcpID0+XG4gIGAke259ICR7d29yZH0ke24gPT09IDEgPyBcIlwiIDogXCJzXCJ9YDtcblxuLyoqIFR1cm5zIHVudGlsIGBjb3N0YCBhdCBgcmF0ZWAgcGVyIHR1cm4sIGZyb20gYGJhbmtlZGAuICovXG5leHBvcnQgY29uc3QgdHVybnNMZWZ0ID0gKGNvc3Q6IG51bWJlciwgYmFua2VkOiBudW1iZXIsIHJhdGU6IG51bWJlcikgPT5cbiAgTWF0aC5tYXgoMSwgTWF0aC5jZWlsKChjb3N0IC0gYmFua2VkKSAvIE1hdGgubWF4KDAuMSwgcmF0ZSkpKTtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIGludGVycG9sYXRlLFxuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aFRpbWluZyxcbiAgdHlwZSBCZXZ5U3R5bGUsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5LCBvbiwgdHlwZSBSZWFjdEV2ZW50cywgdHlwZSBXaW5kb3dTaXplIH0gZnJvbSBcIi4vYmV2eVwiO1xuXG4vKiogVGhlIFVJIHZpZXdwb3J0J3MgbG9naWNhbCBzaXplLCBzdHJlYW1lZCBieSB0aGUgYnVpbHQtaW4gYHJlc2l6ZWAgZXZlbnQuXG4gKiAgYDDDlzBgIHVudGlsIHRoZSBob3N0IGFuc3dlcnMuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlV2luZG93U2l6ZSgpOiBXaW5kb3dTaXplIHtcbiAgY29uc3QgW3NpemUsIHNldFNpemVdID0gdXNlU3RhdGU8V2luZG93U2l6ZT4oeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH0pO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGJldnkud2luZG93XG4gICAgICAuc2l6ZSgpXG4gICAgICAudGhlbihzZXRTaXplKVxuICAgICAgLmNhdGNoKCgpID0+IHNldFNpemUoeyB3aWR0aDogMTQ0MCwgaGVpZ2h0OiA5MDAgfSkpO1xuICAgIHJldHVybiBiZXZ5Lm9uKFwicmVzaXplXCIsIHNldFNpemUpO1xuICB9LCBbXSk7XG4gIHJldHVybiBzaXplO1xufVxuXG4vKiogTGlzdGVuIHRvIGEgQmV2eSBldmVudCB3aGlsZSBtb3VudGVkOyBgcnVuYCBhbHdheXMgc2VlcyB0aGUgbGF0ZXN0XG4gKiAgcmVuZGVyJ3Mgc3RhdGUuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRXZlbnQ8SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgcnVuOiAodmFsdWU6IFJlYWN0RXZlbnRzW0tdKSA9PiB2b2lkLFxuKSB7XG4gIGNvbnN0IGxhdGVzdCA9IHVzZVJlZihydW4pO1xuICBsYXRlc3QuY3VycmVudCA9IHJ1bjtcbiAgdXNlRWZmZWN0KCgpID0+IG9uKG5hbWUsICh2YWx1ZSkgPT4gbGF0ZXN0LmN1cnJlbnQodmFsdWUpKSwgW25hbWVdKTtcbn1cblxuLyoqIEEgc2NyaXB0ZWQgc3RlcCBmcm9tIGAtLXNob290IOKApiAtLWRvIFwiPHNlY3M+IDx2ZXJiPiBbYXJnXVwiYCAodGhlXG4gKiAgYGRlYnVnLmFjdGAgZXZlbnQpOiBydW5zIGBydW4oYXJnKWAgZm9yIHRoaXMgY29tcG9uZW50J3MgYHZlcmJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURlYnVnKHZlcmI6IHN0cmluZywgcnVuOiAoYXJnOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgdXNlRXZlbnQoXCJkZWJ1Zy5hY3RcIiwgKHsgYWN0aW9uIH0pID0+IHtcbiAgICBjb25zdCBbaGVhZCwgLi4ucmVzdF0gPSBhY3Rpb24uc3BsaXQoXCIgXCIpO1xuICAgIGlmIChoZWFkID09PSB2ZXJiKSBydW4ocmVzdC5qb2luKFwiIFwiKSk7XG4gIH0pO1xufVxuXG4vKiogU2xpZGUgaW4gZnJvbSBhbiBvZmZzZXQgd2hlbiBtb3VudGVkIChCZXZ5IHJ1bnMgdGhlIGFuaW1hdGlvbjsgUmVhY3RcbiAqICByZW5kZXJzIG9uY2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZVNsaWRlSW4oeDogbnVtYmVyLCB5OiBudW1iZXIsIGR1cmF0aW9uID0gMzIwKTogQmV2eVN0eWxlIHtcbiAgY29uc3QgdCA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHQudmFsdWUgPSB3aXRoVGltaW5nKDEsIHsgZHVyYXRpb24sIGVhc2luZzogXCJlYXNlT3V0XCIgfSk7XG4gIH0sIFt0LCBkdXJhdGlvbl0pO1xuICByZXR1cm4ge1xuICAgIHRyYW5zZm9ybToge1xuICAgICAgdHJhbnNsYXRlWDogeyBhbmltYXRlZDogaW50ZXJwb2xhdGUodCwgWzAsIDFdLCBbeCwgMF0pIH0sXG4gICAgICB0cmFuc2xhdGVZOiB7IGFuaW1hdGVkOiBpbnRlcnBvbGF0ZSh0LCBbMCwgMV0sIFt5LCAwXSkgfSxcbiAgICB9LFxuICB9O1xufVxuXG4vKiogRmFkZSBhbmQgZ3JvdyBpbiB3aGVuIG1vdW50ZWQuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRmFkZUluKGR1cmF0aW9uID0gMjYwKTogQmV2eVN0eWxlIHtcbiAgY29uc3QgdCA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHQudmFsdWUgPSB3aXRoVGltaW5nKDEsIHsgZHVyYXRpb24sIGVhc2luZzogXCJlYXNlT3V0XCIgfSk7XG4gIH0sIFt0LCBkdXJhdGlvbl0pO1xuICByZXR1cm4ge1xuICAgIG9wYWNpdHk6IHsgYW5pbWF0ZWQ6IHQgfSxcbiAgICB0cmFuc2Zvcm06IHsgc2NhbGU6IHsgYW5pbWF0ZWQ6IGludGVycG9sYXRlKHQsIFswLCAxXSwgWzAuOTcsIDFdKSB9IH0sXG4gIH07XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcblxuLyoqIExpbmUtYW5kLWZpbGwgcGljdG9ncmFtcyBvbiBhIDI0LXVuaXQgZ3JpZCwgZHJhd24gd2l0aCBgPHN2Zz5gIChlYWNoXG4gKiAgb25lIHJhc3Rlcml6ZWQgYXQgaXRzIGxhaWQtb3V0IHNpemUsIHNvIGNyaXNwIGF0IGFueSBzaXplKS4gKi9cbmNvbnN0IElDT05TID0ge1xuICBzY2llbmNlOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNOC41IDNoN1wiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTEwIDMuNXY2TDUgMTguMkEyIDIgMCAwIDAgNi44IDIxaDEwLjRhMiAyIDAgMCAwIDEuOC0yLjhMMTQgOS41di02XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTcuNCAxNWg5LjJsMS41IDMuMWMuMy42LS4xLjktLjcuOUg2LjZjLS42IDAtMS0uMy0uNy0uOXpcIlxuICAgICAgICBmaWxsPXtjfVxuICAgICAgLz5cbiAgICA8Lz5cbiAgKSxcbiAgY3VsdHVyZTogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTkuMiAxNy41VjUuMmwxMC41LTIuMnYxMi40XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8Y2lyY2xlIGN4PXs2LjR9IGN5PXsxNy42fSByPXszfSBmaWxsPXtjfSAvPlxuICAgICAgPGNpcmNsZSBjeD17MTYuOX0gY3k9ezE1LjV9IHI9ezN9IGZpbGw9e2N9IC8+XG4gICAgPC8+XG4gICksXG4gIGdvbGQ6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPGNpcmNsZSBjeD17MTJ9IGN5PXsxMn0gcj17OX0gZmlsbD17Y30gLz5cbiAgICAgIDxjaXJjbGVcbiAgICAgICAgY3g9ezEyfVxuICAgICAgICBjeT17MTJ9XG4gICAgICAgIHI9ezUuNn1cbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9XCIjN2E1YjE2XCJcbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNX1cbiAgICAgIC8+XG4gICAgICA8cmVjdCB4PXsxMC41fSB5PXsxMC41fSB3aWR0aD17M30gaGVpZ2h0PXszfSBmaWxsPVwiIzdhNWIxNlwiIC8+XG4gICAgPC8+XG4gICksXG4gIGZhaXRoOiAoYzogc3RyaW5nKSA9PiA8cG9seWdvbiBwb2ludHM9e3N0YXIoMTIsIDEyLCAxMCwgNC4yLCA4KX0gZmlsbD17Y30gLz4sXG4gIGZvb2Q6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk0xMiAyMlY3XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjh9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPGVsbGlwc2UgY3g9ezEyfSBjeT17NC42fSByeD17MS44fSByeT17Mi44fSBmaWxsPXtjfSAvPlxuICAgICAge1s4LCAxMi41LCAxN10ubWFwKCh5KSA9PiAoXG4gICAgICAgIDxnIGtleT17eX0+XG4gICAgICAgICAgPGVsbGlwc2VcbiAgICAgICAgICAgIGN4PXs5fVxuICAgICAgICAgICAgY3k9e3l9XG4gICAgICAgICAgICByeD17MS45fVxuICAgICAgICAgICAgcnk9ezMuMX1cbiAgICAgICAgICAgIGZpbGw9e2N9XG4gICAgICAgICAgICB0cmFuc2Zvcm09e2Byb3RhdGUoLTM4IDkgJHt5fSlgfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGVsbGlwc2VcbiAgICAgICAgICAgIGN4PXsxNX1cbiAgICAgICAgICAgIGN5PXt5fVxuICAgICAgICAgICAgcng9ezEuOX1cbiAgICAgICAgICAgIHJ5PXszLjF9XG4gICAgICAgICAgICBmaWxsPXtjfVxuICAgICAgICAgICAgdHJhbnNmb3JtPXtgcm90YXRlKDM4IDE1ICR7eX0pYH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2c+XG4gICAgICApKX1cbiAgICA8Lz5cbiAgKSxcbiAgcHJvZHVjdGlvbjogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTQuNSAxOS41bDguNS04LjVcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezIuOH1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8cGF0aCBkPVwiTTEwLjYgNi4ybDMuNi0zLjYgNy4yIDcuMi0zLjYgMy42elwiIGZpbGw9e2N9IC8+XG4gICAgPC8+XG4gICksXG4gIGhvdXNpbmc6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk0zIDExLjVMMTIgNGw5IDcuNVwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGggZD1cIk01LjUgMTAuNVYyMGg1di01aDN2NWg1di05LjVMMTIgNXpcIiBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBhbWVuaXRpZXM6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPGNpcmNsZSBjeD17MTJ9IGN5PXsxMn0gcj17OX0gZmlsbD1cIm5vbmVcIiBzdHJva2U9e2N9IHN0cm9rZVdpZHRoPXsyfSAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk04IDEzLjhjMS40IDIuNCA2LjYgMi40IDggMFwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8Y2lyY2xlIGN4PXs5fSBjeT17OS41fSByPXsxLjN9IGZpbGw9e2N9IC8+XG4gICAgICA8Y2lyY2xlIGN4PXsxNX0gY3k9ezkuNX0gcj17MS4zfSBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBzdHJlbmd0aDogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTUgMy41bDEzIDEzTTE5IDMuNUw2IDE2LjVcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezIuMn1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTMuNSAxNS41bDUgNU0yMC41IDE1LjVsLTUgNVwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mi4yfVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgLz5cbiAgICA8Lz5cbiAgKSxcbiAgbW92ZW1lbnQ6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk01IDVsNyA3LTcgN00xMiA1bDcgNy03IDdcIlxuICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgc3Ryb2tlPXtjfVxuICAgICAgc3Ryb2tlV2lkdGg9ezIuMn1cbiAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAvPlxuICApLFxuICBib3c6IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk03IDNjOCAyLjUgOCAxNS41IDAgMThcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGggZD1cIk03IDN2MThcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT17Y30gc3Ryb2tlV2lkdGg9ezF9IC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTMgMTJoMTdNMTcgOWwzIDMtMyAzXCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsxLjh9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgLz5cbiAgICA8Lz5cbiAgKSxcbiAgZXllOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNMiAxMnMzLjgtNi41IDEwLTYuNVMyMiAxMiAyMiAxMnMtMy44IDYuNS0xMCA2LjVTMiAxMiAyIDEyelwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPGNpcmNsZSBjeD17MTJ9IGN5PXsxMn0gcj17My4yfSBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBmbGFnOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNNiAyMVYzLjVcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGggZD1cIk02IDRoMTJsLTMgNC41IDMgNC41SDZ6XCIgZmlsbD17Y30gLz5cbiAgICA8Lz5cbiAgKSxcbiAgY2l0eTogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTMgMjFoMThcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgICAgPHBhdGggZD1cIk01IDIxVjExbDQtMyA0IDN2MTB6TTE0IDIxVjVoNXYxNnpcIiBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBib29rOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPHBhdGhcbiAgICAgIGQ9XCJNMTIgNi41QzEwIDQuOCA2LjUgNC41IDQgNS4ydjEzLjZjMi41LS43IDYtLjQgOCAxLjMgMi0xLjcgNS41LTIgOC0xLjNWNS4yYy0yLjUtLjctNi0uNC04IDEuM3pNMTIgNi41djEzLjZcIlxuICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgc3Ryb2tlPXtjfVxuICAgICAgc3Ryb2tlV2lkdGg9ezEuOX1cbiAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgIC8+XG4gICksXG4gIGNhc3RsZTogKGM6IHN0cmluZykgPT4gKFxuICAgIDxwYXRoXG4gICAgICBkPVwiTTQgMjFWOGgzdjNoMi41VjhoNXYzSDE3VjhoM3YxM2gtNnYtNC41YTIgMiAwIDAgMC00IDBWMjF6XCJcbiAgICAgIGZpbGw9e2N9XG4gICAgLz5cbiAgKSxcbiAgb2JlbGlzazogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8cGF0aCBkPVwiTTEwIDIwbDEtMTQgMS0zIDEgMyAxIDE0elwiIGZpbGw9e2N9IC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTYgMjAuNWgxMlwiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgPC8+XG4gICksXG4gIGFuY2hvcjogKGM6IHN0cmluZykgPT4gKFxuICAgIDw+XG4gICAgICA8Y2lyY2xlIGN4PXsxMn0gY3k9ezV9IHI9ezIuMn0gZmlsbD1cIm5vbmVcIiBzdHJva2U9e2N9IHN0cm9rZVdpZHRoPXsxLjl9IC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTEyIDcuMlYyMU01IDEzYzAgNC41IDMuMiA4IDcgOHM3LTMuNSA3LThNOC41IDEwLjVoN1wiXG4gICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgc3Ryb2tlPXtjfVxuICAgICAgICBzdHJva2VXaWR0aD17MS45fVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgLz5cbiAgICA8Lz5cbiAgKSxcbiAgdHJvcGh5OiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoIGQ9XCJNNyAzLjVoMTBWOWE1IDUgMCAwIDEtMTAgMHpcIiBmaWxsPXtjfSAvPlxuICAgICAgPHBhdGhcbiAgICAgICAgZD1cIk03IDUuNUg0djEuMkEzLjMgMy4zIDAgMCAwIDcuMyAxME0xNyA1LjVoM3YxLjJhMy4zIDMuMyAwIDAgMS0zLjMgMy4zTTEyIDE0djRNOCAyMC41aDhcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuOX1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgPC8+XG4gICksXG4gIGNoYXJ0OiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNMy41IDIwLjVoMTdcIlxuICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgIHN0cm9rZT17Y31cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuOX1cbiAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgICA8cmVjdCB4PXs1fSB5PXsxMn0gd2lkdGg9ezMuNH0gaGVpZ2h0PXs2LjV9IHJ4PXswLjh9IGZpbGw9e2N9IC8+XG4gICAgICA8cmVjdCB4PXsxMC4zfSB5PXs3fSB3aWR0aD17My40fSBoZWlnaHQ9ezExLjV9IHJ4PXswLjh9IGZpbGw9e2N9IC8+XG4gICAgICA8cmVjdCB4PXsxNS42fSB5PXszLjV9IHdpZHRoPXszLjR9IGhlaWdodD17MTV9IHJ4PXswLjh9IGZpbGw9e2N9IC8+XG4gICAgPC8+XG4gICksXG4gIG1hcDogKGM6IHN0cmluZykgPT4gKFxuICAgIDxwYXRoXG4gICAgICBkPVwiTTMgNi41bDYtMyA2IDMgNi0zdjE0bC02IDMtNi0zLTYgM3pNOSAzLjV2MTRNMTUgNi41djE0XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsxLjl9XG4gICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAvPlxuICApLFxuICBwZXJzb246IChjOiBzdHJpbmcpID0+IChcbiAgICA8PlxuICAgICAgPGNpcmNsZSBjeD17MTJ9IGN5PXs3LjV9IHI9ezR9IGZpbGw9e2N9IC8+XG4gICAgICA8cGF0aCBkPVwiTTQgMjFjMC00LjYgMy42LTcuNSA4LTcuNXM4IDIuOSA4IDcuNXpcIiBmaWxsPXtjfSAvPlxuICAgIDwvPlxuICApLFxuICBzaGllbGQ6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk0xMiAyLjVsOC41IDMuMnY2LjFjMCA1LjEtMy42IDguNS04LjUgOS43LTQuOS0xLjItOC41LTQuNi04LjUtOS43VjUuN3pcIlxuICAgICAgZmlsbD17Y31cbiAgICAvPlxuICApLFxuICBtb29uOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPHBhdGggZD1cIk0xOS41IDE0LjVBOCA4IDAgMSAxIDkuNSA0LjVhNi41IDYuNSAwIDAgMCAxMCAxMHpcIiBmaWxsPXtjfSAvPlxuICApLFxuICBza2lwOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxwYXRoIGQ9XCJNNSA1bDkgNy05IDd6XCIgZmlsbD17Y30gLz5cbiAgICAgIDxwYXRoXG4gICAgICAgIGQ9XCJNMTcuNSA1djE0XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyLjR9XG4gICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAvPlxuICAgIDwvPlxuICApLFxuICBhcnJvdzogKGM6IHN0cmluZykgPT4gKFxuICAgIDxwYXRoXG4gICAgICBkPVwiTTQgMTJoMTRNMTMgNmw2IDYtNiA2XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsyLjR9XG4gICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgLz5cbiAgKSxcbiAgdHJhc2g6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk00IDdoMTZNMTAgMy41aDRNNi41IDdsMSAxMy41aDlsMS0xMy41XCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHN0cm9rZT17Y31cbiAgICAgIHN0cm9rZVdpZHRoPXsxLjl9XG4gICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiXG4gICAgLz5cbiAgKSxcbiAgY2hlY2s6IChjOiBzdHJpbmcpID0+IChcbiAgICA8cGF0aFxuICAgICAgZD1cIk01IDEyLjVsNC41IDQuNUwxOSA3LjVcIlxuICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgc3Ryb2tlPXtjfVxuICAgICAgc3Ryb2tlV2lkdGg9ezIuNn1cbiAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAvPlxuICApLFxuICBjbG9zZTogKGM6IHN0cmluZykgPT4gKFxuICAgIDxwYXRoXG4gICAgICBkPVwiTTYgNmwxMiAxMk0xOCA2TDYgMThcIlxuICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgc3Ryb2tlPXtjfVxuICAgICAgc3Ryb2tlV2lkdGg9ezIuMn1cbiAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgLz5cbiAgKSxcbiAgbWVudTogKGM6IHN0cmluZykgPT4gKFxuICAgIDxwYXRoXG4gICAgICBkPVwiTTQgN2gxNk00IDEyaDE2TTQgMTdoMTZcIlxuICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgc3Ryb2tlPXtjfVxuICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgIC8+XG4gICksXG4gIHN0YXI6IChjOiBzdHJpbmcpID0+IDxwb2x5Z29uIHBvaW50cz17c3RhcigxMiwgMTIuNiwgMTAsIDQuMiwgNSl9IGZpbGw9e2N9IC8+LFxuICBsb2NrOiAoYzogc3RyaW5nKSA9PiAoXG4gICAgPD5cbiAgICAgIDxyZWN0IHg9ezV9IHk9ezEwLjV9IHdpZHRoPXsxNH0gaGVpZ2h0PXsxMH0gcng9ezJ9IGZpbGw9e2N9IC8+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTguNSAxMC41VjhhMy41IDMuNSAwIDAgMSA3IDB2Mi41XCJcbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2N9XG4gICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgLz5cbiAgICA8Lz5cbiAgKSxcbn0gc2F0aXNmaWVzIFJlY29yZDxzdHJpbmcsIChjb2xvcjogc3RyaW5nKSA9PiBSZWFjdE5vZGU+O1xuXG5leHBvcnQgdHlwZSBJY29uTmFtZSA9IGtleW9mIHR5cGVvZiBJQ09OUztcblxuLyoqIFRoZSBwb2ludHMgb2YgYW4gYG5gLXBvaW50ZWQgc3RhciwgdGhlIGZpcnN0IHBvaW50IHN0cmFpZ2h0IHVwLiAqL1xuZnVuY3Rpb24gc3RhcihjeDogbnVtYmVyLCBjeTogbnVtYmVyLCBvdXRlcjogbnVtYmVyLCBpbm5lcjogbnVtYmVyLCBuOiBudW1iZXIpIHtcbiAgY29uc3QgcHRzOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG4gKiAyOyBpKyspIHtcbiAgICBjb25zdCBhID0gKE1hdGguUEkgKiBpKSAvIG4gLSBNYXRoLlBJIC8gMjtcbiAgICBjb25zdCByID0gaSAlIDIgPT09IDAgPyBvdXRlciA6IGlubmVyO1xuICAgIHB0cy5wdXNoKGN4ICsgTWF0aC5jb3MoYSkgKiByLCBjeSArIE1hdGguc2luKGEpICogcik7XG4gIH1cbiAgcmV0dXJuIHB0cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEljb24oe1xuICBuYW1lLFxuICBzaXplID0gMTYsXG4gIGNvbG9yID0gXCIjZjBlOGQ2XCIsXG59OiB7XG4gIG5hbWU6IEljb25OYW1lO1xuICBzaXplPzogbnVtYmVyO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnXG4gICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUsIGZsZXhTaHJpbms6IDAgfX1cbiAgICA+XG4gICAgICB7SUNPTlNbbmFtZV0oY29sb3IpfVxuICAgIDwvc3ZnPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlLCB0eXBlIFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBDaXZJbmZvIH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBjYXBzLCBnaWx0LCB0b25lIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uLCB0eXBlIEljb25OYW1lIH0gZnJvbSBcIi4vSWNvblwiO1xuXG4vKiogQSBmaWxsZWQgcmluZzogYHByb2dyZXNzYCAoMC4uMSkgb2YgYGNvbG9yYCBvdmVyIGEgZGltIHRyYWNrLCBhcyBhXG4gKiAgY29uaWMgZ3JhZGllbnQuICovXG5leHBvcnQgZnVuY3Rpb24gY29uaWMoXG4gIHByb2dyZXNzOiBudW1iZXIsXG4gIGNvbG9yOiBzdHJpbmcsXG4pOiBCZXZ5U3R5bGVbXCJiYWNrZ3JvdW5kR3JhZGllbnRcIl0ge1xuICBjb25zdCBkZWcgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBwcm9ncmVzcykpICogMzYwO1xuICBjb25zdCB0cmFjayA9IFwicmdiYSgwLCAwLCAwLCAwLjU1KVwiO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwiY29uaWNcIixcbiAgICBzdG9wczogW1xuICAgICAgeyBjb2xvciwgYW5nbGU6IDAgfSxcbiAgICAgIHsgY29sb3IsIGFuZ2xlOiBkZWcgfSxcbiAgICAgIHsgY29sb3I6IHRyYWNrLCBhbmdsZTogZGVnIH0sXG4gICAgICB7IGNvbG9yOiB0cmFjaywgYW5nbGU6IDM2MCB9LFxuICAgIF0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByYWRpYWwoXG4gIGlubmVyOiBzdHJpbmcsXG4gIG91dGVyOiBzdHJpbmcsXG4pOiBCZXZ5U3R5bGVbXCJiYWNrZ3JvdW5kR3JhZGllbnRcIl0ge1xuICByZXR1cm4geyB0eXBlOiBcInJhZGlhbFwiLCBzdG9wczogW3sgY29sb3I6IGlubmVyIH0sIHsgY29sb3I6IG91dGVyIH1dIH07XG59XG5cbi8qKiBUaGUgcm91bmQgZ2lsdCBmcmFtZSB0aGUgZ3JlYXQgNFggZ2FtZXMgcHV0IGV2ZXJ5IHBvcnRyYWl0IGluLCB3aXRoIGFuXG4gKiAgb3B0aW9uYWwgcHJvZ3Jlc3MgcmluZyBpbnNpZGUgdGhlIGdvbGQuICovXG5leHBvcnQgZnVuY3Rpb24gTWVkYWxsaW9uKHtcbiAgc2l6ZSxcbiAgaW5uZXIgPSBDLnNsYXRlSGksXG4gIG91dGVyID0gQy5uYXZ5LFxuICBwcm9ncmVzcyxcbiAgcmluZyA9IEMuc2NpZW5jZSxcbiAgY2hpbGRyZW4sXG4gIHN0eWxlLFxufToge1xuICBzaXplOiBudW1iZXI7XG4gIGlubmVyPzogc3RyaW5nO1xuICBvdXRlcj86IHN0cmluZztcbiAgcHJvZ3Jlc3M/OiBudW1iZXI7XG4gIHJpbmc/OiBzdHJpbmc7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xuICBzdHlsZT86IEJldnlTdHlsZTtcbn0pIHtcbiAgY29uc3QgciA9IHNpemUgLyAyO1xuICBjb25zdCBmcmFtZSA9IE1hdGgubWF4KDIsIE1hdGgucm91bmQoc2l6ZSAqIDAuMDYpKTtcbiAgY29uc3QgZmFjZSA9IChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgIGJvcmRlclJhZGl1czogcixcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiByYWRpYWwoaW5uZXIsIG91dGVyKSxcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICBoZWlnaHQ6IHNpemUsXG4gICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgIGJvcmRlclJhZGl1czogcixcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBnaWx0LFxuICAgICAgICBwYWRkaW5nOiBmcmFtZSxcbiAgICAgICAgLi4uc3R5bGUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtwcm9ncmVzcyA9PT0gdW5kZWZpbmVkID8gKFxuICAgICAgICBmYWNlXG4gICAgICApIDogKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogcixcbiAgICAgICAgICAgIHBhZGRpbmc6IE1hdGgubWF4KDMsIHNpemUgKiAwLjA3NSksXG4gICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IGNvbmljKHByb2dyZXNzLCByaW5nKSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2ZhY2V9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSByb3VuZCBnaWx0IGljb24gYnV0dG9uIHdpdGggYSBjYXB0aW9uIG9uIGhvdmVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJvdW5kQnV0dG9uKHtcbiAgaWNvbixcbiAgc2l6ZSA9IDM4LFxuICBjb2xvciA9IEMuZ29sZEhpLFxuICB0aXAsXG4gIHRpcFNpZGUgPSBcImJvdHRvbVwiLFxuICBhY3RpdmUgPSBmYWxzZSxcbiAgb25DbGljayxcbn06IHtcbiAgaWNvbjogSWNvbk5hbWU7XG4gIHNpemU/OiBudW1iZXI7XG4gIGNvbG9yPzogc3RyaW5nO1xuICB0aXA/OiBzdHJpbmc7XG4gIHRpcFNpZGU/OiBcImJvdHRvbVwiIHwgXCJ0b3BcIiB8IFwibGVmdFwiO1xuICBhY3RpdmU/OiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBbaG92ZXIsIHNldEhvdmVyXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgciA9IHNpemUgLyAyO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2V0SG92ZXIodHJ1ZSl9XG4gICAgICBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIoZmFsc2UpfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiByLFxuICAgICAgICBwYWRkaW5nOiAyLFxuICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IGdpbHQsXG4gICAgICAgIGJveFNoYWRvdzogYWN0aXZlXG4gICAgICAgICAgPyB7IGNvbG9yOiBcInJnYmEoMjQ2LCAyMjgsIDE2OCwgMC41NSlcIiwgYmx1clJhZGl1czogMTAgfVxuICAgICAgICAgIDogeyBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNSlcIiwgYmx1clJhZGl1czogNiwgeU9mZnNldDogMiB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3tcbiAgICAgICAgYm94U2hhZG93OiB7IGNvbG9yOiBcInJnYmEoMjQ2LCAyMjgsIDE2OCwgMC40NSlcIiwgYmx1clJhZGl1czogMTIgfSxcbiAgICAgIH19XG4gICAgICBwcmVzc1N0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMC45MyB9IH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IHIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IGFjdGl2ZVxuICAgICAgICAgICAgPyByYWRpYWwoXCIjM2Y2YTkyXCIsIEMuc2xhdGUpXG4gICAgICAgICAgICA6IHJhZGlhbChDLnNsYXRlSGksIEMubmF2eSksXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxJY29uIG5hbWU9e2ljb259IHNpemU9e3NpemUgKiAwLjV9IGNvbG9yPXtjb2xvcn0gLz5cbiAgICAgIDwvbm9kZT5cbiAgICAgIHtob3ZlciAmJiB0aXAgJiYgPFRpcCB0ZXh0PXt0aXB9IHNpZGU9e3RpcFNpZGV9IG9mZnNldD17c2l6ZSArIDZ9IC8+fVxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogQSBzbWFsbCBjYXB0aW9uIHBsYXRlIGJlc2lkZSBpdHMgKHJlbGF0aXZlbHkgcG9zaXRpb25lZCkgcGFyZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRpcCh7XG4gIHRleHQsXG4gIHNpZGUsXG4gIG9mZnNldCxcbn06IHtcbiAgdGV4dDogc3RyaW5nO1xuICBzaWRlOiBcImJvdHRvbVwiIHwgXCJ0b3BcIiB8IFwibGVmdFwiO1xuICBvZmZzZXQ6IG51bWJlcjtcbn0pIHtcbiAgY29uc3QgcGxhY2U6IEJldnlTdHlsZSA9XG4gICAgc2lkZSA9PT0gXCJsZWZ0XCJcbiAgICAgID8geyByaWdodDogb2Zmc2V0LCB0b3A6IFwiNTAlXCIsIHRyYW5zZm9ybTogeyB0cmFuc2xhdGVZOiBcIi01MCVcIiB9IH1cbiAgICAgIDoge1xuICAgICAgICAgIGxlZnQ6IFwiNTAlXCIsXG4gICAgICAgICAgdHJhbnNmb3JtOiB7IHRyYW5zbGF0ZVg6IFwiLTUwJVwiIH0sXG4gICAgICAgICAgLi4uKHNpZGUgPT09IFwiYm90dG9tXCIgPyB7IHRvcDogb2Zmc2V0IH0gOiB7IGJvdHRvbTogb2Zmc2V0IH0pLFxuICAgICAgICB9O1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgLi4ucGxhY2UsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAsIHZlcnRpY2FsOiA1IH0sXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDYsIDEzLCAyMSwgMC45NClcIixcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogQy5nb2xkTG8sXG4gICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgZ2xvYmFsWkluZGV4OiAxMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy50ZXh0LCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgc2VjdGlvbiB0aXRsZSBiZXR3ZWVuIHR3byBmYWRpbmcgZ29sZCBydWxlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIZWFkZXIoe1xuICBjaGlsZHJlbixcbiAgY29sb3IgPSBDLmdvbGQsXG59OiB7XG4gIGNoaWxkcmVuOiBzdHJpbmc7XG4gIGNvbG9yPzogc3RyaW5nO1xufSkge1xuICBjb25zdCBydWxlID0gKGFuZ2xlOiBudW1iZXIpOiBCZXZ5U3R5bGUgPT4gKHtcbiAgICBmbGV4R3JvdzogMSxcbiAgICBoZWlnaHQ6IDEsXG4gICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgYW5nbGUsXG4gICAgICBzdG9wczogW3sgY29sb3I6IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwKVwiIH0sIHsgY29sb3I6IEMuZ29sZExpbmUgfV0sXG4gICAgfSxcbiAgfSk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCB9fT5cbiAgICAgIDxub2RlIHN0eWxlPXtydWxlKDkwKX0gLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmNhcHMsIGNvbG9yIH19PntjaGlsZHJlbi50b1VwcGVyQ2FzZSgpfTwvdGV4dD5cbiAgICAgIDxub2RlIHN0eWxlPXtydWxlKDI3MCl9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogQSBwcm9ncmVzcyBiYXIgdGhhdCBlYXNlcyB0byBpdHMgbmV3IHZhbHVlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJhcih7XG4gIHZhbHVlLFxuICB3aWR0aCxcbiAgY29sb3IsXG4gIGhlaWdodCA9IDYsXG59OiB7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIGhlaWdodD86IG51bWJlcjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiBoZWlnaHQgLyAyLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjQ1KVwiLFxuICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNilcIixcbiAgICAgIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUpKSAqICh3aWR0aCAtIDIpLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0IC0gMixcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IGhlaWdodCAvIDIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgICAgICB0cmFuc2l0aW9uOiB7IHNpemU6IHsgZHVyYXRpb246IDYwMCwgZWFzaW5nOiBcImVhc2VPdXRcIiB9IH0sXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEFuIGljb24gYW5kIGEgbnVtYmVyIGluIHRoZSB5aWVsZCdzIGNvbG9yLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFtb3VudCh7XG4gIGljb24sXG4gIGNvbG9yLFxuICB2YWx1ZSxcbiAgc2l6ZSA9IDEzLFxufToge1xuICBpY29uOiBJY29uTmFtZTtcbiAgY29sb3I6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgc2l6ZT86IG51bWJlcjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDQgfX0+XG4gICAgICA8SWNvbiBuYW1lPXtpY29ufSBzaXplPXtzaXplICsgM30gY29sb3I9e2NvbG9yfSAvPlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IHNpemUsIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIiwgY29sb3IgfX0+XG4gICAgICAgIHt2YWx1ZX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUg4pyVIGluIGEgcGFuZWwncyBjb3JuZXIuICovXG5leHBvcnQgZnVuY3Rpb24gQ2xvc2VCdXR0b24oeyBvbkNsaWNrIH06IHsgb25DbGljazogKCkgPT4gdm9pZCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiAzMCxcbiAgICAgICAgaGVpZ2h0OiAzMCxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAxNSxcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExvLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg2LCAxMywgMjEsIDAuNilcIixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogQy5zbGF0ZUhpLCBib3JkZXJDb2xvcjogQy5nb2xkIH19XG4gICAgICBwcmVzc1N0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMC45MiB9IH19XG4gICAgPlxuICAgICAgPEljb24gbmFtZT1cImNsb3NlXCIgc2l6ZT17MTR9IGNvbG9yPXtDLmdvbGRIaX0gLz5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cblxuLyoqIEEgY2l2aWxpemF0aW9uJ3Mgcm91bmQgY3Jlc3Q6IGl0cyBpbml0aWFsIG9uIGl0cyBjb2xvci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVzdCh7IGNpdiwgc2l6ZSB9OiB7IGNpdjogQ2l2SW5mbzsgc2l6ZTogbnVtYmVyIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8TWVkYWxsaW9uXG4gICAgICBzaXplPXtzaXplfVxuICAgICAgaW5uZXI9e3RvbmUoY2l2LmNvbG9yLCAxLjI1KX1cbiAgICAgIG91dGVyPXt0b25lKGNpdi5jb2xvciwgMC40KX1cbiAgICA+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgZm9udFNpemU6IHNpemUgKiAwLjQyLFxuICAgICAgICAgIGNvbG9yOiBcIiNmZmZmZmZcIixcbiAgICAgICAgICB0ZXh0U2hhZG93OiB7IGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC42KVwiLCBvZmZzZXRYOiAwLCBvZmZzZXRZOiAxIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtjaXYubmFtZVswXX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L01lZGFsbGlvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IENpdHlJbmZvLCBDaXZJbmZvIH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB7XG4gIElURU1TLFxuICBpdGVtLFxuICBwbHVyYWwsXG4gIHR1cm5zTGVmdCxcbiAgdHlwZSBBY3Rpb24sXG4gIHR5cGUgR2FtZSxcbiAgdHlwZSBJdGVtLFxufSBmcm9tIFwiLi4vZ2FtZVwiO1xuaW1wb3J0IHsgdXNlU2xpZGVJbiB9IGZyb20gXCIuLi9ob29rc1wiO1xuaW1wb3J0IHtcbiAgQyxcbiAgRm9udHMsXG4gIE9XTlNfUE9JTlRFUixcbiAgWUlFTERTLFxuICBjYXBzLFxuICBmbXQsXG4gIHBhbmVsLFxuICBzaWduZWQsXG4gIHRvbmUsXG59IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgSWNvbiwgdHlwZSBJY29uTmFtZSB9IGZyb20gXCIuLi91aS9JY29uXCI7XG5pbXBvcnQgeyBCYXIsIENsb3NlQnV0dG9uLCBIZWFkZXIsIE1lZGFsbGlvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuY29uc3QgV0lEVEggPSAzNjA7XG5cbi8qKiBUaGUgY2l0eSBzY3JlZW4sIGRvd24gdGhlIGxlZnQgc2lkZTogaXRzIHlpZWxkcyBmcm9tIHRoZSB0aWxlcyBpdFxuICogIHdvcmtzLCBpdHMgZ3Jvd3RoLCB3aGF0IGl0IGlzIGJ1aWxkaW5nIGFuZCB3aGF0IGl0IGNvdWxkIGJ1aWxkIG5leHQuICovXG5leHBvcnQgZnVuY3Rpb24gQ2l0eVBhbmVsKHtcbiAgY2l0eSxcbiAgY2l2LFxuICBnYW1lLFxuICBkaXNwYXRjaCxcbiAgb25DbG9zZSxcbn06IHtcbiAgY2l0eTogQ2l0eUluZm87XG4gIGNpdjogQ2l2SW5mbztcbiAgZ2FtZTogR2FtZTtcbiAgZGlzcGF0Y2g6IChhOiBBY3Rpb24pID0+IHZvaWQ7XG4gIG9uQ2xvc2U6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IGVudGVyID0gdXNlU2xpZGVJbigtODAsIDApO1xuICBjb25zdCBtaW5lID0gY2l2LnBsYXllcjtcbiAgY29uc3Qgc3VycGx1cyA9IGNpdHkueWllbGRzLmZvb2QgLSBjaXR5LnBvcHVsYXRpb24gKiAyO1xuICBjb25zdCBidWlsdCA9IGdhbWUuYnVpbHRbY2l0eS5pZF0gPz8gW107XG4gIGNvbnN0IGhvdXNpbmcgPSBjaXR5LnBvcHVsYXRpb24gKyAyICsgKGJ1aWx0LmluY2x1ZGVzKFwiZ3JhbmFyeVwiKSA/IDIgOiAwKTtcbiAgY29uc3QgYW1lbml0aWVzID0gMiArIChjaXR5LmNhcGl0YWwgPyAyIDogMCk7XG4gIGNvbnN0IHVuaGFwcHkgPSBNYXRoLmNlaWwoY2l0eS5wb3B1bGF0aW9uIC8gMik7XG4gIGNvbnN0IGdyb3d0aCA9ICgoZ2FtZS50dXJuICogNyArIGNpdHkucG9wdWxhdGlvbiAqIDEzKSAlIDIwKSAvIDIwO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5wYW5lbCxcbiAgICAgICAgLi4uZW50ZXIsXG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAxMixcbiAgICAgICAgdG9wOiA0NCxcbiAgICAgICAgYm90dG9tOiAxMixcbiAgICAgICAgd2lkdGg6IFdJRFRILFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e09XTlNfUE9JTlRFUn1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTIsIHZlcnRpY2FsOiAxMCB9LFxuICAgICAgICAgIGJvcmRlclJhZGl1czogeyB0b3A6IDMsIHJpZ2h0OiAzIH0sXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgIHsgY29sb3I6IHRvbmUoY2l2LmNvbG9yLCAwLjkpIH0sXG4gICAgICAgICAgICAgIHsgY29sb3I6IHRvbmUoY2l2LmNvbG9yLCAwLjM1KSB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5nb2xkLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8TWVkYWxsaW9uXG4gICAgICAgICAgc2l6ZT17NDh9XG4gICAgICAgICAgaW5uZXI9e0Muc2xhdGV9XG4gICAgICAgICAgb3V0ZXI9e0MuaW5rfVxuICAgICAgICAgIHByb2dyZXNzPXtncm93dGh9XG4gICAgICAgICAgcmluZz17Qy5mb29kfVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDE3LCBmb250V2VpZ2h0OiBcImJvbGRcIiwgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAgICAgIHtgJHtjaXR5LnBvcHVsYXRpb259YH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvTWVkYWxsaW9uPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBmbGV4R3JvdzogMSwgZ2FwOiAxIH19PlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogNiB9fT5cbiAgICAgICAgICAgIHtjaXR5LmNhcGl0YWwgJiYgPEljb24gbmFtZT1cInN0YXJcIiBzaXplPXsxNX0gY29sb3I9e0MuZ29sZEhpfSAvPn1cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRm9udHMuZGlzcGxheSxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMjEsXG4gICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgICAgIGNvbG9yOiBcIiNmZmZmZmZcIixcbiAgICAgICAgICAgICAgICB0ZXh0U2hhZG93OiB7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNilcIixcbiAgICAgICAgICAgICAgICAgIG9mZnNldFg6IDAsXG4gICAgICAgICAgICAgICAgICBvZmZzZXRZOiAxLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtjaXR5Lm5hbWUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogdG9uZShjaXYuY29sb3IsIDEuNikgfX0+XG4gICAgICAgICAgICB7Y2l0eS5jYXBpdGFsID8gYENhcGl0YWwgb2YgJHtjaXYubmFtZX1gIDogY2l2Lm5hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxDbG9zZUJ1dHRvbiBvbkNsaWNrPXtvbkNsb3NlfSAvPlxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxNiwgdmVydGljYWw6IDEyIH0sXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC4yNSlcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge1lJRUxEUy5tYXAoKHkpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXt5LmtleX1cbiAgICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMyB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxJY29uIG5hbWU9e3kua2V5fSBzaXplPXsyMH0gY29sb3I9e3kuY29sb3J9IC8+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLCBjb2xvcjogeS5jb2xvciB9fT5cbiAgICAgICAgICAgICAge3NpZ25lZCh5LmtleSA9PT0gXCJmb29kXCIgPyBzdXJwbHVzIDogY2l0eS55aWVsZHNbeS5rZXldKX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuXG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDksIHBhZGRpbmc6IDE0IH19PlxuICAgICAgICA8U3RhdFxuICAgICAgICAgIGljb249XCJmb29kXCJcbiAgICAgICAgICBjb2xvcj17Qy5mb29kfVxuICAgICAgICAgIGxhYmVsPVwiR3Jvd3RoXCJcbiAgICAgICAgICB2YWx1ZT17cGx1cmFsKE1hdGgubWF4KDEsIE1hdGguY2VpbCgoMSAtIGdyb3d0aCkgKiAxMikpLCBcInR1cm5cIil9XG4gICAgICAgICAgZmlsbD17Z3Jvd3RofVxuICAgICAgICAvPlxuICAgICAgICA8U3RhdFxuICAgICAgICAgIGljb249XCJob3VzaW5nXCJcbiAgICAgICAgICBjb2xvcj1cIiM3ZWM4YzBcIlxuICAgICAgICAgIGxhYmVsPVwiSG91c2luZ1wiXG4gICAgICAgICAgdmFsdWU9e2Ake2NpdHkucG9wdWxhdGlvbn0gLyAke2hvdXNpbmd9YH1cbiAgICAgICAgICBmaWxsPXtjaXR5LnBvcHVsYXRpb24gLyBob3VzaW5nfVxuICAgICAgICAvPlxuICAgICAgICA8U3RhdFxuICAgICAgICAgIGljb249XCJhbWVuaXRpZXNcIlxuICAgICAgICAgIGNvbG9yPXthbWVuaXRpZXMgPj0gdW5oYXBweSA/IEMuZ29vZCA6IEMuYmFkfVxuICAgICAgICAgIGxhYmVsPVwiQW1lbml0aWVzXCJcbiAgICAgICAgICB2YWx1ZT17YCR7YW1lbml0aWVzfSAvICR7dW5oYXBweX1gfVxuICAgICAgICAgIGZpbGw9e01hdGgubWluKDEsIGFtZW5pdGllcyAvIHVuaGFwcHkpfVxuICAgICAgICAvPlxuICAgICAgICA8U3RhdFxuICAgICAgICAgIGljb249XCJtYXBcIlxuICAgICAgICAgIGNvbG9yPXtDLm11dGVkfVxuICAgICAgICAgIGxhYmVsPVwiVGVycml0b3J5XCJcbiAgICAgICAgICB2YWx1ZT17YCR7Y2l0eS50aWxlc30gdGlsZXNgfVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuXG4gICAgICB7bWluZSA/IChcbiAgICAgICAgPFByb2R1Y3Rpb24gY2l0eT17Y2l0eX0gZ2FtZT17Z2FtZX0gZGlzcGF0Y2g9e2Rpc3BhdGNofSAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fT5cbiAgICAgICAgICAgIHtgQSBjaXR5IG9mICR7Y2l2Lm5hbWV9LiBJdHMgd29ya3MgYXJlIGhpZGRlbiBmcm9tIHlvdS5gfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFN0YXQoe1xuICBpY29uLFxuICBjb2xvcixcbiAgbGFiZWwsXG4gIHZhbHVlLFxuICBmaWxsLFxufToge1xuICBpY29uOiBJY29uTmFtZTtcbiAgY29sb3I6IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgZmlsbD86IG51bWJlcjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX0+XG4gICAgICA8SWNvbiBuYW1lPXtpY29ufSBzaXplPXsxNn0gY29sb3I9e2NvbG9yfSAvPlxuICAgICAgPHRleHQgc3R5bGU9e3sgd2lkdGg6IDgyLCBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnRleHQgfX0+e2xhYmVsfTwvdGV4dD5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxIH19PlxuICAgICAgICB7ZmlsbCAhPT0gdW5kZWZpbmVkICYmIDxCYXIgdmFsdWU9e2ZpbGx9IHdpZHRoPXsxNTB9IGNvbG9yPXtjb2xvcn0gLz59XG4gICAgICA8L25vZGU+XG4gICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIiwgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAge3ZhbHVlfVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gUHJvZHVjdGlvbih7XG4gIGNpdHksXG4gIGdhbWUsXG4gIGRpc3BhdGNoLFxufToge1xuICBjaXR5OiBDaXR5SW5mbztcbiAgZ2FtZTogR2FtZTtcbiAgZGlzcGF0Y2g6IChhOiBBY3Rpb24pID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IG5vdyA9IGdhbWUuYnVpbGRpbmdbY2l0eS5pZF07XG4gIGNvbnN0IGN1cnJlbnQgPSBpdGVtKG5vdy5pdGVtKTtcbiAgY29uc3QgYnVpbHQgPSBnYW1lLmJ1aWx0W2NpdHkuaWRdID8/IFtdO1xuICBjb25zdCByYXRlID0gY2l0eS55aWVsZHMucHJvZHVjdGlvbjtcbiAgY29uc3QgZ3JvdXBzID0gKFtcIkRpc3RyaWN0XCIsIFwiQnVpbGRpbmdcIiwgXCJVbml0XCJdIGFzIGNvbnN0KS5tYXAoKGtpbmQpID0+ICh7XG4gICAga2luZCxcbiAgICBpdGVtczogSVRFTVMuZmlsdGVyKChpKSA9PiBpLmtpbmQgPT09IGtpbmQgJiYgIWJ1aWx0LmluY2x1ZGVzKGkuaWQpKSxcbiAgfSkpO1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgZmxleFNocmluazogMSxcbiAgICAgICAgbWluSGVpZ2h0OiAwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE0IH0sIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogOCB9fVxuICAgICAgPlxuICAgICAgICA8SGVhZGVyIGNvbG9yPXtDLnByb2R1Y3Rpb259PlByb2R1Y2luZzwvSGVhZGVyPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEwIH19PlxuICAgICAgICAgIDxNZWRhbGxpb25cbiAgICAgICAgICAgIHNpemU9ezQ2fVxuICAgICAgICAgICAgcHJvZ3Jlc3M9e25vdy5wcm9ncmVzcyAvIGN1cnJlbnQuY29zdH1cbiAgICAgICAgICAgIHJpbmc9e0MucHJvZHVjdGlvbn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXtjdXJyZW50Lmljb259IHNpemU9ezIwfSBjb2xvcj17Qy5wcm9kdWN0aW9ufSAvPlxuICAgICAgICAgIDwvTWVkYWxsaW9uPlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiwgZmxleEdyb3c6IDEgfX0+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17eyBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIiwgY29sb3I6IEMudGV4dCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7Y3VycmVudC5uYW1lfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy5wcm9kdWN0aW9uIH19PlxuICAgICAgICAgICAgICB7YCR7cGx1cmFsKHR1cm5zTGVmdChjdXJyZW50LmNvc3QsIG5vdy5wcm9ncmVzcywgcmF0ZSksIFwidHVyblwiKX0gwrcgJHtmbXQobm93LnByb2dyZXNzKX0vJHtjdXJyZW50LmNvc3R9YH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAge2J1aWx0Lmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGZsZXhXcmFwOiBcIndyYXBcIiwgZ2FwOiA1IH19PlxuICAgICAgICAgICAge2J1aWx0Lm1hcCgoaWQpID0+IChcbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBrZXk9e2lkfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgIGdhcDogNCxcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogNywgdmVydGljYWw6IDMgfSxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMTAsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA2KVwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8SWNvbiBuYW1lPXtpdGVtKGlkKS5pY29ufSBzaXplPXsxMX0gY29sb3I9e0MubXV0ZWR9IC8+XG4gICAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogQy5tdXRlZCB9fT5cbiAgICAgICAgICAgICAgICAgIHtpdGVtKGlkKS5uYW1lfVxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApfVxuICAgICAgICA8SGVhZGVyPkNob29zZSBwcm9kdWN0aW9uPC9IZWFkZXI+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgIGZsZXhTaHJpbms6IDEsXG4gICAgICAgICAgbWluSGVpZ2h0OiAwLFxuICAgICAgICAgIG92ZXJmbG93WTogXCJzY3JvbGxcIixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAsIGJvdHRvbTogMTAgfSxcbiAgICAgICAgICBzY3JvbGxiYXI6IHtcbiAgICAgICAgICAgIHRoaWNrbmVzczogNixcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZsb2F0XCIsXG4gICAgICAgICAgICB0aHVtYjogeyBiYWNrZ3JvdW5kQ29sb3I6IEMuZ29sZExvLCBib3JkZXJSYWRpdXM6IDMgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7Z3JvdXBzLm1hcCgoZykgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e2cua2luZH1cbiAgICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNCwgbWFyZ2luOiB7IHRvcDogOCB9IH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgLi4uY2FwcywgY29sb3I6IEMubXV0ZWQsIG1hcmdpbjogeyBsZWZ0OiA0IH0gfX1cbiAgICAgICAgICAgID57YCR7Zy5raW5kfXNgfTwvdGV4dD5cbiAgICAgICAgICAgIHtnLml0ZW1zLm1hcCgoaXQpID0+IChcbiAgICAgICAgICAgICAgPENob2ljZVxuICAgICAgICAgICAgICAgIGtleT17aXQuaWR9XG4gICAgICAgICAgICAgICAgaXQ9e2l0fVxuICAgICAgICAgICAgICAgIHR1cm5zPXt0dXJuc0xlZnQoaXQuY29zdCwgMCwgcmF0ZSl9XG4gICAgICAgICAgICAgICAgYWN0aXZlPXtpdC5pZCA9PT0gY3VycmVudC5pZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PlxuICAgICAgICAgICAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcInByb2R1Y2VcIiwgY2l0eTogY2l0eS5pZCwgaXRlbTogaXQuaWQgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gQ2hvaWNlKHtcbiAgaXQsXG4gIHR1cm5zLFxuICBhY3RpdmUsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGl0OiBJdGVtO1xuICB0dXJuczogbnVtYmVyO1xuICBhY3RpdmU6IGJvb2xlYW47XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMTAsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogOCwgdmVydGljYWw6IDYgfSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAzLFxuICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgIGJvcmRlckNvbG9yOiBhY3RpdmUgPyBDLnByb2R1Y3Rpb24gOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNilcIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBhY3RpdmVcbiAgICAgICAgICA/IFwicmdiYSgyNDAsIDE1NSwgNjEsIDAuMTYpXCJcbiAgICAgICAgICA6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKVwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3tcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoOTUsIDE5MSwgMjQ0LCAwLjE0KVwiLFxuICAgICAgICBib3JkZXJDb2xvcjogQy5zbGF0ZUhpLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAzMCxcbiAgICAgICAgICBoZWlnaHQ6IDMwLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogMTUsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuaW5rLFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5nb2xkTG8sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxJY29uIG5hbWU9e2l0Lmljb259IHNpemU9ezE2fSBjb2xvcj17Qy5nb2xkSGl9IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBmbGV4R3JvdzogMSwgZ2FwOiAxIH19PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIiwgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAgICB7aXQubmFtZX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTEsIGNvbG9yOiBDLm11dGVkIH19PntpdC5lZmZlY3R9PC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsIGdhcDogMSB9fT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAzIH19PlxuICAgICAgICAgIDxJY29uIG5hbWU9XCJwcm9kdWN0aW9uXCIgc2l6ZT17MTF9IGNvbG9yPXtDLnByb2R1Y3Rpb259IC8+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMucHJvZHVjdGlvbiB9fVxuICAgICAgICAgID57YCR7aXQuY29zdH1gfTwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTEsIGNvbG9yOiBDLm11dGVkIH19PlxuICAgICAgICAgIHtwbHVyYWwodHVybnMsIFwidHVyblwiKX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIHVzZVNoYXJlZFZhbHVlLFxuICB3aXRoUmVwZWF0LFxuICB3aXRoVGltaW5nLFxuICB0eXBlIFBvaW50ZXJFdmVudERhdGEsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBPV05TX1BPSU5URVIsIGNhcHMsIGdpbHQsIHBhbmVsIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IFJvdW5kQnV0dG9uLCByYWRpYWwgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5cbmNvbnN0IE1BUF9XID0gMzAwO1xuLyoqIFRoZSBtYXAncyBhc3BlY3QgKGl0cyBoZXggZ3JpZCdzIHdpZHRoIG92ZXIgaXRzIGhlaWdodCkuICovXG5jb25zdCBNQVBfSCA9IE1hdGgucm91bmQoTUFQX1cgLyAxLjgzKTtcblxuLyoqIEJvdHRvbSByaWdodDogdGhlIGVuZC10dXJuIGJ1dHRvbiBhbmQgdGhlIG1pbmltYXAg4oCUIGEgYDxwb3J0YWw+YCBvZiBhXG4gKiAgdG9wLWRvd24gY2FtZXJhIGZpbG1pbmcgdGhlIHdob2xlIG1hcCwgeW91ciB2aWV3IG91dGxpbmVkIG9uIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFjdGlvblBhbmVsKHtcbiAgbGFiZWwsXG4gIGJ1c3ksXG4gIGxlbnMsXG4gIG9uTmV4dCxcbiAgb25MZW5zLFxufToge1xuICBsYWJlbDogc3RyaW5nO1xuICBidXN5OiBib29sZWFuO1xuICBsZW5zOiBib29sZWFuO1xuICBvbk5leHQ6ICgpID0+IHZvaWQ7XG4gIG9uTGVuczogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QganVtcCA9IChlOiBQb2ludGVyRXZlbnREYXRhKSA9PiBiZXZ5Lm1hcC5qdW1wKHsgdTogZS54LCB2OiBlLnkgfSk7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICByaWdodDogMTIsXG4gICAgICAgIGJvdHRvbTogMTIsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiZmxleEVuZFwiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBtYXJnaW46IHsgYm90dG9tOiAtMTgsIHJpZ2h0OiA4IH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAgICAgaGVpZ2h0OiAzNCxcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMTYsIHJpZ2h0OiAzMCB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7IHJpZ2h0OiAtMjIgfSxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAxNyxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGhvdmVyU3R5bGU9e09XTlNfUE9JTlRFUn1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgICAgZm9udFNpemU6IDE0LFxuICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjUsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2xhYmVsfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8RW5kVHVybiBidXN5PXtidXN5fSBvbkNsaWNrPXtvbk5leHR9IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17eyAuLi5wYW5lbCwgcGFkZGluZzogNiwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA2IH19XG4gICAgICAgIGhvdmVyU3R5bGU9e09XTlNfUE9JTlRFUn1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBnYXA6IDgsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDIgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFJvdW5kQnV0dG9uXG4gICAgICAgICAgICBpY29uPVwibWFwXCJcbiAgICAgICAgICAgIHNpemU9ezI4fVxuICAgICAgICAgICAgdGlwPXtsZW5zID8gXCJCYWNrIHRvIHRoZSB0ZXJyYWluXCIgOiBcIlBvbGl0aWNhbCBsZW5zXCJ9XG4gICAgICAgICAgICB0aXBTaWRlPVwidG9wXCJcbiAgICAgICAgICAgIGFjdGl2ZT17bGVuc31cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uTGVuc31cbiAgICAgICAgICAvPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmNhcHMsIGNvbG9yOiBsZW5zID8gQy5nb2xkSGkgOiBDLm11dGVkIH19PlxuICAgICAgICAgICAge2xlbnMgPyBcIlBPTElUSUNBTCBMRU5TXCIgOiBcIlRFUlJBSU5cIn1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPHBvcnRhbFxuICAgICAgICAgIHRhcmdldD1cIm1pbmltYXBcIlxuICAgICAgICAgIG9uUG9pbnRlckRvd249e2p1bXB9XG4gICAgICAgICAgb25Qb2ludGVyTW92ZT17anVtcH1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IE1BUF9XLFxuICAgICAgICAgICAgaGVpZ2h0OiBNQVBfSCxcbiAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMbyxcbiAgICAgICAgICAgIGN1cnNvcjogXCJjcm9zc2hhaXJcIixcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSBncmVhdCByb3VuZCBidXR0b246IGEgZ2lsdCByaW5nIHRoYXQgdHVybnMgd2hpbGUgdGhlIHdvcmxkIHRha2VzXG4gKiAgaXRzIHR1cm4uICovXG5mdW5jdGlvbiBFbmRUdXJuKHsgYnVzeSwgb25DbGljayB9OiB7IGJ1c3k6IGJvb2xlYW47IG9uQ2xpY2s6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBzcGluID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIGNvbnN0IFtnbG93LCBzZXRHbG93XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzcGluLnZhbHVlID0gMDtcbiAgICBpZiAoYnVzeSkgc3Bpbi52YWx1ZSA9IHdpdGhSZXBlYXQod2l0aFRpbWluZygzNjAsIHsgZHVyYXRpb246IDcwMCB9KSk7XG4gIH0sIFtidXN5LCBzcGluXSk7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIG9uUG9pbnRlckVudGVyPXsoKSA9PiBzZXRHbG93KHRydWUpfVxuICAgICAgb25Qb2ludGVyTGVhdmU9eygpID0+IHNldEdsb3coZmFsc2UpfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IDk2LFxuICAgICAgICBoZWlnaHQ6IDk2LFxuICAgICAgICBib3JkZXJSYWRpdXM6IDQ4LFxuICAgICAgICBwYWRkaW5nOiA1LFxuICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IGdpbHQsXG4gICAgICAgIGJveFNoYWRvdzogZ2xvd1xuICAgICAgICAgID8geyBjb2xvcjogXCJyZ2JhKDI0NiwgMjI4LCAxNjgsIDAuNilcIiwgYmx1clJhZGl1czogMjIgfVxuICAgICAgICAgIDogeyBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNilcIiwgYmx1clJhZGl1czogMTQsIHlPZmZzZXQ6IDQgfSxcbiAgICAgIH19XG4gICAgICBwcmVzc1N0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMC45NSB9IH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDQzLFxuICAgICAgICAgIHBhZGRpbmc6IDYsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICB0eXBlOiBcImNvbmljXCIsXG4gICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiM3ZmQwZmZcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiMxNjQ0NmFcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiM3ZmQwZmZcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiMxNjQ0NmFcIiB9LFxuICAgICAgICAgICAgICB7IGNvbG9yOiBcIiM3ZmQwZmZcIiB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRyYW5zZm9ybTogeyByb3RhdGU6IHsgYW5pbWF0ZWQ6IHNwaW4gfSB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogMzcsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHJhZGlhbChcIiMyZjZhOWNcIiwgXCIjMGIxYzJlXCIpLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvbiBuYW1lPXtidXN5ID8gXCJtb29uXCIgOiBcImFycm93XCJ9IHNpemU9ezM0fSBjb2xvcj17Qy5nb2xkSGl9IC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IENpdkluZm8sIFVuaXRJbmZvIH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB7IHVzZVNsaWRlSW4gfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBPV05TX1BPSU5URVIsIHBhbmVsLCB0b25lIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uLCB0eXBlIEljb25OYW1lIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IEFtb3VudCwgQmFyLCBDbG9zZUJ1dHRvbiwgTWVkYWxsaW9uLCBSb3VuZEJ1dHRvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxudHlwZSBPcmRlciA9IHsgaWNvbjogSWNvbk5hbWU7IG5hbWU6IHN0cmluZyB9O1xuXG5jb25zdCBNT1ZFOiBPcmRlciA9IHsgaWNvbjogXCJhcnJvd1wiLCBuYW1lOiBcIk1vdmVcIiB9O1xuY29uc3QgRk9SVElGWTogT3JkZXIgPSB7IGljb246IFwic2hpZWxkXCIsIG5hbWU6IFwiRm9ydGlmeVwiIH07XG5jb25zdCBTTEVFUDogT3JkZXIgPSB7IGljb246IFwibW9vblwiLCBuYW1lOiBcIlNsZWVwXCIgfTtcbmNvbnN0IFNLSVA6IE9yZGVyID0geyBpY29uOiBcInNraXBcIiwgbmFtZTogXCJTa2lwIHR1cm5cIiB9O1xuY29uc3QgREVMRVRFOiBPcmRlciA9IHsgaWNvbjogXCJ0cmFzaFwiLCBuYW1lOiBcIkRlbGV0ZSB1bml0XCIgfTtcblxuZXhwb3J0IGNvbnN0IFVOSVRTOiBSZWNvcmQ8XG4gIHN0cmluZyxcbiAge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICByb2xlOiBzdHJpbmc7XG4gICAgaWNvbjogSWNvbk5hbWU7XG4gICAgc3RyZW5ndGg/OiBudW1iZXI7XG4gICAgcmFuZ2VkPzogbnVtYmVyO1xuICAgIG1vdmVzOiBudW1iZXI7XG4gICAgb3JkZXJzOiBPcmRlcltdO1xuICB9XG4+ID0ge1xuICB3YXJyaW9yOiB7XG4gICAgbmFtZTogXCJXYXJyaW9yXCIsXG4gICAgcm9sZTogXCJNZWxlZVwiLFxuICAgIGljb246IFwic3RyZW5ndGhcIixcbiAgICBzdHJlbmd0aDogMjAsXG4gICAgbW92ZXM6IDIsXG4gICAgb3JkZXJzOiBbTU9WRSwgRk9SVElGWSwgU0xFRVAsIFNLSVAsIERFTEVURV0sXG4gIH0sXG4gIGFyY2hlcjoge1xuICAgIG5hbWU6IFwiQXJjaGVyXCIsXG4gICAgcm9sZTogXCJSYW5nZWRcIixcbiAgICBpY29uOiBcImJvd1wiLFxuICAgIHN0cmVuZ3RoOiAxNSxcbiAgICByYW5nZWQ6IDI1LFxuICAgIG1vdmVzOiAyLFxuICAgIG9yZGVyczogW1xuICAgICAgTU9WRSxcbiAgICAgIHsgaWNvbjogXCJib3dcIiwgbmFtZTogXCJSYW5nZWQgYXR0YWNrXCIgfSxcbiAgICAgIEZPUlRJRlksXG4gICAgICBTS0lQLFxuICAgICAgREVMRVRFLFxuICAgIF0sXG4gIH0sXG4gIHNjb3V0OiB7XG4gICAgbmFtZTogXCJTY291dFwiLFxuICAgIHJvbGU6IFwiUmVjb25cIixcbiAgICBpY29uOiBcImV5ZVwiLFxuICAgIHN0cmVuZ3RoOiAxMCxcbiAgICBtb3ZlczogMyxcbiAgICBvcmRlcnM6IFtNT1ZFLCB7IGljb246IFwibWFwXCIsIG5hbWU6IFwiRXhwbG9yZVwiIH0sIFNMRUVQLCBTS0lQLCBERUxFVEVdLFxuICB9LFxuICBzZXR0bGVyOiB7XG4gICAgbmFtZTogXCJTZXR0bGVyXCIsXG4gICAgcm9sZTogXCJDaXZpbGlhblwiLFxuICAgIGljb246IFwiZmxhZ1wiLFxuICAgIG1vdmVzOiAyLFxuICAgIG9yZGVyczogW01PVkUsIHsgaWNvbjogXCJjaXR5XCIsIG5hbWU6IFwiRm91bmQgY2l0eVwiIH0sIFNMRUVQLCBTS0lQLCBERUxFVEVdLFxuICB9LFxuICBidWlsZGVyOiB7XG4gICAgbmFtZTogXCJCdWlsZGVyXCIsXG4gICAgcm9sZTogXCJDaXZpbGlhbiDCtyAzIGNoYXJnZXNcIixcbiAgICBpY29uOiBcInByb2R1Y3Rpb25cIixcbiAgICBtb3ZlczogMixcbiAgICBvcmRlcnM6IFtcbiAgICAgIE1PVkUsXG4gICAgICB7IGljb246IFwicHJvZHVjdGlvblwiLCBuYW1lOiBcIkJ1aWxkIGZhcm1cIiB9LFxuICAgICAgU0xFRVAsXG4gICAgICBTS0lQLFxuICAgICAgREVMRVRFLFxuICAgIF0sXG4gIH0sXG59O1xuXG4vKiogQm90dG9tIGxlZnQsIHdoaWxlIGEgdW5pdCBpcyBzZWxlY3RlZDogaXRzIHBvcnRyYWl0LCBudW1iZXJzIGFuZFxuICogIG9yZGVycy4gKE9yZGVycyBqdXN0IGRpc21pc3MgaXQ6IG5vdGhpbmcgaXMgcGxheWVkIGhlcmUuKSAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuaXRQYW5lbCh7XG4gIHVuaXQsXG4gIGNpdixcbiAgb25DbG9zZSxcbn06IHtcbiAgdW5pdDogVW5pdEluZm87XG4gIGNpdjogQ2l2SW5mbztcbiAgb25DbG9zZTogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZGVmID0gVU5JVFNbdW5pdC5raW5kXTtcbiAgY29uc3QgZW50ZXIgPSB1c2VTbGlkZUluKDAsIDcwKTtcbiAgY29uc3QgbWluZSA9IGNpdi5wbGF5ZXI7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAuLi5lbnRlcixcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDEyLFxuICAgICAgICBib3R0b206IDEyLFxuICAgICAgICB3aWR0aDogNDAwLFxuICAgICAgICBwYWRkaW5nOiAxMixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgZ2FwOiAxMixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXtPV05TX1BPSU5URVJ9XG4gICAgPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAxNCwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fT5cbiAgICAgICAgPE1lZGFsbGlvblxuICAgICAgICAgIHNpemU9ezg4fVxuICAgICAgICAgIGlubmVyPXt0b25lKGNpdi5jb2xvciwgMS4zKX1cbiAgICAgICAgICBvdXRlcj17dG9uZShjaXYuY29sb3IsIDAuMzUpfVxuICAgICAgICA+XG4gICAgICAgICAgPEljb24gbmFtZT17ZGVmLmljb259IHNpemU9ezQyfSBjb2xvcj1cIiNmZmZmZmZcIiAvPlxuICAgICAgICA8L01lZGFsbGlvbj5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA1LCBmbGV4R3JvdzogMSB9fT5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiIH19PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAyMCxcbiAgICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjUsXG4gICAgICAgICAgICAgICAgY29sb3I6IEMuZ29sZEhpLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7ZGVmLm5hbWUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDxDbG9zZUJ1dHRvbiBvbkNsaWNrPXtvbkNsb3NlfSAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fVxuICAgICAgICAgID57YCR7ZGVmLnJvbGV9IMK3ICR7Y2l2Lm5hbWV9YH08L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAxNiwgbWFyZ2luOiB7IHRvcDogMiB9IH19PlxuICAgICAgICAgICAge2RlZi5zdHJlbmd0aCAmJiAoXG4gICAgICAgICAgICAgIDxBbW91bnRcbiAgICAgICAgICAgICAgICBpY29uPVwic3RyZW5ndGhcIlxuICAgICAgICAgICAgICAgIGNvbG9yPXtDLnRleHR9XG4gICAgICAgICAgICAgICAgdmFsdWU9e2Ake2RlZi5zdHJlbmd0aH1gfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIHtkZWYucmFuZ2VkICYmIChcbiAgICAgICAgICAgICAgPEFtb3VudCBpY29uPVwiYm93XCIgY29sb3I9e0MudGV4dH0gdmFsdWU9e2Ake2RlZi5yYW5nZWR9YH0gLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8QW1vdW50XG4gICAgICAgICAgICAgIGljb249XCJtb3ZlbWVudFwiXG4gICAgICAgICAgICAgIGNvbG9yPXtDLnRleHR9XG4gICAgICAgICAgICAgIHZhbHVlPXtgJHtkZWYubW92ZXN9LyR7ZGVmLm1vdmVzfWB9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8QmFyIHZhbHVlPXttaW5lID8gMSA6IDAuN30gd2lkdGg9ezI0MH0gaGVpZ2h0PXs4fSBjb2xvcj17Qy5nb29kfSAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICB7bWluZSAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBnYXA6IDEwLFxuICAgICAgICAgICAgcGFkZGluZzogeyB0b3A6IDEwIH0sXG4gICAgICAgICAgICBib3JkZXI6IHsgdG9wOiAxIH0sXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogQy5nb2xkTGluZSxcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7ZGVmLm9yZGVycy5tYXAoKG8pID0+IChcbiAgICAgICAgICAgIDxSb3VuZEJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e28ubmFtZX1cbiAgICAgICAgICAgICAgaWNvbj17by5pY29ufVxuICAgICAgICAgICAgICB0aXA9e28ubmFtZX1cbiAgICAgICAgICAgICAgdGlwU2lkZT1cInRvcFwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xvc2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IENpdHlJbmZvLCBDaXZJbmZvLCBUaWxlSW5mbywgVW5pdEluZm8sIFdvcmxkSW5mbyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBpdGVtLCB0dXJuc0xlZnQsIHR5cGUgR2FtZSB9IGZyb20gXCIuLi9nYW1lXCI7XG5pbXBvcnQgeyBDLCBGb250cywgWUlFTERTLCBmbXQsIHBhbmVsLCB0b25lIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IGNvbmljLCByYWRpYWwgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5pbXBvcnQgeyBVTklUUyB9IGZyb20gXCIuL1VuaXRQYW5lbFwiO1xuXG5leHBvcnQgdHlwZSBTZWxlY3Rpb24gPSB7IGtpbmQ6IFwiY2l0eVwiIHwgXCJ1bml0XCI7IGlkOiBzdHJpbmcgfSB8IG51bGw7XG5cbi8qKiBUaGUgY2l0eSBiYW5uZXJzIGFuZCB1bml0IGZsYWdzOiBzY3JlZW4tc3BhY2UgUmVhY3QgcGlubmVkIHRvIHBvaW50cyBvZlxuICogIHRoZSAzRCBtYXAgd2l0aCBgPGFuY2hvcj5gLCBmb2xsb3dpbmcgaXQgYXMgdGhlIGNhbWVyYSBtb3Zlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCYW5uZXJzKHtcbiAgd29ybGQsXG4gIGdhbWUsXG4gIHNlbGVjdGlvbixcbiAgb25TZWxlY3QsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHNlbGVjdGlvbjogU2VsZWN0aW9uO1xuICBvblNlbGVjdDogKHM6IFNlbGVjdGlvbikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgY2l2ID0gKGlkOiBzdHJpbmcpID0+IHdvcmxkLmNpdnMuZmluZCgoYykgPT4gYy5pZCA9PT0gaWQpITtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge3dvcmxkLmNpdGllcy5tYXAoKGNpdHkpID0+IChcbiAgICAgICAgPENpdHlCYW5uZXJcbiAgICAgICAgICBrZXk9e2NpdHkuaWR9XG4gICAgICAgICAgY2l0eT17Y2l0eX1cbiAgICAgICAgICBjaXY9e2NpdihjaXR5LmNpdil9XG4gICAgICAgICAgZ2FtZT17Z2FtZX1cbiAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0aW9uPy5raW5kID09PSBcImNpdHlcIiAmJiBzZWxlY3Rpb24uaWQgPT09IGNpdHkuaWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25TZWxlY3QoeyBraW5kOiBcImNpdHlcIiwgaWQ6IGNpdHkuaWQgfSl9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICAgIHt3b3JsZC51bml0c1xuICAgICAgICAuZmlsdGVyKCh1KSA9PiAhdS5oaWRkZW4pXG4gICAgICAgIC5tYXAoKHVuaXQpID0+IChcbiAgICAgICAgICA8VW5pdEZsYWdcbiAgICAgICAgICAgIGtleT17dW5pdC5pZH1cbiAgICAgICAgICAgIHVuaXQ9e3VuaXR9XG4gICAgICAgICAgICBjaXY9e2Npdih1bml0LmNpdil9XG4gICAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0aW9uPy5raW5kID09PSBcInVuaXRcIiAmJiBzZWxlY3Rpb24uaWQgPT09IHVuaXQuaWR9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdCh7IGtpbmQ6IFwidW5pdFwiLCBpZDogdW5pdC5pZCB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICA8Lz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gQ2l0eUJhbm5lcih7XG4gIGNpdHksXG4gIGNpdixcbiAgZ2FtZSxcbiAgc2VsZWN0ZWQsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGNpdHk6IENpdHlJbmZvO1xuICBjaXY6IENpdkluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHNlbGVjdGVkOiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBwcm9kdWNpbmcgPSBnYW1lLmJ1aWxkaW5nW2NpdHkuaWRdO1xuICBjb25zdCBpdCA9IHByb2R1Y2luZyAmJiBpdGVtKHByb2R1Y2luZy5pdGVtKTtcbiAgLy8gR3Jvd3RoIGlzIHByZXRlbmQ6IGEgZmlsbCB0aGF0IGNyZWVwcyBvbiB3aXRoIHRoZSB0dXJucy5cbiAgY29uc3QgZ3Jvd3RoID0gKChnYW1lLnR1cm4gKiA3ICsgY2l0eS5wb3B1bGF0aW9uICogMTMpICUgMjApIC8gMjA7XG4gIHJldHVybiAoXG4gICAgPGFuY2hvclxuICAgICAgZW50aXR5PXtjaXR5LmVudGl0eX1cbiAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGhlaWdodDogMjggfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAzMCxcbiAgICAgICAgICBoZWlnaHQ6IDMwLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogMTUsXG4gICAgICAgICAgcGFkZGluZzogMyxcbiAgICAgICAgICBtYXJnaW46IHsgcmlnaHQ6IC04IH0sXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBjb25pYyhncm93dGgsIEMuZm9vZCksXG4gICAgICAgICAgekluZGV4OiAxLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogMTIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuaW5rLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLCBjb2xvcjogQy50ZXh0IH19PlxuICAgICAgICAgICAge2Ake2NpdHkucG9wdWxhdGlvbn1gfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgICAgPGJ1dHRvblxuICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGhlaWdodDogMjQsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGdhcDogNSxcbiAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDE0LCByaWdodDogaXQgPyAxNCA6IDEwIH0sXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAzLFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogc2VsZWN0ZWQgPyBDLmdvbGRIaSA6IHRvbmUoY2l2LmNvbG9yLCAxLjQ1KSxcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgeyBjb2xvcjogdG9uZShjaXYuY29sb3IsIDEuMDUpIH0sXG4gICAgICAgICAgICAgIHsgY29sb3I6IHRvbmUoY2l2LmNvbG9yLCAwLjU1KSB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJveFNoYWRvdzogc2VsZWN0ZWRcbiAgICAgICAgICAgID8geyBjb2xvcjogXCJyZ2JhKDI0NiwgMjI4LCAxNjgsIDAuNylcIiwgYmx1clJhZGl1czogMTAgfVxuICAgICAgICAgICAgOiB7IGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC41NSlcIiwgYmx1clJhZGl1czogNiwgeU9mZnNldDogMiB9LFxuICAgICAgICB9fVxuICAgICAgICBob3ZlclN0eWxlPXt7IGJvcmRlckNvbG9yOiBDLmdvbGRIaSB9fVxuICAgICAgPlxuICAgICAgICB7Y2l0eS5jYXBpdGFsICYmIDxJY29uIG5hbWU9XCJzdGFyXCIgc2l6ZT17MTJ9IGNvbG9yPXtDLmdvbGRIaX0gLz59XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEsXG4gICAgICAgICAgICBjb2xvcjogXCIjZmZmZmZmXCIsXG4gICAgICAgICAgICB0ZXh0U2hhZG93OiB7IGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC43KVwiLCBvZmZzZXRYOiAwLCBvZmZzZXRZOiAxIH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtjaXR5Lm5hbWUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9idXR0b24+XG4gICAgICB7aXQgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIG1hcmdpbjogeyBsZWZ0OiAtOCB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IDI4LFxuICAgICAgICAgICAgICBoZWlnaHQ6IDI4LFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDE0LFxuICAgICAgICAgICAgICBwYWRkaW5nOiAzLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IGNvbmljKFxuICAgICAgICAgICAgICAgIHByb2R1Y2luZy5wcm9ncmVzcyAvIGl0LmNvc3QsXG4gICAgICAgICAgICAgICAgQy5wcm9kdWN0aW9uLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMTEsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuaW5rLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8SWNvbiBuYW1lPXtpdC5pY29ufSBzaXplPXsxM30gY29sb3I9e0MucHJvZHVjdGlvbn0gLz5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICB0b3A6IDI4LFxuICAgICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDQgfSxcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAzLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg2LCAxMywgMjEsIDAuODUpXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMCwgY29sb3I6IEMucHJvZHVjdGlvbiB9fT5cbiAgICAgICAgICAgICAge2Ake3R1cm5zTGVmdChpdC5jb3N0LCBwcm9kdWNpbmcucHJvZ3Jlc3MsIGNpdHkueWllbGRzLnByb2R1Y3Rpb24pfWB9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgIDwvYW5jaG9yPlxuICApO1xufVxuXG5mdW5jdGlvbiBVbml0RmxhZyh7XG4gIHVuaXQsXG4gIGNpdixcbiAgc2VsZWN0ZWQsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIHVuaXQ6IFVuaXRJbmZvO1xuICBjaXY6IENpdkluZm87XG4gIHNlbGVjdGVkOiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxhbmNob3IgZW50aXR5PXt1bml0LmVudGl0eX0gb2Zmc2V0PXtbMCwgMS4wLCAwXX0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IDI4LFxuICAgICAgICAgIGhlaWdodDogMjgsXG4gICAgICAgICAgYm9yZGVyUmFkaXVzOiAxNCxcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICBib3JkZXJDb2xvcjogc2VsZWN0ZWQgPyBDLmdvbGRIaSA6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KVwiLFxuICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogcmFkaWFsKFxuICAgICAgICAgICAgdG9uZShjaXYuY29sb3IsIDEuMiksXG4gICAgICAgICAgICB0b25lKGNpdi5jb2xvciwgMC40NSksXG4gICAgICAgICAgKSxcbiAgICAgICAgICBib3hTaGFkb3c6IHtcbiAgICAgICAgICAgIGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC41NSlcIixcbiAgICAgICAgICAgIGJsdXJSYWRpdXM6IDUsXG4gICAgICAgICAgICB5T2Zmc2V0OiAyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH19XG4gICAgICAgIGhvdmVyU3R5bGU9e3sgdHJhbnNmb3JtOiB7IHNjYWxlOiAxLjEyIH0gfX1cbiAgICAgID5cbiAgICAgICAgPEljb24gbmFtZT17VU5JVFNbdW5pdC5raW5kXS5pY29ufSBzaXplPXsxNX0gY29sb3I9XCIjZmZmZmZmXCIgLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvYW5jaG9yPlxuICApO1xufVxuXG5jb25zdCBGRUFUVVJFUzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgd29vZHM6IFwiV29vZHNcIixcbiAgcmFpbmZvcmVzdDogXCJSYWluZm9yZXN0XCIsXG59O1xuXG4vKiogVGhlIGhvdmVyZWQgdGlsZSdzIHRlcnJhaW4gYW5kIHlpZWxkcywgcGlubmVkIGJlc2lkZSBpdDogdGhlIGFuY2hvclxuICogIGZvbGxvd3MgdGhlIHJpbmcgQmV2eSBwdXRzIG9uIHRoZSB0aWxlIHVuZGVyIHRoZSBwb2ludGVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRpbGVUb29sdGlwKHtcbiAgdGlsZSxcbiAgY3Vyc29yLFxuICB3b3JsZCxcbn06IHtcbiAgdGlsZTogVGlsZUluZm87XG4gIGN1cnNvcjogbnVtYmVyO1xuICB3b3JsZDogV29ybGRJbmZvO1xufSkge1xuICBjb25zdCBvd25lciA9IHdvcmxkLmNpdnMuZmluZCgoYykgPT4gYy5pZCA9PT0gdGlsZS5vd25lcik7XG4gIGNvbnN0IGNpdHkgPSB3b3JsZC5jaXRpZXMuZmluZCgoYykgPT4gYy5pZCA9PT0gdGlsZS5jaXR5KTtcbiAgY29uc3QgdW5pdCA9IHdvcmxkLnVuaXRzLmZpbmQoKHUpID0+IHUuaWQgPT09IHRpbGUudW5pdCk7XG4gIGNvbnN0IHJlbGllZiA9IHRpbGUubW91bnRhaW5zID8gXCJNb3VudGFpbnNcIiA6IHRpbGUuaGlsbHMgPyBcIkhpbGxzXCIgOiBudWxsO1xuICBjb25zdCBuYW1lID0gW3RpbGUudGVycmFpbiwgcmVsaWVmLCB0aWxlLmZlYXR1cmUgJiYgRkVBVFVSRVNbdGlsZS5mZWF0dXJlXV1cbiAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oXCIgwrcgXCIpO1xuICBjb25zdCB5aWVsZHMgPSBZSUVMRFMuZmlsdGVyKCh5KSA9PiB0aWxlLnlpZWxkc1t5LmtleV0gPiAwKTtcbiAgcmV0dXJuIChcbiAgICA8YW5jaG9yIGVudGl0eT17Y3Vyc29yfSBzdHlsZT17eyB3aWR0aDogMiwgaGVpZ2h0OiAyLCBnbG9iYWxaSW5kZXg6IDEgfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDM0LFxuICAgICAgICAgIGJvdHRvbTogMTgsXG4gICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMiwgdmVydGljYWw6IDkgfSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGdhcDogNSxcbiAgICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMubmF2eSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgeyF0aWxlLnJldmVhbGVkID8gKFxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbiAgICAgICAgICAgICAgY29sb3I6IEMubXV0ZWQsXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgVW5leHBsb3JlZCBsYW5kc1xuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAge3RpbGUubW91bnRhaW5zID8gKFxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkIH19PkltcGFzc2FibGU8L3RleHQ+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDEwIH19PlxuICAgICAgICAgICAgICAgIHt5aWVsZHMubWFwKCh5KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgICAgICBrZXk9e3kua2V5fVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICBnYXA6IDMsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxJY29uIG5hbWU9e3kua2V5fSBzaXplPXsxNH0gY29sb3I9e3kuY29sb3J9IC8+XG4gICAgICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiB5LmNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7Zm10KHRpbGUueWllbGRzW3kua2V5XSl9XG4gICAgICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICB7dGlsZS5mYXJtICYmIChcbiAgICAgICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMubXV0ZWQgfX0+RmFybTwvdGV4dD5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge293bmVyICYmIChcbiAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgICAgICAgY29sb3I6IG93bmVyLmNvbG9yLFxuICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7Y2l0eSA/IGAke293bmVyLm5hbWV9IMK3ICR7Y2l0eS5uYW1lfWAgOiBvd25lci5uYW1lfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAge3VuaXQgJiYgKFxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgICAgICAgICAge1VOSVRTW3VuaXQua2luZF0ubmFtZX1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L2FuY2hvcj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBDaXZJbmZvIH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB0eXBlIHsgR2FtZSB9IGZyb20gXCIuLi9nYW1lXCI7XG5pbXBvcnQgeyBDLCBGb250cywgcGFuZWwgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IENyZXN0IH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuXG5jb25zdCBNT09EUyA9IFtcbiAgeyBuYW1lOiBcIkZyaWVuZGx5XCIsIGNvbG9yOiBDLmdvb2QsIG5vdGU6IFwiRGVjbGFyZWQgZnJpZW5kc2hpcCAxMiB0dXJucyBhZ29cIiB9LFxuICB7IG5hbWU6IFwiR3VhcmRlZFwiLCBjb2xvcjogQy5jb2luLCBub3RlOiBcIkNvdmV0cyB5b3VyIGNvYXN0YWwgY2l0aWVzXCIgfSxcbiAgeyBuYW1lOiBcIlVuZnJpZW5kbHlcIiwgY29sb3I6IEMuYmFkLCBub3RlOiBcIkRlbm91bmNlZCB5b3UgZm9yIHlvdXIgYm9yZGVyc1wiIH0sXG4gIHsgbmFtZTogXCJOZXV0cmFsXCIsIGNvbG9yOiBDLm11dGVkLCBub3RlOiBcIlRyYWRlcyB3aXRoIHlvdSBub3cgYW5kIHRoZW5cIiB9LFxuXTtcblxuLyoqIFRoZSByaXZhbHMgeW91IGhhdmUgbWV0LCB0b3AgcmlnaHQ6IGhvdmVyIG9uZSBmb3IgdGhlaXIgbGVhZGVyIGFuZFxuICogIHN0YW5kaW5nLCBjbGljayBmb3IgdGhlIHdvcmxkIHJhbmtpbmdzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExlYWRlcnMoe1xuICByaXZhbHMsXG4gIGdhbWUsXG4gIG9uT3Blbixcbn06IHtcbiAgcml2YWxzOiBDaXZJbmZvW107XG4gIGdhbWU6IEdhbWU7XG4gIG9uT3BlbjogKCkgPT4gdm9pZDtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIHJpZ2h0OiAxNCxcbiAgICAgICAgdG9wOiA0MixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgZ2FwOiAxMCxcbiAgICAgIH19XG4gICAgPlxuICAgICAge3JpdmFscy5tYXAoKGNpdiwgaSkgPT4ge1xuICAgICAgICBjb25zdCBzY29yZSA9IGdhbWUuaGlzdG9yeVtjaXYuaWRdLnNjb3JlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxMZWFkZXJcbiAgICAgICAgICAgIGtleT17Y2l2LmlkfVxuICAgICAgICAgICAgY2l2PXtjaXZ9XG4gICAgICAgICAgICBtb29kPXtNT09EU1tpICUgTU9PRFMubGVuZ3RoXX1cbiAgICAgICAgICAgIHNjb3JlPXtNYXRoLnJvdW5kKHNjb3JlW3Njb3JlLmxlbmd0aCAtIDFdKX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uT3Blbn1cbiAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBMZWFkZXIoe1xuICBjaXYsXG4gIG1vb2QsXG4gIHNjb3JlLFxuICBvbkNsaWNrLFxufToge1xuICBjaXY6IENpdkluZm87XG4gIG1vb2Q6ICh0eXBlb2YgTU9PRFMpW251bWJlcl07XG4gIHNjb3JlOiBudW1iZXI7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2V0SG92ZXIodHJ1ZSl9XG4gICAgICBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIoZmFsc2UpfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IDU0LCBoZWlnaHQ6IDYwLCBhbGlnbkl0ZW1zOiBcImZsZXhTdGFydFwiIH19XG4gICAgICBob3ZlclN0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMS4wNiB9IH19XG4gICAgPlxuICAgICAgPENyZXN0IGNpdj17Y2l2fSBzaXplPXs1NH0gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgbGVmdDogMjAsXG4gICAgICAgICAgdG9wOiA0OCxcbiAgICAgICAgICB3aWR0aDogMTQsXG4gICAgICAgICAgaGVpZ2h0OiAxNCxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDcsXG4gICAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLm5hdnksXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBtb29kLmNvbG9yLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIHtob3ZlciAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgIHRvcDogNjYsXG4gICAgICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICAgICAgcGFkZGluZzogMTIsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgZ2FwOiA0LFxuICAgICAgICAgICAgZ2xvYmFsWkluZGV4OiAxMCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgICAgICBmb250U2l6ZTogMTYsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2Npdi5sZWFkZXJ9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IGNpdi5jb2xvciB9fT57Y2l2Lm5hbWV9PC90ZXh0PlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogNiwgbWFyZ2luOiB7IHRvcDogNiB9IH19PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBtb29kLmNvbG9yLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7bW9vZC5uYW1lfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fVxuICAgICAgICAgICAgPntgwrcgc2NvcmUgJHtzY29yZX1gfTwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fT57bW9vZC5ub3RlfTwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKX1cbiAgICA8L2J1dHRvbj5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBOb3RlIH0gZnJvbSBcIi4uL2dhbWVcIjtcbmltcG9ydCB7IHVzZVNsaWRlSW4gfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IEMsIGdpbHQsIHBhbmVsIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IHJhZGlhbCB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuLyoqIFRoZSBzdGFjayBvZiByb3VuZCBub3RpY2VzIGRvd24gdGhlIHJpZ2h0IGVkZ2UuIE5ldyBvbmVzIHNsaWRlIGluIG9uXG4gKiAgdG9wIGFuZCBwdXNoIHRoZSByZXN0IGRvd247IGhvdmVyIG9uZSB0byByZWFkIGl0LCBjbGljayB0byBkaXNtaXNzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5vdGlmaWNhdGlvbnMoe1xuICBub3RlcyxcbiAgb25EaXNtaXNzLFxufToge1xuICBub3RlczogTm90ZVtdO1xuICBvbkRpc21pc3M6IChpZDogbnVtYmVyKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgcmlnaHQ6IDE2LFxuICAgICAgICB0b3A6IDEyOCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsXG4gICAgICAgIGdhcDogMTAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtub3Rlcy5tYXAoKG4pID0+IChcbiAgICAgICAgPE5vdGljZSBrZXk9e24uaWR9IG5vdGU9e259IG9uRGlzbWlzcz17KCkgPT4gb25EaXNtaXNzKG4uaWQpfSAvPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBOb3RpY2UoeyBub3RlLCBvbkRpc21pc3MgfTogeyBub3RlOiBOb3RlOyBvbkRpc21pc3M6ICgpID0+IHZvaWQgfSkge1xuICBjb25zdCBbaG92ZXIsIHNldEhvdmVyXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgZW50ZXIgPSB1c2VTbGlkZUluKDkwLCAwKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgLi4uZW50ZXIsXG4gICAgICAgIHRyYW5zaXRpb246IHsgbGF5b3V0OiB7IGR1cmF0aW9uOiAzMDAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7aG92ZXIgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5wYW5lbCxcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgcmlnaHQ6IDU2LFxuICAgICAgICAgICAgdG9wOiBcIjUwJVwiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiB7IHRyYW5zbGF0ZVk6IFwiLTUwJVwiIH0sXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMiwgdmVydGljYWw6IDcgfSxcbiAgICAgICAgICAgIGdhcDogMixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLCBjb2xvcjogbm90ZS5jb2xvciB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtub3RlLnRpdGxlfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnRleHQsIGxpbmVCcmVhazogXCJub1dyYXBcIiB9fT5cbiAgICAgICAgICAgIHtub3RlLmJvZHl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICApfVxuICAgICAgPGJ1dHRvblxuICAgICAgICBvbkNsaWNrPXtvbkRpc21pc3N9XG4gICAgICAgIG9uUG9pbnRlckVudGVyPXsoKSA9PiBzZXRIb3Zlcih0cnVlKX1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9eygpID0+IHNldEhvdmVyKGZhbHNlKX1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogNDYsXG4gICAgICAgICAgaGVpZ2h0OiA0NixcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDIzLFxuICAgICAgICAgIHBhZGRpbmc6IDIsXG4gICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiBnaWx0LFxuICAgICAgICAgIGJveFNoYWRvdzogeyBjb2xvcjogXCJyZ2JhKDAsIDAsIDAsIDAuNSlcIiwgYmx1clJhZGl1czogOCwgeU9mZnNldDogMiB9LFxuICAgICAgICB9fVxuICAgICAgICBob3ZlclN0eWxlPXt7IHRyYW5zZm9ybTogeyBzY2FsZTogMS4wOCB9IH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAyMSxcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRHcmFkaWVudDogcmFkaWFsKEMuc2xhdGVIaSwgQy5pbmspLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvbiBuYW1lPXtub3RlLmljb259IHNpemU9ezIyfSBjb2xvcj17bm90ZS5jb2xvcn0gLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGluY29tZSwgeWVhciwgdHlwZSBHYW1lIH0gZnJvbSBcIi4uL2dhbWVcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBPV05TX1BPSU5URVIsIGNhcHMsIHNpZ25lZCB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgQW1vdW50LCBSb3VuZEJ1dHRvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuZXhwb3J0IHR5cGUgU2NyZWVuSWQgPSBcInRlY2hcIiB8IFwicmVwb3J0c1wiIHwgXCJyYW5raW5nc1wiO1xuXG4vKiogVGhlIHN0cmlwIGFjcm9zcyB0aGUgdG9wOiB0aGUgZW1waXJlJ3MgeWllbGRzIHBlciB0dXJuIGFuZCB0cmVhc3VyaWVzLFxuICogIHRoZW4gdGhlIHR1cm4sIHRoZSB5ZWFyIGFuZCB0aGUgdGltZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb3BCYXIoe1xuICBnYW1lLFxuICBwbGF5ZXIsXG4gIG5ldCxcbn06IHtcbiAgZ2FtZTogR2FtZTtcbiAgcGxheWVyOiBzdHJpbmc7XG4gIG5ldDogbnVtYmVyO1xufSkge1xuICBjb25zdCBwYXkgPSBpbmNvbWUoZ2FtZSwgcGxheWVyKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMjIsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTYgfSxcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogXCIjMTUyMzNhXCIgfSwgeyBjb2xvcjogXCIjMDcwZDE2XCIgfV0sXG4gICAgICAgIH0sXG4gICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExvLFxuICAgICAgICBib3hTaGFkb3c6IHsgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjYpXCIsIGJsdXJSYWRpdXM6IDEwLCB5T2Zmc2V0OiAyIH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17T1dOU19QT0lOVEVSfVxuICAgID5cbiAgICAgIDxBbW91bnQgaWNvbj1cInNjaWVuY2VcIiBjb2xvcj17Qy5zY2llbmNlfSB2YWx1ZT17c2lnbmVkKHBheS5zY2llbmNlKX0gLz5cbiAgICAgIDxBbW91bnQgaWNvbj1cImN1bHR1cmVcIiBjb2xvcj17Qy5jdWx0dXJlfSB2YWx1ZT17c2lnbmVkKHBheS5jdWx0dXJlKX0gLz5cbiAgICAgIDxBbW91bnRcbiAgICAgICAgaWNvbj1cImdvbGRcIlxuICAgICAgICBjb2xvcj17Qy5jb2lufVxuICAgICAgICB2YWx1ZT17YCR7TWF0aC5mbG9vcihnYW1lLmdvbGQpfSAoJHtzaWduZWQobmV0KX0pYH1cbiAgICAgIC8+XG4gICAgICA8QW1vdW50XG4gICAgICAgIGljb249XCJmYWl0aFwiXG4gICAgICAgIGNvbG9yPXtDLmZhaXRofVxuICAgICAgICB2YWx1ZT17YCR7TWF0aC5mbG9vcihnYW1lLmZhaXRoKX0gKCR7c2lnbmVkKHBheS5mYWl0aCl9KWB9XG4gICAgICAvPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleEdyb3c6IDEgfX0gLz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgLi4uY2FwcyxcbiAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICBjb2xvcjogQy5nb2xkSGksXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtgVFVSTiAke2dhbWUudHVybn1gfVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDEzLCBjb2xvcjogQy50ZXh0IH19Pnt5ZWFyKGdhbWUudHVybil9PC90ZXh0PlxuICAgICAgPENsb2NrIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBDbG9jaygpIHtcbiAgY29uc3QgW25vdywgc2V0Tm93XSA9IHVzZVN0YXRlKCgpID0+IG5ldyBEYXRlKCkpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCkgPT4gc2V0Tm93KG5ldyBEYXRlKCkpLCAxNV8wMDApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGlkKTtcbiAgfSwgW10pO1xuICBjb25zdCBoaCA9IG5vdy5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICBjb25zdCBtbSA9IG5vdy5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gIHJldHVybiA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTMsIGNvbG9yOiBDLm11dGVkIH19PntgJHtoaH06JHttbX1gfTwvdGV4dD47XG59XG5cbi8qKiBUaGUgcm91bmQgYnV0dG9ucyB1bmRlciB0aGUgdG9wLWxlZnQgY29ybmVyOiB0aGUgZW1waXJlJ3Mgc2NyZWVucy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBMYXVuY2hCYXIoe1xuICBvbk9wZW4sXG4gIHJlc2VhcmNoLFxufToge1xuICBvbk9wZW46IChzOiBTY3JlZW5JZCkgPT4gdm9pZDtcbiAgcmVzZWFyY2g6IGJvb2xlYW47XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICBsZWZ0OiAxMixcbiAgICAgICAgdG9wOiA0MCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgZ2FwOiAxMCxcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCwgdmVydGljYWw6IDcgfSxcbiAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICAgICAgICBhbmdsZTogMTgwLFxuICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICB7IGNvbG9yOiBcInJnYmEoMjcsIDQ1LCA2OCwgMC45NSlcIiB9LFxuICAgICAgICAgICAgeyBjb2xvcjogXCJyZ2JhKDEzLCAyNCwgMzgsIDAuOTUpXCIgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMbyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiAyNyxcbiAgICAgICAgYm94U2hhZG93OiB7IGNvbG9yOiBcInJnYmEoMCwgMCwgMCwgMC41KVwiLCBibHVyUmFkaXVzOiAxMCwgeU9mZnNldDogMyB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e09XTlNfUE9JTlRFUn1cbiAgICA+XG4gICAgICA8Um91bmRCdXR0b25cbiAgICAgICAgaWNvbj1cInNjaWVuY2VcIlxuICAgICAgICBjb2xvcj17Qy5zY2llbmNlfVxuICAgICAgICB0aXA9XCJUZWNobm9sb2d5IHRyZWVcIlxuICAgICAgICBhY3RpdmU9eyFyZXNlYXJjaH1cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25PcGVuKFwidGVjaFwiKX1cbiAgICAgIC8+XG4gICAgICA8Um91bmRCdXR0b25cbiAgICAgICAgaWNvbj1cImNoYXJ0XCJcbiAgICAgICAgdGlwPVwiUmVwb3J0c1wiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbihcInJlcG9ydHNcIil9XG4gICAgICAvPlxuICAgICAgPFJvdW5kQnV0dG9uXG4gICAgICAgIGljb249XCJ0cm9waHlcIlxuICAgICAgICB0aXA9XCJXb3JsZCByYW5raW5nc1wiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbihcInJhbmtpbmdzXCIpfVxuICAgICAgLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgY2l2aWNDb3N0LCBpbmNvbWUsIHBsdXJhbCwgdHVybnNMZWZ0LCB0eXBlIEdhbWUgfSBmcm9tIFwiLi4vZ2FtZVwiO1xuaW1wb3J0IHsgQ0lWSUNTLCB0ZWNoIH0gZnJvbSBcIi4uL3RlY2hzXCI7XG5pbXBvcnQgeyBDLCBPV05TX1BPSU5URVIsIHBhbmVsIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uLCB0eXBlIEljb25OYW1lIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IEhlYWRlciwgTWVkYWxsaW9uIH0gZnJvbSBcIi4uL3VpL2tpdFwiO1xuXG5jb25zdCBXSURUSCA9IDMwMDtcblxuLyoqIFRoZSByZXNlYXJjaCBhbmQgY2l2aWMgaW4gcHJvZ3Jlc3MsIHVuZGVyIHRoZSBsYXVuY2ggYmFyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRyYWNrZXJzKHtcbiAgZ2FtZSxcbiAgcGxheWVyLFxuICBvblJlc2VhcmNoLFxufToge1xuICBnYW1lOiBHYW1lO1xuICBwbGF5ZXI6IHN0cmluZztcbiAgb25SZXNlYXJjaDogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgcGF5ID0gaW5jb21lKGdhbWUsIHBsYXllcik7XG4gIGNvbnN0IHJlc2VhcmNoID0gZ2FtZS5yZXNlYXJjaCA/IHRlY2goZ2FtZS5yZXNlYXJjaCkgOiBudWxsO1xuICBjb25zdCBiYW5rZWQgPSByZXNlYXJjaCA/IChnYW1lLnByb2dyZXNzW3Jlc2VhcmNoLmlkXSA/PyAwKSA6IDA7XG4gIGNvbnN0IGNpdmljTmFtZSA9IENJVklDU1tnYW1lLmNpdmljICUgQ0lWSUNTLmxlbmd0aF07XG4gIGNvbnN0IGNpdmljTmVlZCA9IGNpdmljQ29zdChnYW1lLmNpdmljKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDEyLFxuICAgICAgICB0b3A6IDEwMCxcbiAgICAgICAgd2lkdGg6IFdJRFRILFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBnYXA6IDgsXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtyZXNlYXJjaCA/IChcbiAgICAgICAgPFRyYWNrZXJcbiAgICAgICAgICB0aXRsZT1cIlJlc2VhcmNoXCJcbiAgICAgICAgICBjb2xvcj17Qy5zY2llbmNlfVxuICAgICAgICAgIGljb249e3Jlc2VhcmNoLmljb259XG4gICAgICAgICAgbmFtZT17cmVzZWFyY2gubmFtZX1cbiAgICAgICAgICBwcm9ncmVzcz17YmFua2VkIC8gcmVzZWFyY2guY29zdH1cbiAgICAgICAgICBkZXRhaWw9e3BsdXJhbCh0dXJuc0xlZnQocmVzZWFyY2guY29zdCwgYmFua2VkLCBwYXkuc2NpZW5jZSksIFwidHVyblwiKX1cbiAgICAgICAgICBoaW50PXtgQm9vc3Q6ICR7cmVzZWFyY2guYm9vc3R9YH1cbiAgICAgICAgICBvbkNsaWNrPXtvblJlc2VhcmNofVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPFRyYWNrZXJcbiAgICAgICAgICB0aXRsZT1cIlJlc2VhcmNoXCJcbiAgICAgICAgICBjb2xvcj17Qy5zY2llbmNlfVxuICAgICAgICAgIGljb249XCJzY2llbmNlXCJcbiAgICAgICAgICBuYW1lPVwiQ2hvb3NlIGEgcmVzZWFyY2hcIlxuICAgICAgICAgIHByb2dyZXNzPXswfVxuICAgICAgICAgIGRldGFpbD1cIllvdXIgc2Nob2xhcnMgYXJlIGlkbGVcIlxuICAgICAgICAgIG9uQ2xpY2s9e29uUmVzZWFyY2h9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPFRyYWNrZXJcbiAgICAgICAgdGl0bGU9XCJDaXZpY1wiXG4gICAgICAgIGNvbG9yPXtDLmN1bHR1cmV9XG4gICAgICAgIGljb249XCJjdWx0dXJlXCJcbiAgICAgICAgbmFtZT17Y2l2aWNOYW1lfVxuICAgICAgICBwcm9ncmVzcz17Z2FtZS5jaXZpY1Byb2dyZXNzIC8gY2l2aWNOZWVkfVxuICAgICAgICBkZXRhaWw9e3BsdXJhbChcbiAgICAgICAgICB0dXJuc0xlZnQoY2l2aWNOZWVkLCBnYW1lLmNpdmljUHJvZ3Jlc3MsIHBheS5jdWx0dXJlKSxcbiAgICAgICAgICBcInR1cm5cIixcbiAgICAgICAgKX1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBUcmFja2VyKHtcbiAgdGl0bGUsXG4gIGNvbG9yLFxuICBpY29uLFxuICBuYW1lLFxuICBwcm9ncmVzcyxcbiAgZGV0YWlsLFxuICBoaW50LFxuICBvbkNsaWNrLFxufToge1xuICB0aXRsZTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBpY29uOiBJY29uTmFtZTtcbiAgbmFtZTogc3RyaW5nO1xuICBwcm9ncmVzczogbnVtYmVyO1xuICBkZXRhaWw6IHN0cmluZztcbiAgaGludD86IHN0cmluZztcbiAgb25DbGljaz86ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5wYW5lbCxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCwgdG9wOiA3LCBib3R0b206IDkgfSxcbiAgICAgICAgZ2FwOiA2LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e29uQ2xpY2sgPyB7IGJvcmRlckNvbG9yOiBDLmdvbGQgfSA6IE9XTlNfUE9JTlRFUn1cbiAgICA+XG4gICAgICA8SGVhZGVyIGNvbG9yPXtjb2xvcn0+e3RpdGxlfTwvSGVhZGVyPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCB9fT5cbiAgICAgICAgPE1lZGFsbGlvbiBzaXplPXs1Mn0gcHJvZ3Jlc3M9e3Byb2dyZXNzfSByaW5nPXtjb2xvcn0+XG4gICAgICAgICAgPEljb24gbmFtZT17aWNvbn0gc2l6ZT17MjJ9IGNvbG9yPXtjb2xvcn0gLz5cbiAgICAgICAgPC9NZWRhbGxpb24+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIiwgY29sb3I6IEMudGV4dCB9fT5cbiAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yIH19PntkZXRhaWx9PC90ZXh0PlxuICAgICAgICAgIHtoaW50ICYmIChcbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IHdpZHRoOiBXSURUSCAtIDkwLCBmb250U2l6ZTogMTEsIGNvbG9yOiBDLm11dGVkIH19PlxuICAgICAgICAgICAgICB7aGludH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApfVxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgQ2l2SW5mbywgV29ybGRJbmZvIH0gZnJvbSBcIi4uL2JldnlcIjtcbmltcG9ydCB7IHJuZywgdG90YWxzLCB0eXBlIEdhbWUgfSBmcm9tIFwiLi4vZ2FtZVwiO1xuaW1wb3J0IHsgVEVDSFMgfSBmcm9tIFwiLi4vdGVjaHNcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBjYXBzIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uLCB0eXBlIEljb25OYW1lIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IEJhciwgQ3Jlc3QsIE1lZGFsbGlvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuZXhwb3J0IGNvbnN0IFJBTktJTkdfVEFCUyA9IFtcbiAgXCJPdmVyYWxsXCIsXG4gIFwiU2NpZW5jZVwiLFxuICBcIkN1bHR1cmVcIixcbiAgXCJEb21pbmF0aW9uXCIsXG4gIFwiUmVsaWdpb25cIixcbiAgXCJEaXBsb21hdGljXCIsXG5dO1xuXG50eXBlIFN0YW5kaW5nID0geyBjaXY6IENpdkluZm87IHByb2dyZXNzOiBudW1iZXI7IG5vdGU6IHN0cmluZyB9O1xuXG5jb25zdCBWSUNUT1JJRVM6IHtcbiAgdGFiOiBzdHJpbmc7XG4gIGljb246IEljb25OYW1lO1xuICBjb2xvcjogc3RyaW5nO1xuICBnb2FsOiBzdHJpbmc7XG59W10gPSBbXG4gIHtcbiAgICB0YWI6IFwiU2NpZW5jZVwiLFxuICAgIGljb246IFwic2NpZW5jZVwiLFxuICAgIGNvbG9yOiBDLnNjaWVuY2UsXG4gICAgZ29hbDogXCJMZWFkIHRoZSB3b3JsZCBpbiBsZWFybmluZyBhbmQgbGF1bmNoIHRoZSBmaXJzdCBjb2xvbnkgc2hpcC5cIixcbiAgfSxcbiAge1xuICAgIHRhYjogXCJDdWx0dXJlXCIsXG4gICAgaWNvbjogXCJjdWx0dXJlXCIsXG4gICAgY29sb3I6IEMuY3VsdHVyZSxcbiAgICBnb2FsOiBcIkRyYXcgbW9yZSB2aXNpdGluZyB0b3VyaXN0cyB0aGFuIGFueSByaXZhbCBoYXMgYXQgaG9tZS5cIixcbiAgfSxcbiAge1xuICAgIHRhYjogXCJEb21pbmF0aW9uXCIsXG4gICAgaWNvbjogXCJzdHJlbmd0aFwiLFxuICAgIGNvbG9yOiBDLmJhZCxcbiAgICBnb2FsOiBcIkhvbGQgdGhlIG9yaWdpbmFsIGNhcGl0YWwgb2YgZXZlcnkgb3RoZXIgY2l2aWxpemF0aW9uLlwiLFxuICB9LFxuICB7XG4gICAgdGFiOiBcIlJlbGlnaW9uXCIsXG4gICAgaWNvbjogXCJmYWl0aFwiLFxuICAgIGNvbG9yOiBDLmZhaXRoLFxuICAgIGdvYWw6IFwiU2VlIHlvdXIgcmVsaWdpb24gZm9sbG93ZWQgYnkgbW9zdCBjaXRpZXMgb2YgZXZlcnkgY2l2aWxpemF0aW9uLlwiLFxuICB9LFxuICB7XG4gICAgdGFiOiBcIkRpcGxvbWF0aWNcIixcbiAgICBpY29uOiBcInRyb3BoeVwiLFxuICAgIGNvbG9yOiBDLmNvaW4sXG4gICAgZ29hbDogXCJFYXJuIDIwIGRpcGxvbWF0aWMgdmljdG9yeSBwb2ludHMgaW4gdGhlIHdvcmxkIGNvbmdyZXNzLlwiLFxuICB9LFxuXTtcblxuLyoqIEhvdyBjbG9zZSBldmVyeSBjaXZpbGl6YXRpb24gaXMgdG8gZWFjaCB3YXkgb2Ygd2lubmluZyDigJQgbnVtYmVyc1xuICogIGRlcml2ZWQgZnJvbSBpdHMgY2l0aWVzIGFuZCBpdHMgaGlzdG9yeS4gKi9cbmZ1bmN0aW9uIHN0YW5kaW5ncyh0YWI6IHN0cmluZywgd29ybGQ6IFdvcmxkSW5mbywgZ2FtZTogR2FtZSk6IFN0YW5kaW5nW10ge1xuICBjb25zdCBzY2kgPSAoYzogQ2l2SW5mbykgPT4gZ2FtZS5oaXN0b3J5W2MuaWRdLnNjaWVuY2UuYXQoLTEpITtcbiAgY29uc3QgbWluZSA9IHdvcmxkLmNpdnNbMF07XG4gIHJldHVybiB3b3JsZC5jaXZzLm1hcCgoY2l2LCBpKSA9PiB7XG4gICAgY29uc3QgciA9IHJuZyhpICogOTcgKyAxMyk7XG4gICAgY29uc3Qgc3VtID0gdG90YWxzKHdvcmxkLmNpdGllcywgY2l2LmlkKTtcbiAgICBzd2l0Y2ggKHRhYikge1xuICAgICAgY2FzZSBcIlNjaWVuY2VcIjoge1xuICAgICAgICBjb25zdCBrbm93biA9IGNpdi5wbGF5ZXJcbiAgICAgICAgICA/IGdhbWUucmVzZWFyY2hlZC5sZW5ndGhcbiAgICAgICAgICA6IE1hdGgubWluKFxuICAgICAgICAgICAgICBURUNIUy5sZW5ndGggLSAxLFxuICAgICAgICAgICAgICBNYXRoLnJvdW5kKFxuICAgICAgICAgICAgICAgIGdhbWUucmVzZWFyY2hlZC5sZW5ndGggKiAoc2NpKGNpdikgLyBzY2kobWluZSkpICoqIDAuNSxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2l2LFxuICAgICAgICAgIHByb2dyZXNzOiBrbm93biAvIFRFQ0hTLmxlbmd0aCxcbiAgICAgICAgICBub3RlOiBgJHtrbm93bn0gb2YgJHtURUNIUy5sZW5ndGh9IHRlY2hub2xvZ2llc2AsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBjYXNlIFwiQ3VsdHVyZVwiOiB7XG4gICAgICAgIGNvbnN0IHZpc2l0aW5nID0gTWF0aC5yb3VuZChzdW0uY3VsdHVyZSAqIDEuNCArIHIoKSAqIDYpO1xuICAgICAgICBjb25zdCBuZWVkID0gTWF0aC5yb3VuZCgzMCArIHIoKSAqIDI1KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaXYsXG4gICAgICAgICAgcHJvZ3Jlc3M6IHZpc2l0aW5nIC8gbmVlZCxcbiAgICAgICAgICBub3RlOiBgJHt2aXNpdGluZ30gb2YgJHtuZWVkfSB0b3VyaXN0cyBuZWVkZWRgLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY2FzZSBcIkRvbWluYXRpb25cIjpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaXYsXG4gICAgICAgICAgcHJvZ3Jlc3M6IDEgLyB3b3JsZC5jaXZzLmxlbmd0aCxcbiAgICAgICAgICBub3RlOiBcIkhvbGRzIGl0cyBvd24gY2FwaXRhbFwiLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBcIlJlbGlnaW9uXCI6IHtcbiAgICAgICAgY29uc3QgY2l0aWVzID0gMSArIE1hdGguZmxvb3Ioc3VtLmZhaXRoIC8gMyArIHIoKSAqIDMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNpdixcbiAgICAgICAgICBwcm9ncmVzczogY2l0aWVzIC8gd29ybGQuY2l0aWVzLmxlbmd0aCxcbiAgICAgICAgICBub3RlOiBgRm9sbG93ZWQgaW4gJHtjaXRpZXN9IG9mICR7d29ybGQuY2l0aWVzLmxlbmd0aH0gY2l0aWVzYCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgY29uc3QgcG9pbnRzID0gMiArIE1hdGguZmxvb3IocigpICogOSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2l2LFxuICAgICAgICAgIHByb2dyZXNzOiBwb2ludHMgLyAyMCxcbiAgICAgICAgICBub3RlOiBgJHtwb2ludHN9IG9mIDIwIHZpY3RvcnkgcG9pbnRzYCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmFua2luZ3Moe1xuICB0YWIsXG4gIHdvcmxkLFxuICBnYW1lLFxufToge1xuICB0YWI6IHN0cmluZztcbiAgd29ybGQ6IFdvcmxkSW5mbztcbiAgZ2FtZTogR2FtZTtcbn0pIHtcbiAgaWYgKHRhYiAhPT0gXCJPdmVyYWxsXCIpIHtcbiAgICBjb25zdCB2ID0gVklDVE9SSUVTLmZpbmQoKHYpID0+IHYudGFiID09PSB0YWIpITtcbiAgICBjb25zdCByb3dzID0gc3RhbmRpbmdzKHRhYiwgd29ybGQsIGdhbWUpLnNvcnQoXG4gICAgICAoYSwgYikgPT4gYi5wcm9ncmVzcyAtIGEucHJvZ3Jlc3MsXG4gICAgKTtcbiAgICByZXR1cm4gKFxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogNDAsIHZlcnRpY2FsOiAyMiB9LFxuICAgICAgICAgIGdhcDogMTQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTQgfX0+XG4gICAgICAgICAgPE1lZGFsbGlvbiBzaXplPXs1OH0gcmluZz17di5jb2xvcn0+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXt2Lmljb259IHNpemU9ezI2fSBjb2xvcj17di5jb2xvcn0gLz5cbiAgICAgICAgICA8L01lZGFsbGlvbj5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMgfX0+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGRIaSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2Ake3RhYi50b1VwcGVyQ2FzZSgpfSBWSUNUT1JZYH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgY29sb3I6IEMubXV0ZWQgfX0+e3YuZ29hbH08L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIHtyb3dzLm1hcCgocywgaSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e3MuY2l2LmlkfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgZ2FwOiAxNixcbiAgICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxNCwgdmVydGljYWw6IDEwIH0sXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzLmNpdi5wbGF5ZXJcbiAgICAgICAgICAgICAgICA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjA4KVwiXG4gICAgICAgICAgICAgICAgOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMjUpXCIsXG4gICAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IHMuY2l2LnBsYXllclxuICAgICAgICAgICAgICAgID8gQy5nb2xkTGluZVxuICAgICAgICAgICAgICAgIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IEZvbnRzLmRpc3BsYXksXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDE4LFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmdvbGQsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtgJHtpICsgMX1gfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPENyZXN0IGNpdj17cy5jaXZ9IHNpemU9ezQyfSAvPlxuICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgd2lkdGg6IDIwMCwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAyIH19PlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxNCwgZm9udFdlaWdodDogXCJzZW1pYm9sZFwiLCBjb2xvcjogQy50ZXh0IH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7cy5jaXYucGxheWVyID8gYCR7cy5jaXYubmFtZX0gKHlvdSlgIDogcy5jaXYubmFtZX1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkIH19PlxuICAgICAgICAgICAgICAgIHtzLmNpdi5sZWFkZXJ9XG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDxCYXJcbiAgICAgICAgICAgICAgdmFsdWU9e3MucHJvZ3Jlc3N9XG4gICAgICAgICAgICAgIHdpZHRoPXszODB9XG4gICAgICAgICAgICAgIGhlaWdodD17MTJ9XG4gICAgICAgICAgICAgIGNvbG9yPXtzLmNpdi5jb2xvcn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLnRleHQgfX0+e3Mubm90ZX08L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICApO1xuICB9XG5cbiAgY29uc3QgYWxsID0gVklDVE9SSUVTLm1hcCgodikgPT4gKHtcbiAgICB2LFxuICAgIHJvd3M6IHN0YW5kaW5ncyh2LnRhYiwgd29ybGQsIGdhbWUpLFxuICB9KSk7XG4gIGNvbnN0IGNpdnMgPSBbLi4ud29ybGQuY2l2c10uc29ydChcbiAgICAoYSwgYikgPT5cbiAgICAgIGdhbWUuaGlzdG9yeVtiLmlkXS5zY29yZS5hdCgtMSkhIC0gZ2FtZS5oaXN0b3J5W2EuaWRdLnNjb3JlLmF0KC0xKSEsXG4gICk7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogNDAsIHZlcnRpY2FsOiAyMiB9LFxuICAgICAgICBnYXA6IDEwLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE0IH0sIGdhcDogMTYgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uY2Fwcywgd2lkdGg6IDMwMCwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgICAgQ0lWSUxJWkFUSU9OXG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uY2Fwcywgd2lkdGg6IDkwLCBjb2xvcjogQy5tdXRlZCB9fT5TQ09SRTwvdGV4dD5cbiAgICAgICAge1ZJQ1RPUklFUy5tYXAoKHYpID0+IChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXt2LnRhYn1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiA5MixcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgZ2FwOiA1LFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXt2Lmljb259IHNpemU9ezEzfSBjb2xvcj17di5jb2xvcn0gLz5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmNhcHMsIGZvbnRTaXplOiAxMCwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgICAgICAgIHt2LnRhYi50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgICB7Y2l2cy5tYXAoKGNpdiwgaSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17Y2l2LmlkfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGdhcDogMTYsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE0LCB2ZXJ0aWNhbDogMTAgfSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY2l2LnBsYXllclxuICAgICAgICAgICAgICA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjA4KVwiXG4gICAgICAgICAgICAgIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDI1KVwiLFxuICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGNpdi5wbGF5ZXIgPyBDLmdvbGRMaW5lIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBnYXA6IDEyLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiAyMixcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxOCxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5nb2xkLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7YCR7aSArIDF9YH1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDxDcmVzdCBjaXY9e2Npdn0gc2l6ZT17NDZ9IC8+XG4gICAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIgfX0+XG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDE1LCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtjaXYucGxheWVyID8gYCR7Y2l2Lm5hbWV9ICh5b3UpYCA6IGNpdi5uYW1lfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IEMubXV0ZWQgfX0+e2Npdi5sZWFkZXJ9PC90ZXh0PlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IDkwLFxuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGb250cy5kaXNwbGF5LFxuICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgICAgZm9udFNpemU6IDIyLFxuICAgICAgICAgICAgICBjb2xvcjogQy5nb2xkSGksXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtgJHtNYXRoLnJvdW5kKGdhbWUuaGlzdG9yeVtjaXYuaWRdLnNjb3JlLmF0KC0xKSEpfWB9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIHthbGwubWFwKCh7IHYsIHJvd3MgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcyA9IHJvd3MuZmluZCgocikgPT4gci5jaXYuaWQgPT09IGNpdi5pZCkhO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBrZXk9e3YudGFifVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiA5MiwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA0IH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8QmFyIHZhbHVlPXtzLnByb2dyZXNzfSB3aWR0aD17ODB9IGhlaWdodD17Nn0gY29sb3I9e3YuY29sb3J9IC8+XG4gICAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMubXV0ZWQgfX1cbiAgICAgICAgICAgICAgICA+e2Ake01hdGgucm91bmQoTWF0aC5taW4oMSwgcy5wcm9ncmVzcykgKiAxMDApfSVgfTwvdGV4dD5cbiAgICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IENpdkluZm8sIFdvcmxkSW5mbyB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBNRVRSSUNTLCBsZWRnZXIsIHRvdGFscywgdHlwZSBHYW1lLCB0eXBlIE1ldHJpYyB9IGZyb20gXCIuLi9nYW1lXCI7XG5pbXBvcnQgeyBDLCBZSUVMRFMsIGNhcHMsIGZtdCwgc2lnbmVkLCB0eXBlIFlpZWxkS2V5IH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL3VpL0ljb25cIjtcbmltcG9ydCB7IEhlYWRlciB9IGZyb20gXCIuLi91aS9raXRcIjtcbmltcG9ydCB7IERvbnV0LCBMaW5lQ2hhcnQsIFN0YWNrZWRBcmVhLCBjb21wYWN0LCB0eXBlIFNlcmllcyB9IGZyb20gXCIuL2NoYXJ0c1wiO1xuXG5leHBvcnQgY29uc3QgUkVQT1JUX1RBQlMgPSBbXCJHcmFwaHNcIiwgXCJDaXRpZXNcIiwgXCJEZW1vZ3JhcGhpY3NcIl07XG5cbi8qKiBUaGUgZW1waXJlJ3MgcmVwb3J0czogaGlzdG9yeSBncmFwaHMgZm9yIGV2ZXJ5IGNpdmlsaXphdGlvbiwgdGhlXG4gKiAgcGxheWVyJ3MgY2l0aWVzIGJ5IHlpZWxkLCBhbmQgaG93IHRoZSB3b3JsZCBjb21wYXJlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXBvcnRzKHtcbiAgdGFiLFxuICB3b3JsZCxcbiAgZ2FtZSxcbiAgd2lkdGgsXG4gIGhlaWdodCxcbn06IHtcbiAgdGFiOiBzdHJpbmc7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufSkge1xuICBpZiAodGFiID09PSBcIkNpdGllc1wiKVxuICAgIHJldHVybiA8Q2l0aWVzIHdvcmxkPXt3b3JsZH0gZ2FtZT17Z2FtZX0gd2lkdGg9e3dpZHRofSAvPjtcbiAgaWYgKHRhYiA9PT0gXCJEZW1vZ3JhcGhpY3NcIikgcmV0dXJuIDxEZW1vZ3JhcGhpY3Mgd29ybGQ9e3dvcmxkfSBnYW1lPXtnYW1lfSAvPjtcbiAgcmV0dXJuIDxHcmFwaHMgd29ybGQ9e3dvcmxkfSBnYW1lPXtnYW1lfSB3aWR0aD17d2lkdGh9IGhlaWdodD17aGVpZ2h0fSAvPjtcbn1cblxuZnVuY3Rpb24gR3JhcGhzKHtcbiAgd29ybGQsXG4gIGdhbWUsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufSkge1xuICBjb25zdCBbbWV0cmljLCBzZXRNZXRyaWNdID0gdXNlU3RhdGU8TWV0cmljPihcInNjb3JlXCIpO1xuICBjb25zdCBbaGlkZGVuLCBzZXRIaWRkZW5dID0gdXNlU3RhdGU8U2V0PHN0cmluZz4+KG5ldyBTZXQoKSk7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF07XG4gIGNvbnN0IGRlZiA9IE1FVFJJQ1MuZmluZCgobSkgPT4gbS5rZXkgPT09IG1ldHJpYykhO1xuICBjb25zdCBzZXJpZXM6IFNlcmllc1tdID0gd29ybGQuY2l2c1xuICAgIC5maWx0ZXIoKGMpID0+ICFoaWRkZW4uaGFzKGMuaWQpKVxuICAgIC5tYXAoKGMpID0+ICh7XG4gICAgICBpZDogYy5pZCxcbiAgICAgIG5hbWU6IGMubmFtZSxcbiAgICAgIGNvbG9yOiBjLmNvbG9yLFxuICAgICAgdmFsdWVzOiBnYW1lLmhpc3RvcnlbYy5pZF1bbWV0cmljXSxcbiAgICAgIGJvbGQ6IGMucGxheWVyLFxuICAgIH0pKTtcbiAgY29uc3QgY2hhcnRXID0gd2lkdGggLSAyMjA7XG4gIGNvbnN0IG93biA9IGdhbWUuaGlzdG9yeVtwbGF5ZXIuaWRdO1xuICBjb25zdCB5aWVsZHM6IFNlcmllc1tdID0gU1RBQ0subWFwKCh7IGtleSwgY29sb3IgfSkgPT4gKHtcbiAgICBpZDoga2V5LFxuICAgIG5hbWU6IE1FVFJJQ1MuZmluZCgobSkgPT4gbS5rZXkgPT09IGtleSkhLm5hbWUsXG4gICAgY29sb3IsXG4gICAgdmFsdWVzOiBvd25ba2V5XSxcbiAgfSkpO1xuICBjb25zdCB0b2dnbGUgPSAoaWQ6IHN0cmluZykgPT5cbiAgICBzZXRIaWRkZW4oKGgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGgpO1xuICAgICAgaWYgKCFuZXh0LmRlbGV0ZShpZCkpIG5leHQuYWRkKGlkKTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGZsZXhHcm93OiAxIH19PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMTkwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiA0LFxuICAgICAgICAgIHBhZGRpbmc6IDE0LFxuICAgICAgICAgIGJvcmRlcjogeyByaWdodDogMSB9LFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMaW5lLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5jYXBzLCBjb2xvcjogQy5tdXRlZCwgbWFyZ2luOiB7IGJvdHRvbTogNiB9IH19PlxuICAgICAgICAgIE1FQVNVUkVcbiAgICAgICAgPC90ZXh0PlxuICAgICAgICB7TUVUUklDUy5tYXAoKG0pID0+IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBrZXk9e20ua2V5fVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TWV0cmljKG0ua2V5KX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAsIHZlcnRpY2FsOiA4IH0sXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOlxuICAgICAgICAgICAgICAgIG0ua2V5ID09PSBtZXRyaWNcbiAgICAgICAgICAgICAgICAgID8gXCJyZ2JhKDIxNywgMTgzLCAxMDgsIDAuMTQpXCJcbiAgICAgICAgICAgICAgICAgIDogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG4gICAgICAgICAgICAgIGJvcmRlcjogeyBsZWZ0OiAyIH0sXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBtLmtleSA9PT0gbWV0cmljID8gQy5nb2xkIDogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjEpXCIgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SWNvbiBuYW1lPXttLmljb259IHNpemU9ezE2fSBjb2xvcj17bS5jb2xvcn0gLz5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBtLmtleSA9PT0gbWV0cmljID8gQy5nb2xkSGkgOiBDLnRleHQsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHttLm5hbWV9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTYsIHZlcnRpY2FsOiAxMiB9LFxuICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJmbGV4RW5kXCIsIGdhcDogMTAgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDE3LCBmb250V2VpZ2h0OiBcInNlbWlib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgICAgICB7ZGVmLm5hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkLCBtYXJnaW46IHsgYm90dG9tOiAyIH0gfX1cbiAgICAgICAgICA+e2Ake2RlZi51bml0fSwgZXZlcnkgY2l2aWxpemF0aW9uLCBieSB0dXJuYH08L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiA2IH19PlxuICAgICAgICAgIHt3b3JsZC5jaXZzLm1hcCgoYykgPT4gKFxuICAgICAgICAgICAgPFRvZ2dsZVxuICAgICAgICAgICAgICBrZXk9e2MuaWR9XG4gICAgICAgICAgICAgIGNpdj17Y31cbiAgICAgICAgICAgICAgb249eyFoaWRkZW4uaGFzKGMuaWQpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0b2dnbGUoYy5pZCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxMaW5lQ2hhcnRcbiAgICAgICAgICBzZXJpZXM9e3Nlcmllc31cbiAgICAgICAgICB3aWR0aD17Y2hhcnRXfVxuICAgICAgICAgIGhlaWdodD17TWF0aC5tYXgoMjAwLCBoZWlnaHQgLSA0MzApfVxuICAgICAgICAgIGZpcnN0PXsxfVxuICAgICAgICAvPlxuICAgICAgICA8SGVhZGVyPntgJHtwbGF5ZXIubmFtZX0gwrcgeWllbGRzIHBlciB0dXJuYH08L0hlYWRlcj5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAxNCB9fT5cbiAgICAgICAgICB7Wy4uLnlpZWxkc10ucmV2ZXJzZSgpLm1hcCgocykgPT4gKFxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAga2V5PXtzLmlkfVxuICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDUgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMixcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogcy5jb2xvcixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBDLm11dGVkIH19PntzLm5hbWV9PC90ZXh0PlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxTdGFja2VkQXJlYSBzZXJpZXM9e3lpZWxkc30gd2lkdGg9e2NoYXJ0V30gaGVpZ2h0PXsxNzB9IGZpcnN0PXsxfSAvPlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgbGVnZW5kIGVudHJ5IHRoYXQgc2hvd3Mgb3IgaGlkZXMgaXRzIGNpdmlsaXphdGlvbidzIGxpbmUuICovXG5mdW5jdGlvbiBUb2dnbGUoe1xuICBjaXYsXG4gIG9uLFxuICBvbkNsaWNrLFxufToge1xuICBjaXY6IENpdkluZm87XG4gIG9uOiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDYsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAsIHZlcnRpY2FsOiA1IH0sXG4gICAgICAgIGJvcmRlclJhZGl1czogMTIsXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IG9uXG4gICAgICAgICAgPyBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xOClcIlxuICAgICAgICAgIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDYpXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogb24gPyBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSlcIiA6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e3sgYm9yZGVyQ29sb3I6IEMuZ29sZCB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICAgIGhlaWdodDogY2l2LnBsYXllciA/IDMgOiAyLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb24gPyBjaXYuY29sb3IgOiBDLmZhaW50LFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IG9uID8gQy50ZXh0IDogQy5mYWludCB9fT5cbiAgICAgICAge2Npdi5wbGF5ZXIgPyBgJHtjaXYubmFtZX0gKHlvdSlgIDogY2l2Lm5hbWV9XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBUaGUgc3RhY2tlZCB5aWVsZHMsIGJvdHRvbSB0byB0b3A6IHRoZSBnYW1lJ3Mgb3duIHlpZWxkIGNvbG9ycyBmYWlsIGFzXG4gKiAgbmVpZ2hib3JzIChzY2llbmNlIGFuZCBjdWx0dXJlIG1hdGNoIHVuZGVyIGRldXRlcmFub3BpYSksIHNvIHRoZSBjaGFydFxuICogIHVzZXMgc3RlcHMgY2hlY2tlZCBmb3IgYWRqYWNlbnQgc2VwYXJhdGlvbiwgaW4gdGhpcyBvcmRlci4gKi9cbmNvbnN0IFNUQUNLID0gW1xuICB7IGtleTogXCJjdWx0dXJlXCIsIGNvbG9yOiBcIiNhMDVjYzhcIiB9LFxuICB7IGtleTogXCJnb2xkXCIsIGNvbG9yOiBcIiNjMDhhMWNcIiB9LFxuICB7IGtleTogXCJzY2llbmNlXCIsIGNvbG9yOiBcIiMyZjhmYzhcIiB9LFxuICB7IGtleTogXCJmYWl0aFwiLCBjb2xvcjogXCIjZDNjZGYyXCIgfSxcbl0gYXMgY29uc3Q7XG5cbmNvbnN0IENPTFMgPSBbXG4gIHsga2V5OiBcImNpdHlcIiwgbGFiZWw6IFwiQ2l0eVwiLCB3aWR0aDogMTcwIH0sXG4gIHsga2V5OiBcInBvcHVsYXRpb25cIiwgbGFiZWw6IFwiUG9wLlwiLCB3aWR0aDogNjQgfSxcbiAgLi4uWUlFTERTLm1hcCgoeSkgPT4gKHtcbiAgICBrZXk6IHkua2V5LFxuICAgIGxhYmVsOiB5LmtleSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcIlByb2QuXCIgOiB5Lm5hbWUsXG4gICAgd2lkdGg6IDEwMCxcbiAgfSkpLFxuXTtcbmNvbnN0IFRBQkxFX1cgPSBDT0xTLnJlZHVjZSgobiwgYykgPT4gbiArIGMud2lkdGgsIDApO1xuXG5mdW5jdGlvbiBDaXRpZXMoe1xuICB3b3JsZCxcbiAgZ2FtZSxcbiAgd2lkdGgsXG59OiB7XG4gIHdvcmxkOiBXb3JsZEluZm87XG4gIGdhbWU6IEdhbWU7XG4gIHdpZHRoOiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF07XG4gIGNvbnN0IGNpdGllcyA9IHdvcmxkLmNpdGllcy5maWx0ZXIoKGMpID0+IGMuY2l2ID09PSBwbGF5ZXIuaWQpO1xuICBjb25zdCBzdW0gPSB0b3RhbHMod29ybGQuY2l0aWVzLCBwbGF5ZXIuaWQpO1xuICBjb25zdCBtb25leSA9IGxlZGdlcih3b3JsZCwgZ2FtZSk7XG4gIC8vIENhdGVnb3JpY2FsIHN0ZXBzIHZhbGlkYXRlZCBmb3IgbmVpZ2hib3JzIGFyb3VuZCB0aGUgcmluZyAodGhlIGxhc3RcbiAgLy8gc2xpY2UgdG91Y2hlcyB0aGUgZmlyc3QpLCBvbiB0aGlzIHBhbmVsJ3MgbmF2eS5cbiAgY29uc3Qgc2xvdHMgPSBbXCIjMzk4N2U1XCIsIFwiI2Q5NTkyNlwiLCBcIiMxOTllNzBcIiwgXCIjYzk4NTAwXCIsIFwiI2Q1NTE4MVwiXTtcbiAgY29uc3Qgc291cmNlcyA9IG1vbmV5LnNvdXJjZXMubWFwKChzLCBpKSA9PiAoe1xuICAgIC4uLnMsXG4gICAgY29sb3I6IHNsb3RzW2kgJSBzbG90cy5sZW5ndGhdLFxuICB9KSk7XG4gIGNvbnN0IGZvb2QgPSAoeTogeyBmb29kOiBudW1iZXIgfSwgcG9wOiBudW1iZXIpID0+IHkuZm9vZCAtIHBvcCAqIDI7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZmxleEdyb3c6IDEsIHBhZGRpbmc6IDE4LCBnYXA6IDIyIH19PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgd2lkdGg6IHdpZHRoIC0gMzgwLCBnYXA6IDYgfX0+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIHdpZHRoOiBUQUJMRV9XIH19PlxuICAgICAgICAgIDxSb3cgaGVhZGVyIGNlbGxzPXtDT0xTLm1hcCgoYykgPT4gYy5sYWJlbCl9IC8+XG4gICAgICAgICAge2NpdGllcy5tYXAoKGMpID0+IChcbiAgICAgICAgICAgIDxSb3dcbiAgICAgICAgICAgICAga2V5PXtjLmlkfVxuICAgICAgICAgICAgICBzdGFyPXtjLmNhcGl0YWx9XG4gICAgICAgICAgICAgIGNlbGxzPXtbXG4gICAgICAgICAgICAgICAgYy5uYW1lLFxuICAgICAgICAgICAgICAgIGAke2MucG9wdWxhdGlvbn1gLFxuICAgICAgICAgICAgICAgIC4uLllJRUxEUy5tYXAoKHkpID0+XG4gICAgICAgICAgICAgICAgICBmbXQoXG4gICAgICAgICAgICAgICAgICAgIHkua2V5ID09PSBcImZvb2RcIlxuICAgICAgICAgICAgICAgICAgICAgID8gZm9vZChjLnlpZWxkcywgYy5wb3B1bGF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgIDogYy55aWVsZHNbeS5rZXldLFxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8Um93XG4gICAgICAgICAgICB0b3RhbFxuICAgICAgICAgICAgY2VsbHM9e1tcbiAgICAgICAgICAgICAgXCJFbXBpcmVcIixcbiAgICAgICAgICAgICAgYCR7c3VtLnBvcHVsYXRpb259YCxcbiAgICAgICAgICAgICAgLi4uWUlFTERTLm1hcCgoeSkgPT5cbiAgICAgICAgICAgICAgICBmbXQoeS5rZXkgPT09IFwiZm9vZFwiID8gZm9vZChzdW0sIHN1bS5wb3B1bGF0aW9uKSA6IHN1bVt5LmtleV0pLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogVEFCTEVfVyxcbiAgICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgICBjb2xvcjogQy5mYWludCxcbiAgICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogOCB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBGb29kIGlzIGFmdGVyIHdoYXQgdGhlIGNpdGl6ZW5zIGVhdCwgdHdvIGVhY2guIEV2ZXJ5IHlpZWxkIGNvbWVzXG4gICAgICAgICAgICBmcm9tIHRoZSB0aWxlcyBhIGNpdHkgd29ya3Mgb24gdGhlIG1hcC5cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgbWFyZ2luOiB7IHRvcDogMTQgfSB9fT5cbiAgICAgICAgICA8SGVhZGVyPldoZXJlIGVhY2ggeWllbGQgY29tZXMgZnJvbTwvSGVhZGVyPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBmbGV4V3JhcDogXCJ3cmFwXCIsXG4gICAgICAgICAgICBjb2x1bW5HYXA6IDI2LFxuICAgICAgICAgICAgcm93R2FwOiAxNCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge1lJRUxEUy5tYXAoKHkpID0+IChcbiAgICAgICAgICAgIDxCcmVha2Rvd25cbiAgICAgICAgICAgICAga2V5PXt5LmtleX1cbiAgICAgICAgICAgICAgaWNvbj17eS5rZXl9XG4gICAgICAgICAgICAgIG5hbWU9e3kubmFtZX1cbiAgICAgICAgICAgICAgY29sb3I9e3kuY29sb3J9XG4gICAgICAgICAgICAgIHJvd3M9e2NpdGllcy5tYXAoKGMpID0+ICh7XG4gICAgICAgICAgICAgICAgbmFtZTogYy5uYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOlxuICAgICAgICAgICAgICAgICAgeS5rZXkgPT09IFwiZm9vZFwiXG4gICAgICAgICAgICAgICAgICAgID8gTWF0aC5tYXgoMCwgZm9vZChjLnlpZWxkcywgYy5wb3B1bGF0aW9uKSlcbiAgICAgICAgICAgICAgICAgICAgOiBjLnlpZWxkc1t5LmtleV0sXG4gICAgICAgICAgICAgIH0pKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICB3aWR0aDogMzIwLFxuICAgICAgICAgIGdhcDogMTIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPEhlYWRlcj5Hb2xkIHBlciB0dXJuPC9IZWFkZXI+XG4gICAgICAgIDxEb251dCBzbGljZXM9e3NvdXJjZXN9IHNpemU9ezE5MH0gbGFiZWw9XCJnb2xkIGluY29tZVwiIC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNCwgd2lkdGg6IDI3MCB9fT5cbiAgICAgICAgICB7c291cmNlcy5tYXAoKHMpID0+IChcbiAgICAgICAgICAgIDxMZWRnZXJcbiAgICAgICAgICAgICAga2V5PXtzLm5hbWV9XG4gICAgICAgICAgICAgIHN3YXRjaD17cy5jb2xvcn1cbiAgICAgICAgICAgICAgbmFtZT17cy5uYW1lfVxuICAgICAgICAgICAgICB2YWx1ZT17c2lnbmVkKHMudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyB2ZXJ0aWNhbDogNCB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHttb25leS51cGtlZXAubWFwKCh1KSA9PiAoXG4gICAgICAgICAgICA8TGVkZ2VyXG4gICAgICAgICAgICAgIGtleT17dS5uYW1lfVxuICAgICAgICAgICAgICBuYW1lPXtgJHt1Lm5hbWV9IHVwa2VlcGB9XG4gICAgICAgICAgICAgIHZhbHVlPXtzaWduZWQoLXUudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICAgIG1hcmdpbjogeyB2ZXJ0aWNhbDogNCB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxMZWRnZXIgbmFtZT1cIk5ldCBwZXIgdHVyblwiIHZhbHVlPXtzaWduZWQobW9uZXkubmV0KX0gc3Ryb25nIC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBPbmUgeWllbGQgYWNyb3NzIHRoZSBjaXRpZXM6IGEgc21hbGwgYmFyIGNoYXJ0IGluIHRoYXQgeWllbGQncyBjb2xvclxuICogIChvbmUgc2VyaWVzIHBlciBjaGFydCDigJQgc21hbGwgbXVsdGlwbGVzLCBub3Qgc2l4IGh1ZXMgc2lkZSBieSBzaWRlKS4gKi9cbmZ1bmN0aW9uIEJyZWFrZG93bih7XG4gIGljb24sXG4gIG5hbWUsXG4gIGNvbG9yLFxuICByb3dzLFxufToge1xuICBpY29uOiBZaWVsZEtleTtcbiAgbmFtZTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICByb3dzOiB7IG5hbWU6IHN0cmluZzsgdmFsdWU6IG51bWJlciB9W107XG59KSB7XG4gIGNvbnN0IG1heCA9IE1hdGgubWF4KDEsIC4uLnJvd3MubWFwKChyKSA9PiByLnZhbHVlKSk7XG4gIGNvbnN0IEJBUiA9IDE1MDtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMjY4LCBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDUgfX0+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDYgfX0+XG4gICAgICAgIDxJY29uIG5hbWU9e2ljb259IHNpemU9ezE0fSBjb2xvcj17Y29sb3J9IC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLmNhcHMsIGNvbG9yOiBDLm11dGVkIH19PntuYW1lLnRvVXBwZXJDYXNlKCl9PC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAge3Jvd3MubWFwKChyKSA9PiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAga2V5PXtyLm5hbWV9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgZ2FwOiA4LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHdpZHRoOiA3NCxcbiAgICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgICBjb2xvcjogQy5tdXRlZCxcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ci5uYW1lfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KDIsIChyLnZhbHVlIC8gbWF4KSAqIEJBUiksXG4gICAgICAgICAgICAgIGhlaWdodDogMTAsXG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1czogeyB0b3A6IDAsIHJpZ2h0OiAzLCBib3R0b206IDMsIGxlZnQ6IDAgfSxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyBmb250U2l6ZTogMTEsIGNvbG9yOiBDLnRleHQgfX0+e2ZtdChyLnZhbHVlKX08L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gUm93KHtcbiAgY2VsbHMsXG4gIGhlYWRlcixcbiAgdG90YWwsXG4gIHN0YXIsXG59OiB7XG4gIGNlbGxzOiBzdHJpbmdbXTtcbiAgaGVhZGVyPzogYm9vbGVhbjtcbiAgdG90YWw/OiBib29sZWFuO1xuICBzdGFyPzogYm9vbGVhbjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgaGVpZ2h0OiBoZWFkZXIgPyAzNCA6IDM2LFxuICAgICAgICBib3JkZXI6IHsgYm90dG9tOiAxIH0sXG4gICAgICAgIGJvcmRlckNvbG9yOiB0b3RhbCA/IEMuZ29sZExpbmUgOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNilcIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0b3RhbFxuICAgICAgICAgID8gXCJyZ2JhKDIxNywgMTgzLCAxMDgsIDAuMDgpXCJcbiAgICAgICAgICA6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e1xuICAgICAgICBoZWFkZXIgPyB1bmRlZmluZWQgOiB7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDk1LCAxOTEsIDI0NCwgMC4wOClcIiB9XG4gICAgICB9XG4gICAgPlxuICAgICAge2NlbGxzLm1hcCgoY2VsbCwgaSkgPT4ge1xuICAgICAgICBjb25zdCBjb2wgPSBDT0xTW2ldO1xuICAgICAgICBjb25zdCB5ID0gWUlFTERTLmZpbmQoKHkpID0+IHkua2V5ID09PSBjb2wua2V5KTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAga2V5PXtjb2wua2V5fVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IGNvbC53aWR0aCxcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IGkgPT09IDAgPyBcImZsZXhTdGFydFwiIDogXCJmbGV4RW5kXCIsXG4gICAgICAgICAgICAgIGdhcDogNSxcbiAgICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiA4IH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtoZWFkZXIgJiYgeSAmJiA8SWNvbiBuYW1lPXt5LmtleX0gc2l6ZT17MTR9IGNvbG9yPXt5LmNvbG9yfSAvPn1cbiAgICAgICAgICAgIHshaGVhZGVyICYmIGkgPT09IDAgJiYgc3RhciAmJiAoXG4gICAgICAgICAgICAgIDxJY29uIG5hbWU9XCJzdGFyXCIgc2l6ZT17MTJ9IGNvbG9yPXtDLmdvbGRIaX0gLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17XG4gICAgICAgICAgICAgICAgaGVhZGVyXG4gICAgICAgICAgICAgICAgICA/IHsgLi4uY2FwcywgZm9udFNpemU6IDEwLjUsIGNvbG9yOiBDLm11dGVkIH1cbiAgICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiB0b3RhbCB8fCBpID09PSAwID8gXCJzZW1pYm9sZFwiIDogXCJub3JtYWxcIixcbiAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogQy50ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtoZWFkZXIgPyBjZWxsLnRvVXBwZXJDYXNlKCkgOiBjZWxsfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuZnVuY3Rpb24gTGVkZ2VyKHtcbiAgc3dhdGNoLFxuICBuYW1lLFxuICB2YWx1ZSxcbiAgc3Ryb25nLFxufToge1xuICBzd2F0Y2g/OiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgc3Ryb25nPzogYm9vbGVhbjtcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAxMCxcbiAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgIGJvcmRlclJhZGl1czogMixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHN3YXRjaCA/PyBcInJnYmEoMCwgMCwgMCwgMClcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17eyBmbGV4R3JvdzogMSwgZm9udFNpemU6IDEyLCBjb2xvcjogc3Ryb25nID8gQy50ZXh0IDogQy5tdXRlZCB9fVxuICAgICAgPlxuICAgICAgICB7bmFtZX1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgIGZvbnRXZWlnaHQ6IHN0cm9uZyA/IFwiYm9sZFwiIDogXCJzZW1pYm9sZFwiLFxuICAgICAgICAgIGNvbG9yOiBDLnRleHQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHt2YWx1ZX1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbmNvbnN0IERFTU9HUkFQSElDUzoge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVuaXQ6IHN0cmluZztcbiAgb2Y6IChjaXY6IHN0cmluZywgdzogV29ybGRJbmZvLCBnOiBHYW1lKSA9PiBudW1iZXI7XG59W10gPSBbXG4gIHtcbiAgICBuYW1lOiBcIlBvcHVsYXRpb25cIixcbiAgICB1bml0OiBcImNpdGl6ZW5zXCIsXG4gICAgb2Y6IChjLCB3KSA9PiB0b3RhbHMody5jaXRpZXMsIGMpLnBvcHVsYXRpb24gKiAxMDAwLFxuICB9LFxuICB7XG4gICAgbmFtZTogXCJDcm9wIHlpZWxkXCIsXG4gICAgdW5pdDogXCJidXNoZWxzXCIsXG4gICAgb2Y6IChjLCB3KSA9PiB0b3RhbHMody5jaXRpZXMsIGMpLmZvb2QgKiAxMjAsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIk1hbnVmYWN0dXJlZCBnb29kc1wiLFxuICAgIHVuaXQ6IFwidG9uc1wiLFxuICAgIG9mOiAoYywgdykgPT4gdG90YWxzKHcuY2l0aWVzLCBjKS5wcm9kdWN0aW9uICogNDUsXG4gIH0sXG4gIHsgbmFtZTogXCJHTlBcIiwgdW5pdDogXCJnb2xkXCIsIG9mOiAoYywgdykgPT4gdG90YWxzKHcuY2l0aWVzLCBjKS5nb2xkICogMjYwIH0sXG4gIHtcbiAgICBuYW1lOiBcIkxpdGVyYWN5XCIsXG4gICAgdW5pdDogXCIlXCIsXG4gICAgb2Y6IChjLCBfLCBnKSA9PiBNYXRoLm1pbig5NiwgMTggKyBnLmhpc3RvcnlbY10uc2NpZW5jZS5hdCgtMSkhICogMS42KSxcbiAgfSxcbiAge1xuICAgIG5hbWU6IFwiU29sZGllcnNcIixcbiAgICB1bml0OiBcInRyb29wc1wiLFxuICAgIG9mOiAoYywgXywgZykgPT4gZy5oaXN0b3J5W2NdLm1pbGl0YXJ5LmF0KC0xKSEgKiA1MjAsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiBcIkxhbmRcIixcbiAgICB1bml0OiBcInNxLiBtaVwiLFxuICAgIG9mOiAoYywgdykgPT5cbiAgICAgIHcuY2l0aWVzLmZpbHRlcigoeCkgPT4geC5jaXYgPT09IGMpLnJlZHVjZSgobiwgeCkgPT4gbiArIHgudGlsZXMsIDApICpcbiAgICAgIDE5MDAsXG4gIH0sXG5dO1xuXG4vKiogSG93IHRoZSB3b3JsZCBjb21wYXJlcywgbWVhc3VyZSBieSBtZWFzdXJlOiB5b3VyIHZhbHVlIGFuZCByYW5rLCBhbmQgYVxuICogIHN0cmlwIHdpdGggZXZlcnkgY2l2aWxpemF0aW9uIHBsYWNlZCBhbG9uZyBpdC4gKi9cbmZ1bmN0aW9uIERlbW9ncmFwaGljcyh7IHdvcmxkLCBnYW1lIH06IHsgd29ybGQ6IFdvcmxkSW5mbzsgZ2FtZTogR2FtZSB9KSB7XG4gIGNvbnN0IHBsYXllciA9IHdvcmxkLmNpdnNbMF07XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgcGFkZGluZzogMTggfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgaGVpZ2h0OiAzMCxcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5nb2xkTGluZSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge1tcIk1lYXN1cmVcIiwgXCJZb3VcIiwgXCJSYW5rXCIsIFwiVGhlIHdvcmxkXCIsIFwiQmVzdFwiLCBcIkF2ZXJhZ2VcIl0ubWFwKFxuICAgICAgICAgIChoLCBpKSA9PiAoXG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBrZXk9e2h9XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgLi4uY2FwcyxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTAuNSxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5tdXRlZCxcbiAgICAgICAgICAgICAgICB3aWR0aDogWzE5MCwgMTEwLCA3MCwgMzYwLCAxNzAsIDExMF1baV0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtoLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgKSxcbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIHtERU1PR1JBUEhJQ1MubWFwKChkKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IHdvcmxkLmNpdnMubWFwKChjKSA9PiAoe1xuICAgICAgICAgIGNpdjogYyxcbiAgICAgICAgICB2OiBkLm9mKGMuaWQsIHdvcmxkLCBnYW1lKSxcbiAgICAgICAgfSkpO1xuICAgICAgICBjb25zdCBzb3J0ZWQgPSBbLi4udmFsdWVzXS5zb3J0KChhLCBiKSA9PiBiLnYgLSBhLnYpO1xuICAgICAgICBjb25zdCBtaW5lID0gdmFsdWVzWzBdLnY7XG4gICAgICAgIGNvbnN0IHJhbmsgPSBzb3J0ZWQuZmluZEluZGV4KCh4KSA9PiB4LmNpdi5pZCA9PT0gcGxheWVyLmlkKSArIDE7XG4gICAgICAgIGNvbnN0IG1heCA9IHNvcnRlZFswXS52O1xuICAgICAgICBjb25zdCBhdmcgPSB2YWx1ZXMucmVkdWNlKChuLCB4KSA9PiBuICsgeC52LCAwKSAvIHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17ZC5uYW1lfVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgaGVpZ2h0OiA1MixcbiAgICAgICAgICAgICAgYm9yZGVyOiB7IGJvdHRvbTogMSB9LFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDYpXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg5NSwgMTkxLCAyNDQsIDAuMDYpXCIgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxOTAsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwic2VtaWJvbGRcIixcbiAgICAgICAgICAgICAgICBjb2xvcjogQy50ZXh0LFxuICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2QubmFtZX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAxMTAsIGZvbnRTaXplOiAxMywgY29sb3I6IEMudGV4dCB9fVxuICAgICAgICAgICAgPntgJHtjb21wYWN0KG1pbmUpfSR7ZC51bml0ID09PSBcIiVcIiA/IFwiJVwiIDogXCJcIn1gfTwvdGV4dD5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiA3MCB9fT5cbiAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgd2lkdGg6IDI4LFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyOCxcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMTQsXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6XG4gICAgICAgICAgICAgICAgICAgIHJhbmsgPT09IDFcbiAgICAgICAgICAgICAgICAgICAgICA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjI1KVwiXG4gICAgICAgICAgICAgICAgICAgICAgOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNilcIixcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOlxuICAgICAgICAgICAgICAgICAgICByYW5rID09PSAxID8gQy5nb2xkIDogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTIpXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcmFuayA9PT0gMSA/IEMuZ29sZEhpIDogQy50ZXh0LFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+e2Ake3Jhbmt9YH08L3RleHQ+XG4gICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiAzNjAsIGhlaWdodDogMjAgfX0+XG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgICAgICAgIHJpZ2h0OiAzMCxcbiAgICAgICAgICAgICAgICAgIHRvcDogOSxcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogMSxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSlcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7dmFsdWVzLm1hcCgoeyBjaXYsIHYgfSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpemUgPSBjaXYucGxheWVyID8gMTYgOiAxMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgICAga2V5PXtjaXYuaWR9XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgbGVmdDogKHYgLyBtYXgpICogMzMwIC0gc2l6ZSAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgdG9wOiAxMCAtIHNpemUgLyAyLFxuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IHNpemUgLyAyLFxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogY2l2LnBsYXllciA/IEMuZ29sZEhpIDogXCIjMTAxZDJlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjaXYuY29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgekluZGV4OiBjaXYucGxheWVyID8gMSA6IDAsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogMTcwLFxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBnYXA6IDYsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA4LFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzb3J0ZWRbMF0uY2l2LmNvbG9yLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogQy50ZXh0LCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX1cbiAgICAgICAgICAgICAgPntgJHtzb3J0ZWRbMF0uY2l2Lm5hbWV9IMK3ICR7Y29tcGFjdChtYXgpfWB9PC90ZXh0PlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgd2lkdGg6IDExMCwgZm9udFNpemU6IDEyLCBjb2xvcjogQy5tdXRlZCB9fT5cbiAgICAgICAgICAgICAge2NvbXBhY3QoYXZnKX1cbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICk7XG4gICAgICB9KX1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IEMsIGZtdCwgbWl4IH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5cbi8qKiBDaGFydHMgZHJhd24gd2l0aCBgPHN2Zz5gIHNoYXBlczsgYXhpcyBsYWJlbHMsIGNyb3NzaGFpcnMgYW5kIHRvb2x0aXBzXG4gKiAgYXJlIG9yZGluYXJ5IG5vZGVzIG92ZXIgdGhlbSAoc28gaG92ZXJpbmcgbmV2ZXIgcmUtcmFzdGVyaXplcyB0aGVcbiAqICBkcmF3aW5nKS4gKi9cblxuZXhwb3J0IHR5cGUgU2VyaWVzID0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIHZhbHVlczogbnVtYmVyW107XG4gIGJvbGQ/OiBib29sZWFuO1xufTtcblxuY29uc3QgUEFEID0geyBsZWZ0OiA0NiwgcmlnaHQ6IDE0LCB0b3A6IDEwLCBib3R0b206IDI0IH07XG5jb25zdCBHUklEID0gXCIjMjIzMjQ3XCI7XG4vKiogVGhlIHBhbmVsJ3Mgb3duIG5hdnk6IHRoZSAycHggZ2FwcyBiZXR3ZWVuIHRvdWNoaW5nIG1hcmtzLiAqL1xuY29uc3QgU1VSRkFDRSA9IFwiIzEwMWQyZVwiO1xuXG4vKiogUm91bmQgYXhpcyBzdGVwcyBjb3ZlcmluZyBgbWF4YDogMCwgdGhlbiB0aHJlZSBvciBmb3VyIG1vcmUuICovXG5mdW5jdGlvbiB0aWNrcyhtYXg6IG51bWJlcik6IG51bWJlcltdIHtcbiAgY29uc3QgcmF3ID0gTWF0aC5tYXgobWF4LCAxZS02KSAvIDQ7XG4gIGNvbnN0IG1hZyA9IE1hdGgucG93KDEwLCBNYXRoLmZsb29yKE1hdGgubG9nMTAocmF3KSkpO1xuICBjb25zdCBzdGVwID0gWzEsIDIsIDIuNSwgNSwgMTBdLm1hcCgobSkgPT4gbSAqIG1hZykuZmluZCgocykgPT4gcyA+PSByYXcpITtcbiAgY29uc3Qgb3V0ID0gW107XG4gIGZvciAobGV0IHYgPSAwOyB2IDwgbWF4ICsgc3RlcCAqIDAuOTk5OyB2ICs9IHN0ZXApIG91dC5wdXNoKHYpO1xuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgY29uc3QgY29tcGFjdCA9ICh2OiBudW1iZXIpID0+XG4gIHYgPj0gMTBfMDAwXG4gICAgPyBgJHtNYXRoLnJvdW5kKHYgLyAxMDAwKX1rYFxuICAgIDogdiA+PSAxMDAwXG4gICAgICA/IGAkeyh2IC8gMTAwMCkudG9GaXhlZCgxKX1rYFxuICAgICAgOiBmbXQodik7XG5cbmZ1bmN0aW9uIEF4ZXMoe1xuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICBncmlkLFxuICB0b3AsXG4gIGZpcnN0LFxuICBjb3VudCxcbn06IHtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIGdyaWQ6IG51bWJlcltdO1xuICB0b3A6IG51bWJlcjtcbiAgZmlyc3Q6IG51bWJlcjtcbiAgY291bnQ6IG51bWJlcjtcbn0pIHtcbiAgY29uc3QgcGxvdFcgPSB3aWR0aCAtIFBBRC5sZWZ0IC0gUEFELnJpZ2h0O1xuICBjb25zdCBwbG90SCA9IGhlaWdodCAtIFBBRC50b3AgLSBQQUQuYm90dG9tO1xuICBjb25zdCBldmVyeSA9IGNvdW50ID4gMTAwID8gMjUgOiBjb3VudCA+IDQwID8gMTAgOiA1O1xuICBjb25zdCB0dXJucyA9IFtdO1xuICBmb3IgKGxldCB0ID0gTWF0aC5jZWlsKGZpcnN0IC8gZXZlcnkpICogZXZlcnk7IHQgPCBmaXJzdCArIGNvdW50OyB0ICs9IGV2ZXJ5KVxuICAgIHR1cm5zLnB1c2godCk7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtncmlkLm1hcCgodikgPT4gKFxuICAgICAgICA8dGV4dFxuICAgICAgICAgIGtleT17dn1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgd2lkdGg6IFBBRC5sZWZ0IC0gOCxcbiAgICAgICAgICAgIHRvcDogUEFELnRvcCArIHBsb3RIIC0gKHYgLyB0b3ApICogcGxvdEggLSA3LFxuICAgICAgICAgICAgdGV4dEFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMTAsXG4gICAgICAgICAgICBjb2xvcjogQy5mYWludCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2NvbXBhY3Qodil9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICkpfVxuICAgICAge3R1cm5zLm1hcCgodCkgPT4gKFxuICAgICAgICA8dGV4dFxuICAgICAgICAgIGtleT17dH1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OlxuICAgICAgICAgICAgICBQQUQubGVmdCArICgodCAtIGZpcnN0KSAvIE1hdGgubWF4KDEsIGNvdW50IC0gMSkpICogcGxvdFcgLSAxMCxcbiAgICAgICAgICAgIHRvcDogaGVpZ2h0IC0gUEFELmJvdHRvbSArIDYsXG4gICAgICAgICAgICBmb250U2l6ZTogMTAsXG4gICAgICAgICAgICBjb2xvcjogQy5mYWludCxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2Ake3R9YH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgKSl9XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBIYWlybGluZSBncmlkbGluZXMgYXQgdGhlIGF4aXMgc3RlcHMsIGRyYXduIGZpcnN0IGluc2lkZSB0aGUgcGxvdCdzXG4gKiAgYDxzdmc+YCBzbyBmaWxscyBwYWludCBvdmVyIHRoZW0uICovXG5mdW5jdGlvbiBncmlkTGluZXMoZ3JpZDogbnVtYmVyW10sIHRvcDogbnVtYmVyLCBwbG90VzogbnVtYmVyLCBwbG90SDogbnVtYmVyKSB7XG4gIHJldHVybiBncmlkLm1hcCgodikgPT4ge1xuICAgIGNvbnN0IHkgPSBwbG90SCAtICh2IC8gdG9wKSAqIHBsb3RIO1xuICAgIHJldHVybiAoXG4gICAgICA8bGluZVxuICAgICAgICBrZXk9e3Z9XG4gICAgICAgIHgxPXswfVxuICAgICAgICB5MT17eX1cbiAgICAgICAgeDI9e3Bsb3RXfVxuICAgICAgICB5Mj17eX1cbiAgICAgICAgc3Ryb2tlPXtHUklEfVxuICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfSk7XG59XG5cbi8qKiBPbmUgbGluZSBwZXIgc2VyaWVzIG92ZXIgdGhlIHR1cm5zLCB3aXRoIGEgY3Jvc3NoYWlyIHRoYXQgc25hcHMgdG8gdGhlXG4gKiAgbmVhcmVzdCB0dXJuIGFuZCByZWFkcyBldmVyeSBzZXJpZXMgb3V0IGF0IG9uY2UuICovXG5leHBvcnQgZnVuY3Rpb24gTGluZUNoYXJ0KHtcbiAgc2VyaWVzLFxuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICBmaXJzdCxcbn06IHtcbiAgc2VyaWVzOiBTZXJpZXNbXTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIGZpcnN0OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHBsb3RXID0gd2lkdGggLSBQQUQubGVmdCAtIFBBRC5yaWdodDtcbiAgY29uc3QgcGxvdEggPSBoZWlnaHQgLSBQQUQudG9wIC0gUEFELmJvdHRvbTtcbiAgY29uc3QgbiA9IE1hdGgubWF4KDIsIC4uLnNlcmllcy5tYXAoKHMpID0+IHMudmFsdWVzLmxlbmd0aCkpO1xuICBjb25zdCBncmlkID0gdGlja3MoTWF0aC5tYXgoMCwgLi4uc2VyaWVzLmZsYXRNYXAoKHMpID0+IHMudmFsdWVzKSkpO1xuICBjb25zdCB0b3AgPSBncmlkW2dyaWQubGVuZ3RoIC0gMV07XG4gIGNvbnN0IHggPSAoaTogbnVtYmVyKSA9PiAoaSAvIChuIC0gMSkpICogcGxvdFc7XG4gIGNvbnN0IHkgPSAodjogbnVtYmVyKSA9PiBwbG90SCAtICh2IC8gdG9wKSAqIHBsb3RIO1xuICBjb25zdCBsZWFkID0gc2VyaWVzLmZpbmQoKHMpID0+IHMuYm9sZCk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGgsIGhlaWdodCB9fSBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIobnVsbCl9PlxuICAgICAgPEF4ZXNcbiAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgZ3JpZD17Z3JpZH1cbiAgICAgICAgdG9wPXt0b3B9XG4gICAgICAgIGZpcnN0PXtmaXJzdH1cbiAgICAgICAgY291bnQ9e259XG4gICAgICAvPlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PXtgMCAwICR7cGxvdFd9ICR7cGxvdEh9YH1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiBQQUQubGVmdCxcbiAgICAgICAgICB0b3A6IFBBRC50b3AsXG4gICAgICAgICAgd2lkdGg6IHBsb3RXLFxuICAgICAgICAgIGhlaWdodDogcGxvdEgsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtsZWFkICYmIChcbiAgICAgICAgICAvLyBUaGUgbGVhZGVyJ3Mgd2FzaCwgcHJlLW1peGVkIG9wYXF1ZTogYmV2eSBjb21wb3NpdGVzIHRoZVxuICAgICAgICAgIC8vIGRyYXdpbmcgaW4gbGluZWFyIGxpZ2h0LCB3aGVyZSBhIHRyYW5zbHVjZW50IGZpbGwgbGFuZHMgZmFyXG4gICAgICAgICAgLy8gYnJpZ2h0ZXIgdGhhbiBvbiB0aGUgd2ViLlxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBwb2ludHM9e1tcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgcGxvdEgsXG4gICAgICAgICAgICAgIC4uLmxlYWQudmFsdWVzLmZsYXRNYXAoKHYsIGkpID0+IFt4KGkpLCB5KHYpXSksXG4gICAgICAgICAgICAgIHgobGVhZC52YWx1ZXMubGVuZ3RoIC0gMSksXG4gICAgICAgICAgICAgIHBsb3RILFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIGZpbGw9e21peChTVVJGQUNFLCBsZWFkLmNvbG9yLCAwLjEyKX1cbiAgICAgICAgICAvPlxuICAgICAgICApfVxuICAgICAgICB7Z3JpZExpbmVzKGdyaWQsIHRvcCwgcGxvdFcsIHBsb3RIKX1cbiAgICAgICAge3Nlcmllcy5tYXAoKHMpID0+IChcbiAgICAgICAgICA8cG9seWxpbmVcbiAgICAgICAgICAgIGtleT17cy5pZH1cbiAgICAgICAgICAgIHBvaW50cz17cy52YWx1ZXMuZmxhdE1hcCgodiwgaSkgPT4gW3goaSksIHkodildKX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17cy5jb2xvcn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXtzLmJvbGQgPyAzIDogMn1cbiAgICAgICAgICAgIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvc3ZnPlxuICAgICAge2hvdmVyICE9PSBudWxsICYmIChcbiAgICAgICAgPFJlYWRvdXRcbiAgICAgICAgICByb3dzPXtzZXJpZXMubWFwKChzKSA9PiAoe1xuICAgICAgICAgICAgcyxcbiAgICAgICAgICAgIHZhbHVlOiBzLnZhbHVlc1tob3Zlcl0sXG4gICAgICAgICAgICB5OiB5KHMudmFsdWVzW2hvdmVyXSksXG4gICAgICAgICAgfSkpfVxuICAgICAgICAgIHR1cm49e2ZpcnN0ICsgaG92ZXJ9XG4gICAgICAgICAgbGVmdD17UEFELmxlZnQgKyB4KGhvdmVyKX1cbiAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgcGxvdEg9e3Bsb3RIfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIDxTdHJpcCBuPXtufSB3aWR0aD17cGxvdFd9IGhlaWdodD17cGxvdEh9IG9uSG92ZXI9e3NldEhvdmVyfSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEludmlzaWJsZSBjb2x1bW5zIG92ZXIgdGhlIHBsb3QsIG9uZSBwZXIgdHVybjogZW50ZXJpbmcgb25lIG1vdmVzIHRoZVxuICogIGNyb3NzaGFpciB0aGVyZS4gKi9cbmZ1bmN0aW9uIFN0cmlwKHtcbiAgbixcbiAgd2lkdGgsXG4gIGhlaWdodCxcbiAgb25Ib3Zlcixcbn06IHtcbiAgbjogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb25Ib3ZlcjogKGk6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3Qgc3RlcCA9IHdpZHRoIC8gKG4gLSAxKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IFBBRC5sZWZ0IC0gc3RlcCAvIDIsXG4gICAgICAgIHRvcDogUEFELnRvcCxcbiAgICAgICAgd2lkdGg6IHdpZHRoICsgc3RlcCxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgfX1cbiAgICA+XG4gICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogbiB9LCAoXywgaSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBzdHlsZT17eyBmbGV4R3JvdzogMSwgZmxleEJhc2lzOiAwIH19XG4gICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IG9uSG92ZXIoaSl9XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbnR5cGUgUm93ID0geyBzOiBTZXJpZXM7IHZhbHVlOiBudW1iZXI7IHk/OiBudW1iZXIgfTtcblxuLyoqIFRoZSBjcm9zc2hhaXIgYXQgb25lIHR1cm46IGEgZG90IHdoZXJlIGl0IGNyb3NzZXMgZWFjaCBsaW5lLCBhbmQgZXZlcnlcbiAqICBzZXJpZXMnIHZhbHVlIHRoZXJlLCBsYXJnZXN0IGZpcnN0LiAqL1xuZnVuY3Rpb24gUmVhZG91dCh7XG4gIHJvd3MsXG4gIHR1cm4sXG4gIGxlZnQsXG4gIHdpZHRoLFxuICBwbG90SCxcbn06IHtcbiAgcm93czogUm93W107XG4gIHR1cm46IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBwbG90SDogbnVtYmVyO1xufSkge1xuICBjb25zdCBzb3J0ZWQgPSByb3dzXG4gICAgLmZpbHRlcigocikgPT4gci52YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgIC5zb3J0KChhLCBiKSA9PiBiLnZhbHVlIC0gYS52YWx1ZSk7XG4gIGNvbnN0IGZsaXAgPSBsZWZ0ID4gd2lkdGggKiAwLjY4O1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQsXG4gICAgICAgICAgdG9wOiBQQUQudG9wLFxuICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgIGhlaWdodDogcGxvdEgsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjQ2LCAyMjgsIDE2OCwgMC41NSlcIixcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICB7c29ydGVkXG4gICAgICAgIC5maWx0ZXIoKHIpID0+IHIueSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAubWFwKCh7IHMsIHkgfSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e3MuaWR9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbGVmdDogbGVmdCAtIDUsXG4gICAgICAgICAgICAgIHRvcDogUEFELnRvcCArIHkhIC0gNSxcbiAgICAgICAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDUsXG4gICAgICAgICAgICAgIGJvcmRlcjogMixcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFNVUkZBQ0UsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogcy5jb2xvcixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIC4uLihmbGlwID8geyByaWdodDogd2lkdGggLSBsZWZ0ICsgMTIgfSA6IHsgbGVmdDogbGVmdCArIDEyIH0pLFxuICAgICAgICAgIHRvcDogUEFELnRvcCArIDQsXG4gICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCwgdmVydGljYWw6IDggfSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGdhcDogNCxcbiAgICAgICAgICBib3JkZXJSYWRpdXM6IDMsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMbyxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg2LCAxMywgMjEsIDAuOTQpXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMubXV0ZWQgfX0+e2BUdXJuICR7dHVybn1gfTwvdGV4dD5cbiAgICAgICAge3NvcnRlZC5tYXAoKHsgcywgdmFsdWUgfSkgPT4gKFxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBrZXk9e3MuaWR9XG4gICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDYgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogMTAsIGhlaWdodDogMiwgYmFja2dyb3VuZENvbG9yOiBzLmNvbG9yIH19IC8+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiA0NCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgY29sb3I6IEMudGV4dCxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2NvbXBhY3QodmFsdWUpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogQy5tdXRlZCwgbGluZUJyZWFrOiBcIm5vV3JhcFwiIH19PlxuICAgICAgICAgICAgICB7cy5uYW1lfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKSl9XG4gICAgICA8L25vZGU+XG4gICAgPC8+XG4gICk7XG59XG5cbi8qKiBTZXJpZXMgc3RhY2tlZCBvbiBlYWNoIG90aGVyOiB0aGUgd2hvbGUgaXMgdGhlIHRvcCBsaW5lLCBlYWNoIGJhbmQgb25lXG4gKiAgcGFydCwgc3BsaXQgYnkgMnB4IGdhcHMgb2YgdGhlIHBhbmVsJ3MgY29sb3IgYW5kIG5hbWVkIGF0IGl0cyBlbmQuICovXG5leHBvcnQgZnVuY3Rpb24gU3RhY2tlZEFyZWEoe1xuICBzZXJpZXMsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG4gIGZpcnN0LFxufToge1xuICBzZXJpZXM6IFNlcmllc1tdO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgZmlyc3Q6IG51bWJlcjtcbn0pIHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKTtcbiAgY29uc3QgTEFCRUxTID0gNzA7XG4gIGNvbnN0IHBsb3RXID0gd2lkdGggLSBQQUQubGVmdCAtIFBBRC5yaWdodCAtIExBQkVMUztcbiAgY29uc3QgcGxvdEggPSBoZWlnaHQgLSBQQUQudG9wIC0gUEFELmJvdHRvbTtcbiAgY29uc3QgbiA9IE1hdGgubWF4KDIsIC4uLnNlcmllcy5tYXAoKHMpID0+IHMudmFsdWVzLmxlbmd0aCkpO1xuICBjb25zdCBzdGFja2VkOiBudW1iZXJbXVtdID0gW107XG4gIHNlcmllcy5mb3JFYWNoKChzLCBrKSA9PlxuICAgIHN0YWNrZWQucHVzaChzLnZhbHVlcy5tYXAoKHYsIGkpID0+IHYgKyAoayA/IHN0YWNrZWRbayAtIDFdW2ldIDogMCkpKSxcbiAgKTtcbiAgY29uc3QgZ3JpZCA9IHRpY2tzKE1hdGgubWF4KC4uLnN0YWNrZWRbc3RhY2tlZC5sZW5ndGggLSAxXSkpO1xuICBjb25zdCB0b3AgPSBncmlkW2dyaWQubGVuZ3RoIC0gMV07XG4gIGNvbnN0IHggPSAoaTogbnVtYmVyKSA9PiAoaSAvIChuIC0gMSkpICogcGxvdFc7XG4gIGNvbnN0IHkgPSAodjogbnVtYmVyKSA9PiBwbG90SCAtICh2IC8gdG9wKSAqIHBsb3RIO1xuICBjb25zdCB0b3BzID0gc3RhY2tlZC5tYXAoKGxpbmUpID0+IGxpbmUuZmxhdE1hcCgodiwgaSkgPT4gW3goaSksIHkodildKSk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgd2lkdGgsIGhlaWdodCB9fSBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIobnVsbCl9PlxuICAgICAgPEF4ZXNcbiAgICAgICAgd2lkdGg9e3dpZHRoIC0gTEFCRUxTfVxuICAgICAgICBoZWlnaHQ9e2hlaWdodH1cbiAgICAgICAgZ3JpZD17Z3JpZH1cbiAgICAgICAgdG9wPXt0b3B9XG4gICAgICAgIGZpcnN0PXtmaXJzdH1cbiAgICAgICAgY291bnQ9e259XG4gICAgICAvPlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PXtgMCAwICR7cGxvdFd9ICR7cGxvdEh9YH1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICBsZWZ0OiBQQUQubGVmdCxcbiAgICAgICAgICB0b3A6IFBBRC50b3AsXG4gICAgICAgICAgd2lkdGg6IHBsb3RXLFxuICAgICAgICAgIGhlaWdodDogcGxvdEgsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtncmlkTGluZXMoZ3JpZCwgdG9wLCBwbG90VywgcGxvdEgpfVxuICAgICAgICB7c2VyaWVzLm1hcCgocywgaykgPT4ge1xuICAgICAgICAgIGNvbnN0IGJhc2UgPSBrID8gYmFja3dhcmRzKHRvcHNbayAtIDFdKSA6IFt4KG4gLSAxKSwgcGxvdEgsIDAsIHBsb3RIXTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHBvbHlnb24ga2V5PXtzLmlkfSBwb2ludHM9e1suLi50b3BzW2tdLCAuLi5iYXNlXX0gZmlsbD17cy5jb2xvcn0gLz5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgICAge3RvcHMuc2xpY2UoMCwgLTEpLm1hcCgobGluZSwgaykgPT4gKFxuICAgICAgICAgIDxwb2x5bGluZVxuICAgICAgICAgICAga2V5PXtrfVxuICAgICAgICAgICAgcG9pbnRzPXtsaW5lfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtTVVJGQUNFfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezJ9XG4gICAgICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvc3ZnPlxuICAgICAge3Nlcmllcy5tYXAoKHMsIGspID0+IHtcbiAgICAgICAgY29uc3QgbWlkID0gKHN0YWNrZWRba11bbiAtIDFdICsgKGsgPyBzdGFja2VkW2sgLSAxXVtuIC0gMV0gOiAwKSkgLyAyO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBrZXk9e3MuaWR9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbGVmdDogUEFELmxlZnQgKyBwbG90VyArIDgsXG4gICAgICAgICAgICAgIHRvcDogUEFELnRvcCArIHkobWlkKSAtIDcsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxMSxcbiAgICAgICAgICAgICAgY29sb3I6IEMubXV0ZWQsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtzLm5hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgICB7aG92ZXIgIT09IG51bGwgJiYgKFxuICAgICAgICA8UmVhZG91dFxuICAgICAgICAgIHJvd3M9e3Nlcmllcy5tYXAoKHMpID0+ICh7IHMsIHZhbHVlOiBzLnZhbHVlc1tob3Zlcl0gfSkpfVxuICAgICAgICAgIHR1cm49e2ZpcnN0ICsgaG92ZXJ9XG4gICAgICAgICAgbGVmdD17UEFELmxlZnQgKyB4KGhvdmVyKX1cbiAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgcGxvdEg9e3Bsb3RIfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIDxTdHJpcCBuPXtufSB3aWR0aD17cGxvdFd9IGhlaWdodD17cGxvdEh9IG9uSG92ZXI9e3NldEhvdmVyfSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgZmxhdCBgW3gwLCB5MCwgeDEsIHkxLCDigKZdYCBsaXN0LCBsYXN0IHBvaW50IGZpcnN0LiAqL1xuZnVuY3Rpb24gYmFja3dhcmRzKHBvaW50czogbnVtYmVyW10pIHtcbiAgY29uc3Qgb3V0OiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gcG9pbnRzLmxlbmd0aCAtIDI7IGkgPj0gMDsgaSAtPSAyKVxuICAgIG91dC5wdXNoKHBvaW50c1tpXSwgcG9pbnRzW2kgKyAxXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbnR5cGUgU2xpY2UgPSB7IG5hbWU6IHN0cmluZzsgdmFsdWU6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9O1xuXG4vKiogQSByaW5nIG9mIHBhcnRzIG9mIGEgd2hvbGUgKGtlZXAgaXQgdG8gc2l4IG9yIGZld2VyKTsgaG92ZXIgYSBwYXJ0IHRvXG4gKiAgcmVhZCBpdCBpbiB0aGUgbWlkZGxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERvbnV0KHtcbiAgc2xpY2VzLFxuICBzaXplLFxuICBsYWJlbCxcbn06IHtcbiAgc2xpY2VzOiBTbGljZVtdO1xuICBzaXplOiBudW1iZXI7XG4gIGxhYmVsOiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IHRvdGFsID0gc2xpY2VzLnJlZHVjZSgobiwgcykgPT4gbiArIHMudmFsdWUsIDApO1xuICBjb25zdCByMSA9IHNpemUgLyAyIC0gMjtcbiAgY29uc3QgcjAgPSByMSAqIDAuNjI7XG4gIGxldCBhID0gMDtcbiAgY29uc3QgYXJjcyA9IHNsaWNlcy5tYXAoKHMpID0+IHtcbiAgICBjb25zdCBmcm9tID0gYTtcbiAgICBhICs9IChzLnZhbHVlIC8gdG90YWwpICogTWF0aC5QSSAqIDI7XG4gICAgcmV0dXJuIHsgLi4ucywgZnJvbSwgdG86IGEgfTtcbiAgfSk7XG4gIGNvbnN0IHNob3duID0gaG92ZXIgPT09IG51bGwgPyBudWxsIDogc2xpY2VzW2hvdmVyXTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IHNpemUsXG4gICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD17YDAgMCAke3NpemV9ICR7c2l6ZX1gfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHdpZHRoOiBzaXplLFxuICAgICAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2FyY3MubWFwKChzLCBpKSA9PiAoXG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGtleT17cy5uYW1lfVxuICAgICAgICAgICAgZD17c2VjdG9yKFxuICAgICAgICAgICAgICBzaXplIC8gMixcbiAgICAgICAgICAgICAgc2l6ZSAvIDIsXG4gICAgICAgICAgICAgIGhvdmVyID09PSBpID8gcjAgLSAzIDogcjAsXG4gICAgICAgICAgICAgIGhvdmVyID09PSBpID8gcjEgKyAyIDogcjEsXG4gICAgICAgICAgICAgIHMuZnJvbSxcbiAgICAgICAgICAgICAgcy50byxcbiAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICBmaWxsPXtzLmNvbG9yfVxuICAgICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IHNldEhvdmVyKGkpfVxuICAgICAgICAgICAgb25Qb2ludGVyTGVhdmU9eygpID0+IHNldEhvdmVyKChoKSA9PiAoaCA9PT0gaSA/IG51bGwgOiBoKSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L3N2Zz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAyMiwgZm9udFdlaWdodDogXCJib2xkXCIsIGNvbG9yOiBDLnRleHQgfX0+XG4gICAgICAgIHtmbXQoc2hvd24gPyBzaG93bi52YWx1ZSA6IHRvdGFsKX1cbiAgICAgIDwvdGV4dD5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IEMubXV0ZWQgfX0+XG4gICAgICAgIHtzaG93biA/IHNob3duLm5hbWUgOiBsYWJlbH1cbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBbiBhbm51bGFyIHNlY3RvciBmcm9tIGFuZ2xlIGBhMGAgdG8gYGExYCAocmFkaWFucywgY2xvY2t3aXNlIGZyb21cbiAqICB0d2VsdmUgbydjbG9jayksIGxlc3MgYSBgZ2FwYCBvZiBweCBhdCBlYWNoIGVuZC4gKi9cbmZ1bmN0aW9uIHNlY3RvcihcbiAgY3g6IG51bWJlcixcbiAgY3k6IG51bWJlcixcbiAgcjA6IG51bWJlcixcbiAgcjE6IG51bWJlcixcbiAgYTA6IG51bWJlcixcbiAgYTE6IG51bWJlcixcbiAgZ2FwOiBudW1iZXIsXG4pIHtcbiAgY29uc3QgYXQgPSAocjogbnVtYmVyLCBhOiBudW1iZXIpID0+XG4gICAgYCR7Y3ggKyByICogTWF0aC5zaW4oYSl9ICR7Y3kgLSByICogTWF0aC5jb3MoYSl9YDtcbiAgY29uc3QgZzEgPSBnYXAgLyAyIC8gcjE7XG4gIGNvbnN0IGcwID0gZ2FwIC8gMiAvIHIwO1xuICBjb25zdCBsYXJnZSA9IGExIC0gYTAgPiBNYXRoLlBJID8gMSA6IDA7XG4gIHJldHVybiBbXG4gICAgYE0gJHthdChyMSwgYTAgKyBnMSl9YCxcbiAgICBgQSAke3IxfSAke3IxfSAwICR7bGFyZ2V9IDEgJHthdChyMSwgYTEgLSBnMSl9YCxcbiAgICBgTCAke2F0KHIwLCBhMSAtIGcwKX1gLFxuICAgIGBBICR7cjB9ICR7cjB9IDAgJHtsYXJnZX0gMCAke2F0KHIwLCBhMCArIGcwKX1gLFxuICAgIFwiWlwiLFxuICBdLmpvaW4oXCIgXCIpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VGYWRlSW4gfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IEMsIEZvbnRzLCBPV05TX1BPSU5URVIsIGNhcHMsIHBhbmVsIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBDbG9zZUJ1dHRvbiB9IGZyb20gXCIuLi91aS9raXRcIjtcblxuLyoqIEEgZnVsbCBzY3JlZW4gb3ZlciB0aGUgbWFwICh3aGljaCBibHVycyBiZWhpbmQgaXQsIGEgYmFja2Ryb3AgZmlsdGVyXG4gKiAgb3ZlciB0aGUgbGl2ZSAzRCBmcmFtZSk6IGEgZ2lsdCB0aXRsZSwgdGFicywgYW5kIHRoZSBjb250ZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbih7XG4gIHRpdGxlLFxuICB3aWR0aCxcbiAgaGVpZ2h0LFxuICB0YWJzLFxuICB0YWIsXG4gIG9uVGFiLFxuICBvbkNsb3NlLFxuICBjaGlsZHJlbixcbn06IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIHRhYnM/OiBzdHJpbmdbXTtcbiAgdGFiPzogc3RyaW5nO1xuICBvblRhYj86ICh0YWI6IHN0cmluZykgPT4gdm9pZDtcbiAgb25DbG9zZTogKCkgPT4gdm9pZDtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn0pIHtcbiAgY29uc3QgZW50ZXIgPSB1c2VGYWRlSW4oKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICB0b3A6IDMyLFxuICAgICAgICBib3R0b206IDAsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgzLCA4LCAxNCwgMC41NSlcIixcbiAgICAgICAgYmFja2Ryb3BGaWx0ZXI6IHsgbmFtZTogXCJibHVyXCIsIHBhcmFtczogeyByYWRpdXM6IDggfSB9LFxuICAgICAgfX1cbiAgICAgIGhvdmVyU3R5bGU9e09XTlNfUE9JTlRFUn1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIC4uLnBhbmVsLFxuICAgICAgICAgIC4uLmVudGVyLFxuICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGJvcmRlcjogMS41LFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGQsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGhlaWdodDogNTQsXG4gICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmdvbGRMaW5lLFxuICAgICAgICAgICAgYmFja2dyb3VuZEdyYWRpZW50OiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgICAgIGFuZ2xlOiAxODAsXG4gICAgICAgICAgICAgIHN0b3BzOiBbeyBjb2xvcjogXCIjMjQ0MDVlXCIgfSwgeyBjb2xvcjogXCIjMTMyNDM4XCIgfV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRm9udHMuZGlzcGxheSxcbiAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAyNCxcbiAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogNCxcbiAgICAgICAgICAgICAgY29sb3I6IEMuZ29sZEhpLFxuICAgICAgICAgICAgICB0ZXh0U2hhZG93OiB7XG4gICAgICAgICAgICAgICAgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjYpXCIsXG4gICAgICAgICAgICAgICAgb2Zmc2V0WDogMCxcbiAgICAgICAgICAgICAgICBvZmZzZXRZOiAyLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7dGl0bGUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIHJpZ2h0OiAxNCwgdG9wOiAxMiB9fT5cbiAgICAgICAgICAgIDxDbG9zZUJ1dHRvbiBvbkNsaWNrPXtvbkNsb3NlfSAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICB7dGFicyAmJiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBnYXA6IDQsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgdG9wOiA4IH0sXG4gICAgICAgICAgICAgIGJvcmRlcjogeyBib3R0b206IDEgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0YWJzLm1hcCgodCkgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXt0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVGFiPy4odCl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTgsIHZlcnRpY2FsOiA5IH0sXG4gICAgICAgICAgICAgICAgICBib3JkZXI6IHsgYm90dG9tOiAyIH0sXG4gICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogdCA9PT0gdGFiID8gQy5nb2xkIDogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG4gICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6XG4gICAgICAgICAgICAgICAgICAgIHQgPT09IHRhYiA/IFwicmdiYSgyMTcsIDE4MywgMTA4LCAwLjEpXCIgOiBcInJnYmEoMCwgMCwgMCwgMClcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjE3LCAxODMsIDEwOCwgMC4xNilcIiB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIC4uLmNhcHMsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMixcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHQgPT09IHRhYiA/IEMuZ29sZEhpIDogQy5tdXRlZCxcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApfVxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDEsXG4gICAgICAgICAgICBtaW5IZWlnaHQ6IDAsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGluY29tZSwgcGx1cmFsLCB0dXJuc0xlZnQsIHR5cGUgQWN0aW9uLCB0eXBlIEdhbWUgfSBmcm9tIFwiLi4vZ2FtZVwiO1xuaW1wb3J0IHsgRVJBUywgVEVDSFMsIHRlY2gsIHR5cGUgVGVjaCB9IGZyb20gXCIuLi90ZWNoc1wiO1xuaW1wb3J0IHsgQywgRm9udHMsIGNhcHMsIHRvbmUgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEljb24gfSBmcm9tIFwiLi4vdWkvSWNvblwiO1xuaW1wb3J0IHsgTWVkYWxsaW9uLCBUaXAgfSBmcm9tIFwiLi4vdWkva2l0XCI7XG5cbmNvbnN0IENPTCA9IDI2NjtcbmNvbnN0IE5PREVfVyA9IDIyNjtcbmNvbnN0IE5PREVfSCA9IDYwO1xuY29uc3QgUEFEID0gMjY7XG5jb25zdCBIRUFEID0gNDY7XG5jb25zdCBST1dTID0gNztcbmNvbnN0IENPTFVNTlMgPSBFUkFTLnJlZHVjZSgobiwgZSkgPT4gbiArIGUuY29sdW1ucywgMCk7XG5jb25zdCBXSURUSCA9IFBBRCAqIDIgKyBDT0xVTU5TICogQ09MIC0gKENPTCAtIE5PREVfVyk7XG5cbnR5cGUgU3RhdGUgPSBcImRvbmVcIiB8IFwiY3VycmVudFwiIHwgXCJvcGVuXCIgfCBcImxvY2tlZFwiO1xuXG4vKiogUm93cyBzaGFyZSB0aGUgc2NyZWVuJ3MgaGVpZ2h0ICh3aXRoaW4gcmVhc29uKS4gKi9cbmNvbnN0IHJvd0ZvciA9IChoZWlnaHQ6IG51bWJlcikgPT5cbiAgTWF0aC5tYXgoNzIsIE1hdGgubWluKDEwNCwgKGhlaWdodCAtIEhFQUQgLSA2MCkgLyBST1dTKSk7XG5cbmNvbnN0IGF0ID0gKHQ6IFRlY2gsIHJvdzogbnVtYmVyKSA9PiAoe1xuICB4OiBQQUQgKyB0LmNvbCAqIENPTCxcbiAgeTogSEVBRCArIDE0ICsgdC5yb3cgKiByb3csXG59KTtcblxuLyoqIFRoZSB0ZWNobm9sb2d5IHRyZWU6IGVyYXMgbGVmdCB0byByaWdodCwgZWFjaCB0ZWNoIGEgcGlsbCB3aXJlZCB0byB3aGF0XG4gKiAgaXQgbmVlZHMuIENsaWNrIG9uZSB5b3UgY2FuIHN0dWR5IHRvIHJlc2VhcmNoIGl0LiBTY3JvbGwgd2l0aCB0aGVcbiAqICB3aGVlbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUZWNoVHJlZSh7XG4gIGdhbWUsXG4gIHBsYXllcixcbiAgZGlzcGF0Y2gsXG4gIHdpZHRoLFxuICBoZWlnaHQsXG59OiB7XG4gIGdhbWU6IEdhbWU7XG4gIHBsYXllcjogc3RyaW5nO1xuICBkaXNwYXRjaDogKGE6IEFjdGlvbikgPT4gdm9pZDtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IGN1cnJlbnQgPSBnYW1lLnJlc2VhcmNoID8gdGVjaChnYW1lLnJlc2VhcmNoKSA6IG51bGw7XG4gIGNvbnN0IHJvdyA9IHJvd0ZvcihoZWlnaHQpO1xuICBjb25zdCBtYXggPSBNYXRoLm1heCgwLCBXSURUSCAtIHdpZHRoKTtcbiAgY29uc3QgW3Njcm9sbCwgc2V0U2Nyb2xsXSA9IHVzZVN0YXRlKCgpID0+XG4gICAgTWF0aC5taW4oXG4gICAgICBtYXgsXG4gICAgICBNYXRoLm1heCgwLCBhdChjdXJyZW50ID8/IHRlY2goXCJtYWNoaW5lcnlcIiksIHJvdykueCAtIHdpZHRoICogMC40NSksXG4gICAgKSxcbiAgKTtcbiAgY29uc3Qgc2NpZW5jZSA9IGluY29tZShnYW1lLCBwbGF5ZXIpLnNjaWVuY2U7XG4gIGNvbnN0IHN0YXRlID0gKHQ6IFRlY2gpOiBTdGF0ZSA9PlxuICAgIGdhbWUucmVzZWFyY2hlZC5pbmNsdWRlcyh0LmlkKVxuICAgICAgPyBcImRvbmVcIlxuICAgICAgOiB0LmlkID09PSBnYW1lLnJlc2VhcmNoXG4gICAgICAgID8gXCJjdXJyZW50XCJcbiAgICAgICAgOiB0LnJlcXVpcmVzLmV2ZXJ5KChyKSA9PiBnYW1lLnJlc2VhcmNoZWQuaW5jbHVkZXMocikpXG4gICAgICAgICAgPyBcIm9wZW5cIlxuICAgICAgICAgIDogXCJsb2NrZWRcIjtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgb25XaGVlbD17KGUpID0+XG4gICAgICAgIHNldFNjcm9sbCgocykgPT5cbiAgICAgICAgICBNYXRoLm1pbihtYXgsIE1hdGgubWF4KDAsIHMgLSAoZS5kZWx0YVkgKyBlLmRlbHRhWCkgKiA5MCkpLFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBzY3JvbGxMZWZ0PXtzY3JvbGx9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgb3ZlcmZsb3dYOiBcInNjcm9sbFwiLFxuICAgICAgICBvdmVyZmxvd1k6IFwiaGlkZGVuXCIsXG4gICAgICAgIHNjcm9sbGJhcjoge1xuICAgICAgICAgIHRoaWNrbmVzczogOCxcbiAgICAgICAgICB0aHVtYjogeyBiYWNrZ3JvdW5kQ29sb3I6IEMuZ29sZExvLCBib3JkZXJSYWRpdXM6IDQgfSxcbiAgICAgICAgICB0cmFjazogeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjMpXCIgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNpdGlvbjogeyBzY3JvbGw6IHsgZHVyYXRpb246IDI2MCwgZWFzaW5nOiBcImVhc2VPdXRcIiB9IH0sXG4gICAgICAgIGJhY2tncm91bmRHcmFkaWVudDoge1xuICAgICAgICAgIHR5cGU6IFwibGluZWFyXCIsXG4gICAgICAgICAgYW5nbGU6IDE4MCxcbiAgICAgICAgICBzdG9wczogW3sgY29sb3I6IFwiIzEwMjQzYVwiIH0sIHsgY29sb3I6IFwiIzBhMTUyMlwiIH1dLFxuICAgICAgICB9LFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogV0lEVEgsIGhlaWdodDogXCIxMDAlXCIsIGZsZXhTaHJpbms6IDAgfX0+XG4gICAgICAgIDxFcmFzIC8+XG4gICAgICAgIHtURUNIUy5mbGF0TWFwKCh0KSA9PlxuICAgICAgICAgIHQucmVxdWlyZXMubWFwKChyKSA9PiAoXG4gICAgICAgICAgICA8V2lyZVxuICAgICAgICAgICAgICBrZXk9e2Ake3J9LSR7dC5pZH1gfVxuICAgICAgICAgICAgICBmcm9tPXt0ZWNoKHIpfVxuICAgICAgICAgICAgICB0bz17dH1cbiAgICAgICAgICAgICAgcm93PXtyb3d9XG4gICAgICAgICAgICAgIGxpdD17Z2FtZS5yZXNlYXJjaGVkLmluY2x1ZGVzKHIpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKSxcbiAgICAgICAgKX1cbiAgICAgICAge1RFQ0hTLm1hcCgodCkgPT4gKFxuICAgICAgICAgIDxUZWNoTm9kZVxuICAgICAgICAgICAga2V5PXt0LmlkfVxuICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgIHJvdz17cm93fVxuICAgICAgICAgICAgc3RhdGU9e3N0YXRlKHQpfVxuICAgICAgICAgICAgcHJvZ3Jlc3M9eyhnYW1lLnByb2dyZXNzW3QuaWRdID8/IDApIC8gdC5jb3N0fVxuICAgICAgICAgICAgdHVybnM9e3R1cm5zTGVmdCh0LmNvc3QsIGdhbWUucHJvZ3Jlc3NbdC5pZF0gPz8gMCwgc2NpZW5jZSl9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBkaXNwYXRjaCh7IHR5cGU6IFwicmVzZWFyY2hcIiwgdGVjaDogdC5pZCB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBXaGVyZSBjb2x1bW4gYGNgIGJlZ2luczogbWlkLXdheSB0aHJvdWdoIHRoZSBnYXAgYmVmb3JlIGl0LiAqL1xuY29uc3QgZWRnZSA9IChjOiBudW1iZXIpID0+XG4gIGMgPT09IDAgPyAwIDogYyA9PT0gQ09MVU1OUyA/IFdJRFRIIDogUEFEICsgYyAqIENPTCAtIChDT0wgLSBOT0RFX1cpIC8gMjtcblxuZnVuY3Rpb24gRXJhcygpIHtcbiAgbGV0IGNvbCA9IDA7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtFUkFTLm1hcCgoZXJhLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGxlZnQgPSBlZGdlKGNvbCk7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gZWRnZSgoY29sICs9IGVyYS5jb2x1bW5zKSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17ZXJhLm5hbWV9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbGVmdCxcbiAgICAgICAgICAgICAgd2lkdGg6IHJpZ2h0IC0gbGVmdCxcbiAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjpcbiAgICAgICAgICAgICAgICBpICUgMiA/IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyNSlcIiA6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxuICAgICAgICAgICAgICBib3JkZXI6IHsgcmlnaHQ6IDEgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuZ29sZExpbmUsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRm9udHMuZGlzcGxheSxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBcImJvbGRcIixcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMyxcbiAgICAgICAgICAgICAgICBjb2xvcjogQy5nb2xkLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IDE0IH0sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtlcmEubmFtZS50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgIDwvPlxuICApO1xufVxuXG4vKiogQW4gZWxib3dlZCB3aXJlIGZyb20gYGZyb21gJ3MgcmlnaHQgZWRnZSB0byBgdG9gJ3MgbGVmdCBlZGdlLiAqL1xuZnVuY3Rpb24gV2lyZSh7XG4gIGZyb20sXG4gIHRvLFxuICByb3csXG4gIGxpdCxcbn06IHtcbiAgZnJvbTogVGVjaDtcbiAgdG86IFRlY2g7XG4gIHJvdzogbnVtYmVyO1xuICBsaXQ6IGJvb2xlYW47XG59KSB7XG4gIGNvbnN0IGEgPSBhdChmcm9tLCByb3cpO1xuICBjb25zdCBiID0gYXQodG8sIHJvdyk7XG4gIGNvbnN0IHgxID0gYS54ICsgTk9ERV9XO1xuICBjb25zdCB5MSA9IGEueSArIE5PREVfSCAvIDI7XG4gIGNvbnN0IHgyID0gYi54O1xuICBjb25zdCB5MiA9IGIueSArIE5PREVfSCAvIDI7XG4gIGNvbnN0IGVsYm93ID0geDIgLSAoQ09MIC0gTk9ERV9XKSAvIDI7XG4gIGNvbnN0IGNvbG9yID0gbGl0ID8gXCJyZ2JhKDIxNywgMTgzLCAxMDgsIDAuNzUpXCIgOiBcInJnYmEoOTgsIDExOSwgMTQxLCAwLjU1KVwiO1xuICBjb25zdCBzZWcgPSAobGVmdDogbnVtYmVyLCB0b3A6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpID0+IChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQsXG4gICAgICAgIHRvcCxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBjb2xvcixcbiAgICAgIH19XG4gICAgLz5cbiAgKTtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge3NlZyh4MSwgeTEgLSAxLCBlbGJvdyAtIHgxLCAyKX1cbiAgICAgIHtzZWcoZWxib3cgLSAxLCBNYXRoLm1pbih5MSwgeTIpIC0gMSwgMiwgTWF0aC5hYnMoeTIgLSB5MSkgKyAyKX1cbiAgICAgIHtzZWcoZWxib3csIHkyIC0gMSwgeDIgLSBlbGJvdywgMil9XG4gICAgPC8+XG4gICk7XG59XG5cbmNvbnN0IExPT0s6IFJlY29yZDxcbiAgU3RhdGUsXG4gIHsgdG9wOiBzdHJpbmc7IGJvdHRvbTogc3RyaW5nOyBib3JkZXI6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1cbj4gPSB7XG4gIGRvbmU6IHsgdG9wOiBcIiM0YjNjMWVcIiwgYm90dG9tOiBcIiMyNTFjMGVcIiwgYm9yZGVyOiBDLmdvbGQsIHRleHQ6IEMuZ29sZEhpIH0sXG4gIGN1cnJlbnQ6IHtcbiAgICB0b3A6IFwiIzI0NWI4OFwiLFxuICAgIGJvdHRvbTogXCIjMTIzMTUwXCIsXG4gICAgYm9yZGVyOiBDLnNjaWVuY2UsXG4gICAgdGV4dDogXCIjZmZmZmZmXCIsXG4gIH0sXG4gIG9wZW46IHsgdG9wOiBcIiMxZjM5NTRcIiwgYm90dG9tOiBcIiMxMDFmMzBcIiwgYm9yZGVyOiBDLnNsYXRlSGksIHRleHQ6IEMudGV4dCB9LFxuICBsb2NrZWQ6IHtcbiAgICB0b3A6IFwiIzE0MWUyYVwiLFxuICAgIGJvdHRvbTogXCIjMGIxMTE5XCIsXG4gICAgYm9yZGVyOiBcIiMyNzM0NDNcIixcbiAgICB0ZXh0OiBDLmZhaW50LFxuICB9LFxufTtcblxuZnVuY3Rpb24gVGVjaE5vZGUoe1xuICB0LFxuICByb3csXG4gIHN0YXRlLFxuICBwcm9ncmVzcyxcbiAgdHVybnMsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIHQ6IFRlY2g7XG4gIHJvdzogbnVtYmVyO1xuICBzdGF0ZTogU3RhdGU7XG4gIHByb2dyZXNzOiBudW1iZXI7XG4gIHR1cm5zOiBudW1iZXI7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBsb29rID0gTE9PS1tzdGF0ZV07XG4gIGNvbnN0IHsgeCwgeSB9ID0gYXQodCwgcm93KTtcbiAgY29uc3Qgc3RhdHVzID1cbiAgICBzdGF0ZSA9PT0gXCJkb25lXCJcbiAgICAgID8gXCJSZXNlYXJjaGVkXCJcbiAgICAgIDogc3RhdGUgPT09IFwibG9ja2VkXCJcbiAgICAgICAgPyBgJHtwbHVyYWwodHVybnMsIFwidHVyblwiKX0gwrcgbG9ja2VkYFxuICAgICAgICA6IHBsdXJhbCh0dXJucywgXCJ0dXJuXCIpO1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e3N0YXRlID09PSBcImRvbmVcIiA/IHVuZGVmaW5lZCA6IG9uQ2xpY2t9XG4gICAgICBvblBvaW50ZXJFbnRlcj17KCkgPT4gc2V0SG92ZXIodHJ1ZSl9XG4gICAgICBvblBvaW50ZXJMZWF2ZT17KCkgPT4gc2V0SG92ZXIoZmFsc2UpfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgIGxlZnQ6IHgsXG4gICAgICAgIHRvcDogeSxcbiAgICAgICAgd2lkdGg6IE5PREVfVyxcbiAgICAgICAgaGVpZ2h0OiBOT0RFX0gsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogOCxcbiAgICAgICAgcGFkZGluZzogeyBsZWZ0OiA1LCByaWdodDogMTAgfSxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiBOT0RFX0ggLyAyLFxuICAgICAgICBib3JkZXI6IDEuNSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IGxvb2suYm9yZGVyLFxuICAgICAgICBiYWNrZ3JvdW5kR3JhZGllbnQ6IHtcbiAgICAgICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgICAgIGFuZ2xlOiAxODAsXG4gICAgICAgICAgc3RvcHM6IFt7IGNvbG9yOiBsb29rLnRvcCB9LCB7IGNvbG9yOiBsb29rLmJvdHRvbSB9XSxcbiAgICAgICAgfSxcbiAgICAgICAgYm94U2hhZG93OlxuICAgICAgICAgIHN0YXRlID09PSBcImN1cnJlbnRcIlxuICAgICAgICAgICAgPyB7IGNvbG9yOiBcInJnYmEoOTUsIDE5MSwgMjQ0LCAwLjU1KVwiLCBibHVyUmFkaXVzOiAxNiB9XG4gICAgICAgICAgICA6IHsgY29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjQ1KVwiLCBibHVyUmFkaXVzOiA2LCB5T2Zmc2V0OiAyIH0sXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBib3JkZXJDb2xvcjogQy5nb2xkSGkgfX1cbiAgICA+XG4gICAgICA8TWVkYWxsaW9uXG4gICAgICAgIHNpemU9ezQ4fVxuICAgICAgICBpbm5lcj17c3RhdGUgPT09IFwiZG9uZVwiID8gXCIjNmQ1NDI2XCIgOiBDLnNsYXRlSGl9XG4gICAgICAgIG91dGVyPXtzdGF0ZSA9PT0gXCJkb25lXCIgPyBcIiMyZDIyMGZcIiA6IEMuaW5rfVxuICAgICAgICBwcm9ncmVzcz17c3RhdGUgPT09IFwiY3VycmVudFwiID8gcHJvZ3Jlc3MgOiB1bmRlZmluZWR9XG4gICAgICAgIHJpbmc9e0Muc2NpZW5jZX1cbiAgICAgID5cbiAgICAgICAgPEljb25cbiAgICAgICAgICBuYW1lPXtzdGF0ZSA9PT0gXCJkb25lXCIgPyBcImNoZWNrXCIgOiB0Lmljb259XG4gICAgICAgICAgc2l6ZT17MjB9XG4gICAgICAgICAgY29sb3I9e1xuICAgICAgICAgICAgc3RhdGUgPT09IFwiZG9uZVwiXG4gICAgICAgICAgICAgID8gQy5nb2xkSGlcbiAgICAgICAgICAgICAgOiBzdGF0ZSA9PT0gXCJsb2NrZWRcIlxuICAgICAgICAgICAgICAgID8gQy5mYWludFxuICAgICAgICAgICAgICAgIDogQy5zY2llbmNlXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9NZWRhbGxpb24+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIsIGZsZXhHcm93OiAxLCBmbGV4U2hyaW5rOiAxIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLmNhcHMsXG4gICAgICAgICAgICBmb250U2l6ZTogMTEsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjEsXG4gICAgICAgICAgICBjb2xvcjogbG9vay50ZXh0LFxuICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dC5uYW1lLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgY29sb3I6IHN0YXRlID09PSBcImN1cnJlbnRcIiA/IEMuc2NpZW5jZSA6IEMubXV0ZWQsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtzdGF0dXN9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAzIH19PlxuICAgICAgICAgIHt0LnVubG9ja3MubWFwKCh1KSA9PiAoXG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBrZXk9e3UubmFtZX1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogMTgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxOCxcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDMsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRvbmUobG9vay5ib3R0b20sIDAuNiksXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xMilcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEljb25cbiAgICAgICAgICAgICAgICBuYW1lPXt1Lmljb259XG4gICAgICAgICAgICAgICAgc2l6ZT17MTJ9XG4gICAgICAgICAgICAgICAgY29sb3I9e3N0YXRlID09PSBcImxvY2tlZFwiID8gQy5mYWludCA6IEMuZ29sZEhpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICB7aG92ZXIgJiYgKFxuICAgICAgICA8VGlwXG4gICAgICAgICAgdGV4dD17YCR7dC51bmxvY2tzLm1hcCgodSkgPT4gdS5uYW1lKS5qb2luKFwiLCBcIil9IMK3IEJvb3N0OiAke3QuYm9vc3R9YH1cbiAgICAgICAgICBzaWRlPVwiYm90dG9tXCJcbiAgICAgICAgICBvZmZzZXQ9e05PREVfSCArIDR9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUEsYUFBTyxVQUFVLFdBQVcsYUFBYSx3QkFBd0I7QUFBQTtBQUFBOzs7QUNBakU7QUFBQTtBQUFBLGFBQU8sVUFBVSxXQUFXLGFBQWEsWUFBWTtBQUFBO0FBQUE7OztBQ0FyRDtBQUFBO0FBQUEsYUFBTyxVQUFVLFdBQVcsYUFBYSxPQUFPO0FBQUE7QUFBQTs7OztBQ0FoRCxNQUFBQSxxQkFBc0I7Ozs7QUNBdEIsTUFBQUMsaUJBQWdEOzs7QUNLaEQsMEJBS087QUFpZUEsV0FBU0MsS0FBb0NDLE1BQVNDLE9BQXVCO0FBQ2xGQywwQkFBQUEsTUFBUUYsTUFBTUMsS0FBQUE7RUFDaEI7QUFHTyxXQUFTRSxRQUNkSCxNQUNBQyxPQUFrQztBQUVsQyxlQUFPRyxrQkFBQUEsU0FBV0osTUFBTUMsS0FBQUE7RUFDMUI7QUFHTyxXQUFTSSxHQUNkTCxNQUNB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OztRQVFuQmpCLFVBQ0MseUNBQUFkLEtBQUM0RixRQUFBQTtVQUNDQyxPQUFPMUYsT0FBT1csTUFBQUE7VUFDZGYsT0FBT2dFO1VBQ1A3RCxRQUFRZ0U7VUFDUmxELE1BQ0VGLFdBQVcsWUFDUEksY0FDQUosV0FBVyxhQUNUSyxlQUNBa0I7VUFFUnlELEtBQUtoRixXQUFXLFlBQVlFLEtBQUtYLFVBQVVXLEtBQUtWO1VBQ2hEeUYsT0FBTyxDQUFDbEMsT0FBTTVDLFFBQVEsQ0FBQ0QsV0FBVTtZQUFFLEdBQUdBO1lBQU0sQ0FBQ0YsTUFBQUEsR0FBUytDO1VBQUUsRUFBQTtVQUN4RGdCLFNBQVMsTUFBTTlELFVBQVUsSUFBQTtvQkFFeEJELFdBQVcsU0FDVix5Q0FBQWQsS0FBQ2dHLFVBQUFBO1lBQ0N6RjtZQUNBcUIsUUFBUUEsT0FBT0c7WUFDZnZCO1lBQ0FULE9BQU9nRTtZQUNQN0QsUUFBUWdFO2VBRVJwRCxXQUFXLFlBQ2IseUNBQUFkLEtBQUNpRyxTQUFBQTtZQUNDSCxLQUFLOUUsS0FBS1g7WUFDVmI7WUFDQWU7WUFDQVIsT0FBT2dFO1lBQ1A3RCxRQUFRZ0U7ZUFHVix5Q0FBQWxFLEtBQUNrRyxVQUFBQTtZQUFTSixLQUFLOUUsS0FBS1Y7WUFBVWQ7WUFBY2U7OztRQUlsRCx5Q0FBQVAsS0FBQ21HLFFBQUFBO1VBQU81RjtVQUFZcUIsUUFBUUEsT0FBT0c7VUFBSXFFLEtBQUtDLE9BQU83RyxPQUFPZSxJQUFBQSxFQUFNNkY7Ozs7RUFHdEU7OztBRHJPQUUsZ0NBQU0seUNBQUFDLEtBQUNDLEtBQUFBLENBQUFBLENBQUFBLENBQUFBOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfYmV2eV9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiZW1pdCIsICJuYW1lIiwgInZhbHVlIiwgInJhd0VtaXQiLCAicmVxdWVzdCIsICJyYXdSZXF1ZXN0IiwgIm9uIiwgImNiIiwgInJhd0FkZEV2ZW50TGlzdGVuZXIiLCAicmF3UmVtb3ZlRXZlbnRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImJldnkiLCAiYWRkRXZlbnRMaXN0ZW5lciIsICJnYW1lcGFkIiwgImdldEFsbCIsICJydW1ibGUiLCAic3RvcFJ1bWJsZSIsICJtYXAiLCAiZm9jdXMiLCAianVtcCIsICJsZW5zIiwgInNlbGVjdCIsICJ3b3JsZCIsICJ3aW5kb3ciLCAic2l6ZSIsICJFUkFTIiwgIm5hbWUiLCAiY29sdW1ucyIsICJ0IiwgImlkIiwgImNvbCIsICJyb3ciLCAicmVxdWlyZXMiLCAiaWNvbiIsICJ1bmxvY2tzIiwgImJvb3N0IiwgImNvc3QiLCAibWFwIiwgIlRFQ0hTIiwgInRlY2giLCAiZmluZCIsICJTVEFSVElOR19URUNIUyIsICJmaWx0ZXIiLCAiaW5jbHVkZXMiLCAiQ0lWSUNTIiwgIkMiLCAiaW5rIiwgIm5hdnkiLCAibmF2eUhpIiwgInNsYXRlIiwgInNsYXRlSGkiLCAiZ29sZCIsICJnb2xkSGkiLCAiZ29sZExvIiwgImdvbGRMaW5lIiwgInRleHQiLCAibXV0ZWQiLCAiZmFpbnQiLCAiZ29vZCIsICJiYWQiLCAiZm9vZCIsICJwcm9kdWN0aW9uIiwgImNvaW4iLCAic2NpZW5jZSIsICJjdWx0dXJlIiwgImZhaXRoIiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiWUlFTERTIiwgImtleSIsICJuYW1lIiwgImNvbG9yIiwgInBhbmVsIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJib3JkZXJSYWRpdXMiLCAiYm94U2hhZG93IiwgImJsdXJSYWRpdXMiLCAieU9mZnNldCIsICJnaWx0IiwgImNhcHMiLCAiZm9udFNpemUiLCAiZm9udFdlaWdodCIsICJsZXR0ZXJTcGFjaW5nIiwgImxpbmVCcmVhayIsICJPV05TX1BPSU5URVIiLCAiZm10IiwgIm4iLCAiTWF0aCIsICJhYnMiLCAicm91bmQiLCAidG9TdHJpbmciLCAidG9GaXhlZCIsICJzaWduZWQiLCAidG9uZSIsICJoZXgiLCAiayIsICJwYXJzZUludCIsICJzbGljZSIsICJtYXAiLCAiYyIsICJtaW4iLCAibWF4IiwgInBhZFN0YXJ0IiwgImpvaW4iLCAibWl4IiwgImEiLCAiYiIsICJ0IiwgImNoIiwgIngiLCAieSIsICJpIiwgIlNUQVJUX1RVUk4iLCAiTUVUUklDUyIsICJrZXkiLCAibmFtZSIsICJ1bml0IiwgImNvbG9yIiwgIkMiLCAiZ29sZEhpIiwgImljb24iLCAic2NpZW5jZSIsICJjdWx0dXJlIiwgImNvaW4iLCAiZmFpdGgiLCAiYmFkIiwgImZvb2QiLCAiSVRFTVMiLCAiaWQiLCAia2luZCIsICJjb3N0IiwgImVmZmVjdCIsICJpdGVtIiwgImZpbmQiLCAiaSIsICJjaXZpY0Nvc3QiLCAibiIsICJybmciLCAic2VlZCIsICJ0IiwgIk1hdGgiLCAiaW11bCIsICJzZWVkT2YiLCAicyIsICJyZWR1Y2UiLCAiaCIsICJjaCIsICJjaGFyQ29kZUF0IiwgInRvdGFscyIsICJjaXRpZXMiLCAiY2l2IiwgInN1bSIsICJwcm9kdWN0aW9uIiwgImdvbGQiLCAicG9wdWxhdGlvbiIsICJjIiwgImZpbHRlciIsICJrIiwgInlpZWxkcyIsICJjdXJ2ZSIsICJmaW5hbCIsICJ0dXJucyIsICJ3b2JibGUiLCAiciIsICJyYXciLCAiZHJpZnQiLCAicHVzaCIsICJwb3ciLCAibGVuZ3RoIiwgIm1hcCIsICJ2IiwgInNjb3JlIiwgIm1pbGl0YXJ5IiwgImhpc3RvcnkiLCAid29ybGQiLCAibWF4IiwgIl8iLCAibmV3R2FtZSIsICJidWlsZGluZyIsICJidWlsdCIsICJtaW5lIiwgImNpdnMiLCAiZm9yRWFjaCIsICJvd25lZCIsICJjYXBpdGFsIiwgInNsaWNlIiwgIm5leHQiLCAiaXQiLCAiaW5jbHVkZXMiLCAicHJvZ3Jlc3MiLCAiZmxvb3IiLCAidHVybiIsICJyZXNlYXJjaCIsICJyZXNlYXJjaGVkIiwgIlNUQVJUSU5HX1RFQ0hTIiwgIm1hY2hpbmVyeSIsICJyb3VuZCIsICJ0ZWNoIiwgImNpdmljIiwgImNpdmljUHJvZ3Jlc3MiLCAiT2JqZWN0IiwgImZyb21FbnRyaWVzIiwgIm5vdGVzIiwgInRpdGxlIiwgImJvZHkiLCAibmV4dE5vdGUiLCAiaW5jb21lIiwgImdhbWUiLCAibGFzdCIsICJtIiwgImxlZGdlciIsICJwbGF5ZXIiLCAiZmxhdE1hcCIsICJzb3VyY2VzIiwgInZhbHVlIiwgInVwa2VlcCIsICJiIiwgInVuaXRzIiwgInUiLCAieHMiLCAieCIsICJuZXQiLCAiUlVNT1JTIiwgInN0ZXAiLCAiYWN0aW9uIiwgInR5cGUiLCAiY2l0eSIsICJuZXh0VHVybiIsICJnIiwgImVudHJpZXMiLCAicGF5IiwgImJhbmtlZCIsICJkb25lIiwgIkNJVklDUyIsICJub3ciLCAieWVhciIsICJ5IiwgImxlZnQiLCAic3BhbiIsICJJbmZpbml0eSIsICJtaW4iLCAicGx1cmFsIiwgIndvcmQiLCAidHVybnNMZWZ0IiwgInJhdGUiLCAiY2VpbCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJ1c2VXaW5kb3dTaXplIiwgInNpemUiLCAic2V0U2l6ZSIsICJ1c2VTdGF0ZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAidXNlRWZmZWN0IiwgImJldnkiLCAid2luZG93IiwgInRoZW4iLCAiY2F0Y2giLCAib24iLCAidXNlRXZlbnQiLCAibmFtZSIsICJydW4iLCAibGF0ZXN0IiwgInVzZVJlZiIsICJjdXJyZW50IiwgInZhbHVlIiwgInVzZURlYnVnIiwgInZlcmIiLCAiYWN0aW9uIiwgImhlYWQiLCAicmVzdCIsICJzcGxpdCIsICJqb2luIiwgInVzZVNsaWRlSW4iLCAieCIsICJ5IiwgImR1cmF0aW9uIiwgInQiLCAidXNlU2hhcmVkVmFsdWUiLCAid2l0aFRpbWluZyIsICJlYXNpbmciLCAidHJhbnNmb3JtIiwgInRyYW5zbGF0ZVgiLCAiYW5pbWF0ZWQiLCAiaW50ZXJwb2xhdGUiLCAidHJhbnNsYXRlWSIsICJ1c2VGYWRlSW4iLCAib3BhY2l0eSIsICJzY2FsZSIsICJJQ09OUyIsICJzY2llbmNlIiwgImMiLCAiX2pzeHMiLCAiX0ZyYWdtZW50IiwgIl9qc3giLCAicGF0aCIsICJkIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgInN0cm9rZUxpbmVjYXAiLCAic3Ryb2tlTGluZWpvaW4iLCAiY3VsdHVyZSIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJnb2xkIiwgInJlY3QiLCAieCIsICJ5IiwgIndpZHRoIiwgImhlaWdodCIsICJmYWl0aCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJzdGFyIiwgImZvb2QiLCAiZWxsaXBzZSIsICJyeCIsICJyeSIsICJtYXAiLCAiZyIsICJ0cmFuc2Zvcm0iLCAicHJvZHVjdGlvbiIsICJob3VzaW5nIiwgImFtZW5pdGllcyIsICJzdHJlbmd0aCIsICJtb3ZlbWVudCIsICJib3ciLCAiZXllIiwgImZsYWciLCAiY2l0eSIsICJib29rIiwgImNhc3RsZSIsICJvYmVsaXNrIiwgImFuY2hvciIsICJ0cm9waHkiLCAiY2hhcnQiLCAicGVyc29uIiwgInNoaWVsZCIsICJtb29uIiwgInNraXAiLCAiYXJyb3ciLCAidHJhc2giLCAiY2hlY2siLCAiY2xvc2UiLCAibWVudSIsICJsb2NrIiwgIm91dGVyIiwgImlubmVyIiwgIm4iLCAicHRzIiwgImkiLCAiYSIsICJNYXRoIiwgIlBJIiwgInB1c2giLCAiY29zIiwgInNpbiIsICJJY29uIiwgIm5hbWUiLCAic2l6ZSIsICJjb2xvciIsICJzdmciLCAidmlld0JveCIsICJzdHlsZSIsICJmbGV4U2hyaW5rIiwgImltcG9ydF9yZWFjdCIsICJjb25pYyIsICJwcm9ncmVzcyIsICJjb2xvciIsICJkZWciLCAiTWF0aCIsICJtYXgiLCAibWluIiwgInRyYWNrIiwgInR5cGUiLCAic3RvcHMiLCAiYW5nbGUiLCAicmFkaWFsIiwgImlubmVyIiwgIm91dGVyIiwgIk1lZGFsbGlvbiIsICJzaXplIiwgIkMiLCAic2xhdGVIaSIsICJuYXZ5IiwgInJpbmciLCAic2NpZW5jZSIsICJjaGlsZHJlbiIsICJzdHlsZSIsICJyIiwgImZyYW1lIiwgInJvdW5kIiwgImZhY2UiLCAiX2pzeCIsICJub2RlIiwgImZsZXhHcm93IiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZmxleFNocmluayIsICJnaWx0IiwgInBhZGRpbmciLCAidW5kZWZpbmVkIiwgIlJvdW5kQnV0dG9uIiwgImljb24iLCAiZ29sZEhpIiwgInRpcCIsICJ0aXBTaWRlIiwgImFjdGl2ZSIsICJvbkNsaWNrIiwgImhvdmVyIiwgInNldEhvdmVyIiwgInVzZVN0YXRlIiwgIl9qc3hzIiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJvblBvaW50ZXJMZWF2ZSIsICJib3hTaGFkb3ciLCAiYmx1clJhZGl1cyIsICJ5T2Zmc2V0IiwgImhvdmVyU3R5bGUiLCAicHJlc3NTdHlsZSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAic2xhdGUiLCAiSWNvbiIsICJuYW1lIiwgIlRpcCIsICJ0ZXh0IiwgInNpZGUiLCAib2Zmc2V0IiwgInBsYWNlIiwgInJpZ2h0IiwgInRvcCIsICJ0cmFuc2xhdGVZIiwgImxlZnQiLCAidHJhbnNsYXRlWCIsICJib3R0b20iLCAicG9zaXRpb25UeXBlIiwgImhvcml6b250YWwiLCAidmVydGljYWwiLCAiYmFja2dyb3VuZENvbG9yIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkTG8iLCAiZ2xvYmFsWkluZGV4IiwgImZvbnRTaXplIiwgImxpbmVCcmVhayIsICJIZWFkZXIiLCAiZ29sZCIsICJydWxlIiwgImdvbGRMaW5lIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImNhcHMiLCAidG9VcHBlckNhc2UiLCAiQmFyIiwgInZhbHVlIiwgInRyYW5zaXRpb24iLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgIkFtb3VudCIsICJmb250V2VpZ2h0IiwgIkNsb3NlQnV0dG9uIiwgIkNyZXN0IiwgImNpdiIsICJ0b25lIiwgImZvbnRGYW1pbHkiLCAiRm9udHMiLCAiZGlzcGxheSIsICJ0ZXh0U2hhZG93IiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJXSURUSCIsICJDaXR5UGFuZWwiLCAiY2l0eSIsICJjaXYiLCAiZ2FtZSIsICJkaXNwYXRjaCIsICJvbkNsb3NlIiwgImVudGVyIiwgInVzZVNsaWRlSW4iLCAibWluZSIsICJwbGF5ZXIiLCAic3VycGx1cyIsICJ5aWVsZHMiLCAiZm9vZCIsICJwb3B1bGF0aW9uIiwgImJ1aWx0IiwgImlkIiwgImhvdXNpbmciLCAiaW5jbHVkZXMiLCAiYW1lbml0aWVzIiwgImNhcGl0YWwiLCAidW5oYXBweSIsICJNYXRoIiwgImNlaWwiLCAiZ3Jvd3RoIiwgInR1cm4iLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJwYW5lbCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAiYm90dG9tIiwgIndpZHRoIiwgImZsZXhEaXJlY3Rpb24iLCAiaG92ZXJTdHlsZSIsICJPV05TX1BPSU5URVIiLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImJvcmRlclJhZGl1cyIsICJyaWdodCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJjb2xvciIsICJ0b25lIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJDIiwgImdvbGQiLCAiX2pzeCIsICJNZWRhbGxpb24iLCAic2l6ZSIsICJpbm5lciIsICJzbGF0ZSIsICJvdXRlciIsICJpbmsiLCAicHJvZ3Jlc3MiLCAicmluZyIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImZvbnRXZWlnaHQiLCAiZmxleEdyb3ciLCAiSWNvbiIsICJuYW1lIiwgImdvbGRIaSIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAibGV0dGVyU3BhY2luZyIsICJ0ZXh0U2hhZG93IiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJ0b1VwcGVyQ2FzZSIsICJDbG9zZUJ1dHRvbiIsICJvbkNsaWNrIiwgImp1c3RpZnlDb250ZW50IiwgImJhY2tncm91bmRDb2xvciIsICJZSUVMRFMiLCAibWFwIiwgInkiLCAia2V5IiwgInNpZ25lZCIsICJTdGF0IiwgImljb24iLCAibGFiZWwiLCAidmFsdWUiLCAicGx1cmFsIiwgIm1heCIsICJmaWxsIiwgImdvb2QiLCAiYmFkIiwgIm1pbiIsICJtdXRlZCIsICJ0aWxlcyIsICJQcm9kdWN0aW9uIiwgInVuZGVmaW5lZCIsICJCYXIiLCAibm93IiwgImJ1aWxkaW5nIiwgImN1cnJlbnQiLCAiaXRlbSIsICJyYXRlIiwgInByb2R1Y3Rpb24iLCAiZ3JvdXBzIiwgImtpbmQiLCAiaXRlbXMiLCAiSVRFTVMiLCAiZmlsdGVyIiwgImkiLCAiZmxleFNocmluayIsICJtaW5IZWlnaHQiLCAiSGVhZGVyIiwgImNvc3QiLCAidHVybnNMZWZ0IiwgImZtdCIsICJsZW5ndGgiLCAiZmxleFdyYXAiLCAib3ZlcmZsb3dZIiwgInNjcm9sbGJhciIsICJ0aGlja25lc3MiLCAicG9zaXRpb24iLCAidGh1bWIiLCAiZ29sZExvIiwgImciLCAibWFyZ2luIiwgImNhcHMiLCAiaXQiLCAiQ2hvaWNlIiwgInR1cm5zIiwgImFjdGl2ZSIsICJidXR0b24iLCAic2xhdGVIaSIsICJoZWlnaHQiLCAiZWZmZWN0IiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJNQVBfVyIsICJNQVBfSCIsICJNYXRoIiwgInJvdW5kIiwgIkFjdGlvblBhbmVsIiwgImxhYmVsIiwgImJ1c3kiLCAibGVucyIsICJvbk5leHQiLCAib25MZW5zIiwgImp1bXAiLCAiZSIsICJiZXZ5IiwgIm1hcCIsICJ1IiwgIngiLCAidiIsICJ5IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgInJpZ2h0IiwgImJvdHRvbSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAibWFyZ2luIiwgIl9qc3giLCAicGFuZWwiLCAiaGVpZ2h0IiwgInBhZGRpbmciLCAibGVmdCIsICJqdXN0aWZ5Q29udGVudCIsICJib3JkZXJSYWRpdXMiLCAiaG92ZXJTdHlsZSIsICJPV05TX1BPSU5URVIiLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFdlaWdodCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImNvbG9yIiwgIkMiLCAiZ29sZEhpIiwgIkVuZFR1cm4iLCAib25DbGljayIsICJnYXAiLCAiUm91bmRCdXR0b24iLCAiaWNvbiIsICJzaXplIiwgInRpcCIsICJ0aXBTaWRlIiwgImFjdGl2ZSIsICJjYXBzIiwgIm11dGVkIiwgInBvcnRhbCIsICJ0YXJnZXQiLCAib25Qb2ludGVyRG93biIsICJvblBvaW50ZXJNb3ZlIiwgIndpZHRoIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkTG8iLCAiY3Vyc29yIiwgInNwaW4iLCAidXNlU2hhcmVkVmFsdWUiLCAiZ2xvdyIsICJzZXRHbG93IiwgInVzZVN0YXRlIiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ3aXRoUmVwZWF0IiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiYnV0dG9uIiwgIm9uUG9pbnRlckVudGVyIiwgIm9uUG9pbnRlckxlYXZlIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJnaWx0IiwgImJveFNoYWRvdyIsICJibHVyUmFkaXVzIiwgInlPZmZzZXQiLCAicHJlc3NTdHlsZSIsICJ0cmFuc2Zvcm0iLCAic2NhbGUiLCAiZmxleEdyb3ciLCAidHlwZSIsICJzdG9wcyIsICJyb3RhdGUiLCAiYW5pbWF0ZWQiLCAicmFkaWFsIiwgIkljb24iLCAibmFtZSIsICJNT1ZFIiwgImljb24iLCAibmFtZSIsICJGT1JUSUZZIiwgIlNMRUVQIiwgIlNLSVAiLCAiREVMRVRFIiwgIlVOSVRTIiwgIndhcnJpb3IiLCAicm9sZSIsICJzdHJlbmd0aCIsICJtb3ZlcyIsICJvcmRlcnMiLCAiYXJjaGVyIiwgInJhbmdlZCIsICJzY291dCIsICJzZXR0bGVyIiwgImJ1aWxkZXIiLCAiVW5pdFBhbmVsIiwgInVuaXQiLCAiY2l2IiwgIm9uQ2xvc2UiLCAiZGVmIiwgImtpbmQiLCAiZW50ZXIiLCAidXNlU2xpZGVJbiIsICJtaW5lIiwgInBsYXllciIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgInBhbmVsIiwgInBvc2l0aW9uVHlwZSIsICJsZWZ0IiwgImJvdHRvbSIsICJ3aWR0aCIsICJwYWRkaW5nIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImhvdmVyU3R5bGUiLCAiT1dOU19QT0lOVEVSIiwgImFsaWduSXRlbXMiLCAiX2pzeCIsICJNZWRhbGxpb24iLCAic2l6ZSIsICJpbm5lciIsICJ0b25lIiwgImNvbG9yIiwgIm91dGVyIiwgIkljb24iLCAiZmxleEdyb3ciLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFdlaWdodCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgIkMiLCAiZ29sZEhpIiwgInRvVXBwZXJDYXNlIiwgIkNsb3NlQnV0dG9uIiwgIm9uQ2xpY2siLCAibXV0ZWQiLCAibWFyZ2luIiwgInRvcCIsICJBbW91bnQiLCAidmFsdWUiLCAiQmFyIiwgImhlaWdodCIsICJnb29kIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkTGluZSIsICJqdXN0aWZ5Q29udGVudCIsICJtYXAiLCAibyIsICJSb3VuZEJ1dHRvbiIsICJ0aXAiLCAidGlwU2lkZSIsICJCYW5uZXJzIiwgIndvcmxkIiwgImdhbWUiLCAic2VsZWN0aW9uIiwgIm9uU2VsZWN0IiwgImNpdiIsICJpZCIsICJjaXZzIiwgImZpbmQiLCAiYyIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiY2l0aWVzIiwgIm1hcCIsICJjaXR5IiwgIl9qc3giLCAiQ2l0eUJhbm5lciIsICJzZWxlY3RlZCIsICJraW5kIiwgIm9uQ2xpY2siLCAidW5pdHMiLCAiZmlsdGVyIiwgInUiLCAiaGlkZGVuIiwgInVuaXQiLCAiVW5pdEZsYWciLCAicHJvZHVjaW5nIiwgImJ1aWxkaW5nIiwgIml0IiwgIml0ZW0iLCAiZ3Jvd3RoIiwgInR1cm4iLCAicG9wdWxhdGlvbiIsICJhbmNob3IiLCAiZW50aXR5IiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJoZWlnaHQiLCAibm9kZSIsICJ3aWR0aCIsICJib3JkZXJSYWRpdXMiLCAicGFkZGluZyIsICJtYXJnaW4iLCAicmlnaHQiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgImNvbmljIiwgIkMiLCAiZm9vZCIsICJ6SW5kZXgiLCAiZmxleEdyb3ciLCAianVzdGlmeUNvbnRlbnQiLCAiYmFja2dyb3VuZENvbG9yIiwgImluayIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImZvbnRXZWlnaHQiLCAiY29sb3IiLCAiYnV0dG9uIiwgImdhcCIsICJsZWZ0IiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkSGkiLCAidG9uZSIsICJ0eXBlIiwgImFuZ2xlIiwgInN0b3BzIiwgImJveFNoYWRvdyIsICJibHVyUmFkaXVzIiwgInlPZmZzZXQiLCAiaG92ZXJTdHlsZSIsICJjYXBpdGFsIiwgIkljb24iLCAibmFtZSIsICJzaXplIiwgImZvbnRGYW1pbHkiLCAiRm9udHMiLCAiZGlzcGxheSIsICJsZXR0ZXJTcGFjaW5nIiwgInRleHRTaGFkb3ciLCAib2Zmc2V0WCIsICJvZmZzZXRZIiwgInRvVXBwZXJDYXNlIiwgInByb2dyZXNzIiwgImNvc3QiLCAicHJvZHVjdGlvbiIsICJpY29uIiwgInBvc2l0aW9uVHlwZSIsICJ0b3AiLCAiaG9yaXpvbnRhbCIsICJ0dXJuc0xlZnQiLCAieWllbGRzIiwgIm9mZnNldCIsICJyYWRpYWwiLCAidHJhbnNmb3JtIiwgInNjYWxlIiwgIlVOSVRTIiwgIkZFQVRVUkVTIiwgIndvb2RzIiwgInJhaW5mb3Jlc3QiLCAiVGlsZVRvb2x0aXAiLCAidGlsZSIsICJjdXJzb3IiLCAib3duZXIiLCAicmVsaWVmIiwgIm1vdW50YWlucyIsICJoaWxscyIsICJ0ZXJyYWluIiwgImZlYXR1cmUiLCAiQm9vbGVhbiIsICJqb2luIiwgIllJRUxEUyIsICJ5IiwgImtleSIsICJnbG9iYWxaSW5kZXgiLCAicGFuZWwiLCAiYm90dG9tIiwgInZlcnRpY2FsIiwgInVuZGVmaW5lZCIsICJuYXZ5IiwgInJldmVhbGVkIiwgIm11dGVkIiwgImxpbmVCcmVhayIsICJmbXQiLCAiZmFybSIsICJpbXBvcnRfcmVhY3QiLCAiTU9PRFMiLCAibmFtZSIsICJjb2xvciIsICJDIiwgImdvb2QiLCAibm90ZSIsICJjb2luIiwgImJhZCIsICJtdXRlZCIsICJMZWFkZXJzIiwgInJpdmFscyIsICJnYW1lIiwgIm9uT3BlbiIsICJfanN4IiwgIm5vZGUiLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgInJpZ2h0IiwgInRvcCIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJtYXAiLCAiY2l2IiwgImkiLCAic2NvcmUiLCAiaGlzdG9yeSIsICJpZCIsICJMZWFkZXIiLCAibW9vZCIsICJsZW5ndGgiLCAiTWF0aCIsICJyb3VuZCIsICJvbkNsaWNrIiwgImhvdmVyIiwgInNldEhvdmVyIiwgInVzZVN0YXRlIiwgIl9qc3hzIiwgImJ1dHRvbiIsICJvblBvaW50ZXJFbnRlciIsICJvblBvaW50ZXJMZWF2ZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYWxpZ25JdGVtcyIsICJob3ZlclN0eWxlIiwgInRyYW5zZm9ybSIsICJzY2FsZSIsICJDcmVzdCIsICJzaXplIiwgImxlZnQiLCAiYm9yZGVyUmFkaXVzIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJuYXZ5IiwgImJhY2tncm91bmRDb2xvciIsICJwYW5lbCIsICJwYWRkaW5nIiwgImdsb2JhbFpJbmRleCIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRm9udHMiLCAiZGlzcGxheSIsICJmb250V2VpZ2h0IiwgImZvbnRTaXplIiwgImdvbGRIaSIsICJsZWFkZXIiLCAibWFyZ2luIiwgImltcG9ydF9yZWFjdCIsICJOb3RpZmljYXRpb25zIiwgIm5vdGVzIiwgIm9uRGlzbWlzcyIsICJfanN4IiwgIm5vZGUiLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgInJpZ2h0IiwgInRvcCIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgIm1hcCIsICJuIiwgIk5vdGljZSIsICJub3RlIiwgImlkIiwgImhvdmVyIiwgInNldEhvdmVyIiwgInVzZVN0YXRlIiwgImVudGVyIiwgInVzZVNsaWRlSW4iLCAiX2pzeHMiLCAidHJhbnNpdGlvbiIsICJsYXlvdXQiLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgInBhbmVsIiwgInRyYW5zZm9ybSIsICJ0cmFuc2xhdGVZIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJ0ZXh0IiwgImZvbnRTaXplIiwgImZvbnRXZWlnaHQiLCAiY29sb3IiLCAidGl0bGUiLCAiQyIsICJsaW5lQnJlYWsiLCAiYm9keSIsICJidXR0b24iLCAib25DbGljayIsICJvblBvaW50ZXJFbnRlciIsICJvblBvaW50ZXJMZWF2ZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRHcmFkaWVudCIsICJnaWx0IiwgImJveFNoYWRvdyIsICJibHVyUmFkaXVzIiwgInlPZmZzZXQiLCAiaG92ZXJTdHlsZSIsICJzY2FsZSIsICJmbGV4R3JvdyIsICJqdXN0aWZ5Q29udGVudCIsICJyYWRpYWwiLCAic2xhdGVIaSIsICJpbmsiLCAiSWNvbiIsICJuYW1lIiwgImljb24iLCAic2l6ZSIsICJpbXBvcnRfcmVhY3QiLCAiVG9wQmFyIiwgImdhbWUiLCAicGxheWVyIiwgIm5ldCIsICJwYXkiLCAiaW5jb21lIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAicmlnaHQiLCAidG9wIiwgImhlaWdodCIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJiYWNrZ3JvdW5kR3JhZGllbnQiLCAidHlwZSIsICJhbmdsZSIsICJzdG9wcyIsICJjb2xvciIsICJib3JkZXIiLCAiYm90dG9tIiwgImJvcmRlckNvbG9yIiwgIkMiLCAiZ29sZExvIiwgImJveFNoYWRvdyIsICJibHVyUmFkaXVzIiwgInlPZmZzZXQiLCAiaG92ZXJTdHlsZSIsICJPV05TX1BPSU5URVIiLCAiX2pzeCIsICJBbW91bnQiLCAiaWNvbiIsICJzY2llbmNlIiwgInZhbHVlIiwgInNpZ25lZCIsICJjdWx0dXJlIiwgImNvaW4iLCAiTWF0aCIsICJmbG9vciIsICJnb2xkIiwgImZhaXRoIiwgImZsZXhHcm93IiwgInRleHQiLCAiY2FwcyIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFNpemUiLCAiZ29sZEhpIiwgInR1cm4iLCAieWVhciIsICJDbG9jayIsICJub3ciLCAic2V0Tm93IiwgInVzZVN0YXRlIiwgIkRhdGUiLCAidXNlRWZmZWN0IiwgImlkIiwgInNldEludGVydmFsIiwgImNsZWFySW50ZXJ2YWwiLCAiaGgiLCAiZ2V0SG91cnMiLCAidG9TdHJpbmciLCAicGFkU3RhcnQiLCAibW0iLCAiZ2V0TWludXRlcyIsICJtdXRlZCIsICJMYXVuY2hCYXIiLCAib25PcGVuIiwgInJlc2VhcmNoIiwgInZlcnRpY2FsIiwgImJvcmRlclJhZGl1cyIsICJSb3VuZEJ1dHRvbiIsICJ0aXAiLCAiYWN0aXZlIiwgIm9uQ2xpY2siLCAiV0lEVEgiLCAiVHJhY2tlcnMiLCAiZ2FtZSIsICJwbGF5ZXIiLCAib25SZXNlYXJjaCIsICJwYXkiLCAiaW5jb21lIiwgInJlc2VhcmNoIiwgInRlY2giLCAiYmFua2VkIiwgInByb2dyZXNzIiwgImlkIiwgImNpdmljTmFtZSIsICJDSVZJQ1MiLCAiY2l2aWMiLCAibGVuZ3RoIiwgImNpdmljTmVlZCIsICJjaXZpY0Nvc3QiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAid2lkdGgiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAiX2pzeCIsICJUcmFja2VyIiwgInRpdGxlIiwgImNvbG9yIiwgIkMiLCAic2NpZW5jZSIsICJpY29uIiwgIm5hbWUiLCAiY29zdCIsICJkZXRhaWwiLCAicGx1cmFsIiwgInR1cm5zTGVmdCIsICJoaW50IiwgImJvb3N0IiwgIm9uQ2xpY2siLCAiY3VsdHVyZSIsICJjaXZpY1Byb2dyZXNzIiwgInBhbmVsIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJib3R0b20iLCAiaG92ZXJTdHlsZSIsICJib3JkZXJDb2xvciIsICJnb2xkIiwgIk9XTlNfUE9JTlRFUiIsICJIZWFkZXIiLCAiYWxpZ25JdGVtcyIsICJNZWRhbGxpb24iLCAic2l6ZSIsICJyaW5nIiwgIkljb24iLCAidGV4dCIsICJmb250U2l6ZSIsICJmb250V2VpZ2h0IiwgIm11dGVkIiwgIlJBTktJTkdfVEFCUyIsICJWSUNUT1JJRVMiLCAidGFiIiwgImljb24iLCAiY29sb3IiLCAiQyIsICJzY2llbmNlIiwgImdvYWwiLCAiY3VsdHVyZSIsICJiYWQiLCAiZmFpdGgiLCAiY29pbiIsICJzdGFuZGluZ3MiLCAid29ybGQiLCAiZ2FtZSIsICJzY2kiLCAiYyIsICJoaXN0b3J5IiwgImlkIiwgImF0IiwgIm1pbmUiLCAiY2l2cyIsICJtYXAiLCAiY2l2IiwgImkiLCAiciIsICJybmciLCAic3VtIiwgInRvdGFscyIsICJjaXRpZXMiLCAia25vd24iLCAicGxheWVyIiwgInJlc2VhcmNoZWQiLCAibGVuZ3RoIiwgIk1hdGgiLCAibWluIiwgIlRFQ0hTIiwgInJvdW5kIiwgInByb2dyZXNzIiwgIm5vdGUiLCAidmlzaXRpbmciLCAibmVlZCIsICJmbG9vciIsICJwb2ludHMiLCAiUmFua2luZ3MiLCAidiIsICJmaW5kIiwgInJvd3MiLCAic29ydCIsICJhIiwgImIiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJnYXAiLCAiYWxpZ25JdGVtcyIsICJfanN4IiwgIk1lZGFsbGlvbiIsICJzaXplIiwgInJpbmciLCAiSWNvbiIsICJuYW1lIiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGb250cyIsICJkaXNwbGF5IiwgImZvbnRXZWlnaHQiLCAiZm9udFNpemUiLCAiZ29sZEhpIiwgInRvVXBwZXJDYXNlIiwgIm11dGVkIiwgInMiLCAiYm9yZGVyUmFkaXVzIiwgImJhY2tncm91bmRDb2xvciIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiZ29sZExpbmUiLCAid2lkdGgiLCAiZ29sZCIsICJDcmVzdCIsICJsZWFkZXIiLCAiQmFyIiwgInZhbHVlIiwgImhlaWdodCIsICJhbGwiLCAic2NvcmUiLCAiY2FwcyIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgIlBBRCIsICJsZWZ0IiwgInJpZ2h0IiwgInRvcCIsICJib3R0b20iLCAiR1JJRCIsICJTVVJGQUNFIiwgInRpY2tzIiwgIm1heCIsICJyYXciLCAiTWF0aCIsICJtYWciLCAicG93IiwgImZsb29yIiwgImxvZzEwIiwgInN0ZXAiLCAibWFwIiwgIm0iLCAiZmluZCIsICJzIiwgIm91dCIsICJ2IiwgInB1c2giLCAiY29tcGFjdCIsICJyb3VuZCIsICJ0b0ZpeGVkIiwgImZtdCIsICJBeGVzIiwgIndpZHRoIiwgImhlaWdodCIsICJncmlkIiwgImZpcnN0IiwgImNvdW50IiwgInBsb3RXIiwgInBsb3RIIiwgImV2ZXJ5IiwgInR1cm5zIiwgInQiLCAiY2VpbCIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJ0ZXh0IiwgInN0eWxlIiwgInBvc2l0aW9uVHlwZSIsICJ0ZXh0QWxpZ24iLCAiZm9udFNpemUiLCAiY29sb3IiLCAiQyIsICJmYWludCIsICJncmlkTGluZXMiLCAieSIsICJsaW5lIiwgIngxIiwgInkxIiwgIngyIiwgInkyIiwgInN0cm9rZSIsICJzdHJva2VXaWR0aCIsICJMaW5lQ2hhcnQiLCAic2VyaWVzIiwgImhvdmVyIiwgInNldEhvdmVyIiwgInVzZVN0YXRlIiwgIm4iLCAidmFsdWVzIiwgImxlbmd0aCIsICJmbGF0TWFwIiwgIngiLCAiaSIsICJsZWFkIiwgImJvbGQiLCAibm9kZSIsICJvblBvaW50ZXJMZWF2ZSIsICJzdmciLCAidmlld0JveCIsICJwb2x5Z29uIiwgInBvaW50cyIsICJmaWxsIiwgIm1peCIsICJwb2x5bGluZSIsICJzdHJva2VMaW5lam9pbiIsICJzdHJva2VMaW5lY2FwIiwgImlkIiwgIlJlYWRvdXQiLCAicm93cyIsICJ2YWx1ZSIsICJ0dXJuIiwgIlN0cmlwIiwgIm9uSG92ZXIiLCAiZmxleERpcmVjdGlvbiIsICJBcnJheSIsICJmcm9tIiwgIl8iLCAiZmxleEdyb3ciLCAiZmxleEJhc2lzIiwgIm9uUG9pbnRlckVudGVyIiwgInNvcnRlZCIsICJmaWx0ZXIiLCAiciIsICJ1bmRlZmluZWQiLCAic29ydCIsICJhIiwgImIiLCAiZmxpcCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiYm9yZGVyUmFkaXVzIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAidmVydGljYWwiLCAiZ2FwIiwgImdvbGRMbyIsICJtdXRlZCIsICJhbGlnbkl0ZW1zIiwgImZvbnRXZWlnaHQiLCAibGluZUJyZWFrIiwgIm5hbWUiLCAiU3RhY2tlZEFyZWEiLCAiTEFCRUxTIiwgInN0YWNrZWQiLCAiZm9yRWFjaCIsICJrIiwgInRvcHMiLCAiYmFzZSIsICJiYWNrd2FyZHMiLCAic2xpY2UiLCAibWlkIiwgIkRvbnV0IiwgInNsaWNlcyIsICJzaXplIiwgImxhYmVsIiwgInRvdGFsIiwgInJlZHVjZSIsICJyMSIsICJyMCIsICJhcmNzIiwgIlBJIiwgInRvIiwgInNob3duIiwgImp1c3RpZnlDb250ZW50IiwgInBhdGgiLCAiZCIsICJzZWN0b3IiLCAiaCIsICJjeCIsICJjeSIsICJhMCIsICJhMSIsICJhdCIsICJzaW4iLCAiY29zIiwgImcxIiwgImcwIiwgImxhcmdlIiwgImpvaW4iLCAiUkVQT1JUX1RBQlMiLCAiUmVwb3J0cyIsICJ0YWIiLCAid29ybGQiLCAiZ2FtZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiX2pzeCIsICJDaXRpZXMiLCAiRGVtb2dyYXBoaWNzIiwgIkdyYXBocyIsICJtZXRyaWMiLCAic2V0TWV0cmljIiwgInVzZVN0YXRlIiwgImhpZGRlbiIsICJzZXRIaWRkZW4iLCAiU2V0IiwgInBsYXllciIsICJjaXZzIiwgImRlZiIsICJNRVRSSUNTIiwgImZpbmQiLCAibSIsICJrZXkiLCAic2VyaWVzIiwgImZpbHRlciIsICJjIiwgImhhcyIsICJpZCIsICJtYXAiLCAibmFtZSIsICJjb2xvciIsICJ2YWx1ZXMiLCAiaGlzdG9yeSIsICJib2xkIiwgImNoYXJ0VyIsICJvd24iLCAieWllbGRzIiwgIlNUQUNLIiwgInRvZ2dsZSIsICJoIiwgIm5leHQiLCAiZGVsZXRlIiwgImFkZCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiZmxleEdyb3ciLCAiZ2FwIiwgInBhZGRpbmciLCAiYm9yZGVyIiwgInJpZ2h0IiwgImJvcmRlckNvbG9yIiwgIkMiLCAiZ29sZExpbmUiLCAidGV4dCIsICJjYXBzIiwgIm11dGVkIiwgIm1hcmdpbiIsICJib3R0b20iLCAiYnV0dG9uIiwgIm9uQ2xpY2siLCAiYWxpZ25JdGVtcyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImJvcmRlclJhZGl1cyIsICJiYWNrZ3JvdW5kQ29sb3IiLCAibGVmdCIsICJnb2xkIiwgImhvdmVyU3R5bGUiLCAiSWNvbiIsICJpY29uIiwgInNpemUiLCAiZm9udFNpemUiLCAiZ29sZEhpIiwgImZvbnRXZWlnaHQiLCAidW5pdCIsICJUb2dnbGUiLCAiY2l2IiwgIm9uIiwgIkxpbmVDaGFydCIsICJNYXRoIiwgIm1heCIsICJmaXJzdCIsICJIZWFkZXIiLCAicmV2ZXJzZSIsICJzIiwgIlN0YWNrZWRBcmVhIiwgImZhaW50IiwgIkNPTFMiLCAibGFiZWwiLCAiWUlFTERTIiwgInkiLCAiVEFCTEVfVyIsICJyZWR1Y2UiLCAibiIsICJjaXRpZXMiLCAic3VtIiwgInRvdGFscyIsICJtb25leSIsICJsZWRnZXIiLCAic2xvdHMiLCAic291cmNlcyIsICJpIiwgImxlbmd0aCIsICJmb29kIiwgInBvcCIsICJSb3ciLCAiaGVhZGVyIiwgImNlbGxzIiwgInN0YXIiLCAiY2FwaXRhbCIsICJwb3B1bGF0aW9uIiwgImZtdCIsICJ0b3RhbCIsICJ0b3AiLCAiZmxleFdyYXAiLCAiY29sdW1uR2FwIiwgInJvd0dhcCIsICJCcmVha2Rvd24iLCAicm93cyIsICJ2YWx1ZSIsICJEb251dCIsICJzbGljZXMiLCAiTGVkZ2VyIiwgInN3YXRjaCIsICJzaWduZWQiLCAidXBrZWVwIiwgInUiLCAibmV0IiwgInN0cm9uZyIsICJyIiwgIkJBUiIsICJ0b1VwcGVyQ2FzZSIsICJsaW5lQnJlYWsiLCAidW5kZWZpbmVkIiwgImNlbGwiLCAiY29sIiwgImp1c3RpZnlDb250ZW50IiwgIkRFTU9HUkFQSElDUyIsICJvZiIsICJ3IiwgInByb2R1Y3Rpb24iLCAiXyIsICJnIiwgIm1pbiIsICJzY2llbmNlIiwgImF0IiwgIm1pbGl0YXJ5IiwgIngiLCAidGlsZXMiLCAiZCIsICJ2IiwgInNvcnRlZCIsICJzb3J0IiwgImEiLCAiYiIsICJtaW5lIiwgInJhbmsiLCAiZmluZEluZGV4IiwgImF2ZyIsICJjb21wYWN0IiwgInBvc2l0aW9uVHlwZSIsICJ6SW5kZXgiLCAiU2NyZWVuIiwgInRpdGxlIiwgIndpZHRoIiwgImhlaWdodCIsICJ0YWJzIiwgInRhYiIsICJvblRhYiIsICJvbkNsb3NlIiwgImNoaWxkcmVuIiwgImVudGVyIiwgInVzZUZhZGVJbiIsICJfanN4IiwgIm5vZGUiLCAic3R5bGUiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAicmlnaHQiLCAidG9wIiwgImJvdHRvbSIsICJhbGlnbkl0ZW1zIiwgImp1c3RpZnlDb250ZW50IiwgImJhY2tncm91bmRDb2xvciIsICJiYWNrZHJvcEZpbHRlciIsICJuYW1lIiwgInBhcmFtcyIsICJyYWRpdXMiLCAiaG92ZXJTdHlsZSIsICJPV05TX1BPSU5URVIiLCAiX2pzeHMiLCAicGFuZWwiLCAiZmxleERpcmVjdGlvbiIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiQyIsICJnb2xkIiwgImZsZXhTaHJpbmsiLCAiZ29sZExpbmUiLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAiY29sb3IiLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkZvbnRzIiwgImRpc3BsYXkiLCAiZm9udFdlaWdodCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImdvbGRIaSIsICJ0ZXh0U2hhZG93IiwgIm9mZnNldFgiLCAib2Zmc2V0WSIsICJ0b1VwcGVyQ2FzZSIsICJDbG9zZUJ1dHRvbiIsICJvbkNsaWNrIiwgImdhcCIsICJwYWRkaW5nIiwgIm1hcCIsICJ0IiwgImJ1dHRvbiIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImNhcHMiLCAibXV0ZWQiLCAiZmxleEdyb3ciLCAibWluSGVpZ2h0IiwgImltcG9ydF9yZWFjdCIsICJDT0wiLCAiTk9ERV9XIiwgIk5PREVfSCIsICJQQUQiLCAiSEVBRCIsICJST1dTIiwgIkNPTFVNTlMiLCAiRVJBUyIsICJyZWR1Y2UiLCAibiIsICJlIiwgImNvbHVtbnMiLCAiV0lEVEgiLCAicm93Rm9yIiwgImhlaWdodCIsICJNYXRoIiwgIm1heCIsICJtaW4iLCAiYXQiLCAidCIsICJyb3ciLCAieCIsICJjb2wiLCAieSIsICJUZWNoVHJlZSIsICJnYW1lIiwgInBsYXllciIsICJkaXNwYXRjaCIsICJ3aWR0aCIsICJjdXJyZW50IiwgInJlc2VhcmNoIiwgInRlY2giLCAic2Nyb2xsIiwgInNldFNjcm9sbCIsICJ1c2VTdGF0ZSIsICJzY2llbmNlIiwgImluY29tZSIsICJzdGF0ZSIsICJyZXNlYXJjaGVkIiwgImluY2x1ZGVzIiwgImlkIiwgInJlcXVpcmVzIiwgImV2ZXJ5IiwgInIiLCAiX2pzeCIsICJub2RlIiwgIm9uV2hlZWwiLCAicyIsICJkZWx0YVkiLCAiZGVsdGFYIiwgInNjcm9sbExlZnQiLCAic3R5bGUiLCAiZmxleEdyb3ciLCAib3ZlcmZsb3dYIiwgIm92ZXJmbG93WSIsICJzY3JvbGxiYXIiLCAidGhpY2tuZXNzIiwgInRodW1iIiwgImJhY2tncm91bmRDb2xvciIsICJDIiwgImdvbGRMbyIsICJib3JkZXJSYWRpdXMiLCAidHJhY2siLCAidHJhbnNpdGlvbiIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAiYmFja2dyb3VuZEdyYWRpZW50IiwgInR5cGUiLCAiYW5nbGUiLCAic3RvcHMiLCAiY29sb3IiLCAiX2pzeHMiLCAiZmxleFNocmluayIsICJFcmFzIiwgIlRFQ0hTIiwgImZsYXRNYXAiLCAibWFwIiwgIldpcmUiLCAiZnJvbSIsICJ0byIsICJsaXQiLCAiVGVjaE5vZGUiLCAicHJvZ3Jlc3MiLCAiY29zdCIsICJ0dXJucyIsICJ0dXJuc0xlZnQiLCAib25DbGljayIsICJlZGdlIiwgImMiLCAiX0ZyYWdtZW50IiwgImVyYSIsICJpIiwgImxlZnQiLCAicmlnaHQiLCAicG9zaXRpb25UeXBlIiwgInRvcCIsICJib3R0b20iLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJnb2xkTGluZSIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRm9udHMiLCAiZGlzcGxheSIsICJmb250V2VpZ2h0IiwgImZvbnRTaXplIiwgImxldHRlclNwYWNpbmciLCAiZ29sZCIsICJtYXJnaW4iLCAibmFtZSIsICJ0b1VwcGVyQ2FzZSIsICJhIiwgImIiLCAieDEiLCAieTEiLCAieDIiLCAieTIiLCAiZWxib3ciLCAic2VnIiwgImFicyIsICJMT09LIiwgImRvbmUiLCAiZ29sZEhpIiwgIm9wZW4iLCAic2xhdGVIaSIsICJsb2NrZWQiLCAiZmFpbnQiLCAiaG92ZXIiLCAic2V0SG92ZXIiLCAibG9vayIsICJzdGF0dXMiLCAicGx1cmFsIiwgImJ1dHRvbiIsICJ1bmRlZmluZWQiLCAib25Qb2ludGVyRW50ZXIiLCAib25Qb2ludGVyTGVhdmUiLCAiZ2FwIiwgInBhZGRpbmciLCAiYm94U2hhZG93IiwgImJsdXJSYWRpdXMiLCAieU9mZnNldCIsICJob3ZlclN0eWxlIiwgIk1lZGFsbGlvbiIsICJzaXplIiwgImlubmVyIiwgIm91dGVyIiwgImluayIsICJyaW5nIiwgIkljb24iLCAiaWNvbiIsICJjYXBzIiwgImxpbmVCcmVhayIsICJtdXRlZCIsICJ1bmxvY2tzIiwgInUiLCAianVzdGlmeUNvbnRlbnQiLCAidG9uZSIsICJUaXAiLCAiam9pbiIsICJib29zdCIsICJzaWRlIiwgIm9mZnNldCIsICJBcHAiLCAid2luIiwgInVzZVdpbmRvd1NpemUiLCAid29ybGQiLCAic2V0V29ybGQiLCAidXNlU3RhdGUiLCAidXNlRWZmZWN0IiwgImJldnkiLCAibWFwIiwgInRoZW4iLCAid2lkdGgiLCAiX2pzeCIsICJDaXZpbGl6YXRpb24iLCAiaGVpZ2h0IiwgIlRJVExFUyIsICJ0ZWNoIiwgInJlcG9ydHMiLCAicmFua2luZ3MiLCAiZ2FtZSIsICJkaXNwYXRjaCIsICJ1c2VSZWR1Y2VyIiwgImciLCAiYSIsICJzdGVwIiwgIm5ld0dhbWUiLCAic2NyZWVuIiwgInNldFNjcmVlbiIsICJ0YWJzIiwgInNldFRhYnMiLCAiUkVQT1JUX1RBQlMiLCAiUkFOS0lOR19UQUJTIiwgInNlbGVjdGlvbiIsICJzZXRTZWxlY3Rpb24iLCAiaG92ZXIiLCAic2V0SG92ZXIiLCAiYnVzeSIsICJzZXRCdXN5IiwgImxlbnMiLCAic2V0TGVucyIsICJwbGF5ZXIiLCAiY2l2cyIsICJjaXYiLCAiaWQiLCAiZmluZCIsICJjIiwgImNpdHkiLCAia2luZCIsICJjaXRpZXMiLCAidW5kZWZpbmVkIiwgInVuaXQiLCAidW5pdHMiLCAidSIsICJzZWxlY3QiLCAicyIsICJhdCIsICJ0aWxlIiwgImNvbCIsICJyb3ciLCAiZm9jdXMiLCAiem9vbSIsICJuZXh0VHVybiIsICJyZXNlYXJjaCIsICJzZXRUaW1lb3V0IiwgInR5cGUiLCAidG9nZ2xlTGVucyIsICJwb2xpdGljYWwiLCAidXNlRXZlbnQiLCAic2V0dGxlbWVudCIsICJlIiwgInJlcGVhdCIsICJrZXkiLCAidXNlRGVidWciLCAidCIsICJpbmNsdWRlcyIsICJib3hXIiwgIk1hdGgiLCAibWluIiwgImJveEgiLCAibGFiZWwiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJfRnJhZ21lbnQiLCAiQmFubmVycyIsICJvblNlbGVjdCIsICJUaWxlVG9vbHRpcCIsICJjdXJzb3IiLCAiQ2l0eVBhbmVsIiwgIm9uQ2xvc2UiLCAiTGF1bmNoQmFyIiwgIm9uT3BlbiIsICJUcmFja2VycyIsICJvblJlc2VhcmNoIiwgIkxlYWRlcnMiLCAicml2YWxzIiwgInNsaWNlIiwgIk5vdGlmaWNhdGlvbnMiLCAibm90ZXMiLCAib25EaXNtaXNzIiwgIkFjdGlvblBhbmVsIiwgIm9uTmV4dCIsICJvbkxlbnMiLCAiVW5pdFBhbmVsIiwgIlNjcmVlbiIsICJ0aXRsZSIsICJ0YWIiLCAib25UYWIiLCAiVGVjaFRyZWUiLCAiUmVwb3J0cyIsICJSYW5raW5ncyIsICJUb3BCYXIiLCAibmV0IiwgImxlZGdlciIsICJtb3VudCIsICJfanN4IiwgIkFwcCJdCn0K
