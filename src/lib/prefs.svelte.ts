// Per-browser view preferences that more than one component reads (UX.md §10.1 View).

/** How equipment is worked: drawn as equipment (Operate, Close-up) or with plain fields and buttons. Both are complete. */
export type ControlStyle = "drawn" | "plain";

const KEY = "view.controls";

function stored(): ControlStyle {
  try {
    return localStorage.getItem(KEY) === "plain" ? "plain" : "drawn";
  } catch {
    return "drawn";
  }
}

export const prefs = $state({ controls: stored() });

export function setControls(style: ControlStyle) {
  prefs.controls = style;
  try {
    localStorage.setItem(KEY, style);
  } catch {}
}
