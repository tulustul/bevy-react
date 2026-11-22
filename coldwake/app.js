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
  var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
  var import_bevy_react6 = __toESM(require_bevy_react(), 1);

  // src/App.tsx
  var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
  var import_react17 = __toESM(require_react(), 1);

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
    door: {
      unlock(value) {
        emit("door.unlock", value);
      }
    },
    elevator: {
      call(value) {
        emit("elevator.call", value);
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
    hack: {
      shock(value) {
        emit("hack.shock", value);
      }
    },
    holo: {
      open(value) {
        emit("holo.open", value);
      }
    },
    locator: {
      show(value) {
        emit("locator.show", value);
      }
    },
    map: {
      mark(value) {
        emit("map.mark", value);
      },
      orbit(value) {
        emit("map.orbit", value);
      },
      zoom(value) {
        emit("map.zoom", value);
      }
    },
    player: {
      sync(value) {
        emit("player.sync", value);
      }
    },
    preview: {
      show(value) {
        emit("preview.show", value);
      }
    },
    sound: {
      cue(value) {
        emit("sound.cue", value);
      }
    },
    suit: {
      heal(value) {
        emit("suit.heal", value);
      },
      hit(value) {
        emit("suit.hit", value);
      },
      stasis(value) {
        emit("suit.stasis", value);
      },
      vacuum(value) {
        emit("suit.vacuum", value);
      }
    },
    weapon: {
      equip(value) {
        emit("weapon.equip", value);
      },
      fire(value) {
        emit("weapon.fire", value);
      },
      reload(value) {
        emit("weapon.reload", value);
      }
    },
    window: {
      size() {
        return request("window.size", null);
      }
    }
  };

  // src/game/lore.ts
  var OBJECTIVES = [
    {
      to: "store",
      title: "RESUPPLY",
      text: "The maintenance store on Concourse C still has power. Buy what the suit needs."
    },
    {
      to: "bench",
      title: "UPGRADE THE ARC CUTTER",
      text: "Power a node in the cutter's circuit at the upgrade bench."
    },
    {
      to: "bulkhead",
      title: "OVERRIDE THE BULKHEAD",
      text: "The way to Concourse D is sealed. Bypass the lock at its hack panel."
    },
    {
      to: "elevator",
      title: "REACH THE REFINERY",
      text: "Ride the freight elevator down to deck 3. Someone there is still transmitting."
    }
  ];
  var LOGS = [
    {
      id: "shift-roster",
      title: "SHIFT ROSTER 7-C",
      from: "Concourse C Supervisor",
      audio: false,
      text: "Night crew short four again. Petrov and the Wan sisters reported to medical with the headaches, Abara never clocked in. Ice output down 30% on the week. If Halden asks, it's the drills."
    },
    {
      id: "maintenance-note",
      title: "WORK ORDER 2291",
      from: "Facilities",
      audio: false,
      text: "Bulkhead C-D lock rejecting every badge since 02:14. Manual override sits behind the panel left of the frame: three tumblers, rotary. Do NOT force it while the panel is live."
    },
    {
      id: "store-ledger",
      title: "STORE LEDGER",
      from: "Concourse C Store",
      audio: false,
      text: "Every medpack in the district sold in six hours. Air canisters gone by noon. Nobody bought ammunition. Nobody needed to, yet."
    },
    {
      id: "okafor-1",
      title: "MESSAGE FROM DECK 3",
      from: "Dr. Ines Varga",
      audio: true,
      text: "Okafor, if this reaches you \u2014 don't trust the elevator logs. The refinery isn't empty. We sealed ourselves in the control room. Bring cutter cells. Bring all of them."
    },
    {
      id: "okafor-2",
      title: "HALDEN PRIORITY",
      from: "Halden Ice & Ore",
      audio: true,
      text: "Engineer T. Okafor: your contract obliges you to restore Concourse D access. Station quarantine is a precaution. Production resumes at the next shift."
    }
  ];

  // src/game/bench.ts
  var BENCH_TARGETS = [
    "cutter",
    "pulse",
    "rail",
    "rig"
  ];
  var BOARD = [
    [
      "start",
      0,
      1,
      [
        "a"
      ]
    ],
    [
      "a",
      1,
      1,
      [
        "start",
        "b",
        "a2"
      ]
    ],
    [
      "a2",
      1,
      0,
      [
        "a"
      ]
    ],
    [
      "b",
      2,
      1,
      [
        "a",
        "c",
        "b2"
      ]
    ],
    [
      "b2",
      2,
      2,
      [
        "b"
      ]
    ],
    [
      "c",
      3,
      1,
      [
        "b",
        "d",
        "c2"
      ]
    ],
    [
      "c2",
      3,
      0,
      [
        "c"
      ]
    ],
    [
      "d",
      4,
      1,
      [
        "c",
        "e",
        "d2"
      ]
    ],
    [
      "d2",
      4,
      2,
      [
        "d"
      ]
    ],
    [
      "e",
      5,
      1,
      [
        "d"
      ]
    ]
  ];
  function circuit(kinds) {
    return BOARD.map(([id, x, y, links]) => ({
      id,
      x,
      y,
      links,
      kind: id === "start" ? "start" : kinds[id] ?? "empty"
    }));
  }
  var CIRCUITS = {
    cutter: circuit({
      a: "damage",
      a2: "reload",
      b: "capacity",
      b2: "capacity",
      c2: "reload",
      d: "damage",
      d2: "capacity",
      e: "special"
    }),
    pulse: circuit({
      a: "capacity",
      a2: "damage",
      b: "reload",
      b2: "capacity",
      c: "damage",
      d2: "reload",
      d: "capacity",
      e: "special"
    }),
    rail: circuit({
      a: "damage",
      a2: "capacity",
      b2: "reload",
      c: "damage",
      c2: "capacity",
      d: "reload",
      e: "special"
    }),
    rig: circuit({
      a: "damage",
      a2: "capacity",
      b: "reload",
      c: "capacity",
      c2: "damage",
      d2: "reload",
      d: "damage",
      e: "special"
    })
  };
  var STAT_NAMES = {
    cutter: names("DAMAGE", "CAPACITY", "RELOAD", "SUPERHEATED ARC"),
    pulse: names("DAMAGE", "CAPACITY", "RELOAD", "DRIVER MINE"),
    rail: names("DAMAGE", "CAPACITY", "RELOAD", "PINNING SPIKE"),
    rig: names("ARMOR", "AIR", "STASIS", "AUTO-STASIS")
  };
  function names(damage, capacity, reload2, special) {
    return {
      start: "INPUT",
      empty: "JUNCTION",
      damage,
      capacity,
      reload: reload2,
      special
    };
  }
  var STATS = {
    cutter: {
      damage: [
        10,
        3
      ],
      capacity: [
        10,
        2
      ],
      reload: [
        1.6,
        -0.2
      ]
    },
    pulse: {
      damage: [
        6,
        1
      ],
      capacity: [
        25,
        5
      ],
      reload: [
        2,
        -0.25
      ]
    },
    rail: {
      damage: [
        30,
        8
      ],
      capacity: [
        4,
        1
      ],
      reload: [
        2.4,
        -0.3
      ]
    },
    rig: {
      damage: [
        0,
        10
      ],
      capacity: [
        60,
        15
      ],
      reload: [
        4,
        1
      ]
    }
  };
  function stats(target, installed) {
    const nodes = CIRCUITS[target].filter((n) => installed.includes(n.id));
    const count = (kind) => nodes.filter((n) => n.kind === kind).length;
    const s = STATS[target];
    const at = ([base, step], kind) => Math.round((base + step * count(kind)) * 100) / 100;
    return {
      damage: at(s.damage, "damage"),
      capacity: at(s.capacity, "capacity"),
      reload: at(s.reload, "reload"),
      special: count("special") > 0
    };
  }
  function canInstall(target, installed, node) {
    if (node === "start" || installed.includes(node)) return false;
    const n = CIRCUITS[target].find((c) => c.id === node);
    return !!n && n.links.some((l) => l === "start" || installed.includes(l));
  }

  // src/game/items.ts
  var ITEMS = {
    "medpack-s": {
      name: "Small Medpack",
      kind: "health",
      price: 1500,
      stack: 5,
      text: "Restores a quarter of the suit's vitals."
    },
    "medpack-m": {
      name: "Medium Medpack",
      kind: "health",
      price: 3500,
      stack: 5,
      text: "Restores half of the suit's vitals."
    },
    "medpack-l": {
      name: "Large Medpack",
      kind: "health",
      price: 7500,
      stack: 5,
      text: "Restores the suit's vitals in full."
    },
    "stasis-pack": {
      name: "Stasis Pack",
      kind: "stasis",
      price: 2e3,
      stack: 3,
      text: "Refills the stasis module."
    },
    "air-canister": {
      name: "Air Canister",
      kind: "air",
      price: 1200,
      stack: 3,
      text: "Thirty seconds of air for the suit's tanks."
    },
    "cutter-ammo": {
      name: "Arc Cutter Cells",
      kind: "ammo",
      price: 800,
      stack: 25,
      text: "Charge cells for the Arc Cutter. Ten shots a cell."
    },
    "pulse-ammo": {
      name: "Pulse Driver Rounds",
      kind: "ammo",
      price: 1500,
      stack: 250,
      text: "Caseless rounds for the Pulse Driver."
    },
    "rail-ammo": {
      name: "Rail Spikes",
      kind: "ammo",
      price: 2200,
      stack: 10,
      text: "Tungsten spikes for the Rail Spike."
    },
    "power-cell": {
      name: "Power Cell",
      kind: "upgrade",
      price: 1e4,
      stack: 10,
      text: "Powers one circuit node at an upgrade bench."
    },
    semiconductor: {
      name: "Semiconductor",
      kind: "valuable",
      price: 3e3,
      stack: 5,
      text: "Salvaged from a dead reactor. Worth something at a store."
    },
    cutter: {
      name: "Arc Cutter",
      kind: "weapon",
      price: 0,
      stack: 1,
      text: "Halden mining tool. Three emitters cut a line of plasma."
    },
    pulse: {
      name: "Pulse Driver",
      kind: "weapon",
      price: 12e3,
      stack: 1,
      text: "Station security rifle. Fast, wide spread."
    },
    rail: {
      name: "Rail Spike",
      kind: "weapon",
      price: 18e3,
      stack: 1,
      text: "Survey spike launcher, repurposed. Pins what it hits."
    }
  };
  var ITEM_IDS = Object.keys(ITEMS);
  var WEAPONS = [
    "cutter",
    "pulse",
    "rail"
  ];
  var WEAPON_AMMO = {
    cutter: {
      ammo: "cutter-ammo",
      perItem: 10
    },
    pulse: {
      ammo: "pulse-ammo",
      perItem: 25
    },
    rail: {
      ammo: "rail-ammo",
      perItem: 4
    }
  };
  var PACK_SLOTS = 12;
  function initialPack() {
    const slots = [
      {
        item: "medpack-s",
        count: 2
      },
      {
        item: "medpack-m",
        count: 1
      },
      {
        item: "stasis-pack",
        count: 1
      },
      {
        item: "air-canister",
        count: 1
      },
      {
        item: "cutter-ammo",
        count: 3
      },
      {
        item: "power-cell",
        count: 2
      },
      {
        item: "semiconductor",
        count: 2
      }
    ];
    while (slots.length < PACK_SLOTS) slots.push(null);
    return {
      slots,
      credits: 14250,
      safe: [
        {
          item: "medpack-l",
          count: 1
        },
        {
          item: "pulse-ammo",
          count: 1
        }
      ]
    };
  }
  function countItem(pack, item) {
    return pack.slots.reduce((n, s) => s?.item === item ? n + s.count : n, 0);
  }
  function addItem(pack, item, n = 1) {
    const slots = pack.slots.map((s) => s ? {
      ...s
    } : null);
    const stack = ITEMS[item].stack;
    let left = n;
    for (const s of slots) {
      if (left > 0 && s?.item === item && s.count < stack) {
        const take = Math.min(stack - s.count, left);
        s.count += take;
        left -= take;
      }
    }
    for (let i = 0; i < slots.length && left > 0; i++) {
      if (!slots[i]) {
        const take = Math.min(stack, left);
        slots[i] = {
          item,
          count: take
        };
        left -= take;
      }
    }
    return left > 0 ? null : {
      ...pack,
      slots
    };
  }
  function takeItem(pack, item, n = 1) {
    if (countItem(pack, item) < n) return null;
    let left = n;
    const slots = pack.slots.map((s) => {
      if (!s || s.item !== item || left === 0) return s;
      const take = Math.min(s.count, left);
      left -= take;
      return s.count - take > 0 ? {
        ...s,
        count: s.count - take
      } : null;
    });
    return {
      ...pack,
      slots
    };
  }
  function sellPrice(item) {
    return Math.round(ITEMS[item].price * 0.5);
  }
  function credits(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // src/game/reduce.ts
  var HEALS = {
    "medpack-s": 0.25,
    "medpack-m": 0.5,
    "medpack-l": 1
  };
  var HIT = 0.15;
  var STASIS_COST = 0.25;
  var SUFFOCATE = 0.05;
  function clipSize(g2, weapon) {
    return stats(weapon, g2.bench[weapon]).capacity;
  }
  function airMax(g2) {
    return stats("rig", g2.bench.rig).capacity;
  }
  function reserve(g2, weapon) {
    const { ammo, perItem } = WEAPON_AMMO[weapon];
    return countItem(g2.pack, ammo) * perItem;
  }
  function objective(g2) {
    if (!g2.story.bought) return 0;
    if (g2.bench.cutter.length === 0) return 1;
    if (g2.fixtures.door === "locked") return 2;
    return OBJECTIVES.length - 1;
  }
  function reduce(g2, a) {
    switch (a.type) {
      case "near": {
        const { near } = g2.here;
        if (near.includes(a.surface) === a.on) return g2;
        const next = a.on ? [
          ...near,
          a.surface
        ] : near.filter((s) => s !== a.surface);
        return {
          ...g2,
          here: {
            ...g2.here,
            near: next
          }
        };
      }
      case "stance": {
        const { aiming, mouse, screen: screen2, offer } = a;
        return {
          ...g2,
          here: {
            ...g2.here,
            aiming,
            mouse,
            screen: screen2,
            offer
          }
        };
      }
      case "menu":
        if (g2.here.menu === a.open) return g2;
        return {
          ...g2,
          here: {
            ...g2.here,
            menu: a.open
          }
        };
      case "introOver":
        return g2.here.intro ? {
          ...g2,
          here: {
            ...g2.here,
            intro: false
          }
        } : g2;
      case "hit": {
        const armor = stats("rig", g2.bench.rig).damage / 100;
        const health = Math.max(0, g2.suit.health - HIT * (1 - armor));
        return {
          ...g2,
          suit: {
            ...g2.suit,
            health
          }
        };
      }
      case "heal": {
        const amount = HEALS[a.item];
        if (!amount || g2.suit.health >= 1) return g2;
        const pack = takeItem(g2.pack, a.item);
        if (!pack) return g2;
        const health = Math.min(1, g2.suit.health + amount);
        return {
          ...g2,
          pack,
          suit: {
            ...g2.suit,
            health
          }
        };
      }
      case "stasis":
        if (g2.suit.stasis < STASIS_COST) return g2;
        return {
          ...g2,
          suit: {
            ...g2.suit,
            stasis: g2.suit.stasis - STASIS_COST
          }
        };
      case "stasisRefill": {
        if (g2.suit.stasis >= 1) return g2;
        const pack = takeItem(g2.pack, "stasis-pack");
        return pack ? {
          ...g2,
          pack,
          suit: {
            ...g2.suit,
            stasis: 1
          }
        } : g2;
      }
      case "vacuum":
        if (g2.suit.vacuum === a.on) return g2;
        return {
          ...g2,
          // The tanks refill in air, so a vent always starts them full.
          suit: {
            ...g2.suit,
            vacuum: a.on,
            air: airMax(g2)
          }
        };
      case "air": {
        if (!g2.suit.vacuum) return g2;
        const air = Math.max(0, g2.suit.air - a.dt);
        const health = air > 0 ? g2.suit.health : Math.max(0, g2.suit.health - SUFFOCATE * a.dt);
        return {
          ...g2,
          suit: {
            ...g2.suit,
            air,
            health
          }
        };
      }
      case "airRefill": {
        const max = airMax(g2);
        if (g2.suit.air >= max) return g2;
        const pack = takeItem(g2.pack, "air-canister");
        if (!pack) return g2;
        return {
          ...g2,
          pack,
          suit: {
            ...g2.suit,
            air: Math.min(max, g2.suit.air + 30)
          }
        };
      }
      case "fire": {
        const { weapon, clip } = g2.arms;
        if (clip[weapon] <= 0) return g2;
        return {
          ...g2,
          arms: {
            ...g2.arms,
            clip: {
              ...clip,
              [weapon]: clip[weapon] - 1
            }
          }
        };
      }
      case "reload": {
        const { weapon, clip } = g2.arms;
        const size = clipSize(g2, weapon);
        if (clip[weapon] >= size) return g2;
        const pack = takeItem(g2.pack, WEAPON_AMMO[weapon].ammo);
        if (!pack) return g2;
        return {
          ...g2,
          pack,
          arms: {
            ...g2.arms,
            clip: {
              ...clip,
              [weapon]: size
            }
          }
        };
      }
      case "equip":
        if (!g2.arms.owned.includes(a.weapon) || g2.arms.weapon === a.weapon) return g2;
        return {
          ...g2,
          arms: {
            ...g2.arms,
            weapon: a.weapon
          }
        };
      case "buy": {
        const item = ITEMS[a.item];
        if (item.price > g2.pack.credits) return g2;
        const credits2 = g2.pack.credits - item.price;
        const story = {
          ...g2.story,
          bought: true
        };
        if (item.kind === "weapon") {
          const weapon = a.item;
          if (g2.arms.owned.includes(weapon)) return g2;
          return {
            ...g2,
            story,
            pack: {
              ...g2.pack,
              credits: credits2
            },
            arms: {
              ...g2.arms,
              owned: [
                ...g2.arms.owned,
                weapon
              ]
            }
          };
        }
        const pack = addItem(g2.pack, a.item);
        return pack ? {
          ...g2,
          story,
          pack: {
            ...pack,
            credits: credits2
          }
        } : g2;
      }
      case "sell": {
        const slot = g2.pack.slots[a.slot];
        if (!slot) return g2;
        const pack = takeItem(g2.pack, slot.item);
        if (!pack) return g2;
        return {
          ...g2,
          pack: {
            ...pack,
            credits: pack.credits + sellPrice(slot.item)
          }
        };
      }
      case "stow": {
        const slot = g2.pack.slots[a.slot];
        if (!slot) return g2;
        const slots = g2.pack.slots.map((s, i) => i === a.slot ? null : s);
        const kept = g2.pack.safe.find((s) => s.item === slot.item);
        const safe = kept ? g2.pack.safe.map((s) => s === kept ? {
          ...s,
          count: s.count + slot.count
        } : s) : [
          ...g2.pack.safe,
          slot
        ];
        return {
          ...g2,
          pack: {
            ...g2.pack,
            slots,
            safe
          }
        };
      }
      case "retrieve": {
        const stored = g2.pack.safe[a.index];
        if (!stored) return g2;
        const pack = addItem(g2.pack, stored.item, stored.count);
        if (!pack) return g2;
        return {
          ...g2,
          pack: {
            ...pack,
            safe: g2.pack.safe.filter((_, i) => i !== a.index)
          }
        };
      }
      case "install": {
        const installed = g2.bench[a.target];
        if (!canInstall(a.target, installed, a.node)) return g2;
        const pack = takeItem(g2.pack, "power-cell");
        if (!pack) return g2;
        return {
          ...g2,
          pack,
          bench: {
            ...g2.bench,
            [a.target]: [
              ...installed,
              a.node
            ]
          }
        };
      }
      case "read":
        if (g2.story.read.includes(a.log)) return g2;
        return {
          ...g2,
          story: {
            ...g2.story,
            read: [
              ...g2.story.read,
              a.log
            ]
          }
        };
      case "unlock":
        if (g2.fixtures.door !== "locked") return g2;
        return {
          ...g2,
          fixtures: {
            ...g2.fixtures,
            door: "unlocked"
          }
        };
      case "opened":
        return {
          ...g2,
          fixtures: {
            ...g2.fixtures,
            door: "open"
          }
        };
      case "save": {
        const id = (g2.fixtures.saves.at(-1)?.id ?? 0) + 1;
        const copy = {
          ...g2,
          fixtures: {
            ...g2.fixtures,
            saves: []
          }
        };
        const slot = {
          id,
          time: a.time,
          objective: objective(g2),
          game: copy
        };
        return {
          ...g2,
          fixtures: {
            ...g2.fixtures,
            saves: [
              ...g2.fixtures.saves,
              slot
            ]
          }
        };
      }
      case "load": {
        const slot = g2.fixtures.saves.find((s) => s.id === a.id);
        if (!slot) return g2;
        return {
          ...slot.game,
          here: g2.here,
          fixtures: {
            ...g2.fixtures,
            locator: slot.game.fixtures.locator
          }
        };
      }
      case "call": {
        const { elevator } = g2.fixtures;
        if (elevator.target !== null || elevator.floor === a.floor) return g2;
        return {
          ...g2,
          fixtures: {
            ...g2.fixtures,
            elevator: {
              ...elevator,
              target: a.floor
            }
          }
        };
      }
      case "arrived":
        return {
          ...g2,
          fixtures: {
            ...g2.fixtures,
            elevator: {
              floor: a.floor,
              target: null
            }
          }
        };
      case "locator":
        return {
          ...g2,
          fixtures: {
            ...g2.fixtures,
            locator: a.to
          }
        };
    }
  }

  // src/game/store.ts
  var import_react = __toESM(require_react(), 1);

  // src/game/state.ts
  var DESTINATIONS = [
    "store",
    "bench",
    "save",
    "elevator",
    "bulkhead"
  ];
  function initialGame() {
    return {
      here: {
        near: [],
        aiming: false,
        mouse: true,
        screen: null,
        offer: null,
        menu: false,
        intro: true
      },
      suit: {
        health: 0.7,
        stasis: 0.75,
        vacuum: false,
        air: 60
      },
      arms: {
        weapon: "cutter",
        owned: [
          "cutter"
        ],
        clip: {
          cutter: 7,
          pulse: 25,
          rail: 4
        }
      },
      pack: initialPack(),
      bench: {
        cutter: [],
        pulse: [],
        rail: [],
        rig: []
      },
      story: {
        bought: false,
        read: []
      },
      fixtures: {
        door: "locked",
        elevator: {
          floor: 2,
          target: null
        },
        saves: [],
        locator: "store"
      }
    };
  }

  // src/game/store.ts
  var g = globalThis;
  var store = g.__coldwake ??= {
    game: initialGame(),
    listeners: /* @__PURE__ */ new Set()
  };
  function getGame() {
    return store.game;
  }
  function dispatch(action) {
    const next = reduce(store.game, action);
    if (next === store.game) return false;
    store.game = next;
    store.listeners.forEach((l) => l());
    return true;
  }
  function subscribe(listener) {
    store.listeners.add(listener);
    return () => store.listeners.delete(listener);
  }
  function useGame(select) {
    return (0, import_react.useSyncExternalStore)(subscribe, () => select ? select(store.game) : store.game);
  }

  // src/hooks.ts
  var import_react2 = __toESM(require_react(), 1);
  function useEvent(name, run) {
    const latest = (0, import_react2.useRef)(run);
    latest.current = run;
    (0, import_react2.useEffect)(() => on(name, (value) => latest.current(value)), [
      name
    ]);
  }
  function useKeys(active, run) {
    useEvent("keyDown", (e) => {
      if (active && !e.repeat) run(e);
    });
  }
  function useDebug(verb, run) {
    useEvent("debug.act", ({ action }) => {
      const [head, ...rest] = action.split(" ");
      if (head === verb) run(rest.join(" "));
    });
  }

  // src/holos/Air.tsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);

  // src/theme.ts
  var C = {
    cyan: "#7fe3ff",
    cyanHi: "#c4f6ff",
    cyanDim: "#3f93ad",
    cyanDeep: "#123a4a",
    cyanFaint: "rgba(127, 227, 255, 0.14)",
    cyanLine: "rgba(127, 227, 255, 0.45)",
    white: "#f0fdff",
    amber: "#ffb347",
    amberDim: "#a8661c",
    red: "#ff4a3d",
    redDim: "#a3261d",
    redFaint: "rgba(255, 74, 61, 0.18)",
    green: "#6dff9a",
    greenDim: "#2f9a55",
    // Fills (dark glass: they dim the room behind a hologram).
    glass: "rgba(4, 18, 28, 0.62)",
    glassHi: "rgba(10, 44, 62, 0.72)",
    shade: "rgba(1, 6, 10, 0.8)",
    clear: "rgba(0, 0, 0, 0)"
  };
  var F = {
    regular: "Saira",
    semibold: "Saira SemiBold",
    bold: "Saira Bold",
    display: "Michroma"
  };
  var T = {
    /** Hologram headers: wide, spaced capitals. */
    header: {
      fontFamily: F.display,
      fontSize: 22,
      color: C.cyan,
      letterSpacing: 2,
      lineBreak: "noWrap"
    },
    /** Tabs, buttons, list rows. */
    label: {
      fontFamily: F.semibold,
      fontSize: 20,
      color: C.cyan,
      letterSpacing: 1,
      lineBreak: "noWrap"
    },
    /** Body copy. */
    body: {
      fontFamily: F.regular,
      fontSize: 18,
      color: C.cyan,
      lineHeight: 1.35
    },
    /** Small print: hints, captions, stat names. */
    small: {
      fontFamily: F.regular,
      fontSize: 14,
      color: C.cyanDim,
      letterSpacing: 1
    },
    /** Big numbers (ammo, credits, timers). */
    number: {
      fontFamily: F.display,
      fontSize: 40,
      color: C.cyan,
      lineBreak: "noWrap"
    }
  };
  var frame = {
    border: 1,
    borderColor: C.cyanLine,
    backgroundColor: C.glass
  };

  // src/holos/Holo.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
  var import_react3 = __toESM(require_react(), 1);
  var import_bevy_react2 = __toESM(require_bevy_react(), 1);

  // src/sound.ts
  function cue(name) {
    bevy.sound.cue({
      name
    });
  }

  // src/game/act.ts
  var glitchers = /* @__PURE__ */ new Set();
  function glitch(surface) {
    glitchers.forEach((run) => run(surface));
  }
  function onGlitch(run) {
    glitchers.add(run);
    return () => {
      glitchers.delete(run);
    };
  }
  function deny(surface) {
    cue("deny");
    glitch(surface);
  }
  function hit() {
    dispatch({
      type: "hit"
    });
    cue("hit");
    bevy.suit.hit(null);
    glitch("spine");
    glitch("stasis");
  }
  function heal() {
    const { pack, suit } = getGame();
    const missing = 1 - suit.health;
    const have = [
      "medpack-s",
      "medpack-m",
      "medpack-l"
    ].filter((id) => pack.slots.some((s) => s?.item === id));
    const fit = [
      ...have
    ].reverse().find((id) => (HEALS[id] ?? 1) <= missing + 0.01);
    const item = fit ?? have[0];
    if (item && dispatch({
      type: "heal",
      item
    })) {
      cue("heal");
      bevy.suit.heal(null);
    } else {
      deny("spine");
    }
  }
  function use(slot) {
    const item = getGame().pack.slots[slot]?.item;
    if (!item) return;
    const kind = ITEMS[item].kind;
    if (kind === "health") {
      if (dispatch({
        type: "heal",
        item
      })) {
        cue("heal");
        bevy.suit.heal(null);
        return;
      }
    } else if (kind === "stasis") {
      if (dispatch({
        type: "stasisRefill"
      })) return cue("stasis");
    } else if (kind === "air") {
      if (dispatch({
        type: "airRefill"
      })) return cue("select");
    } else if (kind === "ammo") {
      const weapon = WEAPONS.find((w) => item === `${w}-ammo`);
      if (weapon === getGame().arms.weapon) return reload();
    }
    deny("menu");
  }
  function stasis() {
    if (dispatch({
      type: "stasis"
    })) {
      cue("stasis");
      bevy.suit.stasis(null);
    } else {
      deny("stasis");
    }
  }
  function vacuum(on2 = !getGame().suit.vacuum) {
    dispatch({
      type: "vacuum",
      on: on2
    });
  }
  function fire() {
    if (dispatch({
      type: "fire"
    })) {
      cue("fire");
      bevy.weapon.fire(null);
    } else {
      cue("dryFire");
      glitch("ammo");
    }
  }
  function reload() {
    if (dispatch({
      type: "reload"
    })) {
      cue("reload");
      bevy.weapon.reload(null);
    } else {
      deny("ammo");
    }
  }
  function equip(weapon) {
    if (dispatch({
      type: "equip",
      weapon
    })) cue("equip");
  }
  function swap() {
    const { owned, weapon } = getGame().arms;
    const order = WEAPONS.filter((w) => owned.includes(w));
    equip(order[(order.indexOf(weapon) + 1) % order.length]);
  }
  function buy(item) {
    if (dispatch({
      type: "buy",
      item
    })) cue("buy");
    else deny("store");
  }
  function sell(slot) {
    if (dispatch({
      type: "sell",
      slot
    })) cue("buy");
    else deny("store");
  }
  function stow(slot) {
    if (dispatch({
      type: "stow",
      slot
    })) cue("select");
    else deny("store");
  }
  function retrieve(index) {
    if (dispatch({
      type: "retrieve",
      index
    })) cue("select");
    else deny("store");
  }
  function install(target, node) {
    if (dispatch({
      type: "install",
      target,
      node
    })) cue("install");
    else deny("bench");
  }
  function read(log) {
    dispatch({
      type: "read",
      log
    });
  }
  function unlock() {
    if (dispatch({
      type: "unlock"
    })) {
      cue("unlock");
      bevy.door.unlock(null);
    }
  }
  function shock() {
    cue("shock");
    bevy.hack.shock(null);
    glitch("hack");
  }
  function save() {
    const now = /* @__PURE__ */ new Date();
    const time = [
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    ].map((n) => String(n).padStart(2, "0")).join(":");
    dispatch({
      type: "save",
      time
    });
    cue("save");
  }
  function load(id) {
    if (dispatch({
      type: "load",
      id
    })) cue("save");
  }
  function call(floor) {
    if (dispatch({
      type: "call",
      floor
    })) {
      cue("select");
      bevy.elevator.call({
        floor
      });
    } else {
      deny("elevator");
    }
  }
  function locate(to = OBJECTIVES[objective(getGame())].to) {
    dispatch({
      type: "locator",
      to
    });
    cue("locator");
    bevy.locator.show({
      to
    });
  }
  function nextDestination() {
    const at = DESTINATIONS.indexOf(getGame().fixtures.locator);
    locate(DESTINATIONS[(at + 1) % DESTINATIONS.length]);
  }

  // src/holos/hint.ts
  var USE = {
    store: "use the store",
    bench: "use the bench",
    save: "use the save station",
    elevator: "use the lift panel",
    hack: "bypass the lock",
    controls: "read the terminal"
  };
  function hint(g2) {
    const { mouse, screen: screen2, offer, aiming, intro } = g2.here;
    if (!mouse) return {
      id: "click",
      keys: [
        [
          "CLICK",
          "take the mouse"
        ]
      ]
    };
    if (screen2 || aiming) return null;
    if (offer) return {
      id: offer,
      keys: [
        [
          "F",
          USE[offer] ?? "use it"
        ]
      ]
    };
    if (intro) return {
      id: "intro",
      keys: [
        [
          "WASD",
          "move"
        ],
        [
          "RMB",
          "aim"
        ],
        [
          "TAB",
          "suit menu"
        ]
      ]
    };
    return null;
  }

  // src/holos/open.ts
  var PANELS = [
    "store",
    "bench",
    "save",
    "elevator",
    "hack",
    "controls"
  ];
  function openHolos(g2) {
    const open = [
      "spine",
      "stasis",
      "floor",
      ...PANELS
    ];
    if (g2.fixtures.door !== "open") open.push("lock");
    if (g2.suit.vacuum) open.push("air");
    if (g2.here.aiming) open.push("ammo");
    if (g2.here.menu) open.push("menu");
    if (hint(g2)) open.push("prompt");
    return open;
  }
  function isLive(g2, name) {
    if (PANELS.includes(name)) return g2.here.near.includes(name);
    return openHolos(g2).includes(name);
  }

  // src/holos/Holo.tsx
  var LINGER_MS = 400;
  function useLive(name) {
    return useGame((g2) => isLive(g2, name));
  }
  function useHeld(name) {
    return useGame((g2) => g2.here.screen === name);
  }
  function Holo({ name, page, seed = 0, style, children }) {
    const open = useGame((g2) => openHolos(g2).includes(name));
    const [mounted, setMounted] = (0, import_react3.useState)(open);
    (0, import_react3.useEffect)(() => {
      if (open) return setMounted(true);
      const t = setTimeout(() => setMounted(false), LINGER_MS);
      return () => clearTimeout(t);
    }, [
      open
    ]);
    const burst = (0, import_bevy_react2.useSharedValue)(0);
    (0, import_react3.useEffect)(() => onGlitch((surface) => {
      if (surface !== name) return;
      burst.value = (0, import_bevy_react2.withSequence)((0, import_bevy_react2.withTiming)(1, {
        duration: 0
      }), (0, import_bevy_react2.withTiming)(0, {
        duration: 480,
        easing: "easeOut"
      }));
    }), [
      name,
      burst
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("surface", {
      target: name,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("node", {
        style: {
          width: "100%",
          height: "100%",
          ...style,
          filter: [
            {
              name: "holoNoise",
              params: {
                seed
              }
            },
            {
              name: "glitch",
              params: {
                intensity: {
                  animated: burst,
                  seed: 1
                },
                seed: seed + 1
              }
            }
          ],
          ...page === void 0 ? {} : {
            morphFilter: {
              key: page,
              name: "scanSwap"
            },
            transition: {
              morphFilter: {
                duration: 380,
                easing: "easeInOut"
              }
            }
          }
        },
        children: mounted && children
      })
    });
  }

  // src/holos/suit/loops.ts
  var import_react4 = __toESM(require_react(), 1);
  var import_bevy_react3 = __toESM(require_bevy_react(), 1);
  function useBlink(on2, ms = 450, low = 0.2) {
    const v = (0, import_bevy_react3.useSharedValue)(1);
    (0, import_react4.useEffect)(() => {
      v.value = on2 ? (0, import_bevy_react3.withRepeat)((0, import_bevy_react3.withTiming)(low, {
        duration: ms,
        easing: "easeInOut"
      }), {
        reverse: true
      }) : (0, import_bevy_react3.withTiming)(1, {
        duration: 150
      });
    }, [
      on2,
      v,
      ms,
      low
    ]);
    return v;
  }
  function useSpin(secs) {
    const v = (0, import_bevy_react3.useSharedValue)(0);
    (0, import_react4.useEffect)(() => {
      v.value = (0, import_bevy_react3.withRepeat)((0, import_bevy_react3.withTiming)(secs > 0 ? 360 : -360, {
        duration: Math.abs(secs) * 1e3,
        easing: "linear"
      }));
    }, [
      secs,
      v
    ]);
    return v;
  }

  // src/holos/Air.tsx
  var LOW = 15;
  function clock(secs) {
    const s = Math.ceil(secs);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }
  function Air() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Holo, {
      name: "air",
      seed: 7,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AirTimer, {})
    });
  }
  function AirTimer() {
    const air = useGame((g2) => g2.suit.air);
    const max = useGame(airMax);
    const low = air < LOW;
    const color = low ? C.red : C.cyan;
    const blink = useBlink(low, 280, 0.25);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("node", {
      style: {
        width: "100%",
        height: "100%",
        padding: {
          left: 14,
          right: 12,
          top: 8,
          bottom: 10
        },
        flexDirection: "column",
        justifyContent: "spaceBetween",
        backgroundColor: C.glass,
        border: {
          left: 3,
          top: 1,
          right: 1,
          bottom: 1
        },
        borderColor: low ? C.redDim : C.cyanLine,
        opacity: {
          animated: blink
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("node", {
          style: {
            flexDirection: "row",
            justifyContent: "spaceBetween"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 13,
                letterSpacing: 2.5,
                color,
                lineBreak: "noWrap"
              },
              children: "O2 SUPPLY"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 13,
                letterSpacing: 2.5,
                color: C.red,
                lineBreak: "noWrap"
              },
              children: "VACUUM"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", {
          style: {
            fontFamily: F.display,
            fontSize: 38,
            color: low ? C.red : C.white,
            lineBreak: "noWrap"
          },
          children: clock(air)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
          style: {
            height: 6,
            border: 1,
            borderColor: low ? C.redDim : C.cyanDim
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("node", {
            style: {
              width: `${Math.max(0, Math.min(1, air / max)) * 100}%`,
              height: "100%",
              backgroundColor: color
            }
          })
        })
      ]
    });
  }

  // src/holos/Ammo.tsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
  var MAX_PIPS = 12;
  function Ammo() {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Holo, {
      name: "ammo",
      seed: 11,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AmmoCount, {})
    });
  }
  function AmmoCount() {
    const weapon = useGame((g2) => g2.arms.weapon);
    const clip = useGame((g2) => g2.arms.clip[g2.arms.weapon]);
    const size = useGame((g2) => clipSize(g2, g2.arms.weapon));
    const spare = useGame((g2) => reserve(g2, g2.arms.weapon));
    const empty = clip === 0;
    const blink = useBlink(empty, 300, 0.15);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
      style: {
        width: "100%",
        height: "100%",
        padding: {
          horizontal: 12,
          vertical: 8
        },
        flexDirection: "column",
        justifyContent: "spaceBetween"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            flexDirection: "row",
            justifyContent: "spaceBetween",
            alignItems: "center"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 13,
                letterSpacing: 2,
                color: C.cyan,
                lineBreak: "noWrap"
              },
              children: ITEMS[weapon].name.toUpperCase()
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(TriDot, {})
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "flexEnd",
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
              style: {
                fontFamily: F.display,
                fontSize: 50,
                color: empty ? C.red : C.white,
                lineBreak: "noWrap"
              },
              children: String(clip).padStart(2, "0")
            }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("node", {
              style: {
                flexDirection: "column",
                padding: {
                  bottom: 8
                }
              },
              children: [
                empty ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                  style: {
                    fontFamily: F.bold,
                    fontSize: 15,
                    letterSpacing: 2,
                    color: C.red,
                    opacity: {
                      animated: blink
                    },
                    lineBreak: "noWrap"
                  },
                  children: "RELOAD"
                }) : null,
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", {
                  style: {
                    fontFamily: F.display,
                    fontSize: 16,
                    color: C.cyanDim,
                    lineBreak: "noWrap"
                  },
                  children: `/ ${spare}`
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Rounds, {
          clip,
          size
        })
      ]
    });
  }
  function Rounds({ clip, size }) {
    if (size > MAX_PIPS) {
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
        style: {
          height: 5,
          border: 1,
          borderColor: C.cyanDim
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
          style: {
            width: `${clip / size * 100}%`,
            height: "100%",
            backgroundColor: C.cyan
          }
        })
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
      style: {
        flexDirection: "row",
        gap: 3,
        height: 7
      },
      children: Array.from({
        length: size
      }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("node", {
        style: {
          flexGrow: 1,
          height: "100%",
          backgroundColor: i < clip ? C.cyan : C.clear,
          border: 1,
          borderColor: i < clip ? C.cyanHi : C.cyanDim
        }
      }, i))
    });
  }
  function TriDot() {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", {
      viewBox: "0 0 30 8",
      style: {
        width: 30,
        height: 8
      },
      children: [
        4,
        15,
        26
      ].map((x) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", {
        cx: x,
        cy: 4,
        r: 2.6,
        fill: C.red
      }, x))
    });
  }

  // src/holos/Bench.tsx
  var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
  var import_react6 = __toESM(require_react(), 1);

  // src/holos/bench/Circuit.tsx
  var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
  var import_react5 = __toESM(require_react(), 1);
  var import_bevy_react4 = __toESM(require_bevy_react(), 1);
  var BOARD2 = {
    width: 780,
    height: 450
  };
  var CELL = {
    x: BOARD2.width / 6,
    y: BOARD2.height / 3
  };
  var R = 30;
  var KIND_COLOR = {
    start: C.white,
    damage: C.red,
    capacity: C.cyan,
    reload: C.amber,
    special: C.white,
    empty: C.cyanDim
  };
  var SHORT = {
    start: "IN",
    damage: "DMG",
    capacity: "CAP",
    reload: "RLD",
    special: "SPC",
    empty: "\u2014"
  };
  var RIG_SHORT = {
    ...SHORT,
    damage: "ARM",
    capacity: "AIR",
    reload: "STS"
  };
  function center(n) {
    return {
      x: CELL.x * (n.x + 0.5),
      y: CELL.y * (n.y + 0.5)
    };
  }
  function Circuit({ target, installed, hover: hover3, onHover, onInstall }) {
    const nodes = CIRCUITS[target];
    const powered = (id) => id === "start" || installed.includes(id);
    const live = useLive("bench");
    const pulse = (0, import_bevy_react4.useSharedValue)(0.6);
    (0, import_react5.useEffect)(() => {
      pulse.value = live ? (0, import_bevy_react4.withRepeat)((0, import_bevy_react4.withTiming)(1, {
        duration: 700,
        easing: "easeInOut"
      }), {
        reverse: true
      }) : (0, import_bevy_react4.withTiming)(0.6, {
        duration: 200
      });
    }, [
      pulse,
      live
    ]);
    const links = nodes.flatMap((n) => n.links.filter((l) => n.id < l).map((l) => [
      n,
      nodes.find((m) => m.id === l)
    ]));
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("node", {
      style: {
        width: BOARD2.width,
        height: BOARD2.height
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", {
          viewBox: `0 0 ${BOARD2.width} ${BOARD2.height}`,
          style: {
            width: BOARD2.width,
            height: BOARD2.height
          },
          children: [
            Array.from({
              length: 7 * 4
            }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", {
              cx: i % 7 * CELL.x,
              cy: Math.floor(i / 7) * CELL.y,
              r: 1.5,
              fill: "rgba(127, 227, 255, 0.25)"
            }, `dot${i}`)),
            links.map(([a, b]) => {
              const p = center(a);
              const q = center(b);
              const live2 = powered(a.id) && powered(b.id);
              return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("line", {
                x1: p.x,
                y1: p.y,
                x2: q.x,
                y2: q.y,
                stroke: live2 ? C.cyan : "rgba(127, 227, 255, 0.22)",
                strokeWidth: live2 ? 4 : 2
              }, `${a.id}-${b.id}`);
            }),
            nodes.map((n) => {
              const { x, y } = center(n);
              const on2 = powered(n.id);
              const next = canInstall(target, installed, n.id);
              const color = KIND_COLOR[n.kind];
              return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("g", {
                children: [
                  next && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", {
                    cx: x,
                    cy: y,
                    r: R + 7,
                    fill: "none",
                    stroke: color,
                    strokeWidth: 2,
                    opacity: {
                      animated: pulse
                    }
                  }),
                  n.kind === "start" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("rect", {
                    x: x - R,
                    y: y - R,
                    width: R * 2,
                    height: R * 2,
                    fill: "rgba(240, 253, 255, 0.18)",
                    stroke: C.white,
                    strokeWidth: 3
                  }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", {
                    cx: x,
                    cy: y,
                    r: R,
                    fill: on2 ? color : "rgba(2, 10, 16, 0.7)",
                    opacity: on2 ? 0.9 : 1,
                    stroke: on2 || next ? color : "rgba(127, 227, 255, 0.3)",
                    strokeWidth: hover3 === n.id ? 4 : 2.5
                  }),
                  on2 && n.kind !== "start" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", {
                    cx: x,
                    cy: y,
                    r: R - 9,
                    fill: "rgba(2, 10, 16, 0.55)"
                  })
                ]
              }, n.id);
            })
          ]
        }),
        nodes.map((n) => {
          const { x, y } = center(n);
          const on2 = powered(n.id);
          const next = canInstall(target, installed, n.id);
          return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", {
            onClick: () => next && onInstall(n.id),
            onPointerEnter: () => onHover(n.id),
            onPointerLeave: () => onHover(null),
            style: {
              positionType: "absolute",
              left: x - R - 4,
              top: y - R - 4,
              width: (R + 4) * 2,
              height: (R + 4) * 2,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: R + 4,
              cursor: next ? "pointer" : "default"
            },
            hoverStyle: {
              backgroundColor: "rgba(127, 227, 255, 0.1)"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 13,
                letterSpacing: 1,
                color: on2 ? C.white : next ? KIND_COLOR[n.kind] : "rgba(127, 227, 255, 0.4)"
              },
              children: (target === "rig" ? RIG_SHORT : SHORT)[n.kind]
            })
          }, n.id);
        })
      ]
    });
  }
  function legend(target) {
    const kinds = [
      "damage",
      "capacity",
      "reload",
      "special",
      "empty"
    ];
    return kinds.map((kind) => ({
      kind,
      name: STAT_NAMES[target][kind]
    }));
  }

  // src/holos/shared/kit.tsx
  var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
  function Corners({ size = 18, width = 2, color = C.cyan }) {
    const arm = (style) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
      style: {
        positionType: "absolute",
        backgroundColor: color,
        ...style
      }
    });
    const h = {
      width: size,
      height: width
    };
    const v = {
      width,
      height: size
    };
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, {
      children: [
        arm({
          ...h,
          left: -1,
          top: -1
        }),
        arm({
          ...v,
          left: -1,
          top: -1
        }),
        arm({
          ...h,
          right: -1,
          top: -1
        }),
        arm({
          ...v,
          right: -1,
          top: -1
        }),
        arm({
          ...h,
          left: -1,
          bottom: -1
        }),
        arm({
          ...v,
          left: -1,
          bottom: -1
        }),
        arm({
          ...h,
          right: -1,
          bottom: -1
        }),
        arm({
          ...v,
          right: -1,
          bottom: -1
        })
      ]
    });
  }
  function Shell({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("node", {
      style: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        padding: {
          horizontal: 28,
          vertical: 20
        },
        backgroundColor: "rgba(3, 14, 22, 0.78)",
        border: 1,
        borderColor: C.cyanLine
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Corners, {
          size: 34,
          width: 3
        }),
        children
      ]
    });
  }
  function Rule({ color = C.cyanLine }) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
      style: {
        height: 1,
        flexShrink: 0,
        backgroundColor: color
      }
    });
  }
  function Tabs({ tabs, active, onPick, disabled = [] }) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
      style: {
        flexDirection: "row",
        gap: 6
      },
      children: tabs.map(({ id, label }) => {
        const on2 = id === active;
        const off = disabled.includes(id);
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", {
          onClick: () => !off && onPick(id),
          style: {
            padding: {
              horizontal: 22,
              vertical: 8
            },
            border: {
              bottom: 2
            },
            borderColor: on2 ? C.cyan : C.clear,
            backgroundColor: on2 ? C.cyanFaint : C.clear,
            cursor: off ? "default" : "pointer"
          },
          hoverStyle: off ? void 0 : {
            backgroundColor: "rgba(127, 227, 255, 0.09)"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
            style: {
              ...T.label,
              letterSpacing: 2.5,
              color: off ? C.cyanDeep : on2 ? C.white : C.cyanDim
            },
            children: label
          })
        }, id);
      })
    });
  }
  function HoloButton({ label, onClick, tone = C.cyan, disabled = false, wide = false }) {
    const color = disabled ? C.cyanDeep : tone;
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", {
      onClick,
      style: {
        padding: {
          horizontal: 28,
          vertical: 9
        },
        minWidth: wide ? 220 : 0,
        justifyContent: "center",
        border: 1,
        borderColor: color,
        backgroundColor: "rgba(4, 18, 28, 0.5)",
        cursor: disabled ? "default" : "pointer"
      },
      hoverStyle: disabled ? void 0 : {
        backgroundColor: "rgba(127, 227, 255, 0.18)"
      },
      pressStyle: disabled ? void 0 : {
        backgroundColor: "rgba(127, 227, 255, 0.34)"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("text", {
        style: {
          fontFamily: F.semibold,
          fontSize: 19,
          letterSpacing: 3,
          color,
          lineBreak: "noWrap"
        },
        children: label
      })
    });
  }
  function Bar({ value, segments = 10, color = C.cyan, width = 180, height = 9 }) {
    const lit = Math.round(value * segments);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
      style: {
        flexDirection: "row",
        gap: 2,
        width,
        height
      },
      children: Array.from({
        length: segments
      }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("node", {
        style: {
          flexGrow: 1,
          backgroundColor: i < lit ? color : "rgba(127, 227, 255, 0.12)"
        }
      }, i))
    });
  }
  function Tick({ color = C.green, size = 16 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("svg", {
      viewBox: "0 0 16 16",
      style: {
        width: size,
        height: size
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("polyline", {
        points: [
          2.5,
          8.5,
          6.5,
          12.5,
          13.5,
          3.5
        ],
        fill: "none",
        stroke: color,
        strokeWidth: 2.2,
        strokeLinecap: "round",
        strokeLinejoin: "round"
      })
    });
  }

  // src/holos/Bench.tsx
  var TABS = BENCH_TARGETS.map((id) => ({
    id,
    label: id === "rig" ? "RIG" : ITEMS[id].name.toUpperCase()
  }));
  function Bench() {
    const owned = useGame((g2) => g2.arms.owned);
    const bench = useGame((g2) => g2.bench);
    const cells = useGame((g2) => countItem(g2.pack, "power-cell"));
    const [target, setTarget] = (0, import_react6.useState)("cutter");
    const [hover3, setHover] = (0, import_react6.useState)(null);
    const locked = BENCH_TARGETS.filter((t) => t !== "rig" && !owned.includes(t));
    const pick = (next) => {
      if (next === target) return;
      setTarget(next);
      setHover(null);
      cue("tab");
    };
    useDebug("bench", (id) => {
      const next = BENCH_TARGETS.find((t) => t === id);
      if (next && !locked.includes(next)) setTarget(next);
    });
    useDebug("install", (node) => install(target, node));
    useDebug("hover", (node) => setHover(node || null));
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Holo, {
      name: "bench",
      page: target,
      seed: 7,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Shell, {
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
            style: {
              flexDirection: "row",
              alignItems: "center",
              gap: 18
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
                style: {
                  flexDirection: "column",
                  gap: 3
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                    style: {
                      ...T.header,
                      fontSize: 28,
                      letterSpacing: 6
                    },
                    children: "UPGRADE BENCH"
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                    style: {
                      ...T.small,
                      letterSpacing: 2
                    },
                    children: "HALDEN TOOLWORKS \xB7 CIRCUIT BENCH C-2"
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
                style: {
                  flexGrow: 1
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
                style: {
                  flexDirection: "column",
                  alignItems: "end",
                  gap: 1
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                    style: {
                      ...T.small,
                      letterSpacing: 3
                    },
                    children: "POWER CELLS"
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                    style: {
                      ...T.number,
                      fontSize: 42,
                      color: cells > 0 ? C.green : C.red
                    },
                    children: String(cells)
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
            style: {
              margin: {
                top: 10
              }
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Tabs, {
              tabs: TABS,
              active: target,
              onPick: pick,
              disabled: locked
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Rule, {}),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
            style: {
              flexDirection: "row",
              gap: 26,
              flexGrow: 1,
              margin: {
                top: 18
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
                style: {
                  padding: 4,
                  flexShrink: 0,
                  border: 1,
                  borderColor: "rgba(127, 227, 255, 0.25)",
                  backgroundColor: "rgba(2, 12, 20, 0.5)"
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Corners, {
                    size: 22,
                    width: 2
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Circuit, {
                    target,
                    installed: bench[target],
                    hover: hover3,
                    onHover: setHover,
                    onInstall: (node) => install(target, node)
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Stats, {
                target,
                installed: bench[target],
                hover: hover3,
                cells
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
            style: {
              flexDirection: "row",
              gap: 24,
              margin: {
                top: 12
              }
            },
            children: legend(target).map(({ kind, name }) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 8
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
                  style: {
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    border: 2,
                    borderColor: KIND_COLOR[kind]
                  }
                }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                  style: {
                    ...T.small,
                    letterSpacing: 2
                  },
                  children: name
                })
              ]
            }, kind))
          })
        ]
      })
    });
  }
  function format(target, stat, v) {
    if (target === "rig") return stat === "damage" ? `${v}%` : `${v} S`;
    return stat === "reload" ? `${v.toFixed(2)} S` : String(v);
  }
  function Stats({ target, installed, hover: hover3, cells }) {
    const now = stats(target, installed);
    const node = CIRCUITS[target].find((n) => n.id === hover3);
    const reachable = !!hover3 && canInstall(target, installed, hover3);
    const then = reachable ? stats(target, [
      ...installed,
      hover3
    ]) : now;
    const names2 = STAT_NAMES[target];
    const rows = [
      "damage",
      "capacity",
      "reload"
    ].map((stat) => ({
      stat,
      name: names2[stat],
      now: now[stat],
      then: then[stat]
    }));
    const state = !node ? null : node.kind === "start" || installed.includes(node.id) ? {
      text: "POWERED",
      color: C.green
    } : reachable ? {
      text: "1 POWER CELL TO POWER",
      color: cells > 0 ? C.amber : C.red
    } : {
      text: "NO POWER REACHES IT",
      color: C.cyanDim
    };
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 16,
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 3
          },
          children: target === "rig" ? "RIG MK-II" : ITEMS[target].name.toUpperCase()
        }),
        rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 4
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: r.name
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 14
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                  style: {
                    ...T.number,
                    fontSize: 30
                  },
                  children: format(target, r.stat, r.now)
                }),
                r.then !== r.now && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
                  style: {
                    ...T.number,
                    fontSize: 22,
                    color: C.green
                  },
                  children: `\u203A ${format(target, r.stat, r.then)}`
                })
              ]
            })
          ]
        }, r.stat)),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 4
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: names2.special
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 20,
                letterSpacing: 2,
                color: then.special ? C.green : C.cyanDeep
              },
              children: now.special ? "ACTIVE" : then.special ? "\u203A ACTIVE" : "LOCKED"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("node", {
          style: {
            flexGrow: 1
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Rule, {}),
        node && state ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 3
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                ...T.label,
                color: KIND_COLOR[node.kind]
              },
              children: names2[node.kind]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2,
                color: state.color
              },
              children: state.text
            })
          ]
        }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 2
          },
          children: "POWER A NODE NEXT TO A POWERED ONE \xB7 1 CELL EACH"
        })
      ]
    });
  }

  // src/holos/Elevator.tsx
  var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);

  // src/holos/fixtures/floors.tsx
  var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
  var FLOORS = [
    {
      floor: 1,
      name: "HYDROPONICS"
    },
    {
      floor: 2,
      name: "CONCOURSE C"
    },
    {
      floor: 3,
      name: "ICE REFINERY"
    },
    {
      floor: 4,
      name: "COMMAND"
    }
  ];
  function Arrow({ up, size, color = C.amber }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("svg", {
      viewBox: "0 0 12 10",
      style: {
        width: size,
        height: size * 10 / 12
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("polygon", {
        points: up ? [
          6,
          0,
          12,
          10,
          0,
          10
        ] : [
          0,
          0,
          12,
          0,
          6,
          10
        ],
        fill: color
      })
    });
  }

  // src/holos/Elevator.tsx
  function Elevator() {
    const { floor, target } = useGame((g2) => g2.fixtures.elevator);
    const blink = useBlink(target !== null, 320, 0.25);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Holo, {
      name: "elevator",
      seed: 19,
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
        style: {
          width: "100%",
          height: "100%",
          flexDirection: "column",
          backgroundColor: C.glass,
          border: 1,
          borderColor: C.cyanLine
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
            style: {
              height: 48,
              flexShrink: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              border: {
                bottom: 1
              },
              borderColor: C.cyanLine
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
                style: {
                  fontFamily: F.display,
                  fontSize: 19,
                  letterSpacing: 3,
                  color: C.cyan,
                  lineBreak: "noWrap"
                },
                children: "LIFT"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
                style: {
                  ...small,
                  color: C.cyan
                },
                children: "C-2"
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
            style: {
              flexGrow: 1,
              flexDirection: "column",
              gap: 6,
              padding: 8
            },
            children: [
              ...FLOORS
            ].reverse().map((f) => {
              const here = f.floor === floor && target === null;
              const called = f.floor === target;
              return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", {
                onClick: () => call(f.floor),
                style: {
                  flexGrow: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  padding: {
                    horizontal: 8
                  },
                  border: 1,
                  borderColor: here ? C.white : called ? C.amber : C.cyanFaint,
                  backgroundColor: here ? C.glassHi : C.clear,
                  ...called ? {
                    opacity: {
                      animated: blink
                    }
                  } : {}
                },
                hoverStyle: hover,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("node", {
                    style: {
                      width: 50,
                      height: 50,
                      flexShrink: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      border: 1,
                      borderColor: here ? C.white : C.cyanDim
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
                      style: {
                        fontFamily: F.display,
                        fontSize: 28,
                        color: here ? C.white : called ? C.amber : C.cyan,
                        lineBreak: "noWrap"
                      },
                      children: f.floor
                    })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
                    style: {
                      flexDirection: "column"
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
                        style: {
                          fontFamily: F.bold,
                          fontSize: 17,
                          letterSpacing: 1,
                          color: here ? C.white : C.cyan,
                          lineBreak: "noWrap"
                        },
                        children: f.name
                      }),
                      (here || called) && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
                        style: {
                          ...small,
                          color: called ? C.amber : C.white
                        },
                        children: here ? "CAR HERE" : "CALLED"
                      })
                    ]
                  })
                ]
              }, f.floor);
            })
          }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("node", {
            style: {
              height: 38,
              flexShrink: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              border: {
                top: 1
              },
              borderColor: C.cyanLine
            },
            children: [
              target !== null && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Arrow, {
                up: target > floor,
                size: 14
              }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("text", {
                style: {
                  ...small,
                  color: target !== null ? C.amber : C.cyanDim
                },
                children: target !== null ? "IN TRANSIT" : "STANDING BY"
              })
            ]
          })
        ]
      })
    });
  }
  var small = {
    fontFamily: F.semibold,
    fontSize: 14,
    letterSpacing: 1.5,
    color: C.cyanDim,
    lineBreak: "noWrap"
  };
  var hover = {
    backgroundColor: "rgba(127, 227, 255, 0.2)",
    borderColor: C.cyan
  };

  // src/holos/Floor.tsx
  var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
  var import_react7 = __toESM(require_react(), 1);
  var import_bevy_react5 = __toESM(require_bevy_react(), 1);
  function Floor() {
    const { floor, target } = useGame((g2) => g2.fixtures.elevator);
    const moving = target !== null;
    const up = moving && target > floor;
    const name = FLOORS.find((f) => f.floor === floor)?.name ?? "";
    const run = (0, import_bevy_react5.useSharedValue)(0);
    (0, import_react7.useEffect)(() => {
      run.value = moving ? (0, import_bevy_react5.withRepeat)((0, import_bevy_react5.withTiming)(1, {
        duration: 520,
        easing: "easeIn"
      })) : (0, import_bevy_react5.withTiming)(0, {
        duration: 0
      });
    }, [
      moving,
      run
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(Holo, {
      name: "floor",
      seed: 23,
      style: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        backgroundColor: C.glass,
        border: {
          top: 1,
          bottom: 1
        },
        borderColor: C.cyanLine
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
          style: {
            width: 22,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            overflowX: "clip",
            overflowY: "clip"
          },
          children: moving && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("node", {
            style: {
              transform: {
                translateY: {
                  animated: (0, import_bevy_react5.interpolate)(run, [
                    0,
                    1
                  ], up ? [
                    14,
                    -14
                  ] : [
                    -14,
                    14
                  ])
                }
              }
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Arrow, {
              up,
              size: 18
            })
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
          style: {
            fontFamily: F.display,
            fontSize: 42,
            color: moving ? C.amber : C.white,
            lineBreak: "noWrap"
          },
          children: floor
        }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("node", {
          style: {
            flexDirection: "column",
            width: 110
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 13,
                letterSpacing: 1.5,
                color: C.cyan,
                lineBreak: "noWrap"
              },
              children: name
            }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("text", {
              style: {
                fontFamily: F.regular,
                fontSize: 11,
                letterSpacing: 1.5,
                color: moving ? C.amber : C.cyanDim,
                lineBreak: "noWrap"
              },
              children: moving ? `TO DECK ${target}` : "FREIGHT LIFT"
            })
          ]
        })
      ]
    });
  }

  // src/holos/Hack.tsx
  var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
  var import_react9 = __toESM(require_react(), 1);

  // src/holos/hack/Dial.tsx
  var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);

  // src/holos/suit/arcs.ts
  function polar(cx, cy, r, deg) {
    const a = (deg - 90) * Math.PI / 180;
    return [
      cx + r * Math.cos(a),
      cy + r * Math.sin(a)
    ];
  }
  function arc(cx, cy, r, from, to) {
    const [x0, y0] = polar(cx, cy, r, from);
    const [x1, y1] = polar(cx, cy, r, to);
    const large = to - from > 180 ? 1 : 0;
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  function wrap(deg) {
    return (deg % 360 + 360) % 360;
  }
  function angleBetween(a, b) {
    const d = Math.abs(wrap(a) - wrap(b));
    return d > 180 ? 360 - d : d;
  }

  // src/holos/hack/useBypass.ts
  var import_react8 = __toESM(require_react(), 1);
  var TUMBLERS = 3;
  var TIME = 20;
  var TOLERANCE = 12;
  var PENALTY = 3;
  function roll() {
    return Array.from({
      length: TUMBLERS
    }, () => Math.floor(Math.random() * 360));
  }
  function useBypass(running, unlocked) {
    const [angle, setAngle] = (0, import_react8.useState)(0);
    const [targets, setTargets] = (0, import_react8.useState)(roll);
    const [solved, setSolved] = (0, import_react8.useState)(0);
    const [time, setTime] = (0, import_react8.useState)(TIME);
    const done = unlocked || solved >= TUMBLERS;
    (0, import_react8.useEffect)(() => {
      if (!running || done) return;
      const t = setInterval(() => setTime((s) => Math.max(0, s - 0.1)), 100);
      return () => clearInterval(t);
    }, [
      running,
      done
    ]);
    (0, import_react8.useEffect)(() => {
      if (time > 0 || done) return;
      shock();
      setTargets(roll());
      setSolved(0);
      setTime(TIME);
    }, [
      time,
      done
    ]);
    const lock = () => {
      const next = solved + 1;
      setSolved(next);
      cue("hackLock");
      if (next >= TUMBLERS) unlock();
    };
    const target = targets[Math.min(solved, TUMBLERS - 1)];
    return {
      angle,
      solved: done ? TUMBLERS : solved,
      time,
      near: done ? 0 : Math.max(0, 1 - angleBetween(angle, target) / 90),
      done,
      point: (deg) => setAngle(wrap(deg)),
      attempt: () => {
        if (done) return;
        if (angleBetween(angle, target) <= TOLERANCE) return lock();
        shock();
        setTime((s) => Math.max(0, s - PENALTY));
      },
      solve: () => {
        if (!done) lock();
      }
    };
  }

  // src/holos/hack/Dial.tsx
  var DIAL = 300;
  var R2 = DIAL / 2;
  var RINGS = [
    122,
    104,
    86
  ];
  function mix(a, b, t) {
    const ch = (c, i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
    const out = [
      0,
      1,
      2
    ].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t).toString(16).padStart(2, "0"));
    return `#${out.join("")}`;
  }
  function Dial({ angle, solved, near, done }) {
    const pick = mix(C.cyan, C.white, near);
    const box = {
      positionType: "absolute",
      width: DIAL,
      height: DIAL
    };
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("node", {
      style: {
        width: DIAL,
        height: DIAL
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", {
          viewBox: `0 0 ${DIAL} ${DIAL}`,
          style: box,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", {
              cx: R2,
              cy: R2,
              r: 146,
              fill: "rgba(2, 8, 12, 0.55)"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", {
              cx: R2,
              cy: R2,
              r: 146,
              fill: "none",
              stroke: C.cyanDim,
              strokeWidth: 1.5
            }),
            Array.from({
              length: 60
            }, (_, i) => {
              const major = i % 5 === 0;
              const [x0, y0] = polar(R2, R2, 142, i * 6);
              const [x1, y1] = polar(R2, R2, major ? 131 : 137, i * 6);
              return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("line", {
                x1: x0,
                y1: y0,
                x2: x1,
                y2: y1,
                stroke: major ? C.cyan : C.cyanDim,
                strokeWidth: major ? 2 : 1
              }, i);
            }),
            RINGS.map((r, i) => {
              const locked = i < solved;
              const current = i === solved && !done;
              return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", {
                cx: R2,
                cy: R2,
                r,
                fill: "none",
                stroke: locked ? C.green : current ? C.cyan : C.cyanDeep,
                strokeWidth: locked ? 6 : current ? 3 : 2,
                opacity: locked || current ? 0.95 : 0.8
              }, r);
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", {
          viewBox: `0 0 ${DIAL} ${DIAL}`,
          style: {
            ...box,
            transform: {
              rotate: angle
            }
          },
          children: [
            !done && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", {
              d: arc(R2, R2, RINGS[solved], -14, 14),
              fill: "none",
              stroke: pick,
              strokeWidth: 9,
              opacity: near * near
            }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("line", {
              x1: R2,
              y1: R2 - 30,
              x2: R2,
              y2: R2 - 134,
              stroke: pick,
              strokeWidth: 2.5 + near * 2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("polygon", {
              points: [
                R2,
                R2 - 146,
                R2 - 7,
                R2 - 132,
                R2 + 7,
                R2 - 132
              ],
              fill: pick
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", {
          viewBox: `0 0 ${DIAL} ${DIAL}`,
          style: box,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", {
              cx: R2,
              cy: R2,
              r: 24 + near * 16,
              fill: done ? C.green : pick,
              opacity: done ? 0.5 : 0.12 + near * near * 0.7
            }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", {
              cx: R2,
              cy: R2,
              r: 22,
              fill: "none",
              stroke: done ? C.green : C.cyan,
              strokeWidth: 2
            }),
            Array.from({
              length: TUMBLERS
            }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", {
              cx: R2 - 12 + i * 12,
              cy: R2,
              r: 3.5,
              fill: i < solved ? C.green : C.cyanDim
            }, i))
          ]
        })
      ]
    });
  }

  // src/holos/Hack.tsx
  function Hack() {
    const held = useHeld("hack");
    const unlocked = useGame((g2) => g2.fixtures.door !== "locked");
    const bypass = useBypass(held, unlocked);
    const { angle, solved, time, near, done } = bypass;
    useKeys(held, (e) => {
      if (e.code === "KeyE") bypass.attempt();
    });
    useDebug("hack", (arg) => {
      const [verb, value] = arg.split(" ");
      if (verb === "solve") bypass.solve();
      else if (verb === "angle") bypass.point(Number(value));
    });
    const step = Math.floor(near * 6);
    const last = (0, import_react9.useRef)(step);
    (0, import_react9.useEffect)(() => {
      if (step > last.current && step >= 3) cue("hackTick");
      last.current = step;
    }, [
      step
    ]);
    const low = time < 6 && !done;
    const status = done ? "BYPASS COMPLETE" : `TUMBLER ${solved + 1} / ${TUMBLERS}`;
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(Holo, {
      name: "hack",
      seed: 29,
      style: {
        flexDirection: "column",
        alignItems: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
          style: {
            width: "100%",
            height: 52,
            flexShrink: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "spaceBetween",
            padding: {
              horizontal: 22
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: {
                fontFamily: F.display,
                fontSize: 17,
                letterSpacing: 3,
                color: done ? C.green : C.cyan,
                lineBreak: "noWrap"
              },
              children: "BYPASS"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: {
                fontFamily: F.display,
                fontSize: 22,
                color: done ? C.green : low ? C.red : C.white,
                lineBreak: "noWrap"
              },
              children: done ? "--.-" : time.toFixed(1).padStart(4, "0")
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("node", {
          style: {
            width: DIAL,
            height: DIAL
          },
          onPointerHover: (e) => {
            if (done) return;
            const deg = Math.atan2(e.x - 0.5, 0.5 - e.y) * 180 / Math.PI;
            bypass.point(deg);
          },
          onClick: bypass.attempt,
          children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Dial, {
            angle,
            solved,
            near,
            done
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("node", {
          style: {
            width: "100%",
            flexGrow: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: {
                fontFamily: F.bold,
                fontSize: 15,
                letterSpacing: 3,
                color: done ? C.green : C.white,
                lineBreak: "noWrap"
              },
              children: status
            }),
            !done && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("node", {
              style: {
                width: 240,
                height: 4,
                backgroundColor: C.cyanDeep
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("node", {
                style: {
                  width: `${near * 100}%`,
                  height: "100%",
                  backgroundColor: near > 0.85 ? C.white : C.cyan
                }
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("text", {
              style: hint2,
              children: done ? "BULKHEAD C-D RELEASED" : `RESONANCE ${Math.round(near * 100)}%`
            })
          ]
        })
      ]
    });
  }
  var hint2 = {
    fontFamily: F.regular,
    fontSize: 12,
    letterSpacing: 1.5,
    color: C.cyanDim,
    lineBreak: "noWrap"
  };

  // src/holos/Lock.tsx
  var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
  function Lock() {
    const door = useGame((g2) => g2.fixtures.door);
    const locked = door === "locked";
    const color = locked ? C.red : C.green;
    const dim = locked ? C.redDim : C.greenDim;
    const outer = useSpin(16);
    const inner = useSpin(-9);
    const ring = {
      positionType: "absolute",
      width: 200,
      height: 200
    };
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(Holo, {
      name: "lock",
      seed: 13,
      style: {
        alignItems: "center",
        justifyContent: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("svg", {
          viewBox: "0 0 200 200",
          style: {
            ...ring,
            transform: {
              rotate: {
                animated: outer
              }
            }
          },
          children: Array.from({
            length: 8
          }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", {
            d: arc(100, 100, 92, i * 45 + 4, i * 45 + 37),
            fill: "none",
            stroke: color,
            strokeWidth: i % 2 ? 2 : 5,
            opacity: i % 2 ? 0.5 : 0.9
          }, i))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", {
          viewBox: "0 0 200 200",
          style: {
            ...ring,
            transform: {
              rotate: {
                animated: inner
              }
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", {
              cx: 100,
              cy: 100,
              r: 78,
              fill: "none",
              stroke: dim,
              strokeWidth: 1.5
            }),
            [
              0,
              120,
              240
            ].map((a) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", {
              d: arc(100, 100, 78, a - 8, a + 8),
              fill: "none",
              stroke: color,
              strokeWidth: 6
            }, a))
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", {
          viewBox: "0 0 200 200",
          style: ring,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", {
              cx: 100,
              cy: 100,
              r: 58,
              fill: "rgba(2, 8, 12, 0.6)"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", {
              d: locked ? "M84 92 L84 78 A16 16 0 0 1 116 78 L116 92" : "M84 80 L84 66 A16 16 0 0 1 116 66 L116 74",
              fill: "none",
              stroke: color,
              strokeWidth: 6
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", {
              x: 74,
              y: 92,
              width: 52,
              height: 38,
              rx: 4,
              fill: color
            }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("rect", {
              x: 97,
              y: 102,
              width: 6,
              height: 14,
              fill: "#05080c"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("node", {
          style: {
            positionType: "absolute",
            bottom: 48
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("text", {
            style: {
              fontFamily: F.bold,
              fontSize: 17,
              letterSpacing: 3,
              color,
              lineBreak: "noWrap"
            },
            children: locked ? "LOCKED" : "UNLOCKED"
          })
        })
      ]
    });
  }

  // src/holos/Menu.tsx
  var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
  var import_react13 = __toESM(require_react(), 1);

  // src/holos/menu/Inventory.tsx
  var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
  var import_react10 = __toESM(require_react(), 1);

  // src/holos/shared/items.tsx
  var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
  var KIND_LABEL = {
    health: "MEDICAL",
    stasis: "STASIS",
    air: "LIFE SUPPORT",
    ammo: "AMMUNITION",
    upgrade: "UPGRADE",
    valuable: "VALUABLE",
    weapon: "WEAPON"
  };
  function initials(item) {
    return ITEMS[item].name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  }
  function ItemIcon({ item, size = 88, count, lit = false }) {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("node", {
      style: {
        width: size,
        height: size,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        border: 1,
        borderColor: lit ? C.white : "rgba(127, 227, 255, 0.28)",
        backgroundColor: "rgba(6, 26, 38, 0.95)"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            fontFamily: F.display,
            fontSize: size * 0.22,
            color: "rgba(127, 227, 255, 0.3)"
          },
          children: initials(item)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("portal", {
          target: `icon-${item}`,
          style: {
            positionType: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%"
          }
        }),
        count !== void 0 && count > 1 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("text", {
          style: {
            positionType: "absolute",
            right: 5,
            bottom: 2,
            fontFamily: F.display,
            fontSize: 15,
            color: lit ? C.white : C.cyan
          },
          children: count
        })
      ]
    });
  }

  // src/holos/menu/Inventory.tsx
  function effect(item) {
    switch (item) {
      case "medpack-s":
        return "RESTORES 25% VITALS";
      case "medpack-m":
        return "RESTORES 50% VITALS";
      case "medpack-l":
        return "RESTORES ALL VITALS";
      case "stasis-pack":
        return "REFILLS THE STASIS MODULE";
      case "air-canister":
        return "+30 S OF AIR";
      case "power-cell":
        return "POWERS ONE NODE AT A BENCH";
      case "semiconductor":
        return `SELLS FOR ${credits(sellPrice(item))} CREDITS`;
    }
    const weapon = WEAPONS.find((w) => WEAPON_AMMO[w].ammo === item);
    return weapon ? `LOADS THE ${ITEMS[weapon].name.toUpperCase()} \xB7 ${WEAPON_AMMO[weapon].perItem} ROUNDS` : "";
  }
  var USABLE = /* @__PURE__ */ new Set([
    "health",
    "stasis",
    "air",
    "ammo"
  ]);
  function Inventory({ active, selected, onSelect }) {
    const slots = useGame((g2) => g2.pack.slots);
    const item = slots[selected]?.item;
    const used = slots.filter(Boolean).length;
    (0, import_react10.useEffect)(() => {
      if (active && item) bevy.preview.show({
        item
      });
    }, [
      active,
      item
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
      style: {
        flexDirection: "row",
        gap: 28,
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 14,
            width: 520,
            flexShrink: 0
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
              style: {
                flexDirection: "row",
                justifyContent: "spaceBetween"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                  style: {
                    ...T.small,
                    letterSpacing: 3
                  },
                  children: "SUIT INVENTORY"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                  style: {
                    ...T.small,
                    letterSpacing: 2,
                    color: C.cyan
                  },
                  children: `${used} / ${slots.length}`
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
              style: {
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12
              },
              children: slots.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", {
                onClick: () => {
                  onSelect(i);
                  cue("tick");
                },
                style: {
                  width: 120,
                  height: 112,
                  alignItems: "center",
                  justifyContent: "center",
                  border: 1,
                  borderColor: i === selected ? C.white : C.clear,
                  backgroundColor: i === selected ? "rgba(240, 253, 255, 0.1)" : C.clear,
                  cursor: "pointer"
                },
                hoverStyle: {
                  backgroundColor: "rgba(127, 227, 255, 0.1)"
                },
                children: s ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(ItemIcon, {
                  item: s.item,
                  size: 96,
                  count: s.count,
                  lit: i === selected
                }) : /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
                  style: {
                    width: 96,
                    height: 96,
                    border: 1,
                    borderColor: "rgba(127, 227, 255, 0.12)"
                  }
                })
              }, i))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Weapons, {})
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Detail, {
          slot: selected,
          live: active
        })
      ]
    });
  }
  function Detail({ slot, live }) {
    const s = useGame((g2) => g2.pack.slots[slot]);
    if (!s) {
      return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
        style: {
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
          style: {
            ...T.label,
            color: C.cyanDim,
            letterSpacing: 4
          },
          children: "EMPTY SLOT"
        })
      });
    }
    const item = ITEMS[s.item];
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
      style: {
        flexGrow: 1,
        flexDirection: "column",
        gap: 12
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
          style: {
            flexDirection: "row",
            justifyContent: "spaceBetween",
            alignItems: "end"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
              style: {
                ...T.header,
                fontSize: 26,
                color: C.white
              },
              children: item.name.toUpperCase()
            }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 3
              },
              children: KIND_LABEL[item.kind]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Rule, {}),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
          style: {
            flexDirection: "row",
            gap: 22
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
              style: {
                width: 340,
                height: 280,
                flexShrink: 0,
                border: 1,
                borderColor: "rgba(127, 227, 255, 0.25)",
                backgroundColor: "rgba(2, 10, 16, 1)"
              },
              children: live && /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("portal", {
                target: "preview",
                style: {
                  width: "100%",
                  height: "100%",
                  cache: "never"
                }
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
              style: {
                flexDirection: "column",
                gap: 14,
                flexGrow: 1,
                flexShrink: 1
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                  style: T.body,
                  children: item.text
                }),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                  style: {
                    ...T.label,
                    fontSize: 17,
                    color: C.cyanHi,
                    lineBreak: "wordBoundary"
                  },
                  children: effect(s.item)
                }),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
                  style: {
                    flexDirection: "row",
                    gap: 26
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
                      style: {
                        flexDirection: "column",
                        gap: 2
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                          style: {
                            ...T.small,
                            letterSpacing: 2
                          },
                          children: "CARRIED"
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                          style: {
                            ...T.number,
                            fontSize: 26
                          },
                          children: String(s.count)
                        })
                      ]
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
                      style: {
                        flexDirection: "column",
                        gap: 2
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                          style: {
                            ...T.small,
                            letterSpacing: 2
                          },
                          children: "VALUE"
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                          style: {
                            ...T.number,
                            fontSize: 26,
                            color: C.amber
                          },
                          children: credits(sellPrice(s.item))
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
          style: {
            flexDirection: "row",
            gap: 16,
            margin: {
              top: 6
            }
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(HoloButton, {
            label: "USE",
            wide: true,
            disabled: !USABLE.has(item.kind),
            onClick: () => use(slot)
          })
        })
      ]
    });
  }
  function Weapons() {
    const arms = useGame((g3) => g3.arms);
    const g2 = useGame();
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 8,
        margin: {
          top: 4
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 3
          },
          children: "WEAPONS"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("node", {
          style: {
            flexDirection: "row",
            gap: 10
          },
          children: WEAPONS.map((w) => {
            const owned = arms.owned.includes(w);
            const on2 = arms.weapon === w;
            return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("button", {
              onClick: () => owned && equip(w),
              style: {
                width: 165,
                flexDirection: "column",
                gap: 2,
                padding: {
                  horizontal: 10,
                  vertical: 7
                },
                border: 1,
                borderColor: on2 ? C.white : owned ? C.cyanLine : "rgba(127, 227, 255, 0.12)",
                backgroundColor: on2 ? "rgba(240, 253, 255, 0.08)" : C.clear,
                cursor: owned ? "pointer" : "default"
              },
              hoverStyle: owned ? {
                backgroundColor: "rgba(127, 227, 255, 0.1)"
              } : void 0,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                  style: {
                    fontFamily: F.semibold,
                    fontSize: 16,
                    letterSpacing: 1.5,
                    color: on2 ? C.white : owned ? C.cyan : C.cyanDeep,
                    lineBreak: "noWrap"
                  },
                  children: ITEMS[w].name.toUpperCase()
                }),
                /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("text", {
                  style: {
                    fontFamily: F.regular,
                    fontSize: 13,
                    letterSpacing: 1.5,
                    color: on2 ? C.green : owned ? C.cyanDim : C.cyanDeep,
                    lineBreak: "noWrap"
                  },
                  children: !owned ? "NOT OWNED" : `${on2 ? "EQUIPPED \xB7 " : ""}${arms.clip[w]}/${clipSize(g2, w)} \xB7 ${reserve(g2, w)}`
                })
              ]
            }, w);
          })
        })
      ]
    });
  }

  // src/holos/menu/Logs.tsx
  var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
  var import_react11 = __toESM(require_react(), 1);
  function Logs({ selected, playing, onSelect, onPlay }) {
    const read2 = useGame((g2) => g2.story.read);
    const log = LOGS.find((l) => l.id === selected) ?? LOGS[0];
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("node", {
      style: {
        flexDirection: "row",
        gap: 28,
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
          scrollStep: 36,
          style: {
            width: 430,
            flexShrink: 0,
            height: 476,
            flexDirection: "column",
            gap: 8,
            overflowY: "scroll",
            transition: {
              scroll: {
                duration: 180,
                easing: "easeOut"
              }
            }
          },
          children: LOGS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Row, {
            log: l,
            on: l.id === log.id,
            unread: !read2.includes(l.id),
            onClick: () => onSelect(l.id)
          }, l.id))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 12,
            flexGrow: 1
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 3,
                color: log.audio ? C.amber : C.cyanDim
              },
              children: log.audio ? "AUDIO LOG" : "TEXT LOG"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
              style: {
                ...T.header,
                fontSize: 26,
                color: C.white
              },
              children: log.title
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
              style: {
                ...T.label,
                fontSize: 17,
                color: C.cyanDim
              },
              children: `FROM: ${log.from.toUpperCase()}`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Rule, {}),
            log.audio && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 20
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(HoloButton, {
                  label: playing ? "PLAYING" : "PLAY",
                  onClick: onPlay
                }),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Waveform, {
                  playing
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
              style: {
                ...T.body,
                fontSize: 20,
                lineHeight: 1.5
              },
              children: log.audio ? `"${log.text}"` : log.text
            })
          ]
        })
      ]
    });
  }
  function Row({ log, on: on2, unread, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("button", {
      onClick,
      style: {
        flexShrink: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        height: 96,
        padding: {
          horizontal: 14
        },
        border: 1,
        borderColor: on2 ? C.white : "rgba(127, 227, 255, 0.2)",
        backgroundColor: on2 ? "rgba(240, 253, 255, 0.08)" : "rgba(4, 18, 28, 0.4)",
        cursor: "pointer"
      },
      hoverStyle: {
        backgroundColor: "rgba(127, 227, 255, 0.1)"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
          style: {
            width: 54,
            height: 26,
            alignItems: "center",
            justifyContent: "center",
            border: 1,
            borderColor: log.audio ? C.amber : C.cyanDim
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
            style: {
              fontFamily: F.semibold,
              fontSize: 12,
              letterSpacing: 1.5,
              color: log.audio ? C.amber : C.cyanDim
            },
            children: log.audio ? "AUDIO" : "TEXT"
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
                fontFamily: F.semibold,
                fontSize: 18,
                letterSpacing: 1.5,
                color: on2 ? C.white : C.cyan,
                lineBreak: "noWrap"
              },
              children: log.title
            }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("text", {
              style: {
                ...T.small,
                lineBreak: "noWrap"
              },
              children: log.from.toUpperCase()
            })
          ]
        }),
        unread && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("node", {
          style: {
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: C.cyan
          }
        })
      ]
    });
  }
  function noise(i, frame2) {
    const s = Math.sin(i * 12.9898 + frame2 * 78.233) * 43758.5453;
    return s - Math.floor(s);
  }
  function Waveform({ playing }) {
    const [frame2, setFrame] = (0, import_react11.useState)(0);
    (0, import_react11.useEffect)(() => {
      if (!playing) return;
      const t = setInterval(() => setFrame((f) => f + 1), 70);
      return () => clearInterval(t);
    }, [
      playing
    ]);
    const width = 560;
    const height = 96;
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("canvas", {
      style: {
        width,
        height
      },
      draw: (ctx) => {
        const bars = 56;
        const step = width / bars;
        ctx.fillStyle = playing ? C.cyan : C.cyanDeep;
        ctx.beginPath();
        for (let i = 0; i < bars; i++) {
          const env = Math.abs(Math.sin(i * 0.23 + frame2 * 0.41)) * 0.8 + 0.2;
          const drop = noise(i >> 3, frame2 >> 2) < 0.18 ? 0.1 : 1;
          const h = playing ? Math.max(3, noise(i, frame2) * env * drop * (height - 8)) : 2 + noise(i, 0) * 3;
          ctx.rect(i * step + 1, (height - h) / 2, step - 3, h);
        }
        ctx.fill();
      }
    });
  }

  // src/holos/menu/MapTab.tsx
  var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
  var import_react12 = __toESM(require_react(), 1);
  var PLACES = [
    {
      id: "store",
      name: "STORE",
      color: C.amber
    },
    {
      id: "bench",
      name: "UPGRADE BENCH",
      color: C.green
    },
    {
      id: "save",
      name: "SAVE STATION",
      color: C.cyan
    },
    {
      id: "elevator",
      name: "FREIGHT ELEVATOR",
      color: C.white
    },
    {
      id: "bulkhead",
      name: "BULKHEAD C-D",
      color: C.red
    }
  ];
  function MapTab({ active }) {
    const last = (0, import_react12.useRef)(null);
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
      style: {
        flexDirection: "row",
        gap: 26,
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
          style: {
            width: 800,
            flexShrink: 0,
            height: 476,
            border: 1,
            borderColor: "rgba(127, 227, 255, 0.3)",
            backgroundColor: "rgba(2, 10, 16, 0.45)"
          },
          children: [
            active && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("portal", {
              target: "map",
              style: {
                width: "100%",
                height: "100%",
                cursor: "grab",
                // A live camera's pixels: re-capture every frame.
                cache: "never"
              },
              onPointerDown: (e) => {
                last.current = {
                  x: e.clientX,
                  y: e.clientY
                };
              },
              onPointerMove: (e) => {
                if (!last.current) return;
                const dx = e.clientX - last.current.x;
                const dy = e.clientY - last.current.y;
                last.current = {
                  x: e.clientX,
                  y: e.clientY
                };
                if (dx || dy) bevy.map.orbit({
                  dx,
                  dy
                });
              },
              onPointerUp: () => {
                last.current = null;
              },
              onWheel: (e) => bevy.map.zoom({
                delta: -e.deltaY * (e.deltaMode === "line" ? 1 : 0.025)
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Corners, {
              size: 22,
              width: 2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
              style: {
                ...T.small,
                positionType: "absolute",
                left: 14,
                top: 10,
                letterSpacing: 3,
                color: C.cyan
              },
              children: "DECK 2 \xB7 MAINTENANCE CONCOURSE C"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
              style: {
                positionType: "absolute",
                left: 14,
                bottom: 10,
                flexDirection: "row",
                gap: 26
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
                  style: {
                    ...T.small,
                    letterSpacing: 2
                  },
                  children: "DRAG \xB7 TURN"
                }),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
                  style: {
                    ...T.small,
                    letterSpacing: 2
                  },
                  children: "WHEEL \xB7 ZOOM"
                })
              ]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Legend, {})
      ]
    });
  }
  function Legend() {
    const fixtures = useGame((g2) => g2.fixtures);
    const current = useGame(objective);
    const target = OBJECTIVES[current].to;
    const door = {
      locked: "LOCKED",
      unlocked: "UNLOCKED",
      open: "OPEN"
    }[fixtures.door];
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 12,
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 3
          },
          children: "LEGEND"
        }),
        PLACES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("node", {
              style: {
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: p.id === "bulkhead" && fixtures.door !== "locked" ? C.green : p.color
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
              style: {
                ...T.label,
                fontSize: 18,
                flexGrow: 1
              },
              children: p.name
            }),
            p.id === target && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Tag, {
              text: "OBJECTIVE",
              color: C.amber
            }),
            p.id === fixtures.locator && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Tag, {
              text: "LOCATOR",
              color: C.cyan
            })
          ]
        }, p.id)),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("svg", {
              viewBox: "0 0 12 12",
              style: {
                width: 12,
                height: 12
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("polygon", {
                points: [
                  6,
                  0,
                  12,
                  12,
                  0,
                  12
                ],
                fill: C.white
              })
            }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
              style: {
                ...T.label,
                fontSize: 18
              },
              children: "YOU"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Rule, {}),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Line, {
          label: "BULKHEAD C-D",
          value: door,
          color: fixtures.door === "locked" ? C.red : C.green
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Line, {
          label: "ELEVATOR",
          value: `DECK ${fixtures.elevator.floor}`,
          color: C.white
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Line, {
          label: "OBJECTIVE",
          value: OBJECTIVES[current].title,
          color: C.amber
        })
      ]
    });
  }
  function Tag({ text, color }) {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("node", {
      style: {
        border: 1,
        borderColor: color,
        padding: {
          horizontal: 6,
          vertical: 1
        }
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
        style: {
          fontFamily: F.semibold,
          fontSize: 12,
          letterSpacing: 2,
          color
        },
        children: text
      })
    });
  }
  function Line({ label, value, color }) {
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 2
          },
          children: label
        }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("text", {
          style: {
            fontFamily: F.semibold,
            fontSize: 17,
            letterSpacing: 1.5,
            color
          },
          children: value
        })
      ]
    });
  }

  // src/holos/menu/Objectives.tsx
  var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
  var FAINT = "rgba(127, 227, 255, 0.3)";
  function Objectives() {
    const current = useGame(objective);
    const now = OBJECTIVES[current];
    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
      style: {
        flexDirection: "row",
        gap: 34,
        flexGrow: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
          style: {
            flexDirection: "column",
            width: 470,
            flexShrink: 0
          },
          children: OBJECTIVES.map((o, i) => {
            const done = i < current;
            const here = i === current;
            return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
              style: {
                flexDirection: "row",
                gap: 16
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
                  style: {
                    flexDirection: "column",
                    alignItems: "center",
                    width: 26
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
                      style: {
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        border: 2,
                        borderColor: here ? C.white : done ? C.greenDim : FAINT,
                        backgroundColor: here ? "rgba(240, 253, 255, 0.15)" : C.clear,
                        alignItems: "center",
                        justifyContent: "center"
                      },
                      children: done && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Tick, {
                        size: 14
                      })
                    }),
                    i < OBJECTIVES.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
                      style: {
                        width: 2,
                        height: 62,
                        backgroundColor: done ? C.greenDim : FAINT
                      }
                    })
                  ]
                }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
                  style: {
                    flexDirection: "column",
                    gap: 3
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
                      style: {
                        fontFamily: F.semibold,
                        fontSize: 19,
                        letterSpacing: 2,
                        color: here ? C.white : done ? C.cyanDim : FAINT
                      },
                      children: i > current ? "CLASSIFIED" : o.title
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
                      style: {
                        ...T.small,
                        color: here ? C.amber : done ? C.greenDim : FAINT
                      },
                      children: here ? "CURRENT" : done ? "COMPLETE" : "PENDING"
                    })
                  ]
                })
              ]
            }, o.title);
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("node", {
          style: {
            flexGrow: 1,
            flexDirection: "column",
            gap: 16,
            padding: 26,
            border: 1,
            borderColor: "rgba(127, 227, 255, 0.25)",
            backgroundColor: "rgba(4, 18, 28, 0.45)"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Corners, {
              size: 20,
              width: 2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 3,
                color: C.amber
              },
              children: `OBJECTIVE ${current + 1} / ${OBJECTIVES.length}`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
              style: {
                ...T.header,
                fontSize: 30,
                color: C.white
              },
              children: now.title
            }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Rule, {}),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
              style: {
                ...T.body,
                fontSize: 21,
                lineHeight: 1.45
              },
              children: now.text
            }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("node", {
              style: {
                flexGrow: 1
              }
            }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: "THE LOCATOR TRACES THE WAY: L ON THE LOCATOR BEAT"
            })
          ]
        })
      ]
    });
  }

  // src/holos/Menu.tsx
  var TABS2 = [
    {
      id: "inventory",
      label: "INVENTORY"
    },
    {
      id: "map",
      label: "MAP"
    },
    {
      id: "objectives",
      label: "OBJECTIVES"
    },
    {
      id: "logs",
      label: "LOGS"
    }
  ];
  var PLAY_MS = 4200;
  function Menu() {
    const active = useLive("menu");
    const [tab, setTab] = (0, import_react13.useState)("inventory");
    const [slot, setSlot] = (0, import_react13.useState)(0);
    const [log, setLog] = (0, import_react13.useState)(LOGS[0].id);
    const [playing, setPlaying] = (0, import_react13.useState)(false);
    const pick = (next) => {
      if (next === tab) return;
      setTab(next);
      cue("tab");
    };
    const openLog = (id, play = false) => {
      setLog(id);
      setPlaying(false);
      read(id);
      cue("tick");
      if (play && LOGS.find((l) => l.id === id)?.audio) startPlaying();
    };
    const startPlaying = () => {
      setPlaying(true);
      cue("log");
    };
    (0, import_react13.useEffect)(() => {
      if (!playing) return;
      const t = setTimeout(() => setPlaying(false), PLAY_MS);
      return () => clearTimeout(t);
    }, [
      playing
    ]);
    useDebug("tab", (id) => {
      if (TABS2.some((t) => t.id === id)) setTab(id);
    });
    useDebug("select", (item) => {
      const at = getGame().pack.slots.findIndex((s) => s?.item === item);
      if (at >= 0) {
        setTab("inventory");
        setSlot(at);
      }
    });
    useDebug("log", (id) => {
      if (!LOGS.some((l) => l.id === id)) return;
      setTab("logs");
      openLog(id, true);
    });
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Holo, {
      name: "menu",
      page: tab,
      seed: 3,
      children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(Shell, {
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Header, {}),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
            style: {
              flexDirection: "row",
              justifyContent: "spaceBetween",
              alignItems: "center",
              margin: {
                top: 12
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Tabs, {
                tabs: TABS2,
                active: tab,
                onPick: pick
              }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
                style: {
                  ...T.small,
                  letterSpacing: 2
                },
                children: "TAB \xB7 CLOSE"
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Rule, {}),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
            style: {
              flexGrow: 1,
              margin: {
                top: 16,
                bottom: 12
              }
            },
            children: [
              tab === "inventory" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Inventory, {
                active,
                selected: slot,
                onSelect: setSlot
              }),
              tab === "map" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MapTab, {
                active
              }),
              tab === "objectives" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Objectives, {}),
              tab === "logs" && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Logs, {
                selected: log,
                playing,
                onSelect: (id) => openLog(id),
                onPlay: startPlaying
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Rule, {}),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Footer, {})
        ]
      })
    });
  }
  function Header() {
    const suit = useGame((g2) => g2.suit);
    const pack = useGame((g2) => g2.pack);
    const vitals = suit.health > 0.4 ? C.cyan : suit.health > 0.2 ? C.amber : C.red;
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 40
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 3
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                ...T.header,
                fontSize: 26,
                letterSpacing: 6
              },
              children: "RIG"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: "T. OKAFOR \xB7 HALDEN ICE & ORE"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Gauge, {
          label: "VITALS",
          value: suit.health,
          color: vitals
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Gauge, {
          label: "STASIS",
          value: suit.stasis,
          color: C.cyan
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("node", {
          style: {
            flexGrow: 1
          }
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
          style: {
            flexDirection: "column",
            alignItems: "end",
            gap: 1
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: "POWER CELLS"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                ...T.number,
                fontSize: 24,
                color: C.green
              },
              children: String(countItem(pack, "power-cell"))
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
          style: {
            flexDirection: "column",
            alignItems: "end",
            gap: 1
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: "CREDITS"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                ...T.number,
                fontSize: 30,
                color: C.amber
              },
              children: credits(pack.credits)
            })
          ]
        })
      ]
    });
  }
  function Gauge({ label, value, color }) {
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 6
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
          style: {
            flexDirection: "row",
            justifyContent: "spaceBetween"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: label
            }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 14,
                color
              },
              children: `${Math.round(value * 100)}%`
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Bar, {
          value,
          color,
          width: 200
        })
      ]
    });
  }
  function Footer() {
    const current = OBJECTIVES[useGame(objective)];
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("node", {
      style: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        margin: {
          top: 10
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 3,
            color: C.amber
          },
          children: "OBJECTIVE"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
          style: {
            ...T.label,
            fontSize: 18,
            color: C.white
          },
          children: current.title
        }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("text", {
          style: {
            ...T.body,
            fontSize: 16,
            color: C.cyanDim,
            flexShrink: 1
          },
          children: current.text
        })
      ]
    });
  }

  // src/holos/Prompt.tsx
  var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
  var import_react15 = __toESM(require_react(), 1);

  // src/holos/Terminal.tsx
  var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
  var import_react14 = __toESM(require_react(), 1);

  // src/keys.ts
  var CONTROLS = [
    {
      title: "MOVE",
      keys: [
        [
          "W A S D",
          "walk"
        ],
        [
          "SHIFT",
          "hurry"
        ],
        [
          "MOUSE",
          "look"
        ],
        [
          "ESC",
          "free the mouse"
        ]
      ]
    },
    {
      title: "SCREENS",
      keys: [
        [
          "F",
          "use the one he faces"
        ],
        [
          "MOUSE",
          "cursor"
        ],
        [
          "LMB",
          "press"
        ],
        [
          "WHEEL",
          "scroll"
        ],
        [
          "F \xB7 W A S D",
          "leave it"
        ]
      ]
    },
    {
      title: "WEAPON",
      keys: [
        [
          "RMB",
          "aim"
        ],
        [
          "LMB",
          "fire"
        ],
        [
          "R",
          "reload"
        ],
        [
          "Q",
          "next weapon"
        ]
      ]
    },
    {
      title: "TEST RIG",
      keys: [
        [
          "H",
          "take a hit"
        ],
        [
          "V",
          "vent the room"
        ]
      ]
    },
    {
      title: "SUIT",
      keys: [
        [
          "TAB",
          "suit menu"
        ],
        [
          "M",
          "medpack"
        ],
        [
          "C",
          "stasis"
        ],
        [
          "L",
          "locator"
        ],
        [
          "SHIFT+L",
          "next destination"
        ]
      ]
    }
  ];

  // src/holos/Terminal.tsx
  function Terminal() {
    const live = useLive("controls");
    (0, import_react14.useEffect)(() => {
      if (!live) return;
      let t;
      const next = () => {
        t = setTimeout(() => {
          glitch("controls");
          next();
        }, 3e3 + Math.random() * 4e3);
      };
      next();
      return () => clearTimeout(t);
    }, [
      live
    ]);
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(Holo, {
      name: "controls",
      seed: 31,
      style: screen,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
          style: {
            flexDirection: "row",
            justifyContent: "spaceBetween",
            border: {
              bottom: 1
            },
            borderColor: C.cyanFaint,
            padding: {
              bottom: 8
            }
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
              style: small2,
              children: "HALDEN ICE & ORE \xB7 TERMINAL C-01"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
              style: small2,
              children: "SHIFT 3 \xB7 CONCOURSE C"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 4,
            padding: {
              top: 4,
              bottom: 12
            },
            border: {
              bottom: 1
            },
            borderColor: C.cyan
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
              style: {
                fontFamily: F.display,
                fontSize: 52,
                letterSpacing: 12,
                color: C.white,
                lineBreak: "noWrap"
              },
              children: "COLDWAKE"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 15,
                letterSpacing: 5,
                color: C.cyan,
                lineBreak: "noWrap"
              },
              children: "EURYDICE STATION \xB7 RIG ORIENTATION \xB7 MAINTENANCE CONCOURSE C"
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
          style: {
            flexGrow: 1,
            flexDirection: "row",
            flexWrap: "wrap",
            alignContent: "flexStart",
            rowGap: 18,
            columnGap: 28,
            padding: {
              top: 12
            }
          },
          children: CONTROLS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
            style: {
              width: 270,
              flexDirection: "column",
              gap: 6,
              padding: {
                left: 12
              },
              border: {
                left: 2
              },
              borderColor: C.cyanLine
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                style: {
                  fontFamily: F.bold,
                  fontSize: 15,
                  letterSpacing: 3,
                  color: C.cyan,
                  lineBreak: "noWrap"
                },
                children: group.title
              }),
              group.keys.map(([key, what]) => /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("node", {
                style: {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Key, {
                    children: key
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
                    style: {
                      fontFamily: F.regular,
                      fontSize: 16,
                      color: C.cyanHi,
                      lineBreak: "noWrap"
                    },
                    children: what
                  })
                ]
              }, key))
            ]
          }, group.title))
        })
      ]
    });
  }
  function Key({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("node", {
      style: {
        padding: {
          horizontal: 7,
          vertical: 1
        },
        border: 1,
        borderColor: "rgba(127, 227, 255, 0.55)",
        borderRadius: 3
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("text", {
        style: {
          fontFamily: F.semibold,
          fontSize: 15,
          color: C.white,
          lineBreak: "noWrap"
        },
        children
      })
    });
  }
  var screen = {
    flexDirection: "column",
    padding: {
      horizontal: 44,
      vertical: 30
    },
    gap: 10,
    backgroundColor: "rgba(2, 10, 16, 0.78)",
    border: 2,
    borderColor: C.cyanLine
  };
  var small2 = {
    fontFamily: F.regular,
    fontSize: 13,
    letterSpacing: 2.5,
    color: C.cyanDim,
    lineBreak: "noWrap"
  };

  // src/holos/Prompt.tsx
  function Prompt() {
    const now = hint(useGame());
    const last = (0, import_react15.useRef)(null);
    if (now) last.current = now;
    const shown = now ?? last.current;
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Holo, {
      name: "prompt",
      page: shown?.id ?? "none",
      seed: 23,
      style: {
        alignItems: "center",
        justifyContent: "center"
      },
      children: shown && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("node", {
        style: {
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          padding: {
            horizontal: 14,
            vertical: 6
          },
          backgroundColor: C.shade,
          border: 1,
          borderColor: C.cyanFaint
        },
        children: shown.keys.map(([key, what]) => /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("node", {
          style: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Key, {
              children: key
            }),
            /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("text", {
              style: {
                fontFamily: F.regular,
                fontSize: 16,
                color: C.cyanHi,
                lineBreak: "noWrap"
              },
              children: what
            })
          ]
        }, key))
      })
    });
  }

  // src/holos/Save.tsx
  var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
  function Save() {
    const saves = useGame((g2) => g2.fixtures.saves);
    const spin = useSpin(10);
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(Holo, {
      name: "save",
      seed: 17,
      children: /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
        style: {
          width: "100%",
          height: "100%",
          flexDirection: "column",
          backgroundColor: C.glass,
          border: 1,
          borderColor: C.cyanLine
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
            style: {
              height: 54,
              flexShrink: 0,
              padding: {
                horizontal: 16
              },
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "spaceBetween",
              border: {
                bottom: 1
              },
              borderColor: C.cyanLine
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                style: {
                  fontFamily: F.display,
                  fontSize: 21,
                  letterSpacing: 3,
                  color: C.cyan,
                  lineBreak: "noWrap"
                },
                children: "SAVE STATION"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                style: {
                  ...small3,
                  color: C.cyan
                },
                children: "C-7"
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
            style: {
              flexGrow: 1,
              flexDirection: "row"
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
                style: {
                  width: 172,
                  flexShrink: 0,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  border: {
                    right: 1
                  },
                  borderColor: C.cyanFaint
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("svg", {
                    viewBox: "0 0 90 90",
                    style: {
                      width: 90,
                      height: 90,
                      transform: {
                        rotate: {
                          animated: spin
                        }
                      }
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("circle", {
                        cx: 45,
                        cy: 45,
                        r: 42,
                        fill: "none",
                        stroke: C.cyanDim,
                        strokeWidth: 1.5
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("circle", {
                        cx: 45,
                        cy: 45,
                        r: 30,
                        fill: "none",
                        stroke: C.cyan,
                        strokeWidth: 3,
                        opacity: 0.6
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("polygon", {
                        points: [
                          45,
                          13,
                          58,
                          45,
                          45,
                          77,
                          32,
                          45
                        ],
                        fill: "none",
                        stroke: C.white,
                        strokeWidth: 2
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("circle", {
                        cx: 45,
                        cy: 45,
                        r: 5,
                        fill: C.cyan
                      })
                    ]
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", {
                    style: saveButton,
                    hoverStyle: hover2,
                    onClick: save,
                    children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                      style: {
                        fontFamily: F.bold,
                        fontSize: 22,
                        letterSpacing: 4,
                        color: C.white,
                        lineBreak: "noWrap"
                      },
                      children: "SAVE"
                    })
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
                style: {
                  flexGrow: 1,
                  flexDirection: "column",
                  padding: {
                    left: 14,
                    right: 10,
                    top: 10,
                    bottom: 10
                  },
                  gap: 8
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                    style: small3,
                    children: "RECORDS"
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("node", {
                    style: {
                      flexGrow: 1,
                      flexBasis: 0,
                      flexDirection: "column",
                      gap: 6,
                      overflowY: "scroll"
                    },
                    scrollStep: 30,
                    children: saves.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                      style: {
                        ...small3,
                        color: C.cyanDim
                      },
                      children: "NO RECORDS"
                    }) : [
                      ...saves
                    ].reverse().map((s) => /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
                      style: {
                        flexShrink: 0,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "spaceBetween",
                        padding: {
                          left: 10,
                          right: 6,
                          vertical: 6
                        },
                        backgroundColor: C.cyanFaint,
                        border: {
                          left: 2
                        },
                        borderColor: C.cyan
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("node", {
                          style: {
                            flexDirection: "column",
                            gap: 1
                          },
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                              style: {
                                fontFamily: F.bold,
                                fontSize: 19,
                                letterSpacing: 1,
                                color: C.white,
                                lineBreak: "noWrap"
                              },
                              children: `#${String(s.id).padStart(2, "0")} \xB7 ${s.time}`
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                              style: small3,
                              children: OBJECTIVES[s.objective].title
                            })
                          ]
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", {
                          style: loadButton,
                          hoverStyle: hover2,
                          onClick: () => load(s.id),
                          children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("text", {
                            style: {
                              fontFamily: F.bold,
                              fontSize: 16,
                              letterSpacing: 2,
                              color: C.cyan,
                              lineBreak: "noWrap"
                            },
                            children: "LOAD"
                          })
                        })
                      ]
                    }, s.id))
                  })
                ]
              })
            ]
          })
        ]
      })
    });
  }
  var small3 = {
    fontFamily: F.semibold,
    fontSize: 15,
    letterSpacing: 1.5,
    color: C.cyanDim,
    lineBreak: "noWrap"
  };
  var saveButton = {
    padding: {
      horizontal: 26,
      vertical: 8
    },
    border: 1,
    borderColor: C.cyan,
    backgroundColor: C.glassHi
  };
  var loadButton = {
    padding: {
      horizontal: 12,
      vertical: 5
    },
    border: 1,
    borderColor: C.cyanLine,
    backgroundColor: C.glass
  };
  var hover2 = {
    backgroundColor: "rgba(127, 227, 255, 0.28)",
    borderColor: C.white
  };

  // src/holos/Spine.tsx
  var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
  var SEGMENTS = 10;
  var PITCH = 35;
  var TOP = 6;
  function vertebra(y) {
    return [
      5,
      y,
      43,
      y,
      43,
      y + 20,
      24,
      y + 30,
      5,
      y + 20
    ];
  }
  function Spine() {
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(Holo, {
      name: "spine",
      seed: 3,
      children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(SpineBar, {})
    });
  }
  function SpineBar() {
    const health = useGame((g2) => g2.suit.health);
    const color = health > 0.4 ? C.cyan : health > 0.2 ? C.amber : C.red;
    const pulse = useBlink(health <= 0.2, 380, 0.3);
    const level = health * SEGMENTS;
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("svg", {
      viewBox: "0 0 48 360",
      style: {
        width: 48,
        height: 360
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("line", {
          x1: 24,
          y1: 2,
          x2: 24,
          y2: 358,
          stroke: C.cyanDim,
          strokeWidth: 1.5,
          opacity: 0.55
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("rect", {
          x: 14,
          y: 1,
          width: 20,
          height: 2,
          fill: C.cyanDim
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("rect", {
          x: 14,
          y: 357,
          width: 20,
          height: 2,
          fill: C.cyanDim
        }),
        Array.from({
          length: SEGMENTS
        }, (_, i) => {
          const fromBottom = SEGMENTS - 1 - i;
          if (fromBottom < level) return null;
          return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("polygon", {
            points: vertebra(TOP + i * PITCH),
            fill: "none",
            stroke: C.cyanDim,
            strokeWidth: 1.2,
            opacity: 0.35
          }, `off${i}`);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("g", {
          opacity: {
            animated: pulse
          },
          children: Array.from({
            length: SEGMENTS
          }, (_, i) => {
            const fromBottom = SEGMENTS - 1 - i;
            const lit = Math.min(1, level - fromBottom);
            if (lit <= 0) return null;
            const y = TOP + i * PITCH;
            return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("g", {
              opacity: 0.3 + 0.7 * lit,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("polygon", {
                  points: vertebra(y),
                  fill: color,
                  opacity: 0.9
                }),
                /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("rect", {
                  x: 12,
                  y: y + 5,
                  width: 24,
                  height: 1.5,
                  fill: C.white
                })
              ]
            }, `on${i}`);
          })
        })
      ]
    });
  }

  // src/holos/Stasis.tsx
  var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
  var BLUE = "#6cc8ff";
  var START = -135;
  var GAP = 6;
  var SPAN = (270 - 3 * GAP) / 4;
  function Stasis() {
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(Holo, {
      name: "stasis",
      seed: 5,
      children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(StasisGauge, {})
    });
  }
  function StasisGauge() {
    const stasis2 = useGame((g2) => g2.suit.stasis);
    const level = stasis2 * 4;
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("node", {
      style: {
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("svg", {
          viewBox: "0 0 160 160",
          style: {
            positionType: "absolute",
            width: 160,
            height: 160
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("circle", {
              cx: 80,
              cy: 80,
              r: 74,
              fill: "none",
              stroke: C.cyanDim,
              strokeWidth: 1,
              opacity: 0.5
            }),
            Array.from({
              length: 12
            }, (_, i) => {
              const [x0, y0] = polar(80, 80, 74, i * 30);
              const [x1, y1] = polar(80, 80, 68, i * 30);
              return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("line", {
                x1: x0,
                y1: y0,
                x2: x1,
                y2: y1,
                stroke: C.cyanDim,
                strokeWidth: 1.4
              }, i);
            }),
            [
              0,
              1,
              2,
              3
            ].map((k) => {
              const from = START + k * (SPAN + GAP);
              const lit = Math.max(0, Math.min(1, level - k));
              return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("g", {
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("path", {
                    d: arc(80, 80, 56, from, from + SPAN),
                    fill: "none",
                    stroke: BLUE,
                    strokeWidth: 13,
                    opacity: 0.18
                  }),
                  lit > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("path", {
                    d: arc(80, 80, 56, from, from + SPAN * lit),
                    fill: "none",
                    stroke: BLUE,
                    strokeWidth: 13,
                    opacity: lit < 1 ? 0.55 : 0.95
                  }),
                  lit >= 1 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("path", {
                    d: arc(80, 80, 50, from + 2, from + SPAN - 2),
                    fill: "none",
                    stroke: C.white,
                    strokeWidth: 1.4
                  })
                ]
              }, k);
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("text", {
          style: {
            fontFamily: F.display,
            fontSize: 30,
            color: stasis2 >= 0.25 ? C.white : C.red,
            lineBreak: "noWrap"
          },
          children: Math.round(stasis2 * 100)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("text", {
          style: {
            fontFamily: F.semibold,
            fontSize: 13,
            letterSpacing: 2.5,
            color: BLUE,
            lineBreak: "noWrap"
          },
          children: "STASIS"
        })
      ]
    });
  }

  // src/holos/Store.tsx
  var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
  var import_react16 = __toESM(require_react(), 1);

  // src/holos/store/parts.tsx
  var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
  function ItemRow({ item, count, on: on2, value, valueColor = C.amber, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("button", {
      onClick,
      style: {
        flexShrink: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        height: 74,
        padding: {
          horizontal: 10
        },
        border: 1,
        borderColor: on2 ? C.white : "rgba(127, 227, 255, 0.16)",
        backgroundColor: on2 ? "rgba(240, 253, 255, 0.08)" : "rgba(4, 18, 28, 0.4)",
        cursor: "pointer"
      },
      hoverStyle: {
        backgroundColor: "rgba(127, 227, 255, 0.1)"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(ItemIcon, {
          item,
          size: 60,
          count,
          lit: on2
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 2,
            flexGrow: 1,
            flexShrink: 1
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
              style: {
                fontFamily: F.semibold,
                fontSize: 19,
                letterSpacing: 1.5,
                color: on2 ? C.white : C.cyan,
                lineBreak: "noWrap"
              },
              children: ITEMS[item].name.toUpperCase()
            }),
            /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
              style: {
                ...T.small,
                letterSpacing: 2
              },
              children: KIND_LABEL[ITEMS[item].kind]
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
          style: {
            fontFamily: F.display,
            fontSize: 19,
            color: valueColor
          },
          children: value
        })
      ]
    });
  }
  function List({ width = 600, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
      scrollStep: 40,
      style: {
        width,
        flexShrink: 0,
        height: 540,
        flexDirection: "column",
        gap: 6,
        overflowY: "scroll",
        transition: {
          scroll: {
            duration: 180,
            easing: "easeOut"
          }
        }
      },
      children
    });
  }
  function Detail2({ item, live, children }) {
    if (!item) {
      return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
        style: {
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
          style: {
            ...T.label,
            color: C.cyanDim,
            letterSpacing: 4
          },
          children: "NOTHING SELECTED"
        })
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("node", {
      style: {
        flexGrow: 1,
        flexDirection: "column",
        gap: 12
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("node", {
          style: {
            width: 340,
            height: 280,
            alignSelf: "center",
            border: 1,
            borderColor: "rgba(127, 227, 255, 0.25)",
            backgroundColor: "rgba(2, 10, 16, 1)"
          },
          children: live && /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("portal", {
            target: "preview",
            style: {
              width: "100%",
              height: "100%",
              cache: "never"
            }
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
          style: {
            ...T.header,
            fontSize: 25,
            color: C.white
          },
          children: ITEMS[item].name.toUpperCase()
        }),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(Rule, {}),
        /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("text", {
          style: {
            ...T.body,
            fontSize: 19
          },
          children: ITEMS[item].text
        }),
        children
      ]
    });
  }

  // src/holos/Store.tsx
  var TABS3 = [
    {
      id: "buy",
      label: "BUY"
    },
    {
      id: "sell",
      label: "SELL"
    },
    {
      id: "safe",
      label: "SAFE"
    }
  ];
  function catalog(owned) {
    return ITEM_IDS.filter((id) => {
      const item = ITEMS[id];
      if (item.price === 0 || item.kind === "valuable") return false;
      return item.kind !== "weapon" || !owned.includes(id);
    });
  }
  function Store() {
    const active = useLive("store");
    const [tab, setTab] = (0, import_react16.useState)("buy");
    const [item, setItem] = (0, import_react16.useState)("medpack-s");
    const [slot, setSlot] = (0, import_react16.useState)(0);
    const pack = useGame((g2) => g2.pack);
    const shown = tab === "buy" ? item : tab === "sell" ? pack.slots[slot]?.item : void 0;
    (0, import_react16.useEffect)(() => {
      if (active && shown) bevy.preview.show({
        item: shown
      });
    }, [
      active,
      shown
    ]);
    const pick = (next) => {
      if (next === tab) return;
      setTab(next);
      cue("tab");
    };
    useDebug("store", (id) => {
      if (TABS3.some((t) => t.id === id)) setTab(id);
    });
    useDebug("select", (id) => {
      if (!(id in ITEMS)) return;
      setTab("buy");
      setItem(id);
    });
    useDebug("buy", (id) => {
      if (!(id in ITEMS)) return;
      setTab("buy");
      setItem(id);
      buy(id);
    });
    useDebug("sell", (n) => {
      const at = Number(n);
      if (!getGame().pack.slots[at]) return;
      setTab("sell");
      setSlot(at);
      sell(at);
    });
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Holo, {
      name: "store",
      page: tab,
      seed: 5,
      children: /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(Shell, {
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
            style: {
              flexDirection: "row",
              alignItems: "center",
              gap: 18
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
                style: {
                  flexDirection: "column",
                  gap: 3
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
                    style: {
                      ...T.header,
                      fontSize: 28,
                      letterSpacing: 8
                    },
                    children: "STORE"
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
                    style: {
                      ...T.small,
                      letterSpacing: 2
                    },
                    children: "CONCOURSE C \xB7 HALDEN SUPPLY TERMINAL 07"
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("node", {
                style: {
                  flexGrow: 1
                }
              }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
                style: {
                  flexDirection: "column",
                  alignItems: "end",
                  gap: 1
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
                    style: {
                      ...T.small,
                      letterSpacing: 3
                    },
                    children: "CREDITS"
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
                    style: {
                      ...T.number,
                      fontSize: 42,
                      color: C.amber
                    },
                    children: credits(pack.credits)
                  })
                ]
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
            style: {
              flexDirection: "row",
              justifyContent: "spaceBetween",
              alignItems: "center",
              margin: {
                top: 10
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Tabs, {
                tabs: TABS3,
                active: tab,
                onPick: pick
              }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
                style: {
                  ...T.small,
                  letterSpacing: 2
                },
                children: "WHEEL \xB7 SCROLL"
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Rule, {}),
          /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
            style: {
              flexDirection: "row",
              gap: 30,
              flexGrow: 1,
              margin: {
                top: 16
              }
            },
            children: [
              tab === "buy" && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Buy, {
                item,
                live: active,
                onItem: setItem
              }),
              tab === "sell" && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Sell, {
                slot,
                live: active,
                onSlot: setSlot
              }),
              tab === "safe" && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Safe, {})
            ]
          })
        ]
      })
    });
  }
  function Buy({ item, live, onItem }) {
    const g2 = useGame();
    const items = catalog(g2.arms.owned);
    const price = ITEMS[item].price;
    const afford = price <= g2.pack.credits;
    const owned = g2.arms.owned.includes(item);
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(import_jsx_runtime25.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(List, {
          children: items.map((id) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ItemRow, {
            item: id,
            on: id === item,
            value: credits(ITEMS[id].price),
            valueColor: ITEMS[id].price <= g2.pack.credits ? C.amber : C.amberDim,
            onClick: () => {
              onItem(id);
              cue("tick");
            }
          }, id))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(Detail2, {
          item,
          live,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
              style: {
                flexDirection: "row",
                gap: 34
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Figure, {
                  label: "PRICE",
                  value: credits(price),
                  color: afford ? C.amber : C.red
                }),
                /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Figure, {
                  label: "IN PACK",
                  value: owned ? "OWNED" : String(ITEMS[item].kind === "weapon" ? 0 : countItem(g2.pack, item))
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
              style: {
                flexDirection: "row",
                alignItems: "center",
                gap: 18
              },
              children: [
                owned ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
                  style: {
                    ...T.small,
                    letterSpacing: 2,
                    color: C.green
                  },
                  children: "OWNED \xB7 Q DRAWS IT"
                }) : /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(HoloButton, {
                  label: "BUY",
                  wide: true,
                  tone: C.amber,
                  onClick: () => buy(item)
                }),
                !owned && !afford && /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
                  style: {
                    ...T.small,
                    letterSpacing: 2,
                    color: C.red
                  },
                  children: "INSUFFICIENT CREDITS"
                })
              ]
            })
          ]
        })
      ]
    });
  }
  function Sell({ slot, live, onSlot }) {
    const slots = useGame((g2) => g2.pack.slots);
    const s = slots[slot];
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(import_jsx_runtime25.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(List, {
          children: slots.map((x, i) => x ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ItemRow, {
            item: x.item,
            count: x.count,
            on: i === slot,
            value: credits(sellPrice(x.item)),
            onClick: () => {
              onSlot(i);
              cue("tick");
            }
          }, i) : null)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Detail2, {
          item: s?.item,
          live,
          children: s && /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(import_jsx_runtime25.Fragment, {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
                style: {
                  flexDirection: "row",
                  gap: 34
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Figure, {
                    label: "PAYS",
                    value: credits(sellPrice(s.item)),
                    color: C.amber
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Figure, {
                    label: "CARRIED",
                    value: String(s.count)
                  })
                ]
              }),
              /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(HoloButton, {
                label: "SELL ONE",
                wide: true,
                tone: C.amber,
                onClick: () => sell(slot)
              })
            ]
          })
        })
      ]
    });
  }
  function Safe() {
    const pack = useGame((g2) => g2.pack);
    const used = pack.slots.filter(Boolean).length;
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)(import_jsx_runtime25.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Heading, {
              text: `SUIT \xB7 ${used} / ${PACK_SLOTS}`,
              hint: "CLICK TO STORE \u2192"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(List, {
              width: 590,
              children: pack.slots.map((x, i) => x ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ItemRow, {
                item: x.item,
                count: x.count,
                on: false,
                value: "\u203A",
                valueColor: C.cyan,
                onClick: () => stow(i)
              }, i) : null)
            })
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
          style: {
            flexDirection: "column",
            gap: 10
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(Heading, {
              text: `SAFE \xB7 ${pack.safe.length} STACKS`,
              hint: "\u2190 CLICK TO TAKE"
            }),
            /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(List, {
              width: 590,
              children: pack.safe.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ItemRow, {
                item: x.item,
                count: x.count,
                on: false,
                value: "\u2039",
                valueColor: C.cyan,
                onClick: () => retrieve(i)
              }, x.item))
            })
          ]
        })
      ]
    });
  }
  function Heading({ text, hint: hint3 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
      style: {
        flexDirection: "row",
        justifyContent: "spaceBetween",
        width: 590
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 3,
            color: C.cyan
          },
          children: text
        }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 2
          },
          children: hint3
        })
      ]
    });
  }
  function Figure({ label, value, color = C.cyan }) {
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("node", {
      style: {
        flexDirection: "column",
        gap: 2
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
          style: {
            ...T.small,
            letterSpacing: 2
          },
          children: label
        }),
        /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("text", {
          style: {
            ...T.number,
            fontSize: 28,
            color
          },
          children: value
        })
      ]
    });
  }

  // src/controls.tsx
  function menu(open) {
    if (dispatch({
      type: "menu",
      open
    })) cue(open ? "holoOpen" : "holoClose");
  }
  function Controls() {
    useKeys(true, (e) => {
      const { here } = getGame();
      if (e.code === "Tab") return menu(!here.menu);
      if (here.menu) {
        if (/^Key[WASDF]$/.test(e.code)) menu(false);
        return;
      }
      if (e.code === "KeyR") reload();
      else if (e.code === "KeyQ") swap();
      else if (e.code === "KeyM") heal();
      else if (e.code === "KeyC") stasis();
      else if (e.code === "KeyH") hit();
      else if (e.code === "KeyV") vacuum();
      else if (e.code === "KeyL") {
        if (e.shiftKey) nextDestination();
        else locate();
      }
    });
    useEvent("player.fire", () => fire());
    useDebug("menu", (arg) => menu(arg !== "off"));
    useDebug("hit", hit);
    useDebug("heal", heal);
    useDebug("stasis", stasis);
    useDebug("vacuum", (arg) => vacuum(arg ? arg === "on" : void 0));
    useDebug("fire", fire);
    useDebug("reload", reload);
    useDebug("swap", swap);
    useDebug("locator", (to) => {
      if (DESTINATIONS.includes(to)) locate(to);
      else locate();
    });
    useDebug("elevator", (floor) => call(Number(floor)));
    useDebug("save", save);
    useDebug("load", (id) => load(Number(id)));
    return null;
  }

  // src/App.tsx
  var INTRO_MS = 2e4;
  function App() {
    const game = useGame();
    useEvent("holo.active", ({ surface, active }) => dispatch({
      type: "near",
      surface,
      on: active
    }));
    useEvent("player.stance", ({ aiming, mouse, screen: screen2, offer }) => dispatch({
      type: "stance",
      aiming,
      mouse,
      screen: screen2,
      offer
    }));
    (0, import_react17.useEffect)(() => bevy.player.sync(null), []);
    (0, import_react17.useEffect)(() => {
      const t = setTimeout(() => dispatch({
        type: "introOver"
      }), INTRO_MS);
      return () => clearTimeout(t);
    }, []);
    const shown = (0, import_react17.useRef)(/* @__PURE__ */ new Set());
    const open = openHolos(game).join(",");
    (0, import_react17.useEffect)(() => {
      const next = new Set(open.split(","));
      for (const surface of next) if (!shown.current.has(surface)) bevy.holo.open({
        surface,
        open: true
      });
      for (const surface of shown.current) if (!next.has(surface)) bevy.holo.open({
        surface,
        open: false
      });
      shown.current = next;
    }, [
      open
    ]);
    const vented = (0, import_react17.useRef)(game.suit.vacuum);
    (0, import_react17.useEffect)(() => {
      if (vented.current === game.suit.vacuum) return;
      vented.current = game.suit.vacuum;
      cue(game.suit.vacuum ? "holoOpen" : "holoClose");
    }, [
      game.suit.vacuum
    ]);
    (0, import_react17.useEffect)(() => {
      bevy.weapon.equip({
        weapon: game.arms.weapon
      });
    }, [
      game.arms.weapon
    ]);
    (0, import_react17.useEffect)(() => {
      bevy.suit.vacuum({
        on: game.suit.vacuum
      });
    }, [
      game.suit.vacuum
    ]);
    const to = OBJECTIVES[objective(game)].to;
    (0, import_react17.useEffect)(() => bevy.map.mark({
      to
    }), [
      to
    ]);
    (0, import_react17.useEffect)(() => {
      if (!game.suit.vacuum) return;
      const t = setInterval(() => dispatch({
        type: "air",
        dt: 0.25
      }), 250);
      return () => clearInterval(t);
    }, [
      game.suit.vacuum
    ]);
    const lowAir = game.suit.vacuum && game.suit.air < 15;
    (0, import_react17.useEffect)(() => {
      if (!lowAir) return;
      cue("lowAir");
      const t = setInterval(() => cue("lowAir"), 1800);
      return () => clearInterval(t);
    }, [
      lowAir
    ]);
    useEvent("door.opened", () => dispatch({
      type: "opened"
    }));
    useEvent("elevator.arrived", ({ floor }) => dispatch({
      type: "arrived",
      floor
    }));
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)(import_jsx_runtime26.Fragment, {
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Terminal, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Prompt, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Spine, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Stasis, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Air, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Ammo, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Menu, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Store, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Bench, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Lock, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Save, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Elevator, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Floor, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Hack, {}),
        /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(Controls, {})
      ]
    });
  }

  // src/index.tsx
  (0, import_bevy_react6.mount)(/* @__PURE__ */ (0, import_jsx_runtime27.jsx)(App, {}));
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidmVuZG9yLWdsb2JhbDpiZXZ5LXJlYWN0L2pzeC1ydW50aW1lIiwgInZlbmRvci1nbG9iYWw6YmV2eS1yZWFjdCIsICJ2ZW5kb3ItZ2xvYmFsOnJlYWN0IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9pbmRleC50c3giLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL0FwcC50c3giLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2JldnkudHMiLCAiLi4vc3JjL2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvZ2FtZS9sb3JlLnRzIiwgIi4uL3NyYy9nYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2dhbWUvYmVuY2gudHMiLCAiLi4vc3JjL2dhbWUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvZ2FtZS9pdGVtcy50cyIsICIuLi9zcmMvZ2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9nYW1lL3JlZHVjZS50cyIsICIuLi9zcmMvZ2FtZS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9nYW1lL3N0b3JlLnRzIiwgIi4uL3NyYy9nYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2dhbWUvc3RhdGUudHMiLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvb2tzLnRzIiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy90aGVtZS50cyIsICIuLi9zcmMvaG9sb3MvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvSG9sby50c3giLCAiLi4vc3JjL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL3NvdW5kLnRzIiwgIi4uL3NyYy9nYW1lL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2dhbWUvYWN0LnRzIiwgIi4uL3NyYy9ob2xvcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9oaW50LnRzIiwgIi4uL3NyYy9ob2xvcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9vcGVuLnRzIiwgIi4uL3NyYy9ob2xvcy9zdWl0L2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL3N1aXQvbG9vcHMudHMiLCAiLi4vc3JjL2hvbG9zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL0Fpci50c3giLCAiLi4vc3JjL2hvbG9zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL0FtbW8udHN4IiwgIi4uL3NyYy9ob2xvcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9CZW5jaC50c3giLCAiLi4vc3JjL2hvbG9zL2JlbmNoL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL2JlbmNoL0NpcmN1aXQudHN4IiwgIi4uL3NyYy9ob2xvcy9zaGFyZWQvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3Mvc2hhcmVkL2tpdC50c3giLCAiLi4vc3JjL2hvbG9zL2ZpeHR1cmVzL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL2ZpeHR1cmVzL2Zsb29ycy50c3giLCAiLi4vc3JjL2hvbG9zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL0VsZXZhdG9yLnRzeCIsICIuLi9zcmMvaG9sb3MvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvRmxvb3IudHN4IiwgIi4uL3NyYy9ob2xvcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9IYWNrLnRzeCIsICIuLi9zcmMvaG9sb3Mvc3VpdC9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9zdWl0L2FyY3MudHMiLCAiLi4vc3JjL2hvbG9zL2hhY2svaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvaGFjay91c2VCeXBhc3MudHMiLCAiLi4vc3JjL2hvbG9zL2hhY2svaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvaGFjay9EaWFsLnRzeCIsICIuLi9zcmMvaG9sb3MvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvTG9jay50c3giLCAiLi4vc3JjL2hvbG9zL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL01lbnUudHN4IiwgIi4uL3NyYy9ob2xvcy9tZW51L2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL21lbnUvSW52ZW50b3J5LnRzeCIsICIuLi9zcmMvaG9sb3Mvc2hhcmVkL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL3NoYXJlZC9pdGVtcy50c3giLCAiLi4vc3JjL2hvbG9zL21lbnUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvbWVudS9Mb2dzLnRzeCIsICIuLi9zcmMvaG9sb3MvbWVudS9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9tZW51L01hcFRhYi50c3giLCAiLi4vc3JjL2hvbG9zL21lbnUvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvbWVudS9PYmplY3RpdmVzLnRzeCIsICIuLi9zcmMvaG9sb3MvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvUHJvbXB0LnRzeCIsICIuLi9zcmMvaG9sb3MvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvVGVybWluYWwudHN4IiwgIi4uL3NyYy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9rZXlzLnRzIiwgIi4uL3NyYy9ob2xvcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9TYXZlLnRzeCIsICIuLi9zcmMvaG9sb3MvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvaG9sb3MvU3BpbmUudHN4IiwgIi4uL3NyYy9ob2xvcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9TdGFzaXMudHN4IiwgIi4uL3NyYy9ob2xvcy9ob21lL3R1bC9Qcm9qZWN0cy9iZXZ5LXJlYWN0L2V4YW1wbGVzL2NvbGR3YWtlL3VpL3NyYy9ob2xvcy9TdG9yZS50c3giLCAiLi4vc3JjL2hvbG9zL3N0b3JlL2hvbWUvdHVsL1Byb2plY3RzL2JldnktcmVhY3QvZXhhbXBsZXMvY29sZHdha2UvdWkvc3JjL2hvbG9zL3N0b3JlL3BhcnRzLnRzeCIsICIuLi9zcmMvaG9tZS90dWwvUHJvamVjdHMvYmV2eS1yZWFjdC9leGFtcGxlcy9jb2xkd2FrZS91aS9zcmMvY29udHJvbHMudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFRoaXMuX19iZXZ5VmVuZG9yW1wiYmV2eS1yZWFjdC9qc3gtcnVudGltZVwiXTsiLCAibW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLl9fYmV2eVZlbmRvcltcImJldnktcmVhY3RcIl07IiwgIm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5fX2JldnlWZW5kb3JbXCJyZWFjdFwiXTsiLCAiaW1wb3J0IHsgbW91bnQgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSBcIi4vQXBwXCI7XG5cbi8vIGBtb3VudGAgcGFya3Mgb24gdGhlIFJ1c3QtZHJpdmVuIGV2ZW50IGxvb3AgYW5kIG5ldmVyIHJlc29sdmVzLiBPbiBhIGhvdFxuLy8gcmVsb2FkIHRoaXMgZmlsZSByZS1leGVjdXRlcyBhbmQgYG1vdW50YCB0cmlnZ2VycyBhIFJlYWN0IEZhc3QgUmVmcmVzaC5cbm1vdW50KDxBcHAgLz4pO1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBiZXZ5IH0gZnJvbSBcIi4vYmV2eVwiO1xuaW1wb3J0IHsgT0JKRUNUSVZFUyB9IGZyb20gXCIuL2dhbWUvbG9yZVwiO1xuaW1wb3J0IHsgb2JqZWN0aXZlIH0gZnJvbSBcIi4vZ2FtZS9yZWR1Y2VcIjtcbmltcG9ydCB7IGRpc3BhdGNoLCB1c2VHYW1lIH0gZnJvbSBcIi4vZ2FtZS9zdG9yZVwiO1xuaW1wb3J0IHsgdXNlRXZlbnQgfSBmcm9tIFwiLi9ob29rc1wiO1xuaW1wb3J0IHsgQWlyIH0gZnJvbSBcIi4vaG9sb3MvQWlyXCI7XG5pbXBvcnQgeyBBbW1vIH0gZnJvbSBcIi4vaG9sb3MvQW1tb1wiO1xuaW1wb3J0IHsgQmVuY2ggfSBmcm9tIFwiLi9ob2xvcy9CZW5jaFwiO1xuaW1wb3J0IHsgRWxldmF0b3IgfSBmcm9tIFwiLi9ob2xvcy9FbGV2YXRvclwiO1xuaW1wb3J0IHsgRmxvb3IgfSBmcm9tIFwiLi9ob2xvcy9GbG9vclwiO1xuaW1wb3J0IHsgSGFjayB9IGZyb20gXCIuL2hvbG9zL0hhY2tcIjtcbmltcG9ydCB7IExvY2sgfSBmcm9tIFwiLi9ob2xvcy9Mb2NrXCI7XG5pbXBvcnQgeyBNZW51IH0gZnJvbSBcIi4vaG9sb3MvTWVudVwiO1xuaW1wb3J0IHsgUHJvbXB0IH0gZnJvbSBcIi4vaG9sb3MvUHJvbXB0XCI7XG5pbXBvcnQgeyBTYXZlIH0gZnJvbSBcIi4vaG9sb3MvU2F2ZVwiO1xuaW1wb3J0IHsgU3BpbmUgfSBmcm9tIFwiLi9ob2xvcy9TcGluZVwiO1xuaW1wb3J0IHsgU3Rhc2lzIH0gZnJvbSBcIi4vaG9sb3MvU3Rhc2lzXCI7XG5pbXBvcnQgeyBTdG9yZSB9IGZyb20gXCIuL2hvbG9zL1N0b3JlXCI7XG5pbXBvcnQgeyBUZXJtaW5hbCB9IGZyb20gXCIuL2hvbG9zL1Rlcm1pbmFsXCI7XG5pbXBvcnQgeyBvcGVuSG9sb3MgfSBmcm9tIFwiLi9ob2xvcy9vcGVuXCI7XG5pbXBvcnQgdHlwZSB7IFN1cmZhY2VOYW1lIH0gZnJvbSBcIi4vaG9sb3Mvc3VyZmFjZXNcIjtcbmltcG9ydCB7IENvbnRyb2xzIH0gZnJvbSBcIi4vY29udHJvbHNcIjtcbmltcG9ydCB7IGN1ZSB9IGZyb20gXCIuL3NvdW5kXCI7XG5cbi8qKiBUaGUgcHJvbXB0IG5hbWVzIHRoZSBiYXNpYyBrZXlzIHRoaXMgbG9uZy4gKi9cbmNvbnN0IElOVFJPX01TID0gMjBfMDAwO1xuXG5leHBvcnQgZnVuY3Rpb24gQXBwKCkge1xuICBjb25zdCBnYW1lID0gdXNlR2FtZSgpO1xuXG4gIC8vIEJldnkgc2F5cyB3aGVyZSBoZSBpcyBhbmQgd2hhdCBoaXMgaGFuZHMgZG87IGFzayBmb3IgYWxsIG9mIGl0IG9uY2VcbiAgLy8gKHRoaXMgdHJlZSBtYXkgaGF2ZSBtb3VudGVkIGFmdGVyIEJldnkgbGFzdCBzYWlkIGl0KS5cbiAgdXNlRXZlbnQoXCJob2xvLmFjdGl2ZVwiLCAoeyBzdXJmYWNlLCBhY3RpdmUgfSkgPT5cbiAgICBkaXNwYXRjaCh7IHR5cGU6IFwibmVhclwiLCBzdXJmYWNlOiBzdXJmYWNlIGFzIFN1cmZhY2VOYW1lLCBvbjogYWN0aXZlIH0pLFxuICApO1xuICB1c2VFdmVudChcInBsYXllci5zdGFuY2VcIiwgKHsgYWltaW5nLCBtb3VzZSwgc2NyZWVuLCBvZmZlciB9KSA9PlxuICAgIGRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IFwic3RhbmNlXCIsXG4gICAgICBhaW1pbmcsXG4gICAgICBtb3VzZSxcbiAgICAgIHNjcmVlbjogc2NyZWVuIGFzIFN1cmZhY2VOYW1lIHwgbnVsbCxcbiAgICAgIG9mZmVyOiBvZmZlciBhcyBTdXJmYWNlTmFtZSB8IG51bGwsXG4gICAgfSksXG4gICk7XG4gIHVzZUVmZmVjdCgoKSA9PiBiZXZ5LnBsYXllci5zeW5jKG51bGwpLCBbXSk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdCA9IHNldFRpbWVvdXQoKCkgPT4gZGlzcGF0Y2goeyB0eXBlOiBcImludHJvT3ZlclwiIH0pLCBJTlRST19NUyk7XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0KTtcbiAgfSwgW10pO1xuXG4gIC8vIFRlbGwgQmV2eSB3aGljaCBob2xvZ3JhbXMgYXJlIHVuZm9sZGVkIChvbmx5IHRoZSBjaGFuZ2VzKS5cbiAgY29uc3Qgc2hvd24gPSB1c2VSZWYobmV3IFNldDxTdXJmYWNlTmFtZT4oKSk7XG4gIGNvbnN0IG9wZW4gPSBvcGVuSG9sb3MoZ2FtZSkuam9pbihcIixcIik7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IG5ldyBTZXQob3Blbi5zcGxpdChcIixcIikgYXMgU3VyZmFjZU5hbWVbXSk7XG4gICAgZm9yIChjb25zdCBzdXJmYWNlIG9mIG5leHQpXG4gICAgICBpZiAoIXNob3duLmN1cnJlbnQuaGFzKHN1cmZhY2UpKSBiZXZ5LmhvbG8ub3Blbih7IHN1cmZhY2UsIG9wZW46IHRydWUgfSk7XG4gICAgZm9yIChjb25zdCBzdXJmYWNlIG9mIHNob3duLmN1cnJlbnQpXG4gICAgICBpZiAoIW5leHQuaGFzKHN1cmZhY2UpKSBiZXZ5LmhvbG8ub3Blbih7IHN1cmZhY2UsIG9wZW46IGZhbHNlIH0pO1xuICAgIHNob3duLmN1cnJlbnQgPSBuZXh0O1xuICB9LCBbb3Blbl0pO1xuXG4gIC8vIFRoZSBhaXIgcmVhZG91dCBjb21lcyBvbiwgYW5kIGdvZXMsIHdpdGggYSBzb3VuZC4gKFRoZSBmaXh0dXJlcydcbiAgLy8gcGFuZWxzIHdha2UgYW5kIHNsZWVwIHNpbGVudGx5OyB0aGUgc3VpdCBtZW51J3Mgc291bmQgaXMgaXRzIGtleSdzLFxuICAvLyBgY29udHJvbHMudHN4YC4pXG4gIGNvbnN0IHZlbnRlZCA9IHVzZVJlZihnYW1lLnN1aXQudmFjdXVtKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAodmVudGVkLmN1cnJlbnQgPT09IGdhbWUuc3VpdC52YWN1dW0pIHJldHVybjtcbiAgICB2ZW50ZWQuY3VycmVudCA9IGdhbWUuc3VpdC52YWN1dW07XG4gICAgY3VlKGdhbWUuc3VpdC52YWN1dW0gPyBcImhvbG9PcGVuXCIgOiBcImhvbG9DbG9zZVwiKTtcbiAgfSwgW2dhbWUuc3VpdC52YWN1dW1dKTtcblxuICAvLyBUaGUgd2VhcG9uIGluIGhpcyBoYW5kcyBhbmQgdGhlIHJvb20ncyBhaXIgZm9sbG93IHRoZSBnYW1lIChhIGxvYWQgY2FuXG4gIC8vIGNoYW5nZSBlaXRoZXIpLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGJldnkud2VhcG9uLmVxdWlwKHsgd2VhcG9uOiBnYW1lLmFybXMud2VhcG9uIH0pO1xuICB9LCBbZ2FtZS5hcm1zLndlYXBvbl0pO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGJldnkuc3VpdC52YWN1dW0oeyBvbjogZ2FtZS5zdWl0LnZhY3V1bSB9KTtcbiAgfSwgW2dhbWUuc3VpdC52YWN1dW1dKTtcblxuICAvLyBUaGUgbWFwIG1hcmtzIHdoZXJlIHRoZSBjdXJyZW50IG9iamVjdGl2ZSBsZWFkcy5cbiAgY29uc3QgdG8gPSBPQkpFQ1RJVkVTW29iamVjdGl2ZShnYW1lKV0udG87XG4gIHVzZUVmZmVjdCgoKSA9PiBiZXZ5Lm1hcC5tYXJrKHsgdG8gfSksIFt0b10pO1xuXG4gIC8vIFRoZSB0YW5rcyBkcmFpbiB3aGlsZSB0aGUgcm9vbSBoYXMgbm8gYWlyLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghZ2FtZS5zdWl0LnZhY3V1bSkgcmV0dXJuO1xuICAgIGNvbnN0IHQgPSBzZXRJbnRlcnZhbCgoKSA9PiBkaXNwYXRjaCh7IHR5cGU6IFwiYWlyXCIsIGR0OiAwLjI1IH0pLCAyNTApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHQpO1xuICB9LCBbZ2FtZS5zdWl0LnZhY3V1bV0pO1xuXG4gIC8vIFRoZSBzdWl0IGJlZXBzIHdoaWxlIHRoZSB0YW5rcyBydW4gbG93LlxuICBjb25zdCBsb3dBaXIgPSBnYW1lLnN1aXQudmFjdXVtICYmIGdhbWUuc3VpdC5haXIgPCAxNTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWxvd0FpcikgcmV0dXJuO1xuICAgIGN1ZShcImxvd0FpclwiKTtcbiAgICBjb25zdCB0ID0gc2V0SW50ZXJ2YWwoKCkgPT4gY3VlKFwibG93QWlyXCIpLCAxODAwKTtcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbCh0KTtcbiAgfSwgW2xvd0Fpcl0pO1xuXG4gIHVzZUV2ZW50KFwiZG9vci5vcGVuZWRcIiwgKCkgPT4gZGlzcGF0Y2goeyB0eXBlOiBcIm9wZW5lZFwiIH0pKTtcbiAgdXNlRXZlbnQoXCJlbGV2YXRvci5hcnJpdmVkXCIsICh7IGZsb29yIH0pID0+XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBcImFycml2ZWRcIiwgZmxvb3IgfSksXG4gICk7XG5cbiAgLy8gTm90aGluZyBpcyBkcmF3biBvbiB0aGUgc2NyZWVuIGl0c2VsZjogZXZlcnkgcmVhZG91dCBpcyBhIHN1cmZhY2Ugb3V0XG4gIC8vIGluIHRoZSByb29tLlxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8VGVybWluYWwgLz5cbiAgICAgIDxQcm9tcHQgLz5cbiAgICAgIDxTcGluZSAvPlxuICAgICAgPFN0YXNpcyAvPlxuICAgICAgPEFpciAvPlxuICAgICAgPEFtbW8gLz5cbiAgICAgIDxNZW51IC8+XG4gICAgICA8U3RvcmUgLz5cbiAgICAgIDxCZW5jaCAvPlxuICAgICAgPExvY2sgLz5cbiAgICAgIDxTYXZlIC8+XG4gICAgICA8RWxldmF0b3IgLz5cbiAgICAgIDxGbG9vciAvPlxuICAgICAgPEhhY2sgLz5cbiAgICAgIDxDb250cm9scyAvPlxuICAgIDwvPlxuICApO1xufVxuIiwgIi8vIEBnZW5lcmF0ZWQgYnkgYmV2eS1yZWFjdCDigJQgZG8gbm90IGVkaXQgYnkgaGFuZC5cbi8vIE1pcnJvcnMgdGhlIFJ1c3QgYCNbcmVhY3RfbWVzc2FnZV1gIC8gYCNbcmVhY3RfcmVxdWVzdF1gIC8gYCNbcmVhY3RfZXZlbnRdYFxuLy8gdHlwZXMgYW5kIHRoZSByZWdpc3RlcmVkIGAjW3JlYWN0X2ZpbHRlcl1gcyAvIGAjW3JlYWN0X21vcnBoX2ZpbHRlcl1gcyAocGx1c1xuLy8gYnVpbHQtaW5zKS4gUmVnZW5lcmF0ZSB2aWEgeW91ciBhcHAncyBgQXBwOjpleHBvcnRfcmVhY3RfdHlwZXNjcmlwdGAgZXhwb3J0ZXIuXG5cbmltcG9ydCB7XG4gIGVtaXQgYXMgcmF3RW1pdCxcbiAgcmVxdWVzdCBhcyByYXdSZXF1ZXN0LFxuICBhZGRFdmVudExpc3RlbmVyIGFzIHJhd0FkZEV2ZW50TGlzdGVuZXIsXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIgYXMgcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcixcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgUmVhY3ROb2RlLCBSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQW5jaG9yU2NhbGluZywgQW5pbWF0YWJsZSwgQmV2eUF0dHJpYnV0ZXMsIEJldnlDYW52YXNFbGVtZW50LCBCZXZ5Rm9jdXNQcm9wcywgQmV2eVBvaW50ZXJQcm9wcywgQmV2eVNjcm9sbFByb3BzLCBCZXZ5U2hhcGVUcmFuc2l0aW9uLCBCZXZ5U3R5bGUsIEJldnlWYXJpYW50UHJvcHMsIEJldnlXaGVlbFByb3BzLCBDYW52YXNQYWludGVyLCBEcmF3Q21kLCBWZWMzIH0gZnJvbSBcImJldnktcmVhY3RcIjtcblxuZXhwb3J0IHR5cGUgQWN0ID0geyBhY3Rpb246IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIEJsb29tUGFyYW1zID0geyByYWRpdXM6IG51bWJlciB8IHN0cmluZywgdGhyZXNob2xkOiBudW1iZXIsIGludGVuc2l0eTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQmx1clBhcmFtcyA9IHsgcmFkaXVzOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBCcmlnaHRuZXNzUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENhbGxFbGV2YXRvciA9IHsgZmxvb3I6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIENhbnZhc1NpemUgPSB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgQ2hyb21hdGljQWJlcnJhdGlvblBhcmFtcyA9IHsgb2Zmc2V0OiBudW1iZXIgfCBzdHJpbmcsIGFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiBUYW5nZW50aWFsIHN3aXJsOiB0aGUgUiBpbWFnZSByb3RhdGVzIGJ5IGArcm90YXRpb25gIGRlZ3JlZXNcbiAqIChjbG9ja3dpc2UsIHktZG93bikgYXJvdW5kIHRoZSBub2RlJ3MgY2VudGVyLCBCIGJ5IGAtcm90YXRpb25gLlxuICogUGxhaW4gbnVtYmVyIGluIGRlZ3JlZXMg4oCUIGEgc2NhbGFyIG1hZ25pdHVkZSwgc28gdHJhbnNpdGlvbnMgdW53aW5kXG4gKiBsaW5lYXJseSB0aHJvdWdoIGV2ZXJ5IHR1cm4uIDAgPSBwdXJlbHkgZGlyZWN0aW9uYWwgc3BsaXQuXG4gKi9cbnJvdGF0aW9uOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBDb250cmFzdFBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBDcm9zc2ZhZGVQYXJhbXMgPSB7IFxuLyoqXG4gKiAwLi4xIHN0YWdnZXIgYW1vdW50OyAwIGlzIHRoZSBwbGFpbiB1bmlmb3JtIGNyb3NzZmFkZS5cbiAqL1xuc3ByZWFkOiBudW1iZXIsIFxuLyoqXG4gKiBOb2lzZSBmZWF0dXJlIHNpemUgaW4gbG9naWNhbCBweC5cbiAqL1xuc2NhbGU6IG51bWJlciB8IHN0cmluZywgXG4vKipcbiAqIDAuLjEgbG9jYWwgZmFkZSB3aW5kb3cgKGZyYWN0aW9uIG9mIHRoZSBwcm9ncmVzcyByYW5nZSkuXG4gKi9cbnNvZnRuZXNzOiBudW1iZXIsIFxuLyoqXG4gKiBSZS1yb2xscyB0aGUgbm9pc2UgcGF0dGVybiAoZG9tYWluIG9mZnNldCkuXG4gKi9cbnNlZWQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEN1ZSA9IHsgbmFtZTogc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgRG9vck9wZW5lZCA9IG51bGw7XG5leHBvcnQgdHlwZSBFbGV2YXRvckFycml2ZWQgPSB7IGZsb29yOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBFcXVpcCA9IHsgd2VhcG9uOiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBGaXJlID0gbnVsbDtcbmV4cG9ydCB0eXBlIEZpcmVTaG90ID0gbnVsbDtcbmV4cG9ydCB0eXBlIEdhbWVwYWRBeGlzQ2hhbmdlID0geyBnYW1lcGFkOiBudW1iZXIsIGF4aXM6IEdhbWVwYWRBeGlzTmFtZSwgdmFsdWU6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRBeGlzTmFtZSA9IFwibGVmdFN0aWNrWFwiIHwgXCJsZWZ0U3RpY2tZXCIgfCBcImxlZnRaXCIgfCBcInJpZ2h0U3RpY2tYXCIgfCBcInJpZ2h0U3RpY2tZXCIgfCBcInJpZ2h0WlwiIHwgeyBcIm90aGVyXCI6IG51bWJlciB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEJ1dHRvbkNoYW5nZSA9IHsgZ2FtZXBhZDogbnVtYmVyLCBidXR0b246IEdhbWVwYWRCdXR0b25OYW1lLCBcbi8qKlxuICogRGlnaXRhbCBzdGF0ZSBhZnRlciB0aGUgY2hhbmdlICh0aHJlc2hvbGRzIGZyb20gYEdhbWVwYWRTZXR0aW5nc2ApLlxuICovXG5wcmVzc2VkOiBib29sZWFuLCBcbi8qKlxuICogQW5hbG9nIHZhbHVlIGluIGAwLjAuLj0xLjBgICh0cmlnZ2VycyByZXBvcnQgdGhlIGZ1bGwgcmFuZ2UpLlxuICovXG52YWx1ZTogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZEJ1dHRvbk5hbWUgPSBcInNvdXRoXCIgfCBcImVhc3RcIiB8IFwibm9ydGhcIiB8IFwid2VzdFwiIHwgXCJjXCIgfCBcInpcIiB8IFwibGVmdFRyaWdnZXJcIiB8IFwibGVmdFRyaWdnZXIyXCIgfCBcInJpZ2h0VHJpZ2dlclwiIHwgXCJyaWdodFRyaWdnZXIyXCIgfCBcInNlbGVjdFwiIHwgXCJzdGFydFwiIHwgXCJtb2RlXCIgfCBcImxlZnRUaHVtYlwiIHwgXCJyaWdodFRodW1iXCIgfCBcImRQYWRVcFwiIHwgXCJkUGFkRG93blwiIHwgXCJkUGFkTGVmdFwiIHwgXCJkUGFkUmlnaHRcIiB8IHsgXCJvdGhlclwiOiBudW1iZXIgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRDb25uZWN0ZWQgPSBHYW1lcGFkQ29ubmVjdGVkRGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRDb25uZWN0ZWREYXRhID0geyBcbi8qKlxuICogTW9ub3RvbmljIHdpcmUgaWQg4oCUIG5ldmVyIHJldXNlZCBhY3Jvc3MgcmVjb25uZWN0cy5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCBcbi8qKlxuICogT1MtcHJvdmlkZWQgZGV2aWNlIG5hbWUuXG4gKi9cbm5hbWU6IHN0cmluZywgXG4vKipcbiAqIFVTQiB2ZW5kb3IgaWQsIHdoZW4gdGhlIGJhY2tlbmQga25vd3MgaXQuXG4gKi9cbnZlbmRvcklkOiBudW1iZXIgfCBudWxsLCBcbi8qKlxuICogVVNCIHByb2R1Y3QgaWQsIHdoZW4gdGhlIGJhY2tlbmQga25vd3MgaXQuXG4gKi9cbnByb2R1Y3RJZDogbnVtYmVyIHwgbnVsbCwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWREaXNjb25uZWN0ZWQgPSBHYW1lcGFkRGlzY29ubmVjdGVkRGF0YTtcbmV4cG9ydCB0eXBlIEdhbWVwYWREaXNjb25uZWN0ZWREYXRhID0geyBcbi8qKlxuICogVGhlIHdpcmUgaWQgdGhlIHBhZCB3YXMgYW5ub3VuY2VkIHVuZGVyLiBSZXRpcmVkIGZvciBnb29kLlxuICovXG5nYW1lcGFkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHYW1lcGFkSW5wdXREYXRhID0geyBidXR0b25zOiBBcnJheTxHYW1lcGFkQnV0dG9uQ2hhbmdlPiwgYXhlczogQXJyYXk8R2FtZXBhZEF4aXNDaGFuZ2U+LCB9O1xuZXhwb3J0IHR5cGUgR2FtZXBhZElucHV0RXZlbnQgPSBHYW1lcGFkSW5wdXREYXRhO1xuZXhwb3J0IHR5cGUgR2FtZXBhZFJ1bWJsZSA9IHsgXG4vKipcbiAqIFdpcmUgaWQgZnJvbSBbYEdhbWVwYWRDb25uZWN0ZWRgXS5cbiAqL1xuZ2FtZXBhZDogbnVtYmVyLCBcbi8qKlxuICogTWlsbGlzZWNvbmRzICh3ZWItYHBsYXlFZmZlY3RgLWxpa2UpLiBOZWdhdGl2ZSB2YWx1ZXMgY2xhbXAgdG8gMC5cbiAqL1xuZHVyYXRpb246IG51bWJlciwgXG4vKipcbiAqIExvdy1mcmVxdWVuY3kgbW90b3IgaW50ZW5zaXR5LCBjbGFtcGVkIHRvIGAwLjAuLj0xLjBgLlxuICovXG5zdHJvbmdNb3RvcjogbnVtYmVyLCBcbi8qKlxuICogSGlnaC1mcmVxdWVuY3kgbW90b3IgaW50ZW5zaXR5LCBjbGFtcGVkIHRvIGAwLjAuLj0xLjBgLlxuICovXG53ZWFrTW90b3I6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdhbWVwYWRTdG9wUnVtYmxlID0geyBnYW1lcGFkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHbGl0Y2ggPSB7IFxuLyoqXG4gKiBIb3cgYnJva2VuIHRoZSBzaWduYWwgaXMsIDAuLjEuXG4gKi9cbmludGVuc2l0eTogbnVtYmVyLCBcbi8qKlxuICogMCA9IGdsaXRjaGluZyBhbGwgdGhlIHRpbWU7IGFib3ZlIDAsIHRoZSBjaGFuY2UgYSBxdWFydGVyIHNlY29uZFxuICogZ2xpdGNoZXMgKGJ1cnN0cykuXG4gKi9cbmZyZXF1ZW5jeTogbnVtYmVyLCBcbi8qKlxuICogSG93IGZhciB0aGUgY2hhbm5lbHMgc3BsaXQgYXQgZnVsbCBpbnRlbnNpdHksIHB4LlxuICovXG5zcGxpdDogbnVtYmVyIHwgc3RyaW5nLCBcbi8qKlxuICogSG93IGZhciBhIHRvcm4gc2xpY2UgbW92ZXMgYXQgZnVsbCBpbnRlbnNpdHksIHB4ICjiiaQgMzIpLlxuICovXG50ZWFyOiBudW1iZXIgfCBzdHJpbmcsIFxuLyoqXG4gKiBEZWNvcnJlbGF0ZXMgZ2xpdGNoZXMgdGhhdCBydW4gc2lkZSBieSBzaWRlLlxuICovXG5zZWVkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBHcmFkaWVudE1hcFBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc3RvcHM6IEFycmF5PEdyYWRpZW50TWFwU3RvcD4sIGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgR3JhZGllbnRNYXBTdG9wID0geyBjb2xvcjogc3RyaW5nLCBwb3NpdGlvbj86IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIEdyYXlzY2FsZVBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBIYWNrU2hvY2sgPSBudWxsO1xuZXhwb3J0IHR5cGUgSG9sb0FjdGl2ZSA9IHsgc3VyZmFjZTogc3RyaW5nLCBhY3RpdmU6IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBIb2xvTm9pc2UgPSB7IFxuLyoqXG4gKiBIb3cgdmlzaWJsZSB0aGUgZ3JhaW4gaXMsIDAuLjEuXG4gKi9cbmFtb3VudDogbnVtYmVyLCBcbi8qKlxuICogSG93IGJyaWdodCB0aGUgcm9sbGluZyBpbnRlcmZlcmVuY2UgYmFuZCBpcywgMC4uMS5cbiAqL1xuYmFuZDogbnVtYmVyLCBcbi8qKlxuICogSG93IGZhciBhIGtub2NrZWQgcm93IG1vdmVzLCBweCAo4omkIDgpLlxuICovXG5qaXR0ZXI6IG51bWJlciB8IHN0cmluZywgXG4vKipcbiAqIERlY29ycmVsYXRlcyBob2xvZ3JhbXMgc2lkZSBieSBzaWRlLlxuICovXG5zZWVkOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBIdWVSb3RhdGVQYXJhbXMgPSB7IGFuZ2xlOiBudW1iZXIgfCBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBJbnZlcnRQYXJhbXMgPSB7IGFtb3VudDogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgS2V5RG93biA9IEtleWJvYXJkRXZlbnREYXRhO1xuZXhwb3J0IHR5cGUgS2V5VXAgPSBLZXlib2FyZEV2ZW50RGF0YTtcbmV4cG9ydCB0eXBlIEtleWJvYXJkRXZlbnREYXRhID0geyBcbi8qKlxuICogTGF5b3V0LWF3YXJlIGxvZ2ljYWwga2V5OiB0aGUgdHlwZWQgY2hhcmFjdGVyIChgXCJhXCJgLCBgXCJBXCJgKSBvciBhIG5hbWVkXG4gKiBrZXkgKGBcIkVudGVyXCJgLCBgXCJBcnJvd0xlZnRcImAsIGBcIkVzY2FwZVwiYCkuXG4gKi9cbmtleTogc3RyaW5nLCBcbi8qKlxuICogTGF5b3V0LWluZGVwZW5kZW50IHBoeXNpY2FsIGtleSwgVzNDIGBjb2RlYCBzdHlsZSAoYFwiS2V5QVwiYCwgYFwiRW50ZXJcImApLlxuICovXG5jb2RlOiBzdHJpbmcsIFxuLyoqXG4gKiBUaGUgdGV4dCBwcm9kdWNlZCBieSB0aGUga2V5LCBpZiBhbnkgKHJlc3BlY3RzIG1vZGlmaWVycy9JTUUpLiBgbnVsbGAgZm9yXG4gKiBrZXlzIHRoYXQgZG9uJ3QgcHJvZHVjZSB0ZXh0IChlLmcuIGFycm93cywgbW9kaWZpZXJzKS5cbiAqL1xudGV4dDogc3RyaW5nIHwgbnVsbCwgXG4vKipcbiAqIFdoZXRoZXIgdGhpcyBpcyBhbiBPUyBhdXRvLXJlcGVhdCB3aGlsZSB0aGUga2V5IGlzIGhlbGQuXG4gKi9cbnJlcGVhdDogYm9vbGVhbiwgY3RybEtleTogYm9vbGVhbiwgc2hpZnRLZXk6IGJvb2xlYW4sIGFsdEtleTogYm9vbGVhbiwgXG4vKipcbiAqIFRoZSBcIk1ldGFcIi9cIlN1cGVyXCIga2V5IChXaW5kb3dzL0NvbW1hbmQpLlxuICovXG5tZXRhS2V5OiBib29sZWFuLCB9O1xuZXhwb3J0IHR5cGUgTGluZWFyV2lwZVBhcmFtcyA9IHsgYW5nbGU6IG51bWJlciB8IHN0cmluZywgc29mdG5lc3M6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIE1hcmtNYXAgPSB7IHRvOiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBPcGVuSG9sbyA9IHsgc3VyZmFjZTogc3RyaW5nLCBvcGVuOiBib29sZWFuLCB9O1xuZXhwb3J0IHR5cGUgT3JiaXRNYXAgPSB7IGR4OiBudW1iZXIsIGR5OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBPdXRsaW5lUGFyYW1zID0geyB3aWR0aDogbnVtYmVyIHwgc3RyaW5nLCBjb2xvcjogc3RyaW5nLCBzb2Z0bmVzczogbnVtYmVyIHwgc3RyaW5nLCB9O1xuZXhwb3J0IHR5cGUgUGluY2hQYXJhbXMgPSB7IFxuLyoqXG4gKiBQaW5jaCBjZW50ZXIsIDAuLjEgYWNyb3NzIHRoZSBub2RlIHJlY3QgKDAgPSBsZWZ0IGVkZ2UpLlxuICovXG54OiBudW1iZXIsIFxuLyoqXG4gKiBQaW5jaCBjZW50ZXIsIDAuLjEgYWNyb3NzIHRoZSBub2RlIHJlY3QgKDAgPSB0b3AgZWRnZSkuXG4gKi9cbnk6IG51bWJlciwgXG4vKipcbiAqIC0xIChmdWxsIGJ1bGdlKSAuLj0gMSAoZnVsbCBwaW5jaCk7IDAgaXMgaWRlbnRpdHkuXG4gKi9cbnN0cmVuZ3RoOiBudW1iZXIsIFxuLyoqXG4gKiBFZmZlY3QgcmFkaXVzIGFzIGEgZnJhY3Rpb24gb2YgdGhlIG5vZGUncyBsYXJnZXIgZGltZW5zaW9uLlxuICovXG5yYWRpdXM6IG51bWJlciwgXG4vKipcbiAqIERpZmZ1c2Ugc2hhZGluZyBpbnRlbnNpdHk6IDAgKHVubGl0LCB0aGUgZGVmYXVsdCksIDEgbm9taW5hbDsgbGFyZ2VyXG4gKiB2YWx1ZXMgb3ZlcmRyaXZlLCBsaWtlIGBicmlnaHRuZXNzYC5cbiAqL1xubGlnaHQ6IG51bWJlciwgXG4vKipcbiAqIERpcmVjdGlvbiB0aGUgbGlnaHQgY29tZXMgRlJPTTogZGVncmVlcyBjbG9ja3dpc2UgZnJvbSArWCBpbiBzY3JlZW5cbiAqIHNwYWNlIChiYXJlIG51bWJlciA9IGRlZ3JlZXMsIGBcIjAuMjV0dXJuXCJgIGV0Yy4gYWNjZXB0ZWQpLiBEZWZhdWx0XG4gKiAtMTM1ID0gdG9wLWxlZnQuXG4gKi9cbmxpZ2h0QW5nbGU6IG51bWJlciB8IHN0cmluZywgXG4vKipcbiAqIFNwZWN1bGFyICh3aGl0ZSkgaGlnaGxpZ2h0IGludGVuc2l0eTogMCAob2ZmLCB0aGUgZGVmYXVsdCksIDFcbiAqIG5vbWluYWw7IGxhcmdlciB2YWx1ZXMgb3ZlcmRyaXZlLlxuICovXG5nbG9zczogbnVtYmVyLCBcbi8qKlxuICogU2l6ZSBvZiB0aGUgc3BlY3VsYXIgaGlnaGxpZ2h0LCAwIChhIHBpbnBvaW50KSAuLj0gMSAoYSBicm9hZCBzaGVlbik7XG4gKiBkZWZhdWx0IDAuMy4gTWFwcGVkIGxvZy13aXNlIG9udG8gYSBCbGlubi1QaG9uZyBleHBvbmVudCBpbiB0aGUgc2hhZGVyXG4gKiAoMTI4IGF0IDAsIH4zMiBhdCAwLjMsIDEgYXQgMSkuXG4gKi9cbmdsb3NzU2l6ZTogbnVtYmVyLCBcbi8qKlxuICogSG93IHRoZSBlZmZlY3QgbWVldHMgaXRzIHJpbSwgMC4uPTE6IDAgaXMgYSBsaW5lYXIgb25zZXQgKGEgdmlzaWJsZVxuICogY3JlYXNlLCBsaWtlIGEgcHJlc3NlZCBjb2luIGVkZ2UpLCAwLjUgKHRoZSBkZWZhdWx0KSB0aGUgY2xhc3NpYyBgdV4yYFxuICogc21vb3Roc3RlcC1saWtlIGZhZGUsIDEgYW4gaW1wZXJjZXB0aWJsZSBgdV40YCBmYWRlLWluLlxuICovXG5vdXRlclNvZnRuZXNzOiBudW1iZXIsIFxuLyoqXG4gKiBIb3cgdGhlIGVmZmVjdCBwZWFrcyBhdCBpdHMgY2VudGVyLCAwLi49MTogMCBpcyBhIGNvbmUgdGlwIChhIHBvaW50ZWRcbiAqIHBpdC9wZWFrIHRoZSBsaWdodGluZyBzaG93cyBhcyBhIHBvaW50KSwgMC41ICh0aGUgZGVmYXVsdCkgYSByb3VuZGVkXG4gKiBib3dsLCAxIGEgYnJvYWQgZmxhdCBmbG9vci4gSW5kZXBlbmRlbnQgb2YgYG91dGVyU29mdG5lc3NgOiB0aGVcbiAqIHByb2ZpbGUgaXMgYDEgLSAoMSAtIHVeYSleYmAgd2l0aCBgYWAvYGJgIGZyb20gdGhlIHR3byBrbm9icy5cbiAqL1xuaW5uZXJTb2Z0bmVzczogbnVtYmVyLCB9O1xuZXhwb3J0IHR5cGUgUGl4ZWxpemVQYXJhbXMgPSB7IFxuLyoqXG4gKiBDZWxscyBhY3Jvc3MgeC95IGF0IHRoZSBtb3NhaWMncyBjb2Fyc2VzdCAodXBzdHJlYW0gYHNxdWFyZXNNaW5gKS5cbiAqL1xuc3F1YXJlc01pbjogW251bWJlciwgbnVtYmVyXSwgXG4vKipcbiAqIERpc2NyZXRlIGNlbGwtc2l6ZSBsZXZlbHM7IGA8PSAwYCBmb3IgYSBjb250aW51b3VzIHJhbXAuXG4gKi9cbnN0ZXBzOiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBSZWxvYWQgPSBudWxsO1xuZXhwb3J0IHR5cGUgUmVzaXplID0gV2luZG93U2l6ZTtcbmV4cG9ydCB0eXBlIFNhdHVyYXRlUGFyYW1zID0geyBhbW91bnQ6IG51bWJlciwgfTtcbmV4cG9ydCB0eXBlIFNjYW5Td2FwID0geyBzb2Z0bmVzczogbnVtYmVyLCB0aW50OiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBTZXBpYVBhcmFtcyA9IHsgYW1vdW50OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBTaGFkb3dQYXJhbXMgPSB7IGNvbG9yOiBzdHJpbmcsIG9mZnNldFg6IG51bWJlciB8IHN0cmluZywgb2Zmc2V0WTogbnVtYmVyIHwgc3RyaW5nLCBzcHJlYWQ6IG51bWJlciB8IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIFNob3dJdGVtID0geyBpdGVtOiBzdHJpbmcsIH07XG5leHBvcnQgdHlwZSBTaG93TG9jYXRvciA9IHsgdG86IHN0cmluZywgfTtcbmV4cG9ydCB0eXBlIFN0YW5jZUNoYW5nZWQgPSB7IGFpbWluZzogYm9vbGVhbiwgbW91c2U6IGJvb2xlYW4sIHNjcmVlbjogc3RyaW5nIHwgbnVsbCwgb2ZmZXI6IHN0cmluZyB8IG51bGwsIH07XG5leHBvcnQgdHlwZSBTdWl0SGVhbCA9IG51bGw7XG5leHBvcnQgdHlwZSBTdWl0SGl0ID0gbnVsbDtcbmV4cG9ydCB0eXBlIFN1aXRTdGFzaXMgPSBudWxsO1xuZXhwb3J0IHR5cGUgU3VpdFZhY3V1bSA9IHsgb246IGJvb2xlYW4sIH07XG5leHBvcnQgdHlwZSBTeW5jID0gbnVsbDtcbmV4cG9ydCB0eXBlIFVubG9ja0Rvb3IgPSBudWxsO1xuZXhwb3J0IHR5cGUgV2luZG93U2l6ZSA9IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIH07XG5leHBvcnQgdHlwZSBab29tTWFwID0geyBkZWx0YTogbnVtYmVyLCB9O1xuXG4vKiogRXZlcnkgYGVtaXRgIG5hbWUgYW5kIHRoZSBwYXlsb2FkIHR5cGUgaXQgY2Fycmllcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RNZXNzYWdlcyB7XG4gIFwiZG9vci51bmxvY2tcIjogVW5sb2NrRG9vcjtcbiAgXCJlbGV2YXRvci5jYWxsXCI6IENhbGxFbGV2YXRvcjtcbiAgXCJnYW1lcGFkLnJ1bWJsZVwiOiBHYW1lcGFkUnVtYmxlO1xuICBcImdhbWVwYWQuc3RvcFJ1bWJsZVwiOiBHYW1lcGFkU3RvcFJ1bWJsZTtcbiAgXCJoYWNrLnNob2NrXCI6IEhhY2tTaG9jaztcbiAgXCJob2xvLm9wZW5cIjogT3BlbkhvbG87XG4gIFwibG9jYXRvci5zaG93XCI6IFNob3dMb2NhdG9yO1xuICBcIm1hcC5tYXJrXCI6IE1hcmtNYXA7XG4gIFwibWFwLm9yYml0XCI6IE9yYml0TWFwO1xuICBcIm1hcC56b29tXCI6IFpvb21NYXA7XG4gIFwicGxheWVyLnN5bmNcIjogU3luYztcbiAgXCJwcmV2aWV3LnNob3dcIjogU2hvd0l0ZW07XG4gIFwic291bmQuY3VlXCI6IEN1ZTtcbiAgXCJzdWl0LmhlYWxcIjogU3VpdEhlYWw7XG4gIFwic3VpdC5oaXRcIjogU3VpdEhpdDtcbiAgXCJzdWl0LnN0YXNpc1wiOiBTdWl0U3Rhc2lzO1xuICBcInN1aXQudmFjdXVtXCI6IFN1aXRWYWN1dW07XG4gIFwid2VhcG9uLmVxdWlwXCI6IEVxdWlwO1xuICBcIndlYXBvbi5maXJlXCI6IEZpcmU7XG4gIFwid2VhcG9uLnJlbG9hZFwiOiBSZWxvYWQ7XG59XG5cbi8qKiBFdmVyeSBgcmVxdWVzdGAgbmFtZSBhbmQgaXRzIHJlcXVlc3QvcmVzcG9uc2UgdHlwZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYWN0UmVxdWVzdHMge1xuICBcImdhbWVwYWQuZ2V0QWxsXCI6IHsgcmVxdWVzdDogbnVsbDsgcmVzcG9uc2U6IEFycmF5PEdhbWVwYWRDb25uZWN0ZWREYXRhPiB9O1xuICBcIndpbmRvdy5zaXplXCI6IHsgcmVxdWVzdDogbnVsbDsgcmVzcG9uc2U6IFdpbmRvd1NpemUgfTtcbn1cblxuLyoqIEV2ZXJ5IEJldnkg4oaSIFJlYWN0IGV2ZW50IG5hbWUgYW5kIHRoZSBwYXlsb2FkIGl0IGNhcnJpZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYWN0RXZlbnRzIHtcbiAgXCJkZWJ1Zy5hY3RcIjogQWN0O1xuICBcImRvb3Iub3BlbmVkXCI6IERvb3JPcGVuZWQ7XG4gIFwiZWxldmF0b3IuYXJyaXZlZFwiOiBFbGV2YXRvckFycml2ZWQ7XG4gIGdhbWVwYWRDb25uZWN0ZWQ6IEdhbWVwYWRDb25uZWN0ZWQ7XG4gIGdhbWVwYWREaXNjb25uZWN0ZWQ6IEdhbWVwYWREaXNjb25uZWN0ZWQ7XG4gIGdhbWVwYWRJbnB1dDogR2FtZXBhZElucHV0RXZlbnQ7XG4gIFwiaG9sby5hY3RpdmVcIjogSG9sb0FjdGl2ZTtcbiAga2V5RG93bjogS2V5RG93bjtcbiAga2V5VXA6IEtleVVwO1xuICBcInBsYXllci5maXJlXCI6IEZpcmVTaG90O1xuICBcInBsYXllci5zdGFuY2VcIjogU3RhbmNlQ2hhbmdlZDtcbiAgcmVzaXplOiBSZXNpemU7XG59XG5cbi8qKiBFdmVyeSByZWdpc3RlcmVkIGZpbHRlciBuYW1lIGFuZCBpdHMgcGFyYW1zIHR5cGUsIHNwbGl0IGJ5IGZhbWlseS5cbiAqICBBdWdtZW50cyB0aGUgZW1wdHkgYEJldnlGaWx0ZXJzYCAocmVndWxhciBmaWx0ZXJzIOKAlCB0aGUgYGZpbHRlcmAgYW5kXG4gKiAgYGJhY2tkcm9wRmlsdGVyYCBjaGFpbnMpIGFuZCBgQmV2eU1vcnBoRmlsdGVyc2AgKHR3by1pbnB1dCBtb3JwaFxuICogIGZpbHRlcnMg4oCUIHRoZSBgbW9ycGhGaWx0ZXJgIHN0eWxlKSByZWdpc3RyeSBpbnRlcmZhY2VzIGluIHRoZVxuICogIGBiZXZ5LXJlYWN0YCBwYWNrYWdlLCBzbyBlYWNoIHN0eWxlIGZpZWxkIHR5cGVzIGl0cyBuYW1lcycgcGFyYW1zLiAqL1xuZGVjbGFyZSBtb2R1bGUgXCJiZXZ5LXJlYWN0XCIge1xuICBpbnRlcmZhY2UgQmV2eUZpbHRlcnMge1xuICAgIGJsb29tOiBCbG9vbVBhcmFtcztcbiAgICBibHVyOiBCbHVyUGFyYW1zO1xuICAgIGJyaWdodG5lc3M6IEJyaWdodG5lc3NQYXJhbXM7XG4gICAgY2hyb21hdGljQWJlcnJhdGlvbjogQ2hyb21hdGljQWJlcnJhdGlvblBhcmFtcztcbiAgICBjb250cmFzdDogQ29udHJhc3RQYXJhbXM7XG4gICAgZ2xpdGNoOiBHbGl0Y2g7XG4gICAgZ3JhZGllbnRNYXA6IEdyYWRpZW50TWFwUGFyYW1zO1xuICAgIGdyYXlzY2FsZTogR3JheXNjYWxlUGFyYW1zO1xuICAgIGhvbG9Ob2lzZTogSG9sb05vaXNlO1xuICAgIGh1ZVJvdGF0ZTogSHVlUm90YXRlUGFyYW1zO1xuICAgIGludmVydDogSW52ZXJ0UGFyYW1zO1xuICAgIG91dGxpbmU6IE91dGxpbmVQYXJhbXM7XG4gICAgcGluY2g6IFBpbmNoUGFyYW1zO1xuICAgIHNhdHVyYXRlOiBTYXR1cmF0ZVBhcmFtcztcbiAgICBzZXBpYTogU2VwaWFQYXJhbXM7XG4gICAgc2hhZG93OiBTaGFkb3dQYXJhbXM7XG4gIH1cbiAgaW50ZXJmYWNlIEJldnlNb3JwaEZpbHRlcnMge1xuICAgIGNyb3NzZmFkZTogQ3Jvc3NmYWRlUGFyYW1zO1xuICAgIGxpbmVhcldpcGU6IExpbmVhcldpcGVQYXJhbXM7XG4gICAgcGl4ZWxpemU6IFBpeGVsaXplUGFyYW1zO1xuICAgIHNjYW5Td2FwOiBTY2FuU3dhcDtcbiAgfVxufVxuXG4vKiogVGhlIGFwcCdzIG93biBlbGVtZW50cycgcHJvcHMgKGBhcHAuYWRkX3JlYWN0X2VsZW1lbnRgKS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUFuY2hvclByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMsIEJldnlGb2N1c1Byb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIGVudGl0eTogbnVtYmVyIHwgYmlnaW50O1xuICBvZmZzZXQ/OiBWZWMzO1xuICBzY2FsZT86IEFuY2hvclNjYWxpbmc7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlDYW52YXNQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5VmFyaWFudFByb3BzLCBCZXZ5UG9pbnRlclByb3BzLCBCZXZ5U2Nyb2xsUHJvcHMsIEJldnlXaGVlbFByb3BzLCBCZXZ5Rm9jdXNQcm9wcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICBkcmF3PzogQ2FudmFzUGFpbnRlciB8IERyYXdDbWRbXTtcbiAgb25SZXNpemU/OiAocGF5bG9hZDogQ2FudmFzU2l6ZSkgPT4gdm9pZDtcbiAgcmVmPzogUmVmPEJldnlDYW52YXNFbGVtZW50PjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eUNpcmNsZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBjeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgY3k/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHI/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlFbGxpcHNlUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcywgQmV2eVBvaW50ZXJQcm9wcyB7XG4gIGN4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBjeT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcng/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHJ5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsPzogc3RyaW5nO1xuICBzdHJva2U/OiBzdHJpbmc7XG4gIHN0cm9rZVdpZHRoPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBvcGFjaXR5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICBmaWxsUnVsZT86IFwibm9uemVyb1wiIHwgXCJldmVub2RkXCI7XG4gIHN0cm9rZUxpbmVjYXA/OiBcImJ1dHRcIiB8IFwicm91bmRcIiB8IFwic3F1YXJlXCI7XG4gIHN0cm9rZUxpbmVqb2luPzogXCJtaXRlclwiIHwgXCJyb3VuZFwiIHwgXCJiZXZlbFwiO1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5R1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMge1xuICB0cmFuc2Zvcm0/OiBzdHJpbmc7XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHRyYW5zaXRpb24/OiBCZXZ5U2hhcGVUcmFuc2l0aW9uO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5TGluZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICB4MT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgeTE/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIHgyPzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5Mj86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVBhdGhQcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgZD86IHN0cmluZztcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVBvbHlnb25Qcm9wcyBleHRlbmRzIEJldnlBdHRyaWJ1dGVzLCBCZXZ5UG9pbnRlclByb3BzIHtcbiAgcG9pbnRzPzogbnVtYmVyW107XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlQb2x5bGluZVByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICBwb2ludHM/OiBudW1iZXJbXTtcbiAgZmlsbD86IHN0cmluZztcbiAgc3Ryb2tlPzogc3RyaW5nO1xuICBzdHJva2VXaWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgb3BhY2l0eT86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgZmlsbFJ1bGU/OiBcIm5vbnplcm9cIiB8IFwiZXZlbm9kZFwiO1xuICBzdHJva2VMaW5lY2FwPzogXCJidXR0XCIgfCBcInJvdW5kXCIgfCBcInNxdWFyZVwiO1xuICBzdHJva2VMaW5lam9pbj86IFwibWl0ZXJcIiB8IFwicm91bmRcIiB8IFwiYmV2ZWxcIjtcbiAgdHJhbnNmb3JtPzogc3RyaW5nO1xuICB0cmFuc2l0aW9uPzogQmV2eVNoYXBlVHJhbnNpdGlvbjtcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVBvcnRhbFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMsIEJldnlGb2N1c1Byb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIHRhcmdldDogc3RyaW5nO1xuICBjaGlsZHJlbj86IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCZXZ5UmVjdFByb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlQb2ludGVyUHJvcHMge1xuICB4PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB5PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICB3aWR0aD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgaGVpZ2h0PzogQW5pbWF0YWJsZTxudW1iZXI+O1xuICByeD86IEFuaW1hdGFibGU8bnVtYmVyPjtcbiAgcnk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGw/OiBzdHJpbmc7XG4gIHN0cm9rZT86IHN0cmluZztcbiAgc3Ryb2tlV2lkdGg/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIG9wYWNpdHk/OiBBbmltYXRhYmxlPG51bWJlcj47XG4gIGZpbGxSdWxlPzogXCJub256ZXJvXCIgfCBcImV2ZW5vZGRcIjtcbiAgc3Ryb2tlTGluZWNhcD86IFwiYnV0dFwiIHwgXCJyb3VuZFwiIHwgXCJzcXVhcmVcIjtcbiAgc3Ryb2tlTGluZWpvaW4/OiBcIm1pdGVyXCIgfCBcInJvdW5kXCIgfCBcImJldmVsXCI7XG4gIHRyYW5zZm9ybT86IHN0cmluZztcbiAgdHJhbnNpdGlvbj86IEJldnlTaGFwZVRyYW5zaXRpb247XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJldnlTdXJmYWNlUHJvcHMgZXh0ZW5kcyBCZXZ5QXR0cmlidXRlcyB7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICB0YXJnZXQ6IHN0cmluZztcbiAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmV2eVN2Z1Byb3BzIGV4dGVuZHMgQmV2eUF0dHJpYnV0ZXMsIEJldnlWYXJpYW50UHJvcHMsIEJldnlQb2ludGVyUHJvcHMsIEJldnlTY3JvbGxQcm9wcywgQmV2eVdoZWVsUHJvcHMsIEJldnlGb2N1c1Byb3BzIHtcbiAgc3R5bGU/OiBCZXZ5U3R5bGU7XG4gIHZpZXdCb3g/OiBzdHJpbmc7XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufVxuXG4vKiogVGhlIGFwcCdzIG93biBlbGVtZW50cyAoYGFwcC5hZGRfcmVhY3RfZWxlbWVudGApLiBBdWdtZW50cyB0aGVcbiAqICBgQmV2eUludHJpbnNpY0VsZW1lbnRzYCBpbnRlcmZhY2UgaW4gdGhlIGBiZXZ5LXJlYWN0YCBwYWNrYWdlLCBzbyBKU1hcbiAqICB0eXBlcyB0aGVtLiAqL1xuZGVjbGFyZSBtb2R1bGUgXCJiZXZ5LXJlYWN0XCIge1xuICBpbnRlcmZhY2UgQmV2eUludHJpbnNpY0VsZW1lbnRzIHtcbiAgICBhbmNob3I6IEJldnlBbmNob3JQcm9wcztcbiAgICBjYW52YXM6IEJldnlDYW52YXNQcm9wcztcbiAgICBjaXJjbGU6IEJldnlDaXJjbGVQcm9wcztcbiAgICBlbGxpcHNlOiBCZXZ5RWxsaXBzZVByb3BzO1xuICAgIGc6IEJldnlHUHJvcHM7XG4gICAgbGluZTogQmV2eUxpbmVQcm9wcztcbiAgICBwYXRoOiBCZXZ5UGF0aFByb3BzO1xuICAgIHBvbHlnb246IEJldnlQb2x5Z29uUHJvcHM7XG4gICAgcG9seWxpbmU6IEJldnlQb2x5bGluZVByb3BzO1xuICAgIHBvcnRhbDogQmV2eVBvcnRhbFByb3BzO1xuICAgIHJlY3Q6IEJldnlSZWN0UHJvcHM7XG4gICAgc3VyZmFjZTogQmV2eVN1cmZhY2VQcm9wcztcbiAgICBzdmc6IEJldnlTdmdQcm9wcztcbiAgfVxufVxuXG4vKiogU2VuZCBhIHR5cGVkIGFwcCBtZXNzYWdlIHRvIHRoZSBCZXZ5IHNpZGUuICovXG5leHBvcnQgZnVuY3Rpb24gZW1pdDxLIGV4dGVuZHMga2V5b2YgUmVhY3RNZXNzYWdlcz4obmFtZTogSywgdmFsdWU6IFJlYWN0TWVzc2FnZXNbS10pOiB2b2lkIHtcbiAgcmF3RW1pdChuYW1lLCB2YWx1ZSk7XG59XG5cbi8qKiBTZW5kIGEgdHlwZWQgcmVxdWVzdCBhbmQgYXdhaXQgaXRzIHR5cGVkIHJlc3BvbnNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3Q8SyBleHRlbmRzIGtleW9mIFJlYWN0UmVxdWVzdHM+KFxuICBuYW1lOiBLLFxuICB2YWx1ZTogUmVhY3RSZXF1ZXN0c1tLXVtcInJlcXVlc3RcIl0sXG4pOiBQcm9taXNlPFJlYWN0UmVxdWVzdHNbS11bXCJyZXNwb25zZVwiXT4ge1xuICByZXR1cm4gcmF3UmVxdWVzdChuYW1lLCB2YWx1ZSkgYXMgUHJvbWlzZTxSZWFjdFJlcXVlc3RzW0tdW1wicmVzcG9uc2VcIl0+O1xufVxuXG4vKiogU3Vic2NyaWJlIHRvIGEgdHlwZWQgQmV2eSDihpIgUmVhY3QgZXZlbnQuIFJldHVybnMgYW4gdW5zdWJzY3JpYmUgZm4uICovXG5leHBvcnQgZnVuY3Rpb24gb248SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgY2I6ICh2YWx1ZTogUmVhY3RFdmVudHNbS10pID0+IHZvaWQsXG4pOiAoKSA9PiB2b2lkIHtcbiAgcmF3QWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xuICByZXR1cm4gKCkgPT4gcmF3UmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiBhcyAodmFsdWU6IHVua25vd24pID0+IHZvaWQpO1xufVxuXG4vKiogVW5zdWJzY3JpYmUgYSBsaXN0ZW5lciBwcmV2aW91c2x5IHBhc3NlZCB0byBgb25gL2BhZGRFdmVudExpc3RlbmVyYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyPEsgZXh0ZW5kcyBrZXlvZiBSZWFjdEV2ZW50cz4oXG4gIG5hbWU6IEssXG4gIGNiOiAodmFsdWU6IFJlYWN0RXZlbnRzW0tdKSA9PiB2b2lkLFxuKTogdm9pZCB7XG4gIHJhd1JlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgY2IgYXMgKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkKTtcbn1cblxuLyoqIFN0cnVjdHVyZWQsIGZ1bGx5IHR5cGVkIHByb3h5IG92ZXIgZXZlcnkgbWVzc2FnZSwgcmVxdWVzdCwgYW5kIGV2ZW50LiAqL1xuZXhwb3J0IGNvbnN0IGJldnkgPSB7XG4gIGVtaXQsXG4gIHJlcXVlc3QsXG4gIG9uLFxuICBhZGRFdmVudExpc3RlbmVyOiBvbixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcixcbiAgZG9vcjoge1xuICAgIHVubG9jayh2YWx1ZTogVW5sb2NrRG9vcik6IHZvaWQgeyBlbWl0KFwiZG9vci51bmxvY2tcIiwgdmFsdWUpOyB9LFxuICB9LFxuICBlbGV2YXRvcjoge1xuICAgIGNhbGwodmFsdWU6IENhbGxFbGV2YXRvcik6IHZvaWQgeyBlbWl0KFwiZWxldmF0b3IuY2FsbFwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIGdhbWVwYWQ6IHtcbiAgICBnZXRBbGwoKTogUHJvbWlzZTxBcnJheTxHYW1lcGFkQ29ubmVjdGVkRGF0YT4+IHsgcmV0dXJuIHJlcXVlc3QoXCJnYW1lcGFkLmdldEFsbFwiLCBudWxsKTsgfSxcbiAgICBydW1ibGUodmFsdWU6IEdhbWVwYWRSdW1ibGUpOiB2b2lkIHsgZW1pdChcImdhbWVwYWQucnVtYmxlXCIsIHZhbHVlKTsgfSxcbiAgICBzdG9wUnVtYmxlKHZhbHVlOiBHYW1lcGFkU3RvcFJ1bWJsZSk6IHZvaWQgeyBlbWl0KFwiZ2FtZXBhZC5zdG9wUnVtYmxlXCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgaGFjazoge1xuICAgIHNob2NrKHZhbHVlOiBIYWNrU2hvY2spOiB2b2lkIHsgZW1pdChcImhhY2suc2hvY2tcIiwgdmFsdWUpOyB9LFxuICB9LFxuICBob2xvOiB7XG4gICAgb3Blbih2YWx1ZTogT3BlbkhvbG8pOiB2b2lkIHsgZW1pdChcImhvbG8ub3BlblwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIGxvY2F0b3I6IHtcbiAgICBzaG93KHZhbHVlOiBTaG93TG9jYXRvcik6IHZvaWQgeyBlbWl0KFwibG9jYXRvci5zaG93XCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgbWFwOiB7XG4gICAgbWFyayh2YWx1ZTogTWFya01hcCk6IHZvaWQgeyBlbWl0KFwibWFwLm1hcmtcIiwgdmFsdWUpOyB9LFxuICAgIG9yYml0KHZhbHVlOiBPcmJpdE1hcCk6IHZvaWQgeyBlbWl0KFwibWFwLm9yYml0XCIsIHZhbHVlKTsgfSxcbiAgICB6b29tKHZhbHVlOiBab29tTWFwKTogdm9pZCB7IGVtaXQoXCJtYXAuem9vbVwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIHBsYXllcjoge1xuICAgIHN5bmModmFsdWU6IFN5bmMpOiB2b2lkIHsgZW1pdChcInBsYXllci5zeW5jXCIsIHZhbHVlKTsgfSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHNob3codmFsdWU6IFNob3dJdGVtKTogdm9pZCB7IGVtaXQoXCJwcmV2aWV3LnNob3dcIiwgdmFsdWUpOyB9LFxuICB9LFxuICBzb3VuZDoge1xuICAgIGN1ZSh2YWx1ZTogQ3VlKTogdm9pZCB7IGVtaXQoXCJzb3VuZC5jdWVcIiwgdmFsdWUpOyB9LFxuICB9LFxuICBzdWl0OiB7XG4gICAgaGVhbCh2YWx1ZTogU3VpdEhlYWwpOiB2b2lkIHsgZW1pdChcInN1aXQuaGVhbFwiLCB2YWx1ZSk7IH0sXG4gICAgaGl0KHZhbHVlOiBTdWl0SGl0KTogdm9pZCB7IGVtaXQoXCJzdWl0LmhpdFwiLCB2YWx1ZSk7IH0sXG4gICAgc3Rhc2lzKHZhbHVlOiBTdWl0U3Rhc2lzKTogdm9pZCB7IGVtaXQoXCJzdWl0LnN0YXNpc1wiLCB2YWx1ZSk7IH0sXG4gICAgdmFjdXVtKHZhbHVlOiBTdWl0VmFjdXVtKTogdm9pZCB7IGVtaXQoXCJzdWl0LnZhY3V1bVwiLCB2YWx1ZSk7IH0sXG4gIH0sXG4gIHdlYXBvbjoge1xuICAgIGVxdWlwKHZhbHVlOiBFcXVpcCk6IHZvaWQgeyBlbWl0KFwid2VhcG9uLmVxdWlwXCIsIHZhbHVlKTsgfSxcbiAgICBmaXJlKHZhbHVlOiBGaXJlKTogdm9pZCB7IGVtaXQoXCJ3ZWFwb24uZmlyZVwiLCB2YWx1ZSk7IH0sXG4gICAgcmVsb2FkKHZhbHVlOiBSZWxvYWQpOiB2b2lkIHsgZW1pdChcIndlYXBvbi5yZWxvYWRcIiwgdmFsdWUpOyB9LFxuICB9LFxuICB3aW5kb3c6IHtcbiAgICBzaXplKCk6IFByb21pc2U8V2luZG93U2l6ZT4geyByZXR1cm4gcmVxdWVzdChcIndpbmRvdy5zaXplXCIsIG51bGwpOyB9LFxuICB9LFxufSBhcyBjb25zdDtcbiIsICIvKiogVGhlIHN0b3J5IHRoZSBzaG93cm9vbSBoaW50cyBhdC4gRXVyeWRpY2UgU3RhdGlvbiBtaW5lcyBpY2Ugb24gYSBnYXNcbiAqICBnaWFudCdzIG1vb24gZm9yIEhhbGRlbiBJY2UgJiBPcmU7IHNvbWV0aGluZyBzdG9wcGVkIHRoZSBzaGlmdCBjaGFuZ2Ugb25cbiAqICBDb25jb3Vyc2UgQy4gQWxsIG5hbWVzIGFuZCB0ZXh0IGhlcmUgYXJlIG91ciBvd24uICovXG5cbi8qKiBUaGUgb2JqZWN0aXZlIGNoYWluLCBpbiBvcmRlciwgYW5kIHdoZXJlIGVhY2ggbGVhZHMgKHRoZSBtYXAncyBiZWFtLFxuICogIHRoZSBsb2NhdG9yKS4gV2hpY2ggb25lIGlzIGN1cnJlbnQgZm9sbG93cyBmcm9tIHRoZSBnYW1lIChgb2JqZWN0aXZlYFxuICogIGluIGByZWR1Y2UudHNgKTogc29tZXRoaW5nIGJvdWdodCwgYSBub2RlIGluIHRoZSBjdXR0ZXIncyBjaXJjdWl0LCB0aGVcbiAqICBidWxraGVhZCBvcGVuLiBUaGUgbGFzdCBoYXMgbm8gZW5kLiAqL1xuZXhwb3J0IGNvbnN0IE9CSkVDVElWRVMgPSBbXG4gIHtcbiAgICB0bzogXCJzdG9yZVwiLFxuICAgIHRpdGxlOiBcIlJFU1VQUExZXCIsXG4gICAgdGV4dDogXCJUaGUgbWFpbnRlbmFuY2Ugc3RvcmUgb24gQ29uY291cnNlIEMgc3RpbGwgaGFzIHBvd2VyLiBCdXkgd2hhdCB0aGUgc3VpdCBuZWVkcy5cIixcbiAgfSxcbiAge1xuICAgIHRvOiBcImJlbmNoXCIsXG4gICAgdGl0bGU6IFwiVVBHUkFERSBUSEUgQVJDIENVVFRFUlwiLFxuICAgIHRleHQ6IFwiUG93ZXIgYSBub2RlIGluIHRoZSBjdXR0ZXIncyBjaXJjdWl0IGF0IHRoZSB1cGdyYWRlIGJlbmNoLlwiLFxuICB9LFxuICB7XG4gICAgdG86IFwiYnVsa2hlYWRcIixcbiAgICB0aXRsZTogXCJPVkVSUklERSBUSEUgQlVMS0hFQURcIixcbiAgICB0ZXh0OiBcIlRoZSB3YXkgdG8gQ29uY291cnNlIEQgaXMgc2VhbGVkLiBCeXBhc3MgdGhlIGxvY2sgYXQgaXRzIGhhY2sgcGFuZWwuXCIsXG4gIH0sXG4gIHtcbiAgICB0bzogXCJlbGV2YXRvclwiLFxuICAgIHRpdGxlOiBcIlJFQUNIIFRIRSBSRUZJTkVSWVwiLFxuICAgIHRleHQ6IFwiUmlkZSB0aGUgZnJlaWdodCBlbGV2YXRvciBkb3duIHRvIGRlY2sgMy4gU29tZW9uZSB0aGVyZSBpcyBzdGlsbCB0cmFuc21pdHRpbmcuXCIsXG4gIH0sXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBMb2cgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGZyb206IHN0cmluZztcbiAgLyoqIEF1ZGlvIGxvZ3MgcGxheSBhIGdhcmJsZWQgdHJhbnNtaXNzaW9uICh0aGUgYGxvZ2AgY3VlKTsgdGhlIHRleHQgaXNcbiAgICogIHRoZWlyIHRyYW5zY3JpcHQuICovXG4gIGF1ZGlvOiBib29sZWFuO1xuICB0ZXh0OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY29uc3QgTE9HUzogTG9nW10gPSBbXG4gIHtcbiAgICBpZDogXCJzaGlmdC1yb3N0ZXJcIixcbiAgICB0aXRsZTogXCJTSElGVCBST1NURVIgNy1DXCIsXG4gICAgZnJvbTogXCJDb25jb3Vyc2UgQyBTdXBlcnZpc29yXCIsXG4gICAgYXVkaW86IGZhbHNlLFxuICAgIHRleHQ6XG4gICAgICBcIk5pZ2h0IGNyZXcgc2hvcnQgZm91ciBhZ2Fpbi4gUGV0cm92IGFuZCB0aGUgV2FuIHNpc3RlcnMgcmVwb3J0ZWQgdG8gbWVkaWNhbCB3aXRoIHRoZSBoZWFkYWNoZXMsIFwiICtcbiAgICAgIFwiQWJhcmEgbmV2ZXIgY2xvY2tlZCBpbi4gSWNlIG91dHB1dCBkb3duIDMwJSBvbiB0aGUgd2Vlay4gSWYgSGFsZGVuIGFza3MsIGl0J3MgdGhlIGRyaWxscy5cIixcbiAgfSxcbiAge1xuICAgIGlkOiBcIm1haW50ZW5hbmNlLW5vdGVcIixcbiAgICB0aXRsZTogXCJXT1JLIE9SREVSIDIyOTFcIixcbiAgICBmcm9tOiBcIkZhY2lsaXRpZXNcIixcbiAgICBhdWRpbzogZmFsc2UsXG4gICAgdGV4dDpcbiAgICAgIFwiQnVsa2hlYWQgQy1EIGxvY2sgcmVqZWN0aW5nIGV2ZXJ5IGJhZGdlIHNpbmNlIDAyOjE0LiBNYW51YWwgb3ZlcnJpZGUgc2l0cyBiZWhpbmQgdGhlIHBhbmVsIFwiICtcbiAgICAgIFwibGVmdCBvZiB0aGUgZnJhbWU6IHRocmVlIHR1bWJsZXJzLCByb3RhcnkuIERvIE5PVCBmb3JjZSBpdCB3aGlsZSB0aGUgcGFuZWwgaXMgbGl2ZS5cIixcbiAgfSxcbiAge1xuICAgIGlkOiBcInN0b3JlLWxlZGdlclwiLFxuICAgIHRpdGxlOiBcIlNUT1JFIExFREdFUlwiLFxuICAgIGZyb206IFwiQ29uY291cnNlIEMgU3RvcmVcIixcbiAgICBhdWRpbzogZmFsc2UsXG4gICAgdGV4dDpcbiAgICAgIFwiRXZlcnkgbWVkcGFjayBpbiB0aGUgZGlzdHJpY3Qgc29sZCBpbiBzaXggaG91cnMuIEFpciBjYW5pc3RlcnMgZ29uZSBieSBub29uLiBcIiArXG4gICAgICBcIk5vYm9keSBib3VnaHQgYW1tdW5pdGlvbi4gTm9ib2R5IG5lZWRlZCB0bywgeWV0LlwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwib2thZm9yLTFcIixcbiAgICB0aXRsZTogXCJNRVNTQUdFIEZST00gREVDSyAzXCIsXG4gICAgZnJvbTogXCJEci4gSW5lcyBWYXJnYVwiLFxuICAgIGF1ZGlvOiB0cnVlLFxuICAgIHRleHQ6XG4gICAgICBcIk9rYWZvciwgaWYgdGhpcyByZWFjaGVzIHlvdSDigJQgZG9uJ3QgdHJ1c3QgdGhlIGVsZXZhdG9yIGxvZ3MuIFRoZSByZWZpbmVyeSBpc24ndCBlbXB0eS4gXCIgK1xuICAgICAgXCJXZSBzZWFsZWQgb3Vyc2VsdmVzIGluIHRoZSBjb250cm9sIHJvb20uIEJyaW5nIGN1dHRlciBjZWxscy4gQnJpbmcgYWxsIG9mIHRoZW0uXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJva2Fmb3ItMlwiLFxuICAgIHRpdGxlOiBcIkhBTERFTiBQUklPUklUWVwiLFxuICAgIGZyb206IFwiSGFsZGVuIEljZSAmIE9yZVwiLFxuICAgIGF1ZGlvOiB0cnVlLFxuICAgIHRleHQ6XG4gICAgICBcIkVuZ2luZWVyIFQuIE9rYWZvcjogeW91ciBjb250cmFjdCBvYmxpZ2VzIHlvdSB0byByZXN0b3JlIENvbmNvdXJzZSBEIGFjY2Vzcy4gXCIgK1xuICAgICAgXCJTdGF0aW9uIHF1YXJhbnRpbmUgaXMgYSBwcmVjYXV0aW9uLiBQcm9kdWN0aW9uIHJlc3VtZXMgYXQgdGhlIG5leHQgc2hpZnQuXCIsXG4gIH0sXG5dO1xuIiwgImltcG9ydCB0eXBlIHsgV2VhcG9uSWQgfSBmcm9tIFwiLi9pdGVtc1wiO1xuXG4vKiogV2hhdCB0aGUgYmVuY2ggdXBncmFkZXM6IHRoZSB0aHJlZSB3ZWFwb25zIGFuZCB0aGUgc3VpdCAodGhlIFJJRykuICovXG5leHBvcnQgdHlwZSBCZW5jaFRhcmdldCA9IFdlYXBvbklkIHwgXCJyaWdcIjtcbmV4cG9ydCBjb25zdCBCRU5DSF9UQVJHRVRTOiBCZW5jaFRhcmdldFtdID0gW1wiY3V0dGVyXCIsIFwicHVsc2VcIiwgXCJyYWlsXCIsIFwicmlnXCJdO1xuXG4vKiogQSBjaXJjdWl0IG5vZGUncyBlZmZlY3QuIGBzdGFydGAgaXMgdGhlIGNpcmN1aXQncyBpbnB1dCAoYWx3YXlzXG4gKiAgcG93ZXJlZCk7IGBlbXB0eWAgaXMgYSBqdW5jdGlvbiB0aGF0IG9ubHkgY2FycmllcyBwb3dlciBvbi4gKi9cbmV4cG9ydCB0eXBlIE5vZGVLaW5kID1cbiAgfCBcInN0YXJ0XCJcbiAgfCBcImRhbWFnZVwiXG4gIHwgXCJjYXBhY2l0eVwiXG4gIHwgXCJyZWxvYWRcIlxuICB8IFwic3BlY2lhbFwiXG4gIHwgXCJlbXB0eVwiO1xuXG5leHBvcnQgdHlwZSBDaXJjdWl0Tm9kZSA9IHtcbiAgaWQ6IHN0cmluZztcbiAgLyoqIEdyaWQgY2VsbCAoNiDDlyAzKS4gKi9cbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIGtpbmQ6IE5vZGVLaW5kO1xuICAvKiogTmVpZ2hib3VycyBhIHBvd2VyZWQgbm9kZSBwYXNzZXMgcG93ZXIgdG8uICovXG4gIGxpbmtzOiBzdHJpbmdbXTtcbn07XG5cbi8qKiBFdmVyeSBjaXJjdWl0IGhhcyB0aGUgc2FtZSBib2FyZDsgdGhlIHRhcmdldHMgZGlmZmVyIGluIHdoaWNoIG5vZGUgZG9lc1xuICogIHdoYXQuIEEgbm9kZSBjYW4gYmUgcG93ZXJlZCAoY29zdHMgb25lIHBvd2VyIGNlbGwpIHdoZW4gYSBuZWlnaGJvdXIgaXMuICovXG5jb25zdCBCT0FSRDogW3N0cmluZywgbnVtYmVyLCBudW1iZXIsIHN0cmluZ1tdXVtdID0gW1xuICBbXCJzdGFydFwiLCAwLCAxLCBbXCJhXCJdXSxcbiAgW1wiYVwiLCAxLCAxLCBbXCJzdGFydFwiLCBcImJcIiwgXCJhMlwiXV0sXG4gIFtcImEyXCIsIDEsIDAsIFtcImFcIl1dLFxuICBbXCJiXCIsIDIsIDEsIFtcImFcIiwgXCJjXCIsIFwiYjJcIl1dLFxuICBbXCJiMlwiLCAyLCAyLCBbXCJiXCJdXSxcbiAgW1wiY1wiLCAzLCAxLCBbXCJiXCIsIFwiZFwiLCBcImMyXCJdXSxcbiAgW1wiYzJcIiwgMywgMCwgW1wiY1wiXV0sXG4gIFtcImRcIiwgNCwgMSwgW1wiY1wiLCBcImVcIiwgXCJkMlwiXV0sXG4gIFtcImQyXCIsIDQsIDIsIFtcImRcIl1dLFxuICBbXCJlXCIsIDUsIDEsIFtcImRcIl1dLFxuXTtcblxuZnVuY3Rpb24gY2lyY3VpdChraW5kczogUmVjb3JkPHN0cmluZywgTm9kZUtpbmQ+KTogQ2lyY3VpdE5vZGVbXSB7XG4gIHJldHVybiBCT0FSRC5tYXAoKFtpZCwgeCwgeSwgbGlua3NdKSA9PiAoe1xuICAgIGlkLFxuICAgIHgsXG4gICAgeSxcbiAgICBsaW5rcyxcbiAgICBraW5kOiBpZCA9PT0gXCJzdGFydFwiID8gXCJzdGFydFwiIDogKGtpbmRzW2lkXSA/PyBcImVtcHR5XCIpLFxuICB9KSk7XG59XG5cbmV4cG9ydCBjb25zdCBDSVJDVUlUUzogUmVjb3JkPEJlbmNoVGFyZ2V0LCBDaXJjdWl0Tm9kZVtdPiA9IHtcbiAgY3V0dGVyOiBjaXJjdWl0KHtcbiAgICBhOiBcImRhbWFnZVwiLFxuICAgIGEyOiBcInJlbG9hZFwiLFxuICAgIGI6IFwiY2FwYWNpdHlcIixcbiAgICBiMjogXCJjYXBhY2l0eVwiLFxuICAgIGMyOiBcInJlbG9hZFwiLFxuICAgIGQ6IFwiZGFtYWdlXCIsXG4gICAgZDI6IFwiY2FwYWNpdHlcIixcbiAgICBlOiBcInNwZWNpYWxcIixcbiAgfSksXG4gIHB1bHNlOiBjaXJjdWl0KHtcbiAgICBhOiBcImNhcGFjaXR5XCIsXG4gICAgYTI6IFwiZGFtYWdlXCIsXG4gICAgYjogXCJyZWxvYWRcIixcbiAgICBiMjogXCJjYXBhY2l0eVwiLFxuICAgIGM6IFwiZGFtYWdlXCIsXG4gICAgZDI6IFwicmVsb2FkXCIsXG4gICAgZDogXCJjYXBhY2l0eVwiLFxuICAgIGU6IFwic3BlY2lhbFwiLFxuICB9KSxcbiAgcmFpbDogY2lyY3VpdCh7XG4gICAgYTogXCJkYW1hZ2VcIixcbiAgICBhMjogXCJjYXBhY2l0eVwiLFxuICAgIGIyOiBcInJlbG9hZFwiLFxuICAgIGM6IFwiZGFtYWdlXCIsXG4gICAgYzI6IFwiY2FwYWNpdHlcIixcbiAgICBkOiBcInJlbG9hZFwiLFxuICAgIGU6IFwic3BlY2lhbFwiLFxuICB9KSxcbiAgcmlnOiBjaXJjdWl0KHtcbiAgICBhOiBcImRhbWFnZVwiLFxuICAgIGEyOiBcImNhcGFjaXR5XCIsXG4gICAgYjogXCJyZWxvYWRcIixcbiAgICBjOiBcImNhcGFjaXR5XCIsXG4gICAgYzI6IFwiZGFtYWdlXCIsXG4gICAgZDI6IFwicmVsb2FkXCIsXG4gICAgZDogXCJkYW1hZ2VcIixcbiAgICBlOiBcInNwZWNpYWxcIixcbiAgfSksXG59O1xuXG4vKiogSG93IGVhY2ggbm9kZSBraW5kIHJlYWRzIG9uIGVhY2ggdGFyZ2V0ICh0aGUgUklHJ3MgXCJkYW1hZ2VcIiBpcyBhcm1vcixcbiAqICBpdHMgXCJjYXBhY2l0eVwiIGFpciwgaXRzIFwicmVsb2FkXCIgc3Rhc2lzKS4gKi9cbmV4cG9ydCBjb25zdCBTVEFUX05BTUVTOiBSZWNvcmQ8QmVuY2hUYXJnZXQsIFJlY29yZDxOb2RlS2luZCwgc3RyaW5nPj4gPSB7XG4gIGN1dHRlcjogbmFtZXMoXCJEQU1BR0VcIiwgXCJDQVBBQ0lUWVwiLCBcIlJFTE9BRFwiLCBcIlNVUEVSSEVBVEVEIEFSQ1wiKSxcbiAgcHVsc2U6IG5hbWVzKFwiREFNQUdFXCIsIFwiQ0FQQUNJVFlcIiwgXCJSRUxPQURcIiwgXCJEUklWRVIgTUlORVwiKSxcbiAgcmFpbDogbmFtZXMoXCJEQU1BR0VcIiwgXCJDQVBBQ0lUWVwiLCBcIlJFTE9BRFwiLCBcIlBJTk5JTkcgU1BJS0VcIiksXG4gIHJpZzogbmFtZXMoXCJBUk1PUlwiLCBcIkFJUlwiLCBcIlNUQVNJU1wiLCBcIkFVVE8tU1RBU0lTXCIpLFxufTtcblxuZnVuY3Rpb24gbmFtZXMoXG4gIGRhbWFnZTogc3RyaW5nLFxuICBjYXBhY2l0eTogc3RyaW5nLFxuICByZWxvYWQ6IHN0cmluZyxcbiAgc3BlY2lhbDogc3RyaW5nLFxuKTogUmVjb3JkPE5vZGVLaW5kLCBzdHJpbmc+IHtcbiAgcmV0dXJuIHtcbiAgICBzdGFydDogXCJJTlBVVFwiLFxuICAgIGVtcHR5OiBcIkpVTkNUSU9OXCIsXG4gICAgZGFtYWdlLFxuICAgIGNhcGFjaXR5LFxuICAgIHJlbG9hZCxcbiAgICBzcGVjaWFsLFxuICB9O1xufVxuXG4vKiogQmFzZSB2YWx1ZXMgYW5kIHBlci1ub2RlIHN0ZXBzOiB3ZWFwb25zIChkYW1hZ2UsIGNsaXAsIHJlbG9hZCBzKSBhbmRcbiAqICB0aGUgUklHIChhcm1vciAlLCBhaXIgcywgc3Rhc2lzIHMpLiAqL1xuY29uc3QgU1RBVFM6IFJlY29yZDxcbiAgQmVuY2hUYXJnZXQsXG4gIHtcbiAgICBkYW1hZ2U6IFtudW1iZXIsIG51bWJlcl07XG4gICAgY2FwYWNpdHk6IFtudW1iZXIsIG51bWJlcl07XG4gICAgcmVsb2FkOiBbbnVtYmVyLCBudW1iZXJdO1xuICB9XG4+ID0ge1xuICBjdXR0ZXI6IHsgZGFtYWdlOiBbMTAsIDNdLCBjYXBhY2l0eTogWzEwLCAyXSwgcmVsb2FkOiBbMS42LCAtMC4yXSB9LFxuICBwdWxzZTogeyBkYW1hZ2U6IFs2LCAxXSwgY2FwYWNpdHk6IFsyNSwgNV0sIHJlbG9hZDogWzIuMCwgLTAuMjVdIH0sXG4gIHJhaWw6IHsgZGFtYWdlOiBbMzAsIDhdLCBjYXBhY2l0eTogWzQsIDFdLCByZWxvYWQ6IFsyLjQsIC0wLjNdIH0sXG4gIHJpZzogeyBkYW1hZ2U6IFswLCAxMF0sIGNhcGFjaXR5OiBbNjAsIDE1XSwgcmVsb2FkOiBbNCwgMV0gfSxcbn07XG5cbi8qKiBUaGUgdGFyZ2V0J3Mgc3RhdHMgd2l0aCBgaW5zdGFsbGVkYCBub2RlcyBwb3dlcmVkLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXRzKHRhcmdldDogQmVuY2hUYXJnZXQsIGluc3RhbGxlZDogc3RyaW5nW10pIHtcbiAgY29uc3Qgbm9kZXMgPSBDSVJDVUlUU1t0YXJnZXRdLmZpbHRlcigobikgPT4gaW5zdGFsbGVkLmluY2x1ZGVzKG4uaWQpKTtcbiAgY29uc3QgY291bnQgPSAoa2luZDogTm9kZUtpbmQpID0+IG5vZGVzLmZpbHRlcigobikgPT4gbi5raW5kID09PSBraW5kKS5sZW5ndGg7XG4gIGNvbnN0IHMgPSBTVEFUU1t0YXJnZXRdO1xuICBjb25zdCBhdCA9IChbYmFzZSwgc3RlcF06IFtudW1iZXIsIG51bWJlcl0sIGtpbmQ6IE5vZGVLaW5kKSA9PlxuICAgIE1hdGgucm91bmQoKGJhc2UgKyBzdGVwICogY291bnQoa2luZCkpICogMTAwKSAvIDEwMDtcbiAgcmV0dXJuIHtcbiAgICBkYW1hZ2U6IGF0KHMuZGFtYWdlLCBcImRhbWFnZVwiKSxcbiAgICBjYXBhY2l0eTogYXQocy5jYXBhY2l0eSwgXCJjYXBhY2l0eVwiKSxcbiAgICByZWxvYWQ6IGF0KHMucmVsb2FkLCBcInJlbG9hZFwiKSxcbiAgICBzcGVjaWFsOiBjb3VudChcInNwZWNpYWxcIikgPiAwLFxuICB9O1xufVxuXG4vKiogV2hldGhlciBgbm9kZWAgY2FuIGJlIHBvd2VyZWQgbmV4dDogbm90IHlldCwgYW5kIG5leHQgdG8gYSBwb3dlcmVkIG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5JbnN0YWxsKFxuICB0YXJnZXQ6IEJlbmNoVGFyZ2V0LFxuICBpbnN0YWxsZWQ6IHN0cmluZ1tdLFxuICBub2RlOiBzdHJpbmcsXG4pOiBib29sZWFuIHtcbiAgaWYgKG5vZGUgPT09IFwic3RhcnRcIiB8fCBpbnN0YWxsZWQuaW5jbHVkZXMobm9kZSkpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgbiA9IENJUkNVSVRTW3RhcmdldF0uZmluZCgoYykgPT4gYy5pZCA9PT0gbm9kZSk7XG4gIHJldHVybiAhIW4gJiYgbi5saW5rcy5zb21lKChsKSA9PiBsID09PSBcInN0YXJ0XCIgfHwgaW5zdGFsbGVkLmluY2x1ZGVzKGwpKTtcbn1cbiIsICIvKiogRXZlcnl0aGluZyB0aGUgZW5naW5lZXIgY2FuIGNhcnJ5LCBidXkgb3Igc2VsbC4gVGhlIGlkcyBhcmUgc2hhcmVkIHdpdGhcbiAqICBSdXN0OiBgcHJldmlldy9pdGVtcy5yc2AgYnVpbGRzIGEgbW9kZWwgcGVyIGlkICh0aGUgdHVybnRhYmxlIGFuZCB0aGVcbiAqICBgaWNvbi08aWQ+YCBzbmFwc2hvdHMpLCBhbmQgYSBSdXN0IHRlc3QgY2hlY2tzIHRoZSB0d28gbGlzdHMgbWF0Y2guICovXG5leHBvcnQgY29uc3QgSVRFTVMgPSB7XG4gIFwibWVkcGFjay1zXCI6IHtcbiAgICBuYW1lOiBcIlNtYWxsIE1lZHBhY2tcIixcbiAgICBraW5kOiBcImhlYWx0aFwiLFxuICAgIHByaWNlOiAxNTAwLFxuICAgIHN0YWNrOiA1LFxuICAgIHRleHQ6IFwiUmVzdG9yZXMgYSBxdWFydGVyIG9mIHRoZSBzdWl0J3Mgdml0YWxzLlwiLFxuICB9LFxuICBcIm1lZHBhY2stbVwiOiB7XG4gICAgbmFtZTogXCJNZWRpdW0gTWVkcGFja1wiLFxuICAgIGtpbmQ6IFwiaGVhbHRoXCIsXG4gICAgcHJpY2U6IDM1MDAsXG4gICAgc3RhY2s6IDUsXG4gICAgdGV4dDogXCJSZXN0b3JlcyBoYWxmIG9mIHRoZSBzdWl0J3Mgdml0YWxzLlwiLFxuICB9LFxuICBcIm1lZHBhY2stbFwiOiB7XG4gICAgbmFtZTogXCJMYXJnZSBNZWRwYWNrXCIsXG4gICAga2luZDogXCJoZWFsdGhcIixcbiAgICBwcmljZTogNzUwMCxcbiAgICBzdGFjazogNSxcbiAgICB0ZXh0OiBcIlJlc3RvcmVzIHRoZSBzdWl0J3Mgdml0YWxzIGluIGZ1bGwuXCIsXG4gIH0sXG4gIFwic3Rhc2lzLXBhY2tcIjoge1xuICAgIG5hbWU6IFwiU3Rhc2lzIFBhY2tcIixcbiAgICBraW5kOiBcInN0YXNpc1wiLFxuICAgIHByaWNlOiAyMDAwLFxuICAgIHN0YWNrOiAzLFxuICAgIHRleHQ6IFwiUmVmaWxscyB0aGUgc3Rhc2lzIG1vZHVsZS5cIixcbiAgfSxcbiAgXCJhaXItY2FuaXN0ZXJcIjoge1xuICAgIG5hbWU6IFwiQWlyIENhbmlzdGVyXCIsXG4gICAga2luZDogXCJhaXJcIixcbiAgICBwcmljZTogMTIwMCxcbiAgICBzdGFjazogMyxcbiAgICB0ZXh0OiBcIlRoaXJ0eSBzZWNvbmRzIG9mIGFpciBmb3IgdGhlIHN1aXQncyB0YW5rcy5cIixcbiAgfSxcbiAgXCJjdXR0ZXItYW1tb1wiOiB7XG4gICAgbmFtZTogXCJBcmMgQ3V0dGVyIENlbGxzXCIsXG4gICAga2luZDogXCJhbW1vXCIsXG4gICAgcHJpY2U6IDgwMCxcbiAgICBzdGFjazogMjUsXG4gICAgdGV4dDogXCJDaGFyZ2UgY2VsbHMgZm9yIHRoZSBBcmMgQ3V0dGVyLiBUZW4gc2hvdHMgYSBjZWxsLlwiLFxuICB9LFxuICBcInB1bHNlLWFtbW9cIjoge1xuICAgIG5hbWU6IFwiUHVsc2UgRHJpdmVyIFJvdW5kc1wiLFxuICAgIGtpbmQ6IFwiYW1tb1wiLFxuICAgIHByaWNlOiAxNTAwLFxuICAgIHN0YWNrOiAyNTAsXG4gICAgdGV4dDogXCJDYXNlbGVzcyByb3VuZHMgZm9yIHRoZSBQdWxzZSBEcml2ZXIuXCIsXG4gIH0sXG4gIFwicmFpbC1hbW1vXCI6IHtcbiAgICBuYW1lOiBcIlJhaWwgU3Bpa2VzXCIsXG4gICAga2luZDogXCJhbW1vXCIsXG4gICAgcHJpY2U6IDIyMDAsXG4gICAgc3RhY2s6IDEwLFxuICAgIHRleHQ6IFwiVHVuZ3N0ZW4gc3Bpa2VzIGZvciB0aGUgUmFpbCBTcGlrZS5cIixcbiAgfSxcbiAgXCJwb3dlci1jZWxsXCI6IHtcbiAgICBuYW1lOiBcIlBvd2VyIENlbGxcIixcbiAgICBraW5kOiBcInVwZ3JhZGVcIixcbiAgICBwcmljZTogMTAwMDAsXG4gICAgc3RhY2s6IDEwLFxuICAgIHRleHQ6IFwiUG93ZXJzIG9uZSBjaXJjdWl0IG5vZGUgYXQgYW4gdXBncmFkZSBiZW5jaC5cIixcbiAgfSxcbiAgc2VtaWNvbmR1Y3Rvcjoge1xuICAgIG5hbWU6IFwiU2VtaWNvbmR1Y3RvclwiLFxuICAgIGtpbmQ6IFwidmFsdWFibGVcIixcbiAgICBwcmljZTogMzAwMCxcbiAgICBzdGFjazogNSxcbiAgICB0ZXh0OiBcIlNhbHZhZ2VkIGZyb20gYSBkZWFkIHJlYWN0b3IuIFdvcnRoIHNvbWV0aGluZyBhdCBhIHN0b3JlLlwiLFxuICB9LFxuICBjdXR0ZXI6IHtcbiAgICBuYW1lOiBcIkFyYyBDdXR0ZXJcIixcbiAgICBraW5kOiBcIndlYXBvblwiLFxuICAgIHByaWNlOiAwLFxuICAgIHN0YWNrOiAxLFxuICAgIHRleHQ6IFwiSGFsZGVuIG1pbmluZyB0b29sLiBUaHJlZSBlbWl0dGVycyBjdXQgYSBsaW5lIG9mIHBsYXNtYS5cIixcbiAgfSxcbiAgcHVsc2U6IHtcbiAgICBuYW1lOiBcIlB1bHNlIERyaXZlclwiLFxuICAgIGtpbmQ6IFwid2VhcG9uXCIsXG4gICAgcHJpY2U6IDEyMDAwLFxuICAgIHN0YWNrOiAxLFxuICAgIHRleHQ6IFwiU3RhdGlvbiBzZWN1cml0eSByaWZsZS4gRmFzdCwgd2lkZSBzcHJlYWQuXCIsXG4gIH0sXG4gIHJhaWw6IHtcbiAgICBuYW1lOiBcIlJhaWwgU3Bpa2VcIixcbiAgICBraW5kOiBcIndlYXBvblwiLFxuICAgIHByaWNlOiAxODAwMCxcbiAgICBzdGFjazogMSxcbiAgICB0ZXh0OiBcIlN1cnZleSBzcGlrZSBsYXVuY2hlciwgcmVwdXJwb3NlZC4gUGlucyB3aGF0IGl0IGhpdHMuXCIsXG4gIH0sXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBJdGVtSWQgPSBrZXlvZiB0eXBlb2YgSVRFTVM7XG5leHBvcnQgdHlwZSBJdGVtS2luZCA9ICh0eXBlb2YgSVRFTVMpW0l0ZW1JZF1bXCJraW5kXCJdO1xuZXhwb3J0IGNvbnN0IElURU1fSURTID0gT2JqZWN0LmtleXMoSVRFTVMpIGFzIEl0ZW1JZFtdO1xuXG5leHBvcnQgdHlwZSBXZWFwb25JZCA9IFwiY3V0dGVyXCIgfCBcInB1bHNlXCIgfCBcInJhaWxcIjtcbmV4cG9ydCBjb25zdCBXRUFQT05TOiBXZWFwb25JZFtdID0gW1wiY3V0dGVyXCIsIFwicHVsc2VcIiwgXCJyYWlsXCJdO1xuXG4vKiogVGhlIGFtbW8gaXRlbSBlYWNoIHdlYXBvbiBsb2FkcywgYW5kIGhvdyBtYW55IHJvdW5kcyBvbmUgb2YgdGhvc2UgaXRlbXNcbiAqICBob2xkcyAoY2xpcCBzaXplcyBjb21lIGZyb20gdGhlIGJlbmNoLCBgc3RhdHNgIGluIGBiZW5jaC50c2ApLiAqL1xuZXhwb3J0IGNvbnN0IFdFQVBPTl9BTU1POiBSZWNvcmQ8V2VhcG9uSWQsIHsgYW1tbzogSXRlbUlkOyBwZXJJdGVtOiBudW1iZXIgfT4gPVxuICB7XG4gICAgY3V0dGVyOiB7IGFtbW86IFwiY3V0dGVyLWFtbW9cIiwgcGVySXRlbTogMTAgfSxcbiAgICBwdWxzZTogeyBhbW1vOiBcInB1bHNlLWFtbW9cIiwgcGVySXRlbTogMjUgfSxcbiAgICByYWlsOiB7IGFtbW86IFwicmFpbC1hbW1vXCIsIHBlckl0ZW06IDQgfSxcbiAgfTtcblxuLyoqIE9uZSBpbnZlbnRvcnkgc2xvdDogYW4gaXRlbSBhbmQgaG93IG1hbnkuICovXG5leHBvcnQgdHlwZSBTbG90ID0geyBpdGVtOiBJdGVtSWQ7IGNvdW50OiBudW1iZXIgfTtcblxuLyoqIFRoZSBzdWl0J3MgaW52ZW50b3J5OiBhIGZpeGVkIGdyaWQgb2Ygc2xvdHMgKGVtcHR5ID0gYG51bGxgKSwgdGhlXG4gKiAgY3JlZGl0cywgYW5kIHRoZSBzdGF0aW9uIHNhZmUgKG5vIGxpbWl0KS4gKi9cbmV4cG9ydCB0eXBlIFBhY2sgPSB7XG4gIHNsb3RzOiAoU2xvdCB8IG51bGwpW107XG4gIGNyZWRpdHM6IG51bWJlcjtcbiAgc2FmZTogU2xvdFtdO1xufTtcblxuZXhwb3J0IGNvbnN0IFBBQ0tfU0xPVFMgPSAxMjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxQYWNrKCk6IFBhY2sge1xuICBjb25zdCBzbG90czogKFNsb3QgfCBudWxsKVtdID0gW1xuICAgIHsgaXRlbTogXCJtZWRwYWNrLXNcIiwgY291bnQ6IDIgfSxcbiAgICB7IGl0ZW06IFwibWVkcGFjay1tXCIsIGNvdW50OiAxIH0sXG4gICAgeyBpdGVtOiBcInN0YXNpcy1wYWNrXCIsIGNvdW50OiAxIH0sXG4gICAgeyBpdGVtOiBcImFpci1jYW5pc3RlclwiLCBjb3VudDogMSB9LFxuICAgIHsgaXRlbTogXCJjdXR0ZXItYW1tb1wiLCBjb3VudDogMyB9LFxuICAgIHsgaXRlbTogXCJwb3dlci1jZWxsXCIsIGNvdW50OiAyIH0sXG4gICAgeyBpdGVtOiBcInNlbWljb25kdWN0b3JcIiwgY291bnQ6IDIgfSxcbiAgXTtcbiAgd2hpbGUgKHNsb3RzLmxlbmd0aCA8IFBBQ0tfU0xPVFMpIHNsb3RzLnB1c2gobnVsbCk7XG4gIHJldHVybiB7XG4gICAgc2xvdHMsXG4gICAgY3JlZGl0czogMTQyNTAsXG4gICAgc2FmZTogW1xuICAgICAgeyBpdGVtOiBcIm1lZHBhY2stbFwiLCBjb3VudDogMSB9LFxuICAgICAgeyBpdGVtOiBcInB1bHNlLWFtbW9cIiwgY291bnQ6IDEgfSxcbiAgICBdLFxuICB9O1xufVxuXG4vKiogSG93IG1hbnkgb2YgYGl0ZW1gIHRoZSBwYWNrIGhvbGRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50SXRlbShwYWNrOiBQYWNrLCBpdGVtOiBJdGVtSWQpOiBudW1iZXIge1xuICByZXR1cm4gcGFjay5zbG90cy5yZWR1Y2UoKG4sIHMpID0+IChzPy5pdGVtID09PSBpdGVtID8gbiArIHMuY291bnQgOiBuKSwgMCk7XG59XG5cbi8qKiBUaGUgcGFjayB3aXRoIGBuYCBtb3JlIG9mIGBpdGVtYCAoc3RhY2tlZCwgdGhlbiBpbnRvIGVtcHR5IHNsb3RzKSwgb3JcbiAqICBgbnVsbGAgaWYgaXQgZG9lc24ndCBmaXQuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkSXRlbShwYWNrOiBQYWNrLCBpdGVtOiBJdGVtSWQsIG4gPSAxKTogUGFjayB8IG51bGwge1xuICBjb25zdCBzbG90cyA9IHBhY2suc2xvdHMubWFwKChzKSA9PiAocyA/IHsgLi4ucyB9IDogbnVsbCkpO1xuICBjb25zdCBzdGFjayA9IElURU1TW2l0ZW1dLnN0YWNrO1xuICBsZXQgbGVmdCA9IG47XG4gIGZvciAoY29uc3QgcyBvZiBzbG90cykge1xuICAgIGlmIChsZWZ0ID4gMCAmJiBzPy5pdGVtID09PSBpdGVtICYmIHMuY291bnQgPCBzdGFjaykge1xuICAgICAgY29uc3QgdGFrZSA9IE1hdGgubWluKHN0YWNrIC0gcy5jb3VudCwgbGVmdCk7XG4gICAgICBzLmNvdW50ICs9IHRha2U7XG4gICAgICBsZWZ0IC09IHRha2U7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2xvdHMubGVuZ3RoICYmIGxlZnQgPiAwOyBpKyspIHtcbiAgICBpZiAoIXNsb3RzW2ldKSB7XG4gICAgICBjb25zdCB0YWtlID0gTWF0aC5taW4oc3RhY2ssIGxlZnQpO1xuICAgICAgc2xvdHNbaV0gPSB7IGl0ZW0sIGNvdW50OiB0YWtlIH07XG4gICAgICBsZWZ0IC09IHRha2U7XG4gICAgfVxuICB9XG4gIHJldHVybiBsZWZ0ID4gMCA/IG51bGwgOiB7IC4uLnBhY2ssIHNsb3RzIH07XG59XG5cbi8qKiBUaGUgcGFjayB3aXRoIGBuYCBmZXdlciBvZiBgaXRlbWAgKGVtcHRpZWQgc2xvdHMgZ28gYG51bGxgKSwgb3IgYG51bGxgXG4gKiAgaWYgaXQgZG9lc24ndCBob2xkIHRoYXQgbWFueS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YWtlSXRlbShwYWNrOiBQYWNrLCBpdGVtOiBJdGVtSWQsIG4gPSAxKTogUGFjayB8IG51bGwge1xuICBpZiAoY291bnRJdGVtKHBhY2ssIGl0ZW0pIDwgbikgcmV0dXJuIG51bGw7XG4gIGxldCBsZWZ0ID0gbjtcbiAgY29uc3Qgc2xvdHMgPSBwYWNrLnNsb3RzLm1hcCgocykgPT4ge1xuICAgIGlmICghcyB8fCBzLml0ZW0gIT09IGl0ZW0gfHwgbGVmdCA9PT0gMCkgcmV0dXJuIHM7XG4gICAgY29uc3QgdGFrZSA9IE1hdGgubWluKHMuY291bnQsIGxlZnQpO1xuICAgIGxlZnQgLT0gdGFrZTtcbiAgICByZXR1cm4gcy5jb3VudCAtIHRha2UgPiAwID8geyAuLi5zLCBjb3VudDogcy5jb3VudCAtIHRha2UgfSA6IG51bGw7XG4gIH0pO1xuICByZXR1cm4geyAuLi5wYWNrLCBzbG90cyB9O1xufVxuXG4vKiogQ3JlZGl0cyBhIHN0b3JlIHBheXMgZm9yIG9uZSBgaXRlbWAuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsbFByaWNlKGl0ZW06IEl0ZW1JZCk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnJvdW5kKElURU1TW2l0ZW1dLnByaWNlICogMC41KTtcbn1cblxuLyoqIGAxNDI1MGAg4oaSIGBcIjE0LDI1MFwiYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVkaXRzKG46IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmcobikucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpO1xufVxuIiwgImltcG9ydCB7IGNhbkluc3RhbGwsIHN0YXRzIH0gZnJvbSBcIi4vYmVuY2hcIjtcbmltcG9ydCB7XG4gIGFkZEl0ZW0sXG4gIGNvdW50SXRlbSxcbiAgSVRFTVMsXG4gIHNlbGxQcmljZSxcbiAgdGFrZUl0ZW0sXG4gIFdFQVBPTl9BTU1PLFxuICB0eXBlIEl0ZW1JZCxcbiAgdHlwZSBXZWFwb25JZCxcbn0gZnJvbSBcIi4vaXRlbXNcIjtcbmltcG9ydCB7IE9CSkVDVElWRVMgfSBmcm9tIFwiLi9sb3JlXCI7XG5pbXBvcnQgdHlwZSB7IEFjdGlvbiwgR2FtZSB9IGZyb20gXCIuL3N0YXRlXCI7XG5cbi8qKiBIb3cgbXVjaCBlYWNoIG1lZHBhY2sgcmVzdG9yZXMuICovXG5leHBvcnQgY29uc3QgSEVBTFM6IFBhcnRpYWw8UmVjb3JkPEl0ZW1JZCwgbnVtYmVyPj4gPSB7XG4gIFwibWVkcGFjay1zXCI6IDAuMjUsXG4gIFwibWVkcGFjay1tXCI6IDAuNSxcbiAgXCJtZWRwYWNrLWxcIjogMSxcbn07XG4vKiogT25lIGhpdCdzIGRhbWFnZSBiZWZvcmUgYXJtb3IuICovXG5jb25zdCBISVQgPSAwLjE1O1xuLyoqIE9uZSBzdGFzaXMgc2hvdCdzIGNvc3QuICovXG5jb25zdCBTVEFTSVNfQ09TVCA9IDAuMjU7XG4vKiogSGVhbHRoIGxvc3QgcGVyIHNlY29uZCB3aXRoIHRoZSB0YW5rcyBlbXB0eS4gKi9cbmNvbnN0IFNVRkZPQ0FURSA9IDAuMDU7XG5cbi8qKiBBIHdlYXBvbidzIGNsaXAgc2l6ZSB3aXRoIGl0cyBiZW5jaCB1cGdyYWRlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGlwU2l6ZShnOiBHYW1lLCB3ZWFwb246IFdlYXBvbklkKTogbnVtYmVyIHtcbiAgcmV0dXJuIHN0YXRzKHdlYXBvbiwgZy5iZW5jaFt3ZWFwb25dKS5jYXBhY2l0eTtcbn1cblxuLyoqIFNlY29uZHMgb2YgYWlyIGEgZnVsbCB0YW5rIGhvbGRzICh0aGUgUklHJ3MgYWlyIG5vZGVzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhaXJNYXgoZzogR2FtZSk6IG51bWJlciB7XG4gIHJldHVybiBzdGF0cyhcInJpZ1wiLCBnLmJlbmNoLnJpZykuY2FwYWNpdHk7XG59XG5cbi8qKiBSb3VuZHMgbGVmdCBvdXRzaWRlIHRoZSBjbGlwIGZvciBgd2VhcG9uYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNlcnZlKGc6IEdhbWUsIHdlYXBvbjogV2VhcG9uSWQpOiBudW1iZXIge1xuICBjb25zdCB7IGFtbW8sIHBlckl0ZW0gfSA9IFdFQVBPTl9BTU1PW3dlYXBvbl07XG4gIHJldHVybiBjb3VudEl0ZW0oZy5wYWNrLCBhbW1vKSAqIHBlckl0ZW07XG59XG5cbi8qKiBUaGUgY3VycmVudCBvYmplY3RpdmUgKGluZGV4IGludG8gYE9CSkVDVElWRVNgKTogdGhlIGZpcnN0IHN0ZXAgdGhlXG4gKiAgZ2FtZSBoYXNuJ3QgZG9uZSB5ZXQsIGluIHdoYXRldmVyIG9yZGVyIGhlIGdldHMgdG8gdGhlbS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RpdmUoZzogR2FtZSk6IG51bWJlciB7XG4gIGlmICghZy5zdG9yeS5ib3VnaHQpIHJldHVybiAwO1xuICBpZiAoZy5iZW5jaC5jdXR0ZXIubGVuZ3RoID09PSAwKSByZXR1cm4gMTtcbiAgaWYgKGcuZml4dHVyZXMuZG9vciA9PT0gXCJsb2NrZWRcIikgcmV0dXJuIDI7XG4gIHJldHVybiBPQkpFQ1RJVkVTLmxlbmd0aCAtIDE7XG59XG5cbi8qKiBUaGUgZ2FtZSBhZnRlciBgYWAuIEEgY2hhbmdlIHRoYXQgY2FuJ3QgaGFwcGVuIChubyBtZWRwYWNrLCBhbiBlbXB0eVxuICogIGNsaXAsIG5vdCBlbm91Z2ggY3JlZGl0cykgcmV0dXJucyBgZ2AgaXRzZWxmOiBjYWxsZXJzIGNvbXBhcmUgYnlcbiAqICBpZGVudGl0eSB0byBrbm93IGFuIGFjdGlvbiB3YXMgcmVmdXNlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2UoZzogR2FtZSwgYTogQWN0aW9uKTogR2FtZSB7XG4gIHN3aXRjaCAoYS50eXBlKSB7XG4gICAgY2FzZSBcIm5lYXJcIjoge1xuICAgICAgY29uc3QgeyBuZWFyIH0gPSBnLmhlcmU7XG4gICAgICBpZiAobmVhci5pbmNsdWRlcyhhLnN1cmZhY2UpID09PSBhLm9uKSByZXR1cm4gZztcbiAgICAgIGNvbnN0IG5leHQgPSBhLm9uXG4gICAgICAgID8gWy4uLm5lYXIsIGEuc3VyZmFjZV1cbiAgICAgICAgOiBuZWFyLmZpbHRlcigocykgPT4gcyAhPT0gYS5zdXJmYWNlKTtcbiAgICAgIHJldHVybiB7IC4uLmcsIGhlcmU6IHsgLi4uZy5oZXJlLCBuZWFyOiBuZXh0IH0gfTtcbiAgICB9XG4gICAgY2FzZSBcInN0YW5jZVwiOiB7XG4gICAgICBjb25zdCB7IGFpbWluZywgbW91c2UsIHNjcmVlbiwgb2ZmZXIgfSA9IGE7XG4gICAgICByZXR1cm4geyAuLi5nLCBoZXJlOiB7IC4uLmcuaGVyZSwgYWltaW5nLCBtb3VzZSwgc2NyZWVuLCBvZmZlciB9IH07XG4gICAgfVxuICAgIGNhc2UgXCJtZW51XCI6XG4gICAgICBpZiAoZy5oZXJlLm1lbnUgPT09IGEub3BlbikgcmV0dXJuIGc7XG4gICAgICByZXR1cm4geyAuLi5nLCBoZXJlOiB7IC4uLmcuaGVyZSwgbWVudTogYS5vcGVuIH0gfTtcbiAgICBjYXNlIFwiaW50cm9PdmVyXCI6XG4gICAgICByZXR1cm4gZy5oZXJlLmludHJvID8geyAuLi5nLCBoZXJlOiB7IC4uLmcuaGVyZSwgaW50cm86IGZhbHNlIH0gfSA6IGc7XG5cbiAgICBjYXNlIFwiaGl0XCI6IHtcbiAgICAgIGNvbnN0IGFybW9yID0gc3RhdHMoXCJyaWdcIiwgZy5iZW5jaC5yaWcpLmRhbWFnZSAvIDEwMDtcbiAgICAgIGNvbnN0IGhlYWx0aCA9IE1hdGgubWF4KDAsIGcuc3VpdC5oZWFsdGggLSBISVQgKiAoMSAtIGFybW9yKSk7XG4gICAgICByZXR1cm4geyAuLi5nLCBzdWl0OiB7IC4uLmcuc3VpdCwgaGVhbHRoIH0gfTtcbiAgICB9XG4gICAgY2FzZSBcImhlYWxcIjoge1xuICAgICAgY29uc3QgYW1vdW50ID0gSEVBTFNbYS5pdGVtXTtcbiAgICAgIGlmICghYW1vdW50IHx8IGcuc3VpdC5oZWFsdGggPj0gMSkgcmV0dXJuIGc7XG4gICAgICBjb25zdCBwYWNrID0gdGFrZUl0ZW0oZy5wYWNrLCBhLml0ZW0pO1xuICAgICAgaWYgKCFwYWNrKSByZXR1cm4gZztcbiAgICAgIGNvbnN0IGhlYWx0aCA9IE1hdGgubWluKDEsIGcuc3VpdC5oZWFsdGggKyBhbW91bnQpO1xuICAgICAgcmV0dXJuIHsgLi4uZywgcGFjaywgc3VpdDogeyAuLi5nLnN1aXQsIGhlYWx0aCB9IH07XG4gICAgfVxuICAgIGNhc2UgXCJzdGFzaXNcIjpcbiAgICAgIGlmIChnLnN1aXQuc3Rhc2lzIDwgU1RBU0lTX0NPU1QpIHJldHVybiBnO1xuICAgICAgcmV0dXJuIHsgLi4uZywgc3VpdDogeyAuLi5nLnN1aXQsIHN0YXNpczogZy5zdWl0LnN0YXNpcyAtIFNUQVNJU19DT1NUIH0gfTtcbiAgICBjYXNlIFwic3Rhc2lzUmVmaWxsXCI6IHtcbiAgICAgIGlmIChnLnN1aXQuc3Rhc2lzID49IDEpIHJldHVybiBnO1xuICAgICAgY29uc3QgcGFjayA9IHRha2VJdGVtKGcucGFjaywgXCJzdGFzaXMtcGFja1wiKTtcbiAgICAgIHJldHVybiBwYWNrID8geyAuLi5nLCBwYWNrLCBzdWl0OiB7IC4uLmcuc3VpdCwgc3Rhc2lzOiAxIH0gfSA6IGc7XG4gICAgfVxuICAgIGNhc2UgXCJ2YWN1dW1cIjpcbiAgICAgIGlmIChnLnN1aXQudmFjdXVtID09PSBhLm9uKSByZXR1cm4gZztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmcsXG4gICAgICAgIC8vIFRoZSB0YW5rcyByZWZpbGwgaW4gYWlyLCBzbyBhIHZlbnQgYWx3YXlzIHN0YXJ0cyB0aGVtIGZ1bGwuXG4gICAgICAgIHN1aXQ6IHsgLi4uZy5zdWl0LCB2YWN1dW06IGEub24sIGFpcjogYWlyTWF4KGcpIH0sXG4gICAgICB9O1xuICAgIGNhc2UgXCJhaXJcIjoge1xuICAgICAgaWYgKCFnLnN1aXQudmFjdXVtKSByZXR1cm4gZztcbiAgICAgIGNvbnN0IGFpciA9IE1hdGgubWF4KDAsIGcuc3VpdC5haXIgLSBhLmR0KTtcbiAgICAgIGNvbnN0IGhlYWx0aCA9XG4gICAgICAgIGFpciA+IDAgPyBnLnN1aXQuaGVhbHRoIDogTWF0aC5tYXgoMCwgZy5zdWl0LmhlYWx0aCAtIFNVRkZPQ0FURSAqIGEuZHQpO1xuICAgICAgcmV0dXJuIHsgLi4uZywgc3VpdDogeyAuLi5nLnN1aXQsIGFpciwgaGVhbHRoIH0gfTtcbiAgICB9XG4gICAgY2FzZSBcImFpclJlZmlsbFwiOiB7XG4gICAgICBjb25zdCBtYXggPSBhaXJNYXgoZyk7XG4gICAgICBpZiAoZy5zdWl0LmFpciA+PSBtYXgpIHJldHVybiBnO1xuICAgICAgY29uc3QgcGFjayA9IHRha2VJdGVtKGcucGFjaywgXCJhaXItY2FuaXN0ZXJcIik7XG4gICAgICBpZiAoIXBhY2spIHJldHVybiBnO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZyxcbiAgICAgICAgcGFjayxcbiAgICAgICAgc3VpdDogeyAuLi5nLnN1aXQsIGFpcjogTWF0aC5taW4obWF4LCBnLnN1aXQuYWlyICsgMzApIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNhc2UgXCJmaXJlXCI6IHtcbiAgICAgIGNvbnN0IHsgd2VhcG9uLCBjbGlwIH0gPSBnLmFybXM7XG4gICAgICBpZiAoY2xpcFt3ZWFwb25dIDw9IDApIHJldHVybiBnO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZyxcbiAgICAgICAgYXJtczogeyAuLi5nLmFybXMsIGNsaXA6IHsgLi4uY2xpcCwgW3dlYXBvbl06IGNsaXBbd2VhcG9uXSAtIDEgfSB9LFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcInJlbG9hZFwiOiB7XG4gICAgICBjb25zdCB7IHdlYXBvbiwgY2xpcCB9ID0gZy5hcm1zO1xuICAgICAgY29uc3Qgc2l6ZSA9IGNsaXBTaXplKGcsIHdlYXBvbik7XG4gICAgICBpZiAoY2xpcFt3ZWFwb25dID49IHNpemUpIHJldHVybiBnO1xuICAgICAgY29uc3QgcGFjayA9IHRha2VJdGVtKGcucGFjaywgV0VBUE9OX0FNTU9bd2VhcG9uXS5hbW1vKTtcbiAgICAgIGlmICghcGFjaykgcmV0dXJuIGc7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5nLFxuICAgICAgICBwYWNrLFxuICAgICAgICBhcm1zOiB7IC4uLmcuYXJtcywgY2xpcDogeyAuLi5jbGlwLCBbd2VhcG9uXTogc2l6ZSB9IH0sXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIFwiZXF1aXBcIjpcbiAgICAgIGlmICghZy5hcm1zLm93bmVkLmluY2x1ZGVzKGEud2VhcG9uKSB8fCBnLmFybXMud2VhcG9uID09PSBhLndlYXBvbilcbiAgICAgICAgcmV0dXJuIGc7XG4gICAgICByZXR1cm4geyAuLi5nLCBhcm1zOiB7IC4uLmcuYXJtcywgd2VhcG9uOiBhLndlYXBvbiB9IH07XG5cbiAgICBjYXNlIFwiYnV5XCI6IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBJVEVNU1thLml0ZW1dO1xuICAgICAgaWYgKGl0ZW0ucHJpY2UgPiBnLnBhY2suY3JlZGl0cykgcmV0dXJuIGc7XG4gICAgICBjb25zdCBjcmVkaXRzID0gZy5wYWNrLmNyZWRpdHMgLSBpdGVtLnByaWNlO1xuICAgICAgY29uc3Qgc3RvcnkgPSB7IC4uLmcuc3RvcnksIGJvdWdodDogdHJ1ZSB9O1xuICAgICAgaWYgKGl0ZW0ua2luZCA9PT0gXCJ3ZWFwb25cIikge1xuICAgICAgICBjb25zdCB3ZWFwb24gPSBhLml0ZW0gYXMgV2VhcG9uSWQ7XG4gICAgICAgIGlmIChnLmFybXMub3duZWQuaW5jbHVkZXMod2VhcG9uKSkgcmV0dXJuIGc7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uZyxcbiAgICAgICAgICBzdG9yeSxcbiAgICAgICAgICBwYWNrOiB7IC4uLmcucGFjaywgY3JlZGl0cyB9LFxuICAgICAgICAgIGFybXM6IHsgLi4uZy5hcm1zLCBvd25lZDogWy4uLmcuYXJtcy5vd25lZCwgd2VhcG9uXSB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgY29uc3QgcGFjayA9IGFkZEl0ZW0oZy5wYWNrLCBhLml0ZW0pO1xuICAgICAgcmV0dXJuIHBhY2sgPyB7IC4uLmcsIHN0b3J5LCBwYWNrOiB7IC4uLnBhY2ssIGNyZWRpdHMgfSB9IDogZztcbiAgICB9XG4gICAgY2FzZSBcInNlbGxcIjoge1xuICAgICAgY29uc3Qgc2xvdCA9IGcucGFjay5zbG90c1thLnNsb3RdO1xuICAgICAgaWYgKCFzbG90KSByZXR1cm4gZztcbiAgICAgIGNvbnN0IHBhY2sgPSB0YWtlSXRlbShnLnBhY2ssIHNsb3QuaXRlbSk7XG4gICAgICBpZiAoIXBhY2spIHJldHVybiBnO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZyxcbiAgICAgICAgcGFjazogeyAuLi5wYWNrLCBjcmVkaXRzOiBwYWNrLmNyZWRpdHMgKyBzZWxsUHJpY2Uoc2xvdC5pdGVtKSB9LFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcInN0b3dcIjoge1xuICAgICAgY29uc3Qgc2xvdCA9IGcucGFjay5zbG90c1thLnNsb3RdO1xuICAgICAgaWYgKCFzbG90KSByZXR1cm4gZztcbiAgICAgIGNvbnN0IHNsb3RzID0gZy5wYWNrLnNsb3RzLm1hcCgocywgaSkgPT4gKGkgPT09IGEuc2xvdCA/IG51bGwgOiBzKSk7XG4gICAgICBjb25zdCBrZXB0ID0gZy5wYWNrLnNhZmUuZmluZCgocykgPT4gcy5pdGVtID09PSBzbG90Lml0ZW0pO1xuICAgICAgY29uc3Qgc2FmZSA9IGtlcHRcbiAgICAgICAgPyBnLnBhY2suc2FmZS5tYXAoKHMpID0+XG4gICAgICAgICAgICBzID09PSBrZXB0ID8geyAuLi5zLCBjb3VudDogcy5jb3VudCArIHNsb3QuY291bnQgfSA6IHMsXG4gICAgICAgICAgKVxuICAgICAgICA6IFsuLi5nLnBhY2suc2FmZSwgc2xvdF07XG4gICAgICByZXR1cm4geyAuLi5nLCBwYWNrOiB7IC4uLmcucGFjaywgc2xvdHMsIHNhZmUgfSB9O1xuICAgIH1cbiAgICBjYXNlIFwicmV0cmlldmVcIjoge1xuICAgICAgY29uc3Qgc3RvcmVkID0gZy5wYWNrLnNhZmVbYS5pbmRleF07XG4gICAgICBpZiAoIXN0b3JlZCkgcmV0dXJuIGc7XG4gICAgICBjb25zdCBwYWNrID0gYWRkSXRlbShnLnBhY2ssIHN0b3JlZC5pdGVtLCBzdG9yZWQuY291bnQpO1xuICAgICAgaWYgKCFwYWNrKSByZXR1cm4gZztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmcsXG4gICAgICAgIHBhY2s6IHsgLi4ucGFjaywgc2FmZTogZy5wYWNrLnNhZmUuZmlsdGVyKChfLCBpKSA9PiBpICE9PSBhLmluZGV4KSB9LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjYXNlIFwiaW5zdGFsbFwiOiB7XG4gICAgICBjb25zdCBpbnN0YWxsZWQgPSBnLmJlbmNoW2EudGFyZ2V0XTtcbiAgICAgIGlmICghY2FuSW5zdGFsbChhLnRhcmdldCwgaW5zdGFsbGVkLCBhLm5vZGUpKSByZXR1cm4gZztcbiAgICAgIGNvbnN0IHBhY2sgPSB0YWtlSXRlbShnLnBhY2ssIFwicG93ZXItY2VsbFwiKTtcbiAgICAgIGlmICghcGFjaykgcmV0dXJuIGc7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5nLFxuICAgICAgICBwYWNrLFxuICAgICAgICBiZW5jaDogeyAuLi5nLmJlbmNoLCBbYS50YXJnZXRdOiBbLi4uaW5zdGFsbGVkLCBhLm5vZGVdIH0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNhc2UgXCJyZWFkXCI6XG4gICAgICBpZiAoZy5zdG9yeS5yZWFkLmluY2x1ZGVzKGEubG9nKSkgcmV0dXJuIGc7XG4gICAgICByZXR1cm4geyAuLi5nLCBzdG9yeTogeyAuLi5nLnN0b3J5LCByZWFkOiBbLi4uZy5zdG9yeS5yZWFkLCBhLmxvZ10gfSB9O1xuXG4gICAgY2FzZSBcInVubG9ja1wiOlxuICAgICAgaWYgKGcuZml4dHVyZXMuZG9vciAhPT0gXCJsb2NrZWRcIikgcmV0dXJuIGc7XG4gICAgICByZXR1cm4geyAuLi5nLCBmaXh0dXJlczogeyAuLi5nLmZpeHR1cmVzLCBkb29yOiBcInVubG9ja2VkXCIgfSB9O1xuICAgIGNhc2UgXCJvcGVuZWRcIjpcbiAgICAgIHJldHVybiB7IC4uLmcsIGZpeHR1cmVzOiB7IC4uLmcuZml4dHVyZXMsIGRvb3I6IFwib3BlblwiIH0gfTtcbiAgICBjYXNlIFwic2F2ZVwiOiB7XG4gICAgICBjb25zdCBpZCA9IChnLmZpeHR1cmVzLnNhdmVzLmF0KC0xKT8uaWQgPz8gMCkgKyAxO1xuICAgICAgY29uc3QgY29weTogR2FtZSA9IHsgLi4uZywgZml4dHVyZXM6IHsgLi4uZy5maXh0dXJlcywgc2F2ZXM6IFtdIH0gfTtcbiAgICAgIGNvbnN0IHNsb3QgPSB7XG4gICAgICAgIGlkLFxuICAgICAgICB0aW1lOiBhLnRpbWUsXG4gICAgICAgIG9iamVjdGl2ZTogb2JqZWN0aXZlKGcpLFxuICAgICAgICBnYW1lOiBjb3B5LFxuICAgICAgfTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmcsXG4gICAgICAgIGZpeHR1cmVzOiB7IC4uLmcuZml4dHVyZXMsIHNhdmVzOiBbLi4uZy5maXh0dXJlcy5zYXZlcywgc2xvdF0gfSxcbiAgICAgIH07XG4gICAgfVxuICAgIGNhc2UgXCJsb2FkXCI6IHtcbiAgICAgIGNvbnN0IHNsb3QgPSBnLmZpeHR1cmVzLnNhdmVzLmZpbmQoKHMpID0+IHMuaWQgPT09IGEuaWQpO1xuICAgICAgaWYgKCFzbG90KSByZXR1cm4gZztcbiAgICAgIC8vIFRoZSByb29tIGl0c2VsZiBkb2Vzbid0IHJld2luZDogd2hlcmUgaGUgc3RhbmRzLCB0aGUgZG9vcnMgYW5kXG4gICAgICAvLyB0aGUgZWxldmF0b3Igc3RheSBhcyB0aGV5IGFyZS5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLnNsb3QuZ2FtZSxcbiAgICAgICAgaGVyZTogZy5oZXJlLFxuICAgICAgICBmaXh0dXJlczogeyAuLi5nLmZpeHR1cmVzLCBsb2NhdG9yOiBzbG90LmdhbWUuZml4dHVyZXMubG9jYXRvciB9LFxuICAgICAgfTtcbiAgICB9XG4gICAgY2FzZSBcImNhbGxcIjoge1xuICAgICAgY29uc3QgeyBlbGV2YXRvciB9ID0gZy5maXh0dXJlcztcbiAgICAgIGlmIChlbGV2YXRvci50YXJnZXQgIT09IG51bGwgfHwgZWxldmF0b3IuZmxvb3IgPT09IGEuZmxvb3IpIHJldHVybiBnO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZyxcbiAgICAgICAgZml4dHVyZXM6IHsgLi4uZy5maXh0dXJlcywgZWxldmF0b3I6IHsgLi4uZWxldmF0b3IsIHRhcmdldDogYS5mbG9vciB9IH0sXG4gICAgICB9O1xuICAgIH1cbiAgICBjYXNlIFwiYXJyaXZlZFwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZyxcbiAgICAgICAgZml4dHVyZXM6IHsgLi4uZy5maXh0dXJlcywgZWxldmF0b3I6IHsgZmxvb3I6IGEuZmxvb3IsIHRhcmdldDogbnVsbCB9IH0sXG4gICAgICB9O1xuICAgIGNhc2UgXCJsb2NhdG9yXCI6XG4gICAgICByZXR1cm4geyAuLi5nLCBmaXh0dXJlczogeyAuLi5nLmZpeHR1cmVzLCBsb2NhdG9yOiBhLnRvIH0gfTtcbiAgfVxufVxuIiwgImltcG9ydCB7IHVzZVN5bmNFeHRlcm5hbFN0b3JlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyByZWR1Y2UgfSBmcm9tIFwiLi9yZWR1Y2VcIjtcbmltcG9ydCB7IGluaXRpYWxHYW1lLCB0eXBlIEFjdGlvbiwgdHlwZSBHYW1lIH0gZnJvbSBcIi4vc3RhdGVcIjtcblxuLyoqIFRoZSBvbmUgZ2FtZSBzdG9yZS4gS2VwdCBvbiBgZ2xvYmFsVGhpc2Agc28gYSBob3QgcmVsb2FkICh3aGljaCByZS1ydW5zXG4gKiAgdGhpcyBtb2R1bGUpIGtlZXBzIHRoZSBnYW1lLiAqL1xudHlwZSBTdG9yZSA9IHsgZ2FtZTogR2FtZTsgbGlzdGVuZXJzOiBTZXQ8KCkgPT4gdm9pZD4gfTtcbmNvbnN0IGcgPSBnbG9iYWxUaGlzIGFzIHsgX19jb2xkd2FrZT86IFN0b3JlIH07XG5jb25zdCBzdG9yZTogU3RvcmUgPSAoZy5fX2NvbGR3YWtlID8/PSB7XG4gIGdhbWU6IGluaXRpYWxHYW1lKCksXG4gIGxpc3RlbmVyczogbmV3IFNldCgpLFxufSk7XG5cbi8qKiBUaGUgZ2FtZSBub3cgKG91dHNpZGUgUmVhY3Q6IGV2ZW50IGhhbmRsZXJzLCB0aW1lcnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEdhbWUoKTogR2FtZSB7XG4gIHJldHVybiBzdG9yZS5nYW1lO1xufVxuXG4vKiogQXBwbHkgYGFjdGlvbmA7IHJldHVybnMgd2hldGhlciBpdCBjaGFuZ2VkIGFueXRoaW5nIChhIHJlZnVzZWQgYWN0aW9uIOKAlFxuICogIG5vIG1lZHBhY2ssIGFuIGVtcHR5IGNsaXAg4oCUIHJldHVybnMgYGZhbHNlYCkuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uOiBBY3Rpb24pOiBib29sZWFuIHtcbiAgY29uc3QgbmV4dCA9IHJlZHVjZShzdG9yZS5nYW1lLCBhY3Rpb24pO1xuICBpZiAobmV4dCA9PT0gc3RvcmUuZ2FtZSkgcmV0dXJuIGZhbHNlO1xuICBzdG9yZS5nYW1lID0gbmV4dDtcbiAgc3RvcmUubGlzdGVuZXJzLmZvckVhY2goKGwpID0+IGwoKSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXI6ICgpID0+IHZvaWQpIHtcbiAgc3RvcmUubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gIHJldHVybiAoKSA9PiBzdG9yZS5saXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVyKTtcbn1cblxuLyoqIFRoZSBnYW1lLCBvciBhIHNsaWNlIG9mIGl0IChyZS1yZW5kZXJzIG9ubHkgd2hlbiB0aGUgc2xpY2UgY2hhbmdlcyBieVxuICogIGlkZW50aXR5IOKAlCBzZWxlY3Qgb2JqZWN0cyB0aGUgcmVkdWNlciBrZWVwcyB3aGVuIHVudG91Y2hlZCkuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlR2FtZSgpOiBHYW1lO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUdhbWU8VD4oc2VsZWN0OiAoZzogR2FtZSkgPT4gVCk6IFQ7XG5leHBvcnQgZnVuY3Rpb24gdXNlR2FtZTxUPihzZWxlY3Q/OiAoZzogR2FtZSkgPT4gVCk6IFQgfCBHYW1lIHtcbiAgcmV0dXJuIHVzZVN5bmNFeHRlcm5hbFN0b3JlKHN1YnNjcmliZSwgKCkgPT5cbiAgICBzZWxlY3QgPyBzZWxlY3Qoc3RvcmUuZ2FtZSkgOiBzdG9yZS5nYW1lLFxuICApO1xufVxuIiwgImltcG9ydCB0eXBlIHsgU3VyZmFjZU5hbWUgfSBmcm9tIFwiLi4vaG9sb3Mvc3VyZmFjZXNcIjtcbmltcG9ydCB0eXBlIHsgQmVuY2hUYXJnZXQgfSBmcm9tIFwiLi9iZW5jaFwiO1xuaW1wb3J0IHsgaW5pdGlhbFBhY2ssIHR5cGUgSXRlbUlkLCB0eXBlIFBhY2ssIHR5cGUgV2VhcG9uSWQgfSBmcm9tIFwiLi9pdGVtc1wiO1xuXG4vKiogV2hlcmUgdGhlIGxvY2F0b3IgbGluZSBjYW4gbGVhZCAoUnVzdCdzIGBsYXlvdXQ6OmRlc3RpbmF0aW9uYCkuICovXG5leHBvcnQgdHlwZSBEZXN0aW5hdGlvbiA9IFwic3RvcmVcIiB8IFwiYmVuY2hcIiB8IFwic2F2ZVwiIHwgXCJlbGV2YXRvclwiIHwgXCJidWxraGVhZFwiO1xuZXhwb3J0IGNvbnN0IERFU1RJTkFUSU9OUzogRGVzdGluYXRpb25bXSA9IFtcbiAgXCJzdG9yZVwiLFxuICBcImJlbmNoXCIsXG4gIFwic2F2ZVwiLFxuICBcImVsZXZhdG9yXCIsXG4gIFwiYnVsa2hlYWRcIixcbl07XG5cbi8qKiBPbmUgc2F2ZSBhdCB0aGUgc2F2ZSBzdGF0aW9uOiB3aGVuLCBhbmQgYSBjb3B5IG9mIHRoZSBnYW1lIHRvIGxvYWQuICovXG5leHBvcnQgdHlwZSBTYXZlU2xvdCA9IHtcbiAgaWQ6IG51bWJlcjtcbiAgLyoqIFN0YXRpb24gdGltZSwgXCIwNDoxMjozM1wiLiAqL1xuICB0aW1lOiBzdHJpbmc7XG4gIG9iamVjdGl2ZTogbnVtYmVyO1xuICBnYW1lOiBHYW1lO1xufTtcblxuLyoqIFRoZSB3aG9sZSBmYWtlIGdhbWUuIFB1cmUgZGF0YTogYHJlZHVjZS50c2AgY2hhbmdlcyBpdCwgYGFjdC50c2AgdHVybnNcbiAqICBwbGF5ZXIgYWN0aW9ucyBpbnRvIGNoYW5nZXMgcGx1cyB0aGVpciBzb3VuZHMgYW5kIG1lc3NhZ2VzIHRvIEJldnkuICovXG5leHBvcnQgdHlwZSBHYW1lID0ge1xuICAvKiogV2hlcmUgaGUgc3RhbmRzIGFuZCB3aGF0IGhpcyBoYW5kcyBkbzogQmV2eSdzIHNpZGUgb2YgdGhlIGdhbWVcbiAgICogIChgaG9sby5hY3RpdmVgLCBgcGxheWVyLnN0YW5jZWApIGFuZCB0aGUgVGFiIGtleS4gQSBsb2FkZWQgc2F2ZVxuICAgKiAgZG9lc24ndCByZXdpbmQgaXQuICovXG4gIGhlcmU6IHtcbiAgICAvKiogVGhlIGZpeHR1cmVzJyBwYW5lbHMgaGUgc3RhbmRzIHdpdGhpbiByZWFjaCBvZi4gKi9cbiAgICBuZWFyOiBTdXJmYWNlTmFtZVtdO1xuICAgIGFpbWluZzogYm9vbGVhbjtcbiAgICAvKiogVGhlIGFwcCBoYXMgdGFrZW4gdGhlIG1vdXNlLiAqL1xuICAgIG1vdXNlOiBib29sZWFuO1xuICAgIC8qKiBUaGUgc2NyZWVuIHRoZSBjYW1lcmEgaXMgbG9ja2VkIG9uOiBhIHBhbmVsIGhlIHN0YW5kcyBhdCwgb3IgdGhlXG4gICAgICogIHN1aXQgbWVudS4gSXRzIGN1cnNvciBpcyB0aGUgcG9pbnRlci4gKi9cbiAgICBzY3JlZW46IFN1cmZhY2VOYW1lIHwgbnVsbDtcbiAgICAvKiogVGhlIHBhbmVsIEYgd291bGQgbG9jayB0aGUgY2FtZXJhIG9uIChoZSBzdGFuZHMgYmVmb3JlIGl0KS4gKi9cbiAgICBvZmZlcjogU3VyZmFjZU5hbWUgfCBudWxsO1xuICAgIC8qKiBUaGUgc3VpdCBtZW51IGlzIHVwLiAqL1xuICAgIG1lbnU6IGJvb2xlYW47XG4gICAgLyoqIFRoZSBmaXJzdCBzZWNvbmRzOiB0aGUgcHJvbXB0IG5hbWVzIHRoZSBiYXNpYyBrZXlzLiAqL1xuICAgIGludHJvOiBib29sZWFuO1xuICB9O1xuICBzdWl0OiB7XG4gICAgLyoqIFZpdGFscywgMC4uMSAodGhlIHNwaW5lJ3Mgc2VnbWVudHMpLiAqL1xuICAgIGhlYWx0aDogbnVtYmVyO1xuICAgIC8qKiBUaGUgc3Rhc2lzIG1vZHVsZSdzIGNoYXJnZSwgMC4uMSAob25lIHVzZSBjb3N0cyBhIHF1YXJ0ZXIpLiAqL1xuICAgIHN0YXNpczogbnVtYmVyO1xuICAgIC8qKiBObyBhaXIgaW4gdGhlIHJvb206IHRoZSBhaXIgaG9sb2dyYW0gY291bnRzIGRvd24uICovXG4gICAgdmFjdXVtOiBib29sZWFuO1xuICAgIC8qKiBTZWNvbmRzIG9mIGFpciBsZWZ0LiAqL1xuICAgIGFpcjogbnVtYmVyO1xuICB9O1xuICBhcm1zOiB7XG4gICAgd2VhcG9uOiBXZWFwb25JZDtcbiAgICBvd25lZDogV2VhcG9uSWRbXTtcbiAgICAvKiogUm91bmRzIGluIGVhY2ggd2VhcG9uJ3MgY2xpcC4gKi9cbiAgICBjbGlwOiBSZWNvcmQ8V2VhcG9uSWQsIG51bWJlcj47XG4gIH07XG4gIHBhY2s6IFBhY2s7XG4gIC8qKiBQb3dlcmVkIGNpcmN1aXQgbm9kZXMgcGVyIGJlbmNoIHRhcmdldC4gKi9cbiAgYmVuY2g6IFJlY29yZDxCZW5jaFRhcmdldCwgc3RyaW5nW10+O1xuICBzdG9yeToge1xuICAgIC8qKiBTb21ldGhpbmcgd2FzIGJvdWdodCAodGhlIGZpcnN0IG9iamVjdGl2ZSkuICovXG4gICAgYm91Z2h0OiBib29sZWFuO1xuICAgIHJlYWQ6IHN0cmluZ1tdO1xuICB9O1xuICBmaXh0dXJlczoge1xuICAgIGRvb3I6IFwibG9ja2VkXCIgfCBcInVubG9ja2VkXCIgfCBcIm9wZW5cIjtcbiAgICBlbGV2YXRvcjogeyBmbG9vcjogbnVtYmVyOyB0YXJnZXQ6IG51bWJlciB8IG51bGwgfTtcbiAgICBzYXZlczogU2F2ZVNsb3RbXTtcbiAgICBsb2NhdG9yOiBEZXN0aW5hdGlvbjtcbiAgfTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsR2FtZSgpOiBHYW1lIHtcbiAgcmV0dXJuIHtcbiAgICBoZXJlOiB7XG4gICAgICBuZWFyOiBbXSxcbiAgICAgIGFpbWluZzogZmFsc2UsXG4gICAgICBtb3VzZTogdHJ1ZSxcbiAgICAgIHNjcmVlbjogbnVsbCxcbiAgICAgIG9mZmVyOiBudWxsLFxuICAgICAgbWVudTogZmFsc2UsXG4gICAgICBpbnRybzogdHJ1ZSxcbiAgICB9LFxuICAgIHN1aXQ6IHsgaGVhbHRoOiAwLjcsIHN0YXNpczogMC43NSwgdmFjdXVtOiBmYWxzZSwgYWlyOiA2MCB9LFxuICAgIGFybXM6IHtcbiAgICAgIHdlYXBvbjogXCJjdXR0ZXJcIixcbiAgICAgIG93bmVkOiBbXCJjdXR0ZXJcIl0sXG4gICAgICBjbGlwOiB7IGN1dHRlcjogNywgcHVsc2U6IDI1LCByYWlsOiA0IH0sXG4gICAgfSxcbiAgICBwYWNrOiBpbml0aWFsUGFjaygpLFxuICAgIGJlbmNoOiB7IGN1dHRlcjogW10sIHB1bHNlOiBbXSwgcmFpbDogW10sIHJpZzogW10gfSxcbiAgICBzdG9yeTogeyBib3VnaHQ6IGZhbHNlLCByZWFkOiBbXSB9LFxuICAgIGZpeHR1cmVzOiB7XG4gICAgICBkb29yOiBcImxvY2tlZFwiLFxuICAgICAgZWxldmF0b3I6IHsgZmxvb3I6IDIsIHRhcmdldDogbnVsbCB9LFxuICAgICAgc2F2ZXM6IFtdLFxuICAgICAgbG9jYXRvcjogXCJzdG9yZVwiLFxuICAgIH0sXG4gIH07XG59XG5cbi8qKiBFdmVyeSBjaGFuZ2UgdGhlIGdhbWUga25vd3MuICovXG5leHBvcnQgdHlwZSBBY3Rpb24gPVxuICAvLyBXaGVyZSBoZSBpcyAoQmV2eSdzIHJlcG9ydHMpIGFuZCB0aGUgc3VpdCBtZW51LlxuICB8IHsgdHlwZTogXCJuZWFyXCI7IHN1cmZhY2U6IFN1cmZhY2VOYW1lOyBvbjogYm9vbGVhbiB9XG4gIHwge1xuICAgICAgdHlwZTogXCJzdGFuY2VcIjtcbiAgICAgIGFpbWluZzogYm9vbGVhbjtcbiAgICAgIG1vdXNlOiBib29sZWFuO1xuICAgICAgc2NyZWVuOiBTdXJmYWNlTmFtZSB8IG51bGw7XG4gICAgICBvZmZlcjogU3VyZmFjZU5hbWUgfCBudWxsO1xuICAgIH1cbiAgfCB7IHR5cGU6IFwibWVudVwiOyBvcGVuOiBib29sZWFuIH1cbiAgfCB7IHR5cGU6IFwiaW50cm9PdmVyXCIgfVxuICAvLyBUaGUgc3VpdC5cbiAgfCB7IHR5cGU6IFwiaGl0XCIgfVxuICB8IHsgdHlwZTogXCJoZWFsXCI7IGl0ZW06IEl0ZW1JZCB9XG4gIHwgeyB0eXBlOiBcInN0YXNpc1wiIH1cbiAgfCB7IHR5cGU6IFwic3Rhc2lzUmVmaWxsXCIgfVxuICB8IHsgdHlwZTogXCJ2YWN1dW1cIjsgb246IGJvb2xlYW4gfVxuICB8IHsgdHlwZTogXCJhaXJcIjsgZHQ6IG51bWJlciB9XG4gIHwgeyB0eXBlOiBcImFpclJlZmlsbFwiIH1cbiAgLy8gVGhlIHdlYXBvbnMuXG4gIHwgeyB0eXBlOiBcImZpcmVcIiB9XG4gIHwgeyB0eXBlOiBcInJlbG9hZFwiIH1cbiAgfCB7IHR5cGU6IFwiZXF1aXBcIjsgd2VhcG9uOiBXZWFwb25JZCB9XG4gIC8vIFRoZSBzdG9yZSBhbmQgdGhlIHNhZmUuXG4gIHwgeyB0eXBlOiBcImJ1eVwiOyBpdGVtOiBJdGVtSWQgfVxuICB8IHsgdHlwZTogXCJzZWxsXCI7IHNsb3Q6IG51bWJlciB9XG4gIHwgeyB0eXBlOiBcInN0b3dcIjsgc2xvdDogbnVtYmVyIH1cbiAgfCB7IHR5cGU6IFwicmV0cmlldmVcIjsgaW5kZXg6IG51bWJlciB9XG4gIC8vIFRoZSBiZW5jaC5cbiAgfCB7IHR5cGU6IFwiaW5zdGFsbFwiOyB0YXJnZXQ6IEJlbmNoVGFyZ2V0OyBub2RlOiBzdHJpbmcgfVxuICAvLyBUaGUgc3RvcnkuXG4gIHwgeyB0eXBlOiBcInJlYWRcIjsgbG9nOiBzdHJpbmcgfVxuICAvLyBUaGUgZml4dHVyZXMuXG4gIHwgeyB0eXBlOiBcInVubG9ja1wiIH1cbiAgfCB7IHR5cGU6IFwib3BlbmVkXCIgfVxuICB8IHsgdHlwZTogXCJzYXZlXCI7IHRpbWU6IHN0cmluZyB9XG4gIHwgeyB0eXBlOiBcImxvYWRcIjsgaWQ6IG51bWJlciB9XG4gIHwgeyB0eXBlOiBcImNhbGxcIjsgZmxvb3I6IG51bWJlciB9XG4gIHwgeyB0eXBlOiBcImFycml2ZWRcIjsgZmxvb3I6IG51bWJlciB9XG4gIHwgeyB0eXBlOiBcImxvY2F0b3JcIjsgdG86IERlc3RpbmF0aW9uIH07XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IG9uLCB0eXBlIEtleWJvYXJkRXZlbnREYXRhLCB0eXBlIFJlYWN0RXZlbnRzIH0gZnJvbSBcIi4vYmV2eVwiO1xuXG4vKiogTGlzdGVuIHRvIGEgQmV2eSBldmVudCB3aGlsZSBtb3VudGVkOyBgcnVuYCBhbHdheXMgc2VlcyB0aGUgbGF0ZXN0XG4gKiAgcmVuZGVyJ3Mgc3RhdGUuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRXZlbnQ8SyBleHRlbmRzIGtleW9mIFJlYWN0RXZlbnRzPihcbiAgbmFtZTogSyxcbiAgcnVuOiAodmFsdWU6IFJlYWN0RXZlbnRzW0tdKSA9PiB2b2lkLFxuKSB7XG4gIGNvbnN0IGxhdGVzdCA9IHVzZVJlZihydW4pO1xuICBsYXRlc3QuY3VycmVudCA9IHJ1bjtcbiAgdXNlRWZmZWN0KCgpID0+IG9uKG5hbWUsICh2YWx1ZSkgPT4gbGF0ZXN0LmN1cnJlbnQodmFsdWUpKSwgW25hbWVdKTtcbn1cblxuLyoqIEtleSBwcmVzc2VzIChubyBhdXRvLXJlcGVhdCkgd2hpbGUgbW91bnRlZCBhbmQgYGFjdGl2ZWAuIGBydW5gIGdldHMgdGhlXG4gKiAgZXZlbnQ7IG1hdGNoIG9uIGBlLmNvZGVgIChsYXlvdXQtaW5kZXBlbmRlbnQpIG9yIGBlLmtleWAuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlS2V5cyhhY3RpdmU6IGJvb2xlYW4sIHJ1bjogKGU6IEtleWJvYXJkRXZlbnREYXRhKSA9PiB2b2lkKSB7XG4gIHVzZUV2ZW50KFwia2V5RG93blwiLCAoZSkgPT4ge1xuICAgIGlmIChhY3RpdmUgJiYgIWUucmVwZWF0KSBydW4oZSk7XG4gIH0pO1xufVxuXG4vKiogQSBzY3JpcHRlZCBzdGVwIGZyb20gYC0tc2hvb3Qg4oCmIC0tZG8gXCI8c2Vjcz4gPHZlcmI+IFthcmddXCJgICh0aGVcbiAqICBgZGVidWcuYWN0YCBldmVudCk6IHJ1bnMgYHJ1bihhcmcpYCBmb3IgdGhpcyBjb21wb25lbnQncyBgdmVyYmAuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVidWcodmVyYjogc3RyaW5nLCBydW46IChhcmc6IHN0cmluZykgPT4gdm9pZCkge1xuICB1c2VFdmVudChcImRlYnVnLmFjdFwiLCAoeyBhY3Rpb24gfSkgPT4ge1xuICAgIGNvbnN0IFtoZWFkLCAuLi5yZXN0XSA9IGFjdGlvbi5zcGxpdChcIiBcIik7XG4gICAgaWYgKGhlYWQgPT09IHZlcmIpIHJ1bihyZXN0LmpvaW4oXCIgXCIpKTtcbiAgfSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuXG4vKiogVGhlIHN1aXQncyBpbnRlcmZhY2U6IGN5YW4gbGlnaHQgb24gYmx1ZS1ibGFjayBnbGFzcywgd2hpdGUgZm9yIHdoYXQgaXNcbiAqICBzZWxlY3RlZCwgYW1iZXIgZm9yIHByaWNlcywgcmVkIGZvciBkYW1hZ2UgYW5kIGxvY2tzLCBncmVlbiBmb3Igd2hhdCBpc1xuICogIG9wZW4uIEhvbG9ncmFtcyBhcmUgZHJhd24gYXMgbGlnaHQgKGBob2xvZ3JhbS53ZXNsYCByYWlzZXMgdGhlbSBwYXN0IDEuMFxuICogIHNvIHRoZXkgYmxvb20pOiBrZWVwIGZpbGxzIGRhcmsgYW5kIHRyYW5zbHVjZW50LCBsaW5lcyBhbmQgdHlwZSBicmlnaHQuICovXG5leHBvcnQgY29uc3QgQyA9IHtcbiAgY3lhbjogXCIjN2ZlM2ZmXCIsXG4gIGN5YW5IaTogXCIjYzRmNmZmXCIsXG4gIGN5YW5EaW06IFwiIzNmOTNhZFwiLFxuICBjeWFuRGVlcDogXCIjMTIzYTRhXCIsXG4gIGN5YW5GYWludDogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMTQpXCIsXG4gIGN5YW5MaW5lOiBcInJnYmEoMTI3LCAyMjcsIDI1NSwgMC40NSlcIixcbiAgd2hpdGU6IFwiI2YwZmRmZlwiLFxuICBhbWJlcjogXCIjZmZiMzQ3XCIsXG4gIGFtYmVyRGltOiBcIiNhODY2MWNcIixcbiAgcmVkOiBcIiNmZjRhM2RcIixcbiAgcmVkRGltOiBcIiNhMzI2MWRcIixcbiAgcmVkRmFpbnQ6IFwicmdiYSgyNTUsIDc0LCA2MSwgMC4xOClcIixcbiAgZ3JlZW46IFwiIzZkZmY5YVwiLFxuICBncmVlbkRpbTogXCIjMmY5YTU1XCIsXG4gIC8vIEZpbGxzIChkYXJrIGdsYXNzOiB0aGV5IGRpbSB0aGUgcm9vbSBiZWhpbmQgYSBob2xvZ3JhbSkuXG4gIGdsYXNzOiBcInJnYmEoNCwgMTgsIDI4LCAwLjYyKVwiLFxuICBnbGFzc0hpOiBcInJnYmEoMTAsIDQ0LCA2MiwgMC43MilcIixcbiAgc2hhZGU6IFwicmdiYSgxLCA2LCAxMCwgMC44KVwiLFxuICBjbGVhcjogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG59O1xuXG4vKiogU2FpcmEgU2VtaSBDb25kZW5zZWQgTWVkaXVtIGlzIHRoZSBkZWZhdWx0IGZvbnQ7IGl0cyBvdGhlciB3ZWlnaHRzIGFyZVxuICogIGZhbWlsaWVzIG9mIHRoZWlyIG93biAoc3RhdGljIGZpbGVzKS4gTWljaHJvbWEgaXMgdGhlIGRpc3BsYXkgZmFjZS4gKi9cbmV4cG9ydCBjb25zdCBGID0ge1xuICByZWd1bGFyOiBcIlNhaXJhXCIsXG4gIHNlbWlib2xkOiBcIlNhaXJhIFNlbWlCb2xkXCIsXG4gIGJvbGQ6IFwiU2FpcmEgQm9sZFwiLFxuICBkaXNwbGF5OiBcIk1pY2hyb21hXCIsXG59O1xuXG4vKiogVGV4dCBzdHlsZXMuICovXG5leHBvcnQgY29uc3QgVCA9IHtcbiAgLyoqIEhvbG9ncmFtIGhlYWRlcnM6IHdpZGUsIHNwYWNlZCBjYXBpdGFscy4gKi9cbiAgaGVhZGVyOiB7XG4gICAgZm9udEZhbWlseTogRi5kaXNwbGF5LFxuICAgIGZvbnRTaXplOiAyMixcbiAgICBjb2xvcjogQy5jeWFuLFxuICAgIGxldHRlclNwYWNpbmc6IDIsXG4gICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICB9IGFzIEJldnlTdHlsZSxcbiAgLyoqIFRhYnMsIGJ1dHRvbnMsIGxpc3Qgcm93cy4gKi9cbiAgbGFiZWw6IHtcbiAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgIGZvbnRTaXplOiAyMCxcbiAgICBjb2xvcjogQy5jeWFuLFxuICAgIGxldHRlclNwYWNpbmc6IDEsXG4gICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICB9IGFzIEJldnlTdHlsZSxcbiAgLyoqIEJvZHkgY29weS4gKi9cbiAgYm9keToge1xuICAgIGZvbnRGYW1pbHk6IEYucmVndWxhcixcbiAgICBmb250U2l6ZTogMTgsXG4gICAgY29sb3I6IEMuY3lhbixcbiAgICBsaW5lSGVpZ2h0OiAxLjM1LFxuICB9IGFzIEJldnlTdHlsZSxcbiAgLyoqIFNtYWxsIHByaW50OiBoaW50cywgY2FwdGlvbnMsIHN0YXQgbmFtZXMuICovXG4gIHNtYWxsOiB7XG4gICAgZm9udEZhbWlseTogRi5yZWd1bGFyLFxuICAgIGZvbnRTaXplOiAxNCxcbiAgICBjb2xvcjogQy5jeWFuRGltLFxuICAgIGxldHRlclNwYWNpbmc6IDEsXG4gIH0gYXMgQmV2eVN0eWxlLFxuICAvKiogQmlnIG51bWJlcnMgKGFtbW8sIGNyZWRpdHMsIHRpbWVycykuICovXG4gIG51bWJlcjoge1xuICAgIGZvbnRGYW1pbHk6IEYuZGlzcGxheSxcbiAgICBmb250U2l6ZTogNDAsXG4gICAgY29sb3I6IEMuY3lhbixcbiAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gIH0gYXMgQmV2eVN0eWxlLFxufTtcblxuLyoqIFRoZSB0aGluIGJyaWdodCBmcmFtZSBldmVyeSBob2xvZ3JhbSBwYW5lbCB3ZWFycy4gKi9cbmV4cG9ydCBjb25zdCBmcmFtZTogQmV2eVN0eWxlID0ge1xuICBib3JkZXI6IDEsXG4gIGJvcmRlckNvbG9yOiBDLmN5YW5MaW5lLFxuICBiYWNrZ3JvdW5kQ29sb3I6IEMuZ2xhc3MsXG59O1xuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUsIHR5cGUgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICB1c2VTaGFyZWRWYWx1ZSxcbiAgd2l0aFNlcXVlbmNlLFxuICB3aXRoVGltaW5nLFxuICB0eXBlIEJldnlTdHlsZSxcbn0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7IG9uR2xpdGNoIH0gZnJvbSBcIi4uL2dhbWUvYWN0XCI7XG5pbXBvcnQgeyB1c2VHYW1lIH0gZnJvbSBcIi4uL2dhbWUvc3RvcmVcIjtcbmltcG9ydCB7IGlzTGl2ZSwgb3BlbkhvbG9zIH0gZnJvbSBcIi4vb3BlblwiO1xuaW1wb3J0IHR5cGUgeyBTdXJmYWNlTmFtZSB9IGZyb20gXCIuL3N1cmZhY2VzXCI7XG5cbi8qKiBBIGZvbGRlZCBob2xvZ3JhbSBrZWVwcyBpdHMgY29udGVudCB0aGlzIGxvbmcgKGl0cyBmb2xkLWF3YXkgcnVuc1xuICogIDAuMyBzIGluIGBob2xvL21vZC5yc2ApLCB0aGVuIGRyb3BzIGl0OiBub3RoaW5nIHJlbmRlcnMgYmVoaW5kIGEgY2xvc2VkXG4gKiAgaG9sb2dyYW0g4oCUIG5vIGxheW91dCwgbm8gcG9ydGFsIGNhbWVyYS4gKi9cbmNvbnN0IExJTkdFUl9NUyA9IDQwMDtcblxuLyoqIFdoZXRoZXIgaG9sb2dyYW0gYG5hbWVgIGlzIGxpdmUgKHNlZSBgaXNMaXZlYCk6IHdoYXQgY29zdHMgZnJhbWVzIG9ubHlcbiAqICB3aGlsZSBzb21lb25lIGlzIG5lYXIg4oCUIGEgdHVybnRhYmxlJ3MgY2FtZXJhLCBhIHB1bHNlIOKAlCBhc2tzIHRoaXMuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlTGl2ZShuYW1lOiBTdXJmYWNlTmFtZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdXNlR2FtZSgoZykgPT4gaXNMaXZlKGcsIG5hbWUpKTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIGNhbWVyYSBpcyBsb2NrZWQgb24gaG9sb2dyYW0gYG5hbWVgOiBoZSBpcyB1c2luZyBpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VIZWxkKG5hbWU6IFN1cmZhY2VOYW1lKTogYm9vbGVhbiB7XG4gIHJldHVybiB1c2VHYW1lKChnKSA9PiBnLmhlcmUuc2NyZWVuID09PSBuYW1lKTtcbn1cblxuLyoqIE9uZSBob2xvZ3JhbTogYSBgPHN1cmZhY2U+YCB3aG9zZSBjb250ZW50IHdlYXJzIHRoZSBwcm9qZWN0b3IncyBub2lzZSxcbiAqICBnbGl0Y2hlcyB3aGVuIGBnbGl0Y2gobmFtZSlgIGZpcmVzIChhIGhpdCwgYSByZWZ1c2VkIGFjdGlvbikgYW5kLCBnaXZlblxuICogIGEgYHBhZ2VgLCBzd2VlcHMgYSBzY2FuIGxpbmUgYWNyb3NzIGV2ZXJ5IHBhZ2UgY2hhbmdlLiBFdmVyeXRoaW5nIGluc2lkZVxuICogIGNvbXBvc2l0ZXMgb24gdGhlIHN1cmZhY2UncyBvd24gY2FtZXJhLlxuICpcbiAqICBBIHBhbmVsIG5vYm9keSBzdGFuZHMgbmVhciBpcyBkZWFkOiBCZXZ5IGRyYXdzIGl0IGdyZXlcbiAqICAoYGhvbG9ncmFtLndlc2xgKS4gTm90aGluZyBwb2ludHMgYXQgaXQgZWl0aGVyOiB0aGUgb25seSBwb2ludGVyIGlzIHRoZVxuICogIGN1cnNvciBvZiB0aGUgc2NyZWVuIHRoYXQgaG9sZHMgdGhlIGNhbWVyYS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIb2xvKHtcbiAgbmFtZSxcbiAgcGFnZSxcbiAgc2VlZCA9IDAsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbn06IHtcbiAgbmFtZTogU3VyZmFjZU5hbWU7XG4gIC8qKiBDaGFuZ2luZyBpdCBydW5zIHRoZSBgc2NhblN3YXBgIG1vcnBoICh0YWJzLCBwYWdlcykuICovXG4gIHBhZ2U/OiBzdHJpbmcgfCBudW1iZXI7XG4gIHNlZWQ/OiBudW1iZXI7XG4gIHN0eWxlPzogQmV2eVN0eWxlO1xuICBjaGlsZHJlbjogUmVhY3ROb2RlO1xufSkge1xuICBjb25zdCBvcGVuID0gdXNlR2FtZSgoZykgPT4gb3BlbkhvbG9zKGcpLmluY2x1ZGVzKG5hbWUpKTtcbiAgY29uc3QgW21vdW50ZWQsIHNldE1vdW50ZWRdID0gdXNlU3RhdGUob3Blbik7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG9wZW4pIHJldHVybiBzZXRNb3VudGVkKHRydWUpO1xuICAgIGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHNldE1vdW50ZWQoZmFsc2UpLCBMSU5HRVJfTVMpO1xuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQodCk7XG4gIH0sIFtvcGVuXSk7XG4gIGNvbnN0IGJ1cnN0ID0gdXNlU2hhcmVkVmFsdWUoMCk7XG4gIHVzZUVmZmVjdChcbiAgICAoKSA9PlxuICAgICAgb25HbGl0Y2goKHN1cmZhY2UpID0+IHtcbiAgICAgICAgaWYgKHN1cmZhY2UgIT09IG5hbWUpIHJldHVybjtcbiAgICAgICAgYnVyc3QudmFsdWUgPSB3aXRoU2VxdWVuY2UoXG4gICAgICAgICAgd2l0aFRpbWluZygxLCB7IGR1cmF0aW9uOiAwIH0pLFxuICAgICAgICAgIHdpdGhUaW1pbmcoMCwgeyBkdXJhdGlvbjogNDgwLCBlYXNpbmc6IFwiZWFzZU91dFwiIH0pLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgW25hbWUsIGJ1cnN0XSxcbiAgKTtcbiAgcmV0dXJuIChcbiAgICA8c3VyZmFjZSB0YXJnZXQ9e25hbWV9PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgICAuLi5zdHlsZSxcbiAgICAgICAgICBmaWx0ZXI6IFtcbiAgICAgICAgICAgIHsgbmFtZTogXCJob2xvTm9pc2VcIiwgcGFyYW1zOiB7IHNlZWQgfSB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiBcImdsaXRjaFwiLFxuICAgICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBpbnRlbnNpdHk6IHsgYW5pbWF0ZWQ6IGJ1cnN0LCBzZWVkOiAxIH0sXG4gICAgICAgICAgICAgICAgc2VlZDogc2VlZCArIDEsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgICAgLi4uKHBhZ2UgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyB7fVxuICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgbW9ycGhGaWx0ZXI6IHsga2V5OiBwYWdlLCBuYW1lOiBcInNjYW5Td2FwXCIgfSxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICBtb3JwaEZpbHRlcjogeyBkdXJhdGlvbjogMzgwLCBlYXNpbmc6IFwiZWFzZUluT3V0XCIgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge21vdW50ZWQgJiYgY2hpbGRyZW59XG4gICAgICA8L25vZGU+XG4gICAgPC9zdXJmYWNlPlxuICApO1xufVxuIiwgImltcG9ydCB7IGJldnkgfSBmcm9tIFwiLi9iZXZ5XCI7XG5cbi8qKiBUaGUgY3VlcyBCZXZ5IHN5bnRoZXNpemVzIChgc291bmQvYCkuICovXG5leHBvcnQgdHlwZSBDdWUgPVxuICAvLyBIb2xvZ3JhbXMgYW5kIHRoZWlyIFVJLlxuICB8IFwiaG9sb09wZW5cIlxuICB8IFwiaG9sb0Nsb3NlXCJcbiAgfCBcInRpY2tcIlxuICB8IFwic2VsZWN0XCJcbiAgfCBcImRlbnlcIlxuICB8IFwidGFiXCJcbiAgfCBcImJ1eVwiXG4gIHwgXCJpbnN0YWxsXCJcbiAgLy8gVGhlIHN1aXQuXG4gIHwgXCJoaXRcIlxuICB8IFwiaGVhbFwiXG4gIHwgXCJzdGFzaXNcIlxuICB8IFwibG93QWlyXCJcbiAgLy8gVGhlIHdlYXBvbnMuXG4gIHwgXCJmaXJlXCJcbiAgfCBcImRyeUZpcmVcIlxuICB8IFwicmVsb2FkXCJcbiAgfCBcImVxdWlwXCJcbiAgLy8gVGhlIGZpeHR1cmVzLlxuICB8IFwidW5sb2NrXCJcbiAgfCBcImhhY2tUaWNrXCJcbiAgfCBcImhhY2tMb2NrXCJcbiAgfCBcInNob2NrXCJcbiAgfCBcInNhdmVcIlxuICB8IFwibG9jYXRvclwiXG4gIHwgXCJsb2dcIjtcblxuLyoqIFBsYXkgYSBjdWUuICovXG5leHBvcnQgZnVuY3Rpb24gY3VlKG5hbWU6IEN1ZSkge1xuICBiZXZ5LnNvdW5kLmN1ZSh7IG5hbWUgfSk7XG59XG4iLCAiaW1wb3J0IHsgYmV2eSB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgdHlwZSB7IFN1cmZhY2VOYW1lIH0gZnJvbSBcIi4uL2hvbG9zL3N1cmZhY2VzXCI7XG5pbXBvcnQgeyBjdWUgfSBmcm9tIFwiLi4vc291bmRcIjtcbmltcG9ydCB7IElURU1TLCBXRUFQT05TLCB0eXBlIEl0ZW1JZCwgdHlwZSBXZWFwb25JZCB9IGZyb20gXCIuL2l0ZW1zXCI7XG5pbXBvcnQgdHlwZSB7IEJlbmNoVGFyZ2V0IH0gZnJvbSBcIi4vYmVuY2hcIjtcbmltcG9ydCB7IERFU1RJTkFUSU9OUywgdHlwZSBEZXN0aW5hdGlvbiB9IGZyb20gXCIuL3N0YXRlXCI7XG5pbXBvcnQgeyBPQkpFQ1RJVkVTIH0gZnJvbSBcIi4vbG9yZVwiO1xuaW1wb3J0IHsgSEVBTFMsIG9iamVjdGl2ZSB9IGZyb20gXCIuL3JlZHVjZVwiO1xuaW1wb3J0IHsgZGlzcGF0Y2gsIGdldEdhbWUgfSBmcm9tIFwiLi9zdG9yZVwiO1xuXG4vKiogVGhlIHBsYXllcidzIHZlcmJzOiBlYWNoIGNoYW5nZXMgdGhlIGdhbWUgYW5kIHBsYXlzIGl0cyBwYXJ0IGluIHRoZVxuICogIHdvcmxkIChhIHNvdW5kLCBhIG1lc3NhZ2UgdG8gQmV2eSkgb3IsIHJlZnVzZWQsIGdsaXRjaGVzIHRoZSBob2xvZ3JhbVxuICogIHRoYXQgcmVmdXNlZCBpdC4gS2V5cywgY2xpY2tzIGFuZCBgLS1zaG9vdGAgdmVyYnMgYWxsIGNvbWUgdGhyb3VnaFxuICogIGhlcmUuICovXG5cbmNvbnN0IGdsaXRjaGVycyA9IG5ldyBTZXQ8KHN1cmZhY2U6IFN1cmZhY2VOYW1lKSA9PiB2b2lkPigpO1xuXG4vKiogR2xpdGNoIGhvbG9ncmFtIGBzdXJmYWNlYCBmb3IgYSBtb21lbnQgKGBIb2xvYCBsaXN0ZW5zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnbGl0Y2goc3VyZmFjZTogU3VyZmFjZU5hbWUpIHtcbiAgZ2xpdGNoZXJzLmZvckVhY2goKHJ1bikgPT4gcnVuKHN1cmZhY2UpKTtcbn1cblxuLyoqIFN1YnNjcmliZSB0byBnbGl0Y2hlcyAoc2VlIGBIb2xvYCk7IHJldHVybnMgdGhlIHVuc3Vic2NyaWJlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uR2xpdGNoKHJ1bjogKHN1cmZhY2U6IFN1cmZhY2VOYW1lKSA9PiB2b2lkKSB7XG4gIGdsaXRjaGVycy5hZGQocnVuKTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBnbGl0Y2hlcnMuZGVsZXRlKHJ1bik7XG4gIH07XG59XG5cbi8qKiBBIHJlZnVzZWQgYWN0aW9uOiB0aGUgYnV6eiBhbmQgdGhlIGdsaXRjaC4gKi9cbmZ1bmN0aW9uIGRlbnkoc3VyZmFjZTogU3VyZmFjZU5hbWUpIHtcbiAgY3VlKFwiZGVueVwiKTtcbiAgZ2xpdGNoKHN1cmZhY2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGl0KCkge1xuICBkaXNwYXRjaCh7IHR5cGU6IFwiaGl0XCIgfSk7XG4gIGN1ZShcImhpdFwiKTtcbiAgYmV2eS5zdWl0LmhpdChudWxsKTtcbiAgZ2xpdGNoKFwic3BpbmVcIik7XG4gIGdsaXRjaChcInN0YXNpc1wiKTtcbn1cblxuLyoqIFVzZSB0aGUgbGFyZ2VzdCBtZWRwYWNrIHRoYXQgaXNuJ3Qgd2FzdGVkIChlbHNlIHRoZSBzbWFsbGVzdCB0aGVyZSkuICovXG5leHBvcnQgZnVuY3Rpb24gaGVhbCgpIHtcbiAgY29uc3QgeyBwYWNrLCBzdWl0IH0gPSBnZXRHYW1lKCk7XG4gIGNvbnN0IG1pc3NpbmcgPSAxIC0gc3VpdC5oZWFsdGg7XG4gIGNvbnN0IGhhdmUgPSAoW1wibWVkcGFjay1zXCIsIFwibWVkcGFjay1tXCIsIFwibWVkcGFjay1sXCJdIGFzIEl0ZW1JZFtdKS5maWx0ZXIoXG4gICAgKGlkKSA9PiBwYWNrLnNsb3RzLnNvbWUoKHMpID0+IHM/Lml0ZW0gPT09IGlkKSxcbiAgKTtcbiAgY29uc3QgZml0ID0gWy4uLmhhdmVdXG4gICAgLnJldmVyc2UoKVxuICAgIC5maW5kKChpZCkgPT4gKEhFQUxTW2lkXSA/PyAxKSA8PSBtaXNzaW5nICsgMC4wMSk7XG4gIGNvbnN0IGl0ZW0gPSBmaXQgPz8gaGF2ZVswXTtcbiAgaWYgKGl0ZW0gJiYgZGlzcGF0Y2goeyB0eXBlOiBcImhlYWxcIiwgaXRlbSB9KSkge1xuICAgIGN1ZShcImhlYWxcIik7XG4gICAgYmV2eS5zdWl0LmhlYWwobnVsbCk7XG4gIH0gZWxzZSB7XG4gICAgZGVueShcInNwaW5lXCIpO1xuICB9XG59XG5cbi8qKiBVc2UgYW4gaW52ZW50b3J5IHNsb3QncyBpdGVtICh0aGUgc3VpdCBtZW51J3MgVVNFKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2Uoc2xvdDogbnVtYmVyKSB7XG4gIGNvbnN0IGl0ZW0gPSBnZXRHYW1lKCkucGFjay5zbG90c1tzbG90XT8uaXRlbTtcbiAgaWYgKCFpdGVtKSByZXR1cm47XG4gIGNvbnN0IGtpbmQgPSBJVEVNU1tpdGVtXS5raW5kO1xuICBpZiAoa2luZCA9PT0gXCJoZWFsdGhcIikge1xuICAgIGlmIChkaXNwYXRjaCh7IHR5cGU6IFwiaGVhbFwiLCBpdGVtIH0pKSB7XG4gICAgICBjdWUoXCJoZWFsXCIpO1xuICAgICAgYmV2eS5zdWl0LmhlYWwobnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2UgaWYgKGtpbmQgPT09IFwic3Rhc2lzXCIpIHtcbiAgICBpZiAoZGlzcGF0Y2goeyB0eXBlOiBcInN0YXNpc1JlZmlsbFwiIH0pKSByZXR1cm4gY3VlKFwic3Rhc2lzXCIpO1xuICB9IGVsc2UgaWYgKGtpbmQgPT09IFwiYWlyXCIpIHtcbiAgICBpZiAoZGlzcGF0Y2goeyB0eXBlOiBcImFpclJlZmlsbFwiIH0pKSByZXR1cm4gY3VlKFwic2VsZWN0XCIpO1xuICB9IGVsc2UgaWYgKGtpbmQgPT09IFwiYW1tb1wiKSB7XG4gICAgY29uc3Qgd2VhcG9uID0gV0VBUE9OUy5maW5kKCh3KSA9PiBpdGVtID09PSBgJHt3fS1hbW1vYCk7XG4gICAgaWYgKHdlYXBvbiA9PT0gZ2V0R2FtZSgpLmFybXMud2VhcG9uKSByZXR1cm4gcmVsb2FkKCk7XG4gIH1cbiAgZGVueShcIm1lbnVcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFzaXMoKSB7XG4gIGlmIChkaXNwYXRjaCh7IHR5cGU6IFwic3Rhc2lzXCIgfSkpIHtcbiAgICBjdWUoXCJzdGFzaXNcIik7XG4gICAgYmV2eS5zdWl0LnN0YXNpcyhudWxsKTtcbiAgfSBlbHNlIHtcbiAgICBkZW55KFwic3Rhc2lzXCIpO1xuICB9XG59XG5cbi8qKiBWZW50IHRoZSByb29tIChvciBsZXQgdGhlIGFpciBiYWNrKS4gQmV2eSBmb2xsb3dzIHRoZSBnYW1lJ3MgdmFjdXVtXG4gKiAgKGBBcHAudHN4YCksIHNvIGEgbG9hZGVkIHNhdmUgc2V0cyBpdCB0b28uICovXG5leHBvcnQgZnVuY3Rpb24gdmFjdXVtKG9uID0gIWdldEdhbWUoKS5zdWl0LnZhY3V1bSkge1xuICBkaXNwYXRjaCh7IHR5cGU6IFwidmFjdXVtXCIsIG9uIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlyZSgpIHtcbiAgaWYgKGRpc3BhdGNoKHsgdHlwZTogXCJmaXJlXCIgfSkpIHtcbiAgICBjdWUoXCJmaXJlXCIpO1xuICAgIGJldnkud2VhcG9uLmZpcmUobnVsbCk7XG4gIH0gZWxzZSB7XG4gICAgY3VlKFwiZHJ5RmlyZVwiKTtcbiAgICBnbGl0Y2goXCJhbW1vXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWxvYWQoKSB7XG4gIGlmIChkaXNwYXRjaCh7IHR5cGU6IFwicmVsb2FkXCIgfSkpIHtcbiAgICBjdWUoXCJyZWxvYWRcIik7XG4gICAgYmV2eS53ZWFwb24ucmVsb2FkKG51bGwpO1xuICB9IGVsc2Uge1xuICAgIGRlbnkoXCJhbW1vXCIpO1xuICB9XG59XG5cbi8qKiBEcmF3IGB3ZWFwb25gIChCZXZ5IGZvbGxvd3MgdGhlIGdhbWUncyB3ZWFwb24sIGBBcHAudHN4YCkuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1aXAod2VhcG9uOiBXZWFwb25JZCkge1xuICBpZiAoZGlzcGF0Y2goeyB0eXBlOiBcImVxdWlwXCIsIHdlYXBvbiB9KSkgY3VlKFwiZXF1aXBcIik7XG59XG5cbi8qKiBUaGUgbmV4dCB3ZWFwb24gaGUgb3ducy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzd2FwKCkge1xuICBjb25zdCB7IG93bmVkLCB3ZWFwb24gfSA9IGdldEdhbWUoKS5hcm1zO1xuICBjb25zdCBvcmRlciA9IFdFQVBPTlMuZmlsdGVyKCh3KSA9PiBvd25lZC5pbmNsdWRlcyh3KSk7XG4gIGVxdWlwKG9yZGVyWyhvcmRlci5pbmRleE9mKHdlYXBvbikgKyAxKSAlIG9yZGVyLmxlbmd0aF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnV5KGl0ZW06IEl0ZW1JZCkge1xuICBpZiAoZGlzcGF0Y2goeyB0eXBlOiBcImJ1eVwiLCBpdGVtIH0pKSBjdWUoXCJidXlcIik7XG4gIGVsc2UgZGVueShcInN0b3JlXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsbChzbG90OiBudW1iZXIpIHtcbiAgaWYgKGRpc3BhdGNoKHsgdHlwZTogXCJzZWxsXCIsIHNsb3QgfSkpIGN1ZShcImJ1eVwiKTtcbiAgZWxzZSBkZW55KFwic3RvcmVcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG93KHNsb3Q6IG51bWJlcikge1xuICBpZiAoZGlzcGF0Y2goeyB0eXBlOiBcInN0b3dcIiwgc2xvdCB9KSkgY3VlKFwic2VsZWN0XCIpO1xuICBlbHNlIGRlbnkoXCJzdG9yZVwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlKGluZGV4OiBudW1iZXIpIHtcbiAgaWYgKGRpc3BhdGNoKHsgdHlwZTogXCJyZXRyaWV2ZVwiLCBpbmRleCB9KSkgY3VlKFwic2VsZWN0XCIpO1xuICBlbHNlIGRlbnkoXCJzdG9yZVwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGwodGFyZ2V0OiBCZW5jaFRhcmdldCwgbm9kZTogc3RyaW5nKSB7XG4gIGlmIChkaXNwYXRjaCh7IHR5cGU6IFwiaW5zdGFsbFwiLCB0YXJnZXQsIG5vZGUgfSkpIGN1ZShcImluc3RhbGxcIik7XG4gIGVsc2UgZGVueShcImJlbmNoXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZChsb2c6IHN0cmluZykge1xuICBkaXNwYXRjaCh7IHR5cGU6IFwicmVhZFwiLCBsb2cgfSk7XG59XG5cbi8qKiBUaGUgYnlwYXNzIHNvbHZlZCB0aGUgbG9jazogdGhlIGJ1bGtoZWFkIG9wZW5zLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVubG9jaygpIHtcbiAgaWYgKGRpc3BhdGNoKHsgdHlwZTogXCJ1bmxvY2tcIiB9KSkge1xuICAgIGN1ZShcInVubG9ja1wiKTtcbiAgICBiZXZ5LmRvb3IudW5sb2NrKG51bGwpO1xuICB9XG59XG5cbi8qKiBBIGZhaWxlZCBsb2NrIGF0dGVtcHQuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvY2soKSB7XG4gIGN1ZShcInNob2NrXCIpO1xuICBiZXZ5LmhhY2suc2hvY2sobnVsbCk7XG4gIGdsaXRjaChcImhhY2tcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlKCkge1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCB0aW1lID0gW25vdy5nZXRIb3VycygpLCBub3cuZ2V0TWludXRlcygpLCBub3cuZ2V0U2Vjb25kcygpXVxuICAgIC5tYXAoKG4pID0+IFN0cmluZyhuKS5wYWRTdGFydCgyLCBcIjBcIikpXG4gICAgLmpvaW4oXCI6XCIpO1xuICBkaXNwYXRjaCh7IHR5cGU6IFwic2F2ZVwiLCB0aW1lIH0pO1xuICBjdWUoXCJzYXZlXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZChpZDogbnVtYmVyKSB7XG4gIGlmIChkaXNwYXRjaCh7IHR5cGU6IFwibG9hZFwiLCBpZCB9KSkgY3VlKFwic2F2ZVwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGwoZmxvb3I6IG51bWJlcikge1xuICBpZiAoZGlzcGF0Y2goeyB0eXBlOiBcImNhbGxcIiwgZmxvb3IgfSkpIHtcbiAgICBjdWUoXCJzZWxlY3RcIik7XG4gICAgYmV2eS5lbGV2YXRvci5jYWxsKHsgZmxvb3IgfSk7XG4gIH0gZWxzZSB7XG4gICAgZGVueShcImVsZXZhdG9yXCIpO1xuICB9XG59XG5cbi8qKiBUcmFjZSB0aGUgbG9jYXRvciBsaW5lOiB0byBgdG9gLCBlbHNlIHRvIHdoZXJlIHRoZSBjdXJyZW50IG9iamVjdGl2ZVxuICogIGxlYWRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2F0ZSh0bzogRGVzdGluYXRpb24gPSBPQkpFQ1RJVkVTW29iamVjdGl2ZShnZXRHYW1lKCkpXS50bykge1xuICBkaXNwYXRjaCh7IHR5cGU6IFwibG9jYXRvclwiLCB0byB9KTtcbiAgY3VlKFwibG9jYXRvclwiKTtcbiAgYmV2eS5sb2NhdG9yLnNob3coeyB0byB9KTtcbn1cblxuLyoqIFBpY2sgdGhlIG5leHQgZGVzdGluYXRpb24gYW5kIHRyYWNlIHRvIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5leHREZXN0aW5hdGlvbigpIHtcbiAgY29uc3QgYXQgPSBERVNUSU5BVElPTlMuaW5kZXhPZihnZXRHYW1lKCkuZml4dHVyZXMubG9jYXRvcik7XG4gIGxvY2F0ZShERVNUSU5BVElPTlNbKGF0ICsgMSkgJSBERVNUSU5BVElPTlMubGVuZ3RoXSk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBHYW1lIH0gZnJvbSBcIi4uL2dhbWUvc3RhdGVcIjtcbmltcG9ydCB0eXBlIHsgU3VyZmFjZU5hbWUgfSBmcm9tIFwiLi9zdXJmYWNlc1wiO1xuXG4vKiogT25lIGxpbmUgb2YgdGhlIHByb21wdDogd2hhdCB0byBwcmVzcywgd2hhdCBpdCBkb2VzLiAqL1xuZXhwb3J0IHR5cGUgSGludCA9IHsgaWQ6IHN0cmluZzsga2V5czogW2tleTogc3RyaW5nLCB3aGF0OiBzdHJpbmddW10gfTtcblxuLyoqIFdoYXQgRiB3b3VsZCBoYXZlIGhpbSB1c2UsIGJ5IHBhbmVsLiAqL1xuY29uc3QgVVNFOiBQYXJ0aWFsPFJlY29yZDxTdXJmYWNlTmFtZSwgc3RyaW5nPj4gPSB7XG4gIHN0b3JlOiBcInVzZSB0aGUgc3RvcmVcIixcbiAgYmVuY2g6IFwidXNlIHRoZSBiZW5jaFwiLFxuICBzYXZlOiBcInVzZSB0aGUgc2F2ZSBzdGF0aW9uXCIsXG4gIGVsZXZhdG9yOiBcInVzZSB0aGUgbGlmdCBwYW5lbFwiLFxuICBoYWNrOiBcImJ5cGFzcyB0aGUgbG9ja1wiLFxuICBjb250cm9sczogXCJyZWFkIHRoZSB0ZXJtaW5hbFwiLFxufTtcblxuLyoqIFdoYXQgdGhlIHByb21wdCBiZXNpZGUgaGlzIGFybSBzYXlzIG5vdywgaWYgYW55dGhpbmc6IGhvdyB0byB0YWtlIHRoZVxuICogIG1vdXNlLCB0aGF0IEYgd291bGQgbG9jayB0aGUgY2FtZXJhIG9uIHRoZSBwYW5lbCBoZSBzdGFuZHMgYmVmb3JlLCB0aGVcbiAqICBiYXNpYyBrZXlzIGZvciB0aGUgZmlyc3Qgc2Vjb25kcy4gU2lsZW50IHdoaWxlIGEgc2NyZWVuIGhvbGRzIHRoZSBjYW1lcmFcbiAqICBvciB0aGUgZ3VuIGlzIHVwICh0aGV5IGFyZSBpbiBmcm9udCBvZiBpdCkuICovXG5leHBvcnQgZnVuY3Rpb24gaGludChnOiBHYW1lKTogSGludCB8IG51bGwge1xuICBjb25zdCB7IG1vdXNlLCBzY3JlZW4sIG9mZmVyLCBhaW1pbmcsIGludHJvIH0gPSBnLmhlcmU7XG4gIGlmICghbW91c2UpIHJldHVybiB7IGlkOiBcImNsaWNrXCIsIGtleXM6IFtbXCJDTElDS1wiLCBcInRha2UgdGhlIG1vdXNlXCJdXSB9O1xuICBpZiAoc2NyZWVuIHx8IGFpbWluZykgcmV0dXJuIG51bGw7XG4gIGlmIChvZmZlcikgcmV0dXJuIHsgaWQ6IG9mZmVyLCBrZXlzOiBbW1wiRlwiLCBVU0Vbb2ZmZXJdID8/IFwidXNlIGl0XCJdXSB9O1xuICBpZiAoaW50cm8pXG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBcImludHJvXCIsXG4gICAgICBrZXlzOiBbXG4gICAgICAgIFtcIldBU0RcIiwgXCJtb3ZlXCJdLFxuICAgICAgICBbXCJSTUJcIiwgXCJhaW1cIl0sXG4gICAgICAgIFtcIlRBQlwiLCBcInN1aXQgbWVudVwiXSxcbiAgICAgIF0sXG4gICAgfTtcbiAgcmV0dXJuIG51bGw7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBHYW1lIH0gZnJvbSBcIi4uL2dhbWUvc3RhdGVcIjtcbmltcG9ydCB7IGhpbnQgfSBmcm9tIFwiLi9oaW50XCI7XG5pbXBvcnQgdHlwZSB7IFN1cmZhY2VOYW1lIH0gZnJvbSBcIi4vc3VyZmFjZXNcIjtcblxuLyoqIFRoZSBmaXh0dXJlcycgcGFuZWxzOiBhbHdheXMgcHJvamVjdGVkLCBsaXZlIG9ubHkgd2hpbGUgaGUgc3RhbmRzIHdpdGhpblxuICogIHJlYWNoIChSdXN0J3MgYEhvbG86OnBhbmVsYCBpbiBgaG9sby9tb2QucnNgOyBhIHRlc3QgdGhlcmUgY2hlY2tzKS4gKi9cbmV4cG9ydCBjb25zdCBQQU5FTFM6IFN1cmZhY2VOYW1lW10gPSBbXG4gIFwic3RvcmVcIixcbiAgXCJiZW5jaFwiLFxuICBcInNhdmVcIixcbiAgXCJlbGV2YXRvclwiLFxuICBcImhhY2tcIixcbiAgXCJjb250cm9sc1wiLFxuXTtcblxuLyoqIFdoaWNoIGhvbG9ncmFtcyBhcmUgdW5mb2xkZWQ6IHRoZSBzdWl0J3Mgdml0YWxzLCB0aGUgZml4dHVyZXMnIHBhbmVsc1xuICogIGFuZCB0aGUgZmxvb3IgaW5kaWNhdG9yIGFsd2F5czsgdGhlIHJlc3Qgd2hpbGUgdGhlcmUgaXMgYSByZWFzb24g4oCUIHRoZVxuICogIGxvY2sgdW50aWwgdGhlIGRvb3Igb3BlbnMsIHRoZSBhaXIgaW4gYSB2YWN1dW0sIHRoZSBhbW1vIHdoaWxlIGhlIGFpbXMsXG4gKiAgdGhlIG1lbnUgb24gVGFiLCB0aGUgcHJvbXB0IHdoaWxlIGl0IGhhcyBzb21ldGhpbmcgdG8gc2F5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wZW5Ib2xvcyhnOiBHYW1lKTogU3VyZmFjZU5hbWVbXSB7XG4gIGNvbnN0IG9wZW46IFN1cmZhY2VOYW1lW10gPSBbXCJzcGluZVwiLCBcInN0YXNpc1wiLCBcImZsb29yXCIsIC4uLlBBTkVMU107XG4gIGlmIChnLmZpeHR1cmVzLmRvb3IgIT09IFwib3BlblwiKSBvcGVuLnB1c2goXCJsb2NrXCIpO1xuICBpZiAoZy5zdWl0LnZhY3V1bSkgb3Blbi5wdXNoKFwiYWlyXCIpO1xuICBpZiAoZy5oZXJlLmFpbWluZykgb3Blbi5wdXNoKFwiYW1tb1wiKTtcbiAgaWYgKGcuaGVyZS5tZW51KSBvcGVuLnB1c2goXCJtZW51XCIpO1xuICBpZiAoaGludChnKSkgb3Blbi5wdXNoKFwicHJvbXB0XCIpO1xuICByZXR1cm4gb3Blbjtcbn1cblxuLyoqIFdoZXRoZXIgaG9sb2dyYW0gYG5hbWVgIGlzIGxpdmU6IHVuZm9sZGVkIGFuZCwgZm9yIGEgcGFuZWwsIHdpdGhpblxuICogIHJlYWNoLiBBIGRlYWQgcGFuZWwgc2hvd3MgZ3JleS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0xpdmUoZzogR2FtZSwgbmFtZTogU3VyZmFjZU5hbWUpOiBib29sZWFuIHtcbiAgaWYgKFBBTkVMUy5pbmNsdWRlcyhuYW1lKSkgcmV0dXJuIGcuaGVyZS5uZWFyLmluY2x1ZGVzKG5hbWUpO1xuICByZXR1cm4gb3BlbkhvbG9zKGcpLmluY2x1ZGVzKG5hbWUpO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhSZXBlYXQsXG4gIHdpdGhUaW1pbmcsXG4gIHR5cGUgU2hhcmVkVmFsdWUsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5cbi8qKiBBIHZhbHVlIEJldnkgc3dpbmdzIGJldHdlZW4gMSBhbmQgYGxvd2AgZXZlcnkgYG1zYCB3aGlsZSBgb25gIChhIGJsaW5rLCBhXG4gKiAgcHVsc2UpLCByZXN0aW5nIGF0IDEgb3RoZXJ3aXNlLiBSZWFjdCByZW5kZXJzIG9uY2U7IEJldnkgYW5pbWF0ZXMuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQmxpbmsob246IGJvb2xlYW4sIG1zID0gNDUwLCBsb3cgPSAwLjIpOiBTaGFyZWRWYWx1ZSB7XG4gIGNvbnN0IHYgPSB1c2VTaGFyZWRWYWx1ZSgxKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB2LnZhbHVlID0gb25cbiAgICAgID8gd2l0aFJlcGVhdCh3aXRoVGltaW5nKGxvdywgeyBkdXJhdGlvbjogbXMsIGVhc2luZzogXCJlYXNlSW5PdXRcIiB9KSwge1xuICAgICAgICAgIHJldmVyc2U6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICA6IHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogMTUwIH0pO1xuICB9LCBbb24sIHYsIG1zLCBsb3ddKTtcbiAgcmV0dXJuIHY7XG59XG5cbi8qKiBBbiBhbmdsZSBCZXZ5IHR1cm5zIGZvcmV2ZXI6IGEgZnVsbCB0dXJuIGV2ZXJ5IGBzZWNzYCAobmVnYXRpdmUgdHVybnNcbiAqICB0aGUgb3RoZXIgd2F5KS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VTcGluKHNlY3M6IG51bWJlcik6IFNoYXJlZFZhbHVlIHtcbiAgY29uc3QgdiA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHYudmFsdWUgPSB3aXRoUmVwZWF0KFxuICAgICAgd2l0aFRpbWluZyhzZWNzID4gMCA/IDM2MCA6IC0zNjAsIHtcbiAgICAgICAgZHVyYXRpb246IE1hdGguYWJzKHNlY3MpICogMTAwMCxcbiAgICAgICAgZWFzaW5nOiBcImxpbmVhclwiLFxuICAgICAgfSksXG4gICAgKTtcbiAgfSwgW3NlY3MsIHZdKTtcbiAgcmV0dXJuIHY7XG59XG4iLCAiaW1wb3J0IHsgYWlyTWF4IH0gZnJvbSBcIi4uL2dhbWUvcmVkdWNlXCI7XG5pbXBvcnQgeyB1c2VHYW1lIH0gZnJvbSBcIi4uL2dhbWUvc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEhvbG8gfSBmcm9tIFwiLi9Ib2xvXCI7XG5pbXBvcnQgeyB1c2VCbGluayB9IGZyb20gXCIuL3N1aXQvbG9vcHNcIjtcblxuLyoqIFVuZGVyIHRoaXMgbWFueSBzZWNvbmRzIHRoZSBjb3VudGRvd24gdHVybnMgcmVkIGFuZCBibGlua3MuICovXG5jb25zdCBMT1cgPSAxNTtcblxuLyoqIFwiMDo0MlwiIGZyb20gc2Vjb25kcyAocm91bmRlZCB1cDogMDowMCBtZWFucyB0aGUgdGFua3MgYXJlIGRyeSkuICovXG5mdW5jdGlvbiBjbG9jayhzZWNzOiBudW1iZXIpOiBzdHJpbmcge1xuICBjb25zdCBzID0gTWF0aC5jZWlsKHNlY3MpO1xuICByZXR1cm4gYCR7TWF0aC5mbG9vcihzIC8gNjApfToke1N0cmluZyhzICUgNjApLnBhZFN0YXJ0KDIsIFwiMFwiKX1gO1xufVxuXG4vKiogVGhlIGFpciBjb3VudGRvd24gb3ZlciB0aGUgbGVmdCBzaG91bGRlciB3aGlsZSB0aGUgcm9vbSBpcyBpbiB2YWN1dW1cbiAqICAoMjIwIMOXIDExMCkuICovXG5leHBvcnQgZnVuY3Rpb24gQWlyKCkge1xuICByZXR1cm4gKFxuICAgIDxIb2xvIG5hbWU9XCJhaXJcIiBzZWVkPXs3fT5cbiAgICAgIDxBaXJUaW1lciAvPlxuICAgIDwvSG9sbz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gQWlyVGltZXIoKSB7XG4gIGNvbnN0IGFpciA9IHVzZUdhbWUoKGcpID0+IGcuc3VpdC5haXIpO1xuICBjb25zdCBtYXggPSB1c2VHYW1lKGFpck1heCk7XG4gIGNvbnN0IGxvdyA9IGFpciA8IExPVztcbiAgY29uc3QgY29sb3IgPSBsb3cgPyBDLnJlZCA6IEMuY3lhbjtcbiAgY29uc3QgYmxpbmsgPSB1c2VCbGluayhsb3csIDI4MCwgMC4yNSk7XG5cbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDE0LCByaWdodDogMTIsIHRvcDogOCwgYm90dG9tOiAxMCB9LFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmdsYXNzLFxuICAgICAgICBib3JkZXI6IHsgbGVmdDogMywgdG9wOiAxLCByaWdodDogMSwgYm90dG9tOiAxIH0sXG4gICAgICAgIGJvcmRlckNvbG9yOiBsb3cgPyBDLnJlZERpbSA6IEMuY3lhbkxpbmUsXG4gICAgICAgIG9wYWNpdHk6IHsgYW5pbWF0ZWQ6IGJsaW5rIH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiIH19PlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMi41LFxuICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIE8yIFNVUFBMWVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAyLjUsXG4gICAgICAgICAgICBjb2xvcjogQy5yZWQsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFZBQ1VVTVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuZGlzcGxheSxcbiAgICAgICAgICBmb250U2l6ZTogMzgsXG4gICAgICAgICAgY29sb3I6IGxvdyA/IEMucmVkIDogQy53aGl0ZSxcbiAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtjbG9jayhhaXIpfVxuICAgICAgPC90ZXh0PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBsb3cgPyBDLnJlZERpbSA6IEMuY3lhbkRpbSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IGAke01hdGgubWF4KDAsIE1hdGgubWluKDEsIGFpciAvIG1heCkpICogMTAwfSVgLFxuICAgICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3IsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgSVRFTVMgfSBmcm9tIFwiLi4vZ2FtZS9pdGVtc1wiO1xuaW1wb3J0IHsgY2xpcFNpemUsIHJlc2VydmUgfSBmcm9tIFwiLi4vZ2FtZS9yZWR1Y2VcIjtcbmltcG9ydCB7IHVzZUdhbWUgfSBmcm9tIFwiLi4vZ2FtZS9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgSG9sbyB9IGZyb20gXCIuL0hvbG9cIjtcbmltcG9ydCB7IHVzZUJsaW5rIH0gZnJvbSBcIi4vc3VpdC9sb29wc1wiO1xuXG4vKiogQ2xpcHMgdXAgdG8gdGhpcyBzaXplIHNob3cgb25lIHBpcCBwZXIgcm91bmQ7IGJpZ2dlciBvbmVzIGEgYmFyLiAqL1xuY29uc3QgTUFYX1BJUFMgPSAxMjtcblxuLyoqIFRoZSBhbW1vIGNvdW50IHByb2plY3RlZCBvdmVyIHRoZSBndW4gd2hpbGUgYWltaW5nICgyMjAgw5cgMTMwKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBbW1vKCkge1xuICByZXR1cm4gKFxuICAgIDxIb2xvIG5hbWU9XCJhbW1vXCIgc2VlZD17MTF9PlxuICAgICAgPEFtbW9Db3VudCAvPlxuICAgIDwvSG9sbz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gQW1tb0NvdW50KCkge1xuICBjb25zdCB3ZWFwb24gPSB1c2VHYW1lKChnKSA9PiBnLmFybXMud2VhcG9uKTtcbiAgY29uc3QgY2xpcCA9IHVzZUdhbWUoKGcpID0+IGcuYXJtcy5jbGlwW2cuYXJtcy53ZWFwb25dKTtcbiAgY29uc3Qgc2l6ZSA9IHVzZUdhbWUoKGcpID0+IGNsaXBTaXplKGcsIGcuYXJtcy53ZWFwb24pKTtcbiAgY29uc3Qgc3BhcmUgPSB1c2VHYW1lKChnKSA9PiByZXNlcnZlKGcsIGcuYXJtcy53ZWFwb24pKTtcbiAgY29uc3QgZW1wdHkgPSBjbGlwID09PSAwO1xuICBjb25zdCBibGluayA9IHVzZUJsaW5rKGVtcHR5LCAzMDAsIDAuMTUpO1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMiwgdmVydGljYWw6IDggfSxcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMixcbiAgICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtJVEVNU1t3ZWFwb25dLm5hbWUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8VHJpRG90IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImZsZXhFbmRcIiwgZ2FwOiA4IH19PlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmRpc3BsYXksXG4gICAgICAgICAgICBmb250U2l6ZTogNTAsXG4gICAgICAgICAgICBjb2xvcjogZW1wdHkgPyBDLnJlZCA6IEMud2hpdGUsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtTdHJpbmcoY2xpcCkucGFkU3RhcnQoMiwgXCIwXCIpfVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIHBhZGRpbmc6IHsgYm90dG9tOiA4IH0gfX0+XG4gICAgICAgICAge2VtcHR5ID8gKFxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDIsXG4gICAgICAgICAgICAgICAgY29sb3I6IEMucmVkLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IHsgYW5pbWF0ZWQ6IGJsaW5rIH0sXG4gICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBSRUxPQURcbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5kaXNwbGF5LFxuICAgICAgICAgICAgICBmb250U2l6ZTogMTYsXG4gICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW5EaW0sXG4gICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2AvICR7c3BhcmV9YH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxSb3VuZHMgY2xpcD17Y2xpcH0gc2l6ZT17c2l6ZX0gLz5cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBPbmUgcGlwIHBlciByb3VuZCBpbiB0aGUgY2xpcCAob3IgYSBiYXIgZm9yIGEgYmlnIGNsaXApLiAqL1xuZnVuY3Rpb24gUm91bmRzKHsgY2xpcCwgc2l6ZSB9OiB7IGNsaXA6IG51bWJlcjsgc2l6ZTogbnVtYmVyIH0pIHtcbiAgaWYgKHNpemUgPiBNQVhfUElQUykge1xuICAgIHJldHVybiAoXG4gICAgICA8bm9kZSBzdHlsZT17eyBoZWlnaHQ6IDUsIGJvcmRlcjogMSwgYm9yZGVyQ29sb3I6IEMuY3lhbkRpbSB9fT5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IGAkeyhjbGlwIC8gc2l6ZSkgKiAxMDB9JWAsXG4gICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvbm9kZT5cbiAgICApO1xuICB9XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAzLCBoZWlnaHQ6IDcgfX0+XG4gICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogc2l6ZSB9LCAoXywgaSkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBpIDwgY2xpcCA/IEMuY3lhbiA6IEMuY2xlYXIsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogaSA8IGNsaXAgPyBDLmN5YW5IaSA6IEMuY3lhbkRpbSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgICAgKSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHRocmVlIGVtaXR0ZXJzIG9mIHRoZSBzaWdodC4gKi9cbmZ1bmN0aW9uIFRyaURvdCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMzAgOFwiIHN0eWxlPXt7IHdpZHRoOiAzMCwgaGVpZ2h0OiA4IH19PlxuICAgICAge1s0LCAxNSwgMjZdLm1hcCgoeCkgPT4gKFxuICAgICAgICA8Y2lyY2xlIGtleT17eH0gY3g9e3h9IGN5PXs0fSByPXsyLjZ9IGZpbGw9e0MucmVkfSAvPlxuICAgICAgKSl9XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGluc3RhbGwgfSBmcm9tIFwiLi4vZ2FtZS9hY3RcIjtcbmltcG9ydCB7XG4gIEJFTkNIX1RBUkdFVFMsXG4gIENJUkNVSVRTLFxuICBTVEFUX05BTUVTLFxuICBjYW5JbnN0YWxsLFxuICBzdGF0cyxcbiAgdHlwZSBCZW5jaFRhcmdldCxcbn0gZnJvbSBcIi4uL2dhbWUvYmVuY2hcIjtcbmltcG9ydCB7IElURU1TLCBjb3VudEl0ZW0gfSBmcm9tIFwiLi4vZ2FtZS9pdGVtc1wiO1xuaW1wb3J0IHsgdXNlR2FtZSB9IGZyb20gXCIuLi9nYW1lL3N0b3JlXCI7XG5pbXBvcnQgeyB1c2VEZWJ1ZyB9IGZyb20gXCIuLi9ob29rc1wiO1xuaW1wb3J0IHsgY3VlIH0gZnJvbSBcIi4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBDaXJjdWl0LCBLSU5EX0NPTE9SLCBsZWdlbmQgfSBmcm9tIFwiLi9iZW5jaC9DaXJjdWl0XCI7XG5pbXBvcnQgeyBIb2xvIH0gZnJvbSBcIi4vSG9sb1wiO1xuaW1wb3J0IHsgQ29ybmVycywgUnVsZSwgU2hlbGwsIFRhYnMgfSBmcm9tIFwiLi9zaGFyZWQva2l0XCI7XG5cbmNvbnN0IFRBQlMgPSBCRU5DSF9UQVJHRVRTLm1hcCgoaWQpID0+ICh7XG4gIGlkLFxuICBsYWJlbDogaWQgPT09IFwicmlnXCIgPyBcIlJJR1wiIDogSVRFTVNbaWRdLm5hbWUudG9VcHBlckNhc2UoKSxcbn0pKTtcblxuLyoqIFRoZSB1cGdyYWRlIGJlbmNoOiBwaWNrIGEgd2VhcG9uIG9yIHRoZSBzdWl0LCBwb3dlciBjaXJjdWl0XG4gKiAgbm9kZXMgd2l0aCBwb3dlciBjZWxscyAob25lIGVhY2gsIG5leHQgdG8gYSBwb3dlcmVkIG5vZGUpLCB3YXRjaCB0aGVcbiAqICBzdGF0cyBtb3ZlLiBIb3ZlcmluZyBhIG5vZGUgcHJldmlld3Mgd2hhdCBpdCB3b3VsZCBkby4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCZW5jaCgpIHtcbiAgY29uc3Qgb3duZWQgPSB1c2VHYW1lKChnKSA9PiBnLmFybXMub3duZWQpO1xuICBjb25zdCBiZW5jaCA9IHVzZUdhbWUoKGcpID0+IGcuYmVuY2gpO1xuICBjb25zdCBjZWxscyA9IHVzZUdhbWUoKGcpID0+IGNvdW50SXRlbShnLnBhY2ssIFwicG93ZXItY2VsbFwiKSk7XG4gIGNvbnN0IFt0YXJnZXQsIHNldFRhcmdldF0gPSB1c2VTdGF0ZTxCZW5jaFRhcmdldD4oXCJjdXR0ZXJcIik7XG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IGxvY2tlZCA9IEJFTkNIX1RBUkdFVFMuZmlsdGVyKCh0KSA9PiB0ICE9PSBcInJpZ1wiICYmICFvd25lZC5pbmNsdWRlcyh0KSk7XG5cbiAgY29uc3QgcGljayA9IChuZXh0OiBCZW5jaFRhcmdldCkgPT4ge1xuICAgIGlmIChuZXh0ID09PSB0YXJnZXQpIHJldHVybjtcbiAgICBzZXRUYXJnZXQobmV4dCk7XG4gICAgc2V0SG92ZXIobnVsbCk7XG4gICAgY3VlKFwidGFiXCIpO1xuICB9O1xuICB1c2VEZWJ1ZyhcImJlbmNoXCIsIChpZCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSBCRU5DSF9UQVJHRVRTLmZpbmQoKHQpID0+IHQgPT09IGlkKTtcbiAgICBpZiAobmV4dCAmJiAhbG9ja2VkLmluY2x1ZGVzKG5leHQpKSBzZXRUYXJnZXQobmV4dCk7XG4gIH0pO1xuICB1c2VEZWJ1ZyhcImluc3RhbGxcIiwgKG5vZGUpID0+IGluc3RhbGwodGFyZ2V0LCBub2RlKSk7XG4gIHVzZURlYnVnKFwiaG92ZXJcIiwgKG5vZGUpID0+IHNldEhvdmVyKG5vZGUgfHwgbnVsbCkpO1xuXG4gIHJldHVybiAoXG4gICAgPEhvbG8gbmFtZT1cImJlbmNoXCIgcGFnZT17dGFyZ2V0fSBzZWVkPXs3fT5cbiAgICAgIDxTaGVsbD5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxOCB9fT5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMgfX0+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULmhlYWRlciwgZm9udFNpemU6IDI4LCBsZXR0ZXJTcGFjaW5nOiA2IH19PlxuICAgICAgICAgICAgICBVUEdSQURFIEJFTkNIXG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyIH19PlxuICAgICAgICAgICAgICBIQUxERU4gVE9PTFdPUktTIMK3IENJUkNVSVQgQkVOQ0ggQy0yXG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxIH19IC8+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgYWxpZ25JdGVtczogXCJlbmRcIiwgZ2FwOiAxIH19PlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMyB9fT5QT1dFUiBDRUxMUzwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgLi4uVC5udW1iZXIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDQyLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBjZWxscyA+IDAgPyBDLmdyZWVuIDogQy5yZWQsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtTdHJpbmcoY2VsbHMpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBtYXJnaW46IHsgdG9wOiAxMCB9IH19PlxuICAgICAgICAgIDxUYWJzIHRhYnM9e1RBQlN9IGFjdGl2ZT17dGFyZ2V0fSBvblBpY2s9e3BpY2t9IGRpc2FibGVkPXtsb2NrZWR9IC8+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPFJ1bGUgLz5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGdhcDogMjYsXG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIG1hcmdpbjogeyB0b3A6IDE4IH0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwYWRkaW5nOiA0LFxuICAgICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMTI3LCAyMjcsIDI1NSwgMC4yNSlcIixcbiAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMiwgMTIsIDIwLCAwLjUpXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxDb3JuZXJzIHNpemU9ezIyfSB3aWR0aD17Mn0gLz5cbiAgICAgICAgICAgIDxDaXJjdWl0XG4gICAgICAgICAgICAgIHRhcmdldD17dGFyZ2V0fVxuICAgICAgICAgICAgICBpbnN0YWxsZWQ9e2JlbmNoW3RhcmdldF19XG4gICAgICAgICAgICAgIGhvdmVyPXtob3Zlcn1cbiAgICAgICAgICAgICAgb25Ib3Zlcj17c2V0SG92ZXJ9XG4gICAgICAgICAgICAgIG9uSW5zdGFsbD17KG5vZGUpID0+IGluc3RhbGwodGFyZ2V0LCBub2RlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgIDxTdGF0c1xuICAgICAgICAgICAgdGFyZ2V0PXt0YXJnZXR9XG4gICAgICAgICAgICBpbnN0YWxsZWQ9e2JlbmNoW3RhcmdldF19XG4gICAgICAgICAgICBob3Zlcj17aG92ZXJ9XG4gICAgICAgICAgICBjZWxscz17Y2VsbHN9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDI0LCBtYXJnaW46IHsgdG9wOiAxMiB9IH19PlxuICAgICAgICAgIHtsZWdlbmQodGFyZ2V0KS5tYXAoKHsga2luZCwgbmFtZSB9KSA9PiAoXG4gICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICBrZXk9e2tpbmR9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogOCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IDEyLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA2LFxuICAgICAgICAgICAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEtJTkRfQ09MT1Jba2luZF0sXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT57bmFtZX08L3RleHQ+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvU2hlbGw+XG4gICAgPC9Ib2xvPlxuICApO1xufVxuXG4vKiogSG93IGEgc3RhdCByZWFkczogdGhlIFJJRydzIGFybW9yIGluICUsIHRpbWVzIGluIHNlY29uZHMuICovXG5mdW5jdGlvbiBmb3JtYXQoXG4gIHRhcmdldDogQmVuY2hUYXJnZXQsXG4gIHN0YXQ6IFwiZGFtYWdlXCIgfCBcImNhcGFjaXR5XCIgfCBcInJlbG9hZFwiLFxuICB2OiBudW1iZXIsXG4pIHtcbiAgaWYgKHRhcmdldCA9PT0gXCJyaWdcIikgcmV0dXJuIHN0YXQgPT09IFwiZGFtYWdlXCIgPyBgJHt2fSVgIDogYCR7dn0gU2A7XG4gIHJldHVybiBzdGF0ID09PSBcInJlbG9hZFwiID8gYCR7di50b0ZpeGVkKDIpfSBTYCA6IFN0cmluZyh2KTtcbn1cblxuLyoqIFRoZSB0YXJnZXQncyBzdGF0cyBub3csIGFuZCDigJQgb3ZlciBhIG5vZGUgcG93ZXIgY2FuIHJlYWNoIOKAlCB3aGF0IGl0XG4gKiAgd291bGQgbWFrZSB0aGVtLiAqL1xuZnVuY3Rpb24gU3RhdHMoe1xuICB0YXJnZXQsXG4gIGluc3RhbGxlZCxcbiAgaG92ZXIsXG4gIGNlbGxzLFxufToge1xuICB0YXJnZXQ6IEJlbmNoVGFyZ2V0O1xuICBpbnN0YWxsZWQ6IHN0cmluZ1tdO1xuICBob3Zlcjogc3RyaW5nIHwgbnVsbDtcbiAgY2VsbHM6IG51bWJlcjtcbn0pIHtcbiAgY29uc3Qgbm93ID0gc3RhdHModGFyZ2V0LCBpbnN0YWxsZWQpO1xuICBjb25zdCBub2RlID0gQ0lSQ1VJVFNbdGFyZ2V0XS5maW5kKChuKSA9PiBuLmlkID09PSBob3Zlcik7XG4gIGNvbnN0IHJlYWNoYWJsZSA9ICEhaG92ZXIgJiYgY2FuSW5zdGFsbCh0YXJnZXQsIGluc3RhbGxlZCwgaG92ZXIpO1xuICBjb25zdCB0aGVuID0gcmVhY2hhYmxlID8gc3RhdHModGFyZ2V0LCBbLi4uaW5zdGFsbGVkLCBob3Zlcl0pIDogbm93O1xuICBjb25zdCBuYW1lcyA9IFNUQVRfTkFNRVNbdGFyZ2V0XTtcbiAgY29uc3Qgcm93cyA9IChbXCJkYW1hZ2VcIiwgXCJjYXBhY2l0eVwiLCBcInJlbG9hZFwiXSBhcyBjb25zdCkubWFwKChzdGF0KSA9PiAoe1xuICAgIHN0YXQsXG4gICAgbmFtZTogbmFtZXNbc3RhdF0sXG4gICAgbm93OiBub3dbc3RhdF0sXG4gICAgdGhlbjogdGhlbltzdGF0XSxcbiAgfSkpO1xuICBjb25zdCBzdGF0ZSA9ICFub2RlXG4gICAgPyBudWxsXG4gICAgOiBub2RlLmtpbmQgPT09IFwic3RhcnRcIiB8fCBpbnN0YWxsZWQuaW5jbHVkZXMobm9kZS5pZClcbiAgICAgID8geyB0ZXh0OiBcIlBPV0VSRURcIiwgY29sb3I6IEMuZ3JlZW4gfVxuICAgICAgOiByZWFjaGFibGVcbiAgICAgICAgPyB7IHRleHQ6IFwiMSBQT1dFUiBDRUxMIFRPIFBPV0VSXCIsIGNvbG9yOiBjZWxscyA+IDAgPyBDLmFtYmVyIDogQy5yZWQgfVxuICAgICAgICA6IHsgdGV4dDogXCJOTyBQT1dFUiBSRUFDSEVTIElUXCIsIGNvbG9yOiBDLmN5YW5EaW0gfTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDE2LCBmbGV4R3JvdzogMSB9fT5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDMgfX0+XG4gICAgICAgIHt0YXJnZXQgPT09IFwicmlnXCIgPyBcIlJJRyBNSy1JSVwiIDogSVRFTVNbdGFyZ2V0XS5uYW1lLnRvVXBwZXJDYXNlKCl9XG4gICAgICA8L3RleHQ+XG4gICAgICB7cm93cy5tYXAoKHIpID0+IChcbiAgICAgICAgPG5vZGUga2V5PXtyLnN0YXR9IHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNCB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyIH19PntyLm5hbWV9PC90ZXh0PlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTQgfX0+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm51bWJlciwgZm9udFNpemU6IDMwIH19PlxuICAgICAgICAgICAgICB7Zm9ybWF0KHRhcmdldCwgci5zdGF0LCByLm5vdyl9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICB7ci50aGVuICE9PSByLm5vdyAmJiAoXG4gICAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubnVtYmVyLCBmb250U2l6ZTogMjIsIGNvbG9yOiBDLmdyZWVuIH19PlxuICAgICAgICAgICAgICAgIHtg4oC6ICR7Zm9ybWF0KHRhcmdldCwgci5zdGF0LCByLnRoZW4pfWB9XG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICApKX1cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogNCB9fT5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT57bmFtZXMuc3BlY2lhbH08L3RleHQ+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAyLFxuICAgICAgICAgICAgY29sb3I6IHRoZW4uc3BlY2lhbCA/IEMuZ3JlZW4gOiBDLmN5YW5EZWVwLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7bm93LnNwZWNpYWwgPyBcIkFDVElWRVwiIDogdGhlbi5zcGVjaWFsID8gXCLigLogQUNUSVZFXCIgOiBcIkxPQ0tFRFwifVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgPFJ1bGUgLz5cbiAgICAgIHtub2RlICYmIHN0YXRlID8gKFxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMgfX0+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5sYWJlbCwgY29sb3I6IEtJTkRfQ09MT1Jbbm9kZS5raW5kXSB9fT5cbiAgICAgICAgICAgIHtuYW1lc1tub2RlLmtpbmRdfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyLCBjb2xvcjogc3RhdGUuY29sb3IgfX0+XG4gICAgICAgICAgICB7c3RhdGUudGV4dH1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICkgOiAoXG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDIgfX0+XG4gICAgICAgICAgUE9XRVIgQSBOT0RFIE5FWFQgVE8gQSBQT1dFUkVEIE9ORSDCtyAxIENFTEwgRUFDSFxuICAgICAgICA8L3RleHQ+XG4gICAgICApfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZVNoYXJlZFZhbHVlLCB3aXRoUmVwZWF0LCB3aXRoVGltaW5nIH0gZnJvbSBcImJldnktcmVhY3RcIjtcbmltcG9ydCB7XG4gIENJUkNVSVRTLFxuICBTVEFUX05BTUVTLFxuICBjYW5JbnN0YWxsLFxuICB0eXBlIEJlbmNoVGFyZ2V0LFxuICB0eXBlIENpcmN1aXROb2RlLFxuICB0eXBlIE5vZGVLaW5kLFxufSBmcm9tIFwiLi4vLi4vZ2FtZS9iZW5jaFwiO1xuaW1wb3J0IHsgQywgRiB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgdXNlTGl2ZSB9IGZyb20gXCIuLi9Ib2xvXCI7XG5cbi8qKiBUaGUgYm9hcmQncyBzaXplIGFuZCBhIGdyaWQgY2VsbCdzICg2IMOXIDMgY2VsbHMpLiAqL1xuZXhwb3J0IGNvbnN0IEJPQVJEID0geyB3aWR0aDogNzgwLCBoZWlnaHQ6IDQ1MCB9O1xuY29uc3QgQ0VMTCA9IHsgeDogQk9BUkQud2lkdGggLyA2LCB5OiBCT0FSRC5oZWlnaHQgLyAzIH07XG5jb25zdCBSID0gMzA7XG5cbi8qKiBFYWNoIG5vZGUga2luZCdzIGxpZ2h0LiAqL1xuZXhwb3J0IGNvbnN0IEtJTkRfQ09MT1I6IFJlY29yZDxOb2RlS2luZCwgc3RyaW5nPiA9IHtcbiAgc3RhcnQ6IEMud2hpdGUsXG4gIGRhbWFnZTogQy5yZWQsXG4gIGNhcGFjaXR5OiBDLmN5YW4sXG4gIHJlbG9hZDogQy5hbWJlcixcbiAgc3BlY2lhbDogQy53aGl0ZSxcbiAgZW1wdHk6IEMuY3lhbkRpbSxcbn07XG5cbmNvbnN0IFNIT1JUOiBSZWNvcmQ8Tm9kZUtpbmQsIHN0cmluZz4gPSB7XG4gIHN0YXJ0OiBcIklOXCIsXG4gIGRhbWFnZTogXCJETUdcIixcbiAgY2FwYWNpdHk6IFwiQ0FQXCIsXG4gIHJlbG9hZDogXCJSTERcIixcbiAgc3BlY2lhbDogXCJTUENcIixcbiAgZW1wdHk6IFwi4oCUXCIsXG59O1xuXG4vKiogVGhlIFJJRydzIG5vZGVzIGFyZSBhcm1vciwgYWlyIGFuZCBzdGFzaXMuICovXG5jb25zdCBSSUdfU0hPUlQ6IFJlY29yZDxOb2RlS2luZCwgc3RyaW5nPiA9IHtcbiAgLi4uU0hPUlQsXG4gIGRhbWFnZTogXCJBUk1cIixcbiAgY2FwYWNpdHk6IFwiQUlSXCIsXG4gIHJlbG9hZDogXCJTVFNcIixcbn07XG5cbmZ1bmN0aW9uIGNlbnRlcihuOiBDaXJjdWl0Tm9kZSkge1xuICByZXR1cm4geyB4OiBDRUxMLnggKiAobi54ICsgMC41KSwgeTogQ0VMTC55ICogKG4ueSArIDAuNSkgfTtcbn1cblxuLyoqIEEgY2lyY3VpdCBib2FyZDogdHJhY2VzIGJldHdlZW4gdGhlIG5vZGVzLCBlYWNoIG5vZGUgYSByaW5nIGluIGl0c1xuICogIGtpbmQncyBjb2xvciDigJQgcG93ZXJlZCBvbmVzIGZpbGxlZCB3aXRoIGxpZ2h0LCB0aGUgb25lcyBwb3dlciBjYW4gcmVhY2hcbiAqICBuZXh0IGJyZWF0aGluZywgdGhlIHJlc3QgZGFyay4gVGhlIHN2ZyBvbmx5IGRyYXdzOyBhIHRyYW5zcGFyZW50IGJ1dHRvblxuICogIG92ZXIgZWFjaCBub2RlIHRha2VzIHRoZSBjbGlja3MgYW5kIHRoZSBob3Zlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDaXJjdWl0KHtcbiAgdGFyZ2V0LFxuICBpbnN0YWxsZWQsXG4gIGhvdmVyLFxuICBvbkhvdmVyLFxuICBvbkluc3RhbGwsXG59OiB7XG4gIHRhcmdldDogQmVuY2hUYXJnZXQ7XG4gIGluc3RhbGxlZDogc3RyaW5nW107XG4gIGhvdmVyOiBzdHJpbmcgfCBudWxsO1xuICBvbkhvdmVyOiAobm9kZTogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZDtcbiAgb25JbnN0YWxsOiAobm9kZTogc3RyaW5nKSA9PiB2b2lkO1xufSkge1xuICBjb25zdCBub2RlcyA9IENJUkNVSVRTW3RhcmdldF07XG4gIGNvbnN0IHBvd2VyZWQgPSAoaWQ6IHN0cmluZykgPT4gaWQgPT09IFwic3RhcnRcIiB8fCBpbnN0YWxsZWQuaW5jbHVkZXMoaWQpO1xuICAvLyBPbmx5IHdoaWxlIGhlIGlzIGF0IHRoZSBiZW5jaDogZWFjaCBmcmFtZSBvZiB0aGUgcHVsc2UgcmUtcmFzdGVycyB0aGVcbiAgLy8gYm9hcmQuXG4gIGNvbnN0IGxpdmUgPSB1c2VMaXZlKFwiYmVuY2hcIik7XG4gIGNvbnN0IHB1bHNlID0gdXNlU2hhcmVkVmFsdWUoMC42KTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBwdWxzZS52YWx1ZSA9IGxpdmVcbiAgICAgID8gd2l0aFJlcGVhdCh3aXRoVGltaW5nKDEsIHsgZHVyYXRpb246IDcwMCwgZWFzaW5nOiBcImVhc2VJbk91dFwiIH0pLCB7XG4gICAgICAgICAgcmV2ZXJzZTogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIDogd2l0aFRpbWluZygwLjYsIHsgZHVyYXRpb246IDIwMCB9KTtcbiAgfSwgW3B1bHNlLCBsaXZlXSk7XG5cbiAgLy8gRWFjaCBsaW5rIG9uY2UgKHRoZSBib2FyZCBsaXN0cyB0aGVtIGJvdGggd2F5cykuXG4gIGNvbnN0IGxpbmtzID0gbm9kZXMuZmxhdE1hcCgobikgPT5cbiAgICBuLmxpbmtzXG4gICAgICAuZmlsdGVyKChsKSA9PiBuLmlkIDwgbClcbiAgICAgIC5tYXAoKGwpID0+IFtuLCBub2Rlcy5maW5kKChtKSA9PiBtLmlkID09PSBsKSFdIGFzIGNvbnN0KSxcbiAgKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiBCT0FSRC53aWR0aCwgaGVpZ2h0OiBCT0FSRC5oZWlnaHQgfX0+XG4gICAgICA8c3ZnXG4gICAgICAgIHZpZXdCb3g9e2AwIDAgJHtCT0FSRC53aWR0aH0gJHtCT0FSRC5oZWlnaHR9YH1cbiAgICAgICAgc3R5bGU9e3sgd2lkdGg6IEJPQVJELndpZHRoLCBoZWlnaHQ6IEJPQVJELmhlaWdodCB9fVxuICAgICAgPlxuICAgICAgICB7LyogVGhlIGdyaWQncyBmYWludCBkb3RzOiBhbiBldGNoZWQgYm9hcmQuICovfVxuICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogNyAqIDQgfSwgKF8sIGkpID0+IChcbiAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICBrZXk9e2Bkb3Qke2l9YH1cbiAgICAgICAgICAgIGN4PXsoaSAlIDcpICogQ0VMTC54fVxuICAgICAgICAgICAgY3k9e01hdGguZmxvb3IoaSAvIDcpICogQ0VMTC55fVxuICAgICAgICAgICAgcj17MS41fVxuICAgICAgICAgICAgZmlsbD1cInJnYmEoMTI3LCAyMjcsIDI1NSwgMC4yNSlcIlxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgICB7bGlua3MubWFwKChbYSwgYl0pID0+IHtcbiAgICAgICAgICBjb25zdCBwID0gY2VudGVyKGEpO1xuICAgICAgICAgIGNvbnN0IHEgPSBjZW50ZXIoYik7XG4gICAgICAgICAgY29uc3QgbGl2ZSA9IHBvd2VyZWQoYS5pZCkgJiYgcG93ZXJlZChiLmlkKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpbmVcbiAgICAgICAgICAgICAga2V5PXtgJHthLmlkfS0ke2IuaWR9YH1cbiAgICAgICAgICAgICAgeDE9e3AueH1cbiAgICAgICAgICAgICAgeTE9e3AueX1cbiAgICAgICAgICAgICAgeDI9e3EueH1cbiAgICAgICAgICAgICAgeTI9e3EueX1cbiAgICAgICAgICAgICAgc3Ryb2tlPXtsaXZlID8gQy5jeWFuIDogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMjIpXCJ9XG4gICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXtsaXZlID8gNCA6IDJ9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgICB7bm9kZXMubWFwKChuKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyB4LCB5IH0gPSBjZW50ZXIobik7XG4gICAgICAgICAgY29uc3Qgb24gPSBwb3dlcmVkKG4uaWQpO1xuICAgICAgICAgIGNvbnN0IG5leHQgPSBjYW5JbnN0YWxsKHRhcmdldCwgaW5zdGFsbGVkLCBuLmlkKTtcbiAgICAgICAgICBjb25zdCBjb2xvciA9IEtJTkRfQ09MT1Jbbi5raW5kXTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcga2V5PXtuLmlkfT5cbiAgICAgICAgICAgICAge25leHQgJiYgKFxuICAgICAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgICAgIGN4PXt4fVxuICAgICAgICAgICAgICAgICAgY3k9e3l9XG4gICAgICAgICAgICAgICAgICByPXtSICsgN31cbiAgICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk9e3sgYW5pbWF0ZWQ6IHB1bHNlIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAge24ua2luZCA9PT0gXCJzdGFydFwiID8gKFxuICAgICAgICAgICAgICAgIDxyZWN0XG4gICAgICAgICAgICAgICAgICB4PXt4IC0gUn1cbiAgICAgICAgICAgICAgICAgIHk9e3kgLSBSfVxuICAgICAgICAgICAgICAgICAgd2lkdGg9e1IgKiAyfVxuICAgICAgICAgICAgICAgICAgaGVpZ2h0PXtSICogMn1cbiAgICAgICAgICAgICAgICAgIGZpbGw9XCJyZ2JhKDI0MCwgMjUzLCAyNTUsIDAuMTgpXCJcbiAgICAgICAgICAgICAgICAgIHN0cm9rZT17Qy53aGl0ZX1cbiAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXszfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAgICAgICAgY3g9e3h9XG4gICAgICAgICAgICAgICAgICBjeT17eX1cbiAgICAgICAgICAgICAgICAgIHI9e1J9XG4gICAgICAgICAgICAgICAgICBmaWxsPXtvbiA/IGNvbG9yIDogXCJyZ2JhKDIsIDEwLCAxNiwgMC43KVwifVxuICAgICAgICAgICAgICAgICAgb3BhY2l0eT17b24gPyAwLjkgOiAxfVxuICAgICAgICAgICAgICAgICAgc3Ryb2tlPXtvbiB8fCBuZXh0ID8gY29sb3IgOiBcInJnYmEoMTI3LCAyMjcsIDI1NSwgMC4zKVwifVxuICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9e2hvdmVyID09PSBuLmlkID8gNCA6IDIuNX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7b24gJiYgbi5raW5kICE9PSBcInN0YXJ0XCIgJiYgKFxuICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9e3h9IGN5PXt5fSByPXtSIC0gOX0gZmlsbD1cInJnYmEoMiwgMTAsIDE2LCAwLjU1KVwiIC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3N2Zz5cbiAgICAgIHtub2Rlcy5tYXAoKG4pID0+IHtcbiAgICAgICAgY29uc3QgeyB4LCB5IH0gPSBjZW50ZXIobik7XG4gICAgICAgIGNvbnN0IG9uID0gcG93ZXJlZChuLmlkKTtcbiAgICAgICAgY29uc3QgbmV4dCA9IGNhbkluc3RhbGwodGFyZ2V0LCBpbnN0YWxsZWQsIG4uaWQpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGtleT17bi5pZH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5leHQgJiYgb25JbnN0YWxsKG4uaWQpfVxuICAgICAgICAgICAgb25Qb2ludGVyRW50ZXI9eygpID0+IG9uSG92ZXIobi5pZCl9XG4gICAgICAgICAgICBvblBvaW50ZXJMZWF2ZT17KCkgPT4gb25Ib3ZlcihudWxsKX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICBsZWZ0OiB4IC0gUiAtIDQsXG4gICAgICAgICAgICAgIHRvcDogeSAtIFIgLSA0LFxuICAgICAgICAgICAgICB3aWR0aDogKFIgKyA0KSAqIDIsXG4gICAgICAgICAgICAgIGhlaWdodDogKFIgKyA0KSAqIDIsXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IFIgKyA0LFxuICAgICAgICAgICAgICBjdXJzb3I6IG5leHQgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGhvdmVyU3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMTI3LCAyMjcsIDI1NSwgMC4xKVwiIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBvblxuICAgICAgICAgICAgICAgICAgPyBDLndoaXRlXG4gICAgICAgICAgICAgICAgICA6IG5leHRcbiAgICAgICAgICAgICAgICAgICAgPyBLSU5EX0NPTE9SW24ua2luZF1cbiAgICAgICAgICAgICAgICAgICAgOiBcInJnYmEoMTI3LCAyMjcsIDI1NSwgMC40KVwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7KHRhcmdldCA9PT0gXCJyaWdcIiA/IFJJR19TSE9SVCA6IFNIT1JUKVtuLmtpbmRdfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIGtpbmRzIHRoaXMgdGFyZ2V0J3MgYm9hcmQgdXNlcywgZm9yIHRoZSBsZWdlbmQuICovXG5leHBvcnQgZnVuY3Rpb24gbGVnZW5kKFxuICB0YXJnZXQ6IEJlbmNoVGFyZ2V0LFxuKTogeyBraW5kOiBOb2RlS2luZDsgbmFtZTogc3RyaW5nIH1bXSB7XG4gIGNvbnN0IGtpbmRzOiBOb2RlS2luZFtdID0gW1xuICAgIFwiZGFtYWdlXCIsXG4gICAgXCJjYXBhY2l0eVwiLFxuICAgIFwicmVsb2FkXCIsXG4gICAgXCJzcGVjaWFsXCIsXG4gICAgXCJlbXB0eVwiLFxuICBdO1xuICByZXR1cm4ga2luZHMubWFwKChraW5kKSA9PiAoeyBraW5kLCBuYW1lOiBTVEFUX05BTUVTW3RhcmdldF1ba2luZF0gfSkpO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5cbi8qKiBUaGUgYmlnIGhvbG9ncmFtcycgYnVpbGRpbmcgYmxvY2tzOiBjb3JuZXIgYnJhY2tldHMsIGEgdGFiIGJhciwgYnV0dG9ucyxcbiAqICBzZWdtZW50ZWQgYmFycywgYSB0aWNrLiBFdmVyeXRoaW5nIGlzIHRoaW4gbGlnaHQgb24gZGFyayBnbGFzcy4gKi9cblxuLyoqIFNob3J0IGJyaWdodCBicmFja2V0cyBvbiBhIGJveCdzIGZvdXIgY29ybmVycyAocHV0IGluc2lkZSBhXG4gKiAgYHBvc2l0aW9uVHlwZTogXCJyZWxhdGl2ZVwiYCBib3gpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvcm5lcnMoe1xuICBzaXplID0gMTgsXG4gIHdpZHRoID0gMixcbiAgY29sb3IgPSBDLmN5YW4sXG59OiB7XG4gIHNpemU/OiBudW1iZXI7XG4gIHdpZHRoPzogbnVtYmVyO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgY29uc3QgYXJtID0gKHN0eWxlOiBCZXZ5U3R5bGUpID0+IChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIGJhY2tncm91bmRDb2xvcjogY29sb3IsIC4uLnN0eWxlIH19XG4gICAgLz5cbiAgKTtcbiAgY29uc3QgaCA9IHsgd2lkdGg6IHNpemUsIGhlaWdodDogd2lkdGggfTtcbiAgY29uc3QgdiA9IHsgd2lkdGgsIGhlaWdodDogc2l6ZSB9O1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7YXJtKHsgLi4uaCwgbGVmdDogLTEsIHRvcDogLTEgfSl9XG4gICAgICB7YXJtKHsgLi4udiwgbGVmdDogLTEsIHRvcDogLTEgfSl9XG4gICAgICB7YXJtKHsgLi4uaCwgcmlnaHQ6IC0xLCB0b3A6IC0xIH0pfVxuICAgICAge2FybSh7IC4uLnYsIHJpZ2h0OiAtMSwgdG9wOiAtMSB9KX1cbiAgICAgIHthcm0oeyAuLi5oLCBsZWZ0OiAtMSwgYm90dG9tOiAtMSB9KX1cbiAgICAgIHthcm0oeyAuLi52LCBsZWZ0OiAtMSwgYm90dG9tOiAtMSB9KX1cbiAgICAgIHthcm0oeyAuLi5oLCByaWdodDogLTEsIGJvdHRvbTogLTEgfSl9XG4gICAgICB7YXJtKHsgLi4udiwgcmlnaHQ6IC0xLCBib3R0b206IC0xIH0pfVxuICAgIDwvPlxuICApO1xufVxuXG4vKiogQSBob2xvZ3JhbSdzIG91dGVyIHNoZWxsOiBkYXJrIGdsYXNzLCBhIGhhaXJsaW5lIGZyYW1lLCBjb3JuZXJcbiAqICBicmFja2V0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTaGVsbCh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAyOCwgdmVydGljYWw6IDIwIH0sXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDMsIDE0LCAyMiwgMC43OClcIixcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogQy5jeWFuTGluZSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPENvcm5lcnMgc2l6ZT17MzR9IHdpZHRoPXszfSAvPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgaG9yaXpvbnRhbCBoYWlybGluZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSdWxlKHsgY29sb3IgPSBDLmN5YW5MaW5lIH06IHsgY29sb3I/OiBzdHJpbmcgfSkge1xuICByZXR1cm4gPG5vZGUgc3R5bGU9e3sgaGVpZ2h0OiAxLCBmbGV4U2hyaW5rOiAwLCBiYWNrZ3JvdW5kQ29sb3I6IGNvbG9yIH19IC8+O1xufVxuXG4vKiogQSByb3cgb2YgdGFiczsgdGhlIGFjdGl2ZSBvbmUgaXMgd2hpdGUgb3ZlciBhIGxpdCB1bmRlcmxpbmUuICovXG5leHBvcnQgZnVuY3Rpb24gVGFiczxUIGV4dGVuZHMgc3RyaW5nPih7XG4gIHRhYnMsXG4gIGFjdGl2ZSxcbiAgb25QaWNrLFxuICBkaXNhYmxlZCA9IFtdLFxufToge1xuICB0YWJzOiByZWFkb25seSB7IGlkOiBUOyBsYWJlbDogc3RyaW5nIH1bXTtcbiAgYWN0aXZlOiBUO1xuICBvblBpY2s6IChpZDogVCkgPT4gdm9pZDtcbiAgZGlzYWJsZWQ/OiByZWFkb25seSBUW107XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiA2IH19PlxuICAgICAge3RhYnMubWFwKCh7IGlkLCBsYWJlbCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IG9uID0gaWQgPT09IGFjdGl2ZTtcbiAgICAgICAgY29uc3Qgb2ZmID0gZGlzYWJsZWQuaW5jbHVkZXMoaWQpO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGtleT17aWR9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiAhb2ZmICYmIG9uUGljayhpZCl9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDIyLCB2ZXJ0aWNhbDogOCB9LFxuICAgICAgICAgICAgICBib3JkZXI6IHsgYm90dG9tOiAyIH0sXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBvbiA/IEMuY3lhbiA6IEMuY2xlYXIsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogb24gPyBDLmN5YW5GYWludCA6IEMuY2xlYXIsXG4gICAgICAgICAgICAgIGN1cnNvcjogb2ZmID8gXCJkZWZhdWx0XCIgOiBcInBvaW50ZXJcIixcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBob3ZlclN0eWxlPXtcbiAgICAgICAgICAgICAgb2ZmID8gdW5kZWZpbmVkIDogeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjA5KVwiIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIC4uLlQubGFiZWwsXG4gICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMi41LFxuICAgICAgICAgICAgICAgIGNvbG9yOiBvZmYgPyBDLmN5YW5EZWVwIDogb24gPyBDLndoaXRlIDogQy5jeWFuRGltLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7bGFiZWx9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICk7XG4gICAgICB9KX1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBBIGZyYW1lZCB0ZXh0IGJ1dHRvbi4gYHRvbmVgIGNvbG9ycyBpdHMgbGluZSBhbmQgbGFiZWwuICovXG5leHBvcnQgZnVuY3Rpb24gSG9sb0J1dHRvbih7XG4gIGxhYmVsLFxuICBvbkNsaWNrLFxuICB0b25lID0gQy5jeWFuLFxuICBkaXNhYmxlZCA9IGZhbHNlLFxuICB3aWRlID0gZmFsc2UsXG59OiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIHRvbmU/OiBzdHJpbmc7XG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgd2lkZT86IGJvb2xlYW47XG59KSB7XG4gIGNvbnN0IGNvbG9yID0gZGlzYWJsZWQgPyBDLmN5YW5EZWVwIDogdG9uZTtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAyOCwgdmVydGljYWw6IDkgfSxcbiAgICAgICAgbWluV2lkdGg6IHdpZGUgPyAyMjAgOiAwLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogY29sb3IsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDQsIDE4LCAyOCwgMC41KVwiLFxuICAgICAgICBjdXJzb3I6IGRpc2FibGVkID8gXCJkZWZhdWx0XCIgOiBcInBvaW50ZXJcIixcbiAgICAgIH19XG4gICAgICBob3ZlclN0eWxlPXtcbiAgICAgICAgZGlzYWJsZWQgPyB1bmRlZmluZWQgOiB7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMTgpXCIgfVxuICAgICAgfVxuICAgICAgcHJlc3NTdHlsZT17XG4gICAgICAgIGRpc2FibGVkID8gdW5kZWZpbmVkIDogeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjM0KVwiIH1cbiAgICAgIH1cbiAgICA+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgZm9udFNpemU6IDE5LFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6IDMsXG4gICAgICAgICAgY29sb3IsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bGFiZWx9XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBBIGJhciBvZiBgc2VnbWVudHNgIGNlbGxzLCBgdmFsdWVgICgwLi4xKSBvZiB0aGVtIGxpdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCYXIoe1xuICB2YWx1ZSxcbiAgc2VnbWVudHMgPSAxMCxcbiAgY29sb3IgPSBDLmN5YW4sXG4gIHdpZHRoID0gMTgwLFxuICBoZWlnaHQgPSA5LFxufToge1xuICB2YWx1ZTogbnVtYmVyO1xuICBzZWdtZW50cz86IG51bWJlcjtcbiAgY29sb3I/OiBzdHJpbmc7XG4gIHdpZHRoPzogbnVtYmVyO1xuICBoZWlnaHQ/OiBudW1iZXI7XG59KSB7XG4gIGNvbnN0IGxpdCA9IE1hdGgucm91bmQodmFsdWUgKiBzZWdtZW50cyk7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAyLCB3aWR0aCwgaGVpZ2h0IH19PlxuICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IHNlZ21lbnRzIH0sIChfLCBpKSA9PiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAga2V5PXtpfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogaSA8IGxpdCA/IGNvbG9yIDogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMTIpXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICkpfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIEEgc21hbGwgdGljayAodGhlIGZvbnRzIGhhdmUgbm8g4pyTKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUaWNrKHtcbiAgY29sb3IgPSBDLmdyZWVuLFxuICBzaXplID0gMTYsXG59OiB7XG4gIGNvbG9yPzogc3RyaW5nO1xuICBzaXplPzogbnVtYmVyO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCAxNiAxNlwiIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUgfX0+XG4gICAgICA8cG9seWxpbmVcbiAgICAgICAgcG9pbnRzPXtbMi41LCA4LjUsIDYuNSwgMTIuNSwgMTMuNSwgMy41XX1cbiAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICBzdHJva2U9e2NvbG9yfVxuICAgICAgICBzdHJva2VXaWR0aD17Mi4yfVxuICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgIC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgQyB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuXG4vKiogVGhlIGZyZWlnaHQgbGlmdCdzIHN0b3BzIChSdXN0J3MgZWxldmF0b3Igb25seSBrbm93cyB0aGUgbnVtYmVycykuICovXG5leHBvcnQgY29uc3QgRkxPT1JTID0gW1xuICB7IGZsb29yOiAxLCBuYW1lOiBcIkhZRFJPUE9OSUNTXCIgfSxcbiAgeyBmbG9vcjogMiwgbmFtZTogXCJDT05DT1VSU0UgQ1wiIH0sXG4gIHsgZmxvb3I6IDMsIG5hbWU6IFwiSUNFIFJFRklORVJZXCIgfSxcbiAgeyBmbG9vcjogNCwgbmFtZTogXCJDT01NQU5EXCIgfSxcbl0gYXMgY29uc3Q7XG5cbi8qKiBBIHNvbGlkIHRyaWFuZ2xlIHBvaW50aW5nIHVwIG9yIGRvd24uICovXG5leHBvcnQgZnVuY3Rpb24gQXJyb3coe1xuICB1cCxcbiAgc2l6ZSxcbiAgY29sb3IgPSBDLmFtYmVyLFxufToge1xuICB1cDogYm9vbGVhbjtcbiAgc2l6ZTogbnVtYmVyO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTIgMTBcIiBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiAoc2l6ZSAqIDEwKSAvIDEyIH19PlxuICAgICAgPHBvbHlnb25cbiAgICAgICAgcG9pbnRzPXt1cCA/IFs2LCAwLCAxMiwgMTAsIDAsIDEwXSA6IFswLCAwLCAxMiwgMCwgNiwgMTBdfVxuICAgICAgICBmaWxsPXtjb2xvcn1cbiAgICAgIC8+XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgY2FsbCB9IGZyb20gXCIuLi9nYW1lL2FjdFwiO1xuaW1wb3J0IHsgdXNlR2FtZSB9IGZyb20gXCIuLi9nYW1lL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBIb2xvIH0gZnJvbSBcIi4vSG9sb1wiO1xuaW1wb3J0IHsgQXJyb3csIEZMT09SUyB9IGZyb20gXCIuL2ZpeHR1cmVzL2Zsb29yc1wiO1xuaW1wb3J0IHsgdXNlQmxpbmsgfSBmcm9tIFwiLi9zdWl0L2xvb3BzXCI7XG5cbi8qKiBUaGUgZnJlaWdodCBlbGV2YXRvcidzIGNhbGwgcGFuZWwgYmVzaWRlIGl0cyBkb29yICgyNDAgw5cgMzYwKTogYSBidXR0b25cbiAqICBwZXIgZmxvb3IsIHRoZSBjYXIncyBmbG9vciBtYXJrZWQsIGEgY2FsbGVkIGZsb29yIGJsaW5raW5nIHVudGlsIHRoZSBjYXJcbiAqICBhcnJpdmVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVsZXZhdG9yKCkge1xuICBjb25zdCB7IGZsb29yLCB0YXJnZXQgfSA9IHVzZUdhbWUoKGcpID0+IGcuZml4dHVyZXMuZWxldmF0b3IpO1xuICBjb25zdCBibGluayA9IHVzZUJsaW5rKHRhcmdldCAhPT0gbnVsbCwgMzIwLCAwLjI1KTtcblxuICByZXR1cm4gKFxuICAgIDxIb2xvIG5hbWU9XCJlbGV2YXRvclwiIHNlZWQ9ezE5fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuZ2xhc3MsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmN5YW5MaW5lLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBoZWlnaHQ6IDQ4LFxuICAgICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBnYXA6IDEwLFxuICAgICAgICAgICAgYm9yZGVyOiB7IGJvdHRvbTogMSB9LFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuY3lhbkxpbmUsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmRpc3BsYXksXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxOSxcbiAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMyxcbiAgICAgICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBMSUZUXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLnNtYWxsLCBjb2xvcjogQy5jeWFuIH19PkMtMjwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICBnYXA6IDYsXG4gICAgICAgICAgICBwYWRkaW5nOiA4LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7Wy4uLkZMT09SU10ucmV2ZXJzZSgpLm1hcCgoZikgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGVyZSA9IGYuZmxvb3IgPT09IGZsb29yICYmIHRhcmdldCA9PT0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlZCA9IGYuZmxvb3IgPT09IHRhcmdldDtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBrZXk9e2YuZmxvb3J9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gY2FsbChmLmZsb29yKX1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgIGdhcDogMTAsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDggfSxcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBoZXJlID8gQy53aGl0ZSA6IGNhbGxlZCA/IEMuYW1iZXIgOiBDLmN5YW5GYWludCxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogaGVyZSA/IEMuZ2xhc3NIaSA6IEMuY2xlYXIsXG4gICAgICAgICAgICAgICAgICAuLi4oY2FsbGVkID8geyBvcGFjaXR5OiB7IGFuaW1hdGVkOiBibGluayB9IH0gOiB7fSksXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBob3ZlclN0eWxlPXtob3Zlcn1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogNTAsXG4gICAgICAgICAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBoZXJlID8gQy53aGl0ZSA6IEMuY3lhbkRpbSxcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmRpc3BsYXksXG4gICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDI4LFxuICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBoZXJlID8gQy53aGl0ZSA6IGNhbGxlZCA/IEMuYW1iZXIgOiBDLmN5YW4sXG4gICAgICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7Zi5mbG9vcn1cbiAgICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiB9fT5cbiAgICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNyxcbiAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBoZXJlID8gQy53aGl0ZSA6IEMuY3lhbixcbiAgICAgICAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtmLm5hbWV9XG4gICAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgICAgICB7KGhlcmUgfHwgY2FsbGVkKSAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgLi4uc21hbGwsIGNvbG9yOiBjYWxsZWQgPyBDLmFtYmVyIDogQy53aGl0ZSB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2hlcmUgPyBcIkNBUiBIRVJFXCIgOiBcIkNBTExFRFwifVxuICAgICAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGhlaWdodDogMzgsXG4gICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGdhcDogOCxcbiAgICAgICAgICAgIGJvcmRlcjogeyB0b3A6IDEgfSxcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmN5YW5MaW5lLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dGFyZ2V0ICE9PSBudWxsICYmIDxBcnJvdyB1cD17dGFyZ2V0ID4gZmxvb3J9IHNpemU9ezE0fSAvPn1cbiAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgc3R5bGU9e3sgLi4uc21hbGwsIGNvbG9yOiB0YXJnZXQgIT09IG51bGwgPyBDLmFtYmVyIDogQy5jeWFuRGltIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge3RhcmdldCAhPT0gbnVsbCA/IFwiSU4gVFJBTlNJVFwiIDogXCJTVEFORElORyBCWVwifVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgPC9ub2RlPlxuICAgIDwvSG9sbz5cbiAgKTtcbn1cblxuY29uc3Qgc21hbGw6IEJldnlTdHlsZSA9IHtcbiAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgZm9udFNpemU6IDE0LFxuICBsZXR0ZXJTcGFjaW5nOiAxLjUsXG4gIGNvbG9yOiBDLmN5YW5EaW0sXG4gIGxpbmVCcmVhazogXCJub1dyYXBcIixcbn07XG5cbmNvbnN0IGhvdmVyOiBCZXZ5U3R5bGUgPSB7XG4gIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMilcIixcbiAgYm9yZGVyQ29sb3I6IEMuY3lhbixcbn07XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1xuICBpbnRlcnBvbGF0ZSxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhSZXBlYXQsXG4gIHdpdGhUaW1pbmcsXG59IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyB1c2VHYW1lIH0gZnJvbSBcIi4uL2dhbWUvc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEhvbG8gfSBmcm9tIFwiLi9Ib2xvXCI7XG5pbXBvcnQgeyBBcnJvdywgRkxPT1JTIH0gZnJvbSBcIi4vZml4dHVyZXMvZmxvb3JzXCI7XG5cbi8qKiBUaGUgZmxvb3IgaW5kaWNhdG9yIG92ZXIgdGhlIGVsZXZhdG9yIGRvb3IgKDI0MCDDlyA4MCk6IHdoZXJlIHRoZSBjYXIgaXMsXG4gKiAgYW5kIGFuIGFycm93IHJ1bm5pbmcgdGhlIHdheSBpdCBnb2VzIHdoaWxlIGl0IG1vdmVzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZsb29yKCkge1xuICBjb25zdCB7IGZsb29yLCB0YXJnZXQgfSA9IHVzZUdhbWUoKGcpID0+IGcuZml4dHVyZXMuZWxldmF0b3IpO1xuICBjb25zdCBtb3ZpbmcgPSB0YXJnZXQgIT09IG51bGw7XG4gIGNvbnN0IHVwID0gbW92aW5nICYmIHRhcmdldCA+IGZsb29yO1xuICBjb25zdCBuYW1lID0gRkxPT1JTLmZpbmQoKGYpID0+IGYuZmxvb3IgPT09IGZsb29yKT8ubmFtZSA/PyBcIlwiO1xuXG4gIGNvbnN0IHJ1biA9IHVzZVNoYXJlZFZhbHVlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJ1bi52YWx1ZSA9IG1vdmluZ1xuICAgICAgPyB3aXRoUmVwZWF0KHdpdGhUaW1pbmcoMSwgeyBkdXJhdGlvbjogNTIwLCBlYXNpbmc6IFwiZWFzZUluXCIgfSkpXG4gICAgICA6IHdpdGhUaW1pbmcoMCwgeyBkdXJhdGlvbjogMCB9KTtcbiAgfSwgW21vdmluZywgcnVuXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8SG9sb1xuICAgICAgbmFtZT1cImZsb29yXCJcbiAgICAgIHNlZWQ9ezIzfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMTQsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5nbGFzcyxcbiAgICAgICAgYm9yZGVyOiB7IHRvcDogMSwgYm90dG9tOiAxIH0sXG4gICAgICAgIGJvcmRlckNvbG9yOiBDLmN5YW5MaW5lLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAyMixcbiAgICAgICAgICBoZWlnaHQ6IDQwLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgb3ZlcmZsb3dYOiBcImNsaXBcIixcbiAgICAgICAgICBvdmVyZmxvd1k6IFwiY2xpcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7bW92aW5nICYmIChcbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlWToge1xuICAgICAgICAgICAgICAgICAgYW5pbWF0ZWQ6IGludGVycG9sYXRlKFxuICAgICAgICAgICAgICAgICAgICBydW4sXG4gICAgICAgICAgICAgICAgICAgIFswLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgdXAgPyBbMTQsIC0xNF0gOiBbLTE0LCAxNF0sXG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxBcnJvdyB1cD17dXB9IHNpemU9ezE4fSAvPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udEZhbWlseTogRi5kaXNwbGF5LFxuICAgICAgICAgIGZvbnRTaXplOiA0MixcbiAgICAgICAgICBjb2xvcjogbW92aW5nID8gQy5hbWJlciA6IEMud2hpdGUsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7Zmxvb3J9XG4gICAgICA8L3RleHQ+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCB3aWR0aDogMTEwIH19PlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgZm9udFNpemU6IDEzLFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge25hbWV9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udEZhbWlseTogRi5yZWd1bGFyLFxuICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgY29sb3I6IG1vdmluZyA/IEMuYW1iZXIgOiBDLmN5YW5EaW0sXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHttb3ZpbmcgPyBgVE8gREVDSyAke3RhcmdldH1gIDogXCJGUkVJR0hUIExJRlRcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvSG9sbz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgdXNlR2FtZSB9IGZyb20gXCIuLi9nYW1lL3N0b3JlXCI7XG5pbXBvcnQgeyB1c2VEZWJ1ZywgdXNlS2V5cyB9IGZyb20gXCIuLi9ob29rc1wiO1xuaW1wb3J0IHsgY3VlIH0gZnJvbSBcIi4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBIb2xvLCB1c2VIZWxkIH0gZnJvbSBcIi4vSG9sb1wiO1xuaW1wb3J0IHsgRElBTCwgRGlhbCB9IGZyb20gXCIuL2hhY2svRGlhbFwiO1xuaW1wb3J0IHsgVFVNQkxFUlMsIHVzZUJ5cGFzcyB9IGZyb20gXCIuL2hhY2svdXNlQnlwYXNzXCI7XG5cbi8qKiBUaGUgYnVsa2hlYWQncyBieXBhc3MgcGFuZWwgKDQyMCDDlyA0MjApOiBtb3ZlIHRoZSBjdXJzb3IgYXJvdW5kIHRoZSBkaWFsXG4gKiAgdG8gdHVybiB0aGUgcGljayB1bnRpbCB0aGUgZGlhbCBhbnN3ZXJzLCB0aGVuIHRyeSAoYSBjbGljaywgb3IgRSkuIFRocmVlXG4gKiAgdHVtYmxlcnMgYmVmb3JlIHRoZSBjbG9jayBydW5zIG91dDsgaXQgcnVucyBvbmx5IHdoaWxlIHRoZSBjYW1lcmEgaXMgb25cbiAqICB0aGUgcGFuZWwuICovXG5leHBvcnQgZnVuY3Rpb24gSGFjaygpIHtcbiAgY29uc3QgaGVsZCA9IHVzZUhlbGQoXCJoYWNrXCIpO1xuICBjb25zdCB1bmxvY2tlZCA9IHVzZUdhbWUoKGcpID0+IGcuZml4dHVyZXMuZG9vciAhPT0gXCJsb2NrZWRcIik7XG4gIGNvbnN0IGJ5cGFzcyA9IHVzZUJ5cGFzcyhoZWxkLCB1bmxvY2tlZCk7XG4gIGNvbnN0IHsgYW5nbGUsIHNvbHZlZCwgdGltZSwgbmVhciwgZG9uZSB9ID0gYnlwYXNzO1xuXG4gIHVzZUtleXMoaGVsZCwgKGUpID0+IHtcbiAgICBpZiAoZS5jb2RlID09PSBcIktleUVcIikgYnlwYXNzLmF0dGVtcHQoKTtcbiAgfSk7XG4gIHVzZURlYnVnKFwiaGFja1wiLCAoYXJnKSA9PiB7XG4gICAgY29uc3QgW3ZlcmIsIHZhbHVlXSA9IGFyZy5zcGxpdChcIiBcIik7XG4gICAgaWYgKHZlcmIgPT09IFwic29sdmVcIikgYnlwYXNzLnNvbHZlKCk7XG4gICAgZWxzZSBpZiAodmVyYiA9PT0gXCJhbmdsZVwiKSBieXBhc3MucG9pbnQoTnVtYmVyKHZhbHVlKSk7XG4gIH0pO1xuXG4gIC8vIEEgZmFpbnQgdGljayBlYWNoIHRpbWUgdGhlIHBpY2sgY29tZXMgYSBzdGVwIG5lYXJlci5cbiAgY29uc3Qgc3RlcCA9IE1hdGguZmxvb3IobmVhciAqIDYpO1xuICBjb25zdCBsYXN0ID0gdXNlUmVmKHN0ZXApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzdGVwID4gbGFzdC5jdXJyZW50ICYmIHN0ZXAgPj0gMykgY3VlKFwiaGFja1RpY2tcIik7XG4gICAgbGFzdC5jdXJyZW50ID0gc3RlcDtcbiAgfSwgW3N0ZXBdKTtcblxuICBjb25zdCBsb3cgPSB0aW1lIDwgNiAmJiAhZG9uZTtcbiAgY29uc3Qgc3RhdHVzID0gZG9uZVxuICAgID8gXCJCWVBBU1MgQ09NUExFVEVcIlxuICAgIDogYFRVTUJMRVIgJHtzb2x2ZWQgKyAxfSAvICR7VFVNQkxFUlN9YDtcbiAgcmV0dXJuIChcbiAgICA8SG9sb1xuICAgICAgbmFtZT1cImhhY2tcIlxuICAgICAgc2VlZD17Mjl9XG4gICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiIH19XG4gICAgPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgaGVpZ2h0OiA1MixcbiAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDIyIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuZGlzcGxheSxcbiAgICAgICAgICAgIGZvbnRTaXplOiAxNyxcbiAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDMsXG4gICAgICAgICAgICBjb2xvcjogZG9uZSA/IEMuZ3JlZW4gOiBDLmN5YW4sXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIEJZUEFTU1xuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuZGlzcGxheSxcbiAgICAgICAgICAgIGZvbnRTaXplOiAyMixcbiAgICAgICAgICAgIGNvbG9yOiBkb25lID8gQy5ncmVlbiA6IGxvdyA/IEMucmVkIDogQy53aGl0ZSxcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2RvbmUgPyBcIi0tLi1cIiA6IHRpbWUudG9GaXhlZCgxKS5wYWRTdGFydCg0LCBcIjBcIil9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiBESUFMLCBoZWlnaHQ6IERJQUwgfX1cbiAgICAgICAgb25Qb2ludGVySG92ZXI9eyhlKSA9PiB7XG4gICAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgICBjb25zdCBkZWcgPSAoTWF0aC5hdGFuMihlLnggLSAwLjUsIDAuNSAtIGUueSkgKiAxODApIC8gTWF0aC5QSTtcbiAgICAgICAgICBieXBhc3MucG9pbnQoZGVnKTtcbiAgICAgICAgfX1cbiAgICAgICAgb25DbGljaz17YnlwYXNzLmF0dGVtcHR9XG4gICAgICA+XG4gICAgICAgIDxEaWFsIGFuZ2xlPXthbmdsZX0gc29sdmVkPXtzb2x2ZWR9IG5lYXI9e25lYXJ9IGRvbmU9e2RvbmV9IC8+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICBmbGV4R3JvdzogMSxcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgZ2FwOiA2LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAzLFxuICAgICAgICAgICAgY29sb3I6IGRvbmUgPyBDLmdyZWVuIDogQy53aGl0ZSxcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3N0YXR1c31cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICB7IWRvbmUgJiYgKFxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IHdpZHRoOiAyNDAsIGhlaWdodDogNCwgYmFja2dyb3VuZENvbG9yOiBDLmN5YW5EZWVwIH19PlxuICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogYCR7bmVhciAqIDEwMH0lYCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogbmVhciA+IDAuODUgPyBDLndoaXRlIDogQy5jeWFuLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgICl9XG4gICAgICAgIDx0ZXh0IHN0eWxlPXtoaW50fT5cbiAgICAgICAgICB7ZG9uZVxuICAgICAgICAgICAgPyBcIkJVTEtIRUFEIEMtRCBSRUxFQVNFRFwiXG4gICAgICAgICAgICA6IGBSRVNPTkFOQ0UgJHtNYXRoLnJvdW5kKG5lYXIgKiAxMDApfSVgfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9Ib2xvPlxuICApO1xufVxuXG5jb25zdCBoaW50OiBCZXZ5U3R5bGUgPSB7XG4gIGZvbnRGYW1pbHk6IEYucmVndWxhcixcbiAgZm9udFNpemU6IDEyLFxuICBsZXR0ZXJTcGFjaW5nOiAxLjUsXG4gIGNvbG9yOiBDLmN5YW5EaW0sXG4gIGxpbmVCcmVhazogXCJub1dyYXBcIixcbn07XG4iLCAiLyoqIENpcmNsZSBnZW9tZXRyeSBmb3IgdGhlIHJvdW5kIGhvbG9ncmFtcyAoc3Rhc2lzLCBsb2NrLCBoYWNrKS4gQW5nbGVzIGluXG4gKiAgZGVncmVlcywgMCBhdCB0aGUgdG9wLCBncm93aW5nIGNsb2Nrd2lzZSAoc2NyZWVuIHkgcG9pbnRzIGRvd24pLiAqL1xuXG4vKiogVGhlIHBvaW50IGF0IGBkZWdgIG9uIHRoZSBjaXJjbGUgb2YgcmFkaXVzIGByYCBhcm91bmQgKGBjeGAsIGBjeWApLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvbGFyKGN4OiBudW1iZXIsIGN5OiBudW1iZXIsIHI6IG51bWJlciwgZGVnOiBudW1iZXIpIHtcbiAgY29uc3QgYSA9ICgoZGVnIC0gOTApICogTWF0aC5QSSkgLyAxODA7XG4gIHJldHVybiBbY3ggKyByICogTWF0aC5jb3MoYSksIGN5ICsgciAqIE1hdGguc2luKGEpXSBhcyBjb25zdDtcbn1cblxuLyoqIEFuIFNWRyBwYXRoIGZvciB0aGUgYXJjIG9mIHJhZGl1cyBgcmAgZnJvbSBgZnJvbWAgdG8gYHRvYCBkZWdyZWVzXG4gKiAgKGNsb2Nrd2lzZTsgYHRvYCA+IGBmcm9tYCkuICovXG5leHBvcnQgZnVuY3Rpb24gYXJjKFxuICBjeDogbnVtYmVyLFxuICBjeTogbnVtYmVyLFxuICByOiBudW1iZXIsXG4gIGZyb206IG51bWJlcixcbiAgdG86IG51bWJlcixcbik6IHN0cmluZyB7XG4gIGNvbnN0IFt4MCwgeTBdID0gcG9sYXIoY3gsIGN5LCByLCBmcm9tKTtcbiAgY29uc3QgW3gxLCB5MV0gPSBwb2xhcihjeCwgY3ksIHIsIHRvKTtcbiAgY29uc3QgbGFyZ2UgPSB0byAtIGZyb20gPiAxODAgPyAxIDogMDtcbiAgcmV0dXJuIGBNJHt4MC50b0ZpeGVkKDIpfSAke3kwLnRvRml4ZWQoMil9IEEke3J9ICR7cn0gMCAke2xhcmdlfSAxICR7eDEudG9GaXhlZCgyKX0gJHt5MS50b0ZpeGVkKDIpfWA7XG59XG5cbi8qKiBgZGVnYCB3cmFwcGVkIGludG8gMC4uMzYwLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXAoZGVnOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKChkZWcgJSAzNjApICsgMzYwKSAlIDM2MDtcbn1cblxuLyoqIFRoZSBzaG9ydGVzdCBhbmd1bGFyIGRpc3RhbmNlIGJldHdlZW4gdHdvIGFuZ2xlcywgMC4uMTgwLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlQmV0d2VlbihhOiBudW1iZXIsIGI6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGQgPSBNYXRoLmFicyh3cmFwKGEpIC0gd3JhcChiKSk7XG4gIHJldHVybiBkID4gMTgwID8gMzYwIC0gZCA6IGQ7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgc2hvY2ssIHVubG9jayB9IGZyb20gXCIuLi8uLi9nYW1lL2FjdFwiO1xuaW1wb3J0IHsgY3VlIH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBhbmdsZUJldHdlZW4sIHdyYXAgfSBmcm9tIFwiLi4vc3VpdC9hcmNzXCI7XG5cbi8qKiBUaHJlZSB0dW1ibGVycywgb25lIHRyeSBlYWNoIGF0IGEgdGltZS4gKi9cbmV4cG9ydCBjb25zdCBUVU1CTEVSUyA9IDM7XG4vKiogU2Vjb25kcyB0byBiZWF0IHRoZSBsb2NrLiAqL1xuZXhwb3J0IGNvbnN0IFRJTUUgPSAyMDtcbi8qKiBIb3cgY2xvc2UgdGhlIHBpY2sgbXVzdCBzaXQgdG8gYSB0dW1ibGVyJ3MgYW5nbGUsIGRlZ3JlZXMuICovXG5jb25zdCBUT0xFUkFOQ0UgPSAxMjtcbi8qKiBBIHdyb25nIHRyeSBjb3N0cyB0aGlzIG1hbnkgc2Vjb25kcy4gKi9cbmNvbnN0IFBFTkFMVFkgPSAzO1xuXG5mdW5jdGlvbiByb2xsKCk6IG51bWJlcltdIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oeyBsZW5ndGg6IFRVTUJMRVJTIH0sICgpID0+XG4gICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKSxcbiAgKTtcbn1cblxuZXhwb3J0IHR5cGUgQnlwYXNzID0ge1xuICAvKiogVGhlIHBpY2ssIGRlZ3JlZXMgKDAgPSB1cCwgY2xvY2t3aXNlKS4gKi9cbiAgYW5nbGU6IG51bWJlcjtcbiAgLyoqIFR1bWJsZXJzIGxvY2tlZCBzbyBmYXIuICovXG4gIHNvbHZlZDogbnVtYmVyO1xuICAvKiogU2Vjb25kcyBsZWZ0LiAqL1xuICB0aW1lOiBudW1iZXI7XG4gIC8qKiAwLi4xOiBob3cgbmVhciB0aGUgcGljayBzaXRzIHRvIHRoZSBuZXh0IHR1bWJsZXIuICovXG4gIG5lYXI6IG51bWJlcjtcbiAgZG9uZTogYm9vbGVhbjtcbiAgcG9pbnQ6IChkZWc6IG51bWJlcikgPT4gdm9pZDtcbiAgLyoqIFRyeSB0aGUgY3VycmVudCB0dW1ibGVyIGF0IHRoZSBwaWNrJ3MgYW5nbGUuICovXG4gIGF0dGVtcHQ6ICgpID0+IHZvaWQ7XG4gIC8qKiBMb2NrIHRoZSBuZXh0IHR1bWJsZXIgb3V0cmlnaHQgKHRoZSBgaGFjayBzb2x2ZWAgdmVyYikuICovXG4gIHNvbHZlOiAoKSA9PiB2b2lkO1xufTtcblxuLyoqIFRoZSBieXBhc3MgbWluaWdhbWU6IGZpbmQgZWFjaCB0dW1ibGVyJ3MgaGlkZGVuIGFuZ2xlIGJ5IGZlZWwgKGBuZWFyYCksXG4gKiAgdGhlbiB0cnkgaXQuIEEgbWlzcyBzaG9ja3MgYW5kIGNvc3RzIHRpbWU7IHJ1bm5pbmcgb3V0IG9mIHRpbWUgc2hvY2tzXG4gKiAgYW5kIHJlc2V0cyB0aGUgbG9jazsgdGhlIHRoaXJkIHR1bWJsZXIgdW5sb2NrcyB0aGUgYnVsa2hlYWQuIFRoZSBjbG9ja1xuICogIHJ1bnMgb25seSB3aGlsZSBgcnVubmluZ2AuIEFscmVhZHkgYHVubG9ja2VkYCA9IGRvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQnlwYXNzKHJ1bm5pbmc6IGJvb2xlYW4sIHVubG9ja2VkOiBib29sZWFuKTogQnlwYXNzIHtcbiAgY29uc3QgW2FuZ2xlLCBzZXRBbmdsZV0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW3RhcmdldHMsIHNldFRhcmdldHNdID0gdXNlU3RhdGUocm9sbCk7XG4gIGNvbnN0IFtzb2x2ZWQsIHNldFNvbHZlZF0gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW3RpbWUsIHNldFRpbWVdID0gdXNlU3RhdGUoVElNRSk7XG4gIGNvbnN0IGRvbmUgPSB1bmxvY2tlZCB8fCBzb2x2ZWQgPj0gVFVNQkxFUlM7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJ1bm5pbmcgfHwgZG9uZSkgcmV0dXJuO1xuICAgIGNvbnN0IHQgPSBzZXRJbnRlcnZhbCgoKSA9PiBzZXRUaW1lKChzKSA9PiBNYXRoLm1heCgwLCBzIC0gMC4xKSksIDEwMCk7XG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwodCk7XG4gIH0sIFtydW5uaW5nLCBkb25lXSk7XG5cbiAgLy8gT3V0IG9mIHRpbWU6IHRoZSBwYW5lbCBiaXRlcyBhbmQgdGhlIGxvY2sgcmUtcm9sbHMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHRpbWUgPiAwIHx8IGRvbmUpIHJldHVybjtcbiAgICBzaG9jaygpO1xuICAgIHNldFRhcmdldHMocm9sbCgpKTtcbiAgICBzZXRTb2x2ZWQoMCk7XG4gICAgc2V0VGltZShUSU1FKTtcbiAgfSwgW3RpbWUsIGRvbmVdKTtcblxuICBjb25zdCBsb2NrID0gKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSBzb2x2ZWQgKyAxO1xuICAgIHNldFNvbHZlZChuZXh0KTtcbiAgICBjdWUoXCJoYWNrTG9ja1wiKTtcbiAgICBpZiAobmV4dCA+PSBUVU1CTEVSUykgdW5sb2NrKCk7XG4gIH07XG5cbiAgY29uc3QgdGFyZ2V0ID0gdGFyZ2V0c1tNYXRoLm1pbihzb2x2ZWQsIFRVTUJMRVJTIC0gMSldO1xuICByZXR1cm4ge1xuICAgIGFuZ2xlLFxuICAgIHNvbHZlZDogZG9uZSA/IFRVTUJMRVJTIDogc29sdmVkLFxuICAgIHRpbWUsXG4gICAgbmVhcjogZG9uZSA/IDAgOiBNYXRoLm1heCgwLCAxIC0gYW5nbGVCZXR3ZWVuKGFuZ2xlLCB0YXJnZXQpIC8gOTApLFxuICAgIGRvbmUsXG4gICAgcG9pbnQ6IChkZWcpID0+IHNldEFuZ2xlKHdyYXAoZGVnKSksXG4gICAgYXR0ZW1wdDogKCkgPT4ge1xuICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgIGlmIChhbmdsZUJldHdlZW4oYW5nbGUsIHRhcmdldCkgPD0gVE9MRVJBTkNFKSByZXR1cm4gbG9jaygpO1xuICAgICAgc2hvY2soKTtcbiAgICAgIHNldFRpbWUoKHMpID0+IE1hdGgubWF4KDAsIHMgLSBQRU5BTFRZKSk7XG4gICAgfSxcbiAgICBzb2x2ZTogKCkgPT4ge1xuICAgICAgaWYgKCFkb25lKSBsb2NrKCk7XG4gICAgfSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBDIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBhcmMsIHBvbGFyIH0gZnJvbSBcIi4uL3N1aXQvYXJjc1wiO1xuaW1wb3J0IHsgVFVNQkxFUlMgfSBmcm9tIFwiLi91c2VCeXBhc3NcIjtcblxuLyoqIFRoZSBkaWFsJ3Mgc2l6ZSwgbG9naWNhbCBweC4gKi9cbmV4cG9ydCBjb25zdCBESUFMID0gMzAwO1xuY29uc3QgUiA9IERJQUwgLyAyO1xuLyoqIFRoZSB0dW1ibGVyIHJpbmdzLCBvdXRlcm1vc3QgZmlyc3QuICovXG5jb25zdCBSSU5HUyA9IFsxMjIsIDEwNCwgODZdO1xuXG4vKiogTWl4IHR3byBgI3JyZ2diYmAgY29sb3JzLiAqL1xuZnVuY3Rpb24gbWl4KGE6IHN0cmluZywgYjogc3RyaW5nLCB0OiBudW1iZXIpOiBzdHJpbmcge1xuICBjb25zdCBjaCA9IChjOiBzdHJpbmcsIGk6IG51bWJlcikgPT5cbiAgICBwYXJzZUludChjLnNsaWNlKDEgKyBpICogMiwgMyArIGkgKiAyKSwgMTYpO1xuICBjb25zdCBvdXQgPSBbMCwgMSwgMl0ubWFwKChpKSA9PlxuICAgIE1hdGgucm91bmQoY2goYSwgaSkgKyAoY2goYiwgaSkgLSBjaChhLCBpKSkgKiB0KVxuICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgLnBhZFN0YXJ0KDIsIFwiMFwiKSxcbiAgKTtcbiAgcmV0dXJuIGAjJHtvdXQuam9pbihcIlwiKX1gO1xufVxuXG4vKiogVGhlIHJvdGFyeSBsb2NrOiBhIGJlemVsIG9mIHRpY2tzLCB0aHJlZSB0dW1ibGVyIHJpbmdzIChncmVlbiBvbmNlXG4gKiAgbG9ja2VkLCB0aGUgbmV4dCBvbmUgbGl0KSwgdGhlIHBpY2ssIGFuZCBhIGNvcmUgdGhhdCBzd2VsbHMgYXMgdGhlIHBpY2tcbiAqICBuZWFycyB0aGUgdHVtYmxlcidzIGFuZ2xlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERpYWwoe1xuICBhbmdsZSxcbiAgc29sdmVkLFxuICBuZWFyLFxuICBkb25lLFxufToge1xuICBhbmdsZTogbnVtYmVyO1xuICBzb2x2ZWQ6IG51bWJlcjtcbiAgbmVhcjogbnVtYmVyO1xuICBkb25lOiBib29sZWFuO1xufSkge1xuICBjb25zdCBwaWNrID0gbWl4KEMuY3lhbiwgQy53aGl0ZSwgbmVhcik7XG4gIGNvbnN0IGJveCA9IHsgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIHdpZHRoOiBESUFMLCBoZWlnaHQ6IERJQUwgfSBhcyBjb25zdDtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyB3aWR0aDogRElBTCwgaGVpZ2h0OiBESUFMIH19PlxuICAgICAgPHN2ZyB2aWV3Qm94PXtgMCAwICR7RElBTH0gJHtESUFMfWB9IHN0eWxlPXtib3h9PlxuICAgICAgICA8Y2lyY2xlIGN4PXtSfSBjeT17Un0gcj17MTQ2fSBmaWxsPVwicmdiYSgyLCA4LCAxMiwgMC41NSlcIiAvPlxuICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgY3g9e1J9XG4gICAgICAgICAgY3k9e1J9XG4gICAgICAgICAgcj17MTQ2fVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e0MuY3lhbkRpbX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MS41fVxuICAgICAgICAvPlxuICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogNjAgfSwgKF8sIGkpID0+IHtcbiAgICAgICAgICBjb25zdCBtYWpvciA9IGkgJSA1ID09PSAwO1xuICAgICAgICAgIGNvbnN0IFt4MCwgeTBdID0gcG9sYXIoUiwgUiwgMTQyLCBpICogNik7XG4gICAgICAgICAgY29uc3QgW3gxLCB5MV0gPSBwb2xhcihSLCBSLCBtYWpvciA/IDEzMSA6IDEzNywgaSAqIDYpO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGluZVxuICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgIHgxPXt4MH1cbiAgICAgICAgICAgICAgeTE9e3kwfVxuICAgICAgICAgICAgICB4Mj17eDF9XG4gICAgICAgICAgICAgIHkyPXt5MX1cbiAgICAgICAgICAgICAgc3Ryb2tlPXttYWpvciA/IEMuY3lhbiA6IEMuY3lhbkRpbX1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9e21ham9yID8gMiA6IDF9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgICB7UklOR1MubWFwKChyLCBpKSA9PiB7XG4gICAgICAgICAgY29uc3QgbG9ja2VkID0gaSA8IHNvbHZlZDtcbiAgICAgICAgICBjb25zdCBjdXJyZW50ID0gaSA9PT0gc29sdmVkICYmICFkb25lO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgICAgIGtleT17cn1cbiAgICAgICAgICAgICAgY3g9e1J9XG4gICAgICAgICAgICAgIGN5PXtSfVxuICAgICAgICAgICAgICByPXtyfVxuICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgIHN0cm9rZT17bG9ja2VkID8gQy5ncmVlbiA6IGN1cnJlbnQgPyBDLmN5YW4gOiBDLmN5YW5EZWVwfVxuICAgICAgICAgICAgICBzdHJva2VXaWR0aD17bG9ja2VkID8gNiA6IGN1cnJlbnQgPyAzIDogMn1cbiAgICAgICAgICAgICAgb3BhY2l0eT17bG9ja2VkIHx8IGN1cnJlbnQgPyAwLjk1IDogMC44fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgIDwvc3ZnPlxuICAgICAgey8qIFRoZSBwaWNrOiBhIG5lZWRsZSB0dXJuZWQgYnkgdGhlIG5vZGUncyB0cmFuc2Zvcm0gKG5vIHJlLXJhc3RlcikuICovfVxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PXtgMCAwICR7RElBTH0gJHtESUFMfWB9XG4gICAgICAgIHN0eWxlPXt7IC4uLmJveCwgdHJhbnNmb3JtOiB7IHJvdGF0ZTogYW5nbGUgfSB9fVxuICAgICAgPlxuICAgICAgICB7IWRvbmUgJiYgKFxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBkPXthcmMoUiwgUiwgUklOR1Nbc29sdmVkXSwgLTE0LCAxNCl9XG4gICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICBzdHJva2U9e3BpY2t9XG4gICAgICAgICAgICBzdHJva2VXaWR0aD17OX1cbiAgICAgICAgICAgIG9wYWNpdHk9e25lYXIgKiBuZWFyfVxuICAgICAgICAgIC8+XG4gICAgICAgICl9XG4gICAgICAgIDxsaW5lXG4gICAgICAgICAgeDE9e1J9XG4gICAgICAgICAgeTE9e1IgLSAzMH1cbiAgICAgICAgICB4Mj17Un1cbiAgICAgICAgICB5Mj17UiAtIDEzNH1cbiAgICAgICAgICBzdHJva2U9e3BpY2t9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezIuNSArIG5lYXIgKiAyfVxuICAgICAgICAvPlxuICAgICAgICA8cG9seWdvblxuICAgICAgICAgIHBvaW50cz17W1IsIFIgLSAxNDYsIFIgLSA3LCBSIC0gMTMyLCBSICsgNywgUiAtIDEzMl19XG4gICAgICAgICAgZmlsbD17cGlja31cbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPHN2ZyB2aWV3Qm94PXtgMCAwICR7RElBTH0gJHtESUFMfWB9IHN0eWxlPXtib3h9PlxuICAgICAgICA8Y2lyY2xlXG4gICAgICAgICAgY3g9e1J9XG4gICAgICAgICAgY3k9e1J9XG4gICAgICAgICAgcj17MjQgKyBuZWFyICogMTZ9XG4gICAgICAgICAgZmlsbD17ZG9uZSA/IEMuZ3JlZW4gOiBwaWNrfVxuICAgICAgICAgIG9wYWNpdHk9e2RvbmUgPyAwLjUgOiAwLjEyICsgbmVhciAqIG5lYXIgKiAwLjd9XG4gICAgICAgIC8+XG4gICAgICAgIDxjaXJjbGVcbiAgICAgICAgICBjeD17Un1cbiAgICAgICAgICBjeT17Un1cbiAgICAgICAgICByPXsyMn1cbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPXtkb25lID8gQy5ncmVlbiA6IEMuY3lhbn1cbiAgICAgICAgICBzdHJva2VXaWR0aD17Mn1cbiAgICAgICAgLz5cbiAgICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IFRVTUJMRVJTIH0sIChfLCBpKSA9PiAoXG4gICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgY3g9e1IgLSAxMiArIGkgKiAxMn1cbiAgICAgICAgICAgIGN5PXtSfVxuICAgICAgICAgICAgcj17My41fVxuICAgICAgICAgICAgZmlsbD17aSA8IHNvbHZlZCA/IEMuZ3JlZW4gOiBDLmN5YW5EaW19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L3N2Zz5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlR2FtZSB9IGZyb20gXCIuLi9nYW1lL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBIb2xvIH0gZnJvbSBcIi4vSG9sb1wiO1xuaW1wb3J0IHsgYXJjIH0gZnJvbSBcIi4vc3VpdC9hcmNzXCI7XG5pbXBvcnQgeyB1c2VTcGluIH0gZnJvbSBcIi4vc3VpdC9sb29wc1wiO1xuXG4vKiogVGhlIGJ1bGtoZWFkJ3MgbG9jayAoMjAwIMOXIDIwMCk6IHR1cm5pbmcgcmluZ3MgYXJvdW5kIGEgcGFkbG9jaywgcmVkXG4gKiAgd2hpbGUgc2VhbGVkLCBncmVlbiBvbmNlIHRoZSBieXBhc3Mgb3BlbmVkIGl0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIExvY2soKSB7XG4gIGNvbnN0IGRvb3IgPSB1c2VHYW1lKChnKSA9PiBnLmZpeHR1cmVzLmRvb3IpO1xuICBjb25zdCBsb2NrZWQgPSBkb29yID09PSBcImxvY2tlZFwiO1xuICBjb25zdCBjb2xvciA9IGxvY2tlZCA/IEMucmVkIDogQy5ncmVlbjtcbiAgY29uc3QgZGltID0gbG9ja2VkID8gQy5yZWREaW0gOiBDLmdyZWVuRGltO1xuICBjb25zdCBvdXRlciA9IHVzZVNwaW4oMTYpO1xuICBjb25zdCBpbm5lciA9IHVzZVNwaW4oLTkpO1xuICBjb25zdCByaW5nID0geyBwb3NpdGlvblR5cGU6IFwiYWJzb2x1dGVcIiwgd2lkdGg6IDIwMCwgaGVpZ2h0OiAyMDAgfSBhcyBjb25zdDtcblxuICByZXR1cm4gKFxuICAgIDxIb2xvXG4gICAgICBuYW1lPVwibG9ja1wiXG4gICAgICBzZWVkPXsxM31cbiAgICAgIHN0eWxlPXt7IGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiIH19XG4gICAgPlxuICAgICAgPHN2Z1xuICAgICAgICB2aWV3Qm94PVwiMCAwIDIwMCAyMDBcIlxuICAgICAgICBzdHlsZT17eyAuLi5yaW5nLCB0cmFuc2Zvcm06IHsgcm90YXRlOiB7IGFuaW1hdGVkOiBvdXRlciB9IH0gfX1cbiAgICAgID5cbiAgICAgICAge0FycmF5LmZyb20oeyBsZW5ndGg6IDggfSwgKF8sIGkpID0+IChcbiAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgZD17YXJjKDEwMCwgMTAwLCA5MiwgaSAqIDQ1ICsgNCwgaSAqIDQ1ICsgMzcpfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXtpICUgMiA/IDIgOiA1fVxuICAgICAgICAgICAgb3BhY2l0eT17aSAlIDIgPyAwLjUgOiAwLjl9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L3N2Zz5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD1cIjAgMCAyMDAgMjAwXCJcbiAgICAgICAgc3R5bGU9e3sgLi4ucmluZywgdHJhbnNmb3JtOiB7IHJvdGF0ZTogeyBhbmltYXRlZDogaW5uZXIgfSB9IH19XG4gICAgICA+XG4gICAgICAgIDxjaXJjbGVcbiAgICAgICAgICBjeD17MTAwfVxuICAgICAgICAgIGN5PXsxMDB9XG4gICAgICAgICAgcj17Nzh9XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17ZGltfVxuICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAgIC8+XG4gICAgICAgIHtbMCwgMTIwLCAyNDBdLm1hcCgoYSkgPT4gKFxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBrZXk9e2F9XG4gICAgICAgICAgICBkPXthcmMoMTAwLCAxMDAsIDc4LCBhIC0gOCwgYSArIDgpfVxuICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgc3Ryb2tlPXtjb2xvcn1cbiAgICAgICAgICAgIHN0cm9rZVdpZHRoPXs2fVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9zdmc+XG4gICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjAwIDIwMFwiIHN0eWxlPXtyaW5nfT5cbiAgICAgICAgPGNpcmNsZSBjeD17MTAwfSBjeT17MTAwfSByPXs1OH0gZmlsbD1cInJnYmEoMiwgOCwgMTIsIDAuNilcIiAvPlxuICAgICAgICB7LyogVGhlIHBhZGxvY2s6IGl0cyBzaGFja2xlIGxpZnRzIG9wZW4gb25jZSB1bmxvY2tlZC4gKi99XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD17XG4gICAgICAgICAgICBsb2NrZWRcbiAgICAgICAgICAgICAgPyBcIk04NCA5MiBMODQgNzggQTE2IDE2IDAgMCAxIDExNiA3OCBMMTE2IDkyXCJcbiAgICAgICAgICAgICAgOiBcIk04NCA4MCBMODQgNjYgQTE2IDE2IDAgMCAxIDExNiA2NiBMMTE2IDc0XCJcbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT17Y29sb3J9XG4gICAgICAgICAgc3Ryb2tlV2lkdGg9ezZ9XG4gICAgICAgIC8+XG4gICAgICAgIDxyZWN0IHg9ezc0fSB5PXs5Mn0gd2lkdGg9ezUyfSBoZWlnaHQ9ezM4fSByeD17NH0gZmlsbD17Y29sb3J9IC8+XG4gICAgICAgIDxyZWN0IHg9ezk3fSB5PXsxMDJ9IHdpZHRoPXs2fSBoZWlnaHQ9ezE0fSBmaWxsPVwiIzA1MDgwY1wiIC8+XG4gICAgICA8L3N2Zz5cbiAgICAgIDxub2RlIHN0eWxlPXt7IHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLCBib3R0b206IDQ4IH19PlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICBmb250U2l6ZTogMTcsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAzLFxuICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtsb2NrZWQgPyBcIkxPQ0tFRFwiIDogXCJVTkxPQ0tFRFwifVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9Ib2xvPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHJlYWQgfSBmcm9tIFwiLi4vZ2FtZS9hY3RcIjtcbmltcG9ydCB7IGNvdW50SXRlbSwgY3JlZGl0cyB9IGZyb20gXCIuLi9nYW1lL2l0ZW1zXCI7XG5pbXBvcnQgeyBMT0dTLCBPQkpFQ1RJVkVTIH0gZnJvbSBcIi4uL2dhbWUvbG9yZVwiO1xuaW1wb3J0IHsgb2JqZWN0aXZlIH0gZnJvbSBcIi4uL2dhbWUvcmVkdWNlXCI7XG5pbXBvcnQgeyBnZXRHYW1lLCB1c2VHYW1lIH0gZnJvbSBcIi4uL2dhbWUvc3RvcmVcIjtcbmltcG9ydCB7IHVzZURlYnVnIH0gZnJvbSBcIi4uL2hvb2tzXCI7XG5pbXBvcnQgeyBjdWUgfSBmcm9tIFwiLi4vc291bmRcIjtcbmltcG9ydCB7IEMsIEYsIFQgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEhvbG8sIHVzZUxpdmUgfSBmcm9tIFwiLi9Ib2xvXCI7XG5pbXBvcnQgeyBJbnZlbnRvcnkgfSBmcm9tIFwiLi9tZW51L0ludmVudG9yeVwiO1xuaW1wb3J0IHsgTG9ncyB9IGZyb20gXCIuL21lbnUvTG9nc1wiO1xuaW1wb3J0IHsgTWFwVGFiIH0gZnJvbSBcIi4vbWVudS9NYXBUYWJcIjtcbmltcG9ydCB7IE9iamVjdGl2ZXMgfSBmcm9tIFwiLi9tZW51L09iamVjdGl2ZXNcIjtcbmltcG9ydCB7IEJhciwgUnVsZSwgU2hlbGwsIFRhYnMgfSBmcm9tIFwiLi9zaGFyZWQva2l0XCI7XG5cbmNvbnN0IFRBQlMgPSBbXG4gIHsgaWQ6IFwiaW52ZW50b3J5XCIsIGxhYmVsOiBcIklOVkVOVE9SWVwiIH0sXG4gIHsgaWQ6IFwibWFwXCIsIGxhYmVsOiBcIk1BUFwiIH0sXG4gIHsgaWQ6IFwib2JqZWN0aXZlc1wiLCBsYWJlbDogXCJPQkpFQ1RJVkVTXCIgfSxcbiAgeyBpZDogXCJsb2dzXCIsIGxhYmVsOiBcIkxPR1NcIiB9LFxuXSBhcyBjb25zdDtcbnR5cGUgVGFiID0gKHR5cGVvZiBUQUJTKVtudW1iZXJdW1wiaWRcIl07XG5cbi8qKiBIb3cgbG9uZyBhbiBhdWRpbyBsb2cncyB0cmFuc21pc3Npb24gcGxheXMuICovXG5jb25zdCBQTEFZX01TID0gNDIwMDtcblxuLyoqIFRoZSBzdWl0J3MgUklHIG1lbnUsIHByb2plY3RlZCBpbiBmcm9udCBvZiB0aGUgZW5naW5lZXIgd2hpbGUgVGFiIGhhcyBpdFxuICogIHVwOiBoaXMgdml0YWxzIGFuZCBjcmVkaXRzLCB0aGVuIGZvdXIgcGFnZXMg4oCUIHRoZSBpbnZlbnRvcnksIHRoZSBkZWNrXG4gKiAgbWFwLCB0aGUgb2JqZWN0aXZlIGNoYWluIGFuZCB0aGUgbG9ncy4gQSBjbGljayBzd2l0Y2hlcyBwYWdlcywgZWFjaFxuICogIGNoYW5nZSBzd2VlcGluZyBhIHNjYW4gbGluZSBhY3Jvc3MgdGhlIGhvbG9ncmFtLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1lbnUoKSB7XG4gIGNvbnN0IGFjdGl2ZSA9IHVzZUxpdmUoXCJtZW51XCIpO1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gdXNlU3RhdGU8VGFiPihcImludmVudG9yeVwiKTtcbiAgY29uc3QgW3Nsb3QsIHNldFNsb3RdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtsb2csIHNldExvZ10gPSB1c2VTdGF0ZShMT0dTWzBdLmlkKTtcbiAgY29uc3QgW3BsYXlpbmcsIHNldFBsYXlpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IHBpY2sgPSAobmV4dDogVGFiKSA9PiB7XG4gICAgaWYgKG5leHQgPT09IHRhYikgcmV0dXJuO1xuICAgIHNldFRhYihuZXh0KTtcbiAgICBjdWUoXCJ0YWJcIik7XG4gIH07XG4gIGNvbnN0IG9wZW5Mb2cgPSAoaWQ6IHN0cmluZywgcGxheSA9IGZhbHNlKSA9PiB7XG4gICAgc2V0TG9nKGlkKTtcbiAgICBzZXRQbGF5aW5nKGZhbHNlKTtcbiAgICByZWFkKGlkKTtcbiAgICBjdWUoXCJ0aWNrXCIpO1xuICAgIGlmIChwbGF5ICYmIExPR1MuZmluZCgobCkgPT4gbC5pZCA9PT0gaWQpPy5hdWRpbykgc3RhcnRQbGF5aW5nKCk7XG4gIH07XG4gIGNvbnN0IHN0YXJ0UGxheWluZyA9ICgpID0+IHtcbiAgICBzZXRQbGF5aW5nKHRydWUpO1xuICAgIGN1ZShcImxvZ1wiKTtcbiAgfTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcGxheWluZykgcmV0dXJuO1xuICAgIGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHNldFBsYXlpbmcoZmFsc2UpLCBQTEFZX01TKTtcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KHQpO1xuICB9LCBbcGxheWluZ10pO1xuXG4gIHVzZURlYnVnKFwidGFiXCIsIChpZCkgPT4ge1xuICAgIGlmIChUQUJTLnNvbWUoKHQpID0+IHQuaWQgPT09IGlkKSkgc2V0VGFiKGlkIGFzIFRhYik7XG4gIH0pO1xuICB1c2VEZWJ1ZyhcInNlbGVjdFwiLCAoaXRlbSkgPT4ge1xuICAgIGNvbnN0IGF0ID0gZ2V0R2FtZSgpLnBhY2suc2xvdHMuZmluZEluZGV4KChzKSA9PiBzPy5pdGVtID09PSBpdGVtKTtcbiAgICBpZiAoYXQgPj0gMCkge1xuICAgICAgc2V0VGFiKFwiaW52ZW50b3J5XCIpO1xuICAgICAgc2V0U2xvdChhdCk7XG4gICAgfVxuICB9KTtcbiAgdXNlRGVidWcoXCJsb2dcIiwgKGlkKSA9PiB7XG4gICAgaWYgKCFMT0dTLnNvbWUoKGwpID0+IGwuaWQgPT09IGlkKSkgcmV0dXJuO1xuICAgIHNldFRhYihcImxvZ3NcIik7XG4gICAgb3BlbkxvZyhpZCwgdHJ1ZSk7XG4gIH0pO1xuXG4gIHJldHVybiAoXG4gICAgPEhvbG8gbmFtZT1cIm1lbnVcIiBwYWdlPXt0YWJ9IHNlZWQ9ezN9PlxuICAgICAgPFNoZWxsPlxuICAgICAgICA8SGVhZGVyIC8+XG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBtYXJnaW46IHsgdG9wOiAxMiB9LFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8VGFicyB0YWJzPXtUQUJTfSBhY3RpdmU9e3RhYn0gb25QaWNrPXtwaWNrfSAvPlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDIgfX0+VEFCIMK3IENMT1NFPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxSdWxlIC8+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxLCBtYXJnaW46IHsgdG9wOiAxNiwgYm90dG9tOiAxMiB9IH19PlxuICAgICAgICAgIHt0YWIgPT09IFwiaW52ZW50b3J5XCIgJiYgKFxuICAgICAgICAgICAgPEludmVudG9yeSBhY3RpdmU9e2FjdGl2ZX0gc2VsZWN0ZWQ9e3Nsb3R9IG9uU2VsZWN0PXtzZXRTbG90fSAvPlxuICAgICAgICAgICl9XG4gICAgICAgICAge3RhYiA9PT0gXCJtYXBcIiAmJiA8TWFwVGFiIGFjdGl2ZT17YWN0aXZlfSAvPn1cbiAgICAgICAgICB7dGFiID09PSBcIm9iamVjdGl2ZXNcIiAmJiA8T2JqZWN0aXZlcyAvPn1cbiAgICAgICAgICB7dGFiID09PSBcImxvZ3NcIiAmJiAoXG4gICAgICAgICAgICA8TG9nc1xuICAgICAgICAgICAgICBzZWxlY3RlZD17bG9nfVxuICAgICAgICAgICAgICBwbGF5aW5nPXtwbGF5aW5nfVxuICAgICAgICAgICAgICBvblNlbGVjdD17KGlkKSA9PiBvcGVuTG9nKGlkKX1cbiAgICAgICAgICAgICAgb25QbGF5PXtzdGFydFBsYXlpbmd9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICAgPFJ1bGUgLz5cbiAgICAgICAgPEZvb3RlciAvPlxuICAgICAgPC9TaGVsbD5cbiAgICA8L0hvbG8+XG4gICk7XG59XG5cbi8qKiBXaG8gYW5kIGhvdzogdGhlIHN1aXQsIGl0cyB2aXRhbHMgYW5kIHN0YXNpcywgY3JlZGl0cywgcG93ZXIgY2VsbHMuICovXG5mdW5jdGlvbiBIZWFkZXIoKSB7XG4gIGNvbnN0IHN1aXQgPSB1c2VHYW1lKChnKSA9PiBnLnN1aXQpO1xuICBjb25zdCBwYWNrID0gdXNlR2FtZSgoZykgPT4gZy5wYWNrKTtcbiAgY29uc3Qgdml0YWxzID1cbiAgICBzdWl0LmhlYWx0aCA+IDAuNCA/IEMuY3lhbiA6IHN1aXQuaGVhbHRoID4gMC4yID8gQy5hbWJlciA6IEMucmVkO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogNDAgfX0+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMgfX0+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuaGVhZGVyLCBmb250U2l6ZTogMjYsIGxldHRlclNwYWNpbmc6IDYgfX0+UklHPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyIH19PlxuICAgICAgICAgIHtcIlQuIE9LQUZPUiDCtyBIQUxERU4gSUNFICYgT1JFXCJ9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxHYXVnZSBsYWJlbD1cIlZJVEFMU1wiIHZhbHVlPXtzdWl0LmhlYWx0aH0gY29sb3I9e3ZpdGFsc30gLz5cbiAgICAgIDxHYXVnZSBsYWJlbD1cIlNUQVNJU1wiIHZhbHVlPXtzdWl0LnN0YXNpc30gY29sb3I9e0MuY3lhbn0gLz5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxIH19IC8+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBhbGlnbkl0ZW1zOiBcImVuZFwiLCBnYXA6IDEgfX0+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDIgfX0+UE9XRVIgQ0VMTFM8L3RleHQ+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubnVtYmVyLCBmb250U2l6ZTogMjQsIGNvbG9yOiBDLmdyZWVuIH19PlxuICAgICAgICAgIHtTdHJpbmcoY291bnRJdGVtKHBhY2ssIFwicG93ZXItY2VsbFwiKSl9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGFsaWduSXRlbXM6IFwiZW5kXCIsIGdhcDogMSB9fT5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT5DUkVESVRTPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm51bWJlciwgZm9udFNpemU6IDMwLCBjb2xvcjogQy5hbWJlciB9fT5cbiAgICAgICAgICB7Y3JlZGl0cyhwYWNrLmNyZWRpdHMpfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBHYXVnZSh7XG4gIGxhYmVsLFxuICB2YWx1ZSxcbiAgY29sb3IsXG59OiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIGNvbG9yOiBzdHJpbmc7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiA2IH19PlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIgfX0+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDIgfX0+e2xhYmVsfTwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgZm9udEZhbWlseTogRi5zZW1pYm9sZCwgZm9udFNpemU6IDE0LCBjb2xvciB9fT5cbiAgICAgICAgICB7YCR7TWF0aC5yb3VuZCh2YWx1ZSAqIDEwMCl9JWB9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIDxCYXIgdmFsdWU9e3ZhbHVlfSBjb2xvcj17Y29sb3J9IHdpZHRoPXsyMDB9IC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIGN1cnJlbnQgb2JqZWN0aXZlLCBhbHdheXMgaW4gdmlldy4gKi9cbmZ1bmN0aW9uIEZvb3RlcigpIHtcbiAgY29uc3QgY3VycmVudCA9IE9CSkVDVElWRVNbdXNlR2FtZShvYmplY3RpdmUpXTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgZ2FwOiAxNixcbiAgICAgICAgbWFyZ2luOiB7IHRvcDogMTAgfSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMywgY29sb3I6IEMuYW1iZXIgfX0+XG4gICAgICAgIE9CSkVDVElWRVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5sYWJlbCwgZm9udFNpemU6IDE4LCBjb2xvcjogQy53aGl0ZSB9fT5cbiAgICAgICAge2N1cnJlbnQudGl0bGV9XG4gICAgICA8L3RleHQ+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17eyAuLi5ULmJvZHksIGZvbnRTaXplOiAxNiwgY29sb3I6IEMuY3lhbkRpbSwgZmxleFNocmluazogMSB9fVxuICAgICAgPlxuICAgICAgICB7Y3VycmVudC50ZXh0fVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGJldnkgfSBmcm9tIFwiLi4vLi4vYmV2eVwiO1xuaW1wb3J0IHsgZXF1aXAsIHVzZSB9IGZyb20gXCIuLi8uLi9nYW1lL2FjdFwiO1xuaW1wb3J0IHtcbiAgSVRFTVMsXG4gIFdFQVBPTl9BTU1PLFxuICBXRUFQT05TLFxuICBjcmVkaXRzLFxuICBzZWxsUHJpY2UsXG4gIHR5cGUgSXRlbUlkLFxuICB0eXBlIFdlYXBvbklkLFxufSBmcm9tIFwiLi4vLi4vZ2FtZS9pdGVtc1wiO1xuaW1wb3J0IHsgY2xpcFNpemUsIHJlc2VydmUgfSBmcm9tIFwiLi4vLi4vZ2FtZS9yZWR1Y2VcIjtcbmltcG9ydCB7IHVzZUdhbWUgfSBmcm9tIFwiLi4vLi4vZ2FtZS9zdG9yZVwiO1xuaW1wb3J0IHsgY3VlIH0gZnJvbSBcIi4uLy4uL3NvdW5kXCI7XG5pbXBvcnQgeyBDLCBGLCBUIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQgeyBIb2xvQnV0dG9uLCBSdWxlIH0gZnJvbSBcIi4uL3NoYXJlZC9raXRcIjtcbmltcG9ydCB7IEl0ZW1JY29uLCBLSU5EX0xBQkVMIH0gZnJvbSBcIi4uL3NoYXJlZC9pdGVtc1wiO1xuXG4vKiogV2hhdCB1c2luZyAob3IgaG9sZGluZykgYW4gaXRlbSBkb2VzLCBpbiB0aGUgZGV0YWlsIHBhbmUuICovXG5mdW5jdGlvbiBlZmZlY3QoaXRlbTogSXRlbUlkKTogc3RyaW5nIHtcbiAgc3dpdGNoIChpdGVtKSB7XG4gICAgY2FzZSBcIm1lZHBhY2stc1wiOlxuICAgICAgcmV0dXJuIFwiUkVTVE9SRVMgMjUlIFZJVEFMU1wiO1xuICAgIGNhc2UgXCJtZWRwYWNrLW1cIjpcbiAgICAgIHJldHVybiBcIlJFU1RPUkVTIDUwJSBWSVRBTFNcIjtcbiAgICBjYXNlIFwibWVkcGFjay1sXCI6XG4gICAgICByZXR1cm4gXCJSRVNUT1JFUyBBTEwgVklUQUxTXCI7XG4gICAgY2FzZSBcInN0YXNpcy1wYWNrXCI6XG4gICAgICByZXR1cm4gXCJSRUZJTExTIFRIRSBTVEFTSVMgTU9EVUxFXCI7XG4gICAgY2FzZSBcImFpci1jYW5pc3RlclwiOlxuICAgICAgcmV0dXJuIFwiKzMwIFMgT0YgQUlSXCI7XG4gICAgY2FzZSBcInBvd2VyLWNlbGxcIjpcbiAgICAgIHJldHVybiBcIlBPV0VSUyBPTkUgTk9ERSBBVCBBIEJFTkNIXCI7XG4gICAgY2FzZSBcInNlbWljb25kdWN0b3JcIjpcbiAgICAgIHJldHVybiBgU0VMTFMgRk9SICR7Y3JlZGl0cyhzZWxsUHJpY2UoaXRlbSkpfSBDUkVESVRTYDtcbiAgfVxuICBjb25zdCB3ZWFwb24gPSBXRUFQT05TLmZpbmQoKHcpID0+IFdFQVBPTl9BTU1PW3ddLmFtbW8gPT09IGl0ZW0pO1xuICByZXR1cm4gd2VhcG9uXG4gICAgPyBgTE9BRFMgVEhFICR7SVRFTVNbd2VhcG9uXS5uYW1lLnRvVXBwZXJDYXNlKCl9IMK3ICR7V0VBUE9OX0FNTU9bd2VhcG9uXS5wZXJJdGVtfSBST1VORFNgXG4gICAgOiBcIlwiO1xufVxuXG5jb25zdCBVU0FCTEUgPSBuZXcgU2V0KFtcImhlYWx0aFwiLCBcInN0YXNpc1wiLCBcImFpclwiLCBcImFtbW9cIl0pO1xuXG4vKiogVGhlIHN1aXQncyBpbnZlbnRvcnk6IHRoZSBwYWNrJ3Mgc2xvdHMsIHRoZSBzZWxlY3RlZCBpdGVtIHVwIGNsb3NlIG9uXG4gKiAgdGhlIHR1cm50YWJsZSwgYW5kIHRoZSB3ZWFwb25zIGhlIGNhcnJpZXMuICovXG5leHBvcnQgZnVuY3Rpb24gSW52ZW50b3J5KHtcbiAgYWN0aXZlLFxuICBzZWxlY3RlZCxcbiAgb25TZWxlY3QsXG59OiB7XG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgc2VsZWN0ZWQ6IG51bWJlcjtcbiAgb25TZWxlY3Q6IChzbG90OiBudW1iZXIpID0+IHZvaWQ7XG59KSB7XG4gIGNvbnN0IHNsb3RzID0gdXNlR2FtZSgoZykgPT4gZy5wYWNrLnNsb3RzKTtcbiAgY29uc3QgaXRlbSA9IHNsb3RzW3NlbGVjdGVkXT8uaXRlbTtcbiAgY29uc3QgdXNlZCA9IHNsb3RzLmZpbHRlcihCb29sZWFuKS5sZW5ndGg7XG5cbiAgLy8gVGhlIHR1cm50YWJsZSBzaG93cyB0aGUgc2VsZWN0aW9uIHdoaWxlIHRoaXMgaG9sb2dyYW0gaXMgdXAuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGFjdGl2ZSAmJiBpdGVtKSBiZXZ5LnByZXZpZXcuc2hvdyh7IGl0ZW0gfSk7XG4gIH0sIFthY3RpdmUsIGl0ZW1dKTtcblxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMjgsIGZsZXhHcm93OiAxIH19PlxuICAgICAgey8qIEZvdXIgMTIwIHB4IHNsb3RzIGFuZCB0aGVpciBnYXBzIHRha2UgNTE2IHB4OyB0aGUgc2xhY2sga2VlcHMgYVxuICAgICAgICAgIGZyYWN0aW9uYWwgc3VyZmFjZSBzY2FsZSBmcm9tIHdyYXBwaW5nIHRoZSBmb3VydGguICovfVxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAxNCwgd2lkdGg6IDUyMCwgZmxleFNocmluazogMCB9fVxuICAgICAgPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIiB9fT5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAzIH19PlNVSVQgSU5WRU5UT1JZPC90ZXh0PlxuICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDIsIGNvbG9yOiBDLmN5YW4gfX0+XG4gICAgICAgICAgICB7YCR7dXNlZH0gLyAke3Nsb3RzLmxlbmd0aH1gfVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBmbGV4V3JhcDogXCJ3cmFwXCIsIGdhcDogMTIgfX0+XG4gICAgICAgICAge3Nsb3RzLm1hcCgocywgaSkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvblNlbGVjdChpKTtcbiAgICAgICAgICAgICAgICBjdWUoXCJ0aWNrXCIpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxMTIsXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IGkgPT09IHNlbGVjdGVkID8gQy53aGl0ZSA6IEMuY2xlYXIsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOlxuICAgICAgICAgICAgICAgICAgaSA9PT0gc2VsZWN0ZWQgPyBcInJnYmEoMjQwLCAyNTMsIDI1NSwgMC4xKVwiIDogQy5jbGVhcixcbiAgICAgICAgICAgICAgICBjdXJzb3I6IFwicG9pbnRlclwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBob3ZlclN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMSlcIiB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7cyA/IChcbiAgICAgICAgICAgICAgICA8SXRlbUljb25cbiAgICAgICAgICAgICAgICAgIGl0ZW09e3MuaXRlbX1cbiAgICAgICAgICAgICAgICAgIHNpemU9ezk2fVxuICAgICAgICAgICAgICAgICAgY291bnQ9e3MuY291bnR9XG4gICAgICAgICAgICAgICAgICBsaXQ9e2kgPT09IHNlbGVjdGVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA5NixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA5NixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMTIpXCIsXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8V2VhcG9ucyAvPlxuICAgICAgPC9ub2RlPlxuICAgICAgPERldGFpbCBzbG90PXtzZWxlY3RlZH0gbGl2ZT17YWN0aXZlfSAvPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cblxuLyoqIFRoZSBzZWxlY3RlZCBzbG90IHVwIGNsb3NlLiAqL1xuZnVuY3Rpb24gRGV0YWlsKHsgc2xvdCwgbGl2ZSB9OiB7IHNsb3Q6IG51bWJlcjsgbGl2ZTogYm9vbGVhbiB9KSB7XG4gIGNvbnN0IHMgPSB1c2VHYW1lKChnKSA9PiBnLnBhY2suc2xvdHNbc2xvdF0pO1xuICBpZiAoIXMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgZmxleEdyb3c6IDEsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubGFiZWwsIGNvbG9yOiBDLmN5YW5EaW0sIGxldHRlclNwYWNpbmc6IDQgfX0+XG4gICAgICAgICAgRU1QVFkgU0xPVFxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgKTtcbiAgfVxuICBjb25zdCBpdGVtID0gSVRFTVNbcy5pdGVtXTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAxMiB9fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICBhbGlnbkl0ZW1zOiBcImVuZFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULmhlYWRlciwgZm9udFNpemU6IDI2LCBjb2xvcjogQy53aGl0ZSB9fT5cbiAgICAgICAgICB7aXRlbS5uYW1lLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMyB9fT5cbiAgICAgICAgICB7S0lORF9MQUJFTFtpdGVtLmtpbmRdfVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8UnVsZSAvPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAyMiB9fT5cbiAgICAgICAgey8qIFRoZSBgcHJldmlld2AgY2FtZXJhIHJlbmRlcnMgb25seSB3aGlsZSBhIHBvcnRhbCBzaG93cyBpdDogb25seVxuICAgICAgICAgICAgd2hpbGUgdGhpcyBob2xvZ3JhbSBpcyB1cC4gSXRzIHBpeGVscyBjaGFuZ2UgZXZlcnkgZnJhbWUsIGJlaGluZFxuICAgICAgICAgICAgdGhlIGhvbG9ncmFtJ3MgY2FjaGVkIGxheWVyOiBgY2FjaGU6IFwibmV2ZXJcImAgcmUtY2FwdHVyZXMuICovfVxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogMzQwLFxuICAgICAgICAgICAgaGVpZ2h0OiAyODAsXG4gICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjI1KVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMiwgMTAsIDE2LCAxKVwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7bGl2ZSAmJiAoXG4gICAgICAgICAgICA8cG9ydGFsXG4gICAgICAgICAgICAgIHRhcmdldD1cInByZXZpZXdcIlxuICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogXCIxMDAlXCIsIGNhY2hlOiBcIm5ldmVyXCIgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgZ2FwOiAxNCxcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgZmxleFNocmluazogMSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e1QuYm9keX0+e2l0ZW0udGV4dH08L3RleHQ+XG4gICAgICAgICAgPHRleHRcbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIC4uLlQubGFiZWwsXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxNyxcbiAgICAgICAgICAgICAgY29sb3I6IEMuY3lhbkhpLFxuICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwid29yZEJvdW5kYXJ5XCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtlZmZlY3Qocy5pdGVtKX1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAyNiB9fT5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT5DQVJSSUVEPC90ZXh0PlxuICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm51bWJlciwgZm9udFNpemU6IDI2IH19PlxuICAgICAgICAgICAgICAgIHtTdHJpbmcocy5jb3VudCl9XG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiB9fT5cbiAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT5WQUxVRTwvdGV4dD5cbiAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5udW1iZXIsIGZvbnRTaXplOiAyNiwgY29sb3I6IEMuYW1iZXIgfX0+XG4gICAgICAgICAgICAgICAge2NyZWRpdHMoc2VsbFByaWNlKHMuaXRlbSkpfVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDE2LCBtYXJnaW46IHsgdG9wOiA2IH0gfX0+XG4gICAgICAgIDxIb2xvQnV0dG9uXG4gICAgICAgICAgbGFiZWw9XCJVU0VcIlxuICAgICAgICAgIHdpZGVcbiAgICAgICAgICBkaXNhYmxlZD17IVVTQUJMRS5oYXMoaXRlbS5raW5kKX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB1c2Uoc2xvdCl9XG4gICAgICAgIC8+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG4vKiogVGhlIHdlYXBvbnMgaGUgY2FycmllczogdGhlIGVxdWlwcGVkIG9uZSBtYXJrZWQsIHRoZSBvdGhlcnMgYSBjbGlja1xuICogIGF3YXk7IHRoZSBvbmVzIGhlIGhhc24ndCBib3VnaHQsIGRhcmsuICovXG5mdW5jdGlvbiBXZWFwb25zKCkge1xuICBjb25zdCBhcm1zID0gdXNlR2FtZSgoZykgPT4gZy5hcm1zKTtcbiAgY29uc3QgZyA9IHVzZUdhbWUoKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDgsIG1hcmdpbjogeyB0b3A6IDQgfSB9fT5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDMgfX0+V0VBUE9OUzwvdGV4dD5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMTAgfX0+XG4gICAgICAgIHtXRUFQT05TLm1hcCgodzogV2VhcG9uSWQpID0+IHtcbiAgICAgICAgICBjb25zdCBvd25lZCA9IGFybXMub3duZWQuaW5jbHVkZXModyk7XG4gICAgICAgICAgY29uc3Qgb24gPSBhcm1zLndlYXBvbiA9PT0gdztcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e3d9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG93bmVkICYmIGVxdWlwKHcpfVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxNjUsXG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgICAgICBnYXA6IDIsXG4gICAgICAgICAgICAgICAgcGFkZGluZzogeyBob3Jpem9udGFsOiAxMCwgdmVydGljYWw6IDcgfSxcbiAgICAgICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IG9uXG4gICAgICAgICAgICAgICAgICA/IEMud2hpdGVcbiAgICAgICAgICAgICAgICAgIDogb3duZWRcbiAgICAgICAgICAgICAgICAgICAgPyBDLmN5YW5MaW5lXG4gICAgICAgICAgICAgICAgICAgIDogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMTIpXCIsXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBvbiA/IFwicmdiYSgyNDAsIDI1MywgMjU1LCAwLjA4KVwiIDogQy5jbGVhcixcbiAgICAgICAgICAgICAgICBjdXJzb3I6IG93bmVkID8gXCJwb2ludGVyXCIgOiBcImRlZmF1bHRcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgaG92ZXJTdHlsZT17XG4gICAgICAgICAgICAgICAgb3duZWRcbiAgICAgICAgICAgICAgICAgID8geyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjEpXCIgfVxuICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE2LFxuICAgICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgICAgICAgY29sb3I6IG9uID8gQy53aGl0ZSA6IG93bmVkID8gQy5jeWFuIDogQy5jeWFuRGVlcCxcbiAgICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge0lURU1TW3ddLm5hbWUudG9VcHBlckNhc2UoKX1cbiAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnJlZ3VsYXIsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTMsXG4gICAgICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAxLjUsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogb24gPyBDLmdyZWVuIDogb3duZWQgPyBDLmN5YW5EaW0gOiBDLmN5YW5EZWVwLFxuICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IW93bmVkXG4gICAgICAgICAgICAgICAgICA/IFwiTk9UIE9XTkVEXCJcbiAgICAgICAgICAgICAgICAgIDogYCR7b24gPyBcIkVRVUlQUEVEIMK3IFwiIDogXCJcIn0ke2FybXMuY2xpcFt3XX0vJHtjbGlwU2l6ZShnLCB3KX0gwrcgJHtyZXNlcnZlKGcsIHcpfWB9XG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyBJVEVNUywgdHlwZSBJdGVtSWQsIHR5cGUgSXRlbUtpbmQgfSBmcm9tIFwiLi4vLi4vZ2FtZS9pdGVtc1wiO1xuaW1wb3J0IHsgQywgRiB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuXG4vKiogSG93IHRoZSBtZW51cyBuYW1lIGVhY2gga2luZCBvZiBpdGVtLiAqL1xuZXhwb3J0IGNvbnN0IEtJTkRfTEFCRUw6IFJlY29yZDxJdGVtS2luZCwgc3RyaW5nPiA9IHtcbiAgaGVhbHRoOiBcIk1FRElDQUxcIixcbiAgc3Rhc2lzOiBcIlNUQVNJU1wiLFxuICBhaXI6IFwiTElGRSBTVVBQT1JUXCIsXG4gIGFtbW86IFwiQU1NVU5JVElPTlwiLFxuICB1cGdyYWRlOiBcIlVQR1JBREVcIixcbiAgdmFsdWFibGU6IFwiVkFMVUFCTEVcIixcbiAgd2VhcG9uOiBcIldFQVBPTlwiLFxufTtcblxuLyoqIFwiQXJjIEN1dHRlciBDZWxsc1wiIOKGkiBcIkFDQ1wiOiB3aGF0IGFuIGljb24gc2hvd3MgdW50aWwgaXRzIHNuYXBzaG90XG4gKiAgbGFuZHMuICovXG5mdW5jdGlvbiBpbml0aWFscyhpdGVtOiBJdGVtSWQpOiBzdHJpbmcge1xuICByZXR1cm4gSVRFTVNbaXRlbV0ubmFtZVxuICAgIC5zcGxpdChcIiBcIilcbiAgICAubWFwKCh3KSA9PiB3WzBdKVxuICAgIC5qb2luKFwiXCIpXG4gICAgLnNsaWNlKDAsIDMpXG4gICAgLnRvVXBwZXJDYXNlKCk7XG59XG5cbi8qKiBBbiBpdGVtJ3MgaWNvbjogaXRzIGBpY29uLTxpZD5gIHNuYXBzaG90IChmaWxtZWQgYnkgYHByZXZpZXcvYCkgb3ZlclxuICogIGl0cyBpbml0aWFscywgaW4gYSBmcmFtZTsgYW4gb3B0aW9uYWwgY291bnQgaW4gdGhlIGNvcm5lci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJdGVtSWNvbih7XG4gIGl0ZW0sXG4gIHNpemUgPSA4OCxcbiAgY291bnQsXG4gIGxpdCA9IGZhbHNlLFxufToge1xuICBpdGVtOiBJdGVtSWQ7XG4gIHNpemU/OiBudW1iZXI7XG4gIGNvdW50PzogbnVtYmVyO1xuICBsaXQ/OiBib29sZWFuO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICB3aWR0aDogc2l6ZSxcbiAgICAgICAgaGVpZ2h0OiBzaXplLFxuICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogbGl0ID8gQy53aGl0ZSA6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjI4KVwiLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg2LCAyNiwgMzgsIDAuOTUpXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udEZhbWlseTogRi5kaXNwbGF5LFxuICAgICAgICAgIGZvbnRTaXplOiBzaXplICogMC4yMixcbiAgICAgICAgICBjb2xvcjogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMylcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2luaXRpYWxzKGl0ZW0pfVxuICAgICAgPC90ZXh0PlxuICAgICAgPHBvcnRhbFxuICAgICAgICB0YXJnZXQ9e2BpY29uLSR7aXRlbX1gfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIHtjb3VudCAhPT0gdW5kZWZpbmVkICYmIGNvdW50ID4gMSAmJiAoXG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uVHlwZTogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgcmlnaHQ6IDUsXG4gICAgICAgICAgICBib3R0b206IDIsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLmRpc3BsYXksXG4gICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICBjb2xvcjogbGl0ID8gQy53aGl0ZSA6IEMuY3lhbixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2NvdW50fVxuICAgICAgICA8L3RleHQ+XG4gICAgICApfVxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBMT0dTLCB0eXBlIExvZyB9IGZyb20gXCIuLi8uLi9nYW1lL2xvcmVcIjtcbmltcG9ydCB7IHVzZUdhbWUgfSBmcm9tIFwiLi4vLi4vZ2FtZS9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiwgVCB9IGZyb20gXCIuLi8uLi90aGVtZVwiO1xuaW1wb3J0IHsgSG9sb0J1dHRvbiwgUnVsZSB9IGZyb20gXCIuLi9zaGFyZWQva2l0XCI7XG5cbi8qKiBUaGUgbG9nczogdGV4dCBhbmQgYXVkaW8gbG9ncyBmb3VuZCBvbiB0aGUgZGVjay4gVGhlIGxpc3Qgc2Nyb2xscyB1bmRlclxuICogIHRoZSB3aGVlbDsgYW4gYXVkaW8gbG9nIHBsYXlzIGl0cyBnYXJibGVkIHRyYW5zbWlzc2lvbiBvdmVyIGEgd2F2ZWZvcm1cbiAqICBhbmQgc2hvd3MgdGhlIHRyYW5zY3JpcHQuICovXG5leHBvcnQgZnVuY3Rpb24gTG9ncyh7XG4gIHNlbGVjdGVkLFxuICBwbGF5aW5nLFxuICBvblNlbGVjdCxcbiAgb25QbGF5LFxufToge1xuICBzZWxlY3RlZDogc3RyaW5nO1xuICBwbGF5aW5nOiBib29sZWFuO1xuICBvblNlbGVjdDogKGlkOiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9uUGxheTogKCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgcmVhZCA9IHVzZUdhbWUoKGcpID0+IGcuc3RvcnkucmVhZCk7XG4gIGNvbnN0IGxvZyA9IExPR1MuZmluZCgobCkgPT4gbC5pZCA9PT0gc2VsZWN0ZWQpID8/IExPR1NbMF07XG4gIHJldHVybiAoXG4gICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgZ2FwOiAyOCwgZmxleEdyb3c6IDEgfX0+XG4gICAgICA8bm9kZVxuICAgICAgICBzY3JvbGxTdGVwPXszNn1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogNDMwLFxuICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgaGVpZ2h0OiA0NzYsXG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICBnYXA6IDgsXG4gICAgICAgICAgb3ZlcmZsb3dZOiBcInNjcm9sbFwiLFxuICAgICAgICAgIHRyYW5zaXRpb246IHsgc2Nyb2xsOiB7IGR1cmF0aW9uOiAxODAsIGVhc2luZzogXCJlYXNlT3V0XCIgfSB9LFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7TE9HUy5tYXAoKGwpID0+IChcbiAgICAgICAgICA8Um93XG4gICAgICAgICAgICBrZXk9e2wuaWR9XG4gICAgICAgICAgICBsb2c9e2x9XG4gICAgICAgICAgICBvbj17bC5pZCA9PT0gbG9nLmlkfVxuICAgICAgICAgICAgdW5yZWFkPXshcmVhZC5pbmNsdWRlcyhsLmlkKX1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uU2VsZWN0KGwuaWQpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAxMiwgZmxleEdyb3c6IDEgfX0+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIC4uLlQuc21hbGwsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAzLFxuICAgICAgICAgICAgY29sb3I6IGxvZy5hdWRpbyA/IEMuYW1iZXIgOiBDLmN5YW5EaW0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtsb2cuYXVkaW8gPyBcIkFVRElPIExPR1wiIDogXCJURVhUIExPR1wifVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuaGVhZGVyLCBmb250U2l6ZTogMjYsIGNvbG9yOiBDLndoaXRlIH19PlxuICAgICAgICAgIHtsb2cudGl0bGV9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5sYWJlbCwgZm9udFNpemU6IDE3LCBjb2xvcjogQy5jeWFuRGltIH19PlxuICAgICAgICAgIHtgRlJPTTogJHtsb2cuZnJvbS50b1VwcGVyQ2FzZSgpfWB9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPFJ1bGUgLz5cbiAgICAgICAge2xvZy5hdWRpbyAmJiAoXG4gICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAyMCB9fT5cbiAgICAgICAgICAgIDxIb2xvQnV0dG9uIGxhYmVsPXtwbGF5aW5nID8gXCJQTEFZSU5HXCIgOiBcIlBMQVlcIn0gb25DbGljaz17b25QbGF5fSAvPlxuICAgICAgICAgICAgPFdhdmVmb3JtIHBsYXlpbmc9e3BsYXlpbmd9IC8+XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApfVxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULmJvZHksIGZvbnRTaXplOiAyMCwgbGluZUhlaWdodDogMS41IH19PlxuICAgICAgICAgIHtsb2cuYXVkaW8gPyBgXCIke2xvZy50ZXh0fVwiYCA6IGxvZy50ZXh0fVxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBSb3coe1xuICBsb2csXG4gIG9uLFxuICB1bnJlYWQsXG4gIG9uQ2xpY2ssXG59OiB7XG4gIGxvZzogTG9nO1xuICBvbjogYm9vbGVhbjtcbiAgdW5yZWFkOiBib29sZWFuO1xuICBvbkNsaWNrOiAoKSA9PiB2b2lkO1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBzdHlsZT17e1xuICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICBnYXA6IDE0LFxuICAgICAgICBoZWlnaHQ6IDk2LFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE0IH0sXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IG9uID8gQy53aGl0ZSA6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjIpXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogb25cbiAgICAgICAgICA/IFwicmdiYSgyNDAsIDI1MywgMjU1LCAwLjA4KVwiXG4gICAgICAgICAgOiBcInJnYmEoNCwgMTgsIDI4LCAwLjQpXCIsXG4gICAgICAgIGN1cnNvcjogXCJwb2ludGVyXCIsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjEpXCIgfX1cbiAgICA+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiA1NCxcbiAgICAgICAgICBoZWlnaHQ6IDI2LFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBsb2cuYXVkaW8gPyBDLmFtYmVyIDogQy5jeWFuRGltLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgZm9udFNpemU6IDEyLFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgY29sb3I6IGxvZy5hdWRpbyA/IEMuYW1iZXIgOiBDLmN5YW5EaW0sXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtsb2cuYXVkaW8gPyBcIkFVRElPXCIgOiBcIlRFWFRcIn1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAyLCBmbGV4R3JvdzogMSwgZmxleFNocmluazogMSB9fVxuICAgICAgPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgICAgZm9udFNpemU6IDE4LFxuICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMS41LFxuICAgICAgICAgICAgY29sb3I6IG9uID8gQy53aGl0ZSA6IEMuY3lhbixcbiAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2xvZy50aXRsZX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsaW5lQnJlYWs6IFwibm9XcmFwXCIgfX0+XG4gICAgICAgICAge2xvZy5mcm9tLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvbm9kZT5cbiAgICAgIHt1bnJlYWQgJiYgKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogOSxcbiAgICAgICAgICAgIGhlaWdodDogOSxcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogNSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQy5jeWFuLFxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvYnV0dG9uPlxuICApO1xufVxuXG4vKiogQ2hlYXAsIHJlcGVhdGFibGUgbm9pc2U6IDAuLjEgZm9yIGJhciBgaWAgYXQgYGZyYW1lYC4gKi9cbmZ1bmN0aW9uIG5vaXNlKGk6IG51bWJlciwgZnJhbWU6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IHMgPSBNYXRoLnNpbihpICogMTIuOTg5OCArIGZyYW1lICogNzguMjMzKSAqIDQzNzU4LjU0NTM7XG4gIHJldHVybiBzIC0gTWF0aC5mbG9vcihzKTtcbn1cblxuLyoqIFRoZSB0cmFuc21pc3Npb24ncyB3YXZlZm9ybTogYmFycyB0aGF0IGp1bXAgd2hpbGUgaXQgcGxheXMsIGEgZmxhdFxuICogIGxpbmUgb2Ygc3RhdGljIHdoZW4gaXQgZG9lc24ndC4gKi9cbmZ1bmN0aW9uIFdhdmVmb3JtKHsgcGxheWluZyB9OiB7IHBsYXlpbmc6IGJvb2xlYW4gfSkge1xuICBjb25zdCBbZnJhbWUsIHNldEZyYW1lXSA9IHVzZVN0YXRlKDApO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcGxheWluZykgcmV0dXJuO1xuICAgIGNvbnN0IHQgPSBzZXRJbnRlcnZhbCgoKSA9PiBzZXRGcmFtZSgoZikgPT4gZiArIDEpLCA3MCk7XG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwodCk7XG4gIH0sIFtwbGF5aW5nXSk7XG4gIGNvbnN0IHdpZHRoID0gNTYwO1xuICBjb25zdCBoZWlnaHQgPSA5NjtcbiAgcmV0dXJuIChcbiAgICA8Y2FudmFzXG4gICAgICBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0IH19XG4gICAgICBkcmF3PXsoY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IGJhcnMgPSA1NjtcbiAgICAgICAgY29uc3Qgc3RlcCA9IHdpZHRoIC8gYmFycztcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHBsYXlpbmcgPyBDLmN5YW4gOiBDLmN5YW5EZWVwO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmFyczsgaSsrKSB7XG4gICAgICAgICAgLy8gQSBnYXJibGVkIHZvaWNlOiBzeWxsYWJsZXMgKHRoZSBzbG93IGVudmVsb3BlKSBvdmVyIG5vaXNlLFxuICAgICAgICAgIC8vIHdpdGggZHJvcG91dHMuXG4gICAgICAgICAgY29uc3QgZW52ID0gTWF0aC5hYnMoTWF0aC5zaW4oaSAqIDAuMjMgKyBmcmFtZSAqIDAuNDEpKSAqIDAuOCArIDAuMjtcbiAgICAgICAgICBjb25zdCBkcm9wID0gbm9pc2UoaSA+PiAzLCBmcmFtZSA+PiAyKSA8IDAuMTggPyAwLjEgOiAxO1xuICAgICAgICAgIGNvbnN0IGggPSBwbGF5aW5nXG4gICAgICAgICAgICA/IE1hdGgubWF4KDMsIG5vaXNlKGksIGZyYW1lKSAqIGVudiAqIGRyb3AgKiAoaGVpZ2h0IC0gOCkpXG4gICAgICAgICAgICA6IDIgKyBub2lzZShpLCAwKSAqIDM7XG4gICAgICAgICAgY3R4LnJlY3QoaSAqIHN0ZXAgKyAxLCAoaGVpZ2h0IC0gaCkgLyAyLCBzdGVwIC0gMywgaCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIH19XG4gICAgLz5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IGJldnkgfSBmcm9tIFwiLi4vLi4vYmV2eVwiO1xuaW1wb3J0IHsgT0JKRUNUSVZFUyB9IGZyb20gXCIuLi8uLi9nYW1lL2xvcmVcIjtcbmltcG9ydCB7IG9iamVjdGl2ZSB9IGZyb20gXCIuLi8uLi9nYW1lL3JlZHVjZVwiO1xuaW1wb3J0IHR5cGUgeyBEZXN0aW5hdGlvbiB9IGZyb20gXCIuLi8uLi9nYW1lL3N0YXRlXCI7XG5pbXBvcnQgeyB1c2VHYW1lIH0gZnJvbSBcIi4uLy4uL2dhbWUvc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYsIFQgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IENvcm5lcnMsIFJ1bGUgfSBmcm9tIFwiLi4vc2hhcmVkL2tpdFwiO1xuXG4vKiogVGhlIG1hcCdzIGxlZ2VuZDsgdGhlIGNvbG9ycyBtYXRjaCB0aGUgbWFya2VycyBgcHJldmlldy9tYXAucnNgIHB1dHMgb24gdGhlXG4gKiAgZGVjayBtaW5pYXR1cmUuICovXG5jb25zdCBQTEFDRVM6IHsgaWQ6IERlc3RpbmF0aW9uOyBuYW1lOiBzdHJpbmc7IGNvbG9yOiBzdHJpbmcgfVtdID0gW1xuICB7IGlkOiBcInN0b3JlXCIsIG5hbWU6IFwiU1RPUkVcIiwgY29sb3I6IEMuYW1iZXIgfSxcbiAgeyBpZDogXCJiZW5jaFwiLCBuYW1lOiBcIlVQR1JBREUgQkVOQ0hcIiwgY29sb3I6IEMuZ3JlZW4gfSxcbiAgeyBpZDogXCJzYXZlXCIsIG5hbWU6IFwiU0FWRSBTVEFUSU9OXCIsIGNvbG9yOiBDLmN5YW4gfSxcbiAgeyBpZDogXCJlbGV2YXRvclwiLCBuYW1lOiBcIkZSRUlHSFQgRUxFVkFUT1JcIiwgY29sb3I6IEMud2hpdGUgfSxcbiAgeyBpZDogXCJidWxraGVhZFwiLCBuYW1lOiBcIkJVTEtIRUFEIEMtRFwiLCBjb2xvcjogQy5yZWQgfSxcbl07XG5cbi8qKiBUaGUgZGVjayBtYXA6IGEgbGl2ZSBtaW5pYXR1cmUgb2YgQ29uY291cnNlIEMgeW91IHR1cm4gYnkgZHJhZ2dpbmcgYW5kXG4gKiAgem9vbSB3aXRoIHRoZSB3aGVlbCwgYW5kIHdoYXQgaXMgd2hlcmUuICovXG5leHBvcnQgZnVuY3Rpb24gTWFwVGFiKHsgYWN0aXZlIH06IHsgYWN0aXZlOiBib29sZWFuIH0pIHtcbiAgY29uc3QgbGFzdCA9IHVzZVJlZjx7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsPihudWxsKTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDI2LCBmbGV4R3JvdzogMSB9fT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IDgwMCxcbiAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgIGhlaWdodDogNDc2LFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMylcIixcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyLCAxMCwgMTYsIDAuNDUpXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHthY3RpdmUgJiYgKFxuICAgICAgICAgIDxwb3J0YWxcbiAgICAgICAgICAgIHRhcmdldD1cIm1hcFwiXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICAgIGN1cnNvcjogXCJncmFiXCIsXG4gICAgICAgICAgICAgIC8vIEEgbGl2ZSBjYW1lcmEncyBwaXhlbHM6IHJlLWNhcHR1cmUgZXZlcnkgZnJhbWUuXG4gICAgICAgICAgICAgIGNhY2hlOiBcIm5ldmVyXCIsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Qb2ludGVyRG93bj17KGUpID0+IHtcbiAgICAgICAgICAgICAgbGFzdC5jdXJyZW50ID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uUG9pbnRlck1vdmU9eyhlKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghbGFzdC5jdXJyZW50KSByZXR1cm47XG4gICAgICAgICAgICAgIGNvbnN0IGR4ID0gZS5jbGllbnRYIC0gbGFzdC5jdXJyZW50Lng7XG4gICAgICAgICAgICAgIGNvbnN0IGR5ID0gZS5jbGllbnRZIC0gbGFzdC5jdXJyZW50Lnk7XG4gICAgICAgICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZS5jbGllbnRYLCB5OiBlLmNsaWVudFkgfTtcbiAgICAgICAgICAgICAgaWYgKGR4IHx8IGR5KSBiZXZ5Lm1hcC5vcmJpdCh7IGR4LCBkeSB9KTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvblBvaW50ZXJVcD17KCkgPT4ge1xuICAgICAgICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uV2hlZWw9eyhlKSA9PlxuICAgICAgICAgICAgICBiZXZ5Lm1hcC56b29tKHtcbiAgICAgICAgICAgICAgICBkZWx0YTogLWUuZGVsdGFZICogKGUuZGVsdGFNb2RlID09PSBcImxpbmVcIiA/IDEgOiAwLjAyNSksXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgICAgPENvcm5lcnMgc2l6ZT17MjJ9IHdpZHRoPXsyfSAvPlxuICAgICAgICA8dGV4dFxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAuLi5ULnNtYWxsLFxuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAxNCxcbiAgICAgICAgICAgIHRvcDogMTAsXG4gICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAzLFxuICAgICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgREVDSyAyIMK3IE1BSU5URU5BTkNFIENPTkNPVVJTRSBDXG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICBsZWZ0OiAxNCxcbiAgICAgICAgICAgIGJvdHRvbTogMTAsXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgZ2FwOiAyNixcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT5EUkFHIMK3IFRVUk48L3RleHQ+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT5XSEVFTCDCtyBaT09NPC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICA8L25vZGU+XG4gICAgICA8TGVnZW5kIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBMZWdlbmQoKSB7XG4gIGNvbnN0IGZpeHR1cmVzID0gdXNlR2FtZSgoZykgPT4gZy5maXh0dXJlcyk7XG4gIGNvbnN0IGN1cnJlbnQgPSB1c2VHYW1lKG9iamVjdGl2ZSk7XG4gIGNvbnN0IHRhcmdldDogRGVzdGluYXRpb24gPSBPQkpFQ1RJVkVTW2N1cnJlbnRdLnRvO1xuICBjb25zdCBkb29yID0geyBsb2NrZWQ6IFwiTE9DS0VEXCIsIHVubG9ja2VkOiBcIlVOTE9DS0VEXCIsIG9wZW46IFwiT1BFTlwiIH1bXG4gICAgZml4dHVyZXMuZG9vclxuICBdO1xuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMTIsIGZsZXhHcm93OiAxIH19PlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMyB9fT5MRUdFTkQ8L3RleHQ+XG4gICAgICB7UExBQ0VTLm1hcCgocCkgPT4gKFxuICAgICAgICA8bm9kZVxuICAgICAgICAgIGtleT17cC5pZH1cbiAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEyIH19XG4gICAgICAgID5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDEyLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDYsXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjpcbiAgICAgICAgICAgICAgICBwLmlkID09PSBcImJ1bGtoZWFkXCIgJiYgZml4dHVyZXMuZG9vciAhPT0gXCJsb2NrZWRcIlxuICAgICAgICAgICAgICAgICAgPyBDLmdyZWVuXG4gICAgICAgICAgICAgICAgICA6IHAuY29sb3IsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5sYWJlbCwgZm9udFNpemU6IDE4LCBmbGV4R3JvdzogMSB9fT5cbiAgICAgICAgICAgIHtwLm5hbWV9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIHtwLmlkID09PSB0YXJnZXQgJiYgPFRhZyB0ZXh0PVwiT0JKRUNUSVZFXCIgY29sb3I9e0MuYW1iZXJ9IC8+fVxuICAgICAgICAgIHtwLmlkID09PSBmaXh0dXJlcy5sb2NhdG9yICYmIDxUYWcgdGV4dD1cIkxPQ0FUT1JcIiBjb2xvcj17Qy5jeWFufSAvPn1cbiAgICAgICAgPC9ub2RlPlxuICAgICAgKSl9XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEyIH19PlxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTIgMTJcIiBzdHlsZT17eyB3aWR0aDogMTIsIGhlaWdodDogMTIgfX0+XG4gICAgICAgICAgPHBvbHlnb24gcG9pbnRzPXtbNiwgMCwgMTIsIDEyLCAwLCAxMl19IGZpbGw9e0Mud2hpdGV9IC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULmxhYmVsLCBmb250U2l6ZTogMTggfX0+WU9VPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPFJ1bGUgLz5cbiAgICAgIDxMaW5lXG4gICAgICAgIGxhYmVsPVwiQlVMS0hFQUQgQy1EXCJcbiAgICAgICAgdmFsdWU9e2Rvb3J9XG4gICAgICAgIGNvbG9yPXtmaXh0dXJlcy5kb29yID09PSBcImxvY2tlZFwiID8gQy5yZWQgOiBDLmdyZWVufVxuICAgICAgLz5cbiAgICAgIDxMaW5lXG4gICAgICAgIGxhYmVsPVwiRUxFVkFUT1JcIlxuICAgICAgICB2YWx1ZT17YERFQ0sgJHtmaXh0dXJlcy5lbGV2YXRvci5mbG9vcn1gfVxuICAgICAgICBjb2xvcj17Qy53aGl0ZX1cbiAgICAgIC8+XG4gICAgICA8TGluZVxuICAgICAgICBsYWJlbD1cIk9CSkVDVElWRVwiXG4gICAgICAgIHZhbHVlPXtPQkpFQ1RJVkVTW2N1cnJlbnRdLnRpdGxlfVxuICAgICAgICBjb2xvcj17Qy5hbWJlcn1cbiAgICAgIC8+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBUYWcoeyB0ZXh0LCBjb2xvciB9OiB7IHRleHQ6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IGNvbG9yLFxuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDYsIHZlcnRpY2FsOiAxIH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICBmb250U2l6ZTogMTIsXG4gICAgICAgICAgbGV0dGVyU3BhY2luZzogMixcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge3RleHR9XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBMaW5lKHtcbiAgbGFiZWwsXG4gIHZhbHVlLFxuICBjb2xvcixcbn06IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgY29sb3I6IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDEgfX0+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyIH19PntsYWJlbH08L3RleHQ+XG4gICAgICA8dGV4dFxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gICAgICAgICAgZm9udFNpemU6IDE3LFxuICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEuNSxcbiAgICAgICAgICBjb2xvcixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge3ZhbHVlfVxuICAgICAgPC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyBPQkpFQ1RJVkVTIH0gZnJvbSBcIi4uLy4uL2dhbWUvbG9yZVwiO1xuaW1wb3J0IHsgb2JqZWN0aXZlIH0gZnJvbSBcIi4uLy4uL2dhbWUvcmVkdWNlXCI7XG5pbXBvcnQgeyB1c2VHYW1lIH0gZnJvbSBcIi4uLy4uL2dhbWUvc3RvcmVcIjtcbmltcG9ydCB7IEMsIEYsIFQgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IENvcm5lcnMsIFJ1bGUsIFRpY2sgfSBmcm9tIFwiLi4vc2hhcmVkL2tpdFwiO1xuXG4vKiogV2hhdCdzIHN0aWxsIGFoZWFkOiBkYXJrLCBidXQgbGVnaWJsZS4gKi9cbmNvbnN0IEZBSU5UID0gXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMylcIjtcblxuLyoqIFRoZSBvYmplY3RpdmUgY2hhaW46IHdoYXQncyBkb25lICh0aWNrZWQpLCB0aGUgY3VycmVudCBvbmUgbGl0LCB3aGF0J3NcbiAqICBhaGVhZCBzdGlsbCBjbGFzc2lmaWVkIOKAlCBhbmQgdGhlIGN1cnJlbnQgb25lIGluIGZ1bGwuICovXG5leHBvcnQgZnVuY3Rpb24gT2JqZWN0aXZlcygpIHtcbiAgY29uc3QgY3VycmVudCA9IHVzZUdhbWUob2JqZWN0aXZlKTtcbiAgY29uc3Qgbm93ID0gT0JKRUNUSVZFU1tjdXJyZW50XTtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDM0LCBmbGV4R3JvdzogMSB9fT5cbiAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIHdpZHRoOiA0NzAsIGZsZXhTaHJpbms6IDAgfX0+XG4gICAgICAgIHtPQkpFQ1RJVkVTLm1hcCgobywgaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRvbmUgPSBpIDwgY3VycmVudDtcbiAgICAgICAgICBjb25zdCBoZXJlID0gaSA9PT0gY3VycmVudDtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPG5vZGUga2V5PXtvLnRpdGxlfSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDE2IH19PlxuICAgICAgICAgICAgICB7LyogVGhlIGNoYWluJ3Mgc3BpbmU6IGEgbm9kZSBwZXIgc3RlcCwgYSBsaW5lIGJldHdlZW4uICovfVxuICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgIHdpZHRoOiAyNixcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyMixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyMixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAxMSxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAyLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogaGVyZSA/IEMud2hpdGUgOiBkb25lID8gQy5ncmVlbkRpbSA6IEZBSU5ULFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICA/IFwicmdiYSgyNDAsIDI1MywgMjU1LCAwLjE1KVwiXG4gICAgICAgICAgICAgICAgICAgICAgOiBDLmNsZWFyLFxuICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2RvbmUgJiYgPFRpY2sgc2l6ZT17MTR9IC8+fVxuICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgICB7aSA8IE9CSkVDVElWRVMubGVuZ3RoIC0gMSAmJiAoXG4gICAgICAgICAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyLFxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogNjIsXG4gICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBkb25lID8gQy5ncmVlbkRpbSA6IEZBSU5ULFxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMyB9fT5cbiAgICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE5LFxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAyLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogaGVyZSA/IEMud2hpdGUgOiBkb25lID8gQy5jeWFuRGltIDogRkFJTlQsXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtpID4gY3VycmVudCA/IFwiQ0xBU1NJRklFRFwiIDogby50aXRsZX1cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIC4uLlQuc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBoZXJlID8gQy5hbWJlciA6IGRvbmUgPyBDLmdyZWVuRGltIDogRkFJTlQsXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtoZXJlID8gXCJDVVJSRU5UXCIgOiBkb25lID8gXCJDT01QTEVURVwiIDogXCJQRU5ESU5HXCJ9XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiAxNixcbiAgICAgICAgICBwYWRkaW5nOiAyNixcbiAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjI1KVwiLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDQsIDE4LCAyOCwgMC40NSlcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPENvcm5lcnMgc2l6ZT17MjB9IHdpZHRoPXsyfSAvPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAzLCBjb2xvcjogQy5hbWJlciB9fT5cbiAgICAgICAgICB7YE9CSkVDVElWRSAke2N1cnJlbnQgKyAxfSAvICR7T0JKRUNUSVZFUy5sZW5ndGh9YH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULmhlYWRlciwgZm9udFNpemU6IDMwLCBjb2xvcjogQy53aGl0ZSB9fT5cbiAgICAgICAgICB7bm93LnRpdGxlfVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIDxSdWxlIC8+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuYm9keSwgZm9udFNpemU6IDIxLCBsaW5lSGVpZ2h0OiAxLjQ1IH19PlxuICAgICAgICAgIHtub3cudGV4dH1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyIH19PlxuICAgICAgICAgIFRIRSBMT0NBVE9SIFRSQUNFUyBUSEUgV0FZOiBMIE9OIFRIRSBMT0NBVE9SIEJFQVRcbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgeyB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZUdhbWUgfSBmcm9tIFwiLi4vZ2FtZS9zdG9yZVwiO1xuaW1wb3J0IHsgQywgRiB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgaGludCwgdHlwZSBIaW50IH0gZnJvbSBcIi4vaGludFwiO1xuaW1wb3J0IHsgSG9sbyB9IGZyb20gXCIuL0hvbG9cIjtcbmltcG9ydCB7IEtleSB9IGZyb20gXCIuL1Rlcm1pbmFsXCI7XG5cbi8qKiBUaGUgbGluZSBvZiBsaWdodCBiZXNpZGUgaGlzIHJpZ2h0IGFybSAoNDYwIMOXIDQ4KTogd2hhdCB0byBwcmVzcyB3aGVyZVxuICogIGhlIHN0YW5kcyAoYGhpbnRgKS4gRm9sZGVkIHdoaWxlIGl0IGhhcyBub3RoaW5nIHRvIHNheS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQcm9tcHQoKSB7XG4gIC8vIChgaGludGAgYnVpbGRzIGEgbmV3IG9iamVjdCBlYWNoIGNhbGw6IG5vdCBhIGB1c2VHYW1lYCBzZWxlY3Rvci4pXG4gIGNvbnN0IG5vdyA9IGhpbnQodXNlR2FtZSgpKTtcbiAgLy8gRm9sZGluZyBhd2F5LCBpdCBrZWVwcyBpdHMgbGFzdCBsaW5lLlxuICBjb25zdCBsYXN0ID0gdXNlUmVmPEhpbnQgfCBudWxsPihudWxsKTtcbiAgaWYgKG5vdykgbGFzdC5jdXJyZW50ID0gbm93O1xuICBjb25zdCBzaG93biA9IG5vdyA/PyBsYXN0LmN1cnJlbnQ7XG5cbiAgcmV0dXJuIChcbiAgICA8SG9sb1xuICAgICAgbmFtZT1cInByb21wdFwiXG4gICAgICBwYWdlPXtzaG93bj8uaWQgPz8gXCJub25lXCJ9XG4gICAgICBzZWVkPXsyM31cbiAgICAgIHN0eWxlPXt7IGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiIH19XG4gICAgPlxuICAgICAgey8qIEEgcGxhdGUgb2YgZGFyayBnbGFzcyB1bmRlciB0aGUgbGluZTogaXQgaGFzIHRvIHJlYWQgb3ZlclxuICAgICAgICAgIHdoYXRldmVyIHN0YW5kcyBiZWhpbmQgaXQsIGEgbGl0IHBhbmVsIGluY2x1ZGVkLiAqL31cbiAgICAgIHtzaG93biAmJiAoXG4gICAgICAgIDxub2RlXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgZ2FwOiAyMCxcbiAgICAgICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTQsIHZlcnRpY2FsOiA2IH0sXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuc2hhZGUsXG4gICAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogQy5jeWFuRmFpbnQsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtzaG93bi5rZXlzLm1hcCgoW2tleSwgd2hhdF0pID0+IChcbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDggfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEtleT57a2V5fTwvS2V5PlxuICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnJlZ3VsYXIsXG4gICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTYsXG4gICAgICAgICAgICAgICAgICBjb2xvcjogQy5jeWFuSGksXG4gICAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt3aGF0fVxuICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgICl9XG4gICAgPC9Ib2xvPlxuICApO1xufVxuIiwgImltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHR5cGUgeyBCZXZ5U3R5bGUgfSBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0IHsgZ2xpdGNoIH0gZnJvbSBcIi4uL2dhbWUvYWN0XCI7XG5pbXBvcnQgeyBDT05UUk9MUyB9IGZyb20gXCIuLi9rZXlzXCI7XG5pbXBvcnQgeyBDLCBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBIb2xvLCB1c2VMaXZlIH0gZnJvbSBcIi4vSG9sb1wiO1xuXG4vKiogVGhlIHRlcm1pbmFsIGluIHRoZSBhbGNvdmUgd2hlcmUgaGUgc3RhcnRzICg5NjAgw5cgNTQwKTogdGhlIHdvcmRtYXJrLFxuICogIG5vdyBhbmQgdGhlbiBicmVha2luZyB1cCwgYW5kIGV2ZXJ5IGNvbnRyb2wuICovXG5leHBvcnQgZnVuY3Rpb24gVGVybWluYWwoKSB7XG4gIGNvbnN0IGxpdmUgPSB1c2VMaXZlKFwiY29udHJvbHNcIik7XG5cbiAgLy8gVGhlIHdvcmRtYXJrIGJyZWFrcyB1cCBldmVyeSBmZXcgc2Vjb25kcyB3aGlsZSBzb21lb25lIHJlYWRzIGl0LlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghbGl2ZSkgcmV0dXJuO1xuICAgIGxldCB0OiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PjtcbiAgICBjb25zdCBuZXh0ID0gKCkgPT4ge1xuICAgICAgdCA9IHNldFRpbWVvdXQoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBnbGl0Y2goXCJjb250cm9sc1wiKTtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIDMwMDAgKyBNYXRoLnJhbmRvbSgpICogNDAwMCxcbiAgICAgICk7XG4gICAgfTtcbiAgICBuZXh0KCk7XG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0KTtcbiAgfSwgW2xpdmVdKTtcblxuICByZXR1cm4gKFxuICAgIDxIb2xvIG5hbWU9XCJjb250cm9sc1wiIHNlZWQ9ezMxfSBzdHlsZT17c2NyZWVufT5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICBib3JkZXI6IHsgYm90dG9tOiAxIH0sXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IEMuY3lhbkZhaW50LFxuICAgICAgICAgIHBhZGRpbmc6IHsgYm90dG9tOiA4IH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXtzbWFsbH0+SEFMREVOIElDRSAmIE9SRSDCtyBURVJNSU5BTCBDLTAxPC90ZXh0PlxuICAgICAgICA8dGV4dCBzdHlsZT17c21hbGx9PlNISUZUIDMgwrcgQ09OQ09VUlNFIEM8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgZ2FwOiA0LFxuICAgICAgICAgIHBhZGRpbmc6IHsgdG9wOiA0LCBib3R0b206IDEyIH0sXG4gICAgICAgICAgYm9yZGVyOiB7IGJvdHRvbTogMSB9LFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmN5YW4sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IEYuZGlzcGxheSxcbiAgICAgICAgICAgIGZvbnRTaXplOiA1MixcbiAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEyLFxuICAgICAgICAgICAgY29sb3I6IEMud2hpdGUsXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIENPTERXQUtFXG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDUsXG4gICAgICAgICAgICBjb2xvcjogQy5jeWFuLFxuICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBFVVJZRElDRSBTVEFUSU9OIMK3IFJJRyBPUklFTlRBVElPTiDCtyBNQUlOVEVOQU5DRSBDT05DT1VSU0UgQ1xuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgZmxleFdyYXA6IFwid3JhcFwiLFxuICAgICAgICAgIGFsaWduQ29udGVudDogXCJmbGV4U3RhcnRcIixcbiAgICAgICAgICByb3dHYXA6IDE4LFxuICAgICAgICAgIGNvbHVtbkdhcDogMjgsXG4gICAgICAgICAgcGFkZGluZzogeyB0b3A6IDEyIH0sXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtDT05UUk9MUy5tYXAoKGdyb3VwKSA9PiAoXG4gICAgICAgICAgPG5vZGVcbiAgICAgICAgICAgIGtleT17Z3JvdXAudGl0bGV9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogMjcwLFxuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgICBnYXA6IDYsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMTIgfSxcbiAgICAgICAgICAgICAgYm9yZGVyOiB7IGxlZnQ6IDIgfSxcbiAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuY3lhbkxpbmUsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAzLFxuICAgICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7Z3JvdXAudGl0bGV9XG4gICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICB7Z3JvdXAua2V5cy5tYXAoKFtrZXksIHdoYXRdKSA9PiAoXG4gICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEtleT57a2V5fTwvS2V5PlxuICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLnJlZ3VsYXIsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNixcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IEMuY3lhbkhpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHt3aGF0fVxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9ub2RlPlxuICAgICAgICApKX1cbiAgICAgIDwvbm9kZT5cbiAgICA8L0hvbG8+XG4gICk7XG59XG5cbi8qKiBBIGtleSdzIGNhcC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBLZXkoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxub2RlXG4gICAgICBzdHlsZT17e1xuICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDcsIHZlcnRpY2FsOiAxIH0sXG4gICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjU1KVwiLFxuICAgICAgICBib3JkZXJSYWRpdXM6IDMsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgY29sb3I6IEMud2hpdGUsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5jb25zdCBzY3JlZW46IEJldnlTdHlsZSA9IHtcbiAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgcGFkZGluZzogeyBob3Jpem9udGFsOiA0NCwgdmVydGljYWw6IDMwIH0sXG4gIGdhcDogMTAsXG4gIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDIsIDEwLCAxNiwgMC43OClcIixcbiAgYm9yZGVyOiAyLFxuICBib3JkZXJDb2xvcjogQy5jeWFuTGluZSxcbn07XG5cbmNvbnN0IHNtYWxsOiBCZXZ5U3R5bGUgPSB7XG4gIGZvbnRGYW1pbHk6IEYucmVndWxhcixcbiAgZm9udFNpemU6IDEzLFxuICBsZXR0ZXJTcGFjaW5nOiAyLjUsXG4gIGNvbG9yOiBDLmN5YW5EaW0sXG4gIGxpbmVCcmVhazogXCJub1dyYXBcIixcbn07XG4iLCAiLyoqIFRoZSBjb250cm9scywgYXMgdGhlIHRlcm1pbmFsIGluIHRoZSBhbGNvdmUgbGlzdHMgdGhlbS4gKi9cbmV4cG9ydCBjb25zdCBDT05UUk9MUzoge1xuICB0aXRsZTogc3RyaW5nO1xuICBrZXlzOiBba2V5OiBzdHJpbmcsIHdoYXQ6IHN0cmluZ11bXTtcbn1bXSA9IFtcbiAge1xuICAgIHRpdGxlOiBcIk1PVkVcIixcbiAgICBrZXlzOiBbXG4gICAgICBbXCJXIEEgUyBEXCIsIFwid2Fsa1wiXSxcbiAgICAgIFtcIlNISUZUXCIsIFwiaHVycnlcIl0sXG4gICAgICBbXCJNT1VTRVwiLCBcImxvb2tcIl0sXG4gICAgICBbXCJFU0NcIiwgXCJmcmVlIHRoZSBtb3VzZVwiXSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgdGl0bGU6IFwiU0NSRUVOU1wiLFxuICAgIGtleXM6IFtcbiAgICAgIFtcIkZcIiwgXCJ1c2UgdGhlIG9uZSBoZSBmYWNlc1wiXSxcbiAgICAgIFtcIk1PVVNFXCIsIFwiY3Vyc29yXCJdLFxuICAgICAgW1wiTE1CXCIsIFwicHJlc3NcIl0sXG4gICAgICBbXCJXSEVFTFwiLCBcInNjcm9sbFwiXSxcbiAgICAgIFtcIkYgwrcgVyBBIFMgRFwiLCBcImxlYXZlIGl0XCJdLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0aXRsZTogXCJXRUFQT05cIixcbiAgICBrZXlzOiBbXG4gICAgICBbXCJSTUJcIiwgXCJhaW1cIl0sXG4gICAgICBbXCJMTUJcIiwgXCJmaXJlXCJdLFxuICAgICAgW1wiUlwiLCBcInJlbG9hZFwiXSxcbiAgICAgIFtcIlFcIiwgXCJuZXh0IHdlYXBvblwiXSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgdGl0bGU6IFwiVEVTVCBSSUdcIixcbiAgICBrZXlzOiBbXG4gICAgICBbXCJIXCIsIFwidGFrZSBhIGhpdFwiXSxcbiAgICAgIFtcIlZcIiwgXCJ2ZW50IHRoZSByb29tXCJdLFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICB0aXRsZTogXCJTVUlUXCIsXG4gICAga2V5czogW1xuICAgICAgW1wiVEFCXCIsIFwic3VpdCBtZW51XCJdLFxuICAgICAgW1wiTVwiLCBcIm1lZHBhY2tcIl0sXG4gICAgICBbXCJDXCIsIFwic3Rhc2lzXCJdLFxuICAgICAgW1wiTFwiLCBcImxvY2F0b3JcIl0sXG4gICAgICBbXCJTSElGVCtMXCIsIFwibmV4dCBkZXN0aW5hdGlvblwiXSxcbiAgICBdLFxuICB9LFxuXTtcbiIsICJpbXBvcnQgdHlwZSB7IEJldnlTdHlsZSB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG5pbXBvcnQgeyBsb2FkLCBzYXZlIH0gZnJvbSBcIi4uL2dhbWUvYWN0XCI7XG5pbXBvcnQgeyBPQkpFQ1RJVkVTIH0gZnJvbSBcIi4uL2dhbWUvbG9yZVwiO1xuaW1wb3J0IHsgdXNlR2FtZSB9IGZyb20gXCIuLi9nYW1lL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBIb2xvIH0gZnJvbSBcIi4vSG9sb1wiO1xuaW1wb3J0IHsgdXNlU3BpbiB9IGZyb20gXCIuL3N1aXQvbG9vcHNcIjtcblxuLyoqIFRoZSBzYXZlIHN0YXRpb24ncyBzY3JlZW4gKDQ4MCDDlyAzMjApOiBTQVZFIHdyaXRlcyBhIHJlY29yZCBvZiB0aGUgZ2FtZVxuICogIGFzIGl0IGlzOyBMT0FEIG9uIGEgcmVjb3JkIGJyaW5ncyBpdCBiYWNrICh0aGUgcm9vbSBpdHNlbGYgc3RheXMgYXMgaXRcbiAqICBpcykuICovXG5leHBvcnQgZnVuY3Rpb24gU2F2ZSgpIHtcbiAgY29uc3Qgc2F2ZXMgPSB1c2VHYW1lKChnKSA9PiBnLmZpeHR1cmVzLnNhdmVzKTtcbiAgY29uc3Qgc3BpbiA9IHVzZVNwaW4oMTApO1xuXG4gIHJldHVybiAoXG4gICAgPEhvbG8gbmFtZT1cInNhdmVcIiBzZWVkPXsxN30+XG4gICAgICA8bm9kZVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBDLmdsYXNzLFxuICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQy5jeWFuTGluZSxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPG5vZGVcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgaGVpZ2h0OiA1NCxcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICBwYWRkaW5nOiB7IGhvcml6b250YWw6IDE2IH0sXG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiBcInNwYWNlQmV0d2VlblwiLFxuICAgICAgICAgICAgYm9yZGVyOiB7IGJvdHRvbTogMSB9LFxuICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuY3lhbkxpbmUsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmRpc3BsYXksXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAyMSxcbiAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMyxcbiAgICAgICAgICAgICAgY29sb3I6IEMuY3lhbixcbiAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBTQVZFIFNUQVRJT05cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uc21hbGwsIGNvbG9yOiBDLmN5YW4gfX0+Qy03PC90ZXh0PlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxLCBmbGV4RGlyZWN0aW9uOiBcInJvd1wiIH19PlxuICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICB3aWR0aDogMTcyLFxuICAgICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgZ2FwOiAxNixcbiAgICAgICAgICAgICAgYm9yZGVyOiB7IHJpZ2h0OiAxIH0sXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yOiBDLmN5YW5GYWludCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHN2Z1xuICAgICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDkwIDkwXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogOTAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiA5MCxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHsgcm90YXRlOiB7IGFuaW1hdGVkOiBzcGluIH0gfSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAgICAgIGN4PXs0NX1cbiAgICAgICAgICAgICAgICBjeT17NDV9XG4gICAgICAgICAgICAgICAgcj17NDJ9XG4gICAgICAgICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgICAgICAgIHN0cm9rZT17Qy5jeWFuRGltfVxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxLjV9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgICBjeD17NDV9XG4gICAgICAgICAgICAgICAgY3k9ezQ1fVxuICAgICAgICAgICAgICAgIHI9ezMwfVxuICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICBzdHJva2U9e0MuY3lhbn1cbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17M31cbiAgICAgICAgICAgICAgICBvcGFjaXR5PXswLjZ9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICAgICAgcG9pbnRzPXtbNDUsIDEzLCA1OCwgNDUsIDQ1LCA3NywgMzIsIDQ1XX1cbiAgICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgICAgc3Ryb2tlPXtDLndoaXRlfVxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsyfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PXs0NX0gY3k9ezQ1fSByPXs1fSBmaWxsPXtDLmN5YW59IC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDxidXR0b24gc3R5bGU9e3NhdmVCdXR0b259IGhvdmVyU3R5bGU9e2hvdmVyfSBvbkNsaWNrPXtzYXZlfT5cbiAgICAgICAgICAgICAgPHRleHRcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDIyLFxuICAgICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogNCxcbiAgICAgICAgICAgICAgICAgIGNvbG9yOiBDLndoaXRlLFxuICAgICAgICAgICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBTQVZFXG4gICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8bm9kZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IHsgbGVmdDogMTQsIHJpZ2h0OiAxMCwgdG9wOiAxMCwgYm90dG9tOiAxMCB9LFxuICAgICAgICAgICAgICBnYXA6IDgsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXtzbWFsbH0+UkVDT1JEUzwvdGV4dD5cbiAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgZmxleEdyb3c6IDEsXG4gICAgICAgICAgICAgICAgZmxleEJhc2lzOiAwLFxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG4gICAgICAgICAgICAgICAgZ2FwOiA2LFxuICAgICAgICAgICAgICAgIG92ZXJmbG93WTogXCJzY3JvbGxcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgc2Nyb2xsU3RlcD17MzB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtzYXZlcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uc21hbGwsIGNvbG9yOiBDLmN5YW5EaW0gfX0+Tk8gUkVDT1JEUzwvdGV4dD5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICBbLi4uc2F2ZXNdLnJldmVyc2UoKS5tYXAoKHMpID0+IChcbiAgICAgICAgICAgICAgICAgIDxub2RlXG4gICAgICAgICAgICAgICAgICAgIGtleT17cy5pZH1cbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJzcGFjZUJldHdlZW5cIixcbiAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiB7IGxlZnQ6IDEwLCByaWdodDogNiwgdmVydGljYWw6IDYgfSxcbiAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IEMuY3lhbkZhaW50LFxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogeyBsZWZ0OiAyIH0sXG4gICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6IEMuY3lhbixcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwgZ2FwOiAxIH19PlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBGLmJvbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxOSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyU3BhY2luZzogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IEMud2hpdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge2AjJHtTdHJpbmcocy5pZCkucGFkU3RhcnQoMiwgXCIwXCIpfSDCtyAke3MudGltZX1gfVxuICAgICAgICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGV4dCBzdHlsZT17c21hbGx9PntPQkpFQ1RJVkVTW3Mub2JqZWN0aXZlXS50aXRsZX08L3RleHQ+XG4gICAgICAgICAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXtsb2FkQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICAgIGhvdmVyU3R5bGU9e2hvdmVyfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGxvYWQocy5pZCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8dGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udEZhbWlseTogRi5ib2xkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBDLmN5YW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVCcmVhazogXCJub1dyYXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgTE9BRFxuICAgICAgICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L25vZGU+XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8L25vZGU+XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvbm9kZT5cbiAgICA8L0hvbG8+XG4gICk7XG59XG5cbmNvbnN0IHNtYWxsOiBCZXZ5U3R5bGUgPSB7XG4gIGZvbnRGYW1pbHk6IEYuc2VtaWJvbGQsXG4gIGZvbnRTaXplOiAxNSxcbiAgbGV0dGVyU3BhY2luZzogMS41LFxuICBjb2xvcjogQy5jeWFuRGltLFxuICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG59O1xuXG5jb25zdCBzYXZlQnV0dG9uOiBCZXZ5U3R5bGUgPSB7XG4gIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMjYsIHZlcnRpY2FsOiA4IH0sXG4gIGJvcmRlcjogMSxcbiAgYm9yZGVyQ29sb3I6IEMuY3lhbixcbiAgYmFja2dyb3VuZENvbG9yOiBDLmdsYXNzSGksXG59O1xuXG5jb25zdCBsb2FkQnV0dG9uOiBCZXZ5U3R5bGUgPSB7XG4gIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTIsIHZlcnRpY2FsOiA1IH0sXG4gIGJvcmRlcjogMSxcbiAgYm9yZGVyQ29sb3I6IEMuY3lhbkxpbmUsXG4gIGJhY2tncm91bmRDb2xvcjogQy5nbGFzcyxcbn07XG5cbmNvbnN0IGhvdmVyOiBCZXZ5U3R5bGUgPSB7XG4gIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMjgpXCIsXG4gIGJvcmRlckNvbG9yOiBDLndoaXRlLFxufTtcbiIsICJpbXBvcnQgeyB1c2VHYW1lIH0gZnJvbSBcIi4uL2dhbWUvc3RvcmVcIjtcbmltcG9ydCB7IEMgfSBmcm9tIFwiLi4vdGhlbWVcIjtcbmltcG9ydCB7IEhvbG8gfSBmcm9tIFwiLi9Ib2xvXCI7XG5pbXBvcnQgeyB1c2VCbGluayB9IGZyb20gXCIuL3N1aXQvbG9vcHNcIjtcblxuLyoqIFNlZ21lbnRzIGRvd24gdGhlIHNwaW5lOyB0aGUgdG9wIG9uZXMgZ28gb3V0IGZpcnN0LiAqL1xuY29uc3QgU0VHTUVOVFMgPSAxMDtcbmNvbnN0IFBJVENIID0gMzU7XG5jb25zdCBUT1AgPSA2O1xuXG4vKiogQSB2ZXJ0ZWJyYTogYSBjaGV2cm9uIHBvaW50aW5nIGRvd24sIGB5YCBpdHMgdG9wIGVkZ2UuICovXG5mdW5jdGlvbiB2ZXJ0ZWJyYSh5OiBudW1iZXIpOiBudW1iZXJbXSB7XG4gIHJldHVybiBbNSwgeSwgNDMsIHksIDQzLCB5ICsgMjAsIDI0LCB5ICsgMzAsIDUsIHkgKyAyMF07XG59XG5cbi8qKiBUaGUgc3VpdCdzIHZpdGFscyBydW5uaW5nIGRvd24gdGhlIGVuZ2luZWVyJ3Mgc3BpbmUgKDQ4IMOXIDM2MCk6IGN5YW5cbiAqICB3aGlsZSBoZWFsdGh5LCBhbWJlciBhdCA0MCUsIHJlZCBhbmQgcHVsc2luZyBhdCAyMCUuICovXG5leHBvcnQgZnVuY3Rpb24gU3BpbmUoKSB7XG4gIHJldHVybiAoXG4gICAgPEhvbG8gbmFtZT1cInNwaW5lXCIgc2VlZD17M30+XG4gICAgICA8U3BpbmVCYXIgLz5cbiAgICA8L0hvbG8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFNwaW5lQmFyKCkge1xuICBjb25zdCBoZWFsdGggPSB1c2VHYW1lKChnKSA9PiBnLnN1aXQuaGVhbHRoKTtcbiAgY29uc3QgY29sb3IgPSBoZWFsdGggPiAwLjQgPyBDLmN5YW4gOiBoZWFsdGggPiAwLjIgPyBDLmFtYmVyIDogQy5yZWQ7XG4gIGNvbnN0IHB1bHNlID0gdXNlQmxpbmsoaGVhbHRoIDw9IDAuMiwgMzgwLCAwLjMpO1xuICAvLyBJbiBzZWdtZW50cywgZnJvbSB0aGUgYm90dG9tOiB3aG9sZSBvbmVzIGxpdCwgdGhlIG5leHQgb25lIHBhcnRseS5cbiAgY29uc3QgbGV2ZWwgPSBoZWFsdGggKiBTRUdNRU5UUztcblxuICByZXR1cm4gKFxuICAgIDxzdmcgdmlld0JveD1cIjAgMCA0OCAzNjBcIiBzdHlsZT17eyB3aWR0aDogNDgsIGhlaWdodDogMzYwIH19PlxuICAgICAgPGxpbmVcbiAgICAgICAgeDE9ezI0fVxuICAgICAgICB5MT17Mn1cbiAgICAgICAgeDI9ezI0fVxuICAgICAgICB5Mj17MzU4fVxuICAgICAgICBzdHJva2U9e0MuY3lhbkRpbX1cbiAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNX1cbiAgICAgICAgb3BhY2l0eT17MC41NX1cbiAgICAgIC8+XG4gICAgICA8cmVjdCB4PXsxNH0geT17MX0gd2lkdGg9ezIwfSBoZWlnaHQ9ezJ9IGZpbGw9e0MuY3lhbkRpbX0gLz5cbiAgICAgIDxyZWN0IHg9ezE0fSB5PXszNTd9IHdpZHRoPXsyMH0gaGVpZ2h0PXsyfSBmaWxsPXtDLmN5YW5EaW19IC8+XG4gICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogU0VHTUVOVFMgfSwgKF8sIGkpID0+IHtcbiAgICAgICAgY29uc3QgZnJvbUJvdHRvbSA9IFNFR01FTlRTIC0gMSAtIGk7XG4gICAgICAgIGlmIChmcm9tQm90dG9tIDwgbGV2ZWwpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxwb2x5Z29uXG4gICAgICAgICAgICBrZXk9e2BvZmYke2l9YH1cbiAgICAgICAgICAgIHBvaW50cz17dmVydGVicmEoVE9QICsgaSAqIFBJVENIKX1cbiAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgIHN0cm9rZT17Qy5jeWFuRGltfVxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuMn1cbiAgICAgICAgICAgIG9wYWNpdHk9ezAuMzV9XG4gICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICAgIH0pfVxuICAgICAgPGcgb3BhY2l0eT17eyBhbmltYXRlZDogcHVsc2UgfX0+XG4gICAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBTRUdNRU5UUyB9LCAoXywgaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGZyb21Cb3R0b20gPSBTRUdNRU5UUyAtIDEgLSBpO1xuICAgICAgICAgIGNvbnN0IGxpdCA9IE1hdGgubWluKDEsIGxldmVsIC0gZnJvbUJvdHRvbSk7XG4gICAgICAgICAgaWYgKGxpdCA8PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICBjb25zdCB5ID0gVE9QICsgaSAqIFBJVENIO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBrZXk9e2BvbiR7aX1gfSBvcGFjaXR5PXswLjMgKyAwLjcgKiBsaXR9PlxuICAgICAgICAgICAgICA8cG9seWdvbiBwb2ludHM9e3ZlcnRlYnJhKHkpfSBmaWxsPXtjb2xvcn0gb3BhY2l0eT17MC45fSAvPlxuICAgICAgICAgICAgICA8cmVjdCB4PXsxMn0geT17eSArIDV9IHdpZHRoPXsyNH0gaGVpZ2h0PXsxLjV9IGZpbGw9e0Mud2hpdGV9IC8+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L2c+XG4gICAgPC9zdmc+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlR2FtZSB9IGZyb20gXCIuLi9nYW1lL3N0b3JlXCI7XG5pbXBvcnQgeyBDLCBGIH0gZnJvbSBcIi4uL3RoZW1lXCI7XG5pbXBvcnQgeyBIb2xvIH0gZnJvbSBcIi4vSG9sb1wiO1xuaW1wb3J0IHsgYXJjLCBwb2xhciB9IGZyb20gXCIuL3N1aXQvYXJjc1wiO1xuXG4vKiogU3Rhc2lzIGxpZ2h0OiBibHVlciB0aGFuIHRoZSByZXN0IG9mIHRoZSBzdWl0J3MgY3lhbi4gKi9cbmNvbnN0IEJMVUUgPSBcIiM2Y2M4ZmZcIjtcbi8qKiBUaGUgZ2F1Z2U6IGEgMjcwwrAgYXJjIG9wZW4gYXQgdGhlIGJvdHRvbSwgaW4gZm91ciBjaGFyZ2VzLiAqL1xuY29uc3QgU1RBUlQgPSAtMTM1O1xuY29uc3QgR0FQID0gNjtcbmNvbnN0IFNQQU4gPSAoMjcwIC0gMyAqIEdBUCkgLyA0O1xuXG4vKiogVGhlIHN0YXNpcyBtb2R1bGUncyBjaGFyZ2Ugb24gdGhlIHJpZ2h0IHNob3VsZGVyIGJsYWRlICgxNjAgw5cgMTYwKTogZm91clxuICogIHF1YXJ0ZXIgc2VnbWVudHMsIG9uZSBzcGVudCBwZXIgdXNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0YXNpcygpIHtcbiAgcmV0dXJuIChcbiAgICA8SG9sbyBuYW1lPVwic3Rhc2lzXCIgc2VlZD17NX0+XG4gICAgICA8U3Rhc2lzR2F1Z2UgLz5cbiAgICA8L0hvbG8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFN0YXNpc0dhdWdlKCkge1xuICBjb25zdCBzdGFzaXMgPSB1c2VHYW1lKChnKSA9PiBnLnN1aXQuc3Rhc2lzKTtcbiAgY29uc3QgbGV2ZWwgPSBzdGFzaXMgKiA0O1xuXG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzdmdcbiAgICAgICAgdmlld0JveD1cIjAgMCAxNjAgMTYwXCJcbiAgICAgICAgc3R5bGU9e3sgcG9zaXRpb25UeXBlOiBcImFic29sdXRlXCIsIHdpZHRoOiAxNjAsIGhlaWdodDogMTYwIH19XG4gICAgICA+XG4gICAgICAgIDxjaXJjbGVcbiAgICAgICAgICBjeD17ODB9XG4gICAgICAgICAgY3k9ezgwfVxuICAgICAgICAgIHI9ezc0fVxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9e0MuY3lhbkRpbX1cbiAgICAgICAgICBzdHJva2VXaWR0aD17MX1cbiAgICAgICAgICBvcGFjaXR5PXswLjV9XG4gICAgICAgIC8+XG4gICAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiAxMiB9LCAoXywgaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IFt4MCwgeTBdID0gcG9sYXIoODAsIDgwLCA3NCwgaSAqIDMwKTtcbiAgICAgICAgICBjb25zdCBbeDEsIHkxXSA9IHBvbGFyKDgwLCA4MCwgNjgsIGkgKiAzMCk7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaW5lXG4gICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgeDE9e3gwfVxuICAgICAgICAgICAgICB5MT17eTB9XG4gICAgICAgICAgICAgIHgyPXt4MX1cbiAgICAgICAgICAgICAgeTI9e3kxfVxuICAgICAgICAgICAgICBzdHJva2U9e0MuY3lhbkRpbX1cbiAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEuNH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICAgIHtbMCwgMSwgMiwgM10ubWFwKChrKSA9PiB7XG4gICAgICAgICAgY29uc3QgZnJvbSA9IFNUQVJUICsgayAqIChTUEFOICsgR0FQKTtcbiAgICAgICAgICBjb25zdCBsaXQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBsZXZlbCAtIGspKTtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcga2V5PXtrfT5cbiAgICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgICBkPXthcmMoODAsIDgwLCA1NiwgZnJvbSwgZnJvbSArIFNQQU4pfVxuICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICBzdHJva2U9e0JMVUV9XG4gICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezEzfVxuICAgICAgICAgICAgICAgIG9wYWNpdHk9ezAuMTh9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtsaXQgPiAwICYmIChcbiAgICAgICAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgICAgICAgZD17YXJjKDgwLCA4MCwgNTYsIGZyb20sIGZyb20gKyBTUEFOICogbGl0KX1cbiAgICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgIHN0cm9rZT17QkxVRX1cbiAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXsxM31cbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk9e2xpdCA8IDEgPyAwLjU1IDogMC45NX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7bGl0ID49IDEgJiYgKFxuICAgICAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgICAgICBkPXthcmMoODAsIDgwLCA1MCwgZnJvbSArIDIsIGZyb20gKyBTUEFOIC0gMil9XG4gICAgICAgICAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgICAgICBzdHJva2U9e0Mud2hpdGV9XG4gICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17MS40fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3N2Zz5cbiAgICAgIDx0ZXh0XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZm9udEZhbWlseTogRi5kaXNwbGF5LFxuICAgICAgICAgIGZvbnRTaXplOiAzMCxcbiAgICAgICAgICBjb2xvcjogc3Rhc2lzID49IDAuMjUgPyBDLndoaXRlIDogQy5yZWQsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7TWF0aC5yb3VuZChzdGFzaXMgKiAxMDApfVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHRcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250RmFtaWx5OiBGLnNlbWlib2xkLFxuICAgICAgICAgIGZvbnRTaXplOiAxMyxcbiAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiAyLjUsXG4gICAgICAgICAgY29sb3I6IEJMVUUsXG4gICAgICAgICAgbGluZUJyZWFrOiBcIm5vV3JhcFwiLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBTVEFTSVNcbiAgICAgIDwvdGV4dD5cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgYmV2eSB9IGZyb20gXCIuLi9iZXZ5XCI7XG5pbXBvcnQgeyBidXksIHJldHJpZXZlLCBzZWxsLCBzdG93IH0gZnJvbSBcIi4uL2dhbWUvYWN0XCI7XG5pbXBvcnQge1xuICBJVEVNX0lEUyxcbiAgSVRFTVMsXG4gIFBBQ0tfU0xPVFMsXG4gIGNvdW50SXRlbSxcbiAgY3JlZGl0cyxcbiAgc2VsbFByaWNlLFxuICB0eXBlIEl0ZW1JZCxcbn0gZnJvbSBcIi4uL2dhbWUvaXRlbXNcIjtcbmltcG9ydCB7IGdldEdhbWUsIHVzZUdhbWUgfSBmcm9tIFwiLi4vZ2FtZS9zdG9yZVwiO1xuaW1wb3J0IHsgdXNlRGVidWcgfSBmcm9tIFwiLi4vaG9va3NcIjtcbmltcG9ydCB7IGN1ZSB9IGZyb20gXCIuLi9zb3VuZFwiO1xuaW1wb3J0IHsgQywgVCB9IGZyb20gXCIuLi90aGVtZVwiO1xuaW1wb3J0IHsgSG9sbywgdXNlTGl2ZSB9IGZyb20gXCIuL0hvbG9cIjtcbmltcG9ydCB7IEhvbG9CdXR0b24sIFJ1bGUsIFNoZWxsLCBUYWJzIH0gZnJvbSBcIi4vc2hhcmVkL2tpdFwiO1xuaW1wb3J0IHsgRGV0YWlsLCBJdGVtUm93LCBMaXN0IH0gZnJvbSBcIi4vc3RvcmUvcGFydHNcIjtcblxuY29uc3QgVEFCUyA9IFtcbiAgeyBpZDogXCJidXlcIiwgbGFiZWw6IFwiQlVZXCIgfSxcbiAgeyBpZDogXCJzZWxsXCIsIGxhYmVsOiBcIlNFTExcIiB9LFxuICB7IGlkOiBcInNhZmVcIiwgbGFiZWw6IFwiU0FGRVwiIH0sXG5dIGFzIGNvbnN0O1xudHlwZSBUYWIgPSAodHlwZW9mIFRBQlMpW251bWJlcl1bXCJpZFwiXTtcblxuLyoqIFdoYXQgdGhlIHN0b3JlIHNlbGxzOiBldmVyeXRoaW5nIHdpdGggYSBwcmljZSB0aGF0IGlzbid0IHNhbHZhZ2UsIGFuZFxuICogIHRoZSB3ZWFwb25zIGhlIGRvZXNuJ3Qgb3duIHlldC4gKi9cbmZ1bmN0aW9uIGNhdGFsb2cob3duZWQ6IHN0cmluZ1tdKTogSXRlbUlkW10ge1xuICByZXR1cm4gSVRFTV9JRFMuZmlsdGVyKChpZCkgPT4ge1xuICAgIGNvbnN0IGl0ZW0gPSBJVEVNU1tpZF07XG4gICAgaWYgKGl0ZW0ucHJpY2UgPT09IDAgfHwgaXRlbS5raW5kID09PSBcInZhbHVhYmxlXCIpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gaXRlbS5raW5kICE9PSBcIndlYXBvblwiIHx8ICFvd25lZC5pbmNsdWRlcyhpZCk7XG4gIH0pO1xufVxuXG4vKiogVGhlIHN0b3JlIGtpb3NrJ3MgaG9sb2dyYW06IGJ1eSwgc2VsbCwgYW5kIHRoZSBzYWZlIHRoYXQga2VlcHMgd2hhdCB0aGVcbiAqICBzdWl0IGNhbid0IGNhcnJ5LiBDcmVkaXRzIHVwIHRvcCBpbiBhbWJlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdG9yZSgpIHtcbiAgY29uc3QgYWN0aXZlID0gdXNlTGl2ZShcInN0b3JlXCIpO1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gdXNlU3RhdGU8VGFiPihcImJ1eVwiKTtcbiAgY29uc3QgW2l0ZW0sIHNldEl0ZW1dID0gdXNlU3RhdGU8SXRlbUlkPihcIm1lZHBhY2stc1wiKTtcbiAgY29uc3QgW3Nsb3QsIHNldFNsb3RdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IHBhY2sgPSB1c2VHYW1lKChnKSA9PiBnLnBhY2spO1xuXG4gIC8vIFRoZSB0dXJudGFibGUgc2hvd3Mgd2hhdCB0aGlzIHBhZ2UgaXMgYWJvdXQgd2hpbGUgaGUgaXMgYXQgdGhlIHN0b3JlLlxuICBjb25zdCBzaG93biA9XG4gICAgdGFiID09PSBcImJ1eVwiID8gaXRlbSA6IHRhYiA9PT0gXCJzZWxsXCIgPyBwYWNrLnNsb3RzW3Nsb3RdPy5pdGVtIDogdW5kZWZpbmVkO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChhY3RpdmUgJiYgc2hvd24pIGJldnkucHJldmlldy5zaG93KHsgaXRlbTogc2hvd24gfSk7XG4gIH0sIFthY3RpdmUsIHNob3duXSk7XG5cbiAgY29uc3QgcGljayA9IChuZXh0OiBUYWIpID0+IHtcbiAgICBpZiAobmV4dCA9PT0gdGFiKSByZXR1cm47XG4gICAgc2V0VGFiKG5leHQpO1xuICAgIGN1ZShcInRhYlwiKTtcbiAgfTtcbiAgdXNlRGVidWcoXCJzdG9yZVwiLCAoaWQpID0+IHtcbiAgICBpZiAoVEFCUy5zb21lKCh0KSA9PiB0LmlkID09PSBpZCkpIHNldFRhYihpZCBhcyBUYWIpO1xuICB9KTtcbiAgdXNlRGVidWcoXCJzZWxlY3RcIiwgKGlkKSA9PiB7XG4gICAgaWYgKCEoaWQgaW4gSVRFTVMpKSByZXR1cm47XG4gICAgc2V0VGFiKFwiYnV5XCIpO1xuICAgIHNldEl0ZW0oaWQgYXMgSXRlbUlkKTtcbiAgfSk7XG4gIHVzZURlYnVnKFwiYnV5XCIsIChpZCkgPT4ge1xuICAgIGlmICghKGlkIGluIElURU1TKSkgcmV0dXJuO1xuICAgIHNldFRhYihcImJ1eVwiKTtcbiAgICBzZXRJdGVtKGlkIGFzIEl0ZW1JZCk7XG4gICAgYnV5KGlkIGFzIEl0ZW1JZCk7XG4gIH0pO1xuICB1c2VEZWJ1ZyhcInNlbGxcIiwgKG4pID0+IHtcbiAgICBjb25zdCBhdCA9IE51bWJlcihuKTtcbiAgICBpZiAoIWdldEdhbWUoKS5wYWNrLnNsb3RzW2F0XSkgcmV0dXJuO1xuICAgIHNldFRhYihcInNlbGxcIik7XG4gICAgc2V0U2xvdChhdCk7XG4gICAgc2VsbChhdCk7XG4gIH0pO1xuXG4gIHJldHVybiAoXG4gICAgPEhvbG8gbmFtZT1cInN0b3JlXCIgcGFnZT17dGFifSBzZWVkPXs1fT5cbiAgICAgIDxTaGVsbD5cbiAgICAgICAgPG5vZGUgc3R5bGU9e3sgZmxleERpcmVjdGlvbjogXCJyb3dcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxOCB9fT5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDMgfX0+XG4gICAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULmhlYWRlciwgZm9udFNpemU6IDI4LCBsZXR0ZXJTcGFjaW5nOiA4IH19PlxuICAgICAgICAgICAgICBTVE9SRVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT5cbiAgICAgICAgICAgICAgQ09OQ09VUlNFIEMgwrcgSEFMREVOIFNVUFBMWSBURVJNSU5BTCAwN1xuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4R3JvdzogMSB9fSAvPlxuICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGFsaWduSXRlbXM6IFwiZW5kXCIsIGdhcDogMSB9fT5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDMgfX0+Q1JFRElUUzwvdGV4dD5cbiAgICAgICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubnVtYmVyLCBmb250U2l6ZTogNDIsIGNvbG9yOiBDLmFtYmVyIH19PlxuICAgICAgICAgICAgICB7Y3JlZGl0cyhwYWNrLmNyZWRpdHMpfVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwvbm9kZT5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogMTAgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFRhYnMgdGFicz17VEFCU30gYWN0aXZlPXt0YWJ9IG9uUGljaz17cGlja30gLz5cbiAgICAgICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyIH19PldIRUVMIMK3IFNDUk9MTDwvdGV4dD5cbiAgICAgICAgPC9ub2RlPlxuICAgICAgICA8UnVsZSAvPlxuICAgICAgICA8bm9kZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLFxuICAgICAgICAgICAgZ2FwOiAzMCxcbiAgICAgICAgICAgIGZsZXhHcm93OiAxLFxuICAgICAgICAgICAgbWFyZ2luOiB7IHRvcDogMTYgfSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3RhYiA9PT0gXCJidXlcIiAmJiA8QnV5IGl0ZW09e2l0ZW19IGxpdmU9e2FjdGl2ZX0gb25JdGVtPXtzZXRJdGVtfSAvPn1cbiAgICAgICAgICB7dGFiID09PSBcInNlbGxcIiAmJiAoXG4gICAgICAgICAgICA8U2VsbCBzbG90PXtzbG90fSBsaXZlPXthY3RpdmV9IG9uU2xvdD17c2V0U2xvdH0gLz5cbiAgICAgICAgICApfVxuICAgICAgICAgIHt0YWIgPT09IFwic2FmZVwiICYmIDxTYWZlIC8+fVxuICAgICAgICA8L25vZGU+XG4gICAgICA8L1NoZWxsPlxuICAgIDwvSG9sbz5cbiAgKTtcbn1cblxuZnVuY3Rpb24gQnV5KHtcbiAgaXRlbSxcbiAgbGl2ZSxcbiAgb25JdGVtLFxufToge1xuICBpdGVtOiBJdGVtSWQ7XG4gIGxpdmU6IGJvb2xlYW47XG4gIG9uSXRlbTogKGl0ZW06IEl0ZW1JZCkgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3QgZyA9IHVzZUdhbWUoKTtcbiAgY29uc3QgaXRlbXMgPSBjYXRhbG9nKGcuYXJtcy5vd25lZCk7XG4gIGNvbnN0IHByaWNlID0gSVRFTVNbaXRlbV0ucHJpY2U7XG4gIGNvbnN0IGFmZm9yZCA9IHByaWNlIDw9IGcucGFjay5jcmVkaXRzO1xuICAvLyBKdXN0IGJvdWdodDogYSB3ZWFwb24gZ29lcyB0byBoaXMgaGFuZHMsIG5vdCB0aGUgcGFjay5cbiAgY29uc3Qgb3duZWQgPSAoZy5hcm1zLm93bmVkIGFzIHN0cmluZ1tdKS5pbmNsdWRlcyhpdGVtKTtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPExpc3Q+XG4gICAgICAgIHtpdGVtcy5tYXAoKGlkKSA9PiAoXG4gICAgICAgICAgPEl0ZW1Sb3dcbiAgICAgICAgICAgIGtleT17aWR9XG4gICAgICAgICAgICBpdGVtPXtpZH1cbiAgICAgICAgICAgIG9uPXtpZCA9PT0gaXRlbX1cbiAgICAgICAgICAgIHZhbHVlPXtjcmVkaXRzKElURU1TW2lkXS5wcmljZSl9XG4gICAgICAgICAgICB2YWx1ZUNvbG9yPXtcbiAgICAgICAgICAgICAgSVRFTVNbaWRdLnByaWNlIDw9IGcucGFjay5jcmVkaXRzID8gQy5hbWJlciA6IEMuYW1iZXJEaW1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgb25JdGVtKGlkKTtcbiAgICAgICAgICAgICAgY3VlKFwidGlja1wiKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L0xpc3Q+XG4gICAgICA8RGV0YWlsIGl0ZW09e2l0ZW19IGxpdmU9e2xpdmV9PlxuICAgICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcInJvd1wiLCBnYXA6IDM0IH19PlxuICAgICAgICAgIDxGaWd1cmVcbiAgICAgICAgICAgIGxhYmVsPVwiUFJJQ0VcIlxuICAgICAgICAgICAgdmFsdWU9e2NyZWRpdHMocHJpY2UpfVxuICAgICAgICAgICAgY29sb3I9e2FmZm9yZCA/IEMuYW1iZXIgOiBDLnJlZH1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxGaWd1cmVcbiAgICAgICAgICAgIGxhYmVsPVwiSU4gUEFDS1wiXG4gICAgICAgICAgICB2YWx1ZT17XG4gICAgICAgICAgICAgIG93bmVkXG4gICAgICAgICAgICAgICAgPyBcIk9XTkVEXCJcbiAgICAgICAgICAgICAgICA6IFN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgSVRFTVNbaXRlbV0ua2luZCA9PT0gXCJ3ZWFwb25cIiA/IDAgOiBjb3VudEl0ZW0oZy5wYWNrLCBpdGVtKSxcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L25vZGU+XG4gICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTggfX0+XG4gICAgICAgICAge293bmVkID8gKFxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiwgY29sb3I6IEMuZ3JlZW4gfX0+XG4gICAgICAgICAgICAgIE9XTkVEIMK3IFEgRFJBV1MgSVRcbiAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPEhvbG9CdXR0b25cbiAgICAgICAgICAgICAgbGFiZWw9XCJCVVlcIlxuICAgICAgICAgICAgICB3aWRlXG4gICAgICAgICAgICAgIHRvbmU9e0MuYW1iZXJ9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGJ1eShpdGVtKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgICB7IW93bmVkICYmICFhZmZvcmQgJiYgKFxuICAgICAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiwgY29sb3I6IEMucmVkIH19PlxuICAgICAgICAgICAgICBJTlNVRkZJQ0lFTlQgQ1JFRElUU1xuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvbm9kZT5cbiAgICAgIDwvRGV0YWlsPlxuICAgIDwvPlxuICApO1xufVxuXG5mdW5jdGlvbiBTZWxsKHtcbiAgc2xvdCxcbiAgbGl2ZSxcbiAgb25TbG90LFxufToge1xuICBzbG90OiBudW1iZXI7XG4gIGxpdmU6IGJvb2xlYW47XG4gIG9uU2xvdDogKHNsb3Q6IG51bWJlcikgPT4gdm9pZDtcbn0pIHtcbiAgY29uc3Qgc2xvdHMgPSB1c2VHYW1lKChnKSA9PiBnLnBhY2suc2xvdHMpO1xuICBjb25zdCBzID0gc2xvdHNbc2xvdF07XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxMaXN0PlxuICAgICAgICB7c2xvdHMubWFwKCh4LCBpKSA9PlxuICAgICAgICAgIHggPyAoXG4gICAgICAgICAgICA8SXRlbVJvd1xuICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgIGl0ZW09e3guaXRlbX1cbiAgICAgICAgICAgICAgY291bnQ9e3guY291bnR9XG4gICAgICAgICAgICAgIG9uPXtpID09PSBzbG90fVxuICAgICAgICAgICAgICB2YWx1ZT17Y3JlZGl0cyhzZWxsUHJpY2UoeC5pdGVtKSl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBvblNsb3QoaSk7XG4gICAgICAgICAgICAgICAgY3VlKFwidGlja1wiKTtcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGwsXG4gICAgICAgICl9XG4gICAgICA8L0xpc3Q+XG4gICAgICA8RGV0YWlsIGl0ZW09e3M/Lml0ZW19IGxpdmU9e2xpdmV9PlxuICAgICAgICB7cyAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxub2RlIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwicm93XCIsIGdhcDogMzQgfX0+XG4gICAgICAgICAgICAgIDxGaWd1cmVcbiAgICAgICAgICAgICAgICBsYWJlbD1cIlBBWVNcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjcmVkaXRzKHNlbGxQcmljZShzLml0ZW0pKX1cbiAgICAgICAgICAgICAgICBjb2xvcj17Qy5hbWJlcn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEZpZ3VyZSBsYWJlbD1cIkNBUlJJRURcIiB2YWx1ZT17U3RyaW5nKHMuY291bnQpfSAvPlxuICAgICAgICAgICAgPC9ub2RlPlxuICAgICAgICAgICAgPEhvbG9CdXR0b25cbiAgICAgICAgICAgICAgbGFiZWw9XCJTRUxMIE9ORVwiXG4gICAgICAgICAgICAgIHdpZGVcbiAgICAgICAgICAgICAgdG9uZT17Qy5hbWJlcn1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsbChzbG90KX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC8+XG4gICAgICAgICl9XG4gICAgICA8L0RldGFpbD5cbiAgICA8Lz5cbiAgKTtcbn1cblxuLyoqIFRoZSBwYWNrIGFuZCB0aGUgc2FmZSBzaWRlIGJ5IHNpZGU6IGNsaWNrIGEgc2xvdCB0byBtb3ZlIGl0IGFjcm9zcy4gKi9cbmZ1bmN0aW9uIFNhZmUoKSB7XG4gIGNvbnN0IHBhY2sgPSB1c2VHYW1lKChnKSA9PiBnLnBhY2spO1xuICBjb25zdCB1c2VkID0gcGFjay5zbG90cy5maWx0ZXIoQm9vbGVhbikubGVuZ3RoO1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDEwIH19PlxuICAgICAgICA8SGVhZGluZ1xuICAgICAgICAgIHRleHQ9e2BTVUlUIMK3ICR7dXNlZH0gLyAke1BBQ0tfU0xPVFN9YH1cbiAgICAgICAgICBoaW50PVwiQ0xJQ0sgVE8gU1RPUkUg4oaSXCJcbiAgICAgICAgLz5cbiAgICAgICAgPExpc3Qgd2lkdGg9ezU5MH0+XG4gICAgICAgICAge3BhY2suc2xvdHMubWFwKCh4LCBpKSA9PlxuICAgICAgICAgICAgeCA/IChcbiAgICAgICAgICAgICAgPEl0ZW1Sb3dcbiAgICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgICAgaXRlbT17eC5pdGVtfVxuICAgICAgICAgICAgICAgIGNvdW50PXt4LmNvdW50fVxuICAgICAgICAgICAgICAgIG9uPXtmYWxzZX1cbiAgICAgICAgICAgICAgICB2YWx1ZT1cIuKAulwiXG4gICAgICAgICAgICAgICAgdmFsdWVDb2xvcj17Qy5jeWFufVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHN0b3coaSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApIDogbnVsbCxcbiAgICAgICAgICApfVxuICAgICAgICA8L0xpc3Q+XG4gICAgICA8L25vZGU+XG4gICAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDEwIH19PlxuICAgICAgICA8SGVhZGluZ1xuICAgICAgICAgIHRleHQ9e2BTQUZFIMK3ICR7cGFjay5zYWZlLmxlbmd0aH0gU1RBQ0tTYH1cbiAgICAgICAgICBoaW50PVwi4oaQIENMSUNLIFRPIFRBS0VcIlxuICAgICAgICAvPlxuICAgICAgICA8TGlzdCB3aWR0aD17NTkwfT5cbiAgICAgICAgICB7cGFjay5zYWZlLm1hcCgoeCwgaSkgPT4gKFxuICAgICAgICAgICAgPEl0ZW1Sb3dcbiAgICAgICAgICAgICAga2V5PXt4Lml0ZW19XG4gICAgICAgICAgICAgIGl0ZW09e3guaXRlbX1cbiAgICAgICAgICAgICAgY291bnQ9e3guY291bnR9XG4gICAgICAgICAgICAgIG9uPXtmYWxzZX1cbiAgICAgICAgICAgICAgdmFsdWU9XCLigLlcIlxuICAgICAgICAgICAgICB2YWx1ZUNvbG9yPXtDLmN5YW59XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHJldHJpZXZlKGkpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9MaXN0PlxuICAgICAgPC9ub2RlPlxuICAgIDwvPlxuICApO1xufVxuXG5mdW5jdGlvbiBIZWFkaW5nKHsgdGV4dCwgaGludCB9OiB7IHRleHQ6IHN0cmluZzsgaGludDogc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZmxleERpcmVjdGlvbjogXCJyb3dcIixcbiAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwic3BhY2VCZXR3ZWVuXCIsXG4gICAgICAgIHdpZHRoOiA1OTAsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuc21hbGwsIGxldHRlclNwYWNpbmc6IDMsIGNvbG9yOiBDLmN5YW4gfX0+XG4gICAgICAgIHt0ZXh0fVxuICAgICAgPC90ZXh0PlxuICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT57aGludH08L3RleHQ+XG4gICAgPC9ub2RlPlxuICApO1xufVxuXG5mdW5jdGlvbiBGaWd1cmUoe1xuICBsYWJlbCxcbiAgdmFsdWUsXG4gIGNvbG9yID0gQy5jeWFuLFxufToge1xuICBsYWJlbDogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBjb2xvcj86IHN0cmluZztcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8bm9kZSBzdHlsZT17eyBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDIgfX0+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULnNtYWxsLCBsZXR0ZXJTcGFjaW5nOiAyIH19PntsYWJlbH08L3RleHQ+XG4gICAgICA8dGV4dCBzdHlsZT17eyAuLi5ULm51bWJlciwgZm9udFNpemU6IDI4LCBjb2xvciB9fT57dmFsdWV9PC90ZXh0PlxuICAgIDwvbm9kZT5cbiAgKTtcbn1cbiIsICJpbXBvcnQgdHlwZSB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgSVRFTVMsIHR5cGUgSXRlbUlkIH0gZnJvbSBcIi4uLy4uL2dhbWUvaXRlbXNcIjtcbmltcG9ydCB7IEMsIEYsIFQgfSBmcm9tIFwiLi4vLi4vdGhlbWVcIjtcbmltcG9ydCB7IEl0ZW1JY29uLCBLSU5EX0xBQkVMIH0gZnJvbSBcIi4uL3NoYXJlZC9pdGVtc1wiO1xuaW1wb3J0IHsgUnVsZSB9IGZyb20gXCIuLi9zaGFyZWQva2l0XCI7XG5cbi8qKiBUaGUgc3RvcmUncyBsaXN0IHJvd3MgYW5kIGl0cyBkZXRhaWwgcGFuZS4gKi9cblxuLyoqIE9uZSBpdGVtIHJvdzogaWNvbiwgbmFtZSBhbmQga2luZCwgYW5kIGEgdmFsdWUgb24gdGhlIHJpZ2h0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEl0ZW1Sb3coe1xuICBpdGVtLFxuICBjb3VudCxcbiAgb24sXG4gIHZhbHVlLFxuICB2YWx1ZUNvbG9yID0gQy5hbWJlcixcbiAgb25DbGljayxcbn06IHtcbiAgaXRlbTogSXRlbUlkO1xuICBjb3VudD86IG51bWJlcjtcbiAgb246IGJvb2xlYW47XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHZhbHVlQ29sb3I/OiBzdHJpbmc7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgIGZsZXhEaXJlY3Rpb246IFwicm93XCIsXG4gICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgIGdhcDogMTQsXG4gICAgICAgIGhlaWdodDogNzQsXG4gICAgICAgIHBhZGRpbmc6IHsgaG9yaXpvbnRhbDogMTAgfSxcbiAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICBib3JkZXJDb2xvcjogb24gPyBDLndoaXRlIDogXCJyZ2JhKDEyNywgMjI3LCAyNTUsIDAuMTYpXCIsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogb25cbiAgICAgICAgICA/IFwicmdiYSgyNDAsIDI1MywgMjU1LCAwLjA4KVwiXG4gICAgICAgICAgOiBcInJnYmEoNCwgMTgsIDI4LCAwLjQpXCIsXG4gICAgICAgIGN1cnNvcjogXCJwb2ludGVyXCIsXG4gICAgICB9fVxuICAgICAgaG92ZXJTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjEpXCIgfX1cbiAgICA+XG4gICAgICA8SXRlbUljb24gaXRlbT17aXRlbX0gc2l6ZT17NjB9IGNvdW50PXtjb3VudH0gbGl0PXtvbn0gLz5cbiAgICAgIDxub2RlXG4gICAgICAgIHN0eWxlPXt7IGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGdhcDogMiwgZmxleEdyb3c6IDEsIGZsZXhTaHJpbms6IDEgfX1cbiAgICAgID5cbiAgICAgICAgPHRleHRcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgZm9udEZhbWlseTogRi5zZW1pYm9sZCxcbiAgICAgICAgICAgIGZvbnRTaXplOiAxOSxcbiAgICAgICAgICAgIGxldHRlclNwYWNpbmc6IDEuNSxcbiAgICAgICAgICAgIGNvbG9yOiBvbiA/IEMud2hpdGUgOiBDLmN5YW4sXG4gICAgICAgICAgICBsaW5lQnJlYWs6IFwibm9XcmFwXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtJVEVNU1tpdGVtXS5uYW1lLnRvVXBwZXJDYXNlKCl9XG4gICAgICAgIDwvdGV4dD5cbiAgICAgICAgPHRleHQgc3R5bGU9e3sgLi4uVC5zbWFsbCwgbGV0dGVyU3BhY2luZzogMiB9fT5cbiAgICAgICAgICB7S0lORF9MQUJFTFtJVEVNU1tpdGVtXS5raW5kXX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9ub2RlPlxuICAgICAgPHRleHQgc3R5bGU9e3sgZm9udEZhbWlseTogRi5kaXNwbGF5LCBmb250U2l6ZTogMTksIGNvbG9yOiB2YWx1ZUNvbG9yIH19PlxuICAgICAgICB7dmFsdWV9XG4gICAgICA8L3RleHQ+XG4gICAgPC9idXR0b24+XG4gICk7XG59XG5cbi8qKiBBIHNjcm9sbGluZyBjb2x1bW4gb2Ygcm93cyAodGhlIHdoZWVsIHdvcmtzIGluIGhvbG9ncmFtcykuICovXG5leHBvcnQgZnVuY3Rpb24gTGlzdCh7XG4gIHdpZHRoID0gNjAwLFxuICBjaGlsZHJlbixcbn06IHtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG59KSB7XG4gIHJldHVybiAoXG4gICAgPG5vZGVcbiAgICAgIHNjcm9sbFN0ZXA9ezQwfVxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgIGhlaWdodDogNTQwLFxuICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICBnYXA6IDYsXG4gICAgICAgIG92ZXJmbG93WTogXCJzY3JvbGxcIixcbiAgICAgICAgdHJhbnNpdGlvbjogeyBzY3JvbGw6IHsgZHVyYXRpb246IDE4MCwgZWFzaW5nOiBcImVhc2VPdXRcIiB9IH0sXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG59XG5cbi8qKiBUaGUgc2VsZWN0ZWQgaXRlbSB1cCBjbG9zZTogdGhlIHR1cm50YWJsZSAod2hpbGUgaGUgaXMgYXQgaXQg4oCUIHRoZVxuICogIGBwcmV2aWV3YCBjYW1lcmEgcmVuZGVycyBvbmx5IHdoaWxlIGEgcG9ydGFsIHNob3dzIGl0KSwgaXRzIG5hbWUgYW5kXG4gKiAgdGV4dCwgdGhlbiB0aGUgcGFnZSdzIG93biBsaW5lcyBhbmQgYnV0dG9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERldGFpbCh7XG4gIGl0ZW0sXG4gIGxpdmUsXG4gIGNoaWxkcmVuLFxufToge1xuICBpdGVtOiBJdGVtSWQgfCB1bmRlZmluZWQ7XG4gIGxpdmU6IGJvb2xlYW47XG4gIGNoaWxkcmVuPzogUmVhY3ROb2RlO1xufSkge1xuICBpZiAoIWl0ZW0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3sgZmxleEdyb3c6IDEsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiIH19XG4gICAgICA+XG4gICAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQubGFiZWwsIGNvbG9yOiBDLmN5YW5EaW0sIGxldHRlclNwYWNpbmc6IDQgfX0+XG4gICAgICAgICAgTk9USElORyBTRUxFQ1RFRFxuICAgICAgICA8L3RleHQ+XG4gICAgICA8L25vZGU+XG4gICAgKTtcbiAgfVxuICByZXR1cm4gKFxuICAgIDxub2RlIHN0eWxlPXt7IGZsZXhHcm93OiAxLCBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLCBnYXA6IDEyIH19PlxuICAgICAgPG5vZGVcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMzQwLFxuICAgICAgICAgIGhlaWdodDogMjgwLFxuICAgICAgICAgIGFsaWduU2VsZjogXCJjZW50ZXJcIixcbiAgICAgICAgICBib3JkZXI6IDEsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgxMjcsIDIyNywgMjU1LCAwLjI1KVwiLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDIsIDEwLCAxNiwgMSlcIixcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2xpdmUgJiYgKFxuICAgICAgICAgIDxwb3J0YWxcbiAgICAgICAgICAgIHRhcmdldD1cInByZXZpZXdcIlxuICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IFwiMTAwJVwiLCBjYWNoZTogXCJuZXZlclwiIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKX1cbiAgICAgIDwvbm9kZT5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuaGVhZGVyLCBmb250U2l6ZTogMjUsIGNvbG9yOiBDLndoaXRlIH19PlxuICAgICAgICB7SVRFTVNbaXRlbV0ubmFtZS50b1VwcGVyQ2FzZSgpfVxuICAgICAgPC90ZXh0PlxuICAgICAgPFJ1bGUgLz5cbiAgICAgIDx0ZXh0IHN0eWxlPXt7IC4uLlQuYm9keSwgZm9udFNpemU6IDE5IH19PntJVEVNU1tpdGVtXS50ZXh0fTwvdGV4dD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L25vZGU+XG4gICk7XG59XG4iLCAiaW1wb3J0IHtcbiAgY2FsbCxcbiAgZmlyZSxcbiAgaGVhbCxcbiAgaGl0LFxuICBsb2FkLFxuICBsb2NhdGUsXG4gIG5leHREZXN0aW5hdGlvbixcbiAgcmVsb2FkLFxuICBzYXZlLFxuICBzdGFzaXMsXG4gIHN3YXAsXG4gIHZhY3V1bSxcbn0gZnJvbSBcIi4vZ2FtZS9hY3RcIjtcbmltcG9ydCB7IERFU1RJTkFUSU9OUywgdHlwZSBEZXN0aW5hdGlvbiB9IGZyb20gXCIuL2dhbWUvc3RhdGVcIjtcbmltcG9ydCB7IGRpc3BhdGNoLCBnZXRHYW1lIH0gZnJvbSBcIi4vZ2FtZS9zdG9yZVwiO1xuaW1wb3J0IHsgdXNlRGVidWcsIHVzZUV2ZW50LCB1c2VLZXlzIH0gZnJvbSBcIi4vaG9va3NcIjtcbmltcG9ydCB7IGN1ZSB9IGZyb20gXCIuL3NvdW5kXCI7XG5cbi8qKiBPcGVuIG9yIGZvbGQgdGhlIHN1aXQgbWVudS4gKi9cbmZ1bmN0aW9uIG1lbnUob3BlbjogYm9vbGVhbikge1xuICBpZiAoZGlzcGF0Y2goeyB0eXBlOiBcIm1lbnVcIiwgb3BlbiB9KSkgY3VlKG9wZW4gPyBcImhvbG9PcGVuXCIgOiBcImhvbG9DbG9zZVwiKTtcbn1cblxuLyoqIFRoZSBzdWl0J3Mga2V5cyAoQmV2eSByZWFkcyB0aGUgb25lcyBoZWxkIGV2ZXJ5IGZyYW1lOiBXIEEgUyBELCBTaGlmdFxuICogIGFuZCB0aGUgbW91c2UpLCB0aGUgdHJpZ2dlciBCZXZ5IHB1bGxzLCBhbmQgdGhlIGAtLXNob290YCB2ZXJicyBmb3JcbiAqICBldmVyeXRoaW5nIGhlIGRvZXMgb3V0c2lkZSBhIGhvbG9ncmFtLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbnRyb2xzKCkge1xuICB1c2VLZXlzKHRydWUsIChlKSA9PiB7XG4gICAgY29uc3QgeyBoZXJlIH0gPSBnZXRHYW1lKCk7XG4gICAgaWYgKGUuY29kZSA9PT0gXCJUYWJcIikgcmV0dXJuIG1lbnUoIWhlcmUubWVudSk7XG4gICAgLy8gUmVhZGluZyB0aGUgbWVudSBoZSBzdGFuZHMgc3RpbGw6IGEgc3RlcCBmb2xkcyBpdCwgYW5kIHNvIGRvZXMgRlxuICAgIC8vIChhcyBpdCBsZXRzIGdvIG9mIGFueSBvdGhlciBzY3JlZW4pLlxuICAgIGlmIChoZXJlLm1lbnUpIHtcbiAgICAgIGlmICgvXktleVtXQVNERl0kLy50ZXN0KGUuY29kZSkpIG1lbnUoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZS5jb2RlID09PSBcIktleVJcIikgcmVsb2FkKCk7XG4gICAgZWxzZSBpZiAoZS5jb2RlID09PSBcIktleVFcIikgc3dhcCgpO1xuICAgIGVsc2UgaWYgKGUuY29kZSA9PT0gXCJLZXlNXCIpIGhlYWwoKTtcbiAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5Q1wiKSBzdGFzaXMoKTtcbiAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5SFwiKSBoaXQoKTtcbiAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5VlwiKSB2YWN1dW0oKTtcbiAgICBlbHNlIGlmIChlLmNvZGUgPT09IFwiS2V5TFwiKSB7XG4gICAgICBpZiAoZS5zaGlmdEtleSkgbmV4dERlc3RpbmF0aW9uKCk7XG4gICAgICBlbHNlIGxvY2F0ZSgpO1xuICAgIH1cbiAgfSk7XG4gIHVzZUV2ZW50KFwicGxheWVyLmZpcmVcIiwgKCkgPT4gZmlyZSgpKTtcblxuICB1c2VEZWJ1ZyhcIm1lbnVcIiwgKGFyZykgPT4gbWVudShhcmcgIT09IFwib2ZmXCIpKTtcbiAgdXNlRGVidWcoXCJoaXRcIiwgaGl0KTtcbiAgdXNlRGVidWcoXCJoZWFsXCIsIGhlYWwpO1xuICB1c2VEZWJ1ZyhcInN0YXNpc1wiLCBzdGFzaXMpO1xuICB1c2VEZWJ1ZyhcInZhY3V1bVwiLCAoYXJnKSA9PiB2YWN1dW0oYXJnID8gYXJnID09PSBcIm9uXCIgOiB1bmRlZmluZWQpKTtcbiAgdXNlRGVidWcoXCJmaXJlXCIsIGZpcmUpO1xuICB1c2VEZWJ1ZyhcInJlbG9hZFwiLCByZWxvYWQpO1xuICB1c2VEZWJ1ZyhcInN3YXBcIiwgc3dhcCk7XG4gIHVzZURlYnVnKFwibG9jYXRvclwiLCAodG8pID0+IHtcbiAgICBpZiAoREVTVElOQVRJT05TLmluY2x1ZGVzKHRvIGFzIERlc3RpbmF0aW9uKSkgbG9jYXRlKHRvIGFzIERlc3RpbmF0aW9uKTtcbiAgICBlbHNlIGxvY2F0ZSgpO1xuICB9KTtcbiAgdXNlRGVidWcoXCJlbGV2YXRvclwiLCAoZmxvb3IpID0+IGNhbGwoTnVtYmVyKGZsb29yKSkpO1xuICB1c2VEZWJ1ZyhcInNhdmVcIiwgc2F2ZSk7XG4gIHVzZURlYnVnKFwibG9hZFwiLCAoaWQpID0+IGxvYWQoTnVtYmVyKGlkKSkpO1xuICByZXR1cm4gbnVsbDtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBLGFBQU8sVUFBVSxXQUFXLGFBQWEsd0JBQXdCO0FBQUE7QUFBQTs7O0FDQWpFO0FBQUE7QUFBQSxhQUFPLFVBQVUsV0FBVyxhQUFhLFlBQVk7QUFBQTtBQUFBOzs7QUNBckQ7QUFBQTtBQUFBLGFBQU8sVUFBVSxXQUFXLGFBQWEsT0FBTztBQUFBO0FBQUE7Ozs7QUNBaEQsTUFBQUEscUJBQXNCOzs7O0FDQXRCLE1BQUFDLGlCQUFrQzs7O0FDS2xDLDBCQUtPO0FBMGZBLFdBQVNDLEtBQW9DQyxNQUFTQyxPQUF1QjtBQUNsRkMsMEJBQUFBLE1BQVFGLE1BQU1DLEtBQUFBO0VBQ2hCO0FBR08sV0FBU0UsUUFDZEgsTUFDQUMsT0FBa0M7QUFFbEMsZUFBT0csa0JBQUFBLFNBQVdKLE1BQU1DLEtBQUFBO0VBQzFCO0FBR08sV0FBU0ksR0FDZEwsTUFDQU0sSUFBbUM7QUFFbkNDLDBCQUFBQSxrQkFBb0JQLE1BQU1NLEVBQUFBO0FBQzFC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O1FBQ0QseUNBQUFSLEtBQUNTLE9BQUFBLENBQUFBLENBQUFBO1FBQ0QseUNBQUFULEtBQUNVLE1BQUFBLENBQUFBLENBQUFBO1FBQ0QseUNBQUFWLEtBQUNXLE1BQUFBLENBQUFBLENBQUFBO1FBQ0QseUNBQUFYLEtBQUNZLFVBQUFBLENBQUFBLENBQUFBO1FBQ0QseUNBQUFaLEtBQUNhLE9BQUFBLENBQUFBLENBQUFBO1FBQ0QseUNBQUFiLEtBQUNjLE1BQUFBLENBQUFBLENBQUFBO1FBQ0QseUNBQUFkLEtBQUNlLFVBQUFBLENBQUFBLENBQUFBOzs7RUFHUDs7O0FEM0hBQyxnQ0FBTSx5Q0FBQUMsS0FBQ0MsS0FBQUEsQ0FBQUEsQ0FBQUEsQ0FBQUE7IiwKICAibmFtZXMiOiBbImltcG9ydF9iZXZ5X3JlYWN0IiwgImltcG9ydF9yZWFjdCIsICJlbWl0IiwgIm5hbWUiLCAidmFsdWUiLCAicmF3RW1pdCIsICJyZXF1ZXN0IiwgInJhd1JlcXVlc3QiLCAib24iLCAiY2IiLCAicmF3QWRkRXZlbnRMaXN0ZW5lciIsICJyYXdSZW1vdmVFdmVudExpc3RlbmVyIiwgInJlbW92ZUV2ZW50TGlzdGVuZXIiLCAiYmV2eSIsICJhZGRFdmVudExpc3RlbmVyIiwgImRvb3IiLCAidW5sb2NrIiwgImVsZXZhdG9yIiwgImNhbGwiLCAiZ2FtZXBhZCIsICJnZXRBbGwiLCAicnVtYmxlIiwgInN0b3BSdW1ibGUiLCAiaGFjayIsICJzaG9jayIsICJob2xvIiwgIm9wZW4iLCAibG9jYXRvciIsICJzaG93IiwgIm1hcCIsICJtYXJrIiwgIm9yYml0IiwgInpvb20iLCAicGxheWVyIiwgInN5bmMiLCAicHJldmlldyIsICJzb3VuZCIsICJjdWUiLCAic3VpdCIsICJoZWFsIiwgImhpdCIsICJzdGFzaXMiLCAidmFjdXVtIiwgIndlYXBvbiIsICJlcXVpcCIsICJmaXJlIiwgInJlbG9hZCIsICJ3aW5kb3ciLCAic2l6ZSIsICJPQkpFQ1RJVkVTIiwgInRvIiwgInRpdGxlIiwgInRleHQiLCAiTE9HUyIsICJpZCIsICJmcm9tIiwgImF1ZGlvIiwgIkJFTkNIX1RBUkdFVFMiLCAiQk9BUkQiLCAiY2lyY3VpdCIsICJraW5kcyIsICJtYXAiLCAiaWQiLCAieCIsICJ5IiwgImxpbmtzIiwgImtpbmQiLCAiQ0lSQ1VJVFMiLCAiY3V0dGVyIiwgImEiLCAiYTIiLCAiYiIsICJiMiIsICJjMiIsICJkIiwgImQyIiwgImUiLCAicHVsc2UiLCAiYyIsICJyYWlsIiwgInJpZyIsICJTVEFUX05BTUVTIiwgIm5hbWVzIiwgImRhbWFnZSIsICJjYXBhY2l0eSIsICJyZWxvYWQiLCAic3BlY2lhbCIsICJzdGFydCIsICJlbXB0eSIsICJTVEFUUyIsICJzdGF0cyIsICJ0YXJnZXQiLCAiaW5zdGFsbGVkIiwgIm5vZGVzIiwgImZpbHRlciIsICJuIiwgImluY2x1ZGVzIiwgImNvdW50IiwgImxlbmd0aCIsICJzIiwgImF0IiwgImJhc2UiLCAic3RlcCIsICJNYXRoIiwgInJvdW5kIiwgImNhbkluc3RhbGwiLCAibm9kZSIsICJmaW5kIiwgInNvbWUiLCAibCIsICJJVEVNUyIsICJuYW1lIiwgImtpbmQiLCAicHJpY2UiLCAic3RhY2siLCAidGV4dCIsICJzZW1pY29uZHVjdG9yIiwgImN1dHRlciIsICJwdWxzZSIsICJyYWlsIiwgIklURU1fSURTIiwgIk9iamVjdCIsICJrZXlzIiwgIldFQVBPTlMiLCAiV0VBUE9OX0FNTU8iLCAiYW1tbyIsICJwZXJJdGVtIiwgIlBBQ0tfU0xPVFMiLCAiaW5pdGlhbFBhY2siLCAic2xvdHMiLCAiaXRlbSIsICJjb3VudCIsICJsZW5ndGgiLCAicHVzaCIsICJjcmVkaXRzIiwgInNhZmUiLCAiY291bnRJdGVtIiwgInBhY2siLCAicmVkdWNlIiwgIm4iLCAicyIsICJhZGRJdGVtIiwgIm1hcCIsICJsZWZ0IiwgInRha2UiLCAiTWF0aCIsICJtaW4iLCAiaSIsICJ0YWtlSXRlbSIsICJzZWxsUHJpY2UiLCAicm91bmQiLCAiU3RyaW5nIiwgInJlcGxhY2UiLCAiSEVBTFMiLCAiSElUIiwgIlNUQVNJU19DT1NUIiwgIlNVRkZPQ0FURSIsICJjbGlwU2l6ZSIsICJnIiwgIndlYXBvbiIsICJzdGF0cyIsICJiZW5jaCIsICJjYXBhY2l0eSIsICJhaXJNYXgiLCAicmlnIiwgInJlc2VydmUiLCAiYW1tbyIsICJwZXJJdGVtIiwgIldFQVBPTl9BTU1PIiwgImNvdW50SXRlbSIsICJwYWNrIiwgIm9iamVjdGl2ZSIsICJzdG9yeSIsICJib3VnaHQiLCAiY3V0dGVyIiwgImxlbmd0aCIsICJmaXh0dXJlcyIsICJkb29yIiwgIk9CSkVDVElWRVMiLCAicmVkdWNlIiwgImEiLCAidHlwZSIsICJuZWFyIiwgImhlcmUiLCAiaW5jbHVkZXMiLCAic3VyZmFjZSIsICJvbiIsICJuZXh0IiwgImZpbHRlciIsICJzIiwgImFpbWluZyIsICJtb3VzZSIsICJzY3JlZW4iLCAib2ZmZXIiLCAibWVudSIsICJvcGVuIiwgImludHJvIiwgImFybW9yIiwgImRhbWFnZSIsICJoZWFsdGgiLCAiTWF0aCIsICJtYXgiLCAic3VpdCIsICJhbW91bnQiLCAiaXRlbSIsICJ0YWtlSXRlbSIsICJtaW4iLCAic3Rhc2lzIiwgInZhY3V1bSIsICJhaXIiLCAiZHQiLCAiY2xpcCIsICJhcm1zIiwgInNpemUiLCAib3duZWQiLCAiSVRFTVMiLCAicHJpY2UiLCAiY3JlZGl0cyIsICJraW5kIiwgImFkZEl0ZW0iLCAic2xvdCIsICJzbG90cyIsICJzZWxsUHJpY2UiLCAibWFwIiwgImkiLCAia2VwdCIsICJzYWZlIiwgImZpbmQiLCAiY291bnQiLCAic3RvcmVkIiwgImluZGV4IiwgIl8iLCAiaW5zdGFsbGVkIiwgInRhcmdldCIsICJjYW5JbnN0YWxsIiwgIm5vZGUiLCAicmVhZCIsICJsb2ciLCAiaWQiLCAic2F2ZXMiLCAiYXQiLCAiY29weSIsICJ0aW1lIiwgImdhbWUiLCAibG9jYXRvciIsICJlbGV2YXRvciIsICJmbG9vciIsICJ0byIsICJERVNUSU5BVElPTlMiLCAiaW5pdGlhbEdhbWUiLCAiaGVyZSIsICJuZWFyIiwgImFpbWluZyIsICJtb3VzZSIsICJzY3JlZW4iLCAib2ZmZXIiLCAibWVudSIsICJpbnRybyIsICJzdWl0IiwgImhlYWx0aCIsICJzdGFzaXMiLCAidmFjdXVtIiwgImFpciIsICJhcm1zIiwgIndlYXBvbiIsICJvd25lZCIsICJjbGlwIiwgImN1dHRlciIsICJwdWxzZSIsICJyYWlsIiwgInBhY2siLCAiaW5pdGlhbFBhY2siLCAiYmVuY2giLCAicmlnIiwgInN0b3J5IiwgImJvdWdodCIsICJyZWFkIiwgImZpeHR1cmVzIiwgImRvb3IiLCAiZWxldmF0b3IiLCAiZmxvb3IiLCAidGFyZ2V0IiwgInNhdmVzIiwgImxvY2F0b3IiLCAiZyIsICJnbG9iYWxUaGlzIiwgInN0b3JlIiwgIl9fY29sZHdha2UiLCAiZ2FtZSIsICJpbml0aWFsR2FtZSIsICJsaXN0ZW5lcnMiLCAiU2V0IiwgImdldEdhbWUiLCAiZGlzcGF0Y2giLCAiYWN0aW9uIiwgIm5leHQiLCAicmVkdWNlIiwgImZvckVhY2giLCAibCIsICJzdWJzY3JpYmUiLCAibGlzdGVuZXIiLCAiYWRkIiwgImRlbGV0ZSIsICJ1c2VHYW1lIiwgInNlbGVjdCIsICJ1c2VTeW5jRXh0ZXJuYWxTdG9yZSIsICJpbXBvcnRfcmVhY3QiLCAidXNlRXZlbnQiLCAibmFtZSIsICJydW4iLCAibGF0ZXN0IiwgInVzZVJlZiIsICJjdXJyZW50IiwgInVzZUVmZmVjdCIsICJvbiIsICJ2YWx1ZSIsICJ1c2VLZXlzIiwgImFjdGl2ZSIsICJlIiwgInJlcGVhdCIsICJ1c2VEZWJ1ZyIsICJ2ZXJiIiwgImFjdGlvbiIsICJoZWFkIiwgInJlc3QiLCAic3BsaXQiLCAiam9pbiIsICJDIiwgImN5YW4iLCAiY3lhbkhpIiwgImN5YW5EaW0iLCAiY3lhbkRlZXAiLCAiY3lhbkZhaW50IiwgImN5YW5MaW5lIiwgIndoaXRlIiwgImFtYmVyIiwgImFtYmVyRGltIiwgInJlZCIsICJyZWREaW0iLCAicmVkRmFpbnQiLCAiZ3JlZW4iLCAiZ3JlZW5EaW0iLCAiZ2xhc3MiLCAiZ2xhc3NIaSIsICJzaGFkZSIsICJjbGVhciIsICJGIiwgInJlZ3VsYXIiLCAic2VtaWJvbGQiLCAiYm9sZCIsICJkaXNwbGF5IiwgIlQiLCAiaGVhZGVyIiwgImZvbnRGYW1pbHkiLCAiZm9udFNpemUiLCAiY29sb3IiLCAibGV0dGVyU3BhY2luZyIsICJsaW5lQnJlYWsiLCAibGFiZWwiLCAiYm9keSIsICJsaW5lSGVpZ2h0IiwgInNtYWxsIiwgIm51bWJlciIsICJmcmFtZSIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYmFja2dyb3VuZENvbG9yIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJjdWUiLCAibmFtZSIsICJiZXZ5IiwgInNvdW5kIiwgImdsaXRjaGVycyIsICJTZXQiLCAiZ2xpdGNoIiwgInN1cmZhY2UiLCAiZm9yRWFjaCIsICJydW4iLCAib25HbGl0Y2giLCAiYWRkIiwgImRlbGV0ZSIsICJkZW55IiwgImN1ZSIsICJoaXQiLCAiZGlzcGF0Y2giLCAidHlwZSIsICJiZXZ5IiwgInN1aXQiLCAiaGVhbCIsICJwYWNrIiwgImdldEdhbWUiLCAibWlzc2luZyIsICJoZWFsdGgiLCAiaGF2ZSIsICJmaWx0ZXIiLCAiaWQiLCAic2xvdHMiLCAic29tZSIsICJzIiwgIml0ZW0iLCAiZml0IiwgInJldmVyc2UiLCAiZmluZCIsICJIRUFMUyIsICJ1c2UiLCAic2xvdCIsICJraW5kIiwgIklURU1TIiwgIndlYXBvbiIsICJXRUFQT05TIiwgInciLCAiYXJtcyIsICJyZWxvYWQiLCAic3Rhc2lzIiwgInZhY3V1bSIsICJvbiIsICJmaXJlIiwgImVxdWlwIiwgInN3YXAiLCAib3duZWQiLCAib3JkZXIiLCAiaW5jbHVkZXMiLCAiaW5kZXhPZiIsICJsZW5ndGgiLCAiYnV5IiwgInNlbGwiLCAic3RvdyIsICJyZXRyaWV2ZSIsICJpbmRleCIsICJpbnN0YWxsIiwgInRhcmdldCIsICJub2RlIiwgInJlYWQiLCAibG9nIiwgInVubG9jayIsICJkb29yIiwgInNob2NrIiwgImhhY2siLCAic2F2ZSIsICJub3ciLCAiRGF0ZSIsICJ0aW1lIiwgImdldEhvdXJzIiwgImdldE1pbnV0ZXMiLCAiZ2V0U2Vjb25kcyIsICJtYXAiLCAibiIsICJTdHJpbmciLCAicGFkU3RhcnQiLCAiam9pbiIsICJsb2FkIiwgImNhbGwiLCAiZmxvb3IiLCAiZWxldmF0b3IiLCAibG9jYXRlIiwgInRvIiwgIk9CSkVDVElWRVMiLCAib2JqZWN0aXZlIiwgImxvY2F0b3IiLCAic2hvdyIsICJuZXh0RGVzdGluYXRpb24iLCAiYXQiLCAiREVTVElOQVRJT05TIiwgImZpeHR1cmVzIiwgIlVTRSIsICJzdG9yZSIsICJiZW5jaCIsICJzYXZlIiwgImVsZXZhdG9yIiwgImhhY2siLCAiY29udHJvbHMiLCAiaGludCIsICJnIiwgIm1vdXNlIiwgInNjcmVlbiIsICJvZmZlciIsICJhaW1pbmciLCAiaW50cm8iLCAiaGVyZSIsICJpZCIsICJrZXlzIiwgIlBBTkVMUyIsICJvcGVuSG9sb3MiLCAiZyIsICJvcGVuIiwgImZpeHR1cmVzIiwgImRvb3IiLCAicHVzaCIsICJzdWl0IiwgInZhY3V1bSIsICJoZXJlIiwgImFpbWluZyIsICJtZW51IiwgImhpbnQiLCAiaXNMaXZlIiwgIm5hbWUiLCAiaW5jbHVkZXMiLCAibmVhciIsICJMSU5HRVJfTVMiLCAidXNlTGl2ZSIsICJuYW1lIiwgInVzZUdhbWUiLCAiZyIsICJpc0xpdmUiLCAidXNlSGVsZCIsICJoZXJlIiwgInNjcmVlbiIsICJIb2xvIiwgInBhZ2UiLCAic2VlZCIsICJzdHlsZSIsICJjaGlsZHJlbiIsICJvcGVuIiwgIm9wZW5Ib2xvcyIsICJpbmNsdWRlcyIsICJtb3VudGVkIiwgInNldE1vdW50ZWQiLCAidXNlU3RhdGUiLCAidXNlRWZmZWN0IiwgInQiLCAic2V0VGltZW91dCIsICJjbGVhclRpbWVvdXQiLCAiYnVyc3QiLCAidXNlU2hhcmVkVmFsdWUiLCAib25HbGl0Y2giLCAic3VyZmFjZSIsICJ2YWx1ZSIsICJ3aXRoU2VxdWVuY2UiLCAid2l0aFRpbWluZyIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAiX2pzeCIsICJ0YXJnZXQiLCAibm9kZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZmlsdGVyIiwgInBhcmFtcyIsICJpbnRlbnNpdHkiLCAiYW5pbWF0ZWQiLCAidW5kZWZpbmVkIiwgIm1vcnBoRmlsdGVyIiwgImtleSIsICJ0cmFuc2l0aW9uIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJ1c2VCbGluayIsICJvbiIsICJtcyIsICJsb3ciLCAidiIsICJ1c2VTaGFyZWRWYWx1ZSIsICJ1c2VFZmZlY3QiLCAidmFsdWUiLCAid2l0aFJlcGVhdCIsICJ3aXRoVGltaW5nIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJyZXZlcnNlIiwgInVzZVNwaW4iLCAic2VjcyIsICJNYXRoIiwgImFicyIsICJMT1ciLCAiY2xvY2siLCAic2VjcyIsICJzIiwgIk1hdGgiLCAiY2VpbCIsICJmbG9vciIsICJTdHJpbmciLCAicGFkU3RhcnQiLCAiQWlyIiwgIl9qc3giLCAiSG9sbyIsICJuYW1lIiwgInNlZWQiLCAiQWlyVGltZXIiLCAiYWlyIiwgInVzZUdhbWUiLCAiZyIsICJzdWl0IiwgIm1heCIsICJhaXJNYXgiLCAibG93IiwgImNvbG9yIiwgIkMiLCAicmVkIiwgImN5YW4iLCAiYmxpbmsiLCAidXNlQmxpbmsiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAicGFkZGluZyIsICJsZWZ0IiwgInJpZ2h0IiwgInRvcCIsICJib3R0b20iLCAiZmxleERpcmVjdGlvbiIsICJqdXN0aWZ5Q29udGVudCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiZ2xhc3MiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgInJlZERpbSIsICJjeWFuTGluZSIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImZvbnRTaXplIiwgImxldHRlclNwYWNpbmciLCAibGluZUJyZWFrIiwgImRpc3BsYXkiLCAid2hpdGUiLCAiY3lhbkRpbSIsICJtaW4iLCAiTUFYX1BJUFMiLCAiQW1tbyIsICJfanN4IiwgIkhvbG8iLCAibmFtZSIsICJzZWVkIiwgIkFtbW9Db3VudCIsICJ3ZWFwb24iLCAidXNlR2FtZSIsICJnIiwgImFybXMiLCAiY2xpcCIsICJzaXplIiwgImNsaXBTaXplIiwgInNwYXJlIiwgInJlc2VydmUiLCAiZW1wdHkiLCAiYmxpbmsiLCAidXNlQmxpbmsiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImZsZXhEaXJlY3Rpb24iLCAianVzdGlmeUNvbnRlbnQiLCAiYWxpZ25JdGVtcyIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImNvbG9yIiwgIkMiLCAiY3lhbiIsICJsaW5lQnJlYWsiLCAiSVRFTVMiLCAidG9VcHBlckNhc2UiLCAiVHJpRG90IiwgImdhcCIsICJkaXNwbGF5IiwgInJlZCIsICJ3aGl0ZSIsICJTdHJpbmciLCAicGFkU3RhcnQiLCAiYm90dG9tIiwgImJvbGQiLCAib3BhY2l0eSIsICJhbmltYXRlZCIsICJjeWFuRGltIiwgIlJvdW5kcyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiYmFja2dyb3VuZENvbG9yIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIl8iLCAiaSIsICJmbGV4R3JvdyIsICJjbGVhciIsICJjeWFuSGkiLCAic3ZnIiwgInZpZXdCb3giLCAibWFwIiwgIngiLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAiZmlsbCIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X3JlYWN0IiwgImltcG9ydF9iZXZ5X3JlYWN0IiwgIkJPQVJEIiwgIndpZHRoIiwgImhlaWdodCIsICJDRUxMIiwgIngiLCAieSIsICJSIiwgIktJTkRfQ09MT1IiLCAic3RhcnQiLCAiQyIsICJ3aGl0ZSIsICJkYW1hZ2UiLCAicmVkIiwgImNhcGFjaXR5IiwgImN5YW4iLCAicmVsb2FkIiwgImFtYmVyIiwgInNwZWNpYWwiLCAiZW1wdHkiLCAiY3lhbkRpbSIsICJTSE9SVCIsICJSSUdfU0hPUlQiLCAiY2VudGVyIiwgIm4iLCAiQ2lyY3VpdCIsICJ0YXJnZXQiLCAiaW5zdGFsbGVkIiwgImhvdmVyIiwgIm9uSG92ZXIiLCAib25JbnN0YWxsIiwgIm5vZGVzIiwgIkNJUkNVSVRTIiwgInBvd2VyZWQiLCAiaWQiLCAiaW5jbHVkZXMiLCAibGl2ZSIsICJ1c2VMaXZlIiwgInB1bHNlIiwgInVzZVNoYXJlZFZhbHVlIiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ3aXRoUmVwZWF0IiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgInJldmVyc2UiLCAibGlua3MiLCAiZmxhdE1hcCIsICJmaWx0ZXIiLCAibCIsICJtYXAiLCAiZmluZCIsICJtIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAic3ZnIiwgInZpZXdCb3giLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiXyIsICJpIiwgIl9qc3giLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgIk1hdGgiLCAiZmxvb3IiLCAiciIsICJmaWxsIiwgImEiLCAiYiIsICJwIiwgInEiLCAibGluZSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAib24iLCAibmV4dCIsICJjYW5JbnN0YWxsIiwgImNvbG9yIiwgImtpbmQiLCAiZyIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgInJlY3QiLCAiYnV0dG9uIiwgIm9uQ2xpY2siLCAib25Qb2ludGVyRW50ZXIiLCAib25Qb2ludGVyTGVhdmUiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAiYm9yZGVyUmFkaXVzIiwgImN1cnNvciIsICJob3ZlclN0eWxlIiwgImJhY2tncm91bmRDb2xvciIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImxlZ2VuZCIsICJraW5kcyIsICJuYW1lIiwgIlNUQVRfTkFNRVMiLCAiQ29ybmVycyIsICJzaXplIiwgIndpZHRoIiwgImNvbG9yIiwgIkMiLCAiY3lhbiIsICJhcm0iLCAic3R5bGUiLCAiX2pzeCIsICJub2RlIiwgInBvc2l0aW9uVHlwZSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiaCIsICJoZWlnaHQiLCAidiIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAibGVmdCIsICJ0b3AiLCAicmlnaHQiLCAiYm90dG9tIiwgIlNoZWxsIiwgImNoaWxkcmVuIiwgImZsZXhEaXJlY3Rpb24iLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJjeWFuTGluZSIsICJSdWxlIiwgImZsZXhTaHJpbmsiLCAiVGFicyIsICJ0YWJzIiwgImFjdGl2ZSIsICJvblBpY2siLCAiZGlzYWJsZWQiLCAiZ2FwIiwgIm1hcCIsICJpZCIsICJsYWJlbCIsICJvbiIsICJvZmYiLCAiaW5jbHVkZXMiLCAiYnV0dG9uIiwgIm9uQ2xpY2siLCAiY2xlYXIiLCAiY3lhbkZhaW50IiwgImN1cnNvciIsICJob3ZlclN0eWxlIiwgInVuZGVmaW5lZCIsICJ0ZXh0IiwgIlQiLCAibGV0dGVyU3BhY2luZyIsICJjeWFuRGVlcCIsICJ3aGl0ZSIsICJjeWFuRGltIiwgIkhvbG9CdXR0b24iLCAidG9uZSIsICJ3aWRlIiwgIm1pbldpZHRoIiwgImp1c3RpZnlDb250ZW50IiwgInByZXNzU3R5bGUiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImZvbnRTaXplIiwgImxpbmVCcmVhayIsICJCYXIiLCAidmFsdWUiLCAic2VnbWVudHMiLCAibGl0IiwgIk1hdGgiLCAicm91bmQiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiXyIsICJpIiwgImZsZXhHcm93IiwgIlRpY2siLCAiZ3JlZW4iLCAic3ZnIiwgInZpZXdCb3giLCAicG9seWxpbmUiLCAicG9pbnRzIiwgImZpbGwiLCAic3Ryb2tlIiwgInN0cm9rZVdpZHRoIiwgInN0cm9rZUxpbmVjYXAiLCAic3Ryb2tlTGluZWpvaW4iLCAiVEFCUyIsICJCRU5DSF9UQVJHRVRTIiwgIm1hcCIsICJpZCIsICJsYWJlbCIsICJJVEVNUyIsICJuYW1lIiwgInRvVXBwZXJDYXNlIiwgIkJlbmNoIiwgIm93bmVkIiwgInVzZUdhbWUiLCAiZyIsICJhcm1zIiwgImJlbmNoIiwgImNlbGxzIiwgImNvdW50SXRlbSIsICJwYWNrIiwgInRhcmdldCIsICJzZXRUYXJnZXQiLCAidXNlU3RhdGUiLCAiaG92ZXIiLCAic2V0SG92ZXIiLCAibG9ja2VkIiwgImZpbHRlciIsICJ0IiwgImluY2x1ZGVzIiwgInBpY2siLCAibmV4dCIsICJjdWUiLCAidXNlRGVidWciLCAiZmluZCIsICJub2RlIiwgImluc3RhbGwiLCAiX2pzeCIsICJIb2xvIiwgInBhZ2UiLCAic2VlZCIsICJfanN4cyIsICJTaGVsbCIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAiZ2FwIiwgInRleHQiLCAiVCIsICJoZWFkZXIiLCAiZm9udFNpemUiLCAibGV0dGVyU3BhY2luZyIsICJzbWFsbCIsICJmbGV4R3JvdyIsICJudW1iZXIiLCAiY29sb3IiLCAiQyIsICJncmVlbiIsICJyZWQiLCAiU3RyaW5nIiwgIm1hcmdpbiIsICJ0b3AiLCAiVGFicyIsICJ0YWJzIiwgImFjdGl2ZSIsICJvblBpY2siLCAiZGlzYWJsZWQiLCAiUnVsZSIsICJwYWRkaW5nIiwgImZsZXhTaHJpbmsiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImJhY2tncm91bmRDb2xvciIsICJDb3JuZXJzIiwgInNpemUiLCAid2lkdGgiLCAiQ2lyY3VpdCIsICJpbnN0YWxsZWQiLCAib25Ib3ZlciIsICJvbkluc3RhbGwiLCAiU3RhdHMiLCAibGVnZW5kIiwgImtpbmQiLCAiaGVpZ2h0IiwgImJvcmRlclJhZGl1cyIsICJLSU5EX0NPTE9SIiwgImZvcm1hdCIsICJzdGF0IiwgInYiLCAidG9GaXhlZCIsICJub3ciLCAic3RhdHMiLCAiQ0lSQ1VJVFMiLCAibiIsICJyZWFjaGFibGUiLCAiY2FuSW5zdGFsbCIsICJ0aGVuIiwgIm5hbWVzIiwgIlNUQVRfTkFNRVMiLCAicm93cyIsICJzdGF0ZSIsICJhbWJlciIsICJjeWFuRGltIiwgInIiLCAic3BlY2lhbCIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAiY3lhbkRlZXAiLCAiRkxPT1JTIiwgImZsb29yIiwgIm5hbWUiLCAiQXJyb3ciLCAidXAiLCAic2l6ZSIsICJjb2xvciIsICJDIiwgImFtYmVyIiwgIl9qc3giLCAic3ZnIiwgInZpZXdCb3giLCAic3R5bGUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgInBvbHlnb24iLCAicG9pbnRzIiwgImZpbGwiLCAiRWxldmF0b3IiLCAiZmxvb3IiLCAidGFyZ2V0IiwgInVzZUdhbWUiLCAiZyIsICJmaXh0dXJlcyIsICJlbGV2YXRvciIsICJibGluayIsICJ1c2VCbGluayIsICJfanN4IiwgIkhvbG8iLCAibmFtZSIsICJzZWVkIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImZsZXhEaXJlY3Rpb24iLCAiYmFja2dyb3VuZENvbG9yIiwgIkMiLCAiZ2xhc3MiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImN5YW5MaW5lIiwgImZsZXhTaHJpbmsiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJnYXAiLCAiYm90dG9tIiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGIiwgImRpc3BsYXkiLCAiZm9udFNpemUiLCAibGV0dGVyU3BhY2luZyIsICJjb2xvciIsICJjeWFuIiwgImxpbmVCcmVhayIsICJzbWFsbCIsICJmbGV4R3JvdyIsICJwYWRkaW5nIiwgIkZMT09SUyIsICJyZXZlcnNlIiwgIm1hcCIsICJmIiwgImhlcmUiLCAiY2FsbGVkIiwgImJ1dHRvbiIsICJvbkNsaWNrIiwgImNhbGwiLCAiaG9yaXpvbnRhbCIsICJ3aGl0ZSIsICJhbWJlciIsICJjeWFuRmFpbnQiLCAiZ2xhc3NIaSIsICJjbGVhciIsICJvcGFjaXR5IiwgImFuaW1hdGVkIiwgImhvdmVyU3R5bGUiLCAiaG92ZXIiLCAiY3lhbkRpbSIsICJib2xkIiwgInRvcCIsICJBcnJvdyIsICJ1cCIsICJzaXplIiwgInNlbWlib2xkIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfYmV2eV9yZWFjdCIsICJGbG9vciIsICJmbG9vciIsICJ0YXJnZXQiLCAidXNlR2FtZSIsICJnIiwgImZpeHR1cmVzIiwgImVsZXZhdG9yIiwgIm1vdmluZyIsICJ1cCIsICJuYW1lIiwgIkZMT09SUyIsICJmaW5kIiwgImYiLCAicnVuIiwgInVzZVNoYXJlZFZhbHVlIiwgInVzZUVmZmVjdCIsICJ2YWx1ZSIsICJ3aXRoUmVwZWF0IiwgIndpdGhUaW1pbmciLCAiZHVyYXRpb24iLCAiZWFzaW5nIiwgIl9qc3hzIiwgIkhvbG8iLCAic2VlZCIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAiZ2FwIiwgImJhY2tncm91bmRDb2xvciIsICJDIiwgImdsYXNzIiwgImJvcmRlciIsICJ0b3AiLCAiYm90dG9tIiwgImJvcmRlckNvbG9yIiwgImN5YW5MaW5lIiwgIl9qc3giLCAibm9kZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAib3ZlcmZsb3dYIiwgIm92ZXJmbG93WSIsICJ0cmFuc2Zvcm0iLCAidHJhbnNsYXRlWSIsICJhbmltYXRlZCIsICJpbnRlcnBvbGF0ZSIsICJBcnJvdyIsICJzaXplIiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGIiwgImRpc3BsYXkiLCAiZm9udFNpemUiLCAiY29sb3IiLCAiYW1iZXIiLCAid2hpdGUiLCAibGluZUJyZWFrIiwgInNlbWlib2xkIiwgImxldHRlclNwYWNpbmciLCAiY3lhbiIsICJyZWd1bGFyIiwgImN5YW5EaW0iLCAiaW1wb3J0X3JlYWN0IiwgInBvbGFyIiwgImN4IiwgImN5IiwgInIiLCAiZGVnIiwgImEiLCAiTWF0aCIsICJQSSIsICJjb3MiLCAic2luIiwgImFyYyIsICJmcm9tIiwgInRvIiwgIngwIiwgInkwIiwgIngxIiwgInkxIiwgImxhcmdlIiwgInRvRml4ZWQiLCAid3JhcCIsICJhbmdsZUJldHdlZW4iLCAiYiIsICJkIiwgImFicyIsICJpbXBvcnRfcmVhY3QiLCAiVFVNQkxFUlMiLCAiVElNRSIsICJUT0xFUkFOQ0UiLCAiUEVOQUxUWSIsICJyb2xsIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIk1hdGgiLCAiZmxvb3IiLCAicmFuZG9tIiwgInVzZUJ5cGFzcyIsICJydW5uaW5nIiwgInVubG9ja2VkIiwgImFuZ2xlIiwgInNldEFuZ2xlIiwgInVzZVN0YXRlIiwgInRhcmdldHMiLCAic2V0VGFyZ2V0cyIsICJzb2x2ZWQiLCAic2V0U29sdmVkIiwgInRpbWUiLCAic2V0VGltZSIsICJkb25lIiwgInVzZUVmZmVjdCIsICJ0IiwgInNldEludGVydmFsIiwgInMiLCAibWF4IiwgImNsZWFySW50ZXJ2YWwiLCAic2hvY2siLCAibG9jayIsICJuZXh0IiwgImN1ZSIsICJ1bmxvY2siLCAidGFyZ2V0IiwgIm1pbiIsICJuZWFyIiwgImFuZ2xlQmV0d2VlbiIsICJwb2ludCIsICJkZWciLCAid3JhcCIsICJhdHRlbXB0IiwgInNvbHZlIiwgIkRJQUwiLCAiUiIsICJSSU5HUyIsICJtaXgiLCAiYSIsICJiIiwgInQiLCAiY2giLCAiYyIsICJpIiwgInBhcnNlSW50IiwgInNsaWNlIiwgIm91dCIsICJtYXAiLCAiTWF0aCIsICJyb3VuZCIsICJ0b1N0cmluZyIsICJwYWRTdGFydCIsICJqb2luIiwgIkRpYWwiLCAiYW5nbGUiLCAic29sdmVkIiwgIm5lYXIiLCAiZG9uZSIsICJwaWNrIiwgIkMiLCAiY3lhbiIsICJ3aGl0ZSIsICJib3giLCAicG9zaXRpb25UeXBlIiwgIndpZHRoIiwgImhlaWdodCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgInN2ZyIsICJ2aWV3Qm94IiwgIl9qc3giLCAiY2lyY2xlIiwgImN4IiwgImN5IiwgInIiLCAiZmlsbCIsICJzdHJva2UiLCAiY3lhbkRpbSIsICJzdHJva2VXaWR0aCIsICJBcnJheSIsICJmcm9tIiwgImxlbmd0aCIsICJfIiwgIm1ham9yIiwgIngwIiwgInkwIiwgInBvbGFyIiwgIngxIiwgInkxIiwgImxpbmUiLCAieDIiLCAieTIiLCAibG9ja2VkIiwgImN1cnJlbnQiLCAiZ3JlZW4iLCAiY3lhbkRlZXAiLCAib3BhY2l0eSIsICJ0cmFuc2Zvcm0iLCAicm90YXRlIiwgInBhdGgiLCAiZCIsICJhcmMiLCAicG9seWdvbiIsICJwb2ludHMiLCAiVFVNQkxFUlMiLCAiSGFjayIsICJoZWxkIiwgInVzZUhlbGQiLCAidW5sb2NrZWQiLCAidXNlR2FtZSIsICJnIiwgImZpeHR1cmVzIiwgImRvb3IiLCAiYnlwYXNzIiwgInVzZUJ5cGFzcyIsICJhbmdsZSIsICJzb2x2ZWQiLCAidGltZSIsICJuZWFyIiwgImRvbmUiLCAidXNlS2V5cyIsICJlIiwgImNvZGUiLCAiYXR0ZW1wdCIsICJ1c2VEZWJ1ZyIsICJhcmciLCAidmVyYiIsICJ2YWx1ZSIsICJzcGxpdCIsICJzb2x2ZSIsICJwb2ludCIsICJOdW1iZXIiLCAic3RlcCIsICJNYXRoIiwgImZsb29yIiwgImxhc3QiLCAidXNlUmVmIiwgInVzZUVmZmVjdCIsICJjdXJyZW50IiwgImN1ZSIsICJsb3ciLCAic3RhdHVzIiwgIlRVTUJMRVJTIiwgIl9qc3hzIiwgIkhvbG8iLCAibmFtZSIsICJzZWVkIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJub2RlIiwgIndpZHRoIiwgImhlaWdodCIsICJmbGV4U2hyaW5rIiwgImp1c3RpZnlDb250ZW50IiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJfanN4IiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGIiwgImRpc3BsYXkiLCAiZm9udFNpemUiLCAibGV0dGVyU3BhY2luZyIsICJjb2xvciIsICJDIiwgImdyZWVuIiwgImN5YW4iLCAibGluZUJyZWFrIiwgInJlZCIsICJ3aGl0ZSIsICJ0b0ZpeGVkIiwgInBhZFN0YXJ0IiwgIkRJQUwiLCAib25Qb2ludGVySG92ZXIiLCAiZGVnIiwgImF0YW4yIiwgIngiLCAieSIsICJQSSIsICJvbkNsaWNrIiwgIkRpYWwiLCAiZmxleEdyb3ciLCAiZ2FwIiwgImJvbGQiLCAiYmFja2dyb3VuZENvbG9yIiwgImN5YW5EZWVwIiwgImhpbnQiLCAicm91bmQiLCAicmVndWxhciIsICJjeWFuRGltIiwgIkxvY2siLCAiZG9vciIsICJ1c2VHYW1lIiwgImciLCAiZml4dHVyZXMiLCAibG9ja2VkIiwgImNvbG9yIiwgIkMiLCAicmVkIiwgImdyZWVuIiwgImRpbSIsICJyZWREaW0iLCAiZ3JlZW5EaW0iLCAib3V0ZXIiLCAidXNlU3BpbiIsICJpbm5lciIsICJyaW5nIiwgInBvc2l0aW9uVHlwZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiX2pzeHMiLCAiSG9sbyIsICJuYW1lIiwgInNlZWQiLCAic3R5bGUiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJfanN4IiwgInN2ZyIsICJ2aWV3Qm94IiwgInRyYW5zZm9ybSIsICJyb3RhdGUiLCAiYW5pbWF0ZWQiLCAiQXJyYXkiLCAiZnJvbSIsICJsZW5ndGgiLCAiXyIsICJpIiwgInBhdGgiLCAiZCIsICJhcmMiLCAiZmlsbCIsICJzdHJva2UiLCAic3Ryb2tlV2lkdGgiLCAib3BhY2l0eSIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJtYXAiLCAiYSIsICJyZWN0IiwgIngiLCAieSIsICJyeCIsICJub2RlIiwgImJvdHRvbSIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJib2xkIiwgImZvbnRTaXplIiwgImxldHRlclNwYWNpbmciLCAibGluZUJyZWFrIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiS0lORF9MQUJFTCIsICJoZWFsdGgiLCAic3Rhc2lzIiwgImFpciIsICJhbW1vIiwgInVwZ3JhZGUiLCAidmFsdWFibGUiLCAid2VhcG9uIiwgImluaXRpYWxzIiwgIml0ZW0iLCAiSVRFTVMiLCAibmFtZSIsICJzcGxpdCIsICJtYXAiLCAidyIsICJqb2luIiwgInNsaWNlIiwgInRvVXBwZXJDYXNlIiwgIkl0ZW1JY29uIiwgInNpemUiLCAiY291bnQiLCAibGl0IiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAid2lkdGgiLCAiaGVpZ2h0IiwgImZsZXhTaHJpbmsiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiQyIsICJ3aGl0ZSIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiX2pzeCIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJkaXNwbGF5IiwgImZvbnRTaXplIiwgImNvbG9yIiwgInBvcnRhbCIsICJ0YXJnZXQiLCAicG9zaXRpb25UeXBlIiwgImxlZnQiLCAidG9wIiwgInVuZGVmaW5lZCIsICJyaWdodCIsICJib3R0b20iLCAiY3lhbiIsICJlZmZlY3QiLCAiaXRlbSIsICJjcmVkaXRzIiwgInNlbGxQcmljZSIsICJ3ZWFwb24iLCAiV0VBUE9OUyIsICJmaW5kIiwgInciLCAiV0VBUE9OX0FNTU8iLCAiYW1tbyIsICJJVEVNUyIsICJuYW1lIiwgInRvVXBwZXJDYXNlIiwgInBlckl0ZW0iLCAiVVNBQkxFIiwgIlNldCIsICJJbnZlbnRvcnkiLCAiYWN0aXZlIiwgInNlbGVjdGVkIiwgIm9uU2VsZWN0IiwgInNsb3RzIiwgInVzZUdhbWUiLCAiZyIsICJwYWNrIiwgInVzZWQiLCAiZmlsdGVyIiwgIkJvb2xlYW4iLCAibGVuZ3RoIiwgInVzZUVmZmVjdCIsICJiZXZ5IiwgInByZXZpZXciLCAic2hvdyIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImZsZXhHcm93IiwgIndpZHRoIiwgImZsZXhTaHJpbmsiLCAianVzdGlmeUNvbnRlbnQiLCAiX2pzeCIsICJ0ZXh0IiwgIlQiLCAic21hbGwiLCAibGV0dGVyU3BhY2luZyIsICJjb2xvciIsICJDIiwgImN5YW4iLCAiZmxleFdyYXAiLCAibWFwIiwgInMiLCAiaSIsICJidXR0b24iLCAib25DbGljayIsICJjdWUiLCAiaGVpZ2h0IiwgImFsaWduSXRlbXMiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgIndoaXRlIiwgImNsZWFyIiwgImJhY2tncm91bmRDb2xvciIsICJjdXJzb3IiLCAiaG92ZXJTdHlsZSIsICJJdGVtSWNvbiIsICJzaXplIiwgImNvdW50IiwgImxpdCIsICJXZWFwb25zIiwgIkRldGFpbCIsICJzbG90IiwgImxpdmUiLCAibGFiZWwiLCAiY3lhbkRpbSIsICJoZWFkZXIiLCAiZm9udFNpemUiLCAiS0lORF9MQUJFTCIsICJraW5kIiwgIlJ1bGUiLCAicG9ydGFsIiwgInRhcmdldCIsICJjYWNoZSIsICJib2R5IiwgImN5YW5IaSIsICJsaW5lQnJlYWsiLCAibnVtYmVyIiwgIlN0cmluZyIsICJhbWJlciIsICJtYXJnaW4iLCAidG9wIiwgIkhvbG9CdXR0b24iLCAid2lkZSIsICJkaXNhYmxlZCIsICJoYXMiLCAidXNlIiwgImFybXMiLCAib3duZWQiLCAiaW5jbHVkZXMiLCAib24iLCAiZXF1aXAiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImN5YW5MaW5lIiwgInVuZGVmaW5lZCIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAiY3lhbkRlZXAiLCAicmVndWxhciIsICJncmVlbiIsICJjbGlwIiwgImNsaXBTaXplIiwgInJlc2VydmUiLCAiaW1wb3J0X3JlYWN0IiwgIkxvZ3MiLCAic2VsZWN0ZWQiLCAicGxheWluZyIsICJvblNlbGVjdCIsICJvblBsYXkiLCAicmVhZCIsICJ1c2VHYW1lIiwgImciLCAic3RvcnkiLCAibG9nIiwgIkxPR1MiLCAiZmluZCIsICJsIiwgImlkIiwgIl9qc3hzIiwgIm5vZGUiLCAic3R5bGUiLCAiZmxleERpcmVjdGlvbiIsICJnYXAiLCAiZmxleEdyb3ciLCAiX2pzeCIsICJzY3JvbGxTdGVwIiwgIndpZHRoIiwgImZsZXhTaHJpbmsiLCAiaGVpZ2h0IiwgIm92ZXJmbG93WSIsICJ0cmFuc2l0aW9uIiwgInNjcm9sbCIsICJkdXJhdGlvbiIsICJlYXNpbmciLCAibWFwIiwgIlJvdyIsICJvbiIsICJ1bnJlYWQiLCAiaW5jbHVkZXMiLCAib25DbGljayIsICJ0ZXh0IiwgIlQiLCAic21hbGwiLCAibGV0dGVyU3BhY2luZyIsICJjb2xvciIsICJhdWRpbyIsICJDIiwgImFtYmVyIiwgImN5YW5EaW0iLCAiaGVhZGVyIiwgImZvbnRTaXplIiwgIndoaXRlIiwgInRpdGxlIiwgImxhYmVsIiwgImZyb20iLCAidG9VcHBlckNhc2UiLCAiUnVsZSIsICJhbGlnbkl0ZW1zIiwgIkhvbG9CdXR0b24iLCAiV2F2ZWZvcm0iLCAiYm9keSIsICJsaW5lSGVpZ2h0IiwgImJ1dHRvbiIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAiYm9yZGVyIiwgImJvcmRlckNvbG9yIiwgImJhY2tncm91bmRDb2xvciIsICJjdXJzb3IiLCAiaG92ZXJTdHlsZSIsICJqdXN0aWZ5Q29udGVudCIsICJmb250RmFtaWx5IiwgIkYiLCAic2VtaWJvbGQiLCAiY3lhbiIsICJsaW5lQnJlYWsiLCAiYm9yZGVyUmFkaXVzIiwgIm5vaXNlIiwgImkiLCAiZnJhbWUiLCAicyIsICJNYXRoIiwgInNpbiIsICJmbG9vciIsICJzZXRGcmFtZSIsICJ1c2VTdGF0ZSIsICJ1c2VFZmZlY3QiLCAidCIsICJzZXRJbnRlcnZhbCIsICJmIiwgImNsZWFySW50ZXJ2YWwiLCAiY2FudmFzIiwgImRyYXciLCAiY3R4IiwgImJhcnMiLCAic3RlcCIsICJmaWxsU3R5bGUiLCAiY3lhbkRlZXAiLCAiYmVnaW5QYXRoIiwgImVudiIsICJhYnMiLCAiZHJvcCIsICJoIiwgIm1heCIsICJyZWN0IiwgImZpbGwiLCAiaW1wb3J0X3JlYWN0IiwgIlBMQUNFUyIsICJpZCIsICJuYW1lIiwgImNvbG9yIiwgIkMiLCAiYW1iZXIiLCAiZ3JlZW4iLCAiY3lhbiIsICJ3aGl0ZSIsICJyZWQiLCAiTWFwVGFiIiwgImFjdGl2ZSIsICJsYXN0IiwgInVzZVJlZiIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgImZsZXhHcm93IiwgIndpZHRoIiwgImZsZXhTaHJpbmsiLCAiaGVpZ2h0IiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiX2pzeCIsICJwb3J0YWwiLCAidGFyZ2V0IiwgImN1cnNvciIsICJjYWNoZSIsICJvblBvaW50ZXJEb3duIiwgImUiLCAiY3VycmVudCIsICJ4IiwgImNsaWVudFgiLCAieSIsICJjbGllbnRZIiwgIm9uUG9pbnRlck1vdmUiLCAiZHgiLCAiZHkiLCAiYmV2eSIsICJtYXAiLCAib3JiaXQiLCAib25Qb2ludGVyVXAiLCAib25XaGVlbCIsICJ6b29tIiwgImRlbHRhIiwgImRlbHRhWSIsICJkZWx0YU1vZGUiLCAiQ29ybmVycyIsICJzaXplIiwgInRleHQiLCAiVCIsICJzbWFsbCIsICJwb3NpdGlvblR5cGUiLCAibGVmdCIsICJ0b3AiLCAibGV0dGVyU3BhY2luZyIsICJib3R0b20iLCAiTGVnZW5kIiwgImZpeHR1cmVzIiwgInVzZUdhbWUiLCAiZyIsICJvYmplY3RpdmUiLCAiT0JKRUNUSVZFUyIsICJ0byIsICJkb29yIiwgImxvY2tlZCIsICJ1bmxvY2tlZCIsICJvcGVuIiwgInAiLCAiYWxpZ25JdGVtcyIsICJib3JkZXJSYWRpdXMiLCAibGFiZWwiLCAiZm9udFNpemUiLCAiVGFnIiwgImxvY2F0b3IiLCAic3ZnIiwgInZpZXdCb3giLCAicG9seWdvbiIsICJwb2ludHMiLCAiZmlsbCIsICJSdWxlIiwgIkxpbmUiLCAidmFsdWUiLCAiZWxldmF0b3IiLCAiZmxvb3IiLCAidGl0bGUiLCAicGFkZGluZyIsICJob3Jpem9udGFsIiwgInZlcnRpY2FsIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJGQUlOVCIsICJPYmplY3RpdmVzIiwgImN1cnJlbnQiLCAidXNlR2FtZSIsICJvYmplY3RpdmUiLCAibm93IiwgIk9CSkVDVElWRVMiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJmbGV4RGlyZWN0aW9uIiwgImdhcCIsICJmbGV4R3JvdyIsICJfanN4IiwgIndpZHRoIiwgImZsZXhTaHJpbmsiLCAibWFwIiwgIm8iLCAiaSIsICJkb25lIiwgImhlcmUiLCAiYWxpZ25JdGVtcyIsICJoZWlnaHQiLCAiYm9yZGVyUmFkaXVzIiwgImJvcmRlciIsICJib3JkZXJDb2xvciIsICJDIiwgIndoaXRlIiwgImdyZWVuRGltIiwgImJhY2tncm91bmRDb2xvciIsICJjbGVhciIsICJqdXN0aWZ5Q29udGVudCIsICJUaWNrIiwgInNpemUiLCAibGVuZ3RoIiwgInRleHQiLCAiZm9udEZhbWlseSIsICJGIiwgInNlbWlib2xkIiwgImZvbnRTaXplIiwgImxldHRlclNwYWNpbmciLCAiY29sb3IiLCAiY3lhbkRpbSIsICJ0aXRsZSIsICJUIiwgInNtYWxsIiwgImFtYmVyIiwgInBhZGRpbmciLCAiQ29ybmVycyIsICJoZWFkZXIiLCAiUnVsZSIsICJib2R5IiwgImxpbmVIZWlnaHQiLCAiVEFCUyIsICJpZCIsICJsYWJlbCIsICJQTEFZX01TIiwgIk1lbnUiLCAiYWN0aXZlIiwgInVzZUxpdmUiLCAidGFiIiwgInNldFRhYiIsICJ1c2VTdGF0ZSIsICJzbG90IiwgInNldFNsb3QiLCAibG9nIiwgInNldExvZyIsICJMT0dTIiwgInBsYXlpbmciLCAic2V0UGxheWluZyIsICJwaWNrIiwgIm5leHQiLCAiY3VlIiwgIm9wZW5Mb2ciLCAicGxheSIsICJyZWFkIiwgImZpbmQiLCAibCIsICJhdWRpbyIsICJzdGFydFBsYXlpbmciLCAidXNlRWZmZWN0IiwgInQiLCAic2V0VGltZW91dCIsICJjbGVhclRpbWVvdXQiLCAidXNlRGVidWciLCAic29tZSIsICJpdGVtIiwgImF0IiwgImdldEdhbWUiLCAicGFjayIsICJzbG90cyIsICJmaW5kSW5kZXgiLCAicyIsICJfanN4IiwgIkhvbG8iLCAibmFtZSIsICJwYWdlIiwgInNlZWQiLCAiX2pzeHMiLCAiU2hlbGwiLCAiSGVhZGVyIiwgIm5vZGUiLCAic3R5bGUiLCAiZmxleERpcmVjdGlvbiIsICJqdXN0aWZ5Q29udGVudCIsICJhbGlnbkl0ZW1zIiwgIm1hcmdpbiIsICJ0b3AiLCAiVGFicyIsICJ0YWJzIiwgIm9uUGljayIsICJ0ZXh0IiwgIlQiLCAic21hbGwiLCAibGV0dGVyU3BhY2luZyIsICJSdWxlIiwgImZsZXhHcm93IiwgImJvdHRvbSIsICJJbnZlbnRvcnkiLCAic2VsZWN0ZWQiLCAib25TZWxlY3QiLCAiTWFwVGFiIiwgIk9iamVjdGl2ZXMiLCAiTG9ncyIsICJvblBsYXkiLCAiRm9vdGVyIiwgInN1aXQiLCAidXNlR2FtZSIsICJnIiwgInZpdGFscyIsICJoZWFsdGgiLCAiQyIsICJjeWFuIiwgImFtYmVyIiwgInJlZCIsICJnYXAiLCAiaGVhZGVyIiwgImZvbnRTaXplIiwgIkdhdWdlIiwgInZhbHVlIiwgImNvbG9yIiwgInN0YXNpcyIsICJudW1iZXIiLCAiZ3JlZW4iLCAiU3RyaW5nIiwgImNvdW50SXRlbSIsICJjcmVkaXRzIiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJNYXRoIiwgInJvdW5kIiwgIkJhciIsICJ3aWR0aCIsICJjdXJyZW50IiwgIk9CSkVDVElWRVMiLCAib2JqZWN0aXZlIiwgIndoaXRlIiwgInRpdGxlIiwgImJvZHkiLCAiY3lhbkRpbSIsICJmbGV4U2hyaW5rIiwgImltcG9ydF9yZWFjdCIsICJpbXBvcnRfcmVhY3QiLCAiQ09OVFJPTFMiLCAidGl0bGUiLCAia2V5cyIsICJUZXJtaW5hbCIsICJsaXZlIiwgInVzZUxpdmUiLCAidXNlRWZmZWN0IiwgInQiLCAibmV4dCIsICJzZXRUaW1lb3V0IiwgImdsaXRjaCIsICJNYXRoIiwgInJhbmRvbSIsICJjbGVhclRpbWVvdXQiLCAiX2pzeHMiLCAiSG9sbyIsICJuYW1lIiwgInNlZWQiLCAic3R5bGUiLCAic2NyZWVuIiwgIm5vZGUiLCAiZmxleERpcmVjdGlvbiIsICJqdXN0aWZ5Q29udGVudCIsICJib3JkZXIiLCAiYm90dG9tIiwgImJvcmRlckNvbG9yIiwgIkMiLCAiY3lhbkZhaW50IiwgInBhZGRpbmciLCAiX2pzeCIsICJ0ZXh0IiwgInNtYWxsIiwgImdhcCIsICJ0b3AiLCAiY3lhbiIsICJmb250RmFtaWx5IiwgIkYiLCAiZGlzcGxheSIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImNvbG9yIiwgIndoaXRlIiwgImxpbmVCcmVhayIsICJzZW1pYm9sZCIsICJmbGV4R3JvdyIsICJmbGV4V3JhcCIsICJhbGlnbkNvbnRlbnQiLCAicm93R2FwIiwgImNvbHVtbkdhcCIsICJDT05UUk9MUyIsICJtYXAiLCAiZ3JvdXAiLCAid2lkdGgiLCAibGVmdCIsICJjeWFuTGluZSIsICJib2xkIiwgInRpdGxlIiwgImtleXMiLCAia2V5IiwgIndoYXQiLCAiYWxpZ25JdGVtcyIsICJLZXkiLCAicmVndWxhciIsICJjeWFuSGkiLCAiY2hpbGRyZW4iLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJib3JkZXJSYWRpdXMiLCAiYmFja2dyb3VuZENvbG9yIiwgImN5YW5EaW0iLCAiUHJvbXB0IiwgIm5vdyIsICJoaW50IiwgInVzZUdhbWUiLCAibGFzdCIsICJ1c2VSZWYiLCAiY3VycmVudCIsICJzaG93biIsICJfanN4IiwgIkhvbG8iLCAibmFtZSIsICJwYWdlIiwgImlkIiwgInNlZWQiLCAic3R5bGUiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJub2RlIiwgImZsZXhEaXJlY3Rpb24iLCAiZ2FwIiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJ2ZXJ0aWNhbCIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQyIsICJzaGFkZSIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiY3lhbkZhaW50IiwgImtleXMiLCAibWFwIiwgImtleSIsICJ3aGF0IiwgIl9qc3hzIiwgIktleSIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJyZWd1bGFyIiwgImZvbnRTaXplIiwgImNvbG9yIiwgImN5YW5IaSIsICJsaW5lQnJlYWsiLCAiU2F2ZSIsICJzYXZlcyIsICJ1c2VHYW1lIiwgImciLCAiZml4dHVyZXMiLCAic3BpbiIsICJ1c2VTcGluIiwgIl9qc3giLCAiSG9sbyIsICJuYW1lIiwgInNlZWQiLCAiX2pzeHMiLCAibm9kZSIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAiZmxleERpcmVjdGlvbiIsICJiYWNrZ3JvdW5kQ29sb3IiLCAiQyIsICJnbGFzcyIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAiY3lhbkxpbmUiLCAiZmxleFNocmluayIsICJwYWRkaW5nIiwgImhvcml6b250YWwiLCAiYWxpZ25JdGVtcyIsICJqdXN0aWZ5Q29udGVudCIsICJib3R0b20iLCAidGV4dCIsICJmb250RmFtaWx5IiwgIkYiLCAiZGlzcGxheSIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImNvbG9yIiwgImN5YW4iLCAibGluZUJyZWFrIiwgInNtYWxsIiwgImZsZXhHcm93IiwgImdhcCIsICJyaWdodCIsICJjeWFuRmFpbnQiLCAic3ZnIiwgInZpZXdCb3giLCAidHJhbnNmb3JtIiwgInJvdGF0ZSIsICJhbmltYXRlZCIsICJjaXJjbGUiLCAiY3giLCAiY3kiLCAiciIsICJmaWxsIiwgInN0cm9rZSIsICJjeWFuRGltIiwgInN0cm9rZVdpZHRoIiwgIm9wYWNpdHkiLCAicG9seWdvbiIsICJwb2ludHMiLCAid2hpdGUiLCAiYnV0dG9uIiwgInNhdmVCdXR0b24iLCAiaG92ZXJTdHlsZSIsICJob3ZlciIsICJvbkNsaWNrIiwgInNhdmUiLCAiYm9sZCIsICJsZWZ0IiwgInRvcCIsICJmbGV4QmFzaXMiLCAib3ZlcmZsb3dZIiwgInNjcm9sbFN0ZXAiLCAibGVuZ3RoIiwgInJldmVyc2UiLCAibWFwIiwgInMiLCAidmVydGljYWwiLCAiU3RyaW5nIiwgImlkIiwgInBhZFN0YXJ0IiwgInRpbWUiLCAiT0JKRUNUSVZFUyIsICJvYmplY3RpdmUiLCAidGl0bGUiLCAibG9hZEJ1dHRvbiIsICJsb2FkIiwgInNlbWlib2xkIiwgImdsYXNzSGkiLCAiU0VHTUVOVFMiLCAiUElUQ0giLCAiVE9QIiwgInZlcnRlYnJhIiwgInkiLCAiU3BpbmUiLCAiX2pzeCIsICJIb2xvIiwgIm5hbWUiLCAic2VlZCIsICJTcGluZUJhciIsICJoZWFsdGgiLCAidXNlR2FtZSIsICJnIiwgInN1aXQiLCAiY29sb3IiLCAiQyIsICJjeWFuIiwgImFtYmVyIiwgInJlZCIsICJwdWxzZSIsICJ1c2VCbGluayIsICJsZXZlbCIsICJfanN4cyIsICJzdmciLCAidmlld0JveCIsICJzdHlsZSIsICJ3aWR0aCIsICJoZWlnaHQiLCAibGluZSIsICJ4MSIsICJ5MSIsICJ4MiIsICJ5MiIsICJzdHJva2UiLCAiY3lhbkRpbSIsICJzdHJva2VXaWR0aCIsICJvcGFjaXR5IiwgInJlY3QiLCAieCIsICJmaWxsIiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIl8iLCAiaSIsICJmcm9tQm90dG9tIiwgInBvbHlnb24iLCAicG9pbnRzIiwgImFuaW1hdGVkIiwgImxpdCIsICJNYXRoIiwgIm1pbiIsICJ3aGl0ZSIsICJCTFVFIiwgIlNUQVJUIiwgIkdBUCIsICJTUEFOIiwgIlN0YXNpcyIsICJfanN4IiwgIkhvbG8iLCAibmFtZSIsICJzZWVkIiwgIlN0YXNpc0dhdWdlIiwgInN0YXNpcyIsICJ1c2VHYW1lIiwgImciLCAic3VpdCIsICJsZXZlbCIsICJfanN4cyIsICJub2RlIiwgInN0eWxlIiwgIndpZHRoIiwgImhlaWdodCIsICJmbGV4RGlyZWN0aW9uIiwgImFsaWduSXRlbXMiLCAianVzdGlmeUNvbnRlbnQiLCAic3ZnIiwgInZpZXdCb3giLCAicG9zaXRpb25UeXBlIiwgImNpcmNsZSIsICJjeCIsICJjeSIsICJyIiwgImZpbGwiLCAic3Ryb2tlIiwgIkMiLCAiY3lhbkRpbSIsICJzdHJva2VXaWR0aCIsICJvcGFjaXR5IiwgIkFycmF5IiwgImZyb20iLCAibGVuZ3RoIiwgIl8iLCAiaSIsICJ4MCIsICJ5MCIsICJwb2xhciIsICJ4MSIsICJ5MSIsICJsaW5lIiwgIngyIiwgInkyIiwgIm1hcCIsICJrIiwgImxpdCIsICJNYXRoIiwgIm1heCIsICJtaW4iLCAicGF0aCIsICJkIiwgImFyYyIsICJ3aGl0ZSIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJkaXNwbGF5IiwgImZvbnRTaXplIiwgImNvbG9yIiwgInJlZCIsICJsaW5lQnJlYWsiLCAicm91bmQiLCAic2VtaWJvbGQiLCAibGV0dGVyU3BhY2luZyIsICJpbXBvcnRfcmVhY3QiLCAiSXRlbVJvdyIsICJpdGVtIiwgImNvdW50IiwgIm9uIiwgInZhbHVlIiwgInZhbHVlQ29sb3IiLCAiQyIsICJhbWJlciIsICJvbkNsaWNrIiwgIl9qc3hzIiwgImJ1dHRvbiIsICJzdHlsZSIsICJmbGV4U2hyaW5rIiwgImZsZXhEaXJlY3Rpb24iLCAiYWxpZ25JdGVtcyIsICJnYXAiLCAiaGVpZ2h0IiwgInBhZGRpbmciLCAiaG9yaXpvbnRhbCIsICJib3JkZXIiLCAiYm9yZGVyQ29sb3IiLCAid2hpdGUiLCAiYmFja2dyb3VuZENvbG9yIiwgImN1cnNvciIsICJob3ZlclN0eWxlIiwgIl9qc3giLCAiSXRlbUljb24iLCAic2l6ZSIsICJsaXQiLCAibm9kZSIsICJmbGV4R3JvdyIsICJ0ZXh0IiwgImZvbnRGYW1pbHkiLCAiRiIsICJzZW1pYm9sZCIsICJmb250U2l6ZSIsICJsZXR0ZXJTcGFjaW5nIiwgImNvbG9yIiwgImN5YW4iLCAibGluZUJyZWFrIiwgIklURU1TIiwgIm5hbWUiLCAidG9VcHBlckNhc2UiLCAiVCIsICJzbWFsbCIsICJLSU5EX0xBQkVMIiwgImtpbmQiLCAiZGlzcGxheSIsICJMaXN0IiwgIndpZHRoIiwgImNoaWxkcmVuIiwgInNjcm9sbFN0ZXAiLCAib3ZlcmZsb3dZIiwgInRyYW5zaXRpb24iLCAic2Nyb2xsIiwgImR1cmF0aW9uIiwgImVhc2luZyIsICJEZXRhaWwiLCAibGl2ZSIsICJqdXN0aWZ5Q29udGVudCIsICJsYWJlbCIsICJjeWFuRGltIiwgImFsaWduU2VsZiIsICJwb3J0YWwiLCAidGFyZ2V0IiwgImNhY2hlIiwgImhlYWRlciIsICJSdWxlIiwgImJvZHkiLCAiVEFCUyIsICJpZCIsICJsYWJlbCIsICJjYXRhbG9nIiwgIm93bmVkIiwgIklURU1fSURTIiwgImZpbHRlciIsICJpdGVtIiwgIklURU1TIiwgInByaWNlIiwgImtpbmQiLCAiaW5jbHVkZXMiLCAiU3RvcmUiLCAiYWN0aXZlIiwgInVzZUxpdmUiLCAidGFiIiwgInNldFRhYiIsICJ1c2VTdGF0ZSIsICJzZXRJdGVtIiwgInNsb3QiLCAic2V0U2xvdCIsICJwYWNrIiwgInVzZUdhbWUiLCAiZyIsICJzaG93biIsICJzbG90cyIsICJ1bmRlZmluZWQiLCAidXNlRWZmZWN0IiwgImJldnkiLCAicHJldmlldyIsICJzaG93IiwgInBpY2siLCAibmV4dCIsICJjdWUiLCAidXNlRGVidWciLCAic29tZSIsICJ0IiwgImJ1eSIsICJuIiwgImF0IiwgIk51bWJlciIsICJnZXRHYW1lIiwgInNlbGwiLCAiX2pzeCIsICJIb2xvIiwgIm5hbWUiLCAicGFnZSIsICJzZWVkIiwgIl9qc3hzIiwgIlNoZWxsIiwgIm5vZGUiLCAic3R5bGUiLCAiZmxleERpcmVjdGlvbiIsICJhbGlnbkl0ZW1zIiwgImdhcCIsICJ0ZXh0IiwgIlQiLCAiaGVhZGVyIiwgImZvbnRTaXplIiwgImxldHRlclNwYWNpbmciLCAic21hbGwiLCAiZmxleEdyb3ciLCAibnVtYmVyIiwgImNvbG9yIiwgIkMiLCAiYW1iZXIiLCAiY3JlZGl0cyIsICJqdXN0aWZ5Q29udGVudCIsICJtYXJnaW4iLCAidG9wIiwgIlRhYnMiLCAidGFicyIsICJvblBpY2siLCAiUnVsZSIsICJCdXkiLCAibGl2ZSIsICJvbkl0ZW0iLCAiU2VsbCIsICJvblNsb3QiLCAiU2FmZSIsICJpdGVtcyIsICJhcm1zIiwgImFmZm9yZCIsICJfRnJhZ21lbnQiLCAiTGlzdCIsICJtYXAiLCAiSXRlbVJvdyIsICJvbiIsICJ2YWx1ZSIsICJ2YWx1ZUNvbG9yIiwgImFtYmVyRGltIiwgIm9uQ2xpY2siLCAiRGV0YWlsIiwgIkZpZ3VyZSIsICJyZWQiLCAiU3RyaW5nIiwgImNvdW50SXRlbSIsICJncmVlbiIsICJIb2xvQnV0dG9uIiwgIndpZGUiLCAidG9uZSIsICJzIiwgIngiLCAiaSIsICJjb3VudCIsICJzZWxsUHJpY2UiLCAidXNlZCIsICJCb29sZWFuIiwgImxlbmd0aCIsICJIZWFkaW5nIiwgIlBBQ0tfU0xPVFMiLCAiaGludCIsICJ3aWR0aCIsICJjeWFuIiwgInN0b3ciLCAic2FmZSIsICJyZXRyaWV2ZSIsICJtZW51IiwgIm9wZW4iLCAiZGlzcGF0Y2giLCAidHlwZSIsICJjdWUiLCAiQ29udHJvbHMiLCAidXNlS2V5cyIsICJlIiwgImhlcmUiLCAiZ2V0R2FtZSIsICJjb2RlIiwgInRlc3QiLCAicmVsb2FkIiwgInN3YXAiLCAiaGVhbCIsICJzdGFzaXMiLCAiaGl0IiwgInZhY3V1bSIsICJzaGlmdEtleSIsICJuZXh0RGVzdGluYXRpb24iLCAibG9jYXRlIiwgInVzZUV2ZW50IiwgImZpcmUiLCAidXNlRGVidWciLCAiYXJnIiwgInVuZGVmaW5lZCIsICJ0byIsICJERVNUSU5BVElPTlMiLCAiaW5jbHVkZXMiLCAiZmxvb3IiLCAiY2FsbCIsICJOdW1iZXIiLCAic2F2ZSIsICJpZCIsICJsb2FkIiwgIklOVFJPX01TIiwgIkFwcCIsICJnYW1lIiwgInVzZUdhbWUiLCAidXNlRXZlbnQiLCAic3VyZmFjZSIsICJhY3RpdmUiLCAiZGlzcGF0Y2giLCAidHlwZSIsICJvbiIsICJhaW1pbmciLCAibW91c2UiLCAic2NyZWVuIiwgIm9mZmVyIiwgInVzZUVmZmVjdCIsICJiZXZ5IiwgInBsYXllciIsICJzeW5jIiwgInQiLCAic2V0VGltZW91dCIsICJjbGVhclRpbWVvdXQiLCAic2hvd24iLCAidXNlUmVmIiwgIlNldCIsICJvcGVuIiwgIm9wZW5Ib2xvcyIsICJqb2luIiwgIm5leHQiLCAic3BsaXQiLCAiY3VycmVudCIsICJoYXMiLCAiaG9sbyIsICJ2ZW50ZWQiLCAic3VpdCIsICJ2YWN1dW0iLCAiY3VlIiwgIndlYXBvbiIsICJlcXVpcCIsICJhcm1zIiwgInRvIiwgIk9CSkVDVElWRVMiLCAib2JqZWN0aXZlIiwgIm1hcCIsICJtYXJrIiwgInNldEludGVydmFsIiwgImR0IiwgImNsZWFySW50ZXJ2YWwiLCAibG93QWlyIiwgImFpciIsICJmbG9vciIsICJfanN4cyIsICJfRnJhZ21lbnQiLCAiX2pzeCIsICJUZXJtaW5hbCIsICJQcm9tcHQiLCAiU3BpbmUiLCAiU3Rhc2lzIiwgIkFpciIsICJBbW1vIiwgIk1lbnUiLCAiU3RvcmUiLCAiQmVuY2giLCAiTG9jayIsICJTYXZlIiwgIkVsZXZhdG9yIiwgIkZsb29yIiwgIkhhY2siLCAiQ29udHJvbHMiLCAibW91bnQiLCAiX2pzeCIsICJBcHAiXQp9Cg==
