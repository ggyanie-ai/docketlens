import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DocketLens — AI court docket intelligence";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(140deg, oklch(13% 0.012 260) 0%, oklch(20% 0.030 250) 70%, oklch(28% 0.060 60) 130%)",
          color: "white",
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
            color: "rgba(255,255,255,0.6)",
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
            <span style={{ color: "oklch(78% 0.165 70)", fontStyle: "italic" }}>
              for federal court dockets.
            </span>
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.7)",
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
            color: "rgba(255,255,255,0.55)",
            fontSize: 20,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <span>docketlens.ai</span>
          <span>Built on RECAP · public-record data</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
