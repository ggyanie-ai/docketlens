"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

/* ============================================================================
 *  CopyLinkButton
 *
 *  Inline pill button that copies a share URL to the clipboard. On mobile,
 *  prefers the native share sheet via `navigator.share` when available.
 *  Distinct from the absolute-positioned CopyButton in copy-button.tsx —
 *  this one's meant to sit inline in card headers.
 * ==========================================================================*/

export function CopyLinkButton({
  url,
  title,
  label = "Copy share URL",
}: {
  url: string;
  /** Optional title used by the native share sheet on mobile. */
  title?: string;
  /** Button label override. */
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    // Prefer the native share sheet on mobile / supported browsers.
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ url, title });
        return;
      } catch {
        // User cancelled or share unsupported — fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied", {
        description: "Paste it anywhere — no auth needed to view.",
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy", {
        description: "Clipboard access denied. Select + copy manually.",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-1 text-xs text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-fg)] transition-colors"
    >
      {copied ? (
        <>
          <Check className="size-3 text-[color:var(--color-success)]" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="size-3" />
          {label}
        </>
      )}
    </button>
  );
}
