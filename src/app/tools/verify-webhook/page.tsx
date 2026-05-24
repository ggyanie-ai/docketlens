import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { VerifyWebhookForm } from "@/components/app/verify-webhook-form";

export const metadata = {
  title: "Verify webhook signature",
  description:
    "Paste a payload and X-DocketLens-Signature header — we'll compute the expected HMAC and tell you whether it matches. Runs entirely in your browser.",
};

export default function VerifyWebhookPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-12">
          <p className="eyebrow mb-3">Tools</p>
          <h1 className="display-1">
            Verify a webhook{" "}
            <span className="italic text-[color:var(--color-accent)]">
              signature.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[color:var(--color-fg-muted)] leading-relaxed">
            When your endpoint receives a DocketLens webhook and rejects it as
            invalid, this page tells you exactly why. Paste the body and the{" "}
            <code className="font-mono">X-DocketLens-Signature</code> header,
            and we&apos;ll compute the expected HMAC alongside yours.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-12">
          <VerifyWebhookForm />
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Card className="p-6 bg-gradient-to-br from-[color:var(--color-accent-soft)]/20 to-transparent">
            <h2 className="font-serif text-xl">Privacy</h2>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-fg-muted)] leading-relaxed">
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  Your secret never leaves your browser.
                </strong>{" "}
                This page does not POST anything anywhere — the HMAC is
                computed via the browser&apos;s Web Crypto API.
              </li>
              <li>
                <strong className="text-[color:var(--color-fg)]">
                  No analytics on this page.
                </strong>{" "}
                We don&apos;t want to know that you&apos;re debugging.
              </li>
              <li>
                Want to reproduce the verification in code? See the four-language
                examples in{" "}
                <Link
                  href={"/settings" as never}
                  className="text-[color:var(--color-fg)] underline underline-offset-2 inline-flex items-center gap-1"
                >
                  Settings → Webhook signing
                  <ArrowUpRight className="size-3" />
                </Link>
                .
              </li>
            </ul>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
