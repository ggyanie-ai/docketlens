"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Click-to-fire signed sample delivery (loopback to /api/demo/echo).
 * Surfaces the round-trip latency + signature-verification result via
 * sonner so the user sees that the wiring is real, not just decorative.
 */
export function SendTestWebhookButton() {
  const [busy, setBusy] = useState(false);

  async function fire() {
    setBusy(true);
    const id = toast.loading("Firing test webhook…");
    try {
      const r = await fetch("/api/demo/test-webhook", { method: "POST" });
      const j = (await r.json()) as {
        status: number;
        latency_ms: number;
        ok: boolean;
        signature_valid: boolean;
        payload_bytes: number;
        delivery_id: string;
        error: string | null;
      };
      if (j.ok && j.signature_valid) {
        toast.success(
          `Delivered in ${j.latency_ms} ms · HMAC verified · ${j.payload_bytes} bytes`,
          { id, description: j.delivery_id }
        );
      } else if (j.ok) {
        toast.warning(
          `HTTP ${j.status} in ${j.latency_ms} ms — signature did not verify`,
          { id, description: j.delivery_id }
        );
      } else {
        toast.error(
          j.error ?? `Delivery failed (HTTP ${j.status})`,
          { id, description: j.delivery_id }
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Network error", { id });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant="accent"
      size="sm"
      onClick={fire}
      disabled={busy}
      title="Fire a signed sample event at the loopback echo handler"
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      Send a test webhook
    </Button>
  );
}
