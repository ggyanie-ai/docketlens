"use client";

import { useState } from "react";
import { Check, X, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ============================================================================
 *  Webhook signature verifier — runs entirely in the browser.
 *
 *  Computes HMAC-SHA256(raw_body, secret) via Web Crypto and compares against
 *  a pasted `X-DocketLens-Signature` header (format: `sha256=<hex>`). The
 *  secret never leaves the page — there is no fetch, no logging, no
 *  analytics on this surface.
 *
 *  Constant-time compare client-side to mirror the server-side discipline
 *  documented at /settings → Webhook signing.
 * ==========================================================================*/

const SAMPLE = {
  secret: "whsec_demo_F2qHsKjr8VgZTeBPmL3DnRy7XwK9Q1Zp",
  payload: `{"event":"alert.delivered","delivery_id":"adlv_3kQ9pR2Lm","rule_id":"alr_F3kQ9pR2Lm","subject":"3 new filings — Acme Corp filings","text":"…","ts":"2026-05-24T07:00:00Z"}`,
};

async function computeSignature(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const bytes = new Uint8Array(mac);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return "sha256=" + hex;
}

/** Constant-time string compare, browser-safe. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

interface Result {
  computed: string;
  matches: boolean;
}

export function VerifyWebhookForm() {
  const [secret, setSecret] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onVerify() {
    setError(null);
    setResult(null);
    if (!secret.trim()) return setError("Paste your webhook signing secret.");
    if (!payload) return setError("Paste the raw request body.");
    if (!signature.trim()) return setError("Paste the X-DocketLens-Signature header value.");
    setPending(true);
    try {
      const computed = await computeSignature(secret, payload);
      // Strip any leading whitespace + accept signature with or without the
      // `X-DocketLens-Signature:` prefix.
      const normalized = signature
        .replace(/^X-DocketLens-Signature:\s*/i, "")
        .trim();
      setResult({ computed, matches: safeEqual(computed, normalized) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function onLoadSample() {
    setError(null);
    setSecret(SAMPLE.secret);
    setPayload(SAMPLE.payload);
    const sig = await computeSignature(SAMPLE.secret, SAMPLE.payload);
    setSignature(sig);
    setResult(null);
  }

  function onReset() {
    setSecret("");
    setPayload("");
    setSignature("");
    setResult(null);
    setError(null);
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-2">Tools</p>
          <h2 className="font-serif text-2xl tracking-tight">
            Verify webhook signature
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed max-w-2xl">
            Paste your secret, the raw request body, and the{" "}
            <code className="font-mono text-[12px]">X-DocketLens-Signature</code>{" "}
            header — we&apos;ll compute the expected HMAC-SHA256 and compare,
            constant-time. Everything runs in your browser. The secret never
            leaves this page.
          </p>
        </div>
        <Badge variant="outline" className="inline-flex items-center gap-1">
          <ShieldCheck className="size-3" />
          Client-side
        </Badge>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-1.5">
          <label
            htmlFor="vw-secret"
            className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]"
          >
            Signing secret
          </label>
          <input
            id="vw-secret"
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="whsec_…"
            className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 font-mono text-sm text-[color:var(--color-fg)] focus:outline-none focus:border-[color:var(--color-accent)]"
          />
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="vw-payload"
            className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]"
          >
            Raw request body
          </label>
          <textarea
            id="vw-payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"event":"alert.delivered",…}'
            rows={6}
            className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 font-mono text-[12px] leading-relaxed text-[color:var(--color-fg)] focus:outline-none focus:border-[color:var(--color-accent)]"
          />
          <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
            Use the request body byte-for-byte. Even one trailing newline
            difference will break the signature.
          </p>
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="vw-sig"
            className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-fg-subtle)]"
          >
            X-DocketLens-Signature header
          </label>
          <input
            id="vw-sig"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="sha256=…"
            className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 font-mono text-sm text-[color:var(--color-fg)] focus:outline-none focus:border-[color:var(--color-accent)]"
          />
          <p className="text-[11px] text-[color:var(--color-fg-subtle)]">
            Paste the full header value. Leading{" "}
            <code className="font-mono">X-DocketLens-Signature:</code> is
            stripped automatically.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Button onClick={onVerify} disabled={pending}>
            {pending ? "Verifying…" : "Verify signature"}
          </Button>
          <Button variant="outline" onClick={onLoadSample}>
            <Sparkles className="size-3" />
            Load sample
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
        </div>

        {error && (
          <div className="rounded-[var(--radius-md)] border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm text-[color:var(--color-fg)]">
            {error}
          </div>
        )}

        {result && (
          <div
            className={
              "rounded-[var(--radius-md)] border p-4 " +
              (result.matches
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-rose-500/40 bg-rose-500/5")
            }
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              {result.matches ? (
                <>
                  <Check className="size-4 text-emerald-500" />
                  <p className="font-medium">Signature matches.</p>
                </>
              ) : (
                <>
                  <X className="size-4 text-rose-500" />
                  <p className="font-medium">Signature does not match.</p>
                </>
              )}
            </div>
            <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-[12px] font-mono">
              <dt className="text-[color:var(--color-fg-subtle)]">Expected</dt>
              <dd className="break-all text-[color:var(--color-fg)]">
                {result.computed}
              </dd>
              <dt className="text-[color:var(--color-fg-subtle)]">Received</dt>
              <dd className="break-all text-[color:var(--color-fg)]">
                {signature
                  .replace(/^X-DocketLens-Signature:\s*/i, "")
                  .trim()}
              </dd>
            </dl>
            {!result.matches && (
              <p className="mt-3 text-[12px] text-[color:var(--color-fg-muted)] leading-relaxed">
                Most common cause: the body was re-serialised on the way to
                the verifier (e.g. a framework that parsed JSON and
                stringified it again). Sign the raw bytes before any
                middleware touches them.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
