"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/* ============================================================================
 *  WatchlistDeleteButton
 *
 *  Soft-delete with an undo affordance. Mirrors the Gmail "Message moved
 *  to Trash · Undo" pattern. Sequence:
 *
 *    1. User clicks Delete → button shows a loading state.
 *    2. Sonner toast appears with "Undo" action that stays for 6s.
 *    3a. If user clicks Undo: button resets, no network call would have
 *        landed (we don't fire the destructive call until after the
 *        toast's 6s window elapses).
 *    3b. Otherwise: after 6s the destructive call goes out (today: a
 *        toast confirmation; Tuesday: DELETE /api/v1/watchlists/{id}).
 *
 *  Today the destructive call is a stub — we don't have a real
 *  signed-in user to bind to a row yet. The pattern is the load-bearing
 *  part; swapping the stub for the real fetch is one line when auth
 *  wires.
 * ==========================================================================*/

export function WatchlistDeleteButton({
  watchlistId,
  watchlistName,
}: {
  watchlistId: string;
  watchlistName: string;
}) {
  const [pending, setPending] = useState(false);

  function onClick() {
    if (pending) return;
    setPending(true);

    // Schedule the real delete to land after the undo window elapses.
    const timer = setTimeout(async () => {
      // TODO Tuesday: replace this stub with
      //   await fetch(`/api/v1/watchlists/${watchlistId}`, {
      //     method: "DELETE",
      //     headers: { Authorization: `Bearer ${token}` },
      //   });
      toast.success("Watchlist deleted", {
        description: `"${watchlistName}" is gone. You can re-create it from /watchlists/new.`,
      });
      setPending(false);
    }, 6_000);

    toast(`"${watchlistName}" will be deleted`, {
      description: "Undo within 6 seconds.",
      duration: 6_000,
      action: {
        label: "Undo",
        onClick: () => {
          clearTimeout(timer);
          setPending(false);
          toast("Delete cancelled", {
            description: `"${watchlistName}" is safe.`,
          });
        },
      },
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      onClick={onClick}
      disabled={pending}
      aria-label={`Delete ${watchlistName}`}
      className="text-[color:var(--color-danger)] hover:text-[color:var(--color-danger)] hover:border-[color:var(--color-danger)]"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
