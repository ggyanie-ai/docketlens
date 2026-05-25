import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { Button } from "@/components/ui/button";

/**
 * In-app 404 — renders inside the (app) sidebar+topbar shell so the
 * user stays oriented when an unknown docket/watchlist id is followed.
 * The marketing 404 at /src/app/not-found.tsx still handles public
 * pages (it doesn't share the in-app chrome).
 */
export default function AppNotFound() {
  return (
    <>
      <Topbar title="Not found" />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <div className="mx-auto mb-6 inline-flex size-14 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]">
            <FileQuestion className="size-6 text-[color:var(--color-fg-muted)]" />
          </div>
          <p className="eyebrow mb-3">404 · in-app</p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
            That record isn&apos;t in the cache.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-fg-muted)]">
            The docket, watchlist, or page you tried to open doesn&apos;t
            exist — it may have been deleted, the id mistyped, or you may
            need to refresh after a recent rename.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent" size="md">
              <Link href={"/dashboard" as never}>
                <ArrowLeft className="size-3.5" />
                Back to dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href={"/search" as never}>Search dockets</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href={"/watchlists" as never}>All watchlists</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
