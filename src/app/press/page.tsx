import Link from "next/link";
import { Download, Mail, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { CopyButton } from "@/components/app/copy-button";

export const metadata = {
  title: "Press kit",
  description:
    "Logos, brand colors, founder quote, screenshots, and boilerplate copy for journalists writing about DocketLens.",
};

const COLORS = [
  { name: "Background (dark)", value: "oklch(13% 0.012 260)", hex: "#0F1115" },
  { name: "Background (light)", value: "oklch(98.7% 0.005 80)", hex: "#FBF9F4" },
  { name: "Foreground (dark)", value: "oklch(96% 0.008 80)", hex: "#F4F4EF" },
  { name: "Foreground (light)", value: "oklch(20% 0.015 260)", hex: "#1B1F2A" },
  { name: "Accent — gavel amber", value: "oklch(78% 0.165 70)", hex: "#FFB454" },
  { name: "Accent dark — bronze", value: "oklch(58% 0.140 55)", hex: "#C97A2D" },
  { name: "Primary — courthouse navy", value: "oklch(38% 0.090 260)", hex: "#2C3E70" },
];

const ASSETS = [
  {
    label: "Logo · light backgrounds",
    file: "/press/docketlens-logo-light.svg",
    bg: "light" as const,
  },
  {
    label: "Logo · dark backgrounds",
    file: "/press/docketlens-logo-dark.svg",
    bg: "dark" as const,
  },
  {
    label: "Wordmark · light backgrounds",
    file: "/press/docketlens-wordmark-light.svg",
    bg: "light" as const,
    wide: true,
  },
  {
    label: "Wordmark · dark backgrounds",
    file: "/press/docketlens-wordmark-dark.svg",
    bg: "dark" as const,
    wide: true,
  },
];

const SCREENSHOTS = [
  { label: "Landing", href: "/", subtitle: "Hero with live docket stream + stats" },
  { label: "Dashboard", href: "/dashboard", subtitle: "KPIs, 30-day chart, court × month heatmap" },
  { label: "Search", href: "/search", subtitle: "Faceted court / NOS filters + hover preview" },
  { label: "Docket detail", href: "/dockets/dkt_helios_v_northgate", subtitle: "Timeline + AI exec brief flow" },
  { label: "Watchlists", href: "/watchlists", subtitle: "Card grid + 4-step creation" },
  { label: "Pricing", href: "/pricing", subtitle: "Three tiers + feature comparison" },
];

const BOILERPLATE = `DocketLens is the Bloomberg Terminal for federal court dockets — a \
beautifully designed, AI-summarized litigation intelligence product for the \
people who can't afford a $50,000-a-year Lex Machina or Bloomberg Law seat. \
Built on the public RECAP archive (Free Law Project), DocketLens caches and \
enriches every federal docket, then watches the parties, judges, and law firms \
that matter to its users — pushing AI-summarized alerts to email, Slack, and \
webhook channels. Free tier with no credit card required; Pro at $49/mo; Team \
at $199/mo for whole firms and newsrooms.`;

export default function PressPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-12">
          <p className="eyebrow mb-4">Press kit</p>
          <h1 className="display-1 max-w-4xl">
            Everything you need to write about{" "}
            <span className="italic text-[color:var(--color-accent)]">
              DocketLens.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Logos, brand colors, founder quote, screenshots, and boilerplate.
            For interviews or anything not covered below, email{" "}
            <a
              href="mailto:press@docketlens.ai"
              className="text-[color:var(--color-fg)] underline underline-offset-2"
            >
              press@docketlens.ai
            </a>
            .
          </p>
        </section>

        {/* Quick facts */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[color:var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {[
              { k: "Product", v: "DocketLens" },
              { k: "Founded", v: "2026" },
              { k: "Status", v: "Private beta" },
              { k: "HQ", v: "Remote · United States" },
              { k: "Funding", v: "Bootstrapped" },
              { k: "Team", v: "Solo founder" },
              { k: "Data source", v: "RECAP / CourtListener" },
              { k: "Pricing", v: "Free · $49 · $199" },
            ].map((f) => (
              <Card
                key={f.k}
                className="rounded-none border-0 bg-[color:var(--color-bg)] p-5"
              >
                <p className="eyebrow mb-2">{f.k}</p>
                <p className="text-base font-medium">{f.v}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Boilerplate */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <h2 className="font-serif text-2xl tracking-tight mb-4">
            Boilerplate copy
          </h2>
          <Card className="p-6 md:p-8 relative">
            <p className="font-serif text-[17px] leading-[1.75] text-[color:var(--color-fg)]">
              {BOILERPLATE}
            </p>
            <CopyButton text={BOILERPLATE} />
          </Card>
        </section>

        {/* Brand assets */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="font-serif text-2xl tracking-tight">Brand assets</h2>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-xl">
                SVG only. Please don&apos;t recolor or redraw — if you need a
                different variant, email us and we&apos;ll make one.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ASSETS.map((a) => (
              <Card
                key={a.file}
                className={`p-6 flex flex-col gap-4 ${
                  a.wide ? "" : ""
                }`}
              >
                <div
                  className={`flex h-44 items-center justify-center rounded-[var(--radius-md)] border ${
                    a.bg === "dark"
                      ? "bg-[color:var(--color-bg)] border-[color:var(--color-border-strong)] [color-scheme:dark]"
                      : "bg-[#FBF9F4] border-[color:var(--color-border)]"
                  }`}
                  style={{ backgroundColor: a.bg === "dark" ? "#0F1115" : "#FBF9F4" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.file}
                    alt=""
                    className={a.wide ? "h-16" : "h-20 w-20"}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)] truncate">
                      {a.file}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={a.file} download>
                      <Download className="size-3.5" />
                      SVG
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Brand colors */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2 className="font-serif text-2xl tracking-tight mb-1">
            Brand colors
          </h2>
          <p className="text-sm text-[color:var(--color-fg-muted)] mb-6">
            Click any value to copy. Token names live in{" "}
            <code className="font-mono text-xs">src/app/globals.css</code>.
          </p>
          <Card className="overflow-hidden">
            <table className="w-full">
              <caption className="sr-only">
                DocketLens brand color palette in OKLCH and hex.
              </caption>
              <thead>
                <tr className="bg-[color:var(--color-bg-subtle)]/40">
                  <th scope="col" className="text-left px-6 py-3 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] font-medium">
                    Swatch
                  </th>
                  <th scope="col" className="text-left px-6 py-3 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] font-medium">
                    Name
                  </th>
                  <th scope="col" className="text-left px-6 py-3 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] font-medium">
                    OKLCH (source)
                  </th>
                  <th scope="col" className="text-left px-6 py-3 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] font-medium">
                    Hex (approx)
                  </th>
                </tr>
              </thead>
              <tbody>
                {COLORS.map((c) => (
                  <tr
                    key={c.name}
                    className="border-t border-[color:var(--color-border)]"
                  >
                    <td className="px-6 py-3">
                      <span
                        aria-hidden
                        className="block size-7 rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)]"
                        style={{ background: c.value }}
                      />
                    </td>
                    <th
                      scope="row"
                      className="px-6 py-3 text-sm font-medium text-left"
                    >
                      {c.name}
                    </th>
                    <td className="px-6 py-3 font-mono text-xs text-[color:var(--color-fg-muted)]">
                      {c.value}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-[color:var(--color-fg-muted)]">
                      {c.hex}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* Founder quote */}
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <h2 className="font-serif text-2xl tracking-tight mb-4">
            Founder quote
          </h2>
          <Card className="p-8 md:p-10">
            <figure>
              <blockquote className="font-serif text-2xl md:text-3xl leading-snug text-[color:var(--color-fg)]">
                &ldquo;Public court records should be searchable, watchable, and
                AI-summarized by anyone — not just the firms that can spend
                fifty thousand dollars a year on Lex Machina. DocketLens is the
                middle that didn&apos;t exist.&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm text-[color:var(--color-fg-muted)]">
                <span className="font-medium text-[color:var(--color-fg)]">
                  GG Yanie
                </span>{" "}
                — Founder, DocketLens
              </figcaption>
            </figure>
          </Card>
        </section>

        {/* Screenshots */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="font-serif text-2xl tracking-tight">
                Product screenshots
              </h2>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-xl">
                We&apos;re shipping renders progressively. In the meantime,
                click any tile to view the live page and capture your own
                — or email us for canonical 2× PNGs.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCREENSHOTS.map((s) => (
              <Link
                key={s.href}
                href={s.href as never}
                target="_blank"
                className="group block"
              >
                <Card className="overflow-hidden hover:border-[color:var(--color-border-strong)] hover:shadow-soft transition-all">
                  <div
                    aria-hidden
                    className="relative h-44 bg-gradient-to-br from-[color:var(--color-bg-subtle)] to-[color:var(--color-bg)] border-b border-[color:var(--color-border)] flex items-center justify-center"
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-grid opacity-30 mask-fade-y"
                    />
                    <Logo size={42} />
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="mt-1 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
                      {s.subtitle}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-[color:var(--color-fg-subtle)] uppercase tracking-wider group-hover:text-[color:var(--color-accent)] transition-colors inline-flex items-center gap-1">
                      Open live page
                      <ArrowUpRight className="size-3" />
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-8 md:p-10 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-soft">
                <Mail className="size-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-2xl tracking-tight">
                  Want an interview or a comment?
                </h2>
                <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)] leading-relaxed">
                  We respond to all press inquiries within 24 hours.
                </p>
                <p className="mt-4 font-mono text-sm">
                  <a
                    href="mailto:press@docketlens.ai"
                    className="text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)] transition-colors underline underline-offset-4"
                  >
                    press@docketlens.ai
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

