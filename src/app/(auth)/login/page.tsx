"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    // TODO: wire to better-auth signIn.magicLink
    await new Promise((r) => setTimeout(r, 700));
    setPending(false);
    toast.success("Magic link sent", {
      description: "Check your inbox at " + email,
    });
  }

  return (
    <div>
      <h1 className="display-2">Welcome back.</h1>
      <p className="mt-3 text-base text-[color:var(--color-fg-muted)]">
        Enter your email and we&apos;ll send you a magic link. No password to
        forget.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <label className="text-xs font-medium text-[color:var(--color-fg-muted)]">
          Email address
        </label>
        <Input
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@firm.com"
          className="h-11 text-[15px]"
        />
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={pending}
        >
          {pending ? "Sending…" : "Send magic link"}
        </Button>
      </form>

      <div className="my-7 relative">
        <span className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-[color:var(--color-border)]" />
        </span>
        <span className="relative bg-[color:var(--color-bg)] px-3 text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg-subtle)] flex justify-center">
          <span className="bg-[color:var(--color-bg)] px-3">or</span>
        </span>
      </div>

      <Button variant="outline" size="lg" className="w-full">
        <GoogleIcon /> Continue with Google
      </Button>

      <p className="mt-8 text-xs text-[color:var(--color-fg-muted)]">
        New here?{" "}
        <Link
          href={"/signup" as never}
          className="text-[color:var(--color-fg)] underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
        .
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}
