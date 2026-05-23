"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Plus, Copy, Eye, EyeOff, Lock } from "lucide-react";
import { Empty } from "@/components/ui/empty";

const SAMPLE_KEYS = [
  {
    id: "key_1",
    name: "Production",
    prefix: "dkl_live_",
    last4: "9k4Q",
    scopes: ["read:dockets", "read:watchlists", "write:watchlists"],
    lastUsed: "12 minutes ago",
    created: "2026-03-14",
  },
  {
    id: "key_2",
    name: "Slack worker",
    prefix: "dkl_live_",
    last4: "x18A",
    scopes: ["read:dockets"],
    lastUsed: "2 hours ago",
    created: "2026-04-02",
  },
];

export default function ApiKeysPage() {
  const [reveal, setReveal] = useState<string | null>(null);

  return (
    <>
      <Topbar title="API keys" />
      <main className="flex-1 overflow-y-auto">
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
                searches, watchlists, and matches. Use it in serverless functions,
                Slack workers, or your firm's intranet.
              </p>
            </div>
            <Button variant="accent">Upgrade to Team</Button>
          </Card>

          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-serif text-2xl tracking-tight">Keys</h3>
              <p className="text-sm text-[color:var(--color-fg-muted)] mt-1">
                Personal access tokens. Rotate them anytime; revoke
                immediately if a key leaks.
              </p>
            </div>
            <Button variant="accent">
              <Plus className="size-4" />
              New key
            </Button>
          </div>

          {SAMPLE_KEYS.length === 0 ? (
            <Empty
              icon={KeyRound}
              title="No keys yet"
              body="Create your first key to start using the REST API."
            />
          ) : (
            <Card className="overflow-hidden">
              <ul>
                {SAMPLE_KEYS.map((k) => (
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
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            readOnly
                            value={
                              reveal === k.id
                                ? `${k.prefix}d4Hx7nZ2pQwxMaW8N2g4sLm${k.last4}`
                                : `${k.prefix}••••••••••••••••••${k.last4}`
                            }
                            className="font-mono text-xs max-w-[420px]"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={reveal === k.id ? "Hide" : "Reveal"}
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
                          <Button variant="ghost" size="icon" aria-label="Copy">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[color:var(--color-danger)] mt-2"
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
