import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { DidYouMean } from "@/components/app/did-you-mean";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-20 md:py-32 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="display-1">
          That docket is{" "}
          <span className="italic text-[color:var(--color-accent)]">
            not on file.
          </span>
        </h1>
        <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
          The page you tried to reach either moved, was never written, or is
          sealed under protective order. Possibly all three.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="accent" size="lg">
            <Link href={"/" as never}>Back to home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={"/search" as never}>Search dockets</Link>
          </Button>
        </div>

        {/* Client island: ranks the requested path against the curated
            public-route pool and surfaces up to 3 close matches. */}
        <DidYouMean />
      </main>
      <SiteFooter />
    </>
  );
}
