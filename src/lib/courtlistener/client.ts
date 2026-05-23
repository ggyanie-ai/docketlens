import { serverEnv } from "@/lib/env";
import {
  CLCourt,
  CLDocket,
  CLDocketEntry,
  CLParty,
  CLOpinionCluster,
  CLPaginated,
  CLSearchResult,
  type SearchParams,
} from "./types";
import { z } from "zod";

/* ============================================================================
 * CourtListener REST v4 client.
 *
 *  - Token auth via `Authorization: Token <token>`.
 *  - Rate limits (per token): 5/min, 50/hr, 125/day. We add a small in-memory
 *    leaky bucket + exponential backoff on 429.
 *  - Zod validates responses; unknown keys pass through.
 *  - All paginated endpoints expose `paginate()` async-iterator helper.
 * ==========================================================================*/

const RATE = { perMin: 5, perHr: 50, perDay: 125 };

class RateLimiter {
  private windows = {
    minute: [] as number[],
    hour: [] as number[],
    day: [] as number[],
  };
  private prune(now: number) {
    this.windows.minute = this.windows.minute.filter((t) => now - t < 60_000);
    this.windows.hour   = this.windows.hour.filter((t)   => now - t < 3_600_000);
    this.windows.day    = this.windows.day.filter((t)    => now - t < 86_400_000);
  }
  async take(): Promise<void> {
    while (true) {
      const now = Date.now();
      this.prune(now);
      if (
        this.windows.minute.length < RATE.perMin &&
        this.windows.hour.length < RATE.perHr &&
        this.windows.day.length < RATE.perDay
      ) {
        this.windows.minute.push(now);
        this.windows.hour.push(now);
        this.windows.day.push(now);
        return;
      }
      // wait until the soonest window clears
      const waitMs = Math.max(
        this.windows.minute[0] ? 60_000 - (now - this.windows.minute[0]) : 0,
        this.windows.hour[0] && this.windows.hour.length >= RATE.perHr
          ? 3_600_000 - (now - this.windows.hour[0])
          : 0
      );
      await new Promise((r) => setTimeout(r, Math.min(waitMs + 50, 30_000)));
    }
  }
}

const globalLimiter = new RateLimiter();

export class CourtListenerError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "CourtListenerError";
  }
}

export interface CourtListenerOptions {
  token?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  /** Override rate-limit behavior — set false for unauthed health checks. */
  rateLimit?: boolean;
}

export class CourtListenerClient {
  private token?: string;
  private baseUrl: string;
  private fetcher: typeof fetch;
  private rateLimit: boolean;

  constructor(opts: CourtListenerOptions = {}) {
    this.token = opts.token ?? serverEnv?.COURTLISTENER_TOKEN;
    this.baseUrl =
      opts.baseUrl ??
      serverEnv?.COURTLISTENER_BASE_URL ??
      "https://www.courtlistener.com/api/rest/v4";
    this.fetcher = opts.fetch ?? fetch;
    this.rateLimit = opts.rateLimit ?? true;
  }

  private headers(): Record<string, string> {
    return {
      "Accept": "application/json",
      "User-Agent": "DocketLens/0.1 (https://docketlens.ai)",
      ...(this.token ? { Authorization: `Token ${this.token}` } : {}),
    };
  }

  private async request<T extends z.ZodTypeAny>(
    path: string,
    schema: T,
    init?: RequestInit & { params?: Record<string, string | number | undefined | string[]> },
    attempt = 0
  ): Promise<z.infer<T>> {
    if (this.rateLimit) await globalLimiter.take();

    const url = new URL(path.startsWith("http") ? path : this.baseUrl + path);
    for (const [k, v] of Object.entries(init?.params ?? {})) {
      if (v === undefined) continue;
      if (Array.isArray(v)) for (const x of v) url.searchParams.append(k, String(x));
      else url.searchParams.set(k, String(v));
    }

    const res = await this.fetcher(url.toString(), {
      ...init,
      headers: { ...this.headers(), ...(init?.headers as Record<string, string> | undefined) },
      cache: "no-store",
    });

    if (res.status === 429 && attempt < 4) {
      const retryAfter = Number(res.headers.get("retry-after") ?? "30");
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return this.request(path, schema, init, attempt + 1);
    }

    if (!res.ok) {
      let body: unknown;
      try { body = await res.json(); } catch { body = await res.text().catch(() => undefined); }
      throw new CourtListenerError(
        `CourtListener ${res.status}: ${res.statusText} for ${url.pathname}`,
        res.status,
        body
      );
    }

    const json = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new CourtListenerError(
        `Validation failed for ${url.pathname}: ${parsed.error.message}`,
        200,
        json
      );
    }
    return parsed.data;
  }

  /* ---------- Courts ---------- */
  listCourts(params?: { in_use?: boolean; jurisdiction?: string; page_size?: number; cursor?: string }) {
    return this.request("/courts/", CLPaginated(CLCourt), { params: params as never });
  }
  getCourt(id: string) {
    return this.request(`/courts/${id}/`, CLCourt);
  }

  /* ---------- Search ---------- */
  search(params: SearchParams) {
    return this.request("/search/", CLPaginated(CLSearchResult), {
      params: {
        ...params,
        court: Array.isArray(params.court) ? params.court : params.court,
        page_size: params.page_size ?? 20,
      } as never,
    });
  }

  /* ---------- Dockets ---------- */
  listDockets(params?: {
    court?: string;
    case_name?: string;
    docket_number?: string;
    date_filed__gte?: string;
    date_filed__lte?: string;
    order_by?: string;
    cursor?: string;
    page_size?: number;
  }) {
    return this.request("/dockets/", CLPaginated(CLDocket), { params: params as never });
  }
  getDocket(id: number | string) {
    return this.request(`/dockets/${id}/`, CLDocket);
  }
  listDocketEntries(params: {
    docket: number | string;
    order_by?: string;
    cursor?: string;
    page_size?: number;
  }) {
    return this.request("/docket-entries/", CLPaginated(CLDocketEntry), {
      params: params as never,
    });
  }

  /* ---------- Parties ---------- */
  listParties(params: { docket: number | string; cursor?: string; page_size?: number }) {
    return this.request("/parties/", CLPaginated(CLParty), { params: params as never });
  }

  /* ---------- Opinions ---------- */
  listOpinionClusters(params?: {
    docket?: number | string;
    court?: string;
    cursor?: string;
    page_size?: number;
  }) {
    return this.request("/clusters/", CLPaginated(CLOpinionCluster), {
      params: params as never,
    });
  }

  /* ---------- Pagination helper ---------- */
  async *paginate<T extends z.ZodTypeAny>(
    initialPath: string,
    schema: T,
    params?: Record<string, string | number | string[] | undefined>,
    { maxPages = 10 }: { maxPages?: number } = {}
  ): AsyncGenerator<z.infer<ReturnType<typeof CLPaginated<T>>>["results"][number]> {
    const paged = CLPaginated(schema);
    let url: string | null = initialPath;
    let firstParams: typeof params | undefined = params;
    let page = 0;
    while (url && page < maxPages) {
      const data = (await this.request(url, paged, {
        params: firstParams,
      })) as z.infer<typeof paged>;
      for (const item of data.results) yield item;
      url = data.next;
      firstParams = undefined; // cursor encoded in next
      page++;
    }
  }
}

export const courtListener = new CourtListenerClient();
