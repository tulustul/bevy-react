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
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
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

  // ../../../node_modules/react/cjs/react.production.min.js
  var require_react_production_min = __commonJS({
    "../../../node_modules/react/cjs/react.production.min.js"(exports) {
      "use strict";
      var l = Symbol.for("react.element");
      var n = Symbol.for("react.portal");
      var p = Symbol.for("react.fragment");
      var q = Symbol.for("react.strict_mode");
      var r = Symbol.for("react.profiler");
      var t = Symbol.for("react.provider");
      var u = Symbol.for("react.context");
      var v = Symbol.for("react.forward_ref");
      var w = Symbol.for("react.suspense");
      var x = Symbol.for("react.memo");
      var y = Symbol.for("react.lazy");
      var z = Symbol.iterator;
      function A(a) {
        if (null === a || "object" !== typeof a) return null;
        a = z && a[z] || a["@@iterator"];
        return "function" === typeof a ? a : null;
      }
      var B = { isMounted: function() {
        return false;
      }, enqueueForceUpdate: function() {
      }, enqueueReplaceState: function() {
      }, enqueueSetState: function() {
      } };
      var C = Object.assign;
      var D = {};
      function E(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = D;
        this.updater = e || B;
      }
      E.prototype.isReactComponent = {};
      E.prototype.setState = function(a, b) {
        if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, a, b, "setState");
      };
      E.prototype.forceUpdate = function(a) {
        this.updater.enqueueForceUpdate(this, a, "forceUpdate");
      };
      function F() {
      }
      F.prototype = E.prototype;
      function G(a, b, e) {
        this.props = a;
        this.context = b;
        this.refs = D;
        this.updater = e || B;
      }
      var H = G.prototype = new F();
      H.constructor = G;
      C(H, E.prototype);
      H.isPureReactComponent = true;
      var I = Array.isArray;
      var J = Object.prototype.hasOwnProperty;
      var K = { current: null };
      var L = { key: true, ref: true, __self: true, __source: true };
      function M(a, b, e) {
        var d, c = {}, k = null, h = null;
        if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
        var g = arguments.length - 2;
        if (1 === g) c.children = e;
        else if (1 < g) {
          for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
          c.children = f;
        }
        if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
        return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
      }
      function N(a, b) {
        return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
      }
      function O(a) {
        return "object" === typeof a && null !== a && a.$$typeof === l;
      }
      function escape(a) {
        var b = { "=": "=0", ":": "=2" };
        return "$" + a.replace(/[=:]/g, function(a2) {
          return b[a2];
        });
      }
      var P = /\/+/g;
      function Q(a, b) {
        return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
      }
      function R(a, b, e, d, c) {
        var k = typeof a;
        if ("undefined" === k || "boolean" === k) a = null;
        var h = false;
        if (null === a) h = true;
        else switch (k) {
          case "string":
          case "number":
            h = true;
            break;
          case "object":
            switch (a.$$typeof) {
              case l:
              case n:
                h = true;
            }
        }
        if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
          return a2;
        })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
        h = 0;
        d = "" === d ? "." : d + ":";
        if (I(a)) for (var g = 0; g < a.length; g++) {
          k = a[g];
          var f = d + Q(k, g);
          h += R(k, b, e, f, c);
        }
        else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
        else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
        return h;
      }
      function S(a, b, e) {
        if (null == a) return a;
        var d = [], c = 0;
        R(a, d, "", "", function(a2) {
          return b.call(e, a2, c++);
        });
        return d;
      }
      function T(a) {
        if (-1 === a._status) {
          var b = a._result;
          b = b();
          b.then(function(b2) {
            if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
          }, function(b2) {
            if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
          });
          -1 === a._status && (a._status = 0, a._result = b);
        }
        if (1 === a._status) return a._result.default;
        throw a._result;
      }
      var U = { current: null };
      var V = { transition: null };
      var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
      function X() {
        throw Error("act(...) is not supported in production builds of React.");
      }
      exports.Children = { map: S, forEach: function(a, b, e) {
        S(a, function() {
          b.apply(this, arguments);
        }, e);
      }, count: function(a) {
        var b = 0;
        S(a, function() {
          b++;
        });
        return b;
      }, toArray: function(a) {
        return S(a, function(a2) {
          return a2;
        }) || [];
      }, only: function(a) {
        if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
        return a;
      } };
      exports.Component = E;
      exports.Fragment = p;
      exports.Profiler = r;
      exports.PureComponent = G;
      exports.StrictMode = q;
      exports.Suspense = w;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
      exports.act = X;
      exports.cloneElement = function(a, b, e) {
        if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
        var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
        if (null != b) {
          void 0 !== b.ref && (k = b.ref, h = K.current);
          void 0 !== b.key && (c = "" + b.key);
          if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
          for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
        }
        var f = arguments.length - 2;
        if (1 === f) d.children = e;
        else if (1 < f) {
          g = Array(f);
          for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
          d.children = g;
        }
        return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
      };
      exports.createContext = function(a) {
        a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
        a.Provider = { $$typeof: t, _context: a };
        return a.Consumer = a;
      };
      exports.createElement = M;
      exports.createFactory = function(a) {
        var b = M.bind(null, a);
        b.type = a;
        return b;
      };
      exports.createRef = function() {
        return { current: null };
      };
      exports.forwardRef = function(a) {
        return { $$typeof: v, render: a };
      };
      exports.isValidElement = O;
      exports.lazy = function(a) {
        return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
      };
      exports.memo = function(a, b) {
        return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
      };
      exports.startTransition = function(a) {
        var b = V.transition;
        V.transition = {};
        try {
          a();
        } finally {
          V.transition = b;
        }
      };
      exports.unstable_act = X;
      exports.useCallback = function(a, b) {
        return U.current.useCallback(a, b);
      };
      exports.useContext = function(a) {
        return U.current.useContext(a);
      };
      exports.useDebugValue = function() {
      };
      exports.useDeferredValue = function(a) {
        return U.current.useDeferredValue(a);
      };
      exports.useEffect = function(a, b) {
        return U.current.useEffect(a, b);
      };
      exports.useId = function() {
        return U.current.useId();
      };
      exports.useImperativeHandle = function(a, b, e) {
        return U.current.useImperativeHandle(a, b, e);
      };
      exports.useInsertionEffect = function(a, b) {
        return U.current.useInsertionEffect(a, b);
      };
      exports.useLayoutEffect = function(a, b) {
        return U.current.useLayoutEffect(a, b);
      };
      exports.useMemo = function(a, b) {
        return U.current.useMemo(a, b);
      };
      exports.useReducer = function(a, b, e) {
        return U.current.useReducer(a, b, e);
      };
      exports.useRef = function(a) {
        return U.current.useRef(a);
      };
      exports.useState = function(a) {
        return U.current.useState(a);
      };
      exports.useSyncExternalStore = function(a, b, e) {
        return U.current.useSyncExternalStore(a, b, e);
      };
      exports.useTransition = function() {
        return U.current.useTransition();
      };
      exports.version = "18.3.1";
    }
  });

  // ../../../node_modules/react/index.js
  var require_react = __commonJS({
    "../../../node_modules/react/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // ../../../node_modules/react/cjs/react-jsx-runtime.production.min.js
  var require_react_jsx_runtime_production_min = __commonJS({
    "../../../node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports) {
      "use strict";
      var f = require_react();
      var k = Symbol.for("react.element");
      var l = Symbol.for("react.fragment");
      var m = Object.prototype.hasOwnProperty;
      var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
      var p = { key: true, ref: true, __self: true, __source: true };
      function q(c, a, g) {
        var b, d = {}, e = null, h = null;
        void 0 !== g && (e = "" + g);
        void 0 !== a.key && (e = "" + a.key);
        void 0 !== a.ref && (h = a.ref);
        for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
        if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
        return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
      }
      exports.Fragment = l;
      exports.jsx = q;
      exports.jsxs = q;
    }
  });

  // ../../../node_modules/react/jsx-runtime.js
  var require_jsx_runtime = __commonJS({
    "../../../node_modules/react/jsx-runtime.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_jsx_runtime_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // ../../../node_modules/react/cjs/react-jsx-dev-runtime.production.min.js
  var require_react_jsx_dev_runtime_production_min = __commonJS({
    "../../../node_modules/react/cjs/react-jsx-dev-runtime.production.min.js"(exports) {
      "use strict";
      var a = Symbol.for("react.fragment");
      exports.Fragment = a;
      exports.jsxDEV = void 0;
    }
  });

  // ../../../node_modules/react/jsx-dev-runtime.js
  var require_jsx_dev_runtime = __commonJS({
    "../../../node_modules/react/jsx-dev-runtime.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_jsx_dev_runtime_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // ../../../node_modules/scheduler/cjs/scheduler.production.min.js
  var require_scheduler_production_min = __commonJS({
    "../../../node_modules/scheduler/cjs/scheduler.production.min.js"(exports) {
      "use strict";
      function f(a, b) {
        var c = a.length;
        a.push(b);
        a: for (; 0 < c; ) {
          var d = c - 1 >>> 1, e = a[d];
          if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
          else break a;
        }
      }
      function h(a) {
        return 0 === a.length ? null : a[0];
      }
      function k(a) {
        if (0 === a.length) return null;
        var b = a[0], c = a.pop();
        if (c !== b) {
          a[0] = c;
          a: for (var d = 0, e = a.length, w = e >>> 1; d < w; ) {
            var m = 2 * (d + 1) - 1, C = a[m], n = m + 1, x = a[n];
            if (0 > g(C, c)) n < e && 0 > g(x, C) ? (a[d] = x, a[n] = c, d = n) : (a[d] = C, a[m] = c, d = m);
            else if (n < e && 0 > g(x, c)) a[d] = x, a[n] = c, d = n;
            else break a;
          }
        }
        return b;
      }
      function g(a, b) {
        var c = a.sortIndex - b.sortIndex;
        return 0 !== c ? c : a.id - b.id;
      }
      if ("object" === typeof performance && "function" === typeof performance.now) {
        l = performance;
        exports.unstable_now = function() {
          return l.now();
        };
      } else {
        p = Date, q = p.now();
        exports.unstable_now = function() {
          return p.now() - q;
        };
      }
      var l;
      var p;
      var q;
      var r = [];
      var t = [];
      var u = 1;
      var v = null;
      var y = 3;
      var z = false;
      var A = false;
      var B = false;
      var D = "function" === typeof setTimeout ? setTimeout : null;
      var E = "function" === typeof clearTimeout ? clearTimeout : null;
      var F = "undefined" !== typeof setImmediate ? setImmediate : null;
      "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function G(a) {
        for (var b = h(t); null !== b; ) {
          if (null === b.callback) k(t);
          else if (b.startTime <= a) k(t), b.sortIndex = b.expirationTime, f(r, b);
          else break;
          b = h(t);
        }
      }
      function H(a) {
        B = false;
        G(a);
        if (!A) if (null !== h(r)) A = true, I(J);
        else {
          var b = h(t);
          null !== b && K(H, b.startTime - a);
        }
      }
      function J(a, b) {
        A = false;
        B && (B = false, E(L), L = -1);
        z = true;
        var c = y;
        try {
          G(b);
          for (v = h(r); null !== v && (!(v.expirationTime > b) || a && !M()); ) {
            var d = v.callback;
            if ("function" === typeof d) {
              v.callback = null;
              y = v.priorityLevel;
              var e = d(v.expirationTime <= b);
              b = exports.unstable_now();
              "function" === typeof e ? v.callback = e : v === h(r) && k(r);
              G(b);
            } else k(r);
            v = h(r);
          }
          if (null !== v) var w = true;
          else {
            var m = h(t);
            null !== m && K(H, m.startTime - b);
            w = false;
          }
          return w;
        } finally {
          v = null, y = c, z = false;
        }
      }
      var N = false;
      var O = null;
      var L = -1;
      var P = 5;
      var Q = -1;
      function M() {
        return exports.unstable_now() - Q < P ? false : true;
      }
      function R() {
        if (null !== O) {
          var a = exports.unstable_now();
          Q = a;
          var b = true;
          try {
            b = O(true, a);
          } finally {
            b ? S() : (N = false, O = null);
          }
        } else N = false;
      }
      var S;
      if ("function" === typeof F) S = function() {
        F(R);
      };
      else if ("undefined" !== typeof MessageChannel) {
        T = new MessageChannel(), U = T.port2;
        T.port1.onmessage = R;
        S = function() {
          U.postMessage(null);
        };
      } else S = function() {
        D(R, 0);
      };
      var T;
      var U;
      function I(a) {
        O = a;
        N || (N = true, S());
      }
      function K(a, b) {
        L = D(function() {
          a(exports.unstable_now());
        }, b);
      }
      exports.unstable_IdlePriority = 5;
      exports.unstable_ImmediatePriority = 1;
      exports.unstable_LowPriority = 4;
      exports.unstable_NormalPriority = 3;
      exports.unstable_Profiling = null;
      exports.unstable_UserBlockingPriority = 2;
      exports.unstable_cancelCallback = function(a) {
        a.callback = null;
      };
      exports.unstable_continueExecution = function() {
        A || z || (A = true, I(J));
      };
      exports.unstable_forceFrameRate = function(a) {
        0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P = 0 < a ? Math.floor(1e3 / a) : 5;
      };
      exports.unstable_getCurrentPriorityLevel = function() {
        return y;
      };
      exports.unstable_getFirstCallbackNode = function() {
        return h(r);
      };
      exports.unstable_next = function(a) {
        switch (y) {
          case 1:
          case 2:
          case 3:
            var b = 3;
            break;
          default:
            b = y;
        }
        var c = y;
        y = b;
        try {
          return a();
        } finally {
          y = c;
        }
      };
      exports.unstable_pauseExecution = function() {
      };
      exports.unstable_requestPaint = function() {
      };
      exports.unstable_runWithPriority = function(a, b) {
        switch (a) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            a = 3;
        }
        var c = y;
        y = a;
        try {
          return b();
        } finally {
          y = c;
        }
      };
      exports.unstable_scheduleCallback = function(a, b, c) {
        var d = exports.unstable_now();
        "object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
        switch (a) {
          case 1:
            var e = -1;
            break;
          case 2:
            e = 250;
            break;
          case 5:
            e = 1073741823;
            break;
          case 4:
            e = 1e4;
            break;
          default:
            e = 5e3;
        }
        e = c + e;
        a = { id: u++, callback: b, priorityLevel: a, startTime: c, expirationTime: e, sortIndex: -1 };
        c > d ? (a.sortIndex = c, f(t, a), null === h(r) && a === h(t) && (B ? (E(L), L = -1) : B = true, K(H, c - d))) : (a.sortIndex = e, f(r, a), A || z || (A = true, I(J)));
        return a;
      };
      exports.unstable_shouldYield = M;
      exports.unstable_wrapCallback = function(a) {
        var b = y;
        return function() {
          var c = y;
          y = b;
          try {
            return a.apply(this, arguments);
          } finally {
            y = c;
          }
        };
      };
    }
  });

  // ../../../node_modules/scheduler/index.js
  var require_scheduler = __commonJS({
    "../../../node_modules/scheduler/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_scheduler_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // ../../../node_modules/react-reconciler/cjs/react-reconciler.production.min.js
  var require_react_reconciler_production_min = __commonJS({
    "../../../node_modules/react-reconciler/cjs/react-reconciler.production.min.js"(exports, module) {
      module.exports = function $$$reconciler($$$hostConfig) {
        var exports2 = {};
        "use strict";
        var aa = require_react(), ba = require_scheduler(), ca = Object.assign;
        function n(a) {
          for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
          return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
        }
        var da = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ea = Symbol.for("react.element"), fa = Symbol.for("react.portal"), ha = Symbol.for("react.fragment"), ia = Symbol.for("react.strict_mode"), ja = Symbol.for("react.profiler"), ka = Symbol.for("react.provider"), la = Symbol.for("react.context"), ma = Symbol.for("react.forward_ref"), na = Symbol.for("react.suspense"), oa = Symbol.for("react.suspense_list"), pa = Symbol.for("react.memo"), qa = Symbol.for("react.lazy");
        Symbol.for("react.scope");
        Symbol.for("react.debug_trace_mode");
        var ra = Symbol.for("react.offscreen");
        Symbol.for("react.legacy_hidden");
        Symbol.for("react.cache");
        Symbol.for("react.tracing_marker");
        var sa = Symbol.iterator;
        function ta(a) {
          if (null === a || "object" !== typeof a) return null;
          a = sa && a[sa] || a["@@iterator"];
          return "function" === typeof a ? a : null;
        }
        function ua(a) {
          if (null == a) return null;
          if ("function" === typeof a) return a.displayName || a.name || null;
          if ("string" === typeof a) return a;
          switch (a) {
            case ha:
              return "Fragment";
            case fa:
              return "Portal";
            case ja:
              return "Profiler";
            case ia:
              return "StrictMode";
            case na:
              return "Suspense";
            case oa:
              return "SuspenseList";
          }
          if ("object" === typeof a) switch (a.$$typeof) {
            case la:
              return (a.displayName || "Context") + ".Consumer";
            case ka:
              return (a._context.displayName || "Context") + ".Provider";
            case ma:
              var b = a.render;
              a = a.displayName;
              a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
              return a;
            case pa:
              return b = a.displayName || null, null !== b ? b : ua(a.type) || "Memo";
            case qa:
              b = a._payload;
              a = a._init;
              try {
                return ua(a(b));
              } catch (c) {
              }
          }
          return null;
        }
        function va(a) {
          var b = a.type;
          switch (a.tag) {
            case 24:
              return "Cache";
            case 9:
              return (b.displayName || "Context") + ".Consumer";
            case 10:
              return (b._context.displayName || "Context") + ".Provider";
            case 18:
              return "DehydratedFragment";
            case 11:
              return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
            case 7:
              return "Fragment";
            case 5:
              return b;
            case 4:
              return "Portal";
            case 3:
              return "Root";
            case 6:
              return "Text";
            case 16:
              return ua(b);
            case 8:
              return b === ia ? "StrictMode" : "Mode";
            case 22:
              return "Offscreen";
            case 12:
              return "Profiler";
            case 21:
              return "Scope";
            case 13:
              return "Suspense";
            case 19:
              return "SuspenseList";
            case 25:
              return "TracingMarker";
            case 1:
            case 0:
            case 17:
            case 2:
            case 14:
            case 15:
              if ("function" === typeof b) return b.displayName || b.name || null;
              if ("string" === typeof b) return b;
          }
          return null;
        }
        function wa(a) {
          var b = a, c = a;
          if (a.alternate) for (; b.return; ) b = b.return;
          else {
            a = b;
            do
              b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
            while (a);
          }
          return 3 === b.tag ? c : null;
        }
        function xa(a) {
          if (wa(a) !== a) throw Error(n(188));
        }
        function za(a) {
          var b = a.alternate;
          if (!b) {
            b = wa(a);
            if (null === b) throw Error(n(188));
            return b !== a ? null : a;
          }
          for (var c = a, d = b; ; ) {
            var e = c.return;
            if (null === e) break;
            var f = e.alternate;
            if (null === f) {
              d = e.return;
              if (null !== d) {
                c = d;
                continue;
              }
              break;
            }
            if (e.child === f.child) {
              for (f = e.child; f; ) {
                if (f === c) return xa(e), a;
                if (f === d) return xa(e), b;
                f = f.sibling;
              }
              throw Error(n(188));
            }
            if (c.return !== d.return) c = e, d = f;
            else {
              for (var g = false, h = e.child; h; ) {
                if (h === c) {
                  g = true;
                  c = e;
                  d = f;
                  break;
                }
                if (h === d) {
                  g = true;
                  d = e;
                  c = f;
                  break;
                }
                h = h.sibling;
              }
              if (!g) {
                for (h = f.child; h; ) {
                  if (h === c) {
                    g = true;
                    c = f;
                    d = e;
                    break;
                  }
                  if (h === d) {
                    g = true;
                    d = f;
                    c = e;
                    break;
                  }
                  h = h.sibling;
                }
                if (!g) throw Error(n(189));
              }
            }
            if (c.alternate !== d) throw Error(n(190));
          }
          if (3 !== c.tag) throw Error(n(188));
          return c.stateNode.current === c ? a : b;
        }
        function Aa(a) {
          a = za(a);
          return null !== a ? Ba(a) : null;
        }
        function Ba(a) {
          if (5 === a.tag || 6 === a.tag) return a;
          for (a = a.child; null !== a; ) {
            var b = Ba(a);
            if (null !== b) return b;
            a = a.sibling;
          }
          return null;
        }
        function Ca(a) {
          if (5 === a.tag || 6 === a.tag) return a;
          for (a = a.child; null !== a; ) {
            if (4 !== a.tag) {
              var b = Ca(a);
              if (null !== b) return b;
            }
            a = a.sibling;
          }
          return null;
        }
        var Da = Array.isArray, Ea = $$$hostConfig.getPublicInstance, Fa = $$$hostConfig.getRootHostContext, Ga = $$$hostConfig.getChildHostContext, Ha = $$$hostConfig.prepareForCommit, Ia = $$$hostConfig.resetAfterCommit, Ja = $$$hostConfig.createInstance, Ka = $$$hostConfig.appendInitialChild, La = $$$hostConfig.finalizeInitialChildren, Ma = $$$hostConfig.prepareUpdate, Na = $$$hostConfig.shouldSetTextContent, Oa = $$$hostConfig.createTextInstance, Pa = $$$hostConfig.scheduleTimeout, Qa = $$$hostConfig.cancelTimeout, Ra = $$$hostConfig.noTimeout, Sa = $$$hostConfig.isPrimaryRenderer, Ta = $$$hostConfig.supportsMutation, Ua = $$$hostConfig.supportsPersistence, Va = $$$hostConfig.supportsHydration, Wa = $$$hostConfig.getInstanceFromNode, Xa = $$$hostConfig.preparePortalMount, Ya = $$$hostConfig.getCurrentEventPriority, Za = $$$hostConfig.detachDeletedInstance, $a = $$$hostConfig.supportsMicrotasks, ab = $$$hostConfig.scheduleMicrotask, bb = $$$hostConfig.supportsTestSelectors, cb = $$$hostConfig.findFiberRoot, db = $$$hostConfig.getBoundingRect, eb = $$$hostConfig.getTextContent, fb = $$$hostConfig.isHiddenSubtree, gb = $$$hostConfig.matchAccessibilityRole, hb = $$$hostConfig.setFocusIfFocusable, ib = $$$hostConfig.setupIntersectionObserver, jb = $$$hostConfig.appendChild, kb = $$$hostConfig.appendChildToContainer, lb = $$$hostConfig.commitTextUpdate, mb = $$$hostConfig.commitMount, nb = $$$hostConfig.commitUpdate, ob = $$$hostConfig.insertBefore, pb = $$$hostConfig.insertInContainerBefore, qb = $$$hostConfig.removeChild, rb = $$$hostConfig.removeChildFromContainer, sb = $$$hostConfig.resetTextContent, tb = $$$hostConfig.hideInstance, ub = $$$hostConfig.hideTextInstance, vb = $$$hostConfig.unhideInstance, wb = $$$hostConfig.unhideTextInstance, xb = $$$hostConfig.clearContainer, yb = $$$hostConfig.cloneInstance, zb = $$$hostConfig.createContainerChildSet, Ab = $$$hostConfig.appendChildToContainerChildSet, Bb = $$$hostConfig.finalizeContainerChildren, Cb = $$$hostConfig.replaceContainerChildren, Eb = $$$hostConfig.cloneHiddenInstance, Fb = $$$hostConfig.cloneHiddenTextInstance, Gb = $$$hostConfig.canHydrateInstance, Hb = $$$hostConfig.canHydrateTextInstance, Ib = $$$hostConfig.canHydrateSuspenseInstance, Jb = $$$hostConfig.isSuspenseInstancePending, Kb = $$$hostConfig.isSuspenseInstanceFallback, Lb = $$$hostConfig.getSuspenseInstanceFallbackErrorDetails, Mb = $$$hostConfig.registerSuspenseInstanceRetry, Nb = $$$hostConfig.getNextHydratableSibling, Ob = $$$hostConfig.getFirstHydratableChild, Pb = $$$hostConfig.getFirstHydratableChildWithinContainer, Qb = $$$hostConfig.getFirstHydratableChildWithinSuspenseInstance, Rb = $$$hostConfig.hydrateInstance, Sb = $$$hostConfig.hydrateTextInstance, Tb = $$$hostConfig.hydrateSuspenseInstance, Ub = $$$hostConfig.getNextHydratableInstanceAfterSuspenseInstance, Vb = $$$hostConfig.commitHydratedContainer, Wb = $$$hostConfig.commitHydratedSuspenseInstance, Xb = $$$hostConfig.clearSuspenseBoundary, Yb = $$$hostConfig.clearSuspenseBoundaryFromContainer, Zb = $$$hostConfig.shouldDeleteUnhydratedTailInstances, $b = $$$hostConfig.didNotMatchHydratedContainerTextInstance, ac = $$$hostConfig.didNotMatchHydratedTextInstance, bc;
        function cc(a) {
          if (void 0 === bc) try {
            throw Error();
          } catch (c) {
            var b = c.stack.trim().match(/\n( *(at )?)/);
            bc = b && b[1] || "";
          }
          return "\n" + bc + a;
        }
        var dc = false;
        function ec(a, b) {
          if (!a || dc) return "";
          dc = true;
          var c = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          try {
            if (b) if (b = function() {
              throw Error();
            }, Object.defineProperty(b.prototype, "props", { set: function() {
              throw Error();
            } }), "object" === typeof Reflect && Reflect.construct) {
              try {
                Reflect.construct(b, []);
              } catch (l) {
                var d = l;
              }
              Reflect.construct(a, [], b);
            } else {
              try {
                b.call();
              } catch (l) {
                d = l;
              }
              a.call(b.prototype);
            }
            else {
              try {
                throw Error();
              } catch (l) {
                d = l;
              }
              a();
            }
          } catch (l) {
            if (l && d && "string" === typeof l.stack) {
              for (var e = l.stack.split("\n"), f = d.stack.split("\n"), g = e.length - 1, h = f.length - 1; 1 <= g && 0 <= h && e[g] !== f[h]; ) h--;
              for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f[h]) {
                if (1 !== g || 1 !== h) {
                  do
                    if (g--, h--, 0 > h || e[g] !== f[h]) {
                      var k = "\n" + e[g].replace(" at new ", " at ");
                      a.displayName && k.includes("<anonymous>") && (k = k.replace("<anonymous>", a.displayName));
                      return k;
                    }
                  while (1 <= g && 0 <= h);
                }
                break;
              }
            }
          } finally {
            dc = false, Error.prepareStackTrace = c;
          }
          return (a = a ? a.displayName || a.name : "") ? cc(a) : "";
        }
        var fc = Object.prototype.hasOwnProperty, gc = [], hc = -1;
        function ic(a) {
          return { current: a };
        }
        function q(a) {
          0 > hc || (a.current = gc[hc], gc[hc] = null, hc--);
        }
        function v(a, b) {
          hc++;
          gc[hc] = a.current;
          a.current = b;
        }
        var jc = {}, x = ic(jc), z = ic(false), kc = jc;
        function mc(a, b) {
          var c = a.type.contextTypes;
          if (!c) return jc;
          var d = a.stateNode;
          if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
          var e = {}, f;
          for (f in c) e[f] = b[f];
          d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
          return e;
        }
        function A(a) {
          a = a.childContextTypes;
          return null !== a && void 0 !== a;
        }
        function nc() {
          q(z);
          q(x);
        }
        function oc(a, b, c) {
          if (x.current !== jc) throw Error(n(168));
          v(x, b);
          v(z, c);
        }
        function pc(a, b, c) {
          var d = a.stateNode;
          b = b.childContextTypes;
          if ("function" !== typeof d.getChildContext) return c;
          d = d.getChildContext();
          for (var e in d) if (!(e in b)) throw Error(n(108, va(a) || "Unknown", e));
          return ca({}, c, d);
        }
        function qc(a) {
          a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || jc;
          kc = x.current;
          v(x, a);
          v(z, z.current);
          return true;
        }
        function rc(a, b, c) {
          var d = a.stateNode;
          if (!d) throw Error(n(169));
          c ? (a = pc(a, b, kc), d.__reactInternalMemoizedMergedChildContext = a, q(z), q(x), v(x, a)) : q(z);
          v(z, c);
        }
        var tc = Math.clz32 ? Math.clz32 : sc, uc = Math.log, vc = Math.LN2;
        function sc(a) {
          a >>>= 0;
          return 0 === a ? 32 : 31 - (uc(a) / vc | 0) | 0;
        }
        var wc = 64, xc = 4194304;
        function yc(a) {
          switch (a & -a) {
            case 1:
              return 1;
            case 2:
              return 2;
            case 4:
              return 4;
            case 8:
              return 8;
            case 16:
              return 16;
            case 32:
              return 32;
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
              return a & 4194240;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
              return a & 130023424;
            case 134217728:
              return 134217728;
            case 268435456:
              return 268435456;
            case 536870912:
              return 536870912;
            case 1073741824:
              return 1073741824;
            default:
              return a;
          }
        }
        function zc(a, b) {
          var c = a.pendingLanes;
          if (0 === c) return 0;
          var d = 0, e = a.suspendedLanes, f = a.pingedLanes, g = c & 268435455;
          if (0 !== g) {
            var h = g & ~e;
            0 !== h ? d = yc(h) : (f &= g, 0 !== f && (d = yc(f)));
          } else g = c & ~e, 0 !== g ? d = yc(g) : 0 !== f && (d = yc(f));
          if (0 === d) return 0;
          if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f = b & -b, e >= f || 16 === e && 0 !== (f & 4194240))) return b;
          0 !== (d & 4) && (d |= c & 16);
          b = a.entangledLanes;
          if (0 !== b) for (a = a.entanglements, b &= d; 0 < b; ) c = 31 - tc(b), e = 1 << c, d |= a[c], b &= ~e;
          return d;
        }
        function Ac(a, b) {
          switch (a) {
            case 1:
            case 2:
            case 4:
              return b + 250;
            case 8:
            case 16:
            case 32:
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
              return b + 5e3;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
              return -1;
            case 134217728:
            case 268435456:
            case 536870912:
            case 1073741824:
              return -1;
            default:
              return -1;
          }
        }
        function Bc(a, b) {
          for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f = a.pendingLanes; 0 < f; ) {
            var g = 31 - tc(f), h = 1 << g, k = e[g];
            if (-1 === k) {
              if (0 === (h & c) || 0 !== (h & d)) e[g] = Ac(h, b);
            } else k <= b && (a.expiredLanes |= h);
            f &= ~h;
          }
        }
        function Cc(a) {
          a = a.pendingLanes & -1073741825;
          return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
        }
        function Dc() {
          var a = wc;
          wc <<= 1;
          0 === (wc & 4194240) && (wc = 64);
          return a;
        }
        function Ec(a) {
          for (var b = [], c = 0; 31 > c; c++) b.push(a);
          return b;
        }
        function Fc(a, b, c) {
          a.pendingLanes |= b;
          536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
          a = a.eventTimes;
          b = 31 - tc(b);
          a[b] = c;
        }
        function Gc(a, b) {
          var c = a.pendingLanes & ~b;
          a.pendingLanes = b;
          a.suspendedLanes = 0;
          a.pingedLanes = 0;
          a.expiredLanes &= b;
          a.mutableReadLanes &= b;
          a.entangledLanes &= b;
          b = a.entanglements;
          var d = a.eventTimes;
          for (a = a.expirationTimes; 0 < c; ) {
            var e = 31 - tc(c), f = 1 << e;
            b[e] = 0;
            d[e] = -1;
            a[e] = -1;
            c &= ~f;
          }
        }
        function Hc(a, b) {
          var c = a.entangledLanes |= b;
          for (a = a.entanglements; c; ) {
            var d = 31 - tc(c), e = 1 << d;
            e & b | a[d] & b && (a[d] |= b);
            c &= ~e;
          }
        }
        var C = 0;
        function Ic(a) {
          a &= -a;
          return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
        }
        var Jc = ba.unstable_scheduleCallback, Kc = ba.unstable_cancelCallback, Lc = ba.unstable_shouldYield, Mc = ba.unstable_requestPaint, D = ba.unstable_now, Nc = ba.unstable_ImmediatePriority, Oc = ba.unstable_UserBlockingPriority, Pc = ba.unstable_NormalPriority, Qc = ba.unstable_IdlePriority, Rc = null, Sc = null;
        function Tc(a) {
          if (Sc && "function" === typeof Sc.onCommitFiberRoot) try {
            Sc.onCommitFiberRoot(Rc, a, void 0, 128 === (a.current.flags & 128));
          } catch (b) {
          }
        }
        function Uc(a, b) {
          return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
        }
        var Vc = "function" === typeof Object.is ? Object.is : Uc, Wc = null, Xc = false, Yc = false;
        function Zc(a) {
          null === Wc ? Wc = [a] : Wc.push(a);
        }
        function $c(a) {
          Xc = true;
          Zc(a);
        }
        function ad() {
          if (!Yc && null !== Wc) {
            Yc = true;
            var a = 0, b = C;
            try {
              var c = Wc;
              for (C = 1; a < c.length; a++) {
                var d = c[a];
                do
                  d = d(true);
                while (null !== d);
              }
              Wc = null;
              Xc = false;
            } catch (e) {
              throw null !== Wc && (Wc = Wc.slice(a + 1)), Jc(Nc, ad), e;
            } finally {
              C = b, Yc = false;
            }
          }
          return null;
        }
        var bd = [], cd = 0, dd = null, ed = 0, fd = [], gd = 0, hd = null, id = 1, jd = "";
        function kd(a, b) {
          bd[cd++] = ed;
          bd[cd++] = dd;
          dd = a;
          ed = b;
        }
        function ld(a, b, c) {
          fd[gd++] = id;
          fd[gd++] = jd;
          fd[gd++] = hd;
          hd = a;
          var d = id;
          a = jd;
          var e = 32 - tc(d) - 1;
          d &= ~(1 << e);
          c += 1;
          var f = 32 - tc(b) + e;
          if (30 < f) {
            var g = e - e % 5;
            f = (d & (1 << g) - 1).toString(32);
            d >>= g;
            e -= g;
            id = 1 << 32 - tc(b) + e | c << e | d;
            jd = f + a;
          } else id = 1 << f | c << e | d, jd = a;
        }
        function md(a) {
          null !== a.return && (kd(a, 1), ld(a, 1, 0));
        }
        function nd(a) {
          for (; a === dd; ) dd = bd[--cd], bd[cd] = null, ed = bd[--cd], bd[cd] = null;
          for (; a === hd; ) hd = fd[--gd], fd[gd] = null, jd = fd[--gd], fd[gd] = null, id = fd[--gd], fd[gd] = null;
        }
        var od = null, pd = null, F = false, qd = false, rd = null;
        function sd(a, b) {
          var c = td(5, null, null, 0);
          c.elementType = "DELETED";
          c.stateNode = b;
          c.return = a;
          b = a.deletions;
          null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
        }
        function ud(a, b) {
          switch (a.tag) {
            case 5:
              return b = Gb(b, a.type, a.pendingProps), null !== b ? (a.stateNode = b, od = a, pd = Ob(b), true) : false;
            case 6:
              return b = Hb(b, a.pendingProps), null !== b ? (a.stateNode = b, od = a, pd = null, true) : false;
            case 13:
              b = Ib(b);
              if (null !== b) {
                var c = null !== hd ? { id, overflow: jd } : null;
                a.memoizedState = { dehydrated: b, treeContext: c, retryLane: 1073741824 };
                c = td(18, null, null, 0);
                c.stateNode = b;
                c.return = a;
                a.child = c;
                od = a;
                pd = null;
                return true;
              }
              return false;
            default:
              return false;
          }
        }
        function vd(a) {
          return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
        }
        function wd(a) {
          if (F) {
            var b = pd;
            if (b) {
              var c = b;
              if (!ud(a, b)) {
                if (vd(a)) throw Error(n(418));
                b = Nb(c);
                var d = od;
                b && ud(a, b) ? sd(d, c) : (a.flags = a.flags & -4097 | 2, F = false, od = a);
              }
            } else {
              if (vd(a)) throw Error(n(418));
              a.flags = a.flags & -4097 | 2;
              F = false;
              od = a;
            }
          }
        }
        function xd(a) {
          for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag; ) a = a.return;
          od = a;
        }
        function yd(a) {
          if (!Va || a !== od) return false;
          if (!F) return xd(a), F = true, false;
          if (3 !== a.tag && (5 !== a.tag || Zb(a.type) && !Na(a.type, a.memoizedProps))) {
            var b = pd;
            if (b) {
              if (vd(a)) throw zd(), Error(n(418));
              for (; b; ) sd(a, b), b = Nb(b);
            }
          }
          xd(a);
          if (13 === a.tag) {
            if (!Va) throw Error(n(316));
            a = a.memoizedState;
            a = null !== a ? a.dehydrated : null;
            if (!a) throw Error(n(317));
            pd = Ub(a);
          } else pd = od ? Nb(a.stateNode) : null;
          return true;
        }
        function zd() {
          for (var a = pd; a; ) a = Nb(a);
        }
        function Ad() {
          Va && (pd = od = null, qd = F = false);
        }
        function Bd(a) {
          null === rd ? rd = [a] : rd.push(a);
        }
        var Cd = da.ReactCurrentBatchConfig;
        function Dd(a, b) {
          if (Vc(a, b)) return true;
          if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return false;
          var c = Object.keys(a), d = Object.keys(b);
          if (c.length !== d.length) return false;
          for (d = 0; d < c.length; d++) {
            var e = c[d];
            if (!fc.call(b, e) || !Vc(a[e], b[e])) return false;
          }
          return true;
        }
        function Ed(a) {
          switch (a.tag) {
            case 5:
              return cc(a.type);
            case 16:
              return cc("Lazy");
            case 13:
              return cc("Suspense");
            case 19:
              return cc("SuspenseList");
            case 0:
            case 2:
            case 15:
              return a = ec(a.type, false), a;
            case 11:
              return a = ec(a.type.render, false), a;
            case 1:
              return a = ec(a.type, true), a;
            default:
              return "";
          }
        }
        function Fd(a, b, c) {
          a = c.ref;
          if (null !== a && "function" !== typeof a && "object" !== typeof a) {
            if (c._owner) {
              c = c._owner;
              if (c) {
                if (1 !== c.tag) throw Error(n(309));
                var d = c.stateNode;
              }
              if (!d) throw Error(n(147, a));
              var e = d, f = "" + a;
              if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f) return b.ref;
              b = function(a2) {
                var b2 = e.refs;
                null === a2 ? delete b2[f] : b2[f] = a2;
              };
              b._stringRef = f;
              return b;
            }
            if ("string" !== typeof a) throw Error(n(284));
            if (!c._owner) throw Error(n(290, a));
          }
          return a;
        }
        function Gd(a, b) {
          a = Object.prototype.toString.call(b);
          throw Error(n(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
        }
        function Hd(a) {
          var b = a._init;
          return b(a._payload);
        }
        function Id(a) {
          function b(b2, c2) {
            if (a) {
              var d2 = b2.deletions;
              null === d2 ? (b2.deletions = [c2], b2.flags |= 16) : d2.push(c2);
            }
          }
          function c(c2, d2) {
            if (!a) return null;
            for (; null !== d2; ) b(c2, d2), d2 = d2.sibling;
            return null;
          }
          function d(a2, b2) {
            for (a2 = /* @__PURE__ */ new Map(); null !== b2; ) null !== b2.key ? a2.set(b2.key, b2) : a2.set(b2.index, b2), b2 = b2.sibling;
            return a2;
          }
          function e(a2, b2) {
            a2 = Jd(a2, b2);
            a2.index = 0;
            a2.sibling = null;
            return a2;
          }
          function f(b2, c2, d2) {
            b2.index = d2;
            if (!a) return b2.flags |= 1048576, c2;
            d2 = b2.alternate;
            if (null !== d2) return d2 = d2.index, d2 < c2 ? (b2.flags |= 2, c2) : d2;
            b2.flags |= 2;
            return c2;
          }
          function g(b2) {
            a && null === b2.alternate && (b2.flags |= 2);
            return b2;
          }
          function h(a2, b2, c2, d2) {
            if (null === b2 || 6 !== b2.tag) return b2 = Kd(c2, a2.mode, d2), b2.return = a2, b2;
            b2 = e(b2, c2);
            b2.return = a2;
            return b2;
          }
          function k(a2, b2, c2, d2) {
            var f2 = c2.type;
            if (f2 === ha) return m(a2, b2, c2.props.children, d2, c2.key);
            if (null !== b2 && (b2.elementType === f2 || "object" === typeof f2 && null !== f2 && f2.$$typeof === qa && Hd(f2) === b2.type)) return d2 = e(b2, c2.props), d2.ref = Fd(a2, b2, c2), d2.return = a2, d2;
            d2 = Ld(c2.type, c2.key, c2.props, null, a2.mode, d2);
            d2.ref = Fd(a2, b2, c2);
            d2.return = a2;
            return d2;
          }
          function l(a2, b2, c2, d2) {
            if (null === b2 || 4 !== b2.tag || b2.stateNode.containerInfo !== c2.containerInfo || b2.stateNode.implementation !== c2.implementation) return b2 = Md(c2, a2.mode, d2), b2.return = a2, b2;
            b2 = e(b2, c2.children || []);
            b2.return = a2;
            return b2;
          }
          function m(a2, b2, c2, d2, f2) {
            if (null === b2 || 7 !== b2.tag) return b2 = Nd(c2, a2.mode, d2, f2), b2.return = a2, b2;
            b2 = e(b2, c2);
            b2.return = a2;
            return b2;
          }
          function r(a2, b2, c2) {
            if ("string" === typeof b2 && "" !== b2 || "number" === typeof b2) return b2 = Kd("" + b2, a2.mode, c2), b2.return = a2, b2;
            if ("object" === typeof b2 && null !== b2) {
              switch (b2.$$typeof) {
                case ea:
                  return c2 = Ld(b2.type, b2.key, b2.props, null, a2.mode, c2), c2.ref = Fd(a2, null, b2), c2.return = a2, c2;
                case fa:
                  return b2 = Md(b2, a2.mode, c2), b2.return = a2, b2;
                case qa:
                  var d2 = b2._init;
                  return r(a2, d2(b2._payload), c2);
              }
              if (Da(b2) || ta(b2)) return b2 = Nd(b2, a2.mode, c2, null), b2.return = a2, b2;
              Gd(a2, b2);
            }
            return null;
          }
          function p(a2, b2, c2, d2) {
            var e2 = null !== b2 ? b2.key : null;
            if ("string" === typeof c2 && "" !== c2 || "number" === typeof c2) return null !== e2 ? null : h(a2, b2, "" + c2, d2);
            if ("object" === typeof c2 && null !== c2) {
              switch (c2.$$typeof) {
                case ea:
                  return c2.key === e2 ? k(a2, b2, c2, d2) : null;
                case fa:
                  return c2.key === e2 ? l(a2, b2, c2, d2) : null;
                case qa:
                  return e2 = c2._init, p(
                    a2,
                    b2,
                    e2(c2._payload),
                    d2
                  );
              }
              if (Da(c2) || ta(c2)) return null !== e2 ? null : m(a2, b2, c2, d2, null);
              Gd(a2, c2);
            }
            return null;
          }
          function B(a2, b2, c2, d2, e2) {
            if ("string" === typeof d2 && "" !== d2 || "number" === typeof d2) return a2 = a2.get(c2) || null, h(b2, a2, "" + d2, e2);
            if ("object" === typeof d2 && null !== d2) {
              switch (d2.$$typeof) {
                case ea:
                  return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, k(b2, a2, d2, e2);
                case fa:
                  return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, l(b2, a2, d2, e2);
                case qa:
                  var f2 = d2._init;
                  return B(a2, b2, c2, f2(d2._payload), e2);
              }
              if (Da(d2) || ta(d2)) return a2 = a2.get(c2) || null, m(b2, a2, d2, e2, null);
              Gd(b2, d2);
            }
            return null;
          }
          function w(e2, g2, h2, k2) {
            for (var l2 = null, m2 = null, u = g2, t = g2 = 0, E = null; null !== u && t < h2.length; t++) {
              u.index > t ? (E = u, u = null) : E = u.sibling;
              var y = p(e2, u, h2[t], k2);
              if (null === y) {
                null === u && (u = E);
                break;
              }
              a && u && null === y.alternate && b(e2, u);
              g2 = f(y, g2, t);
              null === m2 ? l2 = y : m2.sibling = y;
              m2 = y;
              u = E;
            }
            if (t === h2.length) return c(e2, u), F && kd(e2, t), l2;
            if (null === u) {
              for (; t < h2.length; t++) u = r(e2, h2[t], k2), null !== u && (g2 = f(u, g2, t), null === m2 ? l2 = u : m2.sibling = u, m2 = u);
              F && kd(e2, t);
              return l2;
            }
            for (u = d(e2, u); t < h2.length; t++) E = B(u, e2, t, h2[t], k2), null !== E && (a && null !== E.alternate && u.delete(null === E.key ? t : E.key), g2 = f(E, g2, t), null === m2 ? l2 = E : m2.sibling = E, m2 = E);
            a && u.forEach(function(a2) {
              return b(e2, a2);
            });
            F && kd(e2, t);
            return l2;
          }
          function Y(e2, g2, h2, k2) {
            var l2 = ta(h2);
            if ("function" !== typeof l2) throw Error(n(150));
            h2 = l2.call(h2);
            if (null == h2) throw Error(n(151));
            for (var u = l2 = null, m2 = g2, t = g2 = 0, E = null, y = h2.next(); null !== m2 && !y.done; t++, y = h2.next()) {
              m2.index > t ? (E = m2, m2 = null) : E = m2.sibling;
              var w2 = p(e2, m2, y.value, k2);
              if (null === w2) {
                null === m2 && (m2 = E);
                break;
              }
              a && m2 && null === w2.alternate && b(e2, m2);
              g2 = f(w2, g2, t);
              null === u ? l2 = w2 : u.sibling = w2;
              u = w2;
              m2 = E;
            }
            if (y.done) return c(
              e2,
              m2
            ), F && kd(e2, t), l2;
            if (null === m2) {
              for (; !y.done; t++, y = h2.next()) y = r(e2, y.value, k2), null !== y && (g2 = f(y, g2, t), null === u ? l2 = y : u.sibling = y, u = y);
              F && kd(e2, t);
              return l2;
            }
            for (m2 = d(e2, m2); !y.done; t++, y = h2.next()) y = B(m2, e2, t, y.value, k2), null !== y && (a && null !== y.alternate && m2.delete(null === y.key ? t : y.key), g2 = f(y, g2, t), null === u ? l2 = y : u.sibling = y, u = y);
            a && m2.forEach(function(a2) {
              return b(e2, a2);
            });
            F && kd(e2, t);
            return l2;
          }
          function ya(a2, d2, f2, h2) {
            "object" === typeof f2 && null !== f2 && f2.type === ha && null === f2.key && (f2 = f2.props.children);
            if ("object" === typeof f2 && null !== f2) {
              switch (f2.$$typeof) {
                case ea:
                  a: {
                    for (var k2 = f2.key, l2 = d2; null !== l2; ) {
                      if (l2.key === k2) {
                        k2 = f2.type;
                        if (k2 === ha) {
                          if (7 === l2.tag) {
                            c(a2, l2.sibling);
                            d2 = e(l2, f2.props.children);
                            d2.return = a2;
                            a2 = d2;
                            break a;
                          }
                        } else if (l2.elementType === k2 || "object" === typeof k2 && null !== k2 && k2.$$typeof === qa && Hd(k2) === l2.type) {
                          c(a2, l2.sibling);
                          d2 = e(l2, f2.props);
                          d2.ref = Fd(a2, l2, f2);
                          d2.return = a2;
                          a2 = d2;
                          break a;
                        }
                        c(a2, l2);
                        break;
                      } else b(a2, l2);
                      l2 = l2.sibling;
                    }
                    f2.type === ha ? (d2 = Nd(f2.props.children, a2.mode, h2, f2.key), d2.return = a2, a2 = d2) : (h2 = Ld(f2.type, f2.key, f2.props, null, a2.mode, h2), h2.ref = Fd(a2, d2, f2), h2.return = a2, a2 = h2);
                  }
                  return g(a2);
                case fa:
                  a: {
                    for (l2 = f2.key; null !== d2; ) {
                      if (d2.key === l2) if (4 === d2.tag && d2.stateNode.containerInfo === f2.containerInfo && d2.stateNode.implementation === f2.implementation) {
                        c(a2, d2.sibling);
                        d2 = e(d2, f2.children || []);
                        d2.return = a2;
                        a2 = d2;
                        break a;
                      } else {
                        c(a2, d2);
                        break;
                      }
                      else b(a2, d2);
                      d2 = d2.sibling;
                    }
                    d2 = Md(f2, a2.mode, h2);
                    d2.return = a2;
                    a2 = d2;
                  }
                  return g(a2);
                case qa:
                  return l2 = f2._init, ya(a2, d2, l2(f2._payload), h2);
              }
              if (Da(f2)) return w(a2, d2, f2, h2);
              if (ta(f2)) return Y(a2, d2, f2, h2);
              Gd(a2, f2);
            }
            return "string" === typeof f2 && "" !== f2 || "number" === typeof f2 ? (f2 = "" + f2, null !== d2 && 6 === d2.tag ? (c(a2, d2.sibling), d2 = e(d2, f2), d2.return = a2, a2 = d2) : (c(a2, d2), d2 = Kd(f2, a2.mode, h2), d2.return = a2, a2 = d2), g(a2)) : c(a2, d2);
          }
          return ya;
        }
        var Od = Id(true), Pd = Id(false), Qd = ic(null), Rd = null, Sd = null, Td = null;
        function Ud() {
          Td = Sd = Rd = null;
        }
        function Vd(a, b, c) {
          Sa ? (v(Qd, b._currentValue), b._currentValue = c) : (v(Qd, b._currentValue2), b._currentValue2 = c);
        }
        function Wd(a) {
          var b = Qd.current;
          q(Qd);
          Sa ? a._currentValue = b : a._currentValue2 = b;
        }
        function Xd(a, b, c) {
          for (; null !== a; ) {
            var d = a.alternate;
            (a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
            if (a === c) break;
            a = a.return;
          }
        }
        function Yd(a, b) {
          Rd = a;
          Td = Sd = null;
          a = a.dependencies;
          null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (G = true), a.firstContext = null);
        }
        function Zd(a) {
          var b = Sa ? a._currentValue : a._currentValue2;
          if (Td !== a) if (a = { context: a, memoizedValue: b, next: null }, null === Sd) {
            if (null === Rd) throw Error(n(308));
            Sd = a;
            Rd.dependencies = { lanes: 0, firstContext: a };
          } else Sd = Sd.next = a;
          return b;
        }
        var $d = null;
        function ae(a) {
          null === $d ? $d = [a] : $d.push(a);
        }
        function be(a, b, c, d) {
          var e = b.interleaved;
          null === e ? (c.next = c, ae(b)) : (c.next = e.next, e.next = c);
          b.interleaved = c;
          return ce(a, d);
        }
        function ce(a, b) {
          a.lanes |= b;
          var c = a.alternate;
          null !== c && (c.lanes |= b);
          c = a;
          for (a = a.return; null !== a; ) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
          return 3 === c.tag ? c.stateNode : null;
        }
        var de = false;
        function ee(a) {
          a.updateQueue = { baseState: a.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
        }
        function fe(a, b) {
          a = a.updateQueue;
          b.updateQueue === a && (b.updateQueue = { baseState: a.baseState, firstBaseUpdate: a.firstBaseUpdate, lastBaseUpdate: a.lastBaseUpdate, shared: a.shared, effects: a.effects });
        }
        function ge(a, b) {
          return { eventTime: a, lane: b, tag: 0, payload: null, callback: null, next: null };
        }
        function he(a, b, c) {
          var d = a.updateQueue;
          if (null === d) return null;
          d = d.shared;
          if (0 !== (H & 2)) {
            var e = d.pending;
            null === e ? b.next = b : (b.next = e.next, e.next = b);
            d.pending = b;
            return ce(a, c);
          }
          e = d.interleaved;
          null === e ? (b.next = b, ae(d)) : (b.next = e.next, e.next = b);
          d.interleaved = b;
          return ce(a, c);
        }
        function ie(a, b, c) {
          b = b.updateQueue;
          if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
            var d = b.lanes;
            d &= a.pendingLanes;
            c |= d;
            b.lanes = c;
            Hc(a, c);
          }
        }
        function je(a, b) {
          var c = a.updateQueue, d = a.alternate;
          if (null !== d && (d = d.updateQueue, c === d)) {
            var e = null, f = null;
            c = c.firstBaseUpdate;
            if (null !== c) {
              do {
                var g = { eventTime: c.eventTime, lane: c.lane, tag: c.tag, payload: c.payload, callback: c.callback, next: null };
                null === f ? e = f = g : f = f.next = g;
                c = c.next;
              } while (null !== c);
              null === f ? e = f = b : f = f.next = b;
            } else e = f = b;
            c = { baseState: d.baseState, firstBaseUpdate: e, lastBaseUpdate: f, shared: d.shared, effects: d.effects };
            a.updateQueue = c;
            return;
          }
          a = c.lastBaseUpdate;
          null === a ? c.firstBaseUpdate = b : a.next = b;
          c.lastBaseUpdate = b;
        }
        function ke(a, b, c, d) {
          var e = a.updateQueue;
          de = false;
          var f = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
          if (null !== h) {
            e.shared.pending = null;
            var k = h, l = k.next;
            k.next = null;
            null === g ? f = l : g.next = l;
            g = k;
            var m = a.alternate;
            null !== m && (m = m.updateQueue, h = m.lastBaseUpdate, h !== g && (null === h ? m.firstBaseUpdate = l : h.next = l, m.lastBaseUpdate = k));
          }
          if (null !== f) {
            var r = e.baseState;
            g = 0;
            m = l = k = null;
            h = f;
            do {
              var p = h.lane, B = h.eventTime;
              if ((d & p) === p) {
                null !== m && (m = m.next = {
                  eventTime: B,
                  lane: 0,
                  tag: h.tag,
                  payload: h.payload,
                  callback: h.callback,
                  next: null
                });
                a: {
                  var w = a, Y = h;
                  p = b;
                  B = c;
                  switch (Y.tag) {
                    case 1:
                      w = Y.payload;
                      if ("function" === typeof w) {
                        r = w.call(B, r, p);
                        break a;
                      }
                      r = w;
                      break a;
                    case 3:
                      w.flags = w.flags & -65537 | 128;
                    case 0:
                      w = Y.payload;
                      p = "function" === typeof w ? w.call(B, r, p) : w;
                      if (null === p || void 0 === p) break a;
                      r = ca({}, r, p);
                      break a;
                    case 2:
                      de = true;
                  }
                }
                null !== h.callback && 0 !== h.lane && (a.flags |= 64, p = e.effects, null === p ? e.effects = [h] : p.push(h));
              } else B = { eventTime: B, lane: p, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, null === m ? (l = m = B, k = r) : m = m.next = B, g |= p;
              h = h.next;
              if (null === h) if (h = e.shared.pending, null === h) break;
              else p = h, h = p.next, p.next = null, e.lastBaseUpdate = p, e.shared.pending = null;
            } while (1);
            null === m && (k = r);
            e.baseState = k;
            e.firstBaseUpdate = l;
            e.lastBaseUpdate = m;
            b = e.shared.interleaved;
            if (null !== b) {
              e = b;
              do
                g |= e.lane, e = e.next;
              while (e !== b);
            } else null === f && (e.shared.lanes = 0);
            le |= g;
            a.lanes = g;
            a.memoizedState = r;
          }
        }
        function me(a, b, c) {
          a = b.effects;
          b.effects = null;
          if (null !== a) for (b = 0; b < a.length; b++) {
            var d = a[b], e = d.callback;
            if (null !== e) {
              d.callback = null;
              d = c;
              if ("function" !== typeof e) throw Error(n(191, e));
              e.call(d);
            }
          }
        }
        var ne = {}, oe = ic(ne), pe = ic(ne), qe = ic(ne);
        function re(a) {
          if (a === ne) throw Error(n(174));
          return a;
        }
        function se(a, b) {
          v(qe, b);
          v(pe, a);
          v(oe, ne);
          a = Fa(b);
          q(oe);
          v(oe, a);
        }
        function te() {
          q(oe);
          q(pe);
          q(qe);
        }
        function ue(a) {
          var b = re(qe.current), c = re(oe.current);
          b = Ga(c, a.type, b);
          c !== b && (v(pe, a), v(oe, b));
        }
        function ve(a) {
          pe.current === a && (q(oe), q(pe));
        }
        var I = ic(0);
        function we(a) {
          for (var b = a; null !== b; ) {
            if (13 === b.tag) {
              var c = b.memoizedState;
              if (null !== c && (c = c.dehydrated, null === c || Jb(c) || Kb(c))) return b;
            } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
              if (0 !== (b.flags & 128)) return b;
            } else if (null !== b.child) {
              b.child.return = b;
              b = b.child;
              continue;
            }
            if (b === a) break;
            for (; null === b.sibling; ) {
              if (null === b.return || b.return === a) return null;
              b = b.return;
            }
            b.sibling.return = b.return;
            b = b.sibling;
          }
          return null;
        }
        var xe = [];
        function ye() {
          for (var a = 0; a < xe.length; a++) {
            var b = xe[a];
            Sa ? b._workInProgressVersionPrimary = null : b._workInProgressVersionSecondary = null;
          }
          xe.length = 0;
        }
        var ze = da.ReactCurrentDispatcher, Ae = da.ReactCurrentBatchConfig, Be = 0, J = null, K = null, L = null, Ce = false, De = false, Ee = 0, Fe = 0;
        function M() {
          throw Error(n(321));
        }
        function Ge(a, b) {
          if (null === b) return false;
          for (var c = 0; c < b.length && c < a.length; c++) if (!Vc(a[c], b[c])) return false;
          return true;
        }
        function He(a, b, c, d, e, f) {
          Be = f;
          J = b;
          b.memoizedState = null;
          b.updateQueue = null;
          b.lanes = 0;
          ze.current = null === a || null === a.memoizedState ? Ie : Je;
          a = c(d, e);
          if (De) {
            f = 0;
            do {
              De = false;
              Ee = 0;
              if (25 <= f) throw Error(n(301));
              f += 1;
              L = K = null;
              b.updateQueue = null;
              ze.current = Ke;
              a = c(d, e);
            } while (De);
          }
          ze.current = Le;
          b = null !== K && null !== K.next;
          Be = 0;
          L = K = J = null;
          Ce = false;
          if (b) throw Error(n(300));
          return a;
        }
        function Me() {
          var a = 0 !== Ee;
          Ee = 0;
          return a;
        }
        function Ne() {
          var a = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
          null === L ? J.memoizedState = L = a : L = L.next = a;
          return L;
        }
        function Oe() {
          if (null === K) {
            var a = J.alternate;
            a = null !== a ? a.memoizedState : null;
          } else a = K.next;
          var b = null === L ? J.memoizedState : L.next;
          if (null !== b) L = b, K = a;
          else {
            if (null === a) throw Error(n(310));
            K = a;
            a = { memoizedState: K.memoizedState, baseState: K.baseState, baseQueue: K.baseQueue, queue: K.queue, next: null };
            null === L ? J.memoizedState = L = a : L = L.next = a;
          }
          return L;
        }
        function Pe(a, b) {
          return "function" === typeof b ? b(a) : b;
        }
        function Qe(a) {
          var b = Oe(), c = b.queue;
          if (null === c) throw Error(n(311));
          c.lastRenderedReducer = a;
          var d = K, e = d.baseQueue, f = c.pending;
          if (null !== f) {
            if (null !== e) {
              var g = e.next;
              e.next = f.next;
              f.next = g;
            }
            d.baseQueue = e = f;
            c.pending = null;
          }
          if (null !== e) {
            f = e.next;
            d = d.baseState;
            var h = g = null, k = null, l = f;
            do {
              var m = l.lane;
              if ((Be & m) === m) null !== k && (k = k.next = { lane: 0, action: l.action, hasEagerState: l.hasEagerState, eagerState: l.eagerState, next: null }), d = l.hasEagerState ? l.eagerState : a(d, l.action);
              else {
                var r = {
                  lane: m,
                  action: l.action,
                  hasEagerState: l.hasEagerState,
                  eagerState: l.eagerState,
                  next: null
                };
                null === k ? (h = k = r, g = d) : k = k.next = r;
                J.lanes |= m;
                le |= m;
              }
              l = l.next;
            } while (null !== l && l !== f);
            null === k ? g = d : k.next = h;
            Vc(d, b.memoizedState) || (G = true);
            b.memoizedState = d;
            b.baseState = g;
            b.baseQueue = k;
            c.lastRenderedState = d;
          }
          a = c.interleaved;
          if (null !== a) {
            e = a;
            do
              f = e.lane, J.lanes |= f, le |= f, e = e.next;
            while (e !== a);
          } else null === e && (c.lanes = 0);
          return [b.memoizedState, c.dispatch];
        }
        function Re(a) {
          var b = Oe(), c = b.queue;
          if (null === c) throw Error(n(311));
          c.lastRenderedReducer = a;
          var d = c.dispatch, e = c.pending, f = b.memoizedState;
          if (null !== e) {
            c.pending = null;
            var g = e = e.next;
            do
              f = a(f, g.action), g = g.next;
            while (g !== e);
            Vc(f, b.memoizedState) || (G = true);
            b.memoizedState = f;
            null === b.baseQueue && (b.baseState = f);
            c.lastRenderedState = f;
          }
          return [f, d];
        }
        function Se() {
        }
        function Te(a, b) {
          var c = J, d = Oe(), e = b(), f = !Vc(d.memoizedState, e);
          f && (d.memoizedState = e, G = true);
          d = d.queue;
          Ue(Ve.bind(null, c, d, a), [a]);
          if (d.getSnapshot !== b || f || null !== L && L.memoizedState.tag & 1) {
            c.flags |= 2048;
            We(9, Xe.bind(null, c, d, e, b), void 0, null);
            if (null === N) throw Error(n(349));
            0 !== (Be & 30) || Ye(c, b, e);
          }
          return e;
        }
        function Ye(a, b, c) {
          a.flags |= 16384;
          a = { getSnapshot: b, value: c };
          b = J.updateQueue;
          null === b ? (b = { lastEffect: null, stores: null }, J.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
        }
        function Xe(a, b, c, d) {
          b.value = c;
          b.getSnapshot = d;
          Ze(b) && $e(a);
        }
        function Ve(a, b, c) {
          return c(function() {
            Ze(b) && $e(a);
          });
        }
        function Ze(a) {
          var b = a.getSnapshot;
          a = a.value;
          try {
            var c = b();
            return !Vc(a, c);
          } catch (d) {
            return true;
          }
        }
        function $e(a) {
          var b = ce(a, 1);
          null !== b && af(b, a, 1, -1);
        }
        function bf(a) {
          var b = Ne();
          "function" === typeof a && (a = a());
          b.memoizedState = b.baseState = a;
          a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Pe, lastRenderedState: a };
          b.queue = a;
          a = a.dispatch = cf.bind(null, J, a);
          return [b.memoizedState, a];
        }
        function We(a, b, c, d) {
          a = { tag: a, create: b, destroy: c, deps: d, next: null };
          b = J.updateQueue;
          null === b ? (b = { lastEffect: null, stores: null }, J.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
          return a;
        }
        function df() {
          return Oe().memoizedState;
        }
        function ef(a, b, c, d) {
          var e = Ne();
          J.flags |= a;
          e.memoizedState = We(1 | b, c, void 0, void 0 === d ? null : d);
        }
        function ff(a, b, c, d) {
          var e = Oe();
          d = void 0 === d ? null : d;
          var f = void 0;
          if (null !== K) {
            var g = K.memoizedState;
            f = g.destroy;
            if (null !== d && Ge(d, g.deps)) {
              e.memoizedState = We(b, c, f, d);
              return;
            }
          }
          J.flags |= a;
          e.memoizedState = We(1 | b, c, f, d);
        }
        function gf(a, b) {
          return ef(8390656, 8, a, b);
        }
        function Ue(a, b) {
          return ff(2048, 8, a, b);
        }
        function hf(a, b) {
          return ff(4, 2, a, b);
        }
        function jf(a, b) {
          return ff(4, 4, a, b);
        }
        function kf(a, b) {
          if ("function" === typeof b) return a = a(), b(a), function() {
            b(null);
          };
          if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
            b.current = null;
          };
        }
        function lf(a, b, c) {
          c = null !== c && void 0 !== c ? c.concat([a]) : null;
          return ff(4, 4, kf.bind(null, b, a), c);
        }
        function mf() {
        }
        function nf(a, b) {
          var c = Oe();
          b = void 0 === b ? null : b;
          var d = c.memoizedState;
          if (null !== d && null !== b && Ge(b, d[1])) return d[0];
          c.memoizedState = [a, b];
          return a;
        }
        function of(a, b) {
          var c = Oe();
          b = void 0 === b ? null : b;
          var d = c.memoizedState;
          if (null !== d && null !== b && Ge(b, d[1])) return d[0];
          a = a();
          c.memoizedState = [a, b];
          return a;
        }
        function pf(a, b, c) {
          if (0 === (Be & 21)) return a.baseState && (a.baseState = false, G = true), a.memoizedState = c;
          Vc(c, b) || (c = Dc(), J.lanes |= c, le |= c, a.baseState = true);
          return b;
        }
        function qf(a, b) {
          var c = C;
          C = 0 !== c && 4 > c ? c : 4;
          a(true);
          var d = Ae.transition;
          Ae.transition = {};
          try {
            a(false), b();
          } finally {
            C = c, Ae.transition = d;
          }
        }
        function rf() {
          return Oe().memoizedState;
        }
        function sf(a, b, c) {
          var d = tf(a);
          c = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
          if (uf(a)) vf(b, c);
          else if (c = be(a, b, c, d), null !== c) {
            var e = O();
            af(c, a, d, e);
            wf(c, b, d);
          }
        }
        function cf(a, b, c) {
          var d = tf(a), e = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
          if (uf(a)) vf(b, e);
          else {
            var f = a.alternate;
            if (0 === a.lanes && (null === f || 0 === f.lanes) && (f = b.lastRenderedReducer, null !== f)) try {
              var g = b.lastRenderedState, h = f(g, c);
              e.hasEagerState = true;
              e.eagerState = h;
              if (Vc(h, g)) {
                var k = b.interleaved;
                null === k ? (e.next = e, ae(b)) : (e.next = k.next, k.next = e);
                b.interleaved = e;
                return;
              }
            } catch (l) {
            } finally {
            }
            c = be(a, b, e, d);
            null !== c && (e = O(), af(c, a, d, e), wf(c, b, d));
          }
        }
        function uf(a) {
          var b = a.alternate;
          return a === J || null !== b && b === J;
        }
        function vf(a, b) {
          De = Ce = true;
          var c = a.pending;
          null === c ? b.next = b : (b.next = c.next, c.next = b);
          a.pending = b;
        }
        function wf(a, b, c) {
          if (0 !== (c & 4194240)) {
            var d = b.lanes;
            d &= a.pendingLanes;
            c |= d;
            b.lanes = c;
            Hc(a, c);
          }
        }
        var Le = { readContext: Zd, useCallback: M, useContext: M, useEffect: M, useImperativeHandle: M, useInsertionEffect: M, useLayoutEffect: M, useMemo: M, useReducer: M, useRef: M, useState: M, useDebugValue: M, useDeferredValue: M, useTransition: M, useMutableSource: M, useSyncExternalStore: M, useId: M, unstable_isNewReconciler: false }, Ie = { readContext: Zd, useCallback: function(a, b) {
          Ne().memoizedState = [a, void 0 === b ? null : b];
          return a;
        }, useContext: Zd, useEffect: gf, useImperativeHandle: function(a, b, c) {
          c = null !== c && void 0 !== c ? c.concat([a]) : null;
          return ef(
            4194308,
            4,
            kf.bind(null, b, a),
            c
          );
        }, useLayoutEffect: function(a, b) {
          return ef(4194308, 4, a, b);
        }, useInsertionEffect: function(a, b) {
          return ef(4, 2, a, b);
        }, useMemo: function(a, b) {
          var c = Ne();
          b = void 0 === b ? null : b;
          a = a();
          c.memoizedState = [a, b];
          return a;
        }, useReducer: function(a, b, c) {
          var d = Ne();
          b = void 0 !== c ? c(b) : b;
          d.memoizedState = d.baseState = b;
          a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a, lastRenderedState: b };
          d.queue = a;
          a = a.dispatch = sf.bind(null, J, a);
          return [d.memoizedState, a];
        }, useRef: function(a) {
          var b = Ne();
          a = { current: a };
          return b.memoizedState = a;
        }, useState: bf, useDebugValue: mf, useDeferredValue: function(a) {
          return Ne().memoizedState = a;
        }, useTransition: function() {
          var a = bf(false), b = a[0];
          a = qf.bind(null, a[1]);
          Ne().memoizedState = a;
          return [b, a];
        }, useMutableSource: function() {
        }, useSyncExternalStore: function(a, b, c) {
          var d = J, e = Ne();
          if (F) {
            if (void 0 === c) throw Error(n(407));
            c = c();
          } else {
            c = b();
            if (null === N) throw Error(n(349));
            0 !== (Be & 30) || Ye(d, b, c);
          }
          e.memoizedState = c;
          var f = { value: c, getSnapshot: b };
          e.queue = f;
          gf(Ve.bind(
            null,
            d,
            f,
            a
          ), [a]);
          d.flags |= 2048;
          We(9, Xe.bind(null, d, f, c, b), void 0, null);
          return c;
        }, useId: function() {
          var a = Ne(), b = N.identifierPrefix;
          if (F) {
            var c = jd;
            var d = id;
            c = (d & ~(1 << 32 - tc(d) - 1)).toString(32) + c;
            b = ":" + b + "R" + c;
            c = Ee++;
            0 < c && (b += "H" + c.toString(32));
            b += ":";
          } else c = Fe++, b = ":" + b + "r" + c.toString(32) + ":";
          return a.memoizedState = b;
        }, unstable_isNewReconciler: false }, Je = {
          readContext: Zd,
          useCallback: nf,
          useContext: Zd,
          useEffect: Ue,
          useImperativeHandle: lf,
          useInsertionEffect: hf,
          useLayoutEffect: jf,
          useMemo: of,
          useReducer: Qe,
          useRef: df,
          useState: function() {
            return Qe(Pe);
          },
          useDebugValue: mf,
          useDeferredValue: function(a) {
            var b = Oe();
            return pf(b, K.memoizedState, a);
          },
          useTransition: function() {
            var a = Qe(Pe)[0], b = Oe().memoizedState;
            return [a, b];
          },
          useMutableSource: Se,
          useSyncExternalStore: Te,
          useId: rf,
          unstable_isNewReconciler: false
        }, Ke = { readContext: Zd, useCallback: nf, useContext: Zd, useEffect: Ue, useImperativeHandle: lf, useInsertionEffect: hf, useLayoutEffect: jf, useMemo: of, useReducer: Re, useRef: df, useState: function() {
          return Re(Pe);
        }, useDebugValue: mf, useDeferredValue: function(a) {
          var b = Oe();
          return null === K ? b.memoizedState = a : pf(b, K.memoizedState, a);
        }, useTransition: function() {
          var a = Re(Pe)[0], b = Oe().memoizedState;
          return [a, b];
        }, useMutableSource: Se, useSyncExternalStore: Te, useId: rf, unstable_isNewReconciler: false };
        function xf(a, b) {
          if (a && a.defaultProps) {
            b = ca({}, b);
            a = a.defaultProps;
            for (var c in a) void 0 === b[c] && (b[c] = a[c]);
            return b;
          }
          return b;
        }
        function yf(a, b, c, d) {
          b = a.memoizedState;
          c = c(d, b);
          c = null === c || void 0 === c ? b : ca({}, b, c);
          a.memoizedState = c;
          0 === a.lanes && (a.updateQueue.baseState = c);
        }
        var zf = { isMounted: function(a) {
          return (a = a._reactInternals) ? wa(a) === a : false;
        }, enqueueSetState: function(a, b, c) {
          a = a._reactInternals;
          var d = O(), e = tf(a), f = ge(d, e);
          f.payload = b;
          void 0 !== c && null !== c && (f.callback = c);
          b = he(a, f, e);
          null !== b && (af(b, a, e, d), ie(b, a, e));
        }, enqueueReplaceState: function(a, b, c) {
          a = a._reactInternals;
          var d = O(), e = tf(a), f = ge(d, e);
          f.tag = 1;
          f.payload = b;
          void 0 !== c && null !== c && (f.callback = c);
          b = he(a, f, e);
          null !== b && (af(b, a, e, d), ie(b, a, e));
        }, enqueueForceUpdate: function(a, b) {
          a = a._reactInternals;
          var c = O(), d = tf(a), e = ge(c, d);
          e.tag = 2;
          void 0 !== b && null !== b && (e.callback = b);
          b = he(a, e, d);
          null !== b && (af(b, a, d, c), ie(b, a, d));
        } };
        function Af(a, b, c, d, e, f, g) {
          a = a.stateNode;
          return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f, g) : b.prototype && b.prototype.isPureReactComponent ? !Dd(c, d) || !Dd(e, f) : true;
        }
        function Bf(a, b, c) {
          var d = false, e = jc;
          var f = b.contextType;
          "object" === typeof f && null !== f ? f = Zd(f) : (e = A(b) ? kc : x.current, d = b.contextTypes, f = (d = null !== d && void 0 !== d) ? mc(a, e) : jc);
          b = new b(c, f);
          a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
          b.updater = zf;
          a.stateNode = b;
          b._reactInternals = a;
          d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f);
          return b;
        }
        function Cf(a, b, c, d) {
          a = b.state;
          "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
          "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
          b.state !== a && zf.enqueueReplaceState(b, b.state, null);
        }
        function Df(a, b, c, d) {
          var e = a.stateNode;
          e.props = c;
          e.state = a.memoizedState;
          e.refs = {};
          ee(a);
          var f = b.contextType;
          "object" === typeof f && null !== f ? e.context = Zd(f) : (f = A(b) ? kc : x.current, e.context = mc(a, f));
          e.state = a.memoizedState;
          f = b.getDerivedStateFromProps;
          "function" === typeof f && (yf(a, b, f, c), e.state = a.memoizedState);
          "function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && zf.enqueueReplaceState(e, e.state, null), ke(a, c, e, d), e.state = a.memoizedState);
          "function" === typeof e.componentDidMount && (a.flags |= 4194308);
        }
        function Ef(a, b) {
          try {
            var c = "", d = b;
            do
              c += Ed(d), d = d.return;
            while (d);
            var e = c;
          } catch (f) {
            e = "\nError generating stack: " + f.message + "\n" + f.stack;
          }
          return { value: a, source: b, stack: e, digest: null };
        }
        function Ff(a, b, c) {
          return { value: a, source: null, stack: null != c ? c : null, digest: null != b ? b : null };
        }
        function Gf(a, b) {
          try {
            console.error(b.value);
          } catch (c) {
            setTimeout(function() {
              throw c;
            });
          }
        }
        var Hf = "function" === typeof WeakMap ? WeakMap : Map;
        function If(a, b, c) {
          c = ge(-1, c);
          c.tag = 3;
          c.payload = { element: null };
          var d = b.value;
          c.callback = function() {
            Jf || (Jf = true, Kf = d);
            Gf(a, b);
          };
          return c;
        }
        function Lf(a, b, c) {
          c = ge(-1, c);
          c.tag = 3;
          var d = a.type.getDerivedStateFromError;
          if ("function" === typeof d) {
            var e = b.value;
            c.payload = function() {
              return d(e);
            };
            c.callback = function() {
              Gf(a, b);
            };
          }
          var f = a.stateNode;
          null !== f && "function" === typeof f.componentDidCatch && (c.callback = function() {
            Gf(a, b);
            "function" !== typeof d && (null === Mf ? Mf = /* @__PURE__ */ new Set([this]) : Mf.add(this));
            var c2 = b.stack;
            this.componentDidCatch(b.value, { componentStack: null !== c2 ? c2 : "" });
          });
          return c;
        }
        function Nf(a, b, c) {
          var d = a.pingCache;
          if (null === d) {
            d = a.pingCache = new Hf();
            var e = /* @__PURE__ */ new Set();
            d.set(b, e);
          } else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
          e.has(c) || (e.add(c), a = Of.bind(null, a, b, c), b.then(a, a));
        }
        function Pf(a) {
          do {
            var b;
            if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? true : false : true;
            if (b) return a;
            a = a.return;
          } while (null !== a);
          return null;
        }
        function Qf(a, b, c, d, e) {
          if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = ge(-1, 1), b.tag = 2, he(c, b, 1))), c.lanes |= 1), a;
          a.flags |= 65536;
          a.lanes = e;
          return a;
        }
        var Rf = da.ReactCurrentOwner, G = false;
        function P(a, b, c, d) {
          b.child = null === a ? Pd(b, null, c, d) : Od(b, a.child, c, d);
        }
        function Sf(a, b, c, d, e) {
          c = c.render;
          var f = b.ref;
          Yd(b, e);
          d = He(a, b, c, d, f, e);
          c = Me();
          if (null !== a && !G) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Tf(a, b, e);
          F && c && md(b);
          b.flags |= 1;
          P(a, b, d, e);
          return b.child;
        }
        function Uf(a, b, c, d, e) {
          if (null === a) {
            var f = c.type;
            if ("function" === typeof f && !Vf(f) && void 0 === f.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f, Wf(a, b, f, d, e);
            a = Ld(c.type, null, d, b, b.mode, e);
            a.ref = b.ref;
            a.return = b;
            return b.child = a;
          }
          f = a.child;
          if (0 === (a.lanes & e)) {
            var g = f.memoizedProps;
            c = c.compare;
            c = null !== c ? c : Dd;
            if (c(g, d) && a.ref === b.ref) return Tf(a, b, e);
          }
          b.flags |= 1;
          a = Jd(f, d);
          a.ref = b.ref;
          a.return = b;
          return b.child = a;
        }
        function Wf(a, b, c, d, e) {
          if (null !== a) {
            var f = a.memoizedProps;
            if (Dd(f, d) && a.ref === b.ref) if (G = false, b.pendingProps = d = f, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (G = true);
            else return b.lanes = a.lanes, Tf(a, b, e);
          }
          return Xf(a, b, c, d, e);
        }
        function Yf(a, b, c) {
          var d = b.pendingProps, e = d.children, f = null !== a ? a.memoizedState : null;
          if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, v(Zf, $f), $f |= c;
          else {
            if (0 === (c & 1073741824)) return a = null !== f ? f.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a, cachePool: null, transitions: null }, b.updateQueue = null, v(Zf, $f), $f |= a, null;
            b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
            d = null !== f ? f.baseLanes : c;
            v(Zf, $f);
            $f |= d;
          }
          else null !== f ? (d = f.baseLanes | c, b.memoizedState = null) : d = c, v(Zf, $f), $f |= d;
          P(a, b, e, c);
          return b.child;
        }
        function ag(a, b) {
          var c = b.ref;
          if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
        }
        function Xf(a, b, c, d, e) {
          var f = A(c) ? kc : x.current;
          f = mc(b, f);
          Yd(b, e);
          c = He(a, b, c, d, f, e);
          d = Me();
          if (null !== a && !G) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Tf(a, b, e);
          F && d && md(b);
          b.flags |= 1;
          P(a, b, c, e);
          return b.child;
        }
        function bg(a, b, c, d, e) {
          if (A(c)) {
            var f = true;
            qc(b);
          } else f = false;
          Yd(b, e);
          if (null === b.stateNode) cg(a, b), Bf(b, c, d), Df(b, c, d, e), d = true;
          else if (null === a) {
            var g = b.stateNode, h = b.memoizedProps;
            g.props = h;
            var k = g.context, l = c.contextType;
            "object" === typeof l && null !== l ? l = Zd(l) : (l = A(c) ? kc : x.current, l = mc(b, l));
            var m = c.getDerivedStateFromProps, r = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate;
            r || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && Cf(b, g, d, l);
            de = false;
            var p = b.memoizedState;
            g.state = p;
            ke(b, d, g, e);
            k = b.memoizedState;
            h !== d || p !== k || z.current || de ? ("function" === typeof m && (yf(b, c, m, d), k = b.memoizedState), (h = de || Af(b, c, h, d, p, k, l)) ? (r || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k), g.props = d, g.state = k, g.context = l, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = false);
          } else {
            g = b.stateNode;
            fe(a, b);
            h = b.memoizedProps;
            l = b.type === b.elementType ? h : xf(b.type, h);
            g.props = l;
            r = b.pendingProps;
            p = g.context;
            k = c.contextType;
            "object" === typeof k && null !== k ? k = Zd(k) : (k = A(c) ? kc : x.current, k = mc(b, k));
            var B = c.getDerivedStateFromProps;
            (m = "function" === typeof B || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== r || p !== k) && Cf(b, g, d, k);
            de = false;
            p = b.memoizedState;
            g.state = p;
            ke(b, d, g, e);
            var w = b.memoizedState;
            h !== r || p !== w || z.current || de ? ("function" === typeof B && (yf(b, c, B, d), w = b.memoizedState), (l = de || Af(b, c, l, d, p, w, k) || false) ? (m || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, w, k), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, w, k)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && p === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && p === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = w), g.props = d, g.state = w, g.context = k, d = l) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && p === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && p === a.memoizedState || (b.flags |= 1024), d = false);
          }
          return dg(a, b, c, d, f, e);
        }
        function dg(a, b, c, d, e, f) {
          ag(a, b);
          var g = 0 !== (b.flags & 128);
          if (!d && !g) return e && rc(b, c, false), Tf(a, b, f);
          d = b.stateNode;
          Rf.current = b;
          var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
          b.flags |= 1;
          null !== a && g ? (b.child = Od(b, a.child, null, f), b.child = Od(b, null, h, f)) : P(a, b, h, f);
          b.memoizedState = d.state;
          e && rc(b, c, true);
          return b.child;
        }
        function eg(a) {
          var b = a.stateNode;
          b.pendingContext ? oc(a, b.pendingContext, b.pendingContext !== b.context) : b.context && oc(a, b.context, false);
          se(a, b.containerInfo);
        }
        function fg(a, b, c, d, e) {
          Ad();
          Bd(e);
          b.flags |= 256;
          P(a, b, c, d);
          return b.child;
        }
        var gg = { dehydrated: null, treeContext: null, retryLane: 0 };
        function hg(a) {
          return { baseLanes: a, cachePool: null, transitions: null };
        }
        function ig(a, b, c) {
          var d = b.pendingProps, e = I.current, f = false, g = 0 !== (b.flags & 128), h;
          (h = g) || (h = null !== a && null === a.memoizedState ? false : 0 !== (e & 2));
          if (h) f = true, b.flags &= -129;
          else if (null === a || null !== a.memoizedState) e |= 1;
          v(I, e & 1);
          if (null === a) {
            wd(b);
            a = b.memoizedState;
            if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : Kb(a) ? b.lanes = 8 : b.lanes = 1073741824, null;
            g = d.children;
            a = d.fallback;
            return f ? (d = b.mode, f = b.child, g = { mode: "hidden", children: g }, 0 === (d & 1) && null !== f ? (f.childLanes = 0, f.pendingProps = g) : f = jg(g, d, 0, null), a = Nd(a, d, c, null), f.return = b, a.return = b, f.sibling = a, b.child = f, b.child.memoizedState = hg(c), b.memoizedState = gg, a) : kg(b, g);
          }
          e = a.memoizedState;
          if (null !== e && (h = e.dehydrated, null !== h)) return lg(a, b, g, d, h, e, c);
          if (f) {
            f = d.fallback;
            g = b.mode;
            e = a.child;
            h = e.sibling;
            var k = { mode: "hidden", children: d.children };
            0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k, b.deletions = null) : (d = Jd(e, k), d.subtreeFlags = e.subtreeFlags & 14680064);
            null !== h ? f = Jd(h, f) : (f = Nd(f, g, c, null), f.flags |= 2);
            f.return = b;
            d.return = b;
            d.sibling = f;
            b.child = d;
            d = f;
            f = b.child;
            g = a.child.memoizedState;
            g = null === g ? hg(c) : { baseLanes: g.baseLanes | c, cachePool: null, transitions: g.transitions };
            f.memoizedState = g;
            f.childLanes = a.childLanes & ~c;
            b.memoizedState = gg;
            return d;
          }
          f = a.child;
          a = f.sibling;
          d = Jd(f, { mode: "visible", children: d.children });
          0 === (b.mode & 1) && (d.lanes = c);
          d.return = b;
          d.sibling = null;
          null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
          b.child = d;
          b.memoizedState = null;
          return d;
        }
        function kg(a, b) {
          b = jg({ mode: "visible", children: b }, a.mode, 0, null);
          b.return = a;
          return a.child = b;
        }
        function mg(a, b, c, d) {
          null !== d && Bd(d);
          Od(b, a.child, null, c);
          a = kg(b, b.pendingProps.children);
          a.flags |= 2;
          b.memoizedState = null;
          return a;
        }
        function lg(a, b, c, d, e, f, g) {
          if (c) {
            if (b.flags & 256) return b.flags &= -257, d = Ff(Error(n(422))), mg(a, b, g, d);
            if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
            f = d.fallback;
            e = b.mode;
            d = jg({ mode: "visible", children: d.children }, e, 0, null);
            f = Nd(f, e, g, null);
            f.flags |= 2;
            d.return = b;
            f.return = b;
            d.sibling = f;
            b.child = d;
            0 !== (b.mode & 1) && Od(b, a.child, null, g);
            b.child.memoizedState = hg(g);
            b.memoizedState = gg;
            return f;
          }
          if (0 === (b.mode & 1)) return mg(a, b, g, null);
          if (Kb(e)) return d = Lb(e).digest, f = Error(n(419)), d = Ff(
            f,
            d,
            void 0
          ), mg(a, b, g, d);
          c = 0 !== (g & a.childLanes);
          if (G || c) {
            d = N;
            if (null !== d) {
              switch (g & -g) {
                case 4:
                  e = 2;
                  break;
                case 16:
                  e = 8;
                  break;
                case 64:
                case 128:
                case 256:
                case 512:
                case 1024:
                case 2048:
                case 4096:
                case 8192:
                case 16384:
                case 32768:
                case 65536:
                case 131072:
                case 262144:
                case 524288:
                case 1048576:
                case 2097152:
                case 4194304:
                case 8388608:
                case 16777216:
                case 33554432:
                case 67108864:
                  e = 32;
                  break;
                case 536870912:
                  e = 268435456;
                  break;
                default:
                  e = 0;
              }
              e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
              0 !== e && e !== f.retryLane && (f.retryLane = e, ce(a, e), af(
                d,
                a,
                e,
                -1
              ));
            }
            ng();
            d = Ff(Error(n(421)));
            return mg(a, b, g, d);
          }
          if (Jb(e)) return b.flags |= 128, b.child = a.child, b = og.bind(null, a), Mb(e, b), null;
          a = f.treeContext;
          Va && (pd = Qb(e), od = b, F = true, rd = null, qd = false, null !== a && (fd[gd++] = id, fd[gd++] = jd, fd[gd++] = hd, id = a.id, jd = a.overflow, hd = b));
          b = kg(b, d.children);
          b.flags |= 4096;
          return b;
        }
        function pg(a, b, c) {
          a.lanes |= b;
          var d = a.alternate;
          null !== d && (d.lanes |= b);
          Xd(a.return, b, c);
        }
        function qg(a, b, c, d, e) {
          var f = a.memoizedState;
          null === f ? a.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d, tail: c, tailMode: e } : (f.isBackwards = b, f.rendering = null, f.renderingStartTime = 0, f.last = d, f.tail = c, f.tailMode = e);
        }
        function rg(a, b, c) {
          var d = b.pendingProps, e = d.revealOrder, f = d.tail;
          P(a, b, d.children, c);
          d = I.current;
          if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
          else {
            if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a; ) {
              if (13 === a.tag) null !== a.memoizedState && pg(a, c, b);
              else if (19 === a.tag) pg(a, c, b);
              else if (null !== a.child) {
                a.child.return = a;
                a = a.child;
                continue;
              }
              if (a === b) break a;
              for (; null === a.sibling; ) {
                if (null === a.return || a.return === b) break a;
                a = a.return;
              }
              a.sibling.return = a.return;
              a = a.sibling;
            }
            d &= 1;
          }
          v(I, d);
          if (0 === (b.mode & 1)) b.memoizedState = null;
          else switch (e) {
            case "forwards":
              c = b.child;
              for (e = null; null !== c; ) a = c.alternate, null !== a && null === we(a) && (e = c), c = c.sibling;
              c = e;
              null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
              qg(b, false, e, c, f);
              break;
            case "backwards":
              c = null;
              e = b.child;
              for (b.child = null; null !== e; ) {
                a = e.alternate;
                if (null !== a && null === we(a)) {
                  b.child = e;
                  break;
                }
                a = e.sibling;
                e.sibling = c;
                c = e;
                e = a;
              }
              qg(b, true, c, null, f);
              break;
            case "together":
              qg(b, false, null, null, void 0);
              break;
            default:
              b.memoizedState = null;
          }
          return b.child;
        }
        function cg(a, b) {
          0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
        }
        function Tf(a, b, c) {
          null !== a && (b.dependencies = a.dependencies);
          le |= b.lanes;
          if (0 === (c & b.childLanes)) return null;
          if (null !== a && b.child !== a.child) throw Error(n(153));
          if (null !== b.child) {
            a = b.child;
            c = Jd(a, a.pendingProps);
            b.child = c;
            for (c.return = b; null !== a.sibling; ) a = a.sibling, c = c.sibling = Jd(a, a.pendingProps), c.return = b;
            c.sibling = null;
          }
          return b.child;
        }
        function sg(a, b, c) {
          switch (b.tag) {
            case 3:
              eg(b);
              Ad();
              break;
            case 5:
              ue(b);
              break;
            case 1:
              A(b.type) && qc(b);
              break;
            case 4:
              se(b, b.stateNode.containerInfo);
              break;
            case 10:
              Vd(b, b.type._context, b.memoizedProps.value);
              break;
            case 13:
              var d = b.memoizedState;
              if (null !== d) {
                if (null !== d.dehydrated) return v(I, I.current & 1), b.flags |= 128, null;
                if (0 !== (c & b.child.childLanes)) return ig(a, b, c);
                v(I, I.current & 1);
                a = Tf(a, b, c);
                return null !== a ? a.sibling : null;
              }
              v(I, I.current & 1);
              break;
            case 19:
              d = 0 !== (c & b.childLanes);
              if (0 !== (a.flags & 128)) {
                if (d) return rg(
                  a,
                  b,
                  c
                );
                b.flags |= 128;
              }
              var e = b.memoizedState;
              null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
              v(I, I.current);
              if (d) break;
              else return null;
            case 22:
            case 23:
              return b.lanes = 0, Yf(a, b, c);
          }
          return Tf(a, b, c);
        }
        function tg(a) {
          a.flags |= 4;
        }
        function ug(a, b) {
          if (null !== a && a.child === b.child) return true;
          if (0 !== (b.flags & 16)) return false;
          for (a = b.child; null !== a; ) {
            if (0 !== (a.flags & 12854) || 0 !== (a.subtreeFlags & 12854)) return false;
            a = a.sibling;
          }
          return true;
        }
        var vg, wg, xg, yg;
        if (Ta) vg = function(a, b) {
          for (var c = b.child; null !== c; ) {
            if (5 === c.tag || 6 === c.tag) Ka(a, c.stateNode);
            else if (4 !== c.tag && null !== c.child) {
              c.child.return = c;
              c = c.child;
              continue;
            }
            if (c === b) break;
            for (; null === c.sibling; ) {
              if (null === c.return || c.return === b) return;
              c = c.return;
            }
            c.sibling.return = c.return;
            c = c.sibling;
          }
        }, wg = function() {
        }, xg = function(a, b, c, d, e) {
          a = a.memoizedProps;
          if (a !== d) {
            var f = b.stateNode, g = re(oe.current);
            c = Ma(f, c, a, d, e, g);
            (b.updateQueue = c) && tg(b);
          }
        }, yg = function(a, b, c, d) {
          c !== d && tg(b);
        };
        else if (Ua) {
          vg = function(a, b, c, d) {
            for (var e = b.child; null !== e; ) {
              if (5 === e.tag) {
                var f = e.stateNode;
                c && d && (f = Eb(f, e.type, e.memoizedProps, e));
                Ka(a, f);
              } else if (6 === e.tag) f = e.stateNode, c && d && (f = Fb(f, e.memoizedProps, e)), Ka(a, f);
              else if (4 !== e.tag) {
                if (22 === e.tag && null !== e.memoizedState) f = e.child, null !== f && (f.return = e), vg(a, e, true, true);
                else if (null !== e.child) {
                  e.child.return = e;
                  e = e.child;
                  continue;
                }
              }
              if (e === b) break;
              for (; null === e.sibling; ) {
                if (null === e.return || e.return === b) return;
                e = e.return;
              }
              e.sibling.return = e.return;
              e = e.sibling;
            }
          };
          var zg = function(a, b, c, d) {
            for (var e = b.child; null !== e; ) {
              if (5 === e.tag) {
                var f = e.stateNode;
                c && d && (f = Eb(f, e.type, e.memoizedProps, e));
                Ab(a, f);
              } else if (6 === e.tag) f = e.stateNode, c && d && (f = Fb(f, e.memoizedProps, e)), Ab(a, f);
              else if (4 !== e.tag) {
                if (22 === e.tag && null !== e.memoizedState) f = e.child, null !== f && (f.return = e), zg(a, e, true, true);
                else if (null !== e.child) {
                  e.child.return = e;
                  e = e.child;
                  continue;
                }
              }
              if (e === b) break;
              for (; null === e.sibling; ) {
                if (null === e.return || e.return === b) return;
                e = e.return;
              }
              e.sibling.return = e.return;
              e = e.sibling;
            }
          };
          wg = function(a, b) {
            var c = b.stateNode;
            if (!ug(a, b)) {
              a = c.containerInfo;
              var d = zb(a);
              zg(d, b, false, false);
              c.pendingChildren = d;
              tg(b);
              Bb(a, d);
            }
          };
          xg = function(a, b, c, d, e) {
            var f = a.stateNode, g = a.memoizedProps;
            if ((a = ug(a, b)) && g === d) b.stateNode = f;
            else {
              var h = b.stateNode, k = re(oe.current), l = null;
              g !== d && (l = Ma(h, c, g, d, e, k));
              a && null === l ? b.stateNode = f : (f = yb(f, l, c, g, d, b, a, h), La(f, c, d, e, k) && tg(b), b.stateNode = f, a ? tg(b) : vg(f, b, false, false));
            }
          };
          yg = function(a, b, c, d) {
            c !== d ? (a = re(qe.current), c = re(oe.current), b.stateNode = Oa(d, a, c, b), tg(b)) : b.stateNode = a.stateNode;
          };
        } else wg = function() {
        }, xg = function() {
        }, yg = function() {
        };
        function Ag(a, b) {
          if (!F) switch (a.tailMode) {
            case "hidden":
              b = a.tail;
              for (var c = null; null !== b; ) null !== b.alternate && (c = b), b = b.sibling;
              null === c ? a.tail = null : c.sibling = null;
              break;
            case "collapsed":
              c = a.tail;
              for (var d = null; null !== c; ) null !== c.alternate && (d = c), c = c.sibling;
              null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
          }
        }
        function Q(a) {
          var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
          if (b) for (var e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
          else for (e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
          a.subtreeFlags |= d;
          a.childLanes = c;
          return b;
        }
        function Bg(a, b, c) {
          var d = b.pendingProps;
          nd(b);
          switch (b.tag) {
            case 2:
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
              return Q(b), null;
            case 1:
              return A(b.type) && nc(), Q(b), null;
            case 3:
              c = b.stateNode;
              te();
              q(z);
              q(x);
              ye();
              c.pendingContext && (c.context = c.pendingContext, c.pendingContext = null);
              if (null === a || null === a.child) yd(b) ? tg(b) : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== rd && (Cg(rd), rd = null));
              wg(a, b);
              Q(b);
              return null;
            case 5:
              ve(b);
              c = re(qe.current);
              var e = b.type;
              if (null !== a && null != b.stateNode) xg(a, b, e, d, c), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
              else {
                if (!d) {
                  if (null === b.stateNode) throw Error(n(166));
                  Q(b);
                  return null;
                }
                a = re(oe.current);
                if (yd(b)) {
                  if (!Va) throw Error(n(175));
                  a = Rb(b.stateNode, b.type, b.memoizedProps, c, a, b, !qd);
                  b.updateQueue = a;
                  null !== a && tg(b);
                } else {
                  var f = Ja(e, d, c, a, b);
                  vg(f, b, false, false);
                  b.stateNode = f;
                  La(f, e, d, c, a) && tg(b);
                }
                null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
              }
              Q(b);
              return null;
            case 6:
              if (a && null != b.stateNode) yg(a, b, a.memoizedProps, d);
              else {
                if ("string" !== typeof d && null === b.stateNode) throw Error(n(166));
                a = re(qe.current);
                c = re(oe.current);
                if (yd(b)) {
                  if (!Va) throw Error(n(176));
                  a = b.stateNode;
                  c = b.memoizedProps;
                  if (d = Sb(a, c, b, !qd)) {
                    if (e = od, null !== e) switch (e.tag) {
                      case 3:
                        $b(e.stateNode.containerInfo, a, c, 0 !== (e.mode & 1));
                        break;
                      case 5:
                        ac(e.type, e.memoizedProps, e.stateNode, a, c, 0 !== (e.mode & 1));
                    }
                  }
                  d && tg(b);
                } else b.stateNode = Oa(d, a, c, b);
              }
              Q(b);
              return null;
            case 13:
              q(I);
              d = b.memoizedState;
              if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
                if (F && null !== pd && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) zd(), Ad(), b.flags |= 98560, e = false;
                else if (e = yd(b), null !== d && null !== d.dehydrated) {
                  if (null === a) {
                    if (!e) throw Error(n(318));
                    if (!Va) throw Error(n(344));
                    e = b.memoizedState;
                    e = null !== e ? e.dehydrated : null;
                    if (!e) throw Error(n(317));
                    Tb(e, b);
                  } else Ad(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
                  Q(b);
                  e = false;
                } else null !== rd && (Cg(rd), rd = null), e = true;
                if (!e) return b.flags & 65536 ? b : null;
              }
              if (0 !== (b.flags & 128)) return b.lanes = c, b;
              c = null !== d;
              c !== (null !== a && null !== a.memoizedState) && c && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (I.current & 1) ? 0 === R && (R = 3) : ng()));
              null !== b.updateQueue && (b.flags |= 4);
              Q(b);
              return null;
            case 4:
              return te(), wg(a, b), null === a && Xa(b.stateNode.containerInfo), Q(b), null;
            case 10:
              return Wd(b.type._context), Q(b), null;
            case 17:
              return A(b.type) && nc(), Q(b), null;
            case 19:
              q(I);
              e = b.memoizedState;
              if (null === e) return Q(b), null;
              d = 0 !== (b.flags & 128);
              f = e.rendering;
              if (null === f) if (d) Ag(e, false);
              else {
                if (0 !== R || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a; ) {
                  f = we(a);
                  if (null !== f) {
                    b.flags |= 128;
                    Ag(e, false);
                    a = f.updateQueue;
                    null !== a && (b.updateQueue = a, b.flags |= 4);
                    b.subtreeFlags = 0;
                    a = c;
                    for (c = b.child; null !== c; ) d = c, e = a, d.flags &= 14680066, f = d.alternate, null === f ? (d.childLanes = 0, d.lanes = e, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = f.childLanes, d.lanes = f.lanes, d.child = f.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = f.memoizedProps, d.memoizedState = f.memoizedState, d.updateQueue = f.updateQueue, d.type = f.type, e = f.dependencies, d.dependencies = null === e ? null : { lanes: e.lanes, firstContext: e.firstContext }), c = c.sibling;
                    v(I, I.current & 1 | 2);
                    return b.child;
                  }
                  a = a.sibling;
                }
                null !== e.tail && D() > Dg && (b.flags |= 128, d = true, Ag(e, false), b.lanes = 4194304);
              }
              else {
                if (!d) if (a = we(f), null !== a) {
                  if (b.flags |= 128, d = true, a = a.updateQueue, null !== a && (b.updateQueue = a, b.flags |= 4), Ag(e, true), null === e.tail && "hidden" === e.tailMode && !f.alternate && !F) return Q(b), null;
                } else 2 * D() - e.renderingStartTime > Dg && 1073741824 !== c && (b.flags |= 128, d = true, Ag(e, false), b.lanes = 4194304);
                e.isBackwards ? (f.sibling = b.child, b.child = f) : (a = e.last, null !== a ? a.sibling = f : b.child = f, e.last = f);
              }
              if (null !== e.tail) return b = e.tail, e.rendering = b, e.tail = b.sibling, e.renderingStartTime = D(), b.sibling = null, a = I.current, v(I, d ? a & 1 | 2 : a & 1), b;
              Q(b);
              return null;
            case 22:
            case 23:
              return Eg(), c = null !== b.memoizedState, null !== a && null !== a.memoizedState !== c && (b.flags |= 8192), c && 0 !== (b.mode & 1) ? 0 !== ($f & 1073741824) && (Q(b), Ta && b.subtreeFlags & 6 && (b.flags |= 8192)) : Q(b), null;
            case 24:
              return null;
            case 25:
              return null;
          }
          throw Error(n(
            156,
            b.tag
          ));
        }
        function Fg(a, b) {
          nd(b);
          switch (b.tag) {
            case 1:
              return A(b.type) && nc(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
            case 3:
              return te(), q(z), q(x), ye(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
            case 5:
              return ve(b), null;
            case 13:
              q(I);
              a = b.memoizedState;
              if (null !== a && null !== a.dehydrated) {
                if (null === b.alternate) throw Error(n(340));
                Ad();
              }
              a = b.flags;
              return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
            case 19:
              return q(I), null;
            case 4:
              return te(), null;
            case 10:
              return Wd(b.type._context), null;
            case 22:
            case 23:
              return Eg(), null;
            case 24:
              return null;
            default:
              return null;
          }
        }
        var Gg = false, S = false, Hg = "function" === typeof WeakSet ? WeakSet : Set, T = null;
        function Ig(a, b) {
          var c = a.ref;
          if (null !== c) if ("function" === typeof c) try {
            c(null);
          } catch (d) {
            U(a, b, d);
          }
          else c.current = null;
        }
        function Jg(a, b, c) {
          try {
            c();
          } catch (d) {
            U(a, b, d);
          }
        }
        var Kg = false;
        function Lg(a, b) {
          Ha(a.containerInfo);
          for (T = b; null !== T; ) if (a = T, b = a.child, 0 !== (a.subtreeFlags & 1028) && null !== b) b.return = a, T = b;
          else for (; null !== T; ) {
            a = T;
            try {
              var c = a.alternate;
              if (0 !== (a.flags & 1024)) switch (a.tag) {
                case 0:
                case 11:
                case 15:
                  break;
                case 1:
                  if (null !== c) {
                    var d = c.memoizedProps, e = c.memoizedState, f = a.stateNode, g = f.getSnapshotBeforeUpdate(a.elementType === a.type ? d : xf(a.type, d), e);
                    f.__reactInternalSnapshotBeforeUpdate = g;
                  }
                  break;
                case 3:
                  Ta && xb(a.stateNode.containerInfo);
                  break;
                case 5:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  throw Error(n(163));
              }
            } catch (h) {
              U(a, a.return, h);
            }
            b = a.sibling;
            if (null !== b) {
              b.return = a.return;
              T = b;
              break;
            }
            T = a.return;
          }
          c = Kg;
          Kg = false;
          return c;
        }
        function Mg(a, b, c) {
          var d = b.updateQueue;
          d = null !== d ? d.lastEffect : null;
          if (null !== d) {
            var e = d = d.next;
            do {
              if ((e.tag & a) === a) {
                var f = e.destroy;
                e.destroy = void 0;
                void 0 !== f && Jg(b, c, f);
              }
              e = e.next;
            } while (e !== d);
          }
        }
        function Ng(a, b) {
          b = b.updateQueue;
          b = null !== b ? b.lastEffect : null;
          if (null !== b) {
            var c = b = b.next;
            do {
              if ((c.tag & a) === a) {
                var d = c.create;
                c.destroy = d();
              }
              c = c.next;
            } while (c !== b);
          }
        }
        function Og(a) {
          var b = a.ref;
          if (null !== b) {
            var c = a.stateNode;
            switch (a.tag) {
              case 5:
                a = Ea(c);
                break;
              default:
                a = c;
            }
            "function" === typeof b ? b(a) : b.current = a;
          }
        }
        function Pg(a) {
          var b = a.alternate;
          null !== b && (a.alternate = null, Pg(b));
          a.child = null;
          a.deletions = null;
          a.sibling = null;
          5 === a.tag && (b = a.stateNode, null !== b && Za(b));
          a.stateNode = null;
          a.return = null;
          a.dependencies = null;
          a.memoizedProps = null;
          a.memoizedState = null;
          a.pendingProps = null;
          a.stateNode = null;
          a.updateQueue = null;
        }
        function Qg(a) {
          return 5 === a.tag || 3 === a.tag || 4 === a.tag;
        }
        function Rg(a) {
          a: for (; ; ) {
            for (; null === a.sibling; ) {
              if (null === a.return || Qg(a.return)) return null;
              a = a.return;
            }
            a.sibling.return = a.return;
            for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag; ) {
              if (a.flags & 2) continue a;
              if (null === a.child || 4 === a.tag) continue a;
              else a.child.return = a, a = a.child;
            }
            if (!(a.flags & 2)) return a.stateNode;
          }
        }
        function Sg(a, b, c) {
          var d = a.tag;
          if (5 === d || 6 === d) a = a.stateNode, b ? pb(c, a, b) : kb(c, a);
          else if (4 !== d && (a = a.child, null !== a)) for (Sg(a, b, c), a = a.sibling; null !== a; ) Sg(a, b, c), a = a.sibling;
        }
        function Tg(a, b, c) {
          var d = a.tag;
          if (5 === d || 6 === d) a = a.stateNode, b ? ob(c, a, b) : jb(c, a);
          else if (4 !== d && (a = a.child, null !== a)) for (Tg(a, b, c), a = a.sibling; null !== a; ) Tg(a, b, c), a = a.sibling;
        }
        var V = null, Ug = false;
        function Vg(a, b, c) {
          for (c = c.child; null !== c; ) Wg(a, b, c), c = c.sibling;
        }
        function Wg(a, b, c) {
          if (Sc && "function" === typeof Sc.onCommitFiberUnmount) try {
            Sc.onCommitFiberUnmount(Rc, c);
          } catch (h) {
          }
          switch (c.tag) {
            case 5:
              S || Ig(c, b);
            case 6:
              if (Ta) {
                var d = V, e = Ug;
                V = null;
                Vg(a, b, c);
                V = d;
                Ug = e;
                null !== V && (Ug ? rb(V, c.stateNode) : qb(V, c.stateNode));
              } else Vg(a, b, c);
              break;
            case 18:
              Ta && null !== V && (Ug ? Yb(V, c.stateNode) : Xb(V, c.stateNode));
              break;
            case 4:
              Ta ? (d = V, e = Ug, V = c.stateNode.containerInfo, Ug = true, Vg(a, b, c), V = d, Ug = e) : (Ua && (d = c.stateNode.containerInfo, e = zb(d), Cb(d, e)), Vg(a, b, c));
              break;
            case 0:
            case 11:
            case 14:
            case 15:
              if (!S && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
                e = d = d.next;
                do {
                  var f = e, g = f.destroy;
                  f = f.tag;
                  void 0 !== g && (0 !== (f & 2) ? Jg(c, b, g) : 0 !== (f & 4) && Jg(c, b, g));
                  e = e.next;
                } while (e !== d);
              }
              Vg(a, b, c);
              break;
            case 1:
              if (!S && (Ig(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
                d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
              } catch (h) {
                U(c, b, h);
              }
              Vg(a, b, c);
              break;
            case 21:
              Vg(a, b, c);
              break;
            case 22:
              c.mode & 1 ? (S = (d = S) || null !== c.memoizedState, Vg(a, b, c), S = d) : Vg(a, b, c);
              break;
            default:
              Vg(
                a,
                b,
                c
              );
          }
        }
        function Xg(a) {
          var b = a.updateQueue;
          if (null !== b) {
            a.updateQueue = null;
            var c = a.stateNode;
            null === c && (c = a.stateNode = new Hg());
            b.forEach(function(b2) {
              var d = Yg.bind(null, a, b2);
              c.has(b2) || (c.add(b2), b2.then(d, d));
            });
          }
        }
        function Zg(a, b) {
          var c = b.deletions;
          if (null !== c) for (var d = 0; d < c.length; d++) {
            var e = c[d];
            try {
              var f = a, g = b;
              if (Ta) {
                var h = g;
                a: for (; null !== h; ) {
                  switch (h.tag) {
                    case 5:
                      V = h.stateNode;
                      Ug = false;
                      break a;
                    case 3:
                      V = h.stateNode.containerInfo;
                      Ug = true;
                      break a;
                    case 4:
                      V = h.stateNode.containerInfo;
                      Ug = true;
                      break a;
                  }
                  h = h.return;
                }
                if (null === V) throw Error(n(160));
                Wg(f, g, e);
                V = null;
                Ug = false;
              } else Wg(f, g, e);
              var k = e.alternate;
              null !== k && (k.return = null);
              e.return = null;
            } catch (l) {
              U(e, b, l);
            }
          }
          if (b.subtreeFlags & 12854) for (b = b.child; null !== b; ) $g(b, a), b = b.sibling;
        }
        function $g(a, b) {
          var c = a.alternate, d = a.flags;
          switch (a.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
              Zg(b, a);
              ah(a);
              if (d & 4) {
                try {
                  Mg(3, a, a.return), Ng(3, a);
                } catch (p) {
                  U(a, a.return, p);
                }
                try {
                  Mg(5, a, a.return);
                } catch (p) {
                  U(a, a.return, p);
                }
              }
              break;
            case 1:
              Zg(b, a);
              ah(a);
              d & 512 && null !== c && Ig(c, c.return);
              break;
            case 5:
              Zg(b, a);
              ah(a);
              d & 512 && null !== c && Ig(c, c.return);
              if (Ta) {
                if (a.flags & 32) {
                  var e = a.stateNode;
                  try {
                    sb(e);
                  } catch (p) {
                    U(a, a.return, p);
                  }
                }
                if (d & 4 && (e = a.stateNode, null != e)) {
                  var f = a.memoizedProps;
                  c = null !== c ? c.memoizedProps : f;
                  d = a.type;
                  b = a.updateQueue;
                  a.updateQueue = null;
                  if (null !== b) try {
                    nb(e, b, d, c, f, a);
                  } catch (p) {
                    U(a, a.return, p);
                  }
                }
              }
              break;
            case 6:
              Zg(b, a);
              ah(a);
              if (d & 4 && Ta) {
                if (null === a.stateNode) throw Error(n(162));
                e = a.stateNode;
                f = a.memoizedProps;
                c = null !== c ? c.memoizedProps : f;
                try {
                  lb(e, c, f);
                } catch (p) {
                  U(a, a.return, p);
                }
              }
              break;
            case 3:
              Zg(b, a);
              ah(a);
              if (d & 4) {
                if (Ta && Va && null !== c && c.memoizedState.isDehydrated) try {
                  Vb(b.containerInfo);
                } catch (p) {
                  U(a, a.return, p);
                }
                if (Ua) {
                  e = b.containerInfo;
                  f = b.pendingChildren;
                  try {
                    Cb(e, f);
                  } catch (p) {
                    U(a, a.return, p);
                  }
                }
              }
              break;
            case 4:
              Zg(
                b,
                a
              );
              ah(a);
              if (d & 4 && Ua) {
                f = a.stateNode;
                e = f.containerInfo;
                f = f.pendingChildren;
                try {
                  Cb(e, f);
                } catch (p) {
                  U(a, a.return, p);
                }
              }
              break;
            case 13:
              Zg(b, a);
              ah(a);
              e = a.child;
              e.flags & 8192 && (f = null !== e.memoizedState, e.stateNode.isHidden = f, !f || null !== e.alternate && null !== e.alternate.memoizedState || (bh = D()));
              d & 4 && Xg(a);
              break;
            case 22:
              var g = null !== c && null !== c.memoizedState;
              a.mode & 1 ? (S = (c = S) || g, Zg(b, a), S = c) : Zg(b, a);
              ah(a);
              if (d & 8192) {
                c = null !== a.memoizedState;
                if ((a.stateNode.isHidden = c) && !g && 0 !== (a.mode & 1)) for (T = a, d = a.child; null !== d; ) {
                  for (b = T = d; null !== T; ) {
                    g = T;
                    var h = g.child;
                    switch (g.tag) {
                      case 0:
                      case 11:
                      case 14:
                      case 15:
                        Mg(4, g, g.return);
                        break;
                      case 1:
                        Ig(g, g.return);
                        var k = g.stateNode;
                        if ("function" === typeof k.componentWillUnmount) {
                          var l = g, m = g.return;
                          try {
                            var r = l;
                            k.props = r.memoizedProps;
                            k.state = r.memoizedState;
                            k.componentWillUnmount();
                          } catch (p) {
                            U(l, m, p);
                          }
                        }
                        break;
                      case 5:
                        Ig(g, g.return);
                        break;
                      case 22:
                        if (null !== g.memoizedState) {
                          ch(b);
                          continue;
                        }
                    }
                    null !== h ? (h.return = g, T = h) : ch(b);
                  }
                  d = d.sibling;
                }
                if (Ta) {
                  a: if (d = null, Ta) for (b = a; ; ) {
                    if (5 === b.tag) {
                      if (null === d) {
                        d = b;
                        try {
                          e = b.stateNode, c ? tb(e) : vb(b.stateNode, b.memoizedProps);
                        } catch (p) {
                          U(a, a.return, p);
                        }
                      }
                    } else if (6 === b.tag) {
                      if (null === d) try {
                        f = b.stateNode, c ? ub(f) : wb(f, b.memoizedProps);
                      } catch (p) {
                        U(a, a.return, p);
                      }
                    } else if ((22 !== b.tag && 23 !== b.tag || null === b.memoizedState || b === a) && null !== b.child) {
                      b.child.return = b;
                      b = b.child;
                      continue;
                    }
                    if (b === a) break a;
                    for (; null === b.sibling; ) {
                      if (null === b.return || b.return === a) break a;
                      d === b && (d = null);
                      b = b.return;
                    }
                    d === b && (d = null);
                    b.sibling.return = b.return;
                    b = b.sibling;
                  }
                }
              }
              break;
            case 19:
              Zg(b, a);
              ah(a);
              d & 4 && Xg(a);
              break;
            case 21:
              break;
            default:
              Zg(b, a), ah(a);
          }
        }
        function ah(a) {
          var b = a.flags;
          if (b & 2) {
            try {
              if (Ta) {
                b: {
                  for (var c = a.return; null !== c; ) {
                    if (Qg(c)) {
                      var d = c;
                      break b;
                    }
                    c = c.return;
                  }
                  throw Error(n(160));
                }
                switch (d.tag) {
                  case 5:
                    var e = d.stateNode;
                    d.flags & 32 && (sb(e), d.flags &= -33);
                    var f = Rg(a);
                    Tg(a, f, e);
                    break;
                  case 3:
                  case 4:
                    var g = d.stateNode.containerInfo, h = Rg(a);
                    Sg(a, h, g);
                    break;
                  default:
                    throw Error(n(161));
                }
              }
            } catch (k) {
              U(a, a.return, k);
            }
            a.flags &= -3;
          }
          b & 4096 && (a.flags &= -4097);
        }
        function dh(a, b, c) {
          T = a;
          eh(a, b, c);
        }
        function eh(a, b, c) {
          for (var d = 0 !== (a.mode & 1); null !== T; ) {
            var e = T, f = e.child;
            if (22 === e.tag && d) {
              var g = null !== e.memoizedState || Gg;
              if (!g) {
                var h = e.alternate, k = null !== h && null !== h.memoizedState || S;
                h = Gg;
                var l = S;
                Gg = g;
                if ((S = k) && !l) for (T = e; null !== T; ) g = T, k = g.child, 22 === g.tag && null !== g.memoizedState ? fh(e) : null !== k ? (k.return = g, T = k) : fh(e);
                for (; null !== f; ) T = f, eh(f, b, c), f = f.sibling;
                T = e;
                Gg = h;
                S = l;
              }
              gh(a, b, c);
            } else 0 !== (e.subtreeFlags & 8772) && null !== f ? (f.return = e, T = f) : gh(a, b, c);
          }
        }
        function gh(a) {
          for (; null !== T; ) {
            var b = T;
            if (0 !== (b.flags & 8772)) {
              var c = b.alternate;
              try {
                if (0 !== (b.flags & 8772)) switch (b.tag) {
                  case 0:
                  case 11:
                  case 15:
                    S || Ng(5, b);
                    break;
                  case 1:
                    var d = b.stateNode;
                    if (b.flags & 4 && !S) if (null === c) d.componentDidMount();
                    else {
                      var e = b.elementType === b.type ? c.memoizedProps : xf(b.type, c.memoizedProps);
                      d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
                    }
                    var f = b.updateQueue;
                    null !== f && me(b, f, d);
                    break;
                  case 3:
                    var g = b.updateQueue;
                    if (null !== g) {
                      c = null;
                      if (null !== b.child) switch (b.child.tag) {
                        case 5:
                          c = Ea(b.child.stateNode);
                          break;
                        case 1:
                          c = b.child.stateNode;
                      }
                      me(b, g, c);
                    }
                    break;
                  case 5:
                    var h = b.stateNode;
                    null === c && b.flags & 4 && mb(h, b.type, b.memoizedProps, b);
                    break;
                  case 6:
                    break;
                  case 4:
                    break;
                  case 12:
                    break;
                  case 13:
                    if (Va && null === b.memoizedState) {
                      var k = b.alternate;
                      if (null !== k) {
                        var l = k.memoizedState;
                        if (null !== l) {
                          var m = l.dehydrated;
                          null !== m && Wb(m);
                        }
                      }
                    }
                    break;
                  case 19:
                  case 17:
                  case 21:
                  case 22:
                  case 23:
                  case 25:
                    break;
                  default:
                    throw Error(n(163));
                }
                S || b.flags & 512 && Og(b);
              } catch (r) {
                U(b, b.return, r);
              }
            }
            if (b === a) {
              T = null;
              break;
            }
            c = b.sibling;
            if (null !== c) {
              c.return = b.return;
              T = c;
              break;
            }
            T = b.return;
          }
        }
        function ch(a) {
          for (; null !== T; ) {
            var b = T;
            if (b === a) {
              T = null;
              break;
            }
            var c = b.sibling;
            if (null !== c) {
              c.return = b.return;
              T = c;
              break;
            }
            T = b.return;
          }
        }
        function fh(a) {
          for (; null !== T; ) {
            var b = T;
            try {
              switch (b.tag) {
                case 0:
                case 11:
                case 15:
                  var c = b.return;
                  try {
                    Ng(4, b);
                  } catch (k) {
                    U(b, c, k);
                  }
                  break;
                case 1:
                  var d = b.stateNode;
                  if ("function" === typeof d.componentDidMount) {
                    var e = b.return;
                    try {
                      d.componentDidMount();
                    } catch (k) {
                      U(b, e, k);
                    }
                  }
                  var f = b.return;
                  try {
                    Og(b);
                  } catch (k) {
                    U(b, f, k);
                  }
                  break;
                case 5:
                  var g = b.return;
                  try {
                    Og(b);
                  } catch (k) {
                    U(b, g, k);
                  }
              }
            } catch (k) {
              U(b, b.return, k);
            }
            if (b === a) {
              T = null;
              break;
            }
            var h = b.sibling;
            if (null !== h) {
              h.return = b.return;
              T = h;
              break;
            }
            T = b.return;
          }
        }
        var hh = 0, ih = 1, jh = 2, kh = 3, lh = 4;
        if ("function" === typeof Symbol && Symbol.for) {
          var mh = Symbol.for;
          hh = mh("selector.component");
          ih = mh("selector.has_pseudo_class");
          jh = mh("selector.role");
          kh = mh("selector.test_id");
          lh = mh("selector.text");
        }
        function nh(a) {
          var b = Wa(a);
          if (null != b) {
            if ("string" !== typeof b.memoizedProps["data-testname"]) throw Error(n(364));
            return b;
          }
          a = cb(a);
          if (null === a) throw Error(n(362));
          return a.stateNode.current;
        }
        function oh(a, b) {
          switch (b.$$typeof) {
            case hh:
              if (a.type === b.value) return true;
              break;
            case ih:
              a: {
                b = b.value;
                a = [a, 0];
                for (var c = 0; c < a.length; ) {
                  var d = a[c++], e = a[c++], f = b[e];
                  if (5 !== d.tag || !fb(d)) {
                    for (; null != f && oh(d, f); ) e++, f = b[e];
                    if (e === b.length) {
                      b = true;
                      break a;
                    } else for (d = d.child; null !== d; ) a.push(d, e), d = d.sibling;
                  }
                }
                b = false;
              }
              return b;
            case jh:
              if (5 === a.tag && gb(a.stateNode, b.value)) return true;
              break;
            case lh:
              if (5 === a.tag || 6 === a.tag) {
                if (a = eb(a), null !== a && 0 <= a.indexOf(b.value)) return true;
              }
              break;
            case kh:
              if (5 === a.tag && (a = a.memoizedProps["data-testname"], "string" === typeof a && a.toLowerCase() === b.value.toLowerCase())) return true;
              break;
            default:
              throw Error(n(365));
          }
          return false;
        }
        function ph(a) {
          switch (a.$$typeof) {
            case hh:
              return "<" + (ua(a.value) || "Unknown") + ">";
            case ih:
              return ":has(" + (ph(a) || "") + ")";
            case jh:
              return '[role="' + a.value + '"]';
            case lh:
              return '"' + a.value + '"';
            case kh:
              return '[data-testname="' + a.value + '"]';
            default:
              throw Error(n(365));
          }
        }
        function qh(a, b) {
          var c = [];
          a = [a, 0];
          for (var d = 0; d < a.length; ) {
            var e = a[d++], f = a[d++], g = b[f];
            if (5 !== e.tag || !fb(e)) {
              for (; null != g && oh(e, g); ) f++, g = b[f];
              if (f === b.length) c.push(e);
              else for (e = e.child; null !== e; ) a.push(e, f), e = e.sibling;
            }
          }
          return c;
        }
        function rh(a, b) {
          if (!bb) throw Error(n(363));
          a = nh(a);
          a = qh(a, b);
          b = [];
          a = Array.from(a);
          for (var c = 0; c < a.length; ) {
            var d = a[c++];
            if (5 === d.tag) fb(d) || b.push(d.stateNode);
            else for (d = d.child; null !== d; ) a.push(d), d = d.sibling;
          }
          return b;
        }
        var sh = Math.ceil, th = da.ReactCurrentDispatcher, uh = da.ReactCurrentOwner, W = da.ReactCurrentBatchConfig, H = 0, N = null, X = null, Z = 0, $f = 0, Zf = ic(0), R = 0, vh = null, le = 0, wh = 0, xh = 0, yh = null, zh = null, bh = 0, Dg = Infinity, Ah = null;
        function Bh() {
          Dg = D() + 500;
        }
        var Jf = false, Kf = null, Mf = null, Ch = false, Dh = null, Eh = 0, Fh = 0, Gh = null, Hh = -1, Ih = 0;
        function O() {
          return 0 !== (H & 6) ? D() : -1 !== Hh ? Hh : Hh = D();
        }
        function tf(a) {
          if (0 === (a.mode & 1)) return 1;
          if (0 !== (H & 2) && 0 !== Z) return Z & -Z;
          if (null !== Cd.transition) return 0 === Ih && (Ih = Dc()), Ih;
          a = C;
          return 0 !== a ? a : Ya();
        }
        function af(a, b, c, d) {
          if (50 < Fh) throw Fh = 0, Gh = null, Error(n(185));
          Fc(a, c, d);
          if (0 === (H & 2) || a !== N) a === N && (0 === (H & 2) && (wh |= c), 4 === R && Jh(a, Z)), Kh(a, d), 1 === c && 0 === H && 0 === (b.mode & 1) && (Bh(), Xc && ad());
        }
        function Kh(a, b) {
          var c = a.callbackNode;
          Bc(a, b);
          var d = zc(a, a === N ? Z : 0);
          if (0 === d) null !== c && Kc(c), a.callbackNode = null, a.callbackPriority = 0;
          else if (b = d & -d, a.callbackPriority !== b) {
            null != c && Kc(c);
            if (1 === b) 0 === a.tag ? $c(Lh.bind(null, a)) : Zc(Lh.bind(null, a)), $a ? ab(function() {
              0 === (H & 6) && ad();
            }) : Jc(Nc, ad), c = null;
            else {
              switch (Ic(d)) {
                case 1:
                  c = Nc;
                  break;
                case 4:
                  c = Oc;
                  break;
                case 16:
                  c = Pc;
                  break;
                case 536870912:
                  c = Qc;
                  break;
                default:
                  c = Pc;
              }
              c = Mh(c, Nh.bind(null, a));
            }
            a.callbackPriority = b;
            a.callbackNode = c;
          }
        }
        function Nh(a, b) {
          Hh = -1;
          Ih = 0;
          if (0 !== (H & 6)) throw Error(n(327));
          var c = a.callbackNode;
          if (Oh() && a.callbackNode !== c) return null;
          var d = zc(a, a === N ? Z : 0);
          if (0 === d) return null;
          if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Ph(a, d);
          else {
            b = d;
            var e = H;
            H |= 2;
            var f = Qh();
            if (N !== a || Z !== b) Ah = null, Bh(), Rh(a, b);
            do
              try {
                Sh();
                break;
              } catch (h) {
                Th(a, h);
              }
            while (1);
            Ud();
            th.current = f;
            H = e;
            null !== X ? b = 0 : (N = null, Z = 0, b = R);
          }
          if (0 !== b) {
            2 === b && (e = Cc(a), 0 !== e && (d = e, b = Uh(a, e)));
            if (1 === b) throw c = vh, Rh(a, 0), Jh(a, d), Kh(a, D()), c;
            if (6 === b) Jh(a, d);
            else {
              e = a.current.alternate;
              if (0 === (d & 30) && !Vh(e) && (b = Ph(a, d), 2 === b && (f = Cc(a), 0 !== f && (d = f, b = Uh(a, f))), 1 === b)) throw c = vh, Rh(a, 0), Jh(a, d), Kh(a, D()), c;
              a.finishedWork = e;
              a.finishedLanes = d;
              switch (b) {
                case 0:
                case 1:
                  throw Error(n(345));
                case 2:
                  Wh(a, zh, Ah);
                  break;
                case 3:
                  Jh(a, d);
                  if ((d & 130023424) === d && (b = bh + 500 - D(), 10 < b)) {
                    if (0 !== zc(a, 0)) break;
                    e = a.suspendedLanes;
                    if ((e & d) !== d) {
                      O();
                      a.pingedLanes |= a.suspendedLanes & e;
                      break;
                    }
                    a.timeoutHandle = Pa(Wh.bind(null, a, zh, Ah), b);
                    break;
                  }
                  Wh(a, zh, Ah);
                  break;
                case 4:
                  Jh(a, d);
                  if ((d & 4194240) === d) break;
                  b = a.eventTimes;
                  for (e = -1; 0 < d; ) {
                    var g = 31 - tc(d);
                    f = 1 << g;
                    g = b[g];
                    g > e && (e = g);
                    d &= ~f;
                  }
                  d = e;
                  d = D() - d;
                  d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * sh(d / 1960)) - d;
                  if (10 < d) {
                    a.timeoutHandle = Pa(Wh.bind(null, a, zh, Ah), d);
                    break;
                  }
                  Wh(a, zh, Ah);
                  break;
                case 5:
                  Wh(a, zh, Ah);
                  break;
                default:
                  throw Error(n(329));
              }
            }
          }
          Kh(a, D());
          return a.callbackNode === c ? Nh.bind(null, a) : null;
        }
        function Uh(a, b) {
          var c = yh;
          a.current.memoizedState.isDehydrated && (Rh(a, b).flags |= 256);
          a = Ph(a, b);
          2 !== a && (b = zh, zh = c, null !== b && Cg(b));
          return a;
        }
        function Cg(a) {
          null === zh ? zh = a : zh.push.apply(zh, a);
        }
        function Vh(a) {
          for (var b = a; ; ) {
            if (b.flags & 16384) {
              var c = b.updateQueue;
              if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
                var e = c[d], f = e.getSnapshot;
                e = e.value;
                try {
                  if (!Vc(f(), e)) return false;
                } catch (g) {
                  return false;
                }
              }
            }
            c = b.child;
            if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
            else {
              if (b === a) break;
              for (; null === b.sibling; ) {
                if (null === b.return || b.return === a) return true;
                b = b.return;
              }
              b.sibling.return = b.return;
              b = b.sibling;
            }
          }
          return true;
        }
        function Jh(a, b) {
          b &= ~xh;
          b &= ~wh;
          a.suspendedLanes |= b;
          a.pingedLanes &= ~b;
          for (a = a.expirationTimes; 0 < b; ) {
            var c = 31 - tc(b), d = 1 << c;
            a[c] = -1;
            b &= ~d;
          }
        }
        function Lh(a) {
          if (0 !== (H & 6)) throw Error(n(327));
          Oh();
          var b = zc(a, 0);
          if (0 === (b & 1)) return Kh(a, D()), null;
          var c = Ph(a, b);
          if (0 !== a.tag && 2 === c) {
            var d = Cc(a);
            0 !== d && (b = d, c = Uh(a, d));
          }
          if (1 === c) throw c = vh, Rh(a, 0), Jh(a, b), Kh(a, D()), c;
          if (6 === c) throw Error(n(345));
          a.finishedWork = a.current.alternate;
          a.finishedLanes = b;
          Wh(a, zh, Ah);
          Kh(a, D());
          return null;
        }
        function Xh(a) {
          null !== Dh && 0 === Dh.tag && 0 === (H & 6) && Oh();
          var b = H;
          H |= 1;
          var c = W.transition, d = C;
          try {
            if (W.transition = null, C = 1, a) return a();
          } finally {
            C = d, W.transition = c, H = b, 0 === (H & 6) && ad();
          }
        }
        function Eg() {
          $f = Zf.current;
          q(Zf);
        }
        function Rh(a, b) {
          a.finishedWork = null;
          a.finishedLanes = 0;
          var c = a.timeoutHandle;
          c !== Ra && (a.timeoutHandle = Ra, Qa(c));
          if (null !== X) for (c = X.return; null !== c; ) {
            var d = c;
            nd(d);
            switch (d.tag) {
              case 1:
                d = d.type.childContextTypes;
                null !== d && void 0 !== d && nc();
                break;
              case 3:
                te();
                q(z);
                q(x);
                ye();
                break;
              case 5:
                ve(d);
                break;
              case 4:
                te();
                break;
              case 13:
                q(I);
                break;
              case 19:
                q(I);
                break;
              case 10:
                Wd(d.type._context);
                break;
              case 22:
              case 23:
                Eg();
            }
            c = c.return;
          }
          N = a;
          X = a = Jd(a.current, null);
          Z = $f = b;
          R = 0;
          vh = null;
          xh = wh = le = 0;
          zh = yh = null;
          if (null !== $d) {
            for (b = 0; b < $d.length; b++) if (c = $d[b], d = c.interleaved, null !== d) {
              c.interleaved = null;
              var e = d.next, f = c.pending;
              if (null !== f) {
                var g = f.next;
                f.next = e;
                d.next = g;
              }
              c.pending = d;
            }
            $d = null;
          }
          return a;
        }
        function Th(a, b) {
          do {
            var c = X;
            try {
              Ud();
              ze.current = Le;
              if (Ce) {
                for (var d = J.memoizedState; null !== d; ) {
                  var e = d.queue;
                  null !== e && (e.pending = null);
                  d = d.next;
                }
                Ce = false;
              }
              Be = 0;
              L = K = J = null;
              De = false;
              Ee = 0;
              uh.current = null;
              if (null === c || null === c.return) {
                R = 1;
                vh = b;
                X = null;
                break;
              }
              a: {
                var f = a, g = c.return, h = c, k = b;
                b = Z;
                h.flags |= 32768;
                if (null !== k && "object" === typeof k && "function" === typeof k.then) {
                  var l = k, m = h, r = m.tag;
                  if (0 === (m.mode & 1) && (0 === r || 11 === r || 15 === r)) {
                    var p = m.alternate;
                    p ? (m.updateQueue = p.updateQueue, m.memoizedState = p.memoizedState, m.lanes = p.lanes) : (m.updateQueue = null, m.memoizedState = null);
                  }
                  var B = Pf(g);
                  if (null !== B) {
                    B.flags &= -257;
                    Qf(B, g, h, f, b);
                    B.mode & 1 && Nf(f, l, b);
                    b = B;
                    k = l;
                    var w = b.updateQueue;
                    if (null === w) {
                      var Y = /* @__PURE__ */ new Set();
                      Y.add(k);
                      b.updateQueue = Y;
                    } else w.add(k);
                    break a;
                  } else {
                    if (0 === (b & 1)) {
                      Nf(f, l, b);
                      ng();
                      break a;
                    }
                    k = Error(n(426));
                  }
                } else if (F && h.mode & 1) {
                  var ya = Pf(g);
                  if (null !== ya) {
                    0 === (ya.flags & 65536) && (ya.flags |= 256);
                    Qf(ya, g, h, f, b);
                    Bd(Ef(k, h));
                    break a;
                  }
                }
                f = k = Ef(k, h);
                4 !== R && (R = 2);
                null === yh ? yh = [f] : yh.push(f);
                f = g;
                do {
                  switch (f.tag) {
                    case 3:
                      f.flags |= 65536;
                      b &= -b;
                      f.lanes |= b;
                      var E = If(f, k, b);
                      je(f, E);
                      break a;
                    case 1:
                      h = k;
                      var u = f.type, t = f.stateNode;
                      if (0 === (f.flags & 128) && ("function" === typeof u.getDerivedStateFromError || null !== t && "function" === typeof t.componentDidCatch && (null === Mf || !Mf.has(t)))) {
                        f.flags |= 65536;
                        b &= -b;
                        f.lanes |= b;
                        var Db = Lf(f, h, b);
                        je(f, Db);
                        break a;
                      }
                  }
                  f = f.return;
                } while (null !== f);
              }
              Yh(c);
            } catch (lc) {
              b = lc;
              X === c && null !== c && (X = c = c.return);
              continue;
            }
            break;
          } while (1);
        }
        function Qh() {
          var a = th.current;
          th.current = Le;
          return null === a ? Le : a;
        }
        function ng() {
          if (0 === R || 3 === R || 2 === R) R = 4;
          null === N || 0 === (le & 268435455) && 0 === (wh & 268435455) || Jh(N, Z);
        }
        function Ph(a, b) {
          var c = H;
          H |= 2;
          var d = Qh();
          if (N !== a || Z !== b) Ah = null, Rh(a, b);
          do
            try {
              Zh();
              break;
            } catch (e) {
              Th(a, e);
            }
          while (1);
          Ud();
          H = c;
          th.current = d;
          if (null !== X) throw Error(n(261));
          N = null;
          Z = 0;
          return R;
        }
        function Zh() {
          for (; null !== X; ) $h(X);
        }
        function Sh() {
          for (; null !== X && !Lc(); ) $h(X);
        }
        function $h(a) {
          var b = ai(a.alternate, a, $f);
          a.memoizedProps = a.pendingProps;
          null === b ? Yh(a) : X = b;
          uh.current = null;
        }
        function Yh(a) {
          var b = a;
          do {
            var c = b.alternate;
            a = b.return;
            if (0 === (b.flags & 32768)) {
              if (c = Bg(c, b, $f), null !== c) {
                X = c;
                return;
              }
            } else {
              c = Fg(c, b);
              if (null !== c) {
                c.flags &= 32767;
                X = c;
                return;
              }
              if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
              else {
                R = 6;
                X = null;
                return;
              }
            }
            b = b.sibling;
            if (null !== b) {
              X = b;
              return;
            }
            X = b = a;
          } while (null !== b);
          0 === R && (R = 5);
        }
        function Wh(a, b, c) {
          var d = C, e = W.transition;
          try {
            W.transition = null, C = 1, bi(a, b, c, d);
          } finally {
            W.transition = e, C = d;
          }
          return null;
        }
        function bi(a, b, c, d) {
          do
            Oh();
          while (null !== Dh);
          if (0 !== (H & 6)) throw Error(n(327));
          c = a.finishedWork;
          var e = a.finishedLanes;
          if (null === c) return null;
          a.finishedWork = null;
          a.finishedLanes = 0;
          if (c === a.current) throw Error(n(177));
          a.callbackNode = null;
          a.callbackPriority = 0;
          var f = c.lanes | c.childLanes;
          Gc(a, f);
          a === N && (X = N = null, Z = 0);
          0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || Ch || (Ch = true, Mh(Pc, function() {
            Oh();
            return null;
          }));
          f = 0 !== (c.flags & 15990);
          if (0 !== (c.subtreeFlags & 15990) || f) {
            f = W.transition;
            W.transition = null;
            var g = C;
            C = 1;
            var h = H;
            H |= 4;
            uh.current = null;
            Lg(a, c);
            $g(c, a);
            Ia(a.containerInfo);
            a.current = c;
            dh(c, a, e);
            Mc();
            H = h;
            C = g;
            W.transition = f;
          } else a.current = c;
          Ch && (Ch = false, Dh = a, Eh = e);
          f = a.pendingLanes;
          0 === f && (Mf = null);
          Tc(c.stateNode, d);
          Kh(a, D());
          if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, { componentStack: e.stack, digest: e.digest });
          if (Jf) throw Jf = false, a = Kf, Kf = null, a;
          0 !== (Eh & 1) && 0 !== a.tag && Oh();
          f = a.pendingLanes;
          0 !== (f & 1) ? a === Gh ? Fh++ : (Fh = 0, Gh = a) : Fh = 0;
          ad();
          return null;
        }
        function Oh() {
          if (null !== Dh) {
            var a = Ic(Eh), b = W.transition, c = C;
            try {
              W.transition = null;
              C = 16 > a ? 16 : a;
              if (null === Dh) var d = false;
              else {
                a = Dh;
                Dh = null;
                Eh = 0;
                if (0 !== (H & 6)) throw Error(n(331));
                var e = H;
                H |= 4;
                for (T = a.current; null !== T; ) {
                  var f = T, g = f.child;
                  if (0 !== (T.flags & 16)) {
                    var h = f.deletions;
                    if (null !== h) {
                      for (var k = 0; k < h.length; k++) {
                        var l = h[k];
                        for (T = l; null !== T; ) {
                          var m = T;
                          switch (m.tag) {
                            case 0:
                            case 11:
                            case 15:
                              Mg(8, m, f);
                          }
                          var r = m.child;
                          if (null !== r) r.return = m, T = r;
                          else for (; null !== T; ) {
                            m = T;
                            var p = m.sibling, B = m.return;
                            Pg(m);
                            if (m === l) {
                              T = null;
                              break;
                            }
                            if (null !== p) {
                              p.return = B;
                              T = p;
                              break;
                            }
                            T = B;
                          }
                        }
                      }
                      var w = f.alternate;
                      if (null !== w) {
                        var Y = w.child;
                        if (null !== Y) {
                          w.child = null;
                          do {
                            var ya = Y.sibling;
                            Y.sibling = null;
                            Y = ya;
                          } while (null !== Y);
                        }
                      }
                      T = f;
                    }
                  }
                  if (0 !== (f.subtreeFlags & 2064) && null !== g) g.return = f, T = g;
                  else b: for (; null !== T; ) {
                    f = T;
                    if (0 !== (f.flags & 2048)) switch (f.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Mg(9, f, f.return);
                    }
                    var E = f.sibling;
                    if (null !== E) {
                      E.return = f.return;
                      T = E;
                      break b;
                    }
                    T = f.return;
                  }
                }
                var u = a.current;
                for (T = u; null !== T; ) {
                  g = T;
                  var t = g.child;
                  if (0 !== (g.subtreeFlags & 2064) && null !== t) t.return = g, T = t;
                  else b: for (g = u; null !== T; ) {
                    h = T;
                    if (0 !== (h.flags & 2048)) try {
                      switch (h.tag) {
                        case 0:
                        case 11:
                        case 15:
                          Ng(9, h);
                      }
                    } catch (lc) {
                      U(h, h.return, lc);
                    }
                    if (h === g) {
                      T = null;
                      break b;
                    }
                    var Db = h.sibling;
                    if (null !== Db) {
                      Db.return = h.return;
                      T = Db;
                      break b;
                    }
                    T = h.return;
                  }
                }
                H = e;
                ad();
                if (Sc && "function" === typeof Sc.onPostCommitFiberRoot) try {
                  Sc.onPostCommitFiberRoot(Rc, a);
                } catch (lc) {
                }
                d = true;
              }
              return d;
            } finally {
              C = c, W.transition = b;
            }
          }
          return false;
        }
        function ci(a, b, c) {
          b = Ef(c, b);
          b = If(a, b, 1);
          a = he(a, b, 1);
          b = O();
          null !== a && (Fc(a, 1, b), Kh(a, b));
        }
        function U(a, b, c) {
          if (3 === a.tag) ci(a, a, c);
          else for (; null !== b; ) {
            if (3 === b.tag) {
              ci(b, a, c);
              break;
            } else if (1 === b.tag) {
              var d = b.stateNode;
              if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Mf || !Mf.has(d))) {
                a = Ef(c, a);
                a = Lf(b, a, 1);
                b = he(b, a, 1);
                a = O();
                null !== b && (Fc(b, 1, a), Kh(b, a));
                break;
              }
            }
            b = b.return;
          }
        }
        function Of(a, b, c) {
          var d = a.pingCache;
          null !== d && d.delete(b);
          b = O();
          a.pingedLanes |= a.suspendedLanes & c;
          N === a && (Z & c) === c && (4 === R || 3 === R && (Z & 130023424) === Z && 500 > D() - bh ? Rh(a, 0) : xh |= c);
          Kh(a, b);
        }
        function di(a, b) {
          0 === b && (0 === (a.mode & 1) ? b = 1 : (b = xc, xc <<= 1, 0 === (xc & 130023424) && (xc = 4194304)));
          var c = O();
          a = ce(a, b);
          null !== a && (Fc(a, b, c), Kh(a, c));
        }
        function og(a) {
          var b = a.memoizedState, c = 0;
          null !== b && (c = b.retryLane);
          di(a, c);
        }
        function Yg(a, b) {
          var c = 0;
          switch (a.tag) {
            case 13:
              var d = a.stateNode;
              var e = a.memoizedState;
              null !== e && (c = e.retryLane);
              break;
            case 19:
              d = a.stateNode;
              break;
            default:
              throw Error(n(314));
          }
          null !== d && d.delete(b);
          di(a, c);
        }
        var ai;
        ai = function(a, b, c) {
          if (null !== a) if (a.memoizedProps !== b.pendingProps || z.current) G = true;
          else {
            if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return G = false, sg(a, b, c);
            G = 0 !== (a.flags & 131072) ? true : false;
          }
          else G = false, F && 0 !== (b.flags & 1048576) && ld(b, ed, b.index);
          b.lanes = 0;
          switch (b.tag) {
            case 2:
              var d = b.type;
              cg(a, b);
              a = b.pendingProps;
              var e = mc(b, x.current);
              Yd(b, c);
              e = He(null, b, d, a, e, c);
              var f = Me();
              b.flags |= 1;
              "object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, A(d) ? (f = true, qc(b)) : f = false, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, ee(b), e.updater = zf, b.stateNode = e, e._reactInternals = b, Df(b, d, a, c), b = dg(null, b, d, true, f, c)) : (b.tag = 0, F && f && md(b), P(null, b, e, c), b = b.child);
              return b;
            case 16:
              d = b.elementType;
              a: {
                cg(a, b);
                a = b.pendingProps;
                e = d._init;
                d = e(d._payload);
                b.type = d;
                e = b.tag = ei(d);
                a = xf(d, a);
                switch (e) {
                  case 0:
                    b = Xf(null, b, d, a, c);
                    break a;
                  case 1:
                    b = bg(null, b, d, a, c);
                    break a;
                  case 11:
                    b = Sf(null, b, d, a, c);
                    break a;
                  case 14:
                    b = Uf(null, b, d, xf(d.type, a), c);
                    break a;
                }
                throw Error(n(
                  306,
                  d,
                  ""
                ));
              }
              return b;
            case 0:
              return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : xf(d, e), Xf(a, b, d, e, c);
            case 1:
              return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : xf(d, e), bg(a, b, d, e, c);
            case 3:
              a: {
                eg(b);
                if (null === a) throw Error(n(387));
                d = b.pendingProps;
                f = b.memoizedState;
                e = f.element;
                fe(a, b);
                ke(b, d, null, c);
                var g = b.memoizedState;
                d = g.element;
                if (Va && f.isDehydrated) if (f = { element: d, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b.updateQueue.baseState = f, b.memoizedState = f, b.flags & 256) {
                  e = Ef(Error(n(423)), b);
                  b = fg(a, b, d, c, e);
                  break a;
                } else if (d !== e) {
                  e = Ef(Error(n(424)), b);
                  b = fg(a, b, d, c, e);
                  break a;
                } else for (Va && (pd = Pb(b.stateNode.containerInfo), od = b, F = true, rd = null, qd = false), c = Pd(b, null, d, c), b.child = c; c; ) c.flags = c.flags & -3 | 4096, c = c.sibling;
                else {
                  Ad();
                  if (d === e) {
                    b = Tf(a, b, c);
                    break a;
                  }
                  P(a, b, d, c);
                }
                b = b.child;
              }
              return b;
            case 5:
              return ue(b), null === a && wd(b), d = b.type, e = b.pendingProps, f = null !== a ? a.memoizedProps : null, g = e.children, Na(d, e) ? g = null : null !== f && Na(d, f) && (b.flags |= 32), ag(a, b), P(a, b, g, c), b.child;
            case 6:
              return null === a && wd(b), null;
            case 13:
              return ig(a, b, c);
            case 4:
              return se(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Od(b, null, d, c) : P(a, b, d, c), b.child;
            case 11:
              return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : xf(d, e), Sf(a, b, d, e, c);
            case 7:
              return P(a, b, b.pendingProps, c), b.child;
            case 8:
              return P(a, b, b.pendingProps.children, c), b.child;
            case 12:
              return P(a, b, b.pendingProps.children, c), b.child;
            case 10:
              a: {
                d = b.type._context;
                e = b.pendingProps;
                f = b.memoizedProps;
                g = e.value;
                Vd(b, d, g);
                if (null !== f) if (Vc(f.value, g)) {
                  if (f.children === e.children && !z.current) {
                    b = Tf(a, b, c);
                    break a;
                  }
                } else for (f = b.child, null !== f && (f.return = b); null !== f; ) {
                  var h = f.dependencies;
                  if (null !== h) {
                    g = f.child;
                    for (var k = h.firstContext; null !== k; ) {
                      if (k.context === d) {
                        if (1 === f.tag) {
                          k = ge(-1, c & -c);
                          k.tag = 2;
                          var l = f.updateQueue;
                          if (null !== l) {
                            l = l.shared;
                            var m = l.pending;
                            null === m ? k.next = k : (k.next = m.next, m.next = k);
                            l.pending = k;
                          }
                        }
                        f.lanes |= c;
                        k = f.alternate;
                        null !== k && (k.lanes |= c);
                        Xd(f.return, c, b);
                        h.lanes |= c;
                        break;
                      }
                      k = k.next;
                    }
                  } else if (10 === f.tag) g = f.type === b.type ? null : f.child;
                  else if (18 === f.tag) {
                    g = f.return;
                    if (null === g) throw Error(n(341));
                    g.lanes |= c;
                    h = g.alternate;
                    null !== h && (h.lanes |= c);
                    Xd(g, c, b);
                    g = f.sibling;
                  } else g = f.child;
                  if (null !== g) g.return = f;
                  else for (g = f; null !== g; ) {
                    if (g === b) {
                      g = null;
                      break;
                    }
                    f = g.sibling;
                    if (null !== f) {
                      f.return = g.return;
                      g = f;
                      break;
                    }
                    g = g.return;
                  }
                  f = g;
                }
                P(a, b, e.children, c);
                b = b.child;
              }
              return b;
            case 9:
              return e = b.type, d = b.pendingProps.children, Yd(b, c), e = Zd(e), d = d(e), b.flags |= 1, P(a, b, d, c), b.child;
            case 14:
              return d = b.type, e = xf(d, b.pendingProps), e = xf(d.type, e), Uf(a, b, d, e, c);
            case 15:
              return Wf(a, b, b.type, b.pendingProps, c);
            case 17:
              return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : xf(d, e), cg(a, b), b.tag = 1, A(d) ? (a = true, qc(b)) : a = false, Yd(b, c), Bf(b, d, e), Df(b, d, e, c), dg(null, b, d, true, a, c);
            case 19:
              return rg(a, b, c);
            case 22:
              return Yf(a, b, c);
          }
          throw Error(n(156, b.tag));
        };
        function Mh(a, b) {
          return Jc(a, b);
        }
        function fi(a, b, c, d) {
          this.tag = a;
          this.key = c;
          this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
          this.index = 0;
          this.ref = null;
          this.pendingProps = b;
          this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
          this.mode = d;
          this.subtreeFlags = this.flags = 0;
          this.deletions = null;
          this.childLanes = this.lanes = 0;
          this.alternate = null;
        }
        function td(a, b, c, d) {
          return new fi(a, b, c, d);
        }
        function Vf(a) {
          a = a.prototype;
          return !(!a || !a.isReactComponent);
        }
        function ei(a) {
          if ("function" === typeof a) return Vf(a) ? 1 : 0;
          if (void 0 !== a && null !== a) {
            a = a.$$typeof;
            if (a === ma) return 11;
            if (a === pa) return 14;
          }
          return 2;
        }
        function Jd(a, b) {
          var c = a.alternate;
          null === c ? (c = td(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
          c.flags = a.flags & 14680064;
          c.childLanes = a.childLanes;
          c.lanes = a.lanes;
          c.child = a.child;
          c.memoizedProps = a.memoizedProps;
          c.memoizedState = a.memoizedState;
          c.updateQueue = a.updateQueue;
          b = a.dependencies;
          c.dependencies = null === b ? null : { lanes: b.lanes, firstContext: b.firstContext };
          c.sibling = a.sibling;
          c.index = a.index;
          c.ref = a.ref;
          return c;
        }
        function Ld(a, b, c, d, e, f) {
          var g = 2;
          d = a;
          if ("function" === typeof a) Vf(a) && (g = 1);
          else if ("string" === typeof a) g = 5;
          else a: switch (a) {
            case ha:
              return Nd(c.children, e, f, b);
            case ia:
              g = 8;
              e |= 8;
              break;
            case ja:
              return a = td(12, c, b, e | 2), a.elementType = ja, a.lanes = f, a;
            case na:
              return a = td(13, c, b, e), a.elementType = na, a.lanes = f, a;
            case oa:
              return a = td(19, c, b, e), a.elementType = oa, a.lanes = f, a;
            case ra:
              return jg(c, e, f, b);
            default:
              if ("object" === typeof a && null !== a) switch (a.$$typeof) {
                case ka:
                  g = 10;
                  break a;
                case la:
                  g = 9;
                  break a;
                case ma:
                  g = 11;
                  break a;
                case pa:
                  g = 14;
                  break a;
                case qa:
                  g = 16;
                  d = null;
                  break a;
              }
              throw Error(n(130, null == a ? a : typeof a, ""));
          }
          b = td(g, c, b, e);
          b.elementType = a;
          b.type = d;
          b.lanes = f;
          return b;
        }
        function Nd(a, b, c, d) {
          a = td(7, a, d, b);
          a.lanes = c;
          return a;
        }
        function jg(a, b, c, d) {
          a = td(22, a, d, b);
          a.elementType = ra;
          a.lanes = c;
          a.stateNode = { isHidden: false };
          return a;
        }
        function Kd(a, b, c) {
          a = td(6, a, null, b);
          a.lanes = c;
          return a;
        }
        function Md(a, b, c) {
          b = td(4, null !== a.children ? a.children : [], a.key, b);
          b.lanes = c;
          b.stateNode = { containerInfo: a.containerInfo, pendingChildren: null, implementation: a.implementation };
          return b;
        }
        function gi(a, b, c, d, e) {
          this.tag = b;
          this.containerInfo = a;
          this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
          this.timeoutHandle = Ra;
          this.callbackNode = this.pendingContext = this.context = null;
          this.callbackPriority = 0;
          this.eventTimes = Ec(0);
          this.expirationTimes = Ec(-1);
          this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
          this.entanglements = Ec(0);
          this.identifierPrefix = d;
          this.onRecoverableError = e;
          Va && (this.mutableSourceEagerHydrationData = null);
        }
        function hi(a, b, c, d, e, f, g, h, k) {
          a = new gi(a, b, c, h, k);
          1 === b ? (b = 1, true === f && (b |= 8)) : b = 0;
          f = td(3, null, null, b);
          a.current = f;
          f.stateNode = a;
          f.memoizedState = { element: d, isDehydrated: c, cache: null, transitions: null, pendingSuspenseBoundaries: null };
          ee(f);
          return a;
        }
        function ii(a) {
          if (!a) return jc;
          a = a._reactInternals;
          a: {
            if (wa(a) !== a || 1 !== a.tag) throw Error(n(170));
            var b = a;
            do {
              switch (b.tag) {
                case 3:
                  b = b.stateNode.context;
                  break a;
                case 1:
                  if (A(b.type)) {
                    b = b.stateNode.__reactInternalMemoizedMergedChildContext;
                    break a;
                  }
              }
              b = b.return;
            } while (null !== b);
            throw Error(n(171));
          }
          if (1 === a.tag) {
            var c = a.type;
            if (A(c)) return pc(a, c, b);
          }
          return b;
        }
        function ji(a) {
          var b = a._reactInternals;
          if (void 0 === b) {
            if ("function" === typeof a.render) throw Error(n(188));
            a = Object.keys(a).join(",");
            throw Error(n(268, a));
          }
          a = Aa(b);
          return null === a ? null : a.stateNode;
        }
        function ki(a, b) {
          a = a.memoizedState;
          if (null !== a && null !== a.dehydrated) {
            var c = a.retryLane;
            a.retryLane = 0 !== c && c < b ? c : b;
          }
        }
        function li(a, b) {
          ki(a, b);
          (a = a.alternate) && ki(a, b);
        }
        function mi(a) {
          a = Aa(a);
          return null === a ? null : a.stateNode;
        }
        function ni() {
          return null;
        }
        exports2.attemptContinuousHydration = function(a) {
          if (13 === a.tag) {
            var b = ce(a, 134217728);
            if (null !== b) {
              var c = O();
              af(b, a, 134217728, c);
            }
            li(a, 134217728);
          }
        };
        exports2.attemptDiscreteHydration = function(a) {
          if (13 === a.tag) {
            var b = ce(a, 1);
            if (null !== b) {
              var c = O();
              af(b, a, 1, c);
            }
            li(a, 1);
          }
        };
        exports2.attemptHydrationAtCurrentPriority = function(a) {
          if (13 === a.tag) {
            var b = tf(a), c = ce(a, b);
            if (null !== c) {
              var d = O();
              af(c, a, b, d);
            }
            li(a, b);
          }
        };
        exports2.attemptSynchronousHydration = function(a) {
          switch (a.tag) {
            case 3:
              var b = a.stateNode;
              if (b.current.memoizedState.isDehydrated) {
                var c = yc(b.pendingLanes);
                0 !== c && (Hc(b, c | 1), Kh(b, D()), 0 === (H & 6) && (Bh(), ad()));
              }
              break;
            case 13:
              Xh(function() {
                var b2 = ce(a, 1);
                if (null !== b2) {
                  var c2 = O();
                  af(b2, a, 1, c2);
                }
              }), li(a, 1);
          }
        };
        exports2.batchedUpdates = function(a, b) {
          var c = H;
          H |= 1;
          try {
            return a(b);
          } finally {
            H = c, 0 === H && (Bh(), Xc && ad());
          }
        };
        exports2.createComponentSelector = function(a) {
          return { $$typeof: hh, value: a };
        };
        exports2.createContainer = function(a, b, c, d, e, f, g) {
          return hi(a, b, false, null, c, d, e, f, g);
        };
        exports2.createHasPseudoClassSelector = function(a) {
          return { $$typeof: ih, value: a };
        };
        exports2.createHydrationContainer = function(a, b, c, d, e, f, g, h, k) {
          a = hi(c, d, true, a, e, f, g, h, k);
          a.context = ii(null);
          c = a.current;
          d = O();
          e = tf(c);
          f = ge(d, e);
          f.callback = void 0 !== b && null !== b ? b : null;
          he(c, f, e);
          a.current.lanes = e;
          Fc(a, e, d);
          Kh(a, d);
          return a;
        };
        exports2.createPortal = function(a, b, c) {
          var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
          return { $$typeof: fa, key: null == d ? null : "" + d, children: a, containerInfo: b, implementation: c };
        };
        exports2.createRoleSelector = function(a) {
          return { $$typeof: jh, value: a };
        };
        exports2.createTestNameSelector = function(a) {
          return { $$typeof: kh, value: a };
        };
        exports2.createTextSelector = function(a) {
          return { $$typeof: lh, value: a };
        };
        exports2.deferredUpdates = function(a) {
          var b = C, c = W.transition;
          try {
            return W.transition = null, C = 16, a();
          } finally {
            C = b, W.transition = c;
          }
        };
        exports2.discreteUpdates = function(a, b, c, d, e) {
          var f = C, g = W.transition;
          try {
            return W.transition = null, C = 1, a(b, c, d, e);
          } finally {
            C = f, W.transition = g, 0 === H && Bh();
          }
        };
        exports2.findAllNodes = rh;
        exports2.findBoundingRects = function(a, b) {
          if (!bb) throw Error(n(363));
          b = rh(a, b);
          a = [];
          for (var c = 0; c < b.length; c++) a.push(db(b[c]));
          for (b = a.length - 1; 0 < b; b--) {
            c = a[b];
            for (var d = c.x, e = d + c.width, f = c.y, g = f + c.height, h = b - 1; 0 <= h; h--) if (b !== h) {
              var k = a[h], l = k.x, m = l + k.width, r = k.y, p = r + k.height;
              if (d >= l && f >= r && e <= m && g <= p) {
                a.splice(b, 1);
                break;
              } else if (!(d !== l || c.width !== k.width || p < f || r > g)) {
                r > f && (k.height += r - f, k.y = f);
                p < g && (k.height = g - r);
                a.splice(b, 1);
                break;
              } else if (!(f !== r || c.height !== k.height || m < d || l > e)) {
                l > d && (k.width += l - d, k.x = d);
                m < e && (k.width = e - l);
                a.splice(b, 1);
                break;
              }
            }
          }
          return a;
        };
        exports2.findHostInstance = ji;
        exports2.findHostInstanceWithNoPortals = function(a) {
          a = za(a);
          a = null !== a ? Ca(a) : null;
          return null === a ? null : a.stateNode;
        };
        exports2.findHostInstanceWithWarning = function(a) {
          return ji(a);
        };
        exports2.flushControlled = function(a) {
          var b = H;
          H |= 1;
          var c = W.transition, d = C;
          try {
            W.transition = null, C = 1, a();
          } finally {
            C = d, W.transition = c, H = b, 0 === H && (Bh(), ad());
          }
        };
        exports2.flushPassiveEffects = Oh;
        exports2.flushSync = Xh;
        exports2.focusWithin = function(a, b) {
          if (!bb) throw Error(n(363));
          a = nh(a);
          b = qh(a, b);
          b = Array.from(b);
          for (a = 0; a < b.length; ) {
            var c = b[a++];
            if (!fb(c)) {
              if (5 === c.tag && hb(c.stateNode)) return true;
              for (c = c.child; null !== c; ) b.push(c), c = c.sibling;
            }
          }
          return false;
        };
        exports2.getCurrentUpdatePriority = function() {
          return C;
        };
        exports2.getFindAllNodesFailureDescription = function(a, b) {
          if (!bb) throw Error(n(363));
          var c = 0, d = [];
          a = [nh(a), 0];
          for (var e = 0; e < a.length; ) {
            var f = a[e++], g = a[e++], h = b[g];
            if (5 !== f.tag || !fb(f)) {
              if (oh(f, h) && (d.push(ph(h)), g++, g > c && (c = g)), g < b.length) for (f = f.child; null !== f; ) a.push(f, g), f = f.sibling;
            }
          }
          if (c < b.length) {
            for (a = []; c < b.length; c++) a.push(ph(b[c]));
            return "findAllNodes was able to match part of the selector:\n  " + (d.join(" > ") + "\n\nNo matching component was found for:\n  ") + a.join(" > ");
          }
          return null;
        };
        exports2.getPublicRootInstance = function(a) {
          a = a.current;
          if (!a.child) return null;
          switch (a.child.tag) {
            case 5:
              return Ea(a.child.stateNode);
            default:
              return a.child.stateNode;
          }
        };
        exports2.injectIntoDevTools = function(a) {
          a = { bundleType: a.bundleType, version: a.version, rendererPackageName: a.rendererPackageName, rendererConfig: a.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: da.ReactCurrentDispatcher, findHostInstanceByFiber: mi, findFiberByHostInstance: a.findFiberByHostInstance || ni, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1" };
          if ("undefined" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) a = false;
          else {
            var b = __REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (b.isDisabled || !b.supportsFiber) a = true;
            else {
              try {
                Rc = b.inject(a), Sc = b;
              } catch (c) {
              }
              a = b.checkDCE ? true : false;
            }
          }
          return a;
        };
        exports2.isAlreadyRendering = function() {
          return false;
        };
        exports2.observeVisibleRects = function(a, b, c, d) {
          if (!bb) throw Error(n(363));
          a = rh(a, b);
          var e = ib(a, c, d).disconnect;
          return { disconnect: function() {
            e();
          } };
        };
        exports2.registerMutableSourceForHydration = function(a, b) {
          var c = b._getVersion;
          c = c(b._source);
          null == a.mutableSourceEagerHydrationData ? a.mutableSourceEagerHydrationData = [b, c] : a.mutableSourceEagerHydrationData.push(b, c);
        };
        exports2.runWithPriority = function(a, b) {
          var c = C;
          try {
            return C = a, b();
          } finally {
            C = c;
          }
        };
        exports2.shouldError = function() {
          return null;
        };
        exports2.shouldSuspend = function() {
          return false;
        };
        exports2.updateContainer = function(a, b, c, d) {
          var e = b.current, f = O(), g = tf(e);
          c = ii(c);
          null === b.context ? b.context = c : b.pendingContext = c;
          b = ge(f, g);
          b.payload = { element: a };
          d = void 0 === d ? null : d;
          null !== d && (b.callback = d);
          a = he(e, b, g);
          null !== a && (af(a, e, g, f), ie(a, e, g));
          return g;
        };
        return exports2;
      };
    }
  });

  // ../../../node_modules/react-reconciler/index.js
  var require_react_reconciler = __commonJS({
    "../../../node_modules/react-reconciler/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_reconciler_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // ../../../node_modules/react-reconciler/cjs/react-reconciler-constants.production.min.js
  var require_react_reconciler_constants_production_min = __commonJS({
    "../../../node_modules/react-reconciler/cjs/react-reconciler-constants.production.min.js"(exports) {
      "use strict";
      exports.ConcurrentRoot = 1;
      exports.ContinuousEventPriority = 4;
      exports.DefaultEventPriority = 16;
      exports.DiscreteEventPriority = 1;
      exports.IdleEventPriority = 536870912;
      exports.LegacyRoot = 0;
    }
  });

  // ../../../node_modules/react-reconciler/constants.js
  var require_constants = __commonJS({
    "../../../node_modules/react-reconciler/constants.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_reconciler_constants_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // react-refresh-stub:react-refresh/runtime
  var require_runtime = __commonJS({
    "react-refresh-stub:react-refresh/runtime"(exports, module) {
      module.exports = {};
    }
  });

  // <stdin>
  var _m0 = __toESM(require_react());
  var _m1 = __toESM(require_jsx_runtime());
  var _m2 = __toESM(require_jsx_dev_runtime());

  // ../../../js/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Anchored: () => Anchored,
    Animated: () => Animated,
    CanvasContext: () => CanvasContext,
    Easing: () => Easing,
    addEventListener: () => addEventListener,
    cancelAnimation: () => cancelAnimation,
    emit: () => emit,
    flushSync: () => flushSync,
    interpolate: () => interpolate,
    interpolateColor: () => interpolateColor,
    mount: () => mount,
    recordDrawing: () => recordDrawing,
    removeEventListener: () => removeEventListener,
    render: () => render,
    request: () => request,
    reset: () => reset,
    runEventLoop: () => runEventLoop,
    useSharedValue: () => useSharedValue,
    withDelay: () => withDelay,
    withRepeat: () => withRepeat,
    withSequence: () => withSequence,
    withSpring: () => withSpring,
    withTiming: () => withTiming
  });

  // ../../../js/src/canvas.ts
  var CanvasContext = class {
    /** The recorded commands, in order. Read by `serializeProps`; you normally
     *  don't touch this — use the drawing methods instead. */
    commands = [];
    #fillStyle = "#000000";
    #strokeStyle = "#000000";
    #lineWidth = 1;
    /** Current fill color (any CSS color string: hex, named, `rgb()`/`hsl()`/…).
     *  Assigning records the change. */
    get fillStyle() {
      return this.#fillStyle;
    }
    set fillStyle(color) {
      this.#fillStyle = color;
      this.commands.push({ cmd: "fillStyle", color });
    }
    /** Current stroke color (any CSS color string: hex, named, `rgb()`/`hsl()`/…).
     *  Assigning records the change. */
    get strokeStyle() {
      return this.#strokeStyle;
    }
    set strokeStyle(color) {
      this.#strokeStyle = color;
      this.commands.push({ cmd: "strokeStyle", color });
    }
    /** Current stroke width in canvas pixels. Assigning records the change. */
    get lineWidth() {
      return this.#lineWidth;
    }
    set lineWidth(w) {
      this.#lineWidth = w;
      this.commands.push({ cmd: "lineWidth", w });
    }
    /** Start a fresh path, discarding the current one. */
    beginPath() {
      this.commands.push({ cmd: "beginPath" });
      return this;
    }
    /** Begin a new subpath at `(x, y)`. */
    moveTo(x, y) {
      this.commands.push({ cmd: "moveTo", x, y });
      return this;
    }
    /** Add a straight segment to `(x, y)`. */
    lineTo(x, y) {
      this.commands.push({ cmd: "lineTo", x, y });
      return this;
    }
    /** Add a quadratic Bézier to `(x, y)` with control point `(cx, cy)`. */
    quadraticCurveTo(cx, cy, x, y) {
      this.commands.push({ cmd: "quadTo", cx, cy, x, y });
      return this;
    }
    /** Add a cubic Bézier to `(x, y)` with controls `(c1x, c1y)`, `(c2x, c2y)`. */
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
      this.commands.push({ cmd: "bezierTo", c1x, c1y, c2x, c2y, x, y });
      return this;
    }
    /** Add a circular arc centered at `(x, y)`, from `start` to `end` radians. */
    arc(x, y, r, start, end) {
      this.commands.push({ cmd: "arc", x, y, r, start, end });
      return this;
    }
    /** Add an axis-aligned rectangle subpath. */
    rect(x, y, w, h) {
      this.commands.push({ cmd: "rect", x, y, w, h });
      return this;
    }
    /** Close the current subpath back to its start. */
    closePath() {
      this.commands.push({ cmd: "closePath" });
      return this;
    }
    /** Fill the current path with `fillStyle`. */
    fill() {
      this.commands.push({ cmd: "fill" });
      return this;
    }
    /** Stroke the current path with `strokeStyle` and `lineWidth`. */
    stroke() {
      this.commands.push({ cmd: "stroke" });
      return this;
    }
  };
  function recordDrawing(painter) {
    const ctx = new CanvasContext();
    painter(ctx);
    return ctx.commands;
  }

  // ../../../js/src/bridge.ts
  var ops = globalThis.__bevyHost ?? Deno.core.ops;
  var ROOT_ID = 0;
  var pending = [];
  var handlers = /* @__PURE__ */ new Map();
  var nextId = 1;
  function allocId() {
    return nextId++;
  }
  function push(op) {
    pending.push(op);
  }
  function reset() {
    pending.push({ op: "reset" });
    ops.op_animate({ kind: "clear" });
  }
  function animate(cmd) {
    ops.op_animate(cmd);
  }
  function flush() {
    if (pending.length === 0) return;
    ops.op_flush(pending.splice(0, pending.length));
  }
  function emit(name, value) {
    ops.op_emit(name, value);
  }
  var nextRequestId = 1;
  var pendingRequests = /* @__PURE__ */ new Map();
  function request(name, value) {
    const id = nextRequestId++;
    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });
      ops.op_request(BigInt(id), name, value);
    });
  }
  var listeners = /* @__PURE__ */ new Map();
  function addEventListener(name, cb) {
    let set = listeners.get(name);
    if (!set) listeners.set(name, set = /* @__PURE__ */ new Set());
    set.add(cb);
  }
  function removeEventListener(name, cb) {
    listeners.get(name)?.delete(cb);
  }
  function serializeProps(id, props) {
    const out = {};
    const hs = {};
    for (const [key, value] of Object.entries(props)) {
      if (key === "children") continue;
      if (key === "onClick" && typeof value === "function") {
        hs.click = value;
        out.onClick = true;
        continue;
      }
      if (key === "onPointerDown" && typeof value === "function") {
        hs.pointerDown = value;
        out.onPointerDown = true;
        continue;
      }
      if (key === "onPointerMove" && typeof value === "function") {
        hs.pointerMove = value;
        out.onPointerMove = true;
        continue;
      }
      if (key === "onPointerUp" && typeof value === "function") {
        hs.pointerUp = value;
        out.onPointerUp = true;
        continue;
      }
      if (key === "onChange" && typeof value === "function") {
        hs.change = value;
        out.onChange = true;
        continue;
      }
      if (key === "style" && value && typeof value === "object") {
        out.style = value;
        continue;
      }
      if (key === "hoverStyle" && value && typeof value === "object") {
        out.hoverStyle = value;
        continue;
      }
      if (key === "pressStyle" && value && typeof value === "object") {
        out.pressStyle = value;
        continue;
      }
      if (key === "animatedStyle" && value && typeof value === "object") {
        out.animated = serializeAnimatedStyle(value);
        continue;
      }
      if (key === "anchor" && value && typeof value === "object") {
        out.anchor = value;
        continue;
      }
      if (key === "draw") {
        out.draw = typeof value === "function" ? recordDrawing(value) : value;
        continue;
      }
      if (key === "color") out.color = value;
      else if (key === "fontSize") out.fontSize = value;
      else if (key === "src") out.src = value;
      else if (key === "tint") out.tint = value;
      else if (key === "flipX") out.flipX = value;
      else if (key === "flipY") out.flipY = value;
      else if (key === "imageMode")
        out.imageMode = value;
      else if (key === "target") out.target = value;
      else if (key === "name") out.target = value;
      else if (key === "value") out.value = value;
      else if (key === "maxLength") out.maxLength = value;
      else if (key === "multiline") out.multiline = value;
    }
    if (Object.keys(hs).length > 0) handlers.set(id, hs);
    else handlers.delete(id);
    return out;
  }
  function serializeAnimatedStyle(style) {
    const out = {};
    for (const [key, value] of Object.entries(style)) {
      if (!value || typeof value !== "object") continue;
      if ("type" in value) {
        out[key] = value;
      } else if ("id" in value) {
        out[key] = { type: "shared", id: value.id };
      }
    }
    return out;
  }
  function dropHandlers(id) {
    handlers.delete(id);
  }
  async function runEventLoop(wrap = (fn) => fn()) {
    for (; ; ) {
      const msg = await ops.op_next_event();
      if (msg == null) break;
      switch (msg.t) {
        case "reload":
          return;
        // runtime is being rebuilt
        case "uiEvent": {
          const fn = handlers.get(msg.event.id)?.[msg.event.kind];
          if (fn) {
            const event = msg.event;
            wrap(() => {
              try {
                fn(event.kind === "change" ? event.value : event);
              } catch (e) {
                console.error("[js] handler error:", e);
              }
            });
          }
          break;
        }
        case "event": {
          const set = listeners.get(msg.name);
          if (set && set.size > 0) {
            const value = msg.value;
            wrap(() => {
              for (const cb of set) {
                try {
                  cb(value);
                } catch (e) {
                  console.error("[js] listener error:", e);
                }
              }
            });
          }
          break;
        }
        case "response": {
          const p = pendingRequests.get(msg.id);
          if (!p) break;
          pendingRequests.delete(msg.id);
          if (msg.result.status === "ok") p.resolve(msg.result.value);
          else p.reject(new Error(msg.result.message));
          break;
        }
      }
    }
  }

  // ../../../js/src/renderer.ts
  var import_react_reconciler = __toESM(require_react_reconciler(), 1);
  var import_constants = __toESM(require_constants(), 1);

  // ../../../js/src/hmr.ts
  var installed = false;
  function setupRefreshRuntime() {
    const g = globalThis;
    if (g.__hmr) return g.__hmr;
    const Refresh = require_runtime();
    if (!installed) {
      installed = true;
      Refresh.injectIntoGlobalHook(globalThis);
    }
    const api = {
      mounted: false,
      reloadCount: 0,
      register: (type, id) => Refresh.register(type, id),
      sign: Refresh.createSignatureFunctionForTransform,
      performReactRefresh: () => Refresh.performReactRefresh(),
      applyUpdate() {
        this.reloadCount++;
        Refresh.performReactRefresh();
      }
    };
    g.$RefreshReg$ = (type, id) => api.register(type, id);
    g.$RefreshSig$ = api.sign;
    g.__hmr = api;
    return api;
  }

  // ../../../js/src/renderer.ts
  var DEV = false;
  if (DEV) setupRefreshRuntime();
  var hostConfig = {
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    isPrimaryRenderer: true,
    noTimeout: -1,
    scheduleTimeout: (fn, delay) => setTimeout(fn, delay),
    cancelTimeout: (handle) => clearTimeout(handle),
    // Track whether we're inside a `<text>`, so nested `<text>` becomes a span and
    // bare strings inside become inheriting `TextSpan` runs (Bevy's text model).
    getRootHostContext: () => ({ inText: false }),
    getChildHostContext: (parent, type) => ({
      inText: parent.inText || type === "text"
    }),
    getPublicInstance: (instance) => instance,
    prepareForCommit: () => null,
    resetAfterCommit: () => flush(),
    preparePortalMount: () => {
    },
    getCurrentEventPriority: () => import_constants.DefaultEventPriority,
    // Text always becomes a separate text node, never inlined into a host node.
    shouldSetTextContent: () => false,
    createInstance(type, props, _root, hostContext) {
      const id = allocId();
      const kind = type === "text" && hostContext.inText ? "textSpan" : type;
      push({ op: "create", id, kind, props: serializeProps(id, props) });
      return { id, type };
    },
    createTextInstance(text, _root, hostContext) {
      const id = allocId();
      push(
        hostContext.inText ? { op: "createTextSpan", id, text } : { op: "createText", id, text }
      );
      return { id };
    },
    appendInitialChild(parent, child) {
      push({ op: "append", parent: parent.id, child: child.id });
    },
    finalizeInitialChildren: () => false,
    appendChild(parent, child) {
      push({ op: "append", parent: parent.id, child: child.id });
    },
    appendChildToContainer(_container, child) {
      push({ op: "append", parent: ROOT_ID, child: child.id });
    },
    insertBefore(parent, child, before) {
      push({
        op: "insert",
        parent: parent.id,
        child: child.id,
        before: before.id
      });
    },
    insertInContainerBefore(_container, child, before) {
      push({ op: "insert", parent: ROOT_ID, child: child.id, before: before.id });
    },
    removeChild(parent, child) {
      push({ op: "remove", parent: parent.id, child: child.id });
      dropHandlers(child.id);
    },
    removeChildFromContainer(_container, child) {
      push({ op: "remove", parent: ROOT_ID, child: child.id });
      dropHandlers(child.id);
    },
    // We return the new props as the payload so commitUpdate always runs.
    // TODO(review): no prop diffing — `prepareUpdate` always returns `next`, so every
    // update re-serializes and re-applies the FULL prop set (and the Bevy side re-inserts
    // `Node`, forcing relayout — see ui_map::apply_style). Diff old vs next here (or carry a
    // changed-keys set) so a one-field change doesn't re-apply everything.
    prepareUpdate: (_i, _t, _old, next) => next,
    commitUpdate(instance, _payload, _type, _oldProps, newProps) {
      push({
        op: "update",
        id: instance.id,
        props: serializeProps(instance.id, newProps)
      });
    },
    commitTextUpdate(textInstance, _old, next) {
      push({ op: "updateText", id: textInstance.id, text: next });
    },
    clearContainer: () => {
    },
    detachDeletedInstance: (instance) => dropHandlers(instance.id),
    // No-op scope/blur hooks the reconciler still expects.
    getInstanceFromNode: () => null,
    beforeActiveInstanceBlur: () => {
    },
    afterActiveInstanceBlur: () => {
    },
    prepareScopeUpdate: () => {
    },
    getInstanceFromScope: () => null
  };
  var reconciler = (0, import_react_reconciler.default)(hostConfig);
  if (DEV) {
    reconciler.injectIntoDevTools({
      bundleType: 1,
      version: "18.3.1",
      rendererPackageName: "bevy-react",
      findFiberByHostInstance: () => null
    });
  }
  function flushSync(fn) {
    reconciler.flushSync(fn);
  }
  var ConcurrentRoot = 1;
  var root = null;
  function render(element) {
    if (root === null) {
      const container = { id: ROOT_ID };
      root = reconciler.createContainer(
        container,
        ConcurrentRoot,
        null,
        // hydrationCallbacks
        false,
        // isStrictMode
        null,
        // concurrentUpdatesByDefaultOverride
        "",
        // identifierPrefix
        (e) => console.error("[js] recoverable error:", e),
        null
        // transitionCallbacks
      );
    }
    reconciler.flushSync(() => {
      reconciler.updateContainer(element, root, null, null);
    });
  }

  // ../../../js/src/mount.ts
  async function mount(element) {
    const hmr = globalThis.__hmr;
    if (hmr?.mounted) {
      try {
        hmr.applyUpdate();
      } catch (e) {
        console.error("[js] fast refresh error:", e);
      }
    } else {
      if (hmr) hmr.mounted = true;
      reset();
      render(element);
    }
    await runEventLoop(flushSync);
  }

  // ../../../js/src/animated.ts
  var import_react = __toESM(require_react(), 1);
  var Easing = {
    linear: "linear",
    easeIn: "easeIn",
    easeOut: "easeOut",
    easeInOut: "easeInOut"
  };
  var nextSharedId = 1;
  function useSharedValue(initial) {
    const ref = (0, import_react.useRef)(null);
    if (ref.current === null) {
      const id = nextSharedId++;
      animate({ kind: "declare", id, initial });
      ref.current = makeSharedValue(id, initial);
    }
    return ref.current;
  }
  function makeSharedValue(id, initial) {
    let last = initial;
    return {
      id,
      get value() {
        return last;
      },
      set value(v) {
        if (typeof v === "number") {
          last = v;
          animate({ kind: "set", id, value: v });
        } else {
          animate({ kind: "animate", id, driver: v });
        }
      }
    };
  }
  function withTiming(to, config) {
    return {
      type: "timing",
      to,
      duration: (config?.duration ?? 300) / 1e3,
      easing: config?.easing ?? "linear"
    };
  }
  function withSpring(to, config) {
    return {
      type: "spring",
      to,
      stiffness: config?.stiffness ?? 100,
      damping: config?.damping ?? 10,
      mass: config?.mass ?? 1
    };
  }
  function withRepeat(animation, count = -1, reverse = false) {
    return { type: "repeat", animation, count, reverse };
  }
  function withSequence(...steps) {
    return { type: "sequence", steps };
  }
  function withDelay(delayMs, animation) {
    return { type: "delay", delay: delayMs / 1e3, animation };
  }
  function interpolate(value, input, output) {
    return { type: "interpolate", id: value.id, input, output };
  }
  function interpolateColor(value, input, output) {
    return {
      type: "interpolateColor",
      id: value.id,
      input,
      output: output.map(hexToRgba)
    };
  }
  function cancelAnimation(value) {
    animate({ kind: "cancel", id: value.id });
  }
  function hexToRgba(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3) {
      h = h.split("").map((c) => c + c).join("");
    }
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  function host(type) {
    return (props) => (0, import_react.createElement)(type, props);
  }
  var Animated = {
    node: host("node"),
    button: host("button"),
    image: host("image"),
    text: host("text")
  };

  // ../../../js/src/anchored.ts
  var import_react2 = __toESM(require_react(), 1);
  function anchored(type) {
    return (props) => {
      const { entity, offset, scale, ...rest } = props;
      return (0, import_react2.createElement)(type, {
        ...rest,
        anchor: { entity: Number(entity), offset, scale }
      });
    };
  }
  var Anchored = {
    node: anchored("node"),
    button: anchored("button"),
    image: anchored("image"),
    text: anchored("text")
  };

  // ../../../js/src/jsx-runtime.ts
  var jsx_runtime_exports = {};
  __export(jsx_runtime_exports, {
    Fragment: () => import_jsx_runtime.Fragment,
    jsx: () => import_jsx_runtime.jsx,
    jsxs: () => import_jsx_runtime.jsxs
  });
  var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);

  // ../../../js/src/jsx-dev-runtime.ts
  var jsx_dev_runtime_exports = {};
  __export(jsx_dev_runtime_exports, {
    Fragment: () => import_jsx_dev_runtime.Fragment,
    jsxDEV: () => import_jsx_dev_runtime.jsxDEV
  });
  var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);

  // <stdin>
  globalThis.__bevyVendor = {
    "react": _m0,
    "react/jsx-runtime": _m1,
    "react/jsx-dev-runtime": _m2,
    "bevy-react": src_exports,
    "bevy-react/jsx-runtime": jsx_runtime_exports,
    "bevy-react/jsx-dev-runtime": jsx_dev_runtime_exports
  };
})();
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-dev-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-dev-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.min.js:
  (**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-reconciler/cjs/react-reconciler.production.min.js:
  (**
   * @license React
   * react-reconciler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-reconciler/cjs/react-reconciler-constants.production.min.js:
  (**
   * @license React
   * react-reconciler-constants.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0L2Nqcy9yZWFjdC5wcm9kdWN0aW9uLm1pbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0L2Nqcy9yZWFjdC1qc3gtcnVudGltZS5wcm9kdWN0aW9uLm1pbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QvanN4LXJ1bnRpbWUuanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0L2Nqcy9yZWFjdC1qc3gtZGV2LXJ1bnRpbWUucHJvZHVjdGlvbi5taW4uanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0L2pzeC1kZXYtcnVudGltZS5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvc2NoZWR1bGVyL2Nqcy9zY2hlZHVsZXIucHJvZHVjdGlvbi5taW4uanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3NjaGVkdWxlci9pbmRleC5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QtcmVjb25jaWxlci9janMvcmVhY3QtcmVjb25jaWxlci5wcm9kdWN0aW9uLm1pbi5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QtcmVjb25jaWxlci9pbmRleC5qcyIsICIuLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3QtcmVjb25jaWxlci9janMvcmVhY3QtcmVjb25jaWxlci1jb25zdGFudHMucHJvZHVjdGlvbi5taW4uanMiLCAiLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0LXJlY29uY2lsZXIvY29uc3RhbnRzLmpzIiwgInJlYWN0LXJlZnJlc2gtc3R1YjpyZWFjdC1yZWZyZXNoL3J1bnRpbWUiLCAiPHN0ZGluPiIsICIuLi8uLi8uLi8uLi9qcy9zcmMvaW5kZXgudHMiLCAiLi4vLi4vLi4vLi4vanMvc3JjL2NhbnZhcy50cyIsICIuLi8uLi8uLi8uLi9qcy9zcmMvYnJpZGdlLnRzIiwgIi4uLy4uLy4uLy4uL2pzL3NyYy9yZW5kZXJlci50cyIsICIuLi8uLi8uLi8uLi9qcy9zcmMvaG1yLnRzIiwgIi4uLy4uLy4uLy4uL2pzL3NyYy9tb3VudC50cyIsICIuLi8uLi8uLi8uLi9qcy9zcmMvYW5pbWF0ZWQudHMiLCAiLi4vLi4vLi4vLi4vanMvc3JjL2FuY2hvcmVkLnRzIiwgIi4uLy4uLy4uLy4uL2pzL3NyYy9qc3gtcnVudGltZS50cyIsICIuLi8uLi8uLi8uLi9qcy9zcmMvanN4LWRldi1ydW50aW1lLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEBsaWNlbnNlIFJlYWN0XG4gKiByZWFjdC5wcm9kdWN0aW9uLm1pbi5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7dmFyIGw9U3ltYm9sLmZvcihcInJlYWN0LmVsZW1lbnRcIiksbj1TeW1ib2wuZm9yKFwicmVhY3QucG9ydGFsXCIpLHA9U3ltYm9sLmZvcihcInJlYWN0LmZyYWdtZW50XCIpLHE9U3ltYm9sLmZvcihcInJlYWN0LnN0cmljdF9tb2RlXCIpLHI9U3ltYm9sLmZvcihcInJlYWN0LnByb2ZpbGVyXCIpLHQ9U3ltYm9sLmZvcihcInJlYWN0LnByb3ZpZGVyXCIpLHU9U3ltYm9sLmZvcihcInJlYWN0LmNvbnRleHRcIiksdj1TeW1ib2wuZm9yKFwicmVhY3QuZm9yd2FyZF9yZWZcIiksdz1TeW1ib2wuZm9yKFwicmVhY3Quc3VzcGVuc2VcIikseD1TeW1ib2wuZm9yKFwicmVhY3QubWVtb1wiKSx5PVN5bWJvbC5mb3IoXCJyZWFjdC5sYXp5XCIpLHo9U3ltYm9sLml0ZXJhdG9yO2Z1bmN0aW9uIEEoYSl7aWYobnVsbD09PWF8fFwib2JqZWN0XCIhPT10eXBlb2YgYSlyZXR1cm4gbnVsbDthPXomJmFbel18fGFbXCJAQGl0ZXJhdG9yXCJdO3JldHVyblwiZnVuY3Rpb25cIj09PXR5cGVvZiBhP2E6bnVsbH1cbnZhciBCPXtpc01vdW50ZWQ6ZnVuY3Rpb24oKXtyZXR1cm4hMX0sZW5xdWV1ZUZvcmNlVXBkYXRlOmZ1bmN0aW9uKCl7fSxlbnF1ZXVlUmVwbGFjZVN0YXRlOmZ1bmN0aW9uKCl7fSxlbnF1ZXVlU2V0U3RhdGU6ZnVuY3Rpb24oKXt9fSxDPU9iamVjdC5hc3NpZ24sRD17fTtmdW5jdGlvbiBFKGEsYixlKXt0aGlzLnByb3BzPWE7dGhpcy5jb250ZXh0PWI7dGhpcy5yZWZzPUQ7dGhpcy51cGRhdGVyPWV8fEJ9RS5wcm90b3R5cGUuaXNSZWFjdENvbXBvbmVudD17fTtcbkUucHJvdG90eXBlLnNldFN0YXRlPWZ1bmN0aW9uKGEsYil7aWYoXCJvYmplY3RcIiE9PXR5cGVvZiBhJiZcImZ1bmN0aW9uXCIhPT10eXBlb2YgYSYmbnVsbCE9YSl0aHJvdyBFcnJvcihcInNldFN0YXRlKC4uLik6IHRha2VzIGFuIG9iamVjdCBvZiBzdGF0ZSB2YXJpYWJsZXMgdG8gdXBkYXRlIG9yIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhbiBvYmplY3Qgb2Ygc3RhdGUgdmFyaWFibGVzLlwiKTt0aGlzLnVwZGF0ZXIuZW5xdWV1ZVNldFN0YXRlKHRoaXMsYSxiLFwic2V0U3RhdGVcIil9O0UucHJvdG90eXBlLmZvcmNlVXBkYXRlPWZ1bmN0aW9uKGEpe3RoaXMudXBkYXRlci5lbnF1ZXVlRm9yY2VVcGRhdGUodGhpcyxhLFwiZm9yY2VVcGRhdGVcIil9O2Z1bmN0aW9uIEYoKXt9Ri5wcm90b3R5cGU9RS5wcm90b3R5cGU7ZnVuY3Rpb24gRyhhLGIsZSl7dGhpcy5wcm9wcz1hO3RoaXMuY29udGV4dD1iO3RoaXMucmVmcz1EO3RoaXMudXBkYXRlcj1lfHxCfXZhciBIPUcucHJvdG90eXBlPW5ldyBGO1xuSC5jb25zdHJ1Y3Rvcj1HO0MoSCxFLnByb3RvdHlwZSk7SC5pc1B1cmVSZWFjdENvbXBvbmVudD0hMDt2YXIgST1BcnJheS5pc0FycmF5LEo9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxLPXtjdXJyZW50Om51bGx9LEw9e2tleTohMCxyZWY6ITAsX19zZWxmOiEwLF9fc291cmNlOiEwfTtcbmZ1bmN0aW9uIE0oYSxiLGUpe3ZhciBkLGM9e30saz1udWxsLGg9bnVsbDtpZihudWxsIT1iKWZvcihkIGluIHZvaWQgMCE9PWIucmVmJiYoaD1iLnJlZiksdm9pZCAwIT09Yi5rZXkmJihrPVwiXCIrYi5rZXkpLGIpSi5jYWxsKGIsZCkmJiFMLmhhc093blByb3BlcnR5KGQpJiYoY1tkXT1iW2RdKTt2YXIgZz1hcmd1bWVudHMubGVuZ3RoLTI7aWYoMT09PWcpYy5jaGlsZHJlbj1lO2Vsc2UgaWYoMTxnKXtmb3IodmFyIGY9QXJyYXkoZyksbT0wO208ZzttKyspZlttXT1hcmd1bWVudHNbbSsyXTtjLmNoaWxkcmVuPWZ9aWYoYSYmYS5kZWZhdWx0UHJvcHMpZm9yKGQgaW4gZz1hLmRlZmF1bHRQcm9wcyxnKXZvaWQgMD09PWNbZF0mJihjW2RdPWdbZF0pO3JldHVybnskJHR5cGVvZjpsLHR5cGU6YSxrZXk6ayxyZWY6aCxwcm9wczpjLF9vd25lcjpLLmN1cnJlbnR9fVxuZnVuY3Rpb24gTihhLGIpe3JldHVybnskJHR5cGVvZjpsLHR5cGU6YS50eXBlLGtleTpiLHJlZjphLnJlZixwcm9wczphLnByb3BzLF9vd25lcjphLl9vd25lcn19ZnVuY3Rpb24gTyhhKXtyZXR1cm5cIm9iamVjdFwiPT09dHlwZW9mIGEmJm51bGwhPT1hJiZhLiQkdHlwZW9mPT09bH1mdW5jdGlvbiBlc2NhcGUoYSl7dmFyIGI9e1wiPVwiOlwiPTBcIixcIjpcIjpcIj0yXCJ9O3JldHVyblwiJFwiK2EucmVwbGFjZSgvWz06XS9nLGZ1bmN0aW9uKGEpe3JldHVybiBiW2FdfSl9dmFyIFA9L1xcLysvZztmdW5jdGlvbiBRKGEsYil7cmV0dXJuXCJvYmplY3RcIj09PXR5cGVvZiBhJiZudWxsIT09YSYmbnVsbCE9YS5rZXk/ZXNjYXBlKFwiXCIrYS5rZXkpOmIudG9TdHJpbmcoMzYpfVxuZnVuY3Rpb24gUihhLGIsZSxkLGMpe3ZhciBrPXR5cGVvZiBhO2lmKFwidW5kZWZpbmVkXCI9PT1rfHxcImJvb2xlYW5cIj09PWspYT1udWxsO3ZhciBoPSExO2lmKG51bGw9PT1hKWg9ITA7ZWxzZSBzd2l0Y2goayl7Y2FzZSBcInN0cmluZ1wiOmNhc2UgXCJudW1iZXJcIjpoPSEwO2JyZWFrO2Nhc2UgXCJvYmplY3RcIjpzd2l0Y2goYS4kJHR5cGVvZil7Y2FzZSBsOmNhc2UgbjpoPSEwfX1pZihoKXJldHVybiBoPWEsYz1jKGgpLGE9XCJcIj09PWQ/XCIuXCIrUShoLDApOmQsSShjKT8oZT1cIlwiLG51bGwhPWEmJihlPWEucmVwbGFjZShQLFwiJCYvXCIpK1wiL1wiKSxSKGMsYixlLFwiXCIsZnVuY3Rpb24oYSl7cmV0dXJuIGF9KSk6bnVsbCE9YyYmKE8oYykmJihjPU4oYyxlKyghYy5rZXl8fGgmJmgua2V5PT09Yy5rZXk/XCJcIjooXCJcIitjLmtleSkucmVwbGFjZShQLFwiJCYvXCIpK1wiL1wiKSthKSksYi5wdXNoKGMpKSwxO2g9MDtkPVwiXCI9PT1kP1wiLlwiOmQrXCI6XCI7aWYoSShhKSlmb3IodmFyIGc9MDtnPGEubGVuZ3RoO2crKyl7az1cbmFbZ107dmFyIGY9ZCtRKGssZyk7aCs9UihrLGIsZSxmLGMpfWVsc2UgaWYoZj1BKGEpLFwiZnVuY3Rpb25cIj09PXR5cGVvZiBmKWZvcihhPWYuY2FsbChhKSxnPTA7IShrPWEubmV4dCgpKS5kb25lOylrPWsudmFsdWUsZj1kK1EoayxnKyspLGgrPVIoayxiLGUsZixjKTtlbHNlIGlmKFwib2JqZWN0XCI9PT1rKXRocm93IGI9U3RyaW5nKGEpLEVycm9yKFwiT2JqZWN0cyBhcmUgbm90IHZhbGlkIGFzIGEgUmVhY3QgY2hpbGQgKGZvdW5kOiBcIisoXCJbb2JqZWN0IE9iamVjdF1cIj09PWI/XCJvYmplY3Qgd2l0aCBrZXlzIHtcIitPYmplY3Qua2V5cyhhKS5qb2luKFwiLCBcIikrXCJ9XCI6YikrXCIpLiBJZiB5b3UgbWVhbnQgdG8gcmVuZGVyIGEgY29sbGVjdGlvbiBvZiBjaGlsZHJlbiwgdXNlIGFuIGFycmF5IGluc3RlYWQuXCIpO3JldHVybiBofVxuZnVuY3Rpb24gUyhhLGIsZSl7aWYobnVsbD09YSlyZXR1cm4gYTt2YXIgZD1bXSxjPTA7UihhLGQsXCJcIixcIlwiLGZ1bmN0aW9uKGEpe3JldHVybiBiLmNhbGwoZSxhLGMrKyl9KTtyZXR1cm4gZH1mdW5jdGlvbiBUKGEpe2lmKC0xPT09YS5fc3RhdHVzKXt2YXIgYj1hLl9yZXN1bHQ7Yj1iKCk7Yi50aGVuKGZ1bmN0aW9uKGIpe2lmKDA9PT1hLl9zdGF0dXN8fC0xPT09YS5fc3RhdHVzKWEuX3N0YXR1cz0xLGEuX3Jlc3VsdD1ifSxmdW5jdGlvbihiKXtpZigwPT09YS5fc3RhdHVzfHwtMT09PWEuX3N0YXR1cylhLl9zdGF0dXM9MixhLl9yZXN1bHQ9Yn0pOy0xPT09YS5fc3RhdHVzJiYoYS5fc3RhdHVzPTAsYS5fcmVzdWx0PWIpfWlmKDE9PT1hLl9zdGF0dXMpcmV0dXJuIGEuX3Jlc3VsdC5kZWZhdWx0O3Rocm93IGEuX3Jlc3VsdDt9XG52YXIgVT17Y3VycmVudDpudWxsfSxWPXt0cmFuc2l0aW9uOm51bGx9LFc9e1JlYWN0Q3VycmVudERpc3BhdGNoZXI6VSxSZWFjdEN1cnJlbnRCYXRjaENvbmZpZzpWLFJlYWN0Q3VycmVudE93bmVyOkt9O2Z1bmN0aW9uIFgoKXt0aHJvdyBFcnJvcihcImFjdCguLi4pIGlzIG5vdCBzdXBwb3J0ZWQgaW4gcHJvZHVjdGlvbiBidWlsZHMgb2YgUmVhY3QuXCIpO31cbmV4cG9ydHMuQ2hpbGRyZW49e21hcDpTLGZvckVhY2g6ZnVuY3Rpb24oYSxiLGUpe1MoYSxmdW5jdGlvbigpe2IuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxlKX0sY291bnQ6ZnVuY3Rpb24oYSl7dmFyIGI9MDtTKGEsZnVuY3Rpb24oKXtiKyt9KTtyZXR1cm4gYn0sdG9BcnJheTpmdW5jdGlvbihhKXtyZXR1cm4gUyhhLGZ1bmN0aW9uKGEpe3JldHVybiBhfSl8fFtdfSxvbmx5OmZ1bmN0aW9uKGEpe2lmKCFPKGEpKXRocm93IEVycm9yKFwiUmVhY3QuQ2hpbGRyZW4ub25seSBleHBlY3RlZCB0byByZWNlaXZlIGEgc2luZ2xlIFJlYWN0IGVsZW1lbnQgY2hpbGQuXCIpO3JldHVybiBhfX07ZXhwb3J0cy5Db21wb25lbnQ9RTtleHBvcnRzLkZyYWdtZW50PXA7ZXhwb3J0cy5Qcm9maWxlcj1yO2V4cG9ydHMuUHVyZUNvbXBvbmVudD1HO2V4cG9ydHMuU3RyaWN0TW9kZT1xO2V4cG9ydHMuU3VzcGVuc2U9dztcbmV4cG9ydHMuX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQ9VztleHBvcnRzLmFjdD1YO1xuZXhwb3J0cy5jbG9uZUVsZW1lbnQ9ZnVuY3Rpb24oYSxiLGUpe2lmKG51bGw9PT1hfHx2b2lkIDA9PT1hKXRocm93IEVycm9yKFwiUmVhY3QuY2xvbmVFbGVtZW50KC4uLik6IFRoZSBhcmd1bWVudCBtdXN0IGJlIGEgUmVhY3QgZWxlbWVudCwgYnV0IHlvdSBwYXNzZWQgXCIrYStcIi5cIik7dmFyIGQ9Qyh7fSxhLnByb3BzKSxjPWEua2V5LGs9YS5yZWYsaD1hLl9vd25lcjtpZihudWxsIT1iKXt2b2lkIDAhPT1iLnJlZiYmKGs9Yi5yZWYsaD1LLmN1cnJlbnQpO3ZvaWQgMCE9PWIua2V5JiYoYz1cIlwiK2Iua2V5KTtpZihhLnR5cGUmJmEudHlwZS5kZWZhdWx0UHJvcHMpdmFyIGc9YS50eXBlLmRlZmF1bHRQcm9wcztmb3IoZiBpbiBiKUouY2FsbChiLGYpJiYhTC5oYXNPd25Qcm9wZXJ0eShmKSYmKGRbZl09dm9pZCAwPT09YltmXSYmdm9pZCAwIT09Zz9nW2ZdOmJbZl0pfXZhciBmPWFyZ3VtZW50cy5sZW5ndGgtMjtpZigxPT09ZilkLmNoaWxkcmVuPWU7ZWxzZSBpZigxPGYpe2c9QXJyYXkoZik7XG5mb3IodmFyIG09MDttPGY7bSsrKWdbbV09YXJndW1lbnRzW20rMl07ZC5jaGlsZHJlbj1nfXJldHVybnskJHR5cGVvZjpsLHR5cGU6YS50eXBlLGtleTpjLHJlZjprLHByb3BzOmQsX293bmVyOmh9fTtleHBvcnRzLmNyZWF0ZUNvbnRleHQ9ZnVuY3Rpb24oYSl7YT17JCR0eXBlb2Y6dSxfY3VycmVudFZhbHVlOmEsX2N1cnJlbnRWYWx1ZTI6YSxfdGhyZWFkQ291bnQ6MCxQcm92aWRlcjpudWxsLENvbnN1bWVyOm51bGwsX2RlZmF1bHRWYWx1ZTpudWxsLF9nbG9iYWxOYW1lOm51bGx9O2EuUHJvdmlkZXI9eyQkdHlwZW9mOnQsX2NvbnRleHQ6YX07cmV0dXJuIGEuQ29uc3VtZXI9YX07ZXhwb3J0cy5jcmVhdGVFbGVtZW50PU07ZXhwb3J0cy5jcmVhdGVGYWN0b3J5PWZ1bmN0aW9uKGEpe3ZhciBiPU0uYmluZChudWxsLGEpO2IudHlwZT1hO3JldHVybiBifTtleHBvcnRzLmNyZWF0ZVJlZj1mdW5jdGlvbigpe3JldHVybntjdXJyZW50Om51bGx9fTtcbmV4cG9ydHMuZm9yd2FyZFJlZj1mdW5jdGlvbihhKXtyZXR1cm57JCR0eXBlb2Y6dixyZW5kZXI6YX19O2V4cG9ydHMuaXNWYWxpZEVsZW1lbnQ9TztleHBvcnRzLmxhenk9ZnVuY3Rpb24oYSl7cmV0dXJueyQkdHlwZW9mOnksX3BheWxvYWQ6e19zdGF0dXM6LTEsX3Jlc3VsdDphfSxfaW5pdDpUfX07ZXhwb3J0cy5tZW1vPWZ1bmN0aW9uKGEsYil7cmV0dXJueyQkdHlwZW9mOngsdHlwZTphLGNvbXBhcmU6dm9pZCAwPT09Yj9udWxsOmJ9fTtleHBvcnRzLnN0YXJ0VHJhbnNpdGlvbj1mdW5jdGlvbihhKXt2YXIgYj1WLnRyYW5zaXRpb247Vi50cmFuc2l0aW9uPXt9O3RyeXthKCl9ZmluYWxseXtWLnRyYW5zaXRpb249Yn19O2V4cG9ydHMudW5zdGFibGVfYWN0PVg7ZXhwb3J0cy51c2VDYWxsYmFjaz1mdW5jdGlvbihhLGIpe3JldHVybiBVLmN1cnJlbnQudXNlQ2FsbGJhY2soYSxiKX07ZXhwb3J0cy51c2VDb250ZXh0PWZ1bmN0aW9uKGEpe3JldHVybiBVLmN1cnJlbnQudXNlQ29udGV4dChhKX07XG5leHBvcnRzLnVzZURlYnVnVmFsdWU9ZnVuY3Rpb24oKXt9O2V4cG9ydHMudXNlRGVmZXJyZWRWYWx1ZT1mdW5jdGlvbihhKXtyZXR1cm4gVS5jdXJyZW50LnVzZURlZmVycmVkVmFsdWUoYSl9O2V4cG9ydHMudXNlRWZmZWN0PWZ1bmN0aW9uKGEsYil7cmV0dXJuIFUuY3VycmVudC51c2VFZmZlY3QoYSxiKX07ZXhwb3J0cy51c2VJZD1mdW5jdGlvbigpe3JldHVybiBVLmN1cnJlbnQudXNlSWQoKX07ZXhwb3J0cy51c2VJbXBlcmF0aXZlSGFuZGxlPWZ1bmN0aW9uKGEsYixlKXtyZXR1cm4gVS5jdXJyZW50LnVzZUltcGVyYXRpdmVIYW5kbGUoYSxiLGUpfTtleHBvcnRzLnVzZUluc2VydGlvbkVmZmVjdD1mdW5jdGlvbihhLGIpe3JldHVybiBVLmN1cnJlbnQudXNlSW5zZXJ0aW9uRWZmZWN0KGEsYil9O2V4cG9ydHMudXNlTGF5b3V0RWZmZWN0PWZ1bmN0aW9uKGEsYil7cmV0dXJuIFUuY3VycmVudC51c2VMYXlvdXRFZmZlY3QoYSxiKX07XG5leHBvcnRzLnVzZU1lbW89ZnVuY3Rpb24oYSxiKXtyZXR1cm4gVS5jdXJyZW50LnVzZU1lbW8oYSxiKX07ZXhwb3J0cy51c2VSZWR1Y2VyPWZ1bmN0aW9uKGEsYixlKXtyZXR1cm4gVS5jdXJyZW50LnVzZVJlZHVjZXIoYSxiLGUpfTtleHBvcnRzLnVzZVJlZj1mdW5jdGlvbihhKXtyZXR1cm4gVS5jdXJyZW50LnVzZVJlZihhKX07ZXhwb3J0cy51c2VTdGF0ZT1mdW5jdGlvbihhKXtyZXR1cm4gVS5jdXJyZW50LnVzZVN0YXRlKGEpfTtleHBvcnRzLnVzZVN5bmNFeHRlcm5hbFN0b3JlPWZ1bmN0aW9uKGEsYixlKXtyZXR1cm4gVS5jdXJyZW50LnVzZVN5bmNFeHRlcm5hbFN0b3JlKGEsYixlKX07ZXhwb3J0cy51c2VUcmFuc2l0aW9uPWZ1bmN0aW9uKCl7cmV0dXJuIFUuY3VycmVudC51c2VUcmFuc2l0aW9uKCl9O2V4cG9ydHMudmVyc2lvbj1cIjE4LjMuMVwiO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwgIi8qKlxuICogQGxpY2Vuc2UgUmVhY3RcbiAqIHJlYWN0LWpzeC1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cbid1c2Ugc3RyaWN0Jzt2YXIgZj1yZXF1aXJlKFwicmVhY3RcIiksaz1TeW1ib2wuZm9yKFwicmVhY3QuZWxlbWVudFwiKSxsPVN5bWJvbC5mb3IoXCJyZWFjdC5mcmFnbWVudFwiKSxtPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksbj1mLl9fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVELlJlYWN0Q3VycmVudE93bmVyLHA9e2tleTohMCxyZWY6ITAsX19zZWxmOiEwLF9fc291cmNlOiEwfTtcbmZ1bmN0aW9uIHEoYyxhLGcpe3ZhciBiLGQ9e30sZT1udWxsLGg9bnVsbDt2b2lkIDAhPT1nJiYoZT1cIlwiK2cpO3ZvaWQgMCE9PWEua2V5JiYoZT1cIlwiK2Eua2V5KTt2b2lkIDAhPT1hLnJlZiYmKGg9YS5yZWYpO2ZvcihiIGluIGEpbS5jYWxsKGEsYikmJiFwLmhhc093blByb3BlcnR5KGIpJiYoZFtiXT1hW2JdKTtpZihjJiZjLmRlZmF1bHRQcm9wcylmb3IoYiBpbiBhPWMuZGVmYXVsdFByb3BzLGEpdm9pZCAwPT09ZFtiXSYmKGRbYl09YVtiXSk7cmV0dXJueyQkdHlwZW9mOmssdHlwZTpjLGtleTplLHJlZjpoLHByb3BzOmQsX293bmVyOm4uY3VycmVudH19ZXhwb3J0cy5GcmFnbWVudD1sO2V4cG9ydHMuanN4PXE7ZXhwb3J0cy5qc3hzPXE7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3JlYWN0LWpzeC1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3JlYWN0LWpzeC1ydW50aW1lLmRldmVsb3BtZW50LmpzJyk7XG59XG4iLCAiLyoqXG4gKiBAbGljZW5zZSBSZWFjdFxuICogcmVhY3QtanN4LWRldi1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cbid1c2Ugc3RyaWN0Jzt2YXIgYT1TeW1ib2wuZm9yKFwicmVhY3QuZnJhZ21lbnRcIik7ZXhwb3J0cy5GcmFnbWVudD1hO2V4cG9ydHMuanN4REVWPXZvaWQgMDtcbiIsICIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtanN4LWRldi1ydW50aW1lLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3JlYWN0LWpzeC1kZXYtcnVudGltZS5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwgIi8qKlxuICogQGxpY2Vuc2UgUmVhY3RcbiAqIHNjaGVkdWxlci5wcm9kdWN0aW9uLm1pbi5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG4ndXNlIHN0cmljdCc7ZnVuY3Rpb24gZihhLGIpe3ZhciBjPWEubGVuZ3RoO2EucHVzaChiKTthOmZvcig7MDxjOyl7dmFyIGQ9Yy0xPj4+MSxlPWFbZF07aWYoMDxnKGUsYikpYVtkXT1iLGFbY109ZSxjPWQ7ZWxzZSBicmVhayBhfX1mdW5jdGlvbiBoKGEpe3JldHVybiAwPT09YS5sZW5ndGg/bnVsbDphWzBdfWZ1bmN0aW9uIGsoYSl7aWYoMD09PWEubGVuZ3RoKXJldHVybiBudWxsO3ZhciBiPWFbMF0sYz1hLnBvcCgpO2lmKGMhPT1iKXthWzBdPWM7YTpmb3IodmFyIGQ9MCxlPWEubGVuZ3RoLHc9ZT4+PjE7ZDx3Oyl7dmFyIG09MiooZCsxKS0xLEM9YVttXSxuPW0rMSx4PWFbbl07aWYoMD5nKEMsYykpbjxlJiYwPmcoeCxDKT8oYVtkXT14LGFbbl09YyxkPW4pOihhW2RdPUMsYVttXT1jLGQ9bSk7ZWxzZSBpZihuPGUmJjA+Zyh4LGMpKWFbZF09eCxhW25dPWMsZD1uO2Vsc2UgYnJlYWsgYX19cmV0dXJuIGJ9XG5mdW5jdGlvbiBnKGEsYil7dmFyIGM9YS5zb3J0SW5kZXgtYi5zb3J0SW5kZXg7cmV0dXJuIDAhPT1jP2M6YS5pZC1iLmlkfWlmKFwib2JqZWN0XCI9PT10eXBlb2YgcGVyZm9ybWFuY2UmJlwiZnVuY3Rpb25cIj09PXR5cGVvZiBwZXJmb3JtYW5jZS5ub3cpe3ZhciBsPXBlcmZvcm1hbmNlO2V4cG9ydHMudW5zdGFibGVfbm93PWZ1bmN0aW9uKCl7cmV0dXJuIGwubm93KCl9fWVsc2V7dmFyIHA9RGF0ZSxxPXAubm93KCk7ZXhwb3J0cy51bnN0YWJsZV9ub3c9ZnVuY3Rpb24oKXtyZXR1cm4gcC5ub3coKS1xfX12YXIgcj1bXSx0PVtdLHU9MSx2PW51bGwseT0zLHo9ITEsQT0hMSxCPSExLEQ9XCJmdW5jdGlvblwiPT09dHlwZW9mIHNldFRpbWVvdXQ/c2V0VGltZW91dDpudWxsLEU9XCJmdW5jdGlvblwiPT09dHlwZW9mIGNsZWFyVGltZW91dD9jbGVhclRpbWVvdXQ6bnVsbCxGPVwidW5kZWZpbmVkXCIhPT10eXBlb2Ygc2V0SW1tZWRpYXRlP3NldEltbWVkaWF0ZTpudWxsO1xuXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBuYXZpZ2F0b3ImJnZvaWQgMCE9PW5hdmlnYXRvci5zY2hlZHVsaW5nJiZ2b2lkIDAhPT1uYXZpZ2F0b3Iuc2NoZWR1bGluZy5pc0lucHV0UGVuZGluZyYmbmF2aWdhdG9yLnNjaGVkdWxpbmcuaXNJbnB1dFBlbmRpbmcuYmluZChuYXZpZ2F0b3Iuc2NoZWR1bGluZyk7ZnVuY3Rpb24gRyhhKXtmb3IodmFyIGI9aCh0KTtudWxsIT09Yjspe2lmKG51bGw9PT1iLmNhbGxiYWNrKWsodCk7ZWxzZSBpZihiLnN0YXJ0VGltZTw9YSlrKHQpLGIuc29ydEluZGV4PWIuZXhwaXJhdGlvblRpbWUsZihyLGIpO2Vsc2UgYnJlYWs7Yj1oKHQpfX1mdW5jdGlvbiBIKGEpe0I9ITE7RyhhKTtpZighQSlpZihudWxsIT09aChyKSlBPSEwLEkoSik7ZWxzZXt2YXIgYj1oKHQpO251bGwhPT1iJiZLKEgsYi5zdGFydFRpbWUtYSl9fVxuZnVuY3Rpb24gSihhLGIpe0E9ITE7QiYmKEI9ITEsRShMKSxMPS0xKTt6PSEwO3ZhciBjPXk7dHJ5e0coYik7Zm9yKHY9aChyKTtudWxsIT09diYmKCEodi5leHBpcmF0aW9uVGltZT5iKXx8YSYmIU0oKSk7KXt2YXIgZD12LmNhbGxiYWNrO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBkKXt2LmNhbGxiYWNrPW51bGw7eT12LnByaW9yaXR5TGV2ZWw7dmFyIGU9ZCh2LmV4cGlyYXRpb25UaW1lPD1iKTtiPWV4cG9ydHMudW5zdGFibGVfbm93KCk7XCJmdW5jdGlvblwiPT09dHlwZW9mIGU/di5jYWxsYmFjaz1lOnY9PT1oKHIpJiZrKHIpO0coYil9ZWxzZSBrKHIpO3Y9aChyKX1pZihudWxsIT09dil2YXIgdz0hMDtlbHNle3ZhciBtPWgodCk7bnVsbCE9PW0mJksoSCxtLnN0YXJ0VGltZS1iKTt3PSExfXJldHVybiB3fWZpbmFsbHl7dj1udWxsLHk9Yyx6PSExfX12YXIgTj0hMSxPPW51bGwsTD0tMSxQPTUsUT0tMTtcbmZ1bmN0aW9uIE0oKXtyZXR1cm4gZXhwb3J0cy51bnN0YWJsZV9ub3coKS1RPFA/ITE6ITB9ZnVuY3Rpb24gUigpe2lmKG51bGwhPT1PKXt2YXIgYT1leHBvcnRzLnVuc3RhYmxlX25vdygpO1E9YTt2YXIgYj0hMDt0cnl7Yj1PKCEwLGEpfWZpbmFsbHl7Yj9TKCk6KE49ITEsTz1udWxsKX19ZWxzZSBOPSExfXZhciBTO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBGKVM9ZnVuY3Rpb24oKXtGKFIpfTtlbHNlIGlmKFwidW5kZWZpbmVkXCIhPT10eXBlb2YgTWVzc2FnZUNoYW5uZWwpe3ZhciBUPW5ldyBNZXNzYWdlQ2hhbm5lbCxVPVQucG9ydDI7VC5wb3J0MS5vbm1lc3NhZ2U9UjtTPWZ1bmN0aW9uKCl7VS5wb3N0TWVzc2FnZShudWxsKX19ZWxzZSBTPWZ1bmN0aW9uKCl7RChSLDApfTtmdW5jdGlvbiBJKGEpe089YTtOfHwoTj0hMCxTKCkpfWZ1bmN0aW9uIEsoYSxiKXtMPUQoZnVuY3Rpb24oKXthKGV4cG9ydHMudW5zdGFibGVfbm93KCkpfSxiKX1cbmV4cG9ydHMudW5zdGFibGVfSWRsZVByaW9yaXR5PTU7ZXhwb3J0cy51bnN0YWJsZV9JbW1lZGlhdGVQcmlvcml0eT0xO2V4cG9ydHMudW5zdGFibGVfTG93UHJpb3JpdHk9NDtleHBvcnRzLnVuc3RhYmxlX05vcm1hbFByaW9yaXR5PTM7ZXhwb3J0cy51bnN0YWJsZV9Qcm9maWxpbmc9bnVsbDtleHBvcnRzLnVuc3RhYmxlX1VzZXJCbG9ja2luZ1ByaW9yaXR5PTI7ZXhwb3J0cy51bnN0YWJsZV9jYW5jZWxDYWxsYmFjaz1mdW5jdGlvbihhKXthLmNhbGxiYWNrPW51bGx9O2V4cG9ydHMudW5zdGFibGVfY29udGludWVFeGVjdXRpb249ZnVuY3Rpb24oKXtBfHx6fHwoQT0hMCxJKEopKX07XG5leHBvcnRzLnVuc3RhYmxlX2ZvcmNlRnJhbWVSYXRlPWZ1bmN0aW9uKGEpezA+YXx8MTI1PGE/Y29uc29sZS5lcnJvcihcImZvcmNlRnJhbWVSYXRlIHRha2VzIGEgcG9zaXRpdmUgaW50IGJldHdlZW4gMCBhbmQgMTI1LCBmb3JjaW5nIGZyYW1lIHJhdGVzIGhpZ2hlciB0aGFuIDEyNSBmcHMgaXMgbm90IHN1cHBvcnRlZFwiKTpQPTA8YT9NYXRoLmZsb29yKDFFMy9hKTo1fTtleHBvcnRzLnVuc3RhYmxlX2dldEN1cnJlbnRQcmlvcml0eUxldmVsPWZ1bmN0aW9uKCl7cmV0dXJuIHl9O2V4cG9ydHMudW5zdGFibGVfZ2V0Rmlyc3RDYWxsYmFja05vZGU9ZnVuY3Rpb24oKXtyZXR1cm4gaChyKX07ZXhwb3J0cy51bnN0YWJsZV9uZXh0PWZ1bmN0aW9uKGEpe3N3aXRjaCh5KXtjYXNlIDE6Y2FzZSAyOmNhc2UgMzp2YXIgYj0zO2JyZWFrO2RlZmF1bHQ6Yj15fXZhciBjPXk7eT1iO3RyeXtyZXR1cm4gYSgpfWZpbmFsbHl7eT1jfX07ZXhwb3J0cy51bnN0YWJsZV9wYXVzZUV4ZWN1dGlvbj1mdW5jdGlvbigpe307XG5leHBvcnRzLnVuc3RhYmxlX3JlcXVlc3RQYWludD1mdW5jdGlvbigpe307ZXhwb3J0cy51bnN0YWJsZV9ydW5XaXRoUHJpb3JpdHk9ZnVuY3Rpb24oYSxiKXtzd2l0Y2goYSl7Y2FzZSAxOmNhc2UgMjpjYXNlIDM6Y2FzZSA0OmNhc2UgNTpicmVhaztkZWZhdWx0OmE9M312YXIgYz15O3k9YTt0cnl7cmV0dXJuIGIoKX1maW5hbGx5e3k9Y319O1xuZXhwb3J0cy51bnN0YWJsZV9zY2hlZHVsZUNhbGxiYWNrPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1leHBvcnRzLnVuc3RhYmxlX25vdygpO1wib2JqZWN0XCI9PT10eXBlb2YgYyYmbnVsbCE9PWM/KGM9Yy5kZWxheSxjPVwibnVtYmVyXCI9PT10eXBlb2YgYyYmMDxjP2QrYzpkKTpjPWQ7c3dpdGNoKGEpe2Nhc2UgMTp2YXIgZT0tMTticmVhaztjYXNlIDI6ZT0yNTA7YnJlYWs7Y2FzZSA1OmU9MTA3Mzc0MTgyMzticmVhaztjYXNlIDQ6ZT0xRTQ7YnJlYWs7ZGVmYXVsdDplPTVFM31lPWMrZTthPXtpZDp1KyssY2FsbGJhY2s6Yixwcmlvcml0eUxldmVsOmEsc3RhcnRUaW1lOmMsZXhwaXJhdGlvblRpbWU6ZSxzb3J0SW5kZXg6LTF9O2M+ZD8oYS5zb3J0SW5kZXg9YyxmKHQsYSksbnVsbD09PWgocikmJmE9PT1oKHQpJiYoQj8oRShMKSxMPS0xKTpCPSEwLEsoSCxjLWQpKSk6KGEuc29ydEluZGV4PWUsZihyLGEpLEF8fHp8fChBPSEwLEkoSikpKTtyZXR1cm4gYX07XG5leHBvcnRzLnVuc3RhYmxlX3Nob3VsZFlpZWxkPU07ZXhwb3J0cy51bnN0YWJsZV93cmFwQ2FsbGJhY2s9ZnVuY3Rpb24oYSl7dmFyIGI9eTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYz15O3k9Yjt0cnl7cmV0dXJuIGEuYXBwbHkodGhpcyxhcmd1bWVudHMpfWZpbmFsbHl7eT1jfX19O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9zY2hlZHVsZXIucHJvZHVjdGlvbi5taW4uanMnKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvc2NoZWR1bGVyLmRldmVsb3BtZW50LmpzJyk7XG59XG4iLCAiLyoqXG4gKiBAbGljZW5zZSBSZWFjdFxuICogcmVhY3QtcmVjb25jaWxlci5wcm9kdWN0aW9uLm1pbi5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICQkJHJlY29uY2lsZXIoJCQkaG9zdENvbmZpZykge1xuICAgIHZhciBleHBvcnRzID0ge307XG4ndXNlIHN0cmljdCc7dmFyIGFhPXJlcXVpcmUoXCJyZWFjdFwiKSxiYT1yZXF1aXJlKFwic2NoZWR1bGVyXCIpLGNhPU9iamVjdC5hc3NpZ247ZnVuY3Rpb24gbihhKXtmb3IodmFyIGI9XCJodHRwczovL3JlYWN0anMub3JnL2RvY3MvZXJyb3ItZGVjb2Rlci5odG1sP2ludmFyaWFudD1cIithLGM9MTtjPGFyZ3VtZW50cy5sZW5ndGg7YysrKWIrPVwiJmFyZ3NbXT1cIitlbmNvZGVVUklDb21wb25lbnQoYXJndW1lbnRzW2NdKTtyZXR1cm5cIk1pbmlmaWVkIFJlYWN0IGVycm9yICNcIithK1wiOyB2aXNpdCBcIitiK1wiIGZvciB0aGUgZnVsbCBtZXNzYWdlIG9yIHVzZSB0aGUgbm9uLW1pbmlmaWVkIGRldiBlbnZpcm9ubWVudCBmb3IgZnVsbCBlcnJvcnMgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy5cIn1cbnZhciBkYT1hYS5fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRCxlYT1TeW1ib2wuZm9yKFwicmVhY3QuZWxlbWVudFwiKSxmYT1TeW1ib2wuZm9yKFwicmVhY3QucG9ydGFsXCIpLGhhPVN5bWJvbC5mb3IoXCJyZWFjdC5mcmFnbWVudFwiKSxpYT1TeW1ib2wuZm9yKFwicmVhY3Quc3RyaWN0X21vZGVcIiksamE9U3ltYm9sLmZvcihcInJlYWN0LnByb2ZpbGVyXCIpLGthPVN5bWJvbC5mb3IoXCJyZWFjdC5wcm92aWRlclwiKSxsYT1TeW1ib2wuZm9yKFwicmVhY3QuY29udGV4dFwiKSxtYT1TeW1ib2wuZm9yKFwicmVhY3QuZm9yd2FyZF9yZWZcIiksbmE9U3ltYm9sLmZvcihcInJlYWN0LnN1c3BlbnNlXCIpLG9hPVN5bWJvbC5mb3IoXCJyZWFjdC5zdXNwZW5zZV9saXN0XCIpLHBhPVN5bWJvbC5mb3IoXCJyZWFjdC5tZW1vXCIpLHFhPVN5bWJvbC5mb3IoXCJyZWFjdC5sYXp5XCIpO1N5bWJvbC5mb3IoXCJyZWFjdC5zY29wZVwiKTtTeW1ib2wuZm9yKFwicmVhY3QuZGVidWdfdHJhY2VfbW9kZVwiKTtcbnZhciByYT1TeW1ib2wuZm9yKFwicmVhY3Qub2Zmc2NyZWVuXCIpO1N5bWJvbC5mb3IoXCJyZWFjdC5sZWdhY3lfaGlkZGVuXCIpO1N5bWJvbC5mb3IoXCJyZWFjdC5jYWNoZVwiKTtTeW1ib2wuZm9yKFwicmVhY3QudHJhY2luZ19tYXJrZXJcIik7dmFyIHNhPVN5bWJvbC5pdGVyYXRvcjtmdW5jdGlvbiB0YShhKXtpZihudWxsPT09YXx8XCJvYmplY3RcIiE9PXR5cGVvZiBhKXJldHVybiBudWxsO2E9c2EmJmFbc2FdfHxhW1wiQEBpdGVyYXRvclwiXTtyZXR1cm5cImZ1bmN0aW9uXCI9PT10eXBlb2YgYT9hOm51bGx9XG5mdW5jdGlvbiB1YShhKXtpZihudWxsPT1hKXJldHVybiBudWxsO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBhKXJldHVybiBhLmRpc3BsYXlOYW1lfHxhLm5hbWV8fG51bGw7aWYoXCJzdHJpbmdcIj09PXR5cGVvZiBhKXJldHVybiBhO3N3aXRjaChhKXtjYXNlIGhhOnJldHVyblwiRnJhZ21lbnRcIjtjYXNlIGZhOnJldHVyblwiUG9ydGFsXCI7Y2FzZSBqYTpyZXR1cm5cIlByb2ZpbGVyXCI7Y2FzZSBpYTpyZXR1cm5cIlN0cmljdE1vZGVcIjtjYXNlIG5hOnJldHVyblwiU3VzcGVuc2VcIjtjYXNlIG9hOnJldHVyblwiU3VzcGVuc2VMaXN0XCJ9aWYoXCJvYmplY3RcIj09PXR5cGVvZiBhKXN3aXRjaChhLiQkdHlwZW9mKXtjYXNlIGxhOnJldHVybihhLmRpc3BsYXlOYW1lfHxcIkNvbnRleHRcIikrXCIuQ29uc3VtZXJcIjtjYXNlIGthOnJldHVybihhLl9jb250ZXh0LmRpc3BsYXlOYW1lfHxcIkNvbnRleHRcIikrXCIuUHJvdmlkZXJcIjtjYXNlIG1hOnZhciBiPWEucmVuZGVyO2E9YS5kaXNwbGF5TmFtZTthfHwoYT1iLmRpc3BsYXlOYW1lfHxcbmIubmFtZXx8XCJcIixhPVwiXCIhPT1hP1wiRm9yd2FyZFJlZihcIithK1wiKVwiOlwiRm9yd2FyZFJlZlwiKTtyZXR1cm4gYTtjYXNlIHBhOnJldHVybiBiPWEuZGlzcGxheU5hbWV8fG51bGwsbnVsbCE9PWI/Yjp1YShhLnR5cGUpfHxcIk1lbW9cIjtjYXNlIHFhOmI9YS5fcGF5bG9hZDthPWEuX2luaXQ7dHJ5e3JldHVybiB1YShhKGIpKX1jYXRjaChjKXt9fXJldHVybiBudWxsfVxuZnVuY3Rpb24gdmEoYSl7dmFyIGI9YS50eXBlO3N3aXRjaChhLnRhZyl7Y2FzZSAyNDpyZXR1cm5cIkNhY2hlXCI7Y2FzZSA5OnJldHVybihiLmRpc3BsYXlOYW1lfHxcIkNvbnRleHRcIikrXCIuQ29uc3VtZXJcIjtjYXNlIDEwOnJldHVybihiLl9jb250ZXh0LmRpc3BsYXlOYW1lfHxcIkNvbnRleHRcIikrXCIuUHJvdmlkZXJcIjtjYXNlIDE4OnJldHVyblwiRGVoeWRyYXRlZEZyYWdtZW50XCI7Y2FzZSAxMTpyZXR1cm4gYT1iLnJlbmRlcixhPWEuZGlzcGxheU5hbWV8fGEubmFtZXx8XCJcIixiLmRpc3BsYXlOYW1lfHwoXCJcIiE9PWE/XCJGb3J3YXJkUmVmKFwiK2ErXCIpXCI6XCJGb3J3YXJkUmVmXCIpO2Nhc2UgNzpyZXR1cm5cIkZyYWdtZW50XCI7Y2FzZSA1OnJldHVybiBiO2Nhc2UgNDpyZXR1cm5cIlBvcnRhbFwiO2Nhc2UgMzpyZXR1cm5cIlJvb3RcIjtjYXNlIDY6cmV0dXJuXCJUZXh0XCI7Y2FzZSAxNjpyZXR1cm4gdWEoYik7Y2FzZSA4OnJldHVybiBiPT09aWE/XCJTdHJpY3RNb2RlXCI6XCJNb2RlXCI7Y2FzZSAyMjpyZXR1cm5cIk9mZnNjcmVlblwiO1xuY2FzZSAxMjpyZXR1cm5cIlByb2ZpbGVyXCI7Y2FzZSAyMTpyZXR1cm5cIlNjb3BlXCI7Y2FzZSAxMzpyZXR1cm5cIlN1c3BlbnNlXCI7Y2FzZSAxOTpyZXR1cm5cIlN1c3BlbnNlTGlzdFwiO2Nhc2UgMjU6cmV0dXJuXCJUcmFjaW5nTWFya2VyXCI7Y2FzZSAxOmNhc2UgMDpjYXNlIDE3OmNhc2UgMjpjYXNlIDE0OmNhc2UgMTU6aWYoXCJmdW5jdGlvblwiPT09dHlwZW9mIGIpcmV0dXJuIGIuZGlzcGxheU5hbWV8fGIubmFtZXx8bnVsbDtpZihcInN0cmluZ1wiPT09dHlwZW9mIGIpcmV0dXJuIGJ9cmV0dXJuIG51bGx9ZnVuY3Rpb24gd2EoYSl7dmFyIGI9YSxjPWE7aWYoYS5hbHRlcm5hdGUpZm9yKDtiLnJldHVybjspYj1iLnJldHVybjtlbHNle2E9YjtkbyBiPWEsMCE9PShiLmZsYWdzJjQwOTgpJiYoYz1iLnJldHVybiksYT1iLnJldHVybjt3aGlsZShhKX1yZXR1cm4gMz09PWIudGFnP2M6bnVsbH1mdW5jdGlvbiB4YShhKXtpZih3YShhKSE9PWEpdGhyb3cgRXJyb3IobigxODgpKTt9XG5mdW5jdGlvbiB6YShhKXt2YXIgYj1hLmFsdGVybmF0ZTtpZighYil7Yj13YShhKTtpZihudWxsPT09Yil0aHJvdyBFcnJvcihuKDE4OCkpO3JldHVybiBiIT09YT9udWxsOmF9Zm9yKHZhciBjPWEsZD1iOzspe3ZhciBlPWMucmV0dXJuO2lmKG51bGw9PT1lKWJyZWFrO3ZhciBmPWUuYWx0ZXJuYXRlO2lmKG51bGw9PT1mKXtkPWUucmV0dXJuO2lmKG51bGwhPT1kKXtjPWQ7Y29udGludWV9YnJlYWt9aWYoZS5jaGlsZD09PWYuY2hpbGQpe2ZvcihmPWUuY2hpbGQ7Zjspe2lmKGY9PT1jKXJldHVybiB4YShlKSxhO2lmKGY9PT1kKXJldHVybiB4YShlKSxiO2Y9Zi5zaWJsaW5nfXRocm93IEVycm9yKG4oMTg4KSk7fWlmKGMucmV0dXJuIT09ZC5yZXR1cm4pYz1lLGQ9ZjtlbHNle2Zvcih2YXIgZz0hMSxoPWUuY2hpbGQ7aDspe2lmKGg9PT1jKXtnPSEwO2M9ZTtkPWY7YnJlYWt9aWYoaD09PWQpe2c9ITA7ZD1lO2M9ZjticmVha31oPWguc2libGluZ31pZighZyl7Zm9yKGg9Zi5jaGlsZDtoOyl7aWYoaD09PVxuYyl7Zz0hMDtjPWY7ZD1lO2JyZWFrfWlmKGg9PT1kKXtnPSEwO2Q9ZjtjPWU7YnJlYWt9aD1oLnNpYmxpbmd9aWYoIWcpdGhyb3cgRXJyb3IobigxODkpKTt9fWlmKGMuYWx0ZXJuYXRlIT09ZCl0aHJvdyBFcnJvcihuKDE5MCkpO31pZigzIT09Yy50YWcpdGhyb3cgRXJyb3IobigxODgpKTtyZXR1cm4gYy5zdGF0ZU5vZGUuY3VycmVudD09PWM/YTpifWZ1bmN0aW9uIEFhKGEpe2E9emEoYSk7cmV0dXJuIG51bGwhPT1hP0JhKGEpOm51bGx9ZnVuY3Rpb24gQmEoYSl7aWYoNT09PWEudGFnfHw2PT09YS50YWcpcmV0dXJuIGE7Zm9yKGE9YS5jaGlsZDtudWxsIT09YTspe3ZhciBiPUJhKGEpO2lmKG51bGwhPT1iKXJldHVybiBiO2E9YS5zaWJsaW5nfXJldHVybiBudWxsfVxuZnVuY3Rpb24gQ2EoYSl7aWYoNT09PWEudGFnfHw2PT09YS50YWcpcmV0dXJuIGE7Zm9yKGE9YS5jaGlsZDtudWxsIT09YTspe2lmKDQhPT1hLnRhZyl7dmFyIGI9Q2EoYSk7aWYobnVsbCE9PWIpcmV0dXJuIGJ9YT1hLnNpYmxpbmd9cmV0dXJuIG51bGx9XG52YXIgRGE9QXJyYXkuaXNBcnJheSxFYT0kJCRob3N0Q29uZmlnLmdldFB1YmxpY0luc3RhbmNlLEZhPSQkJGhvc3RDb25maWcuZ2V0Um9vdEhvc3RDb250ZXh0LEdhPSQkJGhvc3RDb25maWcuZ2V0Q2hpbGRIb3N0Q29udGV4dCxIYT0kJCRob3N0Q29uZmlnLnByZXBhcmVGb3JDb21taXQsSWE9JCQkaG9zdENvbmZpZy5yZXNldEFmdGVyQ29tbWl0LEphPSQkJGhvc3RDb25maWcuY3JlYXRlSW5zdGFuY2UsS2E9JCQkaG9zdENvbmZpZy5hcHBlbmRJbml0aWFsQ2hpbGQsTGE9JCQkaG9zdENvbmZpZy5maW5hbGl6ZUluaXRpYWxDaGlsZHJlbixNYT0kJCRob3N0Q29uZmlnLnByZXBhcmVVcGRhdGUsTmE9JCQkaG9zdENvbmZpZy5zaG91bGRTZXRUZXh0Q29udGVudCxPYT0kJCRob3N0Q29uZmlnLmNyZWF0ZVRleHRJbnN0YW5jZSxQYT0kJCRob3N0Q29uZmlnLnNjaGVkdWxlVGltZW91dCxRYT0kJCRob3N0Q29uZmlnLmNhbmNlbFRpbWVvdXQsUmE9JCQkaG9zdENvbmZpZy5ub1RpbWVvdXQsXG5TYT0kJCRob3N0Q29uZmlnLmlzUHJpbWFyeVJlbmRlcmVyLFRhPSQkJGhvc3RDb25maWcuc3VwcG9ydHNNdXRhdGlvbixVYT0kJCRob3N0Q29uZmlnLnN1cHBvcnRzUGVyc2lzdGVuY2UsVmE9JCQkaG9zdENvbmZpZy5zdXBwb3J0c0h5ZHJhdGlvbixXYT0kJCRob3N0Q29uZmlnLmdldEluc3RhbmNlRnJvbU5vZGUsWGE9JCQkaG9zdENvbmZpZy5wcmVwYXJlUG9ydGFsTW91bnQsWWE9JCQkaG9zdENvbmZpZy5nZXRDdXJyZW50RXZlbnRQcmlvcml0eSxaYT0kJCRob3N0Q29uZmlnLmRldGFjaERlbGV0ZWRJbnN0YW5jZSwkYT0kJCRob3N0Q29uZmlnLnN1cHBvcnRzTWljcm90YXNrcyxhYj0kJCRob3N0Q29uZmlnLnNjaGVkdWxlTWljcm90YXNrLGJiPSQkJGhvc3RDb25maWcuc3VwcG9ydHNUZXN0U2VsZWN0b3JzLGNiPSQkJGhvc3RDb25maWcuZmluZEZpYmVyUm9vdCxkYj0kJCRob3N0Q29uZmlnLmdldEJvdW5kaW5nUmVjdCxlYj0kJCRob3N0Q29uZmlnLmdldFRleHRDb250ZW50LGZiPVxuJCQkaG9zdENvbmZpZy5pc0hpZGRlblN1YnRyZWUsZ2I9JCQkaG9zdENvbmZpZy5tYXRjaEFjY2Vzc2liaWxpdHlSb2xlLGhiPSQkJGhvc3RDb25maWcuc2V0Rm9jdXNJZkZvY3VzYWJsZSxpYj0kJCRob3N0Q29uZmlnLnNldHVwSW50ZXJzZWN0aW9uT2JzZXJ2ZXIsamI9JCQkaG9zdENvbmZpZy5hcHBlbmRDaGlsZCxrYj0kJCRob3N0Q29uZmlnLmFwcGVuZENoaWxkVG9Db250YWluZXIsbGI9JCQkaG9zdENvbmZpZy5jb21taXRUZXh0VXBkYXRlLG1iPSQkJGhvc3RDb25maWcuY29tbWl0TW91bnQsbmI9JCQkaG9zdENvbmZpZy5jb21taXRVcGRhdGUsb2I9JCQkaG9zdENvbmZpZy5pbnNlcnRCZWZvcmUscGI9JCQkaG9zdENvbmZpZy5pbnNlcnRJbkNvbnRhaW5lckJlZm9yZSxxYj0kJCRob3N0Q29uZmlnLnJlbW92ZUNoaWxkLHJiPSQkJGhvc3RDb25maWcucmVtb3ZlQ2hpbGRGcm9tQ29udGFpbmVyLHNiPSQkJGhvc3RDb25maWcucmVzZXRUZXh0Q29udGVudCx0Yj0kJCRob3N0Q29uZmlnLmhpZGVJbnN0YW5jZSxcbnViPSQkJGhvc3RDb25maWcuaGlkZVRleHRJbnN0YW5jZSx2Yj0kJCRob3N0Q29uZmlnLnVuaGlkZUluc3RhbmNlLHdiPSQkJGhvc3RDb25maWcudW5oaWRlVGV4dEluc3RhbmNlLHhiPSQkJGhvc3RDb25maWcuY2xlYXJDb250YWluZXIseWI9JCQkaG9zdENvbmZpZy5jbG9uZUluc3RhbmNlLHpiPSQkJGhvc3RDb25maWcuY3JlYXRlQ29udGFpbmVyQ2hpbGRTZXQsQWI9JCQkaG9zdENvbmZpZy5hcHBlbmRDaGlsZFRvQ29udGFpbmVyQ2hpbGRTZXQsQmI9JCQkaG9zdENvbmZpZy5maW5hbGl6ZUNvbnRhaW5lckNoaWxkcmVuLENiPSQkJGhvc3RDb25maWcucmVwbGFjZUNvbnRhaW5lckNoaWxkcmVuLEViPSQkJGhvc3RDb25maWcuY2xvbmVIaWRkZW5JbnN0YW5jZSxGYj0kJCRob3N0Q29uZmlnLmNsb25lSGlkZGVuVGV4dEluc3RhbmNlLEdiPSQkJGhvc3RDb25maWcuY2FuSHlkcmF0ZUluc3RhbmNlLEhiPSQkJGhvc3RDb25maWcuY2FuSHlkcmF0ZVRleHRJbnN0YW5jZSxJYj0kJCRob3N0Q29uZmlnLmNhbkh5ZHJhdGVTdXNwZW5zZUluc3RhbmNlLFxuSmI9JCQkaG9zdENvbmZpZy5pc1N1c3BlbnNlSW5zdGFuY2VQZW5kaW5nLEtiPSQkJGhvc3RDb25maWcuaXNTdXNwZW5zZUluc3RhbmNlRmFsbGJhY2ssTGI9JCQkaG9zdENvbmZpZy5nZXRTdXNwZW5zZUluc3RhbmNlRmFsbGJhY2tFcnJvckRldGFpbHMsTWI9JCQkaG9zdENvbmZpZy5yZWdpc3RlclN1c3BlbnNlSW5zdGFuY2VSZXRyeSxOYj0kJCRob3N0Q29uZmlnLmdldE5leHRIeWRyYXRhYmxlU2libGluZyxPYj0kJCRob3N0Q29uZmlnLmdldEZpcnN0SHlkcmF0YWJsZUNoaWxkLFBiPSQkJGhvc3RDb25maWcuZ2V0Rmlyc3RIeWRyYXRhYmxlQ2hpbGRXaXRoaW5Db250YWluZXIsUWI9JCQkaG9zdENvbmZpZy5nZXRGaXJzdEh5ZHJhdGFibGVDaGlsZFdpdGhpblN1c3BlbnNlSW5zdGFuY2UsUmI9JCQkaG9zdENvbmZpZy5oeWRyYXRlSW5zdGFuY2UsU2I9JCQkaG9zdENvbmZpZy5oeWRyYXRlVGV4dEluc3RhbmNlLFRiPSQkJGhvc3RDb25maWcuaHlkcmF0ZVN1c3BlbnNlSW5zdGFuY2UsXG5VYj0kJCRob3N0Q29uZmlnLmdldE5leHRIeWRyYXRhYmxlSW5zdGFuY2VBZnRlclN1c3BlbnNlSW5zdGFuY2UsVmI9JCQkaG9zdENvbmZpZy5jb21taXRIeWRyYXRlZENvbnRhaW5lcixXYj0kJCRob3N0Q29uZmlnLmNvbW1pdEh5ZHJhdGVkU3VzcGVuc2VJbnN0YW5jZSxYYj0kJCRob3N0Q29uZmlnLmNsZWFyU3VzcGVuc2VCb3VuZGFyeSxZYj0kJCRob3N0Q29uZmlnLmNsZWFyU3VzcGVuc2VCb3VuZGFyeUZyb21Db250YWluZXIsWmI9JCQkaG9zdENvbmZpZy5zaG91bGREZWxldGVVbmh5ZHJhdGVkVGFpbEluc3RhbmNlcywkYj0kJCRob3N0Q29uZmlnLmRpZE5vdE1hdGNoSHlkcmF0ZWRDb250YWluZXJUZXh0SW5zdGFuY2UsYWM9JCQkaG9zdENvbmZpZy5kaWROb3RNYXRjaEh5ZHJhdGVkVGV4dEluc3RhbmNlLGJjO1xuZnVuY3Rpb24gY2MoYSl7aWYodm9pZCAwPT09YmMpdHJ5e3Rocm93IEVycm9yKCk7fWNhdGNoKGMpe3ZhciBiPWMuc3RhY2sudHJpbSgpLm1hdGNoKC9cXG4oICooYXQgKT8pLyk7YmM9YiYmYlsxXXx8XCJcIn1yZXR1cm5cIlxcblwiK2JjK2F9dmFyIGRjPSExO1xuZnVuY3Rpb24gZWMoYSxiKXtpZighYXx8ZGMpcmV0dXJuXCJcIjtkYz0hMDt2YXIgYz1FcnJvci5wcmVwYXJlU3RhY2tUcmFjZTtFcnJvci5wcmVwYXJlU3RhY2tUcmFjZT12b2lkIDA7dHJ5e2lmKGIpaWYoYj1mdW5jdGlvbigpe3Rocm93IEVycm9yKCk7fSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5wcm90b3R5cGUsXCJwcm9wc1wiLHtzZXQ6ZnVuY3Rpb24oKXt0aHJvdyBFcnJvcigpO319KSxcIm9iamVjdFwiPT09dHlwZW9mIFJlZmxlY3QmJlJlZmxlY3QuY29uc3RydWN0KXt0cnl7UmVmbGVjdC5jb25zdHJ1Y3QoYixbXSl9Y2F0Y2gobCl7dmFyIGQ9bH1SZWZsZWN0LmNvbnN0cnVjdChhLFtdLGIpfWVsc2V7dHJ5e2IuY2FsbCgpfWNhdGNoKGwpe2Q9bH1hLmNhbGwoYi5wcm90b3R5cGUpfWVsc2V7dHJ5e3Rocm93IEVycm9yKCk7fWNhdGNoKGwpe2Q9bH1hKCl9fWNhdGNoKGwpe2lmKGwmJmQmJlwic3RyaW5nXCI9PT10eXBlb2YgbC5zdGFjayl7Zm9yKHZhciBlPWwuc3RhY2suc3BsaXQoXCJcXG5cIiksXG5mPWQuc3RhY2suc3BsaXQoXCJcXG5cIiksZz1lLmxlbmd0aC0xLGg9Zi5sZW5ndGgtMTsxPD1nJiYwPD1oJiZlW2ddIT09ZltoXTspaC0tO2Zvcig7MTw9ZyYmMDw9aDtnLS0saC0tKWlmKGVbZ10hPT1mW2hdKXtpZigxIT09Z3x8MSE9PWgpe2RvIGlmKGctLSxoLS0sMD5ofHxlW2ddIT09ZltoXSl7dmFyIGs9XCJcXG5cIitlW2ddLnJlcGxhY2UoXCIgYXQgbmV3IFwiLFwiIGF0IFwiKTthLmRpc3BsYXlOYW1lJiZrLmluY2x1ZGVzKFwiPGFub255bW91cz5cIikmJihrPWsucmVwbGFjZShcIjxhbm9ueW1vdXM+XCIsYS5kaXNwbGF5TmFtZSkpO3JldHVybiBrfXdoaWxlKDE8PWcmJjA8PWgpfWJyZWFrfX19ZmluYWxseXtkYz0hMSxFcnJvci5wcmVwYXJlU3RhY2tUcmFjZT1jfXJldHVybihhPWE/YS5kaXNwbGF5TmFtZXx8YS5uYW1lOlwiXCIpP2NjKGEpOlwiXCJ9dmFyIGZjPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksZ2M9W10saGM9LTE7ZnVuY3Rpb24gaWMoYSl7cmV0dXJue2N1cnJlbnQ6YX19XG5mdW5jdGlvbiBxKGEpezA+aGN8fChhLmN1cnJlbnQ9Z2NbaGNdLGdjW2hjXT1udWxsLGhjLS0pfWZ1bmN0aW9uIHYoYSxiKXtoYysrO2djW2hjXT1hLmN1cnJlbnQ7YS5jdXJyZW50PWJ9dmFyIGpjPXt9LHg9aWMoamMpLHo9aWMoITEpLGtjPWpjO2Z1bmN0aW9uIG1jKGEsYil7dmFyIGM9YS50eXBlLmNvbnRleHRUeXBlcztpZighYylyZXR1cm4gamM7dmFyIGQ9YS5zdGF0ZU5vZGU7aWYoZCYmZC5fX3JlYWN0SW50ZXJuYWxNZW1vaXplZFVubWFza2VkQ2hpbGRDb250ZXh0PT09YilyZXR1cm4gZC5fX3JlYWN0SW50ZXJuYWxNZW1vaXplZE1hc2tlZENoaWxkQ29udGV4dDt2YXIgZT17fSxmO2ZvcihmIGluIGMpZVtmXT1iW2ZdO2QmJihhPWEuc3RhdGVOb2RlLGEuX19yZWFjdEludGVybmFsTWVtb2l6ZWRVbm1hc2tlZENoaWxkQ29udGV4dD1iLGEuX19yZWFjdEludGVybmFsTWVtb2l6ZWRNYXNrZWRDaGlsZENvbnRleHQ9ZSk7cmV0dXJuIGV9XG5mdW5jdGlvbiBBKGEpe2E9YS5jaGlsZENvbnRleHRUeXBlcztyZXR1cm4gbnVsbCE9PWEmJnZvaWQgMCE9PWF9ZnVuY3Rpb24gbmMoKXtxKHopO3EoeCl9ZnVuY3Rpb24gb2MoYSxiLGMpe2lmKHguY3VycmVudCE9PWpjKXRocm93IEVycm9yKG4oMTY4KSk7dih4LGIpO3YoeixjKX1mdW5jdGlvbiBwYyhhLGIsYyl7dmFyIGQ9YS5zdGF0ZU5vZGU7Yj1iLmNoaWxkQ29udGV4dFR5cGVzO2lmKFwiZnVuY3Rpb25cIiE9PXR5cGVvZiBkLmdldENoaWxkQ29udGV4dClyZXR1cm4gYztkPWQuZ2V0Q2hpbGRDb250ZXh0KCk7Zm9yKHZhciBlIGluIGQpaWYoIShlIGluIGIpKXRocm93IEVycm9yKG4oMTA4LHZhKGEpfHxcIlVua25vd25cIixlKSk7cmV0dXJuIGNhKHt9LGMsZCl9XG5mdW5jdGlvbiBxYyhhKXthPShhPWEuc3RhdGVOb2RlKSYmYS5fX3JlYWN0SW50ZXJuYWxNZW1vaXplZE1lcmdlZENoaWxkQ29udGV4dHx8amM7a2M9eC5jdXJyZW50O3YoeCxhKTt2KHosei5jdXJyZW50KTtyZXR1cm4hMH1mdW5jdGlvbiByYyhhLGIsYyl7dmFyIGQ9YS5zdGF0ZU5vZGU7aWYoIWQpdGhyb3cgRXJyb3IobigxNjkpKTtjPyhhPXBjKGEsYixrYyksZC5fX3JlYWN0SW50ZXJuYWxNZW1vaXplZE1lcmdlZENoaWxkQ29udGV4dD1hLHEoeikscSh4KSx2KHgsYSkpOnEoeik7dih6LGMpfXZhciB0Yz1NYXRoLmNsejMyP01hdGguY2x6MzI6c2MsdWM9TWF0aC5sb2csdmM9TWF0aC5MTjI7ZnVuY3Rpb24gc2MoYSl7YT4+Pj0wO3JldHVybiAwPT09YT8zMjozMS0odWMoYSkvdmN8MCl8MH12YXIgd2M9NjQseGM9NDE5NDMwNDtcbmZ1bmN0aW9uIHljKGEpe3N3aXRjaChhJi1hKXtjYXNlIDE6cmV0dXJuIDE7Y2FzZSAyOnJldHVybiAyO2Nhc2UgNDpyZXR1cm4gNDtjYXNlIDg6cmV0dXJuIDg7Y2FzZSAxNjpyZXR1cm4gMTY7Y2FzZSAzMjpyZXR1cm4gMzI7Y2FzZSA2NDpjYXNlIDEyODpjYXNlIDI1NjpjYXNlIDUxMjpjYXNlIDEwMjQ6Y2FzZSAyMDQ4OmNhc2UgNDA5NjpjYXNlIDgxOTI6Y2FzZSAxNjM4NDpjYXNlIDMyNzY4OmNhc2UgNjU1MzY6Y2FzZSAxMzEwNzI6Y2FzZSAyNjIxNDQ6Y2FzZSA1MjQyODg6Y2FzZSAxMDQ4NTc2OmNhc2UgMjA5NzE1MjpyZXR1cm4gYSY0MTk0MjQwO2Nhc2UgNDE5NDMwNDpjYXNlIDgzODg2MDg6Y2FzZSAxNjc3NzIxNjpjYXNlIDMzNTU0NDMyOmNhc2UgNjcxMDg4NjQ6cmV0dXJuIGEmMTMwMDIzNDI0O2Nhc2UgMTM0MjE3NzI4OnJldHVybiAxMzQyMTc3Mjg7Y2FzZSAyNjg0MzU0NTY6cmV0dXJuIDI2ODQzNTQ1NjtjYXNlIDUzNjg3MDkxMjpyZXR1cm4gNTM2ODcwOTEyO2Nhc2UgMTA3Mzc0MTgyNDpyZXR1cm4gMTA3Mzc0MTgyNDtcbmRlZmF1bHQ6cmV0dXJuIGF9fWZ1bmN0aW9uIHpjKGEsYil7dmFyIGM9YS5wZW5kaW5nTGFuZXM7aWYoMD09PWMpcmV0dXJuIDA7dmFyIGQ9MCxlPWEuc3VzcGVuZGVkTGFuZXMsZj1hLnBpbmdlZExhbmVzLGc9YyYyNjg0MzU0NTU7aWYoMCE9PWcpe3ZhciBoPWcmfmU7MCE9PWg/ZD15YyhoKTooZiY9ZywwIT09ZiYmKGQ9eWMoZikpKX1lbHNlIGc9YyZ+ZSwwIT09Zz9kPXljKGcpOjAhPT1mJiYoZD15YyhmKSk7aWYoMD09PWQpcmV0dXJuIDA7aWYoMCE9PWImJmIhPT1kJiYwPT09KGImZSkmJihlPWQmLWQsZj1iJi1iLGU+PWZ8fDE2PT09ZSYmMCE9PShmJjQxOTQyNDApKSlyZXR1cm4gYjswIT09KGQmNCkmJihkfD1jJjE2KTtiPWEuZW50YW5nbGVkTGFuZXM7aWYoMCE9PWIpZm9yKGE9YS5lbnRhbmdsZW1lbnRzLGImPWQ7MDxiOyljPTMxLXRjKGIpLGU9MTw8YyxkfD1hW2NdLGImPX5lO3JldHVybiBkfVxuZnVuY3Rpb24gQWMoYSxiKXtzd2l0Y2goYSl7Y2FzZSAxOmNhc2UgMjpjYXNlIDQ6cmV0dXJuIGIrMjUwO2Nhc2UgODpjYXNlIDE2OmNhc2UgMzI6Y2FzZSA2NDpjYXNlIDEyODpjYXNlIDI1NjpjYXNlIDUxMjpjYXNlIDEwMjQ6Y2FzZSAyMDQ4OmNhc2UgNDA5NjpjYXNlIDgxOTI6Y2FzZSAxNjM4NDpjYXNlIDMyNzY4OmNhc2UgNjU1MzY6Y2FzZSAxMzEwNzI6Y2FzZSAyNjIxNDQ6Y2FzZSA1MjQyODg6Y2FzZSAxMDQ4NTc2OmNhc2UgMjA5NzE1MjpyZXR1cm4gYis1RTM7Y2FzZSA0MTk0MzA0OmNhc2UgODM4ODYwODpjYXNlIDE2Nzc3MjE2OmNhc2UgMzM1NTQ0MzI6Y2FzZSA2NzEwODg2NDpyZXR1cm4tMTtjYXNlIDEzNDIxNzcyODpjYXNlIDI2ODQzNTQ1NjpjYXNlIDUzNjg3MDkxMjpjYXNlIDEwNzM3NDE4MjQ6cmV0dXJuLTE7ZGVmYXVsdDpyZXR1cm4tMX19XG5mdW5jdGlvbiBCYyhhLGIpe2Zvcih2YXIgYz1hLnN1c3BlbmRlZExhbmVzLGQ9YS5waW5nZWRMYW5lcyxlPWEuZXhwaXJhdGlvblRpbWVzLGY9YS5wZW5kaW5nTGFuZXM7MDxmOyl7dmFyIGc9MzEtdGMoZiksaD0xPDxnLGs9ZVtnXTtpZigtMT09PWspe2lmKDA9PT0oaCZjKXx8MCE9PShoJmQpKWVbZ109QWMoaCxiKX1lbHNlIGs8PWImJihhLmV4cGlyZWRMYW5lc3w9aCk7ZiY9fmh9fWZ1bmN0aW9uIENjKGEpe2E9YS5wZW5kaW5nTGFuZXMmLTEwNzM3NDE4MjU7cmV0dXJuIDAhPT1hP2E6YSYxMDczNzQxODI0PzEwNzM3NDE4MjQ6MH1mdW5jdGlvbiBEYygpe3ZhciBhPXdjO3djPDw9MTswPT09KHdjJjQxOTQyNDApJiYod2M9NjQpO3JldHVybiBhfWZ1bmN0aW9uIEVjKGEpe2Zvcih2YXIgYj1bXSxjPTA7MzE+YztjKyspYi5wdXNoKGEpO3JldHVybiBifVxuZnVuY3Rpb24gRmMoYSxiLGMpe2EucGVuZGluZ0xhbmVzfD1iOzUzNjg3MDkxMiE9PWImJihhLnN1c3BlbmRlZExhbmVzPTAsYS5waW5nZWRMYW5lcz0wKTthPWEuZXZlbnRUaW1lcztiPTMxLXRjKGIpO2FbYl09Y31mdW5jdGlvbiBHYyhhLGIpe3ZhciBjPWEucGVuZGluZ0xhbmVzJn5iO2EucGVuZGluZ0xhbmVzPWI7YS5zdXNwZW5kZWRMYW5lcz0wO2EucGluZ2VkTGFuZXM9MDthLmV4cGlyZWRMYW5lcyY9YjthLm11dGFibGVSZWFkTGFuZXMmPWI7YS5lbnRhbmdsZWRMYW5lcyY9YjtiPWEuZW50YW5nbGVtZW50czt2YXIgZD1hLmV2ZW50VGltZXM7Zm9yKGE9YS5leHBpcmF0aW9uVGltZXM7MDxjOyl7dmFyIGU9MzEtdGMoYyksZj0xPDxlO2JbZV09MDtkW2VdPS0xO2FbZV09LTE7YyY9fmZ9fVxuZnVuY3Rpb24gSGMoYSxiKXt2YXIgYz1hLmVudGFuZ2xlZExhbmVzfD1iO2ZvcihhPWEuZW50YW5nbGVtZW50cztjOyl7dmFyIGQ9MzEtdGMoYyksZT0xPDxkO2UmYnxhW2RdJmImJihhW2RdfD1iKTtjJj1+ZX19dmFyIEM9MDtmdW5jdGlvbiBJYyhhKXthJj0tYTtyZXR1cm4gMTxhPzQ8YT8wIT09KGEmMjY4NDM1NDU1KT8xNjo1MzY4NzA5MTI6NDoxfXZhciBKYz1iYS51bnN0YWJsZV9zY2hlZHVsZUNhbGxiYWNrLEtjPWJhLnVuc3RhYmxlX2NhbmNlbENhbGxiYWNrLExjPWJhLnVuc3RhYmxlX3Nob3VsZFlpZWxkLE1jPWJhLnVuc3RhYmxlX3JlcXVlc3RQYWludCxEPWJhLnVuc3RhYmxlX25vdyxOYz1iYS51bnN0YWJsZV9JbW1lZGlhdGVQcmlvcml0eSxPYz1iYS51bnN0YWJsZV9Vc2VyQmxvY2tpbmdQcmlvcml0eSxQYz1iYS51bnN0YWJsZV9Ob3JtYWxQcmlvcml0eSxRYz1iYS51bnN0YWJsZV9JZGxlUHJpb3JpdHksUmM9bnVsbCxTYz1udWxsO1xuZnVuY3Rpb24gVGMoYSl7aWYoU2MmJlwiZnVuY3Rpb25cIj09PXR5cGVvZiBTYy5vbkNvbW1pdEZpYmVyUm9vdCl0cnl7U2Mub25Db21taXRGaWJlclJvb3QoUmMsYSx2b2lkIDAsMTI4PT09KGEuY3VycmVudC5mbGFncyYxMjgpKX1jYXRjaChiKXt9fWZ1bmN0aW9uIFVjKGEsYil7cmV0dXJuIGE9PT1iJiYoMCE9PWF8fDEvYT09PTEvYil8fGEhPT1hJiZiIT09Yn12YXIgVmM9XCJmdW5jdGlvblwiPT09dHlwZW9mIE9iamVjdC5pcz9PYmplY3QuaXM6VWMsV2M9bnVsbCxYYz0hMSxZYz0hMTtmdW5jdGlvbiBaYyhhKXtudWxsPT09V2M/V2M9W2FdOldjLnB1c2goYSl9ZnVuY3Rpb24gJGMoYSl7WGM9ITA7WmMoYSl9XG5mdW5jdGlvbiBhZCgpe2lmKCFZYyYmbnVsbCE9PVdjKXtZYz0hMDt2YXIgYT0wLGI9Qzt0cnl7dmFyIGM9V2M7Zm9yKEM9MTthPGMubGVuZ3RoO2ErKyl7dmFyIGQ9Y1thXTtkbyBkPWQoITApO3doaWxlKG51bGwhPT1kKX1XYz1udWxsO1hjPSExfWNhdGNoKGUpe3Rocm93IG51bGwhPT1XYyYmKFdjPVdjLnNsaWNlKGErMSkpLEpjKE5jLGFkKSxlO31maW5hbGx5e0M9YixZYz0hMX19cmV0dXJuIG51bGx9dmFyIGJkPVtdLGNkPTAsZGQ9bnVsbCxlZD0wLGZkPVtdLGdkPTAsaGQ9bnVsbCxpZD0xLGpkPVwiXCI7ZnVuY3Rpb24ga2QoYSxiKXtiZFtjZCsrXT1lZDtiZFtjZCsrXT1kZDtkZD1hO2VkPWJ9XG5mdW5jdGlvbiBsZChhLGIsYyl7ZmRbZ2QrK109aWQ7ZmRbZ2QrK109amQ7ZmRbZ2QrK109aGQ7aGQ9YTt2YXIgZD1pZDthPWpkO3ZhciBlPTMyLXRjKGQpLTE7ZCY9figxPDxlKTtjKz0xO3ZhciBmPTMyLXRjKGIpK2U7aWYoMzA8Zil7dmFyIGc9ZS1lJTU7Zj0oZCYoMTw8ZyktMSkudG9TdHJpbmcoMzIpO2Q+Pj1nO2UtPWc7aWQ9MTw8MzItdGMoYikrZXxjPDxlfGQ7amQ9ZithfWVsc2UgaWQ9MTw8ZnxjPDxlfGQsamQ9YX1mdW5jdGlvbiBtZChhKXtudWxsIT09YS5yZXR1cm4mJihrZChhLDEpLGxkKGEsMSwwKSl9ZnVuY3Rpb24gbmQoYSl7Zm9yKDthPT09ZGQ7KWRkPWJkWy0tY2RdLGJkW2NkXT1udWxsLGVkPWJkWy0tY2RdLGJkW2NkXT1udWxsO2Zvcig7YT09PWhkOyloZD1mZFstLWdkXSxmZFtnZF09bnVsbCxqZD1mZFstLWdkXSxmZFtnZF09bnVsbCxpZD1mZFstLWdkXSxmZFtnZF09bnVsbH12YXIgb2Q9bnVsbCxwZD1udWxsLEY9ITEscWQ9ITEscmQ9bnVsbDtcbmZ1bmN0aW9uIHNkKGEsYil7dmFyIGM9dGQoNSxudWxsLG51bGwsMCk7Yy5lbGVtZW50VHlwZT1cIkRFTEVURURcIjtjLnN0YXRlTm9kZT1iO2MucmV0dXJuPWE7Yj1hLmRlbGV0aW9ucztudWxsPT09Yj8oYS5kZWxldGlvbnM9W2NdLGEuZmxhZ3N8PTE2KTpiLnB1c2goYyl9XG5mdW5jdGlvbiB1ZChhLGIpe3N3aXRjaChhLnRhZyl7Y2FzZSA1OnJldHVybiBiPUdiKGIsYS50eXBlLGEucGVuZGluZ1Byb3BzKSxudWxsIT09Yj8oYS5zdGF0ZU5vZGU9YixvZD1hLHBkPU9iKGIpLCEwKTohMTtjYXNlIDY6cmV0dXJuIGI9SGIoYixhLnBlbmRpbmdQcm9wcyksbnVsbCE9PWI/KGEuc3RhdGVOb2RlPWIsb2Q9YSxwZD1udWxsLCEwKTohMTtjYXNlIDEzOmI9SWIoYik7aWYobnVsbCE9PWIpe3ZhciBjPW51bGwhPT1oZD97aWQ6aWQsb3ZlcmZsb3c6amR9Om51bGw7YS5tZW1vaXplZFN0YXRlPXtkZWh5ZHJhdGVkOmIsdHJlZUNvbnRleHQ6YyxyZXRyeUxhbmU6MTA3Mzc0MTgyNH07Yz10ZCgxOCxudWxsLG51bGwsMCk7Yy5zdGF0ZU5vZGU9YjtjLnJldHVybj1hO2EuY2hpbGQ9YztvZD1hO3BkPW51bGw7cmV0dXJuITB9cmV0dXJuITE7ZGVmYXVsdDpyZXR1cm4hMX19ZnVuY3Rpb24gdmQoYSl7cmV0dXJuIDAhPT0oYS5tb2RlJjEpJiYwPT09KGEuZmxhZ3MmMTI4KX1cbmZ1bmN0aW9uIHdkKGEpe2lmKEYpe3ZhciBiPXBkO2lmKGIpe3ZhciBjPWI7aWYoIXVkKGEsYikpe2lmKHZkKGEpKXRocm93IEVycm9yKG4oNDE4KSk7Yj1OYihjKTt2YXIgZD1vZDtiJiZ1ZChhLGIpP3NkKGQsYyk6KGEuZmxhZ3M9YS5mbGFncyYtNDA5N3wyLEY9ITEsb2Q9YSl9fWVsc2V7aWYodmQoYSkpdGhyb3cgRXJyb3Iobig0MTgpKTthLmZsYWdzPWEuZmxhZ3MmLTQwOTd8MjtGPSExO29kPWF9fX1mdW5jdGlvbiB4ZChhKXtmb3IoYT1hLnJldHVybjtudWxsIT09YSYmNSE9PWEudGFnJiYzIT09YS50YWcmJjEzIT09YS50YWc7KWE9YS5yZXR1cm47b2Q9YX1cbmZ1bmN0aW9uIHlkKGEpe2lmKCFWYXx8YSE9PW9kKXJldHVybiExO2lmKCFGKXJldHVybiB4ZChhKSxGPSEwLCExO2lmKDMhPT1hLnRhZyYmKDUhPT1hLnRhZ3x8WmIoYS50eXBlKSYmIU5hKGEudHlwZSxhLm1lbW9pemVkUHJvcHMpKSl7dmFyIGI9cGQ7aWYoYil7aWYodmQoYSkpdGhyb3cgemQoKSxFcnJvcihuKDQxOCkpO2Zvcig7Yjspc2QoYSxiKSxiPU5iKGIpfX14ZChhKTtpZigxMz09PWEudGFnKXtpZighVmEpdGhyb3cgRXJyb3IobigzMTYpKTthPWEubWVtb2l6ZWRTdGF0ZTthPW51bGwhPT1hP2EuZGVoeWRyYXRlZDpudWxsO2lmKCFhKXRocm93IEVycm9yKG4oMzE3KSk7cGQ9VWIoYSl9ZWxzZSBwZD1vZD9OYihhLnN0YXRlTm9kZSk6bnVsbDtyZXR1cm4hMH1mdW5jdGlvbiB6ZCgpe2Zvcih2YXIgYT1wZDthOylhPU5iKGEpfWZ1bmN0aW9uIEFkKCl7VmEmJihwZD1vZD1udWxsLHFkPUY9ITEpfWZ1bmN0aW9uIEJkKGEpe251bGw9PT1yZD9yZD1bYV06cmQucHVzaChhKX1cbnZhciBDZD1kYS5SZWFjdEN1cnJlbnRCYXRjaENvbmZpZztmdW5jdGlvbiBEZChhLGIpe2lmKFZjKGEsYikpcmV0dXJuITA7aWYoXCJvYmplY3RcIiE9PXR5cGVvZiBhfHxudWxsPT09YXx8XCJvYmplY3RcIiE9PXR5cGVvZiBifHxudWxsPT09YilyZXR1cm4hMTt2YXIgYz1PYmplY3Qua2V5cyhhKSxkPU9iamVjdC5rZXlzKGIpO2lmKGMubGVuZ3RoIT09ZC5sZW5ndGgpcmV0dXJuITE7Zm9yKGQ9MDtkPGMubGVuZ3RoO2QrKyl7dmFyIGU9Y1tkXTtpZighZmMuY2FsbChiLGUpfHwhVmMoYVtlXSxiW2VdKSlyZXR1cm4hMX1yZXR1cm4hMH1cbmZ1bmN0aW9uIEVkKGEpe3N3aXRjaChhLnRhZyl7Y2FzZSA1OnJldHVybiBjYyhhLnR5cGUpO2Nhc2UgMTY6cmV0dXJuIGNjKFwiTGF6eVwiKTtjYXNlIDEzOnJldHVybiBjYyhcIlN1c3BlbnNlXCIpO2Nhc2UgMTk6cmV0dXJuIGNjKFwiU3VzcGVuc2VMaXN0XCIpO2Nhc2UgMDpjYXNlIDI6Y2FzZSAxNTpyZXR1cm4gYT1lYyhhLnR5cGUsITEpLGE7Y2FzZSAxMTpyZXR1cm4gYT1lYyhhLnR5cGUucmVuZGVyLCExKSxhO2Nhc2UgMTpyZXR1cm4gYT1lYyhhLnR5cGUsITApLGE7ZGVmYXVsdDpyZXR1cm5cIlwifX1cbmZ1bmN0aW9uIEZkKGEsYixjKXthPWMucmVmO2lmKG51bGwhPT1hJiZcImZ1bmN0aW9uXCIhPT10eXBlb2YgYSYmXCJvYmplY3RcIiE9PXR5cGVvZiBhKXtpZihjLl9vd25lcil7Yz1jLl9vd25lcjtpZihjKXtpZigxIT09Yy50YWcpdGhyb3cgRXJyb3IobigzMDkpKTt2YXIgZD1jLnN0YXRlTm9kZX1pZighZCl0aHJvdyBFcnJvcihuKDE0NyxhKSk7dmFyIGU9ZCxmPVwiXCIrYTtpZihudWxsIT09YiYmbnVsbCE9PWIucmVmJiZcImZ1bmN0aW9uXCI9PT10eXBlb2YgYi5yZWYmJmIucmVmLl9zdHJpbmdSZWY9PT1mKXJldHVybiBiLnJlZjtiPWZ1bmN0aW9uKGEpe3ZhciBiPWUucmVmcztudWxsPT09YT9kZWxldGUgYltmXTpiW2ZdPWF9O2IuX3N0cmluZ1JlZj1mO3JldHVybiBifWlmKFwic3RyaW5nXCIhPT10eXBlb2YgYSl0aHJvdyBFcnJvcihuKDI4NCkpO2lmKCFjLl9vd25lcil0aHJvdyBFcnJvcihuKDI5MCxhKSk7fXJldHVybiBhfVxuZnVuY3Rpb24gR2QoYSxiKXthPU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChiKTt0aHJvdyBFcnJvcihuKDMxLFwiW29iamVjdCBPYmplY3RdXCI9PT1hP1wib2JqZWN0IHdpdGgga2V5cyB7XCIrT2JqZWN0LmtleXMoYikuam9pbihcIiwgXCIpK1wifVwiOmEpKTt9ZnVuY3Rpb24gSGQoYSl7dmFyIGI9YS5faW5pdDtyZXR1cm4gYihhLl9wYXlsb2FkKX1cbmZ1bmN0aW9uIElkKGEpe2Z1bmN0aW9uIGIoYixjKXtpZihhKXt2YXIgZD1iLmRlbGV0aW9ucztudWxsPT09ZD8oYi5kZWxldGlvbnM9W2NdLGIuZmxhZ3N8PTE2KTpkLnB1c2goYyl9fWZ1bmN0aW9uIGMoYyxkKXtpZighYSlyZXR1cm4gbnVsbDtmb3IoO251bGwhPT1kOyliKGMsZCksZD1kLnNpYmxpbmc7cmV0dXJuIG51bGx9ZnVuY3Rpb24gZChhLGIpe2ZvcihhPW5ldyBNYXA7bnVsbCE9PWI7KW51bGwhPT1iLmtleT9hLnNldChiLmtleSxiKTphLnNldChiLmluZGV4LGIpLGI9Yi5zaWJsaW5nO3JldHVybiBhfWZ1bmN0aW9uIGUoYSxiKXthPUpkKGEsYik7YS5pbmRleD0wO2Euc2libGluZz1udWxsO3JldHVybiBhfWZ1bmN0aW9uIGYoYixjLGQpe2IuaW5kZXg9ZDtpZighYSlyZXR1cm4gYi5mbGFnc3w9MTA0ODU3NixjO2Q9Yi5hbHRlcm5hdGU7aWYobnVsbCE9PWQpcmV0dXJuIGQ9ZC5pbmRleCxkPGM/KGIuZmxhZ3N8PTIsYyk6ZDtiLmZsYWdzfD0yO3JldHVybiBjfWZ1bmN0aW9uIGcoYil7YSYmXG5udWxsPT09Yi5hbHRlcm5hdGUmJihiLmZsYWdzfD0yKTtyZXR1cm4gYn1mdW5jdGlvbiBoKGEsYixjLGQpe2lmKG51bGw9PT1ifHw2IT09Yi50YWcpcmV0dXJuIGI9S2QoYyxhLm1vZGUsZCksYi5yZXR1cm49YSxiO2I9ZShiLGMpO2IucmV0dXJuPWE7cmV0dXJuIGJ9ZnVuY3Rpb24gayhhLGIsYyxkKXt2YXIgZj1jLnR5cGU7aWYoZj09PWhhKXJldHVybiBtKGEsYixjLnByb3BzLmNoaWxkcmVuLGQsYy5rZXkpO2lmKG51bGwhPT1iJiYoYi5lbGVtZW50VHlwZT09PWZ8fFwib2JqZWN0XCI9PT10eXBlb2YgZiYmbnVsbCE9PWYmJmYuJCR0eXBlb2Y9PT1xYSYmSGQoZik9PT1iLnR5cGUpKXJldHVybiBkPWUoYixjLnByb3BzKSxkLnJlZj1GZChhLGIsYyksZC5yZXR1cm49YSxkO2Q9TGQoYy50eXBlLGMua2V5LGMucHJvcHMsbnVsbCxhLm1vZGUsZCk7ZC5yZWY9RmQoYSxiLGMpO2QucmV0dXJuPWE7cmV0dXJuIGR9ZnVuY3Rpb24gbChhLGIsYyxkKXtpZihudWxsPT09Ynx8NCE9PWIudGFnfHxcbmIuc3RhdGVOb2RlLmNvbnRhaW5lckluZm8hPT1jLmNvbnRhaW5lckluZm98fGIuc3RhdGVOb2RlLmltcGxlbWVudGF0aW9uIT09Yy5pbXBsZW1lbnRhdGlvbilyZXR1cm4gYj1NZChjLGEubW9kZSxkKSxiLnJldHVybj1hLGI7Yj1lKGIsYy5jaGlsZHJlbnx8W10pO2IucmV0dXJuPWE7cmV0dXJuIGJ9ZnVuY3Rpb24gbShhLGIsYyxkLGYpe2lmKG51bGw9PT1ifHw3IT09Yi50YWcpcmV0dXJuIGI9TmQoYyxhLm1vZGUsZCxmKSxiLnJldHVybj1hLGI7Yj1lKGIsYyk7Yi5yZXR1cm49YTtyZXR1cm4gYn1mdW5jdGlvbiByKGEsYixjKXtpZihcInN0cmluZ1wiPT09dHlwZW9mIGImJlwiXCIhPT1ifHxcIm51bWJlclwiPT09dHlwZW9mIGIpcmV0dXJuIGI9S2QoXCJcIitiLGEubW9kZSxjKSxiLnJldHVybj1hLGI7aWYoXCJvYmplY3RcIj09PXR5cGVvZiBiJiZudWxsIT09Yil7c3dpdGNoKGIuJCR0eXBlb2Ype2Nhc2UgZWE6cmV0dXJuIGM9TGQoYi50eXBlLGIua2V5LGIucHJvcHMsbnVsbCxhLm1vZGUsYyksXG5jLnJlZj1GZChhLG51bGwsYiksYy5yZXR1cm49YSxjO2Nhc2UgZmE6cmV0dXJuIGI9TWQoYixhLm1vZGUsYyksYi5yZXR1cm49YSxiO2Nhc2UgcWE6dmFyIGQ9Yi5faW5pdDtyZXR1cm4gcihhLGQoYi5fcGF5bG9hZCksYyl9aWYoRGEoYil8fHRhKGIpKXJldHVybiBiPU5kKGIsYS5tb2RlLGMsbnVsbCksYi5yZXR1cm49YSxiO0dkKGEsYil9cmV0dXJuIG51bGx9ZnVuY3Rpb24gcChhLGIsYyxkKXt2YXIgZT1udWxsIT09Yj9iLmtleTpudWxsO2lmKFwic3RyaW5nXCI9PT10eXBlb2YgYyYmXCJcIiE9PWN8fFwibnVtYmVyXCI9PT10eXBlb2YgYylyZXR1cm4gbnVsbCE9PWU/bnVsbDpoKGEsYixcIlwiK2MsZCk7aWYoXCJvYmplY3RcIj09PXR5cGVvZiBjJiZudWxsIT09Yyl7c3dpdGNoKGMuJCR0eXBlb2Ype2Nhc2UgZWE6cmV0dXJuIGMua2V5PT09ZT9rKGEsYixjLGQpOm51bGw7Y2FzZSBmYTpyZXR1cm4gYy5rZXk9PT1lP2woYSxiLGMsZCk6bnVsbDtjYXNlIHFhOnJldHVybiBlPWMuX2luaXQscChhLFxuYixlKGMuX3BheWxvYWQpLGQpfWlmKERhKGMpfHx0YShjKSlyZXR1cm4gbnVsbCE9PWU/bnVsbDptKGEsYixjLGQsbnVsbCk7R2QoYSxjKX1yZXR1cm4gbnVsbH1mdW5jdGlvbiBCKGEsYixjLGQsZSl7aWYoXCJzdHJpbmdcIj09PXR5cGVvZiBkJiZcIlwiIT09ZHx8XCJudW1iZXJcIj09PXR5cGVvZiBkKXJldHVybiBhPWEuZ2V0KGMpfHxudWxsLGgoYixhLFwiXCIrZCxlKTtpZihcIm9iamVjdFwiPT09dHlwZW9mIGQmJm51bGwhPT1kKXtzd2l0Y2goZC4kJHR5cGVvZil7Y2FzZSBlYTpyZXR1cm4gYT1hLmdldChudWxsPT09ZC5rZXk/YzpkLmtleSl8fG51bGwsayhiLGEsZCxlKTtjYXNlIGZhOnJldHVybiBhPWEuZ2V0KG51bGw9PT1kLmtleT9jOmQua2V5KXx8bnVsbCxsKGIsYSxkLGUpO2Nhc2UgcWE6dmFyIGY9ZC5faW5pdDtyZXR1cm4gQihhLGIsYyxmKGQuX3BheWxvYWQpLGUpfWlmKERhKGQpfHx0YShkKSlyZXR1cm4gYT1hLmdldChjKXx8bnVsbCxtKGIsYSxkLGUsbnVsbCk7R2QoYixkKX1yZXR1cm4gbnVsbH1cbmZ1bmN0aW9uIHcoZSxnLGgsayl7Zm9yKHZhciBsPW51bGwsbT1udWxsLHU9Zyx0PWc9MCxFPW51bGw7bnVsbCE9PXUmJnQ8aC5sZW5ndGg7dCsrKXt1LmluZGV4PnQ/KEU9dSx1PW51bGwpOkU9dS5zaWJsaW5nO3ZhciB5PXAoZSx1LGhbdF0sayk7aWYobnVsbD09PXkpe251bGw9PT11JiYodT1FKTticmVha31hJiZ1JiZudWxsPT09eS5hbHRlcm5hdGUmJmIoZSx1KTtnPWYoeSxnLHQpO251bGw9PT1tP2w9eTptLnNpYmxpbmc9eTttPXk7dT1FfWlmKHQ9PT1oLmxlbmd0aClyZXR1cm4gYyhlLHUpLEYmJmtkKGUsdCksbDtpZihudWxsPT09dSl7Zm9yKDt0PGgubGVuZ3RoO3QrKyl1PXIoZSxoW3RdLGspLG51bGwhPT11JiYoZz1mKHUsZyx0KSxudWxsPT09bT9sPXU6bS5zaWJsaW5nPXUsbT11KTtGJiZrZChlLHQpO3JldHVybiBsfWZvcih1PWQoZSx1KTt0PGgubGVuZ3RoO3QrKylFPUIodSxlLHQsaFt0XSxrKSxudWxsIT09RSYmKGEmJm51bGwhPT1FLmFsdGVybmF0ZSYmdS5kZWxldGUobnVsbD09PVxuRS5rZXk/dDpFLmtleSksZz1mKEUsZyx0KSxudWxsPT09bT9sPUU6bS5zaWJsaW5nPUUsbT1FKTthJiZ1LmZvckVhY2goZnVuY3Rpb24oYSl7cmV0dXJuIGIoZSxhKX0pO0YmJmtkKGUsdCk7cmV0dXJuIGx9ZnVuY3Rpb24gWShlLGcsaCxrKXt2YXIgbD10YShoKTtpZihcImZ1bmN0aW9uXCIhPT10eXBlb2YgbCl0aHJvdyBFcnJvcihuKDE1MCkpO2g9bC5jYWxsKGgpO2lmKG51bGw9PWgpdGhyb3cgRXJyb3IobigxNTEpKTtmb3IodmFyIHU9bD1udWxsLG09Zyx0PWc9MCxFPW51bGwseT1oLm5leHQoKTtudWxsIT09bSYmIXkuZG9uZTt0KysseT1oLm5leHQoKSl7bS5pbmRleD50PyhFPW0sbT1udWxsKTpFPW0uc2libGluZzt2YXIgdz1wKGUsbSx5LnZhbHVlLGspO2lmKG51bGw9PT13KXtudWxsPT09bSYmKG09RSk7YnJlYWt9YSYmbSYmbnVsbD09PXcuYWx0ZXJuYXRlJiZiKGUsbSk7Zz1mKHcsZyx0KTtudWxsPT09dT9sPXc6dS5zaWJsaW5nPXc7dT13O209RX1pZih5LmRvbmUpcmV0dXJuIGMoZSxcbm0pLEYmJmtkKGUsdCksbDtpZihudWxsPT09bSl7Zm9yKDsheS5kb25lO3QrKyx5PWgubmV4dCgpKXk9cihlLHkudmFsdWUsayksbnVsbCE9PXkmJihnPWYoeSxnLHQpLG51bGw9PT11P2w9eTp1LnNpYmxpbmc9eSx1PXkpO0YmJmtkKGUsdCk7cmV0dXJuIGx9Zm9yKG09ZChlLG0pOyF5LmRvbmU7dCsrLHk9aC5uZXh0KCkpeT1CKG0sZSx0LHkudmFsdWUsayksbnVsbCE9PXkmJihhJiZudWxsIT09eS5hbHRlcm5hdGUmJm0uZGVsZXRlKG51bGw9PT15LmtleT90Onkua2V5KSxnPWYoeSxnLHQpLG51bGw9PT11P2w9eTp1LnNpYmxpbmc9eSx1PXkpO2EmJm0uZm9yRWFjaChmdW5jdGlvbihhKXtyZXR1cm4gYihlLGEpfSk7RiYma2QoZSx0KTtyZXR1cm4gbH1mdW5jdGlvbiB5YShhLGQsZixoKXtcIm9iamVjdFwiPT09dHlwZW9mIGYmJm51bGwhPT1mJiZmLnR5cGU9PT1oYSYmbnVsbD09PWYua2V5JiYoZj1mLnByb3BzLmNoaWxkcmVuKTtpZihcIm9iamVjdFwiPT09dHlwZW9mIGYmJm51bGwhPT1cbmYpe3N3aXRjaChmLiQkdHlwZW9mKXtjYXNlIGVhOmE6e2Zvcih2YXIgaz1mLmtleSxsPWQ7bnVsbCE9PWw7KXtpZihsLmtleT09PWspe2s9Zi50eXBlO2lmKGs9PT1oYSl7aWYoNz09PWwudGFnKXtjKGEsbC5zaWJsaW5nKTtkPWUobCxmLnByb3BzLmNoaWxkcmVuKTtkLnJldHVybj1hO2E9ZDticmVhayBhfX1lbHNlIGlmKGwuZWxlbWVudFR5cGU9PT1rfHxcIm9iamVjdFwiPT09dHlwZW9mIGsmJm51bGwhPT1rJiZrLiQkdHlwZW9mPT09cWEmJkhkKGspPT09bC50eXBlKXtjKGEsbC5zaWJsaW5nKTtkPWUobCxmLnByb3BzKTtkLnJlZj1GZChhLGwsZik7ZC5yZXR1cm49YTthPWQ7YnJlYWsgYX1jKGEsbCk7YnJlYWt9ZWxzZSBiKGEsbCk7bD1sLnNpYmxpbmd9Zi50eXBlPT09aGE/KGQ9TmQoZi5wcm9wcy5jaGlsZHJlbixhLm1vZGUsaCxmLmtleSksZC5yZXR1cm49YSxhPWQpOihoPUxkKGYudHlwZSxmLmtleSxmLnByb3BzLG51bGwsYS5tb2RlLGgpLGgucmVmPUZkKGEsZCxmKSxoLnJldHVybj1cbmEsYT1oKX1yZXR1cm4gZyhhKTtjYXNlIGZhOmE6e2ZvcihsPWYua2V5O251bGwhPT1kOyl7aWYoZC5rZXk9PT1sKWlmKDQ9PT1kLnRhZyYmZC5zdGF0ZU5vZGUuY29udGFpbmVySW5mbz09PWYuY29udGFpbmVySW5mbyYmZC5zdGF0ZU5vZGUuaW1wbGVtZW50YXRpb249PT1mLmltcGxlbWVudGF0aW9uKXtjKGEsZC5zaWJsaW5nKTtkPWUoZCxmLmNoaWxkcmVufHxbXSk7ZC5yZXR1cm49YTthPWQ7YnJlYWsgYX1lbHNle2MoYSxkKTticmVha31lbHNlIGIoYSxkKTtkPWQuc2libGluZ31kPU1kKGYsYS5tb2RlLGgpO2QucmV0dXJuPWE7YT1kfXJldHVybiBnKGEpO2Nhc2UgcWE6cmV0dXJuIGw9Zi5faW5pdCx5YShhLGQsbChmLl9wYXlsb2FkKSxoKX1pZihEYShmKSlyZXR1cm4gdyhhLGQsZixoKTtpZih0YShmKSlyZXR1cm4gWShhLGQsZixoKTtHZChhLGYpfXJldHVyblwic3RyaW5nXCI9PT10eXBlb2YgZiYmXCJcIiE9PWZ8fFwibnVtYmVyXCI9PT10eXBlb2YgZj8oZj1cIlwiK2YsbnVsbCE9PWQmJlxuNj09PWQudGFnPyhjKGEsZC5zaWJsaW5nKSxkPWUoZCxmKSxkLnJldHVybj1hLGE9ZCk6KGMoYSxkKSxkPUtkKGYsYS5tb2RlLGgpLGQucmV0dXJuPWEsYT1kKSxnKGEpKTpjKGEsZCl9cmV0dXJuIHlhfXZhciBPZD1JZCghMCksUGQ9SWQoITEpLFFkPWljKG51bGwpLFJkPW51bGwsU2Q9bnVsbCxUZD1udWxsO2Z1bmN0aW9uIFVkKCl7VGQ9U2Q9UmQ9bnVsbH1mdW5jdGlvbiBWZChhLGIsYyl7U2E/KHYoUWQsYi5fY3VycmVudFZhbHVlKSxiLl9jdXJyZW50VmFsdWU9Yyk6KHYoUWQsYi5fY3VycmVudFZhbHVlMiksYi5fY3VycmVudFZhbHVlMj1jKX1mdW5jdGlvbiBXZChhKXt2YXIgYj1RZC5jdXJyZW50O3EoUWQpO1NhP2EuX2N1cnJlbnRWYWx1ZT1iOmEuX2N1cnJlbnRWYWx1ZTI9Yn1cbmZ1bmN0aW9uIFhkKGEsYixjKXtmb3IoO251bGwhPT1hOyl7dmFyIGQ9YS5hbHRlcm5hdGU7KGEuY2hpbGRMYW5lcyZiKSE9PWI/KGEuY2hpbGRMYW5lc3w9YixudWxsIT09ZCYmKGQuY2hpbGRMYW5lc3w9YikpOm51bGwhPT1kJiYoZC5jaGlsZExhbmVzJmIpIT09YiYmKGQuY2hpbGRMYW5lc3w9Yik7aWYoYT09PWMpYnJlYWs7YT1hLnJldHVybn19ZnVuY3Rpb24gWWQoYSxiKXtSZD1hO1RkPVNkPW51bGw7YT1hLmRlcGVuZGVuY2llcztudWxsIT09YSYmbnVsbCE9PWEuZmlyc3RDb250ZXh0JiYoMCE9PShhLmxhbmVzJmIpJiYoRz0hMCksYS5maXJzdENvbnRleHQ9bnVsbCl9XG5mdW5jdGlvbiBaZChhKXt2YXIgYj1TYT9hLl9jdXJyZW50VmFsdWU6YS5fY3VycmVudFZhbHVlMjtpZihUZCE9PWEpaWYoYT17Y29udGV4dDphLG1lbW9pemVkVmFsdWU6YixuZXh0Om51bGx9LG51bGw9PT1TZCl7aWYobnVsbD09PVJkKXRocm93IEVycm9yKG4oMzA4KSk7U2Q9YTtSZC5kZXBlbmRlbmNpZXM9e2xhbmVzOjAsZmlyc3RDb250ZXh0OmF9fWVsc2UgU2Q9U2QubmV4dD1hO3JldHVybiBifXZhciAkZD1udWxsO2Z1bmN0aW9uIGFlKGEpe251bGw9PT0kZD8kZD1bYV06JGQucHVzaChhKX1mdW5jdGlvbiBiZShhLGIsYyxkKXt2YXIgZT1iLmludGVybGVhdmVkO251bGw9PT1lPyhjLm5leHQ9YyxhZShiKSk6KGMubmV4dD1lLm5leHQsZS5uZXh0PWMpO2IuaW50ZXJsZWF2ZWQ9YztyZXR1cm4gY2UoYSxkKX1cbmZ1bmN0aW9uIGNlKGEsYil7YS5sYW5lc3w9Yjt2YXIgYz1hLmFsdGVybmF0ZTtudWxsIT09YyYmKGMubGFuZXN8PWIpO2M9YTtmb3IoYT1hLnJldHVybjtudWxsIT09YTspYS5jaGlsZExhbmVzfD1iLGM9YS5hbHRlcm5hdGUsbnVsbCE9PWMmJihjLmNoaWxkTGFuZXN8PWIpLGM9YSxhPWEucmV0dXJuO3JldHVybiAzPT09Yy50YWc/Yy5zdGF0ZU5vZGU6bnVsbH12YXIgZGU9ITE7ZnVuY3Rpb24gZWUoYSl7YS51cGRhdGVRdWV1ZT17YmFzZVN0YXRlOmEubWVtb2l6ZWRTdGF0ZSxmaXJzdEJhc2VVcGRhdGU6bnVsbCxsYXN0QmFzZVVwZGF0ZTpudWxsLHNoYXJlZDp7cGVuZGluZzpudWxsLGludGVybGVhdmVkOm51bGwsbGFuZXM6MH0sZWZmZWN0czpudWxsfX1cbmZ1bmN0aW9uIGZlKGEsYil7YT1hLnVwZGF0ZVF1ZXVlO2IudXBkYXRlUXVldWU9PT1hJiYoYi51cGRhdGVRdWV1ZT17YmFzZVN0YXRlOmEuYmFzZVN0YXRlLGZpcnN0QmFzZVVwZGF0ZTphLmZpcnN0QmFzZVVwZGF0ZSxsYXN0QmFzZVVwZGF0ZTphLmxhc3RCYXNlVXBkYXRlLHNoYXJlZDphLnNoYXJlZCxlZmZlY3RzOmEuZWZmZWN0c30pfWZ1bmN0aW9uIGdlKGEsYil7cmV0dXJue2V2ZW50VGltZTphLGxhbmU6Yix0YWc6MCxwYXlsb2FkOm51bGwsY2FsbGJhY2s6bnVsbCxuZXh0Om51bGx9fVxuZnVuY3Rpb24gaGUoYSxiLGMpe3ZhciBkPWEudXBkYXRlUXVldWU7aWYobnVsbD09PWQpcmV0dXJuIG51bGw7ZD1kLnNoYXJlZDtpZigwIT09KEgmMikpe3ZhciBlPWQucGVuZGluZztudWxsPT09ZT9iLm5leHQ9YjooYi5uZXh0PWUubmV4dCxlLm5leHQ9Yik7ZC5wZW5kaW5nPWI7cmV0dXJuIGNlKGEsYyl9ZT1kLmludGVybGVhdmVkO251bGw9PT1lPyhiLm5leHQ9YixhZShkKSk6KGIubmV4dD1lLm5leHQsZS5uZXh0PWIpO2QuaW50ZXJsZWF2ZWQ9YjtyZXR1cm4gY2UoYSxjKX1mdW5jdGlvbiBpZShhLGIsYyl7Yj1iLnVwZGF0ZVF1ZXVlO2lmKG51bGwhPT1iJiYoYj1iLnNoYXJlZCwwIT09KGMmNDE5NDI0MCkpKXt2YXIgZD1iLmxhbmVzO2QmPWEucGVuZGluZ0xhbmVzO2N8PWQ7Yi5sYW5lcz1jO0hjKGEsYyl9fVxuZnVuY3Rpb24gamUoYSxiKXt2YXIgYz1hLnVwZGF0ZVF1ZXVlLGQ9YS5hbHRlcm5hdGU7aWYobnVsbCE9PWQmJihkPWQudXBkYXRlUXVldWUsYz09PWQpKXt2YXIgZT1udWxsLGY9bnVsbDtjPWMuZmlyc3RCYXNlVXBkYXRlO2lmKG51bGwhPT1jKXtkb3t2YXIgZz17ZXZlbnRUaW1lOmMuZXZlbnRUaW1lLGxhbmU6Yy5sYW5lLHRhZzpjLnRhZyxwYXlsb2FkOmMucGF5bG9hZCxjYWxsYmFjazpjLmNhbGxiYWNrLG5leHQ6bnVsbH07bnVsbD09PWY/ZT1mPWc6Zj1mLm5leHQ9ZztjPWMubmV4dH13aGlsZShudWxsIT09Yyk7bnVsbD09PWY/ZT1mPWI6Zj1mLm5leHQ9Yn1lbHNlIGU9Zj1iO2M9e2Jhc2VTdGF0ZTpkLmJhc2VTdGF0ZSxmaXJzdEJhc2VVcGRhdGU6ZSxsYXN0QmFzZVVwZGF0ZTpmLHNoYXJlZDpkLnNoYXJlZCxlZmZlY3RzOmQuZWZmZWN0c307YS51cGRhdGVRdWV1ZT1jO3JldHVybn1hPWMubGFzdEJhc2VVcGRhdGU7bnVsbD09PWE/Yy5maXJzdEJhc2VVcGRhdGU9YjphLm5leHQ9XG5iO2MubGFzdEJhc2VVcGRhdGU9Yn1cbmZ1bmN0aW9uIGtlKGEsYixjLGQpe3ZhciBlPWEudXBkYXRlUXVldWU7ZGU9ITE7dmFyIGY9ZS5maXJzdEJhc2VVcGRhdGUsZz1lLmxhc3RCYXNlVXBkYXRlLGg9ZS5zaGFyZWQucGVuZGluZztpZihudWxsIT09aCl7ZS5zaGFyZWQucGVuZGluZz1udWxsO3ZhciBrPWgsbD1rLm5leHQ7ay5uZXh0PW51bGw7bnVsbD09PWc/Zj1sOmcubmV4dD1sO2c9azt2YXIgbT1hLmFsdGVybmF0ZTtudWxsIT09bSYmKG09bS51cGRhdGVRdWV1ZSxoPW0ubGFzdEJhc2VVcGRhdGUsaCE9PWcmJihudWxsPT09aD9tLmZpcnN0QmFzZVVwZGF0ZT1sOmgubmV4dD1sLG0ubGFzdEJhc2VVcGRhdGU9aykpfWlmKG51bGwhPT1mKXt2YXIgcj1lLmJhc2VTdGF0ZTtnPTA7bT1sPWs9bnVsbDtoPWY7ZG97dmFyIHA9aC5sYW5lLEI9aC5ldmVudFRpbWU7aWYoKGQmcCk9PT1wKXtudWxsIT09bSYmKG09bS5uZXh0PXtldmVudFRpbWU6QixsYW5lOjAsdGFnOmgudGFnLHBheWxvYWQ6aC5wYXlsb2FkLGNhbGxiYWNrOmguY2FsbGJhY2ssXG5uZXh0Om51bGx9KTthOnt2YXIgdz1hLFk9aDtwPWI7Qj1jO3N3aXRjaChZLnRhZyl7Y2FzZSAxOnc9WS5wYXlsb2FkO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiB3KXtyPXcuY2FsbChCLHIscCk7YnJlYWsgYX1yPXc7YnJlYWsgYTtjYXNlIDM6dy5mbGFncz13LmZsYWdzJi02NTUzN3wxMjg7Y2FzZSAwOnc9WS5wYXlsb2FkO3A9XCJmdW5jdGlvblwiPT09dHlwZW9mIHc/dy5jYWxsKEIscixwKTp3O2lmKG51bGw9PT1wfHx2b2lkIDA9PT1wKWJyZWFrIGE7cj1jYSh7fSxyLHApO2JyZWFrIGE7Y2FzZSAyOmRlPSEwfX1udWxsIT09aC5jYWxsYmFjayYmMCE9PWgubGFuZSYmKGEuZmxhZ3N8PTY0LHA9ZS5lZmZlY3RzLG51bGw9PT1wP2UuZWZmZWN0cz1baF06cC5wdXNoKGgpKX1lbHNlIEI9e2V2ZW50VGltZTpCLGxhbmU6cCx0YWc6aC50YWcscGF5bG9hZDpoLnBheWxvYWQsY2FsbGJhY2s6aC5jYWxsYmFjayxuZXh0Om51bGx9LG51bGw9PT1tPyhsPW09QixrPXIpOm09bS5uZXh0PUIsZ3w9XG5wO2g9aC5uZXh0O2lmKG51bGw9PT1oKWlmKGg9ZS5zaGFyZWQucGVuZGluZyxudWxsPT09aClicmVhaztlbHNlIHA9aCxoPXAubmV4dCxwLm5leHQ9bnVsbCxlLmxhc3RCYXNlVXBkYXRlPXAsZS5zaGFyZWQucGVuZGluZz1udWxsfXdoaWxlKDEpO251bGw9PT1tJiYoaz1yKTtlLmJhc2VTdGF0ZT1rO2UuZmlyc3RCYXNlVXBkYXRlPWw7ZS5sYXN0QmFzZVVwZGF0ZT1tO2I9ZS5zaGFyZWQuaW50ZXJsZWF2ZWQ7aWYobnVsbCE9PWIpe2U9YjtkbyBnfD1lLmxhbmUsZT1lLm5leHQ7d2hpbGUoZSE9PWIpfWVsc2UgbnVsbD09PWYmJihlLnNoYXJlZC5sYW5lcz0wKTtsZXw9ZzthLmxhbmVzPWc7YS5tZW1vaXplZFN0YXRlPXJ9fVxuZnVuY3Rpb24gbWUoYSxiLGMpe2E9Yi5lZmZlY3RzO2IuZWZmZWN0cz1udWxsO2lmKG51bGwhPT1hKWZvcihiPTA7YjxhLmxlbmd0aDtiKyspe3ZhciBkPWFbYl0sZT1kLmNhbGxiYWNrO2lmKG51bGwhPT1lKXtkLmNhbGxiYWNrPW51bGw7ZD1jO2lmKFwiZnVuY3Rpb25cIiE9PXR5cGVvZiBlKXRocm93IEVycm9yKG4oMTkxLGUpKTtlLmNhbGwoZCl9fX12YXIgbmU9e30sb2U9aWMobmUpLHBlPWljKG5lKSxxZT1pYyhuZSk7ZnVuY3Rpb24gcmUoYSl7aWYoYT09PW5lKXRocm93IEVycm9yKG4oMTc0KSk7cmV0dXJuIGF9ZnVuY3Rpb24gc2UoYSxiKXt2KHFlLGIpO3YocGUsYSk7dihvZSxuZSk7YT1GYShiKTtxKG9lKTt2KG9lLGEpfWZ1bmN0aW9uIHRlKCl7cShvZSk7cShwZSk7cShxZSl9ZnVuY3Rpb24gdWUoYSl7dmFyIGI9cmUocWUuY3VycmVudCksYz1yZShvZS5jdXJyZW50KTtiPUdhKGMsYS50eXBlLGIpO2MhPT1iJiYodihwZSxhKSx2KG9lLGIpKX1cbmZ1bmN0aW9uIHZlKGEpe3BlLmN1cnJlbnQ9PT1hJiYocShvZSkscShwZSkpfXZhciBJPWljKDApO2Z1bmN0aW9uIHdlKGEpe2Zvcih2YXIgYj1hO251bGwhPT1iOyl7aWYoMTM9PT1iLnRhZyl7dmFyIGM9Yi5tZW1vaXplZFN0YXRlO2lmKG51bGwhPT1jJiYoYz1jLmRlaHlkcmF0ZWQsbnVsbD09PWN8fEpiKGMpfHxLYihjKSkpcmV0dXJuIGJ9ZWxzZSBpZigxOT09PWIudGFnJiZ2b2lkIDAhPT1iLm1lbW9pemVkUHJvcHMucmV2ZWFsT3JkZXIpe2lmKDAhPT0oYi5mbGFncyYxMjgpKXJldHVybiBifWVsc2UgaWYobnVsbCE9PWIuY2hpbGQpe2IuY2hpbGQucmV0dXJuPWI7Yj1iLmNoaWxkO2NvbnRpbnVlfWlmKGI9PT1hKWJyZWFrO2Zvcig7bnVsbD09PWIuc2libGluZzspe2lmKG51bGw9PT1iLnJldHVybnx8Yi5yZXR1cm49PT1hKXJldHVybiBudWxsO2I9Yi5yZXR1cm59Yi5zaWJsaW5nLnJldHVybj1iLnJldHVybjtiPWIuc2libGluZ31yZXR1cm4gbnVsbH12YXIgeGU9W107XG5mdW5jdGlvbiB5ZSgpe2Zvcih2YXIgYT0wO2E8eGUubGVuZ3RoO2ErKyl7dmFyIGI9eGVbYV07U2E/Yi5fd29ya0luUHJvZ3Jlc3NWZXJzaW9uUHJpbWFyeT1udWxsOmIuX3dvcmtJblByb2dyZXNzVmVyc2lvblNlY29uZGFyeT1udWxsfXhlLmxlbmd0aD0wfXZhciB6ZT1kYS5SZWFjdEN1cnJlbnREaXNwYXRjaGVyLEFlPWRhLlJlYWN0Q3VycmVudEJhdGNoQ29uZmlnLEJlPTAsSj1udWxsLEs9bnVsbCxMPW51bGwsQ2U9ITEsRGU9ITEsRWU9MCxGZT0wO2Z1bmN0aW9uIE0oKXt0aHJvdyBFcnJvcihuKDMyMSkpO31mdW5jdGlvbiBHZShhLGIpe2lmKG51bGw9PT1iKXJldHVybiExO2Zvcih2YXIgYz0wO2M8Yi5sZW5ndGgmJmM8YS5sZW5ndGg7YysrKWlmKCFWYyhhW2NdLGJbY10pKXJldHVybiExO3JldHVybiEwfVxuZnVuY3Rpb24gSGUoYSxiLGMsZCxlLGYpe0JlPWY7Sj1iO2IubWVtb2l6ZWRTdGF0ZT1udWxsO2IudXBkYXRlUXVldWU9bnVsbDtiLmxhbmVzPTA7emUuY3VycmVudD1udWxsPT09YXx8bnVsbD09PWEubWVtb2l6ZWRTdGF0ZT9JZTpKZTthPWMoZCxlKTtpZihEZSl7Zj0wO2Rve0RlPSExO0VlPTA7aWYoMjU8PWYpdGhyb3cgRXJyb3IobigzMDEpKTtmKz0xO0w9Sz1udWxsO2IudXBkYXRlUXVldWU9bnVsbDt6ZS5jdXJyZW50PUtlO2E9YyhkLGUpfXdoaWxlKERlKX16ZS5jdXJyZW50PUxlO2I9bnVsbCE9PUsmJm51bGwhPT1LLm5leHQ7QmU9MDtMPUs9Sj1udWxsO0NlPSExO2lmKGIpdGhyb3cgRXJyb3IobigzMDApKTtyZXR1cm4gYX1mdW5jdGlvbiBNZSgpe3ZhciBhPTAhPT1FZTtFZT0wO3JldHVybiBhfVxuZnVuY3Rpb24gTmUoKXt2YXIgYT17bWVtb2l6ZWRTdGF0ZTpudWxsLGJhc2VTdGF0ZTpudWxsLGJhc2VRdWV1ZTpudWxsLHF1ZXVlOm51bGwsbmV4dDpudWxsfTtudWxsPT09TD9KLm1lbW9pemVkU3RhdGU9TD1hOkw9TC5uZXh0PWE7cmV0dXJuIEx9ZnVuY3Rpb24gT2UoKXtpZihudWxsPT09Syl7dmFyIGE9Si5hbHRlcm5hdGU7YT1udWxsIT09YT9hLm1lbW9pemVkU3RhdGU6bnVsbH1lbHNlIGE9Sy5uZXh0O3ZhciBiPW51bGw9PT1MP0oubWVtb2l6ZWRTdGF0ZTpMLm5leHQ7aWYobnVsbCE9PWIpTD1iLEs9YTtlbHNle2lmKG51bGw9PT1hKXRocm93IEVycm9yKG4oMzEwKSk7Sz1hO2E9e21lbW9pemVkU3RhdGU6Sy5tZW1vaXplZFN0YXRlLGJhc2VTdGF0ZTpLLmJhc2VTdGF0ZSxiYXNlUXVldWU6Sy5iYXNlUXVldWUscXVldWU6Sy5xdWV1ZSxuZXh0Om51bGx9O251bGw9PT1MP0oubWVtb2l6ZWRTdGF0ZT1MPWE6TD1MLm5leHQ9YX1yZXR1cm4gTH1cbmZ1bmN0aW9uIFBlKGEsYil7cmV0dXJuXCJmdW5jdGlvblwiPT09dHlwZW9mIGI/YihhKTpifVxuZnVuY3Rpb24gUWUoYSl7dmFyIGI9T2UoKSxjPWIucXVldWU7aWYobnVsbD09PWMpdGhyb3cgRXJyb3IobigzMTEpKTtjLmxhc3RSZW5kZXJlZFJlZHVjZXI9YTt2YXIgZD1LLGU9ZC5iYXNlUXVldWUsZj1jLnBlbmRpbmc7aWYobnVsbCE9PWYpe2lmKG51bGwhPT1lKXt2YXIgZz1lLm5leHQ7ZS5uZXh0PWYubmV4dDtmLm5leHQ9Z31kLmJhc2VRdWV1ZT1lPWY7Yy5wZW5kaW5nPW51bGx9aWYobnVsbCE9PWUpe2Y9ZS5uZXh0O2Q9ZC5iYXNlU3RhdGU7dmFyIGg9Zz1udWxsLGs9bnVsbCxsPWY7ZG97dmFyIG09bC5sYW5lO2lmKChCZSZtKT09PW0pbnVsbCE9PWsmJihrPWsubmV4dD17bGFuZTowLGFjdGlvbjpsLmFjdGlvbixoYXNFYWdlclN0YXRlOmwuaGFzRWFnZXJTdGF0ZSxlYWdlclN0YXRlOmwuZWFnZXJTdGF0ZSxuZXh0Om51bGx9KSxkPWwuaGFzRWFnZXJTdGF0ZT9sLmVhZ2VyU3RhdGU6YShkLGwuYWN0aW9uKTtlbHNle3ZhciByPXtsYW5lOm0sYWN0aW9uOmwuYWN0aW9uLGhhc0VhZ2VyU3RhdGU6bC5oYXNFYWdlclN0YXRlLFxuZWFnZXJTdGF0ZTpsLmVhZ2VyU3RhdGUsbmV4dDpudWxsfTtudWxsPT09az8oaD1rPXIsZz1kKTprPWsubmV4dD1yO0oubGFuZXN8PW07bGV8PW19bD1sLm5leHR9d2hpbGUobnVsbCE9PWwmJmwhPT1mKTtudWxsPT09az9nPWQ6ay5uZXh0PWg7VmMoZCxiLm1lbW9pemVkU3RhdGUpfHwoRz0hMCk7Yi5tZW1vaXplZFN0YXRlPWQ7Yi5iYXNlU3RhdGU9ZztiLmJhc2VRdWV1ZT1rO2MubGFzdFJlbmRlcmVkU3RhdGU9ZH1hPWMuaW50ZXJsZWF2ZWQ7aWYobnVsbCE9PWEpe2U9YTtkbyBmPWUubGFuZSxKLmxhbmVzfD1mLGxlfD1mLGU9ZS5uZXh0O3doaWxlKGUhPT1hKX1lbHNlIG51bGw9PT1lJiYoYy5sYW5lcz0wKTtyZXR1cm5bYi5tZW1vaXplZFN0YXRlLGMuZGlzcGF0Y2hdfVxuZnVuY3Rpb24gUmUoYSl7dmFyIGI9T2UoKSxjPWIucXVldWU7aWYobnVsbD09PWMpdGhyb3cgRXJyb3IobigzMTEpKTtjLmxhc3RSZW5kZXJlZFJlZHVjZXI9YTt2YXIgZD1jLmRpc3BhdGNoLGU9Yy5wZW5kaW5nLGY9Yi5tZW1vaXplZFN0YXRlO2lmKG51bGwhPT1lKXtjLnBlbmRpbmc9bnVsbDt2YXIgZz1lPWUubmV4dDtkbyBmPWEoZixnLmFjdGlvbiksZz1nLm5leHQ7d2hpbGUoZyE9PWUpO1ZjKGYsYi5tZW1vaXplZFN0YXRlKXx8KEc9ITApO2IubWVtb2l6ZWRTdGF0ZT1mO251bGw9PT1iLmJhc2VRdWV1ZSYmKGIuYmFzZVN0YXRlPWYpO2MubGFzdFJlbmRlcmVkU3RhdGU9Zn1yZXR1cm5bZixkXX1mdW5jdGlvbiBTZSgpe31cbmZ1bmN0aW9uIFRlKGEsYil7dmFyIGM9SixkPU9lKCksZT1iKCksZj0hVmMoZC5tZW1vaXplZFN0YXRlLGUpO2YmJihkLm1lbW9pemVkU3RhdGU9ZSxHPSEwKTtkPWQucXVldWU7VWUoVmUuYmluZChudWxsLGMsZCxhKSxbYV0pO2lmKGQuZ2V0U25hcHNob3QhPT1ifHxmfHxudWxsIT09TCYmTC5tZW1vaXplZFN0YXRlLnRhZyYxKXtjLmZsYWdzfD0yMDQ4O1dlKDksWGUuYmluZChudWxsLGMsZCxlLGIpLHZvaWQgMCxudWxsKTtpZihudWxsPT09Til0aHJvdyBFcnJvcihuKDM0OSkpOzAhPT0oQmUmMzApfHxZZShjLGIsZSl9cmV0dXJuIGV9ZnVuY3Rpb24gWWUoYSxiLGMpe2EuZmxhZ3N8PTE2Mzg0O2E9e2dldFNuYXBzaG90OmIsdmFsdWU6Y307Yj1KLnVwZGF0ZVF1ZXVlO251bGw9PT1iPyhiPXtsYXN0RWZmZWN0Om51bGwsc3RvcmVzOm51bGx9LEoudXBkYXRlUXVldWU9YixiLnN0b3Jlcz1bYV0pOihjPWIuc3RvcmVzLG51bGw9PT1jP2Iuc3RvcmVzPVthXTpjLnB1c2goYSkpfVxuZnVuY3Rpb24gWGUoYSxiLGMsZCl7Yi52YWx1ZT1jO2IuZ2V0U25hcHNob3Q9ZDtaZShiKSYmJGUoYSl9ZnVuY3Rpb24gVmUoYSxiLGMpe3JldHVybiBjKGZ1bmN0aW9uKCl7WmUoYikmJiRlKGEpfSl9ZnVuY3Rpb24gWmUoYSl7dmFyIGI9YS5nZXRTbmFwc2hvdDthPWEudmFsdWU7dHJ5e3ZhciBjPWIoKTtyZXR1cm4hVmMoYSxjKX1jYXRjaChkKXtyZXR1cm4hMH19ZnVuY3Rpb24gJGUoYSl7dmFyIGI9Y2UoYSwxKTtudWxsIT09YiYmYWYoYixhLDEsLTEpfVxuZnVuY3Rpb24gYmYoYSl7dmFyIGI9TmUoKTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgYSYmKGE9YSgpKTtiLm1lbW9pemVkU3RhdGU9Yi5iYXNlU3RhdGU9YTthPXtwZW5kaW5nOm51bGwsaW50ZXJsZWF2ZWQ6bnVsbCxsYW5lczowLGRpc3BhdGNoOm51bGwsbGFzdFJlbmRlcmVkUmVkdWNlcjpQZSxsYXN0UmVuZGVyZWRTdGF0ZTphfTtiLnF1ZXVlPWE7YT1hLmRpc3BhdGNoPWNmLmJpbmQobnVsbCxKLGEpO3JldHVybltiLm1lbW9pemVkU3RhdGUsYV19XG5mdW5jdGlvbiBXZShhLGIsYyxkKXthPXt0YWc6YSxjcmVhdGU6YixkZXN0cm95OmMsZGVwczpkLG5leHQ6bnVsbH07Yj1KLnVwZGF0ZVF1ZXVlO251bGw9PT1iPyhiPXtsYXN0RWZmZWN0Om51bGwsc3RvcmVzOm51bGx9LEoudXBkYXRlUXVldWU9YixiLmxhc3RFZmZlY3Q9YS5uZXh0PWEpOihjPWIubGFzdEVmZmVjdCxudWxsPT09Yz9iLmxhc3RFZmZlY3Q9YS5uZXh0PWE6KGQ9Yy5uZXh0LGMubmV4dD1hLGEubmV4dD1kLGIubGFzdEVmZmVjdD1hKSk7cmV0dXJuIGF9ZnVuY3Rpb24gZGYoKXtyZXR1cm4gT2UoKS5tZW1vaXplZFN0YXRlfWZ1bmN0aW9uIGVmKGEsYixjLGQpe3ZhciBlPU5lKCk7Si5mbGFnc3w9YTtlLm1lbW9pemVkU3RhdGU9V2UoMXxiLGMsdm9pZCAwLHZvaWQgMD09PWQ/bnVsbDpkKX1cbmZ1bmN0aW9uIGZmKGEsYixjLGQpe3ZhciBlPU9lKCk7ZD12b2lkIDA9PT1kP251bGw6ZDt2YXIgZj12b2lkIDA7aWYobnVsbCE9PUspe3ZhciBnPUsubWVtb2l6ZWRTdGF0ZTtmPWcuZGVzdHJveTtpZihudWxsIT09ZCYmR2UoZCxnLmRlcHMpKXtlLm1lbW9pemVkU3RhdGU9V2UoYixjLGYsZCk7cmV0dXJufX1KLmZsYWdzfD1hO2UubWVtb2l6ZWRTdGF0ZT1XZSgxfGIsYyxmLGQpfWZ1bmN0aW9uIGdmKGEsYil7cmV0dXJuIGVmKDgzOTA2NTYsOCxhLGIpfWZ1bmN0aW9uIFVlKGEsYil7cmV0dXJuIGZmKDIwNDgsOCxhLGIpfWZ1bmN0aW9uIGhmKGEsYil7cmV0dXJuIGZmKDQsMixhLGIpfWZ1bmN0aW9uIGpmKGEsYil7cmV0dXJuIGZmKDQsNCxhLGIpfVxuZnVuY3Rpb24ga2YoYSxiKXtpZihcImZ1bmN0aW9uXCI9PT10eXBlb2YgYilyZXR1cm4gYT1hKCksYihhKSxmdW5jdGlvbigpe2IobnVsbCl9O2lmKG51bGwhPT1iJiZ2b2lkIDAhPT1iKXJldHVybiBhPWEoKSxiLmN1cnJlbnQ9YSxmdW5jdGlvbigpe2IuY3VycmVudD1udWxsfX1mdW5jdGlvbiBsZihhLGIsYyl7Yz1udWxsIT09YyYmdm9pZCAwIT09Yz9jLmNvbmNhdChbYV0pOm51bGw7cmV0dXJuIGZmKDQsNCxrZi5iaW5kKG51bGwsYixhKSxjKX1mdW5jdGlvbiBtZigpe31mdW5jdGlvbiBuZihhLGIpe3ZhciBjPU9lKCk7Yj12b2lkIDA9PT1iP251bGw6Yjt2YXIgZD1jLm1lbW9pemVkU3RhdGU7aWYobnVsbCE9PWQmJm51bGwhPT1iJiZHZShiLGRbMV0pKXJldHVybiBkWzBdO2MubWVtb2l6ZWRTdGF0ZT1bYSxiXTtyZXR1cm4gYX1cbmZ1bmN0aW9uIG9mKGEsYil7dmFyIGM9T2UoKTtiPXZvaWQgMD09PWI/bnVsbDpiO3ZhciBkPWMubWVtb2l6ZWRTdGF0ZTtpZihudWxsIT09ZCYmbnVsbCE9PWImJkdlKGIsZFsxXSkpcmV0dXJuIGRbMF07YT1hKCk7Yy5tZW1vaXplZFN0YXRlPVthLGJdO3JldHVybiBhfWZ1bmN0aW9uIHBmKGEsYixjKXtpZigwPT09KEJlJjIxKSlyZXR1cm4gYS5iYXNlU3RhdGUmJihhLmJhc2VTdGF0ZT0hMSxHPSEwKSxhLm1lbW9pemVkU3RhdGU9YztWYyhjLGIpfHwoYz1EYygpLEoubGFuZXN8PWMsbGV8PWMsYS5iYXNlU3RhdGU9ITApO3JldHVybiBifWZ1bmN0aW9uIHFmKGEsYil7dmFyIGM9QztDPTAhPT1jJiY0PmM/Yzo0O2EoITApO3ZhciBkPUFlLnRyYW5zaXRpb247QWUudHJhbnNpdGlvbj17fTt0cnl7YSghMSksYigpfWZpbmFsbHl7Qz1jLEFlLnRyYW5zaXRpb249ZH19ZnVuY3Rpb24gcmYoKXtyZXR1cm4gT2UoKS5tZW1vaXplZFN0YXRlfVxuZnVuY3Rpb24gc2YoYSxiLGMpe3ZhciBkPXRmKGEpO2M9e2xhbmU6ZCxhY3Rpb246YyxoYXNFYWdlclN0YXRlOiExLGVhZ2VyU3RhdGU6bnVsbCxuZXh0Om51bGx9O2lmKHVmKGEpKXZmKGIsYyk7ZWxzZSBpZihjPWJlKGEsYixjLGQpLG51bGwhPT1jKXt2YXIgZT1PKCk7YWYoYyxhLGQsZSk7d2YoYyxiLGQpfX1cbmZ1bmN0aW9uIGNmKGEsYixjKXt2YXIgZD10ZihhKSxlPXtsYW5lOmQsYWN0aW9uOmMsaGFzRWFnZXJTdGF0ZTohMSxlYWdlclN0YXRlOm51bGwsbmV4dDpudWxsfTtpZih1ZihhKSl2ZihiLGUpO2Vsc2V7dmFyIGY9YS5hbHRlcm5hdGU7aWYoMD09PWEubGFuZXMmJihudWxsPT09Znx8MD09PWYubGFuZXMpJiYoZj1iLmxhc3RSZW5kZXJlZFJlZHVjZXIsbnVsbCE9PWYpKXRyeXt2YXIgZz1iLmxhc3RSZW5kZXJlZFN0YXRlLGg9ZihnLGMpO2UuaGFzRWFnZXJTdGF0ZT0hMDtlLmVhZ2VyU3RhdGU9aDtpZihWYyhoLGcpKXt2YXIgaz1iLmludGVybGVhdmVkO251bGw9PT1rPyhlLm5leHQ9ZSxhZShiKSk6KGUubmV4dD1rLm5leHQsay5uZXh0PWUpO2IuaW50ZXJsZWF2ZWQ9ZTtyZXR1cm59fWNhdGNoKGwpe31maW5hbGx5e31jPWJlKGEsYixlLGQpO251bGwhPT1jJiYoZT1PKCksYWYoYyxhLGQsZSksd2YoYyxiLGQpKX19XG5mdW5jdGlvbiB1ZihhKXt2YXIgYj1hLmFsdGVybmF0ZTtyZXR1cm4gYT09PUp8fG51bGwhPT1iJiZiPT09Sn1mdW5jdGlvbiB2ZihhLGIpe0RlPUNlPSEwO3ZhciBjPWEucGVuZGluZztudWxsPT09Yz9iLm5leHQ9YjooYi5uZXh0PWMubmV4dCxjLm5leHQ9Yik7YS5wZW5kaW5nPWJ9ZnVuY3Rpb24gd2YoYSxiLGMpe2lmKDAhPT0oYyY0MTk0MjQwKSl7dmFyIGQ9Yi5sYW5lcztkJj1hLnBlbmRpbmdMYW5lcztjfD1kO2IubGFuZXM9YztIYyhhLGMpfX1cbnZhciBMZT17cmVhZENvbnRleHQ6WmQsdXNlQ2FsbGJhY2s6TSx1c2VDb250ZXh0Ok0sdXNlRWZmZWN0Ok0sdXNlSW1wZXJhdGl2ZUhhbmRsZTpNLHVzZUluc2VydGlvbkVmZmVjdDpNLHVzZUxheW91dEVmZmVjdDpNLHVzZU1lbW86TSx1c2VSZWR1Y2VyOk0sdXNlUmVmOk0sdXNlU3RhdGU6TSx1c2VEZWJ1Z1ZhbHVlOk0sdXNlRGVmZXJyZWRWYWx1ZTpNLHVzZVRyYW5zaXRpb246TSx1c2VNdXRhYmxlU291cmNlOk0sdXNlU3luY0V4dGVybmFsU3RvcmU6TSx1c2VJZDpNLHVuc3RhYmxlX2lzTmV3UmVjb25jaWxlcjohMX0sSWU9e3JlYWRDb250ZXh0OlpkLHVzZUNhbGxiYWNrOmZ1bmN0aW9uKGEsYil7TmUoKS5tZW1vaXplZFN0YXRlPVthLHZvaWQgMD09PWI/bnVsbDpiXTtyZXR1cm4gYX0sdXNlQ29udGV4dDpaZCx1c2VFZmZlY3Q6Z2YsdXNlSW1wZXJhdGl2ZUhhbmRsZTpmdW5jdGlvbihhLGIsYyl7Yz1udWxsIT09YyYmdm9pZCAwIT09Yz9jLmNvbmNhdChbYV0pOm51bGw7cmV0dXJuIGVmKDQxOTQzMDgsXG40LGtmLmJpbmQobnVsbCxiLGEpLGMpfSx1c2VMYXlvdXRFZmZlY3Q6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZWYoNDE5NDMwOCw0LGEsYil9LHVzZUluc2VydGlvbkVmZmVjdDpmdW5jdGlvbihhLGIpe3JldHVybiBlZig0LDIsYSxiKX0sdXNlTWVtbzpmdW5jdGlvbihhLGIpe3ZhciBjPU5lKCk7Yj12b2lkIDA9PT1iP251bGw6YjthPWEoKTtjLm1lbW9pemVkU3RhdGU9W2EsYl07cmV0dXJuIGF9LHVzZVJlZHVjZXI6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPU5lKCk7Yj12b2lkIDAhPT1jP2MoYik6YjtkLm1lbW9pemVkU3RhdGU9ZC5iYXNlU3RhdGU9YjthPXtwZW5kaW5nOm51bGwsaW50ZXJsZWF2ZWQ6bnVsbCxsYW5lczowLGRpc3BhdGNoOm51bGwsbGFzdFJlbmRlcmVkUmVkdWNlcjphLGxhc3RSZW5kZXJlZFN0YXRlOmJ9O2QucXVldWU9YTthPWEuZGlzcGF0Y2g9c2YuYmluZChudWxsLEosYSk7cmV0dXJuW2QubWVtb2l6ZWRTdGF0ZSxhXX0sdXNlUmVmOmZ1bmN0aW9uKGEpe3ZhciBiPVxuTmUoKTthPXtjdXJyZW50OmF9O3JldHVybiBiLm1lbW9pemVkU3RhdGU9YX0sdXNlU3RhdGU6YmYsdXNlRGVidWdWYWx1ZTptZix1c2VEZWZlcnJlZFZhbHVlOmZ1bmN0aW9uKGEpe3JldHVybiBOZSgpLm1lbW9pemVkU3RhdGU9YX0sdXNlVHJhbnNpdGlvbjpmdW5jdGlvbigpe3ZhciBhPWJmKCExKSxiPWFbMF07YT1xZi5iaW5kKG51bGwsYVsxXSk7TmUoKS5tZW1vaXplZFN0YXRlPWE7cmV0dXJuW2IsYV19LHVzZU11dGFibGVTb3VyY2U6ZnVuY3Rpb24oKXt9LHVzZVN5bmNFeHRlcm5hbFN0b3JlOmZ1bmN0aW9uKGEsYixjKXt2YXIgZD1KLGU9TmUoKTtpZihGKXtpZih2b2lkIDA9PT1jKXRocm93IEVycm9yKG4oNDA3KSk7Yz1jKCl9ZWxzZXtjPWIoKTtpZihudWxsPT09Til0aHJvdyBFcnJvcihuKDM0OSkpOzAhPT0oQmUmMzApfHxZZShkLGIsYyl9ZS5tZW1vaXplZFN0YXRlPWM7dmFyIGY9e3ZhbHVlOmMsZ2V0U25hcHNob3Q6Yn07ZS5xdWV1ZT1mO2dmKFZlLmJpbmQobnVsbCxkLFxuZixhKSxbYV0pO2QuZmxhZ3N8PTIwNDg7V2UoOSxYZS5iaW5kKG51bGwsZCxmLGMsYiksdm9pZCAwLG51bGwpO3JldHVybiBjfSx1c2VJZDpmdW5jdGlvbigpe3ZhciBhPU5lKCksYj1OLmlkZW50aWZpZXJQcmVmaXg7aWYoRil7dmFyIGM9amQ7dmFyIGQ9aWQ7Yz0oZCZ+KDE8PDMyLXRjKGQpLTEpKS50b1N0cmluZygzMikrYztiPVwiOlwiK2IrXCJSXCIrYztjPUVlKys7MDxjJiYoYis9XCJIXCIrYy50b1N0cmluZygzMikpO2IrPVwiOlwifWVsc2UgYz1GZSsrLGI9XCI6XCIrYitcInJcIitjLnRvU3RyaW5nKDMyKStcIjpcIjtyZXR1cm4gYS5tZW1vaXplZFN0YXRlPWJ9LHVuc3RhYmxlX2lzTmV3UmVjb25jaWxlcjohMX0sSmU9e3JlYWRDb250ZXh0OlpkLHVzZUNhbGxiYWNrOm5mLHVzZUNvbnRleHQ6WmQsdXNlRWZmZWN0OlVlLHVzZUltcGVyYXRpdmVIYW5kbGU6bGYsdXNlSW5zZXJ0aW9uRWZmZWN0OmhmLHVzZUxheW91dEVmZmVjdDpqZix1c2VNZW1vOm9mLHVzZVJlZHVjZXI6UWUsdXNlUmVmOmRmLHVzZVN0YXRlOmZ1bmN0aW9uKCl7cmV0dXJuIFFlKFBlKX0sXG51c2VEZWJ1Z1ZhbHVlOm1mLHVzZURlZmVycmVkVmFsdWU6ZnVuY3Rpb24oYSl7dmFyIGI9T2UoKTtyZXR1cm4gcGYoYixLLm1lbW9pemVkU3RhdGUsYSl9LHVzZVRyYW5zaXRpb246ZnVuY3Rpb24oKXt2YXIgYT1RZShQZSlbMF0sYj1PZSgpLm1lbW9pemVkU3RhdGU7cmV0dXJuW2EsYl19LHVzZU11dGFibGVTb3VyY2U6U2UsdXNlU3luY0V4dGVybmFsU3RvcmU6VGUsdXNlSWQ6cmYsdW5zdGFibGVfaXNOZXdSZWNvbmNpbGVyOiExfSxLZT17cmVhZENvbnRleHQ6WmQsdXNlQ2FsbGJhY2s6bmYsdXNlQ29udGV4dDpaZCx1c2VFZmZlY3Q6VWUsdXNlSW1wZXJhdGl2ZUhhbmRsZTpsZix1c2VJbnNlcnRpb25FZmZlY3Q6aGYsdXNlTGF5b3V0RWZmZWN0OmpmLHVzZU1lbW86b2YsdXNlUmVkdWNlcjpSZSx1c2VSZWY6ZGYsdXNlU3RhdGU6ZnVuY3Rpb24oKXtyZXR1cm4gUmUoUGUpfSx1c2VEZWJ1Z1ZhbHVlOm1mLHVzZURlZmVycmVkVmFsdWU6ZnVuY3Rpb24oYSl7dmFyIGI9T2UoKTtyZXR1cm4gbnVsbD09PVxuSz9iLm1lbW9pemVkU3RhdGU9YTpwZihiLEsubWVtb2l6ZWRTdGF0ZSxhKX0sdXNlVHJhbnNpdGlvbjpmdW5jdGlvbigpe3ZhciBhPVJlKFBlKVswXSxiPU9lKCkubWVtb2l6ZWRTdGF0ZTtyZXR1cm5bYSxiXX0sdXNlTXV0YWJsZVNvdXJjZTpTZSx1c2VTeW5jRXh0ZXJuYWxTdG9yZTpUZSx1c2VJZDpyZix1bnN0YWJsZV9pc05ld1JlY29uY2lsZXI6ITF9O2Z1bmN0aW9uIHhmKGEsYil7aWYoYSYmYS5kZWZhdWx0UHJvcHMpe2I9Y2Eoe30sYik7YT1hLmRlZmF1bHRQcm9wcztmb3IodmFyIGMgaW4gYSl2b2lkIDA9PT1iW2NdJiYoYltjXT1hW2NdKTtyZXR1cm4gYn1yZXR1cm4gYn1mdW5jdGlvbiB5ZihhLGIsYyxkKXtiPWEubWVtb2l6ZWRTdGF0ZTtjPWMoZCxiKTtjPW51bGw9PT1jfHx2b2lkIDA9PT1jP2I6Y2Eoe30sYixjKTthLm1lbW9pemVkU3RhdGU9YzswPT09YS5sYW5lcyYmKGEudXBkYXRlUXVldWUuYmFzZVN0YXRlPWMpfVxudmFyIHpmPXtpc01vdW50ZWQ6ZnVuY3Rpb24oYSl7cmV0dXJuKGE9YS5fcmVhY3RJbnRlcm5hbHMpP3dhKGEpPT09YTohMX0sZW5xdWV1ZVNldFN0YXRlOmZ1bmN0aW9uKGEsYixjKXthPWEuX3JlYWN0SW50ZXJuYWxzO3ZhciBkPU8oKSxlPXRmKGEpLGY9Z2UoZCxlKTtmLnBheWxvYWQ9Yjt2b2lkIDAhPT1jJiZudWxsIT09YyYmKGYuY2FsbGJhY2s9Yyk7Yj1oZShhLGYsZSk7bnVsbCE9PWImJihhZihiLGEsZSxkKSxpZShiLGEsZSkpfSxlbnF1ZXVlUmVwbGFjZVN0YXRlOmZ1bmN0aW9uKGEsYixjKXthPWEuX3JlYWN0SW50ZXJuYWxzO3ZhciBkPU8oKSxlPXRmKGEpLGY9Z2UoZCxlKTtmLnRhZz0xO2YucGF5bG9hZD1iO3ZvaWQgMCE9PWMmJm51bGwhPT1jJiYoZi5jYWxsYmFjaz1jKTtiPWhlKGEsZixlKTtudWxsIT09YiYmKGFmKGIsYSxlLGQpLGllKGIsYSxlKSl9LGVucXVldWVGb3JjZVVwZGF0ZTpmdW5jdGlvbihhLGIpe2E9YS5fcmVhY3RJbnRlcm5hbHM7dmFyIGM9TygpLGQ9XG50ZihhKSxlPWdlKGMsZCk7ZS50YWc9Mjt2b2lkIDAhPT1iJiZudWxsIT09YiYmKGUuY2FsbGJhY2s9Yik7Yj1oZShhLGUsZCk7bnVsbCE9PWImJihhZihiLGEsZCxjKSxpZShiLGEsZCkpfX07ZnVuY3Rpb24gQWYoYSxiLGMsZCxlLGYsZyl7YT1hLnN0YXRlTm9kZTtyZXR1cm5cImZ1bmN0aW9uXCI9PT10eXBlb2YgYS5zaG91bGRDb21wb25lbnRVcGRhdGU/YS5zaG91bGRDb21wb25lbnRVcGRhdGUoZCxmLGcpOmIucHJvdG90eXBlJiZiLnByb3RvdHlwZS5pc1B1cmVSZWFjdENvbXBvbmVudD8hRGQoYyxkKXx8IURkKGUsZik6ITB9XG5mdW5jdGlvbiBCZihhLGIsYyl7dmFyIGQ9ITEsZT1qYzt2YXIgZj1iLmNvbnRleHRUeXBlO1wib2JqZWN0XCI9PT10eXBlb2YgZiYmbnVsbCE9PWY/Zj1aZChmKTooZT1BKGIpP2tjOnguY3VycmVudCxkPWIuY29udGV4dFR5cGVzLGY9KGQ9bnVsbCE9PWQmJnZvaWQgMCE9PWQpP21jKGEsZSk6amMpO2I9bmV3IGIoYyxmKTthLm1lbW9pemVkU3RhdGU9bnVsbCE9PWIuc3RhdGUmJnZvaWQgMCE9PWIuc3RhdGU/Yi5zdGF0ZTpudWxsO2IudXBkYXRlcj16ZjthLnN0YXRlTm9kZT1iO2IuX3JlYWN0SW50ZXJuYWxzPWE7ZCYmKGE9YS5zdGF0ZU5vZGUsYS5fX3JlYWN0SW50ZXJuYWxNZW1vaXplZFVubWFza2VkQ2hpbGRDb250ZXh0PWUsYS5fX3JlYWN0SW50ZXJuYWxNZW1vaXplZE1hc2tlZENoaWxkQ29udGV4dD1mKTtyZXR1cm4gYn1cbmZ1bmN0aW9uIENmKGEsYixjLGQpe2E9Yi5zdGF0ZTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgYi5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJiZiLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMoYyxkKTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgYi5VTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyYmYi5VTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhjLGQpO2Iuc3RhdGUhPT1hJiZ6Zi5lbnF1ZXVlUmVwbGFjZVN0YXRlKGIsYi5zdGF0ZSxudWxsKX1cbmZ1bmN0aW9uIERmKGEsYixjLGQpe3ZhciBlPWEuc3RhdGVOb2RlO2UucHJvcHM9YztlLnN0YXRlPWEubWVtb2l6ZWRTdGF0ZTtlLnJlZnM9e307ZWUoYSk7dmFyIGY9Yi5jb250ZXh0VHlwZTtcIm9iamVjdFwiPT09dHlwZW9mIGYmJm51bGwhPT1mP2UuY29udGV4dD1aZChmKTooZj1BKGIpP2tjOnguY3VycmVudCxlLmNvbnRleHQ9bWMoYSxmKSk7ZS5zdGF0ZT1hLm1lbW9pemVkU3RhdGU7Zj1iLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcztcImZ1bmN0aW9uXCI9PT10eXBlb2YgZiYmKHlmKGEsYixmLGMpLGUuc3RhdGU9YS5tZW1vaXplZFN0YXRlKTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgYi5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHN8fFwiZnVuY3Rpb25cIj09PXR5cGVvZiBlLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlfHxcImZ1bmN0aW9uXCIhPT10eXBlb2YgZS5VTlNBRkVfY29tcG9uZW50V2lsbE1vdW50JiZcImZ1bmN0aW9uXCIhPT10eXBlb2YgZS5jb21wb25lbnRXaWxsTW91bnR8fChiPWUuc3RhdGUsXG5cImZ1bmN0aW9uXCI9PT10eXBlb2YgZS5jb21wb25lbnRXaWxsTW91bnQmJmUuY29tcG9uZW50V2lsbE1vdW50KCksXCJmdW5jdGlvblwiPT09dHlwZW9mIGUuVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCYmZS5VTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCksYiE9PWUuc3RhdGUmJnpmLmVucXVldWVSZXBsYWNlU3RhdGUoZSxlLnN0YXRlLG51bGwpLGtlKGEsYyxlLGQpLGUuc3RhdGU9YS5tZW1vaXplZFN0YXRlKTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgZS5jb21wb25lbnREaWRNb3VudCYmKGEuZmxhZ3N8PTQxOTQzMDgpfWZ1bmN0aW9uIEVmKGEsYil7dHJ5e3ZhciBjPVwiXCIsZD1iO2RvIGMrPUVkKGQpLGQ9ZC5yZXR1cm47d2hpbGUoZCk7dmFyIGU9Y31jYXRjaChmKXtlPVwiXFxuRXJyb3IgZ2VuZXJhdGluZyBzdGFjazogXCIrZi5tZXNzYWdlK1wiXFxuXCIrZi5zdGFja31yZXR1cm57dmFsdWU6YSxzb3VyY2U6YixzdGFjazplLGRpZ2VzdDpudWxsfX1cbmZ1bmN0aW9uIEZmKGEsYixjKXtyZXR1cm57dmFsdWU6YSxzb3VyY2U6bnVsbCxzdGFjazpudWxsIT1jP2M6bnVsbCxkaWdlc3Q6bnVsbCE9Yj9iOm51bGx9fWZ1bmN0aW9uIEdmKGEsYil7dHJ5e2NvbnNvbGUuZXJyb3IoYi52YWx1ZSl9Y2F0Y2goYyl7c2V0VGltZW91dChmdW5jdGlvbigpe3Rocm93IGM7fSl9fXZhciBIZj1cImZ1bmN0aW9uXCI9PT10eXBlb2YgV2Vha01hcD9XZWFrTWFwOk1hcDtmdW5jdGlvbiBJZihhLGIsYyl7Yz1nZSgtMSxjKTtjLnRhZz0zO2MucGF5bG9hZD17ZWxlbWVudDpudWxsfTt2YXIgZD1iLnZhbHVlO2MuY2FsbGJhY2s9ZnVuY3Rpb24oKXtKZnx8KEpmPSEwLEtmPWQpO0dmKGEsYil9O3JldHVybiBjfVxuZnVuY3Rpb24gTGYoYSxiLGMpe2M9Z2UoLTEsYyk7Yy50YWc9Mzt2YXIgZD1hLnR5cGUuZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBkKXt2YXIgZT1iLnZhbHVlO2MucGF5bG9hZD1mdW5jdGlvbigpe3JldHVybiBkKGUpfTtjLmNhbGxiYWNrPWZ1bmN0aW9uKCl7R2YoYSxiKX19dmFyIGY9YS5zdGF0ZU5vZGU7bnVsbCE9PWYmJlwiZnVuY3Rpb25cIj09PXR5cGVvZiBmLmNvbXBvbmVudERpZENhdGNoJiYoYy5jYWxsYmFjaz1mdW5jdGlvbigpe0dmKGEsYik7XCJmdW5jdGlvblwiIT09dHlwZW9mIGQmJihudWxsPT09TWY/TWY9bmV3IFNldChbdGhpc10pOk1mLmFkZCh0aGlzKSk7dmFyIGM9Yi5zdGFjazt0aGlzLmNvbXBvbmVudERpZENhdGNoKGIudmFsdWUse2NvbXBvbmVudFN0YWNrOm51bGwhPT1jP2M6XCJcIn0pfSk7cmV0dXJuIGN9XG5mdW5jdGlvbiBOZihhLGIsYyl7dmFyIGQ9YS5waW5nQ2FjaGU7aWYobnVsbD09PWQpe2Q9YS5waW5nQ2FjaGU9bmV3IEhmO3ZhciBlPW5ldyBTZXQ7ZC5zZXQoYixlKX1lbHNlIGU9ZC5nZXQoYiksdm9pZCAwPT09ZSYmKGU9bmV3IFNldCxkLnNldChiLGUpKTtlLmhhcyhjKXx8KGUuYWRkKGMpLGE9T2YuYmluZChudWxsLGEsYixjKSxiLnRoZW4oYSxhKSl9ZnVuY3Rpb24gUGYoYSl7ZG97dmFyIGI7aWYoYj0xMz09PWEudGFnKWI9YS5tZW1vaXplZFN0YXRlLGI9bnVsbCE9PWI/bnVsbCE9PWIuZGVoeWRyYXRlZD8hMDohMTohMDtpZihiKXJldHVybiBhO2E9YS5yZXR1cm59d2hpbGUobnVsbCE9PWEpO3JldHVybiBudWxsfVxuZnVuY3Rpb24gUWYoYSxiLGMsZCxlKXtpZigwPT09KGEubW9kZSYxKSlyZXR1cm4gYT09PWI/YS5mbGFnc3w9NjU1MzY6KGEuZmxhZ3N8PTEyOCxjLmZsYWdzfD0xMzEwNzIsYy5mbGFncyY9LTUyODA1LDE9PT1jLnRhZyYmKG51bGw9PT1jLmFsdGVybmF0ZT9jLnRhZz0xNzooYj1nZSgtMSwxKSxiLnRhZz0yLGhlKGMsYiwxKSkpLGMubGFuZXN8PTEpLGE7YS5mbGFnc3w9NjU1MzY7YS5sYW5lcz1lO3JldHVybiBhfXZhciBSZj1kYS5SZWFjdEN1cnJlbnRPd25lcixHPSExO2Z1bmN0aW9uIFAoYSxiLGMsZCl7Yi5jaGlsZD1udWxsPT09YT9QZChiLG51bGwsYyxkKTpPZChiLGEuY2hpbGQsYyxkKX1cbmZ1bmN0aW9uIFNmKGEsYixjLGQsZSl7Yz1jLnJlbmRlcjt2YXIgZj1iLnJlZjtZZChiLGUpO2Q9SGUoYSxiLGMsZCxmLGUpO2M9TWUoKTtpZihudWxsIT09YSYmIUcpcmV0dXJuIGIudXBkYXRlUXVldWU9YS51cGRhdGVRdWV1ZSxiLmZsYWdzJj0tMjA1MyxhLmxhbmVzJj1+ZSxUZihhLGIsZSk7RiYmYyYmbWQoYik7Yi5mbGFnc3w9MTtQKGEsYixkLGUpO3JldHVybiBiLmNoaWxkfVxuZnVuY3Rpb24gVWYoYSxiLGMsZCxlKXtpZihudWxsPT09YSl7dmFyIGY9Yy50eXBlO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBmJiYhVmYoZikmJnZvaWQgMD09PWYuZGVmYXVsdFByb3BzJiZudWxsPT09Yy5jb21wYXJlJiZ2b2lkIDA9PT1jLmRlZmF1bHRQcm9wcylyZXR1cm4gYi50YWc9MTUsYi50eXBlPWYsV2YoYSxiLGYsZCxlKTthPUxkKGMudHlwZSxudWxsLGQsYixiLm1vZGUsZSk7YS5yZWY9Yi5yZWY7YS5yZXR1cm49YjtyZXR1cm4gYi5jaGlsZD1hfWY9YS5jaGlsZDtpZigwPT09KGEubGFuZXMmZSkpe3ZhciBnPWYubWVtb2l6ZWRQcm9wcztjPWMuY29tcGFyZTtjPW51bGwhPT1jP2M6RGQ7aWYoYyhnLGQpJiZhLnJlZj09PWIucmVmKXJldHVybiBUZihhLGIsZSl9Yi5mbGFnc3w9MTthPUpkKGYsZCk7YS5yZWY9Yi5yZWY7YS5yZXR1cm49YjtyZXR1cm4gYi5jaGlsZD1hfVxuZnVuY3Rpb24gV2YoYSxiLGMsZCxlKXtpZihudWxsIT09YSl7dmFyIGY9YS5tZW1vaXplZFByb3BzO2lmKERkKGYsZCkmJmEucmVmPT09Yi5yZWYpaWYoRz0hMSxiLnBlbmRpbmdQcm9wcz1kPWYsMCE9PShhLmxhbmVzJmUpKTAhPT0oYS5mbGFncyYxMzEwNzIpJiYoRz0hMCk7ZWxzZSByZXR1cm4gYi5sYW5lcz1hLmxhbmVzLFRmKGEsYixlKX1yZXR1cm4gWGYoYSxiLGMsZCxlKX1cbmZ1bmN0aW9uIFlmKGEsYixjKXt2YXIgZD1iLnBlbmRpbmdQcm9wcyxlPWQuY2hpbGRyZW4sZj1udWxsIT09YT9hLm1lbW9pemVkU3RhdGU6bnVsbDtpZihcImhpZGRlblwiPT09ZC5tb2RlKWlmKDA9PT0oYi5tb2RlJjEpKWIubWVtb2l6ZWRTdGF0ZT17YmFzZUxhbmVzOjAsY2FjaGVQb29sOm51bGwsdHJhbnNpdGlvbnM6bnVsbH0sdihaZiwkZiksJGZ8PWM7ZWxzZXtpZigwPT09KGMmMTA3Mzc0MTgyNCkpcmV0dXJuIGE9bnVsbCE9PWY/Zi5iYXNlTGFuZXN8YzpjLGIubGFuZXM9Yi5jaGlsZExhbmVzPTEwNzM3NDE4MjQsYi5tZW1vaXplZFN0YXRlPXtiYXNlTGFuZXM6YSxjYWNoZVBvb2w6bnVsbCx0cmFuc2l0aW9uczpudWxsfSxiLnVwZGF0ZVF1ZXVlPW51bGwsdihaZiwkZiksJGZ8PWEsbnVsbDtiLm1lbW9pemVkU3RhdGU9e2Jhc2VMYW5lczowLGNhY2hlUG9vbDpudWxsLHRyYW5zaXRpb25zOm51bGx9O2Q9bnVsbCE9PWY/Zi5iYXNlTGFuZXM6Yzt2KFpmLCRmKTskZnw9ZH1lbHNlIG51bGwhPT1cbmY/KGQ9Zi5iYXNlTGFuZXN8YyxiLm1lbW9pemVkU3RhdGU9bnVsbCk6ZD1jLHYoWmYsJGYpLCRmfD1kO1AoYSxiLGUsYyk7cmV0dXJuIGIuY2hpbGR9ZnVuY3Rpb24gYWcoYSxiKXt2YXIgYz1iLnJlZjtpZihudWxsPT09YSYmbnVsbCE9PWN8fG51bGwhPT1hJiZhLnJlZiE9PWMpYi5mbGFnc3w9NTEyLGIuZmxhZ3N8PTIwOTcxNTJ9ZnVuY3Rpb24gWGYoYSxiLGMsZCxlKXt2YXIgZj1BKGMpP2tjOnguY3VycmVudDtmPW1jKGIsZik7WWQoYixlKTtjPUhlKGEsYixjLGQsZixlKTtkPU1lKCk7aWYobnVsbCE9PWEmJiFHKXJldHVybiBiLnVwZGF0ZVF1ZXVlPWEudXBkYXRlUXVldWUsYi5mbGFncyY9LTIwNTMsYS5sYW5lcyY9fmUsVGYoYSxiLGUpO0YmJmQmJm1kKGIpO2IuZmxhZ3N8PTE7UChhLGIsYyxlKTtyZXR1cm4gYi5jaGlsZH1cbmZ1bmN0aW9uIGJnKGEsYixjLGQsZSl7aWYoQShjKSl7dmFyIGY9ITA7cWMoYil9ZWxzZSBmPSExO1lkKGIsZSk7aWYobnVsbD09PWIuc3RhdGVOb2RlKWNnKGEsYiksQmYoYixjLGQpLERmKGIsYyxkLGUpLGQ9ITA7ZWxzZSBpZihudWxsPT09YSl7dmFyIGc9Yi5zdGF0ZU5vZGUsaD1iLm1lbW9pemVkUHJvcHM7Zy5wcm9wcz1oO3ZhciBrPWcuY29udGV4dCxsPWMuY29udGV4dFR5cGU7XCJvYmplY3RcIj09PXR5cGVvZiBsJiZudWxsIT09bD9sPVpkKGwpOihsPUEoYyk/a2M6eC5jdXJyZW50LGw9bWMoYixsKSk7dmFyIG09Yy5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMscj1cImZ1bmN0aW9uXCI9PT10eXBlb2YgbXx8XCJmdW5jdGlvblwiPT09dHlwZW9mIGcuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGU7cnx8XCJmdW5jdGlvblwiIT09dHlwZW9mIGcuVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMmJlwiZnVuY3Rpb25cIiE9PXR5cGVvZiBnLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHN8fChoIT09XG5kfHxrIT09bCkmJkNmKGIsZyxkLGwpO2RlPSExO3ZhciBwPWIubWVtb2l6ZWRTdGF0ZTtnLnN0YXRlPXA7a2UoYixkLGcsZSk7az1iLm1lbW9pemVkU3RhdGU7aCE9PWR8fHAhPT1rfHx6LmN1cnJlbnR8fGRlPyhcImZ1bmN0aW9uXCI9PT10eXBlb2YgbSYmKHlmKGIsYyxtLGQpLGs9Yi5tZW1vaXplZFN0YXRlKSwoaD1kZXx8QWYoYixjLGgsZCxwLGssbCkpPyhyfHxcImZ1bmN0aW9uXCIhPT10eXBlb2YgZy5VTlNBRkVfY29tcG9uZW50V2lsbE1vdW50JiZcImZ1bmN0aW9uXCIhPT10eXBlb2YgZy5jb21wb25lbnRXaWxsTW91bnR8fChcImZ1bmN0aW9uXCI9PT10eXBlb2YgZy5jb21wb25lbnRXaWxsTW91bnQmJmcuY29tcG9uZW50V2lsbE1vdW50KCksXCJmdW5jdGlvblwiPT09dHlwZW9mIGcuVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCYmZy5VTlNBRkVfY29tcG9uZW50V2lsbE1vdW50KCkpLFwiZnVuY3Rpb25cIj09PXR5cGVvZiBnLmNvbXBvbmVudERpZE1vdW50JiYoYi5mbGFnc3w9NDE5NDMwOCkpOlxuKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBnLmNvbXBvbmVudERpZE1vdW50JiYoYi5mbGFnc3w9NDE5NDMwOCksYi5tZW1vaXplZFByb3BzPWQsYi5tZW1vaXplZFN0YXRlPWspLGcucHJvcHM9ZCxnLnN0YXRlPWssZy5jb250ZXh0PWwsZD1oKTooXCJmdW5jdGlvblwiPT09dHlwZW9mIGcuY29tcG9uZW50RGlkTW91bnQmJihiLmZsYWdzfD00MTk0MzA4KSxkPSExKX1lbHNle2c9Yi5zdGF0ZU5vZGU7ZmUoYSxiKTtoPWIubWVtb2l6ZWRQcm9wcztsPWIudHlwZT09PWIuZWxlbWVudFR5cGU/aDp4ZihiLnR5cGUsaCk7Zy5wcm9wcz1sO3I9Yi5wZW5kaW5nUHJvcHM7cD1nLmNvbnRleHQ7az1jLmNvbnRleHRUeXBlO1wib2JqZWN0XCI9PT10eXBlb2YgayYmbnVsbCE9PWs/az1aZChrKTooaz1BKGMpP2tjOnguY3VycmVudCxrPW1jKGIsaykpO3ZhciBCPWMuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzOyhtPVwiZnVuY3Rpb25cIj09PXR5cGVvZiBCfHxcImZ1bmN0aW9uXCI9PT10eXBlb2YgZy5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZSl8fFxuXCJmdW5jdGlvblwiIT09dHlwZW9mIGcuVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMmJlwiZnVuY3Rpb25cIiE9PXR5cGVvZiBnLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHN8fChoIT09cnx8cCE9PWspJiZDZihiLGcsZCxrKTtkZT0hMTtwPWIubWVtb2l6ZWRTdGF0ZTtnLnN0YXRlPXA7a2UoYixkLGcsZSk7dmFyIHc9Yi5tZW1vaXplZFN0YXRlO2ghPT1yfHxwIT09d3x8ei5jdXJyZW50fHxkZT8oXCJmdW5jdGlvblwiPT09dHlwZW9mIEImJih5ZihiLGMsQixkKSx3PWIubWVtb2l6ZWRTdGF0ZSksKGw9ZGV8fEFmKGIsYyxsLGQscCx3LGspfHwhMSk/KG18fFwiZnVuY3Rpb25cIiE9PXR5cGVvZiBnLlVOU0FGRV9jb21wb25lbnRXaWxsVXBkYXRlJiZcImZ1bmN0aW9uXCIhPT10eXBlb2YgZy5jb21wb25lbnRXaWxsVXBkYXRlfHwoXCJmdW5jdGlvblwiPT09dHlwZW9mIGcuY29tcG9uZW50V2lsbFVwZGF0ZSYmZy5jb21wb25lbnRXaWxsVXBkYXRlKGQsdyxrKSxcImZ1bmN0aW9uXCI9PT10eXBlb2YgZy5VTlNBRkVfY29tcG9uZW50V2lsbFVwZGF0ZSYmXG5nLlVOU0FGRV9jb21wb25lbnRXaWxsVXBkYXRlKGQsdyxrKSksXCJmdW5jdGlvblwiPT09dHlwZW9mIGcuY29tcG9uZW50RGlkVXBkYXRlJiYoYi5mbGFnc3w9NCksXCJmdW5jdGlvblwiPT09dHlwZW9mIGcuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUmJihiLmZsYWdzfD0xMDI0KSk6KFwiZnVuY3Rpb25cIiE9PXR5cGVvZiBnLmNvbXBvbmVudERpZFVwZGF0ZXx8aD09PWEubWVtb2l6ZWRQcm9wcyYmcD09PWEubWVtb2l6ZWRTdGF0ZXx8KGIuZmxhZ3N8PTQpLFwiZnVuY3Rpb25cIiE9PXR5cGVvZiBnLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlfHxoPT09YS5tZW1vaXplZFByb3BzJiZwPT09YS5tZW1vaXplZFN0YXRlfHwoYi5mbGFnc3w9MTAyNCksYi5tZW1vaXplZFByb3BzPWQsYi5tZW1vaXplZFN0YXRlPXcpLGcucHJvcHM9ZCxnLnN0YXRlPXcsZy5jb250ZXh0PWssZD1sKTooXCJmdW5jdGlvblwiIT09dHlwZW9mIGcuY29tcG9uZW50RGlkVXBkYXRlfHxoPT09YS5tZW1vaXplZFByb3BzJiZwPT09XG5hLm1lbW9pemVkU3RhdGV8fChiLmZsYWdzfD00KSxcImZ1bmN0aW9uXCIhPT10eXBlb2YgZy5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZXx8aD09PWEubWVtb2l6ZWRQcm9wcyYmcD09PWEubWVtb2l6ZWRTdGF0ZXx8KGIuZmxhZ3N8PTEwMjQpLGQ9ITEpfXJldHVybiBkZyhhLGIsYyxkLGYsZSl9XG5mdW5jdGlvbiBkZyhhLGIsYyxkLGUsZil7YWcoYSxiKTt2YXIgZz0wIT09KGIuZmxhZ3MmMTI4KTtpZighZCYmIWcpcmV0dXJuIGUmJnJjKGIsYywhMSksVGYoYSxiLGYpO2Q9Yi5zdGF0ZU5vZGU7UmYuY3VycmVudD1iO3ZhciBoPWcmJlwiZnVuY3Rpb25cIiE9PXR5cGVvZiBjLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvcj9udWxsOmQucmVuZGVyKCk7Yi5mbGFnc3w9MTtudWxsIT09YSYmZz8oYi5jaGlsZD1PZChiLGEuY2hpbGQsbnVsbCxmKSxiLmNoaWxkPU9kKGIsbnVsbCxoLGYpKTpQKGEsYixoLGYpO2IubWVtb2l6ZWRTdGF0ZT1kLnN0YXRlO2UmJnJjKGIsYywhMCk7cmV0dXJuIGIuY2hpbGR9ZnVuY3Rpb24gZWcoYSl7dmFyIGI9YS5zdGF0ZU5vZGU7Yi5wZW5kaW5nQ29udGV4dD9vYyhhLGIucGVuZGluZ0NvbnRleHQsYi5wZW5kaW5nQ29udGV4dCE9PWIuY29udGV4dCk6Yi5jb250ZXh0JiZvYyhhLGIuY29udGV4dCwhMSk7c2UoYSxiLmNvbnRhaW5lckluZm8pfVxuZnVuY3Rpb24gZmcoYSxiLGMsZCxlKXtBZCgpO0JkKGUpO2IuZmxhZ3N8PTI1NjtQKGEsYixjLGQpO3JldHVybiBiLmNoaWxkfXZhciBnZz17ZGVoeWRyYXRlZDpudWxsLHRyZWVDb250ZXh0Om51bGwscmV0cnlMYW5lOjB9O2Z1bmN0aW9uIGhnKGEpe3JldHVybntiYXNlTGFuZXM6YSxjYWNoZVBvb2w6bnVsbCx0cmFuc2l0aW9uczpudWxsfX1cbmZ1bmN0aW9uIGlnKGEsYixjKXt2YXIgZD1iLnBlbmRpbmdQcm9wcyxlPUkuY3VycmVudCxmPSExLGc9MCE9PShiLmZsYWdzJjEyOCksaDsoaD1nKXx8KGg9bnVsbCE9PWEmJm51bGw9PT1hLm1lbW9pemVkU3RhdGU/ITE6MCE9PShlJjIpKTtpZihoKWY9ITAsYi5mbGFncyY9LTEyOTtlbHNlIGlmKG51bGw9PT1hfHxudWxsIT09YS5tZW1vaXplZFN0YXRlKWV8PTE7dihJLGUmMSk7aWYobnVsbD09PWEpe3dkKGIpO2E9Yi5tZW1vaXplZFN0YXRlO2lmKG51bGwhPT1hJiYoYT1hLmRlaHlkcmF0ZWQsbnVsbCE9PWEpKXJldHVybiAwPT09KGIubW9kZSYxKT9iLmxhbmVzPTE6S2IoYSk/Yi5sYW5lcz04OmIubGFuZXM9MTA3Mzc0MTgyNCxudWxsO2c9ZC5jaGlsZHJlbjthPWQuZmFsbGJhY2s7cmV0dXJuIGY/KGQ9Yi5tb2RlLGY9Yi5jaGlsZCxnPXttb2RlOlwiaGlkZGVuXCIsY2hpbGRyZW46Z30sMD09PShkJjEpJiZudWxsIT09Zj8oZi5jaGlsZExhbmVzPTAsZi5wZW5kaW5nUHJvcHM9Zyk6XG5mPWpnKGcsZCwwLG51bGwpLGE9TmQoYSxkLGMsbnVsbCksZi5yZXR1cm49YixhLnJldHVybj1iLGYuc2libGluZz1hLGIuY2hpbGQ9ZixiLmNoaWxkLm1lbW9pemVkU3RhdGU9aGcoYyksYi5tZW1vaXplZFN0YXRlPWdnLGEpOmtnKGIsZyl9ZT1hLm1lbW9pemVkU3RhdGU7aWYobnVsbCE9PWUmJihoPWUuZGVoeWRyYXRlZCxudWxsIT09aCkpcmV0dXJuIGxnKGEsYixnLGQsaCxlLGMpO2lmKGYpe2Y9ZC5mYWxsYmFjaztnPWIubW9kZTtlPWEuY2hpbGQ7aD1lLnNpYmxpbmc7dmFyIGs9e21vZGU6XCJoaWRkZW5cIixjaGlsZHJlbjpkLmNoaWxkcmVufTswPT09KGcmMSkmJmIuY2hpbGQhPT1lPyhkPWIuY2hpbGQsZC5jaGlsZExhbmVzPTAsZC5wZW5kaW5nUHJvcHM9ayxiLmRlbGV0aW9ucz1udWxsKTooZD1KZChlLGspLGQuc3VidHJlZUZsYWdzPWUuc3VidHJlZUZsYWdzJjE0NjgwMDY0KTtudWxsIT09aD9mPUpkKGgsZik6KGY9TmQoZixnLGMsbnVsbCksZi5mbGFnc3w9Mik7Zi5yZXR1cm49XG5iO2QucmV0dXJuPWI7ZC5zaWJsaW5nPWY7Yi5jaGlsZD1kO2Q9ZjtmPWIuY2hpbGQ7Zz1hLmNoaWxkLm1lbW9pemVkU3RhdGU7Zz1udWxsPT09Zz9oZyhjKTp7YmFzZUxhbmVzOmcuYmFzZUxhbmVzfGMsY2FjaGVQb29sOm51bGwsdHJhbnNpdGlvbnM6Zy50cmFuc2l0aW9uc307Zi5tZW1vaXplZFN0YXRlPWc7Zi5jaGlsZExhbmVzPWEuY2hpbGRMYW5lcyZ+YztiLm1lbW9pemVkU3RhdGU9Z2c7cmV0dXJuIGR9Zj1hLmNoaWxkO2E9Zi5zaWJsaW5nO2Q9SmQoZix7bW9kZTpcInZpc2libGVcIixjaGlsZHJlbjpkLmNoaWxkcmVufSk7MD09PShiLm1vZGUmMSkmJihkLmxhbmVzPWMpO2QucmV0dXJuPWI7ZC5zaWJsaW5nPW51bGw7bnVsbCE9PWEmJihjPWIuZGVsZXRpb25zLG51bGw9PT1jPyhiLmRlbGV0aW9ucz1bYV0sYi5mbGFnc3w9MTYpOmMucHVzaChhKSk7Yi5jaGlsZD1kO2IubWVtb2l6ZWRTdGF0ZT1udWxsO3JldHVybiBkfVxuZnVuY3Rpb24ga2coYSxiKXtiPWpnKHttb2RlOlwidmlzaWJsZVwiLGNoaWxkcmVuOmJ9LGEubW9kZSwwLG51bGwpO2IucmV0dXJuPWE7cmV0dXJuIGEuY2hpbGQ9Yn1mdW5jdGlvbiBtZyhhLGIsYyxkKXtudWxsIT09ZCYmQmQoZCk7T2QoYixhLmNoaWxkLG51bGwsYyk7YT1rZyhiLGIucGVuZGluZ1Byb3BzLmNoaWxkcmVuKTthLmZsYWdzfD0yO2IubWVtb2l6ZWRTdGF0ZT1udWxsO3JldHVybiBhfVxuZnVuY3Rpb24gbGcoYSxiLGMsZCxlLGYsZyl7aWYoYyl7aWYoYi5mbGFncyYyNTYpcmV0dXJuIGIuZmxhZ3MmPS0yNTcsZD1GZihFcnJvcihuKDQyMikpKSxtZyhhLGIsZyxkKTtpZihudWxsIT09Yi5tZW1vaXplZFN0YXRlKXJldHVybiBiLmNoaWxkPWEuY2hpbGQsYi5mbGFnc3w9MTI4LG51bGw7Zj1kLmZhbGxiYWNrO2U9Yi5tb2RlO2Q9amcoe21vZGU6XCJ2aXNpYmxlXCIsY2hpbGRyZW46ZC5jaGlsZHJlbn0sZSwwLG51bGwpO2Y9TmQoZixlLGcsbnVsbCk7Zi5mbGFnc3w9MjtkLnJldHVybj1iO2YucmV0dXJuPWI7ZC5zaWJsaW5nPWY7Yi5jaGlsZD1kOzAhPT0oYi5tb2RlJjEpJiZPZChiLGEuY2hpbGQsbnVsbCxnKTtiLmNoaWxkLm1lbW9pemVkU3RhdGU9aGcoZyk7Yi5tZW1vaXplZFN0YXRlPWdnO3JldHVybiBmfWlmKDA9PT0oYi5tb2RlJjEpKXJldHVybiBtZyhhLGIsZyxudWxsKTtpZihLYihlKSlyZXR1cm4gZD1MYihlKS5kaWdlc3QsZj1FcnJvcihuKDQxOSkpLGQ9RmYoZixcbmQsdm9pZCAwKSxtZyhhLGIsZyxkKTtjPTAhPT0oZyZhLmNoaWxkTGFuZXMpO2lmKEd8fGMpe2Q9TjtpZihudWxsIT09ZCl7c3dpdGNoKGcmLWcpe2Nhc2UgNDplPTI7YnJlYWs7Y2FzZSAxNjplPTg7YnJlYWs7Y2FzZSA2NDpjYXNlIDEyODpjYXNlIDI1NjpjYXNlIDUxMjpjYXNlIDEwMjQ6Y2FzZSAyMDQ4OmNhc2UgNDA5NjpjYXNlIDgxOTI6Y2FzZSAxNjM4NDpjYXNlIDMyNzY4OmNhc2UgNjU1MzY6Y2FzZSAxMzEwNzI6Y2FzZSAyNjIxNDQ6Y2FzZSA1MjQyODg6Y2FzZSAxMDQ4NTc2OmNhc2UgMjA5NzE1MjpjYXNlIDQxOTQzMDQ6Y2FzZSA4Mzg4NjA4OmNhc2UgMTY3NzcyMTY6Y2FzZSAzMzU1NDQzMjpjYXNlIDY3MTA4ODY0OmU9MzI7YnJlYWs7Y2FzZSA1MzY4NzA5MTI6ZT0yNjg0MzU0NTY7YnJlYWs7ZGVmYXVsdDplPTB9ZT0wIT09KGUmKGQuc3VzcGVuZGVkTGFuZXN8ZykpPzA6ZTswIT09ZSYmZSE9PWYucmV0cnlMYW5lJiYoZi5yZXRyeUxhbmU9ZSxjZShhLGUpLGFmKGQsYSxcbmUsLTEpKX1uZygpO2Q9RmYoRXJyb3Iobig0MjEpKSk7cmV0dXJuIG1nKGEsYixnLGQpfWlmKEpiKGUpKXJldHVybiBiLmZsYWdzfD0xMjgsYi5jaGlsZD1hLmNoaWxkLGI9b2cuYmluZChudWxsLGEpLE1iKGUsYiksbnVsbDthPWYudHJlZUNvbnRleHQ7VmEmJihwZD1RYihlKSxvZD1iLEY9ITAscmQ9bnVsbCxxZD0hMSxudWxsIT09YSYmKGZkW2dkKytdPWlkLGZkW2dkKytdPWpkLGZkW2dkKytdPWhkLGlkPWEuaWQsamQ9YS5vdmVyZmxvdyxoZD1iKSk7Yj1rZyhiLGQuY2hpbGRyZW4pO2IuZmxhZ3N8PTQwOTY7cmV0dXJuIGJ9ZnVuY3Rpb24gcGcoYSxiLGMpe2EubGFuZXN8PWI7dmFyIGQ9YS5hbHRlcm5hdGU7bnVsbCE9PWQmJihkLmxhbmVzfD1iKTtYZChhLnJldHVybixiLGMpfVxuZnVuY3Rpb24gcWcoYSxiLGMsZCxlKXt2YXIgZj1hLm1lbW9pemVkU3RhdGU7bnVsbD09PWY/YS5tZW1vaXplZFN0YXRlPXtpc0JhY2t3YXJkczpiLHJlbmRlcmluZzpudWxsLHJlbmRlcmluZ1N0YXJ0VGltZTowLGxhc3Q6ZCx0YWlsOmMsdGFpbE1vZGU6ZX06KGYuaXNCYWNrd2FyZHM9YixmLnJlbmRlcmluZz1udWxsLGYucmVuZGVyaW5nU3RhcnRUaW1lPTAsZi5sYXN0PWQsZi50YWlsPWMsZi50YWlsTW9kZT1lKX1cbmZ1bmN0aW9uIHJnKGEsYixjKXt2YXIgZD1iLnBlbmRpbmdQcm9wcyxlPWQucmV2ZWFsT3JkZXIsZj1kLnRhaWw7UChhLGIsZC5jaGlsZHJlbixjKTtkPUkuY3VycmVudDtpZigwIT09KGQmMikpZD1kJjF8MixiLmZsYWdzfD0xMjg7ZWxzZXtpZihudWxsIT09YSYmMCE9PShhLmZsYWdzJjEyOCkpYTpmb3IoYT1iLmNoaWxkO251bGwhPT1hOyl7aWYoMTM9PT1hLnRhZyludWxsIT09YS5tZW1vaXplZFN0YXRlJiZwZyhhLGMsYik7ZWxzZSBpZigxOT09PWEudGFnKXBnKGEsYyxiKTtlbHNlIGlmKG51bGwhPT1hLmNoaWxkKXthLmNoaWxkLnJldHVybj1hO2E9YS5jaGlsZDtjb250aW51ZX1pZihhPT09YilicmVhayBhO2Zvcig7bnVsbD09PWEuc2libGluZzspe2lmKG51bGw9PT1hLnJldHVybnx8YS5yZXR1cm49PT1iKWJyZWFrIGE7YT1hLnJldHVybn1hLnNpYmxpbmcucmV0dXJuPWEucmV0dXJuO2E9YS5zaWJsaW5nfWQmPTF9dihJLGQpO2lmKDA9PT0oYi5tb2RlJjEpKWIubWVtb2l6ZWRTdGF0ZT1cbm51bGw7ZWxzZSBzd2l0Y2goZSl7Y2FzZSBcImZvcndhcmRzXCI6Yz1iLmNoaWxkO2ZvcihlPW51bGw7bnVsbCE9PWM7KWE9Yy5hbHRlcm5hdGUsbnVsbCE9PWEmJm51bGw9PT13ZShhKSYmKGU9YyksYz1jLnNpYmxpbmc7Yz1lO251bGw9PT1jPyhlPWIuY2hpbGQsYi5jaGlsZD1udWxsKTooZT1jLnNpYmxpbmcsYy5zaWJsaW5nPW51bGwpO3FnKGIsITEsZSxjLGYpO2JyZWFrO2Nhc2UgXCJiYWNrd2FyZHNcIjpjPW51bGw7ZT1iLmNoaWxkO2ZvcihiLmNoaWxkPW51bGw7bnVsbCE9PWU7KXthPWUuYWx0ZXJuYXRlO2lmKG51bGwhPT1hJiZudWxsPT09d2UoYSkpe2IuY2hpbGQ9ZTticmVha31hPWUuc2libGluZztlLnNpYmxpbmc9YztjPWU7ZT1hfXFnKGIsITAsYyxudWxsLGYpO2JyZWFrO2Nhc2UgXCJ0b2dldGhlclwiOnFnKGIsITEsbnVsbCxudWxsLHZvaWQgMCk7YnJlYWs7ZGVmYXVsdDpiLm1lbW9pemVkU3RhdGU9bnVsbH1yZXR1cm4gYi5jaGlsZH1cbmZ1bmN0aW9uIGNnKGEsYil7MD09PShiLm1vZGUmMSkmJm51bGwhPT1hJiYoYS5hbHRlcm5hdGU9bnVsbCxiLmFsdGVybmF0ZT1udWxsLGIuZmxhZ3N8PTIpfWZ1bmN0aW9uIFRmKGEsYixjKXtudWxsIT09YSYmKGIuZGVwZW5kZW5jaWVzPWEuZGVwZW5kZW5jaWVzKTtsZXw9Yi5sYW5lcztpZigwPT09KGMmYi5jaGlsZExhbmVzKSlyZXR1cm4gbnVsbDtpZihudWxsIT09YSYmYi5jaGlsZCE9PWEuY2hpbGQpdGhyb3cgRXJyb3IobigxNTMpKTtpZihudWxsIT09Yi5jaGlsZCl7YT1iLmNoaWxkO2M9SmQoYSxhLnBlbmRpbmdQcm9wcyk7Yi5jaGlsZD1jO2ZvcihjLnJldHVybj1iO251bGwhPT1hLnNpYmxpbmc7KWE9YS5zaWJsaW5nLGM9Yy5zaWJsaW5nPUpkKGEsYS5wZW5kaW5nUHJvcHMpLGMucmV0dXJuPWI7Yy5zaWJsaW5nPW51bGx9cmV0dXJuIGIuY2hpbGR9XG5mdW5jdGlvbiBzZyhhLGIsYyl7c3dpdGNoKGIudGFnKXtjYXNlIDM6ZWcoYik7QWQoKTticmVhaztjYXNlIDU6dWUoYik7YnJlYWs7Y2FzZSAxOkEoYi50eXBlKSYmcWMoYik7YnJlYWs7Y2FzZSA0OnNlKGIsYi5zdGF0ZU5vZGUuY29udGFpbmVySW5mbyk7YnJlYWs7Y2FzZSAxMDpWZChiLGIudHlwZS5fY29udGV4dCxiLm1lbW9pemVkUHJvcHMudmFsdWUpO2JyZWFrO2Nhc2UgMTM6dmFyIGQ9Yi5tZW1vaXplZFN0YXRlO2lmKG51bGwhPT1kKXtpZihudWxsIT09ZC5kZWh5ZHJhdGVkKXJldHVybiB2KEksSS5jdXJyZW50JjEpLGIuZmxhZ3N8PTEyOCxudWxsO2lmKDAhPT0oYyZiLmNoaWxkLmNoaWxkTGFuZXMpKXJldHVybiBpZyhhLGIsYyk7dihJLEkuY3VycmVudCYxKTthPVRmKGEsYixjKTtyZXR1cm4gbnVsbCE9PWE/YS5zaWJsaW5nOm51bGx9dihJLEkuY3VycmVudCYxKTticmVhaztjYXNlIDE5OmQ9MCE9PShjJmIuY2hpbGRMYW5lcyk7aWYoMCE9PShhLmZsYWdzJjEyOCkpe2lmKGQpcmV0dXJuIHJnKGEsXG5iLGMpO2IuZmxhZ3N8PTEyOH12YXIgZT1iLm1lbW9pemVkU3RhdGU7bnVsbCE9PWUmJihlLnJlbmRlcmluZz1udWxsLGUudGFpbD1udWxsLGUubGFzdEVmZmVjdD1udWxsKTt2KEksSS5jdXJyZW50KTtpZihkKWJyZWFrO2Vsc2UgcmV0dXJuIG51bGw7Y2FzZSAyMjpjYXNlIDIzOnJldHVybiBiLmxhbmVzPTAsWWYoYSxiLGMpfXJldHVybiBUZihhLGIsYyl9ZnVuY3Rpb24gdGcoYSl7YS5mbGFnc3w9NH1mdW5jdGlvbiB1ZyhhLGIpe2lmKG51bGwhPT1hJiZhLmNoaWxkPT09Yi5jaGlsZClyZXR1cm4hMDtpZigwIT09KGIuZmxhZ3MmMTYpKXJldHVybiExO2ZvcihhPWIuY2hpbGQ7bnVsbCE9PWE7KXtpZigwIT09KGEuZmxhZ3MmMTI4NTQpfHwwIT09KGEuc3VidHJlZUZsYWdzJjEyODU0KSlyZXR1cm4hMTthPWEuc2libGluZ31yZXR1cm4hMH12YXIgdmcsd2cseGcseWc7XG5pZihUYSl2Zz1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1iLmNoaWxkO251bGwhPT1jOyl7aWYoNT09PWMudGFnfHw2PT09Yy50YWcpS2EoYSxjLnN0YXRlTm9kZSk7ZWxzZSBpZig0IT09Yy50YWcmJm51bGwhPT1jLmNoaWxkKXtjLmNoaWxkLnJldHVybj1jO2M9Yy5jaGlsZDtjb250aW51ZX1pZihjPT09YilicmVhaztmb3IoO251bGw9PT1jLnNpYmxpbmc7KXtpZihudWxsPT09Yy5yZXR1cm58fGMucmV0dXJuPT09YilyZXR1cm47Yz1jLnJldHVybn1jLnNpYmxpbmcucmV0dXJuPWMucmV0dXJuO2M9Yy5zaWJsaW5nfX0sd2c9ZnVuY3Rpb24oKXt9LHhnPWZ1bmN0aW9uKGEsYixjLGQsZSl7YT1hLm1lbW9pemVkUHJvcHM7aWYoYSE9PWQpe3ZhciBmPWIuc3RhdGVOb2RlLGc9cmUob2UuY3VycmVudCk7Yz1NYShmLGMsYSxkLGUsZyk7KGIudXBkYXRlUXVldWU9YykmJnRnKGIpfX0seWc9ZnVuY3Rpb24oYSxiLGMsZCl7YyE9PWQmJnRnKGIpfTtlbHNlIGlmKFVhKXt2Zz1mdW5jdGlvbihhLFxuYixjLGQpe2Zvcih2YXIgZT1iLmNoaWxkO251bGwhPT1lOyl7aWYoNT09PWUudGFnKXt2YXIgZj1lLnN0YXRlTm9kZTtjJiZkJiYoZj1FYihmLGUudHlwZSxlLm1lbW9pemVkUHJvcHMsZSkpO0thKGEsZil9ZWxzZSBpZig2PT09ZS50YWcpZj1lLnN0YXRlTm9kZSxjJiZkJiYoZj1GYihmLGUubWVtb2l6ZWRQcm9wcyxlKSksS2EoYSxmKTtlbHNlIGlmKDQhPT1lLnRhZylpZigyMj09PWUudGFnJiZudWxsIT09ZS5tZW1vaXplZFN0YXRlKWY9ZS5jaGlsZCxudWxsIT09ZiYmKGYucmV0dXJuPWUpLHZnKGEsZSwhMCwhMCk7ZWxzZSBpZihudWxsIT09ZS5jaGlsZCl7ZS5jaGlsZC5yZXR1cm49ZTtlPWUuY2hpbGQ7Y29udGludWV9aWYoZT09PWIpYnJlYWs7Zm9yKDtudWxsPT09ZS5zaWJsaW5nOyl7aWYobnVsbD09PWUucmV0dXJufHxlLnJldHVybj09PWIpcmV0dXJuO2U9ZS5yZXR1cm59ZS5zaWJsaW5nLnJldHVybj1lLnJldHVybjtlPWUuc2libGluZ319O3ZhciB6Zz1mdW5jdGlvbihhLFxuYixjLGQpe2Zvcih2YXIgZT1iLmNoaWxkO251bGwhPT1lOyl7aWYoNT09PWUudGFnKXt2YXIgZj1lLnN0YXRlTm9kZTtjJiZkJiYoZj1FYihmLGUudHlwZSxlLm1lbW9pemVkUHJvcHMsZSkpO0FiKGEsZil9ZWxzZSBpZig2PT09ZS50YWcpZj1lLnN0YXRlTm9kZSxjJiZkJiYoZj1GYihmLGUubWVtb2l6ZWRQcm9wcyxlKSksQWIoYSxmKTtlbHNlIGlmKDQhPT1lLnRhZylpZigyMj09PWUudGFnJiZudWxsIT09ZS5tZW1vaXplZFN0YXRlKWY9ZS5jaGlsZCxudWxsIT09ZiYmKGYucmV0dXJuPWUpLHpnKGEsZSwhMCwhMCk7ZWxzZSBpZihudWxsIT09ZS5jaGlsZCl7ZS5jaGlsZC5yZXR1cm49ZTtlPWUuY2hpbGQ7Y29udGludWV9aWYoZT09PWIpYnJlYWs7Zm9yKDtudWxsPT09ZS5zaWJsaW5nOyl7aWYobnVsbD09PWUucmV0dXJufHxlLnJldHVybj09PWIpcmV0dXJuO2U9ZS5yZXR1cm59ZS5zaWJsaW5nLnJldHVybj1lLnJldHVybjtlPWUuc2libGluZ319O3dnPWZ1bmN0aW9uKGEsYil7dmFyIGM9XG5iLnN0YXRlTm9kZTtpZighdWcoYSxiKSl7YT1jLmNvbnRhaW5lckluZm87dmFyIGQ9emIoYSk7emcoZCxiLCExLCExKTtjLnBlbmRpbmdDaGlsZHJlbj1kO3RnKGIpO0JiKGEsZCl9fTt4Zz1mdW5jdGlvbihhLGIsYyxkLGUpe3ZhciBmPWEuc3RhdGVOb2RlLGc9YS5tZW1vaXplZFByb3BzO2lmKChhPXVnKGEsYikpJiZnPT09ZCliLnN0YXRlTm9kZT1mO2Vsc2V7dmFyIGg9Yi5zdGF0ZU5vZGUsaz1yZShvZS5jdXJyZW50KSxsPW51bGw7ZyE9PWQmJihsPU1hKGgsYyxnLGQsZSxrKSk7YSYmbnVsbD09PWw/Yi5zdGF0ZU5vZGU9ZjooZj15YihmLGwsYyxnLGQsYixhLGgpLExhKGYsYyxkLGUsaykmJnRnKGIpLGIuc3RhdGVOb2RlPWYsYT90ZyhiKTp2ZyhmLGIsITEsITEpKX19O3lnPWZ1bmN0aW9uKGEsYixjLGQpe2MhPT1kPyhhPXJlKHFlLmN1cnJlbnQpLGM9cmUob2UuY3VycmVudCksYi5zdGF0ZU5vZGU9T2EoZCxhLGMsYiksdGcoYikpOmIuc3RhdGVOb2RlPWEuc3RhdGVOb2RlfX1lbHNlIHdnPVxuZnVuY3Rpb24oKXt9LHhnPWZ1bmN0aW9uKCl7fSx5Zz1mdW5jdGlvbigpe307ZnVuY3Rpb24gQWcoYSxiKXtpZighRilzd2l0Y2goYS50YWlsTW9kZSl7Y2FzZSBcImhpZGRlblwiOmI9YS50YWlsO2Zvcih2YXIgYz1udWxsO251bGwhPT1iOyludWxsIT09Yi5hbHRlcm5hdGUmJihjPWIpLGI9Yi5zaWJsaW5nO251bGw9PT1jP2EudGFpbD1udWxsOmMuc2libGluZz1udWxsO2JyZWFrO2Nhc2UgXCJjb2xsYXBzZWRcIjpjPWEudGFpbDtmb3IodmFyIGQ9bnVsbDtudWxsIT09YzspbnVsbCE9PWMuYWx0ZXJuYXRlJiYoZD1jKSxjPWMuc2libGluZztudWxsPT09ZD9ifHxudWxsPT09YS50YWlsP2EudGFpbD1udWxsOmEudGFpbC5zaWJsaW5nPW51bGw6ZC5zaWJsaW5nPW51bGx9fVxuZnVuY3Rpb24gUShhKXt2YXIgYj1udWxsIT09YS5hbHRlcm5hdGUmJmEuYWx0ZXJuYXRlLmNoaWxkPT09YS5jaGlsZCxjPTAsZD0wO2lmKGIpZm9yKHZhciBlPWEuY2hpbGQ7bnVsbCE9PWU7KWN8PWUubGFuZXN8ZS5jaGlsZExhbmVzLGR8PWUuc3VidHJlZUZsYWdzJjE0NjgwMDY0LGR8PWUuZmxhZ3MmMTQ2ODAwNjQsZS5yZXR1cm49YSxlPWUuc2libGluZztlbHNlIGZvcihlPWEuY2hpbGQ7bnVsbCE9PWU7KWN8PWUubGFuZXN8ZS5jaGlsZExhbmVzLGR8PWUuc3VidHJlZUZsYWdzLGR8PWUuZmxhZ3MsZS5yZXR1cm49YSxlPWUuc2libGluZzthLnN1YnRyZWVGbGFnc3w9ZDthLmNoaWxkTGFuZXM9YztyZXR1cm4gYn1cbmZ1bmN0aW9uIEJnKGEsYixjKXt2YXIgZD1iLnBlbmRpbmdQcm9wcztuZChiKTtzd2l0Y2goYi50YWcpe2Nhc2UgMjpjYXNlIDE2OmNhc2UgMTU6Y2FzZSAwOmNhc2UgMTE6Y2FzZSA3OmNhc2UgODpjYXNlIDEyOmNhc2UgOTpjYXNlIDE0OnJldHVybiBRKGIpLG51bGw7Y2FzZSAxOnJldHVybiBBKGIudHlwZSkmJm5jKCksUShiKSxudWxsO2Nhc2UgMzpjPWIuc3RhdGVOb2RlO3RlKCk7cSh6KTtxKHgpO3llKCk7Yy5wZW5kaW5nQ29udGV4dCYmKGMuY29udGV4dD1jLnBlbmRpbmdDb250ZXh0LGMucGVuZGluZ0NvbnRleHQ9bnVsbCk7aWYobnVsbD09PWF8fG51bGw9PT1hLmNoaWxkKXlkKGIpP3RnKGIpOm51bGw9PT1hfHxhLm1lbW9pemVkU3RhdGUuaXNEZWh5ZHJhdGVkJiYwPT09KGIuZmxhZ3MmMjU2KXx8KGIuZmxhZ3N8PTEwMjQsbnVsbCE9PXJkJiYoQ2cocmQpLHJkPW51bGwpKTt3ZyhhLGIpO1EoYik7cmV0dXJuIG51bGw7Y2FzZSA1OnZlKGIpO2M9cmUocWUuY3VycmVudCk7dmFyIGU9XG5iLnR5cGU7aWYobnVsbCE9PWEmJm51bGwhPWIuc3RhdGVOb2RlKXhnKGEsYixlLGQsYyksYS5yZWYhPT1iLnJlZiYmKGIuZmxhZ3N8PTUxMixiLmZsYWdzfD0yMDk3MTUyKTtlbHNle2lmKCFkKXtpZihudWxsPT09Yi5zdGF0ZU5vZGUpdGhyb3cgRXJyb3IobigxNjYpKTtRKGIpO3JldHVybiBudWxsfWE9cmUob2UuY3VycmVudCk7aWYoeWQoYikpe2lmKCFWYSl0aHJvdyBFcnJvcihuKDE3NSkpO2E9UmIoYi5zdGF0ZU5vZGUsYi50eXBlLGIubWVtb2l6ZWRQcm9wcyxjLGEsYiwhcWQpO2IudXBkYXRlUXVldWU9YTtudWxsIT09YSYmdGcoYil9ZWxzZXt2YXIgZj1KYShlLGQsYyxhLGIpO3ZnKGYsYiwhMSwhMSk7Yi5zdGF0ZU5vZGU9ZjtMYShmLGUsZCxjLGEpJiZ0ZyhiKX1udWxsIT09Yi5yZWYmJihiLmZsYWdzfD01MTIsYi5mbGFnc3w9MjA5NzE1Mil9UShiKTtyZXR1cm4gbnVsbDtjYXNlIDY6aWYoYSYmbnVsbCE9Yi5zdGF0ZU5vZGUpeWcoYSxiLGEubWVtb2l6ZWRQcm9wcyxkKTtcbmVsc2V7aWYoXCJzdHJpbmdcIiE9PXR5cGVvZiBkJiZudWxsPT09Yi5zdGF0ZU5vZGUpdGhyb3cgRXJyb3IobigxNjYpKTthPXJlKHFlLmN1cnJlbnQpO2M9cmUob2UuY3VycmVudCk7aWYoeWQoYikpe2lmKCFWYSl0aHJvdyBFcnJvcihuKDE3NikpO2E9Yi5zdGF0ZU5vZGU7Yz1iLm1lbW9pemVkUHJvcHM7aWYoZD1TYihhLGMsYiwhcWQpKWlmKGU9b2QsbnVsbCE9PWUpc3dpdGNoKGUudGFnKXtjYXNlIDM6JGIoZS5zdGF0ZU5vZGUuY29udGFpbmVySW5mbyxhLGMsMCE9PShlLm1vZGUmMSkpO2JyZWFrO2Nhc2UgNTphYyhlLnR5cGUsZS5tZW1vaXplZFByb3BzLGUuc3RhdGVOb2RlLGEsYywwIT09KGUubW9kZSYxKSl9ZCYmdGcoYil9ZWxzZSBiLnN0YXRlTm9kZT1PYShkLGEsYyxiKX1RKGIpO3JldHVybiBudWxsO2Nhc2UgMTM6cShJKTtkPWIubWVtb2l6ZWRTdGF0ZTtpZihudWxsPT09YXx8bnVsbCE9PWEubWVtb2l6ZWRTdGF0ZSYmbnVsbCE9PWEubWVtb2l6ZWRTdGF0ZS5kZWh5ZHJhdGVkKXtpZihGJiZcbm51bGwhPT1wZCYmMCE9PShiLm1vZGUmMSkmJjA9PT0oYi5mbGFncyYxMjgpKXpkKCksQWQoKSxiLmZsYWdzfD05ODU2MCxlPSExO2Vsc2UgaWYoZT15ZChiKSxudWxsIT09ZCYmbnVsbCE9PWQuZGVoeWRyYXRlZCl7aWYobnVsbD09PWEpe2lmKCFlKXRocm93IEVycm9yKG4oMzE4KSk7aWYoIVZhKXRocm93IEVycm9yKG4oMzQ0KSk7ZT1iLm1lbW9pemVkU3RhdGU7ZT1udWxsIT09ZT9lLmRlaHlkcmF0ZWQ6bnVsbDtpZighZSl0aHJvdyBFcnJvcihuKDMxNykpO1RiKGUsYil9ZWxzZSBBZCgpLDA9PT0oYi5mbGFncyYxMjgpJiYoYi5tZW1vaXplZFN0YXRlPW51bGwpLGIuZmxhZ3N8PTQ7UShiKTtlPSExfWVsc2UgbnVsbCE9PXJkJiYoQ2cocmQpLHJkPW51bGwpLGU9ITA7aWYoIWUpcmV0dXJuIGIuZmxhZ3MmNjU1MzY/YjpudWxsfWlmKDAhPT0oYi5mbGFncyYxMjgpKXJldHVybiBiLmxhbmVzPWMsYjtjPW51bGwhPT1kO2MhPT0obnVsbCE9PWEmJm51bGwhPT1hLm1lbW9pemVkU3RhdGUpJiZcbmMmJihiLmNoaWxkLmZsYWdzfD04MTkyLDAhPT0oYi5tb2RlJjEpJiYobnVsbD09PWF8fDAhPT0oSS5jdXJyZW50JjEpPzA9PT1SJiYoUj0zKTpuZygpKSk7bnVsbCE9PWIudXBkYXRlUXVldWUmJihiLmZsYWdzfD00KTtRKGIpO3JldHVybiBudWxsO2Nhc2UgNDpyZXR1cm4gdGUoKSx3ZyhhLGIpLG51bGw9PT1hJiZYYShiLnN0YXRlTm9kZS5jb250YWluZXJJbmZvKSxRKGIpLG51bGw7Y2FzZSAxMDpyZXR1cm4gV2QoYi50eXBlLl9jb250ZXh0KSxRKGIpLG51bGw7Y2FzZSAxNzpyZXR1cm4gQShiLnR5cGUpJiZuYygpLFEoYiksbnVsbDtjYXNlIDE5OnEoSSk7ZT1iLm1lbW9pemVkU3RhdGU7aWYobnVsbD09PWUpcmV0dXJuIFEoYiksbnVsbDtkPTAhPT0oYi5mbGFncyYxMjgpO2Y9ZS5yZW5kZXJpbmc7aWYobnVsbD09PWYpaWYoZClBZyhlLCExKTtlbHNle2lmKDAhPT1SfHxudWxsIT09YSYmMCE9PShhLmZsYWdzJjEyOCkpZm9yKGE9Yi5jaGlsZDtudWxsIT09YTspe2Y9d2UoYSk7aWYobnVsbCE9PVxuZil7Yi5mbGFnc3w9MTI4O0FnKGUsITEpO2E9Zi51cGRhdGVRdWV1ZTtudWxsIT09YSYmKGIudXBkYXRlUXVldWU9YSxiLmZsYWdzfD00KTtiLnN1YnRyZWVGbGFncz0wO2E9Yztmb3IoYz1iLmNoaWxkO251bGwhPT1jOylkPWMsZT1hLGQuZmxhZ3MmPTE0NjgwMDY2LGY9ZC5hbHRlcm5hdGUsbnVsbD09PWY/KGQuY2hpbGRMYW5lcz0wLGQubGFuZXM9ZSxkLmNoaWxkPW51bGwsZC5zdWJ0cmVlRmxhZ3M9MCxkLm1lbW9pemVkUHJvcHM9bnVsbCxkLm1lbW9pemVkU3RhdGU9bnVsbCxkLnVwZGF0ZVF1ZXVlPW51bGwsZC5kZXBlbmRlbmNpZXM9bnVsbCxkLnN0YXRlTm9kZT1udWxsKTooZC5jaGlsZExhbmVzPWYuY2hpbGRMYW5lcyxkLmxhbmVzPWYubGFuZXMsZC5jaGlsZD1mLmNoaWxkLGQuc3VidHJlZUZsYWdzPTAsZC5kZWxldGlvbnM9bnVsbCxkLm1lbW9pemVkUHJvcHM9Zi5tZW1vaXplZFByb3BzLGQubWVtb2l6ZWRTdGF0ZT1mLm1lbW9pemVkU3RhdGUsZC51cGRhdGVRdWV1ZT1mLnVwZGF0ZVF1ZXVlLFxuZC50eXBlPWYudHlwZSxlPWYuZGVwZW5kZW5jaWVzLGQuZGVwZW5kZW5jaWVzPW51bGw9PT1lP251bGw6e2xhbmVzOmUubGFuZXMsZmlyc3RDb250ZXh0OmUuZmlyc3RDb250ZXh0fSksYz1jLnNpYmxpbmc7dihJLEkuY3VycmVudCYxfDIpO3JldHVybiBiLmNoaWxkfWE9YS5zaWJsaW5nfW51bGwhPT1lLnRhaWwmJkQoKT5EZyYmKGIuZmxhZ3N8PTEyOCxkPSEwLEFnKGUsITEpLGIubGFuZXM9NDE5NDMwNCl9ZWxzZXtpZighZClpZihhPXdlKGYpLG51bGwhPT1hKXtpZihiLmZsYWdzfD0xMjgsZD0hMCxhPWEudXBkYXRlUXVldWUsbnVsbCE9PWEmJihiLnVwZGF0ZVF1ZXVlPWEsYi5mbGFnc3w9NCksQWcoZSwhMCksbnVsbD09PWUudGFpbCYmXCJoaWRkZW5cIj09PWUudGFpbE1vZGUmJiFmLmFsdGVybmF0ZSYmIUYpcmV0dXJuIFEoYiksbnVsbH1lbHNlIDIqRCgpLWUucmVuZGVyaW5nU3RhcnRUaW1lPkRnJiYxMDczNzQxODI0IT09YyYmKGIuZmxhZ3N8PTEyOCxkPSEwLEFnKGUsITEpLGIubGFuZXM9XG40MTk0MzA0KTtlLmlzQmFja3dhcmRzPyhmLnNpYmxpbmc9Yi5jaGlsZCxiLmNoaWxkPWYpOihhPWUubGFzdCxudWxsIT09YT9hLnNpYmxpbmc9ZjpiLmNoaWxkPWYsZS5sYXN0PWYpfWlmKG51bGwhPT1lLnRhaWwpcmV0dXJuIGI9ZS50YWlsLGUucmVuZGVyaW5nPWIsZS50YWlsPWIuc2libGluZyxlLnJlbmRlcmluZ1N0YXJ0VGltZT1EKCksYi5zaWJsaW5nPW51bGwsYT1JLmN1cnJlbnQsdihJLGQ/YSYxfDI6YSYxKSxiO1EoYik7cmV0dXJuIG51bGw7Y2FzZSAyMjpjYXNlIDIzOnJldHVybiBFZygpLGM9bnVsbCE9PWIubWVtb2l6ZWRTdGF0ZSxudWxsIT09YSYmbnVsbCE9PWEubWVtb2l6ZWRTdGF0ZSE9PWMmJihiLmZsYWdzfD04MTkyKSxjJiYwIT09KGIubW9kZSYxKT8wIT09KCRmJjEwNzM3NDE4MjQpJiYoUShiKSxUYSYmYi5zdWJ0cmVlRmxhZ3MmNiYmKGIuZmxhZ3N8PTgxOTIpKTpRKGIpLG51bGw7Y2FzZSAyNDpyZXR1cm4gbnVsbDtjYXNlIDI1OnJldHVybiBudWxsfXRocm93IEVycm9yKG4oMTU2LFxuYi50YWcpKTt9XG5mdW5jdGlvbiBGZyhhLGIpe25kKGIpO3N3aXRjaChiLnRhZyl7Y2FzZSAxOnJldHVybiBBKGIudHlwZSkmJm5jKCksYT1iLmZsYWdzLGEmNjU1MzY/KGIuZmxhZ3M9YSYtNjU1Mzd8MTI4LGIpOm51bGw7Y2FzZSAzOnJldHVybiB0ZSgpLHEoeikscSh4KSx5ZSgpLGE9Yi5mbGFncywwIT09KGEmNjU1MzYpJiYwPT09KGEmMTI4KT8oYi5mbGFncz1hJi02NTUzN3wxMjgsYik6bnVsbDtjYXNlIDU6cmV0dXJuIHZlKGIpLG51bGw7Y2FzZSAxMzpxKEkpO2E9Yi5tZW1vaXplZFN0YXRlO2lmKG51bGwhPT1hJiZudWxsIT09YS5kZWh5ZHJhdGVkKXtpZihudWxsPT09Yi5hbHRlcm5hdGUpdGhyb3cgRXJyb3IobigzNDApKTtBZCgpfWE9Yi5mbGFncztyZXR1cm4gYSY2NTUzNj8oYi5mbGFncz1hJi02NTUzN3wxMjgsYik6bnVsbDtjYXNlIDE5OnJldHVybiBxKEkpLG51bGw7Y2FzZSA0OnJldHVybiB0ZSgpLG51bGw7Y2FzZSAxMDpyZXR1cm4gV2QoYi50eXBlLl9jb250ZXh0KSxudWxsO2Nhc2UgMjI6Y2FzZSAyMzpyZXR1cm4gRWcoKSxcbm51bGw7Y2FzZSAyNDpyZXR1cm4gbnVsbDtkZWZhdWx0OnJldHVybiBudWxsfX12YXIgR2c9ITEsUz0hMSxIZz1cImZ1bmN0aW9uXCI9PT10eXBlb2YgV2Vha1NldD9XZWFrU2V0OlNldCxUPW51bGw7ZnVuY3Rpb24gSWcoYSxiKXt2YXIgYz1hLnJlZjtpZihudWxsIT09YylpZihcImZ1bmN0aW9uXCI9PT10eXBlb2YgYyl0cnl7YyhudWxsKX1jYXRjaChkKXtVKGEsYixkKX1lbHNlIGMuY3VycmVudD1udWxsfWZ1bmN0aW9uIEpnKGEsYixjKXt0cnl7YygpfWNhdGNoKGQpe1UoYSxiLGQpfX12YXIgS2c9ITE7XG5mdW5jdGlvbiBMZyhhLGIpe0hhKGEuY29udGFpbmVySW5mbyk7Zm9yKFQ9YjtudWxsIT09VDspaWYoYT1ULGI9YS5jaGlsZCwwIT09KGEuc3VidHJlZUZsYWdzJjEwMjgpJiZudWxsIT09YiliLnJldHVybj1hLFQ9YjtlbHNlIGZvcig7bnVsbCE9PVQ7KXthPVQ7dHJ5e3ZhciBjPWEuYWx0ZXJuYXRlO2lmKDAhPT0oYS5mbGFncyYxMDI0KSlzd2l0Y2goYS50YWcpe2Nhc2UgMDpjYXNlIDExOmNhc2UgMTU6YnJlYWs7Y2FzZSAxOmlmKG51bGwhPT1jKXt2YXIgZD1jLm1lbW9pemVkUHJvcHMsZT1jLm1lbW9pemVkU3RhdGUsZj1hLnN0YXRlTm9kZSxnPWYuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUoYS5lbGVtZW50VHlwZT09PWEudHlwZT9kOnhmKGEudHlwZSxkKSxlKTtmLl9fcmVhY3RJbnRlcm5hbFNuYXBzaG90QmVmb3JlVXBkYXRlPWd9YnJlYWs7Y2FzZSAzOlRhJiZ4YihhLnN0YXRlTm9kZS5jb250YWluZXJJbmZvKTticmVhaztjYXNlIDU6Y2FzZSA2OmNhc2UgNDpjYXNlIDE3OmJyZWFrO1xuZGVmYXVsdDp0aHJvdyBFcnJvcihuKDE2MykpO319Y2F0Y2goaCl7VShhLGEucmV0dXJuLGgpfWI9YS5zaWJsaW5nO2lmKG51bGwhPT1iKXtiLnJldHVybj1hLnJldHVybjtUPWI7YnJlYWt9VD1hLnJldHVybn1jPUtnO0tnPSExO3JldHVybiBjfWZ1bmN0aW9uIE1nKGEsYixjKXt2YXIgZD1iLnVwZGF0ZVF1ZXVlO2Q9bnVsbCE9PWQ/ZC5sYXN0RWZmZWN0Om51bGw7aWYobnVsbCE9PWQpe3ZhciBlPWQ9ZC5uZXh0O2Rve2lmKChlLnRhZyZhKT09PWEpe3ZhciBmPWUuZGVzdHJveTtlLmRlc3Ryb3k9dm9pZCAwO3ZvaWQgMCE9PWYmJkpnKGIsYyxmKX1lPWUubmV4dH13aGlsZShlIT09ZCl9fWZ1bmN0aW9uIE5nKGEsYil7Yj1iLnVwZGF0ZVF1ZXVlO2I9bnVsbCE9PWI/Yi5sYXN0RWZmZWN0Om51bGw7aWYobnVsbCE9PWIpe3ZhciBjPWI9Yi5uZXh0O2Rve2lmKChjLnRhZyZhKT09PWEpe3ZhciBkPWMuY3JlYXRlO2MuZGVzdHJveT1kKCl9Yz1jLm5leHR9d2hpbGUoYyE9PWIpfX1cbmZ1bmN0aW9uIE9nKGEpe3ZhciBiPWEucmVmO2lmKG51bGwhPT1iKXt2YXIgYz1hLnN0YXRlTm9kZTtzd2l0Y2goYS50YWcpe2Nhc2UgNTphPUVhKGMpO2JyZWFrO2RlZmF1bHQ6YT1jfVwiZnVuY3Rpb25cIj09PXR5cGVvZiBiP2IoYSk6Yi5jdXJyZW50PWF9fWZ1bmN0aW9uIFBnKGEpe3ZhciBiPWEuYWx0ZXJuYXRlO251bGwhPT1iJiYoYS5hbHRlcm5hdGU9bnVsbCxQZyhiKSk7YS5jaGlsZD1udWxsO2EuZGVsZXRpb25zPW51bGw7YS5zaWJsaW5nPW51bGw7NT09PWEudGFnJiYoYj1hLnN0YXRlTm9kZSxudWxsIT09YiYmWmEoYikpO2Euc3RhdGVOb2RlPW51bGw7YS5yZXR1cm49bnVsbDthLmRlcGVuZGVuY2llcz1udWxsO2EubWVtb2l6ZWRQcm9wcz1udWxsO2EubWVtb2l6ZWRTdGF0ZT1udWxsO2EucGVuZGluZ1Byb3BzPW51bGw7YS5zdGF0ZU5vZGU9bnVsbDthLnVwZGF0ZVF1ZXVlPW51bGx9XG5mdW5jdGlvbiBRZyhhKXtyZXR1cm4gNT09PWEudGFnfHwzPT09YS50YWd8fDQ9PT1hLnRhZ31mdW5jdGlvbiBSZyhhKXthOmZvcig7Oyl7Zm9yKDtudWxsPT09YS5zaWJsaW5nOyl7aWYobnVsbD09PWEucmV0dXJufHxRZyhhLnJldHVybikpcmV0dXJuIG51bGw7YT1hLnJldHVybn1hLnNpYmxpbmcucmV0dXJuPWEucmV0dXJuO2ZvcihhPWEuc2libGluZzs1IT09YS50YWcmJjYhPT1hLnRhZyYmMTghPT1hLnRhZzspe2lmKGEuZmxhZ3MmMiljb250aW51ZSBhO2lmKG51bGw9PT1hLmNoaWxkfHw0PT09YS50YWcpY29udGludWUgYTtlbHNlIGEuY2hpbGQucmV0dXJuPWEsYT1hLmNoaWxkfWlmKCEoYS5mbGFncyYyKSlyZXR1cm4gYS5zdGF0ZU5vZGV9fVxuZnVuY3Rpb24gU2coYSxiLGMpe3ZhciBkPWEudGFnO2lmKDU9PT1kfHw2PT09ZClhPWEuc3RhdGVOb2RlLGI/cGIoYyxhLGIpOmtiKGMsYSk7ZWxzZSBpZig0IT09ZCYmKGE9YS5jaGlsZCxudWxsIT09YSkpZm9yKFNnKGEsYixjKSxhPWEuc2libGluZztudWxsIT09YTspU2coYSxiLGMpLGE9YS5zaWJsaW5nfWZ1bmN0aW9uIFRnKGEsYixjKXt2YXIgZD1hLnRhZztpZig1PT09ZHx8Nj09PWQpYT1hLnN0YXRlTm9kZSxiP29iKGMsYSxiKTpqYihjLGEpO2Vsc2UgaWYoNCE9PWQmJihhPWEuY2hpbGQsbnVsbCE9PWEpKWZvcihUZyhhLGIsYyksYT1hLnNpYmxpbmc7bnVsbCE9PWE7KVRnKGEsYixjKSxhPWEuc2libGluZ312YXIgVj1udWxsLFVnPSExO2Z1bmN0aW9uIFZnKGEsYixjKXtmb3IoYz1jLmNoaWxkO251bGwhPT1jOylXZyhhLGIsYyksYz1jLnNpYmxpbmd9XG5mdW5jdGlvbiBXZyhhLGIsYyl7aWYoU2MmJlwiZnVuY3Rpb25cIj09PXR5cGVvZiBTYy5vbkNvbW1pdEZpYmVyVW5tb3VudCl0cnl7U2Mub25Db21taXRGaWJlclVubW91bnQoUmMsYyl9Y2F0Y2goaCl7fXN3aXRjaChjLnRhZyl7Y2FzZSA1OlN8fElnKGMsYik7Y2FzZSA2OmlmKFRhKXt2YXIgZD1WLGU9VWc7Vj1udWxsO1ZnKGEsYixjKTtWPWQ7VWc9ZTtudWxsIT09ViYmKFVnP3JiKFYsYy5zdGF0ZU5vZGUpOnFiKFYsYy5zdGF0ZU5vZGUpKX1lbHNlIFZnKGEsYixjKTticmVhaztjYXNlIDE4OlRhJiZudWxsIT09ViYmKFVnP1liKFYsYy5zdGF0ZU5vZGUpOlhiKFYsYy5zdGF0ZU5vZGUpKTticmVhaztjYXNlIDQ6VGE/KGQ9VixlPVVnLFY9Yy5zdGF0ZU5vZGUuY29udGFpbmVySW5mbyxVZz0hMCxWZyhhLGIsYyksVj1kLFVnPWUpOihVYSYmKGQ9Yy5zdGF0ZU5vZGUuY29udGFpbmVySW5mbyxlPXpiKGQpLENiKGQsZSkpLFZnKGEsYixjKSk7YnJlYWs7Y2FzZSAwOmNhc2UgMTE6Y2FzZSAxNDpjYXNlIDE1OmlmKCFTJiZcbihkPWMudXBkYXRlUXVldWUsbnVsbCE9PWQmJihkPWQubGFzdEVmZmVjdCxudWxsIT09ZCkpKXtlPWQ9ZC5uZXh0O2Rve3ZhciBmPWUsZz1mLmRlc3Ryb3k7Zj1mLnRhZzt2b2lkIDAhPT1nJiYoMCE9PShmJjIpP0pnKGMsYixnKTowIT09KGYmNCkmJkpnKGMsYixnKSk7ZT1lLm5leHR9d2hpbGUoZSE9PWQpfVZnKGEsYixjKTticmVhaztjYXNlIDE6aWYoIVMmJihJZyhjLGIpLGQ9Yy5zdGF0ZU5vZGUsXCJmdW5jdGlvblwiPT09dHlwZW9mIGQuY29tcG9uZW50V2lsbFVubW91bnQpKXRyeXtkLnByb3BzPWMubWVtb2l6ZWRQcm9wcyxkLnN0YXRlPWMubWVtb2l6ZWRTdGF0ZSxkLmNvbXBvbmVudFdpbGxVbm1vdW50KCl9Y2F0Y2goaCl7VShjLGIsaCl9VmcoYSxiLGMpO2JyZWFrO2Nhc2UgMjE6VmcoYSxiLGMpO2JyZWFrO2Nhc2UgMjI6Yy5tb2RlJjE/KFM9KGQ9Uyl8fG51bGwhPT1jLm1lbW9pemVkU3RhdGUsVmcoYSxiLGMpLFM9ZCk6VmcoYSxiLGMpO2JyZWFrO2RlZmF1bHQ6VmcoYSxiLFxuYyl9fWZ1bmN0aW9uIFhnKGEpe3ZhciBiPWEudXBkYXRlUXVldWU7aWYobnVsbCE9PWIpe2EudXBkYXRlUXVldWU9bnVsbDt2YXIgYz1hLnN0YXRlTm9kZTtudWxsPT09YyYmKGM9YS5zdGF0ZU5vZGU9bmV3IEhnKTtiLmZvckVhY2goZnVuY3Rpb24oYil7dmFyIGQ9WWcuYmluZChudWxsLGEsYik7Yy5oYXMoYil8fChjLmFkZChiKSxiLnRoZW4oZCxkKSl9KX19XG5mdW5jdGlvbiBaZyhhLGIpe3ZhciBjPWIuZGVsZXRpb25zO2lmKG51bGwhPT1jKWZvcih2YXIgZD0wO2Q8Yy5sZW5ndGg7ZCsrKXt2YXIgZT1jW2RdO3RyeXt2YXIgZj1hLGc9YjtpZihUYSl7dmFyIGg9ZzthOmZvcig7bnVsbCE9PWg7KXtzd2l0Y2goaC50YWcpe2Nhc2UgNTpWPWguc3RhdGVOb2RlO1VnPSExO2JyZWFrIGE7Y2FzZSAzOlY9aC5zdGF0ZU5vZGUuY29udGFpbmVySW5mbztVZz0hMDticmVhayBhO2Nhc2UgNDpWPWguc3RhdGVOb2RlLmNvbnRhaW5lckluZm87VWc9ITA7YnJlYWsgYX1oPWgucmV0dXJufWlmKG51bGw9PT1WKXRocm93IEVycm9yKG4oMTYwKSk7V2coZixnLGUpO1Y9bnVsbDtVZz0hMX1lbHNlIFdnKGYsZyxlKTt2YXIgaz1lLmFsdGVybmF0ZTtudWxsIT09ayYmKGsucmV0dXJuPW51bGwpO2UucmV0dXJuPW51bGx9Y2F0Y2gobCl7VShlLGIsbCl9fWlmKGIuc3VidHJlZUZsYWdzJjEyODU0KWZvcihiPWIuY2hpbGQ7bnVsbCE9PWI7KSRnKGIsYSksYj1iLnNpYmxpbmd9XG5mdW5jdGlvbiAkZyhhLGIpe3ZhciBjPWEuYWx0ZXJuYXRlLGQ9YS5mbGFncztzd2l0Y2goYS50YWcpe2Nhc2UgMDpjYXNlIDExOmNhc2UgMTQ6Y2FzZSAxNTpaZyhiLGEpO2FoKGEpO2lmKGQmNCl7dHJ5e01nKDMsYSxhLnJldHVybiksTmcoMyxhKX1jYXRjaChwKXtVKGEsYS5yZXR1cm4scCl9dHJ5e01nKDUsYSxhLnJldHVybil9Y2F0Y2gocCl7VShhLGEucmV0dXJuLHApfX1icmVhaztjYXNlIDE6WmcoYixhKTthaChhKTtkJjUxMiYmbnVsbCE9PWMmJklnKGMsYy5yZXR1cm4pO2JyZWFrO2Nhc2UgNTpaZyhiLGEpO2FoKGEpO2QmNTEyJiZudWxsIT09YyYmSWcoYyxjLnJldHVybik7aWYoVGEpe2lmKGEuZmxhZ3MmMzIpe3ZhciBlPWEuc3RhdGVOb2RlO3RyeXtzYihlKX1jYXRjaChwKXtVKGEsYS5yZXR1cm4scCl9fWlmKGQmNCYmKGU9YS5zdGF0ZU5vZGUsbnVsbCE9ZSkpe3ZhciBmPWEubWVtb2l6ZWRQcm9wcztjPW51bGwhPT1jP2MubWVtb2l6ZWRQcm9wczpmO2Q9YS50eXBlO2I9XG5hLnVwZGF0ZVF1ZXVlO2EudXBkYXRlUXVldWU9bnVsbDtpZihudWxsIT09Yil0cnl7bmIoZSxiLGQsYyxmLGEpfWNhdGNoKHApe1UoYSxhLnJldHVybixwKX19fWJyZWFrO2Nhc2UgNjpaZyhiLGEpO2FoKGEpO2lmKGQmNCYmVGEpe2lmKG51bGw9PT1hLnN0YXRlTm9kZSl0aHJvdyBFcnJvcihuKDE2MikpO2U9YS5zdGF0ZU5vZGU7Zj1hLm1lbW9pemVkUHJvcHM7Yz1udWxsIT09Yz9jLm1lbW9pemVkUHJvcHM6Zjt0cnl7bGIoZSxjLGYpfWNhdGNoKHApe1UoYSxhLnJldHVybixwKX19YnJlYWs7Y2FzZSAzOlpnKGIsYSk7YWgoYSk7aWYoZCY0KXtpZihUYSYmVmEmJm51bGwhPT1jJiZjLm1lbW9pemVkU3RhdGUuaXNEZWh5ZHJhdGVkKXRyeXtWYihiLmNvbnRhaW5lckluZm8pfWNhdGNoKHApe1UoYSxhLnJldHVybixwKX1pZihVYSl7ZT1iLmNvbnRhaW5lckluZm87Zj1iLnBlbmRpbmdDaGlsZHJlbjt0cnl7Q2IoZSxmKX1jYXRjaChwKXtVKGEsYS5yZXR1cm4scCl9fX1icmVhaztjYXNlIDQ6WmcoYixcbmEpO2FoKGEpO2lmKGQmNCYmVWEpe2Y9YS5zdGF0ZU5vZGU7ZT1mLmNvbnRhaW5lckluZm87Zj1mLnBlbmRpbmdDaGlsZHJlbjt0cnl7Q2IoZSxmKX1jYXRjaChwKXtVKGEsYS5yZXR1cm4scCl9fWJyZWFrO2Nhc2UgMTM6WmcoYixhKTthaChhKTtlPWEuY2hpbGQ7ZS5mbGFncyY4MTkyJiYoZj1udWxsIT09ZS5tZW1vaXplZFN0YXRlLGUuc3RhdGVOb2RlLmlzSGlkZGVuPWYsIWZ8fG51bGwhPT1lLmFsdGVybmF0ZSYmbnVsbCE9PWUuYWx0ZXJuYXRlLm1lbW9pemVkU3RhdGV8fChiaD1EKCkpKTtkJjQmJlhnKGEpO2JyZWFrO2Nhc2UgMjI6dmFyIGc9bnVsbCE9PWMmJm51bGwhPT1jLm1lbW9pemVkU3RhdGU7YS5tb2RlJjE/KFM9KGM9Uyl8fGcsWmcoYixhKSxTPWMpOlpnKGIsYSk7YWgoYSk7aWYoZCY4MTkyKXtjPW51bGwhPT1hLm1lbW9pemVkU3RhdGU7aWYoKGEuc3RhdGVOb2RlLmlzSGlkZGVuPWMpJiYhZyYmMCE9PShhLm1vZGUmMSkpZm9yKFQ9YSxkPWEuY2hpbGQ7bnVsbCE9PVxuZDspe2ZvcihiPVQ9ZDtudWxsIT09VDspe2c9VDt2YXIgaD1nLmNoaWxkO3N3aXRjaChnLnRhZyl7Y2FzZSAwOmNhc2UgMTE6Y2FzZSAxNDpjYXNlIDE1Ok1nKDQsZyxnLnJldHVybik7YnJlYWs7Y2FzZSAxOklnKGcsZy5yZXR1cm4pO3ZhciBrPWcuc3RhdGVOb2RlO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBrLmNvbXBvbmVudFdpbGxVbm1vdW50KXt2YXIgbD1nLG09Zy5yZXR1cm47dHJ5e3ZhciByPWw7ay5wcm9wcz1yLm1lbW9pemVkUHJvcHM7ay5zdGF0ZT1yLm1lbW9pemVkU3RhdGU7ay5jb21wb25lbnRXaWxsVW5tb3VudCgpfWNhdGNoKHApe1UobCxtLHApfX1icmVhaztjYXNlIDU6SWcoZyxnLnJldHVybik7YnJlYWs7Y2FzZSAyMjppZihudWxsIT09Zy5tZW1vaXplZFN0YXRlKXtjaChiKTtjb250aW51ZX19bnVsbCE9PWg/KGgucmV0dXJuPWcsVD1oKTpjaChiKX1kPWQuc2libGluZ31pZihUYSlhOmlmKGQ9bnVsbCxUYSlmb3IoYj1hOzspe2lmKDU9PT1iLnRhZyl7aWYobnVsbD09PVxuZCl7ZD1iO3RyeXtlPWIuc3RhdGVOb2RlLGM/dGIoZSk6dmIoYi5zdGF0ZU5vZGUsYi5tZW1vaXplZFByb3BzKX1jYXRjaChwKXtVKGEsYS5yZXR1cm4scCl9fX1lbHNlIGlmKDY9PT1iLnRhZyl7aWYobnVsbD09PWQpdHJ5e2Y9Yi5zdGF0ZU5vZGUsYz91YihmKTp3YihmLGIubWVtb2l6ZWRQcm9wcyl9Y2F0Y2gocCl7VShhLGEucmV0dXJuLHApfX1lbHNlIGlmKCgyMiE9PWIudGFnJiYyMyE9PWIudGFnfHxudWxsPT09Yi5tZW1vaXplZFN0YXRlfHxiPT09YSkmJm51bGwhPT1iLmNoaWxkKXtiLmNoaWxkLnJldHVybj1iO2I9Yi5jaGlsZDtjb250aW51ZX1pZihiPT09YSlicmVhayBhO2Zvcig7bnVsbD09PWIuc2libGluZzspe2lmKG51bGw9PT1iLnJldHVybnx8Yi5yZXR1cm49PT1hKWJyZWFrIGE7ZD09PWImJihkPW51bGwpO2I9Yi5yZXR1cm59ZD09PWImJihkPW51bGwpO2Iuc2libGluZy5yZXR1cm49Yi5yZXR1cm47Yj1iLnNpYmxpbmd9fWJyZWFrO2Nhc2UgMTk6WmcoYixhKTthaChhKTtcbmQmNCYmWGcoYSk7YnJlYWs7Y2FzZSAyMTpicmVhaztkZWZhdWx0OlpnKGIsYSksYWgoYSl9fWZ1bmN0aW9uIGFoKGEpe3ZhciBiPWEuZmxhZ3M7aWYoYiYyKXt0cnl7aWYoVGEpe2I6e2Zvcih2YXIgYz1hLnJldHVybjtudWxsIT09Yzspe2lmKFFnKGMpKXt2YXIgZD1jO2JyZWFrIGJ9Yz1jLnJldHVybn10aHJvdyBFcnJvcihuKDE2MCkpO31zd2l0Y2goZC50YWcpe2Nhc2UgNTp2YXIgZT1kLnN0YXRlTm9kZTtkLmZsYWdzJjMyJiYoc2IoZSksZC5mbGFncyY9LTMzKTt2YXIgZj1SZyhhKTtUZyhhLGYsZSk7YnJlYWs7Y2FzZSAzOmNhc2UgNDp2YXIgZz1kLnN0YXRlTm9kZS5jb250YWluZXJJbmZvLGg9UmcoYSk7U2coYSxoLGcpO2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IobigxNjEpKTt9fX1jYXRjaChrKXtVKGEsYS5yZXR1cm4sayl9YS5mbGFncyY9LTN9YiY0MDk2JiYoYS5mbGFncyY9LTQwOTcpfWZ1bmN0aW9uIGRoKGEsYixjKXtUPWE7ZWgoYSxiLGMpfVxuZnVuY3Rpb24gZWgoYSxiLGMpe2Zvcih2YXIgZD0wIT09KGEubW9kZSYxKTtudWxsIT09VDspe3ZhciBlPVQsZj1lLmNoaWxkO2lmKDIyPT09ZS50YWcmJmQpe3ZhciBnPW51bGwhPT1lLm1lbW9pemVkU3RhdGV8fEdnO2lmKCFnKXt2YXIgaD1lLmFsdGVybmF0ZSxrPW51bGwhPT1oJiZudWxsIT09aC5tZW1vaXplZFN0YXRlfHxTO2g9R2c7dmFyIGw9UztHZz1nO2lmKChTPWspJiYhbClmb3IoVD1lO251bGwhPT1UOylnPVQsaz1nLmNoaWxkLDIyPT09Zy50YWcmJm51bGwhPT1nLm1lbW9pemVkU3RhdGU/ZmgoZSk6bnVsbCE9PWs/KGsucmV0dXJuPWcsVD1rKTpmaChlKTtmb3IoO251bGwhPT1mOylUPWYsZWgoZixiLGMpLGY9Zi5zaWJsaW5nO1Q9ZTtHZz1oO1M9bH1naChhLGIsYyl9ZWxzZSAwIT09KGUuc3VidHJlZUZsYWdzJjg3NzIpJiZudWxsIT09Zj8oZi5yZXR1cm49ZSxUPWYpOmdoKGEsYixjKX19XG5mdW5jdGlvbiBnaChhKXtmb3IoO251bGwhPT1UOyl7dmFyIGI9VDtpZigwIT09KGIuZmxhZ3MmODc3Mikpe3ZhciBjPWIuYWx0ZXJuYXRlO3RyeXtpZigwIT09KGIuZmxhZ3MmODc3Mikpc3dpdGNoKGIudGFnKXtjYXNlIDA6Y2FzZSAxMTpjYXNlIDE1OlN8fE5nKDUsYik7YnJlYWs7Y2FzZSAxOnZhciBkPWIuc3RhdGVOb2RlO2lmKGIuZmxhZ3MmNCYmIVMpaWYobnVsbD09PWMpZC5jb21wb25lbnREaWRNb3VudCgpO2Vsc2V7dmFyIGU9Yi5lbGVtZW50VHlwZT09PWIudHlwZT9jLm1lbW9pemVkUHJvcHM6eGYoYi50eXBlLGMubWVtb2l6ZWRQcm9wcyk7ZC5jb21wb25lbnREaWRVcGRhdGUoZSxjLm1lbW9pemVkU3RhdGUsZC5fX3JlYWN0SW50ZXJuYWxTbmFwc2hvdEJlZm9yZVVwZGF0ZSl9dmFyIGY9Yi51cGRhdGVRdWV1ZTtudWxsIT09ZiYmbWUoYixmLGQpO2JyZWFrO2Nhc2UgMzp2YXIgZz1iLnVwZGF0ZVF1ZXVlO2lmKG51bGwhPT1nKXtjPW51bGw7aWYobnVsbCE9PWIuY2hpbGQpc3dpdGNoKGIuY2hpbGQudGFnKXtjYXNlIDU6Yz1cbkVhKGIuY2hpbGQuc3RhdGVOb2RlKTticmVhaztjYXNlIDE6Yz1iLmNoaWxkLnN0YXRlTm9kZX1tZShiLGcsYyl9YnJlYWs7Y2FzZSA1OnZhciBoPWIuc3RhdGVOb2RlO251bGw9PT1jJiZiLmZsYWdzJjQmJm1iKGgsYi50eXBlLGIubWVtb2l6ZWRQcm9wcyxiKTticmVhaztjYXNlIDY6YnJlYWs7Y2FzZSA0OmJyZWFrO2Nhc2UgMTI6YnJlYWs7Y2FzZSAxMzppZihWYSYmbnVsbD09PWIubWVtb2l6ZWRTdGF0ZSl7dmFyIGs9Yi5hbHRlcm5hdGU7aWYobnVsbCE9PWspe3ZhciBsPWsubWVtb2l6ZWRTdGF0ZTtpZihudWxsIT09bCl7dmFyIG09bC5kZWh5ZHJhdGVkO251bGwhPT1tJiZXYihtKX19fWJyZWFrO2Nhc2UgMTk6Y2FzZSAxNzpjYXNlIDIxOmNhc2UgMjI6Y2FzZSAyMzpjYXNlIDI1OmJyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IobigxNjMpKTt9U3x8Yi5mbGFncyY1MTImJk9nKGIpfWNhdGNoKHIpe1UoYixiLnJldHVybixyKX19aWYoYj09PWEpe1Q9bnVsbDticmVha31jPWIuc2libGluZztcbmlmKG51bGwhPT1jKXtjLnJldHVybj1iLnJldHVybjtUPWM7YnJlYWt9VD1iLnJldHVybn19ZnVuY3Rpb24gY2goYSl7Zm9yKDtudWxsIT09VDspe3ZhciBiPVQ7aWYoYj09PWEpe1Q9bnVsbDticmVha312YXIgYz1iLnNpYmxpbmc7aWYobnVsbCE9PWMpe2MucmV0dXJuPWIucmV0dXJuO1Q9YzticmVha31UPWIucmV0dXJufX1cbmZ1bmN0aW9uIGZoKGEpe2Zvcig7bnVsbCE9PVQ7KXt2YXIgYj1UO3RyeXtzd2l0Y2goYi50YWcpe2Nhc2UgMDpjYXNlIDExOmNhc2UgMTU6dmFyIGM9Yi5yZXR1cm47dHJ5e05nKDQsYil9Y2F0Y2goayl7VShiLGMsayl9YnJlYWs7Y2FzZSAxOnZhciBkPWIuc3RhdGVOb2RlO2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBkLmNvbXBvbmVudERpZE1vdW50KXt2YXIgZT1iLnJldHVybjt0cnl7ZC5jb21wb25lbnREaWRNb3VudCgpfWNhdGNoKGspe1UoYixlLGspfX12YXIgZj1iLnJldHVybjt0cnl7T2coYil9Y2F0Y2goayl7VShiLGYsayl9YnJlYWs7Y2FzZSA1OnZhciBnPWIucmV0dXJuO3RyeXtPZyhiKX1jYXRjaChrKXtVKGIsZyxrKX19fWNhdGNoKGspe1UoYixiLnJldHVybixrKX1pZihiPT09YSl7VD1udWxsO2JyZWFrfXZhciBoPWIuc2libGluZztpZihudWxsIT09aCl7aC5yZXR1cm49Yi5yZXR1cm47VD1oO2JyZWFrfVQ9Yi5yZXR1cm59fVxudmFyIGhoPTAsaWg9MSxqaD0yLGtoPTMsbGg9NDtpZihcImZ1bmN0aW9uXCI9PT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuZm9yKXt2YXIgbWg9U3ltYm9sLmZvcjtoaD1taChcInNlbGVjdG9yLmNvbXBvbmVudFwiKTtpaD1taChcInNlbGVjdG9yLmhhc19wc2V1ZG9fY2xhc3NcIik7amg9bWgoXCJzZWxlY3Rvci5yb2xlXCIpO2toPW1oKFwic2VsZWN0b3IudGVzdF9pZFwiKTtsaD1taChcInNlbGVjdG9yLnRleHRcIil9ZnVuY3Rpb24gbmgoYSl7dmFyIGI9V2EoYSk7aWYobnVsbCE9Yil7aWYoXCJzdHJpbmdcIiE9PXR5cGVvZiBiLm1lbW9pemVkUHJvcHNbXCJkYXRhLXRlc3RuYW1lXCJdKXRocm93IEVycm9yKG4oMzY0KSk7cmV0dXJuIGJ9YT1jYihhKTtpZihudWxsPT09YSl0aHJvdyBFcnJvcihuKDM2MikpO3JldHVybiBhLnN0YXRlTm9kZS5jdXJyZW50fVxuZnVuY3Rpb24gb2goYSxiKXtzd2l0Y2goYi4kJHR5cGVvZil7Y2FzZSBoaDppZihhLnR5cGU9PT1iLnZhbHVlKXJldHVybiEwO2JyZWFrO2Nhc2UgaWg6YTp7Yj1iLnZhbHVlO2E9W2EsMF07Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDspe3ZhciBkPWFbYysrXSxlPWFbYysrXSxmPWJbZV07aWYoNSE9PWQudGFnfHwhZmIoZCkpe2Zvcig7bnVsbCE9ZiYmb2goZCxmKTspZSsrLGY9YltlXTtpZihlPT09Yi5sZW5ndGgpe2I9ITA7YnJlYWsgYX1lbHNlIGZvcihkPWQuY2hpbGQ7bnVsbCE9PWQ7KWEucHVzaChkLGUpLGQ9ZC5zaWJsaW5nfX1iPSExfXJldHVybiBiO2Nhc2Ugamg6aWYoNT09PWEudGFnJiZnYihhLnN0YXRlTm9kZSxiLnZhbHVlKSlyZXR1cm4hMDticmVhaztjYXNlIGxoOmlmKDU9PT1hLnRhZ3x8Nj09PWEudGFnKWlmKGE9ZWIoYSksbnVsbCE9PWEmJjA8PWEuaW5kZXhPZihiLnZhbHVlKSlyZXR1cm4hMDticmVhaztjYXNlIGtoOmlmKDU9PT1hLnRhZyYmKGE9YS5tZW1vaXplZFByb3BzW1wiZGF0YS10ZXN0bmFtZVwiXSxcblwic3RyaW5nXCI9PT10eXBlb2YgYSYmYS50b0xvd2VyQ2FzZSgpPT09Yi52YWx1ZS50b0xvd2VyQ2FzZSgpKSlyZXR1cm4hMDticmVhaztkZWZhdWx0OnRocm93IEVycm9yKG4oMzY1KSk7fXJldHVybiExfWZ1bmN0aW9uIHBoKGEpe3N3aXRjaChhLiQkdHlwZW9mKXtjYXNlIGhoOnJldHVyblwiPFwiKyh1YShhLnZhbHVlKXx8XCJVbmtub3duXCIpK1wiPlwiO2Nhc2UgaWg6cmV0dXJuXCI6aGFzKFwiKyhwaChhKXx8XCJcIikrXCIpXCI7Y2FzZSBqaDpyZXR1cm4nW3JvbGU9XCInK2EudmFsdWUrJ1wiXSc7Y2FzZSBsaDpyZXR1cm4nXCInK2EudmFsdWUrJ1wiJztjYXNlIGtoOnJldHVybidbZGF0YS10ZXN0bmFtZT1cIicrYS52YWx1ZSsnXCJdJztkZWZhdWx0OnRocm93IEVycm9yKG4oMzY1KSk7fX1cbmZ1bmN0aW9uIHFoKGEsYil7dmFyIGM9W107YT1bYSwwXTtmb3IodmFyIGQ9MDtkPGEubGVuZ3RoOyl7dmFyIGU9YVtkKytdLGY9YVtkKytdLGc9YltmXTtpZig1IT09ZS50YWd8fCFmYihlKSl7Zm9yKDtudWxsIT1nJiZvaChlLGcpOylmKyssZz1iW2ZdO2lmKGY9PT1iLmxlbmd0aCljLnB1c2goZSk7ZWxzZSBmb3IoZT1lLmNoaWxkO251bGwhPT1lOylhLnB1c2goZSxmKSxlPWUuc2libGluZ319cmV0dXJuIGN9ZnVuY3Rpb24gcmgoYSxiKXtpZighYmIpdGhyb3cgRXJyb3IobigzNjMpKTthPW5oKGEpO2E9cWgoYSxiKTtiPVtdO2E9QXJyYXkuZnJvbShhKTtmb3IodmFyIGM9MDtjPGEubGVuZ3RoOyl7dmFyIGQ9YVtjKytdO2lmKDU9PT1kLnRhZylmYihkKXx8Yi5wdXNoKGQuc3RhdGVOb2RlKTtlbHNlIGZvcihkPWQuY2hpbGQ7bnVsbCE9PWQ7KWEucHVzaChkKSxkPWQuc2libGluZ31yZXR1cm4gYn1cbnZhciBzaD1NYXRoLmNlaWwsdGg9ZGEuUmVhY3RDdXJyZW50RGlzcGF0Y2hlcix1aD1kYS5SZWFjdEN1cnJlbnRPd25lcixXPWRhLlJlYWN0Q3VycmVudEJhdGNoQ29uZmlnLEg9MCxOPW51bGwsWD1udWxsLFo9MCwkZj0wLFpmPWljKDApLFI9MCx2aD1udWxsLGxlPTAsd2g9MCx4aD0wLHloPW51bGwsemg9bnVsbCxiaD0wLERnPUluZmluaXR5LEFoPW51bGw7ZnVuY3Rpb24gQmgoKXtEZz1EKCkrNTAwfXZhciBKZj0hMSxLZj1udWxsLE1mPW51bGwsQ2g9ITEsRGg9bnVsbCxFaD0wLEZoPTAsR2g9bnVsbCxIaD0tMSxJaD0wO2Z1bmN0aW9uIE8oKXtyZXR1cm4gMCE9PShIJjYpP0QoKTotMSE9PUhoP0hoOkhoPUQoKX1mdW5jdGlvbiB0ZihhKXtpZigwPT09KGEubW9kZSYxKSlyZXR1cm4gMTtpZigwIT09KEgmMikmJjAhPT1aKXJldHVybiBaJi1aO2lmKG51bGwhPT1DZC50cmFuc2l0aW9uKXJldHVybiAwPT09SWgmJihJaD1EYygpKSxJaDthPUM7cmV0dXJuIDAhPT1hP2E6WWEoKX1cbmZ1bmN0aW9uIGFmKGEsYixjLGQpe2lmKDUwPEZoKXRocm93IEZoPTAsR2g9bnVsbCxFcnJvcihuKDE4NSkpO0ZjKGEsYyxkKTtpZigwPT09KEgmMil8fGEhPT1OKWE9PT1OJiYoMD09PShIJjIpJiYod2h8PWMpLDQ9PT1SJiZKaChhLFopKSxLaChhLGQpLDE9PT1jJiYwPT09SCYmMD09PShiLm1vZGUmMSkmJihCaCgpLFhjJiZhZCgpKX1cbmZ1bmN0aW9uIEtoKGEsYil7dmFyIGM9YS5jYWxsYmFja05vZGU7QmMoYSxiKTt2YXIgZD16YyhhLGE9PT1OP1o6MCk7aWYoMD09PWQpbnVsbCE9PWMmJktjKGMpLGEuY2FsbGJhY2tOb2RlPW51bGwsYS5jYWxsYmFja1ByaW9yaXR5PTA7ZWxzZSBpZihiPWQmLWQsYS5jYWxsYmFja1ByaW9yaXR5IT09Yil7bnVsbCE9YyYmS2MoYyk7aWYoMT09PWIpMD09PWEudGFnPyRjKExoLmJpbmQobnVsbCxhKSk6WmMoTGguYmluZChudWxsLGEpKSwkYT9hYihmdW5jdGlvbigpezA9PT0oSCY2KSYmYWQoKX0pOkpjKE5jLGFkKSxjPW51bGw7ZWxzZXtzd2l0Y2goSWMoZCkpe2Nhc2UgMTpjPU5jO2JyZWFrO2Nhc2UgNDpjPU9jO2JyZWFrO2Nhc2UgMTY6Yz1QYzticmVhaztjYXNlIDUzNjg3MDkxMjpjPVFjO2JyZWFrO2RlZmF1bHQ6Yz1QY31jPU1oKGMsTmguYmluZChudWxsLGEpKX1hLmNhbGxiYWNrUHJpb3JpdHk9YjthLmNhbGxiYWNrTm9kZT1jfX1cbmZ1bmN0aW9uIE5oKGEsYil7SGg9LTE7SWg9MDtpZigwIT09KEgmNikpdGhyb3cgRXJyb3IobigzMjcpKTt2YXIgYz1hLmNhbGxiYWNrTm9kZTtpZihPaCgpJiZhLmNhbGxiYWNrTm9kZSE9PWMpcmV0dXJuIG51bGw7dmFyIGQ9emMoYSxhPT09Tj9aOjApO2lmKDA9PT1kKXJldHVybiBudWxsO2lmKDAhPT0oZCYzMCl8fDAhPT0oZCZhLmV4cGlyZWRMYW5lcyl8fGIpYj1QaChhLGQpO2Vsc2V7Yj1kO3ZhciBlPUg7SHw9Mjt2YXIgZj1RaCgpO2lmKE4hPT1hfHxaIT09YilBaD1udWxsLEJoKCksUmgoYSxiKTtkbyB0cnl7U2goKTticmVha31jYXRjaChoKXtUaChhLGgpfXdoaWxlKDEpO1VkKCk7dGguY3VycmVudD1mO0g9ZTtudWxsIT09WD9iPTA6KE49bnVsbCxaPTAsYj1SKX1pZigwIT09Yil7Mj09PWImJihlPUNjKGEpLDAhPT1lJiYoZD1lLGI9VWgoYSxlKSkpO2lmKDE9PT1iKXRocm93IGM9dmgsUmgoYSwwKSxKaChhLGQpLEtoKGEsRCgpKSxjO2lmKDY9PT1iKUpoKGEsZCk7ZWxzZXtlPVxuYS5jdXJyZW50LmFsdGVybmF0ZTtpZigwPT09KGQmMzApJiYhVmgoZSkmJihiPVBoKGEsZCksMj09PWImJihmPUNjKGEpLDAhPT1mJiYoZD1mLGI9VWgoYSxmKSkpLDE9PT1iKSl0aHJvdyBjPXZoLFJoKGEsMCksSmgoYSxkKSxLaChhLEQoKSksYzthLmZpbmlzaGVkV29yaz1lO2EuZmluaXNoZWRMYW5lcz1kO3N3aXRjaChiKXtjYXNlIDA6Y2FzZSAxOnRocm93IEVycm9yKG4oMzQ1KSk7Y2FzZSAyOldoKGEsemgsQWgpO2JyZWFrO2Nhc2UgMzpKaChhLGQpO2lmKChkJjEzMDAyMzQyNCk9PT1kJiYoYj1iaCs1MDAtRCgpLDEwPGIpKXtpZigwIT09emMoYSwwKSlicmVhaztlPWEuc3VzcGVuZGVkTGFuZXM7aWYoKGUmZCkhPT1kKXtPKCk7YS5waW5nZWRMYW5lc3w9YS5zdXNwZW5kZWRMYW5lcyZlO2JyZWFrfWEudGltZW91dEhhbmRsZT1QYShXaC5iaW5kKG51bGwsYSx6aCxBaCksYik7YnJlYWt9V2goYSx6aCxBaCk7YnJlYWs7Y2FzZSA0OkpoKGEsZCk7aWYoKGQmNDE5NDI0MCk9PT1kKWJyZWFrO1xuYj1hLmV2ZW50VGltZXM7Zm9yKGU9LTE7MDxkOyl7dmFyIGc9MzEtdGMoZCk7Zj0xPDxnO2c9YltnXTtnPmUmJihlPWcpO2QmPX5mfWQ9ZTtkPUQoKS1kO2Q9KDEyMD5kPzEyMDo0ODA+ZD80ODA6MTA4MD5kPzEwODA6MTkyMD5kPzE5MjA6M0UzPmQ/M0UzOjQzMjA+ZD80MzIwOjE5NjAqc2goZC8xOTYwKSktZDtpZigxMDxkKXthLnRpbWVvdXRIYW5kbGU9UGEoV2guYmluZChudWxsLGEsemgsQWgpLGQpO2JyZWFrfVdoKGEsemgsQWgpO2JyZWFrO2Nhc2UgNTpXaChhLHpoLEFoKTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKG4oMzI5KSk7fX19S2goYSxEKCkpO3JldHVybiBhLmNhbGxiYWNrTm9kZT09PWM/TmguYmluZChudWxsLGEpOm51bGx9XG5mdW5jdGlvbiBVaChhLGIpe3ZhciBjPXloO2EuY3VycmVudC5tZW1vaXplZFN0YXRlLmlzRGVoeWRyYXRlZCYmKFJoKGEsYikuZmxhZ3N8PTI1Nik7YT1QaChhLGIpOzIhPT1hJiYoYj16aCx6aD1jLG51bGwhPT1iJiZDZyhiKSk7cmV0dXJuIGF9ZnVuY3Rpb24gQ2coYSl7bnVsbD09PXpoP3poPWE6emgucHVzaC5hcHBseSh6aCxhKX1cbmZ1bmN0aW9uIFZoKGEpe2Zvcih2YXIgYj1hOzspe2lmKGIuZmxhZ3MmMTYzODQpe3ZhciBjPWIudXBkYXRlUXVldWU7aWYobnVsbCE9PWMmJihjPWMuc3RvcmVzLG51bGwhPT1jKSlmb3IodmFyIGQ9MDtkPGMubGVuZ3RoO2QrKyl7dmFyIGU9Y1tkXSxmPWUuZ2V0U25hcHNob3Q7ZT1lLnZhbHVlO3RyeXtpZighVmMoZigpLGUpKXJldHVybiExfWNhdGNoKGcpe3JldHVybiExfX19Yz1iLmNoaWxkO2lmKGIuc3VidHJlZUZsYWdzJjE2Mzg0JiZudWxsIT09YyljLnJldHVybj1iLGI9YztlbHNle2lmKGI9PT1hKWJyZWFrO2Zvcig7bnVsbD09PWIuc2libGluZzspe2lmKG51bGw9PT1iLnJldHVybnx8Yi5yZXR1cm49PT1hKXJldHVybiEwO2I9Yi5yZXR1cm59Yi5zaWJsaW5nLnJldHVybj1iLnJldHVybjtiPWIuc2libGluZ319cmV0dXJuITB9XG5mdW5jdGlvbiBKaChhLGIpe2ImPX54aDtiJj1+d2g7YS5zdXNwZW5kZWRMYW5lc3w9YjthLnBpbmdlZExhbmVzJj1+Yjtmb3IoYT1hLmV4cGlyYXRpb25UaW1lczswPGI7KXt2YXIgYz0zMS10YyhiKSxkPTE8PGM7YVtjXT0tMTtiJj1+ZH19ZnVuY3Rpb24gTGgoYSl7aWYoMCE9PShIJjYpKXRocm93IEVycm9yKG4oMzI3KSk7T2goKTt2YXIgYj16YyhhLDApO2lmKDA9PT0oYiYxKSlyZXR1cm4gS2goYSxEKCkpLG51bGw7dmFyIGM9UGgoYSxiKTtpZigwIT09YS50YWcmJjI9PT1jKXt2YXIgZD1DYyhhKTswIT09ZCYmKGI9ZCxjPVVoKGEsZCkpfWlmKDE9PT1jKXRocm93IGM9dmgsUmgoYSwwKSxKaChhLGIpLEtoKGEsRCgpKSxjO2lmKDY9PT1jKXRocm93IEVycm9yKG4oMzQ1KSk7YS5maW5pc2hlZFdvcms9YS5jdXJyZW50LmFsdGVybmF0ZTthLmZpbmlzaGVkTGFuZXM9YjtXaChhLHpoLEFoKTtLaChhLEQoKSk7cmV0dXJuIG51bGx9XG5mdW5jdGlvbiBYaChhKXtudWxsIT09RGgmJjA9PT1EaC50YWcmJjA9PT0oSCY2KSYmT2goKTt2YXIgYj1IO0h8PTE7dmFyIGM9Vy50cmFuc2l0aW9uLGQ9Qzt0cnl7aWYoVy50cmFuc2l0aW9uPW51bGwsQz0xLGEpcmV0dXJuIGEoKX1maW5hbGx5e0M9ZCxXLnRyYW5zaXRpb249YyxIPWIsMD09PShIJjYpJiZhZCgpfX1mdW5jdGlvbiBFZygpeyRmPVpmLmN1cnJlbnQ7cShaZil9XG5mdW5jdGlvbiBSaChhLGIpe2EuZmluaXNoZWRXb3JrPW51bGw7YS5maW5pc2hlZExhbmVzPTA7dmFyIGM9YS50aW1lb3V0SGFuZGxlO2MhPT1SYSYmKGEudGltZW91dEhhbmRsZT1SYSxRYShjKSk7aWYobnVsbCE9PVgpZm9yKGM9WC5yZXR1cm47bnVsbCE9PWM7KXt2YXIgZD1jO25kKGQpO3N3aXRjaChkLnRhZyl7Y2FzZSAxOmQ9ZC50eXBlLmNoaWxkQ29udGV4dFR5cGVzO251bGwhPT1kJiZ2b2lkIDAhPT1kJiZuYygpO2JyZWFrO2Nhc2UgMzp0ZSgpO3Eoeik7cSh4KTt5ZSgpO2JyZWFrO2Nhc2UgNTp2ZShkKTticmVhaztjYXNlIDQ6dGUoKTticmVhaztjYXNlIDEzOnEoSSk7YnJlYWs7Y2FzZSAxOTpxKEkpO2JyZWFrO2Nhc2UgMTA6V2QoZC50eXBlLl9jb250ZXh0KTticmVhaztjYXNlIDIyOmNhc2UgMjM6RWcoKX1jPWMucmV0dXJufU49YTtYPWE9SmQoYS5jdXJyZW50LG51bGwpO1o9JGY9YjtSPTA7dmg9bnVsbDt4aD13aD1sZT0wO3poPXloPW51bGw7aWYobnVsbCE9PSRkKXtmb3IoYj1cbjA7YjwkZC5sZW5ndGg7YisrKWlmKGM9JGRbYl0sZD1jLmludGVybGVhdmVkLG51bGwhPT1kKXtjLmludGVybGVhdmVkPW51bGw7dmFyIGU9ZC5uZXh0LGY9Yy5wZW5kaW5nO2lmKG51bGwhPT1mKXt2YXIgZz1mLm5leHQ7Zi5uZXh0PWU7ZC5uZXh0PWd9Yy5wZW5kaW5nPWR9JGQ9bnVsbH1yZXR1cm4gYX1cbmZ1bmN0aW9uIFRoKGEsYil7ZG97dmFyIGM9WDt0cnl7VWQoKTt6ZS5jdXJyZW50PUxlO2lmKENlKXtmb3IodmFyIGQ9Si5tZW1vaXplZFN0YXRlO251bGwhPT1kOyl7dmFyIGU9ZC5xdWV1ZTtudWxsIT09ZSYmKGUucGVuZGluZz1udWxsKTtkPWQubmV4dH1DZT0hMX1CZT0wO0w9Sz1KPW51bGw7RGU9ITE7RWU9MDt1aC5jdXJyZW50PW51bGw7aWYobnVsbD09PWN8fG51bGw9PT1jLnJldHVybil7Uj0xO3ZoPWI7WD1udWxsO2JyZWFrfWE6e3ZhciBmPWEsZz1jLnJldHVybixoPWMsaz1iO2I9WjtoLmZsYWdzfD0zMjc2ODtpZihudWxsIT09ayYmXCJvYmplY3RcIj09PXR5cGVvZiBrJiZcImZ1bmN0aW9uXCI9PT10eXBlb2Ygay50aGVuKXt2YXIgbD1rLG09aCxyPW0udGFnO2lmKDA9PT0obS5tb2RlJjEpJiYoMD09PXJ8fDExPT09cnx8MTU9PT1yKSl7dmFyIHA9bS5hbHRlcm5hdGU7cD8obS51cGRhdGVRdWV1ZT1wLnVwZGF0ZVF1ZXVlLG0ubWVtb2l6ZWRTdGF0ZT1wLm1lbW9pemVkU3RhdGUsXG5tLmxhbmVzPXAubGFuZXMpOihtLnVwZGF0ZVF1ZXVlPW51bGwsbS5tZW1vaXplZFN0YXRlPW51bGwpfXZhciBCPVBmKGcpO2lmKG51bGwhPT1CKXtCLmZsYWdzJj0tMjU3O1FmKEIsZyxoLGYsYik7Qi5tb2RlJjEmJk5mKGYsbCxiKTtiPUI7az1sO3ZhciB3PWIudXBkYXRlUXVldWU7aWYobnVsbD09PXcpe3ZhciBZPW5ldyBTZXQ7WS5hZGQoayk7Yi51cGRhdGVRdWV1ZT1ZfWVsc2Ugdy5hZGQoayk7YnJlYWsgYX1lbHNle2lmKDA9PT0oYiYxKSl7TmYoZixsLGIpO25nKCk7YnJlYWsgYX1rPUVycm9yKG4oNDI2KSl9fWVsc2UgaWYoRiYmaC5tb2RlJjEpe3ZhciB5YT1QZihnKTtpZihudWxsIT09eWEpezA9PT0oeWEuZmxhZ3MmNjU1MzYpJiYoeWEuZmxhZ3N8PTI1Nik7UWYoeWEsZyxoLGYsYik7QmQoRWYoayxoKSk7YnJlYWsgYX19Zj1rPUVmKGssaCk7NCE9PVImJihSPTIpO251bGw9PT15aD95aD1bZl06eWgucHVzaChmKTtmPWc7ZG97c3dpdGNoKGYudGFnKXtjYXNlIDM6Zi5mbGFnc3w9XG42NTUzNjtiJj0tYjtmLmxhbmVzfD1iO3ZhciBFPUlmKGYsayxiKTtqZShmLEUpO2JyZWFrIGE7Y2FzZSAxOmg9azt2YXIgdT1mLnR5cGUsdD1mLnN0YXRlTm9kZTtpZigwPT09KGYuZmxhZ3MmMTI4KSYmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiB1LmdldERlcml2ZWRTdGF0ZUZyb21FcnJvcnx8bnVsbCE9PXQmJlwiZnVuY3Rpb25cIj09PXR5cGVvZiB0LmNvbXBvbmVudERpZENhdGNoJiYobnVsbD09PU1mfHwhTWYuaGFzKHQpKSkpe2YuZmxhZ3N8PTY1NTM2O2ImPS1iO2YubGFuZXN8PWI7dmFyIERiPUxmKGYsaCxiKTtqZShmLERiKTticmVhayBhfX1mPWYucmV0dXJufXdoaWxlKG51bGwhPT1mKX1ZaChjKX1jYXRjaChsYyl7Yj1sYztYPT09YyYmbnVsbCE9PWMmJihYPWM9Yy5yZXR1cm4pO2NvbnRpbnVlfWJyZWFrfXdoaWxlKDEpfWZ1bmN0aW9uIFFoKCl7dmFyIGE9dGguY3VycmVudDt0aC5jdXJyZW50PUxlO3JldHVybiBudWxsPT09YT9MZTphfVxuZnVuY3Rpb24gbmcoKXtpZigwPT09Unx8Mz09PVJ8fDI9PT1SKVI9NDtudWxsPT09Tnx8MD09PShsZSYyNjg0MzU0NTUpJiYwPT09KHdoJjI2ODQzNTQ1NSl8fEpoKE4sWil9ZnVuY3Rpb24gUGgoYSxiKXt2YXIgYz1IO0h8PTI7dmFyIGQ9UWgoKTtpZihOIT09YXx8WiE9PWIpQWg9bnVsbCxSaChhLGIpO2RvIHRyeXtaaCgpO2JyZWFrfWNhdGNoKGUpe1RoKGEsZSl9d2hpbGUoMSk7VWQoKTtIPWM7dGguY3VycmVudD1kO2lmKG51bGwhPT1YKXRocm93IEVycm9yKG4oMjYxKSk7Tj1udWxsO1o9MDtyZXR1cm4gUn1mdW5jdGlvbiBaaCgpe2Zvcig7bnVsbCE9PVg7KSRoKFgpfWZ1bmN0aW9uIFNoKCl7Zm9yKDtudWxsIT09WCYmIUxjKCk7KSRoKFgpfWZ1bmN0aW9uICRoKGEpe3ZhciBiPWFpKGEuYWx0ZXJuYXRlLGEsJGYpO2EubWVtb2l6ZWRQcm9wcz1hLnBlbmRpbmdQcm9wcztudWxsPT09Yj9ZaChhKTpYPWI7dWguY3VycmVudD1udWxsfVxuZnVuY3Rpb24gWWgoYSl7dmFyIGI9YTtkb3t2YXIgYz1iLmFsdGVybmF0ZTthPWIucmV0dXJuO2lmKDA9PT0oYi5mbGFncyYzMjc2OCkpe2lmKGM9QmcoYyxiLCRmKSxudWxsIT09Yyl7WD1jO3JldHVybn19ZWxzZXtjPUZnKGMsYik7aWYobnVsbCE9PWMpe2MuZmxhZ3MmPTMyNzY3O1g9YztyZXR1cm59aWYobnVsbCE9PWEpYS5mbGFnc3w9MzI3NjgsYS5zdWJ0cmVlRmxhZ3M9MCxhLmRlbGV0aW9ucz1udWxsO2Vsc2V7Uj02O1g9bnVsbDtyZXR1cm59fWI9Yi5zaWJsaW5nO2lmKG51bGwhPT1iKXtYPWI7cmV0dXJufVg9Yj1hfXdoaWxlKG51bGwhPT1iKTswPT09UiYmKFI9NSl9ZnVuY3Rpb24gV2goYSxiLGMpe3ZhciBkPUMsZT1XLnRyYW5zaXRpb247dHJ5e1cudHJhbnNpdGlvbj1udWxsLEM9MSxiaShhLGIsYyxkKX1maW5hbGx5e1cudHJhbnNpdGlvbj1lLEM9ZH1yZXR1cm4gbnVsbH1cbmZ1bmN0aW9uIGJpKGEsYixjLGQpe2RvIE9oKCk7d2hpbGUobnVsbCE9PURoKTtpZigwIT09KEgmNikpdGhyb3cgRXJyb3IobigzMjcpKTtjPWEuZmluaXNoZWRXb3JrO3ZhciBlPWEuZmluaXNoZWRMYW5lcztpZihudWxsPT09YylyZXR1cm4gbnVsbDthLmZpbmlzaGVkV29yaz1udWxsO2EuZmluaXNoZWRMYW5lcz0wO2lmKGM9PT1hLmN1cnJlbnQpdGhyb3cgRXJyb3IobigxNzcpKTthLmNhbGxiYWNrTm9kZT1udWxsO2EuY2FsbGJhY2tQcmlvcml0eT0wO3ZhciBmPWMubGFuZXN8Yy5jaGlsZExhbmVzO0djKGEsZik7YT09PU4mJihYPU49bnVsbCxaPTApOzA9PT0oYy5zdWJ0cmVlRmxhZ3MmMjA2NCkmJjA9PT0oYy5mbGFncyYyMDY0KXx8Q2h8fChDaD0hMCxNaChQYyxmdW5jdGlvbigpe09oKCk7cmV0dXJuIG51bGx9KSk7Zj0wIT09KGMuZmxhZ3MmMTU5OTApO2lmKDAhPT0oYy5zdWJ0cmVlRmxhZ3MmMTU5OTApfHxmKXtmPVcudHJhbnNpdGlvbjtXLnRyYW5zaXRpb249bnVsbDt2YXIgZz1cbkM7Qz0xO3ZhciBoPUg7SHw9NDt1aC5jdXJyZW50PW51bGw7TGcoYSxjKTskZyhjLGEpO0lhKGEuY29udGFpbmVySW5mbyk7YS5jdXJyZW50PWM7ZGgoYyxhLGUpO01jKCk7SD1oO0M9ZztXLnRyYW5zaXRpb249Zn1lbHNlIGEuY3VycmVudD1jO0NoJiYoQ2g9ITEsRGg9YSxFaD1lKTtmPWEucGVuZGluZ0xhbmVzOzA9PT1mJiYoTWY9bnVsbCk7VGMoYy5zdGF0ZU5vZGUsZCk7S2goYSxEKCkpO2lmKG51bGwhPT1iKWZvcihkPWEub25SZWNvdmVyYWJsZUVycm9yLGM9MDtjPGIubGVuZ3RoO2MrKyllPWJbY10sZChlLnZhbHVlLHtjb21wb25lbnRTdGFjazplLnN0YWNrLGRpZ2VzdDplLmRpZ2VzdH0pO2lmKEpmKXRocm93IEpmPSExLGE9S2YsS2Y9bnVsbCxhOzAhPT0oRWgmMSkmJjAhPT1hLnRhZyYmT2goKTtmPWEucGVuZGluZ0xhbmVzOzAhPT0oZiYxKT9hPT09R2g/RmgrKzooRmg9MCxHaD1hKTpGaD0wO2FkKCk7cmV0dXJuIG51bGx9XG5mdW5jdGlvbiBPaCgpe2lmKG51bGwhPT1EaCl7dmFyIGE9SWMoRWgpLGI9Vy50cmFuc2l0aW9uLGM9Qzt0cnl7Vy50cmFuc2l0aW9uPW51bGw7Qz0xNj5hPzE2OmE7aWYobnVsbD09PURoKXZhciBkPSExO2Vsc2V7YT1EaDtEaD1udWxsO0VoPTA7aWYoMCE9PShIJjYpKXRocm93IEVycm9yKG4oMzMxKSk7dmFyIGU9SDtIfD00O2ZvcihUPWEuY3VycmVudDtudWxsIT09VDspe3ZhciBmPVQsZz1mLmNoaWxkO2lmKDAhPT0oVC5mbGFncyYxNikpe3ZhciBoPWYuZGVsZXRpb25zO2lmKG51bGwhPT1oKXtmb3IodmFyIGs9MDtrPGgubGVuZ3RoO2srKyl7dmFyIGw9aFtrXTtmb3IoVD1sO251bGwhPT1UOyl7dmFyIG09VDtzd2l0Y2gobS50YWcpe2Nhc2UgMDpjYXNlIDExOmNhc2UgMTU6TWcoOCxtLGYpfXZhciByPW0uY2hpbGQ7aWYobnVsbCE9PXIpci5yZXR1cm49bSxUPXI7ZWxzZSBmb3IoO251bGwhPT1UOyl7bT1UO3ZhciBwPW0uc2libGluZyxCPW0ucmV0dXJuO1BnKG0pO2lmKG09PT1cbmwpe1Q9bnVsbDticmVha31pZihudWxsIT09cCl7cC5yZXR1cm49QjtUPXA7YnJlYWt9VD1CfX19dmFyIHc9Zi5hbHRlcm5hdGU7aWYobnVsbCE9PXcpe3ZhciBZPXcuY2hpbGQ7aWYobnVsbCE9PVkpe3cuY2hpbGQ9bnVsbDtkb3t2YXIgeWE9WS5zaWJsaW5nO1kuc2libGluZz1udWxsO1k9eWF9d2hpbGUobnVsbCE9PVkpfX1UPWZ9fWlmKDAhPT0oZi5zdWJ0cmVlRmxhZ3MmMjA2NCkmJm51bGwhPT1nKWcucmV0dXJuPWYsVD1nO2Vsc2UgYjpmb3IoO251bGwhPT1UOyl7Zj1UO2lmKDAhPT0oZi5mbGFncyYyMDQ4KSlzd2l0Y2goZi50YWcpe2Nhc2UgMDpjYXNlIDExOmNhc2UgMTU6TWcoOSxmLGYucmV0dXJuKX12YXIgRT1mLnNpYmxpbmc7aWYobnVsbCE9PUUpe0UucmV0dXJuPWYucmV0dXJuO1Q9RTticmVhayBifVQ9Zi5yZXR1cm59fXZhciB1PWEuY3VycmVudDtmb3IoVD11O251bGwhPT1UOyl7Zz1UO3ZhciB0PWcuY2hpbGQ7aWYoMCE9PShnLnN1YnRyZWVGbGFncyYyMDY0KSYmbnVsbCE9PVxudCl0LnJldHVybj1nLFQ9dDtlbHNlIGI6Zm9yKGc9dTtudWxsIT09VDspe2g9VDtpZigwIT09KGguZmxhZ3MmMjA0OCkpdHJ5e3N3aXRjaChoLnRhZyl7Y2FzZSAwOmNhc2UgMTE6Y2FzZSAxNTpOZyg5LGgpfX1jYXRjaChsYyl7VShoLGgucmV0dXJuLGxjKX1pZihoPT09Zyl7VD1udWxsO2JyZWFrIGJ9dmFyIERiPWguc2libGluZztpZihudWxsIT09RGIpe0RiLnJldHVybj1oLnJldHVybjtUPURiO2JyZWFrIGJ9VD1oLnJldHVybn19SD1lO2FkKCk7aWYoU2MmJlwiZnVuY3Rpb25cIj09PXR5cGVvZiBTYy5vblBvc3RDb21taXRGaWJlclJvb3QpdHJ5e1NjLm9uUG9zdENvbW1pdEZpYmVyUm9vdChSYyxhKX1jYXRjaChsYyl7fWQ9ITB9cmV0dXJuIGR9ZmluYWxseXtDPWMsVy50cmFuc2l0aW9uPWJ9fXJldHVybiExfWZ1bmN0aW9uIGNpKGEsYixjKXtiPUVmKGMsYik7Yj1JZihhLGIsMSk7YT1oZShhLGIsMSk7Yj1PKCk7bnVsbCE9PWEmJihGYyhhLDEsYiksS2goYSxiKSl9XG5mdW5jdGlvbiBVKGEsYixjKXtpZigzPT09YS50YWcpY2koYSxhLGMpO2Vsc2UgZm9yKDtudWxsIT09Yjspe2lmKDM9PT1iLnRhZyl7Y2koYixhLGMpO2JyZWFrfWVsc2UgaWYoMT09PWIudGFnKXt2YXIgZD1iLnN0YXRlTm9kZTtpZihcImZ1bmN0aW9uXCI9PT10eXBlb2YgYi50eXBlLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvcnx8XCJmdW5jdGlvblwiPT09dHlwZW9mIGQuY29tcG9uZW50RGlkQ2F0Y2gmJihudWxsPT09TWZ8fCFNZi5oYXMoZCkpKXthPUVmKGMsYSk7YT1MZihiLGEsMSk7Yj1oZShiLGEsMSk7YT1PKCk7bnVsbCE9PWImJihGYyhiLDEsYSksS2goYixhKSk7YnJlYWt9fWI9Yi5yZXR1cm59fVxuZnVuY3Rpb24gT2YoYSxiLGMpe3ZhciBkPWEucGluZ0NhY2hlO251bGwhPT1kJiZkLmRlbGV0ZShiKTtiPU8oKTthLnBpbmdlZExhbmVzfD1hLnN1c3BlbmRlZExhbmVzJmM7Tj09PWEmJihaJmMpPT09YyYmKDQ9PT1SfHwzPT09UiYmKFomMTMwMDIzNDI0KT09PVomJjUwMD5EKCktYmg/UmgoYSwwKTp4aHw9Yyk7S2goYSxiKX1mdW5jdGlvbiBkaShhLGIpezA9PT1iJiYoMD09PShhLm1vZGUmMSk/Yj0xOihiPXhjLHhjPDw9MSwwPT09KHhjJjEzMDAyMzQyNCkmJih4Yz00MTk0MzA0KSkpO3ZhciBjPU8oKTthPWNlKGEsYik7bnVsbCE9PWEmJihGYyhhLGIsYyksS2goYSxjKSl9ZnVuY3Rpb24gb2coYSl7dmFyIGI9YS5tZW1vaXplZFN0YXRlLGM9MDtudWxsIT09YiYmKGM9Yi5yZXRyeUxhbmUpO2RpKGEsYyl9XG5mdW5jdGlvbiBZZyhhLGIpe3ZhciBjPTA7c3dpdGNoKGEudGFnKXtjYXNlIDEzOnZhciBkPWEuc3RhdGVOb2RlO3ZhciBlPWEubWVtb2l6ZWRTdGF0ZTtudWxsIT09ZSYmKGM9ZS5yZXRyeUxhbmUpO2JyZWFrO2Nhc2UgMTk6ZD1hLnN0YXRlTm9kZTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKG4oMzE0KSk7fW51bGwhPT1kJiZkLmRlbGV0ZShiKTtkaShhLGMpfXZhciBhaTtcbmFpPWZ1bmN0aW9uKGEsYixjKXtpZihudWxsIT09YSlpZihhLm1lbW9pemVkUHJvcHMhPT1iLnBlbmRpbmdQcm9wc3x8ei5jdXJyZW50KUc9ITA7ZWxzZXtpZigwPT09KGEubGFuZXMmYykmJjA9PT0oYi5mbGFncyYxMjgpKXJldHVybiBHPSExLHNnKGEsYixjKTtHPTAhPT0oYS5mbGFncyYxMzEwNzIpPyEwOiExfWVsc2UgRz0hMSxGJiYwIT09KGIuZmxhZ3MmMTA0ODU3NikmJmxkKGIsZWQsYi5pbmRleCk7Yi5sYW5lcz0wO3N3aXRjaChiLnRhZyl7Y2FzZSAyOnZhciBkPWIudHlwZTtjZyhhLGIpO2E9Yi5wZW5kaW5nUHJvcHM7dmFyIGU9bWMoYix4LmN1cnJlbnQpO1lkKGIsYyk7ZT1IZShudWxsLGIsZCxhLGUsYyk7dmFyIGY9TWUoKTtiLmZsYWdzfD0xO1wib2JqZWN0XCI9PT10eXBlb2YgZSYmbnVsbCE9PWUmJlwiZnVuY3Rpb25cIj09PXR5cGVvZiBlLnJlbmRlciYmdm9pZCAwPT09ZS4kJHR5cGVvZj8oYi50YWc9MSxiLm1lbW9pemVkU3RhdGU9bnVsbCxiLnVwZGF0ZVF1ZXVlPW51bGwsXG5BKGQpPyhmPSEwLHFjKGIpKTpmPSExLGIubWVtb2l6ZWRTdGF0ZT1udWxsIT09ZS5zdGF0ZSYmdm9pZCAwIT09ZS5zdGF0ZT9lLnN0YXRlOm51bGwsZWUoYiksZS51cGRhdGVyPXpmLGIuc3RhdGVOb2RlPWUsZS5fcmVhY3RJbnRlcm5hbHM9YixEZihiLGQsYSxjKSxiPWRnKG51bGwsYixkLCEwLGYsYykpOihiLnRhZz0wLEYmJmYmJm1kKGIpLFAobnVsbCxiLGUsYyksYj1iLmNoaWxkKTtyZXR1cm4gYjtjYXNlIDE2OmQ9Yi5lbGVtZW50VHlwZTthOntjZyhhLGIpO2E9Yi5wZW5kaW5nUHJvcHM7ZT1kLl9pbml0O2Q9ZShkLl9wYXlsb2FkKTtiLnR5cGU9ZDtlPWIudGFnPWVpKGQpO2E9eGYoZCxhKTtzd2l0Y2goZSl7Y2FzZSAwOmI9WGYobnVsbCxiLGQsYSxjKTticmVhayBhO2Nhc2UgMTpiPWJnKG51bGwsYixkLGEsYyk7YnJlYWsgYTtjYXNlIDExOmI9U2YobnVsbCxiLGQsYSxjKTticmVhayBhO2Nhc2UgMTQ6Yj1VZihudWxsLGIsZCx4ZihkLnR5cGUsYSksYyk7YnJlYWsgYX10aHJvdyBFcnJvcihuKDMwNixcbmQsXCJcIikpO31yZXR1cm4gYjtjYXNlIDA6cmV0dXJuIGQ9Yi50eXBlLGU9Yi5wZW5kaW5nUHJvcHMsZT1iLmVsZW1lbnRUeXBlPT09ZD9lOnhmKGQsZSksWGYoYSxiLGQsZSxjKTtjYXNlIDE6cmV0dXJuIGQ9Yi50eXBlLGU9Yi5wZW5kaW5nUHJvcHMsZT1iLmVsZW1lbnRUeXBlPT09ZD9lOnhmKGQsZSksYmcoYSxiLGQsZSxjKTtjYXNlIDM6YTp7ZWcoYik7aWYobnVsbD09PWEpdGhyb3cgRXJyb3IobigzODcpKTtkPWIucGVuZGluZ1Byb3BzO2Y9Yi5tZW1vaXplZFN0YXRlO2U9Zi5lbGVtZW50O2ZlKGEsYik7a2UoYixkLG51bGwsYyk7dmFyIGc9Yi5tZW1vaXplZFN0YXRlO2Q9Zy5lbGVtZW50O2lmKFZhJiZmLmlzRGVoeWRyYXRlZClpZihmPXtlbGVtZW50OmQsaXNEZWh5ZHJhdGVkOiExLGNhY2hlOmcuY2FjaGUscGVuZGluZ1N1c3BlbnNlQm91bmRhcmllczpnLnBlbmRpbmdTdXNwZW5zZUJvdW5kYXJpZXMsdHJhbnNpdGlvbnM6Zy50cmFuc2l0aW9uc30sYi51cGRhdGVRdWV1ZS5iYXNlU3RhdGU9XG5mLGIubWVtb2l6ZWRTdGF0ZT1mLGIuZmxhZ3MmMjU2KXtlPUVmKEVycm9yKG4oNDIzKSksYik7Yj1mZyhhLGIsZCxjLGUpO2JyZWFrIGF9ZWxzZSBpZihkIT09ZSl7ZT1FZihFcnJvcihuKDQyNCkpLGIpO2I9ZmcoYSxiLGQsYyxlKTticmVhayBhfWVsc2UgZm9yKFZhJiYocGQ9UGIoYi5zdGF0ZU5vZGUuY29udGFpbmVySW5mbyksb2Q9YixGPSEwLHJkPW51bGwscWQ9ITEpLGM9UGQoYixudWxsLGQsYyksYi5jaGlsZD1jO2M7KWMuZmxhZ3M9Yy5mbGFncyYtM3w0MDk2LGM9Yy5zaWJsaW5nO2Vsc2V7QWQoKTtpZihkPT09ZSl7Yj1UZihhLGIsYyk7YnJlYWsgYX1QKGEsYixkLGMpfWI9Yi5jaGlsZH1yZXR1cm4gYjtjYXNlIDU6cmV0dXJuIHVlKGIpLG51bGw9PT1hJiZ3ZChiKSxkPWIudHlwZSxlPWIucGVuZGluZ1Byb3BzLGY9bnVsbCE9PWE/YS5tZW1vaXplZFByb3BzOm51bGwsZz1lLmNoaWxkcmVuLE5hKGQsZSk/Zz1udWxsOm51bGwhPT1mJiZOYShkLGYpJiYoYi5mbGFnc3w9MzIpLFxuYWcoYSxiKSxQKGEsYixnLGMpLGIuY2hpbGQ7Y2FzZSA2OnJldHVybiBudWxsPT09YSYmd2QoYiksbnVsbDtjYXNlIDEzOnJldHVybiBpZyhhLGIsYyk7Y2FzZSA0OnJldHVybiBzZShiLGIuc3RhdGVOb2RlLmNvbnRhaW5lckluZm8pLGQ9Yi5wZW5kaW5nUHJvcHMsbnVsbD09PWE/Yi5jaGlsZD1PZChiLG51bGwsZCxjKTpQKGEsYixkLGMpLGIuY2hpbGQ7Y2FzZSAxMTpyZXR1cm4gZD1iLnR5cGUsZT1iLnBlbmRpbmdQcm9wcyxlPWIuZWxlbWVudFR5cGU9PT1kP2U6eGYoZCxlKSxTZihhLGIsZCxlLGMpO2Nhc2UgNzpyZXR1cm4gUChhLGIsYi5wZW5kaW5nUHJvcHMsYyksYi5jaGlsZDtjYXNlIDg6cmV0dXJuIFAoYSxiLGIucGVuZGluZ1Byb3BzLmNoaWxkcmVuLGMpLGIuY2hpbGQ7Y2FzZSAxMjpyZXR1cm4gUChhLGIsYi5wZW5kaW5nUHJvcHMuY2hpbGRyZW4sYyksYi5jaGlsZDtjYXNlIDEwOmE6e2Q9Yi50eXBlLl9jb250ZXh0O2U9Yi5wZW5kaW5nUHJvcHM7Zj1iLm1lbW9pemVkUHJvcHM7XG5nPWUudmFsdWU7VmQoYixkLGcpO2lmKG51bGwhPT1mKWlmKFZjKGYudmFsdWUsZykpe2lmKGYuY2hpbGRyZW49PT1lLmNoaWxkcmVuJiYhei5jdXJyZW50KXtiPVRmKGEsYixjKTticmVhayBhfX1lbHNlIGZvcihmPWIuY2hpbGQsbnVsbCE9PWYmJihmLnJldHVybj1iKTtudWxsIT09Zjspe3ZhciBoPWYuZGVwZW5kZW5jaWVzO2lmKG51bGwhPT1oKXtnPWYuY2hpbGQ7Zm9yKHZhciBrPWguZmlyc3RDb250ZXh0O251bGwhPT1rOyl7aWYoay5jb250ZXh0PT09ZCl7aWYoMT09PWYudGFnKXtrPWdlKC0xLGMmLWMpO2sudGFnPTI7dmFyIGw9Zi51cGRhdGVRdWV1ZTtpZihudWxsIT09bCl7bD1sLnNoYXJlZDt2YXIgbT1sLnBlbmRpbmc7bnVsbD09PW0/ay5uZXh0PWs6KGsubmV4dD1tLm5leHQsbS5uZXh0PWspO2wucGVuZGluZz1rfX1mLmxhbmVzfD1jO2s9Zi5hbHRlcm5hdGU7bnVsbCE9PWsmJihrLmxhbmVzfD1jKTtYZChmLnJldHVybixjLGIpO2gubGFuZXN8PWM7YnJlYWt9az1rLm5leHR9fWVsc2UgaWYoMTA9PT1cbmYudGFnKWc9Zi50eXBlPT09Yi50eXBlP251bGw6Zi5jaGlsZDtlbHNlIGlmKDE4PT09Zi50YWcpe2c9Zi5yZXR1cm47aWYobnVsbD09PWcpdGhyb3cgRXJyb3IobigzNDEpKTtnLmxhbmVzfD1jO2g9Zy5hbHRlcm5hdGU7bnVsbCE9PWgmJihoLmxhbmVzfD1jKTtYZChnLGMsYik7Zz1mLnNpYmxpbmd9ZWxzZSBnPWYuY2hpbGQ7aWYobnVsbCE9PWcpZy5yZXR1cm49ZjtlbHNlIGZvcihnPWY7bnVsbCE9PWc7KXtpZihnPT09Yil7Zz1udWxsO2JyZWFrfWY9Zy5zaWJsaW5nO2lmKG51bGwhPT1mKXtmLnJldHVybj1nLnJldHVybjtnPWY7YnJlYWt9Zz1nLnJldHVybn1mPWd9UChhLGIsZS5jaGlsZHJlbixjKTtiPWIuY2hpbGR9cmV0dXJuIGI7Y2FzZSA5OnJldHVybiBlPWIudHlwZSxkPWIucGVuZGluZ1Byb3BzLmNoaWxkcmVuLFlkKGIsYyksZT1aZChlKSxkPWQoZSksYi5mbGFnc3w9MSxQKGEsYixkLGMpLGIuY2hpbGQ7Y2FzZSAxNDpyZXR1cm4gZD1iLnR5cGUsZT14ZihkLGIucGVuZGluZ1Byb3BzKSxcbmU9eGYoZC50eXBlLGUpLFVmKGEsYixkLGUsYyk7Y2FzZSAxNTpyZXR1cm4gV2YoYSxiLGIudHlwZSxiLnBlbmRpbmdQcm9wcyxjKTtjYXNlIDE3OnJldHVybiBkPWIudHlwZSxlPWIucGVuZGluZ1Byb3BzLGU9Yi5lbGVtZW50VHlwZT09PWQ/ZTp4ZihkLGUpLGNnKGEsYiksYi50YWc9MSxBKGQpPyhhPSEwLHFjKGIpKTphPSExLFlkKGIsYyksQmYoYixkLGUpLERmKGIsZCxlLGMpLGRnKG51bGwsYixkLCEwLGEsYyk7Y2FzZSAxOTpyZXR1cm4gcmcoYSxiLGMpO2Nhc2UgMjI6cmV0dXJuIFlmKGEsYixjKX10aHJvdyBFcnJvcihuKDE1NixiLnRhZykpO307ZnVuY3Rpb24gTWgoYSxiKXtyZXR1cm4gSmMoYSxiKX1cbmZ1bmN0aW9uIGZpKGEsYixjLGQpe3RoaXMudGFnPWE7dGhpcy5rZXk9Yzt0aGlzLnNpYmxpbmc9dGhpcy5jaGlsZD10aGlzLnJldHVybj10aGlzLnN0YXRlTm9kZT10aGlzLnR5cGU9dGhpcy5lbGVtZW50VHlwZT1udWxsO3RoaXMuaW5kZXg9MDt0aGlzLnJlZj1udWxsO3RoaXMucGVuZGluZ1Byb3BzPWI7dGhpcy5kZXBlbmRlbmNpZXM9dGhpcy5tZW1vaXplZFN0YXRlPXRoaXMudXBkYXRlUXVldWU9dGhpcy5tZW1vaXplZFByb3BzPW51bGw7dGhpcy5tb2RlPWQ7dGhpcy5zdWJ0cmVlRmxhZ3M9dGhpcy5mbGFncz0wO3RoaXMuZGVsZXRpb25zPW51bGw7dGhpcy5jaGlsZExhbmVzPXRoaXMubGFuZXM9MDt0aGlzLmFsdGVybmF0ZT1udWxsfWZ1bmN0aW9uIHRkKGEsYixjLGQpe3JldHVybiBuZXcgZmkoYSxiLGMsZCl9ZnVuY3Rpb24gVmYoYSl7YT1hLnByb3RvdHlwZTtyZXR1cm4hKCFhfHwhYS5pc1JlYWN0Q29tcG9uZW50KX1cbmZ1bmN0aW9uIGVpKGEpe2lmKFwiZnVuY3Rpb25cIj09PXR5cGVvZiBhKXJldHVybiBWZihhKT8xOjA7aWYodm9pZCAwIT09YSYmbnVsbCE9PWEpe2E9YS4kJHR5cGVvZjtpZihhPT09bWEpcmV0dXJuIDExO2lmKGE9PT1wYSlyZXR1cm4gMTR9cmV0dXJuIDJ9XG5mdW5jdGlvbiBKZChhLGIpe3ZhciBjPWEuYWx0ZXJuYXRlO251bGw9PT1jPyhjPXRkKGEudGFnLGIsYS5rZXksYS5tb2RlKSxjLmVsZW1lbnRUeXBlPWEuZWxlbWVudFR5cGUsYy50eXBlPWEudHlwZSxjLnN0YXRlTm9kZT1hLnN0YXRlTm9kZSxjLmFsdGVybmF0ZT1hLGEuYWx0ZXJuYXRlPWMpOihjLnBlbmRpbmdQcm9wcz1iLGMudHlwZT1hLnR5cGUsYy5mbGFncz0wLGMuc3VidHJlZUZsYWdzPTAsYy5kZWxldGlvbnM9bnVsbCk7Yy5mbGFncz1hLmZsYWdzJjE0NjgwMDY0O2MuY2hpbGRMYW5lcz1hLmNoaWxkTGFuZXM7Yy5sYW5lcz1hLmxhbmVzO2MuY2hpbGQ9YS5jaGlsZDtjLm1lbW9pemVkUHJvcHM9YS5tZW1vaXplZFByb3BzO2MubWVtb2l6ZWRTdGF0ZT1hLm1lbW9pemVkU3RhdGU7Yy51cGRhdGVRdWV1ZT1hLnVwZGF0ZVF1ZXVlO2I9YS5kZXBlbmRlbmNpZXM7Yy5kZXBlbmRlbmNpZXM9bnVsbD09PWI/bnVsbDp7bGFuZXM6Yi5sYW5lcyxmaXJzdENvbnRleHQ6Yi5maXJzdENvbnRleHR9O1xuYy5zaWJsaW5nPWEuc2libGluZztjLmluZGV4PWEuaW5kZXg7Yy5yZWY9YS5yZWY7cmV0dXJuIGN9XG5mdW5jdGlvbiBMZChhLGIsYyxkLGUsZil7dmFyIGc9MjtkPWE7aWYoXCJmdW5jdGlvblwiPT09dHlwZW9mIGEpVmYoYSkmJihnPTEpO2Vsc2UgaWYoXCJzdHJpbmdcIj09PXR5cGVvZiBhKWc9NTtlbHNlIGE6c3dpdGNoKGEpe2Nhc2UgaGE6cmV0dXJuIE5kKGMuY2hpbGRyZW4sZSxmLGIpO2Nhc2UgaWE6Zz04O2V8PTg7YnJlYWs7Y2FzZSBqYTpyZXR1cm4gYT10ZCgxMixjLGIsZXwyKSxhLmVsZW1lbnRUeXBlPWphLGEubGFuZXM9ZixhO2Nhc2UgbmE6cmV0dXJuIGE9dGQoMTMsYyxiLGUpLGEuZWxlbWVudFR5cGU9bmEsYS5sYW5lcz1mLGE7Y2FzZSBvYTpyZXR1cm4gYT10ZCgxOSxjLGIsZSksYS5lbGVtZW50VHlwZT1vYSxhLmxhbmVzPWYsYTtjYXNlIHJhOnJldHVybiBqZyhjLGUsZixiKTtkZWZhdWx0OmlmKFwib2JqZWN0XCI9PT10eXBlb2YgYSYmbnVsbCE9PWEpc3dpdGNoKGEuJCR0eXBlb2Ype2Nhc2Uga2E6Zz0xMDticmVhayBhO2Nhc2UgbGE6Zz05O2JyZWFrIGE7Y2FzZSBtYTpnPTExO1xuYnJlYWsgYTtjYXNlIHBhOmc9MTQ7YnJlYWsgYTtjYXNlIHFhOmc9MTY7ZD1udWxsO2JyZWFrIGF9dGhyb3cgRXJyb3IobigxMzAsbnVsbD09YT9hOnR5cGVvZiBhLFwiXCIpKTt9Yj10ZChnLGMsYixlKTtiLmVsZW1lbnRUeXBlPWE7Yi50eXBlPWQ7Yi5sYW5lcz1mO3JldHVybiBifWZ1bmN0aW9uIE5kKGEsYixjLGQpe2E9dGQoNyxhLGQsYik7YS5sYW5lcz1jO3JldHVybiBhfWZ1bmN0aW9uIGpnKGEsYixjLGQpe2E9dGQoMjIsYSxkLGIpO2EuZWxlbWVudFR5cGU9cmE7YS5sYW5lcz1jO2Euc3RhdGVOb2RlPXtpc0hpZGRlbjohMX07cmV0dXJuIGF9ZnVuY3Rpb24gS2QoYSxiLGMpe2E9dGQoNixhLG51bGwsYik7YS5sYW5lcz1jO3JldHVybiBhfVxuZnVuY3Rpb24gTWQoYSxiLGMpe2I9dGQoNCxudWxsIT09YS5jaGlsZHJlbj9hLmNoaWxkcmVuOltdLGEua2V5LGIpO2IubGFuZXM9YztiLnN0YXRlTm9kZT17Y29udGFpbmVySW5mbzphLmNvbnRhaW5lckluZm8scGVuZGluZ0NoaWxkcmVuOm51bGwsaW1wbGVtZW50YXRpb246YS5pbXBsZW1lbnRhdGlvbn07cmV0dXJuIGJ9XG5mdW5jdGlvbiBnaShhLGIsYyxkLGUpe3RoaXMudGFnPWI7dGhpcy5jb250YWluZXJJbmZvPWE7dGhpcy5maW5pc2hlZFdvcms9dGhpcy5waW5nQ2FjaGU9dGhpcy5jdXJyZW50PXRoaXMucGVuZGluZ0NoaWxkcmVuPW51bGw7dGhpcy50aW1lb3V0SGFuZGxlPVJhO3RoaXMuY2FsbGJhY2tOb2RlPXRoaXMucGVuZGluZ0NvbnRleHQ9dGhpcy5jb250ZXh0PW51bGw7dGhpcy5jYWxsYmFja1ByaW9yaXR5PTA7dGhpcy5ldmVudFRpbWVzPUVjKDApO3RoaXMuZXhwaXJhdGlvblRpbWVzPUVjKC0xKTt0aGlzLmVudGFuZ2xlZExhbmVzPXRoaXMuZmluaXNoZWRMYW5lcz10aGlzLm11dGFibGVSZWFkTGFuZXM9dGhpcy5leHBpcmVkTGFuZXM9dGhpcy5waW5nZWRMYW5lcz10aGlzLnN1c3BlbmRlZExhbmVzPXRoaXMucGVuZGluZ0xhbmVzPTA7dGhpcy5lbnRhbmdsZW1lbnRzPUVjKDApO3RoaXMuaWRlbnRpZmllclByZWZpeD1kO3RoaXMub25SZWNvdmVyYWJsZUVycm9yPWU7VmEmJih0aGlzLm11dGFibGVTb3VyY2VFYWdlckh5ZHJhdGlvbkRhdGE9XG5udWxsKX1mdW5jdGlvbiBoaShhLGIsYyxkLGUsZixnLGgsayl7YT1uZXcgZ2koYSxiLGMsaCxrKTsxPT09Yj8oYj0xLCEwPT09ZiYmKGJ8PTgpKTpiPTA7Zj10ZCgzLG51bGwsbnVsbCxiKTthLmN1cnJlbnQ9ZjtmLnN0YXRlTm9kZT1hO2YubWVtb2l6ZWRTdGF0ZT17ZWxlbWVudDpkLGlzRGVoeWRyYXRlZDpjLGNhY2hlOm51bGwsdHJhbnNpdGlvbnM6bnVsbCxwZW5kaW5nU3VzcGVuc2VCb3VuZGFyaWVzOm51bGx9O2VlKGYpO3JldHVybiBhfVxuZnVuY3Rpb24gaWkoYSl7aWYoIWEpcmV0dXJuIGpjO2E9YS5fcmVhY3RJbnRlcm5hbHM7YTp7aWYod2EoYSkhPT1hfHwxIT09YS50YWcpdGhyb3cgRXJyb3IobigxNzApKTt2YXIgYj1hO2Rve3N3aXRjaChiLnRhZyl7Y2FzZSAzOmI9Yi5zdGF0ZU5vZGUuY29udGV4dDticmVhayBhO2Nhc2UgMTppZihBKGIudHlwZSkpe2I9Yi5zdGF0ZU5vZGUuX19yZWFjdEludGVybmFsTWVtb2l6ZWRNZXJnZWRDaGlsZENvbnRleHQ7YnJlYWsgYX19Yj1iLnJldHVybn13aGlsZShudWxsIT09Yik7dGhyb3cgRXJyb3IobigxNzEpKTt9aWYoMT09PWEudGFnKXt2YXIgYz1hLnR5cGU7aWYoQShjKSlyZXR1cm4gcGMoYSxjLGIpfXJldHVybiBifVxuZnVuY3Rpb24gamkoYSl7dmFyIGI9YS5fcmVhY3RJbnRlcm5hbHM7aWYodm9pZCAwPT09Yil7aWYoXCJmdW5jdGlvblwiPT09dHlwZW9mIGEucmVuZGVyKXRocm93IEVycm9yKG4oMTg4KSk7YT1PYmplY3Qua2V5cyhhKS5qb2luKFwiLFwiKTt0aHJvdyBFcnJvcihuKDI2OCxhKSk7fWE9QWEoYik7cmV0dXJuIG51bGw9PT1hP251bGw6YS5zdGF0ZU5vZGV9ZnVuY3Rpb24ga2koYSxiKXthPWEubWVtb2l6ZWRTdGF0ZTtpZihudWxsIT09YSYmbnVsbCE9PWEuZGVoeWRyYXRlZCl7dmFyIGM9YS5yZXRyeUxhbmU7YS5yZXRyeUxhbmU9MCE9PWMmJmM8Yj9jOmJ9fWZ1bmN0aW9uIGxpKGEsYil7a2koYSxiKTsoYT1hLmFsdGVybmF0ZSkmJmtpKGEsYil9ZnVuY3Rpb24gbWkoYSl7YT1BYShhKTtyZXR1cm4gbnVsbD09PWE/bnVsbDphLnN0YXRlTm9kZX1mdW5jdGlvbiBuaSgpe3JldHVybiBudWxsfVxuZXhwb3J0cy5hdHRlbXB0Q29udGludW91c0h5ZHJhdGlvbj1mdW5jdGlvbihhKXtpZigxMz09PWEudGFnKXt2YXIgYj1jZShhLDEzNDIxNzcyOCk7aWYobnVsbCE9PWIpe3ZhciBjPU8oKTthZihiLGEsMTM0MjE3NzI4LGMpfWxpKGEsMTM0MjE3NzI4KX19O2V4cG9ydHMuYXR0ZW1wdERpc2NyZXRlSHlkcmF0aW9uPWZ1bmN0aW9uKGEpe2lmKDEzPT09YS50YWcpe3ZhciBiPWNlKGEsMSk7aWYobnVsbCE9PWIpe3ZhciBjPU8oKTthZihiLGEsMSxjKX1saShhLDEpfX07ZXhwb3J0cy5hdHRlbXB0SHlkcmF0aW9uQXRDdXJyZW50UHJpb3JpdHk9ZnVuY3Rpb24oYSl7aWYoMTM9PT1hLnRhZyl7dmFyIGI9dGYoYSksYz1jZShhLGIpO2lmKG51bGwhPT1jKXt2YXIgZD1PKCk7YWYoYyxhLGIsZCl9bGkoYSxiKX19O1xuZXhwb3J0cy5hdHRlbXB0U3luY2hyb25vdXNIeWRyYXRpb249ZnVuY3Rpb24oYSl7c3dpdGNoKGEudGFnKXtjYXNlIDM6dmFyIGI9YS5zdGF0ZU5vZGU7aWYoYi5jdXJyZW50Lm1lbW9pemVkU3RhdGUuaXNEZWh5ZHJhdGVkKXt2YXIgYz15YyhiLnBlbmRpbmdMYW5lcyk7MCE9PWMmJihIYyhiLGN8MSksS2goYixEKCkpLDA9PT0oSCY2KSYmKEJoKCksYWQoKSkpfWJyZWFrO2Nhc2UgMTM6WGgoZnVuY3Rpb24oKXt2YXIgYj1jZShhLDEpO2lmKG51bGwhPT1iKXt2YXIgYz1PKCk7YWYoYixhLDEsYyl9fSksbGkoYSwxKX19O2V4cG9ydHMuYmF0Y2hlZFVwZGF0ZXM9ZnVuY3Rpb24oYSxiKXt2YXIgYz1IO0h8PTE7dHJ5e3JldHVybiBhKGIpfWZpbmFsbHl7SD1jLDA9PT1IJiYoQmgoKSxYYyYmYWQoKSl9fTtleHBvcnRzLmNyZWF0ZUNvbXBvbmVudFNlbGVjdG9yPWZ1bmN0aW9uKGEpe3JldHVybnskJHR5cGVvZjpoaCx2YWx1ZTphfX07XG5leHBvcnRzLmNyZWF0ZUNvbnRhaW5lcj1mdW5jdGlvbihhLGIsYyxkLGUsZixnKXtyZXR1cm4gaGkoYSxiLCExLG51bGwsYyxkLGUsZixnKX07ZXhwb3J0cy5jcmVhdGVIYXNQc2V1ZG9DbGFzc1NlbGVjdG9yPWZ1bmN0aW9uKGEpe3JldHVybnskJHR5cGVvZjppaCx2YWx1ZTphfX07ZXhwb3J0cy5jcmVhdGVIeWRyYXRpb25Db250YWluZXI9ZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyxoLGspe2E9aGkoYyxkLCEwLGEsZSxmLGcsaCxrKTthLmNvbnRleHQ9aWkobnVsbCk7Yz1hLmN1cnJlbnQ7ZD1PKCk7ZT10ZihjKTtmPWdlKGQsZSk7Zi5jYWxsYmFjaz12b2lkIDAhPT1iJiZudWxsIT09Yj9iOm51bGw7aGUoYyxmLGUpO2EuY3VycmVudC5sYW5lcz1lO0ZjKGEsZSxkKTtLaChhLGQpO3JldHVybiBhfTtcbmV4cG9ydHMuY3JlYXRlUG9ydGFsPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD0zPGFyZ3VtZW50cy5sZW5ndGgmJnZvaWQgMCE9PWFyZ3VtZW50c1szXT9hcmd1bWVudHNbM106bnVsbDtyZXR1cm57JCR0eXBlb2Y6ZmEsa2V5Om51bGw9PWQ/bnVsbDpcIlwiK2QsY2hpbGRyZW46YSxjb250YWluZXJJbmZvOmIsaW1wbGVtZW50YXRpb246Y319O2V4cG9ydHMuY3JlYXRlUm9sZVNlbGVjdG9yPWZ1bmN0aW9uKGEpe3JldHVybnskJHR5cGVvZjpqaCx2YWx1ZTphfX07ZXhwb3J0cy5jcmVhdGVUZXN0TmFtZVNlbGVjdG9yPWZ1bmN0aW9uKGEpe3JldHVybnskJHR5cGVvZjpraCx2YWx1ZTphfX07ZXhwb3J0cy5jcmVhdGVUZXh0U2VsZWN0b3I9ZnVuY3Rpb24oYSl7cmV0dXJueyQkdHlwZW9mOmxoLHZhbHVlOmF9fTtcbmV4cG9ydHMuZGVmZXJyZWRVcGRhdGVzPWZ1bmN0aW9uKGEpe3ZhciBiPUMsYz1XLnRyYW5zaXRpb247dHJ5e3JldHVybiBXLnRyYW5zaXRpb249bnVsbCxDPTE2LGEoKX1maW5hbGx5e0M9YixXLnRyYW5zaXRpb249Y319O2V4cG9ydHMuZGlzY3JldGVVcGRhdGVzPWZ1bmN0aW9uKGEsYixjLGQsZSl7dmFyIGY9QyxnPVcudHJhbnNpdGlvbjt0cnl7cmV0dXJuIFcudHJhbnNpdGlvbj1udWxsLEM9MSxhKGIsYyxkLGUpfWZpbmFsbHl7Qz1mLFcudHJhbnNpdGlvbj1nLDA9PT1IJiZCaCgpfX07ZXhwb3J0cy5maW5kQWxsTm9kZXM9cmg7XG5leHBvcnRzLmZpbmRCb3VuZGluZ1JlY3RzPWZ1bmN0aW9uKGEsYil7aWYoIWJiKXRocm93IEVycm9yKG4oMzYzKSk7Yj1yaChhLGIpO2E9W107Zm9yKHZhciBjPTA7YzxiLmxlbmd0aDtjKyspYS5wdXNoKGRiKGJbY10pKTtmb3IoYj1hLmxlbmd0aC0xOzA8YjtiLS0pe2M9YVtiXTtmb3IodmFyIGQ9Yy54LGU9ZCtjLndpZHRoLGY9Yy55LGc9ZitjLmhlaWdodCxoPWItMTswPD1oO2gtLSlpZihiIT09aCl7dmFyIGs9YVtoXSxsPWsueCxtPWwray53aWR0aCxyPWsueSxwPXIray5oZWlnaHQ7aWYoZD49bCYmZj49ciYmZTw9bSYmZzw9cCl7YS5zcGxpY2UoYiwxKTticmVha31lbHNlIGlmKCEoZCE9PWx8fGMud2lkdGghPT1rLndpZHRofHxwPGZ8fHI+Zykpe3I+ZiYmKGsuaGVpZ2h0Kz1yLWYsay55PWYpO3A8ZyYmKGsuaGVpZ2h0PWctcik7YS5zcGxpY2UoYiwxKTticmVha31lbHNlIGlmKCEoZiE9PXJ8fGMuaGVpZ2h0IT09ay5oZWlnaHR8fG08ZHx8bD5lKSl7bD5kJiYoay53aWR0aCs9XG5sLWQsay54PWQpO208ZSYmKGsud2lkdGg9ZS1sKTthLnNwbGljZShiLDEpO2JyZWFrfX19cmV0dXJuIGF9O2V4cG9ydHMuZmluZEhvc3RJbnN0YW5jZT1qaTtleHBvcnRzLmZpbmRIb3N0SW5zdGFuY2VXaXRoTm9Qb3J0YWxzPWZ1bmN0aW9uKGEpe2E9emEoYSk7YT1udWxsIT09YT9DYShhKTpudWxsO3JldHVybiBudWxsPT09YT9udWxsOmEuc3RhdGVOb2RlfTtleHBvcnRzLmZpbmRIb3N0SW5zdGFuY2VXaXRoV2FybmluZz1mdW5jdGlvbihhKXtyZXR1cm4gamkoYSl9O2V4cG9ydHMuZmx1c2hDb250cm9sbGVkPWZ1bmN0aW9uKGEpe3ZhciBiPUg7SHw9MTt2YXIgYz1XLnRyYW5zaXRpb24sZD1DO3RyeXtXLnRyYW5zaXRpb249bnVsbCxDPTEsYSgpfWZpbmFsbHl7Qz1kLFcudHJhbnNpdGlvbj1jLEg9YiwwPT09SCYmKEJoKCksYWQoKSl9fTtleHBvcnRzLmZsdXNoUGFzc2l2ZUVmZmVjdHM9T2g7ZXhwb3J0cy5mbHVzaFN5bmM9WGg7XG5leHBvcnRzLmZvY3VzV2l0aGluPWZ1bmN0aW9uKGEsYil7aWYoIWJiKXRocm93IEVycm9yKG4oMzYzKSk7YT1uaChhKTtiPXFoKGEsYik7Yj1BcnJheS5mcm9tKGIpO2ZvcihhPTA7YTxiLmxlbmd0aDspe3ZhciBjPWJbYSsrXTtpZighZmIoYykpe2lmKDU9PT1jLnRhZyYmaGIoYy5zdGF0ZU5vZGUpKXJldHVybiEwO2ZvcihjPWMuY2hpbGQ7bnVsbCE9PWM7KWIucHVzaChjKSxjPWMuc2libGluZ319cmV0dXJuITF9O2V4cG9ydHMuZ2V0Q3VycmVudFVwZGF0ZVByaW9yaXR5PWZ1bmN0aW9uKCl7cmV0dXJuIEN9O1xuZXhwb3J0cy5nZXRGaW5kQWxsTm9kZXNGYWlsdXJlRGVzY3JpcHRpb249ZnVuY3Rpb24oYSxiKXtpZighYmIpdGhyb3cgRXJyb3IobigzNjMpKTt2YXIgYz0wLGQ9W107YT1bbmgoYSksMF07Zm9yKHZhciBlPTA7ZTxhLmxlbmd0aDspe3ZhciBmPWFbZSsrXSxnPWFbZSsrXSxoPWJbZ107aWYoNSE9PWYudGFnfHwhZmIoZikpaWYob2goZixoKSYmKGQucHVzaChwaChoKSksZysrLGc+YyYmKGM9ZykpLGc8Yi5sZW5ndGgpZm9yKGY9Zi5jaGlsZDtudWxsIT09ZjspYS5wdXNoKGYsZyksZj1mLnNpYmxpbmd9aWYoYzxiLmxlbmd0aCl7Zm9yKGE9W107YzxiLmxlbmd0aDtjKyspYS5wdXNoKHBoKGJbY10pKTtyZXR1cm5cImZpbmRBbGxOb2RlcyB3YXMgYWJsZSB0byBtYXRjaCBwYXJ0IG9mIHRoZSBzZWxlY3RvcjpcXG4gIFwiKyhkLmpvaW4oXCIgPiBcIikrXCJcXG5cXG5ObyBtYXRjaGluZyBjb21wb25lbnQgd2FzIGZvdW5kIGZvcjpcXG4gIFwiKSthLmpvaW4oXCIgPiBcIil9cmV0dXJuIG51bGx9O1xuZXhwb3J0cy5nZXRQdWJsaWNSb290SW5zdGFuY2U9ZnVuY3Rpb24oYSl7YT1hLmN1cnJlbnQ7aWYoIWEuY2hpbGQpcmV0dXJuIG51bGw7c3dpdGNoKGEuY2hpbGQudGFnKXtjYXNlIDU6cmV0dXJuIEVhKGEuY2hpbGQuc3RhdGVOb2RlKTtkZWZhdWx0OnJldHVybiBhLmNoaWxkLnN0YXRlTm9kZX19O1xuZXhwb3J0cy5pbmplY3RJbnRvRGV2VG9vbHM9ZnVuY3Rpb24oYSl7YT17YnVuZGxlVHlwZTphLmJ1bmRsZVR5cGUsdmVyc2lvbjphLnZlcnNpb24scmVuZGVyZXJQYWNrYWdlTmFtZTphLnJlbmRlcmVyUGFja2FnZU5hbWUscmVuZGVyZXJDb25maWc6YS5yZW5kZXJlckNvbmZpZyxvdmVycmlkZUhvb2tTdGF0ZTpudWxsLG92ZXJyaWRlSG9va1N0YXRlRGVsZXRlUGF0aDpudWxsLG92ZXJyaWRlSG9va1N0YXRlUmVuYW1lUGF0aDpudWxsLG92ZXJyaWRlUHJvcHM6bnVsbCxvdmVycmlkZVByb3BzRGVsZXRlUGF0aDpudWxsLG92ZXJyaWRlUHJvcHNSZW5hbWVQYXRoOm51bGwsc2V0RXJyb3JIYW5kbGVyOm51bGwsc2V0U3VzcGVuc2VIYW5kbGVyOm51bGwsc2NoZWR1bGVVcGRhdGU6bnVsbCxjdXJyZW50RGlzcGF0Y2hlclJlZjpkYS5SZWFjdEN1cnJlbnREaXNwYXRjaGVyLGZpbmRIb3N0SW5zdGFuY2VCeUZpYmVyOm1pLGZpbmRGaWJlckJ5SG9zdEluc3RhbmNlOmEuZmluZEZpYmVyQnlIb3N0SW5zdGFuY2V8fFxubmksZmluZEhvc3RJbnN0YW5jZXNGb3JSZWZyZXNoOm51bGwsc2NoZWR1bGVSZWZyZXNoOm51bGwsc2NoZWR1bGVSb290Om51bGwsc2V0UmVmcmVzaEhhbmRsZXI6bnVsbCxnZXRDdXJyZW50RmliZXI6bnVsbCxyZWNvbmNpbGVyVmVyc2lvbjpcIjE4LjMuMVwifTtpZihcInVuZGVmaW5lZFwiPT09dHlwZW9mIF9fUkVBQ1RfREVWVE9PTFNfR0xPQkFMX0hPT0tfXylhPSExO2Vsc2V7dmFyIGI9X19SRUFDVF9ERVZUT09MU19HTE9CQUxfSE9PS19fO2lmKGIuaXNEaXNhYmxlZHx8IWIuc3VwcG9ydHNGaWJlcilhPSEwO2Vsc2V7dHJ5e1JjPWIuaW5qZWN0KGEpLFNjPWJ9Y2F0Y2goYyl7fWE9Yi5jaGVja0RDRT8hMDohMX19cmV0dXJuIGF9O2V4cG9ydHMuaXNBbHJlYWR5UmVuZGVyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuITF9O1xuZXhwb3J0cy5vYnNlcnZlVmlzaWJsZVJlY3RzPWZ1bmN0aW9uKGEsYixjLGQpe2lmKCFiYil0aHJvdyBFcnJvcihuKDM2MykpO2E9cmgoYSxiKTt2YXIgZT1pYihhLGMsZCkuZGlzY29ubmVjdDtyZXR1cm57ZGlzY29ubmVjdDpmdW5jdGlvbigpe2UoKX19fTtleHBvcnRzLnJlZ2lzdGVyTXV0YWJsZVNvdXJjZUZvckh5ZHJhdGlvbj1mdW5jdGlvbihhLGIpe3ZhciBjPWIuX2dldFZlcnNpb247Yz1jKGIuX3NvdXJjZSk7bnVsbD09YS5tdXRhYmxlU291cmNlRWFnZXJIeWRyYXRpb25EYXRhP2EubXV0YWJsZVNvdXJjZUVhZ2VySHlkcmF0aW9uRGF0YT1bYixjXTphLm11dGFibGVTb3VyY2VFYWdlckh5ZHJhdGlvbkRhdGEucHVzaChiLGMpfTtleHBvcnRzLnJ1bldpdGhQcmlvcml0eT1mdW5jdGlvbihhLGIpe3ZhciBjPUM7dHJ5e3JldHVybiBDPWEsYigpfWZpbmFsbHl7Qz1jfX07ZXhwb3J0cy5zaG91bGRFcnJvcj1mdW5jdGlvbigpe3JldHVybiBudWxsfTtcbmV4cG9ydHMuc2hvdWxkU3VzcGVuZD1mdW5jdGlvbigpe3JldHVybiExfTtleHBvcnRzLnVwZGF0ZUNvbnRhaW5lcj1mdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1iLmN1cnJlbnQsZj1PKCksZz10ZihlKTtjPWlpKGMpO251bGw9PT1iLmNvbnRleHQ/Yi5jb250ZXh0PWM6Yi5wZW5kaW5nQ29udGV4dD1jO2I9Z2UoZixnKTtiLnBheWxvYWQ9e2VsZW1lbnQ6YX07ZD12b2lkIDA9PT1kP251bGw6ZDtudWxsIT09ZCYmKGIuY2FsbGJhY2s9ZCk7YT1oZShlLGIsZyk7bnVsbCE9PWEmJihhZihhLGUsZyxmKSxpZShhLGUsZykpO3JldHVybiBnfTtcblxuICAgIHJldHVybiBleHBvcnRzO1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtcmVjb25jaWxlci5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1yZWNvbmNpbGVyLmRldmVsb3BtZW50LmpzJyk7XG59XG4iLCAiLyoqXG4gKiBAbGljZW5zZSBSZWFjdFxuICogcmVhY3QtcmVjb25jaWxlci1jb25zdGFudHMucHJvZHVjdGlvbi5taW4uanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO2V4cG9ydHMuQ29uY3VycmVudFJvb3Q9MTtleHBvcnRzLkNvbnRpbnVvdXNFdmVudFByaW9yaXR5PTQ7ZXhwb3J0cy5EZWZhdWx0RXZlbnRQcmlvcml0eT0xNjtleHBvcnRzLkRpc2NyZXRlRXZlbnRQcmlvcml0eT0xO2V4cG9ydHMuSWRsZUV2ZW50UHJpb3JpdHk9NTM2ODcwOTEyO2V4cG9ydHMuTGVnYWN5Um9vdD0wO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1yZWNvbmNpbGVyLWNvbnN0YW50cy5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1yZWNvbmNpbGVyLWNvbnN0YW50cy5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwgIm1vZHVsZS5leHBvcnRzID0ge307IiwgIlxuaW1wb3J0ICogYXMgX20wIGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgX20xIGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuaW1wb3J0ICogYXMgX20yIGZyb20gXCJyZWFjdC9qc3gtZGV2LXJ1bnRpbWVcIjtcbmltcG9ydCAqIGFzIF9tMyBmcm9tIFwiYmV2eS1yZWFjdFwiO1xuaW1wb3J0ICogYXMgX200IGZyb20gXCJiZXZ5LXJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgKiBhcyBfbTUgZnJvbSBcImJldnktcmVhY3QvanN4LWRldi1ydW50aW1lXCI7XG5nbG9iYWxUaGlzLl9fYmV2eVZlbmRvciA9IHtcbiAgXCJyZWFjdFwiOiBfbTAsXG4gIFwicmVhY3QvanN4LXJ1bnRpbWVcIjogX20xLFxuICBcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiOiBfbTIsXG4gIFwiYmV2eS1yZWFjdFwiOiBfbTMsXG4gIFwiYmV2eS1yZWFjdC9qc3gtcnVudGltZVwiOiBfbTQsXG4gIFwiYmV2eS1yZWFjdC9qc3gtZGV2LXJ1bnRpbWVcIjogX201LFxufTtcbiIsICIvLyBQdWJsaWMgQVBJIG9mIHRoZSBgYmV2eS1yZWFjdGAgbGlicmFyeS5cbi8vXG4vLyBNb3N0IGFwcHMgb25seSBuZWVkIGBtb3VudGA6XG4vL1xuLy8gICBpbXBvcnQgeyBtb3VudCB9IGZyb20gXCJiZXZ5LXJlYWN0XCI7XG4vLyAgIGltcG9ydCB7IEFwcCB9IGZyb20gXCIuL0FwcFwiO1xuLy8gICBtb3VudCg8QXBwIC8+KTtcbi8vXG4vLyBUaGUgbG93ZXItbGV2ZWwgcGllY2VzIGFyZSBleHBvcnRlZCBmb3IgYWR2YW5jZWQvY3VzdG9tIGludGVncmF0aW9ucy5cblxuZXhwb3J0IHsgbW91bnQgfSBmcm9tIFwiLi9tb3VudFwiO1xuZXhwb3J0IHsgcmVuZGVyLCBmbHVzaFN5bmMgfSBmcm9tIFwiLi9yZW5kZXJlclwiO1xuZXhwb3J0IHtcbiAgZW1pdCxcbiAgcmVxdWVzdCxcbiAgYWRkRXZlbnRMaXN0ZW5lcixcbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcixcbiAgcmVzZXQsXG4gIHJ1bkV2ZW50TG9vcCxcbn0gZnJvbSBcIi4vYnJpZGdlXCI7XG5leHBvcnQgdHlwZSB7IE9wLCBTZXJpYWxpemVkUHJvcHMsIFVpRXZlbnQgfSBmcm9tIFwiLi9icmlkZ2VcIjtcblxuLy8gUmVhbmltYXRlZC1zdHlsZSBhbmltYXRpb25zLlxuZXhwb3J0IHtcbiAgQW5pbWF0ZWQsXG4gIEVhc2luZyxcbiAgdXNlU2hhcmVkVmFsdWUsXG4gIHdpdGhUaW1pbmcsXG4gIHdpdGhTcHJpbmcsXG4gIHdpdGhSZXBlYXQsXG4gIHdpdGhTZXF1ZW5jZSxcbiAgd2l0aERlbGF5LFxuICBpbnRlcnBvbGF0ZSxcbiAgaW50ZXJwb2xhdGVDb2xvcixcbiAgY2FuY2VsQW5pbWF0aW9uLFxufSBmcm9tIFwiLi9hbmltYXRlZFwiO1xuZXhwb3J0IHR5cGUge1xuICBTaGFyZWRWYWx1ZSxcbiAgRHJpdmVyLFxuICBCaW5kaW5nLFxuICBBbmltYXRlZFZhbHVlLFxuICBBbmltYXRlZFN0eWxlLFxuICBFYXNpbmdOYW1lLFxufSBmcm9tIFwiLi9hbmltYXRlZFwiO1xuXG4vLyBXb3JsZC1hbmNob3JlZCBvdmVybGF5cyAoYDxBbmNob3JlZC5ub2RlIGVudGl0eT17XHUyMDI2fSBvZmZzZXQ9e1x1MjAyNn0vPmApLlxuZXhwb3J0IHsgQW5jaG9yZWQgfSBmcm9tIFwiLi9hbmNob3JlZFwiO1xuZXhwb3J0IHR5cGUgeyBBbmNob3JQcm9wcywgQW5jaG9yU2NhbGluZywgVmVjMyB9IGZyb20gXCIuL2FuY2hvcmVkXCI7XG5cbi8vIENhbnZhcyBkcmF3aW5nIChgPGNhbnZhcyBkcmF3PXsoY3R4KSA9PiBcdTIwMjZ9Lz5gKS4gYENhbnZhc0NvbnRleHRgIHJlY29yZHMgYW5cbi8vIEhUTUwtY2FudmFzLWxpa2UgZGlzcGxheSBsaXN0IHJhc3Rlcml6ZWQgb24gdGhlIEJldnkgc2lkZS5cbmV4cG9ydCB7IENhbnZhc0NvbnRleHQsIHJlY29yZERyYXdpbmcgfSBmcm9tIFwiLi9jYW52YXNcIjtcbmV4cG9ydCB0eXBlIHsgQ2FudmFzUGFpbnRlciwgRHJhd0NtZCB9IGZyb20gXCIuL2NhbnZhc1wiO1xuIiwgIi8vIEFuIEhUTUwtYDxjYW52YXM+YC1zdHlsZSByZWNvcmRlciBmb3IgdGhlIGJldnktcmVhY3QgYDxjYW52YXM+YCBob3N0IGVsZW1lbnQuXG4vL1xuLy8gYENhbnZhc0NvbnRleHRgIG1pcnJvcnMgYSBzdWJzZXQgb2YgdGhlIERPTSBgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEYCBwYXRoXG4vLyBBUEksIGJ1dCBpbnN0ZWFkIG9mIHBhaW50aW5nIGl0IHJlY29yZHMgYSBkaXNwbGF5IGxpc3Qgb2YgYERyYXdDbWRgcy4gVGhlIGxpc3Rcbi8vIGNyb3NzZXMgdGhlIGJyaWRnZSBhcyB0aGUgYGRyYXdgIHByb3AgYW5kIGlzIHJhc3Rlcml6ZWQgb24gdGhlIEJldnkgc2lkZVxuLy8gKGFudGktYWxpYXNlZCwgdmlhIHRpbnktc2tpYSkgaW50byB0aGUgbm9kZSdzIGBJbWFnZU5vZGVgIHRleHR1cmUuXG4vL1xuLy8gVXNhZ2UgXHUyMDE0IHBhc3MgYSBwYWludGVyIHRvIGA8Y2FudmFzPmAgYW5kIGRyYXcgaW1tZWRpYXRlbHk6XG4vL1xuLy8gICA8Y2FudmFzXG4vLyAgICAgc3R5bGU9e3sgd2lkdGg6IDMwMCwgaGVpZ2h0OiAxNTAgfX1cbi8vICAgICBkcmF3PXsoY3R4KSA9PiB7XG4vLyAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcIiM4OWI0ZmFcIjtcbi8vICAgICAgIGN0eC5saW5lV2lkdGggPSAyO1xuLy8gICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuLy8gICAgICAgY3R4Lm1vdmVUbygwLCAxNTApO1xuLy8gICAgICAgY3R4LmJlemllckN1cnZlVG8oMTAwLCAwLCAyMDAsIDE1MCwgMzAwLCAyMCk7XG4vLyAgICAgICBjdHguc3Ryb2tlKCk7XG4vLyAgICAgfX1cbi8vICAgLz5cblxuLy8gTWlycm9ycyBgcHJvdG9jb2w6OkRyYXdDbWRgIG9uIHRoZSBSdXN0IHNpZGUgKHRhZyA9IFwiY21kXCIpLiBDb29yZGluYXRlcyBhcmUgaW5cbi8vIHRoZSBjYW52YXMncyBvd24gcGl4ZWwgc3BhY2UsIHRvcC1sZWZ0IG9yaWdpbi5cbmV4cG9ydCB0eXBlIERyYXdDbWQgPVxuICB8IHsgY21kOiBcImJlZ2luUGF0aFwiIH1cbiAgfCB7IGNtZDogXCJtb3ZlVG9cIjsgeDogbnVtYmVyOyB5OiBudW1iZXIgfVxuICB8IHsgY21kOiBcImxpbmVUb1wiOyB4OiBudW1iZXI7IHk6IG51bWJlciB9XG4gIHwgeyBjbWQ6IFwicXVhZFRvXCI7IGN4OiBudW1iZXI7IGN5OiBudW1iZXI7IHg6IG51bWJlcjsgeTogbnVtYmVyIH1cbiAgfCB7XG4gICAgICBjbWQ6IFwiYmV6aWVyVG9cIjtcbiAgICAgIGMxeDogbnVtYmVyO1xuICAgICAgYzF5OiBudW1iZXI7XG4gICAgICBjMng6IG51bWJlcjtcbiAgICAgIGMyeTogbnVtYmVyO1xuICAgICAgeDogbnVtYmVyO1xuICAgICAgeTogbnVtYmVyO1xuICAgIH1cbiAgfCB7IGNtZDogXCJhcmNcIjsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHI6IG51bWJlcjsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfVxuICB8IHsgY21kOiBcInJlY3RcIjsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHc6IG51bWJlcjsgaDogbnVtYmVyIH1cbiAgfCB7IGNtZDogXCJjbG9zZVBhdGhcIiB9XG4gIHwgeyBjbWQ6IFwiZmlsbFN0eWxlXCI7IGNvbG9yOiBzdHJpbmcgfVxuICB8IHsgY21kOiBcInN0cm9rZVN0eWxlXCI7IGNvbG9yOiBzdHJpbmcgfVxuICB8IHsgY21kOiBcImxpbmVXaWR0aFwiOyB3OiBudW1iZXIgfVxuICB8IHsgY21kOiBcImZpbGxcIiB9XG4gIHwgeyBjbWQ6IFwic3Ryb2tlXCIgfTtcblxuLyoqIEEgcGFpbnRlciB0aGF0IGRyYXdzIGludG8gYSBmcmVzaGx5LXJlY29yZGVkIGBDYW52YXNDb250ZXh0YC4gKi9cbmV4cG9ydCB0eXBlIENhbnZhc1BhaW50ZXIgPSAoY3R4OiBDYW52YXNDb250ZXh0KSA9PiB2b2lkO1xuXG4vKiogUmVjb3JkcyBjYW52YXMgZHJhd2luZyBjYWxscyBpbnRvIGEgYERyYXdDbWRgIGRpc3BsYXkgbGlzdC4gQ29sb3JzIGFyZSBoZXhcbiAqICBzdHJpbmdzIChgXCIjcmdiXCJgLCBgXCIjcnJnZ2JiXCJgLCBgXCIjcnJnZ2JiYWFcImApLiAqL1xuZXhwb3J0IGNsYXNzIENhbnZhc0NvbnRleHQge1xuICAvKiogVGhlIHJlY29yZGVkIGNvbW1hbmRzLCBpbiBvcmRlci4gUmVhZCBieSBgc2VyaWFsaXplUHJvcHNgOyB5b3Ugbm9ybWFsbHlcbiAgICogIGRvbid0IHRvdWNoIHRoaXMgXHUyMDE0IHVzZSB0aGUgZHJhd2luZyBtZXRob2RzIGluc3RlYWQuICovXG4gIHJlYWRvbmx5IGNvbW1hbmRzOiBEcmF3Q21kW10gPSBbXTtcblxuICAjZmlsbFN0eWxlID0gXCIjMDAwMDAwXCI7XG4gICNzdHJva2VTdHlsZSA9IFwiIzAwMDAwMFwiO1xuICAjbGluZVdpZHRoID0gMTtcblxuICAvKiogQ3VycmVudCBmaWxsIGNvbG9yIChhbnkgQ1NTIGNvbG9yIHN0cmluZzogaGV4LCBuYW1lZCwgYHJnYigpYC9gaHNsKClgL1x1MjAyNikuXG4gICAqICBBc3NpZ25pbmcgcmVjb3JkcyB0aGUgY2hhbmdlLiAqL1xuICBnZXQgZmlsbFN0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI2ZpbGxTdHlsZTtcbiAgfVxuICBzZXQgZmlsbFN0eWxlKGNvbG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLiNmaWxsU3R5bGUgPSBjb2xvcjtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goeyBjbWQ6IFwiZmlsbFN0eWxlXCIsIGNvbG9yIH0pO1xuICB9XG5cbiAgLyoqIEN1cnJlbnQgc3Ryb2tlIGNvbG9yIChhbnkgQ1NTIGNvbG9yIHN0cmluZzogaGV4LCBuYW1lZCwgYHJnYigpYC9gaHNsKClgL1x1MjAyNikuXG4gICAqICBBc3NpZ25pbmcgcmVjb3JkcyB0aGUgY2hhbmdlLiAqL1xuICBnZXQgc3Ryb2tlU3R5bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy4jc3Ryb2tlU3R5bGU7XG4gIH1cbiAgc2V0IHN0cm9rZVN0eWxlKGNvbG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLiNzdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIHRoaXMuY29tbWFuZHMucHVzaCh7IGNtZDogXCJzdHJva2VTdHlsZVwiLCBjb2xvciB9KTtcbiAgfVxuXG4gIC8qKiBDdXJyZW50IHN0cm9rZSB3aWR0aCBpbiBjYW52YXMgcGl4ZWxzLiBBc3NpZ25pbmcgcmVjb3JkcyB0aGUgY2hhbmdlLiAqL1xuICBnZXQgbGluZVdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuI2xpbmVXaWR0aDtcbiAgfVxuICBzZXQgbGluZVdpZHRoKHc6IG51bWJlcikge1xuICAgIHRoaXMuI2xpbmVXaWR0aCA9IHc7XG4gICAgdGhpcy5jb21tYW5kcy5wdXNoKHsgY21kOiBcImxpbmVXaWR0aFwiLCB3IH0pO1xuICB9XG5cbiAgLyoqIFN0YXJ0IGEgZnJlc2ggcGF0aCwgZGlzY2FyZGluZyB0aGUgY3VycmVudCBvbmUuICovXG4gIGJlZ2luUGF0aCgpOiB0aGlzIHtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goeyBjbWQ6IFwiYmVnaW5QYXRoXCIgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogQmVnaW4gYSBuZXcgc3VicGF0aCBhdCBgKHgsIHkpYC4gKi9cbiAgbW92ZVRvKHg6IG51bWJlciwgeTogbnVtYmVyKTogdGhpcyB7XG4gICAgdGhpcy5jb21tYW5kcy5wdXNoKHsgY21kOiBcIm1vdmVUb1wiLCB4LCB5IH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEFkZCBhIHN0cmFpZ2h0IHNlZ21lbnQgdG8gYCh4LCB5KWAuICovXG4gIGxpbmVUbyh4OiBudW1iZXIsIHk6IG51bWJlcik6IHRoaXMge1xuICAgIHRoaXMuY29tbWFuZHMucHVzaCh7IGNtZDogXCJsaW5lVG9cIiwgeCwgeSB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBBZGQgYSBxdWFkcmF0aWMgQlx1MDBFOXppZXIgdG8gYCh4LCB5KWAgd2l0aCBjb250cm9sIHBvaW50IGAoY3gsIGN5KWAuICovXG4gIHF1YWRyYXRpY0N1cnZlVG8oY3g6IG51bWJlciwgY3k6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpOiB0aGlzIHtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goeyBjbWQ6IFwicXVhZFRvXCIsIGN4LCBjeSwgeCwgeSB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBBZGQgYSBjdWJpYyBCXHUwMEU5emllciB0byBgKHgsIHkpYCB3aXRoIGNvbnRyb2xzIGAoYzF4LCBjMXkpYCwgYChjMngsIGMyeSlgLiAqL1xuICBiZXppZXJDdXJ2ZVRvKFxuICAgIGMxeDogbnVtYmVyLFxuICAgIGMxeTogbnVtYmVyLFxuICAgIGMyeDogbnVtYmVyLFxuICAgIGMyeTogbnVtYmVyLFxuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXIsXG4gICk6IHRoaXMge1xuICAgIHRoaXMuY29tbWFuZHMucHVzaCh7IGNtZDogXCJiZXppZXJUb1wiLCBjMXgsIGMxeSwgYzJ4LCBjMnksIHgsIHkgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogQWRkIGEgY2lyY3VsYXIgYXJjIGNlbnRlcmVkIGF0IGAoeCwgeSlgLCBmcm9tIGBzdGFydGAgdG8gYGVuZGAgcmFkaWFucy4gKi9cbiAgYXJjKHg6IG51bWJlciwgeTogbnVtYmVyLCByOiBudW1iZXIsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogdGhpcyB7XG4gICAgdGhpcy5jb21tYW5kcy5wdXNoKHsgY21kOiBcImFyY1wiLCB4LCB5LCByLCBzdGFydCwgZW5kIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEFkZCBhbiBheGlzLWFsaWduZWQgcmVjdGFuZ2xlIHN1YnBhdGguICovXG4gIHJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyKTogdGhpcyB7XG4gICAgdGhpcy5jb21tYW5kcy5wdXNoKHsgY21kOiBcInJlY3RcIiwgeCwgeSwgdywgaCB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBDbG9zZSB0aGUgY3VycmVudCBzdWJwYXRoIGJhY2sgdG8gaXRzIHN0YXJ0LiAqL1xuICBjbG9zZVBhdGgoKTogdGhpcyB7XG4gICAgdGhpcy5jb21tYW5kcy5wdXNoKHsgY21kOiBcImNsb3NlUGF0aFwiIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEZpbGwgdGhlIGN1cnJlbnQgcGF0aCB3aXRoIGBmaWxsU3R5bGVgLiAqL1xuICBmaWxsKCk6IHRoaXMge1xuICAgIHRoaXMuY29tbWFuZHMucHVzaCh7IGNtZDogXCJmaWxsXCIgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKiogU3Ryb2tlIHRoZSBjdXJyZW50IHBhdGggd2l0aCBgc3Ryb2tlU3R5bGVgIGFuZCBgbGluZVdpZHRoYC4gKi9cbiAgc3Ryb2tlKCk6IHRoaXMge1xuICAgIHRoaXMuY29tbWFuZHMucHVzaCh7IGNtZDogXCJzdHJva2VcIiB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKiogUnVuIGEgcGFpbnRlciBhZ2FpbnN0IGEgZnJlc2ggY29udGV4dCBhbmQgcmV0dXJuIGl0cyByZWNvcmRlZCBkaXNwbGF5IGxpc3QuXG4gKiAgVXNlZCBieSB0aGUgcmVuZGVyZXIgdG8gdHVybiBhIGA8Y2FudmFzIGRyYXc9e2ZufT5gIHBhaW50ZXIgaW50byB3aXJlIGRhdGEuICovXG5leHBvcnQgZnVuY3Rpb24gcmVjb3JkRHJhd2luZyhwYWludGVyOiBDYW52YXNQYWludGVyKTogRHJhd0NtZFtdIHtcbiAgY29uc3QgY3R4ID0gbmV3IENhbnZhc0NvbnRleHQoKTtcbiAgcGFpbnRlcihjdHgpO1xuICByZXR1cm4gY3R4LmNvbW1hbmRzO1xufVxuIiwgIi8vIFRoZSBKUyBoYWxmIG9mIHRoZSBSdXN0PC0+SlMgYm91bmRhcnk6IGFuIG9wIGJ1ZmZlciBmbHVzaGVkIHBlciBjb21taXQsIGFcbi8vIHJlZ2lzdHJ5IG9mIGV2ZW50IGhhbmRsZXJzICh3aGljaCBuZXZlciBjcm9zcyBpbnRvIFJ1c3QpLCBhbmQgdGhlIGV2ZW50IGxvb3Bcbi8vIHRoYXQgcHVsbHMgVUkgZXZlbnRzIGJhY2sgZnJvbSBCZXZ5LlxuXG5pbXBvcnQgeyByZWNvcmREcmF3aW5nIH0gZnJvbSBcIi4vY2FudmFzXCI7XG5pbXBvcnQgdHlwZSB7IENhbnZhc1BhaW50ZXIsIERyYXdDbWQgfSBmcm9tIFwiLi9jYW52YXNcIjtcblxuLy8gVGhlIHdob2xlIFJ1c3Q8LT5KUyBvcCBzdXJmYWNlLiBUaGUgc2FtZSBidW5kbGUgcnVucyB1bmRlciB0d28gaG9zdHM6XG4vLyAgIC0gTmF0aXZlOiBhbiBlbWJlZGRlZCBWOCBpc29sYXRlIChkZW5vX2NvcmUpIGV4cG9zZXMgdGhlc2UgdW5kZXIgYERlbm8uY29yZS5vcHNgLlxuLy8gICAtIFdlYjogdGhlIEJldnkgd2FzbSBtb2R1bGUgaW5zdGFsbHMgdGhlIGlkZW50aWNhbCBtZXRob2RzIG9uXG4vLyAgICAgYGdsb2JhbFRoaXMuX19iZXZ5SG9zdGAgKGJhY2tlZCBieSBgI1t3YXNtX2JpbmRnZW5dYCBleHBvcnRzKSBiZWZvcmUgdGhpc1xuLy8gICAgIGJ1bmRsZSBydW5zLlxuLy8gU2FtZSBuYW1lcyBhbmQgc2lnbmF0dXJlcyBib3RoIHdheXMsIHNvIGV2ZXJ5dGhpbmcgYmVsb3cgaXMgaG9zdC1hZ25vc3RpYy5cbmludGVyZmFjZSBCZXZ5SG9zdCB7XG4gIG9wX2ZsdXNoKG9wczogT3BbXSk6IHZvaWQ7XG4gIG9wX2VtaXQobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XG4gIG9wX3JlcXVlc3QoaWQ6IGJpZ2ludCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQ7XG4gIG9wX2FuaW1hdGUoY21kOiBBbmltYXRpb25Db21tYW5kKTogdm9pZDtcbiAgb3BfbmV4dF9ldmVudCgpOiBQcm9taXNlPE91dGJvdW5kIHwgbnVsbD47XG59XG5cbi8vIFJlc29sdmVkIGF0IG1vZHVsZSBsb2FkLiBPbiBuYXRpdmUgYERlbm8uY29yZS5vcHNgIGlzIHJlYWQ7IG9uIHdlYiB0aGUgaW5qZWN0ZWRcbi8vIGhvc3Qgc2hvcnQtY2lyY3VpdHMgdGhlIGA/P2AsIHNvIGBEZW5vYCAodW5kZWZpbmVkIGluIGEgYnJvd3NlcikgaXMgbmV2ZXIgdG91Y2hlZC5cbmRlY2xhcmUgY29uc3QgRGVubzogeyBjb3JlOiB7IG9wczogQmV2eUhvc3QgfSB9O1xuY29uc3Qgb3BzOiBCZXZ5SG9zdCA9XG4gIChnbG9iYWxUaGlzIGFzIHsgX19iZXZ5SG9zdD86IEJldnlIb3N0IH0pLl9fYmV2eUhvc3QgPz8gRGVuby5jb3JlLm9wcztcblxuLy8gTWlycm9ycyBgYmV2eV9yZWFjdF9hbmltYXRpb25zOjpwcm90b2NvbDo6QW5pbWF0aW9uQ29tbWFuZGAgKHRhZyA9IFwia2luZFwiKS5cbmV4cG9ydCB0eXBlIEFuaW1hdGlvbkNvbW1hbmQgPVxuICB8IHsga2luZDogXCJkZWNsYXJlXCI7IGlkOiBudW1iZXI7IGluaXRpYWw6IG51bWJlciB9XG4gIHwgeyBraW5kOiBcInNldFwiOyBpZDogbnVtYmVyOyB2YWx1ZTogbnVtYmVyIH1cbiAgfCB7IGtpbmQ6IFwiYW5pbWF0ZVwiOyBpZDogbnVtYmVyOyBkcml2ZXI6IHVua25vd24gfVxuICB8IHsga2luZDogXCJjYW5jZWxcIjsgaWQ6IG51bWJlciB9XG4gIHwgeyBraW5kOiBcImNsZWFyXCIgfTtcblxuLy8gTWlycm9ycyBgcHJvdG9jb2w6Ok91dGJvdW5kYCBvbiB0aGUgUnVzdCBzaWRlIChpbnRlcm5hbGx5IHRhZ2dlZCB3aXRoIGB0YCkuXG50eXBlIE91dGJvdW5kID1cbiAgfCB7IHQ6IFwidWlFdmVudFwiOyBldmVudDogVWlFdmVudCB9XG4gIHwgeyB0OiBcImV2ZW50XCI7IG5hbWU6IHN0cmluZzsgdmFsdWU6IHVua25vd24gfVxuICB8IHsgdDogXCJyZXNwb25zZVwiOyBpZDogbnVtYmVyOyByZXN1bHQ6IFJlc3BvbnNlUmVzdWx0IH1cbiAgfCB7IHQ6IFwicmVsb2FkXCIgfTtcblxuLy8gTWlycm9ycyBgcHJvdG9jb2w6OlJlc3BvbnNlUmVzdWx0YCAoaW50ZXJuYWxseSB0YWdnZWQgd2l0aCBgc3RhdHVzYCkuXG50eXBlIFJlc3BvbnNlUmVzdWx0ID1cbiAgfCB7IHN0YXR1czogXCJva1wiOyB2YWx1ZTogdW5rbm93biB9XG4gIHwgeyBzdGF0dXM6IFwiZXJyXCI7IG1lc3NhZ2U6IHN0cmluZyB9O1xuXG5leHBvcnQgY29uc3QgUk9PVF9JRCA9IDA7XG5cbi8vIE1pcnJvcnMgYHByb3RvY29sOjpPcGAgb24gdGhlIFJ1c3Qgc2lkZSAodGFnID0gXCJvcFwiKS5cbmV4cG9ydCB0eXBlIE9wID1cbiAgfCB7IG9wOiBcInJlc2V0XCIgfVxuICB8IHsgb3A6IFwiY3JlYXRlXCI7IGlkOiBudW1iZXI7IGtpbmQ6IHN0cmluZzsgcHJvcHM6IFNlcmlhbGl6ZWRQcm9wcyB9XG4gIHwgeyBvcDogXCJjcmVhdGVUZXh0XCI7IGlkOiBudW1iZXI7IHRleHQ6IHN0cmluZyB9XG4gIHwgeyBvcDogXCJjcmVhdGVUZXh0U3BhblwiOyBpZDogbnVtYmVyOyB0ZXh0OiBzdHJpbmcgfVxuICB8IHsgb3A6IFwiYXBwZW5kXCI7IHBhcmVudDogbnVtYmVyOyBjaGlsZDogbnVtYmVyIH1cbiAgfCB7IG9wOiBcImluc2VydFwiOyBwYXJlbnQ6IG51bWJlcjsgY2hpbGQ6IG51bWJlcjsgYmVmb3JlOiBudW1iZXIgfVxuICB8IHsgb3A6IFwicmVtb3ZlXCI7IHBhcmVudDogbnVtYmVyOyBjaGlsZDogbnVtYmVyIH1cbiAgfCB7IG9wOiBcInVwZGF0ZVwiOyBpZDogbnVtYmVyOyBwcm9wczogU2VyaWFsaXplZFByb3BzIH1cbiAgfCB7IG9wOiBcInVwZGF0ZVRleHRcIjsgaWQ6IG51bWJlcjsgdGV4dDogc3RyaW5nIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXplZFByb3BzIHtcbiAgc3R5bGU/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaG92ZXJTdHlsZT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBwcmVzc1N0eWxlPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIC8vIEFuaW1hdGlvbiBiaW5kaW5ncyAoYW4gYEFuaW1hdGVkLm5vZGVgJ3MgYGFuaW1hdGVkU3R5bGVgKSwgb3BhcXVlIGxpa2Ugc3R5bGU7XG4gIC8vIGRlY29kZWQgb24gdGhlIFJ1c3Qgc2lkZSBpbnRvIGBBbmltYXRlZEJpbmRpbmdzYC5cbiAgYW5pbWF0ZWQ/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgLy8gV29ybGQtYW5jaG9yIGJpbmRpbmcgKGFuIGBBbmNob3JlZC5ub2RlYCdzIGVudGl0eSArIG9mZnNldCksIG9wYXF1ZSBsaWtlIHN0eWxlO1xuICAvLyBkZWNvZGVkIG9uIHRoZSBSdXN0IHNpZGUgaW50byBgQW5jaG9yYC5cbiAgYW5jaG9yPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbG9yPzogc3RyaW5nO1xuICBmb250U2l6ZT86IG51bWJlcjtcbiAgb25DbGljaz86IGJvb2xlYW47XG4gIG9uUG9pbnRlckRvd24/OiBib29sZWFuO1xuICBvblBvaW50ZXJNb3ZlPzogYm9vbGVhbjtcbiAgb25Qb2ludGVyVXA/OiBib29sZWFuO1xuICAvLyBgaW1hZ2VgIGVsZW1lbnQgYXR0cmlidXRlc1xuICBzcmM/OiBzdHJpbmc7XG4gIHRpbnQ/OiBzdHJpbmc7XG4gIGZsaXBYPzogYm9vbGVhbjtcbiAgZmxpcFk/OiBib29sZWFuO1xuICAvLyBgXCJhdXRvXCJgL2BcInN0cmV0Y2hcImAsIG9yIGFuIG9wYXF1ZSA5LXNsaWNlL3RpbGVkIHNwZWMgb2JqZWN0LCBkZWNvZGVkIG9uIHRoZVxuICAvLyBSdXN0IHNpZGUgaW50byBgTm9kZUltYWdlTW9kZWAuXG4gIGltYWdlTW9kZT86IHN0cmluZyB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAvLyBgY2FudmFzYCBlbGVtZW50OiB0aGUgcmVjb3JkZWQgdmVjdG9yIGRpc3BsYXkgbGlzdCwgcmFzdGVyaXplZCBvbiB0aGUgQmV2eSBzaWRlLlxuICBkcmF3PzogRHJhd0NtZFtdO1xuICAvLyBgcG9ydGFsYCBlbGVtZW50OiB0aGUgcmVuZGVyLXRhcmdldCBuYW1lIHRvIGRpc3BsYXkuIEFsc28gY2FycmllcyBhXG4gIC8vIGBzdXJmYWNlYCBlbGVtZW50J3MgYG5hbWVgICh0aGUgb2Zmc2NyZWVuIHN1cmZhY2UgaXRzIHN1YnRyZWUgcmVuZGVycyBpbnRvKS5cbiAgdGFyZ2V0Pzogc3RyaW5nO1xuICAvLyBgZWRpdGFibGVUZXh0YCBlbGVtZW50IGF0dHJpYnV0ZXNcbiAgdmFsdWU/OiBzdHJpbmc7XG4gIG1heExlbmd0aD86IG51bWJlcjtcbiAgbXVsdGlsaW5lPzogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFVpRXZlbnQge1xuICBpZDogbnVtYmVyO1xuICBraW5kOiBzdHJpbmc7XG4gIC8vIEN1cnNvciBwb3NpdGlvbiB3aXRoaW4gdGhlIG5vZGUsIG5vcm1hbGl6ZWQgdG8gMC4uMSAodG9wLWxlZnQgb3JpZ2luKS5cbiAgLy8gUHJlc2VudCBvbmx5IGZvciBwb2ludGVyIGV2ZW50czsgYWJzZW50IGZvciBcImNsaWNrXCIuXG4gIHg/OiBudW1iZXI7XG4gIHk/OiBudW1iZXI7XG4gIC8vIEFic29sdXRlIGN1cnNvciBwb3NpdGlvbiBpbiB3aW5kb3cgbG9naWNhbCBwaXhlbHMgKHRvcC1sZWZ0IG9yaWdpbikuXG4gIC8vIFByZXNlbnQgb25seSBmb3IgcG9pbnRlciBldmVudHM7IGFic2VudCBmb3IgXCJjbGlja1wiLlxuICBjbGllbnRYPzogbnVtYmVyO1xuICBjbGllbnRZPzogbnVtYmVyO1xuICAvLyBUaGUgbmV3IHRleHQuIFByZXNlbnQgb25seSBmb3IgYW4gYGVkaXRhYmxlVGV4dGAncyBcImNoYW5nZVwiIGV2ZW50LlxuICB2YWx1ZT86IHN0cmluZztcbn1cblxuLy8gT3BzIGFjY3VtdWxhdGVkIGR1cmluZyB0aGUgY3VycmVudCBjb21taXQsIGZsdXNoZWQgaW4gcmVzZXRBZnRlckNvbW1pdC5cbmNvbnN0IHBlbmRpbmc6IE9wW10gPSBbXTtcblxuLy8gaWQgLT4geyBjbGljazogaGFuZGxlciwgLi4uIH0uIEhhbmRsZXJzIHN0YXkgaGVyZTsgb25seSBhIGJvb2xlYW4gY3Jvc3Nlcy5cbmNvbnN0IGhhbmRsZXJzID0gbmV3IE1hcDxcbiAgbnVtYmVyLFxuICBSZWNvcmQ8c3RyaW5nLCAoLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkPlxuPigpO1xuXG5sZXQgbmV4dElkID0gMTsgLy8gMCBpcyByZXNlcnZlZCBmb3IgdGhlIHJvb3QgY29udGFpbmVyLlxuXG5leHBvcnQgZnVuY3Rpb24gYWxsb2NJZCgpOiBudW1iZXIge1xuICByZXR1cm4gbmV4dElkKys7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwdXNoKG9wOiBPcCk6IHZvaWQge1xuICBwZW5kaW5nLnB1c2gob3ApO1xufVxuXG4vLyBRdWV1ZSBhIHRlYXJkb3duIG9mIHRoZSBwcmV2aW91cyB0cmVlLiBBIGZyZXNoIHJ1bnRpbWUgY2FsbHMgdGhpcyBiZWZvcmUgaXRzXG4vLyBmaXJzdCByZW5kZXIgc28gYSBob3QgcmVsb2FkIHJlcGxhY2VzIChyYXRoZXIgdGhhbiBkdXBsaWNhdGVzKSB0aGUgVUkuIEFsc29cbi8vIGNsZWFycyB0aGUgQmV2eS1zaWRlIHNoYXJlZC12YWx1ZSB0YWJsZSAod2hpY2ggcGVyc2lzdHMgYWNyb3NzIHJlbG9hZHMpIHNvXG4vLyBzdGFsZSBhbmltYXRlZCB2YWx1ZXMgZG9uJ3QgbGluZ2VyLlxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0KCk6IHZvaWQge1xuICBwZW5kaW5nLnB1c2goeyBvcDogXCJyZXNldFwiIH0pO1xuICBvcHMub3BfYW5pbWF0ZSh7IGtpbmQ6IFwiY2xlYXJcIiB9KTtcbn1cblxuLy8gU2VuZCBhbiBhbmltYXRpb24gY29tbWFuZCB0byB0aGUgYW5pbWF0aW9ucyBwbHVnaW4gKGRlY2xhcmUvc2V0L2FuaW1hdGUvXG4vLyBjYW5jZWwvY2xlYXIpLiBTeW5jaHJvbm91cyBhbmQgZmlyZS1hbmQtZm9yZ2V0LCBsaWtlIGBlbWl0YC4gTG93LWxldmVsIFx1MjAxNCBhcHBzXG4vLyB1c2UgdGhlIGB1c2VTaGFyZWRWYWx1ZWAgLyBgd2l0aCpgIGhlbHBlcnMgZnJvbSBgLi9hbmltYXRlZGAuXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZShjbWQ6IEFuaW1hdGlvbkNvbW1hbmQpOiB2b2lkIHtcbiAgb3BzLm9wX2FuaW1hdGUoY21kKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsdXNoKCk6IHZvaWQge1xuICBpZiAocGVuZGluZy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgb3BzLm9wX2ZsdXNoKHBlbmRpbmcuc3BsaWNlKDAsIHBlbmRpbmcubGVuZ3RoKSk7XG59XG5cbi8vIFNlbmQgYSBuYW1lZCBhcHAgbWVzc2FnZSB0byB0aGUgQmV2eSBzaWRlLiBTdXJmYWNlZCB0aGVyZSBhcyBhXG4vLyBgUmVhY3RNZXNzYWdlYCB5b3UgcmVhZCB3aXRoIGBNZXNzYWdlUmVhZGVyPFJlYWN0TWVzc2FnZT5gLlxuLy9cbi8vIFRoaXMgaXMgdGhlIHVudHlwZWQsIGxvdy1sZXZlbCBmb3JtLiBQcmVmZXIgdGhlIHR5cGVkIGBlbWl0YC9gYmV2eWAgZ2VuZXJhdGVkIGZyb21cbi8vIHlvdXIgUnVzdCBgI1tyZWFjdF9tZXNzYWdlXWAgc3RydWN0cyBieSBgQXBwOjpleHBvcnRfcmVhY3RfdHlwZXNjcmlwdGAgXHUyMDE0IGl0IGNoZWNrc1xuLy8gdGhlIG5hbWUgYW5kIHBheWxvYWQgYWdhaW5zdCB0aGUgc2FtZSBzdHJ1Y3RzIEJldnkgZGVzZXJpYWxpemVzIGludG8sIGFuZCBjYWxscyB0aGlzLlxuZXhwb3J0IGZ1bmN0aW9uIGVtaXQobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICBvcHMub3BfZW1pdChuYW1lLCB2YWx1ZSk7XG59XG5cbi8vIC0tLSBSZWFjdCAtPiBCZXZ5IHJlcXVlc3RzIChhd2FpdGFibGUpIC0tLVxuXG4vLyBQZW5kaW5nIHJlcXVlc3QgcHJvbWlzZXMsIGtleWVkIGJ5IGNvcnJlbGF0aW9uIGlkLiBUaGUgaWQgc3RheXMgYSBKUyBudW1iZXIgaGVyZVxuLy8gKGFuZCBhcyBhIE1hcCBrZXkpOyBpdCBjcm9zc2VzIHRoZSBvcCBib3VuZGFyeSBhcyBhIEJpZ0ludCBhbmQgY29tZXMgYmFjayBhcyBhXG4vLyBudW1iZXIgaW4gdGhlIHJlc3BvbnNlLiBTYWZlIHdoaWxlIGlkcyBzdGF5IHVuZGVyIDJeNTMuXG5sZXQgbmV4dFJlcXVlc3RJZCA9IDE7XG5jb25zdCBwZW5kaW5nUmVxdWVzdHMgPSBuZXcgTWFwPFxuICBudW1iZXIsXG4gIHsgcmVzb2x2ZTogKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkOyByZWplY3Q6IChlcnJvcjogdW5rbm93bikgPT4gdm9pZCB9XG4+KCk7XG5cbi8vIFNlbmQgYSBjb3JyZWxhdGVkIHJlcXVlc3QgYW5kIGF3YWl0IGl0cyByZXBseS4gQSBCZXZ5IGAjW3JlYWN0X3JlcXVlc3RdYCBoYW5kbGVyXG4vLyBhbnN3ZXJzIGl0OyB0aGUgcmVzcG9uc2UgcmVzb2x2ZXMgKG9yIHJlamVjdHMpIHRoaXMgcHJvbWlzZS4gVW50eXBlZCBsb3ctbGV2ZWxcbi8vIGZvcm0gXHUyMDE0IHByZWZlciB0aGUgZ2VuZXJhdGVkIGBiZXZ5LipgIHByb3h5IC8gdHlwZWQgYHJlcXVlc3RgLlxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3QobmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dW5rbm93bj4ge1xuICBjb25zdCBpZCA9IG5leHRSZXF1ZXN0SWQrKztcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBwZW5kaW5nUmVxdWVzdHMuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICBvcHMub3BfcmVxdWVzdChCaWdJbnQoaWQpLCBuYW1lLCB2YWx1ZSk7XG4gIH0pO1xufVxuXG4vLyAtLS0gQmV2eSAtPiBSZWFjdCBuYW1lZCBldmVudHMgLS0tXG5cbmNvbnN0IGxpc3RlbmVycyA9IG5ldyBNYXA8c3RyaW5nLCBTZXQ8KHZhbHVlOiB1bmtub3duKSA9PiB2b2lkPj4oKTtcblxuLy8gU3Vic2NyaWJlIHRvIGEgbmFtZWQgQmV2eSBldmVudCAoQmV2eSBzZW5kcyBpdCB2aWEgdGhlIGBSZWFjdEV2ZW50c2AgcGFyYW0pLlxuLy8gVW50eXBlZCBsb3ctbGV2ZWwgZm9ybSBcdTIwMTQgcHJlZmVyIHRoZSBnZW5lcmF0ZWQgYGJldnkub25gLlxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIoXG4gIG5hbWU6IHN0cmluZyxcbiAgY2I6ICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCxcbik6IHZvaWQge1xuICBsZXQgc2V0ID0gbGlzdGVuZXJzLmdldChuYW1lKTtcbiAgaWYgKCFzZXQpIGxpc3RlbmVycy5zZXQobmFtZSwgKHNldCA9IG5ldyBTZXQoKSkpO1xuICBzZXQuYWRkKGNiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gIG5hbWU6IHN0cmluZyxcbiAgY2I6ICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZCxcbik6IHZvaWQge1xuICBsaXN0ZW5lcnMuZ2V0KG5hbWUpPy5kZWxldGUoY2IpO1xufVxuXG4vLyBTcGxpdCBSZWFjdCBwcm9wcyBpbnRvIGEgc2VyaWFsaXphYmxlIHBheWxvYWQgKyByZWdpc3RlcmVkIGV2ZW50IGhhbmRsZXJzLlxuLy8gYGNoaWxkcmVuYCBhbmQgZnVuY3Rpb25zIG5ldmVyIGdvIGFjcm9zcyB0aGUgYm91bmRhcnkuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplUHJvcHMoXG4gIGlkOiBudW1iZXIsXG4gIHByb3BzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFNlcmlhbGl6ZWRQcm9wcyB7XG4gIGNvbnN0IG91dDogU2VyaWFsaXplZFByb3BzID0ge307XG4gIGNvbnN0IGhzOiBSZWNvcmQ8c3RyaW5nLCAoLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkPiA9IHt9O1xuXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHByb3BzKSkge1xuICAgIGlmIChrZXkgPT09IFwiY2hpbGRyZW5cIikgY29udGludWU7XG4gICAgaWYgKGtleSA9PT0gXCJvbkNsaWNrXCIgJiYgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGhzLmNsaWNrID0gdmFsdWUgYXMgKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdm9pZDtcbiAgICAgIG91dC5vbkNsaWNrID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBQb2ludGVyL2RyYWcgaGFuZGxlcnMuIExpa2Ugb25DbGljaywgdGhlIGZ1bmN0aW9uIHN0YXlzIGluIEpTIGFuZCBvbmx5IGFcbiAgICAvLyBib29sZWFuIGNyb3NzZXM7IEJldnkgcmVwb3J0cyBiYWNrIGBwb2ludGVyRG93bmAvYHBvaW50ZXJNb3ZlYC9gcG9pbnRlclVwYFxuICAgIC8vIGV2ZW50cyAod2l0aCBhIG5vcm1hbGl6ZWQgY3Vyc29yIHBvc2l0aW9uKSB0aGUgZXZlbnQgbG9vcCByb3V0ZXMgaGVyZS5cbiAgICBpZiAoa2V5ID09PSBcIm9uUG9pbnRlckRvd25cIiAmJiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgaHMucG9pbnRlckRvd24gPSB2YWx1ZSBhcyAoLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkO1xuICAgICAgb3V0Lm9uUG9pbnRlckRvd24gPSB0cnVlO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChrZXkgPT09IFwib25Qb2ludGVyTW92ZVwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBocy5wb2ludGVyTW92ZSA9IHZhbHVlIGFzICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQ7XG4gICAgICBvdXQub25Qb2ludGVyTW92ZSA9IHRydWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGtleSA9PT0gXCJvblBvaW50ZXJVcFwiICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBocy5wb2ludGVyVXAgPSB2YWx1ZSBhcyAoLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkO1xuICAgICAgb3V0Lm9uUG9pbnRlclVwID0gdHJ1ZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBBbiBgZWRpdGFibGVUZXh0YCdzIGBvbkNoYW5nZWAuIFRoZSBmdW5jdGlvbiBzdGF5cyBpbiBKUzsgQmV2eSByZXBvcnRzIGJhY2tcbiAgICAvLyBhIGBjaGFuZ2VgIGV2ZW50IChjYXJyeWluZyB0aGUgbmV3IHRleHQpIHRoZSBldmVudCBsb29wIHJvdXRlcyBoZXJlLlxuICAgIGlmIChrZXkgPT09IFwib25DaGFuZ2VcIiAmJiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgaHMuY2hhbmdlID0gdmFsdWUgYXMgKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdm9pZDtcbiAgICAgIG91dC5vbkNoYW5nZSA9IHRydWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGtleSA9PT0gXCJzdHlsZVwiICYmIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgLy8gU3R5bGUgaXMgZnVsbHkgb3BhcXVlOiBldmVyeSBDU1MtbGlrZSBrZXkgKGluY2wuIGJhY2tncm91bmRDb2xvciwgYm9yZGVyLFxuICAgICAgLy8gZ3JpZCwgdHJhbnNpdGlvbiB0aW1pbmdzLCBcdTIwMjYpIHJpZGVzIGFjcm9zcyBpbnNpZGUgdGhpcyBvYmplY3QgYW5kIGlzXG4gICAgICAvLyBkZWNvZGVkIFx1MjAxNCB1bml0cyBhbmQgYWxsIFx1MjAxNCBvbiB0aGUgUnVzdCBzaWRlLlxuICAgICAgb3V0LnN0eWxlID0gdmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gSG92ZXIvcHJlc3MgdmFyaWFudCBzdHlsZXMgcmlkZSBhY3Jvc3Mgb3BhcXVlLCBsaWtlIGBzdHlsZWAuIEJldnkgb3ZlcmxheXNcbiAgICAvLyB0aGVtIG9udG8gdGhlIGJhc2Ugc3R5bGUgZnJvbSB0aGUgbm9kZSdzIGludGVyYWN0aW9uIHN0YXRlLlxuICAgIGlmIChrZXkgPT09IFwiaG92ZXJTdHlsZVwiICYmIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgb3V0LmhvdmVyU3R5bGUgPSB2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoa2V5ID09PSBcInByZXNzU3R5bGVcIiAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIG91dC5wcmVzc1N0eWxlID0gdmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gQW4gYEFuaW1hdGVkLm5vZGVgJ3MgYGFuaW1hdGVkU3R5bGVgOiBlYWNoIHByb3BlcnR5IGlzIGJvdW5kIHRvIGEgc2hhcmVkXG4gICAgLy8gdmFsdWUgKG9yIGFuIGludGVycG9sYXRpb24pLiBBIGJhcmUgYFNoYXJlZFZhbHVlYCBiZWNvbWVzIGEgYHNoYXJlZGBcbiAgICAvLyBiaW5kaW5nOyBgaW50ZXJwb2xhdGVgL2BpbnRlcnBvbGF0ZUNvbG9yYCByZXN1bHRzIHBhc3MgdGhyb3VnaCBhcy1pcy5cbiAgICBpZiAoa2V5ID09PSBcImFuaW1hdGVkU3R5bGVcIiAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIG91dC5hbmltYXRlZCA9IHNlcmlhbGl6ZUFuaW1hdGVkU3R5bGUodmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIEFuIGBBbmNob3JlZC5ub2RlYCdzIGBhbmNob3JgIChlbnRpdHkgKyBvcHRpb25hbCBvZmZzZXQpIHJpZGVzIGFjcm9zcyBvcGFxdWU7XG4gICAgLy8gQmV2eSBwcm9qZWN0cyB0aGUgZW50aXR5J3Mgd29ybGQgcG9zaXRpb24gdG8gdGhlIHNjcmVlbiBlYWNoIGZyYW1lLlxuICAgIGlmIChrZXkgPT09IFwiYW5jaG9yXCIgJiYgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBvdXQuYW5jaG9yID0gdmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gQSBgY2FudmFzYCdzIGBkcmF3YDogYSBwYWludGVyIGNhbGxiYWNrIChyZWNvcmRlZCBhZ2FpbnN0IGEgZnJlc2ggY29udGV4dClcbiAgICAvLyBvciBhbiBhbHJlYWR5LWJ1aWx0IGBEcmF3Q21kW11gIGRpc3BsYXkgbGlzdC4gRWl0aGVyIHdheSBpdCBjcm9zc2VzIGFzIGRhdGEuXG4gICAgaWYgKGtleSA9PT0gXCJkcmF3XCIpIHtcbiAgICAgIG91dC5kcmF3ID1cbiAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHJlY29yZERyYXdpbmcodmFsdWUgYXMgQ2FudmFzUGFpbnRlcilcbiAgICAgICAgICA6ICh2YWx1ZSBhcyBEcmF3Q21kW10pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIFRleHQgKyBgaW1hZ2VgICsgYGVkaXRhYmxlVGV4dGAgZWxlbWVudCBhdHRyaWJ1dGVzIHBhc3MgdGhyb3VnaCBieSBuYW1lLlxuICAgIGlmIChrZXkgPT09IFwiY29sb3JcIikgb3V0LmNvbG9yID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgIGVsc2UgaWYgKGtleSA9PT0gXCJmb250U2l6ZVwiKSBvdXQuZm9udFNpemUgPSB2YWx1ZSBhcyBudW1iZXI7XG4gICAgZWxzZSBpZiAoa2V5ID09PSBcInNyY1wiKSBvdXQuc3JjID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgIGVsc2UgaWYgKGtleSA9PT0gXCJ0aW50XCIpIG91dC50aW50ID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgIGVsc2UgaWYgKGtleSA9PT0gXCJmbGlwWFwiKSBvdXQuZmxpcFggPSB2YWx1ZSBhcyBib29sZWFuO1xuICAgIGVsc2UgaWYgKGtleSA9PT0gXCJmbGlwWVwiKSBvdXQuZmxpcFkgPSB2YWx1ZSBhcyBib29sZWFuO1xuICAgIGVsc2UgaWYgKGtleSA9PT0gXCJpbWFnZU1vZGVcIilcbiAgICAgIG91dC5pbWFnZU1vZGUgPSB2YWx1ZSBhcyBzdHJpbmcgfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBlbHNlIGlmIChrZXkgPT09IFwidGFyZ2V0XCIpIG91dC50YXJnZXQgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgLy8gQSBgPHN1cmZhY2U+YCdzIGBuYW1lYCByaWRlcyB0aGUgc2FtZSB3aXJlIGZpZWxkIGFzIGEgYDxwb3J0YWw+YCdzIGB0YXJnZXRgXG4gICAgLy8gKGJvdGggYmluZCB0aGUgZWxlbWVudCB0byBhIG5hbWVkIHJlbmRlciB0YXJnZXQpOyB0aGV5IG5ldmVyIGNvZXhpc3QuXG4gICAgZWxzZSBpZiAoa2V5ID09PSBcIm5hbWVcIikgb3V0LnRhcmdldCA9IHZhbHVlIGFzIHN0cmluZztcbiAgICBlbHNlIGlmIChrZXkgPT09IFwidmFsdWVcIikgb3V0LnZhbHVlID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgIGVsc2UgaWYgKGtleSA9PT0gXCJtYXhMZW5ndGhcIikgb3V0Lm1heExlbmd0aCA9IHZhbHVlIGFzIG51bWJlcjtcbiAgICBlbHNlIGlmIChrZXkgPT09IFwibXVsdGlsaW5lXCIpIG91dC5tdWx0aWxpbmUgPSB2YWx1ZSBhcyBib29sZWFuO1xuICB9XG5cbiAgaWYgKE9iamVjdC5rZXlzKGhzKS5sZW5ndGggPiAwKSBoYW5kbGVycy5zZXQoaWQsIGhzKTtcbiAgZWxzZSBoYW5kbGVycy5kZWxldGUoaWQpO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8vIENvbnZlcnQgYW4gYGFuaW1hdGVkU3R5bGVgIG9iamVjdCBpbnRvIGl0cyB3aXJlIGZvcm0uIEVhY2ggcHJvcGVydHkgdmFsdWUgaXNcbi8vIGVpdGhlciBhIGBTaGFyZWRWYWx1ZWAgKGNhcnJpZXMgYW4gYGlkYCkgXHUyMTkyIGEgYHNoYXJlZGAgYmluZGluZywgb3IgYW4gYWxyZWFkeS1cbi8vIGJ1aWx0IGJpbmRpbmcgZGVzY3JpcHRvciAoY2FycmllcyBhIGB0eXBlYCkgXHUyMTkyIHBhc3NlZCB0aHJvdWdoIHVuY2hhbmdlZC5cbmZ1bmN0aW9uIHNlcmlhbGl6ZUFuaW1hdGVkU3R5bGUoXG4gIHN0eWxlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgY29uc3Qgb3V0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzdHlsZSkpIHtcbiAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikgY29udGludWU7XG4gICAgaWYgKFwidHlwZVwiIGluIHZhbHVlKSB7XG4gICAgICBvdXRba2V5XSA9IHZhbHVlOyAvLyBhbiBpbnRlcnBvbGF0ZSAvIGludGVycG9sYXRlQ29sb3IgYmluZGluZ1xuICAgIH0gZWxzZSBpZiAoXCJpZFwiIGluIHZhbHVlKSB7XG4gICAgICBvdXRba2V5XSA9IHsgdHlwZTogXCJzaGFyZWRcIiwgaWQ6ICh2YWx1ZSBhcyB7IGlkOiBudW1iZXIgfSkuaWQgfTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyb3BIYW5kbGVycyhpZDogbnVtYmVyKTogdm9pZCB7XG4gIGhhbmRsZXJzLmRlbGV0ZShpZCk7XG59XG5cbi8vIFB1bGwgbWVzc2FnZXMgZnJvbSBCZXZ5IGZvcmV2ZXIgYW5kIHJvdXRlIGVhY2ggYnkga2luZDogVUkgZXZlbnRzIHRvIHRoZWlyIFJlYWN0XG4vLyBoYW5kbGVyLCBuYW1lZCBldmVudHMgdG8gbGlzdGVuZXJzLCByZXF1ZXN0IHJlc3BvbnNlcyB0byB0aGUgcGVuZGluZyBwcm9taXNlLlxuLy8gUmV0dXJucyB3aGVuIEJldnkgZHJvcHMgdGhlIHNlbmRlciAob3BfbmV4dF9ldmVudCByZXNvbHZlcyBudWxsKSBvbiBzaHV0ZG93biwgb3Jcbi8vIHdoZW4gdGhlIHJ1bnRpbWUgaXMgYmVpbmcgcmVidWlsdCAoYSByZWxvYWQpLlxuLy9cbi8vIGB3cmFwYCBydW5zIGVhY2ggY2FsbGJhY2sgaW5zaWRlIHRoZSByZWNvbmNpbGVyJ3MgZmx1c2hTeW5jIHNvIGFueSByZXN1bHRpbmdcbi8vIHJlLXJlbmRlciBjb21taXRzIChhbmQgZmx1c2hlcyBpdHMgb3BzKSBzeW5jaHJvbm91c2x5IGJlZm9yZSB3ZSBhd2FpdCBhZ2Fpbi5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FdmVudExvb3AoXG4gIHdyYXA6IChmbjogKCkgPT4gdm9pZCkgPT4gdm9pZCA9IChmbikgPT4gZm4oKSxcbik6IFByb21pc2U8dm9pZD4ge1xuICBmb3IgKDs7KSB7XG4gICAgY29uc3QgbXNnID0gYXdhaXQgb3BzLm9wX25leHRfZXZlbnQoKTtcbiAgICBpZiAobXNnID09IG51bGwpIGJyZWFrOyAvLyBzaHV0ZG93blxuICAgIHN3aXRjaCAobXNnLnQpIHtcbiAgICAgIGNhc2UgXCJyZWxvYWRcIjpcbiAgICAgICAgcmV0dXJuOyAvLyBydW50aW1lIGlzIGJlaW5nIHJlYnVpbHRcbiAgICAgIGNhc2UgXCJ1aUV2ZW50XCI6IHtcbiAgICAgICAgY29uc3QgZm4gPSBoYW5kbGVycy5nZXQobXNnLmV2ZW50LmlkKT8uW21zZy5ldmVudC5raW5kXTtcbiAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgY29uc3QgZXZlbnQgPSBtc2cuZXZlbnQ7XG4gICAgICAgICAgd3JhcCgoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBDbGljayBoYW5kbGVycyBpZ25vcmUgdGhlIGFyZzsgcG9pbnRlciBoYW5kbGVycyByZWFkIHgveTsgYW5cbiAgICAgICAgICAgICAgLy8gYGVkaXRhYmxlVGV4dGAncyBvbkNoYW5nZSByZWNlaXZlcyB0aGUgbmV3IHRleHQgZGlyZWN0bHkuXG4gICAgICAgICAgICAgIGZuKGV2ZW50LmtpbmQgPT09IFwiY2hhbmdlXCIgPyBldmVudC52YWx1ZSA6IGV2ZW50KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltqc10gaGFuZGxlciBlcnJvcjpcIiwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwiZXZlbnRcIjoge1xuICAgICAgICBjb25zdCBzZXQgPSBsaXN0ZW5lcnMuZ2V0KG1zZy5uYW1lKTtcbiAgICAgICAgaWYgKHNldCAmJiBzZXQuc2l6ZSA+IDApIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1zZy52YWx1ZTtcbiAgICAgICAgICB3cmFwKCgpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2Igb2Ygc2V0KSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2IodmFsdWUpO1xuICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIltqc10gbGlzdGVuZXIgZXJyb3I6XCIsIGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIFwicmVzcG9uc2VcIjoge1xuICAgICAgICBjb25zdCBwID0gcGVuZGluZ1JlcXVlc3RzLmdldChtc2cuaWQpO1xuICAgICAgICBpZiAoIXApIGJyZWFrOyAvLyBzdGFsZS9kdXBsaWNhdGUgXHUyMDE0IHNhZmUgbm8tb3BcbiAgICAgICAgcGVuZGluZ1JlcXVlc3RzLmRlbGV0ZShtc2cuaWQpO1xuICAgICAgICBpZiAobXNnLnJlc3VsdC5zdGF0dXMgPT09IFwib2tcIikgcC5yZXNvbHZlKG1zZy5yZXN1bHQudmFsdWUpO1xuICAgICAgICBlbHNlIHAucmVqZWN0KG5ldyBFcnJvcihtc2cucmVzdWx0Lm1lc3NhZ2UpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCAiLy8gVGhlIGN1c3RvbSBSZWFjdCByZW5kZXJlciAoXCJyZWFjdCBiYWNrZW5kXCIpOiBhIHJlYWN0LXJlY29uY2lsZXIgSG9zdENvbmZpZ1xuLy8gd2hvc2UgaG9zdCBvcGVyYXRpb25zIHJlY29yZCBvcHMgaW50byB0aGUgYnJpZGdlIGJ1ZmZlciBpbnN0ZWFkIG9mIHRvdWNoaW5nIGFcbi8vIERPTS4gTW91bnRlZCBhcyBhIGNvbmN1cnJlbnQgcm9vdDsgZXZlbnQgZGlzcGF0Y2ggd3JhcHMgaGFuZGxlcnMgaW4gYGZsdXNoU3luY2Bcbi8vIHNvIGEgaGFuZGxlcidzIHNldFN0YXRlIGNvbW1pdHMgKGFuZCBmbHVzaGVzIGl0cyBvcHMpIGJlZm9yZSB0aGUgbmV4dCBldmVudC5cbi8vIEEgbGVnYWN5IHJvb3Qgd291bGQgcmUtZW50ZXIgdGhlIHJlY29uY2lsZXIncyBzeW5jLWNhbGxiYWNrIHBhdGggb24gYXN5bmNcbi8vIGBzZXRTdGF0ZWAgKGUuZy4gYSByZXF1ZXN0IGNvbnRpbnVhdGlvbikgYW5kIHRocm93IFJlYWN0ICMzMjcuXG5cbmltcG9ydCB0eXBlIHsgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVjb25jaWxlciBmcm9tIFwicmVhY3QtcmVjb25jaWxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdEV2ZW50UHJpb3JpdHkgfSBmcm9tIFwicmVhY3QtcmVjb25jaWxlci9jb25zdGFudHNcIjtcbmltcG9ydCB7XG4gIGFsbG9jSWQsXG4gIGRyb3BIYW5kbGVycyxcbiAgZmx1c2gsXG4gIHB1c2gsXG4gIFJPT1RfSUQsXG4gIHNlcmlhbGl6ZVByb3BzLFxufSBmcm9tIFwiLi9icmlkZ2VcIjtcbmltcG9ydCB7IHNldHVwUmVmcmVzaFJ1bnRpbWUgfSBmcm9tIFwiLi9obXJcIjtcblxuLy8gYHByb2Nlc3MuZW52Lk5PREVfRU5WYCBpcyByZXBsYWNlZCBhdCBidWlsZCB0aW1lIGJ5IGVzYnVpbGQncyBgZGVmaW5lYDsgdGhlXG4vLyBkZWNsYXJhdGlvbiBpcyB0eXBlLW9ubHkgKGVyYXNlZCkgYW5kIGtlZXBzIHRzYyBoYXBweSB3aXRob3V0IEB0eXBlcy9ub2RlLlxuZGVjbGFyZSBjb25zdCBwcm9jZXNzOiB7IGVudjogeyBOT0RFX0VOVj86IHN0cmluZyB9IH07XG5jb25zdCBERVYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCI7XG5cbi8vIEluc3RhbGwgdGhlIHJlYWN0LXJlZnJlc2ggcnVudGltZSBCRUZPUkUgdGhlIHJlY29uY2lsZXIgaXMgY3JlYXRlZCwgc28gdGhlXG4vLyByZWNvbmNpbGVyJ3MgYGluamVjdEludG9EZXZUb29sc2AgKGJlbG93KSByZWdpc3RlcnMgYWdhaW5zdCBhIGdsb2JhbCBob29rIHRoZVxuLy8gcmVmcmVzaCBydW50aW1lIGhhcyBhbHJlYWR5IHBhdGNoZWQuIE5vLW9wIGluIHByb2R1Y3Rpb24gYnVpbGRzLlxuaWYgKERFVikgc2V0dXBSZWZyZXNoUnVudGltZSgpO1xuXG5pbnRlcmZhY2UgSW5zdGFuY2Uge1xuICBpZDogbnVtYmVyO1xuICB0eXBlOiBzdHJpbmc7XG59XG5pbnRlcmZhY2UgVGV4dEluc3RhbmNlIHtcbiAgaWQ6IG51bWJlcjtcbn1cbmludGVyZmFjZSBDb250YWluZXIge1xuICBpZDogbnVtYmVyO1xufVxuaW50ZXJmYWNlIEhvc3RDb250ZXh0IHtcbiAgaW5UZXh0OiBib29sZWFuO1xufVxuXG4vLyBNb3N0IGhvc3QtY29uZmlnIGNhbGxiYWNrcyBhcmUgaW50ZW50aW9uYWxseSB0cml2aWFsIGZvciBhIFVJLW9ubHkgcmVuZGVyZXIuXG4vLyBUT0RPKHJldmlldyk6IGBob3N0Q29uZmlnOiBhbnlgIGRyb3BzIHR5cGUtY2hlY2tpbmcgb24gdGhlIG1vc3QgcHJvdG9jb2wtY3JpdGljYWxcbi8vIG9iamVjdC4gVHlwZSBpdCBhcyByZWFjdC1yZWNvbmNpbGVyJ3MgYEhvc3RDb25maWc8Li4uPmAgc28gc2lnbmF0dXJlIGRyaWZ0IGlzIGNhdWdodC5cbmNvbnN0IGhvc3RDb25maWc6IGFueSA9IHtcbiAgc3VwcG9ydHNNdXRhdGlvbjogdHJ1ZSxcbiAgc3VwcG9ydHNQZXJzaXN0ZW5jZTogZmFsc2UsXG4gIHN1cHBvcnRzSHlkcmF0aW9uOiBmYWxzZSxcbiAgaXNQcmltYXJ5UmVuZGVyZXI6IHRydWUsXG4gIG5vVGltZW91dDogLTEsXG4gIHNjaGVkdWxlVGltZW91dDogKGZuOiAoLi4uYTogdW5rbm93bltdKSA9PiB2b2lkLCBkZWxheT86IG51bWJlcikgPT5cbiAgICBzZXRUaW1lb3V0KGZuLCBkZWxheSksXG4gIGNhbmNlbFRpbWVvdXQ6IChoYW5kbGU6IG51bWJlcikgPT4gY2xlYXJUaW1lb3V0KGhhbmRsZSksXG5cbiAgLy8gVHJhY2sgd2hldGhlciB3ZSdyZSBpbnNpZGUgYSBgPHRleHQ+YCwgc28gbmVzdGVkIGA8dGV4dD5gIGJlY29tZXMgYSBzcGFuIGFuZFxuICAvLyBiYXJlIHN0cmluZ3MgaW5zaWRlIGJlY29tZSBpbmhlcml0aW5nIGBUZXh0U3BhbmAgcnVucyAoQmV2eSdzIHRleHQgbW9kZWwpLlxuICBnZXRSb290SG9zdENvbnRleHQ6ICgpOiBIb3N0Q29udGV4dCA9PiAoeyBpblRleHQ6IGZhbHNlIH0pLFxuICBnZXRDaGlsZEhvc3RDb250ZXh0OiAocGFyZW50OiBIb3N0Q29udGV4dCwgdHlwZTogc3RyaW5nKTogSG9zdENvbnRleHQgPT4gKHtcbiAgICBpblRleHQ6IHBhcmVudC5pblRleHQgfHwgdHlwZSA9PT0gXCJ0ZXh0XCIsXG4gIH0pLFxuICBnZXRQdWJsaWNJbnN0YW5jZTogKGluc3RhbmNlOiBJbnN0YW5jZSkgPT4gaW5zdGFuY2UsXG4gIHByZXBhcmVGb3JDb21taXQ6ICgpID0+IG51bGwsXG4gIHJlc2V0QWZ0ZXJDb21taXQ6ICgpID0+IGZsdXNoKCksXG4gIHByZXBhcmVQb3J0YWxNb3VudDogKCkgPT4ge30sXG4gIGdldEN1cnJlbnRFdmVudFByaW9yaXR5OiAoKSA9PiBEZWZhdWx0RXZlbnRQcmlvcml0eSxcblxuICAvLyBUZXh0IGFsd2F5cyBiZWNvbWVzIGEgc2VwYXJhdGUgdGV4dCBub2RlLCBuZXZlciBpbmxpbmVkIGludG8gYSBob3N0IG5vZGUuXG4gIHNob3VsZFNldFRleHRDb250ZW50OiAoKSA9PiBmYWxzZSxcblxuICBjcmVhdGVJbnN0YW5jZShcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgcHJvcHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICAgIF9yb290OiBDb250YWluZXIsXG4gICAgaG9zdENvbnRleHQ6IEhvc3RDb250ZXh0LFxuICApOiBJbnN0YW5jZSB7XG4gICAgY29uc3QgaWQgPSBhbGxvY0lkKCk7XG4gICAgLy8gQSBuZXN0ZWQgYDx0ZXh0PmAgaXMgYSBzdHlsZWQgc3BhbjsgYSB0b3AtbGV2ZWwgb25lIGlzIGEgdGV4dCBibG9jayByb290LlxuICAgIGNvbnN0IGtpbmQgPSB0eXBlID09PSBcInRleHRcIiAmJiBob3N0Q29udGV4dC5pblRleHQgPyBcInRleHRTcGFuXCIgOiB0eXBlO1xuICAgIHB1c2goeyBvcDogXCJjcmVhdGVcIiwgaWQsIGtpbmQsIHByb3BzOiBzZXJpYWxpemVQcm9wcyhpZCwgcHJvcHMpIH0pO1xuICAgIHJldHVybiB7IGlkLCB0eXBlIH07XG4gIH0sXG5cbiAgY3JlYXRlVGV4dEluc3RhbmNlKFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICBfcm9vdDogQ29udGFpbmVyLFxuICAgIGhvc3RDb250ZXh0OiBIb3N0Q29udGV4dCxcbiAgKTogVGV4dEluc3RhbmNlIHtcbiAgICBjb25zdCBpZCA9IGFsbG9jSWQoKTtcbiAgICAvLyBBIGJhcmUgc3RyaW5nIGluc2lkZSBhIGA8dGV4dD5gIGlzIGFuIGluaGVyaXRpbmcgcnVuOyBlbHNld2hlcmUgaXQncyBhXG4gICAgLy8gc3RhbmRhbG9uZSAoZGVmYXVsdC1zdHlsZWQpIHRleHQgbm9kZS5cbiAgICBwdXNoKFxuICAgICAgaG9zdENvbnRleHQuaW5UZXh0XG4gICAgICAgID8geyBvcDogXCJjcmVhdGVUZXh0U3BhblwiLCBpZCwgdGV4dCB9XG4gICAgICAgIDogeyBvcDogXCJjcmVhdGVUZXh0XCIsIGlkLCB0ZXh0IH0sXG4gICAgKTtcbiAgICByZXR1cm4geyBpZCB9O1xuICB9LFxuXG4gIGFwcGVuZEluaXRpYWxDaGlsZChwYXJlbnQ6IEluc3RhbmNlLCBjaGlsZDogSW5zdGFuY2UgfCBUZXh0SW5zdGFuY2UpIHtcbiAgICBwdXNoKHsgb3A6IFwiYXBwZW5kXCIsIHBhcmVudDogcGFyZW50LmlkLCBjaGlsZDogY2hpbGQuaWQgfSk7XG4gIH0sXG4gIGZpbmFsaXplSW5pdGlhbENoaWxkcmVuOiAoKSA9PiBmYWxzZSxcblxuICBhcHBlbmRDaGlsZChwYXJlbnQ6IEluc3RhbmNlLCBjaGlsZDogSW5zdGFuY2UgfCBUZXh0SW5zdGFuY2UpIHtcbiAgICBwdXNoKHsgb3A6IFwiYXBwZW5kXCIsIHBhcmVudDogcGFyZW50LmlkLCBjaGlsZDogY2hpbGQuaWQgfSk7XG4gIH0sXG4gIGFwcGVuZENoaWxkVG9Db250YWluZXIoXG4gICAgX2NvbnRhaW5lcjogQ29udGFpbmVyLFxuICAgIGNoaWxkOiBJbnN0YW5jZSB8IFRleHRJbnN0YW5jZSxcbiAgKSB7XG4gICAgcHVzaCh7IG9wOiBcImFwcGVuZFwiLCBwYXJlbnQ6IFJPT1RfSUQsIGNoaWxkOiBjaGlsZC5pZCB9KTtcbiAgfSxcblxuICBpbnNlcnRCZWZvcmUoXG4gICAgcGFyZW50OiBJbnN0YW5jZSxcbiAgICBjaGlsZDogSW5zdGFuY2UgfCBUZXh0SW5zdGFuY2UsXG4gICAgYmVmb3JlOiBJbnN0YW5jZSB8IFRleHRJbnN0YW5jZSxcbiAgKSB7XG4gICAgcHVzaCh7XG4gICAgICBvcDogXCJpbnNlcnRcIixcbiAgICAgIHBhcmVudDogcGFyZW50LmlkLFxuICAgICAgY2hpbGQ6IGNoaWxkLmlkLFxuICAgICAgYmVmb3JlOiBiZWZvcmUuaWQsXG4gICAgfSk7XG4gIH0sXG4gIGluc2VydEluQ29udGFpbmVyQmVmb3JlKFxuICAgIF9jb250YWluZXI6IENvbnRhaW5lcixcbiAgICBjaGlsZDogSW5zdGFuY2UgfCBUZXh0SW5zdGFuY2UsXG4gICAgYmVmb3JlOiBJbnN0YW5jZSB8IFRleHRJbnN0YW5jZSxcbiAgKSB7XG4gICAgcHVzaCh7IG9wOiBcImluc2VydFwiLCBwYXJlbnQ6IFJPT1RfSUQsIGNoaWxkOiBjaGlsZC5pZCwgYmVmb3JlOiBiZWZvcmUuaWQgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlQ2hpbGQocGFyZW50OiBJbnN0YW5jZSwgY2hpbGQ6IEluc3RhbmNlIHwgVGV4dEluc3RhbmNlKSB7XG4gICAgcHVzaCh7IG9wOiBcInJlbW92ZVwiLCBwYXJlbnQ6IHBhcmVudC5pZCwgY2hpbGQ6IGNoaWxkLmlkIH0pO1xuICAgIGRyb3BIYW5kbGVycyhjaGlsZC5pZCk7XG4gIH0sXG4gIHJlbW92ZUNoaWxkRnJvbUNvbnRhaW5lcihcbiAgICBfY29udGFpbmVyOiBDb250YWluZXIsXG4gICAgY2hpbGQ6IEluc3RhbmNlIHwgVGV4dEluc3RhbmNlLFxuICApIHtcbiAgICBwdXNoKHsgb3A6IFwicmVtb3ZlXCIsIHBhcmVudDogUk9PVF9JRCwgY2hpbGQ6IGNoaWxkLmlkIH0pO1xuICAgIGRyb3BIYW5kbGVycyhjaGlsZC5pZCk7XG4gIH0sXG5cbiAgLy8gV2UgcmV0dXJuIHRoZSBuZXcgcHJvcHMgYXMgdGhlIHBheWxvYWQgc28gY29tbWl0VXBkYXRlIGFsd2F5cyBydW5zLlxuICAvLyBUT0RPKHJldmlldyk6IG5vIHByb3AgZGlmZmluZyBcdTIwMTQgYHByZXBhcmVVcGRhdGVgIGFsd2F5cyByZXR1cm5zIGBuZXh0YCwgc28gZXZlcnlcbiAgLy8gdXBkYXRlIHJlLXNlcmlhbGl6ZXMgYW5kIHJlLWFwcGxpZXMgdGhlIEZVTEwgcHJvcCBzZXQgKGFuZCB0aGUgQmV2eSBzaWRlIHJlLWluc2VydHNcbiAgLy8gYE5vZGVgLCBmb3JjaW5nIHJlbGF5b3V0IFx1MjAxNCBzZWUgdWlfbWFwOjphcHBseV9zdHlsZSkuIERpZmYgb2xkIHZzIG5leHQgaGVyZSAob3IgY2FycnkgYVxuICAvLyBjaGFuZ2VkLWtleXMgc2V0KSBzbyBhIG9uZS1maWVsZCBjaGFuZ2UgZG9lc24ndCByZS1hcHBseSBldmVyeXRoaW5nLlxuICBwcmVwYXJlVXBkYXRlOiAoX2k6IEluc3RhbmNlLCBfdDogc3RyaW5nLCBfb2xkOiB1bmtub3duLCBuZXh0OiB1bmtub3duKSA9PlxuICAgIG5leHQsXG5cbiAgY29tbWl0VXBkYXRlKFxuICAgIGluc3RhbmNlOiBJbnN0YW5jZSxcbiAgICBfcGF5bG9hZDogdW5rbm93bixcbiAgICBfdHlwZTogc3RyaW5nLFxuICAgIF9vbGRQcm9wczogdW5rbm93bixcbiAgICBuZXdQcm9wczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gICkge1xuICAgIHB1c2goe1xuICAgICAgb3A6IFwidXBkYXRlXCIsXG4gICAgICBpZDogaW5zdGFuY2UuaWQsXG4gICAgICBwcm9wczogc2VyaWFsaXplUHJvcHMoaW5zdGFuY2UuaWQsIG5ld1Byb3BzKSxcbiAgICB9KTtcbiAgfSxcblxuICBjb21taXRUZXh0VXBkYXRlKHRleHRJbnN0YW5jZTogVGV4dEluc3RhbmNlLCBfb2xkOiBzdHJpbmcsIG5leHQ6IHN0cmluZykge1xuICAgIHB1c2goeyBvcDogXCJ1cGRhdGVUZXh0XCIsIGlkOiB0ZXh0SW5zdGFuY2UuaWQsIHRleHQ6IG5leHQgfSk7XG4gIH0sXG5cbiAgY2xlYXJDb250YWluZXI6ICgpID0+IHt9LFxuICBkZXRhY2hEZWxldGVkSW5zdGFuY2U6IChpbnN0YW5jZTogSW5zdGFuY2UpID0+IGRyb3BIYW5kbGVycyhpbnN0YW5jZS5pZCksXG5cbiAgLy8gTm8tb3Agc2NvcGUvYmx1ciBob29rcyB0aGUgcmVjb25jaWxlciBzdGlsbCBleHBlY3RzLlxuICBnZXRJbnN0YW5jZUZyb21Ob2RlOiAoKSA9PiBudWxsLFxuICBiZWZvcmVBY3RpdmVJbnN0YW5jZUJsdXI6ICgpID0+IHt9LFxuICBhZnRlckFjdGl2ZUluc3RhbmNlQmx1cjogKCkgPT4ge30sXG4gIHByZXBhcmVTY29wZVVwZGF0ZTogKCkgPT4ge30sXG4gIGdldEluc3RhbmNlRnJvbVNjb3BlOiAoKSA9PiBudWxsLFxufTtcblxuY29uc3QgcmVjb25jaWxlciA9IFJlY29uY2lsZXIoaG9zdENvbmZpZyk7XG5cbi8vIFJlZ2lzdGVyIHRoZSByZWNvbmNpbGVyIHdpdGggdGhlIGRldnRvb2xzIGdsb2JhbCBob29rLiBUaGlzIGlzIHdoYXQgZ2l2ZXMgdGhlXG4vLyByZWFjdC1yZWZyZXNoIHJ1bnRpbWUgYSBgc2NoZWR1bGVSZWZyZXNoYCBoYW5kbGVyIGZvciBvdXIgcmVuZGVyZXI7IHdpdGhvdXRcbi8vIGl0IGBwZXJmb3JtUmVhY3RSZWZyZXNoKClgIGlzIGEgc2lsZW50IG5vLW9wLiBUaGUgcmV0dXJuIHZhbHVlIGlzIGBmYWxzZWBcbi8vIChubyByZWFsIERldlRvb2xzIGJhY2tlbmQpIFx1MjAxNCBvbmx5IHRoZSBzaWRlIGVmZmVjdCBtYXR0ZXJzLiBEZXYgb25seS5cbmlmIChERVYpIHtcbiAgcmVjb25jaWxlci5pbmplY3RJbnRvRGV2VG9vbHMoe1xuICAgIGJ1bmRsZVR5cGU6IDEsXG4gICAgdmVyc2lvbjogXCIxOC4zLjFcIixcbiAgICByZW5kZXJlclBhY2thZ2VOYW1lOiBcImJldnktcmVhY3RcIixcbiAgICBmaW5kRmliZXJCeUhvc3RJbnN0YW5jZTogKCkgPT4gbnVsbCxcbiAgfSk7XG59XG5cbi8qKiBSdW4gYGZuYCBhbmQgc3luY2hyb25vdXNseSBjb21taXQgYW55IHN0YXRlIHVwZGF0ZXMgaXQgdHJpZ2dlcnMuICovXG5leHBvcnQgZnVuY3Rpb24gZmx1c2hTeW5jKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gIHJlY29uY2lsZXIuZmx1c2hTeW5jKGZuKTtcbn1cblxuY29uc3QgQ29uY3VycmVudFJvb3QgPSAxO1xuXG4vLyBUaGUgcGVyc2lzdGVudCBSZWFjdCByb290LiBDcmVhdGVkIG9uY2Ugb24gdGhlIGZpcnN0IG1vdW50IGFuZCByZXVzZWQgZm9yIHRoZVxuLy8gaXNvbGF0ZSdzIGxpZmV0aW1lIHNvIGEgaG90IHVwZGF0ZSByZS1yZW5kZXJzIHRoZSBleGlzdGluZyBmaWJlciB0cmVlIChob29rXG4vLyBzdGF0ZSBpbnRhY3QpIGluc3RlYWQgb2YgcmVtb3VudGluZy5cbmxldCByb290OiBSZXR1cm5UeXBlPHR5cGVvZiByZWNvbmNpbGVyLmNyZWF0ZUNvbnRhaW5lcj4gfCBudWxsID0gbnVsbDtcblxuLyoqIE1vdW50IGEgUmVhY3QgZWxlbWVudCB0cmVlIGFnYWluc3QgdGhlIEJldnkgcm9vdCBjb250YWluZXIgKGZpcnN0IGxvYWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihlbGVtZW50OiBSZWFjdE5vZGUpOiB2b2lkIHtcbiAgaWYgKHJvb3QgPT09IG51bGwpIHtcbiAgICAvLyBUT0RPKHJldmlldyk6IHdlIG1vdW50IGEgQ29uY3VycmVudFJvb3QgYnV0IGRyaXZlIGV2ZXJ5IGV2ZW50IHRocm91Z2hcbiAgICAvLyBgZmx1c2hTeW5jYCAoc2VlIGJyaWRnZS5ydW5FdmVudExvb3ApLCBzbyBSZWFjdCBydW5zIGVmZmVjdGl2ZWx5IHN5bmNocm9ub3VzbHkgXHUyMDE0XG4gICAgLy8gY29uY3VycmVudCBmZWF0dXJlcyAoU3VzcGVuc2UsIHRyYW5zaXRpb25zLCB0aW1lLXNsaWNpbmcpIGFyZSB1bmF2YWlsYWJsZS4gRWl0aGVyXG4gICAgLy8gY29tbWl0IHRvIHN5bmMgKGEgbGVnYWN5IHJvb3QgKyB0aGUgZG9jdW1lbnRlZCAjMzI3IHdvcmthcm91bmQpIG9yIGFjdHVhbGx5IHVzZVxuICAgIC8vIGNvbmN1cnJlbmN5OyB0aGUgY3VycmVudCBtaWRkbGUgZ3JvdW5kIHBheXMgZm9yIGEgZmVhdHVyZSBpdCBkb2Vzbid0IHVzZS5cbiAgICBjb25zdCBjb250YWluZXI6IENvbnRhaW5lciA9IHsgaWQ6IFJPT1RfSUQgfTtcbiAgICByb290ID0gcmVjb25jaWxlci5jcmVhdGVDb250YWluZXIoXG4gICAgICBjb250YWluZXIsXG4gICAgICBDb25jdXJyZW50Um9vdCxcbiAgICAgIG51bGwsIC8vIGh5ZHJhdGlvbkNhbGxiYWNrc1xuICAgICAgZmFsc2UsIC8vIGlzU3RyaWN0TW9kZVxuICAgICAgbnVsbCwgLy8gY29uY3VycmVudFVwZGF0ZXNCeURlZmF1bHRPdmVycmlkZVxuICAgICAgXCJcIiwgLy8gaWRlbnRpZmllclByZWZpeFxuICAgICAgKGU6IHVua25vd24pID0+IGNvbnNvbGUuZXJyb3IoXCJbanNdIHJlY292ZXJhYmxlIGVycm9yOlwiLCBlKSxcbiAgICAgIG51bGwsIC8vIHRyYW5zaXRpb25DYWxsYmFja3NcbiAgICApO1xuICB9XG4gIC8vIENvbW1pdCB0aGUgaW5pdGlhbCBtb3VudCBzeW5jaHJvbm91c2x5OiBhIGNvbmN1cnJlbnQgcm9vdCBzY2hlZHVsZXMgdGhlIGZpcnN0XG4gIC8vIHJlbmRlciBhc3luY2hyb25vdXNseSBvdGhlcndpc2UsIGRlbGF5aW5nIHRoZSBpbml0aWFsIG9wIGZsdXNoLlxuICByZWNvbmNpbGVyLmZsdXNoU3luYygoKSA9PiB7XG4gICAgcmVjb25jaWxlci51cGRhdGVDb250YWluZXIoZWxlbWVudCwgcm9vdCwgbnVsbCwgbnVsbCk7XG4gIH0pO1xufVxuIiwgIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3JlYWN0LXJlZnJlc2guZC50c1wiIC8+XG4vLyBSZWFjdCBGYXN0IFJlZnJlc2ggcnVudGltZSBnbHVlLlxuLy9cbi8vIExpdmVzIGluIHRoZSAqdmVuZG9yKiBidW5kbGUgKGxvYWRlZCBvbmNlLCBuZXZlciByZS1leGVjdXRlZCkuIEl0IHdpcmVzIHRoZVxuLy8gcmVhY3QtcmVmcmVzaCBydW50aW1lIGludG8gdGhlIGdsb2JhbCBob29rIEJFRk9SRSB0aGUgcmVjb25jaWxlciBpcyBjcmVhdGVkXG4vLyAoc2VlIHJlbmRlcmVyLnRzKSwgZXhwb3NlcyB0aGUgYCRSZWZyZXNoUmVnJGAvYCRSZWZyZXNoU2lnJGAgZ2xvYmFscyB0aGUgU1dDXG4vLyByZWZyZXNoIHRyYW5zZm9ybSBlbWl0cywgYW5kIGRyaXZlcyBgcGVyZm9ybVJlYWN0UmVmcmVzaGAgd2hlbiB0aGUgKmFwcCpcbi8vIGJ1bmRsZSBpcyByZS1leGVjdXRlZCBvbiBhIGhvdCB1cGRhdGUuXG4vL1xuLy8gVGhlIGFwcCBidW5kbGUgaXMgcmVidWlsdCBhbmQgcmUtcnVuIHdob2xlc2FsZSBvbiBldmVyeSBlZGl0LCBzbyBldmVyeVxuLy8gY29tcG9uZW50IGJlY29tZXMgYSBmcmVzaCBmdW5jdGlvbiByZWdpc3RlcmVkIHVuZGVyIGl0cyAobW9kdWxlLXVuaXF1ZSlcbi8vIGZhbWlseSBpZC4gYHBlcmZvcm1SZWFjdFJlZnJlc2hgIHRoZW4gcmUtcmVuZGVycyB0aGUgYWZmZWN0ZWQgZmliZXJzLFxuLy8gcHJlc2VydmluZyBob29rIHN0YXRlIHdoZW4gYSBjb21wb25lbnQncyBob29rIHNpZ25hdHVyZSBpcyB1bmNoYW5nZWQuXG5cbi8vIFR5cGUtb25seSBpbXBvcnQgKGVyYXNlZCBhdCBidWlsZCkgc28gdGhpcyBtb2R1bGUgaGFzIE5PIHRvcC1sZXZlbCBzaWRlIGVmZmVjdFxuLy8gYW5kIGVzYnVpbGQgY2FuIHRyZWUtc2hha2UgdGhlIHdob2xlIHJlYWN0LXJlZnJlc2ggY2hhaW4gb3V0IG9mIHByb2R1Y3Rpb24gYnVuZGxlc1xuLy8gXHUyMDE0IHRoZSB2YWx1ZSBpcyBgcmVxdWlyZWBkIGxhemlseSBpbnNpZGUgYHNldHVwUmVmcmVzaFJ1bnRpbWVgLCB3aGljaCBvbmx5IHJ1bnMgaW5cbi8vIGRldiAoc2VlIHJlbmRlcmVyLnRzJ3MgYGlmIChERVYpYCBnYXRlKS4gQSBzdGF0aWMgdmFsdWUgaW1wb3J0IHdvdWxkIG90aGVyd2lzZSBydW5cbi8vIHJlYWN0LXJlZnJlc2gncyBwcm9kdWN0aW9uIHJ1bnRpbWUsIHdoaWNoIHRocm93cyBvbiBsb2FkLlxuaW1wb3J0IHR5cGUgKiBhcyBSZWZyZXNoUnVudGltZSBmcm9tIFwicmVhY3QtcmVmcmVzaC9ydW50aW1lXCI7XG5cbi8vIGVzYnVpbGQgcmVzb2x2ZXMgYSBsaXRlcmFsIGByZXF1aXJlKC4uLilgIHdoZW4gYnVuZGxpbmc7IGRlY2xhcmVkIGxvY2FsbHkgdG8gYXZvaWRcbi8vIHB1bGxpbmcgaW4gYEB0eXBlcy9ub2RlYCAobWlycm9ycyB0aGUgYHByb2Nlc3NgIGRlY2xhcmF0aW9uIGluIHJlbmRlcmVyLnRzKS5cbmRlY2xhcmUgZnVuY3Rpb24gcmVxdWlyZShpZDogc3RyaW5nKTogdHlwZW9mIFJlZnJlc2hSdW50aW1lO1xuXG5pbnRlcmZhY2UgSG1yQXBpIHtcbiAgbW91bnRlZDogYm9vbGVhbjtcbiAgcmVsb2FkQ291bnQ6IG51bWJlcjtcbiAgcmVnaXN0ZXIodHlwZTogdW5rbm93biwgaWQ6IHN0cmluZyk6IHZvaWQ7XG4gIHNpZ246IHR5cGVvZiBSZWZyZXNoUnVudGltZS5jcmVhdGVTaWduYXR1cmVGdW5jdGlvbkZvclRyYW5zZm9ybTtcbiAgLy8gQ2FsbGVkIGJ5IHRoZSBhcHAgYnVuZGxlJ3MgdGFpbCBhZnRlciBpdCByZS1yZWdpc3RlcnMgY29tcG9uZW50cy5cbiAgYXBwbHlVcGRhdGUoKTogdm9pZDtcbiAgcGVyZm9ybVJlYWN0UmVmcmVzaCgpOiB2b2lkO1xufVxuXG4vLyBJbnN0YWxsIHRoZSByZWZyZXNoIHJ1bnRpbWUgZXhhY3RseSBvbmNlLiBNVVNUIHJ1biBiZWZvcmUgdGhlIHJlY29uY2lsZXIgaXNcbi8vIGNyZWF0ZWQgc28gdGhlIHJlY29uY2lsZXIncyBgaW5qZWN0SW50b0RldlRvb2xzYCByZWFjaGVzIGEgaG9vayB0aGF0IHRoZVxuLy8gcmVmcmVzaCBydW50aW1lIGhhcyBhbHJlYWR5IHBhdGNoZWQuXG5sZXQgaW5zdGFsbGVkID0gZmFsc2U7XG5leHBvcnQgZnVuY3Rpb24gc2V0dXBSZWZyZXNoUnVudGltZSgpOiBIbXJBcGkge1xuICBjb25zdCBnID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHtcbiAgICBfX2htcj86IEhtckFwaTtcbiAgICAkUmVmcmVzaFJlZyQ/OiB1bmtub3duO1xuICAgICRSZWZyZXNoU2lnJD86IHVua25vd247XG4gIH07XG4gIGlmIChnLl9faG1yKSByZXR1cm4gZy5fX2htcjtcblxuICBjb25zdCBSZWZyZXNoID0gcmVxdWlyZShcInJlYWN0LXJlZnJlc2gvcnVudGltZVwiKTtcbiAgaWYgKCFpbnN0YWxsZWQpIHtcbiAgICBpbnN0YWxsZWQgPSB0cnVlO1xuICAgIFJlZnJlc2guaW5qZWN0SW50b0dsb2JhbEhvb2soZ2xvYmFsVGhpcyk7XG4gIH1cblxuICBjb25zdCBhcGk6IEhtckFwaSA9IHtcbiAgICBtb3VudGVkOiBmYWxzZSxcbiAgICByZWxvYWRDb3VudDogMCxcbiAgICByZWdpc3RlcjogKHR5cGUsIGlkKSA9PiBSZWZyZXNoLnJlZ2lzdGVyKHR5cGUsIGlkKSxcbiAgICBzaWduOiBSZWZyZXNoLmNyZWF0ZVNpZ25hdHVyZUZ1bmN0aW9uRm9yVHJhbnNmb3JtLFxuICAgIHBlcmZvcm1SZWFjdFJlZnJlc2g6ICgpID0+IFJlZnJlc2gucGVyZm9ybVJlYWN0UmVmcmVzaCgpLFxuICAgIGFwcGx5VXBkYXRlKCkge1xuICAgICAgdGhpcy5yZWxvYWRDb3VudCsrO1xuICAgICAgUmVmcmVzaC5wZXJmb3JtUmVhY3RSZWZyZXNoKCk7XG4gICAgfSxcbiAgfTtcblxuICAvLyBUaGUgdHJhbnNmb3JtIGVtaXRzIGJhcmUgYCRSZWZyZXNoUmVnJGAgLyBgJFJlZnJlc2hTaWckYCByZWZlcmVuY2VzOyB0aGVcbiAgLy8gYnVpbGQgcHJlZml4ZXMgZWFjaCByZWdpc3RyYXRpb24gaWQgd2l0aCB0aGUgbW9kdWxlIHBhdGggZm9yIHVuaXF1ZW5lc3MuXG4gIGcuJFJlZnJlc2hSZWckID0gKHR5cGU6IHVua25vd24sIGlkOiBzdHJpbmcpID0+IGFwaS5yZWdpc3Rlcih0eXBlLCBpZCk7XG4gIGcuJFJlZnJlc2hTaWckID0gYXBpLnNpZ247XG4gIGcuX19obXIgPSBhcGk7XG4gIHJldHVybiBhcGk7XG59XG4iLCAiLy8gSGlnaC1sZXZlbCBlbnRyeSBwb2ludCBmb3IgY29uc3VtZXIgYXBwcy5cblxuaW1wb3J0IHR5cGUgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHJlc2V0LCBydW5FdmVudExvb3AgfSBmcm9tIFwiLi9icmlkZ2VcIjtcbmltcG9ydCB7IGZsdXNoU3luYywgcmVuZGVyIH0gZnJvbSBcIi4vcmVuZGVyZXJcIjtcblxuaW50ZXJmYWNlIEhtckFwaSB7XG4gIG1vdW50ZWQ6IGJvb2xlYW47XG4gIGFwcGx5VXBkYXRlKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogTW91bnQgYSBSZWFjdCB0cmVlIGludG8gdGhlIEJldnkgaG9zdC5cbiAqXG4gKiBGaXJzdCBjYWxsIChjb2xkIHN0YXJ0KTogY2xlYXJzIGFueSBwcmV2aW91cyB0cmVlIGFuZCByZW5kZXJzIGBlbGVtZW50YC5cbiAqXG4gKiBPbiBhIGhvdCB1cGRhdGUgdGhlICphcHAqIGJ1bmRsZSBpcyByZS1leGVjdXRlZCBpbiB0aGUgbGl2ZSBpc29sYXRlLCB3aGljaFxuICogY2FsbHMgYG1vdW50YCBhZ2Fpbi4gQnkgdGhlbiBgX19obXIubW91bnRlZGAgaXMgc2V0LCBzbyBpbnN0ZWFkIG9mIGEgZnJlc2hcbiAqIG1vdW50IHdlIHRyaWdnZXIgYSBSZWFjdCBGYXN0IFJlZnJlc2ggKHJlLXJlbmRlcmluZyB0aGUgZXhpc3RpbmcgZmliZXIgdHJlZSxcbiAqIGhvb2sgc3RhdGUgaW50YWN0KS5cbiAqXG4gKiBFaXRoZXIgd2F5IHdlIChyZS0pcGFyayBvbiB0aGUgZXZlbnQgbG9vcC4gVGhpcyBpcyBSRVFVSVJFRCBvbiBFVkVSWSBjYWxsLFxuICogaW5jbHVkaW5nIHVwZGF0ZXM6IGEgcmVsb2FkIG1ha2VzIGBydW5FdmVudExvb3BgIHJldHVybiAoc28gdGhlIFJ1c3Qgc2lkZSBjYW5cbiAqIGBleGVjdXRlX3NjcmlwdGAgdGhlIHJlYnVpbHQgYXBwKSwgd2hpY2gga2lsbHMgdGhlIHByZXZpb3VzIHBhcmtlci4gV2l0aG91dFxuICogcmUtcGFya2luZyBoZXJlLCBhZnRlciB0aGUgZmlyc3QgcmVsb2FkIG5vdGhpbmcgd291bGQgYXdhaXQgYG9wX25leHRfZXZlbnRgIFx1MjAxNFxuICogdGhlIFJ1c3QgZXZlbnQgbG9vcCB3b3VsZCBnbyBpZGxlIGFuZCBzaHV0IHRoZSBKUyB0aHJlYWQgZG93biwgc28gdGhlIFVJIHdvdWxkXG4gKiBmcmVlemUgKG5vIGNsaWNrcykgYW5kIG5vIGZ1cnRoZXIgcmVsb2FkcyB3b3VsZCBhcHBseS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1vdW50KGVsZW1lbnQ6IFJlYWN0Tm9kZSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBobXIgPSAoZ2xvYmFsVGhpcyBhcyB7IF9faG1yPzogSG1yQXBpIH0pLl9faG1yO1xuXG4gIGlmIChobXI/Lm1vdW50ZWQpIHtcbiAgICAvLyBBIEZhc3QgUmVmcmVzaCByZW5kZXIgY2FuIHRocm93IChhIGNvbXBvbmVudCBlcnJvcmluZyBkdXJpbmcgdGhlIHJlZnJlc2hcbiAgICAvLyByZS1yZW5kZXIgbWFrZXMgYHBlcmZvcm1SZWFjdFJlZnJlc2hgIHJldGhyb3cgc3luY2hyb25vdXNseSkuIFNpbmNlIHRoZVxuICAgIC8vIGVudHJ5IGNhbGxzIGBtb3VudCgpYCB1bi1hd2FpdGVkLCBhbiB1bmd1YXJkZWQgdGhyb3cgaGVyZSB3b3VsZCBiZWNvbWUgYVxuICAgIC8vIHN3YWxsb3dlZCByZWplY3Rpb24gdGhhdCBza2lwcyB0aGUgcmUtcGFyayBiZWxvdyBcdTIwMTQgdGhlIEpTIGV2ZW50IGxvb3Agd291bGRcbiAgICAvLyB0aGVuIGdvIGlkbGUgYW5kIHRoZSBKUyB0aHJlYWQgd291bGQgZXhpdCAoVUkgZnJlZXplcywgbm8gZnVydGhlciByZWxvYWRzKS5cbiAgICAvLyBDYXRjaCBpdCwgc3VyZmFjZSBpdCwgYW5kIGZhbGwgdGhyb3VnaCB0byByZS1wYXJrIHJlZ2FyZGxlc3MuXG4gICAgdHJ5IHtcbiAgICAgIGhtci5hcHBseVVwZGF0ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJbanNdIGZhc3QgcmVmcmVzaCBlcnJvcjpcIiwgZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChobXIpIGhtci5tb3VudGVkID0gdHJ1ZTtcbiAgICByZXNldCgpO1xuICAgIHJlbmRlcihlbGVtZW50KTtcbiAgfVxuXG4gIGF3YWl0IHJ1bkV2ZW50TG9vcChmbHVzaFN5bmMpO1xufVxuIiwgIi8vIFJlYW5pbWF0ZWQtc3R5bGUgYW5pbWF0aW9uIEFQSSBmb3IgYmV2eS1yZWFjdC5cbi8vXG4vLyBNaXJyb3JzIFJlYWN0IE5hdGl2ZSBSZWFuaW1hdGVkOiBkZWNsYXJlIGEgYFNoYXJlZFZhbHVlYCAob25lIGFuaW1hdGFibGVcbi8vIG51bWJlciB3aXRoIGEgc3RhYmxlIGlkKSwgYXNzaWduIGl0IGEgKmRyaXZlciogKGB3aXRoVGltaW5nYCwgYHdpdGhTcHJpbmdgLFxuLy8gYHdpdGhSZXBlYXRgLCBgd2l0aFNlcXVlbmNlYCksIGFuZCBiaW5kIHN0eWxlIHByb3BlcnRpZXMgdG8gaXQgb24gYW5cbi8vIGBBbmltYXRlZC5ub2RlYC4gVGhlIGRlY2xhcmF0aW9uIGNyb3NzZXMgdGhlIGJyaWRnZSBvbmNlOyB0aGUgQmV2eSBzaWRlIGRyaXZlc1xuLy8gdGhlIHZhbHVlIGV2ZXJ5IGZyYW1lIFx1MjAxNCBwZXItZnJhbWUgaW50ZXJwb2xhdGlvbiBuZXZlciByb3VuZC10cmlwcyB0byBKUy5cbi8vXG4vLyBUaGVzZSBzaGFwZXMgYXJlIGhhbmQtbWlycm9yZWQgYWdhaW5zdCBgYmV2eV9yZWFjdF9hbmltYXRpb25zOjpwcm90b2NvbGAgb24gdGhlXG4vLyBSdXN0IHNpZGUgKHRoZSBzYW1lIGNvbnRyYWN0IGBicmlkZ2UudHNgIGtlZXBzIHdpdGggYHByb3RvY29sOjpPcGApLiBLZWVwIHRoZW1cbi8vIGluIHN5bmMuXG5cbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQsIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgYW5pbWF0ZSB9IGZyb20gXCIuL2JyaWRnZVwiO1xuaW1wb3J0IHR5cGUgeyBCZXZ5SW1hZ2VQcm9wcywgQmV2eU5vZGVQcm9wcywgQmV2eVRleHRQcm9wcyB9IGZyb20gXCIuL2pzeFwiO1xuXG4vKiogRWFzaW5nIGN1cnZlIG5hbWVzIHVuZGVyc3Rvb2QgYnkgYHdpdGhUaW1pbmdgIChtaXJyb3JzIFJ1c3QgYEVhc2luZ2ApLiAqL1xuZXhwb3J0IHR5cGUgRWFzaW5nTmFtZSA9IFwibGluZWFyXCIgfCBcImVhc2VJblwiIHwgXCJlYXNlT3V0XCIgfCBcImVhc2VJbk91dFwiO1xuXG4vKiogRWFzaW5nIGN1cnZlcyBmb3IgYHdpdGhUaW1pbmdgLCBlLmcuIGBFYXNpbmcuZWFzZUluT3V0YC4gKi9cbmV4cG9ydCBjb25zdCBFYXNpbmcgPSB7XG4gIGxpbmVhcjogXCJsaW5lYXJcIixcbiAgZWFzZUluOiBcImVhc2VJblwiLFxuICBlYXNlT3V0OiBcImVhc2VPdXRcIixcbiAgZWFzZUluT3V0OiBcImVhc2VJbk91dFwiLFxufSBhcyBjb25zdCBzYXRpc2ZpZXMgUmVjb3JkPHN0cmluZywgRWFzaW5nTmFtZT47XG5cbi8qKiBBIGRyaXZlcjogaG93IGEgc2hhcmVkIHZhbHVlIGV2b2x2ZXMgb3ZlciB0aW1lLiBCdWlsdCBieSB0aGUgYHdpdGgqYFxuICogIGhlbHBlcnMgYW5kIGFzc2lnbmVkIHRvIGBzaGFyZWRWYWx1ZS52YWx1ZWAuIERyaXZlcnMgY29tcG9zZS4gKi9cbmV4cG9ydCB0eXBlIERyaXZlciA9XG4gIHwgeyB0eXBlOiBcInRpbWluZ1wiOyB0bzogbnVtYmVyOyBkdXJhdGlvbjogbnVtYmVyOyBlYXNpbmc6IEVhc2luZ05hbWUgfVxuICB8IHtcbiAgICAgIHR5cGU6IFwic3ByaW5nXCI7XG4gICAgICB0bzogbnVtYmVyO1xuICAgICAgc3RpZmZuZXNzOiBudW1iZXI7XG4gICAgICBkYW1waW5nOiBudW1iZXI7XG4gICAgICBtYXNzOiBudW1iZXI7XG4gICAgfVxuICB8IHsgdHlwZTogXCJyZXBlYXRcIjsgYW5pbWF0aW9uOiBEcml2ZXI7IGNvdW50OiBudW1iZXI7IHJldmVyc2U6IGJvb2xlYW4gfVxuICB8IHsgdHlwZTogXCJzZXF1ZW5jZVwiOyBzdGVwczogRHJpdmVyW10gfVxuICB8IHsgdHlwZTogXCJkZWxheVwiOyBkZWxheTogbnVtYmVyOyBhbmltYXRpb246IERyaXZlciB9O1xuXG4vKiogQSBiaW5kaW5nIGZyb20gYSBzdHlsZSBwcm9wZXJ0eSB0byBhIHNoYXJlZCB2YWx1ZSwgZXZhbHVhdGVkIGVhY2ggZnJhbWUgb24gdGhlXG4gKiAgQmV2eSBzaWRlLiBQcm9kdWNlZCBieSBwYXNzaW5nIGEgYFNoYXJlZFZhbHVlYCBkaXJlY3RseSwgb3IgdmlhXG4gKiAgYGludGVycG9sYXRlYCAvIGBpbnRlcnBvbGF0ZUNvbG9yYC4gKi9cbmV4cG9ydCB0eXBlIEJpbmRpbmcgPVxuICB8IHsgdHlwZTogXCJzaGFyZWRcIjsgaWQ6IG51bWJlciB9XG4gIHwgeyB0eXBlOiBcImludGVycG9sYXRlXCI7IGlkOiBudW1iZXI7IGlucHV0OiBudW1iZXJbXTsgb3V0cHV0OiBudW1iZXJbXSB9XG4gIHwge1xuICAgICAgdHlwZTogXCJpbnRlcnBvbGF0ZUNvbG9yXCI7XG4gICAgICBpZDogbnVtYmVyO1xuICAgICAgaW5wdXQ6IG51bWJlcltdO1xuICAgICAgb3V0cHV0OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXVtdO1xuICAgIH07XG5cbi8qKiBBIGhhbmRsZSB0byBhIEJldnktcmVzaWRlbnQgYW5pbWF0YWJsZSB2YWx1ZSAoUmVhbmltYXRlZCdzIGB1c2VTaGFyZWRWYWx1ZWApLlxuICogIFNldHRpbmcgYC52YWx1ZWAgdG8gYSBudW1iZXIgc2V0cyBpdCBpbW1lZGlhdGVseTsgc2V0dGluZyBpdCB0byBhIGRyaXZlclxuICogIHN0YXJ0cyBhbiBhbmltYXRpb24gZnJvbSB0aGUgdmFsdWUncyBsaXZlIHJlYWRpbmcuIFRoZSBnZXR0ZXIgcmV0dXJucyB0aGUgbGFzdFxuICogIEpTLXNldCBudW1iZXIgKHBlci1mcmFtZSB2YWx1ZXMgbGl2ZSBpbiBCZXZ5LCBub3QgSlMpLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaGFyZWRWYWx1ZSB7XG4gIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gIHZhbHVlOiBudW1iZXIgfCBEcml2ZXI7XG59XG5cbi8qKiBBIHZhbHVlIGFuIGFuaW1hdGVkIHN0eWxlIHByb3BlcnR5IGNhbiBiaW5kIHRvOiBhIHNoYXJlZCB2YWx1ZSAodXNlZFxuICogIGRpcmVjdGx5KSBvciBhbiBpbnRlcnBvbGF0aW9uIGJpbmRpbmcuICovXG5leHBvcnQgdHlwZSBBbmltYXRlZFZhbHVlID0gU2hhcmVkVmFsdWUgfCBCaW5kaW5nO1xuXG4vKiogVGhlIGFuaW1hdGlvbi1kcml2ZW4gaGFsZiBvZiBhbiBgQW5pbWF0ZWQubm9kZWAncyBzdHlsZS4gVHJhbnNmb3JtIGNoYW5uZWxzXG4gKiAgbWFwIHRvIGBVaVRyYW5zZm9ybWA7IGBvcGFjaXR5YCBkcml2ZXMgY29sb3IgYWxwaGE7IGBiYWNrZ3JvdW5kQ29sb3JgIGRyaXZlc1xuICogIHRoZSBiYWNrZ3JvdW5kIGNvbG9yLiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRlZFN0eWxlIHtcbiAgdHJhbnNsYXRlWD86IEFuaW1hdGVkVmFsdWU7XG4gIHRyYW5zbGF0ZVk/OiBBbmltYXRlZFZhbHVlO1xuICAvKiogVW5pZm9ybSBzY2FsZSAoYm90aCBheGVzKSwgdW5sZXNzIG92ZXJyaWRkZW4gYnkgYHNjYWxlWGAgLyBgc2NhbGVZYC4gKi9cbiAgc2NhbGU/OiBBbmltYXRlZFZhbHVlO1xuICBzY2FsZVg/OiBBbmltYXRlZFZhbHVlO1xuICBzY2FsZVk/OiBBbmltYXRlZFZhbHVlO1xuICAvKiogQ2xvY2t3aXNlIHJvdGF0aW9uLCBpbiAqKnJhZGlhbnMqKiAoYW4gaW1wZXJhdGl2ZSBudW1lcmljIGNoYW5uZWwgXHUyMDE0IHVubGlrZVxuICAgKiAgdGhlIGRlY2xhcmF0aXZlIHN0YXRpYyBgdHJhbnNmb3JtLnJvdGF0ZWAsIHdoaWNoIHRha2VzIGEgQ1NTIGFuZ2xlL2RlZ3JlZXMpLiAqL1xuICByb3RhdGU/OiBBbmltYXRlZFZhbHVlO1xuICBvcGFjaXR5PzogQW5pbWF0ZWRWYWx1ZTtcbiAgYmFja2dyb3VuZENvbG9yPzogQW5pbWF0ZWRWYWx1ZTtcbn1cblxuLy8gUGVyLXJ1bnRpbWUgc2hhcmVkLXZhbHVlIGlkIGFsbG9jYXRvci4gQSBob3QgcmVsb2FkIHNwaW5zIHVwIGEgZnJlc2ggaXNvbGF0ZSxcbi8vIHNvIHRoaXMgcmVzZXRzIHRvIDEgbmF0dXJhbGx5OyBgcmVzZXQoKWAgY2xlYXJzIHRoZSBCZXZ5LXNpZGUgdGFibGUgdG8gbWF0Y2guXG5sZXQgbmV4dFNoYXJlZElkID0gMTtcblxuLyoqXG4gKiBEZWNsYXJlIGEgc2hhcmVkIHZhbHVlIHdpdGggYW4gYGluaXRpYWxgIHJlYWRpbmcuIFN0YWJsZSBhY3Jvc3MgcmUtcmVuZGVyc1xuICogKHRoZSBpZCBpcyBhbGxvY2F0ZWQgb25jZSBwZXIgY29tcG9uZW50IGluc3RhbmNlKS5cbiAqL1xuLy8gVE9ETyhyZXZpZXcpOiB0aGlzIHBlcmZvcm1zIGEgYnJpZGdlIHNpZGUtZWZmZWN0IChgYW5pbWF0ZSh7a2luZDpcImRlY2xhcmVcIn0pYCkgRFVSSU5HXG4vLyByZW5kZXIuIEl0J3Mgc2FmZSB0b2RheSBvbmx5IGJlY2F1c2UgU3RyaWN0TW9kZSBpcyBvZmYgYW5kIHRoZSByb290IGlzIGRyaXZlbiBzeW5jaHJvbm91c2x5O1xuLy8gdW5kZXIgU3RyaWN0TW9kZSBvciBhIGRpc2NhcmRlZC9kb3VibGUtaW52b2tlZCByZW5kZXIgaXQgd291bGQgYWxsb2NhdGUgKGFuZCBsZWFrKSBhIHNoYXJlZFxuLy8gaWQgaW4gdGhlIEJldnkgdGFibGUgdW50aWwgdGhlIG5leHQgYGNsZWFyYC4gTW92ZSB0aGUgZGVjbGFyZSBpbnRvIGFuIGVmZmVjdC5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTaGFyZWRWYWx1ZShpbml0aWFsOiBudW1iZXIpOiBTaGFyZWRWYWx1ZSB7XG4gIGNvbnN0IHJlZiA9IHVzZVJlZjxTaGFyZWRWYWx1ZSB8IG51bGw+KG51bGwpO1xuICBpZiAocmVmLmN1cnJlbnQgPT09IG51bGwpIHtcbiAgICBjb25zdCBpZCA9IG5leHRTaGFyZWRJZCsrO1xuICAgIGFuaW1hdGUoeyBraW5kOiBcImRlY2xhcmVcIiwgaWQsIGluaXRpYWwgfSk7XG4gICAgcmVmLmN1cnJlbnQgPSBtYWtlU2hhcmVkVmFsdWUoaWQsIGluaXRpYWwpO1xuICB9XG4gIHJldHVybiByZWYuY3VycmVudDtcbn1cblxuZnVuY3Rpb24gbWFrZVNoYXJlZFZhbHVlKGlkOiBudW1iZXIsIGluaXRpYWw6IG51bWJlcik6IFNoYXJlZFZhbHVlIHtcbiAgbGV0IGxhc3QgPSBpbml0aWFsO1xuICByZXR1cm4ge1xuICAgIGlkLFxuICAgIGdldCB2YWx1ZSgpOiBudW1iZXIgfCBEcml2ZXIge1xuICAgICAgcmV0dXJuIGxhc3Q7XG4gICAgfSxcbiAgICBzZXQgdmFsdWUodjogbnVtYmVyIHwgRHJpdmVyKSB7XG4gICAgICBpZiAodHlwZW9mIHYgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgbGFzdCA9IHY7XG4gICAgICAgIGFuaW1hdGUoeyBraW5kOiBcInNldFwiLCBpZCwgdmFsdWU6IHYgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbmltYXRlKHsga2luZDogXCJhbmltYXRlXCIsIGlkLCBkcml2ZXI6IHYgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqIEFuaW1hdGUgdG8gYHRvYCBvdmVyIGBkdXJhdGlvbmAgbXMgKGRlZmF1bHQgMzAwKSB3aXRoIGBlYXNpbmdgIChkZWZhdWx0XG4gKiAgbGluZWFyKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoVGltaW5nKFxuICB0bzogbnVtYmVyLFxuICBjb25maWc/OiB7IGR1cmF0aW9uPzogbnVtYmVyOyBlYXNpbmc/OiBFYXNpbmdOYW1lIH0sXG4pOiBEcml2ZXIge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwidGltaW5nXCIsXG4gICAgdG8sXG4gICAgZHVyYXRpb246IChjb25maWc/LmR1cmF0aW9uID8/IDMwMCkgLyAxMDAwLFxuICAgIGVhc2luZzogY29uZmlnPy5lYXNpbmcgPz8gXCJsaW5lYXJcIixcbiAgfTtcbn1cblxuLyoqIFNldHRsZSBvbiBgdG9gIHdpdGggYSBkYW1wZWQgc3ByaW5nLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhTcHJpbmcoXG4gIHRvOiBudW1iZXIsXG4gIGNvbmZpZz86IHsgc3RpZmZuZXNzPzogbnVtYmVyOyBkYW1waW5nPzogbnVtYmVyOyBtYXNzPzogbnVtYmVyIH0sXG4pOiBEcml2ZXIge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwic3ByaW5nXCIsXG4gICAgdG8sXG4gICAgc3RpZmZuZXNzOiBjb25maWc/LnN0aWZmbmVzcyA/PyAxMDAsXG4gICAgZGFtcGluZzogY29uZmlnPy5kYW1waW5nID8/IDEwLFxuICAgIG1hc3M6IGNvbmZpZz8ubWFzcyA/PyAxLFxuICB9O1xufVxuXG4vKiogUmVwZWF0IGBhbmltYXRpb25gIGBjb3VudGAgdGltZXMgKGAtMWAgPSBmb3JldmVyLCB0aGUgZGVmYXVsdCkuIGByZXZlcnNlYFxuICogIHBpbmctcG9uZ3MgdGhlIGVuZHBvaW50cyAodGltaW5nL3NwcmluZykgaW5zdGVhZCBvZiByZXN0YXJ0aW5nIGZyb20gdGhlIHRvcC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoUmVwZWF0KFxuICBhbmltYXRpb246IERyaXZlcixcbiAgY291bnQgPSAtMSxcbiAgcmV2ZXJzZSA9IGZhbHNlLFxuKTogRHJpdmVyIHtcbiAgcmV0dXJuIHsgdHlwZTogXCJyZXBlYXRcIiwgYW5pbWF0aW9uLCBjb3VudCwgcmV2ZXJzZSB9O1xufVxuXG4vKiogUnVuIGVhY2ggZHJpdmVyIGluIG9yZGVyLCBlYWNoIHN0YXJ0aW5nIHdoZXJlIHRoZSBwcmV2aW91cyBlbmRlZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoU2VxdWVuY2UoLi4uc3RlcHM6IERyaXZlcltdKTogRHJpdmVyIHtcbiAgcmV0dXJuIHsgdHlwZTogXCJzZXF1ZW5jZVwiLCBzdGVwcyB9O1xufVxuXG4vKiogSG9sZCBpbiBwbGFjZSBmb3IgYGRlbGF5TXNgLCB0aGVuIHJ1biBgYW5pbWF0aW9uYC4gVGhlIGNhbm9uaWNhbCB3YXkgdG9cbiAqICBzdGFnZ2VyIGFuaW1hdGlvbnMgb3IgcGF1c2UgYmV0d2VlbiBzdGVwcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRGVsYXkoZGVsYXlNczogbnVtYmVyLCBhbmltYXRpb246IERyaXZlcik6IERyaXZlciB7XG4gIHJldHVybiB7IHR5cGU6IFwiZGVsYXlcIiwgZGVsYXk6IGRlbGF5TXMgLyAxMDAwLCBhbmltYXRpb24gfTtcbn1cblxuLyoqIE1hcCBhIHNoYXJlZCB2YWx1ZSB0aHJvdWdoIGEgcGllY2V3aXNlLWxpbmVhciBjdXJ2ZSAoY2xhbXBlZCBhdCB0aGUgZW5kcykuICovXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJwb2xhdGUoXG4gIHZhbHVlOiBTaGFyZWRWYWx1ZSxcbiAgaW5wdXQ6IG51bWJlcltdLFxuICBvdXRwdXQ6IG51bWJlcltdLFxuKTogQmluZGluZyB7XG4gIHJldHVybiB7IHR5cGU6IFwiaW50ZXJwb2xhdGVcIiwgaWQ6IHZhbHVlLmlkLCBpbnB1dCwgb3V0cHV0IH07XG59XG5cbi8qKiBNYXAgYSBzaGFyZWQgdmFsdWUgdG8gYSBjb2xvciwgaW50ZXJwb2xhdGluZyBiZXR3ZWVuIGhleCBzdG9wcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnBvbGF0ZUNvbG9yKFxuICB2YWx1ZTogU2hhcmVkVmFsdWUsXG4gIGlucHV0OiBudW1iZXJbXSxcbiAgb3V0cHV0OiBzdHJpbmdbXSxcbik6IEJpbmRpbmcge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IFwiaW50ZXJwb2xhdGVDb2xvclwiLFxuICAgIGlkOiB2YWx1ZS5pZCxcbiAgICBpbnB1dCxcbiAgICBvdXRwdXQ6IG91dHB1dC5tYXAoaGV4VG9SZ2JhKSxcbiAgfTtcbn1cblxuLyoqIFN0b3AgYSBzaGFyZWQgdmFsdWUncyBhY3RpdmUgYW5pbWF0aW9uLCBmcmVlemluZyBpdCBpbiBwbGFjZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxBbmltYXRpb24odmFsdWU6IFNoYXJlZFZhbHVlKTogdm9pZCB7XG4gIGFuaW1hdGUoeyBraW5kOiBcImNhbmNlbFwiLCBpZDogdmFsdWUuaWQgfSk7XG59XG5cbmZ1bmN0aW9uIGhleFRvUmdiYShoZXg6IHN0cmluZyk6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdIHtcbiAgbGV0IGggPSBoZXgucmVwbGFjZShcIiNcIiwgXCJcIik7XG4gIGlmIChoLmxlbmd0aCA9PT0gMykge1xuICAgIGggPSBoXG4gICAgICAuc3BsaXQoXCJcIilcbiAgICAgIC5tYXAoKGMpID0+IGMgKyBjKVxuICAgICAgLmpvaW4oXCJcIik7XG4gIH1cbiAgY29uc3QgciA9IHBhcnNlSW50KGguc2xpY2UoMCwgMiksIDE2KSAvIDI1NTtcbiAgY29uc3QgZyA9IHBhcnNlSW50KGguc2xpY2UoMiwgNCksIDE2KSAvIDI1NTtcbiAgY29uc3QgYiA9IHBhcnNlSW50KGguc2xpY2UoNCwgNiksIDE2KSAvIDI1NTtcbiAgY29uc3QgYSA9IGgubGVuZ3RoID49IDggPyBwYXJzZUludChoLnNsaWNlKDYsIDgpLCAxNikgLyAyNTUgOiAxO1xuICByZXR1cm4gW3IsIGcsIGIsIGFdO1xufVxuXG4vLyBUaGluIGhvc3Qgd3JhcHBlcnMsIHNvIGFwcHMgd3JpdGUgYDxBbmltYXRlZC5ub2RlIGFuaW1hdGVkU3R5bGU9e1x1MjAyNn0vPmAgdGhlIHdheVxuLy8gUmVhbmltYXRlZCBhcHBzIHdyaXRlIGA8QW5pbWF0ZWQuVmlldy8+YC4gVGhlIGFuaW1hdGlvbiBsaXZlcyBpbiBgYW5pbWF0ZWRTdHlsZWBcbi8vICh0aGUgaW50cmluc2ljIGVsZW1lbnRzIGFjY2VwdCBpdDsgc2VlIGpzeC5kLnRzKS5cbmZ1bmN0aW9uIGhvc3Q8UD4odHlwZTogc3RyaW5nKSB7XG4gIHJldHVybiAocHJvcHM6IFApID0+IGNyZWF0ZUVsZW1lbnQodHlwZSBhcyBhbnksIHByb3BzIGFzIGFueSk7XG59XG5cbmV4cG9ydCBjb25zdCBBbmltYXRlZCA9IHtcbiAgbm9kZTogaG9zdDxCZXZ5Tm9kZVByb3BzPihcIm5vZGVcIiksXG4gIGJ1dHRvbjogaG9zdDxCZXZ5Tm9kZVByb3BzPihcImJ1dHRvblwiKSxcbiAgaW1hZ2U6IGhvc3Q8QmV2eUltYWdlUHJvcHM+KFwiaW1hZ2VcIiksXG4gIHRleHQ6IGhvc3Q8QmV2eVRleHRQcm9wcz4oXCJ0ZXh0XCIpLFxufTtcbiIsICIvLyBXb3JsZC1hbmNob3JlZCBvdmVybGF5cyBmb3IgYmV2eS1yZWFjdC5cbi8vXG4vLyBgPEFuY2hvcmVkLm5vZGUgZW50aXR5PXtlfSBvZmZzZXQ9e1swLCAxLCAwXX0+XHUyMDI2PC9BbmNob3JlZC5ub2RlPmAgcmVuZGVycyBhIG5vcm1hbFxuLy8gc2NyZWVuLXNwYWNlIGVsZW1lbnQgd2hvc2UgcG9zaXRpb24gdGhlIEJldnkgc2lkZSByZWNvbXB1dGVzIGV2ZXJ5IGZyYW1lIGJ5XG4vLyBwcm9qZWN0aW5nIHRoZSB0YXJnZXQgZW50aXR5J3Mgd29ybGQgcG9zaXRpb24gKHBsdXMgdGhlIG9mZnNldCkgb250byB0aGUgc2NyZWVuLlxuLy8gQmVjYXVzZSBpdCBzdGF5cyBhIGZsYXQgb3ZlcmxheSwgY2xpY2tzL2hvdmVyIHdvcmsgZXhhY3RseSBsaWtlIGFueSBvdGhlciBub2RlLlxuLy9cbi8vIFRoZSBgZW50aXR5YCBpcyBhIEJldnkgYEVudGl0eWAgKGFzIGBFbnRpdHk6OnRvX2JpdHMoKWApLCB3aGljaCB0aGUgYXBwIHJlY2VpdmVzXG4vLyBmcm9tIEJldnkgb3ZlciB0aGUgdHlwZWQgbWVzc2FnaW5nIGJyaWRnZSAoZS5nLiBhIGByZWFjdF9ldmVudGApLiBUaGUgYW5jaG9yXG4vLyByaWRlcyBhY3Jvc3MgaW4gYSBzaW5nbGUgYGFuY2hvcmAgcHJvcCwgZGVjb2RlZCBvbiB0aGUgUnVzdCBzaWRlIGludG8gYEFuY2hvcmAuXG5cbmltcG9ydCB7IGNyZWF0ZUVsZW1lbnQgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB0eXBlIHsgQmV2eUltYWdlUHJvcHMsIEJldnlOb2RlUHJvcHMsIEJldnlUZXh0UHJvcHMgfSBmcm9tIFwiLi9qc3hcIjtcblxuLyoqIEEgd29ybGQtc3BhY2UgdmVjdG9yIGBbeCwgeSwgel1gIGluIEJldnkgd29ybGQgdW5pdHMuICovXG5leHBvcnQgdHlwZSBWZWMzID0gW251bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuXG4vKiogRGlzdGFuY2UtYmFzZWQgc2NhbGluZyBmb3IgYW4gYW5jaG9yZWQgb3ZlcmxheS4gVGhlIEJldnkgc2lkZSBhcHBsaWVzXG4gKiAgYGNsYW1wKDEgKyBmYWN0b3IgKiAoYmFzZURpc3RhbmNlIC8gZGlzdGFuY2UgLSAxKSwgbWluLCBtYXgpYCwgc28gdGhlIG92ZXJsYXlcbiAqICByZW5kZXJzIGF0IHNjYWxlIDEgd2hlbiB0aGUgY2FtZXJhIGlzIGBiYXNlRGlzdGFuY2VgIGF3YXksIGdyb3dzIGFzIGl0IGdldHNcbiAqICBjbG9zZXIsIGFuZCBzaHJpbmtzIGZhcnRoZXIgb3V0LiBPbWl0IGBzY2FsZWAgZW50aXJlbHkgdG8ga2VlcCBhIGNvbnN0YW50IHNpemUuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuY2hvclNjYWxpbmcge1xuICBtaW46IG51bWJlcjtcbiAgbWF4OiBudW1iZXI7XG4gIC8qKiBTY2FsaW5nIHN0cmVuZ3RoOiBgMGAgZGlzYWJsZXMgc2NhbGluZywgYDFgIGlzIHRydWUgcGVyc3BlY3RpdmUgKGFwcGFyZW50XG4gICAqICBzaXplIGhhbHZlcyBhdCB0d2ljZSBgYmFzZURpc3RhbmNlYCksIGAyYCBzY2FsZXMgdHdpY2UgYXMgZmFzdC4gKi9cbiAgZmFjdG9yOiBudW1iZXI7XG4gIC8qKiBDYW1lcmEgZGlzdGFuY2UgYXQgd2hpY2ggdGhlIG92ZXJsYXkgcmVuZGVycyBhdCBzY2FsZSAxLiAqL1xuICBiYXNlRGlzdGFuY2U6IG51bWJlcjtcbn1cblxuLyoqIEV4dHJhIHByb3BzIGV2ZXJ5IGBBbmNob3JlZC4qYCBlbGVtZW50IGFjY2VwdHM6IHdoaWNoIEJldnkgZW50aXR5IHRvIGZvbGxvdyxcbiAqICBhbiBvcHRpb25hbCB3b3JsZC1zcGFjZSBvZmZzZXQsIGFuZCBvcHRpb25hbCBkaXN0YW5jZSBzY2FsaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmNob3JQcm9wcyB7XG4gIC8qKiBUaGUgQmV2eSBlbnRpdHkgdG8gZm9sbG93LCBhcyBgRW50aXR5Ojp0b19iaXRzKClgIChyZWNlaXZlZCBmcm9tIEJldnkpLlxuICAgKiAgQSBgdTY0YCBhcnJpdmVzIGZyb20gdHlwZWQgYmluZGluZ3MgYXMgYSBgYmlnaW50YDsgZWl0aGVyIGZvcm0gaXMgYWNjZXB0ZWQuICovXG4gIGVudGl0eTogbnVtYmVyIHwgYmlnaW50O1xuICAvKiogV29ybGQtc3BhY2Ugb2Zmc2V0IGFkZGVkIHRvIHRoZSBlbnRpdHkncyBwb3NpdGlvbiBiZWZvcmUgcHJvamVjdGluZy4gKi9cbiAgb2Zmc2V0PzogVmVjMztcbiAgLyoqIFdoZW4gc2V0LCB0aGUgb3ZlcmxheSBzY2FsZXMgd2l0aCBjYW1lcmEgZGlzdGFuY2UgKHNlZSBgQW5jaG9yU2NhbGluZ2ApLiAqL1xuICBzY2FsZT86IEFuY2hvclNjYWxpbmc7XG59XG5cbi8vIFRoaW4gaG9zdCB3cmFwcGVycywgc28gYXBwcyB3cml0ZSBgPEFuY2hvcmVkLm5vZGUgZW50aXR5PXtlfSBvZmZzZXQ9e1x1MjAyNn0vPmAuIFRoZVxuLy8gYGVudGl0eWAvYG9mZnNldGAgcHJvcHMgYXJlIHBhY2thZ2VkIGludG8gYSBzaW5nbGUgYGFuY2hvcmAgcHJvcCB0aGUgYnJpZGdlXG4vLyBmb3J3YXJkcyBvcGFxdWVseSAobGlrZSBgc3R5bGVgKSBmb3IgdGhlIFJ1c3Qgc2lkZSB0byBkZWNvZGUuXG5mdW5jdGlvbiBhbmNob3JlZDxQPih0eXBlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIChwcm9wczogUCAmIEFuY2hvclByb3BzKSA9PiB7XG4gICAgY29uc3QgeyBlbnRpdHksIG9mZnNldCwgc2NhbGUsIC4uLnJlc3QgfSA9IHByb3BzIGFzIEFuY2hvclByb3BzICZcbiAgICAgIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIC8vIFNlbmQgdGhlIGVudGl0eSBhcyBhIHBsYWluIG51bWJlci4gYG9wX2ZsdXNoYCdzIHNlcmRlX3Y4IGNhbid0IGRlY29kZSBhXG4gICAgLy8gc3RydWN0IGB1NjRgIGZpZWxkIGZyb20gZWl0aGVyIGEgSlMgbnVtYmVyIChmNjQpIG9yIGEgQmlnSW50LCBzbyB0aGUgUnVzdFxuICAgIC8vIGBBbmNob3IuZW50aXR5YCBpcyBhbiBgZjY0YCBcdTIwMTQgbG9zc2xlc3MgZm9yIHJlYWxpc3RpYyBgRW50aXR5Ojp0b19iaXRzKClgXG4gICAgLy8gdmFsdWVzICh3ZWxsIHVuZGVyIDJeNTMpIFx1MjAxNCBhbmQgY2FzdCBiYWNrIHRvIHRoZSBlbnRpdHkgaWQgb24gYXBwbHkuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQodHlwZSBhcyBuZXZlciwge1xuICAgICAgLi4ucmVzdCxcbiAgICAgIGFuY2hvcjogeyBlbnRpdHk6IE51bWJlcihlbnRpdHkpLCBvZmZzZXQsIHNjYWxlIH0sXG4gICAgfSk7XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBBbmNob3JlZCA9IHtcbiAgbm9kZTogYW5jaG9yZWQ8QmV2eU5vZGVQcm9wcz4oXCJub2RlXCIpLFxuICBidXR0b246IGFuY2hvcmVkPEJldnlOb2RlUHJvcHM+KFwiYnV0dG9uXCIpLFxuICBpbWFnZTogYW5jaG9yZWQ8QmV2eUltYWdlUHJvcHM+KFwiaW1hZ2VcIiksXG4gIHRleHQ6IGFuY2hvcmVkPEJldnlUZXh0UHJvcHM+KFwidGV4dFwiKSxcbn07XG4iLCAiLy8gQXV0b21hdGljLUpTWCBydW50aW1lIGZvciBiZXZ5LXJlYWN0LiBFbGVtZW50ICpjcmVhdGlvbiogZGVsZWdhdGVzIHRvIFJlYWN0J3Ncbi8vIHJ1bnRpbWUgKHJlYWN0LXJlY29uY2lsZXIgZG9lcyB0aGUgYWN0dWFsIHdvcmspOyB0aGUgZXhwb3J0ZWQgYEpTWGAgbmFtZXNwYWNlXG4vLyBtaXJyb3JzIFJlYWN0J3MgYnV0IHJlcGxhY2VzIGBJbnRyaW5zaWNFbGVtZW50c2Agd2l0aCBiZXZ5LXJlYWN0J3MgaG9zdFxuLy8gZWxlbWVudHMsIHNvIGA8bm9kZT5gL2A8YnV0dG9uPmAvYDxpbWFnZT5gIHR5cGUgYWdhaW5zdCBvdXIgcHJvcHMgcmF0aGVyIHRoYW5cbi8vIEhUTUwvU1ZHLlxuLy9cbi8vIE9wdCBpbiBmcm9tIGEgY29uc3VtZXIgdHNjb25maWcgd2l0aDpcbi8vICAgXCJqc3hcIjogXCJyZWFjdC1qc3hcIiwgXCJqc3hJbXBvcnRTb3VyY2VcIjogXCJiZXZ5LXJlYWN0XCJcblxuaW1wb3J0IHR5cGUgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IHsgRnJhZ21lbnQsIGpzeCwganN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuXG5pbXBvcnQgdHlwZSB7XG4gIEJldnlDYW52YXNQcm9wcyxcbiAgQmV2eUVkaXRhYmxlVGV4dFByb3BzLFxuICBCZXZ5SW1hZ2VQcm9wcyxcbiAgQmV2eU5vZGVQcm9wcyxcbiAgQmV2eVBvcnRhbFByb3BzLFxuICBCZXZ5U3VyZmFjZVByb3BzLFxuICBCZXZ5VGV4dFByb3BzLFxufSBmcm9tIFwiLi9qc3hcIjtcblxuLy8gTm90ZTogaW4gYSByZWd1bGFyIGAudHNgIG1vZHVsZSwgbmFtZXNwYWNlIG1lbWJlcnMgbXVzdCBiZSBgZXhwb3J0YGVkIHRvIGJlXG4vLyB2aXNpYmxlIGFzIGBKU1guSW50cmluc2ljRWxlbWVudHNgICh1bmxpa2UgYW4gYW1iaWVudCBgLmQudHNgKS5cbmV4cG9ydCBuYW1lc3BhY2UgSlNYIHtcbiAgZXhwb3J0IHR5cGUgRWxlbWVudFR5cGUgPSBSZWFjdC5KU1guRWxlbWVudFR5cGU7XG4gIGV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudCBleHRlbmRzIFJlYWN0LkpTWC5FbGVtZW50IHt9XG4gIGV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudENsYXNzIGV4dGVuZHMgUmVhY3QuSlNYLkVsZW1lbnRDbGFzcyB7fVxuICBleHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRBdHRyaWJ1dGVzUHJvcGVydHlcbiAgICBleHRlbmRzIFJlYWN0LkpTWC5FbGVtZW50QXR0cmlidXRlc1Byb3BlcnR5IHt9XG4gIGV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudENoaWxkcmVuQXR0cmlidXRlXG4gICAgZXh0ZW5kcyBSZWFjdC5KU1guRWxlbWVudENoaWxkcmVuQXR0cmlidXRlIHt9XG4gIGV4cG9ydCB0eXBlIExpYnJhcnlNYW5hZ2VkQXR0cmlidXRlczxDLCBQPiA9XG4gICAgUmVhY3QuSlNYLkxpYnJhcnlNYW5hZ2VkQXR0cmlidXRlczxDLCBQPjtcbiAgZXhwb3J0IGludGVyZmFjZSBJbnRyaW5zaWNBdHRyaWJ1dGVzIGV4dGVuZHMgUmVhY3QuSlNYLkludHJpbnNpY0F0dHJpYnV0ZXMge31cbiAgZXhwb3J0IGludGVyZmFjZSBJbnRyaW5zaWNDbGFzc0F0dHJpYnV0ZXM8VD4gZXh0ZW5kcyBSZWFjdC5KU1hcbiAgICAuSW50cmluc2ljQ2xhc3NBdHRyaWJ1dGVzPFQ+IHt9XG4gIGV4cG9ydCBpbnRlcmZhY2UgSW50cmluc2ljRWxlbWVudHMge1xuICAgIC8qKiBBIGZsZXgvZ3JpZCBjb250YWluZXIuICovXG4gICAgbm9kZTogQmV2eU5vZGVQcm9wcztcbiAgICAvKiogQSBjbGlja2FibGUgY29udGFpbmVyIChtYXBzIHRvIGBiZXZ5X3VpOjpCdXR0b25gKS4gKi9cbiAgICBidXR0b246IEJldnlOb2RlUHJvcHM7XG4gICAgLyoqIEFuIGltYWdlIChtYXBzIHRvIGBiZXZ5X3VpOjpJbWFnZU5vZGVgKS4gKi9cbiAgICBpbWFnZTogQmV2eUltYWdlUHJvcHM7XG4gICAgLyoqIEFuIGFudGktYWxpYXNlZCB2ZWN0b3IgZHJhd2luZyBzdXJmYWNlIChIVE1MLWA8Y2FudmFzPmAtc3R5bGUpLiAqL1xuICAgIGNhbnZhczogQmV2eUNhbnZhc1Byb3BzO1xuICAgIC8qKiBBIHZpZXcgb2YgYW4gb2Zmc2NyZWVuIEJldnkgcmVuZGVyIHRhcmdldCAocmVuZGVyLXRvLXRleHR1cmUpLiAqL1xuICAgIHBvcnRhbDogQmV2eVBvcnRhbFByb3BzO1xuICAgIC8qKiBSZW5kZXJzIGl0cyBzdWJ0cmVlIGludG8gYW4gb2Zmc2NyZWVuIHRleHR1cmUgZm9yIHVzZSBvbiBhIDNEIG1hdGVyaWFsXG4gICAgICogICh0aGUgaW52ZXJzZSBvZiBgcG9ydGFsYCkuICovXG4gICAgc3VyZmFjZTogQmV2eVN1cmZhY2VQcm9wcztcbiAgICAvKiogU3R5bGVkLCBuZXN0YWJsZSB0ZXh0IChtYXBzIHRvIGBiZXZ5X3VpOjpUZXh0YCAvIGBUZXh0U3BhbmApLiAqL1xuICAgIHRleHQ6IEJldnlUZXh0UHJvcHM7XG4gICAgLyoqIEEgZm9jdXNhYmxlLCBlZGl0YWJsZSB0ZXh0IGZpZWxkIChtYXBzIHRvIGBiZXZ5X3RleHQ6OkVkaXRhYmxlVGV4dGApLiAqL1xuICAgIGVkaXRhYmxlVGV4dDogQmV2eUVkaXRhYmxlVGV4dFByb3BzO1xuICB9XG59XG4iLCAiLy8gRGV2LW1vZGUgY291bnRlcnBhcnQgb2YgYGpzeC1ydW50aW1lLnRzYCAodXNlZCBieSBgXCJqc3hcIjogXCJyZWFjdC1qc3hkZXZcImAgYW5kXG4vLyBlc2J1aWxkJ3MgZGV2IGF1dG9tYXRpYyBydW50aW1lKS4gU2FtZSBgSlNYYCByZWdpc3RyeSwgUmVhY3QncyBkZXYgZmFjdG9yeS5cblxuaW1wb3J0IHR5cGUgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IHsgRnJhZ21lbnQsIGpzeERFViB9IGZyb20gXCJyZWFjdC9qc3gtZGV2LXJ1bnRpbWVcIjtcblxuaW1wb3J0IHR5cGUgeyBCZXZ5SW1hZ2VQcm9wcywgQmV2eU5vZGVQcm9wcywgQmV2eVRleHRQcm9wcyB9IGZyb20gXCIuL2pzeFwiO1xuXG5leHBvcnQgbmFtZXNwYWNlIEpTWCB7XG4gIGV4cG9ydCB0eXBlIEVsZW1lbnRUeXBlID0gUmVhY3QuSlNYLkVsZW1lbnRUeXBlO1xuICBleHBvcnQgaW50ZXJmYWNlIEVsZW1lbnQgZXh0ZW5kcyBSZWFjdC5KU1guRWxlbWVudCB7fVxuICBleHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRDbGFzcyBleHRlbmRzIFJlYWN0LkpTWC5FbGVtZW50Q2xhc3Mge31cbiAgZXhwb3J0IGludGVyZmFjZSBFbGVtZW50QXR0cmlidXRlc1Byb3BlcnR5XG4gICAgZXh0ZW5kcyBSZWFjdC5KU1guRWxlbWVudEF0dHJpYnV0ZXNQcm9wZXJ0eSB7fVxuICBleHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRDaGlsZHJlbkF0dHJpYnV0ZVxuICAgIGV4dGVuZHMgUmVhY3QuSlNYLkVsZW1lbnRDaGlsZHJlbkF0dHJpYnV0ZSB7fVxuICBleHBvcnQgdHlwZSBMaWJyYXJ5TWFuYWdlZEF0dHJpYnV0ZXM8QywgUD4gPVxuICAgIFJlYWN0LkpTWC5MaWJyYXJ5TWFuYWdlZEF0dHJpYnV0ZXM8QywgUD47XG4gIGV4cG9ydCBpbnRlcmZhY2UgSW50cmluc2ljQXR0cmlidXRlcyBleHRlbmRzIFJlYWN0LkpTWC5JbnRyaW5zaWNBdHRyaWJ1dGVzIHt9XG4gIGV4cG9ydCBpbnRlcmZhY2UgSW50cmluc2ljQ2xhc3NBdHRyaWJ1dGVzPFQ+IGV4dGVuZHMgUmVhY3QuSlNYXG4gICAgLkludHJpbnNpY0NsYXNzQXR0cmlidXRlczxUPiB7fVxuICBleHBvcnQgaW50ZXJmYWNlIEludHJpbnNpY0VsZW1lbnRzIHtcbiAgICBub2RlOiBCZXZ5Tm9kZVByb3BzO1xuICAgIGJ1dHRvbjogQmV2eU5vZGVQcm9wcztcbiAgICBpbWFnZTogQmV2eUltYWdlUHJvcHM7XG4gICAgdGV4dDogQmV2eVRleHRQcm9wcztcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFTYSxVQUFJLElBQUUsT0FBTyxJQUFJLGVBQWU7QUFBaEMsVUFBa0MsSUFBRSxPQUFPLElBQUksY0FBYztBQUE3RCxVQUErRCxJQUFFLE9BQU8sSUFBSSxnQkFBZ0I7QUFBNUYsVUFBOEYsSUFBRSxPQUFPLElBQUksbUJBQW1CO0FBQTlILFVB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QUFFLE9BQUssR0FBRyxRQUFPLEdBQUcsR0FBRSxHQUFFLEdBQUUsSUFBSTtBQUFFLGNBQUcsR0FBRyxDQUFDLEVBQUUsUUFBTyxJQUFFLEdBQUcsQ0FBQyxFQUFFLFFBQU8sSUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUUsSUFBRTtBQUFBLFlBQUc7QUFBQSxZQUNuZjtBQUFBLFlBQUU7QUFBQSxVQUFNLEdBQUUsR0FBRyxHQUFFLEdBQUUsR0FBRSxDQUFDO0FBQUUsY0FBRSxPQUFLLElBQUUsRUFBRTtBQUFZLGNBQUcsS0FBRyxHQUFFO0FBQUMsZ0JBQUU7QUFBRSxnQkFBRyxTQUFPLEdBQUU7QUFBQyxzQkFBTyxJQUFFLENBQUMsR0FBRTtBQUFBLGdCQUFDLEtBQUs7QUFBRSxzQkFBRTtBQUFFO0FBQUEsZ0JBQU0sS0FBSztBQUFHLHNCQUFFO0FBQUU7QUFBQSxnQkFBTSxLQUFLO0FBQUEsZ0JBQUcsS0FBSztBQUFBLGdCQUFJLEtBQUs7QUFBQSxnQkFBSSxLQUFLO0FBQUEsZ0JBQUksS0FBSztBQUFBLGdCQUFLLEtBQUs7QUFBQSxnQkFBSyxLQUFLO0FBQUEsZ0JBQUssS0FBSztBQUFBLGdCQUFLLEtBQUs7QUFBQSxnQkFBTSxLQUFLO0FBQUEsZ0JBQU0sS0FBSztBQUFBLGdCQUFNLEtBQUs7QUFBQSxnQkFBTyxLQUFLO0FBQUEsZ0JBQU8sS0FBSztBQUFBLGdCQUFPLEtBQUs7QUFBQSxnQkFBUSxLQUFLO0FBQUEsZ0JBQVEsS0FBSztBQUFBLGdCQUFRLEtBQUs7QUFBQSxnQkFBUSxLQUFLO0FBQUEsZ0JBQVMsS0FBSztBQUFBLGdCQUFTLEtBQUs7QUFBUyxzQkFBRTtBQUFHO0FBQUEsZ0JBQU0sS0FBSztBQUFVLHNCQUFFO0FBQVU7QUFBQSxnQkFBTTtBQUFRLHNCQUFFO0FBQUEsY0FBQztBQUFDLGtCQUFFLE9BQUssS0FBRyxFQUFFLGlCQUFlLE1BQUksSUFBRTtBQUFFLG9CQUFJLEtBQUcsTUFBSSxFQUFFLGNBQVksRUFBRSxZQUFVLEdBQUUsR0FBRyxHQUFFLENBQUMsR0FBRTtBQUFB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QUEsSUFDaEMsUUFBUSxLQUFvQixRQUFRO0FBQUEsSUFDcEMsT0FBTyxLQUFxQixPQUFPO0FBQUEsSUFDbkMsTUFBTSxLQUFvQixNQUFNO0FBQUEsRUFDbEM7OztBQzFOQSxNQUFBQyxnQkFBOEI7QUFtQzlCLFdBQVMsU0FBWSxNQUFjO0FBQ2pDLFdBQU8sQ0FBQyxVQUEyQjtBQUNqQyxZQUFNLEVBQUUsUUFBUSxRQUFRLE9BQU8sR0FBRyxLQUFLLElBQUk7QUFNM0MsaUJBQU8sNkJBQWMsTUFBZTtBQUFBLFFBQ2xDLEdBQUc7QUFBQSxRQUNILFFBQVEsRUFBRSxRQUFRLE9BQU8sTUFBTSxHQUFHLFFBQVEsTUFBTTtBQUFBLE1BQ2xELENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUVPLE1BQU0sV0FBVztBQUFBLElBQ3RCLE1BQU0sU0FBd0IsTUFBTTtBQUFBLElBQ3BDLFFBQVEsU0FBd0IsUUFBUTtBQUFBLElBQ3hDLE9BQU8sU0FBeUIsT0FBTztBQUFBLElBQ3ZDLE1BQU0sU0FBd0IsTUFBTTtBQUFBLEVBQ3RDOzs7QUNsRUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBV0EsMkJBQW9DOzs7QUNYcEM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtBLCtCQUFpQzs7O0FWRWpDLGFBQVcsZUFBZTtBQUFBLElBQ3hCLFNBQVM7QUFBQSxJQUNULHFCQUFxQjtBQUFBLElBQ3JCLHlCQUF5QjtBQUFBLElBQ3pCLGNBQWM7QUFBQSxJQUNkLDBCQUEwQjtBQUFBLElBQzFCLDhCQUE4QjtBQUFBLEVBQ2hDOyIsCiAgIm5hbWVzIjogWyJhIiwgImIiLCAiZXhwb3J0cyIsICJhIiwgImIiLCAiYyIsICJkIiwgImYiLCAiZSIsICJnIiwgImgiLCAiayIsICJsIiwgIm0iLCAidyIsICJSZWNvbmNpbGVyIiwgImltcG9ydF9yZWFjdCJdCn0K
