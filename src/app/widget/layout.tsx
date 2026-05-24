import type { Metadata } from "next";
import "./widget.css";

export const metadata: Metadata = {
  title: "DocketLens widget",
  description: "Embeddable federal court docket card.",
  robots: { index: false, follow: false },
};

/* ============================================================================
 *  Widget layout
 *
 *  Embeddable, iframe-friendly chrome. No site header, no footer, no auth.
 *  Sets its own font-face-loading + color tokens via /widget/widget.css so it
 *  works regardless of the host page's CSS.
 *
 *  HTTP-level framing permission is set in next.config.ts:
 *  `Content-Security-Policy: frame-ancestors *` on /widget/:path*.
 * ==========================================================================*/

export default function WidgetLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="docketlens-widget-root" data-theme="auto">
      {children}
    </div>
  );
}
