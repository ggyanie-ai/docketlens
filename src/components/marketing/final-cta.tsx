import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-dots opacity-40"
      />
      <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32 text-center">
        <h2 className="display-1">
          Stop scrolling PACER.{" "}
          <span className="italic text-[color:var(--color-accent)]">
            Start watching what matters.
          </span>
        </h2>
        <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed">
          Free tier is genuinely free. Five watchlists, daily digest, no card.
          Upgrade when you&apos;re ready. Most users do, within two weeks.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="accent" size="xl">
            <Link href={"/signup" as never}>
              Get early access
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href={"/demo" as never}>See live demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
