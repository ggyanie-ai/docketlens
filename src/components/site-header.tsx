import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/#features", label: "Features" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="DocketLens home" className="ring-focus rounded-md">
            <Wordmark />
          </Link>
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href as never}
                className="text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors ring-focus rounded"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={"/login" as never}>Sign in</Link>
          </Button>
          <Button asChild variant="accent" size="sm">
            <Link href={"/signup" as never}>Get early access</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
