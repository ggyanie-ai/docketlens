"use client";

import { useState } from "react";
import { ShieldCheck, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ============================================================================
 *  WebhookSigningCard
 *
 *  Drop-in card for Settings → Integrations. Documents the
 *  X-DocketLens-Signature header (HMAC-SHA256 of the raw request body),
 *  with copy-to-clipboard code samples in Node and Python.
 *
 *  Reads as both reference + onboarding — most readers want the snippet, not
 *  a multi-page guide.
 * ==========================================================================*/

const NODE_SAMPLE = `// pnpm add hono           (or your framework of choice)
// Node 18+ — uses globalThis.crypto

import { Hono } from "hono";
import { timingSafeEqual } from "node:crypto";

const app = new Hono();

app.post("/webhooks/docketlens", async (c) => {
  const signature = c.req.header("X-DocketLens-Signature") ?? "";
  const raw = await c.req.text();

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.DOCKETLENS_WEBHOOK_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(raw),
  );
  const expected = "sha256=" + Buffer.from(mac).toString("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return c.text("invalid signature", 401);
  }

  const event = JSON.parse(raw); // { subject, text, delivery_id, rule_id }
  // queue, ack quickly, do work async
  return c.text("ok", 200);
});

export default app;`;

const PYTHON_SAMPLE = `# pip install fastapi uvicorn
# python 3.11+

import hashlib
import hmac
import os
from fastapi import FastAPI, Header, HTTPException, Request

app = FastAPI()
SECRET = os.environ["DOCKETLENS_WEBHOOK_SECRET"].encode()

@app.post("/webhooks/docketlens")
async def receive(
    request: Request,
    x_docketlens_signature: str = Header(default=""),
):
    raw = await request.body()
    expected = "sha256=" + hmac.new(SECRET, raw, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, x_docketlens_signature):
        raise HTTPException(status_code=401, detail="invalid signature")

    event = await request.json()  # {subject, text, delivery_id, rule_id}
    # queue, ack quickly, do work async
    return {"ok": True}`;

const GO_SAMPLE = `// go 1.22+
// no third-party deps required

package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"os"
)

var secret = []byte(os.Getenv("DOCKETLENS_WEBHOOK_SECRET"))

func handle(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(r.Body)

	mac := hmac.New(sha256.New, secret)
	mac.Write(body)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))

	got := r.Header.Get("X-DocketLens-Signature")
	if !hmac.Equal([]byte(expected), []byte(got)) {
		http.Error(w, "invalid signature", http.StatusUnauthorized)
		return
	}

	// body is the verified JSON payload — decode + ack
	w.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("/webhooks/docketlens", handle)
	http.ListenAndServe(":8080", nil)
}`;

type Lang = "node" | "python" | "go";

const SAMPLES: Record<Lang, { label: string; ext: string; code: string }> = {
  node:   { label: "Node.js", ext: "ts",  code: NODE_SAMPLE },
  python: { label: "Python",  ext: "py",  code: PYTHON_SAMPLE },
  go:     { label: "Go",      ext: "go",  code: GO_SAMPLE },
};

export function WebhookSigningCard() {
  const [tab, setTab] = useState<Lang>("node");
  const [copied, setCopied] = useState(false);

  async function copyActive() {
    try {
      await navigator.clipboard.writeText(SAMPLES[tab].code);
      setCopied(true);
      toast.success(`${SAMPLES[tab].label} sample copied`, {
        description: `${SAMPLES[tab].code.length} chars on your clipboard.`,
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy", {
        description: "Browser denied clipboard. Select + copy manually.",
      });
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-5 flex-wrap">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)]">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-xl tracking-tight">
            Verify our webhooks
          </h3>
          <p className="text-sm text-[color:var(--color-fg-muted)] mt-1 leading-relaxed max-w-2xl">
            Every webhook DocketLens sends carries an{" "}
            <code className="font-mono text-xs">X-DocketLens-Signature</code>{" "}
            header — an HMAC-SHA256 of the raw request body, hex-encoded,
            prefixed with{" "}
            <code className="font-mono text-xs">sha256=</code>. Reject any
            request whose computed signature doesn&apos;t match, in constant
            time.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          HMAC-SHA256
        </Badge>
      </div>

      {/* Header reference */}
      <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/50 p-4 mb-5">
        <p className="eyebrow mb-2">Request headers</p>
        <pre className="text-[12px] font-mono leading-relaxed text-[color:var(--color-fg)] whitespace-pre">
{`POST /your-endpoint HTTP/1.1
Content-Type: application/json
X-DocketLens-Signature: sha256=4f2a...c91d
X-DocketLens-Delivery: del_5p9_2026-05-23T19:42:17Z
X-DocketLens-Event: alert.match
User-Agent: DocketLens-Webhook/1.0`}
        </pre>
      </div>

      {/* Sample tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Lang)}>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <TabsList>
            {(Object.keys(SAMPLES) as Lang[]).map((k) => (
              <TabsTrigger key={k} value={k}>
                {SAMPLES[k].label}
              </TabsTrigger>
            ))}
          </TabsList>
          <button
            type="button"
            onClick={copyActive}
            aria-label={`Copy ${SAMPLES[tab].label} sample`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-xs transition-colors",
              copied
                ? "border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]"
                : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] hover:border-[color:var(--color-accent)]"
            )}
          >
            {copied ? (
              <>
                <Check className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy {SAMPLES[tab].label}
              </>
            )}
          </button>
        </div>

        {(Object.keys(SAMPLES) as Lang[]).map((k) => (
          <TabsContent key={k} value={k}>
            <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-2">
                <p className="font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                  webhook.{SAMPLES[k].ext}
                </p>
                <span className="font-mono text-[10.5px] text-[color:var(--color-fg-subtle)]">
                  {SAMPLES[k].code.split("\n").length} lines
                </span>
              </div>
              <pre className="text-[12.5px] font-mono leading-[1.6] text-[color:var(--color-fg)] p-4 overflow-x-auto">
                {SAMPLES[k].code}
              </pre>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-5 grid sm:grid-cols-3 gap-3 text-[11.5px] text-[color:var(--color-fg-muted)] leading-relaxed">
        <Note title="Use constant-time compare">
          <code className="font-mono">timingSafeEqual</code> /{" "}
          <code className="font-mono">hmac.compare_digest</code> /{" "}
          <code className="font-mono">hmac.Equal</code>. Plain{" "}
          <code className="font-mono">==</code> leaks timing.
        </Note>
        <Note title="Ack fast">
          Return 2xx within 10 seconds — queue any real work. We retry
          non-2xx with exponential backoff, 6 attempts over 24h.
        </Note>
        <Note title="Replay protection">
          The{" "}
          <code className="font-mono">X-DocketLens-Delivery</code> header is
          unique per delivery. Persist + dedupe in your handler.
        </Note>
      </div>

      <div className="mt-5 pt-4 border-t border-[color:var(--color-border)] flex items-center justify-between text-xs flex-wrap gap-2">
        <p className="text-[color:var(--color-fg-muted)]">
          Webhook secret lives under{" "}
          <Link
            href={"/alerts" as never}
            className="underline underline-offset-2 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)]"
          >
            Alerts → channel detail
          </Link>
          .
        </p>
        <Link
          href={"/docs/api" as never}
          className="inline-flex items-center gap-1 font-mono text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-accent)] transition-colors"
        >
          Full API reference
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </Card>
  );
}

function Note({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-subtle)]/40 p-3">
      <p className="eyebrow mb-1.5">{title}</p>
      <p className="text-[color:var(--color-fg-muted)] leading-relaxed">
        {children}
      </p>
    </div>
  );
}
