"use client";

import type { KeyboardEvent, MouseEvent } from "react";

/* ============================================================================
 *  SkipToContent — first focusable element on every page.
 *
 *  Visually hidden until focused. Activating it finds the page's first
 *  `<main>` element, sets a -1 tabIndex on it, and moves focus there. This
 *  keeps the skip link working on every route without forcing each page to
 *  add an id="main-content" anchor.
 * ==========================================================================*/

export function SkipToContent() {
  function jump(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    const main = document.querySelector("main");
    if (main instanceof HTMLElement) {
      main.tabIndex = -1;
      main.focus({ preventScroll: false });
    }
  }

  return (
    <a
      href="#main"
      onClick={jump}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") jump(e);
      }}
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:px-3 focus-visible:py-2 focus-visible:rounded-[var(--radius-md)] focus-visible:bg-[color:var(--color-accent)] focus-visible:text-[color:var(--color-accent-fg)] focus-visible:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-fg)]/40"
    >
      Skip to main content
    </a>
  );
}
