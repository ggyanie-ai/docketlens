import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

/* ============================================================================
 *  GET /api/og?theme=light|dark
 *
 *  Theme-able Open Graph generator. The canonical /opengraph-image stays
 *  dark (matches DocketLens's marketing default) and gets used in standard
 *  SERP unfurls. Embedders who paste our links into light-mode editorial
 *  sites can swap in /api/og?theme=light for a brighter card that doesn't
 *  fight their layout.
 *
 *  Same 1200x630 dimensions, same copy, only the palette changes. PNG
 *  output, 1-day public cache.
 * ==========================================================================*/

const DARK = {
  bg: "linear-gradient(140deg, oklch(13% 0.012 260) 0%, oklch(20% 0.030 250) 70%, oklch(28% 0.060 60) 130%)",
  fg: "white",
  fgMuted: "rgba(255,255,255,0.7)",
  fgSubtle: "rgba(255,255,255,0.55)",
  eyebrow: "rgba(255,255,255,0.6)",
  accent: "oklch(78% 0.165 70)",
};

const LIGHT = {
  bg: "linear-gradient(140deg, oklch(98% 0.005 250) 0%, oklch(95% 0.010 70) 70%, oklch(92% 0.015 60) 130%)",
  fg: "oklch(18% 0.020 250)",
  fgMuted: "oklch(40% 0.020 250)",
  fgSubtle: "oklch(58% 0.020 250)",
  eyebrow: "oklch(50% 0.030 250)",
  accent: "oklch(56% 0.180 70)",
};

export async function GET(req: NextRequest) {
  const theme = req.nextUrl.searchParams.get("theme") === "light" ? LIGHT : DARK;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: theme.bg,
          color: theme.fg,
          fontFamily: "Georgia, serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: theme.eyebrow,
            fontSize: 22,
            fontFamily: "ui-sans-serif, system-ui",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          DOCKETLENS
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              fontFamily: "Georgia, serif",
              letterSpacing: -2,
              maxWidth: 980,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>The Bloomberg Terminal</span>
            <span style={{ color: theme.accent, fontStyle: "italic" }}>
              for federal court dockets.
            </span>
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: theme.fgMuted,
              fontFamily: "ui-sans-serif, system-ui",
              maxWidth: 880,
              display: "flex",
            }}
          >
            Beautiful. AI-summarized. Free tier, no card.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: theme.fgSubtle,
            fontSize: 20,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <span>docketlens.ai</span>
          <span>Built on RECAP · public-record data</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "cache-control": "public, max-age=86400, stale-while-revalidate=86400",
      },
    }
  );
}
