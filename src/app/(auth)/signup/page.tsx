"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    toast.success("Account created", {
      description: "Magic link sent to " + email,
    });
  }

  return (
    <div>
      <h1 className="display-2">Get early access.</h1>
      <p className="mt-3 text-base text-[color:var(--color-fg-muted)]">
        Free tier, no credit card. Five watchlists, daily digest, full
        one-line AI summaries.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <Field label="Your name">
          <Input
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="h-11"
          />
        </Field>
        <Field label="Work email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.com"
            className="h-11"
          />
        </Field>
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={pending}
        >
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-xs text-[color:var(--color-fg-muted)] leading-relaxed">
        By signing up, you agree to our{" "}
        <Link href={"/legal/terms" as never} className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href={"/legal/privacy" as never} className="underline underline-offset-2">
          Privacy Policy
        </Link>
        . DocketLens uses public docket data and does not provide legal advice.
      </p>

      <p className="mt-8 text-xs text-[color:var(--color-fg-muted)]">
        Already have an account?{" "}
        <Link
          href={"/login" as never}
          className="text-[color:var(--color-fg)] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">{label}</label>
      {children}
    </div>
  );
}
