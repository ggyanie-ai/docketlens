import Link from "next/link";
import { ArrowUpRight, Lock, Globe } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/app/copy-button";
import { openapi } from "@/lib/openapi";
import { BreadcrumbJsonLd, ArticleJsonLd } from "@/lib/structured-data";

export const dynamic = "force-static";

export const metadata = {
  title: "API reference",
  description:
    "Interactive reference for the DocketLens REST API — every endpoint, every schema, generated from the OpenAPI 3.1 spec.",
};

/* ============================================================================
 *  /docs/api-reference — interactive OpenAPI reference.
 *
 *  Renders directly from the typed `openapi` object in src/lib/openapi.ts —
 *  no client-side fetch, no third-party renderer bundle, no Scalar/Redoc/
 *  Stoplight script tag. Server component, force-static.
 *
 *  Two-pane layout: a sticky left-rail nav (one anchor per endpoint, grouped
 *  by tag) and a right pane that renders each endpoint as its own card with
 *  parameters, request body, and per-status response schemas.
 *
 *  Schema rendering walks $ref pointers inside #/components/schemas so the
 *  reader sees the resolved shape inline, not a "see Docket" link.
 * ==========================================================================*/

type Method = "get" | "post" | "put" | "patch" | "delete" | "head";
const METHODS: Method[] = ["get", "post", "put", "patch", "delete", "head"];

interface Operation {
  readonly tags?: readonly string[];
  readonly summary?: string;
  readonly description?: string;
  readonly operationId?: string;
  readonly security?: readonly unknown[];
  readonly parameters?: readonly Param[];
  readonly requestBody?: RequestBody;
  readonly responses?: Readonly<Record<string, ResponseObject>>;
}
interface Param {
  readonly name?: string;
  readonly in?: string;
  readonly required?: boolean;
  readonly description?: string;
  readonly schema?: SchemaLike;
  readonly example?: unknown;
  readonly $ref?: string;
}
interface RequestBody {
  readonly required?: boolean;
  readonly content?: Readonly<Record<string, { readonly schema?: SchemaLike }>>;
}
interface ResponseObject {
  readonly description?: string;
  readonly content?: Readonly<Record<string, { readonly schema?: SchemaLike }>>;
  readonly $ref?: string;
}
interface SchemaLike {
  readonly type?: string | readonly string[];
  readonly format?: string;
  readonly description?: string;
  readonly enum?: readonly unknown[];
  readonly example?: unknown;
  readonly default?: unknown;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly minLength?: number;
  readonly pattern?: string;
  readonly required?: readonly string[];
  readonly properties?: Readonly<Record<string, SchemaLike>>;
  readonly items?: SchemaLike;
  readonly $ref?: string;
  readonly allOf?: readonly SchemaLike[];
  readonly additionalProperties?: boolean | SchemaLike;
}

/* ─── ref resolver ───────────────────────────────────────────────────────── */

function resolve<T = unknown>(ref: string): T {
  // "#/components/schemas/Docket" → openapi.components.schemas.Docket
  const parts = ref.replace(/^#\//, "").split("/");
  let cur: unknown = openapi;
  for (const p of parts) {
    cur = (cur as Record<string, unknown>)?.[p];
  }
  return cur as T;
}

function resolveParam(p: Param): Param {
  return p.$ref ? resolve<Param>(p.$ref) : p;
}
function resolveResponse(r: ResponseObject): ResponseObject {
  return r.$ref ? resolve<ResponseObject>(r.$ref) : r;
}
function resolveSchema(s: SchemaLike, depth = 0): SchemaLike {
  if (depth > 5) return s;
  if (s.$ref) return resolveSchema(resolve<SchemaLike>(s.$ref), depth + 1);
  if (s.allOf) {
    const props: Record<string, SchemaLike> = {};
    let req: string[] = [];
    for (const part of s.allOf) {
      const r = resolveSchema(part, depth + 1);
      if (r.properties) Object.assign(props, r.properties);
      if (r.required) req = [...req, ...r.required];
    }
    return { type: "object", properties: props, required: req };
  }
  return s;
}

function schemaName(s: SchemaLike): string | null {
  if (!s.$ref) return null;
  const m = s.$ref.match(/\/([^/]+)$/);
  return m ? m[1] : null;
}

function typeLabel(s: SchemaLike): string {
  const r = s.$ref ? resolve<SchemaLike>(s.$ref) : s;
  const t = r.type;
  if (Array.isArray(t)) return t.join(" | ");
  if (t === "array") {
    const item = r.items ? schemaName(r.items) ?? typeLabel(r.items) : "any";
    return `array<${item}>`;
  }
  if (s.$ref) return schemaName(s) ?? "object";
  return (t as string) ?? "any";
}

/* ─── presentation helpers ───────────────────────────────────────────────── */

const METHOD_COLORS: Record<Method, string> = {
  get: "text-[color:var(--color-accent)] border-[color:var(--color-accent)]/40",
  post: "text-emerald-500 border-emerald-500/40",
  put: "text-amber-500 border-amber-500/40",
  patch: "text-amber-500 border-amber-500/40",
  delete: "text-rose-500 border-rose-500/40",
  head: "text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]",
};

function MethodPill({ m }: { m: Method }) {
  return (
    <span
      className={`inline-block rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${METHOD_COLORS[m]}`}
    >
      {m}
    </span>
  );
}

function opId(path: string, m: Method): string {
  return `op-${m}-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/* ─── schema renderer ────────────────────────────────────────────────────── */

function SchemaTable({ schema, depth = 0 }: { schema: SchemaLike; depth?: number }) {
  const s = resolveSchema(schema);
  if (s.type === "object" || s.properties) {
    const required = new Set(s.required ?? []);
    const props = s.properties ?? {};
    return (
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
            <th className="py-1.5 pr-4 font-normal">Field</th>
            <th className="py-1.5 pr-4 font-normal">Type</th>
            <th className="py-1.5 font-normal">Notes</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(props).map(([k, v]) => {
            const rs = resolveSchema(v);
            const isReq = required.has(k);
            const nested = rs.properties || rs.items?.properties;
            return (
              <tr key={k} className="border-t border-[color:var(--color-border)]/60 align-top">
                <td className="py-1.5 pr-4 text-[color:var(--color-fg)]">
                  {k}
                  {isReq && (
                    <span className="ml-1 text-[10px] text-rose-500">*</span>
                  )}
                </td>
                <td className="py-1.5 pr-4 text-[color:var(--color-accent)]">
                  {typeLabel(v)}
                  {rs.format && (
                    <span className="text-[color:var(--color-fg-subtle)]">
                      {" "}({rs.format})
                    </span>
                  )}
                </td>
                <td className="py-1.5 text-[color:var(--color-fg-muted)] font-sans text-[12px]">
                  {rs.description}
                  {rs.enum && (
                    <div className="mt-0.5 text-[11px] font-mono">
                      enum: {rs.enum.map((e) => JSON.stringify(e)).join(" · ")}
                    </div>
                  )}
                  {rs.default !== undefined && (
                    <div className="mt-0.5 text-[11px] font-mono">
                      default: {JSON.stringify(rs.default)}
                    </div>
                  )}
                  {rs.example !== undefined && (
                    <div className="mt-0.5 text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
                      e.g. {JSON.stringify(rs.example)}
                    </div>
                  )}
                  {nested && depth < 2 && (
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-[11px] text-[color:var(--color-accent)]">
                        Show nested
                      </summary>
                      <div className="mt-1.5">
                        <SchemaTable
                          schema={rs.items ?? rs}
                          depth={depth + 1}
                        />
                      </div>
                    </details>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
  if (s.type === "array" && s.items) {
    return (
      <div className="text-xs text-[color:var(--color-fg-muted)] font-mono">
        Array of {schemaName(s.items) ?? typeLabel(s.items)}.
        <div className="mt-2">
          <SchemaTable schema={s.items} depth={depth + 1} />
        </div>
      </div>
    );
  }
  return (
    <div className="text-xs font-mono text-[color:var(--color-fg-muted)]">
      {typeLabel(s)}
      {s.description && (
        <span className="font-sans"> — {s.description}</span>
      )}
    </div>
  );
}

/* ─── one endpoint card ──────────────────────────────────────────────────── */

function EndpointCard({
  path,
  method,
  op,
}: {
  path: string;
  method: Method;
  op: Operation;
}) {
  const isPublic = op.security && op.security.length === 0;
  const requestBodySchema = op.requestBody?.content?.["application/json"]?.schema;

  // Build a curl snippet — most common copy-paste task.
  const curl = (() => {
    const url = `https://docketlens.ai${path}`;
    const lines = [`curl -X ${method.toUpperCase()} '${url}'`];
    if (!isPublic) lines.push(`  -H 'Authorization: Bearer dkl_live_…'`);
    if (requestBodySchema) {
      lines.push(`  -H 'Content-Type: application/json'`);
      const example = exampleFromSchema(requestBodySchema);
      lines.push(`  -d '${JSON.stringify(example)}'`);
    }
    return lines.join(" \\\n");
  })();

  return (
    <section id={opId(path, method)} className="scroll-mt-20">
      <Card className="p-6">
        <div className="flex items-center gap-3 flex-wrap">
          <MethodPill m={method} />
          <code className="font-mono text-sm text-[color:var(--color-fg)] tracking-tight">
            {path}
          </code>
          {isPublic ? (
            <Badge
              variant="outline"
              className="text-[10px] inline-flex items-center gap-1"
            >
              <Globe className="size-2.5" /> Public
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] inline-flex items-center gap-1"
            >
              <Lock className="size-2.5" /> Bearer auth
            </Badge>
          )}
        </div>

        {op.summary && (
          <h3 className="font-serif text-xl mt-3">{op.summary}</h3>
        )}
        {op.description && (
          <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
            {op.description}
          </p>
        )}

        {op.parameters && op.parameters.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow mb-2">Parameters</p>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]">
                  <th className="py-1.5 pr-4 font-normal">Name</th>
                  <th className="py-1.5 pr-4 font-normal">In</th>
                  <th className="py-1.5 pr-4 font-normal">Type</th>
                  <th className="py-1.5 font-normal">Notes</th>
                </tr>
              </thead>
              <tbody>
                {op.parameters.map((raw, i) => {
                  const p = resolveParam(raw);
                  return (
                    <tr key={i} className="border-t border-[color:var(--color-border)]/60 align-top">
                      <td className="py-1.5 pr-4 text-[color:var(--color-fg)]">
                        {p.name}
                        {p.required && (
                          <span className="ml-1 text-[10px] text-rose-500">*</span>
                        )}
                      </td>
                      <td className="py-1.5 pr-4 text-[color:var(--color-fg-muted)]">
                        {p.in}
                      </td>
                      <td className="py-1.5 pr-4 text-[color:var(--color-accent)]">
                        {p.schema ? typeLabel(p.schema) : "string"}
                      </td>
                      <td className="py-1.5 text-[color:var(--color-fg-muted)] font-sans text-[12px]">
                        {p.description}
                        {p.example !== undefined && (
                          <div className="mt-0.5 text-[11px] font-mono">
                            e.g. {JSON.stringify(p.example)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {requestBodySchema && (
          <div className="mt-5">
            <p className="eyebrow mb-2">Request body</p>
            <SchemaTable schema={requestBodySchema} />
          </div>
        )}

        {op.responses && (
          <div className="mt-5">
            <p className="eyebrow mb-2">Responses</p>
            <div className="flex flex-col gap-3">
              {Object.entries(op.responses).map(([status, raw]) => {
                const r = resolveResponse(raw);
                const schema = r.content?.["application/json"]?.schema;
                return (
                  <div
                    key={status}
                    className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <code
                        className={`font-mono text-xs px-1.5 py-0.5 rounded-md border ${
                          status.startsWith("2")
                            ? "text-emerald-500 border-emerald-500/40"
                            : status.startsWith("4")
                            ? "text-amber-500 border-amber-500/40"
                            : status.startsWith("5")
                            ? "text-rose-500 border-rose-500/40"
                            : "text-[color:var(--color-fg-muted)] border-[color:var(--color-border)]"
                        }`}
                      >
                        {status}
                      </code>
                      <span className="text-[12px] text-[color:var(--color-fg-muted)]">
                        {r.description}
                      </span>
                    </div>
                    {schema && (
                      <div className="mt-2">
                        <SchemaTable schema={schema} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="eyebrow mb-2">curl</p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-3 text-[11.5px] font-mono leading-relaxed text-[color:var(--color-fg)]">
{curl}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton text={curl} />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

/* Crude example builder — picks the explicit example, else falls back per type. */
function exampleFromSchema(s: SchemaLike): unknown {
  const r = resolveSchema(s);
  if (r.example !== undefined) return r.example;
  if (r.type === "object" || r.properties) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r.properties ?? {})) {
      out[k] = exampleFromSchema(v);
    }
    return out;
  }
  if (r.type === "array" && r.items) return [exampleFromSchema(r.items)];
  if (r.type === "string") return r.format === "date-time" ? "2026-05-24T12:00:00Z" : "string";
  if (r.type === "integer" || r.type === "number") return 0;
  if (r.type === "boolean") return true;
  return null;
}

/* ─── page ───────────────────────────────────────────────────────────────── */

interface FlatOp {
  path: string;
  method: Method;
  op: Operation;
}

export default function ApiReferencePage() {
  const flat: FlatOp[] = [];
  for (const [path, item] of Object.entries(openapi.paths)) {
    for (const m of METHODS) {
      const op = (item as Record<string, Operation | undefined>)[m];
      if (op) flat.push({ path, method: m, op });
    }
  }

  // Group by first tag.
  const tagGroups = new Map<string, FlatOp[]>();
  for (const f of flat) {
    const tag = f.op.tags?.[0] ?? "Other";
    if (!tagGroups.has(tag)) tagGroups.set(tag, []);
    tagGroups.get(tag)!.push(f);
  }
  // Preserve the tag order declared in `openapi.tags`.
  const declaredTags: string[] = openapi.tags.map((t) => t.name);
  const orderedTags: string[] = [
    ...declaredTags.filter((n) => tagGroups.has(n)),
    ...[...tagGroups.keys()].filter((n) => !declaredTags.includes(n)),
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Docs", url: "/docs" },
          { name: "API reference", url: "/docs/api-reference" },
        ]}
      />
      <ArticleJsonLd
        meta={{
          headline: "DocketLens REST API reference",
          description:
            "Interactive reference for the DocketLens REST API — every endpoint, every schema, generated from the OpenAPI 3.1 spec.",
          url: "/docs/api-reference",
          datePublished: "2026-05-23",
          dateModified: "2026-05-25",
          authorName: "DocketLens",
          section: "Engineering",
        }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="eyebrow mb-3">Reference</p>
              <h1 className="display-1">
                {openapi.info.title}{" "}
                <span className="italic text-[color:var(--color-accent)]">
                  — interactive.
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
                Every endpoint, every parameter, every response — rendered
                directly from{" "}
                <Link
                  href={"/api/v1/openapi.json" as never}
                  className="underline underline-offset-2 hover:text-[color:var(--color-fg)]"
                  target="_blank"
                  rel="noopener"
                >
                  /api/v1/openapi.json
                </Link>
                . No JavaScript bundle, no Redoc, no Stoplight script.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">OpenAPI {openapi.openapi}</Badge>
              <Badge variant="outline">v{openapi.info.version}</Badge>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav aria-label="Endpoints">
                {orderedTags.map((tag) => (
                  <div key={tag} className="mb-5">
                    <p className="eyebrow mb-2">{tag}</p>
                    <ul className="flex flex-col gap-1">
                      {tagGroups.get(tag)!.map((f) => (
                        <li key={f.path + f.method}>
                          <a
                            href={`#${opId(f.path, f.method)}`}
                            className="group flex items-center gap-2 text-[12px] font-mono text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
                          >
                            <MethodPill m={f.method} />
                            <span className="truncate">{f.path}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            <div className="flex flex-col gap-6 min-w-0">
              {orderedTags.map((tag) => {
                const tagMeta = openapi.tags.find((t) => t.name === tag);
                return (
                  <div key={tag} className="flex flex-col gap-4">
                    <div>
                      <h2 className="font-serif text-3xl">{tag}</h2>
                      {tagMeta?.description && (
                        <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
                          {tagMeta.description}
                        </p>
                      )}
                    </div>
                    {tagGroups.get(tag)!.map((f) => (
                      <EndpointCard
                        key={f.path + f.method}
                        path={f.path}
                        method={f.method}
                        op={f.op}
                      />
                    ))}
                  </div>
                );
              })}

              <Card className="p-6 mt-2 bg-gradient-to-br from-[color:var(--color-accent-soft)]/20 to-transparent">
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  Want to codegen a client? Point{" "}
                  <a
                    href="https://github.com/openapi-ts/openapi-typescript"
                    target="_blank"
                    rel="noopener"
                    className="text-[color:var(--color-fg)] underline underline-offset-2 inline-flex items-center gap-1"
                  >
                    openapi-typescript <ArrowUpRight className="size-3" />
                  </a>{" "}
                  at <code className="font-mono">/api/v1/openapi.json</code>.
                  The spec is{" "}
                  <code className="font-mono">openapi: 3.1.0</code> — works
                  with most generators.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
