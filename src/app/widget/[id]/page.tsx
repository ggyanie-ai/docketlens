import type { Metadata } from "next";
import { SAMPLE_DOCKETS } from "@/lib/sample-data";

export const runtime = "nodejs";
export const dynamic = "force-static";

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const d = SAMPLE_DOCKETS.find((x) => x.id === id);
  return {
    title: d ? `${d.caseNameShort} — widget` : "DocketLens widget",
    robots: { index: false, follow: false },
  };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ============================================================================
 *  /widget/[id] — embeddable docket card
 *
 *  Dropped into any blog or news article via:
 *      <iframe src="https://docketlens.ai/widget/dkt_…"
 *              width="560" height="420" loading="lazy"
 *              referrerpolicy="no-referrer-when-downgrade"
 *              style="border:0;border-radius:12px;"></iframe>
 *
 *  Renders a compact case card: court, case name, docket number, filed
 *  date, judge, NOS, the three most recent docket entries, and a "Powered
 *  by DocketLens" attribution link. Always extractive — never anything
 *  invented; just a restatement of what's on the docket.
 *
 *  Framing permission is set at the HTTP layer in next.config.ts:
 *  `Content-Security-Policy: frame-ancestors *` for the /widget/:path*
 *  prefix. No X-Frame-Options is set on this route.
 * ==========================================================================*/
export default async function WidgetCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = SAMPLE_DOCKETS.find((x) => x.id === id);

  if (!d) {
    return (
      <p className="dlw-error">
        <strong>Case not found.</strong> The widget link may be stale.{" "}
        <a href={SITE}>docketlens.ai</a>
      </p>
    );
  }

  const recent = [...d.entries]
    .sort((a, b) => b.dateFiled.localeCompare(a.dateFiled))
    .slice(0, 3);

  const href = `${SITE}/demo/${d.id}`;

  return (
    <article aria-label={`DocketLens widget — ${d.caseName}`}>
      <div className="dlw-eyebrow">
        <span className="dlw-dot" aria-hidden />
        <span>
          {d.court} · {d.caseNumber}
        </span>
        <span className="dlw-tags" aria-hidden>
          {d.tags.slice(0, 2).map((t) => (
            <span key={t} className="dlw-tag" data-hot={t === "Hot"}>
              {t}
            </span>
          ))}
        </span>
      </div>

      <h2 className="dlw-title">
        <a href={href} target="_blank" rel="noopener" style={{ color: "inherit", textDecoration: "none" }}>
          {d.caseName}
        </a>
      </h2>

      <dl className="dlw-meta">
        <dt>Filed</dt>
        <dd>{fmtDate(d.filed)}</dd>
        <dt>Judge</dt>
        <dd>{d.judge}</dd>
        <dt>NOS</dt>
        <dd>{d.natureOfSuit}</dd>
        <dt>Status</dt>
        <dd>{d.status}</dd>
      </dl>

      <ul className="dlw-entries" aria-label="Recent docket entries">
        {recent.map((e) => (
          <li key={e.id}>
            <span className="dlw-when">{fmtDate(e.dateFiled)}</span>
            <span>
              <span className="dlw-kind">{e.type}</span>
              {e.short}
            </span>
          </li>
        ))}
      </ul>

      <div className="dlw-footer">
        <span>
          <a href={href} target="_blank" rel="noopener">
            Open on DocketLens →
          </a>
        </span>
        <span>
          Powered by{" "}
          <a href={SITE} target="_blank" rel="noopener">
            DocketLens
          </a>
        </span>
      </div>
    </article>
  );
}
