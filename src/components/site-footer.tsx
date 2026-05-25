import Link from "next/link";
import { Wordmark } from "@/components/logo";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#use-cases", label: "Use cases" },
      { href: "/pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/api-reference", label: "API reference" },
      { href: "/blog", label: "Blog" },
      { href: "/changelog", label: "Changelog" },
      { href: "/feeds", label: "Feeds" },
      { href: "/comparison", label: "Comparisons" },
      { href: "/legal/data-sources", label: "Data sources" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/press", label: "Press kit" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--color-border)] mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <Link
              href={"/" as never}
              className="group inline-flex items-center w-fit"
              aria-label="DocketLens — home"
            >
              <Wordmark
                className="
                  [&_.dl-word]:relative
                  [&_.dl-word]:after:content-['']
                  [&_.dl-word]:after:absolute
                  [&_.dl-word]:after:left-0
                  [&_.dl-word]:after:-bottom-0.5
                  [&_.dl-word]:after:h-px
                  [&_.dl-word]:after:w-0
                  [&_.dl-word]:after:bg-[color:var(--color-accent)]
                  [&_.dl-word]:after:transition-[width]
                  [&_.dl-word]:after:duration-200
                  group-hover:[&_.dl-word]:after:w-full
                "
              />
            </Link>
            <p className="text-sm text-[color:var(--color-fg-muted)] max-w-xs leading-relaxed">
              AI court intelligence built on public docket data. Watch the cases
              that matter. Skip PACER&apos;s per-page fees and 1995 UX.
            </p>
            <p className="text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)]">
              Made with care for lawyers, journalists, and investors.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-[10.5px] uppercase tracking-[0.18em] font-medium text-[color:var(--color-fg-subtle)] mb-3">
                {c.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href as never}
                      className="text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-8 border-t border-[color:var(--color-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-[color:var(--color-fg-subtle)]">
            © {new Date().getFullYear()} DocketLens. Public-docket data sourced
            from CourtListener (Free Law Project). Not legal advice.
          </p>
          <p className="text-xs text-[color:var(--color-fg-subtle)] font-mono">
            v0.1.0 · build {process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"}
          </p>
        </div>
      </div>
    </footer>
  );
}
