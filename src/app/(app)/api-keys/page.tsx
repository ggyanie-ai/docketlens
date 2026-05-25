"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  KeyRound,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Lock,
  X,
  AlertTriangle,
  Check,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

/* ============================================================================
 *  Settings → API keys
 *
 *  Local-first today: keys live in localStorage under `dl-api-keys-user` and
 *  the token is generated client-side via `crypto.getRandomValues`. The on-
 *  disk shape mirrors the `api_keys` Drizzle row so the Tuesday wire-up to
 *  Postgres is a marshalling step, not a code-shape change.
 *
 *  The one-time reveal lives in a modal-like overlay that only renders right
 *  after generation — the full token is never persisted client-side; only the
 *  prefix + last4 are.
 * ==========================================================================*/

const STORAGE_KEY = "dl-api-keys-user";

const SAMPLE_KEYS: KeyRow[] = [
  {
    id: "key_1",
    name: "Production",
    prefix: "dkl_live_",
    last4: "9k4Q",
    scopes: ["read:dockets", "read:watchlists", "write:watchlists"],
    lastUsed: "12 minutes ago",
    created: "2026-03-14",
    seed: true,
  },
  {
    id: "key_2",
    name: "Slack worker",
    prefix: "dkl_live_",
    last4: "x18A",
    scopes: ["read:dockets"],
    lastUsed: "2 hours ago",
    created: "2026-04-02",
    seed: true,
  },
];

interface KeyRow {
  id: string;
  name: string;
  prefix: string;
  last4: string;
  scopes: string[];
  lastUsed: string;
  created: string;
  /** Built-in demo key — not user-generated, can't be revoked client-side. */
  seed?: boolean;
}

const SCOPE_OPTIONS = [
  { key: "read:dockets", label: "Read dockets", desc: "List + fetch cached cases" },
  { key: "read:watchlists", label: "Read watchlists", desc: "List your watchlists + their matches" },
  { key: "write:watchlists", label: "Write watchlists", desc: "Create / update / delete watchlists" },
  { key: "read:alerts", label: "Read alerts", desc: "Recent deliveries + failed retries" },
];

function generateToken(): { token: string; prefix: string; last4: string } {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const body = btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const token = `dkl_live_${body}`;
  return { token, prefix: token.slice(0, 12), last4: token.slice(-4) };
}

function loadUserKeys(): KeyRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function persistUserKeys(rows: KeyRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // ignore
  }
}

export default function ApiKeysPage() {
  const searchParams = useSearchParams();
  const isEmpty = searchParams.get("empty") === "1";

  const [userKeys, setUserKeys] = useState<KeyRow[]>([]);
  const [reveal, setReveal] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftScopes, setDraftScopes] = useState<string[]>([
    "read:dockets",
    "read:watchlists",
  ]);
  const [showOnce, setShowOnce] = useState<{
    name: string;
    token: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isEmpty) setUserKeys(loadUserKeys());
  }, [isEmpty]);

  const keys = useMemo(
    () => (isEmpty ? [] : [...userKeys, ...SAMPLE_KEYS]),
    [userKeys, isEmpty]
  );

  // Empty-org preview: brand-new org has no keys yet. Render a focused
  // hero with a clear "Generate your first key" CTA + the security pitch.
  if (isEmpty && keys.length === 0) {
    return (
      <>
        <Topbar title="API keys" />
        <main id="main" className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
            <div className="flex justify-center mb-5">
              <span className="relative inline-flex">
                <span
                  aria-hidden
                  className="motion-safe:animate-ping motion-reduce:hidden absolute inset-0 inline-flex rounded-full bg-[color:var(--color-accent)] opacity-40"
                />
                <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-soft">
                  <KeyRound className="size-6" />
                </span>
              </span>
            </div>
            <p className="eyebrow mb-2">API keys · empty-org preview</p>
            <h1 className="display-2">No API keys yet.</h1>
            <p className="mt-5 text-base text-[color:var(--color-fg-muted)] leading-relaxed max-w-xl mx-auto">
              Generate one to call /api/v1/* from a CLI, mobile app, or
              webhook integration. We show the full token exactly once;
              after that we keep only a sha256 hash and the prefix.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={"/api-keys" as never}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="size-4 mr-1.5" />
                Generate your first key
              </Link>
              <Link
                href={"/docs/api-reference" as never}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-[color:var(--color-fg)] px-4 py-2 text-sm hover:border-[color:var(--color-border-strong)] transition-colors"
              >
                Read the API reference
              </Link>
            </div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-[color:var(--color-fg-subtle)]">
              <ShieldCheck className="size-3" />
              We never log the full token. One-time reveal only.
            </p>
          </div>
        </main>
      </>
    );
  }

  function toggleScope(s: string) {
    setDraftScopes((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
    );
  }

  function createKey(e: React.FormEvent) {
    e.preventDefault();
    const name = draftName.trim();
    if (!name) {
      toast.error("Name required", {
        description: "Give the key a label so you can find it later.",
      });
      return;
    }
    if (draftScopes.length === 0) {
      toast.error("Pick at least one scope", {
        description: "Empty scopes wouldn't let the key do anything useful.",
      });
      return;
    }

    const { token, prefix, last4 } = generateToken();
    const row: KeyRow = {
      id: `key_${Math.random().toString(36).slice(2, 10)}`,
      name,
      prefix,
      last4,
      scopes: draftScopes.slice(),
      lastUsed: "Never",
      created: new Date().toISOString().slice(0, 10),
    };
    setUserKeys((prev) => {
      const next = [row, ...prev];
      persistUserKeys(next);
      return next;
    });
    setShowOnce({ name, token });
    setCreating(false);
    setDraftName("");
    setDraftScopes(["read:dockets", "read:watchlists"]);
    setCopied(false);
  }

  function revoke(id: string) {
    setUserKeys((prev) => {
      const next = prev.filter((k) => k.id !== id);
      persistUserKeys(next);
      return next;
    });
    toast("Key revoked", {
      description: "Any code using it will immediately start getting 401s.",
    });
  }

  async function copyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("Token copied", {
        description: "Paste it into your env / secret manager now.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", {
        description: "Browser denied clipboard. Select + copy manually.",
      });
    }
  }

  return (
    <>
      <Topbar title="API keys" />
      <main id="main" className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-6">
          <Card className="p-6 flex items-start gap-4 bg-gradient-to-br from-[color:var(--color-accent-soft)]/30 to-transparent">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]">
              <Lock className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl tracking-tight">
                API access is a Team-plan feature
              </h2>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 max-w-xl leading-relaxed">
                The public DocketLens REST API gives you programmatic access to
                searches, watchlists, and matches. Use it in serverless
                functions, Slack workers, or your firm&apos;s intranet.
              </p>
            </div>
            <Button variant="accent">Upgrade to Team</Button>
          </Card>

          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-serif text-2xl tracking-tight">Keys</h3>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                Personal access tokens. Rotate them anytime; revoke
                immediately if a key leaks.
              </p>
            </div>
            {!creating && (
              <Button variant="accent" onClick={() => setCreating(true)}>
                <Plus className="size-4" />
                New key
              </Button>
            )}
          </div>

          {/* New-key form */}
          {creating && (
            <Card className="p-6 border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)]/15">
              <form onSubmit={createKey} className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium tracking-tight">
                    Create a new API key
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Cancel"
                    onClick={() => {
                      setCreating(false);
                      setDraftName("");
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-key-name"
                    className="text-xs font-medium text-[color:var(--color-fg-muted)]"
                  >
                    Name
                  </label>
                  <Input
                    id="new-key-name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="e.g. Slack worker · staging"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">
                    Scopes
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {SCOPE_OPTIONS.map((s) => {
                      const active = draftScopes.includes(s.key);
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => toggleScope(s.key)}
                          aria-pressed={active}
                          className={cn(
                            "text-left rounded-[var(--radius-md)] border p-3 transition-colors",
                            active
                              ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]/40"
                              : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-[12px] text-[color:var(--color-fg)]">
                              {s.key}
                            </p>
                            {active && (
                              <Check className="size-3.5 text-[color:var(--color-accent)]" />
                            )}
                          </div>
                          <p className="text-[11px] text-[color:var(--color-fg-muted)] mt-1 leading-relaxed">
                            {s.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-[color:var(--color-fg-muted)] leading-relaxed">
                  <ShieldCheck className="size-3.5 mt-0.5 text-[color:var(--color-accent)] shrink-0" />
                  <span>
                    The full token is shown ONCE on the next screen. We store
                    only the hashed value — there&apos;s no recovery if you
                    lose it. Rotate freely.
                  </span>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreating(false);
                      setDraftName("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent">
                    <KeyRound className="size-4" />
                    Generate key
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Existing keys list */}
          {keys.length === 0 ? (
            <Empty
              icon={KeyRound}
              title="No keys yet"
              body="Create your first key to start using the REST API."
            />
          ) : (
            <Card className="overflow-hidden">
              <ul>
                {keys.map((k) => (
                  <li
                    key={k.id}
                    className="border-b border-[color:var(--color-border)] last:border-b-0 p-5"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <KeyRound className="size-4 text-[color:var(--color-fg-muted)]" />
                          <p className="text-sm font-medium">{k.name}</p>
                          <Badge variant="success">active</Badge>
                          {k.seed && (
                            <Badge variant="outline" className="text-[10px]">
                              demo
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            readOnly
                            value={
                              reveal === k.id
                                ? `${k.prefix}d4Hx7nZ2pQwxMaW8N2g4${k.last4}`
                                : `${k.prefix}••••••••••••••••••${k.last4}`
                            }
                            className="font-mono text-xs max-w-[420px]"
                            aria-label={`API key ${k.name} (masked)`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={
                              reveal === k.id
                                ? "Hide masked preview"
                                : "Reveal masked preview"
                            }
                            onClick={() =>
                              setReveal((r) => (r === k.id ? null : k.id))
                            }
                          >
                            {reveal === k.id ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Copy preview"
                            onClick={() =>
                              copyToken(
                                `${k.prefix}••••••••••••••••••${k.last4}`
                              )
                            }
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {k.scopes.map((s) => (
                            <Badge key={s} variant="outline">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-xs text-[color:var(--color-fg-muted)] font-mono">
                        <p>Last used {k.lastUsed}</p>
                        <p className="mt-0.5">Created {k.created}</p>
                        {!k.seed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[color:var(--color-danger)] hover:text-[color:var(--color-danger)] mt-2"
                            onClick={() => revoke(k.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>

      {/* One-time reveal overlay */}
      {showOnce && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New API key — copy now"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
          onClick={() => setShowOnce(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl"
          >
            <Card className="p-7 shadow-soft">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-warning)]/15 text-[color:var(--color-warning)]">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl tracking-tight">
                    Copy your new key now
                  </h3>
                  <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 leading-relaxed">
                    This is the only time we&apos;ll show you{" "}
                    <span className="font-medium text-[color:var(--color-fg)]">
                      {showOnce.name}
                    </span>{" "}
                    in full. After you dismiss this screen, we keep only the
                    last four characters.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => setShowOnce(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] p-3 font-mono text-[13px] leading-relaxed break-all select-all">
                {showOnce.token}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-[11px] font-mono text-[color:var(--color-fg-subtle)]">
                  {showOnce.token.length} chars · sha256-hashed at rest
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowOnce(null)}
                  >
                    I&apos;ve saved it
                  </Button>
                  <Button
                    variant="accent"
                    onClick={() => copyToken(showOnce.token)}
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy token
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
