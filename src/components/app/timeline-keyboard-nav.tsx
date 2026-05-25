"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/* ============================================================================
 *  TimelineKeyboardNav
 *
 *  Vim-style keyboard navigation for the /dockets/[id] timeline.
 *
 *  Bindings:
 *    j / ↓ — next entry
 *    k / ↑ — previous entry
 *    g     — first entry
 *    G     — last entry
 *    /     — focus the page search input (browser-native Ctrl/Cmd+F still works)
 *
 *  Implementation notes:
 *   - Entry rows already render with `id="ent_…"` (from sample-data). We
 *     query those at keydown time so no schema change is needed.
 *   - All listeners attach to window and short-circuit when the active
 *     element is an input/textarea/contenteditable so typing isn't hijacked.
 *   - scrollIntoView + .focus({ preventScroll: true }) gives both visual
 *     parity and keyboard-driven a11y. The entry `<li>` gets `tabindex=-1`
 *     applied JIT so focus lands without polluting the tab order.
 *   - First keypress shows a one-time toast hint ("Use j/k to navigate")
 *     so the affordance is discoverable.
 * ==========================================================================*/

const ENTRY_SELECTOR = 'li[id^="ent_"]';
const HINT_KEY = "dl-docket-keynav-seen";

export function TimelineKeyboardNav() {
  useEffect(() => {
    let currentIdx = 0;
    let hinted = false;
    try {
      hinted = window.localStorage.getItem(HINT_KEY) === "1";
    } catch {
      // localStorage disabled — hint will show once per session
    }

    function entries(): HTMLLIElement[] {
      return Array.from(document.querySelectorAll<HTMLLIElement>(ENTRY_SELECTOR));
    }

    function focusAt(idx: number) {
      const list = entries();
      if (list.length === 0) return;
      currentIdx = Math.max(0, Math.min(idx, list.length - 1));
      const target = list[currentIdx];
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function showHintOnce() {
      if (hinted) return;
      hinted = true;
      try {
        window.localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* ignore */
      }
      toast("Keyboard navigation", {
        description: "j / k or ↓ / ↑ to move between entries. g / G for first / last.",
      });
    }

    function onKey(e: KeyboardEvent) {
      // Don't hijack typing
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      const editable =
        tag === "input" ||
        tag === "textarea" ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (editable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          showHintOnce();
          focusAt(currentIdx + 1);
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          showHintOnce();
          focusAt(currentIdx - 1);
          break;
        case "g":
          e.preventDefault();
          showHintOnce();
          focusAt(0);
          break;
        case "G":
          e.preventDefault();
          showHintOnce();
          focusAt(entries().length - 1);
          break;
        case "/": {
          const filter = document.querySelector<HTMLInputElement>(
            'input[type="search"], input[id="search-q"]'
          );
          if (filter) {
            e.preventDefault();
            filter.focus();
          }
          break;
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
