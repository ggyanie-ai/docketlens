"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Global error boundary:", error);
    }
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-20 md:py-32 text-center">
        <p className="eyebrow mb-4">Something broke</p>
        <h1 className="display-1">
          We caught it{" "}
          <span className="italic text-[color:var(--color-accent)]">
            mid-filing.
          </span>
        </h1>
        <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
          A handler threw an exception while rendering this page. The error
          has been logged. You can try again, or head somewhere stable.
        </p>
        {error.digest && (
          <p className="mt-4 text-xs font-mono text-[color:var(--color-fg-subtle)]">
            Trace id: {error.digest}
          </p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="accent" size="lg">
            Retry
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={"/" as never}>Back to home</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
