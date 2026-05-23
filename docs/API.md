# DocketLens REST API — v1

Base URL: `https://docketlens.ai/api/v1`

## Authentication

All endpoints under `/api/v1/` require a bearer token. Generate one
under **Settings → API keys** (Team plan or higher).

Tokens look like `dkl_live_<24 random base64url chars>`. Treat them
as secrets — they grant read + write to your org's data.

```http
Authorization: Bearer dkl_live_w7Q4d4Hx7nZ2pQwxMaW8N2g4
```

Unauthorized requests return:

```json
{ "ok": false, "error": { "code": 401, "message": "unauthorized — provide Bearer dkl_live_…" } }
```

## Rate limits

| Plan | Requests / minute | Burst | Notes |
|---|---|---|---|
| Free | n/a (no API) | — | Upgrade to Team |
| Pro | n/a (no API) | — | Upgrade to Team |
| Team | 60 | 120 | Per key |
| Enterprise | Negotiable | Negotiable | |

Headers on every response:

```
x-ratelimit-limit:     60
x-ratelimit-remaining: 47
x-ratelimit-reset:     1716489000
```

## Response shape

Successful:

```json
{ "ok": true, "data": <T> }
```

Errored:

```json
{ "ok": false, "error": { "code": <int>, "message": <str>, "details": <obj?> } }
```

We never return naked arrays at the top level — always wrapped.

## Endpoints

### `GET /api/v1` — discovery

Lists available endpoints. Useful for human exploration; do not depend
on the shape programmatically.

### `GET /api/v1/dockets` — list dockets

Query params:

| Param | Type | Default | Notes |
|---|---|---|---|
| `limit` | int | 20 | Max 100 |
| `court` | string | — | Court ID, e.g. `nysd`, `cand` |
| `q` | string | — | Substring against case name |

Example:

```bash
curl -s -H "Authorization: Bearer dkl_live_…" \
  "https://docketlens.ai/api/v1/dockets?court=nysd&limit=5"
```

```json
{
  "ok": true,
  "data": [
    {
      "id": "dkt_…",
      "court": "S.D.N.Y.",
      "case_name": "Helios Bio Inc. v. Northgate Labs, Inc.",
      "docket_number": "1:25-cv-04812",
      "nature_of_suit": "840 — Patent (Trade Secret)",
      "date_filed": "2026-05-22",
      "assigned_to": "Hon. Aileen R. Castillo"
    }
  ]
}
```

### `GET /api/v1/dockets/:id` — one docket

Returns the full docket with all cached entries and parties.

```json
{
  "ok": true,
  "data": {
    "id": "dkt_…",
    "court": "S.D.N.Y.",
    "case_name": "…",
    "entries": [{ "id": "ent_…", "entry_number": 1, "date_filed": "…", "short_description": "…" }],
    "parties": [{ "id": "pty_…", "name": "…", "role": "Plaintiff" }]
  }
}
```

### `GET /api/v1/search?q=` — fast search

Searches cached dockets by case name, docket number, and party name.
Returns up to `limit` (max 100) most-recent matches.

| Param | Type | Notes |
|---|---|---|
| `q` | string | Required |
| `court` | string | Optional |
| `limit` | int | Default 20, max 100 |

### `GET /api/v1/watchlists` — list org watchlists

```json
{
  "ok": true,
  "data": [
    {
      "id": "wl_…",
      "name": "Apple Inc.",
      "entity_type": "party",
      "match_value": "Apple Inc.",
      "refresh_cadence": "daily",
      "is_active": true,
      "match_count": 12,
      "filters": {}
    }
  ]
}
```

### `POST /api/v1/watchlists` — create

Requires Team plan or higher.

```bash
curl -s -X POST -H "Authorization: Bearer dkl_live_…" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple Inc. patent suits",
    "entity_type": "party",
    "match_value": "Apple Inc.",
    "refresh_cadence": "hourly",
    "filters": { "natureOfSuitCodes": ["830"] }
  }' \
  https://docketlens.ai/api/v1/watchlists
```

201 with `{ "ok": true, "data": { "id": "wl_…" } }`.

## Webhooks (outbound)

Configure per-watchlist webhooks under **Watchlists → ⋯ → Add channel
→ Webhook**. We POST JSON with this shape:

```json
{
  "subject": "Helios Bio v. Northgate — Motion for TRO filed",
  "text": "Plaintiff moves for TRO and expedited discovery; hearing requested within 14 days.",
  "delivery_id": "del_…",
  "rule_id": "rule_…"
}
```

Headers include `X-DocketLens-Signature` (HMAC-SHA256 of the body
using your channel secret). Verify before acting.

## Versioning

`/api/v1` is stable. Breaking changes go to `/api/v2`. Deprecations are
announced 90 days in advance via the Changelog page and an email to
all keys whose `lastUsedAt` is within the past 90 days.

## Limits & lookups

- `/dockets/:id` returns up to 500 entries inline. For larger dockets,
  paginate via a future `/dockets/:id/entries?cursor=` endpoint
  (planned v1.1).
- `q` is currently substring; full-text + facets come in v1.2.
- Webhook retries: exponential backoff, 6 attempts over 24h, then
  permanent fail.

## SDKs (planned)

- `npm i @docketlens/node` (TypeScript)
- `pip install docketlens` (Python)
- Both wrap the same endpoints with retries + types.
