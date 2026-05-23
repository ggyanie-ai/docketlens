"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Boilerplate copied", {
        description: `${text.length} characters on your clipboard.`,
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy", {
        description: "Browser denied clipboard access. Select + copy manually.",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Copy boilerplate"
      className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-2.5 py-1.5 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:border-[color:var(--color-accent)] transition-colors"
    >
      {copied ? (
        <>
          <Check className="size-3 text-[color:var(--color-success)]" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  );
}
