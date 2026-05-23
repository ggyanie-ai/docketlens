import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveDocketStream } from "@/components/marketing/live-docket-stream";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background ornament */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid mask-fade-y opacity-40"
      />
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 h-[520px] w-[1100px] rounded-full blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <div className="flex flex-col gap-7 animate-fade-in-up">
            <Badge variant="accent" className="self-start">
              <Sparkles className="size-3" /> Now in private beta
            </Badge>

            <h1 className="display-1 text-[color:var(--color-fg)]">
              The{" "}
              <span className="italic text-[color:var(--color-accent)]">
                Bloomberg Terminal
              </span>{" "}
              for federal court dockets.
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-[color:var(--color-fg-muted)] max-w-xl">
              Watch any party, judge, or law firm across the federal courts.
              Every new filing comes with an AI-summarized digest in your inbox
              — so you can skip the per-page PACER bill and the 1995 UX.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild variant="accent" size="xl">
                <Link href={"/signup" as never}>
                  Claim a watchlist — free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href={"/demo" as never}>See live demo</Link>
              </Button>
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-sm text-[color:var(--color-fg-muted)]">
              <li className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[color:var(--color-success)]" />
                Free tier · no card needed
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[color:var(--color-success)]" />
                Built on public RECAP data
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[color:var(--color-success)]" />
                Email + webhook alerts
              </li>
            </ul>
          </div>

          <div className="relative">
            <LiveDocketStream />
          </div>
        </div>
      </div>
    </section>
  );
}
