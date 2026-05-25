"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Copies the short `/p/<id>` URL for a watchlist to the clipboard.
 * The short path is friendlier for Slack/Twitter/SMS than the canonical
 * /watchlists/<id>/preview path; /p/{id} redirects there (see
 * src/app/p/[id]/route.ts).
 */
export function CopyShareLinkButton({ watchlistId }: { watchlistId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/p/${watchlistId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied", { description: url });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy — your browser blocked clipboard access");
    }
  }

  return (
    <Button
      variant="outline"
      size="md"
      onClick={copy}
      title="Copy the short /p/… share URL to your clipboard"
    >
      {copied ? (
        <Check className="size-4 text-[color:var(--color-success)]" />
      ) : (
        <Link2 className="size-4" />
      )}
      {copied ? "Copied" : "Copy share link"}
    </Button>
  );
}
