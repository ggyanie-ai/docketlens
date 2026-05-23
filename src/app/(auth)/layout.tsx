import Link from "next/link";
import { Wordmark } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1">
      <div className="flex w-full lg:w-[480px] flex-col p-6 lg:p-12">
        <Link href={"/" as never} className="mb-12 inline-flex ring-focus rounded">
          <Wordmark />
        </Link>
        <div className="flex flex-col justify-center flex-1 max-w-sm w-full mx-auto">
          {children}
        </div>
        <p className="mt-12 text-xs text-[color:var(--color-fg-subtle)]">
          © {new Date().getFullYear()} DocketLens.
        </p>
      </div>
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-l border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid opacity-50 mask-fade-y"
        />
        <div className="relative z-10 flex flex-col justify-end p-12 max-w-md">
          <figure>
            <blockquote className="font-serif text-2xl leading-snug">
              &ldquo;It&apos;s a litigation Bloomberg I can actually
              afford. Saves me an hour every morning.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm text-[color:var(--color-fg-muted)]">
              <span className="font-medium text-[color:var(--color-fg)]">
                Senior reporter
              </span>{" "}
              — financial newsroom
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
