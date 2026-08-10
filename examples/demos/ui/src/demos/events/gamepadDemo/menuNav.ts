// Pure navigation logic for the game-like menu: state shape, input-name to
// action mapping, and the reducer with its clamping rules. No React, no
// side effects — the demo's dispatch layer owns rumble/pulse.

import type { MenuPage } from "./menuData";

export type NavState = {
  page: number;
  col: number;
  row: number;
  /** Last-activated item per page, key "col:row" — persistent highlight. */
  selected: Record<number, string>;
};

export const INITIAL_NAV: NavState = { page: 0, col: 0, row: 0, selected: {} };

export type NavAction =
  | { kind: "page"; dir: -1 | 1 }
  | { kind: "gotoPage"; index: number }
  | { kind: "col"; dir: -1 | 1 }
  | { kind: "row"; dir: -1 | 1 }
  | { kind: "focus"; col: number; row: number }
  | { kind: "activate" }
  | { kind: "activateAt"; col: number; row: number };

/** Digital direction of an analog axis value: past +-0.5 or centered. */
export function axisDir(value: number): -1 | 0 | 1 {
  if (value >= 0.5) return 1;
  if (value <= -0.5) return -1;
  return 0;
}

/** Menu action for a button's pressed rising edge, if it has one. */
export function actionForButton(name: string): NavAction | null {
  switch (name) {
    case "dPadLeft":
      return { kind: "col", dir: -1 };
    case "dPadRight":
      return { kind: "col", dir: 1 };
    case "dPadUp":
      return { kind: "row", dir: -1 };
    case "dPadDown":
      return { kind: "row", dir: 1 };
    case "south":
      return { kind: "activate" };
    case "leftTrigger":
      return { kind: "page", dir: -1 };
    case "rightTrigger":
      return { kind: "page", dir: 1 };
    default:
      return null;
  }
}

/**
 * Menu action for an axis crossing into a direction. Vertical axes invert:
 * Bevy sticks are up = +1, and "up" means the previous row.
 */
export function actionForAxis(name: string, dir: -1 | 1): NavAction | null {
  switch (name) {
    case "leftStickX":
    case "rightStickX":
      return { kind: "col", dir };
    case "leftStickY":
    case "rightStickY":
      return { kind: "row", dir: dir === 1 ? -1 : 1 };
    default:
      return null;
  }
}

const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max));

/**
 * Apply one action. Pages wrap (focus resets to the first item); column moves
 * clamp and re-clamp the row to the new column's length; row moves clamp
 * within the column; activation records a persistent per-page selection.
 */
export function applyAction(
  state: NavState,
  action: NavAction,
  pages: MenuPage[],
): NavState {
  switch (action.kind) {
    case "page": {
      const page = (state.page + action.dir + pages.length) % pages.length;
      return { ...state, page, col: 0, row: 0 };
    }
    case "gotoPage": {
      if (action.index === state.page) return state;
      return { ...state, page: action.index, col: 0, row: 0 };
    }
    case "col": {
      const columns = pages[state.page].columns;
      const col = clamp(state.col + action.dir, columns.length - 1);
      const row = clamp(state.row, columns[col].items.length - 1);
      return { ...state, col, row };
    }
    case "row": {
      const column = pages[state.page].columns[state.col];
      const row = clamp(state.row + action.dir, column.items.length - 1);
      return { ...state, row };
    }
    case "focus":
      return { ...state, col: action.col, row: action.row };
    case "activate":
      return {
        ...state,
        selected: {
          ...state.selected,
          [state.page]: `${state.col}:${state.row}`,
        },
      };
    case "activateAt":
      return {
        ...state,
        col: action.col,
        row: action.row,
        selected: {
          ...state.selected,
          [state.page]: `${action.col}:${action.row}`,
        },
      };
  }
}
