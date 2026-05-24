import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipToContent } from "@/components/skip-to-content";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://docketlens.ai"),
  title: {
    default: "DocketLens — AI court docket intelligence",
    template: "%s — DocketLens",
  },
  description:
    "Beautiful, AI-summarized federal court dockets. Watch any party, judge, or law firm — get a digest the next morning. The PACER alternative.",
  applicationName: "DocketLens",
  authors: [{ name: "DocketLens" }],
  keywords: [
    "PACER",
    "federal court dockets",
    "litigation intelligence",
    "case monitoring",
    "court filings",
    "legal AI",
    "RECAP",
    "patent litigation",
    "securities litigation",
  ],
  openGraph: {
    title: "DocketLens — AI court docket intelligence",
    description:
      "AI-summarized federal court dockets. Watch any party, judge, or law firm.",
    url: "https://docketlens.ai",
    siteName: "DocketLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocketLens",
    description: "AI-summarized federal court dockets.",
  },
};

/* ============================================================================
 *  Feed auto-discovery
 *
 *  Emitted as raw <link> tags inside root <head> rather than via
 *  `metadata.alternates.types` because per-page `alternates` (e.g.
 *  /demo/[id]'s oEmbed discovery) replaces the entire `alternates` block
 *  rather than merging its `types` map. Inline tags survive any per-page
 *  metadata.
 * ==========================================================================*/

const FEEDS = [
  { type: "application/rss+xml", href: "/blog/feed.xml", title: "DocketLens blog (RSS)" },
  { type: "application/rss+xml", href: "/changelog/feed.xml", title: "DocketLens changelog (RSS)" },
  { type: "application/atom+xml", href: "/blog/feed.atom", title: "DocketLens blog (Atom)" },
  { type: "application/atom+xml", href: "/changelog/feed.atom", title: "DocketLens changelog (Atom)" },
  { type: "application/feed+json", href: "/blog/feed.json", title: "DocketLens blog (JSON Feed)" },
  { type: "application/feed+json", href: "/changelog/feed.json", title: "DocketLens changelog (JSON Feed)" },
] as const;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        {FEEDS.map((f) => (
          <link
            key={f.href}
            rel="alternate"
            type={f.type}
            href={f.href}
            title={f.title}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
        <SkipToContent />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
          <Toaster
            theme="system"
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "!bg-[color:var(--color-bg-elevated)] !border !border-[color:var(--color-border)] !text-[color:var(--color-fg)] !rounded-[var(--radius-md)]",
                description: "!text-[color:var(--color-fg-muted)]",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
