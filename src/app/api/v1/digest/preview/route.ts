import { type NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/keys";
import { err, ok, preflight } from "@/lib/api/respond";
import { renderDigestEmail, type DigestItem } from "@/lib/alerts/email";
import { SAMPLE_DOCKETS, SAMPLE_WATCHLISTS } from "@/lib/sample-data";
import type { Docket, DocketEntry, WatchlistMatch } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================================
 *  GET /api/v1/digest/preview?cadence=daily|hourly|instant&format=html|text|json
 *
 *  REST twin of the /inbox/digest-preview page. Returns exactly what the
 *  next outgoing digest would look like for the calling org, using the
 *  same renderDigestEmail() the worker uses in production.
 *
 *  Today we shape from SAMPLE_DOCKETS + SAMPLE_WATCHLISTS because the
 *  match table isn't populated for API-key-only orgs yet. When the
 *  Tuesday wire-up lands, this reads from `watchlist_matches` for the
 *  caller's org and the shape stays identical.
 *
 *  format=json (default) returns { subject, body, html, items_count };
 *  format=html returns the raw HTML with content-type: text/html;
 *  format=text returns the plain-text body with content-type: text/plain.
 *  The html + text variants are useful for setup wizards that want to
 *  iframe-render the digest before turning email on.
 *
 *  All callers must be authenticated. Free plan supports daily only;
 *  Pro+ supports all three cadences.
 * ==========================================================================*/

type Cadence = "instant" | "hourly" | "daily";
const VALID: Cadence[] = ["instant", "hourly", "daily"];

function buildItems(): DigestItem[] {
  const all = SAMPLE_DOCKETS.flatMap((d) =>
    d.entries.map((e) => ({ docket: d, entry: e }))
  )
    .sort(
      (a, b) =>
        new Date(b.entry.dateFiled).getTime() -
        new Date(a.entry.dateFiled).getTime()
    )
    .slice(0, 5);

  return all.map(({ docket, entry }, i): DigestItem => {
    const w = SAMPLE_WATCHLISTS[i % SAMPLE_WATCHLISTS.length];
    const d: Docket = {
      id: docket.id,
      court: docket.court,
      caseName: docket.caseName,
      caseNameShort: docket.caseNameShort,
      docketNumber: docket.caseNumber,
      natureOfSuit: docket.natureOfSuit,
      cause: docket.cause,
      juryDemand: docket.juryDemand,
      assignedTo: docket.judge,
      dateFiled: new Date(docket.filed),
      filed: new Date(docket.filed),
    } as unknown as Docket;
    const e: DocketEntry = {
      id: entry.id,
      docketId: docket.id,
      entryNumber: entry.entryNumber,
      dateFiled: new Date(entry.dateFiled),
      shortDescription: entry.short,
      description: entry.description,
    } as unknown as DocketEntry;
    const m: WatchlistMatch = {
      id: `wm_preview_${i}`,
      watchlistId: w.id,
      docketId: docket.id,
      entryId: entry.id,
    } as unknown as WatchlistMatch;
    return { docket: d, entry: e, match: m };
  });
}

export async function OPTIONS() {
  return preflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req.headers.get("authorization"));
  if (!auth) return err("unauthorized", 401);

  const sp = req.nextUrl.searchParams;
  const rawCadence = sp.get("cadence") ?? "daily";
  if (!(VALID as string[]).includes(rawCadence)) {
    return err("invalid cadence — expected instant | hourly | daily", 400);
  }
  const cadence = rawCadence as Cadence;
  if (cadence !== "daily" && auth.plan === "free") {
    return err("upgrade required for non-daily cadence (Pro plan)", 402);
  }
  const format = sp.get("format") ?? "json";

  const items = buildItems();
  const rendered = renderDigestEmail({ cadence, items });

  if (format === "html") {
    return new Response(rendered.html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "private, max-age=60",
      },
    });
  }
  if (format === "text") {
    return new Response(rendered.body, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "private, max-age=60",
      },
    });
  }
  if (format !== "json") {
    return err(`unsupported format '${format}'`, 400);
  }

  return ok({
    subject: rendered.subject,
    body: rendered.body,
    html: rendered.html,
    cadence,
    items_count: items.length,
    note:
      "Today this previews against SAMPLE_DOCKETS. Once the ingest worker + auth land Tuesday, this reads watchlist_matches for the calling org — same shape, real data.",
  });
}
