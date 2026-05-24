/* ============================================================================
 *  OpenAPI 3.1 spec for the DocketLens public REST API.
 *
 *  Source of truth lives here, not in a third-party generator. Hand-written
 *  matters for two reasons: (1) the route handlers' shapes are stable enough
 *  that drift is rare, (2) we control the prose — descriptions are written
 *  for human API consumers, not auto-extracted from JSDoc.
 *
 *  Served at /api/v1/openapi.json (force-static — regenerates on deploy only).
 *  Compatible with Swagger UI, Redoc, Scalar, Stoplight, mintlify, and the
 *  `openapi-typescript` codegen.
 * ==========================================================================*/

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";

export const API_VERSION = "1.0.0";

export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "DocketLens REST API",
    version: API_VERSION,
    summary: "Federal court docket intelligence — programmatic access.",
    description: [
      "Public REST API for DocketLens. Read federal court dockets, run case",
      "searches, and manage organisation watchlists.",
      "",
      "**Auth.** All endpoints except `GET /api/v1` and `GET /api/health` require",
      "a Bearer API key in the `Authorization` header. Generate one at",
      "/api-keys inside the app. Keys begin with `dkl_live_`.",
      "",
      "**Rate limits.** Per-key budgets follow your plan tier — see /pricing.",
      "Hard server-side caps: 5 req/sec, 1000 req/hour, 50,000 req/day per key.",
      "Limits are reflected in `x-ratelimit-*` response headers.",
      "",
      "**Conventions.** All identifiers are opaque prefixed nanoids",
      "(e.g. `dkt_…`, `wl_…`). Dates are ISO 8601 (YYYY-MM-DD for civil dates,",
      "RFC 3339 with `Z` for timestamps). Snake_case for all field names.",
      "",
      "**Versioning.** Breaking changes ship behind a new `/api/v2` mount.",
      "Additive changes (new optional fields, new endpoints) are not breaking.",
      "Removing or renaming a field counts as breaking.",
      "",
      "**Extractive AI contract.** Any `ai_summary` field is restated from the",
      "underlying filing — never predicted. See /docs/api for details.",
    ].join("\n"),
    termsOfService: `${SITE}/legal/terms`,
    contact: {
      name: "DocketLens support",
      url: `${SITE}/contact`,
      email: "support@docketlens.ai",
    },
    license: { name: "Proprietary", url: `${SITE}/legal/terms` },
  },
  servers: [
    { url: SITE, description: "Production" },
    { url: "http://localhost:3000", description: "Local dev" },
  ],
  tags: [
    { name: "Discovery", description: "Unauthenticated metadata endpoints." },
    { name: "Dockets", description: "Federal court cases and their entries." },
    { name: "Search", description: "Full-text + faceted search across dockets." },
    { name: "Watchlists", description: "Organisation-scoped saved searches that produce alerts." },
    { name: "System", description: "Liveness / health probes." },
  ],
  security: [{ BearerAuth: [] }],
  paths: {
    "/api/v1": {
      get: {
        tags: ["Discovery"],
        summary: "API discovery",
        description: "Returns the list of available endpoints and the auth scheme. Cached at the edge.",
        operationId: "discovery",
        security: [],
        responses: {
          "200": {
            description: "Discovery payload",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Discovery" },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Liveness probe",
        description: "Cheap health check for uptime monitors. Returns 200 when healthy, 503 when any dependency check fails. No auth required.",
        operationId: "health",
        security: [],
        responses: {
          "200": {
            description: "Healthy",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Health" } },
            },
          },
          "503": {
            description: "Degraded — at least one dependency check failed",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Health" } },
            },
          },
        },
      },
      head: {
        tags: ["System"],
        summary: "Liveness probe (HEAD)",
        description: "Status-only variant for monitors that prefer HEAD requests.",
        operationId: "healthHead",
        security: [],
        responses: { "200": { description: "Healthy" }, "503": { description: "Degraded" } },
      },
    },
    "/api/v1/dockets": {
      get: {
        tags: ["Dockets"],
        summary: "List recent dockets",
        description: "Returns the most recently filed dockets the calling org has access to, newest first.",
        operationId: "listDockets",
        parameters: [
          { $ref: "#/components/parameters/Limit" },
          {
            name: "court",
            in: "query",
            description: "CourtListener court id (e.g. `ca9`, `nysd`, `cand`). Filters to a single court.",
            schema: { type: "string" },
            example: "nysd",
          },
          {
            name: "q",
            in: "query",
            description: "Case-name substring match (use `/api/v1/search` for full search).",
            schema: { type: "string" },
            example: "Acme",
          },
        ],
        responses: {
          "200": {
            description: "Array of dockets",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Docket" } },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/v1/dockets/{id}": {
      get: {
        tags: ["Dockets"],
        summary: "Get one docket",
        description: "Returns a single docket with all of its entries and parties.",
        operationId: "getDocket",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Docket id (`dkt_…`).",
            schema: { type: "string", pattern: "^dkt_[A-Za-z0-9_-]+$" },
            example: "dkt_5jH3kK9mQp",
          },
        ],
        responses: {
          "200": {
            description: "Docket with entries + parties",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/DocketDetail" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/dockets/{id}/ai-summaries": {
      get: {
        tags: ["Dockets"],
        summary: "Get extractive AI summaries",
        description:
          "Returns extractive summaries for a docket and each of its entries across three tiers (`one_liner`, `paragraph`, `exec`). Free-plan keys only receive `one_liner`; Pro+ keys receive all three. Each summary entry carries its source (`cache` from `ai_summaries`, or `demo` from the seeded sample data) plus the prompt version it was generated under, so callers can detect drift after a model bump. Extractive contract: we restate what's on the docket; we never predict outcomes or characterise parties.",
        operationId: "getDocketAiSummaries",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Docket id (`dkt_…`).",
            schema: { type: "string", pattern: "^dkt_[A-Za-z0-9_-]+$" },
            example: "dkt_helios_v_northgate",
          },
        ],
        responses: {
          "200": {
            description: "Summaries payload",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AiSummaries" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/search": {
      get: {
        tags: ["Search"],
        summary: "Search cases",
        description: "Searches across case name, docket number, and party names. Returns dockets sorted newest first.",
        operationId: "search",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Search query. Matches case name, docket number, and normalized party names.",
            schema: { type: "string", minLength: 1 },
            example: "antitrust",
          },
          {
            name: "court",
            in: "query",
            description: "CourtListener court id filter.",
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/Limit" },
        ],
        responses: {
          "200": {
            description: "Search results",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/SearchResult" } },
              },
            },
          },
          "400": {
            description: "Missing or empty `q`",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/v1/watchlists": {
      get: {
        tags: ["Watchlists"],
        summary: "List org watchlists",
        description: "Returns every active watchlist owned by the authenticated org.",
        operationId: "listWatchlists",
        responses: {
          "200": {
            description: "Array of watchlists",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Watchlist" } },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Watchlists"],
        summary: "Create a watchlist",
        description: "Creates a new watchlist for the authenticated org. Requires Team plan or higher.",
        operationId: "createWatchlist",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateWatchlist" } },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["id"],
                  properties: { id: { type: "string", example: "wl_F3kQ9pR2Lm" } },
                },
              },
            },
          },
          "400": {
            description: "Malformed JSON body",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "402": {
            description: "Plan upgrade required",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "422": {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "dkl_live_…",
        description: "API key issued from /api-keys. Treat as a secret.",
      },
    },
    parameters: {
      Limit: {
        name: "limit",
        in: "query",
        description: "Max number of results. Clamped server-side to 100.",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid Bearer token",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      NotFound: {
        description: "Resource does not exist or is not visible to this key",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string", description: "Human-readable error message." },
          details: {
            type: "object",
            additionalProperties: true,
            description: "Optional structured context (e.g. zod issue list).",
          },
        },
        example: { error: "unauthorized — provide Bearer dkl_live_…" },
      },
      Discovery: {
        type: "object",
        required: ["name", "version", "endpoints"],
        properties: {
          name: { type: "string", example: "DocketLens REST API" },
          version: { type: "string", example: "v1" },
          docs: { type: "string", format: "uri" },
          auth: { type: "string", example: "Bearer dkl_live_…" },
          endpoints: {
            type: "array",
            items: {
              type: "object",
              required: ["method", "path", "desc"],
              properties: {
                method: { type: "string", example: "GET" },
                path: { type: "string", example: "/api/v1/dockets" },
                desc: { type: "string" },
              },
            },
          },
        },
      },
      Health: {
        type: "object",
        required: ["ok", "status", "service", "version", "ts", "checks"],
        properties: {
          ok: { type: "boolean" },
          status: { type: "string", enum: ["healthy", "degraded"] },
          service: { type: "string", example: "docketlens-web" },
          version: { type: "string", example: "0.1.1" },
          prompt_version: {
            type: "string",
            description: "Current AI prompt version — changes invalidate the prompt cache.",
          },
          ts: { type: "string", format: "date-time" },
          uptime_seconds: { type: "integer", minimum: 0 },
          git_sha: { type: "string", description: "7-char commit SHA or 'local'." },
          checks: {
            type: "object",
            properties: {
              db: {
                type: "object",
                required: ["ok", "latency_ms"],
                properties: {
                  ok: { type: "boolean" },
                  latency_ms: { type: "integer" },
                  error: { type: "string" },
                },
              },
            },
          },
        },
      },
      Docket: {
        type: "object",
        required: ["id", "court", "case_name", "docket_number"],
        properties: {
          id: { type: "string", example: "dkt_5jH3kK9mQp" },
          court: { type: "string", example: "nysd" },
          case_name: { type: "string", example: "Doe v. Acme Corp." },
          docket_number: { type: "string", example: "1:25-cv-04812" },
          nature_of_suit: {
            type: ["string", "null"],
            description: "Three-digit NOS code (e.g. '830' Patent).",
          },
          date_filed: { type: ["string", "null"], format: "date" },
          assigned_to: { type: ["string", "null"], description: "Judge name as reported by CourtListener." },
        },
      },
      DocketDetail: {
        allOf: [
          { $ref: "#/components/schemas/Docket" },
          {
            type: "object",
            required: ["entries", "parties"],
            properties: {
              cause: { type: ["string", "null"] },
              jury_demand: { type: ["string", "null"] },
              entries: { type: "array", items: { $ref: "#/components/schemas/DocketEntry" } },
              parties: { type: "array", items: { $ref: "#/components/schemas/Party" } },
            },
          },
        ],
      },
      DocketEntry: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string", example: "de_9aB7cD3eF1" },
          entry_number: { type: ["integer", "null"] },
          date_filed: { type: ["string", "null"], format: "date" },
          short_description: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
        },
      },
      Party: {
        type: "object",
        required: ["id", "name", "role"],
        properties: {
          id: { type: "string", example: "p_2gH4jK6lM8" },
          name: { type: "string", example: "Acme Corp." },
          role: {
            type: "string",
            enum: ["plaintiff", "defendant", "third_party", "intervenor", "other"],
          },
        },
      },
      SearchResult: {
        type: "object",
        required: ["id", "court", "case_name", "docket_number"],
        properties: {
          id: { type: "string", example: "dkt_5jH3kK9mQp" },
          court: { type: "string" },
          case_name: { type: "string" },
          docket_number: { type: "string" },
          date_filed: { type: ["string", "null"], format: "date" },
        },
      },
      Watchlist: {
        type: "object",
        required: ["id", "name", "entity_type", "match_value", "refresh_cadence", "is_active"],
        properties: {
          id: { type: "string", example: "wl_F3kQ9pR2Lm" },
          name: { type: "string", example: "Acme Corp filings" },
          entity_type: {
            type: "string",
            enum: ["party", "attorney", "judge", "lawfirm", "case", "term"],
          },
          match_value: { type: "string", example: "Acme Corp" },
          refresh_cadence: { type: "string", enum: ["realtime", "hourly", "daily"] },
          is_active: { type: "boolean" },
          match_count: { type: "integer", minimum: 0 },
          filters: {
            type: "object",
            properties: {
              courts: { type: "array", items: { type: "string" } },
              natureOfSuitCodes: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      AiSummaryTier: {
        type: "object",
        description: "Single-tier extractive summary. `null` means we have no extractive copy for this tier yet.",
        required: ["content", "source", "prompt_version", "model", "stale"],
        properties: {
          content: { type: "string", description: "The extractive restatement." },
          source: {
            type: "string",
            enum: ["cache", "demo"],
            description:
              "`cache` — generated by the worker and stored in `ai_summaries`. `demo` — seeded sample copy that ships with the canonical demo cases.",
          },
          prompt_version: {
            type: "string",
            description:
              "Prompt version the summary was generated under. If older than the current PROMPT_VERSION, `stale: true`.",
          },
          model: {
            type: "string",
            description: "Model identifier (e.g. `claude-haiku-4-5-20251001`, or `sample-data` for demo seed).",
          },
          stale: { type: "boolean" },
        },
        example: {
          content: "Helios Bio sues Northgate Labs over alleged misappropriation of fluorescent-reporter chemistry protocols; $42M demanded.",
          source: "demo",
          prompt_version: "2026-05-23.v1",
          model: "sample-data",
          stale: false,
        },
      },
      AiSummaries: {
        type: "object",
        required: ["docket", "entries", "meta"],
        properties: {
          docket: {
            type: "object",
            required: ["id", "case_name", "court", "summaries"],
            properties: {
              id: { type: "string" },
              case_name: { type: "string" },
              court: { type: "string" },
              summaries: {
                type: "object",
                description: "Tiered summaries keyed by tier. Tiers not allowed on the caller's plan are omitted entirely.",
                properties: {
                  one_liner: {
                    oneOf: [
                      { $ref: "#/components/schemas/AiSummaryTier" },
                      { type: "null" },
                    ],
                  },
                  paragraph: {
                    oneOf: [
                      { $ref: "#/components/schemas/AiSummaryTier" },
                      { type: "null" },
                    ],
                  },
                  exec: {
                    oneOf: [
                      { $ref: "#/components/schemas/AiSummaryTier" },
                      { type: "null" },
                    ],
                  },
                },
              },
            },
          },
          entries: {
            type: "array",
            items: {
              type: "object",
              required: ["entry_id", "summaries"],
              properties: {
                entry_id: { type: "string" },
                date_filed: { type: ["string", "null"], format: "date" },
                short_description: { type: "string" },
                summaries: {
                  type: "object",
                  description: "Same shape as `docket.summaries`.",
                },
              },
            },
          },
          meta: {
            type: "object",
            required: ["prompt_version_current", "plan", "tiers_returned", "extractive_only"],
            properties: {
              prompt_version_current: { type: "string" },
              plan: {
                type: "string",
                enum: ["free", "pro", "team", "enterprise"],
              },
              tiers_returned: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["one_liner", "paragraph", "exec"],
                },
              },
              extractive_only: {
                type: "boolean",
                description: "Always `true`. Documents the hard product invariant.",
              },
              docs: { type: "string", format: "uri" },
            },
          },
        },
      },
      CreateWatchlist: {
        type: "object",
        required: ["name", "entity_type", "match_value"],
        properties: {
          name: { type: "string", minLength: 1, example: "Acme Corp filings" },
          entity_type: {
            type: "string",
            enum: ["party", "attorney", "judge", "lawfirm", "case", "term"],
          },
          match_value: { type: "string", minLength: 1, example: "Acme Corp" },
          refresh_cadence: {
            type: "string",
            enum: ["realtime", "hourly", "daily"],
            default: "daily",
          },
          filters: {
            type: "object",
            properties: {
              courts: { type: "array", items: { type: "string" } },
              natureOfSuitCodes: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
  },
  externalDocs: {
    description: "API guide + examples",
    url: `${SITE}/docs/api`,
  },
} as const;
